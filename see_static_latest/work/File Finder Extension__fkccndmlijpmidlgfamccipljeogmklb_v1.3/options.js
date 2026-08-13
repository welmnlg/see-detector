// options.js
const defaultExtensions = ['mp4', 'json', 'pdf', 'jpg', 'png', 'gif', 'txt', 'html', 'css', 'js', 'zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp3', 'wav', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'ogg', 'xml', 'csv', 'tsv', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'];

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['extensions'], (result) => {
    const extensions = result.extensions || defaultExtensions;
    document.getElementById('extensions').value = extensions.join('\n');
  });
});

document.getElementById('save').addEventListener('click', () => {
  const extensions = document.getElementById('extensions').value.split('\n').map(e => e.trim()).filter(e => e);
  chrome.storage.sync.set({ extensions }, () => {
    showNotification('✓ Settings saved successfully!');
  });
});

function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

document.getElementById('reset').addEventListener('click', () => {
  document.getElementById('extensions').value = defaultExtensions.join('\n');
});