// Popup functionality

document.addEventListener('DOMContentLoaded', () => {
  const toggleTypingModeBtn = document.getElementById('toggleTypingMode');
  const typingModeStatus = document.getElementById('typingModeStatus');
  const statusDot = document.getElementById('statusDot');

  // Load typing mode status
  chrome.storage.sync.get(['typingModeEnabled'], (result) => {
    const enabled = result.typingModeEnabled !== false;
    updateTypingModeUI(enabled);
  });

  // Toggle typing mode
  toggleTypingModeBtn.addEventListener('click', () => {
    chrome.storage.sync.get(['typingModeEnabled'], (result) => {
      const newState = !(result.typingModeEnabled !== false);
      chrome.storage.sync.set({ typingModeEnabled: newState }, () => {
        updateTypingModeUI(newState);
        
        // Notify current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'toggleTypingMode',
              enabled: newState
            }).catch(() => {
              // Ignore if content script not loaded
            });
          }
        });
      });
    });
  });

  function updateTypingModeUI(enabled) {
    typingModeStatus.textContent = `Typing Mode: ${enabled ? 'ON' : 'OFF'}`;
    typingModeStatus.className = enabled ? 'enabled' : 'disabled';
    
    if (statusDot) {
      statusDot.classList.toggle('disabled', !enabled);
    }
    
    const btnText = toggleTypingModeBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = enabled ? 'Disable Typing Mode' : 'Enable Typing Mode';
    }
  }
});
