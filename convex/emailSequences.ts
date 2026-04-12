import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Email Sequences ──────────────────────────────────────────────────────

export const listSequences = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailSequences")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

export const getSequence = query({
  args: { id: v.id("emailSequences") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createSequence = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    type: v.string(),
    triggerEvent: v.string(),
    emailCount: v.number(),
    intervalDays: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("emailSequences", {
      ...args,
      status: "draft",
      subscriberCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateSequence = mutation({
  args: {
    id: v.id("emailSequences"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    triggerEvent: v.optional(v.string()),
    emailCount: v.optional(v.number()),
    intervalDays: v.optional(v.number()),
    status: v.optional(v.string()),
    subscriberCount: v.optional(v.number()),
    avgOpenRate: v.optional(v.number()),
    avgClickRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

// ── Email Messages ───────────────────────────────────────────────────────

export const listMessages = query({
  args: { sequenceId: v.id("emailSequences") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("emailMessages")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();
    // Order by position
    return messages.sort((a, b) => a.position - b.position);
  },
});

export const createMessage = mutation({
  args: {
    sequenceId: v.id("emailSequences"),
    brandId: v.id("brands"),
    position: v.number(),
    subject: v.string(),
    body: v.string(),
    closeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("emailMessages", {
      ...args,
      sent: 0,
      opened: 0,
      clicked: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateMessage = mutation({
  args: {
    id: v.id("emailMessages"),
    position: v.optional(v.number()),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    closeType: v.optional(v.string()),
    sent: v.optional(v.number()),
    opened: v.optional(v.number()),
    clicked: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});
