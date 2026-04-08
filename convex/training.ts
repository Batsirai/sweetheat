import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("training")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
  },
});

export const listByLayer = query({
  args: { brandId: v.id("brands"), layer: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("training")
      .withIndex("by_brand_layer", (q) =>
        q.eq("brandId", args.brandId).eq("layer", args.layer)
      )
      .collect();
  },
});

// Get only primary (agent-synthesized) docs — what the content agent reads
export const listPrimary = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("training")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
    return all.filter((t) => t.isPrimary === true);
  },
});

// Get contributing docs (non-primary) for a layer — the ingredients
export const listContributing = query({
  args: { brandId: v.id("brands"), layer: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("training")
      .withIndex("by_brand_layer", (q) =>
        q.eq("brandId", args.brandId).eq("layer", args.layer)
      )
      .collect();
    return all.filter((t) => t.isPrimary !== true);
  },
});

export const get = query({
  args: { id: v.id("training") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a contributing doc (user-uploaded ingredient)
export const create = mutation({
  args: {
    brandId: v.id("brands"),
    layer: v.string(),
    scope: v.optional(v.string()),
    title: v.string(),
    content: v.string(),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("training", {
      ...args,
      version: 1,
      updatedAt: Date.now(),
    });

    // Flag any primary doc in the same layer for resynthesis
    if (!args.isPrimary) {
      const primaryDocs = await ctx.db
        .query("training")
        .withIndex("by_brand_layer", (q) =>
          q.eq("brandId", args.brandId).eq("layer", args.layer)
        )
        .collect();
      for (const doc of primaryDocs) {
        if (doc.isPrimary) {
          await ctx.db.patch(doc._id, { needsResynthesis: true });
        }
      }
    }

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("training"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Training not found");

    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, {
      ...filtered,
      version: existing.version + 1,
      updatedAt: Date.now(),
    });

    // If this is a contributing doc, flag primary for resynthesis
    if (!existing.isPrimary) {
      const primaryDocs = await ctx.db
        .query("training")
        .withIndex("by_brand_layer", (q) =>
          q.eq("brandId", existing.brandId).eq("layer", existing.layer)
        )
        .collect();
      for (const doc of primaryDocs) {
        if (doc.isPrimary) {
          await ctx.db.patch(doc._id, { needsResynthesis: true });
        }
      }
    }
  },
});

// Agent writes/updates the synthesized primary doc
export const savePrimary = mutation({
  args: {
    brandId: v.id("brands"),
    layer: v.string(),
    scope: v.optional(v.string()),
    title: v.string(),
    content: v.string(),
    synthesizedFrom: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Find existing primary doc for this layer
    const existing = await ctx.db
      .query("training")
      .withIndex("by_brand_layer", (q) =>
        q.eq("brandId", args.brandId).eq("layer", args.layer)
      )
      .collect();
    const primary = existing.find((t) => t.isPrimary === true);

    const now = Date.now();

    if (primary) {
      await ctx.db.patch(primary._id, {
        title: args.title,
        content: args.content,
        synthesizedFrom: args.synthesizedFrom,
        synthesizedAt: now,
        needsResynthesis: false,
        version: primary.version + 1,
        updatedAt: now,
      });
      return primary._id;
    } else {
      return await ctx.db.insert("training", {
        brandId: args.brandId,
        layer: args.layer,
        scope: args.scope,
        title: args.title,
        content: args.content,
        isPrimary: true,
        synthesizedFrom: args.synthesizedFrom,
        synthesizedAt: now,
        needsResynthesis: false,
        version: 1,
        updatedAt: now,
      });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("training") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return;

    await ctx.db.delete(args.id);

    // If contributing doc deleted, flag primary for resynthesis
    if (!doc.isPrimary) {
      const primaryDocs = await ctx.db
        .query("training")
        .withIndex("by_brand_layer", (q) =>
          q.eq("brandId", doc.brandId).eq("layer", doc.layer)
        )
        .collect();
      for (const p of primaryDocs) {
        if (p.isPrimary) {
          await ctx.db.patch(p._id, { needsResynthesis: true });
        }
      }
    }
  },
});
