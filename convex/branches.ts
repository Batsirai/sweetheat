import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { brandId: v.optional(v.id("brands")) },
  handler: async (ctx, args) => {
    if (args.brandId) {
      return await ctx.db
        .query("branches")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("branches").order("desc").collect();
  },
});

export const listByStatus = query({
  args: { brandId: v.id("brands"), status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branches")
      .withIndex("by_brand_status", (q) =>
        q.eq("brandId", args.brandId).eq("status", args.status)
      )
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("branches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySeed = query({
  args: { seedId: v.id("seeds") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branches")
      .withIndex("by_seed", (q) => q.eq("seedId", args.seedId))
      .collect();
  },
});

export const create = mutation({
  args: {
    seedId: v.id("seeds"),
    brandId: v.id("brands"),
    format: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("branches", {
      seedId: args.seedId,
      brandId: args.brandId,
      format: args.format,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("branches"),
    status: v.string(),
    scheduledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    externalPostId: v.optional(v.string()),
    confidenceScore: v.optional(v.number()),
    autoApproved: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

export const countByBrandAndStatus = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const branches = await ctx.db
      .query("branches")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
    const counts: Record<string, number> = {};
    for (const branch of branches) {
      counts[branch.status] = (counts[branch.status] || 0) + 1;
    }
    return counts;
  },
});
