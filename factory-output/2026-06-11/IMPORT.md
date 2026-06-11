# Morning Factory Output — June 11, 2026

Generated at 6am ET. Convex deploy key returned 403 in remote environment — content staged here for manual import.

## Quick Import (run from a machine with valid Convex auth)

### 1. Get Brand ID
```bash
npx convex run brands:listActive
# Copy the AlreadyLoved brand _id
```

### 2. Create Seeds
Replace `BRAND_ID` with the AlreadyLoved brand ID. Run each block:

```bash
# Seed 1 — SEO: Father's Day
npx convex run seeds:create '{
  "brandId": "BRAND_ID",
  "title": "The One Father\'s Day Gift That Tells Your Child Who They Are",
  "description": "Father\'s Day is June 15 — four days away. Most personalized gifts celebrate the dad. This angle flips it: what if the gift celebrated the child, through dad\'s eyes? Weaves identity-first parenting into a timely gift-guide format.",
  "source": "agent",
  "pitchedBy": "morning-factory",
  "purpose": "seo",
  "contentPillar": "identity-first parenting",
  "targetKeywords": ["personalized father\'s day books for kids", "father\'s day gifts from children", "meaningful father\'s day gift ideas"],
  "targetFormats": ["blog", "pin", "ig", "tiktok"],
  "hookAngle": "Flips the Father\'s Day frame: the gift that names the child",
  "reasoning": "Father\'s Day June 15 is 4 days away. High purchase intent. Identity-first angle differentiates from generic gift guides."
}'

# Seed 2 — SEO: Bedtime Affirmations
npx convex run seeds:create '{
  "brandId": "BRAND_ID",
  "title": "What Your Child Hears at Bedtime Becomes Their Inner Voice",
  "description": "Long-tail SEO targeting moms searching bedtime affirmations and what to say to kids before sleep. The insight: words in those last quiet minutes accumulate into the voice a child hears in their own head for decades.",
  "source": "agent",
  "pitchedBy": "morning-factory",
  "purpose": "seo",
  "contentPillar": "words matter",
  "targetKeywords": ["bedtime affirmations for kids", "what to say to your child at bedtime", "positive bedtime routine toddler"],
  "targetFormats": ["blog", "pin", "ig"],
  "hookAngle": "The last thing they hear before sleep is the first thing they believe about themselves"
}'

# Seed 3 — AEO: What do children need to hear every day?
npx convex run seeds:create '{
  "brandId": "BRAND_ID",
  "title": "What Do Children Need to Hear Every Day? (The Answer Might Surprise You)",
  "description": "AEO-formatted piece designed for featured snippet and AI citation. Direct answer in first paragraph: children need unconditional belonging statements, not praise. Contrasts praise vs identity language.",
  "source": "agent",
  "pitchedBy": "morning-factory",
  "purpose": "aeo",
  "contentPillar": "identity-first parenting",
  "targetKeywords": ["what do children need to hear every day", "words children need to hear", "positive affirmations for children"],
  "targetFormats": ["blog", "pin"],
  "hookAngle": "Q&A format, direct answer first, AI-optimized"
}'

# Seed 4 — Brand: Core Manifesto
npx convex run seeds:create '{
  "brandId": "BRAND_ID",
  "title": "Your Child Doesn\'t Need to Earn Your Love — They Need to Know They Already Have It",
  "description": "Core brand manifesto. The central AlreadyLoved belief: when kids don\'t know they\'re already loved, the world teaches them to earn love. No prescriptions. Just truth.",
  "source": "agent",
  "pitchedBy": "morning-factory",
  "purpose": "brand",
  "contentPillar": "identity-first parenting",
  "targetKeywords": ["unconditional love parenting", "raising children who feel loved", "identity before behavior parenting"],
  "targetFormats": ["blog", "ig", "linkedin"],
  "hookAngle": "Brand manifesto — the belief that drives everything"
}'

# Seed 5 — Engagement: Grocery Store Meltdown
npx convex run seeds:create '{
  "brandId": "BRAND_ID",
  "title": "She Threw a Fit in the Grocery Store. Here\'s What I Said Instead.",
  "description": "Relatable mom moment that pivots from standard meltdown advice to something deeper: the words that land when a child is dysregulated aren\'t corrections, they\'re belonging statements.",
  "source": "agent",
  "pitchedBy": "morning-factory",
  "purpose": "engagement",
  "contentPillar": "connection over correction",
  "targetKeywords": ["toddler tantrum in public", "what to say when kids act out", "connection over correction parenting"],
  "targetFormats": ["ig", "tiktok", "blog"],
  "hookAngle": "Universal moment, unexpected pivot — reveals belonging as the response"
}'

# Seed 6 — SEO: Personalized Name Books
npx convex run seeds:create '{
  "brandId": "BRAND_ID",
  "title": "Why Your Child\'s Name in a Story Changes Everything",
  "description": "SEO piece on personalized children\'s books rooted in the neuroscience of the cocktail party effect. Why your child\'s name, spoken with love, in a story about who they are, is actually formative.",
  "source": "agent",
  "pitchedBy": "morning-factory",
  "purpose": "seo",
  "contentPillar": "personalization + identity",
  "targetKeywords": ["personalized books for kids with their name", "personalized children\'s books", "best personalized books for toddlers"],
  "targetFormats": ["blog", "pin", "ig"],
  "hookAngle": "Science-backed reason why personalization matters beyond the cute factor"
}'

# Seed 7 — SEO: What Dads Say to Daughters
npx convex run seeds:create '{
  "brandId": "BRAND_ID",
  "title": "The Words That Stick: What Dads Say That Daughters Remember Forever",
  "description": "Father\'s Day companion piece, more evergreen. Explores specific language patterns that form a daughter\'s self-concept. Real examples, no listicle. Reveals the weight of what dads are already saying.",
  "source": "agent",
  "pitchedBy": "morning-factory",
  "purpose": "seo",
  "contentPillar": "fatherhood + identity",
  "targetKeywords": ["what dads say that daughters remember", "words fathers say to daughters", "what to say to your daughter"],
  "targetFormats": ["blog", "pin", "ig", "linkedin"],
  "hookAngle": "Reveals the lasting weight of ordinary words"
}'
```

### 3. After import — approve seeds and create branches

Once seeds are imported, mark the two fully-written ones as approved:
```bash
# Get seed IDs from: npx convex run seeds:list '{"brandId": "BRAND_ID"}'
npx convex run seeds:updateStatus '{"id": "SEED_ID_FATHERS_DAY", "status": "approved"}'
npx convex run seeds:updateStatus '{"id": "SEED_ID_BEDTIME", "status": "approved"}'
```

Then create branches and drafts — see articles/ directory for the full content.

---

## Content Summary

| File | Type | Status |
|------|------|--------|
| articles/fathers-day-personalized-book.md | Blog article, ~1700w | Ready |
| articles/bedtime-affirmations-inner-voice.md | Blog article, ~1600w | Ready |
| social/fathers-day-social.md | 5 Pinterest pins, IG, TikTok, LinkedIn, 4-tweet thread | Ready |
| social/bedtime-social.md | 5 Pinterest pins, IG, TikTok, LinkedIn, 3-tweet thread | Ready |
| seeds.json | 7 seeds | Ready for import |

## Why Convex failed
Error: `403 Forbidden` from `https://api.convex.dev/api/deployment/url_for_key`

The CONVEX_DEPLOY_KEY in CLAUDE.md appears to be expired or not authorized for `convex run` in this remote execution environment. Regenerate via the Convex dashboard and update the key in the workflow trigger.
