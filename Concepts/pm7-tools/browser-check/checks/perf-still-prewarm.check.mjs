// Attribution experiment: force the actual closed-over first-drag callback, then measure 30 toggles after its cache
// is consumed. Forced restyle counts are logged controls, never compared with the toggle-cost bound.
import { CENSUS, MARKER, trace } from './perf-still-page.check.mjs';
import { installPrewarmProbe, prewarmSnapshot } from '../helpers/still-prewarm.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';
import { toggleCost } from '../helpers/still-toggle-cost.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { forcedPrewarm } from '../helpers/still-prewarm-control.mjs';


export default async function (t) {
 await t.viewport(1920, 1080); await muteSound(t.page);
 const after = 3000, settle = Number(t.args.settle ?? 40000);
 const traceDir = t.args.traceDir ? String(t.args.traceDir) : null;
 const forced = await forcedPrewarm(t, { count: Number(t.args.forced ?? 5), settle, after, traceDir, CENSUS, MARKER, trace });
 const rows = [], observations = [];
 const f = await t.app.open({ query: `pm-warm=0&pm-still=${after}` });
 await f.evaluate(() => document.fonts.ready.then(() => true)); await t.page.waitForTimeout(settle);
 await f.evaluate(MARKER); await f.evaluate(installPrewarmProbe, { park: false });
 await f.evaluate(() => { window.__stillPrewarm.label = 'friendly-dark'; });
 await t.app.look('friendly-dark'); await f.evaluate(() => PM_PAGES.go('usage'));
 await f.waitForFunction(() => window.__stillPrewarm.runs.some((r) => r.usage && r.complete), null, { timeout: 45000, polling: 100 });
 observations.push({ phase: 'naturally completed', probe: await f.evaluate(prewarmSnapshot) });
 const cdp = await t.page.context().newCDPSession(t.page); let px = 0;
 const move = () => t.page.mouse.move(1914, 480 + (++px % 6) * 24);
 const record = (phase, x, H) => {
  const r = x.after(`pm-still:${phase}`, `pm-still:${phase}`);
  const row = { phase, R: r?.found ? r.first : null, H, recalc: r };
  row.cost = toggleCost(row.R, H); rows.push(row); return row;
 };
 try {
  for (let i = 0; i < Number(t.args.cycles ?? 15); i++) {
   await move(); const start = Date.now(); await f.evaluate(CENSUS);
   await t.page.waitForTimeout(Math.max(0, after - 400 - (Date.now() - start)));
   const on = await trace(cdp, { ms: 1200, url: f.url(), keep: traceDir ? join(traceDir, `prevented-${i}-on.json.gz`) : null });
   const population = await f.evaluate(() => window.__stillTogglePopulation);
   const a = record('on', on, population?.marks); t.log(`PREWARM PREVENTED: ${JSON.stringify(a)}`);
   await t.check(`prewarm consumed ${i} on: toggle within 3H+19`, a.cost.pass, JSON.stringify(a));
   const held = await f.evaluate(CENSUS);
   const off = await trace(cdp, { ms: 900, url: f.url(), during: async () => { await t.page.waitForTimeout(150); await move(); },
    keep: traceDir ? join(traceDir, `prevented-${i}-off.json.gz`) : null });
   const b = record('off', off, held.marks); t.log(`PREWARM PREVENTED: ${JSON.stringify(b)}`);
   await t.check(`prewarm consumed ${i} off: toggle within 3H+19`, b.cost.pass, JSON.stringify(b));
  }
  await t.page.waitForTimeout(12000);
  observations.push({ phase: '30 toggles plus 12 seconds resting', probe: await f.evaluate(prewarmSnapshot) });
  await f.evaluate(() => PM_PAGES.go('dashboard')); await t.page.waitForTimeout(1500);
  await f.evaluate(() => PM_PAGES.go('usage')); await t.page.waitForTimeout(5000);
  observations.push({ phase: 'same-look Usage revisit', probe: await f.evaluate(prewarmSnapshot) });
  const usageRuns = observations.map((x) => x.probe.runs.filter((r) => r.usage).length);
  await t.check('prewarm runs once for this look, not per idle interval or Usage revisit', usageRuns.every((n) => n === 1), JSON.stringify(observations));

  // One cheap invalidation-category trace of the Settings wake. Raw evidence is retained; do not infer element
  // identities from a count alone or add a style read before the measured recalc.
  await t.app.look('glass-light'); await f.evaluate(() => PM_PAGES.go('settings')); await move();
  await t.page.waitForTimeout(after + 1500); const settings = await f.evaluate(CENSUS);
  const diagnostic = await trace(cdp, { ms: 900, url: f.url(), track: true,
   keep: traceDir ? join(traceDir, 'settings-wake-invalidation.json.gz') : null,
   during: async () => { await t.page.waitForTimeout(150); await move(); } });
  const settingsRow = { H: settings.marks, recalc: diagnostic.after('pm-still:off', 'pm-still:off') };
  t.log(`SETTINGS WAKE INVALIDATION: ${JSON.stringify(settingsRow)}`);
  if (t.args.out) { mkdirSync(dirname(String(t.args.out)), { recursive: true }); writeFileSync(String(t.args.out), JSON.stringify({ forced, rows, observations, settings: settingsRow }, null, 2)); }
 } finally { await f.evaluate(() => window.__stillPrewarm?.dispose()); await cdp.detach(); }
}
