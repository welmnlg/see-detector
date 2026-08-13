const btn = document.getElementById('toggle');
const statusDiv = document.getElementById('status');

// Get current state from storage
chrome.storage.local.get(['enabled'], (result) => {
  updateUI(!!result.enabled);
});

btn.addEventListener('click', () => {
  chrome.storage.local.get(['enabled'], (result) => {
    const newState = !result.enabled;
    
    // Save state
    chrome.storage.local.set({ enabled: newState }, () => {
      updateUI(newState);
      
      // Tell the current tab to enable/disable
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle', enabled: newState });
        }
      });
    });
  });
});

function updateUI(isEnabled) {
  if (isEnabled) {
    btn.textContent = 'DISABLE';
    btn.className = 'on';
    statusDiv.textContent = 'Status: ACTIVE';
    statusDiv.style.color = 'green';
  } else {
    btn.textContent = 'ENABLE';
    btn.className = 'off';
    statusDiv.textContent = 'Status: INACTIVE';
    statusDiv.style.color = 'red';
  }
}