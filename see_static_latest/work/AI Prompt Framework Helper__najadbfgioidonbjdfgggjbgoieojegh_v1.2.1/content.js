// ─── Framework definitions ────────────────────────────────────────────────────

const FRAMEWORKS = {
  APE: {
    label: 'APE',
    fullName: 'Action · Purpose · Expectation',
    color: '#10b981',
    tip: 'Fastest framework. Ideal for focused, well-defined tasks.',
    icon: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/>`,
    fields: [
      {
        id: 'action',
        letter: 'A',
        label: 'Action',
        hint: 'What should the AI do?',
        placeholder: 'e.g. Write a competitive analysis of the top 5 project management tools',
        type: 'textarea',
        required: true,
      },
      {
        id: 'purpose',
        letter: 'P',
        label: 'Purpose',
        hint: 'Why? What problem does it solve?',
        placeholder: 'e.g. Help our team decide which tool to adopt before Q3 planning',
        type: 'textarea',
        required: true,
      },
      {
        id: 'expectation',
        letter: 'E',
        label: 'Expectation',
        hint: 'What does a great output look like? Format, length, what to avoid.',
        placeholder: 'e.g. Comparison table + final recommendation, max 2 pages, no fluff',
        type: 'textarea',
        required: true,
      },
    ],
    build: (f) => [
      `A – Action: ${f.action}`,
      `P – Purpose: ${f.purpose}`,
      `E – Expectation: ${f.expectation}`,
    ].filter(l => l.split(': ')[1]).join('\n\n'),
  },

  COSTAR: {
    label: 'CO-STAR',
    fullName: 'Context · Objective · Style · Tone · Audience · Response',
    color: '#3b82f6',
    tip: 'Best for communication tasks: copy, emails, content, presentations.',
    icon: `<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
    fields: [
      {
        id: 'context',
        letter: 'C',
        label: 'Context',
        hint: "What's the background or situation?",
        placeholder: "e.g. We're launching a B2B SaaS product in a competitive market",
        type: 'textarea',
        required: true,
      },
      {
        id: 'objective',
        letter: 'O',
        label: 'Objective',
        hint: 'What outcome do you want to achieve?',
        placeholder: 'e.g. Write a landing page that converts visitors into trial sign-ups',
        type: 'textarea',
        required: true,
      },
      {
        id: 'style',
        letter: 'S',
        label: 'Style',
        hint: 'Writing style — how it should be written.',
        placeholder: 'e.g. Conversational, clear, startup-like — similar to Notion or Linear',
        type: 'input',
        required: false,
      },
      {
        id: 'tone',
        letter: 'T',
        label: 'Tone',
        hint: 'Emotional tone — the feeling behind the text.',
        placeholder: 'e.g. Confident and approachable, not salesy',
        type: 'input',
        required: false,
      },
      {
        id: 'audience',
        letter: 'A',
        label: 'Audience',
        hint: 'Who will read or receive this?',
        placeholder: 'e.g. CTOs and technical leads at mid-size companies',
        type: 'input',
        required: false,
      },
      {
        id: 'response',
        letter: 'R',
        label: 'Response Format',
        hint: 'How should the output be structured?',
        placeholder: 'e.g. Hero headline + 3 benefit sections + CTA, under 300 words',
        type: 'input',
        required: true,
      },
    ],
    build: (f) => {
      const map = [
        ['C – Context', f.context],
        ['O – Objective', f.objective],
        ['S – Style', f.style],
        ['T – Tone', f.tone],
        ['A – Audience', f.audience],
        ['R – Response Format', f.response],
      ];
      return map.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n\n');
    },
  },

  RISEN: {
    label: 'RISEN',
    fullName: 'Role · Instructions · Steps · End Goal · Narrowing',
    color: '#f59e0b',
    tip: 'Best for process-heavy tasks: workflows, plans, technical execution.',
    icon: `<path d="M10 6H21M10 12H21M10 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="3" y="7.5" font-size="5.5" font-weight="800" fill="currentColor" font-family="sans-serif">1</text><text x="3" y="13.5" font-size="5.5" font-weight="800" fill="currentColor" font-family="sans-serif">2</text><text x="3" y="19.5" font-size="5.5" font-weight="800" fill="currentColor" font-family="sans-serif">3</text>`,
    fields: [
      {
        id: 'role',
        letter: 'R',
        label: 'Role',
        hint: 'What role or expertise should the AI embody?',
        placeholder: 'e.g. Act as an experienced Scrum Master and agile coach',
        type: 'input',
        required: true,
      },
      {
        id: 'instructions',
        letter: 'I',
        label: 'Instructions',
        hint: 'What are the specific instructions for the task?',
        placeholder: 'e.g. Help me plan a 2-week sprint for a 4-person dev team',
        type: 'textarea',
        required: true,
      },
      {
        id: 'steps',
        letter: 'S',
        label: 'Steps',
        hint: 'Sequential steps the AI should follow.',
        placeholder: 'e.g. 1. Review the backlog  2. Prioritize items  3. Assign capacity  4. Set goals',
        type: 'textarea',
        required: false,
      },
      {
        id: 'endgoal',
        letter: 'E',
        label: 'End Goal',
        hint: 'What does a successful final output look like?',
        placeholder: 'e.g. A complete sprint plan with stories, owners, and acceptance criteria',
        type: 'textarea',
        required: true,
      },
      {
        id: 'narrowing',
        letter: 'N',
        label: 'Narrowing',
        hint: 'What should be excluded, avoided, or kept within scope?',
        placeholder: 'e.g. Focus only on frontend tasks, ignore infrastructure work',
        type: 'textarea',
        required: false,
      },
    ],
    build: (f) => {
      const map = [
        ['R – Role', f.role],
        ['I – Instructions', f.instructions],
        ['S – Steps', f.steps],
        ['E – End Goal', f.endgoal],
        ['N – Narrowing', f.narrowing],
      ];
      return map.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n\n');
    },
  },

  RTCCF: {
    label: 'RTCCF',
    fullName: 'Role · Task · Context · Constraints · Format',
    color: '#8b5cf6',
    tip: 'Full project kickstart. Best when you need maximum structure.',
    icon: `<rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" fill-opacity="0.35" stroke="currentColor" stroke-width="2"/>`,
    fields: [
      {
        id: 'role',
        letter: 'R',
        label: 'Role',
        hint: 'What role should the AI assume?',
        placeholder: 'e.g. Act as a senior UX researcher with 10 years of experience',
        type: 'input',
        required: true,
      },
      {
        id: 'task',
        letter: 'T',
        label: 'Task',
        hint: 'What specific task should it perform?',
        placeholder: 'e.g. Create a user research plan to validate this idea',
        type: 'textarea',
        required: true,
      },
      {
        id: 'context',
        letter: 'C',
        label: 'Context',
        hint: 'What does it need to know to do it well?',
        placeholder: "e.g. It's an app for elderly users with no prior tech experience",
        type: 'textarea',
        required: true,
      },
      {
        id: 'constraints',
        letter: 'C',
        label: 'Constraints',
        hint: "What can't it do? What limits exist?",
        placeholder: 'e.g. Max 1 page, no jargon, limited budget',
        type: 'textarea',
        required: false,
      },
      {
        id: 'format',
        letter: 'F',
        label: 'Format',
        hint: 'How do you want the response delivered?',
        placeholder: 'e.g. Comparison table + executive summary in bullet points',
        type: 'input',
        required: false,
      },
    ],
    build: (f) => {
      const map = [
        ['R – Role', f.role],
        ['T – Task', f.task],
        ['C – Context', f.context],
        ['C – Constraints', f.constraints],
        ['F – Format', f.format],
      ];
      return map.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n\n');
    },
  },

  PRISM: {
    label: 'PRISM',
    fullName: 'Purpose · Role · Input · Steps · Method',
    color: '#f43f5e',
    tip: 'Best when feeding content to the model: documents, data, feedback, code.',
    icon: `<path d="M12 3L22 20H2L12 3Z" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 3L22 20" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity="0.4"/><circle cx="22" cy="20" r="1.5" fill="currentColor" opacity="0.6"/><circle cx="17" cy="20" r="1.5" fill="currentColor" opacity="0.4"/><circle cx="12" cy="20" r="1.5" fill="currentColor" opacity="0.25"/>`,
    fields: [
      {
        id: 'purpose',
        letter: 'P',
        label: 'Purpose',
        hint: 'What do you want to achieve with this analysis?',
        placeholder: 'e.g. Identify the main pain points from these customer reviews',
        type: 'textarea',
        required: true,
      },
      {
        id: 'role',
        letter: 'R',
        label: 'Role',
        hint: 'What role or expertise should the AI embody?',
        placeholder: 'e.g. Act as a senior product analyst with UX research experience',
        type: 'input',
        required: true,
      },
      {
        id: 'input',
        letter: 'I',
        label: 'Input',
        hint: 'What data or content are you providing to the model?',
        placeholder: 'e.g. 50 customer support tickets from Q1 2024 (pasted below)',
        type: 'textarea',
        required: true,
      },
      {
        id: 'steps',
        letter: 'S',
        label: 'Steps',
        hint: 'How should the model process the input?',
        placeholder: 'e.g. 1. Read all tickets  2. Group by theme  3. Rank by frequency',
        type: 'textarea',
        required: false,
      },
      {
        id: 'method',
        letter: 'M',
        label: 'Method',
        hint: 'How should the output be structured or delivered?',
        placeholder: 'e.g. Bullet list of top 5 themes with examples, max 300 words',
        type: 'input',
        required: false,
      },
    ],
    build: (f) => {
      const map = [
        ['P – Purpose', f.purpose],
        ['R – Role', f.role],
        ['I – Input', f.input],
        ['S – Steps', f.steps],
        ['M – Method', f.method],
      ];
      return map.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n\n');
    },
  },
};

// ─── Saved prompts (localStorage) ────────────────────────────────────────────

const SAVES_KEY = 'ai-pfh-saves';

function loadSaves() {
  try { return JSON.parse(localStorage.getItem(SAVES_KEY) || '[]'); }
  catch { return []; }
}

function writeSaves(list) {
  localStorage.setItem(SAVES_KEY, JSON.stringify(list));
}

// ─── State ────────────────────────────────────────────────────────────────────

let targetElement = null;
let savedRange = null;   // selection inside contenteditable at right-click time
let modalHost = null;
let activeFramework = 'COSTAR';
let focusTimeout = null;
let windowBlockers = [];
let escPending = null;
let draftValues = {};

// ─── Track right-clicked editable element ─────────────────────────────────────

document.addEventListener('contextmenu', (e) => {
  let node = e.target;
  while (node && node !== document.body) {
    if (
      node.tagName === 'TEXTAREA' ||
      (node.tagName === 'INPUT' && /^(text|search|url|email|password)$/i.test(node.type || 'text')) ||
      node.isContentEditable
    ) {
      targetElement = node;
      // Save the current selection range so we can restore it after the modal
      // closes. Without this, window.getSelection() points to the body/shadow
      // DOM and the text ends up inserted in the wrong place (ChatGPT, Gemini…)
      savedRange = null;
      if (node.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          savedRange = sel.getRangeAt(0).cloneRange();
        }
      }
      return;
    }
    node = node.parentElement;
  }
}, true);

// ─── Message from background ──────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'openFrameworkHelper') {
    showModal();
    sendResponse({ ok: true });
  }
  return true;
});

// ─── Modal ────────────────────────────────────────────────────────────────────

function showModal() {
  closeModal();
  draftValues = {};

  modalHost = document.createElement('div');
  modalHost.style.cssText = [
    'position: fixed',
    'inset: 0',
    'z-index: 2147483647',
    'pointer-events: none',
  ].join(';');

  const shadow = modalHost.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${getCSS()}</style>${getHTML()}`;

  document.body.appendChild(modalHost);

  // ── Isolate modal events from the host page ───────────────────────────────────
  //
  // Strategy A — window capture (fires before document capture):
  //   Claude.ai / ProseMirror register keydown+focusin listeners with
  //   { capture: true } on *document*. A window capture listener fires first,
  //   so stopPropagation() here prevents those host-page handlers from seeing
  //   events that originate inside our shadow root.
  const shadowBlock = (e) => {
    if (!e.composedPath().some(el => el === shadow)) return;

    if (e.type === 'keydown') {
      if (e.key === 'Escape') {
        e.stopPropagation();
        // 1st priority: cancel save form, don't close modal
        const saveForm = shadow.querySelector('.save-form');
        if (saveForm && saveForm.classList.contains('visible')) {
          shadow.querySelector('.btn-save-cancel').click();
          return;
        }
        // 2nd press: close
        if (escPending) {
          clearTimeout(escPending);
          escPending = null;
          closeModal();
          return;
        }
        // 1st press: show confirmation toast
        const toast = shadow.querySelector('.esc-toast');
        toast.classList.add('visible');
        escPending = setTimeout(() => {
          toast.classList.remove('visible');
          escPending = null;
        }, 2500);
        return;
      }
      if (e.key === 'Enter') {
        const saveForm = shadow.querySelector('.save-form');
        if (saveForm && saveForm.classList.contains('visible')) {
          e.stopPropagation();
          e.preventDefault();
          shadow.querySelector('.btn-save-confirm').click();
          return;
        }
      }
    }

    e.stopPropagation();
  };
  ['keydown', 'keyup', 'focusin', 'focusout'].forEach(type => {
    window.addEventListener(type, shadowBlock, true);
    windowBlockers.push({ type, fn: shadowBlock });
  });

  // Strategy B — shadow bubble phase: stop mouse events escaping the shadow.
  ['mousedown', 'mouseup', 'click', 'pointerdown', 'pointerup'].forEach(type => {
    shadow.addEventListener(type, e => e.stopPropagation());
  });

  // Strategy C — focus recovery: if focus escapes asynchronously, reclaim it.
  shadow.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!modalHost || shadow.activeElement) return;
      const el = shadow.querySelector('textarea, input');
      if (el) el.focus();
    });
  });

  const root = shadow;

  // Framework tabs
  root.querySelectorAll('.fw-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      // Persist current field values before switching
      root.querySelectorAll('textarea[data-id], input[data-id]').forEach((el) => {
        draftValues[`${activeFramework}.${el.dataset.id}`] = el.value;
      });
      activeFramework = tab.dataset.fw;
      root.querySelectorAll('.fw-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      updateFrameworkMeta(root);
      renderFields(root);
      updateSavedBadge(root);
      renderSavedList(root);
    });
  });

  // Panel tabs (Preview / Saved)
  root.querySelectorAll('.panel-tab').forEach((btn) => {
    btn.addEventListener('click', () => switchPanel(root, btn.dataset.panel));
  });

  // Save button — validate once and store in closure; confirm just uses it
  let pendingPrompt = null;
  root.querySelector('.btn-save').addEventListener('click', () => {
    pendingPrompt = buildAndValidate(root);
    if (!pendingPrompt) return;
    root.querySelector('.save-form').classList.add('visible');
    root.querySelector('.save-name-input').value = '';
    setTimeout(() => root.querySelector('.save-name-input').focus(), 60);
  });

  // Save form — confirm
  root.querySelector('.btn-save-confirm').addEventListener('click', () => {
    if (!pendingPrompt) return;
    const name = root.querySelector('.save-name-input').value.trim() || `Prompt ${Date.now()}`;
    const saves = loadSaves();
    saves.unshift({ id: Date.now(), name, framework: activeFramework, prompt: pendingPrompt });
    writeSaves(saves);
    pendingPrompt = null;
    root.querySelector('.save-form').classList.remove('visible');
    updateSavedBadge(root);
    renderSavedList(root);
    switchPanel(root, 'saved');
  });

  // Save form — cancel
  root.querySelector('.btn-save-cancel').addEventListener('click', () => {
    pendingPrompt = null;
    root.querySelector('.save-form').classList.remove('visible');
  });

  updateSavedBadge(root);
  renderSavedList(root);

  // Backdrop & close
  root.querySelector('.backdrop').addEventListener('click', closeModal);
  root.querySelector('.btn-close').addEventListener('click', closeModal);

  // Cancel
  root.querySelector('.btn-cancel').addEventListener('click', closeModal);

  // ESC + focus trap
  document.addEventListener('keydown', onKeyDown);
  shadow.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    const focusable = [...shadow.querySelectorAll('button, input, textarea, [tabindex]')]
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // Insert
  root.querySelector('.btn-insert').addEventListener('click', () => {
    const prompt = buildAndValidate(root);
    if (prompt) {
      insertText(prompt);
      closeModal();
    }
  });

  // Copy
  root.querySelector('.btn-copy').addEventListener('click', () => {
    const prompt = buildAndValidate(root);
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).then(() => {
      const btn = root.querySelector('.btn-copy');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    });
  });

  updateFrameworkMeta(root);
  renderFields(root);
}

function onKeyDown(e) {
  if (e.key === 'Escape') closeModal();
}

function closeModal() {
  if (modalHost) {
    modalHost.remove();
    modalHost = null;
  }
  windowBlockers.forEach(({ type, fn }) => window.removeEventListener(type, fn, true));
  windowBlockers = [];
  clearTimeout(focusTimeout);
  clearTimeout(escPending);
  escPending = null;
  document.removeEventListener('keydown', onKeyDown);
}

// ─── Framework UI helpers ─────────────────────────────────────────────────────

function updateFrameworkMeta(root) {
  const fw = FRAMEWORKS[activeFramework];
  root.querySelector('.fw-fullname').textContent = fw.fullName;
  root.querySelector('.fw-tip').textContent = fw.tip;
  // Update modal accent color
  root.querySelector('.modal').style.setProperty('--accent', fw.color);
}

function renderFields(root) {
  const fw = FRAMEWORKS[activeFramework];
  const container = root.querySelector('.fields-container');

  container.innerHTML = fw.fields.map((field) => `
    <div class="field-group">
      <label for="field-${field.id}">
        <span class="field-letter" style="background: var(--accent)">${field.letter}</span>
        <span class="field-label-text">${field.label}</span>
        ${field.required ? '<span class="badge-required">required</span>' : '<span class="badge-optional">optional</span>'}
      </label>
      <p class="field-hint">${field.hint}</p>
      ${
        field.type === 'textarea'
          ? `<textarea id="field-${field.id}" data-id="${field.id}" placeholder="${field.placeholder}" rows="2" spellcheck="true"></textarea>`
          : `<input type="text" id="field-${field.id}" data-id="${field.id}" placeholder="${field.placeholder}" autocomplete="off" />`
      }
    </div>
  `).join('');

  container.querySelectorAll('textarea, input').forEach((el) => {
    const key = `${activeFramework}.${el.dataset.id}`;
    if (draftValues[key]) el.value = draftValues[key];
    el.addEventListener('input', () => updatePreview(root));
  });

  updatePreview(root);

  // Focus first field
  setTimeout(() => {
    const first = container.querySelector('input, textarea');
    if (first) first.focus();
  }, 60);
}

function getFieldValues(root) {
  const values = {};
  root.querySelectorAll('textarea[data-id], input[data-id]').forEach((el) => {
    values[el.dataset.id] = el.value.trim();
  });
  return values;
}

function buildAndValidate(root) {
  const fw = FRAMEWORKS[activeFramework];
  const values = getFieldValues(root);

  // Clear previous errors
  root.querySelectorAll('.field-group').forEach((g) => g.classList.remove('has-error'));
  root.querySelectorAll('textarea[data-id], input[data-id]').forEach((el) => el.classList.remove('error'));

  const missing = fw.fields.filter((f) => f.required && !values[f.id]);
  if (missing.length > 0) {
    missing.forEach((f) => {
      const el = root.querySelector(`[data-id="${f.id}"]`);
      if (el) {
        el.classList.add('error');
        el.closest('.field-group')?.classList.add('has-error');
      }
    });
    // Scroll to first error
    const firstError = root.querySelector('.has-error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return null;
  }

  return fw.build(values);
}

function updatePreview(root) {
  const fw = FRAMEWORKS[activeFramework];
  const values = getFieldValues(root);
  const prompt = fw.build(values);
  const el = root.querySelector('.preview-content');
  if (prompt) {
    el.textContent = prompt;
    el.classList.remove('is-placeholder');
  } else {
    el.textContent = 'Fill in the fields above to preview your structured prompt…';
    el.classList.add('is-placeholder');
  }
}

// ─── Text insertion ───────────────────────────────────────────────────────────

function insertText(text) {
  if (!targetElement) return;

  targetElement.focus();

  if (targetElement.isContentEditable) {
    // Restore the selection that was active when the user right-clicked.
    // By the time Insert is clicked, the browser focus has moved to the modal,
    // so window.getSelection() no longer points inside the target element —
    // that's what caused text to land at the end of the body in ChatGPT/Gemini.
    const sel = window.getSelection();
    sel.removeAllRanges();

    if (savedRange && targetElement.contains(savedRange.commonAncestorContainer)) {
      try { sel.addRange(savedRange); } catch (_) {}
    }

    // If still no valid range inside the target, place cursor at the end.
    if (!sel.rangeCount || !targetElement.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = document.createRange();
      range.selectNodeContents(targetElement);
      range.collapse(false); // collapse to end
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // execCommand is the most reliable way to insert into contenteditable and
    // correctly triggers React/Vue synthetic events (works in ChatGPT, Gemini,
    // Claude web, Notion, etc.)
    document.execCommand('insertText', false, text);
    targetElement.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    // textarea / input — React-compatible via native setter
    const proto =
      targetElement.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

    const start = targetElement.selectionStart ?? targetElement.value.length;
    const end = targetElement.selectionEnd ?? targetElement.value.length;
    const before = targetElement.value.substring(0, start);
    const after = targetElement.value.substring(end);
    const newValue = before + text + after;

    if (nativeSetter) {
      nativeSetter.call(targetElement, newValue);
    } else {
      targetElement.value = newValue;
    }

    targetElement.selectionStart = targetElement.selectionEnd = start + text.length;
    targetElement.dispatchEvent(new Event('input', { bubbles: true }));
    targetElement.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// ─── Save helpers ─────────────────────────────────────────────────────────────

function switchPanel(root, panel) {
  root.querySelector('.preview-section').dataset.panel = panel;
  root.querySelectorAll('.panel-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.panel === panel);
  });
}

function updateSavedBadge(root) {
  const count = loadSaves().filter((s) => s.framework === activeFramework).length;
  const badge = root.querySelector('.saved-badge');
  badge.textContent = count || '';
  badge.style.display = count ? 'inline-flex' : 'none';
}

function renderSavedList(root) {
  const saves = loadSaves().filter((s) => s.framework === activeFramework);
  const list = root.querySelector('.saved-list');
  if (!saves.length) {
    list.innerHTML = `<p class="saved-empty">No saved prompts for ${activeFramework} yet.</p>`;
    return;
  }
  list.innerHTML = saves.map((s) => `
    <div class="saved-item" data-id="${s.id}">
      <div class="saved-item-info">
        <span class="saved-item-name">${escHtml(s.name)}</span>
      </div>
      <div class="saved-item-actions">
        <button class="btn-load-save" data-id="${s.id}">Load</button>
        <button class="btn-delete-save" data-id="${s.id}">×</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.btn-load-save').forEach((btn) => {
    btn.addEventListener('click', () => loadSavedPrompt(root, Number(btn.dataset.id)));
  });
  list.querySelectorAll('.btn-delete-save').forEach((btn) => {
    btn.addEventListener('click', () => {
      const saves = loadSaves().filter((s) => s.id !== Number(btn.dataset.id));
      writeSaves(saves);
      updateSavedBadge(root);
      renderSavedList(root);
    });
  });
}

function loadSavedPrompt(root, id) {
  const save = loadSaves().find((s) => s.id === id);
  if (!save) return;

  // Switch framework if needed
  if (save.framework !== activeFramework) {
    root.querySelectorAll('textarea[data-id], input[data-id]').forEach((el) => {
      draftValues[`${activeFramework}.${el.dataset.id}`] = el.value;
    });
    activeFramework = save.framework;
    root.querySelectorAll('.fw-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.fw === activeFramework);
    });
    updateFrameworkMeta(root);
    renderFields(root);
  }

  // Parse prompt text back into fields
  const fw = FRAMEWORKS[activeFramework];
  fw.fields.forEach((field) => {
    const regex = new RegExp(`${field.letter}\\s*[–-]\\s*${field.label}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]\\s*[–-]|$)`, 'i');
    const match = save.prompt.match(regex);
    const el = root.querySelector(`[data-id="${field.id}"]`);
    if (el && match) el.value = match[1].trim();
  });

  updatePreview(root);
  root.querySelector('.save-form').classList.remove('visible');
  switchPanel(root, 'preview');
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── HTML template ────────────────────────────────────────────────────────────

function getHTML() {
  const tabs = Object.entries(FRAMEWORKS)
    .map(([key, fw]) => `
      <button class="fw-tab ${key === activeFramework ? 'active' : ''}" data-fw="${key}" style="--fw-color:${fw.color}">
        <svg class="fw-tab-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${fw.icon}</svg>
        ${fw.label}
      </button>
    `)
    .join('');

  return `
    <div class="esc-toast">Press <kbd>Esc</kbd> again to close the AI Prompt Helper</div>
    <div class="backdrop"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-label="AI Prompt Framework Helper" style="--accent: ${FRAMEWORKS[activeFramework].color}">

      <div class="modal-header">
        <div class="header-row">
          <div class="brand">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="brand-name">AI Prompt Framework Helper</span>
          </div>
          <button class="btn-close" aria-label="Close">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="fw-tabs">${tabs}</div>

        <div class="fw-meta">
          <span class="fw-fullname"></span>
          <span class="fw-tip"></span>
        </div>
      </div>

      <div class="modal-body">
        <div class="fields-container"></div>

        <div class="preview-section" data-panel="preview">
          <div class="preview-header">
            <div class="panel-tabs">
              <button class="panel-tab active" data-panel="preview">Preview</button>
              <button class="panel-tab" data-panel="saved">
                Saved
                <span class="saved-badge" style="display:none"></span>
              </button>
            </div>
            <button class="btn-save" aria-label="Save prompt">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Save
            </button>
          </div>

          <pre class="preview-content is-placeholder">Fill in the fields above to preview your structured prompt…</pre>

          <div class="saved-list"></div>

          <div class="save-form">
            <input class="save-name-input" type="text" placeholder="Name this prompt…" autocomplete="off" />
            <div class="save-form-actions">
              <button class="btn-save-cancel">Cancel</button>
              <button class="btn-save-confirm">Save</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-copy">Copy to clipboard</button>
        <div class="footer-actions">
          <button class="btn-cancel">Cancel</button>
          <button class="btn-insert">Insert Prompt</button>
        </div>
      </div>

    </div>
  `;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

function getCSS() {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host { all: initial; }

    .esc-toast {
      position: fixed;
      bottom: 36px;
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      background: rgba(17, 24, 39, 0.92);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      font-size: 15px;
      font-weight: 500;
      padding: 13px 26px;
      border-radius: 28px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease;
      white-space: nowrap;
      z-index: 1;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    }

    .esc-toast.visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .esc-toast kbd {
      font-family: inherit;
      font-size: 13px;
      background: rgba(255, 255, 255, 0.22);
      border-radius: 5px;
      padding: 2px 7px;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 15, 25, 0.55);
      backdrop-filter: blur(3px);
      pointer-events: all;
    }

    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(740px, 96vw);
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 32px 80px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0,0,0,0.06);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      font-size: 14px;
      color: #111827;
      pointer-events: all;
      overflow: hidden;
    }

    /* ── Header ── */

    .modal-header {
      padding: 20px 24px 0;
      border-bottom: 1px solid #f0f0f5;
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--accent);
    }

    .brand-icon {
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }

    .brand-name {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.3px;
    }

    .btn-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      transition: background 0.15s, color 0.15s;
    }

    .btn-close:hover {
      background: #f3f4f6;
      color: #374151;
    }

    /* ── Tabs ── */

    .fw-tabs {
      display: flex;
      gap: 2px;
    }

    .fw-tab {
      background: none;
      border: none;
      cursor: pointer;
      padding: 9px 18px;
      border-radius: 8px 8px 0 0;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.4px;
      color: #9ca3af;
      font-family: inherit;
      border-bottom: 3px solid transparent;
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .fw-tab-icon {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
    }

    .fw-tab:hover {
      color: var(--fw-color);
      background: color-mix(in srgb, var(--fw-color) 7%, transparent);
    }

    .fw-tab.active {
      color: var(--fw-color);
      background: color-mix(in srgb, var(--fw-color) 9%, transparent);
      border-bottom-color: var(--fw-color);
    }

    /* ── Framework meta ── */

    .fw-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 2px;
    }

    .fw-fullname {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      letter-spacing: 0.3px;
    }

    .fw-tip {
      font-size: 11px;
      color: #9ca3af;
    }

    .fw-tip::before {
      content: '·  ';
    }

    /* ── Body ── */

    .modal-body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      scrollbar-width: thin;
      scrollbar-color: #e5e7eb transparent;
    }

    /* ── Fields ── */

    .fields-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field-group.has-error label .field-label-text {
      color: #ef4444;
    }

    label {
      display: flex;
      align-items: center;
      gap: 7px;
      cursor: default;
    }

    .field-letter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
      letter-spacing: 0;
    }

    .field-label-text {
      font-size: 12px;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-required {
      font-size: 10px;
      font-weight: 600;
      color: #ef4444;
      background: #fef2f2;
      padding: 1px 6px;
      border-radius: 20px;
      letter-spacing: 0.3px;
    }

    .badge-optional {
      font-size: 10px;
      font-weight: 500;
      color: #9ca3af;
      background: #f3f4f6;
      padding: 1px 6px;
      border-radius: 20px;
    }

    .field-hint {
      font-size: 11px;
      color: #6b7280;
      margin-left: 27px;
      line-height: 1.4;
    }

    textarea,
    input[type='text'] {
      width: 100%;
      margin-top: 2px;
      border: 1.5px solid #e5e7eb;
      border-radius: 9px;
      padding: 9px 12px;
      font-size: 13px;
      font-family: inherit;
      color: #111827;
      background: #f9fafb;
      line-height: 1.55;
      resize: vertical;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }

    textarea:focus,
    input[type='text']:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
      background: #ffffff;
    }

    textarea.error,
    input[type='text'].error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    textarea::placeholder,
    input::placeholder {
      color: #c4c9d4;
      font-style: italic;
    }

    /* ── Preview ── */

    .preview-section {
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      /* let it shrink but keep a usable minimum */
      min-height: 200px;
    }

    .preview-header {
      padding: 6px 8px 6px 14px;
      background: #f8f9fa;
      border-bottom: 1px solid #e5e7eb;
      border-radius: 10px 10px 0 0;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .panel-tabs {
      display: flex;
      gap: 2px;
    }

    .panel-tab {
      background: none;
      border: none;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      padding: 4px 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .panel-tab.active {
      background: #ffffff;
      color: #374151;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .saved-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 15px;
      height: 15px;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      padding: 0 4px;
    }

    .btn-save {
      background: none;
      border: 1.5px solid #e5e7eb;
      color: #6b7280;
      font-size: 11px;
      font-weight: 600;
      border-radius: 7px;
      padding: 4px 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: inherit;
      transition: all 0.15s;
    }

    .btn-save:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    /* panel visibility */
    .preview-section[data-panel="preview"] .preview-content { display: block; }
    .preview-section[data-panel="preview"] .saved-list { display: none; }
    .preview-section[data-panel="saved"] .preview-content { display: none; }
    .preview-section[data-panel="saved"] .saved-list { display: flex; }

    .saved-list {
      flex: 1;
      flex-direction: column;
      overflow-y: auto;
      padding: 8px;
      gap: 5px;
      scrollbar-width: thin;
      scrollbar-color: #e5e7eb transparent;
    }

    .saved-empty {
      color: #9ca3af;
      font-size: 11px;
      padding: 16px 6px;
      font-style: italic;
    }

    .saved-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 7px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
    }

    .saved-item-info {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
    }

    .saved-item-name {
      font-size: 12px;
      color: #374151;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .saved-item-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .btn-load-save {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      background: none;
      border: 1.5px solid currentColor;
      border-radius: 6px;
      padding: 3px 9px;
      cursor: pointer;
    }

    .btn-load-save:hover {
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }

    .btn-delete-save {
      font-size: 14px;
      font-weight: 400;
      color: #9ca3af;
      background: none;
      border: none;
      border-radius: 6px;
      padding: 3px 7px;
      cursor: pointer;
      line-height: 1;
    }

    .btn-delete-save:hover {
      color: #ef4444;
      background: #fef2f2;
    }

    /* save name form */
    .save-form {
      display: none;
      flex-direction: column;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid #e5e7eb;
      background: #fafafa;
      flex-shrink: 0;
    }

    .save-form.visible { display: flex; }

    .save-name-input {
      width: 100%;
      border: 1.5px solid #d1d5db;
      border-radius: 8px;
      padding: 7px 10px;
      font-size: 13px;
      font-family: inherit;
      color: #111827;
      outline: none;
    }

    .save-name-input:focus { border-color: var(--accent); }

    .save-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
    }

    .btn-save-cancel {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      background: none;
      border: 1.5px solid #e5e7eb;
      border-radius: 7px;
      padding: 5px 12px;
      cursor: pointer;
    }

    .btn-save-confirm {
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      background: var(--accent);
      border: none;
      border-radius: 7px;
      padding: 5px 14px;
      cursor: pointer;
    }

    .preview-content {
      flex: 1;
      padding: 14px 16px;
      font-size: 12px;
      line-height: 1.75;
      color: #374151;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
      background: #ffffff;
      /* grow up to 340px on small screens — body handles the outer scroll */
      min-height: 160px;
      max-height: 340px;
      overflow-y: auto;
      border-radius: 0 0 10px 10px;
      scrollbar-width: thin;
      scrollbar-color: #e5e7eb transparent;
    }

    .preview-content.is-placeholder {
      color: #c4c9d4;
      font-style: italic;
      font-family: inherit;
    }

    /* ── Wide-screen layout (≥ 1280px): fields left, preview right ── */

    @media (min-width: 1280px) {
      .modal {
        width: min(1120px, 96vw);
        max-height: 88vh;
      }

      /* Body becomes a 2-column grid; each column scrolls independently */
      .modal-body {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 0;
        padding: 0;
        overflow: hidden;
      }

      /* Left column: fields, scrollable */
      .fields-container {
        padding: 20px 24px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #e5e7eb transparent;
      }

      /* Right column: preview panel, full height, no outer border */
      .preview-section {
        border: none;
        border-left: 1px solid #e5e7eb;
        border-radius: 0;
        min-height: 0;
        /* stretch to fill grid row */
        align-self: stretch;
      }

      .preview-header {
        border-radius: 0;
      }

      /* Preview content fills the whole right panel, scrollable */
      .preview-content {
        max-height: none;
        min-height: 0;
        flex: 1;
        border-radius: 0;
      }

      .save-form { border-radius: 0; }
    }

    /* ── Footer ── */

    .modal-footer {
      padding: 14px 24px;
      border-top: 1px solid #f0f0f5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fafafa;
      flex-shrink: 0;
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }

    button {
      cursor: pointer;
      border: none;
      border-radius: 9px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      padding: 9px 16px;
      transition: all 0.15s;
      line-height: 1;
    }

    .btn-copy {
      background: none;
      border: 1.5px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }

    .btn-copy:hover {
      border-color: #9ca3af;
      color: #374151;
      background: #ffffff;
    }

    .btn-cancel {
      background: none;
      border: 1.5px solid #e5e7eb;
      color: #6b7280;
    }

    .btn-cancel:hover {
      border-color: #9ca3af;
      color: #374151;
      background: #ffffff;
    }

    .btn-insert {
      background: var(--accent);
      color: #ffffff;
      padding: 9px 20px;
      box-shadow: 0 2px 10px color-mix(in srgb, var(--accent) 40%, transparent);
    }

    .btn-insert:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 50%, transparent);
    }

    .btn-insert:active {
      transform: translateY(0);
      filter: brightness(0.97);
    }
  `;
}
