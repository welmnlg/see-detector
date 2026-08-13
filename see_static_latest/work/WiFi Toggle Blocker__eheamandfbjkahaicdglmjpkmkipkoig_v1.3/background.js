const BLOCK_RULE_ID = 1;

async function setBlocking(shouldBlock) {
  if (shouldBlock) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [BLOCK_RULE_ID],
      addRules: [{
        id: BLOCK_RULE_ID,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { extensionPath: "/blocked.html" }
        },
        condition: {
          urlFilter: "*",
          resourceTypes: ["main_frame"]
        }
      }]
    });
  } else {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [BLOCK_RULE_ID]
    });
  }
}

function checkConnectivity() {
  setBlocking(!navigator.onLine);
}

// Check on service worker start
checkConnectivity();

// React to network changes instantly
self.addEventListener("online", () => setBlocking(false));
self.addEventListener("offline", () => setBlocking(true));

// Fallback: re-check every minute in case events were missed
chrome.alarms.create("checkWifi", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkWifi") {
    checkConnectivity();
  }
});
