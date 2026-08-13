// Content script for typing French accents directly into web pages

// Typing mode state
let typingModeEnabled = true;
let overlayVisible = false;
let overlayElement = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let lastFocusedInput = null; // Store the last focused input element

// French accent characters
const accentCharacters = [
  // Lowercase accents
  'à', 'â', 'ä', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ö', 'ù', 'û', 'ü', 'ÿ', 'ç',
  // Uppercase accents
  'À', 'Â', 'Ä', 'É', 'È', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ö', 'Ù', 'Û', 'Ü', 'Ÿ', 'Ç',
  // Ligatures
  'æ', 'œ', 'Æ', 'Œ',
  // Punctuation
  '«', '»', '–', '—', '€'
];

// Get active input element
function getActiveInputElement() {
  // First try the currently active element
  const activeElement = document.activeElement;
  const isInput = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable
  );
  
  if (isInput) {
    lastFocusedInput = activeElement; // Update stored reference
    return activeElement;
  }
  
  // Fallback to last focused input if current element is not an input
  if (lastFocusedInput && document.body.contains(lastFocusedInput)) {
    return lastFocusedInput;
  }
  
  return null;
}

// Insert text at cursor position
function insertTextAtCursor(text, inputElement = null) {
  // Use provided input element or try to get active one
  const input = inputElement || getActiveInputElement();
  if (!input) {
    console.log('French Accents: No active input element');
    return false;
  }

  try {
    if (input.isContentEditable) {
      // For contenteditable elements
      input.focus(); // Ensure it's focused
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback: append to end
        const textNode = document.createTextNode(text);
        input.appendChild(textNode);
      }
      
      // Trigger input events
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // For input and textarea elements
      input.focus(); // Ensure it's focused
      
      // Get cursor position (fallback to end if selection is invalid)
      let start = input.selectionStart;
      let end = input.selectionEnd;
      
      // Handle cases where selectionStart/End might not be available
      if (start === null || start === undefined || isNaN(start)) {
        start = (input.value || '').length;
      }
      if (end === null || end === undefined || isNaN(end)) {
        end = (input.value || '').length;
      }
      
      const value = input.value || '';
      const newValue = value.substring(0, start) + text + value.substring(end);
      
      // Set the value directly
      input.value = newValue;
      
      // Try to set cursor position (some input types don't support this)
      try {
        const newPosition = start + text.length;
        // Check if input type supports setSelectionRange
        const inputType = input.type ? input.type.toLowerCase() : 'text';
        const supportsSelection = !['email', 'number', 'tel', 'url', 'date', 'time', 'month', 'week'].includes(inputType);
        
        if (supportsSelection && typeof input.setSelectionRange === 'function') {
          input.setSelectionRange(newPosition, newPosition);
        }
      } catch (selectionError) {
        // Some input types don't support setSelectionRange, that's okay
        // Just continue without setting cursor position
      }
      
      // Trigger input event for React and other frameworks
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      input.dispatchEvent(inputEvent);
      
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      input.dispatchEvent(changeEvent);
    }
    
    // Keep focus on input
    input.focus();
    
    return true;
  } catch (error) {
    console.error('French Accents: Error inserting text:', error);
    return false;
  }
}

// Create overlay keyboard
function createOverlay() {
  if (overlayElement) return overlayElement;

  // Create overlay container
  overlayElement = document.createElement('div');
  overlayElement.id = 'french-accents-overlay';

  // Create header
  const header = document.createElement('div');
  header.className = 'overlay-header';
  
  const title = document.createElement('div');
  title.className = 'overlay-title';
  title.textContent = 'French Accents';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'overlay-close';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.onclick = () => hideOverlay();
  
  header.appendChild(title);
  header.appendChild(closeBtn);

  // Create accents grid
  const grid = document.createElement('div');
  grid.className = 'accents-grid';

  accentCharacters.forEach(char => {
    const button = document.createElement('button');
    button.className = 'accent-button' + (char === char.toUpperCase() && char !== char.toLowerCase() ? ' capital' : '');
    button.textContent = char;
    button.setAttribute('aria-label', `Insert ${char}`);
    button.type = 'button'; // Prevent form submission
    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get the stored input element (this should be set when input was focused)
      const activeInput = lastFocusedInput || getActiveInputElement();
      
      if (!activeInput) {
        console.log('French Accents: No active input field found. Please click on an input field first.');
        return;
      }
      
      // Re-focus the input before inserting
      try {
        activeInput.focus();
        // Small delay to ensure focus is set
        setTimeout(() => {
          // Insert the character
          const success = insertTextAtCursor(char, activeInput);
          
          if (success) {
            console.log(`French Accents: Inserted "${char}" successfully into`, activeInput.tagName);
            // Visual feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
              button.style.transform = '';
            }, 100);
          } else {
            console.error('French Accents: Failed to insert character');
          }
          
          // Ensure input stays focused after insertion
          if (activeInput && document.activeElement !== activeInput) {
            activeInput.focus();
          }
        }, 10);
      } catch (error) {
        console.error('French Accents: Error focusing input:', error);
      }
    };
    grid.appendChild(button);
  });

  // Create footer
  const footer = document.createElement('div');
  footer.className = 'overlay-footer';
  footer.textContent = 'Click to type into active field';

  // Assemble overlay
  overlayElement.appendChild(header);
  overlayElement.appendChild(grid);
  overlayElement.appendChild(footer);

  // Make draggable
  header.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);

  // Inject styles
  injectOverlayStyles();

  // Append to body
  document.body.appendChild(overlayElement);

  return overlayElement;
}

// Inject overlay CSS
function injectOverlayStyles() {
  if (document.getElementById('french-accents-overlay-styles')) return;

  const style = document.createElement('style');
  style.id = 'french-accents-overlay-styles';
  style.textContent = `
    #french-accents-overlay {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05);
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: none;
      min-width: 240px;
      max-width: 300px;
      animation: slideInUp 0.3s ease-out;
    }
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #french-accents-overlay.visible {
      display: block;
    }
    #french-accents-overlay.dragging {
      cursor: move;
      user-select: none;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05);
    }
    .overlay-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
      cursor: move;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: -12px -12px 10px -12px;
      padding: 10px 12px;
      border-radius: 12px 12px 0 0;
    }
    .overlay-title {
      font-size: 13px;
      font-weight: 600;
      color: white;
      margin: 0;
    }
    .overlay-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      font-size: 14px;
      color: white;
      cursor: pointer;
      padding: 2px 6px;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      transition: all 0.2s ease;
      font-weight: 600;
    }
    .overlay-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    .overlay-close:active {
      transform: scale(0.95);
    }
    .accents-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 5px;
    }
    .accent-button {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border: 1px solid #e1e8ed;
      border-radius: 6px;
      padding: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      user-select: none;
      font-weight: 600;
      color: #2c3e50;
      position: relative;
      overflow: hidden;
    }
    .accent-button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(102, 126, 234, 0.2);
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease;
    }
    .accent-button:hover::before {
      width: 100%;
      height: 100%;
    }
    .accent-button:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .accent-button:active {
      transform: translateY(-1px) scale(1.02);
      box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
    }
    .accent-button.capital {
      font-size: 12px;
    }
    .overlay-footer {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e9ecef;
      font-size: 9px;
      color: #95a5a6;
      text-align: center;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
}

// Show overlay
function showOverlay() {
  if (!typingModeEnabled) return;
  
  const overlay = createOverlay();
  overlay.classList.add('visible');
  overlayVisible = true;
}

// Hide overlay
function hideOverlay() {
  if (overlayElement) {
    overlayElement.classList.remove('visible');
    overlayVisible = false;
  }
}

// Toggle overlay
function toggleOverlay() {
  if (overlayVisible) {
    hideOverlay();
  } else {
    showOverlay();
  }
}

// Drag functionality
function startDrag(e) {
  if (e.target.classList.contains('overlay-close')) return;
  isDragging = true;
  const overlay = overlayElement;
  const rect = overlay.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;
  overlay.classList.add('dragging');
  e.preventDefault();
}

function drag(e) {
  if (!isDragging || !overlayElement) return;
  
  overlayElement.style.left = (e.clientX - dragOffset.x) + 'px';
  overlayElement.style.top = (e.clientY - dragOffset.y) + 'px';
  overlayElement.style.right = 'auto';
  overlayElement.style.bottom = 'auto';
}

function stopDrag() {
  isDragging = false;
  if (overlayElement) {
    overlayElement.classList.remove('dragging');
  }
}

// Show overlay when input is focused
function handleInputFocus(event) {
  if (typingModeEnabled) {
    // Store the focused input
    lastFocusedInput = event.target;
    console.log('French Accents: Input focused, showing overlay', event.target);
    showOverlay();
  }
}

// Hide overlay when clicking outside
function handleClickOutside(event) {
  if (overlayElement && overlayVisible) {
    if (!overlayElement.contains(event.target) && !getActiveInputElement()) {
      hideOverlay();
    }
  }
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleTypingMode') {
    typingModeEnabled = request.enabled;
    if (!typingModeEnabled) {
      hideOverlay();
    }
    sendResponse({ success: true });
  } else if (request.action === 'getTypingMode') {
    sendResponse({ enabled: typingModeEnabled });
  } else if (request.action === 'typeCharacter') {
    const success = insertTextAtCursor(request.character);
    sendResponse({ success });
  } else if (request.action === 'toggleOverlay') {
    toggleOverlay();
    sendResponse({ success: true, visible: overlayVisible });
  } else if (request.action === 'showOverlay') {
    showOverlay();
    sendResponse({ success: true });
  } else if (request.action === 'hideOverlay') {
    hideOverlay();
    sendResponse({ success: true });
  }
  return true;
});

// Initialize overlay functionality
function initializeOverlay() {
  // Show overlay when input fields are focused
  document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      handleInputFocus(e);
    }
  }, true);

  // Hide overlay when clicking outside
  document.addEventListener('click', handleClickOutside, true);

  // Hide overlay on blur if no input is active
  document.addEventListener('focusout', (e) => {
    setTimeout(() => {
      // Don't hide if clicking on overlay buttons
      if (overlayElement && overlayElement.contains(document.activeElement)) {
        return;
      }
      if (!getActiveInputElement()) {
        hideOverlay();
        lastFocusedInput = null;
      }
    }, 200); // Increased delay to allow button clicks
  }, true);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOverlay);
} else {
  initializeOverlay();
}

// Load saved typing mode preference
chrome.storage.sync.get(['typingModeEnabled'], (result) => {
  typingModeEnabled = result.typingModeEnabled !== false; // Default to true
});

