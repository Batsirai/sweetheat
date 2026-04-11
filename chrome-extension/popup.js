const DEFAULT_API = "https://sweet-content.batsirai.workers.dev/api";
const DEFAULT_KEY = "sc_agent_2026_kX9mPqR7vN3jL5wT8yF1";

let currentTab = null;
let extractedContent = "";

async function getConfig() {
  const data = await chrome.storage.sync.get(["apiUrl", "apiKey"]);
  return {
    apiUrl: data.apiUrl || DEFAULT_API,
    apiKey: data.apiKey || DEFAULT_KEY,
  };
}

function detectPlatform(url) {
  if (url.includes("x.com") || url.includes("twitter.com")) return "twitter";
  if (url.includes("reddit.com")) return "reddit";
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("perplexity.ai")) return "perplexity";
  if (url.includes("tiktok.com")) return "tiktok";
  return "web";
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  document.getElementById("pageTitle").textContent = tab.title || "Untitled";
  document.getElementById("pageUrl").textContent = tab.url;
  document.getElementById("platform").textContent = detectPlatform(tab.url);

  // Extract content
  try {
    let response = null;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { action: "extractContent" });
    } catch {}

    if (!response || !response.content || response.content.length < 50) {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const el = document.querySelector("article") || document.querySelector('[role="main"]') || document.querySelector("main") || document.body;
          return { content: el?.innerText?.slice(0, 50000) || "", title: document.title };
        }
      });
      response = result?.result;
    }

    if (response?.content && response.content.length > 50) {
      extractedContent = response.content;
      const statusEl = document.getElementById("contentStatus");
      statusEl.textContent = `${Math.round(extractedContent.length / 1000)}k chars`;
      statusEl.className = "badge ok";
      if (response.title) document.getElementById("pageTitle").textContent = response.title;
    } else {
      document.getElementById("contentStatus").textContent = "No content";
      document.getElementById("contentStatus").className = "badge warn";
    }
  } catch {
    document.getElementById("contentStatus").textContent = "Extract failed";
    document.getElementById("contentStatus").className = "badge warn";
  }

  // Load brands
  const config = await getConfig();
  try {
    const res = await fetch(`${config.apiUrl}/brands`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    if (res.ok) {
      const brands = await res.json();
      const select = document.getElementById("brandSelect");
      brands.forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b._id;
        opt.textContent = b.name;
        select.appendChild(opt);
      });
      const saved = await chrome.storage.sync.get(["lastBrandId"]);
      if (saved.lastBrandId) {
        select.value = saved.lastBrandId;
        loadTopics(saved.lastBrandId);
      }
    }
  } catch {}
}

document.getElementById("brandSelect").addEventListener("change", (e) => {
  const brandId = e.target.value;
  if (brandId) {
    chrome.storage.sync.set({ lastBrandId: brandId });
    loadTopics(brandId);
  }
});

async function loadTopics(brandId) {
  const config = await getConfig();
  const topicSelect = document.getElementById("topicSelect");
  topicSelect.innerHTML = '<option value="">Auto (default topic)</option>';
  try {
    const res = await fetch(`${config.apiUrl}/ingest?brandId=${brandId}`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    if (res.ok) {
      const topics = await res.json();
      if (topics.length > 0) {
        topicSelect.style.display = "";
        topics.forEach((t) => {
          const opt = document.createElement("option");
          opt.value = t._id;
          opt.textContent = t.name;
          topicSelect.appendChild(opt);
        });
        const saved = await chrome.storage.sync.get(["lastTopicId"]);
        if (saved.lastTopicId) topicSelect.value = saved.lastTopicId;
      }
    }
  } catch {}
}

document.getElementById("knowledgeBtn").addEventListener("click", () => send(false));
document.getElementById("seedBtn").addEventListener("click", () => send(true));

async function send(asSeed) {
  const knowledgeBtn = document.getElementById("knowledgeBtn");
  const seedBtn = document.getElementById("seedBtn");
  const status = document.getElementById("status");
  knowledgeBtn.disabled = true;
  seedBtn.disabled = true;

  const brandId = document.getElementById("brandSelect").value;
  const topicId = document.getElementById("topicSelect").value;
  const notes = document.getElementById("notes").value;
  const manualContent = document.getElementById("manualContent")?.value || "";

  if (!brandId) {
    status.className = "status err";
    status.textContent = "Pick a brand first";
    knowledgeBtn.disabled = false;
    seedBtn.disabled = false;
    return;
  }

  if (topicId) chrome.storage.sync.set({ lastTopicId: topicId });

  const finalContent = manualContent || extractedContent || notes || "";

  try {
    const config = await getConfig();
    const res = await fetch(`${config.apiUrl}/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        brandId,
        topicId: topicId || undefined,
        url: currentTab.url,
        title: document.getElementById("pageTitle").textContent,
        content: finalContent,
        sourcePlatform: detectPlatform(currentTab.url),
        asSeed: asSeed,
      }),
    });

    if (res.ok) {
      status.className = "status ok";
      status.textContent = asSeed ? "Seed created!" : "Ingested!";
      setTimeout(() => window.close(), 1200);
    } else {
      throw new Error(`${res.status}`);
    }
  } catch (err) {
    status.className = "status err";
    status.textContent = `Failed: ${err.message}`;
    knowledgeBtn.disabled = false;
    seedBtn.disabled = false;
  }
}

init();
