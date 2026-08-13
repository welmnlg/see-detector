let timer = null;
let currentMode = 'move';
let currentInterval = 60;
let isActive = false;

// Restore state when page loads
chrome.storage.local.get(['active', 'mode', 'interval'], (data) => {
  if (data.active) {
    isActive = true;
    currentMode = data.mode || 'move';
    currentInterval = data.interval || 60;
    startActivity();
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TOGGLE') {
    isActive = msg.active;
    currentMode = msg.mode || currentMode;
    currentInterval = msg.interval || currentInterval;
    if (isActive) {
      startActivity();
    } else {
      stopActivity();
    }
  }
  if (msg.type === 'UPDATE_INTERVAL') {
    currentInterval = msg.interval;
    if (isActive) {
      stopActivity();
      startActivity();
    }
  }
  if (msg.type === 'UPDATE_MODE') {
    currentMode = msg.mode;
  }
});

function startActivity() {
  stopActivity();
  timer = setInterval(doActivity, currentInterval * 1000);
}

function stopActivity() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function doActivity() {
  // Always do both -- scroll is most reliable for app activity detection
  simulateScroll();
  if (currentMode === 'move') {
    simulateMouseMove();
  }
  // Notify popup that activity fired
  try {
    chrome.runtime.sendMessage({ type: 'ACTIVITY_FIRED' }, () => {
      if (chrome.runtime.lastError) {}
    });
  } catch(e) {}
}

function simulateMouseMove() {
  // Use a floating indicator so user can SEE it working
  showActivityIndicator();
  
  // Dispatch real mousemove events
  const x = Math.floor(Math.random() * window.innerWidth * 0.6) + window.innerWidth * 0.2;
  const y = Math.floor(Math.random() * window.innerHeight * 0.6) + window.innerHeight * 0.2;
  
  ['mousemove', 'pointermove'].forEach(type => {
    document.dispatchEvent(new MouseEvent(type, {
      clientX: x, clientY: y, bubbles: true, cancelable: true, view: window
    }));
  });

  setTimeout(() => {
    ['mousemove', 'pointermove'].forEach(type => {
      document.dispatchEvent(new MouseEvent(type, {
        clientX: x + Math.round(Math.random() * 8 - 4),
        clientY: y + Math.round(Math.random() * 8 - 4),
        bubbles: true, view: window
      }));
    });
  }, 400);
}

function showActivityIndicator() {
  let indicator = document.getElementById('__stay_active_indicator__');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = '__stay_active_indicator__';
    indicator.style.cssText = `
      position: fixed; bottom: 16px; right: 16px; z-index: 999999;
      background: rgba(124,58,237,0.9); color: white;
      padding: 6px 12px; border-radius: 20px; font-size: 12px;
      font-family: -apple-system, sans-serif; font-weight: 600;
      pointer-events: none; opacity: 0; transition: opacity 0.3s;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    `;
    indicator.textContent = '🖱️ Stay Active';
    document.body.appendChild(indicator);
  }
  indicator.style.opacity = '1';
  clearTimeout(indicator._hideTimer);
  indicator._hideTimer = setTimeout(() => { indicator.style.opacity = '0'; }, 1500);
}

function simulateScroll() {
  // Actually scroll 2px down then back -- visible confirmation it's working
  window.scrollBy({ top: 20, behavior: 'smooth' });
  setTimeout(() => window.scrollBy({ top: -20, behavior: 'smooth' }), 600);
  showActivityIndicator();
}
