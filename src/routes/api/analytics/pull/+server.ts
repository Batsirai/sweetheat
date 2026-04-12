import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

const VALID_ACTIONS = ["overview", "referrers", "campaigns", "timeseries"] as const;
type PullAction = (typeof VALID_ACTIONS)[number];

// POST /api/analytics/pull
// Body: { action: "overview" | "referrers" | "campaigns" | "timeseries", brandId: string }
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { action: pullAction, brandId } = body as { action: PullAction; brandId: string };

  if (!brandId) {
    return json({ error: "brandId is required" }, { status: 400 });
  }

  if (!VALID_ACTIONS.includes(pullAction)) {
    return json(
      { error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}` },
      { status: 400 }
    );
  }

  const client = getConvexClient();

  const actionMap = {
    overview: api.datafast.pullOverview,
    referrers: api.datafast.pullReferrers,
    campaigns: api.datafast.pullCampaigns,
    timeseries: api.datafast.pullTimeseries,
  };

  const data = await client.action(actionMap[pullAction], {
    brandId: brandId as any,
  });

  return json({ action: pullAction, data }, { status: 200 });
};
