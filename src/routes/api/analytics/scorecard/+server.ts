import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const source = url.searchParams.get("source") ?? "scorecard";

  const result = await client.query(api.performanceSnapshots.getLatest, {
    brandId: brandId as any,
    source,
  });
  return json(result);
};
