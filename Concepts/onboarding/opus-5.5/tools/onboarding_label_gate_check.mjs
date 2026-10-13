/* onboarding_label_gate_check.mjs -- separate, fail-closed successor, Phase A preparation only.
 * Frozen original checker, pill_check and Settings driver are never imported as executables or modified.
 * Detector: frozen pill_check scanScopes, with ONLY scope/root routing and finding metadata adapted.
 * No status-mark exemption. Raw inherited pills remain failures/ownership HOLDs beside their base comparison.
 * Absolute word floor: 4.5, ONBOARDING-SOL-GATES-GO and ONBOARDING-CONTRAST-AMENDMENT (2026-10-13).
 * An improvement, inherited value, action classification or exit 0 cannot waive the word floor or a gap.
 * Word sampling does not hide text, insert styles, change attributes, pause animations or force product state.
 * It checks actual text Range rectangles in an unchanged screenshot. Non-uniform/ambiguous backgrounds,
 * unsupported paint, missing pixels/ink/renderer/fixture/context and absent marks remain UNVERIFIED/HOLD.
 * Exact raw reports and errors survive replay. Legacy box-median samples never become verified word samples.
 * Browser execution requires a LATER explicit root Phase B GO plus an exact immutable binding file; Phase A
 * CLI modes are --self-test and --replay <retained-report.json>. Neither imports a browser launcher.
 * Usage: --self-test [--out DIR]; --replay FILE [--replay FILE] [--out DIR]
 * Later only: <candidate.html> --base <e254-page.html> --phase-b-binding <JSON> --out DIR
 *   --looks <all 12> --motion normal,reduced --sweep --parallel 1|2 --viewport 1440x900
 *   or --looks <all 12> --motion normal --no-tour --viewport 390x844
 * Binding v1: phase='B', root_message_id, candidate_head (full SHA, MUST differ from frozen 29),
 *   candidate_sha256, base_head=BASE_HEAD, base_sha256, fixture_apis=FIXTURE_APIS,
 *   global_admission={checked_at, all_cdp_browsers, unmanaged_cdp_browsers, max_total:4,
 *                     owned_session_limit:2, source_owner_coordinated:true}.
 * Admission must be fresh (<60s), must count all browsers, and never grants authorization by itself.
 * --out writes a new report.json exclusively (existing evidence is never overwritten).
 * Verdict: READY only for fully measured requested gates with no failure, HOLD or gap; otherwise HOLD.
 * Exit 1: failures/ownership HOLD; 2: UNVERIFIED/errors/invalid binding. Self-test exit 0 concerns isolated
 * tool logic only and confers no product, source, look, coverage, GPU, governance or landing acceptance.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

export const FROZEN_HEAD = '29cdc86e3c9078d94260b79905e6ae49c169305c';
export const BASE_HEAD = 'e254a56477c7b8da424b7485ba17f358fdbf3ec5';
export const WORD_FLOOR = 4.5;
export const FROZEN = {
  'onboarding_label_check.mjs': 'bce699ebc9fce3234abdc5c3f5c2884fcc36e7c0f8e23b1f249e53d539b24b6c',
  'pill_check.mjs': '2d2ed65deadf51b2d4ff1e53551cc37b9b77c85100319f14c9b0a56100180041',
  'settings_nopills_accept.mjs': 'f0f9293cc82498e866c1eadac5a8c5eb70b62ca76da102a9bc9bb5e3cc3c2728',
};
export const AUTHORITY = {
  gate_go: { path: '/mnt/Cursor/share/puppet-master/2026-10-13-creative-queue/ONBOARDING-SOL-GATES-GO.md',
    sha256: '4f2c29cd86ff950e0bda1506807f12cc32924f61da3729dfae26e469f0d84e2f' },
  contrast: { path: '/mnt/Cursor/share/puppet-master/2026-10-13-creative-queue/ONBOARDING-CONTRAST-AMENDMENT.md',
    sha256: '9b1d8ee180b18e772621ac8a745b3998ca7cf7a4b6755899373c56f1af2a2424', required_text: 'normal-text4.5:1 floor' },
  label_action: { path: '/mnt/Cursor/share/puppet-master/2026-10-11-onboarding-no-pills/README.md' },
};
export const FIXTURE_APIS = [
  '?o55=off&o55scenario=fresh', 'PM12_KIMI.setSettingFromHost', 'PM_NIER.set', 'PM_NIER.setParts',
  'O55.ui.close/open({screen})', 'localStorage.removeItem(pm.o55.onboarding.v1,pm.o55.tour.v1)',
  'Home NAS fixture via real UI clicks; fixture user=jared, password=correct horse',
  'PM7_GUIDED_TOUR.start({project:tastebook})', 'PMW.tour.splitDrag() read-only target',
  'focus/select on real fields; CDP Input.insertText/mouse/key; scrollIntoView',
  'passive trusted-click observation in a separate CDP isolated world; no product globals/DOM/CSS/event cancellation',
];
const HERE = dirname(fileURLToPath(import.meta.url));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let launch;
let VIEWPORT = { width: 1440, height: 900 }, doTour = true, doWindow = true;
let PAGES = {}, OUT = null, looks = [], motions = [], argv = [], phaseBinding = null;
const flag = (k) => argv.includes('--' + k);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : argv[i + 1]; };


const LOOKS = [
  { id: 'basic-light', family: 'basic', mode: 'light' }, { id: 'friendly-light', family: 'friendly', mode: 'light' },
  { id: 'glass-dark', family: 'glass', mode: 'dark' }, { id: 'retro-dark', family: 'retro', mode: 'dark' },
  { id: 'basic-dark', family: 'basic', mode: 'dark' }, { id: 'friendly-dark', family: 'friendly', mode: 'dark' },
  { id: 'glass-light', family: 'glass', mode: 'light' }, { id: 'retro-light', family: 'retro', mode: 'light' },
  { id: 'nier-light', family: 'basic', mode: 'light', nier: true }, { id: 'nier-dark', family: 'basic', mode: 'dark', nier: true },
  { id: 'nier-light-plain', family: 'basic', mode: 'light', nier: true, plain: true }, { id: 'nier-dark-plain', family: 'basic', mode: 'dark', nier: true, plain: true },
];


const LABELS = [
  { kind: 'status', sel: '.o55-pill' }, { kind: 'status', sel: '.o55-chip' },
  { kind: 'tag', sel: '.o55-tag' }, { kind: 'tag', sel: '.o55-routelink > span' }, { kind: 'tag', sel: '.o55t-trylabel' }, { kind: 'tag', sel: '.o55p-badge' },
  { kind: 'choice', sel: '.o55-suggestchip' }, { kind: 'field', sel: '.o55-officialurl' },
];
/* Action controls that stay as they are (Jared 2026-10-11; GO v2: Install/Sign in, the tour's buttons, the window's
   switches and the tour's segmented control are unchanged). The tour bar (.o55t-bar) is the toolbar that holds the
   tour's buttons; PHASE3-MAP lists it, with the switch and the segments, as a control awaiting a ruling, not a label. */
const KEPT = ['.o55-btn', '.o55-iconbtn', '.o55-sound', '.o55-seg', '.o55-seg button', '.o55-toggle', '.o55-switch', '.o55-card', '.o55-tile',
  '.o55-link', '.o55-detbtn', '.o55-morebtn', '.o55-treeitem', '.o55-lookopt', '.o55-lookmodes button', '.o55-niercheck', '.o55-looknier-check',
  '.o55-looknier-adjust', '.o55t-btn', '.o55t-barbtn', '.o55t-seg', '.o55t-seg button', '.o55t-bar', '.o55t-choice', '.o55t-chip', '.o55-explain',
  '.o55p-use', '.o55p-why', '.o55p-approve'];
/* Shapes the rule calls a pill that are neither a label nor an action control: reported for a ruling, not changed. */
const OPEN = [
  { sel: '.o55-railbar-friendly', why: "Friendly's chapter rail bar: the 6px wooden bar the chapter strings hang from (rail art)" },
  { sel: '.o55-lookswatch > i', why: "the look menu's colour swatch bars (7 x 14 px, 3px corners): a swatch inside a menu option" },
  { sel: '.pm6-wiz-schip', why: 'Planning Wizard topic status chips ("Not started", "Open", "Ready") that the practice draws with the Wizard\'s own class (82-tour-wizard.js); a pill LABEL whose CSS is the Wizard\'s, outside phase 3\'s files: coordinator ruling' },
  { sel: '.pm6-wiz-topic-prog', why: 'Planning Wizard topic meter (4px bar, round ends) drawn by the practice with the Wizard\'s class; NP-BARS territory, Wizard CSS: coordinator ruling' },
  { sel: '.pm6-wiz-statepill', why: 'Planning Wizard run state label ("Practice · nothing will be built") set by the practice with the Wizard\'s class; a pill LABEL, Wizard CSS: coordinator ruling' },
  { sel: '.o55-treelist', why: 'the folder browser list box (role=listbox, the card corner: 18px in Friendly, 16px in Glass): a capsule only while it holds just the "Empty folder" line' },
];
const STATUS_MARKS = 'svg, .o55-spin, .o55-mk, [class*="nx"]';



const VIEWS = [
  { id: 'where', screen: 'where', until: () => document.querySelectorAll('#pm-o55-onboarding .o55-chip-ok').length === 3 },
  { id: 'look', screen: 'look' }, { id: 'begin', screen: 'begin' }, { id: 'c-review', screen: 'c-review' },
  { id: 'name', screen: 'name', flow: 'suggest' }, { id: 's-confirm', screen: 's-confirm' },
  { id: 'ai', screen: 'ai', until: () => !!document.querySelector('#pm-o55-onboarding .o55-pill') }, { id: 'free', screen: 'free' },
  { id: 'safe', screen: 'safe' }, { id: 'ready', screen: 'ready' }, { id: 'c-ready', screen: 'c-ready' }, { id: 'online-service', screen: 'online-service' },
  { id: 'away', screen: 'away' }, { id: 'nas-find', screen: 'nas-find' }, { id: 'nas-folder', path: 'nas', screen: 'nas-folder', flow: 'newfolder' },
  { id: 'look-menu', screen: 'where', flow: 'lookmenu' },
];
/* screens that need a device the person found first: opened directly they throw on both pages (no device in the
   session), so the sweep reaches the ones on the NAS path through it and lists the rest as not swept */
const NEEDS_DEVICE = ['nas-identity', 'nas-key', 'nas-signin', 'nas-pmpair', 'nas-install', 'nas-folder', 'nas-smb', 'nas-nfs', 'nas-mounted'];
const ALL_SCREENS = ['welcome', 'look', 'where', 'c-route', 'c-review', 'c-pair', 'c-ready', 's-kind', 's-wait', 's-confirm', 's-ready', 'r-source', 'r-unlock', 'r-pick', 'r-preview', 'r-done', 'begin', 'ex-folder', 'name', 'like',
  'nas-find', 'nas-identity', 'nas-key', 'nas-signin', 'nas-pmpair', 'nas-install', 'nas-folder', 'nas-smb', 'nas-nfs', 'nas-mounted', 'online-signin', 'online-service', 'online-details', 'ex-repos', 'safe', 'away', 'review', 'creating',
  'protect', 'ai', 'ai-all', 'ai-none', 'free', 'ready'];
const R_WIN = { scope: 'window', roots: ['#pm-o55-onboarding'], labels: LABELS, kept: KEPT, open: OPEN, marks: STATUS_MARKS };
/* the tour's own surfaces: its root, the practice's parts in the Planning Wizard (never the Wizard panel itself, which
   the practice marks .o55p-practice: the Wizard's own controls are not this check's), Explain this reply simply */
const R_TOUR = { scope: 'tour', roots: ['#pm-o55-tour', '[class*="o55p-"]:not(.o55p-practice)', '.o55p-practice .pm6-wiz-schip', '.o55p-practice .pm6-wiz-statepill', '.o55p-practice .pm6-wiz-topic-prog', '.o55-explain-row', '.o55-explains', '.o55t-landing'], labels: LABELS, kept: KEPT, open: OPEN, marks: STATUS_MARKS };


const TOUR_STEPS = ['comfort_intro', 'open_chat', 'same_answer_eli5', 'book_club_goal', 'book_club_goal:practice', 'three_outcomes'];
const EXPECT_LABELS = {
  where: { '.o55-chip': 3, '.o55-tag': 1 }, look: { '.o55-tag': 1 }, begin: { '.o55-tag': 1 },
  'c-review': { '.o55-tag': 1, '.o55-routelink > span': 1 }, name: { '.o55-suggestchip': 3 },
  's-confirm': { '.o55-suggestchip': 2 }, ai: { '.o55-pill': 1 }, free: { '.o55-pill': 1 },
  safe: { '.o55-pill': 1 }, 'online-service': { '.o55-tag': 1 }, away: { '.o55-tag': 1 },
  'nas-find': { '.o55-tag': 2 }, 'nas-folder': { '.o55-tag': 1 }, 'look-menu': { '.o55-chip': 3, '.o55-tag': 1 },
};


export function scanOnboarding(R) {
  const want = {}; want[R.scope] = true;
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
    return rootsFor().some((r) => r === el || r.contains(el)) ? R.scope : null;
  }
  function pathOf(el) {
    const bits = [];
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const sib = e.parentElement ? [...e.parentElement.children] : [e];
      bits.unshift(e.tagName.toLowerCase() + ':nth-child(' + (sib.indexOf(e) + 1) + ')');
    }
    return bits.join(' > ');
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
    for (const sel of R.roots) for (const e of document.querySelectorAll(sel)) {
      if (!e.isConnected || roots.some((r) => r === e || r.contains(e))) continue;
      for (let i = roots.length - 1; i >= 0; i--) if (e.contains(roots[i])) roots.splice(i, 1);
      roots.push(e);
    }
    return roots;
  }
  const findings = []; let scanned = 0;
  function record(el, cs, r, pseudo, kind, cls, stripe) {
    const label = R.labels.find((l) => el.matches(l.sel));
    const host = !label && R.labels.find((l) => el.closest(l.sel));
    const mark = !label && host && el.matches(R.marks);
    const open = !label && R.open.find((o) => el.matches(o.sel));
    const kept = !label && !host && !open && (R.kept.find((k) => el.matches(k)) ||
      (!pseudo && R.kept.find((k) => el.parentElement && el.parentElement.closest(k))));
    findings.push({
      path: pathOf(el), cls: label ? 'label' : mark ? 'mark' : host ? 'label-descendant' : kept ? 'kept' : open ? 'open' : 'unknown',
      by: label ? label.sel : mark || host ? host.sel : kept || (open && open.sel) || null,
      ownership: open ? open.why : mark ? 'glyph owner; raw finding remains held' : null,
      fullText: (el.textContent || '').trim().replace(/\s+/g, ' '),
      tag: el.tagName.toLowerCase(), role: el.getAttribute('role'),
      action: el.getAttribute('data-o55-do') || el.getAttribute('data-o55t') || el.getAttribute('data-o55p'),
      argument: el.getAttribute('data-arg'), key: el.getAttribute('data-key'),
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
  return { findings, scanned, roots: rootsFor().map((r) => ({ path: pathOf(r), tag: r.tagName.toLowerCase() })) };
}


function collect(R) {
  const scan = function scanOnboarding(R) {
  const want = {}; want[R.scope] = true;
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
    return rootsFor().some((r) => r === el || r.contains(el)) ? R.scope : null;
  }
  function pathOf(el) {
    const bits = [];
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const sib = e.parentElement ? [...e.parentElement.children] : [e];
      bits.unshift(e.tagName.toLowerCase() + ':nth-child(' + (sib.indexOf(e) + 1) + ')');
    }
    return bits.join(' > ');
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
    for (const sel of R.roots) for (const e of document.querySelectorAll(sel)) {
      if (!e.isConnected || roots.some((r) => r === e || r.contains(e))) continue;
      for (let i = roots.length - 1; i >= 0; i--) if (e.contains(roots[i])) roots.splice(i, 1);
      roots.push(e);
    }
    return roots;
  }
  const findings = []; let scanned = 0;
  function record(el, cs, r, pseudo, kind, cls, stripe) {
    const label = R.labels.find((l) => el.matches(l.sel));
    const host = !label && R.labels.find((l) => el.closest(l.sel));
    const mark = !label && host && el.matches(R.marks);
    const open = !label && R.open.find((o) => el.matches(o.sel));
    const kept = !label && !host && !open && (R.kept.find((k) => el.matches(k)) ||
      (!pseudo && R.kept.find((k) => el.parentElement && el.parentElement.closest(k))));
    findings.push({
      path: pathOf(el), cls: label ? 'label' : mark ? 'mark' : host ? 'label-descendant' : kept ? 'kept' : open ? 'open' : 'unknown',
      by: label ? label.sel : mark || host ? host.sel : kept || (open && open.sel) || null,
      ownership: open ? open.why : mark ? 'glyph owner; raw finding remains held' : null,
      fullText: (el.textContent || '').trim().replace(/\s+/g, ' '),
      tag: el.tagName.toLowerCase(), role: el.getAttribute('role'),
      action: el.getAttribute('data-o55-do') || el.getAttribute('data-o55t') || el.getAttribute('data-o55p'),
      argument: el.getAttribute('data-arg'), key: el.getAttribute('data-key'),
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
  return { findings, scanned, roots: rootsFor().map((r) => ({ path: pathOf(r), tag: r.tagName.toLowerCase() })) };
};
    function alpha(c) {
    if (!c) return 0; c = String(c).trim().toLowerCase();
    if (c === 'transparent' || c === 'none') return 0;
    const m = c.match(/^rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(',').map((s) => s.trim()); if (p.length === 4) return parseFloat(p[3]); return 1; }
    if (c[0] === '#') return c.length === 9 ? parseInt(c.slice(7), 16) / 255 : 1;
    return 1; /* modern colour spaces resolve to rgb/rgba in computed style; treat the rest as opaque */
  }
  function pair(v) { const p = String(v).trim().split(/\s+/).map(parseFloat); return p.length === 1 ? [p[0], p[0]] : [p[0], p[1]]; }
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

  const raw = scan(R);
  const roots = R.roots.flatMap((s) => [...document.querySelectorAll(s)]);
  const inRoots = (el) => roots.some((r) => r === el || r.contains(el));
  const pathOf = (el) => {
    const bits = []; for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const sib = e.parentElement ? [...e.parentElement.children] : [e];
      bits.unshift(e.tagName.toLowerCase() + ':nth-child(' + (sib.indexOf(e) + 1) + ')');
    } return bits.join(' > ');
  };
  const vis = (el) => { const r = el.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return false;
    const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse') return false;
    const op = parseFloat(s.opacity); return Number.isNaN(op) || !(op < 0.05); };
  const attrs = (e) => [...e.attributes].filter((a) => /^(role$|aria-|data-(o55|arg|key)|type$|tabindex$)/.test(a.name)).map((a) => [a.name, a.value]).sort();
  const box = (s) => ({ radius: [s.borderTopLeftRadius,s.borderTopRightRadius,s.borderBottomRightRadius,s.borderBottomLeftRadius].join(' '),
    padding: [s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].join(' '), bg: s.backgroundColor, bgimg: s.backgroundImage,
    border: [s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth,s.borderTopStyle,s.borderRightStyle,s.borderBottomStyle,s.borderLeftStyle,s.borderTopColor,s.borderRightColor,s.borderBottomColor,s.borderLeftColor].join(' '),
    shadow: s.boxShadow, outline: s.outlineStyle + ' ' + s.outlineWidth });
  const out = { schema: 'onboarding-label-snapshot/v1', rawFindings: raw.findings, capsules: raw.findings.filter((f) => f.kind === 'pill'),
    scanned: raw.scanned, roots: raw.roots, labels: [], kept: [], marks: [], markup: '',
    ctlr: getComputedStyle(document.documentElement).getPropertyValue('--pm-ctl-r').trim(),
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, viewport: { width: innerWidth, height: innerHeight } };
  for (const L of R.labels) for (const el of document.querySelectorAll(L.sel)) {
    if (!inRoots(el) || !vis(el)) continue;
    const s = getComputedStyle(el), r = el.getBoundingClientRect(), path = pathOf(el);
    const pseudo = (p) => { const x = getComputedStyle(el, '::' + p); if (!x.content || x.content === 'none' || x.content === 'normal' || x.display === 'none') return null;
      return { w: parseFloat(x.width), h: parseFloat(x.height), radius: [x.borderTopLeftRadius,x.borderTopRightRadius,x.borderBottomRightRadius,x.borderBottomLeftRadius].join(' '),
        pill: pillOf(parseFloat(x.width), parseFloat(x.height), x), transition: x.transitionProperty + ' ' + x.transitionDuration,
        animation: x.animationName + ' ' + x.animationDuration, color: x.color, bg: x.backgroundColor }; };
    const rec = { id: path, path, kind: L.kind, sel: L.sel, sig: el.tagName.toLowerCase() + '.' + [...el.classList].sort().join('.'),
      text: (el.textContent || '').trim().replace(/\s+/g, ' '), x: r.x, y: r.y, w: r.width, h: r.height,
      pill: pillOf(r.width,r.height,s), shape: shapeOf(s), box: box(s), filled: alpha(s.backgroundColor) > 0.02 || s.backgroundImage !== 'none',
      on: el.classList.contains('o55-on'), color: s.color, font: s.font, tag: el.tagName.toLowerCase(), role: el.getAttribute('role'),
      act: el.getAttribute('data-o55-do'), key: el.getAttribute('data-key'), attributes: attrs(el),
      transition: s.transitionProperty + ' ' + s.transitionDuration, animation: s.animationName + ' ' + s.animationDuration,
      before: pseudo('before'), after: pseudo('after') };
    out.labels.push(rec);
    let n = 0;
    for (const mark of el.querySelectorAll(':scope > :is(' + R.marks + ')')) {
      const style = (m) => { const c = getComputedStyle(m); const fields = ['width','height','display','visibility','opacity','color','stroke','fill','strokeWidth','strokeOpacity','fillOpacity',
        'animationName','animationDuration','animationIterationCount','animationTimingFunction','animationDelay','animationDirection','animationFillMode','animationPlayState'];
        return Object.fromEntries(fields.map((f) => [f,c[f]])); };
      out.marks.push({ host: path, hostSel: L.sel, hostText: rec.text, n: n++, html: mark.outerHTML,
        style: style(mark), parts: [...mark.querySelectorAll('*')].map((m) => ({ tag: m.tagName, style: style(m) })),
        sampledTransform: getComputedStyle(mark).transform });
    }
    if (/\.o55-pill-(needs|fail)\b/.test(rec.sig) && n === 0) rec.absentMark = true;
  }
  const seen = new Set();
  for (const root of roots) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT); let e = root;
    do {
      if (seen.has(e)) continue; seen.add(e);
      if (e.nodeType === 3) { const t = e.textContent.trim(); if (t) out.markup += '\n' + JSON.stringify(t); continue; }
      const transient = /^(pmh-|o55-entering|o55-hold|o55-in-back|o55-out|o55-opening|o55-closing|o55-scrim-lit|o55-reason-show|o55-toast-show)/;
      out.markup += '\n<' + e.tagName.toLowerCase() + '.' + [...e.classList].filter((c) => !transient.test(c)).sort().join('.') + '|' + JSON.stringify(attrs(e));
      const kept = R.kept.find((s) => e.matches(s));
      if (kept && vis(e)) { const c = getComputedStyle(e); out.kept.push({ sel: kept, path: pathOf(e), sig: e.tagName.toLowerCase() + '.' + [...e.classList].filter((k) => !transient.test(k)).sort().join('.'),
        text: (e.textContent || '').trim().replace(/\s+/g, ' '), tag: e.tagName.toLowerCase(), role: e.getAttribute('role'), attributes: attrs(e),
        act: e.getAttribute('data-o55-do') || e.getAttribute('data-o55t') || e.getAttribute('data-o55p') || '', key: e.getAttribute('data-key') || '',
        box: box(c), w: c.width, h: c.height, color: c.color, font: c.font, hasLabel: R.labels.some((l) => e.querySelector(l.sel)) }); }
    } while ((e = walk.nextNode()));
  }
  return out;
}



/* Read-only geometry; scrolling is a disclosed existing UI operation, never CSS/DOM instrumentation. */
function wordGeometry(path, marks) {
  const el = document.querySelector(path); if (!el) return { error: 'label missing at ' + path };
  el.scrollIntoView({ block: 'center', inline: 'nearest' });
  const text = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), words = []; let node;
  while ((node = text.nextNode())) {
    if (!node.parentElement || node.parentElement.closest('svg,' + marks + ',[aria-hidden="true"]')) continue;
    const cs = getComputedStyle(node.parentElement), holds = [];
    if (cs.textShadow !== 'none' || parseFloat(cs.webkitTextStrokeWidth) > 0) holds.push('shadow/stroked word paint unsupported');
    for (let e = node.parentElement; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (parseFloat(s.opacity) !== 1 || s.visibility !== 'visible' || s.display === 'none') holds.push('non-opaque/hidden ancestor');
      if (s.backgroundImage !== 'none' || s.backdropFilter !== 'none') holds.push('image/gradient/backdrop paint unsupported by uniform word sampler');
      if (s.filter !== 'none' || s.mixBlendMode !== 'normal') holds.push('filter/blended foreground unsupported');
      if (s.transform !== 'none') holds.push('transformed word geometry unsupported');
      for (const a of e.getAnimations()) if (a.playState === 'running' && a.effect && a.effect.target === e) {
        const keys = a.effect.getKeyframes(); if (keys.some((k) => Object.keys(k).some((f) => /^(color|background|opacity|filter|transform)/.test(f)))) holds.push('changing foreground/background');
      }
    }
    for (const m of node.textContent.matchAll(/\S+/g)) {
      const range = document.createRange(); range.setStart(node,m.index); range.setEnd(node,m.index + m[0].length);
      const rects = [...range.getClientRects()].map((r) => ({ x:r.x,y:r.y,w:r.width,h:r.height }));
      for (const r of rects) {
        if (!(r.w > 0 && r.h > 0) || r.x < 0 || r.y < 0 || r.x+r.w > innerWidth || r.y+r.h > innerHeight) holds.push('word outside screenshot/zero geometry');
        const top = document.elementFromPoint(r.x+r.w/2,r.y+r.h/2);
        if (!top || !(top === el || el.contains(top))) holds.push('word occluded or unavailable');
      }
      words.push({ text:m[0], color:cs.color, font:cs.font, rects, holds:[...new Set(holds)] });
    }
  }
  return { words, viewport:{ width:innerWidth,height:innerHeight }, dpr:devicePixelRatio,
    text:(el.textContent || '').trim().replace(/\s+/g,' ') };
}

/* Pure sampler, also exercised with synthetic pixel arrays without a product browser. */
export function sampleWordPixels(pixels, color, backgroundWitness) {
  function inkOf(s) {
    if (typeof s !== 'string') return null;
    let values;
    const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(s);
    if (srgb) values = [Number(srgb[1])*255,Number(srgb[2])*255,Number(srgb[3])*255,srgb[4] == null ? 1 : Number(srgb[4])];
    else { const rgb = /^rgba?\(([^)]+)\)$/.exec(s); if (!rgb) return null;
      const parts = rgb[1].trim().split(/\s*[,/]\s*|\s+/).filter(Boolean);
      if (parts.length !== 3 && parts.length !== 4) return null;
      values = parts.slice(0,3).map((p) => p.endsWith('%') ? parseFloat(p)*2.55 : Number(p));
      values.push(parts[3] == null ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3])/100 : Number(parts[3])); }
    if (!values.every(Number.isFinite) || values.slice(0,3).some((v) => v < 0 || v > 255) || values[3] < 0 || values[3] > 1) return null;
    return values;
  }
  const ink = inkOf(color);
  if (!ink) return { error:'unparsed ink ' + String(color) };
  if (!Array.isArray(pixels) || pixels.length < 16 || pixels.some((p) => !Array.isArray(p) || p.length !== 4 || p[3] !== 255 || p.some((v) => !Number.isFinite(v)))) return { error:'missing/non-opaque screenshot pixels' };
  if(!Array.isArray(backgroundWitness) || backgroundWitness.length<4 || backgroundWitness.some((p) => !Array.isArray(p) || p.length!==4 || p[3]!==255)) return {error:'actual word background witness missing'};
  const bg=backgroundWitness[0].slice(0,3);
  if(backgroundWitness.some((p) => p.slice(0,3).some((v,i) => v!==bg[i]))) return {error:'non-uniform background witness around actual word'};
  const counts = new Map(); for (const p of pixels) { const k=p.slice(0,3).join(','); counts.set(k,(counts.get(k)||0)+1); }
  const modes = [...counts].sort((a,b) => b[1]-a[1]);
  if((counts.get(bg.join(','))||0)/pixels.length<0.1) return {error:'witnessed background not observed inside actual word rectangle'};
  const fg = bg.map((b,i) => ink[i]*ink[3] + b*(1-ink[3]));
  const axis = fg.map((f,i) => f-bg[i]); const len = axis.reduce((n,v) => n+v*v,0);
  if (len < 1) return {error:'actual word ink indistinguishable from witnessed background'};
  let nearInk=0, unexplained=0;
  for (const p of pixels) {
    const t = axis.reduce((n,v,i) => n+(p[i]-bg[i])*v,0)/len;
    const expected=bg.map((b,i) => b+Math.max(0,Math.min(1,t))*axis[i]);
    if (t < -0.03 || t > 1.03 || expected.some((v,i) => Math.abs(v-p[i]) > 3)) unexplained++;
    if (t > 0.5) nearInk++;
  }
  if (unexplained) return { error:'non-uniform or unexplained paint in actual word rectangle', unexplained, pixels:pixels.length, modes:modes.slice(0,3) };
  if (!nearInk) return { error:'actual word ink not observed in its pixel rectangle', pixels:pixels.length };
  const lin=(v) => { v/=255; return v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
  const lum=(p) => .2126*lin(p[0])+.7152*lin(p[1])+.0722*lin(p[2]);
  const a=lum(fg),b=lum(bg);
  return { ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05), under:'rgb('+bg.join(',')+')', ink:color,
    method:'actual-word-uniform/v1', pixels:pixels.length, backgroundFraction:(counts.get(bg.join(','))||0)/pixels.length, backgroundWitnessPixels:backgroundWitness.length, visibleInk:true };
}

async function contrastOf(page, label) {
  if (!label.path) return { error:'missing read-only label path' };
  const before = await page.evaluate(wordGeometry,label.path,STATUS_MARKS);
  if(before.error) return before;
  if(before.text!==label.text) return {error:'label words changed between collection and sampling',collected:label.text,sampled:before.text};
  if (before.error || !before.words.length) return { error:before.error || 'label contains no measurable words' };
  if (before.dpr !== 1) return { error:'unsupported screenshot device pixel ratio ' + before.dpr };
  if (before.words.some((w) => w.holds.length)) return { error:'unsupported actual word paint/geometry', words:before.words };
  const shot = await page.send('Page.captureScreenshot',{ format:'png',captureBeyondViewport:false,
    clip:{ x:0,y:0,width:before.viewport.width,height:before.viewport.height,scale:1 } });
  if (!shot.data) return { error:'screenshot response missing data' };
  const after = await page.evaluate(wordGeometry,label.path,STATUS_MARKS);
  if (JSON.stringify(before) !== JSON.stringify(after)) return { error:'word/paint moved during screenshot', before, after };
  const decode = async (b64,geometry,samplerSource) => {
    const bytes = Uint8Array.from(atob(b64),(c) => c.charCodeAt(0));
    const bm=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
    const canvas=new OffscreenCanvas(bm.width,bm.height); const ctx=canvas.getContext('2d');
    if (!ctx || bm.width!==geometry.viewport.width || bm.height!==geometry.viewport.height) return { error:'screenshot dimensions/context unavailable' };
    ctx.drawImage(bm,0,0); const d=ctx.getImageData(0,0,bm.width,bm.height).data;
    const sample = (0,eval)('('+samplerSource+')');
    const words=geometry.words.map((w) => ({ text:w.text,rects:w.rects,samples:w.rects.map((r) => {
      const pixels=[]; for(let y=Math.ceil(r.y);y<Math.floor(r.y+r.h);y++) for(let x=Math.ceil(r.x);x<Math.floor(r.x+r.w);x++) {
        const k=(y*bm.width+x)*4; pixels.push([d[k],d[k+1],d[k+2],d[k+3]]);
      }
      const witness=[];for(const y of [Math.floor(r.y)-1,Math.ceil(r.y+r.h)]) {
        if(y<0 || y>=bm.height) return {error:'word witness outside screenshot'};
        for(let x=Math.ceil(r.x);x<Math.floor(r.x+r.w);x++) {const k=(y*bm.width+x)*4;witness.push([d[k],d[k+1],d[k+2],d[k+3]]);}
      } return sample(pixels,w.color,witness);
    }) }));
    bm.close(); const samples=words.flatMap((w) => w.samples);
    if (!samples.length || samples.some((s) => s.error)) return { error:'actual word background/ink unverified', words };
    return { ratio:Math.min(...samples.map((s) => s.ratio)), method:'actual-word-uniform/v1', words };
  };
  const result=await page.evaluate(decode,shot.data,before,sampleWordPixels.toString());
  const screenshotBytes=Buffer.from(shot.data,'base64'), screenshotHash=sha(screenshotBytes);
  if(!OUT) return {error:'word screenshot evidence output is not bound',measurement:result};
  const sampleDir=join(OUT,'word-samples'), samplePath=join(sampleDir,screenshotHash+'.png');
  mkdirSync(sampleDir,{recursive:true});
  if(existsSync(samplePath)) {if(sha(readFileSync(samplePath))!==screenshotHash) return {error:'existing word screenshot custody mismatch',path:samplePath};}
  else writeFileSync(samplePath,screenshotBytes,{flag:'wx'});
  return { ...result, screenshot_sha256:screenshotHash, screenshot_path:samplePath, geometry:before,
    observed_at:new Date().toISOString(), instrumentation:'none: native text and animations retained' };
}
async function measure(page,d) {
  for(const L of d.labels) { try { L.contrast=await contrastOf(page,L); } catch(e) { L.contrast={error:String(e.stack||e)}; } }
}



export function newReport() {
  return { schema:'onboarding-label-gate/v1', generated_at:new Date().toISOString(), phase:'A-tool-preparation',
    authority:AUTHORITY, word_floor:WORD_FLOOR, frozen_head:FROZEN_HEAD, frozen_tools:FROZEN,
    pages:{}, runs:[], failures:[], holds:[], unverified:[], regressions:[], comparisons:[],
    rawFindings:[], contrastLow:[], originalReceipts:[], notes:[], resources:[], coverage:[] };
}
const issue=(r,bucket,where,code,detail) => r[bucket].push({ where,code,detail });
const failure=(r,w,c,d) => issue(r,'failures',w,c,d);
const unknown=(r,w,c,d) => issue(r,'unverified',w,c,d);
const hold=(r,w,c,d) => issue(r,'holds',w,c,d);
export function verdict(r) {
  const observed = r.observations_complete===true && r.runs.length>0;
  const hold = !observed || !!(r.failures.length || r.regressions.length || r.holds.length || r.unverified.length);
  return { status:hold ? 'HOLD' : 'READY', exit_code:!observed || r.unverified.length ? 2 : hold ? 1 : 0,
    absolute_failures:r.failures.length, regressions:r.regressions.length, ownership_holds:r.holds.length,
    unverified:r.unverified.length, observations_complete:observed, raw_findings:r.rawFindings.length, contrast_below_floor:r.contrastLow.length };
}
export function judgeContrast(r,where,base,cand) {
  const cr=cand && cand.contrast, br=base && base.contrast;
  const value=(c) => c && !c.error && typeof c.ratio==='number' && Number.isFinite(c.ratio) && c.ratio>=1 && c.ratio<=21.00001;
  if (!value(cr)) unknown(r,where,'contrast-unmeasured',cr || 'missing contrast');
  else {
    if (cr.ratio < WORD_FLOOR) {
      const row={ where,sel:cand.sel,text:cand.text,base:value(br)?br.ratio:null,cand:cr.ratio,
        measurement:cr,authority:AUTHORITY.contrast, inherited:value(br) && cr.ratio===br.ratio,
        improved:value(br) && cr.ratio>br.ratio };
      r.contrastLow.push(row); failure(r,where,'absolute-word-contrast',row);
    }
    if (cr.method !== 'actual-word-uniform/v1' || !Array.isArray(cr.words) || !cr.words.length ||
      cr.words.some((w) => !Array.isArray(w.samples) || !w.samples.length || w.samples.some((s) => s.error || !value(s) || s.method!=='actual-word-uniform/v1' || s.visibleInk!==true)) ||
      !cr.screenshot_sha256 || !cr.geometry || !cr.observed_at) unknown(r,where,'actual-word-background-unverified',cr);
  }
  if (!value(br)) unknown(r,where,'base-contrast-unmeasured',br || 'missing base contrast');
  else if (br.method !== 'actual-word-uniform/v1') unknown(r,where,'base-word-background-unverified',br);
  const compared={ where,base:value(br)?br.ratio:null,cand:value(cr)?cr.ratio:null,
    measured:value(br)&&value(cr), absolute_floor:WORD_FLOOR,
    regression:value(br)&&value(cr)&&cr.ratio < br.ratio-.05 && cr.ratio < WORD_FLOOR };
  r.comparisons.push(compared);
  if (compared.regression) issue(r,'regressions',where,'contrast-regression',compared);
}
const maxRadius=(s) => { const v=String(s).split(/\s+/).map(parseFloat); return v.length && v.every(Number.isFinite)?Math.max(...v):NaN; };
export function reducedTransitionOK(s) {
  if (typeof s!=='string') return null;
  const durations=s.match(/(?:^|\s|,)([\d.]+)(ms|s)(?=\s|,|$)/g);
  if (!durations) return /^none\b/.test(s) ? true : null;
  return durations.every((t) => parseFloat(t.replace(/^[\s,]+/,''))===0);
}
function judgeLabels(r,where,d,motion) {
  for(const L of d.labels) {
    const at=where+' '+L.sel+' '+JSON.stringify(L.text);
    if(L.pill) failure(r,at,'label-pill',L);
    if(L.kind==='status' || L.kind==='tag') {
      if(L.shape) failure(r,at,'label-box',L.box);
      if(!L.box || L.box.padding!=='0px 0px 0px 0px') failure(r,at,'label-padding',L.box);
    }
    if(L.kind==='tag' && L.sel!=='.o55-routelink > span') {
      if(!L.before || !Number.isFinite(L.before.w) || !Number.isFinite(L.before.h)) unknown(r,at,'square-mark-unavailable',L.before);
      else if(Math.abs(L.before.w-L.before.h)>.01 || L.before.pill || maxRadius(L.before.radius)!==0) failure(r,at,'mark-not-square',L.before);
    }
    if(L.kind==='choice') {
      const lim=parseFloat(d.ctlr),rad=L.box && maxRadius(L.box.radius);
      if(!Number.isFinite(lim) || !Number.isFinite(rad)) unknown(r,at,'choice-corner-unmeasured',{ctlr:d.ctlr,box:L.box});
      else if(rad > lim+.5) failure(r,at,'choice-corner',{radius:rad,limit:lim});
      if(L.on && !L.filled) failure(r,at,'chosen-cell-not-filled',L);
    }
    if(L.absentMark || /\.o55-pill-(needs|fail)\b/.test(L.sig||'') && !d.marks.some((m) => m.host===L.id)) unknown(r,at,'required-status-mark-absent','glyph owner; no mark element rendered, not an exemption');
    if(motion==='reduced') {
      for(const [part,p] of [['word',L],['before',L.before],['after',L.after]]) {
        if(!p) continue;
        const ok=reducedTransitionOK(p.transition);
        if(ok===null) unknown(r,at,'reduced-transition-unparsed',{part,transition:p.transition});
        else if(!ok) failure(r,at,'reduced-transition',{part,transition:p.transition});
        if(p.animation == null) unknown(r,at,'reduced-animation-unmeasured',part);
        else if(!/^none(?:\s|$)/.test(p.animation) && reducedTransitionOK(p.animation)!==true) failure(r,at,'reduced-label-animation',{part,animation:p.animation});
      }
    }
  }
}
function judgeRaw(r,where,d,which) {
  const raw=d.rawFindings || (d.capsules || []).map((c) => ({kind:'pill',...c, acquisition:'legacy-collector'}));
  for(const c of raw) {
    const at=where+' '+c.sig+' '+JSON.stringify(c.fullText||c.text||'');
    r.rawFindings.push({where,which,...c});
    if(which==='base') continue;
    if(c.kind==='stripe') {hold(r,at,'stripe-supplement-scope-disposition-required',c);continue;}
    if(c.cls==='kept') { r.notes.push({where:at,code:'kept-action-raw-finding',finding:c,
      authority:AUTHORITY.label_action, acceptance:'only if role/action/markup/style custody also compares; not a detector exemption'}); continue; }
    if(c.cls==='open') {
      const owner=OPEN.find((o) => o.sel===c.by);
      hold(r,at,'scope-disposition-required',{finding:c,ownership:owner?owner.why:c.ownership});
      if(c.kind==='pill' && /^\.pm6-wiz-(schip|statepill)$/.test(c.by||'')) failure(r,at,'wizard-label-pill-outside-source-scope',c);
    } else if(c.cls==='mark') {
      failure(r,at,'eligible-raw-status-mark-pill',c);
      hold(r,at,'glyph-ownership-required',{finding:c,comparison:'independent base/candidate style/markup comparison cannot waive the raw finding'});
    } else failure(r,at,c.kind==='pill'?'eligible-unaccepted-pill':'eligible-unaccepted-stripe',c);
  }
  if(!Array.isArray(d.rawFindings)) unknown(r,where,'frozen-detector-acquisition-unverified','legacy collector has different skip tags and skipped direct label marks; missing findings cannot be reconstructed from its zero arrays');
}
const grouped=(rows,key) => { const out=new Map(); for(const row of rows) { const k=key(row); if(!out.has(k)) out.set(k,[]); out.get(k).push(row); } return out; };
const labelKey=(l) => JSON.stringify([l.sel,l.text,l.act||'',l.key||'',l.tag,l.role||'']);
function compareRows(r,where,kind,b,c,key,fields) {
  const B=grouped(b,key),C=grouped(c,key);
  for(const k of new Set([...B.keys(),...C.keys()])) {
    const bb=B.get(k)||[],cc=C.get(k)||[];
    if(bb.length!==cc.length) { issue(r,'regressions',where,kind+'-count',{key:k,base:bb.length,cand:cc.length}); continue; }
    for(let i=0;i<bb.length;i++) for(const f of fields) {
      if(bb[i][f]==null || cc[i][f]==null) { unknown(r,where,kind+'-'+f+'-unmeasured',{key:k,n:i,base:bb[i][f],cand:cc[i][f]}); continue; }
      if(kind==='kept' && bb[i].hasLabel && (f==='w'||f==='h')) {
        const equal=bb[i][f]===cc[i][f],detail={key:k,n:i,property:f,base:bb[i][f],cand:cc[i][f],
          base_size:{w:bb[i].w,h:bb[i].h},cand_size:{w:cc[i].w,h:cc[i].h}};
        r.comparisons.push({where,kind:'kept-label-host-dimension',...detail,equal,
          acceptance:equal?'exact equality recorded; other action checks remain required':'HOLD: source-owner disposition required; natural size does not establish control preservation'});
        if(!equal) {
          r.notes.push({where,code:'label-host-natural-size-delta',...detail});
          hold(r,where,'label-host-control-geometry-source-owner-disposition-required',detail);
        }
        continue;
      }
      if(JSON.stringify(bb[i][f])!==JSON.stringify(cc[i][f])) issue(r,'regressions',where,kind+'-'+f,{key:k,n:i,base:bb[i][f],cand:cc[i][f]});
    }
  }
}
export function judgePair(r,where,b,c,motion) {
  if(!b || !c || !Array.isArray(b.labels) || !Array.isArray(c.labels) || !Array.isArray(b.kept) || !Array.isArray(c.kept) || !Array.isArray(b.marks) || !Array.isArray(c.marks)) {
    unknown(r,where,'snapshot-unavailable',{base:!!b,cand:!!c}); return;
  }
  for(const [which,d] of [['base',b],['cand',c]]) {
    if(d.schema!=='onboarding-label-snapshot/v1' || !Array.isArray(d.roots) || !d.roots.length || !(d.scanned>0)) unknown(r,where+' '+which,'context-acquisition-unverified',{schema:d.schema,roots:d.roots,scanned:d.scanned});
    if(d.reduced!== (motion==='reduced')) unknown(r,where+' '+which,'motion-state-unconfirmed',d.reduced);
    judgeRaw(r,where,d,which);
  }
  judgeLabels(r,where,c,motion);
  compareRows(r,where,'kept',b.kept,c.kept,(k) => JSON.stringify([k.sel,k.sig,k.text,k.act,k.key]),['tag','attributes','box','w','h','color','font']);
  compareRows(r,where,'mark',b.marks,c.marks,(m) => JSON.stringify([m.hostSel,m.hostText,m.n]),['html','style','parts']);
  const bl=b.labels.map(labelKey).sort(),cl=c.labels.map(labelKey).sort();
  if(JSON.stringify(bl)!==JSON.stringify(cl)) issue(r,'regressions',where,'label-set',{base:bl,cand:cl});
  if(typeof b.markup!=='string' || typeof c.markup!=='string' || !b.markup || !c.markup) unknown(r,where,'markup-unavailable',null);
  else if(b.markup!==c.markup) issue(r,'regressions',where,'markup',{base_sha256:sha(b.markup),cand_sha256:sha(c.markup),
    explanation:'timed narrator/practice words retained; unavailable equivalent state remains HOLD, never a blanket text exclusion'});
  const B=grouped(b.labels,labelKey); const occurrence=new Map();
  for(const l of c.labels) { const k=labelKey(l),n=occurrence.get(k)||0; occurrence.set(k,n+1);
    if(l.kind==='tag' && l.sel!=='.o55-routelink > span' && l.before) unknown(r,where+' '+l.sel+' '+JSON.stringify(l.text),
      'checkpoint-square-mark-ink-custody-unverified',{checkpoint:FROZEN_HEAD,candidate:l.before,
        explanation:'NP square marks were introduced at the frozen source checkpoint; e254 is not their ink baseline. Independently bound checkpoint/repair evidence is required; do not infer preservation from the word or invent a glyph exemption.'});
    judgeContrast(r,where+' '+l.sel+' '+JSON.stringify(l.text)+' #'+n,(B.get(k)||[])[n],l); }
  const rb=grouped(b.rawFindings||b.capsules||[],(f) => JSON.stringify([f.kind||'pill',f.sig,f.pseudo,f.text,f.by]));
  const rc=grouped(c.rawFindings||c.capsules||[],(f) => JSON.stringify([f.kind||'pill',f.sig,f.pseudo,f.text,f.by]));
  for(const k of new Set([...rb.keys(),...rc.keys()])) r.comparisons.push({where,kind:'raw-findings',key:k,base:rb.get(k)||[],cand:rc.get(k)||[],
    inherited:rb.has(k)&&rc.has(k), acceptance:'none: comparison does not exempt absolute/ownership findings'});
}

function checkExpected(r,where,data,expected) {
  if(!data || !Array.isArray(data.labels)) { unknown(r,where,'expected-labels-unavailable',expected); return; }
  for(const [sel,min] of Object.entries(expected||{})) {
    const n=data.labels.filter((l) => l.sel===sel).length;
    r.coverage.push({where,sel,expected_min:min,observed:n});
    if(n<min) unknown(r,where,'expected-label-not-reached',{sel,expected_min:min,observed:n});
  }
}
function judgeUnpairedCandidate(r,where,d,motion) {
  unknown(r,where,'paired-base-context-unverified','The completed base inventory is not repeated. No new paired base snapshot exists for this sweep context; comparisons remain held.');
  if(!d || !Array.isArray(d.labels) || !Array.isArray(d.marks)) {unknown(r,where,'candidate-sweep-snapshot-unavailable',null);return;}
  if(d.schema!=='onboarding-label-snapshot/v1' || !d.roots || !d.roots.length || !(d.scanned>0)) unknown(r,where,'candidate-sweep-acquisition-unverified',{schema:d.schema,roots:d.roots,scanned:d.scanned});
  if(d.reduced!==(motion==='reduced')) unknown(r,where,'candidate-sweep-motion-unconfirmed',d.reduced);
  judgeRaw(r,where,d,'cand');judgeLabels(r,where,d,motion);
  for(const l of d.labels) {
    judgeContrast(r,where+' '+l.sel+' '+JSON.stringify(l.text),null,l);
    if(l.kind==='tag' && l.sel!=='.o55-routelink > span' && l.before) unknown(r,where+' '+l.sel,'checkpoint-square-mark-ink-custody-unverified',{checkpoint:FROZEN_HEAD,candidate:l.before});
  }
}
export function judgeRun(r,run) {
  const tag=run.look+'/'+run.motion, B=run.pages && run.pages.base, C=run.pages && run.pages.cand;
  if(!B || !C) { unknown(r,tag,'page-run-missing',run); return; }
  if(B.runtime && C.runtime && B.runtime.renderer!==C.runtime.renderer) unknown(r,tag,'base-candidate-renderer-mismatch',{base:B.runtime.renderer,cand:C.runtime.renderer});
  for(const [which,p] of [['base',B],['cand',C]]) {
    if(!p.state || !p.state.confirmed || p.state.reduced!==(run.motion==='reduced')) unknown(r,tag+' '+which,'look-motion-unconfirmed',p.state);
    for(const e of p.errors||[]) unknown(r,tag+' '+which,'page-or-driver-error',e);
    const runtimes=p.runtime_observations && p.runtime_observations.length ? p.runtime_observations : [p.runtime];
    for(const runtime of runtimes) {
      if(!runtime || runtime.schema!=='onboarding-ordinary-runtime/v1' || runtime.contextConfirmed!==true) unknown(r,tag+' '+which,'navigated-runtime-context-unverified',runtime);
      if(!runtime || !runtime.renderer || !runtime.rendererConfirmed || !runtime.browserVersion) unknown(r,tag+' '+which,'renderer-runtime-unverified',runtime);
    }
    if(p.resource_closed!==true) unknown(r,tag+' '+which,'owned-browser-stop-unverified',p.resource_closed);
  }
  const paired=(where,b,c) => { if(!b || !c || b.error || c.error) { unknown(r,where,'view-unavailable',{base:b&&b.error||(!b?'missing':null),cand:c&&c.error||(!c?'missing':null)}); return; }
    judgePair(r,where,b.data,c.data,run.motion); };
  if(doWindow) for(const v of VIEWS) {
    const b=(B.views||{})[v.id],c=(C.views||{})[v.id],where=tag+' '+v.id;
    paired(where,b,c);
    for(const [which,p] of [['base',b],['cand',c]]) checkExpected(r,where+' '+which,p&&p.data,EXPECT_LABELS[v.id]);
    if(v.flow==='suggest') {
      for(const which of ['base','cand']) { const p=which==='base'?b:c;
        for(const k of ['click','key']) if(!p || !p.flow || !p.flow[k] || p.flow[k].ok!==true) unknown(r,where+' '+which,'suggestion-'+k+'-flow-unverified',p&&p.flow&&p.flow[k]); }
      if(b&&c&&b.flow&&c.flow) {
        for(const k of ['click','key']) if(b.flow[k]&&c.flow[k]&&JSON.stringify([b.flow[k].field,b.flow[k].on])!==JSON.stringify([c.flow[k].field,c.flow[k].on])) issue(r,'regressions',where,'suggestion-flow-'+k,{base:b.flow[k],cand:c.flow[k]});
        judgePair(r,where+' chosen',b.flow.after,c.flow.after,run.motion);
      }
    }
    if(v.flow==='newfolder' || v.flow==='lookmenu') for(const [which,p] of [['base',b],['cand',c]]) {
      const field=v.flow==='newfolder'?'newFolder':'menu';
      if(!p || !p.flow || p.flow[field]!==true) unknown(r,where+' '+which,'required-flow-unverified',{field,result:p&&p.flow&&p.flow[field]});
    }
  }
  if(flag('sweep')) {
    for(const s of ALL_SCREENS) {
      const b=(B.sweep||{})[s]||(B.views&&B.views['nas-folder']&&B.views['nas-folder'].pathCaps||{})[s];
      const c=(C.sweep||{})[s]||(C.views&&C.views['nas-folder']&&C.views['nas-folder'].pathCaps||{})[s];
      if(!b || !c || Array.isArray(b) || Array.isArray(c)) {
        unknown(r,tag+' sweep '+s,'screen-context-unverified',{base:b||null,cand:c||null,
          ownership:NEEDS_DEVICE.includes(s)?'fixture/UI path needs device or other legitimate route; no session/DOM forcing':'missing full snapshot'});
        if(c && !Array.isArray(c) && c.data) judgeUnpairedCandidate(r,tag+' sweep '+s,c.data,run.motion);
        continue;
      }
      paired(tag+' sweep '+s,b,c);
    }
  }
  if(doTour) {
    const b=grouped(B.tour||[],(t) => t.step),c=grouped(C.tour||[],(t) => t.step);
    for(const p of [...(B.tour||[]),...(C.tour||[])]) if(p.error) unknown(r,tag,'tour-error',p);
    for(const step of TOUR_STEPS) {
      const bb=b.get(step)||[],cc=c.get(step)||[];
      if(bb.length!==1 || cc.length!==1) { unknown(r,tag+' tour '+step,'expected-tour-context-not-reached',{base:bb.length,cand:cc.length}); continue; }
      paired(tag+' tour '+step,bb[0],cc[0]);
      if(step==='book_club_goal:practice') for(const [which,p] of [['base',bb[0]],['cand',cc[0]]]) {
        if(!Array.isArray(p.input_receipts) || !p.input_receipts.some((x) => x.selector.includes('[data-o55t="showMe"]') && trustedClickVerified(x.receipt,x.selector)))
          unknown(r,tag+' tour '+step+' '+which,'trusted-show-me-flow-unverified','No observed trusted Show Me receipt; a page switch, fixed wait, done flag or zero array cannot substitute.');
      }
      if(step!=='comfort_intro') for(const [which,p] of [['base',bb[0]],['cand',cc[0]]]) checkExpected(r,tag+' tour '+step+' '+which,p.data,{'.o55t-trylabel':1});
      if(/book_club_goal|three_outcomes/.test(step)) for(const [which,p] of [['base',bb[0]],['cand',cc[0]]]) checkExpected(r,tag+' tour '+step+' '+which,p.data,{'.o55p-badge':1});
    }
  }
}
function finalCoverage(r) {
  if(!r.runs.length) unknown(r,'matrix','no-product-observations','zero arrays or a tool-only exit 0 do not establish product success');
  const expected=looks.flatMap((l) => motions.map((m) => l.id+'/'+m));
  const observed=r.runs.map((x) => x.look+'/'+x.motion);
  r.observations_complete=expected.length>0 && expected.every((k) => observed.filter((x) => x===k).length===1);
  for(const k of expected) if(observed.filter((x) => x===k).length!==1) unknown(r,'matrix','expected-combination-missing-or-duplicate',k);
  for(const run of r.runs) {
    const p=run.pages&&run.pages.cand,sel=new Set();
    if(p) for(const v of [...Object.values(p.views||{}),...Object.values(p.sweep||{}),...(p.tour||[])]) for(const l of v&&v.data&&v.data.labels||[]) sel.add(l.sel);
    for(const L of LABELS) if((doTour || !['.o55t-trylabel','.o55p-badge'].includes(L.sel)) && !sel.has(L.sel)) unknown(r,run.look+'/'+run.motion,'selector-never-rendered',{sel:L.sel,
      explanation:L.sel==='.o55-officialurl'?'no known renderer in this frozen page; must remain unverified':'missing expected context'});
    unknown(r,run.look+'/'+run.motion,'fail-status-renderer-unverified','.o55-pill-fail has no known renderer/fixture in frozen source; do not manufacture it');
    unknown(r,run.look+'/'+run.motion,'needs-fail-glyph-contract-open','source owner reports needs/fail have no mark element; glyph owner disposition required');
  }
}


async function bootPage(page, which, look, motion) {
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: look.mode }, { name: 'prefers-reduced-motion', value: motion === 'reduced' ? 'reduce' : 'no-preference' }] });
  await page.goto(pathToFileURL(PAGES[which]).href + '?o55=off&o55scenario=fresh');
  await until(page, () => !!(window.O55 && window.O55.ui && window.O55.ui.open && window.PM12_KIMI && window.PM_THEME), 45000);
  await sleep(700);
  let state = null;
  for (let a = 0; a < 5; a++) {
    await page.evaluate((f, m, n, plain) => {
      const cap = (s) => s[0].toUpperCase() + s.slice(1);
      window.PM12_KIMI.setSettingFromHost('general.visual.theme', cap(f) + ' ' + cap(m));
      if (!window.PM_NIER) throw new Error('PM_NIER unavailable'); window.PM_NIER.set(!!n);
      if (n && plain) { window.PM_NIER.setParts(window.PM_NIER.parts().filter((k) => k !== 'square')); }
      localStorage.removeItem('pm.o55.onboarding.v1'); localStorage.removeItem('pm.o55.tour.v1');
    }, look.family, look.mode, !!look.nier, !!look.plain);
    await sleep(700);
    state = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, nier: document.documentElement.getAttribute('data-o55-nier'), parts: document.documentElement.getAttribute('data-o55-nier-parts') || '',
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches }));
    if (state.reduced === (motion === 'reduced') && state.theme === look.family + '-' + look.mode && (look.nier ? state.nier === 'on' : state.nier !== 'on') && (!look.plain || !/\bsquare\b/.test(state.parts))) { state.confirmed = true; break; }
  }
  return state;
}

const settle = async (page, id) => {
  for (let i = 0; i < 80; i++) {
    const ok = await page.evaluate((sc) => { const S = window.O55.S, r = document.getElementById('pm-o55-onboarding'); const l = r && r.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
      return !!(S.open && S.sess && l && (!sc || S.sess.screen === sc) && l.getAttribute('data-screen') === S.sess.screen && !r.matches('.o55-hold, .o55-opening, .o55-closing') && !l.matches('.o55-hold, .o55-entering') && !r.querySelector('.o55-pane > .o55-out')); }, id);
    if (ok) return true; await sleep(120);
  }
  throw new Error('screen did not settle: ' + (id || 'current'));
};
const mouseAway = (page) => page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: VIEWPORT.height - 2 });

export function trustedClickVerified(receipt,selector) {
  return !!(receipt && receipt.trusted===true && receipt.type==='click' && receipt.selector===selector && receipt.tag);
}
async function clickAt(page, sel) {
  for (let i = 0; i < 60; i++) {
    const c = await page.evaluate((s) => { const el = [...document.querySelectorAll(s)].find((e) => e.getClientRects().length && !e.closest('[inert]')); if (!el) return null; el.scrollIntoView({ block: 'nearest' });
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y); return { x, y, hit: !!top && (top === el || el.contains(top)) }; }, sel);
    if (c && c.hit) {
      const tree=await page.send('Page.getFrameTree');
      if(!tree.frameTree || !tree.frameTree.frame) throw new Error('trusted click frame unavailable');
      const world=await page.send('Page.createIsolatedWorld',{frameId:tree.frameTree.frame.id,worldName:'pm7-onboarding-label-gate-input-v1'});
      if(!world.executionContextId) throw new Error('trusted input observation world unavailable');
      const arm=function(selector) {
        const state=globalThis.__pm7GateInput||(globalThis.__pm7GateInput={});
        if(!state.listening) {
          document.addEventListener('click',(e) => {
            const t=e.target && e.target.closest && e.target.closest(state.selector);
            if(t) state.receipt={type:e.type,trusted:e.isTrusted,selector:state.selector,tag:t.tagName,role:t.getAttribute('role'),
              action:t.getAttribute('data-o55t')||t.getAttribute('data-o55-do')||t.getAttribute('data-o55p'),observed_at:new Date().toISOString()};
          },{capture:true,passive:true});state.listening=true;
        }
        state.selector=selector;state.receipt=null;return true;
      };
      const armed=await page.send('Runtime.evaluate',{contextId:world.executionContextId,expression:'('+arm.toString()+')('+JSON.stringify(sel)+')',returnByValue:true});
      if(armed.exceptionDetails || !armed.result || armed.result.value!==true) throw new Error('trusted input observer did not arm: '+JSON.stringify(armed));
      await page.mouse(c.x,c.y);
      const read=await page.send('Runtime.evaluate',{contextId:world.executionContextId,expression:'globalThis.__pm7GateInput.receipt',returnByValue:true});
      if(read.exceptionDetails || !read.result) throw new Error('trusted input receipt unavailable: '+JSON.stringify(read));
      const receipt=read.result.value;
      (page.inputReceipts||(page.inputReceipts=[])).push({selector:sel,x:c.x,y:c.y,receipt});
      return trustedClickVerified(receipt,sel);
    }
    await sleep(100);
  }
  return false;
}

const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const until = async (page, fn, ms = 12000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await sleep(150); } throw new Error('fixture/UI condition not reached: ' + fn.toString()); };
/* The folder browser needs a device the person found and signed in to: the same clicks as scenario n1
   (tools/scenarios.mjs), from a fresh window, with the fixture world's Home NAS. */
async function nasPath(page, seen) {
  const act = async (a, arg) => { if (!(await clickAt(page, `${LAYER} [data-o55-do="${a}"]` + (arg != null ? `[data-arg="${arg}"]` : '')))) throw new Error('no control ' + a + ' ' + (arg || '')); await settle(page); };
  const primary = async () => { await until(page, () => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-primary'); return b && b.getAttribute('aria-disabled') !== 'true'; });
    if (!(await clickAt(page, `${LAYER} .o55-primary`))) throw new Error('no primary'); await sleep(200); await settle(page);
    if (seen) { await sleep(500); const sc = await page.evaluate(() => window.O55.S.sess.screen); if (!seen[sc]) { await mouseAway(page); const data = await page.evaluate(collect, R_WIN); await measure(page,data); seen[sc] = {data,flow:{}}; } } };
  const type = async (bind, text) => { await page.evaluate((b) => { const i = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) [data-o55-bind="' + b + '"]'); i.focus(); i.select && i.select(); }, bind);
    await page.send('Input.insertText', { text }); await sleep(250); };
  await page.evaluate(() => { window.O55.ui.close('test'); localStorage.removeItem('pm.o55.onboarding.v1'); window.O55.ui.open({ fresh: true }); });
  await settle(page); await primary(); await primary(); await primary();
  await act('pick', 'existing'); await act('sub', 'device'); await primary();
  await until(page, () => !!document.querySelector('.o55-card[data-arg="nas-home"]'), 8000); await act('device', 'nas-home'); await primary();
  await primary();
  await until(page, () => (window.O55.S.sess.ops['keys:nas-home'] || {}).state === 'done', 8000); await primary();
  await type('user', 'jared'); await type('pw', 'correct horse'); await primary();
  await until(page, () => (window.O55.S.sess.ops['sshinstall:nas-home:new'] || {}).state === 'done', 12000); await primary();
  return page.evaluate(() => window.O55.S.sess.screen);
}

export async function pickSuggestion(page,how,n) {
  if(how!=='click' && how!=='key') throw new Error('unsupported suggestion activation: '+how);
  const sel=`#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-suggestchip:nth-child(${n})`;
  const want=await page.evaluate((s) => {const b=document.querySelector(s);return b?b.textContent.trim():null;},sel);
  if(!want) return {how,ok:false,why:'no suggestion '+n};
  if(how==='click') {
    if(!(await clickAt(page,sel))) throw new Error('suggestion click unavailable: '+sel);
  } else {
    await page.evaluate((s) => document.querySelector(s).focus(),sel);
    await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
    await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  }
  await sleep(250);await settle(page);await sleep(400);
  const result=await page.evaluate((w) => {const l=document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out)');const f=l.querySelector('[data-o55-bind="name"]');const on=[...l.querySelectorAll('.o55-suggestchip.o55-on')].map((b) => b.textContent.trim());
    const cell=[...l.querySelectorAll('.o55-suggestchip')].find((b) => b.textContent.trim()===w);const cs=cell&&getComputedStyle(cell);
    return {want:w,field:f?f.value:null,on,chosenFill:cs?cs.backgroundColor:null,ok:!!f&&f.value===w&&on.length===1&&on[0]===w};},want);
  return {how,...result};
}

async function windowView(page, v, sweep) {
  const pathCaps = v.path === 'nas' ? {} : null;
  if (v.path === 'nas') { const at = await nasPath(page, pathCaps); if (at !== v.screen) return { error: 'the NAS path ended on ' + at }; }
  else await page.evaluate((s) => { window.O55.ui.close('test'); window.O55.ui.open({ screen: s }); }, v.screen);
  if (!(await settle(page, v.screen))) return { error: 'screen ' + v.screen + ' did not settle' };
  await mouseAway(page);
  if (v.until) await until(page, v.until, 15000);
  await sleep(sweep ? 600 : 900);
  const flow = {};
  if (v.flow === 'newfolder') {
    if (await clickAt(page, '#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="adding"]')) {
      await settle(page);
      await page.evaluate(() => { const i = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="newName"]'); if (i) i.focus(); });
      await page.send('Input.insertText', { text: 'book-club-site' }); await sleep(300);
      if (!(await clickAt(page, '#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="addFolder"]'))) throw new Error('addFolder not reachable'); await settle(page); await sleep(500);
      /* adding a folder opens it (an empty folder); its New tag shows in the parent's list */
      if (!(await clickAt(page, '#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="cd"][data-arg="/volume1"]'))) throw new Error('parent folder not reachable'); await settle(page); await sleep(500);
      flow.newFolder = await page.evaluate(() => !!document.querySelector('#pm-o55-onboarding .o55-treeitem.o55-new .o55-tag'));
    } else flow.newFolder = 'no add control';
    await mouseAway(page);
  }
  if (v.flow === 'lookmenu') {
    flow.menu = await clickAt(page, '#pm-o55-onboarding .o55-lookbtn'); await sleep(500); await mouseAway(page);
  }
  const data = await page.evaluate(collect, R_WIN);
  await measure(page, data);
  if (v.flow === 'suggest') {
    /* a real click on the second suggestion, then Enter on the first with the keyboard */
    flow.click = await pickSuggestion(page,'click',2); await mouseAway(page); flow.key = await pickSuggestion(page,'key',1); await mouseAway(page);
    flow.after = await page.evaluate(collect, R_WIN); await measure(page, flow.after);
  }
  if (v.flow === 'lookmenu' && !(await clickAt(page, '#pm-o55-onboarding .o55-lookbtn.o55-on'))) throw new Error('look menu close not reachable');
  return { data, flow, pathCaps };
}

async function tourWalk(page) {
  const out = []; const ev = (fn, ...a) => page.evaluate(fn, ...a);
  const until = async (fn, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(fn)) return true; await sleep(120); } return false; };
  await ev(() => window.PM7_GUIDED_TOUR.start({ project: 'tastebook' }));
  const WANT = new Set(['comfort_intro', 'open_chat', 'same_answer_eli5', 'book_club_goal', 'three_outcomes']);
  for (let guard = 0; guard < 40; guard++) {
    const inputStart=(page.inputReceipts||[]).length;
    const id = await ev(() => window.O55.tour.state().step);
    const def = await ev((i) => { const d = window.O55.tour.byId[i]; return { kind: d.kind, after: !!d.after, stay: !!d.stay }; }, id);
    await sleep(1400); await mouseAway(page);
    if (WANT.has(id)) { const data = await ev(collect, R_TOUR); await measure(page, data); out.push({ step: id, data }); }
    if (id === 'three_outcomes') break;
    if (def.kind === 'info') { if(!(await until(() => !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]'), 12000))) throw new Error('tour Next unavailable');
      if(!(await clickAt(page, '#pm-o55-tour .o55t-callout [data-o55t="next"]'))) throw new Error('tour Next trusted click unverified'); }
    else {
      if (id === 'same_answer_eli5') await until(() => window.O55.tour.chat.answered('a1'));
      if (id === 'split_by_drag') {
        const a = await ev(() => { const d = window.PMW.tour.splitDrag(); const r = d.el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, tx: d.to.x, ty: d.to.y }; });
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: a.x, y: a.y });
        await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: a.x, y: a.y, button: 'left', clickCount: 1 });
        /* the drag of tools/tour_shots.mjs: eased over 36 moves, a small wiggle at the edge, held until the split zone shows */
        const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
        for (let i = 1; i <= 36; i++) { const k = ease(i / 36); await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: a.x + (a.tx - a.x) * k, y: a.y + (a.ty - a.y) * k, button: 'left', buttons: 1 }); await sleep(18); }
        for (let j = 0; j < 5; j++) { await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: a.tx + (j % 2), y: a.ty + j * 0.5, button: 'left', buttons: 1 }); await sleep(45); }
        await sleep(500);
        await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: a.tx, y: a.ty, button: 'left', clickCount: 1 });
      } else if(!(await clickAt(page, '#pm-o55-tour .o55t-callout [data-o55t="showMe"]'))) throw new Error('Show Me trusted click unverified; no page-switch fallback');
      if (!(await until(new Function(`return window.O55.tour.state().done.includes(${JSON.stringify(id)})`), 20000))) { out.push({ step: id, error: 'step not done' }); break; }
      if (id === 'book_club_goal') { await sleep(900); await mouseAway(page); const data = await ev(collect, R_TOUR); await measure(page, data); out.push({ step: 'book_club_goal:practice', data, input_receipts:(page.inputReceipts||[]).slice(inputStart) }); }
      if (def.stay) { await sleep(900); if(!(await clickAt(page, '#pm-o55-tour .o55t-callout [data-o55t="next"]'))) throw new Error('tour stay Next trusted click unverified'); }
    }
    if (!(await until(new Function(`return window.O55.tour.state().step !== ${JSON.stringify(id)}`), 12000))) { out.push({ step: id, error: 'tour did not move on' }); break; }
  }
  return out;
}




/* Reserved Phase B path: normal helper owns the session; explicit IDs bound to every stop receipt. */
export function ownedStopVerified(session,stopReceipt,census) {
  return !!(session && typeof session.id==='string' && stopReceipt && stopReceipt.id===session.id && stopReceipt.command_succeeded===true &&
    Array.isArray(census) && census.every((s) => s && typeof s.id==='string') && !census.some((s) => s.id===session.id));
}
export function countCdpBrowsers(processLines) {
  if(typeof processLines!=='string') throw new Error('global browser process census unavailable');
  return processLines.split('\n').filter((line) => {
    const m=/^\s*\d+\s+(\S+)\s+(.*)$/.exec(line);if(!m || /(?:^|\s)--type=/.test(m[2])) return false;
    const executable=m[1].split('/').pop();
    return /^(chrome|google-chrome(?:-stable)?|chromium(?:-browser)?|msedge|microsoft-edge(?:-stable)?)$/.test(executable) && /(?:^|\s)--remote-debugging-(port|pipe)(?:[=\s]|$)/.test(m[2]);
  }).length;
}
const ownClosers=new Set();
async function launchOwned(viewport) {
  const {createRequire}=await import('node:module');
  const require=createRequire(join(process.env.PM_PLAYWRIGHT_DIR||'/home/sittingmongoose/pmt-dev/pw/','noop.js'));
  const {chromium}=require('playwright-core');
  const actual=countCdpBrowsers(execFileSync('ps',['-eo','pid=,args='],{encoding:'utf8',timeout:15000}));
  const sessions=JSON.parse(execFileSync('agent-browser',['list'],{encoding:'utf8',timeout:15000}));
  if(!Array.isArray(sessions) || actual<sessions.length || actual>=4 || ownClosers.size>=2) throw new Error('HOLD: actual global/owned browser admission unavailable or full; no peer stopped');
  const session=JSON.parse(execFileSync('agent-browser',['start','--url','about:blank'],{encoding:'utf8',timeout:30000}));
  let browser,closed=false; const receipt={id:session.id,command_succeeded:false};
  const close=async () => {
    if(closed) return receipt;
    const errors=[];
    try {receipt.raw_stop=execFileSync('agent-browser',['stop',session.id],{encoding:'utf8',timeout:30000});receipt.command_succeeded=true;}
    catch(e) {errors.push(String(e.stack||e));}
    try {if(browser) await browser.close();} catch(e) {errors.push(String(e.stack||e));}
    try {receipt.census=JSON.parse(execFileSync('agent-browser',['list'],{encoding:'utf8',timeout:15000}));} catch(e) {errors.push(String(e.stack||e));}
    receipt.closed=ownedStopVerified(session,receipt,receipt.census);
    receipt.errors=errors;receipt.observed_at=new Date().toISOString();
    if(receipt.closed) {closed=true;ownClosers.delete(close);}
    return receipt;
  };
  ownClosers.add(close);
  try {
    if(typeof session.id!=='string' || typeof session.cdp_endpoint!=='string') throw new Error('unsupported normal helper start response');
    browser=await chromium.connectOverCDP(session.cdp_endpoint,{timeout:30000});
    const context=browser.contexts()[0];if(!context) throw new Error('normal helper context unavailable');
    const real=await context.newPage(),cdp=await context.newCDPSession(real),bs=await browser.newBrowserCDPSession();
    await cdp.send('Page.enable');await cdp.send('Runtime.enable');await cdp.send('DOM.enable');
    const errors=[];
    const once=(method,pred=() => true,timeout=30000) => new Promise((res,rej) => {
      const listener=(p) => {if(pred(p)){clearTimeout(t);cdp.off(method,listener);res(p);}};
      const t=setTimeout(() => {cdp.off(method,listener);rej(new Error('timeout waiting '+method));},timeout);cdp.on(method,listener);
    });
    const page={send:(m,p) => cdp.send(m,p),on:(m,f) => cdp.on(m,f),once,errors,
      evaluate:async (fn,...args) => {
        const expression=typeof fn==='function'?'('+fn.toString()+')('+args.map((a) => JSON.stringify(a)).join(',')+')':fn;
        const r=await cdp.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
        if(r.exceptionDetails) throw new Error('evaluate: '+JSON.stringify(r.exceptionDetails));
        if(!r.result) throw new Error('evaluate response missing result');
        return r.result.value;
      },
      setViewport:async (w,h) => cdp.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false}),
      mouse:async (x,y) => {
        await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
        await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
        await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
      },
    };
    await page.setViewport(viewport.width,viewport.height);
    return {page,send:(m,p) => bs.send(m,p),session,admission:{actual_cdp_browsers_before:actual,helper_sessions_before:sessions.length,observed_at:new Date().toISOString()},profile:session.profile||session.profile_dir||null,close};
  } catch(e) {
    const cleanup=await close();throw new Error(String(e.stack||e)+'; exact owned cleanup '+JSON.stringify(cleanup));
  }
}



export function bindOrdinaryRuntime(observation,expected) {
  const unverified=[],miss=(code,detail) => unverified.push({code,detail});
  const o=observation||{},nav=o.navigation,frame=o.frameTree&&o.frameTree.frameTree&&o.frameTree.frameTree.frame,dom=o.document;
  if(!expected || !['base','cand'].includes(expected.which) || !/^file:\/\//.test(expected.url||'') ||
    !/^[a-f0-9]{40}$/.test(expected.source_head||'') || !/^[a-f0-9]{64}$/.test(expected.page_sha256||'') ||
    !/^[a-f0-9]{64}$/.test(expected.binding_sha256||'') || typeof expected.reduced!=='boolean') miss('frozen-runtime-binding-unavailable',expected);
  if(!nav || nav.url!==expected?.url || nav.loaded!==true || !nav.response || nav.response.errorText || nav.response.isDownload ||
    !nav.response.frameId || !nav.response.loaderId) miss('navigation-receipt-unverified',nav);
  if(!frame || frame.parentId || frame.unreachableUrl || frame.url!==expected?.url ||
    frame.id!==nav?.response?.frameId || frame.loaderId!==nav?.response?.loaderId) miss('navigated-main-frame-unverified',frame);
  if(!dom || dom.url!==expected?.url || dom.location!==expected?.url || dom.documentURI!==expected?.url ||
    dom.readyState!=='complete' || dom.fixture_ready!==true) miss('navigated-document-readiness-unverified',dom);
  if(!o.state || o.state.confirmed!==true || o.state.reduced!==expected?.reduced || !dom ||
    ['theme','nier','parts','reduced'].some((k) => dom[k]!==o.state[k])) miss('runtime-look-motion-unverified',{state:o.state,document:dom});
  if(o.page_sha256!==expected?.page_sha256) miss('navigated-frozen-file-hash-unverified',{base:expected?.page_sha256,observed:o.page_sha256});
  if(!o.browserVersion || ['protocolVersion','product','revision','userAgent','jsVersion'].some((k) => typeof o.browserVersion[k]!=='string' || !o.browserVersion[k])) miss('ordinary-browser-version-unavailable',o.browserVersion);
  if(!o.session || typeof o.session.id!=='string' || !o.session.id || typeof o.profile!=='string' || !o.profile ||
    o.profile!==(o.session.profile||o.session.profile_dir)) miss('owned-runtime-profile-unavailable',{session:o.session,profile:o.profile});
  for(const e of o.errors||[]) miss('ordinary-runtime-observation-error',e);
  return {...o,schema:'onboarding-ordinary-runtime/v1',expected,contextConfirmed:unverified.length===0,
    context_status:unverified.length?'UNVERIFIED':'CONFIRMED',context_unverified:unverified,
    renderer:null,rendererConfirmed:false,renderer_status:'UNVERIFIED',
    renderer_evidence:{status:'UNVERIFIED',code:'ordinary-page-renderer-evidence-unavailable',
      detail:'Browser.getVersion, Page.getFrameTree, ordinary document readiness and owned profile metadata do not identify the active renderer. No GPU/WebGL probe or renderer inference is authorized.'}};
}

export async function captureOrdinaryRuntime(owned,expected,state) {
  const page=owned.page,o={observed_at:new Date().toISOString(),state,navigation:page.navigation||null,
    session:owned.session,profile:owned.profile,errors:[],fixture_apis:FIXTURE_APIS,
    normal_launcher:'agent-browser start --url about:blank; Playwright CDP connection only; no custom renderer/animation flags; startup is not document evidence'};
  const observations=await Promise.allSettled([
    Promise.resolve().then(() => owned.send('Browser.getVersion')),Promise.resolve().then(() => page.send('Page.getFrameTree')),
    Promise.resolve().then(() => page.evaluate(() => ({url:document.URL,location:location.href,documentURI:document.documentURI,readyState:document.readyState,
      fixture_ready:!!(window.O55&&window.O55.ui&&window.O55.ui.open&&window.PM12_KIMI&&window.PM_THEME),
      theme:document.documentElement.dataset.theme,nier:document.documentElement.getAttribute('data-o55-nier'),
      parts:document.documentElement.getAttribute('data-o55-nier-parts')||'',reduced:matchMedia('(prefers-reduced-motion: reduce)').matches}))),
  ]);
  for(let i=0;i<observations.length;i++) {
    const field=['browserVersion','frameTree','document'][i],result=observations[i];
    if(result.status==='fulfilled') o[field]=result.value;
    else {o[field]=null;o.errors.push({method:field,error:String(result.reason?.stack||result.reason)});}
  }
  try {o.page_sha256=sha(readFileSync(expected.page));} catch(e) {o.errors.push({method:'frozen-file-hash',error:String(e.stack||e)});}
  return bindOrdinaryRuntime(o,expected);
}

async function runLook(look,motion) {
  const res={look:look.id,motion,pages:{}};
  for(const which of ['base','cand']) {
    const pr={views:{},tour:[],state:null,errors:[],runtime:null,runtime_observations:[],resource_closed:false}, owned={}, events=[];
    try {
      const admitted=phaseBinding.global_admission;
      const census=JSON.parse(execFileSync('agent-browser',['list'],{encoding:'utf8',timeout:15000}));
      if(!Array.isArray(census)) throw new Error('unsupported global agent-browser census response');
      if(census.length + admitted.unmanaged_cdp_browsers >= admitted.max_total) throw new Error('global browser cap reached; no peer is stopped');
      pr.admission={helper_census:census,declared_unmanaged:admitted.unmanaged_cdp_browsers,observed_at:new Date().toISOString()};
      Object.assign(owned,await launch(VIEWPORT)); const page=owned.page;pr.admission.exact_start=owned.admission;

      page.on('Runtime.exceptionThrown',(e) => events.push({type:'exception',event:e}));
      page.on('Runtime.consoleAPICalled',(e) => {if(e.type==='error') events.push({type:'console.error',event:e});});
      page.on('Network.responseReceived',(e) => {if(e.response && e.response.status>=400) events.push({type:'http-error',event:e});});
      page.on('Network.loadingFailed',(e) => events.push({type:'request-failed',event:e}));
      await page.send('Network.enable');
      /* The original helper ignores Page.navigate.errorText; this wrapper checks the actual response. */
      page.goto=async (url) => {
        const loaded=page.once('Page.loadEventFired',() => true,90000);
        const response=await page.send('Page.navigate',{url});
        page.navigation={url,response,observed_at:new Date().toISOString(),loaded:false};
        if(response.errorText) { loaded.catch(() => {}); throw new Error('Page.navigate: '+response.errorText); }
        await loaded;
        page.navigation.loaded=true;
      };
      await page.setViewport(VIEWPORT.width,VIEWPORT.height);
      const expected={which,page:PAGES[which],url:pathToFileURL(PAGES[which]).href+'?o55=off&o55scenario=fresh',
        source_head:which==='base'?phaseBinding.base_head:phaseBinding.candidate_head,
        page_sha256:which==='base'?phaseBinding.base_sha256:phaseBinding.candidate_sha256,
        binding_sha256:phaseBinding.binding_sha256,reduced:motion==='reduced'};
      pr.state=await bootPage(page,which,look,motion);
      pr.runtime=await captureOrdinaryRuntime(owned,expected,pr.state);
      pr.runtime_observations.push({purpose:'window',...pr.runtime});
      if(!pr.state.confirmed) throw new Error('look/motion not confirmed: '+JSON.stringify(pr.state));
      if(doWindow) for(const v of VIEWS) {
        try {pr.views[v.id]=await windowView(page,v,false);} catch(e) {pr.views[v.id]={error:String(e.stack||e)};}
      }
      if(doWindow && flag('sweep') && which==='cand') {
        pr.sweep={};
        for(const s of ALL_SCREENS.filter((x) => !NEEDS_DEVICE.includes(x))) {
          try {pr.sweep[s]=await windowView(page,{id:s,screen:s},true);} catch(e) {pr.sweep[s]={error:String(e.stack||e)};}
        }
      }
      if(doTour) {
        const st=await bootPage(page,which,look,motion);
        pr.runtime_observations.push({purpose:'tour',...await captureOrdinaryRuntime(owned,expected,st)});
        if(!st.confirmed) throw new Error('tour look/motion not confirmed: '+JSON.stringify(st));
        try {pr.tour=await tourWalk(page);} catch(e) {pr.tour.push({error:String(e.stack||e)});}
      }

      /* Keep the helper's errors as well, without slicing/filtering. */
      pr.errors.push(...(page.errors||[]));
    } catch(e) {pr.errors.push({type:'driver',error:String(e.stack||e)});}
    finally {
      pr.errors.push(...events);
      pr.input_receipts=owned.page ? owned.page.inputReceipts||[] : [];
      if(owned.page) for(const e of owned.page.errors||[]) if(!pr.errors.includes(e)) pr.errors.push(e);
      if(owned.close) {
        try {pr.stop_receipt=await owned.close();pr.resource_closed=pr.stop_receipt.closed===true;
          for(const e of pr.stop_receipt.errors||[]) pr.errors.push({type:'owned-close-error',error:e});}
        catch(e) {pr.errors.push({type:'close',error:String(e.stack||e)});}
      }
    }
    res.pages[which]=pr;
  }
  return res;
}

export function parseArgs(args) {
  const valued=new Set(['--base','--out','--looks','--motion','--viewport','--parallel','--phase-b-binding','--replay']);
  const flags=new Set(['--self-test','--sweep','--no-tour']);
  const out={replay:[],flags:[],values:{},candidate:null};
  for(let i=0;i<args.length;i++) {
    const a=args[i];
    if(valued.has(a)) {
      const v=args[++i]; if(!v || v.startsWith('--')) throw new Error('missing value for '+a);
      if(a==='--replay') out.replay.push(v);
      else {if(Object.hasOwn(out.values,a)) throw new Error('duplicate option '+a);out.values[a]=v;}
    } else if(flags.has(a)) {if(out.flags.includes(a)) throw new Error('duplicate flag '+a);out.flags.push(a);}
    else if(a.startsWith('--')) throw new Error('unknown option '+a);
    else {if(out.candidate) throw new Error('extra positional argument '+a);out.candidate=a;}
  }
  const parseList=(key,defaults,allowed) => {
    const list=(out.values[key]??defaults.join(',')).split(',');
    if(!list.length || list.some((x) => !allowed.includes(x)) || new Set(list).size!==list.length) throw new Error('empty, duplicate or unsupported '+key);
    return list;
  };
  out.looks=parseList('--looks',LOOKS.map((l) => l.id),LOOKS.map((l) => l.id));
  out.motions=parseList('--motion',['normal','reduced'],['normal','reduced']);
  const vp=/^(\d{3,4})x(\d{3,4})$/.exec(out.values['--viewport']||'1440x900');
  if(!vp || +vp[1]<100 || +vp[2]<100) throw new Error('unsupported viewport');
  out.viewport={width:+vp[1],height:+vp[2]};
  out.parallel=Number(out.values['--parallel']||'1'); if(![1,2].includes(out.parallel)) throw new Error('--parallel must be 1 or 2');
  out.mode=out.flags.includes('--self-test')?'self-test':out.replay.length?'replay':'live';
  if(out.mode!=='live' && (out.candidate || out.values['--base'] || out.values['--phase-b-binding'])) throw new Error('isolated mode cannot also request product execution');
  if(out.mode==='self-test' && out.replay.length) throw new Error('choose self-test or replay');
  if(out.mode==='live' && (!out.candidate || !out.values['--base'] || !out.values['--phase-b-binding'] || !out.values['--out'])) throw new Error('HOLD: later explicit root Phase B GO and exact --phase-b-binding, pages and output required; no browser started');
  return out;
}
function verifyFrozen() {
  const receipts={};
  for(const [name,h] of Object.entries(FROZEN)) {const bytes=readFileSync(join(HERE,name));if(sha(bytes)!==h) throw new Error('frozen original changed: '+name);receipts[name]={sha256:h,bytes:bytes.length};}
  const go=readFileSync(AUTHORITY.gate_go.path);if(sha(go)!==AUTHORITY.gate_go.sha256) throw new Error('immutable Phase A GO changed');
  const amendment=readFileSync(AUTHORITY.contrast.path);if(sha(amendment)!==AUTHORITY.contrast.sha256 || !amendment.toString().includes(AUTHORITY.contrast.required_text)) throw new Error('contrast authority conflicts/missing: scope disposition required');
  return {tools:receipts,gate_go:AUTHORITY.gate_go,amendment_sha256:sha(amendment),successor_sha256:sha(readFileSync(fileURLToPath(import.meta.url)))};
}
function bindLive(config) {
  const path=resolve(config.values['--phase-b-binding']),bytes=readFileSync(path),b=JSON.parse(bytes);
  if(b.phase!=='B' || typeof b.root_message_id!=='string' || !b.root_message_id.trim() || !/^[a-f0-9]{40}$/.test(b.candidate_head||'') || b.candidate_head===FROZEN_HEAD || b.base_head!==BASE_HEAD) throw new Error('HOLD: absent/invalid later root/source binding; frozen 29 is not a Phase B candidate');
  if(JSON.stringify(b.fixture_apis)!==JSON.stringify(FIXTURE_APIS)) throw new Error('fixture/UI API bindings incomplete');
  const a=b.global_admission,age=a&&Date.now()-Date.parse(a.checked_at);
  if(!a || !Number.isFinite(age) || age<0 || age>60000 || !Number.isInteger(a.all_cdp_browsers) || !Number.isInteger(a.unmanaged_cdp_browsers) ||
    a.all_cdp_browsers<0 || a.unmanaged_cdp_browsers<0 || a.unmanaged_cdp_browsers>a.all_cdp_browsers || a.max_total!==4 || a.owned_session_limit!==2 ||
    !a.source_owner_coordinated || a.all_cdp_browsers+config.parallel>4) throw new Error('HOLD: fresh actual global admission/source-owner coordination required');
  const root=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:HERE,encoding:'utf8'}).trim();
  execFileSync('git',['merge-base','--is-ancestor',FROZEN_HEAD,b.candidate_head],{cwd:root});
  const owned=new Set(['10-window.css','11-window-nier.css','12-components.css','13-nier-look.css','40-tour.css','41-tour-nier.css'].map((f) => 'Concepts/onboarding/opus-5.5/src/css/'+f));
  for(const p of ['Concepts/PMConcept7.html','Concepts/Onboarding concepts/TestOpus5.5PmConcept.html','Concepts/HomeTestPMConcept7.html','Concepts/LeftRailPMConcept7.html']) owned.add(p);
  const changed=execFileSync('git',['diff','--name-only','--no-renames',FROZEN_HEAD,b.candidate_head],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
  if(changed.some((p) => !owned.has(p) && !p.startsWith('reports/pm7-no-pills-onboarding-contrast-20261013/'))) throw new Error('candidate has changes outside separately bound source ownership: '+changed.join(', '));
  const cp=b.candidate_page||'Concepts/PMConcept7.html';if(!owned.has(cp) || !cp.endsWith('.html')) throw new Error('candidate parent page not bound');
  const blob=execFileSync('git',['show',b.candidate_head+':'+cp],{cwd:root,maxBuffer:64*1024*1024});
  const base=execFileSync('git',['show',BASE_HEAD+':Concepts/Onboarding concepts/TestOpus5.5PmConcept.html'],{cwd:root,maxBuffer:64*1024*1024});
  const candBytes=readFileSync(PAGES.cand),baseBytes=readFileSync(PAGES.base);
  if(sha(candBytes)!==b.candidate_sha256 || sha(blob)!==b.candidate_sha256 || sha(baseBytes)!==b.base_sha256 || sha(base)!==b.base_sha256) throw new Error('exact base/candidate page binding mismatch');
  const all=config.looks.length===12;
  const wide=all && config.viewport.width===1440 && config.viewport.height===900 && config.motions.length===2 && config.flags.includes('--sweep') && !config.flags.includes('--no-tour');
  const narrow=all && config.viewport.width===390 && config.viewport.height===844 && config.motions.join(',')==='normal' && config.flags.includes('--no-tour') && !config.flags.includes('--sweep');
  if(!wide && !narrow) throw new Error('unsupported Phase B matrix/route; no silent responsive tour skip');
  return {...b,binding_path:path,binding_sha256:sha(bytes),source_delta:changed};
}

async function replayFiles(r,files) {
  r.phase='A-retained-data-replay';
  for(const f of files) {
    const path=resolve(f),bytes=readFileSync(path),old=JSON.parse(bytes);
    r.originalReceipts.push({path,sha256:sha(bytes),bytes:bytes.length,original_summary:old.summary,
      original_failures:old.failures||[],original_unverified:old.unverified||[],original_notes:old.notes||[],original_pages:old.pages,
      acceptance:'retained historical observations only; no product rerun or corrected-source acceptance'});
    for(const e of old.failures||[]) hold(r,path,'retained-original-finding',e);
    for(const e of old.unverified||[]) unknown(r,path,'retained-original-unverified',e);
    if(!old.pages || !old.pages.cand || old.pages.cand.sha256!=='11348f491ed03929ee92b18312bf50993294d9be275006f54b6c22b4229036b8' || !old.pages.base || old.pages.base.sha256!=='b612df00caa2e2fb13b9b2307a17f283358845b596f33a27a31ba55d40266451') unknown(r,path,'retained-page-lineage-unbound',old.pages);
    for(const run of old.runs||[]) {r.runs.push({...run,retained_report:{path,sha256:sha(bytes)}});judgeRun(r,run);}
  }
  finalCoverage(r);
  r.notes.push({code:'legacy-omissions-held',detail:'old mark omissions, tag/SVG/keycap eligibility differences, duplicate mark maps, word-background geometry, motion/runtime/response checks and missing tour/device contexts cannot be reconstructed or accepted from old reports'});
}



export function selfTest() {
  const cases=[];
  const test=(name,fn) => {try {fn();cases.push({name,pass:true});} catch(e) {cases.push({name,pass:false,error:String(e.stack||e)});}};
  const source=readFileSync(join(HERE,'pill_check.mjs'),'utf8');
  const original=source.slice(source.indexOf('function scanScopes(R) {'),source.indexOf('/* ---------- driver ---------- */')).trim();
  const take=(s,start,end) => s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start)));
  test('frozen shape/radius/alpha and scanEl eligibility bodies are byte-identical',() => {
    const now=scanOnboarding.toString();
    for(const [a,b] of [['  function alpha(c) {','  function norm(c) {'],['  function pair(v) {','  function stableClasses(el) {'],
      ['  function shapeOf(cs) {','  function tokenize(s) {'],['  function scanEl(el) {','  for (const root of rootsFor()) {']]) assert.equal(take(now,a,b),take(original,a,b));
    assert.ok(now.includes("new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE', 'NOSCRIPT'])"));
    assert.ok(now.includes("const KBD_SEL = '.kbd,.pm51-kbd,kbd';"));
    assert.ok(!take(now,'  function scanEl(el) {','  for (const root of rootsFor()) {').includes('R.marks'));
  });
  test('differential frozen scanner across geometry/alpha/visibility/tag/SVG/keycap boundaries',() => {
    const prior=new Map(['document','window','NodeFilter','getComputedStyle'].map((k) => [k,{had:Object.hasOwn(globalThis,k),value:globalThis[k]}]));
    try {
      const base={backgroundColor:'rgba(0, 0, 0, 1)',backgroundImage:'none',boxShadow:'none',display:'block',visibility:'visible',opacity:'1',
        borderTopWidth:'0px',borderRightWidth:'0px',borderBottomWidth:'0px',borderLeftWidth:'0px',borderTopColor:'transparent',borderRightColor:'transparent',borderBottomColor:'transparent',borderLeftColor:'transparent',
        borderTopLeftRadius:'10px',borderTopRightRadius:'10px',borderBottomRightRadius:'10px',borderBottomLeftRadius:'10px',content:'none',width:'30px',height:'10px'};
      class E {
        constructor(tag='DIV',classes=[],style={},w=30,h=10) {this.tagName=tag;this.nodeType=1;this.classList=new Set(classes);this.style={...base,...style};this.children=[];this.parentElement=null;this.isConnected=true;this.textContent=tag;this.w=w;this.h=h;this.role=null;this.id='';}
        add(e) {this.children.push(e);e.parentElement=this;return e;}
        matches(s) {return s.split(',').some((x) => {x=x.trim();return x.startsWith('#')?this.id===x.slice(1):x.startsWith('.')?this.classList.has(x.slice(1)):this.tagName.toLowerCase()===x.toLowerCase();});}
        closest(s) {for(let e=this;e;e=e.parentElement) if(e.matches(s)) return e;return null;}
        contains(e) {for(let p=e;p;p=p.parentElement) if(p===this) return true;return false;}
        getAttribute(s) {return s==='role'?this.role:null;}
        getBoundingClientRect() {return {x:0,y:0,width:this.w,height:this.h};}
      }
      const root=new E('DIV',[],{backgroundColor:'transparent'});root.id='panel-settings';
      for(const [w,h] of [[30,10],[10,10],[12.49,10],[12.5,10],[30,3],[30,3.01],[10,30],[0,10],[10,0]]) root.add(new E('DIV',[],{},w,h));
      for(const a of [0,.02,.020001,1]) root.add(new E('DIV',[],{backgroundColor:'rgba(0, 0, 0, '+a+')'}));
      for(const op of ['0','0.049','0.05','1','invalid']) root.add(new E('DIV',[],{opacity:op}));
      for(const v of ['hidden','collapse','visible']) root.add(new E('DIV',[],{visibility:v}));
      root.add(new E('DIV',[],{display:'none'}));
      for(const rad of ['4.49px','4.5px','5px','8px 4.49px','8px 4.5px']) root.add(new E('DIV',[],{borderTopLeftRadius:rad,borderTopRightRadius:rad,borderBottomLeftRadius:rad,borderBottomRightRadius:rad}));
      for(const tag of ['SCRIPT','STYLE','LINK','META','TEMPLATE','NOSCRIPT']) root.add(new E(tag));
      root.add(new E('SVG')).add(new E('PATH'));
      for(const [tag,cls] of [['DIV','kbd'],['DIV','pm51-kbd'],['KBD','']]) root.add(new E(tag,cls?[cls]:[])).add(new E('SPAN'));
      const host=root.add(new E('SPAN',['status'],{backgroundColor:'transparent'}));const mark=host.add(new E('SPAN',['o55-spin'],{},14,10));
      root.add(new E('BUTTON',['action-parent'],{backgroundColor:'transparent'})).add(new E('I',['open-art']));
      const pseudo=root.add(new E('DIV',[],{backgroundColor:'transparent'}));pseudo.pseudo={...base,content:'""',width:'30px',height:'10px'};
      root.add(new E('DIV',[],{backgroundColor:'transparent',borderLeftWidth:'2px',borderLeftColor:'rgb(0,0,0)'}));
      const flatten=(r) => r.children.flatMap((c) => [c,...flatten(c)]);
      globalThis.document={body:{},querySelectorAll:(s) => s==='#panel-settings'?[root]:[],getElementById:(s) => s==='panel-settings'?root:null,
        createTreeWalker:(r) => {const a=flatten(r);let i=0;return {currentNode:null,nextNode(){this.currentNode=a[i++]||null;return this.currentNode;}};}};
      globalThis.NodeFilter={SHOW_ELEMENT:1};globalThis.window={innerWidth:1440};
      globalThis.getComputedStyle=(e,p) => p?(e.pseudo||{...base,content:'none'}):e.style;
      const before=(0,eval)('('+original+')')({scopes:['settings']});
      const after=scanOnboarding({scope:'window',roots:['#panel-settings'],labels:[{sel:'.status'}],kept:['.action-parent'],open:[{sel:'.open-art',why:'declared non-label art remains open inside an action'}],marks:'.o55-spin'});
      assert.equal(before.scanned,after.scanned);
      assert.deepEqual(after.findings.map((f) => Object.fromEntries(Object.keys(before.findings[0]).map((k) => [k,k==='scope'?'settings':f[k]]))),before.findings);
      assert.ok(after.findings.some((f) => f.cls==='mark' && f.sig==='span.o55-spin'));
      assert.ok(after.findings.some((f) => f.cls==='open' && f.sig==='i.open-art' && f.by==='.open-art'));
      assert.ok(after.findings.some((f) => f.pseudo==='before'));
      assert.equal(mark.style.opacity,'1');
      assert.equal(after.findings.filter((f) => /svg|path|kbd|script|style|link|meta|template|noscript/i.test(f.sig)).length,0);
    } finally {for(const [k,p] of prior) {if(p.had) globalThis[k]=p.value;else delete globalThis[k];}}
  });
  const pixels=[...Array(80)].map(() => [255,255,255,255]).concat([...Array(15)].map(() => [0,0,0,255]),[...Array(5)].map(() => [128,128,128,255]));
  const witness=Array.from({length:20},() => [255,255,255,255]);
  test('uniform actual word black/white reads 21 with visible ink',() => {const s=sampleWordPixels(pixels,'rgb(0,0,0)',witness);assert.equal(s.ratio,21);assert.equal(s.visibleInk,true);});
  test('color-mix serialized srgb ink parses without the old black fallback',() => {
    const p=Array.from({length:80},() => [255,255,255,255]).concat(Array.from({length:20},() => [220,116,84,255]));
    const s=sampleWordPixels(p,'color(srgb 0.863059 0.45349 0.33098)',witness);assert.ok(s.ratio>2 && s.ratio<4.5);
  });
  test('foreground alpha composites against actual background',() => {
    const p=Array.from({length:80},() => [255,255,255,255]).concat(Array.from({length:20},() => [128,128,128,255]));
    const s=sampleWordPixels(p,'rgba(0,0,0,0.5)',witness);assert.ok(s.ratio>3.9 && s.ratio<4.1);
  });
  test('unparsed, missing, alpha and absent-word pixels are UNVERIFIED',() => {
    assert.ok(sampleWordPixels(pixels,'lab(20 0 0)',witness).error);
    assert.ok(sampleWordPixels([], 'rgb(0,0,0)',witness).error);
    assert.ok(sampleWordPixels(pixels.map((p) => [p[0],p[1],p[2],0]),'rgb(0,0,0)',witness).error);
    assert.ok(sampleWordPixels(witness,'rgb(0,0,0)',witness).error);
    assert.ok(sampleWordPixels(pixels,'rgb(NaN,0,0)',witness).error);
    assert.ok(sampleWordPixels(pixels,'rgb(0,0,0)').error);
  });
  test('ambiguous/gradient/foreign paint cannot become a median-background pass',() => {
    assert.ok(sampleWordPixels(pixels.concat([[255,0,0,255]]),'rgb(0,0,0)',witness).error);
    assert.ok(sampleWordPixels(pixels,'rgb(0,0,0)',witness.concat([[250,250,250,255]])).error);
  });
  const C=(ratio,extra={}) => ({ratio,method:'actual-word-uniform/v1',words:[{samples:[{ratio,method:'actual-word-uniform/v1',visibleInk:true}]}],
    screenshot_sha256:'0'.repeat(64),geometry:{words:[{text:'word'}]},observed_at:'2026-10-13T00:00:00Z',...extra});
  test('improved and inherited 3:1 words both fail the absolute 4.5 floor',() => {
    for(const br of [2,3]) {const r=newReport();judgeContrast(r,'word',{contrast:C(br)},{sel:'.o55-tag',text:'word',contrast:C(3)});
      assert.equal(r.failures.length,1);assert.equal(r.failures[0].code,'absolute-word-contrast');assert.equal(r.contrastLow[0].improved,br===2);}
  });
  test('absolute threshold uses unrounded values and no 0.05 waiver',() => {
    const r=newReport();judgeContrast(r,'word',{contrast:C(4.49)},{contrast:C(4.4999)});assert.equal(r.failures.length,1);
    const s=newReport();judgeContrast(s,'word',{contrast:C(4.5)},{contrast:C(4.5)});assert.equal(s.failures.length,0);
  });
  test('base regression and absolute floor are separately retained',() => {
    const r=newReport();judgeContrast(r,'word',{contrast:C(5)},{contrast:C(3)});assert.equal(r.regressions.length,1);assert.equal(r.failures.length,1);
    const s=newReport();judgeContrast(s,'word',{contrast:C(7)},{contrast:C(5)});assert.equal(s.failures.length,0);assert.equal(s.regressions.length,0);
  });
  test('legacy box samples retain measured failures but never verify word sampling',() => {
    const r=newReport();judgeContrast(r,'word',{contrast:{ratio:2}},{contrast:{ratio:3}});assert.equal(r.failures.length,1);assert.ok(r.unverified.length>=2);
    const s=newReport();judgeContrast(s,'word',{contrast:{ratio:7}},{contrast:{ratio:7}});assert.equal(s.failures.length,0);assert.ok(s.unverified.length>=2);
  });
  test('contrast null/errors/NaN/Infinity and missing base all remain UNVERIFIED',() => {
    for(const c of [null,{error:'unsupported ink'},{ratio:NaN},{ratio:Infinity},{ratio:'5'}]) {const r=newReport();judgeContrast(r,'word',null,{contrast:c});assert.ok(r.unverified.length);}
  });
  const snapshot=() => ({schema:'onboarding-label-snapshot/v1',roots:[{path:'root'}],scanned:1,reduced:false,labels:[],kept:[],marks:[],rawFindings:[],capsules:[],markup:'<root',ctlr:'4px'});
  test('unchanged raw spinner is retained and held independently of mark comparison',() => {
    const r=newReport(),b=snapshot(),c=snapshot();const f={kind:'pill',sig:'span.o55-spin',cls:'mark',by:'.o55-pill',w:14,h:10,radius:5,shape:'border',text:''};
    b.rawFindings=[f];c.rawFindings=[f];judgePair(r,'spinner',b,c,'normal');assert.equal(r.rawFindings.length,2);assert.equal(r.failures.length,1);assert.equal(r.holds.length,1);assert.ok(r.comparisons.some((x) => x.kind==='raw-findings'&&x.inherited));
  });
  test('kept action raw findings remain classified while a role/action change regresses',() => {
    const r=newReport(),b=snapshot(),c=snapshot();
    b.rawFindings=[{kind:'pill',cls:'kept',sig:'button.o55-btn',by:'.o55-btn'}];c.rawFindings=b.rawFindings;
    b.kept=[{sel:'.o55-btn',sig:'button.o55-btn',text:'Install',act:'install',key:'install',tag:'button',attributes:[['role','button']],box:{bg:'white'},w:'20px',h:'10px',color:'black',font:'12px sans-serif'}];
    c.kept=[{...b.kept[0],attributes:[['role','radio']]}];judgePair(r,'action',b,c,'normal');assert.equal(r.failures.length,0);assert.equal(r.rawFindings.length,2);assert.ok(r.regressions.some((e) => e.code==='kept-attributes'));
  });
  test('Wizard labels and non-label rail art retain exact ownership HOLDs',() => {
    const r=newReport(),b=snapshot(),c=snapshot();c.rawFindings=[{kind:'pill',cls:'open',by:'.pm6-wiz-schip',sig:'span.pm6-wiz-schip',text:'Ready'},{kind:'pill',cls:'open',by:'.o55-railbar-friendly',sig:'div.o55-railbar-friendly'}];
    judgePair(r,'open',b,c,'normal');assert.equal(r.holds.length,2);assert.equal(r.failures.length,1);
  });
  test('duplicate host labels do not collapse mark differences into a Map entry',() => {
    const r=newReport(),b=snapshot(),c=snapshot();const m={hostSel:'.o55-pill',hostText:'Checking',n:0,html:'<span>',style:{color:'red'},parts:[]};
    b.marks=[m,m];c.marks=[{...m,style:{color:'blue'}},m];judgePair(r,'duplicates',b,c,'normal');assert.ok(r.regressions.some((x) => x.code==='mark-style'));
  });
  test('a mark following newly changed host ink still fails mark ink custody',() => {
    const r=newReport(),b=snapshot(),c=snapshot();b.marks=[{hostSel:'.o55-pill',hostText:'word',n:0,html:'<svg>',style:{color:'red',stroke:'red',fill:'none',opacity:'1'},parts:[]}];
    c.marks=[{...b.marks[0],style:{...b.marks[0].style,color:'blue',stroke:'blue'}}];judgePair(r,'ink',b,c,'normal');assert.ok(r.regressions.some((x) => x.code==='mark-style'));
  });
  test('empty/unavailable context, old acquisition and missing motion are HOLD',() => {
    const r=newReport(),b=snapshot(),c=snapshot();c.roots=[];c.scanned=0;c.reduced=undefined;delete c.rawFindings;judgePair(r,'empty',b,c,'normal');assert.ok(r.unverified.length>=3);
    const s=newReport();judgePair(s,'missing',null,null,'normal');assert.ok(s.unverified.length);
    assert.equal(verdict(newReport()).status,'HOLD');
  });
  test('Reduced Motion parses all transition duration components',() => {
    assert.equal(reducedTransitionOK('opacity, transform 0s, 0s'),true);
    assert.equal(reducedTransitionOK('opacity, transform 0s, 0.2s'),false);
    assert.equal(reducedTransitionOK('opacity 1ms'),false);
    assert.equal(reducedTransitionOK('opacity unparsed'),null);
  });
  test('missing tour steps, page errors, absent renderer and stop receipts propagate',() => {
    const r=newReport(),p={views:{},tour:[],errors:['EXC: retained'],state:{confirmed:true,reduced:false}};
    judgeRun(r,{look:'basic-light',motion:'normal',pages:{base:p,cand:p}});
    for(const code of ['page-or-driver-error','renderer-runtime-unverified','owned-browser-stop-unverified','expected-tour-context-not-reached','view-unavailable']) assert.ok(r.unverified.some((x) => x.code===code));
  });
  test('CLI never treats parallel value as a page; empty/unknown modes and missing binding fail closed',() => {
    assert.equal(parseArgs(['--parallel','2','candidate.html','--base','base.html','--phase-b-binding','binding.json','--out','out']).candidate,'candidate.html');
    for(const a of [['--self-test','--looks',''],['--self-test','--motion','bogus'],['--self-test','--motion','normal,normal'],['--self-test','--parallel','NaN'],['--self-test','--no-window'],['candidate.html','--base','base.html']]) assert.throws(() => parseArgs(a));
  });
  test('exact owned stop receipt cannot infer success from an empty census or close another actor',() => {
    assert.equal(ownedStopVerified({id:'own'},{id:'own',command_succeeded:true},[{id:'peer'}]),true);
    assert.equal(ownedStopVerified({id:'own'},{id:'own',command_succeeded:true},[{id:'own'},{id:'peer'}]),false);
    assert.equal(ownedStopVerified({id:'own'},null,[]),false);
    assert.equal(ownedStopVerified({id:'own'},{id:'peer',command_succeeded:true},[]),false);
    assert.equal(ownedStopVerified({id:'own'},{id:'own',command_succeeded:true},{}),false);
  });
  test('global census counts unmanaged CDP browsers without renderer child processes or transport stubs',() => {
    const lines=['1 /opt/google/chrome/chrome --remote-debugging-port=9222 --headless=new',
      '2 /opt/google/chrome/chrome --type=renderer --remote-debugging-port=9222',
      '3 /usr/bin/chromium --remote-debugging-pipe --headless',
      '4 /usr/bin/node --remote-debugging-pipe --headless',
      '5 /usr/bin/chrome --normal-window',
      '6 /usr/bin/msedge --remote-debugging-port=9999'].join('\n');
    assert.equal(countCdpBrowsers(lines),3);assert.throws(() => countCdpBrowsers(null));
  });
  test('introduced square mark ink has no manufactured e254 baseline',() => {
    const r=newReport(),b=snapshot(),c=snapshot();
    const l={sel:'.o55-tag',kind:'tag',text:'Recommended',tag:'span',role:null,shape:null,box:{padding:'0px 0px 0px 0px'},contrast:C(5)};
    b.labels=[l];c.labels=[{...l,before:{w:5,h:5,radius:'0px 0px 0px 0px',bg:'rgb(0,0,0)',pill:null}}];
    judgePair(r,'mark custody',b,c,'normal');
    assert.ok(r.unverified.some((x) => x.code==='checkpoint-square-mark-ink-custody-unverified'));
  });
  test('a sweep with no new paired base still retains candidate absolute failures and raw findings',() => {
    const r=newReport(),c=snapshot();
    c.labels=[{sel:'.o55-pill',kind:'status',text:'word',box:{padding:'0px 0px 0px 0px'},contrast:C(3)}];
    c.rawFindings=[{kind:'pill',cls:'unknown',sig:'span.o55-spin'}];
    judgeUnpairedCandidate(r,'unpaired sweep',c,'normal');
    assert.equal(r.failures.length,2);assert.equal(r.rawFindings.length,1);
    assert.ok(r.unverified.some((x) => x.code==='paired-base-context-unverified'));
  });
  test('Show Me cannot be accepted from a missing, synthetic or different-target click receipt',() => {
    const sel='#pm-o55-tour [data-o55t="showMe"]';
    assert.equal(trustedClickVerified(null,sel),false);
    assert.equal(trustedClickVerified({type:'click',trusted:false,selector:sel,tag:'BUTTON'},sel),false);
    assert.equal(trustedClickVerified({type:'click',trusted:true,selector:'another',tag:'BUTTON'},sel),false);
    assert.equal(trustedClickVerified({type:'click',trusted:true,selector:sel,tag:'BUTTON'},sel),true);
  });
  return {scope:'isolated tool logic, no product/browser execution',cases,passed:cases.filter((c) => c.pass).length,failed:cases.filter((c) => !c.pass).length};
}

async function main() {
  argv=process.argv.slice(2);
  const config=parseArgs(argv);VIEWPORT=config.viewport;doTour=!config.flags.includes('--no-tour');
  looks=LOOKS.filter((l) => config.looks.includes(l.id));motions=config.motions;
  OUT=config.values['--out']?resolve(config.values['--out']):null;
  const r=newReport();r.custody=verifyFrozen();r.viewport=VIEWPORT;r.looks=looks.map((l) => l.id);r.motions=motions;
  r.tool_mode=config.mode;r.fixture_apis=FIXTURE_APIS;r.product_execution=config.mode==='live';
  if(OUT && existsSync(join(OUT,'report.json'))) throw new Error('refusing to overwrite existing report/evidence: '+OUT);
  if(config.mode==='self-test') {r.tool_tests=selfTest();r.phase='A-isolated-tool-tests';finalCoverage(r);}
  else if(config.mode==='replay') await replayFiles(r,config.replay);
  else {
    PAGES={base:resolve(config.values['--base']),cand:resolve(config.candidate)};
    phaseBinding=bindLive(config);r.binding=phaseBinding;r.phase='B-exact-bound-matrix';
    for(const [which,p] of Object.entries(PAGES)) r.pages[which]={path:p,sha256:sha(readFileSync(p))};
    /* Deferred import: Phase A has no browser launcher or browser signal handlers. */
    launch=launchOwned;
    for(const sig of ['SIGINT','SIGTERM']) process.once(sig,async () => {const receipts=await Promise.all([...ownClosers].map((c) => c()));console.error(JSON.stringify({signal:sig,owned_stop_receipts:receipts}));process.exit(sig==='SIGINT'?130:143);});
    const queue=looks.flatMap((l) => motions.map((m) => [l,m]));
    const worker=async () => {while(queue.length) {const [l,m]=queue.shift();r.runs.push(await runLook(l,m));}};
    await Promise.all(Array.from({length:config.parallel},worker));
    for(const run of r.runs) judgeRun(r,run);finalCoverage(r);
    r.resources=r.runs.flatMap((run) => Object.entries(run.pages).map(([which,p]) => ({look:run.look,motion:run.motion,which,closed:p.resource_closed,profile:p.runtime&&p.runtime.profile})));
  }
  r.summary=verdict(r);
  if(OUT) {mkdirSync(OUT,{recursive:true});writeFileSync(join(OUT,'report.json'),JSON.stringify(r,null,2)+'\n',{flag:'wx'});}
  console.log(JSON.stringify({mode:config.mode,summary:r.summary,tool_tests:r.tool_tests&&{passed:r.tool_tests.passed,failed:r.tool_tests.failed},out:OUT}));
  if(r.tool_tests) {
    for(const c of r.tool_tests.cases) if(!c.pass) console.error('ISOLATED TEST FAIL '+c.name+'\n'+c.error);
    process.exitCode=r.tool_tests.failed?1:0;
  } else process.exitCode=r.summary.exit_code;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().catch((e) => {
  console.error('HOLD '+String(e.stack||e));process.exitCode=2;
});
