# Continuous Improvement: How Sweet Heat Gets Better With Every Action

Every piece of content published, every outreach sent, every seed approved or rejected, every click tracked is a learning signal. The system compounds intelligence the way interest compounds money.

## The Five Feedback Loops

### Loop 1: Content Performance → Seed Strategy
**Signal:** Which Content IDs produce revenue, clicks, saves, shares
**Feeds into:** Carson's seed generation strategy (ORIENT → DECIDE)

How it works:
- Every published piece has a Content ID encoding template + hook + platform + variant
- DataFast tracks which UTM-tagged content drives visitors and revenue
- Weekly scorecard ranks templates and hooks by revenue per click
- Carson reads the scorecard and adjusts: "AFFIRM+BEDTIME is 3x average → create more"

**What improves:** Content mix allocation. By month 3, the system knows which combinations convert and stops guessing.

### Loop 2: Approval/Rejection → Taste Model
**Signal:** Which seeds Batsirai approves vs rejects, and why (feedbackReason)
**Feeds into:** Carson's brand taste understanding

How it works:
- Every approval/rejection logs the reason (great_idea, on_brand, wrong_tone, not_relevant, etc.)
- The learnings table accumulates pattern observations
- Carson's persistent memory tracks: "Batsirai always approves STORY templates about bedtime. He rejects COMPARE templates."
- Future seeds are generated with this taste model applied

**What improves:** Seed relevance. Approval rate climbs from 60% → 80% → 95% → auto-approve threshold hit.

### Loop 3: Outreach Response → Message Optimization
**Signal:** Which cold emails get opened, replied to, converted
**Feeds into:** Outreach message template refinement

How it works:
- Every outreach message tracks: sent → opened → replied → converted
- Template A has 8% reply rate, Template B has 2% → kill B, iterate on A
- Carson analyzes reply content for patterns: what resonated, what objections surfaced
- Next batch uses the winning template with refinements

**What improves:** Outreach conversion. By month 2, the cold email template is battle-tested against real data.

### Loop 4: Funnel Analytics → UX Fixes
**Signal:** Where visitors drop off in the wizard funnel
**Feeds into:** Claude's bug fix and UX improvement work

How it works:
- DataFast tracks: pageview → wizard_started → wizard_completed → checkout_started → payment
- Drop-off spikes trigger Carson alerts to Slack
- Claude investigates (PostHog session replays, code review) and fixes
- Conversion rate improves incrementally

**What improves:** Funnel conversion. The 11% baseline should climb as friction points are identified and removed.

### Loop 5: Skill Performance → Skill Evolution
**Signal:** Output quality ratings from every skill use
**Feeds into:** Skill prompt improvement

How it works:
- Every time a skill is used, the output quality is evaluated (implicitly by approval rate, explicitly by human feedback)
- Skills that produce weak output get prompt refinements
- Hook generator that produces 20 hooks but only 2 are usable → refine the prompt constraints
- Competitor analysis that misses key angles → add more specific research directives
- Improvements are logged, tested, and deployed as new skill versions

**What improves:** Skill quality compounds. A skill used 100 times is dramatically better than its v1.0.

## The Compounding Math

| Month | OODA Loops | Data Points | Content Published | Intelligence Level |
|---|---|---|---|---|
| 1 | ~180 | ~5,000 | ~300 pieces | Learning: what works at all |
| 2 | ~360 | ~15,000 | ~600 pieces | Pattern: which templates/hooks convert |
| 3 | ~540 | ~30,000 | ~900 pieces | Precision: optimal mix per platform per time |
| 6 | ~1,080 | ~100,000 | ~1,800 pieces | Mastery: system knows ICP deeply |

By month 6, the system has run 1,000+ OODA loops, processed 100,000+ data points, and refined its strategy hundreds of times. No human team accumulates this density of learning.

## What Gets Stored Where

| Data | Table | Used By |
|---|---|---|
| Content performance by Content ID | performanceSnapshots + contentIds | OODA ORIENT phase |
| Approval/rejection patterns | seeds (feedbackReason) + learnings | Taste model |
| Outreach response rates | outreachMessages (status tracking) | Message optimization |
| Funnel drop-offs | DataFast + PostHog | UX improvement |
| Skill effectiveness | learnings table | Skill evolution |
| Template/hook/platform rankings | performanceSnapshots (weekly scorecard) | Content mix decisions |

## The Meta-Loop

The system doesn't just improve its content. It improves its own improvement process.

Carson observes that the OODA loop itself has patterns:
- "The 2-hour mini-loop catches platform changes fast but misses weekly trends"
- "The weekly scorecard is good but should include a 30-day rolling average, not just week-over-week"
- "The hook generator produces better hooks when given 3 examples of past winners"

These observations → orient → decide → act on the process itself. The factory tunes its own machinery.
