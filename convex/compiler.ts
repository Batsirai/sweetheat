import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096
): Promise<string> {
  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

// ── STEP 1: Summarize unsummarized sources (batch of up to 5) ─────────────
// Call this repeatedly until all sources are summarized.
export const summarizeSources = action({
  args: { topicId: v.id("knowledgeTopics"), batchSize: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const sources = await ctx.runQuery(api.knowledge.listSources, { topicId: args.topicId });
    const unsummarized = sources.filter((s: any) => s.transcript && !s.summary);

    if (unsummarized.length === 0) {
      return { summarized: 0, remaining: 0, done: true };
    }

    const batch = unsummarized.slice(0, args.batchSize ?? 5);
    let count = 0;

    for (const source of batch) {
      const words = source.transcript!.split(/\s+/);
      const truncated = words.slice(0, 8000).join(" ");

      const summary = await callClaude(
        apiKey,
        `You are a knowledge extraction specialist. Extract structured insights from video transcripts.`,
        `Summarize this YouTube transcript. Extract:
1. **Key Insights** (5-10 bullet points of the most valuable, specific, actionable insights)
2. **Expert Claims** (specific claims or positions stated, with who said them if identifiable)
3. **Practical Advice** (actionable takeaways someone could apply)
4. **Notable Quotes** (2-3 direct quotes worth preserving)
5. **Concepts & Entities** (key terms, people, frameworks, methods mentioned)

Source: "${source.title}" by ${source.youtubeChannelName ?? "Unknown"}
Views: ${source.viewCount ?? "unknown"} | Published: ${source.publishedAt ? new Date(source.publishedAt).toLocaleDateString() : "unknown"}

TRANSCRIPT:
${truncated}${words.length > 8000 ? "\n\n[Transcript truncated]" : ""}`,
        3000
      );

      await ctx.runMutation(internal.compiler.updateSourceSummary, {
        sourceId: source._id,
        summary,
      });
      count++;
    }

    return {
      summarized: count,
      remaining: unsummarized.length - count,
      done: unsummarized.length - count === 0,
    };
  },
});

// ── STEP 2: Compile wiki articles + catalysts + idea briefs ───────────────
// Only call this after all sources are summarized.
export const compileTopic = action({
  args: { topicId: v.id("knowledgeTopics") },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const topic = await ctx.runQuery(api.knowledge.getTopic, { id: args.topicId });
    if (!topic) throw new Error("Topic not found");

    const brand = await ctx.runQuery(api.brands.get, { id: topic.brandId });
    if (!brand) throw new Error("Brand not found");

    const sources = await ctx.runQuery(api.knowledge.listSources, { topicId: args.topicId });

    // Check if all sources with transcripts are summarized
    const withTranscripts = sources.filter((s: any) => s.transcript);
    const unsummarized = withTranscripts.filter((s: any) => !s.summary);

    if (unsummarized.length > 0) {
      // Auto-summarize first (up to 5 at a time)
      const sumResult = await ctx.runAction(api.compiler.summarizeSources, {
        topicId: args.topicId,
        batchSize: 5,
      });

      if (!sumResult.done) {
        return {
          status: "summarizing",
          message: `Summarized ${sumResult.summarized} sources. ${sumResult.remaining} remaining. Click Compile again to continue.`,
          sourcesSummarized: sumResult.summarized,
          remaining: sumResult.remaining,
          articlesCompiled: 0,
          catalystsGenerated: 0,
          ideasGenerated: 0,
        };
      }
    }

    // Re-fetch to get updated summaries
    const updatedSources = await ctx.runQuery(api.knowledge.listSources, { topicId: args.topicId });
    const summaries = updatedSources
      .filter((s: any) => s.summary)
      .map((s: any) => ({
        sourceId: s._id,
        title: s.title,
        channel: s.youtubeChannelName ?? "Unknown",
        summary: s.summary,
      }));

    if (summaries.length === 0) {
      throw new Error("No summarized sources to compile from");
    }

    // ── Compile wiki articles ────────────────────────────────────────────
    const sourceBlock = summaries
      .map((s: any, i: number) => `### Source ${i + 1}: "${s.title}" (${s.channel})\n${s.summary}`)
      .join("\n\n---\n\n");

    const wikiContent = await callClaude(
      apiKey,
      `You are a knowledge wiki compiler for the brand "${brand.name}".
${brand.voiceTraining ? `Brand voice: ${brand.voiceTraining.slice(0, 500)}` : ""}

Synthesize multiple source summaries into interconnected wiki articles. Each article should:
- Synthesize insights across sources (not just repeat one source)
- Cite sources by name: "According to [Source Title]..."
- Flag contradictions between sources
- Cross-reference related concepts
- Be written in clear, informative prose`,
      `Compile wiki articles for the topic "${topic.name}" from these ${summaries.length} sources.

${sourceBlock}

Generate 2-5 wiki articles as markdown. For each article:
1. Give it a clear title (## heading)
2. Write 200-500 words synthesizing insights across sources
3. Cite sources by name when making claims
4. Note any contradictions between sources
5. End with "Related concepts:" listing connected topics

Separate each article with "---ARTICLE_BREAK---"

Also at the very end, after all articles, add:
---ENTITIES---
List key entities (people, concepts, methods, frameworks) found across all sources, one per line.`,
      6000
    );

    // Parse articles
    const entitySplit = wikiContent.split("---ENTITIES---");
    const articlesRaw = entitySplit[0];
    const entitiesRaw = entitySplit[1] ?? "";

    const entities = entitiesRaw
      .split("\n")
      .map((e: string) => e.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean);

    const articleBlocks = articlesRaw
      .split("---ARTICLE_BREAK---")
      .map((block: string) => block.trim())
      .filter(Boolean);

    const pageIds: string[] = [];
    for (const block of articleBlocks) {
      const titleMatch = block.match(/^##\s*(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : `${topic.name} - Compiled`;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const pageId = await ctx.runMutation(internal.compiler.upsertWikiPage, {
        topicId: args.topicId,
        brandId: topic.brandId,
        title,
        slug,
        content: block,
        sourceIds: summaries.map((s: any) => s.sourceId),
        entityTags: entities.slice(0, 20),
      });
      pageIds.push(pageId);
    }

    // ── Generate catalysts + idea briefs ──────────────────────────────────
    const catalystAndIdeas = await callClaude(
      apiKey,
      `You are a content strategist for "${brand.name}". Generate content ideas from compiled knowledge.`,
      `Based on these wiki articles about "${topic.name}":

${articleBlocks.slice(0, 3).join("\n\n")}

Generate:

CATALYSTS (5 thematic questions that could inspire content):
Format each as a single compelling question on its own line, prefixed with "Q: "

---CATALYSTS_END---

IDEA_BRIEFS (3 fully-formed content ideas):
For each idea, use this format:
TITLE: [compelling title]
ANGLE: [the specific angle or take]
HOOK: [opening line that grabs attention]
THESIS: [one-sentence thesis]
FORMATS: [comma-separated suggested formats: blog, tweet, carousel, short_video, linkedin, newsletter]
SCORE: [1-100 composite quality score]
---IDEA_END---`,
      3000
    );

    // Parse catalysts
    const catalystSection = catalystAndIdeas.split("---CATALYSTS_END---")[0];
    const catalystQuestions = catalystSection
      .split("\n")
      .filter((line: string) => line.startsWith("Q: "))
      .map((line: string) => line.replace("Q: ", "").trim());

    for (const question of catalystQuestions) {
      await ctx.runMutation(internal.compiler.addCatalyst, {
        topicId: args.topicId,
        brandId: topic.brandId,
        question,
        sourcePageIds: pageIds,
      });
    }

    // Parse idea briefs
    const ideaSection = catalystAndIdeas.split("---CATALYSTS_END---")[1] ?? "";
    const ideaBlocks = ideaSection.split("---IDEA_END---").filter((b: string) => b.includes("TITLE:"));
    let ideasCreated = 0;

    for (const ideaBlock of ideaBlocks) {
      const get = (key: string) => {
        const match = ideaBlock.match(new RegExp(`${key}:\\s*(.+)`, "i"));
        return match ? match[1].trim() : "";
      };

      const formats = get("FORMATS").split(",").map((f: string) => f.trim()).filter(Boolean);
      const score = parseInt(get("SCORE")) || 70;

      if (get("TITLE")) {
        await ctx.runMutation(internal.compiler.addIdeaBrief, {
          topicId: args.topicId,
          brandId: topic.brandId,
          title: get("TITLE"),
          angle: get("ANGLE"),
          hook: get("HOOK"),
          thesis: get("THESIS"),
          suggestedFormats: formats,
          compositeScore: score,
        });
        ideasCreated++;
      }
    }

    // Update topic stats
    await ctx.runMutation(internal.compiler.updateTopicStats, {
      topicId: args.topicId,
      pageCount: pageIds.length,
      ideaCount: ideasCreated,
    });

    return {
      status: "compiled",
      sourcesSummarized: summaries.length,
      articlesCompiled: pageIds.length,
      catalystsGenerated: catalystQuestions.length,
      ideasGenerated: ideasCreated,
      remaining: 0,
    };
  },
});

// ── Internal mutations ────────────────────────────────────────────────────

export const updateSourceSummary = internalMutation({
  args: { sourceId: v.id("knowledgeSources"), summary: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, { summary: args.summary, status: "summarized" });
  },
});

export const upsertWikiPage = internalMutation({
  args: {
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    sourceIds: v.array(v.string()),
    entityTags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("knowledgePages")
      .withIndex("by_topic_slug", (q) => q.eq("topicId", args.topicId).eq("slug", args.slug))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        sourceIds: args.sourceIds,
        entityTags: args.entityTags,
        version: existing.version + 1,
        compiledAt: now,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("knowledgePages", {
      topicId: args.topicId,
      brandId: args.brandId,
      title: args.title,
      slug: args.slug,
      content: args.content,
      sourceIds: args.sourceIds,
      entityTags: args.entityTags,
      version: 1,
      compiledAt: now,
      updatedAt: now,
    });
  },
});

export const addCatalyst = internalMutation({
  args: {
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"),
    question: v.string(),
    sourcePageIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("knowledgeCatalysts", {
      topicId: args.topicId,
      brandId: args.brandId,
      question: args.question,
      sourcePageIds: args.sourcePageIds,
      createdAt: Date.now(),
    });
  },
});

export const addIdeaBrief = internalMutation({
  args: {
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"),
    title: v.string(),
    angle: v.string(),
    hook: v.string(),
    thesis: v.string(),
    suggestedFormats: v.array(v.string()),
    compositeScore: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("ideaBriefs", {
      topicId: args.topicId,
      brandId: args.brandId,
      status: "ready",
      title: args.title,
      angle: args.angle,
      hook: args.hook || undefined,
      thesis: args.thesis || undefined,
      suggestedFormats: args.suggestedFormats,
      compositeScore: args.compositeScore,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTopicStats = internalMutation({
  args: { topicId: v.id("knowledgeTopics"), pageCount: v.number(), ideaCount: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.topicId, {
      pageCount: args.pageCount,
      ideaCount: args.ideaCount,
      lastCompiledAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
