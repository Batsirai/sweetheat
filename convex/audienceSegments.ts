import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audienceSegments")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("audienceSegments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    description: v.string(),
    painPoints: v.array(v.string()),
    desires: v.array(v.string()),
    language: v.optional(v.array(v.string())),
    platforms: v.optional(v.array(v.string())),
    contentPillars: v.optional(v.array(v.string())),
    hookStyles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("audienceSegments", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("audienceSegments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    painPoints: v.optional(v.array(v.string())),
    desires: v.optional(v.array(v.string())),
    language: v.optional(v.array(v.string())),
    platforms: v.optional(v.array(v.string())),
    contentPillars: v.optional(v.array(v.string())),
    hookStyles: v.optional(v.array(v.string())),
    avgConversionRate: v.optional(v.number()),
    totalRevenue: v.optional(v.number()),
    contentCount: v.optional(v.number()),
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
