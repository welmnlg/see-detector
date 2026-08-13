const DEFAULT_BRIGHTNESS = 100;

function clampBrightness(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return DEFAULT_BRIGHTNESS;
  }

  return Math.min(200, Math.max(10, Math.round(numericValue)));
}

function normalizeStoredSettings(rawSettings = {}) {
  const legacyBrightness = rawSettings.brightness;
  const globalBrightness = rawSettings.globalBrightness ?? legacyBrightness ?? DEFAULT_BRIGHTNESS;

  return {
    globalBrightness: clampBrightness(globalBrightness),
    siteSettings: normalizeSiteSettings(rawSettings.siteSettings),
    globalDisabled: Boolean(rawSettings.globalDisabled),
    disabledSites: normalizeDisabledSites(rawSettings.disabledSites),
  };
}

function normalizeSiteSettings(siteSettings) {
  if (!siteSettings || typeof siteSettings !== "object") {
    return {};
  }

  return Object.entries(siteSettings).reduce((accumulator, [hostname, siteConfig]) => {
    if (!hostname || !siteConfig || typeof siteConfig !== "object") {
      return accumulator;
    }

    accumulator[hostname] = {
      brightness: clampBrightness(siteConfig.brightness),
    };

    return accumulator;
  }, {});
}

function normalizeDisabledSites(disabledSites) {
  if (!disabledSites || typeof disabledSites !== "object") {
    return {};
  }

  return Object.entries(disabledSites).reduce((accumulator, [hostname, disabled]) => {
    if (hostname && disabled) {
      accumulator[hostname] = true;
    }

    return accumulator;
  }, {});
}

function getEffectiveSettings({ hostname = "", settings }) {
  const normalizedSettings = normalizeStoredSettings(settings);
  const siteConfig = hostname ? normalizedSettings.siteSettings[hostname] : undefined;

  if (normalizedSettings.globalDisabled) {
    return {
      brightness: normalizedSettings.globalBrightness,
      disabled: true,
      source: "global-disabled",
    };
  }

  if (hostname && normalizedSettings.disabledSites[hostname]) {
    return {
      brightness: normalizedSettings.globalBrightness,
      disabled: true,
      source: "site-disabled",
    };
  }

  if (siteConfig) {
    return {
      brightness: siteConfig.brightness,
      disabled: false,
      source: "site",
    };
  }

  return {
    brightness: normalizedSettings.globalBrightness,
    disabled: false,
    source: "global",
  };
}

function getHostnameFromUrl(url) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return parsedUrl.hostname;
    }
  } catch (error) {
    return "";
  }

  return "";
}

const exportedApi = {
  DEFAULT_BRIGHTNESS,
  clampBrightness,
  getEffectiveSettings,
  getHostnameFromUrl,
  normalizeStoredSettings,
};

if (typeof module !== "undefined") {
  module.exports = exportedApi;
}

if (typeof globalThis !== "undefined") {
  globalThis.BrightnessSettings = exportedApi;
}
