import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const platform = url.searchParams.get("platform");
  const status = url.searchParams.get("status");

  const result = await client.query(api.adCampaigns.listCampaigns, {
    brandId: brandId as any,
    platform: platform ?? undefined,
    status: status ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.adCampaigns.createCampaign, {
    brandId: body.brandId,
    platform: body.platform,
    name: body.name,
    type: body.type,
    targetInterests: body.targetInterests,
    targetDream100Ids: body.targetDream100Ids,
    dailyBudget: body.dailyBudget,
  });

  return json({ id }, { status: 201 });
};
