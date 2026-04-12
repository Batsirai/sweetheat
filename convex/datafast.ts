import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const DATAFAST_BASE = "https://datafa.st/api/v1";

async function datafastGet(path: string): Promise<any> {
  const apiKey = process.env.DATAFAST_API_KEY;
  if (!apiKey) throw new Error("DATAFAST_API_KEY not set");

  const res = await fetch(`${DATAFAST_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DataFast API ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

function nowRange(): { periodStart: number; periodEnd: number; period: string } {
  const now = Date.now();
  const start = now - 7 * 24 * 60 * 60 * 1000; // 7-day rolling window
  const label = new Date(now).toISOString().slice(0, 10); // e.g. "2026-04-11"
  return { periodStart: start, periodEnd: now, period: label };
}

// ── pullOverview ──────────────────────────────────────────────────────────────
// Pulls site-wide analytics overview from DataFast and stores as a snapshot.

export const pullOverview = action({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const data = await datafastGet("/analytics/overview");
    const { periodStart, periodEnd, period } = nowRange();

    await ctx.runMutation(api.performanceSnapshots.create, {
      brandId: args.brandId,
      source: "datafast_overview",
      period,
      periodStart,
      periodEnd,
      metrics: data,
    });

    return data;
  },
});

// ── pullReferrers ─────────────────────────────────────────────────────────────
// Pulls referrer breakdown and stores as a snapshot.

export const pullReferrers = action({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const data = await datafastGet("/analytics/referrers");
    const { periodStart, periodEnd, period } = nowRange();

    const topReferrers: string[] = Array.isArray(data)
      ? data.slice(0, 10).map((r: any) => r.referrer ?? r.source ?? String(r))
      : [];

    await ctx.runMutation(api.performanceSnapshots.create, {
      brandId: args.brandId,
      source: "datafast_referrers",
      period,
      periodStart,
      periodEnd,
      metrics: { referrers: data },
      topPerformers: topReferrers,
    });

    return data;
  },
});

// ── pullCampaigns ─────────────────────────────────────────────────────────────
// Pulls UTM campaign performance and stores as a snapshot.

export const pullCampaigns = action({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const data = await datafastGet("/analytics/campaigns");
    const { periodStart, periodEnd, period } = nowRange();

    const topCampaigns: string[] = Array.isArray(data)
      ? data.slice(0, 10).map((c: any) => c.campaign ?? c.name ?? String(c))
      : [];

    await ctx.runMutation(api.performanceSnapshots.create, {
      brandId: args.brandId,
      source: "datafast_campaigns",
      period,
      periodStart,
      periodEnd,
      metrics: { campaigns: data },
      topPerformers: topCampaigns,
    });

    return data;
  },
});

// ── pullTimeseries ────────────────────────────────────────────────────────────
// Pulls 7-day daily timeseries (visitors, sessions, revenue) and stores as a snapshot.

export const pullTimeseries = action({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const data = await datafastGet(
      "/analytics/timeseries?fields=visitors,sessions,revenue&interval=day&limit=7"
    );
    const { periodStart, periodEnd, period } = nowRange();

    await ctx.runMutation(api.performanceSnapshots.create, {
      brandId: args.brandId,
      source: "datafast_timeseries",
      period,
      periodStart,
      periodEnd,
      metrics: { timeseries: data },
    });

    return data;
  },
});

// ── generateDailyReport ──────────────────────────────────────────────────────
// Pulls DataFast overview + referrers + timeseries, returns structured daily report data.
// Does NOT store — the caller (MCP tool or Cowork task) decides what to do with it.

export const generateDailyReport = action({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const [overview, referrers, timeseries] = await Promise.all([
      datafastGet("/analytics/overview"),
      datafastGet("/analytics/referrers"),
      datafastGet(
        "/analytics/timeseries?fields=visitors,sessions,revenue&interval=day&limit=7"
      ),
    ]);

    // Parse overview metrics
    const visitors =
      overview?.visitors ?? overview?.pageviews ?? 0;
    const revenue = overview?.revenue ?? 0;
    const sessions = overview?.sessions ?? 0;
    const bounceRate = overview?.bounce_rate ?? null;

    // Top 3 referrers
    const topReferrers = Array.isArray(referrers)
      ? referrers.slice(0, 5).map((r: any) => ({
          source: r.referrer ?? r.source ?? r.name ?? "unknown",
          visitors: r.visitors ?? r.visits ?? r.count ?? 0,
          revenue: r.revenue ?? 0,
        }))
      : [];

    // 7-day timeseries for trend
    const days = Array.isArray(timeseries) ? timeseries : [];
    const totalWeekVisitors = days.reduce(
      (sum: number, d: any) => sum + (d.visitors ?? 0),
      0
    );
    const totalWeekRevenue = days.reduce(
      (sum: number, d: any) => sum + (d.revenue ?? 0),
      0
    );

    // Compute day-over-day trend (last day vs previous day)
    let trend = null;
    if (days.length >= 2) {
      const today = days[days.length - 1]?.visitors ?? 0;
      const yesterday = days[days.length - 2]?.visitors ?? 0;
      if (yesterday > 0) {
        trend = ((today - yesterday) / yesterday) * 100;
      }
    }

    // Store as a snapshot for historical tracking
    const { periodStart, periodEnd, period } = nowRange();
    await ctx.runMutation(api.performanceSnapshots.create, {
      brandId: args.brandId,
      source: "datafast_daily_report",
      period,
      periodStart,
      periodEnd,
      metrics: {
        visitors,
        revenue,
        sessions,
        bounceRate,
        topReferrers,
        weeklyVisitors: totalWeekVisitors,
        weeklyRevenue: totalWeekRevenue,
        trend,
        timeseries: days,
      },
      topPerformers: topReferrers.slice(0, 3).map((r: any) => r.source),
    });

    return {
      date: new Date().toISOString().slice(0, 10),
      visitors,
      revenue,
      sessions,
      bounceRate,
      topReferrers,
      weeklyVisitors: totalWeekVisitors,
      weeklyRevenue: totalWeekRevenue,
      trend,
      timeseries: days,
    };
  },
});
