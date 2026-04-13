# Content Testing: First Principles

Why we test content before it ships, and how the preflight gate is built to
learn rather than just to judge.

## The principle the hype-y "neural engagement" pitch gets right

Most content pipelines guess. You ship, you squint at the retention graph, you
rationalize. The useful idea buried under the Twitter grift about Meta's TRIBE
v2 is: **if you have a predictor of how a piece of content will land, you can
generate many variants, rank them, and publish only the top candidate.** Same
effort, better output — *provided* the predictor is actually predictive.

That proviso is the whole game.

## The principles the pitch gets wrong

1. **One viral case study is not calibration.** A single video hitting 100k
   views after "optimization" tells you nothing about whether the optimizer
   caused it. You need a log of predicted scores paired with observed outcomes,
   across many pieces, before you trust the model.
2. **One signal is a monoculture.** Brain-scan engagement is one signal.
   Voice-fit is another. Hook-strength, platform-fit, pacing, AEO-fit — all
   separate. Collapsing them into one score hides which one is actually
   carrying the prediction.
3. **A predictor without a correlation test is a vibes check.** If
   `hook_strength = 0.83` does not correlate with actual saves / retention /
   revenue, it is noise no matter how confidently the model outputs it.

## How sweetheat is set up to learn, not just judge

Three pieces, in order of leverage:

### 1. Multi-signal, pluggable preflight

`convex/qualityGate.ts` runs a chain of predictors from the registry in
`convex/lib/predictors.ts`. Each predictor:

- returns a normalized `0..1` score,
- declares whether it is `blocking` (can fail the gate on its own),
- optionally emits `hardFail` (e.g. brand-forbidden words found),
- attaches rich `details` so the raw signal is preserved for later analysis.

Format gating (`formats: ["short_video", "long_video"]` vs `"*"`) lets us add
expensive predictors — like a neural-engagement simulator — that only run on
the formats where they matter.

Current registry:

- `voice_fit` (haiku-voice-v1, blocking, all formats) — wraps the legacy
  quality check: brand voice, words-to-avoid hard-fail, hook assessment, CTA.
- `hook_strength` (haiku-hook-v1, non-blocking, all formats) — dedicated
  four-dimensional read of the first line: specificity, curiosity gap,
  pattern break, payoff signal.

### 2. Every prediction is persisted

The `predictions` table stores one row per predictor run per draft. Not the
aggregate, not just the failures — **every signal, every time**. Without that
log there is no calibration.

### 3. The calibration query is the point

`api.predictions.calibration` returns joinable rows of predicted scores +
published branches + contentId refs. The job of that query is not to decide
anything — it is to let you, or a notebook, compute:

> Over the last 30 days, does `hook_strength` score correlate with observed
> saves (or clicks, or revenue)? Broken down by brand and by format?

If the answer is "no correlation," the predictor is theatre. Kill it or fix
it. If the answer is "strong correlation on short_video only," weight it
accordingly and scope it to that format.

## What to add next (in order)

1. **Variant generation.** Let an agent produce N drafts per branch, run the
   gate on all N, publish the one with the highest aggregate. This is where
   the actual output-quality lift lives. Requires a small schema change —
   drafts gain a `candidate` status, branches keep a chosen `currentDraftId`.
2. **Format-specific weighting.** Once calibration data is in, replace the
   mean-of-scores aggregate with weights per format.
3. **Video predictors.** A `pacing` predictor that flags dead zones in the
   script / transcript is cheap and will likely move numbers. The actual
   fMRI-model (TRIBE v2 or similar) is the *last* thing to add, and only if
   the calibration log justifies the cost.

## What the pitch called "cartel", and what it actually is

Rename the shiny stuff. It's just the scientific method applied to content:

- **Hypothesis** = a predictor.
- **Experiment** = running it on every draft.
- **Observation** = performanceSnapshots post-publish.
- **Calibration** = correlating predicted with observed.
- **Publish or refute** = weight the predictor or retire it.

Do that loop honestly for six months and the output gets better. Skip the
calibration step and you just have a more expensive version of guessing.
