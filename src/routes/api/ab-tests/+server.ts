import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const status = url.searchParams.get("status");

  if (!brandId) {
    return json({ error: "brandId is required" }, { status: 400 });
  }

  const tests = await client.query(api.abTests.list, {
    brandId: brandId as any,
    status: status || undefined,
  });
  return json(tests);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  // Route by action
  if (body.action === "update_metrics") {
    await client.mutation(api.abTests.updateMetrics, {
      id: body.id,
      variant: body.variant,
      metrics: body.metrics,
    });
    return json({ updated: true });
  }

  if (body.action === "declare_winner") {
    await client.mutation(api.abTests.declareWinner, {
      id: body.id,
      winner: body.winner,
      winnerReason: body.winnerReason,
    });
    return json({ declared: true });
  }

  // Default: create
  const id = await client.mutation(api.abTests.create, {
    brandId: body.brandId,
    name: body.name,
    type: body.type,
    variantA: body.variantA,
    variantB: body.variantB,
    endsAt: body.endsAt,
  });

  return json({ id }, { status: 201 });
};
