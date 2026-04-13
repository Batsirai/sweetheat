---
name: customer-research
description: "Build detailed ICP avatar and map every purchase objection with layered responses. Two tools: customer-avatar and objection-map."
version: 1.0.0
metadata:
  hermes:
    tags: [marketing, research, customer-psychology, sales]
    model_tier: opus
    cost_estimate: "~$0.10 per avatar, ~$0.10 per objection map"
---

# Customer Research

## What This Does
Two complementary tools for deep customer understanding:

1. **Customer Avatar** -- Builds a detailed ideal customer profile going beyond demographics into psychographics, daily frustrations, language patterns, online behavior, and purchase triggers. Maps the gap between what they say publicly and what they actually want.

2. **Objection Map** -- Maps every purchase objection across 5 categories (price, trust, timing, product, self-doubt), revealing the three layers of each objection: surface (what they say), real (what they mean), and emotional root (what they're afraid of). Includes responses that address all three layers.

## When to Use
**ORIENT phase** of OODA. Run customer-avatar when launching a new brand, entering a new market, or when content isn't resonating. Run objection-map when conversion rates are low, before writing sales pages, or when preparing sales/support scripts.

## Prompt Templates

### Customer Avatar

#### System Prompt
```
You are a consumer psychologist and market researcher who builds deeply empathetic customer avatars. You go beyond demographics into the messy, real emotional landscape of how people think about their problems.

Your avatar methodology:
- Start with the surface (demographics) but go deep into psychographics
- Map the gap between what people say and what they actually want
- Identify the specific language they use (not marketing language -- THEIR words)
- Understand the purchase trigger moments -- what makes them finally act
- Know where they gather and who influences them

You are writing content for the brand "{brand_name}".
Brand voice and tone: {voice_training}
Thematic interests / content pillars: {interests}
Words and phrases to USE: {words_to_use}
Words and phrases to AVOID: {words_to_avoid}
```

#### User Prompt
```
Build a detailed customer avatar for the product/service category below.

PRODUCT/SERVICE: {product_or_service}
CONTEXT: {context}
BRAND: {brand_name}

DEMOGRAPHICS:
[Age range, gender, income, location, education, family status, occupation]

PSYCHOGRAPHICS:
[Values, beliefs, aspirations, identity -- who do they see themselves as?]

DAILY FRUSTRATIONS:
[3-5 specific frustrations related to this product category they experience regularly]

WHAT THEY'VE TRIED THAT DIDN'T WORK:
[Past solutions they've attempted and why those fell short]

WHAT THEY TELL FRIENDS vs WHAT THEY ACTUALLY WANT:
[The public narrative vs the private desire -- these are always different]

WHERE THEY SPEND TIME ONLINE:
[Specific platforms, subreddits, Facebook groups, YouTube channels, podcasts, newsletters]

EXACT WORDS THEY USE:
[10-15 phrases they actually say when describing their problem -- sourced from how real people talk, not marketing copy]

WHAT MAKES THEM BUY IMMEDIATELY vs HESITATE:
[Triggers that create urgency vs objections that create delay]
```

### Objection Map

#### System Prompt
```
You are a sales psychology expert who understands that every purchase objection has three layers: the surface objection (what they say), the real objection (what they mean), and the emotional root (what they're afraid of). Effective selling addresses all three.

Your framework maps objections across 5 categories:
- PRICE: "It's too expensive" / "I can't afford it" / "I'll wait for a sale"
- TRUST: "I don't know if this is legit" / "What if it doesn't work?" / "I've been burned before"
- TIMING: "Not right now" / "I need to think about it" / "Maybe next month"
- PRODUCT: "I'm not sure this is what I need" / "Does it work for my situation?"
- SELF-DOUBT: "I don't think I can do this" / "What if I fail?" / "I'm not the type of person who..."

You are writing content for the brand "{brand_name}".
Brand voice and tone: {voice_training}
```

#### User Prompt
```
Create a complete objection map for the product/audience below.

PRODUCT/SERVICE: {product_or_service}
CONTEXT: {context}
BRAND: {brand_name}

For each category, provide 2-3 specific objections with all three layers and a response:

PRICE OBJECTIONS:
Objection 1:
- SURFACE (what they say): "[exact words]"
- REAL (what they mean): "[underlying concern]"
- EMOTIONAL ROOT (what they're afraid of): "[deep fear]"
- BEST RESPONSE: [A response that addresses all three layers -- not defensive, empathetic]
- CUSTOMER QUOTE: "[What a converted customer would say about this objection]"

[Continue for 2-3 objections per category]

TRUST OBJECTIONS:
[Same format]

TIMING OBJECTIONS:
[Same format]

PRODUCT OBJECTIONS:
[Same format]

SELF-DOUBT OBJECTIONS:
[Same format]
```

## Example Output (Customer Avatar excerpt)

EXACT WORDS THEY USE:
- "I just want my kids to love reading like I did"
- "Everything is screens now, I feel like I'm losing them"
- "I don't know what books are actually good for their age"
- "Bedtime is a battle and I'm exhausted by the end of it"
- "I want something that matters, not just another toy"
...

## Example Output (Objection Map excerpt)

PRICE OBJECTIONS:
Objection 1:
- SURFACE: "Custom books are too expensive -- I can get books at the library for free"
- REAL: "I'm not sure a personalized book is worth 5x what a regular book costs"
- EMOTIONAL ROOT: "What if I spend this money and my kid doesn't even care about it?"
- BEST RESPONSE: "You're right that libraries are amazing -- we love them too. The difference is that when a child sees THEIR name, THEIR face, THEIR story in a book, something shifts. They don't just read it -- they keep it under their pillow. That's not a book purchase, that's a confidence investment."
- CUSTOMER QUOTE: "I almost didn't buy it because of the price. Then my daughter asked to read 'her book' every single night for three months straight. Worth every penny."

## Model Recommendation
**Opus** -- Deep psychological insight and empathetic customer modeling require the kind of nuanced reasoning that Opus excels at. The three-layer objection analysis in particular needs a model that can hold multiple perspectives simultaneously.
