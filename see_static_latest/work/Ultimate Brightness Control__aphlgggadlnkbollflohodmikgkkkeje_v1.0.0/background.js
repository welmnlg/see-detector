const WEBSITE_BASE_URL = "https://basarogur.github.io/ultimate-brightness-control";

function configureUninstallUrl() {
  if (!WEBSITE_BASE_URL) {
    return;
  }

  chrome.runtime.setUninstallURL(`${WEBSITE_BASE_URL}/uninstall.html`);
}

chrome.runtime.onInstalled.addListener((details) => {
  configureUninstallUrl();

  if (details.reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("welcome.html"),
    });
  }
});

configureUninstallUrl();
