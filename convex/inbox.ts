import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

export const list = query({
  args: { brandId: v.optional(v.id("brands")), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("inbox")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    if (args.brandId) {
      return await ctx.db
        .query("inbox")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("inbox").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("inbox") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Add a note (quick thought, observation)
export const addNote = mutation({
  args: {
    brandId: v.optional(v.id("brands")),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inbox", {
      ...args,
      type: "note",
      sourcePlatform: "manual",
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Add a URL (article, Reddit post, tweet, etc.)
export const addUrl = mutation({
  args: {
    brandId: v.optional(v.id("brands")),
    url: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    sourcePlatform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Detect platform from URL
    let platform = args.sourcePlatform;
    if (!platform) {
      const url = args.url.toLowerCase();
      if (url.includes("reddit.com")) platform = "reddit";
      else if (url.includes("twitter.com") || url.includes("x.com")) platform = "twitter";
      else if (url.includes("linkedin.com")) platform = "linkedin";
      else if (url.includes("perplexity.ai")) platform = "perplexity";
      else if (url.includes("news.google.com")) platform = "google_alert";
      else platform = "web";
    }

    return await ctx.db.insert("inbox", {
      brandId: args.brandId,
      type: "url",
      title: args.title ?? args.url,
      content: args.content ?? "",
      sourceUrl: args.url,
      sourcePlatform: platform,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Add from email (called by webhook)
export const addEmail = mutation({
  args: {
    brandId: v.optional(v.id("brands")),
    from: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    // Detect if it's a Google Alert, newsletter, etc.
    let platform = "email";
    const fromLower = args.from.toLowerCase();
    if (fromLower.includes("google.com") && args.subject.toLowerCase().includes("alert")) {
      platform = "google_alert";
    } else if (fromLower.includes("perplexity")) {
      platform = "perplexity";
    }

    return await ctx.db.insert("inbox", {
      brandId: args.brandId,
      type: "email",
      title: args.subject,
      content: args.body,
      sourceEmail: args.from,
      sourceSubject: args.subject,
      sourcePlatform: platform,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Fetch URL content (extract article text)
export const fetchUrl = action({
  args: { inboxId: v.id("inbox"), url: v.string() },
  handler: async (ctx, args) => {
    try {
      // Use a simple readability extraction
      const res = await fetch(args.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; SweetHeat/1.0)" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const html = await res.text();

      // Basic text extraction (strip HTML tags, get meaningful content)
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 50000); // Cap at 50k chars

      // Extract title from HTML
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch?.[1]?.trim() ?? args.url;

      await ctx.runMutation(api.inbox.updateContent, {
        id: args.inboxId,
        title,
        content: text,
      });

      return { success: true, title, contentLength: text.length };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
});

export const updateContent = mutation({
  args: { id: v.id("inbox"), title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.title, content: args.content });
  },
});

// Dismiss an inbox item
export const dismiss = mutation({
  args: { id: v.id("inbox") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "dismissed" });
  },
});

// Process: convert inbox item to a knowledge source
export const processToSource = mutation({
  args: {
    id: v.id("inbox"),
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"),
    content: v.optional(v.string()), // Allow passing content directly (from re-extraction)
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Inbox item not found");

    // Use provided content, item content, or mark as needing fetch
    const content = args.content || item.content || "";
    const hasContent = content.length > 50;

    // Create knowledge source
    const sourceId = await ctx.db.insert("knowledgeSources", {
      topicId: args.topicId,
      brandId: args.brandId,
      sourceType: item.type === "url" ? "article" : "note",
      title: item.title,
      url: item.sourceUrl,
      transcript: hasContent ? content : undefined,
      abstract: hasContent
        ? `${item.sourcePlatform ?? item.type}: ${item.title}. ${content.slice(0, 200)}...`
        : `${item.sourcePlatform ?? item.type}: ${item.title} (content pending extraction)`,
      status: hasContent ? "pending" : "pending",
      resonanceScore: item.relevanceScore,
      createdAt: Date.now(),
    });

    // Update topic source count
    const topic = await ctx.db.get(args.topicId);
    if (topic) {
      await ctx.db.patch(args.topicId, {
        sourceCount: (topic.sourceCount ?? 0) + 1,
        updatedAt: Date.now(),
      });
    }

    // Mark inbox item as processed
    await ctx.db.patch(args.id, {
      status: "processed",
      topicId: args.topicId,
      sourceId,
    });

    return sourceId;
  },
});

// Process: convert inbox item directly to a seed
export const processToSeed = mutation({
  args: {
    id: v.id("inbox"),
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Inbox item not found");

    const now = Date.now();
    const seedId = await ctx.db.insert("seeds", {
      brandId: args.brandId,
      title: item.title,
      description: item.content.slice(0, 2000),
      source: item.type === "email" ? "import" : item.type === "url" ? "industry_radar" : "manual",
      sourceRef: item.sourceUrl ?? item._id,
      pitchedBy: "user",
      status: "pitched",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.id, { status: "processed", seedId });

    return seedId;
  },
});

// Count pending items
export const pendingCount = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("inbox")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return items.length;
  },
});
