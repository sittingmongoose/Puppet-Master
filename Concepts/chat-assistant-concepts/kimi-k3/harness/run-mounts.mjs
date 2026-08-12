/* Mount/remount cycles: docked <-> pop-out swaps, thread switches, simulated
   restart across pairings. Usage: node harness/run-mounts.mjs [--driver=cdp] */
import { startServer, launchDriver, openHost, writeResults, WINDOWS, THREADS } from './fixtures.mjs';
import { noConsoleErrors } from './probes.mjs';

const driverName = (process.argv.find((a) => a.startsWith('--driver=')) || '--driver=cdp').split('=')[1];
const server = await startServer();
const driver = await launchDriver(driverName);
let total = 0, failed = 0;
const failures = [];
try {
  for (const w of WINDOWS) {
    for (const t of THREADS) {
      total++;
      let page = null;
      try {
        page = await openHost(driver, { window: w, thread: t, server });
        const r = await page.evaluate(async function () {
          function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
          var K3 = window.K3;
          K3.setEnv({ mode: 'popout' });
          await sleep(350);
          var popped = !!document.querySelector('[data-k3-slot="thread"]');
          K3.setEnv({ mode: 'docked' });
          await sleep(350);
          var docked = !!document.querySelector('[data-k3-slot="thread"]');
          // switch threads
          var k3 = window.__k3;
          k3.store.set('activeThreadId', 'thread-16');
          K3.emit('data', { type: 'threads-changed' });
          await sleep(350);
          var switched = (document.querySelector('[data-testid="k3w-kit-title"]') || {}).textContent || '';
          k3.data.simulateRestart();
          await sleep(350);
          var restarted = !!document.querySelector('[data-k3-slot="thread"]');
          return { popped, docked, switched, restarted };
        });
        const errs = await noConsoleErrors(page);
        if (!r.popped || !r.docked || !r.switched || !r.restarted || !errs.pass) {
          failed++;
          failures.push({ pair: w + ':' + t, r, err: errs.pass ? '' : errs.detail.slice(0, 120) });
        }
      } catch (e) {
        failed++;
        failures.push({ pair: w + ':' + t, boot: e.message.slice(0, 120) });
      }
      if (page) await page.close().catch(() => {});
      console.log((failures.length && failed === failures.length ? '' : '') + w + ':' + t + ' done');
    }
  }
} finally {
  await driver.close();
  server.proc.kill();
}
const file = writeResults('mounts', 'results', { total, failed, failures });
console.log('mounts: ' + (total - failed) + '/' + total + ' pass — ' + file);
if (failures.length) console.log(JSON.stringify(failures.slice(0, 10), null, 1));
process.exit(failed ? 1 : 0);
