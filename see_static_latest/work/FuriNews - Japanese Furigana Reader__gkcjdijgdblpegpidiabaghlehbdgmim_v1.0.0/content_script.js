"use strict";
(() => {
  // src/tokenizer.ts
  var tokenizerInstance = null;
  var initPromise = null;
  function katakanaToHiragana(str) {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 96);
    });
  }
  function isOnlyKana(str) {
    return /^[\u3040-\u309F\u30A0-\u30FF]+$/.test(str);
  }
  function containsKanji(str) {
    return /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(str);
  }
  function isAlphanumeric(str) {
    return /^[a-zA-Z0-9\s]+$/.test(str);
  }
  function isOnlySymbols(str) {
    return /^[\s\p{P}\p{S}]+$/u.test(str);
  }
  async function initializeTokenizer(dicPath) {
    if (tokenizerInstance) {
      return tokenizerInstance;
    }
    if (initPromise) {
      return initPromise;
    }
    console.log("[Furigana] Checking kuromoji availability...");
    console.log("[Furigana] typeof kuromoji:", typeof kuromoji);
    if (typeof kuromoji === "undefined") {
      return Promise.reject(new Error("kuromoji is not loaded. Check if lib/kuromoji.js is included in manifest.json"));
    }
    console.log("[Furigana] kuromoji is available, dicPath:", dicPath);
    initPromise = new Promise((resolve, reject) => {
      try {
        console.log("[Furigana] Building tokenizer...");
        kuromoji.builder({ dicPath }).build((err, tokenizer) => {
          if (err) {
            console.error("[Furigana] Tokenizer build error:", err);
            initPromise = null;
            reject(err);
            return;
          }
          console.log("[Furigana] Tokenizer built successfully");
          tokenizerInstance = tokenizer;
          resolve(tokenizer);
        });
      } catch (e) {
        console.error("[Furigana] Tokenizer build exception:", e);
        initPromise = null;
        reject(e);
      }
    });
    return initPromise;
  }
  function isTokenizerReady() {
    return tokenizerInstance !== null;
  }
  function mapPosType(pos) {
    if (pos.startsWith("\u540D\u8A5E"))
      return "noun";
    if (pos.startsWith("\u52D5\u8A5E"))
      return "verb";
    if (pos.startsWith("\u5F62\u5BB9\u8A5E"))
      return "adjective";
    if (pos.startsWith("\u526F\u8A5E"))
      return "adverb";
    if (pos.startsWith("\u52A9\u8A5E"))
      return "particle";
    if (pos.startsWith("\u52A9\u52D5\u8A5E"))
      return "auxiliary";
    if (pos.startsWith("\u63A5\u7D9A\u8A5E"))
      return "conjunction";
    if (pos.startsWith("\u611F\u52D5\u8A5E"))
      return "interjection";
    if (pos.startsWith("\u9023\u4F53\u8A5E"))
      return "prenoun";
    if (pos.startsWith("\u8A18\u53F7"))
      return "symbol";
    return "other";
  }
  function tokenizeForAnnotation(text) {
    if (!tokenizerInstance) {
      throw new Error("Tokenizer not initialized");
    }
    const tokens = tokenizerInstance.tokenize(text);
    const result = [];
    for (const token of tokens) {
      const surface = token.surface_form;
      const reading = token.reading;
      const pos = token.pos;
      let needsRuby = false;
      let hiraganaReading = "";
      if (reading) {
        hiraganaReading = katakanaToHiragana(reading);
      }
      if (containsKanji(surface) && !isOnlyKana(surface) && !isAlphanumeric(surface) && !isOnlySymbols(surface) && reading && surface !== hiraganaReading) {
        needsRuby = true;
      }
      result.push({
        surface,
        reading: hiraganaReading,
        needsRuby,
        pos: mapPosType(pos),
        posDetail: pos
      });
    }
    return result;
  }
  function hasAnnotatableContent(text) {
    return containsKanji(text);
  }

  // src/domAnnotator.ts
  var PROCESSED_ATTR = "data-furigana-processed";
  var SKIP_TAGS = /* @__PURE__ */ new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "IFRAME",
    "OBJECT",
    "EMBED",
    "RUBY",
    "RT",
    "RP",
    "RB",
    "RTC",
    // 已有 ruby 标注
    "INPUT",
    "TEXTAREA",
    "SELECT",
    "BUTTON",
    "CODE",
    "PRE",
    "KBD",
    "VAR",
    "SAMP",
    "SVG",
    "MATH",
    "CANVAS"
  ]);
  function createRubyElement(surface, reading, pos) {
    const ruby = document.createElement("ruby");
    ruby.className = `furigana-ruby furigana-pos-${pos}`;
    ruby.appendChild(document.createTextNode(surface));
    const rpOpen = document.createElement("rp");
    rpOpen.textContent = "(";
    ruby.appendChild(rpOpen);
    const rt = document.createElement("rt");
    rt.textContent = reading;
    ruby.appendChild(rt);
    const rpClose = document.createElement("rp");
    rpClose.textContent = ")";
    ruby.appendChild(rpClose);
    return ruby;
  }
  function tokensToNodes(tokens) {
    const nodes = [];
    for (const token of tokens) {
      if (token.needsRuby && token.reading) {
        nodes.push(createRubyElement(token.surface, token.reading, token.pos));
      } else {
        nodes.push(document.createTextNode(token.surface));
      }
    }
    return nodes;
  }
  function processTextNode(textNode) {
    const text = textNode.textContent;
    if (!text || text.trim().length === 0) {
      return false;
    }
    if (!hasAnnotatableContent(text)) {
      return false;
    }
    const parent = textNode.parentNode;
    if (!parent) {
      return false;
    }
    if (parent instanceof Element) {
      if (SKIP_TAGS.has(parent.tagName)) {
        return false;
      }
      if (parent.hasAttribute(PROCESSED_ATTR)) {
        return false;
      }
    }
    try {
      const tokens = tokenizeForAnnotation(text);
      const hasRuby = tokens.some((t) => t.needsRuby);
      if (!hasRuby) {
        return false;
      }
      const newNodes = tokensToNodes(tokens);
      const fragment = document.createDocumentFragment();
      for (const node of newNodes) {
        fragment.appendChild(node);
      }
      parent.replaceChild(fragment, textNode);
      return true;
    } catch (e) {
      console.error("[Furigana] Error processing text node:", e);
      return false;
    }
  }
  function shouldProcessElement(element) {
    if (SKIP_TAGS.has(element.tagName)) {
      return false;
    }
    if (element.hasAttribute(PROCESSED_ATTR)) {
      return false;
    }
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    return true;
  }
  function annotateElement(rootElement) {
    if (!shouldProcessElement(rootElement)) {
      return 0;
    }
    let processedCount = 0;
    const textNodes = [];
    const walker = document.createTreeWalker(
      rootElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node2) => {
          const parent = node2.parentElement;
          if (!node2.textContent || node2.textContent.trim().length === 0) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent && SKIP_TAGS.has(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent && parent.hasAttribute(PROCESSED_ATTR)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    for (const textNode of textNodes) {
      if (textNode.parentNode) {
        if (processTextNode(textNode)) {
          processedCount++;
        }
      }
    }
    rootElement.setAttribute(PROCESSED_ATTR, "true");
    return processedCount;
  }
  function removeAnnotations(rootElement) {
    const rubyElements = rootElement.querySelectorAll("ruby.furigana-ruby");
    for (const ruby of rubyElements) {
      const originalText = ruby.childNodes[0]?.textContent || "";
      const textNode = document.createTextNode(originalText);
      ruby.parentNode?.replaceChild(textNode, ruby);
    }
    rootElement.removeAttribute(PROCESSED_ATTR);
    const processedElements = rootElement.querySelectorAll(`[${PROCESSED_ATTR}]`);
    for (const el of processedElements) {
      el.removeAttribute(PROCESSED_ATTR);
    }
  }
  function isElementProcessed(element) {
    return element.hasAttribute(PROCESSED_ATTR);
  }

  // src/contentExtractor.ts
  var JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
  var ARTICLE_SELECTORS = [
    "article",
    '[role="article"]',
    "main article",
    ".article-body",
    ".article-content",
    ".article__body",
    ".post-content",
    ".entry-content",
    ".news-body",
    ".news-content",
    ".story-body",
    ".content-body",
    "#article-body",
    "#main-content",
    ".main-content"
  ];
  var EXCLUDE_SELECTORS = [
    "nav",
    "header:not(article header)",
    "footer:not(article footer)",
    "aside",
    ".sidebar",
    ".navigation",
    ".menu",
    ".advertisement",
    ".ad",
    ".ads",
    ".social-share",
    ".related-articles",
    ".recommended",
    ".comments",
    "#comments",
    ".comment-section",
    ".breadcrumb",
    ".pagination"
  ];
  function calculateJapaneseRatio(text) {
    if (!text || text.length === 0)
      return 0;
    let japaneseCount = 0;
    for (const char of text) {
      if (JAPANESE_REGEX.test(char)) {
        japaneseCount++;
      }
    }
    return japaneseCount / text.length;
  }
  function calculateLinkDensity(element) {
    const textLength = (element.textContent || "").length;
    if (textLength === 0)
      return 1;
    const links = element.querySelectorAll("a");
    let linkTextLength = 0;
    for (const link of links) {
      linkTextLength += (link.textContent || "").length;
    }
    return linkTextLength / textLength;
  }
  function getCleanTextLength(element) {
    const clone = element.cloneNode(true);
    const scripts = clone.querySelectorAll("script, style, noscript");
    for (const script of scripts) {
      script.remove();
    }
    return (clone.textContent || "").trim().length;
  }
  function calculateContentScore(element) {
    const textLength = getCleanTextLength(element);
    const linkDensity = calculateLinkDensity(element);
    const text = element.textContent || "";
    const japaneseRatio = calculateJapaneseRatio(text);
    const paragraphs = element.querySelectorAll("p");
    let paragraphScore = 0;
    for (const p of paragraphs) {
      const pText = (p.textContent || "").trim();
      if (pText.length > 50) {
        paragraphScore += 1;
      }
    }
    let score = 0;
    score += Math.min(textLength / 100, 20);
    score += paragraphScore * 3;
    score *= 1 - linkDensity;
    if (japaneseRatio > 0.3) {
      score *= 1.5;
    } else if (japaneseRatio > 0.1) {
      score *= 1.2;
    }
    const tagName = element.tagName.toLowerCase();
    if (tagName === "article") {
      score *= 1.5;
    } else if (tagName === "main") {
      score *= 1.3;
    } else if (tagName === "section") {
      score *= 1.1;
    }
    const classAndId = (element.className + " " + element.id).toLowerCase();
    if (/article|content|body|main|post|entry|text/.test(classAndId)) {
      score *= 1.3;
    }
    if (/sidebar|nav|menu|footer|header|ad|comment|related/.test(classAndId)) {
      score *= 0.5;
    }
    return {
      element,
      score,
      textLength,
      linkDensity,
      japaneseRatio
    };
  }
  function findContentByDomFeatures() {
    for (const selector of ARTICLE_SELECTORS) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const score = calculateContentScore(element);
        if (score.textLength > 500 && score.japaneseRatio > 0.1 && score.linkDensity < 0.5) {
          return element;
        }
      }
    }
    const candidates = [];
    const containers = document.querySelectorAll("div, section, article, main");
    for (const container of containers) {
      if (getCleanTextLength(container) < 300) {
        continue;
      }
      let isExcluded = false;
      for (const excludeSelector of EXCLUDE_SELECTORS) {
        if (container.matches(excludeSelector)) {
          isExcluded = true;
          break;
        }
      }
      if (isExcluded)
        continue;
      const score = calculateContentScore(container);
      if (score.japaneseRatio > 0.05 && score.linkDensity < 0.6) {
        candidates.push(score);
      }
    }
    candidates.sort((a, b) => b.score - a.score);
    if (candidates.length > 0) {
      for (const candidate of candidates) {
        if (candidate.element.tagName !== "BODY" && candidate.element.tagName !== "HTML") {
          return candidate.element;
        }
      }
    }
    return null;
  }
  function extractWithReadability() {
    const documentClone = document.cloneNode(true);
    const removeSelectors = [
      "script",
      "style",
      "noscript",
      "iframe",
      "nav",
      "aside",
      ".sidebar",
      ".ad",
      ".advertisement",
      "header:not(article header)",
      "footer:not(article footer)"
    ];
    for (const selector of removeSelectors) {
      const elements = documentClone.querySelectorAll(selector);
      for (const el of elements) {
        el.remove();
      }
    }
    const bestElement = findContentByDomFeatures();
    return bestElement;
  }
  function extractArticleContent() {
    console.log("[Furigana] Starting content extraction...");
    const article = document.querySelector("article");
    if (article) {
      const score = calculateContentScore(article);
      if (score.textLength > 300 && score.japaneseRatio > 0.05) {
        console.log("[Furigana] Found article tag with good content");
        return article;
      }
    }
    const main = document.querySelector("main");
    if (main) {
      const score = calculateContentScore(main);
      if (score.textLength > 300 && score.japaneseRatio > 0.05) {
        console.log("[Furigana] Found main tag with good content");
        return main;
      }
    }
    const readabilityResult = extractWithReadability();
    if (readabilityResult) {
      console.log("[Furigana] Found content via Readability-style extraction");
      return readabilityResult;
    }
    const domResult = findContentByDomFeatures();
    if (domResult) {
      console.log("[Furigana] Found content via DOM features");
      return domResult;
    }
    console.log("[Furigana] Could not find suitable content area");
    return null;
  }
  function isJapaneseArticlePage() {
    const htmlLang = document.documentElement.lang?.toLowerCase() || "";
    const isJapaneseLang = htmlLang.startsWith("ja");
    const bodyText = document.body.textContent || "";
    const japaneseRatio = calculateJapaneseRatio(bodyText.slice(0, 5e3));
    const hasEnoughContent = bodyText.length > 1e3;
    return (isJapaneseLang || japaneseRatio > 0.1) && hasEnoughContent;
  }

  // src/content_script.ts
  var COLOR_MODE_CLASS = "furigana-color-mode";
  var state = {
    isEnabled: false,
    isProcessing: false,
    isInitialized: false,
    articleElement: null,
    processedCount: 0,
    colorMode: false
  };
  var loadingIndicator = null;
  function showLoading(message) {
    if (!loadingIndicator) {
      loadingIndicator = document.createElement("div");
      loadingIndicator.className = "furigana-loading";
      document.body.appendChild(loadingIndicator);
    }
    loadingIndicator.textContent = message;
    loadingIndicator.style.display = "block";
  }
  function hideLoading() {
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }
  }
  function getDicPath() {
    return chrome.runtime.getURL("dict/");
  }
  async function initTokenizer() {
    if (isTokenizerReady()) {
      return true;
    }
    showLoading("\u8F9E\u66F8\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D...");
    try {
      const dicPath = getDicPath();
      console.log("[Furigana] Loading dictionary from:", dicPath);
      await initializeTokenizer(dicPath);
      console.log("[Furigana] Tokenizer initialized successfully");
      state.isInitialized = true;
      return true;
    } catch (error) {
      console.error("[Furigana] Failed to initialize tokenizer:", error);
      hideLoading();
      return false;
    }
  }
  async function processPage() {
    if (state.isProcessing) {
      console.log("[Furigana] Already processing, skipping...");
      return;
    }
    state.isProcessing = true;
    showLoading("\u3075\u308A\u304C\u306A\u3092\u8FFD\u52A0\u4E2D...");
    try {
      if (!state.isInitialized) {
        const success = await initTokenizer();
        if (!success) {
          throw new Error("Tokenizer initialization failed");
        }
      }
      const articleElement = extractArticleContent();
      if (!articleElement) {
        console.log("[Furigana] No article content found");
        hideLoading();
        state.isProcessing = false;
        return;
      }
      state.articleElement = articleElement;
      if (isElementProcessed(articleElement)) {
        console.log("[Furigana] Content already processed");
        hideLoading();
        state.isProcessing = false;
        return;
      }
      console.log("[Furigana] Processing article element:", articleElement.tagName);
      const count = annotateElement(articleElement);
      state.processedCount = count;
      console.log(`[Furigana] Processed ${count} text nodes`);
      hideLoading();
    } catch (error) {
      console.error("[Furigana] Error processing page:", error);
      hideLoading();
    } finally {
      state.isProcessing = false;
    }
  }
  function removeFurigana() {
    if (state.articleElement) {
      removeAnnotations(state.articleElement);
      state.processedCount = 0;
      console.log("[Furigana] Annotations removed");
    }
  }
  async function toggleEnabled(enabled) {
    state.isEnabled = enabled;
    if (enabled) {
      await processPage();
    } else {
      removeFurigana();
    }
    const url = window.location.href;
    await chrome.storage.local.set({ [`enabled_${url}`]: enabled });
  }
  async function toggleColorMode(enabled) {
    state.colorMode = enabled;
    if (enabled) {
      document.body.classList.add(COLOR_MODE_CLASS);
    } else {
      document.body.classList.remove(COLOR_MODE_CLASS);
    }
    await chrome.storage.local.set({ colorMode: enabled });
    console.log("[Furigana] Color mode:", enabled);
  }
  async function getPageEnabledState() {
    const url = window.location.href;
    const result = await chrome.storage.local.get([`enabled_${url}`]);
    return result[`enabled_${url}`] === true;
  }
  async function getColorModeState() {
    const result = await chrome.storage.local.get(["colorMode"]);
    return result.colorMode === true;
  }
  function setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      console.log("[Furigana] Received message:", message);
      switch (message.type) {
        case "GET_STATUS":
          sendResponse({
            isEnabled: state.isEnabled,
            isProcessing: state.isProcessing,
            isInitialized: state.isInitialized,
            processedCount: state.processedCount,
            isJapanesePage: isJapaneseArticlePage(),
            colorMode: state.colorMode
          });
          break;
        case "TOGGLE_ENABLED":
          toggleEnabled(message.enabled).then(() => {
            sendResponse({ success: true, isEnabled: state.isEnabled });
          }).catch((error) => {
            sendResponse({ success: false, error: error.message });
          });
          return true;
        case "TOGGLE_COLOR_MODE":
          toggleColorMode(message.colorMode).then(() => {
            sendResponse({ success: true, colorMode: state.colorMode });
          }).catch((error) => {
            sendResponse({ success: false, error: error.message });
          });
          return true;
        case "PROCESS_PAGE":
          processPage().then(() => {
            sendResponse({ success: true, processedCount: state.processedCount });
          }).catch((error) => {
            sendResponse({ success: false, error: error.message });
          });
          return true;
        case "TOKENIZE_TEXT":
          (async () => {
            try {
              if (!state.isInitialized) {
                const success = await initTokenizer();
                if (!success) {
                  sendResponse({ success: false, error: "\u8F9E\u66F8\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
                  return;
                }
              }
              const tokens = tokenizeForAnnotation(message.text);
              sendResponse({ success: true, tokens });
            } catch (error) {
              sendResponse({ success: false, error: error.message });
            }
          })();
          return true;
        default:
          sendResponse({ error: "Unknown message type" });
      }
      return false;
    });
  }
  async function init() {
    console.log("[Furigana] Content script initializing...");
    setupMessageListener();
    const colorMode = await getColorModeState();
    if (colorMode) {
      state.colorMode = true;
      document.body.classList.add(COLOR_MODE_CLASS);
    }
    const isJpPage = isJapaneseArticlePage();
    console.log("[Furigana] Is Japanese page:", isJpPage);
    if (!isJpPage) {
      console.log("[Furigana] Not a Japanese article page, skipping...");
      return;
    }
    const savedEnabled = await getPageEnabledState();
    console.log("[Furigana] Saved enabled state:", savedEnabled);
    console.log("[Furigana] Auto-processing Japanese page...");
    state.isEnabled = true;
    await processPage();
    console.log("[Furigana] Content script initialized");
  }
  window.__furiganaTest = async () => {
    console.log("[Furigana] Manual test triggered...");
    state.isEnabled = true;
    await processPage();
  };
  window.__furiganaStatus = () => {
    console.log("[Furigana] Current state:", state);
    console.log("[Furigana] Is Japanese page:", isJapaneseArticlePage());
  };
  document.addEventListener("keydown", async (e) => {
    if (e.altKey && e.key === "f") {
      console.log("[Furigana] Keyboard shortcut Alt+F triggered");
      state.isEnabled = true;
      await processPage();
    }
  });
  (async () => {
    try {
      console.log("[Furigana] Starting content script...");
      await init();
    } catch (error) {
      console.error("[Furigana] Failed to start:", error);
    }
  })();
})();
//# sourceMappingURL=content_script.js.map
