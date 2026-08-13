// ── SVG TICK MARKS ──
const SVG_NS = 'http://www.w3.org/2000/svg';
const MIN = 10, MAX = 200;
const THUMB_PCT = 2.5;

function buildTicks() {
  const svg = document.getElementById('tickSvg');
  if (!svg) return;
  svg.innerHTML = '';
  for (let v = MIN; v <= MAX; v += 10) {
    const pct = THUMB_PCT + ((v - MIN) / (MAX - MIN)) * (100 - THUMB_PCT * 2);
    const isLabel = v % 50 === 0;
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', pct);
    line.setAttribute('x2', pct);
    line.setAttribute('y1', isLabel ? 9 : 11);
    line.setAttribute('y2', 18);
    line.setAttribute('stroke', 'rgba(255,255,255,0.22)');
    line.setAttribute('stroke-width', '1.5');
    line.dataset.val = v;
    if (isLabel) line.dataset.label = '1';
    svg.appendChild(line);
  }
}

function drawTicks(sliderVal) {
  const svg = document.getElementById('tickSvg');
  if (!svg) return;
  svg.querySelectorAll('line').forEach(line => {
    const v = parseInt(line.dataset.val);
    const dist = Math.abs(v - sliderVal);
    const isLabel = line.dataset.label === '1';

    if (dist === 0) {
      line.setAttribute('stroke', 'rgba(255,217,61,1)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('y1', 6);
    } else if (dist <= 10) {
      const a = (0.22 + 0.33 * (1 - dist / 10)).toFixed(2);
      line.setAttribute('stroke', `rgba(255,255,255,${a})`);
      line.setAttribute('stroke-width', '1.5');
      const nearY = 11 - Math.round(4 * (1 - dist / 10));
      line.setAttribute('y1', nearY);
    } else {
      line.setAttribute('stroke', isLabel ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.22)');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('y1', isLabel ? 9 : 11);
    }
  });
}

// ── SNAP FEEL ──
const SNAP_ZONE = 3;
let lastSnap = null;

function handleSnap(slider) {
  const v = parseInt(slider.value);
  const nearest = Math.round(v / 10) * 10;
  const clamped = Math.max(MIN, Math.min(MAX, nearest));
  const dist = Math.abs(v - clamped);
  if (dist <= SNAP_ZONE && dist > 0) {
    slider.value = clamped;
    if (lastSnap !== clamped) {
      lastSnap = clamped;
      slider.classList.add('snapping');
      setTimeout(() => slider.classList.remove('snapping'), 120);
    }
    return clamped;
  }
  lastSnap = null;
  return v;
}

// Build ticks on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  buildTicks();
  drawTicks(100);

  window.addEventListener('resize', () => {
    const slider = document.getElementById('brightnessSlider');
    if (slider) drawTicks(parseInt(slider.value));
  });
});
