/* Regression checks for the Guided Tour's reset, resume and restore paths, driven by real CDP clicks and typing against
 * the built concept. node Concepts/onboarding/opus-5.5/tools/tour_reset.mjs [--page <path>]
 * --page <path> checks a private build instead of the built concept. Each check starts from a fresh load with the tour's
 * two stored records cleared, and prints "ok <name>" or "FAIL <name>: <detail>"; a summary line comes last, and the exit
 * code is 1 when any check failed. One browser serves the whole run and is closed in every case. */
import { launch, sleep } from './chrome.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const pageIdx = argv.indexOf('--page');
const PAGE = resolve(pageIdx >= 0 && argv[pageIdx + 1] ? argv[pageIdx + 1] : resolve(here, '../../../Onboarding concepts/TestOpus5.5PmConcept.html'));
const KEYS = ['pm.o55.tour.v1', 'pm.o55.tour-basis.v1'];
const url = (n) => `${pathToFileURL(PAGE).href}?o55=off&r=${n}`;
let loads = 0;

/* Page-side helpers: each one runs inside the page, so each is self-contained. */
/* The first visible element matching sel (inside a visible scope that holds scopeText, with exact text label when given),
   scrolled into view, with its centre and whether a click there lands on it rather than on something covering it. */
const aim = (sel, scope, scopeText, label) => {
  const roots = scope ? [...document.querySelectorAll(scope)].filter((s) => s.getClientRects().length > 0 && s.textContent.includes(scopeText)) : [document];
  const el = roots.flatMap((s) => [...s.querySelectorAll(sel)]).find((e) => e.getClientRects().length > 0 && (label == null || e.textContent.trim() === label));
  if (!el) return null;
  el.scrollIntoView({ block: 'center', inline: 'center' });
  const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y);
  return { x, y, hit: !!top && (top === el || el.contains(top)), over: top ? String(top.id || top.className || top.tagName).slice(0, 60) : 'outside the window' };
};
const shown = (sel) => [...document.querySelectorAll(sel)].some((e) => e.getClientRects().length > 0);
const dialog = (text, up) => [...document.querySelectorAll('[role=dialog]')].some((d) => d.getClientRects().length > 0 && d.textContent.includes(text)) === up;
/* A disabled row may carry only aria-disabled: the hover hint moves its disabled flag aside so it can still be hovered. */
const rowState = (action) => { const b = document.querySelector(`.home-panel .setup-row[data-action="${action}"]`); return b ? { off: b.disabled || b.getAttribute('aria-disabled') === 'true', text: b.textContent.replace(/\s+/g, ' ').trim() } : null; };
const clearKeys = (keys) => keys.forEach((k) => localStorage.removeItem(k));
const recoveryShown = () => !!document.getElementById('o55-tour-recovery');

const { page, close } = await launch({ width: 1600, height: 1000 });
const ev = (f, ...a) => page.evaluate(f, ...a);
const assert = (ok, detail) => { if (!ok) throw new Error(detail); };
const eq = (got, want, what) => assert(JSON.stringify(got) === JSON.stringify(want), `${what} is ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

/* Poll a page-side predicate until it is truthy (its value is returned), or fail after ms. */
async function until(fn, ms, what, ...args) {
  const t0 = Date.now();
  for (;;) {
    const v = await ev(fn, ...args);
    if (v) return v;
    if (Date.now() - t0 > ms) throw new Error(`timed out waiting for ${what}`);
    await sleep(150);
  }
}
/* A real mouse click at the centre of what aim() finds, once it has stopped moving and nothing covers it. */
async function click(what, ...args) {
  const t0 = Date.now(); let prev = null, box = null;
  while (Date.now() - t0 < 10000) {
    box = await ev(aim, ...args);
    if (box && box.hit && prev && Math.abs(box.x - prev.x) < 1 && Math.abs(box.y - prev.y) < 1) { await page.mouse(box.x, box.y); return; }
    prev = box; await sleep(120);
  }
  throw new Error(`cannot click ${what}${box ? ` (covered by ${box.over})` : ' (not on screen)'}`);
}
/* A new load of the concept, keeping whatever is stored. */
async function load() {
  await page.goto(url(++loads));
  await until(() => !!(window.O55 && window.O55.tour && document.querySelector('[data-page="settings"]')), 30000, 'the concept to load');
  await sleep(2000);
}
/* A fresh load, with the tour's two stored records cleared first (the page being left is on the same file origin). */
async function fresh() { await ev(clearKeys, KEYS); await load(); }
/* The Settings tab, then a moment for its landing to draw: the landing redraws itself just after it opens, which would
   undo a click or a keystroke made before that. */
async function openSettings() {
  await click('the Settings tab', '[data-page="settings"]');
  await sleep(700);
}
/* Settings, then its Home, where the Essential setup rows (the tour's among them) are drawn. Home is clicked again until
   its rows show. */
async function openSettingsHome() {
  await openSettings();
  for (let tries = 0; tries < 4; tries++) {
    await click('Settings Home', '#panel-settings [data-action="home"]');
    if (await until(shown, 1500, 'the rows', '.home-panel .setup-row[data-action="resume-guided-tour"]').then(() => true, () => false)) return;
    await sleep(700);
  }
  throw new Error('the Essential setup rows did not open from Settings Home');
}
/* A tour started fresh, taken to its fourth step (send_question) and saved there. */
async function tourOnFourthStep() {
  await fresh();
  await ev(() => window.O55.tour.start({ fresh: true }));
  await sleep(3500);
  await ev(() => window.O55.tour.go(window.O55.tour.defs[3].id));
  await sleep(2500);
}

/* The checks, in the order they run. */
const CHECKS = {
  async restore_home_layout_search() {
    await fresh();
    await openSettings();
    await click('the visible Search settings field', 'input[placeholder^="Search settings"]');
    await page.send('Input.insertText', { text: 'restore home layout' });
    await click('the Restore home layout result', 'mark', '.search-result', 'Restore home layout');
    await until(dialog, 8000, 'the Reset the Home layout? dialog', 'Reset the Home layout?', true);
    assert(await ev(() => !!(document.getElementById('setting-general.startup.reset-home-layout') || document.querySelector('[data-setting-id="general.startup.reset-home-layout"]'))), 'no general.startup.reset-home-layout element on the page');
    await click('Cancel in the dialog', 'button', '[role=dialog]', 'Reset the Home layout?', 'Cancel');
    await until(dialog, 5000, 'the dialog to close', 'Reset the Home layout?', false);
  },
  async settings_home_rows() {
    await fresh();
    await openSettingsHome();
    const actions = await ev(() => [...document.querySelectorAll('.home-panel .setup-row')].map((b) => b.dataset.action));
    for (const a of ['replay-onboarding', 'resume-guided-tour', 'restart-guided-tour']) assert(actions.includes(a), `no ${a} row (rows: ${actions.join(', ')})`);
    const resume = await ev(rowState, 'resume-guided-tour');
    assert(resume && resume.off, 'the resume-guided-tour row is enabled with no tour saved');
  },
  async resume_after_reload() {
    await tourOnFourthStep();
    const step = await ev(() => window.O55.tour.state().step);
    assert(step, 'the tour has no step after go()');
    await load();
    const r = await ev(() => window.O55.tour.resumable());
    assert(r && r.running === false && r.step === 4, `resumable() is ${JSON.stringify(r)}, want running false at step 4`);
    await openSettingsHome();
    const row = await ev(rowState, 'resume-guided-tour');
    assert(row && !row.off, 'the resume-guided-tour row is disabled after reload');
    assert(row.text.includes('step 4 of'), `the resume row reads "${row.text}", want "step 4 of"`);
    await click('the resume-guided-tour row', '.home-panel .setup-row[data-action="resume-guided-tour"]');
    await until((id) => { const s = window.O55.tour.state(); return s.running && s.step === id; }, 15000, `the resumed tour at ${step}`, step);
    assert(!(await ev(recoveryShown)), 'the recovery panel is shown after resume');
  },
  async run_onboarding_again_after_reload() {
    await tourOnFourthStep();
    await load();
    await openSettingsHome();
    await click('Run Onboarding Again', '.home-panel .setup-row[data-action="replay-onboarding"]');
    await until(() => !!(window.O55.S && window.O55.S.open === true), 15000, 'the onboarding window to open');
    await until((keys) => keys.every((k) => localStorage.getItem(k) === null), 5000, 'the tour records to clear', KEYS).catch(() => {});
    const left = await ev((keys) => keys.filter((k) => localStorage.getItem(k) !== null), KEYS);
    const recovery = await ev(recoveryShown);
    await ev(() => window.O55.ui.close('close'));
    assert(!recovery, 'the recovery panel is shown after Run Onboarding Again');
    assert(!left.length, `still stored after Run Onboarding Again: ${left.join(', ')}`);
  },
  async legacy_record_start_over() {
    await fresh();
    await ev((v) => localStorage.setItem('pm.o55.tour.v1', v), JSON.stringify({ v: 2, status: 'resume-unavailable', index: 4, done: [], snapshot_ref: 'gone' }));
    await load();
    await openSettingsHome();
    await click('Start the Guided Tour over', '.home-panel .setup-row[data-action="restart-guided-tour"]');
    const first = await ev(() => window.O55.tour.defs[0].id);
    await until((id) => { const s = window.O55.tour.state(); return s.running && s.step === id; }, 15000, `the tour at its first step ${first}`, first);
    assert(!(await ev(recoveryShown)), 'the recovery panel is shown after Start over');
  },
  async skip_from_settings_restores() {
    await fresh();
    await openSettingsHome();
    await click('Start the Guided Tour over', '.home-panel .setup-row[data-action="restart-guided-tour"]');
    await until(() => window.O55.tour.running === true, 15000, 'the tour to start');
    await sleep(4000);
    const result = await ev(() => window.O55.tour.skip());
    assert(!(await ev(() => window.O55.tour.running)), `the tour is still running after skip() (${JSON.stringify(result)})`);
    assert(!(await ev(recoveryShown)), 'the recovery panel is shown after skip');
    const rec = await ev(() => JSON.parse(localStorage.getItem('pm.o55.tour.v1') || 'null'));
    eq(rec && rec.restored && rec.restored.chat && rec.restored.chat.status, 'restored', 'the saved restored.chat.status');
  },
  async no_page_errors() {
    assert(page.errors.length === 0, page.errors.slice(0, 3).join(' | '));
  }
};

/* One browser for the whole run. The stored records are cleared before the first check reads them. */
const failed = [];
let passed = 0;
try {
  await page.goto(url(0));
  await ev(clearKeys, KEYS);
  for (const [name, check] of Object.entries(CHECKS)) {
    try { await check(); passed++; console.log(`ok ${name}`); }
    catch (e) { failed.push(name); console.log(`FAIL ${name}: ${String(e && e.message || e).replace(/\s+/g, ' ').slice(0, 400)}`); }
  }
} finally { await close(); }
console.log(`summary: ${passed} passed, ${failed.length} failed${failed.length ? ` (${failed.join(', ')})` : ''}`);
process.exitCode = failed.length ? 1 : 0;
