/* bake.mjs - bakes the Liquid Glass wallpapers ("Tide" dark, "Pearl" light) to WebP data URIs.
 *
 *   node bake.mjs <out.json> [--png <dir>]      (headless Chrome on file:, nothing leaves the machine)
 *
 * Two images per look, both already blurred (F3-427: no runtime wallpaper blur):
 *   wall   what #glass-bg shows: the art, softened
 *   frost  the wall as seen through the shell slab (34 px blur, saturate 160 %, at 1920 px scale), painted directly into
 *          the slab on the CPU path so a still frame matches the GPU's live backdrop blur, and sampled by the lens
 * The art is drawn on a 1280x720 canvas (scaled to the window), dithered before encoding so the WebP does not band.
 * Size cap: 180 KB of data URIs in all, as T16's bake.
 */
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire('/home/sittingmongoose/pmt-dev/pw/noop.js');
const { chromium } = require('playwright-core');
const out = process.argv[2];
const pngDir = process.argv.includes('--png') ? process.argv[process.argv.indexOf('--png') + 1] : null;
if (!out) { console.error('usage: bake.mjs <out.json> [--png dir]'); process.exit(2); }

const ART = {
  /* Tide: deep ink with cobalt, teal and violet light pools and one luminous ribbon for the glass to catch */
  dark: {
    base: [[0, '#05070F'], [0.5, '#0A1022'], [1, '#0E1733']],
    pools: [
      [0.20, 0.26, 0.58, 'rgba(38, 92, 255, .92)'],
      [0.80, 0.84, 0.52, 'rgba(0, 186, 170, .78)'],
      [0.90, 0.10, 0.40, 'rgba(124, 74, 255, .80)'],
      [0.06, 0.94, 0.24, 'rgba(255, 78, 128, .50)'],
      [0.52, 0.52, 0.30, 'rgba(30, 60, 160, .35)'],
    ],
    ribbons: [
      { p: [[-0.06, 0.80], [0.30, 0.52], [0.62, 0.50], [1.06, 0.16]], w: 0.13, blur: 46,
        stops: [[0, 'rgba(90, 200, 255, .00)'], [0.25, 'rgba(110, 210, 255, .50)'], [0.55, 'rgba(225, 240, 255, .52)'], [0.85, 'rgba(165, 135, 255, .46)'], [1, 'rgba(165, 135, 255, 0)']] },
      { p: [[-0.06, 0.80], [0.30, 0.52], [0.62, 0.50], [1.06, 0.16]], w: 0.018, blur: 10,
        stops: [[0, 'rgba(255,255,255,0)'], [0.35, 'rgba(225, 245, 255, .55)'], [0.6, 'rgba(255, 255, 255, .62)'], [0.9, 'rgba(210, 195, 255, .40)'], [1, 'rgba(255,255,255,0)']] },
      { p: [[-0.04, 1.02], [0.36, 0.78], [0.70, 0.80], [1.06, 0.50]], w: 0.06, blur: 34,
        stops: [[0, 'rgba(0, 200, 190, 0)'], [0.4, 'rgba(60, 220, 210, .30)'], [0.8, 'rgba(90, 150, 255, .26)'], [1, 'rgba(90,150,255,0)']] },
    ],
    vignette: 'rgba(2, 3, 8, .55)',
  },
  /* Pearl: pearl white with sky, mint, lilac and peach light and one bright ribbon */
  light: {
    base: [[0, '#F3F5FA'], [0.55, '#EDF0F7'], [1, '#F6F1EE']],
    pools: [
      [0.18, 0.24, 0.60, 'rgba(112, 172, 255, .62)'],
      [0.82, 0.84, 0.52, 'rgba(96, 214, 192, .50)'],
      [0.90, 0.08, 0.42, 'rgba(176, 150, 255, .52)'],
      [0.05, 0.96, 0.30, 'rgba(255, 170, 130, .50)'],
    ],
    ribbons: [
      { p: [[-0.06, 0.80], [0.30, 0.52], [0.62, 0.50], [1.06, 0.16]], w: 0.14, blur: 46,
        stops: [[0, 'rgba(255,255,255,0)'], [0.3, 'rgba(255, 255, 255, .78)'], [0.6, 'rgba(255, 255, 255, .85)'], [0.9, 'rgba(240, 236, 255, .60)'], [1, 'rgba(255,255,255,0)']] },
      { p: [[-0.06, 0.80], [0.30, 0.52], [0.62, 0.50], [1.06, 0.16]], w: 0.03, blur: 12,
        stops: [[0, 'rgba(120,180,255,0)'], [0.4, 'rgba(120, 185, 255, .40)'], [0.7, 'rgba(160, 140, 255, .34)'], [1, 'rgba(160,140,255,0)']] },
      { p: [[-0.04, 1.02], [0.36, 0.78], [0.70, 0.80], [1.06, 0.50]], w: 0.07, blur: 34,
        stops: [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255, 255, 255, .55)'], [1, 'rgba(255,255,255,0)']] },
    ],
    vignette: 'rgba(170, 180, 205, .28)',
  },
};

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage();
await page.goto('about:blank');
const W = 1280, H = 720, SCALE = W / 1920;
const result = await page.evaluate(async ({ ART, W, H, SCALE }) => {
  function draw(art) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const lg = g.createLinearGradient(0, 0, W * 0.35, H); art.base.forEach(([o, col]) => lg.addColorStop(o, col));
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    g.filter = `blur(${Math.round(60 * SCALE * 1.5)}px)`;
    for (const [x, y, r, col] of art.pools) {
      const rg = g.createRadialGradient(x * W, y * H, 0, x * W, y * H, r * W);
      rg.addColorStop(0, col); rg.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
      g.fillStyle = rg; g.fillRect(-W * 0.2, -H * 0.2, W * 1.4, H * 1.4);
    }
    for (const rb of art.ribbons) {
      g.filter = `blur(${Math.round(rb.blur * SCALE * 1.5)}px)`;
      const [a, b, cc, d] = rb.p.map(([x, y]) => [x * W, y * H]);
      const grad = g.createLinearGradient(a[0], a[1], d[0], d[1]); rb.stops.forEach(([o, col]) => grad.addColorStop(o, col));
      g.strokeStyle = grad; g.lineWidth = rb.w * H; g.lineCap = 'round';
      g.beginPath(); g.moveTo(...a); g.bezierCurveTo(...b, ...cc, ...d); g.stroke();
    }
    g.filter = 'none';
    const vg = g.createRadialGradient(W * 0.5, H * 0.45, H * 0.35, W * 0.5, H * 0.5, W * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, art.vignette); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    return c;
  }
  function frost(src) {   /* the live slab: blur(34px) saturate(160%) at window scale */
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const pad = 80; g.filter = `blur(${(34 * SCALE).toFixed(1)}px) saturate(160%)`;
    g.drawImage(src, -pad, -pad, W + 2 * pad, H + 2 * pad); g.filter = 'none';
    g.filter = `blur(${(34 * SCALE).toFixed(1)}px) saturate(160%)`; g.drawImage(src, 0, 0); g.filter = 'none';
    return c;
  }
  function dither(c, amt) {
    const g = c.getContext('2d'); const im = g.getImageData(0, 0, W, H); const d = im.data; let s = 1234567;
    for (let i = 0; i < d.length; i += 4) { s = (s * 1103515245 + 12345) & 0x7fffffff; const n = ((s >> 8) % 1000) / 1000 - 0.5;
      d[i] = Math.max(0, Math.min(255, d[i] + n * amt)); d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n * amt)); d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * amt)); }
    g.putImageData(im, 0, 0); return c;
  }
  const out = {};
  for (const look of ['dark', 'light']) {
    const wall = draw(ART[look]);
    const fr = frost(wall);
    for (const [name, cv] of [['wall', wall], ['frost', fr]]) {
      dither(cv, look === 'dark' ? 5 : 4);
      let q = 0.62, uri;
      for (; q >= 0.3; q -= 0.04) { uri = cv.toDataURL('image/webp', q); if (uri.length < 44000) break; }
      out[`${name}_${look}`] = { data_uri: uri, bytes: uri.length, q: +q.toFixed(2), png: cv.toDataURL('image/png') };
    }
  }
  return out;
}, { ART, W, H, SCALE });
await browser.close();
const json = { generated: new Date().toISOString(), size: [W, H], images: {} };
let total = 0;
for (const [k, v] of Object.entries(result)) {
  json.images[k] = { data_uri: v.data_uri, bytes: v.bytes, quality: v.q }; total += v.bytes;
  if (pngDir) { mkdirSync(pngDir, { recursive: true }); writeFileSync(join(pngDir, k + '.png'), Buffer.from(v.png.split(',')[1], 'base64')); }
}
json.total_data_uri_bytes = total;
if (total > 180 * 1024) { console.error('over the 180 KB cap:', total); process.exit(1); }
writeFileSync(out, JSON.stringify(json, null, 1));
console.log('baked', Object.entries(json.images).map(([k, v]) => `${k} ${v.bytes}B q${v.quality}`).join(', '), 'total', total);
