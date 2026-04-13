import { v } from "convex/values";
import { query } from "./_generated/server";

// ── Content Calendar ─────────────────────────────────────────────────
// Surfaces ALL branches across ALL brands as a unified calendar view.
// This is the "Sweet Heat" calendar — one view of everything the factory produces.
// Actual Google Calendar event creation is handled by the MCP tool layer.
//
// Google Calendar ID: Use the AlreadyLoved calendar (rename to "Sweet Heat")
// or create a dedicated one. Events are color-coded by platform.
//
// Status tracking: Each event title shows the lifecycle status:
//   [Pinterest] Title → SCHEDULED
//   [Pinterest] Title → PUBLISHED ✓
//   [Pinterest] Title → FAILED ✗

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

// ── Unified Calendar (all brands, all statuses) ─────────────────────

export const getUnifiedCalendar = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    brandId: v.optional(v.id("brands")), // optional filter
  },
  handler: async (ctx, args) => {
    // Get all branches that have a time reference (scheduled or published)
    const allBranches = args.brandId
      ? await ctx.db
          .query("branches")
          .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
          .collect()
      : await ctx.db.query("branches").collect();

    // Filter to branches with time references in range
    const inRange = allBranches.filter((b) => {
      const time = b.publishedAt ?? b.scheduledAt ?? b.updatedAt;
      return time >= args.startDate && time <= args.endDate;
    });

    // Only include branches that are beyond draft stage
    const relevant = inRange.filter((b) =>
      ["in_review", "approved", "scheduled", "published"].includes(b.status)
    );

    const enriched = await Promise.all(
      relevant.map(async (branch) => {
        const seed = await ctx.db.get(branch.seedId);
        const brand = await ctx.db.get(branch.brandId);
        const platform = formatToPlatform(branch.format);
        const time = branch.publishedAt ?? branch.scheduledAt ?? branch.updatedAt;

        // Status emoji for calendar event title
        let statusTag = "";
        if (branch.status === "published") statusTag = " ✓";
        else if (branch.status === "scheduled") statusTag = " ⏳";
        else if (branch.status === "approved") statusTag = " →";
        else if (branch.status === "in_review") statusTag = " 👀";

        return {
          branchId: branch._id,
          brandName: brand?.name ?? "Unknown",
          brandPrefix: (brand as any)?.brandPrefix ?? "",
          seedTitle: seed?.title ?? "Untitled",
          format: branch.format,
          platform,
          status: branch.status,
          statusTag,
          time,
          scheduledAt: branch.scheduledAt,
          publishedAt: branch.publishedAt,
          contentIdRef: branch.contentIdRef,
          utmUrl: branch.utmUrl,
          externalPostId: branch.externalPostId,
          qualityScore: (branch as any).qualityScore,
          // For calendar event construction
          calendarTitle: `[${platform}] ${seed?.title ?? "Untitled"}${statusTag}`,
          calendarColor: platformToCalendarColor(platform),
        };
      })
    );

    enriched.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));
    return enriched;
  },
});

// ── Post History (all brands, most recent first) ─────────────────────

export const getPostHistory = query({
  args: {
    limit: v.optional(v.number()),
    brandId: v.optional(v.id("brands")),
  },
  handler: async (ctx, args) => {
    const maxItems = args.limit ?? 50;

    const branches = args.brandId
      ? await ctx.db
          .query("branches")
          .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
          .order("desc")
          .collect()
      : await ctx.db.query("branches").order("desc").collect();

    // Only published or scheduled
    const posted = branches
      .filter((b) => ["published", "scheduled"].includes(b.status))
      .slice(0, maxItems);

    const enriched = await Promise.all(
      posted.map(async (branch) => {
        const seed = await ctx.db.get(branch.seedId);
        const brand = await ctx.db.get(branch.brandId);
        return {
          branchId: branch._id,
          brand: brand?.name ?? "Unknown",
          title: seed?.title ?? "Untitled",
          format: branch.format,
          platform: formatToPlatform(branch.format),
          status: branch.status,
          publishedAt: branch.publishedAt,
          scheduledAt: branch.scheduledAt,
          externalPostId: branch.externalPostId,
          contentIdRef: branch.contentIdRef,
          utmUrl: branch.utmUrl,
          qualityScore: (branch as any).qualityScore,
        };
      })
    );

    return enriched;
  },
});

// ── Helpers ──────────────────────────────────────────────────────────

function platformToCalendarColor(platform: string): string {
  const map: Record<string, string> = {
    "Twitter/X": "7",   // Peacock
    "Pinterest": "9",   // Blueberry
    "Instagram": "10",  // Basil
    "TikTok": "6",      // Tangerine
    "LinkedIn": "1",    // Lavender
    "Facebook": "11",   // Tomato
    "Blog": "2",        // Sage
    "YouTube": "4",     // Flamingo
    "Email": "8",       // Graphite
  };
  return map[platform] ?? "8";
}

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
