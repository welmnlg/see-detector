let isEnabled = false;
let observer = null;

// Initialize state from storage
chrome.storage.local.get(['enabled'], (result) => {
  isEnabled = !!result.enabled;
  if (isEnabled) {
    enable();
  }
});

function replaceText(node) {
  if (!isEnabled) return;

  // Prevent replacing text inside scripts, styles, or editable fields
  const ignoreTags = ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'];
  if (node.parentElement && ignoreTags.includes(node.parentElement.tagName)) return;

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    if (text.length > 0) {
      node.textContent = 'hot diggity dog!';
    }
  } else {
    for (let child of node.childNodes) {
      replaceText(child);
    }
  }
}

function replaceImages() {
  if (!isEnabled) return;
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (img.src.toLowerCase().includes('.gif')) {
      img.src = 'https://iili.io/qqD3bte.png';
    } else {
      img.src = 'https://iili.io/qqD3bte.png';
    }
    img.srcset = '';
  });
}

function replaceVideos() {
  if (!isEnabled) return;
  
  // Replace native video tags
  document.querySelectorAll('video').forEach((video) => {
    video.src = 'https://file.garden/aP_3ST9j3ifC7mP-/hot%20diggity%20dog%20-%20Made%20with%20Clipchamp%20(1).mp4';
    video.loop = true;
    video.load();
  });

  // Replace iframes (YouTube/Vimeo)
  document.querySelectorAll('iframe').forEach((iframe) => {
    const src = iframe.src.toLowerCase();
    if (src.includes('youtube') || src.includes('vimeo') || src.includes('embed')) {
      const video = document.createElement('video');
      video.src = 'https://file.garden/aP_3ST9j3ifC7mP-/hot%20diggity%20dog%20-%20Made%20with%20Clipchamp%20(1).mp4';
      video.style.width = iframe.offsetWidth + 'px';
      video.style.height = iframe.offsetHeight + 'px';
      video.loop = true;
      video.controls = true;
      iframe.parentNode.replaceChild(video, iframe);
    }
  });
}

function enable() {
  isEnabled = true;
  replaceText(document.body);
  replaceImages();
  replaceVideos();
  startObserver();
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          replaceText(node);
          // Check for images/videos in added nodes
          if (node.tagName === 'IMG') replaceImages();
          if (node.tagName === 'VIDEO' || node.tagName === 'IFRAME') replaceVideos();
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for the toggle from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    isEnabled = request.enabled;
    if (isEnabled) {
      enable();
    } else {
      location.reload(); // Best way to restore original content
    }
    sendResponse({ status: "ok" });
  }
  return true;
});