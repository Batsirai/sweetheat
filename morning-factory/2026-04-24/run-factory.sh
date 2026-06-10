#!/bin/bash
# AlreadyLoved Morning Factory — 2026-04-24
# Run this script once network access to Convex is available.
# Requires: BRAND_ID for AlreadyLoved set as env var or replace inline below.
# Usage: BRAND_ID=<id> bash run-factory.sh

set -e

if [ -z "$BRAND_ID" ]; then
  echo "ERROR: Set BRAND_ID env var before running."
  echo "  export BRAND_ID=<convex brand id>"
  echo "  Then re-run: bash run-factory.sh"
  exit 1
fi

CONVEX_DEPLOY_KEY="${CONVEX_DEPLOY_KEY:?CONVEX_DEPLOY_KEY env var is required}"
export CONVEX_DEPLOY_KEY

echo "=== PHASE 1: Creating Seeds ==="

echo "[1/6] Seed: bedtime affirmations (SEO)"
SEED1=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What to say to your child at bedtime (that they'll carry forever)\",
  \"description\": \"SEO-targeted piece around bedtime affirmations for kids. Reframes bedtime routine from logistics to identity reinforcement. Surfaces research on how the last words before sleep become inner voice.\",
  \"source\": \"agent\",
  \"pitchedBy\": \"morning-factory\",
  \"purpose\": \"SEO traffic\",
  \"contentPillar\": \"identity-first parenting\",
  \"targetKeywords\": [\"bedtime affirmations for kids\", \"what to say to children at bedtime\", \"bedtime routine toddler words\", \"positive things to say to your child\"],
  \"reasoning\": \"High-volume long-tail keywords. Bedtime is the exact moment parents are most open to this message.\",
  \"hookAngle\": \"The words you say right before they close their eyes go somewhere.\",
  \"templateType\": \"how-to-reframe\"
}")
echo "  Created: $SEED1"

echo "[2/6] Seed: personalized books comparison (SEO)"
SEED2=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The best personalized books for toddlers (that actually build confidence, not just spell their name)\",
  \"description\": \"SEO comparison piece targeting personalized books for toddlers. Differentiates AlreadyLoved by surfacing the identity layer vs surface-level name-in-book products.\",
  \"source\": \"agent\",
  \"pitchedBy\": \"morning-factory\",
  \"purpose\": \"SEO + conversion\",
  \"contentPillar\": \"product education\",
  \"targetKeywords\": [\"personalized books for toddlers\", \"best personalized children's books\", \"custom books for kids self esteem\"],
  \"hookAngle\": \"Most personalized books just drop a name in. This one weaves who your child is into the story itself.\",
  \"templateType\": \"category-review\"
}")
echo "  Created: $SEED2"

echo "[3/6] Seed: AEO self-esteem question"
SEED3=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What is the best gift for a child's self-esteem? (The answer isn't what you'd expect)\",
  \"description\": \"AEO-optimized Q&A article designed for AI citation and featured snippets. Direct answer in first paragraph. Pulls in child development research on narrative identity.\",
  \"source\": \"agent\",
  \"pitchedBy\": \"morning-factory\",
  \"purpose\": \"AEO — AI search citation\",
  \"contentPillar\": \"identity-first parenting\",
  \"targetKeywords\": [\"best gift for child's self esteem\", \"how to build a child's confidence\", \"what boosts self esteem in toddlers\"],
  \"hookAngle\": \"The answer isn't a toy or a class. It's a story — specifically, a story about them.\",
  \"templateType\": \"AEO-direct-answer\"
}")
echo "  Created: $SEED3"

echo "[4/6] Seed: brand building (identity precedes behavior)"
SEED4=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Your child is not trying to earn your love. They're trying to find out if they already have it.\",
  \"description\": \"Brand-building think piece. The core AlreadyLoved thesis made tangible through a scene most parents recognize. Reveals behavior as a question, not defiance.\",
  \"source\": \"agent\",
  \"pitchedBy\": \"morning-factory\",
  \"purpose\": \"brand building + shareability\",
  \"contentPillar\": \"identity-first parenting\",
  \"targetKeywords\": [\"child acting out love\", \"why kids misbehave identity\", \"identity before behavior parenting\"],
  \"hookAngle\": \"When your child is at their worst, they're actually asking their most important question.\",
  \"templateType\": \"revelation-essay\"
}")
echo "  Created: $SEED4"

echo "[5/6] Seed: Mother's Day engagement"
SEED5=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The thing every mom wants to give her kids — and forgets she already has\",
  \"description\": \"Engagement-first piece for Mother's Day lead-up (May 11). Written for moms reading late at night, already doubting themselves. High share potential in mom Facebook groups and Pinterest.\",
  \"source\": \"agent\",
  \"pitchedBy\": \"morning-factory\",
  \"purpose\": \"engagement + seasonal lift\",
  \"contentPillar\": \"maternal identity\",
  \"targetKeywords\": [\"am I a good enough mom\", \"what do kids really need from mom\", \"Mother's Day meaningful gift kids\"],
  \"hookAngle\": \"Most moms I know are trying to give their kids confidence. They just don't know they're already the source of it.\",
  \"templateType\": \"personal-revelation\"
}")
echo "  Created: $SEED5"

echo "[6/6] Seed: Mother's Day gift guide (SEO + seasonal)"
SEED6=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"A Mother's Day gift that says what you've been trying to say all year\",
  \"description\": \"Seasonal SEO seed targeting Mother's Day gifting searches. Framed as a gift guide but written as a story. Targets grandparents, partners, and moms buying for themselves.\",
  \"source\": \"agent\",
  \"pitchedBy\": \"morning-factory\",
  \"purpose\": \"SEO + seasonal conversion\",
  \"contentPillar\": \"gifting\",
  \"targetKeywords\": [\"Mother's Day gift ideas personalized\", \"meaningful Mother's Day gift for kids to give\", \"personalized gift for new mom\"],
  \"hookAngle\": \"Not another candle. The gift that actually says what your family means.\",
  \"templateType\": \"gift-guide-story\"
}")
echo "  Created: $SEED6"

echo ""
echo "=== PHASE 2: Creating Branches + Drafts for Two Written Articles ==="

echo "Creating blog branch for brand-building article..."
BRANCH1=$(npx convex run branches:create "{
  \"seedId\": \"$SEED4\",
  \"brandId\": \"$BRAND_ID\",
  \"format\": \"blog\"
}")
echo "  Branch created: $BRANCH1"

ARTICLE1=$(cat "$(dirname "$0")/article-brand-building.md")
npx convex run drafts:create "{
  \"branchId\": \"$BRANCH1\",
  \"body\": $(echo "$ARTICLE1" | jq -Rs .),
  \"authoredBy\": \"morning-factory\"
}"
echo "  Draft saved."

echo "Creating blog branch for Mother's Day article..."
BRANCH2=$(npx convex run branches:create "{
  \"seedId\": \"$SEED5\",
  \"brandId\": \"$BRAND_ID\",
  \"format\": \"blog\"
}")
echo "  Branch created: $BRANCH2"

ARTICLE2=$(cat "$(dirname "$0")/article-mothers-day.md")
npx convex run drafts:create "{
  \"branchId\": \"$BRANCH2\",
  \"body\": $(echo "$ARTICLE2" | jq -Rs .),
  \"authoredBy\": \"morning-factory\"
}"
echo "  Draft saved."

echo ""
echo "=== PHASE 3: Creating Social Copy Drafts ==="

for FORMAT in pinterest-1 pinterest-2 pinterest-3 pinterest-4 pinterest-5 instagram tiktok linkedin tweet-thread; do
  BRANCH=$(npx convex run branches:create "{
    \"seedId\": \"$SEED4\",
    \"brandId\": \"$BRAND_ID\",
    \"format\": \"$FORMAT\"
  }")
  echo "  Social branch ($FORMAT) for brand-building: $BRANCH"
done

for FORMAT in pinterest-1 pinterest-2 pinterest-3 pinterest-4 pinterest-5 instagram tiktok linkedin tweet-thread; do
  BRANCH=$(npx convex run branches:create "{
    \"seedId\": \"$SEED5\",
    \"brandId\": \"$BRAND_ID\",
    \"format\": \"$FORMAT\"
  }")
  echo "  Social branch ($FORMAT) for Mother's Day: $BRANCH"
done

echo ""
echo "=== ALL DONE ==="
echo "Seeds pitched: 6"
echo "Articles written: 2 (brand-building + Mother's Day)"
echo "Social branches created: 18 (9 per article)"
echo ""
echo "Next: Approve seeds in Sweet Heat dashboard, then review drafts."
