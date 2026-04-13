import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Seasonal Content Pre-Planning (90-Day Lookahead) ─────────────────
// Hardcoded calendar of major dates relevant to AlreadyLoved's ICP.
// Checks coverage against existing seeds and suggests content gaps.

const SEASONAL_EVENTS = [
  // Spring
  { date: "04-20", name: "Easter", leadDays: 21, pillars: ["gift_guide", "seasonal"], hooks: ["GIFT", "FAITH"] },
  { date: "05-11", name: "Mother's Day", leadDays: 21, pillars: ["gift_guide", "milestone"], hooks: ["GIFT", "IDENTITY"] },
  // Summer
  { date: "06-15", name: "Father's Day", leadDays: 14, pillars: ["gift_guide"], hooks: ["GIFT", "IDENTITY"] },
  { date: "06-01", name: "Summer Break Start", leadDays: 14, pillars: ["bedtime identity", "parenting"], hooks: ["ROUTINE", "BEDTIME"] },
  // Back to School
  { date: "08-15", name: "Back to School", leadDays: 21, pillars: ["milestone", "parenting"], hooks: ["MILESTONE", "IDENTITY", "FEAR"] },
  // Fall
  { date: "10-31", name: "Halloween", leadDays: 14, pillars: ["seasonal"], hooks: ["FAITH", "IDENTITY"] },
  { date: "11-28", name: "Thanksgiving", leadDays: 21, pillars: ["seasonal", "gift_guide"], hooks: ["GIFT", "FAITH"] },
  // Holiday Season
  { date: "11-29", name: "Black Friday", leadDays: 14, pillars: ["gift_guide"], hooks: ["GIFT"] },
  { date: "12-02", name: "Cyber Monday", leadDays: 14, pillars: ["gift_guide"], hooks: ["GIFT"] },
  { date: "12-25", name: "Christmas", leadDays: 30, pillars: ["gift_guide", "seasonal"], hooks: ["GIFT", "FAITH", "IDENTITY"] },
  // New Year
  { date: "01-01", name: "New Year", leadDays: 14, pillars: ["parenting", "bedtime identity"], hooks: ["ROUTINE", "IDENTITY"] },
  // Valentine's
  { date: "02-14", name: "Valentine's Day", leadDays: 14, pillars: ["gift_guide"], hooks: ["IDENTITY", "GIFT"] },
  // Other
  { date: "03-02", name: "Read Across America Day", leadDays: 14, pillars: ["custom_book"], hooks: ["IDENTITY"] },
  { date: "04-02", name: "National Children's Book Day", leadDays: 14, pillars: ["custom_book"], hooks: ["IDENTITY"] },
  { date: "09-08", name: "Grandparents Day", leadDays: 14, pillars: ["gift_guide"], hooks: ["GIFT"] },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────

function getUpcomingEvents(fromDate: Date, days: number) {
  const results: Array<{
    name: string;
    date: string;
    eventDate: Date;
    leadStartDate: Date;
    leadDays: number;
    pillars: readonly string[];
    hooks: readonly string[];
    daysUntil: number;
    contentDeadline: Date;
    isInLeadWindow: boolean;
  }> = [];

  const endDate = new Date(fromDate);
  endDate.setDate(endDate.getDate() + days);

  for (const event of SEASONAL_EVENTS) {
    const [monthStr, dayStr] = event.date.split("-");
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    // Check both current year and next year for boundary handling
    for (const yearOffset of [0, 1]) {
      const year = fromDate.getFullYear() + yearOffset;
      const eventDate = new Date(year, month, day);

      if (eventDate >= fromDate && eventDate <= endDate) {
        const leadStartDate = new Date(eventDate);
        leadStartDate.setDate(leadStartDate.getDate() - event.leadDays);

        const daysUntil = Math.ceil(
          (eventDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        results.push({
          name: event.name,
          date: `${year}-${event.date}`,
          eventDate,
          leadStartDate,
          leadDays: event.leadDays,
          pillars: event.pillars,
          hooks: event.hooks,
          daysUntil,
          contentDeadline: leadStartDate,
          isInLeadWindow: fromDate >= leadStartDate,
        });
      }
    }
  }

  // Sort by date
  results.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  return results;
}

// ── Mutations ────────────────────────────────────────────────────────

export const generateSeasonalCalendar = mutation({
  args: {
    brandId: v.id("brands"),
    lookAheadDays: v.optional(v.number()), // default 90
  },
  handler: async (ctx, args) => {
    const days = args.lookAheadDays ?? 90;
    const now = new Date();
    const upcoming = getUpcomingEvents(now, days);

    // Get all seeds for this brand to check coverage
    const seeds = await ctx.db
      .query("seeds")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const results = [];

    for (const event of upcoming) {
      // Check if any seed title or description references this event
      const nameLower = event.name.toLowerCase();
      const matchingSeeds = seeds.filter(
        (s) =>
          s.title.toLowerCase().includes(nameLower) ||
          s.description.toLowerCase().includes(nameLower) ||
          (s.contentPillar && event.pillars.includes(s.contentPillar))
      );

      let coverageStatus: "has_content" | "needs_content" | "in_progress";
      if (matchingSeeds.some((s) => s.status === "approved")) {
        coverageStatus = "has_content";
      } else if (matchingSeeds.some((s) => s.status === "pitched" || s.status === "under_review")) {
        coverageStatus = "in_progress";
      } else {
        coverageStatus = "needs_content";
      }

      // If no content exists and we're in the lead window, create a research brief
      if (coverageStatus === "needs_content" && event.isInLeadWindow) {
        const briefContent = [
          `## Seasonal Content Brief: ${event.name}`,
          ``,
          `**Event Date:** ${event.date}`,
          `**Days Until:** ${event.daysUntil}`,
          `**Content Deadline:** ${event.contentDeadline.toISOString().slice(0, 10)}`,
          `**Lead Time:** ${event.leadDays} days`,
          ``,
          `### Suggested Pillars`,
          event.pillars.map((p) => `- ${p}`).join("\n"),
          ``,
          `### Suggested Hook Angles`,
          event.hooks.map((h) => `- ${h}`).join("\n"),
          ``,
          `### Content Ideas`,
          `- Gift guide featuring products relevant to ${event.name}`,
          `- Seasonal affirmation content tied to ${event.name} themes`,
          `- Social posts with ${event.name} hashtags and trending topics`,
          `- Email sequence leading up to ${event.name}`,
          ``,
          `### Action Required`,
          `Create seeds targeting ${event.name} with the suggested pillars and hooks.`,
          `Content should be ready ${event.leadDays} days before the event.`,
        ].join("\n");

        await ctx.db.insert("researchBriefs", {
          brandId: args.brandId,
          type: "seasonal_planning",
          title: `Seasonal Brief: ${event.name} (${event.date})`,
          content: briefContent,
          contentRecommendations: [
            `Create ${event.name} content with pillars: ${event.pillars.join(", ")}`,
            `Use hook angles: ${event.hooks.join(", ")}`,
            `Content deadline: ${event.contentDeadline.toISOString().slice(0, 10)}`,
          ],
          createdAt: Date.now(),
        });
      }

      results.push({
        name: event.name,
        date: event.date,
        daysUntil: event.daysUntil,
        pillars: [...event.pillars],
        hooks: [...event.hooks],
        coverageStatus,
        matchingSeedCount: matchingSeeds.length,
        isInLeadWindow: event.isInLeadWindow,
        contentDeadline: event.contentDeadline.toISOString().slice(0, 10),
      });
    }

    return results;
  },
});

// ── Queries ──────────────────────────────────────────────────────────

export const getUpcoming = query({
  args: {
    brandId: v.id("brands"),
    lookAheadDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.lookAheadDays ?? 90;
    const now = new Date();
    const upcoming = getUpcomingEvents(now, days);

    // Get all seeds for this brand to check coverage
    const seeds = await ctx.db
      .query("seeds")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    return upcoming.map((event) => {
      const nameLower = event.name.toLowerCase();
      const matchingSeeds = seeds.filter(
        (s) =>
          s.title.toLowerCase().includes(nameLower) ||
          s.description.toLowerCase().includes(nameLower) ||
          (s.contentPillar && event.pillars.includes(s.contentPillar))
      );

      let coverageStatus: "has_content" | "needs_content" | "in_progress";
      if (matchingSeeds.some((s) => s.status === "approved")) {
        coverageStatus = "has_content";
      } else if (matchingSeeds.some((s) => s.status === "pitched" || s.status === "under_review")) {
        coverageStatus = "in_progress";
      } else {
        coverageStatus = "needs_content";
      }

      return {
        name: event.name,
        date: event.date,
        daysUntil: event.daysUntil,
        pillars: [...event.pillars],
        hooks: [...event.hooks],
        coverageStatus,
        matchingSeedCount: matchingSeeds.length,
        isInLeadWindow: event.isInLeadWindow,
        contentDeadline: event.contentDeadline.toISOString().slice(0, 10),
      };
    });
  },
});
