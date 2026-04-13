import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { registry, PREFLIGHT_THRESHOLD, type PredictorContext } from "./lib/predictors";

// ── Preflight Gate: run all predictors, write predictions, decide ───────────
// Formerly a single voice-fit check. Now an orchestrator that runs the
// registered predictor chain, writes one `predictions` row per signal, and
// uses the aggregate + any blocking failures to route the branch to
// `in_review` or `revision_requested`.

export const reviewDraft = internalAction({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const branch = await ctx.runQuery(api.branches.get, { id: args.branchId });
    if (!branch) throw new Error(`Branch ${args.branchId} not found`);
    if (!branch.currentDraftId) throw new Error("No draft on branch");

    const draft = await ctx.runQuery(api.drafts.get, { id: branch.currentDraftId });
    if (!draft) throw new Error("Draft not found");

    const seed = await ctx.runQuery(api.seeds.get, { id: branch.seedId });
    if (!seed) throw new Error("Seed not found");

    const brand = await ctx.runQuery(api.brands.get, { id: branch.brandId });
    if (!brand) throw new Error("Brand not found");

    // Prefer agent-synthesized primary voice doc; fall back to brand.voiceTraining.
    const trainingDocs = await ctx.runQuery(api.training.listByLayer, {
      brandId: branch.brandId,
      layer: "voice_general",
    });
    const voiceTraining = trainingDocs
      .filter((t: any) => t.isPrimary === true)
      .map((t: any) => t.content)
      .join("\n\n");

    const input: PredictorContext = {
      branchId: args.branchId,
      draftId: draft._id,
      brandId: branch.brandId,
      format: branch.format,
      body: draft.body,
      seedTitle: seed.title,
      seedDescription: seed.description,
      voiceTraining: voiceTraining || brand.voiceTraining,
      wordsToAvoid: brand.wordsToAvoid ?? [],
      wordsToUse: brand.wordsToUse ?? [],
      apiKey,
    };

    const applicable = registry.filter(
      (p) => p.formats === "*" || p.formats.includes(branch.format),
    );

    // Run predictors concurrently. One failure does not abort the gate — we
    // still want other signals recorded so calibration data keeps accumulating.
    const results = await Promise.all(
      applicable.map(async (p) => {
        try {
          const r = await p.run(input);
          return { ok: true as const, name: p.name, blocking: p.blocking, result: r };
        } catch (err) {
          console.error(`Predictor ${p.name} error:`, err);
          return {
            ok: false as const,
            name: p.name,
            blocking: p.blocking,
            err: err instanceof Error ? err.message : String(err),
          };
        }
      }),
    );

    // Persist each successful prediction so we can calibrate it later.
    for (const res of results) {
      if (res.ok) {
        await ctx.runMutation(internal.predictions.record, {
          brandId: branch.brandId,
          branchId: args.branchId,
          draftId: draft._id,
          signal: res.result.signal,
          version: res.result.version,
          score: res.result.score,
          notes: res.result.notes,
          details: res.result.details as any,
          costUsd: res.result.costUsd,
          latencyMs: res.result.latencyMs,
        });
      }
    }

    const scored = results.filter(
      (r): r is Extract<typeof r, { ok: true }> => r.ok,
    );

    // Aggregate: mean of normalized scores. Keep simple until calibration
    // tells us how to weight.
    const aggregate =
      scored.length === 0
        ? 0
        : scored.reduce((s, r) => s + r.result.score, 0) / scored.length;

    const hardFail = scored.some((r) => r.result.hardFail);
    const blockingFail =
      results.some((r) => r.blocking && (!r.ok || !r.result.passed));
    const passed = !hardFail && !blockingFail && aggregate >= PREFLIGHT_THRESHOLD;

    const preflightScores: Record<string, number> = {};
    for (const r of scored) preflightScores[r.result.signal] = r.result.score;

    const notes =
      scored
        .filter((r) => r.result.notes)
        .map((r) => `${r.result.signal}(${r.result.score.toFixed(2)}): ${r.result.notes}`)
        .join(" | ") ||
      results
        .filter((r) => !r.ok)
        .map((r) => `${r.name}: ERROR ${r.err}`)
        .join(" | ") ||
      "No predictor notes.";

    await ctx.runMutation(internal.qualityGate.applyReviewResult, {
      branchId: args.branchId,
      score: Math.round(aggregate * 10), // retain 1-10 legacy scale for qualityScore
      preflightScores,
      notes,
      passed,
    });
  },
});

// ── Apply review result: update branch status + preflight snapshot ──────────

export const applyReviewResult = internalMutation({
  args: {
    branchId: v.id("branches"),
    score: v.number(),
    preflightScores: v.any(),
    notes: v.string(),
    passed: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.passed) {
      await ctx.db.patch(args.branchId, {
        status: "in_review",
        qualityScore: args.score,
        preflightScores: args.preflightScores,
        preflightPassedAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.branchId, {
        status: "revision_requested",
        qualityScore: args.score,
        preflightScores: args.preflightScores,
        updatedAt: Date.now(),
      });

      await ctx.db.insert("comments", {
        targetType: "branch",
        targetId: args.branchId,
        authoredBy: "agent",
        body: `Preflight failed (aggregate ${args.score}/10): ${args.notes}`,
        isQuickFeedback: false,
        createdAt: Date.now(),
      });
    }
  },
});
