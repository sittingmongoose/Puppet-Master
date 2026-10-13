/* film-win.mjs: a real-time 60 fps GPU film of the Glass lens and button motion (Windows, agent-browser window capture).
 *   node film.mjs <page.html> <label> "<Glass Dark|Glass Light>"
 * Writes <label>.mp4 and <label>.json (marks: name, page time, region). A 16 px marker square in the bottom-right
 * corner changes colour at every mark, so each mark's first frame can be found exactly in the film. */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const [pagePath, label, look] = process.argv.slice(2);
const DIR = 'C:/Users/sitti/pm-lg-films';
const PY = 'C:/Program Files/Python313/python.exe', TOOL = process.env.LOCALAPPDATA + '/agent-browser/agent-browser.py';
const ab = (...a) => execFileSync(PY, [TOOL, ...a], { encoding: 'utf8' });
const url = 'file:///' + pagePath.replace(/\\/g, '/') + '?o55=off&lgkeep=1';
const s = JSON.parse(ab('start', '--record', `${DIR}/${label}.mp4`, '--codec', 'h264', '--url', url));
const out = { label, look, page: pagePath, session: s.id, renderer: s.renderer, marks: [] };
const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ff8000'];
let browser;
try {
  browser = await chromium.connectOverCDP(s.cdp_endpoint);
  const page = browser.contexts()[0].pages().find((p) => !s.recorder_url || !p.url().startsWith(s.recorder_url));
  await page.locator('#pm-settings-root').waitFor({ state: 'attached', timeout: 120000 });
  await page.waitForTimeout(2500);
  out.tier = await page.evaluate(() => document.documentElement.getAttribute('data-lg-tier'));
  await page.evaluate((look) => { window.PM12_KIMI.setSettingFromHost('general.visual.theme', look); window.PM_PAGES.go('projects'); }, look);
  await page.waitForTimeout(4000);
  await page.evaluate(() => {
    const d = document.createElement('div'); d.id = 'film-mark';
    d.style.cssText = 'position:fixed;right:0;bottom:0;width:16px;height:16px;z-index:2147483647;background:#000;pointer-events:none';
    document.body.appendChild(d);
  });
  await page.mouse.move(960, 700);
  await page.waitForTimeout(600);
  const box = async (sel) => { const r = await page.locator(sel).first().boundingBox(); return r && [r.x, r.y, r.width, r.height].map(Math.round); };
  let n = 0;
  const mark = async (name, region) => {
    const c = COLORS[n++ % COLORS.length];
    const t = await page.evaluate((c) => { document.getElementById('film-mark').style.background = c; return performance.now(); }, c);
    out.marks.push({ name, color: c, t: Math.round(t), region: region ? await box(region) : null, regionSel: region || null });
  };
  const centre = async (sel) => { const r = await page.locator(sel).first().boundingBox(); return [r.x + r.width / 2, r.y + r.height / 2]; };
  const click = async (sel, name, region, gap = 1300) => {
    const [x, y] = await centre(sel);
    await page.mouse.move(x, y, { steps: 6 }); await page.waitForTimeout(250);
    await mark(name, region); await page.mouse.down(); await page.waitForTimeout(70); await page.mouse.up();
    await page.waitForTimeout(gap);
  };

  /* F1 the page selector, tabs of different widths */
  for (const id of ['tab-wizard', 'tab-orchestrator', 'tab-usage', 'tab-dashboard', 'tab-wizard', 'tab-projects']) await click('#' + id, 'F1 ' + id, 'nav.page-tabs');
  /* F2 scrub: press on the chosen tab and drag across, release on Orchestrator */
  {
    const [x0, y] = await centre('#tab-projects'), [x1] = await centre('#tab-orchestrator');
    await page.mouse.move(x0, y, { steps: 4 }); await page.waitForTimeout(250);
    await mark('F2 scrub', 'nav.page-tabs'); await page.mouse.down();
    for (let i = 1; i <= 40; i++) { await page.mouse.move(x0 + (x1 + 60 - x0) * i / 40, y); await page.waitForTimeout(25); }
    for (let i = 1; i <= 10; i++) { await page.mouse.move(x1 + 60 - 60 * i / 10, y); await page.waitForTimeout(25); }
    await page.mouse.up(); await page.waitForTimeout(1400);
  }
  await click('#tab-projects', 'F2 back', 'nav.page-tabs', 1800);
  /* F3 the rail: hover down the icons, click three, click the current one twice */
  const icons = await page.$$eval('#activityBar .icon[data-target]', (a) => a.map((e) => e.getAttribute('data-target')));
  out.icons = icons;
  await mark('F3 hover', '#activityBar');
  for (const id of icons.slice(0, 7)) { const [x, y] = await centre(`#activityBar .icon[data-target="${id}"]`); await page.mouse.move(x, y, { steps: 5 }); await page.waitForTimeout(550); }
  await page.mouse.move(400, 600, { steps: 6 }); await page.waitForTimeout(800);
  for (const id of [icons[2], icons[4], icons[1]]) await click(`#activityBar .icon[data-target="${id}"]`, 'F3 click ' + id, '#activityBar', 1500);
  await click(`#activityBar .icon[data-target="${icons[1]}"]`, 'F3 collapse', '#activityBar', 1500);
  await click(`#activityBar .icon[data-target="${icons[1]}"]`, 'F3 reopen', '#activityBar', 1500);
  await click(`#activityBar .icon[data-target="${icons[0]}"]`, 'F3 click ' + icons[0], '#activityBar', 1500);
  /* F4 Usage: the range strip and the navigation list */
  await click('#tab-usage', 'F4 to usage', 'nav.page-tabs', 3500);
  for (const i of [3, 7, 0]) await click(`#pmuNav .pmu-navbtn >> nth=${i}`, 'F4 nav ' + i, '#pmuNav', 1300);
  /* F5 the magnet: drift across three Usage cards */
  await mark('F5 cards', '#pmuBoard');
  for (const i of [0, 1, 2]) { const c = page.locator('#panel-usage .pmu-board > .pmu-card').nth(i); const r = await c.boundingBox(); if (!r) continue;
    await page.mouse.move(r.x + 20, r.y + 20, { steps: 8 }); await page.mouse.move(r.x + r.width - 20, r.y + r.height / 2, { steps: 30 }); await page.waitForTimeout(200); }
  await page.mouse.move(960, 1060, { steps: 10 }); await page.waitForTimeout(800);
  await mark('END', null);
  await page.waitForTimeout(500);
} catch (e) {
  out.error = String(e && e.stack || e);
} finally {
  try { if (browser) await browser.close(); } catch (e) {}
  try { ab('stop', s.id); } catch (e) { out.stopError = String(e); }
  writeFileSync(`${DIR}/${label}.json`, JSON.stringify(out, null, 1));
}
