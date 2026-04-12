import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");

  const result = await client.query(api.leadMagnets.list, {
    brandId: brandId as any,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.leadMagnets.create, {
    brandId: body.brandId,
    name: body.name,
    type: body.type,
    description: body.description,
    landingPageUrl: body.landingPageUrl,
    deliveryMethod: body.deliveryMethod,
    deliveryContent: body.deliveryContent,
    emailSequenceId: body.emailSequenceId,
  });

  return json({ id }, { status: 201 });
};
