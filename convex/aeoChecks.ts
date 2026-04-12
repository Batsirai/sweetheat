import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    brandId: v.id("brands"),
    engine: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.engine) {
      return await ctx.db
        .query("aeoChecks")
        .withIndex("by_brand_engine", (q) =>
          q.eq("brandId", args.brandId).eq("engine", args.engine!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("aeoChecks")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    query: v.string(),
    engine: v.string(),
    cited: v.boolean(),
    citedUrl: v.optional(v.string()),
    position: v.optional(v.number()),
    competitorsCited: v.optional(v.array(v.string())),
    fullResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aeoChecks", {
      ...args,
      checkedAt: Date.now(),
    });
  },
});

export const getLatest = query({
  args: {
    brandId: v.id("brands"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const checks = await ctx.db
      .query("aeoChecks")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
    return checks.find((c) => c.query === args.query) ?? null;
  },
});
