// popup.js — Popup logic for Magnet Link Grabber

const statusEl   = document.getElementById("status");
const controlsEl = document.getElementById("controls");
const listEl     = document.getElementById("magnet-list");
const emptyEl    = document.getElementById("empty");
const countEl    = document.getElementById("count");
const toastEl    = document.getElementById("toast");
const btnCopy    = document.getElementById("btn-copy");
const btnSelAll  = document.getElementById("btn-select-all");
const btnDesel   = document.getElementById("btn-deselect-all");

let magnetLinks = [];

/* ── Helpers ─────────────────────────────────────── */

/**
 * Remove duplicate magnet links based on their info hash.
 * The info hash (btih) is the unique identifier for a torrent.
 * Keeps the version with the best display name (or first one if equal).
 */
function removeDuplicates(magnets) {
  const hashMap = new Map();
  
  magnets.forEach((magnet) => {
    const hash = magnet.hash.toLowerCase();
    
    if (!hash || hash === "—") {
      // If no hash, keep all (can't deduplicate)
      if (!hashMap.has("no-hash")) {
        hashMap.set("no-hash", []);
      }
      hashMap.get("no-hash").push(magnet);
      return;
    }
    
    if (!hashMap.has(hash)) {
      hashMap.set(hash, magnet);
    } else {
      // Compare and keep the better one
      const existing = hashMap.get(hash);
      const existingHasName = existing.name && !existing.name.startsWith("Unknown");
      const currentHasName = magnet.name && !magnet.name.startsWith("Unknown");
      
      // Prefer the one with a display name
      if (currentHasName && !existingHasName) {
        hashMap.set(hash, magnet);
      }
      // If both have names or both don't, keep the existing one (first found)
    }
  });
  
  // Handle no-hash items separately
  const noHashItems = hashMap.get("no-hash") || [];
  hashMap.delete("no-hash"); // Remove from map so it's not included in unique
  
  // Convert map values back to array (only items with valid hashes)
  const unique = Array.from(hashMap.values());
  
  return [...unique, ...noHashItems];
}

/** Parse a magnet URI and return a friendly display name + info hash. */
function parseMagnet(uri) {
  try {
    // Remove the magnet: prefix and parse query string
    const queryString = uri.replace(/^magnet:\?/, "");
    
    // URLSearchParams might not handle all cases, so we'll parse manually for robustness
    const params = new URLSearchParams(queryString);
    
    // Get display name - try multiple methods
    let dn = params.get("dn");
    
    // If dn is not found via URLSearchParams, try manual parsing (handles multiple dn params or encoding issues)
    if (!dn) {
      const dnMatch = queryString.match(/[&?]dn=([^&]+)/i);
      if (dnMatch) {
        dn = dnMatch[1];
      }
    }
    
    // Decode the display name properly
    let displayName = null;
    if (dn) {
      try {
        // Try decoding - might be URL encoded multiple times
        displayName = decodeURIComponent(dn.replace(/\+/g, " "));
        // If that fails, try again (some sites double-encode)
        if (displayName.includes('%')) {
          displayName = decodeURIComponent(displayName);
        }
      } catch (e) {
        // If decoding fails, use the raw value
        displayName = dn.replace(/\+/g, " ");
      }
    }
    
    // Extract info hash from xt parameter
    const xt = params.get("xt") || "";
    const hashMatch = xt.match(/urn:btih:([a-f0-9]{40}|[a-z2-7]{32})/i);
    const hash = hashMatch ? hashMatch[1] : null;
    
    // If no hash found, try extracting from the full URI
    let finalHash = hash;
    if (!finalHash) {
      const uriHashMatch = uri.match(/urn:btih:([a-f0-9]{40}|[a-z2-7]{32})/i);
      finalHash = uriHashMatch ? uriHashMatch[1] : null;
    }

    return {
      uri,
      name: displayName || (finalHash ? `Unknown (${finalHash.slice(0, 12)}…)` : "Unknown magnet"),
      hash: finalHash || "—",
    };
  } catch (error) {
    // Fallback if parsing completely fails
    const hashMatch = uri.match(/urn:btih:([a-f0-9]{40}|[a-z2-7]{32})/i);
    const hash = hashMatch ? hashMatch[1] : null;
    return {
      uri,
      name: hash ? `Unknown (${hash.slice(0, 12)}…)` : "Unknown magnet",
      hash: hash || "—",
    };
  }
}

/** Show a brief toast notification. */
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastEl.classList.add("show");
  setTimeout(() => {
    toastEl.classList.remove("show");
    setTimeout(() => toastEl.classList.add("hidden"), 300);
  }, 1800);
}

/** Update the selected‐count badge. */
function updateCount() {
  const checked = listEl.querySelectorAll('input[type="checkbox"]:checked').length;
  countEl.textContent = `${checked} / ${magnetLinks.length} selected`;
}

/* ── Render ──────────────────────────────────────── */

function renderList(magnets) {
  // Parse all magnet links
  const parsed = magnets.map(parseMagnet);
  
  // Remove duplicates based on info hash
  magnetLinks = removeDuplicates(parsed);

  if (magnetLinks.length === 0) {
    emptyEl.classList.remove("hidden");
    controlsEl.classList.add("hidden");
    statusEl.textContent = "";
    return;
  }

  emptyEl.classList.add("hidden");
  controlsEl.classList.remove("hidden");
  statusEl.textContent = "";

  listEl.innerHTML = "";
  magnetLinks.forEach((m, i) => {
    const li = document.createElement("li");
    li.className = "magnet-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = true;
    cb.dataset.index = i;
    cb.addEventListener("change", updateCount);

    const info = document.createElement("div");
    info.className = "magnet-info";

    const name = document.createElement("span");
    name.className = "magnet-name";
    name.textContent = m.name;
    name.title = m.name;

    const hash = document.createElement("span");
    hash.className = "magnet-hash";
    hash.textContent = m.hash;
    hash.title = m.uri;

    info.appendChild(name);
    info.appendChild(hash);
    li.appendChild(cb);
    li.appendChild(info);
    listEl.appendChild(li);
  });

  updateCount();
}

/* ── Actions ─────────────────────────────────────── */

btnSelAll.addEventListener("click", () => {
  listEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = true));
  updateCount();
});

btnDesel.addEventListener("click", () => {
  listEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  updateCount();
});

btnCopy.addEventListener("click", async () => {
  const selected = [];
  listEl.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
    selected.push(magnetLinks[cb.dataset.index].uri);
  });

  if (selected.length === 0) {
    showToast("Nothing selected!");
    return;
  }

  const text = selected.join("\n");
  try {
    await navigator.clipboard.writeText(text);
    showToast(`Copied ${selected.length} link${selected.length > 1 ? "s" : ""}!`);
  } catch (err) {
    // Fallback: textarea hack
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(`Copied ${selected.length} link${selected.length > 1 ? "s" : ""}!`);
  }
});

/* ── Init: request magnets from the active tab ───── */

statusEl.textContent = "Scanning page…";

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]?.id) {
    statusEl.textContent = "Cannot access this page.";
    return;
  }

  chrome.tabs.sendMessage(tabs[0].id, { action: "getMagnets" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      // Content script might not be injected yet — use scripting API as fallback
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ["content.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            statusEl.textContent = "Cannot access this page (restricted).";
            return;
          }
          // Retry after injection
          chrome.tabs.sendMessage(tabs[0].id, { action: "getMagnets" }, (resp) => {
            if (chrome.runtime.lastError || !resp) {
              statusEl.textContent = "Failed to scan page.";
              return;
            }
            renderList(resp.magnets);
          });
        }
      );
      return;
    }
    renderList(response.magnets);
  });
});
