let currentSpeed = 1.0;
const MIN_SPEED = 0.25;
const MAX_SPEED = 16.0;
let overlayTimeout = null;
let lastHoveredVideo = null;

// Initialize
chrome.storage.sync.get(['playbackRate'], (result) => {
    if (result.playbackRate) {
        currentSpeed = result.playbackRate;
        applySpeedToVideos(currentSpeed);
    }
});

function getActiveVideo() {
    // Find all playing videos
    const playingVideos = Array.from(document.querySelectorAll('video')).filter(v => !v.paused && v.readyState >= 2);
    
    if (playingVideos.length === 0) return null;

    // Priority 1: Hovered video if it's playing
    if (lastHoveredVideo && !lastHoveredVideo.paused && document.contains(lastHoveredVideo)) {
        return lastHoveredVideo;
    }
    
    // Priority 2: The first playing video found
    return playingVideos[0];
}

function applySpeedToVideos(speed) {
    const videos = document.getElementsByTagName('video');
    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        
        // Track hovered video
        if (!video.dataset.increaserHoverAttached) {
            video.dataset.increaserHoverAttached = "true";
            video.addEventListener('mouseenter', () => lastHoveredVideo = video);
        }

        if (video.playbackRate !== speed) {
            video.playbackRate = speed;
        }
        if (!video.dataset.increaserAttached) {
            video.dataset.increaserAttached = "true";
            const enforce = () => {
                if (video.playbackRate !== currentSpeed) {
                    video.playbackRate = currentSpeed;
                }
            };
            video.addEventListener('play', enforce);
            video.addEventListener('playing', enforce);
            video.addEventListener('ratechange', () => {
                if (video.playbackRate !== currentSpeed) enforce();
            });
            enforce();
        }
    }
}

function showOverlay(speed, direction) {
    const activeVideo = getActiveVideo();
    if (!activeVideo) return;

    // Remove existing
    const existing = document.getElementById('speed-increaser-global-overlay');
    if (existing) existing.remove();
    clearTimeout(overlayTimeout);

    const overlay = document.createElement('div');
    overlay.id = 'speed-increaser-global-overlay';
    overlay.className = 'speed-increaser-overlay-video-centered';
    
    const icon = direction === 'up' ? 
        `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>` :
        `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>`;

    overlay.innerHTML = `<div class="icon-row">${icon}</div><div class="text-row">${speed.toFixed(2)}x</div>`;
    
    // Position fixedly but relative to the video's viewport position
    const rect = activeVideo.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    overlay.style.setProperty('left', `${centerX}px`, 'important');
    overlay.style.setProperty('top', `${centerY}px`, 'important');

    (document.body || document.documentElement).appendChild(overlay);

    overlayTimeout = setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 250);
    }, 700);
}

function updateSpeed(newSpeed, isShortcut = false) {
    const activeVideo = getActiveVideo();
    
    // If it's a shortcut, strictly require playback
    if (isShortcut && (!activeVideo || activeVideo.paused)) return;

    const direction = newSpeed > currentSpeed ? 'up' : 'down';
    currentSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));
    
    // Always apply logic and save to storage
    applySpeedToVideos(currentSpeed);
    chrome.storage.sync.set({ playbackRate: currentSpeed });
    
    // Show overlay only if a video is actually playing (to avoid ghosting)
    if (activeVideo && !activeVideo.paused) {
        showOverlay(currentSpeed, direction);
    }

    try {
        chrome.runtime.sendMessage({ action: 'speedUpdated', speed: currentSpeed }).catch(() => {});
    } catch (e) {
        // Silently catch extension context invalidated errors
    }
}

document.addEventListener('keydown', (event) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
    const key = event.key.toLowerCase();
    const shift = event.shiftKey;
    if (key === 'z') {
        shift ? updateSpeed(1.0, true) : updateSpeed(currentSpeed - 0.25, true);
    } else if (key === 'x') {
        shift ? updateSpeed(currentSpeed + 5.0, true) : updateSpeed(currentSpeed + 0.25, true);
    }
});

setInterval(() => applySpeedToVideos(currentSpeed), 500);

const observer = new MutationObserver(() => applySpeedToVideos(currentSpeed));
if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
} else {
    // Fallback for pages where body isn't ready immediately
    const docObserver = new MutationObserver((mutations, obs) => {
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            obs.disconnect();
        }
    });
    docObserver.observe(document.documentElement, { childList: true });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setSpeed') updateSpeed(request.speed, false); // Popup is NOT a shortcut
    if (request.action === 'getSpeed') sendResponse({ speed: currentSpeed });
});
