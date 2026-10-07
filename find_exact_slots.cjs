const fs = require('fs');
const jpeg = require('jpeg-js');

const buf = fs.readFileSync('public/saga_map_bg.jpg');
const raw = jpeg.decode(buf, { useTArray: true });
const W = raw.width; // 682
const H = raw.height; // 1024
console.log('Image dimensions:', W, H);

function getPixel(x, y) {
  if (x < 0 || x >= W || y < 0 || y >= H) return [0, 0, 0];
  const idx = (Math.round(y) * W + Math.round(x)) * 4;
  return [raw.data[idx], raw.data[idx + 1], raw.data[idx + 2]];
}

function getBrightness(x, y) {
  const [r, g, b] = getPixel(x, y);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Estimates of the 12 circles
const estimates = [
  { lvl: 1, x: 115, y: 213 },
  { lvl: 2, x: 220, y: 243 },
  { lvl: 3, x: 337, y: 233 },
  { lvl: 4, x: 541, y: 259 },
  { lvl: 5, x: 446, y: 366 },
  { lvl: 6, x: 116, y: 334 },
  { lvl: 7, x: 297, y: 462 },
  { lvl: 8, x: 104, y: 535 },
  { lvl: 9, x: 432, y: 536 },
  { lvl: 10, x: 87, y: 645 },
  { lvl: 11, x: 350, y: 666 },
  { lvl: 12, x: 208, y: 825 }
];

// Refine each circle center by finding the center of maximum circular symmetry
const refined = estimates.map(e => {
  let bestX = e.x;
  let bestY = e.y;
  let bestScore = -Infinity;
  const targetR = 25.5; // Radius of disc in image

  for (let dx = -20; dx <= 20; dx++) {
    for (let dy = -20; dy <= 20; dy++) {
      const cx = e.x + dx;
      const cy = e.y + dy;

      // Check circular gradient: difference between inner disc (r = 20) and outer rim (r = 28)
      let innerSum = 0;
      let rimSum = 0;
      let outerSum = 0;
      const samples = 32;

      for (let s = 0; s < samples; s++) {
        const a = (s / samples) * Math.PI * 2;
        innerSum += getBrightness(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16);
        rimSum += getBrightness(cx + Math.cos(a) * targetR, cy + Math.sin(a) * targetR);
        outerSum += getBrightness(cx + Math.cos(a) * 35, cy + Math.sin(a) * 35);
      }

      innerSum /= samples;
      rimSum /= samples;
      outerSum /= samples;

      // For grey discs (4-12) or golden discs (1-3):
      // The rim has strong contrast against the background road/grass
      // Also the disc has radial symmetry: sample opposite points across the center
      let symmetry = 0;
      for (let s = 0; s < 16; s++) {
        const a = (s / 16) * Math.PI;
        const b1 = getBrightness(cx + Math.cos(a) * targetR, cy + Math.sin(a) * targetR);
        const b2 = getBrightness(cx - Math.cos(a) * targetR, cy - Math.sin(a) * targetR);
        symmetry -= Math.abs(b1 - b2); // lower difference = higher symmetry
      }

      // Edge contrast at radius 25.5
      let edgeContrast = 0;
      for (let s = 0; s < samples; s++) {
        const a = (s / samples) * Math.PI * 2;
        const bIn = getBrightness(cx + Math.cos(a) * 23, cy + Math.sin(a) * 23);
        const bOut = getBrightness(cx + Math.cos(a) * 28, cy + Math.sin(a) * 28);
        edgeContrast += Math.abs(bIn - bOut);
      }

      const score = edgeContrast * 2 + symmetry * 1.5;
      if (score > bestScore) {
        bestScore = score;
        bestX = cx;
        bestY = cy;
      }
    }
  }

  const xPercent = Number((bestX / W * 100).toFixed(1));
  const yPercent = Number((bestY / H * 100).toFixed(1));

  return {
    levelNumber: e.lvl,
    pixelX: bestX,
    pixelY: bestY,
    xPercent,
    yPercent
  };
});

console.log('REFINED_SLOTS:');
console.log(JSON.stringify(refined, null, 2));
