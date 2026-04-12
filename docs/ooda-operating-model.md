# Sweet Heat: The OODA Operating Model

The factory doesn't follow a checklist. It runs a continuous decision loop. The entity that cycles through observe-orient-decide-act fastest wins. Not the one with the most content, but the one that reads the field, adapts, and acts before the competition even knows the field changed.

Every cycle updates understanding. Yesterday's data sharpens today's decisions. Today's results sharpen tomorrow's.

---

## The Loop

```
    OBSERVE ──────────► ORIENT
       ▲                   │
       │                   ▼
      ACT ◄────────── DECIDE
```

Each cycle: 2 hours during active operation. Continuous when Carson is running autonomously.

---

## OBSERVE — What's happening right now?

Carson pulls signals from every source. Raw data, no interpretation yet.

**Traffic signals:**
- DataFast: visitors, revenue, conversion rate, top referrers, UTM breakdown
- PostHog: session replays, funnel drop-offs, user behavior patterns
- Google Search Console (via DataFast): keyword rankings, impressions, clicks, CTR

**Content performance signals:**
- Buffer analytics: impressions, engagement, clicks per post across all channels
- Content ID performance: which templates, hooks, platforms are producing results
- Pin save rates, tweet engagement, IG saves and comments

**Outreach signals:**
- Email open rates, reply rates, bounce rates
- Dream 100 response patterns (who's engaging, who's cold)
- Pastor outreach conversion (bulk orders, interest signals)

**Market signals:**
- Competitor activity (new products, campaigns, pricing changes)
- Trending topics in Christian parenting space
- Seasonal opportunities (holidays, back-to-school, gift seasons)
- AEO visibility (is AlreadyLoved being cited by AI assistants?)

**Audience signals:**
- Customer questions and objections (from support, social comments)
- Search queries people use to find (or not find) the site
- What content people save, share, and come back to

Carson doesn't interpret during Observe. He collects.

---

## ORIENT — What does this mean for us?

This is the intelligence step. Carson interprets the raw signals through accumulated knowledge.

**Pattern recognition:**
- Which Content ID patterns correlate with revenue? (template + hook + platform)
- Are we seeing diminishing returns on a platform? (Pinterest saturated, IG growing)
- Which outreach messages get responses vs silence?
- What time of day/week produces the best engagement?

**ICP model update:**
- What's resonating with Christian mothers right now?
- Which pain points are the raw nerve (bedtime anxiety vs gift guilt vs identity)
- What language do they use? What hooks stop their scroll?
- Where are they congregating that we're not reaching?

**Competitive positioning:**
- How does our content compare to Wonderbly, I See Me, Hooray Heroes?
- Are we being cited by AI assistants? If not, what content would fix that?
- What keywords are we missing that competitors rank for?

**Strategic context:**
- Where are we on the 1,000 books/month trajectory?
- Is the current content mix serving the funnel or just generating vanity metrics?
- Are we spending time on things that don't drive revenue?

Carson's persistent memory is the superpower here. He remembers last week's patterns, last month's experiments, and the brand's entire history. New data lands in context, not in a vacuum.

---

## DECIDE — What do we do next?

Based on orientation, Carson makes concrete decisions:

**Content decisions:**
- "AFFIRM+BEDTIME template is 3x average. Create 5 more seeds with this pattern."
- "LinkedIn is underperforming. Reduce from daily to 3x/week. Shift budget to Pinterest."
- "Easter is in 2 weeks. Create seasonal gift guide seed cluster."
- "AEO visibility is zero. Create FAQ-structured content for 'personalized children's books'."

**Outreach decisions:**
- "Pastor cold email template A has 8% reply rate. Template B has 2%. Kill B, iterate on A."
- "Podcast host @FaithfulMomCast viewed our email but didn't reply. Send follow-up with different angle."
- "Dream 100 contact @ChristianParenting responded positively. Escalate to collaboration pitch."

**Experiment decisions:**
- "Test: Does adding a personal story to pin descriptions increase saves? Run A/B for 1 week."
- "Test: Is 'Your child already knows...' hook better than 'What if bedtime could be...'? Publish both, measure."
- "Test: Do UGC-style videos outperform designed graphics on TikTok? Create 5 of each."

**Resource allocation:**
- "Content mix this week: 40% AFFIRM, 25% STORY, 20% HOW, 15% experimental"
- "Outreach priority: pastors (50%), podcast hosts (30%), influencers (20%)"
- "Platform allocation: Pinterest 35%, Instagram 25%, Blog/SEO 20%, TikTok 10%, X 10%"

Decisions are logged. Every decision has reasoning. This creates a feedback trail for the next Orient phase.

---

## ACT — Execute at agentic speed

Decisions become actions immediately. No lag between deciding and doing.

**Carson acts:**
- Creates strategic seeds with full metadata (purpose, pillar, keywords, hook, template, reasoning)
- Publishes approved content to Buffer across all channels
- Generates Canva designs using brand kit
- Writes outreach messages and manages campaigns
- Posts daily briefs and weekly scorecards to Slack
- Updates Dream 100 relationship phases

**Claude acts (when Batsirai invokes):**
- Deploys code changes, schema updates, new features
- Fixes bugs, optimizes funnels, builds lead magnets
- Extends the MCP toolset when new capabilities are needed
- Runs tests, verifies deployment, ships infrastructure

**Actions feed back into Observe:**
- Published content generates new performance data
- Sent outreach generates response data
- New blog posts generate search ranking data
- Each action creates new signals for the next cycle

---

## Loop Cadence

| Cycle | What happens | Who |
|---|---|---|
| **Every 2 hours** | Mini-loop: check latest Buffer/DataFast data, adjust today's publish schedule | Carson |
| **Every morning (6 AM)** | Full loop: overnight data → orient → decide today's seeds → act | Carson |
| **Every evening (9 PM)** | Review loop: day's performance → orient → adjust tomorrow's plan | Carson |
| **Every Saturday** | Weekly loop: full scorecard → deep orient → strategic decisions for next week | Carson + Batsirai |
| **1st of month** | Monthly loop: 30-day trends → competitive analysis → strategy adjustments | Carson + Batsirai |
| **On-demand** | Claude loop: Batsirai identifies a problem → Claude observes code/data → orients → decides fix → acts | Claude |

The 2-hour mini-loop is the speed advantage. Most brands operate on weekly content calendars. Sweet Heat operates on 2-hour cycles. In one day, the factory runs 6-8 OODA loops while a competitor runs zero.

---

## Why OODA Beats Static Playbooks

A static playbook says: "Publish 5 pins per day, 1 blog per day, send 10 cold emails per week."

OODA says: "Observe that Pinterest save rates dropped 40% this week. Orient: the algorithm may have changed, or the hook pattern is stale. Decide: test 3 new hook patterns and reduce pin frequency to focus on quality. Act: create 3 experimental seeds with new hooks. Observe: 2 of the 3 new hooks outperform the old one. Orient: the audience has shifted preference. Decide: adopt the new hooks as standard. Act: update content mix."

The static playbook keeps publishing stale content. OODA adapted in 48 hours.

**The compounding effect:** Each OODA cycle makes the next one better. By month 3, the system has run 500+ mini-loops. It knows which hooks work on which platforms at which times for which audience segments. No human team accumulates this insight because no human team can run that many cycles.

---

## Integration with Sweet Heat

### Seeds are DECIDE outputs
Every seed Carson creates should have a `reasoning` field that traces back to an observation and orientation. Not "here's a content idea" but "DataFast shows 0 traffic from search query 'bedtime affirmations for kids' (12K monthly volume). This is a table-stakes keyword gap. Creating SEO-optimized article."

### Performance snapshots are OBSERVE inputs
The `performanceSnapshots` table feeds the Observe phase. Every DataFast pull, every Buffer analytics ingestion, every search console check is an observation.

### Research briefs are ORIENT outputs
When Carson creates a `researchBrief`, that's orientation. It synthesizes observations into patterns and strategic implications.

### Content IDs enable micro-level OODA
Because every piece of content has a unique Content ID encoding template+hook+platform+variant, Carson can run OODA at the individual creative level. "This specific hook on this specific platform with this specific template produced X revenue." That granularity is the orient advantage.
