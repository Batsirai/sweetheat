import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const type = url.searchParams.get("type");

  const result = await client.query(api.outreach.listCampaigns, {
    brandId: brandId as any,
    type: type ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.outreach.createCampaign, {
    brandId: body.brandId,
    name: body.name,
    type: body.type,
    targetAudience: body.targetAudience,
    targetCount: body.targetCount,
    subjectTemplate: body.subjectTemplate,
    bodyTemplate: body.bodyTemplate,
    followUpTemplates: body.followUpTemplates,
    followUpIntervalDays: body.followUpIntervalDays,
  });

  return json({ id }, { status: 201 });
};
