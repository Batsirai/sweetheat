import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const branchId = url.searchParams.get("branchId");
  if (!branchId) return json({ error: "branchId required" }, { status: 400 });

  const client = getConvexClient();
  const drafts = await client.query(api.drafts.listByBranch, {
    branchId: branchId as any,
  });
  return json(drafts);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();
  const id = await client.mutation(api.drafts.create, {
    branchId: body.branchId,
    body: body.body,
    visualDirection: body.visualDirection,
    authoredBy: body.authoredBy || "agent",
  });
  return json({ id }, { status: 201 });
};
