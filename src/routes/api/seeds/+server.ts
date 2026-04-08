import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");

  const seeds = await client.query(api.seeds.list, {
    brandId: brandId ? (brandId as any) : undefined,
  });
  return json(seeds);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const seedId = await client.mutation(api.seeds.create, {
    brandId: body.brandId,
    title: body.title,
    description: body.description,
    source: body.source || "agent_research",
    pitchedBy: body.pitchedBy || "agent",
    targetFormats: body.targetFormats,
    attachments: body.attachments,
  });

  return json({ seedId }, { status: 201 });
};
