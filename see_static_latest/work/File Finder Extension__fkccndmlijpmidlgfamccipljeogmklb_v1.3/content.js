// content.js
function scanForFiles(extensions) {
  const links = document.querySelectorAll('a[href]');
  const files = [];

  links.forEach(link => {
    const href = link.href;
    const url = new URL(href, window.location.origin);
    const pathname = url.pathname;
    const extension = pathname.split('.').pop().toLowerCase();
    if (extensions.includes(extension)) {
      files.push({
        url: href,
        filename: pathname.split('/').pop(),
        type: extension,
        text: link.textContent.trim() || pathname.split('/').pop()
      });
    }
  });

  // Also check for other elements like img, video, etc.
  const mediaElements = document.querySelectorAll('img[src], video[src], audio[src], source[src]');
  mediaElements.forEach(elem => {
    const src = elem.src || elem.getAttribute('src');
    if (src) {
      const url = new URL(src, window.location.origin);
      const pathname = url.pathname;
      const extension = pathname.split('.').pop().toLowerCase();
      if (extensions.includes(extension)) {
        files.push({
          url: src,
          filename: pathname.split('/').pop(),
          type: extension,
          text: elem.alt || elem.title || pathname.split('/').pop()
        });
      }
    }
  });

  return files;
}

function sendFilesToSidebar() {
  chrome.storage.sync.get(['extensions'], (result) => {
    const extensions = result.extensions || ['mp4', 'json', 'pdf', 'jpg', 'png', 'gif', 'txt', 'html', 'css', 'js', 'zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp3', 'wav', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'ogg', 'xml', 'csv', 'tsv', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'];
    const files = scanForFiles(extensions);
    chrome.storage.local.set({ files });
  });
}

// Run on load
sendFilesToSidebar();

// Also on DOM changes, but for simplicity, just on load