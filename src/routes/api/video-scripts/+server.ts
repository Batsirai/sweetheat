import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const type = url.searchParams.get("type");

  const result = await client.query(api.videoScripts.list, {
    brandId: brandId as any,
    type: type ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.videoScripts.create, {
    brandId: body.brandId,
    branchId: body.branchId,
    type: body.type,
    title: body.title,
    hook: body.hook,
    script: body.script,
    cta: body.cta,
    duration: body.duration,
    creatorBrief: body.creatorBrief,
    talkingPoints: body.talkingPoints,
  });

  return json({ id }, { status: 201 });
};
