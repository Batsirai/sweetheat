import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Meta-OODA: Scheduled Self-Improvement Reviews ────────────────────
// The system that reviews the system itself.
// Queries the last 7 days of pipeline data and produces a structured
// review stored as a researchBrief with type "system_review".

export const generateSystemReview = mutation({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;

    // ── 1. Seeds: created vs approved vs rejected ──────────────────
    const allSeeds = await ctx.db
      .query("seeds")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const recentSeeds = allSeeds.filter((s) => s.createdAt >= sevenDaysAgo);
    const seedsCreated = recentSeeds.length;
    const seedsApproved = recentSeeds.filter((s) => s.status === "approved").length;
    const seedsRejected = recentSeeds.filter((s) => s.status === "rejected").length;
    const seedsPending = recentSeeds.filter(
      (s) => s.status === "pitched" || s.status === "under_review"
    ).length;
    const approvalRate = seedsCreated > 0
      ? Math.round((seedsApproved / seedsCreated) * 100)
      : 0;

    // ── 2. Branches: created vs published (throughput) ─────────────
    const allBranches = await ctx.db
      .query("branches")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const recentBranches = allBranches.filter((b) => b.createdAt >= sevenDaysAgo);
    const branchesCreated = recentBranches.length;
    const branchesPublished = recentBranches.filter((b) => b.status === "published").length;
    const branchesScheduled = recentBranches.filter((b) => b.status === "scheduled").length;
    const throughputRate = branchesCreated > 0
      ? Math.round((branchesPublished / branchesCreated) * 100)
      : 0;

    // ── 3. Velocity: avg time from seed creation to publish ────────
    const publishedBranches = allBranches.filter(
      (b) => b.publishedAt && b.publishedAt >= sevenDaysAgo
    );
    let avgVelocityHours = 0;
    if (publishedBranches.length > 0) {
      const velocities = await Promise.all(
        publishedBranches.map(async (b) => {
          const seed = await ctx.db.get(b.seedId);
          if (seed && b.publishedAt) {
            return (b.publishedAt - seed.createdAt) / (1000 * 60 * 60); // hours
          }
          return null;
        })
      );
      const validVelocities = velocities.filter((v): v is number => v !== null);
      if (validVelocities.length > 0) {
        avgVelocityHours = Math.round(
          validVelocities.reduce((sum, v) => sum + v, 0) / validVelocities.length
        );
      }
    }

    // ── 4. Content performance (top/bottom by content ID) ──────────
    const analytics = await ctx.db
      .query("analytics")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const recentAnalytics = analytics.filter((a) => a.fetchedAt >= sevenDaysAgo);

    // Aggregate by branch
    const branchMetrics: Record<string, { views: number; engagement: number; branchId: string }> = {};
    for (const a of recentAnalytics) {
      const key = a.branchId as string;
      if (!branchMetrics[key]) {
        branchMetrics[key] = { views: 0, engagement: 0, branchId: key };
      }
      const m = a.metrics as Record<string, number> | undefined;
      if (m) {
        branchMetrics[key].views += (m.views ?? m.impressions ?? 0);
        branchMetrics[key].engagement += (m.likes ?? 0) + (m.shares ?? 0) + (m.saves ?? 0) + (m.comments ?? 0);
      }
    }

    const sortedByPerformance = Object.values(branchMetrics).sort(
      (a, b) => b.engagement - a.engagement
    );
    const topPerformers = sortedByPerformance.slice(0, 3).map((p) => p.branchId);
    const bottomPerformers = sortedByPerformance.slice(-3).map((p) => p.branchId);

    // ── 5. Outreach: sent vs replied ───────────────────────────────
    const outreachMessages = await ctx.db
      .query("outreachMessages")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const recentOutreach = outreachMessages.filter((m) => m.createdAt >= sevenDaysAgo);
    const outreachSent = recentOutreach.filter((m) => m.status === "sent" || m.status === "opened" || m.status === "replied").length;
    const outreachReplied = recentOutreach.filter((m) => m.status === "replied").length;
    const responseRate = outreachSent > 0
      ? Math.round((outreachReplied / outreachSent) * 100)
      : 0;

    // ── 6. Stuck branches (draft or in_review > 48 hours) ──────────
    const stuckBranches = allBranches.filter(
      (b) =>
        (b.status === "draft" || b.status === "in_review") &&
        b.updatedAt < fortyEightHoursAgo
    );

    const stuckDetails = await Promise.all(
      stuckBranches.slice(0, 10).map(async (b) => {
        const seed = await ctx.db.get(b.seedId);
        const hoursStuck = Math.round((now - b.updatedAt) / (1000 * 60 * 60));
        return {
          branchId: b._id,
          title: seed?.title ?? "Untitled",
          format: b.format,
          status: b.status,
          hoursStuck,
        };
      })
    );

    // ── 7. Platform distribution ───────────────────────────────────
    const platformCounts: Record<string, number> = {};
    for (const b of recentBranches) {
      platformCounts[b.format] = (platformCounts[b.format] ?? 0) + 1;
    }

    // ── Build the review ───────────────────────────────────────────

    // Bottleneck identification
    const bottlenecks: string[] = [];
    if (seedsPending > seedsApproved) {
      bottlenecks.push(`Review bottleneck: ${seedsPending} seeds awaiting review vs ${seedsApproved} approved. Consider batch review sessions.`);
    }
    if (stuckBranches.length > 0) {
      bottlenecks.push(`${stuckBranches.length} branches stuck in draft/review for 48+ hours. Oldest: ${stuckDetails[0]?.hoursStuck ?? 0}h.`);
    }
    if (branchesCreated > 0 && throughputRate < 50) {
      bottlenecks.push(`Low throughput: only ${throughputRate}% of branches reaching publish. Check draft quality or review velocity.`);
    }
    if (avgVelocityHours > 72) {
      bottlenecks.push(`Slow pipeline: avg ${avgVelocityHours}h from seed to publish. Target: <48h.`);
    }

    // Quality trends
    const qualityNotes: string[] = [];
    if (approvalRate >= 80) {
      qualityNotes.push(`High approval rate (${approvalRate}%) — seed quality is strong.`);
    } else if (approvalRate >= 50) {
      qualityNotes.push(`Moderate approval rate (${approvalRate}%) — room for improvement in seed targeting.`);
    } else if (seedsCreated > 0) {
      qualityNotes.push(`Low approval rate (${approvalRate}%) — review seed generation prompts and taste profile alignment.`);
    }

    // Auto-approve recommendation
    const autoApproveNotes: string[] = [];
    if (approvalRate >= 90 && seedsCreated >= 5) {
      autoApproveNotes.push("Consider enabling auto-approve for high-confidence seeds (score >= 0.85). Approval rate supports graduated autonomy.");
    }
    if (seedsPending > 5) {
      autoApproveNotes.push(`${seedsPending} seeds pending review — consider setting up scheduled review blocks.`);
    }

    // Resource allocation
    const resourceNotes: string[] = [];
    const platformEntries = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]);
    if (platformEntries.length > 0) {
      const topPlatform = platformEntries[0];
      const totalContent = platformEntries.reduce((sum, [, count]) => sum + count, 0);
      const topPct = Math.round((topPlatform[1] / totalContent) * 100);
      if (topPct > 60) {
        resourceNotes.push(`${topPlatform[0]} dominates at ${topPct}% of content. Consider diversifying across platforms.`);
      }
      resourceNotes.push(`Platform mix: ${platformEntries.map(([p, c]) => `${p}(${c})`).join(", ")}`);
    }

    // Build markdown content
    const reviewContent = [
      `# System Review — ${new Date().toISOString().slice(0, 10)}`,
      ``,
      `## Pipeline Metrics (Last 7 Days)`,
      ``,
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Seeds Created | ${seedsCreated} |`,
      `| Seeds Approved | ${seedsApproved} |`,
      `| Seeds Rejected | ${seedsRejected} |`,
      `| Seeds Pending | ${seedsPending} |`,
      `| Approval Rate | ${approvalRate}% |`,
      `| Branches Created | ${branchesCreated} |`,
      `| Branches Published | ${branchesPublished} |`,
      `| Branches Scheduled | ${branchesScheduled} |`,
      `| Throughput Rate | ${throughputRate}% |`,
      `| Avg Velocity | ${avgVelocityHours}h |`,
      `| Outreach Sent | ${outreachSent} |`,
      `| Outreach Replied | ${outreachReplied} |`,
      `| Response Rate | ${responseRate}% |`,
      `| Stuck Branches | ${stuckBranches.length} |`,
      ``,
      `## Bottlenecks`,
      bottlenecks.length > 0
        ? bottlenecks.map((b) => `- ${b}`).join("\n")
        : "- No significant bottlenecks detected.",
      ``,
      `## Quality Trends`,
      qualityNotes.length > 0
        ? qualityNotes.map((q) => `- ${q}`).join("\n")
        : "- Insufficient data for quality assessment.",
      ``,
      `## Approval Velocity`,
      autoApproveNotes.length > 0
        ? autoApproveNotes.map((a) => `- ${a}`).join("\n")
        : "- Approval workflow is operating normally.",
      ``,
      `## Resource Allocation`,
      resourceNotes.length > 0
        ? resourceNotes.map((r) => `- ${r}`).join("\n")
        : "- No platform data to analyze.",
      ``,
      `## Top Performers`,
      topPerformers.length > 0
        ? topPerformers.map((id) => `- ${id}`).join("\n")
        : "- No performance data available.",
      ``,
      `## Bottom Performers`,
      bottomPerformers.length > 0
        ? bottomPerformers.map((id) => `- ${id}`).join("\n")
        : "- No performance data available.",
      ``,
      `## Stuck Branches`,
      stuckDetails.length > 0
        ? stuckDetails.map((s) => `- **${s.title}** (${s.format}) — ${s.status} for ${s.hoursStuck}h`).join("\n")
        : "- No stuck branches.",
    ].join("\n");

    // Store as research brief
    const briefId = await ctx.db.insert("researchBriefs", {
      brandId: args.brandId,
      type: "system_review",
      title: `System Review — ${new Date().toISOString().slice(0, 10)}`,
      content: reviewContent,
      contentRecommendations: [
        ...bottlenecks.slice(0, 3),
        ...qualityNotes.slice(0, 2),
        ...autoApproveNotes.slice(0, 2),
      ],
      createdAt: now,
    });

    return {
      briefId,
      summary: {
        seedsCreated,
        seedsApproved,
        seedsRejected,
        seedsPending,
        approvalRate,
        branchesCreated,
        branchesPublished,
        branchesScheduled,
        throughputRate,
        avgVelocityHours,
        outreachSent,
        outreachReplied,
        responseRate,
        stuckBranchCount: stuckBranches.length,
        topPerformers,
        bottomPerformers,
        bottlenecks,
        qualityNotes,
        autoApproveNotes,
        resourceNotes,
      },
    };
  },
});

// ── Queries ──────────────────────────────────────────────────────────

export const getLatestReview = query({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("researchBriefs")
      .withIndex("by_brand_type", (q) =>
        q.eq("brandId", args.brandId).eq("type", "system_review")
      )
      .order("desc")
      .take(1);

    return reviews[0] ?? null;
  },
});

export const checkBottlenecks = query({
  args: {
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;

    // Check for stuck branches
    const allBranches = await ctx.db
      .query("branches")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const stuckBranches = allBranches.filter(
      (b) =>
        (b.status === "draft" || b.status === "in_review") &&
        b.updatedAt < fortyEightHoursAgo
    );

    // Check for pending seeds
    const allSeeds = await ctx.db
      .query("seeds")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const pendingSeeds = allSeeds.filter(
      (s) => s.status === "pitched" || s.status === "under_review"
    );

    const stuckDetails = await Promise.all(
      stuckBranches.slice(0, 5).map(async (b) => {
        const seed = await ctx.db.get(b.seedId);
        return {
          branchId: b._id,
          title: seed?.title ?? "Untitled",
          format: b.format,
          status: b.status,
          hoursStuck: Math.round((now - b.updatedAt) / (1000 * 60 * 60)),
        };
      })
    );

    return {
      hasBottlenecks: stuckBranches.length > 0 || pendingSeeds.length > 5,
      stuckBranches: stuckDetails,
      stuckBranchCount: stuckBranches.length,
      pendingSeedCount: pendingSeeds.length,
      alerts: [
        ...(stuckBranches.length > 0
          ? [`${stuckBranches.length} branches stuck in draft/review for 48+ hours`]
          : []),
        ...(pendingSeeds.length > 5
          ? [`${pendingSeeds.length} seeds awaiting review — consider batch review`]
          : []),
      ],
    };
  },
});
