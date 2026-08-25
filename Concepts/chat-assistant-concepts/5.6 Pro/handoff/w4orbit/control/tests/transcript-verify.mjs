/* tests/transcript-verify.mjs — Wave 3 (Transcript + Lens) verification harness.
 *
 * Re-runnable by any agent:
 *     cd "Concepts/chat-assistant-concepts/5.6 Pro"
 *     node tests/transcript-verify.mjs                    # 1440x900, all checks
 *     node tests/transcript-verify.mjs --json out.json    # machine-readable
 *     node tests/transcript-verify.mjs --reduced-motion   # prefers-reduced-motion
 *     node tests/transcript-verify.mjs --takes 0,5,9,13   # which transcript takes
 *
 * WHY IT LOOKS LIKE THIS
 * ----------------------
 * Two rules this concept learned the hard way and this file obeys.
 *
 * 1. ASSERT PAINTED PIXELS. `getBoundingClientRect()` reports geometry for
 *    elements that are clipped, occluded or mid-transition, and this repo has
 *    already logged three false-positive "fixes" from trusting it. Every
 *    visibility claim here is `document.elementFromPoint()` at the target's own
 *    centre PLUS a colour read of a screenshot crop of the same rectangle.
 *
 * 2. AN ASSERTION YOU HAVE NEVER SEEN GO RED IS NOT AN ASSERTION. Demo Data's
 *    `metaNodes` check spent four reports failing in the direction it expected,
 *    so nobody noticed it was counting selectors nothing emitted. Where the
 *    "broken" and "not started" states look identical -- which is every Context
 *    Lens selection assertion, since "nothing is selected" and "selection does
 *    not work" render the same -- this file asserts the TRANSITION: it records
 *    the before state, acts, and requires the after state to differ in the
 *    specific way claimed. `--selftest` additionally runs the negative controls,
 *    proving each of those checks can go red.
 *
 * WHAT THIS FILE DOES **NOT** CLOSE
 * ---------------------------------
 * Per the project's two-harness standard, the implementer's own harness does
 * not close an item. In particular the item 8 close condition is Wave 2 Demo
 * Data's rebuilt assertion (it diffs two known-different route turns field by
 * field), not this file. See the report for the exact split.
 */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const PAGE = 'file://' + path.join(ROOT, 'index.html');
const EXE = process.env.PM56_CHROME ||
  path.join(process.env.HOME || '', '.cache/ms-playwright/chromium-1234/chrome-linux64/chrome');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const REDUCED = flag('--reduced-motion');
const SELFTEST = flag('--selftest');
const TAKES = opt('--takes', '0,5,9,13').split(',').map(Number);
const JSON_OUT = opt('--json', null);

const results = [];
let consoleIssues = [];

function ok(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail === undefined ? null : detail });
  const tag = pass ? '  PASS' : '**FAIL';
  console.log(`${tag}  ${name}` + (detail !== undefined && detail !== null ? `\n        ${JSON.stringify(detail)}` : ''));
}

/* ---------------------------------------------------------------- pixels */
/* Screenshot the rectangle, hand the PNG back to the page as a data URL, draw
   it to a canvas and read the bytes. Nothing here trusts layout metrics for a
   claim about what is on screen. */
async function crop(page, rect) {
  if (!rect || rect.width < 1 || rect.height < 1) return { distinct: 0, mean: null, empty: true };
  const clip = {
    x: Math.max(0, Math.floor(rect.x)), y: Math.max(0, Math.floor(rect.y)),
    width: Math.max(1, Math.ceil(rect.width)), height: Math.max(1, Math.ceil(rect.height))
  };
  const buf = await page.screenshot({ clip });
  const url = 'data:image/png;base64,' + buf.toString('base64');
  return page.evaluate(async (u) => {
    const img = new Image(); img.src = u; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const seen = new Set(); let r = 0, gg = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
    return { distinct: seen.size, mean: [Math.round(r / n), Math.round(gg / n), Math.round(b / n)], w: c.width, h: c.height };
  }, url);
}

const rectOf = (page, sel, idx = 0) => page.evaluate(([s, i]) => {
  const e = document.querySelectorAll(s)[i];
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}, [sel, idx]);

/* elementFromPoint at the target's own centre: does the target own its pixel? */
const ownsCentre = (page, sel, idx = 0) => page.evaluate(([s, i]) => {
  const e = document.querySelectorAll(s)[i];
  if (!e) return { found: false };
  const r = e.getBoundingClientRect();
  const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return { found: true, owns: !!hit && (hit === e || e.contains(hit)), hitTag: hit ? hit.className || hit.tagName : null };
}, [sel, idx]);


/* A pixel read is meaningless on an element scrolled out of its container: the
   crop lands on whatever else is there and `elementFromPoint` returns null.
   Every pixel assertion below scrolls its target into view first, then waits
   for the smooth-scroll to settle (`.transcript` sets scroll-behavior:smooth). */
async function bringIntoView(page, sel, idx = 0) {
  await page.evaluate(([s, i]) => {
    const e = document.querySelectorAll(s)[i];
    if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, [sel, idx]);
  await page.waitForTimeout(250);
}

/* ------------------------------------------------------------------ main */
const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--allow-file-access-from-files', '--force-color-profile=srgb']
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: REDUCED ? 'reduce' : 'no-preference'
});
const page = await context.newPage();
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleIssues.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => consoleIssues.push('pageerror: ' + e.message));
await page.goto(PAGE);
await page.waitForSelector('.transcript .message', { timeout: 20000 });

const boot = await page.evaluate(() => ({
  boot: !!window.__PM56_BOOT_OK,
  lens: !!window.PM56_LENS, transcript: !!window.PM56_TRANSCRIPT,
  overflow: !!window.PM56_MSG_OVERFLOW
}));
ok('Modules booted (PM56_LENS / PM56_TRANSCRIPT / PM56_MSG_OVERFLOW present)',
  boot.boot && boot.lens && boot.transcript && boot.overflow, boot);

/* ===================================================================== */
/* ITEM 8 — metadata                                                     */
/* ===================================================================== */

/* --- 8.1 metaNodes: the assertion Demo Data reports as failing --------- */
const metaNodes = await page.evaluate(() =>
  document.querySelectorAll('.message .message-meta, .message [data-model]').length);
ok('metaNodes > 0 (Demo Data\'s selector: .message .message-meta, .message [data-model])',
  metaNodes > 0, { metaNodes });

/* --- 8.2 time and model paint, and DIFFER between messages ------------ */
await page.evaluate(() => window.PM56_DEMO.selectThread('route'));
await page.waitForTimeout(200);
const routeMeta = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('.message .message-meta')].map(e => ({
    text: e.innerText.replace(/\n/g, ' | '),
    model: e.querySelector('[data-model]')?.innerText || null,
    provider: e.querySelector('[data-provider]')?.innerText || null,
    time: e.querySelector('.meta-time')?.innerText || null
  }));
  return {
    rows,
    models: [...new Set(rows.map(r => r.model).filter(Boolean))],
    times: [...new Set(rows.map(r => r.time).filter(Boolean))],
    fixtureModels: [...new Set(window.PM56_DATA.threads.find(t => t.id === 'route')
      .messages.filter(m => m.runtime).map(m => m.runtime.model))]
  };
});
ok('route thread paints BOTH of its models per-message (mid-thread model change)',
  routeMeta.models.length === 2 &&
  routeMeta.fixtureModels.every(m => routeMeta.models.includes(m)),
  { painted: routeMeta.models, fixture: routeMeta.fixtureModels });
ok('per-message clocks DIFFER between messages (not one invented walk)',
  routeMeta.times.length >= 3, { distinctTimes: routeMeta.times.length, sample: routeMeta.times.slice(0, 4) });

/* All five provider/model pairs in the fixture reach the screen somewhere. */
const allPairs = await page.evaluate(async () => {
  const D = window.PM56_DATA;
  const want = new Set();
  D.threads.forEach(t => t.messages.forEach(m => { if (m.runtime) want.add(m.runtime.provider + '/' + m.runtime.model); }));
  const seen = new Set();
  for (const t of D.threads) {
    window.PM56_DEMO.selectThread(t.id);
    await new Promise(r => setTimeout(r, 0));
    document.querySelectorAll('.message .message-meta').forEach(e => {
      const p = e.querySelector('[data-provider]')?.innerText;
      const m = e.querySelector('[data-model]')?.innerText;
      if (p && m) seen.add(p + '/' + m);
    });
  }
  return { want: [...want].sort(), seen: [...seen].sort() };
});
ok('all 5 fixture provider/model pairs paint on a message somewhere',
  allPairs.want.every(w => allPairs.seen.includes(w)),
  { want: allPairs.want.length, seen: allPairs.seen.length, missing: allPairs.want.filter(w => !allPairs.seen.includes(w)) });

/* --- 8.3 the chip agrees with the details panel ------------------------ */
await page.evaluate(() => window.PM56_DEMO.selectThread('route'));
await page.waitForTimeout(150);
const agree = await page.evaluate(() => {
  const arts = [...document.querySelectorAll('.message-assistant')];
  const out = [];
  for (const a of arts.slice(0, 3)) {
    a.querySelector('[data-action="message-details"]')?.click();
  }
  return out;
});
await page.waitForTimeout(250);
const chipVsPanel = await page.evaluate(() => {
  const rows = [];
  document.querySelectorAll('.message-assistant').forEach(a => {
    const chip = a.querySelector('.message-meta [data-model]');
    const panel = a.querySelector('.message-details');
    if (!chip || !panel) return;
    let panelModel = null;
    panel.querySelectorAll('.detail-kv').forEach(kv => {
      if (kv.querySelector('label')?.textContent === 'Model') panelModel = kv.querySelector('strong').textContent;
    });
    rows.push({ chip: chip.innerText.trim(), panel: panelModel, agree: chip.innerText.trim() === panelModel });
  });
  return rows;
});
ok('meta chip and the details panel report the SAME model on every open turn',
  chipVsPanel.length > 0 && chipVsPanel.every(r => r.agree), chipVsPanel);

/* --- 8.4 actions absent at rest, present on hover (pixels) ------------- */
await page.evaluate(() => window.PM56_DEMO.selectThread('query'));
await page.waitForTimeout(200);
await page.mouse.move(5, 5);
await page.waitForTimeout(300);
const copySel = '.message-assistant [data-action="copy-message"]';
await bringIntoView(page, '.message-assistant');
await page.mouse.move(5, 5);
await page.waitForTimeout(300);
const restRect = await rectOf(page, copySel);
const restHit = await ownsCentre(page, copySel);
const restCrop = await crop(page, restRect);
await page.hover('.message-assistant .message-body');
await page.waitForTimeout(350);
const hovRect = await rectOf(page, copySel);
const hovHit = await ownsCentre(page, copySel);
const hovCrop = await crop(page, hovRect);
ok('message actions are ABSENT at rest (does not own its own centre)',
  restHit.found && !restHit.owns, restHit);
ok('message actions PAINT NOTHING at rest (flat crop)',
  restCrop.distinct <= 4, { distinct: restCrop.distinct, mean: restCrop.mean });
ok('message actions are PRESENT on hover (owns its own centre)', hovHit.owns, hovHit);
ok('message actions PAINT on hover (crop gains colours)',
  hovCrop.distinct > restCrop.distinct + 4, { rest: restCrop.distinct, hover: hovCrop.distinct });

/* the meta row, by contrast, must paint AT REST */
await page.mouse.move(5, 5); await page.waitForTimeout(300);
const metaRect = await rectOf(page, '.message-assistant .message-meta');
const metaCrop = await crop(page, metaRect);
const metaHit = await ownsCentre(page, '.message-assistant .message-meta .meta-model');
ok('the meta row PAINTS AT REST (not swept up in the hover gate)',
  metaCrop.distinct > 8 && metaHit.owns, { distinct: metaCrop.distinct, owns: metaHit.owns });

/* --- 8.5 exactly one Edit per thread ---------------------------------- */
const editCounts = await page.evaluate(async () => {
  const out = {};
  for (const t of window.PM56_DATA.threads) {
    window.PM56_DEMO.selectThread(t.id);
    await new Promise(r => setTimeout(r, 0));
    out[t.id] = {
      dom: document.querySelectorAll('.transcript [data-action="edit-message"]').length,
      fixture: t.messages.filter(m => m.eligibleForEdit).length
    };
  }
  return out;
});
const editIds = Object.keys(editCounts);
ok('exactly ONE Edit control per thread, on all 24 threads',
  editIds.every(k => editCounts[k].dom === 1),
  { offenders: editIds.filter(k => editCounts[k].dom !== 1).map(k => k + ':' + editCounts[k].dom) });
ok('the Edit control sits on the message the fixture marks eligibleForEdit',
  await page.evaluate(async () => {
    window.PM56_DEMO.selectThread('query');
    await new Promise(r => setTimeout(r, 0));
    const btn = document.querySelector('.transcript [data-action="edit-message"]');
    const t = window.PM56_DATA.threads.find(x => x.id === 'query');
    const want = t.messages.filter(m => m.eligibleForEdit).map(m => m.id);
    return !!btn && want.includes(btn.dataset.id);
  }), null);

/* --- 8.6 the row spec, on one line ------------------------------------ */
/* The chat column is only ~460px at the stock 54% editor split, which is
   narrower than metadata + four buttons; the two boxes then WRAP TOGETHER,
   which is the intended behaviour but not the claim under test. Widen the
   column by dragging the real resizer -- driving the same pointer path a user
   would -- so the claim being asserted is "they share a line when the width
   allows", not "the window is big". */
await page.setViewportSize({ width: 1920, height: 1000 });
await page.waitForTimeout(250);
{
  const h = await rectOf(page, '.main-resizer[data-resize="editor"]');
  if (h) {
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
    await page.mouse.down();
    await page.mouse.move(520, h.y + h.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  }
}
await page.hover('.message-assistant .message-body');
await page.waitForTimeout(300);
const oneLine = await page.evaluate(() => {
  const a = document.querySelector('.message-assistant');
  const meta = a.querySelector('.message-meta'), acts = a.querySelector('.message-actions');
  if (!meta || !acts) return null;
  const m = meta.getBoundingClientRect(), c = acts.getBoundingClientRect();
  const order = [...acts.children].map(e => ({
    label: (e.dataset.action || e.className), order: getComputedStyle(e).order
  }));
  const orderOf = {
    copy: getComputedStyle(acts.querySelector('[data-action="copy-message"]')).order,
    details: getComputedStyle(acts.querySelector('[data-action="message-details"]')).order
  };
  return {
    sameLine: Math.abs(m.top - c.top) < 8, metaTop: Math.round(m.top), actTop: Math.round(c.top),
    chatWidth: Math.round(document.querySelector('.transcript').clientWidth), order, orderOf
  };
});
ok('metadata and the action buttons share ONE line when width allows',
  oneLine && oneLine.sameLine, oneLine && { metaTop: oneLine.metaTop, actTop: oneLine.actTop, chatWidth: oneLine.chatWidth });
ok('the row order is the packet\'s: Copy · [meta] · Edit · More Info · outboard',
  oneLine && Number(oneLine.orderOf.copy) < Number(oneLine.orderOf.details), oneLine && oneLine.orderOf);
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(200);
await page.reload();
await page.waitForSelector('.transcript .message');
await page.waitForTimeout(300);

/* --- 8.6b below 590px everything in the row is visible BY DESIGN ------- */
/* styles.css:332 deliberately drops the hover gate on phones, where there is no
   hover. Moving the gate onto `.text-button` would have silently repealed that,
   so it is restated in transcript.css -- and asserted here, at rest, with the
   pointer parked in the corner. */
await page.setViewportSize({ width: 430, height: 900 });
await page.waitForTimeout(300);
await page.evaluate(() => window.PM56_DEMO.selectThread('query'));
await bringIntoView(page, '.message-assistant');
await page.mouse.move(2, 2);
await page.waitForTimeout(350);
const phoneHit = await ownsCentre(page, '.message-assistant [data-action="copy-message"]');
const phoneVis = await page.evaluate(() => {
  const b = document.querySelector('.message-assistant [data-action="copy-message"]');
  const s = getComputedStyle(b);
  return { visibility: s.visibility, opacity: s.opacity };
});
const phoneOverflow = await page.evaluate(() => document.body.scrollWidth - document.documentElement.clientWidth);
ok('below 590px the action row stays visible at rest, as the base sheet intends',
  phoneVis.visibility === 'visible' && Number(phoneVis.opacity) === 1 && phoneHit.owns && phoneOverflow <= 1,
  { ...phoneVis, owns: phoneHit.owns, overflow: phoneOverflow });
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(250);

/* --- 8.7 no raw enum copy on screen ----------------------------------- */
const rawEnum = await page.evaluate(async () => {
  const bad = [];
  for (const id of ['route', 'query', 'plan-deep', 'debug']) {
    window.PM56_DEMO.selectThread(id);
    await new Promise(r => setTimeout(r, 0));
    const txt = document.querySelector('.transcript').innerText;
    ['deep_plan', 'in_progress', 'budget_limited'].forEach(e => { if (txt.includes(e)) bad.push(id + ':' + e); });
  }
  return bad;
});
ok('no raw underscored enum value reaches the transcript', rawEnum.length === 0, { rawEnum });

/* --- 8.8 across transcript takes -------------------------------------- */
const takeRows = [];
for (const take of TAKES) {
  await page.evaluate((t) => { window.PM56_DEMO.setVariant(5, t); window.PM56_DEMO.selectThread('route'); }, take);
  await page.waitForTimeout(250);
  const r = await page.evaluate(() => {
    const metas = [...document.querySelectorAll('.message .message-meta')];
    const painted = metas.filter(e => e.getBoundingClientRect().height > 0).length;
    const models = [...new Set(metas.map(e => e.querySelector('[data-model]')?.innerText).filter(Boolean))];
    return { metas: metas.length, painted, models: models.length, hOverflow: document.body.scrollWidth - document.body.clientWidth };
  });
  takeRows.push({ take, ...r });
}
ok(`meta row renders and paints in takes ${TAKES.join('/')}`,
  takeRows.every(r => r.metas > 0 && r.painted === r.metas && r.models === 2 && r.hOverflow <= 0), takeRows);
await page.evaluate(() => window.PM56_DEMO.setVariant(5, 0));

/* ===================================================================== */
/* ITEM 9 — Context Lens selection                                       */
/* ===================================================================== */
const L = (fn, ...a) => page.evaluate(fn, ...a);

async function lensReset() {
  await page.evaluate(() => {
    window.PM56_LENS.reset();
    window.PM56_DEMO.selectThread('plain');
  });
  await page.waitForTimeout(200);
}

/* --- 9.1 the four canonical modes, and only those --------------------- */
await lensReset();
await page.click('.pm-lens-trigger');
await page.waitForTimeout(300);
const modeMenu = await L(() => {
  const items = [...document.querySelectorAll('.overlay-menu .lens-mode-item')];
  return {
    labels: items.map(e => e.querySelector('.menu-copy strong').textContent),
    values: items.map(e => e.dataset.value),
    text: document.querySelector('.overlay-menu.sidecar')?.innerText || ''
  };
});
ok('Context Lens offers exactly Mute · Focus · Subcompact · Turn Off',
  JSON.stringify(modeMenu.labels) === JSON.stringify(['Mute', 'Focus', 'Subcompact', 'Turn Off']), modeMenu.labels);
ok('"Auto" is gone from the Context Lens menu', !/\bAuto\b/.test(modeMenu.text), null);

/* --- 9.2 entering a mode paints gutter controls ----------------------- */
const beforeChecks = await L(() => document.querySelectorAll('.pm-lens-check').length);
await page.click('.lens-mode-item[data-value="mute"]');
await page.waitForTimeout(300);
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
const afterChecks = await L(() => document.querySelectorAll('.pm-lens-check').length);
await bringIntoView(page, '.pm-lens-check');
await page.mouse.move(5, 5);
await page.waitForTimeout(250);
const chkHit = await ownsCentre(page, '.pm-lens-check');
const chkRect = await rectOf(page, '.pm-lens-check');
const chkCrop = await crop(page, chkRect);
ok('selection mode adds a gutter control to every text turn (0 -> N)',
  beforeChecks === 0 && afterChecks > 0, { before: beforeChecks, after: afterChecks });
ok('the gutter control owns its own centre and paints',
  chkHit.owns && chkCrop.distinct > 3, { owns: chkHit.owns, distinct: chkCrop.distinct });

/* --- 9.3 Mute applies IMMEDIATELY on toggle (state + pixels) ---------- */
await bringIntoView(page, '.message');
await page.mouse.move(5, 5);
await page.waitForTimeout(250);
const preOpacity = await L(() => getComputedStyle(document.querySelectorAll('.message .message-surface')[0]).opacity);
const preSel = await rectOf(page, '.message .message-surface');
const preCrop = await crop(page, preSel);
await page.click('.pm-lens-check');
await page.waitForTimeout(400);
await page.mouse.move(5, 5);
await page.waitForTimeout(400);
await bringIntoView(page, '.message');
await page.mouse.move(5, 5);
await page.waitForTimeout(300);
const post = await L(() => {
  const s = document.querySelectorAll('.message .message-surface')[0];
  const l = window.PM56_LENS.slice(window.PM56_DEMO.getState().selectedThread);
  return {
    opacity: getComputedStyle(s).opacity,
    state: document.querySelector('.pm-lens-mark')?.getAttribute('data-lens-state'),
    sel: l.selection.length, ops: l.ops.length, mode: l.mode
  };
});
const postCrop = await crop(page, preSel);
ok('Mute applies IMMEDIATELY on toggle — no Apply pressed',
  post.sel === 1 && post.state === 'muted' && Number(post.opacity) < Number(preOpacity),
  { preOpacity, postOpacity: post.opacity, ...post });
ok('the muted turn actually repaints (crop mean shifts toward the ground)',
  Math.abs(preCrop.mean[0] - postCrop.mean[0]) + Math.abs(preCrop.mean[1] - postCrop.mean[1]) +
  Math.abs(preCrop.mean[2] - postCrop.mean[2]) > 6,
  { before: preCrop.mean, after: postCrop.mean });

/* selected state paints: outline on the surface */
const selPaint = await L(() => {
  const art = document.querySelector('.message:has(> .pm-lens-mark[data-lens-sel="1"])');
  if (!art) return null;
  const s = getComputedStyle(art.querySelector('.message-surface'));
  return { outlineWidth: s.outlineWidth, outlineStyle: s.outlineStyle, outlineColor: s.outlineColor };
});
ok('a selected message renders a selected state (outline, not a left-edge bar)',
  !!selPaint && parseFloat(selPaint.outlineWidth) >= 1 && selPaint.outlineStyle === 'solid', selPaint);
/* The packet forbids a coloured LEFT-EDGE ACCENT BAR for selection or status.
   Reading `border-left` in the selected state alone is not that test -- the
   user bubble already carries a 1px border on all four sides, and several takes
   add their own left border as their layout. The real claim is that selection
   ADDS no left edge, so compare the same message selected and unselected and
   require the left border to be unchanged while the outline appears. */
const barDelta = await L(() => {
  const art = document.querySelector('.message:has(> .pm-lens-mark[data-lens-sel="1"]) .message-surface');
  const twin = [...document.querySelectorAll('.message')]
    .filter(m => !m.querySelector('.pm-lens-mark[data-lens-sel="1"]'))
    .map(m => m.querySelector('.message-surface'))
    .filter(Boolean)
    .find(el => el.parentElement.className === art.parentElement.className);
  if (!art || !twin) return null;
  const a = getComputedStyle(art), b = getComputedStyle(twin);
  return {
    selLeft: a.borderLeftWidth + ' ' + a.borderLeftStyle + ' ' + a.borderLeftColor,
    unselLeft: b.borderLeftWidth + ' ' + b.borderLeftStyle + ' ' + b.borderLeftColor,
    selOutline: a.outlineWidth + ' ' + a.outlineStyle,
    unselOutline: b.outlineWidth + ' ' + b.outlineStyle
  };
});
ok('selection adds an OUTLINE and no left-edge accent bar (packet rule)',
  !!barDelta && barDelta.selLeft === barDelta.unselLeft &&
  barDelta.selOutline !== barDelta.unselOutline, barDelta);

/* --- 9.4 Focus applies immediately too, and elevates ------------------ */
await lensReset();
await L(() => { window.PM56_DEMO.selectThread('plain'); });
await page.click('.pm-lens-trigger'); await page.waitForTimeout(250);
await page.click('.lens-mode-item[data-value="focus"]'); await page.waitForTimeout(250);
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
await page.click('.pm-lens-check'); await page.waitForTimeout(350);
const focusState = await L(() => {
  const l = window.PM56_LENS.slice('plain');
  const mark = document.querySelector('.pm-lens-mark');
  const s = getComputedStyle(document.querySelector('.message .message-surface'));
  return { sel: l.selection.length, state: mark?.getAttribute('data-lens-state'), shadow: s.boxShadow, bg: s.backgroundColor };
});
ok('Focus applies IMMEDIATELY and elevates the turn',
  focusState.sel === 1 && focusState.state === 'focused' && focusState.shadow !== 'none', focusState);

/* --- 9.5 Subcompact requires an explicit Apply ------------------------ */
await lensReset();
await page.click('.pm-lens-trigger'); await page.waitForTimeout(250);
await page.click('.lens-mode-item[data-value="subcompact"]'); await page.waitForTimeout(250);
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
const boxes = await page.$$('.pm-lens-check');
for (let i = 0; i < 3; i++) { await boxes[i].click(); await page.waitForTimeout(120); }
const beforeApply = await L(() => {
  const l = window.PM56_LENS.slice('plain');
  return {
    sel: l.selection.length, ops: l.ops.length,
    cards: document.querySelectorAll('.pm-lens-card').length,
    hidden: document.querySelectorAll('.message:has(> .pm-lens-mark[data-lens-state="subcompacted"])').length
  };
});
ok('Subcompact does NOT apply on toggle (3 selected, 0 operations, 0 summary cards)',
  beforeApply.sel === 3 && beforeApply.ops === 0 && beforeApply.cards === 0 && beforeApply.hidden === 0, beforeApply);

await page.click('.pm-lens-trigger'); await page.waitForTimeout(250);
await page.click('[data-action="lens-apply"]'); await page.waitForTimeout(400);
await page.keyboard.press('Escape'); await page.waitForTimeout(250);
const afterApply = await L(() => {
  const l = window.PM56_LENS.slice('plain');
  const card = document.querySelector('.pm-lens-card');
  const visible = [...document.querySelectorAll('.message:has(> .pm-lens-mark[data-lens-state="subcompacted"])')]
    .filter(e => e.getBoundingClientRect().height > 0).length;
  return {
    sel: l.selection.length, ops: l.ops.length, opIds: l.ops[0] ? l.ops[0].ids.length : 0,
    cards: document.querySelectorAll('.pm-lens-card').length,
    visibleShaped: visible,
    cardText: card ? card.innerText.replace(/\n/g, ' ').slice(0, 90) : null
  };
});
const cardRect = await rectOf(page, '.pm-lens-card');
const cardCrop = await crop(page, cardRect);
ok('Apply creates ONE operation and ONE summary card, and clears the selection',
  afterApply.ops === 1 && afterApply.opIds === 3 && afterApply.cards === 1 && afterApply.sel === 0, afterApply);
ok('the subcompacted range collapses to the card (only the card-bearing turn stays)',
  afterApply.visibleShaped === 1, { visibleShaped: afterApply.visibleShaped });
ok('the summary card paints', cardCrop.distinct > 12, { distinct: cardCrop.distinct });

/* rehydration handles */
await page.click('[data-action="lens-rehydrate"]'); await page.waitForTimeout(350);
const rehydrated = await L(() => {
  const l = window.PM56_LENS.slice('plain');
  const states = [...document.querySelectorAll('.pm-lens-mark[data-lens-state]')].map(e => e.getAttribute('data-lens-state'));
  const visible = [...document.querySelectorAll('.message:has(> .pm-lens-mark[data-lens-state="source"])')]
    .filter(e => e.getBoundingClientRect().height > 0).length;
  return { rehydrated: l.ops[0].rehydrated, states: states.filter(s => s === 'source').length, visible };
});
ok('Rehydrate restores the source messages and marks them `source`, not plain',
  rehydrated.rehydrated === true && rehydrated.states === 3 && rehydrated.visible === 3, rehydrated);

/* --- 9.6 the 25 cap, refused at 26, accumulating across operations ---- */
await lensReset();
await page.click('.pm-lens-trigger'); await page.waitForTimeout(250);
await page.click('.lens-mode-item[data-value="mute"]'); await page.waitForTimeout(250);
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
const capRun = await L(async () => {
  const tid = 'plain';
  const boxes = [...document.querySelectorAll('.pm-lens-check')];
  const out = { boxes: boxes.length };
  for (let i = 0; i < 25 && i < boxes.length; i++) { boxes[i].click(); await new Promise(r => setTimeout(r, 0)); }
  out.at25 = window.PM56_LENS.slice(tid).selection.length;
  /* the 26th must be REFUSED, not silently truncated and not accepted */
  const fresh = [...document.querySelectorAll('.pm-lens-check')];
  fresh[25] && fresh[25].click();
  await new Promise(r => setTimeout(r, 0));
  out.at26 = window.PM56_LENS.slice(tid).selection.length;
  out.shapedBeforeSeal = window.PM56_LENS.shapedCount(tid);
  return out;
});
ok('selection stops at the 25-message cap; the 26th is refused, not truncated',
  capRun.boxes >= 26 && capRun.at25 === 25 && capRun.at26 === 25, capRun);
const toastText = await L(() => [...document.querySelectorAll('.toast')].map(t => t.innerText).join(' | '));
ok('the refusal explains the cap is PER OPERATION and offers the way forward',
  /per operation/i.test(toastText) && /seal/i.test(toastText), { toastText });

await page.click('.pm-lens-trigger'); await page.waitForTimeout(250);
await page.click('[data-action="lens-seal"]'); await page.waitForTimeout(350);
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
const accum = await L(async () => {
  const tid = 'plain';
  const afterSeal = window.PM56_LENS.slice(tid);
  const fresh = [...document.querySelectorAll('.pm-lens-check')];
  /* the first unsealed box is now selectable again: the next operation */
  for (const b of fresh) { if (!b.classList.contains('is-locked')) { b.click(); break; } }
  await new Promise(r => setTimeout(r, 0));
  const l = window.PM56_LENS.slice(tid);
  return {
    opsAfterSeal: afterSeal.ops.length, selAfterSeal: afterSeal.selection.length,
    op1: afterSeal.ops[0] ? afterSeal.ops[0].ids.length : 0,
    selNow: l.selection.length, shaped: window.PM56_LENS.shapedCount(tid)
  };
});
ok('operations ACCUMULATE: op1 holds 25, and a 26th message shapes in a new operation',
  accum.opsAfterSeal === 1 && accum.op1 === 25 && accum.selAfterSeal === 0 &&
  accum.selNow === 1 && accum.shaped === 26, accum);

/* --- 9.7 effective assembly (ACD-194) --------------------------------- */
/* Deliberately NOT measured in the state section 9.6 leaves behind, where every
   turn is muted and the effective history is 0: "0 of 26" is the number a
   completely broken effectiveHistory() would also return. This builds a mixed
   state instead -- some muted, one focused, the rest untouched -- so each of
   the three clauses of ACD-194 has to hold independently for the numbers to
   come out right. */
const eff = await L(() => {
  const tid = 'plain';
  window.PM56_LENS.reset();
  const t = window.PM56_DATA.threads.find(x => x.id === tid);
  const ids = t.messages.filter(m => m.type === 'text').map(m => m.id);
  const canonical = ids.length;
  const base = window.PM56_LENS.effectiveHistory(tid).filter(x => x.kind === 'message').length;
  return { tid, ids, canonical, base };
});
const effMixed = await L(({ tid, ids }) => {
  /* three muted, one focused, via the real action path */
  const fire = (action, data) => {
    const b = document.createElement('button');
    Object.entries(data).forEach(([k, v]) => b.dataset[k] = v);
    window.PM56_EXT._actions[action](window.PM56_EXT.ctx(), b, null);
  };
  fire('lens-mode', { value: 'mute' });
  ids.slice(0, 3).forEach(id => fire('lens-toggle', { id }));
  fire('lens-seal', {});
  fire('lens-mode', { value: 'focus' });
  fire('lens-toggle', { id: ids[5] });
  const e = window.PM56_LENS.effectiveHistory(tid);
  return {
    effective: e.filter(x => x.kind === 'message').length,
    high: e.filter(x => x.priority === 'high').length,
    firstIsFocused: e[0] && e[0].id === ids[5],
    mutedStillInCanonical: window.PM56_DATA.threads.find(x => x.id === tid)
      .messages.filter(m => ids.slice(0, 3).includes(m.id)).length
  };
}, eff);
ok('effective assembly EXCLUDES muted, PROTECTS focused, and canonical history keeps both (ACD-194)',
  effMixed.effective === eff.base - 3 && effMixed.high === 1 &&
  effMixed.firstIsFocused && effMixed.mutedStillInCanonical === 3,
  { canonical: eff.canonical, base: eff.base, ...effMixed });

/* --- 9.8 Turn Off clears selection state ------------------------------ */
await page.click('.pm-lens-trigger'); await page.waitForTimeout(250);
await page.click('.lens-mode-item[data-value="off"]'); await page.waitForTimeout(400);
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
const off = await L(() => {
  const l = window.PM56_LENS.slice('plain');
  return {
    mode: l.mode, sel: l.selection.length, ops: l.ops.length,
    checks: document.querySelectorAll('.pm-lens-check').length,
    marks: document.querySelectorAll('.pm-lens-mark[data-lens-state]').length,
    cap: window.PM56_DEMO.getState().capabilities.context,
    hiddenSurfaces: [...document.querySelectorAll('.message .message-surface')]
      .filter(e => Number(getComputedStyle(e).opacity) < 0.9).length
  };
});
ok('Turn Off exits selection mode, clears selection state and restores every turn',
  off.mode === 'off' && off.sel === 0 && off.ops === 0 && off.checks === 0 &&
  off.marks === 0 && off.cap === 'Off' && off.hiddenSurfaces === 0, off);

/* --- 9.9 the affordance is stable across the 2s work tick ------------- */
await lensReset();
await page.click('.pm-lens-trigger'); await page.waitForTimeout(250);
await page.click('.lens-mode-item[data-value="mute"]'); await page.waitForTimeout(250);
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
/* NOT an attribute probe: pmSyncAttrs() removes any attribute absent from the
   freshly rendered source, so a `data-probe` marker is stripped on the very
   first patch and would report a remount that never happened. Identity is the
   only honest probe -- the SAME DOM node must still be the one in the tree. */
await L(() => { window.__w3probe = document.querySelector('.pm-lens-check'); return true; });
await page.waitForTimeout(4600);
const stable = await L(() => {
  const now = document.querySelector('.pm-lens-check');
  return {
    same: window.__w3probe === now,
    connected: !!window.__w3probe && window.__w3probe.isConnected,
    ticks: window.PM56_DEMO.getState().work.step
  };
});
ok('the gutter control survives 2+ work ticks — same DOM node, never remounted',
  stable.same && stable.connected, stable);

/* --- 9.10 overflow affordance ----------------------------------------- */
const overflow = await L(() => ({
  providers: window.PM56_MSG_OVERFLOW.count(),
  moreButtons: document.querySelectorAll('.pm-msg-more').length,
  panels: document.querySelectorAll('.pm-msg-overflow').length,
  /* the affordance must be absent, not empty, when nothing is registered */
  emptyBehaviour: (function () {
    const saved = window.PM56_MSG_OVERFLOW.itemsFor;
    window.PM56_MSG_OVERFLOW.itemsFor = function () { return []; };
    window.PM56_DEMO.selectThread(window.PM56_DEMO.getState().selectedThread);
    const n = document.querySelectorAll('.pm-msg-more').length;
    window.PM56_MSG_OVERFLOW.itemsFor = saved;
    window.PM56_DEMO.selectThread(window.PM56_DEMO.getState().selectedThread);
    return n;
  })()
}));
/* The More button lives in the hover-gated action row, so it is genuinely
   invisible until its message is hovered -- which is the item 8 behaviour under
   test elsewhere in this file. Hover the message first rather than forcing the
   click, so this check exercises the real path. */
await bringIntoView(page, '.message-assistant');
await page.hover('.message-assistant .message-body');
await page.waitForTimeout(300);
await page.click('.message-assistant .pm-msg-more');
await page.waitForTimeout(350);
/* Read the SAME button that was clicked. `document.querySelector('.pm-msg-more')`
   returns the first one in the document, which belongs to the first turn in the
   thread -- a user turn -- not the assistant turn under test. That mismatch
   reported aria-expanded="false" for a panel that had opened correctly, and the
   spread below then overwrote the before-count with the after-count so the
   detail hid it. Distinct key names, and a scoped read. */
const overflowOpen = await L(() => ({
  panelsAfter: document.querySelectorAll('.pm-msg-overflow').length,
  items: document.querySelectorAll('.pm-overflow-item').length,
  expandedAfter: document.querySelector('.message-assistant .pm-msg-more')?.getAttribute('aria-expanded')
}));
const ofRect = await rectOf(page, '.message-assistant .pm-msg-overflow');
const ofCrop = await crop(page, ofRect);
ok('the messageOverflow row renders a More button and opens a real panel',
  overflow.moreButtons > 0 && overflow.panels === 0 &&
  overflowOpen.panelsAfter === 1 && overflowOpen.items > 0 && overflowOpen.expandedAfter === 'true' &&
  ofCrop.distinct > 8, { ...overflow, ...overflowOpen, distinct: ofCrop.distinct });
ok('the overflow affordance is ABSENT, not empty, when no module registers an item',
  overflow.emptyBehaviour === 0, { withNoItems: overflow.emptyBehaviour });

/* --- 9.11 lens works across takes ------------------------------------- */
const lensTakes = [];
for (const take of TAKES) {
  await page.evaluate((t) => window.PM56_DEMO.setVariant(5, t), take);
  await page.waitForTimeout(250);
  const r = await page.evaluate(() => {
    const c = document.querySelector('.pm-lens-check');
    const rect = c ? c.getBoundingClientRect() : null;
    const hit = rect ? document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) : null;
    return {
      checks: document.querySelectorAll('.pm-lens-check').length,
      owns: !!hit && (hit === c || c.contains(hit)),
      hOverflow: document.body.scrollWidth - document.body.clientWidth
    };
  });
  lensTakes.push({ take, ...r });
}
ok(`the gutter control is present and hit-testable in takes ${TAKES.join('/')}`,
  lensTakes.every(r => r.checks > 0 && r.owns && r.hOverflow <= 0), lensTakes);
await page.evaluate(() => window.PM56_DEMO.setVariant(5, 0));

/* --- 9.12 all 8 themes ------------------------------------------------ */
const themes = await page.evaluate(() => window.PM56_DATA.themes.map(t => t.id));
const themeRows = [];
for (const th of themes) {
  await page.evaluate((t) => window.PM56_DEMO.setTheme(t), th);
  await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const chip = document.querySelector('.message-meta .meta-model');
    const chk = document.querySelector('.pm-lens-check');
    return {
      chipColor: chip ? getComputedStyle(chip).color : null,
      chkBorder: chk ? getComputedStyle(chk).borderColor : null,
      hOverflow: document.body.scrollWidth - document.body.clientWidth
    };
  });
  themeRows.push({ theme: th, ...r });
}
ok('meta chip and gutter control resolve real colours in all 8 themes, no overflow',
  themeRows.length === 8 && themeRows.every(r => r.chipColor && r.chkBorder && r.hOverflow <= 0),
  themeRows.map(r => r.theme + ':' + (r.hOverflow <= 0 ? 'ok' : 'OVERFLOW')));
await page.evaluate(() => window.PM56_DEMO.setTheme('basic-dark'));

/* --- reduced motion --------------------------------------------------- */
if (REDUCED) {
  const rm = await page.evaluate(() => {
    const c = document.querySelector('.pm-lens-check');
    const dot = document.querySelector('.meta-live-dot');
    return {
      checkAnim: c ? getComputedStyle(c).animationName : null,
      checkTrans: c ? getComputedStyle(c).transitionProperty : null,
      dotAnim: dot ? getComputedStyle(dot).animationName : 'none'
    };
  });
  ok('reduced motion: lens affordances have no running animation',
    rm.checkAnim === 'none' && rm.dotAnim === 'none', rm);
}

/* --- negative controls (prove each check CAN go red) ------------------ */
if (SELFTEST) {
  const neg = await page.evaluate(() => {
    const out = {};
    /* If the meta row were removed, the metaNodes check must fail. */
    document.querySelectorAll('.message-meta').forEach(e => e.remove());
    out.metaNodesAfterRemoval = document.querySelectorAll('.message .message-meta, .message [data-model]').length;
    return out;
  });
  ok('SELFTEST: metaNodes goes to 0 when the meta rows are removed (the check can go red)',
    neg.metaNodesAfterRemoval === 0, neg);
  await page.reload();
  await page.waitForSelector('.transcript .message');
  const neg2 = await page.evaluate(() => {
    window.PM56_LENS.reset();
    return { sel: window.PM56_LENS.slice('plain').selection.length, shaped: window.PM56_LENS.shapedCount('plain') };
  });
  ok('SELFTEST: with the store reset the selection checks read 0 (broken and unused are distinguishable)',
    neg2.sel === 0 && neg2.shaped === 0, neg2);
}

/* --- console cleanliness ---------------------------------------------- */
ok('zero console errors or warnings across the whole run', consoleIssues.length === 0,
  { count: consoleIssues.length, first: consoleIssues.slice(0, 5) });

await browser.close();

const pass = results.filter(r => r.pass).length;
const fail = results.length - pass;
console.log(`\n${pass} pass / ${fail} fail` + (REDUCED ? '  [prefers-reduced-motion]' : ''));
if (JSON_OUT) {
  fs.writeFileSync(JSON_OUT, JSON.stringify({
    at: new Date().toISOString(), reducedMotion: REDUCED, takes: TAKES,
    pass, fail, consoleIssues, results
  }, null, 1));
  console.log('wrote ' + JSON_OUT);
}
process.exit(fail ? 1 : 0);
