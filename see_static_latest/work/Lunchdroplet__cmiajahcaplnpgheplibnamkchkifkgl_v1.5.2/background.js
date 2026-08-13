const STORAGE_KEY = "lunchdroplet";
let debugOn = false;
chrome.storage.local.get("lunchdroplet_debug", (r) => { debugOn = !!r.lunchdroplet_debug; });
chrome.storage.onChanged.addListener((changes) => {
  if (changes.lunchdroplet_debug) debugOn = !!changes.lunchdroplet_debug.newValue;
});
const LOG = (...args) => { if (debugOn) console.log("[lunchdroplet:bg]", ...args); };

// Call from service worker console:
//   self.debug(true)   — ignore ordering end time, keep processing updates
//   self.debug(false)  — back to normal
//   self.reset()       — clear all state and alarms
//   self.testAlert()   — send a test notification + voice/alert to the active tab
self.debug = async function (on) {
  await chrome.storage.local.set({ lunchdroplet_debug: !!on });
  LOG("Debug mode:", on ? "ON (ignoring ordering end time)" : "OFF");
};

self.reset = async function () {
  LOG("reset() — clearing stored state, alarms, and debug flag");
  await clearStored();
  await chrome.alarms.clearAll();
  await chrome.storage.local.remove("lunchdroplet_debug");
  LOG("reset() done — next page load will be treated as initial");
};

self.testAlert = async function (text = "Test: Taco Bell has open slots again (3 available).") {
  await notify("Lunchdroplet Test", text);
  LOG("testAlert() — sent notification + alert to active tab");
};

async function isDebug() {
  const result = await chrome.storage.local.get("lunchdroplet_debug");
  return !!result.lunchdroplet_debug;
}

async function getStored() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || null;
}

function setStored(data) {
  return chrome.storage.local.set({ [STORAGE_KEY]: data });
}

function clearStored() {
  return chrome.storage.local.remove(STORAGE_KEY);
}

const SETTINGS_KEY = "lunchdroplet_settings";
const SETTINGS_DEFAULTS = { browser: true, alerts: false, voice: false, volume: 0.25, alertMode: "all", favorites: [] };

async function getSettings() {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...SETTINGS_DEFAULTS, ...result[SETTINGS_KEY] };
}

function matchesFavorite(restaurantName, favorites) {
  const lower = restaurantName.toLowerCase();
  return favorites.some((f) => lower.includes(f.toLowerCase()));
}

async function notify(title, message) {
  LOG("[lunchdroplet:bg]", "NOTIFY:", title, "—", message);
  const settings = await getSettings();
  LOG("Settings:", JSON.stringify(settings));

  if (settings.browser) {
    try {
      const id = await chrome.notifications.create({
        type: "basic",
        iconUrl: "icon128.png",
        title,
        message,
      });
      LOG("Notification created, id:", id);
    } catch (e) {
      LOG("Notification FAILED:", e.message);
    }
  }

  alertTab({
    text: `${title}\n${message}`,
    alert: settings.alerts,
    voice: settings.voice,
    volume: settings.volume,
  });
}

async function ensureAlarms(orderingEnd) {
  const existing = await chrome.alarms.getAll();
  if (existing.length > 0) {
    LOG("Alarms already set:", existing.map(a => a.name).join(", "));
    return;
  }
  LOG("No alarms found — recreating");
  setupAlarms(orderingEnd);
}

function setupAlarms(orderingEnd) {
  const now = Date.now();
  LOG(
    "Setting up alarms for orderingEnd:",
    new Date(orderingEnd).toLocaleTimeString(),
    `(${Math.round((orderingEnd - now) / 60_000)} min from now)`
  );

  const at15 = orderingEnd - 15 * 60_000;
  if (at15 > now) {
    chrome.alarms.create("ordering-15min", { when: at15 });
    LOG("  alarm ordering-15min at", new Date(at15).toLocaleTimeString());
  } else {
    LOG("  alarm ordering-15min skipped (already past)");
  }

  const at5 = orderingEnd - 5 * 60_000;
  if (at5 > now) {
    chrome.alarms.create("ordering-5min", { when: at5 });
    LOG("  alarm ordering-5min at", new Date(at5).toLocaleTimeString());
  } else {
    LOG("  alarm ordering-5min skipped (already past)");
  }

  if (orderingEnd > now) {
    chrome.alarms.create("ordering-closed", { when: orderingEnd });
    LOG(
      "  alarm ordering-closed at",
      new Date(orderingEnd).toLocaleTimeString()
    );
  } else {
    LOG("  alarm ordering-closed skipped (already past)");
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  LOG("Alarm fired:", alarm.name);
  switch (alarm.name) {
    case "ordering-15min":
      notify("Ordering closes soon", "15 minutes left to place your order!");
      break;
    case "ordering-5min":
      notify("Ordering closes very soon!", "Only 5 minutes left to order!");
      break;
    case "ordering-closed":
      notify("Ordering closed", "The ordering window has closed.");
      LOG("Clearing stored state and all alarms");
      await clearStored();
      await chrome.alarms.clearAll();
      break;
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "STATE_UPDATE") {
    LOG(
      "Received STATE_UPDATE, isInitial:",
      message.isInitial,
      "date:",
      message.state?.date
    );
    handleStateUpdate(message.state, message.isInitial).then(sendResponse);
    return true;
  }
  if (message.type === "ADD_FAVORITE") {
    (async () => {
      const settings = await getSettings();
      const favs = settings.favorites || [];
      const name = message.name;
      const lower = name.toLowerCase();
      if (favs.some((f) => f.toLowerCase() === lower)) {
        sendResponse({ added: false, duplicate: true });
        return;
      }
      const updated = [...favs, name];
      await chrome.storage.local.set({
        [SETTINGS_KEY]: { ...settings, favorites: updated },
      });
      LOG("Added favorite:", name);
      sendResponse({ added: true });
    })();
    return true;
  }
});

function alertTab(payload) {
  chrome.tabs.query({ url: ["https://*.lunchdrop.com/go/*", "https://*.lunchdrop.com/app/*"] }, (tabs) => {
    const target = tabs.find(t => t.active) || tabs[0];
    if (target) {
      chrome.tabs.sendMessage(target.id, { type: "ALERT", ...payload });
    }
  });
}

async function handleStateUpdate(newState, isInitial) {
  if (!newState) {
    LOG("newState is null — ignoring");
    return { shouldLog: false };
  }

  const debugOn = await isDebug();
  const orderingEnd = newState.orderingEnd;

  if (orderingEnd && Date.now() >= orderingEnd) {
    if (debugOn) {
      LOG("Ordering window already closed — but debug mode ON, continuing");
    } else {
      LOG("Ordering window already closed — clearing state");
      await clearStored();
      await chrome.alarms.clearAll();
      return { shouldLog: false };
    }
  }

  const stored = await getStored();
  LOG("Stored state:", stored ? `date=${stored.date}, ${Object.keys(stored.restaurants).length} restaurants` : "none");

  if (isInitial && !stored) {
    LOG("Initial load, no stored state — saving without notifications");
    await setStored({
      date: newState.date,
      orderingEnd,
      restaurants: newState.restaurants,
    });
    if (orderingEnd) {
      setupAlarms(orderingEnd);
    }
    return { shouldLog: true };
  }

  if (!stored) {
    LOG("No stored state (non-initial) — saving as baseline");
    await setStored({
      date: newState.date,
      orderingEnd,
      restaurants: newState.restaurants,
    });
    if (orderingEnd) {
      setupAlarms(orderingEnd);
    }
    return { shouldLog: true };
  }

  if (stored.date !== newState.date) {
    LOG("Date changed:", stored.date, "→", newState.date, "— resetting state");
    await setStored({
      date: newState.date,
      orderingEnd,
      restaurants: newState.restaurants,
    });
    if (orderingEnd) {
      await chrome.alarms.clearAll();
      setupAlarms(orderingEnd);
    }
    return { shouldLog: true };
  }

  const oldR = stored.restaurants;
  const newR = newState.restaurants;
  let changed = false;

  const settings = await getSettings();
  const favOnly = settings.alertMode === "favorites";
  const favs = settings.favorites || [];
  LOG("Alert mode:", settings.alertMode, "favorites:", favs.length);

  LOG("Comparing restaurants — old:", Object.keys(oldR).length, "new:", Object.keys(newR).length);

  for (const [id, restaurant] of Object.entries(newR)) {
    if (!oldR[id]) {
      LOG(`  NEW: "${restaurant.name}" (${id}) — not in stored state`);
      changed = true;
      if (!favOnly || matchesFavorite(restaurant.name, favs)) {
        notify(
          "New restaurant available!",
          `${restaurant.name} was added to today's menu.`
        );
      } else {
        LOG(`  skipping notification (not a favorite)`);
      }
      continue;
    }

    const wasAvailable = oldR[id].available;
    const nowAvailable = restaurant.available;

    if (wasAvailable !== nowAvailable) {
      LOG(
        `  CHANGED: "${restaurant.name}" (${id}) — ${wasAvailable ? "AVAILABLE" : "SOLD OUT"} → ${nowAvailable ? "AVAILABLE" : "SOLD OUT"}`
      );
      changed = true;
    } else {
      LOG(`  unchanged: "${restaurant.name}" (${id}) — ${nowAvailable ? "available" : "sold out"}`);
    }

    if (!wasAvailable && nowAvailable) {
      if (!favOnly || matchesFavorite(restaurant.name, favs)) {
        notify(
          "Restaurant available again!",
          `${restaurant.name} has open slots again (${restaurant.numSlots} available).`
        );
      } else {
        LOG(`  skipping notification (not a favorite)`);
      }
    }
  }

  for (const id of Object.keys(oldR)) {
    if (!newR[id]) {
      LOG(`  REMOVED: "${oldR[id].name}" (${id}) — no longer in deliveries`);
      changed = true;
    }
  }

  LOG("Saving updated state");
  await setStored({
    date: newState.date,
    orderingEnd,
    restaurants: newState.restaurants,
  });
  if (orderingEnd) {
    await ensureAlarms(orderingEnd);
  }
  return { shouldLog: changed };
}
