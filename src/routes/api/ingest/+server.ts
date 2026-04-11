import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getConvexClient } from "$lib/server/convex";
import { api } from "../../../../convex/_generated/api";

// POST /api/ingest — one-shot: send content directly into knowledge base
// No inbox middleman. User-sent content is pre-approved.
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const client = getConvexClient();

  const {
    brandId,
    topicId,
    url,
    title,
    content,
    sourcePlatform,
    asSeed, // If true, also create a seed from this
  } = body;

  if (!brandId) return json({ error: "brandId required" }, { status: 400 });

  // If no topicId provided, find or create a default topic for this brand
  let resolvedTopicId = topicId;
  if (!resolvedTopicId) {
    const topics = await client.query(api.knowledge.listTopics, { brandId: brandId as any });
    if (topics.length > 0) {
      // Use the first topic as default
      resolvedTopicId = topics[0]._id;
    } else {
      // Create a "General" topic
      resolvedTopicId = await client.mutation(api.knowledge.createTopic, {
        brandId: brandId as any,
        name: "General",
        slug: "general",
        description: "Default knowledge topic",
        searchTerms: [],
      });
    }
  }

  // Create knowledge source directly
  const result = await client.mutation(api.knowledge.addSource, {
    topicId: resolvedTopicId as any,
    brandId: brandId as any,
    sourceType: url ? "article" : "note",
    title: title || url || "Untitled",
    url: url || undefined,
    transcript: content || undefined,
    abstract: content ? `${sourcePlatform || "web"}: ${title || ""}. ${content.slice(0, 200)}...` : undefined,
    resonanceScore: undefined,
  });

  // Optionally also create a seed
  let seedId;
  if (asSeed && content) {
    seedId = await client.mutation(api.seeds.create, {
      brandId: brandId as any,
      title: title || "Ingested content",
      description: content.slice(0, 2000),
      source: sourcePlatform === "twitter" ? "social" : "import",
      sourceRef: url || undefined,
      pitchedBy: "user",
    });
  }

  return json({
    sourceId: result.id || result,
    topicId: resolvedTopicId,
    seedId,
    duplicate: result.duplicate || false,
  }, { status: 201 });
};

// GET /api/ingest/topics?brandId=X — get topics for the brand (for the extension dropdown)
export const GET: RequestHandler = async ({ url }) => {
  const brandId = url.searchParams.get("brandId");
  if (!brandId) return json({ error: "brandId required" }, { status: 400 });

  const client = getConvexClient();
  const topics = await client.query(api.knowledge.listTopics, { brandId: brandId as any });
  return json(topics);
};
