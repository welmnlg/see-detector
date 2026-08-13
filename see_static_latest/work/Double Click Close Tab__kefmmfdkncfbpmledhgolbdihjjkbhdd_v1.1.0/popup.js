const toggle = document.getElementById('toggle');
const label = document.getElementById('label');
const status = document.getElementById('status');

function updateUI(enabled) {
  toggle.checked = enabled;
  label.textContent = enabled ? 'Enabled' : 'Disabled';
  label.classList.toggle('active', enabled);
  status.textContent = enabled
    ? 'Double-click empty space to close tab'
    : 'Extension is paused';
}

// Load saved state
chrome.storage.sync.get({ enabled: true }, (data) => {
  updateUI(data.enabled);
});

// Handle toggle
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ enabled });
  updateUI(enabled);

  // Tell background to update the icon/badge
  chrome.runtime.sendMessage({ action: 'toggleEnabled', enabled });
});
