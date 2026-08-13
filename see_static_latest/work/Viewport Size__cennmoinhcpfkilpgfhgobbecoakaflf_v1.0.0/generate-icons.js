// Run with: node generate-icons.js
// Generates PNG icons using canvas (requires: npm install canvas)
// OR use the SVG icons directly if your Chrome version supports it

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - rounded square
  const radius = size * 0.22;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw viewport frame
  const pad = size * 0.22;
  const fw = size - pad * 2;
  const fh = size - pad * 2;
  const lw = Math.max(1, size * 0.07);

  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Outer frame
  ctx.strokeRect(pad, pad, fw, fh);

  // Inner crosshair lines (small notches in center)
  const cx = size / 2;
  const cy = size / 2;
  const notch = size * 0.08;
  ctx.lineWidth = lw * 0.8;

  // Horizontal tick at center
  ctx.beginPath();
  ctx.moveTo(cx - notch, cy);
  ctx.lineTo(cx + notch, cy);
  ctx.stroke();

  // Vertical tick at center
  ctx.beginPath();
  ctx.moveTo(cx, cy - notch);
  ctx.lineTo(cx, cy + notch);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

const sizes = [16, 48, 128];
sizes.forEach(size => {
  const buffer = generateIcon(size);
  const outPath = path.join(__dirname, 'icons', `icon${size}.png`);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated icon${size}.png`);
});
