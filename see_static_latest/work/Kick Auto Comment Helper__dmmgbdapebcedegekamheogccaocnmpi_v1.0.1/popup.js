const toggleBtn = document.getElementById("toggle");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");
const commentsEl = document.getElementById("commentsText");
const intervalEl = document.getElementById("intervalMs");
const themeToggle = document.getElementById("themeToggle");
const app = document.getElementById("app");

function setStatus(text) {
  statusEl.textContent = text || "";
  if (text) setTimeout(() => (statusEl.textContent = ""), 1200);
}

async function rpc(message) {
  return await chrome.runtime.sendMessage(message);
}

/* ===== テーマ ===== */
function applyTheme(theme) {
  const dark = theme === "dark";

  document.body.style.background = dark ? "#0b0b0f" : "#ffffff";
  app.style.background = dark ? "#0b0b0f" : "#ffffff";
  app.style.color = dark ? "#e5e7eb" : "#111827";

  const border = dark ? "#2b2f3a" : "#d1d5db";
  const fieldBg = dark ? "#121826" : "#ffffff";
  const fieldText = dark ? "#e5e7eb" : "#111827";

  for (const el of [intervalEl, commentsEl]) {
    el.style.borderColor = border;
    el.style.background = fieldBg;
    el.style.color = fieldText;
  }

  saveBtn.style.border = `1px solid ${border}`;
  saveBtn.style.background = dark ? "#111827" : "#f3f4f6";
  saveBtn.style.color = dark ? "#e5e7eb" : "#111827";

  themeToggle.checked = dark;
}

function applyToggleButtonStyle({ running }) {
  // ユーザーの希望：止まってるとき緑／動いてるとき赤
  if (running) {
    toggleBtn.textContent = "Stop";
    toggleBtn.style.background = "#ef4444"; // 赤
    toggleBtn.style.color = "#0b0b0f";
    toggleBtn.style.border = "none";
  } else {
    toggleBtn.textContent = "Start";
    toggleBtn.style.background = "#22c55e"; // 緑
    toggleBtn.style.color = "#0b0b0f";
    toggleBtn.style.border = "none";
  }

  toggleBtn.style.borderRadius = "12px";
  toggleBtn.style.fontWeight = "700";
  toggleBtn.style.padding = "10px 18px";
  toggleBtn.style.cursor = "pointer";
}

async function getTheme() {
  const res = await chrome.storage.local.get({ theme: "dark" });
  return res.theme === "light" ? "light" : "dark";
}

async function setTheme(theme) {
  await chrome.storage.local.set({ theme });
}

/* ===== 初期表示 ===== */
async function refresh() {
  const theme = await getTheme();
  applyTheme(theme);

  const res = await rpc({ type: "GET_STATE" });
  if (!res?.ok) return;

  const s = res.state;
  commentsEl.value = (s.comments || []).join("\n");
  intervalEl.value = s.intervalMs ?? 2000;

  applyToggleButtonStyle({ running: !!s.running });
}

/* ===== イベント ===== */
toggleBtn.addEventListener("click", async () => {
  await rpc({ type: "TOGGLE" });
  await refresh();
});

saveBtn.addEventListener("click", async () => {
  const patch = {
    commentsText: commentsEl.value || "",
    intervalMs: Number(intervalEl.value) || 2000
  };
  const res = await rpc({ type: "SET_SETTINGS", patch });
  setStatus(res?.ok ? "保存した" : "保存失敗");
  await refresh();
});

themeToggle.addEventListener("change", async () => {
  const theme = themeToggle.checked ? "dark" : "light";
  await setTheme(theme);
  await refresh();
});

refresh();
