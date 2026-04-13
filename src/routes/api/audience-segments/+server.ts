import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");

  if (!brandId) {
    return json({ error: "brandId is required" }, { status: 400 });
  }

  const segments = await client.query(api.audienceSegments.list, {
    brandId: brandId as any,
  });
  return json(segments);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  // Route by action
  if (body.action === "update") {
    await client.mutation(api.audienceSegments.update, {
      id: body.id,
      name: body.name,
      description: body.description,
      painPoints: body.painPoints,
      desires: body.desires,
      language: body.language,
      platforms: body.platforms,
      contentPillars: body.contentPillars,
      hookStyles: body.hookStyles,
      avgConversionRate: body.avgConversionRate,
      totalRevenue: body.totalRevenue,
      contentCount: body.contentCount,
      isActive: body.isActive,
    });
    return json({ updated: true });
  }

  // Default: create
  const id = await client.mutation(api.audienceSegments.create, {
    brandId: body.brandId,
    name: body.name,
    description: body.description,
    painPoints: body.painPoints,
    desires: body.desires,
    language: body.language,
    platforms: body.platforms,
    contentPillars: body.contentPillars,
    hookStyles: body.hookStyles,
  });

  return json({ id }, { status: 201 });
};
