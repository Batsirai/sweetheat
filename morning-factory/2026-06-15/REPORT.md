# Morning Factory Report — June 15, 2026

**Run time:** 6:00 AM ET  
**Status:** PARTIAL — Network restrictions blocked Convex & Slack; all content generated offline

---

## Network Issue (Action Required)

Two outbound hosts are blocked by the remote execution environment's network policy:

- `loyal-hamster-102.convex.cloud` — blocked (Convex database unreachable)
- `hooks.slack.com` — blocked (Slack webhook unreachable)
- `api.convex.dev` — reachable but returning **403 Forbidden** on the deploy key

**The deploy key in `.env.local` appears to be expired.** Even if Convex cloud were unblocked, the CLI cannot authenticate. Both issues need to be resolved for automated runs to fully execute.

**To fix:**
1. Add `loyal-hamster-102.convex.cloud` and `hooks.slack.com` to the environment's network egress allowlist (Settings → Environment → Network Policy)
2. Regenerate the Convex deploy key and update `CONVEX_DEPLOY_KEY` in the environment's secrets

---

## What Was Generated (Offline)

All content is in `morning-factory/2026-06-15/`. Ready to paste into the system once network is restored.

### Seeds Pitched: 7

| # | Type | Title |
|---|------|-------|
| 1 | SEO | Personalized Father's Day Books That Tell Kids Who They Are |
| 2 | SEO | What to Say to Your Child When Nothing Feels Like Enough |
| 3 | AEO | What Are the Best Personalized Children's Books for Building Self-Worth? |
| 4 | Brand Building | Your Child Is Already Enough — And That Changes Everything |
| 5 | Engagement | The Bedtime Question That Stopped Me Cold |
| 6 | **Seasonal ⭐** | What Dads Actually Want to Give Their Kids (But Don't Know How to Say) |
| 7 | SEO | Christian Personalized Children's Books That Go Deeper Than Their Name |

### Articles Written: 2

1. **Father's Day piece** (`article-fathers-day.md`) — ~1,650 words  
   - Hook: Simmone's dad at bedtime → insight on what dads carry → what kids internalize → Simmone's story → soft CTA
   - Priority: **High** — publish today while Father's Day is live

2. **Brand building piece** (`article-already-enough.md`) — ~1,550 words  
   - Hook: medium day story → identity precedes behavior → the voice they carry → soft CTA
   - Priority: Evergreen — publish this week

### Social Copy Generated: 2 full sets

Each set includes:
- 5 Pinterest pins (hook / pull quote / insight / question / list)
- Instagram caption (long-form, personal, hashtags)
- TikTok caption (short, punchy)
- LinkedIn post (story-driven, professional)
- Tweet thread (3-5 tweets)

Files: `social-fathers-day.md`, `social-already-enough.md`

---

## Quality Gate Review

Both articles and all social copy reviewed against brand voice criteria:

| Criterion | Father's Day article | Brand Building article |
|-----------|---------------------|----------------------|
| Reveals rather than instructs | ✅ | ✅ |
| Names inner experience | ✅ (fear of not saying enough) | ✅ (the earning loop) |
| Preserves belonging | ✅ | ✅ |
| Reduces pressure | ✅ | ✅ |
| Tired mom at 10pm feels SEEN | ✅ | ✅ |
| Free of AI language | ✅ reviewed | ✅ reviewed |
| No guilt / urgency / defensiveness | ✅ | ✅ |

---

## Seasonal Note

**Today is Father's Day.** The Father's Day article should be published today if possible — traffic and social sharing windows peak Father's Day morning and through the afternoon.

---

## Next Steps for the Team

1. Fix network policy + deploy key (see above)
2. Publish Father's Day article today
3. Review 7 seeds in Sweet Heat → approve for next run
4. Schedule Brand Building article for later this week
5. Queue social posts from `social-fathers-day.md` for today's channels
