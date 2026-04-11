#!/usr/bin/env node
/**
 * Sweet Heat Strategist — 2026-04-11 seed batch
 *
 * Run from project root where .env.local has CONVEX_DEPLOYMENT set:
 *   node scripts/strategist-run-2026-04-11.mjs
 *
 * Or run individual seeds via convex CLI:
 *   npx convex run brands:getBySlug '{"slug":"alreadyloved-kids"}'
 *   # then use the _id as brandId in the seeds:create calls below
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.PUBLIC_CONVEX_URL || "https://loyal-hamster-102.convex.cloud";
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || "";

const client = new ConvexHttpClient(CONVEX_URL);

// ── Seeds to pitch ─────────────────────────────────────────────────────────

const SEEDS = [
  // ── SEO #1 ────────────────────────────────────────────────────────────
  {
    title: "Bedtime Prayers for Toddlers That Speak Identity, Not Just Safety",
    description: `Angle: Most "bedtime prayers for toddlers" content teaches kids to ask God for protection and blessings. AlreadyLoved reframes this — bedtime prayer is the moment a parent speaks identity into their child. "You are loved. You are seen. You are enough."

Hook: What if bedtime prayer wasn't about asking — but about remembering who you already are?

Thesis: A round-up of 10+ identity-rooted bedtime prayers for toddlers, each paired with a one-line reflection for the parent. Structured for featured snippet capture. Every prayer starts with "You are..." not "Please God..."

Target keywords: bedtime prayers for toddlers, toddler prayers before bed, short prayers for kids at night`,
    source: "agent_research",
    purpose: "seo",
    contentPillar: "bedtime affirmations",
    targetKeywords: ["bedtime prayers for toddlers", "toddler prayers before bed", "short prayers for kids at night"],
    reasoning: "High-volume parenting keyword cluster (~8K+ monthly searches combined). No existing seed covers this angle. The identity-prayer reframe is uniquely AlreadyLoved — competitors serve generic religious content. This is table stakes for the bedtime identity pillar.",
    targetFormats: ["blog", "pin", "carousel", "caption_ig"],
  },

  // ── SEO #2 ────────────────────────────────────────────────────────────
  {
    title: "How to Respond When Your Toddler Says 'I Can't Do It'",
    description: `Angle: When a toddler says "I can't do it," most parenting content teaches redirect scripts. AlreadyLoved sees this differently — it's the first identity moment. What a parent says next shapes whether the child believes they are capable and loved even when they struggle.

Hook: The most important parenting moment isn't the milestone — it's what you say when they can't reach it.

Thesis: 7 grace-filled responses to "I can't do it" that affirm identity over achievement. Each response paired with the developmental reason it works AND the identity truth it plants. Includes a printable fridge card.

Target keywords: toddler says I can't do it, how to encourage a toddler who gives up, building toddler confidence`,
    source: "agent_research",
    purpose: "seo",
    contentPillar: "childhood identity",
    targetKeywords: ["toddler says I can't do it", "how to encourage a toddler who gives up", "building toddler confidence"],
    reasoning: "Coverage gap in the childhood identity pillar — no seeds address the 'struggle moment' which is where identity formation actually happens. High search intent keyword ('toddler says I can't do it' is a real-time frustration query). The printable fridge card creates email opt-in opportunity.",
    targetFormats: ["blog", "pin", "carousel", "caption_ig", "newsletter"],
  },

  // ── AEO ───────────────────────────────────────────────────────────────
  {
    title: "What Do I Say to My Child When They Feel Like They're Not Enough?",
    description: `Angle: Structured as a direct answer to the question parents are asking AI assistants and search engines. This is the core AlreadyLoved question — the one the entire brand exists to answer.

Hook: Your child doesn't need more praise. They need you to name what's already true about them.

Thesis: A structured guide answering the question with (1) what NOT to say (toxic positivity, dismissal), (2) what TO say (identity affirmations rooted in being, not doing), (3) age-appropriate scripts from toddler through pre-teen, (4) the difference between encouragement and identity-speaking. Formatted for AI citation with clear headers, numbered lists, and direct answers.

Target keywords: what to say when child feels not enough, how to help child with low self-esteem, affirming words for children`,
    source: "agent_research",
    purpose: "aeo",
    contentPillar: "childhood identity",
    targetKeywords: ["what to say when child feels not enough", "how to help child with low self-esteem", "affirming words for children"],
    reasoning: "This is the #1 question AlreadyLoved exists to answer. Structured for AI citation (direct answer format, numbered scripts, age-bracketed advice). No existing seed addresses the AEO format for this core question. Parents are asking AI assistants this exact question in crisis moments.",
    targetFormats: ["blog", "pin", "carousel", "short_video"],
  },

  // ── Brand Building ────────────────────────────────────────────────────
  {
    title: "The Myth of the Put-Together Christian Parent",
    description: `Angle: A thought leadership piece that challenges the performance culture in faith-based parenting communities. The pressure to appear grateful, joyful, and "blessed" while quietly drowning. AlreadyLoved's unique take: the gospel of grace applies to parents too — you are already enough as a parent, not just your children.

Hook: What if the most radical act of faith-based parenting is admitting you have no idea what you're doing?

Thesis: Grace isn't just for children — it's for the parent who yelled at dinner, who scrolled instead of playing, who cried in the bathroom. This piece names the gap between the Christian parenting Instagram feed and the real kitchen floor. It positions AlreadyLoved as the antidote to performance parenting. Ends with an invitation: "You don't have to earn your place at this table either."`,
    source: "agent_research",
    purpose: "brand_building",
    contentPillar: "parenting with grace",
    targetKeywords: ["christian parenting pressure", "grace-based parenting", "imperfect parenting faith"],
    reasoning: "No brand-building seed currently addresses the parent's own identity crisis. All existing content focuses on what to say to children — this flips the lens to the parent. Positions AlreadyLoved as distinct from performative faith-based parenting brands. High shareability in faith-based mom communities.",
    targetFormats: ["blog", "caption_ig", "caption_tiktok", "newsletter", "short_video"],
  },

  // ── Engagement ────────────────────────────────────────────────────────
  {
    title: "The Three Words I Whisper Every Night That Changed Everything",
    description: `Angle: A personal, emotional narrative about the power of nightly identity affirmations. Not a how-to — a story. The three words: "You are loved." Simple. But what happens when you say them 365 nights in a row to a child who's learning who they are?

Hook: I didn't expect three words to change my parenting. But they changed my child first.

Thesis: Short-form emotional storytelling. How a nightly ritual of three whispered words became the anchor of a family. The moment the child started saying it back. The night the parent realized the words were for them too. Designed for maximum shareability — the kind of content people screenshot and send to their mom friends.`,
    source: "agent_research",
    purpose: "engagement",
    contentPillar: "bedtime affirmations",
    targetKeywords: ["bedtime affirmations for kids", "nightly parenting ritual", "words of affirmation children"],
    reasoning: "Engagement seeds need emotional hooks that drive shares and saves. This is a 'screenshot and send' piece. Directly demonstrates the AlreadyLoved product (bedtime affirmations) through story, not instruction. Strong Pinterest/IG save potential. Feeds the email list with a CTA to get the full affirmation card set.",
    targetFormats: ["blog", "caption_ig", "caption_tiktok", "pin", "short_video", "newsletter"],
  },

  // ── SEO #3 (bonus) ────────────────────────────────────────────────────
  {
    title: "15 Scripture-Based Affirmations for Kids (With Printable Cards)",
    description: `Angle: A resource-heavy SEO piece combining two high-intent searches: parents looking for scripture for kids AND parents looking for affirmation cards. AlreadyLoved's filter: each affirmation is translated from "Bible verse" into "identity truth a child can understand."

Hook: What if your child could carry a piece of their identity in their backpack every morning?

Thesis: 15 affirmations, each with: (1) the scripture source, (2) the child-friendly identity translation, (3) when to use it (first day of school, after a bad dream, before a test). Includes a free printable card set (email gate for list building). Designed for Pinterest SEO with individual pin graphics per affirmation.

Target keywords: scripture affirmations for kids, bible verse affirmation cards, christian affirmations for children printable`,
    source: "agent_research",
    purpose: "seo",
    contentPillar: "faith-based formation",
    targetKeywords: ["scripture affirmations for kids", "bible verse affirmation cards", "christian affirmations for children printable"],
    reasoning: "Combines two underserved keyword clusters. The printable card set is the #1 email list growth mechanism for faith-based parenting brands on Pinterest. No existing seed covers this — it's a gap in the faith-based formation pillar. Each card becomes its own pin (15 pins from one blog post = compounding Pinterest traffic).",
    targetFormats: ["blog", "pin", "carousel", "newsletter"],
  },

  // ── Audience Growth (bonus) ───────────────────────────────────────────
  {
    title: "A Letter to the Mom Who Cried in the Car After Drop-Off",
    description: `Angle: An open letter format — raw, tender, and deeply seen. Written to the specific mom who held it together in front of the school but fell apart in the parking lot. This is parent identity content: you are not failing, you are feeling, and that is sacred.

Hook: You held it together until the car door closed. And then you didn't have to anymore.

Thesis: Short, emotional, prose-poem style. Not advice. Not tips. Just: I see you. You are not too much. Your tears are not weakness — they are proof of how deeply you love. Ends with the AlreadyLoved anchor: "You are already a good mom. You were before this morning, and you are after it." Designed for Instagram saves and shares, Pinterest emotional pins, TikTok voiceover.`,
    source: "agent_research",
    purpose: "audience_growth",
    contentPillar: "parent self-care",
    targetKeywords: ["mom encouragement", "parenting is hard", "letter to struggling mom"],
    reasoning: "The parent self-care pillar has the least content but the highest engagement potential. This format (open letter) consistently outperforms how-to content for saves and shares on Instagram. It brings new audience who find AlreadyLoved through the parent's pain, not just the child's formation. Strong TikTok voiceover potential.",
    targetFormats: ["caption_ig", "caption_tiktok", "pin", "blog", "short_video"],
  },
];

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Sweet Heat Strategist — 2026-04-11\n");

  // 1. Get brand
  const brand = await client.query(api.brands.getBySlug, { slug: "alreadyloved-kids" });
  if (!brand) {
    console.error("❌ AlreadyLoved Kids brand not found. Run seed:seedAlreadyLoved first.");
    process.exit(1);
  }
  console.log(`✅ Brand: ${brand.name} (${brand._id})\n`);

  // 2. Check existing seeds for duplicates
  const existingSeeds = await client.query(api.seeds.list, { brandId: brand._id });
  const existingTitles = new Set(existingSeeds.map(s => s.title.toLowerCase()));
  console.log(`📋 Existing seeds: ${existingSeeds.length}`);

  // 3. Create seeds
  let created = 0;
  for (const seed of SEEDS) {
    if (existingTitles.has(seed.title.toLowerCase())) {
      console.log(`⏭️  Skipped (duplicate): "${seed.title}"`);
      continue;
    }

    const seedId = await client.mutation(api.seeds.create, {
      brandId: brand._id,
      title: seed.title,
      description: seed.description,
      source: seed.source,
      pitchedBy: "agent",
      targetFormats: seed.targetFormats,
    });
    console.log(`🌱 Created: "${seed.title}" → ${seedId}`);
    created++;
  }

  console.log(`\n✅ Done: ${created} seeds created, ${SEEDS.length - created} skipped`);

  // 4. Notify Slack
  const mix = "3 SEO keywords · 1 AEO answer · 1 brand story · 1 engagement hook · 1 audience growth";
  const bestSeed = "The Three Words I Whisper Every Night That Changed Everything";
  const slackMsg = `🌱 *7 new seeds for AlreadyLoved Kids*\n\nToday's best: _"${bestSeed}"_\nMix: ${mix}\n\n<@U0A9H1R97RT> <@U0A9517L831> → Review in Sweet Heat`;

  try {
    const res = await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: slackMsg }),
    });
    console.log(`\n📣 Slack notification: ${res.ok ? "sent" : "failed"}`);
  } catch (e) {
    console.log(`\n📣 Slack notification failed: ${e.message}`);
  }
}

main().catch(e => {
  console.error("❌ Fatal:", e.message);
  process.exit(1);
});
