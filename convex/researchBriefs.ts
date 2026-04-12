import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    brandId: v.id("brands"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("researchBriefs")
        .withIndex("by_brand_type", (q) =>
          q.eq("brandId", args.brandId).eq("type", args.type!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("researchBriefs")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("researchBriefs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    type: v.string(),
    title: v.string(),
    content: v.string(),
    trendingTopics: v.optional(v.array(v.string())),
    keywordOpportunities: v.optional(
      v.array(
        v.object({
          keyword: v.string(),
          volume: v.optional(v.number()),
          difficulty: v.optional(v.string()),
          currentRanking: v.optional(v.number()),
        })
      )
    ),
    competitorUpdates: v.optional(v.array(v.string())),
    contentRecommendations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("researchBriefs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
