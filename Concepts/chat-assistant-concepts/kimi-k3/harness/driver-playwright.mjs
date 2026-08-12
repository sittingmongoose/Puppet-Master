/* Kimi K3 harness — playwright-core driver (primary). Launches the SYSTEM
   Chrome/Edge via executablePath with a unique temp profile; same interface
   as driver-cdp.mjs. Requires: npm i --prefix harness playwright-core. */
import { mkdtempSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome'
].filter(Boolean);

function findBrowser() {
  for (const p of CANDIDATES) { try { if (existsSync(p)) return p; } catch (e) { /* next */ } }
  throw new Error('no Chrome/Edge binary found');
}

export async function launch(opts) {
  const { chromium } = await import('playwright-core');
  const bin = (opts && opts.executablePath) || findBrowser();
  const profile = mkdtempSync(join(tmpdir(), 'k3h-pw-'));
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: bin,
    headless: true,
    viewport: { width: 1440, height: 860 },
    args: ['--disable-extensions', '--mute-audio', '--force-color-profile=srgb']
  });
  const driver = {
    profile,
    async open(url, o) {
      const page = await context.newPage();
      const consoleLog = [];
      const errors = [];
      page.on('console', (m) => {
        const text = m.text();
        consoleLog.push({ type: m.type(), text });
        if (m.type() === 'error') errors.push(text);
      });
      page.on('pageerror', (e) => errors.push('exception: ' + String(e)));
      if (o && o.width) await page.setViewportSize({ width: o.width, height: o.height || 800 });
      if (o && o.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
      const wrap = {
        console: consoleLog,
        errors,
        async evaluate(fnOrExpr, ...args) {
          if (typeof fnOrExpr === 'function') return page.evaluate(fnOrExpr, ...args);
          return page.evaluate(new Function('return (' + fnOrExpr + ')()'));
        },
        async goto(u) { await page.goto(u, { waitUntil: 'load', timeout: 15000 }).catch(() => {}); },
        async waitFor(fnExpr, o2) {
          await page.waitForFunction(fnExpr, null, { timeout: (o2 && o2.timeout) || 10000, polling: 120 });
        },
        async setViewport(w, h) { await page.setViewportSize({ width: w, height: h || 800 }); },
        async setReducedMotion(on) { await page.emulateMedia({ reducedMotion: on ? 'reduce' : 'no-preference' }); },
        async screenshot() {
          const file = join(mkdtempSync(join(tmpdir(), 'k3h-shot-')), 'frame.png');
          await page.screenshot({ path: file });
          return file;
        },
        async close() { await page.close().catch(() => {}); }
      };
      if (url) await wrap.goto(url);
      return wrap;
    },
    async close() {
      try { await context.close(); } catch (e) { /* gone */ }
      try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* locked */ }
    }
  };
  return driver;
}
