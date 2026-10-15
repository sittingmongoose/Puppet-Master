/* nier_prints.mjs: the NieR family's prints and thumbnails, drawn from NieR Mode's own scenes (pm7-liquid-glass for the
 * wallpapers package, 2026-10-14, Jared #11: "replace them with the ones that are in the nier customizer").
 *
 *   node tools/nier_prints.mjs [--cdp <endpoint>] [--only city,park]
 *
 * The source of truth is Concepts/onboarding/opus-5.5/src/settings/nier/scenes/<key>.svg, the six line-art scenes NieR
 * Mode's background shows (City Ruins, The Bunker, Desert, Forest Castle, Amusement Park, Flooded City), so the gallery
 * and NieR's customizer can never drift apart. Each print is drawn the way NieR's scene layer draws it
 * (styles.d/16-nier-scenes.css): the paper ground, the scene "xMidYMax slice" across the lower 60 %, in the ink at 15 %
 * (light) or 20 % (dark), strokes kept at their drawn width (non-scaling, as in the layer), the knockout shapes (class
 * k) in the paper colour, and the paper fading in over the scene's upper part. So a NieR wallpaper chosen in the gallery
 * looks like the same scene chosen in NieR's own customizer. Prints: 2560x1440 WebP, quality 0.84, into
 * src/walls/<key>-<dark|light>.webp. Thumbnails: 320x180, quality 0.8, into src/thumbs/, drawn in full ink like the
 * customizer's own scene tiles so they read at gallery size. Paper and ink come from styles.d/13-nier.css.
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCENES = resolve(PKG, '..', '..', 'onboarding', 'opus-5.5', 'src', 'settings', 'nier', 'scenes');
const require = createRequire(process.env.PW_REQUIRE_FROM || '/home/sittingmongoose/pmt-dev/pw/noop.js');
const { chromium } = require('playwright-core');

const KEYS = ['city', 'bunker', 'desert', 'forest', 'park', 'flooded'];
/* styles.d/13-nier.css: --background (paper) and --o55-nier-ink for each mode; the scene layer's ink alpha */
const PALETTE = { light: { paper: '#ccc8b1', ink: '#211f1b', alpha: 0.15 }, dark: { paper: '#2f2d26', ink: '#d1cdb7', alpha: 0.20 } };
const W = 2560, H = 1440, TW = 320, TH = 180;

const argv = process.argv.slice(2), opt = { only: [] };
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--cdp') opt.cdp = argv[++i]; else if (argv[i] === '--only') opt.only = argv[++i].split(',').filter(Boolean);
  else { console.error('unknown argument ' + argv[i]); process.exit(2); }
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const written = [];
function write(rel, b64) {
  const p = join(PKG, rel), buf = Buffer.from(b64, 'base64'); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, buf);
  written.push({ path: rel, bytes: buf.length, sha256: sha(buf) });
}
/* the scene as a standalone SVG of the given box: ink for currentColor, paper for the knockouts, strokes non-scaling */
function sceneSvg(src, w, h, ink, paper) {
  const body = src.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 1600 560" preserveAspectRatio="xMidYMax slice" ` +
    `fill="none" stroke="${ink}" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" color="${ink}">` +
    `<style>path,rect,circle,ellipse,line,polyline,polygon{vector-effect:non-scaling-stroke}.k{fill:${paper}}</style>${body}</svg>`;
}

let browser, page, launched = false;
if (opt.cdp) { browser = await chromium.connectOverCDP(opt.cdp); page = await browser.contexts()[0].newPage(); }
else { browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true }); launched = true; page = await browser.newPage(); }
try {
  await page.goto('about:blank');
  for (const key of KEYS) {
    if (opt.only.length && !opt.only.includes(key)) continue;
    const src = readFileSync(join(SCENES, key + '.svg'), 'utf8');
    for (const mode of ['dark', 'light']) {
      const P = PALETTE[mode];
      const art = sceneSvg(src, W, Math.round(H * 0.6), P.ink, P.paper), thumbArt = sceneSvg(src, TW, Math.round(TH * 0.78), P.ink, P.paper);
      const [print, thumb] = await page.evaluate(async ([art, thumbArt, P, W, H, TW, TH]) => {
        const load = (svg) => new Promise((ok, bad) => { const im = new Image(); im.onload = () => ok(im); im.onerror = bad; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
        const a = await load(art), t = await load(thumbArt);
        const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
        g.fillStyle = P.paper; g.fillRect(0, 0, W, H);
        g.globalAlpha = P.alpha; g.drawImage(a, 0, H - a.height); g.globalAlpha = 1;
        /* the layer's fade: paper over the top 74 %, opaque to 54 % of it, clear at its foot */
        const f = g.createLinearGradient(0, 0, 0, H * 0.74);
        const rgb = P.paper.match(/\w\w/g).map((x) => parseInt(x, 16)).join(',');
        f.addColorStop(0, `rgba(${rgb},1)`); f.addColorStop(0.54, `rgba(${rgb},1)`); f.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = f; g.fillRect(0, 0, W, H * 0.74);
        const tc = document.createElement('canvas'); tc.width = TW; tc.height = TH; const tg = tc.getContext('2d');
        tg.fillStyle = P.paper; tg.fillRect(0, 0, TW, TH); tg.globalAlpha = 0.85; tg.drawImage(t, 0, TH - t.height);
        return [c.toDataURL('image/webp', 0.84).split(',')[1], tc.toDataURL('image/webp', 0.8).split(',')[1]];
      }, [art, thumbArt, P, W, H, TW, TH]);
      write(`src/walls/${key}-${mode}.webp`, print);
      write(`src/thumbs/${key}-${mode}.webp`, thumb);
    }
  }
  console.log(JSON.stringify({ chrome: await page.evaluate(() => navigator.userAgent), written }, null, 1));
} finally { if (launched) await browser.close(); else await page.close(); }
