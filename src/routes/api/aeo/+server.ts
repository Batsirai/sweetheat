import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const engine = url.searchParams.get("engine");

  const result = await client.query(api.aeoChecks.list, {
    brandId: brandId as any,
    engine: engine ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.aeoChecks.create, {
    brandId: body.brandId,
    query: body.query,
    engine: body.engine,
    cited: body.cited,
    citedUrl: body.citedUrl,
    position: body.position,
    competitorsCited: body.competitorsCited,
    fullResponse: body.fullResponse,
  });

  return json({ id }, { status: 201 });
};
