# AlreadyLoved Morning Factory — June 12, 2026

**Run time:** 6:00 AM ET
**Agent:** Morning Factory
**Date context:** Friday, June 12 — Father's Day June 21 (9 days, social amplification window) — Real summer week 2-3, school fully out — 4th of July 3 weeks out — Baptism season ongoing
**Infrastructure note:** Convex API returns 403 Forbidden from cloud environment (persistent since April). Slack webhook blocked by outbound network policy. All content saved locally. Manual Convex commands below — replace `BRAND_ID` with AlreadyLoved brand ID from dashboard.

---

## PHASE 1: SEEDS — 7 pitched

Saved to: `morning-factory/seeds/seeds-2026-06-12.json`

No duplicates with any prior run (65 seeds previously pitched checked).

| # | Title | Type | Format |
|---|-------|------|--------|
| 1 | Screen Time in Summer: What You're Actually Worried About (It's Not the Screen) | SEO | blog, pin, IG |
| 2 | Last-Minute Father's Day Gifts That Actually Feel Like You Tried | SEO | blog, pin |
| 3 | What Does a Child Need to Feel Loved? (The Short Answer Is Simpler Than You Think) | AEO | blog |
| 4 | You Don't Have to Be the Fun Parent This Summer | Brand Building | blog, IG, tweet |
| 5 | What Your Child Will Remember About This Summer (It's Not the Trip) | Engagement | blog, pin, IG, tweet |
| 6 | How to Talk to Your Child About Big Feelings Without Losing Yours | SEO | blog, pin |
| 7 | What Kids Don't Know How to Say to Their Dads (But Carry Everywhere) | Father's Day Engagement | blog, IG, tweet |

**Season notes:**
- Seeds 1, 4, 5 target the current summer-is-real-now moment (week 2-3 of no school)
- Seed 2 captures last-minute Father's Day shoppers (9 days = peak search window)
- Seed 7 is the emotional Father's Day amplification piece, not another gift guide
- Seed 3 is evergreen AEO prime target — featured snippet territory
- Seed 6 fills the emotional vocabulary gap (big feelings content) not yet covered

---

## PHASE 2: ARTICLE — 1 written

**Title:** She Was Performing. I Didn't Know I'd Taught Her To.
**Word count:** ~1,650
**Type:** Brand building / identity-first
**Primary keywords:** child performing for approval, conditional love parenting, identity first parenting, unconditional love child
**Saved to:** `morning-factory/articles/she-was-performing-2026-06-12.md`

**Article structure:**
- Hook: Mom realizes her 4-year-old came downstairs with her hair done just to receive praise — and the quiet moment of recognition
- Science: Conditional positive regard research (Grolnick, Deci) — what happens to kids when warmth tracks performance
- Signs: What the performing child looks like in real daily moments (holding drawings, asking "did I do good?", pre-emptive apologies)
- Root cause: The child learned it by watching how her mother *received* her
- Shift: Identity before output — naming her before evaluating anything
- CTA: "Nothing you do could make me love you less. Nothing could make me love you more." + AlreadyLoved books
- Quality gate: Reveals rather than instructs ✓ | Names inner experience ✓ | Preserves belonging ✓ | Reduces pressure ✓ | 10pm tired mom test ✓ | No AI-sounding language ✓

---

## PHASE 3: SOCIAL COPY — 9 formats

Saved to: `morning-factory/social/social-she-was-performing-2026-06-12.md`

| Format | Status |
|--------|--------|
| Pinterest Pin 1 — Main hook | ✓ Written |
| Pinterest Pin 2 — Pull quote | ✓ Written |
| Pinterest Pin 3 — Research insight | ✓ Written |
| Pinterest Pin 4 — Question format | ✓ Written |
| Pinterest Pin 5 — List format | ✓ Written |
| Instagram caption | ✓ Written |
| TikTok caption | ✓ Written |
| LinkedIn post | ✓ Written |
| Tweet thread (5 tweets) | ✓ Written |

---

## CONVEX PUSH COMMANDS

Run these manually after confirming brand ID from dashboard. Replace `YOUR_BRAND_ID` throughout.

### Step 1: Check brand ID
```bash
npx convex run brands:listActive
```

### Step 2: Create seeds (run for each seed)

```bash
# Seed 1 — Screen Time
npx convex run seeds:create '{
  "brandId": "YOUR_BRAND_ID",
  "title": "Screen Time in Summer: What You'\''re Actually Worried About (It'\''s Not the Screen)",
  "purpose": "organic_seo",
  "contentPillar": "belonging",
  "formats": ["blog", "pin", "caption_ig"],
  "targetKeywords": ["screen time kids summer", "how much screen time is too much for kids", "summer screen time limits", "screen time toddler"],
  "hook": "The tablet has been out since 8am. It'\''s 10. And I'\''m already doing math in my head.",
  "status": "pending"
}'

# Seed 2 — Last-Minute Father's Day
npx convex run seeds:create '{
  "brandId": "YOUR_BRAND_ID",
  "title": "Last-Minute Father'\''s Day Gifts That Actually Feel Like You Tried",
  "purpose": "organic_seo",
  "contentPillar": "belonging",
  "formats": ["blog", "pin"],
  "targetKeywords": ["last-minute fathers day gifts", "meaningful fathers day gifts", "personalized fathers day gifts"],
  "hook": "It'\''s June 12. Father'\''s Day is nine days away. You'\''re not late.",
  "status": "pending"
}'

# Seed 3 — AEO
npx convex run seeds:create '{
  "brandId": "YOUR_BRAND_ID",
  "title": "What Does a Child Need to Feel Loved? (The Short Answer Is Simpler Than You Think)",
  "purpose": "aeo_citation",
  "contentPillar": "belonging",
  "formats": ["blog"],
  "targetKeywords": ["what does a child need to feel loved", "how to make your child feel loved", "emotional needs of a child"],
  "hook": "You love your child completely. That'\''s not the question. The question is: does your child feel it?",
  "status": "pending"
}'

# Seed 4 — Brand Building
npx convex run seeds:create '{
  "brandId": "YOUR_BRAND_ID",
  "title": "You Don'\''t Have to Be the Fun Parent This Summer",
  "purpose": "brand_building",
  "contentPillar": "identity",
  "formats": ["blog", "caption_ig", "tweet"],
  "targetKeywords": ["summer parenting guilt", "not a fun mom", "mom guilt summer", "summer activities for kids mom exhausted"],
  "hook": "I'\''ve seen the summer bucket lists. The tie-dye kits. The craft-a-day calendar. I did none of them last summer. My kids were fine.",
  "status": "pending"
}'

# Seed 5 — Engagement
npx convex run seeds:create '{
  "brandId": "YOUR_BRAND_ID",
  "title": "What Your Child Will Remember About This Summer (It'\''s Not the Trip)",
  "purpose": "engagement",
  "contentPillar": "belonging",
  "formats": ["blog", "pin", "caption_ig", "tweet"],
  "targetKeywords": ["what kids remember about summer", "summer memories for kids", "what children remember from childhood"],
  "hook": "We spent $2,000 on that trip. What she talks about is the night we got rained out and ate gas station sandwiches in the car.",
  "status": "pending"
}'

# Seed 6 — SEO
npx convex run seeds:create '{
  "brandId": "YOUR_BRAND_ID",
  "title": "How to Talk to Your Child About Big Feelings Without Losing Yours",
  "purpose": "organic_seo",
  "contentPillar": "identity",
  "formats": ["blog", "pin"],
  "targetKeywords": ["how to talk to kids about emotions", "child big feelings meltdown", "what to say when child is upset", "toddler big feelings"],
  "hook": "She threw herself on the floor because the crackers were the wrong shape. I know how to handle that one. It'\''s the quiet '\''nobody likes me'\'' at bedtime that breaks me.",
  "status": "pending"
}'

# Seed 7 — Father's Day Engagement
npx convex run seeds:create '{
  "brandId": "YOUR_BRAND_ID",
  "title": "What Kids Don'\''t Know How to Say to Their Dads (But Carry Everywhere)",
  "purpose": "engagement",
  "contentPillar": "belonging",
  "formats": ["blog", "caption_ig", "tweet"],
  "targetKeywords": ["what kids want their dad to know", "fathers day message from child", "what children think about their dads"],
  "hook": "She doesn'\''t have the words yet. She'\''s three. But she keeps dragging his shoes to the door when he hasn'\''t come home.",
  "status": "pending"
}'
```

### Step 3: Create article draft

First find the seed ID for "She Was Performing" in the dashboard (or from `npx convex run seeds:list '{"brandId": "YOUR_BRAND_ID"}'`), then:

```bash
npx convex run drafts:createFromAgent '{
  "seedId": "PERFORMING_SEED_ID",
  "body": "PASTE_ARTICLE_MARKDOWN_HERE",
  "format": "blog"
}'
```

Article is at: `morning-factory/articles/she-was-performing-2026-06-12.md`

### Step 4: Create social drafts

```bash
# Pinterest pins, IG, TikTok, LinkedIn, tweet thread
# Use format values: "pin", "caption_ig", "caption_tiktok", "linkedin", "tweet_thread"
npx convex run drafts:createFromAgent '{
  "seedId": "PERFORMING_SEED_ID",
  "body": "PASTE_SOCIAL_COPY_HERE",
  "format": "pin"
}'
```

Social copy is at: `morning-factory/social/social-she-was-performing-2026-06-12.md`

---

## MORNING SUMMARY

| Category | Count |
|----------|-------|
| Seeds pitched | 7 |
| Articles written | 1 |
| Social formats | 9 (5x pin, IG, TikTok, LinkedIn, 5-tweet thread) |
| Total pieces | 17 |

**Article written:** She Was Performing. I Didn't Know I'd Taught Her To.
**Seeds to watch:** Seed 2 (Father's Day gifts) has a hard publish deadline of June 14-15 to capture weekend shopping.

---

*Slack report blocked by outbound network policy — content saved locally. Push via commands above.*
