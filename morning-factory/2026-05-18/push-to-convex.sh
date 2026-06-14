#!/bin/bash
# Run this locally (not from cloud container) to push morning factory content to Convex
# Requires: CONVEX env vars set, brand ID for AlreadyLoved

set -e

BRAND_ID="${BRAND_ID:-}"
if [ -z "$BRAND_ID" ]; then
  echo "ERROR: Set BRAND_ID environment variable first."
  echo "Get it with: npx convex run brands:listActive"
  exit 1
fi

echo "Pushing seeds for brand $BRAND_ID..."

# Seed 01 — SEO: Baptism gifts
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Personalized children's books for baptism — gifts that name who they are\",
  \"description\": \"Parents searching for meaningful baptism gifts want something that lasts beyond the day. This post targets the long-tail 'personalized baptism gifts for kids' and positions AlreadyLoved books as identity-anchors, not just keepsakes.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"identity\",
  \"targetKeywords\": [\"personalized baptism gifts\", \"personalized children's books baptism\", \"baptism gift for baby\", \"christian personalized books for kids\"],
  \"targetFormats\": [\"blog\", \"pinterest\", \"instagram\"]
}"

# Seed 02 — AEO
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What do you say to a child who thinks they're not good enough?\",
  \"description\": \"An AEO-format answer for parents in the hard moment. Designed for featured snippets and AI citations.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"aeo\",
  \"contentPillar\": \"connection\",
  \"targetKeywords\": [\"what to say when your child says they're not good enough\", \"child low self esteem what to say\"],
  \"targetFormats\": [\"blog\", \"instagram\"]
}"

# Seed 03 — SEO: Bedtime affirmations
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Bedtime affirmations for toddlers that actually land\",
  \"description\": \"Not rote phrases but a reframe: what kids hear at night becomes their inner voice.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"belonging\",
  \"targetKeywords\": [\"bedtime affirmations for toddlers\", \"positive affirmations for kids at night\", \"what to say to kids before bed\"],
  \"targetFormats\": [\"blog\", \"pinterest\", \"instagram\", \"tiktok\"]
}"

# Seed 04 — Brand building
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Identity-first parenting: why belonging can't be something they earn\",
  \"description\": \"The brand-building essay. AlreadyLoved model in plain language.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"brand\",
  \"contentPillar\": \"identity\",
  \"targetKeywords\": [\"identity first parenting\", \"unconditional love parenting\", \"belonging before behavior\"],
  \"targetFormats\": [\"blog\", \"linkedin\"]
}"

# Seed 05 — Engagement (article already written)
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The morning I realized my daughter thought she had to earn my love\",
  \"description\": \"First-person narrative. A mom's moment of recognition — the small thing her daughter did that revealed a gap. Voice: Simmone.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"engagement\",
  \"contentPillar\": \"connection\",
  \"targetKeywords\": [\"earning love parenting\", \"unconditional love children\"],
  \"targetFormats\": [\"blog\", \"instagram\", \"pinterest\", \"tiktok\", \"linkedin\", \"tweet\"]
}"

# Seed 06 — Seasonal: Father's Day
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"A Father's Day gift that tells your child who they already are\",
  \"description\": \"Father's Day (June 21). A personalized AlreadyLoved book as a gift from dad to child.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seasonal\",
  \"contentPillar\": \"identity\",
  \"targetKeywords\": [\"fathers day gift from dad to child\", \"meaningful father's day gifts kids\", \"personalized book dad gift for child\"],
  \"targetFormats\": [\"blog\", \"pinterest\", \"instagram\"]
}"

# Seed 07 — SEO: End of school year
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Why your child acts out before school — and what they actually need\",
  \"description\": \"End-of-school-year anxiety framed not as behavior but as belonging question.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"contentPillar\": \"belonging\",
  \"targetKeywords\": [\"child acting out before school\", \"end of school year anxiety kids\", \"why kids act out\"],
  \"targetFormats\": [\"blog\", \"instagram\", \"tiktok\"]
}"

echo ""
echo "Done! 7 seeds created."
echo "Now go review them in Sweet Heat and approve the ones you want articles written for."
echo ""
echo "NOTE: Articles for seeds 03 and 05 are already written in:"
echo "  morning-factory/2026-05-18/articles/"
echo "  morning-factory/2026-05-18/social/"
echo ""
echo "To create branches + drafts for the pre-written articles after approving:"
echo "  SEED_03_ID=<id> SEED_05_ID=<id> bash push-drafts.sh"
