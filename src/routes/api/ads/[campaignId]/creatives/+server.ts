import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ params }) => {
  const client = getConvexClient();
  const { campaignId } = params;

  const result = await client.query(api.adCampaigns.listCreatives, {
    campaignId: campaignId as any,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request, params }) => {
  const body = await request.json();
  const client = getConvexClient();
  const { campaignId } = params;

  const id = await client.mutation(api.adCampaigns.createCreative, {
    campaignId: (body.campaignId ?? campaignId) as any,
    brandId: body.brandId,
    hook: body.hook,
    body: body.body,
    cta: body.cta,
    visualDirection: body.visualDirection,
    destinationUrl: body.destinationUrl,
    variant: body.variant,
    contentIdRef: body.contentIdRef,
  });

  return json({ id }, { status: 201 });
};
