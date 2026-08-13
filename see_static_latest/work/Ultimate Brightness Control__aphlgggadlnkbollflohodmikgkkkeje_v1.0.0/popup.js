const STORAGE_KEYS = [
  "brightness",
  "globalBrightness",
  "siteSettings",
  "globalDisabled",
  "disabledSites",
];

const slider = document.getElementById("brightnessSlider");
const display = document.getElementById("valueDisplay");
const hostValue = document.getElementById("hostValue");
const modeBadge = document.getElementById("modeBadge");
const statusDescription = document.getElementById("statusDescription");
const siteOnlyToggle = document.getElementById("siteOnlyToggle");
const disableHereButton = document.getElementById("disableHereButton");
const disableEverywhereButton = document.getElementById("disableEverywhereButton");
const guideButton = document.getElementById("guideButton");

let currentHostname = "";
let currentSettings = BrightnessSettings.normalizeStoredSettings({});

function getMessage(key) {
  return chrome.i18n.getMessage(key) || key;
}

function readStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS, (result) => resolve(result));
  });
}

function writeStorage(patch) {
  return new Promise((resolve) => {
    chrome.storage.local.set(patch, resolve);
  });
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs[0] || null));
  });
}

function getHasSiteOverride() {
  return Boolean(currentHostname && currentSettings.siteSettings[currentHostname]);
}

function getIsSiteDisabled() {
  return Boolean(currentHostname && currentSettings.disabledSites[currentHostname]);
}

function getEffectiveSettings() {
  return BrightnessSettings.getEffectiveSettings({
    hostname: currentHostname,
    settings: currentSettings,
  });
}

function snapBrightness(value) {
  const clamped = BrightnessSettings.clampBrightness(value);
  const nearestTen = Math.round(clamped / 10) * 10;

  return Math.abs(clamped - nearestTen) <= 2 ? nearestTen : clamped;
}

function getStatusCopy(effect) {
  if (!currentHostname) {
    return {
      badge: getMessage("badgeGlobal"),
      description: getMessage("statusUnsupported"),
    };
  }

  switch (effect.source) {
    case "site":
      return {
        badge: getMessage("badgeSite"),
        description: getMessage("statusSite"),
      };
    case "global-disabled":
      return {
        badge: getMessage("badgeGlobalDisabled"),
        description: getMessage("statusGlobalDisabled"),
      };
    case "site-disabled":
      return {
        badge: getMessage("badgeSiteDisabled"),
        description: getMessage("statusSiteDisabled"),
      };
    default:
      return {
        badge: getMessage("badgeGlobal"),
        description: getMessage("statusGlobal"),
      };
  }
}

let userIsDragging = false;

function refreshUi() {
  const effect = getEffectiveSettings();
  const statusCopy = getStatusCopy(effect);

  hostValue.textContent = currentHostname || "chrome:// page";
  // Don't override slider while user is actively dragging
  if (!userIsDragging) {
    slider.value = String(effect.brightness);
  }
  display.textContent = `${effect.brightness}%`;
  modeBadge.textContent = statusCopy.badge;
  statusDescription.textContent = statusCopy.description;

  siteOnlyToggle.disabled = !currentHostname;
  siteOnlyToggle.checked = getHasSiteOverride();

  disableHereButton.disabled = !currentHostname;
  disableHereButton.textContent = getMessage(getIsSiteDisabled() ? "enableHereButton" : "disableHereButton");
  disableEverywhereButton.textContent = getMessage(
    currentSettings.globalDisabled ? "enableEverywhereButton" : "disableEverywhereButton"
  );

  slider.disabled = effect.disabled;

  if (typeof drawTicks === "function") {
    drawTicks(effect.brightness);
  }
}

async function updateBrightness(nextBrightness) {
  const brightness = snapBrightness(nextBrightness);
  const patch = {};

  if (siteOnlyToggle.checked && currentHostname) {
    patch.siteSettings = {
      ...currentSettings.siteSettings,
      [currentHostname]: { brightness },
    };
  } else {
    patch.globalBrightness = brightness;
  }

  await writeStorage(patch);
  currentSettings = BrightnessSettings.normalizeStoredSettings({
    ...currentSettings,
    ...patch,
  });
  refreshUi();
}

async function toggleSiteOnly(checked) {
  if (!currentHostname) {
    refreshUi();
    return;
  }

  const siteSettings = { ...currentSettings.siteSettings };

  if (checked) {
    siteSettings[currentHostname] = {
      brightness: getEffectiveSettings().brightness,
    };
  } else {
    delete siteSettings[currentHostname];
  }

  await writeStorage({ siteSettings });
  currentSettings = BrightnessSettings.normalizeStoredSettings({
    ...currentSettings,
    siteSettings,
  });
  refreshUi();
}

async function toggleSiteDisabled() {
  if (!currentHostname) {
    return;
  }

  const disabledSites = { ...currentSettings.disabledSites };

  if (disabledSites[currentHostname]) {
    delete disabledSites[currentHostname];
  } else {
    disabledSites[currentHostname] = true;
  }

  await writeStorage({ disabledSites });
  currentSettings = BrightnessSettings.normalizeStoredSettings({
    ...currentSettings,
    disabledSites,
  });
  refreshUi();
}

async function toggleGlobalDisabled() {
  const globalDisabled = !currentSettings.globalDisabled;

  await writeStorage({ globalDisabled });
  currentSettings = BrightnessSettings.normalizeStoredSettings({
    ...currentSettings,
    globalDisabled,
  });
  refreshUi();
}

function showWarnBanner() {
  const banner = document.getElementById("warnBanner");
  if (banner) banner.classList.add("show");
}

async function initializePopup() {
  const [activeTab, storedSettings] = await Promise.all([getActiveTab(), readStorage()]);

  currentHostname = BrightnessSettings.getHostnameFromUrl(activeTab?.url || "");
  currentSettings = BrightnessSettings.normalizeStoredSettings(storedSettings);
  refreshUi();
}

slider.addEventListener("mousedown", () => { userIsDragging = true; });
slider.addEventListener("touchstart", () => { userIsDragging = true; }, { passive: true });
slider.addEventListener("mouseup", () => { userIsDragging = false; });
slider.addEventListener("touchend", () => { userIsDragging = false; });

slider.addEventListener("input", (event) => {
  if (typeof handleSnap === "function") handleSnap(slider);
  if (typeof drawTicks === "function") drawTicks(parseInt(slider.value));
  updateBrightness(event.target.value);
});

siteOnlyToggle.addEventListener("change", (event) => {
  toggleSiteOnly(event.target.checked);
});

disableHereButton.addEventListener("click", () => {
  toggleSiteDisabled();
  showWarnBanner();
});

disableEverywhereButton.addEventListener("click", () => {
  toggleGlobalDisabled();
  showWarnBanner();
});

guideButton.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (!Object.keys(changes).some((key) => STORAGE_KEYS.includes(key))) {
    return;
  }

  readStorage().then((storedSettings) => {
    currentSettings = BrightnessSettings.normalizeStoredSettings(storedSettings);
    refreshUi();
  });
});

initializePopup();
