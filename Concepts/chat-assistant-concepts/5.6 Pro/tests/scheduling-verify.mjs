/* scheduling-verify.mjs — Scheduling, execution windows, and quota resume,
 * concept side.
 *
 * Drives the real controls in a real browser and asserts the resulting
 * STATE. It does not grep the bundle for strings.
 *
 * Covers packet 01_IMPLEMENTATION_SPEC.md §15 and
 * Plans/Scheduling_and_Quota_Resume.md, against scheduling.js
 * (`window.PM56_SCHED`, `RT.scheduling`) and the quota-wait strip owned by
 * composer-state.js (`RT.quota`, consumed here, not re-implemented).
 *
 * FORMERLY-KNOWN HARNESS HAZARD, NOW FIXED (see attachments-composer-verify.mjs
 * for the full writeup and its regression guard): sending/appending a message
 * to a thread whose SENT user-message count became an exact multiple of 6
 * used to make assistant-features.js's automatic-memory commit hook re-enter
 * composer-state.js's reconcile()/commitBuffer() forever (RangeError: Maximum
 * call stack size exceeded), hanging or crashing the tab — and
 * `ctx.appendMessage`, which scheduling.js's dispatch path calls directly,
 * was just as exposed as the composer's own Send button. Fixed with a
 * re-entrancy guard in composer-state.js. This file still picks thread
 * targets whose fixture baseline keeps every dispatch this run performs away
 * from a multiple of 6 (see the assertion right before the idempotency
 * section) — a deliberate, cheap safety margin, not a workaround for an open
 * defect.
 *
 *   node tests/scheduling-verify.mjs            # against index.html
 *   node tests/scheduling-verify.mjs --file <html> --json
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
function argVal(flag) { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : ''; }
const fileArg = argVal('--file');
const TARGET = fileArg
  ? (fileArg.startsWith('file:') ? fileArg : 'file://' + resolve(fileArg))
  : 'file://' + resolve(ROOT, 'index.html');
const JSON_OUT = process.argv.includes('--json');

const results = [];
let page, browser;
const consoleErrors = [];

function check(name, pass, detail) {
  const d = detail === undefined ? '' : String(detail).replace(/\s*\n\s*/g, ' | ');
  results.push({ name, pass: !!pass, detail: d });
  if (!JSON_OUT) console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${d ? '  — ' + d : ''}`);
}
const ev = (fn, arg) => page.evaluate(fn, arg);
function sel(action, extra) {
  let s = `[data-action="${action}"]`;
  if (extra) for (const k in extra) s += `[data-${k}="${extra[k]}"]`;
  return s;
}
async function click(selector) {
  /* Some markup (e.g. the header's responsive-fallback new-thread button)
     legitimately renders MORE THAN ONE element for the same data-action, only
     one of which is actually visible at this viewport. page.$() would return
     whichever is FIRST in DOM order even if it is the hidden one, and a
     force:true click on a genuinely zero-size element silently no-ops. Pick
     the first VISIBLE match; fall back to the first match if none report
     visible (still better than throwing). */
  const handles = await page.$$(selector);
  let el = null;
  for (const h of handles) {
    if (await h.isVisible().catch(() => false)) { el = h; break; }
  }
  if (!el) el = handles[0] || null;
  if (!el) return false;
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await el.click({ force: true, timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(160);
  return true;
}
/* `data-action="open-menu"` toggles — clicking it while the wand menu is
   already open would close it. Every wand-only control needs the menu open
   first, so check state rather than blindly click-toggling. */
async function ensureWandOpen() {
  const already = await ev(() => (window.PM56_EXT.ctx().state.menu || {}).type === 'wand');
  if (!already) { await click(sel('open-menu', { menu: 'wand' })); await page.waitForTimeout(220); }
  /* Re-baselined 2026-09-27 (SCHED, spec 10.2 G-23): the wand rows sit in
     collapsible groups, so the Scheduling group is opened before its rows
     are clicked. */
  if (!(await page.$('.overlay-menu [data-action="sched-open-manage"]'))) {
    await click(sel('polish-wand-group', { group: 'schedule' }));
    await page.waitForTimeout(220);
  }
}
/* Registered-only handlers (demo and test controls with no visible button in
   the redesigned sheets, 00-BRIEF B.12) are reached the way the Demo Studio
   reaches them (repair-demos.js invoke): through the real action registry. */
async function runAction(action, data) {
  return ev(([a, d]) => { const b = document.createElement('button'); Object.assign(b.dataset, d || {}); return window.PM56_EXT.run(a, b, new Event('click')); }, [action, data || {}]);
}

async function main() {
  browser = await chromium.launch({
    executablePath: process.env.PW_EXE || undefined,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));
  page.on('crash', () => console.error('*** RENDERER CRASHED ***'));
  await page.goto(TARGET, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(1200);

  /* ================================================================
     0. the module is live
     ================================================================ */
  const api = await ev(() => ({
    sched: typeof window.PM56_SCHED,
    collisions: (window.PM56_EXT.collisions || []).length
  }));
  check('scheduling.js registered PM56_SCHED', api.sched === 'object', api.sched);
  check('no undeclared action collisions', api.collisions === 0, String(api.collisions));

  /* ================================================================
     1. Schedule Message is in the WAND menu — not in the mode menu, and not
        in the composer tools row (Plans/Scheduling_and_Quota_Resume.md §3)
     ================================================================ */
  await click(sel('open-menu', { menu: 'wand' }));
  await page.waitForTimeout(220);
  /* Wand rows live under collapsible groups; expand Scheduling if needed. */
  if (!(await page.$('[data-action="sched-open-message"]'))) {
    await click(sel('polish-wand-group', { group: 'schedule' }));
    await page.waitForTimeout(220);
  }
  const wandHasSchedule = await ev(() => {
    const m = document.querySelector('.overlay-menu');
    return m ? /Schedule Message/.test(m.textContent) && !!m.querySelector('[data-action="sched-open-message"]') : false;
  });
  check('"Schedule Message" is a real row in the wand menu', wandHasSchedule);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  await click(sel('open-menu', { menu: 'mode' }));
  await page.waitForTimeout(220);
  const modeHasSchedule = await ev(() => {
    const m = document.querySelector('.overlay-menu');
    return m ? (/Schedule Message/.test(m.textContent) || !!m.querySelector('[data-action="sched-open-message"]')) : false;
  });
  check('"Schedule Message" is NOT in the mode menu', !modeHasSchedule);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  const toolsHasSchedule = await ev(() =>
    !!document.querySelector('.composer-tools [data-action="sched-open-message"]'));
  check('"Schedule Message" is NOT in the composer tools row', !toolsHasSchedule);

  /* ================================================================
     2. Build At… is reachable for a Plan — via the Plan card's own
        pd-build-at -> pd-at-bind hand-off into scheduling.js's real dialog
     ================================================================ */
  /* The ap-index Plan card renders in the query thread's transcript.
     Re-baselined 2026-09-27 (SCHED, spec 8.8 / 10.2 G-23): "Build At…" is a
     secondary action behind the card's "More" list (plans.js cardFooter), and
     it opens scheduling.js's own Build At sheet directly (plans.js's
     mini-dialog and its pd-at-bind hand-off only run when scheduling.js is
     absent). Re-baselined 2026-10-08 (card 8): the plan id, version and hash
     left the sheet entirely — no Technical details outside a setup sheet's
     Advanced page. */
  await ev(() => window.PM56_DEMO.selectThread('query'));
  await page.waitForTimeout(300);
  const cardSel = '.plan-doc[data-plan-id="ap-index"]';
  await click(`${cardSel} [data-action="pd-more-actions"][data-id="ap-index"]`);
  await page.waitForTimeout(250);
  const planCardPresent = await ev(s => !!document.querySelector(s + ' [data-action="pd-build-at"][data-id="ap-index"]'), cardSel);
  check('the Plan card exposes a "Build At…" control', planCardPresent);

  /* REGRESSION GUARD (kept as a live hit-test): the control that opens the
     schedule must be reachable at its own rendered centre, not covered by
     other transcript content, so a real mouse click reaches it. */
  const occlusion = await ev(s => {
    const b = document.querySelector(s + ' [data-action="pd-build-at"][data-id="ap-index"]');
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { buttonRect: r, elementActuallyAtButtonCenter: hit ? (hit.tagName + '.' + (hit.className || '')) : null, hitIsTheButton: !!hit && (hit === b || b.contains(hit)) };
  }, cardSel);
  check('the "Build At…" control is reachable at its own rendered screen position (not occluded by other content)',
    occlusion && occlusion.hitIsTheButton, JSON.stringify(occlusion));

  const bt = await page.$(`${cardSel} [data-action="pd-build-at"][data-id="ap-index"]`);
  if (bt) { const r = await bt.boundingBox(); if (r) await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); }
  await page.waitForTimeout(400);
  const mouseClickWorked = await ev(() => (window.PM56_EXT.ctx().state.dialog || {}).type === 'sched-build-at');
  check('a real mouse click on "Build At…" reaches scheduling.js\'s dialog',
    mouseClickWorked, 'mouse click opened sched-build-at? ' + mouseClickWorked);

  const buildDlg = await ev(() => {
    const d = document.querySelector('.sched-dialog--build');
    return d ? { present: true, label: d.getAttribute('aria-label') } : { present: false };
  });
  check('the real execution-window dialog opens from the mouse click',
    buildDlg.present, JSON.stringify(buildDlg));
  const buildNoTech = await ev(() => {
    const d = document.querySelector('.sched-dialog--build');
    if (!d) return null;
    return { toggle: !!d.querySelector('[data-action="sched-toggle-tech"]'),
      block: !!d.querySelector('.pmx-sched-tech'),
      words: /Technical details/.test(d.textContent || '') };
  });
  check('Build At has no Technical details (card 8: a setup sheet\'s Advanced page only)',
    buildNoTech && !buildNoTech.toggle && !buildNoTech.block && !buildNoTech.words, JSON.stringify(buildNoTech));

  /* ================================================================
     3. an execution window with start / wind-down / pause / recurring
        resume / timezone / days, and a DST summary (packet §15.3)
     ================================================================ */
  const windowFields = await ev(() => {
    return {
      start: !!document.querySelector('[data-sched-input="build-start"]'),
      pause: !!document.querySelector('[data-sched-input="build-pause"]'),
      windDown: !!document.querySelector('[data-sched-input="build-wind"]'),
      autoResume: !!document.querySelector('[data-action="sched-toggle-autoresume"]'),
      tzPicker: !!document.querySelector('[data-action="sched-pick-build-tz"]'),
      dayChips: document.querySelectorAll('[data-action="sched-toggle-day"]').length,
      dst: (document.querySelector('.sched-dst') || {}).textContent || ''
    };
  });
  check('execution window has start time', windowFields.start, JSON.stringify(windowFields));
  check('execution window has pause (wind-down boundary) time', windowFields.pause);
  check('execution window has a wind-down duration field', windowFields.windDown);
  check('execution window has a recurring auto-resume-next-window checkbox', windowFields.autoResume);
  check('execution window offers a timezone picker button', windowFields.tzPicker, JSON.stringify(windowFields));
  /* The native timezone select became a shared picker button (module-shell
     grammar: no <select> survives in any dialog). Drive the real overlay
     menu it opens and count the IANA options it offers — same bar as the
     old option count, asserted through the real control. */
  await click(sel('sched-pick-build-tz'));
  await page.waitForTimeout(250);
  const tzOptionCount = await ev(() => document.querySelectorAll('.overlay-menu [data-action="shared-choice-pick"]').length);
  check('execution window offers a real IANA timezone choice', tzOptionCount >= 8, String(tzOptionCount));
  check('execution window has all 7 day-of-week chips', windowFields.dayChips === 7, String(windowFields.dayChips));
  /* Re-baselined 2026-09-27 (SCHED, spec 8.8 G-21/G-33): the default zone is
     now the device's zone (UTC in this headless browser), and the DST fine
     print speaks only of clock changes this slot actually meets. So a zone
     with daylight saving is chosen through the open picker first, and the
     Saturday and Sunday nights are switched on so that both of that zone's
     changes (early Sunday) fall inside the 10 PM-2 AM slot. */
  await click('.overlay-menu [data-action="shared-choice-pick"][data-value="America/Chicago"]');
  await page.waitForTimeout(200);
  for (const d of ['6', '0']) {
    const on = await ev(d => (document.querySelector(`[data-action="sched-toggle-day"][data-day="${d}"]`) || {}).getAttribute?.('aria-pressed'), d);
    if (on !== 'true') { await click(sel('sched-toggle-day', { day: d })); await page.waitForTimeout(150); }
  }
  const dstText = await ev(() => (document.querySelector('.sched-dst') || {}).textContent || '');
  check('a DST summary states what happens on the transition night (a zone with DST)',
    /spring-forward/i.test(dstText) && /fall-back/i.test(dstText), dstText.slice(0, 240));

  /* a no-DST zone must say so truthfully rather than fabricate a transition —
     chosen through the picker menu, the real user route */
  await click(sel('sched-pick-build-tz'));
  await page.waitForTimeout(250);
  await click('.overlay-menu [data-action="shared-choice-pick"][data-value="Asia/Kolkata"]');
  await page.waitForTimeout(200);
  const noDstText = await ev(() => (document.querySelector('.sched-dst') || {}).textContent || '');
  check('a timezone with no DST this year states that honestly, not a fabricated transition',
    /has not observed a daylight-saving change/i.test(noDstText), noDstText.slice(0, 200));

  await click(sel('sched-close-dialog'));
  await page.waitForTimeout(200);

  /* ================================================================
     4. EXACT-VERSION BINDING: revise the bound Plan and assert the
        schedule is INVALIDATED with a stated reason and offers rebind
        (packet §15.2, SQR-003) — using the pre-seeded bld-nightly-index
     ================================================================ */
  await ensureWandOpen();
  await click(sel('sched-open-manage'));
  await page.waitForTimeout(300);
  await click(sel('sched-manage-tab', { tab: 'builds' }));
  await page.waitForTimeout(200);

  const beforeRevise = await ev(() => {
    const b = window.PM56_SCHED.list().builds.find(x => x.schedule_id === 'bld-nightly-index');
    return b ? { state: b.state, version: b.exact_target_version } : null;
  });
  check('the pre-seeded nightly build schedule starts active, bound to V5', beforeRevise && beforeRevise.state === 'active' && beforeRevise.version === 5, JSON.stringify(beforeRevise));

  const advanceBtnBefore = await ev(() => !!document.querySelector('[data-k="sched-bld-bld-nightly-index"] [data-action="sched-advance-window"]'));
  check('an active schedule shows an Advance window control', advanceBtnBefore);

  /* Re-baselined 2026-09-27: the Plan is revised through its owner
     (PM56_PLANS.revise, the path an ordinary Revise takes, PSCHED-006), which
     calls scheduling's invalidateForPlanRevision. The old simulated revision
     never moved the Plan itself, so the Use V6 consent could not bind to a
     version that did not exist and was rightly refused. */
  const revised = await ev(() => { const r = window.PM56_PLANS.revise('ap-index', 'Also cover the p50 path in the fixture.'); window.PM56_EXT.ctx().renderApp(); return r; });
  check('the Plan owner accepts a revision to V6', revised && revised.ok && revised.version === 6, JSON.stringify(revised));
  await page.waitForTimeout(300);
  const afterRevise = await ev(() => {
    const b = window.PM56_SCHED.list().builds.find(x => x.schedule_id === 'bld-nightly-index');
    return b ? { state: b.state, reason: b.invalidated_reason, pendingVersion: b.pendingVersion } : null;
  });
  check('a Plan revision INVALIDATES the pending schedule with a stated reason',
    afterRevise && afterRevise.state === 'invalidated' && /V5/.test(afterRevise.reason) && /V6/.test(afterRevise.reason), JSON.stringify(afterRevise));
  const rowAfterRevise = await ev(() => {
    const row = document.querySelector('[data-k="sched-bld-bld-nightly-index"]');
    if (!row) return null;
    return {
      chip: (row.querySelector('.mdl-chip') || {}).textContent,
      hasAdvance: !!row.querySelector('[data-action="sched-advance-window"]'),
      hasRebind: !!row.querySelector('[data-action="sched-rebind-build"]'),
      /* re-baselined: the row's plain status sentence (.pmx-sched-bsay) carries the reason */
      reasonText: (row.querySelector('.pmx-sched-bsay') || {}).textContent
    };
  });
  check('the invalidated row shows "Needs update" and the reason, in the UI',
    rowAfterRevise && /Needs update/i.test(rowAfterRevise.chip) && /V5/.test(rowAfterRevise.reasonText), JSON.stringify(rowAfterRevise));
  check('it does NOT silently offer to run the newer version — no Advance window control while invalidated',
    rowAfterRevise && !rowAfterRevise.hasAdvance, JSON.stringify(rowAfterRevise));
  check('it offers an explicit Rebind control instead', rowAfterRevise && rowAfterRevise.hasRebind, JSON.stringify(rowAfterRevise));

  /* scoped to the manager's row: the Plan card's schedule line behind the sheet carries the same action */
  await click(`[data-k="sched-bld-bld-nightly-index"] ${sel('sched-rebind-build', { id: 'bld-nightly-index' })}`);
  await page.waitForTimeout(300);
  const afterRebind = await ev(() => {
    const b = window.PM56_SCHED.list().builds.find(x => x.schedule_id === 'bld-nightly-index');
    return b ? { state: b.state, version: b.exact_target_version } : null;
  });
  check('an explicit Rebind moves the schedule back to active, on the new version',
    afterRebind && afterRebind.state === 'active' && afterRebind.version === 6, JSON.stringify(afterRebind));

  /* ================================================================
     5a. IDEMPOTENCY — a duplicate nightly fire does not double-run
     (packet §15.2/§15.5, SQR-003/SQR-007)
     ================================================================ */
  await click(`[data-k="sched-bld-bld-nightly-index"] ${sel('sched-advance-window', { id: 'bld-nightly-index' })}`);
  await page.waitForTimeout(250);
  const occAfterFirst = await ev(() => {
    const b = window.PM56_SCHED.list().builds.find(x => x.schedule_id === 'bld-nightly-index');
    return b ? b.occurrencesFired.length : null;
  });
  check('advancing the window admits one occurrence', occAfterFirst === 1, String(occAfterFirst));

  await runAction('sched-fire-duplicate', { id: 'bld-nightly-index' });
  await page.waitForTimeout(250);
  const occAfterDuplicate = await ev(() => {
    const b = window.PM56_SCHED.list().builds.find(x => x.schedule_id === 'bld-nightly-index');
    return b ? b.occurrencesFired.length : null;
  });
  check('a duplicate timer fire is suppressed by idempotency, not admitted as a second run',
    occAfterDuplicate === 1, `${occAfterFirst} -> ${occAfterDuplicate}`);
  const dupLog = await ev(() => {
    const b = window.PM56_SCHED.list().builds.find(x => x.schedule_id === 'bld-nightly-index');
    return b && b.log && b.log[0] ? b.log[0].text : '';
  });
  check('the duplicate-fire result is visible in the schedule log, naming the idempotency key',
    /suppressed/i.test(dupLog) && /idempotency/i.test(dupLog), dupLog);

  await click(sel('sched-close-dialog'));
  await page.waitForTimeout(200);

  /* ================================================================
     5b. IDEMPOTENCY — a duplicate scheduled-MESSAGE fire does not
     double-send. Created fresh against the 'route' thread (fixture
     baseline 4 sent user messages -> one real dispatch lands it on 5,
     nowhere near the multiple-of-6 hazard noted at the top of this file).
     ================================================================ */
  await click(sel('select-thread', { id: 'route' }));
  await page.waitForTimeout(400);
  const routeBaseline = await ev(() => window.PM56_COMPOSER_STATE.sentHistory(window.PM56_EXT.ctx(), 'route').length);
  check('the target thread for the live dispatch test is not one send away from the multiple-of-6 hazard',
    (routeBaseline + 1) % 6 !== 0, 'route baseline ' + routeBaseline);

  await ensureWandOpen();
  await click(sel('sched-open-message'));
  await page.waitForTimeout(300);
  await page.fill('.sched-text[data-sched-input="msg-text"]', 'Idempotency probe — dispatched live for this run.');
  await ev(() => {
    const t = document.querySelector('.sched-text[data-sched-input="msg-text"]');
    if (t) t.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(150);
  const createBtnState = await ev(() => {
    const b = document.querySelector('[data-action="sched-create-message"]');
    return b ? { disabled: b.disabled } : null;
  });
  check('the Schedule button is enabled once real text is entered', createBtnState && createBtnState.disabled === false, JSON.stringify(createBtnState));
  await click(sel('sched-create-message'));
  await page.waitForTimeout(300);
  const created = await ev(() => {
    const list = window.PM56_SCHED.list().messages;
    return list.find(m => m.text === 'Idempotency probe — dispatched live for this run.') || null;
  });
  check('Schedule freezes the exact composer text into a real ScheduledMessageSnapshot',
    !!created && created.thread_id === 'route' && created.state === 'scheduled', JSON.stringify(created));

  if (created) {
    /* Re-baselined 2026-09-27: the commit confirms in the same sheet (spec 8.7,
       IMPACT A4-03), and nothing is ever sent before its time ("not_due":
       "Nothing was sent early"). So delivery is driven the way the B18 local
       clock drives it: PM56_SCHED.dispatchMessageAt at the record's own
       scheduled instant, once and then again (the duplicate delivery). */
    const dispatchDue = () => ev(id => { const S = window.PM56_SCHED, m = S.list().messages.find(x => x.scheduled_dispatch_id === id); const out = S.dispatchMessageAt(id, Date.parse(m.scheduled_at_utc)); window.PM56_EXT.ctx().renderApp(); return out; }, created.scheduled_dispatch_id);
    const msgCountBefore = await ev(() => window.PM56_EXT.ctx().thread.messages.length);
    await dispatchDue();
    await page.waitForTimeout(400);
    const afterDispatch = await ev(id => window.PM56_SCHED.list().messages.find(m => m.scheduled_dispatch_id === id), created.scheduled_dispatch_id);
    check('delivery at the scheduled time marks the record Sent',
      /* re-baselined: the record's state word is the canon "sent" (SMSG; the older "dispatched" is read as sent) */
      afterDispatch && ['sent', 'dispatched'].includes(afterDispatch.state) && !!afterDispatch.dispatchedMessageId, JSON.stringify(afterDispatch).slice(0, 400));
    const msgCountAfterFirst = await ev(() => window.PM56_EXT.ctx().thread.messages.length);
    /* REGRESSION GUARD — this was a real defect, driven and caught via the
       real route, not inferred: dispatchMessage() used to resolve its target
       via scheduling.js's own threadByIdRaw(rec.thread_id), which read
       window.PM56_DATA.threads (the pristine data.js fixture) rather than
       ctx.state.threads (the live, rendered app state — a deep clone taken
       once at boot, per app.js's own `state.threads=clone(D.threads)`). The
       scheduled-message record correctly flipped to "dispatched" with a
       dispatchedMessageId, but the message was appended to a thread object
       the UI never reads from, so it never actually appeared in the visible
       transcript. Fixed: threadByIdRaw() now resolves through the live
       `EXT.ctx().state.threads` (falling back to the fixture only if no
       live ctx is available). Both directions are asserted below so a
       regression here is caught the same way this one was found. */
    check('delivery puts the message into the THREAD THE USER IS LOOKING AT',
      msgCountAfterFirst > msgCountBefore, `visible transcript count ${msgCountBefore} -> ${msgCountAfterFirst}`);
    const deliveryTarget = await ev((dispatchedId) => {
      const stale = (window.PM56_DATA.threads || []).find(x => x.id === 'route');
      const live = window.PM56_EXT.ctx().state.threads.find(x => x.id === 'route');
      return {
        inStaleFixtureCopy: !!(stale && stale.messages.some(m => m.id === dispatchedId)),
        inLiveRenderedState: !!(live && live.messages.some(m => m.id === dispatchedId))
      };
    }, afterDispatch.dispatchedMessageId);
    check('the dispatched message lands in the LIVE rendered thread, not the stale fixture copy',
      deliveryTarget.inLiveRenderedState && !deliveryTarget.inStaleFixtureCopy, JSON.stringify(deliveryTarget));

    await dispatchDue();
    await page.waitForTimeout(400);
    const msgCountAfterSecond = await ev(() => window.PM56_EXT.ctx().thread.messages.length);
    check('firing the same dispatch again does not send a second message (idempotency)',
      msgCountAfterSecond === msgCountAfterFirst, `${msgCountAfterFirst} -> ${msgCountAfterSecond}`);
    const events = await ev(() => window.PM56_SCHED.list().events.slice(0, 3));
    check('the duplicate dispatch is recorded as suppressed, not silently ignored',
      events.some(e => e.type === 'scheduled_dispatch.dispatched' && /[Dd]uplicate/.test(e.detail || '')), JSON.stringify(events));
  }
  await click(sel('sched-close-dialog'));
  await page.waitForTimeout(200);

  /* ================================================================
     6. MANUAL STOP PRECEDENCE: stop manually, then attempt a scheduled /
        quota auto-resume and assert it is refused with a visible reason
        (packet §15.5, SQR-001)
     ================================================================ */
  await ensureWandOpen();
  await click(sel('sched-open-manage'));
  await page.waitForTimeout(300);
  /* Re-baselined 2026-09-27 (spec 8.9): the Precedence panel is the "Pause all
     automations" block on the Resume & Safety Policy tab (data-tab quota);
     the stop, resume-attempt and race demos are registered-only handlers.
     Re-baselined 2026-09-28 (DL-136, owner answer p12/E-19 A): a manual Stop is
     its own latch and never turns the project-wide switch on; the panel names
     it ("You pressed Stop") beside the switch, which stays Off. */
  await click(sel('sched-manage-tab', { tab: 'quota' }));
  await page.waitForTimeout(200);
  await runAction('sched-simulate-stop');
  await page.waitForTimeout(250);
  const safety = () => ev(() => {
    const el = document.querySelector('[data-k="sched-safety"]');
    return el ? { state: el.getAttribute('data-state'), text: el.textContent } : null;
  });
  const stopState = await safety();
  check('a manual Stop latches, visibly, in the Resume & Safety panel (and does not turn the project switch on)', stopState && stopState.state === 'off' && /You pressed Stop/.test(stopState.text), JSON.stringify(stopState));

  await runAction('sched-attempt-resume');
  await page.waitForTimeout(250);
  const resumeEvent = await ev(() => window.PM56_SCHED.list().events[0]);
  check('an auto-resume attempt while manually stopped is REFUSED with a visible, stated reason',
    resumeEvent && resumeEvent.clause === 'manual_stop_latched' && /Manual Stop/i.test(resumeEvent.detail), JSON.stringify(resumeEvent));

  await runAction('sched-race-demo');
  await page.waitForTimeout(300);
  const raceEvent = await ev(() => window.PM56_SCHED.list().events[0]);
  check('a dispatch decided before a stop and delivered after it is discarded, not delivered',
    raceEvent && raceEvent.clause === 'manual_stop_latched', JSON.stringify(raceEvent));

  await click(sel('sched-clear-stop'));
  await page.waitForTimeout(250);
  const stopCleared = await safety();
  check('an explicit user resume clears the latch', stopCleared && stopCleared.state === 'off' && /Off:/.test(stopCleared.text) && !/You pressed Stop/.test(stopCleared.text), JSON.stringify(stopCleared));

  /* ================================================================
     6b. PAUSE ALL AUTOMATIONS (SQR-018, DL-136 — owner answer p12/E-19 A):
         the real project-wide switch, driven through its visible control
     ================================================================ */
  const sw = await ev(() => [...document.querySelectorAll('[data-k="sched-pause-switch"] [data-action="sched-set-pause"]')].map(b => ({ v: b.dataset.value, disabled: b.disabled, role: b.getAttribute('role') })));
  check('the Pause all automations switch is interactive (two enabled choices, never read-only)', sw.length === 2 && sw.every(x => !x.disabled && x.role === 'radio'), JSON.stringify(sw));
  const offCopy = await safety();
  check('the preview fine print is gone and the panel says plainly what the switch does and who turns it off',
    offCopy && !/In this preview|each run separately/i.test(offCopy.text) && /every scheduled send and scheduled build in this project/.test(offCopy.text) && /[Oo]nly you can turn it off/.test(offCopy.text), offCopy && offCopy.text);
  await click('[data-k="sched-pause-switch"] [data-action="sched-set-pause"][data-value="on"]');
  await page.waitForTimeout(250);
  const onState = await safety();
  check('turning the switch on shows "Paused by you" and "Turn back on"', onState && onState.state === 'paused' && /Paused by you/.test(onState.text) && /Turn back on/.test(onState.text), JSON.stringify(onState));
  const pauseEv = await ev(() => window.PM56_SCHED.list().events[0]);
  check('the change emits runtime.automation_pause_changed', pauseEv && pauseEv.type === 'runtime.automation_pause_changed' && /Turned on/.test(pauseEv.detail), JSON.stringify(pauseEv));
  const badge = await ev(() => { const S = window.PM56_SCHED, rec = S.automationPause(), again = S.setAutomationPause(true), bot = S.setAutomationPause(false, 'assistant'); return { rec, again, bot, after: S.automationPause() }; });
  check('setting the value it already has returns the record unchanged (the epoch does not move)', badge.again.ok && badge.again.unchanged && badge.after.user_stop_epoch === badge.rec.user_stop_epoch, JSON.stringify(badge));
  check('only a user actor may turn it off (anything else: permission_denied)', badge.bot.error === 'permission_denied' && badge.after.paused === true, JSON.stringify(badge.bot));
  await runAction('sched-attempt-resume');
  await page.waitForTimeout(200);
  const qEv = await ev(() => window.PM56_SCHED.list().events[0]);
  check('a quota auto-resume while paused is refused with project_automation_paused', qEv && qEv.clause === 'project_automation_paused', JSON.stringify(qEv));
  await click(sel('sched-clear-pause'));
  await page.waitForTimeout(250);
  const offAgain = await safety();
  check('"Turn back on" turns the switch off', offAgain && offAgain.state === 'off' && /Off:/.test(offAgain.text), JSON.stringify(offAgain));
  await click(sel('sched-close-dialog'));
  await page.waitForTimeout(200);

  /* the canon's switch-off rules, on real owner commands in a private test thread (restored afterwards) */
  const pauseCases = await ev(() => {
    const out = [], ck = (n, v, d) => out.push({ n, v: !!v, d: d === undefined ? '' : JSON.stringify(d).slice(0, 300) });
    const S = window.PM56_SCHED, C = window.PM56_COMPOSER_STATE, ctx = window.PM56_EXT.ctx(), prevThread = ctx.state.selectedThread;
    const t = JSON.parse(JSON.stringify(ctx.state.threads.find(x => x.id === 'query')));
    Object.assign(t, { id: 'pause-test', title: 'Pause verification', messages: [], projectId: 'pause', worktreeId: 'pause', archived: false });
    ctx.state.threads.push(t); ctx.switchThread(t.id); ctx.state.model = window.PM56_DATA.models.find(m => m.status === 'ready').id; S.restore();
    const make = (text, missed, date) => { ctx.state.composer = text; const b = C.bufferFor(t.id); b.text = text; b.attachments = []; b.destination = null;
      const d = S.messageDraft(); d.date = date || '2027-05-10'; d.time = '22:00'; d.timezone = 'America/New_York'; d.missed = missed; const r = S.saveMessage(d); if (!r.ok) throw Error(JSON.stringify(r)); return r.record; };
    const sent = () => t.messages.filter(m => m.viaSchedule).length;
    try {
      S.setAutomationPause(true);
      const hold = make('Pause probe: hold', 'hold'), next = make('Pause probe: next available', 'next_available', '2027-05-11');
      ck('a schedule created while paused does not lift the switch', S.automationPause().paused === true && hold.state === 'scheduled');
      const dueAt = Date.parse(hold.scheduled_at_utc), r1 = S.dispatchMessageAt(hold.scheduled_dispatch_id, dueAt), r2 = S.dispatchMessageAt(next.scheduled_dispatch_id, Date.parse(next.scheduled_at_utc));
      ck('a send time that arrives while paused is held with project_automation_paused, nothing sent',
        hold.state === 'held' && next.state === 'held' && hold.dispatch_attempts.at(-1).result.error === 'project_automation_paused' && sent() === 0, [hold.state, next.state, r1, r2]);
      ctx.renderApp();
      const card = document.querySelector('.transcript .sched-card[data-schedule-id="' + CSS.escape(hold.scheduled_dispatch_id) + '"]');
      ck('the held card names the pause as its reason and offers Send now', card && /Held/.test(card.textContent) && /Pause all automations is on/.test(card.textContent) && !!card.querySelector('[data-action="sched-card-send-now"]'), card && card.textContent);
      const tk = S.messageTicket(next.scheduled_dispatch_id, Date.now()).ticket;
      S.setAutomationPause(false);
      ck('switch-off: under "hold" the message stays held and now names the missed time, not the switch',
        hold.state === 'held' && hold.dispatch_attempts.at(-1).result.error === 'missed_time_held', hold.dispatch_attempts.at(-1));
      ck('switch-off: under "next available" it dispatches exactly once, no backlog burst', next.state === 'sent' && sent() === 1, [next.state, sent()]);
      ck('no item keeps the reason "Pause all automations is on" once it is off', !S.list().messages.some(m => m.state === 'held' && (m.dispatch_attempts || []).at(-1)?.result?.error === 'project_automation_paused'));
      S.setAutomationPause(true);
      const late = make('Pause probe: decided before', 'next_available', '2027-05-12'), tk2 = S.messageTicket(late.scheduled_dispatch_id, Date.parse(late.scheduled_at_utc)).ticket;
      S.setAutomationPause(false); S.setAutomationPause(true); S.setAutomationPause(false);
      const r3 = S.deliverMessage(tk2);
      ck('a dispatch decided before the switch was turned on and delivered after it is discarded', r3.discarded && r3.error === 'project_automation_paused' && late.state === 'scheduled' && sent() === 1, [r3, late.state]);
      S.setAutomationPause(true);
      const again = make('Pause probe: send now', 'hold', '2027-05-13'); S.dispatchMessageAt(again.scheduled_dispatch_id, Date.parse(again.scheduled_at_utc)); ctx.renderApp();
      const btn = document.querySelector('.transcript .sched-card[data-schedule-id="' + CSS.escape(again.scheduled_dispatch_id) + '"] [data-action="sched-card-send-now"]');
      if (btn) btn.click();
      ck('Send now on a paused-held message sends that one message and leaves the switch on', again.state === 'sent' && S.automationPause().paused === true, [again.state, again.dispatch_attempts.at(-1)?.result]);
    } catch (e) { ck('pause cases ran', false, String(e && e.stack || e)); }
    finally { S.setAutomationPause(false); S.restore(); ctx.state.threads = ctx.state.threads.filter(x => x.id !== 'pause-test'); ctx.switchThread(prevThread); ctx.renderApp(); }
    return out;
  });
  for (const c of pauseCases) check(c.n, c.v, c.d);

  /* ================================================================
     7. QUOTA WAIT STRIP: reset truth AND its source shown together, opt-in
        auto-resume checkbox; unknown says `unknown`, never a countdown
        (packet §15.4, SQR-005 — owned by composer-state.js, consumed here)
     ================================================================ */
  /* Re-baselined: the quota demos left the wand for the Demo Studio gallery
     (delivery-polish.js demoOnly); reached through the action registry. */
  await runAction('cs-quota-demo');
  await page.waitForTimeout(250);
  const stripOn = await ev(() => {
    const el = document.querySelector('.cs-quota');
    return el ? { present: true, text: el.textContent } : { present: false };
  });
  check('the quota wait strip renders in-flow, below the working area', stripOn.present, JSON.stringify(stripOn));
  check('the strip states Paused and a reset time together with its source',
    stripOn.present && /Paused/.test(stripOn.text) && /provider reported/i.test(stripOn.text), stripOn.text);
  const resumeCheckbox = await ev(() => !!document.querySelector('.cs-quota-resume input[type="checkbox"]'));
  check('an opt-in "Resume automatically" checkbox is present', resumeCheckbox);

  /* cycle the source (provider reported -> locally inferred -> user supplied
     -> unknown) until it reaches unknown, bounded so a broken cycle fails
     loudly instead of looping forever. */
  for (let i = 0; i < 6; i++) {
    const current = await ev(() => {
      const el = document.querySelector('.cs-quota-src');
      return el ? el.textContent : '';
    });
    if (/unknown/i.test(current)) break;
    await runAction('cs-quota-source');
    await page.waitForTimeout(200);
  }
  const unknownState = await ev(() => {
    const el = document.querySelector('.cs-quota');
    return el ? {
      text: el.textContent,
      hasCountdown: !!el.querySelector('.cs-quota-cd'),
      unknownTag: !!el.querySelector('.cs-quota-src.is-unknown'),
      hasSupplyField: !!el.querySelector('.cs-quota-supply input')
    } : null;
  });
  check('cycling the reset-time source reaches "unknown" and says so in the strip',
    unknownState && unknownState.unknownTag && /unknown/i.test(unknownState.text), JSON.stringify(unknownState));
  check('an unknown reset source never invents a countdown', unknownState && !unknownState.hasCountdown, JSON.stringify(unknownState));
  check('an unknown source offers the user a field to supply a reset time', unknownState && unknownState.hasSupplyField, JSON.stringify(unknownState));

  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);
  if (unknownState && unknownState.hasSupplyField) {
    await page.click('.cs-quota-input');
    await page.keyboard.type('11:45 PM');
    await ev(() => {
      const inp = document.querySelector('.cs-quota-input');
      if (inp) inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(150);
    await click(sel('cs-quota-set-reset'));
    await page.waitForTimeout(250);
    const supplied = await ev(() => (document.querySelector('.cs-quota') || {}).textContent || '');
    check('a user-supplied reset time is labelled "user supplied", never "provider reported"',
      /user supplied/i.test(supplied) && !/provider reported/i.test(supplied), supplied);
  }

  /* ================================================================
     7b. Schedule Message: drag the 48-hour track, then the arrow keys.
         The track is the control. 15-minute snaps, 5 with Shift, never past.
     ================================================================ */
  await runAction('sched-close-dialog');
  await page.waitForTimeout(200);
  await runAction('sched-open-message');
  await page.waitForTimeout(500);
  const trackOpen = await ev(() => {
    const dlg = document.querySelector('.sched-dialog--message');
    const slot = document.querySelector('[data-k="sched-track-slot"]');
    const text = dlg ? dlg.innerText : '';
    return {
      role: slot && slot.getAttribute('role'),
      label: slot && slot.getAttribute('aria-label'),
      hit: !!document.querySelector('.sched-dialog--message .pmx-sched-hit'),
      grab: !!document.querySelector('.sched-dialog--message .pmx-sched-grab'),
      tech: !!document.querySelector('.sched-dialog--message [data-action="sched-toggle-tech"]'),
      promise: /later edits|any time before it sends/.test(text),
      mode: (document.querySelector('[data-k="sched-track"]') || {}).getAttribute?.('data-fit') || ''
    };
  });
  check('Schedule Message track is a send-time slider', trackOpen.role === 'slider' && trackOpen.label === 'Send time' && trackOpen.hit && trackOpen.grab, JSON.stringify(trackOpen));
  check('Schedule Message has no Technical details and no promise lines', trackOpen.tech === false && trackOpen.promise === false, JSON.stringify(trackOpen));
  const dragGeom = await ev(() => {
    const slot = document.querySelector('[data-k="sched-track-slot"]');
    if (!slot || slot.getAttribute('role') !== 'slider') return null;
    const fig = [...slot.querySelectorAll('.pmx-plate')].find(p => p.getClientRects().length);
    if (!fig || !fig.querySelector('.pmx-sched-dot')) return null;
    const svg = fig.querySelector('svg');
    const ctm = svg.getScreenCTM();
    const x0 = +fig.getAttribute('data-sched-x0'), x1 = +fig.getAttribute('data-sched-x1');
    const a = new DOMPoint(x0, 44).matrixTransform(ctm);
    const b = new DOMPoint(x1, 44).matrixTransform(ctm);
    const dot = fig.querySelector('.pmx-sched-dot').getBoundingClientRect();
    return { x: dot.x + dot.width / 2, y: dot.y + dot.height / 2, ax: a.x, bx: b.x, span: +fig.getAttribute('data-sched-span'), mode: fig.getAttribute('data-mode'), now: +slot.getAttribute('aria-valuenow') };
  });
  check('the open sheet shows the full 48-hour plate', !!(dragGeom && dragGeom.mode === 'full'), JSON.stringify(dragGeom));
  if (!dragGeom) {
    check('dragging the marker advances the send time about 200px, snapped to 15 minutes', false, 'no track');
    check('the drag writes the Date and Time inputs, the marker label, the read-back and the primary', false, 'no track');
    check('ArrowRight adds 5 minutes', false, 'no track');
    check('Shift+ArrowUp adds 60 minutes', false, 'no track');
    check('Home goes to the next allowed minute, never the past', false, 'no track');
    check('a narrow sheet shows the compact plate', false, 'no track');
    check('dragging the compact plate changes the send time', false, 'no track');
  } else {
  await page.mouse.move(dragGeom.x, dragGeom.y);
  await page.mouse.down();
  await page.mouse.move(dragGeom.x + 200, dragGeom.y, { steps: 10 });
  await page.waitForTimeout(80);
  const midDrag = await ev(() => {
    const slot = document.querySelector('[data-k="sched-track-slot"]');
    const marker = document.querySelector('.sched-dialog--message .pmx-sched-marker');
    const cs = marker ? getComputedStyle(marker) : null;
    return {
      dragging: !!(slot && slot.hasAttribute('data-dragging')),
      ink: document.querySelectorAll('.sched-dialog--message .pmx-ink').length,
      transition: cs ? cs.transitionProperty + ' ' + cs.transitionDuration : '',
      now: slot ? +slot.getAttribute('aria-valuenow') : 0,
      time: (document.querySelector('[data-sched-input="msg-time"]') || {}).value || '',
      label: (document.querySelector('.sched-dialog--message .pmx-sched-marker text') || {}).textContent || ''
    };
  });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const dragged = await ev(() => {
    const slot = document.querySelector('[data-k="sched-track-slot"]');
    return {
      now: slot ? +slot.getAttribute('aria-valuenow') : 0,
      dragging: !!(slot && slot.hasAttribute('data-dragging')),
      time: (document.querySelector('[data-sched-input="msg-time"]') || {}).value || '',
      date: (document.querySelector('[data-sched-input="msg-date"]') || {}).value || '',
      label: (document.querySelector('.sched-dialog--message .pmx-sched-marker text') || {}).textContent || '',
      primary: (document.querySelector('.sched-dialog--message .pmx-primary') || {}).textContent || '',
      read: (document.querySelector('.sched-dialog--message .pmx-readback') || {}).textContent || ''
    };
  });
  const rawDelta = (dragGeom.bx - dragGeom.ax) ? (200 / (dragGeom.bx - dragGeom.ax)) * dragGeom.span : 0;
  check('dragging the marker advances the send time about 200px, snapped to 15 minutes',
    midDrag.dragging && !midDrag.ink && /none/.test(midDrag.transition) && dragged.now > dragGeom.now &&
    Math.abs((dragged.now - dragGeom.now) - rawDelta) < 16 * 60000 && dragged.now % 900000 === 0 && !dragged.dragging,
    JSON.stringify({ rawDelta, before: dragGeom.now, mid: midDrag, after: dragged }));
  check('the drag writes the Date and Time inputs, the marker label, the read-back and the primary',
    /^\d{2}:\d{2}$/.test(dragged.time) && /^\d{4}-\d{2}-\d{2}$/.test(dragged.date) &&
    dragged.label.indexOf('Sends') === 0 && dragged.primary.indexOf('Schedule for') === 0 && dragged.read.length > 12,
    JSON.stringify(dragged));
  await page.focus('[data-k="sched-track-slot"]');
  const key0 = dragged.now;
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(180);
  const key1 = await ev(() => +document.querySelector('[data-k="sched-track-slot"]').getAttribute('aria-valuenow'));
  check('ArrowRight adds 5 minutes', key1 - key0 === 300000, String(key1 - key0));
  await page.keyboard.down('Shift');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.up('Shift');
  await page.waitForTimeout(180);
  const key2 = await ev(() => +document.querySelector('[data-k="sched-track-slot"]').getAttribute('aria-valuenow'));
  check('Shift+ArrowUp adds 60 minutes', key2 - key1 === 3600000, String(key2 - key1));
  await page.keyboard.press('Home');
  await page.waitForTimeout(180);
  const homed = await ev(() => {
    const slot = document.querySelector('[data-k="sched-track-slot"]');
    return { now: +slot.getAttribute('aria-valuenow'), min: +slot.getAttribute('aria-valuemin') };
  });
  check('Home goes to the next allowed minute, never the past', homed.now === homed.min && homed.now >= Date.now(), JSON.stringify(homed));
  /* ARIA slider convention: Page Up is the larger step up (a day later), Page Down a day earlier. */
  await page.keyboard.press('PageUp');
  await page.waitForTimeout(180);
  const pagedUp = await ev(() => +document.querySelector('[data-k="sched-track-slot"]').getAttribute('aria-valuenow'));
  check('PageUp moves the send time a day later', pagedUp - homed.now === 86400000, String(pagedUp - homed.now));
  await page.keyboard.press('PageDown');
  await page.waitForTimeout(180);
  const pagedDown = await ev(() => {
    const slot = document.querySelector('[data-k="sched-track-slot"]');
    return { now: +slot.getAttribute('aria-valuenow'), min: +slot.getAttribute('aria-valuemin'), title: slot.getAttribute('title') };
  });
  check('PageDown moves it a day earlier, never before the earliest allowed minute',
    pagedUp - pagedDown.now === 86400000 || pagedDown.now === pagedDown.min, JSON.stringify({ pagedUp, pagedDown }));
  check('the track has no native title tooltip (explanations live in the app hover card)', pagedDown.title === null, String(pagedDown.title));
  const saved = page.viewportSize();
  await page.setViewportSize({ width: 700, height: 900 });
  await page.waitForTimeout(500);
  const compact = await ev(() => {
    const fig = [...document.querySelectorAll('[data-k="sched-track-slot"] .pmx-plate')].find(p => p.getClientRects().length);
    const dot = fig && fig.querySelector('.pmx-sched-dot');
    const r = dot ? dot.getBoundingClientRect() : null;
    return { mode: fig && fig.getAttribute('data-mode'), x: r && r.x + r.width / 2, y: r && r.y + r.height / 2, now: +document.querySelector('[data-k="sched-track-slot"]').getAttribute('aria-valuenow') };
  });
  check('a narrow sheet shows the compact plate', compact.mode === 'compact', JSON.stringify(compact));
  if (compact.x) {
    await page.mouse.move(compact.x, compact.y);
    await page.mouse.down();
    await page.mouse.move(compact.x + 80, compact.y, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(250);
  }
  const compactAfter = await ev(() => +document.querySelector('[data-k="sched-track-slot"]').getAttribute('aria-valuenow'));
  check('dragging the compact plate changes the send time', compact.mode === 'compact' && compactAfter !== compact.now && compactAfter % 900000 === 0, JSON.stringify({ before: compact.now, after: compactAfter }));
  if (saved) await page.setViewportSize(saved);
  await page.waitForTimeout(200);
  }
  await runAction('sched-close-dialog');
  await page.waitForTimeout(200);

  /* ================================================================
     7c. CARD 8: no Technical details outside a setup sheet's Advanced
         page — the Scheduled manager (with a record focused) and the
         in-chat records have none either.
     ================================================================ */
  await ensureWandOpen();
  await click(sel('sched-open-manage'));
  await page.waitForTimeout(400);
  await click(sel('sched-manage-tab', { tab: 'messages' }));
  await page.waitForTimeout(300);
  await click('[data-schedule-id="sm-nightly-digest"] [data-action="sched-focus-record"]');
  await page.waitForTimeout(400);
  const mgrNoTech = await ev(() => {
    const d = document.querySelector('.sched-dialog--manage');
    if (!d) return null;
    return { focused: !!d.querySelector('[data-k="sched-detail"]'),
      toggle: !!d.querySelector('[data-action="sched-toggle-tech"]'),
      block: !!d.querySelector('.pmx-sched-tech'),
      words: /Technical details/.test(d.textContent || '') };
  });
  check('the Scheduled manager, with a record focused, has no Technical details',
    mgrNoTech && mgrNoTech.focused && !mgrNoTech.toggle && !mgrNoTech.block && !mgrNoTech.words, JSON.stringify(mgrNoTech));
  await click(sel('sched-close-dialog'));
  await page.waitForTimeout(200);

  /* the sent-message record, Details open, in whichever thread holds it */
  let sentThread = null;
  for (const t of ['query', 'recovery-scheduling']) {
    await ev(x => window.PM56_DEMO.selectThread(x), t);
    await page.waitForTimeout(350);
    if (await ev(() => !!document.querySelector('.transcript .sched-card-sent [data-action="sched-card-details"]'))) { sentThread = t; break; }
  }
  check('a sent-message record exists to probe', !!sentThread, String(sentThread));
  if (sentThread) {
    const wasOpen = await ev(() => document.querySelector('.transcript .sched-card-sent [data-action="sched-card-details"]').getAttribute('aria-expanded'));
    if (wasOpen !== 'true') {
      await click('.transcript .sched-card-sent [data-action="sched-card-details"]');
      await page.waitForTimeout(350);
    }
    const recNoTech = await ev(() => {
      const card = document.querySelector('.transcript .sched-card-sent');
      const rec = card && card.querySelector('.pmx-sched-rec');
      if (!card || !rec) return { card: !!card, rec: !!rec };
      return { card: true, rec: true,
        toggle: !!rec.querySelector('[data-action="sched-toggle-tech"]'),
        block: !!rec.querySelector('.pmx-sched-tech'),
        words: /Technical details/.test(rec.textContent || ''),
        raw: !!rec.querySelector('[data-sched-raw]') };
    });
    check('a sent-message record, Details open, has no Technical details ("Show raw data" stands on its own)',
      recNoTech.rec && !recNoTech.toggle && !recNoTech.block && !recNoTech.words && recNoTech.raw, JSON.stringify(recNoTech));
  }

  /* ================================================================
     8. console is clean; final reset
     ================================================================ */
  check('no console errors during the whole run', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));

  await click(sel('reset-all')).catch(() => {});
  await page.waitForTimeout(300);

  try { await browser.close(); } catch (e) { /* renderer may already be gone */ }
  const pass = results.filter(r => r.pass).length;
  const summary = { suite: 'scheduling-verify', total: results.length, pass, fail: results.length - pass, results };
  writeFileSync(resolve(ROOT, 'reports/scheduling-verify.json'), JSON.stringify(summary, null, 2));
  if (JSON_OUT) console.log(JSON.stringify(summary, null, 2));
  else console.log(`\n${pass}/${results.length} passed.`);
  process.exit(summary.fail === 0 ? 0 : 1);
}

main().catch(async e => {
  console.error('HARNESS ERROR', e);
  if (browser) await browser.close().catch(() => {});
  process.exit(2);
});
