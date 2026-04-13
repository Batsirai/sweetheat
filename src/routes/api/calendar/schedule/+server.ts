import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  if (!brandId || !startDate || !endDate) {
    return json({ error: "brandId, startDate, and endDate are required" }, { status: 400 });
  }

  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();

  const [scheduled, published] = await Promise.all([
    client.query(api.contentCalendar.getSchedule, {
      brandId: brandId as any,
      startDate: startMs,
      endDate: endMs,
    }),
    client.query(api.contentCalendar.getPublished, {
      brandId: brandId as any,
      startDate: startMs,
      endDate: endMs,
    }),
  ]);

  return json({ scheduled, published });
};
