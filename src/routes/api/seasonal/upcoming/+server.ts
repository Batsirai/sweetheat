import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const lookAheadDays = url.searchParams.get("lookAheadDays");

  if (!brandId) {
    return json({ error: "brandId is required" }, { status: 400 });
  }

  const result = await client.query(api.seasonalPlanner.getUpcoming, {
    brandId: brandId as any,
    lookAheadDays: lookAheadDays ? parseInt(lookAheadDays, 10) : undefined,
  });

  return json(result);
};
