import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Topics ────────────────────────────────────────────────────────────────

export const listTopics = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeTopics")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
  },
});

export const getTopic = query({
  args: { id: v.id("knowledgeTopics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createTopic = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    searchTerms: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("knowledgeTopics", {
      ...args,
      isActive: true,
      sourceCount: 0,
      pageCount: 0,
      ideaCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTopic = mutation({
  args: {
    id: v.id("knowledgeTopics"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    searchTerms: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

// ── Sources ───────────────────────────────────────────────────────────────

export const listSources = query({
  args: { topicId: v.id("knowledgeTopics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeSources")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .order("desc")
      .collect();
  },
});

export const getSource = query({
  args: { id: v.id("knowledgeSources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const addSource = mutation({
  args: {
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"),
    sourceType: v.string(),
    title: v.string(),
    url: v.optional(v.string()),
    youtubeVideoId: v.optional(v.string()),
    youtubeChannelId: v.optional(v.string()),
    youtubeChannelName: v.optional(v.string()),
    viewCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    commentCount: v.optional(v.number()),
    durationSeconds: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
    transcript: v.optional(v.string()),
    abstract: v.optional(v.string()),
    resonanceScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check for duplicate YouTube video
    if (args.youtubeVideoId) {
      const existing = await ctx.db
        .query("knowledgeSources")
        .withIndex("by_youtube_video", (q) =>
          q.eq("youtubeVideoId", args.youtubeVideoId!)
        )
        .first();
      if (existing) {
        return { id: existing._id, duplicate: true };
      }
    }

    const id = await ctx.db.insert("knowledgeSources", {
      ...args,
      status: args.transcript ? "pending" : "pending",
      createdAt: Date.now(),
    });

    // Update topic source count
    const topic = await ctx.db.get(args.topicId);
    if (topic) {
      await ctx.db.patch(args.topicId, {
        sourceCount: (topic.sourceCount ?? 0) + 1,
        updatedAt: Date.now(),
      });
    }

    return { id, duplicate: false };
  },
});

export const updateSourceTranscript = mutation({
  args: {
    id: v.id("knowledgeSources"),
    transcript: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      transcript: args.transcript,
      status: args.status ?? "pending",
    });
  },
});

export const removeSource = mutation({
  args: { id: v.id("knowledgeSources") },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.id);
    if (!source) return;
    await ctx.db.delete(args.id);

    // Update topic count
    const topic = await ctx.db.get(source.topicId);
    if (topic && (topic.sourceCount ?? 0) > 0) {
      await ctx.db.patch(source.topicId, {
        sourceCount: (topic.sourceCount ?? 1) - 1,
        updatedAt: Date.now(),
      });
    }
  },
});

// ── Wiki Pages ────────────────────────────────────────────────────────────

export const listPages = query({
  args: { topicId: v.id("knowledgeTopics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgePages")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();
  },
});

export const getPage = query({
  args: { id: v.id("knowledgePages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ── Idea Briefs ───────────────────────────────────────────────────────────

export const listIdeaBriefs = query({
  args: { brandId: v.id("brands"), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("ideaBriefs")
        .withIndex("by_brand_status", (q) =>
          q.eq("brandId", args.brandId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("ideaBriefs")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const getIdeaBrief = query({
  args: { id: v.id("ideaBriefs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const claimIdeaBrief = mutation({
  args: { id: v.id("ideaBriefs"), claimedBy: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "claimed",
      claimedBy: args.claimedBy,
      claimedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Convert an idea brief into a seed
export const ideaBriefToSeed = mutation({
  args: { ideaBriefId: v.id("ideaBriefs") },
  handler: async (ctx, args) => {
    const brief = await ctx.db.get(args.ideaBriefId);
    if (!brief) throw new Error("Idea brief not found");

    const now = Date.now();
    const seedId = await ctx.db.insert("seeds", {
      brandId: brief.brandId,
      title: brief.title,
      description: `${brief.angle}\n\n${brief.hook ?? ""}\n\n${brief.thesis ?? ""}`.trim(),
      source: "knowledge_base",
      sourceRef: args.ideaBriefId,
      pitchedBy: "agent",
      targetFormats: brief.suggestedFormats,
      status: "pitched",
      createdAt: now,
      updatedAt: now,
    });

    // Link back
    await ctx.db.patch(args.ideaBriefId, {
      status: "produced",
      seedId,
      updatedAt: now,
    });

    return seedId;
  },
});

// ── Catalysts ─────────────────────────────────────────────────────────────

export const listCatalysts = query({
  args: { topicId: v.id("knowledgeTopics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeCatalysts")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .order("desc")
      .collect();
  },
});
