import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const type = url.searchParams.get("type");

  const result = await client.query(api.researchBriefs.list, {
    brandId: brandId as any,
    type: type ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.researchBriefs.create, {
    brandId: body.brandId,
    type: body.type,
    title: body.title,
    content: body.content,
    trendingTopics: body.trendingTopics,
    keywordOpportunities: body.keywordOpportunities,
    competitorUpdates: body.competitorUpdates,
    contentRecommendations: body.contentRecommendations,
  });

  return json({ id }, { status: 201 });
};
