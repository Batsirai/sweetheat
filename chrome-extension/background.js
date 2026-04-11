// Sweet Heat Chrome Extension — Background Service Worker

const DEFAULT_API = "https://mac.tailcb4df0.ts.net/api";
const DEFAULT_KEY = "sc_agent_2026_kX9mPqR7vN3jL5wT8yF1";

async function getConfig() {
  const data = await chrome.storage.sync.get(["apiUrl", "apiKey"]);
  return {
    apiUrl: data.apiUrl || DEFAULT_API,
    apiKey: data.apiKey || DEFAULT_KEY,
  };
}

async function sendToInbox(url, title, content, sourcePlatform) {
  const config = await getConfig();
  const res = await fetch(`${config.apiUrl}/inbox`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      type: "url",
      url,
      title,
      content,
      sourcePlatform,
    }),
  });
  return res.ok;
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

// Context menu: right-click on page
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "send-page",
    title: "Send to Sweet Heat",
    contexts: ["page", "link"],
  });

  chrome.contextMenus.create({
    id: "send-selection",
    title: "Send selection to Sweet Heat",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.linkUrl || info.pageUrl || tab.url;
  const title = tab.title || url;
  const platform = detectPlatform(url);

  if (info.menuItemId === "send-selection") {
    const ok = await sendToInbox(url, title, info.selectionText, platform);
    showBadge(ok);
  } else {
    const ok = await sendToInbox(url, title, "", platform);
    showBadge(ok);
  }
});

// Message from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "send") {
    sendToInbox(msg.url, msg.title, msg.content || "", msg.platform || "web")
      .then((ok) => sendResponse({ ok }))
      .catch(() => sendResponse({ ok: false }));
    return true; // async response
  }
});

function showBadge(ok) {
  chrome.action.setBadgeText({ text: ok ? "+" : "!" });
  chrome.action.setBadgeBackgroundColor({ color: ok ? "#16a34a" : "#ef4444" });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
}
