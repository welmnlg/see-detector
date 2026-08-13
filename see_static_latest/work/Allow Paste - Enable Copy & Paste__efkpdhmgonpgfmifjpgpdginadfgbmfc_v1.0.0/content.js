const BLOCKED_EVENTS = [
  "copy",
  "cut",
  "paste",
  "contextmenu",
  "selectstart",
  "keydown",
];
const INLINE_ATTRIBUTES = [
  "oncopy",
  "oncut",
  "onpaste",
  "oncontextmenu",
  "onselectstart",
];
const STORAGE_KEY = "disabledHosts";
const STYLE_ID = "allow-paste-user-select-style";

let isEnabled = true;
let domObserver = null;
let listenersAttached = false;

function isEditingShortcut(event) {
  const key = (event.key || "").toLowerCase();

  if (
    (event.ctrlKey || event.metaKey) &&
    ["c", "x", "v", "insert"].includes(key)
  ) {
    return true;
  }

  if (event.shiftKey && ["insert", "delete"].includes(key)) {
    return true;
  }

  return false;
}

function swallowEvent(event) {
  if (!isEnabled) {
    return;
  }

  if (event.type === "keydown" && !isEditingShortcut(event)) {
    return;
  }

  event.stopImmediatePropagation();
  event.stopPropagation();
}

function attachEventGuards() {
  if (listenersAttached) {
    return;
  }

  for (const eventName of BLOCKED_EVENTS) {
    window.addEventListener(eventName, swallowEvent, true);
    document.addEventListener(eventName, swallowEvent, true);
  }

  listenersAttached = true;
}

function ensureStyle() {
  if (!document.documentElement || document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = [
    "html, body, * {",
    "  -webkit-user-select: text !important;",
    "  user-select: text !important;",
    "}",
    "input, textarea, [contenteditable], button, select, option {",
    "  -webkit-user-select: auto !important;",
    "  user-select: auto !important;",
    "}",
  ].join("\n");

  document.documentElement.appendChild(style);
}

function removeStyle() {
  document.getElementById(STYLE_ID)?.remove();
}

function clearInlineRestrictions(root) {
  if (!root || root.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const elements = [root];

  if (root.querySelectorAll) {
    elements.push(
      ...root.querySelectorAll(
        "[oncopy], [oncut], [onpaste], [oncontextmenu], [onselectstart]",
      ),
    );
  }

  for (const element of elements) {
    for (const attributeName of INLINE_ATTRIBUTES) {
      if (element.hasAttribute(attributeName)) {
        element.removeAttribute(attributeName);
      }

      if (typeof element[attributeName] === "function") {
        element[attributeName] = null;
      }
    }
  }
}

function startDomObserver() {
  if (!document.documentElement || domObserver) {
    return;
  }

  ensureStyle();
  clearInlineRestrictions(document.documentElement);

  domObserver = new MutationObserver((mutations) => {
    if (!isEnabled) {
      return;
    }

    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        clearInlineRestrictions(mutation.target);
      }

      for (const node of mutation.addedNodes) {
        clearInlineRestrictions(node);
      }
    }
  });

  domObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: INLINE_ATTRIBUTES,
  });
}

function stopDomObserver() {
  domObserver?.disconnect();
  domObserver = null;
  removeStyle();
}

function syncEnabledState(nextState) {
  if (nextState === isEnabled) {
    return;
  }

  isEnabled = nextState;

  if (isEnabled) {
    startDomObserver();
    clearInlineRestrictions(document.documentElement);
    ensureStyle();
    return;
  }

  stopDomObserver();
}

function waitForDocumentElement() {
  if (document.documentElement) {
    startDomObserver();
    return;
  }

  const observer = new MutationObserver(() => {
    if (!document.documentElement) {
      return;
    }

    observer.disconnect();
    startDomObserver();
  });

  observer.observe(document, { childList: true, subtree: true });
}

async function loadInitialState() {
  const response = await chrome.storage.local.get(STORAGE_KEY);
  const disabledHosts = Array.isArray(response[STORAGE_KEY])
    ? response[STORAGE_KEY]
    : [];
  const hostname = window.location.hostname;

  isEnabled = !disabledHosts.includes(hostname);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "allow-paste:set-enabled") {
    return undefined;
  }

  syncEnabledState(Boolean(message.enabled));
  sendResponse({ ok: true });
  return true;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[STORAGE_KEY]) {
    return;
  }

  const disabledHosts = Array.isArray(changes[STORAGE_KEY].newValue)
    ? changes[STORAGE_KEY].newValue
    : [];
  const nextState = !disabledHosts.includes(window.location.hostname);
  syncEnabledState(nextState);
});

async function initialize() {
  attachEventGuards();
  await loadInitialState();

  if (isEnabled) {
    waitForDocumentElement();
  }
}

initialize().catch(() => {
  attachEventGuards();
  waitForDocumentElement();
});
