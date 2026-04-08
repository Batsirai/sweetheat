import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const limit = url.searchParams.get("limit");
  const client = getConvexClient();
  const runs = await client.query(api.agentRuns.list, {
    limit: limit ? parseInt(limit) : undefined,
  });
  return json(runs);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  if (body.action === "start") {
    const id = await client.mutation(api.agentRuns.start, {});
    return json({ id }, { status: 201 });
  }

  if (body.action === "complete") {
    await client.mutation(api.agentRuns.complete, body);
    return json({ success: true });
  }

  return json({ error: "Unknown action" }, { status: 400 });
};
