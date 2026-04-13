import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  if (!body.brandId) {
    return json({ error: "brandId is required" }, { status: 400 });
  }

  const result = await client.mutation(api.seasonalPlanner.generateSeasonalCalendar, {
    brandId: body.brandId,
    lookAheadDays: body.lookAheadDays ?? undefined,
  });

  return json(result, { status: 201 });
};
