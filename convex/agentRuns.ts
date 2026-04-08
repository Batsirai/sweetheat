import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("agentRuns")
      .withIndex("by_started")
      .order("desc");
    if (args.limit) {
      return await q.take(args.limit);
    }
    return await q.collect();
  },
});

export const latest = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agentRuns")
      .withIndex("by_started")
      .order("desc")
      .first();
  },
});

export const get = query({
  args: { id: v.id("agentRuns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const start = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.insert("agentRuns", {
      startedAt: Date.now(),
      status: "running",
      brandsProcessed: [],
      todosCompleted: 0,
      seedsGenerated: 0,
      draftsWritten: 0,
      visualsGenerated: 0,
      learningsGenerated: 0,
    });
  },
});

export const complete = mutation({
  args: {
    id: v.id("agentRuns"),
    status: v.string(),
    brandsProcessed: v.array(v.string()),
    todosCompleted: v.number(),
    seedsGenerated: v.number(),
    draftsWritten: v.number(),
    visualsGenerated: v.number(),
    learningsGenerated: v.number(),
    errors: v.optional(v.array(v.string())),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      completedAt: Date.now(),
    });
  },
});
