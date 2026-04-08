import { mutation } from "./_generated/server";

export const seedAlreadyLoved = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db
      .query("brands")
      .withIndex("by_slug", (q) => q.eq("slug", "alreadyloved-kids"))
      .first();

    if (existing) {
      return { status: "already_seeded", brandId: existing._id };
    }

    const now = Date.now();

    const brandId = await ctx.db.insert("brands", {
      name: "AlreadyLoved Kids",
      slug: "alreadyloved-kids",
      description:
        "Faith-based parenting brand. Pastoral, grace-toned, maternal. Real, not religious. Helping parents raise children who know they are already loved.",
      voiceTraining: `# AlreadyLoved Kids Voice Guide

## Core Identity
AlreadyLoved Kids speaks with a pastoral, grace-toned, maternal voice. We are real, not religious. We meet parents where they are with warmth and without judgment.

## Tone
- Warm and inviting, like a trusted friend
- Grace-filled, never preachy or judgmental
- Real and honest about the struggles of parenting
- Encouraging without being dismissive of hardship
- Faith-informed but accessible to all

## Writing Style
- Use "we" and "you" to create intimacy
- Short paragraphs, conversational rhythm
- Lead with empathy, follow with encouragement
- Share vulnerability before offering wisdom
- End with affirmation or gentle call to action

## Content Themes
- Bedtime identity affirmations
- Parenting through grace
- Faith-based formation for children
- Everyday moments as sacred
- Self-care for parents as an act of love`,
      interests: [
        "bedtime affirmations",
        "parenting with grace",
        "faith-based formation",
        "childhood identity",
        "parent self-care",
      ],
      wordsToUse: [
        "grace",
        "beloved",
        "already",
        "enough",
        "identity",
        "affirm",
        "nurture",
        "sacred",
        "gentle",
        "flourish",
      ],
      wordsToAvoid: [
        "should",
        "must",
        "failure",
        "sin",
        "punishment",
        "hustle",
        "grind",
        "optimize",
      ],
      exampleContent: [],
      activeFormats: [
        "pin",
        "carousel",
        "caption_ig",
        "caption_tiktok",
        "blog",
        "newsletter",
        "short_video",
      ],
      repurposeMatrix: {
        blog: ["carousel", "pin", "caption_ig", "newsletter", "short_video"],
        short_video: ["caption_ig", "caption_tiktok"],
        carousel: ["pin", "caption_ig"],
      },
      goals:
        "Grow Pinterest and Instagram presence. Build email list through Kit newsletter. Create daily affirmation content that parents can use at bedtime.",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Seed Buffer integration for AlreadyLoved
    await ctx.db.insert("integrations", {
      brandId,
      provider: "buffer",
      type: "distribution",
      name: "Buffer - AlreadyLoved Channels",
      config: {
        channels: [
          { id: "699dc7dd4be271803d6286f7", platform: "instagram" },
          { id: "699de25e4be271803d631b80", platform: "pinterest" },
          { id: "699de0df4be271803d6315ca", platform: "tiktok" },
          { id: "69a599a13f3b94a1210a0c2a", platform: "facebook" },
          { id: "699de1be4be271803d631957", platform: "youtube" },
        ],
      },
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Seed general voice training module
    await ctx.db.insert("training", {
      brandId,
      layer: "voice_general",
      title: "AlreadyLoved Kids - General Voice",
      content: `You are writing content for AlreadyLoved Kids, a faith-based parenting brand.

Your voice is pastoral, warm, and grace-filled. You speak like a trusted friend who happens to have deep faith — never preachy, always real.

Key principles:
1. Lead with empathy — acknowledge the struggle before offering hope
2. Use "already" language — children are already loved, already enough, already chosen
3. Make the sacred accessible — find God in bedtime routines, school drop-offs, messy kitchens
4. Be vulnerable — share the imperfect moments alongside the beautiful ones
5. Affirm identity — every piece of content should leave the reader feeling seen and valued`,
      scope: undefined,
      version: 1,
      updatedAt: now,
    });

    return { status: "seeded", brandId };
  },
});
