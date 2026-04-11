const DEFAULT_API = "https://mac.tailcb4df0.ts.net/api";
const DEFAULT_KEY = "sc_agent_2026_kX9mPqR7vN3jL5wT8yF1";

let currentTab = null;

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
  if (url.includes("news.google.com")) return "google_alert";
  if (url.includes("tiktok.com")) return "tiktok";
  return "web";
}

// Load current tab info + brands
async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  document.getElementById("pageTitle").textContent = tab.title || "Untitled";
  document.getElementById("pageUrl").textContent = tab.url;
  document.getElementById("platform").textContent = detectPlatform(tab.url);

  // Load brands for the dropdown
  try {
    const config = await getConfig();
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
      // Restore last selected brand
      const saved = await chrome.storage.sync.get(["lastBrandId"]);
      if (saved.lastBrandId) select.value = saved.lastBrandId;
    }
  } catch {
    // Offline or can't reach — that's ok, brand is optional
  }
}

// Send to inbox
document.getElementById("sendBtn").addEventListener("click", async () => {
  const btn = document.getElementById("sendBtn");
  const status = document.getElementById("status");
  btn.disabled = true;
  btn.textContent = "Sending...";

  const notes = document.getElementById("notes").value;
  const brandId = document.getElementById("brandSelect").value;

  // Save last selected brand
  if (brandId) chrome.storage.sync.set({ lastBrandId: brandId });

  try {
    const config = await getConfig();
    const res = await fetch(`${config.apiUrl}/inbox`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        type: "url",
        url: currentTab.url,
        title: currentTab.title,
        content: notes || undefined,
        brandId: brandId || undefined,
        sourcePlatform: detectPlatform(currentTab.url),
      }),
    });

    if (res.ok) {
      status.className = "status ok";
      status.textContent = "Sent to inbox!";
      btn.textContent = "Sent!";
      setTimeout(() => window.close(), 1500);
    } else {
      throw new Error(`${res.status}`);
    }
  } catch (err) {
    status.className = "status err";
    status.textContent = `Failed: ${err.message}`;
    btn.disabled = false;
    btn.textContent = "Retry";
  }
});

init();
