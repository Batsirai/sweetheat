import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const status = url.searchParams.get("status");

  const result = await client.query(api.seoTargets.list, {
    brandId: brandId as any,
    status: status ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.seoTargets.create, {
    brandId: body.brandId,
    keyword: body.keyword,
    searchVolume: body.searchVolume,
    difficulty: body.difficulty,
    intent: body.intent,
    currentRanking: body.currentRanking,
    currentUrl: body.currentUrl,
    targetUrl: body.targetUrl,
    branchId: body.branchId,
  });

  return json({ id }, { status: 201 });
};
