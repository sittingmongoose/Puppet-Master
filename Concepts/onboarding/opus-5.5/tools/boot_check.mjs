/* Boot check: load the base and the built concept, compare console errors and load timing, and confirm the
 * strip/patch results live in the page.  Usage: node tools/boot_check.mjs <out-dir> [themes=basic-dark,...]
 * Writes boot.json and a screenshot per page/theme into <out-dir> (never into the repository). */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const concepts = resolve(here, '../../..');
const out = resolve(process.argv[2] || '/tmp/o55-boot');
const themes = (process.argv[3] || 'basic-dark').split(',');
mkdirSync(out, { recursive: true });

const pages = { base: join(concepts, 'TestPMConcept.html'), built: join(concepts, 'TestOpus5.5PmConcept.html') };
const report = {};
for (const [name, file] of Object.entries(pages)) {
  const { page, close } = await launch({ width: 1600, height: 1000 });
  try {
    await page.addInitScript(() => { try { localStorage.setItem('pm.o55.boot-check', '1'); } catch {} });
    const t0 = Date.now();
    await page.goto(pathToFileURL(file).href + '?o55=off');
    const loadMs = Date.now() - t0;
    await sleep(2500);
    const facts = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      return {
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd || 0),
        loadMs: Math.round(nav.loadEventEnd || 0),
        oldOnboarding: !!document.getElementById('pm7-onboarding'),
        oldTour: !!document.getElementById('pm7-guided-tour'),
        settingsTransfer: !!(window.PM12_KIMI && window.PM12_KIMI.o55SettingsTransfer),
        layoutRestore: !!(window.PM_HOME_WORKSPACE && typeof window.PM_HOME_WORKSPACE.o55RestoreSnapshot === 'function'),
        hasO55: !!window.O55,
        theme: document.documentElement.getAttribute('data-theme'),
        teacherPersona: (document.documentElement.innerHTML.match(/'Teacher'\]/) || []).length > 0,
        bytes: document.documentElement.outerHTML.length
      };
    });
    const shots = [];
    for (const theme of themes) {
      await page.evaluate(t => { const [f, m] = t.split('-'); window.PM_THEME && window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME && window.PM_THEME.setMode(m, { persist: false }); }, theme);
      await sleep(700);
      const shot = join(out, `${name}-${theme}.png`);
      await page.screenshot(shot);
      shots.push(shot);
    }
    report[name] = { file, wallLoadMs: loadMs, ...facts, errors: page.errors.slice(0, 40), errorCount: page.errors.length, shots };
  } finally { await close(); }
}
writeFileSync(join(out, 'boot.json'), JSON.stringify(report, null, 2));
const b = report.base, n = report.built;
const newErrors = n.errors.filter(e => !b.errors.includes(e));
console.log(JSON.stringify({
  base: { dcl: b.domContentLoadedMs, load: b.loadMs, errors: b.errorCount },
  built: { dcl: n.domContentLoadedMs, load: n.loadMs, errors: n.errorCount, oldOnboarding: n.oldOnboarding, oldTour: n.oldTour,
           settingsTransfer: n.settingsTransfer, layoutRestore: n.layoutRestore, hasO55: n.hasO55 },
  newErrors
}, null, 1));
