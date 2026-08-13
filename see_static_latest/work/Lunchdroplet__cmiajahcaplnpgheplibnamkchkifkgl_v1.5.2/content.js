const POLL_INTERVAL_MS = 60_000;
const IDLE_THRESHOLD_MS = 10_000;
const RETRY_MS = 5_000;
const SESSION_KEY = "lunchdroplet_initialized";
let debugOn = false;
chrome.storage.local.get("lunchdroplet_debug", (r) => { debugOn = !!r.lunchdroplet_debug; });
chrome.storage.onChanged.addListener((changes) => {
  if (changes.lunchdroplet_debug) debugOn = !!changes.lunchdroplet_debug.newValue;
});
const LOG = (...args) => { if (debugOn) console.log("[lunchdroplet:content]", ...args); };

let lastActivityAt = Date.now();

function trackActivity() {
  lastActivityAt = Date.now();
}

document.addEventListener("mousemove", trackActivity);
document.addEventListener("click", trackActivity);
document.addEventListener("keydown", trackActivity);
document.addEventListener("scroll", trackActivity);

function extractPageData() {
  const appDiv = document.getElementById("app");
  if (!appDiv || !appDiv.dataset.page) {
    LOG("No #app div or no data-page attribute found");
    return null;
  }
  try {
    const data = JSON.parse(appDiv.dataset.page);
    LOG("Parsed data-page OK, component:", data?.component);
    return data;
  } catch (e) {
    LOG("Failed to parse data-page JSON:", e.message);
    return null;
  }
}

function extractState(pageData) {
  const lunchDay = pageData?.props?.lunchDay;
  if (!lunchDay?.deliveries) {
    LOG("No lunchDay.deliveries in page data");
    return null;
  }

  const restaurants = {};
  let latestOrderingEnd = null;

  for (const d of lunchDay.deliveries) {
    const available = d.numSlotsAvailable > 0;
    restaurants[d.id] = {
      name: d.restaurantName,
      available,
      numSlots: d.numSlotsAvailable,
    };
    LOG(
      `  restaurant "${d.restaurantName}" (${d.id}): ${available ? "AVAILABLE" : "SOLD OUT"}, slots=${d.numSlotsAvailable}`
    );

    if (d.orderingEndWithTimezone) {
      const end = new Date(d.orderingEndWithTimezone).getTime();
      if (!latestOrderingEnd || end > latestOrderingEnd) {
        latestOrderingEnd = end;
      }
    }
  }

  const count = Object.keys(restaurants).length;
  LOG(
    `Extracted state: date=${lunchDay.date}, ${count} restaurants, orderingEnd=${latestOrderingEnd ? new Date(latestOrderingEnd).toLocaleTimeString() : "none"}`
  );

  return {
    date: lunchDay.date,
    orderingEnd: latestOrderingEnd,
    restaurants,
  };
}

function logRestaurants(restaurants) {
  document.dispatchEvent(new CustomEvent("lunchdroplet:log", {
    detail: { restaurants },
  }));
}

function reloadWhenIdle() {
  const idleFor = Date.now() - lastActivityAt;
  if (idleFor >= IDLE_THRESHOLD_MS) {
    LOG("User idle for", Math.round(idleFor / 1000), "s — reloading page");
    location.reload();
    return;
  }
  LOG(
    "User still active (idle",
    Math.round(idleFor / 1000),
    "s) — retrying in",
    RETRY_MS / 1000,
    "s"
  );
  setTimeout(reloadWhenIdle, RETRY_MS);
}

function scheduleReload(interval = POLL_INTERVAL_MS) {
  LOG("Scheduling reload in", interval / 1000, "s");
  setTimeout(() => {
    LOG("Poll timer fired — checking idle state");
    reloadWhenIdle();
  }, interval);
}

async function init() {
  LOG("init() — extracting page data");
  const pageData = extractPageData();
  if (!pageData) return;

  const state = extractState(pageData);
  if (!state) return;

  if (state.orderingEnd && Date.now() >= state.orderingEnd) {
    const result = await chrome.storage.local.get("lunchdroplet_debug");
    if (result.lunchdroplet_debug) {
      LOG("Ordering window already closed — but debug mode ON, continuing");
    } else {
      LOG("Ordering window already closed — not starting");
      return;
    }
  }

  const isInitial = !sessionStorage.getItem(SESSION_KEY);
  LOG("isInitial:", isInitial);
  if (isInitial) {
    sessionStorage.setItem(SESSION_KEY, "1");
  }

  logRestaurants(state.restaurants);

  try {
    await chrome.runtime.sendMessage({
      type: "STATE_UPDATE",
      state,
      isInitial,
    });
    LOG("Sent STATE_UPDATE to background");
  } catch (e) {
    LOG("Failed to send message:", e.message);
    return;
  }

  const debugResult = await chrome.storage.local.get("lunchdroplet_debug");
  scheduleReload(debugResult.lunchdroplet_debug ? 10_000 : POLL_INTERVAL_MS);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "ALERT") {
    document.dispatchEvent(new CustomEvent("lunchdroplet:log", {
      detail: { text: message.text },
    }));
    LOG("voice:", message.voice, "alert:", message.alert);
    if (message.voice) {
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.volume = message.volume ?? 0.25;
      window.speechSynthesis.speak(utterance);
    }
    if (message.alert) {
      alert(message.text);
    }
  }
});

// Call from page console: lunchdropletResume()
document.addEventListener("lunchdroplet:resume", () => {
  LOG("lunchdropletResume() — restarting refresh cycle");
  scheduleReload();
});

// Call from page console: lunchdropletSync()
document.addEventListener("lunchdroplet:sync", async () => {
  LOG("lunchdropletSync() — re-reading page data and sending to background");
  const pageData = extractPageData();
  if (!pageData) return;
  const state = extractState(pageData);
  if (!state) return;
  try {
    const response = await chrome.runtime.sendMessage({ type: "STATE_UPDATE", state, isInitial: false });
    LOG("Sent STATE_UPDATE to background");
    if (response?.shouldLog) {
      logRestaurants(state.restaurants);
    }
  } catch (e) {
    LOG("Failed to send message:", e.message);
  }
});

function injectFavoriteButtons() {
  const pageData = extractPageData();
  if (!pageData) return;
  const deliveries = pageData?.props?.lunchDay?.deliveries;
  if (!deliveries) return;

  const nameById = {};
  for (const d of deliveries) {
    nameById[d.id] = d.restaurantName;
  }

  const container = document.querySelector(".flex.flex-wrap.gap-3");
  if (!container) {
    LOG("No tile container found");
    return;
  }

  const tileLinks = container.querySelectorAll("a[href*='/go/']");
  LOG("Found", tileLinks.length, "restaurant tile links");

  for (const link of tileLinks) {
    const href = link.getAttribute("href") || "";
    const parts = href.split("/");
    const deliveryId = parts[parts.length - 1];
    const name = nameById[deliveryId];
    if (!name) continue;

    const wrapper = link.querySelector("div");
    if (!wrapper) continue;
    wrapper.style.position = "relative";

    const btn = document.createElement("button");
    btn.textContent = "\u2605 Lunchdroplet Favorite";
    btn.style.cssText = [
      "position:absolute",
      "bottom:4px",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:50",
      "padding:3px 8px",
      "font-size:11px",
      "font-weight:600",
      "border:none",
      "border-radius:4px",
      "background:rgba(0,0,0,0.7)",
      "color:#fff",
      "cursor:pointer",
      "white-space:nowrap",
      "opacity:0",
      "transition:opacity 0.15s",
    ].join(";");

    wrapper.addEventListener("mouseenter", () => { btn.style.opacity = "1"; });
    wrapper.addEventListener("mouseleave", () => { btn.style.opacity = "0"; });

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const resp = await chrome.runtime.sendMessage({ type: "ADD_FAVORITE", name });
        if (resp?.added) {
          alert(`Added "${name}" to Lunchdroplet favorites!`);
        } else if (resp?.duplicate) {
          alert(`"${name}" is already in your Lunchdroplet favorites.`);
        }
      } catch (err) {
        LOG("Failed to add favorite:", err.message);
      }
    });

    wrapper.appendChild(btn);
  }
}

init();
injectFavoriteButtons();
