/* onboarding_label_check.mjs — the no-pill LABEL check for the onboarding window and the Guided Tour (pm7-no-pills
 * phase 3). Jared, 2026-10-11 (share/puppet-master/2026-10-11-onboarding-no-pills/README.md): the pill LABELS go
 * (status chips, dashed suggestion chips, state badges, tags); pill-shaped ACTION buttons (Install, Sign in, the
 * rounded buttons Glass and Friendly use) stay. Patterns NP-1..6 (share/puppet-master/2026-10-10-no-pills-patterns).
 * A supplement to tools/pill_check.mjs, which it does not change or replace: that gate walks Settings, the theme menu,
 * the floating notices and the title bar; this one walks the window and the tour, which it never opened.
 *
 * It loads two pages, the BASE (the published page before the change) and the CANDIDATE, through the same views in
 * every look and motion mode, and checks:
 *   LABELS (candidate)  every label below is no pill by pill_check's own rule (the predicate is copied verbatim:
 *                       a visible shape whose radius on the short side is >= short/2 - 0.5px on both ends, short side
 *                       > 3px, long side >= 1.25 x short side). Status and tag labels draw no box at all (no
 *                       background colour or image, no border, no shadow, no padding); a tag's square mark is square;
 *                       suggestion cells keep corners no rounder than the look's control corner (--pm-ctl-r) and
 *                       the chosen cell is filled (NP-CHOICE).
 *   CAPSULES (candidate) every other element in the window and tour roots that the rule calls a pill must be an
 *                       action control Jared kept (KEPT) or a listed shape awaiting a ruling (OPEN, printed with its
 *                       reason). A label or anything unlisted fails. Marks inside labels are left to MARKS.
 *   KEPT (both)         every kept action control has the same role, ARIA state, action, text and box (radius,
 *                       padding, size, fill, border, shadow, colour, font) on both pages.
 *   MARKS (both)        every mark inside a label (the check, the working ring, a glyph) has the same markup, size,
 *                       display, animation and opacity on both pages, and the same ink, or still its host's ink
 *                       when it followed its host before.
 *   MARKUP (both)       each view's window or tour markup (tags, classes, roles, ARIA, actions, keys, words) is the
 *                       same on both pages: the change is style only. NieR's narrator and stage overlays type on their
 *                       own clock and are left out; in the tour (whose practice types its question) words are left
 *                       out and the structure is compared.
 *   FLOW (both)         on Name your Project a real click on a suggestion writes it into the field and makes it the
 *                       chosen cell; Enter on a focused suggestion does the same; both pages agree.
 *   MOTION              with Reduced Motion every label has no transition left (none, or 0s).
 *   CONTRAST            each label word's ink against what is drawn under it (the word hidden, its box sampled) on
 *                       both pages; the candidate may not read lower than the base (0.05 tolerance) unless it still
 *                       reads 4.5:1 or more (NieR's inverted ink blocks read 8.6:1, their plain words 6-7:1). Words
 *                       under 4.5:1 are listed, not failed.
 * Coverage it cannot reach is reported, never forced: .o55-officialurl has no renderer on this page, so it is
 * listed as unverified.
 *
 * Usage:
 *   node tools/onboarding_label_check.mjs <candidate.html> --base <base.html> [--out <dir>] [--looks a,b]
 *        [--motion normal,reduced] [--viewport WxH] [--no-tour] [--no-window] [--sweep] [--coverage <file>]
 *   --looks     out of basic-light friendly-light glass-dark retro-dark basic-dark friendly-dark glass-light retro-light
 *               nier-light nier-dark (default all ten); nier-*-plain is NieR Mode with its Square part off, so its
 *               ink rides the Basic shapes (degrade check)
 *   --motion    normal and/or reduced (default both); reduced emulates prefers-reduced-motion: reduce
 *   --viewport  default 1440x900; 390x844 is the narrow window (the tour is skipped below 600px wide)
 *   --sweep     also opens every onboarding screen once and classifies every capsule in it (catch-all)
 * Browsers come from tools/chrome.mjs (agent-browser: the machine's cap, its own profile, removed at close).
 * Output: one line per failure, a summary, and with --out report.json. Exits 0 when nothing failed, 1 on a failure,
 * 2 when a view could not be opened. Read-only on the repository.
 */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { takeCoverageFlag } from './coverage_union.mjs';

const argv = process.argv.slice(2);
const coverageFile = takeCoverageFlag(argv);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const flag = (k) => argv.includes('--' + k);
const withValue = new Set(['--base', '--out', '--looks', '--motion', '--viewport']);
let candArg = null;
for (let i = 0; i < argv.length; i++) { if (withValue.has(argv[i])) { i++; continue; } if (!argv[i].startsWith('--')) { candArg = argv[i]; break; } }
if (!candArg || !opt('base')) { console.error('usage: onboarding_label_check.mjs <candidate.html> --base <base.html> [options]'); process.exit(2); }
const PAGES = { base: resolve(opt('base')), cand: resolve(candArg) };
const OUT = opt('out') ? resolve(opt('out')) : null;
const LOOKS = [
  { id: 'basic-light', family: 'basic', mode: 'light' }, { id: 'friendly-light', family: 'friendly', mode: 'light' },
  { id: 'glass-dark', family: 'glass', mode: 'dark' }, { id: 'retro-dark', family: 'retro', mode: 'dark' },
  { id: 'basic-dark', family: 'basic', mode: 'dark' }, { id: 'friendly-dark', family: 'friendly', mode: 'dark' },
  { id: 'glass-light', family: 'glass', mode: 'light' }, { id: 'retro-light', family: 'retro', mode: 'light' },
  { id: 'nier-light', family: 'basic', mode: 'light', nier: true }, { id: 'nier-dark', family: 'basic', mode: 'dark', nier: true },
  { id: 'nier-light-plain', family: 'basic', mode: 'light', nier: true, plain: true }, { id: 'nier-dark-plain', family: 'basic', mode: 'dark', nier: true, plain: true },
];
const looksSel = opt('looks') ? opt('looks').split(',') : LOOKS.slice(0, 10).map((l) => l.id);
const unknown = looksSel.filter((id) => !LOOKS.some((l) => l.id === id));
if (unknown.length) { console.error('unknown look(s): ' + unknown.join(', ')); process.exit(2); }
const looks = LOOKS.filter((l) => looksSel.includes(l.id));
const motions = (opt('motion', 'normal,reduced')).split(',');
const vp = /^(\d{3,4})x(\d{3,4})$/.exec(opt('viewport', '1440x900'));
if (!vp) { console.error('--viewport must be WxH'); process.exit(2); }
const VIEWPORT = { width: +vp[1], height: +vp[2] };
const doTour = !flag('no-tour') && VIEWPORT.width >= 600;
const doWindow = !flag('no-window');

/* The labels phase 3 changed, by kind. Selectors are exact; nothing else is a label here. */
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

/* ---------- in-page collector (self-contained: shipped through page.evaluate) ---------- */
function collect(R) {
  const STATE = /^(active|is-|on$|off$|open|selected|current|checked|pressed|focused|hover|disabled|show|shown|hide$|hidden$|first|last)/;
  const KBD_SEL = '.kbd,.pm51-kbd,kbd';
  function alpha(c) {
    if (!c) return 0; c = String(c).trim().toLowerCase();
    if (c === 'transparent' || c === 'none') return 0;
    const m = c.match(/^rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(',').map((s) => s.trim()); if (p.length === 4) return parseFloat(p[3]); return 1; }
    if (c[0] === '#') return c.length === 9 ? parseInt(c.slice(7), 16) / 255 : 1;
    return 1;
  }
  function pair(v) { const p = String(v).trim().split(/\s+/).map(parseFloat); return p.length === 1 ? [p[0], p[0]] : [p[0], p[1]]; }
  /* shapeOf and pillOf: tools/pill_check.mjs, verbatim */
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
    if (!(mn > 3)) return null;
    if (mx < 1.25 * mn) return null;
    if (!shapeOf(cs)) return null;
    const cs4 = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(pair);
    const horiz = w >= h;
    const rel = cs4.map((p) => (horiz ? p[1] : p[0]));
    const thr = mn / 2 - 0.5;
    const ends = horiz ? [[rel[0], rel[3]], [rel[1], rel[2]]] : [[rel[0], rel[1]], [rel[3], rel[2]]];
    if (!ends.every((end) => end.every((v) => v >= thr))) return null;
    return { radius: Math.min.apply(null, rel), shape: shapeOf(cs) };
  }
  function sigOf(el, pseudo) {
    const kept = [], all = [];
    for (const c of el.classList) { if (!c) continue; all.push(c); if (!STATE.test(c)) kept.push(c); }
    kept.sort(); const sc = kept.length ? kept : all.sort();
    const role = el.getAttribute && el.getAttribute('role');
    return el.tagName.toLowerCase() + (sc.length ? '.' + sc.join('.') : '') + (role ? '[role=' + role + ']' : '') + (pseudo ? '::' + pseudo : '');
  }
  const vis = (el) => { const r = el.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return false; const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false; const op = parseFloat(cs.opacity); return !(op < 0.05); };
  const textOf = (el) => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  const box = (cs) => ({ radius: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '),
    padding: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '), bg: cs.backgroundColor, bgimg: cs.backgroundImage,
    border: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].join(' ') + ' ' + [cs.borderTopStyle, cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor].join(' '),
    shadow: cs.boxShadow, outline: cs.outlineStyle + ' ' + cs.outlineWidth });
  const roots = []; const seen = new Set();
  for (const sel of R.roots) for (const e of document.querySelectorAll(sel)) if (!roots.some((r) => r.contains(e))) roots.push(e);
  const inRoots = (el) => roots.some((r) => r.contains(el));
  const out = { labels: [], kept: [], marks: [], capsules: [], ctlr: getComputedStyle(document.documentElement).getPropertyValue('--pm-ctl-r').trim(), markup: '' };
  const labelOf = (el) => R.labels.find((l) => el.matches(l.sel));
  /* labels */
  let li = 0;
  for (const L of R.labels) for (const el of document.querySelectorAll(L.sel)) {
    if (!inRoots(el) || !vis(el)) continue;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const pb = getComputedStyle(el, '::before'), pa = getComputedStyle(el, '::after');
    const pseudo = (p) => (p.content && p.content !== 'none' && p.content !== 'normal' && p.display !== 'none') ? { w: parseFloat(p.width), h: parseFloat(p.height), radius: p.borderTopLeftRadius, bg: p.backgroundColor, pill: pillOf(parseFloat(p.width), parseFloat(p.height), p) } : null;
    const id = 'olc' + (li++); el.setAttribute('data-olc', id);
    const rec = { id, kind: L.kind, sel: L.sel, sig: sigOf(el), text: textOf(el), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
      pill: pillOf(r.width, r.height, cs), shape: shapeOf(cs), filled: alpha(cs.backgroundColor) > 0.02 || cs.backgroundImage !== 'none', box: box(cs), color: cs.color, font: cs.font, transition: cs.transitionProperty + ' ' + cs.transitionDuration,
      animation: cs.animationName, before: pseudo(pb), after: pseudo(pa), on: el.classList.contains('o55-on'), tag: el.tagName.toLowerCase(), role: el.getAttribute('role'),
      act: el.getAttribute('data-o55-do'), key: el.getAttribute('data-key') };
    out.labels.push(rec);
    let mi = 0;
    for (const m of el.querySelectorAll(':scope > :is(' + R.marks + ')')) {
      const ms = getComputedStyle(m);
      out.marks.push({ host: id, hostSel: L.sel, hostText: rec.text, n: mi++, html: m.outerHTML, w: ms.width, h: ms.height, display: ms.display, visibility: ms.visibility,
        animation: ms.animationName + ' ' + ms.animationDuration + ' ' + ms.animationIterationCount, color: ms.color, stroke: ms.stroke, fill: ms.fill, hostColor: cs.color });
    }
  }
  /* kept controls and the capsule catch-all */
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const visit = (el) => {
      if (seen.has(el)) return; seen.add(el);
      if (el.closest('svg') || el.closest(KBD_SEL) || ['SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName)) return;
      /* a mark inside a label (the check, the working ring, a glyph) is the glyph path's: MARKS compares it with the
         base; a turning ring caught mid-turn is not a capsule of this phase */
      if (el.matches(R.marks) && el.parentElement && R.labels.some((l) => el.parentElement.matches(l.sel))) return;
      if (!vis(el)) return;
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      const keptSel = R.kept.find((s) => el.matches(s));
      if (keptSel) out.kept.push({ sel: keptSel, sig: sigOf(el), text: textOf(el).slice(0, 50), tag: el.tagName.toLowerCase(), role: el.getAttribute('role'),
        aria: ['aria-checked', 'aria-pressed', 'aria-expanded', 'aria-disabled', 'aria-label', 'aria-selected'].map((a) => el.getAttribute(a)).join('|'),
        act: el.getAttribute('data-o55-do') || el.getAttribute('data-o55t') || el.getAttribute('data-o55p') || '', key: el.getAttribute('data-key') || '',
        box: box(cs), w: cs.width, h: cs.height, color: cs.color, font: cs.font, hasLabel: R.labels.some((l) => el.querySelector(l.sel)) });
      const cands = [[el, cs, r.width, r.height, null]];
      for (const p of ['before', 'after']) { const pcs = getComputedStyle(el, '::' + p); if (pcs.content && pcs.content !== 'none' && pcs.content !== 'normal' && pcs.display !== 'none') cands.push([el, pcs, parseFloat(pcs.width), parseFloat(pcs.height), p]); }
      for (const [e, s, w, h, p] of cands) {
        if (!(w > 0 && h > 0)) continue;
        const pl = pillOf(w, h, s); if (!pl) continue;
        const lab = !p && labelOf(e);
        const kept = !lab && (R.kept.find((k) => e.matches(k)) || (!p && R.kept.find((k) => e.parentElement && e.parentElement.closest(k) && !R.labels.some((l) => e.closest(l.sel)))));
        const open = !lab && !kept && R.open.find((o) => e.matches(o.sel));
        out.capsules.push({ sig: sigOf(e, p), text: textOf(e).slice(0, 50), w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10, radius: pl.radius, shape: pl.shape,
          cls: lab ? 'label' : kept ? 'kept' : open ? 'open' : 'unknown', by: lab ? lab.sel : kept || (open && open.sel) || null });
      }
    };
    visit(root); while (walker.nextNode()) visit(walker.currentNode);
  }
  /* the markup signature: what the views' scripts drew, without what styling or timing adds */
  const TRANSIENT = /^(pmh-|o55-entering|o55-hold|o55-in-back|o55-out|o55-opening|o55-closing|o55-scrim-lit|o55nw-|o55-reason-show|o55-toast-show)/;
  const parts = [];
  for (const root of roots) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n = root;
    do {
      /* NieR's narrator and stage overlays type and step on their own clock: not markup the change could alter */
      if (n.nodeType === 1 && n.closest('.o55fx-layer, .o55nw-stage, .o55nw-podlane')) continue;
      if (n.nodeType === 3) { if (n.parentElement && n.parentElement.closest('.o55fx-layer, .o55nw-stage, .o55nw-podlane')) continue;
        const t = n.textContent.trim(); if (t && !R.textless) parts.push('"' + t); continue; }
      if (n.closest && n.closest('svg') && n.tagName.toLowerCase() !== 'svg') continue;
      const cls = [...n.classList].filter((c) => !TRANSIENT.test(c)).sort().join('.');
      const at = ['role', 'aria-checked', 'aria-pressed', 'aria-expanded', 'aria-disabled', 'aria-label', 'data-o55-do', 'data-arg', 'data-key', 'data-o55t', 'data-o55p', 'type', 'tabindex']
        .map((a) => n.getAttribute(a)).map((v) => (v == null ? '' : v)).join('|');
      parts.push('<' + n.tagName.toLowerCase() + '.' + cls + '|' + at);
    } while ((n = w.nextNode()));
  }
  out.markup = parts.join('\n');
  return out;
}

/* ---------- contrast: the word's ink against what is drawn under it (word, mark and square hidden) ---------- */
async function contrastOf(page, id) {
  const r = await page.evaluate((i) => {
    const el = document.querySelector('[data-olc="' + i + '"]'); if (!el) return null;
    let st = document.getElementById('olc-hide');
    if (!st) { st = document.createElement('style'); st.id = 'olc-hide'; st.textContent = '[data-olc-hide], [data-olc-hide] *, [data-olc-hide]::before, [data-olc-hide]::after { color: transparent !important; transition: none !important; animation: none !important; } [data-olc-hide] > * { visibility: hidden !important; } [data-olc-hide]::before, [data-olc-hide]::after { visibility: hidden !important; }'; document.head.appendChild(st); }
    el.scrollIntoView({ block: 'center', inline: 'nearest' });
    const color = getComputedStyle(el).color;
    el.setAttribute('data-olc-hide', '');
    const q = el.getBoundingClientRect();
    return { color, x: q.x, y: q.y, w: q.width, h: q.height };
  }, id);
  if (!r || !(r.w > 1 && r.h > 1)) return null;
  await sleep(60);
  const shot = await page.send('Page.captureScreenshot', { format: 'png', clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  return page.evaluate(async (b64, i, color) => {
    const el = document.querySelector('[data-olc="' + i + '"]'); if (el) el.removeAttribute('data-olc-hide');
    const bm = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
    const c = new OffscreenCanvas(bm.width, bm.height); const g = c.getContext('2d'); g.drawImage(bm, 0, 0);
    const d = g.getImageData(0, 0, bm.width, bm.height).data; const L = [];
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const lum = (rr, gg, bb) => 0.2126 * lin(rr) + 0.7152 * lin(gg) + 0.0722 * lin(bb);
    for (let k = 0; k < d.length; k += 4) L.push([lum(d[k], d[k + 1], d[k + 2]), d[k], d[k + 1], d[k + 2]]);
    L.sort((a, b) => a[0] - b[0]); const bg = L[Math.floor(L.length / 2)];
    /* computed inks come as rgb()/rgba(), or as color(srgb r g b / a) when they are a color-mix() */
    let p = null; const m = color.match(/rgba?\(([^)]+)\)/), s = color.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
    if (m) p = m[1].split(',').map((x) => parseFloat(x)); else if (s) p = [s[1] * 255, s[2] * 255, s[3] * 255, s[4] == null ? 1 : parseFloat(s[4])];
    if (!p) return { error: 'unparsed ink ' + color };
    const a = p.length > 3 ? p[3] : 1;
    const ink = [0, 1, 2].map((j) => p[j] * a + bg[j + 1] * (1 - a));
    const l1 = lum(ink[0], ink[1], ink[2]), l2 = bg[0];
    return { ratio: Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100, ink: color, under: 'rgb(' + bg.slice(1).join(',') + ')' };
  }, shot.data, id, r.color);
}

async function measure(page, d) { for (const L of d.labels) { try { L.contrast = await contrastOf(page, L.id); } catch (e) { L.contrast = { error: String(e.message || e) }; } } }

/* ---------- driver ---------- */
const report = { pages: {}, viewport: VIEWPORT, looks: looks.map((l) => l.id), motions, runs: [], failures: [], notes: [], unverified: [], contrastLow: [] };
for (const [k, p] of Object.entries(PAGES)) report.pages[k] = { path: p, sha256: createHash('sha256').update(readFileSync(p)).digest('hex') };
const fail = (where, what) => { report.failures.push({ where, what }); console.log('FAIL ' + where + ': ' + what); };
let crashed = 0;

async function bootPage(page, which, look, motion) {
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: look.mode }, { name: 'prefers-reduced-motion', value: motion === 'reduced' ? 'reduce' : 'no-preference' }] });
  await page.goto(pathToFileURL(PAGES[which]).href + '?o55=off&o55scenario=fresh');
  for (let i = 0; i < 300; i++) { if (await page.evaluate(() => !!(window.O55 && window.O55.ui && window.O55.ui.open && window.PM12_KIMI && window.PM_THEME))) break; await sleep(150); }
  await sleep(700);
  let state = null;
  for (let a = 0; a < 5; a++) {
    await page.evaluate((f, m, n, plain) => {
      const cap = (s) => s[0].toUpperCase() + s.slice(1);
      try { window.PM12_KIMI.setSettingFromHost('general.visual.theme', cap(f) + ' ' + cap(m)); } catch (e) {}
      try { if (window.PM_NIER) window.PM_NIER.set(!!n); } catch (e) {}
      if (n && plain) { try { window.PM_NIER.setParts(window.PM_NIER.parts().filter((k) => k !== 'square')); } catch (e) {} }
      localStorage.removeItem('pm.o55.onboarding.v1'); localStorage.removeItem('pm.o55.tour.v1');
    }, look.family, look.mode, !!look.nier, !!look.plain);
    await sleep(700);
    state = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, nier: document.documentElement.getAttribute('data-o55-nier'), parts: document.documentElement.getAttribute('data-o55-nier-parts') || '',
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches }));
    if (state.theme === look.family + '-' + look.mode && (look.nier ? state.nier === 'on' : state.nier !== 'on') && (!look.plain || !/\bsquare\b/.test(state.parts))) { state.confirmed = true; break; }
  }
  return state;
}

const settle = async (page, id) => {
  for (let i = 0; i < 80; i++) {
    const ok = await page.evaluate((sc) => { const S = window.O55.S, r = document.getElementById('pm-o55-onboarding'); const l = r && r.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
      return !!(S.open && S.sess && l && (!sc || S.sess.screen === sc) && l.getAttribute('data-screen') === S.sess.screen && !r.matches('.o55-hold, .o55-opening, .o55-closing') && !l.matches('.o55-hold, .o55-entering') && !r.querySelector('.o55-pane > .o55-out')); }, id);
    if (ok) return true; await sleep(120);
  }
  return false;
};
const mouseAway = (page) => page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: VIEWPORT.height - 2 });

/* the window's views: where each changed label shows, in the state the flow gives it */
const VIEWS = [
  { id: 'where', screen: 'where', until: () => document.querySelectorAll('#pm-o55-onboarding .o55-chip-ok').length === 3 },
  { id: 'look', screen: 'look' }, { id: 'begin', screen: 'begin' }, { id: 'c-review', screen: 'c-review' },
  { id: 'name', screen: 'name', flow: 'suggest' }, { id: 's-confirm', screen: 's-confirm' },
  { id: 'ai', screen: 'ai', until: () => !document.querySelector('#pm-o55-onboarding .o55-pill-wait') }, { id: 'free', screen: 'free' },
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
const R_WIN = { roots: ['#pm-o55-onboarding'], labels: LABELS, kept: KEPT, open: OPEN, marks: STATUS_MARKS };
/* the tour's own surfaces: its root, the practice's parts in the Planning Wizard (never the Wizard panel itself, which
   the practice marks .o55p-practice: the Wizard's own controls are not this check's), Explain this reply simply */
const R_TOUR = { roots: ['#pm-o55-tour', '[class*="o55p-"]:not(.o55p-practice)', '.o55-explain-row', '.o55-explains', '.o55t-landing'], labels: LABELS, kept: KEPT, open: OPEN, marks: STATUS_MARKS, textless: true };

async function clickAt(page, sel) {
  for (let i = 0; i < 60; i++) {
    const c = await page.evaluate((s) => { const el = [...document.querySelectorAll(s)].find((e) => e.getClientRects().length && !e.closest('[inert]')); if (!el) return null; el.scrollIntoView({ block: 'nearest' });
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y); return { x, y, hit: !!top && (top === el || el.contains(top)) }; }, sel);
    if (c && c.hit) { await page.mouse(c.x, c.y); return true; }
    await sleep(100);
  }
  return false;
}

const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const until = async (page, fn, ms = 12000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await sleep(150); } return false; };
/* The folder browser needs a device the person found and signed in to: the same clicks as scenario n1
   (tools/scenarios.mjs), from a fresh window, with the fixture world's Home NAS. */
async function nasPath(page, seen) {
  const act = async (a, arg) => { if (!(await clickAt(page, `${LAYER} [data-o55-do="${a}"]` + (arg != null ? `[data-arg="${arg}"]` : '')))) throw new Error('no control ' + a + ' ' + (arg || '')); await settle(page); };
  const primary = async () => { await until(page, () => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-primary'); return b && b.getAttribute('aria-disabled') !== 'true'; });
    if (!(await clickAt(page, `${LAYER} .o55-primary`))) throw new Error('no primary'); await sleep(200); await settle(page);
    if (seen) { await sleep(500); const sc = await page.evaluate(() => window.O55.S.sess.screen); if (!seen[sc]) { await mouseAway(page); seen[sc] = (await page.evaluate(collect, R_WIN)).capsules; } } };
  const type = async (bind, text) => { await page.evaluate((b) => { const i = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) [data-o55-bind="' + b + '"]'); i.focus(); i.select && i.select(); }, bind);
    await page.send('Input.insertText', { text }); await sleep(250); };
  await page.evaluate(() => { try { window.O55.ui.close('test'); } catch (e) {} localStorage.removeItem('pm.o55.onboarding.v1'); window.O55.ui.open({ fresh: true }); });
  await settle(page); await primary(); await primary(); await primary();
  await act('pick', 'existing'); await act('sub', 'device'); await primary();
  await until(page, () => !!document.querySelector('.o55-card[data-arg="nas-home"]'), 8000); await act('device', 'nas-home'); await primary();
  await primary();
  await until(page, () => (window.O55.S.sess.ops['keys:nas-home'] || {}).state === 'done', 8000); await primary();
  await type('user', 'jared'); await type('pw', 'correct horse'); await primary();
  await until(page, () => (window.O55.S.sess.ops['sshinstall:nas-home:new'] || {}).state === 'done', 12000); await primary();
  return page.evaluate(() => window.O55.S.sess.screen);
}

async function windowView(page, v, sweep) {
  const pathCaps = v.path === 'nas' ? {} : null;
  if (v.path === 'nas') { const at = await nasPath(page, pathCaps); if (at !== v.screen) return { error: 'the NAS path ended on ' + at }; }
  else await page.evaluate((s) => { try { window.O55.ui.close('test'); } catch (e) {} window.O55.ui.open({ screen: s }); }, v.screen);
  if (!(await settle(page, v.screen))) return { error: 'screen ' + v.screen + ' did not settle' };
  await mouseAway(page);
  if (v.until) { for (let i = 0; i < 100; i++) { if (await page.evaluate(v.until)) break; await sleep(150); } }
  await sleep(sweep ? 600 : 900);
  const flow = {};
  if (v.flow === 'newfolder') {
    if (await clickAt(page, '#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="adding"]')) {
      await settle(page);
      await page.evaluate(() => { const i = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="newName"]'); if (i) i.focus(); });
      await page.send('Input.insertText', { text: 'book-club-site' }); await sleep(300);
      await clickAt(page, '#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="addFolder"]'); await settle(page); await sleep(500);
      /* adding a folder opens it (an empty folder); its New tag shows in the parent's list */
      await clickAt(page, '#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="cd"][data-arg="/volume1"]'); await settle(page); await sleep(500);
      flow.newFolder = await page.evaluate(() => !!document.querySelector('#pm-o55-onboarding .o55-treeitem.o55-new .o55-tag'));
    } else flow.newFolder = 'no add control';
    await mouseAway(page);
  }
  if (v.flow === 'lookmenu') {
    flow.menu = await clickAt(page, '#pm-o55-onboarding .o55-lookbtn'); await sleep(500); await mouseAway(page);
  }
  const data = await page.evaluate(collect, R_WIN);
  if (!sweep) await measure(page, data);
  if (v.flow === 'suggest') {
    /* a real click on the second suggestion, then Enter on the first with the keyboard */
    const pick = async (how, n) => {
      const sel = `#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-suggestchip:nth-child(${n})`;
      const want = await page.evaluate((s) => { const b = document.querySelector(s); return b ? b.textContent.trim() : null; }, sel);
      if (!want) return { how, ok: false, why: 'no suggestion ' + n };
      if (how === 'click') await clickAt(page, sel);
      else { await page.evaluate((s) => document.querySelector(s).focus(), sel); await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' }); await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); }
      await sleep(250); await settle(page); await sleep(400);
      return page.evaluate((w) => { const l = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out)'); const f = l.querySelector('[data-o55-bind="name"]'); const on = [...l.querySelectorAll('.o55-suggestchip.o55-on')].map((b) => b.textContent.trim());
        const cell = [...l.querySelectorAll('.o55-suggestchip')].find((b) => b.textContent.trim() === w); const cs = cell && getComputedStyle(cell);
        return { want: w, field: f ? f.value : null, on, chosenFill: cs ? cs.backgroundColor : null, ok: !!f && f.value === w && on.length === 1 && on[0] === w }; }, want);
    };
    flow.click = await pick('click', 2); await mouseAway(page); flow.key = await pick('key', 1); await mouseAway(page);
    flow.after = await page.evaluate(collect, R_WIN); await measure(page, flow.after);
  }
  if (v.flow === 'lookmenu') await page.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-lookbtn.o55-on'); if (b) b.click(); });
  return { data, flow, pathCaps };
}

async function tourWalk(page) {
  const out = []; const ev = (fn, ...a) => page.evaluate(fn, ...a);
  const until = async (fn, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(fn)) return true; await sleep(120); } return false; };
  await ev(() => window.PM7_GUIDED_TOUR.start({ project: 'tastebook' }));
  const WANT = new Set(['comfort_intro', 'open_chat', 'same_answer_eli5', 'book_club_goal', 'three_outcomes']);
  for (let guard = 0; guard < 40; guard++) {
    const id = await ev(() => window.O55.tour.state().step);
    const def = await ev((i) => { const d = window.O55.tour.byId[i]; return { kind: d.kind, after: !!d.after, stay: !!d.stay }; }, id);
    await sleep(1400); await mouseAway(page);
    if (WANT.has(id)) { const data = await ev(collect, R_TOUR); await measure(page, data); out.push({ step: id, data }); }
    if (id === 'three_outcomes') break;
    if (def.kind === 'info') { await until(() => !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]'), 12000); await clickAt(page, '#pm-o55-tour .o55t-callout [data-o55t="next"]'); }
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
      } else await clickAt(page, '#pm-o55-tour .o55t-callout [data-o55t="showMe"]');
      if (!(await until(new Function(`return window.O55.tour.state().done.includes(${JSON.stringify(id)})`), 20000))) { out.push({ step: id, error: 'step not done' }); break; }
      if (id === 'book_club_goal') { await sleep(900); await mouseAway(page); const data = await ev(collect, R_TOUR); await measure(page, data); out.push({ step: 'book_club_goal:practice', data }); }
      if (def.stay) { await sleep(900); await clickAt(page, '#pm-o55-tour .o55t-callout [data-o55t="next"]'); }
    }
    if (!(await until(new Function(`return window.O55.tour.state().step !== ${JSON.stringify(id)}`), 12000))) { out.push({ step: id, error: 'tour did not move on' }); break; }
  }
  return out;
}

async function runLook(look, motion) {
  const res = { look: look.id, motion, pages: {} };
  for (const which of ['base', 'cand']) {
    const { page, close } = await launch({ ...VIEWPORT, coverageFile: which === 'cand' ? coverageFile : null });
    const pr = { views: {}, tour: [], state: null, errors: [] };
    try {
      await page.setViewport(VIEWPORT.width, VIEWPORT.height);
      pr.state = await bootPage(page, which, look, motion);
      if (!pr.state.confirmed) pr.errors.push('look not confirmed: ' + JSON.stringify(pr.state));
      if (doWindow) for (const v of VIEWS) {
        try { pr.views[v.id] = await windowView(page, v, false); } catch (e) { pr.views[v.id] = { error: String(e && e.message || e) }; }
      }
      if (doWindow && flag('sweep') && which === 'cand') {
        pr.sweep = {};
        for (const s of ALL_SCREENS.filter((x) => !NEEDS_DEVICE.includes(x))) { try { const r = await windowView(page, { id: s, screen: s }, true); pr.sweep[s] = r.data ? r.data.capsules : { error: r.error }; } catch (e) { pr.sweep[s] = { error: String(e.message || e) }; } }
      }
      if (doTour) {
        /* the tour starts on a freshly loaded page in the same look and motion: after the window's views its drag
           step did not complete, while it does on a fresh page (probe, 1440x900 and 1600x1000) */
        const st2 = await bootPage(page, which, look, motion);
        if (!st2.confirmed) pr.errors.push('look not confirmed for the tour: ' + JSON.stringify(st2));
        try { pr.tour = await tourWalk(page); } catch (e) { pr.tour = [{ error: String(e && e.message || e) }]; }
      }
      pr.errors.push(...(page.errors || []).slice(0, 10).map(String));
    } catch (e) { pr.errors.push('crash: ' + String(e && e.message || e)); crashed++; }
    finally { await close(); }
    res.pages[which] = pr;
  }
  return res;
}

/* ---------- judgement ---------- */
const radiusMax = (s) => Math.max(...String(s).split(/\s+/).map(parseFloat).filter((n) => !Number.isNaN(n)));
function judgeLabels(where, d, ctlr) {
  for (const L of d.labels) {
    const at = `${where} ${L.sel} "${L.text}"`;
    if (L.pill) fail(at, `still a pill (radius ${L.pill.radius}px, ${L.pill.shape}, ${L.w}x${L.h})`);
    if (L.kind === 'status' || L.kind === 'tag') {
      if (L.shape) fail(at, `draws a box (${L.shape}): bg ${L.box.bg} img ${L.box.bgimg} border ${L.box.border} shadow ${L.box.shadow}`);
      if (L.box.padding !== '0px 0px 0px 0px') fail(at, `padding ${L.box.padding}`);
    }
    if (L.kind === 'tag' && L.sel !== '.o55-routelink > span') {
      if (!L.before) fail(at, 'no square mark');
      else if (Math.abs(L.before.w - L.before.h) > 0.01 || L.before.pill) fail(at, `mark not square (${L.before.w}x${L.before.h}, radius ${L.before.radius})`);
    }
    if (L.kind === 'choice') {
      const lim = (parseFloat(ctlr) || 0) + 0.5;
      if (radiusMax(L.box.radius) > lim) fail(at, `corner ${L.box.radius} rounder than the look's control corner ${ctlr}`);
      if (L.on && !L.filled) fail(at, 'chosen cell not filled');
    }
  }
}
function judgeCapsules(where, d) {
  for (const c of d.capsules) {
    if (c.cls === 'label') fail(`${where} ${c.sig} "${c.text}"`, `label is a pill (${c.w}x${c.h}, radius ${c.radius})`);
    if (c.cls === 'unknown') fail(`${where} ${c.sig} "${c.text}"`, `unlisted pill-shaped element (${c.w}x${c.h}, radius ${c.radius}, ${c.shape})`);
  }
}
const keyOf = (k) => [k.sel, k.sig, k.text, k.act, k.key].join('§');
function judgeBoth(where, b, c) {
  /* kept controls: identical on both pages */
  const bk = new Map(), ck = new Map();
  for (const k of b.kept) { const key = keyOf(k); bk.set(key, (bk.get(key) || []).concat([k])); }
  for (const k of c.kept) { const key = keyOf(k); ck.set(key, (ck.get(key) || []).concat([k])); }
  for (const [key, list] of bk) {
    const other = ck.get(key) || [];
    if (other.length !== list.length) { fail(`${where} kept ${key.split('§').slice(0, 3).join(' ')}`, `count ${list.length} on base, ${other.length} on candidate`); continue; }
    /* a control holding a label (a card's tag, a folder's New tag) may change size with the label; its box may not */
    list.forEach((k, i) => { const o = other[i]; for (const f of ['tag', 'role', 'aria', 'w', 'h', 'color', 'font']) if (!(k.hasLabel && (f === 'w' || f === 'h')) && k[f] !== o[f]) fail(`${where} kept ${k.sig} "${k.text}"`, `${f}: ${k[f]} -> ${o[f]}`);
      for (const f of Object.keys(k.box)) if (k.box[f] !== o.box[f]) fail(`${where} kept ${k.sig} "${k.text}"`, `${f}: ${k.box[f]} -> ${o.box[f]}`); });
  }
  for (const key of ck.keys()) if (!bk.has(key)) fail(`${where} kept ${key.split('§').slice(0, 3).join(' ')}`, 'only on the candidate');
  /* marks inside labels */
  const mk = (m) => [m.hostSel, m.hostText, m.n].join('§');
  const bm = new Map(b.marks.map((m) => [mk(m), m])), cm = new Map(c.marks.map((m) => [mk(m), m]));
  for (const [key, m] of bm) {
    const o = cm.get(key); const at = `${where} mark ${m.n} in ${m.hostSel} "${m.hostText}"`;
    if (!o) { fail(at, 'missing on the candidate'); continue; }
    if (createHash('sha256').update(m.html).digest('hex') !== createHash('sha256').update(o.html).digest('hex')) fail(at, 'markup differs');
    for (const f of ['w', 'h', 'display', 'visibility', 'animation']) if (m[f] !== o[f]) fail(at, `${f}: ${m[f]} -> ${o[f]}`);
    const followed = m.color === m.hostColor;
    if (followed ? o.color !== o.hostColor : o.color !== m.color) fail(at, `ink ${m.color} -> ${o.color} (host ${m.hostColor} -> ${o.hostColor})`);
    if (followed && m.color !== o.color) report.notes.push(`${at}: follows its host's ink, ${m.color} -> ${o.color}`);
  }
  for (const key of cm.keys()) if (!bm.has(key)) fail(`${where} mark ${key}`, 'only on the candidate');
  /* the same labels, the same markup */
  const ls = (d) => d.labels.map((l) => [l.sel, l.text, l.act || '', l.key || '', l.tag, l.role || ''].join('§')).sort().join('\n');
  if (ls(b) !== ls(c)) fail(where, 'label set differs between base and candidate');
  if (b.markup !== c.markup) {
    const bl = b.markup.split('\n'), cl = c.markup.split('\n'); let i = 0; while (i < bl.length && bl[i] === cl[i]) i++;
    fail(where, `markup differs at node ${i}: ${JSON.stringify(bl[i] || '').slice(0, 120)} vs ${JSON.stringify(cl[i] || '').slice(0, 120)}`);
  }
  /* contrast: never lower than before */
  const bc = new Map(b.labels.map((l) => [[l.sel, l.text].join('§'), l]));
  for (const l of c.labels) {
    const o = bc.get([l.sel, l.text].join('§'));
    const cr = l.contrast && l.contrast.ratio, br = o && o.contrast && o.contrast.ratio;
    if (cr == null) { report.notes.push(`${where} ${l.sel} "${l.text}": contrast not measured`); continue; }
    if (br != null && cr < br - 0.05 && cr < 4.5) fail(`${where} ${l.sel} "${l.text}"`, `reads lower than before: ${br} -> ${cr}`);
    if (cr < 4.5) report.contrastLow.push({ where, sel: l.sel, text: l.text, base: br, cand: cr, ink: l.contrast.ink, under: l.contrast.under });
  }
}
function judgeMotion(where, d, motion) {
  if (motion !== 'reduced') return;
  for (const L of d.labels) { const [prop, ...dur] = L.transition.split(' '); if (!(prop === 'none' || dur.join(' ').split(',').every((s) => parseFloat(s) === 0))) fail(`${where} ${L.sel} "${L.text}"`, `Reduced Motion leaves a transition: ${L.transition}`); }
}

const queue = []; for (const look of looks) for (const m of motions) queue.push([look, m]);
const PAR = Math.max(1, Math.min(2, Number(opt('parallel', '1'))));
async function worker() { while (queue.length) { const [look, m] = queue.shift(); console.log(`run ${look.id} ${m} ${VIEWPORT.width}x${VIEWPORT.height}`); report.runs.push(await runLook(look, m)); } }
await Promise.all(Array.from({ length: PAR }, worker));

let views = 0, labelsSeen = 0;
const kindsSeen = new Set(), selsSeen = new Set();
for (const run of report.runs) {
  const tag = `${run.look}/${run.motion}`;
  const B = run.pages.base, C = run.pages.cand;
  for (const e of [...(B.errors || []), ...(C.errors || [])]) if (/^(crash|look not confirmed)/.test(e)) { crashed++; console.log('ERROR ' + tag + ': ' + e); }
  for (const v of VIEWS) {
    const b = B.views[v.id], c = C.views[v.id]; const where = `${tag} ${v.id}`;
    if (!doWindow) break;
    if (!b || !c || b.error || c.error) { crashed++; console.log(`ERROR ${where}: ${(b && b.error) || (c && c.error) || 'not run'}`); continue; }
    views++;
    judgeLabels(where, c.data, c.data.ctlr); judgeCapsules(where, c.data); judgeBoth(where, b.data, c.data); judgeMotion(where, c.data, run.motion);
    for (const l of c.data.labels) { labelsSeen++; kindsSeen.add(l.kind); selsSeen.add(l.sel); }
    if (v.flow === 'suggest') {
      for (const k of ['click', 'key']) { if (!c.flow[k] || !c.flow[k].ok) fail(`${where} flow ${k}`, JSON.stringify(c.flow[k]));
        if (JSON.stringify([b.flow[k].field, b.flow[k].on]) !== JSON.stringify([c.flow[k].field, c.flow[k].on])) fail(`${where} flow ${k}`, 'base and candidate disagree'); }
      judgeLabels(where + ' chosen', c.flow.after, c.data.ctlr); judgeBoth(where + ' chosen', b.flow.after, c.flow.after);
    }
    if (v.flow === 'newfolder' && c.flow.newFolder !== true) report.unverified.push(`${where}: the new folder's tag did not show (${c.flow.newFolder})`);
    if (v.flow === 'lookmenu' && !c.flow.menu) report.unverified.push(`${where}: the look menu did not open`);
  }
  if (C.sweep) {
    for (const [s, caps] of Object.entries(C.sweep)) { if (caps.error) { crashed++; console.log(`ERROR ${tag} sweep ${s}: ${caps.error}`); continue; } judgeCapsules(`${tag} sweep ${s}`, { capsules: caps }); }
    const onPath = (C.views['nas-folder'] && C.views['nas-folder'].pathCaps) || {};
    for (const [s, caps] of Object.entries(onPath)) judgeCapsules(`${tag} sweep ${s} (NAS path)`, { capsules: caps });
    for (const s of NEEDS_DEVICE) if (!onPath[s]) report.unverified.push(`${tag} sweep ${s}: needs a device on another path; not swept`);
  }
  if (doTour) {
    const bt = new Map((B.tour || []).map((t) => [t.step, t])), ct = new Map((C.tour || []).map((t) => [t.step, t]));
    for (const t of C.tour || []) if (t.error) { crashed++; console.log(`ERROR ${tag} tour ${t.step || ''}: ${t.error}`); }
    for (const [step, t] of ct) {
      if (!t.data) continue; const o = bt.get(step); const where = `${tag} tour ${step}`; views++;
      judgeLabels(where, t.data, t.data.ctlr); judgeCapsules(where, t.data); judgeMotion(where, t.data, run.motion);
      if (o && o.data) judgeBoth(where, o.data, t.data); else fail(where, 'not reached on the base');
      for (const l of t.data.labels) { labelsSeen++; kindsSeen.add(l.kind); selsSeen.add(l.sel); }
    }
  }
}
for (const L of LABELS) if (!selsSeen.has(L.sel)) report.unverified.push(`${L.sel}: never rendered in the walked views` + (L.sel === '.o55-officialurl' ? ' (no renderer on this page draws it)' : ''));
const caps = {}; for (const run of report.runs) for (const p of ['cand']) { const P = run.pages[p];
  const all = [...Object.values(P.views || {}).flatMap((v) => (v.data ? v.data.capsules : [])), ...(P.tour || []).flatMap((t) => (t.data ? t.data.capsules : [])), ...Object.values(P.sweep || {}).flatMap((c) => (Array.isArray(c) ? c : []))];
  for (const c of all) { const k = c.cls + ' ' + (c.by || c.sig); caps[k] = (caps[k] || 0) + 1; } }
report.summary = { views, labels: labelsSeen, kinds: [...kindsSeen], selectors: [...selsSeen], failures: report.failures.length, errors: crashed, capsules: caps,
  contrastLow: report.contrastLow.length, unverified: report.unverified.length };
console.log('capsules on the candidate by class:'); for (const [k, n] of Object.entries(caps).sort()) console.log('  ' + k + ' x' + n);
for (const o of OPEN) if (Object.keys(caps).some((k) => k === 'open ' + o.sel)) console.log('OPEN ' + o.sel + ': ' + o.why);
for (const u of report.unverified) console.log('UNVERIFIED ' + u);
console.log(`contrast under 4.5:1 on the candidate (listed, not failed): ${report.contrastLow.length}`);
console.log(JSON.stringify(report.summary));
if (OUT) { mkdirSync(OUT, { recursive: true }); writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 1)); }
process.exit(crashed ? 2 : report.failures.length ? 1 : 0);
