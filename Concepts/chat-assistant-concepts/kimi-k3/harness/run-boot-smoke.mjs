/* Kimi K3 harness — boot smoke. Serves the model folder on an OS-assigned
   port, boots one pairing in headless Chrome, asserts the dataset contract.
   Usage: node harness/run-boot-smoke.mjs [--pair=w1:t1] [--url-only] */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [join(here, 'serve.mjs'), root], { stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    proc.stdout.on('data', (d) => {
      buf += d.toString();
      const m = buf.match(/K3H-URL (http:\/\/\S+)/);
      if (m) resolve({ proc, url: m[1] });
    });
    proc.on('exit', () => reject(new Error('server exited')));
    setTimeout(() => reject(new Error('server start timeout')), 10000);
  });
}

const pair = (process.argv.find((a) => a.startsWith('--pair=')) || '--pair=w1:t1').split('=')[1];
const [w, t] = pair.split(':');
const driverName = (process.argv.find((a) => a.startsWith('--driver=')) || '--driver=cdp').split('=')[1];

const server = await startServer();
const { launch } = driverName === 'playwright'
  ? await import('./driver-playwright.mjs')
  : await import('./driver-cdp.mjs');
const driver = await launch();
let failed = false;
try {
  const sess = 'k3h-boot-' + process.pid;
  const page = await driver.open(server.url + 'host.html?window=' + w + '&thread=' + t + '&sess=' + sess, { width: 1280, height: 800 });
  await page.waitFor('window.__k3 && window.__k3.data && window.__k3.data.ready === true', { timeout: 10000 });
  const r = await page.evaluate(function () {
    var s = window.__k3.data.stats();
    return {
      threads: s.threads, messages: s.messages,
      providers: window.__k3.data.providerCatalog().length,
      routeOk: !!window.__k3.data.routeByKey('anthropic/work/claude-sonnet-4.5'),
      bsd16: window.__k3.data.effective('thread-16').bsd.mode,
      bsd19: window.__k3.data.effective('thread-19').bsd.mode,
      bsd19result: (window.__k3.data.effective('thread-19').bsd.lastResult || {}).kind || null,
      errors: []
    };
  });
  r.errors = page.errors.slice();
  const checks = [
    ['threads == 19', r.threads === 19],
    ['providers == 5', r.providers === 5],
    ['routeByKey resolves', r.routeOk === true],
    ['bsd thread-16 auto (seeded)', r.bsd16 === 'auto'],
    ['bsd thread-19 on (seeded)', r.bsd19 === 'on'],
    ['bsd thread-19 result duplicate', r.bsd19result === 'duplicate'],
    ['zero page errors', r.errors.length === 0]
  ];
  checks.forEach(([name, ok]) => { console.log((ok ? 'PASS' : 'FAIL') + ' ' + name); if (!ok) failed = true; });
  console.log('stats: ' + JSON.stringify({ threads: r.threads, messages: r.messages, providers: r.providers }));
  if (r.errors.length) console.log('page errors: ' + JSON.stringify(r.errors.slice(0, 6), null, 1));
  await page.close();
} catch (e) {
  failed = true;
  console.error('FAIL boot smoke: ' + e.message);
} finally {
  await driver.close();
  server.proc.kill();
}
process.exit(failed ? 1 : 0);
