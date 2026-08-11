/* capture.mjs — panel-protosKimi verification matrix.
 *
 * Two passes over the harness (Concepts/panel-protosKimi/index.html):
 *   1. OVERFLOW SWEEP: every panel x variant x theme x width, switching state
 *      in-page (no reload). Fails on: console errors, any element protruding
 *      past the panel slot's right edge, or horizontal scrollers inside the
 *      panel (except the intentional rail-tab strip).
 *   2. SCREENSHOTS: every variant at 4 widths on the default theme
 *      (42 x 4 = 168) + every family x theme on the widest/narrowest width
 *      for the most complex panel (6 x 8 x 2 = 96) into verify/shots/.
 *
 * Usage:
 *   node capture.mjs --modules <dir-with-node_modules> [--shots-only|--sweep-only]
 * Example:
 *   node capture.mjs --modules /var/folders/.../ppk-verify
 */
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const modDir = args[args.indexOf('--modules') + 1] || '.';
const shotsOnly = args.includes('--shots-only');
const sweepOnly = args.includes('--sweep-only');
const require2 = createRequire(join(modDir, 'index.js'));
const { chromium } = require2('playwright');

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE = pathToFileURL(join(HERE, '..', 'index.html')).href;
const SHOTS = join(HERE, 'shots');

const PANELS = ['search', 'source', 'actions', 'docker', 'tests', 'agents', 'artifacts'];
const VARIANTS = [1, 2, 3, 4, 5, 6];
const THEMES = ['friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'basic-dark', 'basic-light'];
const WIDTHS = [200, 240, 320, 480];
const COMPLEX_PANEL = 'source';

const OVERFLOW_JS = `(() => {
  const slot = document.getElementById('ppSlot');
  const sr = slot.getBoundingClientRect();
  const clippedByAncestor = (el) => {
    // true when some ancestor with non-visible overflow clips the element
    // at or inside the slot's right edge (measured rects can exceed the slot
    // while being visually clipped - not a real overflow failure)
    let a = el.parentElement;
    while (a && a !== slot) {
      const o = getComputedStyle(a).overflowX;
      if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') {
        const ar = a.getBoundingClientRect();
        if (ar.right <= sr.right + 0.5) return true;
      }
      a = a.parentElement;
    }
    return false;
  };
  const bad = [];
  const it = document.evaluate('.//*', slot, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0; i < it.snapshotLength; i++) {
    const el = it.snapshotItem(i);
    if (!(el instanceof HTMLElement)) continue;
    if (el.closest('.pp-menu')) continue;              // menus portal-positioned, checked separately
    if (el.closest('.rt-strip')) continue;             // intentional horizontal scroller (clipped)
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > sr.right + 0.5 && !clippedByAncestor(el)) {
      bad.push(el.tagName + '.' + String(el.className).split(' ')[0] + ' right=' + Math.round(r.right));
      if (bad.length > 4) break;
    }
    if (el.scrollWidth > el.clientWidth + 1 && !/(pp-scroll|rt-strip|pp-abar)/.test(el.className)) {
      const cs = getComputedStyle(el);
      if (cs.overflowX !== 'hidden' && el.children.length) {
        bad.push('HSCROLL ' + el.tagName + '.' + String(el.className).split(' ')[0]);
        if (bad.length > 4) break;
      }
    }
  }
  return bad;
})()`;

async function setState(page, panel, variant, theme, width, density) {
  await page.evaluate(([p, v, t, w, d]) => {
    window.__ppSetPanel(p);
    window.__ppSetVariant(p, v);
    window.__ppSetTheme(t);
    window.__ppSetWidth(w);
    window.__ppSetDensity(d || 'demo');
  }, [panel, variant, theme, width, density]);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

const run = async () => {
  mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })).newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR ' + e.message));
  await page.goto(PAGE, { waitUntil: 'load' });
  await page.waitForFunction(() => window.PanelProtos && document.querySelector('.pp-panel'));

  const failures = [];
  let sweepCount = 0;

  if (!shotsOnly) {
    for (const theme of THEMES) {
      for (const panel of PANELS) {
        for (const v of VARIANTS) {
          for (const w of WIDTHS) {
            await setState(page, panel, v, theme, w);
            sweepCount++;
            const bad = await page.evaluate(OVERFLOW_JS);
            if (bad.length) failures.push({ theme, panel, v, w, bad });
          }
      } }
    }
    // crowded sweep: spacing-extreme themes x narrow widths, all variants
    for (const theme of ['friendly-dark', 'retro-dark', 'basic-light']) {
      for (const panel of PANELS) {
        for (const v of VARIANTS) {
          for (const w of [200, 240, 320]) {
            await setState(page, panel, v, theme, w, 'crowded');
            sweepCount++;
            const bad = await page.evaluate(OVERFLOW_JS);
            if (bad.length) failures.push({ theme, panel, v, w, density: 'crowded', bad });
          }
      } }
    }
    await setState(page, 'search', 1, 'friendly-dark', 320, 'demo');
  }

  if (!sweepOnly) {
    // full variant matrix at default theme
    for (const panel of PANELS) {
      for (const v of VARIANTS) {
        for (const w of WIDTHS) {
          await setState(page, panel, v, 'friendly-dark', w);
          await page.screenshot({ path: join(SHOTS, `${panel}-v${v}-w${w}.png`), clip: { x: 0, y: 40, width: 48 + w + 6, height: 759 } });
        }
      }
    }
    // every family x theme on the most complex panel, narrowest + widest
    for (const theme of THEMES) {
      for (const v of VARIANTS) {
        for (const w of [200, 480]) {
          await setState(page, COMPLEX_PANEL, v, theme, w);
          await page.screenshot({ path: join(SHOTS, `theme-${theme}-v${v}-w${w}.png`), clip: { x: 0, y: 40, width: 48 + w + 6, height: 759 } });
        }
      }
    }
    // crowded shots: every variant at 240 on the default theme
    for (const panel of PANELS) {
      for (const v of VARIANTS) {
        await setState(page, panel, v, 'friendly-dark', 240, 'crowded');
        await page.screenshot({ path: join(SHOTS, `crowded-${panel}-v${v}.png`), clip: { x: 0, y: 40, width: 48 + 240 + 6, height: 759 } });
      }
    }
    await setState(page, 'search', 1, 'friendly-dark', 320, 'demo');
  }

  await browser.close();
  const report = { sweepCount, consoleErrors, failures, shotsDir: SHOTS };
  writeFileSync(join(HERE, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`sweep: ${sweepCount} states | overflow failures: ${failures.length} | console errors: ${consoleErrors.length}`);
  if (failures.length) { console.log(JSON.stringify(failures.slice(0, 20), null, 2)); process.exitCode = 1; }
  if (consoleErrors.length) { console.log(consoleErrors.slice(0, 10)); process.exitCode = 1; }
};
run().catch(e => { console.error(e); process.exit(1); });
