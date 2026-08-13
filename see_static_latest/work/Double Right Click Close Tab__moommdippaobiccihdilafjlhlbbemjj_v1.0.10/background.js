chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "closeTab" && sender.tab?.id) {
    chrome.tabs.remove(sender.tab.id).catch((e) => {
      console.warn("Failed to close tab:", e.message);
    });
  }
});
