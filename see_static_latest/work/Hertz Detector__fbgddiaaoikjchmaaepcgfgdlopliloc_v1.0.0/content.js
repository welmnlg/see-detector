// Hertz Detector - Content Script
// Hooks into <audio> and <video> elements on the page to analyze frequency.
// The audio graph (context, analyser, sources) is created once and reused.
// start/stop only toggles the detection interval.

let audioContext = null;
let analyser = null;
let intervalId = null;
let observer = null;
let connectedElements = new WeakSet();
let isRunning = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "start-detecting") {
    start();
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "stop-detecting") {
    stop();
    sendResponse({ ok: true });
    return false;
  }
});

function ensureAudioGraph() {
  if (!audioContext) {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.8;
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function start() {
  // If already running, just ensure the graph is good
  if (isRunning) return;
  isRunning = true;

  ensureAudioGraph();
  connectMediaElements();
  observeDOM();

  intervalId = setInterval(detectAndSend, 100);
}

function stop() {
  isRunning = false;

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Keep audioContext and analyser alive — sources are permanently bound
  // to them, and recreating would break everything.
}

function connectMediaElements() {
  const elements = document.querySelectorAll("video, audio");
  elements.forEach(connectElement);
}

function connectElement(el) {
  if (connectedElements.has(el)) return;
  if (!audioContext || !analyser) return;

  try {
    const source = audioContext.createMediaElementSource(el);
    source.connect(analyser);
    source.connect(audioContext.destination);
    connectedElements.add(el);
  } catch (e) {
    // Already connected to another context, or CORS issue — skip
  }
}

function observeDOM() {
  if (observer) return;

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === "VIDEO" || node.nodeName === "AUDIO") {
          connectElement(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll("video, audio").forEach(connectElement);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function detectAndSend() {
  // Extension context can be invalidated if the extension is reloaded/updated
  // while this interval is still running. Detect and bail cleanly.
  if (!chrome.runtime?.id) {
    stop();
    return;
  }

  if (!analyser) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatFrequencyData(dataArray);

  const sampleRate = audioContext.sampleRate;
  const peaks = findTopPeaks(dataArray, sampleRate, 5);
  const spectrum = downsampleSpectrum(dataArray, sampleRate, 256);
  const frequency = peaks.length > 0 ? peaks[0].freq : 0;

  chrome.runtime.sendMessage({
    type: "frequency-update",
    frequency,
    peaks,
    spectrum,
  }).catch(() => {});
}

function findTopPeaks(frequencyData, sampleRate, count = 5) {
  const binCount = frequencyData.length;
  const nyquist = sampleRate / 2;
  const binWidth = nyquist / binCount;
  const minBin = Math.floor(20 / binWidth);
  const maxBin = Math.min(Math.ceil(5000 / binWidth), binCount - 1);

  const peaks = [];

  for (let i = minBin + 1; i < maxBin; i++) {
    if (
      frequencyData[i] > frequencyData[i - 1] &&
      frequencyData[i] > frequencyData[i + 1] &&
      frequencyData[i] > -70
    ) {
      const alpha = frequencyData[i - 1];
      const beta = frequencyData[i];
      const gamma = frequencyData[i + 1];
      const denom = alpha - 2 * beta + gamma;
      let freq;
      if (denom !== 0) {
        const correction = 0.5 * (alpha - gamma) / denom;
        freq = (i + correction) * binWidth;
      } else {
        freq = i * binWidth;
      }
      peaks.push({
        freq: Math.round(freq * 10) / 10,
        mag: Math.round(beta * 10) / 10,
      });
    }
  }

  peaks.sort((a, b) => b.mag - a.mag);
  return peaks.slice(0, count);
}

function downsampleSpectrum(frequencyData, sampleRate, outputSize = 256) {
  const binCount = frequencyData.length;
  const nyquist = sampleRate / 2;
  const binWidth = nyquist / binCount;
  const minBin = Math.floor(20 / binWidth);
  const maxBin = Math.min(Math.ceil(5000 / binWidth), binCount - 1);
  const sourceRange = maxBin - minBin;
  const result = new Array(outputSize);

  for (let i = 0; i < outputSize; i++) {
    const startBin = minBin + Math.floor((i * sourceRange) / outputSize);
    const endBin = minBin + Math.floor(((i + 1) * sourceRange) / outputSize);
    let max = -Infinity;
    for (let j = startBin; j < endBin; j++) {
      if (frequencyData[j] > max) max = frequencyData[j];
    }
    result[i] = Math.round(max * 10) / 10;
  }
  return result;
}
