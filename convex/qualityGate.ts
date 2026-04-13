import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { callClaude } from "./lib/callClaude";

const HAIKU_MODEL = "claude-3-5-haiku-20241022";
const QUALITY_THRESHOLD = 7;

// ── Quality Gate: Auto-review draft before human review ─────────────────────
// Called after saveDraftInternal. Uses a cheap model to score the draft
// against brand voice, wordsToAvoid/Use, hook strength, CTA, and tone.

export const reviewDraft = internalAction({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    // Load branch
    const branch = await ctx.runQuery(api.branches.get, { id: args.branchId });
    if (!branch) throw new Error(`Branch ${args.branchId} not found`);
    if (!branch.currentDraftId) throw new Error("No draft on branch");

    // Load draft body
    const draft = await ctx.runQuery(api.drafts.get, { id: branch.currentDraftId });
    if (!draft) throw new Error("Draft not found");

    // Load seed
    const seed = await ctx.runQuery(api.seeds.get, { id: branch.seedId });
    if (!seed) throw new Error("Seed not found");

    // Load brand (with voice training)
    const brand = await ctx.runQuery(api.brands.get, { id: branch.brandId });
    if (!brand) throw new Error("Brand not found");

    // Load primary voice training docs
    const trainingDocs = await ctx.runQuery(api.training.listByLayer, {
      brandId: branch.brandId,
      layer: "voice_general",
    });
    const voiceTraining = trainingDocs
      .filter((t: any) => t.isPrimary === true)
      .map((t: any) => t.content)
      .join("\n\n");

    const effectiveVoice = voiceTraining || brand.voiceTraining;

    const systemPrompt = `You are a content quality reviewer for the brand "${brand.name}".
You review draft content against brand standards and provide a structured quality assessment.
Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.`;

    const userPrompt = `Review this ${branch.format} draft against the brand standards below.

BRAND VOICE TRAINING:
${effectiveVoice}

WORDS TO AVOID (auto-fail if any appear): ${brand.wordsToAvoid.join(", ") || "none"}
WORDS TO USE (bonus if included): ${brand.wordsToUse.join(", ") || "none"}

SEED TITLE: ${seed.title}
SEED DESCRIPTION: ${seed.description}

DRAFT CONTENT:
${draft.body.slice(0, 3000)}

Evaluate and return JSON:
{
  "score": <1-10>,
  "avoidedWordsFound": [<any words from wordsToAvoid found in draft>],
  "usedWordsFound": [<any words from wordsToUse found in draft>],
  "hookAssessment": "<one sentence on first-line strength>",
  "toneMatch": "<one sentence on voice alignment>",
  "ctaPresent": <true|false>,
  "notes": "<2-3 sentence summary of key issues or strengths>"
}`;

    try {
      const raw = await callClaude(apiKey, systemPrompt, userPrompt, 500, HAIKU_MODEL);

      // Parse the JSON response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Quality gate: could not parse JSON from response:", raw);
        // Fail-safe: send to human review
        await ctx.runMutation(internal.qualityGate.applyReviewResult, {
          branchId: args.branchId,
          score: 0,
          notes: "Quality gate could not parse review. Sending to human review.",
          passed: false,
        });
        return;
      }

      const review = JSON.parse(jsonMatch[0]);
      const score = typeof review.score === "number" ? review.score : 0;

      // Auto-fail if avoided words found
      const hasAvoidedWords =
        Array.isArray(review.avoidedWordsFound) && review.avoidedWordsFound.length > 0;
      const effectiveScore = hasAvoidedWords ? Math.min(score, QUALITY_THRESHOLD - 1) : score;

      const notes = [
        review.notes || "",
        review.hookAssessment ? `Hook: ${review.hookAssessment}` : "",
        review.toneMatch ? `Tone: ${review.toneMatch}` : "",
        review.ctaPresent === false ? "Missing CTA." : "",
        hasAvoidedWords
          ? `AUTO-FAIL: Found avoided words: ${review.avoidedWordsFound.join(", ")}`
          : "",
        Array.isArray(review.usedWordsFound) && review.usedWordsFound.length > 0
          ? `Used brand words: ${review.usedWordsFound.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");

      await ctx.runMutation(internal.qualityGate.applyReviewResult, {
        branchId: args.branchId,
        score: effectiveScore,
        notes,
        passed: effectiveScore >= QUALITY_THRESHOLD,
      });
    } catch (err) {
      console.error("Quality gate error:", err);
      // On failure, still send to human review so the pipeline doesn't stall
      await ctx.runMutation(internal.qualityGate.applyReviewResult, {
        branchId: args.branchId,
        score: 0,
        notes: `Quality gate error: ${err}. Sending to human review.`,
        passed: false,
      });
    }
  },
});

// ── Apply review result: update branch status + quality score ────────────────

export const applyReviewResult = internalMutation({
  args: {
    branchId: v.id("branches"),
    score: v.number(),
    notes: v.string(),
    passed: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.passed) {
      // Quality check passed — ready for human review
      await ctx.db.patch(args.branchId, {
        status: "in_review",
        qualityScore: args.score,
        updatedAt: Date.now(),
      });
    } else {
      // Quality check failed — request revision
      await ctx.db.patch(args.branchId, {
        status: "revision_requested",
        qualityScore: args.score,
        updatedAt: Date.now(),
      });

      // Add a comment with the review notes
      await ctx.db.insert("comments", {
        targetType: "branch",
        targetId: args.branchId,
        authoredBy: "agent",
        body: `Quality Gate (score: ${args.score}/10): ${args.notes}`,
        isQuickFeedback: false,
        createdAt: Date.now(),
      });
    }
  },
});
