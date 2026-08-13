// Rotate an image or video element
function rotateElement(element, action) {
  if (!element) return;

  // Get current rotation from data attribute (default to 0)
  let currentRotation = parseInt(element.getAttribute('data-rotation') || '0');

  // Calculate new rotation based on action
  let newRotation;
  if (action === 'rotateRight') {
    newRotation = currentRotation + 90;
  } else if (action === 'rotateLeft') {
    newRotation = currentRotation - 90;
  } else if (action === 'resetRotation') {
    newRotation = 0;
  }

  // Normalize rotation to -360 to 360 range to prevent overflow
  newRotation = newRotation % 360;

  // Store rotation in data attribute
  element.setAttribute('data-rotation', newRotation);

  // Apply CSS transform with !important to override platform styles
  element.style.setProperty('transform', `rotate(${newRotation}deg)`, 'important');
  element.style.setProperty('transform-origin', 'center center', 'important');
}

// Find the image or video element that was right-clicked
function findElementBySrc(srcUrl) {
  // Check images
  const images = document.querySelectorAll('img');
  for (let img of images) {
    if (img.src === srcUrl || img.currentSrc === srcUrl) {
      return img;
    }
  }

  // Check videos
  const videos = document.querySelectorAll('video');
  for (let video of videos) {
    if (video.src === srcUrl || video.currentSrc === srcUrl) {
      return video;
    }
  }

  return null;
}

// Find video or image within element or its parents (for overlay elements)
function findMediaElement(element) {
  // Check if element itself is media
  if (element.nodeName === 'IMG' || element.nodeName === 'VIDEO') {
    return element;
  }

  // Check if element contains a video (common in Instagram/Facebook reels)
  const video = element.querySelector('video');
  if (video) return video;

  // Check if element contains an image
  const img = element.querySelector('img');
  if (img) return img;

  // Check parent containers (up to 5 levels)
  let parent = element.parentElement;
  let depth = 0;
  while (parent && depth < 5) {
    const videoInParent = parent.querySelector('video');
    if (videoInParent) return videoInParent;

    const imgInParent = parent.querySelector('img');
    if (imgInParent) return imgInParent;

    parent = parent.parentElement;
    depth++;
  }

  return null;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action && message.srcUrl) {
    const element = findElementBySrc(message.srcUrl);
    if (element) {
      rotateElement(element, message.action);
    }
  }
});

// Track the currently hovered image or video
let hoveredElement = null;

document.addEventListener('mouseover', (event) => {
  const mediaElement = findMediaElement(event.target);
  if (mediaElement) {
    hoveredElement = mediaElement;
  }
}, true);

document.addEventListener('mouseout', (event) => {
  const mediaElement = findMediaElement(event.target);
  if (mediaElement === hoveredElement) {
    hoveredElement = null;
  }
}, true);

// Listen for keyboard shortcuts: R for clockwise, Shift+R or [ for counter-clockwise
document.addEventListener('keydown', (event) => {
  if (!hoveredElement) return;

  // Ignore if user is typing in an input field
  if (event.target.matches('input, textarea, [contenteditable="true"]')) {
    return;
  }

  // R = rotate clockwise
  if (event.key === 'r' && !event.shiftKey) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    rotateElement(hoveredElement, 'rotateRight');
  }
  // Shift + R or [ = rotate counter-clockwise
  else if ((event.key === 'R' && event.shiftKey) || event.key === '[') {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    rotateElement(hoveredElement, 'rotateLeft');
  }
}, true);

// MutationObserver to handle dynamically loaded images and videos
// This ensures new media that appears after page load can also be rotated
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      // Check if the node itself is an image or video
      if (node.nodeName === 'IMG' || node.nodeName === 'VIDEO') {
        // Element is ready to be rotated when right-clicked
        // No initialization needed since we store rotation on-demand
      }
      // Check if the node contains images or videos
      if (node.querySelectorAll) {
        const media = node.querySelectorAll('img, video');
        // Media elements are ready to be rotated when right-clicked
      }
    });
  });
});

// Start observing the document for dynamic content
observer.observe(document.body, {
  childList: true,
  subtree: true
});
