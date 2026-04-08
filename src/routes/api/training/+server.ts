import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const brandId = url.searchParams.get("brandId");
  if (!brandId) return json({ error: "brandId required" }, { status: 400 });

  const client = getConvexClient();
  const training = await client.query(api.training.list, {
    brandId: brandId as any,
  });
  return json(training);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();
  const id = await client.mutation(api.training.create, body);
  return json({ id }, { status: 201 });
};
