#!/bin/bash
# Morning Factory — Convex submission script
# Generated: 2026-04-23
# Run this from /home/user/sweetheat when Convex network is accessible
#
# USAGE:
#   BRAND_ID=<your-brand-id> bash factory-output/2026-04-23/run-convex-submit.sh
#
# Get your brand ID first:
#   npx convex run brands:listActive

set -e

if [ -z "$BRAND_ID" ]; then
  echo "ERROR: BRAND_ID is required. Run: npx convex run brands:listActive first."
  echo "Then: BRAND_ID=<id> bash factory-output/2026-04-23/run-convex-submit.sh"
  exit 1
fi

echo "=== AlreadyLoved Morning Factory — Convex Submission ==="
echo "Brand ID: $BRAND_ID"
echo "Date: 2026-04-23"
echo ""

# ─────────────────────────────────────────────────────────────
# PHASE 1: SEEDS
# ─────────────────────────────────────────────────────────────
echo "--- Submitting Seeds ---"

echo "Seed 1: Bedtime inner voice (SEO)"
SEED1=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The One Thing You Say at Bedtime That Shapes Who Your Child Becomes\",
  \"description\": \"Research on inner voice formation shows that the words a parent repeats at night become the sentences a child hears in their own head at 25. This article unpacks the science gently and gives parents one simple ritual: say their child's name, say who they are.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"morning-factory\",
  \"targetFormats\": [\"blog\", \"pin\", \"instagram\", \"tiktok\"],
  \"purpose\": \"seo-traffic\",
  \"contentPillar\": \"identity-first-parenting\",
  \"targetKeywords\": [\"bedtime routine toddler\", \"positive affirmations for kids\", \"children's self-esteem bedtime\", \"what to say to kids at night\"],
  \"reasoning\": \"High search volume, evergreen, deeply aligned with brand model. Positions AlreadyLoved books as the artifact of this bedtime ritual.\",
  \"hookAngle\": \"The sentence you say at 8pm becomes their inner voice at 35.\",
  \"templateType\": \"insight-reveal\"
}")
echo "  Created: $SEED1"

echo "Seed 2: Personalized books differentiation (SEO)"
SEED2=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Personalized Books That Actually Know Your Child (Not Just Their Name)\",
  \"description\": \"Most personalized kids books just swap in a name. AlreadyLoved goes deeper — weaving identity, belonging, and the child's actual character into the story. This article explains why name-in-a-book is nice, but name-in-a-story-about-who-you-are is transformative.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"morning-factory\",
  \"targetFormats\": [\"blog\", \"pin\", \"instagram\", \"linkedin\"],
  \"purpose\": \"seo-traffic\",
  \"contentPillar\": \"personalized-books\",
  \"targetKeywords\": [\"personalized children's books\", \"best personalized books for kids\", \"custom story books for children\", \"personalized birthday books\"],
  \"reasoning\": \"Directly commercial keyword. Article educates and positions AlreadyLoved above commodity personalization competitors.\",
  \"hookAngle\": \"There's a difference between a book with your child's name and a book that knows your child.\",
  \"templateType\": \"comparison-reveal\"
}")
echo "  Created: $SEED2"

echo "Seed 3: AEO best personalized books"
SEED3=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What Are the Best Personalized Children's Books? What Parents and Child Development Experts Actually Say\",
  \"description\": \"Structured Q&A article optimized for AI citation and featured snippets. Answers: What makes a personalized book good for a child? Which personalized children's books are worth buying? What should I look for? Includes direct answer in first 50 words, expert quote, and comparison table.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"morning-factory\",
  \"targetFormats\": [\"blog\"],
  \"purpose\": \"aeo-citation\",
  \"contentPillar\": \"personalized-books\",
  \"targetKeywords\": [\"best personalized children's books\", \"personalized books for toddlers\", \"custom books for kids\", \"are personalized books good for children\"],
  \"reasoning\": \"AI search (ChatGPT, Gemini, Perplexity) is now a major discovery channel. Getting cited for 'best personalized children's books' is high-value.\",
  \"hookAngle\": \"The best personalized children's book isn't the one with the prettiest cover — it's the one that tells a child who they already are.\",
  \"templateType\": \"qa-reference\"
}")
echo "  Created: $SEED3"

echo "Seed 4: Brand manifesto — identity before behavior"
SEED4=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"You Are Not Raising a Behavior. You Are Raising a Person.\",
  \"description\": \"A brand manifesto piece about identity-first parenting. The world teaches children to earn love through performance. AlreadyLoved exists as a counterweight. This piece names the pressure parents feel, names what children feel when they sense love is conditional, and invites a different way.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"morning-factory\",
  \"targetFormats\": [\"blog\", \"instagram\", \"linkedin\", \"tweet-thread\"],
  \"purpose\": \"brand-building\",
  \"contentPillar\": \"identity-first-parenting\",
  \"targetKeywords\": [\"identity first parenting\", \"unconditional love parenting\", \"raising confident kids\", \"positive parenting philosophy\"],
  \"reasoning\": \"This is the AlreadyLoved worldview, stated plainly. Builds audience who feel this deeply. Highest share potential. Anchors brand differentiation.\",
  \"hookAngle\": \"When kids don't know they're already loved, the world teaches them to earn it.\",
  \"templateType\": \"manifesto\"
}")
echo "  Created: $SEED4"

echo "Seed 5: Engagement — inner voice at 35 (ARTICLE WRITTEN)"
SEED5=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The Thing My Mom Said That I Still Hear in My Head at 35\",
  \"description\": \"First-person emotional piece about the voice we carry from childhood. Personal, vulnerable, deeply shareable. Uses the frame of one specific sentence a parent said — and how it lives on decades later. Ends with: what are you saying to your child that they will still hear in thirty years?\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"morning-factory\",
  \"targetFormats\": [\"blog\", \"instagram\", \"tiktok\", \"tweet-thread\"],
  \"purpose\": \"engagement-sharing\",
  \"contentPillar\": \"inner-voice\",
  \"targetKeywords\": [\"what parents say to kids\", \"inner voice childhood\", \"mom quotes children\", \"things parents say\"],
  \"reasoning\": \"Highest emotional resonance. Will be shared by parents who see themselves and by adult children who carry voices. Viral potential on Instagram and TikTok.\",
  \"hookAngle\": \"Your words don't disappear when bedtime ends. They move in.\",
  \"templateType\": \"personal-story\"
}")
echo "  Created: $SEED5"

echo "Seed 6: Seasonal — Mother's Day gift (ARTICLE WRITTEN)"
SEED6=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The Mother's Day Gift That Keeps Speaking After the Day Is Over\",
  \"description\": \"Mother's Day is May 11. This article targets both gifters and moms who want something meaningful for their children. Frames AlreadyLoved books as a gift that speaks the mother's love in the child's language — a story that says you were wanted, you are known, you belong.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"morning-factory\",
  \"targetFormats\": [\"blog\", \"pin\", \"instagram\", \"tiktok\"],
  \"purpose\": \"seasonal-seo\",
  \"contentPillar\": \"gift-giving\",
  \"targetKeywords\": [\"mother's day gifts for new moms\", \"meaningful mother's day gift\", \"personalized gift mother's day\", \"mother's day gift ideas 2026\", \"gift for mom from toddler\"],
  \"reasoning\": \"Mother's Day is 18 days away. Peak search window is NOW through May 8. Highest-urgency content this week.\",
  \"hookAngle\": \"Flowers fade. Cards get recycled. A story your child hears about who they are? That stays.\",
  \"templateType\": \"gift-guide-story\"
}")
echo "  Created: $SEED6"

echo "Seed 7: Baptism gifts (SEO)"
SEED7=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Baptism Gifts That Tell a Child Their Story Before They Can Write It\",
  \"description\": \"Parents and godparents searching for baptism gifts want something meaningful, not just decorative. This article walks through why a personalized book that speaks identity and belonging is the deepest gift a baptism can hold — giving words to the blessing before the child is old enough to understand it.\",
  \"source\": \"morning-factory\",
  \"pitchedBy\": \"morning-factory\",
  \"targetFormats\": [\"blog\", \"pin\", \"instagram\"],
  \"purpose\": \"seo-traffic\",
  \"contentPillar\": \"gift-giving\",
  \"targetKeywords\": [\"personalized baptism gifts\", \"christian books for kids\", \"baptism gift ideas baby\", \"meaningful baptism gift\", \"personalized christening gift\"],
  \"reasoning\": \"High purchase-intent keyword. Parents searching for baptism gifts are ready to buy. Spring is peak baptism season.\",
  \"hookAngle\": \"A baptism is a family saying: you belong. A book can say it every night for years.\",
  \"templateType\": \"gift-guide-story\"
}")
echo "  Created: $SEED7"

echo ""
echo "Seeds submitted. IDs:"
echo "  SEED5 (inner voice article): $SEED5"
echo "  SEED6 (Mother's Day article): $SEED6"
echo ""

# ─────────────────────────────────────────────────────────────
# PHASE 2: ARTICLES — Create branches + drafts for written articles
# ─────────────────────────────────────────────────────────────
echo "--- Submitting Articles ---"

# Article 1: Inner Voice
echo "Creating branch for Seed 5 (inner voice)..."
BRANCH1=$(npx convex run branches:create "{
  \"seedId\": \"$SEED5\",
  \"brandId\": \"$BRAND_ID\",
  \"format\": \"blog\"
}")
echo "  Branch created: $BRANCH1"

ARTICLE1=$(cat factory-output/2026-04-23/articles/article-1-inner-voice.md)
echo "Creating draft for article 1..."
npx convex run drafts:create "{
  \"branchId\": \"$BRANCH1\",
  \"body\": $(echo "$ARTICLE1" | jq -Rs .),
  \"authoredBy\": \"morning-factory\"
}"
echo "  Draft saved."

# Article 2: Mother's Day
echo "Creating branch for Seed 6 (Mother's Day)..."
BRANCH2=$(npx convex run branches:create "{
  \"seedId\": \"$SEED6\",
  \"brandId\": \"$BRAND_ID\",
  \"format\": \"blog\"
}")
echo "  Branch created: $BRANCH2"

ARTICLE2=$(cat factory-output/2026-04-23/articles/article-2-mothers-day.md)
echo "Creating draft for article 2..."
npx convex run drafts:create "{
  \"branchId\": \"$BRANCH2\",
  \"body\": $(echo "$ARTICLE2" | jq -Rs .),
  \"authoredBy\": \"morning-factory\"
}"
echo "  Draft saved."

# ─────────────────────────────────────────────────────────────
# PHASE 3: SOCIAL COPY — One branch+draft per format per article
# ─────────────────────────────────────────────────────────────
echo "--- Submitting Social Copy ---"

for FORMAT in pin instagram tiktok linkedin tweet-thread; do
  echo "  Social [$FORMAT] for article 1..."
  SOCIAL_BRANCH=$(npx convex run branches:create "{
    \"seedId\": \"$SEED5\",
    \"brandId\": \"$BRAND_ID\",
    \"format\": \"$FORMAT\"
  }")
  SOCIAL_BODY="See social copy file: factory-output/2026-04-23/social/social-article-1-inner-voice.md — Format: $FORMAT"
  npx convex run drafts:create "{
    \"branchId\": \"$SOCIAL_BRANCH\",
    \"body\": $(echo "$SOCIAL_BODY" | jq -Rs .),
    \"authoredBy\": \"morning-factory\"
  }" > /dev/null
done

for FORMAT in pin instagram tiktok linkedin tweet-thread; do
  echo "  Social [$FORMAT] for article 2..."
  SOCIAL_BRANCH=$(npx convex run branches:create "{
    \"seedId\": \"$SEED6\",
    \"brandId\": \"$BRAND_ID\",
    \"format\": \"$FORMAT\"
  }")
  SOCIAL_BODY="See social copy file: factory-output/2026-04-23/social/social-article-2-mothers-day.md — Format: $FORMAT"
  npx convex run drafts:create "{
    \"branchId\": \"$SOCIAL_BRANCH\",
    \"body\": $(echo "$SOCIAL_BODY" | jq -Rs .),
    \"authoredBy\": \"morning-factory\"
  }" > /dev/null
done

# ─────────────────────────────────────────────────────────────
# PHASE 4: SLACK REPORT
# ─────────────────────────────────────────────────────────────
echo "--- Sending Slack Report ---"
if [ -z "$SLACK_WEBHOOK_URL" ]; then
  echo "  SLACK_WEBHOOK_URL not set — skipping Slack report."
else
curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"*Morning Factory Report — 2026-04-23*\n\nSeeds pitched: 7\nArticles written: 2\nSocial posts drafted: 10 (pin x5, IG, TikTok, LinkedIn, tweet thread × 2 articles)\n\n*Seeds:*\n• Bedtime inner voice (SEO)\n• Personalized books differentiation (SEO)\n• Best personalized books Q&A (AEO)\n• Identity-first parenting manifesto (Brand)\n• The thing my mom said at 35 (Engagement) ← ARTICLE READY\n• Mother's Day gift that keeps speaking (Seasonal 🎀) ← ARTICLE READY\n• Baptism gifts (SEO)\n\n*Priority note:* Mother's Day is May 11 — 18 days out. Article 2 is ready to publish ASAP.\n\n<@U0A9H1R97RT> <@U0A9517L831> Review seeds and drafts in Sweet Heat.\"}"
fi

echo ""
echo "=== Submission complete ==="
