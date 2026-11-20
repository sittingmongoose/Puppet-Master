import { installPrewarmProbe, prewarmSnapshot } from './still-prewarm.mjs';
import { toggleCost } from './still-toggle-cost.mjs';
import { join } from 'node:path';

// The control's verdict: the real third prewarm step ran once, forced, between the toggle's mark and its first recalc
// (exported for tools/still-toggle-recalc.selftest.mjs)
export const forcedInToggle = (recalc, forcedMark, probe) => !!recalc?.found && !!forcedMark && recalc.markTs <= forcedMark[1] && forcedMark[1] <= recalc.recalcTs &&
 probe.forced.length === 1 && probe.forced[0].stage === 3 && probe.errors.length === 0;

export async function forcedPrewarm(t, { count = 1, settle = 40000, after = 3000, traceDir, CENSUS, MARKER, trace } = {}) {
 const rows = [];
 let px = 0;
 for (let i = 0; i < count; i++) {
  const f = await t.app.open({ query: `pm-warm=0&pm-still=${after}` });
  if (!(await f.evaluate(() => !!window.PM_STILL))) { t.log('PREWARM control unavailable: this page has no still-page toggle (negative-control build)'); break; }
  await f.evaluate(() => document.fonts.ready.then(() => true));
  await t.page.waitForTimeout(settle);
  await f.evaluate(MARKER);
  await f.evaluate(installPrewarmProbe, { park: true });
  await f.evaluate(() => { window.__stillPrewarm.label = 'friendly-dark'; });
  await t.app.look('friendly-dark');
  await f.evaluate(() => PM_PAGES.go('usage'));
  let parked = false;
  try { await f.waitForFunction(() => !!window.__stillPrewarm.parked, null, { timeout: 45000, polling: 100 }); parked = true; }
  catch (e) { t.log(`PREWARM control ${i}: no actual third callback parked: ${e.message}`); }
  const cdp = await t.page.context().newCDPSession(t.page);
  try {
   if (!parked) { await t.check(`prewarm control ${i}: actual third callback available`, false, JSON.stringify(await f.evaluate(prewarmSnapshot))); continue; }
   await t.page.mouse.move(1914, 900 + (++px % 6) * 8);
   const start = Date.now();
   await f.evaluate(CENSUS);
   await t.page.waitForTimeout(Math.max(0, after - 400 - (Date.now() - start)));
   // the trace lasts until the page has gone still and 300 ms more (PM7PERF-PREWARM-CONTROL-NULL: on a loaded host a
   // toggle that comes late must not fall outside a fixed 1.2 s trace); the wait polls an attribute on a timer, no rAF
   const x = await trace(cdp, { ms: 1200, url: f.url(), keep: traceDir ? join(traceDir, `forced-${i}.json.gz`) : null,
    during: async () => {
     await f.evaluate(() => { window.__stillPrewarm.forceOnStill = true; });
     await f.waitForFunction(() => document.documentElement.hasAttribute('data-pm-still'), null, { timeout: 8000, polling: 50 }).catch(() => {});
     await t.page.waitForTimeout(300);
    } });
   const recalc = x.after('pm-still:on', 'pm-still:on');
   const population = await f.evaluate(() => window.__stillTogglePopulation);
   const probe = await f.evaluate(prewarmSnapshot);
   const forcedMark = Object.entries(x.marks).find(([name]) => name.startsWith('pm-still:prewarm:forced:'));
   const row = { sample: i, restyled: recalc?.found ? recalc.first : null, H: population?.marks,
    recalc, forcedMark, probe, cost: toggleCost(recalc?.found ? recalc.first : null, population?.marks), judged: false };
   rows.push(row); t.log(`PREWARM FORCED CONTROL: ${JSON.stringify(row)}`);
   await t.check(`prewarm control ${i}: actual step three runs between the toggle mark and its recalc`, forcedInToggle(recalc, forcedMark, probe),
    `R=${row.restyled}, H=${row.H}${!recalc ? '; no still mark in the trace' : !recalc.found ? '; no recalc after the mark' : `; recalc ${recalc.delayMs} ms after the mark`}${!forcedMark ? '; no forced-step mark' : recalc ? `, forced step ${Math.round((forcedMark[1] - recalc.markTs) / 100) / 10} ms after it` : ''}; logged control, cost not judged`);
  } finally {
   await f.evaluate(() => window.__stillPrewarm?.dispose());
   await cdp.detach();
  }
 }
 return rows;
}

