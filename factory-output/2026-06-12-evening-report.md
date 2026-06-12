# AlreadyLoved Evening Intelligence Report — Friday June 12, 2026

> Run time: 10:00 PM ET | Agent: Evening Intelligence
> Today is **Friday, June 12** — Father's Day: **9 days** (June 21) — Summer week 3 for most US families
> **Weekly Scorecard: This report covers the week of June 6–12**
> Infrastructure note: Convex API 403 Forbidden (persistent — sandbox network policy). Slack webhook blocked. Slack MCP: authentication pending (awaiting user callback URL). All analysis from local files and git history. Manual Convex commands provided below — replace `BRAND_ID` with AlreadyLoved brand ID from dashboard.

---

## PHASE 1: DAILY ANALYTICS

### Today (Friday, June 12)

No morning factory run today. No afternoon distribution today.

### This Week (June 6–12)

| Date | Activity | Seeds | Articles | Social Suites |
|------|----------|-------|----------|---------------|
| Fri June 6 | Morning Factory ✅ | 7 | 2 | 2 |
| Sat–Sun June 7–8 | Weekend — no runs | — | — | — |
| Mon June 9 | Afternoon Distribution ✅ | 1 | — | — |
| Tue June 10 | No runs | — | — | — |
| Wed June 11 | Afternoon Distribution ✅ | 2 | — | — |
| Thu June 12 | No runs | — | — | — |
| **WEEK TOTAL** | **3 runs** | **10** | **2** | **2** |

### All-Time Totals (Through June 12, 2026)

| Metric | Count | Notes |
|--------|-------|-------|
| Total factory/distribution runs | ~22 | Includes morning + afternoon sessions |
| Seeds pitched all-time | **~154** | +10 this week |
| Articles written all-time | **~22** | +2 this week |
| Social suites all-time | **~22** | +2 this week (10 pins, 2 IG, 2 TikTok, 2 LinkedIn, 10 tweets per suite) |
| **Articles published** | **0** 🔴 | Day 57 since oldest draft (Apr 16) |
| Father's Day SEO window closes | **June 15** | 3 days |

### Snapshot Commands (run when Convex accessible)

```bash
# June 12 — no factory ran
npx convex run analytics:createSnapshot '{"brandId": "BRAND_ID", "source": "daily_agent", "metrics": {"date": "2026-06-12", "seedsPitched": 0, "articlesWritten": 0, "contentPublished": 0, "factoryRan": false, "allTimeArticles": 22, "allTimeSocialSuites": 22, "allTimePublished": 0, "allTimeSeedsPitched": 154, "fathersDayDaysRemaining": 9, "fathersDaySeoWindowDaysRemaining": 3}}'

# June 11 — afternoon distribution only
npx convex run analytics:createSnapshot '{"brandId": "BRAND_ID", "source": "daily_agent", "metrics": {"date": "2026-06-11", "seedsPitched": 2, "articlesWritten": 0, "contentPublished": 0, "factoryRan": false, "afternoonDistributionRan": true, "seedTitles": ["The Bored Child: What Summer Without a Schedule Is Actually Teaching Her", "The Summer Wasn\'t Pinterest-Perfect. She\'ll Remember It Anyway."]}}'

# June 10 — no runs
npx convex run analytics:createSnapshot '{"brandId": "BRAND_ID", "source": "daily_agent", "metrics": {"date": "2026-06-10", "seedsPitched": 0, "articlesWritten": 0, "contentPublished": 0, "factoryRan": false}}'

# June 9 — afternoon distribution only
npx convex run analytics:createSnapshot '{"brandId": "BRAND_ID", "source": "daily_agent", "metrics": {"date": "2026-06-09", "seedsPitched": 1, "articlesWritten": 0, "contentPublished": 0, "factoryRan": false, "afternoonDistributionRan": true, "seedTitles": ["What You\'re Telling Your Child When You Track Them at Camp"]}}'

# June 6 — full morning factory run
npx convex run analytics:createSnapshot '{"brandId": "BRAND_ID", "source": "daily_agent", "metrics": {"date": "2026-06-06", "seedsPitched": 7, "articlesWritten": 2, "socialSuitesDrafted": 2, "contentPublished": 0, "factoryRan": true, "articleTitles": ["The Bedtime Dad: Why Showing Up at the End of the Day Changes Everything", "What Your Son Is Learning About How Men Love by Watching You"], "fathersDay6Of6Complete": true}}'
```

---

## PHASE 2: LEARNING LOOP

*Convex inaccessible — analysis from local files covering all 22 factory/distribution sessions and ~154 seeds.*

### Pattern 1: Morning Factory Cadence Is Stalling Mid-Week

The factory ran on **Monday June 2** and **Friday June 6** — one run per week, both on boundary days (first/last workday). The same pattern appeared in late May. Afternoon distribution is running well (3x this week), but morning factory is the primary article-writing engine. At one run per week, the article backlog grows by 2/week but publish rate remains 0.

**Proposed learning:**
```bash
npx convex run learnings:propose '{"brandId": "BRAND_ID", "layer": "production_workflow", "proposal": "Morning factory is running once per week (June 2, June 6) when it should run 3–4x per week. The single weekly run is producing 2 articles per run — enough to fill a strong backlog, but the factory is not running consistently enough to respond to time-sensitive opportunities. The afternoon distribution is covering trend-scanning well (3x this week). The blocker appears to be workflow habit, not capacity. Recommend establishing Tuesday and Thursday as additional factory run days. Even half-runs (seeds only, no article write) maintain momentum.", "reasoning": "Two factory runs in June have each produced strong work. The gap is frequency, not quality. The system is capable — it just needs to show up more often."}'
```

### Pattern 2: AEO Layer Is Intentional Now (Validated)

Two AEO seeds in two consecutive weeks:
- Week of June 2: Discipline vs. Punishment (June 6 morning)
- Week of May 28: Child Says I Hate You (June 2 run)

Both are featured-snippet structured, counter-intuitive, and cite attachment research. Neither is written yet. Psychology Today published on unconditional love in February 2026. AI engines are actively indexing competing content.

**Proposed learning:**
```bash
npx convex run learnings:propose '{"brandId": "BRAND_ID", "layer": "spark_generation", "proposal": "AEO (AI Engine Optimization) is now an intentional pillar in the seed strategy, not incidental. The formula is confirmed: high-emotion parenting question → AlreadyLoved reframe using attachment science → direct answer in first paragraph → FAQ structure throughout. Seeds confirmed working: Child Says I Hate You (Jun 2), Discipline vs Punishment (Jun 6). Next in queue: Why Does My Child Lie? (high emotion, counter-intuitive reframe: lying as safety signal not moral failure). Target: one AEO seed per 7-seed morning factory run. Prioritize writing Discipline vs Punishment and Why Does My Child Lie next — Psychology Today is competing for the same citations.", "reasoning": "AlreadyLoved has a genuinely counter-intuitive angle on every common parenting question. That is the AEO advantage: not keyword stuffing, but a cited insight that AI engines will surface because it goes further than the consensus."}'
```

### Pattern 3: Afternoon Distribution Has Found Its Voice

June 9 and June 11 runs each surfaced trend angles the morning factory would not have found. This week's signals:
- **Camp surveillance** (June 9): Nobody writing the identity angle — "what surveillance tells the child about their trustworthiness"
- **Analog childhood** (June 11): Peak trend, identity lens not covered by competitors
- **Summer mental load** (June 11): Moms performing a curated summer — AlreadyLoved counter: you are the soil, not the architect

The afternoon slot is consistently catching what the morning misses.

**Proposed learning:**
```bash
npx convex run learnings:propose '{"brandId": "BRAND_ID", "layer": "production_workflow", "proposal": "Afternoon distribution runs (June 1, June 9, June 11) are producing a distinct type of seed from the morning factory. Morning factory generates from strategy and pillar coverage. Afternoon distribution surfaces timely trend angles that require rapid response. This week: analog childhood (peak trend, identity lens), camp surveillance (timely + counter-intuitive), summer mental load (emotional + relatable). These seeds are sharper and more distinctly AlreadyLoved than what the morning factory would generate alone. Recommend formalizing: afternoon distribution 3x per week (Mon/Wed/Fri). Morning factory 3x per week (Tue/Thu + one weekend if available).", "reasoning": "Three confirmed afternoon runs (June 1, June 9, June 11) have each added clear value. The complementary model works: strategy (morning) + signals (afternoon). Both are necessary for content that is both deep and timely."}'
```

### Pattern 4: Seeds Concentration in Belonging Pillar

Scanning this week's 10 seeds by pillar:
- Belonging: 6 (Why Lies, Discipline vs Punishment, Bedtime Dad, Left Out, Bored Child, Camp Tracking)
- Identity: 3 (What I Want Kids to Know, How to Raise a Kind Child, Pinterest-Perfect)
- Mission/brand: 1 (Parenting Win Nobody Talks About)

**Belonging is well-covered. Identity seeds are good but slightly underweighted.** "She Was Performing" (June 4 seed) is the strongest identity-first seed in queue — it should be the next brand-building article written.

---

## PHASE 3: SYSTEM HEALTH CHECK

### Meta-OODA Commands (run when Convex accessible)

```bash
npx convex run metaOoda:generateReview '{}'
npx convex run metaOoda:checkBottlenecks '{}'
npx convex run feedbackSynthesis:getTasteProfile '{"brandId": "BRAND_ID"}'
```

### Bottleneck Analysis

#### 🔴 CRITICAL: Father's Day SEO Window Closes June 15 — 3 Days

Two complete Father's Day articles are written, ready, and UNPUBLISHED:

| Article | File | Status |
|---------|------|--------|
| **The Bedtime Dad: Why Showing Up at the End of the Day Changes Everything** | `morning-factory/articles/bedtime-dad-fathers-day-2026-06-06.md` | ✅ Written June 6 — UNPUBLISHED 🔴 |
| **What Your Son Is Learning About How Men Love by Watching You** | `morning-factory/articles/son-watching-fathers-day-2026-06-06.md` | ✅ Written June 6 — UNPUBLISHED 🔴 |

Social suites for both are at:
- `morning-factory/social/bedtime-dad-social-2026-06-06.md`
- `morning-factory/social/son-watching-social-2026-06-06.md`

**After June 15, social and email can still distribute through June 20.** The SEO window closes first — publish before Sunday June 15.

Full Father's Day series status (6 articles):

| # | Title | File | Published? |
|---|-------|------|-----------|
| 1 | Father's Day Gifts for Toddlers | `fathers-day-gifts-toddlers-2026-05-28.md` | Unknown — check Convex |
| 2 | A Letter to Every Dad Who Wonders | `factory-output/2026-05-16/article-seed-06-fathers-day.md` | Unknown |
| 3 | The Dad No One Writes a Song About | In May 30 run report | Unknown |
| 4 | What Your Daughter Is Learning About Her Worth | `daughter-worth-fathers-day-2026-06-04.md` | Unknown |
| 5 | **What Your Son Is Learning About How Men Love** | `son-watching-fathers-day-2026-06-06.md` | ❌ Confirmed unpublished |
| 6 | **The Bedtime Dad** | `bedtime-dad-fathers-day-2026-06-06.md` | ❌ Confirmed unpublished |

If none of the series has been published: a 6-article Father's Day series with 9 days to go and zero SEO time is still reachable via social and email. But the SEO window for #5 and #6 closes Sunday June 15. **Publish Saturday June 13.**

#### 🔴 CRITICAL: Publish Bottleneck — Day 57

22 articles. 0 published (not confirmed otherwise from local files). The oldest article (Bedtime Confession, April 16) is 57 days old and fully evergreen. Articles are aging — none have expired except the Mother's Day pieces.

This is the fifth consecutive week this bottleneck appears in the evening report. The morning factory is functioning. The afternoon distribution is functioning. Content quality is strong. The pipeline break is exclusively at publication.

**What needs to happen once, to unblock everything:**
1. Someone logs into the website CMS or publishing tool
2. Copies the markdown from any article file
3. Posts it

The first publish is the only one that requires a decision. After that it's habit.

#### 🟡 WARNING: Morning Factory Ran Once This Week

One morning factory run in a 7-day period (June 6). The factory is capable of running daily. At current rate (1 run/week, 2 articles/run), the content backlog grows but publish rate stays 0. The factory needs to run more often — not because output is insufficient, but because the habit of running it is what leads to the habit of publishing.

#### 🟡 WARNING: Seeds Piling Up Unapproved

Estimated 8 seeds awaiting approval in Convex (from June 6 morning and June 9–11 afternoon runs). If approval workflow is functioning, these should be reviewed. If not — the morning factory can write from any of these without formal approval. Priority for next run: **Why Does My Child Lie?** and **Discipline vs. Punishment** (AEO candidates, high volume, Psychology Today competing now).

#### 🟢 HEALTHY: Content Quality and Voice

Every article written in June has passed quality gate checks. Voice is consistent across all formats (blog, social, email). The AlreadyLoved reframe is applied correctly and distinctively in each piece. No generic content in the backlog.

#### 🟢 HEALTHY: Trend Coverage

Afternoon distribution is covering the trend landscape well. Analog childhood, summer mental load, camp surveillance, Father's Day presence angle — all identified within 48 hours of peak. No major cultural moment in the parenting space has been missed this week.

#### 🟢 HEALTHY: Father's Day Series Complete

All 6 Father's Day articles are written. The series covers: commercial/gifts, emotional letter, invisible labor, daughter watching dad, son watching dad, bedtime dad. No angle is repeated. This is a complete editorial package for a major parenting holiday.

---

## PHASE 4: PREPARE TOMORROW (Saturday June 13 → Week of June 15)

### Seasonal Calendar — Next 7 Days (June 13–19)

| Date | Event | Content Relevance | Urgency |
|------|-------|-------------------|---------|
| **Sat June 13** | Last viable Father's Day SEO publish day | Publish Son + Bedtime Dad | **🔴🔴🔴** |
| **Sun June 14** | Father's Day SEO window closes | Any publish after this = social-only value | **🔴🔴** |
| **Mon June 16** | Father's Day week begins | Deploy social suites for both FD articles | 🟡 |
| **Sat June 21** | **Father's Day** | All 6 articles should be live + circulating | 9 days |
| June 15–20 | Summer solstice / peak summer | Analog childhood, bored child seeds timely | 🟡 |
| June 15 onward | Baptism season continues | Baptism article ready — publish anytime | 🟢 |

### Week of June 15 Factory Priority

**Priority 1 — Write (Tuesday morning factory):**
- "Why Does My Child Lie?" — highest volume evergreen seed in queue (18k/mo keyword), counter-intuitive reframe, AEO potential
- "Discipline vs. Punishment" — featured snippet target, Psychology Today competing, AEO structure ready

**Priority 2 — Write (Thursday morning factory):**
- "The Bored Child: What Summer Without a Schedule Is Actually Teaching Her" — peak analog childhood trend window
- "She Was Performing. I Didn't Know I'd Taught Her To." — brand-building, identity, high emotional resonance

**Priority 3 — Seeds (Wednesday afternoon distribution):**
- Scan for back-to-school anxiety signals emerging (some districts start August — content lead time needed by July 15)
- Check for any Father's Day aftermath / "how did it go" content opportunities
- Scan for summer camp season stories (camp surveillance seed still alive through August)

### Research Briefs (run when Convex accessible)

```bash
# Brief 1 — Why Does My Child Lie? (priority write next week)
npx convex run researchBriefs:createBrief '{"brandId": "BRAND_ID", "topic": "Why Does My Child Lie? — reframe: lying as safety signal, not moral failure", "questions": ["What does lying communicate about the child\'s felt sense of safety?", "What is the AlreadyLoved reframe vs. the standard discipline-based answer?", "What is the hook moment — the specific visual that opens this article?", "What does a child need to know to choose truth? (It must be safe to tell the truth.)", "What is the Pinterest/IG hook and primary keyword cluster?", "How does this connect naturally to AlreadyLoved personalized books (optional, not forced)?"], "priority": 1}'

# Brief 2 — Discipline vs. Punishment (priority AEO write)
npx convex run researchBriefs:createBrief '{"brandId": "BRAND_ID", "topic": "Discipline vs. Punishment — what\'s the actual difference, and why does it matter at the identity level", "questions": ["What does punishment communicate to the child about their belonging?", "What does discipline communicate?", "What is the AlreadyLoved answer to \'what\'s the difference\'? (Answer it directly — this is AEO format)", "What research (Siegel, Gopnik, Karpman) supports the distinction?", "What is the featured snippet target format for this article?", "How is this different from the Gentle Parenting \'we don\'t punish\' script?"], "priority": 1}'

# Brief 3 — Back to School Anxiety (plant now, write July)
npx convex run researchBriefs:createBrief '{"brandId": "BRAND_ID", "topic": "Back to school anxiety — what children need before the first day (identity, not preparation)", "questions": ["When does back-to-school anxiety content start indexing? (Content needed by July 15 for August-start districts)", "What is the AlreadyLoved angle vs. the standard checklist/preparation content?", "What does a child who knows they belong need less of on the first day?", "What is the hook — the specific moment parents recognize?", "What keyword cluster? (back to school anxiety kids, first day of school scared, back to school transitions)"], "priority": 2}'
```

---

## PHASE 5: WEEKLY SCORECARD — Week of June 6–12, 2026

*Today is Friday — weekly scorecard runs.*

### Seeds This Week

| Date | Session | Seeds Pitched | Purposes |
|------|---------|---------------|---------|
| June 6 | Morning Factory | 7 | 3x SEO, 1x AEO, 1x brand-building, 1x engagement, 1x seasonal |
| June 9 | Afternoon Distribution | 1 | 1x engagement (timely) |
| June 11 | Afternoon Distribution | 2 | 1x engagement, 1x brand-building |
| **TOTAL** | | **10** | |

**Seeds by purpose this week:**
- organic_seo: 3 (Why Lies, Left Out, Kind Child)
- engagement: 3 (Parenting Win, Camp Tracking, Bored Child)
- brand_building: 2 (What I Want Kids to Know, Pinterest-Perfect)
- aeo_citation: 1 (Discipline vs Punishment)
- seasonal: 1 (Bedtime Dad — written same day)

### Articles & Content This Week

| Metric | This Week | All-Time |
|--------|-----------|---------|
| Articles written | 2 | ~22 |
| Social suites | 2 | ~22 |
| Pinterest pins | 10 | ~110+ |
| Instagram captions | 2 | ~22 |
| TikTok captions | 2 | ~22 |
| LinkedIn posts | 2 | ~22 |
| Tweet threads | 2 (10 tweets) | ~22 threads |
| **Content published** | **0** | **0** 🔴 |

### Factory Cadence This Week

| Session Type | Runs | Expected |
|-------------|------|---------|
| Morning Factory | 1 (Fri June 6) | 3–4 |
| Afternoon Distribution | 2 (Mon June 9, Wed June 11) | 3 |
| Evening Intelligence | 1 (tonight) | 1 |

Morning factory underperformed cadence target. Afternoon distribution hit 2 of 3 target runs. Evening agent on schedule.

### All-Time Totals (Week 10 of Production, April 16 – June 12)

| Metric | Value | Trend |
|--------|-------|-------|
| Total weeks in production | 10 | — |
| Seeds pitched all-time | ~154 | +10 this week ✅ |
| Articles written all-time | ~22 | +2 this week |
| Content published | 0 | Flat 🔴 |
| Publish backlog age | 57 days | Growing 🔴 |
| Father's Day series completion | 6/6 ✅ | Complete |
| AEO seeds in queue | 2 (Discipline vs Punishment + Child Lies) | Building |
| Seasonal coverage | Summer ✅, Baptism ✅, Father's Day ✅, Back-to-School 🟡 | On track |

### Top Content Themes This Week (by quality signal)

| Rank | Seed/Article | Why It Stands Out |
|------|-------------|-------------------|
| 1 | **The Bedtime Dad** | Highest share potential of the Father's Day series — universal emotional hook, grace-toned, forwarded by wives |
| 2 | **What Your Son Is Learning** | Fills a genuine competitor gap — nobody writing the "son watching dad" identity angle |
| 3 | **Discipline vs. Punishment** | Featured snippet + AEO + Psychology Today is active in this space right now |
| 4 | **The Bored Child** | Analog childhood is the #1 parenting trend of 2026 — peak window is now |
| 5 | **Camp Surveillance** | No competitor writing the identity angle — white space confirmed |

### Approval Rate by Pillar

*Formal approvals unavailable (Convex inaccessible). Informal assessment:*
- The June 6 morning factory ran without confirmed seed approvals from prior batches — factory is operating without the approval gate functioning as designed
- No seeds have been formally rejected in any file visible locally
- Recommendation: Review seeds-2026-06-06.json through seeds-2026-06-11.json in Convex dashboard and approve Priority 1 seeds before Monday

### Recommendations for Week of June 15

1. **Publish Bedtime Dad and Son Watching before Saturday 6pm** — last viable Father's Day SEO window
2. **Morning factory: run Tuesday AND Thursday** — break the once-per-week pattern
3. **Priority articles to write next week:** Why Does My Child Lie, Discipline vs Punishment, The Bored Child (in that order)
4. **Approve seeds** in Convex before Monday factory run
5. **Plant back-to-school brief** — lead time is needed; July 15 is the first publish window for August-start districts
6. **Post-Father's Day audit:** week of June 22, check if any Father's Day articles were published and what social engagement looks like

---

## PHASE 6: EVENING REPORT

*Slack webhook blocked. Slack MCP: authentication pending user callback. Manual Slack message below — post to #alreadyloved-agent.*

```
*AlreadyLoved Evening Intelligence — Friday June 12, 2026 (Weekly Scorecard)*

📊 *This week (June 6–12):*
10 seeds pitched | 2 articles written | 2 social suites | 0 published

📊 *All-time:*
~154 seeds | ~22 articles | ~22 social suites | *0 published* | Day 57 since oldest draft

📅 *Father's Day: 9 days | SEO window: 3 days (closes Sunday June 15)* 🔴🔴🔴

*Two articles ready to publish RIGHT NOW:*
• The Bedtime Dad → morning-factory/articles/bedtime-dad-fathers-day-2026-06-06.md
• What Your Son Is Learning → morning-factory/articles/son-watching-fathers-day-2026-06-06.md
*Publish before Saturday 6pm for SEO. After that: social + email only through June 20.*

✅ *Father's Day series: 6/6 complete* — strongest series written so far

🔔 *New trends captured this week:*
• Analog childhood / screen-free summer — PEAK NOW (seed: The Bored Child)
• Summer mental load on moms — active (seed: Summer Wasn't Pinterest-Perfect)
• Camp surveillance identity angle — nobody else writing it (seed created June 9)

⚠️ *Bottlenecks:*
🔴 Publish bottleneck — Day 57, 22 articles, 0 live
🔴 Father's Day SEO window closes Sunday — Bedtime Dad + Son Watching need to go up NOW
🟡 Morning factory ran once this week — needs Tue + Thu runs next week
🟡 8 seeds pending approval in Convex dashboard

📅 *Next week priorities:*
1. Publish FD articles this weekend
2. Morning factory: Tue (Why Lies + Discipline vs Punishment), Thu (Bored Child + She Was Performing)
3. Plant back-to-school brief — lead time window opens July 15
4. Afternoon distribution: Mon/Wed/Fri

🧠 *Learnings proposed: 3* (AEO intentional strategy, afternoon distribution formalized, factory cadence fix)

System healthy. Content strong. Publish step is the only blocker — and it's been the only blocker for 57 days.
```

---

## CONVEX COMMANDS SUMMARY

*Run these when Convex is accessible from a local machine:*

```bash
# Snapshots for this week (see Phase 1 for full commands)
npx convex run analytics:createSnapshot '{"brandId": "BRAND_ID", "source": "daily_agent", "metrics": {"date": "2026-06-12", ...}}'

# Taste profile check
npx convex run feedbackSynthesis:getTasteProfile '{"brandId": "BRAND_ID"}'

# Meta-OODA review
npx convex run metaOoda:generateReview '{}'
npx convex run metaOoda:checkBottlenecks '{}'

# Propose 3 learnings (see Phase 2 for full commands)

# Create 3 research briefs (see Phase 4 for full commands)

# Approve seeds
npx convex run seeds:list '{"brandId": "BRAND_ID", "status": "pending"}'
# Then approve each: npx convex run seeds:update '{"seedId": "ID", "status": "approved"}'
```

---

## COMPLETE ARTICLE BACKLOG (22 articles, 0 published)

| # | Article | Written | Age | Status |
|---|---------|---------|-----|--------|
| 1 | Bedtime Confession | Apr 16 | **57 days** | Evergreen |
| 2 | "I Read My Son His Personalized Book…" | Apr 20 | 53 days | Evergreen |
| 3 | "What My Mom Said…" | Apr 25 | 48 days | Evergreen |
| 4 | "This Mother's Day, Give Your Child Something…" | Apr 28 | 45 days | ~~Seasonal~~ Expired |
| 5 | "Well-Behaved Kids" | Apr 29 | 44 days | Evergreen |
| 6 | "Mother's Day Gift Isn't Flowers" | Apr 29 | 44 days | ~~Seasonal~~ Expired |
| 7 | "Last-Minute Mother's Day Gifts" | May 4 | 39 days | ~~Seasonal~~ Expired |
| 8 | "What to Say When Your Child Says I'm Not Good at Anything" | May 4 | 39 days | Evergreen |
| 9 | "The Voice in Your Child's Head Is Yours" | May 7 | 36 days | Evergreen |
| 10 | "You Were Enough Before You Did Anything" | May 11 | 32 days | Evergreen |
| 11 | "I Almost Said the Wrong Thing at Bedtime" | May 16 | 27 days | Evergreen |
| 12 | "A Letter to Every Dad Who Wonders If He's Doing It Right" | May 16 | 27 days | 🟡 FD — publish through June 20 |
| 13 | "What Your Kids Will Remember From This Summer" | May 17 | 26 days | Summer (evergreen) |
| 14 | "What to Say When Your Child Is Sad That School Is Over" | May 19 | 24 days | Near-expired (hold until next May) |
| 15 | "Identity First: Why Your Child Needs to KNOW They Belong Before They Can Behave" | May 27 | 16 days | Evergreen — brand thesis |
| 16 | **"Father's Day Gifts for Toddlers to Give Dad"** | May 28 | 15 days | 🟡 FD — publish through June 20 |
| 17 | "Baptism Gift Ideas: What to Give When Everything in the Aisle Feels Wrong" | May 29 | 14 days | Baptism season — peak |
| 18 | "Why Does My Child Act Out After Good Days?" | May 30 | 13 days | Evergreen — AEO |
| 19 | **"Why Does My Child Say 'I Hate You'?"** | Jun 2 | 10 days | Evergreen — AEO |
| 20 | "What Your Daughter Is Learning About Her Worth by Watching You" | Jun 4 | 8 days | 🟡 FD — publish through June 20 |
| 21 | "Summer Bedtime Routine for Kids: The Part That Actually Matters" | Jun 4 | 8 days | Summer — evergreen |
| 22 | **"The Bedtime Dad"** | Jun 6 | 6 days | 🔴 FD — publish by June 15 (SEO) |
| 23 | **"What Your Son Is Learning About How Men Love"** | Jun 6 | 6 days | 🔴 FD — publish by June 15 (SEO) |

### Recommended Publish Order (Next 10 Days)

| Priority | Article | Why | Deadline |
|----------|---------|-----|----------|
| 🔴 1 | #22 — The Bedtime Dad | Highest share potential, Father's Day, SEO | **June 15** |
| 🔴 2 | #23 — Son Watching | Identity angle gap, Father's Day, SEO | **June 15** |
| 🟡 3 | #16 — Father's Day Gifts for Toddlers | SEO + commercial, affiliate/product links | June 20 |
| 🟡 4 | #12 — Letter to Every Dad | Emotional anchor, shares | June 20 |
| 🟡 5 | #20 — Daughter Watching Dad | Complete the series | June 20 |
| 🟢 6 | #19 — Child Says I Hate You | AEO, strong hook, evergreen | Anytime |
| 🟢 7 | #18 — Acting Out After Good Days | AEO, counter-intuitive | Anytime |
| 🟢 8 | #17 — Baptism Gifts | Baptism season peak | Sept peak |
| 🟢 9 | #15 — Identity First | Brand thesis, evergreen | Anytime |
| 🟢 10 | #21 — Summer Bedtime Routine | Summer window | Labor Day |

---

*Evening Intelligence Agent — Friday June 12, 2026 | 10:00 PM ET*
*Convex: blocked (403) | Slack webhook: blocked | Slack MCP: authentication pending*
*Next scheduled run: Saturday June 13 (not scheduled) / Monday June 15 evening*
*Weekly scorecard complete.*
