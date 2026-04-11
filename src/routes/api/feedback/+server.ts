import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

// GET /api/feedback?brandId=X — get taste profile (what user approves/rejects and why)
export const GET: RequestHandler = async ({ url }) => {
  const brandId = url.searchParams.get("brandId");
  if (!brandId) return json({ error: "brandId required" }, { status: 400 });

  const client = getConvexClient();
  const profile = await client.query(api.feedbackSynthesis.getTasteProfile, {
    brandId: brandId as any,
  });
  return json(profile);
};
