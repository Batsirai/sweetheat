import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    brandId: v.id("brands"),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.platform) {
      return await ctx.db
        .query("platformAccounts")
        .withIndex("by_brand_platform", (q) =>
          q.eq("brandId", args.brandId).eq("platform", args.platform!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("platformAccounts")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("platformAccounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    platform: v.string(),
    accountName: v.string(),
    accountId: v.optional(v.string()),
    niche: v.string(),
    voiceNotes: v.optional(v.string()),
    bufferChannelId: v.optional(v.string()),
    directApiCredentials: v.optional(v.any()),
    postsPerDay: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("platformAccounts", {
      ...args,
      postsToday: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("platformAccounts"),
    platform: v.optional(v.string()),
    accountName: v.optional(v.string()),
    accountId: v.optional(v.string()),
    niche: v.optional(v.string()),
    voiceNotes: v.optional(v.string()),
    bufferChannelId: v.optional(v.string()),
    directApiCredentials: v.optional(v.any()),
    postsPerDay: v.optional(v.number()),
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

export const incrementPostCount = mutation({
  args: { id: v.id("platformAccounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.id);
    if (!account) throw new Error("Platform account not found");
    await ctx.db.patch(args.id, {
      postsToday: (account.postsToday ?? 0) + 1,
      lastPostedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const resetDailyPostCounts = mutation({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("platformAccounts")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
    for (const account of accounts) {
      await ctx.db.patch(account._id, {
        postsToday: 0,
        updatedAt: Date.now(),
      });
    }
  },
});
