/* Terminology gate: PM-native browser vocabulary everywhere; no Playwright
   product terms; 'Full Access' present, 'yolo' absent. Scans rendered UI on
   representative pairings AND the static sources of the model folder.
   Usage: node harness/run-terminology.mjs [--driver=cdp] */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, launchDriver, openHost, writeResults, MODEL_ROOT } from './fixtures.mjs';

const BANNED = [/playwright[- ]?(familiar|compatible|shaped|like|facade)/i, /\byolo\b/i];
const REQUIRED_UI = ['Browser Program'];
const PAIRINGS = [['w1', 't1'], ['w2', 't3'], ['w4', 't5'], ['w8', 't8']];

let failed = 0;
const failures = [];

// 1. static source scan (js/html/css/md under the model folder, minus harness results)
function walk(dir) {
  const out = [];
  readdirSync(dir).forEach((n) => {
    const p = join(dir, n);
    const s = statSync(p);
    if (s.isDirectory()) { if (!/node_modules/.test(n)) out.push(...walk(p)); }
    else if (/\.(js|html|css|md|json)$/.test(n)) out.push(p);
  });
  return out;
}
for (const f of walk(MODEL_ROOT)) {
  if (/harness[\\/]/.test(f)) continue;
  const text = readFileSync(f, 'utf-8');
  for (const re of BANNED) {
    const m = text.match(re);
    if (m) { failed++; failures.push({ file: f.split(/kimi-k3[\\/]/)[1], match: m[0] }); }
  }
}

// 2. rendered UI scan
const driverName = (process.argv.find((a) => a.startsWith('--driver=')) || '--driver=cdp').split('=')[1];
const server = await startServer();
const driver = await launchDriver(driverName);
try {
  for (const [w, t] of PAIRINGS) {
    let page = null;
    try {
      page = await openHost(driver, { window: w, thread: t, server });
      const r = await page.evaluate(async function () {
        function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
        window.__k3.store.set('activeThreadId', 'thread-16'); // browser program card lives here
        window.K3.emit('data', { type: 'threads-changed' });
        await sleep(350);
        return {
          body: document.body.textContent || '',
          accessMenu: (function () {
            var b = document.querySelector('[data-testid="k3w-kit-access"]');
            return b ? b.textContent : null;
          })()
        };
      });
      for (const re of BANNED) {
        const m = r.body.match(re);
        if (m) { failed++; failures.push({ pair: w + ':' + t, ui: m[0] }); }
      }
      for (const term of REQUIRED_UI) {
        if (!r.body.includes(term)) { failed++; failures.push({ pair: w + ':' + t, missing: term }); }
      }
      if (r.accessMenu !== null && !/Ask for approval|Auto accept edits|Auto|Full Access/.test(r.accessMenu)) {
        failed++; failures.push({ pair: w + ':' + t, accessLabel: r.accessMenu });
      }
    } catch (e) {
      failed++; failures.push({ pair: w + ':' + t, boot: e.message.slice(0, 120) });
    }
    if (page) await page.close().catch(() => {});
  }
} finally {
  await driver.close();
  server.proc.kill();
}
const file = writeResults('terminology', 'results', { failed, failures });
console.log('terminology: ' + (failed ? failed + ' FAILURES' : 'clean') + ' — ' + file);
if (failures.length) console.log(JSON.stringify(failures.slice(0, 12), null, 1));
process.exit(failed ? 1 : 0);
