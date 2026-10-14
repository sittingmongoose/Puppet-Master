/* walls.mjs: draws the all-look wallpapers and every catalog entry's thumbnails (pm7-wallpapers, Opus 5.5, 2026-10-13).
 *
 *   node tools/walls.mjs [--cdp <endpoint>] [--only id,id] [--no-walls] [--no-thumbs] [--sheet <file.png>] [--manifest <file.json>]
 *
 * The art is tools/art.js, drawn on a canvas in Chrome from fixed seeds: 2560x1440 WebP, quality 0.84 (lossless for
 * the pixel-art Retro set), into src/walls/<id>-<dark|light>.webp. Thumbnails (320x180, quality 0.8) are made for every
 * entry in catalog.d, Glass's included, into src/thumbs/; the Settings gallery shows those instead of decoding the full
 * images. --cdp reuses a browser you already run (Nas1 caps browsers); without it a headless Chrome is started and
 * closed. --sheet writes a labelled contact sheet for review; keep it outside the repository.
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(process.env.PW_REQUIRE_FROM || '/home/sittingmongoose/pmt-dev/pw/noop.js');
const { chromium } = require('playwright-core');

const argv = process.argv.slice(2), opt = { only: [], walls: true, thumbs: true };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--cdp') opt.cdp = argv[++i]; else if (a === '--only') opt.only = argv[++i].split(',').filter(Boolean);
  else if (a === '--no-walls') opt.walls = false; else if (a === '--no-thumbs') opt.thumbs = false;
  else if (a === '--sheet') opt.sheet = resolve(argv[++i]); else if (a === '--manifest') opt.manifest = resolve(argv[++i]);
  else { console.error('unknown argument ' + a); process.exit(2); }
}
const catalog = readdirSync(join(PKG, 'catalog.d')).filter(f => /^\d+-[a-z]+\.json$/.test(f)).sort()
  .map(f => JSON.parse(readFileSync(join(PKG, 'catalog.d', f), 'utf8')));
const sha = b => createHash('sha256').update(b).digest('hex');
const written = [];
function write(rel, b64) { const p = join(PKG, rel), buf = Buffer.from(b64, 'base64'); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, buf); written.push({ path: rel, bytes: buf.length, sha256: sha(buf) }); console.log(rel, buf.length, 'B'); }

let browser, page, launched = false;
if (opt.cdp) { browser = await chromium.connectOverCDP(opt.cdp); page = await browser.contexts()[0].newPage(); }
else { browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true }); launched = true; page = await browser.newPage(); }
try {
  await page.goto('about:blank');
  await page.addScriptTag({ content: readFileSync(join(PKG, 'tools', 'art.js'), 'utf8') });
  const chrome = await page.evaluate(() => navigator.userAgent);
  if (opt.walls) {
    const ids = await page.evaluate(() => WPK_ART.ids);
    for (const id of ids) {
      if (opt.only.length && !opt.only.includes(id)) continue;
      for (const mode of ['dark', 'light']) {
        const b64 = await page.evaluate(([id, mode]) => {
          const c = WPK_ART.draw(id, mode === 'dark'), lossless = !!WPK_ART.lossless[id];
          return c.toDataURL('image/webp', lossless ? 1 : 0.84).split(',')[1];
        }, [id, mode]);
        write(`src/walls/${id}-${mode}.webp`, b64);
      }
    }
  }
  if (opt.thumbs || opt.sheet) {
    const thumbs = [];
    for (const frag of catalog) for (const w of frag.wallpapers) for (const mode of ['dark', 'light']) {
      if (opt.only.length && !opt.only.includes(w.id)) continue;
      const src = readFileSync(join(PKG, w.files[mode])).toString('base64');
      const b64 = await page.evaluate(async src => {
        const im = new Image(); im.src = 'data:image/webp;base64,' + src; await im.decode();
        /* halve until close, then one high-quality step: a clean small image without shimmer */
        let cur = im, w = im.naturalWidth, h = im.naturalHeight;
        while (w / 2 >= 640) { const c = document.createElement('canvas'); c.width = Math.round(w / 2); c.height = Math.round(h / 2); const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, c.width, c.height); cur = c; w = c.width; h = c.height; }
        const t = document.createElement('canvas'); t.width = 320; t.height = 180; const g = t.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, 320, 180);
        return t.toDataURL('image/webp', 0.8).split(',')[1];
      }, src);
      if (opt.thumbs) write(`src/thumbs/${w.id}-${mode}.webp`, b64);
      thumbs.push({ id: w.id, name: w.name, family: frag.label, mode, b64 });
    }
    if (opt.sheet) {
      const png = await page.evaluate(thumbs => new Promise(async done => {
        const cols = 10, cw = 320, ch = 180, lab = 26, c = document.createElement('canvas'); c.width = cols * (cw + 8) + 8; c.height = Math.ceil(thumbs.length / cols) * (ch + lab + 8) + 8;
        const g = c.getContext('2d'); g.fillStyle = '#777'; g.fillRect(0, 0, c.width, c.height); g.font = '15px Inter, system-ui, sans-serif';
        for (let i = 0; i < thumbs.length; i++) {
          const t = thumbs[i], im = new Image(); im.src = 'data:image/webp;base64,' + t.b64; await im.decode();
          const x = 8 + (i % cols) * (cw + 8), y = 8 + Math.floor(i / cols) * (ch + lab + 8);
          g.drawImage(im, x, y); g.fillStyle = '#fff'; g.fillText(`${t.name} (${t.family}, ${t.mode})`, x + 2, y + ch + 18);
        }
        done(c.toDataURL('image/png').split(',')[1]);
      }), thumbs);
      writeFileSync(opt.sheet, Buffer.from(png, 'base64')); console.log('sheet', opt.sheet);
    }
  }
  const manifest = { generator: 'Concepts/wallpapers/opus-5.5/tools/walls.mjs', art_sha256: sha(readFileSync(join(PKG, 'tools', 'art.js'))), chrome, files: written };
  if (opt.manifest) writeFileSync(opt.manifest, JSON.stringify(manifest, null, 1) + '\n');
} finally {
  if (launched) await browser.close(); else { await page.close(); await browser.close(); }
}
