#!/bin/bash
# Morning Factory Push Script — 2026-05-14
# Run this once Convex connectivity is restored.
# Requires: npx convex accessible and authenticated (npx convex login)
# NOTE: Also pushes the April 28 backlog if seeds from that run aren't yet in Convex.

set -e

BRAND_SLUG="alreadyloved"
DATE="2026-05-14"

echo "=== AlreadyLoved Morning Factory: Convex Push ==="
echo "Date: $DATE"
echo ""

# Step 1: Get brand ID
echo "Fetching brand ID for slug: $BRAND_SLUG..."
BRAND_RESULT=$(npx convex run brands:getBySlug "{\"slug\": \"$BRAND_SLUG\"}" 2>&1)
echo "Brand result: $BRAND_RESULT"
BRAND_ID=$(echo "$BRAND_RESULT" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data['_id'])" 2>/dev/null || echo "$BRAND_RESULT" | grep '"_id"' | head -1 | sed 's/.*"_id": "\([^"]*\)".*/\1/')
echo "Brand ID: $BRAND_ID"

if [ -z "$BRAND_ID" ]; then
  echo "ERROR: Could not find brand ID for slug '$BRAND_SLUG'. Exiting."
  exit 1
fi

echo ""
echo "=== PHASE 1: Creating Seeds (2026-05-14) ==="

# Seed 1 — SEO: Father's Day gift
echo "Creating seed 1: Father's Day personalized gift SEO..."
SEED1_ID=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Personalized Father's Day gift for kids — the one that plants something that grows\",
  \"description\": \"SEO seed targeting high-intent Father's Day purchase searches. Reframes 'gift from dad to child' — rather than a gift FOR dad, what if it's a gift FROM dad to his child that carries his love into every hard year ahead? Targets: 'personalized Father's Day gift for kids', 'meaningful gift from dad to child', 'Father's Day gift that lasts'.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"Belonging\",
  \"targetKeywords\": [\"personalized father's day gift for kids\", \"gift from dad to child that lasts\", \"meaningful father's day tradition with children\"],
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"caption_tiktok\", \"tweet\"],
  \"hookAngle\": \"It's not a gift for dad. It's a gift from dad — something his child will carry into every room they ever walk into alone.\"
}" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
echo "Seed 1 ID: $SEED1_ID"

# Seed 2 — SEO: Bedtime affirmations
echo "Creating seed 2: Bedtime affirmations SEO..."
SEED2_ID=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What to say to your child at bedtime (that sticks with them forever)\",
  \"description\": \"Long-tail SEO targeting parents searching for bedtime routines and affirmations. Explores the neuroscience of bedtime words anchoring into identity. Practical list of 7 things to say, grounded in belonging not behavior.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"Identity\",
  \"targetKeywords\": [\"bedtime affirmations for kids\", \"what to say to your child at bedtime\", \"words that build a child's confidence\"],
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"caption_tiktok\"],
  \"hookAngle\": \"The last thing your child hears before sleep is the first thing they believe about themselves.\"
}" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
echo "Seed 2 ID: $SEED2_ID"

# Seed 3 — AEO: Best personalized Father's Day book
echo "Creating seed 3: AEO Father's Day personalized books..."
SEED3_ID=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What are the best personalized children's books for a Father's Day gift?\",
  \"description\": \"AEO seed built for AI citation and featured snippets on Father's Day purchase queries. Q&A format. Direct answer in first paragraph. Covers why identity-first books outperform generic personalization.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"aeo\",
  \"contentPillar\": \"Identity\",
  \"targetKeywords\": [\"best personalized children's book father's day\", \"personalized book dad can give child\", \"father's day gift book with child's name\"],
  \"targetFormats\": [\"blog\", \"pin\"],
  \"hookAngle\": \"The best personalized Father's Day book doesn't just have your child's name in it — it tells your child who they already are.\"
}" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
echo "Seed 3 ID: $SEED3_ID"

# Seed 4 — Brand Building: What dads say
echo "Creating seed 4: What dads say brand building..."
SEED4_ID=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What dads say without realizing it — and what their kids actually hear\",
  \"description\": \"Brand-building seed. Explores the unintended messages in everyday dad language. The gap between conditional and unconditional words. Reveals the AlreadyLoved model from a father's perspective. Not guilt — revelation.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"brand_building\",
  \"contentPillar\": \"Identity\",
  \"targetKeywords\": [\"what dads say that affects kids\", \"how father's words shape children's identity\", \"words dads should say to children\"],
  \"targetFormats\": [\"blog\", \"caption_ig\", \"linkedin\", \"tweet\"],
  \"hookAngle\": \"The most important thing a dad has ever said to his kid — he said it without knowing it was the most important thing.\"
}" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
echo "Seed 4 ID: $SEED4_ID"

# Seed 5 — Engagement: The question children ask
echo "Creating seed 5: The question every child is asking..."
SEED5_ID=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The question every child is really asking (and almost no parent knows to answer)\",
  \"description\": \"Engagement seed. The revelation piece: under every tantrum and clingy moment is the same question. Reveals the AlreadyLoved model. Designed to stop a scroll and get saved/shared.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"engagement\",
  \"contentPillar\": \"Connection\",
  \"targetKeywords\": [\"why kids act out\", \"what children really need from parents\", \"connection before correction parenting\"],
  \"targetFormats\": [\"blog\", \"caption_ig\", \"tweet\", \"linkedin\"],
  \"hookAngle\": \"Every time your child acts out, they're asking the same question. It's the same question every time. And almost no one answers it.\"
}" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
echo "Seed 5 ID: $SEED5_ID"

# Seed 6 — SEO: Signs child doesn't feel loved
echo "Creating seed 6: Signs child doesn't feel loved SEO..."
SEED6_ID=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Signs your child doesn't feel loved — and what to do today\",
  \"description\": \"SEO seed for parents searching for signs of emotional insecurity. Reframes these as signals not failures. Meets parents at worry and redirects to grace.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"Connection\",
  \"targetKeywords\": [\"signs your child doesn't feel loved\", \"how to know if your child feels secure\", \"child always seeking attention why\"],
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"tweet\"],
  \"hookAngle\": \"Your child isn't misbehaving. They're asking a question. And the question is always the same one.\"
}" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
echo "Seed 6 ID: $SEED6_ID"

# Seed 7 — Engagement: 10 phrases that plant identity
echo "Creating seed 7: 10 phrases that plant identity..."
SEED7_ID=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What you say today becomes their inner voice tomorrow — 10 phrases that plant identity\",
  \"description\": \"Engagement/list seed. 10 specific phrases parents can say tonight. Not affirmations to recite, but truths to mean. Designed to be screenshotted and saved. High pin saves.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"engagement\",
  \"contentPillar\": \"Identity\",
  \"targetKeywords\": [\"what to say to your child every day\", \"phrases that build identity in children\", \"words parents should say to kids\"],
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"caption_tiktok\"],
  \"hookAngle\": \"What you say today becomes the voice in their head at 25. Here are 10 things worth saying.\"
}" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
echo "Seed 7 ID: $SEED7_ID"

echo ""
echo "=== PHASE 2: Creating Branch + Article Draft (Father's Day) ==="
echo "Using Seed 1 (Father's Day SEO) for the article branch."
echo "NOTE: Replace SEED_ID_HERE with the actual Seed 1 ID from above if needed."

ARTICLE_SEED_ID="${SEED1_ID}"
if [ -z "$ARTICLE_SEED_ID" ]; then
  echo "WARNING: Seed 1 ID not captured. Set ARTICLE_SEED_ID manually."
  read -p "Enter Seed 1 ID manually: " ARTICLE_SEED_ID
fi

echo "Creating blog branch for seed: $ARTICLE_SEED_ID..."
BRANCH_ID=$(npx convex run branches:create "{
  \"seedId\": \"$ARTICLE_SEED_ID\",
  \"brandId\": \"$BRAND_ID\",
  \"format\": \"blog\"
}" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
echo "Blog Branch ID: $BRANCH_ID"

if [ -n "$BRANCH_ID" ]; then
  ARTICLE_BODY=$(cat "$(dirname "$0")/article-fathers-day.md")
  echo "Creating article draft..."
  DRAFT_ID=$(npx convex run drafts:create "{
    \"branchId\": \"$BRANCH_ID\",
    \"body\": $(echo "$ARTICLE_BODY" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))"),
    \"authoredBy\": \"agent\"
  }" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
  echo "Article Draft ID: $DRAFT_ID"
fi

echo ""
echo "=== PHASE 3: Social Copy Branches + Drafts ==="

# Pinterest branches (5 pins)
SOCIAL_SEED_ID="${SEED1_ID}"
if [ -n "$SOCIAL_SEED_ID" ]; then

  echo "Creating Pinterest branch..."
  PIN_BRANCH_ID=$(npx convex run branches:create "{
    \"seedId\": \"$SOCIAL_SEED_ID\",
    \"brandId\": \"$BRAND_ID\",
    \"format\": \"pin\"
  }" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
  echo "Pin Branch ID: $PIN_BRANCH_ID"

  if [ -n "$PIN_BRANCH_ID" ]; then
    PIN_BODY=$(cat "$(dirname "$0")/social-fathers-day.md" | sed -n '/## Pinterest Pins/,/## Instagram/p' | head -100)
    npx convex run drafts:create "{
      \"branchId\": \"$PIN_BRANCH_ID\",
      \"body\": $(echo "$PIN_BODY" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))"),
      \"authoredBy\": \"agent\"
    }" > /dev/null 2>&1 && echo "Pinterest draft created." || echo "Pinterest draft failed."
  fi

  # Instagram
  echo "Creating Instagram branch..."
  IG_BRANCH_ID=$(npx convex run branches:create "{
    \"seedId\": \"$SOCIAL_SEED_ID\",
    \"brandId\": \"$BRAND_ID\",
    \"format\": \"caption_ig\"
  }" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
  if [ -n "$IG_BRANCH_ID" ]; then
    IG_BODY=$(cat "$(dirname "$0")/social-fathers-day.md" | sed -n '/## Instagram Caption/,/## TikTok/p' | head -60)
    npx convex run drafts:create "{
      \"branchId\": \"$IG_BRANCH_ID\",
      \"body\": $(echo "$IG_BODY" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))"),
      \"authoredBy\": \"agent\"
    }" > /dev/null 2>&1 && echo "Instagram draft created." || echo "Instagram draft failed."
  fi

  # TikTok
  echo "Creating TikTok branch..."
  TT_BRANCH_ID=$(npx convex run branches:create "{
    \"seedId\": \"$SOCIAL_SEED_ID\",
    \"brandId\": \"$BRAND_ID\",
    \"format\": \"caption_tiktok\"
  }" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
  if [ -n "$TT_BRANCH_ID" ]; then
    TT_BODY=$(cat "$(dirname "$0")/social-fathers-day.md" | sed -n '/## TikTok Caption/,/## LinkedIn/p' | head -20)
    npx convex run drafts:create "{
      \"branchId\": \"$TT_BRANCH_ID\",
      \"body\": $(echo "$TT_BODY" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))"),
      \"authoredBy\": \"agent\"
    }" > /dev/null 2>&1 && echo "TikTok draft created." || echo "TikTok draft failed."
  fi

  # LinkedIn
  echo "Creating LinkedIn branch..."
  LI_BRANCH_ID=$(npx convex run branches:create "{
    \"seedId\": \"$SOCIAL_SEED_ID\",
    \"brandId\": \"$BRAND_ID\",
    \"format\": \"linkedin\"
  }" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
  if [ -n "$LI_BRANCH_ID" ]; then
    LI_BODY=$(cat "$(dirname "$0")/social-fathers-day.md" | sed -n '/## LinkedIn Post/,/## Tweet Thread/p' | head -60)
    npx convex run drafts:create "{
      \"branchId\": \"$LI_BRANCH_ID\",
      \"body\": $(echo "$LI_BODY" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))"),
      \"authoredBy\": \"agent\"
    }" > /dev/null 2>&1 && echo "LinkedIn draft created." || echo "LinkedIn draft failed."
  fi

  # Tweet thread
  echo "Creating Tweet thread branch..."
  TW_BRANCH_ID=$(npx convex run branches:create "{
    \"seedId\": \"$SOCIAL_SEED_ID\",
    \"brandId\": \"$BRAND_ID\",
    \"format\": \"tweet\"
  }" 2>&1 | python3 -c "import sys; print(sys.stdin.read().strip().strip('\"'))" 2>/dev/null || echo "")
  if [ -n "$TW_BRANCH_ID" ]; then
    TW_BODY=$(cat "$(dirname "$0")/social-fathers-day.md" | sed -n '/## Tweet Thread/,$ p' | head -30)
    npx convex run drafts:create "{
      \"branchId\": \"$TW_BRANCH_ID\",
      \"body\": $(echo "$TW_BODY" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))"),
      \"authoredBy\": \"agent\"
    }" > /dev/null 2>&1 && echo "Tweet draft created." || echo "Tweet draft failed."
  fi

fi

echo ""
echo "=== DONE ==="
echo ""
echo "Summary:"
echo "  Seeds created: 7"
echo "  Article: Father's Day (1500 words, blog format)"
echo "  Social drafts: Pinterest x5, Instagram, TikTok, LinkedIn, Tweet thread"
echo ""
echo "Next step: Review seeds in Sweet Heat dashboard, approve the ones you want, then publish."
