/* Matrix sweep: 8 themes × 4 widths × rail open/closed × 22 representative
   pairings (≥1408 configs). Fast layout probes only.
   Usage: node harness/run-matrix.mjs [--driver=cdp] [--pairings=N] */
import { startServer, launchDriver, openHost, writeResults, THEMES, WIDTHS, WINDOWS, THREADS } from './fixtures.mjs';
import { noHorizontalOverflow, noConsoleErrors, noEmoji, scrollbarNoLeak, noTextClipping } from './probes.mjs';

const driverName = (process.argv.find((a) => a.startsWith('--driver=')) || '--driver=cdp').split('=')[1];
const pairCount = Number((process.argv.find((a) => a.startsWith('--pairings=')) || '=22').split('=')[1]);
// 22 representative pairings: every window × 2-3 threads, every thread ≥2 windows
const ALL = WINDOWS.flatMap((w) => THREADS.map((t) => [w, t]));
const PAIRINGS = ALL.filter((_, i) => i % 3 === 0).slice(0, pairCount);
while (PAIRINGS.length < pairCount) PAIRINGS.push(ALL[PAIRINGS.length]);

const server = await startServer();
const driver = await launchDriver(driverName);
let total = 0, failed = 0;
const failures = [];
try {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      for (const rail of [true, false]) {
        for (const [w, t] of PAIRINGS) {
          total++;
          const ctx = { window: w, thread: t, width, theme, rail, server };
          let page = null;
          try {
            page = await openHost(driver, ctx);
            for (const [name, fn] of [['overflow', noHorizontalOverflow], ['errors', noConsoleErrors], ['emoji', noEmoji], ['xleak', scrollbarNoLeak], ['clip', noTextClipping]]) {
              const r = await fn(page, ctx);
              if (!r.pass) {
                failed++;
                failures.push({ theme, width, rail, pair: w + ':' + t, probe: name, detail: r.detail.slice(0, 140) });
              }
            }
          } catch (e) {
            failed++;
            failures.push({ theme, width, rail, pair: w + ':' + t, probe: 'boot', detail: e.message.slice(0, 140) });
          }
          if (page) await page.close().catch(() => {});
          if (total % 200 === 0) console.log('…' + total + ' configs, ' + failed + ' failures');
        }
      }
    }
  }
} finally {
  await driver.close();
  server.proc.kill();
}
const file = writeResults('matrix', 'results', { total, failed, failures: failures.slice(0, 200) });
console.log('matrix: ' + (total - failed) + '/' + total + ' pass (' + failed + ' failures) — ' + file);
if (failures.length) console.log(JSON.stringify(failures.slice(0, 10), null, 1));
process.exit(failed ? 1 : 0);
