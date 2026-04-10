# The Strategic Content Factory

## What This Actually Is

Sweet Heat is not a content tool. It's an **autonomous content business** that runs itself. Batsirai and Aimee are tastemakers — they approve the editorial direction. Everything else is automated: research, ideation, writing, design direction, publishing, performance tracking, and learning.

The system has a single goal: **drive traffic that converts**. Every piece of content exists to either:
1. Get discovered (SEO/AEO/Pinterest/social)
2. Deliver value (build trust, answer questions)
3. Convert (email subscriber, book buyer, client inquiry)
4. Compound (content that generates more content ideas)

## The Three Agents

The factory runs on three autonomous agents, each with a distinct role and budget:

### 1. The Researcher (Low-cost, high-volume)
**Model:** Haiku / Gemini Flash / local  
**Budget:** ~$1/day per brand  
**Runs:** Every 6 hours

What it does:
- Monitors YouTube channels for new content (TranscriptAPI channel/latest — FREE)
- Scans "People Also Ask" / related searches for the brand's keywords
- Checks Buffer analytics for content performance
- Identifies gaps in content pillar coverage
- Flags trending topics in the brand's niche
- Maintains the knowledge base (auto-ingest high-signal videos)

What it produces:
- New knowledge sources (YouTube transcripts ingested)
- Performance reports (what's working, what's not)
- Coverage gap reports (which pillars/keywords need content)
- Trend alerts (emerging topics to capitalize on)

### 2. The Strategist (Medium-cost, daily)
**Model:** Sonnet  
**Budget:** ~$3/day per brand  
**Runs:** Daily at 6am

What it does:
- Reads the Researcher's reports (gaps, trends, performance)
- Reviews existing seeds to avoid duplicates
- Generates 5-10 strategic seed pitches with:
  - Purpose tag (SEO, AEO, brand building, engagement, table stakes)
  - Content pillar alignment
  - Target keywords
  - Reasoning ("We have no content for 'toddler bedtime routine'. This is a table stakes keyword with 12K monthly searches.")
- Prioritizes seeds by strategic value
- Compiles the wiki (summarize new sources, update articles)
- Generates idea briefs from catalysts

What it produces:
- 5-10 pitched seeds per brand (in the Seeds queue)
- Updated wiki pages
- Catalysts for future ideation
- A daily brief: "Here's what I recommend today and why"

### 3. The Writer (Higher-cost, on-demand)
**Model:** Sonnet for blog, Haiku for derivatives  
**Budget:** ~$5/day per brand (varies by approval volume)  
**Runs:** When seeds are approved (event-driven)

What it does:
- Writes the blog article (anchor content) — Sonnet, ~2000 tokens out
- Writes 4-5 Pinterest pin texts — Haiku, ~200 tokens each
- Writes tweets, LinkedIn, IG captions — Haiku, ~300 tokens each
- Generates visual direction for Canva — Haiku, ~100 tokens each
- Publishes approved branches to Buffer

What it produces:
- Blog article (SEO/AEO optimized)
- 4-5 Pinterest pins (linking to article)
- Social posts (tweet, LinkedIn, IG caption, TikTok caption)
- Visual direction documents for Canva connector

## Cost Model

| Agent | Model | Calls/day | Avg tokens | Est. cost/day |
|-------|-------|-----------|------------|---------------|
| Researcher | Haiku | 20-50 | 2K in / 500 out | $0.50 |
| Strategist | Sonnet | 5-10 | 8K in / 2K out | $3.00 |
| Writer (blog) | Sonnet | 1-2 | 4K in / 3K out | $1.50 |
| Writer (derivatives) | Haiku | 15-30 | 2K in / 500 out | $0.75 |
| Wiki compiler | Sonnet | 2-5 | 6K in / 2K out | $1.50 |
| **Total per brand** | | | | **~$7-8/day** |

At ~$7/day per brand, running 3 brands = ~$21/day = ~$630/month.
That's the cost of one junior content writer's lunch money, producing 10-20x the output.

## The Feedback Loop

```
PUBLISH → MEASURE → LEARN → ADJUST → PUBLISH
    ↑                                    │
    └────────────────────────────────────┘
```

1. **Publish** — Content goes to Buffer → platforms
2. **Measure** — Buffer analytics + Google Analytics + Search Console data
3. **Learn** — Researcher agent reads performance data:
   - Which pins got clicks?
   - Which articles got traffic?
   - Which keywords are ranking?
   - What's the click-through rate?
   - Which content pillars perform best?
4. **Adjust** — Strategist agent uses performance data to:
   - Double down on performing pillars
   - Pivot away from underperforming topics
   - Propose training updates (learnings)
   - Adjust keyword targeting
   - Modify content format ratios
5. **Repeat** — Next day's seeds are informed by yesterday's data

## The User Experience (Batsirai's 5-Minute Morning)

```
6:00 AM — Strategist runs
6:01 AM — 5 new seeds appear in queue

8:30 AM — Batsirai opens Sweet Heat on phone

DASHBOARD shows:
┌─────────────────────────────────┐
│ Good morning, Batsirai          │
│                                 │
│ 📊 Yesterday's fruit:          │
│   12 pins published (84 clicks)│
│   2 articles live (340 views)  │
│   Best: "Bedtime Affirmation   │
│   for Anxious Kids" (127 pins) │
│                                 │
│ 🌱 5 seeds to review:          │
│   3 SEO (table stakes)         │
│   1 brand building             │
│   1 AEO                        │
│                                 │
│ 💰 Budget: $6.40 spent today   │
│   (of $10 daily limit)         │
└─────────────────────────────────┘

SEEDS queue shows:
┌─────────────────────────────────┐
│ [SEO] "Bedtime Routine for     │
│  3-Year-Olds: The 5-Minute     │
│  Method That Actually Works"   │
│                                 │
│  Keywords: bedtime routine     │
│  toddler, 3 year old bedtime  │
│  Pillar: bedtime identity      │
│  Reasoning: "12K monthly       │
│  searches, no existing content.│
│  Table stakes keyword."        │
│                                 │
│  [Approve] [Decline] [Tweak]   │
└─────────────────────────────────┘

8:32 AM — Approves 3 seeds, declines 2
           (total touch time: 2 minutes)

8:33 AM — Writer agent fires:
           → 3 blog articles writing
           → 15 Pinterest pins queued
           → 9 social posts queued

9:00 AM — All content written, in review
           → Batsirai spot-checks 1 article
           → Approves all (or auto-approved
             based on confidence score)

9:30 AM — Buffer queue loaded:
           → 5 pins scheduled throughout day
           → 1 tweet at peak engagement time
           → 1 LinkedIn post at 8am tomorrow
           → Blog live on site

Done. 2 minutes of active work.
The content factory runs for the next 24 hours.
```

## Daily Output Target (AlreadyLoved Kids)

| Time | Content | Platform | Purpose |
|------|---------|----------|---------|
| 7:00 AM | LinkedIn post | LinkedIn | Brand building |
| 9:00 AM | Pin #1 (article hook) | Pinterest | Traffic → blog |
| 11:00 AM | Pin #2 (quote) | Pinterest | Traffic → blog |
| 12:00 PM | Tweet thread | Twitter/X | Engagement |
| 2:00 PM | Pin #3 (stat/tip) | Pinterest | Traffic → blog |
| 4:00 PM | IG carousel | Instagram | Brand building |
| 6:00 PM | Pin #4 (question) | Pinterest | Traffic → blog |
| 8:00 PM | Pin #5 (list/tips) | Pinterest | Traffic → blog |
| Newsletter | Weekly digest | Beehiiv | Conversion |

Blog article publishes at 6:00 AM — all social content drives traffic to it throughout the day.

## Token Budget System

Each brand has a daily token budget tracked in Convex:

```typescript
// On the brands table
tokenBudget: {
  dailyLimit: 500000,        // ~$10/day at Sonnet rates
  currentSpend: 0,           // Reset daily at midnight
  alertThreshold: 0.8,       // Alert at 80% spend
  modelTiers: {
    research: "haiku",       // Cheapest for high-volume scanning
    strategy: "sonnet",      // Quality for ideation and planning
    blogWriting: "sonnet",   // Quality for anchor content
    derivatives: "haiku",    // Cheap for format adaptation
    compilation: "sonnet",   // Quality for wiki synthesis
  }
}
```

Every Claude API call logs tokens used. If budget is exceeded, agent pauses and notifies user.

## What Makes This a 100-Person Team

1. **Volume**: 20+ pieces of content per day, 7 days a week, across platforms
2. **Consistency**: Never misses a day, never gets sick, never loses voice
3. **Strategy**: Every piece has a purpose (SEO, AEO, brand, engagement)
4. **Learning**: Performance data feeds back into next day's strategy
5. **Quality**: Knowledge base ensures substance, not fluff
6. **Scale**: Adding a new brand = configure once, runs forever
7. **Cost**: ~$7/day vs. $50K+/year for a content team

The humans (Batsirai + Aimee) provide:
- Brand taste and editorial judgment (2 min/day)
- Occasional voice training updates (monthly)
- Strategic direction ("focus on X this quarter")
- Spot-checking for quality

Everything else is autonomous.
