/* Settled screenshots of onboarding screens across themes and window sizes, cropped to the onboarding window.
 * Usage: node tools/shots.mjs <out-dir> [--screens welcome,look,where] [--themes basic-dark,friendly-light]
 *        [--size 1440x900] [--scenario fresh] [--settle 1600] [--full]
 * Each screen is reached through O55.ui.go on one live page per theme (the same path a person clicks), so the shot
 * shows the real session state. Writes <screen>--<theme>--<WxH>.png and shots.json (errors, rects) into <out-dir>. */
import { launch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const page_ = resolve(here, '../../../TestOpus5.5PmConcept.html');
const argv = process.argv.slice(2);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/o55/shots');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const flag = (k) => argv.includes('--' + k);
const screens = opt('screens', 'welcome,look,where').split(',');
const themes = opt('themes', 'basic-dark,basic-light,friendly-dark,friendly-light,glass-dark,glass-light,retro-dark,retro-light').split(',');
const sizes = opt('size', '1440x900').split(',').map((s) => s.split('x').map(Number));
const scenario = opt('scenario', 'fresh');
const settle = Number(opt('settle', '1700'));
const actions = opt('actions', ''); // "screen:action:arg;..." run before the shot of that screen
mkdirSync(out, { recursive: true });

const report = { page: page_, shots: [], errors: [] };
for (const [w, h] of sizes) {
  for (const theme of themes) {
    const { page, close } = await launch({ width: w, height: h });
    try {
      const [fam, mode] = theme.split('-');
      await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
      await page.goto(pathToFileURL(page_).href + `?o55=off&o55scenario=${encodeURIComponent(scenario)}`);
      await sleep(1200);
      await page.evaluate((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); }, fam, mode);
      await sleep(300);
      await page.evaluate(() => { localStorage.removeItem('pm.o55.onboarding.v1'); window.O55.ui.open({ fresh: true }); });
      for (const sc of screens) {
        await page.evaluate((id) => { if (window.O55.S.sess.screen !== id) window.O55.ui.go(id, { silent: true }); }, sc);
        for (const a of actions.split(';').filter(Boolean)) {
          const [s2, act, arg] = a.split(':');
          if (s2 !== sc) continue;
          await sleep(700);
          await page.evaluate((act2, arg2) => { const d = window.O55.screens.defs[window.O55.S.sess.screen]; const el = document.querySelector(`[data-o55-do="${act2}"]${arg2 ? `[data-arg="${arg2}"]` : ''}`); if (el) el.click(); else d.do[act2](window.O55.S, arg2, null); }, act, arg || '');
        }
        await sleep(settle);
        const rect = await page.evaluate(() => { const r = document.querySelector('#pm-o55-onboarding .o55-win').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
        const file = join(out, `${sc}--${theme}--${w}x${h}.png`);
        const pad = 16;
        await page.screenshot(file, flag('full') ? {} : { clip: { x: Math.max(0, rect.x - pad), y: Math.max(0, rect.y - pad), width: Math.min(w, rect.width + pad * 2), height: Math.min(h, rect.height + pad * 2) } });
        report.shots.push({ screen: sc, theme, size: `${w}x${h}`, file, rect });
      }
      report.errors.push(...page.errors.map((e) => `${theme} ${w}x${h}: ${e}`));
    } finally { await close(); }
  }
}
writeFileSync(join(out, 'shots.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ shots: report.shots.length, errors: report.errors.slice(0, 30), errorCount: report.errors.length }, null, 1));
