// ========== CONFIGURATION - UPDATE THESE LINKS ==========
const REPORT_BUG_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScy2u94TG4lAwmL_S8HOtx5NxVBoNprn-M0HMWHd93VU6BFTg/viewform?usp=publish-editor'; // Add your bug report URL here
const DONATION_URL = 'https://endurancexperseverance-byte.github.io/Nexus-Trails-Website/'; // Add your donation URL here
// =========================================================

const toggleSwitch = document.getElementById('toggleSwitch');
const statusText = document.getElementById('statusText');
const statusIcon = document.getElementById('statusIcon');
const hiddenCount = document.getElementById('hiddenCount');
const focusPercent = document.getElementById('focusPercent');
const refreshBtn = document.getElementById('refreshBtn');
const reportBugLink = document.getElementById('reportBugLink');
const donationLink = document.getElementById('donationLink');

let hiddenItems = 0;

function updateUI(enabled) {
  toggleSwitch.checked = enabled;
  statusText.textContent = enabled ? 'Active' : 'Disabled';
  
  if (enabled) {
    statusIcon.classList.remove('inactive');
    statusIcon.classList.add('active');
    statusIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    hiddenCount.textContent = '0%';
    focusPercent.textContent = '100%';
  } else {
    statusIcon.classList.remove('active');
    statusIcon.classList.add('inactive');
    statusIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>';
    hiddenCount.textContent = '100%';
    focusPercent.textContent = '0%';
  }
}

// Initialize UI
chrome.storage.sync.get(['ytHideEnabled'], (res) => {
  const enabled = res.ytHideEnabled ?? true;
  updateUI(enabled);
  console.log('[YT Hide Popup] Current state:', enabled);
});

// Toggle switch listener
toggleSwitch.addEventListener('change', async () => {
  const newValue = toggleSwitch.checked;
  
  console.log('[YT Hide Popup] Toggle switched to:', newValue);
  
  await chrome.storage.sync.set({ ytHideEnabled: newValue });
  updateUI(newValue);
});

// Refresh button listener
refreshBtn.addEventListener('click', async () => {
  refreshBtn.style.transform = 'rotate(360deg)';
  refreshBtn.style.transition = 'transform 0.5s ease';
  
  setTimeout(() => {
    refreshBtn.style.transform = 'rotate(0deg)';
  }, 500);
  
  // Reload active YouTube tabs
  const tabs = await chrome.tabs.query({ url: '*://*.youtube.com/*', active: true });
  tabs.forEach(tab => {
    chrome.tabs.reload(tab.id);
  });
});

// Report bug link
reportBugLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (REPORT_BUG_URL) {
    chrome.tabs.create({ url: REPORT_BUG_URL });
  } else {
    console.log('Report bug URL not configured yet');
  }
});

// Donation link
donationLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (DONATION_URL) {
    chrome.tabs.create({ url: DONATION_URL });
  } else {
    console.log('Donation URL not configured yet');
  }
});