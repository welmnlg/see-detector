const syncToggle = document.getElementById('syncToggle');
const statusLabel = document.getElementById('statusLabel');
const tabCount = document.getElementById('tabCount');
const syncModeSelect = document.getElementById('syncMode');

function updateUI(enabled) {
  syncToggle.checked = enabled;
  statusLabel.textContent = enabled ? 'Sync Enabled' : 'Sync Disabled';
  statusLabel.style.color = enabled ? '#667eea' : '#666';
}

function updateSyncMode(mode) {
  syncModeSelect.value = mode;
}

function updateTabCount() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const activeTabs = tabs.filter(tab => !tab.discarded);
    tabCount.textContent = activeTabs.length;
  });
}

// background.js에서 현재 상태 가져오기
chrome.runtime.sendMessage({ type: 'GET_SYNC_STATE' }, (response) => {
  if (response) {
    updateUI(response.syncEnabled || false);
    updateSyncMode(response.syncMode || 'smart');
  }
});

updateTabCount();

syncToggle.addEventListener('change', (e) => {
  const enabled = e.target.checked;
  updateUI(enabled);

  chrome.runtime.sendMessage({
    type: 'TOGGLE_SYNC',
    enabled: enabled
  });
});

syncModeSelect.addEventListener('change', (e) => {
  const mode = e.target.value;

  chrome.runtime.sendMessage({
    type: 'SET_SYNC_MODE',
    mode: mode
  });
});

chrome.tabs.onUpdated.addListener(() => {
  updateTabCount();
});

chrome.tabs.onRemoved.addListener(() => {
  updateTabCount();
});
