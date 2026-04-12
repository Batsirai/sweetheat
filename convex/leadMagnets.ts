import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leadMagnets")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("leadMagnets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    type: v.string(),
    description: v.string(),
    landingPageUrl: v.optional(v.string()),
    deliveryMethod: v.string(),
    deliveryContent: v.optional(v.string()),
    emailSequenceId: v.optional(v.id("emailSequences")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("leadMagnets", {
      ...args,
      visits: 0,
      optIns: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("leadMagnets"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    landingPageUrl: v.optional(v.string()),
    deliveryMethod: v.optional(v.string()),
    deliveryContent: v.optional(v.string()),
    emailSequenceId: v.optional(v.id("emailSequences")),
    visits: v.optional(v.number()),
    optIns: v.optional(v.number()),
    conversionRate: v.optional(v.number()),
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
