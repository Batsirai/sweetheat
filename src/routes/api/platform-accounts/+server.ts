import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const platform = url.searchParams.get("platform");

  const result = await client.query(api.platformAccounts.list, {
    brandId: brandId as any,
    platform: platform ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.platformAccounts.create, {
    brandId: body.brandId,
    platform: body.platform,
    accountName: body.accountName,
    accountId: body.accountId,
    niche: body.niche,
    voiceNotes: body.voiceNotes,
    bufferChannelId: body.bufferChannelId,
    directApiCredentials: body.directApiCredentials,
    postsPerDay: body.postsPerDay,
  });

  return json({ id }, { status: 201 });
};
