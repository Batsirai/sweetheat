import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { brandId: v.optional(v.id("brands")) },
  handler: async (ctx, args) => {
    if (args.brandId) {
      return await ctx.db
        .query("seeds")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("seeds").order("desc").collect();
  },
});

export const listByStatus = query({
  args: { brandId: v.id("brands"), status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seeds")
      .withIndex("by_brand_status", (q) =>
        q.eq("brandId", args.brandId).eq("status", args.status)
      )
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("seeds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    title: v.string(),
    description: v.string(),
    source: v.string(),
    sourceRef: v.optional(v.string()),
    pitchedBy: v.string(),
    targetFormats: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
    }))),
    // Strategic content planning
    purpose: v.optional(v.string()),
    contentPillar: v.optional(v.string()),
    targetKeywords: v.optional(v.array(v.string())),
    reasoning: v.optional(v.string()),
    // Traffic assembly line
    hookAngle: v.optional(v.string()),
    templateType: v.optional(v.string()),
    dream100Source: v.optional(v.id("dream100")),
    researchBriefId: v.optional(v.id("researchBriefs")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("seeds", {
      ...args,
      status: "pitched",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: { id: v.id("seeds"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("seeds"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    targetFormats: v.optional(v.array(v.string())),
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
    const seeds = await ctx.db
      .query("seeds")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
    const counts: Record<string, number> = {};
    for (const seed of seeds) {
      counts[seed.status] = (counts[seed.status] || 0) + 1;
    }
    return counts;
  },
});
