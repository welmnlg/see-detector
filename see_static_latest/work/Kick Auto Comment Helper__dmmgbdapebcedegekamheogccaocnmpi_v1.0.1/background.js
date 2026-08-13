const DEFAULTS = {
  running: false,
  comments: ["ずいえきは中国の忌み子", "🤓おっしゃ　🤓いこか　🤓よっしゃ　🤓よっしゃ　🤓いこう　🤓よっしゃ　🤓よっしゃ　🤓いこう　🤓おいしょ　🤓いこかー 🤓いこう　🤓よっしゃ　🤓よいしょ　🤓よしいくわー　🤓ちょっとまってジュース買ってくるわ　🤓よいしょー　🤓おーし　🤓ふぅ～　🤓よしゃ　🤓寝てないよ全然　🤓昨日の夜から寝てない　🤓やっぱ終わるわ", "3時応援団いくぞおおおおおおtン tン tン ハイ tン tン tン ソレ tン tン tン tン tン ポコ tﾝ", "ボッキ音頭だ🤓👏ボッキ音頭だ🤓👏ボッキ🤓👏ボ〜ッキ🤓👏ボッキ🤓👏ボッキ🤓👏ボッキ🤓👏ボッキ🤓👏ボッキ音頭だよ〜ボッキ音頭だ🤓👏ボッキ音頭だ🤓👏ボッキ🤓👏ボ〜ッキ🤓👏ボッキ🤓👏ボッキ🤓👏ボッキ🤓👏ボッキ🤓👏ボッキ音頭だよ〜ボッキ音頭だ🤓👏ボッキ音頭だ🤓👏ボッキ🤓👏ボ〜ッキ🤓👏"],
  index: 0,
  intervalMs: 2000
};

let timerId = null;

async function getState() {
  const data = await chrome.storage.local.get(DEFAULTS);

  if (!Array.isArray(data.comments) || data.comments.length === 0) {
    data.comments = DEFAULTS.comments.slice();
  }
  if (typeof data.index !== "number") data.index = 0;

  const interval = Number(data.intervalMs);
  data.intervalMs = Number.isFinite(interval) ? Math.max(200, interval) : DEFAULTS.intervalMs;

  return data;
}

async function setState(patch) {
  await chrome.storage.local.set(patch);
}

async function getActiveKickTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;
  if (!tab.url?.startsWith("https://kick.com/")) return null;
  return tab;
}

function sendToTab(tabId, payload) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, payload, (resp) => {
      resolve({ resp, lastError: chrome.runtime.lastError?.message || null });
    });
  });
}

async function tick() {
  const state = await getState();
  if (!state.running) return;

  const tab = await getActiveKickTab();
  if (tab?.id) {
    const text = state.comments[state.index % state.comments.length];
    const nextIndex = (state.index + 1) % state.comments.length;

    await setState({ index: nextIndex });
    await sendToTab(tab.id, { type: "SEND_CHAT", text });
  }

  clearTimeout(timerId);
  timerId = setTimeout(tick, state.intervalMs);
}

async function start() {
  await setState({ running: true });
  clearTimeout(timerId);
  timerId = setTimeout(tick, 200);
}

async function stop() {
  await setState({ running: false });
  clearTimeout(timerId);
  timerId = null;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg?.type === "GET_STATE") {
      const state = await getState();
      sendResponse({ ok: true, state });
      return;
    }

    if (msg?.type === "TOGGLE") {
      const state = await getState();
      if (state.running) await stop();
      else await start();
      sendResponse({ ok: true });
      return;
    }

    if (msg?.type === "SET_SETTINGS") {
      const patch = msg.patch || {};

      if (typeof patch.commentsText === "string") {
        const lines = patch.commentsText
          .split(/\r?\n/)
          .map(s => s.trim())
          .filter(Boolean);

        await setState({
          comments: lines.length ? lines : DEFAULTS.comments.slice(),
          index: 0
        });
      }

      if (patch.intervalMs !== undefined) {
        const n = Number(patch.intervalMs);
        const intervalMs = Number.isFinite(n) ? Math.max(200, n) : DEFAULTS.intervalMs;
        await setState({ intervalMs });
      }

      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false });
  })();

  return true;
});
