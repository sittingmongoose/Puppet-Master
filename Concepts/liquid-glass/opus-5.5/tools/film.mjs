/* film.mjs <url> <out.mp4> [--looks glass-dark,glass-light]  (run on the P1000: agent-browser records on the GPU)
 *
 * The concept film: in each look, today's Glass, then Liquid Glass switched on (the sweep), the pointer as a light over
 * the toolbar band, controls and cards, the liquid lens on the range, Usage's navigation, the rail's tab strip and the
 * activity bar, a press, two menus blooming, the clarity slider from Clear to Tinted, the painted frost of a carry, the
 * CPU path against the GPU blur, the window losing focus, and Reduced Motion. Real speed. Writes <out.mp4> and a
 * <out>.chapters.txt of where each part starts.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(process.env.PW_DIR || '/home/sittingmongoose/pm-scratch/pm7-no-pills/noop.js');
const { chromium } = require('playwright-core');
const [url, out] = process.argv.slice(2);
const looks = (process.argv.includes('--looks') ? process.argv[process.argv.indexOf('--looks') + 1] : 'glass-dark,glass-light').split(',');
const s = JSON.parse(execFileSync('agent-browser', ['start', '--record', out, '--codec', 'h264', '--url', 'about:blank']).toString());
const browser = await chromium.connectOverCDP(s.cdp_endpoint);
const page = browser.contexts()[0].pages().find(p => !s.recorder_url || !p.url().startsWith(s.recorder_url));
const chapters = []; const t0 = Date.now();
const mark = n => { const t = (Date.now() - t0) / 1000; chapters.push(`${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')} ${n}`); console.log(chapters[chapters.length - 1]); };
const wait = ms => page.waitForTimeout(ms);
let mx = 960, my = 540;
async function glide(x, y, ms = 700) { const n = Math.max(8, Math.round(ms / 16)); for (let i = 1; i <= n; i++) { const k = i / n, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; await page.mouse.move(mx + (x - mx) * e, my + (y - my) * e); await wait(ms / n); } mx = x; my = y; }
async function box(sel) { return page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top }; }, sel); }
async function clickSel(sel, hold = 0) { const b = await box(sel); if (!b) { console.log('missing', sel); return; } await glide(b.x, b.y, 520); await page.mouse.down(); await wait(hold || 90); await page.mouse.up(); }
const set = o => page.evaluate(o => window.PM_LG.set(o), o);

/* no request interception here: over connectOverCDP it stalls a 15 MB file: page (measured 2026-10-11); the page
   is self-contained and its web-font links fail fast in the recorder's sandbox */
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.locator('#pm-settings-root').waitFor({ state: 'attached', timeout: 90000 });
await wait(1500);
const renderer = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const x = g.getExtension('WEBGL_debug_renderer_info'); return g.getParameter(x.UNMASKED_RENDERER_WEBGL); });
console.log('renderer', renderer);
for (const look of looks) {
  const name = look === 'glass-dark' ? 'Glass Dark' : 'Glass Light';
  await page.evaluate(n => { window.PM12_KIMI.setSettingFromHost('general.visual.theme', n); document.documentElement.setAttribute('data-lg', 'off'); window.PM_PAGES.go('usage'); }, name);
  await glide(1200, 600, 300); await wait(2600);
  mark(`${name}: today's Glass`); await wait(2600);
  mark(`${name}: Liquid Glass on (the sweep)`); await set({ 'data-lg': 'on' }); await wait(2400);
  mark(`${name}: the pointer is a light (band, controls, cards)`);
  await glide(300, 26, 900); await glide(1500, 26, 1600);
  const tools = ['#pmuScopeBtn', '#pmuRange', '#pmuDetailBtn', '#pmuCustomize', '#pmuRefresh'];
  for (const t of tools) { const b = await box(t); if (b) await glide(b.x, b.y, 420); await wait(160); }
  await glide(700, 300, 900); await glide(1000, 200, 700); await glide(1300, 380, 900); await glide(760, 640, 900); await glide(1000, 640, 700);
  mark(`${name}: the lens - range`);
  for (const i of [4, 1, 3, 2]) { await clickSel(`#pmuRange > button:nth-of-type(${i})`); await wait(900); }
  mark(`${name}: the lens - Usage navigation`);
  for (const i of [3, 4, 9, 1]) { await clickSel(`#pmuNav .pmu-navbtn:nth-of-type(${i})`); await wait(1100); }
  mark(`${name}: the lens - rail tabs and activity bar`);
  for (const i of [3, 2, 1]) { await clickSel(`#panel-files .pm-segtab-item:nth-of-type(${i})`); await wait(900); }
  for (const t of ['panel-search', 'panel-source', 'panel-files']) { await clickSel(`#activityBar .icon[data-target="${t}"]`); await wait(1200); }
  mark(`${name}: press (gel and glow)`);
  await clickSel('#pmuDetailBtn', 520); await wait(900); await page.keyboard.press('Escape'); await wait(500);
  await clickSel('#pmuRange > button:nth-of-type(3)', 480); await wait(700); await clickSel('#pmuRange > button:nth-of-type(2)'); await wait(700);
  mark(`${name}: menus bloom from their button`);
  await clickSel('#pmuScopeBtn'); await wait(1300);
  { const b = await box('.pmu-pop.open'); if (b) { await glide(b.x, b.t + 80, 500); await glide(b.x, b.t + 180, 600); } }
  await page.keyboard.press('Escape'); await wait(600);
  await clickSel('#pmuCustomize'); await wait(1400); await page.keyboard.press('Escape'); await wait(600);
  await clickSel('#fmRootBtn'); await wait(1300); await page.keyboard.press('Escape'); await wait(600);
  mark(`${name}: clarity, Clear to Tinted`);
  await clickSel('#lg-demo-btn'); await wait(900);
  for (const v of ['0', '1', '2', '3', '4', '2']) { await clickSel(`#lg-demo-pop .lg-row:nth-of-type(3) button[data-v="${v}"]`); await wait(1300); }
  mark(`${name}: carry frost (painted, 140 ms)`);
  for (const v of ['painted', 'live', 'painted', 'live']) { await clickSel(`#lg-demo-pop .lg-row:nth-of-type(5) button[data-v="${v}"]`); await wait(1100); }
  mark(`${name}: CPU paint against GPU blur`);
  for (const v of ['cpu', 'gpu', 'cpu', 'gpu']) { await clickSel(`#lg-demo-pop .lg-row:nth-of-type(4) button[data-v="${v}"]`); await wait(1100); }
  mark(`${name}: Reduce Transparency, Increase Contrast`);
  await clickSel('#lg-demo-pop .lg-row:nth-of-type(6) button[data-v="on"]'); await wait(1800); await clickSel('#lg-demo-pop .lg-row:nth-of-type(6) button[data-v=""]'); await wait(800);
  await clickSel('#lg-demo-pop .lg-row:nth-of-type(7) button[data-v="on"]'); await wait(1800); await clickSel('#lg-demo-pop .lg-row:nth-of-type(7) button[data-v=""]'); await wait(800);
  await page.keyboard.press('Escape'); await wait(500);
  mark(`${name}: the window loses focus, then comes back`);
  await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await wait(2200); await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await wait(1200);
  mark(`${name}: Reduced Motion (no stretch, no bloom)`);
  await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'reduced'));
  for (const i of [4, 1, 2]) { await clickSel(`#pmuRange > button:nth-of-type(${i})`); await wait(800); }
  await clickSel('#pmuScopeBtn'); await wait(1000); await page.keyboard.press('Escape'); await wait(500);
  await page.evaluate(() => document.documentElement.removeAttribute('data-motion')); await wait(800);
}
mark('end'); await wait(800);
writeFileSync(out.replace(/\.mp4$/, '') + '.chapters.txt', `renderer: ${renderer}\n` + chapters.join('\n') + '\n');
await browser.close();
execFileSync('agent-browser', ['stop', s.id]);
console.log('wrote', out);
