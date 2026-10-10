#!/usr/bin/env node
/* pmx-verify.mjs -- the pmx lint (DESIGN-SPEC 10.1 step 7, amendment G-36, 10.4).
 *
 *   node tests/pmx-verify.mjs <surface-list> [--file index.html] [--json out.json]
 *        [--themes all|test|a,b] [--checks a,b] [--skip a,b]
 *        [--shots dir] [--crops dir] [--crop-cap n] [--no-crops] [--surfaces-dir dir]
 *        [--quick] [--verbose] [--list] [--once-first] [--once-all]
 *
 * <surface-list> is surface ids, globs (`gallery:*`) or tags (`@gallery`). With no
 * list, or with --list, it prints the registry and exits 2 (or 0 for --list).
 *
 * SURFACES. A surface is a named entry that knows how to put itself on screen.
 * Every `tests/pmx-surfaces/*.mjs` file (names starting with `_` are skipped) is
 * loaded; extra folders come from --surfaces-dir. A surface module default-exports
 * an array of surfaces, or a function `(factories) => array` where factories are
 * `wand(id, {group, sel, hover, title, common, roots})` and
 * `demo(id, {action, flow, drive, gap, thread, kind, then, tick, change, stream})`.
 * A package adds its own file; this core never needs editing. A surface is:
 *
 *   { id: 'pkg:name', title, kind: 'sheet'|'chat'|'view', tags: [],
 *     common: true,                     // sheet: the no-scroll rule (6.3) applies
 *     rosterScrollAfterYield: ['1280x800'],  // sheet: at these sizes the roster rows may scroll once every
 *                                       //   plate slot shows its leanest mode and the roster took lean 2
 *                                       //   (lead ruling, F0 review cycle 1: Crew 4 / 5 at 1280x800)
 *     layouts: ['pinned','closed','activity','w391','w311','pinned-1024x768','pinned-900x800'],
 *                                       // chat: transcript layouts to sweep (pinned-WxH: history
 *                                       //   pinned in a WxH window, the S-tier cards of 7.2)
 *     routes: [{within: '.pmx-team-row', min: 1, what}],  // where a stand-in must be disclosed (route-stack)
 *     sizes: [[1440,900], ...],         // optional override of the size sweep
 *     themes: [...],                    // optional override of --themes
 *     roots: 'css',                     // optional override of where the lint looks
 *     canon: ['Crew', {name: 'Open Panel', minCard: 360}],  // principle-10 names the blueprint shows
 *                                       //   (canon-names); minCard: required only while every run card is
 *                                       //   at least that wide (7.2: the S tier hides the kind word)
 *     setup(h), open(h, {theme, layout}), after(h),   // after = cleanup
 *     tick(h, i),                       // one work tick (default PM56_DEMO.tickOnce())
 *     change(h),                        // one state change (reduced-motion census)
 *     stream(h, markdown) -> {openView?: async fn}    // streaming realism
 *     edit(h) -> [what it did],         // sheet: the edit step of the effects ledger (default:
 *                                       //   type in the hero, one stepper +, one check, one switch word)
 *     ledger: false,                    // sheet: skip the effects ledger (default: run it)
 *     ledgerWays: ['cancel','escape','scrim','close'],  // how the ledger closes the sheet
 *     ledgerSpy: {'PM56_CREW.evaluate': 1} }   // functions the edit must reach (>= n calls), e.g.
 *                                       //   Crew Auto's "How it would decide" sample evaluation
 *
 * `h` is the helper set from tests/pmx-surfaces/_lib.mjs (page, ev, wait, theme, setSize,
 * chatLayout, closeAll, wandDialog, demo, drive, action, selectThread, openEditor,
 * closeEditor, settle, tickOnce, addScript). The checks run in ALL EIGHT themes (IMPACT
 * A2-25; canon F3-534, FGS 16) unless --themes says otherwise (`test` = the four test
 * themes basic-dark, basic-light, glass-light, retro-dark; `all` = eight; or a list);
 * --quick = basic-dark only, sizes 1440, 1280 and 700, no variant sweep, layouts pinned
 * and closed. Chat surfaces run in seven transcript layouts: history pinned (417 px cards
 * at 1440x900), closed (591), Activity pinned (~337), w391 / w311 (history pinned in
 * the window width that gives a 391 / 311 px card; the canon 390-590 px narrow chat states
 * of 10.1 step 7 and the 391 / 591 / 311 card widths of 10.4), and pinned-1024x768 /
 * pinned-900x800 (history pinned in those windows: 230 and 204 px cards, the S tier of 7.2,
 * whose "211 (1024 wide)" example no other layout reaches; F0 review cycle 2), then the size
 * sweep and the transcript variants in the first layout. The size sweep skips a size that a
 * pinned-WxH layout already covers when the first layout is `pinned`. The state checks (tick-height, reduced-census*,
 * streaming) and the variant sweep run in every theme (retro's own motion tokens can undo
 * reduced motion); --once-first runs them in the first theme only (a quicker local loop).
 * The effects ledger is behaviour, not look: it runs once per surface, in the first theme
 * (--once-all: in every theme).
 *
 * CHECKS (ids, in the order they run). Every check reads painted or laid-out
 * state in the page; nothing is judged from dispatch counts.
 *   present          the surface rendered its pmx roots (a sheet: exactly one)
 *   page-errors      no console errors and no page errors while it was up
 *   no-pill          G-36 pill rule
 *   no-stripe        G-36 side-stripe rule (+ thick top bars on boxes; pure line elements exempt)
 *   no-emoji         no emoji code points in text, attributes or ::before/::after
 *   no-missing-glyph G-11: no dashed unknown-glyph square anywhere
 *   h-overflow       no horizontal overflow at 1440, 900 and 700 wide
 *   clipped-text     no text cut off sideways except by a designed ellipsis; no text cut or hidden
 *                    vertically by a clipping box unless a line clamp's ellipsis shows (every root:
 *                    sheets, run cards in the transcript, the run view)
 *   sheet-in-viewport the sheet is inside the viewport at every size
 *   no-scroll        common sheets: no body/column scroll at 1440x900 and 1280x800
 *   no-spill         every sheet, every size: no body, column or Advanced region paints more
 *                    than 4 px past its own box (over the foot) -- it scrolls or it fits
 *   primary-pixel    every visible enabled primary button owns its centre pixel (a button under the app's
 *                    floating chrome at its scroller's edge is judged again in the middle of its scroller)
 *   plate-labels     no two plate label boxes intersect; no label box runs over a mark (seat or
 *                    You); labels stay inside the plate
 *   card-budget      run cards within the 7.2 height budgets for their width tier (S < 360, M < 520, L),
 *                    in every transcript layout, including the two S layouts at 1024x768 and 900x800
 *                    with history pinned (230 and 204 px cards: F0 review cycle 2); a theme family may
 *                    carry its own number (R-31: retro result faces 400 at M and L)
 *   route-stack      G-17 / D4: a stand-in disclosure (.collab-route-eff / .pmx-route-eff) keeps its fine print
 *                    ("requested X · effective Y") on its own line under the sentence: the .pmx-fine
 *                    box starts >= 3 px below the sentence's ink; a team row's stand-in must carry the
 *                    fine print; a surface's `routes` declares where a stand-in must be disclosed
 *   unique-controls  G-36 strict uniqueness per data-run / data-finding
 *   loop-census      <= 2 infinite animations on a live card, <= 1 on a run view, 0 elsewhere
 *   crowding         owner amendment J-2 item 7, at every size: text ink to lines/edges, control
 *                    padding, control spacing, overlapping or crowded text, line height, row and
 *                    button heights. Each hit: rule id, selector, text snippet, measured gap, the
 *                    minimum, and a 2x crop with the gap marked (see CROPS below).
 *   theme-font       owner amendment J-1: no @font-face family but Inter, Poppins, IBM Plex
 *                    Mono and JetBrains Mono; the word Newsreader nowhere in the document; every pmx
 *                    text computes to the theme family (Inter; Poppins in friendly; IBM Plex Mono in
 *                    retro), code is IBM Plex Mono in retro and JetBrains Mono elsewhere (never Plex
 *                    outside retro; J-1 correction; DL-161 amended 2026-10-09), --font-mono is scoped the same way, no
 *                    italics at all (markdown emphasis included; lead ruling 2026-09-27: no italic
 *                    face is embedded); document.fonts.check() passes and a
 *                    loaded face covers every weight used; the font that actually drew sampled
 *                    elements (CDP CSS.getPlatformFontsForNode) is that embedded face, with no
 *                    fallback glyphs from another font
 *   no-bleed         7.14 / G-35 on chat surfaces: no Chat WOW gradient, mask, halo, kind-badge
 *                    tile, initials or ticket stub on a pmx surface, and no one-sided border on
 *                    its transcript host; also run in transcript variants 0, 2, 3 and 4. The
 *                    surfaces are PM56_PMX.SURFACES (IMPACT A2-18: the one list), never a list here
 *   surfaces-list    IMPACT A2-18 on chat surfaces: PM56_PMX.SURFACES exists; every pmx transcript
 *                    item (a direct child of .transcript-inner, or the direct pmx child of a
 *                    [data-family] item) is one of them; the 7.14 coexistence block has a rule for
 *                    each of them
 *   forbidden-props  IMPACT A1-01/02/04/05/15 (10.1 step 7): no backdrop-filter, filter,
 *                    stroke-dashoffset or color-mix() in any computed pmx style: computed values
 *                    (a colour in color()/oklab()/oklch()/lab()/lch() form is what color-mix()
 *                    computes to), custom properties still holding color-mix(), running
 *                    animations' keyframes, and the pmx rules and @keyframes in the style sheets.
 *                    The preserved dropdown parts (DON'T 12) are exempt and counted
 *   canon-names      IMPACT A2-27a (D-10, principle 10): the canon names the surface declares
 *                    (`canon`) are in its visible text (not only in an aria-label or hover card),
 *                    and no visible text misspells a canon name (Brainstorm, Chat room,
 *                    Multi-pass review, Back-seat driver, Crew auto, Grill me, Eli5, Open panel,
 *                    Cancelled outside a run surface, ...), nor a recovery verb that is not canon's
 *                    (A1-34: Try again, Check again -> Retry; Open recovery -> Recover; E-36 B:
 *                    Used 1 of your rules -> Followed 1 of your rules). "Cancelled" is the run
 *                    spelling (9.0 rule 7, lead ruling 2026-09-28): text inside .pmx-run,
 *                    .pmx-receipt or .pmx-dock-line is exempt; scheduling keeps "Canceled".
 *   parts            6.6 (lead fix 2026-09-27): PM56_PMX.PARTS is exported and holds the spec's
 *                    vocabulary; every data-pmx-affects / data-pmx-part value is in it (a
 *                    `name:*` entry admits `name:<id>` values); pmx-system.css has a light rule
 *                    for every part and none for a name outside it
 *   harness-nodes    IMPACT A2-19: a [data-pmx-harness] node is never visible (the checks above
 *                    skip these nodes), below its show tier: the receipt title shows on a run card
 *                    >= 640 px wide (C13, R-21), so there it is exempt, and below 640 it must be hidden
 *   tick-height      card heights constant across 10 work ticks (same structure)
 *   reduced-census   IMPACT A1-03 (5.7): 0 running animations IMMEDIATELY after a state change
 *                    under reduced motion, and none started while it happens: a recorder armed
 *                    before the change counts CSS animations and transitions that start and WAAPI
 *                    calls on pmx targets, samples document.getAnimations() at once and every frame
 *                    for 500 ms, and counts ghosts and flights. reduced-census = the media query,
 *                    reduced-census-class = body.pm56-reduced. Counted: pmx targets and the transcript
 *                    hosts around them (.message:has(<a PM56_PMX.SURFACES item or .pmx-run>) and
 *                    everything inside it: the host's own arrive animation is motion around the card)
 *   streaming        a 1,500-word markdown message with code and a table: the card
 *                    stays in budget, nothing overflows, the run view renders <pre>
 *   effects-ledger   IMPACT A2-26 (canon MODAL-001, CW:987-991; 10.4 Honesty), every sheet:
 *                    open -> edit -> close, once per way (Cancel, Escape, the scrim, the x), in the
 *                    first theme: zero provider and Usage entries (collab providerCalls and
 *                    usageRecords, the BSD advisors' provider calls, cost and tokens) and no other
 *                    durable effect (collab effects, runs, thread messages, BSD assignments and
 *                    receipts, Teach and Memory records), both after the edit and after the close;
 *                    the sheet is gone (a sheet that swaps back, Crew Auto -> Crew, is closed with
 *                    its x and reported), the collab draft is null, and every ledgerSpy function
 *                    was reached. Where focus landed after the close is reported (6.7)
 * Scope (G-36): every check skips [data-pmx-preview], .pmx-ghost and [data-pmx-harness]
 * (a harness node at or above its show tier is design and is judged: the receipt title on a
 * run card >= 640 px);
 * sheets are read as `#pmOverlayRoot .pmx-sheet`.
 *
 * OUTPUT. FAIL/SKIP lines on stdout (PASS too with --verbose), a summary, and with
 * --json the full result list (a crowding failure's detail.hits lists every hit with
 * its geometry and crop). It never writes inside a git working tree or next to the
 * sources it tests (the gate mirror's sources are symlinks into one).
 * CROPS. Crowding hits are cropped to --crops <dir> (default: <json name>-crops/ next
 * to --json, else <shots>/crops/; --no-crops turns them off): a 2x PNG around the hit
 * with the measured gap drawn as a red bar (orange: an overlap). A hit out of view is
 * scrolled into view in its own scroll container and scrolled back after. The same
 * hit (rule + element + text) in the same surface and theme reuses its first crop; new
 * crops per lint pass are capped by --crop-cap (default 24; 0 = every hit), round-robin
 * over rules.
 * Exit 0 = no failures, 1 = failures, 2 = usage or harness error.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openApp, longMarkdown } from './pmx-surfaces/_lib.mjs';

const TESTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TESTS, '..');

/* ------------------------------------------------------------------ CLI */
/* run only as a program; importing this file (a probe, a package's own tool) just gets the exports */
const isMain = (() => { try { return fs.realpathSync(process.argv[1] || '') === fs.realpathSync(fileURLToPath(import.meta.url)); } catch (e) { return false; } })();
const argv = isMain ? process.argv.slice(2) : [];
const FLAGS_WITH_VALUE = new Set(['--file', '--json', '--themes', '--checks', '--skip', '--shots', '--crops', '--crop-cap', '--surfaces-dir']);
const opts = { surfacesDirs: [], patterns: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (FLAGS_WITH_VALUE.has(a)) {
    const v = argv[++i];
    if (v == null) usage('missing value for ' + a);
    if (a === '--surfaces-dir') opts.surfacesDirs.push(path.resolve(v)); else opts[a.slice(2)] = v;
  } else if (['--quick', '--verbose', '--list', '--no-crops', '--once-first', '--once-all', '--help', '-h'].includes(a)) opts[a.replace(/^-+/, '')] = true;
  else if (a.startsWith('--')) usage('unknown flag ' + a);
  else opts.patterns.push(a);
}
function usage(msg) {
  if (msg) console.error('pmx-verify: ' + msg);
  console.error('usage: node tests/pmx-verify.mjs <surface ids | globs | @tags> [--file index.html] [--json out.json] [--themes all|test|a,b] [--checks a,b] [--skip a,b] [--shots dir] [--crops dir] [--crop-cap n] [--no-crops] [--surfaces-dir dir] [--quick] [--verbose] [--list] [--once-first] [--once-all]');
  process.exit(2);
}
if (isMain && (opts.help || opts.h)) usage();

export const ALL_THEMES = ['basic-dark', 'basic-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'friendly-dark', 'friendly-light'];
export const TEST_THEMES = ['basic-dark', 'basic-light', 'glass-light', 'retro-dark'];
/* IMPACT A2-25: every check runs in all eight themes by default (the four test themes first) */
const THEME_ORDER = [...TEST_THEMES, 'friendly-dark', 'friendly-light', 'glass-dark', 'retro-light'];
const THEMES = opts.quick ? ['basic-dark'] : !opts.themes || opts.themes === 'all' ? THEME_ORDER : opts.themes === 'test' ? TEST_THEMES : opts.themes.split(',');
for (const t of THEMES) if (!ALL_THEMES.includes(t)) usage('unknown theme ' + t);
const CHECKS = ['present', 'page-errors', 'no-pill', 'no-stripe', 'no-emoji', 'no-missing-glyph', 'h-overflow', 'clipped-text', 'sheet-in-viewport', 'no-scroll', 'no-spill', 'primary-pixel',
  'plate-labels', 'card-budget', 'route-stack', 'unique-controls', 'loop-census', 'no-bleed', 'surfaces-list', 'forbidden-props', 'canon-names', 'parts', 'harness-nodes', 'crowding', 'theme-font',
  'tick-height', 'reduced-census', 'reduced-census-class', 'streaming', 'effects-ledger'];
/* chat transcript layouts (see the header); a wNNN layout finds the window width that gives an NNN px card */
const CHAT_LAYOUTS = opts.quick ? ['pinned', 'closed'] : ['pinned', 'closed', 'activity', 'w391', 'w311', 'pinned-1024x768', 'pinned-900x800'];
/* 10.4 (G-35): chat screens are checked in transcript variants 0, 2, 3 and 4 (variant family 5) */
const TRANSCRIPT_VARIANTS = [0, 2, 3, 4];
const want = new Set(opts.checks ? opts.checks.split(',') : CHECKS);
for (const c of (opts.skip ? opts.skip.split(',') : [])) want.delete(c);
for (const c of want) if (!CHECKS.includes(c)) usage('unknown check ' + c + ' (known: ' + CHECKS.join(', ') + ')');
const on = c => want.has(c);
const FILE = path.resolve(opts.file || path.join(ROOT, 'index.html'));

/* ------------------------------------------------------------------ never write into sources */
function nearestExisting(p) { let d = path.resolve(p); while (!fs.existsSync(d)) { const up = path.dirname(d); if (up === d) break; d = up; } return d; }
function insideGitTree(p) {
  for (let d = fs.realpathSync(nearestExisting(p)); ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, '.git'))) return d;
    if (path.dirname(d) === d) return null;
  }
}
function sourceDirs() {
  const out = new Set();
  for (const p of [...['module-shell.js', 'app.js', 'build.py', 'index.html'].map(n => path.join(ROOT, n)), FILE]) {
    try { out.add(path.dirname(fs.realpathSync(p))); } catch (e) { }
  }
  return [...out];
}
export function guardOut(p) {
  const abs = path.resolve(p);
  const real = path.join(fs.realpathSync(nearestExisting(abs)), path.relative(nearestExisting(abs), abs));
  const git = insideGitTree(abs);
  if (git) throw new Error('refusing to write ' + abs + ': it is inside the git working tree ' + git);
  for (const d of sourceDirs()) if (real === d || real.startsWith(d + path.sep)) throw new Error('refusing to write ' + abs + ': it is inside the source folder ' + d);
  return abs;
}

/* ------------------------------------------------------------------ spec numbers */
/* 7.2 budgets: live S 360 / M 346 / L 346 (lead ruling 2026-09-28: 340 and waiting 186 became 346 and 190, the sums of
   the primitives at the J-2 floor); attention and result S 400 / M 360 / L 360,
   raised by the spec's J-1/J-2 reference update ("heights that grew ... the 7.2 budgets
   follow these numbers"): needs-you 405 (at 417), BrainStorm live 347 (417 = M), live
   Crew 363 at 591 (L), Review result 361 at 591 (L). failed keeps 7.1's <= 360 at the M
   width; receipt is a 44 px row (C13) at every tier. starting, waiting and collapsed have
   no budget of their own in 7.2; they are held to the live budget of their tier, and their
   7.1 nominal height is reported as information.
   `kinds` overrides a density's tier for one card kind (data-pmx-kind). Lead ruling, F0 review cycle 1:
   a live Crew card at the M tier (417) is held to 363, the reference's live Crew height (the 347 M number
   is BrainStorm's); starting, waiting and collapsed Crew cards follow their live budget. */
const BUDGET = {
  live: { S: 360, M: 347, L: 363 }, attention: { S: 405, M: 405, L: 405 }, result: { S: 400, M: 360, L: 361 }, failed: { S: 400, M: 360, L: 360 },
  receipt: { S: 44, M: 44, L: 44 }, starting: { S: 360, M: 347, L: 363 }, waiting: { S: 360, M: 347, L: 363 }, collapsed: { S: 360, M: 347, L: 363 },
  kinds: { crew: { live: { M: 363 }, starting: { M: 363 }, waiting: { M: 363 }, collapsed: { M: 363 } },
    /* closing (SCHED C13 ruling): a scheduled message's Failed / Expired receipt wraps its reason to a second line at the
       S and M tiers rather than cut it (J-2); the one-line 44 px row holds from L */
    schedule: { receipt: { S: 84, M: 64, L: 44 } } },
  /* `themes` overrides by theme family (data-theme up to the first '-'). Lead ruling R-31 (F0 review cycle 2):
     retro result faces may run to 400 at M and L (the monospace headline takes both of its lines); S is 400
     already and every other budget is unchanged */
  themes: { retro: { result: { M: 400, L: 400 } } }
};
const NOMINAL = { starting: 190, waiting: 190, live: 346, collapsed: 120, attention: 360, result: 360, failed: 360, receipt: 44 };
const STRICT_UNIQUE = ['collab-review-toggle-finding', 'collab-review-create-todos', 'review-open-todos', 'review-export-report', 'review-report-view', 'review-demo-play', 'collab-modal-commit'];
const SIZES = {
  sheet: [[1440, 900], [1280, 800], [1024, 768], [900, 800], [700, 800]],
  chat: [[1440, 900], [900, 800], [700, 800]],
  view: [[1440, 900], [1280, 800], [900, 800], [700, 800]]
};
const NO_SCROLL_SIZES = ['1440x900', '1280x800'];

/* ------------------------------------------------------------------ in-page lint
   Serialized into the page by page.evaluate: it must not reference module scope. */
export function inPageLint(o) {
  const R = { roots: 0, results: {} };
  const isPmxEl = el => !!(el && el.classList && [...el.classList].some(c => c.indexOf('pmx-') === 0));
  /* G-36 scope, plus IMPACT A2-19: harness-only nodes are not design (harness-nodes checks they stay hidden),
     except a harness node at or above its show tier (SHOW_TIERS): there it is visible design and every check
     judges it (C13 / R-21: the receipt's run title on a run card at least 640 px wide) */
  const SHOW_TIERS = [{ sel: '.pmx-receipt-title', within: '.pmx-run', min: 640, rule: 'C13/R-21: the receipt title shows from a 640 px card' }];
  const tierOf = hn => { const t = SHOW_TIERS.find(x => hn.matches(x.sel)); const host = t ? hn.closest(t.within) : null; return t && host ? { t, host, w: Math.round(host.getBoundingClientRect().width * 10) / 10 } : null; };
  const atShowTier = hn => { const q = tierOf(hn); return !!(q && q.w >= q.t.min); };
  const skipped = el => {
    if (!el || !el.closest) return false;
    if (el.closest('[data-pmx-preview]') || el.closest('.pmx-ghost')) return true;
    const hn = el.closest('[data-pmx-harness]');
    return !!hn && !atShowTier(hn);
  };
  /* IMPACT A2-18: the one list of pmx transcript surfaces comes from the page, never from here */
  const PMX = window.PM56_PMX || null;
  const surfList = PMX && Array.isArray(PMX.SURFACES) && PMX.SURFACES.length ? PMX.SURFACES.map(String) : null;
  const toSel = s => /^[.#\[]/.test(s) ? s : '.' + s;
  const SURF = surfList ? surfList.map(toSel).join(', ') : '';
  /* every style rule in the document, flattened out of @media / @supports / @layer / @container (read once per page) */
  const allRules = () => {
    const sig = [...document.styleSheets].map(sh => { try { return sh.cssRules.length; } catch (e) { return -1; } }).join(',');
    if (window.__pmxvRules && window.__pmxvRules.sig === sig) return window.__pmxvRules.rules;
    const out = [];
    const walk = list => { for (const r of list) { if (r.cssRules && !(r instanceof CSSKeyframesRule)) walk(r.cssRules); out.push(r); } };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch (e) { } }
    window.__pmxvRules = { sig, rules: out }; return out;
  };
  const vw = innerWidth, vh = innerHeight;
  const name = el => {
    if (!el || !el.tagName) return String(el);
    const c = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || '';
    const k = el.getAttribute && (el.getAttribute('data-k') || el.getAttribute('data-menu-anchor'));
    return el.tagName.toLowerCase() + (c ? '.' + c.trim().split(/\s+/).slice(0, 3).join('.') : '') + (k ? '[' + (el.getAttribute('data-k') ? 'data-k' : 'anchor') + '=' + k + ']' : '');
  };
  const text = el => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  const alpha = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return c === 'transparent' ? 0 : 1; const p = m[1].split(/[\s,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
  const px = v => parseFloat(v) || 0;
  const shadows = v => { const out = []; let depth = 0, cur = ''; for (const ch of v) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && !depth) { out.push(cur); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur); return out.map(x => x.trim()); };
  /* one parsed box-shadow: {color, x, y, blur, spread, inset} */
  const shadowParts = sh => { const color = (sh.match(/rgba?\([^)]*\)/) || ['rgb(0, 0, 0)'])[0]; const n = sh.replace(/rgba?\([^)]*\)/, '').replace('inset', '').trim().split(/\s+/).map(px); return { color, x: n[0] || 0, y: n[1] || 0, blur: n[2] || 0, spread: n[3] || 0, inset: /\binset\b/.test(sh) }; };
  const CSS = new Map();
  const css = el => { let c = CSS.get(el); if (!c) { c = getComputedStyle(el); CSS.set(el, c); } return c; };
  const bwOf = (cs, s) => (cs['border' + s + 'Style'] === 'none' || cs['border' + s + 'Style'] === 'hidden') ? 0 : px(cs['border' + s + 'Width']);
  const effBgOf = el => { for (let p = el; p; p = p.parentElement) { const cs = css(p); if (cs.backgroundImage !== 'none') return 'img:' + cs.backgroundImage; if (alpha(cs.backgroundColor) > 0.02) return cs.backgroundColor; } return 'canvas'; };
  /* does the element paint a box of its own (a visible border, a fill that differs from what is behind it, or a ring shadow)? */
  const paintsBox = el => {
    const cs = css(el);
    if (['Top', 'Right', 'Bottom', 'Left'].some(sd => bwOf(cs, sd) >= 0.5 && alpha(cs['border' + sd + 'Color']) > 0.02)) return true;
    if (cs.backgroundImage !== 'none') return true;
    if (alpha(cs.backgroundColor) > 0.02 && cs.backgroundColor !== effBgOf(el.parentElement)) return true;
    return cs.boxShadow !== 'none' && shadows(cs.boxShadow).some(sh => { const q = shadowParts(sh); return alpha(q.color) > 0.02 && Math.abs(q.x) < 0.5 && Math.abs(q.y) < 0.5 && q.blur <= 1 && q.spread >= 0.5; });
  };
  const shown = el => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    if (el.checkVisibility) return el.checkVisibility({ visibilityProperty: true });
    return getComputedStyle(el).visibility !== 'hidden';
  };
  /* -- roots */
  let roots;
  if (o.roots) roots = [...document.querySelectorAll(o.roots)];
  else if (o.kind === 'sheet') roots = [...document.querySelectorAll('#pmOverlayRoot .pmx-sheet')];
  else if (o.kind === 'view') roots = [...document.querySelectorAll('.pmx-view')];
  else {
    roots = [...document.querySelectorAll('[class*="pmx-"]')].filter(el => isPmxEl(el) && !el.closest('#pmOverlayRoot') && !el.closest('.pmx-view'));
    roots = roots.filter(el => { for (let p = el.parentElement; p; p = p.parentElement) if (isPmxEl(p)) return false; return true; });
  }
  roots = roots.filter(el => !skipped(el) && !el.classList.contains('pmx-scrim'));
  R.roots = roots.length;
  R.rootNames = roots.slice(0, 40).map(name);
  const inRoots = el => roots.some(r => r === el || r.contains(el));
  const all = [];
  for (const r of roots) { all.push(r); for (const el of r.querySelectorAll('*')) if (!skipped(el)) all.push(el); }
  const html = all.filter(el => !(el instanceof SVGElement) || el.tagName.toLowerCase() === 'svg');
  const res = (id, pass, detail) => { R.results[id] = { pass, detail }; };
  const want = id => o.checks.indexOf(id) >= 0;

  /* -- no-pill (G-36) */
  if (want('no-pill')) {
    const bad = [];
    const radius = (v, w, h) => { const p = String(v).split(' '); const f = (s, b) => /%$/.test(s) ? parseFloat(s) / 100 * b : px(s); return Math.min(f(p[0], w), f(p[1] || p[0], h)); };
    const effBg = el => { for (let p = el; p; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.backgroundImage !== 'none') return 'img:' + cs.backgroundImage; if (alpha(cs.backgroundColor) > 0.02) return cs.backgroundColor; } return 'canvas'; };
    const edge = (cs, s) => { const w = cs['border' + s + 'Style'] === 'none' || cs['border' + s + 'Style'] === 'hidden' ? 0 : px(cs['border' + s + 'Width']); return w >= 0.5 && alpha(cs['border' + s + 'Color']) > 0.02 ? w + ' ' + cs['border' + s + 'Style'] + ' ' + cs['border' + s + 'Color'] : ''; };
    const borderSig = cs => ['Top', 'Right', 'Bottom', 'Left'].map(s => edge(cs, s)).join('|');
    /* a 0-offset, unblurred, spread box-shadow draws a ring: it outlines the shape like a border */
    const ringShadow = cs => cs.boxShadow !== 'none' && shadows(cs.boxShadow).some(sh => {
      const color = (sh.match(/rgba?\([^)]*\)/) || ['rgb(0, 0, 0)'])[0];
      const [x, y, blur = 0, spread = 0] = sh.replace(/rgba?\([^)]*\)/, '').replace('inset', '').trim().split(/\s+/).map(px);
      return alpha(color) > 0.02 && Math.abs(x) < 0.5 && Math.abs(y) < 0.5 && blur <= 1 && spread >= 0.5;
    });
    for (const el of html) {
      if (el.closest('.pmx-mark, kbd')) continue;
      const r = el.getBoundingClientRect();
      if (r.height <= 0 || r.height > 32 || r.width <= 0) continue;
      const hasText = (el.textContent || '').trim() !== '' || (el.getAttribute('aria-label') && !el.querySelector('svg'));
      if (!hasText) continue;
      const cs = getComputedStyle(el);
      const rr = Math.min(...['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(c => radius(cs['border' + c + 'Radius'], r.width, r.height)), Math.min(r.width, r.height) / 2);
      if (rr < r.height / 2 - 0.5) continue;
      const own = cs.backgroundImage !== 'none' || alpha(cs.backgroundColor) > 0.02;
      const fill = own && (cs.backgroundImage !== 'none' || cs.backgroundColor !== effBg(el.parentElement));
      const bs = borderSig(cs), line = bs.replace(/\|/g, '') !== '' && (!el.parentElement || bs !== borderSig(getComputedStyle(el.parentElement)));
      const ring = ringShadow(cs);
      if (!shown(el)) continue;
      if (fill || line || ring) bad.push({ el: name(el), text: text(el), h: Math.round(r.height), radius: Math.round(rr), fill, border: line, ring });
    }
    res('no-pill', bad.length === 0, bad.slice(0, 20));
  }

  /* -- no-stripe (G-36). A stripe is: left/right border widths differ; left/right border
        colours differ while either is non-zero; a one-sided inset box-shadow (a vertical
        one on any offset in x, a horizontal one thicker than 1.5 px unless it is a bottom
        underline at least 4x as wide as tall); a top border thicker than 1.5 px that the
        bottom does not match (a top bar), or a thick bottom border on a box narrower than
        4x its thickness; a ::before/::after bar absolutely positioned on the left or right
        edge that is taller than wide. Allowed: .pmx-diff / .pmx-add / .pmx-del (diff
        gutters). Horizontal hairlines above and below are never stripes. */
  if (want('no-stripe')) {
    const bad = [];
    const bw = (cs, s) => (cs['border' + s + 'Style'] === 'none' || cs['border' + s + 'Style'] === 'hidden') ? 0 : px(cs['border' + s + 'Width']);
    const visibleC = c => alpha(c) > 0.02;
    for (const el of html) {
      if (el.closest('.pmx-diff, .pmx-add, .pmx-del')) continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      const L = bw(cs, 'Left'), Rt = bw(cs, 'Right'), T = bw(cs, 'Top'), Bt = bw(cs, 'Bottom');
      const why = [];
      /* a pure line element (its box is no wider / taller than its borders + 2 px: a legend line
         sample, a rule, a connector) draws a line, not a box with a coloured side */
      const boxW = r.width - L - Rt > 2, boxH = r.height - T - Bt > 2;
      if (boxW && Math.abs(L - Rt) > 0.5 && (visibleC(cs.borderLeftColor) || visibleC(cs.borderRightColor))) why.push('left/right border widths ' + L + '/' + Rt);
      else if (boxW && (L > 0 || Rt > 0) && cs.borderLeftColor !== cs.borderRightColor) why.push('left/right border colours ' + cs.borderLeftColor + ' / ' + cs.borderRightColor);
      if (boxH && T > 1.5 && Math.abs(T - Bt) > 0.5 && visibleC(cs.borderTopColor)) why.push('top bar ' + T + 'px');
      if (boxH && Bt > 1.5 && Math.abs(T - Bt) > 0.5 && visibleC(cs.borderBottomColor) && r.width < 4 * Bt) why.push('thick bottom on a narrow box ' + Bt + 'px');
      if (cs.boxShadow && cs.boxShadow !== 'none') {
        for (const s of shadows(cs.boxShadow)) {
          if (!/\binset\b/.test(s)) continue;
          const color = (s.match(/rgba?\([^)]*\)/) || ['rgb(0,0,0)'])[0];
          if (!visibleC(color)) continue;
          const n = s.replace(/rgba?\([^)]*\)/, '').replace('inset', '').trim().split(/\s+/).map(px);
          const [x, y, blur = 0, spread = 0] = n;
          if (Math.abs(x) > 0.5) why.push('one-sided inset shadow x=' + x);
          else if (Math.abs(y) > 1.5 && (y > 0 || r.width < 4 * Math.abs(y)) && spread <= 0) why.push('inset bar y=' + y);
        }
      }
      /* the same bar drawn by a real element: absolutely positioned on the left or right edge of its box, taller than wide */
      if ((cs.position === 'absolute' || cs.position === 'fixed') && el.offsetParent && (visibleC(cs.backgroundColor) || cs.backgroundImage !== 'none') && r.height > r.width && r.width <= 8 && r.height >= 12) {
        const pb = el.offsetParent.getBoundingClientRect();
        if (r.left - pb.left <= 2 || pb.right - r.right <= 2) why.push('edge bar element ' + Math.round(r.width) + 'x' + Math.round(r.height));
      }
      for (const pe of ['::before', '::after']) {
        const p = getComputedStyle(el, pe);
        if (!p || p.content === 'none' || p.content === 'normal' || p.display === 'none') continue;
        if (p.position !== 'absolute' && p.position !== 'fixed') continue;
        const painted = visibleC(p.backgroundColor) || p.backgroundImage !== 'none' || ['Left', 'Right', 'Top', 'Bottom'].some(s => bw(p, s) > 0 && visibleC(p['border' + s + 'Color']));
        if (!painted) continue;
        let w = px(p.width), h = px(p.height);
        if (!w && p.left !== 'auto' && p.right !== 'auto') w = r.width - px(p.left) - px(p.right);
        if (!h && p.top !== 'auto' && p.bottom !== 'auto') h = r.height - px(p.top) - px(p.bottom);
        const atEdge = (p.left !== 'auto' && px(p.left) <= 2) || (p.right !== 'auto' && px(p.right) <= 2);
        if (h > w && w > 0 && w <= 8 && atEdge) why.push(pe + ' vertical bar ' + w + 'x' + h);
      }
      if (why.length && shown(el)) bad.push({ el: name(el), why });
    }
    res('no-stripe', bad.length === 0, bad.slice(0, 20));
  }

  /* -- no-emoji (DON'T 3) */
  if (want('no-emoji')) {
    const EMO = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}\u{1F1E6}-\u{1F1FF}]/u;
    const bad = [];
    const cp = s => [...s].filter(c => EMO.test(c)).map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).slice(0, 4);
    for (const r of roots) {
      const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) if (EMO.test(n.nodeValue) && !skipped(n.parentElement)) bad.push({ in: name(n.parentElement), cp: cp(n.nodeValue), text: n.nodeValue.trim().slice(0, 40) });
    }
    for (const el of all) {
      for (const a of ['aria-label', 'title', 'placeholder', 'alt', 'value', 'data-hover', 'data-tip']) { const v = el.getAttribute && el.getAttribute(a); if (v && EMO.test(v)) bad.push({ in: name(el), attr: a, cp: cp(v) }); }
      if (el.value && typeof el.value === 'string' && EMO.test(el.value)) bad.push({ in: name(el), prop: 'value', cp: cp(el.value) });
      if (!(el instanceof SVGElement)) for (const pe of ['::before', '::after']) { const c = getComputedStyle(el, pe).content; if (c && c !== 'none' && c !== 'normal' && EMO.test(c)) bad.push({ in: name(el) + pe, cp: cp(c) }); }
    }
    res('no-emoji', bad.length === 0, bad.slice(0, 20));
  }

  /* -- no-missing-glyph (G-11): anywhere in the document */
  if (want('no-missing-glyph')) {
    const miss = [...document.querySelectorAll('.pmx-glyph-missing')].filter(el => !el.closest('.pmx-ghost'));
    res('no-missing-glyph', miss.length === 0, miss.slice(0, 12).map(el => ({ glyph: el.getAttribute('data-glyph'), in: name(el.parentElement) })));
  }

  /* -- h-overflow */
  if (want('h-overflow')) {
    const bad = [];
    const de = document.scrollingElement || document.documentElement;
    if (de.scrollWidth > de.clientWidth + 1) bad.push({ page: 'document scrolls sideways', scrollWidth: de.scrollWidth, clientWidth: de.clientWidth });
    for (const r of roots) {
      const b = r.getBoundingClientRect();
      if (shown(r) && (b.left < -0.5 || b.right > vw + 0.5)) bad.push({ root: name(r), outside: [Math.round(b.left), Math.round(b.right)], vw });
      /* visible overflow spills; auto/scroll is an inner scroller (judged below); hidden/clip is clipped-text's business */
      const ox = getComputedStyle(r).overflowX;
      if (ox === 'visible' && r.scrollWidth > Math.ceil(b.width) + 1 && getComputedStyle(r).display !== 'contents') bad.push({ root: name(r), contentWider: r.scrollWidth, width: Math.round(b.width) });
      else if ((ox === 'auto' || ox === 'scroll') && r.scrollWidth > r.clientWidth + 1) bad.push({ root: name(r), innerScroll: [r.scrollWidth, r.clientWidth] });
    }
    const SCROLLERS = 'pre, textarea, input, .pmx-table-wrap, .pmx-code';
    for (const el of html) {
      if (el === document.body) continue;
      const cs = getComputedStyle(el);
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1 && !el.matches(SCROLLERS) && shown(el)) bad.push({ el: name(el), innerScroll: [el.scrollWidth, el.clientWidth] });
    }
    for (const sel of (o.containers || [])) for (const c of document.querySelectorAll(sel)) if (c.scrollWidth > c.clientWidth + 1 && shown(c)) bad.push({ container: name(c), scrollWidth: c.scrollWidth, clientWidth: c.clientWidth });
    res('h-overflow', bad.length === 0, bad.slice(0, 20));
  }

  /* -- clipped-text: text cut sideways by an overflow box with no ellipsis */
  if (want('clipped-text')) {
    const bad = [];
    for (const el of html) {
      const cs = getComputedStyle(el);
      if (!/hidden|clip/.test(cs.overflowX) || el.scrollWidth <= el.clientWidth + 1) continue;
      if (cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none')) continue;
      if (el.matches('input, textarea, select, svg')) continue;
      const b = el.getBoundingClientRect();
      if (b.width <= 2 || b.height <= 2 || !shown(el)) continue;
      const right = b.left + el.clientLeft + el.clientWidth;
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let cut = null;
      for (let n = tw.nextNode(); n && !cut; n = tw.nextNode()) {
        if (!n.nodeValue.trim()) continue;
        const pe = n.parentElement;
        if (pe !== el) { const pcs = getComputedStyle(pe); if (pcs.textOverflow === 'ellipsis' || (pcs.webkitLineClamp && pcs.webkitLineClamp !== 'none')) continue; }
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const rr of rg.getClientRects()) if (rr.width > 0 && rr.right > right + 1 && rr.left < right + 400) { cut = { text: n.nodeValue.trim().slice(0, 40), by: Math.round(rr.right - right) }; break; }
      }
      if (cut) bad.push({ el: name(el), ...cut });
    }
    /* vertically (review cycle 1: the S-tier sentence box stayed 37 px while its text clamped at 3 lines, so the
       third line and its ellipsis were cut away): a box that clips vertically (overflow-y hidden/clip, which a
       -webkit-line-clamp box is) and holds more than it shows fails when
         - a line of its text is cut mid-height by the box's edge, or
         - a line is hidden and no ellipsis is visible: the box is not a line clamp, or its clamp line does not
           fit (content height < clamp x line-height).
       A line hidden by an inner clipping box is that box's business (it is judged there), so the sentence's
       third line counts against the fixed-height sentence box, not against its 3-line clamp. Text in SVG,
       inputs, harness nodes and invisible elements (visibility, opacity 0, display none) is not judged. */
    const clipY = cs => /hidden|clip/.test(cs.overflowY);
    const lhOf = cs => { const v = px(cs.lineHeight); return v > 0 ? v : 1.2 * px(cs.fontSize); };
    const visible = e => e.checkVisibility ? e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : getComputedStyle(e).visibility !== 'hidden';
    /* a text rect is the font's content area; judge the glyphs' ink (a tight line-height puts the content area
       past a box that cuts no glyph) */
    const cv = document.createElement('canvas').getContext('2d');
    const inkPad = (pe, t) => {
      const pcs = getComputedStyle(pe); cv.font = pcs.fontStyle + ' ' + pcs.fontWeight + ' ' + pcs.fontSize + ' ' + pcs.fontFamily;
      const m = cv.measureText(t);
      return { t: Math.max(0, (m.fontBoundingBoxAscent || 0) - m.actualBoundingBoxAscent), b: Math.max(0, (m.fontBoundingBoxDescent || 0) - m.actualBoundingBoxDescent) };
    };
    for (const el of html) {
      if (el.matches('input, textarea, select, svg') || el === document.body) continue;
      const cs = getComputedStyle(el);
      if (!clipY(cs) || el.scrollHeight <= el.clientHeight + 1) continue;
      const b = el.getBoundingClientRect();
      if (b.width <= 2 || b.height <= 2 || !shown(el)) continue;
      const top = b.top + el.clientTop, bot = top + el.clientHeight;
      const clampN = parseInt(cs.webkitLineClamp, 10) || 0;
      const contentH = el.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom);
      const clampFits = clampN > 0 && contentH >= clampN * lhOf(cs) - 1;
      let cutLine = null, hidden = null;
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n && !cutLine; n = tw.nextNode()) {
        if (!n.nodeValue.trim()) continue;
        const pe = n.parentElement;
        if (!pe || pe.closest('svg') || skipped(pe) || !visible(pe)) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        const pad = inkPad(pe, n.nodeValue.trim());
        for (const rr of rg.getClientRects()) {
          if (rr.width <= 0 || rr.height <= 0) continue;
          const it = rr.top + pad.t, ib = rr.bottom - pad.b;
          if (ib <= it) continue;
          let inner = false;
          for (let q = pe; q && q !== el; q = q.parentElement) {
            const qcs = getComputedStyle(q);
            if (!clipY(qcs)) continue;
            const qb = q.getBoundingClientRect(), qt = qb.top + q.clientTop, qbt = qt + q.clientHeight;
            if (it >= qbt - 1 || ib <= qt + 1 || qb.width <= 2 || qb.height <= 2) { inner = true; break; }
          }
          if (inner || (it >= top - 1 && ib <= bot + 1)) continue;
          const txt = n.nodeValue.trim().slice(0, 40);
          if ((it < bot - 1 && ib > bot + 1) || (it < top - 1 && ib > top + 1)) { cutLine = { textNode: txt, lineCut: ib > bot + 1 ? 'bottom' : 'top', by: Math.round((ib > bot + 1 ? ib - bot : top - it) * 10) / 10 }; break; }
          if (!hidden) hidden = { textNode: txt, hiddenBelow: Math.round((it - bot) * 10) / 10 };
        }
      }
      const box = { box: [Math.round(b.width), Math.round(el.clientHeight)], scrollHeight: el.scrollHeight, clamp: clampN || undefined, lineHeight: clampN ? Math.round(lhOf(cs) * 10) / 10 : undefined };
      if (cutLine) bad.push({ el: name(el), vertical: 'line cut mid-height', ...cutLine, ...box });
      else if (hidden && !clampFits) bad.push({ el: name(el), vertical: clampN ? 'clamp line does not fit, so no ellipsis shows' : 'text hidden with no ellipsis', ...hidden, ...box });
    }
    res('clipped-text', bad.length === 0, bad.slice(0, 20));
  }

  /* -- sheet-in-viewport */
  if (want('sheet-in-viewport') && o.kind === 'sheet') {
    const bad = roots.map(r => ({ r, b: r.getBoundingClientRect() })).filter(x => x.b.left < -0.5 || x.b.top < -0.5 || x.b.right > vw + 0.5 || x.b.bottom > vh + 0.5)
      .map(x => ({ sheet: name(x.r), rect: [x.b.left, x.b.top, x.b.width, x.b.height].map(Math.round), viewport: [vw, vh] }));
    res('sheet-in-viewport', roots.length > 0 && bad.length === 0, bad.length ? bad : (roots.length ? undefined : 'no sheet'));
  }

  /* -- no-scroll (6.3 rule 1): common case, 1440x900 and 1280x800 */
  /* o.rosterAfterYield (lead ruling, F0 review cycle 1: "Crew 4 and Crew 5 may scroll at 1280 after yielding"):
     at this size the roster's rows may scroll, but only once the sheet has yielded everything first (6.3 order,
     J-2): every plate fit slot shows its leanest mode and the roster has taken both lean steps (data-pmx-lean 2:
     column helpers, then the rows' fine lines, dropped). Otherwise the rows' scroll is a failure as before. */
  if (want('no-scroll') && o.kind === 'sheet' && o.noScroll) {
    const bad = [], allowed = [];
    for (const r of roots) {
      const regions = [r, ...r.querySelectorAll('.pmx-body, .pmx-col, .pmx-advpage, .pmx-advgrid' + (o.rosterMayScroll ? '' : ', .pmx-roster-rows'))];
      for (const el of regions) {
        if (skipped(el) || !shown(el)) continue;
        const oy = getComputedStyle(el).overflowY;
        /* a scroller or a clipping box that holds more than it shows; a visible box that spills 4 px or more over what follows */
        if (!(oy !== 'visible' ? el.scrollHeight > el.clientHeight + 1 : el.scrollHeight > el.clientHeight + 4)) continue;
        const rec = { region: name(el), scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, overflowY: oy };
        if (o.rosterAfterYield && el.matches('.pmx-roster-rows')) {
          /* 2026-10-09 (Jared: "it pushes the graph out of view"): a slot yields down to its floor, the leanest drawing
             that fits its width (the runtime's data-floor), not to its caption; a slot with no floor yields to its leanest */
          const fits = [...r.querySelectorAll('.pmx-plate-fit')].map(f => { const modes = [...f.querySelectorAll(':scope > .pmx-plate')].map(p => p.getAttribute('data-mode')); return { fit: f.getAttribute('data-fit') || '', floor: f.getAttribute('data-floor') || '', leanest: modes[modes.length - 1] || '' }; });
          const roster = el.closest('.pmx-roster'), lean = roster ? roster.getAttribute('data-pmx-lean') || '' : '';
          const yielded = fits.every(f => f.fit && f.fit === (f.floor || f.leanest)) && lean === '2';
          (yielded ? allowed : bad).push(Object.assign(rec, { afterYield: yielded ? 'allowed (lead ruling: may scroll at this size after yielding)' : 'scrolls before the sheet yielded', plates: fits, lean }));
          continue;
        }
        bad.push(rec);
      }
    }
    const de = document.scrollingElement || document.documentElement;
    if (de.scrollHeight > de.clientHeight + 1) bad.push({ page: 'document scrolls', scrollHeight: de.scrollHeight, clientHeight: de.clientHeight });
    res('no-scroll', bad.length === 0, bad.length ? bad.slice(0, 12) : (allowed.length ? { rowsScrollAfterYield: allowed } : undefined));
  }

  /* -- no-spill: sheet regions never paint their content over the foot (any sheet, any size) */
  if (want('no-spill') && o.kind === 'sheet') {
    const bad = [];
    for (const r of roots) for (const el of [r, ...r.querySelectorAll('.pmx-body, .pmx-col, .pmx-advpage, .pmx-advgrid, .pmx-roster-rows')]) {
      if (skipped(el) || !shown(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.overflowY === 'visible' && el.scrollHeight > el.clientHeight + 4) bad.push({ region: name(el), scrollHeight: el.scrollHeight, clientHeight: el.clientHeight });
    }
    res('no-spill', bad.length === 0, bad.slice(0, 8));
  }

  /* -- plate-labels */
  if (want('plate-labels')) {
    const bad = [];
    let plates = 0;
    for (const r of roots) for (const svg of r.querySelectorAll('svg.pmx-plate-svg')) {
      if (skipped(svg) || !shown(svg)) continue;
      plates++;
      const sb = svg.getBoundingClientRect();
      /* SVG text, and the HTML words a foreignObject sets (paper(): one box per element that holds text) */
      const foEls = [...svg.querySelectorAll('foreignObject *')].filter(e => [...e.childNodes].some(c => c.nodeType === 3 && c.nodeValue.trim()));
      const labs = [...svg.querySelectorAll('text'), ...foEls].map(t => ({ t, b: t.getBoundingClientRect(), s: (t.textContent || '').trim() })).filter(x => x.b.width > 0 && x.b.height > 0 && x.s);
      const marks = [...svg.querySelectorAll('.pmx-p-mark')].map(m => ({ b: m.getBoundingClientRect(), n: (m.closest('.pmx-p-seat, .pmx-p-you') ? name(m.closest('.pmx-p-seat, .pmx-p-you')) : 'mark') + '[' + (m.getAttribute('data-sil') || '') + ']' })).filter(x => x.b.width > 0 && x.b.height > 0);
      for (let i = 0; i < labs.length; i++) {
        const a = labs[i].b;
        if (a.left < sb.left - 1 || a.right > sb.right + 1 || a.top < sb.top - 1 || a.bottom > sb.bottom + 1) bad.push({ outside: labs[i].s, rect: [a.left - sb.left, a.top - sb.top, a.width, a.height].map(Math.round), plate: [Math.round(sb.width), Math.round(sb.height)] });
        for (let j = i + 1; j < labs.length; j++) {
          const b = labs[j].b;
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 1 && oy > 1) bad.push({ collide: [labs[i].s, labs[j].s], overlap: [Math.round(ox), Math.round(oy)] });
        }
        /* review cycle 1: a label never runs over a mark (a seat or You): the 5-helper strip's "one checked
           result" lay over the sixth mark. The mark's box is its drawn silhouette's bounding box. */
        for (const m of marks) {
          const ox = Math.min(a.right, m.b.right) - Math.max(a.left, m.b.left), oy = Math.min(a.bottom, m.b.bottom) - Math.max(a.top, m.b.top);
          if (ox > 1 && oy > 1) bad.push({ overMark: labs[i].s, mark: m.n, overlap: [Math.round(ox), Math.round(oy)] });
        }
      }
    }
    res('plate-labels', bad.length === 0, bad.length ? bad.slice(0, 16) : { plates });
  }

  /* -- card-budget (7.2) */
  if (want('card-budget') && o.budget) {
    const bad = [], seen = [];
    for (const r of roots) for (const card of (r.matches('.pmx-run') ? [r] : r.querySelectorAll('.pmx-run'))) {
      if (skipped(card) || !shown(card)) continue;
      const b = card.getBoundingClientRect();
      const tier = b.width < 360 ? 'S' : b.width < 520 ? 'M' : 'L';
      const d = card.getAttribute('data-density') || 'live', kind = card.getAttribute('data-pmx-kind') || '';
      const byKind = o.budget.kinds && o.budget.kinds[kind] && o.budget.kinds[kind][d];
      /* a theme family's own number (R-31 ruling: retro result faces) wins over the kind and the density */
      const fam = (document.body.getAttribute('data-theme') || '').split('-')[0];
      const byTheme = o.budget.themes && o.budget.themes[fam] && o.budget.themes[fam][d];
      const lim = byTheme && byTheme[tier] != null ? byTheme[tier] : byKind && byKind[tier] != null ? byKind[tier] : ((d !== 'kinds' && d !== 'themes' && o.budget[d]) || o.budget.live)[tier];
      const rec = { card: card.getAttribute('data-k'), kind: kind || undefined, density: d, tier, w: Math.round(b.width), h: Math.round(b.height * 10) / 10, budget: lim, nominal391: o.nominal[d], ...(byTheme && byTheme[tier] != null ? { rule: fam + ' ' + d + ' ' + tier } : {}) };
      seen.push(rec);
      if (b.height > lim + 0.5) bad.push(rec);
    }
    res('card-budget', bad.length === 0, bad.length ? bad : seen);
  }

  /* -- route-stack (G-17 / D4 amendment; F0 review cycle 2). The stand-in disclosure is a sentence with its fine
        print ("requested X · effective Y") on a line of its own UNDER it: the fine print's box starts at least 3 px
        below the sentence's ink. The legacy `.collab-route-eff{display:inline-flex}` put it beside the sentence
        (two 3-line columns in every theme), which no geometric rule caught. Every `.collab-route-eff` whose
        `.pmx-fine` shows is judged (team rows, the participant head, the roster's stand-in line); inside a team
        row the fine print is required (D4 shape). A surface's `routes: [{within, min, what}]` declares where a
        stand-in must be disclosed, so a builder that drops the hook fails here instead of passing by absence. */
  if (want('route-stack')) {
    const bad = [], seen = [];
    const cv2 = document.createElement('canvas').getContext('2d');
    /* the sentence's ink bottom: its own text (not the fine print, not an icon), per line box, from the font's
       real descent (canvas measureText with the element's font), as crowding measures ink */
    const sentenceInk = (host, fine) => {
      let top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity, chars = '';
      const tw = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const t = n.nodeValue; if (!t.trim()) continue;
        const el = n.parentElement;
        if (!el || (fine && fine.contains(el)) || el.closest('svg, .pmx-sr') || !shown(el)) continue;
        const cs = css(el);
        cv2.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        const m = cv2.measureText(t.trim()), fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const rr of rg.getClientRects()) {
          if (rr.width < 1 || rr.height < 1) continue;
          const k = fa + fd > 0 ? rr.height / (fa + fd) : 1, base = rr.top + fa * k;
          top = Math.min(top, base - m.actualBoundingBoxAscent * k); bottom = Math.max(bottom, base + m.actualBoundingBoxDescent * k);
          left = Math.min(left, rr.left); right = Math.max(right, rr.right);
        }
        chars += t;
      }
      return { top, bottom, left, right, text: chars.replace(/\s+/g, ' ').trim().slice(0, 60) };
    };
    const found = [];
    /* .collab-route-eff (a Collaboration kind) or .pmx-route-eff (the builder's own class, every kind): one line each */
    const EFF = '.collab-route-eff, .pmx-route-eff';
    for (const r of roots) for (const eff of (r.matches(EFF) ? [r] : r.querySelectorAll(EFF))) {
      if (skipped(eff) || !shown(eff) || (eff.parentElement && eff.parentElement.closest(EFF))) continue;
      found.push(eff);
      const row = eff.closest('.pmx-team-row');
      const fine = eff.querySelector('.pmx-fine');
      const rec = { el: name(eff), in: row ? name(row) : name(eff.parentElement), text: text(eff) };
      if (!fine) { if (row) bad.push(Object.assign(rec, { problem: 'team row stand-in without its fine print (D4: <span class="pmx-fine">requested X · effective Y</span>)' })); else seen.push(Object.assign(rec, { fine: 'none' })); continue; }
      if (!shown(fine)) { seen.push(Object.assign(rec, { fine: 'hidden (designed drop)' })); continue; }
      const ink = sentenceInk(eff, fine), fb = fine.getBoundingClientRect();
      if (!isFinite(ink.bottom)) { bad.push(Object.assign(rec, { problem: 'fine print with no stand-in sentence' })); continue; }
      const gap = Math.round((fb.top - ink.bottom) * 10) / 10;
      Object.assign(rec, { sentence: ink.text, fineText: text(fine), sentenceInkBottom: Math.round(ink.bottom * 10) / 10, fineTop: Math.round(fb.top * 10) / 10, gap, min: 3 });
      /* beside: the fine print shares the sentence's lines and stands clear of its ink sideways (the inline-flex columns) */
      const beside = fb.top < ink.bottom && (fb.left >= ink.right - 1 || fb.right <= ink.left + 1);
      if (fb.top + 0.01 < ink.bottom + 3) bad.push(Object.assign(rec, { problem: beside ? 'fine print beside the sentence, not under it' : fb.top < ink.bottom ? 'fine print overlaps the sentence ink' : 'fine print starts less than 3 px under the sentence ink' }));
      else seen.push(rec);
    }
    for (const want2 of (o.routes || [])) {
      const n = found.filter(e => e.closest(want2.within)).length;
      if (n < (want2.min || 1)) bad.push({ missing: want2.what || want2.within, within: want2.within, found: n, min: want2.min || 1, problem: 'the surface declares a stand-in here; no .collab-route-eff / .pmx-route-eff is emitted' });
    }
    res('route-stack', bad.length === 0, bad.length ? bad.slice(0, 16) : seen.length ? seen : 'no stand-in on this surface');
  }

  /* -- unique-controls (G-36 strict uniqueness; 7.12) */
  if (want('unique-controls')) {
    const bad = [];
    const dups = {};
    for (const a of o.strictUnique) {
      const groups = {};
      for (const el of document.querySelectorAll('[data-action="' + a + '"]')) {
        if (skipped(el) || !shown(el)) continue;
        const k = [el.getAttribute('data-run'), el.getAttribute('data-finding')].filter(Boolean).join('/') || '(no run)';
        (groups[k] = groups[k] || []).push(name(el));
      }
      for (const [k, list] of Object.entries(groups)) if (list.length > 1) bad.push({ action: a, key: k, count: list.length, where: list.slice(0, 4) });
    }
    for (const el of document.querySelectorAll('[data-action][data-run], [data-action][data-finding]')) {
      if (skipped(el) || !shown(el) || !inRoots(el) || el.getAttribute('data-action') === 'noop') continue;
      const k = el.getAttribute('data-action') + ' ' + [...el.attributes].filter(a => /^data-(run|finding|participant|row|value|tab|kind)$/.test(a.name)).map(a => a.name.slice(5) + '=' + a.value).join(' ');
      dups[k] = (dups[k] || 0) + 1;
    }
    const other = Object.entries(dups).filter(([, n]) => n > 1).map(([k, n]) => k + ' x' + n);
    res('unique-controls', bad.length === 0, bad.length ? { strict: bad, otherRepeats: other.slice(0, 12) } : (other.length ? { otherRepeats: other.slice(0, 12) } : undefined));
  }

  /* -- loop-census (5.6): only animations whose target is inside a pmx surface */
  if (want('loop-census')) {
    const live = document.getAnimations().filter(a => a.effect && a.effect.target && a.playState !== 'finished' && a.playState !== 'idle' && a.effect.getTiming().iterations === Infinity);
    const buckets = new Map();
    const topPmx = el => { let top = null; for (let p = el; p; p = p.parentElement) if (isPmxEl(p)) top = p; return top; };
    for (const a of live) {
      const t = a.effect.target;
      if (skipped(t)) continue;
      const host = t.closest('.pmx-run') || t.closest('.pmx-view') || topPmx(t);
      if (!host) continue;
      const b = buckets.get(host) || []; b.push(a.animationName || a.id || (a.effect.getKeyframes()[0] ? Object.keys(a.effect.getKeyframes()[0]).filter(k => !/^(offset|easing|composite|computedOffset)$/.test(k)).join('+') : 'animation')); buckets.set(host, b);
    }
    const bad = [], seen = [];
    for (const [host, names] of buckets) {
      const limit = host.matches('.pmx-run[data-density="live"]') ? 2 : host.matches('.pmx-view') ? 1 : 0;
      const rec = { host: name(host), density: host.getAttribute('data-density'), infinite: names.length, limit, names: names.slice(0, 6) };
      seen.push(rec);
      if (names.length > limit) bad.push(rec);
    }
    res('loop-census', bad.length === 0, bad.length ? bad : seen);
  }

  /* -- no-bleed (7.14): the Chat WOW family styling never reaches a pmx surface */
  if (want('no-bleed') && o.kind === 'chat') {
    const bad = [];
    if (!SURF) bad.push({ surfaces: 'PM56_PMX.SURFACES is missing or empty: nothing to judge (IMPACT A2-18)' });
    const list = [];
    if (SURF) for (const r of roots) { if (r.matches(SURF)) list.push(r); for (const x of r.querySelectorAll(SURF)) if (!skipped(x)) list.push(x); }
    for (const sf of list) {
      if (!sf.closest('.transcript-inner')) continue;
      const cs = getComputedStyle(sf), nm = name(sf);
      if (/gradient/.test(cs.backgroundImage)) bad.push({ surface: nm, gradient: cs.backgroundImage.slice(0, 80) });
      const mask = cs.maskImage || cs.webkitMaskImage;
      if (mask && mask !== 'none') bad.push({ surface: nm, mask: mask.slice(0, 80) });
      for (const sh of cs.boxShadow === 'none' ? [] : shadows(cs.boxShadow)) {
        if (/\binset\b/.test(sh)) continue;
        const color = (sh.match(/rgba?\([^)]*\)/) || ['rgb(0, 0, 0)'])[0];
        const [x, y, blur = 0] = sh.replace(/rgba?\([^)]*\)/, '').trim().split(/\s+/).map(px);
        if (alpha(color) > 0.02 && Math.abs(x) <= 1 && Math.abs(y) <= 1 && blur >= 4) bad.push({ surface: nm, halo: sh.slice(0, 80) });
      }
      for (const b of sf.querySelectorAll('.collab-kind-badge')) { const bc = getComputedStyle(b); if (alpha(bc.backgroundColor) > 0.02 || bc.backgroundImage !== 'none') bad.push({ surface: nm, badgeTile: bc.backgroundColor + ' ' + bc.backgroundImage.slice(0, 40) }); }
      for (const x of sf.querySelectorAll('.tx-avatars, .sched-stub')) if (shown(x)) bad.push({ surface: nm, legacy: name(x) });
      for (let p = sf.parentElement; p && !p.classList.contains('transcript-inner'); p = p.parentElement) {
        const pc = getComputedStyle(p);
        if (/gradient/.test(pc.backgroundImage)) bad.push({ host: name(p), gradient: pc.backgroundImage.slice(0, 80) });
        const L = pc.borderLeftStyle === 'none' ? 0 : px(pc.borderLeftWidth), Rr = pc.borderRightStyle === 'none' ? 0 : px(pc.borderRightWidth);
        if (Math.abs(L - Rr) > 0.5) bad.push({ host: name(p), sideBorder: L + '/' + Rr });
      }
    }
    res('no-bleed', bad.length === 0, bad.length ? bad.slice(0, 16) : { surfaces: list.length });
  }

  /* -- surfaces-list (IMPACT A2-18): PM56_PMX.SURFACES is the one list of pmx transcript surfaces.
        Every pmx transcript item must be on it (the 7.14 block and FOLLOW_HOSTS are built from it,
        so a surface missing from it gets the Chat WOW family look), and the 7.14 block must carry a
        rule for every entry. A transcript item is a direct child of .transcript-inner that is a pmx
        element, or the direct pmx child of a [data-family] item (the two shapes 7.14 names). The
        gallery's own wrappers (pmx-gallery-*) are harness, not surfaces. */
  if (want('surfaces-list') && o.kind === 'chat') {
    const bad = [];
    if (!surfList) bad.push({ surfaces: 'PM56_PMX.SURFACES is not a non-empty array (spec 4.5, IMPACT A2-18)' });
    else {
      const seen = new Set();
      for (const inner of document.querySelectorAll('.transcript-inner')) for (const item of inner.children) {
        const cands = isPmxEl(item) ? [item] : item.hasAttribute('data-family') ? [...item.children].filter(isPmxEl) : [];
        for (const el of cands) {
          if (skipped(el) || el.matches(SURF)) continue;
          const own = [...el.classList].filter(c => c.indexOf('pmx-') === 0);
          if (own.every(c => /^pmx-gallery/.test(c))) continue;
          const key = own.join(' ');
          if (!seen.has(key)) { seen.add(key); bad.push({ item: name(el), notInSurfaces: own, surfaces: surfList }); }
        }
      }
      const coex = allRules().filter(r => r.selectorText && /\[data-family/.test(r.selectorText)).map(r => r.selectorText);
      for (const s of surfList) {
        const sel = toSel(s);
        const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])');
        if (!coex.some(t => re.test(t))) bad.push({ coexistence: 'no 7.14 [data-family] rule names ' + sel });
      }
    }
    res('surfaces-list', bad.length === 0, bad.length ? bad.slice(0, 16) : { surfaces: surfList });
  }

  /* -- forbidden-props (IMPACT A1-01/02/04/05/15; 10.1 step 7): no backdrop-filter, filter,
        stroke-dashoffset or color-mix() in any computed pmx style. */
  if (want('forbidden-props')) {
    const hits = new Map(), preserved = { count: 0, samples: [] };
    const PRESERVED = '.shared-picker-button, .overlay-menu, .provider-mark';
    /* what color-mix() computes to in Chromium (and a colour literal outside sRGB, which A1-15's precomputed literals never are) */
    const MODERN = /\b(color|oklab|oklch|lab|lch)\(/;
    const COLOR_PROPS = ['color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke',
      'textDecorationColor', 'caretColor', 'boxShadow', 'textShadow', 'accentColor'];
    const note = (what, el, where) => {
      if (el && el.closest && el.closest(PRESERVED)) { preserved.count++; if (preserved.samples.length < 4) preserved.samples.push(what + ' @ ' + name(el)); return; }
      const k = what; if (!hits.has(k)) hits.set(k, { what, first: el ? name(el) : where, count: 0 }); hits.get(k).count++;
    };
    for (const el of all) {
      const svg = el instanceof SVGElement;
      for (const pe of svg ? [null] : [null, '::before', '::after']) {
        const cs = pe ? getComputedStyle(el, pe) : css(el);
        if (pe && (cs.content === 'none' || cs.content === 'normal')) continue;
        const bf = cs.backdropFilter || cs.webkitBackdropFilter;
        if (bf && bf !== 'none') note('backdrop-filter: ' + bf.slice(0, 50) + (pe || ''), el);
        if (cs.filter && cs.filter !== 'none') note('filter: ' + cs.filter.slice(0, 50) + (pe || ''), el);
        if (svg && cs.strokeDashoffset && !/^0(px)?$/.test(cs.strokeDashoffset)) note('stroke-dashoffset: ' + cs.strokeDashoffset, el);
        for (const p of COLOR_PROPS) { const v = cs[p]; if (v && MODERN.test(v)) note('color-mix() result in ' + p + ': ' + v.slice(0, 60) + (pe || ''), el); }
      }
    }
    /* custom properties: the pmx tokens (--pmx-*) as the roots inherit them, and every custom property a pmx
       element sets inline (a template value). Other owners' tokens that merely pass through (Chat WOW's --tx-*)
       count only where a pmx style actually uses them, which the computed colours above catch. Each distinct
       (name, value) is reported once. */
    for (const el of roots) {
      const cs = css(el);
      for (let i = 0; i < cs.length; i++) {
        const n = cs[i]; if (n.indexOf('--pmx') !== 0) continue;
        const v = cs.getPropertyValue(n); if (/color-mix\(/i.test(v)) note('token ' + n + ': ' + v.trim().slice(0, 70), el);
      }
    }
    for (const el of all) {
      const inline = el.getAttribute && el.getAttribute('style'); if (!inline || inline.indexOf('--') < 0) continue;
      for (let i = 0; i < el.style.length; i++) { const n = el.style[i]; if (n.indexOf('--') === 0 && /color-mix\(/i.test(el.style.getPropertyValue(n))) note('inline ' + n + ': ' + el.style.getPropertyValue(n).trim().slice(0, 70), el); }
    }
    /* running animations (CSS and WAAPI) on pmx targets that animate a forbidden property */
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.target; if (!t || !inRoots(t) || skipped(t)) continue;
      let kf = []; try { kf = a.effect.getKeyframes(); } catch (e) { }
      for (const f of kf) for (const p of ['filter', 'backdropFilter', 'strokeDashoffset']) if (f[p] != null && f[p] !== 'none' && !(p === 'strokeDashoffset' && /^0(px)?$/.test(f[p]))) note('animates ' + p + ' (' + (a.animationName || a.id || 'waapi') + ')', t);
    }
    /* the style sheets: pmx rules and pmx @keyframes (a rule not matching anything on screen now still ships) */
    for (const r of allRules()) {
      if (r instanceof CSSKeyframesRule) {
        if (!/pmx/.test(r.name)) continue;
        const txt = r.cssText;
        for (const [re, what] of [[/backdrop-filter\s*:/, 'backdrop-filter'], [/(^|[^-])filter\s*:\s*(?!none)/, 'filter'], [/stroke-dashoffset\s*:/, 'stroke-dashoffset'], [/color-mix\(/, 'color-mix()']]) if (re.test(txt)) note('@keyframes ' + r.name + ' uses ' + what, null, 'css');
        continue;
      }
      if (!r.style || !r.selectorText) continue;
      const pmxRule = /pmx/.test(r.selectorText);
      const st = r.style;
      for (let i = 0; i < st.length; i++) {
        const n = st[i], v = st.getPropertyValue(n);
        const tokenRule = n.indexOf('--pmx') === 0;
        if (!pmxRule && !tokenRule) continue;
        if (/color-mix\(/i.test(v)) note('rule ' + r.selectorText.slice(0, 60) + ' { ' + n + ': color-mix(...) }', null, 'css');
        if (!pmxRule) continue;
        if ((n === 'backdrop-filter' || n === '-webkit-backdrop-filter') && v.trim() !== 'none') note('rule ' + r.selectorText.slice(0, 60) + ' { ' + n + ': ' + v.trim().slice(0, 30) + ' }', null, 'css');
        if (n === 'filter' && v.trim() !== 'none') note('rule ' + r.selectorText.slice(0, 60) + ' { filter: ' + v.trim().slice(0, 30) + ' }', null, 'css');
        if (n === 'stroke-dashoffset') note('rule ' + r.selectorText.slice(0, 60) + ' { stroke-dashoffset: ' + v.trim().slice(0, 20) + ' }', null, 'css');
      }
    }
    const list = [...hits.values()];
    res('forbidden-props', list.length === 0, list.length ? { count: list.length, hits: list.slice(0, 24), preservedExempt: preserved.count ? preserved : undefined } : (preserved.count ? { preservedExempt: preserved } : undefined));
  }

  /* -- canon-names (IMPACT A2-27a; D-10): the names the blueprint shows are visible, and never misspelt */
  if (want('canon-names')) {
    const bad = [];
    const vis = roots.filter(r => !skipped(r)).map(r => r.innerText || '').join('\n').replace(/[ \t]+/g, ' ');
    const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const attrs = all.map(el => ['aria-label', 'title', 'data-hover', 'data-tip', 'placeholder'].map(a => (el.getAttribute && el.getAttribute(a)) || '').join(' ')).join(' ');
    /* an entry is a name, or {name, minCard}: required only while every run card on the surface is at least
       minCard px wide (7.2: at the S tier, < 360 px, the kind word is hidden and actions shorten to "Open") */
    const cards = roots.flatMap(r => [...(r.matches('.pmx-run') ? [r] : []), ...r.querySelectorAll('.pmx-run')]).filter(c => !skipped(c) && shown(c));
    const narrowest = cards.length ? Math.min(...cards.map(c => c.getBoundingClientRect().width)) : Infinity;
    const exempt = [];
    for (const e of (o.canon || [])) {
      const n = typeof e === 'string' ? e : e.name;
      if (typeof e === 'object' && e.minCard && narrowest < e.minCard) { exempt.push(n + ' (card ' + Math.round(narrowest) + ' < ' + e.minCard + ')'); continue; }
      if (new RegExp('(^|[^\\w])' + escRe(n) + '(?![\\w])').test(vis)) continue;
      bad.push({ missing: n, onlyIn: attrs.indexOf(n) >= 0 ? 'an attribute (aria-label, title or hover), not the visible text' : null, narrowestCard: cards.length ? Math.round(narrowest) : undefined });
    }
    /* [canon, variant pattern, lower-case prose allowed] */
    const CANON = [['BrainStorm', 'brain[\\s-]*storm'], ['Chat Room', 'chat[\\s-]*room'], ['Multi-Pass Review', 'multi[\\s-]*pass[\\s-]+review'], ['Single Agent', 'single[\\s-]+agent', true],
      ['Back Seat Driver', 'back[\\s-]*seat[\\s-]+driver'], ['Crew Auto', 'crew[\\s-]+auto(?![\\w-])'], ['Grill Me', 'grill[\\s-]+me(?![\\w])'], ['Wonderer', 'wonderer'], ['ELI5', 'eli[\\s-]*5'],
      ['Revert Last Agent Edit', 'revert[\\s-]+last[\\s-]+agent[\\s-]+edit'], ['Open Panel', 'open[\\s-]+panel'], ['Build With Crew', 'build[\\s-]+with[\\s-]+crew'], ['Canceled', 'cancelled']];
    /* the copy: every rendered text node of the surface, code excepted (a file name or a snippet is not copy) */
    const bits = [], offRun = [];
    const RUN_SURFACE = '.pmx-run, .pmx-receipt, .pmx-dock-line';
    for (const r of roots) {
      if (skipped(r)) continue;
      const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const p = n.parentElement;
        if (!p || skipped(p) || p.closest('code, pre, kbd, samp, script, style') || !p.getClientRects().length) continue;
        bits.push(n.nodeValue);
        if (!p.closest(RUN_SURFACE)) offRun.push(n.nodeValue);
      }
      bits.push('\n'); offRun.push('\n');
    }
    const copy = bits.join(' ').replace(/\s+/g, ' ');
    /* "Cancelled" is the run spelling (9.0 rule 7): the Canceled check reads only the text outside run surfaces */
    const copyOffRun = offRun.join(' ').replace(/\s+/g, ' ');
    const spelt = [];
    for (const [canon, pat, lowerOk] of CANON) {
      const text = canon === 'Canceled' ? copyOffRun : copy;
      /* an identifier (kind-brainstorm, chat_room, a class or glyph name printed as a caption) is not copy */
      for (const m of text.matchAll(new RegExp('(^|[^\\w\\-./:])(' + pat + ')(?![\\w\\-])', 'gi'))) {
        const got = m[2];
        if (got === canon) continue;
        if (lowerOk && got === got.toLowerCase()) continue;
        const at = m.index + m[1].length;
        spelt.push({ wrote: got, canon, context: text.slice(Math.max(0, at - 24), at + got.length + 24).trim() });
      }
    }
    /* IMPACT A1-34 (7.6, 9.1): recovery verbs are canon's, everywhere: "Retry", never "Try again" or "Check
       again"; "Recover", never "Open recovery" (review cycle 1: the gallery's failed card said "Try again") */
    /* E-36 answered B (owner, 2026-09-27; was IMPACT A1-41 provisional): the rule tick says "Followed 1 of your rules",
       never "Used" */
    for (const [canon, pat] of [['Retry', 'try[\\s-]+again'], ['Retry', 'check[\\s-]+again'], ['Recover', 'open[\\s-]+recovery'], ['Followed N of your rules', 'used\\s+(?:\\d+|one|all)\\s+of\\s+your\\s+rules?']]) {
      for (const m of copy.matchAll(new RegExp('(^|[^\\w])(' + pat + ')(?![\\w])', 'gi'))) {
        const at = m.index + m[1].length;
        spelt.push({ wrote: m[2], canon, context: copy.slice(Math.max(0, at - 24), at + m[2].length + 24).trim() });
      }
    }
    const uniq = []; const k = new Set(); for (const s of spelt) { const kk = s.wrote + '|' + s.context; if (!k.has(kk)) { k.add(kk); uniq.push(s); } }
    for (const s of uniq.slice(0, 12)) bad.push({ misspelt: s.wrote, canon: s.canon, context: s.context });
    res('canon-names', bad.length === 0, bad.length ? bad : { declared: (o.canon || []).map(e => typeof e === 'string' ? e : e.name), exempt: exempt.length ? exempt : undefined, checked: CANON.length });
  }

  /* -- parts (6.6): one exported vocabulary, PM56_PMX.PARTS, feeding the CSS rules and the JS */
  if (want('parts')) {
    const SPEC_PARTS = 'job team lead assign parallel specialists wonderer grill permission auto target focus count blind rounds research questions policy moderator mode watch catchup quiet stages when route missed reach voice inherit who wind days you meter notes rules'.split(' ');
    const P = PMX && PMX.PARTS;
    const parts = Array.isArray(P) ? P.map(String) : typeof P === 'string' ? P.trim().split(/\s+/) : null;
    const bad = [];
    if (!parts) bad.push({ parts: 'PM56_PMX.PARTS is not exported (spec 6.6: ONE exported constant that the CSS rules and the JS read)' });
    const vocab = parts || SPEC_PARTS;
    if (parts) { const lacks = SPEC_PARTS.filter(p => vocab.indexOf(p) < 0); if (lacks.length) bad.push({ partsLack: lacks }); }
    const okTok = t => vocab.indexOf(t) >= 0 || (t.indexOf(':') > 0 && vocab.indexOf(t.split(':')[0] + ':*') >= 0);
    const unknown = new Map();
    let used = 0;
    for (const el of document.querySelectorAll('[data-pmx-affects], [data-pmx-part]')) {
      if (el.closest('.pmx-ghost')) continue;
      for (const a of ['data-pmx-affects', 'data-pmx-part']) {
        const v = el.getAttribute(a); if (v == null) continue;
        for (const t of v.trim().split(/\s+/).filter(Boolean)) {
          used++;
          if (okTok(t)) continue;
          const key = a + '=' + t;
          if (!unknown.has(key)) unknown.set(key, { attr: a, value: t, el: name(el), count: 0 });
          unknown.get(key).count++;
        }
      }
    }
    for (const u of unknown.values()) bad.push({ notInParts: u.value, attr: u.attr, el: u.el, count: u.count });
    /* the light rules: one per part (a rule for a name outside PARTS lights something no control can name) */
    const lit = new Set();
    for (const r of allRules()) if (r.selectorText && r.selectorText.indexOf('data-pmx-focus') >= 0) for (const m of r.selectorText.matchAll(/data-pmx-focus~=["']?([^"'\]\s]+)/g)) lit.add(m[1]);
    const noRule = vocab.filter(p => p.indexOf('*') < 0 && !lit.has(p));
    const ruleOutside = [...lit].filter(p => vocab.indexOf(p) < 0);
    if (noRule.length) bad.push({ noLightRule: noRule });
    if (ruleOutside.length) bad.push({ lightRuleOutsideParts: ruleOutside });
    res('parts', bad.length === 0, bad.length ? bad.slice(0, 20) : { parts: vocab.length, extra: parts ? parts.filter(p => SPEC_PARTS.indexOf(p) < 0) : [], valuesUsed: used, lightRules: lit.size });
  }

  /* -- harness-nodes (IMPACT A2-19): harness-only nodes are never visible, below their show tier.
        SHOW_TIERS lists the harness nodes a wider tier shows by design; at or above the tier the node is
        exempt (reported, not judged), below it the ordinary rule holds (it must be hidden). C13 / R-21: the
        receipt's run title (data-pmx-harness, A2-19) shows on a run card at least 640 px wide. */
  if (want('harness-nodes')) {
    const bad = [], exempt = [], below = [];
    let n = 0;
    for (const el of document.querySelectorAll('[data-pmx-harness]')) {
      if (el.closest('.pmx-ghost') || !(inRoots(el) || roots.some(r => r.contains(el)))) continue;
      n++;
      const b = el.getBoundingClientRect(), cs = getComputedStyle(el);
      const painted = b.width > 1.5 && b.height > 1.5 && (el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : cs.visibility !== 'hidden')
        && cs.clip === 'auto' && (cs.clipPath === 'none' || !/inset\(\s*50%/.test(cs.clipPath));
      const q = tierOf(el), tier = q && q.t, hostW = q ? q.w : null;
      if (q && hostW >= tier.min) { exempt.push({ el: name(el), card: hostW, shown: painted, rule: tier.rule }); continue; }
      if (q) below.push({ el: name(el), card: hostW, shown: painted });
      if (painted) bad.push({ el: name(el), text: text(el), rect: [b.left, b.top, b.width, b.height].map(Math.round), ...(tier ? { card: hostW, mustHideBelow: tier.min, rule: tier.rule } : {}) });
    }
    res('harness-nodes', bad.length === 0, bad.length ? bad.slice(0, 10) : { nodes: n, exemptAtTier: exempt.length ? exempt.slice(0, 6) : undefined, hiddenBelowTier: below.length ? below.length : undefined });
  }

  /* -- crowding (owner amendment J-2, item 7) and theme-font (J-1).
        Text is measured by its INK box: the line fragment's box from a Range, narrowed to the
        glyphs' actual ascent/descent (canvas measureText with the element's font), then cut by
        every ancestor that clips (overflow hidden/clip; scroll containers do not cut, since
        their content is reachable). Rules, each reported with its own id:
          text-line     ink >= 8 px from a border, hairline, divider or track line above or below
                        it (6 px inside a .pmx-lane; 6 px from the control above a secondary line); a
                        line crossing the ink is a violation. The text's own control border and the
                        underline indicators (switch rule, tabs, words) do not count. Only lines in
                        the text's own scroll container count; a scroller's own top/bottom line is
                        judged at the scroll extreme where it meets the content.
          text-edge     ink >= 12 px from the left/right edge of the nearest block box that paints
                        (border, own fill or ring), controls excepted
          control-text  text inside a boxed control >= 8 px from its border sideways, >= 6 px above
                        and below; fields: the same, on the sides the field draws, with the ink placed
                        from the font's metrics
          controls-row  adjacent controls on one row >= 10 px apart (boxed: border boxes;
                        unboxed: their ink); controls-stacked >= 12 px; overlap is a violation
          control-gap   >= 16 px between a control and unrelated text on the same line
          text-overlap  two text ink boxes overlap; text-gap: two separate text blocks < 6 px apart
          line-height   wrapped text: line pitch >= 1.45 x font size (1.25 for >= 16 px or >= 600 weight)
          row-height    roster rows (.pmx-row) >= 52 px; button-height: boxed text buttons >= 32 px
          secondary-line  a secondary line (J-2 item 4: route / stand-in sentence, row note, step
                        caption, reason, error) keeps >= 12 px above whatever follows it (text, a
                        control or a line)
          plate-line    an SVG plate label's ink >= 8 px from every plate line (Euclidean, to the
                        stroke's edge); plate-edge: >= 12 px from the plate's left/right side
        theme-font: every text's first font family is the theme's (Inter; Poppins in friendly;
        IBM Plex Mono in retro), never Newsreader, never italic (em/i/cite included: lead ruling);
        code, pre, kbd and samp: IBM Plex Mono in retro, anything but IBM Plex Mono elsewhere. */
  if (want('crowding') || want('theme-font')) {
    /* every hit carries its geometry (viewport px at lint time) so the runner can crop it:
       boxes = [the text or control, the thing it is too close to], axis + from/to = the
       measured gap (to < from when the two overlap), sc = its scroll container (index into
       window.__pmxvSc, which the crop step scrolls if the hit is out of view) */
    const SCL = window.__pmxvSc = [];
    const scIdx = sc => { let i = SCL.indexOf(sc); if (i < 0) { SCL.push(sc); i = SCL.length - 1; } return i; };
    const r1 = v => Math.round(v * 10) / 10;
    const q4 = b => ({ l: r1(b.l != null ? b.l : b.left), t: r1(b.t != null ? b.t : b.top), r: r1(b.r != null ? b.r : b.right), b: r1(b.b != null ? b.b : b.bottom) });
    const V = {}, add = (rule, d, geo) => {
      if (geo) d.geo = { boxes: geo.boxes.map(q4), axis: geo.axis, from: r1(geo.from), to: r1(geo.to), sc: geo.sc ? scIdx(geo.sc) : -1, extreme: geo.extreme || null };
      (V[rule] = V[rule] || []).push(d);
    };
    const cv = document.createElement('canvas').getContext('2d');
    const seen = el => el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : shown(el);
    const CONTROL = 'button, input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [role="button"], .shared-picker-button, label.pmx-add';
    const UNDERLINE = '.pmx-switch-rule, .pmx-switch, .pmx-tabs, .pmx-tab, [role="tab"], .pmx-word';
    /* J-2 item 4: secondary lines under a row (route / stand-in sentences, errors): >= 6 px below the
       row's controls (instead of item 1's 8), >= 12 px above whatever follows */
    const SECONDARY = '.pmx-route, .collab-route-eff, .pmx-row-note, .pmx-step-cap, .pmx-reason, .pmx-foot-reason, .pmx-q-error, .pmx-error, [data-pmx-secondary]';
    const FILL_SKIP = '.pmx-mark, .provider-mark, [class*="avatar"], [class*="-icon"], .pmx-glyph, svg, img, kbd, code, mark';
    /* whole-row buttons (lanes, team rows, the Advanced entry) are list rows, not controls: their
       text is held to the line and edge rules like any row */
    const ROWLIKE = '.pmx-lane, .pmx-lanes-more, .pmx-team-row, .pmx-adv, .ab-row';
    const ctrlOf = el => { const c = el.closest(CONTROL); return c && !c.matches(ROWLIKE) ? c : null; };
    /* a real scroller is an overflow auto/scroll box that actually has something to scroll; one whose
       content fits is a plain (clipping) box: its content never moves */
    const SCROLLS = new Map();
    const scrolls = p => {
      if (SCROLLS.has(p)) return SCROLLS.get(p);
      const pc = css(p);
      const v = (/auto|scroll/.test(pc.overflowY) && p.scrollHeight > p.clientHeight + 1) || (/auto|scroll/.test(pc.overflowX) && p.scrollWidth > p.clientWidth + 1);
      SCROLLS.set(p, v); return v;
    };
    const CLIPS = new Map();
    const clipOf = el => {
      if (CLIPS.has(el)) return CLIPS.get(el);
      let c = { l: -1e9, t: -1e9, r: 1e9, b: 1e9 };
      const p = el.parentElement;
      /* a real scroller's content is reachable by scrolling: nothing at or above it clips it */
      if (p && p !== document.documentElement && !scrolls(p)) {
        const up = clipOf(p), pc = css(p), b = p.getBoundingClientRect();
        c = Object.assign({}, up);
        if (pc.overflowX !== 'visible') { c.l = Math.max(c.l, b.left); c.r = Math.min(c.r, b.right); }
        if (pc.overflowY !== 'visible') { c.t = Math.max(c.t, b.top); c.b = Math.min(c.b, b.bottom); }
      }
      CLIPS.set(el, c); return c;
    };
    const blockOf = el => { for (let p = el; p; p = p.parentElement) { const d = css(p).display; if (d !== 'inline' && d !== 'contents') return p; } return el; };
    /* things in different scroll containers are never compared: their geometry only lines up by
       accident of scroll position (text-line judges a scroller's own top and bottom lines against its
       content at the scroll extreme where they meet) */
    const SCR = new Map();
    const scrollerOf = el => { if (SCR.has(el)) return SCR.get(el); let out = document.scrollingElement; for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { if (scrolls(p)) { out = p; break; } } SCR.set(el, out); return out; };
    const ctext = c => (c.textContent || c.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 20);
    const nm = el => name(el);
    /* text lines */
    const lines = [];
    for (const r of roots) {
      const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const t = n.nodeValue; if (!t.trim()) continue;
        const el = n.parentElement;
        if (!el || skipped(el) || el.closest('svg, .pmx-sr, script, style') || !seen(el)) continue;
        const cs = css(el);
        cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        const m = cv.measureText(t.trim());
        const fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
        const rg = document.createRange(); rg.selectNodeContents(n);
        /* the text's own element clips it too (an ellipsis box) */
        const clip = Object.assign({}, clipOf(el)), ec = css(el), eb = el.getBoundingClientRect();
        if (/hidden|clip/.test(ec.overflowX)) { clip.l = Math.max(clip.l, eb.left); clip.r = Math.min(clip.r, eb.right); }
        if (/hidden|clip/.test(ec.overflowY)) { clip.t = Math.max(clip.t, eb.top); clip.b = Math.min(clip.b, eb.bottom); }
        for (const rr of rg.getClientRects()) {
          if (rr.width < 1 || rr.height < 1) continue;
          const k = fa + fd > 0 ? rr.height / (fa + fd) : 1, base = rr.top + fa * k;
          const ink = { l: Math.max(rr.left, clip.l), r: Math.min(rr.right, clip.r), t: Math.max(base - m.actualBoundingBoxAscent * k, clip.t), b: Math.min(base + m.actualBoundingBoxDescent * k, clip.b) };
          if (ink.r - ink.l < 1 || ink.b - ink.t < 1) continue;
          lines.push({ n, el, ink, sc: scrollerOf(el), top: rr.top, fs: px(cs.fontSize), fw: parseInt(cs.fontWeight, 10) || 400, block: blockOf(el), ctrl: ctrlOf(el), lane: !!el.closest('.pmx-lane'), text: t.trim().slice(0, 28) });
        }
      }
    }
    /* theme-font */
    if (want('theme-font')) {
      const th = document.body.getAttribute('data-theme') || '';
      const wantFam = /^retro/.test(th) ? 'ibm plex mono' : /^friendly/.test(th) ? 'poppins' : 'inter';
      const bad = [], done = new Set();
      /* code (code, pre, kbd, samp): IBM Plex Mono in retro; elsewhere JetBrains Mono, never IBM Plex Mono
         (J-1 correction 2026-09-27: Plex is scoped to the retro themes; DL-161 amended 2026-10-09 after the home
         redesign's D17: JetBrains Mono is the code face of basic, glass and friendly) */
      const CODE = 'code, pre, kbd, samp, .pmx-code, .pmx-output-pre';
      /* for the document-level half (the runner): the (family, weight, style) triples pmx text uses,
         and one element per distinct look, whose rendered platform font the runner reads over CDP.
         An element is sampled only if nothing inside it is set in another family, because the
         platform-font read covers the element's descendants too. */
      const uses = new Map(), sample = new Map();
      const check = (el, txt) => {
        if (done.has(el)) return; done.add(el);
        const code = !!el.closest(CODE), fam = code ? (wantFam === 'ibm plex mono' ? 'ibm plex mono' : 'jetbrains mono') : wantFam;
        const cs = css(el), first = cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase();
        if (/newsreader/i.test(cs.fontFamily)) bad.push({ el: nm(el), newsreader: cs.fontFamily.slice(0, 60) });
        else if (first !== fam) bad.push({ el: nm(el), family: first, want: fam + (code ? ' (code)' : '') });
        /* no italics on pmx surfaces at all (J-1; lead ruling 2026-09-27: content emphasis, em / i /
           cite from markdown, is not exempt: no italic face is embedded, so it would be synthesized) */
        if (!code && cs.fontStyle !== 'normal') bad.push({ el: nm(el), italic: cs.fontStyle, emphasis: el.closest('em, i, cite') ? 'markdown or content emphasis' : undefined });
        const w = parseInt(cs.fontWeight, 10) || 400, st = cs.fontStyle === 'normal' ? 'normal' : 'italic';
        uses.set(fam + ' ' + w + ' ' + st, { family: fam, weight: w, style: st });
        const sig = [cs.fontFamily, w, st, cs.fontSize, typeof el.className === 'string' ? el.className : ''].join('|');
        const mixed = [...el.querySelectorAll('*')].some(d => !(d instanceof SVGElement) && css(d).fontFamily !== cs.fontFamily && (d.textContent || '').trim());
        if (!mixed && !sample.has(sig) && sample.size < 48) sample.set(sig, { el, want: fam, text: (txt || el.textContent || '').trim().slice(0, 28) });
      };
      for (const L of lines) check(L.el, L.text);
      for (const r of roots) for (const t of r.querySelectorAll('svg text, svg foreignObject *')) if (!skipped(t) && shown(t) && (t.tagName.toLowerCase() === 'text' || [...t.childNodes].some(c => c.nodeType === 3 && c.nodeValue.trim()))) check(t);
      window.__pmxvFontEls = [...sample.values()].map(x => x.el);
      R.font = { theme: th, want: wantFam, uses: [...uses.values()], sample: [...sample.values()].map(x => ({ el: nm(x.el), want: x.want, text: x.text })) };
      const uniq = []; const keys = new Set();
      for (const b of bad) { const key = b.el + (b.family || '') + (b.italic || '') + (b.newsreader ? 'N' : ''); if (!keys.has(key)) { keys.add(key); uniq.push(b); } }
      res('theme-font', uniq.length === 0, uniq.length ? { count: uniq.length, theme: th, samples: uniq.slice(0, 10) } : { theme: th, family: wantFam, elements: done.size });
    }
    if (want('crowding')) {
      /* horizontal rules: borders, hairline shadows, thin painted boxes, thin absolute pseudo lines */
      const rules = [];
      const push = (el, y1, y2, x1, x2, kind) => { if (x2 - x1 >= 4 && y2 >= y1) rules.push({ el, y1, y2, x1, x2, kind, sc: scrollerOf(el) }); };
      for (const el of html) {
        if (!shown(el) || el.closest(UNDERLINE)) continue;
        const cs = css(el), b = el.getBoundingClientRect();
        const T = bwOf(cs, 'Top'), Bt = bwOf(cs, 'Bottom');
        if (T >= 0.5 && alpha(cs.borderTopColor) > 0.02) push(el, b.top, b.top + T, b.left, b.right, 'border-top');
        if (Bt >= 0.5 && alpha(cs.borderBottomColor) > 0.02) push(el, b.bottom - Bt, b.bottom, b.left, b.right, 'border-bottom');
        if (cs.boxShadow !== 'none') for (const sh of shadows(cs.boxShadow)) {
          const q = shadowParts(sh);
          if (alpha(q.color) <= 0.02 || Math.abs(q.x) > 0.5 || q.blur > 0.5 || Math.abs(q.spread) > 0.5 || !q.y || Math.abs(q.y) > 3) continue;
          if (!q.inset) { if (q.y < 0) push(el, b.top + q.y, b.top, b.left, b.right, 'hairline'); else push(el, b.bottom, b.bottom + q.y, b.left, b.right, 'hairline'); }
          else { if (q.y > 0) push(el, b.top, b.top + q.y, b.left, b.right, 'hairline'); else push(el, b.bottom + q.y, b.bottom, b.left, b.right, 'hairline'); }
        }
        if (b.height <= 3 && b.width >= 12 && (alpha(cs.backgroundColor) > 0.02 || cs.backgroundImage !== 'none')) push(el, b.top, b.bottom, b.left, b.right, 'rule');
        /* the top and bottom edge of a filled container (a sheet, a card, a well) where it draws no
           border: text jammed against it is as crowded as text on a hairline. Icons, marks and
           controls are not containers (controls have their own rules). */
        else if (b.height >= 24 && b.width >= 48 && cs.display !== 'inline' && cs.display !== 'contents' && !el.matches(CONTROL + ', ' + FILL_SKIP) &&
          (cs.backgroundImage !== 'none' || (alpha(cs.backgroundColor) > 0.02 && cs.backgroundColor !== effBgOf(el.parentElement)))) {
          if (!(T >= 0.5 && alpha(cs.borderTopColor) > 0.02)) push(el, b.top, b.top, b.left, b.right, 'fill-edge-top');
          if (!(Bt >= 0.5 && alpha(cs.borderBottomColor) > 0.02)) push(el, b.bottom, b.bottom, b.left, b.right, 'fill-edge-bottom');
        }
        for (const pe of ['::before', '::after']) {
          const p = getComputedStyle(el, pe);
          if (!p || p.content === 'none' || p.content === 'normal' || p.display === 'none' || (p.position !== 'absolute' && p.position !== 'fixed')) continue;
          if (!(alpha(p.backgroundColor) > 0.02 || p.backgroundImage !== 'none' || (bwOf(p, 'Top') > 0 && alpha(p.borderTopColor) > 0.02))) continue;
          let w = px(p.width), h = px(p.height) || bwOf(p, 'Top');
          if (!w && p.left !== 'auto' && p.right !== 'auto') w = b.width - px(p.left) - px(p.right);
          if (!(h > 0 && h <= 3 && w >= 12)) continue;
          const left = p.left !== 'auto' ? b.left + px(p.left) : (p.right !== 'auto' ? b.right - px(p.right) - w : b.left);
          const top = p.top !== 'auto' ? b.top + px(p.top) : (p.bottom !== 'auto' ? b.bottom - px(p.bottom) - h : b.top);
          push(el, top, top + h, left, left + w, 'pseudo-line');
        }
      }
      /* text-line */
      for (const L of lines) {
        const min = L.lane ? 6 : 8;
        let above = null, below = null, cross = null;
        for (const R of rules) {
          if (L.ctrl && (R.el === L.ctrl || L.ctrl.contains(R.el))) continue;
          /* lines inside the text's own element are decorations (an inline underline); the element's
             own edges count when it is a block (a bordered or filled paragraph) */
          if (L.el.contains(R.el) && !(R.el === L.el && css(L.el).display !== 'inline')) continue;
          /* one scroll container only; a scroller's own top/bottom line is judged against its content
             where they meet: the top line at scrollTop 0, the bottom line at the end of the scroll */
          let shift = 0, extreme = null;
          if (R.sc !== L.sc) {
            if (R.el !== L.sc) continue;
            const sb = R.el.getBoundingClientRect();
            if (R.y2 <= sb.top + sb.height / 2) { shift = R.el.scrollTop; extreme = 'top'; } else { shift = -(R.el.scrollHeight - R.el.clientHeight - R.el.scrollTop); extreme = 'bottom'; }
          }
          if (Math.min(L.ink.r, R.x2) - Math.max(L.ink.l, R.x1) <= 0) continue;
          const it = L.ink.t + shift, ib = L.ink.b + shift;
          if (R.y2 <= it + 0.5) { const d = it - R.y2; if (!above || d < above.d) above = { d, R, shift, extreme }; }
          else if (R.y1 >= ib - 0.5) { const d = R.y1 - ib; if (!below || d < below.d) below = { d, R, shift, extreme }; }
          else cross = { d: -1, R, shift, extreme };
        }
        const secMin = hit => side => side === 'above' && L.el.closest(SECONDARY) && hit.R.el.closest(CONTROL) ? 6 : min;
        for (const [side, hit] of [['above', above], ['below', below], ['across', cross]]) if (hit && hit.d < secMin(hit)(side) - 0.25) {
          const R = hit.R, ink = { l: L.ink.l, r: L.ink.r, t: L.ink.t + hit.shift, b: L.ink.b + hit.shift };
          const from = side === 'above' ? R.y2 : side === 'below' ? ink.b : Math.max(ink.t, R.y1), to = side === 'above' ? ink.t : side === 'below' ? R.y1 : Math.min(ink.b, R.y2);
          const d = { text: L.text, in: nm(L.el), line: side + ' ' + R.kind + ' of ' + nm(R.el), gap: Math.round(hit.d * 10) / 10, min: secMin(hit)(side) };
          if (hit.extreme) d.judged = 'scrolled to the ' + hit.extreme;
          add('text-line', d, { boxes: [ink, { l: R.x1, t: R.y1, r: R.x2, b: R.y2 }], axis: 'y', from, to: side === 'across' ? from - 0.01 : to, sc: L.sc, extreme: hit.extreme });
        }
      }
      /* text-edge */
      const boxCache = new Map();
      const boxOf = el => {
        if (boxCache.has(el)) return boxCache.get(el);
        let out = null;
        for (let p = el; p; p = p.parentElement) {
          if (p.matches(CONTROL) && !p.matches(ROWLIKE)) { out = null; break; }
          const d = css(p).display;
          if (d !== 'inline' && d !== 'contents' && !p.matches('kbd, code, .pmx-mark') && paintsBox(p)) {
            /* a row drawn only by hairlines above/below has no left or right edge */
            const pc = css(p);
            const sideEdges = ['Left', 'Right'].some(sd => bwOf(pc, sd) >= 0.5 && alpha(pc['border' + sd + 'Color']) > 0.02);
            const topBottomOnly = !sideEdges && pc.backgroundImage === 'none' && !(alpha(pc.backgroundColor) > 0.02 && pc.backgroundColor !== effBgOf(p.parentElement)) &&
              !(pc.boxShadow !== 'none' && shadows(pc.boxShadow).some(sh => { const q = shadowParts(sh); return alpha(q.color) > 0.02 && Math.abs(q.x) < 0.5 && Math.abs(q.y) < 0.5 && q.spread >= 0.5; }));
            if (!topBottomOnly) { out = p; break; }
          }
          if (roots.includes(p)) break;
        }
        boxCache.set(el, out); return out;
      };
      for (const L of lines) {
        if (L.ctrl) continue;
        const bx = boxOf(L.el); if (!bx) continue;
        const b = bx.getBoundingClientRect();
        const dl = L.ink.l - b.left;
        /* inside a sideways scroller (a code block) the right edge is reachable by scrolling */
        const sideScroll = L.sc !== document.scrollingElement && (bx === L.sc || bx.contains(L.sc)) && /auto|scroll/.test(css(L.sc).overflowX);
        const dr = sideScroll ? 99 : b.right - L.ink.r;
        if (dl < 11.75 && dl > -40) add('text-edge', { text: L.text, box: nm(bx), side: 'left', gap: Math.round(dl * 10) / 10, min: 12 }, { boxes: [L.ink, b], axis: 'x', from: b.left, to: L.ink.l, sc: L.sc });
        if (dr < 11.75 && dr > -40) add('text-edge', { text: L.text, box: nm(bx), side: 'right', gap: Math.round(dr * 10) / 10, min: 12 }, { boxes: [L.ink, b], axis: 'x', from: L.ink.r, to: b.right, sc: L.sc });
      }
      /* controls */
      const ctrls = [];
      for (const r of roots) for (const c of (r.matches(CONTROL) ? [r] : r.querySelectorAll(CONTROL))) {
        if (skipped(c) || !seen(c) || c.matches(ROWLIKE)) continue;
        const b = c.getBoundingClientRect(); if (b.width < 4 || b.height < 4) continue;
        if (c.parentElement && c.parentElement.closest(CONTROL)) continue;
        const boxed = paintsBox(c);
        let ext = null;
        if (boxed) ext = { l: b.left, r: b.right, t: b.top, b: b.bottom };
        else {
          for (const L of lines) if (L.ctrl === c) ext = ext ? { l: Math.min(ext.l, L.ink.l), r: Math.max(ext.r, L.ink.r), t: Math.min(ext.t, L.ink.t), b: Math.max(ext.b, L.ink.b) } : Object.assign({}, L.ink);
          for (const g of c.querySelectorAll('svg')) { const gb = g.getBoundingClientRect(); if (gb.width && gb.height) ext = ext ? { l: Math.min(ext.l, gb.left), r: Math.max(ext.r, gb.right), t: Math.min(ext.t, gb.top), b: Math.max(ext.b, gb.bottom) } : { l: gb.left, r: gb.right, t: gb.top, b: gb.bottom }; }
          if (!ext) continue; /* nothing of it is visible */
        }
        ctrls.push({ c, ext, boxed, sc: scrollerOf(c), root: roots.find(x => x === c || x.contains(c)) });
        if (boxed) {
          if (c.matches('input, textarea, select')) {
            /* a field's text is not a text node: sideways it starts at the padding edge; up and down its
               ink is placed from the font's metrics (a single-line field centres its line box, a
               textarea starts at the top). Only sides the field actually draws count: an underline-only
               field has a bottom edge and no side edges. */
            const cs = css(c);
            const filledF = cs.backgroundImage !== 'none' || (alpha(cs.backgroundColor) > 0.02 && cs.backgroundColor !== effBgOf(c.parentElement)) || (cs.boxShadow !== 'none' && shadows(cs.boxShadow).some(sh => { const q = shadowParts(sh); return alpha(q.color) > 0.02 && Math.abs(q.x) < 0.5 && Math.abs(q.y) < 0.5 && q.blur <= 1 && q.spread >= 0.5; }));
            const edgeF = sd => filledF || (bwOf(cs, sd) >= 0.5 && alpha(cs['border' + sd + 'Color']) > 0.02);
            const sample = (c.value || c.getAttribute('placeholder') || 'Hxg').slice(0, 60);
            cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
            const m = cv.measureText(sample), fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
            const lh = cs.lineHeight === 'normal' ? fa + fd : px(cs.lineHeight);
            const cTop = b.top + bwOf(cs, 'Top') + px(cs.paddingTop), cBot = b.bottom - bwOf(cs, 'Bottom') - px(cs.paddingBottom);
            const lineTop = c.matches('textarea') ? cTop : cTop + ((cBot - cTop) - lh) / 2;
            const base = lineTop + (lh - (fa + fd)) / 2 + fa;
            const ink = { l: b.left + bwOf(cs, 'Left') + px(cs.paddingLeft), r: b.right - bwOf(cs, 'Right') - px(cs.paddingRight), t: base - m.actualBoundingBoxAscent, b: base + m.actualBoundingBoxDescent };
            const tx = ctext(c) || sample;
            const sc0 = scrollerOf(c);
            if (edgeF('Left') && ink.l - b.left < 7.75) add('control-text', { control: nm(c), text: tx, side: 'left (padding + border)', gap: r1(ink.l - b.left), min: 8 }, { boxes: [ink, b], axis: 'x', from: b.left, to: ink.l, sc: sc0 });
            if (edgeF('Right') && b.right - ink.r < 7.75) add('control-text', { control: nm(c), text: tx, side: 'right (padding + border)', gap: r1(b.right - ink.r), min: 8 }, { boxes: [ink, b], axis: 'x', from: ink.r, to: b.right, sc: sc0 });
            if (edgeF('Top') && ink.t - b.top < 5.75) add('control-text', { control: nm(c), text: tx, side: 'top (estimated ink)', gap: r1(ink.t - b.top), min: 6 }, { boxes: [ink, b], axis: 'y', from: b.top, to: ink.t, sc: sc0 });
            if (!c.matches('textarea') && edgeF('Bottom') && b.bottom - ink.b < 5.75) add('control-text', { control: nm(c), text: tx, side: 'bottom (estimated ink)', gap: r1(b.bottom - ink.b), min: 6 }, { boxes: [ink, b], axis: 'y', from: ink.b, to: b.bottom, sc: sc0 });
          } else {
            /* a filled or ringed control is edged on all four sides; otherwise only where it draws a border.
               The task's minimums: 8 px from the border sideways, 6 px above and below (ink, not line box) */
            const cs = css(c);
            const filled = cs.backgroundImage !== 'none' || (alpha(cs.backgroundColor) > 0.02 && cs.backgroundColor !== effBgOf(c.parentElement)) || (cs.boxShadow !== 'none' && shadows(cs.boxShadow).some(sh => { const q = shadowParts(sh); return alpha(q.color) > 0.02 && Math.abs(q.x) < 0.5 && Math.abs(q.y) < 0.5 && q.blur <= 1 && q.spread >= 0.5; }));
            const edge = sd => filled || (bwOf(cs, sd) >= 0.5 && alpha(cs['border' + sd + 'Color']) > 0.02);
            for (const L of lines) if (L.ctrl === c) {
              const d = [];
              if (edge('Left')) d.push(['left', L.ink.l - b.left, 8, b.left, L.ink.l, 'x']); if (edge('Right')) d.push(['right', b.right - L.ink.r, 8, L.ink.r, b.right, 'x']);
              if (edge('Top')) d.push(['top', L.ink.t - b.top, 6, b.top, L.ink.t, 'y']); if (edge('Bottom')) d.push(['bottom', b.bottom - L.ink.b, 6, L.ink.b, b.bottom, 'y']);
              const worst = d.filter(x => x[1] < x[2] - 0.25).sort((x, y) => (x[1] - x[2]) - (y[1] - y[2]))[0];
              if (worst) add('control-text', { control: nm(c), text: L.text, side: worst[0], gap: Math.round(worst[1] * 10) / 10, min: worst[2] }, { boxes: [L.ink, b], axis: worst[5], from: worst[3], to: worst[4], sc: L.sc });
            }
          }
          /* J-2 rule 2 + the spec's J reference update ("every text button in a pmx surface ... min-height
             32"; card, decision, dock, note, files and code-row buttons 32 tall): a boxed button with a
             label is >= 32 px on every surface (the preserved trigger keeps its own size) */
          if (c.matches('button') && !c.matches('.shared-picker-button') && (c.textContent || '').trim() && b.height < 31.75) add('button-height', { control: nm(c), text: (c.textContent || '').trim().slice(0, 24), h: Math.round(b.height * 10) / 10, min: 32 }, { boxes: [b], axis: 'y', from: b.top, to: b.bottom, sc: scrollerOf(c) });
        }
      }
      for (let i = 0; i < ctrls.length; i++) for (let j = i + 1; j < ctrls.length; j++) {
        const A = ctrls[i], Bc = ctrls[j];
        if (A.root !== Bc.root || A.sc !== Bc.sc || A.c.contains(Bc.c) || Bc.c.contains(A.c)) continue;
        const a = A.ext, b = Bc.ext;
        const vo = Math.min(a.b, b.b) - Math.max(a.t, b.t), ho = Math.min(a.r, b.r) - Math.max(a.l, b.l);
        if (vo > 0.5 * Math.min(a.b - a.t, b.b - b.t)) {
          const gap = Math.max(b.l - a.r, a.l - b.r);
          const from = b.l - a.r >= a.l - b.r ? a.r : b.r, to = from + gap;
          if (gap < 9.75) add(ho > 0 ? 'controls-overlap' : 'controls-row', { a: nm(A.c) + ' "' + ctext(A.c) + '"', b: nm(Bc.c) + ' "' + ctext(Bc.c) + '"', gap: Math.round(gap * 10) / 10, min: 10 }, { boxes: [a, b], axis: 'x', from, to, sc: A.sc });
        } else if (ho > 0) {
          const gap = Math.max(b.t - a.b, a.t - b.b);
          const from = b.t - a.b >= a.t - b.b ? a.b : b.b, to = from + gap;
          if (gap < 11.75 && gap > -60) add(gap < 0 ? 'controls-overlap' : 'controls-stacked', { a: nm(A.c) + ' "' + ctext(A.c) + '"', b: nm(Bc.c) + ' "' + ctext(Bc.c) + '"', gap: Math.round(gap * 10) / 10, min: 12 }, { boxes: [a, b], axis: 'y', from, to, sc: A.sc });
        }
      }
      /* secondary-line: what follows a secondary line keeps 12 px from its ink (text, a control or a line) */
      const secs = new Set();
      for (const L of lines) { const sEl = L.el.closest(SECONDARY); if (sEl && !(sEl.parentElement && sEl.parentElement.closest(SECONDARY)) && inRoots(sEl)) secs.add(sEl); }
      for (const sEl of secs) {
        const own = lines.filter(L => sEl.contains(L.el)); if (!own.length) continue;
        const sc = own[0].sc, ink = own.reduce((u, L) => ({ l: Math.min(u.l, L.ink.l), r: Math.max(u.r, L.ink.r), t: Math.min(u.t, L.ink.t), b: Math.max(u.b, L.ink.b) }), Object.assign({}, own[0].ink));
        const ox = q => Math.min(q.r, ink.r) - Math.max(q.l, ink.l) > 0;
        let best = null;
        const consider = (t, what, box) => { const d = t - ink.b; if (d >= -0.5 && (!best || d < best.d)) best = { d, what, box }; };
        for (const L of lines) if (!sEl.contains(L.el) && L.sc === sc && ox(L.ink) && L.ink.t >= ink.b - 0.5) consider(L.ink.t, 'text "' + L.text + '"', L.ink);
        for (const C of ctrls) if (!sEl.contains(C.c) && C.sc === sc && ox(C.ext) && C.ext.t >= ink.b - 0.5) consider(C.ext.t, 'control ' + nm(C.c) + ' "' + ctext(C.c) + '"', C.ext);
        /* the edges of a box that holds the secondary line (its own row) are item 1/5's business (8 px, text-line) */
        for (const R of rules) if (!sEl.contains(R.el) && !R.el.contains(sEl) && R.sc === sc && ox({ l: R.x1, r: R.x2 }) && R.y1 >= ink.b - 0.5) consider(R.y1, R.kind + ' of ' + nm(R.el), { l: R.x1, r: R.x2, t: R.y1, b: R.y2 });
        if (best && best.d < 11.75) add('secondary-line', { text: text(sEl).slice(0, 28), in: nm(sEl), follows: best.what, gap: r1(best.d), min: 12 }, { boxes: [ink, best.box], axis: 'y', from: ink.b, to: ink.b + best.d, sc });
      }
      /* control-gap: a control and unrelated text on the same line */
      const RELATED = 'label, .pmx-ctl, .pmx-set, .pmx-spec, .pmx-row, .pmx-q-head, .pmx-hero-aside, .pmx-refusal, .pmx-promise, .pmx-files, .pmx-coderow, .pmx-finding, .pmx-stepper, .pmx-dock-line, .pmx-lane, .pmx-guide, .pmx-switch, .pmx-words, .pmx-tabs, .pmx-output-head, .pmx-run-head, .pmx-receipt';
      for (const C of ctrls) {
        const grp = C.c.closest(RELATED);
        for (const L of lines) {
          if (L.ctrl || L.sc !== C.sc) continue;
          if (grp && grp.contains(L.el)) continue;
          const a = C.ext, t = L.ink;
          const vo = Math.min(a.b, t.b) - Math.max(a.t, t.t);
          if (vo <= 0.5 * Math.min(a.b - a.t, t.b - t.t)) continue;
          const gap = Math.max(t.l - a.r, a.l - t.r);
          const from = t.l - a.r >= a.l - t.r ? a.r : t.r;
          if (gap < 15.75 && gap > -40) add('control-gap', { control: nm(C.c), text: L.text, gap: Math.round(gap * 10) / 10, min: 16 }, { boxes: [t, a], axis: 'x', from, to: from + gap, sc: L.sc });
        }
      }
      /* text-overlap and text-gap */
      const sorted = lines.slice().sort((x, y) => x.ink.t - y.ink.t);
      for (let i = 0; i < sorted.length; i++) {
        const a = sorted[i];
        for (let j = i + 1; j < sorted.length && sorted[j].ink.t < a.ink.b + 6; j++) {
          const b = sorted[j];
          if (a.n === b.n || a.sc !== b.sc) continue;
          const ho = Math.min(a.ink.r, b.ink.r) - Math.max(a.ink.l, b.ink.l);
          if (ho <= 1) continue;
          const gap = b.ink.t - a.ink.b;
          const geo = { boxes: [a.ink, b.ink], axis: 'y', from: a.ink.b, to: b.ink.t, sc: a.sc };
          if (gap < -1 && a.block !== b.block) add('text-overlap', { a: a.text, b: b.text, in: nm(a.block) + ' / ' + nm(b.block), overlap: Math.round(-gap * 10) / 10 }, geo);
          else if (gap < 5.75 && a.block !== b.block && !(a.ctrl && a.ctrl === b.ctrl)) add('text-gap', { upper: a.text, lower: b.text, in: nm(a.block) + ' / ' + nm(b.block), gap: Math.round(gap * 10) / 10, min: 6 }, geo);
        }
      }
      /* line-height of wrapped text */
      const byNode = new Map();
      for (const L of lines) { const arr = byNode.get(L.n) || []; arr.push(L); byNode.set(L.n, arr); }
      for (const [n, arr] of byNode) {
        const tops = [...new Set(arr.map(L => Math.round(L.top * 2) / 2))].sort((x, y) => x - y);
        if (tops.length < 2) continue;
        const L = arr[0];
        let pitch = Infinity, at = 0; for (let k = 1; k < tops.length; k++) { const d = tops[k] - tops[k - 1]; if (d > 0.5 * L.fs && d < pitch) { pitch = d; at = k; } }
        if (!isFinite(pitch)) continue;
        const need = L.fs >= 16 || L.fw >= 600 ? 1.25 : 1.45;
        const l1 = arr.find(x => Math.round(x.top * 2) / 2 === tops[at - 1]) || L, l2 = arr.find(x => Math.round(x.top * 2) / 2 === tops[at]) || L;
        if (pitch / L.fs < need - 0.02) add('line-height', { text: L.text, in: nm(L.el), ratio: Math.round(pitch / L.fs * 100) / 100, min: need, fontSize: L.fs }, { boxes: [l1.ink, l2.ink], axis: 'y', from: tops[at - 1], to: tops[at], sc: L.sc });
      }
      /* rows */
      for (const r of roots) for (const row of r.querySelectorAll('.pmx-row')) {
        if (skipped(row) || !shown(row)) continue;
        const b = row.getBoundingClientRect();
        if (b.height < 51.75) add('row-height', { row: nm(row), text: text(row).slice(0, 28), h: Math.round(b.height * 10) / 10, min: 52 }, { boxes: [b], axis: 'y', from: b.top, to: b.bottom, sc: scrollerOf(row) });
      }
      /* plate labels (the spec's J-1/J-2 reference update: "labels >= 8 from every line and >= 12 from
         the plate's sides"). Lines are the plate's own strokes: pmx-p-line (fixed, hands, toyou, sees),
         paper outlines, hatch boxes, floor marks and any stroked line/polyline; mark icons are not lines.
         Each line is sampled every ~2 px along its length (getPointAtLength, mapped through its screen
         CTM); the gap is the Euclidean distance from the label's ink to the stroke's edge.
           plate-line   label ink >= 8 px from every plate line
           plate-edge   label ink >= 12 px from the plate's left/right side */
      for (const r of roots) for (const svg of r.querySelectorAll('svg.pmx-plate-svg')) {
        if (skipped(svg) || !shown(svg) || !svg.getScreenCTM()) continue;
        const fig = svg.closest('.pmx-plate') || svg, fb = fig.getBoundingClientRect(), sc = scrollerOf(svg);
        const pt = svg.createSVGPoint();
        const geoms = [];
        for (const el of svg.querySelectorAll('path.pmx-p-line, path.pmx-p-paper, rect.pmx-p-hatchbox, rect.pmx-m-floor, rect.pmx-p-floorbar, rect.pmx-p-hatch, line, polyline')) {
          const cs = css(el), m = el.getScreenCTM();
          if (!m || !el.getTotalLength || cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
          const eb = el.getBoundingClientRect(); if (!eb.width && !eb.height) continue;
          let L = 0; try { L = el.getTotalLength(); } catch (e) { continue; }
          const n = Math.max(2, Math.min(600, Math.ceil(L * Math.abs(m.a || 1) / 2))), pts = [];
          for (let i = 0; i <= n; i++) { const p = el.getPointAtLength(L * i / n); pt.x = p.x; pt.y = p.y; const q = pt.matrixTransform(m); pts.push([q.x, q.y]); }
          const half = cs.stroke !== 'none' ? px(cs.strokeWidth) * Math.abs(m.a || 1) / 2 : 0;
          geoms.push({ el, pts, half, kind: (el.getAttribute('class') || el.tagName) + (el.getAttribute('data-style') ? '[' + el.getAttribute('data-style') + ']' : '') + (el.getAttribute('data-k') ? ' ' + el.getAttribute('data-k') : '') });
        }
        /* the labels: SVG text, and HTML words inside a foreignObject (review cycle 1: paper() sets its words as
           HTML lines in a foreignObject, ellipsized at the paper's inner width), one ink box per line fragment */
        const items = [];
        for (const t of svg.querySelectorAll('text')) {
          const s = (t.textContent || '').trim(); if (!s || !shown(t)) continue;
          const cs = css(t); if (parseFloat(cs.opacity) === 0) continue;
          cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
          const m = cv.measureText(s), fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent, rr = t.getBoundingClientRect();
          const k = fa + fd > 0 ? rr.height / (fa + fd) : 1, base = rr.top + fa * k;
          items.push({ s, ink: { l: rr.left, r: rr.right, t: base - m.actualBoundingBoxAscent * k, b: base + m.actualBoundingBoxDescent * k } });
        }
        for (const fo of svg.querySelectorAll('foreignObject')) {
          const tw = document.createTreeWalker(fo, NodeFilter.SHOW_TEXT);
          for (let n = tw.nextNode(); n; n = tw.nextNode()) {
            const s = n.nodeValue.trim(), el = n.parentElement; if (!s || !el || !seen(el)) continue;
            const cs = css(el); cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
            const m = cv.measureText(s), fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent, eb = el.getBoundingClientRect();
            const cx = /hidden|clip/.test(cs.overflowX), rg = document.createRange(); rg.selectNodeContents(n);
            for (const rr of rg.getClientRects()) {
              if (rr.width < 1 || rr.height < 1) continue;
              const k = fa + fd > 0 ? rr.height / (fa + fd) : 1, base = rr.top + fa * k;
              const ink = { l: cx ? Math.max(rr.left, eb.left) : rr.left, r: cx ? Math.min(rr.right, eb.right) : rr.right, t: base - m.actualBoundingBoxAscent * k, b: base + m.actualBoundingBoxDescent * k };
              if (ink.r - ink.l >= 1) items.push({ s, ink });
            }
          }
        }
        for (const { s, ink } of items) {
          for (const g of geoms) {
            let best = Infinity, bp = null, bdx = 0, bdy = 0;
            for (const [x, y] of g.pts) { const dx = Math.max(ink.l - x, 0, x - ink.r), dy = Math.max(ink.t - y, 0, y - ink.b), d = Math.hypot(dx, dy); if (d < best) { best = d; bp = [x, y]; bdx = dx; bdy = dy; } }
            const gap = best - g.half;
            if (gap < 7.75) {
              /* inside the ink (an overlap): the axis is the one of the ink edge nearest the line point */
              const vertical = best > 0 ? bdy >= bdx : Math.min(Math.abs(bp[1] - ink.t), Math.abs(ink.b - bp[1])) <= Math.min(Math.abs(bp[0] - ink.l), Math.abs(ink.r - bp[0])), lo = vertical ? (bp[1] < ink.t ? bp[1] + g.half : ink.b) : (bp[0] < ink.l ? bp[0] + g.half : ink.r), hi = vertical ? (bp[1] < ink.t ? ink.t : bp[1] - g.half) : (bp[0] < ink.l ? ink.l : bp[0] - g.half);
              add('plate-line', { text: s.slice(0, 28), line: g.kind, gap: r1(gap), min: 8 }, { boxes: [ink, { l: bp[0] - 1, r: bp[0] + 1, t: bp[1] - 1, b: bp[1] + 1 }], axis: vertical ? 'y' : 'x', from: lo, to: gap < 0 ? lo - 0.01 : hi, sc });
            }
          }
          const dl = ink.l - fb.left, dr = fb.right - ink.r;
          if (dl < 11.75) add('plate-edge', { text: s.slice(0, 28), plate: nm(fig), side: 'left', gap: r1(dl), min: 12 }, { boxes: [ink, fb], axis: 'x', from: fb.left, to: ink.l, sc });
          if (dr < 11.75) add('plate-edge', { text: s.slice(0, 28), plate: nm(fig), side: 'right', gap: r1(dr), min: 12 }, { boxes: [ink, fb], axis: 'x', from: ink.r, to: fb.right, sc });
        }
      }
      const counts = {}; let total = 0;
      for (const [k, v] of Object.entries(V)) { counts[k] = v.length; total += v.length; }
      const samples = {}; for (const [k, v] of Object.entries(V)) samples[k] = v.slice(0, 4).map(x => { const y = Object.assign({}, x); delete y.geo; return y; });
      /* every hit (with its geometry) goes back to the runner, which crops it and puts the list in the JSON */
      const hits = []; for (const [k, v] of Object.entries(V)) for (const x of v) hits.push(Object.assign({ rule: k }, x));
      R.hits = hits.slice(0, 400);
      res('crowding', total === 0, total ? { total, counts, samples } : { lines: lines.length, rules: rules.length, controls: ctrls.length });
    }
  }

  /* -- primary-pixel (last: it may scroll a card into view) */
  if (want('primary-pixel')) {
    const bad = [], ok = [];
    for (const r of roots) for (const b of r.querySelectorAll('.primary-button')) {
      if (skipped(b) || b.disabled || !shown(b)) continue;
      let bb = b.getBoundingClientRect();
      /* bring it inside its scroll container's visible box first (a transcript is shorter than the window) */
      let sc = null;
      for (let p = b.parentElement; p && p !== document.body; p = p.parentElement) { const pc = getComputedStyle(p); if (/auto|scroll/.test(pc.overflowY) && p.scrollHeight > p.clientHeight + 1) { sc = p; break; } }
      const box = sc ? sc.getBoundingClientRect() : { top: 0, bottom: vh, left: 0, right: vw };
      if (bb.top < box.top || bb.bottom > box.bottom || bb.top < 0 || bb.bottom > vh || bb.left < 0 || bb.right > vw) { b.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }); bb = b.getBoundingClientRect(); }
      let x = bb.left + bb.width / 2, y = bb.top + bb.height / 2;
      let hit = document.elementFromPoint(x, y), edge = null;
      /* review cycle 2: a button that sits at its scroller's edge can be under the app's floating chrome there (the
         Activity chip and the jump-to-latest button float over the transcript's bottom edge, and content scrolls
         under them by design). Such a button is judged again scrolled to the middle of its scroller; covered there
         too, it fails. The edge overlap is reported with the pass. */
      if (!(hit && (hit === b || b.contains(hit))) && sc) {
        edge = { at: [Math.round(x), Math.round(y)], under: hit ? name(hit) : null };
        b.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }); bb = b.getBoundingClientRect();
        x = bb.left + bb.width / 2; y = bb.top + bb.height / 2; hit = document.elementFromPoint(x, y);
      }
      if (hit && (hit === b || b.contains(hit))) ok.push(edge ? { label: text(b), edgeCovered: edge } : text(b));
      else bad.push({ button: name(b), label: text(b), at: [Math.round(x), Math.round(y)], covered: hit ? name(hit) : null, ...(edge ? { alsoAtEdge: edge } : {}) });
    }
    res('primary-pixel', bad.length === 0, bad.length ? bad : { buttons: ok.slice(0, 10) });
  }
  return R;
}

/* theme-font, the document half (J-1). Runs right after inPageLint, in the same state.
   o = { want: 'inter' | 'poppins' | 'ibm plex mono', uses: [{family, weight, style}] } (code uses IBM Plex Mono in retro, JetBrains Mono elsewhere).
   - faces: every @font-face family (FontFaceSet and CSSOM rules) is Inter, Poppins, IBM Plex Mono or JetBrains Mono;
   - newsreader: the word appears nowhere (markup, inline CSS and scripts, CSSOM rules, font set);
   - uses: for every (family, weight, style) pmx text uses, document.fonts.check() passes AND a loaded
     @font-face of that family covers that exact weight and style (check() alone returns true
     for a family that has no face at all, so it cannot prove the face is embedded). */
export async function inPageFonts(o) {
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 3000))]); } catch (e) { }
  const norm = s => String(s || '').trim().replace(/^["']|["']$/g, '').toLowerCase();
  const ALLOWED = ['inter', 'poppins', 'ibm plex mono', 'jetbrains mono'];
  const DISPLAY = { inter: 'Inter', poppins: 'Poppins', 'ibm plex mono': 'IBM Plex Mono', 'jetbrains mono': 'JetBrains Mono' };
  const faces = [...document.fonts].map(f => ({ family: norm(f.family), weight: String(f.weight), style: f.style, status: f.status }));
  const ruleFams = new Set(); let cssomHits = 0;
  const walk = rules => {
    for (const r of rules) {
      if (typeof CSSFontFaceRule !== 'undefined' && r instanceof CSSFontFaceRule) ruleFams.add(norm(r.style.getPropertyValue('font-family')));
      if (r.cssRules && r.cssRules.length) walk(r.cssRules); else if (/newsreader/i.test(r.cssText)) cssomHits++;
    }
  };
  for (const sh of [...document.styleSheets, ...(document.adoptedStyleSheets || [])]) { try { walk(sh.cssRules); } catch (e) { } }
  const fams = new Set([...faces.map(f => f.family), ...ruleFams]);
  const badFaces = [...fams].filter(f => !ALLOWED.includes(f));
  const src = document.documentElement.outerHTML;
  const ctx = []; const re = /newsreader/ig; let m, html = 0;
  while ((m = re.exec(src))) { html++; if (ctx.length < 4) ctx.push(src.slice(Math.max(0, m.index - 48), m.index + 24).replace(/\s+/g, ' ')); }
  const newsreader = { html, cssom: cssomHits, fontSet: faces.filter(f => /newsreader/.test(f.family)).length, contexts: ctx };
  const covers = (f, w) => { const p = f.weight.split(/\s+/).map(Number); return p.length > 1 ? w >= p[0] && w <= p[1] : w === p[0]; };
  const uses = (o.uses || []).map(u => {
    const want = u.family || o.want, fam = DISPLAY[want] || want;
    const check = document.fonts.check(u.style + ' ' + u.weight + ' 16px "' + fam + '"');
    const cand = faces.filter(f => f.family === want && f.style === u.style && covers(f, u.weight));
    /* no face at this exact weight: the browser snaps to the nearest one (or synthesizes it) */
    const same = faces.filter(f => f.family === want && f.style === u.style);
    const face = cand.some(f => f.status === 'loaded') ? 'loaded' : cand.length ? cand[0].status :
      same.length ? 'no face at ' + u.weight + ' (faces: ' + same.map(f => f.weight).join(', ') + ')' : 'no ' + u.style + ' face of ' + fam;
    return { family: want, weight: u.weight, style: u.style, check, face };
  });
  /* J-1 correction: --font-mono leads with IBM Plex Mono in retro and does not mention it elsewhere, where it leads
     with JetBrains Mono (DL-161 amended 2026-10-09) */
  const fm = getComputedStyle(document.body).getPropertyValue('--font-mono').trim();
  const fontMono = o.want === 'ibm plex mono' ? (/^['"]?ibm plex mono/i.test(fm) ? null : { fontMono: fm.slice(0, 80), want: "leads with 'IBM Plex Mono' (retro)" })
    : (/ibm plex mono/i.test(fm) || !/^['"]?jetbrains mono/i.test(fm) ? { fontMono: fm.slice(0, 80), want: "leads with 'JetBrains Mono' (IBM Plex Mono is retro-only)" } : null);
  return { families: [...fams], badFaces, newsreader, uses, fontMono };
}

/* crop support: draw a measurement bar for one crowding hit (red: a gap that is too small;
   orange: an overlap) and bring it into view inside its scroll container; unprep undoes both.
   The marker lives on <html>, outside the #pmRoot / #pmOverlayRoot observers. */
export async function inPagePrepCrop(g) {
  const sc = g.sc >= 0 ? (window.__pmxvSc || [])[g.sc] : null;
  const a = Object.assign({}, g.boxes[0]);
  let lo = Math.min(g.from, g.to), hi = Math.max(g.from, g.to);
  const F = g.axis === 'y' ? { l: a.l, r: a.r, t: Math.min(a.t, lo), b: Math.max(a.b, hi) } : { l: Math.min(a.l, lo), r: Math.max(a.r, hi), t: a.t, b: a.b };
  let vis = { l: 0, t: 0, r: innerWidth, b: innerHeight };
  const real = sc && sc !== document.scrollingElement && sc !== document.body && sc !== document.documentElement;
  if (real) { const b = sc.getBoundingClientRect(); vis = { l: Math.max(0, b.left + sc.clientLeft), t: Math.max(0, b.top + sc.clientTop), r: Math.min(innerWidth, b.left + sc.clientLeft + sc.clientWidth), b: Math.min(innerHeight, b.top + sc.clientTop + sc.clientHeight) }; }
  let dy = 0;
  if (real && g.extreme) {
    /* a hit judged at a scroll extreme: its boxes are already where they sit at that extreme */
    window.__pmxvRestore = { sc, top: sc.scrollTop };
    sc.scrollTo({ top: g.extreme === 'top' ? 0 : sc.scrollHeight, behavior: 'instant' });
  } else if (real && (F.t < vis.t + 4 || F.b > vis.b - 4)) {
    const before = sc.scrollTop;
    sc.scrollTo({ top: before + ((F.t + F.b) / 2 - (vis.t + vis.b) / 2), behavior: 'instant' });
    dy = sc.scrollTop - before;
    window.__pmxvRestore = { sc, top: before };
  }
  if (dy) { F.t -= dy; F.b -= dy; a.t -= dy; a.b -= dy; if (g.axis === 'y') { lo -= dy; hi -= dy; } }
  const cx = g.axis === 'x' ? (lo + hi) / 2 : (F.l + F.r) / 2, cy = g.axis === 'y' ? (lo + hi) / 2 : (F.t + F.b) / 2;
  let w = Math.min(760, Math.max(220, F.r - F.l + 56)), h = Math.min(420, Math.max(84, F.b - F.t + 40));
  const x = Math.max(0, Math.min(innerWidth - w, cx - w / 2)), y = Math.max(0, Math.min(innerHeight - h, cy - h / 2));
  w = Math.min(w, innerWidth - x); h = Math.min(h, innerHeight - y);
  if (w < 8 || h < 8 || F.b < 0 || F.t > innerHeight) return null;
  const host = document.createElement('div');
  host.id = '__pmxv_mark';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;contain:strict';
  const col = g.to < g.from ? '#ff9f1a' : '#ff2d6f';
  const bar = (l, t, bw, bh) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:' + l + 'px;top:' + t + 'px;width:' + bw + 'px;height:' + bh + 'px;background:' + col + ';box-shadow:0 0 0 1px rgba(255,255,255,.55)'; host.appendChild(d); };
  if (g.axis === 'y') {
    let bx = a.l - 7; if (bx < x + 3) bx = a.r + 5; if (bx > x + w - 3) bx = a.l + 2;
    bar(bx - 1, lo, 2, Math.max(1, hi - lo)); bar(bx - 5, lo - 0.5, 10, 1); bar(bx - 5, hi - 0.5, 10, 1);
  } else {
    let by = a.t - 6; if (by < y + 3) by = a.b + 4; if (by > y + h - 3) by = a.t + 2;
    bar(lo, by - 1, Math.max(1, hi - lo), 2); bar(lo - 0.5, by - 5, 1, 10); bar(hi - 0.5, by - 5, 1, 10);
  }
  document.documentElement.appendChild(host);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), scrolled: !!dy || !!g.extreme };
}
export function inPageUnprepCrop() {
  const m = document.getElementById('__pmxv_mark'); if (m) m.remove();
  const r = window.__pmxvRestore; if (r) { r.sc.scrollTo({ top: r.top, behavior: 'instant' }); window.__pmxvRestore = null; }
}

/* measure cards for the tick check */
function inPageCards(o) {
  const skipped = el => !!(el.closest('[data-pmx-preview]') || el.closest('.pmx-ghost'));
  return [...document.querySelectorAll(o.sel || '.pmx-run')].filter(c => !skipped(c)).map(c => {
    const body = c.querySelector(':scope > .pmx-run-body');
    const sig = [c.getAttribute('data-density'), c.getAttribute('data-tone'), c.querySelectorAll('.pmx-lane').length, c.querySelectorAll('.pmx-decision').length, body ? body.children.length : 0,
      c.querySelectorAll('.pmx-actions .pmx-act').length].join('/');
    return { k: c.getAttribute('data-k') || c.getAttribute('data-run-id'), h: c.offsetHeight, rh: Math.round(c.getBoundingClientRect().height * 10) / 10, sig };
  });
}

/* running animations inside pmx surfaces and their transcript hosts (reduced-motion census). Review cycle 1:
   a host .message animating around a card (styles.css message-arrive) is motion around the pmx surface too,
   so the census counts `.message:has(<a pmx surface>)` and everything inside it (the surfaces come from
   PM56_PMX.SURFACES when the page exports them, else .pmx-run) */
export function inPageHostSel() {
  const P = window.PM56_PMX;
  const list = ['.pmx-run'].concat(P && Array.isArray(P.SURFACES) ? P.SURFACES.map(String).map(x => /^[.#\[]/.test(x) ? x : '.' + x) : []);
  const sel = '.message:has(' + [...new Set(list)].join(', ') + ')';
  try { document.querySelector(sel); return sel; } catch (e) { return '.message:has(.pmx-run)'; }
}
function inPageRunning(hostSel) {
  const isPmxEl = el => !!(el && el.classList && [...el.classList].some(c => c.indexOf('pmx-') === 0));
  const inPmx = el => { for (let p = el; p; p = p.parentElement) if (isPmxEl(p)) return true; return !!(hostSel && el && el.closest && el.closest(hostSel)); };
  const el0 = t => t && (t.nodeType === 1 ? t : t.parentElement);
  const running = document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target && inPmx(el0(a.effect.target)) && !el0(a.effect.target).closest('[data-pmx-preview]'));
  const ghosts = document.querySelectorAll('.pmx-ghost, .pmx-flight').length;
  return {
    ghosts,
    running: running.slice(0, 12).map(a => {
      const t = el0(a.effect.target), tm = a.effect.getComputedTiming();
      return { anim: a.animationName || a.id || 'waapi', target: (t.className && (t.className.baseVal != null ? t.className.baseVal : t.className)).toString().split(' ').slice(0, 2).join('.'), duration: tm.duration, iterations: tm.iterations, progress: Math.round((tm.progress || 0) * 100) / 100 };
    }),
    count: running.length
  };
}

/* The reduced-motion census recorder (IMPACT A1-03: "0 running animations immediately after a state
   change", 5.7: "the end state appears in the same frame as the state change"). Armed BEFORE the
   change: it notes every CSS animation that starts, every CSS transition that runs and every WAAPI
   call on a pmx target, and samples document.getAnimations() every frame, so a motion that starts and
   ends between two reads (a 120 ms fade) is still seen. Collect disarms it. */
export function inPageCensusArm(hostSel) {
  const isPmxEl = el => !!(el && el.classList && [...el.classList].some(c => c.indexOf('pmx-') === 0));
  const inPmx = el => { for (let p = el; p; p = p.parentElement) if (isPmxEl(p)) return true; return !!(hostSel && el && el.closest && el.closest(hostSel)); };
  const el0 = t => t && (t.nodeType === 1 ? t : t.parentElement);
  const skip = el => !!(el.closest && el.closest('[data-pmx-preview]'));
  const nm = el => el.tagName.toLowerCase() + ([...(el.classList || [])].slice(0, 2).map(c => '.' + c).join(''));
  if (window.__pmxvCensus) { try { window.__pmxvCensus.disarm(); } catch (e) { } }
  const R = window.__pmxvCensus = { t0: performance.now(), started: [], more: 0, frames: 0, maxRunning: 0, maxGhosts: 0, stop: false, seen: new Set() };
  const push = x => { if (R.started.length < 40) R.started.push(x); else R.more++; };
  const note = (kind, t, what) => { const el = el0(t); if (!el || !inPmx(el) || skip(el)) return; push({ kind, what, target: nm(el), at: Math.round(performance.now() - R.t0) }); };
  const onA = e => note('css-animation', e.target, e.animationName + (e.pseudoElement || ''));
  const onT = e => note('css-transition', e.target, e.propertyName + (e.pseudoElement || ''));
  document.addEventListener('animationstart', onA, true);
  document.addEventListener('transitionrun', onT, true);
  const orig = Element.prototype.animate;
  Element.prototype.animate = function (k, o) { note('waapi', this, (o && o.id) || 'animate()'); return orig.call(this, k, o); };
  R.sample = () => {
    const run = document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.target && inPmx(el0(a.effect.target)) && !skip(el0(a.effect.target)));
    const ghosts = document.querySelectorAll('.pmx-ghost, .pmx-flight').length;
    R.frames++; R.maxRunning = Math.max(R.maxRunning, run.length); R.maxGhosts = Math.max(R.maxGhosts, ghosts);
    for (const a of run) if (!R.seen.has(a)) { R.seen.add(a); push({ kind: 'running', what: a.animationName || a.transitionProperty || a.id || 'waapi', target: nm(el0(a.effect.target)), at: Math.round(performance.now() - R.t0) }); }
  };
  R.disarm = () => { R.stop = true; document.removeEventListener('animationstart', onA, true); document.removeEventListener('transitionrun', onT, true); Element.prototype.animate = orig; };
  const loop = () => { if (R.stop) return; R.sample(); if (performance.now() - R.t0 < 15000) requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  return true;
}
export function inPageCensusCollect() {
  const R = window.__pmxvCensus; if (!R) return null;
  R.sample(); R.disarm(); window.__pmxvCensus = null;
  return { started: R.started, more: R.more, maxRunning: R.maxRunning, maxGhosts: R.maxGhosts, frames: R.frames, ms: Math.round(performance.now() - R.t0) };
}

/* The effects ledger (IMPACT A2-26): every durable counter the page exposes. `L` must not move across
   open -> edit -> cancel; `info` (a hash per PM56_RUNTIME store) is reported, never judged (drafts and
   UI flags live there too). */
export function inPageLedger() {
  const L = {}, put = (k, v) => { if (typeof v === 'number' && isFinite(v)) L[k] = v; };
  const W = window;
  try { const e = W.PM56_COLLAB && W.PM56_COLLAB.effects(); if (e) for (const k of Object.keys(e)) put('collab.' + k, e[k]); } catch (x) { }
  try { put('collab.runs', W.PM56_COLLAB.runs().length); } catch (x) { }
  try {
    const eng = W.PM56_BSD && W.PM56_BSD.engine;
    if (eng && eng.assignments) {
      const sum = { providerCalls: 0, costUsd: 0, inputTokens: 0, outputTokens: 0, localEvaluations: 0, findings: 0 };
      for (const a of eng.assignments.values()) { const u = a.usage || {}; for (const k of ['providerCalls', 'costUsd', 'inputTokens', 'outputTokens', 'localEvaluations']) sum[k] += Number(u[k]) || 0; sum.findings += (a.findings || []).length; }
      for (const k of Object.keys(sum)) put('bsd.' + k, sum[k]);
      put('bsd.assignments', eng.assignments.size); put('bsd.receipts', (eng.receipts || []).length);
    }
  } catch (x) { }
  try { put('teach.records', W.PM56_TEACH.all().length); } catch (x) { }
  try { put('memory.records', W.PM56_AUTO_MEMORY.all().length); } catch (x) { }
  try { const th = W.PM56_EXT.ctx().state.threads; put('threads.count', th.length); put('threads.messages', th.reduce((n, t) => n + ((t.messages || []).length), 0)); } catch (x) { }
  const info = {};
  try {
    const RT = W.PM56_RUNTIME || {};
    for (const k of Object.keys(RT)) { let s = ''; try { s = JSON.stringify(RT[k]) || ''; } catch (x) { s = 'unserializable'; } let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; info[k] = h; }
  } catch (x) { }
  let draft = null; try { draft = W.PM56_COLLAB ? !!W.PM56_COLLAB.draft() : null; } catch (x) { }
  const ae = document.activeElement;
  const focus = !ae || ae === document.body ? 'body' : ae.tagName.toLowerCase() + ([...ae.classList].slice(0, 2).map(c => '.' + c).join('')) + (ae.getAttribute('data-action') ? '[data-action=' + ae.getAttribute('data-action') + ']' : '');
  const head = document.querySelector('#pmOverlayRoot .pmx-sheet .mdl-title strong, #pmOverlayRoot .pmx-sheet h2');
  return { L, info, draft, focus, sheets: document.querySelectorAll('#pmOverlayRoot .pmx-sheet').length, title: head ? head.textContent.trim().slice(0, 60) : '' };
}
/* count calls of named page functions ('PM56_CREW.evaluate') while the ledger runs */
export function inPageSpyArm(spec) {
  const S = window.__pmxvSpy = { calls: {}, restore: [] };
  for (const p of Object.keys(spec || {})) {
    const seg = p.split('.'); let obj = window; for (const s of seg.slice(0, -1)) obj = obj && obj[s];
    const k = seg[seg.length - 1];
    if (!obj || typeof obj[k] !== 'function') { S.calls[p] = -1; continue; }
    const f = obj[k]; S.calls[p] = 0;
    /* closing (CREW-A): the wrapper keeps the function's own properties and arity, so a declared flag such as
       PM56_CREW.evaluate.dryRun survives the spy */
    const w = function () { S.calls[p]++; return f.apply(this, arguments); };
    try { Object.defineProperty(w, 'length', { value: f.length }); } catch (e) { }
    Object.assign(w, f);
    obj[k] = w;
    S.restore.push(() => { obj[k] = f; });
  }
  return S.calls;
}
export function inPageSpyCollect() { const S = window.__pmxvSpy; if (!S) return {}; S.restore.forEach(f => f()); window.__pmxvSpy = null; return S.calls; }

/* ------------------------------------------------------------------ factories */
export const factories = {
  /* A wand sheet: `group` is assist | work | schedule | memory | preferences. `canon`, `edit`, `ledger`,
     `ledgerWays` and `ledgerSpy` pass through (see the surface shape in the header). */
  wand(id, o) {
    return {
      id, title: o.title || id, kind: 'sheet', tags: ['app', 'wand'].concat(o.tags || []), common: o.common !== false, roots: o.roots, rosterMayScroll: o.rosterMayScroll, rosterScrollAfterYield: o.rosterScrollAfterYield,
      canon: o.canon, edit: o.edit, ledger: o.ledger, ledgerWays: o.ledgerWays, ledgerSpy: o.ledgerSpy, setup: o.setup,
      async open(h) { const ok = await h.wandDialog(o.group, o.sel, o.hover); if (!ok) throw new Error('wand row not found: ' + o.sel); if (o.then) await o.then(h); },
      async after(h) { await h.closeAll(); }
    };
  },
  /* A recorded demo driven to a state: `action`/`flow` as in lib/pm.mjs, then `drive` steps. */
  demo(id, o) {
    return {
      id, title: o.title || id, kind: o.kind || 'chat', tags: ['app', 'demo'].concat(o.tags || []), layouts: o.layouts, roots: o.roots, tick: o.tick, change: o.change, stream: o.stream, canon: o.canon,
      async open(h) { await h.closeAll(); if (o.thread) await h.selectThread(o.thread); await h.demo(o.action, o.flow); if (o.drive) await h.drive(o.drive, o.gap || 2200); if (o.then) await o.then(h); await h.settle(); },
      async after(h) { await h.closeAll(); }
    };
  }
};

/* ------------------------------------------------------------------ registry */
async function loadRegistry() {
  const dirs = [path.join(TESTS, 'pmx-surfaces'), ...opts.surfacesDirs];
  const list = [], seen = new Map();
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).filter(f => f.endsWith('.mjs') && !f.startsWith('_')).sort()) {
      const mod = await import(pathToFileURL(path.join(d, f)).href);
      let arr = mod.default;
      if (typeof arr === 'function') arr = await arr(factories);
      if (!Array.isArray(arr)) throw new Error(path.join(d, f) + ': default export must be an array of surfaces or a function returning one');
      for (const s of arr) {
        if (!s || !s.id || typeof s.open !== 'function') throw new Error(path.join(d, f) + ': every surface needs an id and open()');
        if (!['sheet', 'chat', 'view'].includes(s.kind)) throw new Error(s.id + ': kind must be sheet, chat or view');
        if (seen.has(s.id)) throw new Error('duplicate surface id ' + s.id + ' in ' + f + ' and ' + seen.get(s.id));
        seen.set(s.id, f); list.push(Object.assign({ file: path.join(d, f), tags: [] }, s));
      }
    }
  }
  return list;
}
function select(reg, patterns) {
  const out = [];
  for (const p of patterns) {
    let m;
    if (p.startsWith('@')) m = reg.filter(s => (s.tags || []).includes(p.slice(1)));
    else if (p.includes('*')) { const re = new RegExp('^' + p.split('*').map(x => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$'); m = reg.filter(s => re.test(s.id)); }
    else m = reg.filter(s => s.id === p);
    if (!m.length) throw new Error('no surface matches ' + p);
    for (const s of m) if (!out.includes(s)) out.push(s);
  }
  return out;
}

/* ------------------------------------------------------------------ theme-font, document half + rendered face */
/* CSS.getPlatformFontsForNode for the sampled elements (window.__pmxvFontEls): which font file
   actually drew the glyphs. This is the proof that computed style alone cannot give: a family
   name with no embedded face silently renders in a system font (Liberation Mono, DejaVu Sans). */
async function platformFonts(cdp) {
  const out = [];
  let obj = null;
  try {
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    await cdp.send('DOM.getDocument', { depth: 0 });
    const ev = await cdp.send('Runtime.evaluate', { expression: 'window.__pmxvFontEls || []' });
    obj = ev.result && ev.result.objectId;
    if (!obj) return out;
    const props = await cdp.send('Runtime.getProperties', { objectId: obj, ownProperties: true });
    for (const p of props.result) {
      if (!/^\d+$/.test(p.name) || !p.value || !p.value.objectId) continue;
      try {
        const { nodeId } = await cdp.send('DOM.requestNode', { objectId: p.value.objectId });
        if (nodeId) out[+p.name] = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
      } catch (e) { /* the node went away: no sample */ }
    }
  } finally {
    if (obj) await cdp.send('Runtime.releaseObject', { objectId: obj }).catch(() => { });
    await cdp.send('CSS.disable').catch(() => { });
    await cdp.send('DOM.disable').catch(() => { });
  }
  return out;
}
async function fontDocument(h, cdp, res, font) {
  const doc = await h.ev(inPageFonts, { want: font.want, uses: font.uses });
  const plat = cdp ? await platformFonts(cdp) : [];
  const rendered = [], fallback = [];
  plat.forEach((fonts, i) => {
    if (!fonts || !fonts.length) return;
    const smp = font.sample[i] || {}, want = smp.want || font.want;
    /* code is a theme face too: IBM Plex Mono in retro, JetBrains Mono elsewhere (DL-161 amended 2026-10-09) */
    const isWant = f => f.isCustomFont && f.familyName.toLowerCase().startsWith(want);
    const sorted = fonts.slice().sort((a, b) => b.glyphCount - a.glyphCount);
    if (!isWant(sorted[0])) rendered.push({ el: smp.el, text: smp.text, rendered: sorted[0].familyName + (sorted[0].isCustomFont ? '' : ' (system font)'), glyphs: sorted[0].glyphCount, want });
    for (const f of sorted.slice(1)) if (f.glyphCount > 0 && !isWant(f)) fallback.push({ el: smp.el, text: smp.text, font: f.familyName + (f.isCustomFont ? '' : ' (system font)'), glyphs: f.glyphCount, want });
  });
  const probs = {};
  if (doc.badFaces.length) probs.fontFaces = doc.badFaces;
  const nr = doc.newsreader;
  if (nr.html || nr.cssom || nr.fontSet) probs.newsreader = nr;
  const badUses = doc.uses.filter(u => !u.check || u.face !== 'loaded');
  if (badUses.length) probs.fontsCheck = badUses;
  if (doc.fontMono) probs.fontMono = doc.fontMono;
  if (rendered.length) probs.rendered = { count: rendered.length, of: plat.filter(Boolean).length, samples: rendered.slice(0, 8) };
  /* a glyph the theme face lacks (an arrow outside the latin subset) is drawn by another font */
  if (fallback.length) probs.fallbackGlyphs = { count: fallback.length, samples: fallback.slice(0, 8) };
  if (!res.pass) probs.elements = res.detail;
  const pass = Object.keys(probs).length === 0;
  return { pass, detail: pass ? { theme: font.theme, family: font.want, families: doc.families, uses: doc.uses, renderedSamples: plat.filter(Boolean).length } : Object.assign({ theme: font.theme, want: font.want }, probs) };
}

/* ------------------------------------------------------------------ crowding crops */
let cropDir = null, cropCount = 0;
const CROPS = new Map();
const CROP_CAP = (n => n > 0 ? n : Infinity)(parseInt(opts['crop-cap'] == null ? '24' : opts['crop-cap'], 10) || 0);
/* every hit is returned with `crop` (a PNG at 2x of the hit with its gap marked, or the crop of the
   same hit earlier in this surface and theme) or `crop: null` with `cropNote`. New crops per lint
   pass are capped (--crop-cap, default 24, 0 = none), taken round-robin over the rule ids. */
async function cropHits(h, cdp, s, where, hits) {
  const out = hits.map(x => Object.assign({}, x));
  if (!cropDir || !cdp) { for (const x of out) { x.crop = null; x.cropNote = 'crops off'; } return out; }
  const keyOf = x => [x.rule, x.text, x.in, x.line, x.box, x.side, x.control, x.a, x.b, x.upper, x.lower, x.row].map(v => v == null ? '' : v).join('|');
  const byRule = new Map();
  for (const x of out) { if (!byRule.has(x.rule)) byRule.set(x.rule, []); byRule.get(x.rule).push(x); }
  const order = [];
  for (let i = 0; order.length < out.length; i++) for (const arr of byRule.values()) if (arr[i]) order.push(arr[i]);
  const base = [s.id, where.theme, where.at, where.layout].filter(Boolean).join('__').replace(/[^\w.-]+/g, '_');
  let made = 0, scrolled = false;
  for (const x of order) {
    const key = s.id + '|' + where.theme + '|' + keyOf(x);
    if (CROPS.has(key)) { x.crop = CROPS.get(key); x.cropNote = 'same hit as this crop'; continue; }
    if (!x.geo) { x.crop = null; x.cropNote = 'no geometry'; continue; }
    if (made >= CROP_CAP) { x.crop = null; x.cropNote = 'crop cap'; continue; }
    try {
      const clip = await h.ev(inPagePrepCrop, x.geo);
      if (clip) {
        if (clip.scrolled) scrolled = true;
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h, scale: 2 } });
        const file = path.join(cropDir, base + '__' + x.rule + '__' + (++cropCount) + '.png');
        fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
        CROPS.set(key, file); x.crop = file; made++;
      } else { x.crop = null; x.cropNote = 'off screen'; }
    } catch (e) { x.crop = null; x.cropNote = 'crop failed: ' + String(e && e.message || e).slice(0, 80); }
    await h.ev(inPageUnprepCrop).catch(() => { });
  }
  if (scrolled) await h.wait(450);
  return out;
}

/* ------------------------------------------------------------------ run */
const results = [];
let fails = 0, passes = 0, skips = 0;
function record(surface, check, pass, where, detail) {
  if (!on(check)) return;
  const row = { surface: surface.id, check, pass: pass === null ? null : !!pass, theme: where.theme || null, at: where.at || null, layout: where.layout || null, detail: detail === undefined ? null : detail };
  results.push(row);
  const tag = pass === null ? 'SKIP' : pass ? 'PASS' : 'FAIL';
  if (pass === null) skips++; else if (pass) passes++; else fails++;
  if (tag !== 'PASS' || opts.verbose) console.log(`${tag}  ${surface.id}  ${check}  ${[where.theme, where.at, where.layout].filter(Boolean).join(' ')}${detail !== undefined && detail !== null ? '  ' + JSON.stringify(detail).slice(0, opts.verbose ? 600 : 400) : ''}`);
}

async function main() {
  const reg = await loadRegistry();
  if (opts.list || !opts.patterns.length) {
    console.log('pmx surfaces (' + reg.length + '):');
    for (const s of reg) console.log(`  ${s.id.padEnd(34)} ${s.kind.padEnd(6)} ${(s.tags || []).map(t => '@' + t).join(' ').padEnd(24)} ${s.title || ''}`);
    if (!opts.list) usage('no surfaces named');
    return 0;
  }
  const surfaces = select(reg, opts.patterns);
  const jsonOut = opts.json ? guardOut(opts.json) : null;
  const shotDir = opts.shots ? guardOut(opts.shots) : null;
  if (shotDir) fs.mkdirSync(shotDir, { recursive: true });
  /* crowding crops: --crops dir, else next to --json (<name>-crops/), else under --shots (crops/) */
  cropDir = opts['no-crops'] ? null : opts.crops ? guardOut(opts.crops) : jsonOut ? guardOut(jsonOut.replace(/\.json$/i, '') + '-crops') : shotDir ? guardOut(path.join(shotDir, 'crops')) : null;
  if (cropDir) fs.mkdirSync(cropDir, { recursive: true });
  if (!fs.existsSync(FILE)) usage('no such file ' + FILE);
  const md = longMarkdown();
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--allow-file-access-from-files'] });
  const t0 = Date.now();
  for (const s of surfaces) {
    const st0 = Date.now();
    let page = null, errors = [], h = null, cdp = null;
    const where0 = {};
    try {
      ({ page, errors, h } = await openApp(browser, FILE));
      cdp = await page.context().newCDPSession(page);
      if (s.setup) await s.setup(h);
      const themes = s.themes || THEMES;
      const layouts = s.kind === 'chat' ? (s.layouts || CHAT_LAYOUTS) : [null];
      const lintOpts = at => ({
        kind: s.kind, roots: s.roots || null, budget: s.kind === 'chat' ? BUDGET : null, nominal: NOMINAL, strictUnique: STRICT_UNIQUE, rosterMayScroll: !!s.rosterMayScroll, rosterAfterYield: (s.rosterScrollAfterYield || []).includes(at), canon: s.canon || null, routes: s.routes || null,
        noScroll: !!s.common && NO_SCROLL_SIZES.includes(at), containers: s.kind === 'chat' ? ['.transcript'] : s.kind === 'view' ? ['.pmx-view'] : [], checks: []
      });
      const FULL = ['no-pill', 'no-stripe', 'no-emoji', 'no-missing-glyph', 'h-overflow', 'clipped-text', 'sheet-in-viewport', 'no-scroll', 'no-spill', 'plate-labels', 'card-budget', 'route-stack', 'unique-controls', 'loop-census', 'no-bleed',
        'surfaces-list', 'forbidden-props', 'canon-names', 'parts', 'harness-nodes', 'crowding', 'theme-font', 'primary-pixel'];
      /* budgets are judged in the transcript layouts (card widths 417 / 591 / ~337 / 391 / 311 / 230 / 204, tier by width), not in the
         700 size sweep; a size a pinned-WxH layout covers (900x800) is not swept again after the `pinned` layout */
      /* crowding runs at every size too: J-2 says space running short wraps, truncates or drops, never compresses */
      const GEOM = ['h-overflow', 'clipped-text', 'sheet-in-viewport', 'no-scroll', 'no-spill', 'route-stack', 'crowding', 'primary-pixel'];
      const lint = async (list, where) => {
        const o = lintOpts(where.at); o.checks = list.filter(on);
        /* primary-pixel may scroll a card into view: it runs after the crops, in its own pass */
        const pixel = o.checks.includes('primary-pixel');
        if (pixel) o.checks = o.checks.filter(c => c !== 'primary-pixel');
        const r = await h.ev(inPageLint, o);
        if (on('present')) {
          const okPresent = s.kind === 'sheet' ? r.roots === 1 : r.roots > 0;
          record(s, 'present', okPresent, where, okPresent ? { roots: r.roots } : { roots: r.roots, names: r.rootNames });
          if (!okPresent) return false;
        }
        if (r.results['theme-font'] && r.font) r.results['theme-font'] = await fontDocument(h, cdp, r.results['theme-font'], r.font);
        if (r.results.crowding && !r.results.crowding.pass) r.results.crowding.detail.hits = await cropHits(h, cdp, s, where, r.hits || []);
        if (pixel) { const r2 = await h.ev(inPageLint, Object.assign({}, o, { checks: ['primary-pixel'] })); Object.assign(r.results, r2.results); }
        for (const [id, v] of Object.entries(r.results)) record(s, id, v.pass, where, v.detail);
        return true;
      };
      let first = true;
      for (const theme of themes) {
        await h.theme(theme);
        for (const layout of layouts) {
          await h.setSize(1440, 900);
          if (layout) await h.chatLayout(layout);
          await s.open(h, { theme, layout });
          await h.settle();
          const vp = page.viewportSize();
          const where = { theme, at: vp.width + 'x' + vp.height, layout };
          const okPresent = await lint(FULL, where);
          if (shotDir) await page.screenshot({ path: path.join(shotDir, `${s.id.replace(/[^\w.-]+/g, '_')}-${theme}${layout ? '-' + layout : ''}.png`) });
          if (okPresent && layout === layouts[0]) {
            /* the sweep skips the layout's own window (`home`: 1440x900, or a pinned-WxH / wNNN layout's window) and, after
               the `pinned` layout, a size a pinned-WxH layout covers; it returns to the home window afterwards */
            const covered = layout === 'pinned' ? new Set(layouts.map(l => (/^pinned-(\d+x\d+)$/.exec(l) || [])[1]).filter(Boolean)) : new Set();
            covered.add(vp.width + 'x' + vp.height);
            for (const [w, hh] of (s.sizes || SIZES[s.kind]).filter(([w, hh]) => !covered.has(w + 'x' + hh))) {
              if (opts.quick && !(w === 1280 || w === 700)) continue;
              await h.setSize(w, hh); await h.settle();
              await lint(GEOM, { theme, at: w + 'x' + hh, layout });
              if (shotDir) await page.screenshot({ path: path.join(shotDir, `${s.id.replace(/[^\w.-]+/g, '_')}-${theme}-${w}x${hh}.png`) });
            }
            await h.setSize(vp.width, vp.height);
            /* transcript variants (10.4 G-35), in every theme (--once-first: the first theme only) */
            if ((first || !opts['once-first']) && s.kind === 'chat' && !opts.quick) {
              const orig = await h.ev(() => window.PM56_DEMO.snapshot().variants[5]);
              for (const v of (s.variants || TRANSCRIPT_VARIANTS)) {
                await h.ev(v => window.PM56_DEMO.setVariant(5, v), v); await h.settle();
                await lint(['no-bleed', 'no-stripe', 'no-pill', 'h-overflow', 'clipped-text', 'card-budget'], { theme, at: vp.width + 'x' + vp.height, layout: (layout || '') + ' variant ' + v });
              }
              await h.ev(v => window.PM56_DEMO.setVariant(5, v), orig); await h.settle();
            }
          }
          if (s.after) await s.after(h);
        }
        /* IMPACT A2-25: the state checks (tick-height, the reduced census, streaming) run in every theme
           (retro's own motion tokens can undo reduced motion); the effects ledger is behaviour, not look,
           and runs once, in the first theme (--once-all runs it in every theme too) */
        if (first || !opts['once-first']) {
          await onceChecks(s, h, page, { theme, layout: layouts[0] }, md, { ledger: first || !!opts['once-all'] });
          first = false;
        }
      }
    } catch (e) {
      record(s, 'present', false, where0, 'harness: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | '));
    }
    record(s, 'page-errors', errors.length === 0, {}, errors.length ? errors.slice(0, 8) : undefined);
    if (cdp) await cdp.detach().catch(() => { });
    if (page) await page.close();
    console.log(`--  ${s.id}  ${((Date.now() - st0) / 1000).toFixed(1)} s`);
  }
  await browser.close();
  const byCheck = {};
  for (const r of results) { const b = byCheck[r.check] = byCheck[r.check] || { pass: 0, fail: 0, skip: 0 }; b[r.pass === null ? 'skip' : r.pass ? 'pass' : 'fail']++; }
  const summary = { pass: passes, fail: fails, skip: skips, surfaces: surfaces.map(s => s.id), themes: THEMES, secs: Math.round((Date.now() - t0) / 1000), byCheck };
  summary.crops = cropCount; summary.cropDir = cropDir;
  console.log('pmx-verify: ' + passes + ' pass, ' + fails + ' fail, ' + skips + ' skip · ' + surfaces.length + ' surfaces · ' + summary.secs + ' s' + (cropDir ? ' · ' + cropCount + ' crowding crops in ' + cropDir : ''));
  for (const [c, b] of Object.entries(byCheck)) if (b.fail) console.log('   ' + c.padEnd(22) + ' fail ' + b.fail + ' / ' + (b.pass + b.fail));
  if (jsonOut) { fs.mkdirSync(path.dirname(jsonOut), { recursive: true }); fs.writeFileSync(jsonOut, JSON.stringify({ tool: 'pmx-verify', file: FILE, summary, results }, null, 1)); }
  return fails ? 1 : 0;
}

/* ------------------------------------------------------------------ effects ledger (IMPACT A2-26) */
const PROVIDER_KEY = /providerCalls|usageRecords|costUsd|inputTokens|outputTokens/;
const SHEET = '#pmOverlayRoot .pmx-sheet';
/* the default edit: type into the hero, one stepper +, one check, one switch word (real clicks) */
async function genericEdit(h) {
  const page = h.page, did = [];
  const firstVisible = async sel => { for (const el of await page.$$(sel)) { try { if (await el.isVisible() && await el.isEnabled()) return el; } catch (e) { } } return null; };
  try {
    let f = null;
    for (const sel of [`${SHEET} [data-pmx-autofocus]`, `${SHEET} .pmx-hero textarea`, `${SHEET} .pmx-hero input[type="text"]`, `${SHEET} textarea`, `${SHEET} input[type="text"]:not([readonly])`]) if ((f = await firstVisible(sel))) break;
    if (f) { await f.click({ timeout: 2000 }); await page.keyboard.press('End'); await page.keyboard.type(' ledger edit', { delay: 4 }); did.push('typed in ' + await f.evaluate(e => e.tagName.toLowerCase() + [...e.classList].slice(0, 2).map(c => '.' + c).join(''))); }
  } catch (e) { did.push('type failed: ' + String(e.message || e).slice(0, 60)); }
  for (const [sel, what] of [[`${SHEET} [data-action="pmx-step"][data-delta="1"]`, 'stepper +1'], [`${SHEET} .pmx-check`, 'check'],
    [`${SHEET} .pmx-switch [role="radio"][aria-checked="false"], ${SHEET} .pmx-switch button:not([aria-checked="true"]):not([aria-pressed="true"])`, 'switch word']]) {
    try { const el = await firstVisible(sel); if (el) { await el.click({ timeout: 2000 }); await h.wait(160); did.push(what); } } catch (e) { did.push(what + ' failed: ' + String(e.message || e).slice(0, 60)); }
  }
  return did;
}
async function closeBy(h, way) {
  const page = h.page;
  if (way === 'cancel' || way === 'close') {
    for (const el of await page.$$(`${SHEET} ${way === 'cancel' ? '.pmx-cancel' : '.pmx-close'}`)) if (await el.isVisible()) { await el.click({ timeout: 3000 }); return { found: true }; }
    return { found: false };
  }
  if (way === 'escape') { await page.keyboard.press('Escape'); return { found: true }; }
  /* the scrim: a point where it is the topmost element */
  const pt = await h.ev(() => {
    const s = document.querySelector('#pmOverlayRoot .pmx-scrim'); if (!s) return null;
    for (const [x, y] of [[8, 8], [innerWidth - 8, 8], [8, innerHeight - 8], [innerWidth - 8, innerHeight - 8], [innerWidth / 2, 6], [6, innerHeight / 2]]) if (document.elementFromPoint(x, y) === s) return [x, y];
    return null;
  });
  if (!pt) return { found: false };
  await page.mouse.click(pt[0], pt[1]);
  return { found: true, at: pt };
}
async function effectsLedger(s, h, page, W) {
  const ways = s.ledgerWays || ['cancel', 'escape', 'scrim', 'close'];
  const spy = s.ledgerSpy || null;
  const out = {}; let pass = true, ran = 0;
  const diff = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => a[k] !== b[k]).map(k => ({ key: k, before: a[k], after: b[k] }));
  for (const way of ways) {
    await h.closeAll(); await h.setSize(1440, 900);
    if (spy) await h.ev(inPageSpyArm, spy);
    const L0 = await h.ev(inPageLedger);
    await s.open(h, W); await h.settle();
    const opened = await h.ev(inPageLedger);
    if (!opened.sheets) { out[way] = { opened: false }; if (spy) await h.ev(inPageSpyCollect); continue; }
    const edits = s.edit ? await s.edit(h) : await genericEdit(h);
    await h.settle();
    const L1 = await h.ev(inPageLedger);
    const closed = await closeBy(h, way);
    await h.settle();
    let L2 = await h.ev(inPageLedger);
    const row = { edits };
    if (!closed.found) {
      if (way === 'cancel') { row.skipped = 'no visible Cancel (.pmx-cancel) on this sheet'; out[way] = row; await h.closeAll(); if (spy) await h.ev(inPageSpyCollect); continue; }
      row.problem = way === 'scrim' ? 'no point where the scrim is the topmost element' : 'no visible close (x) button';
    }
    ran++;
    /* a sheet that swaps back (Crew Auto -> Crew on Cancel / Escape) is legitimate; close what is left with its x */
    if (L2.sheets) {
      row.leftOpen = L2.title || '(untitled sheet)';
      for (const el of await page.$$(`${SHEET} .pmx-close`)) if (await el.isVisible()) { await el.click({ timeout: 3000 }); break; }
      await h.settle(); L2 = await h.ev(inPageLedger);
    }
    const calls = spy ? await h.ev(inPageSpyCollect) : null;
    const dEdit = diff(L0.L, L1.L), dClose = diff(L0.L, L2.L);
    const split = (list, prov) => list.filter(d => PROVIDER_KEY.test(d.key) === prov);
    const pick = prov => { const a = split(dEdit, prov), b = split(dClose, prov); return a.length || b.length ? { afterEdit: a, afterClose: b } : null; };
    const provider = pick(true), durable = pick(false);
    const infoChanged = Object.keys(Object.assign({}, L0.info, L2.info)).filter(k => L0.info[k] !== L2.info[k]);
    const unmet = calls ? Object.entries(spy).filter(([k, n]) => !(calls[k] >= n)).map(([k, n]) => ({ fn: k, calls: calls[k] === -1 ? 'not found' : calls[k], want: '>= ' + n })) : [];
    Object.assign(row, { focusAfter: L2.focus });
    if (provider) row.providerOrUsage = provider;
    if (durable) row.durable = durable;
    if (L2.sheets) row.stillOpen = L2.sheets;
    if (L2.draft) row.draftLeft = true;
    if (unmet.length) row.notReached = unmet;
    if (calls) row.calls = calls;
    if (infoChanged.length) row.runtimeStoresChanged = infoChanged;
    const ok = !row.problem && !provider && !durable && !L2.sheets && !L2.draft && !unmet.length;
    row.pass = ok; if (!ok) pass = false;
    out[way] = row;
  }
  await h.closeAll();
  if (!ran && Object.values(out).every(r => r.opened === false)) record(s, 'effects-ledger', null, W, { skipped: 'no pmx sheet opened (see present)', ways: out });
  else record(s, 'effects-ledger', pass, W, out);
}

/* the state checks, per surface and theme (see the call) */
async function onceChecks(s, h, page, where, md, o = {}) {
  const win = /^pinned-(\d+x\d+)$/.exec(where.layout || '');
  const W = Object.assign({ at: win ? win[1] : '1440x900' }, where);
  const reopen = async () => { await h.setSize(1440, 900); if (where.layout) await h.chatLayout(where.layout); await s.open(h, where); await h.settle(); };
  /* tick-height: chat and view surfaces with run cards */
  if (on('tick-height') && s.kind !== 'sheet') {
    await reopen();
    const samples = [];
    for (let i = 0; i < 10; i++) {
      samples.push(await h.ev(inPageCards, {}));
      if (s.tick) await s.tick(h, i); else await h.tickOnce();
      await h.wait(s.tickWait || 540);
    }
    samples.push(await h.ev(inPageCards, {}));
    if (!samples[0].length) record(s, 'tick-height', null, W, 'no run cards on this surface');
    else {
      const bad = [], per = {};
      for (const snap of samples) for (const c of snap) { const key = c.k + ' ' + c.sig; (per[key] = per[key] || []).push(c.h); }
      for (const [key, hs] of Object.entries(per)) { const mn = Math.min(...hs), mx = Math.max(...hs); if (mx - mn > 0) bad.push({ card: key, heights: [...new Set(hs)] }); }
      const boundaries = Object.keys(per).length - samples[0].length;
      record(s, 'tick-height', bad.length === 0, W, bad.length ? bad.slice(0, 10) : { cards: samples[0].length, ticks: 10, stateBoundaries: boundaries });
    }
    if (s.after) await s.after(h);
  }
  /* reduced-census (media) and reduced-census-class (body.pm56-reduced). IMPACT A1-03: reduced motion is
     the instant end state, so nothing may run IMMEDIATELY after the change, and nothing may start while
     it happens: the recorder is armed before the change, read at once when the change returns, and
     watched every frame for 500 ms more. */
  for (const variant of ['reduced-census', 'reduced-census-class']) {
    if (!on(variant)) continue;
    if (variant === 'reduced-census') await page.emulateMedia({ reducedMotion: 'reduce' });
    else await h.ev(() => document.body.classList.add('pm56-reduced'));
    try {
      await reopen();
      /* the state change: the surface's own change(), else close and open it again; no settling in between */
      const hostSel = await h.ev(inPageHostSel);
      await h.ev(inPageCensusArm, hostSel);
      h.noSettle = true;
      try {
        if (s.change) await s.change(h);
        else { await h.closeAll(); if (where.layout) await h.chatLayout(where.layout); await s.open(h, where); }
      } finally { h.noSettle = false; }
      const now = await h.ev(inPageRunning, hostSel);
      await h.wait(500);
      const rec = await h.ev(inPageCensusCollect);
      const pass = now.count === 0 && now.ghosts === 0 && !!rec && rec.maxRunning === 0 && rec.maxGhosts === 0 && rec.started.length === 0;
      record(s, variant, pass, W, pass ? { immediate: 0, frames: rec.frames, ms: rec.ms, hosts: hostSel } : { immediate: now, during: rec, hosts: hostSel });
      if (s.after) await s.after(h);
    } finally {
      await h.ev(() => { if (window.__pmxvCensus) { window.__pmxvCensus.disarm(); window.__pmxvCensus = null; } }).catch(() => { });
      if (variant === 'reduced-census') await page.emulateMedia({ reducedMotion: null });
      else await h.ev(() => document.body.classList.remove('pm56-reduced'));
    }
  }
  /* effects ledger (IMPACT A2-26): open -> edit -> close, once per way, nothing durable moves */
  if (on('effects-ledger') && s.kind === 'sheet' && o.ledger) {
    if (s.ledger === false) record(s, 'effects-ledger', null, W, 'surface opts out (ledger: false)');
    else await effectsLedger(s, h, page, W);
  }
  /* streaming realism */
  if (on('streaming') && s.kind !== 'sheet') {
    if (!s.stream) record(s, 'streaming', null, W, 'surface has no stream() hook');
    else {
      await reopen();
      const got = (await s.stream(h, md)) || {};
      await h.settle();
      const o = { kind: 'chat', roots: null, budget: BUDGET, nominal: NOMINAL, strictUnique: STRICT_UNIQUE, containers: ['.transcript'], checks: ['card-budget', 'h-overflow', 'clipped-text'] };
      const r = await h.ev(inPageLint, o);
      const bad = {};
      for (const [id, v] of Object.entries(r.results)) if (!v.pass) bad[id] = v.detail;
      let view = null;
      if (got.openView) {
        await got.openView(); await h.settle();
        view = await h.ev(first => {
          const v = document.querySelector('.pmx-view'); if (!v) return { found: false };
          const pres = [...v.querySelectorAll('pre')];
          const withCode = pres.filter(p => p.textContent.includes(first));
          const vb = v.getBoundingClientRect();
          const scroller = (() => { for (let p = v.parentElement; p; p = p.parentElement) { const cs = getComputedStyle(p); if (/auto|scroll/.test(cs.overflowX) || /auto|scroll/.test(cs.overflowY)) return p; } return document.scrollingElement; })();
          return {
            found: true, pre: pres.length, preWithCode: withCode.length,
            preScrollsInside: withCode.every(p => /auto|scroll/.test(getComputedStyle(p).overflowX) && p.getBoundingClientRect().right <= vb.right + 1),
            tableWrapped: v.querySelectorAll('.pmx-table-wrap table').length, tables: v.querySelectorAll('table').length,
            viewSideways: v.scrollWidth > v.clientWidth + 1 ? [v.scrollWidth, v.clientWidth] : null,
            paneSideways: scroller && scroller.scrollWidth > scroller.clientWidth + 1 ? [scroller.scrollWidth, scroller.clientWidth] : null,
            page: document.documentElement.scrollWidth > innerWidth + 1
          };
        }, 'export async function* exportCollection');
        const vok = view.found && view.preWithCode > 0 && view.preScrollsInside && view.tables > 0 && view.tableWrapped === view.tables && !view.viewSideways && !view.paneSideways && !view.page;
        if (!vok) bad.view = view;
      }
      record(s, 'streaming', Object.keys(bad).length === 0, W, Object.keys(bad).length ? bad : { words: md.split(/\s+/).length, cards: (r.results['card-budget'] || {}).detail, view });
    }
    if (s.after) await s.after(h);
  }
}

let code = 2;
if (isMain) try { code = await main(); } catch (e) { console.error('pmx-verify: ' + (e && /^refusing|^no surface|duplicate surface|default export|needs an id|kind must/.test(e.message) ? e.message : (e && e.stack || e))); code = 2; }
if (isMain) process.exit(code);
