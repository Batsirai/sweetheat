// Content script — runs on X.com pages with full DOM access.
// The popup sends a message, we extract and send back.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "extractContent") {
    // Small delay to let dynamic content finish rendering
    setTimeout(() => {
      const result = extractPageContent();
      sendResponse(result);
    }, 500);
    return true; // Keep channel open for async
  }
});

function extractPageContent() {
  const url = window.location.href;

  // X Article (long-form)
  const articleView = document.querySelector('[data-testid="twitterArticleReadView"]');
  if (articleView) {
    const titleEl = document.querySelector('[data-testid="twitter-article-title"]');
    const title = titleEl?.innerText || "";
    const bodyEl = articleView.querySelector('[data-testid="longformRichTextComponent"]')
      || articleView.querySelector('.DraftEditor-root')
      || articleView;
    const body = bodyEl?.innerText || "";
    const author = document.querySelector('[data-testid="User-Name"]')?.innerText || "";
    const stats = articleView.querySelector('[role="group"]')?.getAttribute("aria-label") || "";

    return {
      content: `# ${title}\n\nAuthor: ${author}\n${stats}\n\n${body}`,
      title: title || "X Article",
      platform: "twitter",
      charCount: body.length,
    };
  }

  // X Tweet or thread
  if (url.includes("x.com") || url.includes("twitter.com")) {
    const tweets = Array.from(document.querySelectorAll('[data-testid="tweetText"]'))
      .map(el => el.innerText);
    if (tweets.length > 0) {
      const author = document.querySelector('[data-testid="User-Name"]')?.innerText || "";
      const stats = document.querySelector('article [role="group"]')?.getAttribute("aria-label") || "";
      const isThread = tweets.length > 1;
      const content = [
        `Author: ${author}`,
        stats ? `Engagement: ${stats}` : "",
        "",
        isThread ? `Thread (${tweets.length} tweets):` : "",
        ...tweets,
      ].filter(Boolean).join("\n\n");

      return { content, title: tweets[0].slice(0, 100), platform: "twitter", charCount: content.length };
    }
  }

  // Generic page
  const el = document.querySelector("article") || document.querySelector('[role="main"]') || document.querySelector("main") || document.body;
  const text = el?.innerText?.slice(0, 50000) || "";
  return { content: text, title: document.title, platform: "web", charCount: text.length };
}
