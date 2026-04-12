import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    brandId: v.id("brands"),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.source) {
      return await ctx.db
        .query("performanceSnapshots")
        .withIndex("by_brand_source", (q) =>
          q.eq("brandId", args.brandId).eq("source", args.source!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("performanceSnapshots")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const getLatest = query({
  args: {
    brandId: v.id("brands"),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("performanceSnapshots")
      .withIndex("by_brand_source", (q) =>
        q.eq("brandId", args.brandId).eq("source", args.source)
      )
      .order("desc")
      .first();
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    source: v.string(),
    period: v.string(),
    periodStart: v.number(),
    periodEnd: v.number(),
    metrics: v.any(),
    topPerformers: v.optional(v.array(v.string())),
    bottomPerformers: v.optional(v.array(v.string())),
    insights: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("performanceSnapshots", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
