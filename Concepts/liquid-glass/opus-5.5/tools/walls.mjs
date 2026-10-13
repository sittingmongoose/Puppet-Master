/* walls.mjs <outdir> : crisp wallpapers for the glass to refract (2560x1440, WebP), drawn in headless Chrome */
import { createRequire } from 'node:module'; import { writeFileSync, mkdirSync } from 'node:fs'; import { join } from 'node:path';
const require = createRequire('/home/sittingmongoose/pmt-dev/pw/noop.js'); const { chromium } = require('playwright-core');
const out = process.argv[2]; mkdirSync(out, { recursive: true });   /* writes <name>-<dark|light>.webp; the concept reads src/walls/ */
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true }); const p = await b.newPage(); await p.goto('about:blank');
const res = await p.evaluate(() => {
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
  const outp = {};
  for (const [name, fn] of [['ribbons', ribbons], ['prism', prism], ['orbs', orbs]]) for (const dark of [true, false]) {
    const cv = fn(dark); outp[`${name}-${dark ? 'dark' : 'light'}`] = cv.toDataURL('image/webp', 0.84);
  }
  return outp;
});
for (const [k, v] of Object.entries(res)) { writeFileSync(join(out, k + '.webp'), Buffer.from(v.split(',')[1], 'base64')); console.log(k, Math.round(v.length * 0.75 / 1024) + ' KB'); }
await b.close();
