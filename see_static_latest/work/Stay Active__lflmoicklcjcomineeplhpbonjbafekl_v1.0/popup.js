let active = false;
let mode = 'scroll';
let interval = 60;

const toggleBtn = document.getElementById('toggleBtn');
const statusEl = document.getElementById('status');
const slider = document.getElementById('intervalSlider');
const intervalVal = document.getElementById('intervalVal');

// Load saved state
chrome.storage.local.get(['active', 'mode', 'interval'], (data) => {
  if (data.active !== undefined) active = data.active;
  if (data.mode) mode = data.mode;
  if (data.interval) interval = data.interval;
  updateUI();
  slider.value = interval;
  intervalVal.textContent = `Every ${interval} seconds`;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1)).classList.add('selected');
  updateModeDesc(mode);
});

let fireCount = 0;

function updateUI() {
  const dot = document.getElementById('pulseDot');
  const text = document.getElementById('statusText');
  if (active) {
    toggleBtn.textContent = 'Stop';
    toggleBtn.className = 'toggle-btn on';
    if (text) text.textContent = fireCount > 0 ? `Active -- fired ${fireCount}x` : `Active -- ${mode} every ${interval}s`;
    if (dot) dot.style.opacity = '1';
    statusEl.className = 'status active';
  } else {
    toggleBtn.textContent = 'Start';
    toggleBtn.className = 'toggle-btn off';
    if (text) text.textContent = 'Inactive';
    if (dot) dot.style.opacity = '0';
    statusEl.className = 'status';
  }
}

// Show pulse animation in popup when active
function startPulse() {
  if (!active) return;
  const dot = document.getElementById('pulseDot');
  if (dot) {
    dot.style.opacity = dot.style.opacity === '1' ? '0.3' : '1';
  }
  setTimeout(startPulse, 800);
}

toggleBtn.addEventListener('click', () => {
  active = !active;
  chrome.storage.local.set({ active, mode, interval });
  if (active) setTimeout(startPulse, 100);
  // Tell content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE', active, mode, interval }, () => {
        // Ignore "no receiver" errors -- content script loads on next page refresh
        if (chrome.runtime.lastError) {}
      });
    }
  });
  updateUI();
});

slider.addEventListener('input', () => {
  interval = parseInt(slider.value);
  intervalVal.textContent = `Every ${interval} seconds`;
  chrome.storage.local.set({ interval });
  if (active) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_INTERVAL", interval }, () => { if (chrome.runtime.lastError) {} });
      }
    });
  }
});

// Listen for activity fired from content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'ACTIVITY_FIRED') {
    fireCount++;
    updateUI();
  }
});

// Wire up mode buttons via JS (not inline onclick -- CSP compliance)
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

const modeDescriptions = {
  move: 'Mouse Move: sends invisible mouse events. Page does not visibly move. Works on Slack, Teams, and most web apps.',
  scroll: 'Scroll: physically scrolls the page 2px down and back up. Most visible confirmation it is working.'
};

function updateModeDesc(m) {
  const desc = document.getElementById('modeDesc');
  if (desc) desc.textContent = modeDescriptions[m] || '';
}

function setMode(m) {
  mode = m;
  chrome.storage.local.set({ mode });
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('mode' + m.charAt(0).toUpperCase() + m.slice(1)).classList.add('selected');
  updateModeDesc(m);
  if (active) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_MODE", mode }, () => { if (chrome.runtime.lastError) {} });
      }
    });
  }
  updateUI();
}
