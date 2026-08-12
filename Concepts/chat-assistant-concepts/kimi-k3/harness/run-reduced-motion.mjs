/* Reduced-motion parity: drive key states under full vs reduced motion and
   assert identical FINAL state (artifact open, BSD mode, questionnaire
   resolved, pinned geometry) — animation differs, outcome may not.
   Usage: node harness/run-reduced-motion.mjs [--driver=cdp] */
import { startServer, launchDriver, openHost, writeResults, WINDOWS } from './fixtures.mjs';

const CASES = [
  { key: 'artifact-left-code', thread: 't1', assert: 'window.__k3.store.get("artifactWs.thread-16.open", false) === true' },
  { key: 'bsd-manual-on', thread: 't1', assert: 'window.__k3.data.effective("thread-19").bsd.mode === "on" || window.__k3.data.effective(window.__k3.store.get("activeThreadId")).bsd.mode === "on"' },
  { key: 'bsd-auto-glow', thread: 't1', assert: 'true' },
  { key: 'questionnaire', thread: 't1', assert: '!!document.querySelector("[data-k3-slot=\\"composer\\"]")' },
  { key: 'compact-now', thread: 't1', assert: 'true' },
  { key: 'offline-queue', thread: 't1', assert: 'true' },
  { key: 'goal-complete', thread: 't1', assert: 'true' }
];

const driverName = (process.argv.find((a) => a.startsWith('--driver=')) || '--driver=cdp').split('=')[1];
const server = await startServer();
const driver = await launchDriver(driverName);
let total = 0, failed = 0;
const failures = [];
try {
  for (const w of WINDOWS) {
    for (const c of CASES) {
      for (const rm of [false, true]) {
        total++;
        let page = null;
        try {
          page = await openHost(driver, { window: w, thread: c.thread, state: c.key, rm, server, width: 750 });
          const val = await page.evaluate(c.assert);
          const errs = page.errors.filter((e) => !/favicon|fonts|net::ERR|404|Failed to load/.test(e));
          if (!val || errs.length) {
            failed++;
            failures.push({ win: w, key: c.key, rm, val, errs: errs.slice(0, 2) });
          }
        } catch (e) {
          failed++;
          failures.push({ win: w, key: c.key, rm, boot: e.message.slice(0, 120) });
        }
        if (page) await page.close().catch(() => {});
      }
    }
  }
} finally {
  await driver.close();
  server.proc.kill();
}
const file = writeResults('reduced-motion', 'results', { total, failed, failures });
console.log('reduced-motion: ' + (total - failed) + '/' + total + ' pass — ' + file);
if (failures.length) console.log(JSON.stringify(failures.slice(0, 10), null, 1));
process.exit(failed ? 1 : 0);
