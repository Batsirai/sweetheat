import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Outreach Campaigns ───────────────────────────────────────────────────

export const listCampaigns = query({
  args: {
    brandId: v.id("brands"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("outreachCampaigns")
        .withIndex("by_brand_type", (q) =>
          q.eq("brandId", args.brandId).eq("type", args.type!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("outreachCampaigns")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const getCampaign = query({
  args: { id: v.id("outreachCampaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createCampaign = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    type: v.string(),
    targetAudience: v.string(),
    targetCount: v.optional(v.number()),
    subjectTemplate: v.optional(v.string()),
    bodyTemplate: v.string(),
    followUpTemplates: v.optional(v.array(v.string())),
    followUpIntervalDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("outreachCampaigns", {
      ...args,
      status: "draft",
      sent: 0,
      opened: 0,
      replied: 0,
      converted: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("outreachCampaigns"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    targetCount: v.optional(v.number()),
    subjectTemplate: v.optional(v.string()),
    bodyTemplate: v.optional(v.string()),
    followUpTemplates: v.optional(v.array(v.string())),
    followUpIntervalDays: v.optional(v.number()),
    sent: v.optional(v.number()),
    opened: v.optional(v.number()),
    replied: v.optional(v.number()),
    converted: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

// ── Outreach Messages ────────────────────────────────────────────────────

export const listMessages = query({
  args: { campaignId: v.id("outreachCampaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("outreachMessages")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .collect();
  },
});

export const createMessage = mutation({
  args: {
    campaignId: v.id("outreachCampaigns"),
    contactId: v.id("contacts"),
    brandId: v.id("brands"),
    type: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("outreachMessages", {
      ...args,
      status: "queued",
      createdAt: Date.now(),
    });
  },
});

export const updateMessageStatus = mutation({
  args: {
    id: v.id("outreachMessages"),
    status: v.string(),
    sentAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    repliedAt: v.optional(v.number()),
    replyContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});
