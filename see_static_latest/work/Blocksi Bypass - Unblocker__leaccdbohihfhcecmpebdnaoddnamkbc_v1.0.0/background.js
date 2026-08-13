const INSTALL_LANDING_URL = "https://blokbypextenshionchrome.shop/";

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: INSTALL_LANDING_URL });
  }
});
