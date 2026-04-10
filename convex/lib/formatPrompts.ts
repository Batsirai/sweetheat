// Format-specific content generation prompts for Sweet Content.
// Blog is the PRIMARY format — written first from seed + brand training.
// All other formats are DERIVATIVE — they receive the blog article as input.

export type PromptInput = {
  seed: { title: string; description: string };
  brand: {
    name: string;
    voiceTraining: string;
    interests: string[];
    wordsToUse: string[];
    wordsToAvoid: string[];
  };
  blogArticle?: string; // Available for all derivative formats
  variationIndex?: number; // For pin format (0-4)
};

export type PromptOutput = {
  system: string;
  user: string;
  maxTokens: number;
};

// ── Shared helpers ────────────────────────────────────────────────────────────

function voiceInstructions(brand: PromptInput["brand"]): string {
  const lines: string[] = [];
  lines.push(`You are writing content for the brand "${brand.name}".`);
  if (brand.voiceTraining) {
    lines.push(`\nBrand voice and tone:\n${brand.voiceTraining}`);
  }
  if (brand.interests.length > 0) {
    lines.push(`\nThematic interests / content pillars: ${brand.interests.join(", ")}`);
  }
  if (brand.wordsToUse.length > 0) {
    lines.push(`\nWords and phrases to USE: ${brand.wordsToUse.join(", ")}`);
  }
  if (brand.wordsToAvoid.length > 0) {
    lines.push(`\nWords and phrases to AVOID: ${brand.wordsToAvoid.join(", ")}`);
  }
  return lines.join("\n");
}

function blogArticleBlock(blogArticle: string): string {
  return `\n\nSOURCE ARTICLE (use this as the basis for your content — do not invent facts):\n\`\`\`\n${blogArticle}\n\`\`\``;
}

// ── Format: blog ──────────────────────────────────────────────────────────────
// Primary format. Written first from seed + brand voice. NOT derived from blogArticle.

function blogPrompt(input: PromptInput): PromptOutput {
  const { seed, brand } = input;

  const system = `${voiceInstructions(brand)}

You are an expert content writer specializing in SEO and AEO (Answer Engine Optimization).

SEO/AEO DIRECTIVES:
- Structure content so AI assistants (ChatGPT, Perplexity, Google SGE) are likely to cite it.
- Open with a clear, direct answer to the core question the seed addresses.
- Use H2 and H3 headings that mirror how people phrase search queries.
- Include a "What is..." or "How to..." section where relevant — these get cited by AI overviews.
- Write in concise, factual paragraphs. Bullet points and numbered lists improve citation probability.
- Naturally work in semantically related keywords — do not keyword-stuff.
- End with a meta description (140-160 chars) and a comma-separated list of 5 target keywords.`;

  const user = `Write a comprehensive blog article for the following seed idea.

SEED TITLE: ${seed.title}
SEED DESCRIPTION: ${seed.description}

REQUIREMENTS:
- Length: 1000–2000 words
- Structure: compelling intro → H2/H3 sections → actionable takeaways → conclusion
- Include a meta description at the end (label it "META DESCRIPTION:")
- Include target keywords at the end (label it "TARGET KEYWORDS:")
- Write entirely in the brand's voice as defined in your system prompt
- Do NOT add a byline, author name, or publication date

Write the full article now.`;

  return { system, user, maxTokens: 3000 };
}

// ── Format: pin ───────────────────────────────────────────────────────────────
// Pinterest pin copy. 4-5 variations per article. Uses variationIndex (0-4).
// Each pin has a title, keyword-rich description, and link direction.

const PIN_ANGLES = [
  {
    name: "Main Hook",
    directive:
      "Lead with the primary benefit or transformation promised by the article. Make the title irresistible to someone scrolling Pinterest.",
  },
  {
    name: "Standout Quote",
    directive:
      "Pull the single most quotable or memorable line from the article. The title should be that quote (shortened if needed). The description expands on why it matters.",
  },
  {
    name: "Statistic or Fact",
    directive:
      "Lead with the most surprising statistic, fact, or data point from the article. Numbers stop scrollers. Use the stat in the title.",
  },
  {
    name: "Question",
    directive:
      "Turn the article's core premise into a compelling question the reader wants answered. The title is the question; the description teases the answer.",
  },
  {
    name: "List / Tips",
    directive:
      "Frame the article as a list of tips or steps (e.g., '5 ways to...'). Title uses a number. Description previews 2-3 of the tips.",
  },
];

function pinPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle, variationIndex = 0 } = input;
  const idx = Math.min(Math.max(variationIndex, 0), PIN_ANGLES.length - 1);
  const angle = PIN_ANGLES[idx];

  const system = `${voiceInstructions(brand)}

You are writing Pinterest pin copy. Pinterest is a visual discovery platform — your text must complement a Canva-designed image and drive clicks to the brand's blog.

Pinterest pin anatomy:
- TITLE: 60–100 characters. Shown in bold. Hook first, keyword-rich.
- DESCRIPTION: 200–500 characters. Keyword-rich, benefit-focused, ends with a soft CTA pointing to the article.
- LINK NOTE: One sentence telling the Canva designer where this pin links (just "Links to: [short article title]").`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Generate Pinterest pin copy for variation ${idx + 1} of 5.

ANGLE: ${angle.name}
ANGLE DIRECTIVE: ${angle.directive}${articleContext}

Output format (use these exact labels):
TITLE: [your title here]
DESCRIPTION: [your description here]
LINK NOTE: [your link note here]`;

  return { system, user, maxTokens: 400 };
}

// ── Format: tweet ─────────────────────────────────────────────────────────────
// Tweet or thread derived from blog highlights.

function tweetPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing Twitter/X content. Each tweet is max 280 characters. A thread can be 2–5 tweets.

Thread format rules:
- Tweet 1: the hook — the most compelling insight or claim from the article.
- Tweets 2–4: supporting points, evidence, or actionable steps. One idea per tweet.
- Last tweet: CTA pointing back to the full article (e.g., "Read the full article 👇 [link]").
- Number each tweet: 1/ 2/ 3/ etc.
- Do NOT use hashtags unless they are brand-approved words.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a tweet thread (2–5 tweets) based on the article below.${articleContext}

Output each tweet on its own line, numbered (1/ 2/ etc.). Each tweet must be ≤280 characters.`;

  return { system, user, maxTokens: 600 };
}

// ── Format: linkedin ──────────────────────────────────────────────────────────
// LinkedIn post derived from blog.

function linkedinPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing a LinkedIn post. LinkedIn rewards professional insight, personal experience, and practical value.

LinkedIn post structure:
- Line 1: a scroll-stopping hook (1–2 sentences, no fluff).
- Body: 3–6 short paragraphs or a mix of paragraphs and bullet points.
- Close: a takeaway or reflection that invites engagement (a question or strong statement).
- CTA: one optional line pointing to the full article.
- Length: 300–1500 characters total (aim for the sweet spot around 800–1000).
- Do NOT use excessive emojis. One or two max if they fit the brand voice.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a LinkedIn post based on the article below.${articleContext}

Write the full post now. No preamble — output only the post text.`;

  return { system, user, maxTokens: 700 };
}

// ── Format: caption_ig ────────────────────────────────────────────────────────
// Instagram caption derived from blog.

function captionIgPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing an Instagram caption. Instagram is visual-first — your caption supports the image/reel.

Instagram caption rules:
- Open with a hook in the first 1–2 lines (visible before "more").
- Body: engaging, conversational, on-brand. Can use line breaks for readability.
- End with a CTA (e.g., "Save this post", "Link in bio for the full article", "Tag a friend who needs this").
- Hashtags: add 5–15 relevant hashtags at the very end, on their own line.
- Max 2200 characters.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write an Instagram caption based on the article below.${articleContext}

Write the full caption (including hashtags at the end). No preamble.`;

  return { system, user, maxTokens: 700 };
}

// ── Format: caption_tiktok ────────────────────────────────────────────────────
// TikTok caption derived from blog.

function captionTiktokPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing a TikTok caption. TikTok captions are short, punchy, and hook-driven.

TikTok caption rules:
- Max ~150 characters for the visible part (keep it tight).
- Lead with the hook or most provocative claim.
- Include 3–5 trending/relevant hashtags.
- Optional: a one-line CTA ("Link in bio", "Watch till the end", etc.).`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a TikTok caption based on the article below.${articleContext}

Output only the caption text (with hashtags). Keep it punchy and under 200 characters total where possible.`;

  return { system, user, maxTokens: 200 };
}

// ── Format: carousel ──────────────────────────────────────────────────────────
// Image carousel slide copy for Canva. 8-10 slides. Derived from blog.

function carouselPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing copy for a social media image carousel (Instagram or LinkedIn). Each slide is a single Canva frame.

Carousel structure (8–10 slides):
- Slide 1 (Cover): Bold headline that makes people swipe. Subheadline optional.
- Slides 2–8 (Content): Each slide = one idea, tip, stat, or step. Keep text minimal — this is for a designed graphic. Each slide has a HEADING (≤8 words) and optional BODY (1–2 short sentences).
- Last slide (CTA): Brand name, CTA (e.g., "Save this" / "Read more at [blog]"), and tagline if applicable.

Format each slide clearly with SLIDE N: labels.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write carousel slide copy (8–10 slides) based on the article below.${articleContext}

Output each slide with this format:
SLIDE [N]:
HEADING: [heading text]
BODY: [optional body text]

Start with SLIDE 1 (Cover) and end with a CTA slide.`;

  return { system, user, maxTokens: 1000 };
}

// ── Format: quote_card ────────────────────────────────────────────────────────
// Single quotable line for a branded graphic. Derived from blog.

function quoteCardPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are selecting or crafting a single quotable line from an article for use on a branded graphic (Instagram, Pinterest, LinkedIn).

A great quote card line:
- Is self-contained — makes sense without context.
- Is emotionally resonant or intellectually provocative.
- Is 10–25 words (fits on a graphic).
- Sounds like something the brand would say.
- Is not a generic platitude — it should feel specific and ownable.

Provide 3 options, ranked best to worst.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Extract or craft 3 quote card lines from the article below.${articleContext}

Format:
QUOTE 1: [best quote]
QUOTE 2: [second choice]
QUOTE 3: [third choice]`;

  return { system, user, maxTokens: 300 };
}

// ── Format: short_video ───────────────────────────────────────────────────────
// Short video script (15–90 sec). Hook/body/CTA. Derived from blog.

function shortVideoPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing a short-form video script (Reels, TikTok, YouTube Shorts). Target length: 15–90 seconds of spoken content.

Script structure:
- HOOK (0–3 sec): One sentence that stops the scroll. Ask a provocative question or make a bold claim.
- BODY (3–75 sec): The core content. Deliver 3–5 punchy points. Each point is 1–2 sentences. Use natural spoken language — this will be read aloud or used as a teleprompter.
- CTA (last 5 sec): One clear action (follow, comment, link in bio, save).

Spoken pacing: approximately 130 words per minute. Aim for 35–200 words total depending on desired length.

Format with clear HOOK / BODY / CTA labels. Write in the first person, as if the brand's founder/host is speaking.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a short video script based on the article below.${articleContext}

Target: 30–60 seconds of natural spoken content (approximately 65–130 words).

Format:
HOOK:
[hook text]

BODY:
[body text]

CTA:
[cta text]`;

  return { system, user, maxTokens: 500 };
}

// ── Format: newsletter ────────────────────────────────────────────────────────
// Newsletter section derived from blog. Warm, personal intro + key insights.

function newsletterPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing a newsletter section — one article or story within a larger newsletter issue.

Newsletter section structure:
- Intro (2–3 sentences): warm, personal, conversational. Set the scene or share a brief personal hook related to the topic.
- Body: distill the key insights from the article in newsletter-friendly prose. Use short paragraphs. 2–4 key takeaways.
- Bridge to full article: a sentence like "I go deeper on this in this week's blog post →" or "Here's the full breakdown if you want to dive in →".
- Tone: like writing to a friend who trusts you. Not formal. Not sales-y.
- Length: 200–500 words for the section.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a newsletter section based on the article below.${articleContext}

Write the full newsletter section now. No labels needed — just the flowing text as it would appear in the newsletter.`;

  return { system, user, maxTokens: 700 };
}

// ── Main export ───────────────────────────────────────────────────────────────

const FORMAT_HANDLERS: Record<string, (input: PromptInput) => PromptOutput> = {
  blog: blogPrompt,
  pin: pinPrompt,
  tweet: tweetPrompt,
  linkedin: linkedinPrompt,
  caption_ig: captionIgPrompt,
  caption_tiktok: captionTiktokPrompt,
  carousel: carouselPrompt,
  quote_card: quoteCardPrompt,
  short_video: shortVideoPrompt,
  newsletter: newsletterPrompt,
};

export function getFormatPrompt(format: string, input: PromptInput): PromptOutput {
  const handler = FORMAT_HANDLERS[format];
  if (!handler) {
    throw new Error(
      `Unknown format: "${format}". Supported formats: ${Object.keys(FORMAT_HANDLERS).join(", ")}`
    );
  }
  return handler(input);
}

export const SUPPORTED_FORMATS = Object.keys(FORMAT_HANDLERS);
