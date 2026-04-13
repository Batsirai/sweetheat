---
name: content-repurposer
description: "Take one piece of content and adapt it into 8 platform-specific formats: X thread, LinkedIn, Instagram, email, YouTube, TikTok, carousel, and podcast."
version: 1.0.0
metadata:
  hermes:
    tags: [marketing, content, repurposing, multi-platform, social-media]
    model_tier: sonnet
    cost_estimate: "~$0.05 per repurpose (8 outputs)"
---

# Content Repurposer

## What This Does
Takes one anchor piece of content (typically a blog article) and adapts it into 8 complete, platform-specific formats ready to publish:

1. Twitter/X thread (3-5 tweets)
2. LinkedIn post (800-1200 chars)
3. Instagram caption (with hashtags)
4. Email newsletter section
5. YouTube video script intro (first 60 seconds)
6. TikTok script (under 60 seconds)
7. Carousel post outline (10 slides)
8. Podcast talking points

Each adaptation maintains the core insight but completely changes format, tone, and structure to match platform conventions and algorithm preferences.

## When to Use
**ACT phase** of OODA. Use immediately after a blog article is written and approved. This is the multiplication step -- turning one piece of content into 8 distribution-ready assets. Run this as part of the standard content pipeline after the blog format is complete.

## Prompt Template

### System Prompt
```
You are a multi-platform content strategist who understands that each platform has its own culture, format expectations, and algorithm preferences. You take one anchor piece of content and adapt it for maximum reach across 8 platforms -- maintaining the core insight but completely changing the format and tone for each.

Platform expertise:
- Twitter/X: short, punchy, thread-friendly, hot takes, numbers
- LinkedIn: professional insight, personal stories, thought leadership
- Instagram: visual-first, emotional, save-worthy, hashtag strategy
- Email: personal, conversational, value-driven, click-through optimized
- YouTube: hook-driven, structured, retention-focused
- TikTok: trend-aware, fast-paced, personality-driven, under 60 seconds
- Carousel: scannable, tip-based, save-worthy, 10-slide structure
- Podcast: conversational, story-driven, discussion-ready

You are writing content for the brand "{brand_name}".
Brand voice and tone: {voice_training}
Thematic interests / content pillars: {interests}
Words and phrases to USE: {words_to_use}
Words and phrases to AVOID: {words_to_avoid}
```

### User Prompt
```
Take the content below and repurpose it into 8 platform-specific formats.

SOURCE ARTICLE:
{blog_article}

For each platform, write the COMPLETE adapted content -- not an outline, but the actual post/script/copy ready to publish.

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
[5-7 discussion points with brief notes on each. Include a personal story prompt and a listener question to pose.]
```

## Example Output (Twitter/X Thread excerpt)

--- 1. TWITTER/X THREAD ---

1/ Bedtime stories aren't about literacy.

They're about building a child who can handle hard things.

Here's what the research actually says:

2/ The American Academy of Pediatrics found that nightly reading builds emotional resilience -- not just vocabulary.

Kids who hear stories process their own emotions better.

3/ Why? Because stories give kids a safe space to experience fear, loss, joy, and courage before they face it in real life.

It's rehearsal for the hard stuff.

4/ The best part: it only takes 15 minutes a night.

Not a curriculum. Not an app. Just you, a book, and a child who feels safe enough to listen.

5/ If this resonated, retweet the first tweet so more parents see it.

Full article with the research: [link]

## Example Output (TikTok Script excerpt)

--- 6. TIKTOK SCRIPT ---

[Looking directly at camera, casual setting]
HOOK: "Stop buying your kids books to make them smarter."

[Cut to walking shot]
BODY: "Bedtime stories don't build readers -- they build emotionally resilient humans. The research shows that when kids hear stories, they're rehearsing for real life. Fear, loss, courage, joy -- they experience it all in a safe space before they have to face it."

[Cut back to face]
"15 minutes a night. That's it."

CTA: "Save this and try it tonight. Comment 'tonight' if you're in."

## Model Recommendation
**Sonnet** -- Creative adaptation across multiple formats requires strong writing quality and platform awareness, but follows established patterns for each platform. This is volume work that benefits from Sonnet's speed-to-quality ratio. The 8-output structure means efficiency matters.
