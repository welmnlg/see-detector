// sidepanel.js
let allFiles = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateFiles') {
    allFiles = message.files;
    displayFiles(allFiles);
  }
});

function loadFiles() {
  chrome.storage.local.get(['files'], (result) => {
    allFiles = result.files || [];
    displayFiles(allFiles);
  });
}

document.getElementById('filter').addEventListener('input', (e) => {
  const filter = e.target.value.toLowerCase();
  const filteredFiles = allFiles.filter(file => file.type.toLowerCase().includes(filter));
  displayFiles(filteredFiles);
});

function displayFiles(files) {
  // Calculate stats
  const totalFiles = files.length;
  const typeCounts = {};
  files.forEach(file => {
    typeCounts[file.type] = (typeCounts[file.type] || 0) + 1;
  });
  const uniqueTypes = Object.keys(typeCounts).length;

  // Display stats with professional layout
  const statsDiv = document.getElementById('stats');
  const typeCountsHTML = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => `<div class="type-count-item"><span>${type.toUpperCase()}</span><span><strong>${count}</strong></span></div>`)
    .join('');

  statsDiv.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Files</div>
        <div class="stat-value">${totalFiles}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">File Types</div>
        <div class="stat-value">${uniqueTypes}</div>
      </div>
    </div>
    <div class="type-counts">
      <div class="stat-label" style="margin-bottom: 8px;">Top File Types</div>
      ${typeCountsHTML || '<div style="color: #bdc3c7; padding: 8px 0;">No files found</div>'}
    </div>
  `;

  const list = document.getElementById('fileList');
  
  if (files.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No files found on this page</p></div>';
    return;
  }

  list.innerHTML = '';
  files.forEach(file => {
    const li = document.createElement('li');
    li.className = 'file-item';
    
    const icon = document.createElement('div');
    icon.className = 'file-icon';
    icon.textContent = getFileIcon(file.type);
    
    const info = document.createElement('div');
    info.className = 'file-info';
    
    const a = document.createElement('a');
    a.className = 'file-link';
    a.href = file.url;
    a.target = '_blank';
    a.title = file.filename;
    a.textContent = file.filename;
    
    const type = document.createElement('span');
    type.className = 'file-type';
    type.textContent = file.type.toUpperCase();
    
    info.appendChild(a);
    info.appendChild(type);
    
    li.appendChild(icon);
    li.appendChild(info);
    list.appendChild(li);
  });
}

function getFileIcon(type) {
  const iconMap = {
    'mp4': '🎬', 'webm': '🎬', 'avi': '🎬', 'mov': '🎬', 'mkv': '🎬', 'flv': '🎬', 'wmv': '🎬',
    'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵',
    'jpg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️', 'ico': '🖼️',
    'pdf': '📄', 'doc': '📄', 'docx': '📄', 'txt': '📄', 'html': '📄', 'css': '📄', 'js': '📄',
    'xls': '📊', 'xlsx': '📊', 'csv': '📊', 'tsv': '📊',
    'ppt': '📈', 'pptx': '📈',
    'zip': '📦', 'rar': '📦',
    'woff': '🔤', 'woff2': '🔤', 'ttf': '🔤', 'eot': '🔤',
    'xml': '⚙️', 'json': '⚙️'
  };
  return iconMap[type.toLowerCase()] || '📁';
}

document.getElementById('refresh').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => {
        chrome.storage.sync.get(['extensions'], (result) => {
          const extensions = result.extensions || ['mp4', 'json', 'pdf', 'jpg', 'png', 'gif', 'txt', 'html', 'css', 'js', 'zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp3', 'wav', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'ogg', 'xml', 'csv', 'tsv', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'];
          // Re-run the scan
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

          chrome.storage.local.set({ files });
        });
      }
    });
  });
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.files) {
    allFiles = changes.files.newValue || [];
    displayFiles(allFiles);
  }
});