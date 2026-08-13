const SETTINGS_KEY = "lunchdroplet_settings";

const DEFAULTS = {
  browser: true,
  alerts: false,
  voice: false,
  volume: 0.25,
  alertMode: "all",
  favorites: [],
};

const els = {
  browser: document.getElementById("browser"),
  alerts: document.getElementById("alerts"),
  voice: document.getElementById("voice"),
  volume: document.getElementById("volume"),
  volumeRow: document.getElementById("volume-row"),
  volumeValue: document.getElementById("volume-value"),
  modeAll: document.getElementById("mode-all"),
  modeFavorites: document.getElementById("mode-favorites"),
};

const savedEl = document.getElementById("saved");
const favInput = document.getElementById("fav-input");
const favAddBtn = document.getElementById("fav-add-btn");
const favListEl = document.getElementById("fav-list");
const favEmptyEl = document.getElementById("fav-empty");

function updateVolumeState(voiceEnabled) {
  els.volumeRow.classList.toggle("disabled", !voiceEnabled);
}

function flashSaved() {
  savedEl.classList.add("show");
  setTimeout(() => savedEl.classList.remove("show"), 1500);
}

async function getSettings() {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULTS, ...result[SETTINGS_KEY] };
}

async function saveSettings(partial) {
  const current = await getSettings();
  const merged = { ...current, ...partial };
  await chrome.storage.local.set({ [SETTINGS_KEY]: merged });
  flashSaved();
}

function renderFavorites(favorites) {
  favListEl.innerHTML = "";
  favEmptyEl.style.display = favorites.length ? "none" : "block";
  for (const name of favorites) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = name;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.addEventListener("click", () => removeFavorite(name));
    li.appendChild(span);
    li.appendChild(btn);
    favListEl.appendChild(li);
  }
}

async function addFavorite() {
  const val = favInput.value.trim();
  if (!val) return;
  const settings = await getSettings();
  const lower = val.toLowerCase();
  if (settings.favorites.some((f) => f.toLowerCase() === lower)) {
    favInput.value = "";
    return;
  }
  const updated = [...settings.favorites, val];
  await saveSettings({ favorites: updated });
  renderFavorites(updated);
  favInput.value = "";
}

async function removeFavorite(name) {
  const settings = await getSettings();
  const updated = settings.favorites.filter((f) => f !== name);
  await saveSettings({ favorites: updated });
  renderFavorites(updated);
}

async function load() {
  const settings = await getSettings();
  els.browser.checked = settings.browser;
  els.alerts.checked = settings.alerts;
  els.voice.checked = settings.voice;
  els.volume.value = settings.volume;
  els.volumeValue.textContent = Math.round(settings.volume * 100) + "%";
  updateVolumeState(settings.voice);
  if (settings.alertMode === "favorites") {
    els.modeFavorites.checked = true;
  } else {
    els.modeAll.checked = true;
  }
  renderFavorites(settings.favorites);
}

els.browser.addEventListener("change", () => saveSettings({ browser: els.browser.checked }));
els.alerts.addEventListener("change", () => saveSettings({ alerts: els.alerts.checked }));
els.voice.addEventListener("change", () => {
  saveSettings({ voice: els.voice.checked });
  updateVolumeState(els.voice.checked);
});
els.volume.addEventListener("input", () => {
  els.volumeValue.textContent = Math.round(els.volume.value * 100) + "%";
});
els.volume.addEventListener("change", () => {
  saveSettings({ volume: parseFloat(els.volume.value) });
});
els.modeAll.addEventListener("change", () => saveSettings({ alertMode: "all" }));
els.modeFavorites.addEventListener("change", () => saveSettings({ alertMode: "favorites" }));
favAddBtn.addEventListener("click", addFavorite);
favInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addFavorite();
});

load();
