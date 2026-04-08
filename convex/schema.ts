import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Users ───────────────────────────────────────────────────────────────
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.string(), // admin | user
    createdAt: v.number(),
  }).index("by_email", ["email"]),

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
  // The organizational primitive. Everything is brand-scoped.
  brands: defineTable({
    organizationId: v.optional(v.string()), // Future multi-tenancy
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
    source: v.string(), // audience_question | remix | interview | industry_radar | work_insight | manual | webhook | import | folder_watch | agent_research
    sourceRef: v.optional(v.string()),
    status: v.string(), // pitched | under_review | approved | rejected | archived
    pitchedBy: v.string(), // agent | user
    targetFormats: v.optional(v.array(v.string())),
    // Attachments (file uploads, etc.)
    attachments: v.optional(v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
    }))),
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
  // Brand-scoped voice/style training modules.
  training: defineTable({
    brandId: v.id("brands"),
    layer: v.string(), // voice_general | spark_generation | platform_specific | format_specific
    scope: v.optional(v.string()), // Platform or format name
    title: v.string(),
    content: v.string(), // Training content (markdown)
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
});
