import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Sweet Heat API base URL — local dev or Tailscale
const API_BASE = process.env.SWEET_HEAT_URL || "http://localhost:5173";
const API_KEY = process.env.SWEET_HEAT_API_KEY || "sc_agent_2026_kX9mPqR7vN3jL5wT8yF1";
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || "";

async function api(path, options = {}) {
  const url = `${API_BASE}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  return res.json();
}

async function notifySlack(message) {
  if (!SLACK_WEBHOOK) return;
  try {
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  } catch { /* silent */ }
}

const server = new McpServer({
  name: "sweet-heat",
  version: "0.1.0",
});

// ═══ BRANDS ═══════════════════════════════════════════════════════════════

server.tool(
  "brands_list",
  "List all active brands with their config, formats, and voice training",
  {},
  async () => {
    const brands = await api("/brands");
    return { content: [{ type: "text", text: JSON.stringify(brands, null, 2) }] };
  }
);

server.tool(
  "brand_get",
  "Get a specific brand by ID with full details",
  { brandId: z.string().describe("The brand ID") },
  async ({ brandId }) => {
    const brand = await api(`/brands/${brandId}`);
    return { content: [{ type: "text", text: JSON.stringify(brand, null, 2) }] };
  }
);

// ═══ SEEDS ════════════════════════════════════════════════════════════════

server.tool(
  "seeds_list",
  "List seeds, optionally filtered by brand. Shows title, status, source, purpose, pillar, keywords.",
  { brandId: z.string().optional().describe("Filter by brand ID") },
  async ({ brandId }) => {
    const params = brandId ? `?brandId=${brandId}` : "";
    const seeds = await api(`/seeds${params}`);
    return { content: [{ type: "text", text: JSON.stringify(seeds, null, 2) }] };
  }
);

server.tool(
  "seed_create",
  "Pitch a new seed (content idea). The user will review and approve/decline it.",
  {
    brandId: z.string().describe("Brand this seed belongs to"),
    title: z.string().describe("Compelling title for the content idea"),
    description: z.string().describe("Full description with angle, hook, thesis"),
    source: z.string().describe("Where this idea came from: knowledge_base | audience_question | agent_research | remix | industry_radar | manual"),
    purpose: z.string().optional().describe("Content purpose: seo | aeo | brand_building | engagement | audience_growth | table_stakes"),
    contentPillar: z.string().optional().describe("Content pillar/theme this belongs to"),
    targetKeywords: z.array(z.string()).optional().describe("Target SEO/AEO keywords"),
    reasoning: z.string().optional().describe("Why you're pitching this — coverage gaps, search volume, strategic value"),
    targetFormats: z.array(z.string()).optional().describe("Suggested formats: blog, pin, tweet, linkedin, carousel, etc."),
  },
  async (args) => {
    const result = await api("/seeds", {
      method: "POST",
      body: JSON.stringify({
        ...args,
        pitchedBy: "agent",
      }),
    });

    // Notify via Slack with proper user mentions
    const purposeTag = args.purpose ? ` [${args.purpose}]` : "";
    await notifySlack(`🌱 New seed pitched${purposeTag}: "${args.title}"\n${args.reasoning || ""}\n<@U0A9H1R97RT> <@U0A9517L831> → http://100.65.231.55:5173/seeds`);

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ KNOWLEDGE BASE ═══════════════════════════════════════════════════════

server.tool(
  "knowledge_topics",
  "List knowledge topics for a brand — shows source count, page count, idea count",
  { brandId: z.string().describe("Brand ID") },
  async ({ brandId }) => {
    const topics = await api(`/knowledge?brandId=${brandId}`);
    return { content: [{ type: "text", text: JSON.stringify(topics, null, 2) }] };
  }
);

server.tool(
  "knowledge_ideas",
  "List ready content idea briefs from the knowledge base",
  { brandId: z.string().describe("Brand ID") },
  async ({ brandId }) => {
    const ideas = await api(`/knowledge?brandId=${brandId}&ideas=true`);
    return { content: [{ type: "text", text: JSON.stringify(ideas, null, 2) }] };
  }
);

// ═══ TRAINING ═════════════════════════════════════════════════════════════

server.tool(
  "training_list",
  "Get all training modules for a brand — voice, seed generation, platform-specific, format-specific",
  { brandId: z.string().describe("Brand ID") },
  async ({ brandId }) => {
    const training = await api(`/training?brandId=${brandId}`);
    return { content: [{ type: "text", text: JSON.stringify(training, null, 2) }] };
  }
);

// ═══ BRANCHES & DRAFTS ════════════════════════════════════════════════════

server.tool(
  "drafts_create",
  "Write a draft for a branch (content piece). Creates a versioned draft.",
  {
    branchId: z.string().describe("Branch to write the draft for"),
    body: z.string().describe("The content body (article text, pin copy, tweet, etc.)"),
    visualDirection: z.string().optional().describe("Notes for visual asset production (Canva template text, layout)"),
  },
  async ({ branchId, body, visualDirection }) => {
    const result = await api("/drafts", {
      method: "POST",
      body: JSON.stringify({ branchId, body, visualDirection, authoredBy: "agent" }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ TODOS ════════════════════════════════════════════════════════════════

server.tool(
  "todos_list",
  "List pending todos for user or agent",
  {
    owner: z.enum(["user", "agent"]).optional().describe("Filter by owner"),
    brandId: z.string().optional().describe("Filter by brand"),
  },
  async ({ owner, brandId }) => {
    const params = new URLSearchParams();
    if (owner) params.set("owner", owner);
    if (brandId) params.set("brandId", brandId);
    params.set("status", "pending");
    const todos = await api(`/todos?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(todos, null, 2) }] };
  }
);

server.tool(
  "todo_create",
  "Create a todo for the user or agent",
  {
    brandId: z.string().optional().describe("Brand ID"),
    owner: z.enum(["user", "agent"]).describe("Who should do this"),
    type: z.string().describe("Todo type: review_seed | review_branch | write_draft | generate_seeds | review_learning"),
    description: z.string().describe("What needs to be done"),
    priority: z.number().optional().describe("Priority (higher = more important)"),
  },
  async (args) => {
    const result = await api("/todos", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ INBOX ════════════════════════════════════════════════════════════════

server.tool(
  "inbox_add",
  "Add an item to the inbox — a URL to fetch, a note, or a signal from scouting. Everything in the inbox feeds the content factory.",
  {
    type: z.enum(["url", "note", "email"]).describe("Item type"),
    url: z.string().optional().describe("URL to fetch and ingest (for type=url)"),
    title: z.string().optional().describe("Title or subject"),
    content: z.string().optional().describe("Content body (for notes/emails)"),
    brandId: z.string().optional().describe("Brand ID to associate with"),
    sourcePlatform: z.string().optional().describe("Where this came from: reddit | twitter | linkedin | perplexity | google_alert | newsletter | web"),
  },
  async (args) => {
    const result = await api("/inbox", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "inbox_list",
  "List pending inbox items — signals, URLs, notes waiting to be processed",
  { status: z.string().optional().describe("Filter by status: pending | processed | dismissed") },
  async ({ status }) => {
    const items = await api(`/inbox?status=${status ?? "pending"}`);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  }
);

// ═══ TASTE PROFILE (Feedback Learning Loop) ══════════════════════════════

server.tool(
  "taste_profile",
  "Get the user's taste profile for a brand — what they approve/reject and why. Use this before generating seeds to understand preferences. Shows approval patterns by content pillar, purpose, source, and recent feedback notes.",
  { brandId: z.string().describe("Brand ID to get taste profile for") },
  async ({ brandId }) => {
    const profile = await api(`/feedback?brandId=${brandId}`);
    return { content: [{ type: "text", text: JSON.stringify(profile, null, 2) }] };
  }
);

// ═══ LEARNINGS ════════════════════════════════════════════════════════════

server.tool(
  "learning_propose",
  "Propose a training improvement based on content performance or feedback patterns",
  {
    brandId: z.string().describe("Brand ID"),
    layer: z.string().describe("Training layer: voice_general | spark_generation | platform_specific | format_specific"),
    proposal: z.string().describe("The proposed change to training"),
    reasoning: z.string().describe("Why this improvement is needed — cite data"),
  },
  async (args) => {
    const result = await api("/learnings", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ NOTIFICATIONS ════════════════════════════════════════════════════════

server.tool(
  "notify_user",
  "Send a notification to the user via Slack (and eventually push notification)",
  {
    message: z.string().describe("The notification message"),
    urgent: z.boolean().optional().describe("If true, marks as urgent"),
  },
  async ({ message, urgent }) => {
    const prefix = urgent ? "🔴 " : "";
    await notifySlack(`${prefix}${message}`);
    return { content: [{ type: "text", text: "Notification sent" }] };
  }
);

// ═══ AGENT RUNS ═══════════════════════════════════════════════════════════

server.tool(
  "run_start",
  "Log the start of an agent run for observability",
  {},
  async () => {
    const result = await api("/runs", {
      method: "POST",
      body: JSON.stringify({ action: "start" }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "run_complete",
  "Log the completion of an agent run with metrics",
  {
    id: z.string().describe("Run ID from run_start"),
    status: z.enum(["completed", "failed", "partial"]),
    brandsProcessed: z.array(z.string()),
    todosCompleted: z.number(),
    seedsGenerated: z.number(),
    draftsWritten: z.number(),
    summary: z.string().optional(),
  },
  async (args) => {
    const result = await api("/runs", {
      method: "POST",
      body: JSON.stringify({
        action: "complete",
        ...args,
        visualsGenerated: 0,
        learningsGenerated: 0,
      }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ RESEARCH ═════════════════════════════════════════════════════════════

server.tool(
  "research_create_brief",
  "Create a research brief for a brand — market research, trend analysis, keyword opportunities, competitor updates, and content recommendations",
  {
    brandId: z.string().describe("Brand ID"),
    type: z.string().describe("Brief type: market_analysis | trend_report | keyword_research | competitor_analysis | content_recommendations"),
    title: z.string().describe("Title of the research brief"),
    content: z.string().describe("Full research content and findings"),
    trendingTopics: z.array(z.string()).optional().describe("List of trending topics identified"),
    keywordOpportunities: z.array(z.string()).optional().describe("Keyword opportunities discovered"),
    competitorUpdates: z.array(z.string()).optional().describe("Notable competitor activity"),
    contentRecommendations: z.array(z.string()).optional().describe("Recommended content actions based on research"),
  },
  async (args) => {
    const result = await api("/research", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "research_list_briefs",
  "List research briefs for a brand, optionally filtered by type",
  {
    brandId: z.string().describe("Brand ID"),
    type: z.string().optional().describe("Filter by brief type"),
  },
  async ({ brandId, type }) => {
    const params = new URLSearchParams({ brandId });
    if (type) params.set("type", type);
    const result = await api(`/research?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "research_get_brief",
  "Get a specific research brief by ID",
  {
    id: z.string().describe("Research brief ID"),
  },
  async ({ id }) => {
    const result = await api(`/research?id=${id}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ DREAM 100 ════════════════════════════════════════════════════════════

server.tool(
  "dream100_list",
  "List Dream 100 entries for a brand — influencers, brands, and creators to build relationships with",
  {
    brandId: z.string().describe("Brand ID"),
    category: z.string().optional().describe("Filter by category: influencer | brand | creator | podcast | newsletter | community"),
  },
  async ({ brandId, category }) => {
    const params = new URLSearchParams({ brandId });
    if (category) params.set("category", category);
    const result = await api(`/dream100?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "dream100_create",
  "Add a new entry to the Dream 100 list — a target influencer, brand, or creator to build a relationship with",
  {
    brandId: z.string().describe("Brand ID"),
    name: z.string().describe("Name of the person, brand, or creator"),
    category: z.string().describe("Category: influencer | brand | creator | podcast | newsletter | community"),
    platform: z.string().optional().describe("Primary platform: instagram | youtube | tiktok | linkedin | twitter | podcast"),
    profileUrl: z.string().optional().describe("Profile or website URL"),
    audience: z.string().optional().describe("Description of their audience"),
    notes: z.string().optional().describe("Why this person is on the Dream 100 and relationship goals"),
    priority: z.number().optional().describe("Priority level 1-10"),
  },
  async (args) => {
    const result = await api("/dream100", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "dream100_update",
  "Update a Dream 100 entry — status, notes, relationship stage, etc.",
  {
    id: z.string().describe("Dream 100 entry ID"),
    status: z.string().optional().describe("Relationship status: identified | following | engaging | connected | collaborating | partner"),
    notes: z.string().optional().describe("Updated notes"),
    priority: z.number().optional().describe("Updated priority"),
    lastContactDate: z.string().optional().describe("Date of last contact (ISO string)"),
  },
  async (args) => {
    const result = await api("/dream100", {
      method: "POST",
      body: JSON.stringify({ action: "update", ...args }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "dream100_log_activity",
  "Log an activity or touchpoint with a Dream 100 contact — comment, DM, collab pitch, etc.",
  {
    dream100Id: z.string().describe("Dream 100 entry ID"),
    activityType: z.string().describe("Type: comment | dm | collab_pitch | shoutout | feature | event | other"),
    description: z.string().describe("What happened and any key notes"),
    outcome: z.string().optional().describe("Outcome or response received"),
  },
  async (args) => {
    const result = await api("/dream100", {
      method: "POST",
      body: JSON.stringify({ action: "log_activity", ...args }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ OUTREACH ═════════════════════════════════════════════════════════════

server.tool(
  "outreach_create_campaign",
  "Create an outreach campaign — for partnerships, PR, guest posting, influencer collabs, or lead gen",
  {
    brandId: z.string().describe("Brand ID"),
    name: z.string().describe("Campaign name"),
    type: z.string().describe("Campaign type: partnership | pr | guest_post | influencer | lead_gen | collab"),
    goal: z.string().describe("Campaign objective and success metrics"),
    targetAudience: z.string().optional().describe("Description of target contacts"),
    template: z.string().optional().describe("Default outreach message template"),
    startDate: z.string().optional().describe("Planned start date (ISO string)"),
    endDate: z.string().optional().describe("Planned end date (ISO string)"),
  },
  async (args) => {
    const result = await api("/outreach", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "outreach_list_campaigns",
  "List outreach campaigns for a brand",
  {
    brandId: z.string().describe("Brand ID"),
    type: z.string().optional().describe("Filter by campaign type"),
    status: z.string().optional().describe("Filter by status: draft | active | paused | completed"),
  },
  async ({ brandId, type, status }) => {
    const params = new URLSearchParams({ brandId });
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    const result = await api(`/outreach?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "outreach_create_message",
  "Create an outreach message in a campaign — a personalized pitch to a specific contact",
  {
    campaignId: z.string().describe("Outreach campaign ID"),
    contactName: z.string().describe("Name of the contact"),
    contactHandle: z.string().optional().describe("Social handle or email"),
    platform: z.string().optional().describe("Platform for outreach: email | instagram | linkedin | twitter | tiktok"),
    subject: z.string().optional().describe("Message subject (for email)"),
    body: z.string().describe("The outreach message body"),
    personalizations: z.string().optional().describe("Notes on how this was personalized"),
  },
  async ({ campaignId, ...rest }) => {
    const result = await api(`/outreach/${campaignId}/messages`, {
      method: "POST",
      body: JSON.stringify(rest),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "outreach_list_messages",
  "List outreach messages in a campaign with their send status and responses",
  {
    campaignId: z.string().describe("Outreach campaign ID"),
    status: z.string().optional().describe("Filter by status: draft | sent | replied | no_response | declined"),
  },
  async ({ campaignId, status }) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const query = params.toString() ? `?${params}` : "";
    const result = await api(`/outreach/${campaignId}/messages${query}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "outreach_update_message_status",
  "Update the status of an outreach message — mark as sent, record a reply, or log outcome",
  {
    campaignId: z.string().describe("Outreach campaign ID"),
    messageId: z.string().describe("Message ID"),
    status: z.string().describe("New status: draft | sent | replied | no_response | declined | success"),
    reply: z.string().optional().describe("The reply received (if any)"),
    notes: z.string().optional().describe("Additional outcome notes"),
    sentAt: z.string().optional().describe("When it was sent (ISO string)"),
  },
  async ({ campaignId, messageId, ...rest }) => {
    const result = await api(`/outreach/${campaignId}/messages`, {
      method: "PATCH",
      body: JSON.stringify({ id: messageId, ...rest }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ CONTENT IDS ══════════════════════════════════════════════════════════

server.tool(
  "content_generate_content_id",
  "Generate a unique content ID for a branch — used for cross-platform tracking of content pieces",
  {
    branchId: z.string().describe("Branch ID to generate a content ID for"),
  },
  async ({ branchId }) => {
    const result = await api("/content-ids", {
      method: "POST",
      body: JSON.stringify({ branchId }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "content_list_content_ids",
  "List all content IDs for a brand — for cross-platform tracking and republishing",
  {
    brandId: z.string().describe("Brand ID"),
  },
  async ({ brandId }) => {
    const result = await api(`/content-ids?brandId=${brandId}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ ANALYTICS ════════════════════════════════════════════════════════════

server.tool(
  "analytics_create_snapshot",
  "Record an analytics snapshot for a brand — follower counts, engagement rates, reach, impressions from any platform",
  {
    brandId: z.string().describe("Brand ID"),
    source: z.string().describe("Platform source: instagram | youtube | tiktok | pinterest | linkedin | twitter | website | email"),
    metrics: z.record(z.number()).describe("Key-value map of metric names to values (e.g. { followers: 12500, reach: 45000 })"),
    period: z.string().optional().describe("Reporting period (e.g. '2026-04', 'week-15')"),
    notes: z.string().optional().describe("Any notable context for this snapshot"),
  },
  async (args) => {
    const result = await api("/analytics/snapshots", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "analytics_list_snapshots",
  "List analytics snapshots for a brand — historical performance data across platforms",
  {
    brandId: z.string().describe("Brand ID"),
    source: z.string().optional().describe("Filter by platform source"),
    limit: z.number().optional().describe("Max number of snapshots to return"),
  },
  async ({ brandId, source, limit }) => {
    const params = new URLSearchParams({ brandId });
    if (source) params.set("source", source);
    if (limit) params.set("limit", String(limit));
    const result = await api(`/analytics/snapshots?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "analytics_get_scorecard",
  "Get the current performance scorecard for a brand — aggregated health metrics across all tracked platforms",
  {
    brandId: z.string().describe("Brand ID"),
  },
  async ({ brandId }) => {
    const result = await api(`/analytics/scorecard?brandId=${brandId}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ DATAFAST ANALYTICS ═══════════════════════════════════════════════════

const DATAFAST_API_KEY = process.env.DATAFAST_API_KEY || "";
const DATAFAST_BASE = "https://datafa.st/api/v1";

async function datafastFetch(path) {
  if (!DATAFAST_API_KEY) throw new Error("DATAFAST_API_KEY not set");
  const res = await fetch(`${DATAFAST_BASE}${path}`, {
    headers: { Authorization: `Bearer ${DATAFAST_API_KEY}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DataFast ${res.status}: ${err}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

server.tool(
  "analytics_pull_overview",
  "Pull the latest DataFast site-wide analytics overview for a brand and store it as a performance snapshot",
  { brandId: z.string().describe("Brand ID") },
  async ({ brandId }) => {
    const result = await api("/analytics/pull", {
      method: "POST",
      body: JSON.stringify({ action: "overview", brandId }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "analytics_pull_referrers",
  "Pull the latest DataFast referrer breakdown for a brand and store it as a performance snapshot",
  { brandId: z.string().describe("Brand ID") },
  async ({ brandId }) => {
    const result = await api("/analytics/pull", {
      method: "POST",
      body: JSON.stringify({ action: "referrers", brandId }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "analytics_pull_campaigns",
  "Pull the latest DataFast UTM campaign performance for a brand and store it as a performance snapshot",
  { brandId: z.string().describe("Brand ID") },
  async ({ brandId }) => {
    const result = await api("/analytics/pull", {
      method: "POST",
      body: JSON.stringify({ action: "campaigns", brandId }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "analytics_get_traffic_summary",
  "Fetch a live traffic summary directly from DataFast — overview + 7-day timeseries. Returns formatted text suitable for Slack reporting.",
  {},
  async () => {
    const [overview, timeseries] = await Promise.all([
      datafastFetch("/analytics/overview"),
      datafastFetch("/analytics/timeseries?fields=visitors,sessions,revenue&interval=day&limit=7"),
    ]);

    const lines = ["*DataFast Traffic Summary*", ""];

    // Overview section
    if (overview && typeof overview === "object" && !Array.isArray(overview)) {
      lines.push("*Overview*");
      for (const [key, val] of Object.entries(overview)) {
        lines.push(`• ${key}: ${val}`);
      }
      lines.push("");
    }

    // Timeseries section
    if (Array.isArray(timeseries) && timeseries.length > 0) {
      lines.push("*Last 7 Days*");
      for (const row of timeseries) {
        const date = row.date ?? row.day ?? "";
        const visitors = row.visitors ?? "-";
        const sessions = row.sessions ?? "-";
        const revenue = row.revenue != null ? `$${row.revenue}` : "-";
        lines.push(`• ${date}  visitors: ${visitors}  sessions: ${sessions}  revenue: ${revenue}`);
      }
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ═══ SEO ══════════════════════════════════════════════════════════════════

server.tool(
  "seo_create_target",
  "Create an SEO keyword target — track a specific keyword or topic for search ranking",
  {
    brandId: z.string().describe("Brand ID"),
    keyword: z.string().describe("Target keyword or phrase"),
    targetUrl: z.string().optional().describe("URL of the content targeting this keyword"),
    priority: z.string().optional().describe("Priority: high | medium | low"),
    searchVolume: z.number().optional().describe("Estimated monthly search volume"),
    difficulty: z.number().optional().describe("Keyword difficulty score 0-100"),
    currentRank: z.number().optional().describe("Current search ranking position"),
    intent: z.string().optional().describe("Search intent: informational | commercial | transactional | navigational"),
    notes: z.string().optional().describe("Strategy notes for this keyword"),
  },
  async (args) => {
    const result = await api("/seo", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "seo_list_targets",
  "List SEO keyword targets for a brand — shows rankings, difficulty, and content coverage",
  {
    brandId: z.string().describe("Brand ID"),
    priority: z.string().optional().describe("Filter by priority: high | medium | low"),
  },
  async ({ brandId, priority }) => {
    const params = new URLSearchParams({ brandId });
    if (priority) params.set("priority", priority);
    const result = await api(`/seo?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "seo_update_target",
  "Update an SEO keyword target — update current rank, add notes, link to published content",
  {
    id: z.string().describe("SEO target ID"),
    currentRank: z.number().optional().describe("Updated current ranking position"),
    targetUrl: z.string().optional().describe("URL of the content now targeting this keyword"),
    notes: z.string().optional().describe("Updated strategy notes"),
    status: z.string().optional().describe("Status: tracking | optimizing | achieved | dropped"),
  },
  async (args) => {
    const result = await api("/seo", {
      method: "PATCH",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ AEO ══════════════════════════════════════════════════════════════════

server.tool(
  "aeo_create_check",
  "Create an AEO (Answer Engine Optimization) check — track how a brand's content answers specific queries in AI responses",
  {
    brandId: z.string().describe("Brand ID"),
    query: z.string().describe("The question or query to monitor in AI answer engines"),
    engine: z.string().optional().describe("AI engine checked: perplexity | chatgpt | gemini | claude | bing_ai"),
    brandMentioned: z.boolean().optional().describe("Whether the brand was mentioned in the AI response"),
    responseSnippet: z.string().optional().describe("The relevant snippet from the AI response"),
    competitorsMentioned: z.array(z.string()).optional().describe("Competitors mentioned in the response"),
    notes: z.string().optional().describe("Strategy notes and optimization ideas"),
    checkedAt: z.string().optional().describe("When this check was performed (ISO string)"),
  },
  async (args) => {
    const result = await api("/aeo", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "aeo_list_checks",
  "List AEO checks for a brand — shows which queries the brand appears in across AI answer engines",
  {
    brandId: z.string().describe("Brand ID"),
    engine: z.string().optional().describe("Filter by AI engine"),
    brandMentioned: z.boolean().optional().describe("Filter to only checks where brand was mentioned"),
  },
  async ({ brandId, engine, brandMentioned }) => {
    const params = new URLSearchParams({ brandId });
    if (engine) params.set("engine", engine);
    if (brandMentioned !== undefined) params.set("brandMentioned", String(brandMentioned));
    const result = await api(`/aeo?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ VIDEO SCRIPTS ════════════════════════════════════════════════════════

server.tool(
  "video_create_script",
  "Create a video script for a brand — includes hook, body, CTA, and production notes",
  {
    brandId: z.string().describe("Brand ID"),
    branchId: z.string().optional().describe("Branch this script is derived from"),
    title: z.string().describe("Video title"),
    platform: z.string().describe("Target platform: youtube | tiktok | instagram_reels | youtube_shorts"),
    hook: z.string().describe("Opening hook — first 3-5 seconds"),
    body: z.string().describe("Main script body"),
    cta: z.string().optional().describe("Call to action"),
    bRoll: z.string().optional().describe("B-roll and visual direction notes"),
    durationSeconds: z.number().optional().describe("Target duration in seconds"),
    thumbnailConcept: z.string().optional().describe("Thumbnail concept/text"),
  },
  async (args) => {
    const result = await api("/video-scripts", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "video_list_scripts",
  "List video scripts for a brand",
  {
    brandId: z.string().describe("Brand ID"),
    platform: z.string().optional().describe("Filter by platform: youtube | tiktok | instagram_reels | youtube_shorts"),
    status: z.string().optional().describe("Filter by status: draft | approved | filmed | published"),
  },
  async ({ brandId, platform, status }) => {
    const params = new URLSearchParams({ brandId });
    if (platform) params.set("platform", platform);
    if (status) params.set("status", status);
    const result = await api(`/video-scripts?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ ADS ══════════════════════════════════════════════════════════════════

server.tool(
  "ad_create_campaign",
  "Create an ad campaign — paid advertising campaign structure for tracking and creative management",
  {
    brandId: z.string().describe("Brand ID"),
    name: z.string().describe("Campaign name"),
    platform: z.string().describe("Ad platform: meta | google | pinterest | tiktok | youtube"),
    objective: z.string().describe("Campaign objective: awareness | traffic | engagement | leads | conversions | sales"),
    budget: z.number().optional().describe("Daily or total budget in dollars"),
    budgetType: z.string().optional().describe("Budget type: daily | lifetime"),
    startDate: z.string().optional().describe("Start date (ISO string)"),
    endDate: z.string().optional().describe("End date (ISO string)"),
    targetAudience: z.string().optional().describe("Target audience description"),
    notes: z.string().optional().describe("Campaign strategy notes"),
  },
  async (args) => {
    const result = await api("/ads", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "ad_list_campaigns",
  "List ad campaigns for a brand",
  {
    brandId: z.string().describe("Brand ID"),
    platform: z.string().optional().describe("Filter by platform"),
    status: z.string().optional().describe("Filter by status: draft | active | paused | completed"),
  },
  async ({ brandId, platform, status }) => {
    const params = new URLSearchParams({ brandId });
    if (platform) params.set("platform", platform);
    if (status) params.set("status", status);
    const result = await api(`/ads?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "ad_create_creative",
  "Create an ad creative within a campaign — copy, visual direction, and format details",
  {
    campaignId: z.string().describe("Ad campaign ID"),
    name: z.string().describe("Creative name/identifier"),
    format: z.string().describe("Ad format: image | video | carousel | story | reel"),
    headline: z.string().optional().describe("Ad headline"),
    primaryText: z.string().describe("Primary ad copy"),
    cta: z.string().optional().describe("Call-to-action button text"),
    destinationUrl: z.string().optional().describe("Landing page URL"),
    visualDirection: z.string().optional().describe("Visual/creative direction notes"),
    assetUrl: z.string().optional().describe("URL to the creative asset if available"),
  },
  async ({ campaignId, ...rest }) => {
    const result = await api(`/ads/${campaignId}/creatives`, {
      method: "POST",
      body: JSON.stringify(rest),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "ad_list_creatives",
  "List ad creatives for a campaign",
  {
    campaignId: z.string().describe("Ad campaign ID"),
    status: z.string().optional().describe("Filter by status: draft | active | paused | rejected"),
  },
  async ({ campaignId, status }) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const query = params.toString() ? `?${params}` : "";
    const result = await api(`/ads/${campaignId}/creatives${query}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ CONTACTS ═════════════════════════════════════════════════════════════

server.tool(
  "contacts_list",
  "List contacts for a brand — email subscribers, customers, collaborators, media contacts",
  {
    brandId: z.string().describe("Brand ID"),
    type: z.string().optional().describe("Filter by contact type: subscriber | customer | collaborator | media | prospect"),
    tag: z.string().optional().describe("Filter by tag"),
    limit: z.number().optional().describe("Max contacts to return"),
  },
  async ({ brandId, type, tag, limit }) => {
    const params = new URLSearchParams({ brandId });
    if (type) params.set("type", type);
    if (tag) params.set("tag", tag);
    if (limit) params.set("limit", String(limit));
    const result = await api(`/contacts?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "contacts_create",
  "Create a new contact for a brand",
  {
    brandId: z.string().describe("Brand ID"),
    name: z.string().describe("Full name"),
    email: z.string().optional().describe("Email address"),
    phone: z.string().optional().describe("Phone number"),
    type: z.string().optional().describe("Contact type: subscriber | customer | collaborator | media | prospect"),
    tags: z.array(z.string()).optional().describe("Tags for segmentation"),
    source: z.string().optional().describe("How they were added: manual | import | lead_magnet | form | outreach"),
    notes: z.string().optional().describe("Notes about this contact"),
  },
  async (args) => {
    const result = await api("/contacts", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "contacts_search",
  "Search contacts for a brand by name, email, or keyword",
  {
    brandId: z.string().describe("Brand ID"),
    query: z.string().describe("Search query — searches name, email, notes"),
  },
  async ({ brandId, query }) => {
    const params = new URLSearchParams({ brandId, search: query });
    const result = await api(`/contacts?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ LEAD MAGNETS ═════════════════════════════════════════════════════════

server.tool(
  "lead_magnet_create",
  "Create a lead magnet record — freebie, checklist, template, guide, or challenge used to grow the email list",
  {
    brandId: z.string().describe("Brand ID"),
    title: z.string().describe("Lead magnet title"),
    type: z.string().describe("Type: checklist | template | guide | ebook | challenge | quiz | webinar | tool | video_series"),
    description: z.string().describe("What it delivers and why people should want it"),
    targetAudience: z.string().optional().describe("Who this is for"),
    contentOutline: z.string().optional().describe("Outline or structure of the lead magnet content"),
    deliveryMethod: z.string().optional().describe("How it's delivered: email | download | course_platform | notion"),
    landingPageUrl: z.string().optional().describe("Landing page URL once live"),
    status: z.string().optional().describe("Status: idea | in_progress | live | paused"),
  },
  async (args) => {
    const result = await api("/lead-magnets", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "lead_magnet_list",
  "List lead magnets for a brand — shows all freebies and opt-in offers",
  {
    brandId: z.string().describe("Brand ID"),
    status: z.string().optional().describe("Filter by status: idea | in_progress | live | paused"),
  },
  async ({ brandId, status }) => {
    const params = new URLSearchParams({ brandId });
    if (status) params.set("status", status);
    const result = await api(`/lead-magnets?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ PLATFORM ACCOUNTS ════════════════════════════════════════════════════

server.tool(
  "platform_accounts_list",
  "List connected platform accounts for a brand — social, email, ads, and publishing platform credentials and stats",
  {
    brandId: z.string().describe("Brand ID"),
    platform: z.string().optional().describe("Filter by platform: instagram | youtube | tiktok | pinterest | linkedin | twitter | email | shopify"),
  },
  async ({ brandId, platform }) => {
    const params = new URLSearchParams({ brandId });
    if (platform) params.set("platform", platform);
    const result = await api(`/platform-accounts?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "platform_accounts_create",
  "Register a platform account for a brand — link a social or publishing account for tracking and publishing",
  {
    brandId: z.string().describe("Brand ID"),
    platform: z.string().describe("Platform: instagram | youtube | tiktok | pinterest | linkedin | twitter | email | shopify"),
    handle: z.string().optional().describe("Username or handle on the platform"),
    accountId: z.string().optional().describe("Platform-specific account ID"),
    accountUrl: z.string().optional().describe("Full URL to the profile or account"),
    followerCount: z.number().optional().describe("Current follower/subscriber count"),
    notes: z.string().optional().describe("Additional account notes"),
  },
  async (args) => {
    const result = await api("/platform-accounts", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ SLACK REPORTING ═════════════════════════════════════════════════════

server.tool(
  "slack_daily_report",
  "Generate a formatted daily traffic report for a brand. Pulls DataFast overview and referrers, formats for Slack. Returns the formatted message text — send it via Slack MCP.",
  {
    brandId: z.string().describe("Brand ID to report on"),
    brandName: z.string().optional().describe("Brand display name (avoids extra lookup)"),
  },
  async ({ brandId, brandName }) => {
    try {
      // Pull overview and referrers from DataFast via the Sweet Heat API
      const [overviewRes, referrersRes] = await Promise.all([
        api("/analytics/pull", {
          method: "POST",
          body: JSON.stringify({ action: "overview", brandId }),
        }),
        api("/analytics/pull", {
          method: "POST",
          body: JSON.stringify({ action: "referrers", brandId }),
        }),
      ]);

      const overview = overviewRes?.data ?? {};
      const referrers = referrersRes?.data ?? [];

      // Get brand name if not provided
      let name = brandName;
      if (!name) {
        try {
          const brand = await api(`/brands/${brandId}`);
          name = brand?.name ?? "Unknown Brand";
        } catch { name = "Unknown Brand"; }
      }

      // Extract metrics
      const visitors = overview.visitors ?? overview.pageviews ?? "N/A";
      const revenue = overview.revenue != null ? `$${Number(overview.revenue).toFixed(2)}` : "N/A";

      // Top 3 referrers
      const topSources = Array.isArray(referrers)
        ? referrers.slice(0, 3).map(r => {
            const src = r.referrer ?? r.source ?? r.name ?? "unknown";
            const count = r.visitors ?? r.visits ?? r.count ?? "?";
            return `${src} (${count})`;
          }).join(" | ")
        : "N/A";

      // Count branches published yesterday (best-effort)
      let publishedCount = "N/A";
      try {
        const seeds = await api(`/seeds?brandId=${brandId}`);
        // Rough proxy: count seeds with recent activity
        publishedCount = String(Array.isArray(seeds) ? seeds.filter(s => s.status === "published").length : 0);
      } catch { /* ignore */ }

      const report = [
        `📊 *Daily Traffic Report — ${name}*`,
        `Yesterday: *${visitors}* visitors | *${revenue}* revenue`,
        `Top sources: ${topSources}`,
        `Published: ${publishedCount} pieces`,
        ``,
        `_Generated ${new Date().toISOString().slice(0, 10)}_`,
      ].join("\n");

      return { content: [{ type: "text", text: report }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error generating daily report: ${err.message}` }], isError: true };
    }
  }
);

server.tool(
  "slack_weekly_scorecard",
  "Generate a formatted weekly scorecard for a brand. Pulls 7-day timeseries from DataFast, computes trends and platform breakdown. Returns formatted Slack message text.",
  {
    brandId: z.string().describe("Brand ID to report on"),
    brandName: z.string().optional().describe("Brand display name (avoids extra lookup)"),
  },
  async ({ brandId, brandName }) => {
    try {
      // Pull 7-day timeseries and referrers
      const [timeseriesRes, referrersRes] = await Promise.all([
        api("/analytics/pull", {
          method: "POST",
          body: JSON.stringify({ action: "timeseries", brandId }),
        }),
        api("/analytics/pull", {
          method: "POST",
          body: JSON.stringify({ action: "referrers", brandId }),
        }),
      ]);

      const timeseries = timeseriesRes?.data ?? [];
      const referrers = referrersRes?.data ?? [];

      // Get brand name if not provided
      let name = brandName;
      if (!name) {
        try {
          const brand = await api(`/brands/${brandId}`);
          name = brand?.name ?? "Unknown Brand";
        } catch { name = "Unknown Brand"; }
      }

      // Compute weekly totals
      const days = Array.isArray(timeseries) ? timeseries : [];
      const totalVisitors = days.reduce((sum, d) => sum + (d.visitors ?? 0), 0);
      const totalRevenue = days.reduce((sum, d) => sum + (d.revenue ?? 0), 0);

      // Split into this week (last 7 days) vs previous (if 14 days available)
      const thisWeekDays = days.slice(0, 7);
      const thisWeekVisitors = thisWeekDays.reduce((sum, d) => sum + (d.visitors ?? 0), 0);
      const thisWeekRevenue = thisWeekDays.reduce((sum, d) => sum + (d.revenue ?? 0), 0);

      // Platform breakdown from referrers
      const platformMap = {};
      if (Array.isArray(referrers)) {
        for (const r of referrers) {
          const src = (r.referrer ?? r.source ?? r.name ?? "").toLowerCase();
          if (src.includes("pinterest")) platformMap["Pinterest"] = (platformMap["Pinterest"] || 0) + (r.visitors ?? 0);
          else if (src.includes("instagram")) platformMap["Instagram"] = (platformMap["Instagram"] || 0) + (r.visitors ?? 0);
          else if (src.includes("twitter") || src.includes("t.co") || src.includes("x.com")) platformMap["Twitter/X"] = (platformMap["Twitter/X"] || 0) + (r.visitors ?? 0);
          else if (src.includes("facebook") || src.includes("fb.com")) platformMap["Facebook"] = (platformMap["Facebook"] || 0) + (r.visitors ?? 0);
          else if (src.includes("linkedin")) platformMap["LinkedIn"] = (platformMap["LinkedIn"] || 0) + (r.visitors ?? 0);
          else if (src.includes("tiktok")) platformMap["TikTok"] = (platformMap["TikTok"] || 0) + (r.visitors ?? 0);
        }
      }

      const platformBreakdown = Object.entries(platformMap)
        .sort((a, b) => b[1] - a[1])
        .map(([platform, count]) => `${platform}: ${count}`)
        .join(" | ") || "No platform data";

      // Top content by referrer volume (best proxy without per-content data)
      const topContent = Array.isArray(referrers)
        ? referrers.slice(0, 3).map(r => {
            const src = r.referrer ?? r.source ?? r.name ?? "unknown";
            const rev = r.revenue != null ? ` ($${Number(r.revenue).toFixed(2)})` : "";
            return `${src}${rev}`;
          }).join("\n  ")
        : "N/A";

      const report = [
        `📈 *Weekly Scorecard — ${name}*`,
        `This week: *${thisWeekVisitors}* visitors | *$${thisWeekRevenue.toFixed(2)}* revenue`,
        `Top sources:`,
        `  ${topContent}`,
        `Platform breakdown: ${platformBreakdown}`,
        ``,
        `_Week of ${new Date().toISOString().slice(0, 10)}_`,
      ].join("\n");

      return { content: [{ type: "text", text: report }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error generating weekly scorecard: ${err.message}` }], isError: true };
    }
  }
);

server.tool(
  "slack_ops_update",
  "Format a daily ops update message for Slack. Takes structured data about what was done, what's planned, and what needs human input. Returns formatted Slack message text.",
  {
    brandName: z.string().optional().describe("Brand display name"),
    doneYesterday: z.array(z.string()).describe("List of things completed yesterday"),
    plannedToday: z.array(z.string()).describe("List of things planned for today"),
    needsHuman: z.array(z.string()).optional().describe("Items that need human decision or action"),
    metrics: z.object({
      seedsPitched: z.number().optional(),
      draftsWritten: z.number().optional(),
      contentPublished: z.number().optional(),
      outreachSent: z.number().optional(),
    }).optional().describe("Optional daily metrics"),
  },
  async ({ brandName, doneYesterday, plannedToday, needsHuman, metrics }) => {
    const name = brandName ?? "Content Factory";

    const doneLines = doneYesterday.map(d => `  ✅ ${d}`).join("\n");
    const planLines = plannedToday.map(p => `  🎯 ${p}`).join("\n");

    let humanLines = "";
    if (needsHuman && needsHuman.length > 0) {
      humanLines = `\n*🙋 Needs Human:*\n${needsHuman.map(h => `  ⚠️ ${h}`).join("\n")}`;
    }

    let metricsLine = "";
    if (metrics) {
      const parts = [];
      if (metrics.seedsPitched) parts.push(`${metrics.seedsPitched} seeds`);
      if (metrics.draftsWritten) parts.push(`${metrics.draftsWritten} drafts`);
      if (metrics.contentPublished) parts.push(`${metrics.contentPublished} published`);
      if (metrics.outreachSent) parts.push(`${metrics.outreachSent} outreach`);
      if (parts.length > 0) {
        metricsLine = `\n📊 ${parts.join(" | ")}`;
      }
    }

    const report = [
      `🏭 *Daily Ops — ${name}*`,
      ``,
      `*Done Yesterday:*`,
      doneLines,
      ``,
      `*Planned Today:*`,
      planLines,
      humanLines,
      metricsLine,
      ``,
      `_${new Date().toISOString().slice(0, 10)}_`,
    ].filter(Boolean).join("\n");

    return { content: [{ type: "text", text: report }] };
  }
);

// ═══ CANVA VISUAL GENERATION ═════════════════════════════════════════════

const CANVA_BRAND_KIT_ID = "kAG_1wVMiiw";

server.tool(
  "canva_prepare_pin",
  "Prepare Canva generation parameters for a Pinterest pin design. Returns structured data for the agent to pass to the Canva MCP's generate-design tool.",
  {
    title: z.string().describe("Pin title text"),
    description: z.string().describe("Pin description text"),
    hookAngle: z.string().describe("The hook angle for this pin variation (e.g. 'Main Hook', 'Question', 'List / Tips')"),
    brandName: z.string().describe("Brand name for context in the design query"),
  },
  async ({ title, description, hookAngle, brandName }) => {
    const query = `Pinterest pin for ${brandName}. Title: "${title}". Angle: ${hookAngle}. ${description}. Style: clean, save-worthy, text-overlay on branded background.`;

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          tool: "generate-design",
          parameters: {
            design_type: "pinterest_pin",
            query,
            brand_kit_id: CANVA_BRAND_KIT_ID,
          },
          context: {
            title,
            description,
            hookAngle,
            brandName,
          },
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "canva_prepare_instagram_post",
  "Prepare Canva generation parameters for an Instagram post design. Returns structured data for the agent to pass to the Canva MCP's generate-design tool.",
  {
    title: z.string().describe("Post title or headline text"),
    description: z.string().describe("Caption or content summary for visual direction"),
    hookAngle: z.string().describe("Visual angle — e.g. 'quote card', 'tip graphic', 'announcement'"),
    brandName: z.string().describe("Brand name for context in the design query"),
  },
  async ({ title, description, hookAngle, brandName }) => {
    const query = `Instagram post for ${brandName}. Headline: "${title}". Style: ${hookAngle}. ${description}. Square format, bold typography, on-brand colors.`;

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          tool: "generate-design",
          parameters: {
            design_type: "instagram_post",
            query,
            brand_kit_id: CANVA_BRAND_KIT_ID,
          },
          context: {
            title,
            description,
            hookAngle,
            brandName,
          },
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "canva_prepare_carousel",
  "Prepare Canva generation parameters for a carousel design (Instagram or LinkedIn). Returns structured data for the agent to pass to the Canva MCP's generate-design tool.",
  {
    title: z.string().describe("Carousel cover title"),
    slidesText: z.string().describe("All slide text content (SLIDE 1: ... SLIDE 2: ... etc.)"),
    slideCount: z.number().describe("Number of slides in the carousel"),
    brandName: z.string().describe("Brand name for context in the design query"),
  },
  async ({ title, slidesText, slideCount, brandName }) => {
    const query = `${slideCount}-slide carousel for ${brandName}. Cover: "${title}". Swipeable educational carousel with consistent branded slide design. Each slide has a heading and short body text. ${slidesText.slice(0, 500)}`;

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          tool: "generate-design",
          parameters: {
            design_type: "instagram_post",
            query,
            brand_kit_id: CANVA_BRAND_KIT_ID,
          },
          context: {
            title,
            slideCount,
            slidesText,
            brandName,
            note: "Carousel uses instagram_post design_type — each slide is a square frame. Generate the cover slide first, then replicate the style for remaining slides.",
          },
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "canva_prepare_facebook_post",
  "Prepare Canva generation parameters for a Facebook post design. Returns structured data for the agent to pass to the Canva MCP's generate-design tool.",
  {
    title: z.string().describe("Post headline or key message"),
    description: z.string().describe("Post content summary for visual direction"),
    hookAngle: z.string().describe("Visual angle — e.g. 'engagement graphic', 'link preview image', 'shareable quote'"),
    brandName: z.string().describe("Brand name for context in the design query"),
  },
  async ({ title, description, hookAngle, brandName }) => {
    const query = `Facebook post graphic for ${brandName}. Headline: "${title}". Style: ${hookAngle}. ${description}. Landscape format optimized for Facebook feed, clear text hierarchy.`;

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          tool: "generate-design",
          parameters: {
            design_type: "facebook_post",
            query,
            brand_kit_id: CANVA_BRAND_KIT_ID,
          },
          context: {
            title,
            description,
            hookAngle,
            brandName,
          },
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "canva_request_template",
  "Format a template request message for Slack. The agent sends this to #content-factory to request a human-designed Canva template.",
  {
    templateType: z.string().describe("Type of template needed — e.g. 'Pinterest pin', 'Instagram carousel', 'Story template'"),
    description: z.string().describe("What the template is for and what content it will hold"),
    designBrief: z.string().describe("Visual direction — colors, layout, mood, text placement, reference examples"),
    brandName: z.string().describe("Brand name this template is for"),
  },
  async ({ templateType, description, designBrief, brandName }) => {
    const message = [
      `🎨 Template Request`,
      `Type: ${templateType}`,
      `Description: ${description}`,
      `Design Brief: ${designBrief}`,
      `Brand: ${brandName}`,
      ``,
      `@Aimee — Can you create this in Canva and share the template ID? Reply here or DM me.`,
    ].join("\n");

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          slackMessage: message,
          channel: "#content-factory",
          templateType,
          brandName,
        }, null, 2),
      }],
    };
  }
);

// ═══ CONTENT CALENDAR ════════════════════════════════════════════════════

server.tool(
  "calendar_schedule_content",
  "Prepare a Google Calendar event for scheduled content. Returns structured data for the agent to pass to the gcal_create_event MCP tool. Creates a 15-minute marker event with content details.",
  {
    title: z.string().describe("Content title"),
    platform: z.string().describe("Platform: Pinterest | Instagram | TikTok | LinkedIn | Twitter/X | Facebook | Blog | Email | YouTube"),
    scheduledAt: z.string().describe("When the content is scheduled (ISO string)"),
    contentId: z.string().optional().describe("Content ID for tracking"),
    utmUrl: z.string().optional().describe("UTM-tagged URL for the content"),
    description: z.string().optional().describe("Additional description or notes"),
  },
  async ({ title, platform, scheduledAt, contentId, utmUrl, description }) => {
    const eventTitle = `[${platform}] ${title}`;

    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 min marker

    const descriptionParts = [
      `Content scheduled via Sweet Heat`,
      contentId ? `Content ID: ${contentId}` : null,
      utmUrl ? `UTM URL: ${utmUrl}` : null,
      description ? `\n${description}` : null,
    ].filter(Boolean).join("\n");

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          tool: "gcal_create_event",
          parameters: {
            summary: eventTitle,
            description: descriptionParts,
            start: { dateTime: startTime.toISOString() },
            end: { dateTime: endTime.toISOString() },
          },
          context: {
            title,
            platform,
            contentId,
            utmUrl,
            note: "Pass the parameters object to gcal_create_event to create the calendar event.",
          },
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "calendar_get_content_schedule",
  "Get all scheduled and recently published content for a date range, formatted as a calendar view",
  {
    brandId: z.string().describe("Brand ID"),
    startDate: z.string().describe("Start date (ISO string)"),
    endDate: z.string().describe("End date (ISO string)"),
  },
  async ({ brandId, startDate, endDate }) => {
    const params = new URLSearchParams({
      brandId,
      startDate,
      endDate,
    });
    // Fetch scheduled branches via the API
    const scheduled = await api(`/calendar/schedule?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(scheduled, null, 2) }] };
  }
);

// ═══ SEASONAL PLANNER ════════════════════════════════════════════════════

server.tool(
  "seasonal_get_upcoming",
  "Get upcoming seasonal events and holidays in the next 90 days with content coverage status. Shows which events have content planned and which need attention.",
  {
    brandId: z.string().describe("Brand ID"),
    lookAheadDays: z.number().optional().describe("Days to look ahead (default 90)"),
  },
  async ({ brandId, lookAheadDays }) => {
    const params = new URLSearchParams({ brandId });
    if (lookAheadDays) params.set("lookAheadDays", String(lookAheadDays));
    const result = await api(`/seasonal/upcoming?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "seasonal_check_coverage",
  "Check content coverage for upcoming seasonal events. Identifies gaps and generates research briefs for events that need content.",
  {
    brandId: z.string().describe("Brand ID"),
    lookAheadDays: z.number().optional().describe("Days to look ahead (default 90)"),
  },
  async ({ brandId, lookAheadDays }) => {
    const result = await api("/seasonal/coverage", {
      method: "POST",
      body: JSON.stringify({ brandId, lookAheadDays }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ META-OODA (System Self-Review) ══════════════════════════════════════

server.tool(
  "meta_ooda_generate_review",
  "Generate a system self-review for a brand — analyzes last 7 days of pipeline data including approval rates, throughput, velocity, bottlenecks, and quality trends. Stores the review as a research brief.",
  {
    brandId: z.string().describe("Brand ID to review"),
  },
  async ({ brandId }) => {
    const result = await api("/meta-ooda/review", {
      method: "POST",
      body: JSON.stringify({ brandId }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "meta_ooda_get_latest",
  "Get the most recent system review for a brand — shows pipeline health, bottlenecks, and recommendations",
  {
    brandId: z.string().describe("Brand ID"),
  },
  async ({ brandId }) => {
    const result = await api(`/meta-ooda/latest?brandId=${brandId}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "meta_ooda_check_bottlenecks",
  "Quick check for pipeline bottlenecks — stuck branches, pending seeds, and other blockers that need attention",
  {
    brandId: z.string().describe("Brand ID"),
  },
  async ({ brandId }) => {
    const result = await api(`/meta-ooda/bottlenecks?brandId=${brandId}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ A/B TESTS ═══════════════════════════════════════════════════════════

server.tool(
  "ab_test_create",
  "Create an A/B test comparing two content variants — track which hook, headline, CTA, or template performs better",
  {
    brandId: z.string().describe("Brand ID"),
    name: z.string().describe("Test name, e.g. 'Pin hook test: bedtime vs identity'"),
    type: z.string().describe("What's being tested: headline | hook | cta | template | image"),
    variantA: z.object({
      branchId: z.string().optional().describe("Branch ID for variant A"),
      contentIdRef: z.string().optional().describe("Content ID reference for variant A"),
      description: z.string().describe("Description of variant A"),
    }),
    variantB: z.object({
      branchId: z.string().optional().describe("Branch ID for variant B"),
      contentIdRef: z.string().optional().describe("Content ID reference for variant B"),
      description: z.string().describe("Description of variant B"),
    }),
    endsAt: z.number().optional().describe("Unix timestamp when the test should auto-evaluate"),
  },
  async (args) => {
    const result = await api("/ab-tests", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "ab_test_list",
  "List A/B tests for a brand — see running, completed, and declared winners",
  {
    brandId: z.string().describe("Brand ID"),
    status: z.string().optional().describe("Filter by status: running | completed | winner_declared"),
  },
  async ({ brandId, status }) => {
    const params = new URLSearchParams({ brandId });
    if (status) params.set("status", status);
    const result = await api(`/ab-tests?${params}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "ab_test_update_metrics",
  "Update performance metrics for an A/B test variant — impressions, clicks, saves, revenue",
  {
    id: z.string().describe("A/B test ID"),
    variant: z.enum(["A", "B"]).describe("Which variant to update"),
    metrics: z.object({
      impressions: z.number().optional().describe("Total impressions"),
      clicks: z.number().optional().describe("Total clicks"),
      saves: z.number().optional().describe("Total saves (Pinterest)"),
      revenue: z.number().optional().describe("Total revenue attributed"),
    }),
  },
  async (args) => {
    const result = await api("/ab-tests", {
      method: "POST",
      body: JSON.stringify({ action: "update_metrics", ...args }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "ab_test_declare_winner",
  "Declare a winner for an A/B test — marks the test as completed with reason",
  {
    id: z.string().describe("A/B test ID"),
    winner: z.enum(["A", "B"]).describe("Which variant won"),
    winnerReason: z.string().describe("Why this variant won — cite the data"),
  },
  async (args) => {
    const result = await api("/ab-tests", {
      method: "POST",
      body: JSON.stringify({ action: "declare_winner", ...args }),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ AUDIENCE SEGMENTS ═══════════════════════════════════════════════════

server.tool(
  "audience_segment_create",
  "Create an audience segment — a psychographic profile of a target audience group for content targeting",
  {
    brandId: z.string().describe("Brand ID"),
    name: z.string().describe("Segment name, e.g. 'First-time moms'"),
    description: z.string().describe("Detailed segment description"),
    painPoints: z.array(z.string()).describe("Pain points this segment experiences"),
    desires: z.array(z.string()).describe("What this segment wants/aspires to"),
    language: z.array(z.string()).optional().describe("Words and phrases this segment uses"),
    platforms: z.array(z.string()).optional().describe("Platforms where this segment is most active"),
    contentPillars: z.array(z.string()).optional().describe("Content pillars that resonate with this segment"),
    hookStyles: z.array(z.string()).optional().describe("Hook styles that work best for this segment"),
  },
  async (args) => {
    const result = await api("/audience-segments", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "audience_segment_list",
  "List audience segments for a brand — psychographic profiles used for content targeting",
  {
    brandId: z.string().describe("Brand ID"),
  },
  async ({ brandId }) => {
    const result = await api(`/audience-segments?brandId=${brandId}`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// ═══ START ═════════════════════════════════════════════════════════════════

const transport = new StdioServerTransport();
await server.connect(transport);
