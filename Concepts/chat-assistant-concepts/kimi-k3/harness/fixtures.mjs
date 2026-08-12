/* Kimi K3 harness — shared fixtures: host opener, boot wait, error traps.
   Every run uses a unique `sess` (never collides with persisted sessions). */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const MODEL_ROOT = join(HERE, '..');

export const WIDTHS = [520, 750, 975, 1200];
export const THEMES = ['friendly-dark', 'friendly-light', 'retro-dark', 'retro-light',
  'basic-light', 'basic-dark', 'glass-dark', 'glass-light'];
export const WINDOWS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'];
export const THREADS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];

// Per-window pinned-history store keys (surfaceView.<tid>.<key>).
export const PIN_KEYS = {
  w1: 'w1HistoryPinned', w2: null /* persistent rail */, w3: 'w3HistoryPinned',
  w4: 'w4HistoryPinned', w5: 'w5HistoryPinned', w6: 'w6HistoryPinned',
  w7: 'w7HistoryPinned', w8: 'w8HistoryPinned'
};

export function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [join(HERE, 'serve.mjs'), MODEL_ROOT], { stdio: ['ignore', 'pipe', 'pipe'] });
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

export async function launchDriver(name) {
  if (name === 'playwright') {
    try {
      const mod = await import('./driver-playwright.mjs');
      return await mod.launch();
    } catch (e) {
      console.log('playwright unavailable (' + e.message.slice(0, 60) + ') — falling back to CDP');
    }
  }
  const mod = await import('./driver-cdp.mjs');
  return await mod.launch();
}

const runTag = 'k3h-' + process.pid + '-' + Date.now().toString(36);
let sessSeq = 0;
export function uniqueSess() { return runTag + '-' + (++sessSeq); }

export function resultsDir(suite) {
  const dir = join(tmpdir(), 'k3h-' + process.pid, suite);
  mkdirSync(dir, { recursive: true });
  return dir;
}
export function writeResults(suite, name, data) {
  const file = join(resultsDir(suite), name + '.json');
  writeFileSync(file, JSON.stringify(data, null, 1));
  return file;
}

export function hostParams(o) {
  const p = new URLSearchParams();
  p.set('window', o.window || 'w1');
  p.set('thread', o.thread || 't1');
  p.set('theme', o.theme || 'friendly-dark');
  p.set('width', String(o.width || 750));
  p.set('rail', o.rail === false ? 'closed' : 'open');
  p.set('rm', o.rm ? '1' : '0');
  p.set('mode', o.mode || 'docked');
  if (o.state) p.set('state', o.state);
  if (o.seed != null) p.set('seed', String(o.seed));
  p.set('sess', o.sess || uniqueSess());
  if (o.demo) p.set('demo', '1');
  return p.toString();
}

// openHost(driver, opts) -> page (booted, errors trapped, ready)
export async function openHost(driver, o) {
  const page = await driver.open(null, {
    width: (o && o.viewportWidth) || 1440,
    height: (o && o.viewportHeight) || 860,
    reducedMotion: !!(o && o.rm)
  });
  const url = o.server.url + 'host.html?' + hostParams(o || {});
  await page.goto(url);
  await waitBoot(page);
  return page;
}

export async function waitBoot(page, timeout) {
  await page.waitFor('window.__k3 && window.__k3.data && window.__k3.data.ready === true', { timeout: timeout || 10000 });
  // one settle frame for first paint + surface mounts
  await new Promise((r) => setTimeout(r, 120));
}

// Console/pageerror filter: ONLY external/font/favicon noise is exempt.
// Same-origin 404s (missing local JS/CSS) are REAL failures — never filtered.
const IGN = /favicon\.ico|fonts\.googleapis|fonts\.gstatic|net::ERR_INTERNET|net::ERR_NAME|net::ERR_CONNECTION|net::ERR_ABORTED.*fonts|gstatic/i;
export function filteredErrors(page) {
  return page.errors.filter((e) => !IGN.test(e));
}
