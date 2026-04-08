import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const brandId = url.searchParams.get("brandId") || undefined;
  const status = url.searchParams.get("status") || undefined;

  const client = getConvexClient();
  const learnings = await client.query(api.learnings.list, {
    brandId: brandId as any,
    status,
  });
  return json(learnings);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();
  const id = await client.mutation(api.learnings.create, {
    brandId: body.brandId,
    trainingId: body.trainingId,
    layer: body.layer,
    proposal: body.proposal,
    reasoning: body.reasoning,
    sourceRunId: body.sourceRunId,
  });
  return json({ id }, { status: 201 });
};
