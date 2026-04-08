import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ params }) => {
  const client = getConvexClient();
  const brand = await client.query(api.brands.get, {
    id: params.id as any,
  });
  if (!brand) {
    return json({ error: "Not found" }, { status: 404 });
  }
  return json(brand);
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  const client = getConvexClient();

  await client.mutation(api.brands.update, {
    id: params.id as any,
    ...body,
  });

  return json({ success: true });
};
