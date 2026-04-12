import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Ad Campaigns ─────────────────────────────────────────────────────────

export const listCampaigns = query({
  args: {
    brandId: v.id("brands"),
    platform: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.platform) {
      return await ctx.db
        .query("adCampaigns")
        .withIndex("by_brand_platform", (q) =>
          q.eq("brandId", args.brandId).eq("platform", args.platform!)
        )
        .order("desc")
        .collect();
    }
    const results = await ctx.db
      .query("adCampaigns")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
    if (args.status) {
      return results.filter((c) => c.status === args.status);
    }
    return results;
  },
});

export const getCampaign = query({
  args: { id: v.id("adCampaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createCampaign = mutation({
  args: {
    brandId: v.id("brands"),
    platform: v.string(),
    name: v.string(),
    type: v.string(),
    targetInterests: v.optional(v.array(v.string())),
    targetDream100Ids: v.optional(v.array(v.id("dream100"))),
    dailyBudget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("adCampaigns", {
      ...args,
      status: "draft",
      totalSpent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("adCampaigns"),
    platform: v.optional(v.string()),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    targetInterests: v.optional(v.array(v.string())),
    targetDream100Ids: v.optional(v.array(v.id("dream100"))),
    dailyBudget: v.optional(v.number()),
    totalSpent: v.optional(v.number()),
    impressions: v.optional(v.number()),
    clicks: v.optional(v.number()),
    conversions: v.optional(v.number()),
    revenue: v.optional(v.number()),
    cpa: v.optional(v.number()),
    roas: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

// ── Ad Creatives ─────────────────────────────────────────────────────────

export const listCreatives = query({
  args: { campaignId: v.id("adCampaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("adCreatives")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .collect();
  },
});

export const createCreative = mutation({
  args: {
    campaignId: v.id("adCampaigns"),
    brandId: v.id("brands"),
    hook: v.string(),
    body: v.string(),
    cta: v.string(),
    visualDirection: v.optional(v.string()),
    destinationUrl: v.string(),
    variant: v.string(),
    contentIdRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("adCreatives", {
      ...args,
      status: "draft",
      impressions: 0,
      clicks: 0,
      conversions: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCreative = mutation({
  args: {
    id: v.id("adCreatives"),
    hook: v.optional(v.string()),
    body: v.optional(v.string()),
    cta: v.optional(v.string()),
    visualDirection: v.optional(v.string()),
    destinationUrl: v.optional(v.string()),
    variant: v.optional(v.string()),
    contentIdRef: v.optional(v.string()),
    status: v.optional(v.string()),
    impressions: v.optional(v.number()),
    clicks: v.optional(v.number()),
    conversions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});
