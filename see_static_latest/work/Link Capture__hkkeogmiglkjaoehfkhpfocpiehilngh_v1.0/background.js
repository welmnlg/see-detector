// Function to broadcast the blocking state to all tabs
function broadcastBlockingState(enabled) {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      // Ignore errors for tabs that can't receive messages
      chrome.tabs.sendMessage(tab.id, { type: 'SET_BLOCKING', enabled }).catch(() => {});
    }
  });
}

// Initialize state on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.session.set({ blockingEnabled: false });
});

// Listen for the side panel to connect
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidepanel') {
    // Set blocking to true when panel opens
    chrome.storage.session.set({ blockingEnabled: true }, () => {
      broadcastBlockingState(true);
    });

    port.onDisconnect.addListener(() => {
      // Set blocking to false when panel closes
      chrome.storage.session.set({ blockingEnabled: false }, () => {
        broadcastBlockingState(false);
      });
    });
  }
});

// Open the side panel on the toolbar icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'link_clicked') {
    chrome.storage.local.get(['isPremium', 'links'], (data) => {
      const links = data.links || [];
      const isPremium = !!data.isPremium;

      // Enforce the 3-link limit for free users
      if (!isPremium && links.length >= 3) {
        return; // Stop processing, link is not added
      }
      
      links.push(message.url);
      chrome.storage.local.set({ links });
    });
    return true; // Keep message channel open for potential async response
  } 
  
  if (message.type === 'GET_BLOCKING_STATE') {
    chrome.storage.session.get('blockingEnabled', (data) => {
      sendResponse({ enabled: !!data.blockingEnabled });
    });
    return true; // Indicates that the response is asynchronous
  }
});
