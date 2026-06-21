#!/bin/bash
# Run this once network is available to send the Slack morning report.
# Set SLACK_WEBHOOK_URL in your environment before running:
#   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:?SLACK_WEBHOOK_URL env var is required}"

curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "*Morning Factory Report — AlreadyLoved — Apr 24, 2026*\n\n*Seeds pitched:* 6\n• Bedtime affirmations (SEO)\n• Best personalized books for toddlers (SEO)\n• Best gift for child self-esteem (AEO)\n• Your child is not earning your love — brand building ✍️ *article written*\n• The thing every mom already has — Mother'\''s Day engagement ✍️ *article written*\n• Mother'\''s Day gift that says what you mean (SEO seasonal)\n\n*Articles written:* 2\n*Social posts drafted:* 18\nFormats: blog × 2, pin × 5, IG, TikTok, LinkedIn, tweet thread — per article\n\n*Seasonal flag 🚨:* Mother'\''s Day is May 11 — 17 days out. Approve + publish Mother'\''s Day seeds in the next 3–4 days to get indexing time.\n\n*Action needed:* Convex was unreachable this run. All content is staged in `morning-factory/2026-04-24/`. Run `BRAND_ID=<id> bash morning-factory/2026-04-24/run-factory.sh` to push seeds + drafts to Sweet Heat.\n\n<@U0A9H1R97RT> <@U0A9517L831> Review and approve seeds in Sweet Heat."
  }'
