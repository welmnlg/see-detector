// Get current state and update UI
chrome.storage.local.get(['paused'], (result) => {
  const isPaused = result.paused || false;
  updateUI(isPaused);
});

const statusText = document.getElementById("statusText");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");

// Handle Pause button click
pauseBtn.addEventListener("click", () => {
  toggleExtension(true);
});

// Handle Resume button click
resumeBtn.addEventListener("click", () => {
  toggleExtension(false);
});

function toggleExtension(shouldPause) {
  // Save new state
  chrome.storage.local.set({ paused: shouldPause }, () => {
    updateUI(shouldPause);
    
    // Reload current active tab only
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  });
}

function updateUI(isPaused) {
  if (isPaused) {
    statusText.textContent = "Paused";
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
  } else {
    statusText.textContent = "Active";
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
  }
}