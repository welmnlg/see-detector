// Claude Web Clipper — Content Script

// Code detection patterns
const CODE_INDICATORS = [
  /^(import|export|const|let|var|function|class|interface|type|enum)\s/m,
  /^(def|class|from|import|return|if|for|while|try|except)\s/m,
  /^(public|private|protected|static|void|int|string)\s/m,
  /[{}\[\]();]=>/,
  /^\s*(\/\/|#|\/\*|\*)/m,
  /\b(=>|===|!==|&&|\|\|)\b/,
  /^\s*<\/?[a-zA-Z][a-zA-Z0-9]*[\s>]/m,
  /\b(npm|yarn|pip|cargo|go)\s+(install|add|run)/,
  /\.(tsx?|jsx?|py|rs|go|java|cpp|rb|sh|sql|css|html)\b/,
];

const CODE_PARENT_SELECTORS = [
  "pre",
  "code",
  ".highlight",
  ".code-block",
  ".CodeMirror",
  ".monaco-editor",
  ".prism-code",
  '[class*="code"]',
  '[class*="Code"]',
  "[data-language]",
];

function isCodeContent(text, selection) {
  // Check if selection is inside a code element
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;
    while (node && node !== document.body) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        for (const selector of CODE_PARENT_SELECTORS) {
          try {
            if (node.matches(selector)) return true;
          } catch {
            // Invalid selector
          }
        }
      }
      node = node.parentNode;
    }
  }

  // Check text patterns
  let codeScore = 0;
  for (const pattern of CODE_INDICATORS) {
    if (pattern.test(text)) codeScore++;
  }
  return codeScore >= 2;
}

function detectContentType(text) {
  if (isCodeContent(text, window.getSelection())) return "code";
  // Check for list patterns
  const lines = text.split("\n").filter((l) => l.trim());
  const listLines = lines.filter((l) => /^\s*[-*\d+.)]\s/.test(l));
  if (listLines.length > lines.length * 0.5 && lines.length >= 2) return "list";
  return "prose";
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "getSelection") {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      const isCode = isCodeContent(text, selection);
      sendResponse({
        text: text,
        isCode: isCode,
        contentType: detectContentType(text),
      });
    } else {
      sendResponse({ text: "", isCode: false, contentType: "prose" });
    }
    return true;
  }

  if (message.action === "showNotification") {
    showClipNotification(message.clipCount);
  }
});

// Show a brief notification when content is clipped
function showClipNotification(clipCount) {
  // Remove any existing notification
  const existing = document.getElementById("claude-clipper-notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.id = "claude-clipper-notification";
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%);
      color: #e0e0e0;
      padding: 12px 20px;
      border-radius: 10px;
      border: 1px solid #7c4dff;
      box-shadow: 0 4px 20px rgba(124, 77, 255, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: clipperSlideIn 0.3s ease-out;
      cursor: default;
      user-select: none;
    ">
      <span style="font-size: 18px;">&#9889;</span>
      <span>Clipped! <strong style="color: #b388ff;">${clipCount} clip${clipCount !== 1 ? "s" : ""}</strong> in context</span>
    </div>
    <style>
      @keyframes clipperSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transition = "opacity 0.3s ease-out";
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
    }
  }, 2000);
}
