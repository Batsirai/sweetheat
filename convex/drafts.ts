import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByBranch = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drafts")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    branchId: v.id("branches"),
    body: v.string(),
    visualDirection: v.optional(v.string()),
    authoredBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Get latest version number
    const existing = await ctx.db
      .query("drafts")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .order("desc")
      .first();
    const version = existing ? existing.version + 1 : 1;

    const draftId = await ctx.db.insert("drafts", {
      branchId: args.branchId,
      version,
      body: args.body,
      visualDirection: args.visualDirection,
      authoredBy: args.authoredBy,
      createdAt: Date.now(),
    });

    // Update the branch's currentDraftId
    await ctx.db.patch(args.branchId, {
      currentDraftId: draftId,
      updatedAt: Date.now(),
    });

    return draftId;
  },
});
