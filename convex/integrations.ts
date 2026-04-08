import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { brandId: v.optional(v.id("brands")) },
  handler: async (ctx, args) => {
    if (args.brandId) {
      return await ctx.db
        .query("integrations")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
        .collect();
    }
    return await ctx.db.query("integrations").collect();
  },
});

export const listByType = query({
  args: { brandId: v.id("brands"), type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_brand_type", (q) =>
        q.eq("brandId", args.brandId).eq("type", args.type)
      )
      .collect();
  },
});

export const get = query({
  args: { id: v.id("integrations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.optional(v.id("brands")),
    provider: v.string(),
    type: v.string(),
    name: v.string(),
    config: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("integrations", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("integrations"),
    name: v.optional(v.string()),
    config: v.optional(v.any()),
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

export const remove = mutation({
  args: { id: v.id("integrations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
