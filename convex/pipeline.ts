import { v } from "convex/values";
import { mutation, internalAction, internalMutation, query } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { callClaude } from "./lib/callClaude";
import { getFormatPrompt, type PromptInput } from "./lib/formatPrompts";

const PIN_VARIATIONS = 5; // 4-5 Pinterest pins per article

export const approveSeed = mutation({
  args: {
    seedId: v.id("seeds"),
    feedbackReason: v.optional(v.string()),
    feedbackNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const seed = await ctx.db.get(args.seedId);
    if (!seed) throw new Error("Seed not found");

    const brand = await ctx.db.get(seed.brandId);
    if (!brand) throw new Error("Brand not found");

    // Update seed status + feedback
    await ctx.db.patch(args.seedId, {
      status: "approved",
      feedbackReason: args.feedbackReason,
      feedbackNote: args.feedbackNote,
      updatedAt: Date.now(),
    });

    // Order formats: blog first (anchor content — derivatives need it)
    const formats = brand.activeFormats.slice();
    const blogIdx = formats.indexOf("blog");
    if (blogIdx > 0) {
      formats.splice(blogIdx, 1);
      formats.unshift("blog");
    }

    const now = Date.now();
    const branchIds: string[] = [];

    for (const format of formats) {
      const count = format === "pin" ? PIN_VARIATIONS : 1;
      for (let i = 0; i < count; i++) {
        const id = await ctx.db.insert("branches", {
          seedId: args.seedId,
          brandId: seed.brandId,
          format,
          status: "draft",
          createdAt: now,
          updatedAt: now,
        });
        branchIds.push(id);
      }
    }

    // Schedule async content writing
    await ctx.scheduler.runAfter(0, internal.pipeline.writeBranchContent, {
      seedId: args.seedId,
      branchIds,
    });

    return { branchIds, formatsCreated: formats };
  },
});

export const rejectSeed = mutation({
  args: {
    seedId: v.id("seeds"),
    feedbackReason: v.optional(v.string()),
    feedbackNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.seedId, {
      status: "rejected",
      feedbackReason: args.feedbackReason,
      feedbackNote: args.feedbackNote,
      updatedAt: Date.now(),
    });
  },
});

// ── Internal: Write content for all branches of an approved seed ─────────────
// Called by scheduler after seed approval. Blog is written first, then all
// derivative formats receive the blog article as context input.

export const writeBranchContent = internalAction({
  args: {
    seedId: v.id("seeds"),
    branchIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    // Load seed
    const seed = await ctx.runQuery(api.seeds.get, { id: args.seedId });
    if (!seed) throw new Error(`Seed ${args.seedId} not found`);

    // Load brand
    const brand = await ctx.runQuery(api.brands.get, { id: seed.brandId });
    if (!brand) throw new Error(`Brand ${seed.brandId} not found`);

    // Load voice training for the brand (primary docs only — agent reads these)
    const trainingDocs = await ctx.runQuery(api.training.listByLayer, {
      brandId: seed.brandId,
      layer: "voice_general",
    });
    const voiceTraining = trainingDocs
      .filter((t: any) => t.isPrimary === true)
      .map((t: any) => t.content)
      .join("\n\n");

    // Build the brand context for prompt generation
    const brandContext: PromptInput["brand"] = {
      name: brand.name,
      voiceTraining: voiceTraining || brand.voiceTraining,
      interests: brand.interests,
      wordsToUse: brand.wordsToUse,
      wordsToAvoid: brand.wordsToAvoid,
    };

    const seedContext: PromptInput["seed"] = {
      title: seed.title,
      description: seed.description,
    };

    // Load all branches
    const branches: Array<{ _id: string; format: string }> = [];
    for (const branchId of args.branchIds) {
      const branch = await ctx.runQuery(api.branches.get, { id: branchId as any });
      if (branch) {
        branches.push({ _id: branch._id, format: branch.format });
      }
    }

    // Separate blog branch from derivative branches
    const blogBranch = branches.find((b) => b.format === "blog");
    const derivativeBranches = branches.filter((b) => b.format !== "blog");

    // ── STEP 1: Write blog first (primary content) ───────────────────────
    let blogArticle: string | undefined;

    if (blogBranch) {
      try {
        const prompt = getFormatPrompt("blog", {
          seed: seedContext,
          brand: brandContext,
        });
        blogArticle = await callClaude(apiKey, prompt.system, prompt.user, prompt.maxTokens);

        await ctx.runMutation(internal.pipeline.saveDraftInternal, {
          branchId: blogBranch._id as any,
          body: blogArticle,
          authoredBy: "agent",
        });
      } catch (err) {
        console.error(`Failed to write blog for seed ${args.seedId}:`, err);
        // Continue with derivatives even if blog fails — they'll use seed context as fallback
      }
    }

    // ── STEP 2: Write all derivative formats ─────────────────────────────
    // Track pin index for variation assignment
    let pinIndex = 0;

    for (const branch of derivativeBranches) {
      try {
        const promptInput: PromptInput = {
          seed: seedContext,
          brand: brandContext,
          blogArticle,
        };

        // For pin branches, assign variation index (0-4)
        if (branch.format === "pin") {
          promptInput.variationIndex = pinIndex;
          pinIndex++;
        }

        const prompt = getFormatPrompt(branch.format, promptInput);
        const content = await callClaude(apiKey, prompt.system, prompt.user, prompt.maxTokens);

        await ctx.runMutation(internal.pipeline.saveDraftInternal, {
          branchId: branch._id as any,
          body: content,
          authoredBy: "agent",
        });
      } catch (err) {
        console.error(
          `Failed to write ${branch.format} for branch ${branch._id}:`,
          err
        );
        // Continue with remaining branches
      }
    }
  },
});

// ── Internal: Save a draft and update branch status ──────────────────────────
// Called by writeBranchContent action. Creates a versioned draft, updates the
// branch's currentDraftId, and transitions status to "in_review".

export const saveDraftInternal = internalMutation({
  args: {
    branchId: v.id("branches"),
    body: v.string(),
    authoredBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Auto-increment version
    const existing = await ctx.db
      .query("drafts")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .order("desc")
      .first();
    const version = existing ? existing.version + 1 : 1;

    // Create the draft
    const draftId = await ctx.db.insert("drafts", {
      branchId: args.branchId,
      version,
      body: args.body,
      authoredBy: args.authoredBy,
      createdAt: Date.now(),
    });

    // Update branch: set currentDraftId and transition to in_review
    await ctx.db.patch(args.branchId, {
      currentDraftId: draftId,
      status: "in_review",
      updatedAt: Date.now(),
    });

    return draftId;
  },
});

// ── Approve a branch and schedule Buffer publishing ────────────────────────
// Called from the UI. Approves the branch and kicks off Buffer distribution.

export const approveBranch = mutation({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    const branch = await ctx.db.get(args.branchId);
    if (!branch) throw new Error("Branch not found");

    // Get the latest draft
    const draft = branch.currentDraftId ? await ctx.db.get(branch.currentDraftId) : null;
    if (!draft) throw new Error("No draft to publish");

    // Update status to approved
    await ctx.db.patch(args.branchId, { status: "approved", updatedAt: Date.now() });

    // Schedule Buffer publishing
    await ctx.scheduler.runAfter(0, internal.buffer.publishBranch, {
      branchId: args.branchId,
      draftBody: draft.body,
      format: branch.format,
      brandId: branch.brandId,
    });

    return { approved: true };
  },
});
