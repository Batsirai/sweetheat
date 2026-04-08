import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("training")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
  },
});

export const listByLayer = query({
  args: { brandId: v.id("brands"), layer: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("training")
      .withIndex("by_brand_layer", (q) =>
        q.eq("brandId", args.brandId).eq("layer", args.layer)
      )
      .collect();
  },
});

export const get = query({
  args: { id: v.id("training") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    layer: v.string(),
    scope: v.optional(v.string()),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("training", {
      ...args,
      version: 1,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("training"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Training not found");

    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, {
      ...filtered,
      version: existing.version + 1,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("training") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
