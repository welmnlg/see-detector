// Popup script
let currentMeshCount = 0;

const meshCountEl = document.getElementById('meshCount');
const downloadBtn = document.getElementById('downloadBtn');
const refreshBtn = document.getElementById('refreshBtn');
const statusEl = document.getElementById('status');

// Show status message
function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status show ${type}`;

  if (type !== 'error') {
    setTimeout(() => {
      statusEl.classList.remove('show');
    }, 3000);
  }
}

// Update mesh count display
function updateMeshCount(count) {
  currentMeshCount = count;
  meshCountEl.textContent = count;

  if (count > 0) {
    downloadBtn.disabled = false;
  } else {
    downloadBtn.disabled = true;
  }
}

// Request mesh count from content script
function requestMeshCount() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_MESH_COUNT' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error requesting mesh count:', chrome.runtime.lastError);
          showStatus('Error: Please refresh the page', 'error');
        }
      });
    }
  });
}

// Download all meshes
function downloadAllMeshes() {
  if (currentMeshCount === 0) {
    showStatus('No meshes found', 'error');
    return;
  }

  downloadBtn.disabled = true;
  downloadBtn.innerHTML = 'Downloading<span class="loading"></span>';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'DOWNLOAD_ALL_MESHES' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error downloading meshes:', chrome.runtime.lastError);
          showStatus('Error: Please refresh the page', 'error');
          downloadBtn.disabled = false;
          downloadBtn.textContent = 'Download All Meshes';
        } else {
          setTimeout(() => {
            showStatus(`Downloading ${currentMeshCount} meshes...`, 'success');
            downloadBtn.disabled = false;
            downloadBtn.textContent = 'Download All Meshes';
          }, 1000);
        }
      });
    }
  });
}

// Event listeners
downloadBtn.addEventListener('click', downloadAllMeshes);
refreshBtn.addEventListener('click', () => {
  refreshBtn.innerHTML = 'Refreshing<span class="loading"></span>';
  requestMeshCount();
  setTimeout(() => {
    refreshBtn.textContent = 'Refresh Count';
  }, 1000);
});

// Listen for mesh count updates from background/content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'MESH_COUNT_UPDATE') {
    updateMeshCount(request.count);
  }
});

// Request initial mesh count when popup opens
requestMeshCount();

// Auto-refresh every 3 seconds while popup is open
const autoRefreshInterval = setInterval(requestMeshCount, 3000);

// Clean up interval when popup closes
window.addEventListener('unload', () => {
  clearInterval(autoRefreshInterval);
});
