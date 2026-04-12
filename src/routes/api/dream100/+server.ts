import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const category = url.searchParams.get("category");

  const result = await client.query(api.dream100.list, {
    brandId: brandId as any,
    category: category ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.dream100.create, {
    brandId: body.brandId,
    name: body.name,
    category: body.category,
    platform: body.platform,
    url: body.url,
    audienceSize: body.audienceSize,
    audienceOverlap: body.audienceOverlap,
    phase: body.phase,
    notes: body.notes,
    adTargetable: body.adTargetable,
    adTargetId: body.adTargetId,
  });

  return json({ id }, { status: 201 });
};
