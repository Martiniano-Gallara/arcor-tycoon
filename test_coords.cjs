const fs = require('fs');

// We have the 682x1024 image.
// Let's find circle centers.
// In saga_map_bg.jpg, the 12 circles have:
// Distinct circle radii: each circle has diameter around 50-60px (radius ~25-30px).
// Let's create an HTML analyzer that we can run or test.
const html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; background: #222; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; }
  #container { position: relative; display: inline-block; }
  canvas { border: 1px solid #444; }
  #info { padding: 10px; max-width: 800px; font-family: monospace; white-space: pre-wrap; font-size: 12px; }
</style>
</head>
<body>
<h3>Coordenadas de los 12 Nodos</h3>
<div id="container">
  <canvas id="c" width="682" height="1024"></canvas>
</div>
<div id="info">Cargando...</div>
<script>
const img = new Image();
img.src = '/saga_map_bg.jpg';
img.onload = () => {
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // We can sample brightness/edges or mark the circles
  // Estimated centers in 682x1024:
  const estimates = [
    { lvl: 1, x: 113, y: 213 }, // 16.6%, 20.8%
    { lvl: 2, x: 220, y: 243 }, // 32.3%, 23.7%
    { lvl: 3, x: 337, y: 233 }, // 49.4%, 22.8%
    { lvl: 4, x: 541, y: 259 }, // 79.3%, 25.3%
    { lvl: 5, x: 446, y: 366 }, // 65.4%, 35.7%
    { lvl: 6, x: 116, y: 334 }, // 17.0%, 32.6%
    { lvl: 7, x: 297, y: 462 }, // 43.5%, 45.1%
    { lvl: 8, x: 104, y: 535 }, // 15.2%, 52.2%
    { lvl: 9, x: 432, y: 536 }, // 63.3%, 52.3%
    { lvl: 10, x: 87, y: 650 }, // 12.8%, 63.5%
    { lvl: 11, x: 350, y: 666 }, // 51.3%, 65.0%
    { lvl: 12, x: 208, y: 825 }, // 30.5%, 80.6%
  ];

  // Refine centers by finding center of mass of dark/gold rim
  const refined = estimates.map(e => {
    // search in window +- 25px
    let bestX = e.x;
    let bestY = e.y;
    let maxContrast = 0;
    
    // Look for circular symmetry with radius ~25px
    const R = 25;
    for (let dx = -15; dx <= 15; dx++) {
      for (let dy = -15; dy <= 15; dy++) {
        const cx = e.x + dx;
        const cy = e.y + dy;
        // sample perimeter at radius R
        let ringDiff = 0;
        const samples = 16;
        for (let s = 0; s < samples; s++) {
          const angle = (s / samples) * Math.PI * 2;
          const px = Math.round(cx + Math.cos(angle) * R);
          const py = Math.round(cy + Math.sin(angle) * R);
          const pInner = Math.round(cx + Math.cos(angle) * (R - 6));
          if (px >= 0 && px < 682 && py >= 0 && py < 1024) {
            const dOuter = ctx.getImageData(px, py, 1, 1).data;
            const dInner = ctx.getImageData(pInner, py, 1, 1).data;
            const bOuter = (dOuter[0] + dOuter[1] + dOuter[2]) / 3;
            const bInner = (dInner[0] + dInner[1] + dInner[2]) / 3;
            ringDiff += Math.abs(bOuter - bInner);
          }
        }
        if (ringDiff > maxContrast) {
          maxContrast = ringDiff;
          bestX = cx;
          bestY = cy;
        }
      }
    }

    const xPercent = (bestX / 682 * 100).toFixed(1);
    const yPercent = (bestY / 1024 * 100).toFixed(1);
    return { lvl: e.lvl, x: bestX, y: bestY, xPercent: parseFloat(xPercent), yPercent: parseFloat(yPercent) };
  });

  document.getElementById('info').textContent = JSON.stringify(refined, null, 2);

  // Draw overlay circles on canvas to verify
  refined.forEach(r => {
    ctx.beginPath();
    ctx.arc(r.x, r.y, 25, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#00ffcc';
    ctx.fillText('N' + r.lvl, r.x - 10, r.y - 30);
  });
};
</script>
</body>
</html>`;

fs.writeFileSync('public/test_coords.html', html);
console.log('Written test_coords.html');
