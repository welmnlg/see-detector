// ─── RTL Toggle · Popup Script ────────────────────────────────────────────
'use strict';

// ── All UI strings per language ──────────────────────────────────────────
const STRINGS = {
  en: {
    popupSubtitle:  'Fix text direction on any website',
    btnActivate:    '🎯 Activate Picker Mode',
    btnDeactivate:  '⏹️ Deactivate Picker Mode',
    statusOff:      '⚫ Inactive',
    statusOn:       '🟣 Active — click on the page',
    btnReset:       '🔁 Reset All Changes on Page',
    btnResetDone:   '✅ Reset!',
    step1:          'Press "Activate Picker Mode"',
    step2:          'Hover over the target element',
    step3:          'Click it to toggle direction',
    stepEsc:        'Press ESC to exit',
    dir:            'ltr'
  },
  ar: {
    popupSubtitle:  'حوّل اتجاه النص بنقرة واحدة',
    btnActivate:    '🎯 تفعيل وضع التحويل',
    btnDeactivate:  '⏹️ إيقاف وضع التحويل',
    statusOff:      '⚫ غير مفعّل',
    statusOn:       '🟣 مفعّل — انقر على الصفحة',
    btnReset:       '🔁 إعادة تعيين كل التغييرات في الصفحة',
    btnResetDone:   '✅ تم الإعادة!',
    step1:          'اضغط "تفعيل وضع التحويل"',
    step2:          'مرر الماوس على المربع المطلوب',
    step3:          'انقر عليه لتحويل الاتجاه',
    stepEsc:        'اضغط ESC للخروج',
    dir:            'rtl'
  },
  he: {
    popupSubtitle:  'תקן כיוון טקסט בלחיצה אחת',
    btnActivate:    '🎯 הפעל מצב בחירה',
    btnDeactivate:  '⏹️ בטל מצב בחירה',
    statusOff:      '⚫ לא פעיל',
    statusOn:       '🟣 פעיל — לחץ על הדף',
    btnReset:       '🔁 אפס את כל השינויים בדף',
    btnResetDone:   '✅ אופס!',
    step1:          'לחץ "הפעל מצב בחירה"',
    step2:          'רחף מעל האלמנט הרצוי',
    step3:          'לחץ עליו להחלפת כיוון',
    stepEsc:        'לחץ ESC ליציאה',
    dir:            'rtl'
  },
  fa: {
    popupSubtitle:  'تغییر جهت متن با یک کلیک',
    btnActivate:    '🎯 فعال‌سازی حالت انتخاب',
    btnDeactivate:  '⏹️ غیرفعال کردن حالت انتخاب',
    statusOff:      '⚫ غیرفعال',
    statusOn:       '🟣 فعال — روی صفحه کلیک کنید',
    btnReset:       '🔁 بازنشانی همه تغییرات صفحه',
    btnResetDone:   '✅ بازنشانی شد!',
    step1:          '"فعال‌سازی حالت انتخاب" را فشار دهید',
    step2:          'ماوس را روی عنصر مورد نظر ببرید',
    step3:          'برای تغییر جهت کلیک کنید',
    stepEsc:        'ESC را برای خروج فشار دهید',
    dir:            'rtl'
  },
  ur: {
    popupSubtitle:  'ایک کلک میں متن کی سمت بدلیں',
    btnActivate:    '🎯 پکر موڈ فعال کریں',
    btnDeactivate:  '⏹️ پکر موڈ بند کریں',
    statusOff:      '⚫ غیر فعال',
    statusOn:       '🟣 فعال — صفحے پر کلک کریں',
    btnReset:       '🔁 صفحے کی تمام تبدیلیاں ری سیٹ کریں',
    btnResetDone:   '✅ ری سیٹ ہو گیا!',
    step1:          '"پکر موڈ فعال کریں" دبائیں',
    step2:          'مطلوبہ عنصر پر ماؤس لے جائیں',
    step3:          'سمت بدلنے کے لیے کلک کریں',
    stepEsc:        'باہر نکلنے کے لیے ESC دبائیں',
    dir:            'rtl'
  }
};

// ── Detect browser UI language → pick best match ─────────────────────────
function detectLang() {
  const saved = localStorage.getItem('rtl-toggle-lang');
  if (saved && STRINGS[saved]) return saved;
  const ui = chrome.i18n.getUILanguage().split('-')[0].toLowerCase();
  return STRINGS[ui] ? ui : 'en';
}

// ── DOM refs ──────────────────────────────────────────────────────────────
const toggleBtn   = document.getElementById('toggleBtn');
const btnIcon     = document.getElementById('btnIcon');
const btnText     = document.getElementById('btnText');
const statusBadge = document.getElementById('statusBadge');
const statusText  = document.getElementById('statusText');
const resetBtn    = document.getElementById('resetBtn');

// ── Apply language to entire popup ───────────────────────────────────────
let currentLang = detectLang();

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('rtl-toggle-lang', lang);

  const s = STRINGS[lang];
  document.documentElement.lang = lang;
  document.body.dir              = s.dir;
  document.body.style.direction  = s.dir;

  document.getElementById('popupSubtitle').textContent = s.popupSubtitle;
  document.getElementById('step1').textContent         = s.step1;
  document.getElementById('step2').textContent         = s.step2;
  document.getElementById('step3').textContent         = s.step3;
  document.getElementById('stepEsc').textContent       = s.stepEsc;
  resetBtn.textContent = s.btnReset;

  // Highlight active lang button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Re-apply current picker status labels
  updateUI(statusBadge.classList.contains('on'));
}

function updateUI(active) {
  const s = STRINGS[currentLang];
  if (active) {
    toggleBtn.classList.add('active');
    btnIcon.textContent  = '⏹️';
    btnText.textContent  = s.btnDeactivate.replace(/^⏹️\s*/, '');
    statusBadge.classList.add('on');
    statusText.textContent = s.statusOn;
  } else {
    toggleBtn.classList.remove('active');
    btnIcon.textContent  = '🎯';
    btnText.textContent  = s.btnActivate.replace(/^🎯\s*/, '');
    statusBadge.classList.remove('on');
    statusText.textContent = s.statusOff;
  }
}

// ── Language button clicks ────────────────────────────────────────────────
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

// ── Toggle picker ─────────────────────────────────────────────────────────
toggleBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: 'activatePicker' }, res => {
      if (chrome.runtime.lastError) return;
      if (res) updateUI(res.status === 'activated');
      window.close();
    });
  });
});

// ── Reset button ──────────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: 'resetAll' }, () => {
      const orig = resetBtn.textContent;
      resetBtn.textContent = STRINGS[currentLang].btnResetDone;
      setTimeout(() => { resetBtn.textContent = orig; }, 1500);
    });
  });
});

// ── Check current picker status on open ──────────────────────────────────
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  if (!tabs[0]) return;
  chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, res => {
    if (chrome.runtime.lastError) return;
    if (res) updateUI(res.active);
  });
});

// ── Also send current lang to content script (for feedback toasts) ────────
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  if (!tabs[0]) return;
  chrome.tabs.sendMessage(tabs[0].id, { action: 'setLang', lang: currentLang });
});

// ── Init ──────────────────────────────────────────────────────────────────
applyLang(currentLang);
