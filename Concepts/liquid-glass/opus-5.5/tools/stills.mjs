/* stills.mjs <file:// url> <outdir>   (run on the P1000: headless agent-browser on the GPU, no recording)
 * The concept's GPU stills: each look with an LG-on baseline and explicit materialization, clarity Clear and Tinted, the window unfocused,
 * Reduce Transparency, Increase Contrast, the painted (carry) frost, a menu open, a card under the pointer.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(process.env.PW_DIR || '/home/sittingmongoose/pm-scratch/pm7-no-pills/noop.js');
const { chromium } = require('playwright-core');
const [url, outdir] = process.argv.slice(2); mkdirSync(outdir, { recursive: true });
const s = JSON.parse(execFileSync('agent-browser', ['start', '--url', 'about:blank']).toString());
const browser = await chromium.connectOverCDP(s.cdp_endpoint);
const page = browser.contexts()[0].pages().find(p => !s.recorder_url || !p.url().startsWith(s.recorder_url));
try {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.locator('#pm-settings-root').waitFor({ state: 'attached', timeout: 90000 });
  await page.waitForTimeout(1500);
  console.log('renderer', await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const x = g.getExtension('WEBGL_debug_renderer_info'); return g.getParameter(x.UNMASKED_RENDERER_WEBGL); }));
  const set = o => page.evaluate(o => window.PM_LG.set(o), o);
  const shot = async n => { await page.waitForTimeout(900); await page.screenshot({ path: `${outdir}/${n}.png` }); console.log(n); };
  for (const look of ['glass-dark', 'glass-light']) {
    const name = look === 'glass-dark' ? 'Glass Dark' : 'Glass Light';
    await page.evaluate(n => { window.PM12_KIMI.setSettingFromHost('general.visual.theme', n); window.PM_PAGES.go('usage'); }, name);
    await page.mouse.move(1910, 1075); await page.waitForTimeout(3000);
    await set({ 'data-lg': 'on' }); await shot(`${look}-1-liquid-glass-baseline`);
    await page.evaluate(() => window.PM_LG.materialize()); await page.waitForTimeout(1600); await shot(`${look}-2-liquid-glass-materialized`);
    await set({ 'data-lg-clarity': '0' }); await shot(`${look}-3-clarity-clear`);
    await set({ 'data-lg-clarity': '4' }); await shot(`${look}-4-clarity-tinted`);
    await set({ 'data-lg-clarity': null, 'data-lg-frost': 'painted' }); await shot(`${look}-5-carry-painted-frost`);
    await set({ 'data-lg-frost': null, 'data-lg-rt': 'on' }); await shot(`${look}-6-reduce-transparency`);
    await set({ 'data-lg-rt': null, 'data-lg-hc': 'on' }); await shot(`${look}-7-increase-contrast`);
    await set({ 'data-lg-hc': null });
    await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await shot(`${look}-8-window-unfocused`);
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    const b = await page.evaluate(() => { const r = document.querySelector('.pmu-card').getBoundingClientRect(); return { x: r.left + 90, y: r.top + 60 }; });
    await page.mouse.move(b.x, b.y, { steps: 6 }); await shot(`${look}-9-card-under-pointer`);
    await page.click('#pmuScopeBtn'); await page.waitForTimeout(700); await shot(`${look}-10-menu`);
    await page.keyboard.press('Escape'); await page.mouse.move(1910, 1075);
  }
} finally { await browser.close(); execFileSync('agent-browser', ['stop', s.id]); }
