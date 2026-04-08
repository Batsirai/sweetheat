import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Search YouTube and return scored results
export const search = action({
  args: {
    query: v.string(),
    maxResults: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("YOUTUBE_API_KEY not set");

    const maxResults = args.maxResults ?? 20;

    // Step 1: Search
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&q=${encodeURIComponent(args.query)}&maxResults=${maxResults}&order=relevance&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      const err = await searchRes.text();
      throw new Error(`YouTube search failed: ${err}`);
    }
    const searchData = await searchRes.json();

    if (!searchData.items?.length) return [];

    // Step 2: Get video statistics for signal scoring
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
    const statsUrl = `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${apiKey}`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    // Step 3: Score and return
    const results = statsData.items?.map((video: any) => {
      const views = parseInt(video.statistics.viewCount || "0");
      const likes = parseInt(video.statistics.likeCount || "0");
      const comments = parseInt(video.statistics.commentCount || "0");

      // Signal scoring (simplified from PRD)
      const viewScore = Math.min(views / 100000, 40); // Up to 40 points for views
      const engagementScore = views > 0
        ? Math.min(((likes + comments) / views) * 500, 30) // Up to 30 points for engagement
        : 0;
      const recencyScore = getRecencyScore(video.snippet.publishedAt); // Up to 30 points

      const resonanceScore = Math.round(viewScore + engagementScore + recencyScore);

      return {
        videoId: video.id,
        title: video.snippet.title,
        channelId: video.snippet.channelId,
        channelName: video.snippet.channelTitle,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnailUrl: video.snippet.thumbnails?.medium?.url ?? video.snippet.thumbnails?.default?.url,
        viewCount: views,
        likeCount: likes,
        commentCount: comments,
        duration: parseDuration(video.contentDetails.duration),
        resonanceScore: Math.min(resonanceScore, 100),
      };
    }) ?? [];

    // Sort by resonance score
    results.sort((a: any, b: any) => b.resonanceScore - a.resonanceScore);

    return results;
  },
});

// Get transcript for a YouTube video
export const getTranscript = action({
  args: { videoId: v.string() },
  handler: async (ctx, args) => {
    // Use a public transcript API (no API key needed)
    // Try multiple approaches
    const urls = [
      `https://yt.lemnoslife.com/noKey/captions?part=snippet&videoId=${args.videoId}`,
    ];

    // Approach: fetch the video page and extract captions
    // For now, use a lightweight transcript service
    try {
      // Try the invidious API for transcripts
      const res = await fetch(
        `https://vid.puffyan.us/api/v1/captions/${args.videoId}?label=English`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.captions?.length) {
          // Get the first English caption track
          const captionTrack = data.captions.find(
            (c: any) => c.language_code === "en" || c.label?.includes("English")
          );
          if (captionTrack?.url) {
            const captionRes = await fetch(captionTrack.url);
            if (captionRes.ok) {
              const text = await captionRes.text();
              // Parse XML captions to plain text
              return { transcript: stripXmlTags(text), source: "invidious" };
            }
          }
        }
      }
    } catch {
      // Fall through to next approach
    }

    // Fallback: try another transcript service
    try {
      const res = await fetch(
        `https://api.kome.ai/api/tools/youtube-transcripts?video_id=${args.videoId}&format=text`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.transcript) {
          return { transcript: data.transcript, source: "kome" };
        }
      }
    } catch {
      // Fall through
    }

    return { transcript: null, source: "none", error: "Could not retrieve transcript. You can paste it manually." };
  },
});

// Ingest: search + add to a topic
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
    // Try to get transcript
    const transcriptResult = await ctx.runAction(api.youtube.getTranscript, {
      videoId: args.videoId,
    });

    const result = await ctx.runMutation(api.knowledge.addSource, {
      topicId: args.topicId,
      brandId: args.brandId,
      sourceType: "youtube_transcript",
      title: args.title,
      url: `https://youtube.com/watch?v=${args.videoId}`,
      youtubeVideoId: args.videoId,
      youtubeChannelId: args.channelId,
      youtubeChannelName: args.channelName,
      viewCount: args.viewCount,
      likeCount: args.likeCount,
      commentCount: args.commentCount,
      durationSeconds: args.durationSeconds,
      publishedAt: args.publishedAt ? new Date(args.publishedAt).getTime() : undefined,
      thumbnailUrl: args.thumbnailUrl,
      transcript: transcriptResult.transcript ?? undefined,
      resonanceScore: args.resonanceScore,
    });

    return {
      ...result,
      hasTranscript: !!transcriptResult.transcript,
      transcriptSource: transcriptResult.source,
    };
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────

function getRecencyScore(publishedAt: string): number {
  const daysAgo = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo < 7) return 30;
  if (daysAgo < 30) return 25;
  if (daysAgo < 90) return 20;
  if (daysAgo < 365) return 10;
  return 5; // Evergreen still gets some score
}

function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

function stripXmlTags(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
