#!/bin/bash
# AlreadyLoved Morning Factory — Convex Push Script
# Run this from your local machine (requires Convex auth)
# Usage: BRAND_ID=<your-brand-id> bash push-to-convex.sh

set -e

BRAND_ID="${BRAND_ID:-}"
NOW=$(node -e "console.log(Date.now())")

if [ -z "$BRAND_ID" ]; then
  echo "ERROR: Set BRAND_ID env var first"
  echo "Usage: BRAND_ID=j57abc... bash push-to-convex.sh"
  exit 1
fi

echo "Pushing AlreadyLoved Morning Factory seeds to Convex..."
echo "Brand ID: $BRAND_ID"
echo ""

# ── SEED 1: SEO - Personalized Books Identity ──────────────────────────
echo "Creating seed 1/8..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The Best Personalized Children's Books That Actually Build Identity (Not Just Name-Drop)\",
  \"description\": \"Most personalized books just swap in a kid's name. This post explains what makes a truly identity-building book different — and why that matters more than parents realize. Targets parents searching for personalized books who want something with more meaning.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"caption_tiktok\", \"linkedin\", \"tweet\"],
  \"purpose\": \"seo\",
  \"contentPillar\": \"identity\",
  \"targetKeywords\": [\"personalized children's books\", \"best personalized books for kids\", \"personalized books that build confidence\"],
  \"reasoning\": \"High search volume — AlreadyLoved can win the quality layer by explaining the WHY behind identity-centered books.\",
  \"hookAngle\": \"IDENTITY\",
  \"templateType\": \"PROB\"
}"

# ── SEED 2: SEO - Bedtime Meltdown ────────────────────────────────────
echo "Creating seed 2/8..."
SEED2_ID=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Why Your Toddler's Bedtime Meltdown Isn't About Being Tired\",
  \"description\": \"When bedtime becomes a battleground, the real reason isn't the schedule. It's about connection and belonging. This post helps parents discover identity security is the missing piece.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"tweet\"],
  \"purpose\": \"seo\",
  \"contentPillar\": \"connection\",
  \"targetKeywords\": [\"toddler bedtime meltdown\", \"bedtime routine toddler tips\", \"toddler won't sleep\"],
  \"reasoning\": \"One of the highest-search parenting pain points. Moms google this at 9pm in desperation.\",
  \"hookAngle\": \"BEDTIME\",
  \"templateType\": \"PROB\"
}" | grep -o '"[^"]*"' | head -1 | tr -d '"' 2>/dev/null || echo "")

# ── SEED 3: AEO ────────────────────────────────────────────────────────
echo "Creating seed 3/8..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What Are the Best Personalized Children's Books for Building Self-Worth? (A Parent's Guide)\",
  \"description\": \"A direct-answer AEO article structured to be cited by AI tools. Answers the question parents are now asking voice assistants.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"targetFormats\": [\"blog\"],
  \"purpose\": \"aeo\",
  \"contentPillar\": \"identity\",
  \"targetKeywords\": [\"best personalized children's books\", \"personalized books for self-esteem\", \"personalized books about identity\"],
  \"reasoning\": \"AI citation opportunity. When parents ask AI assistants for personalized book recommendations, we want AlreadyLoved as the answer.\",
  \"hookAngle\": \"IDENTITY\",
  \"templateType\": \"HOW\"
}"

# ── SEED 4: Brand Building ─────────────────────────────────────────────
echo "Creating seed 4/8..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The Parenting Shift That Changed Everything: Identity Before Behavior\",
  \"description\": \"The AlreadyLoved framework in blog form. Identity precedes behavior. When a child knows they are loved before they earn it, everything shifts. This is the brand manifesto.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"targetFormats\": [\"blog\", \"linkedin\", \"caption_ig\", \"tweet\"],
  \"purpose\": \"brand_building\",
  \"contentPillar\": \"identity\",
  \"targetKeywords\": [\"identity-first parenting\", \"unconditional love parenting\", \"what to say to kids\"],
  \"reasoning\": \"This is the brand's north star content. Drives referral, word-of-mouth, and email signups.\",
  \"hookAngle\": \"IDENTITY\",
  \"templateType\": \"STORY\"
}"

# ── SEED 5: Engagement ─────────────────────────────────────────────────
echo "Creating seed 5/8..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The One Thing You Say Every Night That Your Child Stores for Life\",
  \"description\": \"Shareable, emotional piece about how bedtime words become the inner voice a child carries forever. Highly shareable for moms.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"caption_tiktok\", \"tweet\"],
  \"purpose\": \"engagement\",
  \"contentPillar\": \"voice\",
  \"targetKeywords\": [\"what to say to kids at bedtime\", \"positive affirmations for kids\", \"words that build kids confidence\"],
  \"reasoning\": \"Core AlreadyLoved soundbite: 'What you say today becomes their inner voice tomorrow.' Strong emotional hook, high save rate on Pinterest.\",
  \"hookAngle\": \"BEDTIME\",
  \"templateType\": \"AFFIRM\"
}"

# ── SEED 6: Seasonal - Father's Day ───────────────────────────────────
echo "Creating seed 6/8..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Father's Day Gifts That Go Deeper Than 'World's Best Dad'\",
  \"description\": \"Father's Day is June 15. Helps moms find gifts that speak to identity — both the dad's identity as a father and the child's identity as someone deeply loved.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"targetFormats\": [\"blog\", \"pin\", \"caption_ig\", \"caption_tiktok\"],
  \"purpose\": \"seo\",
  \"contentPillar\": \"gifts\",
  \"targetKeywords\": [\"father's day gifts from kids\", \"meaningful father's day gifts\", \"personalized father's day gifts\"],
  \"reasoning\": \"Father's Day is 14 days away. Peak search window. Personalized books are perfect Father's Day gifts.\",
  \"hookAngle\": \"GIFT\",
  \"templateType\": \"HOW\"
}"

# ── SEED 7: SEO - Baptism Gifts ────────────────────────────────────────
echo "Creating seed 7/8..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Why Personalized Baptism Gifts That Speak to Identity Matter More Than Ones That Just Look Pretty\",
  \"description\": \"For Christian families searching for baptism gifts. A personalized identity book outlasts any silver frame. Connects faith language with the AlreadyLoved brand message.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"targetFormats\": [\"blog\", \"pin\"],
  \"purpose\": \"seo\",
  \"contentPillar\": \"faith\",
  \"targetKeywords\": [\"personalized baptism gifts\", \"christian baptism gifts for babies\", \"baptism gifts with meaning\"],
  \"reasoning\": \"AlreadyLoved's message about being loved before earning it resonates deeply with Christian theology. Underserved content gap.\",
  \"hookAngle\": \"FAITH\",
  \"templateType\": \"PROB\"
}"

# ── SEED 8: Engagement - Inner Voice Moment ────────────────────────────
echo "Creating seed 8/8..."
npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The Moment I Knew I Was Parenting Her Inner Voice, Not Just Her Behavior\",
  \"description\": \"A personal, narrative-driven engagement piece — the moment a mom realized what she was saying to her daughter was becoming the voice her daughter would use to talk to herself.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"targetFormats\": [\"blog\", \"caption_ig\", \"linkedin\", \"tweet\"],
  \"purpose\": \"engagement\",
  \"contentPillar\": \"voice\",
  \"targetKeywords\": [\"parenting inner voice\", \"what to say to your child\", \"raising confident kids\"],
  \"reasoning\": \"Highest-resonance format for AlreadyLoved. The kind of post that gets screenshot and saved.\",
  \"hookAngle\": \"IDENTITY\",
  \"templateType\": \"STORY\"
}"

echo ""
echo "✅ All 8 seeds created. Review them in Sweet Heat and approve the ones you want developed."
echo ""
echo "Next: To create branches and drafts for approved seeds, run:"
echo "  BRAND_ID=$BRAND_ID bash create-drafts.sh"
