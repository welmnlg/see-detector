const counterEl = document.getElementById("counter");
const toggleBtn = document.getElementById("toggle");
const statusText = document.getElementById("statusText");
const dot = document.getElementById("dot");
const statusBar = document.getElementById("statusBar");

let blockingEnabled = true;

function updateCounter() {
  chrome.storage.local.get("blockedAds", data => {
    counterEl.textContent = data.blockedAds || 0;
  });
}

function setUI(enabled) {
  if (enabled) {
    toggleBtn.textContent = "⏸ Pause Protection";
    toggleBtn.classList.remove("off");
    statusText.textContent = "Protection Active";
    dot.classList.remove("off");
    statusBar.classList.remove("off");
  } else {
    toggleBtn.textContent = "▶ Resume Protection";
    toggleBtn.classList.add("off");
    statusText.textContent = "Protection Paused";
    dot.classList.add("off");
    statusBar.classList.add("off");
  }
}

toggleBtn.addEventListener("click", () => {
  blockingEnabled = !blockingEnabled;
  setUI(blockingEnabled);
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (enabled) => { window.blockingEnabled = enabled; },
        args: [blockingEnabled]
      });
    }
  });
});

updateCounter();
setInterval(updateCounter, 1000);
