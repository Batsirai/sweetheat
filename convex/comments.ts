import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByTarget = query({
  args: { targetType: v.string(), targetId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_target", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    targetType: v.string(),
    targetId: v.string(),
    authoredBy: v.string(),
    body: v.string(),
    isQuickFeedback: v.optional(v.boolean()),
    quickFeedbackType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      ...args,
      isQuickFeedback: args.isQuickFeedback ?? false,
      createdAt: Date.now(),
    });
  },
});
