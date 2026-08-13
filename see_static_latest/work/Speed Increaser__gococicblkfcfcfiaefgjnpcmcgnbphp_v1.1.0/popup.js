function updateUI(speed) {
    document.getElementById('currentSpeed').textContent = speed.toFixed(2);
}

function sendSpeedToContent(speed) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'setSpeed', speed: speed }).catch(() => {});
        }
    });
}

// Initial load
chrome.storage.sync.get(['playbackRate'], (result) => {
    const speed = result.playbackRate || 1.0;
    updateUI(speed);
});

// Listen for updates from content script
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'speedUpdated') {
        updateUI(request.speed);
    }
});

document.getElementById('decrease').addEventListener('click', () => {
    chrome.storage.sync.get(['playbackRate'], (result) => {
        const currentSpeed = result.playbackRate || 1.0;
        sendSpeedToContent(currentSpeed - 0.25);
    });
});

document.getElementById('increase').addEventListener('click', () => {
    chrome.storage.sync.get(['playbackRate'], (result) => {
        const currentSpeed = result.playbackRate || 1.0;
        sendSpeedToContent(currentSpeed + 0.25);
    });
});

// Quick Speed Buttons
document.querySelectorAll('.q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        sendSpeedToContent(speed);
    });
});
