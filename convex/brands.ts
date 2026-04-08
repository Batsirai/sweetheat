import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brands").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("brands")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brands")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    voiceTraining: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    wordsToUse: v.optional(v.array(v.string())),
    wordsToAvoid: v.optional(v.array(v.string())),
    exampleContent: v.optional(v.array(v.string())),
    activeFormats: v.optional(v.array(v.string())),
    repurposeMatrix: v.optional(v.any()),
    goals: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("brands", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      voiceTraining: args.voiceTraining ?? "",
      interests: args.interests ?? [],
      wordsToUse: args.wordsToUse ?? [],
      wordsToAvoid: args.wordsToAvoid ?? [],
      exampleContent: args.exampleContent ?? [],
      activeFormats: args.activeFormats ?? [],
      repurposeMatrix: args.repurposeMatrix,
      goals: args.goals,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("brands"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    voiceTraining: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    wordsToUse: v.optional(v.array(v.string())),
    wordsToAvoid: v.optional(v.array(v.string())),
    exampleContent: v.optional(v.array(v.string())),
    activeFormats: v.optional(v.array(v.string())),
    repurposeMatrix: v.optional(v.any()),
    goals: v.optional(v.string()),
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

export const deactivate = mutation({
  args: { id: v.id("brands") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false, updatedAt: Date.now() });
  },
});
