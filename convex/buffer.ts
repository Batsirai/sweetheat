import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

const BUFFER_API = "https://api.bufferapp.com/1";

// Map content format to Buffer platform name
const FORMAT_TO_PLATFORM: Record<string, string> = {
  pin: "pinterest",
  caption_ig: "instagram",
  carousel: "instagram",
  caption_tiktok: "tiktok",
  short_video: "youtube",
  tweet: "twitter",
  linkedin: "linkedin",
};

export const publishBranch = internalAction({
  args: {
    branchId: v.id("branches"),
    draftBody: v.string(),
    format: v.string(),
    brandId: v.id("brands"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.BUFFER_API_KEY;
    if (!apiKey) throw new Error("BUFFER_API_KEY not set");

    const platform = FORMAT_TO_PLATFORM[args.format];
    if (!platform) {
      // This format doesn't publish to Buffer (blog, newsletter, etc.)
      return { published: false, reason: "no_buffer_channel" };
    }

    // Find the Buffer channel for this platform from integrations
    const integrations = await ctx.runQuery(api.integrations.list, { brandId: args.brandId });
    const bufferIntegration = integrations.find(
      (i: any) => i.provider === "buffer" && i.type === "distribution" && i.isActive
    );

    if (!bufferIntegration?.config?.channels) {
      return { published: false, reason: "no_buffer_integration" };
    }

    const channel = bufferIntegration.config.channels.find(
      (c: any) => c.platform === platform
    );

    if (!channel) {
      return { published: false, reason: `no_channel_for_${platform}` };
    }

    // Look up the UTM URL from the branch (set by Content ID generation)
    const branch = await ctx.runQuery(api.branches.get, { id: args.branchId });
    const postText = branch?.utmUrl
      ? `${args.draftBody}\n\n${branch.utmUrl}`
      : args.draftBody;

    // Post to Buffer
    const formData = new URLSearchParams();
    formData.append("profile_ids[]", channel.id);
    formData.append("text", postText);
    formData.append("access_token", apiKey);

    const res = await fetch(`${BUFFER_API}/updates/create.json`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Buffer API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const updateId = data.updates?.[0]?.id ?? data.update?.id;

    // Update branch with Buffer post ID and status
    await ctx.runMutation(internal.buffer.markScheduled, {
      branchId: args.branchId,
      externalPostId: updateId ?? "unknown",
    });

    return { published: true, bufferId: updateId };
  },
});

export const markScheduled = internalMutation({
  args: {
    branchId: v.id("branches"),
    externalPostId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.branchId, {
      status: "scheduled",
      externalPostId: args.externalPostId,
      updatedAt: Date.now(),
    });
  },
});
