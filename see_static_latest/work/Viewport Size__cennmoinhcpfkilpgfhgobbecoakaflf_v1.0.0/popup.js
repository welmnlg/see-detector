const DEFAULTS = { position: 'top-right', theme: 'dark', enabled: true, preset: 'tailwind' };

let current = { ...DEFAULTS };

const PRESETS = {
  tailwind: [
    { label: '2XL', min: 1536 },
    { label: 'XL',  min: 1280 },
    { label: 'LG',  min: 1024 },
    { label: 'MD',  min: 768  },
    { label: 'SM',  min: 640  },
    { label: 'XS',  min: 0    },
  ],
  bootstrap: [
    { label: 'XXL', min: 1400 },
    { label: 'XL',  min: 1200 },
    { label: 'LG',  min: 992  },
    { label: 'MD',  min: 768  },
    { label: 'SM',  min: 576  },
    { label: 'XS',  min: 0    },
  ],
};

const BP_COLORS = {
  'XS':  { bg: 'rgba(100,116,139,0.2)',  color: '#94a3b8' },
  'SM':  { bg: 'rgba(59,130,246,0.18)',  color: '#60a5fa' },
  'MD':  { bg: 'rgba(16,185,129,0.18)',  color: '#34d399' },
  'LG':  { bg: 'rgba(245,158,11,0.18)',  color: '#fbbf24' },
  'XL':  { bg: 'rgba(139,92,246,0.18)',  color: '#a78bfa' },
  '2XL': { bg: 'rgba(236,72,153,0.18)',  color: '#f472b6' },
  'XXL': { bg: 'rgba(236,72,153,0.18)',  color: '#f472b6' },
};

const ICON_W = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
  <path d="M1 6.5H12M1 6.5L3.5 4M1 6.5L3.5 9M12 6.5L9.5 4M12 6.5L9.5 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ICON_H = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
  <path d="M6.5 1V12M6.5 1L4 3.5M6.5 1L9 3.5M6.5 12L4 9.5M6.5 12L9 9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const DIM = { dark: 'rgba(241,245,249,0.35)', light: 'rgba(15,23,42,0.35)' };
const DIV = { dark: 'rgba(255,255,255,0.1)',  light: 'rgba(0,0,0,0.1)' };

function fmt(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
}

function getBreakpoint(width, preset) {
  const list = PRESETS[preset] || PRESETS.tailwind;
  return list.find(bp => width >= bp.min) || list[list.length - 1];
}

function buildPreviewHTML(w, h, theme, preset) {
  const dim = DIM[theme] || DIM.dark;
  const div = DIV[theme] || DIV.dark;
  const bp = getBreakpoint(w, preset);
  const bpc = BP_COLORS[bp.label] || BP_COLORS['XS'];

  return `
    <span style="display:flex;align-items:center;gap:5px">
      <span style="display:flex;align-items:center;opacity:0.45">${ICON_W}</span>
      <span>${fmt(w)}</span>
      <span style="font-size:10px;font-weight:500;color:${dim};margin-left:1px">px</span>
    </span>
    <span style="width:1px;height:14px;background:${div};margin:0 9px;flex-shrink:0;display:block"></span>
    <span style="display:flex;align-items:center;gap:5px">
      <span style="display:flex;align-items:center;opacity:0.45">${ICON_H}</span>
      <span>${fmt(h)}</span>
      <span style="font-size:10px;font-weight:500;color:${dim};margin-left:1px">px</span>
    </span>
    <span style="width:1px;height:14px;background:${div};margin:0 9px;flex-shrink:0;display:block"></span>
    <span style="font-size:11px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:0.5px;background:${bpc.bg};color:${bpc.color}">${bp.label}</span>`;
}

function renderBpList() {
  const list = PRESETS[current.preset] || PRESETS.tailwind;
  const container = document.getElementById('bp-list');
  container.innerHTML = list.map(bp => {
    const c = BP_COLORS[bp.label] || BP_COLORS['XS'];
    return `<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:3px;background:${c.bg};color:${c.color};letter-spacing:0.4px">${bp.label} <span style="font-weight:400;opacity:0.7">${bp.min > 0 ? '≥' + bp.min : '&lt;' + (list[list.indexOf(list.find(b=>b.label===bp.label))-1]?.min || 640)}</span></span>`;
  }).join('');
}

function saveSettings() {
  chrome.storage.sync.set(current);
}

function updateUI() {
  document.getElementById('enabled-toggle').checked = current.enabled;

  document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.position === current.position);
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme) btn.classList.toggle('active', btn.dataset.theme === current.theme);
    if (btn.dataset.preset) btn.classList.toggle('active', btn.dataset.preset === current.preset);
  });

  renderBpList();

  const preview = document.getElementById('preview');
  preview.className = `preview-indicator theme-${current.theme}`;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => ({ w: window.innerWidth, h: window.innerHeight })
    }, (results) => {
      const w = results?.[0]?.result?.w ?? 1440;
      const h = results?.[0]?.result?.h ?? 900;
      preview.innerHTML = buildPreviewHTML(w, h, current.theme, current.preset);
    });
  });
}

// Resize window
document.querySelectorAll('.resize-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.width;

    // Highlight active
    document.querySelectorAll('.resize-btn').forEach(b => b.classList.remove('active-resize'));
    btn.classList.add('active-resize');

    chrome.windows.getCurrent(win => {
      if (val === 'full') {
        chrome.windows.update(win.id, { state: 'maximized' });
      } else {
        const targetWidth = parseInt(val);
        // Keep current height, only change width
        // state must be 'normal' to allow manual sizing
        chrome.windows.update(win.id, { state: 'normal' }, () => {
          chrome.windows.update(win.id, { width: targetWidth });
        });
      }
    });
  });
});

chrome.storage.sync.get(DEFAULTS, (stored) => {
  current = { ...DEFAULTS, ...stored };
  updateUI();
});

document.getElementById('enabled-toggle').addEventListener('change', (e) => {
  current.enabled = e.target.checked;
  saveSettings();
  updateUI();
});

document.querySelectorAll('.pos-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    current.position = btn.dataset.position;
    saveSettings();
    updateUI();
  });
});

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.theme) current.theme = btn.dataset.theme;
    if (btn.dataset.preset) current.preset = btn.dataset.preset;
    saveSettings();
    updateUI();
  });
});
