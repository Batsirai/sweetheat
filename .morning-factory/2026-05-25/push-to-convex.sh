#!/bin/bash
# Morning Factory Import Script — 2026-05-25
# Run this from the sweetheat repo root on a machine with Convex access
# Usage: BRAND_ID=<your-brand-id> bash .morning-factory/2026-05-25/push-to-convex.sh

set -e

BRAND_ID="${BRAND_ID:-}"

if [ -z "$BRAND_ID" ]; then
  echo "ERROR: Set BRAND_ID environment variable first"
  echo "Run: npx convex run brands:listActive  — then set the AlreadyLoved brand ID"
  exit 1
fi

echo "Pushing seeds for brand: $BRAND_ID"

# Seed 1: Baptism gifts (SEO)
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"best personalized baptism gifts for babies 2026\",
  \"description\": \"Parents searching for baptism gifts want something that lasts beyond the day. A personalized children's book with the child's name woven into a story of identity and belonging hits differently than a silver spoon—it plants a word into the child's inner life.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"morning_factory\",
  \"targetFormats\": [\"blog\", \"pin\", \"ig\"],
  \"purpose\": \"seo\",
  \"contentPillar\": \"identity\",
  \"targetKeywords\": [\"personalized baptism gifts\", \"baptism gift ideas baby\", \"personalized baby gift 2026\", \"meaningful baptism gifts\"],
  \"reasoning\": \"High-intent search. Parents preparing for baptism are in a gifting mindset. AlreadyLoved books are ideal—identity-based, faith-adjacent, lasting.\",
  \"hookAngle\": \"Most baptism gifts collect dust. This one becomes part of how they see themselves.\",
  \"templateType\": \"seo_product\"
}"

echo "✓ Seed 1: baptism gifts"

# Seed 2: Toddler left out (SEO)
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"how to help a toddler who feels left out\",
  \"description\": \"Toddlers hit a developmental moment around age 3-4 when they notice other kids, compare, and sometimes fall apart. What if the answer isn't a strategy—it's a word? 'You are already chosen. Already enough. Already loved.'\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"morning_factory\",
  \"targetFormats\": [\"blog\", \"pin\", \"ig\", \"tiktok\"],
  \"purpose\": \"seo\",
  \"contentPillar\": \"belonging\",
  \"targetKeywords\": [\"toddler feels left out\", \"toddler social struggles\", \"how to help toddler with feelings\", \"toddler belonging\"],
  \"reasoning\": \"High-volume parenting search. Connects directly to AlreadyLoved's core belief: identity before behavior. Drives emotional resonance and shares.\",
  \"hookAngle\": \"The reason your toddler keeps asking 'Do you love me?' isn't insecurity. It's a question they were made to ask.\",
  \"templateType\": \"seo_parenting\"
}"

echo "✓ Seed 2: toddler left out"

# Seed 3: AEO — what do personalized books teach
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What do personalized children's books actually teach kids?\",
  \"description\": \"Answer-engine seed. Direct Q&A format for AI citation and featured snippets. Answer: 'Personalized children's books teach kids that they belong in stories—literally and emotionally. When a child sees their name in a narrative of love and purpose, it shapes their internal script before the world can write one for them.'\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"morning_factory\",
  \"targetFormats\": [\"blog\", \"pin\"],
  \"purpose\": \"aeo\",
  \"contentPillar\": \"identity\",
  \"targetKeywords\": [\"what do personalized children's books teach\", \"personalized books for kids benefits\", \"why personalized books matter\"],
  \"reasoning\": \"AEO target for AI assistants and Google featured snippets.\",
  \"hookAngle\": \"They don't just entertain. They write the first draft of a child's inner voice.\",
  \"templateType\": \"aeo_qa\"
}"

echo "✓ Seed 3: AEO personalized books"

# Seed 4: Brand essay — love is not a performance review
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The love a child earns is not love. It's a performance review.\",
  \"description\": \"Brand-building piece. The core AlreadyLoved philosophy in its sharpest form. What happens when kids grow up trying to earn love? What does it do to their nervous system, their relationships, their inner critic?\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"morning_factory\",
  \"targetFormats\": [\"blog\", \"ig\", \"linkedin\"],
  \"purpose\": \"brand_building\",
  \"contentPillar\": \"identity\",
  \"targetKeywords\": [\"unconditional love children\", \"parenting identity before behavior\", \"children's self worth\"],
  \"reasoning\": \"Manifesto piece. Builds trust, deepens community, attracts parents who feel this deeply.\",
  \"hookAngle\": \"We call it love, but if it comes with conditions, it's really just feedback.\",
  \"templateType\": \"brand_essay\"
}"

echo "✓ Seed 4: brand essay"

# Seed 5: Engagement — bedtime wrong thing
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"I said the wrong thing to my kid at bedtime. Here's what I wish I'd said instead.\",
  \"description\": \"Engagement seed. Real, relatable, low-guilt. A mom moment where we said 'good job' when we meant 'I love who you are.' The science of bedtime words.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"morning_factory\",
  \"targetFormats\": [\"blog\", \"ig\", \"tiktok\", \"pin\"],
  \"purpose\": \"engagement\",
  \"contentPillar\": \"connection\",
  \"targetKeywords\": [\"what to say to your child at bedtime\", \"bedtime affirmations for kids\", \"words that build self worth in children\"],
  \"reasoning\": \"The 'I got it wrong' frame disarms and draws in. Every parent has this moment.\",
  \"hookAngle\": \"I told my daughter 'good job.' She needed 'you are already loved.' They sound similar. They land in completely different places.\",
  \"templateType\": \"engagement_story\"
}"

echo "✓ Seed 5: engagement story"

# Seed 6: Father's Day seasonal
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The Father's Day gift that speaks after you're gone from the room\",
  \"description\": \"Seasonal seed for Father's Day (June 15, 2026). A personalized book is the dad's voice in a form that lasts.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"morning_factory\",
  \"targetFormats\": [\"blog\", \"pin\", \"ig\", \"tiktok\"],
  \"purpose\": \"seasonal\",
  \"contentPillar\": \"connection\",
  \"targetKeywords\": [\"unique father's day gifts 2026\", \"personalized father's day gift\", \"meaningful gift from dad to child\", \"father's day gift ideas from baby\"],
  \"reasoning\": \"Father's Day is June 15—3 weeks away. Right window to publish.\",
  \"hookAngle\": \"What if the best thing a dad can give isn't something—it's a word that lives in their child's chest long after the room goes quiet?\",
  \"templateType\": \"seasonal_product\"
}"

echo "✓ Seed 6: Father's Day seasonal"

echo ""
echo "==================================="
echo "All 6 seeds pushed to Convex!"
echo ""
echo "NEXT STEPS:"
echo "1. Review seeds in Sweet Heat UI"
echo "2. Approve the ones you want published"
echo "3. Re-run the morning factory to pick up approved seeds and create branches/drafts"
echo "==================================="
echo ""
echo "Article files ready to push as drafts:"
echo "  .morning-factory/2026-05-25/article-fathers-day.md"
echo "  .morning-factory/2026-05-25/article-toddler-left-out.md"
echo "  .morning-factory/2026-05-25/article-love-performance-review.md"
echo ""
echo "To create branches and drafts from articles, you'll need to:"
echo "1. Get the seedId from the seeds you approved"
echo "2. Run: npx convex run branches:create '{\"seedId\": \"SEED_ID\", \"brandId\": \"BRAND_ID\", \"format\": \"blog\"}'"
echo "3. Run: npx convex run drafts:create '{\"branchId\": \"BRANCH_ID\", \"body\": \"...\", \"authoredBy\": \"morning_factory\"}'"
