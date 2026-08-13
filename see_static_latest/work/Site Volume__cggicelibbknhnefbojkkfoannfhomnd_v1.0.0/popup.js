const $ = (id) => document.getElementById(id);

const slider          = $("slider");
const volIcon         = $("vol-icon");
const volPct          = $("vol-pct");
const faviconEl       = $("favicon");
const hostnameEl      = $("hostname");
const savedSection    = $("saved-section");
const savedList       = $("saved-list");
const resetBtn        = $("reset-btn");
const subdomainRow    = $("subdomain-row");
const subdomainToggle = $("subdomain-toggle");

let host       = null;   // active-tab hostname      (e.g. "www.example.com")
let rootHost   = null;   // extracted root domain    (e.g. "example.com")
let storageKey = null;   // the key actually used in chrome.storage
let allData    = {};     // full chrome.storage snapshot

// ── helpers ──────────────────────────────────

function getRootDomain(hostname) {
  // IPs are left unchanged
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return hostname;
  const parts = hostname.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
}

function iconFor(pct) {
  if (pct === 0)  return "🔇";
  if (pct < 30)   return "🔉";
  return "🔊";
}

/** Sync every UI element that depends on the slider value. */
function syncUI() {
  const val = Number(slider.value);
  slider.style.setProperty("--pct", val + "%");
  volPct.textContent = val + "%";
  volIcon.textContent = iconFor(val);

  // colour-code the percentage
  volPct.className = "vol-pct";
  if      (val === 0) volPct.classList.add("muted");
  else if (val < 30)  volPct.classList.add("low");
}

/** Persist the current volume and push a live update to the page. */
function persist(vol) {
  if (!storageKey) return;                          // not initialised yet

  const entry = {
    volume: vol,
    favicon: faviconEl.src,
    includeSubdomains: subdomainToggle.checked
  };
  allData[storageKey] = entry;
  chrome.storage.local.set({ [storageKey]: entry });

  // push to content script so the change is instant (no reload)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0])
      chrome.tabs
        .sendMessage(tabs[0].id, {
          type: "SITE_VOLUME_SET",
          hostname: storageKey,
          volume: vol,
          includeSubdomains: subdomainToggle.checked
        })
        .catch(() => {});   // page may not have a content-script yet
  });
}

/** Render the "Other Sites" list from allData. */
function renderSavedList() {
  savedList.innerHTML = "";

  const others = Object.entries(allData)
    .filter(([h]) => h !== storageKey)
    .sort((a, b) => a[0].localeCompare(b[0]));

  savedSection.style.display = others.length ? "block" : "none";

  others.forEach(([h, data]) => {
    const row  = document.createElement("div");
    row.className = "saved-row";

    // left side: favicon + name/pct
    const left = document.createElement("div");
    left.className = "saved-left";

    const img  = document.createElement("img");
    img.className = "saved-favicon";
    img.src  = data.favicon || `https://${h}/favicon.ico`;
    img.alt  = "";
    img.onerror = () => img.classList.add("broken");

    const info = document.createElement("div");
    info.className = "saved-info";

    const name = document.createElement("span");
    name.className = "saved-name";
    name.textContent = h;

    const pct  = document.createElement("span");
    pct.className  = "saved-pct";
    pct.textContent = Math.round(data.volume * 100) + "%";

    info.append(name, pct);
    left.append(img, info);

    // remove button
    const rm = document.createElement("button");
    rm.className  = "rm-btn";
    rm.textContent = "\u00d7";          // ×
    rm.title      = "Remove";
    rm.onclick    = () => {
      chrome.storage.local.remove([h]);
      delete allData[h];
      renderSavedList();
    };

    row.append(left, rm);
    savedList.append(row);
  });
}

// ── initialise on popup open ──────────────────

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];

  // guard: only http(s) pages are supported
  if (!tab?.url?.match(/^https?:\/\//)) {
    $("popup").style.display     = "none";
    $("unsupported").style.display = "flex";
    return;
  }

  host     = new URL(tab.url).hostname;
  rootHost = getRootDomain(host);

  faviconEl.src = tab.favIconUrl || `https://${host}/favicon.ico`;
  faviconEl.onerror = () => (faviconEl.style.display = "none");
  hostnameEl.textContent = host;

  // hide subdomain toggle for localhost / IPs (no meaningful subdomains)
  const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
  if (isIP || host.split(".").length < 2) {
    subdomainRow.style.display = "none";
  }

  // pull every saved entry so we can render the list
  chrome.storage.local.get(null, (data) => {
    allData = data;

    // ── determine which entry governs this page ──
    let entry;
    let includeSubdomains;

    if (host === rootHost) {
      // on the root domain itself – only one possible entry
      entry             = allData[rootHost] || null;
      includeSubdomains = entry ? entry.includeSubdomains !== false : true;
    } else {
      // on a sub‑domain – exact entry takes priority
      const exactEntry = allData[host];
      const rootEntry  = allData[rootHost];

      if (exactEntry) {
        entry             = exactEntry;
        includeSubdomains = false;           // per‑subdomain entry → toggle OFF
      } else if (rootEntry && rootEntry.includeSubdomains !== false) {
        entry             = rootEntry;
        includeSubdomains = true;
      } else {
        entry             = null;
        includeSubdomains = true;            // default
      }
    }

    storageKey              = includeSubdomains ? rootHost : host;
    subdomainToggle.checked = includeSubdomains;

    slider.value = entry ? Math.round(entry.volume * 100) : 100;
    syncUI();
    renderSavedList();
  });
});

// ── events ────────────────────────────────────

slider.addEventListener("input", () => {
  syncUI();
  persist(Number(slider.value) / 100);
});

resetBtn.addEventListener("click", () => {
  slider.value = 100;
  syncUI();
  persist(1);
});

subdomainToggle.addEventListener("change", () => {
  if (subdomainToggle.checked && host !== rootHost) {
    // switching ON: drop the per‑subdomain entry so the root one takes over
    if (allData[host]) {
      chrome.storage.local.remove([host]);
      delete allData[host];
    }
  }

  storageKey = subdomainToggle.checked ? rootHost : host;
  persist(Number(slider.value) / 100);
  renderSavedList();
});
