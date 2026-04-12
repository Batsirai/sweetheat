import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ params }) => {
  const client = getConvexClient();
  const { campaignId } = params;

  const result = await client.query(api.outreach.listMessages, {
    campaignId: campaignId as any,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request, params }) => {
  const body = await request.json();
  const client = getConvexClient();
  const { campaignId } = params;

  const id = await client.mutation(api.outreach.createMessage, {
    campaignId: (body.campaignId ?? campaignId) as any,
    contactId: body.contactId,
    brandId: body.brandId,
    type: body.type,
    subject: body.subject,
    body: body.body,
  });

  return json({ id }, { status: 201 });
};
