# Autonomous Content Pipeline — Spec

## The Goal

The user opens Sweet Heat, sees seed recommendations, taps approve or decline. That's it. Everything else is autonomous.

## User Experience (The 5-Minute Morning)

```
User opens Sweet Heat on their phone
  → Sees 3-5 new seed recommendations (generated overnight from knowledge base)
  → Taps: Approve / Decline / Comment on each
  → Approved seeds auto-develop into branches (content per format)
  → Branches auto-write using brand training
  → Written branches appear for quick review (optional — can auto-approve)
  → Approved branches publish directly to Buffer queue (NOT drafts)
  → User closes app. Done.
```

## The Pipeline (What Happens Automatically)

### Stage 1: Seed Generation (Agent → User)
**Trigger:** Scheduled (daily 6am) or on-demand
**Input:** Knowledge base (wiki, transcripts, catalysts), brand training, engagement data
**Output:** 3-5 new seeds in "pitched" status
**User action:** Approve or decline

### Stage 2: Branch Creation (Automatic on seed approval)
**Trigger:** Seed status changes to "approved"  
**Input:** Approved seed + brand's active formats + repurpose matrix
**Output:** One branch per target format (e.g., tweet, linkedin, blog, carousel)
**User action:** None — automatic

### Stage 3: Content Writing (Automatic after branch creation)
**Trigger:** Branch created with no draft
**Input:** Seed content + branch format + brand training + knowledge base context
**Output:** Draft written in brand voice, with format-specific constraints applied
**User action:** Optional review. Quick feedback or auto-approve.

### Stage 4: Publishing (Automatic on branch approval)
**Trigger:** Branch status changes to "approved"
**Input:** Draft content + brand's Buffer channels + format → platform mapping
**Output:** Post created in Buffer's publishing queue (scheduled, not draft)
**User action:** None — approved = published

### Stage 5: Learning (Continuous)
**Trigger:** Every approval, rejection, edit, engagement metric
**Input:** User actions + Buffer analytics
**Output:** Training improvement proposals (learnings)
**User action:** One-tap approve/reject learnings

## Format → Platform Mapping

| Format | Platform | Buffer Channel |
|--------|----------|---------------|
| tweet | Twitter/X | (needs channel) |
| linkedin | LinkedIn | (needs channel) |
| caption_ig | Instagram | 699dc7dd4be271803d6286f7 |
| caption_tiktok | TikTok | 699de0df4be271803d6315ca |
| pin | Pinterest | 699de25e4be271803d631b80 |
| blog | Website | (no Buffer — publish via CMS) |
| carousel | Instagram/LinkedIn | 699dc7dd4be271803d6286f7 |
| short_video | YouTube Shorts/Reels/TikTok | 699de1be4be271803d631957 |
| newsletter | Beehiiv | (via Beehiiv API, not Buffer) |

## Key Principle: Approved = Published

There is NO double-approval. When a branch is approved in Sweet Heat, it goes to Buffer's **publish queue** (scheduled posts), not to Buffer's draft folder. The approval in our system IS the final approval.

## Confidence & Auto-Approval

Each branch gets a `confidenceScore` (0-1). As the system learns:
- New brand: confidenceScore starts at 0. Human reviews everything.
- After 50+ approvals: system suggests auto-approve for formats with >80% approval rate
- User can set auto-approve threshold per format per brand
- Auto-approved branches still appear in a "recently published" feed for spot-checking

## What We're Building Now

1. **Convex trigger:** When seed.status → "approved", auto-create branches per format
2. **Content writer:** Convex action calling Claude with brand training + format constraints
3. **Buffer publisher:** Convex action calling Buffer API to schedule approved branches
4. **Pipeline wiring:** Status change cascades that drive the whole flow

## Test Plan (TDD)

### Test 1: Seed approval creates branches
- Create a seed with status "pitched"
- Approve it (change status to "approved")  
- Verify: branches created for each format in brand's activeFormats
- Verify: each branch has correct brandId, seedId, format, status="draft"

### Test 2: Branch gets auto-written
- Create a branch with status "draft" and no currentDraftId
- Trigger the content writer
- Verify: draft created with body text, authoredBy="agent", version=1
- Verify: branch.currentDraftId updated
- Verify: branch status changed to "in_review"

### Test 3: Branch approval publishes to Buffer
- Create a branch with status "approved" and a draft
- Trigger the publisher
- Verify: Buffer API called with correct channel + content
- Verify: branch.externalPostId set
- Verify: branch status changed to "scheduled"

### Test 4: Full pipeline end-to-end
- Create seed → approve → verify branches created → verify drafts written → approve branch → verify Buffer called
- Total user actions: 2 taps (approve seed, approve branch)

### Test 5: Auto-approve bypass
- Set brand auto-approve threshold to 0.8
- Create branch with confidenceScore 0.9
- Verify: branch auto-approved, sent to Buffer without human review
