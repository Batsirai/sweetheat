#!/usr/bin/env bash
# Morning Factory Import — 2026-05-21
# Run this from /home/user/sweetheat after setting BRAND_ID
# Usage: BRAND_ID="your_brand_id_here" bash morning-factory/2026-05-21/import-to-convex.sh

set -e

if [ -z "$BRAND_ID" ]; then
  echo "Error: BRAND_ID is required. Run: BRAND_ID='jx...' bash $0"
  echo ""
  echo "To find your brand ID: npx convex run brands:listActive"
  exit 1
fi

DIR="$(cd "$(dirname "$0")" && pwd)"
echo "=== AlreadyLoved Morning Factory Import — $(date) ==="
echo "Brand ID: $BRAND_ID"
echo ""

# ── PHASE 1: SEEDS ──────────────────────────────────────────────────────────

echo "Creating seeds..."

SEED_1=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Personalized Father's Day Books for Kids: The Gift That Keeps Saying His Name\",
  \"description\": \"Targets parents searching for meaningful Father's Day gifts — specifically the search space around personalized books for kids. Anchors AlreadyLoved as the answer to 'I want something he'll actually remember.'\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"targetFormats\": [\"blog\", \"pin\"],
  \"targetKeywords\": [\"personalized father's day gifts for kids\", \"personalized children's books father's day\", \"unique father's day gifts from toddler\", \"gifts dad will treasure from baby\"],
  \"reasoning\": \"Father's Day is June 15 — 25 days out. This is peak search season. AlreadyLoved books center the CHILD, not the transaction. Strong purchase intent + brand mission alignment.\",
  \"hookAngle\": \"GIFT\",
  \"templateType\": \"STORY\"
}" 2>&1)
echo "Seed 1 (SEO - Father's Day): $SEED_1"

SEED_2=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Why Kids With Strong Identity Cry Less and Listen More (Without You Doing Anything 'Extra')\",
  \"description\": \"Long-tail SEO for exhausted parents searching how to raise a confident child. Positions identity-first parenting as the quieter, gentler path — not a new method, but a way of seeing.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"seo\",
  \"targetFormats\": [\"blog\", \"pin\"],
  \"targetKeywords\": [\"how to raise a confident child\", \"why is my toddler so clingy\", \"identity first parenting\", \"child behavior rooted in identity\"],
  \"reasoning\": \"High search volume, low competition angle. Parents search behavioral symptoms — we give them the root.\",
  \"hookAngle\": \"IDENTITY\",
  \"templateType\": \"PROB\"
}" 2>&1)
echo "Seed 2 (SEO - Identity/Behavior): $SEED_2"

SEED_3=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"What Are the Best Personalized Children's Books That Build Self-Esteem?\",
  \"description\": \"AEO-formatted article written to be cited by AI assistants when someone asks about personalized books for kids. Direct answer in first paragraph. Structured for featured snippets and AI citations.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"aeo\",
  \"targetFormats\": [\"blog\"],
  \"targetKeywords\": [\"best personalized children's books\", \"personalized books that build self-esteem\", \"children's books with child's name\"],
  \"reasoning\": \"AI citation plays are becoming top-of-funnel for discovery. Positions AlreadyLoved as the authority, not just a shop.\",
  \"hookAngle\": \"GIFT\",
  \"templateType\": \"HOW\"
}" 2>&1)
echo "Seed 3 (AEO): $SEED_3"

SEED_4=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The Sentence That Became My Daughter's Inner Voice\",
  \"description\": \"Brand-building essay: the things we say in small moments — at bedtime, after a hard day — become the voice children carry inside themselves for decades. Not a parenting tip. A reminder of what's already happening.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"brand_building\",
  \"targetFormats\": [\"blog\", \"caption_ig\", \"linkedin\"],
  \"targetKeywords\": [\"what to say to your child every day\", \"words that shape children\", \"identity first parenting\"],
  \"reasoning\": \"Core brand voice piece. The AlreadyLoved thesis in narrative form. Deep resonance, high shareability.\",
  \"hookAngle\": \"IDENTITY\",
  \"templateType\": \"STORY\"
}" 2>&1)
echo "Seed 4 (Brand Building): $SEED_4"

SEED_5=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"The Night I Realized I Was Teaching My Son to Earn Love\",
  \"description\": \"Vulnerable, relatable mom-moment essay. The quiet realization that 'good job' and 'I'm proud of you when you...' are accidentally performance-conditional. Not about blame — about the moment and what comes next.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"engagement\",
  \"targetFormats\": [\"blog\", \"caption_ig\", \"tweet\"],
  \"targetKeywords\": [\"conditional love without realizing\", \"am I raising my child right\", \"unconditional love parenting\"],
  \"reasoning\": \"Highest engagement potential. Mirror moment — parent feels understood not judged. Will generate saves, shares, comments.\",
  \"hookAngle\": \"IDENTITY\",
  \"templateType\": \"STORY\"
}" 2>&1)
echo "Seed 5 (Engagement): $SEED_5"

SEED_6=$(npx convex run seeds:create "{
  \"brandId\": \"$BRAND_ID\",
  \"title\": \"Dad, This Book Has Your Kid's Name In It — And That's the Point\",
  \"description\": \"Father's Day social-first campaign seed. Short, punchy, and shareable. Positions the book not as a product but as a moment: the first time a child sees their name in a story.\",
  \"source\": \"agent_research\",
  \"pitchedBy\": \"agent\",
  \"purpose\": \"engagement\",
  \"targetFormats\": [\"caption_ig\", \"caption_tiktok\", \"pin\"],
  \"targetKeywords\": [\"father's day gift ideas 2026\", \"gifts from kids to dad\", \"personalized gift for dad from baby\"],
  \"reasoning\": \"Seasonal social content for Father's Day. Dads will share it. Moms will buy it.\",
  \"hookAngle\": \"GIFT\",
  \"templateType\": \"AFFIRM\"
}" 2>&1)
echo "Seed 6 (Seasonal/Father's Day Social): $SEED_6"

echo ""
echo "=== Seeds created. Review in Sweet Heat and approve before running Phase 2. ==="
echo ""

# ── PHASE 2: ARTICLES (run after seeds are approved) ────────────────────────
# Uncomment after getting SEED_IDs for approved seeds

# ARTICLE_SEED_ID="<REPLACE WITH APPROVED SEED ID FOR FATHERS DAY ARTICLE>"
# ARTICLE_2_SEED_ID="<REPLACE WITH APPROVED SEED ID FOR INNER VOICE ARTICLE>"
#
# echo "Creating branches and drafts for approved seeds..."
#
# BRANCH_1=$(npx convex run branches:create "{
#   \"seedId\": \"$ARTICLE_SEED_ID\",
#   \"brandId\": \"$BRAND_ID\",
#   \"format\": \"blog\"
# }" 2>&1)
# echo "Branch 1: $BRANCH_1"
#
# Then create drafts for each branch using drafts:create with body from article files

echo "Done. Check morning-factory/2026-05-21/ for article and social copy files."
echo "Once seeds are approved, get their IDs and run the Phase 2 section of this script."
