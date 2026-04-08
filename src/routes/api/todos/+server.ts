import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const owner = url.searchParams.get("owner") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const brandId = url.searchParams.get("brandId") || undefined;

  const client = getConvexClient();
  const todos = await client.query(api.todos.list, {
    owner,
    status,
    brandId: brandId as any,
  });
  return json(todos);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();
  const id = await client.mutation(api.todos.create, {
    brandId: body.brandId,
    owner: body.owner,
    type: body.type,
    targetType: body.targetType,
    targetId: body.targetId,
    description: body.description,
    priority: body.priority,
  });
  return json({ id }, { status: 201 });
};
