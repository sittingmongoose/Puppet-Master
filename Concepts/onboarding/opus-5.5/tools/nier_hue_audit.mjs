/* NieR Mode hue audit: photographs the main views with NieR Mode on (light and dark) and flags every pixel whose colour
 * is clearly outside NieR: Automata's ink and parchment: saturated (chroma >= 50 of 255) outside the error hue
 * (350-25 degrees, blends included) and the warning / olive hues (36-72 degrees), and cool greys and blues (chroma >= 18, hue 150-330),
 * which parchment never has. Flagged pixels are gathered in 24 px cells; for each cell the element under it and the
 * computed property that paints that colour are named, so a report line points at a rule, not at a pixel.
 * Deliberately left, and counted apart as `left`: swatches that show a real choice (a look tile or swatch carrying its
 * own data-theme, the accent swatches, the title-bar theme chips) and the concept's own demo pill.
 * Usage: node tools/nier_hue_audit.mjs <out-dir> [--modes light,dark] [--views dashboard,chat,...] [--family retro]
 *        [--shots] [--min 12]
 * Writes <out-dir>/hue-audit.json (per view: flagged pixel counts and the offending elements, largest first) and, with
 * --shots, one PNG per view (scratch: delete when done). Chrome profiles live under <out-dir> and are removed. */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = resolve(here, '../../../TestOpus5.5PmConcept.html');
const argv = process.argv.slice(2);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : 'nier-hue-audit');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const modes = opt('modes', 'light,dark').split(',');
const family = opt('family', 'retro');
const minCell = Number(opt('min', '12'));
const shots = argv.includes('--shots');
mkdirSync(out, { recursive: true });

/* each view: how to get there from the dashboard, and how long to let it settle */
const VIEWS = {
  dashboard: async (p) => { await p.evaluate(() => window.PM_PAGES.go('dashboard')); },
  chat: async (p) => { await p.evaluate(() => window.PM_PAGES.go('chat')); },
  wizard: async (p) => { await p.evaluate(() => window.PM_PAGES.go('wizard')); },
  usage: async (p) => { await p.evaluate(() => window.PM_PAGES.go('usage')); },
  projects: async (p) => { await p.evaluate(() => window.PM_PAGES.go('projects')); },
  orchestrator: async (p) => { await p.evaluate(() => window.PM_PAGES.go('orchestrator')); },
  'settings-home': async (p) => { await p.evaluate(() => { window.PM_PAGES.go('settings'); }); await sleep(500); await p.evaluate(() => { const b = document.querySelector('#panel-settings [data-action="home"]'); if (b) b.click(); }); },
  'settings-look': async (p) => { await p.evaluate(() => window.PM_PAGES.go('settings')); await sleep(500); await p.evaluate(() => window.PM51.go('general', 'app-input')); },
  'settings-providers': async (p) => { await p.evaluate(() => window.PM_PAGES.go('settings')); await sleep(500); await p.evaluate(() => window.PM51.go('ai', 'providers')); },
  'settings-sounds': async (p) => { await p.evaluate(() => window.PM_PAGES.go('settings')); await sleep(500); await p.evaluate(() => window.PM51.go('general', 'notifications')); },
  onboarding: async (p) => { await p.evaluate(() => { window.PM_PAGES.go('dashboard'); localStorage.removeItem('pm.o55.onboarding.v1'); window.O55.ui.open({ fresh: true }); }); await sleep(2200); await p.evaluate(() => window.O55.ui.go('look', { silent: true })); },
  tour: async (p) => { await p.evaluate(() => { if (window.O55.S && window.O55.S.open) window.O55.ui.close('done'); localStorage.removeItem('pm.o55.tour.v1'); window.PM_PAGES.go('dashboard'); window.O55.tour.start({ fresh: true }); }); await sleep(2600); }
};
const views = opt('views', Object.keys(VIEWS).join(',')).split(',');

function analyse() {
  /* runs in the page, on window.__shot (the decoded screenshot) */
  const s = window.__shot, W = s.w, H = s.h, d = s.d, CELL = 24;
  const hueOf = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), c = mx - mn; if (!c) return [0, 0]; let h = mx === r ? ((g - b) / c) % 6 : mx === g ? (b - r) / c + 2 : (r - g) / c + 4; h *= 60; if (h < 0) h += 360; return [h, c]; };
  const kind = (r, g, b) => { const [h, c] = hueOf(r, g, b); if (c >= 50 && !(h <= 25 || h >= 350 || (h >= 36 && h <= 72))) return 'saturated'; if (c >= 18 && h >= 150 && h <= 330) return 'cool'; return null; };
  const cells = new Map(); let sat = 0, cool = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, k = kind(d[i], d[i + 1], d[i + 2]); if (!k) continue;
    if (k === 'saturated') sat++; else cool++;
    const key = ((y / CELL) | 0) * 10000 + ((x / CELL) | 0);
    const c = cells.get(key) || { n: 0, x, y, kind: k, rgb: [d[i], d[i + 1], d[i + 2]] }; c.n++; if (k === 'saturated') c.kind = 'saturated'; cells.set(key, c);
  }
  const near = (css, rgb) => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(css || ''); if (!m || (m[4] !== undefined && +m[4] === 0)) return 999; return Math.abs(m[1] - rgb[0]) + Math.abs(m[2] - rgb[1]) + Math.abs(m[3] - rgb[2]) + (m[4] !== undefined && +m[4] < 1 ? 40 : 0); };
  const sig = (el) => { const bits = []; for (let e = el, n = 0; e && e.nodeType === 1 && n < 3; e = e.parentElement, n++) bits.unshift(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '')); return bits.join(' > '); };
  const PROPS = ['color', 'background-color', 'border-top-color', 'border-left-color', 'outline-color', 'fill', 'stroke', 'box-shadow', 'background-image', 'text-decoration-color', 'caret-color'];
  const found = new Map(); let left = 0;
  const LEFT = '.o55-swatches, .pm6-tt-chip, .pm6-tt-family, #o55-demo';
  for (const c of cells.values()) {
    if (c.n < window.__minCell) continue;
    const el = document.elementFromPoint(c.x, c.y); if (!el) continue;
    const own = el.closest('[data-theme]');
    if ((own && own !== document.documentElement) || el.closest(LEFT)) { left += c.n; continue; }
    let who = null, prop = null, val = null, best = 999;
    for (let e = el, n = 0; e && e.nodeType === 1 && n < 6; e = e.parentElement, n++) {
      const cs = getComputedStyle(e);
      for (const p of PROPS) { const v = cs.getPropertyValue(p); const dd = p === 'box-shadow' || p === 'background-image' ? (/(rgba?\([^)]*\))/.test(v) ? Math.min(...(v.match(/rgba?\([^)]*\)/g) || []).map((x) => near(x, c.rgb))) : 999) : near(v, c.rgb); if (dd < best) { best = dd; who = e; prop = p; val = v.slice(0, 120); } }
      if (best < 24) break;
    }
    const key = (who ? sig(who) : sig(el)) + ' | ' + (best < 90 ? prop + ': ' + val : 'unmatched (image, gradient or canvas)');
    const f = found.get(key) || { where: who ? sig(who) : sig(el), paint: best < 90 ? prop + ': ' + val : 'unmatched', kind: c.kind, px: 0, cells: 0, sample: '#' + c.rgb.map((v) => v.toString(16).padStart(2, '0')).join(''), at: [c.x, c.y] };
    f.px += c.n; f.cells++; if (c.kind === 'saturated') f.kind = 'saturated'; found.set(key, f);
  }
  return { saturated: sat, cool, left, offenders: [...found.values()].sort((a, b) => (a.kind === b.kind ? b.px - a.px : a.kind === 'saturated' ? -1 : 1)) };
}

const report = { page: PAGE, family, modes: {}, when: new Date().toISOString() };
for (const mode of modes) {
  /* grayscale text antialiasing: LCD subpixel fringes are not colours any rule paints */
  const { page, close } = await launch({ width: 1440, height: 900, profile: join(out, `profile-${process.pid}-${mode}`), args: ['--disable-lcd-text'] });
  report.modes[mode] = {};
  try {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
    await page.goto(pathToFileURL(PAGE).href + '?o55=off');
    await page.waitFor(() => window.PM_NIER && window.PM7_SETTINGS_TOME && document.readyState === 'complete', { timeout: 30000 });
    await sleep(1500);
    await page.evaluate((f, m, min) => { window.__minCell = min; window.PM7_SETTINGS_TOME.setChromeThemeFamily(f); window.PM7_SETTINGS_TOME.setChromeThemeMode(m); window.PM_NIER.set(true); }, family, mode, minCell);
    await sleep(1200);
    for (const v of views) {
      if (!VIEWS[v]) { report.modes[mode][v] = { error: 'unknown view' }; continue; }
      try {
        await VIEWS[v](page); await sleep(1400);
        await page.evaluate(() => document.fonts.ready);
        const png = await page.screenshot(shots ? join(out, `${v}--nier-${mode}.png`) : undefined);
        await page.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); window.__shot = { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data }; }, png.toString('base64'));
        report.modes[mode][v] = await page.evaluate(analyse);
        report.modes[mode][v].theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') + (document.documentElement.getAttribute('data-o55-nier') ? ' +nier' : ''));
      } catch (e) { report.modes[mode][v] = { error: String(e.message || e).slice(0, 300) }; }
    }
    report.modes[mode].errors = page.errors.slice(0, 20);
  } finally { await close(); }
}
writeFileSync(join(out, 'hue-audit.json'), JSON.stringify(report, null, 1));
for (const [mode, vs] of Object.entries(report.modes)) for (const [v, r] of Object.entries(vs)) {
  if (v === 'errors') { if (r.length) console.log(mode, 'page errors:', r.length); continue; }
  if (r.error) { console.log(`${mode.padEnd(5)} ${v.padEnd(18)} ERROR ${r.error}`); continue; }
  const rest = r.offenders.reduce((n, o) => n + o.px, 0);
  console.log(`${mode.padEnd(5)} ${v.padEnd(18)} saturated ${String(r.saturated).padStart(7)}  cool ${String(r.cool).padStart(7)}  left ${String(r.left).padStart(6)}  offending px ${String(rest).padStart(6)} in ${r.offenders.length}`);
}
