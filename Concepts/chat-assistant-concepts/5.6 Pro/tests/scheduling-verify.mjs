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
 *   node tests/scheduling-verify.mjs --json     # machine-readable
 */
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const TARGET = 'file://' + resolve(ROOT, 'index.html');
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
  /* The ap-index Plan card renders in the query thread's transcript. */
  await ev(() => window.PM56_DEMO.selectThread('query'));
  await page.waitForTimeout(300);
  const planCardPresent = await ev(() => !!document.querySelector('.plan-doc[data-plan-id="ap-index"] [data-action="pd-build-at"]'));
  check('the Plan card exposes a "Build At…" control', planCardPresent);
  await click(sel('pd-build-at', { id: 'ap-index' }));
  await page.waitForTimeout(250);
  const miniDialogOpen = await ev(() => !!document.querySelector('.pd-dialog[role="dialog"][aria-label="Build At…"]'));
  check('clicking "Build At…" opens the Plan card\'s own binding dialog', miniDialogOpen);

  /* REGRESSION GUARD — this was a real defect, driven and caught via the
     real route, not inferred: plans.js's own mini-dialog (.pd-dialog, used
     by Info/Crew/At/Export) used to render `position:relative` with no
     left/top/transform and without the base `.dialog` class, so it laid out
     at the top-left of #pmOverlayRoot (which is pointer-events:none) instead
     of centred and interactive — document.elementFromPoint() at the
     "Schedule" button's own rendered centre resolved to Plan-card
     transcript content (`.pd-p` / `.pd-rich`) instead of the button, so a
     real mouse click could not reach it. Fixed: the shell now emits
     `class="dialog pd-dialog"` and plans.css no longer re-declares
     position/left/top/transform, so `.dialog` (styles.css) supplies
     position:fixed, the centring transform, --z-dialog and
     pointer-events:auto. Kept as a live hit-test rather than deleted, so a
     future regression here is caught the same way this one was found. */
  const occlusion = await ev(() => {
    const b = document.querySelector('[data-action="pd-at-bind"][data-id="ap-index"]');
    const dlg = document.querySelector('.pd-dialog');
    if (!b || !dlg) return null;
    const r = b.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      dialogComputedPosition: getComputedStyle(dlg).position,
      dialogRect: dlg.getBoundingClientRect(),
      buttonRect: r,
      elementActuallyAtButtonCenter: hit ? (hit.tagName + '.' + (hit.className || '')) : null,
      hitIsTheButton: hit === b
    };
  });
  check('the "Schedule" confirm button is reachable at its own rendered screen position (not occluded by other content)',
    occlusion && occlusion.hitIsTheButton, JSON.stringify(occlusion));

  await click(sel('pd-at-bind', { id: 'ap-index' }));
  await page.waitForTimeout(300);
  const mouseClickWorked = await ev(() => (window.PM56_EXT.ctx().state.dialog || {}).type === 'sched-build-at');
  check('a real mouse click on "Schedule" reaches scheduling.js\'s dialog',
    mouseClickWorked, 'mouse click opened sched-build-at? ' + mouseClickWorked);

  const buildDlg = await ev(() => {
    const d = document.querySelector('.sched-dialog--build');
    return d ? { present: true, pill: (d.querySelector('.meta-pill') || {}).textContent } : { present: false };
  });
  check('the real execution-window dialog opens from the mouse click',
    buildDlg.present, JSON.stringify(buildDlg));
  check('the Build At dialog names the exact plan/version/hash', buildDlg.present && /ap-index/.test(buildDlg.pill) && /V5/.test(buildDlg.pill) && /hash/.test(buildDlg.pill), buildDlg.pill);

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
  check('a DST summary states what happens on the transition night (default tz has DST)',
    /spring-forward/i.test(windowFields.dst) && /fall-back/i.test(windowFields.dst), windowFields.dst.slice(0, 200));

  /* a no-DST zone must say so truthfully rather than fabricate a transition —
     chosen through the still-open picker menu, the real user route */
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

  await click(sel('sched-simulate-revision', { id: 'bld-nightly-index' }));
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
      reasonText: (row.querySelector('.sched-reason') || {}).textContent
    };
  });
  check('the invalidated row shows "Needs update" and the reason, in the UI',
    rowAfterRevise && /Needs update/i.test(rowAfterRevise.chip) && /V5/.test(rowAfterRevise.reasonText), JSON.stringify(rowAfterRevise));
  check('it does NOT silently offer to run the newer version — no Advance window control while invalidated',
    rowAfterRevise && !rowAfterRevise.hasAdvance, JSON.stringify(rowAfterRevise));
  check('it offers an explicit Rebind control instead', rowAfterRevise && rowAfterRevise.hasRebind, JSON.stringify(rowAfterRevise));

  await click(sel('sched-rebind-build', { id: 'bld-nightly-index' }));
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
  await click(sel('sched-advance-window', { id: 'bld-nightly-index' }));
  await page.waitForTimeout(250);
  const occAfterFirst = await ev(() => {
    const b = window.PM56_SCHED.list().builds.find(x => x.schedule_id === 'bld-nightly-index');
    return b ? b.occurrencesFired.length : null;
  });
  check('advancing the window admits one occurrence', occAfterFirst === 1, String(occAfterFirst));

  await click(sel('sched-fire-duplicate', { id: 'bld-nightly-index' }));
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
    const rowSel = `[data-k="sched-msg-${created.scheduled_dispatch_id}"]`;
    const msgCountBefore = await ev(() => window.PM56_EXT.ctx().thread.messages.length);
    await click(`${rowSel} [data-action="sched-dispatch-message"]`);
    await page.waitForTimeout(400);
    const afterDispatch = await ev(id => window.PM56_SCHED.list().messages.find(m => m.scheduled_dispatch_id === id), created.scheduled_dispatch_id);
    check('Dispatch now marks the scheduled record as dispatched',
      afterDispatch && afterDispatch.state === 'dispatched' && !!afterDispatch.dispatchedMessageId, JSON.stringify(afterDispatch));
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
    check('"Dispatch now" delivers the message into the THREAD THE USER IS LOOKING AT',
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

    await click(`${rowSel} [data-action="sched-dispatch-message"]`);
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
  await click(sel('sched-manage-tab', { tab: 'precedence' }));
  await page.waitForTimeout(200);
  const stopBefore = await ev(() => { const s = window.PM56_SCHED.list(); return null; });
  await click(sel('sched-simulate-stop'));
  await page.waitForTimeout(250);
  const stopState = await ev(() => {
    const el = document.querySelector('[data-k="sched-precedence"]');
    return el ? el.textContent : null;
  });
  check('a manual Stop latches, visibly, in the Precedence panel', stopState && /Yes/.test(stopState), stopState);

  await click(sel('sched-manage-tab', { tab: 'quota' }));
  await page.waitForTimeout(200);
  await click(sel('sched-attempt-resume'));
  await page.waitForTimeout(250);
  const resumeEvent = await ev(() => window.PM56_SCHED.list().events[0]);
  check('an auto-resume attempt while manually stopped is REFUSED with a visible, stated reason',
    resumeEvent && resumeEvent.clause === 'manual_stop_latched' && /Manual Stop/i.test(resumeEvent.detail), JSON.stringify(resumeEvent));

  await click(sel('sched-manage-tab', { tab: 'precedence' }));
  await page.waitForTimeout(200);
  await click(sel('sched-race-demo'));
  await page.waitForTimeout(300);
  const raceEvent = await ev(() => window.PM56_SCHED.list().events[0]);
  check('a dispatch decided before a stop and delivered after it is discarded, not delivered',
    raceEvent && raceEvent.clause === 'manual_stop_latched', JSON.stringify(raceEvent));

  await click(sel('sched-clear-stop'));
  await page.waitForTimeout(250);
  const stopCleared = await ev(() => {
    const el = document.querySelector('[data-k="sched-precedence"]');
    return el ? el.textContent : null;
  });
  check('an explicit user resume clears the latch', stopCleared && /No/.test(stopCleared), stopCleared);
  await click(sel('sched-close-dialog'));
  await page.waitForTimeout(200);

  /* ================================================================
     7. QUOTA WAIT STRIP: reset truth AND its source shown together, opt-in
        auto-resume checkbox; unknown says `unknown`, never a countdown
        (packet §15.4, SQR-005 — owned by composer-state.js, consumed here)
     ================================================================ */
  await ensureWandOpen();
  await click(sel('cs-quota-demo'));
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
    await ensureWandOpen();
    await click(sel('cs-quota-source'));
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
