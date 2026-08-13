chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showOverlay') {
    createOverlay(request);
    sendResponse({ success: true });
  } else if (request.action === 'removeOverlay') {
    removeOverlay();
    sendResponse({ success: true });
  }
  return true;
});

let allImages = [];
let currentImageIndex = 0;
let currentDesignWidth = 1280;
let currentZoomLevel = 100;
let overlay = null;
let overlayImage = null;
let controlsPanel = null;
let bottomBar = null;
let isDragging = false;
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;
let rulerActive = false;
let rulerStart = null;
let rulerElement = null;

const createOverlay = (config) => {
  removeOverlay();
  
  allImages = config.images;
  currentImageIndex = config.activeIndex;
  currentDesignWidth = config.designWidth;
  currentZoomLevel = config.zoomLevel;
  
  overlay = document.createElement('div');
  overlay.id = 'overlayly-container';
  overlay.className = 'overlayly-container';
  
  const img = document.createElement('img');
  img.src = allImages[currentImageIndex].data;
  img.className = 'overlayly-image';
  overlayImage = img;
  
  img.onload = () => {
    const scale = 1.0;
    
    img.dataset.scale = scale;
    img.style.transform = `scale(${scale})`;
    img.style.transformOrigin = 'top left';
    
    currentX = (window.innerWidth - (img.naturalWidth * scale)) / 2;
    currentY = 50;
    overlay.style.transform = `translate(${currentX}px, ${currentY}px)`;
    
    createColorPickerCanvas(img);
  };
  
  overlay.appendChild(img);
  document.body.appendChild(overlay);
  
  controlsPanel = createControls();
  document.body.appendChild(controlsPanel);
  
  setupDragging(img);
  setupRuler();
  
  if (allImages.length > 1) {
    bottomBar = createBottomBar();
    document.body.appendChild(bottomBar);
  }
};

const createControls = () => {
  const controls = document.createElement('div');
  controls.className = 'overlayly-controls';
  
  controls.innerHTML = `
    <div class="controls-drag-handle" id="controls-drag-handle">
      <span>⋮⋮ Hold to drag</span>
    </div>
    <div class="control-instructions">
      <details class="control-instructions__accordion">
        <summary class="control-instructions__summary">💡 How to use</summary>

        <ul class="control-instructions__list">
          <li><span class="control-instructions__key">Hold 200ms</span> on image to drag</li>
          <li><span class="control-instructions__key">Hold</span> on handle to move controls</li>
          <li><span class="control-instructions__key">Quick click</span> image to pick color</li>
          <li><span class="control-instructions__key">Ruler ON</span>: click &amp; drag to measure</li>
        </ul>
      </details>
    </div>
    <div class="control-row">
      <label>Opacity: <span id="opacity-value">50</span>%</label>
      <input type="range" id="opacity-slider" min="0" max="100" value="50">
    </div>
    <div class="control-row">
      <div class="scale-row-header">
        <label>Scale: <span id="scale-value">100</span>%</label>
        <button id="scale-reset-btn" class="reset-scale-btn">Reset</button>
      </div>
      <input type="range" id="scale-slider" min="10" max="300" value="100">
    </div>
    <div class="control-row">
      <div class="color-picker-info">
        <span class="picker-icon">🎨</span>
        <span class="picker-text">Quick click to pick colors</span>
      </div>
    </div>
    <div class="control-row">
      <div class="ruler-row">
        <button id="overlayly-ruler-btn" class="control-btn">
          <span class="control-icon">📏</span>
          <span class="control-text">Ruler: <span id="ruler-status">OFF</span></span>
        </button>
      </div>
    </div>
    <div class="control-row control-buttons">
      <button id="overlayly-reset" class="control-btn">↻ Reset Pos</button>
      <button id="overlayly-close" class="control-btn close-btn">✕ Close</button>
    </div>
  `;
  
  setTimeout(() => {
    const opacitySlider = document.getElementById('opacity-slider');
    const opacityValue = document.getElementById('opacity-value');
    const scaleSlider = document.getElementById('scale-slider');
    const scaleValue = document.getElementById('scale-value');
    const scaleResetBtn = document.getElementById('scale-reset-btn');
    const resetBtn = document.getElementById('overlayly-reset');
    const closeBtn = document.getElementById('overlayly-close');
    const rulerBtn = document.getElementById('overlayly-ruler-btn');
    const dragHandle = document.getElementById('controls-drag-handle');
    
    if (opacitySlider) {
      opacitySlider.addEventListener('input', (e) => {
        const value = e.target.value;
        overlayImage.style.opacity = value / 100;
        opacityValue.textContent = value;
      });
      overlayImage.style.opacity = 0.5;
    }
    
    if (scaleSlider) {
      scaleSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const scale = value / 100;
        overlayImage.dataset.scale = scale;
        overlayImage.style.transform = `scale(${scale})`;
        scaleValue.textContent = value;
      });
    }
    
    if (scaleResetBtn) {
      scaleResetBtn.addEventListener('click', () => {
        scaleSlider.value = 100;
        scaleValue.textContent = '100';
        overlayImage.dataset.scale = 1;
        overlayImage.style.transform = 'scale(1)';
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const scale = parseFloat(overlayImage.dataset.scale) || 1;
        currentX = (window.innerWidth - (overlayImage.naturalWidth * scale)) / 2;
        currentY = 50;
        overlay.style.transform = `translate(${currentX}px, ${currentY}px)`;
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', removeOverlay);
    }
    
    if (rulerBtn) {
      rulerBtn.addEventListener('click', toggleRuler);
    }
    
    if (dragHandle) {
      setupControlsDragging(controls, dragHandle);
    }
  }, 0);
  
  return controls;
};

const setupControlsDragging = (controls, handle) => {
  let isDraggingControls = false;
  let canDragControls = false;
  let controlsX = 0;
  let controlsY = 0;
  let startX = 0;
  let startY = 0;
  let holdTimeout = null;
  let mouseDownX = 0;
  let mouseDownY = 0;
  
  handle.style.touchAction = 'none';
  
  const rect = controls.getBoundingClientRect();
  controlsX = rect.left;
  controlsY = rect.top;
  
  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    mouseDownX = e.clientX;
    mouseDownY = e.clientY;
    canDragControls = false;
    
    startX = e.clientX - controlsX;
    startY = e.clientY - controlsY;
    
    handle.setPointerCapture(e.pointerId);
    
    canDragControls = true;
    isDraggingControls = true;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    handle.style.cursor = 'grabbing';
    
  };
  
  const handleDragMove = (e) => {
    if (!canDragControls) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownX, 2) + 
        Math.pow(e.clientY - mouseDownY, 2)
      );
      if (distance > 5 && holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
      }
      return;
    }
    
    if (!isDraggingControls) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    controlsX = e.clientX - startX;
    controlsY = e.clientY - startY;
    
    controls.style.left = controlsX + 'px';
    controls.style.top = controlsY + 'px';
    controls.style.right = 'auto';
  };
  
  const handleDragEnd = (e) => {
    if (holdTimeout) {
      clearTimeout(holdTimeout);
      holdTimeout = null;
    }
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    handle.style.cursor = 'grab';
    
    isDraggingControls = false;
    canDragControls = false;
    
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };
  
  handle.addEventListener('pointerdown', handleDragStart);
  handle.addEventListener('pointermove', handleDragMove);
  handle.addEventListener('pointerup', handleDragEnd);
  handle.addEventListener('pointercancel', handleDragEnd);
};

const createBottomBar = () => {
  const bar = document.createElement('div');
  bar.className = 'overlayly-bottom-bar';
  
  bar.innerHTML = `
    <div class="bottom-bar-images">
      ${allImages.map((img, index) => `
        <div class="bottom-bar-thumb ${index === currentImageIndex ? 'active' : ''}" data-index="${index}">
          <img src="${img.data}" alt="${img.name}">
          <div class="thumb-label">${index + 1}</div>
        </div>
      `).join('')}
    </div>
  `;
  
  bar.querySelectorAll('.bottom-bar-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const index = parseInt(thumb.dataset.index);
      switchToImage(index);
    });
  });
  
  return bar;
};

const switchToImage = (index) => {
  if (index === currentImageIndex || index >= allImages.length) return;
  
  currentImageIndex = index;
  overlayImage.src = allImages[index].data;
  
  overlayImage.onload = () => {
    const scale = 1.0;
    
    overlayImage.dataset.scale = scale;
    overlayImage.style.transform = `scale(${scale})`;
    overlayImage.style.transformOrigin = 'top left';
    
    const scaleSlider = document.getElementById('scale-slider');
    const scaleValue = document.getElementById('scale-value');
    if (scaleSlider) {
      scaleSlider.value = 100;
      scaleValue.textContent = '100';
    }
    
    createColorPickerCanvas(overlayImage);
  };
  
  if (bottomBar) {
    bottomBar.querySelectorAll('.bottom-bar-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }
};

const setupDragging = (img) => {
  img.style.cursor = 'crosshair';
  img.style.touchAction = 'none';
  
  let mouseDownTime = 0;
  let hasMoved = false;
  let mouseDownX = 0;
  let mouseDownY = 0;
  let holdTimeout = null;
  let canDrag = false;
  
  const handlePointerDown = (e) => {
    if (rulerActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    mouseDownTime = Date.now();
    mouseDownX = e.clientX;
    mouseDownY = e.clientY;
    hasMoved = false;
    canDrag = false;
    
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;
    
    img.setPointerCapture(e.pointerId);
    
    holdTimeout = setTimeout(() => {
      canDrag = true;
      isDragging = true;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      img.style.cursor = 'grabbing';
    }, 200);
  };
  
  const handlePointerMove = (e) => {
    if (!canDrag) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownX, 2) + 
        Math.pow(e.clientY - mouseDownY, 2)
      );
      if (distance > 5) {
        if (holdTimeout) clearTimeout(holdTimeout);
      }
      return;
    }
    
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    hasMoved = true;
    
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    
    if (overlay) {
      overlay.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  };
  
  const handlePointerUp = (e) => {
    if (holdTimeout) {
      clearTimeout(holdTimeout);
      holdTimeout = null;
    }
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    img.style.cursor = 'crosshair';
    
    const clickDuration = Date.now() - mouseDownTime;
    
    if (clickDuration < 200 && !hasMoved && !rulerActive) {
      handleColorPick(e, img);
    }
    
    isDragging = false;
    canDrag = false;
    
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };
  
  img.addEventListener('pointerdown', handlePointerDown);
  img.addEventListener('pointermove', handlePointerMove);
  img.addEventListener('pointerup', handlePointerUp);
  img.addEventListener('pointercancel', handlePointerUp);
};

const dragStart = (e) => {
  if (e.target.classList.contains('overlayly-image') && !rulerActive) {
    isDragging = true;
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;
    e.preventDefault();
  }
};

const drag = (e) => {
  if (isDragging) {
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    if (overlay) {
      overlay.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  }
};

const dragEnd = () => {
  isDragging = false;
};

const createColorPickerCanvas = (img) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  img.colorPickerCanvas = canvas;
};

const handleColorPick = (e, img) => {
  if (!img.colorPickerCanvas) return;
  
  const rect = img.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const scaleX = img.naturalWidth / rect.width;
  const scaleY = img.naturalHeight / rect.height;
  const naturalX = Math.floor(x * scaleX);
  const naturalY = Math.floor(y * scaleY);
  
  const ctx = img.colorPickerCanvas.getContext('2d', { willReadFrequently: true });
  const pixelData = ctx.getImageData(naturalX, naturalY, 1, 1).data;
  
  const hex = '#' + [pixelData[0], pixelData[1], pixelData[2]]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
  
  const rgb = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
  
  navigator.clipboard.writeText(hex).then(() => {
    showColorNotification(hex, rgb, e.clientX, e.clientY);
  });
};

const showColorNotification = (hex, rgb, x, y) => {
  const notification = document.createElement('div');
  notification.className = 'overlayly-color-notification';
  notification.style.left = x + 'px';
  notification.style.top = y + 'px';
  notification.innerHTML = `
    <div class="color-preview" style="background-color: ${hex}"></div>
    <div class="color-info">
      <strong>Copied!</strong>
      <div class="color-codes">
        <div>${hex}</div>
        <div>${rgb}</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2500);
};

const setupRuler = () => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      toggleRuler();
    }
  });
};

const toggleRuler = () => {
  rulerActive = !rulerActive;
  const statusEl = document.getElementById('ruler-status');
  
  if (rulerActive) {
    if (statusEl) statusEl.textContent = 'ON';
    overlayImage.style.cursor = 'crosshair';
    document.body.style.cursor = 'crosshair';
    setupRulerListeners();
  } else {
    if (statusEl) statusEl.textContent = 'OFF';
    overlayImage.style.cursor = 'crosshair';
    document.body.style.cursor = 'default';
    removeRulerListeners();
    if (rulerElement) {
      rulerElement.remove();
      rulerElement = null;
    }
    rulerStart = null;
  }
};

const setupRulerListeners = () => {
  document.body.addEventListener('pointerdown', rulerPointerDown, true);
  document.body.addEventListener('pointermove', rulerPointerMove, true);
  document.body.addEventListener('pointerup', rulerPointerUp, true);
  
  document.body.style.touchAction = 'none';
};

const removeRulerListeners = () => {
  document.body.removeEventListener('pointerdown', rulerPointerDown, true);
  document.body.removeEventListener('pointermove', rulerPointerMove, true);
  document.body.removeEventListener('pointerup', rulerPointerUp, true);
  
  document.body.style.touchAction = '';
};

const rulerPointerDown = (e) => {
  if (!rulerActive) return;
  
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  document.body.style.overflow = 'hidden';
  
  rulerStart = { x: e.clientX, y: e.clientY };
  
  if (rulerElement) {
    rulerElement.remove();
  }
  
  rulerElement = document.createElement('div');
  rulerElement.className = 'overlayly-ruler';
  rulerElement.innerHTML = `
    <div class="ruler-line"></div>
    <div class="ruler-label">0px</div>
  `;
  document.body.appendChild(rulerElement);
};

const rulerPointerMove = (e) => {
  if (!rulerActive || !rulerStart || !rulerElement) return;
  
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  const dx = e.clientX - rulerStart.x;
  const dy = e.clientY - rulerStart.y;
  const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  const line = rulerElement.querySelector('.ruler-line');
  const label = rulerElement.querySelector('.ruler-label');
  
  if (line && label) {
    line.style.width = distance + 'px';
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = rulerStart.x + 'px';
    line.style.top = rulerStart.y + 'px';
    
    label.textContent = `${distance}px (${Math.abs(Math.round(dx))}×${Math.abs(Math.round(dy))})`;
    label.style.left = (rulerStart.x + dx / 2) + 'px';
    label.style.top = (rulerStart.y + dy / 2 - 20) + 'px';
  }
};

const rulerPointerUp = (e) => {
  if (!rulerActive) return;
  
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  document.body.style.overflow = '';
};

const removeOverlay = () => {
  if (overlay) {
    overlay.remove();
    overlay = null;
    overlayImage = null;
  }
  
  if (controlsPanel) {
    controlsPanel.remove();
    controlsPanel = null;
  }
  
  if (bottomBar) {
    bottomBar.remove();
    bottomBar = null;
  }
  
  if (rulerElement) {
    rulerElement.remove();
    rulerElement = null;
  }
  
  rulerActive = false;
  removeRulerListeners();
};

window.addEventListener('beforeunload', removeOverlay);
