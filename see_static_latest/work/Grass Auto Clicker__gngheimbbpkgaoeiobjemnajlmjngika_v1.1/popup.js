document.addEventListener('DOMContentLoaded', () => {
  const btnToggle = document.getElementById('btn-toggle');
  const btnPick = document.getElementById('btn-pick');
  const btnPickCoord = document.getElementById('btn-pick-coord'); // new coord button
  const btnSetKey = document.getElementById('btn-set-key');
  const inputCps = document.getElementById('cps');
  const statusText = document.getElementById('status-text');
  
  const radioFollow = document.querySelector('input[value="follow"]');
  const radioFixed = document.querySelector('input[value="fixed"]');
  const radioCoord = document.querySelector('input[value="coordinate"]'); // new radio

  let typingTimer;
  let isRecordingKey = false;

  chrome.storage.local.get(['isRunning', 'mode', 'interval', 'shortcut'], (data) => {
    
    if (data.shortcut) {
      displayShortcut(data.shortcut);
    } else {
      btnSetKey.innerText = "Alt + Shift + S";
    }

    if (data.mode) {
      const modeInput = document.querySelector(`input[value="${data.mode}"]`);
      if (modeInput) modeInput.checked = true;
      
      // setup ui based on saved mode
      if (btnPick) btnPick.classList.toggle('hidden', data.mode !== 'fixed');
      if (btnPickCoord) btnPickCoord.classList.toggle('hidden', data.mode !== 'coordinate');
      
      if (data.mode === 'fixed') checkElementStatus();
    }
    
    if (data.interval) {
      const savedCps = Math.round(1000 / data.interval);
      inputCps.value = savedCps > 0 ? savedCps : 10;
    }

    updateStatusText(data.isRunning);
    updateToggleButton(data.isRunning);
    toggleInputs(!data.isRunning);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.isRunning) {
      const isRunning = changes.isRunning.newValue;
      updateToggleButton(isRunning);
      updateStatusText(isRunning);
      toggleInputs(!isRunning);
    }
  });

  btnSetKey.addEventListener('click', () => {
    isRecordingKey = true;
    btnSetKey.innerText = "Press new key...";
    btnSetKey.style.background = "#fff9c4"; 
    btnSetKey.style.borderColor = "#fbc02d";
  });

  document.addEventListener('keydown', (e) => {
    if (!isRecordingKey) return;
    
    e.preventDefault();
    e.stopPropagation();

    if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return;

    const newShortcut = {
      code: e.code,
      key: e.key.toUpperCase(),
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey
    };

    chrome.storage.local.set({ shortcut: newShortcut }, () => {
      displayShortcut(newShortcut);
    });
    
    isRecordingKey = false;
    btnSetKey.style.background = "#fff";
    btnSetKey.style.borderColor = "#ddd";
  });

  function displayShortcut(sc) {
    const parts = [];
    if (sc.ctrl) parts.push("Ctrl");
    if (sc.alt) parts.push("Alt");
    if (sc.shift) parts.push("Shift");
    if (sc.meta) parts.push("Cmd");
    parts.push(sc.key); 
    
    btnSetKey.innerText = parts.join(" + ");
  }

  inputCps.addEventListener('input', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      const val = parseInt(inputCps.value);
      const cps = (val && val > 0) ? val : 1; 
      const interval = 1000 / cps;
      chrome.storage.local.set({ interval: interval });
    }, 500); 
  });

  // handle radio switching
  [radioFollow, radioFixed, radioCoord].forEach(radio => {
    if (!radio) return;
    radio.addEventListener('change', (e) => {
      const mode = e.target.value;
      
      const isRunning = btnToggle.classList.contains('stop');
      if (!isRunning) {
        btnPick.classList.toggle('hidden', mode !== 'fixed');
        if (btnPickCoord) btnPickCoord.classList.toggle('hidden', mode !== 'coordinate');
      }

      chrome.storage.local.set({ mode: mode });
      if (mode === 'fixed') checkElementStatus();
    });
  });

  function toggleInputs(isEnabled) {
    inputCps.disabled = !isEnabled;
    radioFollow.disabled = !isEnabled;
    radioFixed.disabled = !isEnabled;
    if (radioCoord) radioCoord.disabled = !isEnabled;

    if (isEnabled) {
       const modeRadio = document.querySelector('input[name="mode"]:checked');
       const mode = modeRadio ? modeRadio.value : 'follow';
       btnPick.classList.toggle('hidden', mode !== 'fixed');
       if (btnPickCoord) btnPickCoord.classList.toggle('hidden', mode !== 'coordinate');
    } else {
       btnPick.classList.add('hidden');
       if (btnPickCoord) btnPickCoord.classList.add('hidden');
    }
  }

  function checkElementStatus() {
    sendMessageToActiveTab({ action: "check_element_status" }, (response) => {
      if (response && response.hasElement) {
        btnPick.innerHTML = "&#x2705; Element Selected";
        btnPick.style.background = "#e8f5e9";
        btnPick.style.color = "#2e7d32";
      } else {
        btnPick.innerHTML = "&#x1F3AF; Pick Element";
        btnPick.style.background = "#e3f2fd";
        btnPick.style.color = "#1976d2";
      }
    });
  }

  // selection listeners
  btnPick.addEventListener('click', () => {
    window.close();
    sendMessageToActiveTab({ action: "start_selection" });
  });

  if (btnPickCoord) {
    btnPickCoord.addEventListener('click', () => {
      window.close();
      sendMessageToActiveTab({ action: "start_coord_selection" });
    });
  }

  btnToggle.addEventListener('click', () => {
    chrome.storage.local.get(['isRunning', 'interval', 'mode'], (data) => {
      const currentNativeState = data.isRunning || false;
      const newState = !currentNativeState;
      const val = parseInt(inputCps.value);
      const cps = (val && val > 0) ? val : 10;
      const interval = 1000 / cps;
      const modeRadio = document.querySelector('input[name="mode"]:checked');
      const mode = modeRadio ? modeRadio.value : 'follow';

      sendMessageToActiveTab({ 
        action: "toggle", 
        state: newState, 
        interval: interval, 
        mode: mode 
      }, (response) => {
        if (response && response.status === "success") {
           chrome.storage.local.set({ isRunning: newState, interval: interval, mode: mode });
        } else {
           statusText.innerText = "Error: Refresh Page";
        }
      });
    });
  });

  function updateToggleButton(isRunning) {
    btnToggle.innerText = isRunning ? "STOP" : "START";
    btnToggle.className = isRunning ? "stop" : "";
  }

  function updateStatusText(isRunning) {
      statusText.innerText = isRunning ? "Running..." : "Stopped";
  }

  function sendMessageToActiveTab(msg, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        if (msg.state === true) chrome.storage.local.set({ targetTabId: activeTab.id });

        chrome.tabs.sendMessage(activeTab.id, msg, (response) => {
            if (chrome.runtime.lastError) {
                if (msg.state === true) chrome.storage.local.set({ isRunning: false });
                if(callback) callback(null);
            } else {
                if(callback) callback(response);
            }
        });
      }
    });
  }
});