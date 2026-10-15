/* walls.mjs <outdir> [name ...] : crisp wallpapers for the glass to refract (2560x1440, WebP), drawn in headless Chrome.
   With names, only those are drawn (the first three are kept as published; the 2026-10-13 set adds five). */
import { createRequire } from 'node:module'; import { writeFileSync, mkdirSync } from 'node:fs'; import { join } from 'node:path';
const require = createRequire('/home/sittingmongoose/pmt-dev/pw/noop.js'); const { chromium } = require('playwright-core');
const out = process.argv[2], only = process.argv.slice(3); mkdirSync(out, { recursive: true });   /* writes <name>-<dark|light>.webp; the concept reads src/walls/ */
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true }); const p = await b.newPage(); await p.goto('about:blank');
const res = await p.evaluate((only) => {
  const W = 2560, H = 1440;
  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function grain(g, amt) { const im = g.getImageData(0, 0, W, H), d = im.data, r = rng(7); for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(im, 0, 0); }
  function lin(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
  /* Ribbons: layered flowing bands with crisp edges, each lit along its crest */
  function ribbons(dark) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = lin(g, 0, 0, W * 0.3, H, dark ? [[0, '#03050c'], [1, '#0a0f24']] : [[0, '#f4f2ee'], [1, '#e9eef7']]); g.fillRect(0, 0, W, H);
    const pal = dark ? [['#0b2a8f', '#1f5bff'], ['#3a1a9e', '#8a4dff'], ['#006d7a', '#19d3c5'], ['#7a0f5a', '#ff4fa3'], ['#13307a', '#4f8dff'], ['#2a1070', '#b77bff']]
                     : [['#9cc5ff', '#5b8cff'], ['#d9c6ff', '#9b7bff'], ['#a6f0e4', '#2fbfae'], ['#ffd0e6', '#ff6fb1'], ['#c4dcff', '#7aa7ff'], ['#ffe1b8', '#ffab4a']];
    const bands = 9;
    for (let k = 0; k < bands; k++) {
      const [c0, c1] = pal[k % pal.length]; const base = H * (0.12 + k * 0.105), amp = H * (0.10 + 0.04 * Math.sin(k * 1.7)), ph = k * 0.9, fr = 1.15 + 0.12 * Math.cos(k);
      const top = x => base + Math.sin(x / W * Math.PI * fr + ph) * amp + Math.sin(x / W * Math.PI * 3.1 + ph * 1.7) * amp * 0.25;
      g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 8) g.lineTo(x, top(x)); g.lineTo(W, H); g.closePath();
      g.fillStyle = lin(g, 0, base - amp, 0, base + H * 0.5, [[0, c1], [0.35, c0], [1, dark ? '#03050c' : '#f4f2ee']]);
      /* each band casts a soft shadow up onto the one behind it, so the layers read as depth */
      g.save(); g.shadowColor = dark ? 'rgba(0,0,0,.55)' : 'rgba(40,60,120,.18)'; g.shadowBlur = 46; g.shadowOffsetY = -10;
      g.globalAlpha = dark ? 0.94 : 0.92; g.fill(); g.restore(); g.globalAlpha = 1;
      g.beginPath(); for (let x = 0; x <= W; x += 8) { const y = top(x); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = dark ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.95)'; g.lineWidth = 2.2; g.stroke();
      g.strokeStyle = dark ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.35)'; g.lineWidth = 14; g.stroke();
    }
    grain(g, dark ? 6 : 5); return c;
  }
  /* Prism: bold diagonal shards of light, sharp edges, glass-like gradients */
  function prism(dark) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), r = rng(dark ? 11 : 13);
    g.fillStyle = dark ? '#05060d' : '#f5f4f1'; g.fillRect(0, 0, W, H);
    const cols = dark ? ['#1d4dff', '#7b3dff', '#00c2b8', '#ff3d8a', '#ffb02e', '#2aa7ff'] : ['#7fb0ff', '#b49bff', '#7fe3d4', '#ff9fc9', '#ffd08a', '#9fd3ff'];
    for (let k = 0; k < 26; k++) {
      const x = r() * W * 1.2 - W * 0.1, y = r() * H * 1.2 - H * 0.1, len = W * (0.25 + r() * 0.5), wid = H * (0.04 + r() * 0.16), ang = -0.62 + (r() - 0.5) * 0.25, col = cols[k % cols.length];
      g.save(); g.translate(x, y); g.rotate(ang);
      g.beginPath(); g.moveTo(-len / 2, -wid / 2); g.lineTo(len / 2, -wid / 2 + wid * 0.25 * (r() - 0.5)); g.lineTo(len / 2 - wid * 0.6, wid / 2); g.lineTo(-len / 2 + wid * 0.3, wid / 2); g.closePath();
      g.fillStyle = lin(g, -len / 2, 0, len / 2, 0, [[0, col + '00'], [0.35, col + (dark ? 'cc' : 'bb')], [0.7, col + (dark ? 'ee' : 'dd')], [1, col + '22']]); g.fill();
      g.strokeStyle = dark ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.9)'; g.lineWidth = 1.6; g.stroke(); g.restore();
    }
    grain(g, 5); return c;
  }
  /* Orbs: large overlapping rounded forms with crisp rims, lit from the top left */
  function orbs(dark) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), r = rng(dark ? 23 : 29);
    g.fillStyle = lin(g, 0, 0, W, H, dark ? [[0, '#050812'], [1, '#0b0718']] : [[0, '#f6f5f2'], [1, '#eef2f9']]); g.fillRect(0, 0, W, H);
    const cols = dark ? [['#2a63ff', '#0a1a66'], ['#9b4dff', '#2a0f66'], ['#14d1c0', '#04434a'], ['#ff4f9a', '#5a0f33'], ['#ffb347', '#5a3300']]
                      : [['#8fb8ff', '#d7e6ff'], ['#c2a8ff', '#ece4ff'], ['#86e6d8', '#dcf7f2'], ['#ffa8cd', '#ffe6f1'], ['#ffd29a', '#fff1dc']];
    for (let k = 0; k < 14; k++) {
      const x = r() * W, y = r() * H, rad = H * (0.12 + r() * 0.32), [c0, c1] = cols[k % cols.length];
      const gr = g.createRadialGradient(x - rad * 0.35, y - rad * 0.4, rad * 0.05, x, y, rad); gr.addColorStop(0, c0); gr.addColorStop(1, c1);
      g.globalAlpha = dark ? 0.9 : 0.85; g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = dark ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.95)'; g.lineWidth = 2; g.stroke();
      g.beginPath(); g.arc(x, y, rad * 0.93, Math.PI * 1.05, Math.PI * 1.55); g.strokeStyle = 'rgba(255,255,255,' + (dark ? '.35' : '.8') + ')'; g.lineWidth = rad * 0.035; g.lineCap = 'round'; g.stroke();
    }
    grain(g, 5); return c;
  }

  /* ---- the 2026-10-13 set: five more for Glass, each with crisp structure for a lens or a rim to bend ---- */
  function mix(a, b, t) { const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16)); return 'rgb(' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',') + ')'; }
  /* Aurora: curtains of light over a night (or dawn) sky, above layered ridges with lit edges */
  function aurora(dark) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), r = rng(dark ? 41 : 43);
    g.fillStyle = lin(g, 0, 0, 0, H, dark ? [[0, '#01030a'], [0.55, '#061433'], [1, '#0b2147']] : [[0, '#dfe4fb'], [0.55, '#f3e6f1'], [1, '#fde9dc']]); g.fillRect(0, 0, W, H);
    if (dark) for (let k = 0; k < 900; k++) { const x = r() * W, y = r() * H * 0.7, a = 0.15 + r() * 0.6; g.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')'; g.fillRect(x, y, r() < 0.08 ? 2 : 1, r() < 0.08 ? 2 : 1); }
    const curtains = dark ? [['#5dffc8', '#18c79a', '#8b5cff'], ['#7ae8ff', '#2b9bff', '#d35cff'], ['#a8ff9e', '#2fd08a', '#5c7cff']]
                          : [['#43d3b0', '#8fe8d4', '#c79bff'], ['#5fb8ff', '#a9d6ff', '#ff9fd0'], ['#7fdca0', '#c2f0d2', '#9aa8ff']];
    const lay = document.createElement('canvas'); lay.width = W; lay.height = H; const q = lay.getContext('2d');
    curtains.forEach(([edge, mid, top], k) => {
      const base = H * (0.42 + k * 0.07), ph = k * 1.9 + 0.4, amp = H * (0.07 + 0.02 * k);
      const yb = x => base + Math.sin(x / W * Math.PI * (1.6 + 0.3 * k) + ph) * amp + Math.sin(x / W * Math.PI * 5.3 + ph * 2) * amp * 0.22;
      for (let x = -20; x <= W + 20; x += 2) {
        const y0 = yb(x), ray = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(x / 5.3 + Math.sin(x / 37 + k) * 4)) * (0.5 + 0.5 * Math.sin(x / 13.7 + k * 2)), h = H * (0.18 + 0.16 * (0.5 + 0.5 * Math.sin(x / W * Math.PI * 7.1 + ph * 3))) * (0.7 + 0.3 * ray);
        const gr = q.createLinearGradient(0, y0, 0, y0 - h);
        gr.addColorStop(0, edge + (dark ? 'e6' : 'c0')); gr.addColorStop(0.12, mid + (dark ? '99' : '80')); gr.addColorStop(0.6, top + (dark ? '38' : '30')); gr.addColorStop(1, top + '00');
        q.globalAlpha = ray; q.fillStyle = gr; q.fillRect(x, y0 - h, 2.4, h); q.globalAlpha = 1;
      }
      q.save(); q.beginPath(); for (let x = 0; x <= W; x += 6) { const y = yb(x); x ? q.lineTo(x, y) : q.moveTo(x, y); }
      q.strokeStyle = dark ? 'rgba(220,255,240,.75)' : 'rgba(255,255,255,.95)'; q.lineWidth = 2; q.stroke(); q.restore();
    });
    g.save(); g.globalCompositeOperation = dark ? 'lighter' : 'source-over'; g.filter = 'blur(0.7px)'; g.drawImage(lay, 0, 0); g.restore();
    const ridges = dark ? ['#0a1838', '#081330', '#060d24', '#040918'] : ['#c9cfe8', '#b8c1e0', '#a5b0d6', '#93a0cc'];
    ridges.forEach((col, k) => {
      const base = H * (0.70 + k * 0.08), ph = k * 2.3 + 1.1;
      const yr = x => base - Math.abs(Math.sin(x / W * Math.PI * (2.2 + k * 0.7) + ph)) * H * (0.07 - k * 0.01) - Math.sin(x / W * Math.PI * 9 + ph) * H * 0.008;
      g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 6) g.lineTo(x, yr(x)); g.lineTo(W, H); g.closePath();
      g.fillStyle = lin(g, 0, base - H * 0.08, 0, H, [[0, col], [1, dark ? '#02040c' : mix('93a0cc', '6f7fb5', 0.5)]]); g.fill();
      g.beginPath(); for (let x = 0; x <= W; x += 6) { const y = yr(x); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = dark ? 'rgba(140,255,220,' + (0.5 - k * 0.1).toFixed(2) + ')' : 'rgba(255,255,255,' + (0.95 - k * 0.12).toFixed(2) + ')'; g.lineWidth = 1.8; g.stroke();
    });
    grain(g, dark ? 5 : 4); return c;
  }
  /* Dunes: layered dunes at sunset (dusk in the dark print), each crest a crisp lit line over its shadowed face */
  function dunes(dark) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = lin(g, 0, 0, 0, H * 0.62, dark ? [[0, '#0a0620'], [0.55, '#3b1446'], [0.85, '#a8325a'], [1, '#ff8a55']] : [[0, '#f6ecf4'], [0.5, '#fbe0d4'], [1, '#ffc49c']]); g.fillRect(0, 0, W, H);
    const sx = W * 0.68, sy = H * 0.5, sun = g.createRadialGradient(sx, sy, 0, sx, sy, H * 0.45);
    sun.addColorStop(0, dark ? 'rgba(255,214,150,.95)' : 'rgba(255,250,235,1)'); sun.addColorStop(0.08, dark ? 'rgba(255,170,110,.75)' : 'rgba(255,226,190,.9)'); sun.addColorStop(1, 'rgba(255,140,90,0)');
    g.fillStyle = sun; g.fillRect(0, 0, W, H);
    const layers = dark ? [['#5a1f4a', '#2a0d2c'], ['#6b2546', '#2c0e2a'], ['#7d2c3f', '#2a0c22'], ['#8d3a3a', '#260a1c'], ['#9b4a36', '#210818'], ['#a85a34', '#1a0612']]
                        : [['#f7c9b0', '#e8a98f'], ['#f5bb9c', '#df967b'], ['#f2ad8a', '#d5846a'], ['#eea079', '#c9735c'], ['#e9936b', '#bb6551'], ['#e3875f', '#ad5946']];
    layers.forEach(([lit, shade], k) => {
      const base = H * (0.5 + k * 0.085), ph = k * 1.7 + 0.3, amp = H * (0.05 + 0.012 * k), fr = 1.3 + 0.35 * k;
      const yc = x => base - amp * Math.sin(x / W * Math.PI * fr + ph) - amp * 0.35 * Math.sin(x / W * Math.PI * fr * 2.3 + ph * 1.3);
      g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 6) g.lineTo(x, yc(x)); g.lineTo(W, H); g.closePath();
      g.fillStyle = lin(g, 0, base - amp, 0, base + H * 0.25, [[0, lit], [0.18, mix(lit.slice(1), shade.slice(1), 0.45)], [1, shade]]);
      g.save(); g.shadowColor = dark ? 'rgba(0,0,0,.5)' : 'rgba(120,60,40,.18)'; g.shadowBlur = 40; g.shadowOffsetY = -8; g.fill(); g.restore();
      /* the lit face: a slanted wedge brighter on the sun's side of each crest */
      g.save(); g.clip(); g.globalCompositeOperation = dark ? 'lighter' : 'soft-light';
      g.fillStyle = lin(g, sx - W * 0.6, 0, sx + W * 0.3, 0, [[0, 'rgba(255,170,120,0)'], [0.75, dark ? 'rgba(255,150,100,.22)' : 'rgba(255,255,255,.35)'], [1, 'rgba(255,170,120,0)']]); g.fillRect(0, 0, W, H); g.restore();
      g.beginPath(); for (let x = 0; x <= W; x += 6) { const y = yc(x); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = dark ? 'rgba(255,200,160,.7)' : 'rgba(255,255,255,.95)'; g.lineWidth = 2; g.stroke();
    });
    grain(g, dark ? 6 : 5); return c;
  }
  /* Bloom: a fan of petals opening from the lower left, each a crisp-edged gradient leaf over the one behind it */
  function bloom(dark) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = lin(g, 0, H, W, 0, dark ? [[0, '#06030f'], [1, '#0d0a1f']] : [[0, '#fbf5f2'], [1, '#f1f0fb']]); g.fillRect(0, 0, W, H);
    const pal = dark ? [['#1b2a8a', '#5b7bff'], ['#3d1a8f', '#a46bff'], ['#6a137a', '#ff5fc8'], ['#8a1a3e', '#ff7a6b'], ['#8a4a10', '#ffbf5a'], ['#0e5a6e', '#3fe0d0']]
                     : [['#a9b9ff', '#e2e8ff'], ['#c7b0ff', '#efe6ff'], ['#ffaee0', '#ffe8f6'], ['#ffb3a8', '#fff0ea'], ['#ffd59a', '#fff4e0'], ['#9fe6dc', '#e6fbf7']];
    function fan(ox, oy, a0, a1, n, L0, shift) {
      for (let k = n - 1; k >= 0; k--) {
        const a = a0 + (k / (n - 1)) * (a1 - a0), len = L0 * (1 + 0.18 * Math.sin(k * 1.3 + shift)), wid = len * 0.19, [c0, c1] = pal[(k + shift) % pal.length];
        g.save(); g.translate(ox, oy); g.rotate(a);
        g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(len * 0.3, -wid, len * 0.85, -wid * 0.9, len, 0); g.bezierCurveTo(len * 0.85, wid * 0.9, len * 0.3, wid, 0, 0); g.closePath();
        const gr = g.createLinearGradient(0, 0, len, 0); gr.addColorStop(0, c0); gr.addColorStop(0.75, c1); gr.addColorStop(1, dark ? mix(c1.slice(1), 'ffffff', 0.35) : '#ffffff');
        g.shadowColor = dark ? 'rgba(0,0,0,.6)' : 'rgba(90,70,140,.16)'; g.shadowBlur = 50; g.fillStyle = gr; g.globalAlpha = dark ? 0.96 : 0.94; g.fill(); g.globalAlpha = 1; g.shadowBlur = 0;
        g.strokeStyle = dark ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.95)'; g.lineWidth = 2; g.stroke();
        g.beginPath(); g.moveTo(len * 0.12, 0); g.quadraticCurveTo(len * 0.6, -wid * 0.12, len * 0.96, 0); g.strokeStyle = dark ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.5)'; g.lineWidth = 3; g.stroke();
        g.restore();
      }
    }
    /* a glow behind the fan, so the open side is a lit field rather than an empty one */
    const gl = g.createRadialGradient(W * 0.22, H * 0.9, 0, W * 0.22, H * 0.9, W * 0.85); gl.addColorStop(0, dark ? 'rgba(120,80,255,.28)' : 'rgba(255,190,220,.45)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gl; g.fillRect(0, 0, W, H);
    fan(-W * 0.05, H * 1.06, -Math.PI * 0.47, 0.0, 13, H * 1.22, 0);
    grain(g, dark ? 5 : 4); return c;
  }
  /* Caustics: sunlight focused by a rippled water surface onto a pool floor: bright curved filaments with a soft
     glow, from the classic tileable water-caustic iteration (five warped sine passes) */
  function caustics(dark) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const lay = document.createElement('canvas'); lay.width = W; lay.height = H; const q = lay.getContext('2d'), im = q.createImageData(W, H), d = im.data;
    const TAU = 6.28318530718, time = 24.3, inten = 0.005, sc = TAU * 1.25 / H;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const px = ((x * sc) % TAU) - 250, py = ((y * sc) % TAU) - 250; let ix = px, iy = py, cc = 1;
      for (let n = 0; n < 5; n++) {
        const t = time * (1 - 3.5 / (n + 1)), nx = px + Math.cos(t - ix) + Math.sin(t + iy), ny = py + Math.sin(t - iy) + Math.cos(t + ix); ix = nx; iy = ny;
        cc += 1 / Math.hypot(px / (Math.sin(ix + t) / inten), py / (Math.cos(iy + t) / inten));
      }
      cc /= 5; cc = 1.17 - Math.pow(cc, 1.4); const v = Math.min(1, Math.pow(Math.abs(cc), 8));
      const o = (y * W + x) * 4; d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = Math.round(v * 255);
    }
    q.putImageData(im, 0, 0);
    g.fillStyle = lin(g, 0, 0, W * 0.25, H, dark ? [[0, '#02172b'], [0.6, '#043452'], [1, '#05496b']] : [[0, '#c9f3ff'], [0.6, '#8edcf2'], [1, '#62c3e3']]); g.fillRect(0, 0, W, H);
    /* light shafts from the top left */
    for (let k = 0; k < 7; k++) { const x0 = W * (-0.1 + k * 0.17); g.save(); g.globalAlpha = dark ? 0.06 : 0.12; g.fillStyle = lin(g, x0, 0, x0 + W * 0.3, H, [[0, '#ffffff'], [1, 'rgba(255,255,255,0)']]);
      g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + W * 0.06, 0); g.lineTo(x0 + W * 0.36, H); g.lineTo(x0 + W * 0.22, H); g.closePath(); g.fill(); g.restore(); }
    g.save(); g.filter = 'blur(6px)'; g.globalAlpha = dark ? 0.55 : 0.5; g.globalCompositeOperation = dark ? 'lighter' : 'screen'; g.drawImage(lay, 0, 0); g.restore();
    g.save(); g.globalAlpha = dark ? 0.9 : 0.95; g.drawImage(lay, 0, 0); g.restore();
    if (!dark) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.18; g.filter = 'blur(3px)'; g.drawImage(lay, 9, 14); g.restore(); }
    grain(g, dark ? 3 : 2); return c;
  }
  /* Facets: cut crystal: a jittered triangle mesh, every facet lit by its own tilt, with hairline edges */
  function facets(dark) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), r = rng(dark ? 71 : 73);
    const S = 200, cols = Math.ceil(W / S) + 2, rows = Math.ceil(H / S) + 2, P = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) P.push([(i - 0.5 + (r() - 0.5) * 0.8) * S, (j - 0.5 + (r() - 0.5) * 0.8) * S, r()]);
    const ramp = dark ? ['0b1a5c', '2a2a9e', '5a2ab0', '8a2a9a', '1a6aa0'] : ['dfe8ff', 'c9d6ff', 'e3d4ff', 'ffd9ef', 'd2f1ff'];
    function base(x, y) { const t = Math.max(0, Math.min(ramp.length - 1.001, (x / W * 0.65 + y / H * 0.35) * (ramp.length - 1))), i = Math.floor(t); return [ramp[i], ramp[i + 1], t - i]; }
    const L = [-0.45, -0.7, 0.55];
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
      const a = P[j * cols + i], b = P[j * cols + i + 1], cc = P[(j + 1) * cols + i], dd = P[(j + 1) * cols + i + 1];
      for (const tri of ((i + j) % 2 ? [[a, b, dd], [a, dd, cc]] : [[a, b, cc], [b, dd, cc]])) {
        const [p, q, s] = tri, hz = 140;
        const ux = q[0] - p[0], uy = q[1] - p[1], uz = (q[2] - p[2]) * hz, vx = s[0] - p[0], vy = s[1] - p[1], vz = (s[2] - p[2]) * hz;
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl; if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const lit = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), cx = (p[0] + q[0] + s[0]) / 3, cy = (p[1] + q[1] + s[1]) / 3, [c0, c1, t] = base(cx, cy);
        const col = mix(c0, c1, t), k = dark ? 0.35 + lit * 0.9 : 0.75 + lit * 0.32;
        const rgb = col.match(/\d+/g).map(Number).map(v => Math.max(0, Math.min(255, Math.round(v * k + (dark ? Math.pow(lit, 6) * 140 : Math.pow(lit, 6) * 40)))));
        g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.lineTo(s[0], s[1]); g.closePath();
        g.fillStyle = 'rgb(' + rgb.join(',') + ')'; g.fill();
        g.strokeStyle = dark ? 'rgba(200,220,255,' + (0.08 + lit * 0.18).toFixed(3) + ')' : 'rgba(255,255,255,' + (0.35 + lit * 0.4).toFixed(3) + ')'; g.lineWidth = 1.2; g.stroke();
      }
    }
    const v = g.createRadialGradient(W * 0.3, H * 0.25, H * 0.1, W * 0.5, H * 0.5, W * 0.75); v.addColorStop(0, 'rgba(255,255,255,' + (dark ? '0.06' : '0.25') + ')'); v.addColorStop(1, dark ? 'rgba(0,0,10,.45)' : 'rgba(255,255,255,0)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    grain(g, 1.5); return c;
  }
  const outp = {};
  for (const [name, fn] of [['ribbons', ribbons], ['prism', prism], ['orbs', orbs], ['aurora', aurora], ['dunes', dunes], ['bloom', bloom], ['pool', caustics], ['facets', facets]]) for (const dark of [true, false]) {
    if (only.length && !only.includes(name)) continue;
    const cv = fn(dark); outp[`${name}-${dark ? 'dark' : 'light'}`] = cv.toDataURL('image/webp', 0.84);
  }
  return outp;
}, only);
for (const [k, v] of Object.entries(res)) { writeFileSync(join(out, k + '.webp'), Buffer.from(v.split(',')[1], 'base64')); console.log(k, Math.round(v.length * 0.75 / 1024) + ' KB'); }
await b.close();
