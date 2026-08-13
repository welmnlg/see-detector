// Options page functionality

document.addEventListener('DOMContentLoaded', () => {
  const typingModeCheckbox = document.getElementById('typingModeEnabled');

  // Load saved settings
  chrome.storage.sync.get(['typingModeEnabled'], (result) => {
    typingModeCheckbox.checked = result.typingModeEnabled !== false; // Default to true
  });

  // Save settings when changed
  typingModeCheckbox.addEventListener('change', (e) => {
    chrome.storage.sync.set({ typingModeEnabled: e.target.checked }, () => {
      // Notify all tabs to update typing mode
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'toggleTypingMode',
            enabled: e.target.checked
          }).catch(() => {
            // Ignore errors for tabs that don't have content script loaded
          });
        });
      });
    });
  });
});

