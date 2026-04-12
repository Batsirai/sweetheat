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

// ── Format: schema_markup ─────────────────────────────────────────────────────
// JSON-LD schema.org markup for a blog article. Flow 1 (content pipeline).

function schemaMarkupPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are an SEO technical specialist generating JSON-LD structured data (schema.org).

Rules:
- Output ONLY valid JSON-LD — no prose, no markdown fences, no explanation.
- Choose the most appropriate schema type: Article for general posts, FAQPage if the article contains Q&A sections, HowTo if the article is a step-by-step guide.
- For Article: include @context, @type, headline, description, author (use the brand name), datePublished (use today's date placeholder "YYYY-MM-DD"), and keywords.
- For FAQPage: include mainEntity as an array of Question/Answer pairs extracted from the article.
- For HowTo: include name, description, and a step array with HowToStep items.
- Populate values from the actual article content — do not invent facts.
- Output must be parseable by JSON.parse() with no modification.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Generate JSON-LD schema.org markup for the following article.${articleContext}

Select the most appropriate schema type (Article, FAQPage, or HowTo) based on the content. Output only the raw JSON-LD object.`;

  return { system, user, maxTokens: 1500 };
}

// ── Format: video_script_short ────────────────────────────────────────────────
// 30-60 second short-form video script for TikTok/Reels/Shorts. Flow 2.

function videoScriptShortPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing a short-form video script for TikTok, Instagram Reels, or YouTube Shorts. Target spoken length: 30–60 seconds (approximately 65–130 words).

Script structure:
- HOOK (first 3 seconds): One punchy sentence that stops the scroll immediately. Ask a question, make a bold claim, or drop a surprising fact. This is everything.
- BODY (main content): Deliver the core value in 3–5 short, spoken sentences. One idea per sentence. No filler. Speak directly to the viewer.
- CTA (call to action): One line. Tell them exactly what to do next (follow, comment, save, link in bio).

Spoken style: conversational, energetic, first-person. Write for the ear — short sentences, natural rhythm. Avoid jargon.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a 30–60 second short-form video script based on the content below.${articleContext}

Format:
HOOK:
[hook text — 1 sentence, first 3 seconds]

BODY:
[body text — 3–5 short sentences]

CTA:
[cta text — 1 sentence]`;

  return { system, user, maxTokens: 800 };
}

// ── Format: video_script_long ─────────────────────────────────────────────────
// 5-15 minute YouTube video script. Full structure. Flow 2.

function videoScriptLongPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing a full-length YouTube video script. Target length: 5–15 minutes of spoken content (approximately 750–2000 words).

Script structure:
- INTRO HOOK (first 30 seconds): Open with a pattern-interrupt — a bold question, a relatable struggle, or a surprising stat. Tell viewers exactly what they'll get from watching. Do NOT start with "Hey guys welcome back."
- MAIN POINTS (3–5 sections): Each section has a clear heading, a concise explanation, and a real-world example or story. Transitions between sections should feel natural.
- RECAP: 2–3 sentences summarizing the key takeaways. Reinforce the transformation.
- CTA: Clear, specific action (subscribe, comment, link in description, related video).

Spoken style: warm, authoritative, first-person. Write for the ear. Use conversational language, occasional rhetorical questions, and natural pacing notes (e.g., [PAUSE], [EMPHASIZE]).`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a full YouTube video script (5–15 minutes) based on the content below.${articleContext}

Format:
INTRO HOOK:
[hook text]

[SECTION HEADING 1]:
[section content with example]

[SECTION HEADING 2]:
[section content with example]

[continue for 3–5 sections]

RECAP:
[recap text]

CTA:
[cta text]`;

  return { system, user, maxTokens: 3000 };
}

// ── Format: ugc_script ────────────────────────────────────────────────────────
// UGC-style video script — casual, testimonial-feel, with creator brief. Flow 2.

function ugcScriptPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing a UGC (user-generated content) style video script. UGC feels authentic, unpolished, and personal — like a real customer sharing their experience, not a polished ad.

UGC script characteristics:
- Sounds like a real person talking to their phone camera, not a professional presenter.
- Personal story or relatable moment leads in — "So I was literally just doing X when..."
- Casually mentions the product/brand as the natural solution they found.
- Includes genuine enthusiasm without sounding scripted or salesy.
- Short and punchy: 30–60 seconds of spoken content.

Output two sections:
1. CREATOR BRIEF: A short paragraph telling the UGC creator their persona, the vibe, key points to hit, and any brand guidelines (words to use/avoid).
2. SCRIPT: The actual word-for-word script they can adapt and deliver in their own voice.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a UGC-style video script based on the content below.${articleContext}

Format:
CREATOR BRIEF:
[brief for the creator — persona, vibe, key points, brand do's/don'ts]

SCRIPT:
[word-for-word script the creator can adapt — casual, first-person, 30–60 sec]`;

  return { system, user, maxTokens: 1000 };
}

// ── Format: podcast_show_notes ────────────────────────────────────────────────
// Podcast episode outline and show notes. Flow 2.

function podcastShowNotesPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing podcast episode show notes and an episode outline.

Show notes structure:
- EPISODE TITLE: Compelling, searchable title for the episode.
- EPISODE DESCRIPTION: 2–3 sentence summary for podcast directories (Apple Podcasts, Spotify). Hook the listener, tease the value.
- KEY TOPICS: Bullet list of 4–7 main topics covered in the episode.
- TIMESTAMPS: Placeholder format — [00:00] Intro, [XX:XX] Topic 1, etc. Use [XX:XX] as placeholder since actual times aren't known yet.
- KEY QUOTES: 2–3 pull quotes or soundbite-worthy lines from the content.
- RESOURCES MENTIONED: List any books, tools, websites, or references from the content.
- CALL TO ACTION: What should listeners do after hearing this episode?

Tone: warm, professional, approachable — matches the brand voice.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write podcast show notes and episode outline based on the content below.${articleContext}

Use the structure: EPISODE TITLE / EPISODE DESCRIPTION / KEY TOPICS / TIMESTAMPS / KEY QUOTES / RESOURCES MENTIONED / CALL TO ACTION.`;

  return { system, user, maxTokens: 1500 };
}

// ── Format: cold_email ────────────────────────────────────────────────────────
// Personalized cold outreach email. Genuine, value-first. Flow 3 (outreach).

function coldEmailPrompt(input: PromptInput): PromptOutput {
  const { seed, brand } = input;

  const system = `${voiceInstructions(brand)}

You are writing a cold outreach email. This is NOT a mass marketing blast — it is a genuine, personalized message from one person to another.

Cold email principles:
- Subject line: specific and curious-inducing, never clickbait. Under 50 characters.
- Opening line: reference something specific about the recipient or their work (use a [PERSONALIZATION] placeholder where the sender should fill in a specific detail).
- Value-first: lead with what's in it for THEM, not a pitch about the brand.
- One clear CTA: ask for one small, easy thing (a reply, a quick call, feedback) — not a purchase.
- Short: 5–8 sentences total. Busy people don't read long emails.
- Tone: warm, human, peer-to-peer. NOT salesy. NOT "I hope this email finds you well."

Output: SUBJECT: line followed by the email body.`;

  const user = `Write a cold outreach email based on this campaign/topic.

SEED TITLE: ${seed.title}
SEED DESCRIPTION: ${seed.description}

Use [PERSONALIZATION] as a placeholder where the sender should add a specific, researched detail about the recipient. Keep the email to 5–8 sentences. Output:
SUBJECT: [subject line]

[email body]`;

  return { system, user, maxTokens: 500 };
}

// ── Format: podcast_pitch ─────────────────────────────────────────────────────
// Pitch email to a podcast host. Flow 3 (outreach).

function podcastPitchPrompt(input: PromptInput): PromptOutput {
  const { seed, brand } = input;

  const system = `${voiceInstructions(brand)}

You are writing a pitch email to a podcast host requesting to be a guest on their show.

Podcast pitch structure:
- Subject line: specific and intriguing. Reference the show by name with a [SHOW NAME] placeholder.
- Opening: genuine compliment about the show — not generic. Use [SPECIFIC EPISODE OR MOMENT] placeholder for personalization.
- The hook: why THIS topic would resonate with THEIR audience specifically.
- Suggested talking points: 3 concrete topics/angles the guest could cover.
- Brief bio: 2–3 sentences about the brand/founder — who they are, what they've built, why they're credible.
- CTA: simple ask — "Would love to explore if this would be a good fit."

Tone: respectful, confident, peer-to-peer. Not desperate, not fawning. Show that you've actually listened to the show.`;

  const user = `Write a podcast guest pitch email based on this topic/brand.

SEED TITLE: ${seed.title}
SEED DESCRIPTION: ${seed.description}
BRAND: ${brand.name}

Use [SHOW NAME] and [SPECIFIC EPISODE OR MOMENT] as personalization placeholders. Output:
SUBJECT: [subject line]

[email body]`;

  return { system, user, maxTokens: 600 };
}

// ── Format: ad_copy_prospecting ───────────────────────────────────────────────
// Facebook/Instagram ad copy for cold audiences. 3 variants (A/B/C).

function adCopyProspectingPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing Facebook/Instagram ad copy for cold audiences — people who have never heard of this brand. These people do NOT know they have the problem yet, or they're not actively searching for a solution.

Ad copy structure for each variant:
- HOOK (first line): Must stop the scroll in the feed. Ask a question they're already thinking, name their pain, or make a bold/surprising claim. This is the most important line.
- BODY: Problem → Agitate → Solve. Make them feel understood, show the cost of inaction, then present the solution. 3–5 sentences.
- CTA: One clear, low-friction action. "Learn more" or "Shop now" or "Get yours" — match to the offer.

Generate 3 distinct variants (A, B, C) testing different hooks and angles. Each variant should feel like a different creative direction, not just a rewording.

Format constraints: Primary text (above image) 125 characters or less for mobile preview. Write the full copy AND note the primary text excerpt.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write 3 Facebook/Instagram prospecting ad copy variants (A/B/C) based on the content below.${articleContext}

For each variant, format as:
VARIANT [A/B/C]:
PRIMARY TEXT PREVIEW: [first 125 chars — what shows before "see more"]
HOOK: [hook line]
BODY: [body copy]
CTA: [call to action button text]`;

  return { system, user, maxTokens: 800 };
}

// ── Format: ad_copy_retargeting ───────────────────────────────────────────────
// Retargeting ad copy for warm audiences. 3 variants (A/B/C).

function adCopyRetargetingPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing Facebook/Instagram retargeting ad copy for warm audiences — people who have already visited the website or engaged with content but haven't converted yet.

Retargeting ad principles:
- These people already know the brand. Skip the long introduction.
- Use social proof, testimonials, or "as seen in" signals to build trust.
- Address the objection that stopped them from converting (price? timing? trust?).
- Create gentle urgency — not fake scarcity. "Others are loving this" or "Don't miss out."
- Shorter copy works better for retargeting — they already know the context.

Generate 3 distinct variants (A, B, C):
- Variant A: Social proof angle (reviews, results, community)
- Variant B: Objection-handling angle (address a specific hesitation)
- Variant C: Urgency/reminder angle (they were this close — nudge them back)`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write 3 retargeting ad copy variants (A/B/C) for warm audiences based on the content below.${articleContext}

For each variant, format as:
VARIANT [A/B/C]:
ANGLE: [social proof / objection-handling / urgency-reminder]
PRIMARY TEXT PREVIEW: [first 125 chars]
BODY: [ad copy]
CTA: [call to action button text]`;

  return { system, user, maxTokens: 600 };
}

// ── Format: email_soap_opera ──────────────────────────────────────────────────
// First email in a Soap Opera Sequence (Brunson method). Story-driven, no hard sell.

function emailSoapOperaPrompt(input: PromptInput): PromptOutput {
  const { seed, brand } = input;

  const system = `${voiceInstructions(brand)}

You are writing the first email in a Soap Opera Sequence (Russell Brunson method). This is an email automation that builds connection through storytelling over a series of emails.

Email 1 (The Setting): This email sets the stage. Its job is to hook the reader with a compelling story beginning, establish who the sender is through the story (not a bio), and end with a cliffhanger that makes them want to open the next email.

Rules for this email:
- Open IN the middle of a scene — don't warm up with small talk.
- The story should be true or at minimum plausible and relatable to the target audience.
- Theme: a moment of struggle, confusion, or turning point related to the seed topic.
- NO hard sell. NO product pitch. The relationship is more valuable right now.
- End with a cliffhanger or "teaser" for Email 2 — "Tomorrow I'll tell you what changed everything..."
- Subject line: intriguing, story-forward, personal. Under 50 characters.
- Length: 200–400 words.`;

  const user = `Write Email 1 of a Soap Opera Sequence based on this topic.

SEED TITLE: ${seed.title}
SEED DESCRIPTION: ${seed.description}
BRAND: ${brand.name}

This email should read like a story opening — hook them, establish the struggle, end with a cliffhanger. No selling. Output:
SUBJECT: [subject line]

[email body]

P.S. [teaser for Email 2 — what's coming tomorrow]`;

  return { system, user, maxTokens: 800 };
}

// ── Format: email_seinfeld ────────────────────────────────────────────────────
// Daily "Seinfeld" style email — everyday story → brand message → soft CTA.

function emailSeinfeldPrompt(input: PromptInput): PromptOutput {
  const { seed, brand } = input;

  const system = `${voiceInstructions(brand)}

You are writing a "Seinfeld email" — a short, entertaining daily email inspired by Ben Settle's method. The email is about something mundane from everyday life, and then — seemingly by magic — it connects to a brand message or insight.

Seinfeld email formula:
1. Tell a short, specific, entertaining story from everyday life (2–4 sentences). It can be about anything: standing in line, a Netflix show, a conversation, something a kid said. The more specific and ordinary, the better.
2. Bridge: one or two sentences that draw an unexpected but insightful connection to your topic or brand lesson. The "so here's why this matters..." moment.
3. Brand message: 1–3 sentences delivering the real insight, lesson, or value — in the brand's voice.
4. Soft CTA: one line. Optional link. Not pushy — more like "if you want to go deeper, here's how."

Subject line: should reference the story, not the product. Curiosity over clarity.
Length: 150–300 words total.`;

  const user = `Write a Seinfeld-style daily email connected to this topic.

SEED TITLE: ${seed.title}
SEED DESCRIPTION: ${seed.description}
BRAND: ${brand.name}

Invent a short, specific, relatable everyday story (doesn't have to be real — just feel real) and connect it to the seed topic in a clever, non-obvious way. Output:
SUBJECT: [subject line]

[email body — story → bridge → brand message → soft CTA]`;

  return { system, user, maxTokens: 600 };
}

// ── Format: lead_magnet_copy ──────────────────────────────────────────────────
// Landing page copy for a lead magnet opt-in page.

function leadMagnetCopyPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are writing landing page copy for a lead magnet opt-in page. The goal of this page is one thing: get the visitor to enter their email in exchange for the lead magnet.

Landing page copy structure:
- HEADLINE: The single most compelling benefit or transformation the lead magnet delivers. Bold, specific, benefit-forward. Under 12 words if possible.
- SUBHEADLINE: Expand on the headline — who it's for and what they'll get. 1–2 sentences.
- BENEFIT BULLETS (3–5): Each bullet starts with an action verb and promises a specific outcome. Format: "[Verb] [specific benefit]" (e.g., "Discover the 3 questions every Christian mom should ask before choosing a book for her child").
- WHAT YOU'LL LEARN: A short paragraph (2–3 sentences) describing the content/format of the lead magnet. Makes it feel real and valuable.
- CTA BUTTON TEXT: 3–7 words. First-person where possible ("Send Me the Guide" beats "Submit").
- TRUST LINE: One short sentence below the button that removes friction ("No spam. Unsubscribe anytime.").

Tone: warm, direct, benefit-focused. Speak to the specific pain and desire of the target audience.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write lead magnet landing page copy based on the content below.${articleContext}

Format:
HEADLINE: [headline]
SUBHEADLINE: [subheadline]
BENEFIT BULLETS:
- [bullet 1]
- [bullet 2]
- [bullet 3]
- [bullet 4 — optional]
- [bullet 5 — optional]
WHAT YOU'LL LEARN: [paragraph]
CTA BUTTON: [button text]
TRUST LINE: [trust line]`;

  return { system, user, maxTokens: 800 };
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
  // Flow 1 — Content pipeline
  schema_markup: schemaMarkupPrompt,
  // Flow 2 — Video scripts
  video_script_short: videoScriptShortPrompt,
  video_script_long: videoScriptLongPrompt,
  ugc_script: ugcScriptPrompt,
  podcast_show_notes: podcastShowNotesPrompt,
  // Flow 3 — Outreach
  cold_email: coldEmailPrompt,
  podcast_pitch: podcastPitchPrompt,
  // Ad formats
  ad_copy_prospecting: adCopyProspectingPrompt,
  ad_copy_retargeting: adCopyRetargetingPrompt,
  // Email formats
  email_soap_opera: emailSoapOperaPrompt,
  email_seinfeld: emailSeinfeldPrompt,
  // Lead magnet
  lead_magnet_copy: leadMagnetCopyPrompt,
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
