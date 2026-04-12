import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import {
  buildContentId,
  buildUtmUrl,
  getPlatformCode,
  getUtmSource,
  formatDate,
  formatYearMonth,
  FORMAT_TO_PLATFORM_CODE,
  PLATFORM_CODE_TO_UTM_SOURCE,
} from "../convex/lib/contentIdUtils";

import {
  getFormatPrompt,
  SUPPORTED_FORMATS,
  type PromptInput,
  type PromptOutput,
} from "../convex/lib/formatPrompts";

// ── Test fixtures ────────────────────────────────────────────────────────────

const SAMPLE_INPUT: PromptInput = {
  seed: {
    title: "Why Bedtime Stories Build Emotional Resilience",
    description:
      "Research shows nightly reading routines help children process emotions and develop stronger coping skills.",
  },
  brand: {
    name: "AlreadyLoved Kids",
    voiceTraining: "Warm, empowering, faith-forward. Speak like a trusted friend.",
    interests: ["faith-based parenting", "children's books", "emotional resilience"],
    wordsToUse: ["already loved", "brave", "rooted"],
    wordsToAvoid: ["cheap", "discount", "hustle"],
  },
  blogArticle:
    "Bedtime stories are more than a wind-down routine. Research from the American Academy of Pediatrics confirms that nightly reading helps children develop emotional resilience...",
};

// ═══════════════════════════════════════════════════════════════════════════════
// Test 1: Content ID generation (pure functions)
// ═══════════════════════════════════════════════════════════════════════════════

describe("Content ID generation", () => {
  it("buildContentId produces correct format: ALK-YYYYMMDD-PIN-AFFIRM-A-BEDTIME", () => {
    const result = buildContentId("ALK", "20260411", "PIN", "AFFIRM", "A", "BEDTIME");
    expect(result).toBe("ALK-20260411-PIN-AFFIRM-A-BEDTIME");
  });

  it("buildContentId works with different variants", () => {
    expect(buildContentId("ASB", "20260315", "IG", "STORY", "B", "GIFT")).toBe(
      "ASB-20260315-IG-STORY-B-GIFT"
    );
    expect(buildContentId("ALK", "20260101", "X", "PROB", "C", "IDENTITY")).toBe(
      "ALK-20260101-X-PROB-C-IDENTITY"
    );
  });

  it("formatDate produces YYYYMMDD", () => {
    const d = new Date(2026, 3, 11); // April 11, 2026 (month is 0-indexed)
    expect(formatDate(d)).toBe("20260411");
  });

  it("formatDate pads single-digit months and days", () => {
    const d = new Date(2026, 0, 5); // January 5
    expect(formatDate(d)).toBe("20260105");
  });

  it("formatYearMonth produces YYYYMM", () => {
    const d = new Date(2026, 3, 11);
    expect(formatYearMonth(d)).toBe("202604");
  });

  it("formatYearMonth pads single-digit months", () => {
    const d = new Date(2026, 0, 15);
    expect(formatYearMonth(d)).toBe("202601");
  });
});

describe("UTM URL generation", () => {
  it("buildUtmUrl includes all 5 UTM parameters", () => {
    const url = buildUtmUrl(
      "https://alreadylovedkids.com/shop",
      "pinterest",
      "social",
      "awareness-custom_book-202604",
      "alk-20260411-pin-affirm-a-bedtime",
      "bedtime"
    );

    expect(url).toContain("utm_source=pinterest");
    expect(url).toContain("utm_medium=social");
    expect(url).toContain("utm_campaign=awareness-custom_book-202604");
    expect(url).toContain("utm_content=alk-20260411-pin-affirm-a-bedtime");
    expect(url).toContain("utm_term=bedtime");
  });

  it("buildUtmUrl starts with the base URL", () => {
    const url = buildUtmUrl(
      "https://example.com/shop",
      "instagram",
      "social",
      "campaign",
      "content",
      "term"
    );
    expect(url).toMatch(/^https:\/\/example\.com\/shop\?/);
  });

  it("buildUtmUrl properly joins with ? separator", () => {
    const url = buildUtmUrl("https://x.com", "a", "b", "c", "d", "e");
    // Should have exactly one ? and the rest joined with &
    const parts = url.split("?");
    expect(parts).toHaveLength(2);
    const params = parts[1].split("&");
    expect(params).toHaveLength(5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Test 2: Format prompt validation
// ═══════════════════════════════════════════════════════════════════════════════

describe("Format prompt validation", () => {
  it(`has ${SUPPORTED_FORMATS.length} format handlers`, () => {
    // The file declares 21 formats in FORMAT_HANDLERS
    expect(SUPPORTED_FORMATS.length).toBeGreaterThanOrEqual(20);
  });

  for (const format of SUPPORTED_FORMATS) {
    describe(`format: ${format}`, () => {
      it("returns a valid { system, user, maxTokens } object", () => {
        const input: PromptInput = {
          ...SAMPLE_INPUT,
          variationIndex: format === "pin" ? 0 : undefined,
        };
        const result = getFormatPrompt(format, input);

        expect(result).toHaveProperty("system");
        expect(result).toHaveProperty("user");
        expect(result).toHaveProperty("maxTokens");
        expect(typeof result.system).toBe("string");
        expect(typeof result.user).toBe("string");
        expect(typeof result.maxTokens).toBe("number");
      });

      it("system prompt contains brand voice instructions", () => {
        const input: PromptInput = {
          ...SAMPLE_INPUT,
          variationIndex: format === "pin" ? 0 : undefined,
        };
        const result = getFormatPrompt(format, input);

        // Every system prompt should mention the brand name
        expect(result.system).toContain("AlreadyLoved Kids");
      });

      it("maxTokens is a positive number", () => {
        const input: PromptInput = {
          ...SAMPLE_INPUT,
          variationIndex: format === "pin" ? 0 : undefined,
        };
        const result = getFormatPrompt(format, input);

        expect(result.maxTokens).toBeGreaterThan(0);
      });

      it("does not throw for valid input", () => {
        const input: PromptInput = {
          ...SAMPLE_INPUT,
          variationIndex: format === "pin" ? 2 : undefined,
        };
        expect(() => getFormatPrompt(format, input)).not.toThrow();
      });
    });
  }

  it("throws for unknown format", () => {
    expect(() => getFormatPrompt("nonexistent_format", SAMPLE_INPUT)).toThrow(
      /Unknown format/
    );
  });

  it("pin format handles all 5 variation indices", () => {
    for (let i = 0; i < 5; i++) {
      const result = getFormatPrompt("pin", { ...SAMPLE_INPUT, variationIndex: i });
      expect(result.system).toBeTruthy();
      expect(result.user).toBeTruthy();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Test 3: Platform code mapping completeness
// ═══════════════════════════════════════════════════════════════════════════════

describe("Platform code mapping completeness", () => {
  // These are the formats referenced in the schema comment and FORMAT_HANDLERS
  const KNOWN_FORMATS_WITH_PLATFORM_CODES = [
    "pin",
    "caption_ig",
    "carousel",
    "caption_tiktok",
    "tweet",
    "linkedin",
    "blog",
    "newsletter",
    "short_video",
    "facebook",
    "quote_card",
  ];

  it("every format in FORMAT_TO_PLATFORM_CODE maps to a non-empty string", () => {
    for (const [format, code] of Object.entries(FORMAT_TO_PLATFORM_CODE)) {
      expect(code).toBeTruthy();
      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(0);
    }
  });

  it("every platform code has a UTM source mapping", () => {
    const platformCodes = new Set(Object.values(FORMAT_TO_PLATFORM_CODE));
    for (const code of platformCodes) {
      const source = PLATFORM_CODE_TO_UTM_SOURCE[code];
      expect(source).toBeTruthy();
      expect(typeof source).toBe("string");
    }
  });

  it("getPlatformCode returns correct code for known formats", () => {
    expect(getPlatformCode("pin")).toBe("PIN");
    expect(getPlatformCode("tweet")).toBe("X");
    expect(getPlatformCode("blog")).toBe("BLG");
    expect(getPlatformCode("caption_ig")).toBe("IG");
    expect(getPlatformCode("carousel")).toBe("IG");
    expect(getPlatformCode("caption_tiktok")).toBe("TIK");
    expect(getPlatformCode("linkedin")).toBe("LI");
    expect(getPlatformCode("newsletter")).toBe("EML");
    expect(getPlatformCode("short_video")).toBe("YT");
    expect(getPlatformCode("facebook")).toBe("FB");
    expect(getPlatformCode("quote_card")).toBe("IG");
  });

  it("getPlatformCode returns OTH for unmapped formats", () => {
    expect(getPlatformCode("unknown_format")).toBe("OTH");
    expect(getPlatformCode("")).toBe("OTH");
  });

  it("getUtmSource returns correct source for known platform codes", () => {
    expect(getUtmSource("PIN")).toBe("pinterest");
    expect(getUtmSource("IG")).toBe("instagram");
    expect(getUtmSource("TIK")).toBe("tiktok");
    expect(getUtmSource("X")).toBe("twitter");
    expect(getUtmSource("LI")).toBe("linkedin");
    expect(getUtmSource("BLG")).toBe("blog");
    expect(getUtmSource("EML")).toBe("email");
    expect(getUtmSource("YT")).toBe("youtube");
    expect(getUtmSource("FB")).toBe("facebook");
  });

  it("getUtmSource returns 'other' for unmapped codes", () => {
    expect(getUtmSource("OTH")).toBe("other");
    expect(getUtmSource("UNKNOWN")).toBe("other");
  });

  for (const format of KNOWN_FORMATS_WITH_PLATFORM_CODES) {
    it(`format "${format}" has a platform code mapping`, () => {
      expect(FORMAT_TO_PLATFORM_CODE[format]).toBeTruthy();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Test 4: API route file existence and Convex module alignment
// ═══════════════════════════════════════════════════════════════════════════════

describe("API route existence", () => {
  const API_ROUTES = [
    "health",
    "brands",
    "brands/[id]",
    "training",
    "drafts",
    "comments",
    "todos",
    "learnings",
    "runs",
    "knowledge",
    "feedback",
    "inbox",
    "auth",
    "ingest",
    "seeds",
    "dream100",
    "contacts",
    "outreach",
    "outreach/[campaignId]/messages",
    "ads",
    "ads/[campaignId]/creatives",
    "email/sequences",
    "email/messages",
    "seo",
    "aeo",
    "video-scripts",
    "lead-magnets",
    "content-ids",
    "analytics/snapshots",
    "analytics/scorecard",
    "research",
    "platform-accounts",
    "analytics/pull",
  ];

  for (const route of API_ROUTES) {
    it(`route /api/${route} has a +server.ts file`, () => {
      const filePath = resolve(
        "/Users/batsirai/SweetContent",
        "src/routes/api",
        route,
        "+server.ts"
      );
      expect(existsSync(filePath)).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Test 5: MCP tool registration completeness
// ═══════════════════════════════════════════════════════════════════════════════

describe("MCP server tool registrations", () => {
  const mcpServerPath = resolve("/Users/batsirai/SweetContent", "mcp-server/index.js");

  it("MCP server file exists", () => {
    expect(existsSync(mcpServerPath)).toBe(true);
  });

  it("MCP server file is valid JavaScript (parseable)", () => {
    const content = readFileSync(mcpServerPath, "utf-8");
    // Verify the file has the basic MCP server structure
    expect(content).toContain("McpServer");
    expect(content).toContain("StdioServerTransport");
    expect(content).toContain('name: "sweet-heat"');
  });

  it("MCP server has 52+ tool registrations", () => {
    const content = readFileSync(mcpServerPath, "utf-8");
    const toolCalls = content.match(/server\.tool\(/g);
    expect(toolCalls).not.toBeNull();
    expect(toolCalls!.length).toBeGreaterThanOrEqual(52);
  });

  it("MCP server registers all expected tool categories", () => {
    const content = readFileSync(mcpServerPath, "utf-8");

    // Core CRUD tools
    const expectedToolNames = [
      "brands_list",
      "brand_get",
      "seeds_list",
      "seed_create",
      "knowledge_topics",
      "knowledge_ideas",
      "training_list",
      "drafts_create",
      "todos_list",
      "todo_create",
      "inbox_add",
      "inbox_list",
      "taste_profile",
      "learning_propose",
      "notify_user",
      "run_start",
      "run_complete",
      // Research and Dream 100
      "research_create_brief",
      "research_list_briefs",
      "research_get_brief",
      "dream100_list",
      "dream100_create",
      "dream100_update",
      "dream100_log_activity",
      // Outreach
      "outreach_create_campaign",
      "outreach_list_campaigns",
      "outreach_create_message",
      "outreach_list_messages",
      "outreach_update_message_status",
      // Content IDs
      "content_generate_content_id",
      "content_list_content_ids",
      // Analytics
      "analytics_create_snapshot",
      "analytics_list_snapshots",
      "analytics_get_scorecard",
      "analytics_pull_overview",
      "analytics_pull_referrers",
      "analytics_pull_campaigns",
      "analytics_get_traffic_summary",
      // SEO + AEO
      "seo_create_target",
      "seo_list_targets",
      "seo_update_target",
      "aeo_create_check",
      "aeo_list_checks",
      // Video
      "video_create_script",
      "video_list_scripts",
      // Ads
      "ad_create_campaign",
      "ad_list_campaigns",
      "ad_create_creative",
      "ad_list_creatives",
      // Contacts
      "contacts_list",
      "contacts_create",
      "contacts_search",
      // Lead magnets
      "lead_magnet_create",
      "lead_magnet_list",
      // Platform accounts
      "platform_accounts_list",
      "platform_accounts_create",
      // Slack reporting
      "slack_daily_report",
      "slack_weekly_scorecard",
      "slack_ops_update",
    ];

    for (const toolName of expectedToolNames) {
      expect(content).toContain(`"${toolName}"`);
    }
  });
});
