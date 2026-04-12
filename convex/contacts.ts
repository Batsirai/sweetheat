import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    brandId: v.id("brands"),
    contactType: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.contactType) {
      return await ctx.db
        .query("contacts")
        .withIndex("by_brand_contactType", (q) =>
          q.eq("brandId", args.brandId).eq("contactType", args.contactType!)
        )
        .order("desc")
        .collect();
    }
    const results = await ctx.db
      .query("contacts")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
    if (args.status) {
      return results.filter((c) => c.status === args.status);
    }
    return results;
  },
});

export const get = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    email: v.optional(v.string()),
    contactType: v.optional(v.string()),
    organization: v.optional(v.string()),
    location: v.optional(v.string()),
    socialUrls: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    dream100Id: v.optional(v.id("dream100")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("contacts", {
      ...args,
      status: "prospect",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("contacts"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    contactType: v.optional(v.string()),
    organization: v.optional(v.string()),
    location: v.optional(v.string()),
    socialUrls: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    dream100Id: v.optional(v.id("dream100")),
    status: v.optional(v.string()),
    lastContactedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

export const search = query({
  args: {
    brandId: v.id("brands"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("contacts")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
    const lower = args.query.toLowerCase();
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        (c.email && c.email.toLowerCase().includes(lower))
    );
  },
});
