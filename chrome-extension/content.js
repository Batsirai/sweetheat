// Content script — runs on the page, can access the DOM
// Used to extract text from JavaScript-rendered pages (X.com, etc.)

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "extractContent") {
    const content = extractPageContent();
    sendResponse(content);
  }
  return true;
});

function extractPageContent() {
  const url = window.location.href;

  if (url.includes("x.com") || url.includes("twitter.com")) {
    // Check if it's an X Article (long-form) vs a regular tweet
    const articleView = document.querySelector('[data-testid="twitterArticleReadView"]');
    if (articleView) {
      return extractXArticle(articleView);
    }
    return extractTweet();
  }

  return extractArticle();
}

function extractXArticle(articleView) {
  // X Articles have a title and rich text body
  const titleEl = document.querySelector('[data-testid="twitter-article-title"]');
  const title = titleEl?.innerText || "";

  // Get the article body (DraftEditor content)
  const bodyEl = articleView.querySelector('[data-testid="longformRichTextComponent"]')
    || articleView.querySelector('.DraftEditor-root')
    || articleView;
  const body = bodyEl?.innerText || "";

  // Get author from the page
  const author = document.querySelector('[data-testid="User-Name"]')?.innerText || "";

  // Get engagement stats from the article header
  const statsEl = articleView.querySelector('[role="group"]');
  const stats = statsEl?.getAttribute("aria-label") || "";

  const content = [
    `# ${title}`,
    `\nAuthor: ${author}`,
    stats ? `Engagement: ${stats}` : "",
    `\n${body}`,
  ].filter(Boolean).join("\n");

  return {
    content,
    title: title || "X Article",
    author,
    platform: "twitter",
  };
}

function extractTweet() {
  const results = [];

  const tweetTexts = document.querySelectorAll('[data-testid="tweetText"]');
  tweetTexts.forEach((el) => {
    results.push(el.innerText);
  });

  const author = document.querySelector('[data-testid="User-Name"]')?.innerText || "";

  const likes = document.querySelector('[data-testid="like"]')?.getAttribute("aria-label") || "";
  const retweets = document.querySelector('[data-testid="retweet"]')?.getAttribute("aria-label") || "";
  const replies = document.querySelector('[data-testid="reply"]')?.getAttribute("aria-label") || "";

  const content = [
    `Author: ${author}`,
    `Tweet: ${results[0] || ""}`,
    results.length > 1 ? `\nThread (${results.length} tweets):\n${results.join("\n\n")}` : "",
    `\nEngagement: ${likes}, ${retweets}, ${replies}`,
  ].filter(Boolean).join("\n");

  return {
    content,
    title: results[0] ? results[0].slice(0, 100) : "Tweet",
    author,
    platform: "twitter",
  };
}

function extractArticle() {
  const selectors = [
    "article",
    '[role="main"]',
    ".post-content",
    ".article-body",
    ".entry-content",
    "main",
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.length > 200) {
      return {
        content: el.innerText.slice(0, 50000),
        title: document.title,
        platform: "web",
      };
    }
  }

  return {
    content: document.body.innerText.slice(0, 50000),
    title: document.title,
    platform: "web",
  };
}
