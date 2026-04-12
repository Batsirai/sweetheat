import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Dream 100 ────────────────────────────────────────────────────────────

export const list = query({
  args: {
    brandId: v.id("brands"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("dream100")
        .withIndex("by_brand_category", (q) =>
          q.eq("brandId", args.brandId).eq("category", args.category!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("dream100")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("dream100") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    category: v.string(),
    platform: v.optional(v.string()),
    url: v.optional(v.string()),
    audienceSize: v.optional(v.number()),
    audienceOverlap: v.optional(v.string()),
    phase: v.optional(v.string()),
    notes: v.optional(v.string()),
    adTargetable: v.optional(v.boolean()),
    adTargetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("dream100", {
      ...args,
      phase: args.phase ?? "identified",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dream100"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    platform: v.optional(v.string()),
    url: v.optional(v.string()),
    audienceSize: v.optional(v.number()),
    audienceOverlap: v.optional(v.string()),
    phase: v.optional(v.string()),
    notes: v.optional(v.string()),
    adTargetable: v.optional(v.boolean()),
    adTargetId: v.optional(v.string()),
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

// ── Dream 100 Activities ─────────────────────────────────────────────────

export const logActivity = mutation({
  args: {
    dream100Id: v.id("dream100"),
    brandId: v.id("brands"),
    type: v.string(),
    description: v.string(),
    performedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const activityId = await ctx.db.insert("dream100Activities", {
      dream100Id: args.dream100Id,
      brandId: args.brandId,
      type: args.type,
      description: args.description,
      performedBy: args.performedBy,
      createdAt: now,
    });

    // Update lastEngagementAt on the dream100 entry
    await ctx.db.patch(args.dream100Id, {
      lastEngagementAt: now,
      updatedAt: now,
    });

    return activityId;
  },
});

export const listActivities = query({
  args: { dream100Id: v.id("dream100") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dream100Activities")
      .withIndex("by_dream100", (q) => q.eq("dream100Id", args.dream100Id))
      .order("desc")
      .collect();
  },
});
