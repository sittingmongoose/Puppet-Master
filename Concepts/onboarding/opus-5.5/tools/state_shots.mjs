/* Photographs states the explorer reached, each restored from graph.json exactly as the crawl saw it (the same
 * secret-free session record resume uses), so a finding such as "text runs past the pane on nas-signin" can be looked at
 * in every theme and window size instead of only in the state the crawler happened to reach first.
 *   node tools/state_shots.mjs <graph.json> <out-dir> [--screens nas-signin,review] [--where "S.nas && S.nas.self"]
 *        [--limit 3] [--themes basic-dark,retro-light] [--size 1440x900,390x844] [--scenario <from report.json>]
 * --where is a JavaScript expression over the saved session S. Writes <screen>--<n>--<theme>--<WxH>.png, and
 * states.json with each shot's state key, click path length and the text that runs past the pane (with its rectangles). */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = resolve(here, '../../../TestOpus5.5PmConcept.html');
const argv = process.argv.slice(2);
const graphPath = resolve(argv[0]);
const out = resolve(argv[1] && !argv[1].startsWith('--') ? argv[1] : '/tmp/o55/state-shots');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const reportPath = join(dirname(graphPath), 'report.json');
const scenario = opt('scenario', existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')).scenario : 'fresh');
const screens = opt('screens', '').split(',').filter(Boolean);
const where = opt('where', '');
const limit = Number(opt('limit', '3'));
const themes = opt('themes', 'basic-dark').split(',');
const sizes = opt('size', '1440x900').split(',').map((s) => s.split('x').map(Number));
mkdirSync(out, { recursive: true });

const g = JSON.parse(readFileSync(graphPath, 'utf8'));
const test = where ? new Function('S', `try { return !!(${where}); } catch (_) { return false; }`) : () => true;
const picked = [];
const perScreen = new Map();
for (const st of g.states) {
  if (!st.sess || (screens.length && !screens.includes(st.screen))) continue;
  if (!test(JSON.parse(st.sess))) continue;
  const n = perScreen.get(st.screen) || 0;
  if (n >= limit) continue;
  perScreen.set(st.screen, n + 1);
  picked.push(Object.assign({ n }, st));
}

/* text that runs past the pane, with its rectangle (decorative art may be clipped on purpose; words never should be) */
const SPILL = `(() => {
  const layer = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)');
  const pane = document.querySelector('#pm-o55-onboarding .o55-pane'); if (!layer || !pane) return [];
  const pr = pane.getBoundingClientRect();
  const hasText = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  return [...layer.querySelectorAll('*')].filter((e) => !(e instanceof SVGElement) && e.getClientRects().length && hasText(e)).map((e) => {
    const r = e.getBoundingClientRect(); return { el: (e.className || e.tagName) + '', text: e.textContent.trim().slice(0, 60), left: Math.round(r.left - pr.left), right: Math.round(r.right - pr.right), width: Math.round(r.width) };
  }).filter((x) => x.width > 2 && (x.right > 3 || x.left < -3));
})()`;

const shots = [];
for (const [w, h] of sizes) {
  for (const theme of themes) {
    const [fam, mode] = theme.split('-');
    const { page, close } = await launch({ width: w, height: h });
    try {
      await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
      for (const st of picked) {
        await page.goto(pathToFileURL(PAGE).href + '?o55=off&o55scenario=' + encodeURIComponent(scenario));
        for (let i = 0; i < 40; i++) { if (await page.evaluate(() => !!(window.O55 && window.O55.ui && window.O55.ui.open && window.PM_THEME))) break; await sleep(150); }
        await page.evaluate((s, f, m) => {
          window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false });
          const o = JSON.parse(s); o.status = 'closed'; localStorage.setItem('pm.o55.onboarding.v1', JSON.stringify(o)); window.O55.ui.open({});
        }, st.sess, fam, mode);
        await sleep(1900);
        const rect = await page.evaluate(() => { const e = document.querySelector('#pm-o55-onboarding .o55-win'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
        const spill = await page.evaluate(SPILL);
        const file = join(out, `${st.screen}--${st.n}--${theme}--${w}x${h}.png`);
        const pad = 12;
        await page.screenshot(file, rect ? { clip: { x: Math.max(0, rect.x - pad), y: Math.max(0, rect.y - pad), width: Math.min(w, rect.width + pad * 2), height: Math.min(h, rect.height + pad * 2) } } : {});
        shots.push({ file, screen: st.screen, key: st.key, depth: st.depth, theme, size: `${w}x${h}`, spill });
      }
      if (page.errors.length) shots.push({ errors: page.errors.slice(0, 20), theme, size: `${w}x${h}` });
    } finally { await close(); }
  }
}
writeFileSync(join(out, 'states.json'), JSON.stringify({ graph: graphPath, scenario, shots }, null, 1));
console.log(JSON.stringify({ states: picked.length, shots: shots.filter((s) => s.file).length, withSpill: shots.filter((s) => s.spill && s.spill.length).map((s) => `${s.screen}#${s.theme}@${s.size}: ${s.spill.map((x) => x.text).join(' | ')}`) }, null, 1));
