import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const view = url.searchParams.get("view");
  const brandId = url.searchParams.get("brandId");

  // Unified calendar view (all brands, all statuses)
  if (view === "unified") {
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    if (!startDate || !endDate) {
      return json({ error: "startDate and endDate required for unified view" }, { status: 400 });
    }
    const result = await client.query(api.contentCalendar.getUnifiedCalendar, {
      startDate: Number(startDate),
      endDate: Number(endDate),
      brandId: brandId ? (brandId as any) : undefined,
    });
    return json(result);
  }

  // Post history (most recent, all brands)
  if (view === "history") {
    const limit = url.searchParams.get("limit");
    const result = await client.query(api.contentCalendar.getPostHistory, {
      limit: limit ? Number(limit) : undefined,
      brandId: brandId ? (brandId as any) : undefined,
    });
    return json(result);
  }

  // Single branch lookup (for MCP calendar event creation)
  const branchId = url.searchParams.get("branchId");
  if (branchId) {
    const branch = await client.query(api.branches.get, { id: branchId as any });
    if (!branch) return json({ error: "Branch not found" }, { status: 404 });
    const seed = await client.query(api.seeds.get, { id: branch.seedId });
    const brand = await client.query(api.brands.get, { id: branch.brandId });
    const platform = formatToPlatform(branch.format);
    const statusTag = branch.status === "published" ? " ✓" : branch.status === "scheduled" ? " ⏳" : "";
    return json({
      branchId: branch._id,
      brandName: brand?.name ?? "Unknown",
      seedTitle: seed?.title ?? "Untitled",
      format: branch.format,
      platform,
      status: branch.status,
      time: branch.publishedAt ?? branch.scheduledAt ?? branch.updatedAt,
      contentIdRef: branch.contentIdRef,
      utmUrl: branch.utmUrl,
      externalPostId: branch.externalPostId,
      calendarTitle: `[${platform}] ${seed?.title ?? "Untitled"}${statusTag}`,
      calendarColor: platformToColor(platform),
    });
  }

  // Default: brand-scoped schedule view
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  if (!brandId || !startDate || !endDate) {
    return json({ error: "brandId, startDate, and endDate required (or use view=unified|history)" }, { status: 400 });
  }

  const startMs = Number(startDate);
  const endMs = Number(endDate);

  const [scheduled, published] = await Promise.all([
    client.query(api.contentCalendar.getSchedule, {
      brandId: brandId as any,
      startDate: startMs,
      endDate: endMs,
    }),
    client.query(api.contentCalendar.getPublished, {
      brandId: brandId as any,
      startDate: startMs,
      endDate: endMs,
    }),
  ]);

  return json({ scheduled, published });
};

function formatToPlatform(format: string): string {
  const map: Record<string, string> = {
    pin: "Pinterest", tweet: "Twitter/X", linkedin: "LinkedIn", blog: "Blog",
    caption_ig: "Instagram", caption_tiktok: "TikTok", newsletter: "Email",
    carousel: "Instagram", quote_card: "Instagram", short_video: "TikTok",
    long_video: "YouTube", facebook: "Facebook",
  };
  return map[format] ?? format;
}

function platformToColor(platform: string): string {
  const map: Record<string, string> = {
    "Twitter/X": "7", "Pinterest": "9", "Instagram": "10", "TikTok": "6",
    "LinkedIn": "1", "Facebook": "11", "Blog": "2", "YouTube": "4", "Email": "8",
  };
  return map[platform] ?? "8";
}
