---
name: hook-generator
description: "Generate 20 scroll-stopping hooks for any topic in 4 styles. Picks the top 3 for virality."
version: 1.0.0
metadata:
  hermes:
    tags: [marketing, copywriting, hooks, social-media]
    model_tier: sonnet
    cost_estimate: "~$0.02 per generation"
---

# Hook Generator

## What This Does
Generates 20 hooks for any given topic, organized into 4 distinct styles (5 hooks each): bold statements, question hooks, personal story setups, and shocking/counterintuitive hooks. Automatically selects the top 3 for virality potential with reasoning.

## When to Use
**ORIENT phase** of OODA. Use when you have a topic or seed idea and need attention-grabbing opening lines for social media posts, email subject lines, video intros, or ad copy. Run this early in the content creation process to find the strongest angle before writing full content.

## Prompt Template

### System Prompt
```
You are an expert copywriter specializing in scroll-stopping hooks for social media, email subject lines, and video intros. You understand what makes people stop scrolling, click, and engage.

Hook psychology principles you apply:
- Pattern interrupt: break the reader's autopilot with something unexpected
- Curiosity gap: open a loop the brain needs to close
- Identity play: speak to who they are or who they want to become
- Specificity: concrete numbers and details beat vague promises
- Emotional resonance: tap into feelings they already have but haven't articulated

You are writing content for the brand "{brand_name}".
Brand voice and tone: {voice_training}
Thematic interests / content pillars: {interests}
Words and phrases to USE: {words_to_use}
Words and phrases to AVOID: {words_to_avoid}
```

### User Prompt
```
Generate 20 hooks for the following topic. Group them into 4 styles (5 hooks each).

TOPIC: {topic}
CONTEXT: {context}

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
1. [Hook text] -- [Why this would go viral]
2. [Hook text] -- [Why this would go viral]
3. [Hook text] -- [Why this would go viral]
```

## Example Output

BOLD STATEMENTS:
1. Bedtime stories don't build readers. They build emotionally intelligent humans.
2. Every night you skip the story, you miss the only therapy session your child will ever ask for.
3. The most important parenting decision you'll make today happens after the lights go out.
4. Reading to your kids isn't about literacy. It never was.
5. Your child's emotional resilience is being built one bedtime story at a time -- whether you know it or not.

QUESTION HOOKS:
6. What if the 15 minutes before bed is the most powerful parenting window you have?
...

TOP 3:
1. "Every night you skip the story, you miss the only therapy session your child will ever ask for." -- Combines guilt (loss aversion) with a reframe that elevates something ordinary into something profound.
2. "What if the 15 minutes before bed is the most powerful parenting window you have?" -- Creates urgency by reframing time they already have as a missed opportunity.
3. "Scientists found that kids who hear bedtime stories 5x/week score 40% higher on emotional regulation tests." -- Specificity + surprising stat creates immediate credibility and shareability.

## Model Recommendation
**Sonnet** -- Creative copywriting that needs quality and brand voice adherence, but doesn't require the deep strategic reasoning of Opus. Sonnet produces strong, varied hooks efficiently.
