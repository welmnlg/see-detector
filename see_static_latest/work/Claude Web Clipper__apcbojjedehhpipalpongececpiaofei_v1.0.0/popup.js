// Claude Web Clipper — Popup Script

const CONTEXT_WINDOW_LIMIT = 200000;
const CHARS_PER_TOKEN = 4;
const CATEGORIES = ["code", "docs", "reference", "example"];

// DOM elements
const clipList = document.getElementById("clipList");
const emptyState = document.getElementById("emptyState");
const tokenCountEl = document.getElementById("tokenCount");
const tokenPercentEl = document.getElementById("tokenPercent");
const contextBar = document.getElementById("contextBar");
const sessionSelect = document.getElementById("sessionSelect");
const saveModal = document.getElementById("saveModal");
const sessionNameInput = document.getElementById("sessionNameInput");

let clips = [];
let currentSession = "__default__";
let draggedId = null;

// Initialize
document.addEventListener("DOMContentLoaded", init);

async function init() {
  await loadSessions();
  await loadClips();
  setupEventListeners();
}

// Load clips from storage
async function loadClips() {
  const data = await chrome.storage.local.get("clips");
  clips = data.clips || [];
  renderClips();
  updateTokenCounter();
}

// Save clips to storage
async function saveClips() {
  await chrome.storage.local.set({ clips });
  chrome.runtime.sendMessage({ action: "updateBadge" });
  updateTokenCounter();
}

// Token counting
function estimateTokens(text) {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function getTotalTokens() {
  return clips.reduce((sum, clip) => sum + estimateTokens(clip.text), 0);
}

function updateTokenCounter() {
  const total = getTotalTokens();
  const percent = Math.min((total / CONTEXT_WINDOW_LIMIT) * 100, 100);

  tokenCountEl.textContent = total.toLocaleString();
  tokenPercentEl.textContent = percent.toFixed(1);

  contextBar.style.width = `${percent}%`;
  contextBar.classList.remove("warning", "danger");
  if (percent > 75) contextBar.classList.add("danger");
  else if (percent > 50) contextBar.classList.add("warning");
}

// Render clips
function renderClips() {
  // Remove all clip cards but keep empty state
  const cards = clipList.querySelectorAll(".clip-card");
  cards.forEach((card) => card.remove());

  if (clips.length === 0) {
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";

  clips.forEach((clip) => {
    const card = createClipCard(clip);
    clipList.appendChild(card);
  });
}

function createClipCard(clip) {
  const card = document.createElement("div");
  card.className = "clip-card";
  card.dataset.id = clip.id;
  card.draggable = true;

  const previewText =
    clip.text.length > 200 ? clip.text.slice(0, 200) + "..." : clip.text;
  const tokens = estimateTokens(clip.text);
  const timeAgo = getTimeAgo(clip.timestamp);
  const domain = extractDomain(clip.url);

  card.innerHTML = `
    <div class="clip-card-header">
      <div class="clip-title" title="${escapeHtml(clip.title)}">${escapeHtml(clip.title)}</div>
      <div class="clip-actions">
        <button class="clip-badge ${clip.category}" data-action="category" title="Click to change category">${clip.category}</button>
        <button class="delete-btn" data-action="delete" title="Delete clip">&times;</button>
      </div>
      <div class="category-dropdown" data-clip-id="${clip.id}">
        ${CATEGORIES.map((cat) => `<div class="category-option" data-category="${cat}">${cat}</div>`).join("")}
      </div>
    </div>
    <div class="clip-source">${domain}</div>
    <div class="clip-preview ${clip.isCode ? "code-preview" : ""}">${escapeHtml(previewText)}</div>
    <div class="clip-meta">
      <span>${tokens.toLocaleString()} tokens</span>
      <span>${timeAgo}</span>
    </div>
  `;

  // Event listeners
  card
    .querySelector('[data-action="delete"]')
    .addEventListener("click", (e) => {
      e.stopPropagation();
      deleteClip(clip.id);
    });

  card
    .querySelector('[data-action="category"]')
    .addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCategoryDropdown(clip.id, card);
    });

  card.querySelectorAll(".category-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      changeCategory(clip.id, opt.dataset.category);
    });
  });

  // Drag events
  card.addEventListener("dragstart", (e) => {
    draggedId = clip.id;
    card.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    draggedId = null;
    clipList
      .querySelectorAll(".drag-over")
      .forEach((el) => el.classList.remove("drag-over"));
  });

  card.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    card.classList.add("drag-over");
  });

  card.addEventListener("dragleave", () => {
    card.classList.remove("drag-over");
  });

  card.addEventListener("drop", (e) => {
    e.preventDefault();
    card.classList.remove("drag-over");
    if (draggedId && draggedId !== clip.id) {
      reorderClips(draggedId, clip.id);
    }
  });

  return card;
}

// Clip operations
function deleteClip(id) {
  clips = clips.filter((c) => c.id !== id);
  saveClips();
  renderClips();
}

function changeCategory(id, category) {
  const clip = clips.find((c) => c.id === id);
  if (clip) {
    clip.category = category;
    saveClips();
    renderClips();
  }
}

function toggleCategoryDropdown(clipId, card) {
  // Close all other dropdowns
  document.querySelectorAll(".category-dropdown.active").forEach((dd) => {
    dd.classList.remove("active");
  });
  const dropdown = card.querySelector(".category-dropdown");
  dropdown.classList.toggle("active");
}

function reorderClips(fromId, toId) {
  const fromIndex = clips.findIndex((c) => c.id === fromId);
  const toIndex = clips.findIndex((c) => c.id === toId);
  if (fromIndex === -1 || toIndex === -1) return;

  const [moved] = clips.splice(fromIndex, 1);
  clips.splice(toIndex, 0, moved);
  saveClips();
  renderClips();
}

// Close dropdowns when clicking elsewhere
document.addEventListener("click", () => {
  document.querySelectorAll(".category-dropdown.active").forEach((dd) => {
    dd.classList.remove("active");
  });
});

// Export functions
function formatMarkdown() {
  if (clips.length === 0) return "";

  let md = "# Claude Context — Web Clips\n\n";
  md += `> ${clips.length} clips | ~${getTotalTokens().toLocaleString()} tokens | Collected with [Claude Web Clipper](https://toolforte.com)\n\n`;
  md += "---\n\n";

  clips.forEach((clip, i) => {
    md += `## ${i + 1}. ${clip.title}\n\n`;
    md += `**Source**: [${extractDomain(clip.url)}](${clip.url})  \n`;
    md += `**Category**: ${clip.category} | **Clipped**: ${formatDate(clip.timestamp)}\n\n`;

    if (clip.isCode) {
      md += "```\n" + clip.text + "\n```\n\n";
    } else {
      md += clip.text + "\n\n";
    }

    md += "---\n\n";
  });

  return md;
}

function formatXml() {
  if (clips.length === 0) return "";

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += "<context>\n";
  xml += `  <meta clips="${clips.length}" tokens="${getTotalTokens()}" />\n\n`;

  clips.forEach((clip) => {
    xml += "  <source>\n";
    xml += `    <title>${escapeXml(clip.title)}</title>\n`;
    xml += `    <url>${escapeXml(clip.url)}</url>\n`;
    xml += `    <category>${clip.category}</category>\n`;
    xml += `    <timestamp>${new Date(clip.timestamp).toISOString()}</timestamp>\n`;
    xml += `    <content type="${clip.isCode ? "code" : "text"}">\n`;
    xml += `      ${escapeXml(clip.text)}\n`;
    xml += "    </content>\n";
    xml += "  </source>\n\n";
  });

  xml += "</context>";
  return xml;
}

function formatPlainText() {
  if (clips.length === 0) return "";

  let text = "CLAUDE CONTEXT — WEB CLIPS\n";
  text += "=".repeat(40) + "\n\n";

  clips.forEach((clip, i) => {
    text += `[${i + 1}] ${clip.title}\n`;
    text += `Source: ${clip.url}\n`;
    text += `Category: ${clip.category}\n`;
    text += "-".repeat(40) + "\n";
    text += clip.text + "\n\n";
    text += "=".repeat(40) + "\n\n";
  });

  return text;
}

async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = btn.textContent;
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove("copied");
    }, 1500);
  } catch (err) {
    // Fallback for clipboard API failure
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

// Session management
async function loadSessions() {
  const data = await chrome.storage.local.get(["sessions", "currentSession"]);
  const sessions = data.sessions || {};
  currentSession = data.currentSession || "__default__";

  // Rebuild select options
  sessionSelect.innerHTML =
    '<option value="__default__">Default Session</option>';
  Object.keys(sessions).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    sessionSelect.appendChild(option);
  });

  sessionSelect.value = currentSession;
}

async function switchSession(sessionName) {
  // Save current clips to current session
  const data = await chrome.storage.local.get("sessions");
  const sessions = data.sessions || {};

  if (currentSession !== "__default__") {
    sessions[currentSession] = clips;
  }

  // Load new session clips
  currentSession = sessionName;
  if (sessionName === "__default__") {
    const clipData = await chrome.storage.local.get("clips");
    clips = clipData.clips || [];
  } else {
    clips = sessions[sessionName] || [];
    await chrome.storage.local.set({ clips });
  }

  await chrome.storage.local.set({ sessions, currentSession: sessionName });
  renderClips();
  updateTokenCounter();
  chrome.runtime.sendMessage({ action: "updateBadge" });
}

async function saveSession(name) {
  if (!name) return;

  const data = await chrome.storage.local.get("sessions");
  const sessions = data.sessions || {};
  sessions[name] = [...clips];

  await chrome.storage.local.set({ sessions, currentSession: name });
  currentSession = name;
  await loadSessions();
  sessionSelect.value = name;
}

async function deleteSession(name) {
  if (name === "__default__") return;

  const data = await chrome.storage.local.get("sessions");
  const sessions = data.sessions || {};
  delete sessions[name];

  await chrome.storage.local.set({ sessions });

  // Switch to default
  currentSession = "__default__";
  await chrome.storage.local.set({ currentSession: "__default__" });
  const clipData = await chrome.storage.local.get("clips");
  clips = clipData.clips || [];

  await loadSessions();
  renderClips();
  updateTokenCounter();
}

// Event listeners
function setupEventListeners() {
  // Export buttons
  document.getElementById("copyMdBtn").addEventListener("click", function () {
    copyToClipboard(formatMarkdown(), this);
  });

  document.getElementById("copyXmlBtn").addEventListener("click", function () {
    copyToClipboard(formatXml(), this);
  });

  document.getElementById("copyTextBtn").addEventListener("click", function () {
    copyToClipboard(formatPlainText(), this);
  });

  // Clear all
  document.getElementById("clearAllBtn").addEventListener("click", () => {
    if (clips.length === 0) return;
    if (confirm("Delete all clips in this session?")) {
      clips = [];
      saveClips();
      renderClips();
    }
  });

  // Session management
  sessionSelect.addEventListener("change", (e) => {
    switchSession(e.target.value);
  });

  document.getElementById("saveSessionBtn").addEventListener("click", () => {
    saveModal.classList.add("active");
    sessionNameInput.value =
      currentSession === "__default__" ? "" : currentSession;
    sessionNameInput.focus();
  });

  document
    .getElementById("newSessionBtn")
    .addEventListener("click", async () => {
      // Save current clips, start fresh
      if (currentSession !== "__default__") {
        const data = await chrome.storage.local.get("sessions");
        const sessions = data.sessions || {};
        sessions[currentSession] = clips;
        await chrome.storage.local.set({ sessions });
      }

      clips = [];
      currentSession = "__default__";
      await chrome.storage.local.set({ clips, currentSession: "__default__" });
      sessionSelect.value = "__default__";
      renderClips();
      updateTokenCounter();
      chrome.runtime.sendMessage({ action: "updateBadge" });
    });

  document.getElementById("deleteSessionBtn").addEventListener("click", () => {
    if (currentSession === "__default__") return;
    if (confirm(`Delete session "${currentSession}"?`)) {
      deleteSession(currentSession);
    }
  });

  // Modal
  document.getElementById("saveModalConfirm").addEventListener("click", () => {
    const name = sessionNameInput.value.trim();
    if (name) {
      saveSession(name);
      saveModal.classList.remove("active");
    }
  });

  document.getElementById("saveModalCancel").addEventListener("click", () => {
    saveModal.classList.remove("active");
  });

  sessionNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const name = sessionNameInput.value.trim();
      if (name) {
        saveSession(name);
        saveModal.classList.remove("active");
      }
    }
    if (e.key === "Escape") {
      saveModal.classList.remove("active");
    }
  });

  // Listen for storage changes (new clips from background)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.clips) {
      clips = changes.clips.newValue || [];
      renderClips();
      updateTokenCounter();
    }
  });
}

// Utility functions
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
