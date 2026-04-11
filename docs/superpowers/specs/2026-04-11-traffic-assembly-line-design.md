# Sweet Heat: The Traffic Assembly Line

## The North Star

**Input:** A URL (e.g., `alreadylovedkids.com/shop`).
**Output:** Converting traffic. Engaged visitors. Eager buyers.
**The machine gets better every day.** Day 1 it publishes content. Day 30 it knows which hooks convert. Day 90 it knows which mothers from which platforms at which time with which message buy books. Day 180 it's a precision traffic machine that a human team couldn't match.

Everything in Sweet Heat serves this single goal. Every table, every agent, every MCP tool exists to drive traffic to the URL and get better at it.

## Context

AlreadyLoved Kids has a working product (personalized children's books for Christian families) but lacks traffic. Sweet Heat already has Seeds, Branches, Drafts, knowledge base, Buffer publishing, and brand voice training. The goal is to evolve it into a **complete traffic assembly line** — content, SEO, AEO, outreach, ads, email, relationship-building — all at agentic speed, all learning and compounding.

**The intelligence layer:** Carson (Hermes, always-on) accumulates deep ICP knowledge — what works, what resonates, who these mothers are, what makes them click, what makes them buy. Claude's frontier models bring raw capability — research, writing, analysis at scale. Together they form a learning system that gets sharper with every approval, rejection, click, and purchase.

**Reference documents:**
- `content 0 revenue attribution system` — UTM tagging, PostHog full-funnel attribution, Stripe revenue bridge
- `AlreadyLoved_Claude_Desktop_Architecture_PRD.docx` — Learn → Serve → Grow assembly line with Cowork + Code
- `traffic_playbook.md` — Dream 100, Core Four, Hook-Story-Offer, follow-up funnels (Brunson + Hormozi)
- `strategic-content-factory.md` — Three-agent model (Researcher, Strategist, Writer) with cost model
- `autonomous-pipeline-spec.md` — Seeds → Branches → Buffer, approved = published

**Build philosophy:** Get the primitives in place for ALL channels simultaneously. Agents build in parallel, not sequentially. The foundation doesn't need to be perfect — it needs to exist so the learning loop can start turning.

---

## System Architecture

### The Factory Model

Sweet Heat's Convex backend is the **factory floor** (single source of truth). The MCP server is the **loading dock** (universal API). Carson (Hermes) and Claude Desktop (Cowork) are **dual shift managers** — different responsibilities, same interface.

```
INPUTS                          THE FACTORY                         OUTPUTS
─────────                       ───────────                         ───────
YouTube transcripts ──┐                                      ┌── Blog articles
Chrome extension ─────┤    ┌──────────────────────────┐      ├── Pinterest pins
Trend scans ──────────┤    │     CONVEX DATABASE       │      ├── Tweets / X posts
Competitor intel ─────┤    │  (Single Source of Truth)  │      ├── IG posts + carousels
Keyword research ─────┤───▶│                            │───▶  ├── LinkedIn posts
Email replies ────────┤    │  9 Production Lines        │      ├── TikTok captions
Audience signals ─────┤    │  running in parallel       │      ├── Video scripts
Performance data ─────┤    │                            │      ├── UGC briefs
Manual seeds ─────────┘    └────────────┬───────────────┘      ├── Cold emails
                                        │                      ├── Podcast pitches
                            ┌───────────┴───────────┐          ├── Ad creatives
                            │    MCP SERVER          │          ├── Email sequences
                            │  (Universal API)       │          ├── Lead magnet pages
                            └─────┬───────────┬──────┘         └── Schema markup
                                  │           │
                           ┌──────┴───┐ ┌─────┴──────┐
                           │  CARSON   │ │  COWORK    │
                           │ (Hermes)  │ │ (Claude    │
                           │ Always-on │ │  Desktop)  │
                           │ Strategy  │ │ Scheduled  │
                           │ + taste   │ │ monitoring │
                           └──────────┘ └────────────┘
```

### Nine Production Lines

| # | Line | Produces | Existing? |
|---|------|----------|-----------|
| 1 | Content | Blog, pins, tweets, IG, carousels, LinkedIn, TikTok, quote cards | Partially (pipeline exists, needs UTM + more formats) |
| 2 | Video | Short/long video scripts, UGC scripts, podcast show notes | New |
| 3 | Ads | Prospecting copy, retargeting sequences, A/B variants | New |
| 4 | Email | Soap Opera sequences, Seinfeld daily, newsletter drafts, lead magnet copy | New (Buffer exists, Beehiiv connector needed) |
| 5 | SEO/AEO | Keyword-optimized articles, schema markup, AEO content, internal links | New |
| 6 | Visual | Canva template fills, design direction, thumbnails, brand assets | New (Canva MCP available) |
| 7 | Outreach | Cold emails, podcast pitches, partnership proposals, pastor outreach | New |
| 8 | Research | Trend reports, competitor intel, keyword gaps, Dream 100 intel, AEO visibility | Partially (knowledge base exists, needs research automation) |
| 9 | Analytics | Performance snapshots, creative scorecards, attribution data, learning loop | Partially (analytics table exists, needs PostHog/Stripe integration) |

---

## Schema Additions

### New Tables

```typescript
// ── Dream 100 ────────────────────────────────────────────
// The targeting foundation for everything (Traffic Playbook Foundation 2)
dream100: defineTable({
  brandId: v.id("brands"),
  name: v.string(),                    // Person, brand, podcast, community name
  category: v.string(),                // influencer | brand | podcast | blog | youtube | community | keyword_interest
  platform: v.optional(v.string()),    // instagram | youtube | podcast | blog | pinterest | facebook | linkedin
  url: v.optional(v.string()),         // Profile/channel/site URL
  audienceSize: v.optional(v.number()),// Follower/subscriber count
  audienceOverlap: v.optional(v.string()), // How their audience maps to dream customer
  // Relationship tracking (Play 3: Dig Your Well)
  phase: v.string(),                   // identified | subscribed | engaging | dialogue | fan | collaborating
  lastEngagementAt: v.optional(v.number()),
  notes: v.optional(v.string()),
  // Targeting
  adTargetable: v.optional(v.boolean()), // Can target their audience via paid ads?
  adTargetId: v.optional(v.string()),    // Platform interest/audience ID
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_brand_category", ["brandId", "category"])
  .index("by_brand_phase", ["brandId", "phase"]),

// ── Dream 100 Activities ─────────────────────────────────
// Log of relationship-building actions taken
dream100Activities: defineTable({
  dream100Id: v.id("dream100"),
  brandId: v.id("brands"),
  type: v.string(),                    // subscribed | commented | dm_sent | bought_product | shared_content | interviewed | collaborated
  description: v.string(),
  performedBy: v.string(),             // agent | user
  createdAt: v.number(),
})
  .index("by_dream100", ["dream100Id"])
  .index("by_brand", ["brandId"]),

// ── Outreach Campaigns ───────────────────────────────────
outreachCampaigns: defineTable({
  brandId: v.id("brands"),
  name: v.string(),
  type: v.string(),                    // cold_email | podcast_pitch | partnership | pastor_outreach | influencer_collab
  status: v.string(),                  // draft | active | paused | completed
  // Targeting
  targetAudience: v.string(),          // Description of who we're reaching
  targetCount: v.optional(v.number()), // How many contacts in campaign
  // Templates
  subjectTemplate: v.optional(v.string()),
  bodyTemplate: v.string(),
  followUpTemplates: v.optional(v.array(v.string())),
  followUpIntervalDays: v.optional(v.number()),
  // Stats
  sent: v.optional(v.number()),
  opened: v.optional(v.number()),
  replied: v.optional(v.number()),
  converted: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_brand_type", ["brandId", "type"])
  .index("by_status", ["status"]),

// ── Outreach Messages ────────────────────────────────────
outreachMessages: defineTable({
  campaignId: v.id("outreachCampaigns"),
  contactId: v.id("contacts"),
  brandId: v.id("brands"),
  type: v.string(),                    // initial | follow_up_1 | follow_up_2 | follow_up_3
  subject: v.string(),
  body: v.string(),
  status: v.string(),                  // queued | sent | opened | replied | bounced
  sentAt: v.optional(v.number()),
  openedAt: v.optional(v.number()),
  repliedAt: v.optional(v.number()),
  replyContent: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_campaign", ["campaignId"])
  .index("by_contact", ["contactId"])
  .index("by_status", ["status"]),

// ── Contacts ─────────────────────────────────────────────
// People database for outreach
contacts: defineTable({
  brandId: v.id("brands"),
  name: v.string(),
  email: v.optional(v.string()),
  role: v.optional(v.string()),        // pastor | podcast_host | influencer | blogger | potential_customer
  organization: v.optional(v.string()),// Church name, podcast name, etc.
  location: v.optional(v.string()),
  socialUrls: v.optional(v.any()),     // { instagram, linkedin, twitter, etc. }
  tags: v.optional(v.array(v.string())),
  dream100Id: v.optional(v.id("dream100")), // Link to Dream 100 entry if applicable
  // Relationship state
  status: v.string(),                  // prospect | contacted | warm | converted | unresponsive
  lastContactedAt: v.optional(v.number()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_brand_role", ["brandId", "role"])
  .index("by_status", ["status"])
  .index("by_email", ["email"]),

// ── Content IDs ──────────────────────────────────────────
// The attribution spine (from revenue attribution doc)
contentIds: defineTable({
  branchId: v.id("branches"),
  brandId: v.id("brands"),
  contentId: v.string(),               // ALK-20260411-PIN-AFFIRM-A-BEDTIME
  // Parsed components
  brandPrefix: v.string(),             // ALK
  publishDate: v.string(),             // 20260411
  platformCode: v.string(),            // PIN | TIK | IG | FB | YT | BLG | EML | LI
  templateCode: v.string(),            // AFFIRM | PROB | STORY | HOW | LIST | COMPARE | TESTI | MOCKUP
  variantCode: v.string(),             // A | B | C
  hookCode: v.string(),                // BEDTIME | IDENTITY | FAITH | GIFT | MILESTONE | FEAR | ROUTINE
  // Generated UTM URL
  utmUrl: v.string(),
  utmSource: v.string(),
  utmMedium: v.string(),
  utmCampaign: v.string(),
  utmContent: v.string(),
  utmTerm: v.string(),
  createdAt: v.number(),
})
  .index("by_branch", ["branchId"])
  .index("by_brand", ["brandId"])
  .index("by_content_id", ["contentId"]),

// ── Performance Snapshots ────────────────────────────────
// Periodic analytics from external sources
performanceSnapshots: defineTable({
  brandId: v.id("brands"),
  source: v.string(),                  // posthog | buffer | search_console | stripe | pinterest_analytics
  period: v.string(),                  // daily | weekly | monthly
  periodStart: v.number(),
  periodEnd: v.number(),
  metrics: v.any(),                    // Source-specific metrics blob
  // Derived insights
  topPerformers: v.optional(v.array(v.string())), // Content IDs
  bottomPerformers: v.optional(v.array(v.string())),
  insights: v.optional(v.string()),    // AI-generated insight summary
  createdAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_brand_source", ["brandId", "source"])
  .index("by_period", ["periodStart"]),

// ── Research Briefs ──────────────────────────────────────
researchBriefs: defineTable({
  brandId: v.id("brands"),
  type: v.string(),                    // weekly_editorial | daily_trend | competitor_watch | keyword_gap | aeo_visibility
  title: v.string(),
  content: v.string(),                 // Markdown research output
  // Structured data
  trendingTopics: v.optional(v.array(v.string())),
  keywordOpportunities: v.optional(v.array(v.object({
    keyword: v.string(),
    volume: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    currentRanking: v.optional(v.number()),
  }))),
  competitorUpdates: v.optional(v.array(v.string())),
  contentRecommendations: v.optional(v.array(v.string())),
  createdAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_brand_type", ["brandId", "type"]),

// ── Ad Campaigns ─────────────────────────────────────────
adCampaigns: defineTable({
  brandId: v.id("brands"),
  platform: v.string(),                // meta | google | pinterest | youtube
  name: v.string(),
  type: v.string(),                    // prospecting | retargeting
  status: v.string(),                  // draft | active | paused | completed
  // Targeting (Dream 100 interest-based)
  targetInterests: v.optional(v.array(v.string())),
  targetDream100Ids: v.optional(v.array(v.string())),
  // Budget
  dailyBudget: v.optional(v.number()),
  totalSpent: v.optional(v.number()),
  // Performance
  impressions: v.optional(v.number()),
  clicks: v.optional(v.number()),
  conversions: v.optional(v.number()),
  revenue: v.optional(v.number()),
  cpa: v.optional(v.number()),
  roas: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_brand_platform", ["brandId", "platform"])
  .index("by_status", ["status"]),

// ── Ad Creatives ─────────────────────────────────────────
adCreatives: defineTable({
  campaignId: v.id("adCampaigns"),
  brandId: v.id("brands"),
  // The creative
  hook: v.string(),                    // The attention-grabbing headline/opening
  body: v.string(),                    // Full ad copy
  cta: v.string(),                     // Call to action
  visualDirection: v.optional(v.string()), // Design brief for the visual
  destinationUrl: v.string(),          // UTM-tagged landing page
  // Variant tracking
  variant: v.string(),                 // A | B | C
  contentIdRef: v.optional(v.string()),// Links to contentIds table
  // Performance
  impressions: v.optional(v.number()),
  clicks: v.optional(v.number()),
  conversions: v.optional(v.number()),
  status: v.string(),                  // draft | active | paused | winner | loser
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_campaign", ["campaignId"])
  .index("by_brand", ["brandId"]),

// ── Lead Magnets ─────────────────────────────────────────
leadMagnets: defineTable({
  brandId: v.id("brands"),
  name: v.string(),                    // "5-Minute Bedtime Affirmation Cards"
  type: v.string(),                    // checklist | guide | template | mini_course | quiz | free_chapter
  description: v.string(),
  // The funnel
  landingPageUrl: v.optional(v.string()),
  deliveryMethod: v.string(),          // email | download | redirect
  deliveryContent: v.optional(v.string()), // Email copy or download URL
  // Follow-up
  emailSequenceId: v.optional(v.string()), // Links to emailSequences
  // Performance
  visits: v.optional(v.number()),
  optIns: v.optional(v.number()),
  conversionRate: v.optional(v.number()),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_brand", ["brandId"]),

// ── Email Sequences ──────────────────────────────────────
emailSequences: defineTable({
  brandId: v.id("brands"),
  name: v.string(),
  type: v.string(),                    // soap_opera | seinfeld_daily | launch | follow_up | nurture
  triggerEvent: v.string(),            // lead_magnet_optin | purchase | signup | manual
  // Sequence config
  emailCount: v.number(),
  intervalDays: v.number(),            // Days between emails
  // State
  status: v.string(),                  // draft | active | paused
  subscriberCount: v.optional(v.number()),
  // Performance
  avgOpenRate: v.optional(v.number()),
  avgClickRate: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_brand_type", ["brandId", "type"]),

// ── Email Messages ───────────────────────────────────────
emailMessages: defineTable({
  sequenceId: v.id("emailSequences"),
  brandId: v.id("brands"),
  position: v.number(),                // Order in sequence (1, 2, 3...)
  subject: v.string(),
  body: v.string(),                    // HTML email content
  // Close type (Brunson's Three Closes)
  closeType: v.optional(v.string()),   // emotion | logic | fear
  // Performance per message
  sent: v.optional(v.number()),
  opened: v.optional(v.number()),
  clicked: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_sequence", ["sequenceId"]),

// ── SEO Targets ──────────────────────────────────────────
seoTargets: defineTable({
  brandId: v.id("brands"),
  keyword: v.string(),
  searchVolume: v.optional(v.number()),
  difficulty: v.optional(v.string()),  // easy | medium | hard
  intent: v.optional(v.string()),      // informational | transactional | navigational
  // Current state
  currentRanking: v.optional(v.number()),
  currentUrl: v.optional(v.string()),  // Which page ranks for this
  // Target
  targetUrl: v.optional(v.string()),   // Which page should rank
  branchId: v.optional(v.id("branches")), // Content targeting this keyword
  // Tracking
  lastCheckedAt: v.optional(v.number()),
  rankingHistory: v.optional(v.any()), // Array of { date, position }
  status: v.string(),                  // target | ranking | top10 | top3 | featured
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_keyword", ["keyword"])
  .index("by_status", ["status"]),

// ── AEO Checks ──────────────────────────────────────────
aeoChecks: defineTable({
  brandId: v.id("brands"),
  query: v.string(),                   // "personalized children's books" | "Christian children's books"
  engine: v.string(),                  // chatgpt | perplexity | google_ai_overview
  cited: v.boolean(),                  // Was AlreadyLoved cited?
  citedUrl: v.optional(v.string()),
  position: v.optional(v.number()),    // Position in citations if cited
  competitorsCited: v.optional(v.array(v.string())),
  fullResponse: v.optional(v.string()),
  checkedAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_brand_engine", ["brandId", "engine"]),

// ── Video Scripts ────────────────────────────────────────
videoScripts: defineTable({
  branchId: v.optional(v.id("branches")), // Link to branch if derived
  brandId: v.id("brands"),
  type: v.string(),                    // short_form | long_form | ugc | podcast_talking_points
  title: v.string(),
  // Script content
  hook: v.string(),                    // First 3 seconds / opening line
  script: v.string(),                  // Full script body
  cta: v.string(),                     // Closing call to action
  duration: v.optional(v.string()),    // Estimated duration
  // UGC-specific
  creatorBrief: v.optional(v.string()),// Brief for UGC creator
  talkingPoints: v.optional(v.array(v.string())),
  // State
  status: v.string(),                  // draft | approved | filmed | published
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_type", ["type"])
  .index("by_status", ["status"]),
```

### Schema Modifications to Existing Tables

```typescript
// ── brands table additions ───────────────────────────────
// Add to existing brands table:
brandPrefix: v.optional(v.string()),       // ALK, ASB, etc. for Content ID
baseUrl: v.optional(v.string()),           // https://alreadylovedkids.com
defaultUtmMedium: v.optional(v.string()),  // social, email, etc.
// Token budget system
tokenBudget: v.optional(v.object({
  dailyLimit: v.number(),
  currentSpend: v.number(),
  alertThreshold: v.number(),
  modelTiers: v.any(),
})),
// Platform strategy
platformStrategy: v.optional(v.any()),     // { pinterest: { role: "top_funnel", ... }, ... }

// ── seeds table additions ────────────────────────────────
// Already has: purpose, contentPillar, targetKeywords
// Add:
hookAngle: v.optional(v.string()),         // BEDTIME | IDENTITY | FAITH | GIFT | etc.
templateType: v.optional(v.string()),      // AFFIRM | PROB | STORY | HOW | etc.
dream100Source: v.optional(v.id("dream100")), // If inspired by Dream 100 monitoring
researchBriefId: v.optional(v.string()),   // Which research brief spawned this

// ── branches table additions ─────────────────────────────
// Add:
contentIdRef: v.optional(v.string()),      // Links to contentIds table
utmUrl: v.optional(v.string()),            // Pre-generated UTM URL
seoTargetId: v.optional(v.string()),       // If targeting a specific keyword
```

---

## MCP Server Tools

### Research Tools
| Tool | Description | Used By |
|------|-------------|---------|
| `scan_trends` | Search web for trending topics in brand's niche | Cowork (daily/weekly) |
| `research_keywords` | Find keyword opportunities with volume/difficulty | Cowork (weekly) |
| `check_aeo_visibility` | Query ChatGPT/Perplexity for brand citations | Cowork (bi-weekly) |
| `monitor_competitors` | Check competitor activity (new products, campaigns) | Cowork (bi-weekly) |
| `build_dream100` | Research and populate Dream 100 for a brand | Carson + Cowork |
| `create_research_brief` | Compile research into structured brief | Cowork (daily/weekly) |

### Content Tools (extend existing)
| Tool | Description | Used By |
|------|-------------|---------|
| `create_seed` | Already exists | Carson, Cowork, agents |
| `approve_seed` | Already exists | User (via UI), Carson |
| `generate_content_id` | Create Content ID + UTM for a branch | Pipeline (auto on publish) |
| `write_video_script` | Generate video script from seed/branch | Writer agent |
| `write_ugc_brief` | Generate UGC creator brief | Writer agent |
| `write_ad_copy` | Generate ad creative variants | Writer agent |

### Outreach Tools
| Tool | Description | Used By |
|------|-------------|---------|
| `create_outreach_campaign` | Set up a new outreach campaign | Carson |
| `generate_outreach_message` | Write personalized cold email/pitch | Writer agent |
| `send_outreach` | Send via email API (future: Instantly, Lemlist) | Outreach agent |
| `log_dream100_activity` | Record engagement with Dream 100 contact | Carson, agents |
| `manage_contacts` | CRUD operations on contacts database | Carson, agents |

### Email Tools
| Tool | Description | Used By |
|------|-------------|---------|
| `create_email_sequence` | Define a new email sequence | Carson, Strategist |
| `write_email` | Draft an email for a sequence | Writer agent |
| `schedule_email_send` | Queue email via Beehiiv/email provider | Publisher agent |

### Analytics Tools
| Tool | Description | Used By |
|------|-------------|---------|
| `ingest_posthog_data` | Pull funnel/attribution data from PostHog | Cowork (daily) |
| `ingest_buffer_analytics` | Pull post performance from Buffer | Cowork (daily) |
| `ingest_search_console` | Pull keyword rankings and clicks | Cowork (weekly) |
| `generate_scorecard` | Create creative scorecard ranking | Cowork (weekly) |
| `update_performance_intelligence` | Update the SKILL-performance.md equivalent | Cowork (weekly) |

### SEO/AEO Tools
| Tool | Description | Used By |
|------|-------------|---------|
| `track_keywords` | Monitor keyword rankings over time | Cowork (weekly) |
| `generate_schema_markup` | Create JSON-LD schema for a page | Writer agent |
| `suggest_internal_links` | Analyze content for linking opportunities | SEO agent |
| `audit_page_seo` | Analyze a published page for SEO issues | Cowork (monthly) |

### Visual Tools
| Tool | Description | Used By |
|------|-------------|---------|
| `fill_canva_template` | Fill a Canva template via MCP | Design agent |
| `generate_design_direction` | Write visual brief for a content piece | Writer agent |
| `list_brand_assets` | List available Canva templates and brand kit | Any agent |

### Ad Tools
| Tool | Description | Used By |
|------|-------------|---------|
| `create_ad_campaign` | Set up campaign targeting Dream 100 audiences | Carson, Strategist |
| `generate_ad_variants` | Create A/B/C ad copy variants | Writer agent |
| `track_ad_performance` | Pull ad metrics from platform | Cowork (daily) |

---

## Production Line Details

### Line 1: Content (Enhanced Existing Pipeline)

**What changes:** Add Content ID + UTM generation to the publishing step. Add new formats. Every published branch gets a contentId record with full UTM URL.

**Flow:**
```
Seed (approved) → Branches created per format → Writer writes draft
→ Draft reviewed/auto-approved → Content ID generated → UTM URL created
→ Published to Buffer with UTM link → Content ID logged
```

**UTM generation happens in `buffer.ts`** — when a branch is approved and about to publish, the system:
1. Generates Content ID from seed metadata (hook, template, platform, variant)
2. Builds UTM URL using brand's base URL + Content ID
3. Appends UTM URL to the draft body (for social) or sets as pin destination (for Pinterest)
4. Creates `contentIds` record linking branch → Content ID → UTM URL
5. Publishes to Buffer

### Line 2: Video Scripts

**Flow:**
```
Seed (approved) → If video format in targets → videoScripts record created
→ Writer generates script with hook/body/CTA structure
→ Script available for recording (UGC brief sent to creator or added to filming queue)
```

Not published via Buffer — output is a script document. For UGC, includes creator brief with talking points.

### Line 3: Ads

**Flow:**
```
Dream 100 list → Extract targetable interests → Create ad campaign
→ Writer generates 3+ hook variants per campaign
→ Each variant gets Content ID + UTM
→ Campaigns managed in platform (manual for now, API later)
→ Performance data ingested back via analytics line
```

**Primitive:** Store campaigns and creatives in Convex. Generate the copy. Manual ad platform management initially, with API integration as a future enhancement.

### Line 4: Email

**Flow:**
```
Lead magnet opt-in → Trigger Soap Opera sequence
→ Writer generates sequence emails (emotion → logic → fear)
→ Emails sent via Beehiiv API on schedule
→ After sequence complete → transition to Seinfeld daily list
→ Daily email = repurposed content with story wrapper + offer CTA
```

**Integration:** Beehiiv connector (new integration type, same pluggable pattern as Buffer).

### Line 5: SEO/AEO

**Flow:**
```
Keyword research → seoTargets populated → Seeds generated targeting keywords
→ Blog articles written with SEO optimization (keyword placement, headers, meta)
→ Schema markup generated per article
→ AEO formatting (direct answer paragraphs, FAQ sections)
→ Rankings tracked over time → feeds back into research
```

**Integrated into existing pipeline:** Seeds already have `purpose` (seo, aeo) and `targetKeywords`. The Writer agent reads seoTargets when writing blog format.

### Line 6: Visual

**Flow:**
```
Branch approved → Design direction generated (part of draft)
→ Canva MCP fills template with text + brand colors
→ Visual asset URL stored on branch (externalDesignUrl)
→ Published with content
```

**Depends on:** Canva MCP integration. Brand kit ID already known: `kAG_1wVMiiw`.

### Line 7: Outreach

**Flow:**
```
Dream 100 list → Identify outreach targets
→ Campaign created (cold_email | podcast_pitch | pastor_outreach)
→ Writer generates personalized messages using contact + brand context
→ Messages queued → sent via email API
→ Responses tracked → follow-ups auto-generated
→ Conversions logged
```

**For pastors specifically:**
- Contact database populated with children's church pastors
- Personalized cold email: introduce AlreadyLoved, offer free sample book
- Follow-up sequence: 3 emails over 14 days
- Goal: get books into church children's libraries, get bulk orders

### Line 8: Research

**Flow:**
```
Cowork scheduled tasks → scan trends, keywords, competitors
→ Research briefs created in Convex
→ Carson reads briefs → creates strategic seeds
→ AEO checks logged → visibility tracked over time
→ Dream 100 list maintained and updated
```

**Extends existing knowledge base:** YouTube transcript ingestion continues. Adds web search, keyword tools, competitor monitoring.

### Line 9: Analytics / Attribution

**Flow:**
```
PostHog SDK on alreadylovedkids.com captures UTM + funnel events
→ Stripe webhook sends purchase_completed with UTM metadata to PostHog
→ Cowork daily: pulls PostHog data → creates performanceSnapshot
→ Cowork weekly: generates creative scorecard (template/hook/platform rankings)
→ Scorecard feeds into Strategist's seed generation
→ Content Performance Intelligence updated in Sweet Heat
```

**The learning loop closes:** Performance data → Strategist reads it → generates better seeds → content improves → performance improves → repeat.

---

## The Dual Orchestrator Model

### Carson (Hermes on Hetzner)

**Role:** Brand strategist, taste curator, proactive coordinator.

| Responsibility | How |
|---|---|
| Morning seed generation | Reads research briefs + performance data → creates strategic seeds via MCP |
| Dream 100 management | Builds and maintains Dream 100, logs relationship activities |
| Outreach coordination | Creates campaigns, reviews responses, escalates warm leads |
| Brand strategy | Sets content mix targets, adjusts platform allocation |
| Taste learning | Tracks approval/rejection patterns, updates brand voice understanding |
| Cross-brand decisions | Allocates resources across AlreadyLoved + other brands |

**MCP connection:** Carson connects to Sweet Heat's MCP server via Tailscale network. Full read/write access to all tables.

### Cowork (Claude Desktop Scheduled Tasks)

| Task | Trigger | Output |
|---|---|---|
| `daily-sales-monitor` | Daily 9 AM | Slack: revenue, visitors, wizard starts |
| `daily-trend-pulse` | Daily 7 AM | Slack: trending topics or "all clear" |
| `weekly-research-briefing` | Monday 7 AM | Research brief in Convex + Slack |
| `weekly-performance-review` | Saturday 9 AM | Scorecard + updated performance intelligence |
| `pinterest-weekly-report` | Friday 9 AM | Top pins by clicks/saves |
| `aeo-visibility-check` | Bi-weekly Monday 10 AM | AEO check records in Convex |
| `competitor-watch` | Bi-weekly Wednesday 8 AM | Competitor updates in Slack |
| `revenue-milestone-alert` | Daily 10 AM | Slack celebration at milestones |
| `monthly-deep-dive` | 1st of month 9 AM | Monthly strategy report |

### Interaction Pattern

```
Carson: "I see Pinterest AFFIRM+BEDTIME pins are converting 3x average.
         Creating 5 new seeds doubling down on this pattern."
         → Creates seeds via MCP → Seeds appear in Sweet Heat queue

Cowork: (Saturday 9 AM) "Weekly scorecard ready. Top performer:
         AFFIRM+BEDTIME template. Recommending 40% allocation."
         → Creates performanceSnapshot via MCP

Carson: (reads snapshot) "Adjusting strategy. Also noticed a trending
         topic about screen time guilt. Creating an experimental seed."
         → Creates seed with purpose: "engagement", hookAngle: "FEAR"
```

---

## Attribution System (Content ID + UTM + DataFast + PostHog + Stripe)

### Content ID Format
```
{BrandPrefix}-{YYYYMMDD}-{Platform}-{Template}-{Variant}-{Hook}
Example: ALK-20260411-PIN-AFFIRM-A-BEDTIME
```

### UTM Mapping
| UTM Parameter | Value | Example |
|---|---|---|
| utm_source | Platform name (lowercase) | pinterest |
| utm_medium | Channel type | social |
| utm_campaign | {funnel_stage}-{content_pillar}-{YYYYMM} | awareness-custom_book-202604 |
| utm_content | Full Content ID (lowercase) | alk-20260411-pin-affirm-a-bedtime |
| utm_term | Hook keyword | bedtime |

### DataFast (Primary Analytics + Revenue Attribution)
DataFast is the primary analytics layer. Simpler than PostHog, built-in revenue attribution via Stripe, and has an API for programmatic access.

**Setup on alreadylovedkids.com:**
- Install tracking script in `<head>` with `data-website-id` and `data-domain`
- Connect Stripe in DataFast settings (automatic revenue attribution)
- Pass `datafast_visitor_id` + `datafast_session_id` cookies as Stripe checkout metadata
- Custom goals: `wizard_started`, `wizard_completed`, `checkout_started`
- Conversion funnels: pageview → wizard_started → wizard_completed → checkout_started → payment

**DataFast automatically tracks:**
- All UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`)
- Also `ref`, `source`, `via` parameters
- Revenue attribution per traffic source
- Conversion funnels with revenue at each step
- Google Search Console integration (keyword → revenue estimates)

**DataFast API for programmatic access:**
- `GET /api/v1/analytics/timeseries` — visitors, sessions, revenue over time
- `GET /api/v1/analytics/campaigns` — UTM breakdown with revenue
- `GET /api/v1/analytics/referrers` — traffic sources with revenue
- `GET /api/v1/analytics/pages` — page performance with revenue
- `GET /api/v1/analytics/overview` — aggregate metrics
- `GET /api/v1/analytics/realtime` — current active visitors
- `POST /api/v1/goals` — create custom goal events server-side

The Cowork analytics tasks pull data via DataFast API to create performanceSnapshots in Sweet Heat.

### PostHog (Secondary — Deep Analysis)
PostHog supplements DataFast for:
- Session replay (watch user behavior)
- `$initial_utm_*` person properties (first-touch attribution across sessions)
- HogQL queries for advanced template/hook/platform analysis
- Cohort analysis

### Stripe Bridge
- UTM params stored in cookies on landing
- Passed as metadata on Stripe Checkout Session + PaymentIntent
- Include both `datafast_visitor_id`/`datafast_session_id` AND `posthog_person_distinct_id`
- DataFast handles revenue attribution automatically via Stripe connection
- PostHog gets `purchase_completed` event via webhook for deeper analysis

### Communication Layer (Slack)
Carson and Cowork report to Batsirai and Aimee via Slack:

| Report | Cadence | Channel | Contents |
|---|---|---|---|
| Daily ops | Every morning | #content | What was done yesterday, what's planned today, any human action needed |
| Traffic pulse | Every morning | #dashboard | Visitors, top sources, wizard starts, purchases, revenue |
| Weekly scorecard | Saturday | #dashboard | Is traffic growing? Top content, platform performance, revenue attribution |
| Milestone alerts | On event | #dashboard | Revenue milestones, traffic milestones, first ranking achievements |
| Monthly deep dive | 1st of month | #dashboard | Full month report, strategy adjustments, trajectory to 1,000 books |

---

## Extended Branch Formats

Adding to the existing format list:

| Format | Platform | Line |
|---|---|---|
| `video_script_short` | TikTok/Reels/Shorts | Video |
| `video_script_long` | YouTube | Video |
| `ugc_script` | Any (creator films it) | Video |
| `podcast_show_notes` | Podcast platforms | Video |
| `ad_copy_prospecting` | Meta/Google/Pinterest | Ads |
| `ad_copy_retargeting` | Meta/Google | Ads |
| `email_soap_opera` | Beehiiv/email | Email |
| `email_seinfeld` | Beehiiv/email | Email |
| `lead_magnet_copy` | Website | Email |
| `cold_email` | Email direct | Outreach |
| `podcast_pitch` | Email to hosts | Outreach |
| `schema_markup` | Website (JSON-LD) | SEO |

---

## Verification Plan

### End-to-End Test: Full Factory Cycle

1. **Research** → Create a research brief via MCP → verify it appears in Convex
2. **Seed** → Carson creates a seed from the brief → verify seed in "pitched" status
3. **Approve** → Approve seed → verify branches created for all active formats
4. **Write** → Verify drafts written for each branch (blog first, derivatives after)
5. **Content ID** → Verify contentIds record created with UTM URL
6. **Publish** → Verify branch sent to Buffer with UTM-tagged link
7. **Track** → Hit the UTM URL → verify PostHog captures UTM params
8. **Attribute** → Complete a test purchase → verify Stripe metadata contains UTMs
9. **Learn** → Run analytics ingestion → verify performanceSnapshot created
10. **Improve** → Verify scorecard ranks content by performance

### Subsystem Tests

- **Outreach:** Create campaign → generate messages → verify in Convex (don't actually send)
- **Dream 100:** Add contacts → log activities → verify phase progression
- **Email:** Create sequence → generate emails → verify Beehiiv API call structure
- **SEO:** Add keyword target → verify seed created with targetKeywords
- **AEO:** Run visibility check → verify aeoChecks record
- **Visual:** Generate design direction → verify Canva MCP call structure
- **Ads:** Create campaign → generate variants → verify Content IDs generated
- **Video:** Create video script → verify hook/script/CTA structure

### MCP Server Test

Both Carson and Cowork should be able to:
- Create a seed
- Read performance data
- Create an outreach campaign
- Generate a research brief
- All via the same MCP tool interface

---

## What Exists vs. What's New

| Component | Status | Work Required |
|---|---|---|
| Seeds → Branches → Drafts pipeline | Exists | Add Content ID generation on publish |
| Buffer publishing | Exists | Add UTM URL injection |
| Knowledge base (YouTube → wiki) | Exists | Extend with web research sources |
| Brand voice training | Exists | No changes |
| Chrome extension ingest | Exists | No changes |
| Inbox | Exists | No changes |
| Agent API routes | Exist | Extend with new tools |
| MCP server (14 tools) | Exists (working) | Extend with new tool groups |
| Feedback learning loop | Exists | Connect to performanceSnapshots |
| Content ID system | New | Schema + generation logic |
| UTM generation | New | Integrate into publish step |
| PostHog integration | New | SDK on site + webhook handler |
| Stripe attribution bridge | New | Metadata on checkout + webhook |
| Dream 100 | New | Schema + MCP tools |
| Outreach engine | New | Schema + MCP tools + email integration |
| Ad management | New | Schema + MCP tools |
| Email sequences | New | Schema + Beehiiv connector |
| SEO tracking | New | Schema + MCP tools |
| AEO checks | New | Schema + MCP tools |
| Video scripts | New | Schema + writer prompts |
| Performance analytics | New | Schema + PostHog/Buffer ingestion |
| Research automation | New | Schema + web search tools |
| Canva integration | New | MCP connector |
| Cowork scheduled tasks | New | Task definitions (outside Sweet Heat) |
| Carson MCP bridge | New | MCP server deployment |
| seed_create MCP/API gap | Bug | MCP sends purpose/pillar/keywords but API route + mutation ignore them |

---

## Deployment Ordering (Safe Deploy)

New tables must be deployed schema-first, respecting foreign key dependencies. Code that references new tables comes after the schema is live.

**Wave 1 — Independent tables (no FK deps on other new tables):**
```
contacts, dream100, contentIds, performanceSnapshots, researchBriefs,
leadMagnets, seoTargets, aeoChecks, videoScripts, emailSequences
```

**Wave 2 — Tables with FK deps on Wave 1:**
```
dream100Activities (depends on dream100)
outreachCampaigns (no new-table deps)
adCampaigns (no new-table deps)
emailMessages (depends on emailSequences)
```

**Wave 3 — Tables with FK deps on Wave 2:**
```
outreachMessages (depends on outreachCampaigns + contacts)
adCreatives (depends on adCampaigns)
```

**Wave 4 — Existing table modifications:**
```
brands: add brandPrefix, baseUrl, tokenBudget, platformStrategy
seeds: add hookAngle, templateType, researchBriefId (dream100Source deferred until dream100 table is live)
branches: add contentIdRef, utmUrl, seoTargetId
```

Each wave: push schema first (`npx convex dev --once`), verify, then deploy code.

---

## Three-Layer Architecture

Every new capability follows the existing pattern: **MCP → SvelteKit API → Convex**.

```
MCP Tool (mcp-server/index.js)
  → HTTP call to SvelteKit API route (src/routes/api/*)
    → Convex client call (query/mutation/action)
```

For each new MCP tool group, we need:
1. **Convex module** (e.g., `convex/outreach.ts`) with queries + mutations
2. **SvelteKit API route** (e.g., `src/routes/api/outreach/+server.ts`) with GET/POST/PATCH
3. **MCP tool registration** in `mcp-server/index.js`

New API route files needed:
```
src/routes/api/dream100/+server.ts
src/routes/api/outreach/+server.ts
src/routes/api/outreach/[campaignId]/messages/+server.ts
src/routes/api/contacts/+server.ts
src/routes/api/content-ids/+server.ts
src/routes/api/analytics/snapshots/+server.ts
src/routes/api/analytics/scorecard/+server.ts
src/routes/api/research/+server.ts
src/routes/api/ads/+server.ts
src/routes/api/ads/[campaignId]/creatives/+server.ts
src/routes/api/email/sequences/+server.ts
src/routes/api/email/messages/+server.ts
src/routes/api/seo/+server.ts
src/routes/api/aeo/+server.ts
src/routes/api/video-scripts/+server.ts
src/routes/api/lead-magnets/+server.ts
```

New Convex modules needed:
```
convex/dream100.ts
convex/outreach.ts
convex/contacts.ts
convex/contentIds.ts
convex/performanceSnapshots.ts
convex/researchBriefs.ts
convex/adCampaigns.ts
convex/emailSequences.ts
convex/seoTargets.ts
convex/aeoChecks.ts
convex/videoScripts.ts
convex/leadMagnets.ts
```

---

## Pipeline Routing: Which Formats Flow Where

Not all formats fit the existing "blog first, derivatives after" pipeline. Three distinct flows:

### Flow 1: Content Pipeline (existing, enhanced)
Formats that derive from a seed and publish via Buffer:
```
blog, tweet, linkedin, caption_ig, caption_tiktok, carousel, pin,
quote_card, newsletter, short_video, schema_markup
```
These go through: Seed → Branch → Draft (via formatPrompts) → Content ID → Buffer publish

### Flow 2: Video Scripts (separate output, not Buffer)
Formats that produce scripts for humans/creators to film:
```
video_script_short, video_script_long, ugc_script, podcast_show_notes
```
These create `videoScripts` records (NOT branches). Output is a script document, not a published post. The existing `short_video` branch format = caption/description for a video. The new `video_script_*` = the actual script to film from.

### Flow 3: Outreach Pipeline (separate from content)
Formats that are person-to-person communication, not public content:
```
cold_email, podcast_pitch, ad_copy_prospecting, ad_copy_retargeting,
email_soap_opera, email_seinfeld, lead_magnet_copy
```
These do NOT flow through the Seeds → Branches pipeline. They have their own tables and flows (outreachMessages, emailMessages, adCreatives, leadMagnets). They are generated by agents but managed through their own CRUD operations.

---

## Known Fixes (Pre-existing Gaps)

### 1. seed_create MCP → API → Convex gap
The MCP tool sends `purpose`, `contentPillar`, `targetKeywords`, `reasoning` but the SvelteKit API route (`src/routes/api/seeds/+server.ts`) and Convex mutation (`convex/seeds.ts:create`) do not pass them through. Fix: update both to accept and persist these fields.

### 2. Schema type fixes in this spec
- `leadMagnets.emailSequenceId`: change from `v.string()` to `v.id("emailSequences")`
- `adCampaigns.targetDream100Ids`: change from `v.array(v.string())` to `v.array(v.id("dream100"))`
- `contacts.role`: rename to `contactType` to avoid confusion with `users.role`

### 3. Missing indexes to add
- `outreachMessages`: add `by_brand` index on `["brandId"]`
- `emailMessages`: add `by_brand` index on `["brandId"]`
- `adCreatives`: add `by_status` index on `["status"]`

---

## Acceleration: 1,000 Books/Month in 3 Months

### The Math
1,000 books × ~$25 = $25K/month. At 2% conversion = 50,000 visitors/month = ~1,670/day.

### Hourly Cadence (Not Daily)
The factory runs in 2-hour cycles, 24/7:
```
Every 2 hours:
  1. Researcher scans for new signals
  2. Strategist creates seeds from signals + performance data
  3. Writer produces content from approved/auto-approved seeds
  4. Publisher distributes across account network
  5. Analytics ingests latest data
  6. Learning loop updates strategy

= 12 cycles/day = 50-100+ content pieces published daily
```

Platform rate limits enforced per cycle. The system knows the rules and stays within them.

### Multi-Account Network Strategy
Each brand operates a themed account network. Different angles, same destination URL:

```
AlreadyLoved Kids (brand)
├── @AlreadyLovedKids (main — all platforms)
├── @BedtimeBookMom (Pinterest + IG — bedtime/routine niche)
├── @FaithFilledReads (TikTok + IG — Christian parenting niche)
├── @PersonalizedKidsBooks (YouTube + SEO — product discovery)
├── @ChristianMomTips (IG + Facebook — parenting advice niche)
└── @ToddlerIdentity (Pinterest — identity/affirmation niche)
```

Each account: distinct voice, distinct content angle, 3-5 posts/day per platform.
Total network output: 20-40 posts/day → all funneling to alreadylovedkids.com.

### Schema Support for Account Networks

```typescript
// ── Platform Accounts ────────────────────────────────────
// Multiple accounts per brand per platform
platformAccounts: defineTable({
  brandId: v.id("brands"),
  platform: v.string(),               // pinterest | instagram | tiktok | twitter | youtube | facebook
  accountName: v.string(),            // @BedtimeBookMom
  accountId: v.optional(v.string()),  // Platform's internal ID
  niche: v.string(),                  // The thematic angle this account covers
  voiceNotes: v.optional(v.string()), // How this account differs from main brand voice
  // Buffer/API connection
  bufferChannelId: v.optional(v.string()),
  directApiCredentials: v.optional(v.any()), // For platforms not on Buffer
  // Rate limiting
  postsPerDay: v.number(),            // Max posts per day for this account
  postsToday: v.optional(v.number()), // Track against limit
  lastPostedAt: v.optional(v.number()),
  // State
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_brand", ["brandId"])
  .index("by_brand_platform", ["brandId", "platform"]),
```

Branch publishing routes to the correct account based on content angle and platform rate limits:
```
Branch (format: pin, seed hookAngle: BEDTIME)
  → Route to @BedtimeBookMom Pinterest account
  → Check: postsToday < postsPerDay?
  → If yes: publish. If no: queue for next cycle.
```

### Platform Limits (The Actual Physics)

| Platform | Safe daily limit per account | Strategy |
|---|---|---|
| Pinterest | 15-25 pins/day | 2-3 accounts × 15 = 30-75 pins/day |
| Instagram | 1-3 feed posts, 5-10 stories/day | 2-3 accounts × 3 = 6-9 posts/day |
| TikTok | 1-3 posts/day | 2-3 accounts × 3 = 6-9 videos/day |
| Twitter/X | 10-25 tweets/day | 2-3 accounts × 15 = 30-75 tweets/day |
| YouTube | 1-2 videos/day | 1-2 accounts, focus on quality |
| Facebook | 1-3 posts/day | 2 accounts, groups more valuable |
| LinkedIn | 1-2 posts/day | 1 account (personal brand) |
| Blog | No limit | 1-2 SEO articles/day |
| Email | 1/day max to same list | Segment lists for more touchpoints |

Network total: **100-200 touchpoints per day** across all accounts and platforms.

### The Three Traffic Engines (Running Simultaneously)

**Engine 1: Organic Content (compounds over months)**
- Blog articles for SEO (takes 3-6 months to rank, but starts compounding)
- Pinterest pins (fastest organic social traffic for e-commerce)
- Social posts across account network
- YouTube (evergreen discovery)
- Output: 50-100 pieces/day across network

**Engine 2: Outreach (immediate but labor-intensive)**
- 500+ cold emails to pastors/month → bulk book orders, church libraries
- 50+ podcast pitch emails/month → guest appearances → audience exposure
- Dream 100 relationship building → collaborations, shout-outs
- Output: 20-30 outreach touches/day

**Engine 3: Paid Ads (fastest to scale, requires working funnel)**
- Meta ads targeting Dream 100 audiences
- Pinterest promoted pins (highest e-commerce intent)
- Google Shopping ads
- Retargeting everyone who visited but didn't buy
- Budget: start $100/day, scale to $500/day when CPA < cart value
- Output: 10,000-50,000 impressions/day

### What Would Actually Get to 1,000 Books in 3 Months

| Month | Visitors | Conversion | Books | Revenue |
|---|---|---|---|---|
| Month 1 | 5,000 | 1% (cold traffic) | 50 | $1,250 |
| Month 2 | 15,000 | 1.5% (learning kicks in) | 225 | $5,625 |
| Month 3 | 50,000 | 2% (optimized) | 1,000 | $25,000 |

**Month 1 levers:** All three engines start simultaneously. Paid ads for immediate traffic. Outreach for bulk pastor orders. Content for compounding.
**Month 2 levers:** Learning loop has 30 days of data. Content mix optimized. Retargeting pools filled. Email list growing.
**Month 3 levers:** SEO starting to rank. Organic compounding. Ad spend scaled on proven winners. Pastor network generating referrals.

The hardest constraint isn't content volume — the agents handle that. The hardest constraint is **funnel conversion rate**. If the website doesn't convert at 2%+, no amount of traffic helps. The attribution system tells you WHERE the funnel breaks.
