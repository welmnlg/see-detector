let blockingEnabled = false;

// Ask the background script for the initial state
chrome.runtime.sendMessage({ type: 'GET_BLOCKING_STATE' }, (response) => {
  if (chrome.runtime.lastError) {
    // Could happen if the background script is not ready
  } else if (response) {
    blockingEnabled = response.enabled;
  }
});

// Listen for state changes from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_BLOCKING') {
    blockingEnabled = message.enabled;
  }
});

document.addEventListener('click', (event) => {
  // Only block links if the feature is enabled
  if (!blockingEnabled) {
    return;
  }

  const target = event.target.closest('a');

  if (target && target.href) {
    event.preventDefault();
    event.stopPropagation();
    const url = target.href;
    
    // Check if the extension context is still valid before sending a message.
    if (chrome.runtime?.id) {
        chrome.runtime.sendMessage({ type: 'link_clicked', url: url });
    }
  }
}, true);
