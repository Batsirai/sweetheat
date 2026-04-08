import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

// GET /api/knowledge?brandId=X — list topics
// GET /api/knowledge?brandId=X&ideas=true — list ready idea briefs
export const GET: RequestHandler = async ({ url }) => {
  const brandId = url.searchParams.get("brandId");
  if (!brandId) return json({ error: "brandId required" }, { status: 400 });

  const client = getConvexClient();

  if (url.searchParams.get("ideas") === "true") {
    const ideas = await client.query(api.knowledge.listIdeaBriefs, {
      brandId: brandId as any,
      status: url.searchParams.get("status") ?? "ready",
    });
    return json(ideas);
  }

  const topics = await client.query(api.knowledge.listTopics, {
    brandId: brandId as any,
  });
  return json(topics);
};

// POST /api/knowledge — create topic or claim idea brief
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  if (body.action === "createTopic") {
    const id = await client.mutation(api.knowledge.createTopic, {
      brandId: body.brandId,
      name: body.name,
      slug: body.slug,
      description: body.description,
      searchTerms: body.searchTerms,
    });
    return json({ id }, { status: 201 });
  }

  if (body.action === "claimIdea") {
    await client.mutation(api.knowledge.claimIdeaBrief, {
      id: body.ideaBriefId,
      claimedBy: body.claimedBy ?? "agent",
    });
    return json({ success: true });
  }

  if (body.action === "ideaToSeed") {
    const seedId = await client.mutation(api.knowledge.ideaBriefToSeed, {
      ideaBriefId: body.ideaBriefId,
    });
    return json({ seedId }, { status: 201 });
  }

  return json({ error: "Unknown action" }, { status: 400 });
};
