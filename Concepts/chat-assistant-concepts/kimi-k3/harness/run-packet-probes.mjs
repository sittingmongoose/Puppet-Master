/* Packet behavioral gate: every packet probe × 2 themes × 2 widths on the
   canonical pairings. Usage: node harness/run-packet-probes.mjs [--driver=cdp] [--only=name] */
import { startServer, launchDriver, openHost, writeResults, PIN_KEYS } from './fixtures.mjs';
import { PACKET } from './probes.mjs';

const driverName = (process.argv.find((a) => a.startsWith('--driver=')) || '--driver=cdp').split('=')[1];
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
// probes that need specific pairings exercise their own thread selection;
// run them on w1:t1 and w3:t5 (inline + chip work modes), 2 themes × 2 widths.
const PAIRINGS = [['w1', 't1'], ['w3', 't5'], ['w8', 't8'], ['w7', 't2']];
const THEMES = ['friendly-dark', 'glass-light'];
const WIDTHS = [520, 975];

const server = await startServer();
const driver = await launchDriver(driverName);
let total = 0, failed = 0;
const failures = [];
try {
  for (const [w, t] of PAIRINGS) {
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        const ctx = { window: w, thread: t, theme, width, server };
        let page = null;
        try {
          page = await openHost(driver, ctx);
          for (const [name, fn] of PACKET) {
            if (only && name !== only) continue;
            total++;
            try {
              const r = await fn(page, ctx, PIN_KEYS[w]);
              if (!r.pass) {
                failed++;
                failures.push({ probe: name, pair: w + ':' + t, theme, width, detail: r.detail.slice(0, 200) });
                console.log('FAIL ' + name + ' ' + w + ':' + t + ' ' + theme + ' @' + width + ' — ' + r.detail.slice(0, 140));
              }
            } catch (e) {
              failed++;
              failures.push({ probe: name, pair: w + ':' + t, theme, width, detail: 'threw: ' + e.message.slice(0, 160) });
              console.log('FAIL(threw) ' + name + ' ' + w + ':' + t + ' — ' + e.message.slice(0, 140));
            }
          }
        } catch (e) {
          failed++;
          failures.push({ pair: w + ':' + t, theme, width, boot: e.message.slice(0, 140) });
        }
        if (page) await page.close().catch(() => {});
      }
    }
    console.log('pairing ' + w + ':' + t + ' done — ' + total + ' probe runs, ' + failed + ' failures');
  }
} finally {
  await driver.close();
  server.proc.kill();
}
const file = writeResults('packet-probes', 'results', { total, failed, failures });
console.log('packet-probes: ' + (total - failed) + '/' + total + ' pass — ' + file);
process.exit(failed ? 1 : 0);
