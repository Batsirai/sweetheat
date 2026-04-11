import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

// GET /api/inbox — list pending items
export const GET: RequestHandler = async ({ url }) => {
  const client = getConvexClient();
  const status = url.searchParams.get("status") ?? "pending";
  const items = await client.query(api.inbox.list, { status });
  return json(items);
};

// POST /api/inbox — add item (URL, note, or email webhook)
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  // Email webhook (from AgentMail or other email forwarding service)
  if (body.type === "email" || body.from) {
    const id = await client.mutation(api.inbox.addEmail, {
      brandId: body.brandId,
      from: body.from ?? body.sender ?? "unknown",
      subject: body.subject ?? "Forwarded email",
      body: body.body ?? body.text ?? body.html ?? "",
    });
    return json({ id }, { status: 201 });
  }

  // URL
  if (body.type === "url" || body.url) {
    const id = await client.mutation(api.inbox.addUrl, {
      brandId: body.brandId,
      url: body.url,
      title: body.title,
      sourcePlatform: body.sourcePlatform,
    });
    return json({ id }, { status: 201 });
  }

  // Note
  if (body.type === "note") {
    const id = await client.mutation(api.inbox.addNote, {
      brandId: body.brandId,
      title: body.title ?? "Note",
      content: body.content,
    });
    return json({ id }, { status: 201 });
  }

  return json({ error: "Unknown type" }, { status: 400 });
};
