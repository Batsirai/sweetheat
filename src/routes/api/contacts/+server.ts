import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const brandId = url.searchParams.get("brandId");
  const contactType = url.searchParams.get("contactType");
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("query");

  if (q) {
    const result = await client.query(api.contacts.search, {
      brandId: brandId as any,
      query: q,
    });
    return json(result);
  }

  const result = await client.query(api.contacts.list, {
    brandId: brandId as any,
    contactType: contactType ?? undefined,
    status: status ?? undefined,
  });
  return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const id = await client.mutation(api.contacts.create, {
    brandId: body.brandId,
    name: body.name,
    email: body.email,
    contactType: body.contactType,
    organization: body.organization,
    location: body.location,
    socialUrls: body.socialUrls,
    tags: body.tags,
    dream100Id: body.dream100Id,
    notes: body.notes,
  });

  return json({ id }, { status: 201 });
};
