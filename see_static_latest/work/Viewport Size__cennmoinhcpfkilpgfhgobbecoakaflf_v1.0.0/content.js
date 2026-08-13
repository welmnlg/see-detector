(() => {
  const INDICATOR_ID = 'viewport-size-indicator';
  const DEFAULTS = { position: 'top-right', theme: 'dark', enabled: true, preset: 'tailwind' };
  const HIDE_DELAY = 2500;

  let settings = { ...DEFAULTS };
  let indicator = null;
  let elW = null;      // width value span
  let elH = null;      // height value span
  let elBadge = null;  // breakpoint badge span
  let elDiv2 = null;   // divider before badge
  let hideTimer = null;
  let lastBreakpoint = null;
  let flashTimer = null;

  const THEMES = {
    dark: {
      background: 'rgba(15, 15, 18, 0.93)',
      color: '#f1f5f9',
      dimColor: 'rgba(241,245,249,0.35)',
      divider: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.97)',
      color: '#0f172a',
      dimColor: 'rgba(15,23,42,0.35)',
      divider: 'rgba(0,0,0,0.1)',
      border: '1px solid rgba(0,0,0,0.12)',
    },
  };

  const POSITIONS = {
    'top-left':     { top: '12px', left: '12px', bottom: 'auto', right: 'auto' },
    'top-right':    { top: '12px', right: '12px', bottom: 'auto', left: 'auto' },
    'bottom-left':  { bottom: '12px', left: '12px', top: 'auto', right: 'auto' },
    'bottom-right': { bottom: '12px', right: '12px', top: 'auto', left: 'auto' },
  };

  // Breakpoints sorted largest → smallest
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

  // Color per breakpoint label
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

  function fmt(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  }

  function getBreakpoint(width) {
    const list = PRESETS[settings.preset] || PRESETS.tailwind;
    return list.find(bp => width >= bp.min) || list[list.length - 1];
  }

  function makeDivider() {
    const el = document.createElement('span');
    const t = THEMES[settings.theme] || THEMES.dark;
    Object.assign(el.style, {
      width: '1px', height: '14px',
      background: t.divider,
      margin: '0 9px', flexShrink: '0', display: 'block',
    });
    return el;
  }

  function makeValueGroup(iconHTML, dimColor) {
    const wrap = document.createElement('span');
    Object.assign(wrap.style, { display: 'flex', alignItems: 'center', gap: '5px' });

    const icon = document.createElement('span');
    Object.assign(icon.style, { display: 'flex', alignItems: 'center', opacity: '0.45', flexShrink: '0' });
    icon.innerHTML = iconHTML;

    const val = document.createElement('span');
    Object.assign(val.style, { fontSize: '13px', fontWeight: '700', letterSpacing: '0.3px' });

    const unit = document.createElement('span');
    Object.assign(unit.style, { fontSize: '10px', fontWeight: '500', color: dimColor, marginLeft: '1px' });
    unit.textContent = 'px';

    wrap.appendChild(icon);
    wrap.appendChild(val);
    wrap.appendChild(unit);
    return { wrap, val, unit };
  }

  function buildStructure() {
    indicator.innerHTML = '';

    const t = THEMES[settings.theme] || THEMES.dark;

    const wGroup = makeValueGroup(ICON_W, t.dimColor);
    const div1 = makeDivider();
    const hGroup = makeValueGroup(ICON_H, t.dimColor);

    elDiv2 = makeDivider();

    elBadge = document.createElement('span');
    Object.assign(elBadge.style, {
      fontSize: '11px', fontWeight: '700',
      padding: '2px 6px', borderRadius: '3px',
      letterSpacing: '0.5px', flexShrink: '0',
      transition: 'background 0.2s ease, color 0.2s ease, transform 0.15s ease',
    });

    indicator.appendChild(wGroup.wrap);
    indicator.appendChild(div1);
    indicator.appendChild(hGroup.wrap);
    indicator.appendChild(elDiv2);
    indicator.appendChild(elBadge);

    elW = wGroup.val;
    elH = hGroup.val;
  }

  function applyBadgeColor(bp, flash) {
    const colors = BP_COLORS[bp.label] || BP_COLORS['XS'];
    elBadge.textContent = bp.label;
    elBadge.style.background = colors.bg;
    elBadge.style.color = colors.color;

    if (flash) {
      clearTimeout(flashTimer);
      elBadge.style.transform = 'scale(1.25)';
      elBadge.style.background = colors.color;
      elBadge.style.color = '#fff';
      flashTimer = setTimeout(() => {
        elBadge.style.transform = 'scale(1)';
        elBadge.style.background = colors.bg;
        elBadge.style.color = colors.color;
      }, 300);
    }
  }

  function updateDividerColors() {
    if (!indicator) return;
    const t = THEMES[settings.theme] || THEMES.dark;
    indicator.querySelectorAll('span[data-div]').forEach(el => {
      el.style.background = t.divider;
    });
  }

  function applyStyles() {
    if (!indicator) return;

    const theme = THEMES[settings.theme] || THEMES.dark;
    const pos = POSITIONS[settings.position] || POSITIONS['top-right'];

    Object.assign(indicator.style, {
      display: settings.enabled ? 'flex' : 'none',
      alignItems: 'center',
      opacity: settings.enabled ? '1' : '0',
      transition: 'opacity 0.25s ease',
      position: 'fixed',
      zIndex: '2147483647',
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
      padding: '10px 13px',
      borderRadius: '4px',
      pointerEvents: 'auto',
      cursor: 'pointer',
      userSelect: 'none',
      boxShadow: 'none',
      whiteSpace: 'nowrap',
      background: theme.background,
      color: theme.color,
      border: theme.border,
      top: pos.top, right: pos.right, bottom: pos.bottom, left: pos.left,
    });
  }

  function updateSize(flash) {
    if (!indicator || !elW || !elH) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    elW.textContent = fmt(w);
    elH.textContent = fmt(h);

    const bp = getBreakpoint(w);
    const bpChanged = lastBreakpoint !== bp.label;
    lastBreakpoint = bp.label;

    applyBadgeColor(bp, flash && bpChanged);
  }

  function showCopied() {
    if (!elBadge) return;
    const prev = elBadge.textContent;
    const prevBg = elBadge.style.background;
    const prevColor = elBadge.style.color;
    elBadge.textContent = 'copied!';
    elBadge.style.background = 'rgba(16,185,129,0.25)';
    elBadge.style.color = '#34d399';
    setTimeout(() => {
      elBadge.textContent = prev;
      elBadge.style.background = prevBg;
      elBadge.style.color = prevColor;
    }, 1200);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for HTTP pages where clipboard API is unavailable
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return Promise.resolve();
  }

  function handleClick() {
    const w = window.innerWidth;
    const text = `@media only screen and (max-width: ${w}px) {`;
    copyToClipboard(text).then(showCopied);
    // Reset hide timer so indicator stays visible after click
    showAndScheduleHide();
  }

  function showAndScheduleHide() {
    if (!indicator || !settings.enabled) return;
    indicator.style.opacity = '1';
    indicator.style.display = 'flex';
    indicator.style.pointerEvents = 'auto';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
    }, HIDE_DELAY);
  }

  function init() {
    const old = document.getElementById(INDICATOR_ID);
    if (old) old.remove();

    indicator = document.createElement('div');
    indicator.id = INDICATOR_ID;

    applyStyles();
    buildStructure();
    updateSize(false);
    indicator.style.opacity = '0'; // hidden on load
    indicator.style.pointerEvents = 'none';
    indicator.addEventListener('click', handleClick);

    const target = document.body || document.documentElement;
    target.appendChild(indicator);
  }

  function loadSettings() {
    chrome.storage.sync.get(DEFAULTS, (stored) => {
      if (chrome.runtime.lastError) return;
      settings = { ...DEFAULTS, ...stored };
      if (!indicator) {
        init();
      } else {
        applyStyles();
        buildStructure();
        updateSize(false);
      }
    });
  }

  window.addEventListener('resize', () => {
    updateSize(true);
    showAndScheduleHide();
  });

  chrome.storage.onChanged.addListener((changes) => {
    for (const key in changes) {
      if (key in DEFAULTS) settings[key] = changes[key].newValue;
    }
    applyStyles();
    buildStructure();
    updateSize(false);
  });

  if (document.body) {
    loadSettings();
  } else {
    document.addEventListener('DOMContentLoaded', loadSettings);
  }
})();
