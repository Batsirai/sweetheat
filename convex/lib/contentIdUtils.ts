// Pure utility functions for Content ID generation and UTM URL building.
// Extracted for testability — no Convex runtime dependency.

// ── Platform code mapping ────────────────────────────────────────────────────
export const FORMAT_TO_PLATFORM_CODE: Record<string, string> = {
  pin: "PIN",
  caption_ig: "IG",
  carousel: "IG",
  caption_tiktok: "TIK",
  tweet: "X",
  linkedin: "LI",
  blog: "BLG",
  newsletter: "EML",
  short_video: "YT",
  facebook: "FB",
  quote_card: "IG",
};

// ── UTM source mapping ──────────────────────────────────────────────────────
export const PLATFORM_CODE_TO_UTM_SOURCE: Record<string, string> = {
  PIN: "pinterest",
  IG: "instagram",
  TIK: "tiktok",
  X: "twitter",
  LI: "linkedin",
  BLG: "blog",
  EML: "email",
  YT: "youtube",
  FB: "facebook",
};

/**
 * Get the platform code for a content format.
 * Returns "OTH" if the format is not mapped.
 */
export function getPlatformCode(format: string): string {
  return FORMAT_TO_PLATFORM_CODE[format] || "OTH";
}

/**
 * Get the UTM source string for a platform code.
 * Returns "other" if the platform code is not mapped.
 */
export function getUtmSource(platformCode: string): string {
  return PLATFORM_CODE_TO_UTM_SOURCE[platformCode] || "other";
}

/**
 * Format a Date into YYYYMMDD string.
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Format a Date into YYYYMM string.
 */
export function formatYearMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

/**
 * Build a Content ID string from its components.
 *
 * Format: {brandPrefix}-{YYYYMMDD}-{platformCode}-{templateCode}-{variant}-{hookCode}
 *
 * Example: ALK-20260411-PIN-AFFIRM-A-BEDTIME
 */
export function buildContentId(
  brandPrefix: string,
  publishDate: string,
  platformCode: string,
  templateCode: string,
  variant: string,
  hookCode: string
): string {
  return `${brandPrefix}-${publishDate}-${platformCode}-${templateCode}-${variant}-${hookCode}`;
}

/**
 * Build a full UTM-tagged URL from its components.
 *
 * All 5 standard UTM parameters are included:
 * utm_source, utm_medium, utm_campaign, utm_content, utm_term
 */
export function buildUtmUrl(
  baseUrl: string,
  utmSource: string,
  utmMedium: string,
  utmCampaign: string,
  utmContent: string,
  utmTerm: string
): string {
  return `${baseUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_content=${utmContent}&utm_term=${utmTerm}`;
}
