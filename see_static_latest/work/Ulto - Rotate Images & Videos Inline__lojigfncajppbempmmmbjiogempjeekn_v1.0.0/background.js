// Create context menu items when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "rotateRight",
    title: "Rotate right (90°)",
    contexts: ["image", "video"]
  });

  chrome.contextMenus.create({
    id: "rotateLeft",
    title: "Rotate left (-90°)",
    contexts: ["image", "video"]
  });

  chrome.contextMenus.create({
    id: "resetRotation",
    title: "Reset rotation",
    contexts: ["image", "video"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "rotateRight" ||
      info.menuItemId === "rotateLeft" ||
      info.menuItemId === "resetRotation") {
    chrome.tabs.sendMessage(tab.id, {
      action: info.menuItemId,
      srcUrl: info.srcUrl
    });
  }
});
