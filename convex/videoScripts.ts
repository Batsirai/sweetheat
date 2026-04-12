import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    brandId: v.id("brands"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("videoScripts")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
    if (args.type) {
      return results.filter((s) => s.type === args.type);
    }
    return results;
  },
});

export const get = query({
  args: { id: v.id("videoScripts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    branchId: v.optional(v.id("branches")),
    brandId: v.id("brands"),
    type: v.string(),
    title: v.string(),
    hook: v.string(),
    script: v.string(),
    cta: v.string(),
    duration: v.optional(v.string()),
    creatorBrief: v.optional(v.string()),
    talkingPoints: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("videoScripts", {
      ...args,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("videoScripts"),
    type: v.optional(v.string()),
    title: v.optional(v.string()),
    hook: v.optional(v.string()),
    script: v.optional(v.string()),
    cta: v.optional(v.string()),
    duration: v.optional(v.string()),
    creatorBrief: v.optional(v.string()),
    talkingPoints: v.optional(v.array(v.string())),
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
