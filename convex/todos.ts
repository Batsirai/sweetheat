import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    brandId: v.optional(v.id("brands")),
    owner: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("todos");

    if (args.brandId) {
      q = q.withIndex("by_brand", (idx) => idx.eq("brandId", args.brandId!));
    } else if (args.owner && args.status) {
      q = q.withIndex("by_owner_status", (idx) =>
        idx.eq("owner", args.owner!).eq("status", args.status!)
      );
    }

    return await q.order("desc").collect();
  },
});

export const countsByOwner = query({
  args: { brandId: v.optional(v.id("brands")) },
  handler: async (ctx, args) => {
    let todos;
    if (args.brandId) {
      todos = await ctx.db
        .query("todos")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
        .collect();
    } else {
      todos = await ctx.db.query("todos").collect();
    }

    const userPending = todos.filter(
      (t) => t.owner === "user" && t.status === "pending"
    ).length;
    const agentPending = todos.filter(
      (t) => t.owner === "agent" && t.status === "pending"
    ).length;

    return { userPending, agentPending, total: todos.length };
  },
});

export const create = mutation({
  args: {
    brandId: v.optional(v.id("brands")),
    owner: v.string(),
    type: v.string(),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    description: v.string(),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("todos", {
      ...args,
      priority: args.priority ?? 0,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const complete = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});
