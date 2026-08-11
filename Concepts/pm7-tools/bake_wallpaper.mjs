/* bake_wallpaper.mjs -- T16 glass wallpaper pre-bake (PM7 pipeline input).
 *
 * Renders the PMConcept glass cloudscape wallpapers (currently produced at
 * runtime by CSS gradients + filter: blur/saturate) to static WebP images,
 * so the PM7 build can remove the runtime wallpaper filter and the sky-drift
 * animation (JARED-APPROVED visual change; ONE backdrop-filter stays).
 *
 * Bakes 6 images (theme x layer), each staged as an ISOLATED html file that
 * embeds the exact glass CSS + #glass-bg markup extracted from the input
 * document, geometry untouched (inset overflow preserved so blur edge
 * sampling matches the live page), animations forced to none (the drift/float
 * keyframes are to-only, so t=0 == identity):
 *   mesh_light / mesh_dark          full mesh composition (base sky + billows)
 *   depth_base_light / depth_base_dark    depth container base sky only
 *   depth_billow_light / depth_billow_dark  far-parallax billows only (alpha)
 * All captures use omitBackground so the images carry exactly what #glass-bg
 * contributes (edge alpha fade from the blur included); PM7 composites them
 * over the live body background just like PM6 did.
 * The depth-mode cloud-puff floats (.pm6-gbg-shape) are NOT baked -- they
 * stay live CSS (build_pm7.py pre-saturates their colors numerically).
 *
 * Output: a JSON asset file consumed by build_pm7.py transform T16. The
 * reviewed copy is frozen at Concepts/pm7-tools/baked_wallpaper.json (derived
 * artifact -- regenerate with this script, never hand-edit).
 *
 * Usage:
 *   node bake_wallpaper.mjs --input <pre-T16 html> --stage-dir <scratch dir>
 *        --out <json path> --serve-url <http://127.0.0.1:8741/...> \
 *        --modules <dir containing node_modules with playwright-core>
 *   --serve-url must map to --stage-dir on the shared 8741 server.
 *
 * Size cap: 180KB total base64 across all 6 data URIs. Tiers (the design
 * memo named 1920 -> 1440 -> mesh-only; the ladder below extends resolution/
 * quality steps first because dropping depth from the bake would leave a
 * runtime wallpaper filter behind -- the whole point of T16 is zero of those.
 * The wallpapers are 14px-blurred cloud gradients under a further 34px
 * backdrop blur, so they tolerate aggressive lossy encoding):
 *   tier 1: 1920x1080 q0.75   tier 2: 1440x810 q0.75   tier 3: 1440x810 q0.6
 *   tier 4: 1280x720  q0.55   tier 5: 1120x630 q0.5    tier 6: 960x540 q0.5
 *   (if still over: abort -- mesh-only fallback is a build_pm7.py decision)
 */

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
}
for (const k of ['input', 'stage-dir', 'out', 'serve-url', 'modules']) {
  if (!args[k]) { console.error('missing --' + k); process.exit(2); }
}

const require2 = createRequire(join(args.modules, 'noop.js'));
const { chromium } = require2('playwright-core');

const CAP_BYTES = 180 * 1024;
const TIERS = [
  { w: 1920, h: 1080, q: 0.75 },
  { w: 1440, h: 810, q: 0.75 },
  { w: 1440, h: 810, q: 0.6 },
  { w: 1280, h: 720, q: 0.55 },
  { w: 1120, h: 630, q: 0.5 },
  { w: 960, h: 540, q: 0.5 },
];

/* ---- extract the glass CSS section + #glass-bg markup from the input ---- */
const doc = readFileSync(args.input, 'utf8');

const startAnchor = 'GLASS BACKGROUND STAGE';
const endAnchor = '/* --- Glassmorphic: LIQUID GLASS multi-layer panels --- */';
const ai = doc.indexOf(startAnchor);
if (ai === -1) { console.error('start anchor not found'); process.exit(1); }
const cssStart = doc.lastIndexOf('/* ==', ai);
const cssEnd = doc.indexOf(endAnchor, ai);
if (cssStart === -1 || cssEnd === -1) { console.error('css span not found'); process.exit(1); }
const glassCss = doc.slice(cssStart, cssEnd);

const mAnchor = '<div id="glass-bg" aria-hidden="true">';
const mi = doc.indexOf(mAnchor);
if (mi === -1 || doc.indexOf(mAnchor, mi + 1) !== -1) {
  console.error('#glass-bg markup anchor not unique'); process.exit(1);
}
const mEnd = doc.indexOf('\n', mi);
const glassMarkup = doc.slice(mi, mEnd).trim();

const glassSha = createHash('sha256')
  .update(glassCss + '\n' + glassMarkup, 'utf8').digest('hex');

/* ---- staging documents ---- */
const JOBS = [
  { key: 'mesh_light', theme: 'glass-light', mode: 'mesh', override: '' },
  { key: 'mesh_dark', theme: 'glass-dark', mode: 'mesh', override: '' },
  {
    key: 'depth_base_light', theme: 'glass-light', mode: 'depth',
    override: '#glass-bg .pm6-par-far, #glass-bg .pm6-par-near { display: none !important; }',
  },
  {
    key: 'depth_base_dark', theme: 'glass-dark', mode: 'depth',
    override: '#glass-bg .pm6-par-far, #glass-bg .pm6-par-near { display: none !important; }',
  },
  {
    key: 'depth_billow_light', theme: 'glass-light', mode: 'depth',
    override: '#glass-bg .pm6-gbg-depth { background: none !important; }\n' +
      '#glass-bg .pm6-gbg-shape, #glass-bg .pm6-par-near { display: none !important; }',
  },
  {
    key: 'depth_billow_dark', theme: 'glass-dark', mode: 'depth',
    override: '#glass-bg .pm6-gbg-depth { background: none !important; }\n' +
      '#glass-bg .pm6-gbg-shape, #glass-bg .pm6-par-near { display: none !important; }',
  },
];

function stageHtml(job) {
  return '<!doctype html>\n' +
    '<html data-theme="' + job.theme + '" data-glass-bg="' + job.mode + '">\n' +
    '<head><meta charset="utf-8"><style>\n' +
    'html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; }\n' +
    glassCss + '\n' +
    '* { animation: none !important; transition: none !important; }\n' +
    job.override + '\n' +
    '</style></head>\n' +
    '<body>' + glassMarkup + '</body>\n</html>\n';
}

mkdirSync(args['stage-dir'], { recursive: true });
for (const job of JOBS) {
  writeFileSync(join(args['stage-dir'], 'stage_' + job.key + '.html'), stageHtml(job));
}

/* ---- render + encode ---- */
const browser = await chromium.launch();

async function bakeTier(tier) {
  const ctx = await browser.newContext({
    viewport: { width: tier.w, height: tier.h },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const images = {};
  for (const job of JOBS) {
    const url = args['serve-url'].replace(/\/$/, '') + '/stage_' + job.key + '.html';
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(150);
    const png = await page.screenshot({ omitBackground: true, fullPage: false });
    const dataUri = await page.evaluate(async ({ b64, w, h, q }) => {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res; img.onerror = rej;
        img.src = 'data:image/png;base64,' + b64;
      });
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', q);
    }, { b64: png.toString('base64'), w: tier.w, h: tier.h, q: tier.q });
    if (!dataUri.startsWith('data:image/webp')) {
      throw new Error(job.key + ': WebP encode unavailable (' + dataUri.slice(0, 30) + ')');
    }
    images[job.key] = {
      data_uri: dataUri,
      bytes: dataUri.length,
      width: tier.w,
      height: tier.h,
      quality: tier.q,
    };
  }
  await ctx.close();
  return images;
}

let chosen = null;
let tierIdx = -1;
for (let i = 0; i < TIERS.length; i++) {
  const images = await bakeTier(TIERS[i]);
  const total = Object.values(images).reduce((a, x) => a + x.bytes, 0);
  console.error('tier ' + (i + 1) + ' (' + TIERS[i].w + 'x' + TIERS[i].h +
    ' q' + TIERS[i].q + '): total data-URI bytes = ' + total + '  [' +
    Object.entries(images).map(([k, v]) => k + '=' + v.bytes).join(' ') + ']');
  if (total <= CAP_BYTES) { chosen = images; tierIdx = i; break; }
}
await browser.close();

if (!chosen) {
  console.error('FATAL: all tiers exceed the ' + CAP_BYTES + '-byte cap; ' +
    'mesh-only fallback must be decided in build_pm7.py');
  process.exit(1);
}

const out = {
  generated: new Date().toISOString(),
  source_file: args.input,
  glass_section_sha256: glassSha,
  tier: tierIdx + 1,
  viewport: { width: TIERS[tierIdx].w, height: TIERS[tierIdx].h },
  quality: TIERS[tierIdx].q,
  cap_bytes: CAP_BYTES,
  total_data_uri_bytes: Object.values(chosen).reduce((a, x) => a + x.bytes, 0),
  images: chosen,
};
writeFileSync(args.out, JSON.stringify(out, null, 2));
console.error('wrote ' + args.out + ' (total ' + out.total_data_uri_bytes +
  ' bytes, tier ' + out.tier + ')');
