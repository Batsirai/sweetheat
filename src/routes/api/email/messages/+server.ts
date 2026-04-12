import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const sequenceId = url.searchParams.get("sequenceId");

  const result = await client.query(api.emailSequences.listMessages, {
    sequenceId: sequenceId as any,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.emailSequences.createMessage, {
    sequenceId: body.sequenceId,
    brandId: body.brandId,
    position: body.position,
    subject: body.subject,
    body: body.body,
    closeType: body.closeType,
  });

  return json({ id }, { status: 201 });
};
