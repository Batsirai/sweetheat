import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const API_BASE = "https://transcriptapi.com/api/v2/youtube";

function getApiKey(): string {
  const key = process.env.TRANSCRIPT_API_KEY;
  if (!key) throw new Error("TRANSCRIPT_API_KEY not set");
  return key;
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getApiKey()}` };
}

// ── Search YouTube ────────────────────────────────────────────────────────
export const search = action({
  args: {
    query: v.string(),
    maxResults: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const limit = args.maxResults ?? 20;
    const res = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(args.query)}&type=video&limit=${limit}`,
      { headers: authHeaders() }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouTube search failed (${res.status}): ${err}`);
    }
    const data = await res.json();

    return (data.results ?? []).map((video: any) => {
      const videoId = video.videoId ?? video.video_id ?? "";
      const thumbnailUrl =
        video.thumbnail ??
        video.thumbnailUrl ??
        video.thumbnail_url ??
        (video.thumbnails?.[0]?.url) ??
        (videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : "");

      return {
        videoId,
        title: video.title ?? "",
        channelId: video.channelId ?? video.channel_id ?? "",
        channelName: video.channelTitle ?? video.channel_title ?? video.author ?? "",
        description: video.description ?? video.descriptionSnippet ?? "",
        publishedAt: video.publishedAt ?? video.published ?? video.publishedTime ?? "",
        thumbnailUrl,
        viewCount: parseCount(video.viewCount ?? video.views ?? video.viewCountText),
        likeCount: 0,
        commentCount: 0,
        duration: parseDurationText(video.duration ?? video.lengthText ?? video.length ?? "0"),
        resonanceScore: computeResonance(
          parseCount(video.viewCount ?? video.views ?? video.viewCountText),
          video.publishedAt ?? video.published ?? ""
        ),
      };
    });
  },
});

// ── Get transcript for a video ────────────────────────────────────────────
export const getTranscript = action({
  args: { videoId: v.string() },
  handler: async (_ctx, args) => {
    const res = await fetch(
      `${API_BASE}/transcript?video_url=${args.videoId}&format=json&include_timestamp=false&send_metadata=true`,
      { headers: authHeaders() }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return { transcript: null, metadata: null, source: "none", error: "No transcript available for this video." };
      }
      const err = await res.text();
      return { transcript: null, metadata: null, source: "none", error: `Transcript API error (${res.status}): ${err}` };
    }

    const data = await res.json();
    let transcript: string;
    if (Array.isArray(data.transcript)) {
      transcript = data.transcript.map((s: any) => s.text ?? s).join(" ");
    } else {
      transcript = data.transcript ?? "";
    }

    return {
      transcript: transcript || null,
      metadata: data.metadata ?? null,
      source: "transcriptapi",
    };
  },
});

// ── Search within a specific channel ──────────────────────────────────────
export const channelSearch = action({
  args: {
    channel: v.string(), // @handle, URL, or UC... ID
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const res = await fetch(
      `${API_BASE}/channel/search?channel=${encodeURIComponent(args.channel)}&q=${encodeURIComponent(args.query)}&limit=${args.limit ?? 30}`,
      { headers: authHeaders() }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Channel search failed (${res.status}): ${err}`);
    }
    const data = await res.json();
    return data.results ?? [];
  },
});

// ── Get latest videos from a channel (FREE - no credit cost) ──────────────
export const channelLatest = action({
  args: { channel: v.string() },
  handler: async (_ctx, args) => {
    const res = await fetch(
      `${API_BASE}/channel/latest?channel=${encodeURIComponent(args.channel)}`,
      { headers: authHeaders() }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Channel latest failed (${res.status}): ${err}`);
    }
    const data = await res.json();
    return {
      channel: data.channel ?? null,
      videos: data.results ?? [],
    };
  },
});

// ── Resolve channel handle/URL to ID (FREE) ───────────────────────────────
export const resolveChannel = action({
  args: { input: v.string() },
  handler: async (_ctx, args) => {
    const res = await fetch(
      `${API_BASE}/channel/resolve?input=${encodeURIComponent(args.input)}`,
      { headers: authHeaders() }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Channel resolve failed (${res.status}): ${err}`);
    }
    return await res.json();
  },
});

// ── Ingest: fetch metadata + transcript, save to knowledge source ─────────
export const ingestVideo = action({
  args: {
    topicId: v.id("knowledgeTopics"),
    brandId: v.id("brands"),
    videoId: v.string(),
    title: v.string(),
    channelId: v.optional(v.string()),
    channelName: v.optional(v.string()),
    viewCount: v.optional(v.number()),
    likeCount: v.optional(v.number()),
    commentCount: v.optional(v.number()),
    durationSeconds: v.optional(v.number()),
    publishedAt: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    resonanceScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Fetch transcript + metadata in one call
    const transcriptResult = await ctx.runAction(api.youtube.getTranscript, {
      videoId: args.videoId,
    });

    // Use metadata from transcript API if available
    const meta = transcriptResult.metadata;

    const result = await ctx.runMutation(api.knowledge.addSource, {
      topicId: args.topicId,
      brandId: args.brandId,
      sourceType: "youtube_transcript",
      title: meta?.title ?? args.title,
      url: `https://youtube.com/watch?v=${args.videoId}`,
      youtubeVideoId: args.videoId,
      youtubeChannelId: args.channelId,
      youtubeChannelName: meta?.author_name ?? args.channelName,
      viewCount: args.viewCount,
      likeCount: args.likeCount,
      commentCount: args.commentCount,
      durationSeconds: args.durationSeconds,
      publishedAt: args.publishedAt ? new Date(args.publishedAt).getTime() : undefined,
      thumbnailUrl: meta?.thumbnail_url ?? args.thumbnailUrl ?? `https://i.ytimg.com/vi/${args.videoId}/mqdefault.jpg`,
      transcript: transcriptResult.transcript ?? undefined,
      resonanceScore: args.resonanceScore,
    });

    return {
      ...result,
      hasTranscript: !!transcriptResult.transcript,
      transcriptSource: transcriptResult.source,
      transcriptError: transcriptResult.error,
    };
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────

function parseCount(val: any): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/,/g, "").replace(/\s+views?/i, "");
    const num = parseInt(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function computeResonance(views: number, publishedAt: string): number {
  const viewScore = Math.min(views / 100000, 40);
  const recencyScore = publishedAt ? getRecencyScore(publishedAt) : 10;
  return Math.round(Math.min(viewScore + recencyScore + 20, 100)); // +20 baseline
}

function getRecencyScore(publishedAt: string): number {
  const daysAgo = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (isNaN(daysAgo) || daysAgo < 0) return 10;
  if (daysAgo < 7) return 30;
  if (daysAgo < 30) return 25;
  if (daysAgo < 90) return 20;
  if (daysAgo < 365) return 10;
  return 5;
}

function parseDurationText(text: string): number {
  // Handle "12:34" or "1:23:45" format
  const parts = text.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  // Handle ISO duration PT1H2M3S
  const match = text.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (match) return (parseInt(match[1]||"0"))*3600 + (parseInt(match[2]||"0"))*60 + parseInt(match[3]||"0");
  return parseInt(text) || 0;
}
