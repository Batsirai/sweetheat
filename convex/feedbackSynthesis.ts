import { v } from "convex/values";
import { query } from "./_generated/server";

// Synthesize all feedback patterns into a document the strategist/Carson can read
// This is the "taste profile" — what does the user approve and why?
export const getTasteProfile = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const seeds = await ctx.db
      .query("seeds")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const approved = seeds.filter((s) => s.status === "approved");
    const rejected = seeds.filter((s) => s.status === "rejected");

    // Count feedback reasons
    const approveReasons: Record<string, number> = {};
    const rejectReasons: Record<string, number> = {};

    for (const s of approved) {
      if (s.feedbackReason) {
        approveReasons[s.feedbackReason] = (approveReasons[s.feedbackReason] || 0) + 1;
      }
    }
    for (const s of rejected) {
      if (s.feedbackReason) {
        rejectReasons[s.feedbackReason] = (rejectReasons[s.feedbackReason] || 0) + 1;
      }
    }

    // Pillar performance
    const pillarStats: Record<string, { approved: number; rejected: number }> = {};
    for (const s of [...approved, ...rejected]) {
      const pillar = s.contentPillar || "uncategorized";
      if (!pillarStats[pillar]) pillarStats[pillar] = { approved: 0, rejected: 0 };
      if (s.status === "approved") pillarStats[pillar].approved++;
      else pillarStats[pillar].rejected++;
    }

    // Purpose performance
    const purposeStats: Record<string, { approved: number; rejected: number }> = {};
    for (const s of [...approved, ...rejected]) {
      const purpose = s.purpose || "untagged";
      if (!purposeStats[purpose]) purposeStats[purpose] = { approved: 0, rejected: 0 };
      if (s.status === "approved") purposeStats[purpose].approved++;
      else purposeStats[purpose].rejected++;
    }

    // Source performance
    const sourceStats: Record<string, { approved: number; rejected: number }> = {};
    for (const s of [...approved, ...rejected]) {
      if (!sourceStats[s.source]) sourceStats[s.source] = { approved: 0, rejected: 0 };
      if (s.status === "approved") sourceStats[s.source].approved++;
      else sourceStats[s.source].rejected++;
    }

    // Recent feedback notes (last 10)
    const recentFeedback = [...approved, ...rejected]
      .filter((s) => s.feedbackNote)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10)
      .map((s) => ({
        title: s.title,
        status: s.status,
        reason: s.feedbackReason,
        note: s.feedbackNote,
      }));

    // Approved titles (for dedup and pattern matching)
    const approvedTitles = approved
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 20)
      .map((s) => s.title);

    const rejectedTitles = rejected
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 20)
      .map((s) => s.title);

    return {
      totalApproved: approved.length,
      totalRejected: rejected.length,
      approvalRate: approved.length + rejected.length > 0
        ? Math.round((approved.length / (approved.length + rejected.length)) * 100)
        : 0,
      approveReasons,
      rejectReasons,
      pillarStats,
      purposeStats,
      sourceStats,
      recentFeedback,
      approvedTitles,
      rejectedTitles,
    };
  },
});
