/* Rail acceptance check: boots LeftRailPMConcept7.html headless over file:// (?o55=off), and for each concept checks
 * the redesigned panels by real clicks against the reference page (PMConcept7.html):
 *   - no new console errors; the concept view replaces the original panel when its icon is clicked;
 *   - reach: a crawler opens every element the concept marks [data-pmr-nav] (tabs, expanders, drill rows, row
 *     selection, menu triggers, submenus) and collects every data-demo-action/-arg pair it can see; every pair of the
 *     original panel must be reachable;
 *   - no horizontal overflow at 240 / 280 / 320 / 480 px; computed text >= 11 px (menus excepted: the chat picker's
 *     group label is 10 px by design); no pills (filled or bordered, radius >= half height); no coloured side bars;
 *     every open popup inside a concept is a PMR menu; reduced motion leaves nothing animating;
 *   - every theme family x light/dark, and NieR Mode light/dark: view visible, no overflow at 280, type floor, pills.
 *
 *   node Concepts/leftrail-redesign/tools/rail_boot.mjs <out-dir> [--page P] [--ref R] [--concepts a,b,c]
 *        [--panels files,source,docker] [--themes all|basic-dark,...] [--quick] [--shots]
 * Writes <out-dir>/rail-boot.json, prints a summary, exits 1 when a check fails. --shots writes rail screenshots per
 * concept x theme x panel into <out-dir>/shots (review media: delete after review). Profiles are deleted on close. */
import { launch, sleep } from '../../onboarding/opus-5.5/tools/chrome.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const concepts = resolve(here, '../..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : d; };
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/rail-boot');
mkdirSync(out, { recursive: true });
const PAGE = resolve(opt('page', join(concepts, 'LeftRailPMConcept7.html')));
const REF = resolve(opt('ref', join(concepts, 'PMConcept7.html')));
const ALL_THEMES = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light'];
const themesOpt = opt('themes', 'all');
const THEMES = themesOpt === 'all' ? ALL_THEMES : String(themesOpt).split(',');
const CONCEPTS = String(opt('concepts', 'a,b,c')).split(',');
const PANELS = String(opt('panels', 'files,source,docker')).split(',');
const QUICK = !!opt('quick', false);
const SHOTS = !!opt('shots', false);
const TARGET = { files: 'panel-files', source: 'panel-source', docker: 'panel-docker' };
const norm = (e) => e.replace(/file:\/\/\S+?\.html(:\d+)*(:\d+)?/g, '<page>').replace(/\s+/g, ' ').trim();

/* ---- in-page helpers (stringified into the page once) ---- */
const PAGE_LIB = () => {
  const L = window.__railCheck = {};
  L.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  L.visible = (el) => { if (!el || !el.isConnected) return false; const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.02; };
  L.view = (panel) => document.querySelector(`.pmr-view[data-pmr-for="panel-${panel}"]`);
  L.roots = (panel) => [L.view(panel), document.getElementById('pmr-overlay'), ...document.querySelectorAll('.pmr-menu')].filter(Boolean);
  L.pairs = (panel) => { const s = new Set(); for (const r of L.roots(panel)) r.querySelectorAll('[data-demo-action]').forEach((e) => s.add(e.getAttribute('data-demo-action') + ' | ' + (e.getAttribute('data-demo-arg') || ''))); return s; };
  L.open = async (panel) => {
    const icon = document.querySelector(`#activityBar .icon[data-target="${'panel-' + panel}"]`);
    const slot = document.getElementById('sidePanelSlot');
    const orig = document.getElementById('panel-' + panel);
    if (!(orig && orig.classList.contains('active') && !slot.classList.contains('hidden'))) icon.click();
    await L.sleep(450);
    return { viewShown: L.visible(L.view(panel)), originalHidden: !L.visible(orig) };
  };
  /* crawl: click every [data-pmr-nav] once (and every submenu item), collecting pairs; restore with Escape */
  L.crawl = async (panel, budget) => {
    const seen = L.pairs(panel), clicked = new Set(); let steps = 0;
    const key = (el) => el.getAttribute('data-pmr-nav-id') || (el.getAttribute('data-pmr-nav') + '|' + (el.textContent || '').trim().slice(0, 60) + '|' + (el.getAttribute('aria-label') || ''));
    for (let pass = 0; pass < 6 && steps < budget; pass++) {
      let progressed = false;
      const cands = L.roots(panel).flatMap((r) => [...r.querySelectorAll('[data-pmr-nav], .pmr-mi.has-sub')]).filter(L.visible);
      for (const el of cands) {
        if (steps >= budget) break;
        if (!el.isConnected || !L.visible(el)) continue;
        const k = key(el); if (clicked.has(k)) continue;
        clicked.add(k); steps++; progressed = true;
        el.click();
        await L.sleep(el.matches('.pmr-mi.has-sub') ? 260 : 360);
        L.pairs(panel).forEach((p) => seen.add(p));
        if (document.querySelector('.pmr-menu')) {           // a menu opened: read it (and its submenus), then close it
          for (const sub of [...document.querySelectorAll('.pmr-menu .pmr-mi.has-sub')]) {
            const sk = 'sub|' + sub.textContent.trim(); if (clicked.has(sk)) continue; clicked.add(sk);
            sub.click(); await L.sleep(260); L.pairs(panel).forEach((p) => seen.add(p));
          }
          /* menu items that navigate (data-pmr-nav: a view in an overflow menu, a sibling page): reopen the menu for
             each one, choose it, and collect what the new view shows; later passes crawl that view's own nav */
          const navLabels = [...document.querySelectorAll('.pmr-menu .pmr-mi[data-pmr-nav]')].map((m) => m.textContent.trim()).filter((t) => !clicked.has('mnav|' + t));
          window.PMR.menu.closeAll(); await L.sleep(300);
          for (const label of navLabels) {
            if (steps >= budget || !el.isConnected || !L.visible(el)) break;
            clicked.add('mnav|' + label); steps++;
            el.click(); await L.sleep(360);
            const item = [...document.querySelectorAll('.pmr-menu .pmr-mi[data-pmr-nav]')].find((m) => m.textContent.trim() === label);
            if (!item) { window.PMR.menu.closeAll(); await L.sleep(300); continue; }
            item.click(); await L.sleep(420);
            L.pairs(panel).forEach((p) => seen.add(p));
            if (document.querySelector('.pmr-menu')) { window.PMR.menu.closeAll(); await L.sleep(300); }
          }
        }
      }
      if (!progressed) break;
    }
    return { pairs: [...seen], steps };
  };
  L.overflow = (panel) => {
    const v = L.view(panel); if (!v) return { error: 'no view' };
    const vr = v.getBoundingClientRect(); const bad = [];
    v.querySelectorAll('*').forEach((el) => {
      if (!L.visible(el)) return;
      const r = el.getBoundingClientRect();
      if (r.right > vr.right + 1.5 || r.left < vr.left - 1.5) {
        const cs = getComputedStyle(el.parentElement || el);
        let p = el.parentElement, clipped = false;
        while (p && p !== v) { const pc = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(pc.overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= vr.right + 1.5 && pr.left >= vr.left - 1.5) { clipped = true; break; } } p = p.parentElement; }
        if (!clipped) bad.push((el.className && el.className.baseVal === undefined ? String(el.className) : el.tagName).slice(0, 60) + ' ' + Math.round(r.right - vr.right) + 'px');
      }
    });
    return { scroll: v.scrollWidth - v.clientWidth, offenders: bad.slice(0, 8), count: bad.length };
  };
  L.typeFloor = (panel) => {
    let min = 99, where = '';
    for (const r of L.roots(panel)) {
      const walker = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue;
        const el = n.parentElement; if (!el || !L.visible(el)) continue;
        if (el.closest('.pmr-menu') && el.closest('.pm6-chat-modelgroup')) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < min) { min = fs; where = (String(el.className) || el.tagName).slice(0, 50) + ' "' + n.textContent.trim().slice(0, 24) + '"'; }
      }
    }
    return { min, where };
  };
  L.pills = (panel) => {
    const bad = [];
    for (const r of L.roots(panel)) r.querySelectorAll('*').forEach((el) => {
      if (!L.visible(el) || el.closest('svg')) return;
      const cs = getComputedStyle(el); const rc = el.getBoundingClientRect();
      if (rc.height < 8 || rc.height > 34 || rc.width < rc.height * 1.25) return;
      const filled = cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
      const bordered = parseFloat(cs.borderTopWidth) > 0 && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.borderTopColor);
      const rad = parseFloat(cs.borderTopLeftRadius);
      if ((filled || bordered) && rad >= rc.height / 2 - 1) bad.push((String(el.className) || el.tagName).slice(0, 60) + ' ' + Math.round(rc.width) + 'x' + Math.round(rc.height) + ' r' + rad);
    });
    return bad.slice(0, 10);
  };
  L.sidebars = (panel) => {
    const bad = [];
    for (const r of L.roots(panel)) r.querySelectorAll('*').forEach((el) => {
      if (!L.visible(el)) return;
      const cs = getComputedStyle(el);
      for (const pseudo of [null, '::before', '::after']) {
        const c = pseudo ? getComputedStyle(el, pseudo) : cs;
        if (pseudo && (c.content === 'none' || c.content === 'normal')) continue;
        const bl = parseFloat(c.borderLeftWidth), br = parseFloat(c.borderRightWidth), bt = parseFloat(c.borderTopWidth);
        if (bl >= 2 && (br < bl || bt < bl) && !/rgba\(0, 0, 0, 0\)|transparent/.test(c.borderLeftColor)) bad.push((String(el.className) || el.tagName).slice(0, 50) + (pseudo || '') + ' border-left ' + bl);
        const m = /inset\s+(\d+(?:\.\d+)?)px\s+0/.exec(c.boxShadow || '') || /(?:^|,)\s*(?:rgba?\([^)]*\)|#\w+)\s+(\d+(?:\.\d+)?)px\s+0px\s+0px\s+0px\s+inset/.exec(c.boxShadow || '');
        if (m && parseFloat(m[1]) >= 2) bad.push((String(el.className) || el.tagName).slice(0, 50) + (pseudo || '') + ' inset bar');
        if (pseudo) { const rc = el.getBoundingClientRect(); const w = parseFloat(c.width); const h = parseFloat(c.height); if (w >= 2 && w <= 4 && h >= rc.height * 0.6 && c.position === 'absolute' && !/rgba\(0, 0, 0, 0\)|transparent|none/.test(c.backgroundColor)) bad.push((String(el.className) || el.tagName).slice(0, 50) + pseudo + ' bar ' + w + 'px'); }
      }
    });
    return bad.slice(0, 10);
  };
  L.foreignMenus = (panel) => { const v = L.view(panel); return v ? v.querySelectorAll('.pm6-tb-menu, select').length : -1; };
  L.setWidth = async (w) => { const s = document.getElementById('sidePanelSlot'); s.style.setProperty('width', w + 'px', 'important'); s.style.setProperty('flex', 'none', 'important'); await L.sleep(350); return Math.round(s.getBoundingClientRect().width); };
  L.clearWidth = async () => { const s = document.getElementById('sidePanelSlot'); s.style.removeProperty('width'); s.style.removeProperty('flex'); await L.sleep(250); };
  L.theme = async (slug, nier) => {
    if (window.PM_NIER && window.PM_NIER.setTransition) window.PM_NIER.setTransition((repaint) => repaint());
    const [fam, mode] = slug.split('-');
    if (nier) { if (window.PM_NIER && !window.PM_NIER.on()) await window.PM_NIER.set(true); }
    else if (window.PM_NIER && window.PM_NIER.on()) await window.PM_NIER.set(false);
    window.PM_THEME.setFamily(fam); window.PM_THEME.setMode(mode);
    await L.sleep(900);
    return { theme: document.documentElement.getAttribute('data-theme'), nier: document.documentElement.getAttribute('data-o55-nier') };
  };
};

async function bootPage(file, { width = 1600, height = 1000 } = {}) {
  const b = await launch({ width, height });
  await b.page.goto(pathToFileURL(file).href + '?o55=off');
  await sleep(2500);
  await b.page.evaluate(`(${PAGE_LIB.toString()})()`);
  return b;
}

async function refErrors() {
  const b = await bootPage(REF);
  try { await sleep(1500); return [...new Set(b.page.errors.map(norm))]; } finally { await b.close(); }
}
async function refPairs() {
  const b = await bootPage(REF);
  try {
    return await b.page.evaluate((panels) => {
      const o = {};
      for (const p of panels) { const s = new Set(); const el = document.getElementById('panel-' + p); el.querySelectorAll('[data-demo-action]').forEach((e) => s.add(e.getAttribute('data-demo-action') + ' | ' + (e.getAttribute('data-demo-arg') || ''))); if (p === 'files') document.querySelectorAll('#fileContextMenu [data-demo-action]').forEach((e) => s.add(e.getAttribute('data-demo-action') + ' | ' + (e.getAttribute('data-demo-arg') || ''))); o[p] = [...s]; }
      return o;
    }, PANELS);
  } finally { await b.close(); }
}

async function runConcept(c, ref) {
  const r = { concept: c, panels: {}, themes: {}, errors: [] };
  const b = await bootPage(PAGE);
  const { page } = b;
  try {
    const ready = await page.evaluate(async (cid) => { const L = window.__railCheck; for (let i = 0; i < 60 && !document.documentElement.hasAttribute('data-pmr-ready'); i++) await L.sleep(100); if (!window.PMR) return { ok: false, why: 'no PMR' }; window.PMR.concepts.set(cid); await L.sleep(800); return { ok: true, concept: document.documentElement.getAttribute('data-rail-concept'), switcher: !!document.querySelector('.pmr-switch') }; }, c);
    r.boot = ready;
    for (const p of PANELS) {
      const pr = {};
      pr.open = await page.evaluate((x) => window.__railCheck.open(x), p);
      if (!QUICK) {
        const cr = await page.evaluate((x, n) => window.__railCheck.crawl(x, n), p, 260);
        const reached = new Set(cr.pairs);
        pr.reach = { steps: cr.steps, reached: cr.pairs.length, missing: (ref[p] || []).filter((x) => !reached.has(x)) };
        pr.reach.missingCount = pr.reach.missing.length;
        pr.reach.missing = pr.reach.missing.slice(0, 12);
        await page.evaluate((x) => { window.PMR.menu.closeAll(); window.PMR.host.setConcept(window.PMR.concepts.current(), { force: true }); return window.__railCheck.open(x); }, p);
        await sleep(400);
      }
      pr.widths = {};
      for (const w of [240, 280, 320, 480]) {
        const got = await page.evaluate((x) => window.__railCheck.setWidth(x), w);
        pr.widths[w] = Object.assign({ got }, await page.evaluate((x) => window.__railCheck.overflow(x), p));
      }
      await page.evaluate(() => window.__railCheck.clearWidth());
      pr.type = await page.evaluate((x) => window.__railCheck.typeFloor(x), p);
      pr.pills = await page.evaluate((x) => window.__railCheck.pills(x), p);
      pr.sidebars = await page.evaluate((x) => window.__railCheck.sidebars(x), p);
      pr.foreignMenus = await page.evaluate((x) => window.__railCheck.foreignMenus(x), p);
      r.panels[p] = pr;
    }
    /* reduced motion: after switching a panel and clicking its first nav element nothing inside the rail animates */
    r.reduced = await page.evaluate(async (first) => {
      const L = window.__railCheck; const de = document.documentElement; de.setAttribute('data-motion', 'reduced');
      await L.open(first); const nav = L.view(first) && L.view(first).querySelector('[data-pmr-nav]'); if (nav) nav.click(); await L.sleep(60);
      const anims = document.getAnimations().filter((a) => { const t = a.effect && a.effect.target; return t && t.closest && (t.closest('.pmr-view') || t.closest('#pmr-overlay')) && a.playState === 'running'; }).length;
      de.removeAttribute('data-motion'); window.PMR.menu.closeAll(); return { running: anims };
    }, PANELS[0]);
    const themeList = QUICK ? ['basic-dark', 'retro-light'] : THEMES;
    const runs = themeList.map((t) => ({ slug: t, nier: false })).concat(QUICK ? [] : [{ slug: 'basic-dark', nier: true }, { slug: 'basic-light', nier: true }]);
    for (const t of runs) {
      const key = t.slug + (t.nier ? '+nier' : '');
      const tr = { set: await page.evaluate((s, n) => window.__railCheck.theme(s, n), t.slug, t.nier), panels: {} };
      for (const p of PANELS) {
        await page.evaluate((x) => window.__railCheck.open(x), p);
        await page.evaluate((x) => window.__railCheck.setWidth(x), 280);
        tr.panels[p] = {
          shown: await page.evaluate((x) => window.__railCheck.visible(window.__railCheck.view(x)), p),
          overflow: (await page.evaluate((x) => window.__railCheck.overflow(x), p)).count,
          type: (await page.evaluate((x) => window.__railCheck.typeFloor(x), p)).min,
          pills: (await page.evaluate((x) => window.__railCheck.pills(x), p)).length,
        };
        if (SHOTS) {
          mkdirSync(join(out, 'shots'), { recursive: true });
          const clip = await page.evaluate(() => { const a = document.getElementById('activityBar').getBoundingClientRect(), s = document.getElementById('sidePanelSlot').getBoundingClientRect(); return { x: Math.floor(a.left), y: Math.floor(Math.min(a.top, s.top)), width: Math.ceil(s.right - a.left + 2), height: Math.ceil(Math.max(a.bottom, s.bottom) - Math.min(a.top, s.top)), scale: 1 }; });
          await page.screenshot(join(out, 'shots', `${c}-${key}-${p}.png`), { clip });
        }
      }
      await page.evaluate(() => window.__railCheck.clearWidth());
      r.themes[key] = tr;
    }
    await page.evaluate(() => window.__railCheck.theme('basic-dark', false));
  } catch (e) {
    r.fatal = String(e && e.stack || e).slice(0, 600);
  } finally {
    r.errors = [...new Set(page.errors.map(norm))];
    await b.close();
  }
  return r;
}

const ref = { errors: await refErrors(), pairs: await refPairs() };
const results = [];
for (const c of CONCEPTS) results.push(await runConcept(c, ref.pairs));

/* verdicts */
const fails = [];
for (const r of results) {
  const c = r.concept;
  if (r.fatal) fails.push(`${c}: fatal ${r.fatal.split('\n')[0]}`);
  if (!r.boot || !r.boot.ok || r.boot.concept !== c) fails.push(`${c}: did not boot into the concept (${JSON.stringify(r.boot)})`);
  const newErr = r.errors.filter((e) => !ref.errors.includes(e));
  if (newErr.length) fails.push(`${c}: ${newErr.length} new console errors: ${newErr.slice(0, 3).join(' || ')}`);
  for (const [p, pr] of Object.entries(r.panels)) {
    if (!pr.open || !pr.open.viewShown || !pr.open.originalHidden) fails.push(`${c}/${p}: view not shown or original not hidden (${JSON.stringify(pr.open)})`);
    if (pr.reach && pr.reach.missingCount) fails.push(`${c}/${p}: ${pr.reach.missingCount} original actions not reachable, e.g. ${pr.reach.missing.slice(0, 3).join(' ;; ')}`);
    for (const [w, o] of Object.entries(pr.widths || {})) if (o.count || o.scroll > 1) fails.push(`${c}/${p}: overflow at ${w}px (${o.count} elements, scroll ${o.scroll}) ${o.offenders.slice(0, 3).join(', ')}`);
    if (pr.type && pr.type.min < 11) fails.push(`${c}/${p}: text below 11px (${pr.type.min}px at ${pr.type.where})`);
    if (pr.pills && pr.pills.length) fails.push(`${c}/${p}: pill-shaped elements: ${pr.pills.slice(0, 3).join(', ')}`);
    if (pr.sidebars && pr.sidebars.length) fails.push(`${c}/${p}: coloured side bars: ${pr.sidebars.slice(0, 3).join(', ')}`);
    if (pr.foreignMenus) fails.push(`${c}/${p}: ${pr.foreignMenus} non-PMR menus/selects inside the concept view`);
  }
  if (r.reduced && r.reduced.running) fails.push(`${c}: ${r.reduced.running} animations running under reduced motion`);
  for (const [t, tr] of Object.entries(r.themes)) for (const [p, x] of Object.entries(tr.panels)) {
    if (!x.shown) fails.push(`${c}/${t}/${p}: view not visible`);
    if (x.overflow) fails.push(`${c}/${t}/${p}: overflow at 280px (${x.overflow})`);
    if (x.type < 11) fails.push(`${c}/${t}/${p}: text below 11px (${x.type})`);
    if (x.pills) fails.push(`${c}/${t}/${p}: ${x.pills} pill-shaped elements`);
  }
}
const summary = { page: PAGE, ref: REF, refErrors: ref.errors.length, refPairs: Object.fromEntries(Object.entries(ref.pairs).map(([k, v]) => [k, v.length])), concepts: results.map((r) => ({ concept: r.concept, errors: r.errors.length, reach: Object.fromEntries(Object.entries(r.panels).map(([p, x]) => [p, x.reach ? `${x.reach.reached} seen, ${x.reach.missingCount} missing` : 'skipped'])), type: Object.fromEntries(Object.entries(r.panels).map(([p, x]) => [p, x.type && x.type.min])) })), fails };
writeFileSync(join(out, 'rail-boot.json'), JSON.stringify({ summary, results }, null, 2));
console.log(JSON.stringify(summary, null, 1));
console.log(fails.length ? `rail boot: ${fails.length} failing checks` : 'rail boot: ok');
process.exit(fails.length ? 1 : 0);
