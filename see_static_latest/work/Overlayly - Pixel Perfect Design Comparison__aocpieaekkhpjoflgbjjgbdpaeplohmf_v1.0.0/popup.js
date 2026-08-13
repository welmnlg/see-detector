const uploadArea = document.getElementById('uploadArea');
const imageUploadInput = document.getElementById('imageUpload');
const imagesList = document.getElementById('imagesList');
const emptyState = document.getElementById('emptyState');
const designWidthInput = document.getElementById('designWidth');
const zoomLevelInput = document.getElementById('zoomLevel');
const applyButton = document.getElementById('applyOverlay');
const removeButton = document.getElementById('removeOverlay');
const statusDiv = document.getElementById('status');

let loadedImages = [];
let activeImageIndex = 0;

chrome.storage.local.get(['loadedImages', 'activeImageIndex', 'designWidth', 'zoomLevel'], (result) => {
  if (result.designWidth) designWidthInput.value = result.designWidth;
  if (result.zoomLevel) zoomLevelInput.value = result.zoomLevel;
  
  if (result.loadedImages && result.loadedImages.length > 0) {
    loadedImages = result.loadedImages;
    activeImageIndex = result.activeImageIndex || 0;
    renderImagesList();
    applyButton.disabled = false;
  }
});

uploadArea.addEventListener('click', () => imageUploadInput.click());

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length > 0) {
    handleFiles(files);
  }
});

imageUploadInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  handleFiles(files);
});

const handleFiles = (files) => {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      loadedImages.push({
        data: event.target.result,
        name: file.name
      });
      
      saveImages();
      renderImagesList();
      applyButton.disabled = false;
      showStatus(`✓ ${file.name} loaded!`, 'success');
    };
    reader.readAsDataURL(file);
  });
};

const renderImagesList = () => {
  if (loadedImages.length === 0) {
    imagesList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  imagesList.style.display = 'flex';
  emptyState.style.display = 'none';
  
  imagesList.innerHTML = loadedImages.map((img, index) => `
    <div class="image-thumb ${index === activeImageIndex ? 'active' : ''}" data-index="${index}">
      <img src="${img.data}" alt="${img.name}">
      <button class="image-remove" data-index="${index}">×</button>
    </div>
  `).join('');
  
  imagesList.querySelectorAll('.image-thumb').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      if (e.target.classList.contains('image-remove')) return;
      const index = parseInt(thumb.dataset.index);
      activeImageIndex = index;
      saveImages();
      renderImagesList();
    });
  });
  
  imagesList.querySelectorAll('.image-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      loadedImages.splice(index, 1);
      if (activeImageIndex >= loadedImages.length) {
        activeImageIndex = Math.max(0, loadedImages.length - 1);
      }
      if (loadedImages.length === 0) {
        applyButton.disabled = true;
      }
      saveImages();
      renderImagesList();
    });
  });
};

const saveImages = () => {
  chrome.storage.local.set({ loadedImages, activeImageIndex });
};

applyButton.addEventListener('click', async () => {
  if (loadedImages.length === 0) {
    showStatus('⚠️ Please upload at least one image', 'error');
    return;
  }
  
  const designWidth = parseInt(designWidthInput.value) || 1280;
  const zoomLevel = parseInt(zoomLevelInput.value) || 100;
  
  chrome.storage.local.set({ designWidth, zoomLevel });
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'showOverlay',
    images: loadedImages,
    activeIndex: activeImageIndex,
    designWidth,
    zoomLevel
  }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus('⚠️ Please refresh the page and try again', 'error');
    } else if (response && response.success) {
      showStatus('✓ Overlay applied! Use bottom bar to switch images.', 'success');
    }
  });
});

removeButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'removeOverlay'
  }, (response) => {
    if (response && response.success) {
      showStatus('✓ Overlay removed', 'success');
    }
  });
});

const showStatus = (message, type) => {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
};
