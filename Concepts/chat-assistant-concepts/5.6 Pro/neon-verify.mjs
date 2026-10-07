/* neon-verify.mjs — the neon icon family's own verifier (TestPMChat5.6Pro, plan "Verification > node
 * neon-verify.mjs").
 *
 * OWNER: Neon icons. Written by a helper worker (M2, 2026-10-02) to the plan's list, reviewed and completed by
 * surface step 3E2 (2026-10-02), which added the checks the first draft lacked (bar, thread-row and To-Do
 * matrices, salience, status ink on concept and control glyphs, transcript halo ink) and closed the ways a check
 * could pass with nothing to measure. It reads the built page and never edits it.
 *
 *   node neon-verify.mjs [--file <html>] [--themes all|<id,id..>] [--json <out.json>] [--reduced]
 *
 * --file defaults to index.html next to this script. --themes defaults to every id in PM56_DATA.themes (ten on
 * the neon build: the eight of data.js plus NieR Dark and NieR Light, which paint Basic under
 * html[data-o55-nier="on"]). --reduced drives every page with reducedMotion:'reduce': the checks that need motion
 * (3 satellite, 7 hover-card start times, 13 salience) report SKIP and check 2 asserts the reduced end state.
 * Exit 0 all pass, 1 any FAIL, 2 bad invocation.
 *
 * WHAT IT CHECKS (numbers are the labels it prints)
 *   1  census: every <svg> outside the out-of-scope hosts is svg.nx (or a provider mark), PM56_NEON.misses is
 *      empty, no .pmx-glyph-missing; nine views (default, model menu, Demo Studio, a wand sheet, the wide thread
 *      list, and the Crew, BrainStorm, Review and Chat Room configure sheets, whose run preview must be in the view
 *      AND lit like the card: kind badge nx-r-concept with a painting halo, core stroke and the density's ink, status
 *      marks in .nx-st.nx-still with their tone's ink; fpfix F-1 and cycle 1, the preview's inert filter once
 *      stripped them bare) in every theme.
 *   2  status matrix: the 13 set members render their wrapper and tone; 7 animate, 5 stand still, complete's
 *      one-shot has iteration count 1 (every theme). 2b the bar: each item's root rhythm matches its
 *      html[data-ab-<domain>] tone (working/attention ab-breathe, blocked ab-alert, others none). 2e the bar's
 *      Crew, BrainStorm, Review and Chat Room tone is the worst of their runs' card state (PM56_COLLAB.presentState)
 *      on every thread; recovery-collaboration's blocked runs read attention. 2c the nine
 *      thread statuses in the wide take-6 rows carry .nx-st-<status>. 2d To-Do rows (the bar's To-Do hover card)
 *      carry the set member of their status.
 *   3  the working bead moves >= 3 px in a quarter of its 9 s orbit (alone and in the thread list), and only the bead
 *      moves: the ring is a full circle in the mark's static layer (final review, 2026-10-03).
 *   4  a clip reveal ran and left no residual clip-path after finish(); the page/document text lines paint.
 *   5  static scan: no filter, stroke-dashoffset or color-mix() in a .nx / nx- rule or an nx keyframe; no pmx in
 *      an nx keyframe name.
 *   6  hover leaves the bar's and the thread marks' svg animationName alone.  7  an open hover card keeps its
 *      animations' start times across 3 ticks.  8  nothing in .qs-sheet is infinite.  9  no history.css ph-* or
 *      spin keyframe on a .ph-status descendant.
 *   10 reduced motion, the media query and body.pm56-reduced: 0 running animations on svg.nx and .nx-st, halos
 *      still paint, complete's check is drawn (no clip).
 *   11 every theme: the idle ring reads below every live tone on the thread-row field (light themes: and >= 3:1).
 *      11b (hovered row) and 11c (selected, selected + hovered) test the order only: idle never reads above the lowest
 *      live tone on the same row state; raw ratios under 3:1 are information (lead decision, 2026-10-02). A mark
 *      whose svg is hidden (NieR's diamonds part draws working as the wrapper's ::after) is read by its ::after
 *      border ink. 11d measures what is painted: on a real idle row at rest, hovered, selected and selected +
 *      hovered, the idle mark's ink mass (against working's mean over twelve phases of its loops) and p99.5 pixel
 *      contrast (against working's lowest phase) are no more than the working mark's drawn in the same host
 *      (integrate fix cycle 1: NieR's bar inked idle full paper and its whole ring outweighed the rotateY-narrowed
 *      diamond while every colour check passed on equal inks; fix cycle 2: p99.5, no tolerance).
 *   12 a dark theme's backlight paints; NieR has no halo and no backlight.
 *   13 salience: waiting (needs you) has at least working's halo strength and frame-difference motion, on the real
 *      marks of the wide thread list, in every theme. Every animation on the page is paused and the two marks' are
 *      stepped together through 16.8 s (120 steps of 140 ms), so both are read at the same animation time.
 *   14 no status ink (danger, warning, positive, accent, accent-2) on a concept or control glyph at rest outside
 *      the hosts allowed to carry tone (basic-dark, friendly-dark, Query thread, wide list).
 *   15 transcript status glyphs: every halo is inked like its tube.
 *   16 NieR: no status block is blank (its glyph ink never equals the block it paints), every thread and 3 panels.
 *   17 17a hover lights a control's tube to --text (attach, header search, history close; every theme); 17b the hover
 *      ink rule never recolours a toned glyph (every thread, the composer menus, six panels; four themes).
 *   18 NieR's Pod 042 is clear of the jump chip, the bar, the queue, the decision panel and the composer (3 sizes,
 *      every thread, transcript top and bottom), of transcript buttons at the bottom, and faded back over any it passes.
 *   19 the chat header's status word wears its mark's tone (nine statuses; three themes).
 *   console: no warnings, errors or page errors.
 *
 * WHERE IT RUNS. Browser checks belong on jared-mac (INVOCATIONS.md recipe): copy the built index.html and this
 * file to ~/pm-motion-lab/neon/<run>/, symlink node_modules to ~/pm-motion-lab/node_modules, then
 *   cd ~/pm-motion-lab/neon/<run> && node neon-verify.mjs --json ../<run>-out/nv.json [--reduced]
 * It launches headless Chromium (Playwright's own; temporary profiles are removed on exit) and takes about
 * 14 minutes for ten themes (13 alone steps 120 frames per theme; --reduced about 10).
 *
 * WHAT IT WRITES. Nothing but stdout, and the --json file when given. It never writes a tracked file.
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

/* ---------------------------------------------------------------- census scope
 * Every <svg> in the document must carry class nx or nx-brand, EXCEPT inside
 * these out-of-scope hosts (INVENTORY §1c "Other <svg> emitters", confirmed
 * against neon-icons.js: only icon()/status()/pmxGlyph paths render svg.nx):
 * - .ctx-growth: context growth chart (context.js:780; app.js:3322 defers here)
 * - .ring-mini: activity dashboard mini ring (activity-panel.js:966)
 * - .ar-graph-svg: artifact revision graph, the svg itself (artifact-revisions.js:115)
 * - .artifact-preview, .mermaid-stage: diagram/flow/mermaid artifact previews (app.js:662+)
 * - .pm12-gauge, .pm12-scope: take-12 dial + grid/trace (variants-b.js:119,133,137)
 * - .pm13-sheet: take-13 schematic (variants-b.js:252; its nested icon() calls
 *   at variants-b.js:222 are svg.nx and pass either way, excluded here with it)
 * - .c19-sky, .c23-body: takes 19/23 route/progress drawings (variants-c.js:122,221)
 * - .pmx-plate-svg: pmx plates (module-shell.js:428)
 * - .pmx-mark: B1 seat marks, the markInner() svg (module-shell.js:284-306)
 * - .pmx-ag: agent dots (module-shell.js:978)
 * - .pmx-bubble-ring: scheduling bubble ring (scheduling.js:2621)
 * - .pmx-bsd-half: BSD half rings (bsd.js:242,247)
 * - .plan-sched-ribbon, .pmx-sched-strip: scheduling charts (scheduling.js:1146,2251)
 * - .sp-svg, .sp-mark: turn-stage spine (turn-stage.js:40,89; keeps its filter)
 * - .bc-capture-img: browser-capture image (browser-capture.js:326, an <img>)
 * - #o55np-pod: NieR's Pod 042, an illustration (nier-parts.js POD_SVG / POD_SHADOW; NieR themes only)
 * .closest() covers both "inside" and "is" (ar-graph-svg, pmx-mark svg itself).
 * .mermaid-stage has no emitter in this build; kept so the list stays total. */
const EXCLUDED_SVG_HOSTS = [
  '.ctx-growth', '.ring-mini', '.ar-graph-svg', '.artifact-preview', '.mermaid-stage',
  '.pm12-gauge', '.pm12-scope', '.pm13-sheet', '.c19-sky', '.c23-body',
  '.pmx-plate-svg', '.pmx-mark', '.pmx-ag', '.pmx-bubble-ring', '.pmx-bsd-half',
  '.plan-sched-ribbon', '.pmx-sched-strip', '.sp-svg', '.sp-mark', '.bc-capture-img', '#o55np-pod'
];
const EXCLUDED_SEL = EXCLUDED_SVG_HOSTS.join(',');

const STATUS_13 = ['working', 'reviewing', 'waiting', 'waiting-dep', 'idle', 'complete',
  'blocked', 'failed', 'paused', 'recovering', 'pending', 'skipped', 'mixed'];
const ANIMATED = ['working', 'reviewing', 'waiting', 'waiting-dep', 'blocked', 'failed', 'recovering'];
const STATIC = ['idle', 'paused', 'pending', 'skipped', 'mixed'];
const LIVE = ANIMATED.slice(); /* "live tones" for the contrast order in check 11 */

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/%20/g, ' ');
const argv = process.argv.slice(2);
const argVal = (n, d) => { const i = argv.indexOf(n); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const FILE = path.resolve(argVal('--file', path.join(HERE, 'index.html')));
const THEMES_ARG = argVal('--themes', 'all');
const OUT = argVal('--json', null);
const REDUCED = argv.includes('--reduced');

if (!fs.existsSync(FILE)) { console.error('neon-verify: no such file ' + FILE); process.exit(2); }

/* ------------------------------------------------------------- reporting */
const results = [];
let pass = 0, fail = 0, skipped = 0;
function check(ok, label, detail) {
  results.push({ ok: !!ok, label, detail: detail === undefined ? null : detail });
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : '\n        ' + JSON.stringify(detail).slice(0, 2000)}`);
}
function skip(label, detail) {
  results.push({ ok: null, label, detail: detail === undefined ? null : detail });
  skipped++;
  console.log(`SKIP  ${label}`);
}
async function sec(label, fn) {
  try { await fn(); }
  catch (e) { check(false, `[${label}] threw before it could assert`, String((e && e.message) || e).split('\n')[0]); }
}

/* ----------------------------------------------------------------- setup */
const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
const consoleErrors = [], pageErrors = [];
function watch(p) {
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleErrors.push(m.type() + ': ' + m.text().slice(0, 300)); });
  p.on('pageerror', e => pageErrors.push(String((e && e.message) || e).split('\n')[0]));
}
async function boot(p) {
  await p.bringToFront();
  await p.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO, null, { timeout: 30000 });
  await p.waitForTimeout(400);
}
async function newPage(opts = {}) {
  const p = await browser.newPage({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    reducedMotion: REDUCED ? 'reduce' : 'no-preference', ...opts
  });
  watch(p);
  await p.goto(pathToFileURL(FILE).href, { waitUntil: 'load' });
  await boot(p);
  return p;
}
/* The wide thread list needs a stored width before boot + a tall viewport. */
async function newWidePage(dpr = 1) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1080 }, deviceScaleFactor: dpr,
    reducedMotion: REDUCED ? 'reduce' : 'no-preference'
  });
  await ctx.addInitScript(() => { try { localStorage.setItem('pm56-history-w', '320'); } catch (e) {} });
  const p = await ctx.newPage();
  watch(p);
  await p.goto(pathToFileURL(FILE).href, { waitUntil: 'load' });
  await boot(p);
  p.__ctx = ctx;
  return p;
}
async function shut(p) { try { const c = p.__ctx; await p.close(); if (c) await c.close(); } catch (e) {} }
async function setTheme(p, id, pixel) {
  await p.evaluate(t => window.PM56_DEMO.setTheme(t), id);
  await p.waitForTimeout(pixel ? 1000 : 550); /* the bar crossfades; pixel reads wait longer */
}

/* Freeze every neon animation at rest before a pixel read (orbit-verify):
   infinite loops pause at an iteration boundary, one-shots finish. */
async function freezeNx(p) {
  await p.evaluate(() => {
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.target;
      if (!t || !t.closest || !t.closest('svg.nx, .nx-st')) continue;
      try {
        a.pause();
        const tm = a.effect.getTiming(), d = typeof tm.duration === 'number' ? tm.duration : 0;
        if (tm.iterations === Infinity) { const k = d ? Math.ceil(Math.max(0, -tm.delay) / d) : 0; a.currentTime = tm.delay + k * d; }
        else a.finish();
      } catch (e) {}
    }
  });
  await p.waitForTimeout(120);
}
/* Screenshot a clip, decode it in the page, get the bytes back. Small clips only. */
async function readClip(p, clip) {
  const buf = await p.screenshot({ clip });
  return p.evaluate(async u => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = u; });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const px = new Array(d.length);
    for (let i = 0; i < d.length; i++) px[i] = d[i];
    return { w: c.width, h: c.height, px };
  }, 'data:image/png;base64,' + buf.toString('base64'));
}
/* Overlays: Escape, else reload the page (keeps the same page object). */
async function closeOverlays(p) {
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  const open = await p.evaluate(() => document.querySelectorAll('.overlay-menu, .demo-dialog, .dialog').length);
  if (open > 0) {
    await p.goto(pathToFileURL(FILE).href, { waitUntil: 'load' });
    await boot(p);
  }
}

/* ------------------------------------------------------------- colours */
/* color-mix() results serialise as color(srgb r g b / a) (a selected thread row's tint): normalised to rgba first */
const norm = c => { const k = /color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.]+))?\s*\)/.exec(String(c || '')); return k ? `rgba(${k[1] * 255}, ${k[2] * 255}, ${k[3] * 255}, ${k[4] === undefined ? 1 : k[4]})` : String(c || ''); };
function parseCss(c) {
  c = norm(c);
  let m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/.exec(String(c || ''));
  if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  m = /^#([0-9a-f]{6})$/.exec(String(c || '').trim());
  if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 1];
  return null;
}
function over(fg, bg) {
  const a = fg[3];
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
}
function luminance([r, g, b]) {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(fg, bg) {
  const a = luminance(fg), b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/* ------------------------------------------------------------- themes */
const probe = await newPage();
const ALL_THEMES = await probe.evaluate(() => (window.PM56_DATA && window.PM56_DATA.themes || []).map(t => t.id));
await shut(probe);
let THEMES;
if (THEMES_ARG === 'all') THEMES = ALL_THEMES.slice();
else {
  THEMES = THEMES_ARG.split(',').map(s => s.trim()).filter(Boolean);
  const unknown = THEMES.filter(t => !ALL_THEMES.includes(t));
  if (unknown.length) { console.error('neon-verify: unknown theme(s): ' + unknown.join(', ') + ' (known: ' + ALL_THEMES.join(', ') + ')'); process.exit(2); }
}
const LIGHT = THEMES.filter(t => t.endsWith('-light'));
check(ALL_THEMES.length === 10, `precondition: 10 themes on the page (running ${THEMES.length})`, { themes: ALL_THEMES });

/* ------------------------------------------------------------- check 1: census */
async function censusOf(p) {
  return p.evaluate(exc => {
    const bad = [];
    for (const s of document.querySelectorAll('svg')) {
      if (s.closest(exc)) continue;
      if (s.classList.contains('nx') || s.classList.contains('nx-brand')) continue;
      const chain = [];
      for (let n = s.parentElement, k = 0; n && k < 3; n = n.parentElement, k++)
        chain.push(n.tagName.toLowerCase() + (n.className && n.className.baseVal === undefined ? '.' + String(n.className).split(/\s+/).slice(0, 3).join('.') : ''));
      bad.push({ cls: s.getAttribute('class') || '(none)', in: chain.join(' < '), html: s.outerHTML.slice(0, 160) });
      if (bad.length >= 12) break;
    }
    return {
      bad, nBad: bad.length,
      total: document.querySelectorAll('svg').length,
      misses: (window.PM56_NEON && window.PM56_NEON.misses || []).slice(),
      glyphMissing: document.querySelectorAll('.pmx-glyph-missing').length
    };
  }, EXCLUDED_SEL);
}
async function openMenu(p, menu) {
  await p.locator(`[data-action="open-menu"][data-menu="${menu}"]`).first().click({ timeout: 5000 });
  await p.locator('.overlay-menu[data-overlay="root-menu"]').first().waitFor({ timeout: 5000 });
}
async function openDemo(p) {
  await p.locator('[data-action="open-demo"]').first().click({ timeout: 5000 });
  await p.locator('.demo-dialog').first().waitFor({ timeout: 5000 });
}
async function closeDemo(p) {
  const b = p.locator('.demo-dialog [data-action="close-dialog"]').first();
  if (await b.count()) { await b.click({ timeout: 5000 }); await p.waitForTimeout(300); }
}
async function openWandSheet(p) {
  await openMenu(p, 'wand');
  /* PM56_POLISH.wand() groups the rows collapsed; expand the first group. */
  const toggle = p.locator('.overlay-menu[data-overlay="root-menu"] .polish-group-toggle').first();
  if (await toggle.count() > 0) {
    await toggle.click({ timeout: 5000 });
    await p.waitForTimeout(400);
  }
  const row = p.locator('.overlay-menu[data-overlay="root-menu"] [data-submenu]').first();
  if (await row.count() === 0) return false;
  await row.click({ timeout: 5000 });
  await p.waitForTimeout(400);
  if (await p.locator('.overlay-menu.sidecar').count() === 0) {
    await row.hover({ timeout: 5000 });
    await p.waitForTimeout(400);
  }
  return await p.locator('.overlay-menu.sidecar').count() > 0;
}
/* wand > Workflows > Crew… / BrainStorm… / Review… / Chat Room… opens the collab configure sheet; its hero holds the
   run preview (module-shell pmxPreview + pmxRun preview mode), which must render svgs, or the view measured nothing.
   Being svg.nx is not enough (fpfix cycle 1: a filter that kept `nx` but dropped every `nx-*` class left the preview
   as bare as F-1 and the census still passed), so the preview must also be lit like the card: the kind badge
   (svg.pmx-kind) carries nx-r-concept, at least one .nx-h halo path that paints (outside NieR, which has no halo), a
   core stroke and the density's ink (live/starting accent, waiting/attention/warm warning, failed danger); every
   status mark sits in an .nx-st.nx-still wrapper (a preview runs no loop) with its tone's ink. */
const CONFIGURE_KINDS = ['crew', 'brainstorm', 'review', 'chat_room'];
async function previewLit(p) {
  return p.evaluate(() => {
    const card = document.querySelector('#pmOverlayRoot .pmx-sheet.collab-configure .pmx-preview-card');
    if (!card) return ['no .pmx-preview-card'];
    const bad = [], cs = e => getComputedStyle(e), nier = document.documentElement.getAttribute('data-o55-nier') === 'on';
    const run = card.closest('[data-density]') || card.querySelector('[data-density]');
    const density = run && run.dataset.density, tone = run && run.dataset.tone;
    const want = tone === 'accent' || density === 'live' || density === 'starting' ? 'accent'
      : density === 'waiting' || density === 'attention' || tone === 'warm' ? 'warning' : density === 'failed' ? 'danger' : null;
    const k = card.querySelector('svg.pmx-kind');
    if (!k) bad.push('no svg.pmx-kind');
    else {
      const ink = cs(k).getPropertyValue('--nx-ink').trim(), h = k.querySelectorAll('.nx-h'), c = k.querySelector('.nx-c');
      if (!k.classList.contains('nx-r-concept')) bad.push('kind badge lacks nx-r-concept: ' + k.getAttribute('class'));
      if (!ink) bad.push('kind badge has no --nx-ink');
      if (!h.length) bad.push('kind badge has no .nx-h halo path');
      else if (!nier && !(+cs(h[0]).opacity > 0)) bad.push('kind badge halo does not paint (opacity ' + cs(h[0]).opacity + ')');
      if (!c || cs(c).stroke === 'none') bad.push('kind badge has no core stroke');
      if (want && ink !== cs(k).getPropertyValue('--' + want).trim())
        bad.push(`kind badge ink ${ink} is not the ${density} density's --${want} ${cs(k).getPropertyValue('--' + want).trim()}`);
    }
    const sts = [...card.querySelectorAll('.pmx-st-glyph svg')];
    if (!sts.length) bad.push('no status mark (.pmx-st-glyph svg)');
    const TN = { attention: 'warning', working: 'accent', blocked: 'danger' };
    for (const s of sts) {
      const w = s.parentElement, ink = cs(s).getPropertyValue('--nx-ink').trim();
      if (!w.classList.contains('nx-st') || !w.classList.contains('nx-still')) { bad.push('status mark not in .nx-st.nx-still: ' + w.getAttribute('class')); continue; }
      if (!ink) bad.push('status mark has no --nx-ink');
      const tn = [...w.classList].find(c => c.startsWith('nx-tn-')), tok = tn && TN[tn.slice(6)];
      if (tok && ink !== cs(s).getPropertyValue('--' + tok).trim()) bad.push(`status mark ink ${ink} is not ${tn}'s --${tok}`);
    }
    return bad;
  });
}
async function openConfigureSheet(p, kind) {
  await openMenu(p, 'wand');
  const menu = p.locator('.overlay-menu[data-overlay="root-menu"]').first();
  const row = () => menu.locator(`[data-action="collab-open-configure"][data-kind="${kind}"]:not([data-auto])`).first();
  if (await row().count() === 0) {
    await menu.locator('.polish-group-toggle[data-group="work"]').first().click({ timeout: 5000 });
    await p.waitForTimeout(400);
  }
  if (await row().count() === 0) return { skipped: 'no ' + kind + ' row under Workflows' };
  await row().click({ timeout: 5000 });
  await p.locator('#pmOverlayRoot .pmx-sheet.collab-configure').first().waitFor({ timeout: 5000 });
  await p.waitForTimeout(500);
  const pv = await p.evaluate(() => document.querySelectorAll('#pmOverlayRoot .pmx-sheet.collab-configure .pmx-preview-card svg').length);
  if (!pv) return { skipped: kind + ' configure sheet has no run preview svg' };
  const unlit = await previewLit(p);
  return unlit.length ? { unlit } : null;
}
for (const theme of THEMES) {
  await sec(`census ${theme}`, async () => {
    const views = {};
    const p = await newPage();
    try {
      await setTheme(p, theme);
      views.default = await censusOf(p);
      await openMenu(p, 'model');
      await p.waitForTimeout(250);
      views.menu = await censusOf(p);
      await closeOverlays(p);
      await setTheme(p, theme);
      await openDemo(p);
      await p.waitForTimeout(250);
      views.demo = await censusOf(p);
      await closeDemo(p);
      await closeOverlays(p);
      await setTheme(p, theme);
      const sheet = await openWandSheet(p);
      views.wandSheet = sheet ? await censusOf(p) : { skipped: 'no wand sheet opened' };
      for (const kind of CONFIGURE_KINDS) {
        await closeOverlays(p);
        await setTheme(p, theme);
        const miss = await openConfigureSheet(p, kind);
        views['configure:' + kind] = miss || await censusOf(p);
      }
    } finally { await shut(p); }
    const w = await newWidePage();
    try {
      await setTheme(w, theme);
      await w.evaluate(() => window.PM56_DEMO.setVariant(1, 5));
      await w.waitForTimeout(400);
      views.wide = await censusOf(w);
    } finally { await shut(w); }
    const fails = {};
    for (const [v, r] of Object.entries(views)) {
      if (r.skipped || r.unlit) { fails[v] = r; continue; }
      /* a view with no svg at all measured nothing (a page that failed to render passes vacuously otherwise) */
      if (r.nBad || r.misses.length || r.glyphMissing || !r.total) fails[v] = { total: r.total, offenders: r.bad, misses: r.misses, glyphMissing: r.glyphMissing };
    }
    check(Object.keys(fails).length === 0, `1 census [${theme}]: every svg is .nx outside ${EXCLUDED_SVG_HOSTS.length} hosts, misses empty, no .pmx-glyph-missing`, fails);
  });
}

/* ------------------------------------------------------------- check 2: status matrix */
async function matrixSnapshot(p, list) {
  /* Fresh-render each status and snapshot it in the same task, so one-shots
     (complete's draw, NieR failed's 320ms glitch) are caught while running. */
  return p.evaluate(list => {
    let host = document.getElementById('nx-test-matrix');
    if (!host) {
      host = document.createElement('div');
      host.id = 'nx-test-matrix';
      host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:transparent;';
      document.body.appendChild(host);
    }
    const out = {};
    for (const s of list) {
      host.innerHTML = window.PM56_NEON.status(s, 15);
      void host.offsetHeight;
      const wrap = host.querySelector('.nx-st');
      const tone = window.PM56_NEON.STATUS[s].tone;
      const anims = [];
      for (const a of document.getAnimations()) {
        const t = a.effect && a.effect.target;
        if (t && wrap.contains(t)) {
          let it = null;
          try { it = a.effect.getTiming().iterations; } catch (e) {}
          anims.push({ it: it === Infinity ? 'inf' : it, st: a.playState });
        }
      }
      out[s] = {
        wrapper: !!wrap && wrap.classList.contains('nx-st-' + s),
        tone: !!wrap && wrap.classList.contains('nx-tn-' + tone),
        running: anims.filter(a => a.st === 'running').length,
        anims
      };
    }
    host.innerHTML = '';
    return out;
  }, list);
}
for (const theme of THEMES) {
  await sec(`matrix ${theme}`, async () => {
    const p = await newPage();
    try {
      await setTheme(p, theme);
      const snap = await matrixSnapshot(p, STATUS_13);
      const fails = {};
      for (const s of STATUS_13) {
        const r = snap[s], bad = [];
        if (!r.wrapper) bad.push('no .nx-st.nx-st-' + s + ' wrapper');
        if (!r.tone) bad.push('no nx-tn-* tone class');
        if (REDUCED) { if (r.running) bad.push(`reduced: ${r.running} running, want 0`); }
        else if (s === 'complete') {
          if (!r.anims.length) bad.push('no one-shot caught while running');
          else if (!r.anims.every(a => a.it === 1)) bad.push('not every iteration count is 1: ' + JSON.stringify(r.anims));
        }
        else if (ANIMATED.includes(s)) { if (!r.running) bad.push('animated: 0 running animations'); }
        else { if (r.running) bad.push(`static: ${r.running} running, want 0`); }
        if (bad.length) fails[s] = { problems: bad, anims: r.anims };
      }
      check(Object.keys(fails).length === 0,
        `2 status matrix [${theme}]: wrappers + tones${REDUCED ? ', reduced: 0 running' : ', 7 animated / 5 static / complete x1'}`,
        fails);
    } finally { await shut(p); }
  });
}

/* ------------------------------------------------------------- check 2b-2d: the live surfaces' statuses */
/* The set as the surfaces use it (basic-dark, the Query thread working): the bar's root rhythm follows its
   html[data-ab-<domain>] tone; the wide take-6 rows carry the nine thread statuses; the To-Do hover card's rows
   carry the set member of their To-Do status. */
const BAR_RHYTHM = { working: 'ab-breathe', attention: 'ab-breathe', blocked: 'ab-alert' };
const TODO_MARK = { completed: 'complete', in_progress: 'working', blocked: 'blocked', skipped: 'skipped', pending: 'pending' };
await sec('live surfaces', async () => {
  const p = await newWidePage();
  try {
    await setTheme(p, 'basic-dark');
    await p.evaluate(() => { window.PM56_DEMO.selectThread('query'); window.PM56_DEMO.startWorking(); window.PM56_DEMO.setVariant(1, 5); });
    await p.waitForTimeout(1200);
    const bar = await p.evaluate(() => [...document.querySelectorAll('.activity-item[data-hover-domain]')].map(e => {
      const s = e.querySelector('svg.nx'), d = e.dataset.hoverDomain;
      return { domain: d, tone: document.documentElement.getAttribute('data-ab-' + d), anim: s ? getComputedStyle(s).animationName : null };
    }));
    const barBad = bar.filter(r => r.anim !== (REDUCED ? 'none' : (BAR_RHYTHM[r.tone] || 'none')));
    const tones = new Set(bar.map(r => r.tone));
    check(bar.length >= 3 && tones.size >= 2 && barBad.length === 0,
      `2b bar rhythm follows its tone (${bar.length} items, ${tones.size} tones: ${[...tones].join(', ')})`, { barBad, bar });
    const rows = await p.evaluate(() => [...document.querySelectorAll('.ph-status[data-status]')].map(e => ({
      st: e.dataset.status, ok: !!e.querySelector(':scope > .nx-st.nx-st-' + e.dataset.status) || !!e.querySelector('.nx-st.nx-st-' + e.dataset.status)
    })));
    const kinds = new Set(rows.map(r => r.st));
    const rowBad = rows.filter(r => !r.ok);
    check(kinds.size >= 9 && rowBad.length === 0,
      `2c thread rows carry their status mark (${rows.length} rows, ${kinds.size} statuses: ${[...kinds].join(', ')}; want the nine)`, { rowBad: rowBad.slice(0, 8) });
    /* the To-Do hover card */
    await p.mouse.move(10, 1040);
    const todo = p.locator('.activity-item[data-hover-domain="todo"]').first();
    let todoRows = [];
    if (await todo.count()) {
      await todo.hover({ timeout: 5000 });
      await p.waitForTimeout(600);
      todoRows = await p.evaluate(map => [...document.querySelectorAll('.todo-hover-glyph')].map(g => {
        const st = [...g.classList].find(c => c.startsWith('todo-glyph-')).slice(11);
        return { st, want: map[st] || 'pending', ok: !!g.querySelector('.nx-st.nx-st-' + (map[st] || 'pending')) };
      }), TODO_MARK);
    }
    const todoBad = todoRows.filter(r => !r.ok);
    check(todoRows.length > 0 && todoBad.length === 0,
      `2d To-Do rows carry their status mark (${todoRows.length} rows in the hover card: ${[...new Set(todoRows.map(r => r.st))].join(', ')})`, { todoBad, todoRows: todoRows.slice(0, 8) });
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 2e: collab domains on the bar */
/* The bar's Crew, BrainStorm, Review and Chat Room tone is the worst of its runs' own presentation state, the one the
   cards read (PM56_COLLAB.presentState: attention, limit and failed need you, running and starting work, completed is
   done, the rest idle). Every thread, basic-dark; the recovery-collaboration thread must read attention on Crew,
   BrainStorm and Review (its blocked runs), so a coarser projection cannot pass by matching itself (fpfix F-2 cycle 1). */
await sec('collab bar tones', async () => {
  const p = await newPage();
  try {
    await setTheme(p, 'basic-dark');
    const tids = await p.evaluate(() => window.PM56_EXT.ctx().D.threads.map(t => t.id));
    const rows = [];
    for (const t of tids) {
      await p.evaluate(t => window.PM56_DEMO.selectThread(t), t);
      await p.waitForTimeout(300);
      rows.push(...await p.evaluate(t => {
        const C = window.PM56_COLLAB, RANK = ['attention', 'working', 'done', 'idle'], out = [];
        const MAP = { attention: 'attention', limit: 'attention', failed: 'attention', running: 'working', starting: 'working', completed: 'done' };
        for (const k of ['crew', 'brainstorm', 'review', 'chat_room']) {
          const runs = C.runsForThread(t).filter(r => r.kind === k);
          if (!runs.length) continue;
          const want = runs.map(r => r.degraded ? 'attention' : (MAP[C.presentState(r)] || 'idle')).reduce((w, x) => RANK.indexOf(x) < RANK.indexOf(w) ? x : w, 'idle');
          out.push({ thread: t, domain: k, states: runs.map(r => C.presentState(r)), want, ab: document.documentElement.getAttribute('data-ab-' + k) });
        }
        return out;
      }, t));
    }
    const bad = rows.filter(r => r.ab !== r.want);
    const REC = { crew: 'attention', brainstorm: 'attention', review: 'attention' };
    const rec = Object.entries(REC).map(([k, want]) => ({ domain: k, want, row: rows.find(r => r.thread === 'recovery-collaboration' && r.domain === k) }))
      .filter(x => !x.row || x.row.ab !== x.want);
    check(rows.length >= 6 && bad.length === 0 && rec.length === 0,
      `2e bar collab tones follow the runs' card state (${rows.length} domains on ${tids.length} threads; recovery-collaboration Crew/BrainStorm/Review attention)`, { bad, rec });
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 3: satellite moves */
if (REDUCED) skip('3 satellite moves (needs motion; --reduced stops it)', null);
else await sec('satellite', async () => {
  const p = await newPage();
  try {
    await setTheme(p, 'basic-dark');
    const has = await p.evaluate(() => {
      const host = document.createElement('div');
      host.id = 'nx-test-sat';
      host.style.cssText = 'position:fixed;left:40px;top:40px;z-index:99999;';
      host.innerHTML = window.PM56_NEON.status('working', 24);
      document.body.appendChild(host);
      /* final review (2026-10-03): the ring is still (a full circle in the static layer); the bead alone moves */
      const ring = host.querySelector('.nx-st-base circle.nx-c.nx-dim'), moving = host.querySelectorAll('.nx-st-move .nx-c');
      return { bead: !!host.querySelector('.nx-st-move .nx-f'), stillRing: !!ring && +ring.getAttribute('r') === 7.5, movingTubes: moving.length };
    });
    if (!has.bead) { check(false, '3 satellite moves: no .nx-f bead in st-working', has); return; }
    check(has.stillRing && has.movingTubes === 1, `3 still ring: the full r7.5 ring is in the static layer and the bead is the only moving tube (${has.movingTubes})`, has);
    const centre = sel => p.evaluate(s => {
      const e = document.querySelector(s);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    }, sel);
    const a0 = await centre('#nx-test-sat .nx-st-move .nx-f');
    const p0 = await centre('#nx-test-sat .nx-st-move');
    await p.waitForTimeout(2250); /* a quarter of a lone mark's 9 s orbit (outside the thread list) */
    const a1 = await centre('#nx-test-sat .nx-st-move .nx-f');
    const p1 = await centre('#nx-test-sat .nx-st-move');
    const d = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]);
    const dp = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    check(d >= 3, `3 satellite moves: bead centre moves ${d.toFixed(2)}px in a quarter period (want >= 3)`, { bead: [a0, a1], partDelta: +dp.toFixed(2) });
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 4: clip reveals end clean + page lines paint */
await sec('clip reveals', async () => {
  const p = await newPage();
  try {
    await setTheme(p, 'basic-dark');
    const clip = await p.evaluate(() => {
      const host = document.createElement('div');
      host.id = 'nx-test-clip';
      host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;';
      const N = window.PM56_NEON;
      host.innerHTML = ['page', 'todo', 'check', 'chart', 'kind-scheduled', 'plus', 'edit', 'eye-off']
        .map(n => N.icon(n, 16)).join('');
      document.body.appendChild(host);
      for (const s of host.querySelectorAll('svg.nx')) s.style.setProperty('--nx-1', '520ms linear backwards');
      return new Promise(res => setTimeout(() => {
        /* the reveal must have run: count the one-shots caught on clip parts before finishing them (without this a
           build whose acts never attach passes, since the base style has no clip either) */
        const ran = document.getAnimations().filter(a => { const t = a.effect && a.effect.target; return t && t.closest && t.closest('#nx-test-clip .nx-pc'); }).length;
        for (const a of document.getAnimations()) {
          try { if (a.effect.getTiming().iterations !== Infinity) a.finish(); } catch (e) {}
        }
        const bad = [];
        for (const e of host.querySelectorAll('.nx-pc')) {
          const cp = getComputedStyle(e).clipPath;
          if (cp !== 'none') bad.push(cp);
        }
        res({ n: host.querySelectorAll('.nx-pc').length, ran, bad });
      }, 150));
    });
    check(clip.n > 0 && clip.bad.length === 0 && (REDUCED || clip.ran > 0),
      `4a clip reveals ran (${clip.ran} caught${REDUCED ? ', reduced: none expected' : ''}) and end clean: ${clip.n} .nx-pc parts, ${clip.bad.length} with residual clip-path`, clip);
    /* The page/document glyph's horizontal text lines paint. */
    const lines = await p.evaluate(() => {
      const host = document.createElement('div');
      host.id = 'nx-test-lines';
      host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#fff;color:#000;padding:20px;';
      const N = window.PM56_NEON;
      host.innerHTML = N.icon('page', 20) + N.icon('document', 20);
      document.body.appendChild(host);
      for (const a of document.getAnimations()) {
        try { if (a.effect.getTiming().iterations !== Infinity) a.finish(); } catch (e) {}
      }
      return [...host.querySelectorAll('svg.nx')].map(s => {
        const r = s.getBoundingClientRect();
        return { x: Math.floor(r.left), y: Math.floor(r.top), w: Math.ceil(r.width), h: Math.ceil(r.height), name: s.dataset.nx };
      });
    });
    let worst = null;
    for (const b of lines) {
      const px = await readClip(p, { x: b.x, y: b.y, width: b.w, height: b.h });
      for (const yu of [12, 16]) {
        const py = Math.round(yu / 24 * px.h);
        let ink = 0;
        for (let x = Math.round(8 / 24 * px.w); x <= Math.round(16 / 24 * px.w); x++) {
          const i = (py * px.w + x) * 4;
          if (Math.hypot(px.px[i] - 255, px.px[i + 1] - 255, px.px[i + 2] - 255) > 40) ink++;
        }
        if (!worst || ink < worst.ink) worst = { glyph: b.name, line: yu, ink };
      }
    }
    check(!!worst && worst.ink >= 3, `4b page/document text lines paint (worst line: ${worst ? worst.ink : 0} ink px, want >= 3)`, worst);
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 5: no forbidden properties */
await sec('forbidden props', async () => {
  const p = await newPage();
  try {
    await setTheme(p, 'basic-dark');
    const bad = await p.evaluate(() => {
      const out = [];
      const HOST_SVG = /(pm-lens-trigger|jump-bottom|activity-item|orbit-node|orbit-core|wa-disc|rail8-item|pm-rail-item)[^,]*\bsvg\b/;
      /* a filter that paints (filter: none only resets one, as the pmx sheet's buttons do), any stroke-dashoffset
         declaration, color-mix() anywhere in the rule */
      const has = st => {
        const f = [];
        const fv = (st.getPropertyValue('filter') || '').trim();
        if (fv && fv !== 'none') f.push('filter');
        if ((st.getPropertyValue('stroke-dashoffset') || '').trim() || /(^|[;\s])stroke-dashoffset\s*:/i.test(st.cssText)) f.push('stroke-dashoffset');
        if (/color-mix\s*\(/i.test(st.cssText)) f.push('color-mix(');
        return f;
      };
      const walk = rules => {
        for (const r of rules) {
          try {
            if (r.type === CSSRule.STYLE_RULE) {
              /* neon rules (.nx / nx- selectors), every pmx rule, and the neon rules written on a host's svg
                 (the Lens trigger, jump-bottom, the bar, the Orbit discs and rails) */
              const st = r.selectorText || '';
              if (st.includes('.nx') || st.includes('nx-') || /pmx/i.test(st) || HOST_SVG.test(st)) {
                const f = has(r.style);
                if (f.length) out.push({ sel: r.selectorText.slice(0, 160), props: f });
              }
            } else if (r.type === CSSRule.KEYFRAMES_RULE) {
              if ((r.name || '').startsWith('nx')) {
                if (/pmx/i.test(r.name)) out.push({ sel: '@keyframes ' + r.name, props: ['pmx in an nx keyframe name'] });
                for (const k of r.cssRules) {
                  const f = has(k.style);
                  if (f.length) out.push({ sel: '@keyframes ' + r.name + ' ' + k.keyText, props: f });
                }
              }
            } else if (r.cssRules) walk(r.cssRules);
          } catch (e) { out.push({ sel: '(a rule threw while read: ' + String(e && e.message || e).slice(0, 80) + ')', props: ['?'] }); }
        }
      };
      for (const sh of document.styleSheets) {
        try { if (sh.cssRules) walk(sh.cssRules); } catch (e) { out.push({ sel: '(unreadable sheet ' + (sh.href || 'inline') + ')', props: ['?'] }); }
      }
      return out.slice(0, 20);
    });
    check(bad.length === 0, '5 no forbidden properties (filter, stroke-dashoffset, color-mix() in .nx/nx-, pmx and neon host-svg rules or nx* keyframes; no pmx in an nx keyframe name; no rule unreadable)', bad);
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 6: hover leaves self-lit + status alone */
await sec('hover animationName', async () => {
  const p = await newWidePage();
  try {
    await setTheme(p, 'basic-dark');
    await p.evaluate(() => window.PM56_DEMO.setVariant(1, 5));
    await p.waitForTimeout(400);
    const park = async () => { await p.mouse.move(10, 1040); await p.waitForTimeout(250); };
    const one = async (targetSel, svgSel, i) => {
      const t = p.locator(targetSel).nth(i), s = p.locator(svgSel).nth(i);
      if (await t.count() === 0 || await s.count() === 0) return { target: `${targetSel}[${i}]`, skipped: 'missing' };
      await park();
      const before = await s.evaluate(e => getComputedStyle(e).animationName);
      await t.hover({ timeout: 5000 });
      await p.waitForTimeout(250);
      const during = await s.evaluate(e => getComputedStyle(e).animationName);
      return { target: `${targetSel}[${i}]`, before, during, same: before === during };
    };
    const rows = [];
    for (let i = 0; i < 5; i++) rows.push(await one('.activity-item', '.activity-item svg.nx', i));
    for (let i = 0; i < 3; i++) rows.push(await one('.ph-status', '.ph-status svg.nx', i));
    await park();
    const fails = rows.filter(r => !r.same);
    const missing = rows.filter(r => r.skipped);
    check(fails.length === 0 && missing.length === 0,
      '6 hover leaves self-lit + status icons alone (svg animationName unchanged, 5 bar items + 3 marks)', { fails, missing });
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 7: hover cards keep animations */
if (REDUCED) skip('7 hover card keeps animations (needs motion; --reduced stops it)', null);
else await sec('hover card', async () => {
  const p = await newPage();
  try {
    await setTheme(p, 'basic-dark');
    await p.evaluate(() => { window.PM56_DEMO.selectThread('query'); window.PM56_DEMO.startWorking(); });
    await p.waitForTimeout(400);
    const cardAnims = () => p.evaluate(() => {
      const card = document.querySelector('.hover-card.ab-card');
      if (!card) return null;
      return document.getAnimations()
        .filter(a => { const t = a.effect && a.effect.target; return t && card.contains(t); })
        .map(a => a.startTime);
    });
    let opened = -1, before = null;
    for (let i = 0; i < 4; i++) {
      const t = p.locator('.activity-item[data-hover-domain]').nth(i);
      if (await t.count() === 0) break;
      await t.hover({ timeout: 5000 });
      await p.waitForTimeout(500);
      const a = await cardAnims();
      if (a && a.length) { opened = i; before = a; break; }
      if (a && !before) { opened = i; before = a; }
    }
    if (opened < 0 || !before) { check(false, '7 hover card keeps animations: no hover card opened', null); return; }
    for (let k = 0; k < 3; k++) { await p.evaluate(() => window.PM56_DEMO.tickOnce()); await p.waitForTimeout(530); }
    const after = await cardAnims();
    const same = !!after && after.length === before.length && after.every((t, i) => t === before[i]);
    check(before.length > 0 && same,
      `7 hover card keeps animations (${before.length} in card, startTimes ${same ? 'unchanged' : 'CHANGED'} across 3 ticks)`,
      { before, after });
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 8: questions sheet has no loop */
await sec('qs sheet', async () => {
  const p = await newPage();
  try {
    await setTheme(p, 'basic-dark');
    let found = false;
    for (let v = 0; v < 8 && !found; v++) {
      await p.evaluate(x => { window.PM56_DEMO.setVariant(6, x); window.PM56_DEMO.openQuestionnaire(); }, v);
      await p.waitForTimeout(350);
      found = await p.locator('.qs-sheet').count() > 0;
    }
    if (!found) { check(false, '8 questions sheet has no loop: no .qs-sheet opened (variants 0-7)', null); return; }
    const inf = await p.evaluate(() => {
      const sheet = document.querySelector('.qs-sheet');
      const out = [];
      for (const a of document.getAnimations()) {
        const t = a.effect && a.effect.target;
        if (!t || !sheet.contains(t)) continue;
        let it = null;
        try { it = a.effect.getTiming().iterations; } catch (e) {}
        if (it === Infinity) {
          const n = t.tagName ? t.tagName.toLowerCase() + '.' + String(t.className.baseVal === undefined ? t.className : '').split(/\s+/).slice(0, 2).join('.') : '?';
          out.push(n);
        }
      }
      return out.slice(0, 12);
    });
    check(inf.length === 0, '8 questions sheet has no loop (nothing in .qs-sheet is infinite)', inf);
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 9: old keyframes gone */
await sec('old keyframes', async () => {
  const p = await newWidePage();
  try {
    await setTheme(p, 'basic-dark');
    await p.evaluate(() => window.PM56_DEMO.setVariant(1, 5));
    await p.waitForTimeout(400);
    const found = await p.evaluate(() => {
      const out = [];
      for (const host of document.querySelectorAll('.ph-status')) {
        for (const n of [host, ...host.querySelectorAll('*')]) {
          for (const pe of [null, '::before', '::after']) {
            const cs = getComputedStyle(n, pe || undefined);
            if (!cs.animationName || cs.animationName === 'none') continue;
            for (const x of cs.animationName.split(',')) {
              const nm = x.trim();
              if (/^ph-/i.test(nm) || /^spin$/i.test(nm)) out.push(`${host.dataset.status}: ${nm}`);
            }
          }
        }
      }
      return { n: document.querySelectorAll('.ph-status').length, found: [...new Set(out)].slice(0, 12) };
    });
    check(found.n >= 9 && found.found.length === 0, `9 old keyframes gone (no ph-* or spin active on ${found.n} .ph-status hosts and descendants; want >= 9 hosts)`, found);
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 10: reduced motion, all three routes */
/* Fix cycle 2 (review 2): the check could pass vacuously. It counted only animations inside svg.nx/.nx-st, so the Fast
   bolt's backlight (.nx-bolt::before, outside the svg) was never seen, and it ran in basic-dark only, so NieR's own
   reduced rules were never exercised. Now every route runs in every theme of --themes, over three working takes (the
   Orbit, Step Rail Simple, v0) with the bar's hover card open (required), and two things must be zero: running animations on
   neon targets (svg.nx, .nx-st, .nx-bolt, pseudo-elements included) and running infinite animations anywhere in the
   document (INFINITE_ALLOW names the exceptions; there are none). v0's trail scroll must not glide (.wa-track
   scroll-behavior auto). The 13-member matrix keeps its lit state (halos paint, complete's clip resolved). */
const INFINITE_ALLOW = [];
const REDUCED_TAKES = [[1, '.orbit-node.live', 'Orbit'], [8, '.rail8-item', 'Step Rail Simple'], [0, '.wa-track', 'v0']];
async function reducedState(p) {
  return p.evaluate(allow => {
    let host = document.getElementById('nx-test-matrix');
    if (!host) {
      host = document.createElement('div');
      host.id = 'nx-test-matrix';
      host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;pointer-events:none;';
      document.body.appendChild(host);
    }
    const N = window.PM56_NEON;
    host.innerHTML = ['working', 'reviewing', 'waiting', 'waiting-dep', 'idle', 'complete',
      'blocked', 'failed', 'paused', 'recovering', 'pending', 'skipped', 'mixed']
      .map(s => N.status(s, 15)).join('');
    const running = [], infinite = [];
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.target;
      if (!t || a.playState !== 'running') continue;
      const name = a.animationName || (a.transitionProperty ? 'tr:' + a.transitionProperty : 'waapi');
      const cls = String(t.className && t.className.baseVal !== undefined ? t.className.baseVal : t.className).split(/\s+/).filter(Boolean).slice(0, 3).join('.');
      const key = (t.tagName || '').toLowerCase() + (cls ? '.' + cls : '') + (a.effect.pseudoElement || '') + ' ' + name;
      if (t.closest && t.closest('svg.nx, .nx-st, .nx-bolt')) running.push(key);
      let tm = {};
      try { tm = a.effect.getComputedTiming(); } catch (e) {}
      if (tm.iterations === Infinity && !allow.includes(name)) infinite.push(key);
    }
    const done = host.querySelector('.nx-st-complete .nx-pc');
    /* the lit state must survive: halos still paint (idle's is hidden by design) */
    let halos = 0;
    for (const h of host.querySelectorAll('.nx-h')) {
      const cs = getComputedStyle(h);
      if (cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.strokeOpacity) > 0) halos++;
    }
    const wa = document.querySelector('.wa-track');
    return {
      running: running.length, names: [...new Set(running)].slice(0, 12),
      infinite: infinite.length, infNames: [...new Set(infinite)].slice(0, 12),
      halos, nier: document.documentElement.getAttribute('data-o55-nier') === 'on', completeClip: done ? getComputedStyle(done).clipPath : '(no .nx-pc)',
      waScroll: wa ? getComputedStyle(wa).scrollBehavior : null
    };
  }, INFINITE_ALLOW);
}
/* One page per route; per theme, each take: the Query thread working (startWorking resets the run), the bar's hover
   card open, then the census. */
async function reducedSweep(p, k, route) {
  for (const theme of THEMES) {
    await setTheme(p, theme);
    const per = [];
    let ok = true;
    for (const [take, sel, label] of REDUCED_TAKES) {
      await p.mouse.move(700, 5);
      await p.evaluate(t => { window.PM56_DEMO.setVariant(2, t); window.PM56_DEMO.selectThread('query'); window.PM56_DEMO.startWorking(); }, take);
      await p.waitForTimeout(2600);
      const bar = p.locator('.activity-item[data-hover-domain]').first();
      let card = false;
      if (await bar.count()) { await bar.hover(); await p.waitForTimeout(700); card = await p.evaluate(() => !!document.querySelector('.hover-card')); } /* the card opens after a 220 ms intent delay */
      const scene = await p.evaluate(s => !!document.querySelector(s), sel);
      const r = await reducedState(p);
      /* NieR draws no halos (neon-icons.css: NieR's flat ink); there the lit state is the ink itself, so 0 is the design */
      const good = scene && card && r.running === 0 && r.infinite === 0 && r.completeClip === 'none' && (r.nier ? r.halos === 0 : r.halos >= 5) && (take !== 0 || r.waScroll === 'auto');
      if (!good) ok = false;
      per.push({ take: label, scene, card, ...r });
    }
    const sum = per.map(x => `${x.take}${x.scene ? '' : ' MISSING'}${x.card ? '' : ' (no hover card)'}: ${x.running} neon running, ${x.infinite} infinite`).join('; ');
    check(ok, `${k} reduced motion (${route}) [${theme}]: ${sum}; halos ${per.map(x => x.halos).join('/')} (want ${per[0].nier ? '0 under NieR' : '>= 5'}), complete clip ${per[0].completeClip}, v0 trail scroll ${per[2].waScroll}`, ok ? null : per.filter(x => !x.scene || !x.card || x.running || x.infinite || (x.nier ? x.halos !== 0 : x.halos < 5) || x.completeClip !== 'none' || (x.take === 'v0' && x.waScroll !== 'auto')));
  }
}
await sec('reduced media', async () => {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce'
  });
  const p = await ctx.newPage();
  try {
    watch(p);
    await p.goto(pathToFileURL(FILE).href, { waitUntil: 'load' });
    await boot(p);
    await reducedSweep(p, '10a', 'media');
  } finally { try { await p.close(); await ctx.close(); } catch (e) {} }
});
for (const [k, route] of [['10b', 'body.pm56-reduced'], ['10c', 'html[data-motion="reduced"]']]) {
  await sec('reduced ' + route, async () => {
    const p = await newPage({ reducedMotion: 'no-preference' });
    try {
      await p.evaluate(k => {
        if (k === '10b') document.body.classList.add('pm56-reduced');
        else document.documentElement.setAttribute('data-motion', 'reduced');
      }, k);
      await p.waitForTimeout(300);
      await reducedSweep(p, k, route);
    } finally { await shut(p); }
  });
}

/* ------------------------------------------------------------- check 11: idle contrast and order */
/* Every theme: idle never reads above the lowest live tone on the same row state. Light themes also want idle at
   >= 3:1 at rest (3E2's per-theme --nx-idle tokens). */
for (const theme of THEMES) {
  const isLight = theme.endsWith('-light');
  await sec(`contrast ${theme}`, async () => {
    const p = await newWidePage();
    try {
      await setTheme(p, theme, true);
      await p.evaluate(() => window.PM56_DEMO.setVariant(1, 5));
      await p.waitForTimeout(400);
      const rows = await p.evaluate(live => {
        const out = {};
        /* The painted ink of a mark: NieR's diamonds part hides working's svg and draws the diamond as the
           wrapper's ::after border (fix cycle 1: the tube's stroke there is an invisible element). */
        const inkOf = st => {
          const svg = st && st.querySelector('svg.nx');
          if (svg && getComputedStyle(svg).visibility === 'hidden') {
            const a = getComputedStyle(st, '::after');
            if (a.content && a.content !== 'none') return a.borderTopColor;
          }
          const t = st && st.querySelector('.nx-c');
          return t ? getComputedStyle(t).stroke : null;
        };
        /* The backdrop as painted: every translucent layer from the tube up, composited down onto the first
           opaque one (a row's hover or selection tint is translucent in several themes). */
        const opaque = el => {
          const layers = [];
          let base = [255, 255, 255];
          for (let n = el; n; n = n.parentElement) {
            const bg = getComputedStyle(n).backgroundColor;
            const norm = c => { const k = /color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.]+))?\s*\)/.exec(String(c || '')); return k ? `rgba(${k[1] * 255}, ${k[2] * 255}, ${k[3] * 255}, ${k[4] === undefined ? 1 : k[4]})` : String(c || ''); };
            const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/.exec(norm(bg));
            if (!m) continue;
            const a = m[4] === undefined ? 1 : +m[4];
            if (a >= 0.99) { base = [+m[1], +m[2], +m[3]]; break; }
            if (a > 0) layers.push([+m[1], +m[2], +m[3], a]);
          }
          for (let i = layers.length - 1; i >= 0; i--) {
            const [r, g, b, a] = layers[i];
            base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)];
          }
          return `rgb(${base.map(v => v.toFixed(2)).join(', ')})`;
        };
        for (const s of ['idle', ...live]) {
          /* at rest = on an unselected row (the selected row's tint is 11c's) */
          let el = document.querySelector(`.thread-row:not(.active) .ph-status[data-status="${s}"]`);
          let row = el && el.closest('.thread-row');
          if (!el) {
            /* Not every live status has a thread (waiting-dep is not one of
               the nine): render the real mark into a real, non-active row. */
            row = document.querySelector('.thread-row:not(.active)') || document.querySelector('.thread-row');
            if (!row) { out[s] = null; continue; }
            const span = document.createElement('span');
            span.innerHTML = window.PM56_NEON.status(s, 15);
            row.appendChild(span);
            el = span.querySelector('.nx-st');
            el.dataset.nxTest = '1';
          }
          const tube = el.querySelector('.nx-c');
          /* Backdrop from the tube up: NieR waiting sits on its own inverted
             ink block (on .nx-st, below .ph-status), everywhere else this
             resolves to the row. */
          out[s] = { ink: inkOf(el.classList.contains('nx-st') ? el : el.querySelector('.nx-st')), bg: opaque(tube || el) };
        }
        return out;
      }, LIVE);
      const missing = Object.entries(rows).filter(([, v]) => !v || !v.ink).map(([s]) => s);
      if (missing.length || !rows.idle) {
        check(false, `11 idle contrast at rest [${theme}]: missing marks`, { missing });
        return;
      }
      const cr = {};
      for (const [s, v] of Object.entries(rows)) {
        const fg = parseCss(v.ink), bg = parseCss(v.bg);
        const eff = fg[3] < 1 ? over(fg, bg) : fg;
        cr[s] = +ratio(eff, bg).toFixed(3);
      }
      const liveMin = Math.min(...LIVE.map(s => cr[s]));
      const ok = (!isLight || cr.idle >= 3) && cr.idle < liveMin;
      check(ok, `11 idle contrast at rest [${theme}]: idle ${cr.idle}:1 (want ${isLight ? '>= 3 and ' : ''}below every live tone, min ${liveMin}:1)`, cr);
      /* 11b/11c: the same idle row hovered (11b), then selected and selected + hovered (11c): the row tints change the
         field. What they test is the ORDER (integrate, lead decision 2026-10-02): on each row state idle reads no more
         than the lowest live tone drawn on that same row (the live marks are rendered into the probe row, so the row's
         own ink rules and tint apply to them too). Idle below 3:1 on a hovered or selected row is accepted (Jared: no
         accessibility-only work in concepts); the raw ratios are printed as information. */
      const rowInks = () => p.evaluate(live => {
        const row = document.querySelector('.thread-row[data-nx-probe]');
        if (!row) return null;
        for (const s of live) {
          if (row.querySelector(`[data-nx-test-st="${s}"]`)) continue;
          const span = document.createElement('span');
          span.setAttribute('data-nx-test-st', s);
          span.style.cssText = 'position:absolute;left:-200px;top:0'; /* off the row's layout, still inside the row */
          span.innerHTML = window.PM56_NEON.status(s, 15);
          row.appendChild(span);
        }
        const comp = n0 => { const L = []; let b = [255, 255, 255];
          for (let n = n0; n; n = n.parentElement) {
            const norm = c => { const k = /color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.]+))?\s*\)/.exec(String(c || '')); return k ? `rgba(${k[1] * 255}, ${k[2] * 255}, ${k[3] * 255}, ${k[4] === undefined ? 1 : k[4]})` : String(c || ''); };
            const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/.exec(norm(getComputedStyle(n).backgroundColor));
            if (!m) continue; const a = m[4] === undefined ? 1 : +m[4];
            if (a >= 0.99) { b = [+m[1], +m[2], +m[3]]; break; } if (a > 0) L.push([+m[1], +m[2], +m[3], a]); }
          for (let i = L.length - 1; i >= 0; i--) { const [r, g, bb, a] = L[i]; b = [r * a + b[0] * (1 - a), g * a + b[1] * (1 - a), bb * a + b[2] * (1 - a)]; }
          return `rgb(${b.map(v => v.toFixed(2)).join(', ')})`; };
        const out = {};
        const inkOf = st => {
          const svg = st && st.querySelector('svg.nx');
          if (svg && getComputedStyle(svg).visibility === 'hidden') {
            const a = getComputedStyle(st, '::after');
            if (a.content && a.content !== 'none') return a.borderTopColor;
          }
          const t = st && st.querySelector('.nx-c');
          return t ? getComputedStyle(t).stroke : null;
        };
        const idle = row.querySelector('.ph-status[data-status="idle"] .nx-c');
        out.idle = idle ? { ink: getComputedStyle(idle).stroke, bg: comp(idle) } : null;
        for (const s of live) {
          const t = row.querySelector(`[data-nx-test-st="${s}"] .nx-c`);
          out[s] = t ? { ink: inkOf(t.closest('.nx-st')), bg: comp(t) } : null;
        }
        return out;
      }, LIVE);
      const crOf = v => { if (!v) return null; const fg = parseCss(v.ink), bg = parseCss(v.bg); return +ratio(fg[3] < 1 ? over(fg, bg) : fg, bg).toFixed(3); };
      const crAll = o => { if (!o || !o.idle) return null; const r = {}; for (const [k, v] of Object.entries(o)) r[k] = crOf(v); return r; };
      const id = await p.evaluate(() => {
        const row = [...document.querySelectorAll('.thread-row')].find(r => r.querySelector('.ph-status[data-status="idle"]') && !r.classList.contains('active'));
        if (!row) return null;
        row.setAttribute('data-nx-probe', '1');
        return row.getAttribute('data-id') || '';
      });
      if (id === null) { check(false, `11b/11c idle order, hovered/selected [${theme}]: no idle row`, null); return; }
      const states = {};
      const row = p.locator('.thread-row[data-nx-probe]').first();
      await row.hover(); await p.waitForTimeout(450);
      states.hover = crAll(await rowInks());
      await p.mouse.move(5, 1075); await p.waitForTimeout(300);
      if (id) {
        await p.evaluate(i => window.PM56_DEMO.selectThread(i), id); await p.waitForTimeout(700);
        await p.evaluate(i => { const r = [...document.querySelectorAll('.thread-row')].find(x => x.getAttribute('data-id') === i); if (r) r.setAttribute('data-nx-probe', '1'); }, id);
        await p.mouse.move(5, 1075); await p.waitForTimeout(300);
        states.selected = crAll(await rowInks());
        await p.locator('.thread-row[data-nx-probe]').first().hover(); await p.waitForTimeout(450);
        states.selectedHover = crAll(await rowInks());
      }
      const order = st => { if (!st) return { ok: false, idle: null, liveMin: null }; const lm = Math.min(...LIVE.map(s => st[s] == null ? Infinity : st[s])); return { ok: st.idle != null && isFinite(lm) && st.idle <= lm, idle: st.idle, liveMin: +lm.toFixed(3), lowest: LIVE.find(s => st[s] === lm) }; };
      const oh = order(states.hover), os = order(states.selected), osh = order(states.selectedHover);
      const info = o => `idle ${o.idle}:1 vs lowest live ${o.liveMin}:1 (${o.lowest})${o.idle != null && o.idle < 3 ? ', idle under 3:1 (accepted)' : ''}`;
      check(oh.ok, `11b idle order, hovered row [${theme}]: ${info(oh)} (want idle <= lowest live)`, states.hover);
      check(!!id && os.ok && osh.ok,
        `11c idle order, selected row [${theme}]: ${info(os)}; selected + hovered ${info(osh)} (want idle <= lowest live on each)`, { selected: states.selected, selectedHover: states.selectedHover });
    } finally { await shut(p); }
  });
}

/* ------------------------------------------------------------- check 11d: idle vs working, painted ink mass */
/* What the eye weighs is the ink painted, not the computed stroke colour (fix cycle 1). On a real idle row of the
   wide list, at rest, hovered, selected and selected + hovered, the idle mark is screenshotted (dpr 2, the host
   plus 4 px), then the same host is redrawn as working (its data-status and class too, so the list's own rules
   apply) and screenshotted at twelve phases of each of its loops (all paused, stepped together); the host is then
   restored. Ink mass = the summed mean-channel distance from the field (the clip's border median), in CSS px of
   full ink; peak = the 99.5th percentile of the pixels' contrast ratio on that field. Idle's mass may not exceed
   working's mean, and idle's peak may not exceed working's peak at its lowest phase (the peak is what caught NieR's
   bar: its full-paper idle ring peaked at 8.6:1 over a diamond whose thin turned lines peak lower, while the masses
   were within 12 %). Why p99.5 and no tolerance (fix cycle 2): the clip holds about 2,100 device pixels, so p99 is
   about 21 of them, which sits on the rim of the working bead's full-ink core (working's ring is drawn at .65, only
   the bead is full ink): it read the bead's antialiasing at its sub-pixel position, not its ink, and swung 3.02-3.07
   over Friendly Light's phases against idle's 3.08 (a fudge of 3 % passed it, a real row failed it by 5 %).
   p99.5 (about 10 pixels) sits inside the core: Friendly Light's working reads its full 3.22 ink at every phase
   (idle 3.08, max 3.08), and the a91721e1d9 build's NieR bar still fails by 21-25 % (8.61 vs 6.48, 11.47 vs
   9.08). */
for (const theme of THEMES) {
  await sec(`ink mass ${theme}`, async () => {
    const p = await newWidePage(2);
    try {
      await setTheme(p, theme, true);
      await p.evaluate(() => window.PM56_DEMO.setVariant(1, 5));
      await p.waitForTimeout(400);
      const id = await p.evaluate(() => {
        const row = [...document.querySelectorAll('.thread-row')].find(r => r.querySelector('.ph-status[data-status="idle"]') && !r.classList.contains('active'));
        if (!row) return null;
        row.setAttribute('data-nx-probe', '1');
        row.scrollIntoView({ block: 'center' });
        return row.getAttribute('data-id') || '';
      });
      if (!id) { check(false, `11d idle vs working ink mass [${theme}]: no idle row with an id`, null); return; }
      const reprobe = () => p.evaluate(i => { const r = [...document.querySelectorAll('.thread-row')].find(x => x.getAttribute('data-id') === i); if (r) r.setAttribute('data-nx-probe', '1'); return !!r; }, id);
      const massOf = (f, cw) => {
        const k = f.w / cw, W = f.w, H = f.h, px = f.px, edge = [[], [], []];
        for (let x = 0; x < W; x++) for (const y of [0, H - 1]) { const q = (y * W + x) * 4; for (let c = 0; c < 3; c++) edge[c].push(px[q + c]); }
        for (let y = 0; y < H; y++) for (const x of [0, W - 1]) { const q = (y * W + x) * 4; for (let c = 0; c < 3; c++) edge[c].push(px[q + c]); }
        const bg = edge.map(a => { a.sort((u, v) => u - v); return a[a.length >> 1]; });
        let m = 0;
        const lb = luminance(bg), cr = [];
        for (let q = 0; q < px.length; q += 4) {
          m += (Math.abs(px[q] - bg[0]) + Math.abs(px[q + 1] - bg[1]) + Math.abs(px[q + 2] - bg[2])) / 765;
          const l = luminance([px[q], px[q + 1], px[q + 2]]);
          cr.push((Math.max(l, lb) + 0.05) / (Math.min(l, lb) + 0.05));
        }
        cr.sort((u, v) => u - v);
        return { mass: m / (k * k), peak: cr[Math.floor(cr.length * 0.995)] };
      };
      const measure = async () => {
        const box = await p.evaluate(() => { const h = document.querySelector('.thread-row[data-nx-probe] .ph-status'); if (!h) return null; const r = h.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
        if (!box) return null;
        const clip = { x: Math.floor(box.x - 4), y: Math.floor(box.y - 4), width: Math.ceil(box.w + 8), height: Math.ceil(box.h + 8) };
        await freezeNx(p);
        const idle = massOf(await readClip(p, clip), clip.width);
        await p.evaluate(() => {
          const h = document.querySelector('.thread-row[data-nx-probe] .ph-status');
          h.__nxSaved = [h.innerHTML, h.className, h.getAttribute('data-status')];
          h.className = h.className.replace(/\bph-s-idle\b/, 'ph-s-working');
          h.setAttribute('data-status', 'working');
          h.innerHTML = window.PM56_NEON.status('working', 15);
        });
        await p.waitForTimeout(120);
        const n = await p.evaluate(() => {
          const h = document.querySelector('.thread-row[data-nx-probe] .ph-status');
          window.__nxMass = [];
          for (const a of document.getAnimations()) {
            const t = a.effect && a.effect.target;
            if (!t || !h.contains(t)) continue;
            const d = a.effect.getTiming().duration;
            a.pause();
            window.__nxMass.push([a, a.currentTime || 0, typeof d === 'number' ? d : 0]);
          }
          return window.__nxMass.length;
        });
        const work = [];
        for (let k = 0; k < 12; k++) {
          await p.evaluate(k => { for (const [a, c0, d] of window.__nxMass) a.currentTime = c0 + k * d / 12; return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, k);
          work.push(massOf(await readClip(p, clip), clip.width));
        }
        await p.evaluate(() => {
          const h = document.querySelector('.thread-row[data-nx-probe] .ph-status');
          window.__nxMass = null;
          if (h && h.__nxSaved) { const [html, cls, st] = h.__nxSaved; h.innerHTML = html; h.className = cls; h.setAttribute('data-status', st); h.__nxSaved = null; }
        });
        const avg = k => work.reduce((a, b) => a + b[k], 0) / work.length;
        return { idle: +idle.mass.toFixed(1), working: +avg('mass').toFixed(1), workingMin: +Math.min(...work.map(w => w.mass)).toFixed(1),
          idlePeak: +idle.peak.toFixed(2), workingPeak: +Math.min(...work.map(w => w.peak)).toFixed(2), workingPeakMean: +avg('peak').toFixed(2), loops: n };
      };
      const st = {};
      await p.mouse.move(5, 1075); await p.waitForTimeout(300);
      st.rest = await measure();
      await p.locator('.thread-row[data-nx-probe]').first().hover(); await p.waitForTimeout(450);
      st.hover = await measure();
      await p.mouse.move(5, 1075); await p.waitForTimeout(300);
      await p.evaluate(i => window.PM56_DEMO.selectThread(i), id); await p.waitForTimeout(700);
      await reprobe();
      await p.mouse.move(5, 1075); await p.waitForTimeout(300);
      st.selected = await measure();
      await p.locator('.thread-row[data-nx-probe]').first().hover(); await p.waitForTimeout(450);
      st.selectedHover = await measure();
      const bad = Object.entries(st).filter(([, v]) => !v || !(v.idle <= v.working) || !(v.working > 0) || !(v.idlePeak <= v.workingPeak)).map(([k]) => k);
      const line = Object.entries(st).map(([k, v]) => v ? `${k} ${v.idle} vs ${v.working} (p99.5 ${v.idlePeak} vs ${v.workingPeak})` : `${k} missing`).join(', ');
      check(bad.length === 0, `11d idle vs working painted ink [${theme}]: ${line} (ink mass in CSS px of full ink, idle vs working's mean; p99.5 pixel contrast on the field, idle vs working's lowest phase; want idle <= working in both on each state)`, { states: st, failing: bad });
    } finally { await shut(p); }
  });
}

/* ------------------------------------------------------------- check 12: glow present / absent */
await sec('glow present', async () => {
  const p = await newPage();
  try {
    await setTheme(p, 'basic-dark', true);
    const info = await p.evaluate(() => {
      const host = document.createElement('div');
      host.id = 'nx-test-glow';
      host.style.cssText = 'position:fixed;left:0;top:0;width:90px;height:90px;z-index:99999;display:flex;align-items:center;justify-content:center;background:transparent;';
      const row = document.querySelector('.thread-row');
      host.style.background = row ? getComputedStyle(row).backgroundColor : '#000';
      host.innerHTML = window.PM56_NEON.status('waiting', 15);
      document.body.appendChild(host);
      const wrap = host.querySelector('.nx-st');
      return { bl: getComputedStyle(wrap, '::before').opacity };
    });
    await freezeNx(p); /* waiting backlight parks at its .08 peak */
    const A = await readClip(p, { x: 0, y: 0, width: 90, height: 90 });
    /* Same mark with only the backlight suppressed: the glyph cancels out and
       the difference is the backlight alone, over its whole disc. */
    await p.evaluate(() => {
      const st = document.createElement('style');
      st.id = 'nx-test-glow-off';
      st.textContent = '#nx-test-glow.off .nx-st::before{display:none !important}';
      document.head.appendChild(st);
      document.getElementById('nx-test-glow').classList.add('off');
    });
    await p.waitForTimeout(150);
    const B = await readClip(p, { x: 0, y: 0, width: 90, height: 90 });
    let sum = 0, n = 0;
    for (let y = 0; y < 90; y++) for (let x = 0; x < 90; x++) {
      if (Math.hypot(x - 45, y - 45) > 20) continue; /* the backlight's 33px disc */
      const i = (y * 90 + x) * 4;
      sum += (Math.abs(A.px[i] - B.px[i]) + Math.abs(A.px[i + 1] - B.px[i + 1]) + Math.abs(A.px[i + 2] - B.px[i + 2])) / 3;
      n++;
    }
    const mean = sum / n;
    check(mean > 1.0, `12a glow present (basic-dark): backlight disc differs ${mean.toFixed(2)} grey levels with it on vs suppressed (want > 1.0), ::before opacity ${info.bl}`, { mean: +mean.toFixed(2), before: info.bl });
  } finally { await shut(p); }
});
for (const theme of ['nier-dark', 'nier-light']) {
  if (!THEMES.includes(theme)) continue;
  await sec(`glow absent ${theme}`, async () => {
    const p = await newPage();
    try {
      await setTheme(p, theme, true);
      const bad = await p.evaluate(list => {
        const out = [];
        const host = document.createElement('div');
        host.id = 'nx-test-matrix';
        host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;';
        host.innerHTML = list.map(s => window.PM56_NEON.status(s, 15)).join('');
        document.body.appendChild(host);
        const halos = [...host.querySelectorAll('.nx-h'), ...[...document.querySelectorAll('.nx-h')].slice(0, 40)];
        const seen = new Set();
        for (const h of halos) {
          if (seen.has(h)) continue;
          seen.add(h);
          const cs = getComputedStyle(h);
          if (cs.display !== 'none' && cs.strokeOpacity !== '0' && cs.visibility !== 'hidden')
            out.push(`nx-h paints (display ${cs.display}, stroke-opacity ${cs.strokeOpacity})`);
          if (out.length >= 8) break;
        }
        const wraps = [...host.querySelectorAll('.nx-st'), ...[...document.querySelectorAll('.nx-st')].slice(0, 10)];
        const seenW = new Set();
        for (const w of wraps) {
          if (seenW.has(w)) continue;
          seenW.add(w);
          const cs = getComputedStyle(w, '::before');
          if (cs.display !== 'none' && cs.opacity !== '0' && cs.content !== 'none')
            out.push(`backlight paints (${[...w.classList].filter(c => c.startsWith('nx-st-') || c.startsWith('nx-tn-')).join(' ')}: opacity ${cs.opacity})`);
          if (out.length >= 8) break;
        }
        return out;
      }, STATUS_13);
      check(bad.length === 0, `12b/c no glow under ${theme} (.nx-h hidden/0, backlight opacity 0/none)`, bad);
    } finally { await shut(p); }
  });
}

/* ------------------------------------------------------------- check 13: salience */
/* In lists, "needs you" outshines working (plan section 3): on the real marks of the wide take-6 thread list (two
   unselected rows, pointer parked), waiting's core halo is at least working's and its frame-difference energy (the
   "?" hop and the backlight's swell; under NieR the hop and the corner brackets) is at least the working bead's (the
   diamond's under NieR), in every theme. Both marks are sampled in the same frames, 60 of them (about 20 s), dpr 2,
   a 32 px box around each (the 15 px mark and its 33 px backlight). Integrate (2026-10-02): it read one synthetic
   host in basic-dark only, which under NieR sat behind the page's own furniture. */
if (REDUCED) skip('13 salience (needs motion; --reduced stops it)', null);
else await sec('salience', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
  await ctx.addInitScript(() => { try { localStorage.setItem('pm56-history-w', '320'); } catch (e) {} });
  const p = await ctx.newPage();
  p.__ctx = ctx;
  try {
    watch(p);
    await p.goto(pathToFileURL(FILE).href, { waitUntil: 'load' });
    await boot(p);
    const B = 16, N = 120, DT = 140;
    for (const theme of THEMES) {
      await p.evaluate(t => { window.PM56_DEMO.setTheme(t); window.PM56_DEMO.setVariant(1, 5); }, theme);
      await p.waitForTimeout(1200);
      const pos = await p.evaluate(() => {
        const out = {};
        for (const s of ['waiting', 'working']) {
          const el = document.querySelector(`.thread-row:not(.active) .ph-status[data-status="${s}"]`);
          if (!el) { out[s] = null; continue; }
          el.scrollIntoView({ block: 'center' });
        }
        for (const s of ['waiting', 'working']) {
          const el = document.querySelector(`.thread-row:not(.active) .ph-status[data-status="${s}"]`);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const h = el.querySelector('.nx-st svg.nx > .nx-h') || el.querySelector('.nx-h');
          const cs = h ? getComputedStyle(h) : null;
          out[s] = { x: r.x + r.width / 2, y: r.y + r.height / 2, halo: !cs ? -1 : (cs.display === 'none' || cs.visibility === 'hidden' ? 0 : parseFloat(cs.strokeOpacity)) };
        }
        return out;
      });
      if (!pos.waiting || !pos.working) { check(false, `13 salience [${theme}]: no unselected waiting and working rows in the wide list`, pos); continue; }
      await p.mouse.move(5, 1075);
      await p.waitForTimeout(400);
      const clip = k => ({ x: Math.round(pos[k].x - B), y: Math.round(pos[k].y - B), width: 2 * B, height: 2 * B });
      const e = { waiting: 0, working: 0 }, prev = {};
      /* Fix cycle 1: both marks are read at the same animation time. Every animation on the page is paused; the
         two marks' own (pseudo-elements included) are stepped together, DT ms a step, N steps (16.8 s: two turns
         of NieR's list diamond, seven needs-you cycles, nearly two 9 s bead turns), so neither load nor the
         screenshot order shifts their phases. */
      const stepped = await p.evaluate(() => {
        const hosts = ['waiting', 'working'].map(s => document.querySelector(`.thread-row:not(.active) .ph-status[data-status="${s}"]`));
        window.__nxAll = document.getAnimations().filter(a => a.playState === 'running'); /* only these resume */
        window.__nxStep = [];
        for (const a of window.__nxAll) {
          a.pause();
          const t = a.effect && a.effect.target;
          if (t && hosts.some(h => h && h.contains(t))) window.__nxStep.push([a, a.currentTime || 0]);
        }
        return window.__nxStep.length;
      });
      for (let i = 0; i < N; i++) {
        await p.evaluate(t => { for (const [a, c0] of window.__nxStep) a.currentTime = c0 + t; return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, i * DT);
        for (const k of ['waiting', 'working']) {
          const f = await readClip(p, clip(k));
          if (prev[k]) for (let q = 0; q < f.px.length; q += 4)
            e[k] += (Math.abs(f.px[q] - prev[k].px[q]) + Math.abs(f.px[q + 1] - prev[k].px[q + 1]) + Math.abs(f.px[q + 2] - prev[k].px[q + 2])) / 3;
          prev[k] = f;
        }
      }
      await p.evaluate(() => { for (const a of window.__nxAll || []) { try { a.play(); } catch (x) {} } window.__nxAll = window.__nxStep = null; });
      const px = prev.waiting.w * prev.waiting.h * (N - 1);
      const ew = +(e.waiting / px).toFixed(3), ek = +(e.working / px).toFixed(3);
      const halo = { waiting: pos.waiting.halo, working: pos.working.halo };
      check(halo.waiting >= halo.working && halo.working >= 0 && ew >= ek && ek > 0,
        `13 salience [${theme}]: waiting halo ${halo.waiting} >= working ${halo.working}, motion energy ${ew} >= ${ek} (wide list, ${N} steps of ${DT} ms at one animation time, ${stepped} loops stepped)`, { halo, energy: { waiting: ew, working: ek }, stepped });
    }
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 14: no status ink on concept or control glyphs */
/* Colour is reserved for status (plan §4). At rest (pointer parked), a glyph that is not a status mark may not be
   inked in a tone token, except inside the hosts the plan lets carry tone: status wrappers and self-lit hosts (the
   bar, the Lens trigger, jump-bottom, the Orbit discs, the Fast bolt), [data-tone], .is-danger, warning and danger
   event cards, and the Needs-you medallion (its canon accent). Menu check marks keep the accent as a selection and
   are not in these views. */
const TONE_HOSTS = '.nx-st, .nx-self, .nx-bolt, .activity-item, .pm-lens-trigger, .jump-bottom, .af-chip-pending, .orbit-node, .orbit-core, .wa-disc, .rail8-item, .pm-rail-item, [data-tone], .is-danger, .event-card.danger, .event-card.warning, .event-card.positive, [data-family="ledger"].warning, [data-family="ledger"].danger, [data-family="ledger"].positive, [data-family="needs"]';
/* The Query thread in two dark themes, and the attachments thread (toned ledger lines: positive, warning) in a dark
   and a light theme (fix cycle 1: a positive line's concept glyph is inked --positive, a tone host). */
for (const [theme, thread] of [['basic-dark', 'query'], ['friendly-dark', 'query'], ['basic-dark', 'attachments'], ['basic-light', 'attachments'], ['retro-light', 'query']]) {
  if (!THEMES.includes(theme)) continue;
  await sec(`status ink ${theme} ${thread}`, async () => {
    const p = await newWidePage();
    try {
      await setTheme(p, theme, true);
      await p.evaluate(t => { window.PM56_DEMO.selectThread(t); window.PM56_DEMO.setVariant(1, 5); }, thread);
      await p.waitForTimeout(800);
      await p.mouse.move(5, 1075);
      await p.waitForTimeout(400);
      const r = await p.evaluate(hosts => {
        /* fix cycle 2: every colour goes through the browser (a probe element's computed colour), so a token written
           as 3-digit hex, hsl() or color-mix() resolves, and color(srgb ...) (a color-mix() tube) parses; an ink that
           still cannot be parsed is reported, never skipped */
        const parse = c => {
          c = String(c || '').trim();
          let m = /^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)/.exec(c);
          if (m) return [m[1] * 255, m[2] * 255, m[3] * 255];
          m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(c);
          return m ? [+m[1], +m[2], +m[3]] : null;
        };
        const pr = document.createElement('span');
        pr.style.cssText = 'position:absolute;left:-9999px;top:0;';
        document.body.appendChild(pr);
        const resolve = (el, v) => { (el || document.body).appendChild(pr); pr.style.color = ''; pr.style.color = v; const c = getComputedStyle(pr).color; return pr.style.color ? parse(c) : null; };
        const rgb = parse;
        const tones = {}, unparsed = [];
        for (const t of ['danger', 'warning', 'positive', 'accent', 'accent-2']) { tones[t] = resolve(document.body, 'var(--' + t + ')'); if (!tones[t]) unparsed.push('token --' + t); }
        /* Turn Stage family hues (the deliverable kicker's --fam-deliverable) are canon item-family inks, not status;
           in retro-light --fam-deliverable is the same colour as --accent-2, so a glyph in its family ink is skipped */
        const fams = [];
        for (const host of document.querySelectorAll('.transcript-inner > [data-family]')) {
          if (!getComputedStyle(host).getPropertyValue('--fam-' + host.dataset.family).trim()) continue;
          const v = resolve(host, 'var(--fam-' + host.dataset.family + ')');
          if (v) fams.push(v); else unparsed.push('--fam-' + host.dataset.family);
        }
        const isFam = (ink, s) => !!s.closest('.transcript-inner > [data-family]') && fams.some(v => Math.hypot(ink[0] - v[0], ink[1] - v[1], ink[2] - v[2]) < 3);
        const bad = [];
        let n = 0;
        for (const s of document.querySelectorAll('svg.nx')) {
          if (s.classList.contains('nx-r-status') || s.closest(hosts)) continue;
          if (!s.getBoundingClientRect().width) continue;
          const tube = s.querySelector('.nx-c');
          if (!tube) continue;
          const raw = getComputedStyle(tube).stroke, ink = rgb(raw);
          if (!ink) { if (raw !== 'none') unparsed.push(s.dataset.nx + ': ' + raw); continue; }
          n++;
          if (isFam(ink, s)) continue;
          for (const [t, v] of Object.entries(tones)) {
            if (v && Math.hypot(ink[0] - v[0], ink[1] - v[1], ink[2] - v[2]) < 10) {
              const up = [s.parentElement, s.parentElement && s.parentElement.parentElement].filter(Boolean)
                .map(e => e.tagName.toLowerCase() + '.' + String(e.className.baseVal ?? e.className).split(/\s+/).slice(0, 3).join('.')).join(' < ');
              bad.push({ tone: t, glyph: s.dataset.nx, cls: s.getAttribute('class'), in: up });
              break;
            }
          }
        }
        const toned = document.querySelectorAll('.transcript-inner > [data-family="ledger"]:is(.positive, .warning, .danger) > .event-icon > svg.nx').length;
        pr.remove();
        return { n, toned, bad: bad.slice(0, 12), unparsed: unparsed.slice(0, 12) };
      }, TONE_HOSTS);
      check(r.n >= 20 && r.bad.length === 0 && r.unparsed.length === 0, `14 no status ink on concept/control glyphs [${theme}, ${thread}] (${r.n} glyphs read at rest, ${r.toned} in toned ledger lines skipped, ${r.unparsed.length} unparsable inks)`, { bad: r.bad, unparsed: r.unparsed });
    } finally { await shut(p); }
  });
}

/* ------------------------------------------------------------- check 15: transcript halo ink */
/* A status glyph in the transcript takes its tone through --nx-ink on both the tube and its halo, so the halo is
   never a different colour from the line it lights (a `color`-only tone would leave the halo in the host ink). */
await sec('transcript halo ink', async () => {
  const p = await newPage();
  try {
    await setTheme(p, 'basic-dark');
    await p.evaluate(() => { window.PM56_DEMO.selectThread('query'); window.PM56_DEMO.startWorking(); });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => {
      const out = { n: 0, bad: [] };
      const sel = '.transcript svg.nx.nx-r-status, .transcript .nx-st svg.nx';
      for (const s of new Set(document.querySelectorAll(sel))) {
        const groups = [s, ...s.querySelectorAll(':scope > .nx-p')];
        let any = false;
        for (const g of groups) {
          const h = g.querySelector(':scope > .nx-h'), t = g.querySelector(':scope > .nx-c');
          if (!h || !t) continue;
          any = true;
          const hs = getComputedStyle(h).stroke, ts = getComputedStyle(t).stroke;
          if (hs !== ts) out.bad.push({ glyph: s.dataset.nx, halo: hs, tube: ts });
        }
        if (any) out.n++;
      }
      out.bad = out.bad.slice(0, 10);
      return out;
    });
    check(r.n >= 1 && r.bad.length === 0, `15 transcript status glyphs: halo ink equals tube ink (${r.n} glyphs)`, r.bad);
  } finally { await shut(p); }
});

/* ------------------------------------------------------------- check 16: no blank status block */
/* NieR inverts needs-you into an ink block with paper strokes; a host rule that inks the glyph in the block's own ink
   blanks it (final review, 2026-10-03: the pmx decision row's "Your move." mark, module-shell.css's accent at 0,5,1,
   since NieR's --accent is the ink). Every status wrapper that paints a background, on every thread and in the To-Do,
   Goal and Subagents panels, has a glyph ink that differs from that background (NieR themes; the default themes paint
   none, which the count reports). */
for (const theme of THEMES.filter(t => t.startsWith('nier'))) {
  await sec(`blank blocks ${theme}`, async () => {
    const p = await newWidePage();
    try {
      await setTheme(p, theme);
      await p.evaluate(() => window.PM56_DEMO.setVariant(1, 5));
      const ids = await p.evaluate(() => [...document.querySelectorAll('.thread-row')].map(r => r.dataset.id));
      const scan = () => p.evaluate(() => {
        let n = 0; const bad = [];
        for (const st of document.querySelectorAll('.nx-st')) {
          const bg = getComputedStyle(st).backgroundColor;
          if (bg === 'rgba(0, 0, 0, 0)' || st.getBoundingClientRect().width < 1) continue;
          const c = st.querySelector('svg .nx-c, svg .nx-f');
          if (!c) continue;
          n++;
          const cs = getComputedStyle(c), ink = cs.stroke !== 'none' ? cs.stroke : cs.fill;
          if (ink === bg) bad.push(st.className + ' @' + String(st.parentElement.className).slice(0, 40) + ' ' + bg);
        }
        return { n, bad };
      });
      let n = 0; const bad = new Set();
      for (const id of ids) {
        await p.evaluate(i => window.PM56_DEMO.selectThread(i), id);
        await p.waitForTimeout(300);
        const r = await scan(); n += r.n; r.bad.forEach(b => bad.add(id + ': ' + b));
      }
      for (const d of ['todo', 'goal', 'subagents']) {
        await p.evaluate(x => window.PM56_DEMO.openActivity(x), d);
        await p.waitForTimeout(400);
        const r = await scan(); n += r.n; r.bad.forEach(b => bad.add('panel ' + d + ': ' + b));
      }
      check(n > 0 && bad.size === 0, `16 no blank status block [${theme}]: ${n} painted blocks on ${ids.length} threads and 3 panels, glyph ink never the block's`, [...bad].slice(0, 10));
    } finally { await shut(p); }
  });
}

/* ------------------------------------------------------------- check 17: hover ignites the tube */
/* Ruling 1: controls ignite on hover. Final review (2026-10-03): many hosts restate their muted ink after the generic
   `.icon-button:hover{color:var(--text)}`, so on light themes (no hover halo) a hovered control was pixel-identical to
   rest once its act ended. 17a: the composer's attach, the header's search and the history close, hovered for 600 ms,
   draw their tube in the theme's --text ink, and did not at rest (every theme). 17b: the ink rule never recolours a
   toned glyph: every control or concept glyph its own selector reaches (read from the sheet, the :hover arm dropped)
   whose ink is not set by a higher rule (its own --nx-ink) rests in a neutral ink (--muted, --subtle, --text, idle) on
   every thread, in the composer menus and in six Activity panels (basic-dark, basic-light, retro-light, nier-dark). */
for (const theme of THEMES) {
  await sec(`hover ink ${theme}`, async () => {
    const p = await newWidePage();
    try {
      await setTheme(p, theme);
      await p.evaluate(() => { window.PM56_DEMO.setVariant(1, 5); window.PM56_DEMO.selectThread('plain'); });
      await p.waitForTimeout(700);
      const text = await p.evaluate(() => { const s = document.createElement('span'); s.style.color = 'var(--text)'; document.body.appendChild(s); const c = getComputedStyle(s).color; s.remove(); return c; });
      const rows = [];
      for (const [name, sel] of [['attach', '[data-action="attach"]'], ['search', '.chat-header .icon-button[aria-label*="earch"]'], ['history close', '.history-head .icon-button:last-child']]) {
        const b = await p.$(sel), bb = b && await b.boundingBox();
        if (!bb) { rows.push({ name, missing: true }); continue; }
        const ink = () => p.evaluate(s => getComputedStyle(document.querySelector(s).querySelector('svg.nx .nx-c')).stroke, sel);
        await p.mouse.move(5, 1075); await p.waitForTimeout(300);
        const rest = await ink();
        await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(600);
        const hover = await ink();
        rows.push({ name, rest, hover, ok: hover === text && rest !== text });
      }
      await p.mouse.move(5, 1075);
      check(rows.length === 3 && rows.every(r => r.ok), `17a hover lights the tube to --text [${theme}]: ${rows.map(r => r.name + (r.ok ? '' : ' NO')).join(', ')}`, { text, rows });
    } finally { await shut(p); }
  });
}
for (const theme of ['basic-dark', 'basic-light', 'retro-light', 'nier-dark'].filter(t => THEMES.includes(t))) {
  await sec(`hover ink tones ${theme}`, async () => {
    const p = await newWidePage();
    try {
      await setTheme(p, theme);
      await p.evaluate(() => window.PM56_DEMO.setVariant(1, 5));
      const bare = await p.evaluate(() => {
        for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules; } catch (e) { continue; } for (const r of rs) if (r.selectorText && /--nx-ink:\s*var\(--text\)/.test(r.style.cssText) && /:hover/.test(r.selectorText)) return r.selectorText.replace(/:where\(:hover, :focus-visible\)/g, ''); }
        return null;
      });
      if (!bare) { check(false, `17b hover ink tones [${theme}]: the hover ink rule is missing from the sheets`, null); return; }
      const scan = where => p.evaluate(([bare, where]) => {
        const pr = document.createElement('span'); document.body.appendChild(pr); const tok = {};
        for (const t of ['--muted', '--text', '--subtle', '--nx-idle']) { pr.style.color = 'var(' + t + ', transparent)'; tok[getComputedStyle(pr).color] = 1; }
        pr.remove();
        let n = 0; const bad = [];
        for (const s of document.querySelectorAll('svg.nx')) {
          if (!s.matches(bare) || s.getBoundingClientRect().width < 2) continue;
          const c = s.querySelector('.nx-c'); if (!c) continue;
          n++;
          if (getComputedStyle(s).getPropertyValue('--nx-ink').trim()) continue;
          const ink = getComputedStyle(c).stroke;
          if (!tok[ink]) { const h = s.closest('button, summary, [role="button"], [data-action]'); bad.push(where + ' ' + s.dataset.nx + ' ' + ink + ' @' + h.tagName.toLowerCase() + '.' + String(h.className).trim().replace(/\s+/g, '.').slice(0, 50)); }
        }
        return { n, bad };
      }, [bare, where]);
      let n = 0; const bad = new Set();
      const ids = await p.evaluate(() => [...document.querySelectorAll('.thread-row')].map(r => r.dataset.id));
      for (const id of ids) { await p.evaluate(i => window.PM56_DEMO.selectThread(i), id); await p.waitForTimeout(250); const r = await scan(id); n += r.n; r.bad.forEach(b => bad.add(b)); }
      await p.evaluate(() => window.PM56_DEMO.selectThread('plain')); await p.waitForTimeout(300);
      for (const m of ['wand', 'mode', 'model', 'persona', 'permissions']) {
        const b = await p.$(`[data-menu="${m}"]`); if (!b) continue;
        try { await b.click(); await p.waitForTimeout(400); const r = await scan('menu ' + m); n += r.n; r.bad.forEach(x => bad.add(x)); } catch (e) {}
        await closeOverlays(p);
      }
      for (const d of ['goal', 'todo', 'subagents', 'changes', 'artifacts', 'crew']) {
        try { await p.evaluate(x => window.PM56_DEMO.openActivity(x), d); await p.waitForTimeout(350); const r = await scan('panel ' + d); n += r.n; r.bad.forEach(x => bad.add(x)); } catch (e) {}
      }
      check(n > 100 && bad.size === 0, `17b hover ink leaves toned glyphs alone [${theme}]: ${n} reachable glyphs, every one without its own --nx-ink rests in a neutral ink`, [...bad].slice(0, 12));
    } finally { await shut(p); }
  });
}

/* ------------------------------------------------------------- check 18: Pod 042 clear of the controls */
/* NieR's Pod (40x52, pointer-events none) hovers over the composer's top-right corner. Final review (2026-10-03): it
   hid the jump-to-latest chip, and at some sizes a Resume button and the bar's Artifacts count. At 1440x900,
   1512x982 and 1920x1100 (history at 320), on every thread, with the transcript at its top and at its bottom, the Pod
   intersects no jump chip (visible or not: its slot), bar item, send-queue or decision button, or the composer; at the
   bottom (the resting place) no transcript button or link either (and it has not faded back), and the bar never
   overflows its row. Scrolled up, transcript content passes under the Pod as under PMConcept7's; whenever a transcript
   control is under it, it has faded back (data-shy, opacity <= .2) so the control shows through. */
if (THEMES.includes('nier-dark')) await sec('pod', async () => {
  const bad = []; let views = 0;
  for (const [w, h] of [[1440, 900], [1512, 982], [1920, 1100]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: REDUCED ? 'reduce' : 'no-preference' });
    await ctx.addInitScript(() => { try { localStorage.setItem('pm56-history-w', '320'); } catch (e) {} });
    const p = await ctx.newPage(); p.__ctx = ctx;
    try {
      watch(p);
      await p.goto(pathToFileURL(FILE).href, { waitUntil: 'load' });
      await boot(p);
      await setTheme(p, 'nier-dark');
      await p.evaluate(() => window.PM56_DEMO.setVariant(1, 5));
      const ids = await p.evaluate(() => [...document.querySelectorAll('.thread-row')].map(r => r.dataset.id));
      for (const id of ids) {
        await p.evaluate(i => window.PM56_DEMO.selectThread(i), id);
        await p.waitForTimeout(400);
        await p.mouse.move(5, h - 5);
        for (const pos of ['top', 'bottom']) {
          await p.evaluate(pos => { const t = document.querySelector('.transcript'); t.scrollTop = pos === 'top' ? 0 : t.scrollHeight; t.dispatchEvent(new Event('scroll')); }, pos);
          await p.waitForTimeout(1300); /* the transcript scrolls smoothly (about 600 ms) and the dock settles after it */
          /* the dock can shrink as it settles (recovery-collaboration's composer loses 42 px), which leaves the transcript
             short of its bottom: scroll it down again until it rests there */
          for (let k = 0; pos === 'bottom' && k < 3; k++) {
            const atEnd = await p.evaluate(() => { const t = document.querySelector('.transcript'); return t.scrollTop + t.clientHeight >= t.scrollHeight - 2; });
            if (atEnd) break;
            await p.evaluate(() => { const t = document.querySelector('.transcript'); t.scrollTop = t.scrollHeight; t.dispatchEvent(new Event('scroll')); });
            await p.waitForTimeout(1000);
          }
          const r = await p.evaluate(pos => {
            const pod = document.getElementById('o55np-pod');
            if (!pod || getComputedStyle(pod).display === 'none') return { nopod: true };
            const P = pod.getBoundingClientRect();
            const hit = e => { const q = e.getBoundingClientRect(); if (q.width < 1 || q.height < 1) return 0; const ix = Math.max(0, Math.min(P.right, q.right) - Math.max(P.left, q.left)), iy = Math.max(0, Math.min(P.bottom, q.bottom) - Math.max(P.top, q.top)); return ix * iy > .5 ? Math.round(ix) + 'x' + Math.round(iy) : 0; };
            const out = [];
            for (const e of document.querySelectorAll('.jump-bottom, .activity-item, .send-queue-row button, .decision-host button, .chat-stage > .composer')) { const k = hit(e); if (k) out.push(String(e.className).slice(0, 30) + ' ' + k); }
            /* transcript controls: none under the Pod at the bottom (its resting place); scrolled up, content passes
               under it, and then the Pod must have faded back (data-shy, opacity <= .2) */
            const tr = document.querySelector('.transcript').getBoundingClientRect(), under = [];
            for (const e of document.querySelectorAll('.transcript button, .transcript a[href], .transcript summary')) {
              const q = e.getBoundingClientRect(); if (q.bottom < tr.top || q.top > tr.bottom) continue;
              const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
              const q2 = e.getBoundingClientRect(), ix = Math.min(P.right, q2.right) - Math.max(P.left, q2.left), iy = Math.min(P.bottom, q2.bottom) - Math.max(P.top, q2.top);
              if (ix >= 4 && iy >= 4) under.push('transcript ' + (e.textContent || e.className).trim().slice(0, 24) + ' ' + Math.round(ix) + 'x' + Math.round(iy)); /* a sliver under 4 px hides nothing */
            }
            const shy = pod.hasAttribute('data-shy'), op = +getComputedStyle(pod).opacity;
            if (pos === 'bottom') out.push(...under);
            else if (under.length && !(shy && op <= .2)) out.push('not faded back over ' + under.join(', ') + ' (shy ' + shy + ', opacity ' + op + ')');
            if (!under.length && pos === 'bottom' && shy) out.push('faded back with no control under it');
            const bar = document.querySelector('.chat-float .activity-bar');
            if (bar && bar.scrollWidth - bar.clientWidth > 1) out.push('bar overflows ' + (bar.scrollWidth - bar.clientWidth) + ' px');
            return { out };
          }, pos);
          views++;
          if (r.nopod) bad.push(`${w} ${id}: no Pod`);
          else if (r.out.length) bad.push(`${w} ${id} ${pos}: ${r.out.join(', ')}`);
        }
      }
    } finally { await shut(p); }
  }
  check(views > 0 && bad.length === 0, `18 Pod 042 clear of the jump chip, the bar, the queue, the decision panel and the composer (${views} views: 3 sizes x every thread x top and bottom; at the bottom no transcript button either; faded back over any it passes)`, bad.slice(0, 12));
});

/* ------------------------------------------------------------- check 19: the header word wears its mark's tone */
/* Final review (2026-10-03): the chat header's status word was the warning amber for every status. On a thread of each
   of the nine statuses (basic-dark, basic-light, nier-dark) the word's colour is its mark's tone: blocked danger,
   attention warning, working accent, done positive, idle and paused muted. */
for (const theme of ['basic-dark', 'basic-light', 'nier-dark'].filter(t => THEMES.includes(t))) {
  await sec(`header word ${theme}`, async () => {
    const p = await newWidePage();
    try {
      await setTheme(p, theme);
      await p.evaluate(() => window.PM56_DEMO.setVariant(1, 5));
      const rows = await p.evaluate(() => [...document.querySelectorAll('.thread-row')].map(r => [r.dataset.id, r.querySelector('.ph-status') && r.querySelector('.ph-status').dataset.status]));
      const want = { blocked: '--danger', attention: '--warning', working: '--accent', changed: '--accent-2', done: '--positive', idle: '--muted', paused: '--muted' };
      const seen = {}, bad = [];
      for (const [id, s] of rows) {
        if (!s || seen[s]) continue;
        await p.evaluate(i => window.PM56_DEMO.selectThread(i), id);
        await p.waitForTimeout(300);
        const r = await p.evaluate(want => {
          const c = document.querySelector('.chat-header .chat-state'); if (!c) return null;
          const tone = (c.querySelector('.nx-st') || {}).className || '';
          const t = (/nx-tn-(\w+)/.exec(tone) || [])[1];
          const pr = document.createElement('span'); pr.style.color = 'var(' + want[t] + ')'; document.body.appendChild(pr);
          const w = getComputedStyle(pr).color; pr.remove();
          return { tone: t, data: c.dataset.tone || '', color: getComputedStyle(c).color, want: w };
        }, want);
        seen[s] = r;
        if (!r || r.tone !== r.data || r.color !== r.want) bad.push({ status: s, ...r });
      }
      check(Object.keys(seen).length >= 9 && bad.length === 0, `19 header status word in its mark's tone [${theme}]: ${Object.keys(seen).length} statuses`, bad);
    } finally { await shut(p); }
  });
}

/* ------------------------------------------------------------- console noise + report */
check(consoleErrors.length === 0, 'console: zero warnings/errors from the page', consoleErrors.slice(0, 10));
check(pageErrors.length === 0, 'console: zero page errors', pageErrors.slice(0, 10));
await browser.close();
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ file: FILE, themes: THEMES, reduced: REDUCED, pass, fail, skipped, results, consoleErrors, pageErrors }, null, 1));
console.log(`\nneon-verify: ${pass} PASS, ${fail} FAIL, ${skipped} SKIP (${THEMES.length} themes, reduced=${REDUCED})`);
process.exit(fail ? 1 : 0);


