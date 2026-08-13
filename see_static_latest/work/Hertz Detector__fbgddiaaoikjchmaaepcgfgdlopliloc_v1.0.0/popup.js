// Hertz Detector - Popup Script
// The popup is always aware of which tab it's on.
// It only shows "detecting" state if THIS tab is the active one.
// Pro features (note detection, spectrum, multi-frequency) are gated.
// Free mode: manual trigger only, 10s auto-stop, no stop button.

// --- Note detection (12-TET equal temperament) ---

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const A4_FREQ = 440;
const A4_MIDI = 69;

function frequencyToNote(freq) {
  if (freq <= 0) return null;
  const midiExact = 12 * Math.log2(freq / A4_FREQ) + A4_MIDI;
  const midiRounded = Math.round(midiExact);
  const cents = Math.round((midiExact - midiRounded) * 100);
  const noteIndex = ((midiRounded % 12) + 12) % 12;
  const octave = Math.floor(midiRounded / 12) - 1;
  return { name: NOTE_NAMES[noteIndex] + octave, cents };
}

function formatCents(cents) {
  if (cents === 0) return "in tune";
  return cents > 0 ? `+${cents} cents sharp` : `${cents} cents flat`;
}

// --- Xano API ---

const XANO_API_BASE = "https://xatr-zu7c-us3r.n7d.xano.io/api:WzPrXJgj";
const EXTENSION_SOURCE = "hertz_detector";

// --- DOM references ---

const freqDisplay = document.getElementById("freq-value");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const noteDisplay = document.getElementById("note-display");
const noteName = document.getElementById("note-name");
const noteCents = document.getElementById("note-cents");
const spectrumCanvas = document.getElementById("spectrum-canvas");
const spectrumCtx = spectrumCanvas.getContext("2d");
const spectrumContainer = document.getElementById("spectrum-container");
const peaksContainer = document.getElementById("peaks-container");
const peaksList = document.getElementById("peaks-list");
const alwaysOnToggle = document.getElementById("always-on-toggle");
const alwaysOnContainer = document.getElementById("always-on-container");
const timerDisplay = document.getElementById("timer-display");
const timerText = document.getElementById("timer-text");
const upgradeCard = document.getElementById("upgrade-card");
const upgradeHeader = document.getElementById("upgrade-header");
const upgradeBtn = document.getElementById("upgrade-btn");
const codeInput = document.getElementById("code-input");
const codeSubmitBtn = document.getElementById("code-submit-btn");
const codeMessage = document.getElementById("code-message");

let thisTabId = null;
let isDetectingThisTab = false;
let pollInterval = null;
let latestSpectrum = null;
let animationFrameId = null;
let isPro = false;

// On open: figure out what tab we're on, then ask background for status
init();

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  thisTabId = tab.id;

  // Check if user has a stored pro purchase
  const stored = await chrome.storage.local.get(["proPurchased"]);
  if (stored.proPurchased) {
    // They previously redeemed a valid code, ensure pro is enabled
    chrome.runtime.sendMessage({ type: "set-pro", enabled: true });
  }

  chrome.runtime.sendMessage({ type: "get-status" }, (response) => {
    if (chrome.runtime.lastError || !response) return;

    isPro = response.proEnabled;
    alwaysOnToggle.checked = response.alwaysOn;
    updateProUI();

    if (response.activeTabId === thisTabId) {
      setUI(true);
      updateDisplay(response);
    } else {
      setUI(false);

      if (response.lastStopReason === "time-limit") {
        showLimitMessage();
      }
    }
  });
}

// --- Always-On toggle ---

alwaysOnToggle.addEventListener("change", () => {
  const enabled = alwaysOnToggle.checked;
  chrome.runtime.sendMessage({ type: "set-always-on", enabled }, (response) => {
    if (chrome.runtime.lastError || !response || !response.ok) {
      alwaysOnToggle.checked = false;
      return;
    }

    refreshStatus();
  });
});

// --- Upgrade card expand/collapse ---

upgradeHeader.addEventListener("click", () => {
  upgradeCard.classList.toggle("expanded");
});

// --- Upgrade button (Stripe checkout) ---

upgradeBtn.addEventListener("click", async () => {
  upgradeBtn.disabled = true;
  upgradeBtn.textContent = "Loading...";

  try {
    const resp = await fetch(`${XANO_API_BASE}/create_checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: EXTENSION_SOURCE }),
    });
    const data = await resp.json();
    if (data.url) {
      chrome.tabs.create({ url: data.url });
    } else {
      codeMessage.textContent = "Something went wrong. Please try again later.";
      codeMessage.className = "code-message error";
    }
  } catch (e) {
    codeMessage.textContent = "Connection failed. Please try again later.";
    codeMessage.className = "code-message error";
  }

  upgradeBtn.textContent = "Upgrade to Pro \u2014 $9";
  upgradeBtn.disabled = false;
});

// --- Code redemption ---

codeSubmitBtn.addEventListener("click", async () => {
  const code = codeInput.value.trim();
  if (!code) {
    codeMessage.textContent = "Please enter a code";
    codeMessage.className = "code-message error";
    return;
  }

  codeSubmitBtn.disabled = true;
  codeSubmitBtn.textContent = "...";
  codeMessage.textContent = "";
  codeMessage.className = "code-message";

  try {
    const resp = await fetch(`${XANO_API_BASE}/validate_code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, source: EXTENSION_SOURCE }),
    });
    const data = await resp.json();

    if (data.valid) {
      // Activate pro mode
      isPro = true;
      chrome.runtime.sendMessage({ type: "set-pro", enabled: true }, () => {
        updateProUI();
        refreshStatus();
      });
      // Persist the validated code so we remember they're pro
      chrome.storage.local.set({ proCode: code, proPurchased: true });
      codeMessage.textContent = "Pro activated!";
      codeMessage.className = "code-message success";
      codeInput.value = "";
    } else {
      codeMessage.textContent = data.error || "Invalid code";
      codeMessage.className = "code-message error";
    }
  } catch (e) {
    codeMessage.textContent = "Connection error. Try again.";
    codeMessage.className = "code-message error";
  }

  codeSubmitBtn.disabled = false;
  codeSubmitBtn.textContent = "Redeem";
});

// Allow Enter key to submit code
codeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    codeSubmitBtn.click();
  }
});

function refreshStatus() {
  chrome.runtime.sendMessage({ type: "get-status" }, (response) => {
    if (chrome.runtime.lastError || !response) return;

    isPro = response.proEnabled;
    alwaysOnToggle.checked = response.alwaysOn;
    updateProUI();

    if (response.activeTabId === thisTabId) {
      setUI(true);
      updateDisplay(response);
    } else {
      setUI(false);
    }
  });
}

// --- Pro UI gating ---

function updateProUI() {
  // Always-On toggle in header: only visible in pro mode
  alwaysOnContainer.style.display = isPro ? "flex" : "none";

  // Hide start/stop button when always-on is active
  startBtn.style.display = alwaysOnToggle.checked ? "none" : "block";

  // Upgrade card: only visible in free mode
  upgradeCard.style.display = isPro ? "none" : "block";

  // If not pro and not detecting, hide pro features
  if (!isPro) {
    noteDisplay.style.display = "none";
    spectrumContainer.style.display = "none";
    peaksContainer.style.display = "none";
    timerDisplay.style.display = "none";
  }
}

// --- Start button ---

startBtn.addEventListener("click", () => {
  if (thisTabId == null) return;

  // Pro users get start/stop toggle
  if (isPro && isDetectingThisTab) {
    chrome.runtime.sendMessage({ type: "stop" }, () => {
      setUI(false);
    });
    return;
  }

  // Free users: only start (auto-stops after 10s). Ignore click if already detecting.
  if (!isPro && isDetectingThisTab) return;

  chrome.runtime.sendMessage({ type: "start", tabId: thisTabId }, (response) => {
    if (chrome.runtime.lastError || !response) {
      statusEl.textContent = "Error communicating with extension";
      statusEl.className = "status inactive";
      return;
    }
    if (!response.ok) {
      statusEl.textContent = response.error || "Failed to start";
      statusEl.className = "status limit";
      return;
    }
    setUI(true);
  });
});

// --- UI state ---

function setUI(detecting) {
  isDetectingThisTab = detecting;
  if (detecting) {
    statusEl.textContent = "Detecting audio...";
    statusEl.className = "status active";

    if (isPro) {
      startBtn.textContent = "Stop Detecting";
      startBtn.className = "stop";
    } else {
      // Free: button shows "Detecting..." and is disabled during the 10s window
      startBtn.textContent = "Detecting...";
      startBtn.className = "stop";
      startBtn.disabled = true;
    }

    startPolling();
    if (isPro) {
      startRendering();
    }
  } else {
    startBtn.textContent = isPro ? "Start Detecting" : "Detect";
    startBtn.className = "";
    startBtn.disabled = false;

    if (statusEl.className !== "status limit") {
      statusEl.textContent = "Not detecting";
      statusEl.className = "status inactive";
    }

    freqDisplay.textContent = "--";
    noteDisplay.style.display = "none";
    spectrumContainer.style.display = "none";
    peaksContainer.style.display = "none";
    timerDisplay.style.display = "none";
    latestSpectrum = null;
    stopPolling();
    stopRendering();
  }

  // Re-apply always-on button visibility
  if (alwaysOnToggle.checked) {
    startBtn.style.display = "none";
  }
}

function showLimitMessage() {
  statusEl.textContent = "Detection complete";
  statusEl.className = "status limit";
}

// --- Polling ---

function startPolling() {
  stopPolling();
  pollInterval = setInterval(() => {
    chrome.runtime.sendMessage({ type: "get-status" }, (response) => {
      if (chrome.runtime.lastError || !response) return;

      isPro = response.proEnabled;

      if (response.activeTabId !== thisTabId) {
        setUI(false);

        if (response.lastStopReason === "time-limit") {
          showLimitMessage();
        }

        return;
      }

      updateDisplay(response);
    });
  }, 100);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// --- Display update (called from polling and init) ---

function updateDisplay(response) {
  // Frequency
  if (response.frequency > 0) {
    freqDisplay.textContent = Math.round(response.frequency);
  } else {
    freqDisplay.textContent = "--";
  }

  // Timer (free tier only)
  if (!isPro && response.remainingSeconds != null) {
    timerDisplay.style.display = "block";
    timerText.textContent = `${response.remainingSeconds}s`;
  } else {
    timerDisplay.style.display = "none";
  }

  // Pro-only features
  if (isPro) {
    // Note detection
    if (response.frequency > 0) {
      const note = frequencyToNote(response.frequency);
      if (note) {
        noteDisplay.style.display = "block";
        noteName.textContent = note.name;
        noteCents.textContent = formatCents(note.cents);
      }
    } else {
      noteDisplay.style.display = "none";
    }

    // Spectrum
    if (response.spectrum && response.spectrum.length > 0) {
      spectrumContainer.style.display = "block";
      latestSpectrum = response.spectrum;
      startRendering();
    } else {
      spectrumContainer.style.display = "none";
    }

    // Peaks
    renderPeaks(response.peaks);
  } else {
    noteDisplay.style.display = "none";
    spectrumContainer.style.display = "none";
    peaksContainer.style.display = "none";
    stopRendering();
  }
}

// --- Spectrum renderer ---

function startRendering() {
  if (animationFrameId) return;
  function renderLoop() {
    drawSpectrum();
    animationFrameId = requestAnimationFrame(renderLoop);
  }
  animationFrameId = requestAnimationFrame(renderLoop);
}

function stopRendering() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function drawSpectrum() {
  const data = latestSpectrum;
  if (!data || data.length === 0) return;

  const w = spectrumCanvas.width;
  const h = spectrumCanvas.height;

  spectrumCtx.clearRect(0, 0, w, h);
  spectrumCtx.fillStyle = "#12121f";
  spectrumCtx.fillRect(0, 0, w, h);

  const barWidth = w / data.length;
  const minDb = -100;
  const maxDb = -10;
  const range = maxDb - minDb;

  for (let i = 0; i < data.length; i++) {
    const normalized = Math.max(0, Math.min(1, (data[i] - minDb) / range));
    const barHeight = normalized * h;
    const intensity = Math.floor(100 + normalized * 155);
    spectrumCtx.fillStyle = `rgb(${Math.floor(intensity * 0.3)},${intensity},${Math.floor(intensity * 0.3)})`;
    spectrumCtx.fillRect(i * barWidth, h - barHeight, barWidth, barHeight);
  }

  // Frequency axis labels
  spectrumCtx.fillStyle = "#666";
  spectrumCtx.font = "16px sans-serif";
  const labels = [100, 500, 1000, 2000, 5000];
  const freqRange = 5000 - 20;
  for (const freq of labels) {
    const x = ((freq - 20) / freqRange) * w;
    const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
    spectrumCtx.fillText(label, x, h - 2);
  }
}

// --- Peaks list renderer ---

function renderPeaks(peaks) {
  if (!peaks || peaks.length === 0) {
    peaksContainer.style.display = "none";
    return;
  }

  peaksContainer.style.display = "block";

  const maxMag = peaks[0].mag;
  const rows = [];

  for (let i = 0; i < peaks.length; i++) {
    const peak = peaks[i];
    const note = frequencyToNote(peak.freq);
    const barPct = Math.max(5, ((peak.mag - -70) / (maxMag - -70)) * 100);

    rows.push(
      `<div class="peak-row">` +
        `<span class="peak-rank">${i + 1}</span>` +
        `<span class="peak-freq">${peak.freq.toFixed(1)} Hz</span>` +
        `<span class="peak-note">${note ? note.name : "--"}</span>` +
        `<span class="peak-mag">${peak.mag.toFixed(0)} dB</span>` +
        `<span class="peak-bar-bg"><span class="peak-bar" style="width:${barPct}%"></span></span>` +
      `</div>`
    );
  }

  peaksList.innerHTML = rows.join("");
}
