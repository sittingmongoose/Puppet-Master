/* Rail acceptance check: boots LeftRailPMConcept7.html over file:// (?o55=off) in GPU Chrome on the VM (one
 * agent-browser headless session per boot, driven through playwright-core connectOverCDP), and for each concept
 * checks the redesigned panels by real clicks against the reference page (PMConcept7.html):
 *   - no new console errors; the concept view replaces the original panel when its icon is clicked. A skin concept
 *     (registered with skin: true, today d "Polish"; 'current' is checked the same way) keeps the shell's own panels
 *     instead: the original panel must stay visible and its reach is read straight off it, not crawled;
 *   - reach: a crawler opens every element the concept marks [data-pmr-nav] (tabs, expanders, drill rows, row
 *     selection, menu triggers, submenus) and collects every data-demo-action/-arg pair it can see; every pair of the
 *     original panel must be reachable;
 *   - no horizontal overflow at 240 / 280 / 320 / 480 px; computed text >= 11 px (menus excepted: the chat picker's
 *     group label is 10 px by design); no pills (filled or bordered, radius >= half height); no coloured side bars;
 *     every open popup inside a concept is a PMR menu — for a skin concept instead: every visible
 *     .pm6-tb-menu-trigger of the panel must sprout a chat-style .pmr-menu, never the shell's .pm6-tb-menu, and no
 *     <select> may be visible inside the panel ('current' reports only); reduced motion leaves nothing animating;
 *   - every theme family x light/dark, and NieR Mode light/dark: view visible, no overflow at 280, type floor, pills.
 *   - --restore: boots Current, snapshots the rail's nine panels and the activity bar (normalised as the kit's
 *     t-restore.mjs does), uses D (every panel, every tab, two expanders and a menu per panel, the Git/Jujutsu engine
 *     switch both ways), goes back to Current, snapshots again and fails on any difference, per panel and theme.
 *
 *   node Concepts/leftrail-redesign/tools/rail_boot.mjs <out-dir> [--page P] [--ref R] [--concepts a,b,c,d|none]
 *        [--panels files,source,docker] [--themes all|basic-dark,...] [--quick] [--shots] [--restore]
 * Skin concepts (d, current) are checked on all nine rail panels, the view concepts (a, b, c) on their three
 * (files, source, docker); --panels overrides both. Writes <out-dir>/rail-boot.json (summary.gpu names the WebGL
 * renderer), prints a summary, exits 1 when a check fails. --shots writes rail screenshots per concept x theme x panel
 * into <out-dir>/shots (review media: delete after review). Every agent-browser session is stopped when its page is
 * done (finally, SIGINT, SIGTERM); profiles are deleted by agent-browser at stop. Running on the GPU is mandatory:
 * --disable-gpu and swiftshader flags are forbidden, and a browser whose WebGL UNMASKED_RENDERER_WEBGL names
 * SwiftShader or llvmpipe aborts the run with the failing check `not on the GPU: <renderer>`. */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { homedir } from 'node:os';

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
const CONCEPTS = opt('concepts', 'a,b,c,d') === 'none' ? [] : String(opt('concepts', 'a,b,c,d')).split(',');
/* the rail's nine panels in activity-bar order (keep in step with PANEL_IDS in 00-d.js) */
const ALL_PANELS = ['files', 'search', 'source', 'git', 'docker', 'testing', 'run', 'agents', 'artifacts'];
const VIEW_PANELS = ['files', 'source', 'docker'];
const PANELS_OPT = opt('panels', null);
const panelsFor = (skin) => (PANELS_OPT ? String(PANELS_OPT).split(',') : (skin ? ALL_PANELS : VIEW_PANELS));
const TARGET = Object.fromEntries(ALL_PANELS.map((p) => [p, 'panel-' + p]));
const QUICK = !!opt('quick', false);
const SHOTS = !!opt('shots', false);
const RESTORE = !!opt('restore', false);
const norm = (e) => e.replace(/file:\/\/\S+?\.html(:\d+)*(:\d+)?/g, '<page>').replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* playwright-core is resolved by absolute path (createRequire) so this script also runs from the repository
   (Concepts/leftrail-redesign/tools/, which has no node_modules): env PM_PLAYWRIGHT (a directory containing
   playwright-core), then the lane's node_modules, then ~/pm-motion-lab. */
function loadChromium() {
  const req = createRequire(import.meta.url);
  const roots = [];
  if (process.env.PM_PLAYWRIGHT) roots.push(process.env.PM_PLAYWRIGHT);
  roots.push('/home/sittingmongoose/PM-Experiments/leftrail-redesign-20261002/node_modules');
  roots.push(join(homedir(), 'pm-motion-lab', 'node_modules'));
  for (const root of roots) {
    const dir = join(root, 'playwright-core');
    if (!existsSync(join(dir, 'package.json'))) continue;
    try {
      const pw = req(dir);
      if (pw && pw.chromium && typeof pw.chromium.connectOverCDP === 'function') return pw.chromium;
    } catch (_) { /* try the next root */ }
  }
  throw new Error(`playwright-core not found (set PM_PLAYWRIGHT to a directory containing playwright-core); tried: ${roots.map((r) => join(r, 'playwright-core')).join(', ')}`);
}
let chromium;
try { chromium = loadChromium(); } catch (e) { console.error(`rail boot: ${e.message}`); process.exit(1); }

/* agent-browser sessions: every started id is tracked and stopped on every exit path (close() in finally, plus
   SIGINT/SIGTERM), so no headless Chrome of this harness survives a run or an interrupt. */
const openSessions = new Set();
function stopSession(id) {
  openSessions.delete(id);
  try { execFileSync('agent-browser', ['stop', id], { stdio: 'ignore', timeout: 90000 }); } catch (_) { /* already gone */ }
}
for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, () => { for (const id of [...openSessions]) stopSession(id); process.exit(sig === 'SIGINT' ? 130 : 143); });

/* the run must be on the VM GPU: once per browser, read the WebGL renderer and abort on a software one */
const GPU_PROBE = () => { const g = document.createElement('canvas').getContext('webgl'); if (!g) return 'no webgl'; const x = g.getExtension('WEBGL_debug_renderer_info'); return g.getParameter(x ? x.UNMASKED_RENDERER_WEBGL : g.RENDERER); };
const SOFT_GPU = /SwiftShader|llvmpipe/i;
let GPU = null;
class NoGpu extends Error { constructor(renderer) { super(`not on the GPU: ${renderer}`); this.renderer = renderer; } }

/* ---- in-page helpers (stringified into the page once) ---- */
const PAGE_LIB = () => {
  const L = window.__railCheck = {};
  L.skin = false; /* the harness sets this after the concept switch: skin concepts keep the shell's own panels */
  L.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  L.visible = (el) => { if (!el || !el.isConnected) return false; const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.02; };
  /* a skin concept renders no .pmr-view: its "view" is the shell's own panel under html[data-rail-skin] */
  L.view = (panel) => L.skin ? document.getElementById('panel-' + panel) : document.querySelector(`.pmr-view[data-pmr-for="panel-${panel}"]`);
  L.roots = (panel) => [L.view(panel), document.getElementById('pmr-overlay'), ...document.querySelectorAll('.pmr-menu')].filter(Boolean);
  /* a pair counts when an element carries it, or carries it as data-legacy-cmd/-arg (the fixture's canon replacement of
     an original action keeps the original pair there on purpose) */
  L.pairs = (panel) => { const s = new Set(); for (const r of L.roots(panel)) { r.querySelectorAll('[data-demo-action]').forEach((e) => s.add(e.getAttribute('data-demo-action') + ' | ' + (e.getAttribute('data-demo-arg') || ''))); r.querySelectorAll('[data-legacy-cmd]').forEach((e) => s.add(e.getAttribute('data-legacy-cmd') + ' | ' + (e.getAttribute('data-legacy-arg') || ''))); } return s; };
  L.open = async (panel) => {
    const icon = document.querySelector(`#activityBar .icon[data-target="${'panel-' + panel}"]`);
    const slot = document.getElementById('sidePanelSlot');
    const orig = document.getElementById('panel-' + panel);
    if (!(orig && orig.classList.contains('active') && !slot.classList.contains('hidden'))) icon.click();
    await L.sleep(450);
    /* a skin concept never hides the original panel (it is the view), so originalHidden is not a requirement */
    return L.skin ? { viewShown: L.visible(orig), originalHidden: null } : { viewShown: L.visible(L.view(panel)), originalHidden: !L.visible(orig) };
  };
  /* skin reach: no crawler — collect the pairs straight off the original panel plus #fileContextMenu (Files) and any
     open .pmr-menu, exactly like refPairs() collects them off the reference page */
  L.directPairs = (panel) => {
    const s = new Set();
    const roots = [document.getElementById('panel-' + panel)];
    if (panel === 'files') roots.push(document.getElementById('fileContextMenu'));
    roots.push(...[...document.querySelectorAll('.pmr-menu')].filter(L.visible));
    for (const r of roots) { if (r) r.querySelectorAll('[data-demo-action]').forEach((e) => s.add(e.getAttribute('data-demo-action') + ' | ' + (e.getAttribute('data-demo-arg') || ''))); }
    return [...s];
  };
  /* crawl (depth-first): click every visible [data-pmr-nav] once; after a click that shows something new (a tab, a
     drill, a selection, a navigating menu item) crawl the new state to completion before moving on; after a drill,
     go back once ([data-pmr-nav="back"]) so the parent page continues. Every submenu is opened and read. */
  L.crawl = async (panel, budget) => {
    const seen = L.pairs(panel), clicked = new Set(); let steps = 0;
    const key = (el) => el.getAttribute('data-pmr-nav-id') || (el.getAttribute('data-pmr-nav') + '|' + (el.textContent || '').trim().slice(0, 60) + '|' + (el.getAttribute('aria-label') || ''));
    const collect = () => L.pairs(panel).forEach((p) => seen.add(p));
    const navs = () => L.roots(panel).flatMap((r) => [...r.querySelectorAll('[data-pmr-nav]')]).filter((e) => e.getAttribute('data-pmr-nav') !== 'back' && L.visible(e) && !e.closest('.pmr-menu') && !clicked.has(key(e)));
    const goBack = async () => { const b = L.roots(panel).flatMap((r) => [...r.querySelectorAll('[data-pmr-nav="back"]')]).find(L.visible); if (b) { b.click(); await L.sleep(420); } };
    async function readMenu(el, depth) {
      for (const sub of [...document.querySelectorAll('.pmr-menu .pmr-mi.has-sub')]) {
        const sk = 'sub|' + sub.textContent.trim(); if (clicked.has(sk)) continue; clicked.add(sk);
        sub.click(); await L.sleep(260); collect();
      }
      const labels = [...document.querySelectorAll('.pmr-menu .pmr-mi[data-pmr-nav]')].map((m) => ({ t: m.textContent.trim(), kind: m.getAttribute('data-pmr-nav') })).filter((x) => !clicked.has('mnav|' + x.t));
      window.PMR.menu.closeAll(); await L.sleep(300);
      for (const { t, kind } of labels) {
        if (steps >= budget || !el.isConnected || !L.visible(el)) break;
        clicked.add('mnav|' + t); steps++;
        el.click(); await L.sleep(360);
        const item = [...document.querySelectorAll('.pmr-menu .pmr-mi[data-pmr-nav]')].find((m) => m.textContent.trim() === t);
        if (!item) { window.PMR.menu.closeAll(); await L.sleep(300); continue; }
        const before = new Set(navs().map(key));
        item.click(); await L.sleep(420); collect();
        if (document.querySelector('.pmr-menu')) { window.PMR.menu.closeAll(); await L.sleep(300); }
        await explore(depth + 1, before);
        if (kind === 'drill') await goBack();
      }
    }
    /* order inside a pass: things that reveal content in place first, then drills, then menus, then tabs, so a view is
       exhausted before the crawler leaves it */
    const RANK = { tab: 4, menu: 3, drill: 2 };
    const rank = (e) => RANK[e.getAttribute('data-pmr-nav')] || 0;
    async function explore(depth, scope) {
      if (depth > 12) return;
      for (let pass = 0; pass < 14 && steps < budget; pass++) {
        let cands = navs();
        if (scope) cands = cands.filter((e) => !scope.has(key(e)));      // only what the parent click revealed
        if (!cands.length) return;
        cands.sort((x, y) => rank(x) - rank(y));
        let progressed = false;
        for (const el of cands) {
          if (steps >= budget) return;
          if (!el.isConnected || !L.visible(el)) continue;
          const k = key(el); if (clicked.has(k)) continue;
          const kind = el.getAttribute('data-pmr-nav');
          const before = new Set(navs().map(key));
          clicked.add(k); steps++; progressed = true;
          el.click(); await L.sleep(360); collect();
          if (document.querySelector('.pmr-menu')) { await readMenu(el, depth); continue; }
          await explore(depth + 1, before);
          if (kind === 'drill') await goBack();
        }
        if (!progressed) return;
      }
    }
    await explore(0);
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
  /* skin menu probe: one visible .pm6-tb-menu-trigger at a time — click it, wait 400 ms and report what opened
     ('pmr' = a chat-style menu, 'shell' = the shell's own sprout menu, 'none'); PMR.menu.closeAll() runs in-page,
     the harness presses Escape after each probe */
  L.menuTriggerCount = (panel) => { const p = document.getElementById('panel-' + panel); return p ? [...p.querySelectorAll('.pm6-tb-menu-trigger')].filter(L.visible).length : 0; };
  L.menuTriggerProbe = async (panel, idx) => {
    const p = document.getElementById('panel-' + panel);
    const t = p && [...p.querySelectorAll('.pm6-tb-menu-trigger')].filter(L.visible)[idx];
    if (!t) return { state: 'gone' };
    const label = ((t.getAttribute('aria-label') || t.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)) || 'trigger ' + idx;
    t.click();
    await L.sleep(400);
    const pmrOpen = [...document.querySelectorAll('.pmr-menu')].some(L.visible);
    const shellOpen = [...document.querySelectorAll('.pm6-tb-menu.is-open')].some(L.visible);
    try { window.PMR.menu.closeAll(); } catch (e) { /* PMR not up */ }
    return { state: pmrOpen ? 'pmr' : (shellOpen ? 'shell' : 'none'), label };
  };
  L.visibleSelects = (panel) => { const p = document.getElementById('panel-' + panel); return p ? [...p.querySelectorAll('select')].filter(L.visible).length : 0; };
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
  /* --restore: an element as the kit's t-restore.mjs normalises it for comparison (style attributes, the tab ink, the
     lazy hover-tag attributes and the tab / open state classes are dropped; the other classes sorted) */
  L.snap = (id) => {
    const el = document.getElementById(id).cloneNode(true);
    el.querySelectorAll('[style]').forEach((e) => e.removeAttribute('style'));
    el.querySelectorAll('.pm-segtab-ink').forEach((e) => e.remove());
    /* live clocks (the elapsed counters of running jobs) tick on their own: their digits are masked */
    el.querySelectorAll('[data-elapsed], [id$="LiveElapsed"]').forEach((e) => { e.removeAttribute('data-elapsed'); e.textContent = '#'; });
    return el.outerHTML.replace(/\s(aria-expanded|tabindex|data-fit|aria-selected|aria-hidden|title|aria-label|aria-describedby|data-pm-hover-[a-z-]+)="[^"]*"/g, '')
      .replace(/ class="([^"]*)"/g, (m, c) => ' class="' + c.split(/\s+/).filter((x) => x && !/^(pm-panel-enter|open|active|pm-hidden|is-menu-open|menu-open)$/.test(x)).sort().join(' ') + '"')
      .replace(/ class=""/g, ''); /* a class attribute left empty by a tab click is no attribute */
  };
  L.snapAll = (targets) => Object.fromEntries(Object.entries(targets).map(([k, id]) => [k, L.snap(id)]));
  L.walkTabs = async (root) => { for (const t of [...root.querySelectorAll('[data-tab]')].filter(L.visible)) { t.click(); await L.sleep(220); } };
  /* both snapshots are taken with every panel's tabs walked in the same order, so the tab state the shell leaves behind
     is the same on both sides (the kit's t-restore walks the tabs of Current before its snapshot too) */
  L.walkAll = async (panels) => { for (const p of panels) { await L.open(p); await L.walkTabs(document.getElementById('panel-' + p)); } };
  /* --restore: D used the way a reviewer uses it (each panel opened, its visible tabs clicked, two expanders and the first
     menu opened and closed, then the Git/Jujutsu engine switch both ways with the Jujutsu tabs walked) */
  L.useRail = async (panels) => {
    for (const p of panels) {
      await L.open(p);
      const root = document.getElementById('panel-' + p);
      await L.walkTabs(root);
      for (const h of [...root.querySelectorAll('.sh-shelf[data-acc] > .sh-head')].filter(L.visible).slice(0, 2)) { h.click(); await L.sleep(220); }
      const trig = [...root.querySelectorAll('.pm6-tb-menu-trigger')].filter(L.visible)[0];
      if (trig) { trig.click(); await L.sleep(300); window.PMR.menu.closeAll(); await L.sleep(200); }
    }
    await L.open('source');
    const engine = (e) => document.querySelector(`#panel-source [data-pm7-scm-engine="${e}"]`);
    if (engine('jj')) { engine('jj').click(); await L.sleep(400); await L.walkTabs(document.getElementById('panel-source')); }
    if (engine('git')) { engine('git').click(); await L.sleep(400); }
    return panels.length;
  };
};

async function bootPage(file, { width = 1600, height = 1000 } = {}) {
  const started = JSON.parse(execFileSync('agent-browser', ['start', '--url', 'about:blank'], { encoding: 'utf8', timeout: 120000 }));
  openSessions.add(started.id);
  let browser = null;
  const b = {
    id: started.id, errors: [], gpu: null, page: null, cdp: null,
    async close() {
      if (browser) { const x = browser; browser = null; try { await x.close(); } catch (_) { /* disconnect is best-effort */ } }
      stopSession(started.id);
    },
  };
  try {
    browser = await chromium.connectOverCDP(started.cdp_endpoint);
    const ctx = browser.contexts()[0];
    const page = ctx.pages()[0] || await ctx.newPage();
    page.on('pageerror', (e) => b.errors.push('PAGEERROR ' + String((e && e.message) || e).slice(0, 300)));
    page.on('console', (m) => { if (m.type() === 'error') b.errors.push('CONSOLE ' + m.text().slice(0, 300)); });
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await page.goto(pathToFileURL(file).href + '?o55=off', { waitUntil: 'load', timeout: 60000 });
    b.gpu = await page.evaluate(GPU_PROBE);
    if (GPU === null) GPU = b.gpu;
    if (SOFT_GPU.test(String(b.gpu))) throw new NoGpu(b.gpu);
    await sleep(2500);
    await page.evaluate(`(${PAGE_LIB.toString()})()`);
    b.page = page; b.cdp = cdp;
    return b;
  } catch (e) {
    await b.close();
    throw e;
  }
}

async function refErrors() {
  const b = await bootPage(REF);
  try { await sleep(1500); return [...new Set(b.errors.map(norm))]; } finally { await b.close(); }
}
async function refPairs() {
  const b = await bootPage(REF);
  try {
    return await b.page.evaluate((targets) => {
      const o = {};
      for (const [p, id] of Object.entries(targets)) { const s = new Set(); const el = document.getElementById(id); el.querySelectorAll('[data-demo-action]').forEach((e) => s.add(e.getAttribute('data-demo-action') + ' | ' + (e.getAttribute('data-demo-arg') || ''))); if (p === 'files') document.querySelectorAll('#fileContextMenu [data-demo-action]').forEach((e) => s.add(e.getAttribute('data-demo-action') + ' | ' + (e.getAttribute('data-demo-arg') || ''))); o[p] = [...s]; }
      return o;
    }, TARGET);
  } finally { await b.close(); }
}

/* skin-concept menu check: every visible .pm6-tb-menu-trigger of the panel is clicked; a visible .pmr-menu is a
   pass, a visible .pm6-tb-menu.is-open a fail (shell sprout menu instead of the chat-style menu). closeAll() runs
   in-page, Escape is a real key press between triggers. Visible <select>s are counted too. */
async function skinMenus(page, p) {
  const res = { triggers: 0, pmr: 0, sprouted: [], none: [], selects: 0 };
  res.triggers = await page.evaluate((x) => window.__railCheck.menuTriggerCount(x), p);
  for (let i = 0; i < res.triggers; i++) {
    const probe = await page.evaluate(async ([x, idx]) => window.__railCheck.menuTriggerProbe(x, idx), [p, i]);
    if (!probe || probe.state === 'gone') break;
    await page.keyboard.press('Escape');
    await sleep(250);
    if (probe.state === 'pmr') res.pmr++;
    else if (probe.state === 'shell') res.sprouted.push(probe.label);
    else res.none.push(probe.label);
  }
  res.selects = await page.evaluate((x) => window.__railCheck.visibleSelects(x), p);
  return res;
}

async function runConcept(c, ref) {
  const r = { concept: c, skin: false, gpu: null, panels: {}, themes: {}, errors: [] };
  const b = await bootPage(PAGE);
  const page = b.page;
  r.gpu = b.gpu;
  try {
    const ready = await page.evaluate(async (cid) => {
      const L = window.__railCheck;
      for (let i = 0; i < 60 && !document.documentElement.hasAttribute('data-pmr-ready'); i++) await L.sleep(100);
      if (!window.PMR) return { ok: false, why: 'no PMR' };
      window.PMR.concepts.set(cid); await L.sleep(800);
      const def = window.PMR.concepts.get(cid);
      /* a skin concept keeps the shell's own panels; 'current' (today's rail) is checked the same way, report-only
         on menus, so the lead can compare a skin against it */
      L.skin = cid === 'current' || !!(def && def.skin);
      return { ok: true, concept: document.documentElement.getAttribute('data-rail-concept'), skinAttr: document.documentElement.getAttribute('data-rail-skin'), skinMode: L.skin, switcher: !!document.querySelector('.pmr-switch') };
    }, c);
    r.boot = ready;
    r.skin = !!(ready && ready.skinMode);
    const panels = panelsFor(r.skin);
    for (const p of panels) {
      const pr = {};
      pr.open = await page.evaluate((x) => window.__railCheck.open(x), p);
      if (r.skin) {
        const pairs = await page.evaluate((x) => window.__railCheck.directPairs(x), p);
        const reached = new Set(pairs);
        pr.reach = { mode: 'direct', steps: null, reached: pairs.length, missing: (ref[p] || []).filter((x) => !reached.has(x)) };
        pr.reach.missingCount = pr.reach.missing.length;
        pr.reach.missing = pr.reach.missing.slice(0, 12);
      } else if (!QUICK) {
        const cr = await page.evaluate(([x, n]) => window.__railCheck.crawl(x, n), [p, 900]);
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
      if (r.skin) pr.menus = await skinMenus(page, p);
      else pr.foreignMenus = await page.evaluate((x) => window.__railCheck.foreignMenus(x), p);
      r.panels[p] = pr;
    }
    /* reduced motion: after switching a panel and clicking its first nav element nothing inside the rail animates.
       For a skin concept the click target is the panel's first visible [data-tab] and the animation targets are
       inside the original panel. */
    r.reduced = await page.evaluate(async (first) => {
      const L = window.__railCheck; const de = document.documentElement; de.setAttribute('data-motion', 'reduced');
      await L.open(first);
      let anims;
      if (L.skin) {
        const p = document.getElementById('panel-' + first);
        const tab = p && [...p.querySelectorAll('[data-tab]')].find(L.visible);
        if (tab) tab.click(); await L.sleep(60);
        anims = document.getAnimations().filter((a) => { const t = a.effect && a.effect.target; return t && t.closest && t.closest('#panel-' + first) && a.playState === 'running'; }).length;
      } else {
        const nav = L.view(first) && L.view(first).querySelector('[data-pmr-nav]'); if (nav) nav.click(); await L.sleep(60);
        anims = document.getAnimations().filter((a) => { const t = a.effect && a.effect.target; return t && t.closest && (t.closest('.pmr-view') || t.closest('#pmr-overlay')) && a.playState === 'running'; }).length;
      }
      de.removeAttribute('data-motion'); window.PMR.menu.closeAll(); return { running: anims };
    }, panels[0]);
    const themeList = QUICK ? ['basic-dark', 'retro-light'] : THEMES;
    const runs = themeList.map((t) => ({ slug: t, nier: false })).concat(QUICK ? [] : [{ slug: 'basic-dark', nier: true }, { slug: 'basic-light', nier: true }]);
    for (const t of runs) {
      const key = t.slug + (t.nier ? '+nier' : '');
      const tr = { set: await page.evaluate(([s, n]) => window.__railCheck.theme(s, n), [t.slug, t.nier]), panels: {} };
      for (const p of panels) {
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
          const shot = await b.cdp.send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: false });
          writeFileSync(join(out, 'shots', `${c}-${key}-${p}.png`), Buffer.from(shot.data, 'base64'));
        }
      }
      await page.evaluate(() => window.__railCheck.clearWidth());
      r.themes[key] = tr;
    }
    await page.evaluate(() => window.__railCheck.theme('basic-dark', false));
  } catch (e) {
    r.fatal = String(e && e.stack || e).slice(0, 600);
  } finally {
    r.errors = [...new Set(b.errors.map(norm))];
    await b.close();
  }
  return r;
}

/* --restore: Current, snapshot of the nine panels and the activity bar; D used; Current again, snapshot. The two must
   match element for element in every theme (NieR included), and D's own marks must be gone. Diffs are short: the
   number of differing positions and the first one, before and after. */
const RESTORE_IDS = Object.assign({ bar: 'activityBar' }, TARGET);
function shortDiff(a, b) {
  const A = a.split(/(?=<)/), B = b.split(/(?=<)/);
  let count = 0, first = -1;
  for (let i = 0; i < Math.max(A.length, B.length); i++) if (A[i] !== B[i]) { count++; if (first < 0) first = i; }
  if (first < 0) return null;
  const clip = (s) => (s === undefined ? '(end)' : s.replace(/\s+/g, ' ').slice(0, 160));
  return { lines: count, at: first, before: clip(A.slice(first, first + 2).join('')), after: clip(B.slice(first, first + 2).join('')) };
}
async function restoreCheck() {
  const res = { themes: {}, errors: [] };
  const b = await bootPage(PAGE);
  const page = b.page;
  try {
    await page.evaluate(async () => {
      const L = window.__railCheck;
      for (let i = 0; i < 60 && !document.documentElement.hasAttribute('data-pmr-ready'); i++) await L.sleep(100);
      window.PMR.concepts.set('current'); await L.sleep(800); L.skin = true;
    });
    const walkEveryPanel = () => page.evaluate((ids) => window.__railCheck.walkAll(ids), ALL_PANELS);
    const runs = (QUICK ? ['basic-dark'] : THEMES).map((t) => ({ slug: t, nier: false })).concat(QUICK ? [] : [{ slug: 'basic-dark', nier: true }]);
    for (const t of runs) {
      const key = t.slug + (t.nier ? '+nier' : '');
      await page.evaluate(([s, n]) => window.__railCheck.theme(s, n), [t.slug, t.nier]);
      await walkEveryPanel();
      const before = await page.evaluate((ids) => window.__railCheck.snapAll(ids), RESTORE_IDS);
      const skinBefore = await page.evaluate(() => document.documentElement.getAttribute('data-rail-skin'));
      await page.evaluate(async () => { window.PMR.concepts.set('d'); await window.__railCheck.sleep(800); });
      const used = await page.evaluate((ids) => window.__railCheck.useRail(ids), ALL_PANELS);
      await page.evaluate(async () => { window.PMR.menu.closeAll(); window.PMR.concepts.set('current'); await window.__railCheck.sleep(800); });
      await walkEveryPanel();
      const after = await page.evaluate((ids) => window.__railCheck.snapAll(ids), RESTORE_IDS);
      const left = await page.evaluate(() => {
        let marks = 0; document.querySelectorAll('*').forEach((e) => { if (e.classList.contains('d-abind')) marks++; for (const a of e.attributes) if (a.name.startsWith('data-d-')) marks++; });
        return { skin: document.documentElement.getAttribute('data-rail-skin'), marks };
      });
      const diffs = {};
      for (const k of Object.keys(RESTORE_IDS)) { if (before[k] !== after[k]) diffs[k] = shortDiff(before[k], after[k]); }
      res.themes[key] = { used, diffs, skin: { before: skinBefore, after: left.skin }, marks: left.marks };
      console.log(`restore ${key}: ${Object.keys(diffs).length ? 'DIFF in ' + Object.keys(diffs).join(', ') : 'identical (' + Object.keys(RESTORE_IDS).length + ' elements)'}`);
    }
    res.errors = [...new Set(b.errors.map(norm))];
  } catch (e) {
    res.fatal = String(e && e.stack || e).slice(0, 600);
  } finally {
    await b.close();
  }
  return res;
}

const results = [];
const fails = [];
let ref = { errors: [], pairs: {} };
let rest = null;
try {
  ref = { errors: await refErrors(), pairs: await refPairs() };
  for (const c of CONCEPTS) results.push(await runConcept(c, ref.pairs));
  if (RESTORE) rest = await restoreCheck();

  /* verdicts */
  for (const r of results) {
    const c = r.concept;
    if (r.fatal) fails.push(`${c}: fatal ${r.fatal.split('\n')[0]}`);
    if (!r.boot || !r.boot.ok || r.boot.concept !== c) fails.push(`${c}: did not boot into the concept (${JSON.stringify(r.boot)})`);
    const newErr = r.errors.filter((e) => !ref.errors.includes(e));
    if (newErr.length) fails.push(`${c}: ${newErr.length} new console errors: ${newErr.slice(0, 3).join(' || ')}`);
    for (const [p, pr] of Object.entries(r.panels)) {
      if (!pr.open || !pr.open.viewShown || (!r.skin && !pr.open.originalHidden)) fails.push(`${c}/${p}: view not shown or original not hidden (${JSON.stringify(pr.open)})`);
      if (pr.reach && pr.reach.missingCount) fails.push(`${c}/${p}: ${pr.reach.missingCount} original actions not reachable, e.g. ${pr.reach.missing.slice(0, 3).join(' ;; ')}`);
      for (const [w, o] of Object.entries(pr.widths || {})) if (o.count || o.scroll > 1) fails.push(`${c}/${p}: overflow at ${w}px (${o.count} elements, scroll ${o.scroll}) ${o.offenders.slice(0, 3).join(', ')}`);
      if (pr.type && pr.type.min < 11) fails.push(`${c}/${p}: text below 11px (${pr.type.min}px at ${pr.type.where})`);
      if (pr.pills && pr.pills.length) fails.push(`${c}/${p}: pill-shaped elements: ${pr.pills.slice(0, 3).join(', ')}`);
      if (pr.sidebars && pr.sidebars.length) fails.push(`${c}/${p}: coloured side bars: ${pr.sidebars.slice(0, 3).join(', ')}`);
      if (pr.foreignMenus) fails.push(`${c}/${p}: ${pr.foreignMenus} non-PMR menus/selects inside the concept view`);
      if (r.skin && c !== 'current' && pr.menus) {
        if (pr.menus.sprouted.length) fails.push(`${c}/${p}: shell sprout menu instead of the chat-style menu (${pr.menus.sprouted.length}/${pr.menus.triggers} triggers: ${pr.menus.sprouted.slice(0, 3).join(', ')})`);
        if (pr.menus.selects) fails.push(`${c}/${p}: ${pr.menus.selects} visible <select> inside the panel`);
      }
    }
    if (r.reduced && r.reduced.running) fails.push(`${c}: ${r.reduced.running} animations running under reduced motion`);
    for (const [t, tr] of Object.entries(r.themes)) for (const [p, x] of Object.entries(tr.panels)) {
      if (!x.shown) fails.push(`${c}/${t}/${p}: view not visible`);
      if (x.overflow) fails.push(`${c}/${t}/${p}: overflow at 280px (${x.overflow})`);
      if (x.type < 11) fails.push(`${c}/${t}/${p}: text below 11px (${x.type})`);
      if (x.pills) fails.push(`${c}/${t}/${p}: ${x.pills} pill-shaped elements`);
    }
  }
  if (rest) {
    if (rest.fatal) fails.push(`restore: fatal ${rest.fatal.split('\n')[0]}`);
    const newErr = rest.errors.filter((e) => !ref.errors.includes(e));
    if (newErr.length) fails.push(`restore: ${newErr.length} new console errors: ${newErr.slice(0, 3).join(' || ')}`);
    for (const [key, t] of Object.entries(rest.themes)) {
      for (const [k, d] of Object.entries(t.diffs)) fails.push(`restore/${k}@${key}: differs after D -> Current (${d.lines} positions, first at ${d.at}: ${d.before} vs ${d.after})`);
      if (t.skin.after !== t.skin.before) fails.push(`restore@${key}: data-rail-skin ${t.skin.before} -> ${t.skin.after} after going back to Current`);
      if (t.marks) fails.push(`restore@${key}: ${t.marks} D marks (data-d-* attributes, .d-abind) left after going back to Current`);
    }
  }
} catch (e) {
  if (e instanceof NoGpu) fails.push(e.message);
  else throw e;
}
const summary = { page: PAGE, ref: REF, gpu: GPU, refErrors: ref.errors.length, refPairs: Object.fromEntries(Object.entries(ref.pairs).map(([k, v]) => [k, v.length])), concepts: results.map((r) => ({ concept: r.concept, skin: r.skin, gpu: r.gpu, errors: r.errors.length, reach: Object.fromEntries(Object.entries(r.panels).map(([p, x]) => [p, x.reach ? `${x.reach.reached} seen, ${x.reach.missingCount} missing` : 'skipped'])), type: Object.fromEntries(Object.entries(r.panels).map(([p, x]) => [p, x.type && x.type.min])) })), fails };
if (rest) summary.restore = Object.fromEntries(Object.entries(rest.themes).map(([k, t]) => [k, { used: t.used, differing: Object.keys(t.diffs) }]));
writeFileSync(join(out, 'rail-boot.json'), JSON.stringify({ summary, results, restore: rest }, null, 2));
console.log(JSON.stringify(summary, null, 1));
console.log(fails.length ? `rail boot: ${fails.length} failing checks` : 'rail boot: ok');
process.exit(fails.length ? 1 : 0);
