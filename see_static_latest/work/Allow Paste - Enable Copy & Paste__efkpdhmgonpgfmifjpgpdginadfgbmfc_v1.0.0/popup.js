const STORAGE_KEY = "disabledHosts";

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function getDisabledHosts() {
  const response = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(response[STORAGE_KEY]) ? response[STORAGE_KEY] : [];
}

async function setSiteEnabled(hostname, enabled) {
  const disabledHosts = await getDisabledHosts();
  const nextDisabledHosts = enabled
    ? disabledHosts.filter((value) => value !== hostname)
    : [...new Set([...disabledHosts, hostname])];

  await chrome.storage.local.set({ [STORAGE_KEY]: nextDisabledHosts });
}

async function notifyTab(tabId, enabled) {
  if (!tabId) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "allow-paste:set-enabled",
      enabled,
    });
  } catch {
    // Content scripts do not run on browser-internal pages such as chrome:// URLs.
  }
}

async function initializePopup() {
  const siteLabel = document.getElementById("site-label");
  const hintText = document.getElementById("hint-text");
  const siteToggle = document.getElementById("site-toggle");
  const activeTab = await getActiveTab();
  const hostname = getHostname(activeTab?.url || "");

  if (!hostname) {
    siteToggle.disabled = true;
    siteLabel.textContent =
      "This page does not allow extension content scripts.";
    hintText.textContent = "Open a regular website tab to use the toggle.";
    return;
  }

  const disabledHosts = await getDisabledHosts();
  const enabled = !disabledHosts.includes(hostname);

  siteLabel.textContent = hostname;
  siteToggle.checked = enabled;
  hintText.textContent = enabled
    ? "Clipboard protections are being bypassed on this site."
    : "The extension is paused on this site. Re-enable it to intercept blocking handlers again.";

  siteToggle.addEventListener("change", async () => {
    const nextEnabled = siteToggle.checked;
    await setSiteEnabled(hostname, nextEnabled);
    await notifyTab(activeTab.id, nextEnabled);

    hintText.textContent = nextEnabled
      ? "Clipboard protections are being bypassed on this site."
      : "The extension is paused on this site. Refresh if you want the page to fully restore its original handlers.";
  });
}

initializePopup().catch(() => {
  const siteLabel = document.getElementById("site-label");
  const hintText = document.getElementById("hint-text");
  const siteToggle = document.getElementById("site-toggle");

  siteToggle.disabled = true;
  siteLabel.textContent = "Unable to read the current tab.";
  hintText.textContent = "Reload the extension and try again.";
});
