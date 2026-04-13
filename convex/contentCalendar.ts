import { v } from "convex/values";
import { query } from "./_generated/server";

// ── Content Calendar ─────────────────────────────────────────────────
// Surfaces scheduled branches as a calendar view.
// Actual Google Calendar event creation is handled by the MCP tool layer —
// the orchestrating agent calls `calendar_schedule_content` to prepare event
// data, then passes it to the gcal MCP to create the event.

export const getSchedule = query({
  args: {
    brandId: v.id("brands"),
    startDate: v.number(), // epoch ms
    endDate: v.number(), // epoch ms
  },
  handler: async (ctx, args) => {
    const branches = await ctx.db
      .query("branches")
      .withIndex("by_brand_status", (q) =>
        q.eq("brandId", args.brandId).eq("status", "scheduled")
      )
      .collect();

    // Filter to date range and enrich with seed data
    const scheduled = branches.filter(
      (b) =>
        b.scheduledAt &&
        b.scheduledAt >= args.startDate &&
        b.scheduledAt <= args.endDate
    );

    const enriched = await Promise.all(
      scheduled.map(async (branch) => {
        const seed = await ctx.db.get(branch.seedId);
        return {
          branchId: branch._id,
          seedId: branch.seedId,
          title: seed?.title ?? "Untitled",
          format: branch.format,
          status: branch.status,
          scheduledAt: branch.scheduledAt,
          contentIdRef: branch.contentIdRef,
          utmUrl: branch.utmUrl,
          externalPostId: branch.externalPostId,
          platform: formatToPlatform(branch.format),
        };
      })
    );

    // Sort by scheduled time
    enriched.sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0));

    return enriched;
  },
});

// Also include published branches for a full calendar view
export const getPublished = query({
  args: {
    brandId: v.id("brands"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const branches = await ctx.db
      .query("branches")
      .withIndex("by_brand_status", (q) =>
        q.eq("brandId", args.brandId).eq("status", "published")
      )
      .collect();

    const published = branches.filter(
      (b) =>
        b.publishedAt &&
        b.publishedAt >= args.startDate &&
        b.publishedAt <= args.endDate
    );

    const enriched = await Promise.all(
      published.map(async (branch) => {
        const seed = await ctx.db.get(branch.seedId);
        return {
          branchId: branch._id,
          seedId: branch.seedId,
          title: seed?.title ?? "Untitled",
          format: branch.format,
          status: branch.status,
          publishedAt: branch.publishedAt,
          contentIdRef: branch.contentIdRef,
          utmUrl: branch.utmUrl,
          platform: formatToPlatform(branch.format),
        };
      })
    );

    enriched.sort((a, b) => (a.publishedAt ?? 0) - (b.publishedAt ?? 0));

    return enriched;
  },
});

// ── Helpers ──────────────────────────────────────────────────────────

function formatToPlatform(format: string): string {
  const map: Record<string, string> = {
    pin: "Pinterest",
    tweet: "Twitter/X",
    linkedin: "LinkedIn",
    blog: "Blog",
    caption_ig: "Instagram",
    caption_tiktok: "TikTok",
    newsletter: "Email",
    carousel: "Instagram",
    quote_card: "Instagram",
    thumbnail: "YouTube",
    short_video: "TikTok",
    long_video: "YouTube",
    facebook: "Facebook",
  };
  return map[format] ?? format;
}
