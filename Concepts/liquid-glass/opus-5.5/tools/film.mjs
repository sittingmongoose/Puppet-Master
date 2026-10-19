/* film.mjs <file:// url of the concept page> <out.mp4> [--looks glass-dark,glass-light]   (run on the P1000)
 *
 * The v2 concept film, real speed, recorded on the GPU by agent-browser. In each look:
 *   - an LG-on baseline, then explicit Liquid Glass materialization (no old-material comparison);
 *   - the pointer's light on the sheets;
 *   - the lens: clicks, then press-and-drag scrubbing on Usage's range and the rail's tabs;
 *   - the accent selection travelling in Usage's navigation and the activity bar;
 *   - menus morphing out of their button, and the press;
 *   - the three wallpapers, the CPU path against the GPU, the window losing focus, and Reduced Motion.
 * Writes <out.mp4> and <out>.chapters.txt. No request interception (it stalls a 16 MB page over CDP).
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(process.env.PW_DIR || process.env.HOME + '/pm-scratch/pm7-lg2/noop.js');
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
async function glide(x, y, ms = 650) { const n = Math.max(8, Math.round(ms / 16)); for (let i = 1; i <= n; i++) { const k = i / n, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; await page.mouse.move(mx + (x - mx) * e, my + (y - my) * e); await wait(ms / n); } mx = x; my = y; }
async function box(sel) { return page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, r: r.right, t: r.top }; }, sel); }
async function click(sel, hold = 90) { const b = await box(sel); if (!b) { console.log('missing', sel); return; } await glide(b.x, b.y, 480); await page.mouse.down(); await wait(hold); await page.mouse.up(); }
async function scrub(fromSel, toSel) { const a = await box(fromSel), b = await box(toSel); if (!a || !b) return; await glide(a.x, a.y, 420); await page.mouse.down(); await wait(140); const n = 70; for (let i = 1; i <= n; i++) { await page.mouse.move(a.x + (b.x - a.x) * i / n, a.y); await wait(16); } mx = b.x; my = a.y; await wait(260); await page.mouse.up(); }
const set = o => page.evaluate(o => window.PM_LG.set(o), o);

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.locator('#pm-settings-root').waitFor({ state: 'attached', timeout: 90000 });
await wait(1500);
const renderer = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const x = g.getExtension('WEBGL_debug_renderer_info'); return g.getParameter(x.UNMASKED_RENDERER_WEBGL); });
for (const look of looks) {
  const name = look === 'glass-dark' ? 'Glass Dark' : 'Glass Light';
  await page.evaluate(n => { const r = document.documentElement; r.setAttribute('data-lg', 'on'); r.setAttribute('data-lg-wall', 'ribbons'); window.PM12_KIMI.setSettingFromHost('general.visual.theme', n); window.PM_PAGES.go('usage'); }, name);
  await glide(1150, 620, 300); await wait(3000);
  mark(`${name}: Liquid Glass baseline`); await wait(2500);
  mark(`${name}: Liquid Glass materializes`); await page.evaluate(() => window.PM_LG.materialize()); await wait(2600);
  mark(`${name}: the pointer is a light`);
  await glide(260, 28, 900); await glide(1500, 28, 1500); await glide(700, 300, 900); await glide(1000, 200, 700); await glide(1300, 360, 800); await glide(160, 420, 1100); await glide(1000, 640, 900);
  mark(`${name}: the lens (clicks)`);
  for (const i of [4, 1, 3, 2]) { await click(`#pmuRange > button:nth-of-type(${i})`); await wait(850); }
  mark(`${name}: the lens (press and drag)`);
  await scrub('#pmuRange > button:nth-of-type(2)', '#pmuRange > button:nth-of-type(4)'); await wait(900);
  await scrub('#pmuRange > button:nth-of-type(4)', '#pmuRange > button:nth-of-type(2)'); await wait(900);
  for (const i of [3, 2, 1]) { await click(`#panel-files .pm-segtab-item:nth-of-type(${i})`); await wait(800); }
  await scrub('#panel-files .pm-segtab-item:nth-of-type(1)', '#panel-files .pm-segtab-item:nth-of-type(3)'); await wait(800);
  await click('#panel-files .pm-segtab-item:nth-of-type(1)'); await wait(800);
  mark(`${name}: the selection travels`);
  for (const i of [3, 9, 5, 1]) { await click(`#pmuNav .pmu-navbtn:nth-of-type(${i})`); await wait(1000); }
  for (const t of ['panel-search', 'panel-source', 'panel-files']) { await click(`#activityBar .icon[data-target="${t}"]`); await wait(1100); }
  mark(`${name}: menus morph out of their button`);
  await click('#pmuScopeBtn'); await wait(1400); await page.keyboard.press('Escape'); await wait(600);
  await click('#pmuCustomize'); await wait(1400); await page.keyboard.press('Escape'); await wait(600);
  await click('#fmRootBtn'); await wait(1300); await page.keyboard.press('Escape'); await wait(600);
  mark(`${name}: the press`);
  await click('#pmuDetailBtn', 520); await wait(800); await page.keyboard.press('Escape'); await wait(400);
  await click('#pmuRefresh', 420); await wait(900);
  mark(`${name}: wallpapers (Ribbons, Prism, Orbs)`);
  for (const v of ['prism', 'orbs', 'ribbons']) { await page.evaluate(id => window.PM_LG.wall(id), v); await wait(2200); }
  mark(`${name}: the CPU path against the GPU`);
  for (const v of ['cpu', 'gpu']) { await set({ 'data-lg-tier': v }); await wait(1800); }
  await page.keyboard.press('Escape'); await page.mouse.click(1910, 1000); await wait(400);
  mark(`${name}: the window loses focus, then comes back`);
  await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await wait(2000); await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await wait(1000);
  mark(`${name}: Reduced Motion`);
  await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'reduced'));
  for (const i of [4, 1, 2]) { await click(`#pmuRange > button:nth-of-type(${i})`); await wait(700); }
  await click('#pmuScopeBtn'); await wait(900); await page.keyboard.press('Escape'); await wait(400);
  await page.evaluate(() => document.documentElement.removeAttribute('data-motion')); await wait(600);
}
mark('end'); await wait(800);
writeFileSync(out.replace(/\.mp4$/, '') + '.chapters.txt', `renderer: ${renderer}\n` + chapters.join('\n') + '\n');
await browser.close();
execFileSync('agent-browser', ['stop', s.id]);
console.log('wrote', out);
