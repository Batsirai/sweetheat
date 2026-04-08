import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const targetType = url.searchParams.get("targetType");
  const targetId = url.searchParams.get("targetId");
  if (!targetType || !targetId) {
    return json({ error: "targetType and targetId required" }, { status: 400 });
  }

  const client = getConvexClient();
  const comments = await client.query(api.comments.listByTarget, {
    targetType,
    targetId,
  });
  return json(comments);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();
  const id = await client.mutation(api.comments.create, {
    targetType: body.targetType,
    targetId: body.targetId,
    authoredBy: body.authoredBy || "agent",
    body: body.body,
    isQuickFeedback: body.isQuickFeedback,
    quickFeedbackType: body.quickFeedbackType,
  });
  return json({ id }, { status: 201 });
};
