// Opus concept driver — isolated Chrome profile, file:// only, no shared browser.
import { chromium } from '/home/sittingmongoose/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';
import { mkdirSync } from 'node:fs';

export const TARGET = 'file:///mnt/Cursor/PuppetMaster/Concepts/TestOpusPMConcpet.html';
export const PROFILE = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/b39dbd86-951c-408b-bab8-5d2199315c1f/scratchpad/opus-chrome-profile';

export async function launch({ theme = 'friendly-dark', width = 1600, height = 1000, reduced = false } = {}) {
  mkdirSync(PROFILE, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/opt/google/chrome/chrome',
    headless: true,
    args: ['--no-sandbox','--disable-dev-shm-usage','--allow-file-access-from-files',
           '--force-device-scale-factor=1','--hide-scrollbars','--font-render-hinting=none',
           // compositor tuning: screencast only emits on commit, so unthrottle it
           '--disable-frame-rate-limit','--disable-gpu-vsync','--enable-gpu-rasterization',
           '--disable-new-content-rendering-timeout',
          ],
  });
  const ctx = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: 2,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text().slice(0, 400)); });
  const [fam, mode] = theme.split('-');
  await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
  await page.goto(TARGET, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(1600);
  // The shell boots to its own default and owns the theme; ask it to change.
  await page.evaluate(({ f, m }) => {
    if (window.PM_THEME) { try { PM_THEME.setFamily(f); PM_THEME.setMode(m); return; } catch (e) {} }
    document.documentElement.setAttribute('data-theme', f + '-' + m);
  }, { f: fam, m: mode });
  await page.waitForTimeout(700);
  return { browser, ctx, page, errs };
}
