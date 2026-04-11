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
  if (url.includes("news.google.com")) return "google_alert";
  if (url.includes("tiktok.com")) return "tiktok";
  return "web";
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  document.getElementById("pageTitle").textContent = tab.title || "Untitled";
  document.getElementById("pageUrl").textContent = tab.url;
  document.getElementById("platform").textContent = detectPlatform(tab.url);

  // Try to extract content from the page
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const url = window.location.href;

        // X.com Articles (long-form)
        const articleView = document.querySelector('[data-testid="twitterArticleReadView"]');
        if (articleView) {
          const titleEl = document.querySelector('[data-testid="twitter-article-title"]');
          const bodyEl = articleView.querySelector('[data-testid="longformRichTextComponent"]')
            || articleView.querySelector('.DraftEditor-root')
            || articleView;
          const author = document.querySelector('[data-testid="User-Name"]')?.innerText || "";
          const statsEl = articleView.querySelector('[role="group"]');
          return {
            content: `# ${titleEl?.innerText || ""}\nAuthor: ${author}\n${statsEl?.getAttribute("aria-label") || ""}\n\n${bodyEl?.innerText || ""}`,
            title: titleEl?.innerText || document.title,
            platform: "twitter"
          };
        }

        // X.com Tweets
        if (url.includes("x.com") || url.includes("twitter.com")) {
          const tweets = Array.from(document.querySelectorAll('[data-testid="tweetText"]')).map(el => el.innerText);
          const author = document.querySelector('[data-testid="User-Name"]')?.innerText || "";
          const statsEl = document.querySelector('article [role="group"]');
          if (tweets.length > 0) {
            return {
              content: `Author: ${author}\n${statsEl?.getAttribute("aria-label") || ""}\n\n${tweets.join("\n\n")}`,
              title: tweets[0]?.slice(0, 100) || document.title,
              platform: "twitter"
            };
          }
        }

        // Generic: article, main, or body
        const el = document.querySelector("article") || document.querySelector('[role="main"]') || document.querySelector("main") || document.body;
        return {
          content: el?.innerText?.slice(0, 50000) || "",
          title: document.title,
          platform: "web"
        };
      }
    });

    if (result?.result?.content && result.result.content.length > 50) {
      extractedContent = result.result.content;
      document.getElementById("contentStatus").textContent = `Extracted ${Math.round(extractedContent.length / 1000)}k chars`;
      document.getElementById("contentStatus").className = "content-status ok";
      if (result.result.title) {
        document.getElementById("pageTitle").textContent = result.result.title;
      }
    } else {
      document.getElementById("contentStatus").textContent = "Could not extract content. Paste manually below.";
      document.getElementById("contentStatus").className = "content-status warn";
    }
  } catch (err) {
    document.getElementById("contentStatus").textContent = "Cannot access page content. Paste manually below.";
    document.getElementById("contentStatus").className = "content-status warn";
  }

  // Load brands
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
      const saved = await chrome.storage.sync.get(["lastBrandId"]);
      if (saved.lastBrandId) select.value = saved.lastBrandId;
    }
  } catch {}
}

// Send to inbox
document.getElementById("sendBtn").addEventListener("click", async () => {
  const btn = document.getElementById("sendBtn");
  const status = document.getElementById("status");
  btn.disabled = true;
  btn.textContent = "Sending...";

  const notes = document.getElementById("notes").value;
  const brandId = document.getElementById("brandSelect").value;
  const knowledgeOnly = document.getElementById("knowledgeOnly")?.checked || false;
  const manualContent = document.getElementById("manualContent")?.value || "";

  if (brandId) chrome.storage.sync.set({ lastBrandId: brandId });

  // Use: manual paste > extracted content > notes
  const finalContent = manualContent || extractedContent || notes || "";

  if (!finalContent && !currentTab.url) {
    status.className = "status err";
    status.textContent = "No content to send";
    btn.disabled = false;
    btn.textContent = "Send to Inbox";
    return;
  }

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
        title: document.getElementById("pageTitle").textContent,
        content: finalContent,
        brandId: brandId || undefined,
        sourcePlatform: detectPlatform(currentTab.url),
        knowledgeOnly: knowledgeOnly || undefined,
      }),
    });

    if (res.ok) {
      status.className = "status ok";
      status.textContent = `Sent! (${Math.round(finalContent.length / 1000)}k chars)`;
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
