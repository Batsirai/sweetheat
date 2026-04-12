import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const source = url.searchParams.get("source");

  const result = await client.query(api.performanceSnapshots.list, {
    brandId: brandId as any,
    source: source ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.performanceSnapshots.create, {
    brandId: body.brandId,
    source: body.source,
    period: body.period,
    periodStart: body.periodStart,
    periodEnd: body.periodEnd,
    metrics: body.metrics,
    topPerformers: body.topPerformers,
    bottomPerformers: body.bottomPerformers,
    insights: body.insights,
  });

  return json({ id }, { status: 201 });
};
