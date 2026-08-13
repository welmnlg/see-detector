(() => {
  // Prevent double injection
  if (window.__uiuxCheckerLoaded) return;
  window.__uiuxCheckerLoaded = true;

  // ─── State ────────────────────────────────────────────────
  let panelVisible = false;
  let activeTab = 'spacing';
  let gridOverlayActive = false;
  let highlightOverlays = [];

  // ─── Message listener (toggle from icon click) ─────────────
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'toggle_panel') {
      togglePanel();
      sendResponse({ ok: true });
    }
  });

  // ─── Build Panel ──────────────────────────────────────────
  function buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'uiux-panel';
    panel.innerHTML = `
      <div class="uiux-header">
        <div class="uiux-logo">
          <span class="uiux-logo-icon">✦</span>
          <span>UI/UX Checker</span>
        </div>
        <button class="uiux-close" id="uiux-close">✕</button>
      </div>

      <div class="uiux-tabs">
        <button class="uiux-tab active" data-tab="spacing">
          <span>⊞</span> Spacing
        </button>
        <button class="uiux-tab" data-tab="typography">
          <span>T</span> Typography
        </button>
        <button class="uiux-tab" data-tab="contrast">
          <span>◑</span> Contrast
        </button>
      </div>

      <div class="uiux-body" id="uiux-body">
        <!-- Content injected per tab -->
      </div>
    `;
    document.body.appendChild(panel);

    // Events
    document.getElementById('uiux-close').addEventListener('click', hidePanel);
    panel.querySelectorAll('.uiux-tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    return panel;
  }

  function togglePanel() {
    const existing = document.getElementById('uiux-panel');
    if (!existing) {
      buildPanel();
      showPanel();
    } else {
      panelVisible ? hidePanel() : showPanel();
    }
  }

  function showPanel() {
    const panel = document.getElementById('uiux-panel');
    if (!panel) return;
    panel.classList.add('visible');
    panelVisible = true;
    switchTab(activeTab);
  }

  function hidePanel() {
    const panel = document.getElementById('uiux-panel');
    if (panel) panel.classList.remove('visible');
    panelVisible = false;
    clearHighlights();
    removeGridOverlay();
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.uiux-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    clearHighlights();
    removeGridOverlay();
    const body = document.getElementById('uiux-body');
    if (!body) return;

    if (tab === 'spacing') renderSpacingTab(body);
    else if (tab === 'typography') renderTypographyTab(body);
    else if (tab === 'contrast') renderContrastTab(body);
  }

  // ─────────────────────────────────────────────────────────
  //  TAB 1: SPACING
  // ─────────────────────────────────────────────────────────
  function renderSpacingTab(body) {
    body.innerHTML = `
      <div class="uiux-section">
        <p class="uiux-desc">Overlay an 8pt grid and scan for spacing inconsistencies.</p>
        <div class="uiux-toggle-row">
          <span>8pt Grid Overlay</span>
          <button class="uiux-btn-pill" id="grid-toggle">Show Grid</button>
        </div>
      </div>
      <div class="uiux-divider"></div>
      <div class="uiux-section">
        <div class="uiux-section-title">Spacing Scan</div>
        <button class="uiux-btn-primary" id="run-spacing">Run Spacing Audit</button>
        <div id="spacing-results" class="uiux-results"></div>
      </div>
    `;

    document.getElementById('grid-toggle').addEventListener('click', () => {
      gridOverlayActive ? removeGridOverlay() : addGridOverlay();
      document.getElementById('grid-toggle').textContent = gridOverlayActive ? 'Hide Grid' : 'Show Grid';
    });

    document.getElementById('run-spacing').addEventListener('click', runSpacingAudit);
  }

  function addGridOverlay() {
    removeGridOverlay();
    const canvas = document.createElement('canvas');
    canvas.id = 'uiux-grid-canvas';
    canvas.width = document.documentElement.scrollWidth;
    canvas.height = document.documentElement.scrollHeight;
    Object.assign(canvas.style, {
      position: 'absolute', top: '0', left: '0',
      zIndex: '999990', pointerEvents: 'none',
      opacity: '0.35'
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const UNIT = 8;
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += UNIT) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += UNIT) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
      if (y % 64 === 0) { ctx.strokeStyle = '#7C3AED'; ctx.lineWidth = 1; }
      else { ctx.strokeStyle = '#7C3AED'; ctx.lineWidth = 0.3; }
      ctx.stroke();
    }
    gridOverlayActive = true;
  }

  function removeGridOverlay() {
    const c = document.getElementById('uiux-grid-canvas');
    if (c) c.remove();
    gridOverlayActive = false;
    const btn = document.getElementById('grid-toggle');
    if (btn) btn.textContent = 'Show Grid';
  }

  function runSpacingAudit() {
    clearHighlights();
    const results = document.getElementById('spacing-results');
    results.innerHTML = '<div class="uiux-loading">Scanning…</div>';

    setTimeout(() => {
      const issues = [];
      const elements = document.querySelectorAll('*:not(#uiux-panel):not(#uiux-panel *)');

      elements.forEach(el => {
        if (el.id === 'uiux-grid-canvas') return;
        const cs = window.getComputedStyle(el);
        const props = ['paddingTop','paddingBottom','paddingLeft','paddingRight','marginTop','marginBottom','marginLeft','marginRight'];
        props.forEach(p => {
          const val = parseFloat(cs[p]);
          if (val > 0 && val % 8 !== 0 && val % 4 !== 0) {
            issues.push({ el, label: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')||'(no class)'}`, prop: p, val: Math.round(val) });
          }
        });
      });

      if (issues.length === 0) {
        results.innerHTML = `<div class="uiux-pass">✓ All spacing values align to 4pt/8pt grid</div>`;
        return;
      }

      const unique = issues.slice(0, 20);
      results.innerHTML = `
        <div class="uiux-issue-count">${issues.length} issue${issues.length !== 1 ? 's' : ''} found</div>
        ${unique.map((issue, i) => `
          <div class="uiux-issue-card" data-index="${i}">
            <div class="uiux-issue-tag">${issue.prop}</div>
            <div class="uiux-issue-label">${issue.label.slice(0,40)}</div>
            <div class="uiux-issue-detail">Value: <strong>${issue.val}px</strong> — not on 4pt/8pt grid</div>
          </div>
        `).join('')}
        ${issues.length > 20 ? `<div class="uiux-more">+${issues.length - 20} more issues…</div>` : ''}
      `;

      unique.forEach((issue, i) => {
        const card = results.querySelector(`[data-index="${i}"]`);
        card.addEventListener('mouseenter', () => highlightElement(issue.el, '#F59E0B'));
        card.addEventListener('mouseleave', clearHighlights);
      });
    }, 100);
  }

  // ─────────────────────────────────────────────────────────
  //  TAB 2: TYPOGRAPHY
  // ─────────────────────────────────────────────────────────
  function renderTypographyTab(body) {
    body.innerHTML = `
      <div class="uiux-section">
        <p class="uiux-desc">Audit all font sizes, weights, and families used on this page.</p>
        <button class="uiux-btn-primary" id="run-typography">Run Typography Audit</button>
        <div id="typo-results" class="uiux-results"></div>
      </div>
    `;
    document.getElementById('run-typography').addEventListener('click', runTypographyAudit);
  }

  function runTypographyAudit() {
    clearHighlights();
    const results = document.getElementById('typo-results');
    results.innerHTML = '<div class="uiux-loading">Scanning…</div>';

    setTimeout(() => {
      const fontMap = {};
      const sizeSet = new Set();
      const weightSet = new Set();
      const familySet = new Set();
      const issues = [];

      const els = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, label, button, td, th, div');
      els.forEach(el => {
        if (el.closest('#uiux-panel')) return;
        const cs = window.getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        const weight = cs.fontWeight;
        const family = cs.fontFamily.split(',')[0].replace(/['"]/g,'').trim();
        const lineH = cs.lineHeight;

        sizeSet.add(size);
        weightSet.add(weight);
        familySet.add(family);

        const key = `${family}|${size}|${weight}`;
        if (!fontMap[key]) fontMap[key] = { family, size, weight, lineH, count: 0, sample: el };
        fontMap[key].count++;

        if (size < 12) issues.push({ el, msg: `Text too small: ${size}px`, type: 'small' });
      });

      const combos = Object.values(fontMap).sort((a, b) => b.count - a.count);
      const tooManySizes = sizeSet.size > 6;
      const tooManyFamilies = familySet.size > 3;

      results.innerHTML = `
        <div class="uiux-stats-row">
          <div class="uiux-stat ${tooManySizes ? 'warn' : 'ok'}">
            <div class="uiux-stat-num">${sizeSet.size}</div>
            <div class="uiux-stat-label">Font Sizes</div>
            ${tooManySizes ? '<div class="uiux-stat-note">⚠ Too many</div>' : '<div class="uiux-stat-note ok">✓ Good</div>'}
          </div>
          <div class="uiux-stat ${tooManyFamilies ? 'warn' : 'ok'}">
            <div class="uiux-stat-num">${familySet.size}</div>
            <div class="uiux-stat-label">Font Families</div>
            ${tooManyFamilies ? '<div class="uiux-stat-note">⚠ Too many</div>' : '<div class="uiux-stat-note ok">✓ Good</div>'}
          </div>
          <div class="uiux-stat">
            <div class="uiux-stat-num">${weightSet.size}</div>
            <div class="uiux-stat-label">Font Weights</div>
            <div class="uiux-stat-note ok">ⓘ In use</div>
          </div>
        </div>

        ${issues.length > 0 ? `
          <div class="uiux-section-title" style="margin-top:12px">⚠ Issues (${issues.length})</div>
          ${issues.slice(0,10).map((issue, i) => `
            <div class="uiux-issue-card warn-card" data-tindex="${i}">
              <div class="uiux-issue-detail">${issue.msg}</div>
            </div>
          `).join('')}
        ` : '<div class="uiux-pass" style="margin:10px 0">✓ No critical typography issues</div>'}

        <div class="uiux-section-title" style="margin-top:14px">All Type Styles (${combos.length})</div>
        ${combos.slice(0,15).map((c, i) => `
          <div class="uiux-typo-card" data-ti="${i}">
            <div class="uiux-typo-preview" style="font-family:${c.family};font-size:${Math.min(c.size,18)}px;font-weight:${c.weight}">Aa</div>
            <div class="uiux-typo-info">
              <div class="uiux-typo-family">${c.family}</div>
              <div class="uiux-typo-meta">${c.size}px · ${c.weight} · ${c.lineH}</div>
            </div>
            <div class="uiux-typo-count">${c.count}×</div>
          </div>
        `).join('')}
        ${combos.length > 15 ? `<div class="uiux-more">+${combos.length - 15} more styles</div>` : ''}
      `;

      issues.slice(0, 10).forEach((issue, i) => {
        const card = results.querySelector(`[data-tindex="${i}"]`);
        if (card) {
          card.addEventListener('mouseenter', () => highlightElement(issue.el, '#EF4444'));
          card.addEventListener('mouseleave', clearHighlights);
        }
      });

      combos.slice(0, 15).forEach((c, i) => {
        const card = results.querySelector(`[data-ti="${i}"]`);
        if (card) {
          card.addEventListener('mouseenter', () => highlightElement(c.sample, '#3B82F6'));
          card.addEventListener('mouseleave', clearHighlights);
        }
      });
    }, 100);
  }

  // ─────────────────────────────────────────────────────────
  //  TAB 3: CONTRAST
  // ─────────────────────────────────────────────────────────
  function renderContrastTab(body) {
    body.innerHTML = `
      <div class="uiux-section">
        <p class="uiux-desc">Check text contrast ratios against WCAG 2.1 AA standards (4.5:1 normal, 3:1 large).</p>
        <button class="uiux-btn-primary" id="run-contrast">Run Contrast Audit</button>
        <div id="contrast-results" class="uiux-results"></div>
      </div>
    `;
    document.getElementById('run-contrast').addEventListener('click', runContrastAudit);
  }

  function parseColor(str) {
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
  }

  function luminance({ r, g, b }) {
    const [R, G, B] = [r, g, b].map(c => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  function contrastRatio(c1, c2) {
    const L1 = Math.max(luminance(c1), luminance(c2));
    const L2 = Math.min(luminance(c1), luminance(c2));
    return (L1 + 0.05) / (L2 + 0.05);
  }

  function runContrastAudit() {
    clearHighlights();
    const results = document.getElementById('contrast-results');
    results.innerHTML = '<div class="uiux-loading">Scanning…</div>';

    setTimeout(() => {
      const issues = [];
      const passes = [];
      const els = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, label, button, td, th');

      els.forEach(el => {
        if (el.closest('#uiux-panel')) return;
        const cs = window.getComputedStyle(el);
        const fg = parseColor(cs.color);
        const bg = parseColor(cs.backgroundColor);
        if (!fg || !bg || bg.r === 0 && bg.g === 0 && bg.b === 0 && cs.backgroundColor === 'rgba(0, 0, 0, 0)') return;
        if (bg.r === 0 && bg.g === 0 && bg.b === 0) return;

        const ratio = contrastRatio(fg, bg);
        const fontSize = parseFloat(cs.fontSize);
        const fontWeight = parseInt(cs.fontWeight);
        const isLarge = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
        const required = isLarge ? 3 : 4.5;
        const passes_wcag = ratio >= required;
        const ratioStr = ratio.toFixed(2);
        const tag = el.tagName.toLowerCase();
        const text = el.textContent.trim().slice(0, 30) || '(no text)';
        const entry = { el, ratio: ratioStr, required, passes_wcag, text, fg, bg, tag };

        if (!passes_wcag) issues.push(entry);
        else passes.push(entry);
      });

      const passCount = passes.length;
      const failCount = issues.length;
      const score = passCount + failCount > 0 ? Math.round((passCount / (passCount + failCount)) * 100) : 100;

      results.innerHTML = `
        <div class="uiux-score-ring ${score >= 80 ? 'good' : score >= 50 ? 'warn' : 'bad'}">
          <div class="uiux-score-num">${score}%</div>
          <div class="uiux-score-label">WCAG AA</div>
        </div>
        <div class="uiux-stats-row" style="margin-top:12px">
          <div class="uiux-stat ok">
            <div class="uiux-stat-num">${passCount}</div>
            <div class="uiux-stat-label">Passing</div>
          </div>
          <div class="uiux-stat ${failCount > 0 ? 'warn' : 'ok'}">
            <div class="uiux-stat-num">${failCount}</div>
            <div class="uiux-stat-label">Failing</div>
          </div>
        </div>

        ${issues.length > 0 ? `
          <div class="uiux-section-title" style="margin-top:14px">⚠ Failing Elements</div>
          ${issues.slice(0, 15).map((item, i) => `
            <div class="uiux-contrast-card fail" data-ci="${i}">
              <div class="uiux-contrast-swatches">
                <div class="uiux-swatch" style="background:rgb(${item.fg.r},${item.fg.g},${item.fg.b})"></div>
                <span class="uiux-swatch-sep">on</span>
                <div class="uiux-swatch" style="background:rgb(${item.bg.r},${item.bg.g},${item.bg.b})"></div>
              </div>
              <div class="uiux-contrast-info">
                <div class="uiux-contrast-ratio fail-text">${item.ratio}:1 <span class="uiux-req">(need ${item.required}:1)</span></div>
                <div class="uiux-contrast-text">"${item.text}"</div>
              </div>
            </div>
          `).join('')}
          ${issues.length > 15 ? `<div class="uiux-more">+${issues.length - 15} more issues</div>` : ''}
        ` : '<div class="uiux-pass" style="margin:10px 0">✓ All text passes WCAG AA contrast</div>'}
      `;

      issues.slice(0, 15).forEach((item, i) => {
        const card = results.querySelector(`[data-ci="${i}"]`);
        if (card) {
          card.addEventListener('mouseenter', () => highlightElement(item.el, '#EF4444'));
          card.addEventListener('mouseleave', clearHighlights);
        }
      });
    }, 200);
  }

  // ─────────────────────────────────────────────────────────
  //  HIGHLIGHT HELPERS
  // ─────────────────────────────────────────────────────────
  function highlightElement(el, color) {
    clearHighlights();
    const rect = el.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'uiux-highlight';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      border: `2px solid ${color}`,
      background: `${color}22`,
      zIndex: '999989',
      pointerEvents: 'none',
      boxSizing: 'border-box',
      borderRadius: '2px'
    });
    document.body.appendChild(overlay);
    highlightOverlays.push(overlay);
  }

  function clearHighlights() {
    highlightOverlays.forEach(o => o.remove());
    highlightOverlays = [];
  }

  // Auto-init: build panel but keep hidden
  buildPanel();
})();
