let isPaused = false;
let observer = null;

function replaceText(node) {
  if (isPaused) return;
  
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName ? node.tagName.toLowerCase() : '';
    if (tagName === 'input' || 
        tagName === 'textarea' || 
        node.isContentEditable) {
      return;
    }
  }
  
  let parent = node.parentElement;
  while (parent) {
    const tagName = parent.tagName ? parent.tagName.toLowerCase() : '';
    if (tagName === 'input' || 
        tagName === 'textarea' || 
        parent.isContentEditable) {
      return;
    }
    parent = parent.parentElement;
  }
  
  if (node.nodeType === Node.TEXT_NODE) {
    // Replace all variations of Microsoft (case-insensitive, preserving original case pattern)
    node.textContent = node.textContent.replace(/Microsoft/g, 'Microslop')
                                       .replace(/microsoft/g, 'microslop')
                                       .replace(/MICROSOFT/g, 'MICROSLOP');
  } else {
    for (let child of node.childNodes) {
      replaceText(child);
    }
  }
}

// Initialize the extension
function init() {
  chrome.storage.local.get(['paused'], (result) => {
    isPaused = result.paused || false;
    
    if (!isPaused && document.body) {
      replaceText(document.body);
      
      startObserver();
    }
  });
}

function startObserver() {
  if (observer) return; // Already observing
  
  observer = new MutationObserver((mutations) => {
    if (isPaused) return;
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
          replaceText(node);
        }
      });
    });
  });
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'pause') {
    isPaused = true;
    stopObserver();
  } else if (message.action === 'resume') {
    isPaused = false;
    startObserver();
  }
});

init();