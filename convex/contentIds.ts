import { v } from "convex/values";
import { mutation, internalMutation, query } from "./_generated/server";
import {
  FORMAT_TO_PLATFORM_CODE,
  PLATFORM_CODE_TO_UTM_SOURCE,
  formatDate,
  formatYearMonth,
  buildContentId,
  buildUtmUrl,
  getPlatformCode,
  getUtmSource,
} from "./lib/contentIdUtils";

/** Count existing variants for the same brand+date+platform+template combo to assign A/B/C */
async function getNextVariantCode(
  ctx: any,
  brandId: any,
  publishDate: string,
  platformCode: string,
  templateCode: string
): Promise<string> {
  const existing = await ctx.db
    .query("contentIds")
    .withIndex("by_brand", (q: any) => q.eq("brandId", brandId))
    .collect();

  const sameCombo = existing.filter(
    (c: any) =>
      c.publishDate === publishDate &&
      c.platformCode === platformCode &&
      c.templateCode === templateCode
  );

  const variantIndex = sameCombo.length;
  // A=0, B=1, C=2, ... Z=25, then AA, AB, etc.
  return String.fromCharCode(65 + Math.min(variantIndex, 25));
}

// ── Generate Content ID (internal — called by pipeline) ──────────────────────

export const generateContentId = internalMutation({
  args: {
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    const branch = await ctx.db.get(args.branchId);
    if (!branch) throw new Error("Branch not found");

    const seed = await ctx.db.get(branch.seedId);
    if (!seed) throw new Error("Seed not found");

    const brand = await ctx.db.get(branch.brandId);
    if (!brand) throw new Error("Brand not found");

    // Check if content ID already exists for this branch
    const existingContentId = await ctx.db
      .query("contentIds")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .first();
    if (existingContentId) {
      return existingContentId._id;
    }

    const now = new Date();
    const publishDate = formatDate(now);
    const yearMonth = formatYearMonth(now);

    // Derive components
    const brandPrefix = brand.brandPrefix || brand.slug.slice(0, 3).toUpperCase();
    const platformCode = getPlatformCode(branch.format);
    const templateCode = (seed.templateType || "GEN").toUpperCase();
    const hookCode = (seed.hookAngle || "GENERAL").toUpperCase();

    const variantCode = await getNextVariantCode(
      ctx,
      branch.brandId,
      publishDate,
      platformCode,
      templateCode
    );

    // Build Content ID: {BrandPrefix}-{YYYYMMDD}-{Platform}-{Template}-{Variant}-{Hook}
    const contentId = buildContentId(brandPrefix, publishDate, platformCode, templateCode, variantCode, hookCode);

    // Build UTM URL
    const utmSource = getUtmSource(platformCode);
    const utmMedium = "social";
    const utmCampaign = `awareness-custom_book-${yearMonth}`;
    const utmContent = contentId.toLowerCase();
    const utmTerm = hookCode.toLowerCase();

    const baseUrl = brand.baseUrl || `https://${brand.slug.replace(/-/g, "")}.com`;
    const utmUrl = buildUtmUrl(`${baseUrl}/shop`, utmSource, utmMedium, utmCampaign, utmContent, utmTerm);

    // Save to contentIds table
    const contentIdDocId = await ctx.db.insert("contentIds", {
      branchId: args.branchId,
      brandId: branch.brandId,
      contentId,
      brandPrefix,
      publishDate,
      platformCode,
      templateCode,
      variantCode,
      hookCode,
      utmUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      createdAt: Date.now(),
    });

    // Update branch with content ID reference and UTM URL
    await ctx.db.patch(args.branchId, {
      contentIdRef: contentId,
      utmUrl,
      updatedAt: Date.now(),
    });

    return contentIdDocId;
  },
});

// ── Public mutation (for manual generation via UI/API) ───────────────────────

export const generate = mutation({
  args: {
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    const branch = await ctx.db.get(args.branchId);
    if (!branch) throw new Error("Branch not found");

    const seed = await ctx.db.get(branch.seedId);
    if (!seed) throw new Error("Seed not found");

    const brand = await ctx.db.get(branch.brandId);
    if (!brand) throw new Error("Brand not found");

    // Check if content ID already exists for this branch
    const existingContentId = await ctx.db
      .query("contentIds")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .first();
    if (existingContentId) {
      return existingContentId._id;
    }

    const now = new Date();
    const publishDate = formatDate(now);
    const yearMonth = formatYearMonth(now);

    const brandPrefix = brand.brandPrefix || brand.slug.slice(0, 3).toUpperCase();
    const platformCode = getPlatformCode(branch.format);
    const templateCode = (seed.templateType || "GEN").toUpperCase();
    const hookCode = (seed.hookAngle || "GENERAL").toUpperCase();

    const variantCode = await getNextVariantCode(
      ctx,
      branch.brandId,
      publishDate,
      platformCode,
      templateCode
    );

    const contentId = buildContentId(brandPrefix, publishDate, platformCode, templateCode, variantCode, hookCode);

    const utmSource = getUtmSource(platformCode);
    const utmMedium = "social";
    const utmCampaign = `awareness-custom_book-${yearMonth}`;
    const utmContent = contentId.toLowerCase();
    const utmTerm = hookCode.toLowerCase();

    const baseUrl = brand.baseUrl || `https://${brand.slug.replace(/-/g, "")}.com`;
    const utmUrl = buildUtmUrl(`${baseUrl}/shop`, utmSource, utmMedium, utmCampaign, utmContent, utmTerm);

    const contentIdDocId = await ctx.db.insert("contentIds", {
      branchId: args.branchId,
      brandId: branch.brandId,
      contentId,
      brandPrefix,
      publishDate,
      platformCode,
      templateCode,
      variantCode,
      hookCode,
      utmUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.branchId, {
      contentIdRef: contentId,
      utmUrl,
      updatedAt: Date.now(),
    });

    return contentIdDocId;
  },
});

// ── Queries ─────────────────────────────────────────────────────────────────

export const getByBranch = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contentIds")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .first();
  },
});

export const listByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contentIds")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});
