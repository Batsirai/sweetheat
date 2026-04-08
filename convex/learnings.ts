import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { brandId: v.optional(v.id("brands")), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.brandId && args.status) {
      return await ctx.db
        .query("learnings")
        .withIndex("by_brand_status", (q) =>
          q.eq("brandId", args.brandId!).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }
    if (args.brandId) {
      return await ctx.db
        .query("learnings")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("learnings").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("learnings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    trainingId: v.optional(v.id("training")),
    layer: v.string(),
    proposal: v.string(),
    reasoning: v.string(),
    sourceRunId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("learnings", {
      ...args,
      status: "proposed",
      rejectionCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const approve = mutation({
  args: { id: v.id("learnings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "approved",
      reviewedAt: Date.now(),
    });
  },
});

export const reject = mutation({
  args: { id: v.id("learnings") },
  handler: async (ctx, args) => {
    const learning = await ctx.db.get(args.id);
    if (!learning) throw new Error("Learning not found");
    await ctx.db.patch(args.id, {
      status: "rejected",
      rejectionCount: learning.rejectionCount + 1,
      reviewedAt: Date.now(),
    });
  },
});

export const incorporate = mutation({
  args: { id: v.id("learnings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "incorporated",
      reviewedAt: Date.now(),
    });
  },
});
