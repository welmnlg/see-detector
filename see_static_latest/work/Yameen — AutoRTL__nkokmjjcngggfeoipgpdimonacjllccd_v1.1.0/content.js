/**
 * AutoRTL — Content Script
 * Automatically detects Arabic text in input fields, textareas,
 * contenteditable elements, AND displayed text across all websites.
 * Wrapped in an IIFE to avoid global scope pollution.
 */
(() => {
  "use strict";

  // ──────────────────────────────────────────────
  //  Constants
  // ──────────────────────────────────────────────

  /** Regex matching Arabic / Persian / Urdu Unicode block characters */
  const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  /**
   * Regex matching the first "strong" directional character in a string.
   * Group 1 = strong RTL (Arabic / Hebrew / Syriac / Thaana / N'Ko blocks).
   * Group 2 = strong LTR (Latin, Greek, Cyrillic, Armenian, and most other LTR scripts
   *           up through the BMP, plus astral plane LTR scripts via surrogate pairs).
   * Anything that doesn't match (digits, punctuation, whitespace, symbols) is treated as neutral.
   */
  const FIRST_STRONG_RE = /([\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF\u07C0-\u07FF\u0800-\u083F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF])|([A-Za-z\u00C0-\u02AF\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u10A0-\u10FF\u1E00-\u1EFF\u2C00-\u2C5F\u2C60-\u2C7F\uA720-\uA7FF])/;

  /** Attribute flag to mark elements we have processed */
  const MARKER = "data-autortl";

  /** Selector for text-entry elements (inputs) */
  const INPUT_SELECTOR = [
    'input[type="text"]',
    'input[type="search"]',
    'input[type="email"]',
    'input[type="url"]',
    "input:not([type])",
    "textarea",
    '[contenteditable="true"]',
    '[contenteditable=""]',
    "[contenteditable=plaintext-only]",
  ].join(",");

  /** Selector for text-display elements (output / content) */
  const TEXT_SELECTOR = [
    "p", "h1", "h2", "h3", "h4", "h5", "h6",
    "li", "td", "th", "blockquote", "figcaption",
    "dt", "dd", "label", "legend", "caption",
    "summary", "pre",
  ].join(",");

  /** Tags to skip entirely */
  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "SVG", "MATH",
    "CODE", "KBD", "SAMP", "VAR",
  ]);

  // ──────────────────────────────────────────────
  //  State
  // ──────────────────────────────────────────────

  let enabled = true;

  /**
   * Direction mode:
   *   "auto"      – detect per-element (default)
   *   "force-rtl" – always RTL
   *   "force-ltr" – always LTR
   */
  let mode = "auto";

  /** Custom Arabic font (empty string = page default) */
  let customFont = "";

  /** WeakSet to avoid duplicate input listeners */
  const trackedInputs = new WeakSet();

  // ──────────────────────────────────────────────
  //  Direction detection & application
  // ──────────────────────────────────────────────

  /**
   * Check if a string contains Arabic characters.
   * @param {string} text
   * @returns {boolean}
   */
  function hasArabic(text) {
    return ARABIC_RE.test(text);
  }

  /**
   * First-strong direction detection (Unicode bidi style).
   * Returns the direction of the first strongly-typed character in the string.
   * @param {string} text
   * @returns {"rtl"|"ltr"|"none"}
   */
  function firstStrongDir(text) {
    if (!text) return "none";
    const m = FIRST_STRONG_RE.exec(text);
    if (!m) return "none";
    return m[1] ? "rtl" : "ltr";
  }

  /**
   * Get best direction for a string. Falls back to LTR if no strong char.
   * @param {string} text
   * @returns {"rtl"|"ltr"}
   */
  function detectDirection(text) {
    const d = firstStrongDir(text);
    return d === "rtl" ? "rtl" : "ltr";
  }

  /**
   * Read the visible text from an element.
   * @param {HTMLElement} el
   * @returns {string}
   */
  function getText(el) {
    if (el.isContentEditable) return el.textContent || "";
    if ("value" in el) return el.value || "";
    return el.textContent || "";
  }

  /**
   * Check if an element is an editable field (input, textarea, contenteditable).
   * @param {HTMLElement} el
   * @returns {boolean}
   */
  function isEditable(el) {
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  }

  /**
   * Check if an element is inside a contenteditable ancestor.
   * @param {HTMLElement} el
   * @returns {boolean}
   */
  function isInsideEditable(el) {
    let parent = el.parentElement;
    while (parent) {
      if (parent.isContentEditable) return true;
      parent = parent.parentElement;
    }
    return false;
  }

  /**
   * Apply direction styles to an element.
   *
   * @param {HTMLElement} el
   * @param {"rtl"|"ltr"|"auto"} dir
   *   The value to write — "auto" delegates per-element direction to the
   *   browser's native first-strong algorithm, which keeps English-led
   *   paragraphs/sentences LTR even when they contain Arabic words.
   * @param {"rtl"|"ltr"|null} resolvedDir
   *   The actual resolved direction, used to decide whether to apply the
   *   custom Arabic font. Pass null for "auto" when unknown.
   */
  function setDir(el, dir, resolvedDir) {
    const editable = isEditable(el);

    if (dir === "auto") {
      if (el.getAttribute("dir") !== "auto") el.setAttribute("dir", "auto");
      // Let the attribute drive direction; align to logical start.
      if (el.style.direction) el.style.removeProperty("direction");
      if (el.style.textAlign !== "start") el.style.textAlign = "start";
      if (!editable && el.style.unicodeBidi) {
        el.style.removeProperty("unicode-bidi");
      }
    } else {
      // Explicit force-rtl / force-ltr.
      if (!editable && el.getAttribute("dir") !== dir) {
        el.setAttribute("dir", dir);
      }
      if (el.style.direction !== dir) el.style.direction = dir;
      const ta = dir === "rtl" ? "right" : "left";
      if (el.style.textAlign !== ta) el.style.textAlign = ta;
      if (!editable && el.style.unicodeBidi !== "plaintext") {
        el.style.unicodeBidi = "plaintext";
      }
    }

    // Custom font — applied only when the resolved direction is RTL.
    const wantFont = resolvedDir === "rtl" && customFont ? customFont : "";
    if (wantFont) {
      if (el.style.fontFamily !== wantFont) el.style.fontFamily = wantFont;
    } else if (el.style.fontFamily) {
      el.style.removeProperty("font-family");
    }
  }

  /**
   * Apply the correct direction to an input element based on mode & content.
   * @param {HTMLElement} el
   */
  function applyDirection(el) {
    if (!enabled) return;

    const text = getText(el);
    if (text.trim().length === 0) return;

    if (mode === "force-rtl") {
      setDir(el, "rtl", "rtl");
    } else if (mode === "force-ltr") {
      setDir(el, "ltr", "ltr");
    } else {
      // Auto: native first-strong via dir="auto". Resolve here only so the
      // custom Arabic font flips correctly with the user's typing.
      const resolved = firstStrongDir(text);
      if (resolved === "none") return;
      setDir(el, "auto", resolved);
    }
  }

  /**
   * Reset inlined direction styles.
   * @param {HTMLElement} el
   */
  function resetDirection(el) {
    el.removeAttribute("dir");
    el.style.removeProperty("direction");
    el.style.removeProperty("text-align");
    el.style.removeProperty("unicode-bidi");
    el.style.removeProperty("font-family");
  }

  // ──────────────────────────────────────────────
  //  Input elements — listener-based
  // ──────────────────────────────────────────────

  /**
   * Attach an input listener to an editable element.
   * @param {HTMLElement} el
   */
  function attachInputListener(el) {
    if (trackedInputs.has(el)) return;
    trackedInputs.add(el);
    el.setAttribute(MARKER, "input");

    el.addEventListener("input", () => applyDirection(el), { passive: true });
  }

  /**
   * Scan a root node for input elements and attach listeners.
   * @param {ParentNode} root
   */
  function scanInputs(root) {
    if (!root || !root.querySelectorAll) return;

    if (root instanceof HTMLElement && root.matches?.(INPUT_SELECTOR)) {
      attachInputListener(root);
    }
    root.querySelectorAll(INPUT_SELECTOR).forEach(attachInputListener);
  }

  // ──────────────────────────────────────────────
  //  Display / output elements — direct scan
  // ──────────────────────────────────────────────

  /**
   * Check if an element contains direct (non-nested) text.
   * @param {HTMLElement} el
   * @returns {boolean}
   */
  function hasDirectText(el) {
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Fix direction on a semantic text-display element (p, h1-h6, li, etc.).
   * @param {HTMLElement} el
   */
  function fixTextElement(el) {
    if (!enabled) return;
    if (SKIP_TAGS.has(el.tagName)) return;
    if (el.id === "autortl-toggle") return;
    // Never touch elements that are inside a contenteditable — this disrupts cursor
    if (el.isContentEditable || isInsideEditable(el)) return;

    const text = el.textContent || "";
    if (text.trim().length === 0) return;

    if (mode === "force-rtl") {
      setDir(el, "rtl", "rtl");
    } else if (mode === "force-ltr") {
      setDir(el, "ltr", "ltr");
    } else {
      // Auto: only touch blocks whose first strong character is RTL.
      // English-led paragraphs that contain some Arabic stay LTR.
      if (firstStrongDir(text) !== "rtl") return;
      setDir(el, "auto", "rtl");
    }
    el.setAttribute(MARKER, "text");
  }

  /**
   * Fix direction on generic divs/spans that directly hold Arabic text.
   * Only targets "leaf" blocks that have their own text content.
   * @param {HTMLElement} el
   */
  function fixGenericBlock(el) {
    if (!enabled) return;
    if (SKIP_TAGS.has(el.tagName)) return;
    if (el.id === "autortl-toggle") return;
    if (el.getAttribute(MARKER)) return; // already processed
    // Never touch elements that are inside a contenteditable
    if (el.isContentEditable || isInsideEditable(el)) return;
    if (!hasDirectText(el)) return;

    const text = el.textContent || "";
    if (text.trim().length === 0) return;

    if (mode === "force-rtl") {
      setDir(el, "rtl", "rtl");
    } else if (mode === "force-ltr") {
      setDir(el, "ltr", "ltr");
    } else {
      if (firstStrongDir(text) !== "rtl") return;
      setDir(el, "auto", "rtl");
    }
    el.setAttribute(MARKER, "text");
  }

  /**
   * Scan a root node for display elements and fix their direction.
   * @param {ParentNode} root
   */
  function scanTextElements(root) {
    if (!root || !root.querySelectorAll) return;

    // Fix semantic text elements (p, h1-h6, li, etc.)
    root.querySelectorAll(TEXT_SELECTOR).forEach(fixTextElement);

    // Fix divs/spans that directly contain Arabic text
    root.querySelectorAll("div, span").forEach(fixGenericBlock);

    // The root itself
    if (root instanceof HTMLElement) {
      if (root.matches?.(TEXT_SELECTOR)) fixTextElement(root);
      else if (root.matches?.("div, span")) fixGenericBlock(root);
    }
  }

  /**
   * Full scan — inputs + display text.
   * @param {ParentNode} root
   */
  function fullScan(root) {
    scanInputs(root);
    scanTextElements(root);
  }

  // ──────────────────────────────────────────────
  //  Re-apply / reset all
  // ──────────────────────────────────────────────

  function reapplyAll() {
    // Re-fix tracked inputs
    document.querySelectorAll(`[${MARKER}="input"]`).forEach((el) => {
      enabled ? applyDirection(el) : resetDirection(el);
    });

    // Re-fix or reset text elements
    document.querySelectorAll(`[${MARKER}="text"]`).forEach((el) => {
      if (enabled) {
        fixTextElement(el);
      } else {
        resetDirection(el);
        el.removeAttribute(MARKER);
      }
    });

    // Re-scan everything when re-enabled or mode changes
    if (enabled) scanTextElements(document.body);
  }

  // ──────────────────────────────────────────────
  //  MutationObserver
  // ──────────────────────────────────────────────

  let scanTimer = null;

  /** Debounced full scan — batches rapid DOM changes. */
  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(() => {
      scanTimer = null;
      fullScan(document.body);
    }, 200);
  }

  const observer = new MutationObserver((mutations) => {
    let needsBroadScan = false;

    for (const mutation of mutations) {
      // New child nodes added
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            fullScan(node);
          }
        }
        needsBroadScan = true;
      }

      // contenteditable attribute changed
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "contenteditable"
      ) {
        const el = mutation.target;
        if (el instanceof HTMLElement) {
          const val = el.getAttribute("contenteditable");
          if (val === "true" || val === "" || val === "plaintext-only") {
            attachInputListener(el);
          }
        }
      }

      // Text content changed — only care about display text, not user typing.
      // Skip if the mutation is inside a contenteditable (user is typing).
      if (mutation.type === "characterData") {
        const target = mutation.target.parentElement;
        if (target && !target.isContentEditable && !isInsideEditable(target)) {
          needsBroadScan = true;
        }
      }
    }

    if (needsBroadScan) scheduleScan();
  });

  // ──────────────────────────────────────────────
  //  Google Fonts loader
  // ──────────────────────────────────────────────

  const loadedFonts = new Set();

  /**
   * Inject a Google Fonts stylesheet for the given font family.
   * Only loads each font once.
   * @param {string} fontValue  e.g. "'Cairo', sans-serif"
   */
  function ensureFontLoaded(fontValue) {
    if (!fontValue) return;
    // Extract the font name from the CSS value, e.g. "'Cairo', sans-serif" -> "Cairo"
    const name = fontValue.split(",")[0].replace(/'/g, "").trim();
    if (!name || loadedFonts.has(name)) return;
    loadedFonts.add(name);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }

  // ──────────────────────────────────────────────
  //  Settings persistence
  // ──────────────────────────────────────────────

  function saveSettings() {
    try {
      chrome.storage.local.set({
        autoRtlEnabled: enabled,
        autoRtlMode: mode,
        autoRtlFont: customFont,
      });
    } catch { /* not available */ }
  }

  function loadSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(
          { autoRtlEnabled: true, autoRtlMode: "auto", autoRtlFont: "" },
          (data) => {
            enabled = data.autoRtlEnabled;
            mode = data.autoRtlMode;
            customFont = data.autoRtlFont || "";
            if (customFont) ensureFontLoaded(customFont);
            resolve();
          }
        );
      } catch { resolve(); }
    });
  }

  // ──────────────────────────────────────────────
  //  Message listener (popup ↔ content)
  // ──────────────────────────────────────────────

  try {
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg.type === "autortl-update") {
        if (typeof msg.enabled === "boolean") enabled = msg.enabled;
        if (msg.mode) mode = msg.mode;
        if (typeof msg.font === "string") {
          customFont = msg.font;
          if (customFont) ensureFontLoaded(customFont);
        }

        reapplyAll();
        sendResponse({ ok: true });
      }

      if (msg.type === "autortl-get-state") {
        // Gather live stats for the popup
        const fixedCount = document.querySelectorAll(`[${MARKER}="text"]`).length;
        const inputCount = document.querySelectorAll(`[${MARKER}="input"]`).length;
        sendResponse({ enabled, mode, fixedCount, inputCount });
      }
    });
  } catch { /* not in extension context */ }

  // ──────────────────────────────────────────────
  //  Initialisation
  // ──────────────────────────────────────────────

  async function init() {
    await loadSettings();

    // Full initial scan — inputs AND display text
    fullScan(document);

    // Observe future DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["contenteditable"],
      characterData: true,
    });
  }

  init();
})();