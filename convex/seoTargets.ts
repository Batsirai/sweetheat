import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    brandId: v.id("brands"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("seoTargets")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
    if (args.status) {
      return results.filter((t) => t.status === args.status);
    }
    return results;
  },
});

export const get = query({
  args: { id: v.id("seoTargets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    keyword: v.string(),
    searchVolume: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    intent: v.optional(v.string()),
    currentRanking: v.optional(v.number()),
    currentUrl: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("seoTargets", {
      ...args,
      status: "target",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("seoTargets"),
    keyword: v.optional(v.string()),
    searchVolume: v.optional(v.number()),
    difficulty: v.optional(v.string()),
    intent: v.optional(v.string()),
    currentRanking: v.optional(v.number()),
    currentUrl: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    branchId: v.optional(v.id("branches")),
    lastCheckedAt: v.optional(v.number()),
    rankingHistory: v.optional(v.any()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});
