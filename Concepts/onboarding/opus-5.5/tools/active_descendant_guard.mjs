// Lane check for the T2 build step (active_descendant_rewrite.py + active_descendant_rules.json). See
// active_descendant_guard.README.md. Attach to one already admitted browser; never launches one.
//   node Concepts/onboarding/opus-5.5/tools/active_descendant_guard.mjs <cdp-endpoint> <page-url> <output.json> [rules.json]
// The rewrite changes CSS only, so it is exact when every rewritten selector matches the same elements as its original in
// every DOM state. In many DOM states (six pages, every Settings chapter, every rail panel and file view, fixture PMR menus
// holding every item kind and every icon the rail draws, a submenu, the More tray) and four looks, the guard compares
// querySelectorAll(original) with querySelectorAll(replacement) for every rule and every variant, first as the page is,
// then with each rule's dynamic state forced on all of its carriers at once. A dropped arm must match nothing. Exit 0 only
// when nothing differs and every rewritten rule matched at least once.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PM7_PLAYWRIGHT || '/home/sittingmongoose/pmt-dev/pw/node_modules/playwright-core');
const [endpoint, url, out, rulesArg] = process.argv.slice(2);
if (!endpoint || !url || !out) throw Error('Expected CDP endpoint, page URL, output JSON [, rules.json]');
const rulesFile = rulesArg || path.join(path.dirname(fileURLToPath(import.meta.url)), 'active_descendant_rules.json');
const RULES = JSON.parse(fs.readFileSync(rulesFile, 'utf8')).rules.map((r) => ({
  rule: r.rule, omit: !!r.omit, variants: r.variants || [{ original: r.original, replacement: r.replacement || '' }] }));
const W = (ms) => new Promise((res) => setTimeout(res, ms));
// the dynamic state each rule needs, forced on all of its carriers (a class, or an attribute value)
const RULE0 = RULES.find((r) => r.rule === 0).variants[0].original;
const FORCE = [
  { cls: 'o55np-cur-over', sel: RULE0.slice(RULE0.indexOf(':is('), RULE0.lastIndexOf('.o55np-cur-over')) },
  { cls: 'pmh-on', sel: ':is([data-pmh-kind="icon"]:not(.activity-bar .icon), .pmw-tab, .pmw-sc-btn, #projectMenuBtn, #themeSelect)' },
  { cls: 'active', sel: '.pmr-menu .pmr-mi' },
  { cls: 'selected', sel: '#sidePanelSlot .fm-row' },
  { cls: 'o55np-cur-over', sel: '#sidePanelSlot :is(.pmr-cur, .fm-row, .pm-segtab-item)' },
  { cls: 'active', sel: '#pm-settings-root .domain-link' },
  { cls: 'pill-fit-measure', sel: '.side-panel-slot' },
  { cls: 'active', sel: '#pm-settings-root .rail-scroll > .side-link' },
  { cls: 'active', sel: '.orch-tabs .orch-tab' },
  { cls: 'active', sel: '.pmu-navbtn' },
  // rule 6: every selected-state signal of its :is() list
  { cls: 'is-selected', sel: '.pm6-tb-menu-item' },
  { attr: ['aria-checked', 'true'], sel: '.pm6-tt-mode, [role="menuitemradio"]' },
  { cls: 'active', sel: '.activity-bar .icon, .domain-link, .side-link, .workspace-tab, .manager-tab, .resource-row, .pm7u-navbtn, .pm7u-poprow, .orch-tab, .chat-dropdown-item, .chat-thread-item' },
  { cls: 'is-active', sel: '.index-link, .pm51-popout-item' },
  { cls: 'is-current', sel: '.page-index-title' },
  { cls: 'selected', sel: '.fm-row' },
  { attr: ['aria-selected', 'true'], sel: '[role="option"], .pm51-popout-item' },
];

const browser = await chromium.connectOverCDP(endpoint);
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage(); page.setDefaultTimeout(20000);
const result = { url, rulesFile, started: new Date().toISOString(), states: 0, checks: 0, mismatches: [], maxMatches: {}, missingFeatures: {}, errors: [] };
page.on('pageerror', (e) => result.errors.push(String(e).slice(0, 200)));

async function check(label) {
  const r = await page.evaluate(([rules, force]) => {
    const where = (el) => { const p = []; for (let e = el; e && e.nodeType === 1 && p.length < 5; e = e.parentElement) { if (e.id) { p.unshift('#' + e.id); break; } p.unshift(e.tagName.toLowerCase() + (e.classList[0] ? '.' + e.classList[0] : '')); } return p.join('>'); };
    const compare = (forced) => rules.flatMap((rule) => rule.variants.map((v, vi) => {
      const a = new Set(document.querySelectorAll(v.original));
      if (rule.omit) return { rule: rule.rule, variant: vi, forced, a: a.size, ok: a.size === 0, sample: [...a].slice(0, 3).map(where) };
      const b = new Set(document.querySelectorAll(v.replacement));
      const onlyA = [...a].filter((x) => !b.has(x)), onlyB = [...b].filter((x) => !a.has(x));
      return { rule: rule.rule, variant: vi, forced, a: a.size, b: b.size, ok: !onlyA.length && !onlyB.length,
        missing: onlyA.map((e) => (e.classList.length ? [...e.classList].map((c) => '.' + c) : [e.tagName.toLowerCase()])),
        sample: onlyA.slice(0, 4).map((e) => 'A ' + where(e)).concat(onlyB.slice(0, 2).map((e) => 'B ' + where(e))) };
    }));
    const res = compare(false);
    const added = [], attrs = [];
    for (const f of force) { let els = []; try { els = document.querySelectorAll(f.sel); } catch (e) { continue; }
      for (const el of els) {
        if (f.cls && !el.classList.contains(f.cls)) { el.classList.add(f.cls); added.push([el, f.cls]); }
        if (f.attr && el.getAttribute(f.attr[0]) !== f.attr[1]) { attrs.push([el, f.attr[0], el.getAttribute(f.attr[0])]); el.setAttribute(f.attr[0], f.attr[1]); }
      } }
    try { res.push(...compare(true)); }
    finally { for (const [el, c] of added) el.classList.remove(c); for (const [el, n, v] of attrs.reverse()) { if (v === null) el.removeAttribute(n); else el.setAttribute(n, v); } }
    return res;
  }, [RULES, FORCE]);
  result.states++;
  for (const x of r) {
    result.checks++; result.maxMatches[x.rule] = Math.max(result.maxMatches[x.rule] || 0, x.a);
    if (!x.ok) { const { missing, ...rest } = x; result.mismatches.push({ state: label, ...rest });
      const m = (result.missingFeatures[x.rule] = result.missingFeatures[x.rule] || {}); for (const feats of missing || []) { const k = feats.join(''); m[k] = (m[k] || 0) + 1; } }
  }
}
const tryClick = async (el) => { try { await el.scrollIntoViewIfNeeded({ timeout: 2000 }); await el.click({ timeout: 3000 }); return true; } catch { try { await el.evaluate((e) => e.click()); return true; } catch { return false; } } };
const iconNames = () => [...new Set([...Object.keys(PMR.neonMap || {}), ...Object.keys(window.PM_ICONS || {})])];

try {
  await page.goto(url + (url.includes('?') ? '&' : '?') + 'o55=off', { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => window.PM7_SETTINGS_TOME && window.PM12_KIMI && window.PM_NIER && window.PMR && window.PMR.menu, null, { timeout: 240000 });
  await W(3000);
  for (const [family, mode] of [['nier', 'dark'], ['retro', 'dark'], ['glass', 'light'], ['basic', 'dark']]) {
    const look = family + '-' + mode;
    await page.evaluate(() => { if (PM_NIER.on() || PM_NIER.wanted()) PM_NIER.set(false, { sound: false }); });
    await page.waitForFunction(() => !PM_NIER.on() && !PM_NIER.wanted(), null, { timeout: 15000 }).catch(() => {});
    await page.evaluate(([f, m]) => { PM7_SETTINGS_TOME.setChromeThemeFamily(f === 'nier' ? 'basic' : f); PM7_SETTINGS_TOME.setChromeThemeMode(m); }, [family, mode]);
    await W(1200);
    if (family === 'nier') { await page.evaluate(() => PM_NIER.set(true, { sound: false })); await page.waitForFunction(() => PM_NIER.on(), null, { timeout: 15000 }).catch(() => {}); await W(2500); }
    for (const pg of ['dashboard', 'projects', 'wizard', 'orchestrator', 'usage', 'settings']) { await page.evaluate((p) => document.getElementById('tab-' + p).click(), pg); await W(1300); await check(look + ' page ' + pg); }
    const domains = await page.locator('#pm-settings-root .domain-link').count();
    for (let i = 0; i < domains; i++) { if (await tryClick(page.locator('#pm-settings-root .domain-link').nth(i))) { await W(900); await check(look + ' settings domain ' + i); } }
    const icons = await page.locator('.activity-bar .icon:visible').count();
    for (let i = 0; i < icons; i++) {
      if (!(await tryClick(page.locator('.activity-bar .icon:visible').nth(i)))) continue; await W(900); await check(look + ' rail ' + i);
      const segs = await page.locator('#sidePanelSlot .pm-segtab-item:visible').count();
      for (let j = 0; j < Math.min(segs, 6); j++) { if (await tryClick(page.locator('#sidePanelSlot .pm-segtab-item:visible').nth(j))) { await W(700); await check(look + ' rail ' + i + ' seg ' + j); } }
    }
    await page.evaluate((src) => {
      const names = (0, eval)(src)();
      const items = names.map((n, i) => ({ label: 'Icon ' + n, icon: n, value: 'v' + i, meta: i % 3 ? 'meta' : null, key: i % 5 ? null : 'Ctrl+' + (i % 9), disabled: i % 11 === 0 ? 'off' : null, danger: i % 13 === 0 }));
      items.push({ label: 'More', submenu: 'sub1', icon: names[0] }, { label: 'No icon', value: 'x' });
      PMR.menu.open({ id: 'adg-radio', label: 'Guard', value: 'v1', groups: [{ label: 'All icons', items }] }, document.querySelector('.activity-bar .icon') || document.body,
        { menus: { sub1: { id: 'sub1', groups: [{ items: [{ label: 'Sub A', value: 'a', icon: names[1] }, { label: 'Sub B', value: 'b', key: 'K' }] }] } } });
    }, iconNames.toString());
    await W(700); await check(look + ' fixture radio menu');
    const sub = page.locator('.pmr-mi.has-sub').first(); if (await sub.count()) { await sub.hover().catch(() => {}); await W(600); await check(look + ' fixture submenu'); }
    await page.evaluate((src) => { PMR.menu.closeAll(); const names = (0, eval)(src)();
      PMR.menu.open({ id: 'adg-multi', multi: true, groups: [{ items: names.map((n, i) => ({ label: n, icon: i % 2 ? n : null, value: 'm' + i, checked: i % 2 === 0, meta: 'x' })) }] }, document.querySelector('.activity-bar .icon') || document.body, {}); }, iconNames.toString());
    await W(700); await check(look + ' fixture multi menu');
    await page.evaluate(() => PMR.menu.closeAll()); await W(300);
    const more = page.locator('.activity-bar [data-act="more"], .activity-bar .d-more, .activity-bar [aria-label*="More"]').first();
    if (await more.count()) { await tryClick(more); await W(700); await check(look + ' more tray'); await page.evaluate(() => PMR.menu.closeAll()); }
    process.stdout.write(look + ' ');
  }
} finally {
  result.finished = new Date().toISOString();
  result.notExercised = RULES.filter((r) => !r.omit && !(result.maxMatches[r.rule] > 0)).map((r) => r.rule);
  result.pass = !result.mismatches.length && !result.notExercised.length && !result.errors.length && result.states > 0;
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  await ctx.close().catch(() => {}); await browser.close().catch(() => {});
}
console.log('\n' + JSON.stringify({ pass: result.pass, states: result.states, checks: result.checks, mismatches: result.mismatches.length, missingFeatures: result.missingFeatures, notExercised: result.notExercised, errors: result.errors.length }));
process.exit(result.pass ? 0 : 1);
