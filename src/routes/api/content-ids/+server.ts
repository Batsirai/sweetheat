import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const branchId = url.searchParams.get("branchId");

  if (branchId) {
    const result = await client.query(api.contentIds.getByBranch, {
      branchId: branchId as any,
    });
    return json(result);
  }

  const result = await client.query(api.contentIds.listByBrand, {
    brandId: brandId as any,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.contentIds.generate, {
    branchId: body.branchId,
  });

  return json({ id }, { status: 201 });
};
