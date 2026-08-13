// Content script - runs in isolated context
// Inject the script into the page context to access Three.js objects
// Listen for messages from the injected script
window.addEventListener('message', function(event) {
  // Only accept messages from the same window
  if (event.source !== window) return;

  if (event.data.type === 'MESH_COUNT_UPDATE') {
    // Forward mesh count to popup
    chrome.runtime.sendMessage({
      type: 'MESH_COUNT_UPDATE',
      count: event.data.count
    });
  } else if (event.data.type === 'DOWNLOAD_MESH') {
    // Handle mesh download - data is already a blob URL from injected script
    // Just acknowledge receipt
    chrome.runtime.sendMessage({
      type: 'DOWNLOAD_COMPLETE',
      filename: event.data.filename
    });
  }
});

// Listen for download requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'DOWNLOAD_ALL_MESHES') {
    // Forward to injected script
    window.postMessage({ type: 'DOWNLOAD_ALL_MESHES' }, '*');
    sendResponse({ status: 'downloading' });
  } else if (request.type === 'GET_MESH_COUNT') {
    // Forward to injected script
    window.postMessage({ type: 'GET_MESH_COUNT' }, '*');
    sendResponse({ status: 'requested' });
  }
  return true;
});
