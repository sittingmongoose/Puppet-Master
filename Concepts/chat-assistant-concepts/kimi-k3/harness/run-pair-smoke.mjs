/* Pair smoke: boot all 64 window×thread pairings; run the fast layout probes.
   Usage: node harness/run-pair-smoke.mjs [--driver=cdp] [--subset=w1:t1,w2:t2] */
import { startServer, launchDriver, openHost, writeResults, WINDOWS, THREADS } from './fixtures.mjs';
import { noHorizontalOverflow, noConsoleErrors, noEmoji, noUnderscoredLabels, scrollbarNoLeak, noTextClipping } from './probes.mjs';

const driverName = (process.argv.find((a) => a.startsWith('--driver=')) || '--driver=cdp').split('=')[1];
const subsetArg = process.argv.find((a) => a.startsWith('--subset='));
const pairs = subsetArg
  ? subsetArg.split('=')[1].split(',').map((s) => s.split(':'))
  : WINDOWS.flatMap((w) => THREADS.map((t) => [w, t]));

const server = await startServer();
const driver = await launchDriver(driverName);
const results = [];
let failed = 0;
try {
  for (const [w, t] of pairs) {
    const ctx = { window: w, thread: t, width: 750, theme: 'friendly-dark', server };
    let page = null;
    const rec = { pair: w + ':' + t, probes: {} };
    try {
      page = await openHost(driver, ctx);
      for (const [name, fn] of [['noHorizontalOverflow', noHorizontalOverflow], ['noConsoleErrors', noConsoleErrors],
        ['noEmoji', noEmoji], ['noUnderscoredLabels', noUnderscoredLabels], ['scrollbarNoLeak', scrollbarNoLeak], ['noTextClipping', noTextClipping]]) {
        const r = await fn(page, ctx);
        rec.probes[name] = r.pass ? 'pass' : 'FAIL: ' + r.detail;
      }
    } catch (e) {
      rec.probes.boot = 'FAIL: ' + e.message.slice(0, 120);
    }
    const bad = Object.values(rec.probes).filter((v) => String(v).startsWith('FAIL')).length;
    if (bad) failed++;
    rec.result = bad ? 'FAIL' : 'pass';
    results.push(rec);
    console.log((bad ? 'FAIL' : 'pass') + ' ' + rec.pair + (bad ? ' ' + JSON.stringify(rec.probes).slice(0, 220) : ''));
    if (page) await page.close().catch(() => {});
  }
} finally {
  await driver.close();
  server.proc.kill();
}
const file = writeResults('pair-smoke', 'results', { total: results.length, failed, results });
console.log('pair-smoke: ' + (results.length - failed) + '/' + results.length + ' pass — ' + file);
process.exit(failed ? 1 : 0);
