/* tests/lens-independent.mjs — item 9 (Context Lens), SECOND harness.
 *
 * `tests/transcript-verify.mjs` is the implementer's. This file is deliberately
 * a DIFFERENT instrument, not a second run of the same one:
 *
 *   - it never trusts one reading. Every claim is cross-checked between THREE
 *     independent views that must agree — the module's own store
 *     (`PM56_LENS.slice`), the rendered DOM (`.pm-lens-mark[data-lens-state]` /
 *     `[data-lens-sel]`), and the computed projection (`effectiveHistory`).
 *     A count that agrees with itself proves nothing; three readings that agree
 *     on the same SET of message ids is a much harder thing to fake.
 *   - the cap is tested by trying to EXCEED it and requiring a refusal, not by
 *     counting to 25 and stopping.
 *   - "nothing selected" and "selection is broken" render identically, so every
 *     state claim is asserted as a TRANSITION with a positive control: the marks
 *     are proven present before Turn Off is asked to remove them.
 *   - `--selftest` runs negative controls that make each of those checks go red
 *     on purpose, and reports the numbers they produced.
 *
 * Run: node tests/lens-independent.mjs [--html FILE] [--json OUT] [--selftest]
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch (e) { ({ chromium } = await import('playwright-core')); }

const argv = process.argv.slice(2);
const arg = k => { const i = argv.indexOf(k); return i > -1 ? argv[i + 1] : null; };
const here = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const HTML = path.resolve(arg('--html') || path.join(here, '..', 'index.html'));
const JSON_OUT = arg('--json');
const SELFTEST = argv.includes('--selftest');

const results = [];
const ok = (label, pass, detail) => { results.push({ label, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail !== undefined ? '  ' + JSON.stringify(detail) : ''}`); };

const browser = await chromium.launch({ headless: true,
  args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const consoleErrors = [], pageErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e)));
await page.goto(pathToFileURL(HTML).href, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO, { timeout: 15000 });

/* --------------------------------------------------------------- readings */
/* THREE independent views of "which messages are shaped". They are gathered
   separately and compared as SETS, never as counts. */
const read = () => page.evaluate(() => {
  const tid = PM56_DEMO.getState().selectedThread;
  const L = window.PM56_LENS;
  const model = L ? L.slice(tid) : null;
  const modelShaped = model ? [...new Set(model.ops.flatMap(o => o.ids))].sort() : [];
  const dom = { sel: [], shaped: [], checks: 0, marks: 0 };
  document.querySelectorAll('article.message').forEach(a => {
    const id = a.getAttribute('data-id') || a.dataset.id ||
               (a.querySelector('[data-action="lens-toggle"]') || {}).dataset?.id;
    const mark = a.querySelector('.pm-lens-mark');
    if (mark) {
      dom.marks++;
      if (mark.getAttribute('data-lens-sel') === '1' && id) dom.sel.push(id);
      if (mark.getAttribute('data-lens-state') && id) dom.shaped.push(id);
    }
  });
  dom.checks = document.querySelectorAll('[data-action="lens-toggle"]').length;
  dom.sel.sort(); dom.shaped.sort();
  let effective = null, canonical = null, nonText = null;
  try {
    const eff = L.effectiveHistory(tid);
    effective = Array.isArray(eff) ? eff.length : (eff && eff.items ? eff.items.length : null);
    const t = PM56_DEMO.getState().threads.find(x => x.id === tid);
    canonical = t ? t.messages.filter(m => m.type === 'text').length : null;
    /* effectiveHistory emits a `system` entry for every NON-text message, and
       every lens receipt appends one to the thread -- so `effective` is not
       comparable to the text count alone. Measuring the wrong denominator here
       produced three false "REFUTED" verdicts on the first run of this file;
       the module was right and the harness was wrong. */
    nonText = t ? t.messages.filter(m => m.type !== 'text').length : null;
  } catch (e) { effective = 'threw: ' + e.message; }
  return { tid, model: model && { mode: model.mode, selection: model.selection.slice().sort(), ops: model.ops.map(o => o.ids.length) },
           modelShaped, dom, effective, canonical, nonText,
           cap: PM56_DEMO.getState().capabilities.context,
           shapedCount: L ? L.shapedCount(tid) : null, remaining: L ? L.remaining(tid) : null };
});
const sameSet = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const clickAll = async sel => { await page.evaluate(s => document.querySelector(s)?.click(), sel); await page.waitForTimeout(60); };
async function openLensMenu() {
  await page.evaluate(() => document.querySelector('[data-action="lens-open"]')?.click());
  await page.waitForTimeout(220);
}
async function setMode(mode) {
  await openLensMenu();
  await page.evaluate(m => document.querySelector(`[data-action="lens-mode"][data-value="${m}"]`)?.click(), mode);
  await page.waitForTimeout(220);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(180);
}

/* ------------------------------------------------------------------- setup */
await page.evaluate(() => { PM56_DEMO.selectThread('plain'); });
await page.waitForTimeout(300);
const api = await page.evaluate(() => !!window.PM56_LENS && window.PM56_LENS.MAX_PER_OP);
ok('the Context Lens module is loaded and publishes its cap', api === 25, { MAX_PER_OP: api });
const baseline = await read();
ok('a 26-message thread is available, so the 25-cap can actually be exceeded',
   baseline.canonical === 26, { canonical: baseline.canonical, tid: baseline.tid });
ok('at rest nothing is shaped and no gutter control exists (the OFF state is real)',
   baseline.modelShaped.length === 0 && baseline.dom.sel.length === 0 && baseline.dom.checks === 0,
   { model: baseline.model, dom: baseline.dom });

/* ------------------------------------------------- entering selection mode */
await setMode('mute');
const inMute = await read();
ok('Mute puts every text turn under a gutter control (transition from 0)',
   inMute.dom.checks === 26 && baseline.dom.checks === 0,
   { before: baseline.dom.checks, after: inMute.dom.checks });
ok('entering Mute writes the canonical capability label, not "Auto"',
   inMute.cap === 'Mute', { cap: inMute.cap });

/* ------------------------------------------------- the cap, tested upwards */
/* Toggle 25 turns one at a time and require the module store and the DOM to
   agree on the SET after every single click — a count check would pass even if
   the module and the render disagreed about WHICH message was selected. */
const ids = await page.evaluate(() =>
  [...document.querySelectorAll('[data-action="lens-toggle"]')].map(b => b.dataset.id));
let divergences = [], growth = [];
for (let i = 0; i < 25; i++) {
  await page.evaluate(id => document.querySelector(`[data-action="lens-toggle"][data-id="${id}"]`)?.click(), ids[i]);
  await page.waitForTimeout(35);
  const r = await read();
  growth.push(r.model.selection.length);
  if (!sameSet(r.model.selection, r.dom.sel)) divergences.push({ step: i + 1, model: r.model.selection.length, dom: r.dom.sel.length });
}
const at25 = await read();
ok('selection grows one at a time to exactly 25',
   growth.length === 25 && growth.every((n, i) => n === i + 1), { growth: growth.slice(0, 3).concat(['…'], growth.slice(-3)) });
ok('the module store and the rendered DOM agree on the SET of selected ids at every step',
   divergences.length === 0, { divergences });
ok('remaining() reaches zero exactly at the cap', at25.remaining === 0, { remaining: at25.remaining, sel: at25.model.selection.length });

/* the 26th, BEFORE sealing: must be refused, not silently truncated */
const before26 = at25.model.selection.length;
await page.evaluate(id => document.querySelector(`[data-action="lens-toggle"][data-id="${id}"]`)?.click(), ids[25]);
await page.waitForTimeout(200);
const refused = await read();
const toastText = await page.evaluate(() => [...document.querySelectorAll('.toast')].map(t => t.textContent).join(' | '));
ok('a 26th selection in ONE operation is REFUSED, not truncated: the set is unchanged',
   refused.model.selection.length === before26 && !refused.model.selection.includes(ids[25]),
   { before: before26, after: refused.model.selection.length, twentySixthSelected: refused.model.selection.includes(ids[25]) });
ok('the refusal is announced rather than silent', /cap|25|operation/i.test(toastText), { toastText: toastText.slice(0, 200) });

/* ------------------------------------------ seal, then the 26th accumulates */
await openLensMenu();
await page.evaluate(() => document.querySelector('[data-action="lens-seal"]')?.click());
await page.waitForTimeout(260);
await page.keyboard.press('Escape'); await page.waitForTimeout(160);
const sealed = await read();
ok('sealing moves all 25 into ONE operation and empties the live selection',
   sealed.model.ops.length === 1 && sealed.model.ops[0] === 25 && sealed.model.selection.length === 0,
   { ops: sealed.model.ops, selection: sealed.model.selection.length });
ok('the 25 sealed ids are exactly the 25 that were selected',
   sameSet(sealed.modelShaped, at25.model.selection),
   { sealed: sealed.modelShaped.length, selected: at25.model.selection.length });
ok('the DOM marks the 25 sealed turns as shaped (model and render agree on the set)',
   sameSet(sealed.modelShaped, sealed.dom.shaped),
   { model: sealed.modelShaped.length, dom: sealed.dom.shaped.length });

await page.evaluate(id => document.querySelector(`[data-action="lens-toggle"][data-id="${id}"]`)?.click(), ids[25]);
await page.waitForTimeout(220);
const acc = await read();
ok('THE CAP IS PER OPERATION: a 26th message shapes in a second operation, 26 shaped in total',
   acc.shapedCount === 26 && acc.model.selection.length === 1 && acc.model.selection[0] === ids[25],
   { shaped: acc.shapedCount, sel: acc.model.selection.length, ops: acc.model.ops });
ok('the 26 shaped turns are 25 sealed + the 1 live one, with no id counted twice',
   new Set(sealed.modelShaped.concat(acc.model.selection)).size === 26,
   { union: new Set(sealed.modelShaped.concat(acc.model.selection)).size });

/* the projection is the third, independent reading */
ok('effectiveHistory drops exactly the muted turns (a computed reading, not a rendered one)',
   acc.effective === acc.canonical - 26 + acc.nonText,
   { canonical: acc.canonical, nonText: acc.nonText, effective: acc.effective, expected: acc.canonical - 26 + acc.nonText });
ok('canonical history is NOT altered by any of this (26 messages still exist)',
   acc.canonical === 26, { canonical: acc.canonical });

/* --------------------------------------------------------------- Turn Off */
/* Positive control first: prove the marks are there, so "0 after" means
   "removed", not "was never drawn". */
/* Every one of the 26 turns is muted at this point, so there is no unmuted turn
   left in this thread to compare against. The reference opacity is taken from a
   thread the lens has never touched. */
const unmutedRef = await page.evaluate(() => {
  const tid = PM56_DEMO.getState().selectedThread;
  PM56_DEMO.selectThread('debug');
  const v = getComputedStyle(document.querySelector('article.message .message-surface')).opacity;
  PM56_DEMO.selectThread(tid);
  return v;
});
await page.waitForTimeout(300);
ok('POSITIVE CONTROL for Turn Off: shaped marks are painted before it is asked to clear them',
   acc.dom.shaped.length >= 25 && acc.dom.checks === 26,
   { markedBefore: acc.dom.shaped.length, checksBefore: acc.dom.checks });
/* Bring the target into view with Playwright's own scroller and let layout
   settle. An in-page `scrollIntoView()` read in the same frame reported the
   button at y = -3023 and every hit-test as null -- a harness bug that looks
   exactly like "the control is not there". */
await page.evaluate(v => { window.__unmutedRef = v; }, unmutedRef);
/* `.pm-lens-mark` is an inert zero-size <i> (it exists so lens.css can reach the
   <article> through :has()), so Playwright calls it invisible and refuses to
   scroll it. Scroll the article that carries it. */
await page.locator('article.message:has(.pm-lens-mark[data-lens-state="muted"])').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const paintedBefore = await page.evaluate(() => {
  /* lens.css de-emphasises `> .message-surface`, not the <article>; reading the
     article's opacity reports 1 while the turn is visibly dimmed. And the gutter
     control is ABSOLUTELY POSITIONED outside the article's own box, so it has to
     be hit-tested at its own centre, not at the article's corner. */
  const el = document.querySelector('.pm-lens-mark[data-lens-state="muted"]');
  if (!el) return null;
  const a = el.closest('article.message');
  const surface = a.querySelector('.message-surface');
  const btn = a.querySelector('[data-action="lens-toggle"]');
  let owns = null;
  if (btn) { const b = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2));
    owns = !!(hit && (hit === btn || btn.contains(hit))); }
  const plain = [...document.querySelectorAll('article.message')]
    .find(x => !x.querySelector('.pm-lens-mark[data-lens-state]'));
  return { mutedOpacity: getComputedStyle(surface).opacity,
           unmutedOpacity: plain ? getComputedStyle(plain.querySelector('.message-surface')).opacity : window.__unmutedRef,
           gutterOwnsItsPixel: owns };
});
ok('a muted turn is visibly de-emphasised relative to an unmuted one, and the gutter control owns its own pixel',
   paintedBefore && Number(paintedBefore.mutedOpacity) < 1 &&
   Number(paintedBefore.mutedOpacity) < Number(paintedBefore.unmutedOpacity ?? 1) &&
   paintedBefore.gutterOwnsItsPixel === true, paintedBefore);

await setMode('off');
const off = await read();
const receipts = await page.evaluate(() =>
  [...document.querySelectorAll('.event-card, .receipt, .toast')].map(e => e.textContent).join(' | ').slice(0, 400));
ok('Turn Off clears the operations, the selection AND the gutter controls',
   off.model.ops.length === 0 && off.model.selection.length === 0 &&
   off.dom.checks === 0 && off.dom.shaped.length === 0,
   { ops: off.model.ops.length, sel: off.model.selection.length, checks: off.dom.checks, shaped: off.dom.shaped.length });
ok('Turn Off restores the full effective history — the 26 turns come back',
   off.effective === off.canonical + off.nonText,
   { effective: off.effective, canonical: off.canonical, nonText: off.nonText });
ok('Turn Off writes the canonical Off capability', off.cap === 'Off', { cap: off.cap });
ok('Turn Off announces what it released (a receipt, not a silent clear)',
   /released|restored|off/i.test(receipts), { receipts: receipts.slice(0, 220) });
ok('Turn Off did not delete anything: the thread still has all 26 messages',
   off.canonical === 26, { canonical: off.canonical });

/* --------------------------------------------------- Focus, briefly, twice */
await setMode('focus');
await page.evaluate(() => {
  const b = document.querySelectorAll('[data-action="lens-toggle"]');
  for (let i = 0; i < 3; i++) b[i] && b[i].click();
});
await page.waitForTimeout(220);
const foc = await read();
ok('Focus applies immediately on toggle (no Apply step) and is a DIFFERENT state from Mute',
   foc.model.selection.length === 3 && foc.model.mode === 'focus',
   { mode: foc.model.mode, sel: foc.model.selection.length });
ok('Focus PROTECTS rather than removes: effective history keeps every turn',
   foc.effective === foc.canonical + foc.nonText,
   { effective: foc.effective, canonical: foc.canonical, nonText: foc.nonText });
await setMode('off');

/* --------------------------------------------- Subcompact needs an Apply */
await setMode('subcompact');
await page.evaluate(() => {
  const b = document.querySelectorAll('[data-action="lens-toggle"]');
  for (let i = 0; i < 4; i++) b[i] && b[i].click();
});
await page.waitForTimeout(200);
const preApply = await read();
ok('Subcompact does NOT apply on toggle — the selection is held, nothing is shaped yet',
   preApply.model.selection.length === 4 && preApply.model.ops.length === 0,
   { sel: preApply.model.selection.length, ops: preApply.model.ops.length });
await openLensMenu();
await page.evaluate(() => document.querySelector('[data-action="lens-apply"]')?.click());
await page.waitForTimeout(300);
await page.keyboard.press('Escape'); await page.waitForTimeout(160);
const applied = await read();
ok('Subcompact applies only on the explicit Apply, and then it IS an operation',
   applied.model.ops.length === 1 && applied.model.ops[0] === 4 && applied.model.selection.length === 0,
   { ops: applied.model.ops, sel: applied.model.selection.length });
const rehyd = await page.evaluate(() => document.querySelectorAll('[data-action="lens-rehydrate"]').length);
ok('a subcompacted region carries a rehydration handle', rehyd > 0, { rehydrateButtons: rehyd });
await setMode('off');

/* ----------------------------------------------------- negative controls */
/* ------------------------------------------------ lens strip transcript pad */
await page.evaluate(() => { window.PM56_LENS.reset(); PM56_DEMO.selectThread('plain'); });
await page.waitForTimeout(200);
const stripPad = await page.evaluate(async () => {
  const stage = document.querySelector('.chat-stage');
  const read = () => {
    const strip = document.querySelector('.overlay-menu.lens-strip');
    const pad = parseFloat(getComputedStyle(document.querySelector('.transcript')).paddingTop) || 0;
    const varH = parseFloat(getComputedStyle(stage).getPropertyValue('--lens-strip-h')) || 0;
    return { stripH: strip ? strip.offsetHeight : 0, pad, varH };
  };
  document.querySelector('[data-action="lens-open"]')?.click();
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const open1 = read();
  document.querySelector('[data-action="lens-open"]')?.click();
  await new Promise(r => setTimeout(r, 120));
  document.querySelector('[data-action="lens-open"]')?.click();
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const reopen = read();
  return { open1, reopen };
});
ok('opening the lens strip sets transcript padding from layout height',
  stripPad.open1.stripH > 40 && stripPad.open1.varH >= stripPad.open1.stripH,
  stripPad.open1);
ok('reopening the lens strip restores transcript padding',
  stripPad.reopen.stripH > 40 && stripPad.reopen.varH >= stripPad.reopen.stripH,
  stripPad.reopen);

await page.evaluate(() => { window.PM56_LENS.reset(); PM56_DEMO.selectThread('plain'); });
await page.waitForTimeout(200);
await page.evaluate(() => {
  const btn = document.querySelector('.message-assistant [data-action="message-overflow"]');
  if (btn) btn.click();
});
await page.waitForTimeout(200);
await page.evaluate(() => document.querySelector('[data-action="lens-start-mute"]')?.click());
await page.waitForTimeout(300);
const overflowOpens = await page.evaluate(() => ({
  strip: !!document.querySelector('.overlay-menu.lens-strip'),
  varH: parseFloat(getComputedStyle(document.querySelector('.chat-stage')).getPropertyValue('--lens-strip-h')) || 0
}));
ok('overflow Mute in Context Lens opens the horizontal strip and pads the transcript',
  overflowOpens.strip && overflowOpens.varH > 0, overflowOpens);

if (SELFTEST) {
  /* Each of these makes a check above go red on purpose, and prints the number
     it produced, so nobody has to take "it can fail" on trust. */
  const nc = {};
  await setMode('mute');
  await page.evaluate(() => { const b = document.querySelectorAll('[data-action="lens-toggle"]');
    for (let i = 0; i < 5; i++) b[i] && b[i].click(); });
  await page.waitForTimeout(200);
  const five = await read();
  nc.withFive = { sel: five.model.selection.length, domSel: five.dom.sel.length,
                  effective: five.effective, canonical: five.canonical, nonText: five.nonText };
  ok('SELFTEST: with 5 muted, the same reads report 5 and the projection drops 5 — not a constant',
     five.model.selection.length === 5 && five.effective === five.canonical - 5 + five.nonText, nc.withFive);

  // break the DOM/model agreement on purpose: the set comparison must notice
  await page.evaluate(() => { const m = document.querySelector('.pm-lens-mark[data-lens-sel="1"]');
    if (m) m.removeAttribute('data-lens-sel'); });
  const broken = await read();
  nc.tamper = { model: broken.model.selection.length, dom: broken.dom.sel.length,
                agrees: broken.model.selection.length === broken.dom.sel.length };
  ok('SELFTEST: the model-vs-DOM set comparison GOES RED when one mark is removed',
     !sameSet(broken.model.selection, broken.dom.sel), nc.tamper);

  // and reset makes every reading zero, so a zero is reachable
  await page.evaluate(() => { window.PM56_LENS.reset(); PM56_DEMO.selectThread('plain'); });
  await page.waitForTimeout(250);
  const cleared = await read();
  nc.afterReset = { shaped: cleared.shapedCount, sel: cleared.model.selection.length, dom: cleared.dom.shaped.length };
  ok('SELFTEST: after PM56_LENS.reset() every reading is 0 — "broken" and "unused" are distinguishable',
     cleared.shapedCount === 0 && cleared.dom.shaped.length === 0, nc.afterReset);
}

ok('zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 4));
ok('zero page errors', pageErrors.length === 0, pageErrors.slice(0, 4));

await browser.close();
const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length} pass / ${failed.length} fail`);
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ html: HTML, results, consoleErrors, pageErrors }, null, 1));
process.exit(failed.length ? 1 : 0);
