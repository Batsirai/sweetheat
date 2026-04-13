---
name: competitor-analysis
description: "Analyze a competitor's content strategy and find exploitable gaps. Produces 10 content angles they're NOT covering."
version: 1.0.0
metadata:
  hermes:
    tags: [marketing, strategy, competitive-intelligence, research]
    model_tier: opus
    cost_estimate: "~$0.08 per analysis"
---

# Competitor Analysis

## What This Does
Analyzes a competitor's content strategy across formats, pain points, and positioning. Identifies gaps in their content coverage and produces 10 specific content angles they're not covering, each with a ready-to-use post title. Includes a strategic recommendation for how to position against them.

## When to Use
**ORIENT phase** of OODA. Use when entering a new market, planning quarterly content strategy, or when a competitor is gaining traction and you need to find the gaps they're leaving open. Best run before a content planning session to inform seed generation.

## Prompt Template

### System Prompt
```
You are a senior competitive intelligence analyst specializing in content strategy. You reverse-engineer what competitors are doing, identify their blind spots, and find opportunities for your client to own uncontested space.

Your analysis framework:
- Content format audit: what types of content are they producing and where
- Pain point mapping: what customer problems are they addressing (and which are they ignoring)
- Positioning gaps: where is there white space in the market narrative
- Audience blind spots: who are they NOT speaking to that they should be
- Content angle analysis: what perspectives and angles are missing from their approach

You are writing content for the brand "{brand_name}".
Brand voice and tone: {voice_training}
Thematic interests / content pillars: {interests}
Words and phrases to USE: {words_to_use}
Words and phrases to AVOID: {words_to_avoid}
```

### User Prompt
```
Analyze the competitive content landscape for the topic/competitor below and find exploitable gaps.

COMPETITOR / TOPIC: {competitor_name_or_url}
CONTEXT: {context}
OUR BRAND: {brand_name}

Provide a structured competitive analysis:

CONTENT FORMATS THEY USE:
[List the content formats this competitor likely employs -- blog, video, podcast, social, email, etc. Note frequency and quality level.]

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
[2-3 sentences on how {brand_name} should position against this competitor's content strategy]
```

## Example Output

CONTENT FORMATS THEY USE:
- Blog: Weekly posts, 800-1200 words, SEO-focused but surface-level
- Instagram: Daily posts, mostly product photos with motivational quotes
- Email: Weekly newsletter, promotional-heavy, little storytelling
- YouTube: None (major gap)
- Podcast: None (major gap)

PAIN POINTS THEY ADDRESS:
- Finding age-appropriate books for kids
- Building reading habits
- Gift-giving for bookworm children

GAPS IN THEIR CONTENT:
- Zero content on the emotional/psychological benefits of reading
- No faith-based angle despite serving a faith-oriented audience
- No content addressing reluctant readers or screen-time transitions
...

10 CONTENT ANGLES THEY'RE NOT COVERING:
1. ANGLE: Emotional resilience through storytime
   TITLE: "How 15 Minutes of Bedtime Reading Builds a Child Who Can Handle Hard Things"
...

STRATEGIC RECOMMENDATION:
AlreadyLoved Kids should own the "reading as emotional development" angle that competitors treat as an afterthought. Lead with the transformation (resilient, rooted children) rather than the product (books), and use faith-based framing as a differentiator no secular competitor can replicate.

## Model Recommendation
**Opus** -- Competitive analysis requires deep strategic reasoning, market pattern recognition, and the ability to synthesize multiple factors into actionable insights. This is strategy work that benefits from Opus's analytical depth.
