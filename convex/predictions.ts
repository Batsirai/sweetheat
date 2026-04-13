import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

// ── Predictions: pre-publish signals ────────────────────────────────────────
// One row per predictor run per draft. Written by the qualityGate orchestrator
// so we have a history of every signal that has ever fired — not just the
// current aggregate. That history is what makes calibration possible.

export const record = internalMutation({
  args: {
    brandId: v.id("brands"),
    branchId: v.id("branches"),
    draftId: v.optional(v.id("drafts")),
    signal: v.string(),
    version: v.string(),
    score: v.number(),
    details: v.optional(v.any()),
    notes: v.optional(v.string()),
    costUsd: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("predictions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// All predictions for a branch (shows signal breakdown in the UI review pane).
export const listForBranch = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("predictions")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .order("desc")
      .collect();
  },
});

// Latest score per signal for a branch (for compact display).
export const latestPerSignal = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("predictions")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .order("desc")
      .collect();
    const seen = new Set<string>();
    const latest: typeof rows = [];
    for (const r of rows) {
      if (seen.has(r.signal)) continue;
      seen.add(r.signal);
      latest.push(r);
    }
    return latest;
  },
});

// ── Calibration: predicted vs observed ──────────────────────────────────────
// For each published branch in the window, join the predictor scores with the
// contentId row (which accumulates observed metrics). Returns a flat list so a
// spreadsheet / notebook / follow-up query can compute correlations.
//
// First principle: the number from any single predictor means nothing on its
// own. The signal you care about is its correlation with downstream outcomes,
// brand-by-brand and format-by-format.

export const calibration = query({
  args: {
    brandId: v.id("brands"),
    signal: v.optional(v.string()),
    sinceMs: v.optional(v.number()), // default: last 30 days
  },
  handler: async (ctx, args) => {
    const since = args.sinceMs ?? Date.now() - 30 * 24 * 60 * 60 * 1000;

    const predictions = args.signal
      ? await ctx.db
          .query("predictions")
          .withIndex("by_brand_signal", (q) =>
            q.eq("brandId", args.brandId).eq("signal", args.signal!),
          )
          .collect()
      : await ctx.db
          .query("predictions")
          .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
          .collect();

    const recent = predictions.filter((p) => p.createdAt >= since);

    // Return raw joinable rows. The caller (dashboard, notebook) computes
    // correlation by joining `contentIdRef` against performanceSnapshots
    // metrics or abTests.metricsA/B for the same window. Keeping this query
    // cheap and generic avoids coupling to one metrics source.
    const rows = await Promise.all(
      recent.map(async (p) => {
        const branch = await ctx.db.get(p.branchId);
        if (!branch || branch.status !== "published") return null;

        return {
          predictionId: p._id,
          branchId: p.branchId,
          signal: p.signal,
          version: p.version,
          predictedScore: p.score,
          predictedAt: p.createdAt,
          publishedAt: branch.publishedAt,
          format: branch.format,
          contentIdRef: branch.contentIdRef ?? null,
        };
      }),
    );

    return rows.filter((r): r is NonNullable<typeof r> => r !== null);
  },
});
