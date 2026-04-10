import { mutation } from "./_generated/server";

// One-time backfill: convert existing "ready" idea briefs into seeds
export const ideaBriefsToSeeds = mutation({
  args: {},
  handler: async (ctx) => {
    const briefs = await ctx.db.query("ideaBriefs").collect();
    const readyBriefs = briefs.filter((b) => b.status === "ready" && !b.seedId);

    let created = 0;
    const now = Date.now();

    for (const brief of readyBriefs) {
      const description = [brief.angle, brief.hook, brief.thesis]
        .filter(Boolean)
        .join("\n\n");

      const seedId = await ctx.db.insert("seeds", {
        brandId: brief.brandId,
        title: brief.title,
        description: description || brief.angle,
        source: "knowledge_base",
        sourceRef: brief._id,
        pitchedBy: "agent",
        targetFormats: brief.suggestedFormats,
        status: "pitched",
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.patch(brief._id, { seedId, status: "produced" });
      created++;
    }

    return { created, total: briefs.length };
  },
});
