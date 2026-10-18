/* pill_check.mjs — the no-pills gate for PMConcept7 (FinalGUISpec F3-648 / DL-184). Headless and read-only on
 * the repository: it boots the page, closes onboarding, opens Settings, and walks every Settings page + manager
 * tab (plus the title-bar theme menu, the o55 floaters and, on request, the title bar) in every look, collecting
 * every visible element (or its ::before/::after) that renders as a PILL or as a one-sided STRIPE.
 *
 * Rule (FinalGUISpec F3-648 / DL-184):
 *   PILL   an element (or ::before/::after) with a visible shape (opaque background colour, background-image
 *          other than none, a visible border, or a box-shadow) whose border radius on the short side is
 *          >= short/2 - 0.5px on both ends, with short side > 3px (thinner = hairline, ignored) and long side
 *          >= 1.25 x short side (circles and squarish shapes are not pills). Key caps (.kbd, .pm51-kbd, kbd)
 *          are allowed and skipped.
 *   STRIPE an element whose border is >= 2px on exactly one side and coloured (not transparent, and differing
 *          from the other sides), or whose inset box-shadow draws a >= 2px bar on one side only ("inset Npx 0 0"
 *          / "inset -Npx 0 0" / "inset 0 Npx 0" forms). Reported separately from pills. A top or bottom rule on an
 *          element at least 60% of the viewport wide is a divider (a title bar's lower edge), not a stripe.
 *
 * Scopes (each finding records its scope):
 *   settings   anything under #panel-settings (including the Settings dialogs/sheets/popouts that live there)
 *              and the body-level Settings popouts the walker opens
 *   thememenu  the title-bar theme menu (#themeMenuWrap, opened by clicking #themeSelect; contains .pm6-tt-modes)
 *   floaters   #o55-resume, .o55-demo and their descendants
 *   shell      .title-bar and descendants, excluding the theme menu
 * Planning Wizard, Orchestrator, chat, Usage and everything outside these roots is out of scope.
 *
 * Usage:
 *   node pill_check.mjs <page.html> [--out <dir>] [--dialogs] [--quick] [--looks a,b] [--scopes s,t,f]
 *                       [--viewport WxH] [--reduced] [--cdp <endpoint>] [--fresh-context]
 *     --viewport  page size in CSS pixels (default 1920x1080)
 *     --reduced   emulate prefers-reduced-motion: reduce for the whole walk
 *     --cdp       drive an existing Chrome over CDP (an agent-browser session on the P1000) instead of launching one;
 *                 the walk opens and closes its own tab there and reports the WebGL renderer it ran on
 *     --fresh-context  with --cdp, own an isolated context and close it on success, failure or signals;
 *                      without this flag, keep using the session's default context. The owner stops the session.
 *     --dialogs   also open every one-click Settings dialog/sheet per page (slow)
 *     --quick     Settings home + 6 representative pages only (manager tabs still walked)
 *     --looks     comma list out of: basic-light friendly-light glass-dark retro-dark basic-dark friendly-dark
 *                 glass-light retro-light nier-light nier-dark (default: all 10; NieR rides the Basic family)
 *     --scopes    subset of settings,thememenu,floaters,shell (default: settings,thememenu,floaters; the shell
 *                 title bar is only scanned when asked)
 * Looks are set with PM12_KIMI.setSettingFromHost('general.visual.theme','<Family> <Mode>') and
 * PM_NIER.set(true/false); each look is confirmed against documentElement.dataset.theme and data-o55-nier
 * before it is walked.
 * Output: one deduplicated line per finding (kind scope look view signature size radius/bar, with the instance
 * count), then a summary per scope and kind. Exits 0 when nothing was found in the selected scopes, 1 when any
 * PILL or STRIPE was found, 2 on a crash or a view that could not open. --out writes report.json (per-instance
 * detail: view, look, signature, rect, radius, text snippet) into the given directory.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { coverPage, takeCoverageFlag } from './coverage_union.mjs';

const here = dirname(fileURLToPath(import.meta.url));
/* playwright-core and Chrome: the VM's defaults, overridable for another machine */
const require = createRequire(join(process.env.PM_PLAYWRIGHT_DIR || '/home/sittingmongoose/pmt-dev/pw/', 'noop.js'));
const CHROME = process.env.PM_CHROME || '/usr/bin/google-chrome';
const { chromium } = require('playwright-core');

const SCOPES = ['settings', 'thememenu', 'floaters', 'shell'];
const LOOKS = [
  { id: 'basic-light', family: 'basic', mode: 'light', nier: false },
  { id: 'friendly-light', family: 'friendly', mode: 'light', nier: false },
  { id: 'glass-dark', family: 'glass', mode: 'dark', nier: false },
  { id: 'retro-dark', family: 'retro', mode: 'dark', nier: false },
  { id: 'basic-dark', family: 'basic', mode: 'dark', nier: false },
  { id: 'friendly-dark', family: 'friendly', mode: 'dark', nier: false },
  { id: 'glass-light', family: 'glass', mode: 'light', nier: false },
  { id: 'retro-light', family: 'retro', mode: 'light', nier: false },
  { id: 'nier-light', family: 'basic', mode: 'light', nier: true },
  { id: 'nier-dark', family: 'basic', mode: 'dark', nier: true },
];
/* representative pages for --quick: home + switches (ai/bsd, ai/media), usage meters (ai/providers),
 * memory chips (memory/context-memory) and two mixed control pages */
const QUICK_REPS = ['ai/bsd', 'ai/media', 'ai/providers', 'memory/context-memory', 'system/advanced', 'code/editor-runtime'];

const raw = process.argv.slice(2);
const coverageFile = takeCoverageFlag(raw);
function argOf(name) { const i = raw.indexOf(name); return i >= 0 && i + 1 < raw.length ? raw[i + 1] : null; }
const hasFlag = (name) => raw.includes(name);
const flagsWithValue = new Set(['--out', '--looks', '--scopes', '--viewport', '--cdp']);
let pageArg = null;
for (let i = 0; i < raw.length; i++) {
  if (flagsWithValue.has(raw[i])) { i++; continue; }
  if (!raw[i].startsWith('--')) { pageArg = raw[i]; break; }
}
const pagePath = resolve(pageArg || join(here, '../../PMConcept7.html'));
const outDir = argOf('--out') ? resolve(argOf('--out')) : null;
const withDialogs = hasFlag('--dialogs');
const cdpEndpoint = argOf('--cdp');
const freshContext = hasFlag('--fresh-context');
if (freshContext && !cdpEndpoint) { console.error('--fresh-context requires --cdp'); process.exit(2); }
const contextMode = cdpEndpoint ? (freshContext ? 'cdp-isolated' : 'cdp-default') : 'launched';
const reducedMotion = hasFlag('--reduced');
const vpMatch = /^(\d{3,4})x(\d{3,4})$/.exec(argOf('--viewport') || '1920x1080');
if (!vpMatch) { console.error('--viewport must be WxH, e.g. 1600x1000'); process.exit(2); }
const VIEWPORT = { width: +vpMatch[1], height: +vpMatch[2] };
let renderer = null;
const quick = hasFlag('--quick');
const looksSel = argOf('--looks') ? argOf('--looks').split(',').map((s) => s.trim()).filter(Boolean) : null;
const scopesSel = argOf('--scopes') ? argOf('--scopes').split(',').map((s) => s.trim()) : null;
const activeScopes = (scopesSel || ['settings', 'thememenu', 'floaters']).filter((s) => SCOPES.includes(s));
if (!activeScopes.length) { console.error('no valid --scopes given'); process.exit(2); }
const looks = looksSel ? LOOKS.filter((l) => looksSel.includes(l.id)) : LOOKS;
const unknownLooks = (looksSel || []).filter((id) => !LOOKS.some((l) => l.id === id));
if (unknownLooks.length) { console.error('unknown look(s): ' + unknownLooks.join(', ')); process.exit(2); }

/* ---------- in-page collector ---------- */
/* Walks the roots of the requested scopes and returns every pill / stripe finding. Self-contained on purpose:
 * it is shipped to the page through page.evaluate and must not close over anything from this module. */
function scanScopes(R) {
  const want = {}; for (const s of R.scopes) want[s] = true;
  const STATE = /^(active|is-|on$|off$|open|selected|current|checked|pressed|focused|hover|disabled|show|shown|hide$|hidden$|first|last)/;
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE', 'NOSCRIPT']);
  const KBD_SEL = '.kbd,.pm51-kbd,kbd';
  function alpha(c) {
    if (!c) return 0; c = String(c).trim().toLowerCase();
    if (c === 'transparent' || c === 'none') return 0;
    const m = c.match(/^rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(',').map((s) => s.trim()); if (p.length === 4) return parseFloat(p[3]); return 1; }
    if (c[0] === '#') return c.length === 9 ? parseInt(c.slice(7), 16) / 255 : 1;
    return 1; /* modern colour spaces resolve to rgb/rgba in computed style; treat the rest as opaque */
  }
  function norm(c) { return String(c || '').trim().toLowerCase(); }
  function pair(v) { const p = String(v).trim().split(/\s+/).map(parseFloat); return p.length === 1 ? [p[0], p[0]] : [p[0], p[1]]; }
  function stableClasses(el) {
    const kept = [], all = [];
    for (const c of el.classList) { if (!c) continue; all.push(c); if (!STATE.test(c)) kept.push(c); }
    kept.sort();
    if (!kept.length && all.length) { all.sort(); return all; }
    return kept;
  }
  function sigOf(el, pseudo) {
    const sc = stableClasses(el);
    const role = el.getAttribute && el.getAttribute('role');
    let s = el.tagName.toLowerCase() + (sc.length ? '.' + sc.join('.') : '');
    if (role) s += '[role=' + role + ']';
    if (pseudo) s += '::' + pseudo;
    return s;
  }
  function scopeOf(el) {
    if (el.closest('#themeMenuWrap')) return 'thememenu';
    if (el.closest('#panel-settings')) return 'settings';
    const pop = el.closest('.pm51-popout');
    if (pop && pop.parentElement === document.body) return 'settings';
    if (el.closest('#o55-resume,.o55-demo')) return 'floaters';
    if (el.closest('.title-bar')) return 'shell';
    return null;
  }
  function textOf(el) {
    if (el.tagName === 'INPUT') return (el.getAttribute('aria-label') || el.placeholder || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    return ((el.textContent || '').trim().replace(/\s+/g, ' ')).slice(0, 80);
  }
  /* visible shape per the rule: opaque background, background-image, a visible border, or a box-shadow */
  function shapeOf(cs) {
    if (alpha(cs.backgroundColor) > 0.02) return 'background';
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return 'background-image';
    const sides = [[cs.borderTopWidth, cs.borderTopColor], [cs.borderRightWidth, cs.borderRightColor],
      [cs.borderBottomWidth, cs.borderBottomColor], [cs.borderLeftWidth, cs.borderLeftColor]];
    if (sides.some((s) => (parseFloat(s[0]) || 0) > 0 && alpha(s[1]) > 0.02)) return 'border';
    if (cs.boxShadow && cs.boxShadow !== 'none') return 'shadow';
    return null;
  }
  function pillOf(w, h, cs) {
    const mn = Math.min(w, h), mx = Math.max(w, h);
    if (!(mn > 3)) return null;              /* thinner = hairline */
    if (mx < 1.25 * mn) return null;         /* squarish / circles are not pills */
    if (!shapeOf(cs)) return null;
    const cs4 = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(pair);
    const horiz = w >= h;
    const rel = cs4.map((p) => (horiz ? p[1] : p[0])); /* radius component along the short side */
    const thr = mn / 2 - 0.5;
    /* both ends: horizontal → (TL,BL) and (TR,BR); vertical → (TL,TR) and (BL,BR) */
    const ends = horiz ? [[rel[0], rel[3]], [rel[1], rel[2]]] : [[rel[0], rel[1]], [rel[3], rel[2]]];
    if (!ends.every((end) => end.every((v) => v >= thr))) return null;
    return { radius: Math.min.apply(null, rel), shape: shapeOf(cs) };
  }
  function tokenize(s) { /* split on whitespace outside parentheses (computed colours contain ", ") */
    const out = []; let cur = '', depth = 0;
    for (const ch of s) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (/\s/.test(ch) && depth === 0) { if (cur) { out.push(cur); cur = ''; } } else cur += ch;
    }
    if (cur) out.push(cur);
    return out;
  }
  function splitShadows(s) {
    const out = []; let cur = '', depth = 0;
    for (const ch of s) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur);
    return out.map((x) => x.trim()).filter(Boolean);
  }
  function stripeOf(w, h, cs) {
    const sides = [['top', parseFloat(cs.borderTopWidth) || 0, cs.borderTopColor],
      ['right', parseFloat(cs.borderRightWidth) || 0, cs.borderRightColor],
      ['bottom', parseFloat(cs.borderBottomWidth) || 0, cs.borderBottomColor],
      ['left', parseFloat(cs.borderLeftWidth) || 0, cs.borderLeftColor]];
    /* A full-width rule along the top or bottom (a title bar's or a section's divider) separates; it does not mark a
       box, so it is not a stripe. Stripes are one-sided accents on boxes narrower than that. */
    const divider = (side) => (side === 'top' || side === 'bottom') && w >= 0.6 * window.innerWidth;
    const wide = sides.filter((s) => s[1] >= 2);
    if (wide.length === 1 && !divider(wide[0][0])) {
      const s = wide[0];
      if (alpha(s[2]) > 0.02) {
        const others = sides.filter((o) => o !== s && o[1] > 0);
        const uniform = others.length > 0 && others.every((o) => norm(o[2]) === norm(s[2]));
        if (!uniform) return { side: s[0], px: s[1], via: 'border' };
      }
    }
    const bs = cs.boxShadow;
    if (bs && bs !== 'none') {
      for (const sh of splitShadows(bs)) {
        if (!/\binset\b/.test(sh)) continue;
        const t = tokenize(sh);
        const lengths = t.filter((x) => /^-?[\d.]+px$/.test(x)).map(parseFloat);
        if (lengths.length < 2) continue;
        const x = lengths[0], y = lengths[1], blur = lengths[2] || 0, spread = lengths[3] || 0;
        if (blur !== 0 || spread !== 0) continue;
        const colTok = t.find((x2) => /^(rgb|rgba|hsl|hsla|color|oklch|oklab|lab|lch)\(|#/.test(x2));
        if (alpha(colTok) <= 0.02) continue;
        if (Math.abs(x) >= 2 && y === 0) return { side: x > 0 ? 'left' : 'right', px: Math.abs(x), via: 'box-shadow' };
        if (x === 0 && Math.abs(y) >= 2 && !divider(y > 0 ? 'top' : 'bottom')) return { side: y > 0 ? 'top' : 'bottom', px: Math.abs(y), via: 'box-shadow' };
      }
    }
    return null;
  }
  function rootsFor() {
    const roots = [];
    if (want.settings) { const p = document.getElementById('panel-settings'); if (p) roots.push(p); roots.push(...document.querySelectorAll('body > .pm51-popout')); }
    if (want.thememenu) { const t = document.getElementById('themeMenuWrap'); if (t) roots.push(t); }
    if (want.floaters) for (const sel of ['#o55-resume', '.o55-demo']) for (const f of document.querySelectorAll(sel)) roots.push(f);
    if (want.shell) { const tb = document.querySelector('.title-bar'); if (tb) roots.push(tb); }
    return roots.filter((r) => r && r.isConnected);
  }
  const findings = []; let scanned = 0;
  function record(el, cs, r, pseudo, kind, cls, stripe) {
    findings.push({
      kind, scope: scopeOf(el), sig: sigOf(el, pseudo), pseudo: pseudo || null,
      w: Math.round((pseudo ? parseFloat((cs.width)) : r.width) * 10) / 10,
      h: Math.round((pseudo ? parseFloat((cs.height)) : r.height) * 10) / 10,
      radius: cls ? Math.round(cls.radius * 10) / 10 : null, shape: cls ? cls.shape : null,
      side: stripe ? stripe.side : null, bar_px: stripe ? stripe.px : null, via: stripe ? stripe.via : null,
      x: Math.round(r.x), y: Math.round(r.y), text: textOf(el),
    });
  }
  function scanEl(el) {
    if (SKIP_TAGS.has(el.tagName)) return;
    if (el.closest && el.closest('svg')) return;
    if (el.closest && el.closest(KBD_SEL)) return; /* key caps are allowed */
    const sc = scopeOf(el);
    if (!sc || !want[sc]) return;
    const r = el.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return;
    let cs = null;
    try { cs = getComputedStyle(el); } catch (e) { return; }
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return;
    const op = parseFloat(cs.opacity);
    if (!Number.isNaN(op) && op < 0.05) return;
    scanned++;
    const pill = pillOf(r.width, r.height, cs);
    if (pill) record(el, cs, r, null, 'pill', pill, null);
    const stripe = stripeOf(r.width, r.height, cs);
    if (stripe) record(el, cs, r, null, 'stripe', null, stripe);
    for (const p of ['before', 'after']) {
      let pcs = null;
      try { pcs = getComputedStyle(el, '::' + p); } catch (e) { continue; }
      if (!pcs.content || pcs.content === 'none' || pcs.content === 'normal') continue;
      if (pcs.display === 'none') continue;
      const pw = parseFloat(pcs.width), ph = parseFloat(pcs.height);
      if (!(pw > 0 && ph > 0)) continue;
      const pp = pillOf(pw, ph, pcs);
      if (pp) record(el, pcs, r, p, 'pill', pp, null);
    }
  }
  for (const root of rootsFor()) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    scanEl(root);
    while (walker.nextNode()) scanEl(walker.currentNode);
  }
  return { findings, scanned };
}

/* ---------- driver ---------- */
const pageErrors = [];
const findings = [];        /* one row per instance */
const viewsWalked = [];
const viewsFailed = [];
let browser = null, page = null, finishCoverage = null;
let ownedContext = null; /* retain the promise so signals also wait for in-flight context creation */

/* open the Settings page through the page's own navigation (the tab can sit in the title bar's overflow at narrow widths) */
async function openSettingsPage() {
  const went = await page.evaluate(() => { if (window.PM_PAGES && typeof window.PM_PAGES.go === 'function') { window.PM_PAGES.go('settings'); return true; } return false; });
  if (!went) await page.locator('#tab-settings').click({ force: true });
}

async function boot() {
  progress('context=' + contextMode);
  if (cdpEndpoint) {
    browser = await chromium.connectOverCDP(cdpEndpoint);
    const ctx = freshContext ? await (ownedContext = browser.newContext()) : browser.contexts()[0] || await browser.newContext();
    page = await ctx.newPage();
    await page.setViewportSize(VIEWPORT);
  } else {
    browser = await chromium.launch({ executablePath: CHROME, headless: true });
    page = await browser.newPage({ viewport: VIEWPORT });
  }
  if (reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
  renderer = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const x = g && g.getExtension('WEBGL_debug_renderer_info'); return x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'none'; });
  page.setDefaultTimeout(20000);
  /* offline without request interception (interception over CDP sends every inline asset through Node): Chrome blocks the network itself */
  { const s = await page.context().newCDPSession(page); await s.send('Network.enable'); await s.send('Network.setBlockedURLs', { urls: ['http://*', 'https://*', 'ws://*', 'wss://*'] }); }
  if (coverageFile) finishCoverage = await coverPage(page, coverageFile);
  page.on('pageerror', (e) => pageErrors.push(String((e && e.message) || e)));
  await page.goto(pathToFileURL(pagePath).href, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.locator('#pm-settings-root').waitFor({ state: 'attached', timeout: 60000 });
  await page.waitForFunction(() => window.PM12_KIMI && window.PM_THEME && document.querySelector('#pm-o55-onboarding,body'), null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) {
    const close = page.locator('#pm-o55-onboarding .o55-close');
    if (await close.count() && await close.first().isVisible()) { await close.first().click(); await page.waitForTimeout(700); }
    const gone = await page.evaluate(() => { const o = document.querySelector('#pm-o55-onboarding'); return !o || getComputedStyle(o).display === 'none'; });
    if (gone) break;
  }
  await openSettingsPage();
  await page.waitForFunction(() => { const r = document.querySelector('#pm-settings-root'); if (!r) return false;
    const b = r.getBoundingClientRect(); const cs = getComputedStyle(r); return b.width > 0 && b.height > 0 && cs.visibility === 'visible'; }, null, { timeout: 30000 });
  await page.addStyleTag({ content: 'html,body,*{scroll-behavior:auto!important;}' }).catch(() => {});
  await page.waitForTimeout(400);
}

async function setLook(l) {
  let state = null;
  for (let a = 0; a < 5; a++) {
    await page.evaluate(([f, m, n]) => {
      const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
      try { window.PM12_KIMI.setSettingFromHost('general.visual.theme', cap(f) + ' ' + cap(m)); } catch (e) {}
      try { if (window.PM_NIER && typeof window.PM_NIER.set === 'function') window.PM_NIER.set(!!n); } catch (e) {}
    }, [l.family, l.mode, l.nier]);
    await page.waitForTimeout(800);
    state = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, nier: document.documentElement.getAttribute('data-o55-nier') }));
    if (state.theme === l.family + '-' + l.mode && (l.nier ? state.nier === 'on' : state.nier !== 'on')) { state.confirmed = true; break; }
    await page.waitForTimeout(400);
  }
  if (!state || !state.confirmed) throw new Error('look did not apply: ' + l.id + ' got ' + JSON.stringify(state));
  await page.waitForTimeout(300);
  return state;
}

async function ensureSettingsOpen(why) {
  const tab = await page.evaluate(() => ((document.querySelector('.page-tab.active') || {}).id) || null);
  if (tab !== 'tab-settings') {
    progress('settings closed (' + why + '); reopening');
    await openSettingsPage();
    await page.waitForTimeout(600);
  }
}
async function closeTransient() {
  await page.evaluate(() => { try { window.PM12_KIMI.closeTransientUi(); } catch (e) {} });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
}
async function nav(dom, ws) {
  await page.evaluate(([d, w]) => window.PM12_KIMI.navigate(d, w), [dom, ws]);
  await page.waitForTimeout(350);
  return await page.evaluate((w) => { const b = document.querySelector('[data-workspace-block="' + w + '"]');
    if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; }, ws);
}
async function collect(type, view, lookId) {
  const scopesFor = { settings: ['settings'], thememenu: ['thememenu'], floaters: ['floaters'], shell: ['shell'] };
  const data = await page.evaluate(scanScopes, { scopes: scopesFor[type] });
  viewsWalked.push(view + '@' + lookId);
  for (const f of data.findings) findings.push({ view, look: lookId, ...f });
  return data;
}
function progress(msg) { console.error('[pill_check] ' + msg); }

const DIALOG_ACTION_RE = /open|inspect|detail|custom|edit|add|manage|logs|fallback|change|select|dd-open|panel|o55nc|actionbtn|run-setting|sound|account|browse-setting|help|info/i;
const DIALOG_ACTION_DENY = /browse-setting-path|navigate|jump-workspace|scroll-section|^home$|pm51-tab|index-tab|notification-tab|disabled|capture/i;
const DIALOG_TEXT_DENY = /delete|remove|uninstall|reset|clear|sign out|disconnect|disable|revoke/i;

async function blockTabs(ws) {
  return await page.evaluate((w) => {
    const blk = document.querySelector('[data-workspace-block="' + w + '"]'); if (!blk) return [];
    return [...blk.querySelectorAll('button[data-action="pm51-tab"]')]
      .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((b) => ({ tab: b.getAttribute('data-tab'), text: (b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40) }));
  }, ws);
}
async function dialogOpeners(ws) {
  return await page.evaluate(([w, ok, deny, tdeny]) => {
    const blk = document.querySelector('[data-workspace-block="' + w + '"]'); if (!blk) return [];
    const rok = new RegExp(ok, 'i'), rdeny = new RegExp(deny, 'i'), rtd = new RegExp(tdeny, 'i');
    const out = []; const seen = new Set();
    for (const b of blk.querySelectorAll('button,[role="button"]')) {
      const a = b.getAttribute('data-action') || '';
      if (b.getAttribute('role') === 'switch' || b.tagName === 'INPUT') continue;
      if (!rok.test(a) && !rok.test(String(b.className))) continue;
      if (rdeny.test(a)) continue;
      const text = (b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50);
      if (rtd.test(text)) continue;
      const r = b.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0) || !b.isConnected) continue;
      const key = a + '|' + text; if (seen.has(key)) continue; seen.add(key);
      out.push({ action: a, text });
      if (out.length >= 14) break;
    }
    return out;
  }, [ws, DIALOG_ACTION_RE.source, DIALOG_ACTION_DENY.source, DIALOG_TEXT_DENY.source]);
}
async function openDialog(ws, o) {
  return await page.evaluate(([w, a, t]) => {
    const blk = document.querySelector('[data-workspace-block="' + w + '"]'); if (!blk) return false;
    const cands = [...blk.querySelectorAll('button,[role="button"]')]
      .filter((x) => (x.getAttribute('data-action') || '') === a && ((x.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50) === t));
    const b = cands.find((x) => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    if (!b) return false;
    b.scrollIntoView({ block: 'center' }); b.click(); return true;
  }, [ws, o.action, o.text]);
}

async function walkPage(dom, ws, look, prefix) {
  const base = prefix + dom + '/' + ws;
  await ensureSettingsOpen('pre:' + base);
  if (!(await nav(dom, ws))) {
    if (!(await nav(dom, ws))) { viewsFailed.push(base + '@' + look); progress('FAILED view ' + base); return; }
  }
  await page.evaluate((w) => { const b = document.querySelector('[data-workspace-block="' + w + '"]'); if (b) b.scrollIntoView({ block: 'start' }); }, ws);
  await page.waitForTimeout(200);
  if (activeScopes.includes('settings')) await collect('settings', base, look.id);
  for (const t of await blockTabs(ws)) {
    const vid = base + '#tab:' + t.tab;
    await ensureSettingsOpen('tab:' + vid);
    if (!(await nav(dom, ws))) { viewsFailed.push(vid + '@' + look); continue; }
    const clicked = await page.evaluate(([w, tab]) => {
      const blk = document.querySelector('[data-workspace-block="' + w + '"]'); if (!blk) return false;
      const b = [...blk.querySelectorAll('button[data-action="pm51-tab"]')].find((x) => x.getAttribute('data-tab') === tab);
      if (!b) return false;
      b.scrollIntoView({ block: 'center' }); b.click(); return true;
    }, [ws, t.tab]);
    if (!clicked) { viewsFailed.push(vid + '@' + look); progress('FAILED view ' + vid); continue; }
    await page.waitForTimeout(300);
    if (activeScopes.includes('settings')) await collect('settings', vid, look.id);
  }
  if (!withDialogs) return;
  const opened = new Set();
  for (const o of await dialogOpeners(ws)) {
    const key = (o.action || '') + '|' + o.text;
    if (opened.has(key)) continue; opened.add(key);
    const vid = base + '#dlg:' + (o.action || 'cls') + ':' + o.text.slice(0, 24);
    try {
      await ensureSettingsOpen('dlg:' + vid);
      if (!(await nav(dom, ws))) { viewsFailed.push(vid + '@' + look); continue; }
      const before = await page.evaluate(() => ({ n: (document.getElementById('pm-settings-portals') || { childElementCount: 0 }).childElementCount,
        pop: document.querySelectorAll('body > .pm51-popout').length }));
      await openDialog(ws, o);
      await page.waitForTimeout(450);
      /* measure what settles, not a frame of the popout's opening scale: wait (up to 2 s) for finite animations */
      await page.waitForFunction(() => document.getAnimations().every((an) => an.playState !== 'running' || !Number.isFinite(an.effect && an.effect.getComputedTiming().endTime)), null, { timeout: 2000 }).catch(() => {});
      const after = await page.evaluate(() => ({ n: (document.getElementById('pm-settings-portals') || { childElementCount: 0 }).childElementCount,
        pop: document.querySelectorAll('body > .pm51-popout').length }));
      if (after.n !== before.n || after.pop !== before.pop) await collect('settings', vid, look.id);
      await closeTransient();
    } catch (e) {
      viewsFailed.push(vid + '@' + look);
      progress('FAILED view ' + vid + ': ' + String((e && e.message) || e).split('\n')[0]);
      try { await closeTransient(); } catch (_) {}
    }
  }
}

async function walkStaticViews(look) {
  await closeTransient();
  if (activeScopes.includes('floaters')) await collect('floaters', 'floaters', look.id);
  if (activeScopes.includes('thememenu')) {
    const vid = 'thememenu';
    try {
      await page.locator('#themeSelect').click();
      await page.waitForTimeout(400);
      const open = await page.evaluate(() => { const m = document.getElementById('themeMenu'); return !!m && m.getBoundingClientRect().height > 0; });
      if (!open) throw new Error('theme menu did not open');
      await collect('thememenu', vid, look.id);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
    } catch (e) {
      viewsFailed.push(vid + '@' + look);
      progress('FAILED view ' + vid + ': ' + String((e && e.message) || e).split('\n')[0]);
      try { await page.keyboard.press('Escape'); } catch (_) {}
    }
  }
  if (activeScopes.includes('shell')) await collect('shell', 'shell', look.id);
}

function fmt(n) { return (Math.round(n * 10) / 10).toString(); }

async function main() {
  const t0 = Date.now();
  const pageSha = createHash('sha256').update(await (await import('node:fs/promises')).readFile(pagePath)).digest('hex');
  await boot();
  const domains = await page.evaluate(() => (window.PM12_DATA && window.PM12_DATA.domains || []).map((d) => ({ id: d.id, workspaces: (d.workspaces || []).map((w) => ({ id: w.id, type: w.type })) })));
  const pages = [];
  for (const d of domains) for (const w of d.workspaces) pages.push(d.id + '/' + w.id);
  let selected = pages;
  if (quick) {
    const home = pages.includes('general/app-input') ? 'general/app-input' : pages[0];
    const reps = QUICK_REPS.filter((p) => pages.includes(p));
    for (const p of pages) { if (reps.length >= 6) break; if (!reps.includes(p) && p !== home) reps.push(p); }
    selected = [home, ...reps.slice(0, 6)];
  }
  progress('looks=' + looks.map((l) => l.id).join(',') + ' scopes=' + activeScopes.join(',') + ' pages=' + selected.length + (withDialogs ? ' +dialogs' : ''));
  for (const look of looks) {
    await setLook(look);
    let i = 0;
    for (const key of selected) {
      i++;
      const [dom, ws] = key.split('/');
      progress('look ' + look.id + ' page ' + i + '/' + selected.length + ' ' + key);
      await walkPage(dom, ws, look, '');
    }
    progress('look ' + look.id + ' static views');
    await walkStaticViews(look);
  }
  if (finishCoverage) { await finishCoverage(); finishCoverage = null; }
  if (ownedContext) { await (await ownedContext).close(); ownedContext = null; }
  if (cdpEndpoint) await page.close().catch(() => {});   /* over CDP, close() only disconnects: the session's owner stops it */
  await browser.close(); browser = null;

  /* dedup by (kind, scope, signature, look) */
  const groups = new Map();
  const order = [];
  for (const f of findings) {
    const key = f.kind + '|' + f.scope + '|' + f.sig + '|' + f.look;
    if (!groups.has(key)) { groups.set(key, { kind: f.kind, scope: f.scope, sig: f.sig, look: f.look, count: 0, views: [], first: f, instances: [] }); order.push(key); }
    const g = groups.get(key);
    g.count++;
    if (!g.views.includes(f.view)) g.views.push(f.view);
    g.instances.push(f);
  }
  const scopeRank = (s) => SCOPES.indexOf(s);
  const lookRank = (l) => looks.findIndex((x) => x.id === l);
  const sorted = order.map((k) => groups.get(k)).sort((a, b) =>
    (a.kind === b.kind ? 0 : a.kind === 'pill' ? -1 : 1) || scopeRank(a.scope) - scopeRank(b.scope) || lookRank(a.look) - lookRank(b.look) || order.indexOf(a.kind + '|' + a.scope + '|' + a.sig + '|' + a.look) - order.indexOf(b.kind + '|' + b.scope + '|' + b.sig + '|' + b.look));

  for (const g of sorted) {
    const geom = g.kind === 'pill'
      ? fmt(g.first.w) + 'x' + fmt(g.first.h) + ' r=' + (g.first.radius === null ? '?' : fmt(g.first.radius))
      : fmt(g.first.w) + 'x' + fmt(g.first.h) + ' bar=' + g.first.side + '-' + fmt(g.first.bar_px) + 'px';
    console.log(g.kind.toUpperCase() + ' ' + g.scope + ' ' + g.look + ' ' + g.first.view + ' ' + g.sig + ' ' + geom + (g.count > 1 ? ' x' + g.count : ''));
  }
  for (const scope of activeScopes) {
    for (const kind of ['pill', 'stripe']) {
      const gs = sorted.filter((g) => g.scope === scope && g.kind === kind);
      const inst = gs.reduce((n, g) => n + g.count, 0);
      console.log('SUMMARY ' + scope + ' ' + kind + ': signatures=' + gs.length + ' instances=' + inst);
    }
  }
  const seconds = Math.round((Date.now() - t0) / 1000);
  console.log('RESULT findings=' + sorted.length + ' instances=' + findings.length + ' looks=' + looks.length + ' views=' + viewsWalked.length + ' failed=' + viewsFailed.length + ' page_errors=' + pageErrors.length + ' seconds=' + seconds + ' viewport=' + VIEWPORT.width + 'x' + VIEWPORT.height + ' reduced=' + reducedMotion + ' renderer=' + JSON.stringify(renderer) + ' context=' + contextMode);
  if (outDir) {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'report.json'), JSON.stringify({
      rule: 'FinalGUISpec F3-648 / DL-184 (no-pills gate)', generated_at: new Date().toISOString(),
      page: pagePath, page_sha256: pageSha, looks: looks.map((l) => l.id), scopes: activeScopes,
      quick, dialogs: withDialogs, viewport: VIEWPORT, reduced_motion: reducedMotion, renderer, cdp: !!cdpEndpoint,
      context_mode: contextMode,
      views_walked: viewsWalked, views_failed: viewsFailed,
      page_errors: pageErrors, seconds,
      findings: sorted.map((g) => ({ kind: g.kind, scope: g.scope, signature: g.sig, look: g.look, count: g.count, views: g.views,
        first: { view: g.first.view, rect: { x: g.first.x, y: g.first.y, w: g.first.w, h: g.first.h }, radius: g.first.radius,
          shape: g.first.shape, side: g.first.side, bar_px: g.first.bar_px, via: g.first.via, text: g.first.text } })),
      instances: findings,
    }, null, 2));
    console.log('report: ' + join(outDir, 'report.json'));
  }
  if (viewsFailed.length) { console.error('[pill_check] views that could not open:\n  ' + viewsFailed.join('\n  ')); process.exitCode = 2; }
  else if (sorted.length) process.exitCode = 1;
  else process.exitCode = 0;
}

for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, async () => { try { if (finishCoverage) await finishCoverage(); } catch (_) {} try { if (ownedContext) await (await ownedContext).close(); } catch (_) {} try { if (browser) await browser.close(); } catch (_) {} process.exit(sig === 'SIGINT' ? 130 : 143); });
main().catch(async (e) => {
  console.error('FATAL ' + ((e && e.stack) || e).toString().split('\n').slice(0, 6).join('\n'));
  try { if (finishCoverage) await finishCoverage(); } catch (_) {}
  try { if (ownedContext) await (await ownedContext).close(); } catch (_) {}
  try { if (browser) await browser.close(); } catch (_) {}
  process.exit(2);
});
