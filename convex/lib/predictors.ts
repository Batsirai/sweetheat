// ── Predictor Framework ─────────────────────────────────────────────────────
// Pre-publish signals. Each predictor takes a draft + brand context and
// returns a normalized 0..1 score plus structured details. The quality gate
// runs the registry, writes one `predictions` row per predictor, and
// aggregates to decide whether a branch advances to human review.
//
// First principle: a predictor is only useful if calibrated against observed
// outcomes (performanceSnapshots). Add predictors freely, but treat every new
// signal as a hypothesis until the calibration query shows it correlates.

import type { Id } from "../_generated/dataModel";
import { callClaude } from "./callClaude";

const HAIKU_MODEL = "claude-3-5-haiku-20241022";

// Aggregate threshold (mean of predictor scores) required to pass preflight.
export const PREFLIGHT_THRESHOLD = 0.7;

export interface PredictorContext {
  branchId: Id<"branches">;
  draftId: Id<"drafts">;
  brandId: Id<"brands">;
  format: string;
  body: string;
  seedTitle: string;
  seedDescription: string;
  voiceTraining: string;
  wordsToAvoid: string[];
  wordsToUse: string[];
  apiKey: string;
}

export interface PredictorResult {
  signal: string;
  version: string;
  score: number;                       // Normalized 0..1
  notes?: string;
  details?: unknown;
  // A predictor is "passed" when its own local criteria are met. The gate
  // respects this only when the predictor is marked `blocking`.
  passed: boolean;
  // Hard-fail short-circuits the aggregate regardless of other signals
  // (e.g. brand-forbidden words were found).
  hardFail?: boolean;
  costUsd?: number;
  latencyMs?: number;
}

export interface Predictor {
  name: string;
  version: string;
  // Which formats this predictor runs on. "*" = all formats.
  formats: string[] | "*";
  // If true, a failed result blocks the gate even when the aggregate passes.
  blocking: boolean;
  run: (input: PredictorContext) => Promise<PredictorResult>;
}

// ── Predictor: voice_fit ────────────────────────────────────────────────────
// Wraps the original qualityGate logic. Scores draft against brand voice,
// wordsToAvoid (hard-fail), wordsToUse, hook, tone, and CTA.

const voiceFitPredictor: Predictor = {
  name: "voice_fit",
  version: "haiku-voice-v1",
  formats: "*",
  blocking: true,
  async run(input) {
    const started = Date.now();
    const systemPrompt = `You are a content quality reviewer.
You review draft content against brand standards and provide a structured quality assessment.
Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.`;

    const userPrompt = `Review this ${input.format} draft against the brand standards below.

BRAND VOICE TRAINING:
${input.voiceTraining}

WORDS TO AVOID (auto-fail if any appear): ${input.wordsToAvoid.join(", ") || "none"}
WORDS TO USE (bonus if included): ${input.wordsToUse.join(", ") || "none"}

SEED TITLE: ${input.seedTitle}
SEED DESCRIPTION: ${input.seedDescription}

DRAFT CONTENT:
${input.body.slice(0, 3000)}

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

    const raw = await callClaude(input.apiKey, systemPrompt, userPrompt, 500, HAIKU_MODEL);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`voice_fit: unparseable response: ${raw.slice(0, 200)}`);
    const review = JSON.parse(match[0]);

    const rawScore = typeof review.score === "number" ? review.score : 0;
    const hasAvoided = Array.isArray(review.avoidedWordsFound) && review.avoidedWordsFound.length > 0;
    const normalized = Math.max(0, Math.min(1, rawScore / 10));

    const notes = [
      review.notes || "",
      review.hookAssessment ? `Hook: ${review.hookAssessment}` : "",
      review.toneMatch ? `Tone: ${review.toneMatch}` : "",
      review.ctaPresent === false ? "Missing CTA." : "",
      hasAvoided ? `AUTO-FAIL avoided words: ${review.avoidedWordsFound.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      signal: "voice_fit",
      version: "haiku-voice-v1",
      score: hasAvoided ? Math.min(normalized, 0.5) : normalized,
      notes,
      details: review,
      passed: !hasAvoided && rawScore >= 7,
      hardFail: hasAvoided,
      latencyMs: Date.now() - started,
    };
  },
};

// ── Predictor: hook_strength ────────────────────────────────────────────────
// Dedicated first-three-seconds / first-line evaluation. Short prompt, cheap.
// Applies to everything but weighted more heavily for short-form formats in
// the gate's aggregation (future work).

const hookStrengthPredictor: Predictor = {
  name: "hook_strength",
  version: "haiku-hook-v1",
  formats: "*",
  blocking: false,
  async run(input) {
    const started = Date.now();
    // Hook = first line for text formats, opening sentence otherwise.
    const firstLine = input.body.split(/\n+/)[0]?.slice(0, 240) ?? "";

    const systemPrompt = `You rate the attention-grabbing strength of a content hook.
Respond ONLY with valid JSON.`;

    const userPrompt = `Format: ${input.format}
Topic: ${input.seedTitle}

HOOK (first line):
${firstLine}

Rate on four dimensions (0-10 each):
- specificity: concrete vs vague
- curiosity_gap: does it make you want the next line?
- pattern_break: does it avoid generic openers ("In this post...", "Are you...")?
- payoff_signal: does it promise a clear benefit or revelation?

Return JSON:
{
  "specificity": <0-10>,
  "curiosity_gap": <0-10>,
  "pattern_break": <0-10>,
  "payoff_signal": <0-10>,
  "notes": "<one sentence diagnosis>"
}`;

    const raw = await callClaude(input.apiKey, systemPrompt, userPrompt, 200, HAIKU_MODEL);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`hook_strength: unparseable response: ${raw.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);

    const dims = ["specificity", "curiosity_gap", "pattern_break", "payoff_signal"] as const;
    const values = dims.map((d) => (typeof parsed[d] === "number" ? parsed[d] : 0));
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const normalized = Math.max(0, Math.min(1, mean / 10));

    return {
      signal: "hook_strength",
      version: "haiku-hook-v1",
      score: normalized,
      notes: parsed.notes,
      details: { ...parsed, firstLine },
      passed: normalized >= 0.6,
      latencyMs: Date.now() - started,
    };
  },
};

// ── Registry ────────────────────────────────────────────────────────────────
// Append new predictors here. Format gating (e.g. video-only neural simulator)
// is done via the `formats` field on each predictor.

export const registry: Predictor[] = [voiceFitPredictor, hookStrengthPredictor];
