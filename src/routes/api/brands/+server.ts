import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async () => {
  const client = getConvexClient();
  const brands = await client.query(api.brands.listActive, {});
  return json(brands);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const brandId = await client.mutation(api.brands.create, {
    name: body.name,
    slug: body.slug,
    description: body.description,
    voiceTraining: body.voiceTraining,
    interests: body.interests,
    wordsToUse: body.wordsToUse,
    wordsToAvoid: body.wordsToAvoid,
    activeFormats: body.activeFormats,
    goals: body.goals,
  });

  return json({ brandId }, { status: 201 });
};
