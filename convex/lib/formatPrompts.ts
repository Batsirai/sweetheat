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

export type ModelTier = 'opus' | 'sonnet' | 'haiku';

export type PromptOutput = {
  system: string;
  user: string;
  maxTokens: number;
  modelTier: ModelTier;
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

  return { system, user, maxTokens: 3000, modelTier: 'sonnet' };
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
- LINK NOTE: One sentence telling the Canva designer where this pin links (just "Links to: [short article title]").

ENGAGEMENT TACTICS (Pinterest algorithm rewards these):
- Save-worthy content: tips, checklists, how-tos that people want to reference later
- Keyword-rich titles: Pinterest is a search engine. Front-load with searchable terms.
- Emotional hooks: "Your child deserves...", "What if bedtime could be...", "The secret to..."
- Call to save: "Save this for bedtime tonight" in description
- Seasonal relevance: Connect to upcoming holidays, seasons, milestones
- Fresh pin design: Pinterest rewards unique images over reposts`;

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

  return { system, user, maxTokens: 400, modelTier: 'haiku' };
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
- Do NOT use hashtags unless they are brand-approved words.

ENGAGEMENT TACTICS (X rewards replies and retweets):
- Hook tweet must be standalone — it shows in feed without the thread
- Use numbers: "5 things...", "3 reasons..." — signals value
- Include a "controversial" or counterintuitive take to drive quote-tweets
- End thread with: "If this was helpful, retweet the first tweet"
- Use blank lines between sentences in each tweet for readability
- Ask a question in one of the middle tweets to break up the lecture format`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a tweet thread (2–5 tweets) based on the article below.${articleContext}

Output each tweet on its own line, numbered (1/ 2/ etc.). Each tweet must be ≤280 characters.`;

  return { system, user, maxTokens: 600, modelTier: 'haiku' };
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
- Do NOT use excessive emojis. One or two max if they fit the brand voice.

ENGAGEMENT TACTICS (LinkedIn rewards dwell time + comments):
- Hook formulas that work: "I used to think X. Then I learned Y.", "Unpopular opinion:", "3 things I wish I knew about..."
- Short paragraphs (1-2 sentences each) — white space is engagement
- Use line breaks after every sentence in the hook
- Personal story + professional insight = highest engagement
- Ask a specific question at the end: not "What do you think?" but "What's the hardest part of bedtime for your family?"
- No links in the post body (kills reach) — put link in first comment
- Carousel posts get 3x more engagement than text-only on LinkedIn`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a LinkedIn post based on the article below.${articleContext}

Write the full post now. No preamble — output only the post text.`;

  return { system, user, maxTokens: 700, modelTier: 'haiku' };
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
- Max 2200 characters.

ENGAGEMENT TACTICS (Instagram algorithm rewards comments and saves):
- Open with a pattern interrupt: Start mid-story, ask a provocative question, or make a bold claim
- Use "THIS or THAT" questions: "Bedtime stories or bedtime prayers? Comment below"
- "Save this for later" CTA drives the save metric Instagram prioritizes
- Use line breaks generously — wall-of-text kills engagement
- End with a question that has multiple valid answers (drives comments)
- Use 5-15 hashtags in the first comment, NOT in the caption
- Tag location when relevant (boosts local discovery)`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write an Instagram caption based on the article below.${articleContext}

Write the full caption (including hashtags at the end). No preamble.`;

  return { system, user, maxTokens: 700, modelTier: 'haiku' };
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
- Optional: a one-line CTA ("Link in bio", "Watch till the end", etc.).

ENGAGEMENT TACTICS (TikTok algorithm rewards watch time + comments):
- First 3 words must create curiosity gap: "POV:", "Wait for it:", "This changed everything:"
- Hook formula: [Attention grab] + [Promise] in first line
- Keep caption SHORT (50-150 chars) — the video does the talking
- End with: "Comment [X] if you relate" or "Tell me I'm not the only one"
- Stitch/Duet bait: Make content people want to react to
- Trending audio reference in caption when relevant`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write a TikTok caption based on the article below.${articleContext}

Output only the caption text (with hashtags). Keep it punchy and under 200 characters total where possible.`;

  return { system, user, maxTokens: 200, modelTier: 'haiku' };
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

  return { system, user, maxTokens: 1000, modelTier: 'haiku' };
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

  return { system, user, maxTokens: 300, modelTier: 'haiku' };
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

  return { system, user, maxTokens: 500, modelTier: 'haiku' };
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

  return { system, user, maxTokens: 700, modelTier: 'haiku' };
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

  return { system, user, maxTokens: 1500, modelTier: 'haiku' };
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

  return { system, user, maxTokens: 800, modelTier: 'haiku' };
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

  return { system, user, maxTokens: 3000, modelTier: 'sonnet' };
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

  return { system, user, maxTokens: 1000, modelTier: 'sonnet' };
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

  return { system, user, maxTokens: 1500, modelTier: 'haiku' };
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

  return { system, user, maxTokens: 500, modelTier: 'sonnet' };
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

  return { system, user, maxTokens: 600, modelTier: 'sonnet' };
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

  return { system, user, maxTokens: 800, modelTier: 'sonnet' };
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

  return { system, user, maxTokens: 600, modelTier: 'sonnet' };
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

  return { system, user, maxTokens: 800, modelTier: 'sonnet' };
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

  return { system, user, maxTokens: 600, modelTier: 'haiku' };
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

  return { system, user, maxTokens: 800, modelTier: 'haiku' };
}

// ── Format: hook_generator ──────────────────────────────────────────────────
// 20 hooks for any topic in 4 styles. ORIENT phase tool.

function hookGeneratorPrompt(input: PromptInput): PromptOutput {
  const { seed, brand } = input;

  const system = `${voiceInstructions(brand)}

You are an expert copywriter specializing in scroll-stopping hooks for social media, email subject lines, and video intros. You understand what makes people stop scrolling, click, and engage.

Hook psychology principles you apply:
- Pattern interrupt: break the reader's autopilot with something unexpected
- Curiosity gap: open a loop the brain needs to close
- Identity play: speak to who they are or who they want to become
- Specificity: concrete numbers and details beat vague promises
- Emotional resonance: tap into feelings they already have but haven't articulated`;

  const user = `Generate 20 hooks for the following topic. Group them into 4 styles (5 hooks each).

TOPIC: ${seed.title}
CONTEXT: ${seed.description}

Generate exactly 20 hooks organized as follows:

BOLD STATEMENTS (5):
[Hooks that make a confident, provocative, or contrarian claim. These take a stance.]

QUESTION HOOKS (5):
[Hooks that ask a question the reader urgently wants answered. Open a curiosity loop.]

PERSONAL STORY SETUPS (5):
[Hooks that begin a relatable personal narrative. "I used to...", "The moment I realized...", "Nobody told me..."]

SHOCKING / COUNTERINTUITIVE (5):
[Hooks that challenge conventional wisdom or reveal something unexpected. "Actually, X is wrong because..."]

After all 20 hooks, select the TOP 3 for virality potential. For each, explain in 1 sentence why it would perform best.

TOP 3:
1. [Hook text] — [Why this would go viral]
2. [Hook text] — [Why this would go viral]
3. [Hook text] — [Why this would go viral]`;

  return { system, user, maxTokens: 1500, modelTier: 'sonnet' };
}

// ── Format: competitor_analysis ──────────────────────────────────────────────
// Analyze a competitor's content strategy and find gaps. ORIENT phase.

function competitorAnalysisPrompt(input: PromptInput): PromptOutput {
  const { seed, brand } = input;

  const system = `${voiceInstructions(brand)}

You are a senior competitive intelligence analyst specializing in content strategy. You reverse-engineer what competitors are doing, identify their blind spots, and find opportunities for your client to own uncontested space.

Your analysis framework:
- Content format audit: what types of content are they producing and where
- Pain point mapping: what customer problems are they addressing (and which are they ignoring)
- Positioning gaps: where is there white space in the market narrative
- Audience blind spots: who are they NOT speaking to that they should be
- Content angle analysis: what perspectives and angles are missing from their approach`;

  const user = `Analyze the competitive content landscape for the topic/competitor below and find exploitable gaps.

COMPETITOR / TOPIC: ${seed.title}
CONTEXT: ${seed.description}
OUR BRAND: ${brand.name}

Provide a structured competitive analysis:

CONTENT FORMATS THEY USE:
[List the content formats this competitor likely employs — blog, video, podcast, social, email, etc. Note frequency and quality level.]

PAIN POINTS THEY ADDRESS:
[What customer problems and desires are they actively speaking to in their content?]

GAPS IN THEIR CONTENT:
[What topics, formats, or angles are they clearly NOT covering? Where is the white space?]

10 CONTENT ANGLES THEY'RE NOT COVERING:
[For each angle, provide a specific post/article title we could create to own that space.]
1. ANGLE: [angle description]
   TITLE: "[specific title for our content]"
2. ANGLE: [angle description]
   TITLE: "[specific title for our content]"
[...continue through 10]

STRATEGIC RECOMMENDATION:
[2-3 sentences on how ${brand.name} should position against this competitor's content strategy]`;

  return { system, user, maxTokens: 2000, modelTier: 'opus' };
}

// ── Format: customer_avatar ──────────────────────────────────────────────────
// Build detailed ICP avatar with psychographic depth. ORIENT phase.

function customerAvatarPrompt(input: PromptInput): PromptOutput {
  const { seed, brand } = input;

  const system = `${voiceInstructions(brand)}

You are a consumer psychologist and market researcher who builds deeply empathetic customer avatars. You go beyond demographics into the messy, real emotional landscape of how people think about their problems.

Your avatar methodology:
- Start with the surface (demographics) but go deep into psychographics
- Map the gap between what people say and what they actually want
- Identify the specific language they use (not marketing language — THEIR words)
- Understand the purchase trigger moments — what makes them finally act
- Know where they gather and who influences them`;

  const user = `Build a detailed customer avatar for the product/service category below.

PRODUCT/SERVICE: ${seed.title}
CONTEXT: ${seed.description}
BRAND: ${brand.name}

DEMOGRAPHICS:
[Age range, gender, income, location, education, family status, occupation]

PSYCHOGRAPHICS:
[Values, beliefs, aspirations, identity — who do they see themselves as?]

DAILY FRUSTRATIONS:
[3-5 specific frustrations related to this product category they experience regularly]

WHAT THEY'VE TRIED THAT DIDN'T WORK:
[Past solutions they've attempted and why those fell short]

WHAT THEY TELL FRIENDS vs WHAT THEY ACTUALLY WANT:
[The public narrative vs the private desire — these are always different]

WHERE THEY SPEND TIME ONLINE:
[Specific platforms, subreddits, Facebook groups, YouTube channels, podcasts, newsletters]

EXACT WORDS THEY USE:
[10-15 phrases they actually say when describing their problem — sourced from how real people talk, not marketing copy]

WHAT MAKES THEM BUY IMMEDIATELY vs HESITATE:
[Triggers that create urgency vs objections that create delay]`;

  return { system, user, maxTokens: 2000, modelTier: 'opus' };
}

// ── Format: objection_map ────────────────────────────────────────────────────
// Map every purchase objection with layered responses. ORIENT phase.

function objectionMapPrompt(input: PromptInput): PromptOutput {
  const { seed, brand } = input;

  const system = `${voiceInstructions(brand)}

You are a sales psychology expert who understands that every purchase objection has three layers: the surface objection (what they say), the real objection (what they mean), and the emotional root (what they're afraid of). Effective selling addresses all three.

Your framework maps objections across 5 categories:
- PRICE: "It's too expensive" / "I can't afford it" / "I'll wait for a sale"
- TRUST: "I don't know if this is legit" / "What if it doesn't work?" / "I've been burned before"
- TIMING: "Not right now" / "I need to think about it" / "Maybe next month"
- PRODUCT: "I'm not sure this is what I need" / "Does it work for my situation?"
- SELF-DOUBT: "I don't think I can do this" / "What if I fail?" / "I'm not the type of person who..."`;

  const user = `Create a complete objection map for the product/audience below.

PRODUCT/SERVICE: ${seed.title}
CONTEXT: ${seed.description}
BRAND: ${brand.name}

For each category, provide 2-3 specific objections with all three layers and a response:

PRICE OBJECTIONS:
Objection 1:
- SURFACE (what they say): "[exact words]"
- REAL (what they mean): "[underlying concern]"
- EMOTIONAL ROOT (what they're afraid of): "[deep fear]"
- BEST RESPONSE: [A response that addresses all three layers — not defensive, empathetic]
- CUSTOMER QUOTE: "[What a converted customer would say about this objection]"

[Continue for 2-3 objections per category]

TRUST OBJECTIONS:
[Same format]

TIMING OBJECTIONS:
[Same format]

PRODUCT OBJECTIONS:
[Same format]

SELF-DOUBT OBJECTIONS:
[Same format]`;

  return { system, user, maxTokens: 2000, modelTier: 'opus' };
}

// ── Format: landing_page_copy ────────────────────────────────────────────────
// High-converting landing page copy (Hormozi/Brunson school).

function landingPageCopyPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are a direct response copywriter trained in the Hormozi/Brunson school of landing page copy. You write pages that convert because they make the reader feel deeply understood before presenting a solution.

Your copy principles:
- Mirror their exact frustration in the opening — they should think "this person gets me"
- Problem section should agitate without being manipulative — make them feel the cost of inaction
- Solution reveal should feel like a relief, not a pitch
- Offer stack should make the price feel like a no-brainer
- Objection handling should be woven in naturally, not listed defensively
- CTA should create real urgency without fake scarcity or countdown timers
- Social proof should be specific and believable, not generic testimonials`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Write high-converting landing page copy for the product/offer below.${articleContext}

HEADLINE:
[A headline that stops them cold — specific, benefit-driven, under 15 words]

SUBHEADLINE:
[Expand on the headline — who it's for and the transformation promised]

OPENING (Mirror Their Frustration):
[2-3 sentences that mirror their exact daily frustration. They should feel seen.]

PROBLEM SECTION (Make Them Feel the Cost):
[3-4 paragraphs that agitate the problem. Show what happens if nothing changes. Use specific scenarios.]

SOLUTION REVEAL:
[Introduce the product/offer as the natural answer. Not a hard pitch — a relief.]

SOCIAL PROOF:
[3 placeholder testimonials with specific details — name, situation, result. Mark as [PLACEHOLDER - replace with real testimonials]]

OFFER STACK:
[Break down everything they get. List each component with its standalone value. Make the total value dwarf the price.]

OBJECTION HANDLING:
[Address the top 3 objections naturally in a FAQ-style section]

CTA:
[Clear call to action with genuine urgency — not fake scarcity]

GUARANTEE:
[Risk-reversal statement that makes saying yes feel safe]`;

  return { system, user, maxTokens: 3000, modelTier: 'sonnet' };
}

// ── Format: headline_variants ────────────────────────────────────────────────
// 20 headline variations for A/B testing.

function headlineVariantsPrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are a headline testing specialist who understands that the headline is responsible for 80% of a page's conversion rate. You write headlines that earn the click without resorting to clickbait.

Your headline frameworks:
- DIRECT OUTCOME: Promise the specific result they want. No mystery — just value.
- CURIOSITY GAP: Open a loop their brain needs to close. Make them NEED to know.
- FEAR-BASED: Name the risk of inaction. Loss aversion is 2x more powerful than gain.
- SOCIAL PROOF: Leverage the herd — what others have done, discovered, or achieved.
- TIME-BASED: Promise speed. Time is the scarcest resource.`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Generate 20 headline variations for the page/product below.${articleContext}

DIRECT OUTCOME (4):
1. [headline]
2. [headline]
3. [headline]
4. [headline]

CURIOSITY GAP (4):
5. [headline]
6. [headline]
7. [headline]
8. [headline]

FEAR-BASED (4):
9. [headline]
10. [headline]
11. [headline]
12. [headline]

SOCIAL PROOF (4):
13. [headline]
14. [headline]
15. [headline]
16. [headline]

TIME-BASED (4):
17. [headline]
18. [headline]
19. [headline]
20. [headline]

TOP 3 TO A/B TEST:
1. [headline number and text] — [Why this would win: conversion psychology reasoning]
2. [headline number and text] — [Why this would win: conversion psychology reasoning]
3. [headline number and text] — [Why this would win: conversion psychology reasoning]`;

  return { system, user, maxTokens: 1000, modelTier: 'sonnet' };
}

// ── Format: content_repurpose ────────────────────────────────────────────────
// Take one piece of content and adapt it into 8 platform-specific formats.

function contentRepurposePrompt(input: PromptInput): PromptOutput {
  const { seed, brand, blogArticle } = input;

  const system = `${voiceInstructions(brand)}

You are a multi-platform content strategist who understands that each platform has its own culture, format expectations, and algorithm preferences. You take one anchor piece of content and adapt it for maximum reach across 8 platforms — maintaining the core insight but completely changing the format and tone for each.

Platform expertise:
- Twitter/X: short, punchy, thread-friendly, hot takes, numbers
- LinkedIn: professional insight, personal stories, thought leadership
- Instagram: visual-first, emotional, save-worthy, hashtag strategy
- Email: personal, conversational, value-driven, click-through optimized
- YouTube: hook-driven, structured, retention-focused
- TikTok: trend-aware, fast-paced, personality-driven, under 60 seconds
- Carousel: scannable, tip-based, save-worthy, 10-slide structure
- Podcast: conversational, story-driven, discussion-ready`;

  const articleContext = blogArticle
    ? blogArticleBlock(blogArticle)
    : `\n\nSEED TITLE: ${seed.title}\nSEED DESCRIPTION: ${seed.description}`;

  const user = `Take the content below and repurpose it into 8 platform-specific formats.${articleContext}

For each platform, write the COMPLETE adapted content — not an outline, but the actual post/script/copy ready to publish.

--- 1. TWITTER/X THREAD ---
[3-5 tweet thread. Each tweet under 280 chars. Numbered. Hook tweet must stand alone in feed.]

--- 2. LINKEDIN POST ---
[Professional insight post, 800-1200 chars. Hook line, short paragraphs, question at end. No link in body.]

--- 3. INSTAGRAM CAPTION ---
[Hook in first 2 lines (before "more"). Conversational body. CTA (save/comment/share). 5-10 hashtags at end.]

--- 4. EMAIL NEWSLETTER SECTION ---
[Personal intro (2-3 sentences), key insights distilled, bridge to full article. Warm, friend-to-friend tone.]

--- 5. YOUTUBE VIDEO SCRIPT INTRO ---
[First 60 seconds of a video. Pattern-interrupt hook, promise of what they'll learn, brief credibility. Conversational, spoken-word style.]

--- 6. TIKTOK SCRIPT ---
[Under 60 seconds of spoken content. Hook in first 3 seconds. Fast-paced. End with engagement CTA. Include visual/action notes in [brackets].]

--- 7. CAROUSEL POST OUTLINE ---
[10 slides. Slide 1: bold cover headline. Slides 2-9: one idea per slide (heading + 1-2 sentences). Slide 10: CTA + brand.]

--- 8. PODCAST TALKING POINTS ---
[5-7 discussion points with brief notes on each. Include a personal story prompt and a listener question to pose.]`;

  return { system, user, maxTokens: 4000, modelTier: 'sonnet' };
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
  // Marketing capabilities — ORIENT phase
  hook_generator: hookGeneratorPrompt,
  competitor_analysis: competitorAnalysisPrompt,
  customer_avatar: customerAvatarPrompt,
  objection_map: objectionMapPrompt,
  // Landing page copy
  landing_page_copy: landingPageCopyPrompt,
  headline_variants: headlineVariantsPrompt,
  // Content repurposing
  content_repurpose: contentRepurposePrompt,
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
