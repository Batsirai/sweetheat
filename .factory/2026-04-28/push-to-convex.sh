#!/bin/bash
# Morning Factory Push Script — 2026-04-28
# Run this once Convex connectivity is restored.
# Requires: CONVEX_DEPLOY_KEY set, npx convex accessible

set -e

BRAND_SLUG="alreadyloved"

echo "=== AlreadyLoved Morning Factory: Convex Push ==="
echo "Date: 2026-04-28"
echo ""

# Step 1: Get brand ID
echo "Fetching brand ID for slug: $BRAND_SLUG..."
BRAND_RESULT=$(npx convex run brands:getBySlug "{\"slug\": \"$BRAND_SLUG\"}" 2>&1)
echo "Brand result: $BRAND_RESULT"
BRAND_ID=$(echo "$BRAND_RESULT" | grep '"_id"' | head -1 | sed 's/.*"_id": "\([^"]*\)".*/\1/')
echo "Brand ID: $BRAND_ID"

if [ -z "$BRAND_ID" ]; then
  echo "ERROR: Could not find brand ID. Exiting."
  exit 1
fi

echo ""
echo "=== PHASE 1: Creating Seeds ==="

# Seed 1 — SEO: Bedtime
echo "Creating seed 1: Bedtime affirmations SEO..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What to say to your child at bedtime (that sticks with them forever)\",
  \"description\": \"Long-tail SEO targeting parents searching for bedtime routines and affirmations. Explores the neuroscience of bedtime words anchoring into identity. Practical list of 7 things to say, grounded in belonging not behavior.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"Identity\",
  \"targetKeywords\": [\"bedtime affirmations for kids\", \"what to say to your child at bedtime\", \"words that build a child's confidence\"],
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"caption_tiktok\"],
  \"hookAngle\": \"The last thing your child hears before sleep is the first thing they believe about themselves.\",
  \"reasoning\": \"High-intent search traffic from parents in reflective bedtime mode. Positions AlreadyLoved as the daily ritual that carries identity.\"
}" 2>&1

# Seed 2 — SEO: Signs child doesn't feel loved
echo "Creating seed 2: Signs your child doesn't feel loved SEO..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Signs your child doesn't feel loved — and what to do today\",
  \"description\": \"SEO seed for parents searching for signs of emotional insecurity. Reframes these as signals not failures — shows how bids for connection are normal, not broken.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"Connection\",
  \"targetKeywords\": [\"signs your child doesn't feel loved\", \"how to know if your child feels secure\", \"child always seeking attention why\"],
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"tweet\"],
  \"hookAngle\": \"Your child isn't misbehaving. They're asking a question. And the question is always the same one.\",
  \"reasoning\": \"High-anxiety search intent. Meets parents at guilt and redirects to grace — perfectly on-brand.\"
}" 2>&1

# Seed 3 — AEO
echo "Creating seed 3: AEO personalized books..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What are the best personalized books to give a child for their identity and self-worth?\",
  \"description\": \"AEO seed for AI overviews and featured snippets. Q&A format. Direct answer in first paragraph. Covers why identity-first books outperform praise-based books.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"aeo\",
  \"contentPillar\": \"Identity\",
  \"targetKeywords\": [\"best personalized children's books self-worth\", \"books that help kids feel loved\", \"personalized identity books for children\"],
  \"targetFormats\": [\"blog\", \"pin\"],
  \"hookAngle\": \"The best personalized children's books don't just feature your child's name — they reveal who your child already is.\",
  \"reasoning\": \"AEO seed for AI citation. As search shifts toward AI overviews, first-paragraph answers get surfaced.\"
}" 2>&1

# Seed 4 — SEASONAL: Mother's Day (PRIMARY)
echo "Creating seed 4: Mother's Day seasonal seed..."
MOTHERS_DAY_SEED_ID=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"This Mother's Day, give your child something they'll carry their whole life\",
  \"description\": \"Seasonal seed for Mother's Day (May 11, 2026). Reframe: the best Mother's Day gift isn't for mom — it's for your child. The gift of knowing they've always been loved before they ever did anything. Bridges to AlreadyLoved books.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"Belonging\",
  \"targetKeywords\": [\"Mother's Day personalized children's book\", \"meaningful Mother's Day tradition with kids\", \"Mother's Day gift for kids not mom\"],
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"caption_tiktok\", \"linkedin\", \"tweet\"],
  \"hookAngle\": \"She didn't need flowers. She needed to know she was already enough before she ever brought them.\",
  \"reasoning\": \"Mother's Day is 13 days away. High purchase intent, deep emotional resonance, fresh angle. 10-day traffic window.\"
}" 2>&1 | tail -1)
echo "Mother's Day seed ID: $MOTHERS_DAY_SEED_ID"

# Seed 5 — Brand building
echo "Creating seed 5: Brand building seed..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The word every child is really asking for (and almost no parent knows to give it)\",
  \"description\": \"Brand-building seed. Under every tantrum is the same question: Am I still loved? Explores how identity precedes behavior. Not instructive. Revelatory. Designed to make a parent feel seen.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"brand_building\",
  \"contentPillar\": \"Identity\",
  \"targetKeywords\": [\"what children really want from parents\", \"why kids act out for attention\", \"identity and behavior in children\"],
  \"targetFormats\": [\"blog\", \"caption_ig\", \"tweet\", \"linkedin\"],
  \"hookAngle\": \"Every time your child acts out, they're asking you a question. It's the same question every time.\",
  \"reasoning\": \"Pure brand-building. The AlreadyLoved philosophy stated compellingly. Designed for shares, saves, follows.\"
}" 2>&1

# Seed 6 — SEO: Baptism
echo "Creating seed 6: Baptism gifts SEO..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Why personalized baptism gifts hit different when they're built on identity, not ceremony\",
  \"description\": \"SEO seed for high-intent baptism gift searches. Parents in a spiritual/meaning-making mindset. Article explores what a baptism declares and how a personalized book carrying that identity outlasts any silver frame.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"Belonging\",
  \"targetKeywords\": [\"personalized baptism gift children\", \"best baptism gifts that last\", \"christian personalized book for baby\"],
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\"],
  \"hookAngle\": \"A baptism says: this child is already known, already held, already named. The gift should say the same thing.\",
  \"reasoning\": \"High purchase intent, spiritual resonance, year-round demand with spikes around Easter and spring.\"
}" 2>&1

# Seed 7 — Engagement
echo "Creating seed 7: Engagement / list format seed..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What you say today becomes their inner voice tomorrow — a parent's guide to identity-first words\",
  \"description\": \"Engagement seed. 10 things to say to your child that plant identity. Specific phrases with brief notes. Warm, practical, designed to be screenshotted and saved. Not a lecture — a love language toolkit.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"engagement\",
  \"contentPillar\": \"Identity\",
  \"targetKeywords\": [\"what to say to your child every day\", \"positive affirmations for kids from parents\", \"words that build identity in children\"],
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"caption_tiktok\"],
  \"hookAngle\": \"What you say today becomes the voice in their head at 25. Here's what to say.\",
  \"reasoning\": \"High shareability. Parents love practical lists they can use tonight. Drives brand awareness.\"
}" 2>&1

echo ""
echo "=== PHASE 2: Creating Article Branch + Draft (Mother's Day) ==="
echo "NOTE: Replace SEED_ID below with the actual Mother's Day seed ID from above."
echo ""

# If you have the seed ID, create a branch then draft:
# BRANCH_ID=$(npx convex run branches:create "{\"seedId\": \"SEED_ID\", \"brandId\": \"$BRAND_ID\", \"format\": \"blog\"}" 2>&1 | tail -1)

# Then create the draft with the article content:
# npx convex run drafts:create "{
#   \"branchId\": \"$BRANCH_ID\",
#   \"body\": $(cat /home/user/sweetheat/.factory/2026-04-28/article-mothers-day.md | jq -Rs .),
#   \"authoredBy\": \"agent\"
# }"

echo "Article content ready at: .factory/2026-04-28/article-mothers-day.md"
echo "Social copy ready at: .factory/2026-04-28/social-mothers-day.md"
echo ""
echo "=== PHASE 3: Creating Social Branches + Drafts ==="
echo "Same pattern: create branch per format, then draft with body content from social-mothers-day.md"
echo ""
echo "=== Done. Seeds created. Manual review required for articles/social due to Convex connectivity. ==="
