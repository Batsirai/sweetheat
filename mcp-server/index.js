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

    // Notify via Slack
    const purposeTag = args.purpose ? ` [${args.purpose}]` : "";
    await notifySlack(`🌱 New seed pitched${purposeTag}: "${args.title}"\n${args.reasoning || ""}\n→ Review in Sweet Heat`);

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

// ═══ START ═════════════════════════════════════════════════════════════════

const transport = new StdioServerTransport();
await server.connect(transport);
