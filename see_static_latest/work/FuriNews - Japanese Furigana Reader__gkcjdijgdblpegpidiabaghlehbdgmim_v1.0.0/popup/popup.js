"use strict";
(() => {
  // src/popup.ts
  var toggleCheckbox = document.getElementById("enableToggle");
  var colorModeCheckbox = document.getElementById("colorModeToggle");
  var statusElement = document.getElementById("status");
  var lookupInput = document.getElementById("lookupInput");
  var lookupBtn = document.getElementById("lookupBtn");
  var lookupResult = document.getElementById("lookupResult");
  var reverseInput = document.getElementById("reverseInput");
  var reverseBtn = document.getElementById("reverseBtn");
  var reverseResult = document.getElementById("reverseResult");
  var readingDict = null;
  var currentStatus = null;
  function updateStatusDisplay(status, error) {
    if (error) {
      statusElement.textContent = error;
      statusElement.className = "status inactive";
      toggleCheckbox.disabled = true;
      colorModeCheckbox.disabled = true;
      return;
    }
    if (!status) {
      statusElement.textContent = "\u8AAD\u307F\u8FBC\u307F\u4E2D...";
      statusElement.className = "status";
      return;
    }
    toggleCheckbox.disabled = false;
    toggleCheckbox.checked = status.isEnabled;
    colorModeCheckbox.disabled = false;
    colorModeCheckbox.checked = status.colorMode;
    if (!status.isJapanesePage) {
      statusElement.textContent = "\u65E5\u672C\u8A9E\u306E\u30DA\u30FC\u30B8\u3067\u306F\u3042\u308A\u307E\u305B\u3093";
      statusElement.className = "status inactive";
      toggleCheckbox.disabled = true;
      colorModeCheckbox.disabled = true;
    } else if (status.isProcessing) {
      statusElement.textContent = "\u51E6\u7406\u4E2D...";
      statusElement.className = "status";
    } else if (status.isEnabled) {
      if (status.processedCount > 0) {
        statusElement.textContent = `\u6709\u52B9 (${status.processedCount}\u7B87\u6240\u3092\u51E6\u7406)`;
      } else {
        statusElement.textContent = "\u6709\u52B9";
      }
      statusElement.className = "status active";
    } else {
      statusElement.textContent = "\u7121\u52B9";
      statusElement.className = "status inactive";
    }
  }
  async function getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
  }
  async function sendToContentScript(tabId, message) {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
  async function fetchStatus() {
    try {
      const tab = await getCurrentTab();
      if (!tab?.id) {
        updateStatusDisplay(null, "\u30BF\u30D6\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
        return;
      }
      if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://")) {
        updateStatusDisplay(null, "\u3053\u306E\u30DA\u30FC\u30B8\u3067\u306F\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093");
        return;
      }
      const status = await sendToContentScript(tab.id, { type: "GET_STATUS" });
      currentStatus = status;
      updateStatusDisplay(status);
    } catch (error) {
      console.error("[Popup] Error fetching status:", error);
      updateStatusDisplay(null, "\u30DA\u30FC\u30B8\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093");
    }
  }
  async function toggleEnabled(enabled) {
    try {
      const tab = await getCurrentTab();
      if (!tab?.id) {
        return;
      }
      updateStatusDisplay({ ...currentStatus, isProcessing: true });
      const response = await sendToContentScript(
        tab.id,
        { type: "TOGGLE_ENABLED", enabled }
      );
      if (response.success) {
        await fetchStatus();
      } else {
        console.error("[Popup] Toggle failed:", response.error);
        updateStatusDisplay(null, "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F");
      }
    } catch (error) {
      console.error("[Popup] Error toggling:", error);
      updateStatusDisplay(null, "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F");
    }
  }
  async function toggleColorMode(enabled) {
    try {
      const tab = await getCurrentTab();
      if (!tab?.id) {
        return;
      }
      const response = await sendToContentScript(
        tab.id,
        { type: "TOGGLE_COLOR_MODE", colorMode: enabled }
      );
      if (response.success) {
        await fetchStatus();
      } else {
        console.error("[Popup] Color mode toggle failed:", response.error);
      }
    } catch (error) {
      console.error("[Popup] Error toggling color mode:", error);
    }
  }
  async function lookupReading() {
    const text = lookupInput.value.trim();
    if (!text) {
      return;
    }
    lookupResult.classList.add("show");
    lookupResult.innerHTML = '<span class="loading">\u8AAD\u307F\u8FBC\u307F\u4E2D...</span>';
    lookupBtn.disabled = true;
    try {
      const tab = await getCurrentTab();
      if (!tab?.id) {
        lookupResult.innerHTML = '<span class="error">\u30BF\u30D6\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093</span>';
        return;
      }
      if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://")) {
        lookupResult.innerHTML = '<span class="error">\u3053\u306E\u30DA\u30FC\u30B8\u3067\u306F\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093</span>';
        return;
      }
      const response = await sendToContentScript(tab.id, { type: "TOKENIZE_TEXT", text });
      if (response.success && response.tokens) {
        let html = "";
        for (const token of response.tokens) {
          if (token.needsRuby && token.reading) {
            html += `<span class="token"><ruby>${escapeHtml(token.surface)}<rt>${escapeHtml(token.reading)}</rt></ruby></span>`;
          } else {
            html += `<span class="token">${escapeHtml(token.surface)}</span>`;
          }
        }
        lookupResult.innerHTML = html || '<span class="error">\u7D50\u679C\u304C\u3042\u308A\u307E\u305B\u3093</span>';
      } else {
        lookupResult.innerHTML = `<span class="error">${response.error || "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F"}</span>`;
      }
    } catch (error) {
      console.error("[Popup] Lookup error:", error);
      lookupResult.innerHTML = '<span class="error">\u30DA\u30FC\u30B8\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093</span>';
    } finally {
      lookupBtn.disabled = false;
    }
  }
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  async function loadReadingDict() {
    if (readingDict) {
      return readingDict;
    }
    const url = chrome.runtime.getURL("data/reading_dict.json");
    const response = await fetch(url);
    readingDict = await response.json();
    return readingDict;
  }
  function katakanaToHiragana(str) {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 96);
    });
  }
  async function reverseLookup() {
    let text = reverseInput.value.trim();
    if (!text) {
      return;
    }
    text = katakanaToHiragana(text);
    reverseResult.classList.add("show");
    reverseResult.innerHTML = '<span class="loading">\u691C\u7D22\u4E2D...</span>';
    reverseBtn.disabled = true;
    try {
      const dict = await loadReadingDict();
      const results = dict[text];
      if (results && results.length > 0) {
        const html = results.map((item) => `<span class="kanji-item">${escapeHtml(item)}</span>`).join("");
        reverseResult.innerHTML = html;
      } else {
        reverseResult.innerHTML = '<span class="no-result">\u7D50\u679C\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F</span>';
      }
    } catch (error) {
      console.error("[Popup] Reverse lookup error:", error);
      reverseResult.innerHTML = '<span class="error">\u8F9E\u66F8\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F</span>';
    } finally {
      reverseBtn.disabled = false;
    }
  }
  toggleCheckbox.addEventListener("change", () => {
    toggleEnabled(toggleCheckbox.checked);
  });
  colorModeCheckbox.addEventListener("change", () => {
    toggleColorMode(colorModeCheckbox.checked);
  });
  lookupBtn.addEventListener("click", () => {
    lookupReading();
  });
  lookupInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      lookupReading();
    }
  });
  reverseBtn.addEventListener("click", () => {
    reverseLookup();
  });
  reverseInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      reverseLookup();
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    fetchStatus();
  });
})();
//# sourceMappingURL=popup.js.map
