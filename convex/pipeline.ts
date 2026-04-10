import { v } from "convex/values";
import { mutation } from "./_generated/server";

const PIN_VARIATIONS = 5; // 4-5 Pinterest pins per article

export const approveSeed = mutation({
  args: { seedId: v.id("seeds") },
  handler: async (ctx, args) => {
    const seed = await ctx.db.get(args.seedId);
    if (!seed) throw new Error("Seed not found");

    const brand = await ctx.db.get(seed.brandId);
    if (!brand) throw new Error("Brand not found");

    // Update seed status
    await ctx.db.patch(args.seedId, { status: "approved", updatedAt: Date.now() });

    // Order formats: blog first (anchor content — derivatives need it)
    const formats = brand.activeFormats.slice();
    const blogIdx = formats.indexOf("blog");
    if (blogIdx > 0) {
      formats.splice(blogIdx, 1);
      formats.unshift("blog");
    }

    const now = Date.now();
    const branchIds: string[] = [];

    for (const format of formats) {
      const count = format === "pin" ? PIN_VARIATIONS : 1;
      for (let i = 0; i < count; i++) {
        const id = await ctx.db.insert("branches", {
          seedId: args.seedId,
          brandId: seed.brandId,
          format,
          status: "draft",
          createdAt: now,
          updatedAt: now,
        });
        branchIds.push(id);
      }
    }

    // Schedule async content writing
    // (writeBranchContent will be implemented in Task 5)
    // await ctx.scheduler.runAfter(0, internal.pipeline.writeBranchContent, { seedId: args.seedId, branchIds });

    return { branchIds, formatsCreated: formats };
  },
});
