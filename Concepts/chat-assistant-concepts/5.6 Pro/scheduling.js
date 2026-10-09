/* scheduling.js — feature module.  OWNER: Plans/Scheduling_and_Quota_Resume.md
 * (Assistant-redesign wave, 2026-09-03).  Covers packet 01_IMPLEMENTATION_SPEC
 * §15 (Scheduling, execution windows, and quota resume) and 04_GUI_IMPACTS §15
 * (Scheduling GUI), and implements SQR-001..SQR-007 from the canonical owner.
 *
 * WHAT THIS FILE OWNS
 * -------------------
 *   RT.scheduling = { scheduledMessages, buildSchedules, quotaConsents, events,
 *                      stopEpoch, stopped, stopReason }
 * The frozen ScheduledMessageSnapshot (Schedule Message, wand menu), the exact-
 * version ExecutionSchedule for Plan builds (Build At…), execution windows with
 * wind-down and DST-safe recurrence, the shared eligibility predicate, the
 * automation precedence order (manual Stop beats everything automatic), and
 * QuotaResumeConsent scoped to run/provider/account. It does NOT own the quota
 * wait strip itself, Goal or Plan semantics, or composer/destination state —
 * those stay with composer-state.js, goals.js and plans.js respectively; this
 * module only consumes RT.composer and RT.quota, and reports contract requests
 * rather than editing those files (see the delivery report for the exact list).
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * -------------------------------
 * 1. NO CLIENT TIMER IS THE SCHEDULE. Nothing here runs on an interval. Every
 *    occurrence, wind-down boundary and DST resolution is COMPUTED on demand
 *    (dialog open / button press) from the stored IANA timezone and local wall
 *    time, exactly as a restart would recompute it server-side. The "advance
 *    window" control is an explicit, visible stand-in for a tick the product's
 *    real timer would deliver — clicking it is the whole demonstration.
 * 2. THE DST MATH IS REAL, NOT A HARD-CODED US ASSUMPTION. `tzTransitions()`
 *    walks the chosen IANA zone's actual offset for the whole year through
 *    `Intl.DateTimeFormat`, so Europe/London, Australia/Sydney (opposite
 *    hemisphere) and a no-DST zone like Asia/Kolkata each get a truthfully
 *    different summary line instead of a copy-pasted "clocks spring forward in
 *    March" sentence that would be wrong for three of the ten offered zones.
 * 3. THE HASH IS A DEMO STAND-IN, LABELLED AS ONE. `demoHash()` remains a short
 *    legacy fixture hash of "planId:version" — not a real content-address.
 *    It exists only so `exact_target_hash` is never blank and never random
 *    (newly committed builds use PM56_PLANS.hash of the actual document;
 *    legacy seed rows retain their old fixture hashes). Idempotency and
 *    invalidation stay internally consistent), and every place it renders
 *    calls it "hash" rather than implying provenance it does not have.
 * 4. QUOTA STATE IS CONSUMED, NOT DUPLICATED. `RT.quota` (waiting, resetSource,
 *    resetAt, resumeAutomatically) is composer-state.js's strip. This module
 *    reads it to run the shared eligibility predicate and to demonstrate a
 *    revalidated auto-resume attempt, and may update its fields the same way a
 *    provider signal would — but it never renders a second checkbox or a
 *    second strip. See the delivery report for the one integration request.
 * 5. RESTART SURVIVAL IS A REAL RELOAD, NOT A SIMULATION. `RT.scheduling`
 *    persists to localStorage after every mutation and reloads on boot, and the
 *    "Reload page now" control calls the browser's real `location.reload()`.
 *    The management dialog still states plainly that this is a client-local
 *    demo stand-in for a server-owned timer, not the timer itself.
 *
 * Namespace: actions `sched-*`, dialog types `sched-message` / `sched-build-at`
 * / `sched-manage`, runtime key `RT.scheduling`. Public surface:
 * `window.PM56_SCHED = { openBuildAt, list, restore, fixture }`.
 */
(function () {
  'use strict';
  var D = window.PM56_DATA; if (!D) return;
  var EXT = window.PM56_EXT; if (!EXT || !EXT.slot) return;
  var RT = window.PM56_RUNTIME = window.PM56_RUNTIME || {};
  /* Shared dialog grammar. module-shell loads first of all modules (build.py
     MODULES), so the builders exist before this module is evaluated. */
  var SH = window.PM56_SHELL;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function nowIso() { return new Date().toISOString(); }
  function pad2(n) { n = Math.floor(n); return (n < 10 ? '0' : '') + n; }
  function clamp(n, lo, hi) { n = Number(n); if (isNaN(n)) return lo; return Math.max(lo, Math.min(hi, n)); }

  /* =====================================================================
     0. SMALL HELPERS — thread/model lookups, hashing, day/time formatting
     ===================================================================== */
  /* Resolve against the LIVE thread list, not the fixture.
     app.js clones D.threads into state.threads at boot, so D.threads is a stale
     copy that nothing renders. Appending a dispatched message to it looked like
     a successful delivery in every internal check and never appeared in the
     transcript the user was looking at. ctx is threaded through where available;
     the fixture stays only as the last-resort fallback for a call with no ctx. */
  function threadByIdRaw(id) {
    /* No ctx parameter: several call sites are helpers with none in scope, and
       adding one there threw ReferenceError. EXT.ctx() reaches the live state
       from anywhere. */
    var c = EXT.ctx && EXT.ctx();
    var live = (c && c.state && c.state.threads) || null;
    var list = live || D.threads || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function modelById(id) {
    var list = D.models || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function attachmentLabel(a) {
    if (!a) return 'attachment';
    return a.name || a.filename || a.title || ('attachment ' + (a.id || ''));
  }

  /* Deterministic, non-cryptographic demo stand-in for a content hash. Same
     input always produces the same output, so repeated schedules against the
     same id+version stay internally consistent instead of drifting on every
     render — but it is never presented as a real content-address. */
  function demoHash(s) {
    s = String(s);
    var h = 5381;
    for (var i = 0; i < s.length; i++) { h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; }
    return h.toString(16);
  }

  var DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function daysSummary(days) {
    days = (days || []).slice().sort();
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && days.indexOf(0) < 0 && days.indexOf(6) < 0) return 'Weeknights (Mon–Fri)';
    if (days.length === 2 && days.indexOf(0) >= 0 && days.indexOf(6) >= 0) return 'Weekends (Sat–Sun)';
    if (!days.length) return 'No days selected';
    return days.map(function (d) { return DAY_LABELS[d]; }).join(', ');
  }
  function parseHHMM(s) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(s || ''));
    if (!m) return { h: 0, m: 0 };
    return { h: clamp(m[1], 0, 23), m: clamp(m[2], 0, 59) };
  }
  function to12h(hhmm) {
    var p = parseHHMM(hhmm);
    var ap = p.h >= 12 ? 'PM' : 'AM';
    var h12 = p.h % 12; if (h12 === 0) h12 = 12;
    return h12 + ':' + pad2(p.m) + ' ' + ap;
  }
  function fmtClock(iso) {
    if (!iso) return '';
    var d = new Date(iso); if (isNaN(d)) return '';
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  function fmtDay(iso) {
    if (!iso) return '';
    var d = new Date(iso); if (isNaN(d)) return '';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  /* =====================================================================
     1. TIME ZONES AND CLOCK CHANGES. The arithmetic is the one zone engine,
     scheduling-time.js (PM56_SCHEDULE_TIME: parts, resolve, next, windowAt,
     transitions, impact; IMPACT A2-14). This section only chooses the words.
     Nothing here runs on a tick: it is computed when a sheet renders or a
     demo control is pressed.
     ===================================================================== */
  /* IMPACT A1-42: one set of scheduling defaults. The message and build drafts and the grace a late slot waits
     all read these (they were literals in three places). Binding them to Settings IDs is settings work. */
  var SCHED_DEFAULTS = Object.freeze({
    message: Object.freeze({ leadMinutes: 120, missed: 'hold', graceMinutes: 30 }),
    build: Object.freeze({ kind: 'recurring_window', start: '22:00', stop: '02:00', days: Object.freeze([1, 2, 3, 4, 5]),
      oneTimeTime: '22:00', windDownMinutes: 10, autoResumeNext: true, missed: 'hold', graceMinutes: 30, topology: 'agent' })
  });

  /* The zones offered (G-33: one distinct line each). The device's own zone comes first and is the default;
     values stay IANA ids. */
  var TZ_OPTIONS = [
    { id: 'America/Los_Angeles', city: 'Los Angeles', region: 'Pacific' },
    { id: 'America/Denver', city: 'Denver', region: 'Mountain' },
    { id: 'America/Chicago', city: 'Chicago', region: 'Central' },
    { id: 'America/New_York', city: 'New York', region: 'Eastern' },
    { id: 'UTC', city: 'UTC', region: 'No daylight saving' },
    { id: 'Europe/London', city: 'London', region: 'UK time' },
    { id: 'Europe/Berlin', city: 'Berlin', region: 'Central European' },
    { id: 'Asia/Kolkata', city: 'Mumbai / Delhi', region: 'India, no daylight saving' },
    { id: 'Asia/Tokyo', city: 'Tokyo', region: 'Japan, no daylight saving' },
    { id: 'Australia/Sydney', city: 'Sydney', region: 'Eastern Australia' }
  ];
  function deviceZone() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } }
  function tzEntry(id) { for (var i = 0; i < TZ_OPTIONS.length; i++) if (TZ_OPTIONS[i].id === id) return TZ_OPTIONS[i]; return null; }
  function zoneCity(id) { var t = tzEntry(id); return t ? t.city : String(id || 'UTC').split('/').pop().replace(/_/g, ' '); }
  /* the short line a trigger shows under the city, and the full line a menu row shows */
  function zoneShort(id) { if (id === deviceZone()) return 'Your device’s zone'; var t = tzEntry(id); return t ? t.region : id; }
  function zoneLine(id) {
    if (id === deviceZone()) return 'Your device’s time zone' + (id === 'UTC' ? '' : ' (' + id + ')');
    if (id === 'UTC') return 'The same everywhere, no daylight saving';
    var t = tzEntry(id); return t ? t.region + ' (' + id + ')' : id;
  }
  /* log and toast wording (never a reading line in a sheet) */
  function tzLabel(id) { return zoneCity(id) + (id === 'UTC' || zoneCity(id) === id ? '' : ' (' + id + ')'); }

  function tzToUTC(iana,y,mo,d,h,mi){const r=PM56_SCHEDULE_TIME.resolve(iana,{y,mo,d,h,mi});return r.ok?r.at:NaN;}
  function nextOccurrenceUTC(iana,days,hh,mi,fromMs){return PM56_SCHEDULE_TIME.next(iana,days,hh,mi,fromMs);}
  /* this calendar year's clock changes in {instant, kind} form (the demo clock's jump control reads it) */
  function tzTransitions(iana, year) {
    return PM56_SCHEDULE_TIME.transitions(iana, Date.UTC(year, 0, 1), Date.UTC(year + 1, 0, 1)).map(function (c) { return { instant: c.at, kind: c.kind }; });
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function minuteClock(m) { m = ((m % 1440) + 1440) % 1440; return to12h(pad2(Math.floor(m / 60)) + ':' + pad2(m % 60)); }
  function spanWords(min) { min = Math.abs(min); return min === 60 ? '1 hour' : min % 60 === 0 ? (min / 60) + ' hours' : min + ' minutes'; }
  /* Clock changes, said plainly (8.8 G-21, the describeDst real-checkpoint fix). `slot` is the schedule the sheet
     would save: {kind:'recurring', start, stop, days, windDownMinutes} or {kind:'once', date, time}. Every change
     from the start of this year to twelve months ahead is weighed against the slot's REAL start, stop and wrap-up
     times and its nights (scheduling-time.js impact), never against an empty list. Returns {lines, relevant}:
     lines for the .sched-dst block (each keeps the canon tag "(spring-forward)" / "(fall-back)", or the words "has
     not observed a daylight-saving change"), and the one sentence the read-back adds when a change touches it. */
  function describeDst(zone, slot, noun) {
    var now = Date.now(), year = new Date(now).getUTCFullYear(), T = PM56_SCHEDULE_TIME;
    var ahead = T.transitions(zone, now, now + 366 * 86400000);
    if (!ahead.length) {
      var past = T.transitions(zone, Date.UTC(year, 0, 1), now).length;
      return { lines: [past ? 'No clock change is due in the next 12 months.' : zoneCity(zone) + ' has not observed a daylight-saving change this year.'], relevant: null };
    }
    var verb = noun === 'message' ? { start: 'sends' } : { start: 'starts', stop: 'stops', wrapup: 'stops starting new tasks' };
    var lines = [], quiet = [], relevant = null;
    ahead.forEach(function (c) {
      var tag = c.kind === 'spring_forward' ? 'spring-forward' : 'fall-back';
      var date = MONTHS[c.date.mo - 1] + ' ' + c.date.d, day = DAY_LABELS[T.weekday(c.date)] + ', ' + date;
      var hit = T.impact(c, slot);
      if (!hit) { quiet.push(date + ' (' + tag + ')'); return; }
      var head = c.shift > 0 ? 'Clocks jump forward on ' + day + ' (' + tag + '): ' + minuteClock(c.fromMin) + ' becomes ' + minuteClock(c.toMin)
        : 'Clocks fall back on ' + day + ' (' + tag + '): ' + minuteClock(c.toMin) + '–' + minuteClock(c.fromMin) + ' happens twice';
      var h = hit.hits[0];
      var tail = h ? (c.shift > 0 ? ', so that night it ' + verb[h.name] + ' at ' + minuteClock(c.toMin) + '.' : ', so that night it ' + verb[h.name] + ' at the first ' + minuteClock(h.minute) + '.')
        : ', so that night’s slot is ' + spanWords(c.shift) + (c.shift > 0 ? ' shorter.' : ' longer.');
      lines.push(head + tail);
      if (!relevant) relevant = (c.shift > 0 ? 'Clocks jump forward on ' : 'Clocks fall back on ') + date + tail;
    });
    if (quiet.length) lines.push(quiet.join(' and ') + (quiet.length > 1 ? ' don’t' : ' doesn’t') + (lines.length ? ' affect it either.' : ' shift ' + (slot.kind === 'once' ? 'this time.' : 'this slot.')));
    return { lines: lines, relevant: relevant };
  }
  /* "10 PM", "10:30 PM", and a slot "10 PM–2 AM" */
  function hourWord(s) { var p = parseHHMM(s), h = p.h % 12 || 12; return h + (p.m ? ':' + pad2(p.m) : '') + ' ' + (p.h >= 12 ? 'PM' : 'AM'); }
  function slotText(a, b) { return hourWord(a) + '–' + hourWord(b); }

  /* =====================================================================
     2. FIXTURES + PERSISTENCE
     ---------------------------------------------------------------------
     Seeded records reuse REAL ids from this wave's other fixtures where one
     exists (thread 'query', Plan 'ap-index' / 'ap-auth' from data.js+plans.js,
     Goal run 'run-query-perf' from goals.js, destination label from
     composer-state's D.composerDestinations) so the demo reads as one
     coherent scenario instead of five unrelated toy records. Nothing here
     reaches into those modules' state — it only copies stable id/label
     strings that were already public in their own fixtures.
     ===================================================================== */
  /* Local view/draft state only — never domain truth, never persisted. */
  var ui = { msgDraft: null, editingMsgId: null, buildDraft: null, buildDraftPlanId: null, buildDraftVersion: null, manageTab: 'messages', managerFilters:{},
    msgConfirm: null, buildConfirm: null, techOpen: null, openSeq: 0 };

  var STORE_KEY = 'pm56-scheduling.v1';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v);return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { } }
  };

  function seedFixture() {
    var t0 = '2026-09-03T02:00:00Z';
    /* The Scheduled seed sends at the next 10:00 PM Chicago time at least an hour away, so the demo's future bubble
       is really in the future whenever the page opens. The other seeds are history and keep their dates. */
    var digestMs = nextOccurrenceUTC('America/Chicago', [0, 1, 2, 3, 4, 5, 6], 22, 0, Date.now() + 3600000);
    var digestAt = isFinite(digestMs) && digestMs ? new Date(digestMs).toISOString() : '2026-09-04T03:00:00Z';
    return {
      demo: true,
      version: 1,
      /* SQR-001 precedence latch. Scoped to scheduling/quota automation only —
         a separate, deliberately independent latch from goals.js's own
         per-Goal stopEpoch, matching this document's own authority. */
      stopEpoch: 0,
      stopped: false,
      stopReason: null,
      stopAt: null,
      /* SQR-018 / DL-136: the project-wide "Pause all automations" switch, a separate record from the manual
         Stop latch above. Only cmd.runtime.automation_pause.set (setAutomationPause) changes it, and only a
         user actor may turn it off. It is never a Settings value. */
      automationPause: { paused: false, user_stop_epoch: 0, changed_by: null, changed_at: null, revision: 0 },
      scheduledMessages: [
        {
          scheduled_dispatch_id: 'sm-nightly-digest',
          project_id: 'pm', thread_id: 'query',
          destination_ref: null,
          text: 'Status check: has the write-amplification measurement for idx_events_tenant_created landed yet? If not, ping Schema Reviewer directly.',
          attachment_refs: [],
          requested_runtime: { modelId: 'sonnet46', modelName: 'Claude Sonnet 4.6', provider: 'Anthropic', account: 'Work · anthropic-work' },
          scheduled_at_utc: digestAt, timezone: 'America/Chicago', local_wall_time: '22:00',
          missed_policy: 'hold', grace_seconds: 1800,
          state: 'scheduled', expected_thread_currentness: 21, revision: 1,
          idempotencyKey: 'sm-nightly-digest', heldReason: null,
          dispatchedMessageId: null, dispatchedAt: null,
          createdAt: t0, updatedAt: t0
        },
        {
          scheduled_dispatch_id: 'sm-route-held',
          project_id: 'pm', thread_id: 'query',
          destination_ref: { kind: 'workflow', label: 'Crew · Query Performance', detail: '3 agents · coordinator', unresolvable: true },
          text: 'Crew, fold the concurrent-write-load check into tonight’s pass and report back before the window closes.',
          /* SMSG-007/008: frozen at COMMIT — exact content hash and version.
             The second entry is the case the correction exists for: the
             retained version is gone at dispatch, so the schedule HOLDS. It
             does not send whatever those bytes are now. */
          attachment_refs: [
            { name: 'benchmark.csv', kind: 'file', content_hash: 'sha-demo:9c14e0d2',
              artifact_version: 1, availability: 'available', demo: true },
            { name: 'load-profile.json', kind: 'file', content_hash: 'sha-demo:2b77af10',
              artifact_version: 3, availability: 'missing', demo: true,
              unavailable_note: 'The exact retained revision was deleted from the project after this schedule was committed.' }
          ],
          requested_runtime: { modelId: 'opus5', modelName: 'Claude Opus 5', provider: 'Anthropic', account: 'Work · anthropic-work' },
          scheduled_at_utc: '2026-09-03T04:30:00Z', timezone: 'America/Chicago', local_wall_time: '23:30',
          missed_policy: 'next_available', grace_seconds: 1800,
          state: 'held', expected_thread_currentness: 21, revision: 1,
          idempotencyKey: 'sm-route-held',
          heldReason: 'Recorded destination "Crew · Query Performance" is no longer resolvable (the crew run ended), and the retained revision of load-profile.json is missing. Holding the dispatch rather than substituting a different destination or newer bytes.',
          dispatch_attempts: [
            { attempt_id: 'sda-sm-route-held-1', at: '2026-09-03T04:30:05Z', outcome: 'held',
              requested_route: 'opus5 · Work · anthropic-work', effective_route: null,
              reason: 'destination_unresolvable + retained_attachment_missing' }
          ],
          dispatchedMessageId: null, dispatchedAt: null,
          createdAt: t0, updatedAt: '2026-09-03T04:30:05Z'
        },
        {
          scheduled_dispatch_id: 'sm-sent-rollout',
          project_id: 'pm', thread_id: 'query',
          destination_ref: null,
          text: 'Kick off the staged rollout for idx_events_tenant_created now that the write-amplification number is in.',
          /* SMSG-007: the snapshot is EXACT and frozen at commit. Dispatch
             retrieved this version, not whatever the artifact is now. */
          attachment_refs: [{ name:'rollout-plan.md', kind:'artifact', artifact_id:'art-rollout', artifact_version:'v2',
                              content_hash:'sha-demo:5f0c21ab', availability:'available', demo:true }],
          requested_runtime: { modelId: 'opus5', modelName: 'Claude Opus 5', provider: 'Anthropic', account: 'Work · anthropic-work' },
          scheduled_at_utc: '2026-09-03T01:00:00Z', timezone: 'America/Chicago', local_wall_time: '20:00',
          missed_policy: 'hold', grace_seconds: 1800,
          state: 'sent', expected_thread_currentness: 20, revision: 2,
          idempotencyKey: 'sm-sent-rollout', heldReason: null,
          /* SMSG-006: the card links the schedule to the message that was
             actually inserted, at the REAL dispatch time. */
          dispatchedMessageId: 'msg-query-rollout-kickoff', dispatchedAt: '2026-09-03T01:00:04Z',
          createdAt: t0, updatedAt: '2026-09-03T01:00:04Z'
        },
        {
          scheduled_dispatch_id: 'sm-failed-model',
          project_id: 'pm', thread_id: 'query',
          destination_ref: null,
          text: 'Re-run the tenant-size sweep against the new index and post the p99 table.',
          attachment_refs: [],
          requested_runtime: { modelId: 'kimi-k3-turbo', modelName: 'Kimi K3 Turbo', provider: 'Moonshot', account: 'Personal · moonshot' },
          scheduled_at_utc: '2026-09-03T03:15:00Z', timezone: 'America/Chicago', local_wall_time: '22:15',
          missed_policy: 'hold', grace_seconds: 1800,
          state: 'failed', expected_thread_currentness: 21, revision: 1,
          idempotencyKey: 'sm-failed-model',
          /* SMSG-011: an EXPLICIT model selection never silently falls back. */
          failureReason: 'Kimi K3 Turbo was unavailable at dispatch and this schedule names it explicitly, so no substitute was chosen. The failed attempt is preserved; editing and retrying creates a new attempt identity.',
          /* SMSG-013: the historical attempt is immutable evidence. A retry
             appends; it never rewrites this row. */
          dispatch_attempts: [
            { attempt_id: 'sda-sm-failed-model-1', at: '2026-09-03T03:15:02Z', outcome: 'failed',
              requested_route: 'kimi-k3-turbo · Personal · moonshot', effective_route: null,
              reason: 'Provider window exhausted on this account; no substitute was permitted.' }
          ],
          heldReason: null, dispatchedMessageId: null, dispatchedAt: null,
          createdAt: t0, updatedAt: '2026-09-03T03:15:02Z'
        },
        {
          scheduled_dispatch_id: 'sm-canceled-draft',
          project_id: 'pm', thread_id: 'query',
          destination_ref: null,
          text: 'Ask Schema Reviewer whether the partial index needs a matching statistics target.',
          attachment_refs: [],
          requested_runtime: { modelId: 'sonnet46', modelName: 'Claude Sonnet 4.6', provider: 'Anthropic', account: 'Work · anthropic-work' },
          scheduled_at_utc: '2026-09-05T03:00:00Z', timezone: 'America/Chicago', local_wall_time: '22:00',
          missed_policy: 'hold', grace_seconds: 1800,
          state: 'canceled', expected_thread_currentness: 21, revision: 2,
          idempotencyKey: 'sm-canceled-draft', heldReason: null,
          cancelReason: 'Cancelled by the user. The record is immutable audit history and survives hiding the card.',
          dispatchedMessageId: null, dispatchedAt: null,
          createdAt: t0, updatedAt: '2026-09-03T05:10:00Z'
        },
        {
          scheduled_dispatch_id: 'sm-expired-window',
          project_id: 'pm', thread_id: 'query',
          destination_ref: null,
          text: 'If the migration has not started by now, hold it until after the freeze.',
          attachment_refs: [],
          requested_runtime: { modelId: 'sonnet46', modelName: 'Claude Sonnet 4.6', provider: 'Anthropic', account: 'Work · anthropic-work' },
          scheduled_at_utc: '2026-09-02T04:00:00Z', timezone: 'America/Chicago', local_wall_time: '23:00',
          missed_policy: 'cancel_after_grace', grace_seconds: 1800,
          state: 'expired', expected_thread_currentness: 19, revision: 1,
          idempotencyKey: 'sm-expired-window', heldReason: null,
          expiredReason: 'The host was offline through the whole grace window and this schedule chose cancel_after_grace, so it expired rather than firing late.',
          dispatchedMessageId: null, dispatchedAt: null,
          createdAt: t0, updatedAt: '2026-09-02T04:30:00Z'
        }
      ],
      buildSchedules: [
        {
          schedule_id: 'bld-nightly-index',
          project_id: 'pm', target_kind: 'assistant_plan_run', target_id: 'ap-index',
          /* PSCHED-001..003: ONE frozen topology, and for `crew` a frozen
             CollaborationDefinition, so dispatch needs no unattended modal and
             never adopts whatever the Crew defaults happen to be later.
             Nothing runs until first eligible dispatch admission. */
          execution_topology: 'agent',
          topology_snapshot: { schema:'pm.schedule.plan_topology_snapshot.v1',
            execution_topology:'agent', collaboration_definition_ref:null,
            eligibility_policy:'window_and_quota_conjunction' },
          runtime_created: false,
          /* PSCHED-014: TWO idempotency domains, deliberately different keys.
             Repeated creation returns one schedule; repeated timer delivery
             admits one run. A wall-clock stamp is not a dedup key for either. */
          idempotency_key: 'sched:ap-index@V5:recurring_window:22:00:America/Chicago',
          dispatch_idempotency_key: 'dispatch:bld-nightly-index:occurrence',
          /* PSCHED-008: eligibility is the CONJUNCTION, evaluated, not a
             policy label. `eligible` is the AND and can never be either half. */
          eligibility: { window:{ satisfied:false, reason:'Outside 22:00–02:00 America/Chicago.' },
                         quota:{ satisfied:true,  reason:'Usage available.' },
                         permission:{ satisfied:true, reason:'Auto within ceiling.' },
                         eligible:false },
          /* PSCHED-009: recurrence RESUMES one unfinished run; it never starts
             a second one, and a terminal run ends the recurrence's claim. */
          resumes_run_id: null, stops_on_terminal: true,
          exact_target_version: 5, exact_target_hash: demoHash('ap-index:5'),
          schedule_kind: 'recurring_window',
          timezone: 'America/Chicago', local_start: '22:00', local_pause: '02:00',
          days_of_week: [1, 2, 3, 4, 5],
          /* the 10 min wind-down its own log names ("Stops starting new tasks at 1:50 AM") */
          wind_down_seconds: 600,
          binding_kind: 'plan_content_v1',
          state: 'active', revision: 1, invalidated_reason: null,
          pendingVersion: null, pendingHash: null,
          runPhase: 'idle', demoClockIso: t0, lastOccurrenceStart: null, occurrencesFired: [],
          log: [{ at: t0, text: 'Schedule created: recurring window 10:00 PM–2:00 AM America/Chicago, Mon–Fri, 10 min wind-down, auto-resume next window.' }],
          createdAt: t0, updatedAt: t0
        },
        {
          schedule_id: 'bld-auth-nightly',
          project_id: 'pm', target_kind: 'assistant_plan_run', target_id: 'ap-auth',
          /* PSCHED-001: EVERY Build At stores one exact topology. This record
             carried none, so a dispatcher reading it would have had to infer
             one -- which is the exact inference the correction forbids. */
          execution_topology: 'agent',
          topology_snapshot: { schema:'pm.schedule.plan_topology_snapshot.v1',
            execution_topology:'agent', collaboration_definition_ref:null,
            eligibility_policy:'window_and_quota_conjunction' },
          runtime_created: false,
          idempotency_key: 'sched:ap-auth@V2:one_time:01:00:America/Chicago',
          dispatch_idempotency_key: 'dispatch:bld-auth-nightly:one_time',
          eligibility: { window:{ satisfied:true, reason:'One-time 01:00 slot.' },
                         quota:{ satisfied:true, reason:'Usage available.' },
                         permission:{ satisfied:true, reason:'Auto within ceiling.' },
                         eligible:true },
          resumes_run_id: null, stops_on_terminal: true,
          exact_target_version: 2, exact_target_hash: demoHash('ap-auth:2'),
          schedule_kind: 'one_time',
          timezone: 'America/Chicago', local_start: '01:00', local_pause: null, scheduled_at_utc: '2026-09-03T06:00:00Z',
          days_of_week: [],
          wind_down_seconds: 600, missed_policy: 'hold', auto_resume_next_window: false,
          state: 'invalidated',
          invalidated_reason: 'Plan ap-auth was revised from V2 (hash ' + demoHash('ap-auth:2') + ') to V3 (hash ' + demoHash('ap-auth:3') + ') after this schedule was created.',
          pendingVersion: 3, pendingHash: demoHash('ap-auth:3'),
          revision: 2,
          runPhase: 'idle', demoClockIso: t0, lastOccurrenceStart: null, occurrencesFired: [],
          log: [
            { at: t0, text: 'Schedule created: one-time build at 1:00 AM America/Chicago.' },
            { at: '2026-09-03T05:10:00Z', text: 'Invalidated: Plan ap-auth was revised from V2 to V3. Automatic dispatch disabled until an explicit rebind.' }
          ],
          createdAt: t0, updatedAt: '2026-09-03T05:10:00Z'
        },
        /* PSCHED-002: a CREW scheduled build. The validated
           CollaborationDefinition, its revision, the requested AND effective
           assignments, the permission ceiling and the limits all freeze at
           schedule commit, so dispatch needs no unattended modal and cannot
           adopt whatever the Crew defaults happen to be that night. */
        {
          schedule_id: 'bld-crew-embeds',
          project_id: 'pm', target_kind: 'assistant_plan_run', target_id: 'ap-embeds',
          execution_topology: 'crew',
          topology_snapshot: { schema:'pm.schedule.plan_topology_snapshot.v1',
            execution_topology:'crew',
            collaboration_definition_ref:'collabdef:crew@rev4',
            collaboration_definition_revision:4,
            assignments:[
              { slot_id:'coordinator', required:true, requested_identity:'model:claude-opus-5', effective_identity:'model:claude-opus-5' },
              { slot_id:'member-1',    required:true, requested_identity:'model:claude-sonnet-5', effective_identity:'model:claude-sonnet-5' },
              { slot_id:'member-2',    required:false, requested_identity:'model:claude-haiku-4-5', effective_identity:'model:claude-haiku-4-5' }
            ],
            permission_ceiling:'Auto',
            limits:{ time_limit_minutes:45, token_limit:400000, cost_limit_usd:6 },
            eligibility_policy:'window_and_quota_conjunction' },
          runtime_created: false,
          idempotency_key: 'sched:ap-embeds@V1:one_time:23:30:America/Chicago',
          dispatch_idempotency_key: 'dispatch:bld-crew-embeds:one_time',
          eligibility: { window:{ satisfied:true, reason:'One-time 23:30 slot.' },
                         quota:{ satisfied:false, reason:'Usage exhausted until the 04:00 reset.' },
                         permission:{ satisfied:true, reason:'Auto within ceiling.' },
                         eligible:false },
          resumes_run_id: null, stops_on_terminal: true,
          exact_target_version: 1, exact_target_hash: demoHash('ap-embeds:1'),
          schedule_kind: 'one_time',
          timezone: 'America/Chicago', local_start: '23:30', local_pause: null, scheduled_at_utc: '2026-09-04T04:30:00Z',
          days_of_week: [],
          wind_down_seconds: 600, missed_policy: 'hold', auto_resume_next_window: false,
          state: 'active', revision: 1, invalidated_reason: null,
          pendingVersion: null, pendingHash: null,
          runPhase: 'idle', demoClockIso: t0, lastOccurrenceStart: null, occurrencesFired: [],
          log: [{ at: t0, text: 'Schedule created: one-time Crew build at 11:30 PM. CollaborationDefinition rev 4 frozen with three assignments; no CrewRun exists yet.' }],
          createdAt: t0, updatedAt: t0
        },
        /* PSCHED-013: an admission that FAILED. The schedule record and the
           exact reason survive for repair or cancellation, and no PlanRun,
           Goal or CrewRun was left behind -- the failure mode this row exists
           to make checkable is a half-created run with a Building… card. */
        {
          schedule_id: 'bld-flags-held',
          project_id: 'pm', target_kind: 'assistant_plan_run', target_id: 'ap-flags',
          execution_topology: 'goal_driven',
          topology_snapshot: { schema:'pm.schedule.plan_topology_snapshot.v1',
            execution_topology:'goal_driven', collaboration_definition_ref:null,
            eligibility_policy:'window_and_quota_conjunction' },
          runtime_created: false,
          plan_run_id: null, goal_id: null, crew_run_id: null,
          idempotency_key: 'sched:ap-flags@V1:one_time:02:15:America/Chicago',
          dispatch_idempotency_key: 'dispatch:bld-flags-held:one_time',
          eligibility: { window:{ satisfied:true, reason:'One-time 02:15 slot.' },
                         quota:{ satisfied:true, reason:'Usage available.' },
                         permission:{ satisfied:false, reason:'The worktree this Plan names no longer exists.' },
                         eligible:false },
          resumes_run_id: null, stops_on_terminal: true,
          exact_target_version: 1, exact_target_hash: demoHash('ap-flags:1'),
          schedule_kind: 'one_time',
          timezone: 'America/Chicago', local_start: '02:15', local_pause: null, scheduled_at_utc: '2026-09-03T07:15:00Z',
          days_of_week: [],
          wind_down_seconds: 600, missed_policy: 'hold', auto_resume_next_window: false,
          state: 'held',
          held_reason: 'Admission refused: the worktree feature/flags named by this Plan no longer exists. No PlanRun, Goal or CrewRun was created; the schedule is intact for repair or cancellation.',
          invalidated_reason: null,
          revision: 1, pendingVersion: null, pendingHash: null,
          runPhase: 'idle', demoClockIso: t0, lastOccurrenceStart: null, occurrencesFired: [],
          log: [
            { at: t0, text: 'Schedule created: one-time goal-driven build at 2:15 AM.' },
            { at: '2026-09-03T07:15:00Z', text: 'Held at first dispatch: worktree predicate false. Nothing partial was admitted.' }
          ],
          createdAt: t0, updatedAt: '2026-09-03T07:15:00Z'
        }
      ],
      quotaConsents: [
        {
          consent_id: 'qrc-query-perf', run_id: 'run-query-perf',
          provider_id: 'Anthropic', account_id: 'anthropic-work',
          enabled: false, reset_time: null, reset_truth: 'unknown', confidence: null,
          execution_schedule_id: 'bld-nightly-index', user_stop_epoch: 0,
          created_at: t0, updated_at: t0
        }
      ],
      events: [
        { id: 'ev-1', at: t0, type: 'execution_window.created', ref: 'bld-nightly-index', clause: null, detail: 'Recurring window created: 10:00 PM–2:00 AM America/Chicago, Mon–Fri.' },
        { id: 'ev-2', at: '2026-09-03T05:10:00Z', type: 'execution_window.invalidated', ref: 'bld-auth-nightly', clause: 'target_version_changed', detail: 'Plan ap-auth revised V2 → V3 after the schedule was created.' },
        { id: 'ev-3', at: '2026-09-03T04:30:05Z', type: 'scheduled_dispatch.held', ref: 'sm-route-held', clause: 'route_unavailable', detail: 'Recorded destination no longer resolvable; held rather than substituted.' }
      ],
      lastSavedAt: null
    };
  }
  var SEED_JSON = JSON.stringify(seedFixture());
  /* IMPACT A3-03: one provenance predicate. A schedule record is a 'seed' (this concept's fixture) or 'wand' (made
     through the Schedule Message or Build At sheet, including the guided demos, which drive those same sheets).
     Scheduling has no recordings, so it never answers 'recorded'. */
  var SEED_IDS = (function () { var o = {}, f = JSON.parse(SEED_JSON); f.scheduledMessages.forEach(function (m) { o[m.scheduled_dispatch_id] = 1; }); f.buildSchedules.forEach(function (b) { o[b.schedule_id] = 1; }); return o; })();

  function loadPersisted() {
    var raw = store.get(STORE_KEY);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.scheduledMessages) || !Array.isArray(parsed.buildSchedules)) return null;
      return parsed;
    } catch (e) { return null; }
  }
  RT.scheduling = RT.scheduling || loadPersisted() || JSON.parse(SEED_JSON);
  /* Defensive: an older persisted shape loaded before a field existed. */
  (function backfill() {
    var S = RT.scheduling;
    if (!Array.isArray(S.events)) S.events = [];
    if (!Array.isArray(S.quotaConsents)) S.quotaConsents = [];
    if (typeof S.stopEpoch !== 'number') S.stopEpoch = 0;
    if (!S.automationPause || typeof S.automationPause.user_stop_epoch !== 'number') S.automationPause = { paused: false, user_stop_epoch: 0, changed_by: null, changed_at: null, revision: 0 };
    S.scheduledMessages.forEach(function (m) { if (!m.idempotencyKey) m.idempotencyKey = m.scheduled_dispatch_id; });
    S.buildSchedules.forEach(function (b) {
      if (!Array.isArray(b.occurrencesFired)) b.occurrencesFired = [];
      if (!b.runPhase) b.runPhase = 'idle';
      if (!b.demoClockIso) b.demoClockIso = nowIso();
      if (!b.log) b.log = [];
      /* A one_time record persisted before scheduled_at_utc existed would
         render "Invalid time value"; derive it from the local wall time. */
      if (b.schedule_kind === 'one_time' && !Number.isFinite(Date.parse(b.scheduled_at_utc || ''))) {
        var hh = parseHHMM(b.local_start);
        var from = Date.parse(b.createdAt || b.demoClockIso || nowIso()) - 60000;
        var at = Number.isFinite(from) ? nextOccurrenceUTC(b.timezone, [0, 1, 2, 3, 4, 5, 6], hh.h, hh.m, from) : null;
        if (at) b.scheduled_at_utc = new Date(at).toISOString();
      }
    });
  })();

  function P() { return RT.scheduling; }
  function persistNow() {
    if(window.PM56_TX?.isActive()){window.PM56_TX.defer(persistNow);return;}
    try {
      var out = JSON.parse(JSON.stringify(P()));
      out.lastSavedAt = nowIso();
      ui.persistenceAvailable=store.set(STORE_KEY, JSON.stringify(out));
      if(ui.persistenceAvailable)P().lastSavedAt=out.lastSavedAt;
    } catch (err) { console.info('PM56 scheduling: not persisted this tick', err); }
  }
  function restoreFixture() {
    RT.scheduling = JSON.parse(SEED_JSON);
    store.del(STORE_KEY);
    ui.msgDraft=null;ui.buildDraft=null;ui.editingMsgId=null;ui.editingBuildId=null;ui.focusSchedule=null;ui.cardOpen={};ui.manageTab='messages';ui.msgConfirm=null;ui.buildConfirm=null;ui.techOpen=null;
  }

  function findMessage(id) {
    var list = P().scheduledMessages;
    for (var i = 0; i < list.length; i++) if (list[i].scheduled_dispatch_id === id) return list[i];
    return null;
  }
  function findBuild(id) {
    var list = P().buildSchedules;
    for (var i = 0; i < list.length; i++) if (list[i].schedule_id === id) return list[i];
    return null;
  }
  function buildsForTarget(planId) {
    return P().buildSchedules.filter(function (b) { return b.target_id === planId; });
  }
  function logEvent(type, ref, clause, detail) {
    var S = P();
    S.events.unshift({ id: 'ev-' + (S.events.length + 1) + '-' + Date.now().toString(36), at: nowIso(), type: type, ref: ref, clause: clause || null, detail: detail });
    if (S.events.length > 60) S.events.length = 60;
  }
  function logBuildLine(rec, text) {
    rec.log.unshift({ at: nowIso(), text: text });
    if (rec.log.length > 40) rec.log.length = 40;
  }

  /* =====================================================================
     3. PRECEDENCE — SQR-001. Automation may never clear a manually-latched
     stop; only an explicit user resume (clearStop) does. Every eligibility
     check captures the epoch it decided against and re-compares it, so a
     decision made just before a stop and delivered after it is discarded.
     ===================================================================== */
  function latchStop(reason) {
    var S = P();
    S.stopped = true;
    S.stopEpoch += 1;
    S.stopReason = reason || 'Manual Stop';
    S.stopAt = nowIso();
    logEvent('runtime.quota_resume_attempted', 'precedence', 'manual_stop_latched', 'Manual Stop latched at epoch ' + S.stopEpoch + '. Every scheduled dispatch, window resume and quota auto-resume now refuses until an explicit resume.');
  }
  function clearStop() {
    var S = P();
    S.stopped = false;
    S.stopReason = null;
    for(const b of S.buildSchedules)if(['active','paused','held'].includes(b.state)&&!b.dispatchReceipt)b.user_stop_epoch=S.stopEpoch;
    logEvent('runtime.quota_resume_attempted', 'precedence', null, 'Manual Stop cleared by explicit user action at epoch ' + S.stopEpoch + '. Nothing automatic could have done this.');
  }

  /* SQR-018 / DL-136 — "Pause all automations", the project-wide switch (cmd.runtime.automation_pause.set).
     Turning it on advances the project's own user_stop_epoch; every scheduled message, scheduled build, window
     resume and quota resume in the project then fails the eligibility clause project_automation_paused. It
     cancels nothing, invalidates nothing and releases no per-run latch. Only a user actor turns it off; setting
     the value it already has returns the record unchanged. Work the user starts directly (Send now, Build) is
     not an automation and is not held. */
  function autoPause() { return P().automationPause; }
  function projectId() { var c = EXT.ctx && EXT.ctx(), sc = c && window.PM56_GOAL && PM56_GOAL.scope ? PM56_GOAL.scope(c.state.selectedThread) : null; return sc && sc.projectId || 'project'; }
  function setAutomationPause(paused, actor) {
    var A = autoPause(), want = !!paused;
    if ((actor || 'user') !== 'user') return { ok: false, error: 'permission_denied', detail: 'Only you can turn Pause all automations on or off.' };
    if (A.paused === want) return { ok: true, unchanged: true, record: copy(A) };
    if (want) A.user_stop_epoch += 1;
    A.paused = want; A.changed_by = 'user'; A.changed_at = nowIso(); A.revision += 1;
    logEvent('runtime.automation_pause_changed', projectId(), null, (want ? 'Turned on' : 'Turned off') + ' by you at project epoch ' + A.user_stop_epoch + '.');
    if (!want) releaseAfterPause();
    persistNow();
    return { ok: true, record: copy(A) };
  }
  /* switch-off: nothing is dispatched by the switch itself, and each item it held is judged again by the one
     predicate, once. A message whose send time came while the switch was on follows its own missed policy:
     hold -> stays held, naming the missed time; next_available, or cancel_after_grace still within grace ->
     back to scheduled and dispatched once through both checks; past grace -> expired. Builds re-capture the
     project epoch and are started by their own window tick when the predicate passes (no backlog burst). */
  function releaseAfterPause() {
    var S = P(), A = S.automationPause, now = Date.now();
    S.buildSchedules.forEach(function (b) { if (b.held_reason === PAUSE_HELD) b.held_reason = null; if (['active', 'paused', 'held'].indexOf(b.state) >= 0 && !b.dispatchReceipt) b.project_stop_epoch = A.user_stop_epoch; });
    S.scheduledMessages.forEach(function (m) {
      var a = (m.dispatch_attempts || []).slice(-1)[0], code = a && a.result && (a.result.error || a.result.clause);
      if (m.state !== 'held' || code !== 'project_automation_paused') return;
      if (m.missed_policy === 'hold') {
        m.dispatch_attempts = m.dispatch_attempts.concat({ attempt_id: m.scheduled_dispatch_id + ':pause-off:' + A.revision, at: new Date(now).toISOString(),
          result: { ok: false, error: 'missed_time_held', held: true, detail: 'The send time came while Pause all automations was on. You asked us to check with you first.' } });
        m.heldReason = 'The send time was missed while Pause all automations was on.'; m.updatedAt = nowIso(); return;
      }
      /* the demo clock may be ahead of the wall clock (the explicit local clock controls): never earlier than the held check */
      m.state = 'scheduled'; m.heldReason = null; m.updatedAt = nowIso();
      dispatchMessageAt(m.scheduled_dispatch_id, Math.max(now, Date.parse(a.at) || 0));
    });
  }
  /* the pause clause for an automatic dispatch; userStarted work (Send now) is exempt (SQR-006) */
  function pauseGate(pauseEpochAtDecision, userStarted) {
    var A = autoPause();
    if (userStarted) return { ok: true };
    if (pauseEpochAtDecision != null && pauseEpochAtDecision !== A.user_stop_epoch) return { ok: false, clause: 'project_automation_paused', detail: 'Decided before Pause all automations was turned on (project epoch ' + pauseEpochAtDecision + ', now ' + A.user_stop_epoch + '). Discarded rather than delivered.' };
    if (A.paused) return { ok: false, clause: 'project_automation_paused', detail: 'Pause all automations is on for this project (turned on by you at project epoch ' + A.user_stop_epoch + '). Only you can turn it off.' };
    return { ok: true };
  }

  /* =====================================================================
     4. SHARED ELIGIBILITY PREDICATE — SQR-006. One function, three kinds,
     used before every scheduled message dispatch, build-schedule window
     admission, and quota auto-resume attempt. Returns the exact failed
     clause so a refusal is always actionable, never silent.
     ===================================================================== */
  function evaluateEligibility(kind, rec, epochAtDecision, pauseEpochAtDecision, userStarted) {
    var S = P();
    /* Race check first: a decision computed against an older epoch is the
       more specific, more actionable diagnostic than the generic "stopped"
       state, and this is the clause SQR-001's race demo exists to surface. */
    if (epochAtDecision != null && epochAtDecision !== S.stopEpoch) {
      return { ok: false, clause: 'manual_stop_latched', detail: 'This dispatch was decided at epoch ' + epochAtDecision + ', but the stop epoch is now ' + S.stopEpoch + '. Discarded rather than delivered.' };
    }
    if (S.stopped) {
      return { ok: false, clause: 'manual_stop_latched', detail: 'Manual Stop is latched at epoch ' + S.stopEpoch + (S.stopReason ? (' — ' + S.stopReason) : '') + '.' };
    }
    var pz = pauseGate(pauseEpochAtDecision, userStarted); if (!pz.ok) return pz;
    if (kind === 'message') {
      if (['cancelled','canceled'].includes(rec.state)) return { ok: false, clause: 'schedule_not_found', detail: 'This scheduled message was cancelled and is retained only for audit.' };
      if (['dispatched','sent'].includes(rec.state)) return { ok: false, clause: 'dispatch_already_started', detail: 'Already dispatched under idempotency key "' + rec.idempotencyKey + '"; the original result is returned rather than sending again.' };
      if (rec.state === 'expired') return { ok: false, clause: 'stale_schedule_revision', detail: 'This dispatch expired under its cancel-after-grace policy.' };
      var th = threadByIdRaw(rec.thread_id);
      if (!th) return { ok: false, clause: 'target_not_found', detail: 'The owning thread no longer resolves.' };
      if (rec.destination_ref && rec.destination_ref.unresolvable) {
        return { ok: false, clause: 'route_unavailable', detail: 'Recorded destination "' + rec.destination_ref.label + '" is no longer resolvable. Holding rather than substituting a different destination, model or account.' };
      }
      return { ok: true, clause: null, detail: 'Destination, route and thread all resolve as recorded.' };
    }
    if (kind === 'build') {
      if (rec.state === 'invalidated') return { ok: false, clause: 'target_version_changed', detail: rec.invalidated_reason || 'The bound Plan version changed.' };
      if (['cancelled','canceled'].includes(rec.state)) return { ok: false, clause: 'schedule_not_found', detail: 'This build schedule was cancelled.' };
      if (rec.state === 'completed') return { ok: false, clause: 'dispatch_already_started', detail: 'This one-time schedule already completed.' };
      return { ok: true, clause: null, detail: 'Exact Plan version and hash are current; no invalidation is pending.' };
    }
    if (kind === 'quota') {
      if (!RT.quota || !RT.quota.resumeAutomatically) return { ok: false, clause: 'quota_unavailable', detail: 'Auto-resume is not opted in for this run.' };
      if (RT.quota.resetSource === 'unknown') return { ok: false, clause: 'reset_truth_unknown', detail: 'Reset time is unknown, so eligibility cannot confirm the provider window reopened.' };
      if (RT.quota.waiting) return { ok: false, clause: 'quota_unavailable', detail: 'Provider usage is still exhausted.' };
      return { ok: true, clause: null, detail: 'Provider usage window is open and the reset truth is ' + RT.quota.resetSource + '.' };
    }
    return { ok: true, clause: null, detail: 'Eligible.' };
  }

  /* Batch 18: session-local implementations of the existing scheduling
     owner commands. Native persistence/timers/providers are not claimed. */
  const messageReceivers=new Map(),messageDestinations=new Map();
  const copy=x=>JSON.parse(JSON.stringify(x));
  const identical=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const frozen=x=>window.PM56_ARTIFACTS.freeze(copy(x));
  function msgBinding(m){return {thread_id:m.thread_id,project_id:m.project_id,text:m.text,destination_ref:m.destination_ref,attachment_refs:m.attachment_refs,requested_runtime:m.requested_runtime,scope_snapshot:m.scope_snapshot,permission_snapshot:m.permission_snapshot,scheduled_at_utc:m.scheduled_at_utc,timezone:m.timezone,local_wall_time:m.local_wall_time,missed_policy:m.missed_policy,grace_seconds:m.grace_seconds};}
  function msgCurrent(m){return window.PM56_ARTIFACTS.key({binding:msgBinding(m),revision:m.revision,state:m.state,dispatchedMessageId:m.dispatchedMessageId});}
  function captureMessage(id){const m=findMessage(id);return m?{id,revision:m.revision,currentness:msgCurrent(m)}:null;}
  const msgError=(error,detail)=>({ok:false,error,clause:error,detail:detail||error.replaceAll('_',' ')});
  function scopeMessage(tid){const t=threadByIdRaw(tid);return !t||t.archived||t.deleted?null:window.PM56_GOAL.scope(tid);}
  function resolveScheduledAttachments(items,scope){
    const out=[];
    for(const a of items||[]){
      const ref=a.snapshot_ref||a.artifact_ref||(a.artifact_id?{artifact_id:a.artifact_id,artifact_version:a.artifact_version,project_id:a.project_id||scope.projectId,thread_id:a.thread_id||scope.threadId}:null);
      if(!ref||ref.thread_id!==scope.threadId||ref.project_id!==scope.projectId)return msgError('attachment_snapshot_required','An attachment has no exact retained revision in this thread. Keep it in the composer until it can be frozen.');
      const resolved=window.PM56_ARTIFACTS.resolve(ref,{document:true});
      if(!resolved.ok)return msgError('attachment_'+resolved.error,'The exact attachment revision is unavailable; no newer bytes were substituted.');
      /* B19: reference captures pin the frozen content hash in payload, not in
         the revision content_key (which covers the whole capture record). */
      const revRec19=resolved.revision.record;
      const pinned19=revRec19.renderer_kind==='reference_capture'?(revRec19.payload&&revRec19.payload.captured_hash):resolved.revision.content_key;
      if(a.content_hash&&a.content_hash!==pinned19)return msgError('attachment_hash_changed');
      /* B19: normalize to the SAME pinned hash that was verified — the
         revision content_key for byte snapshots, the captured hash for
         reference captures. Pinning a capture to its content_key would
         substitute the capture record's own hash for the frozen content. */
      const snapshotCheck=window.PM56_ATTACHMENTS?.inspectScheduleSnapshot?.(ref);
      if(snapshotCheck&&!snapshotCheck.ok)return msgError(snapshotCheck.error,snapshotCheck.detail);
      if(a.folder_manifest_hash&&snapshotCheck?.manifest_sha256!==a.folder_manifest_hash)return msgError('folder_manifest_changed');
      out.push({id:a.id||ref.artifact_id,name:attachmentLabel(a),kind:a.kind||'file',artifact_id:ref.artifact_id,artifact_version:ref.artifact_version,content_hash:pinned19,folder_manifest_hash:a.folder_manifest_hash||null,snapshot_ref:copy(ref),availability:'available',state:'ready'});
    }
    return {ok:true,items:out};
  }
  function prepareMessage(ctx,d){
    if(!d||typeof d.text!=='string'||!d.text.trim()||d.text.length>8000)return msgError('invalid_message_text');
    const wall=PM56_SCHEDULE_TIME.parse(d.date,d.time),time=PM56_SCHEDULE_TIME.resolve(d.timezone,wall);
    if(!time.ok)return time;
    if(time.at<=Date.now())return msgError('time_not_future');
    if(!['hold','next_available','cancel_after_grace'].includes(d.missed))return msgError('invalid_missed_policy');
    if(!Number.isFinite(Number(d.grace))||Number(d.grace)<1||Number(d.grace)>1440)return msgError('invalid_grace');
    const scope=scopeMessage(d.threadId);if(!scope)return msgError('target_not_found');
    if(d.sourceScope&&!identical(d.sourceScope,scope))return msgError('scope_changed');
    if(d.browser_context_refs?.length)return msgError('live_browser_context_not_schedulable','Freeze browser context as an attachment first. No future live selector is scheduled.');
    if(d.workflow_config||d.held_request)return msgError('workflow_configuration_requires_its_owner');
    let destination=copy(d.destination||{kind:'assistant',thread_id:d.threadId,label:threadByIdRaw(d.threadId).title});
    if(destination.kind!=='assistant'&&!messageDestinations.has(destination.kind))return msgError('destination_owner_unavailable','This destination cannot accept a frozen scheduled message. Nothing was redirected to the Assistant.');
    if(destination.kind==='assistant'&&destination.thread_id&&destination.thread_id!==d.threadId)return msgError('destination_scope_mismatch');
    if(destination.unresolvable)return msgError('route_unavailable');
    if(destination.kind!=='assistant'){
      const owner=messageDestinations.get(destination.kind);
      if(!destination.scheduled_binding&&owner.freeze){const prepared=owner.freeze(destination,scope);if(!prepared?.ok)return msgError(prepared?.error||'destination_unavailable');destination=prepared.destination;}
      const check=owner.validate(destination,scope);if(!check?.ok)return msgError(check?.error||'destination_unavailable');
    }
    const m=modelById(d.modelId);if(!m||m.status!=='ready')return msgError('route_unavailable','The selected model or account is unavailable. No fallback was chosen.');
    const attachments=resolveScheduledAttachments(d.attachments,scope);if(!attachments.ok)return attachments;
    return {ok:true,binding:{thread_id:d.threadId,project_id:scope.projectId,text:d.text,destination_ref:destination,attachment_refs:attachments.items,
      requested_runtime:{modelId:m.id,modelName:m.name,provider:m.provider,accountId:m.accountId,account:m.account,resolver_policy:'frozen_at_commit'},
      scope_snapshot:scope,permission_snapshot:ctx.state.permissions,scheduled_at_utc:new Date(time.at).toISOString(),timezone:d.timezone,local_wall_time:d.time,
      missed_policy:d.missed,grace_seconds:Math.round(Number(d.grace)*60)},time};
  }
  function saveMessage(ctx,d,editingId){
    const prepared=prepareMessage(ctx,d);if(!prepared.ok)return prepared;
    const old=editingId&&findMessage(editingId),requestKey=d.requestKey;
    if(!requestKey)return msgError('idempotency_key_required');
    const fingerprint=JSON.stringify(prepared.binding),previous=(P().messageRequests||{})[requestKey];
    if(previous)return previous.fingerprint===fingerprint?{ok:true,replayed:true,record:findMessage(previous.id)}:msgError('idempotency_conflict');
    if(editingId&&(!old||!messageProjection(old).can_edit))return msgError('dispatch_already_started');
    if(editingId&&(d.expectedRevision!==old.revision||d.expectedCurrentness!==msgCurrent(old)))return msgError('stale_schedule_revision');
    if(!editingId&&(!d.sourceBuffer||!window.PM56_COMPOSER_STATE.matchesScheduleCapture(ctx,d.sourceBuffer)))return msgError('composer_changed','The composer changed while this form was open. Reopen Schedule Message; your current text and attachments are intact.');
    const id=editingId||ctx.uid('sm'),TX=window.PM56_TX;
    return TX.run(()=>{
      const record={...(old||{}),...prepared.binding,binding_kind:'scheduled_message_v2',scheduled_dispatch_id:id,revision:old?old.revision+1:1,state:'scheduled',
        idempotencyKey:old?.idempotencyKey||id,heldReason:null,failureReason:null,createdAt:old?.createdAt||nowIso(),updatedAt:nowIso(),
        dispatchedMessageId:null,dispatchedAt:null,dispatch_attempts:old?.dispatch_attempts||[],history:(old?.history||[]).concat(old?[{revision:old.revision,snapshot:copy(msgBinding(old)),state:old.state,at:old.updatedAt}]:[]),
        user_stop_epoch:P().stopEpoch,scheduled_resolution:prepared.time.kind,session_only:true};
      record.snapshot_key=window.PM56_ARTIFACTS.key(msgBinding(record));
      record.attachment_refs=frozen(record.attachment_refs);record.destination_ref=frozen(record.destination_ref);record.requested_runtime=frozen(record.requested_runtime);record.scope_snapshot=frozen(record.scope_snapshot);
      for(const a of record.attachment_refs){const r=PM56_ARTIFACTS.retain(a.snapshot_ref,{kind:'scheduled_message',id});if(!r.ok)TX.fail(r.error);}
      // Revalidate after returning owner helpers, before the final local writes.
      if(!scopeMessage(record.thread_id)||!identical(scopeMessage(record.thread_id),record.scope_snapshot))TX.fail('scope_changed');
      if(editingId&&(findMessage(editingId)!==old||d.expectedRevision!==old.revision||d.expectedCurrentness!==msgCurrent(old)))TX.fail('stale_schedule_revision');
      const cleared=!editingId?PM56_COMPOSER_STATE.consumeScheduled(ctx,d.sourceBuffer):{ok:true};if(!cleared.ok)TX.fail(cleared.error);
      if(old){for(const [k,v] of Object.entries(record))TX.set(old,k,v);}else{
        TX.set(P(),'scheduledMessages',P().scheduledMessages.concat(record));
        ctx.appendMessage({id:'sched-card-'+id,role:'system',type:'sched-message',scheduleId:id,time:record.createdAt},threadByIdRaw(record.thread_id));
      }
      TX.set(P(),'messageRequests',{...(P().messageRequests||{}),[requestKey]:{id,fingerprint}});
      TX.set(P(),'events',[{id:'event-'+id+'-r'+record.revision,at:nowIso(),type:old?'scheduled_dispatch.updated':'scheduled_dispatch.created',ref:id,clause:null,detail:'Exact session-local snapshot committed; no message has been dispatched.'},...P().events]);
      persistNow();return {ok:true,record:old||record,replayed:false};
    });
  }
  // Read selected File bytes before entering the synchronous shared transaction.
  // A cancelled/edited form can never publish detached snapshots or clear text.
  async function saveMessageWithSnapshots(d,editingId,stillCurrent=()=>true){
    if(!d)return msgError('invalid_request');
    const captured=copy(d);
    const needs=(captured.attachments||[]).some(a=>!a.snapshot_ref&&!a.artifact_ref&&!a.artifact_id);
    if(!needs)return stillCurrent()?saveMessage(EXT.ctx(),captured,editingId):msgError('schedule_form_changed');
    const prior=P().messageRequests?.[captured.requestKey];
    if(prior)return prior.selection_request===JSON.stringify(captured)?{ok:true,replayed:true,record:findMessage(prior.id)}:msgError('idempotency_conflict');
    if(editingId)return msgError('attachment_snapshot_required','Edit retains the existing snapshot. Select new files in the composer for a new schedule.');
    const prepared=await window.PM56_ATTACHMENTS.prepareScheduleSnapshots(captured);
    if(!prepared.ok)return prepared;
    if(!stillCurrent()||JSON.stringify(d)!==JSON.stringify(captured))return msgError('schedule_form_changed');
    return PM56_TX.run(()=>{
      if(!stillCurrent()||!PM56_COMPOSER_STATE.matchesScheduleCapture(EXT.ctx(),captured.sourceBuffer))PM56_TX.fail('composer_changed');
      const result=PM56_ATTACHMENTS.publishScheduleSnapshots(prepared);if(!result.ok)PM56_TX.fail(result.error);
      const saved=saveMessage(EXT.ctx(),{...captured,attachments:prepared.attachments},editingId);
      if(!saved.ok)PM56_TX.fail(saved.error);
      const requests=P().messageRequests;
      PM56_TX.set(P(),'messageRequests',{...requests,[captured.requestKey]:{...requests[captured.requestKey],selection_request:JSON.stringify(captured)}});
      return saved;
    });
  }
  function cancelMessageExact(id,expected){
    const m=findMessage(id);if(!m)return msgError('schedule_not_found');
    if(!expected||expected.revision!==m.revision||expected.currentness!==msgCurrent(m))return msgError('stale_schedule_revision');
    if(!messageProjection(m).can_cancel)return msgError('dispatch_already_started');
    const TX=PM56_TX;return TX.run(()=>{TX.set(m,'state','canceled');TX.set(m,'revision',m.revision+1);TX.set(m,'cancelReason','Canceled by explicit user action; the snapshot and attempts remain in history.');TX.set(m,'updatedAt',nowIso());persistNow();return {ok:true,id};});
  }
  function messageTicket(id,atMs=Date.now(),userStarted=false){
    const m=findMessage(id);return !m?msgError('schedule_not_found'):{ok:true,ticket:{...captureMessage(id),at:atMs,stop_epoch:P().stopEpoch,pause_epoch:autoPause().user_stop_epoch,...(userStarted?{user_started:true}:{}),attempt_id:id+':r'+m.revision+':a'+((m.dispatch_attempts||[]).length+1)}};
  }
  function messageEligibility(m,ticket,publishedMessage){
    if(!Number.isFinite(ticket.at))return msgError('invalid_dispatch_time');
    const gate=evaluateEligibility('message',m,ticket.stop_epoch,ticket.pause_epoch,!!ticket.user_started);if(!gate.ok)return msgError(gate.clause,gate.detail);
    if(m.binding_kind!=='scheduled_message_v2')return msgError('legacy_snapshot_requires_review','This historical fixture has no complete frozen snapshot. Edit it before dispatch.');
    if(window.PM56_ARTIFACTS.key(msgBinding(m))!==m.snapshot_key)return msgError('snapshot_changed');
    if(!identical(scopeMessage(m.thread_id),m.scope_snapshot))return msgError('scope_changed');
    const c=EXT.ctx();if(c.state.permissions!==m.permission_snapshot)return msgError('permission_snapshot_changed');
    if(ticket.at<Date.parse(m.scheduled_at_utc))return msgError('not_due','The scheduled time has not arrived. Nothing was sent early.');
    const model=modelById(m.requested_runtime.modelId),route=m.requested_runtime;
    if(!model||model.status!=='ready'||model.provider!==route.provider||model.accountId!==route.accountId)return msgError('route_unavailable','The frozen model/account is unavailable. No fallback was selected.');
    const refs=resolveScheduledAttachments(m.attachment_refs,m.scope_snapshot);if(!refs.ok)return refs;
    if(m.destination_ref?.kind!=='assistant'){
      const owner=messageDestinations.get(m.destination_ref?.kind);if(!owner)return msgError('destination_owner_unavailable');
      const resolved=owner.validate(m.destination_ref,m.scope_snapshot,publishedMessage);if(!resolved?.ok)return msgError(resolved?.error||'destination_unavailable');
    }
    if(RT.quota?.waiting)return msgError('quota_unavailable','Usage is unavailable; the scheduled message is held.');
    const late=ticket.at-Date.parse(m.scheduled_at_utc);
    if(late>m.grace_seconds*1000&&m.missed_policy==='cancel_after_grace')return msgError('grace_expired','The grace period expired. This message will not be sent.');
    if(late>m.grace_seconds*1000&&m.missed_policy==='hold')return msgError('missed_time_held','The send time was missed. Review and reschedule; no backlog burst is sent.');
    return {ok:true};
  }
  function deliverMessage(ticket){
    if(!ticket||!ticket.id||!ticket.attempt_id)return msgError('invalid_dispatch_ticket');
    const m=findMessage(ticket.id);if(!m)return msgError('schedule_not_found');
    const prior=(m.dispatch_attempts||[]).find(a=>a.attempt_id===ticket.attempt_id);
    if(prior){if(prior.ticket_key!==PM56_ARTIFACTS.key(ticket))return msgError('idempotency_conflict');return {...copy(prior.result),duplicate:true};}
    if(m.state==='sent'||m.state==='dispatched')return {ok:true,duplicate:true,message_id:m.dispatchedMessageId,receipt:m.dispatch_receipt};
    if(ticket.revision!==m.revision||ticket.currentness!==msgCurrent(m))return msgError('stale_schedule_revision');
    if(!messageProjection(m).can_edit)return msgError('dispatch_already_started');
    let eligible=messageEligibility(m,ticket);
    if(eligible.error==='not_due'||eligible.error==='invalid_dispatch_time')return eligible;
    /* a decision taken before Pause all automations was turned on, delivered after it went off again: discarded; the
       record stays as it is and its next check decides afresh (it never keeps the switch's reason once it is off) */
    if(eligible.error==='project_automation_paused'&&!autoPause().paused)return {...eligible,discarded:true};
    const TX=PM56_TX;
    if(!eligible.ok)return TX.run(()=>{
      const result={...eligible,held:eligible.error!=='grace_expired',expired:eligible.error==='grace_expired',message_id:null};
      TX.set(m,'state',result.expired?'expired':'held');TX.set(m,result.expired?'expiredReason':'heldReason',eligible.detail);
      TX.set(m,'dispatch_attempts',(m.dispatch_attempts||[]).concat({attempt_id:ticket.attempt_id,ticket_key:PM56_ARTIFACTS.key(ticket),at:new Date(ticket.at).toISOString(),result}));TX.set(m,'updatedAt',nowIso());persistNow();
      return {ok:true,heldResult:result};
    }).heldResult||eligible;
    const delivered=TX.run(()=>{
      const th=threadByIdRaw(m.thread_id),id='sent-'+m.scheduled_dispatch_id+':r'+m.revision;
      const message={id,role:'user',type:'text',body:m.text,time:new Date(ticket.at).toISOString(),viaSchedule:true,isolatedSubmission:true,scheduledDispatchId:m.scheduled_dispatch_id,
        attachments:copy(m.attachment_refs),destination:copy(m.destination_ref),requested_runtime:copy(m.requested_runtime),effective_runtime:copy(m.requested_runtime)};
      // All fail-capable resolution happens BEFORE visible publication. The
      // existing transcript append is transaction-aware; no intermediate render.
      eligible=messageEligibility(m,ticket);if(!eligible.ok)TX.fail(eligible.error);
      if(ticket.revision!==m.revision||ticket.currentness!==msgCurrent(m))TX.fail('stale_schedule_revision');
      if(m.destination_ref.kind!=='assistant'){
        const result=messageDestinations.get(m.destination_ref.kind).deliver(message,m.destination_ref);if(!result?.ok)TX.fail(result?.error||'destination_delivery_failed');
      }else ctxAppend(th,message);
      eligible=messageEligibility(m,ticket,message);if(!eligible.ok)TX.fail(eligible.error);
      if(ticket.currentness!==msgCurrent(m))TX.fail('stale_schedule_revision');
      if(P().stopped||ticket.stop_epoch!==P().stopEpoch)TX.fail('manual_stop_latched');
      if(!pauseGate(ticket.pause_epoch,!!ticket.user_started).ok)TX.fail('project_automation_paused');
      const receipt={schedule_id:m.scheduled_dispatch_id,revision:m.revision,attempt_id:ticket.attempt_id,message_id:id,at:message.time,requested_runtime:copy(m.requested_runtime),effective_runtime:copy(m.requested_runtime),snapshot_key:m.snapshot_key,session_only:true};
      const result={ok:true,dispatched:true,message_id:id,receipt};
      TX.set(m,'state','sent');TX.set(m,'dispatchedMessageId',id);TX.set(m,'dispatchedAt',message.time);TX.set(m,'dispatch_receipt',receipt);TX.set(m,'heldReason',null);TX.set(m,'updatedAt',nowIso());
      TX.set(m,'dispatch_attempts',(m.dispatch_attempts||[]).concat({attempt_id:ticket.attempt_id,ticket_key:PM56_ARTIFACTS.key(ticket),at:message.time,result}));
      persistNow();if(m.destination_ref.kind==='assistant')TX.defer(()=>messageReceivers.get(m.thread_id)?.(message,receipt));return result;
    });
    if(!delivered.ok&&findMessage(ticket.id)===m&&m.revision===ticket.revision&&['scheduled','held','failed'].includes(m.state)){
      // Preserve the failed attempt AFTER the delivery transaction rolls back.
      // A separately cancelled/edited record is never overwritten by this result.
      TX.run(()=>{TX.set(m,'state','failed');TX.set(m,'failureReason',delivered.error||'delivery_failed');TX.set(m,'dispatch_attempts',(m.dispatch_attempts||[]).concat({attempt_id:ticket.attempt_id,ticket_key:PM56_ARTIFACTS.key(ticket),at:new Date(ticket.at).toISOString(),result:copy(delivered)}));persistNow();return {ok:true};});
    }
    return delivered;
  }
  function ctxAppend(thread,message){return EXT.ctx().appendMessage(message,thread);}
  function dispatchMessageAt(id,at,expected,userStarted){const decision=expected?.attempt_id?{ok:true,ticket:expected}:messageTicket(id,at,userStarted);return decision.ok?deliverMessage(decision.ticket):decision;}

  /* =====================================================================
     5. SCHEDULED MESSAGES — SQR-002. Freeze, revalidate, dispatch or hold.
     ===================================================================== */
  function defaultMsgDraft(ctx) {
    const tid=ctx.state.selectedThread,source=PM56_COMPOSER_STATE.captureForSchedule(ctx,tid),zone=deviceZone(),M=SCHED_DEFAULTS.message;
    const local=PM56_SCHEDULE_TIME.parts(zone,Math.ceil((Date.now()+M.leadMinutes*60000)/300000)*300000);
    return {threadId:tid,text:source.buffer.text,attachments:copy(source.buffer.attachments),browser_context_refs:copy(source.buffer.browser_context_refs||[]),
      destination:copy(source.buffer.destination),workflow_config:source.buffer.workflow_config,held_request:source.buffer.held_request,
      sourceScope:scopeMessage(tid),sourceBuffer:source,requestKey:ctx.uid('schedule-request'),modelId:ctx.state.model,
      date:local.y+'-'+pad2(local.mo)+'-'+pad2(local.d),time:pad2(local.h)+':'+pad2(local.mi),timezone:zone,missed:M.missed,grace:M.graceMinutes};
  }
  function loadMessageForEdit(rec) {
    const local=PM56_SCHEDULE_TIME.parts(rec.timezone,Date.parse(rec.scheduled_at_utc));
    return {threadId:rec.thread_id,text:rec.text,attachments:copy(rec.attachment_refs||[]),destination:copy(rec.destination_ref),browser_context_refs:[],
      sourceScope:rec.scope_snapshot||scopeMessage(rec.thread_id),requestKey:EXT.ctx().uid('schedule-update'),expectedRevision:rec.revision,expectedCurrentness:msgCurrent(rec),
      modelId:rec.requested_runtime?.modelId,date:local.y+'-'+pad2(local.mo)+'-'+pad2(local.d),time:rec.local_wall_time,timezone:rec.timezone,missed:rec.missed_policy,grace:rec.grace_seconds/60};
  }
  function commitMessage(ctx) {
    const out=saveMessage(ctx,ui.msgDraft,ui.editingMsgId);
    if(!out.ok){if(ui.msgDraft)refuse(ui.msgDraft,out.error,out.detail);ctx.renderOverlays();return null;}
    return out.record;
  }
  function cancelMessage(id,expected) { return cancelMessageExact(id,expected||captureMessage(id)).ok; }
  function dispatchMessage(ctx,id) { const m=findMessage(id);if(!m)return null;
    const out=dispatchMessageAt(id,Date.now());return {...out,rec:m,thread:threadByIdRaw(m.thread_id),refused:!out.ok&&!out.held,reason:out.detail||out.error}; }

  function defaultBuildDraft(planId, version) {
    var plan=window.PM56_PLANS&&window.PM56_PLANS.get(planId),B=SCHED_DEFAULTS.build,zone=deviceZone();
    var tomorrow=PM56_SCHEDULE_TIME.parts(zone,Date.now()+86400000);
    return {
      contentHash:plan?window.PM56_PLANS.hash(planId):null,
      expected:plan?window.PM56_PLANS.admissionSnapshot(planId):null,executionTopology:B.topology,
      requestKey:EXT.ctx().uid('build-schedule-request'),planId: planId, version: version, kind: B.kind,
      date: tomorrow.y+'-'+pad2(tomorrow.mo)+'-'+pad2(tomorrow.d), time: B.oneTimeTime, startTime: B.start, pauseTime: B.stop,
      timezone: zone, days: B.days.slice(),
      windDown: B.windDownMinutes, autoResumeNext: B.autoResumeNext, missed: B.missed, grace: B.graceMinutes
    };
  }
  function commitBuild(ctx) {
    var d = ui.buildDraft; if (!d) return null;
    if(!d.requestKey){refuse(d,'idempotency_key_required');return null;}
    const grace=Number(d.grace??SCHED_DEFAULTS.build.graceMinutes);
    const requestBinding=PM56_ARTIFACTS.key({planId:d.planId,version:d.version,hash:d.contentHash,expected:d.expected,kind:d.kind,date:d.date,time:d.time,start:d.startTime,pause:d.pauseTime,timezone:d.timezone,days:d.days,wind:d.windDown,auto:d.autoResumeNext,missed:d.missed,grace,topology:d.executionTopology,crew:d.crewDefinition||null,editing:ui.editingBuildId||null});
    const prior=P().buildRequests?.[d.requestKey];
    if(prior){if(prior.binding!==requestBinding){refuse(d,'idempotency_conflict');return null;}return findBuild(prior.id);}
    if(ui.editingBuildId){const old=findBuild(ui.editingBuildId);if(!old||old.revision!==d.expectedRevision||buildCurrent(old)!==d.expectedCurrentness||old.state!=='active'){refuse(d,'stale_schedule_revision');return null;}}
    if(!['one_time','recurring_window'].includes(d.kind)||!['hold','next_available','cancel_after_grace'].includes(d.missed)||typeof d.autoResumeNext!=='boolean'||!Number.isFinite(Number(d.windDown))||Number(d.windDown)<0||Number(d.windDown)>180||!Number.isFinite(grace)||grace<1||grace>1440){refuse(d,'invalid_schedule_configuration');return null;}
    if(d.kind==='one_time'){const invalid=validateWall(d.date,d.time,d.timezone);if(invalid){refuse(d,invalid);return null;}}
    const badWindow=d.kind==='recurring_window'&&(!PM56_SCHEDULE_TIME.parse('2000-01-01',d.startTime)||!PM56_SCHEDULE_TIME.parse('2000-01-01',d.pauseTime)||d.startTime===d.pauseTime||!PM56_SCHEDULE_TIME.parts(d.timezone,Date.now())||!Array.isArray(d.days)||!d.days.length||d.days.some(x=>!Number.isInteger(x)||x<0||x>6));
    if(badWindow){refuse(d,'invalid_window');ctx.renderOverlays();return null;}
    if(ui.editingBuildId&&findBuild(ui.editingBuildId)?.dispatchReceipt){refuse(d,'dispatch_already_started');ctx.renderOverlays();return null;}
    var plan=window.PM56_PLANS&&window.PM56_PLANS.get(d.planId);
    if(!plan||plan.status!=='ready'||plan.version!==d.version||window.PM56_PLANS.hash(d.planId)!==d.contentHash){
      refuse(d,'plan_version_changed','',{version:plan?plan.version:''});ctx.renderOverlays();return null;
    }
    const currentSnapshot=window.PM56_PLANS.admissionSnapshot(d.planId);
    if(d.expected&&JSON.stringify(d.expected)!==JSON.stringify(currentSnapshot)){refuse(d,'scope_changed');ctx.renderOverlays();return null;}
    if(!['agent','goal_driven','crew'].includes(d.executionTopology||'agent')){refuse(d,'invalid_topology');return null;}
    if(d.executionTopology==='crew'){const v=window.PM56_COLLAB.validatePlanCrew(d.crewDefinition,d.planId,false);if(!v.ok){refuse(d,v.error,v.message);return null;}}
    var hash=d.contentHash,model=ctx.selectedModel();
    var existing = ui.editingBuildId ? findBuild(ui.editingBuildId) : null;
    var id = existing ? existing.schedule_id : ctx.uid('bld');
    var oneTime = d.kind === 'one_time';
    var scheduledUtc = null;
    if (oneTime) {
      var dt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.date || '');
      var hhmm = parseHHMM(d.time);
      var ms = dt ? tzToUTC(d.timezone, Number(dt[1]), Number(dt[2]), Number(dt[3]), hhmm.h, hhmm.m) : Date.now();
      scheduledUtc = new Date(ms).toISOString();
    }
    var rec = {
      schedule_id: id, project_id: currentSnapshot.project_id, target_kind: 'assistant_plan_run', target_id: d.planId,
      exact_target_version: d.version, exact_target_hash: hash,
      binding_kind:'plan_content_v1',execution_topology:d.executionTopology||'agent',thread_id:plan.thread_id,
      topology_snapshot:{schema:'pm.schedule.plan_topology_snapshot.v1',execution_topology:d.executionTopology||'agent'},user_stop_epoch:P().stopEpoch,project_stop_epoch:autoPause().user_stop_epoch,
      owner_worktree_snapshot:currentSnapshot.worktree,runtime_created:false,plan_run_id:null,goal_id:null,
      runtime_snapshot:{modelId:model.id,modelName:model.name,provider:model.provider,accountId:model.accountId},
      permission_snapshot:ctx.state.permissions,worktree_snapshot:ctx.state.worktree,
      dispatchReceipt:null,
      schedule_kind: d.kind,
      timezone: d.timezone,
      local_start: oneTime ? d.time : d.startTime,
      local_pause: oneTime ? null : d.pauseTime,
      days_of_week: oneTime ? [] : d.days.slice(),
      wind_down_seconds: Math.round(clamp(d.windDown, 0, 180)) * 60,
      grace_seconds: Math.round(grace * 60), missed_policy: d.missed, auto_resume_next_window: !!d.autoResumeNext,
      state: 'active', revision: 1, invalidated_reason: null, pendingVersion: null, pendingHash: null,
      runPhase: 'idle', demoClockIso: nowIso(), lastOccurrenceStart: null, occurrencesFired: [],
      scheduled_at_utc: scheduledUtc,
      log: [{ at: nowIso(), text: 'Schedule created: ' + (oneTime ? ('one-time build at ' + to12h(d.time) + ' ' + tzLabel(d.timezone)) : ('recurring window ' + to12h(d.startTime) + '–' + to12h(d.pauseTime) + ' ' + tzLabel(d.timezone) + ', ' + daysSummary(d.days))) + '.' }],
      createdAt: nowIso(), updatedAt: nowIso()
    };
    if(!oneTime)rec.next_occurrence_at=new Date(computeNextOccurrence(rec,Date.now())).toISOString();
    const TX=PM56_TX,oldCurrent=existing?buildCurrent(existing):null;
    const result=TX.run(()=>{
      if(existing&&buildCurrent(existing)!==oldCurrent)TX.fail('stale_schedule_revision');
      if(d.executionTopology==='crew'){
        const def=PM56_COLLAB.commitPlanCrewDefinition(d.crewDefinition,d.planId);if(!def.ok)TX.fail(def.error);
        rec.topology_snapshot=Object.freeze({...rec.topology_snapshot,collaboration_definition_ref:def.snapshot});
      }
      if(!identical(window.PM56_PLANS.admissionSnapshot(d.planId),currentSnapshot))TX.fail('scope_changed');
      if(existing){
        const retained={createdAt:existing.createdAt,revision:existing.revision+1,occurrencesFired:existing.occurrencesFired.slice(),log:existing.log.concat({at:nowIso(),text:'Window updated under exact expected revision.'}),dispatchReceipt:existing.dispatchReceipt,runPhase:existing.runPhase,lastOccurrenceStart:existing.lastOccurrenceStart};
        for(const [k,v] of Object.entries({...rec,...retained}))TX.set(existing,k,v);rec=existing;
      }else TX.set(P(),'buildSchedules',[rec,...P().buildSchedules]);
      TX.set(P(),'buildRequests',{...(P().buildRequests||{}),[d.requestKey]:{id:rec.schedule_id,binding:requestBinding}});
      TX.set(P(),'events',[{id:'ev-'+id+'-r'+rec.revision,at:nowIso(),type:existing?'execution_window.updated':'execution_window.created',ref:id,clause:null,detail:'Session-local exact Plan schedule; no work admitted.'},...P().events].slice(0,60));
      persistNow();return {ok:true,record:rec};
    });
    if(!result.ok){refuse(d,result.error);ctx.renderOverlays();return null;}return result.record;
  }
  function cancelBuild(id,expected) {
    var rec = findBuild(id);
    if(expected&&(!rec||expected.revision!==rec.revision||expected.currentness!==buildCurrent(rec)))return false; if (!rec || rec.state === 'completed') return false;
    if(rec.state==='canceled')return true;
    rec.state = 'canceled'; rec.revision++; rec.updatedAt = nowIso();
    logBuildLine(rec, 'Cancelled by the user. Any already-admitted work continues under its own owner — cancelling a window is not a Stop.');
    logEvent('execution_window.updated', id, null, 'Cancelled by the user.');
    persistNow();
    return true;
  }
  function simulateRevision(id) {
    var rec = findBuild(id); if (!rec || rec.state === 'invalidated' || ['cancelled','canceled'].includes(rec.state)) return null;
    var oldV = rec.exact_target_version, oldH = rec.exact_target_hash;
    var newV = oldV + 1, newH = demoHash(rec.target_id + ':' + newV);
    rec.pendingVersion = newV; rec.pendingHash = newH;
    rec.state = 'invalidated';
    rec.invalidated_reason = 'Plan ' + rec.target_id + ' was revised from V' + oldV + ' (hash ' + oldH + ') to V' + newV + ' (hash ' + newH + ') after this schedule was created. Automatic dispatch is disabled until you rebind.';
    rec.revision += 1; rec.updatedAt = nowIso();
    logBuildLine(rec, rec.invalidated_reason);
    logEvent('execution_window.invalidated', id, 'target_version_changed', rec.invalidated_reason);
    persistNow();
    return rec;
  }
  /* PSCHED-006. The PLAN owner calls this when it writes a new version. Until
     it existed the only revision path was `simulateRevision`, driven from this
     module's own management dialog -- so an ordinary Revise in the composer
     left every durable build schedule `active` and still bound to the old
     version, free to dispatch a build of bytes the user had already replaced.
     Invalidation is per-schedule and explicit: nothing is retargeted
     automatically, and the row keeps naming the stale version so the user can
     rebind or recreate it deliberately. */
  function invalidateForPlanRevision(planId, oldVersion, newVersion, newHash) {
    const TX=window.PM56_TX;
    const out = {invalidated:[],untouched:[]};
    P().buildSchedules.forEach(function(rec){
      // An invalidated V1 schedule still needs its proposed review target advanced
      // after V2 -> V3. Its admitted V1 binding remains unchanged until consent.
      if(rec.target_id!==planId||['cancelled','canceled','completed'].includes(rec.state)||rec.exact_target_version>=newVersion||rec.state==='invalidated'&&Number(rec.pendingVersion||0)>=newVersion){out.untouched.push(rec.schedule_id);return;}
      const reason='Plan '+planId+' was revised from V'+rec.exact_target_version+' to V'+newVersion+' after this schedule was created. Automatic dispatch is disabled until you rebind.';
      TX.set(rec,'pendingVersion',newVersion);TX.set(rec,'pendingHash',newHash||demoHash(planId+':'+newVersion));
      TX.set(rec,'state','invalidated');TX.set(rec,'invalidated_reason',reason);TX.set(rec,'revision',rec.revision+1);TX.set(rec,'updatedAt',nowIso());
      TX.set(rec,'log',[{at:nowIso(),text:reason},...(rec.log||[])].slice(0,40));
      const S=P();TX.set(S,'events',[{id:'ev-'+(S.events.length+1)+'-'+Date.now().toString(36),at:nowIso(),type:'execution_window.invalidated',ref:rec.schedule_id,clause:'target_version_changed',detail:reason},...S.events].slice(0,60));
      out.invalidated.push(rec.schedule_id);
    });
    if(out.invalidated.length)persistNow();return out;
  }

  function rebindBuild(id, expected) {
    var rec = findBuild(id); if (!rec || rec.state !== 'invalidated') return null;
    // The clicked Use Vn control consents to that version/hash and schedule
    // revision, not whatever happens to be current when the click arrives.
    if(!expected||expected.revision!==rec.revision||expected.version!==rec.pendingVersion||expected.hash!==rec.pendingHash)return null;
    var plan=window.PM56_PLANS&&window.PM56_PLANS.get(rec.target_id);
    if(rec.binding_kind==='plan_content_v1'){
      if(!plan||plan.status!=='ready'||plan.version!==expected.version||window.PM56_PLANS.hash(plan.plan_id)!==expected.hash)return null;
      rec.exact_target_version=expected.version;rec.exact_target_hash=expected.hash;
    }else{
      if(rec.pendingVersion!=null)rec.exact_target_version=rec.pendingVersion;
      if(rec.pendingHash)rec.exact_target_hash=rec.pendingHash;
    }
    rec.pendingVersion = null; rec.pendingHash = null;
    rec.state = 'active'; rec.invalidated_reason = null; rec.revision += 1;
    rec.occurrencesFired = []; rec.runPhase = 'idle';rec.dispatchReceipt=null;
    rec.updatedAt = nowIso();
    logBuildLine(rec, 'Rebound to V' + rec.exact_target_version + ' (hash ' + rec.exact_target_hash + ') by explicit user action. It will not silently advance to a future revision again.');
    logEvent('execution_window.updated', id, null, 'Explicit rebind after invalidation.');
    persistNow();
    return rec;
  }
  /* The Plan card's schedule line (DESIGN-SPEC 8.8 "In chat", IMPACT A1-30). plans.js renders it beside the Build
     control, so it never replaces "Building…". Every secondary state leads with its canon token (Outside execution
     window, Paused, Waiting for Usage, Schedule needs update), and the attention text plans.js owns ("Paused at window
     wind-down") stays in it. A nightly slot carries a thin night ribbon (the slot, its wrap-up, now) and the steps
     built so far. It stays an HTML string with .plan-schedule-line, data-plan-schedule and sched-open-plan-record. */
  function quotaWords(q){
    q=q||{};
    if(q.resetSource==='unknown'||!q.resetAt)return 'reset time unknown, so no countdown';
    var src=q.resetSource==='provider reported'?'from '+(String(q.scope||'').split(' ')[0]||'the provider'):q.resetSource==='locally inferred'?'our estimate':'your estimate';
    return 'resets '+(q.resetSource==='locally inferred'?'about ':'')+q.resetAt+' ('+src+')';
  }
  function nightRibbon(b,now){
    var S=parseHHMM(b.local_start),E=parseHHMM(b.local_pause),s=S.h*60+S.m,e=E.h*60+E.m,len=(e-s+1440)%1440||1440,wind=Math.min(len,Math.round((b.wind_down_seconds||0)/60));
    var r0=s-240,W=168,span=840,x=function(m){return Math.round(((m-r0+2880)%1440)/span*W*10)/10;};
    var p=zp(b.timezone,Number.isFinite(b.clock_ms)?b.clock_ms:now),nm=p?p.h*60+p.mi:-1,nx=nm>=0?(nm-r0+2880)%1440:-1;
    var cut=len-wind,band='<rect class="plan-sched-band" x="'+x(s)+'" y="3" width="'+Math.max(1.5,Math.round(cut/span*W*10)/10)+'" height="6" rx="1.5"/>';
    var tail=wind>0?'<rect class="plan-sched-wind" x="'+x(s+cut)+'" y="3" width="'+Math.max(1.5,Math.round(wind/span*W*10)/10)+'" height="6" rx="1"/>':'';
    var tick=nx>=0&&nx<=span?'<line class="plan-sched-now" x1="'+(Math.round(nx/span*W*10)/10)+'" x2="'+(Math.round(nx/span*W*10)/10)+'" y1="0" y2="12"/>':'';
    return '<svg class="plan-sched-ribbon" viewBox="0 0 '+W+' 12" width="'+W+'" height="12" aria-hidden="true"><line class="plan-sched-base" x1="0" x2="'+W+'" y1="6" y2="6"/>'+band+tail+tick+'</svg>';
  }
  function planSummary(planId){
    var rows=buildsForTarget(planId).filter(function(b){return b.binding_kind==='plan_content_v1';});
    if(!rows.length)return '';
    var b=rows[0],api=window.PM56_PLANS,plan=api&&api.get(planId),a=api&&api.attention?api.attention(planId):null,now=Date.now(),zone=b.timezone,one=b.schedule_kind==='one_time';
    var id=esc(b.schedule_id),lead,say='',acts='',tone='wait',ribbon=false;
    var clock=Number.isFinite(b.clock_ms)?b.clock_ms:now,nextMs=one?Date.parse(b.scheduled_at_utc):computeNextOccurrence(b,clock);
    var nextSay=Number.isFinite(nextMs)&&nextMs?chatWhen(nextMs,zone,clock):'';
    /* "continues Mon 10:00 PM": the weekday is always named, even tonight */
    var nextDay=Number.isFinite(nextMs)&&nextMs?(function(p){return p?DAY_LABELS[T0.weekday(p)]+' '+clockAt(nextMs,zone):'';})(zp(zone,nextMs)):'';
    /* a slot set in another zone than the viewer's names it once (its times are that zone's wall times) */
    var oz=otherZone(zone),zt=oz?' ('+esc(nb(oz))+')':'';  /* the zone never breaks inside its parentheses (C56) */
    var rep=api&&api.executionReport&&b.dispatchReceipt?api.executionReport(planId):null,cs=rep&&rep.completion_summary,steps=cs&&cs.leaf_steps?cs.resolved+' of '+cs.leaf_steps+' steps':'';
    var slot=one?'':nightsWord(b.days_of_week)+' '+slotText(b.local_start,b.local_pause);
    /* Build (or an ended run) invalidates the schedule without a new version: nothing to rebind, so the line says the
       schedule is over instead of offering "Use V" for a version that does not exist */
    if(b.state==='invalidated'&&b.pendingVersion==null){tone='done';lead='Schedule ended';say=/^Build Now/.test(b.invalidated_reason||'')?'you started this build now, so the schedule won’t start a second one.':'the build it was set for has ended, so it won’t start again.';}
    else if(b.state==='invalidated'){
      tone='update';lead='Schedule needs update';say='You edited this plan (now V'+esc(b.pendingVersion)+'). <b>Build V'+esc(b.pendingVersion)+' instead?</b>';
      acts='<button type="button" class="soft-button pmx-act" data-action="sched-rebind-build" data-id="'+id+'" data-version="'+esc(b.pendingVersion)+'" data-hash="'+esc(b.pendingHash)+'" data-revision="'+b.revision+'">Use V'+esc(b.pendingVersion)+'</button>'+
        '<button type="button" class="text-button pmx-act" data-action="sched-cancel-build" data-id="'+id+'" data-revision="'+b.revision+'" data-currentness="'+esc(buildCurrent(b))+'">Cancel schedule</button>';
    }else if(b.state==='canceled'||b.state==='cancelled'){tone='done';lead='Schedule canceled';say='V'+esc(b.exact_target_version)+' won’t be built on a schedule.';}
    else if(b.state==='held'){tone='update';lead='Held';say=esc(buildHeldWords(b));}
    else if(b.state==='expired'){tone='done';lead='Skipped';say='it was more than '+Math.round((b.grace_seconds||SCHED_DEFAULTS.build.graceMinutes*60)/60)+' min late.';}
    /* Pause all automations is on: nothing scheduled starts, so the line says so first (A1-30, SQR-018), never "next: …" */
    else if(autoPause().paused&&!(b.dispatchReceipt&&(b.state==='completed'||plan&&plan.status==='completed'))){tone='pause';lead='Paused';say='Pause all automations is on, so nothing starts until you turn it off in Scheduled.';}
    else if(P().stopped&&!(b.dispatchReceipt&&(b.state==='completed'||plan&&plan.status==='completed'))){tone='pause';lead='Paused';say='you pressed Stop, so nothing scheduled starts until you resume it in Scheduled.';}
    else if(b.dispatchReceipt&&(b.state==='completed'||plan&&plan.status==='completed')){tone='done';lead='Scheduled build completed';say=steps?'built '+steps+'.':'';}
    else if(b.dispatchReceipt&&a&&a.condition_kind==='window'){
      tone='pause';ribbon=!one;lead='Outside execution window';
      say=esc(a.line==='Outside execution window'?'paused for the night':a.line)+(nextDay&&!one?', continues '+esc(nb(nextDay))+zt:'');
    }else if(b.dispatchReceipt&&a&&/^quota/.test(a.condition_kind)){tone='pause';ribbon=!one;lead='Waiting for Usage';say=esc(quotaWords(RT.quota))+(nextDay&&!one?', continues '+esc(nb(nextDay))+zt:'');}
    else if(b.dispatchReceipt&&a&&a.condition_kind==='paused'){tone='pause';lead='Paused';say='you paused this build. Nothing is lost.';}
    else if(b.dispatchReceipt&&a){tone='update';lead=esc(a.line);say=esc(a.reason||'');}
    else if(b.dispatchReceipt){
      tone='live';ribbon=!one;lead='Building now';
      /* the wind-down instant, the time the sheet promised ("Stops starting new tasks at 1:50 AM") */
      if(!one){var P2=parseHHMM(b.local_pause);say='wraps up '+esc(nb(minuteClock(P2.h*60+P2.m-Math.round((b.wind_down_seconds||0)/60))))+zt;}
    }else if(one){lead='Builds once';say=!nextSay?'':nextMs>now?esc(nb(nextSay))+zt+' · '+esc(nb(SH.pmxTime.until(nextMs,now))):'was due '+esc(nb(nextSay))+zt+', not started yet';}
    else{ribbon=true;lead='Builds '+esc(slot)+zt;say=nextSay?'next: '+esc(nextWords({kind:'recurring_window',timezone:zone,days:b.days_of_week,startTime:b.local_start,pauseTime:b.local_pause},now)||nextSay):'';}
    var foot=ribbon||steps?'<span class="plan-sched-foot">'+(ribbon?nightRibbon(b,now):'')+(steps&&tone!=='done'?'<span>'+esc(steps)+'</span>':'')+'</span>':'';
    /* 8.8 "the next morning, one receipt": what the night did, once the slot has paused it safely */
    var night=lead==='Outside execution window'?overnightReceipt(b,steps):'';
    /* C56: the lead is the line's first row and Details sits beside it; what follows the lead (the detail, then the
       night ribbon) flows on the row below, and a decision's buttons get a row of their own under the sentence, so
       neither ever squeezes the sentence into a narrow column. The " · " stays in the text for screen readers. */
    return '<div class="plan-schedule-line" data-plan-schedule="'+id+'" data-tone="'+tone+'"><span class="plan-sched-mark">'+SH.pmxKindMark('build-at',16)+'</span>'+
      '<p class="plan-sched-say"><b>'+lead+'</b>'+(say?'<span class="plan-sched-sep"> · </span><span class="plan-sched-detail">'+say+'</span>':'')+foot+'</p>'+
      '<span class="plan-sched-acts"><button type="button" class="text-button pmx-act" data-action="sched-open-plan-record" data-id="'+id+'">'+(b.state==='invalidated'&&b.pendingVersion!=null?'Review':'Details')+'</button></span>'+
      (acts?'<span class="plan-sched-decide pmx-actions">'+acts+'</span>':'')+night+'</div>';
  }
  function overnightReceipt(b,steps){
    /* the night began when the run was admitted (its receipt) or, on a later night, when the slot reopened */
    var d=b.last_window_decision,st=Math.max(Date.parse(b.lastOccurrenceStart)||0,Date.parse(b.dispatchReceipt&&b.dispatchReceipt.at)||0),en=d?Date.parse(d.at):NaN,zone=b.timezone;
    if(!isFinite(st)||!isFinite(en)||en<=st)return '';
    var range=nb(clockAt(st,zone))+'–'+nb(clockAt(en,zone)),mine=P().scheduledMessages.filter(function(m){return m.thread_id===b.thread_id;});
    var sent=mine.filter(function(m){var t=Date.parse(m.dispatchedAt);return stateOf(m)==='sent'&&t>=st&&t<=en;}).length,needs=mine.filter(function(m){return ['held','failed'].indexOf(stateOf(m))>=0;}).length;
    var parts=[(steps&&!/^0 of/.test(steps)?'built '+steps:'started the build')+' ('+range+', paused safely)'];
    if(sent)parts.push('sent '+sent+(sent===1?' scheduled message':' scheduled messages'));
    if(needs)parts.push(needs+(needs===1?' message needs you':' messages need you'));
    return '<p class="plan-sched-overnight"><b>Overnight:</b> '+esc(parts.join(' · '))+
      ' <button type="button" class="text-button" data-action="sched-open-plan-record" data-id="'+esc(b.schedule_id)+'">Open</button></p>';
  }
  var PAUSE_HELD='Held by Pause all automations; no run was created.';
  function buildHeldWords(b){
    var r=String(b.held_reason||'');
    if(r===PAUSE_HELD)return autoPause().paused?'Pause all automations is on, so nothing was started.':'it waited while Pause all automations was on; it starts at its next time.';
    if(/worktree/i.test(r))return 'the worktree this plan builds in no longer exists, so nothing was started.';
    if(/usage/i.test(r))return 'Usage wasn’t available, so nothing was started.';
    if(/window/i.test(r))return 'it was outside its time slot, so nothing was started.';
    if(/missed/i.test(r))return 'the start time was missed. You asked us to check with you first.';
    return 'it couldn’t start, so nothing was started.';
  }

  // A deterministic concept tick, invoked explicitly by the gallery guide.
  // atMs is the demonstrated clock time, never a global Date override. This
  // checks a real content binding and admits through the existing Plan owner.
  // It is NOT a background service or production runtime implementation.
  function dispatchBuildAt(id,atMs,expectedRevision,epochAtDecision){
    const b=findBuild(id),api=window.PM56_PLANS,c=EXT.ctx?.(),TX=window.PM56_TX;
    const fail=(clause,detail)=>({ok:false,clause,error:clause,detail:detail||clause});
    if(!b||!api||!c)return fail('target_not_found');
    if(expectedRevision!=null&&expectedRevision!==b.revision)return fail('stale_schedule_revision');
    if(b.dispatchReceipt)return {ok:true,duplicate:true,receipt:b.dispatchReceipt};
    const captured=epochAtDecision??b.user_stop_epoch??P().stopEpoch,pauseAt=b.project_stop_epoch??null;
    const eligible=evaluateEligibility('build',b,captured,pauseAt);if(!eligible.ok){if(eligible.clause==='project_automation_paused'&&b.held_reason!==PAUSE_HELD){b.held_reason=PAUSE_HELD;persistNow();}return fail(eligible.clause,eligible.detail);}
    if(b.held_reason===PAUSE_HELD)b.held_reason=null;
    if(b.state!=='active')return fail('schedule_not_active');
    if(b.topology_snapshot?.execution_topology!==b.execution_topology)return fail('topology_snapshot_changed');
    if(b.binding_kind!=='plan_content_v1'||!['one_time','recurring_window'].includes(b.schedule_kind)||!['agent','goal_driven','crew'].includes(b.execution_topology))return fail('unsupported_demo_schedule');
    const due=b.schedule_kind==='one_time'?Date.parse(b.scheduled_at_utc):Date.parse(b.next_occurrence_at||b.createdAt);
    if(!Number.isFinite(atMs)||!Number.isFinite(due)||atMs<due)return fail('window_not_open');
    const calendar=buildWindow(b,atMs);
    if(b.schedule_kind==='recurring_window'&&(!calendar.ok||!calendar.open||calendar.phase==='winding_down')){b.held_reason='Outside an admissible execution window; no run was created.';persistNow();return fail('window_inactive',b.held_reason);}
    if(b.schedule_kind==='one_time'&&atMs-due>(b.grace_seconds||SCHED_DEFAULTS.build.graceMinutes*60)*1000&&b.missed_policy!=='next_available'){
      b.held_reason=b.missed_policy==='cancel_after_grace'?'The scheduled build expired after grace.':'The start time was missed. Review this schedule.';
      if(b.missed_policy==='cancel_after_grace'){b.state='expired';b.revision++;}persistNow();return fail(b.state==='expired'?'grace_expired':'missed_time_held',b.held_reason);
    }
    const plan=api.get(b.target_id),thread=threadByIdRaw(b.thread_id);
    if(!plan||!thread||thread.archived||plan.thread_id!==b.thread_id)return fail('target_not_found');
    if(plan.version!==b.exact_target_version||api.hash(plan.plan_id)!==b.exact_target_hash){
      b.state='invalidated';b.pendingVersion=plan.version;b.pendingHash=api.hash(plan.plan_id);b.revision++;
      b.invalidated_reason='The scheduled Plan content changed. Review the current version before dispatch.';
      logBuildLine(b,b.invalidated_reason);persistNow();c.renderApp();return fail('target_version_changed');
    }
    const runtime=b.runtime_snapshot||{},model=(D.models||[]).find(m=>m.id===runtime.modelId);
    if(!model||model.accountId!==runtime.accountId||model.status!=='ready'||model.provider!==runtime.provider)return fail('route_unavailable');
    if(c.state.worktree!==b.worktree_snapshot)return fail('worktree_snapshot_changed');
    if(c.state.permissions!==b.permission_snapshot)return fail('permission_snapshot_changed');
    if(RT.quota?.waiting){b.held_reason='Usage unavailable; no run has been admitted.';persistNow();return fail('quota_unavailable',b.held_reason);}
    const originalRoute=buildRoute(b);if(!originalRoute.ok){b.held_reason=originalRoute.detail;persistNow();return fail(originalRoute.error,originalRoute.detail);}
    const frozen=JSON.stringify(b),revision=b.revision;
    const out=TX.run(()=>{
      const result=api.admitScheduled(b);if(!result.ok)TX.fail(result.error||result.clause||'plan_admission_refused');
      if(JSON.stringify(b)!==frozen||b.revision!==revision)TX.fail('schedule_changed_during_admission');
      const again=evaluateEligibility('build',b,captured,pauseAt);if(!again.ok)TX.fail(again.clause==='project_automation_paused'?'project_automation_paused':'stale_stop_epoch');
      const occurrence=new Date(due).toISOString(),receipt={schedule_id:b.schedule_id,plan_id:b.target_id,version:b.exact_target_version,hash:b.exact_target_hash,occurrence,at:new Date(atMs).toISOString(),concept:true,
        execution_topology:b.execution_topology,plan_run_id:result.plan_run_id,crew_run_id:result.crew_run_id||null,goal_id:result.goal_id||null};
      for(const [k,v] of Object.entries({clock_ms:atMs,held_reason:null,lastOccurrenceStart:occurrence,occurrencesFired:b.occurrencesFired.concat(occurrence),dispatchReceipt:receipt,
        state:b.schedule_kind==='one_time'?'completed':'active',runPhase:'admitted',runtime_created:true,plan_run_id:result.plan_run_id,goal_id:result.goal_id||null,revision:b.revision+1,updatedAt:nowIso(),
        log:[{at:nowIso(),text:'Admitted through the shared Plan command. Duplicate delivery returns the original run and Goal.'},...b.log]}))TX.set(b,k,v);
      TX.set(P(),'events',[{id:'ev-'+id+'-dispatch',at:nowIso(),type:'scheduled_dispatch.dispatched',ref:id,clause:null,detail:'V'+b.exact_target_version+' admitted with its frozen topology.'},...P().events].slice(0,60));
      persistNow();TX.defer(()=>c.renderApp());return {ok:true,duplicate:false,receipt};
    });
    return {...out,clause:out.error||null};
  }

  /* Existing Scheduling owner: calendar-qualified window decisions. Explicit
     local clock input demonstrates timer delivery; it is not a timer service. */
  function buildWindow(rec,at){return rec.schedule_kind==='recurring_window'?PM56_SCHEDULE_TIME.windowAt(rec,at):{ok:true,open:at>=Date.parse(rec.scheduled_at_utc),phase:'open',start:Date.parse(rec.scheduled_at_utc)};}
  function buildCurrent(rec){return PM56_ARTIFACTS.key({id:rec.schedule_id,revision:rec.revision,target:rec.target_id,version:rec.exact_target_version,hash:rec.exact_target_hash,topology:rec.execution_topology,topology_snapshot:rec.topology_snapshot,kind:rec.schedule_kind,at:rec.scheduled_at_utc,wind:rec.wind_down_seconds,auto:rec.auto_resume_next_window,missed:rec.missed_policy,grace:rec.grace_seconds,timezone:rec.timezone,start:rec.local_start,pause:rec.local_pause,days:rec.days_of_week,route:rec.runtime_snapshot,scope:rec.owner_worktree_snapshot,permissions:rec.permission_snapshot,state:rec.state});}
  function captureBuild(id){const b=findBuild(id);return b?{id,revision:b.revision,currentness:buildCurrent(b),epoch:P().stopEpoch}:null;}
  function buildRoute(rec){const c=EXT.ctx(),r=PM56_PLANS.get(rec.target_id),scope=PM56_GOAL.scope(rec.thread_id),model=modelById(rec.runtime_snapshot?.modelId);
    if(rec.execution_topology==='crew'){const v=PM56_COLLAB.validatePlanCrew(rec.topology_snapshot?.collaboration_definition_ref,rec.target_id,true);if(!v.ok)return msgError(v.error,v.message);}
    if(!r||!scope||r.thread_id!==rec.thread_id||scope.projectId!==rec.project_id)return msgError('target_not_found');
    if(r.version!==rec.exact_target_version||PM56_PLANS.hash(r.plan_id)!==rec.exact_target_hash)return msgError('target_version_changed');
    if(scope.worktreeId!==rec.owner_worktree_snapshot||c.state.worktree!==rec.worktree_snapshot)return msgError('worktree_snapshot_changed');
    if(c.state.permissions!==rec.permission_snapshot)return msgError('permission_snapshot_changed');
    if(!model||model.status!=='ready'||model.provider!==rec.runtime_snapshot.provider||model.accountId!==rec.runtime_snapshot.accountId)return msgError('route_unavailable');
    return {ok:true};
  }
  function workEligibility(planId){
    const plan=PM56_PLANS.get(planId),run=plan?.approved?.plan_run_id;
    const schedules=P().buildSchedules.filter(b=>b.binding_kind==='plan_content_v1'&&b.target_id===planId&&b.plan_run_id===run&&b.state==='active'&&b.schedule_kind==='recurring_window');
    if(!schedules.length)return {ok:true};
    const stop=window.PM56_SCHED.checkEpoch({epoch:P().stopEpoch});if(!stop.ok)return stop;
    /* SQR-018: with Pause all automations on, a running scheduled build admits no new work; the step in flight
       finishes and the run waits at that safe point until you turn the switch off */
    const pz=pauseGate(null);if(!pz.ok)return msgError(pz.clause,pz.detail);
    for(const b of schedules){const valid=buildRoute(b);if(!valid.ok)return valid;
      const w=buildWindow(b,Number.isFinite(b.clock_ms)?b.clock_ms:Date.now());if(!w.ok||!w.open)return msgError('window_inactive','Outside execution window. The same unfinished PlanRun is retained.');
      if(w.phase==='winding_down'){
        const running=PM56_TODOS.get(b.thread_id).some(t=>t.run_id===run&&t.status==='in_progress');
        if(!running)return msgError('window_wind_down','Wind-down reached a safe boundary. No new work is admitted.');
      }
    }
    return {ok:true};
  }
  function quotaConsentFor(b){return P().quotaConsents.find(c=>c.run_id===b.plan_run_id&&c.provider_id===b.runtime_snapshot.provider&&c.account_id===b.runtime_snapshot.accountId&&c.enabled&&c.state==='active'&&c.user_stop_epoch===P().stopEpoch);}
  function setPlanQuotaConsent(planId,enabled){
    const p=PM56_PLANS.get(planId),b=P().buildSchedules.find(x=>x.target_id===planId&&x.plan_run_id===p?.approved?.plan_run_id&&x.state==='active');
    if(!b||p?.status!=='building')return msgError('target_not_found');
    const id='quota-plan:'+b.plan_run_id,old=P().quotaConsents.find(c=>c.consent_id===id),q=RT.quota||{};
    const row={consent_id:id,association_id:planId,schedule_id:b.schedule_id,run_id:b.plan_run_id,provider_id:b.runtime_snapshot.provider,account_id:b.runtime_snapshot.accountId,
      enabled:!!enabled,state:enabled?'active':'revoked',reset_time:q.resetAt||null,reset_truth:String(q.resetSource||'unknown').replaceAll(' ','_'),confidence:null,user_stop_epoch:P().stopEpoch,created_at:old?.created_at||nowIso(),updated_at:nowIso()};
    if(old)Object.assign(old,row);else P().quotaConsents.push(row);persistNow();return {ok:true,consent:copy(old||row)};
  }
  function windowTick(id,at,expected){
    const b=findBuild(id);if(!b||!Number.isFinite(at))return msgError('invalid_window_tick');
    if(expected&&(expected.revision!==b.revision||expected.currentness!==buildCurrent(b)||expected.epoch!==P().stopEpoch))return msgError('stale_window_decision');
    if(Number.isFinite(b.clock_ms)&&at<b.clock_ms)return msgError('clock_rewind_refused');
    if(!b.dispatchReceipt)return dispatchBuildAt(id,at,b.revision,expected?.epoch??b.user_stop_epoch);
    const p=PM56_PLANS.get(b.target_id);
    if(p?.status==='completed'){if(b.state==='active'){b.state='completed';b.runPhase='completed';b.revision++;persistNow();}return {ok:true,completed:true,plan_run_id:b.plan_run_id};}
    if(p?.status!=='building'||p.approved?.plan_run_id!==b.plan_run_id||!['active','paused'].includes(b.state))return msgError('run_no_longer_active');
    const stop=PM56_SCHED.checkEpoch({epoch:expected?.epoch??b.user_stop_epoch});if(!stop.ok)return stop;
    const pz=pauseGate(null);if(!pz.ok)return msgError(pz.clause,pz.detail);
    const route=buildRoute(b);if(!route.ok){b.held_reason=route.detail;persistNow();return route;}
    const w=buildWindow(b,at);if(!w.ok)return w;
    b.clock_ms=at;b.demoClockIso=new Date(at).toISOString();b.last_window_decision={at:b.demoClockIso,phase:w.phase,start:w.start||null,end:w.end||null};
    const inFlight=PM56_TODOS.get(b.thread_id).some(t=>t.run_id===b.plan_run_id&&t.status==='in_progress');
    if(!w.open||w.phase==='winding_down'&&!inFlight){
      if(p.attention&& !['window','quota_wait'].includes(p.attention.kind)){persistNow();return msgError('owner_attention_blocks_window_resume');}
      if(b.pause_kind==='quota')b.quota_resume_required=true;
      if(p.attention?.kind!=='window')PM56_PLANS.pauseForWindow(b.target_id,{plan_run_id:b.plan_run_id,version:b.exact_target_version,hash:b.exact_target_hash},!w.open?'Outside execution window':'Wind-down reached a safe boundary');
      b.window_pause=true;b.pause_kind='window';b.runPhase='paused_safe';b.held_reason=null;logBuildLine(b,'Window paused the existing run at a session-local safe boundary; completed outputs and work bindings retained.');persistNow();return {ok:true,paused:true,plan_run_id:b.plan_run_id,window:w};
    }
    if(w.phase==='winding_down'){b.runPhase='winding_down';persistNow();return {ok:true,winding_down:true,atomic_operation_may_finish:true,window:w};}
    if(RT.quota?.waiting){
      if(!p.attention||['window','quota_wait'].includes(p.attention.kind))PM56_PLANS.pauseForWindow(b.target_id,{plan_run_id:b.plan_run_id,version:b.exact_target_version,hash:b.exact_target_hash},'Waiting for Usage','quota_wait');
      b.pause_kind='quota';b.quota_resume_required=true;b.window_pause=true;b.held_reason='Usage remains unavailable. Window and Usage eligibility must both pass.';persistNow();return msgError('quota_unavailable',b.held_reason);
    }
    if(p.attention){
      if(!['window','quota_wait'].includes(p.attention.kind)||!b.window_pause)return msgError('manual_pause_or_owner_block');
      if(!b.auto_resume_next_window)return msgError('window_resume_not_authorized');
      if((b.quota_resume_required||b.pause_kind==='quota')&&!quotaConsentFor(b))return msgError('quota_resume_consent_required');
      const resumed=PM56_PLANS.resumeFromWindow(b.target_id,{plan_run_id:b.plan_run_id,version:b.exact_target_version,hash:b.exact_target_hash});
      if(!resumed.ok)return resumed;
      b.window_pause=false;b.pause_kind=null;b.quota_resume_required=false;b.runPhase='admitted';b.held_reason=null;b.lastOccurrenceStart=new Date(w.start).toISOString();
      if(!b.occurrencesFired.includes(b.lastOccurrenceStart))b.occurrencesFired.push(b.lastOccurrenceStart);
      logBuildLine(b,'Resumed the SAME PlanRun in this eligible window. No completed operation was repeated.');persistNow();return {ok:true,resumed:true,plan_run_id:b.plan_run_id,window:w};
    }
    b.runPhase='admitted';b.held_reason=null;persistNow();return {ok:true,already_running:true,plan_run_id:b.plan_run_id,window:w};
  }

  function computeNextOccurrence(rec, fromMs) {
    if (rec.schedule_kind === 'one_time') return null;
    var hhmm = parseHHMM(rec.local_start);
    return nextOccurrenceUTC(rec.timezone, rec.days_of_week, hhmm.h, hhmm.m, fromMs);
  }
  function idempotencyKey(rec) {
    return rec.schedule_id + '/' + rec.target_id + '/' + rec.exact_target_hash + '/' + (rec.lastOccurrenceStart || '—');
  }
  /* The seeded slots predate the frozen route and scope snapshots that commitBuild writes, so the demo line could
     never admit them (target_not_found). The first demo use completes a SEED record from the live state it was
     shown in: its Plan's thread, this chat's worktree and permissions, the chat's model, and the Plan's own hash
     when the Plan is still at the bound version. Wand-made records are never touched. */
  function completeSeedBuild(rec) {
    if (!SEED_IDS[rec.schedule_id] || rec.thread_id || rec.binding_kind !== 'plan_content_v1') return;
    var api = window.PM56_PLANS, plan = api && api.get(rec.target_id), c = EXT.ctx && EXT.ctx(), scope = plan && window.PM56_GOAL && PM56_GOAL.scope(plan.thread_id);
    var model = c && modelById(c.state.model || (D.models || [])[0] && D.models[0].id);
    if (!plan || !c || !scope || !model) return;
    rec.thread_id = plan.thread_id; rec.owner_worktree_snapshot = scope.worktreeId; rec.worktree_snapshot = c.state.worktree; rec.permission_snapshot = c.state.permissions;
    rec.runtime_snapshot = { modelId: model.id, modelName: model.name, provider: model.provider, accountId: model.accountId };
    if (plan.version === rec.exact_target_version) rec.exact_target_hash = api.hash(plan.plan_id);
  }
  function advanceWindow(id) {
    var rec = findBuild(id); if (!rec) return { refused: true, detail: 'Schedule not found.' };
    completeSeedBuild(rec);
    if(rec.binding_kind==='plan_content_v1'&&!rec.dispatchReceipt){
      /* "Jump to the next start": a slot without a stored next occurrence walks to its real next start (the seed
         records carry none, so the demo line used to refuse every time with window_not_open) */
      var nextAt=rec.schedule_kind==='one_time'?Date.parse(rec.scheduled_at_utc):Date.parse(rec.next_occurrence_at)||computeNextOccurrence(rec,Number.isFinite(rec.clock_ms)?rec.clock_ms:Date.now());
      var dispatched=dispatchBuildAt(id,nextAt,rec.revision,rec.user_stop_epoch);
      return {refused:!dispatched.ok,duplicate:!!dispatched.duplicate,detail:dispatched.ok?'Scheduled build started.':SCHED_REFUSE[dispatched.clause]||dispatched.detail||dispatched.clause};
    }
    if(rec.binding_kind==='plan_content_v1'&&rec.dispatchReceipt){
      const at=Number.isFinite(rec.clock_ms)?rec.clock_ms:Date.now(),w=buildWindow(rec,at);
      const next=w.open?w.end:w.next;
      if(!Number.isFinite(next))return {refused:true,detail:'No further eligible boundary.'};
      const out=windowTick(id,next,captureBuild(id));return {...out,refused:!out.ok,detail:out.detail||out.error||'Calendar boundary evaluated for the same PlanRun.'};
    }
    if (rec.state !== 'active') return { refused: true, detail: 'This schedule is ' + rec.state + '; nothing to advance.' };
    var epoch = P().stopEpoch;
    var elig = evaluateEligibility('build', rec, epoch);
    if (!elig.ok) {
      logBuildLine(rec, 'Advance refused: ' + elig.detail);
      logEvent('runtime.quota_resume_attempted', id, elig.clause, elig.detail);
      persistNow();
      return { refused: true, detail: elig.detail };
    }
    if (rec.runPhase === 'idle' || rec.runPhase === 'paused_safe') {
      var fromMs = new Date(rec.demoClockIso).getTime();
      var occMs = null, occStart;
      if (rec.schedule_kind === 'one_time') {
        if (rec.occurrencesFired.length) {
          rec.state = 'completed'; rec.updatedAt = nowIso();
          logBuildLine(rec, 'One-time build already ran; nothing further to admit.');
          persistNow();
          return { refused: false, detail: 'Completed.' };
        }
        occStart = rec.scheduled_at_utc || rec.demoClockIso;
      } else {
        occMs = computeNextOccurrence(rec, fromMs);
        if (occMs == null) {
          var d2 = 'No matching day of week is configured, so no next occurrence can be computed.';
          logBuildLine(rec, d2); persistNow();
          return { refused: true, detail: d2 };
        }
        occStart = new Date(occMs).toISOString();
      }
      if (rec.occurrencesFired.indexOf(occStart) >= 0) {
        logBuildLine(rec, 'Duplicate window-open suppressed for occurrence ' + occStart + ' — idempotency key already resolved.');
        persistNow();
        return { refused: false, duplicate: true, detail: 'Duplicate suppressed.' };
      }
      rec.occurrencesFired.push(occStart);
      rec.lastOccurrenceStart = occStart;
      rec.runPhase = 'admitted';
      var resuming = rec.occurrencesFired.length > 1;
      logBuildLine(rec, 'Window opened at ' + to12h(rec.local_start) + ' ' + tzLabel(rec.timezone) + ' (occurrence ' + occStart + '). Build ' + (resuming ? 'resumed — the same unfinished run, not a new build' : 'admitted') + '.');
      if (occMs != null) rec.demoClockIso = new Date(occMs + 3 * 60000).toISOString();
      logEvent('scheduled_dispatch.dispatched', id, null, 'Window opened; run admitted for occurrence ' + occStart + '.');
    } else if (rec.runPhase === 'admitted') {
      rec.runPhase = 'winding_down';
      logBuildLine(rec, 'Wind-down began (' + Math.round(rec.wind_down_seconds / 60) + ' min before pause): no new large or non-checkpointable work admitted; the current bounded operation continues to a safe point.');
    } else if (rec.runPhase === 'winding_down') {
      rec.runPhase = 'paused_safe';
      logBuildLine(rec, 'Reached a safe checkpoint. State and To-Do work bindings persisted, then paused' + (rec.local_pause ? (' at ' + to12h(rec.local_pause) + ' ' + tzLabel(rec.timezone)) : '') + '.');
      if (rec.schedule_kind === 'one_time') { rec.state = 'completed'; logBuildLine(rec, 'One-time build completed.'); }
    }
    rec.updatedAt = nowIso();
    persistNow();
    return { refused: false, detail: 'Advanced.' };
  }
  function fireDuplicateOccurrence(id) {
    var rec = findBuild(id); if (!rec || !rec.lastOccurrenceStart) return null;
    if(rec.binding_kind==='plan_content_v1'){
      const out=dispatchBuildAt(id,Date.parse(rec.lastOccurrenceStart),rec.revision,rec.user_stop_epoch);if(!(out.ok&&out.duplicate))return null;
      /* the repeat is written down, so the log and Events say "nothing ran twice" instead of staying silent */
      logBuildLine(rec,'Duplicate timer fire for occurrence '+rec.lastOccurrenceStart+' suppressed by idempotency key "'+idempotencyKey(rec)+'"; the original run was returned.');
      logEvent('scheduled_dispatch.dispatched',id,null,'Duplicate fire suppressed; original run returned for occurrence '+rec.lastOccurrenceStart+'.');
      persistNow();return rec;
    }
    logBuildLine(rec, 'Duplicate timer fire simulated for occurrence ' + rec.lastOccurrenceStart + ' → suppressed by idempotency key "' + idempotencyKey(rec) + '"; original result returned.');
    logEvent('scheduled_dispatch.dispatched', id, null, 'Duplicate fire suppressed; original result returned for occurrence ' + rec.lastOccurrenceStart + '.');
    persistNow();
    return rec;
  }
  function jumpToTransition(id, which) {
    var rec = findBuild(id); if (!rec || rec.schedule_kind !== 'recurring_window') return null;
    var trans = tzTransitions(rec.timezone, new Date().getFullYear());
    var hit = null;
    for (var i = 0; i < trans.length; i++) { if (trans[i].kind === which) { hit = trans[i]; break; } }
    if (!hit) return null;
    rec.demoClockIso = new Date(hit.instant - 20 * 3600000).toISOString();
    rec.runPhase = 'idle';
    logBuildLine(rec, 'Demo clock jumped to just before the ' + (which === 'spring_forward' ? 'spring-forward' : 'fall-back') + ' transition for a live test. This is a client-local convenience for the concept lab, never a real capability.');
    persistNow();
    return rec;
  }

  /* =====================================================================
     7. QUOTA RESUME CONSENT — SQR-005. Reads/updates the SHARED RT.quota
     that composer-state.js renders; never renders a second strip or a
     second checkbox here.
     ===================================================================== */
  // Bind this local consent to the admitted Goal, never current UI focus on reset.
  function bindGoalQuotaConsent(enabled){
    const G=window.PM56_GOAL,g=G?.get();if(!g||g.demo||!g.activeRunRef||G.cancelled(g))return null;
    const id='quota-'+g.id,prior=P().quotaConsents.find(x=>x.consent_id===id);
    const row={consent_id:id,enabled:!!enabled,state:enabled?'active':'revoked',goal_id:g.id,goal_token:G.capture(g),run_id:g.activeRunRef,thread_id:g.thread,project_id:g.projectId,association_id:g.binding?.assistant_plan_id||g.id,scope:'this_goal_and_run_only',updated_at:nowIso()};
    if(prior)Object.assign(prior,row);else P().quotaConsents.push(row);persistNow();return row;
  }
  document.addEventListener('change',e=>{if(e.target.getAttribute?.('data-cs-input')==='quota-resume')bindGoalQuotaConsent(e.target.checked);});
  function attemptAutoResume() {
    var epoch = P().stopEpoch;
    var elig = evaluateEligibility('quota', null, epoch);
    var consent = P().quotaConsents[0] || null;
    if (consent) {
      consent.enabled = !!(RT.quota && RT.quota.resumeAutomatically);
      consent.reset_time = RT.quota ? (RT.quota.resetAt || null) : null;
      consent.reset_truth = RT.quota ? String(RT.quota.resetSource || 'unknown').replace(/ /g, '_') : 'unknown';
      consent.user_stop_epoch = epoch;
      consent.updated_at = nowIso();
    }
    logEvent('runtime.quota_resume_attempted', consent ? consent.consent_id : 'quota', elig.clause, elig.detail);
    if(elig.ok){
      const bound=P().quotaConsents.filter(x=>x.enabled&&x.state==='active'&&x.goal_token);
      const outcomes=bound.map(x=>({consent_id:x.consent_id,...window.PM56_GOAL.resumeFromQuota(x.goal_token)}));
      elig={...elig,goal_outcomes:outcomes};
      if(outcomes.some(x=>!x.ok))elig={...elig,ok:false,clause:'goal_resume_fenced',detail:'One or more captured Goal consents were stale, manually stopped, or no longer eligible. No stopped Goal was resumed.'};
    }
    persistNow();
    return elig;
  }
  function simulateQuotaReset() {
    if (RT.quota) RT.quota.waiting = false;
    logEvent('runtime.quota_wait_started', 'quota', null, 'Simulated: the provider usage window reopened.');
    return attemptAutoResume();
  }

  /* =====================================================================
     8. RENDERERS
     ===================================================================== */
  /* The canon state words (principle 10; IMPACT A1-26): every scheduled face prints its word first. One table, the
     shared copy deck's (PMX_COPY.sched), read by the bubble, the receipts, the manager rows and the dock. */
  var STATE_WORD = (SH.PMX_COPY && SH.PMX_COPY.sched) || { scheduled: 'Scheduled', held: 'Held', sent: 'Sent', canceled: 'Canceled', failed: 'Failed', expired: 'Expired' };
  /* build schedules: the word the row's .mdl-chip holds (G-21), drawn as a glyph and a word, never a capsule */
  var BUILD_WORD = { active: 'Active', paused: 'Paused', canceled: 'Canceled', cancelled: 'Canceled', completed: 'Completed', invalidated: 'Needs update', held: 'Held', expired: 'Skipped' };
  var BUILD_GLYPH = { active: 'clock', paused: 'pause', canceled: 'slash-circle', cancelled: 'slash-circle', completed: 'check', invalidated: 'warn', held: 'warn', expired: 'slash-circle' };
  /* Option catalogs: one per enum per surface (IMPACT A3-01), {value, label, description}. The trigger, its
     openChoice menu (a distinct line per option, C.5) and every reading line take their words from here. The
     values are the stored enums and never change. `{grace}` is the minutes the schedule waits before it skips. */
  var MISSED_MSG_OPTIONS = [
    { value: 'hold', label: 'Ask me first', description: 'Holds the message and asks you when you’re back. Default.' },
    { value: 'next_available', label: 'Send as soon as I’m back', description: 'Sends once, late.' },
    { value: 'cancel_after_grace', label: 'Skip it if it’s more than {grace} min late', description: 'Skips it and tells you.' }];
  var MISSED_BUILD_OPTIONS = [
    { value: 'hold', label: 'Ask me first', description: 'Holds the build and asks you when you’re back. Default.' },
    { value: 'next_available', label: 'Build at the next chance', description: 'Starts in the next slot.' },
    { value: 'cancel_after_grace', label: 'Skip it if it’s more than {grace} min late', description: 'Skips that night and tells you.' }];
  var TOPOLOGY_OPTIONS = [
    { value: 'agent', label: 'The assistant builds it', description: 'One assistant works through the steps.' },
    { value: 'goal_driven', label: 'As a Goal', description: 'Keeps working toward it step by step. The Goal is created only when the build starts.' },
    { value: 'crew', label: 'A Crew', description: 'Several AI helpers split the work.' }];
  /* the manager's filters (8.9): the stored values are unchanged (b18 filters on `completed`), the words are plain */
  var MANAGER_STATUS_OPTIONS = [
    { value: 'all', label: 'Everything', description: 'Every schedule, whatever happened to it.' },
    { value: 'active', label: 'Waiting', description: 'Set for later and not due yet.' },
    { value: 'paused', label: 'Paused', description: 'Build slots stopped for the night, to go on in the next slot.' },
    { value: 'held', label: 'Needs you', description: 'Held, or waiting for your OK on a new plan version.' },
    { value: 'completed', label: 'Done or sent', description: 'Sent messages and finished builds.' },
    { value: 'failed', label: 'Didn’t send', description: 'It tried and couldn’t be delivered.' },
    { value: 'expired', label: 'Skipped', description: 'It was too late, so it was skipped as you asked.' },
    { value: 'canceled', label: 'Canceled', description: 'You canceled it. The record stays here.' }];
  var MANAGER_SORT_OPTIONS = [
    { value: 'time_asc', label: 'Soonest first', description: 'The next thing to happen at the top.' },
    { value: 'time_desc', label: 'Latest first', description: 'The most recent at the top.' }];
  /* A Crew needs a plan whose steps are tied to real work it can split (plans.js workRef, the check
     PM56_COLLAB.preparePlanCrew makes); on any other plan the option is listed, disabled, with its reason */
  var CREW_OFF = 'Not for this plan: its steps aren’t set up to be split between helpers.';
  function crewAllowed(planId) { var p = window.PM56_PLANS && PM56_PLANS.get(planId); return !!(p && p.workRef); }
  function topologyMenu(planId) {
    var ok = crewAllowed(planId);
    return choiceMenu(TOPOLOGY_OPTIONS).map(function (o) { return o.value === 'crew' && !ok ? Object.assign(o, { disabled: true, reason: CREW_OFF }) : o; });
  }
  function optionOf(list, value) { for (var i = 0; i < list.length; i++) if (list[i].value === value) return list[i]; return list[0]; }
  function optionWords(o, grace) { return String(o.label).replace('{grace}', String(Math.round(Number(grace) || SCHED_DEFAULTS.message.graceMinutes))); }
  function choiceMenu(list, grace) { return list.map(function (o) { return { value: o.value, label: optionWords(o, grace), description: o.description }; }); }
  /* the device's own zone first (and the default), then the ten offered; a zone outside them stays selectable */
  function tzChoiceOptions(current) {
    var dev = deviceZone(), ids = [dev].concat(TZ_OPTIONS.map(function (t) { return t.id; }).filter(function (id) { return id !== dev; }));
    if (ids.indexOf(current) < 0) ids.splice(1, 0, current);
    return ids.map(function (id) { return { value: id, label: zoneCity(id), description: zoneLine(id) }; });
  }

  /* Refusals (9.3): the owner's code stays in data-failure and the reader gets one plain sentence. The shared map
     (PM56_SHELL.pmxRefusalText) holds the scheduling codes; these add the ones it does not know or words it for a
     collaboration helper. An unknown code keeps the owner's own sentence, so the substrings the harnesses read
     ("needs selected bytes", "Freeze browser context") always survive. */
  var SCHED_REFUSE = {
    route_unavailable: 'That model or account isn’t available right now. Pick another one; we never swap it for you.',
    target_not_found: 'This chat is no longer available.',
    invalid_local_time: 'Pick a date and a time.',
    invalid_timezone: 'Pick a time zone.',
    local_time_unresolvable: 'That time doesn’t exist in this time zone. Pick another.',
    invalid_grace: 'The skip time must be between 1 and 1,440 minutes.',
    invalid_missed_policy: 'Pick what happens if it’s missed.',
    invalid_window: 'Pick a start and a stop time, and at least one night.',
    no_days: 'Pick at least one night.',
    same_times: 'Start and stop must be different times.',
    dispatch_already_started: 'This has already started, so its schedule can’t change now.',
    invalid_schedule_configuration: 'Check the times and minutes, then retry.',
    invalid_topology: 'Pick who builds it.',
    scope_changed: 'Something about this chat changed while this was open. Reopen to see the latest.',
    idempotency_key_required: 'This changed somewhere else. Reopen to see the latest.',
    workflow_configuration_requires_its_owner: 'A workflow setup can’t be sent later. Start it now instead.',
    destination_scope_mismatch: 'That destination belongs to another chat.',
    schedule_form_changed: 'This changed while it was saving. Reopen to see the latest.',
    crew_configuration_required: 'Set up the Crew first.',
    crew_definition_changed: 'The Crew changed since you set it up. Set it up again.',
    plan_not_ready_for_crew: 'A Crew can’t build this plan: its steps aren’t set up to be split between helpers. Pick another way to build it.'
  };
  function refuse(d, code, detail, vars) { if (!d) return; d.errorCode = code || ''; d.error = detail || ''; d.errorVars = vars || null; }
  function clearRefusal(d) { if (d) { d.errorCode = ''; d.error = ''; d.errorVars = null; } }
  function refusalHtml(d) {
    if (!d || !(d.errorCode || d.error)) return '';
    var code = d.errorCode || '', vars = d.errorVars || {}, strong = 'Can’t schedule yet.', text;
    if (code === 'invalid_message_text') vars.tooLong = String(d.text || '').length > 8000;
    var shared = code && !SCHED_REFUSE[code] ? SH.pmxRefusalText(code, vars) : null;
    if (SCHED_REFUSE[code]) text = SCHED_REFUSE[code];
    else if (shared) { text = shared.text; if (shared.strong) strong = shared.strong; }
    else text = d.error || code.replace(/_/g, ' ');
    return SH.pmxRefusal({ cls: 'sched-form-error', code: code || 'refused', strong: esc(strong), text: esc(text) });
  }
  /* .sched-form-error[role=alert] is always in the foot, empty when nothing is refused (B.12) */
  function refusalSlot(d) { return refusalHtml(d) || ''; }

  var EMPTY_ALERT = '<p class="sched-form-error" role="alert"></p>';
  /* DL-136 lead ruling: creating a schedule never lifts Pause all automations; while it is on, the sheet says so in
     one plain line before its primary, and the new item is recorded and waits like the others */
  var PAUSE_NOTE = 'Pause all automations is on, so this will wait until you turn it off.';
  /* it takes the read-back's second sentence (the foot keeps its 80 px, so the sheet never scrolls for it; the model,
     the destination and the slot's details stay in the body) */
  function pausePart(key) { return { key: key, html: '<span class="pmx-sched-pausenote">' + PAUSE_NOTE + '</span>' }; }

  /* '' when the wall time resolves in the future, else the refusal code */
  function validateWall(date,time,zone){const r=PM56_SCHEDULE_TIME.resolve(zone,PM56_SCHEDULE_TIME.parse(date,time));return !r.ok?(r.error==='invalid_timezone'?'invalid_timezone':'invalid_local_time'):r.at<=Date.now()?'time_not_future':'';}


  /* =====================================================================
     6. THE TWO SHEETS (DESIGN-SPEC 8.7 Schedule Message, 8.8 Build At),
     built from the pmx primitives (PM56_SHELL.pmx*). Hooks kept (B.12):
     .sched-dialog(--message|--build) on the root; the real inputs the
     harnesses fill (msg-date, msg-time, build-start, build-pause,
     build-date, build-time) always visible; the hidden msg-tz / build-tz
     inputs bound to the zone (plan-demo-batch2 writes them); the
     preserved dropdown triggers (sched-pick-*); one .sched-form-error
     [role=alert], always present; and after a commit, a confirmation in
     the same sheet whose Done carries sched-close-dialog (A4-03: the
     confirmation exists only after a durable commit).
     ===================================================================== */
  var T0 = window.PM56_SCHEDULE_TIME;
  var MON_FIRST = [1, 2, 3, 4, 5, 6, 0];
  function nowMinute() { return Math.floor(Date.now() / 60000) * 60000; }
  function zp(zone, t) { return T0.parts(zone, t); }
  function ymdOf(p) { return p.y + '-' + pad2(p.mo) + '-' + pad2(p.d); }
  function dayWord(t, zone) { var p = zp(zone, t); return p ? DAY_LABELS[T0.weekday(p)] : ''; }
  function dayLabel(t, zone) { var p = zp(zone, t); return p ? DAY_LABELS[T0.weekday(p)] + ', ' + MONTHS[p.mo - 1] + ' ' + p.d : ''; }
  function clockAt(t, zone) { return SH.pmxTime.at(t, zone, { day: false }); }
  function untilLabel(t, now) {
    var m = Math.round((t - now) / 60000);
    if (m <= 0) return 'now';
    if (m < 60) return 'in ' + m + ' min';
    if (m < 1440) { var h = Math.floor(m / 60), r = m % 60; return 'in ' + h + ' h' + (r ? ' ' + r + ' m' : ''); }
    var d = Math.round(m / 1440); return 'in ' + d + (d === 1 ? ' day' : ' days');
  }
  /* "Sat 10:00 PM" within the coming week, else "Mon, May 10 at 10:00 PM" */
  function whenShort(t, zone, now) { return Math.abs(t - now) < 6 * 86400000 ? dayWord(t, zone) + ' ' + clockAt(t, zone) : dayLabelY(t, zone, now) + ' at ' + clockAt(t, zone); }
  /* "Mon, Jan 6, 2020": the year is printed whenever it is not this year */
  function dayLabelY(t, zone, now) { var p = zp(zone, t), q = zp(zone, now); return dayLabel(t, zone) + (p && q && p.y !== q.y ? ', ' + p.y : ''); }
  function cap1(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function nightsWord(days) {
    var d = (days || []).slice().sort(), k = d.join(',');
    if (k === '1,2,3,4,5') return 'weeknights';
    if (d.length === 7) return 'every night';
    if (k === '0,6') return 'weekend nights';
    if (!d.length) return 'no nights';
    var names = MON_FIRST.filter(function (x) { return d.indexOf(x) >= 0; }).map(function (i) { return DAY_LABELS[i]; });
    return names.length === 1 ? names[0] + ' nights' : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] + ' nights';
  }
  /* the stepper builds ±1 steps; minutes step by 5 (FOUNDATION REQUEST: a `step` option on pmxStepper) */
  function stepBy(html, n) { return html.replace('data-delta="-1"', 'data-delta="-' + n + '"').replace('data-delta="1"', 'data-delta="' + n + '"'); }
  /* the ink keys restart on every open, so nothing inks on open (M2). A drag
     rewrites the time every frame; ink waits for pointerup so the read-back
     does not flash on each step. */
  function inked(key, text) { if (ui.schedDrag) return esc(text); var P2 = window.PM56_PMX; return P2 && P2.ink ? P2.ink('sched:' + (ui.openSeq || 0) + ':' + key, text) : esc(text); }
  function tzTrigger(ctx, action, anchor, zone) {
    return SH.pickerButton({ action: action, anchor: anchor, strong: esc(zoneCity(zone)), small: esc(zoneShort(zone)), iconHtml: ctx.icon('down', 11) });
  }
  /* card 8 (2026-10-08): no Technical details outside a setup sheet's Advanced page (techBlock removed) */
  /* the missed-slot trigger; with "Skip it if…" chosen, the real minutes input (a stepper) sits beside it and
     writes grace_seconds (IMPACT A1-42) */
  function missedControl(ctx, action, anchor, opt, d, graceKey) {
    var trig = SH.pickerButton({ action: action, anchor: anchor, strong: esc(optionWords(opt, d.grace)), iconHtml: ctx.icon('down', 11) });
    if (opt.value !== 'cancel_after_grace') return trig;
    return '<div class="pmx-sched-missrow">' + trig + stepBy(SH.pmxStepper({ key: 'sched-' + graceKey + '-step', input: { key: graceKey, attrs: 'data-sched-input="' + graceKey + '"' },
      value: Math.round(Number(d.grace) || SCHED_DEFAULTS.message.graceMinutes), min: 5, max: 1440, unit: 'min', cells: false, affects: 'missed' }), 5) + '</div>';
  }
  function ctlIn(key, label, affects, control) { return SH.pmxCtl({ key: key, layout: 'stack', label: label, affects: affects, control: control }); }

  /* ---------------------------------------------------------------- the next 48 hours (8.7 plate) */
  var TRACK_H = 106;
  /* a plate label's half width, generous for the widest theme font (Poppins, the retro mono): 3.8 px a character */
  function labelHalf(text) { return String(text).length * 3.8 + 2; }
  var NOW_W = 24;  /* the "now" label */
  /* shared with the drag so the drawing and the pointer can never disagree */
  function trackFrame(zone, now, W) {
    var X0 = 24, X1 = W - 24, span = 48 * 3600000;
    var p0 = zp(zone, now - 2 * 3600000);
    var start = now - 2 * 3600000 - ((p0 ? p0.mi : 0) * 60000 + (p0 ? p0.s : 0) * 1000);
    return { start: start, end: start + span, span: span, X0: X0, X1: X1 };
  }
  function trackSvg(d, w, now, W) {
    var PP = SH.pmxPlateParts, zone = d.timezone, TL = 44, full = W >= 700;
    var f = trackFrame(zone, now, W), start = f.start, end = f.end, span = f.span, X0 = f.X0, X1 = f.X1;
    function x(t) { return Math.round((X0 + (t - start) / span * (X1 - X0)) * 10) / 10; }
    var sendX = w.ok ? (w.at < start ? X0 : w.at > end ? X1 : x(w.at)) : null, nowX = x(now);
    var labStep = full ? 6 : 12, minorStep = full ? 1 : 3, out = '', firstMid = null;
    /* LINT-4: an hour label keeps 16 px from either end of the track (12 px from the plate edge whatever the clock
       says) and 8 px from the "now" label, which is drawn to the left of the now line */
    var nowBox = [nowX - 10 - NOW_W, nowX - 10];
    for (var t = start; t <= end; t += 3600000) {
      var q = zp(zone, t); if (!q || q.mi !== 0) continue;
      var hx = x(t), major = q.h === 0, mid = !major && q.h % labStep === 0;
      if (!major && !mid && q.h % minorStep) continue;
      out += '<line class="pmx-sched-tick" data-kind="' + (major ? 'day' : mid ? 'mark' : 'hour') + '" x1="' + hx + '" x2="' + hx + '" y1="' + (major ? 24 : mid ? 37 : 40) + '" y2="' + TL + '"/>';
      if (major) {
        if (firstMid == null) firstMid = hx;
        if (hx + 10 + 84 <= X1) out += PP.label({ x: hx + 10, y: 20, text: esc(dayLabel(t, zone)), cls: 'lab', part: 'when' });
      } else if (mid && Math.abs(hx - nowX) > 40 && (sendX == null || Math.abs(hx - sendX) > 26)) {
        var hw = hourWord(pad2(q.h) + ':00'), half = labelHalf(hw);
        if (hx - X0 >= 16 && X1 - hx >= 16 && !(hx + half + 8 > nowBox[0] && hx - half - 8 < nowBox[1]))
          out += PP.label({ x: hx, y: 66, text: esc(hw), anchor: 'middle', cls: 'sub' });
      }
    }
    if (firstMid == null || firstMid - X0 > 108) out = PP.label({ x: X0, y: 20, text: esc(dayLabel(start + 3600000, zone)), cls: 'lab', part: 'when' }) + out;
    out += PP.line({ key: 'sched-trk', from: { x: X0, y: TL }, to: { x: X1, y: TL }, style: 'fixed', part: 'when' });
    if (w.ok && !w.past && d.missed === 'cancel_after_grace' && w.at <= end) {
      var gx = Math.min(X1, x(w.at + (Number(d.grace) || 30) * 60000));
      if (gx - sendX >= 3) out += '<g class="pmx-sched-grace" data-pmx-part="missed">' + PP.hatch(sendX, TL - 4, Math.round((gx - sendX) * 10) / 10, 8) + '</g>';
    }
    out += '<g class="pmx-sched-now" data-pmx-part="when"><line x1="' + nowX + '" x2="' + nowX + '" y1="' + (TL - 10) + '" y2="' + (TL + 10) + '"/>' +
      PP.label({ x: nowX - 10, y: 66, text: 'now', anchor: 'end' }) + '</g>';
    out += '<rect class="pmx-sched-hit" x="' + X0 + '" y="' + (TL - 20) + '" width="' + (X1 - X0) + '" height="40"/>';
    if (w.ok && w.past) {
      out += PP.label({ x: X0, y: 92, text: 'That time has passed. Pick a later one.', cls: 'lab' }).replace('<text ', '<text data-state="past" ');
    } else if (w.ok) {
      var late = w.at > end, state = late ? 'later' : 'on';
      var say = late ? 'Sends ' + w.day : 'Sends ' + w.clock;
      var right = sendX > X1 - 170;
      out += '<g class="pmx-sched-marker" data-state="' + state + '" data-pmx-part="when" style="--x:' + sendX + 'px"><rect class="pmx-sched-grab" x="-12" y="' + (TL - 18) + '" width="24" height="52"/><line x1="0" x2="0" y1="' + TL + '" y2="80"/>' +
        '<circle class="pmx-sched-dot" cx="0" cy="' + TL + '" r="4"/>' + PP.glyph('clock', -7, 80, 14) +
        PP.label({ x: right ? -14 : 14, y: 92, text: esc(say), anchor: right ? 'end' : 'start', cls: 'lab' }) + '</g>';
    } else {
      out += PP.label({ x: X0, y: 92, text: 'Pick a date and a time', cls: 'lab' });
    }
    return out;
  }
  function trackPlate(d, w, now) {
    function one(mode, W) {
      var fr = trackFrame(d.timezone, now, W);
      var attrs = 'data-sched-t0="' + fr.start + '" data-sched-span="' + fr.span + '" data-sched-x0="' + fr.X0 + '" data-sched-x1="' + fr.X1 + '"';
      return SH.pmxPlate({ key: 'sched-track-' + mode, kind: 'schedule', mode: mode, w: W, h: TRACK_H, fitH: TRACK_H, svg: trackSvg(d, w, now, W), cls: 'pmx-sched-plate', attrs: attrs });
    }
    var frame = trackFrame(d.timezone, now, 904), minA = Math.ceil((Date.now() + 60000) / 300000) * 300000;
    var valueNow = w.ok ? w.at : minA, valueText = w.ok ? (w.day + ' · ' + w.clock + ' · ' + w.rel) : 'Pick a date and a time';
    return '<div class="pmx-sched-slot" data-k="sched-track-slot" data-sched-drag role="slider" tabindex="0" aria-label="Send time" aria-valuemin="' + minA + '" aria-valuemax="' + frame.end + '" aria-valuenow="' + valueNow + '" aria-valuetext="' + esc(valueText) + '"' + (ui.schedDrag ? ' data-dragging=""' : '') + '>' +
      SH.pmxPlateFit({ key: 'sched-track', kind: 'schedule', affects: 'when', plates: [one('full', 904), one('compact', 580)] }) + '</div>';
  }

  /* ---------------------------------------------------------------- the week map (8.8 plate) */
  /* J-2: the hour labels sit 11 px under the plate's top edge and the Sun row's label 12 px over its floor; the grid
     lines end 6 px under the last row, never at the edge; the first row line sits 8 px under the hour labels */
  var WEEK_H = 146;
  function weekSvg(d, now, W) {
    var PP = SH.pmxPlateParts, zone = d.timezone, X0 = 58, X1 = W - 18, one = d.kind === 'one_time', full = W >= 700;
    function x(min) { return Math.round((X0 + min / 1440 * (X1 - X0)) * 10) / 10; }
    function rowY(r) { return 31 + r * 16; }
    var out = '', hours = full ? [0, 6, 12, 18, 24] : [0, 12, 24];
    hours.forEach(function (h, i) {
      var hx = x(h * 60);
      out += PP.label({ x: hx, y: 20, text: hourWord(pad2(h % 24) + ':00'), anchor: i === 0 ? 'start' : i === hours.length - 1 ? 'end' : 'middle', cls: 'sub' });
      out += '<line class="pmx-sched-grid" x1="' + hx + '" x2="' + hx + '" y1="30" y2="' + (rowY(6) + 6) + '"/>';
    });
    var np = zp(zone, now), todayWd = np ? T0.weekday(np) : -1, nowMin = np ? np.h * 60 + np.mi : 0;
    var onDays = one ? [] : (d.days || []), r1 = one ? T0.resolve(zone, T0.parse(d.date, d.time)) : null;
    if (r1 && r1.ok) onDays = [T0.weekday(zp(zone, r1.at))];
    MON_FIRST.forEach(function (wd, r) {
      out += PP.label({ x: 16, y: rowY(r) + 4, text: DAY_LABELS[wd], cls: onDays.indexOf(wd) >= 0 ? 'lab' : 'sub', part: 'days' });
      out += '<line class="pmx-sched-row" x1="' + X0 + '" x2="' + X1 + '" y1="' + rowY(r) + '" y2="' + rowY(r) + '"/>';
    });
    var rowOf = function (wd) { return MON_FIRST.indexOf(((wd % 7) + 7) % 7); };
    if (!one) {
      var S = parseHHMM(d.startTime), E = parseHHMM(d.pauseTime), s = S.h * 60 + S.m, e = E.h * 60 + E.m, wrap = e <= s;
      var len = wrap ? 1440 - s + e : e - s, wind = Math.max(0, Math.min(len, Math.round(Number(d.windDown) || 0)));
      var nx = s === e ? null : T0.next(zone, d.days, S.h, S.m, now), nxp = nx ? zp(zone, nx) : null, nxWd = nxp ? T0.weekday(nxp) : -1, n = 0;
      var paint = function (wd, a, b, part, next, seg) {
        if (b - a < 1) return;
        var r = rowOf(wd), y = rowY(r) - 4, x0 = x(a), w0 = Math.max(1.5, Math.round((x(b) - x0) * 10) / 10);
        if (part === 'wind') { var hp = ''; for (var c = 3; c < w0 + 8; c += 3) hp += 'M' + (x0 + Math.max(0, c - 8)).toFixed(1) + ' ' + (y + Math.min(8, c)).toFixed(1) + 'L' + (x0 + Math.min(w0, c)).toFixed(1) + ' ' + (y + Math.max(0, c - w0)).toFixed(1);
          out += '<g class="pmx-sched-wrapup" data-pmx-part="wind"><rect x="' + x0 + '" y="' + y + '" width="' + w0 + '" height="8" rx="1"/><path d="' + hp + '"/></g>'; }
        else out += '<rect class="pmx-sched-band" data-k="wk:' + wd + ':' + seg + '" data-next="' + (next ? 1 : 0) + '" data-pmx-part="when days" x="' + x0 + '" y="' + y + '" width="' + w0 + '" height="8" rx="2" style="--i:' + Math.min(6, n++) + '"/>';
      };
      if (s !== e) (d.days || []).slice().sort(function (a, b) { return rowOf(a) - rowOf(b); }).forEach(function (wd) {
        var next = wd === nxWd, cut = len - wind;
        if (!wrap) { paint(wd, s, s + cut, 'band', next, 'a'); paint(wd, s + cut, e, 'wind', next); return; }
        var first = 1440 - s;
        paint(wd, s, s + Math.min(first, cut), 'band', next, 'a');
        if (cut > first) paint(wd + 1, 0, cut - first, 'band', next, 'b');
        if (cut < first) { paint(wd, s + cut, 1440, 'wind', next); paint(wd + 1, 0, e, 'wind', next); }
        else paint(wd + 1, cut - first, e, 'wind', next);
      });
    } else {
      var r0 = T0.resolve(zone, T0.parse(d.date, d.time));
      if (r0.ok) {
        var tp = zp(zone, r0.at), soon = r0.at - now < 7 * 86400000 && r0.at > now, rr = rowOf(T0.weekday(tp)), m = tp.h * 60 + tp.mi, mx = x(m);
        out += '<g class="pmx-sched-once" data-pmx-part="when"><circle class="pmx-sched-dot" cx="' + mx + '" cy="' + rowY(rr) + '" r="4"/>' + (soon ? '' : PP.glyph('chevron-right', X1 + 2, rowY(rr) - 6, 12)) + '</g>';
      }
    }
    /* on the first row the line starts lower, so it keeps 8 px clear of an hour label above it (J-2; Mondays near a label) */
    if (todayWd >= 0) { var nr = rowOf(todayWd), ny = rowY(nr); out += '<line class="pmx-sched-nowline" data-pmx-part="when" x1="' + x(nowMin) + '" x2="' + x(nowMin) + '" y1="' + (ny - (nr === 0 ? 2 : 7)) + '" y2="' + (ny + (nr === 0 ? 9 : 7)) + '"/>'; }
    return out;
  }
  function nextWords(d, now) {
    if (d.kind === 'one_time' || !d.days || !d.days.length || d.startTime === d.pauseTime) return '';
    var S = parseHHMM(d.startTime), nx = T0.next(d.timezone, d.days, S.h, S.m, now); if (!nx) return '';
    var a = zp(d.timezone, now), b = zp(d.timezone, nx), gap = Math.round((Date.UTC(b.y, b.mo - 1, b.d) - Date.UTC(a.y, a.mo - 1, a.d)) / 86400000);
    return gap === 0 ? 'tonight' : gap === 1 ? 'tomorrow night' : DAY_LABELS[T0.weekday(b)] + ' night';
  }
  function weekPlate(d, now) {
    function one(mode, W) { return SH.pmxPlate({ key: 'sched-week-' + mode, kind: 'build-at', mode: mode, w: W, h: WEEK_H, fitH: WEEK_H, svg: weekSvg(d, now, W), cls: 'pmx-sched-plate' }); }
    var nw = nextWords(d, now), once = d.kind === 'one_time' ? T0.resolve(d.timezone, T0.parse(d.date, d.time)) : null;
    var legend = once ? '<ul class="pmx-sched-legend" aria-hidden="true">' + (once.ok ? '<li data-pmx-part="when"><i class="pmx-sched-sw" data-kind="dot"></i>Builds ' + esc(dayLabel(once.at, d.timezone) + ' at ' + clockAt(once.at, d.timezone)) + '</li>' : '') +
      '<li data-pmx-part="when"><i class="pmx-sched-sw" data-kind="now"></i>Now</li></ul>' : '<ul class="pmx-sched-legend" aria-hidden="true">' +
      '<li data-pmx-part="when"><i class="pmx-sched-sw" data-kind="band"></i>Builds</li>' +
      (Number(d.windDown) > 0 ? '<li data-pmx-part="wind"><i class="pmx-sched-sw" data-kind="wind"></i>Wraps up: no new tasks</li>' : '') +
      (nw ? '<li data-pmx-part="when"><i class="pmx-sched-sw" data-kind="next"></i>Next: ' + esc(nw) + '</li>' : '') +
      '<li data-pmx-part="when"><i class="pmx-sched-sw" data-kind="now"></i>Now</li></ul>';
    return '<div class="mdl-section pmx-sched-week" data-k="sched-week"><div class="pmx-sched-slot pmx-sched-slot--week" data-k="sched-week-slot">' +
      SH.pmxPlateFit({ key: 'sched-week', kind: 'build-at', affects: 'when', plates: [one('full', 904), one('compact', 580)] }) + '</div>' +
      '<div class="pmx-sched-weekfoot">' + legend + '</div></div>';
  }

  /* ---------------------------------------------------------------- Schedule Message (8.7) */
  function msgWhen(d, now) {
    var r = T0.resolve(d.timezone, T0.parse(d.date, d.time));
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, at: r.at, kind: r.kind, day: dayLabelY(r.at, d.timezone, now), clock: clockAt(r.at, d.timezone), rel: untilLabel(r.at, now), past: r.at <= now, short: whenShort(r.at, d.timezone, now) };
  }
  /* Presets write the real date and time inputs (8.7): In 1 hour · Tonight 10 PM · Tomorrow 9 AM · Monday 9 AM */
  function msgPresets(d, now) {
    var zone = d.timezone, p = zp(zone, now); if (!p) return [];
    function at(shiftDays, h) { var q = T0.shift({ y: p.y, mo: p.mo, d: p.d, h: 0, mi: 0 }, shiftDays); return { date: ymdOf(q), time: pad2(h) + ':00' }; }
    var h1 = zp(zone, Math.ceil((now + 3600000) / 300000) * 300000), list = [];
    list.push({ value: 'hour', label: 'In 1 hour', date: ymdOf(h1), time: pad2(h1.h) + ':' + pad2(h1.mi) });
    var early = p.h * 60 + p.mi < 21 * 60 + 30;
    list.push(Object.assign({ value: 'tonight', label: early ? 'Tonight 10 PM' : 'Tomorrow 10 PM' }, at(early ? 0 : 1, 22)));
    list.push(Object.assign({ value: 'morning', label: 'Tomorrow 9 AM' }, at(1, 9)));
    var wd = T0.weekday(p), toMon = ((1 - wd + 7) % 7) || 7; if (toMon === 1) toMon = 8;
    /* on a Sunday "Tomorrow 9 AM" is already Monday, and on a Monday the next one is a week away: the date is named */
    var mq = T0.shift({ y: p.y, mo: p.mo, d: p.d, h: 0, mi: 0 }, toMon);
    list.push(Object.assign({ value: 'monday', label: toMon >= 7 ? 'Mon, ' + MONTHS[mq.mo - 1] + ' ' + mq.d + ' · 9 AM' : 'Monday 9 AM' }, at(toMon, 9)));
    return list;
  }
  function destWords(d, th) {
    var dest = d.destination;
    if (!dest || dest.kind === 'assistant') return { rb: 'this chat', say: 'To <b>this chat</b>' + (th && th.title ? ' (' + esc(th.title) + ')' : '') };
    return { rb: esc(dest.label || 'its destination'), say: 'To <b>' + esc(dest.label || 'its destination') + '</b>' };
  }
  /* "Claude Sonnet 4.6 (Work)": the account's nickname, as the model trigger shows it */
  function modelWords(id) { var m = modelById(id), nick = m && m.account ? String(m.account).split(' · ')[0] : ''; return m ? m.name + (nick && nick !== '—' ? ' (' + nick + ')' : '') : 'the chosen model'; }
  function msgSheetBase(editing) {
    return { type: 'sched-message', kind: 'schedule', size: 'standard', cls: 'sched-dialog sched-dialog--message', scrimClose: 'sched-close-dialog', closeAction: 'sched-close-dialog',
      ariaLabel: 'Schedule Message', title: editing ? 'Change this scheduled message' : 'Schedule a message', markHtml: SH.pmxKindMark('schedule', 26) };
  }
  function renderMessageDialog(ctx) {
    if (ui.msgConfirm) return renderMessageConfirm(ctx, ui.msgConfirm);
    var d = ui.msgDraft || (ui.msgDraft = defaultMsgDraft(ctx)), editing = !!ui.editingMsgId, th = threadByIdRaw(d.threadId), text = String(d.text || '');
    var now = nowMinute(), w = msgWhen(d, now), dw = destWords(d, th), files = d.attachments || [];
    var base = msgSheetBase(editing);
    base.lead = 'We’ll send exactly what you see here, to ' + (dw.rb === 'this chat' ? 'this chat' : dw.rb) + ', at the time you pick. Nothing is sent until then.';
    /* hero: the message as a future bubble (a dashed full outline), with what goes with it under it */
    var fileSay = files.length ? '<span>' + SH.pmxGlyph('file', 13) + '<span><b>' + files.length + (files.length === 1 ? ' file' : ' files') + '</b> · ' + esc(attachmentLabel(files[0])) +
      (files.length > 1 ? ' +' + (files.length - 1) + ' more' : '') + ' · sends ' + (files.length === 1 ? 'this exact copy' : 'these exact copies') + '</span></span>' : '';
    var hero = '<section class="mdl-section pmx-sched-hero" data-k="sched-msg-hero"><div class="pmx-sched-draft">' +
      '<textarea class="sched-text pmx-sched-text" data-sched-input="msg-text" data-pmx-autofocus rows="3" maxlength="8000" aria-label="Your message" placeholder="Type the message to send later…">' + esc(text) + '</textarea></div>' +
      '<p class="pmx-sched-under">' + fileSay + '<span class="pmx-sched-to">' + dw.say + '</span></p></section>';
    /* when: presets over the 48-hour track, then the real inputs and the resolved sentence */
    var presets = SH.pmxWords({ key: 'sched-presets', cls: 'pmx-sched-presets', action: 'sched-preset', affects: 'when', label: 'Quick picks',
      items: msgPresets(d, now).map(function (p) { return { value: p.value, label: p.label, on: p.date === d.date && p.time === d.time }; }) });
    var mine = d.timezone === deviceZone(), resolved;
    if (!w.ok) resolved = 'Pick a date and a time.';
    else if (w.past) resolved = '<b>' + inked('when', w.day + ' · ' + w.clock) + '</b> <span class="pmx-sched-late">has already passed. Pick a later time.</span>';
    else resolved = '<b>' + inked('when', w.day + ' · ' + w.clock) + '</b><span class="pmx-sched-zone">' + (mine ? 'your time (' + esc(zoneCity(d.timezone)) + ')' : esc(zoneCity(d.timezone)) + ' time') + ' ·</span><span class="pmx-sched-rel">' + esc(w.rel) + '</span>';
    var dstSay = w.ok && w.kind === 'gap_forward' ? 'Clocks jump forward that night, so this sends at ' + w.clock + '.'
      : w.ok && w.kind === 'fold_first' ? 'That hour happens twice that night, so we’ll send the first time.' : '';
    var inputs = '<div class="pmx-sched-inputs" data-k="sched-msg-inputs">' +
      ctlIn('sched-msg-date', 'Date', 'when', '<input type="date" data-sched-input="msg-date" value="' + esc(d.date) + '" aria-label="Date">') +
      ctlIn('sched-msg-time', 'Time', 'when', '<input type="time" data-sched-input="msg-time" value="' + esc(d.time) + '" aria-label="Time">') +
      ctlIn('sched-msg-zone', 'Time zone', 'when', tzTrigger(ctx, 'sched-pick-msg-tz', 'sched-msg-tz', d.timezone) + '<input type="hidden" data-sched-input="msg-tz" data-pmx-harness value="' + esc(d.timezone) + '">') +
      '<p class="pmx-sched-resolved" data-state="' + (w.ok && !w.past ? 'ok' : 'check') + '">' + resolved + '</p></div>' +
      (dstSay ? '<p class="pmx-sched-dstsay">' + SH.pmxGlyph('clock', 13) + '<span>' + esc(dstSay) + '</span></p>' : '');
    var when = SH.pmxQuestion({ key: 'sched-msg-when', cls: 'pmx-sched-when', title: 'When should it send?', meta: presets, body: trackPlate(d, w, now) + inputs });
    /* lower: who answers it and what happens if it is missed. Schedule Message
       has no promise lines and no Technical details (card 8: Build At, the
       manager and the record have none either). */
    var missed = optionOf(MISSED_MSG_OPTIONS, d.missed);
    var route = SH.pmxCtl({ key: 'sched-msg-route', layout: 'stack', label: 'Answered by', affects: 'route',
      helper: 'We’ll use exactly this model and account. If it isn’t available then, we’ll hold the message and ask you. We never swap it.',
      control: window.PM56_PICKERS.modelButton('sched-pick-model', 'schedule-model', d.modelId) });
    var miss = SH.pmxCtl({ key: 'sched-msg-missed', layout: 'stack', label: 'If Puppet Master is closed at that time', affects: 'missed', helper: esc(missed.description),
      control: missedControl(ctx, 'sched-pick-msg-missed', 'sched-msg-missed-pick', missed, d, 'msg-grace') });
    var lower = '<div class="pmx-sched-lower" data-k="sched-msg-lower"><div class="pmx-sched-cell">' + route + '</div><div class="pmx-sched-cell">' + miss + '</div></div>';
    /* foot: the read-back in the voice, the refusal in its place when Schedule is refused */
    var over = text.length > 8000, empty = !text.trim();
    var reason = empty ? 'Write a message first.' : over ? 'That’s too long (8,000 characters max).' : '';
    var rb = SH.pmxReadback({ key: 'sched-msg-rb', parts: !reason && autoPause().paused ? [{ html: 'Sends ' }, { part: 'when', html: w.ok ? '<b>' + inked('rbwhen', w.day + ' at ' + w.clock) + '</b>. ' : 'at the time you pick. ' }, pausePart('sched-msg-pausenote')] : reason ? [{ html: 'Sends to <b>' + dw.rb + '</b> ' }, { part: 'when', html: w.ok ? 'on <b>' + inked('rbwhen', w.day + ' at ' + w.clock) + '</b>.' : 'at the time you pick.' }] : [
      { html: 'Sends exactly this text' + (files.length ? ' and <b>' + files.length + (files.length === 1 ? ' file' : ' files') + '</b>' : '') + ' to <b>' + dw.rb + '</b> ' },
      { part: 'when', html: w.ok ? 'on <b>' + inked('rbwhen', w.day + ' at ' + w.clock) + '</b> ' : '' },
      { part: 'route', html: 'using <b>' + inked('rbmodel', modelWords(d.modelId)) + '</b>.' }] });
    var refusal = refusalSlot(d);
    base.body = hero + when + lower;
    base.foot = SH.pmxFoot({ cls: 'pmx-sched-foot', readback: rb + EMPTY_ALERT, refusal: refusal, extra: '<button type="button" class="text-button pmx-sched-all" data-action="sched-open-manage">See all scheduled…</button>',
      cancel: { action: 'sched-close-dialog' },
      primary: { action: 'sched-create-message', label: ui.snapshotBusy ? 'Saving your files…' : editing ? 'Save changes' : w.ok && !w.past ? 'Schedule for ' + esc(w.short) : 'Schedule',
        disabled: !!reason || ui.snapshotBusy, reason: reason } });
    return SH.pmxSheet(base);
  }
  function renderMessageConfirm(ctx, c) {
    var base = msgSheetBase(c.editing);
    base.lead = 'We’ll send exactly what you see here, to ' + c.destRb + ', at the time you pick. Nothing is sent until then.';
    base.body = SH.pmxConfirm({ key: 'sched-msg-confirm', cls: 'pmx-sched-confirm', markHtml: '<div class="pmx-sched-sealed" data-k="sched-sealed"><span class="pmx-sched-sealtext">' + esc(c.text) + '</span></div>',
      headline: esc(c.headline), text: (c.editing ? 'It still waits in your chat until it sends. Nothing was sent.' : 'It waits in your chat until it sends. Your message box is cleared.') + (autoPause().paused ? ' ' + PAUSE_NOTE : '') });
    base.foot = SH.pmxFoot({ cls: 'pmx-sched-foot pmx-sched-foot--done', readback: SH.pmxReadback({ key: 'sched-msg-rb-done', parts: [{ html: c.readback }] }) + EMPTY_ALERT,
      cancel: { action: 'sched-open-manage', label: 'See all scheduled' }, primary: { action: 'sched-close-dialog', label: 'Done' } });
    return SH.pmxSheet(base);
  }
  function messageConfirmation(rec, editing) {
    var now = nowMinute(), zone = rec.timezone, at = Date.parse(rec.scheduled_at_utc), files = (rec.attachment_refs || []).length, th = threadByIdRaw(rec.thread_id);
    var dw = destWords({ destination: rec.destination_ref }, th), short = whenShort(at, zone, now), full = dayLabelY(at, zone, now) + ' at ' + clockAt(at, zone);
    return { id: rec.scheduled_dispatch_id, text: rec.text, editing: !!editing, destRb: dw.rb,
      headline: (editing ? 'Updated: sends ' : 'Scheduled for ') + short + '.',
      readback: 'Sends exactly this text' + (files ? ' and <b>' + files + (files === 1 ? ' file' : ' files') + '</b>' : '') + ' to <b>' + dw.rb + '</b> on <b>' + esc(full) + '</b>.' };  /* the sheet's own read-back form */
  }

  /* ---------------------------------------------------------------- Build At (8.8) */
  function buildSlot(d) { return d.kind === 'one_time' ? { kind: 'once', date: d.date, time: d.time } : { kind: 'recurring', start: d.startTime, stop: d.pauseTime, days: d.days, windDownMinutes: d.windDown }; }
  function buildWords(d) {
    var zone = zoneCity(d.timezone);
    if (d.kind === 'one_time') {
      var r = T0.resolve(d.timezone, T0.parse(d.date, d.time)), now = nowMinute();
      var when = r.ok ? (r.at - now < 6 * 86400000 && r.at > now ? dayWord(r.at, d.timezone) + ' ' + clockAt(r.at, d.timezone) : dayLabel(r.at, d.timezone) + ' at ' + clockAt(r.at, d.timezone)) : '';
      return { ok: r.ok, primary: when ? 'Schedule for ' + when : 'Schedule', headline: when ? 'Scheduled for ' + when + '.' : 'Scheduled.',
        parts: [{ part: 'when', html: 'Once, on <b>' + esc(r.ok ? dayLabel(r.at, d.timezone) + ' at ' + clockAt(r.at, d.timezone) : 'the day you pick') + '</b> (' + esc(zone) + '). ' },
          { html: 'It keeps going until the plan is built or you stop it.' }] };
    }
    var slot = slotText(d.startTime, d.pauseTime), nights = nightsWord(d.days), S = parseHHMM(d.pauseTime);
    var windAt = minuteClock(S.h * 60 + S.m - (Math.round(Number(d.windDown)) || 0));
    return { ok: true, primary: 'Schedule ' + nights + ' ' + slot, headline: 'Scheduled: ' + nights + ', ' + slot + '.',
      parts: [{ part: 'when days', html: esc(cap1(nights)) + ', <b>' + inked('slot', slotText(d.startTime, d.pauseTime)) + '</b> (' + esc(zone) + '). ' },
        { part: 'wind', html: Number(d.windDown) > 0 ? 'Stops starting new tasks at <b>' + inked('wind', windAt) + '</b>. ' : 'Starts new tasks until the slot ends. ' },
        { html: d.autoResumeNext ? 'Unfinished work continues the next night.' : 'Unfinished work waits until you continue it.' }] };
  }
  function crewStrip(def) {
    if (!def || !Array.isArray(def.participants)) return '';
    var clamp = SH.pmxClamp({ asked: def.requested_concurrency || 1, runs: 1, planBound: true });
    return '<p class="pmx-sched-cast">' + def.participants.map(function (q, i) {
      return '<span class="pmx-sched-castitem">' + SH.pmxMark({ role: q.persona, seat: i + 1, size: 18 }) + '<span><b>' + esc(q.role) + '</b> ' + esc(q.model_name || '') + '</span></span>';
    }).join('') + '</p>' + (clamp && clamp.card ? '<p class="pmx-fine pmx-sched-castnote">' + esc(clamp.card) + '</p>' : '');
  }
  function buildSheetBase(editing, version) {
    return { type: 'sched-build-at', kind: 'build-at', size: 'standard', cls: 'sched-dialog sched-dialog--build', scrimClose: 'sched-close-dialog', closeAction: 'sched-close-dialog',
      ariaLabel: 'Build At…', title: editing ? 'Change this build schedule' : 'Build this plan later', markHtml: SH.pmxKindMark('build-at', 26),
      lead: 'We’ll build <b>this exact version (V' + esc(version) + ')</b> at the times you choose. If you edit the plan, we’ll pause and ask before building the new version.' };
  }
  function renderBuildDialog(ctx) {
    var x = ctx.state.dialog;
    if (ui.buildConfirm) return renderBuildConfirm(ctx, ui.buildConfirm);
    var d = ui.buildDraft; if (!d || d.planId !== x.planId) d = ui.buildDraft = defaultBuildDraft(x.planId, x.version);
    if (d.executionTopology === 'crew' && !crewAllowed(d.planId) && !d.crewDefinition) d.executionTopology = 'agent';
    var one = d.kind === 'one_time', now = nowMinute(), editing = !!ui.editingBuildId;
    var base = buildSheetBase(editing, d.version);
    var guide = window.PM56_SCHEDULE_DEMOS ? window.PM56_SCHEDULE_DEMOS.dialogGuide(ctx) : '';
    /* when */
    var sw = SH.pmxSwitch({ key: 'sched-bld-kind', action: 'sched-set-build-kind', current: d.kind, affects: 'when', label: 'When', options: [
      { value: 'one_time', label: 'One time', helper: 'Builds once, at the time you pick.' },
      { value: 'recurring_window', label: 'Nightly time slot', helper: 'Builds in the same slot on the days you pick.' }] });
    var zoneCtl = ctlIn('sched-bld-zone', 'Time zone', 'when', tzTrigger(ctx, 'sched-pick-build-tz', 'sched-build-tz', d.timezone) + '<input type="hidden" data-sched-input="build-tz" data-pmx-harness value="' + esc(d.timezone) + '">');
    var inputs = one
      ? ctlIn('sched-bld-date', 'Date', 'when', '<input type="date" data-sched-input="build-date" value="' + esc(d.date) + '" aria-label="Date">') +
        ctlIn('sched-bld-time', 'Start at', 'when', '<input type="time" data-sched-input="build-time" value="' + esc(d.time) + '" aria-label="Start at">')
      : ctlIn('sched-bld-start', 'Start at', 'when', '<input type="time" data-sched-input="build-start" value="' + esc(d.startTime) + '" aria-label="Start at">') +
        ctlIn('sched-bld-stop', 'Stop by', 'when', '<input type="time" data-sched-input="build-pause" value="' + esc(d.pauseTime) + '" aria-label="Stop by">');
    var dst = describeDst(d.timezone, buildSlot(d), 'build');
    var dstHtml = '<p class="sched-dst">' + dst.lines.map(function (l) { return '<span class="sched-dst-line">' + esc(l) + '</span>'; }).join('') + '</p>';
    var whenQ = SH.pmxQuestion({ key: 'sched-bld-when', cls: 'pmx-sched-bwhen', title: 'When should it build?', body: sw + '<div class="pmx-sched-inputs pmx-sched-inputs--three" data-k="sched-bld-inputs">' + inputs + zoneCtl + '</div>' + dstHtml });
    var nightly = one ? '' :
      SH.pmxCtl({ key: 'sched-bld-days', cls: 'pmx-sched-days', label: 'Days', affects: 'days', control: SH.pmxWords({ key: 'sched-bld-daywords', action: 'sched-toggle-day', label: 'Days', affects: 'days',
        items: MON_FIRST.map(function (i) { return { value: String(i), label: DAY_LABELS[i], on: d.days.indexOf(i) >= 0, attrs: 'data-day="' + i + '"' }; }) }) }) +
      SH.pmxCtl({ key: 'sched-bld-wind', label: 'Wrap-up time', helper: 'Stop starting new tasks this many minutes before the end, so nothing is cut off mid-way.', affects: 'wind',
        control: stepBy(SH.pmxStepper({ key: 'sched-bld-wind-step', input: { key: 'build-wind', attrs: 'data-sched-input="build-wind"' }, value: Math.round(Number(d.windDown) || 0), min: 0, max: 60, unit: 'min', cells: false, affects: 'wind' }), 5) });
    /* who, if missed, promises */
    var topo = optionOf(TOPOLOGY_OPTIONS, d.executionTopology || 'agent');
    /* the Crew's own action sits under its trigger; the cast (once set up) is a block under the row */
    var cast = topo.value === 'crew' ? crewStrip(d.crewDefinition) : '';
    var crew = cast ? '<div class="pmx-sched-crew" data-k="sched-bld-crew">' + cast + '</div>' : '';
    var crewBtn = topo.value !== 'crew' ? '' : '<button type="button" class="text-button pmx-sched-crewbtn" data-action="sched-configure-crew">' + (d.crewDefinition ? 'Change the Crew…' : 'Set up the Crew…') + '</button>';
    var keep = one ? '' : SH.pmxCheck({ key: 'sched-bld-keep', cls: 'pmx-sched-keep', label: 'Keep going next time', helper: 'Unfinished work continues in the next slot.', checked: !!d.autoResumeNext, affects: 'when', attrs: 'data-action="sched-toggle-autoresume" aria-label="Keep going next time"' });
    var picker = SH.pickerButton({ action: 'sched-pick-build-topology', anchor: 'sched-build-topology', strong: esc(topo.label), iconHtml: ctx.icon('down', 11) });
    var who = SH.pmxCtl({ key: 'sched-bld-who', cls: crewBtn ? 'pmx-sched-who--crew' : '', label: 'Who builds it', affects: 'who', helper: topo.value === 'crew' ? 'Choose the Crew now; you won’t be asked anything at night.' : esc(topo.description),
      control: crewBtn ? '<div class="pmx-sched-whoctl">' + picker + crewBtn + '</div>' : picker });
    var missed = optionOf(MISSED_BUILD_OPTIONS, d.missed);
    var miss = SH.pmxCtl({ key: 'sched-bld-missed', layout: 'stack', label: 'If the slot is missed', affects: 'missed', helper: esc(missed.description),
      control: missedControl(ctx, 'sched-pick-build-missed', 'sched-build-missed', missed, d, 'build-grace') });
    var grace = '';
    var promises = SH.pmxPromises(
      SH.pmxPromise({ key: 'sched-bp1', glyph: 'lock', text: 'If you edit the plan, we’ll ask before building the new version.' }) +
      SH.pmxPromise({ key: 'sched-bp2', glyph: 'pause', text: '<b>Pause all automations</b> always wins.' })) +
      '<p class="pmx-fine pmx-sched-pausefine">In Scheduled › Resume &amp; Safety Policy: it holds every scheduled send and build.</p>';
    /* foot */
    var words = buildWords(d), reason = !one && !d.days.length ? 'Pick at least one night.' : !one && d.startTime === d.pauseTime ? 'Start and stop must be different times.'
      : topo.value === 'crew' && !d.crewDefinition ? 'Set up the Crew first.' : '';
    /* a printed reason needs the foot's second row: the read-back keeps one line */
    if (reason) words.parts = !one && (!d.days.length || d.startTime === d.pauseTime) ? [{ part: 'when', html: 'Builds <b>' + esc(slotText(d.startTime, d.pauseTime)) + '</b> (' + esc(zoneCity(d.timezone)) + ') on the nights you pick.' }] : words.parts.slice(0, 1);
    base.guide = guide;
    base.hero = weekPlate(d, now);
    base.main = whenQ + nightly;
    base.side = who + crew + miss + grace + keep + promises;
    base.foot = SH.pmxFoot({ cls: 'pmx-sched-foot', readback: SH.pmxReadback({ key: 'sched-bld-rb', parts: !reason && autoPause().paused ? [words.parts[0], pausePart('sched-bld-pausenote')] : words.parts }) + EMPTY_ALERT, refusal: refusalSlot(d),
      estimate: dst.relevant ? SH.pmxEstimate({ text: esc(dst.relevant), cls: 'pmx-sched-dstnote' }) : '',
      cancel: { action: 'sched-close-dialog' },
      primary: { action: 'sched-create-build', attrs: 'data-plan-id="' + esc(d.planId) + '" data-plan-version="' + esc(d.version) + '"', label: esc(editing ? 'Save changes' : words.primary), disabled: !!reason, reason: reason } });
    return SH.pmxSheet(base);
  }
  function renderBuildConfirm(ctx, c) {
    var base = buildSheetBase(c.editing, c.version);
    base.guide = window.PM56_SCHEDULE_DEMOS ? window.PM56_SCHEDULE_DEMOS.dialogGuide(ctx) : '';
    /* the picture of what was scheduled stays: the week map, sealed (no entrance), with the next occurrence lit */
    base.body = SH.pmxConfirm({ key: 'sched-bld-confirm', cls: 'pmx-sched-confirm pmx-sched-confirm--build', markHtml: c.draft ? '<div class="pmx-sched-confirmweek" data-k="sched-confirm-week">' + weekPlate(c.draft, nowMinute()) + '</div>' : '<span class="pmx-sched-confirmmark">' + SH.pmxKindMark('build-at', 36) + '</span>', headline: esc(c.headline),
      text: 'Builds V' + esc(c.version) + ' of ' + esc(c.title) + ' while you’re away. If you edit the plan, we’ll ask before building the new version.' + (autoPause().paused ? ' ' + PAUSE_NOTE : ''), actions: tryNow(c.id) });
    base.foot = SH.pmxFoot({ cls: 'pmx-sched-foot pmx-sched-foot--done', readback: SH.pmxReadback({ key: 'sched-bld-rb-done', parts: [{ html: c.readback }] }) + EMPTY_ALERT,
      cancel: { action: 'sched-open-plan-record', attrs: 'data-id="' + esc(c.id) + '"', label: 'See it in Scheduled' }, primary: { action: 'sched-close-dialog', label: 'Done' } });
    return SH.pmxSheet(base);
  }
  /* the saved record's quiet demo line, folded (a native details whose open state the sheet keeps across a
     re-render): nothing runs in the background in this preview, so "Start it now" walks the local clock to the
     slot's start, exactly as the manager's row does. .schedule-item .schedule-details > summary is the record hook
     tests/b15 opens (G-23: b15 is read-only). */
  function tryNow(id) {
    var b = findBuild(id); if (!b || b.state !== 'active' || b.dispatchReceipt || b.binding_kind !== 'plan_content_v1') return '';
    var open = !!(ui.tryOpen && ui.tryOpen[id]);
    return '<div class="schedule-item pmx-sched-trynow" data-k="sched-try-' + esc(id) + '"><details class="schedule-details" data-sched-try="' + esc(id) + '"' + (open ? ' open' : '') + '>' +
      '<summary>' + SH.pmxGlyph('chevron-right', 13) + '<span>Try it without waiting</span></summary>' +
      '<p class="pmx-fine pmx-sched-demo">' + SH.pmxGlyph('play-ring', 13) + '<span>Demo:</span><button type="button" class="text-button" data-action="sched-advance-window" data-id="' + esc(id) + '">' +
      (b.schedule_kind === 'one_time' ? 'Jump to its start time' : 'Jump to the next start') + '</button></p></details></div>';
  }
  document.addEventListener('toggle', function (e) { var el = e.target; if (!el || !el.matches || !el.matches('details[data-sched-try]')) return; (ui.tryOpen || (ui.tryOpen = {}))[el.getAttribute('data-sched-try')] = el.open; }, true);
  document.addEventListener('toggle', function (e) { var el = e.target; if (!el || !el.matches || !el.matches('details[data-sched-raw]')) return; (ui.techOpen || (ui.techOpen = {}))['raw:' + el.getAttribute('data-sched-raw')] = el.open; }, true);
  function buildConfirmation(rec, d, editing) {
    var plan = window.PM56_PLANS && window.PM56_PLANS.get(rec.target_id), words = buildWords(d);
    var draft = d ? { kind: d.kind, date: d.date, time: d.time, startTime: d.startTime, pauseTime: d.pauseTime, days: (d.days || []).slice(), windDown: d.windDown, timezone: d.timezone } : null;
    return { id: rec.schedule_id, planId: rec.target_id, version: rec.exact_target_version, editing: !!editing, draft: draft, title: plan && plan.title ? '“' + plan.title + '”' : 'this plan',
      headline: editing ? 'Updated. ' + words.headline : words.headline, readback: words.parts.map(function (p) { return p.html; }).join('') };
  }

  /* =====================================================================
     7. THE SCHEDULED MANAGER (DESIGN-SPEC 8.9), a wide pmx sheet. The head
     says what is waiting in one sentence; the plate shows the next 48 hours
     (every scheduled message a mark, every build slot a band, now); the tab
     bar is pmxTabs with .sched-tabs (the four canon categories; b18 counts
     them); every tab but Resume & Safety Policy can be narrowed (G-30).
     Messages read as an agenda (Needs you, Tonight, Tomorrow, Later, Past)
     with exactly one [data-schedule-id] per record (b18); a focused record
     opens beside the agenda (45 / 55) with its full sentence, its lifecycle
     and its actions, and carries no schedule id. Build slots are rows keyed
     sched-bld-{id} with a .mdl-chip state word (a glyph and a word), a week
     strip, a night journal and the quiet demo line (sched-advance-window).
     Hovering a row lights its mark on the plate and the other way round
     (a template-emitted rule per record: the part vocabulary is fixed).
     Nothing here is a second quota strip: the usage limit is read-only and
     points at the notice in the chat (SQR-005).
     ===================================================================== */
  var MANAGER_TABS = [
    { value: 'messages', label: 'Scheduled Messages', help: 'Messages set to send later, the ones that need you, and the ones already sent.' },
    { value: 'builds', label: 'Execution & Build Windows', help: 'Plans set to build later: when each one may run, and what each night did.' },
    { value: 'quota', label: 'Resume & Safety Policy', help: 'What stops scheduled things from starting, and what happens at a usage limit.' },
    { value: 'events', label: 'Events & Automation', help: 'What scheduling did, newest first. Hover a line for its technical name.' }];
  var STATE_GLYPH = { scheduled: 'clock', held: 'warn', sent: 'check', canceled: 'slash-circle', failed: 'warn', expired: 'slash-circle' };
  /* Neon step 3E (2026-10-02): a schedule's state is drawn from the shared status set, lit and still
     (PM56_SHELL.pmxStatus): held waits on something (waiting-dep, the hourglass), sent and completed are complete,
     canceled and expired are skipped, failed is failed, paused is paused, a build that needs updating is the
     attention triangle. A schedule that is simply set (scheduled, active) keeps the clock, the concept every schedule
     surface draws. STATE_GLYPH / BUILD_GLYPH stay as the drawings used when the neon family is absent. */
  var STATE_MARK = { held: 'held', sent: 'complete', completed: 'complete', canceled: 'skipped', cancelled: 'skipped', expired: 'skipped', failed: 'failed', paused: 'paused', invalidated: 'attention' };
  function schedMark(st, size, old) {
    var s = STATE_MARK[st];
    return s && SH.pmxStatus ? SH.pmxStatus(s, size) : SH.pmxGlyph(old || 'clock', size);
  }
  function cssId(id) { return String(id || '').replace(/[^\w-]/g, '_'); }
  function managerFilter(tab) { var m = ui.managerFilters || (ui.managerFilters = {}); return m[tab] || (m[tab] = { status: 'all', query: '', sort: tab === 'events' ? 'time_desc' : 'time_asc' }); }
  function filterState(r, tab) {
    if (tab === 'events') return eventState(r);
    if (r.scheduled_dispatch_id) { var s = stateOf(r); return s === 'scheduled' ? 'active' : s === 'sent' ? 'completed' : s; }
    if (r.state === 'invalidated' || r.state === 'held') return 'held';
    if (r.state === 'cancelled') return 'canceled';
    if (r.state === 'active' && (r.runPhase === 'paused_safe' || r.window_pause)) return 'paused';
    return r.state;
  }
  function filterText(r, tab) {
    if (tab === 'events') return eventSentence(r) + ' ' + r.type;
    var plan = r.target_id && window.PM56_PLANS ? PM56_PLANS.get(r.target_id) : null;
    return [r.text, r.target_id, plan && plan.title, r.destination_ref && r.destination_ref.label, r.timezone, r.requested_runtime && r.requested_runtime.modelName].filter(Boolean).join(' ');
  }
  function filterTime(r, tab) {
    if (tab === 'events') return Date.parse(r.at) || 0;
    return Date.parse(r.dispatchedAt || r.scheduled_at_utc || r.next_occurrence_at || r.createdAt) || 0;
  }
  function visibleSchedules(rows, tab) {
    var f = managerFilter(tab), q = String(f.query || '').toLowerCase();
    return rows.filter(function (r) { return (f.status === 'all' || filterState(r, tab) === f.status) && (!q || filterText(r, tab).toLowerCase().indexOf(q) >= 0); })
      .sort(function (a, b) { var n = filterTime(a, tab) - filterTime(b, tab); return (f.sort === 'time_desc' ? -n : n) || String(a.scheduled_dispatch_id || a.schedule_id || a.id).localeCompare(String(b.scheduled_dispatch_id || b.schedule_id || b.id)); });
  }
  function managerSummary() {
    var S = P();
    var waiting = S.scheduledMessages.filter(function (m) { return stateOf(m) === 'scheduled'; }).length;
    var slots = S.buildSchedules.filter(function (b) { return ['active', 'paused'].indexOf(b.state) >= 0; }).length;
    var nm = S.scheduledMessages.filter(function (m) { return ['held', 'failed'].indexOf(stateOf(m)) >= 0; }).length, nb2 = S.buildSchedules.filter(function (b) { return ['invalidated', 'held'].indexOf(b.state) >= 0; }).length, needs = nm + nb2;
    var parts = [];
    /* the words match the tabs' counts: a tab counts what waits plus what needs you */
    if (waiting) parts.push(waiting + (waiting === 1 ? ' message waiting' : ' messages waiting'));
    if (slots) parts.push(slots + (slots === 1 ? ' build slot' : ' build slots'));
    if (needs) parts.push(needs + (needs === 1 ? ' needs you' : ' need you') + (nm && nb2 ? ' (' + nm + (nm === 1 ? ' message, ' : ' messages, ') + nb2 + (nb2 === 1 ? ' build)' : ' builds)') : ''));
    return parts.length ? parts.join(' · ') : 'Nothing scheduled yet';
  }

  /* ---------------------------------------------------------------- the next 48 hours */
  var MGR_H = 82;  /* the hour labels end 11 px over the floor (J-2) */
  function buildOccurrences(b, from, to) {
    if (b.schedule_kind === 'one_time') { var t = Date.parse(b.scheduled_at_utc); return isFinite(t) && t >= from && t <= to ? [{ start: t, end: t + 45 * 60000, once: true }] : []; }
    var S = parseHHMM(b.local_start), E = parseHHMM(b.local_pause), len = ((E.h * 60 + E.m) - (S.h * 60 + S.m) + 1440) % 1440 || 1440, out = [], at = from - len * 60000;
    for (var i = 0; i < 4; i++) {
      var n = T0.next(b.timezone, b.days_of_week, S.h, S.m, at);
      if (!n || n > to) break;
      out.push({ start: n, end: n + len * 60000, wind: Math.round((b.wind_down_seconds || 0) / 60) });
      at = n + 60000;
    }
    return out;
  }
  function mgrPlateSvg(now, W) {
    var PP = SH.pmxPlateParts, zone = deviceZone(), X0 = 24, X1 = W - 24, span = 48 * 3600000, TL = 38;
    var p0 = zp(zone, now), start = now - ((p0 ? p0.mi : 0) * 60000 + (p0 ? p0.s : 0) * 1000) - 2 * 3600000, end = start + span;
    function x(t) { return Math.round((X0 + (Math.max(start, Math.min(end, t)) - start) / span * (X1 - X0)) * 10) / 10; }
    var out = '', firstMid = null, step = W >= 900 ? 6 : 12, nowX = x(now);
    for (var t = start; t <= end; t += 3600000) {
      var q = zp(zone, t); if (!q || q.mi !== 0) continue;
      var hx = x(t), major = q.h === 0, mark = !major && q.h % step === 0;
      if (!major && !mark && q.h % 3) continue;
      out += '<line class="pmx-sched-tick" data-kind="' + (major ? 'day' : mark ? 'mark' : 'hour') + '" x1="' + hx + '" x2="' + hx + '" y1="' + (major ? 24 : mark ? 31 : 34) + '" y2="' + TL + '"/>';
      if (major) { if (firstMid == null) firstMid = hx; if (hx + 10 + 84 <= X1) out += PP.label({ x: hx + 10, y: 19, text: esc(dayLabel(t, zone)), cls: 'lab', part: 'when' }); }
      else if (mark && Math.abs(hx - nowX) > 34) {
        /* LINT-4: 16 px from either end of the track, 8 px from the "now" label (drawn to the right of the now line) */
        var mw = hourWord(pad2(q.h) + ':00'), mh = labelHalf(mw);
        if (hx - X0 >= 16 && X1 - hx >= 16 && !(hx + mh + 8 > nowX + 6 && hx - mh - 8 < nowX + 6 + NOW_W))
          out += PP.label({ x: hx, y: 68, text: esc(mw), anchor: 'middle', cls: 'sub' });
      }
    }
    if (firstMid == null || firstMid - X0 > 108) out = PP.label({ x: X0, y: 19, text: esc(dayLabel(start + 3600000, zone)), cls: 'lab', part: 'when' }) + out;
    out += PP.line({ key: 'sched-mgr-trk', from: { x: X0, y: TL }, to: { x: X1, y: TL }, style: 'fixed', part: 'when' });
    P().buildSchedules.forEach(function (b) {
      if (['active', 'paused'].indexOf(b.state) < 0) return;
      buildOccurrences(b, start, end).forEach(function (o, i) {
        var a = x(o.start), z = x(o.end), w = Math.max(3, Math.round((z - a) * 10) / 10), wz = o.wind ? Math.min(w, Math.round((x(o.end) - x(o.end - o.wind * 60000)) * 10) / 10) : 0;
        out += '<g class="pmx-sched-mark pmx-sched-slotmark" data-sched-mark="' + cssId(b.schedule_id) + '" data-pmx-part="when"><rect class="pmx-sched-band" x="' + a + '" y="' + (TL + 7) + '" width="' + Math.max(1.5, w - wz) + '" height="6" rx="2" style="--i:' + Math.min(6, i) + '"/>' +
          (wz >= 1.5 ? '<rect class="pmx-sched-windbar" x="' + (a + w - wz) + '" y="' + (TL + 7) + '" width="' + wz + '" height="6" rx="1"/>' : '') + '</g>';
      });
    });
    P().scheduledMessages.forEach(function (m) {
      if (stateOf(m) !== 'scheduled') return;
      var at = Date.parse(m.scheduled_at_utc); if (!(at >= start && at <= end)) return;
      out += '<g class="pmx-sched-mark" data-sched-mark="' + cssId(m.scheduled_dispatch_id) + '" data-pmx-part="when"><circle class="pmx-sched-dot" cx="' + x(at) + '" cy="' + TL + '" r="4.5"/></g>';
    });
    /* the now line starts 9 px under a day label that sits over it (just after midnight) */
    out += '<g class="pmx-sched-now" data-pmx-part="when"><line x1="' + nowX + '" x2="' + nowX + '" y1="' + (TL - 6) + '" y2="' + (TL + 14) + '"/>' + PP.label({ x: nowX + 6, y: 68, text: 'now', anchor: 'start' }) + '</g>';
    return out;
  }
  function managerPlate(now) {
    function one(mode, W) { return SH.pmxPlate({ key: 'sched-mgr-plate-' + mode, kind: 'scheduled', mode: mode, w: W, h: MGR_H, fitH: MGR_H, svg: mgrPlateSvg(now, W), cls: 'pmx-sched-plate' }); }
    var legend = '<ul class="pmx-sched-legend" aria-hidden="true"><li data-pmx-part="when"><i class="pmx-sched-sw" data-kind="dot"></i>A scheduled message</li>' +
      '<li data-pmx-part="when"><i class="pmx-sched-sw" data-kind="band"></i>A build slot</li><li data-pmx-part="wind"><i class="pmx-sched-sw" data-kind="wind"></i>Wrap-up</li>' +
      '<li data-pmx-part="when"><i class="pmx-sched-sw" data-kind="now"></i>Now</li></ul>';
    /* with Pause all automations on, the marks dim: nothing on the plate will start until it is turned back on */
    var paused = !!autoPause().paused;
    return '<div class="pmx-sched-slot pmx-sched-slot--mgr" data-k="sched-mgr-slot"' + (paused ? ' data-paused="1"' : '') + '>' + SH.pmxPlateFit({ key: 'sched-mgr-plate', kind: 'scheduled', affects: 'when', plates: [one('full', 1064), one('compact', 860), one('strip', 560)] }) + '</div>' +
      '<div class="pmx-sched-mgrlegend"><p class="pmx-fine">The next 48 hours, your time (' + esc(zoneCity(deviceZone())) + ').' + (paused ? ' Paused: none of this starts until you turn it off.' : '') + '</p>' + legend + '</div>';
  }
  /* a row and its plate mark light each other (CSS :has, one rule per record; nothing is written from JS) */
  function linkStyle(ids) {
    if (!ids.length) return '';
    var r = '#pmOverlayRoot .pmx-sched-mgr';
    return '<style data-k="sched-mgr-link">' + ids.map(function (id) {
      return r + ':has([data-sched-row="' + id + '"]:is(:hover,:focus-within)) [data-sched-mark="' + id + '"]{opacity:1;--pmx-sched-mark-ink:var(--accent);}' +
        r + ':has([data-sched-mark="' + id + '"]:hover) [data-sched-row="' + id + '"]{background-color:var(--pmx-wash);}';
    }).join('') + '</style>';
  }

  /* ---------------------------------------------------------------- the tools row (G-30) */
  function tools(ctx, tab) {
    var f = managerFilter(tab), ph = tab === 'builds' ? 'Search plans and time zones' : tab === 'events' ? 'Search what happened' : 'Search messages, chats and time zones';
    return '<div class="mdl-section pmx-sched-tools" data-k="sched-tools-' + tab + '">' +
      '<label class="pmx-sched-search">' + SH.pmxGlyph('search', 14) + '<input type="text" data-sched-input="manager-query" value="' + esc(f.query) + '" placeholder="' + ph + '" aria-label="Search"></label>' +
      '<span class="pmx-sched-toolpick"><span class="pmx-ctl-label">Show</span>' + SH.pickerButton({ action: 'sched-pick-manager-status', anchor: 'sched-manager-status', strong: esc(optionOf(MANAGER_STATUS_OPTIONS, f.status).label), iconHtml: ctx.icon('down', 11) }) + '</span>' +
      '<span class="pmx-sched-toolpick"><span class="pmx-ctl-label">Order</span>' + SH.pickerButton({ action: 'sched-pick-manager-sort', anchor: 'sched-manager-sort', strong: esc(optionOf(MANAGER_SORT_OPTIONS, f.sort).label), iconHtml: ctx.icon('down', 11) }) + '</span></div>';
  }
  function emptyLine(text) { return '<p class="pmx-sched-empty">' + text + '</p>'; }

  /* ---------------------------------------------------------------- Scheduled Messages */
  function rowActs(m, past) {
    var pr = messageProjection(m), id = esc(m.scheduled_dispatch_id), st = stateOf(m);
    var token = ' data-id="' + id + '" data-revision="' + m.revision + '" data-currentness="' + esc(msgCurrent(m)) + '"';
    var b = function (action, attrs, label, cls) { return '<button type="button" class="' + (cls || 'text-button') + ' pmx-act" data-action="' + action + '"' + attrs + '>' + label + '</button>'; };
    var sendNow = st === 'held' && (missedAt(m) != null || pauseHeld(m));
    return (sendNow ? b('sched-card-send-now', token, 'Send now') : '') +
      (pr.can_edit ? b('sched-card-edit', ' data-id="' + id + '"', st === 'held' ? (sendNow ? 'Reschedule' : 'Edit and send') : 'Edit') : '') +
      (pr.can_cancel ? b('sched-card-cancel', token, 'Cancel') : '') +
      (pr.dispatched_message_id ? b('sched-open-sent', ' data-id="' + id + '"', 'Open message') : '') +
      b('sched-focus-record', ' data-id="' + id + '"', 'Details');
  }
  function agendaRow(m, now, focusId, past) {
    var id = m.scheduled_dispatch_id, eid = esc(id), st = stateOf(m), zone = viewZone(), t = Date.parse(st === 'sent' && m.dispatchedAt || m.scheduled_at_utc), oz = otherZone(m.timezone);
    var focused = focusId === id, s = chatSentence(m, now), acts = focused ? '' : rowActs(m, past);
    var th = threadByIdRaw(m.thread_id), dest = destWords({ destination: m.destination_ref }, th);
    var head = '<div class="pmx-sched-row' + (past ? ' pmx-sched-row--past' : '') + '" data-k="schedule-' + eid + '" data-schedule-id="' + eid + '" data-sched-row="' + cssId(id) + '" data-state="' + st + '"' + (focused ? ' data-focused="1"' : '') + ' data-pmx-flip>' +
      '<span class="pmx-sched-rowglyph">' + schedMark(st, 15, STATE_GLYPH[st]) + '</span>';
    if (past) return head + '<span class="pmx-sched-rowtime">' + esc(dayMonth(t, zone) + ' · ' + hourWord(pad2((zp(zone, t) || {}).h || 0) + ':' + pad2((zp(zone, t) || {}).mi || 0))) + '</span>' +
      '<span class="pmx-sched-rowline">' + (st === 'sent' ? '<b class="pmx-sched-word">' + esc(s.word) + '</b>' : s.html) + (st === 'canceled' ? '' : ' · ' + esc(quoted(m.text, 60))) + '</span><span class="pmx-sched-rowacts">' + acts + '</span></div>';
    var today = zp(zone, now), tp = zp(zone, t), gap = today && tp ? Math.round((Date.UTC(tp.y, tp.mo - 1, tp.d) - Date.UTC(today.y, today.mo - 1, today.d)) / 86400000) : 9;
    return head + '<span class="pmx-sched-rowtime"><b>' + esc(clockAt(t, zone)) + '</b><small>' + esc(gap === 0 ? 'Today' : gap === 1 ? 'Tomorrow' : dayLabel(t, zone)) + '</small></span>' +
      '<span class="pmx-sched-rowcopy"><span class="pmx-sched-rowtext">' + esc(snippet(m.text, 160)) + '</span><span class="pmx-sched-rowsay">' + s.html + '</span>' +
      '<span class="pmx-sched-rowsub">' + (dest.rb === 'this chat' ? 'To ' + esc(th && th.title ? th.title : 'this chat') : 'To ' + dest.rb) + ' · ' + esc(modelWords(m.requested_runtime && m.requested_runtime.modelId)) +
        (oz ? ' · ' + esc(nb(clockAt(Date.parse(m.scheduled_at_utc), m.timezone)) + ' ' + oz) : '') + '</span></span>' +
      '<span class="pmx-sched-rowacts">' + acts + '</span></div>';
  }
  function messageAgenda(rows, now, focusId) {
    /* grouped by the day in the viewer's zone, the zone the rows' times and the plate are shown in */
    var g = { needs: [], today: [], tomorrow: [], later: [], past: [] }, vz = viewZone();
    rows.forEach(function (m) {
      var st = stateOf(m), at = Date.parse(m.scheduled_at_utc);
      if (st === 'held' || st === 'failed') { g.needs.push(m); return; }
      if (st !== 'scheduled') { g.past.push(m); return; }
      var p = zp(vz, at), q = zp(vz, now), gap = p && q ? Math.round((Date.UTC(p.y, p.mo - 1, p.d) - Date.UTC(q.y, q.mo - 1, q.d)) / 86400000) : 9;
      (gap <= 0 ? g.today : gap === 1 ? g.tomorrow : g.later).push(m);
    });
    var tonight = g.today.every(function (m) { var p = zp(vz, Date.parse(m.scheduled_at_utc)); return p && p.h >= 17; });
    var groups = [['needs', 'Needs you'], ['today', tonight ? 'Tonight' : 'Today'], ['tomorrow', 'Tomorrow'], ['later', 'Later'], ['past', 'Past']];
    var html = groups.filter(function (x) { return g[x[0]].length; }).map(function (x) {
      return '<section class="mdl-section pmx-sched-group" data-k="sched-grp-' + x[0] + '" data-group="' + x[0] + '"><h3 class="pmx-sched-grouphead">' + x[1] + '<small>' + g[x[0]].length + '</small></h3>' +
        g[x[0]].map(function (m) { return agendaRow(m, now, focusId, x[0] === 'past'); }).join('') + '</section>';
    }).join('');
    return '<div class="pmx-sched-agenda" data-k="sched-agenda-messages">' + (html || emptyLine(P().scheduledMessages.length ? 'Nothing matches. Clear the search, or show everything.' : 'Nothing scheduled yet. Schedule Message in the wand sends a message later, even while you’re away.')) + '</div>';
  }
  function lifeTrack(m, now) {
    var zone = viewZone(), st = stateOf(m), at = Date.parse(m.scheduled_at_utc), items = [];
    var when = function (t) { return dayMonth(t, zone) + ', ' + clockAt(t, zone); };
    var c = Date.parse(m.createdAt); if (isFinite(c)) items.push(['done', 'You scheduled it ' + when(c)]);
    list(m.history).forEach(function (h) { var t = Date.parse(h.at); if (isFinite(t)) items.push(['done', 'You changed it ' + when(t)]); });
    list(m.dispatch_attempts).forEach(function (a) {
      var r = a.result || {}, t = Date.parse(a.at); if (!isFinite(t)) return;
      var what = r.dispatched || r.duplicate ? 'sent' : r.expired || a.outcome === 'expired' ? 'skipped' : r.held || a.outcome === 'held' ? 'held for you' : 'couldn’t send';
      items.push([r.dispatched || r.duplicate ? 'done' : 'warn', 'Checked ' + when(t) + ': ' + what]);
    });
    if (st === 'scheduled') items.push(['next', (at > now ? 'Sends ' : 'Was due ') + when(at)]);
    if (st === 'canceled') { var u = Date.parse(m.updatedAt); items.push(['done', 'Canceled' + (isFinite(u) ? ' ' + when(u) : '')]); }
    if (st === 'expired' && !list(m.dispatch_attempts).length) items.push(['warn', 'Skipped: it was more than ' + Math.round((m.grace_seconds || SCHED_DEFAULTS.message.graceMinutes * 60) / 60) + ' min late']);
    return '<ol class="pmx-sched-life" aria-label="What happened">' + items.map(function (it) { return '<li data-state="' + it[0] + '"><i aria-hidden="true"></i><span>' + esc(it[1]) + '</span></li>'; }).join('') + '</ol>';
  }
  function messageDetailPane(ctx, m, now) {
    var st = stateOf(m), s = chatSentence(m, now);
    return '<section class="mdl-section pmx-sched-detail" data-k="sched-detail" aria-label="The scheduled message">' +
      '<header class="pmx-sched-dhead"><h3 class="pmx-q-title">' + (st === 'sent' ? 'Sent on schedule' : 'Scheduled message') + '</h3>' +
      '<button type="button" class="icon-button pmx-sched-dclose" data-action="sched-focus-clear" aria-label="Back to the whole list">' + SH.pmxGlyph('close', 14) + '</button></header>' +
      '<p class="pmx-sched-dsay">' + s.html + '</p><p class="pmx-sched-dtext">' + esc(m.text) + '</p>' + lifeTrack(m, now) + recordFacts(m, now) +
      '<div class="pmx-sched-dacts">' + rowActs(m, false).replace(/<button[^>]*data-action="sched-focus-record"[^>]*>Details<\/button>/, '') + '</div></section>';
  }
  function messagesBody(ctx, now, focusId) {
    var left = tools(ctx, 'messages') + messageAgenda(visibleSchedules(P().scheduledMessages, 'messages'), now, focusId);
    if (!focusId) return left;
    return '<div class="pmx-sched-split" data-k="sched-split"><div class="pmx-sched-splitl">' + left + '</div>' + messageDetailPane(ctx, findMessage(focusId), now) + '</div>';
  }

  /* ---------------------------------------------------------------- Execution & Build Windows */
  function weekStrip(b, now) {
    var W = 252, on = b.schedule_kind === 'one_time' ? [] : (b.days_of_week || []), nx = null;
    if (b.state === 'active') { var t = b.schedule_kind === 'one_time' ? Date.parse(b.scheduled_at_utc) : computeNextOccurrence(b, Number.isFinite(b.clock_ms) ? b.clock_ms : now); var p = t ? zp(b.timezone, t) : null; nx = p ? T0.weekday(p) : null; if (b.schedule_kind === 'one_time' && p) on = [nx]; }
    return '<svg class="pmx-sched-strip" viewBox="0 0 ' + W + ' 32" width="' + W + '" height="32" aria-hidden="true">' + MON_FIRST.map(function (wd, i) {
      var cx = i * 36 + 18, lit = on.indexOf(wd) >= 0;
      return '<text class="pmx-sched-striplab" data-on="' + (lit ? 1 : 0) + '" x="' + cx + '" y="11" text-anchor="middle">' + DAY_LABELS[wd] + '</text>' +
        (lit ? '<rect class="pmx-sched-stripbar" data-next="' + (wd === nx ? 1 : 0) + '" x="' + (cx - 13) + '" y="21" width="26" height="6" rx="2"/>' : '<circle class="pmx-sched-stripoff" cx="' + cx + '" cy="24" r="1.5"/>');
    }).join('') + '</svg>';
  }
  function journal(b) {
    var occ = list(b.occurrencesFired), zone = b.timezone, api = window.PM56_PLANS;
    var rep = b.dispatchReceipt && api && api.executionReport ? api.executionReport(b.target_id) : null, cs = rep && rep.completion_summary;
    var built = cs && cs.leaf_steps ? 'built ' + cs.resolved + ' of ' + cs.leaf_steps + ' steps' : '';
    if (!occ.length) return ['No slot has run yet.'];
    return occ.slice(-3).map(function (iso, i, arr) {
      var n = occ.length - arr.length + i + 1, t = Date.parse(iso), last = i === arr.length - 1;
      var what = !last ? 'worked in this slot' : b.state === 'completed' ? 'finished the build' : b.runPhase === 'paused_safe' ? 'paused safely at the end of the slot' : b.runPhase === 'winding_down' ? 'wrapping up: no new tasks' : 'building now';
      return (b.schedule_kind === 'one_time' ? 'The build' : 'Night ' + n) + ' · ' + dayWord(t, zone) + ' ' + clockAt(t, zone) + ': ' + (last && built ? built + ' · ' : '') + what;
    }).reverse();
  }
  function buildRow(ctx, b, now) {
    var plan = window.PM56_PLANS && PM56_PLANS.get(b.target_id), id = esc(b.schedule_id), st = b.state === 'cancelled' ? 'canceled' : b.state, one = b.schedule_kind === 'one_time', zone = b.timezone;
    var word = BUILD_WORD[st] || st, when;
    if (one) { var t = Date.parse(b.scheduled_at_utc); when = 'Once, ' + (isFinite(t) ? dayLabel(t, zone) + ' at ' + clockAt(t, zone) : 'at a time not set') + ' (' + zoneCity(zone) + ')'; }
    else when = cap1(nightsWord(b.days_of_week)) + ', ' + slotText(b.local_start, b.local_pause) + ' (' + zoneCity(zone) + ')' + (st === 'active' && !b.dispatchReceipt ? ' · next: ' + (nextWords({ kind: 'recurring_window', timezone: zone, days: b.days_of_week, startTime: b.local_start, pauseTime: b.local_pause }, now) || 'not set') : '');
    var who = optionOf(TOPOLOGY_OPTIONS, b.execution_topology || 'agent').label;
    var held = ['active', 'paused'].indexOf(st) >= 0 && !(b.dispatchReceipt && plan && plan.status === 'completed');
    var status = held && autoPause().paused ? '<b>Paused</b> · Pause all automations is on, so nothing starts until you turn it off.'
      : st === 'invalidated' ? 'Bound to V' + esc(b.exact_target_version) + '. You edited this plan (now V' + esc(b.pendingVersion) + '). <b>Build V' + esc(b.pendingVersion) + ' instead?</b>'
      : st === 'held' ? '<b>Held</b> · ' + esc(buildHeldWords(b))
      : b.held_reason && st === 'active' ? '<b>Waiting</b> · ' + esc(buildHeldWords(b))
      : '';
    var btn = function (action, attrs, label, cls) { return '<button type="button" class="' + (cls || 'text-button') + ' pmx-act" data-action="' + action + '"' + attrs + '>' + label + '</button>'; };
    var cancel = ['active', 'paused', 'invalidated', 'held'].indexOf(st) >= 0 ? btn('sched-cancel-build', ' data-id="' + id + '" data-revision="' + b.revision + '" data-currentness="' + esc(buildCurrent(b)) + '"', 'Cancel schedule') : '';
    var acts = (st === 'invalidated' ? btn('sched-rebind-build', ' data-id="' + id + '" data-version="' + esc(b.pendingVersion) + '" data-hash="' + esc(b.pendingHash) + '" data-revision="' + b.revision + '"', 'Use V' + esc(b.pendingVersion), 'soft-button') : '') +
      btn('pd-info', ' data-id="' + esc(b.target_id) + '"', 'Open plan') + (st === 'active' && !b.dispatchReceipt ? btn('sched-edit-build', ' data-id="' + id + '"', 'Change times') : '') + cancel;
    return '<div class="pmx-sched-brow" data-k="sched-bld-' + id + '" data-sched-row="' + cssId(b.schedule_id) + '" data-state="' + esc(st) + '" data-pmx-flip>' +
      '<div class="pmx-sched-bhead"><span class="pmx-sched-bmark">' + SH.pmxKindMark('build-at', 18) + '</span><p class="pmx-sched-btitle"><b>' + esc(plan && plan.title || b.target_id) + '</b> <span>V' + esc(b.exact_target_version) + '</span></p>' +
      '<span class="mdl-chip pmx-sched-state" data-state="' + esc(st) + '">' + schedMark(st, 13, BUILD_GLYPH[st]) + '<span>' + esc(word) + '</span></span><span class="pmx-sched-bacts">' + acts + '</span></div>' +
      '<p class="pmx-sched-bwhen">' + esc(when) + ' · ' + esc(who) + '</p>' + (status ? '<p class="pmx-sched-bsay">' + status + '</p>' : '') +
      '<div class="pmx-sched-bbody">' + (!one || st === 'active' ? weekStrip(b, now) : '') + '<ul class="pmx-sched-journal">' + journal(b).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>' +
      (st === 'active' ? '<p class="pmx-fine pmx-sched-demo">' + SH.pmxGlyph('play-ring', 13) + '<span>Demo:</span><button type="button" class="text-button" data-action="sched-advance-window" data-id="' + id + '">Jump to the next start or stop</button></p>' : '') + '</div>';
  }
  function buildsBody(ctx, now) {
    var focus = findBuild(ui.focusBuild) ? ui.focusBuild : null;
    var rows = visibleSchedules(P().buildSchedules.filter(function (b) { return !focus || b.schedule_id === focus; }), 'builds');
    return tools(ctx, 'builds') + (focus ? '<p class="pmx-sched-focusline"><button type="button" class="text-button" data-action="sched-show-all-builds">All build windows</button></p>' : '') +
      '<div class="pmx-sched-agenda" data-k="sched-agenda-builds">' + (rows.length ? rows.map(function (b) { return buildRow(ctx, b, now); }).join('') : emptyLine(P().buildSchedules.length ? 'Nothing matches. Clear the search, or show everything.' : 'No build slots yet. Build At… on a plan sets one.')) + '</div>';
  }

  /* ---------------------------------------------------------------- Resume & Safety Policy (SQR-018 / DL-136) */
  /* how many scheduled things the switch is holding right now, in words ("2 messages and 1 build slot") */
  function pauseHolding() {
    var S = P(), m = S.scheduledMessages.filter(function (x) { return ['scheduled', 'held'].indexOf(stateOf(x)) >= 0 && (stateOf(x) === 'scheduled' || pauseHeld(x)); }).length;
    var b = S.buildSchedules.filter(function (x) { return ['active', 'paused'].indexOf(x.state) >= 0; }).length;
    var parts = [m ? m + (m === 1 ? ' message' : ' messages') : '', b ? b + (b === 1 ? ' build slot' : ' build slots') : ''].filter(Boolean);
    return parts.length ? parts.join(' and ') : '';
  }
  function safetyBody() {
    var S = P(), A = autoPause(), q = RT.quota || {}, at = Date.parse(A.changed_at), holding = pauseHolding();
    var sw = SH.pmxSwitch({ key: 'sched-pause-switch', size: 'small', cls: 'pmx-sched-pauseswitch', action: 'sched-set-pause', label: 'Pause all automations',
      current: A.paused ? 'on' : 'off', options: [{ value: 'off', label: 'Off' }, { value: 'on', label: 'Paused' }] });
    var pause = A.paused
      ? '<p class="pmx-sched-polsay"><b>Paused by you' + (isFinite(at) ? ' at ' + esc(clockAt(at, deviceZone())) : '') + '.</b> Nothing scheduled in this project starts until you turn it back on.' + (holding ? ' Holding ' + esc(holding) + '.' : '') + '</p>' +
        '<button type="button" class="soft-button pmx-act" data-action="sched-clear-pause">Turn back on</button>'
      : '<p class="pmx-sched-polsay"><b>Off:</b> scheduled things start on time.</p>';
    /* a manual Stop is its own latch (SQR-001): the switch never clears it, and it never turns the switch on */
    var stop = S.stopped ? '<p class="pmx-sched-polsay pmx-sched-stopsay"><b>You pressed Stop' + (isFinite(Date.parse(S.stopAt)) ? ' at ' + esc(clockAt(Date.parse(S.stopAt), deviceZone())) : '') + '.</b> Scheduled sends and builds wait until you resume.</p>' +
      '<button type="button" class="soft-button pmx-act" data-action="sched-clear-stop">Resume</button>' : '';
    var usage = q.waiting ? '<p class="pmx-sched-polsay"><b>Waiting for Usage:</b> ' + esc(quotaWords(q)) + '.</p>'
      : '<p class="pmx-sched-polsay"><b>No limit reached.</b> When one is, this says when it resets and where that time came from: the provider, an estimate, or unknown (then there is no countdown).</p>';
    return '<div class="pmx-sched-policy">' +
      '<section class="mdl-section pmx-sched-pol" data-k="sched-safety" data-state="' + (A.paused ? 'paused' : 'off') + '"><div class="pmx-sched-polhead"><h3 class="pmx-q-title">' + SH.pmxGlyph('pause', 16) + 'Pause all automations</h3>' + sw + '</div>' + pause +
        '<p class="pmx-fine">It stops every scheduled send and scheduled build in this project until you turn it off. Only you can turn it off: a usage reset, a slot opening or a new schedule never does. Send now and Build still work.</p>' + stop + '</section>' +
      '<section class="mdl-section pmx-sched-pol" data-k="sched-usage"><h3 class="pmx-q-title">' + SH.pmxGlyph('clock', 16) + 'When you hit a usage limit</h3>' + usage +
        '<p class="pmx-fine">Change this in the usage notice in chat. Resuming by itself is ' + (q.resumeAutomatically ? 'on' : 'off') + ' for the run that hit the limit.</p></section></div>';
  }

  /* ---------------------------------------------------------------- Events & Automation */
  var EVENT_WORDS = {
    'scheduled_dispatch.created': 'Scheduled a message', 'scheduled_dispatch.updated': 'Changed a scheduled message', 'scheduled_dispatch.held': 'Held a message',
    'scheduled_dispatch.dispatched': 'Sent or started something on schedule', 'execution_window.created': 'Set a build slot', 'execution_window.updated': 'Changed a build slot',
    'execution_window.invalidated': 'Paused a build slot', 'runtime.quota_resume_attempted': 'Checked whether to go on', 'runtime.quota_wait_started': 'Usage came back',
    'runtime.automation_pause_changed': 'Changed Pause all automations' };
  var CLAUSE_WORDS = { route_unavailable: 'the model or the chat it needs wasn’t available', target_version_changed: 'the plan changed, so it waits for your OK',
    manual_stop_latched: 'you pressed Stop', project_automation_paused: 'Pause all automations is on', quota_unavailable: 'Usage wasn’t available', reset_truth_unknown: 'the reset time is unknown',
    grace_expired: 'it was too late', missed_time_held: 'the time was missed', dispatch_already_started: 'it had already happened' };
  function eventState(e) {
    if (/held|invalidated/.test(e.type) || e.clause === 'target_version_changed') return 'held';
    if (/dispatched/.test(e.type)) return 'completed';
    if (e.clause) return 'failed';
    return 'active';
  }
  function eventSentence(e) {
    var w = EVENT_WORDS[e.type] || 'Scheduling changed something', c = e.clause ? CLAUSE_WORDS[e.clause] || 'it was refused' : '';
    if (e.type === 'scheduled_dispatch.dispatched' && /[Dd]uplicate/.test(e.detail || '')) return 'Ignored a repeat: nothing ran twice';
    if (e.type === 'runtime.automation_pause_changed') return /^Turned on/.test(e.detail || '') ? 'You turned Pause all automations on' : 'You turned Pause all automations off';
    if (e.type === 'runtime.quota_resume_attempted' && !e.clause) return /cleared/i.test(e.detail || '') ? 'You resumed after Stop' : 'Went on after the usage limit';
    if (e.type === 'runtime.quota_resume_attempted' && e.clause === 'manual_stop_latched' && /latched at epoch/i.test(e.detail || '')) return 'You pressed Stop: scheduled things wait';
    return w + (c ? ': ' + c : '');
  }
  function eventsBody(ctx) {
    var rows = visibleSchedules(P().events, 'events');
    return tools(ctx, 'events') + '<div class="pmx-sched-agenda" data-k="sched-agenda-events">' + (rows.length ? '<ol class="pmx-sched-events">' + rows.map(function (e) {
      var t = Date.parse(e.at), zone = deviceZone(), tip = e.type + (e.clause ? ' · ' + e.clause : '');
      return '<li class="pmx-sched-event" data-k="sched-ev-' + esc(e.id) + '" data-state="' + eventState(e) + '"><span class="pmx-sched-rowglyph">' + schedMark(eventState(e), 14, eventState(e) === 'held' || eventState(e) === 'failed' ? 'warn' : eventState(e) === 'completed' ? 'check' : 'clock') + '</span>' +
        '<span class="pmx-sched-rowtime">' + (isFinite(t) ? esc(dayMonth(t, zone) + ' · ' + clockAt(t, zone)) : '') + '</span>' +
        '<span class="pmx-sched-evsay" data-hover-key="sched-ev:' + esc(e.id) + '" data-hover-tip="' + esc(tip) + '">' + esc(eventSentence(e)) + '</span></li>';
    }).join('') + '</ol>' : emptyLine('Nothing has happened yet.')) + '</div>';
  }

  /* ---------------------------------------------------------------- the sheet */
  function renderManageDialog(ctx) {
    var S = P(), tab = ui.manageTab || 'messages'; if (tab === 'precedence') tab = 'quota';
    var now = Date.now(), focusMsg = tab === 'messages' && ui.focusSchedule && findMessage(ui.focusSchedule) ? ui.focusSchedule : null;
    var focused = !!focusMsg || (tab === 'builds' && !!findBuild(ui.focusBuild));
    var count = { messages: S.scheduledMessages.filter(function (m) { return ['scheduled', 'held', 'failed'].indexOf(stateOf(m)) >= 0; }).length,
      builds: S.buildSchedules.filter(function (b) { return ['active', 'paused', 'invalidated', 'held'].indexOf(b.state) >= 0; }).length };
    var tabs = SH.pmxTabs({ key: 'sched-mgr-tabs', cls: 'sched-tabs', action: 'sched-manage-tab', attr: 'data-tab', current: tab,
      items: MANAGER_TABS.map(function (t) { return { value: t.value, label: esc(t.label), count: count[t.value] || '' }; }) });
    var help = '<p class="pmx-help pmx-sched-tabhelp">' + esc(optionOf(MANAGER_TABS, tab).help) + '</p>';
    var body = tab === 'messages' ? messagesBody(ctx, now, focusMsg) : tab === 'builds' ? buildsBody(ctx, now) : tab === 'quota' ? safetyBody() : eventsBody(ctx);
    var ids = tab === 'messages' ? S.scheduledMessages.map(function (m) { return cssId(m.scheduled_dispatch_id); }) : tab === 'builds' ? S.buildSchedules.map(function (b) { return cssId(b.schedule_id); }) : [];
    var saved = ui.persistenceAvailable === false ? 'Only kept until you reload.' : S.lastSavedAt ? 'Saved ' + clockAt(Date.parse(S.lastSavedAt), deviceZone()) + '.' : '';
    return SH.pmxSheet({ type: 'sched-manage', kind: 'scheduled', size: 'wide', cls: 'sched-dialog sched-dialog--manage pmx-sched-mgr' + (focused ? ' sched-dialog--focused' : ''),
      scrimClose: 'sched-close-dialog', closeAction: 'sched-close-dialog', ariaLabel: 'Scheduled and Automations', title: 'Scheduled', lead: esc(managerSummary()), markHtml: SH.pmxKindMark('scheduled', 26),
      guide: window.PM56_SCHEDULE_DEMOS ? window.PM56_SCHEDULE_DEMOS.dialogGuide(ctx) : '',
      hero: '<div class="pmx-sched-mgrtop" data-k="sched-mgr-top">' + managerPlate(now) + tabs + help + '</div>',
      body: body + linkStyle(ids),
      foot: SH.pmxFoot({ cls: 'pmx-sched-foot pmx-sched-mgrfoot', readback: '<p class="pmx-fine pmx-sched-footnote">Nothing runs in the background in this preview.' + (saved ? ' ' + esc(saved) : '') + '</p>',
        cancel: { action: 'sched-open-message', label: 'Schedule a message…' }, primary: { action: 'sched-close-dialog', label: 'Done' } }) });
  }

  /* the two wand rows (delivery-polish moves each description into the row's hover text) */
  EXT.slot('wandRows', function (ctx) {
    var S = P();
    var waiting = S.scheduledMessages.filter(function (m) { return stateOf(m) === 'scheduled'; }).length;
    var held = S.scheduledMessages.filter(function (m) { return stateOf(m) === 'held'; }).length;
    var count = [waiting ? waiting + ' waiting' : '', held ? held + (held === 1 ? ' needs you' : ' need you') : ''].filter(Boolean).join(' · ');
    var needs = held || S.buildSchedules.some(function (b) { return b.state === 'invalidated' || b.state === 'held'; });
    var badge = autoPause().paused ? 'Paused by you' : S.stopped ? 'Stopped by you' : needs ? 'Needs your OK' : '';
    return '<button class="menu-item" data-action="sched-open-message" data-k="sched-wand-msg">' +
      '<span class="menu-icon">' + SH.pmxKindMark('schedule', 13) + '</span>' +
      '<span class="menu-copy"><strong>Schedule Message</strong><span>Send a message later, even if you’re away.</span></span>' +
      (count ? '<span class="shortcut">' + esc(count) + '</span>' : '') + '</button>' +
      '<button class="menu-item" data-action="sched-open-manage" data-k="sched-wand-manage">' +
      '<span class="menu-icon">' + SH.pmxKindMark('scheduled', 13) + '</span>' +
      '<span class="menu-copy"><strong>Scheduled &amp; Automations…</strong><span>Everything set to happen later, and what already did.</span></span>' +
      (badge ? '<span class="shortcut">' + esc(badge) + '</span>' : '') + '</button>';
  });

  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog; if (!d) return '';
    if (d.type === 'sched-message') return renderMessageDialog(ctx);
    if (d.type === 'sched-build-at') return renderBuildDialog(ctx);
    if (d.type === 'sched-manage') return renderManageDialog(ctx);
    return '';
  });

  /* the real message a schedule sent carries one quiet tick (7.10 / 7.11), with who scheduled it in its hover card */
  EXT.slot('messageMeta', function (ctx) {
    var m = ctx.message;
    if (!m || !m.viaSchedule) return '';
    var rec = findMessage(m.scheduledDispatchId), c = rec && Date.parse(rec.createdAt);
    var tip = (rec && isFinite(c) ? 'You scheduled this on ' + dayMonth(c, rec.timezone) : 'Sent by a schedule') + ' · exact copy';
    return SH.pmxTick({ key: 'sched-tick-' + m.id, cls: 'pmx-sched-tick', glyph: 'clock', text: SH.PMX_COPY && SH.PMX_COPY.ticks ? SH.PMX_COPY.ticks.sentOnSchedule : 'Sent on schedule',
      attrs: 'data-hover-key="sched-tick:' + esc(m.id) + '" data-hover-tip="' + esc(tip) + '"' });
  });


  /* =====================================================================
     8A. ScheduledMessageProjection — Additive Correction v4
         (SMSG-001..018, PSCHED-010)
     ---------------------------------------------------------------------
     One durable schedule renders one card in its SOURCE thread, and only
     after a durable commit -- never on button press, never as a toast alone.
     The six visible states map straight from owner state; nothing is inferred
     locally, and the card is a projection, not a second creation entry point
     (Schedule Message stays in the wand).
     ===================================================================== */
  function list(v){ return Array.isArray(v) ? v : []; }
  var SM_STATE = {
    scheduled:{ label:'Scheduled', tone:'idle' },
    dispatched:{label:'Sent',tone:'done'}, cancelled:{label:'Canceled',tone:'idle'},
    held:     { label:'Held',      tone:'warn' },
    sent:     { label:'Sent',      tone:'done' },
    canceled: { label:'Canceled',  tone:'idle' },
    failed:   { label:'Failed',    tone:'danger' },
    expired:  { label:'Expired',   tone:'idle' }
  };
  var SM_ORDER = ['scheduled','held','sent','canceled','failed','expired'];

  function smById(id){
    var arr=P().scheduledMessages, i;
    for(i=0;i<arr.length;i++) if(arr[i].scheduled_dispatch_id===id) return arr[i];
    return null;
  }

  function messageProjection(rec){
    var st=SM_STATE[rec.state] || { label:rec.state, tone:'idle' };
    return {
      schema:'pm.schedule.message_projection.v1',
      scheduled_message_id:rec.scheduled_dispatch_id, thread_id:rec.thread_id,
      destination_ref:rec.destination_ref, state:rec.state, state_label:st.label,
      scheduled_at:rec.scheduled_at_utc, timezone:rec.timezone,
      local_wall_time:rec.local_wall_time,
      text_preview:String(rec.text||'').slice(0,120),
      attachment_count:list(rec.attachment_refs).length,
      requested_model_ref:rec.requested_runtime && rec.requested_runtime.modelId,
      dispatched_message_id:rec.dispatchedMessageId || null,
      dispatched_at:rec.dispatchedAt || null,
      held_reason:rec.heldReason || null,
      failure_reason:rec.failureReason || null,
      cancel_reason:rec.cancelReason || null,
      expired_reason:rec.expiredReason || null,
      revision:rec.revision,
      /* SMSG-005: Edit and Cancel are only available where the owner allows. */
      /* The typed contract (pm.schedule.message_projection.v1) names these
         `edit_available` / `cancel_available`. This projection declared that
         schema id while publishing `can_edit` / `can_cancel`, so a native
         reader following the contract would have found neither. Both names are
         emitted: the contract name is authoritative and the short name stays
         for the readers already written against it. */
      dispatch_attempts: list(rec.dispatch_attempts),
      edit_available:['scheduled','held','failed'].indexOf(rec.state)>=0,
      cancel_available:['scheduled','held','failed'].indexOf(rec.state)>=0,
      can_edit:['scheduled','held','failed'].indexOf(rec.state)>=0,
      can_cancel:['scheduled','held','failed'].indexOf(rec.state)>=0,
      currentness_hash:msgCurrent(rec)
    };
  }

  /* SMSG-007..008: exactly what was frozen, and whether it is still there. */
  function attachmentSnapshots(rec){
    return list(rec.attachment_refs).map(function(a){
      return { schema:'pm.schedule.attachment_snapshot.v1',
        scheduled_message_id:rec.scheduled_dispatch_id,
        attachment_id:a.artifact_id || a.name,
        artifact_version:a.artifact_version || null,
        content_hash:a.content_hash || null,
        folder_manifest_hash:a.folder_manifest_hash || null,
        snapshot_ref:a.snapshot_ref || null,
        availability:a.availability || 'available',
        unavailable_note:a.unavailable_note || null };
    });
  }

  /* =====================================================================
     8B. IN CHAT (DESIGN-SPEC 8.7 "In chat", 7.11, 7.14; IMPACT A1-26).
     One transcript item per durable schedule, in its source thread, after a
     commit (SMSG-001..003). Scheduled and Held are the future bubble
     (.sched-card.pmx-bubble, right-aligned like the reader's own message,
     a dashed full outline while it waits; Held is the warm decision bubble);
     Sent, Canceled, Expired and Failed are one-line receipts (pmxLedgerLine)
     inside the same .sched-card article, so the item keeps its key and its
     hooks at every state. Every face begins its sentence with the canon state
     word. The time lives in the bubble's dateline (the ticket stub is gone,
     G-35). Details open the full record in place, ids only in Technical
     details. Long unbroken tokens wrap (a 234 px pane never scrolls sideways).
     ===================================================================== */
  function stateOf(rec) { var s = rec && rec.state; return s === 'dispatched' ? 'sent' : s === 'cancelled' ? 'canceled' : s; }
  function lastAttempt(rec) { var a = list(rec && rec.dispatch_attempts); return a.length ? a[a.length - 1] : null; }
  function attemptCode(rec) { var a = lastAttempt(rec), r = a && a.result; return (r && (r.error || r.clause)) || ''; }
  /* "Missed while away" is the canon Held state with a missed reason (G-30), never a seventh state */
  function pauseHeld(rec) { return stateOf(rec) === 'held' && attemptCode(rec) === 'project_automation_paused'; }
  function missedAt(rec) { return stateOf(rec) === 'held' && attemptCode(rec) === 'missed_time_held' ? Date.parse(rec.scheduled_at_utc) : null; }
  function snippet(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s;
    var cut = s.slice(0, n - 1), sp = cut.lastIndexOf(' ');
    return (sp > n * 0.6 ? cut.slice(0, sp) : cut) + '…';
  }
  function quoted(s, n) { return '“' + snippet(s, n) + '”'; }
  function zonePhrase(zone) { return zone === 'UTC' ? 'UTC' : zoneCity(zone) + ' time (' + zone + ')'; }
  /* Times in the chat and the manager read in the viewer's own zone (the manager's plate does too); a record set in
     another zone names that zone beside its own wall time, so two zones are never mixed unsaid. */
  function viewZone() { return deviceZone(); }
  function otherZone(zone) { return zone && zone !== viewZone() ? (zone === 'UTC' ? 'UTC' : zoneCity(zone) + ' time') : ''; }
  /* a time phrase that never breaks inside "Sep 2" or "8:00 PM" (a break may fall after a comma); "in 5 h" keeps its unit */
  function nb(s) { return String(s || '').replace(/ /g, '\u00a0').replace(/,\u00a0/g, ', '); }
  function dayMonth(t, zone) { var p = zp(zone, t); return p ? MONTHS[p.mo - 1] + ' ' + p.d : ''; }
  /* "10:00 PM" today, "Sat 10:00 PM" within the week, "Mon, May 10 at 10:00 PM" (and the year when it differs) */
  function chatWhen(t, zone, now) {
    var p = zp(zone, t), q = zp(zone, now); if (!p) return '';
    var clock = clockAt(t, zone);
    if (q && p.y === q.y && p.mo === q.mo && p.d === q.d) return clock;
    if (Math.abs(t - now) < 6 * 86400000) return dayWord(t, zone) + ' ' + clock;
    return dayLabel(t, zone) + (q && p.y !== q.y ? ', ' + p.y : '') + ' at ' + clock;
  }
  /* the compact form for one-line receipts: "8:00 PM" today, "Wed 8:00 PM" within the week, else "Sep 2, 8:00 PM" */
  function shortWhen(t, zone, now) {
    var p = zp(zone, t), q = zp(zone, now); if (!p) return '';
    if (q && p.y === q.y && p.mo === q.mo && p.d === q.d) return clockAt(t, zone);
    return Math.abs(t - now) < 6 * 86400000 ? dayWord(t, zone) + ' ' + clockAt(t, zone) : dayMonth(t, zone) + ', ' + clockAt(t, zone);
  }
  function scheduledOn(rec, now) {
    var c = Date.parse(rec.createdAt), zone = viewZone(); if (!isFinite(c)) return '';
    var p = zp(zone, c), q = zp(zone, now);
    return p && q && p.y === q.y && p.mo === q.mo && p.d === q.d ? 'you scheduled this today' : 'you scheduled this on ' + dayMonth(c, zone);
  }
  function fileWords(a) { var v = a && a.artifact_version; return attachmentLabel(a) + (v != null && v !== '' ? ' (' + (/^v/i.test(String(v)) ? v : 'v' + v) + ')' : ''); }
  function goneFile(rec) { return list(rec.attachment_refs).filter(function (a) { return a.availability === 'missing' || a.availability === 'unavailable'; })[0] || null; }
  /* what was not done and why, in plain words (the owner's code stays in the record data) */
  function heldWhy(rec) {
    var code = attemptCode(rec), gone = goneFile(rec), model = rec.requested_runtime && rec.requested_runtime.modelName;
    if (code === 'missed_time_held') return 'missed at ' + clockAt(Date.parse(rec.scheduled_at_utc), viewZone()) + '. You asked us to check with you first.';
    if (gone || /^attachment_|snapshot_changed|folder_manifest_changed/.test(code)) {
      var f = gone || list(rec.attachment_refs)[0];
      return (f ? fileWords(f) : 'A file it sends') + (gone ? ' was deleted' : ' isn’t available any more') + ', so we didn’t send, and we didn’t send a newer copy.';
    }
    if ((rec.destination_ref && rec.destination_ref.unresolvable) || /^destination_/.test(code)) return (rec.destination_ref && rec.destination_ref.label ? rec.destination_ref.label : 'The chat it goes to') + ' has ended, so we didn’t send it anywhere else.';
    if (code === 'route_unavailable') return (model || 'The model you picked') + ' wasn’t available, so we didn’t send. We never swap the model.';
    if (code === 'quota_unavailable') return 'your usage limit was reached, so we didn’t send.';
    if (code === 'project_automation_paused') return 'Pause all automations is on, so we didn’t send. It waits until you turn it off.';
    if (code === 'manual_stop_latched') return 'you pressed Stop, so we didn’t send.';
    if (code === 'scope_changed' || code === 'permission_snapshot_changed') return 'this chat’s settings changed after you scheduled it, so we didn’t send.';
    if (code === 'legacy_snapshot_requires_review') return 'it was scheduled before exact copies were kept, so check it before it sends.';
    return 'we couldn’t send it as scheduled, so it waits for you.';
  }
  function failedWhy(rec, brief) {
    var raw = String(rec.failureReason || ''), code = /^[a-z_]+$/.test(raw) ? raw : attemptCode(rec), model = rec.requested_runtime && rec.requested_runtime.modelName;
    if (code === 'route_unavailable' || code === 'provider_unavailable' || (!code && /unavailable/i.test(raw) && model)) return (model || 'The model you picked') + ' wasn’t available' + (brief ? '' : ', and we never swap the model');
    if (/^destination_/.test(code)) return 'the chat it goes to couldn’t take it';
    var shared = code ? SH.pmxRefusalText(code, {}) : null;
    if (shared && shared.text) return shared.text.replace(/\.$/, '');
    return 'it couldn’t be delivered';
  }
  /* the one always-true sentence of a scheduled message, canon word first (A1-26); the bubble, the receipt, the
     manager's row and its detail all read it */
  function chatSentence(m, now) {
    var st = stateOf(m), at = Date.parse(m.scheduled_at_utc), zone = viewZone(), word = STATE_WORD[st] || String(st || ''), rest = '';
    if (st === 'scheduled') rest = at > now ? 'sends <b>' + esc(nb(chatWhen(at, zone, now))) + '</b> · ' + (autoPause().paused ? 'waits: Pause all automations is on' : esc(nb(SH.pmxTime.until(at, now))))
      : 'was due <b>' + esc(nb(chatWhen(at, zone, now))) + '</b> · ' + (autoPause().paused ? 'held: Pause all automations is on' : 'not sent yet');
    else if (st === 'held') rest = esc(heldWhy(m));
    else if (st === 'sent') {
      /* on the narrowest cards "1:00 AM" reads "1 AM" (the same time, shorter), so the row keeps one line */
      var sw = nb(shortWhen(Date.parse(m.dispatchedAt) || at, zone, now)), sh = sw.replace(/:00(\u00a0[AP]M)$/, '$1');
      rest = (sh !== sw ? '<span class="pmx-sched-tlong">' + esc(sw) + '</span><span class="pmx-sched-tshort">' + esc(sh) + '</span>' : esc(sw)) + '<span class="pmx-sched-tail"> · ' + esc(scheduledOn(m, now)) + '</span>';
    }
    else if (st === 'canceled') rest = esc(quoted(m.text, 48));
    else if (st === 'expired') rest = 'skipped: it was more than ' + Math.round((m.grace_seconds || SCHED_DEFAULTS.message.graceMinutes * 60) / 60) + ' min late';
    else if (st === 'failed') rest = esc(failedWhy(m)) + '. Edit it to retry.';  /* "Retry", never "Try again" (IMPACT A1-34) */
    return { st: st, word: word, rest: rest, html: '<b class="pmx-sched-word">' + esc(word) + '</b>' + (rest ? ' · ' + rest : '') };
  }
  function recordFacts(m, now) {
    var st = stateOf(m), at = Date.parse(m.scheduled_at_utc), zone = m.timezone, th = threadByIdRaw(m.thread_id), dest = destWords({ destination: m.destination_ref }, th);
    var snaps = attachmentSnapshots(m), refs = list(m.attachment_refs);
    var rows = [
      [st === 'sent' ? 'Sent' : 'Sends', esc((st === 'sent' && m.dispatchedAt ? chatWhen(Date.parse(m.dispatchedAt), zone, now) + ' (scheduled for ' + chatWhen(at, zone, now) + ')' : chatWhen(at, zone, now)) + ' · ' + zonePhrase(zone) +
        (otherZone(zone) ? ' · your time ' + chatWhen(st === 'sent' && m.dispatchedAt ? Date.parse(m.dispatchedAt) : at, viewZone(), now) : ''))],
      ['To', dest.rb === 'this chat' ? 'this chat' + (th && th.title ? ' (' + esc(th.title) + ')' : '') : dest.rb],
      ['Files', snaps.length ? snaps.map(function (a, i) { return esc(fileWords(refs[i] || {})) + ' · ' + (a.availability === 'missing' || a.availability === 'unavailable' ? 'deleted after you scheduled it' : 'exact copy kept'); }).join('<br>') : 'None'],
      ['Answered by', esc(modelWords(m.requested_runtime && m.requested_runtime.modelId)) + (m.requested_runtime && m.requested_runtime.account ? ' · ' + esc(String(m.requested_runtime.account).split(' · ')[0]) + ' account' : '')],
      ['If it’s missed', esc(optionWords(optionOf(MISSED_MSG_OPTIONS, m.missed_policy), (m.grace_seconds || SCHED_DEFAULTS.message.graceMinutes * 60) / 60))]];
    /* the reason in full (the bubble's decision sentence clamps to two lines in a narrow chat) */
    if (['held', 'failed', 'expired'].indexOf(st) >= 0) rows.splice(1, 0, ['What happened', chatSentence(m, now).html]);
    return '<dl class="pmx-sched-facts">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>';
  }
  function recordHtml(m, now) {
    var id = m.scheduled_dispatch_id, raw = !!(ui.techOpen && ui.techOpen['raw:' + id]), long = String(m.text || '').length > 240 || ['sent', 'canceled', 'expired', 'failed'].indexOf(stateOf(m)) >= 0;
    /* card 8: no Technical details on the record; "Show raw data" stands on its own (it used to sit inside it) */
    return '<div class="pmx-sched-rec" data-k="sched-rec-' + esc(id) + '">' + (long ? '<p class="pmx-sched-rectext">' + esc(m.text) + '</p>' : '') + recordFacts(m, now) +
      SH.pmxDisclosure({ key: 'sched-raw-' + id, cls: 'pmx-sched-raw-disc', attrs: 'data-sched-raw="' + esc(id) + '"', open: raw, summary: 'Show raw data',
        body: '<pre class="pmx-sched-raw">' + esc(JSON.stringify({ attachments: attachmentSnapshots(m), attempts: list(m.dispatch_attempts) }, null, 2)) + '</pre>' }) +
      '<p class="pmx-sched-recacts"><button type="button" class="text-button" data-action="sched-focus-record" data-id="' + esc(id) + '">All scheduled</button></p></div>';
  }
  /* a 14 px clock ring: the track and the part of the wait that has passed (redrawn by the template each minute; not a loop) */
  function ringSvg(frac) {
    var f = Math.max(0, Math.min(1, frac)), a = f * 2 * Math.PI, x = 7 + 5.25 * Math.sin(a), y = 7 - 5.25 * Math.cos(a);
    var arc = f <= 0.01 ? '' : f >= 0.99 ? '<circle class="pmx-bubble-ring-on" cx="7" cy="7" r="5.25"/>' : '<path class="pmx-bubble-ring-on" d="M7 1.75A5.25 5.25 0 ' + (f > 0.5 ? 1 : 0) + ' 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + '"/>';
    return '<svg class="pmx-bubble-ring" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><circle class="pmx-bubble-ring-track" cx="7" cy="7" r="5.25"/>' + arc + '</svg>';
  }
  function bubbleHtml(ctx, m, st, now) {
    var id = m.scheduled_dispatch_id, eid = esc(id), at = Date.parse(m.scheduled_at_utc), open = !!(ui.cardOpen && ui.cardOpen[id]), pr = messageProjection(m);
    var s = chatSentence(m, now), th = threadByIdRaw(m.thread_id), dest = destWords({ destination: m.destination_ref }, th), files = list(m.attachment_refs).length;
    var token = ' data-id="' + eid + '" data-revision="' + m.revision + '" data-currentness="' + esc(msgCurrent(m)) + '"';
    var more = { action: 'sched-card-details', attrs: 'data-id="' + eid + '" aria-expanded="' + open + '"', label: 'Details', glyph: open ? 'chevron-up' : 'chevron-down', extra: false };
    var fine = [dest.rb === 'this chat' ? 'To this chat' : 'To ' + dest.rb, files ? files + (files === 1 ? ' file' : ' files') : '', esc(modelWords(pr.requested_model_ref)),
      esc(otherZone(m.timezone) ? 'set for ' + clockAt(at, m.timezone) + ' ' + zonePhrase(m.timezone) : zonePhrase(m.timezone))].filter(Boolean).join(' · ');
    var face;
    if (st === 'held') {
      var missed = missedAt(m) != null || pauseHeld(m);
      face = SH.pmxDecision({ key: 'sched-dec-' + id, cls: 'pmx-bubble-decision', tone: 'warm', glyph: schedMark('held', 14, 'warn'), sentence: s.html, actions: (missed
        ? [{ action: 'sched-card-send-now', attrs: token, label: 'Send now', primary: true }, { action: 'sched-card-edit', attrs: 'data-id="' + eid + '"', label: 'Reschedule', soft: true }, { action: 'sched-card-cancel', attrs: token, label: 'Cancel', extra: false }]
        : [{ action: 'sched-card-edit', attrs: 'data-id="' + eid + '"', label: 'Edit and send', primary: true }, { action: 'sched-card-cancel', attrs: token, label: 'Cancel', extra: false }]).concat([more]) });
    } else {
      var due = at > now, span = Math.min(Math.max(at - (Date.parse(m.createdAt) || at - 86400000), 3600000), 86400000);
      face = '<div class="pmx-bubble-date">' + ringSvg(due ? 1 - (at - now) / span : 1) + '<p class="pmx-bubble-say">' + s.html + '</p>' +
        '<span class="pmx-bubble-acts">' + (pr.can_edit ? '<button type="button" class="text-button pmx-act" data-action="sched-card-edit" data-id="' + eid + '">Edit</button>' : '') +
        (pr.can_cancel ? '<button type="button" class="text-button pmx-act" data-action="sched-card-cancel"' + token + '>Cancel</button>' : '') +
        '<button type="button" class="text-button pmx-act" data-action="sched-card-details" data-id="' + eid + '" aria-expanded="' + open + '">' + SH.pmxGlyph(open ? 'chevron-up' : 'chevron-down', 13) + 'Details</button></span></div>' +
        (due ? '' : '<p class="pmx-fine pmx-bubble-note">Nothing runs in the background in this preview, so it waits here until it is checked.</p>');
    }
    /* the reader's side of the chat (the item's own data-turn-pos wins over the one app.js stamps) */
    return '<article class="sched-card sched-card-' + st + ' pmx-bubble" data-k="sched-card-' + eid + '" data-schedule-id="' + eid + '" data-schedule-state="' + st + '" data-turn-pos="user"' + (st === 'held' ? ' data-tone="warm"' : '') + ' data-flip>' +
      '<p class="pmx-bubble-text">' + esc(m.text) + '</p>' + face + '<p class="pmx-fine pmx-bubble-fine">' + fine + '</p>' + (open ? recordHtml(m, now) : '') + '</article>';
  }
  var RECEIPT_GLYPH = { sent: 'check', canceled: 'slash-circle', expired: 'slash-circle', failed: 'warn' };
  /* the receipt's hover card keeps the exact time and the zone (G-30); the line itself shows only the time */
  function receiptTip(m, st, now) {
    var at = Date.parse(m.scheduled_at_utc), sent = Date.parse(m.dispatchedAt), zone = m.timezone;
    return (st === 'sent' && isFinite(sent) ? 'Sent ' + chatWhen(sent, zone, now) + ', scheduled for ' : 'Scheduled for ') + chatWhen(at, zone, now) + ' · ' + zonePhrase(zone);
  }
  function receiptHtml(ctx, m, st, now) {
    var id = m.scheduled_dispatch_id, eid = esc(id), open = !!(ui.cardOpen && ui.cardOpen[id]), s = chatSentence(m, now), pr = messageProjection(m);
    var foot = (st === 'sent' && pr.dispatched_message_id ? '<button type="button" class="text-button pmx-act pmx-sched-go" data-action="sched-open-sent" data-id="' + eid + '" aria-label="Go to message">' + SH.pmxGlyph('open', 15) + '<span>Go to message</span></button>' : '') +
      (st === 'failed' && pr.can_edit ? '<button type="button" class="text-button pmx-act" data-action="sched-card-edit" data-id="' + eid + '">Edit</button>' : '') +
      '<button type="button" class="icon-button pmx-act" data-action="sched-card-details" data-id="' + eid + '" aria-label="Details" aria-expanded="' + open + '">' + SH.pmxGlyph(open ? 'chevron-up' : 'chevron-down', 15) + '</button>';
    /* an Expired reason wraps onto a second line of the row rather than end in an ellipsis (J-2, design review M2);
       the row is 44 px whenever it fits on one line. Failed is always one line (the C13 receipt budget, closing
       review LINT-4 C): the canon word and the brief cause, which may end in an ellipsis on a narrow card; the whole
       sentence ("..., and we never swap the model. Edit it to retry.") is the line's hover card, the Edit beside it
       retries, and Details has the full record */
    var headline = st === 'failed' ? '<b class="pmx-sched-word">' + esc(s.word) + '</b> · ' + esc(failedWhy(m, true)) : s.html;
    var tip = st === 'failed' ? cap1(failedWhy(m)) + '. Edit it to retry.\n' + receiptTip(m, st, now) : null;
    var line = SH.pmxLedgerLine({ key: 'sched-line-' + id, cls: 'pmx-sched-line', attrs: 'data-state="' + st + '"', kind: 'schedule', markHtml: SH.pmxKindMark('schedule', 16), kindWord: '',
      title: esc(snippet(m.text, 80)), headline: headline, glyph: schedMark(st, 14, RECEIPT_GLYPH[st] || 'clock'), time: esc(receiptTip(m, st, now)), tip: tip, footHtml: foot });
    return '<article class="sched-card sched-card-' + st + '" data-k="sched-card-' + eid + '" data-schedule-id="' + eid + '" data-schedule-state="' + st + '" data-flip>' + line + (open ? recordHtml(m, now) : '') + '</article>';
  }
  function renderMessageCard(ctx, m) {
    var st = stateOf(m), now = nowMinute();
    return st === 'scheduled' || st === 'held' ? bubbleHtml(ctx, m, st, now) : receiptHtml(ctx, m, st, now);
  }

  /* ---------------------------------------------------------------- the dock (7.8): "Coming up" and the held line.
     FOUNDATION REQUEST: PM56_PMX measures only .pmx-run[data-run-id] cards, so the scheduled bubble's visibility is
     measured here (the same rule: a line shows once the bubble's head has been out of view 400 ms; a needs line at
     once, unless the whole bubble is visible) and the dock is re-rendered only when the set of lines changes. */
  var dockVis = {}, dockKey = '', dockJob = null, dockRaf = 0;
  function transcriptEl() { return document.querySelector('.assistant-pane .transcript') || document.querySelector('.transcript'); }
  function measureBubbles() {
    var tr = transcriptEl(); if (!tr) return;
    var tb = tr.getBoundingClientRect(), t = performance.now(), seen = {};
    tr.querySelectorAll('.sched-card[data-schedule-id]').forEach(function (el) {
      var id = el.getAttribute('data-schedule-id'), b = el.getBoundingClientRect(), hh = Math.min(b.height, 48); seen[id] = 1;
      var head = hh > 0 && (Math.max(0, Math.min(b.top + hh, tb.bottom) - Math.max(b.top, tb.top)) / hh) >= 0.6;
      var full = b.height > 0 && b.top >= tb.top - 1 && b.bottom <= tb.bottom + 1, v = dockVis[id];
      if (!v) { dockVis[id] = { head: head, full: full, hiddenAt: head ? -1e12 : t }; return; }
      if (v.head !== head) { v.head = head; if (!head) v.hiddenAt = t; }
      v.full = full;
    });
    Object.keys(dockVis).forEach(function (id) { if (!seen[id]) delete dockVis[id]; });
    snapBubbles(tr, tb);
  }
  /* ---------------------------------------------------------------- Scheduled -> Sent (8.7 In chat, 5.5)
     When a message sends while the reader watches its bubble near the bottom of the chat, the bubble solidifies
     (dashed -> solid, drawn left to right) and flies onto the real message it became; the receipt line then takes
     its place. The real article is already the receipt when this runs (nothing waits on motion): a ghost copy of
     the last-seen bubble flies in a fixed layer clipped to the chat, and the receipt and the real message fade in
     under it. Web Animations through PM56_PMX.animate (tokens, never PM56_CLOCK); reduced motion = the end state. */
  var lastState = {}, bubbleSnap = {};
  function snapBubbles(tr, tb) {
    var next = {}, tid = (EXT.ctx && EXT.ctx() && EXT.ctx().state.selectedThread) || '';
    tr.querySelectorAll('.sched-card.pmx-bubble[data-schedule-state="scheduled"]').forEach(function (el) {
      var b = el.getBoundingClientRect(), id = el.getAttribute('data-schedule-id');
      next[id] = { tid: tid, vis: b.height > 0 && b.bottom > tb.top + 24 && b.top < tb.bottom - 24, near: tr.scrollHeight - tr.scrollTop - tr.clientHeight < 280,
        top: b.top - tb.top + tr.scrollTop, left: b.left - tb.left, w: b.width, h: b.height, html: el.outerHTML };
    });
    bubbleSnap = next;
  }
  function sentMoments(c) {
    var tid = c && c.state && c.state.selectedThread; if (!tid) return;
    P().scheduledMessages.forEach(function (m) {
      if (m.thread_id !== tid) return;
      var id = m.scheduled_dispatch_id, st = stateOf(m), was = lastState[id], snap = bubbleSnap[id]; lastState[id] = st;
      if (was === 'scheduled' && st === 'sent' && snap && snap.tid === tid && snap.vis && snap.near) solidify(m, snap);
    });
  }
  function solidify(m, snap) {
    var X = window.PM56_PMX, tr = transcriptEl(); if (!X || !X.animate || !X.t || !tr || (X.reduced && X.reduced())) return;
    var id = m.scheduled_dispatch_id, card = tr.querySelector('.sched-card[data-schedule-id="' + CSS.escape(id) + '"]');
    var real = m.dispatchedMessageId ? tr.querySelector('[data-message-id="' + CSS.escape(m.dispatchedMessageId) + '"]') : null, face = real && (real.querySelector('.message-surface') || real);
    var tb = tr.getBoundingClientRect(), p1 = X.t('walk') || 380, p2 = X.t('draw') || 420, all = p1 + p2, out = X.ease('out'), mv = X.ease('move');
    var layer = document.createElement('div'); layer.className = 'pmx-sched-flight'; layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'left:' + tb.left + 'px;top:' + tb.top + 'px;width:' + tb.width + 'px;height:' + tb.height + 'px;';
    var x0 = snap.left, y0 = snap.top - tr.scrollTop;
    layer.innerHTML = snap.html.replace(/ data-(k|action|flip|schedule-id|schedule-state|hover-key|hover-tip)="[^"]*"/g, '').replace(/<button /g, '<button tabindex="-1" ');
    var ghost = layer.firstElementChild; if (!ghost) return;
    ghost.classList.add('pmx-sched-ghost'); ghost.style.cssText = 'left:' + x0 + 'px;top:' + y0 + 'px;width:' + snap.w + 'px;height:' + snap.h + 'px;';
    var edge = document.createElement('i'); edge.className = 'pmx-sched-ghostedge'; ghost.appendChild(edge);
    document.body.appendChild(layer);
    var done = function () { if (layer.parentNode) layer.parentNode.removeChild(layer); };
    setTimeout(done, all + 400);
    /* 1 · the outline draws solid, left to right */
    X.animate(edge, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: p1, easing: out, fill: 'both' });
    /* 2 · the bubble flies onto the real message (FLIP by its box: translate, then scale from the top left) */
    var fb = face && face.getBoundingClientRect(), inView = fb && fb.height > 0 && fb.bottom > tb.top && fb.top < tb.bottom;
    /* one uniform scale (by width) so the words never squash; the ghost fades as it lands, the real message is there */
    var move = inView ? 'translate(' + Math.round(fb.left - tb.left - x0) + 'px,' + Math.round(fb.top - tb.top - y0) + 'px) scale(' + Math.min(1.2, Math.max(0.5, fb.width / snap.w)).toFixed(3) + ')' : 'translate(0,-8px)';
    var fly = X.animate(ghost, [{ transform: 'none', opacity: 1, offset: 0 }, { transform: 'none', opacity: 1, offset: p1 / all, easing: mv }, { transform: move, opacity: 1, offset: (p1 + p2 * 0.7) / all }, { transform: move, opacity: 0 }],
      { duration: all, easing: 'linear', fill: 'both' });
    if (fly && fly.finished) fly.finished.then(done, done); else done();
    /* the real message and the receipt appear under the ghost as it lands and leaves */
    if (inView) X.animate(face, [{ opacity: 0 }, { opacity: 0, offset: (p1 + p2 * 0.6) / all }, { opacity: 1 }], { duration: all, easing: 'linear' });
    if (card) X.animate(card, [{ opacity: 0 }, { opacity: 0, offset: (p1 + p2 * 0.35) / all }, { opacity: 1 }], { duration: all, easing: 'linear' });
  }
  function dockWait() { var X = window.PM56_PMX; return X && X.wait ? X.wait('dock') || 400 : 400; }
  function offScreen(id, needs) {
    var v = dockVis[id]; if (!v) return false;
    return needs ? !v.full : !v.head && performance.now() - v.hiddenAt >= dockWait();
  }
  function dockLines(ctx) {
    var tid = ctx && ctx.state && ctx.state.selectedThread, now = Date.now(), out = [];
    if (!tid) return out;
    var mine = P().scheduledMessages.filter(function (m) { return m.thread_id === tid; });
    var held = mine.filter(function (m) { return stateOf(m) === 'held' && offScreen(m.scheduled_dispatch_id, true); });
    if (held.length) out.push({ tone: 'needs', key: 'n:' + held.map(function (m) { return m.scheduled_dispatch_id; }).join(','),
      html: SH.pmxDockLine({ key: 'sched-dock-needs', tone: 'needs', cls: 'pmx-sched-dock', markHtml: SH.pmxKindMark('schedule', 16), kindWord: held.length === 1 ? '1 scheduled message' : held.length + ' scheduled messages',
        sentence: held.length === 1 ? 'needs you' : 'need you', action: { action: 'sched-dock-show', attrs: 'data-id="' + esc(held[0].scheduled_dispatch_id) + '"', label: 'Show' } }) });
    var next = mine.filter(function (m) { return stateOf(m) === 'scheduled' && Date.parse(m.scheduled_at_utc) > now; })
      .sort(function (a, b) { return Date.parse(a.scheduled_at_utc) - Date.parse(b.scheduled_at_utc); });
    if (next.length && offScreen(next[0].scheduled_dispatch_id, false)) {
      var n = next[0], at = Date.parse(n.scheduled_at_utc);
      out.push({ tone: 'comingup', key: 'c:' + n.scheduled_dispatch_id + ':' + next.length,
        html: SH.pmxDockLine({ key: 'sched-dock-next', tone: 'comingup', cls: 'pmx-sched-dock', markHtml: SH.pmxKindMark('schedule', 16), kindWord: 'Coming up',
          sentence: '· Next: <b>' + esc(nb(chatWhen(at, viewZone(), now))) + '</b> · ' + esc(quoted(n.text, 40)) + (next.length > 1 ? ' · +' + (next.length - 1) + ' more' : ''),
          action: { action: 'sched-dock-show', attrs: 'data-id="' + esc(n.scheduled_dispatch_id) + '"', label: 'Show' } }) });
    }
    return out;
  }
  function dockSig(ctx) { return dockLines(ctx).map(function (l) { return l.key; }).join('|'); }
  function dockCheck() {
    var c = EXT.ctx && EXT.ctx(); if (!c) return;
    measureBubbles();
    if (dockSig(c) !== dockKey && !dockRaf) dockRaf = requestAnimationFrame(function () { dockRaf = 0; var c2 = EXT.ctx && EXT.ctx(); if (c2) c2.renderApp(); });
    /* a bubble that just left view gets its line after the wait */
    var soon = Infinity, t = performance.now();
    Object.keys(dockVis).forEach(function (id) { var v = dockVis[id]; if (!v.head) { var left = dockWait() - (t - v.hiddenAt); if (left > 0 && left < soon) soon = left; } });
    if (dockJob) { clearTimeout(dockJob); dockJob = null; }
    if (soon < Infinity) dockJob = setTimeout(function () { dockJob = null; dockCheck(); }, soon + 20);
  }
  if (window.PM56_PMX && PM56_PMX.dock) PM56_PMX.dock.provide(function (ctx) { var l = dockLines(ctx); dockKey = l.map(function (x) { return x.key; }).join('|'); return l; });
  if (window.PM56_PMX && PM56_PMX.after) PM56_PMX.after(function (c, phase) { if (phase === 'app') { sentMoments(c || (EXT.ctx && EXT.ctx())); dockCheck(); } });
  var dockScrollRaf = 0;
  document.addEventListener('scroll', function (e) {
    if (!e.target || !e.target.classList || !e.target.classList.contains('transcript') || dockScrollRaf) return;
    dockScrollRaf = requestAnimationFrame(function () { dockScrollRaf = 0; dockCheck(); });
  }, { capture: true, passive: true });
  /* the dateline says "in 5 h" and the ring fills: the template refreshes them once a minute while a bubble waits
     in the open chat (a display refresh, never the schedule: nothing is dispatched by it) */
  (function minuteRefresh() {
    setTimeout(function () {
      var c = EXT.ctx && EXT.ctx(), tid = c && c.state && c.state.selectedThread;
      if (c && !document.hidden && P().scheduledMessages.some(function (m) { return m.thread_id === tid && stateOf(m) === 'scheduled'; })) c.renderApp();
      minuteRefresh();
    }, 60000 - (Date.now() % 60000) + 50);
  })();

  EXT.slot('transcriptMessage', function (ctx) {
    var m=ctx.m; if(!m || m.type!=='sched-message') return '';
    var rec=smById(m.scheduleId);
    if(!rec) return '<div class="event-card danger"><div class="event-copy"><strong>Schedule missing</strong>'+
      '<p>'+esc(m.scheduleId)+' was referenced but no longer exists in this session.</p></div></div>';
    return renderMessageCard(ctx, rec);
  });
  /* 7.14 (G-35): the family is answered here, first, so turn-stage.js never paints a ticket on it. Scheduled and
     Held wait in the chat (the spine's time tick); Sent, Canceled, Expired and Failed are one-line receipts. */
  EXT.slot('transcriptFamily', function (ctx) {
    var m = ctx && ctx.m; if (!m || m.type !== 'sched-message') return '';
    var rec = smById(m.scheduleId), st = rec ? stateOf(rec) : '';
    return st === 'scheduled' || st === 'held' ? 'time' : 'ledger';
  });

  /* Attach one card message per seeded schedule to its source thread, once,
     at module load -- before app.js clones D.threads. Same latitude
     collaboration.js uses for its run cards. */
  (function attachSeedCards(){
    var byId={}, i, list0=(D.threads||[]);
    for(i=0;i<list0.length;i++) byId[list0[i].id]=list0[i];
    var msgs=P().scheduledMessages;
    for(i=0;i<msgs.length;i++){
      var rec=msgs[i], th=byId[rec.thread_id];
      if(!th) continue;
      if(!Array.isArray(th.messages)) th.messages=[];
      var already=th.messages.some(function(m){ return m.type==='sched-message' && m.scheduleId===rec.scheduled_dispatch_id; });
      if(already) continue;
      th.messages.push({ id:'sched-card-'+rec.scheduled_dispatch_id, role:'system',
                         type:'sched-message', scheduleId:rec.scheduled_dispatch_id,
                         time:rec.createdAt, sentAt:rec.createdAt });
    }
  })();

  /* The chat's actions are distinct ids from the wand's `sched-open-manage` (a second element carrying it in the
     transcript would come first in DOM order, and a harness selecting by action alone would click the card). Every
     action is registered once (PM56_EXT.collisions stays empty). */
  EXT.action('sched-card-details', function(ctx,btn){ ui.cardOpen=ui.cardOpen||{}; ui.cardOpen[btn.dataset.id]=!ui.cardOpen[btn.dataset.id]; ctx.renderApp(); return true; });
  /* Held, missed while away: "Send now" is an update that reschedules the same message to now (CDRY-008: there is no
     send-now command), and then the time is evaluated through the shared scheduler exactly as its own tick would be */
  EXT.action('sched-card-send-now', function (ctx, btn) {
    var m = findMessage(btn.dataset.id); if (!m || (missedAt(m) == null && !pauseHeld(m))) return true;
    if (Number(btn.dataset.revision) !== m.revision || btn.dataset.currentness !== msgCurrent(m)) { ctx.toast('This changed', 'Reopen the message to see the latest.'); ctx.renderApp(); return true; }
    var d = loadMessageForEdit(m), at = Math.ceil((Date.now() + 60000) / 60000) * 60000, p = PM56_SCHEDULE_TIME.parts(m.timezone, at);
    d.date = p.y + '-' + pad2(p.mo) + '-' + pad2(p.d); d.time = pad2(p.h) + ':' + pad2(p.mi);
    var saved = saveMessage(ctx, d, m.scheduled_dispatch_id);
    if (!saved.ok) { ctx.toast('Not sent', SCHED_REFUSE[saved.error] || (SH.pmxRefusalText(saved.error, {}) || {}).text || saved.detail || saved.error); ctx.renderApp(); return true; }
    /* Send now is work you start yourself: its one dispatch is exempt from Pause all automations, which stays on (SQR-006/018) */
    var out = dispatchMessageAt(m.scheduled_dispatch_id, Date.parse(findMessage(m.scheduled_dispatch_id).scheduled_at_utc), null, true);
    ctx.renderApp();
    if (!out.ok) ctx.toast('Not sent', out.detail || out.error);
    return true;
  });
  /* the dock's Show: bring the bubble into view and pulse its perimeter once (PM56_PMX.reveal reaches only run cards:
     FOUNDATION REQUEST) */
  EXT.action('sched-dock-show', function (ctx, btn) {
    var el = document.querySelector('.transcript .sched-card[data-schedule-id="' + CSS.escape(btn.dataset.id || '') + '"]'), X = window.PM56_PMX;
    if (!el) return true;
    var reduced = X && X.reduced && X.reduced();
    try { el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }); } catch (e) { el.scrollIntoView(); }
    if (X && X.animate && X.t) {
      var pulse = getComputedStyle(el).getPropertyValue('--pmx-accent-pulse').trim() || 'currentColor', base = getComputedStyle(el).boxShadow, ring = function (w, c) { return (base && base !== 'none' ? base + ', ' : '') + '0 0 0 ' + w + 'px ' + c; };
      X.animate(el, [{ boxShadow: ring(0, 'transparent') }, { boxShadow: ring(3, pulse), offset: 0.3 }, { boxShadow: ring(1, 'transparent') }], { duration: X.t('pulse'), easing: X.ease('out'), decorative: true });
    }
    return true;
  });
  EXT.action('sched-focus-clear', function (ctx) { ui.focusSchedule = null; ctx.renderOverlays(); return true; });
  EXT.action('sched-open-sent',function(ctx,btn){
    var m=smById(btn.dataset.id);if(!m?.dispatchedMessageId)return true;
    ctx.closeDialog();ctx.switchThread(m.thread_id);
    requestAnimationFrame(()=>document.querySelector('[data-message-id="'+CSS.escape(m.dispatchedMessageId)+'"]')?.scrollIntoView({block:'center',behavior:'smooth'}));return true;
  });
  EXT.action('sched-focus-record',function(ctx,btn){ui.focusSchedule=btn.dataset.id;ui.focusBuild=null;ui.manageTab='messages';ui.msgConfirm=null;ui.buildConfirm=null;ctx.openDialog({type:'sched-manage'});return true;});
  EXT.action('sched-pick-model',function(ctx,btn){
    var d=ui.msgDraft;if(!d)return true;
    window.PM56_PICKERS.openModel(btn,{model:d.modelId,effort:d.effort,fast:d.fast},v=>{if(ui.msgDraft!==d||ctx.state.dialog?.type!=='sched-message')return;d.modelId=v.model;d.effort=v.effort;d.fast=v.fast;ctx.renderOverlays();});return true;
  });
  /* Enumeration pickers — the seven former native select elements, now
     shared openChoice menus. Guarded exactly like sched-pick-model above: draft
     existence at click time, draft identity and dialog type re-checked
     inside the onChange callback before assigning and re-rendering. */
  EXT.action('sched-pick-msg-tz',function(ctx,btn){
    var d=ui.msgDraft;if(!d)return true;
    window.PM56_PICKERS.openChoice(btn,'Time zone',d.timezone,tzChoiceOptions(d.timezone),v=>{if(ui.msgDraft!==d||ctx.state.dialog?.type!=='sched-message')return;d.timezone=v;clearRefusal(d);ctx.renderOverlays();});return true;
  });
  EXT.action('sched-pick-msg-missed',function(ctx,btn){
    var d=ui.msgDraft;if(!d)return true;
    window.PM56_PICKERS.openChoice(btn,'If it’s missed',d.missed,choiceMenu(MISSED_MSG_OPTIONS,d.grace),v=>{if(ui.msgDraft!==d||ctx.state.dialog?.type!=='sched-message')return;d.missed=v;clearRefusal(d);ctx.renderOverlays();});return true;
  });
  EXT.action('sched-pick-manager-status',function(ctx,btn){
    var f=managerFilter(ui.manageTab);
    window.PM56_PICKERS.openChoice(btn,'Which ones to show',f.status,choiceMenu(MANAGER_STATUS_OPTIONS),v=>{if(ctx.state.dialog?.type!=='sched-manage')return;f.status=v;ctx.renderOverlays();});return true;
  });
  EXT.action('sched-pick-manager-sort',function(ctx,btn){
    var f=managerFilter(ui.manageTab);
    window.PM56_PICKERS.openChoice(btn,'Order',f.sort,choiceMenu(MANAGER_SORT_OPTIONS),v=>{if(ctx.state.dialog?.type!=='sched-manage')return;f.sort=v;ctx.renderOverlays();});return true;
  });
  EXT.action('sched-pick-build-topology',function(ctx,btn){
    var d=ui.buildDraft;if(!d)return true;
    /* A Crew stays listed, disabled with its reason, on a plan a Crew can't be given (no work reference: the Crew
       sheet would refuse "Use this Crew for the build" every time) */
    var opts=topologyMenu(d.planId),apply=v=>{if(ui.buildDraft!==d||ctx.state.dialog?.type!=='sched-build-at')return;d.executionTopology=v;clearRefusal(d);ctx.renderOverlays();};
    if(window.PM56_PMX&&PM56_PMX.pick)PM56_PMX.pick(btn,{title:'Who builds it',current:d.executionTopology||'agent',options:opts,onChange:apply});
    else window.PM56_PICKERS.openChoice(btn,'Who builds it',d.executionTopology||'agent',opts.filter(o=>!o.disabled),apply);return true;
  });
  EXT.action('sched-pick-build-tz',function(ctx,btn){
    var d=ui.buildDraft;if(!d)return true;
    window.PM56_PICKERS.openChoice(btn,'Time zone',d.timezone,tzChoiceOptions(d.timezone),v=>{if(ui.buildDraft!==d||ctx.state.dialog?.type!=='sched-build-at')return;d.timezone=v;clearRefusal(d);ctx.renderOverlays();});return true;
  });
  EXT.action('sched-pick-build-missed',function(ctx,btn){
    var d=ui.buildDraft;if(!d)return true;
    window.PM56_PICKERS.openChoice(btn,'If the slot is missed',d.missed,choiceMenu(MISSED_BUILD_OPTIONS,d.grace),v=>{if(ui.buildDraft!==d||ctx.state.dialog?.type!=='sched-build-at')return;d.missed=v;clearRefusal(d);ctx.renderOverlays();});return true;
  });
  EXT.action('sched-card-edit', function(ctx,btn){
    var rec=smById(btn.dataset.id); if(!rec) return true;
    var pr=messageProjection(rec);
    /* the card re-renders to the state it is really in, and the toast says why in plain words */
    if(!pr.can_edit){ctx.toast('Can’t change it',cantEdit(rec));ctx.renderApp();return true;}
    ui.editingMsgId=rec.scheduled_dispatch_id;
    ui.msgDraft=loadMessageForEdit(rec);ui.msgConfirm=null;ui.techOpen=null;ui.openSeq++;
    ctx.openDialog({ type:'sched-message' });
    return true;
  });
  EXT.action('sched-card-cancel',function(ctx,btn){const id=btn.dataset.id,m=findMessage(id);if(!m)return true;
    const token=btn.dataset.revision?{id,revision:Number(btn.dataset.revision),currentness:btn.dataset.currentness}:m.binding_kind==='scheduled_message_v2'?null:captureMessage(id);
    const out=cancelMessageExact(id,token);ctx.renderApp();ctx.toast(out.ok?'Schedule canceled':'Cancel refused',out.ok?'It won’t be sent. Its record stays in Scheduled.':(SCHED_REFUSE[out.error]||out.detail));return true;
  });

  /* PSCHED-010 / SMSG-016 / PGOAL-008: association-scoped invalidation. Only
     the schedules and quota consent tied to THAT execution are invalidated;
     a thread's unrelated scheduled user messages are never cleared. */
  function invalidateForExecution(assoc){
    const TX=window.PM56_TX,out={schedules:0,consents:0,untouched:0};
    for(const b of P().buildSchedules){
      if(b.target_id!==assoc.plan_id||b.schedule_id===assoc.exclude_schedule_id||!['active','paused','held'].includes(b.state))continue;
      if(assoc.version!=null&&b.exact_target_version!==assoc.version)continue;
      TX.set(b,'state','invalidated');TX.set(b,'revision',b.revision+1);
      const why=assoc.why||'The bound execution was cancelled at continuation epoch '+assoc.epoch+'.';
      TX.set(b,'invalidated_reason',why);TX.set(b,'invalidReason',why);TX.set(b,'updatedAt',nowIso());TX.set(b,'log',[{at:nowIso(),text:'Invalidated: '+why},...(b.log||[])].slice(0,40));out.schedules++;
    }
    for(const c of P().quotaConsents||[]){if((c.association_id===assoc.plan_id||c.target_id===assoc.plan_id)&&c.state!=='revoked'){
      TX.set(c,'state','revoked');TX.set(c,'enabled',false);TX.set(c,'revokedReason','Bound execution cancelled.');out.consents++;
    }}
    out.untouched=P().scheduledMessages.filter(m=>['scheduled','held'].includes(m.state)).length;persistNow();return out;
  }

  /* =====================================================================
     9. ACTIONS + FIELD LISTENERS
     ===================================================================== */
  function cantEdit(rec) {
    var st = stateOf(rec);
    return st === 'sent' ? 'This message was already sent, so it can’t be changed.' : st === 'canceled' ? 'This message was canceled, so it can’t be changed. Schedule it again instead.'
      : st === 'expired' ? 'This message was skipped, so it can’t be changed. Schedule it again instead.' : 'This message can’t be changed right now. Reopen it to see the latest.';
  }
  function reRender(ctx) { ctx.renderApp(); ctx.renderOverlays && ctx.renderOverlays(); }
  /* the plain sentence for an eligibility or refusal clause in a toast (9.x copy deck); the owner's own words stay
     in the record's log and in Events' hover card */
  var PLAIN_CLAUSE = { manual_stop_latched: 'You pressed Stop, so nothing scheduled starts until you resume.',
    project_automation_paused: 'Pause all automations is on, so nothing starts until you turn it off.', permission_denied: 'Only you can turn Pause all automations off.',
    quota_unavailable: 'Your usage limit is reached, so it waits for the reset.', reset_truth_unknown: 'We don’t know when your usage limit resets, so nothing resumes by itself.',
    target_version_changed: 'The plan changed since it was scheduled, so it waits for you.', stale_schedule_revision: 'This changed somewhere else. Reopen to see the latest.',
    schedule_not_found: 'That schedule no longer exists.', stale_stop_epoch: 'You pressed Stop while this was deciding, so it didn’t start.',
    window_not_open: 'It isn’t time for it yet, so nothing started.', window_inactive: 'It was outside its time slot, so nothing started.',
    grace_expired: 'It was too late, so it was skipped as you asked.', missed_time_held: 'The start time was missed, so it waits for you.',
    schedule_not_active: 'This schedule isn’t active, so nothing started.', worktree_snapshot_changed: 'The folder this plan builds in changed, so nothing started.',
    permission_snapshot_changed: 'This chat’s permissions changed after you scheduled it, so nothing started.' };
  function plainClause(res) { var c = res && (res.clause || res.error); return PLAIN_CLAUSE[c] || SCHED_REFUSE[c] || (c && SH.pmxRefusalText ? (SH.pmxRefusalText(c, {}) || {}).text : '') || SH.PMX_COPY.refusal.fallback; }

  /* Contract for plans.js (integrator-owned Plan card): register an action
     named exactly `sched-open-build-at` reading data-plan-id/data-plan-version,
     AND expose window.PM56_SCHED.openBuildAt(ctx, planId, version) so the card
     can call either the action or the function directly. */
  function openBuildAt(ctx, planId, version) {
    ctx = ctx || (EXT.ctx && EXT.ctx());
    if (!ctx) return false;
    planId = String(planId);
    version = Number(version);
    ui.editingBuildId=null;ui.buildConfirm=null;ui.techOpen=null;ui.openSeq++;
    ui.buildDraft = defaultBuildDraft(planId, version);
    ctx.closeMenu && ctx.closeMenu();
    ctx.openDialog({ type: 'sched-build-at', planId: planId, version: version });
    return true;
  }

  var ACT = {};
  ACT['sched-open-message'] = function (ctx) {
    ui.msgDraft = defaultMsgDraft(ctx); ui.editingMsgId = null; ui.msgConfirm = null; ui.techOpen = null; ui.openSeq++;
    ctx.closeMenu && ctx.closeMenu();
    ctx.openDialog({ type: 'sched-message' });
  };
  ACT['sched-show-all-builds']=function(ctx){ui.focusBuild=null;ctx.renderApp();};
  ACT['sched-open-plan-record']=function(ctx,btn){ui.buildConfirm=null;ui.buildDraft=null;ui.editingBuildId=null;ui.focusBuild=btn.dataset.id;ui.manageTab='builds';ctx.openDialog({type:'sched-manage'});};
  /* the manager opens on Scheduled Messages; only a focus target (a record, a Plan's build) opens another tab */
  ACT['sched-open-manage'] = function (ctx) {
    ui.focusBuild=null;ui.focusSchedule=null;ui.msgConfirm=null;ui.buildConfirm=null;ui.manageTab='messages';
    ctx.closeMenu && ctx.closeMenu();
    ctx.openDialog({ type: 'sched-manage' });
  };
  ACT['sched-open-build-at'] = function (ctx, btn) {
    openBuildAt(ctx, btn.dataset.planId, btn.dataset.planVersion);
  };
  ACT['sched-close-dialog'] = function (ctx) {
    /* after a committed Schedule Message focus goes to the message box; after Build At to the Plan control that
       opened it (the sheet's save exit either way); a plain close returns focus to its opener (6.7, IMPACT A1-36) */
    var X = window.PM56_PMX, mc = ui.msgConfirm, bc = ui.buildConfirm;
    if (X && X.exitHint && mc) X.exitHint('save', { focus: 'textarea[data-input="composer"]' });
    else if (X && X.exitHint && bc) X.exitHint('save', { focus: function () { var q = function (s) { return document.querySelector(s); }, id = CSS.escape(bc.planId);
      return q('[data-action="pd-build-at"][data-id="' + id + '"]') || q('.plan-schedule-line [data-action="sched-open-plan-record"]') || q('[data-action="pd-more-actions"][data-id="' + id + '"]'); } });
    ui.msgDraft = null; ui.editingMsgId = null; ui.buildDraft = null;ui.editingBuildId=null;ui.msgConfirm=null;ui.buildConfirm=null;ui.techOpen=null;
    ui.manageTab='messages';ui.focusSchedule=null;ui.focusBuild=null;
    ctx.closeDialog();
    /* a guided example beside the sheet comes back once the sheet has gone (plan-demo-batch2.js) */
    if (window.PM56_SCHEDULE_DEMOS && PM56_SCHEDULE_DEMOS.afterClose) PM56_SCHEDULE_DEMOS.afterClose();
  };
  ACT['sched-create-message'] = async function(ctx){
    if(!ui.msgDraft||ui.snapshotBusy)return;
    const draft=ui.msgDraft,editingId=ui.editingMsgId,editing=!!editingId;
    const finish=rec=>{ui.msgConfirm=messageConfirmation(rec,editing);ui.msgDraft=null;ui.editingMsgId=null;ui.focusSchedule=rec.scheduled_dispatch_id;ui.manageTab='messages';ctx.renderApp();ctx.renderOverlays&&ctx.renderOverlays();};
    if(!(draft.attachments||[]).some(a=>!a.snapshot_ref&&!a.artifact_ref&&!a.artifact_id)){const rec=commitMessage(ctx);if(rec)finish(rec);return;}
    ui.snapshotBusy=true;ctx.renderOverlays();
    const out=await saveMessageWithSnapshots(draft,editingId,()=>ui.msgDraft===draft&&ui.editingMsgId===editingId);
    ui.snapshotBusy=false;
    if(ui.msgDraft!==draft||ui.editingMsgId!==editingId)return;
    if(!out.ok){refuse(draft,out.error,out.detail);ctx.renderOverlays();return;}
    finish(out.record);
  };
  ACT['sched-cancel-message'] = function (ctx, btn) {
    var ok = cancelMessage(btn.dataset.id);
    reRender(ctx);
    ctx.toast(ok ? 'Schedule canceled' : 'Couldn’t cancel', ok ? 'It won’t be sent. Its record stays in Scheduled.' : 'It may have been sent already.');
  };
  ACT['sched-dispatch-message'] = function (ctx, btn) {
    var res = dispatchMessage(ctx, btn.dataset.id);
    if (!res) return;
    reRender(ctx);
    if (res.duplicate) ctx.toast('Nothing sent twice', 'This message was already sent once.');
    else if (res.refused) ctx.toast('Not sent',res.reason);
    else if (res.held) ctx.toast('Held for you', res.reason);
    else if (res.dispatched) ctx.toast('Scheduled message sent', 'Sent the exact text you scheduled to ' + (res.thread ? res.thread.title : 'its chat') + '.');
  };
  ACT['sched-edit-message'] = function (ctx, btn) {
    var rec = findMessage(btn.dataset.id); if (!rec) return;
    if(!messageProjection(rec).can_edit){ctx.toast('Can’t change it',cantEdit(rec));ctx.renderApp();return;}
    ui.editingMsgId = rec.scheduled_dispatch_id;
    ui.msgDraft = loadMessageForEdit(rec); ui.msgConfirm = null; ui.techOpen = null; ui.openSeq++;
    ctx.openDialog({type:'sched-message'});
  };
  ACT['sched-cancel-edit-message'] = function (ctx) {
    ui.editingMsgId = null; ui.msgDraft = defaultMsgDraft(ctx);
    reRender(ctx);
  };
  ACT['sched-edit-build']=function(ctx,btn){
    var b=findBuild(btn.dataset.id);if(!b||b.state!=='active'||b.dispatchReceipt)return;
    ui.editingBuildId=b.schedule_id;ui.buildConfirm=null;ui.techOpen=null;ui.openSeq++;
    var local=PM56_SCHEDULE_TIME.parts(b.timezone,Date.parse(b.scheduled_at_utc||b.next_occurrence_at));
    ui.buildDraft={requestKey:ctx.uid('build-schedule-update'),expectedCurrentness:buildCurrent(b),executionTopology:b.execution_topology||'agent',crewDefinition:b.topology_snapshot?.collaboration_definition_ref||null,expected:window.PM56_PLANS.admissionSnapshot(b.target_id),planId:b.target_id,version:b.exact_target_version,contentHash:b.exact_target_hash,expectedRevision:b.revision,kind:b.schedule_kind,date:local?local.y+'-'+pad2(local.mo)+'-'+pad2(local.d):'',time:b.local_start,startTime:b.local_start,pauseTime:b.local_pause||SCHED_DEFAULTS.build.stop,timezone:b.timezone,days:b.days_of_week.slice(),windDown:b.wind_down_seconds/60,autoResumeNext:b.auto_resume_next_window,missed:b.missed_policy,grace:(b.grace_seconds||SCHED_DEFAULTS.build.graceMinutes*60)/60};
    ctx.openDialog({type:'sched-build-at',planId:b.target_id,version:b.exact_target_version});
  };
  ACT['sched-configure-crew']=function(ctx){const d=ui.buildDraft;if(!d)return;if(!crewAllowed(d.planId)){refuse(d,'plan_not_ready_for_crew');ctx.renderOverlays();return;}const out=PM56_COLLAB.openScheduledCrew({...d.expected},d.crewDefinition);if(!out.ok){refuse(d,out.error,out.message);ctx.renderOverlays();}};
  ACT['sched-create-build'] = function (ctx, btn) {
    // A completed or canceled form cannot be replayed into a second schedule.
    if (!ui.buildDraft) return;
    var d=ui.buildDraft,err=d.kind==='one_time'?validateWall(d.date,d.time,d.timezone):(!d.days.length?'no_days':d.startTime===d.pauseTime?'same_times':'');
    if(err){refuse(d,err);ctx.renderOverlays();return;}
    var old=ui.editingBuildId?findBuild(ui.editingBuildId):null;
    if(ui.editingBuildId&&(!old||old.state!=='active'||old.exact_target_version!==d.version||old.revision!==d.expectedRevision)){refuse(d,'stale_schedule_revision');ctx.renderOverlays();return;}
    var rec=commitBuild(ctx);if(!rec)return;
    /* the confirmation exists only after this durable commit (IMPACT A4-03); the Plan card's line updates behind it */
    ui.buildConfirm=buildConfirmation(rec,d,!!old);
    ui.editingBuildId=null;ui.buildDraft=null;ui.manageTab='builds';ui.focusBuild=rec.schedule_id;
    reRender(ctx);
  };
  ACT['sched-cancel-build'] = function (ctx, btn) {
    var ok = cancelBuild(btn.dataset.id,{revision:Number(btn.dataset.revision),currentness:btn.dataset.currentness});
    reRender(ctx);
    ctx.toast(ok ? 'Schedule canceled' : 'Could not cancel', ok ? 'No future dispatch.' : 'It may have already completed.');
  };
  ACT['sched-rebind-build'] = function (ctx, btn) {
    var rec = rebindBuild(btn.dataset.id,{version:Number(btn.dataset.version),hash:btn.dataset.hash,revision:Number(btn.dataset.revision)});
    reRender(ctx);
    if (rec) ctx.toast('Schedule updated', 'Bound to V' + rec.exact_target_version + '.');
    else ctx.toast('Schedule changed', 'Review the current version and choose its Use Vn control again. No schedule was rebound.');
  };
  ACT['sched-simulate-revision'] = function (ctx, btn) {
    var rec = simulateRevision(btn.dataset.id);
    reRender(ctx);
    if (rec) ctx.toast('Plan revised (simulated)', rec.invalidated_reason);
  };
  ACT['sched-advance-window'] = function (ctx, btn) {
    var res = advanceWindow(btn.dataset.id);
    reRender(ctx);
    if (res.refused) ctx.toast('Didn’t move on', plainClause(res));
    else if (res.duplicate) ctx.toast('Nothing ran twice', 'That start already happened once.');
  };
  ACT['sched-fire-duplicate'] = function (ctx, btn) {
    var rec = fireDuplicateOccurrence(btn.dataset.id);
    reRender(ctx);
    if (rec) ctx.toast('Nothing ran twice', 'That night’s build already started once, so the repeat was ignored.');
  };
  ACT['sched-jump-transition'] = function (ctx, btn) {
    var rec = jumpToTransition(btn.dataset.id, btn.dataset.which);
    reRender(ctx);
    if (rec) ctx.toast('Demo clock moved', 'Use “Jump to the next start or stop” to walk into the night the clocks ' + (btn.dataset.which === 'spring_forward' ? 'jump forward' : 'fall back') + '.');
    else ctx.toast('No clock change found', 'This time zone doesn’t change its clocks this year.');
  };
  ACT['sched-set-build-kind'] = function (ctx, btn) {
    if (!ui.buildDraft) return;
    ui.buildDraft.kind = btn.dataset.value; clearRefusal(ui.buildDraft);
    reRender(ctx);
  };
  ACT['sched-toggle-day'] = function (ctx, btn) {
    if (!ui.buildDraft) return;
    var day = Number(btn.dataset.day), i = ui.buildDraft.days.indexOf(day);
    if (i >= 0) ui.buildDraft.days.splice(i, 1); else ui.buildDraft.days.push(day);
    clearRefusal(ui.buildDraft);
    reRender(ctx);
  };
  /* 8.7 presets: each writes the real date and time inputs (never a hidden value of its own) */
  ACT['sched-preset'] = function (ctx, btn) {
    var d = ui.msgDraft; if (!d) return;
    var p = msgPresets(d, nowMinute()).filter(function (x) { return x.value === btn.dataset.value; })[0]; if (!p) return;
    d.date = p.date; d.time = p.time; clearRefusal(d);
    ctx.renderOverlays();
  };
  /* card 8: sched-toggle-tech removed with techBlock; ui.techOpen keeps only the 'raw:' (Show raw data) keys */
  ACT['sched-toggle-autoresume'] = function (ctx) {
    if (!ui.buildDraft) return;
    ui.buildDraft.autoResumeNext = !ui.buildDraft.autoResumeNext;
    reRender(ctx);
  };
  ACT['sched-manage-tab'] = function (ctx, btn) {
    ui.manageTab = btn.dataset.tab;
    reRender(ctx);
  };
  ACT['sched-simulate-stop'] = function (ctx) {
    latchStop('Manual Stop, simulated from Scheduled & Automations.');
    persistNow();
    reRender(ctx);
    ctx.toast('Stopped', 'Scheduled sends and builds wait until you resume. Pause all automations is unchanged.');
  };
  ACT['sched-clear-stop'] = function (ctx) {
    clearStop();
    persistNow();
    reRender(ctx);
    ctx.toast('Resumed', 'Scheduled things can start again. Pause all automations is unchanged.');
  };
  /* cmd.runtime.automation_pause.set, from the Resume & Safety Policy tab: the switch and "Turn back on" */
  function applyPause(ctx, paused) {
    var out = setAutomationPause(paused, 'user');
    reRender(ctx);
    if (!out.ok) { ctx.toast('Not changed', plainClause(out)); return; }
    if (out.unchanged) return;
    if (paused) ctx.toast('Paused all automations', 'Nothing scheduled in this project starts until you turn it off.');
    else ctx.toast('Automations back on', 'Anything that came due while paused follows its own “if it’s missed” choice. Nothing fires in a burst.');
  }
  ACT['sched-set-pause'] = function (ctx, btn) { applyPause(ctx, btn.dataset.value === 'on'); };
  ACT['sched-clear-pause'] = function (ctx) { applyPause(ctx, false); };
  ACT['sched-race-demo'] = function (ctx) {
    var epoch = P().stopEpoch;
    latchStop('Manual Stop, latched mid-flight by the race demo.');
    var elig = evaluateEligibility('message', { state: 'scheduled' }, epoch);
    persistNow();
    reRender(ctx);
    ctx.toast(elig.ok ? 'Unexpected: it would have sent' : 'Not sent', elig.ok ? elig.detail : plainClause(elig));
  };
  ACT['sched-attempt-resume'] = function (ctx) {
    var elig = attemptAutoResume();
    reRender(ctx);
    ctx.toast(elig.ok ? 'It can continue' : 'It won’t continue by itself', elig.ok ? 'Nothing is stopping it from continuing.' : plainClause(elig));
  };
  ACT['sched-simulate-quota-reset'] = function (ctx) {
    var elig = simulateQuotaReset();
    reRender(ctx);
    ctx.toast(elig.ok ? 'Usage is back: it continued' : 'Usage is back, but it didn’t continue', elig.ok ? 'It picked up where it left off.' : plainClause(elig));
  };
  ACT['sched-reload-now'] = function () {
    try { sessionStorage.setItem('pm56-sched-reopen', '1'); } catch (e) { }
    location.reload();
  };
  Object.keys(ACT).forEach(function (name) { EXT.action(name, function (ctx, btn, ev) { ACT[name](ctx, btn, ev); return true; }); });

  /* typing never repaints the sheet (caret safety); it re-renders only when Schedule's reason changes (empty,
     too long, fine) or a refusal clears, and the focused field keeps its value and caret through that patch */
  document.addEventListener('input',function(e){
    if(!e.target||!e.target.dataset||e.target.dataset.schedInput!=='msg-text'||!ui.msgDraft)return;
    var d=ui.msgDraft,v=e.target.value,state=function(t){return !String(t||'').trim()?'empty':String(t).length>8000?'long':'ok';};
    var flip=state(d.text)!==state(v)||!!(d.errorCode||d.error);
    d.text=v;clearRefusal(d);
    if(flip){var c=EXT.ctx&&EXT.ctx();if(c&&c.renderOverlays)c.renderOverlays();}
  });
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    var k = t.getAttribute('data-sched-input'); if (!k) return;
    var ctx = EXT.ctx && EXT.ctx(); if (!ctx) return;
    var md = ui.msgDraft, bd = ui.buildDraft;
    if(k==='manager-query'){managerFilter(ui.manageTab).query=t.value;ctx.renderOverlays();return;}
    if (k === 'msg-text' && md) md.text = t.value;
    else if (k === 'msg-date' && md) md.date = t.value;
    else if (k === 'msg-time' && md) md.time = t.value;
    else if (k === 'msg-model' && md) md.modelId = t.value;
    else if (k === 'msg-grace' && md) md.grace = clamp(t.value, 1, 1440);
    else if (k === 'msg-tz' && md && t.value) md.timezone = t.value;
    else if (k === 'build-tz' && bd && t.value) bd.timezone = t.value;
    else if (k === 'build-grace' && bd) bd.grace = clamp(t.value, 1, 1440);
    else if (k === 'build-date' && bd) bd.date = t.value;
    else if (k === 'build-time' && bd) bd.time = t.value;
    else if (k === 'build-start' && bd) bd.startTime = t.value;
    else if (k === 'build-pause' && bd) bd.pauseTime = t.value;
    else if (k === 'build-wind' && bd) bd.windDown = clamp(t.value, 0, 180);
    else return;
    clearRefusal(k.indexOf('msg-') === 0 ? md : bd);
    reRender(ctx);
  });

  /* Schedule Message: the 48-hour track is the send-time control. Drag snaps
     to 15 minutes (5 with Shift) and never lands in the past. The overlay
     repaint is one frame; ink waits until pointerup. */
  var dragPtr = null, dragFrame = 0;
  function minAllowedAt() { return Math.ceil((Date.now() + 60000) / 300000) * 300000; }
  function visibleTrackFig(slot) {
    var fit = slot.querySelector('.pmx-plate-fit');
    var mode = (fit && fit.getAttribute('data-fit')) || 'full';
    var fig = slot.querySelector('.pmx-plate[data-mode="' + mode + '"]');
    if (fig && fig.getClientRects().length) return fig;
    var plates = slot.querySelectorAll('.pmx-plate');
    for (var i = 0; i < plates.length; i++) if (plates[i].getClientRects().length) return plates[i];
    return fig;
  }
  function writeMsgInstant(d, t) {
    var p = T0.parts(d.timezone, t); if (!p) return;
    d.date = ymdOf(p); d.time = pad2(p.h) + ':' + pad2(p.mi); clearRefusal(d);
  }
  function applyTrackX(slot, clientX, shift) {
    var d = ui.msgDraft; if (!d) return;
    var fig = visibleTrackFig(slot); if (!fig) return;
    var svg = fig.querySelector('svg'); if (!svg) return;
    var ctm = svg.getScreenCTM(); if (!ctm) return;
    var t0 = Number(fig.getAttribute('data-sched-t0')), span = Number(fig.getAttribute('data-sched-span'));
    var x0 = Number(fig.getAttribute('data-sched-x0')), x1 = Number(fig.getAttribute('data-sched-x1'));
    if (![t0, span, x0, x1].every(function (n) { return Number.isFinite(n); }) || x1 <= x0 || span <= 0) return;
    var vx = new DOMPoint(clientX, 0).matrixTransform(ctm.inverse()).x;
    vx = Math.max(x0, Math.min(x1, vx));
    var step = shift ? 300000 : 900000;
    var t = Math.round((t0 + (vx - x0) / (x1 - x0) * span) / step) * step;
    t = Math.max(minAllowedAt(), Math.min(t0 + span, t));
    writeMsgInstant(d, t);
  }
  function paintDrag() {
    dragFrame = 0;
    if (!ui.schedDrag) return;
    var ctx = EXT.ctx && EXT.ctx();
    if (ctx && ctx.renderOverlays) ctx.renderOverlays();
  }
  function scheduleDragPaint() { if (!dragFrame) dragFrame = requestAnimationFrame(paintDrag); }
  function endSchedDrag() {
    if (dragPtr == null && !ui.schedDrag) return;
    if (dragFrame) { cancelAnimationFrame(dragFrame); dragFrame = 0; }
    var ctx = EXT.ctx && EXT.ctx();
    if (ui.schedDrag && ctx && ctx.renderOverlays) ctx.renderOverlays();
    ui.schedDrag = false;
    dragPtr = null;
    if (ctx) reRender(ctx);
  }
  function stepMsgKey(d, target) {
    var t = Math.round(target / 300000) * 300000;
    t = Math.max(minAllowedAt(), Math.min(trackFrame(d.timezone, nowMinute(), 904).end, t));
    writeMsgInstant(d, t);
  }
  document.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || !ui.msgDraft || ui.schedDrag) return;
    var slot = e.target && e.target.closest && e.target.closest('.sched-dialog--message .pmx-sched-slot[data-sched-drag]');
    if (!slot) return;
    e.preventDefault();
    try { slot.setPointerCapture(e.pointerId); } catch (err) { }
    try { slot.focus({ preventScroll: true }); } catch (err2) { }
    slot.setAttribute('data-dragging', '');
    ui.schedDrag = true;
    dragPtr = e.pointerId;
    applyTrackX(slot, e.clientX, e.shiftKey);
    scheduleDragPaint();
  });
  document.addEventListener('pointermove', function (e) {
    if (!ui.schedDrag || e.pointerId !== dragPtr) return;
    var slot = document.querySelector('.sched-dialog--message .pmx-sched-slot[data-sched-drag]');
    if (!slot) return;
    applyTrackX(slot, e.clientX, e.shiftKey);
    scheduleDragPaint();
  });
  document.addEventListener('pointerup', function (e) { if (e.pointerId === dragPtr) endSchedDrag(); });
  document.addEventListener('pointercancel', function (e) { if (e.pointerId === dragPtr) endSchedDrag(); });
  document.addEventListener('keydown', function (e) {
    var slot = e.target && e.target.closest && e.target.closest('.sched-dialog--message .pmx-sched-slot[data-sched-drag]');
    if (!slot || !ui.msgDraft || e.altKey || e.ctrlKey || e.metaKey || ui.schedDrag) return;
    var d = ui.msgDraft, w = msgWhen(d, nowMinute()), from = w.ok ? w.at : minAllowedAt(), target = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') target = from + (e.shiftKey ? 3600000 : 300000);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') target = from + (e.shiftKey ? -3600000 : -300000);
    /* ARIA slider convention: Page Up is the larger step up (a day later), Page Down a day earlier. */
    else if (e.key === 'PageUp') target = from + 86400000;
    else if (e.key === 'PageDown') target = from - 86400000;
    else if (e.key === 'Home') target = minAllowedAt();
    else if (e.key === 'End') target = trackFrame(d.timezone, nowMinute(), 904).end;
    else return;
    e.preventDefault();
    stepMsgKey(d, target);
    var ctx = EXT.ctx && EXT.ctx();
    if (ctx) reRender(ctx);
  });

  /* =====================================================================
     10. RESET-ALL CHAIN + PUBLIC SURFACE + BOOT
     ===================================================================== */
  var prevReset = EXT._actions && EXT._actions['reset-all'];
  EXT.chainAction('reset-all', function (ctx, btn, ev) {
    restoreFixture();
    return false;
  });

  window.PM56_SCHED = {
    currentCrewTarget:()=>ui.buildDraft?.planId,
    returnFromCrewConfiguration:()=>{const d=ui.buildDraft;if(d)EXT.ctx().openDialog({type:'sched-build-at',planId:d.planId,version:d.version});else EXT.ctx().closeDialog();},
    acceptCrewConfiguration:(snapshot,expected)=>{const d=ui.buildDraft;if(!d||d.planId!==snapshot.plan_id||!identical(d.expected,expected)||!identical(PM56_PLANS.admissionSnapshot(d.planId),expected))return msgError('schedule_form_changed');d.crewDefinition=snapshot;d.executionTopology='crew';EXT.ctx().openDialog({type:'sched-build-at',planId:d.planId,version:d.version});return {ok:true};},
    openBuildAt: openBuildAt,
    captureBuild,windowTick,workEligibility,setPlanQuotaConsent,buildWindow,
    buildDraft:defaultBuildDraft,editBuildDraft:id=>{const b=findBuild(id);if(!b)return null;ACT['sched-edit-build'](EXT.ctx(),{dataset:{id}});return copy(ui.buildDraft);},
    saveBuild:(draft,id)=>{const before=ui.buildDraft,edit=ui.editingBuildId;ui.buildDraft=draft;ui.editingBuildId=id||null;try{const r=commitBuild(EXT.ctx());return r?{ok:true,record:r}:msgError(draft.error||'build_schedule_refused');}finally{ui.buildDraft=before;ui.editingBuildId=edit;}},
    cancelBuildExact:(id,expected)=>cancelBuild(id,expected),
    captureMessage,saveMessageWithSnapshots,saveMessage:(draft,editingId)=>saveMessage(EXT.ctx(),draft,editingId),prepareMessage:(draft)=>prepareMessage(EXT.ctx(),draft),
    messageDraft:()=>defaultMsgDraft(EXT.ctx()),editMessageDraft:id=>findMessage(id)?loadMessageForEdit(findMessage(id)):null,
    cancelMessageExact,messageTicket,deliverMessage,dispatchMessageAt,
    registerMessageReceiver:(threadId,receiver)=>{if(messageReceivers.has(threadId))throw Error('duplicate_schedule_receiver');messageReceivers.set(threadId,receiver);},
    registerMessageDestination:(kind,owner)=>{if(kind==='assistant'||messageDestinations.has(kind)||!owner?.validate||!owner?.deliver)throw Error('invalid_destination_owner');messageDestinations.set(kind,owner);},
    latchStop:(reason)=>{latchStop(reason);persistNow();},
    /* SQR-018 / DL-136: cmd.runtime.automation_pause.set (actor defaults to the user) and its record */
    setAutomationPause:(paused,actor)=>setAutomationPause(paused,actor),
    automationPause:()=>copy(autoPause()),
    stopSnapshot:()=>({epoch:P().stopEpoch,stopped:P().stopped}),
    checkEpoch:token=>token?.epoch!==P().stopEpoch?{ok:false,error:"stale_stop_epoch"}:P().stopped?{ok:false,error:"manual_stop_latched"}:{ok:true},
    planSummary:planSummary,
    provenance:id=>findMessage(id)||findBuild(id)?(SEED_IDS[id]?'seed':'wand'):null,
    defaults:()=>JSON.parse(JSON.stringify(SCHED_DEFAULTS)),
    dispatchBuildAt:dispatchBuildAt,
    /* the one plain sentence for a refusal or eligibility clause (9.3): the code itself is never printed */
    refusalText:function(res){return plainClause(typeof res==='string'?{clause:res}:res);},
    bindGoalQuotaConsent,attemptAutoResume,simulateQuotaReset,
    list: function () { return { messages: P().scheduledMessages, builds: P().buildSchedules, consents: P().quotaConsents, events: P().events }; },
    /* Additive Correction v4 (SMSG / PSCHED). */
    messageProjection: function (id) { var r = smById(id); return r ? messageProjection(r) : null; },
    messageProjections: function (threadId) {
      return P().scheduledMessages
        .filter(function (m) { return !threadId || m.thread_id === threadId; })
        .map(messageProjection);
    },
    attachmentSnapshots: function (id) { var r = smById(id); return r ? attachmentSnapshots(r) : null; },
    stateVocabulary: function () { return SM_ORDER.slice(); },
    invalidateForExecution: invalidateForExecution,
    invalidateForPlanRevision: invalidateForPlanRevision,
    topologyOf: function (scheduleId) {
      var arr = P().buildSchedules, i;
      for (i = 0; i < arr.length; i++) if (arr[i].schedule_id === scheduleId) return arr[i].topology_snapshot || null;
      return null;
    },
    restore: restoreFixture,
    fixture: function () { return JSON.parse(SEED_JSON); }
  };

  ['workflow','participant'].forEach(kind=>PM56_SCHED.registerMessageDestination(kind,{freeze:(d,s)=>PM56_COLLAB.freezeScheduledDestination(d,s),validate:(d,s,m)=>PM56_COLLAB.validateScheduledDestination(d,s,m),deliver:(m,d)=>PM56_COLLAB.deliverScheduledMessage(m,d)}));

  /* If the user just pressed "Reload page now", reopen the management dialog
     once EXT.ctx is live, so restart survival is visible without extra
     navigation. Bounded, self-terminating poll — never a recurring timer. */
  (function tryAutoReopen(triesLeft) {
    var marker = null;
    try { marker = sessionStorage.getItem('pm56-sched-reopen'); } catch (e) { }
    if (!marker) return;
    var ctx = EXT.ctx && EXT.ctx();
    if (!ctx) {
      if (triesLeft > 0) setTimeout(function () { tryAutoReopen(triesLeft - 1); }, 50);
      return;
    }
    try { sessionStorage.removeItem('pm56-sched-reopen'); } catch (e) { }
    ctx.openDialog({ type: 'sched-manage' });
  })(40);
})();
