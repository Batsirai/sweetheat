import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Organizations ───────────────────────────────────────────────────────
  // Top of the hierarchy: org → users → brands → content.
  // Single-org for now (auto-created on first register), multi-tenant ready.
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    plan: v.optional(v.string()), // free | pro | enterprise (future)
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  // ── Users ───────────────────────────────────────────────────────────────
  users: defineTable({
    organizationId: v.optional(v.id("organizations")), // Which org this user belongs to
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.string(), // owner | admin | editor | viewer
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_org", ["organizationId"]),

  // ── Sessions ────────────────────────────────────────────────────────────
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  // ── Brands ──────────────────────────────────────────────────────────────
  // The content identity. Belongs to an org. Everything below is brand-scoped.
  brands: defineTable({
    organizationId: v.optional(v.id("organizations")), // Which org owns this brand
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    // Voice training
    voiceTraining: v.string(), // General voice and tone guide (markdown)
    interests: v.array(v.string()), // Current thematic interests/pillars
    wordsToUse: v.array(v.string()),
    wordsToAvoid: v.array(v.string()),
    exampleContent: v.array(v.string()), // URLs or text of best-performing content
    // Content config
    activeFormats: v.array(v.string()), // Which formats this brand produces
    repurposeMatrix: v.optional(v.any()), // Rules for auto-repurposing
    // State
    goals: v.optional(v.string()),
    isActive: v.boolean(),
    // Traffic assembly line
    brandPrefix: v.optional(v.string()), // ALK, ASB, etc. for Content ID
    baseUrl: v.optional(v.string()), // https://alreadylovedkids.com
    tokenBudget: v.optional(v.object({
      dailyLimit: v.number(),
      currentSpend: v.number(),
      alertThreshold: v.number(),
      modelTiers: v.any(),
    })),
    platformStrategy: v.optional(v.any()), // { pinterest: { role: "top_funnel", ... }, ... }
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"])
    .index("by_org", ["organizationId"]),

  // ── Seeds (Ideas) ───────────────────────────────────────────────────────
  // Raw content ideas — the entry point of the pipeline.
  seeds: defineTable({
    brandId: v.id("brands"),
    title: v.string(),
    description: v.string(),
    source: v.string(), // knowledge_base | audience_question | remix | interview | industry_radar | work_insight | manual | webhook | import | folder_watch | agent_research | social | blog_existing
    sourceRef: v.optional(v.string()),
    status: v.string(), // pitched | under_review | approved | rejected | archived
    pitchedBy: v.string(), // agent | user
    targetFormats: v.optional(v.array(v.string())),
    // Strategic content planning
    purpose: v.optional(v.string()), // seo | aeo | brand_building | engagement | audience_growth | table_stakes
    contentPillar: v.optional(v.string()), // Brand-defined content pillar/theme
    targetKeywords: v.optional(v.array(v.string())), // SEO/AEO target keywords
    reasoning: v.optional(v.string()), // Agent's reasoning for pitching this seed
    // Feedback from user (learning loop)
    feedbackReason: v.optional(v.string()), // Why user approved/rejected: great_idea | on_brand | good_hook | wrong_tone | not_relevant | duplicate | bad_timing | too_generic | already_covered
    feedbackNote: v.optional(v.string()), // Free-text feedback
    // Attachments (file uploads, etc.)
    attachments: v.optional(v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
    }))),
    // Traffic assembly line
    hookAngle: v.optional(v.string()), // BEDTIME | IDENTITY | FAITH | GIFT | etc.
    templateType: v.optional(v.string()), // AFFIRM | PROB | STORY | HOW | etc.
    dream100Source: v.optional(v.id("dream100")), // If inspired by Dream 100 monitoring
    researchBriefId: v.optional(v.id("researchBriefs")), // Which research brief spawned this
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_status", ["brandId", "status"])
    .index("by_status", ["status"]),

  // ── Branches (Content Pieces) ───────────────────────────────────────────
  // An approved seed under development in a specific content format.
  branches: defineTable({
    seedId: v.id("seeds"),
    brandId: v.id("brands"), // Denormalized for query performance
    format: v.string(), // tweet | linkedin | blog | caption_ig | caption_tiktok | newsletter | carousel | quote_card | pin | thumbnail | short_video | long_video
    status: v.string(), // draft | in_review | revision_requested | approved | scheduled | published | archived
    currentDraftId: v.optional(v.id("drafts")),
    scheduledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    // Integration references (tool-agnostic)
    externalPostId: v.optional(v.string()), // Buffer/other post ID
    externalDesignId: v.optional(v.string()), // Canva/other design ID
    externalDesignUrl: v.optional(v.string()), // Exported asset URL
    newsletterFlag: v.optional(v.boolean()),
    platformMetadata: v.optional(v.any()),
    // Auto-approval tracking
    confidenceScore: v.optional(v.number()), // 0-1, for graduated autonomy
    autoApproved: v.optional(v.boolean()),
    // Traffic assembly line
    contentIdRef: v.optional(v.string()), // Links to contentIds table
    utmUrl: v.optional(v.string()), // Pre-generated UTM URL
    seoTargetId: v.optional(v.string()), // If targeting a specific keyword
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seed", ["seedId"])
    .index("by_brand", ["brandId"])
    .index("by_brand_status", ["brandId", "status"])
    .index("by_brand_format", ["brandId", "format"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledAt"]),

  // ── Drafts (Versioned Content) ──────────────────────────────────────────
  drafts: defineTable({
    branchId: v.id("branches"),
    version: v.number(),
    body: v.string(),
    visualDirection: v.optional(v.string()),
    authoredBy: v.string(), // agent | user
    createdAt: v.number(),
  })
    .index("by_branch", ["branchId"])
    .index("by_branch_version", ["branchId", "version"]),

  // ── Comments ────────────────────────────────────────────────────────────
  comments: defineTable({
    targetType: v.string(), // seed | branch | draft | learning
    targetId: v.string(),
    authoredBy: v.string(), // agent | user
    body: v.string(),
    isQuickFeedback: v.boolean(),
    quickFeedbackType: v.optional(v.string()), // more_actionable | more_concise | break_sections | wrong_tone | add_hook
    createdAt: v.number(),
  })
    .index("by_target", ["targetType", "targetId"]),

  // ── Training ────────────────────────────────────────────────────────────
  // Two-tier system: contributing docs (user ingredients) + primary doc (agent-synthesized).
  // The agent reads primary docs for content generation. Contributing docs are source material.
  training: defineTable({
    brandId: v.id("brands"),
    layer: v.string(), // voice_general | spark_generation | platform_specific | format_specific
    scope: v.optional(v.string()), // Platform or format name
    title: v.string(),
    content: v.string(), // Training content (markdown)
    isPrimary: v.optional(v.boolean()), // true = agent-synthesized primary doc, false/undefined = contributing doc
    synthesizedFrom: v.optional(v.array(v.string())), // IDs of contributing docs used in synthesis
    synthesizedAt: v.optional(v.number()), // When agent last synthesized
    needsResynthesis: v.optional(v.boolean()), // Flag when contributing docs change
    version: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_layer", ["brandId", "layer"]),

  // ── Learnings ───────────────────────────────────────────────────────────
  // Agent-proposed improvements to training.
  learnings: defineTable({
    brandId: v.id("brands"),
    trainingId: v.optional(v.id("training")),
    layer: v.string(),
    proposal: v.string(),
    reasoning: v.string(),
    status: v.string(), // proposed | approved | rejected | incorporated
    sourceRunId: v.optional(v.string()),
    rejectionCount: v.number(),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_status", ["brandId", "status"]),

  // ── Todos ───────────────────────────────────────────────────────────────
  // Coordination layer between creator and agent.
  todos: defineTable({
    brandId: v.optional(v.id("brands")),
    owner: v.string(), // user | agent
    type: v.string(), // review_seed | review_branch | write_draft | revise_draft | generate_seeds | compile_newsletter | review_learning | generate_visuals | schedule_content
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    description: v.string(),
    status: v.string(), // pending | in_progress | completed
    priority: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_brand", ["brandId"])
    .index("by_owner_status", ["owner", "status"])
    .index("by_brand_owner", ["brandId", "owner"]),

  // ── Agent Runs (Observability) ──────────────────────────────────────────
  agentRuns: defineTable({
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    status: v.string(), // running | completed | failed | partial
    brandsProcessed: v.array(v.string()),
    todosCompleted: v.number(),
    seedsGenerated: v.number(),
    draftsWritten: v.number(),
    visualsGenerated: v.number(),
    learningsGenerated: v.number(),
    errors: v.optional(v.array(v.string())),
    summary: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_started", ["startedAt"]),

  // ── Integrations (Pluggable Connectors) ─────────────────────────────────
  // Tool-agnostic integration layer. Buffer today, anything tomorrow.
  integrations: defineTable({
    brandId: v.optional(v.id("brands")), // null = global integration
    provider: v.string(), // buffer | beehiiv | canva | custom
    type: v.string(), // distribution | visual | newsletter | analytics
    name: v.string(), // Human-readable label
    config: v.any(), // Provider-specific config (channel IDs, template IDs, etc.)
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_type", ["brandId", "type"])
    .index("by_provider", ["provider"]),

  // ── Inbox (Universal Input) ─────────────────────────────────────────────
  // Everything flows in here: emails, URLs, notes, files, scout findings.
  // Processed items become knowledge sources that feed seed generation.
  inbox: defineTable({
    brandId: v.optional(v.id("brands")), // Which brand this relates to (null = unassigned)
    type: v.string(), // email | url | note | file | scout
    title: v.string(),
    content: v.string(), // Extracted text content
    // Source metadata
    sourceUrl: v.optional(v.string()), // Original URL
    sourceEmail: v.optional(v.string()), // Sender email
    sourceSubject: v.optional(v.string()), // Email subject
    sourcePlatform: v.optional(v.string()), // reddit | twitter | newsletter | google_alert | perplexity | manual
    // Processing
    status: v.string(), // pending | processed | dismissed
    topicId: v.optional(v.id("knowledgeTopics")), // Linked to knowledge topic after processing
    sourceId: v.optional(v.string()), // Created knowledgeSource ID
    seedId: v.optional(v.id("seeds")), // If directly converted to a seed
    // Agent assessment
    relevanceScore: v.optional(v.number()), // 0-100, how relevant to brand
    suggestedAction: v.optional(v.string()), // ingest_to_topic | create_seed | dismiss | needs_review
    agentNotes: v.optional(v.string()), // Agent's assessment of why this matters
    createdAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  // ── Analytics (Fruit Consumption Tracking) ──────────────────────────────
  // Track which content performs best.
  analytics: defineTable({
    branchId: v.id("branches"),
    brandId: v.id("brands"),
    platform: v.string(),
    metrics: v.any(), // { views, likes, shares, clicks, saves, comments, etc. }
    source: v.string(), // buffer | manual | api
    fetchedAt: v.number(),
  })
    .index("by_branch", ["branchId"])
    .index("by_brand", ["brandId"])
    .index("by_brand_platform", ["brandId", "platform"]),

  // ═══ KNOWLEDGE BASE (Wisdom of the Crowd) ═══════════════════════════════
  // Signal-weighted knowledge engine. YouTube + other sources → compiled wiki → idea briefs → seeds.

  // ── Knowledge Topics ────────────────────────────────────────────────────
  // A topic is a knowledge domain for a brand (e.g., "parenting-toddlers", "senior-nutrition").
  knowledgeTopics: defineTable({
    brandId: v.id("brands"),
    name: v.string(), // Display name
    slug: v.string(), // URL-safe
    description: v.optional(v.string()),
    searchTerms: v.array(v.string()), // YouTube search queries for this topic
    isActive: v.boolean(),
    // Stats (updated by compilation)
    sourceCount: v.optional(v.number()),
    pageCount: v.optional(v.number()),
    ideaCount: v.optional(v.number()),
    lastCompiledAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_slug", ["brandId", "slug"]),

  // ── Knowledge Sources ───────────────────────────────────────────────────
  // Raw source material: YouTube transcripts, articles, notes. LLM reads but never modifies.
  knowledgeSources: defineTable({
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"), // Denormalized
    sourceType: v.string(), // youtube_transcript | article | note | document
    title: v.string(),
    url: v.optional(v.string()),
    // YouTube-specific
    youtubeVideoId: v.optional(v.string()),
    youtubeChannelId: v.optional(v.string()),
    youtubeChannelName: v.optional(v.string()),
    viewCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    commentCount: v.optional(v.number()),
    durationSeconds: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
    // Content — three layers: raw → abstract → summary
    transcript: v.optional(v.string()), // Raw verbatim transcript. Never modified. Source of truth.
    abstract: v.optional(v.string()), // Short overview: what this covers, key topics, who's speaking. Generated at ingest.
    summary: v.optional(v.string()), // Structured LLM extraction: key insights, claims, expert positions. Generated at compile time.
    // Signal scoring
    resonanceScore: v.optional(v.number()), // Composite 0-100
    // Processing state
    status: v.string(), // pending | summarized | compiled | failed
    contentHash: v.optional(v.string()),
    compiledAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_topic", ["topicId"])
    .index("by_brand", ["brandId"])
    .index("by_youtube_video", ["youtubeVideoId"])
    .index("by_status", ["status"])
    .index("by_resonance", ["topicId", "resonanceScore"]),

  // ── Knowledge Pages (Wiki) ──────────────────────────────────────────────
  // LLM-generated and LLM-maintained compiled articles. The persistent, compounding artifact.
  knowledgePages: defineTable({
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"),
    title: v.string(),
    slug: v.string(),
    content: v.string(), // Compiled markdown
    // Metadata
    sourceIds: v.array(v.string()), // Which sources contributed
    entityTags: v.optional(v.array(v.string())), // Extracted entities/concepts
    contradictions: v.optional(v.array(v.string())), // Flagged disagreements
    relatedPages: v.optional(v.array(v.string())), // Cross-references
    // State
    version: v.number(),
    compiledAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_topic", ["topicId"])
    .index("by_brand", ["brandId"])
    .index("by_topic_slug", ["topicId", "slug"]),

  // ── Knowledge Catalysts ─────────────────────────────────────────────────
  // Thematic questions generated from compiled knowledge. Content ideation fuel.
  knowledgeCatalysts: defineTable({
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"),
    question: v.string(),
    sourcePageIds: v.optional(v.array(v.string())), // Wiki pages that inspired this
    usedForIdeaBrief: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_topic", ["topicId"])
    .index("by_brand", ["brandId"]),

  // ── Idea Briefs ─────────────────────────────────────────────────────────
  // Fully formed content ideas generated from wiki knowledge. The output that feeds seeds.
  ideaBriefs: defineTable({
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"),
    status: v.string(), // ready | claimed | produced | archived
    // The idea
    title: v.string(),
    angle: v.string(),
    hook: v.optional(v.string()),
    thesis: v.optional(v.string()),
    // Substance
    keyInsights: v.optional(v.array(v.object({
      insight: v.string(),
      sourceIds: v.array(v.string()),
      resonanceScore: v.optional(v.number()),
    }))),
    expertPerspectives: v.optional(v.array(v.object({
      expert: v.string(),
      position: v.string(),
    }))),
    contradiction: v.optional(v.string()),
    frameworkConnection: v.optional(v.string()), // How this connects to brand's editorial framework
    // Editorial
    suggestedFormats: v.optional(v.array(v.string())),
    estimatedDepth: v.optional(v.string()), // light | medium | deep
    // Scoring
    compositeScore: v.optional(v.number()),
    // Lifecycle
    claimedBy: v.optional(v.string()),
    claimedAt: v.optional(v.number()),
    seedId: v.optional(v.id("seeds")), // If converted to a seed
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_topic", ["topicId"])
    .index("by_brand", ["brandId"])
    .index("by_brand_status", ["brandId", "status"])
    .index("by_score", ["brandId", "compositeScore"]),

  // ── YouTube Channels (Curated) ──────────────────────────────────────────
  // Channels to monitor per brand for autonomous ingestion.
  youtubeChannels: defineTable({
    brandId: v.id("brands"),
    channelId: v.string(),
    channelName: v.string(),
    subscriberCount: v.optional(v.number()),
    authorityScore: v.optional(v.number()),
    autoIngest: v.boolean(), // Auto-ingest new videos above threshold
    ingestThreshold: v.optional(v.number()), // Min resonance score to auto-ingest
    lastScannedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_channel", ["channelId"]),

  // ═══ TRAFFIC ASSEMBLY LINE ══════════════════════════════════════════════
  // Dream 100, outreach, attribution, SEO/AEO, ads, email, research, video.

  // ── Dream 100 ──────────────────────────────────────────────────────────
  // The targeting foundation for everything (Traffic Playbook Foundation 2)
  dream100: defineTable({
    brandId: v.id("brands"),
    name: v.string(), // Person, brand, podcast, community name
    category: v.string(), // influencer | brand | podcast | blog | youtube | community | keyword_interest
    platform: v.optional(v.string()), // instagram | youtube | podcast | blog | pinterest | facebook | linkedin
    url: v.optional(v.string()), // Profile/channel/site URL
    audienceSize: v.optional(v.number()), // Follower/subscriber count
    audienceOverlap: v.optional(v.string()), // How their audience maps to dream customer
    // Relationship tracking (Play 3: Dig Your Well)
    phase: v.string(), // identified | subscribed | engaging | dialogue | fan | collaborating
    lastEngagementAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    // Targeting
    adTargetable: v.optional(v.boolean()), // Can target their audience via paid ads?
    adTargetId: v.optional(v.string()), // Platform interest/audience ID
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_category", ["brandId", "category"])
    .index("by_brand_phase", ["brandId", "phase"]),

  // ── Dream 100 Activities ───────────────────────────────────────────────
  // Log of relationship-building actions taken
  dream100Activities: defineTable({
    dream100Id: v.id("dream100"),
    brandId: v.id("brands"),
    type: v.string(), // subscribed | commented | dm_sent | bought_product | shared_content | interviewed | collaborated
    description: v.string(),
    performedBy: v.string(), // agent | user
    createdAt: v.number(),
  })
    .index("by_dream100", ["dream100Id"])
    .index("by_brand", ["brandId"]),

  // ── Outreach Campaigns ─────────────────────────────────────────────────
  outreachCampaigns: defineTable({
    brandId: v.id("brands"),
    name: v.string(),
    type: v.string(), // cold_email | podcast_pitch | partnership | pastor_outreach | influencer_collab
    status: v.string(), // draft | active | paused | completed
    // Targeting
    targetAudience: v.string(), // Description of who we're reaching
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

  // ── Outreach Messages ──────────────────────────────────────────────────
  outreachMessages: defineTable({
    campaignId: v.id("outreachCampaigns"),
    contactId: v.id("contacts"),
    brandId: v.id("brands"),
    type: v.string(), // initial | follow_up_1 | follow_up_2 | follow_up_3
    subject: v.string(),
    body: v.string(),
    status: v.string(), // queued | sent | opened | replied | bounced
    sentAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    repliedAt: v.optional(v.number()),
    replyContent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_contact", ["contactId"])
    .index("by_status", ["status"])
    .index("by_brand", ["brandId"]),

  // ── Contacts ───────────────────────────────────────────────────────────
  // People database for outreach
  contacts: defineTable({
    brandId: v.id("brands"),
    name: v.string(),
    email: v.optional(v.string()),
    contactType: v.optional(v.string()), // pastor | podcast_host | influencer | blogger | potential_customer
    organization: v.optional(v.string()), // Church name, podcast name, etc.
    location: v.optional(v.string()),
    socialUrls: v.optional(v.any()), // { instagram, linkedin, twitter, etc. }
    tags: v.optional(v.array(v.string())),
    dream100Id: v.optional(v.id("dream100")), // Link to Dream 100 entry if applicable
    // Relationship state
    status: v.string(), // prospect | contacted | warm | converted | unresponsive
    lastContactedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_contactType", ["brandId", "contactType"])
    .index("by_status", ["status"])
    .index("by_email", ["email"]),

  // ── Content IDs ────────────────────────────────────────────────────────
  // The attribution spine (from revenue attribution doc)
  contentIds: defineTable({
    branchId: v.id("branches"),
    brandId: v.id("brands"),
    contentId: v.string(), // ALK-20260411-PIN-AFFIRM-A-BEDTIME
    // Parsed components
    brandPrefix: v.string(), // ALK
    publishDate: v.string(), // 20260411
    platformCode: v.string(), // PIN | TIK | IG | FB | YT | BLG | EML | LI
    templateCode: v.string(), // AFFIRM | PROB | STORY | HOW | LIST | COMPARE | TESTI | MOCKUP
    variantCode: v.string(), // A | B | C
    hookCode: v.string(), // BEDTIME | IDENTITY | FAITH | GIFT | MILESTONE | FEAR | ROUTINE
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

  // ── Performance Snapshots ──────────────────────────────────────────────
  // Periodic analytics from external sources
  performanceSnapshots: defineTable({
    brandId: v.id("brands"),
    source: v.string(), // posthog | buffer | search_console | stripe | pinterest_analytics
    period: v.string(), // daily | weekly | monthly
    periodStart: v.number(),
    periodEnd: v.number(),
    metrics: v.any(), // Source-specific metrics blob
    // Derived insights
    topPerformers: v.optional(v.array(v.string())), // Content IDs
    bottomPerformers: v.optional(v.array(v.string())),
    insights: v.optional(v.string()), // AI-generated insight summary
    createdAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_source", ["brandId", "source"])
    .index("by_period", ["periodStart"]),

  // ── Research Briefs ────────────────────────────────────────────────────
  researchBriefs: defineTable({
    brandId: v.id("brands"),
    type: v.string(), // weekly_editorial | daily_trend | competitor_watch | keyword_gap | aeo_visibility
    title: v.string(),
    content: v.string(), // Markdown research output
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

  // ── Ad Campaigns ───────────────────────────────────────────────────────
  adCampaigns: defineTable({
    brandId: v.id("brands"),
    platform: v.string(), // meta | google | pinterest | youtube
    name: v.string(),
    type: v.string(), // prospecting | retargeting
    status: v.string(), // draft | active | paused | completed
    // Targeting (Dream 100 interest-based)
    targetInterests: v.optional(v.array(v.string())),
    targetDream100Ids: v.optional(v.array(v.id("dream100"))),
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

  // ── Ad Creatives ───────────────────────────────────────────────────────
  adCreatives: defineTable({
    campaignId: v.id("adCampaigns"),
    brandId: v.id("brands"),
    // The creative
    hook: v.string(), // The attention-grabbing headline/opening
    body: v.string(), // Full ad copy
    cta: v.string(), // Call to action
    visualDirection: v.optional(v.string()), // Design brief for the visual
    destinationUrl: v.string(), // UTM-tagged landing page
    // Variant tracking
    variant: v.string(), // A | B | C
    contentIdRef: v.optional(v.string()), // Links to contentIds table
    // Performance
    impressions: v.optional(v.number()),
    clicks: v.optional(v.number()),
    conversions: v.optional(v.number()),
    status: v.string(), // draft | active | paused | winner | loser
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_brand", ["brandId"])
    .index("by_status", ["status"]),

  // ── Lead Magnets ───────────────────────────────────────────────────────
  leadMagnets: defineTable({
    brandId: v.id("brands"),
    name: v.string(), // "5-Minute Bedtime Affirmation Cards"
    type: v.string(), // checklist | guide | template | mini_course | quiz | free_chapter
    description: v.string(),
    // The funnel
    landingPageUrl: v.optional(v.string()),
    deliveryMethod: v.string(), // email | download | redirect
    deliveryContent: v.optional(v.string()), // Email copy or download URL
    // Follow-up
    emailSequenceId: v.optional(v.id("emailSequences")), // Links to emailSequences
    // Performance
    visits: v.optional(v.number()),
    optIns: v.optional(v.number()),
    conversionRate: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"]),

  // ── Email Sequences ────────────────────────────────────────────────────
  emailSequences: defineTable({
    brandId: v.id("brands"),
    name: v.string(),
    type: v.string(), // soap_opera | seinfeld_daily | launch | follow_up | nurture
    triggerEvent: v.string(), // lead_magnet_optin | purchase | signup | manual
    // Sequence config
    emailCount: v.number(),
    intervalDays: v.number(), // Days between emails
    // State
    status: v.string(), // draft | active | paused
    subscriberCount: v.optional(v.number()),
    // Performance
    avgOpenRate: v.optional(v.number()),
    avgClickRate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_type", ["brandId", "type"]),

  // ── Email Messages ─────────────────────────────────────────────────────
  emailMessages: defineTable({
    sequenceId: v.id("emailSequences"),
    brandId: v.id("brands"),
    position: v.number(), // Order in sequence (1, 2, 3...)
    subject: v.string(),
    body: v.string(), // HTML email content
    // Close type (Brunson's Three Closes)
    closeType: v.optional(v.string()), // emotion | logic | fear
    // Performance per message
    sent: v.optional(v.number()),
    opened: v.optional(v.number()),
    clicked: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sequence", ["sequenceId"])
    .index("by_brand", ["brandId"]),

  // ── SEO Targets ────────────────────────────────────────────────────────
  seoTargets: defineTable({
    brandId: v.id("brands"),
    keyword: v.string(),
    searchVolume: v.optional(v.number()),
    difficulty: v.optional(v.string()), // easy | medium | hard
    intent: v.optional(v.string()), // informational | transactional | navigational
    // Current state
    currentRanking: v.optional(v.number()),
    currentUrl: v.optional(v.string()), // Which page ranks for this
    // Target
    targetUrl: v.optional(v.string()), // Which page should rank
    branchId: v.optional(v.id("branches")), // Content targeting this keyword
    // Tracking
    lastCheckedAt: v.optional(v.number()),
    rankingHistory: v.optional(v.any()), // Array of { date, position }
    status: v.string(), // target | ranking | top10 | top3 | featured
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_keyword", ["keyword"])
    .index("by_status", ["status"]),

  // ── AEO Checks ─────────────────────────────────────────────────────────
  aeoChecks: defineTable({
    brandId: v.id("brands"),
    query: v.string(), // "personalized children's books" | "Christian children's books"
    engine: v.string(), // chatgpt | perplexity | google_ai_overview
    cited: v.boolean(), // Was AlreadyLoved cited?
    citedUrl: v.optional(v.string()),
    position: v.optional(v.number()), // Position in citations if cited
    competitorsCited: v.optional(v.array(v.string())),
    fullResponse: v.optional(v.string()),
    checkedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_engine", ["brandId", "engine"]),

  // ── Video Scripts ──────────────────────────────────────────────────────
  videoScripts: defineTable({
    branchId: v.optional(v.id("branches")), // Link to branch if derived
    brandId: v.id("brands"),
    type: v.string(), // short_form | long_form | ugc | podcast_talking_points
    title: v.string(),
    // Script content
    hook: v.string(), // First 3 seconds / opening line
    script: v.string(), // Full script body
    cta: v.string(), // Closing call to action
    duration: v.optional(v.string()), // Estimated duration
    // UGC-specific
    creatorBrief: v.optional(v.string()), // Brief for UGC creator
    talkingPoints: v.optional(v.array(v.string())),
    // State
    status: v.string(), // draft | approved | filmed | published
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // ── Platform Accounts ──────────────────────────────────────────────────
  // Multiple accounts per brand per platform
  platformAccounts: defineTable({
    brandId: v.id("brands"),
    platform: v.string(), // pinterest | instagram | tiktok | twitter | youtube | facebook
    accountName: v.string(), // @BedtimeBookMom
    accountId: v.optional(v.string()), // Platform's internal ID
    niche: v.string(), // The thematic angle this account covers
    voiceNotes: v.optional(v.string()), // How this account differs from main brand voice
    // Buffer/API connection
    bufferChannelId: v.optional(v.string()),
    directApiCredentials: v.optional(v.any()), // For platforms not on Buffer
    // Rate limiting
    postsPerDay: v.number(), // Max posts per day for this account
    postsToday: v.optional(v.number()), // Track against limit
    lastPostedAt: v.optional(v.number()),
    // State
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_brand_platform", ["brandId", "platform"]),
});
