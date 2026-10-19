// Attach to one already admitted Windows gpu-browser session. Never launch a browser.
// node hover-regression.mjs <cdp-endpoint> <page-url> <output.json>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { coverPage, takeCoverageFlag } from './coverage_union.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PM7_PLAYWRIGHT || '/home/sittingmongoose/pmt-dev/pw/node_modules/playwright-core');
const argv = process.argv.slice(2);
const coverageFile = takeCoverageFlag(argv);
const [endpoint, url, output] = argv;
if (!endpoint || !url || !output) throw Error('Expected CDP endpoint, URL, output JSON');
const browser = await chromium.connectOverCDP(endpoint);
const pm7HoverContext=await browser.newContext({viewport:{width:1920,height:1080}});const page=await pm7HoverContext.newPage();await page.bringToFront();
const finishCoverage = coverageFile ? await coverPage(page, coverageFile) : null;
page.setDefaultTimeout(20000);
const result = { head:process.env.PM7_TEST_HEAD,pageSha256:process.env.PM7_TEST_SHA256,url, browser: 'Nas1 agent-browser; ordinary-page hover smoke, intentional software rendering', runs: [], errors: [] };
page.on('pageerror', e => result.errors.push(String(e)));
async function configure(family, reduced) {
  await page.evaluate(() => { if (PM_NIER.on() || PM_NIER.wanted()) PM_NIER.set(false, { sound: false }); });
  await page.waitForFunction(() => !PM_NIER.on() && !PM_NIER.wanted());
  await page.evaluate(({ family, reduced }) => {
    PM7_SETTINGS_TOME.setChromeThemeFamily(family === 'nier' ? 'basic' : family);
    PM7_SETTINGS_TOME.setChromeThemeMode('dark');
    PM12_KIMI.setSettingFromHost('general.visual.reduce-animations', reduced);
    if (family === 'nier') PM_NIER.set(true, { sound: false });
  }, { family, reduced });
  await page.waitForFunction(({ family, reduced }) => PMH.state().family === family && PMH.state().reduced === reduced, { family, reduced });
  await page.waitForTimeout(family === 'nier' ? 3500 : 1200);
}
async function state(point) {
  return page.evaluate(p => {
    const hit = document.elementFromPoint(p.x, p.y), resolved = PMH.resolve(hit), s = PMH.state();
    return {
      point: p, hit: hit && { tag: hit.tagName, cls: String(hit.className) },
      resolved: resolved && { cls: resolved.className, widget: resolved.getAttribute('data-widget'), name: resolved.getAttribute('data-name') },
      hover: s.hover, rest: s.rest, running: s.running, family: s.family, reduced: s.reduced,
      hovered: [...document.querySelectorAll('.pmu-card.pmh-on,.pm6-proj-card.pmh-on')].filter(e=>!e.closest('[data-pmu-prewarm]')).map(e => ({ widget: e.getAttribute('data-widget'), name: e.getAttribute('data-name'), hidden: e.hidden, rects: e.getClientRects().length })),
      prewarmCopies:[...document.querySelectorAll('[data-pmu-prewarm] .pmu-card.pmh-on')].map(e=>({opacity:getComputedStyle(e).opacity,inert:e.closest('[data-pmu-prewarm]').inert,ariaHidden:e.closest('[data-pmu-prewarm]').getAttribute('aria-hidden')})),moves: window.__diagnosisPointerMoves, transition: document.documentElement.getAttribute('data-pm-page-transition'), moment: document.documentElement.getAttribute('data-pmu-moment'),
      query: document.querySelector('#pm6-proj-search')?.value, focused: document.activeElement?.id
    };
  }, point);
}
try {
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => window.PMH && window.PM7_SETTINGS_TOME && window.PM12_KIMI && window.PM_NIER); await page.waitForTimeout(5000);
  result.viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio }));
  result.renderer = 'Nas1 intentional software rendering; no WebGL probe';
  await page.evaluate(() => { window.__diagnosisPointerMoves = 0; document.addEventListener('pointermove', () => window.__diagnosisPointerMoves++, { passive: true, capture: true }); });
  for (const [family, reduced] of [['glass', false], ['retro', false], ['nier', false], ['basic', false], ['friendly', false], ['basic', true], ['glass', true]]) {
    await configure(family, reduced);
    await page.locator('#tab-usage').click();
    await page.waitForTimeout(2200);
    const card = page.locator('.pmu-card[data-widget="ov-skyline"]:visible').first();
    await card.hover(); await page.waitForTimeout(500);
    const button = card.locator('button[data-tool="menu"]');
    await button.hover(); await page.waitForTimeout(800);
    const rect = await button.boundingBox(), p = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    const before = await state(p);
    await page.locator('#tab-settings').focus(); await page.keyboard.press('Enter');
    await page.waitForTimeout(1500); const away = await state(p);
    await page.locator('#tab-usage').focus(); await page.keyboard.press('Enter');
    await page.waitForTimeout(3000); const returned = await state(p);
    const checks = {
      initialTarget: before.resolved?.widget === 'ov-skyline' && before.hovered.some(e => e.widget === 'ov-skyline'),
      returnTarget: returned.resolved?.widget === 'ov-skyline',
      returnedHover: returned.hovered.some(e => e.widget === 'ov-skyline' && e.rects > 0 && !e.hidden),
      singleVisibleHover: returned.hovered.filter(e => e.rects > 0 && !e.hidden).length === 1,
      settled: !returned.transition && !returned.moment && !returned.rest,
      pointerUnchanged: before.moves === returned.moves
    };
    const row = { bug: 1, family, reduced, before, away, returned, checks, pass: Object.values(checks).every(Boolean) };
    result.runs.push(row);  console.log(JSON.stringify({ bug: 1, family, reduced, pass: row.pass, checks }));
    await page.locator('#tab-projects').click(); await page.waitForTimeout(1500);
    await page.evaluate(() => { const el = document.querySelector('#pm6-proj-search'); el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); el.focus(); });
    await page.waitForTimeout(200);
    const box = await page.locator('.pm6-proj-card[data-name="tastebook"]').boundingBox();
    const pt = { x: Math.round(box.x + box.width * .4) + .5, y: Math.round(box.y + box.height * .45) + .5 };
    await page.mouse.move(pt.x - 40, pt.y, { steps: 4 }); await page.mouse.move(pt.x, pt.y, { steps: 6 });
    await page.waitForTimeout(1200); const b = await state(pt);
    await page.keyboard.press('x'); await page.waitForTimeout(600); const t = await state(pt);
    await page.keyboard.press('Backspace'); await page.waitForTimeout(600); const c = await state(pt);
    const searchChecks = {
      initialTastebook: b.resolved?.name === 'tastebook' && b.hovered.length === 1 && b.hovered[0].name === 'tastebook',
      typedActualTarget: t.resolved?.name === 'experiment' && t.hovered.length === 1 && t.hovered[0].name === 'experiment',
      noHiddenHover: !t.hovered.some(e => e.hidden || !e.rects),
      clearedTastebook: c.resolved?.name === 'tastebook' && c.hovered.length === 1 && c.hovered[0].name === 'tastebook',
      pointerUnchanged: b.moves === t.moves && b.moves === c.moves,
      trustedQueryApplied: t.query === 'x' && c.query === '' && t.focused === 'pm6-proj-search'
    };
    const searchRow = { bug: 2, family, reduced, before: b, typed: t, cleared: c, checks: searchChecks, pass: Object.values(searchChecks).every(Boolean) };
    result.runs.push(searchRow);  console.log(JSON.stringify({ bug: 2, family, reduced, pass: searchRow.pass, checks: searchChecks }));
  }
} catch (e) { result.failure = String(e.stack || e); console.error(result.failure); }
finally { result.pass = !result.failure && !result.errors.length && result.runs.length === 14 && result.runs.every(r => r.pass); writeFileSync(output, JSON.stringify(result, null, 2) + '\n'); try { if (finishCoverage) await finishCoverage(); } finally { await pm7HoverContext.close();await browser.close(); } }
process.exitCode = result.pass ? 0 : 1;
