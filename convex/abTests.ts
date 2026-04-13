import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    brandId: v.id("brands"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("abTests")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
        .order("desc")
        .collect()
        .then((tests) => tests.filter((t) => t.status === args.status));
    }
    return await ctx.db
      .query("abTests")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("abTests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

const variantValidator = v.object({
  branchId: v.optional(v.id("branches")),
  contentIdRef: v.optional(v.string()),
  description: v.string(),
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    type: v.string(),
    variantA: variantValidator,
    variantB: variantValidator,
    endsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("abTests", {
      brandId: args.brandId,
      name: args.name,
      type: args.type,
      status: "running",
      variantA: args.variantA,
      variantB: args.variantB,
      startedAt: now,
      endsAt: args.endsAt,
      createdAt: now,
    });
  },
});

export const updateMetrics = mutation({
  args: {
    id: v.id("abTests"),
    variant: v.string(), // "A" | "B"
    metrics: v.object({
      impressions: v.optional(v.number()),
      clicks: v.optional(v.number()),
      saves: v.optional(v.number()),
      revenue: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const test = await ctx.db.get(args.id);
    if (!test) throw new Error("A/B test not found");

    if (args.variant === "A") {
      await ctx.db.patch(args.id, { metricsA: args.metrics });
    } else if (args.variant === "B") {
      await ctx.db.patch(args.id, { metricsB: args.metrics });
    } else {
      throw new Error("Variant must be 'A' or 'B'");
    }
  },
});

export const declareWinner = mutation({
  args: {
    id: v.id("abTests"),
    winner: v.string(), // "A" | "B"
    winnerReason: v.string(),
  },
  handler: async (ctx, args) => {
    const test = await ctx.db.get(args.id);
    if (!test) throw new Error("A/B test not found");

    await ctx.db.patch(args.id, {
      winner: args.winner,
      winnerReason: args.winnerReason,
      status: "winner_declared",
      completedAt: Date.now(),
    });
  },
});
