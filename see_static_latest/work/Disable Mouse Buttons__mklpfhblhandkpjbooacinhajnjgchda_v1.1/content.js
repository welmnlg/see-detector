// Default settings (match popup defaults)
let settings = {
  disableSide: true,
  disableMiddle: true,
  disableScroll: false
};

// Initialize settings from storage
chrome.storage.sync.get(['disableSide', 'disableMiddle', 'disableScroll'], (result) => {
  if (result.disableSide !== undefined) settings.disableSide = result.disableSide;
  if (result.disableMiddle !== undefined) settings.disableMiddle = result.disableMiddle;
  if (result.disableScroll !== undefined) settings.disableScroll = result.disableScroll;
});

// Listen for setting changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes.disableSide) settings.disableSide = changes.disableSide.newValue;
    if (changes.disableMiddle) settings.disableMiddle = changes.disableMiddle.newValue;
    if (changes.disableScroll) settings.disableScroll = changes.disableScroll.newValue;
  }
});

// Options for strongest interception: capture phase + non-passive
const options = { passive: false, capture: true };

// Helper to check if event involves target buttons
function isTargetButton(e, type) {
  // 1 = Middle, 3 = Back, 4 = Forward
  if (type === 'side') return [3, 4].includes(e.button);
  if (type === 'middle') return e.button === 1;
  return false;
}

// Unified handler for all click-like events (Mouse + Pointer + Auxclick)
function handleInputEvent(e) {
  // Check Side Buttons
  if (settings.disableSide && isTargetButton(e, 'side')) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }
  
  // Check Middle Button
  if (settings.disableMiddle && isTargetButton(e, 'middle')) {
    // Only block if it's a press down or auxclick (to stop autoscroll/paste)
    // We strictly block it to prevent detection
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }
}

// Block all related event types to prevent detection via different APIs
const eventTypes = [
  'mousedown', 'mouseup', 
  'pointerdown', 'pointerup', 
  'auxclick', 'contextmenu' // prevent context menu if triggered by these buttons (rare but possible)
];

eventTypes.forEach(type => {
  window.addEventListener(type, handleInputEvent, options);
});

// Disable mouse wheel scrolling
function preventScroll(e) {
  if (!settings.disableScroll) return;
  e.preventDefault();
  e.stopImmediatePropagation();
}

window.addEventListener('wheel', preventScroll, options);
window.addEventListener('mousewheel', preventScroll, options);
window.addEventListener('DOMMouseScroll', preventScroll, options);