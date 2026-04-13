import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");

  if (!brandId) {
    return json({ error: "brandId is required" }, { status: 400 });
  }

  const result = await client.query(api.metaOoda.getLatestReview, {
    brandId: brandId as any,
  });

  return json(result);
};
