# Autonomous Content Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a seed is approved, the system autonomously creates branches, writes content (blog first, then derivatives), and publishes approved content to Buffer — daily target of 4-5 Pinterest pins + social posts per brand.

**Architecture:** Three Convex triggers chain the pipeline: seed approval → branch creation → content writing → Buffer publishing. Blog article is the anchor content; all other formats (pins, tweets, LinkedIn, captions) derive from it. Pinterest pins use Canva templates via Claude Desktop MCP (external to this system — Sweet Heat sends the text/direction, Canva integration is a separate connector). Buffer API publishes approved branches directly to the queue (not drafts).

**Tech Stack:** Convex (mutations, actions, scheduled functions), Anthropic Claude API (content generation), Buffer API v1 (publishing)

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `convex/pipeline.ts` | Core pipeline: seed→branches, branch content writing, branch→Buffer |
| `convex/buffer.ts` | Buffer API integration: create posts, schedule, status sync |
| `convex/lib/callClaude.ts` | Shared Claude API helper (extracted from compiler.ts) |
| `convex/lib/formatPrompts.ts` | Per-format content generation prompts (blog, pin, tweet, etc.) |
| `tests/pipeline.test.ts` | Pipeline unit tests (convex-test) |
| `tests/buffer.test.ts` | Buffer integration tests |

### Modified Files
| File | Change |
|------|--------|
| `convex/seeds.ts` | `updateStatus` triggers pipeline when status→"approved" |
| `convex/branches.ts` | `updateStatus` triggers Buffer when status→"approved" |
| `convex/compiler.ts` | Extract `callClaude` to shared lib |
| `convex/schema.ts` | No changes needed — schema already supports this |
| `package.json` | Add `vitest`, `convex-test` dev dependencies |

---

### Task 1: Test Infrastructure Setup

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest convex-test
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Add to scripts: `"test": "vitest run", "test:watch": "vitest"`

- [ ] **Step 4: Create test setup file**

Create `tests/setup.ts`:
```typescript
import { convexTest } from "convex-test";
import schema from "../convex/schema";

export function setupTest() {
  return convexTest(schema);
}
```

- [ ] **Step 5: Verify test infra with a smoke test**

Create `tests/smoke.test.ts`:
```typescript
import { expect, test } from "vitest";
import { setupTest } from "./setup";
import { api } from "../convex/_generated/api";

test("can create and list brands", async () => {
  const t = setupTest();
  const brandId = await t.mutation(api.brands.create, {
    name: "Test Brand", slug: "test", description: "test",
  });
  const brands = await t.query(api.brands.list, {});
  expect(brands.length).toBe(1);
  expect(brands[0].name).toBe("Test Brand");
});
```

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "test: add vitest + convex-test infrastructure"
```

---

### Task 2: Extract Shared Claude Helper

**Files:**
- Create: `convex/lib/callClaude.ts`
- Modify: `convex/compiler.ts`

- [ ] **Step 1: Create shared Claude API helper**

Create `convex/lib/callClaude.ts`:
```typescript
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

export async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096
): Promise<string> {
  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}
```

- [ ] **Step 2: Update compiler.ts to use shared helper**

Replace the local `callClaude` function with:
```typescript
import { callClaude } from "./lib/callClaude";
```
Remove the duplicate function definition.

- [ ] **Step 3: Verify compiler still works**

Run: `npx convex dev --once`
Expected: Functions ready, no errors

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "refactor: extract callClaude to shared lib"
```

---

### Task 3: Format Prompts Library

**Files:**
- Create: `convex/lib/formatPrompts.ts`

- [ ] **Step 1: Create format prompts with content strategy**

Create `convex/lib/formatPrompts.ts` with system and user prompts for each format. Blog is primary (written first). All others derive from the blog.

Key formats:
- `blog` — SEO/AEO anchor article (1000-2000 words, H2/H3 structure, meta description)
- `pin` — Pinterest pin (title + description + link, 4-5 variations per article)
- `tweet` — Tweet/thread from article highlights
- `linkedin` — LinkedIn post (professional framing of article content)
- `caption_ig` — Instagram caption derived from article
- `carousel` — Slide-by-slide text for IG/LinkedIn carousel
- `quote_card` — Quotable lines from article
- `short_video` — Script for Reels/TikTok derived from article

Each prompt function takes: `{ seed, brand, blogArticle? }` and returns `{ system, user }`.

The blog prompt generates from seed + brand training.
All other prompts generate from seed + brand training + blogArticle (the anchor).

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add format-specific content generation prompts"
```

---

### Task 4: Pipeline Core — Seed Approval Triggers Branch Creation

**Files:**
- Create: `convex/pipeline.ts`
- Create: `tests/pipeline.test.ts`
- Modify: `convex/seeds.ts`

- [ ] **Step 1: Write failing test — seed approval creates branches**

```typescript
test("approving a seed creates branches for each active format", async () => {
  const t = setupTest();
  // Create brand with activeFormats
  const brandId = await t.mutation(api.brands.create, {
    name: "Test", slug: "test", description: "test",
    activeFormats: ["blog", "pin", "tweet", "linkedin"],
  });
  // Create seed
  const seedId = await t.mutation(api.seeds.create, {
    brandId, title: "Test idea", description: "A test",
    source: "manual", pitchedBy: "user",
  });
  // Approve seed via pipeline
  await t.mutation(api.pipeline.approveSeed, { seedId });
  // Verify branches created
  const branches = await t.query(api.branches.getBySeed, { seedId });
  expect(branches.length).toBe(4); // blog, pin, tweet, linkedin
  expect(branches.map(b => b.format).sort()).toEqual(["blog", "linkedin", "pin", "tweet"]);
  expect(branches.every(b => b.status === "draft")).toBe(true);
  // Verify seed status changed
  const seed = await t.query(api.seeds.get, { id: seedId });
  expect(seed?.status).toBe("approved");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/pipeline.test.ts`
Expected: FAIL — `api.pipeline.approveSeed` doesn't exist

- [ ] **Step 3: Implement pipeline.approveSeed**

Create `convex/pipeline.ts`:
```typescript
export const approveSeed = mutation({
  args: { seedId: v.id("seeds") },
  handler: async (ctx, args) => {
    const seed = await ctx.db.get(args.seedId);
    if (!seed) throw new Error("Seed not found");

    const brand = await ctx.db.get(seed.brandId);
    if (!brand) throw new Error("Brand not found");

    // Update seed status
    await ctx.db.patch(args.seedId, { status: "approved", updatedAt: Date.now() });

    // Create branches for each active format
    // Blog is always first (anchor content)
    const formats = brand.activeFormats.includes("blog")
      ? ["blog", ...brand.activeFormats.filter(f => f !== "blog")]
      : brand.activeFormats;

    const branchIds = [];
    for (const format of formats) {
      const id = await ctx.db.insert("branches", {
        seedId: args.seedId,
        brandId: seed.brandId,
        format,
        status: "draft",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      branchIds.push(id);
    }

    // Schedule content writing (async action)
    await ctx.scheduler.runAfter(0, internal.pipeline.writeBranchContent, {
      seedId: args.seedId,
      branchIds,
    });

    return { branchIds };
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/pipeline.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: seed approval auto-creates branches per format"
```

---

### Task 5: Content Writer — Auto-Write Branch Drafts

**Files:**
- Modify: `convex/pipeline.ts`
- Add tests to: `tests/pipeline.test.ts`

- [ ] **Step 1: Write failing test — branch gets content written**

Test that after pipeline.writeBranchContent runs, each branch has a draft with body text.

- [ ] **Step 2: Implement writeBranchContent action**

Internal action in `convex/pipeline.ts`:
1. Load seed, brand, training data
2. For blog format: generate article from seed + brand training + knowledge base context
3. For all other formats: generate from seed + brand training + blog article (if available)
4. For pin format: generate 4-5 variations (multiple branches created)
5. Create draft for each branch, update branch status to "in_review"

Key: blog is written FIRST, then passed as context to all derivative formats.

Pin format generates multiple pins (4-5) per article — each with different angle/quote.

- [ ] **Step 3: Run test to verify it passes**

Run: `npm test -- tests/pipeline.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: auto-write branch content using Claude + brand training"
```

---

### Task 6: Buffer Integration — Publish Approved Branches

**Files:**
- Create: `convex/buffer.ts`
- Create: `tests/buffer.test.ts`
- Modify: `convex/pipeline.ts`

- [ ] **Step 1: Write failing test — approved branch posts to Buffer**

Test that calling pipeline.approveBranch with a branch that has a draft results in Buffer API being called and branch status changing to "scheduled".

- [ ] **Step 2: Implement Buffer API client**

Create `convex/buffer.ts`:
```typescript
export const createPost = action({
  args: {
    channelId: v.string(),
    text: v.string(),
    mediaUrl: v.optional(v.string()),
    scheduledAt: v.optional(v.string()), // ISO date
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.BUFFER_API_KEY;
    // POST https://api.bufferapp.com/1/updates/create.json
    // profile_ids[], text, media, scheduled_at
  },
});
```

- [ ] **Step 3: Implement pipeline.approveBranch**

```typescript
export const approveBranch = mutation({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    const branch = await ctx.db.get(args.branchId);
    // Get draft content
    // Look up brand's integrations for Buffer channel mapping
    // Map format → platform → Buffer channel ID
    // Schedule Buffer publish via action
    // Update branch status to "scheduled"
  },
});
```

Format → channel mapping uses the `integrations` table (already has Buffer channel IDs for AlreadyLoved).

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: approved branches publish directly to Buffer queue"
```

---

### Task 7: Wire UI — Approve Seeds Triggers Full Pipeline

**Files:**
- Modify: `src/routes/seeds/+page.svelte`
- Modify: `src/routes/branches/+page.svelte`

- [ ] **Step 1: Update seed approve button to use pipeline.approveSeed**

Replace the direct `seeds.updateStatus` call with `pipeline.approveSeed` — this triggers the full cascade.

- [ ] **Step 2: Update branch approve button to use pipeline.approveBranch**

Replace the direct `branches.updateStatus` call with `pipeline.approveBranch` — this triggers Buffer publishing.

- [ ] **Step 3: Add "Publishing..." status indicator on branches**

Show when a branch is being sent to Buffer, and link to Buffer post when scheduled.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: wire UI to autonomous pipeline (approve = publish)"
```

---

### Task 8: Pin Variations — 4-5 Pins Per Article

**Files:**
- Modify: `convex/pipeline.ts`
- Modify: `convex/lib/formatPrompts.ts`

- [ ] **Step 1: Update branch creation for pin format**

When creating branches for an approved seed that includes "pin" format, create 4-5 pin branches instead of 1. Each gets a different angle/quote from the blog article.

- [ ] **Step 2: Update pin prompt to generate variation-specific content**

Each pin variation has:
- Unique title (different hook/angle)
- Description (keyword-rich, links to blog URL)
- Visual direction (for Canva template — text overlay, quote, layout notes)

Note: actual Canva image generation is via Claude Desktop MCP connector (external). Sweet Heat provides the text content + visual direction. The Canva integration connector will receive this and generate the pin image.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: generate 4-5 pin variations per blog article"
```

---

### Task 9: End-to-End QA with /gstack

**Files:** None (testing only)

- [ ] **Step 1: Start dev server and run /gstack browse**

Test the full flow:
1. Navigate to Seeds → Plant a seed
2. Approve the seed
3. Verify branches appear on Branches page
4. Verify drafts are being written (watch status change from "draft" to "in_review")
5. Approve a branch
6. Verify Buffer post created (check Buffer dashboard or API response)

- [ ] **Step 2: Test mobile experience**

Use /gstack with mobile viewport — verify the approve flow works on phone-sized screen.

- [ ] **Step 3: Commit any fixes**

---

### Task 10: Daily Schedule (Convex Cron)

**Files:**
- Create: `convex/crons.ts`

- [ ] **Step 1: Set up daily agent run**

Create a Convex cron that runs daily at 6am:
1. For each active brand: check seed queue depth
2. If below target (5 seeds): generate new seeds from knowledge base
3. Process any pending pipeline work (unwritten branches, etc.)

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: daily cron for autonomous seed generation and pipeline processing"
```

---

## Canva Integration Note

Pinterest pins need images from Canva templates. This is NOT built into this pipeline. Instead:
- Sweet Heat stores `visualDirection` on each pin branch draft (text overlays, quotes, layout notes)
- A separate Canva connector (via Claude Desktop MCP) reads the visual direction and generates the pin image
- The Canva export URL is stored on `branch.externalDesignUrl`
- Buffer publisher attaches the image URL when posting

This keeps the pipeline Canva-agnostic — the connector is pluggable per the original architecture.
