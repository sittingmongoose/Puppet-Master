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
 * 3. THE HASH IS A DEMO STAND-IN, LABELLED AS ONE. `demoHash()` is a short
 *    deterministic string hash of "planId:version" — not a real content-address.
 *    It exists only so `exact_target_hash` is never blank and never random
 *    (same id+version always produces the same hash, so idempotency and
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
  var DAY_LABELS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
     1. TIMEZONE / DST ENGINE — real Intl math, verified against known 2026
     US/EU/AU transition dates before this file was written (see delivery
     report). Only runs when a schedule dialog opens or a demo control is
     pressed; never on a tick.
     ===================================================================== */
  var TZ_OPTIONS = [
    { id: 'America/Los_Angeles', label: 'Los Angeles · America/Los_Angeles' },
    { id: 'America/Denver', label: 'Denver · America/Denver' },
    { id: 'America/Chicago', label: 'Chicago · America/Chicago' },
    { id: 'America/New_York', label: 'New York · America/New_York' },
    { id: 'UTC', label: 'UTC' },
    { id: 'Europe/London', label: 'London · Europe/London' },
    { id: 'Europe/Berlin', label: 'Berlin · Europe/Berlin' },
    { id: 'Asia/Kolkata', label: 'Mumbai / Delhi · Asia/Kolkata (no DST)' },
    { id: 'Asia/Tokyo', label: 'Tokyo · Asia/Tokyo (no DST)' },
    { id: 'Australia/Sydney', label: 'Sydney · Australia/Sydney' }
  ];
  function tzLabel(id) {
    for (var i = 0; i < TZ_OPTIONS.length; i++) if (TZ_OPTIONS[i].id === id) return TZ_OPTIONS[i].label;
    return id;
  }

  var FMT_CACHE = {};
  function tzFormatter(iana) {
    if (!FMT_CACHE[iana]) {
      try {
        FMT_CACHE[iana] = new Intl.DateTimeFormat('en-US', { timeZone: iana, hour12: false, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch (e) { FMT_CACHE[iana] = null; }
    }
    return FMT_CACHE[iana];
  }
  function tzParts(iana, ms) {
    var f = tzFormatter(iana); if (!f) return null;
    try {
      var arr = f.formatToParts(new Date(ms)), o = {};
      for (var i = 0; i < arr.length; i++) o[arr[i].type] = arr[i].value;
      var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday];
      return { y: Number(o.year), mo: Number(o.month), d: Number(o.day), h: Number(o.hour === '24' ? '0' : o.hour), mi: Number(o.minute), s: Number(o.second), weekday: wd };
    } catch (e) { return null; }
  }
  function tzOffset(iana, ms) {
    var p = tzParts(iana, ms); if (!p) return null;
    var asUTC = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s);
    return Math.round((asUTC - ms) / 60000);
  }
  /* Local wall-clock (y, 1-based month, d, h, mi) in `iana` -> UTC ms. Two
     refinement passes so a wall time that sits right at a DST boundary still
     resolves against the correct side's offset. */
  function tzToUTC(iana, y, mo, d, h, mi) {
    var guess = Date.UTC(y, mo - 1, d, h, mi, 0);
    var off1 = tzOffset(iana, guess); if (off1 == null) return guess;
    var utc1 = guess - off1 * 60000;
    var off2 = tzOffset(iana, utc1);
    var utc2 = guess - off2 * 60000;
    var off3 = tzOffset(iana, utc2);
    return guess - off3 * 60000;
  }
  var TRANS_CACHE = {};
  function tzTransitions(iana, year) {
    var key = iana + ':' + year;
    if (TRANS_CACHE[key]) return TRANS_CACHE[key];
    var start = Date.UTC(year, 0, 1, 12, 0, 0);
    var prevOff = tzOffset(iana, start);
    var out = [];
    if (prevOff != null) {
      for (var day = 1; day <= 366; day++) {
        var probe = start + day * 86400000;
        if (new Date(probe).getUTCFullYear() > year) break;
        var off = tzOffset(iana, probe);
        if (off !== prevOff) {
          var lo = probe - 86400000, hi = probe;
          for (var i = 0; i < 30; i++) {
            var mid = Math.floor((lo + hi) / 2);
            var midOff = tzOffset(iana, mid);
            if (midOff === prevOff) lo = mid; else hi = mid;
          }
          out.push({ instant: hi, before: prevOff, after: off, kind: off > prevOff ? 'spring_forward' : 'fall_back' });
        }
        prevOff = off;
      }
    }
    TRANS_CACHE[key] = out;
    return out;
  }
  /* Next UTC instant matching `hh:mi` local wall time on one of `days`
     (0=Sun..6=Sat), strictly after `fromMs`. Scans nine candidate local dates,
     which always covers a full week even when today's slot already passed. */
  function nextOccurrenceUTC(iana, days, hh, mi, fromMs) {
    for (var add = 0; add <= 8; add++) {
      var probe = fromMs + add * 86400000;
      var parts = tzParts(iana, probe); if (!parts) return null;
      if (days.indexOf(parts.weekday) < 0) continue;
      var cand = tzToUTC(iana, parts.y, parts.mo, parts.d, hh, mi);
      if (cand > fromMs) return cand;
    }
    return null;
  }
  /* Plain-language DST summary for the CURRENT calendar year in `iana`. Never
     hides a transition: a no-DST zone says so; a zone with one says which
     local clock time jumps or repeats, computed for real rather than assumed
     from a US calendar. */
  /* `checkpoints` = [{label:'start', hh, mi}, ...] — usually the window's own
     start and pause wall-clock times. Each is tested against the transition's
     actual affected minute-of-day span (computed from the real before/after
     local parts, not assumed), so "does MY 2:00 AM pause sit inside tonight's
     gap" is an answer this function actually computes rather than guesses. */
  function describeDst(iana, checkpoints, activeDays) {
    var year = new Date().getFullYear();
    var trans = tzTransitions(iana, year);
    if (!trans.length) {
      return ['This timezone has not observed a daylight-saving change in ' + year + '. A window declared at a local wall-clock time never shifts against UTC here.'];
    }
    checkpoints = checkpoints || [];
    var out = [];
    for (var i = 0; i < trans.length; i++) {
      var t = trans[i];
      var beforeP = tzParts(iana, t.instant - 1000);
      var afterP = tzParts(iana, t.instant + 1000);
      if (!beforeP || !afterP) continue;
      var beforeLocal = to12h(pad2(beforeP.h) + ':' + pad2(beforeP.mi));
      var afterLocal = to12h(pad2(afterP.h) + ':' + pad2(afterP.mi));
      var beforeMins = beforeP.h * 60 + beforeP.mi, afterMins = afterP.h * 60 + afterP.mi;
      var wdName = DAY_LABELS_FULL[afterP.weekday];
      var dateLabel = wdName + ' ' + afterP.mo + '/' + afterP.d + '/' + afterP.y;
      var onActiveDay = activeDays && activeDays.indexOf(afterP.weekday) >= 0;
      var hits = [];
      for (var c = 0; c < checkpoints.length; c++) {
        var cp = checkpoints[c], mins = cp.hh * 60 + cp.mi;
        var inSpan = t.kind === 'spring_forward' ? (mins > beforeMins && mins < afterMins) : (mins >= afterMins && mins <= beforeMins);
        if (inSpan) hits.push(cp.label);
      }
      var line;
      if (t.kind === 'spring_forward') {
        line = 'Spring-forward: on ' + dateLabel + ', local clocks jump from ' + beforeLocal + ' to ' + afterLocal + '.';
        line += hits.length
          ? ' The ' + hits.join(' and ') + ' time falls inside that skipped span, so it resolves to the first valid local instant after the gap (' + afterLocal + '), per preserve_local_wall_clock.'
          : ' Neither this window’s start nor pause time falls inside the skipped span, so neither shifts that night.';
      } else {
        line = 'Fall-back: on ' + dateLabel + ', local clocks repeat from ' + beforeLocal + ' back to ' + afterLocal + ' once.';
        line += hits.length
          ? ' The ' + hits.join(' and ') + ' time falls inside that repeated hour; the idempotency key on (schedule, target, occurrence_start) fires it once, on the first pass, and suppresses the second.'
          : ' Neither this window’s start nor pause time falls inside the repeated hour, so idempotency for this window is unaffected that night.';
      }
      line += onActiveDay
        ? ' This date is one of the schedule’s active days, so it is a transition night this window actually observes.'
        : ' This date is not one of the schedule’s active days, so this window does not open that night either way.';
      out.push(line);
    }
    return out;
  }

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
  var ui = { msgDraft: null, editingMsgId: null, buildDraft: null, buildDraftPlanId: null, buildDraftVersion: null, manageTab: 'messages' };

  var STORE_KEY = 'pm56-scheduling.v1';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { } }
  };

  function seedFixture() {
    var t0 = '2026-09-03T02:00:00Z';
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
      scheduledMessages: [
        {
          scheduled_dispatch_id: 'sm-nightly-digest',
          project_id: 'pm', thread_id: 'query',
          destination_ref: null,
          text: 'Status check: has the write-amplification measurement for idx_events_tenant_created landed yet? If not, ping Schema Reviewer directly.',
          attachment_refs: [],
          requested_runtime: { modelId: 'sonnet46', modelName: 'Claude Sonnet 4.6', provider: 'Anthropic', account: 'Work · anthropic-work' },
          scheduled_at_utc: '2026-09-04T03:00:00Z', timezone: 'America/Chicago', local_wall_time: '22:00',
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
          attachment_refs: [{ name: 'benchmark.csv', kind: 'file', demo: true }],
          requested_runtime: { modelId: 'opus5', modelName: 'Claude Opus 5', provider: 'Anthropic', account: 'Work · anthropic-work' },
          scheduled_at_utc: '2026-09-03T04:30:00Z', timezone: 'America/Chicago', local_wall_time: '23:30',
          missed_policy: 'next_available', grace_seconds: 1800,
          state: 'held', expected_thread_currentness: 21, revision: 1,
          idempotencyKey: 'sm-route-held',
          heldReason: 'Recorded destination "Crew · Query Performance" is no longer resolvable (the crew run ended). Holding the dispatch rather than substituting a different destination.',
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
          exact_target_version: 5, exact_target_hash: demoHash('ap-index:5'),
          schedule_kind: 'recurring_window',
          timezone: 'America/Chicago', local_start: '22:00', local_pause: '02:00',
          days_of_week: [1, 2, 3, 4, 5],
          wind_down_seconds: 600, missed_policy: 'hold', auto_resume_next_window: true,
          state: 'active', revision: 1, invalidated_reason: null,
          pendingVersion: null, pendingHash: null,
          runPhase: 'idle', demoClockIso: t0, lastOccurrenceStart: null, occurrencesFired: [],
          log: [{ at: t0, text: 'Schedule created: recurring window 10:00 PM–2:00 AM America/Chicago, Mon–Fri, 10 min wind-down, auto-resume next window.' }],
          createdAt: t0, updatedAt: t0
        },
        {
          schedule_id: 'bld-auth-nightly',
          project_id: 'pm', target_kind: 'assistant_plan_run', target_id: 'ap-auth',
          exact_target_version: 2, exact_target_hash: demoHash('ap-auth:2'),
          schedule_kind: 'one_time',
          timezone: 'America/Chicago', local_start: '01:00', local_pause: null,
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
    S.scheduledMessages.forEach(function (m) { if (!m.idempotencyKey) m.idempotencyKey = m.scheduled_dispatch_id; });
    S.buildSchedules.forEach(function (b) {
      if (!Array.isArray(b.occurrencesFired)) b.occurrencesFired = [];
      if (!b.runPhase) b.runPhase = 'idle';
      if (!b.demoClockIso) b.demoClockIso = nowIso();
      if (!b.log) b.log = [];
    });
  })();

  function P() { return RT.scheduling; }
  function persistNow() {
    try {
      var out = JSON.parse(JSON.stringify(P()));
      out.lastSavedAt = nowIso();
      P().lastSavedAt = out.lastSavedAt;
      store.set(STORE_KEY, JSON.stringify(out));
    } catch (err) { console.info('PM56 scheduling: not persisted this tick', err); }
  }
  function restoreFixture() {
    RT.scheduling = JSON.parse(SEED_JSON);
    store.del(STORE_KEY);
    ui.msgDraft = null; ui.buildDraft = null; ui.editingMsgId = null; ui.manageTab = 'messages';
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
    logEvent('runtime.quota_resume_attempted', 'precedence', null, 'Manual Stop cleared by explicit user action at epoch ' + S.stopEpoch + '. Nothing automatic could have done this.');
  }

  /* =====================================================================
     4. SHARED ELIGIBILITY PREDICATE — SQR-006. One function, three kinds,
     used before every scheduled message dispatch, build-schedule window
     admission, and quota auto-resume attempt. Returns the exact failed
     clause so a refusal is always actionable, never silent.
     ===================================================================== */
  function evaluateEligibility(kind, rec, epochAtDecision) {
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
    if (kind === 'message') {
      if (rec.state === 'cancelled') return { ok: false, clause: 'schedule_not_found', detail: 'This scheduled message was cancelled and is retained only for audit.' };
      if (rec.state === 'dispatched') return { ok: false, clause: 'dispatch_already_started', detail: 'Already dispatched under idempotency key "' + rec.idempotencyKey + '"; the original result is returned rather than sending again.' };
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
      if (rec.state === 'cancelled') return { ok: false, clause: 'schedule_not_found', detail: 'This build schedule was cancelled.' };
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

  /* =====================================================================
     5. SCHEDULED MESSAGES — SQR-002. Freeze, revalidate, dispatch or hold.
     ===================================================================== */
  function defaultMsgDraft(ctx) {
    var tid = ctx.state.selectedThread;
    var buf = (RT.composer && RT.composer.bufferFor) ? RT.composer.bufferFor(tid) : null;
    var soon = new Date(Date.now() + 2 * 3600000);
    return {
      threadId: tid,
      text: (buf && buf.text) ? buf.text : '',
      attachments: (buf && buf.attachments) ? buf.attachments.slice() : [],
      destination: (RT.composer && RT.composer.destination) ? RT.composer.destination : null,
      modelId: ctx.state.model,
      date: soon.getFullYear() + '-' + pad2(soon.getMonth() + 1) + '-' + pad2(soon.getDate()),
      time: pad2(soon.getHours()) + ':' + pad2(soon.getMinutes()),
      timezone: 'America/Chicago', missed: 'hold', grace: 30
    };
  }
  function loadMessageForEdit(rec) {
    return {
      threadId: rec.thread_id, text: rec.text, attachments: [], destination: rec.destination_ref,
      modelId: (rec.requested_runtime && rec.requested_runtime.modelId) || 'sonnet46',
      date: rec.scheduled_at_utc ? rec.scheduled_at_utc.slice(0, 10) : '', time: rec.local_wall_time || '22:00',
      timezone: rec.timezone || 'America/Chicago', missed: rec.missed_policy || 'hold',
      grace: rec.grace_seconds ? Math.round(rec.grace_seconds / 60) : 30
    };
  }
  function commitMessage(ctx) {
    var d = ui.msgDraft; if (!d) return null;
    var text = String(d.text || '').trim();
    if (!text) return null;
    var th = threadByIdRaw(d.threadId);
    var dt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.date || '');
    var hhmm = parseHHMM(d.time);
    var scheduledMs = dt ? tzToUTC(d.timezone, Number(dt[1]), Number(dt[2]), Number(dt[3]), hhmm.h, hhmm.m) : Date.now();
    var id = ctx.uid('sm');
    var graceMinutes = clamp(d.grace, 1, 1440);
    var rec = {
      scheduled_dispatch_id: id, project_id: 'pm', thread_id: d.threadId,
      destination_ref: d.destination ? { kind: d.destination.kind, label: d.destination.label, detail: d.destination.detail, unresolvable: false } : null,
      text: text,
      attachment_refs: (d.attachments || []).map(function (a) { return { name: attachmentLabel(a), kind: a.kind || 'file', demo: !!a.demo }; }),
      requested_runtime: (function () { var m = modelById(d.modelId); return m ? { modelId: m.id, modelName: m.name, provider: m.provider, account: m.account } : null; })(),
      scheduled_at_utc: new Date(scheduledMs).toISOString(), timezone: d.timezone, local_wall_time: d.time,
      missed_policy: d.missed, grace_seconds: Math.round(graceMinutes) * 60,
      state: 'scheduled', expected_thread_currentness: th ? th.messages.length : 0, revision: 1,
      idempotencyKey: id, heldReason: null, dispatchedMessageId: null, dispatchedAt: null,
      createdAt: nowIso(), updatedAt: nowIso()
    };
    P().scheduledMessages.unshift(rec);
    logEvent('scheduled_dispatch.created', id, null, 'Scheduled for ' + to12h(d.time) + ' ' + tzLabel(d.timezone) + ' on ' + d.date + '.');
    persistNow();
    return rec;
  }
  function cancelMessage(id) {
    var rec = findMessage(id); if (!rec || rec.state === 'dispatched') return false;
    rec.state = 'cancelled'; rec.updatedAt = nowIso();
    logEvent('scheduled_dispatch.cancelled', id, null, 'Cancelled by the user. The snapshot is retained for audit and will never dispatch.');
    persistNow();
    return true;
  }
  function dispatchMessage(ctx, id) {
    var rec = findMessage(id); if (!rec) return null;
    if (rec.state === 'dispatched') {
      logEvent('scheduled_dispatch.dispatched', id, null, 'Duplicate fire suppressed by idempotency key "' + rec.idempotencyKey + '"; original result returned unchanged.');
      persistNow();
      return { duplicate: true, rec: rec };
    }
    var epoch = P().stopEpoch;
    var elig = evaluateEligibility('message', rec, epoch);
    if (!elig.ok) {
      rec.state = 'held'; rec.heldReason = elig.detail; rec.updatedAt = nowIso();
      logEvent('scheduled_dispatch.held', id, elig.clause, elig.detail);
      persistNow();
      return { held: true, rec: rec, reason: elig.detail };
    }
    var th = threadByIdRaw(rec.thread_id) || ctx.thread;
    var msg = { id: ctx.uid('sched-sent'), role: 'user', type: 'text', body: rec.text, time: nowIso(), viaSchedule: true, scheduledDispatchId: id };
    ctx.appendMessage(msg, th);
    rec.state = 'dispatched'; rec.dispatchedMessageId = msg.id; rec.dispatchedAt = nowIso(); rec.updatedAt = rec.dispatchedAt;
    logEvent('scheduled_dispatch.dispatched', id, null, 'Delivered the exact frozen text, attachments and destination into ' + (th ? th.title : rec.thread_id) + '.');
    persistNow();
    return { dispatched: true, rec: rec, thread: th };
  }

  /* =====================================================================
     6. BUILD SCHEDULES (Build At…) — SQR-003 / SQR-004. Exact-version bind,
     revision invalidation, recurring windows with wind-down, idempotent
     occurrence admission.
     ===================================================================== */
  function defaultBuildDraft(planId, version) {
    return {
      planId: planId, version: version, kind: 'recurring_window',
      date: '', time: '22:00', startTime: '22:00', pauseTime: '02:00',
      timezone: 'America/Chicago', days: [1, 2, 3, 4, 5],
      windDown: 10, autoResumeNext: true, missed: 'hold'
    };
  }
  function commitBuild(ctx) {
    var d = ui.buildDraft; if (!d) return null;
    var hash = demoHash(d.planId + ':' + d.version);
    var id = ctx.uid('bld');
    var oneTime = d.kind === 'one_time';
    var scheduledUtc = null;
    if (oneTime) {
      var dt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.date || '');
      var hhmm = parseHHMM(d.time);
      var ms = dt ? tzToUTC(d.timezone, Number(dt[1]), Number(dt[2]), Number(dt[3]), hhmm.h, hhmm.m) : Date.now();
      scheduledUtc = new Date(ms).toISOString();
    }
    var rec = {
      schedule_id: id, project_id: 'pm', target_kind: 'assistant_plan_run', target_id: d.planId,
      exact_target_version: d.version, exact_target_hash: hash,
      schedule_kind: d.kind,
      timezone: d.timezone,
      local_start: oneTime ? d.time : d.startTime,
      local_pause: oneTime ? null : d.pauseTime,
      days_of_week: oneTime ? [] : d.days.slice(),
      wind_down_seconds: Math.round(clamp(d.windDown, 0, 180)) * 60,
      missed_policy: d.missed, auto_resume_next_window: !!d.autoResumeNext,
      state: 'active', revision: 1, invalidated_reason: null, pendingVersion: null, pendingHash: null,
      runPhase: 'idle', demoClockIso: nowIso(), lastOccurrenceStart: null, occurrencesFired: [],
      scheduled_at_utc: scheduledUtc,
      log: [{ at: nowIso(), text: 'Schedule created: ' + (oneTime ? ('one-time build at ' + to12h(d.time) + ' ' + tzLabel(d.timezone)) : ('recurring window ' + to12h(d.startTime) + '–' + to12h(d.pauseTime) + ' ' + tzLabel(d.timezone) + ', ' + daysSummary(d.days))) + '.' }],
      createdAt: nowIso(), updatedAt: nowIso()
    };
    P().buildSchedules.unshift(rec);
    logEvent('execution_window.created', id, null, 'Bound to ' + d.planId + ' V' + d.version + ' (hash ' + hash + ').');
    persistNow();
    return rec;
  }
  function cancelBuild(id) {
    var rec = findBuild(id); if (!rec || rec.state === 'completed') return false;
    rec.state = 'cancelled'; rec.updatedAt = nowIso();
    logBuildLine(rec, 'Cancelled by the user. Any already-admitted work continues under its own owner — cancelling a window is not a Stop.');
    logEvent('execution_window.updated', id, null, 'Cancelled by the user.');
    persistNow();
    return true;
  }
  function simulateRevision(id) {
    var rec = findBuild(id); if (!rec || rec.state === 'invalidated' || rec.state === 'cancelled') return null;
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
  function rebindBuild(id) {
    var rec = findBuild(id); if (!rec || rec.state !== 'invalidated') return null;
    if (rec.pendingVersion != null) rec.exact_target_version = rec.pendingVersion;
    if (rec.pendingHash) rec.exact_target_hash = rec.pendingHash;
    rec.pendingVersion = null; rec.pendingHash = null;
    rec.state = 'active'; rec.invalidated_reason = null; rec.revision += 1;
    rec.occurrencesFired = []; rec.runPhase = 'idle';
    rec.updatedAt = nowIso();
    logBuildLine(rec, 'Rebound to V' + rec.exact_target_version + ' (hash ' + rec.exact_target_hash + ') by explicit user action. It will not silently advance to a future revision again.');
    logEvent('execution_window.updated', id, null, 'Explicit rebind after invalidation.');
    persistNow();
    return rec;
  }
  function computeNextOccurrence(rec, fromMs) {
    if (rec.schedule_kind === 'one_time') return null;
    var hhmm = parseHHMM(rec.local_start);
    return nextOccurrenceUTC(rec.timezone, rec.days_of_week, hhmm.h, hhmm.m, fromMs);
  }
  function idempotencyKey(rec) {
    return rec.schedule_id + '/' + rec.target_id + '/' + rec.exact_target_hash + '/' + (rec.lastOccurrenceStart || '—');
  }
  function advanceWindow(id) {
    var rec = findBuild(id); if (!rec) return { refused: true, detail: 'Schedule not found.' };
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
  var MSG_STATE_LABEL = { scheduled: 'Scheduled', held: 'Held', dispatched: 'Dispatched', cancelled: 'Cancelled', failed: 'Failed', expired: 'Expired' };
  var MSG_STATE_TONE = { scheduled: 'active', held: 'attention', dispatched: 'done', cancelled: 'idle', failed: 'blocked', expired: 'idle' };
  var BLD_STATE_LABEL = { active: 'Active', paused: 'Paused', cancelled: 'Cancelled', completed: 'Completed', invalidated: 'Needs update' };
  var BLD_STATE_TONE = { active: 'active', paused: 'attention', cancelled: 'idle', completed: 'done', invalidated: 'blocked' };
  var PHASE_LABEL = { idle: 'Idle · window closed', admitted: 'Admitted · running', winding_down: 'Winding down', paused_safe: 'Paused at safe checkpoint' };
  function chip(label, tone) { return '<span class="sched-chip sched-tone-' + esc(tone) + '">' + esc(label) + '</span>'; }

  function renderMessageRow(ctx, m) {
    var label = MSG_STATE_LABEL[m.state] || m.state, tone = MSG_STATE_TONE[m.state] || 'idle';
    var actionable = m.state === 'scheduled' || m.state === 'held';
    var buttons = '';
    if (actionable) {
      buttons += '<button class="soft-button" data-action="sched-dispatch-message" data-id="' + esc(m.scheduled_dispatch_id) + '">' + ctx.icon('play', 12) + ' Dispatch now</button>';
      buttons += '<button class="text-button" data-action="sched-edit-message" data-id="' + esc(m.scheduled_dispatch_id) + '">Edit</button>';
      buttons += '<button class="text-button danger" data-action="sched-cancel-message" data-id="' + esc(m.scheduled_dispatch_id) + '">Cancel</button>';
    } else if (m.state === 'dispatched') {
      buttons += '<button class="text-button" data-action="sched-dispatch-message" data-id="' + esc(m.scheduled_dispatch_id) + '">Fire duplicate (idempotency test)</button>';
    }
    return '<div class="sched-row" data-k="sched-msg-' + esc(m.scheduled_dispatch_id) + '">' +
      '<div class="sched-row-head">' + chip(label, tone) +
      '<span class="sched-row-title">' + esc(to12h(m.local_wall_time)) + ' ' + esc(tzLabel(m.timezone)) + ' · ' + esc(fmtDay(m.scheduled_at_utc)) + '</span>' +
      '<span class="spacer"></span><span class="sched-idem" title="Idempotency key">' + esc(m.idempotencyKey) + '</span>' +
      '</div>' +
      '<p class="sched-row-text">' + esc(m.text) + '</p>' +
      (m.heldReason && m.state === 'held' ? '<p class="sched-reason">' + esc(m.heldReason) + '</p>' : '') +
      (m.dispatchedMessageId ? '<p class="sched-reason positive">Delivered as message ' + esc(m.dispatchedMessageId) + ' at ' + esc(fmtClock(m.dispatchedAt)) + '.</p>' : '') +
      (buttons ? '<div class="sched-row-actions">' + buttons + '</div>' : '') +
      '</div>';
  }

  function renderBuildRow(ctx, b) {
    var label = BLD_STATE_LABEL[b.state] || b.state, tone = BLD_STATE_TONE[b.state] || 'idle';
    var when = b.schedule_kind === 'one_time' ? ('One-time · ' + to12h(b.local_start) + ' ' + tzLabel(b.timezone))
      : (to12h(b.local_start) + '–' + to12h(b.local_pause) + ' ' + tzLabel(b.timezone) + ' · ' + daysSummary(b.days_of_week));
    var buttons = '';
    if (b.state === 'invalidated') {
      buttons += '<button class="primary-button" data-action="sched-rebind-build" data-id="' + esc(b.schedule_id) + '">Rebind to V' + esc(b.pendingVersion) + '</button>';
      buttons += '<button class="text-button danger" data-action="sched-cancel-build" data-id="' + esc(b.schedule_id) + '">Cancel</button>';
    } else if (b.state === 'active') {
      buttons += '<button class="soft-button" data-action="sched-advance-window" data-id="' + esc(b.schedule_id) + '">' + ctx.icon('step', 12) + ' Advance window</button>';
      if (b.lastOccurrenceStart) buttons += '<button class="text-button" data-action="sched-fire-duplicate" data-id="' + esc(b.schedule_id) + '">Fire duplicate</button>';
      buttons += '<button class="text-button" data-action="sched-simulate-revision" data-id="' + esc(b.schedule_id) + '">Simulate Plan revision</button>';
      if (b.schedule_kind === 'recurring_window') {
        buttons += '<button class="text-button" data-action="sched-jump-transition" data-id="' + esc(b.schedule_id) + '" data-which="spring_forward">Jump to spring-forward</button>';
        buttons += '<button class="text-button" data-action="sched-jump-transition" data-id="' + esc(b.schedule_id) + '" data-which="fall_back">Jump to fall-back</button>';
      }
      buttons += '<button class="text-button danger" data-action="sched-cancel-build" data-id="' + esc(b.schedule_id) + '">Cancel</button>';
    }
    var logLines = (b.log || []).slice(0, 4).map(function (l) {
      return '<div class="sched-log-row"><span class="sched-log-when">' + esc(fmtClock(l.at)) + '</span><span>' + esc(l.text) + '</span></div>';
    }).join('');
    return '<div class="sched-row" data-k="sched-bld-' + esc(b.schedule_id) + '">' +
      '<div class="sched-row-head">' + chip(label, tone) +
      '<span class="sched-row-title">' + esc(b.target_id) + ' · V' + esc(b.exact_target_version) + ' · ' + esc(when) + '</span>' +
      '<span class="spacer"></span><span class="sched-idem" title="Idempotency key">' + esc(idempotencyKey(b)) + '</span>' +
      '</div>' +
      (b.state === 'active' ? '<p class="sched-phase">Phase: ' + esc(PHASE_LABEL[b.runPhase] || b.runPhase) + (b.lastOccurrenceStart ? (' · last occurrence ' + esc(fmtClock(b.lastOccurrenceStart)) + ' ' + esc(fmtDay(b.lastOccurrenceStart))) : '') + '</p>' : '') +
      (b.invalidated_reason ? '<p class="sched-reason">' + esc(b.invalidated_reason) + '</p>' : '') +
      (buttons ? '<div class="sched-row-actions">' + buttons + '</div>' : '') +
      (logLines ? '<div class="sched-log">' + logLines + '</div>' : '') +
      '</div>';
  }

  function renderMessageDialog(ctx) {
    var d = ui.msgDraft || (ui.msgDraft = defaultMsgDraft(ctx));
    var th = threadByIdRaw(d.threadId);
    var destLabel = d.destination ? (d.destination.label + (d.destination.detail ? (' · ' + d.destination.detail) : '')) : ('Assistant · ' + (th ? th.title : d.threadId));
    var attachRows = (d.attachments || []).length ? d.attachments.map(function (a) { return '<li>' + esc(attachmentLabel(a)) + '</li>'; }).join('') : '<li class="sched-empty">No attachments in the composer right now.</li>';
    var modelOpts = (D.models || []).map(function (m) { return '<option value="' + esc(m.id) + '"' + (m.id === d.modelId ? ' selected' : '') + '>' + esc(m.name) + ' · ' + esc(m.account) + '</option>'; }).join('');
    var tzOpts = TZ_OPTIONS.map(function (t) { return '<option value="' + esc(t.id) + '"' + (t.id === d.timezone ? ' selected' : '') + '>' + esc(t.label) + '</option>'; }).join('');
    var text = String(d.text || '');
    var over = text.length > 8000;
    var editing = ui.editingMsgId ? findMessage(ui.editingMsgId) : null;
    var mine = P().scheduledMessages.filter(function (m) { return m.thread_id === d.threadId; });
    var list = mine.length ? mine.map(function (m) { return renderMessageRow(ctx, m); }).join('') : '<p class="sched-empty">No scheduled messages for this thread yet.</p>';

    return '<section class="dialog sched-dialog sched-dialog--message" style="width:min(640px,calc(100vw - 20px))" role="dialog" aria-modal="true" aria-label="Schedule Message">' +
      '<div class="drawer-head"><span class="event-icon">' + ctx.icon('history', 13) + '</span>' +
      '<strong>' + (editing ? 'Update scheduled message' : 'Schedule Message') + '</strong><span class="spacer"></span>' +
      '<button class="icon-button" data-action="sched-close-dialog" aria-label="Close">' + ctx.icon('close', 13) + '</button></div>' +
      '<div class="dialog-body">' +
      '<p class="sched-honesty">Freezes the exact destination, text, attachments, model/account and time. Revalidated right before dispatch — never silently sent to a different destination, model or account.</p>' +
      '<div class="sched-field"><label>Destination</label><div class="sched-static">' + esc(destLabel) + '</div></div>' +
      '<div class="sched-field"><label>Message text (frozen at Schedule)</label>' +
      '<textarea class="sched-text" data-sched-input="msg-text" rows="4" placeholder="What should be sent">' + esc(text) + '</textarea>' +
      '<span class="sched-count' + (over ? ' over' : '') + '">' + text.length + ' / 8000</span></div>' +
      '<div class="sched-field"><label>Attachments (frozen at Schedule)</label><ul class="sched-attach-list">' + attachRows + '</ul></div>' +
      '<div class="sched-field-grid">' +
      '<div class="sched-field"><label>Date</label><input type="date" data-sched-input="msg-date" value="' + esc(d.date) + '"></div>' +
      '<div class="sched-field"><label>Time</label><input type="time" data-sched-input="msg-time" value="' + esc(d.time) + '"></div>' +
      '<div class="sched-field"><label>Timezone</label><select data-sched-input="msg-tz">' + tzOpts + '</select></div>' +
      '<div class="sched-field"><label>Model / account</label><select data-sched-input="msg-model">' + modelOpts + '</select></div>' +
      '<div class="sched-field"><label>If missed</label><select data-sched-input="msg-missed">' +
      '<option value="hold"' + (d.missed === 'hold' ? ' selected' : '') + '>Hold until I act</option>' +
      '<option value="next_available"' + (d.missed === 'next_available' ? ' selected' : '') + '>Send at next opportunity</option>' +
      '<option value="cancel_after_grace"' + (d.missed === 'cancel_after_grace' ? ' selected' : '') + '>Cancel after grace</option></select></div>' +
      '<div class="sched-field"><label>Grace (minutes)</label><input type="number" min="1" max="1440" data-sched-input="msg-grace" value="' + esc(d.grace) + '"' + (d.missed === 'cancel_after_grace' ? '' : ' disabled') + '></div>' +
      '</div>' +
      '<div class="plan-actions">' +
      (editing ? '<button class="text-button" data-action="sched-cancel-edit-message">Cancel edit</button>' : '') +
      '<button class="primary-button" data-action="sched-create-message"' + (!text.trim() || over ? ' disabled' : '') + '>' + (editing ? 'Save schedule' : 'Schedule') + '</button>' +
      '</div>' +
      '<h3 class="sched-subhead">Scheduled for this thread</h3><div class="sched-list">' + list + '</div>' +
      '</div></section>';
  }

  function renderQuotaHint() {
    var q = RT.quota;
    if (!q || !q.waiting) return '<p class="sched-hint">Provider Usage currently available.</p>';
    return '<p class="sched-hint attention">Provider Usage is exhausted right now (reset ' + esc(q.resetAt || 'unknown') + ' · ' + esc(q.resetSource) + '). A window opening while usage is unavailable holds rather than dispatching.</p>';
  }

  function renderBuildDialog(ctx) {
    var d = ctx.state.dialog;
    var planId = d.planId, version = d.version;
    var draft = ui.buildDraft;
    if (!draft || draft.planId !== planId || draft.version !== version) draft = ui.buildDraft = defaultBuildDraft(planId, version);
    var hash = demoHash(planId + ':' + version);
    var oneTime = draft.kind === 'one_time';
    var tzOpts = TZ_OPTIONS.map(function (t) { return '<option value="' + esc(t.id) + '"' + (t.id === draft.timezone ? ' selected' : '') + '>' + esc(t.label) + '</option>'; }).join('');
    var dayChips = DAY_LABELS.map(function (lbl, i) {
      var on = draft.days.indexOf(i) >= 0;
      return '<label class="sched-day-chip' + (on ? ' on' : '') + '"><input type="checkbox" data-action="sched-toggle-day" data-day="' + i + '"' + (on ? ' checked' : '') + '><span>' + lbl + '</span></label>';
    }).join('');
    var dstCheckpoints = [];
    if (draft.startTime) { var sh = parseHHMM(draft.startTime); dstCheckpoints.push({ label: 'start', hh: sh.h, mi: sh.m }); }
    if (draft.pauseTime) { var ph = parseHHMM(draft.pauseTime); dstCheckpoints.push({ label: 'pause', hh: ph.h, mi: ph.m }); }
    var dstLines = describeDst(draft.timezone, dstCheckpoints, draft.days).map(function (l) { return '<p class="sched-dst-line">' + esc(l) + '</p>'; }).join('');
    var existing = buildsForTarget(planId);
    var existingList = existing.length ? existing.map(function (b) { return renderBuildRow(ctx, b); }).join('') : '<p class="sched-empty">No existing schedule for this Plan yet.</p>';

    return '<section class="dialog sched-dialog sched-dialog--build" style="width:min(700px,calc(100vw - 20px))" role="dialog" aria-modal="true" aria-label="Build At">' +
      '<div class="drawer-head"><span class="event-icon">' + ctx.icon('document', 13) + '</span>' +
      '<strong>Build At…</strong><span class="meta-pill">' + esc(planId) + ' · V' + esc(version) + ' · hash ' + esc(hash) + '</span><span class="spacer"></span>' +
      '<button class="icon-button" data-action="sched-close-dialog" aria-label="Close">' + ctx.icon('close', 13) + '</button></div>' +
      '<div class="dialog-body">' +
      '<p class="sched-honesty">Binds this exact version and hash, never “the current Plan”. If ' + esc(planId) + ' is revised after this, the schedule is invalidated with a reason and offers rebinding — it will not silently build the newer version.</p>' +
      '<div class="sched-field"><label>Schedule kind</label><div class="sched-radio-row">' +
      '<label><input type="radio" name="sched-build-kind" data-action="sched-set-build-kind" data-value="one_time"' + (oneTime ? ' checked' : '') + '> One-time start</label>' +
      '<label><input type="radio" name="sched-build-kind" data-action="sched-set-build-kind" data-value="recurring_window"' + (!oneTime ? ' checked' : '') + '> Recurring window</label>' +
      '</div></div>' +
      (oneTime ?
        '<div class="sched-field-grid">' +
        '<div class="sched-field"><label>Date</label><input type="date" data-sched-input="build-date" value="' + esc(draft.date) + '"></div>' +
        '<div class="sched-field"><label>Start time</label><input type="time" data-sched-input="build-time" value="' + esc(draft.time) + '"></div>' +
        '<div class="sched-field"><label>Timezone</label><select data-sched-input="build-tz">' + tzOpts + '</select></div>' +
        '</div>'
        :
        '<div class="sched-field-grid">' +
        '<div class="sched-field"><label>Start time (local)</label><input type="time" data-sched-input="build-start" value="' + esc(draft.startTime) + '"></div>' +
        '<div class="sched-field"><label>Pause time (local)</label><input type="time" data-sched-input="build-pause" value="' + esc(draft.pauseTime) + '"></div>' +
        '<div class="sched-field"><label>Timezone</label><select data-sched-input="build-tz">' + tzOpts + '</select></div>' +
        '<div class="sched-field"><label>Wind-down (minutes)</label><input type="number" min="0" max="180" data-sched-input="build-wind" value="' + esc(draft.windDown) + '"></div>' +
        '</div>' +
        '<div class="sched-field"><label>Days</label><div class="sched-days">' + dayChips + '</div><span class="sched-hint">' + esc(daysSummary(draft.days)) + '</span></div>' +
        '<label class="sched-check-row"><input type="checkbox" data-action="sched-toggle-autoresume"' + (draft.autoResumeNext ? ' checked' : '') + '> Auto-resume next window</label>' +
        '<div class="sched-dst" data-k="sched-dst">' + dstLines + '</div>'
      ) +
      '<div class="sched-field"><label>If a window is missed</label><select data-sched-input="build-missed">' +
      '<option value="hold"' + (draft.missed === 'hold' ? ' selected' : '') + '>Hold</option>' +
      '<option value="next_available"' + (draft.missed === 'next_available' ? ' selected' : '') + '>Next available</option>' +
      '<option value="cancel_after_grace"' + (draft.missed === 'cancel_after_grace' ? ' selected' : '') + '>Cancel after grace</option></select></div>' +
      renderQuotaHint() +
      '<div class="plan-actions"><button class="primary-button" data-action="sched-create-build" data-plan-id="' + esc(planId) + '" data-plan-version="' + esc(version) + '">Create schedule</button></div>' +
      '<h3 class="sched-subhead">Existing schedules for ' + esc(planId) + '</h3><div class="sched-list">' + existingList + '</div>' +
      '</div></section>';
  }

  function renderPrecedenceSection() {
    var S = P();
    return '<p class="sched-honesty">Manual Stop, Pause or Cancel always outranks a schedule, a quota reset, or a Goal/Plan/Crew continuation. Latching increments a stop epoch; a decision computed against an older epoch is discarded rather than delivered, and nothing automatic can clear the latch.</p>' +
      '<div class="sched-precedence" data-k="sched-precedence">' +
      '<div class="metric-card"><label>Stop epoch</label><strong>' + S.stopEpoch + '</strong></div>' +
      '<div class="metric-card"><label>Latched</label><strong>' + (S.stopped ? 'Yes' : 'No') + '</strong></div>' +
      '</div>' +
      (S.stopped ? '<p class="sched-reason">' + esc(S.stopReason || 'Manual Stop') + ' — latched at ' + esc(fmtClock(S.stopAt)) + '.</p>' : '') +
      '<div class="plan-actions">' +
      (S.stopped
        ? '<button class="primary-button" data-action="sched-clear-stop">Explicit resume (clears the latch)</button>'
        : '<button class="soft-button danger" data-action="sched-simulate-stop">Simulate manual Stop</button>') +
      '<button class="text-button" data-action="sched-race-demo">Race demo: decide, then Stop, then try to deliver</button>' +
      '</div>' +
      '<p class="sched-hint">The race demo captures a decision at the current epoch, latches a stop, then attempts delivery under that older decision — proving it is discarded, not delivered.</p>';
  }

  function renderQuotaSection() {
    var q = RT.quota;
    var consent = P().quotaConsents[0];
    var mirror = q ?
      ('<div class="sched-precedence">' +
        '<div class="metric-card"><label>Waiting</label><strong>' + (q.waiting ? 'Yes' : 'No') + '</strong></div>' +
        '<div class="metric-card"><label>Reset</label><strong>' + esc(q.resetAt || 'unknown') + '</strong></div>' +
        '<div class="metric-card"><label>Truth</label><strong>' + esc(q.resetSource) + '</strong></div>' +
        '<div class="metric-card"><label>Auto-resume checked</label><strong>' + (q.resumeAutomatically ? 'Yes' : 'No') + '</strong></div>' +
        '</div>')
      : '<p class="sched-empty">composer-state.js has not initialised RT.quota yet.</p>';
    var consentBlock = consent ? '<p class="sched-hint">QuotaResumeConsent is scoped to one run, provider and account — never a global default. This run: <b>' + esc(consent.run_id) + '</b> · ' + esc(consent.provider_id) + ' · ' + esc(consent.account_id) + '.</p>' : '';
    return '<p class="sched-honesty">This mirrors the quota wait strip owned by composer-state.js below the composer — the checkbox lives there, not here. This section revalidates the same shared eligibility predicate and attempts the resume that checkbox opts into.</p>' +
      mirror + consentBlock +
      '<div class="plan-actions">' +
      '<button class="soft-button" data-action="sched-attempt-resume">Attempt auto-resume now</button>' +
      '<button class="text-button" data-action="sched-simulate-quota-reset">Simulate: provider window reopens</button>' +
      '</div>';
  }

  function renderEventLog() {
    var events = P().events;
    if (!events.length) return '<p class="sched-empty">No events yet.</p>';
    return '<div class="sched-event-log">' + events.map(function (e) {
      return '<div class="sched-event-row' + (e.clause ? ' refused' : '') + '">' +
        '<span class="sched-log-when">' + esc(fmtClock(e.at)) + ' ' + esc(fmtDay(e.at)) + '</span>' +
        '<span class="sched-event-type">' + esc(e.type) + (e.clause ? (' · ' + esc(e.clause)) : '') + '</span>' +
        '<p>' + esc(e.detail) + '</p></div>';
    }).join('') + '</div>';
  }

  function renderPersistenceFooter(ctx) {
    var S = P();
    return '<div class="sched-persist-foot">' +
      '<p class="sched-honesty">No client-side timer is authoritative here — every occurrence above is recomputed from the stored IANA timezone and local wall time, exactly as a restart would. These records persist to this browser’s local storage only so the concept survives a reload; the product’s real timers are server-owned.</p>' +
      '<div class="sched-persist-row"><span>' + (S.lastSavedAt ? ('Last saved locally ' + esc(fmtClock(S.lastSavedAt)) + ' ' + esc(fmtDay(S.lastSavedAt))) : 'Not yet saved') + '</span>' +
      '<button class="soft-button" data-action="sched-reload-now">' + ctx.icon('reset', 12) + ' Reload page now</button></div></div>';
  }

  function renderManageDialog(ctx) {
    var S = P();
    var tab = ui.manageTab || 'messages';
    var tabs = [['messages', 'Messages'], ['builds', 'Build windows'], ['quota', 'Quota resume'], ['precedence', 'Precedence'], ['events', 'Event log']];
    var tabRow = tabs.map(function (t) { return '<button class="text-button sched-tab' + (tab === t[0] ? ' active' : '') + '" data-action="sched-manage-tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('');
    var body = '';
    if (tab === 'messages') body = S.scheduledMessages.length ? S.scheduledMessages.map(function (m) { return renderMessageRow(ctx, m); }).join('') : '<p class="sched-empty">No scheduled messages.</p>';
    else if (tab === 'builds') body = S.buildSchedules.length ? S.buildSchedules.map(function (b) { return renderBuildRow(ctx, b); }).join('') : '<p class="sched-empty">No build schedules.</p>';
    else if (tab === 'quota') body = renderQuotaSection();
    else if (tab === 'precedence') body = renderPrecedenceSection();
    else if (tab === 'events') body = renderEventLog();

    return '<section class="dialog sched-dialog sched-dialog--manage" style="width:min(760px,calc(100vw - 20px));height:min(640px,calc(100vh - 20px))" role="dialog" aria-modal="true" aria-label="Scheduled and Automations">' +
      '<div class="drawer-head"><span class="event-icon">' + ctx.icon('refresh', 13) + '</span><strong>Scheduled &amp; Automations</strong>' +
      (S.stopped ? '<span class="meta-pill sched-pill-stop">Manual Stop latched</span>' : '') + '<span class="spacer"></span>' +
      '<button class="icon-button" data-action="sched-close-dialog" aria-label="Close">' + ctx.icon('close', 13) + '</button></div>' +
      '<div class="sched-tabs">' + tabRow + '</div>' +
      '<div class="dialog-body">' + body + '</div>' +
      renderPersistenceFooter(ctx) +
      '</section>';
  }

  EXT.slot('wandRows', function (ctx) {
    var S = P();
    var upcoming = S.scheduledMessages.filter(function (m) { return m.state === 'scheduled'; }).length;
    var held = S.scheduledMessages.filter(function (m) { return m.state === 'held'; }).length;
    var sub = (upcoming || held) ? (upcoming + ' upcoming' + (held ? (' · ' + held + ' held') : '')) : 'Freeze this message and a time';
    var needsUpdate = S.buildSchedules.some(function (b) { return b.state === 'invalidated'; });
    var stopBadge = S.stopped ? 'Stop latched' : (needsUpdate ? 'Needs update' : 'All clear');
    return '<button class="menu-item" data-action="sched-open-message" data-k="sched-wand-msg">' +
      '<span class="menu-icon">' + ctx.icon('history', 13) + '</span>' +
      '<span class="menu-copy"><strong>Schedule Message</strong><span>' + esc(sub) + '</span></span>' +
      (upcoming ? ('<span class="shortcut">' + upcoming + '</span>') : '') + '</button>' +
      '<button class="menu-item" data-action="sched-open-manage" data-k="sched-wand-manage">' +
      '<span class="menu-icon">' + ctx.icon('refresh', 13) + '</span>' +
      '<span class="menu-copy"><strong>Scheduled &amp; Automations…</strong><span>Windows, quota resume, manual Stop precedence</span></span>' +
      '<span class="shortcut">' + esc(stopBadge) + '</span></button>';
  });

  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog; if (!d) return '';
    if (d.type === 'sched-message') return renderMessageDialog(ctx);
    if (d.type === 'sched-build-at') return renderBuildDialog(ctx);
    if (d.type === 'sched-manage') return renderManageDialog(ctx);
    return '';
  });

  EXT.slot('messageMeta', function (ctx) {
    var m = ctx.message;
    if (!m || !m.viaSchedule) return '';
    return '<span class="sched-meta-tag" title="Sent by a scheduled dispatch">' + ctx.icon('history', 10) + ' Scheduled</span>';
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
    held:     { label:'Held',      tone:'warn' },
    sent:     { label:'Sent',      tone:'done' },
    canceled: { label:'Canceled',  tone:'idle' },
    failed:   { label:'Failed',    tone:'warn' },
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
      can_edit:['scheduled','held','failed'].indexOf(rec.state)>=0,
      can_cancel:['scheduled','held','failed'].indexOf(rec.state)>=0,
      currentness_hash:demoHash(rec.scheduled_dispatch_id+':'+rec.revision+':'+rec.state)
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
        availability:a.availability || 'available' };
    });
  }

  function renderMessageCard(ctx, rec){
    var pr=messageProjection(rec);
    var st=SM_STATE[rec.state] || { label:rec.state, tone:'idle' };
    var why = pr.held_reason || pr.failure_reason || pr.cancel_reason || pr.expired_reason;
    var snaps=attachmentSnapshots(rec);
    return '<article class="event-card sched-card sched-card-'+esc(rec.state)+'" data-k="sched-card-'+esc(rec.scheduled_dispatch_id)+'"'+
      ' data-schedule-id="'+esc(rec.scheduled_dispatch_id)+'" data-schedule-state="'+esc(rec.state)+'">'+
      '<div class="sched-card-head">'+
        '<span class="sched-kind">'+ctx.icon('clock',13)+'Scheduled message</span>'+
        '<span class="sched-state sched-state-'+esc(st.tone)+'" data-state="'+esc(rec.state)+'">'+esc(st.label)+'</span>'+
      '</div>'+
      '<p class="sched-card-preview">'+esc(pr.text_preview)+(String(rec.text||'').length>120?'…':'')+'</p>'+
      '<div class="sched-card-facts">'+
        '<span>'+esc(rec.local_wall_time)+' '+esc(rec.timezone)+'</span>'+
        '<span>'+esc(rec.scheduled_at_utc)+'</span>'+
        '<span>'+esc(rec.destination_ref ? rec.destination_ref.label : 'This thread')+'</span>'+
        '<span>'+esc((rec.requested_runtime&&rec.requested_runtime.modelName)||'Default')+'</span>'+
        '<span>'+pr.attachment_count+' attachment'+(pr.attachment_count===1?'':'s')+'</span>'+
      '</div>'+
      (why ? '<p class="sched-card-why">'+esc(why)+'</p>' : '')+
      (pr.dispatched_message_id
        ? '<p class="sched-card-link">Sent at '+esc(pr.dispatched_at)+' — <button type="button" class="text-button" data-action="sched-open-sent" data-id="'+esc(rec.scheduled_dispatch_id)+'">open the dispatched message</button> (<code>'+esc(pr.dispatched_message_id)+'</code>)</p>'
        : '')+
      (snaps.length
        ? '<ul class="sched-card-snaps">'+snaps.map(function(s){
            return '<li data-availability="'+esc(s.availability)+'"><code>'+esc(s.attachment_id)+(s.artifact_version?'@'+esc(s.artifact_version):'')+'</code>'+
                   '<span>'+esc(s.content_hash||'no hash')+'</span><em>'+esc(s.availability)+'</em></li>'; }).join('')+'</ul>'
        : '')+
      '<div class="sched-card-foot">'+
        '<button type="button" class="soft-button" data-action="sched-card-details" data-id="'+esc(rec.scheduled_dispatch_id)+'">Details</button>'+
        '<button type="button" class="soft-button" data-action="sched-card-edit" data-id="'+esc(rec.scheduled_dispatch_id)+'"'+(pr.can_edit?'':' disabled title="Only a Scheduled, Held or Failed schedule can be edited; a Sent one is immutable."')+'>Edit</button>'+
        '<button type="button" class="soft-button danger" data-action="sched-card-cancel" data-id="'+esc(rec.scheduled_dispatch_id)+'"'+(pr.can_cancel?'':' disabled title="Nothing to cancel in this state."')+'>Cancel</button>'+
      '</div>'+
    '</article>';
  }

  EXT.slot('transcriptMessage', function (ctx) {
    var m=ctx.m; if(!m || m.type!=='sched-message') return '';
    var rec=smById(m.scheduleId);
    if(!rec) return '<div class="event-card danger"><div class="event-copy"><strong>Schedule missing</strong>'+
      '<p>'+esc(m.scheduleId)+' was referenced but no longer exists in this session.</p></div></div>';
    return renderMessageCard(ctx, rec);
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

  /* `sched-open-manage` is already registered further down in section 9's ACT
     map -- registering it again here chained a second handler and tripped
     PM56_EXT.collisions, which the harness asserts is empty. The card's
     Details button reuses that existing action instead. */
  /* A DISTINCT action id from the wand's `sched-open-manage`. Sharing the id
     put a second element carrying it in the transcript, ahead of the wand row
     in DOM order, and any harness selecting by action alone then clicked the
     card instead of the menu item. */
  EXT.action('sched-card-details', function(ctx){ ctx.openDialog({ type:'sched-manage' }); return true; });
  EXT.action('sched-open-sent', function(ctx,btn){
    var rec=smById(btn.dataset.id); if(!rec) return true;
    ctx.toast('Dispatched message', 'The schedule links to '+rec.dispatchedMessageId+', inserted at the real dispatch time '+rec.dispatchedAt+
      '. Transcript order is never backdated to when the schedule was created, and replay returns this same message id.');
    return true;
  });
  EXT.action('sched-card-edit', function(ctx,btn){
    var rec=smById(btn.dataset.id); if(!rec) return true;
    var pr=messageProjection(rec);
    if(!pr.can_edit){
      ctx.toast('Refused','A '+pr.state_label+' schedule cannot be edited. Editing uses expected revision and currentness and fails closed.');
      return true;
    }
    ui.editingMsgId=rec.scheduled_dispatch_id;
    ctx.openDialog({ type:'sched-manage' });
    return true;
  });
  EXT.action('sched-card-cancel', function(ctx,btn){
    var rec=smById(btn.dataset.id); if(!rec) return true;
    var pr=messageProjection(rec);
    if(!pr.can_cancel){ ctx.toast('Refused','Nothing to cancel in the '+pr.state_label+' state.'); return true; }
    var before=P().scheduledMessages.filter(function(x){ return x.thread_id===rec.thread_id && x.state==='scheduled'; }).length;
    rec.state='canceled'; rec.revision++; rec.updatedAt=new Date().toISOString();
    rec.cancelReason='Cancelled from the thread card. The immutable audit record is preserved.';
    persistNow();
    var after=P().scheduledMessages.filter(function(x){ return x.thread_id===rec.thread_id && x.state==='scheduled'; }).length;
    ctx.renderApp();
    ctx.toast('Schedule cancelled','Exactly one schedule changed: '+before+' → '+after+
      ' still Scheduled in this thread. The cancelled record stays in history.');
    return true;
  });

  /* PSCHED-010 / SMSG-016 / PGOAL-008: association-scoped invalidation. Only
     the schedules and quota consent tied to THAT execution are invalidated;
     a thread's unrelated scheduled user messages are never cleared. */
  function invalidateForExecution(assoc){
    var out={ schedules:0, consents:0, untouched:0 }, i;
    var builds=P().buildSchedules;
    for(i=0;i<builds.length;i++){
      var b=builds[i];
      if(b.target_id===assoc.plan_id && b.state!=='invalidated'){
        b.state='invalidated';
        b.invalidReason='The bound execution was cancelled at continuation epoch '+assoc.epoch+'.';
        out.schedules++;
      }
    }
    var consents=P().quotaConsents||[];
    for(i=0;i<consents.length;i++){
      var c=consents[i];
      if((c.association_id===assoc.plan_id || c.target_id===assoc.plan_id) && c.state!=='revoked'){
        c.state='revoked'; c.revokedReason='Bound execution cancelled.'; out.consents++;
      }
    }
    out.untouched=P().scheduledMessages.filter(function(m){ return m.state==='scheduled'||m.state==='held'; }).length;
    persistNow();
    return out;
  }

  /* =====================================================================
     9. ACTIONS + FIELD LISTENERS
     ===================================================================== */
  function reRender(ctx) { ctx.renderApp(); ctx.renderOverlays && ctx.renderOverlays(); }

  /* Contract for plans.js (integrator-owned Plan card): register an action
     named exactly `sched-open-build-at` reading data-plan-id/data-plan-version,
     AND expose window.PM56_SCHED.openBuildAt(ctx, planId, version) so the card
     can call either the action or the function directly. */
  function openBuildAt(ctx, planId, version) {
    ctx = ctx || (EXT.ctx && EXT.ctx());
    if (!ctx) return false;
    planId = String(planId);
    version = Number(version);
    ui.buildDraft = defaultBuildDraft(planId, version);
    ctx.closeMenu && ctx.closeMenu();
    ctx.openDialog({ type: 'sched-build-at', planId: planId, version: version });
    return true;
  }

  var ACT = {};
  ACT['sched-open-message'] = function (ctx) {
    ui.msgDraft = defaultMsgDraft(ctx); ui.editingMsgId = null;
    ctx.closeMenu && ctx.closeMenu();
    ctx.openDialog({ type: 'sched-message' });
  };
  ACT['sched-open-manage'] = function (ctx) {
    ctx.closeMenu && ctx.closeMenu();
    ctx.openDialog({ type: 'sched-manage' });
  };
  ACT['sched-open-build-at'] = function (ctx, btn) {
    openBuildAt(ctx, btn.dataset.planId, btn.dataset.planVersion);
  };
  ACT['sched-close-dialog'] = function (ctx) {
    ui.msgDraft = null; ui.editingMsgId = null; ui.buildDraft = null;
    ctx.closeDialog();
  };
  ACT['sched-create-message'] = function (ctx) {
    if (ui.editingMsgId) {
      var rec = findMessage(ui.editingMsgId);
      if (!rec || rec.state === 'dispatched') { ctx.toast('Cannot update', 'This schedule already dispatched; updates are refused once dispatch has started.'); return; }
      var d = ui.msgDraft, text = String(d.text || '').trim();
      if (!text) return;
      var dt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.date || ''), hhmm = parseHHMM(d.time);
      var ms = dt ? tzToUTC(d.timezone, Number(dt[1]), Number(dt[2]), Number(dt[3]), hhmm.h, hhmm.m) : Date.now();
      rec.text = text; rec.scheduled_at_utc = new Date(ms).toISOString(); rec.timezone = d.timezone; rec.local_wall_time = d.time;
      rec.missed_policy = d.missed; rec.grace_seconds = Math.round(clamp(d.grace, 1, 1440)) * 60;
      var m2 = modelById(d.modelId); if (m2) rec.requested_runtime = { modelId: m2.id, modelName: m2.name, provider: m2.provider, account: m2.account };
      rec.revision += 1; rec.state = 'scheduled'; rec.heldReason = null; rec.updatedAt = nowIso();
      logEvent('scheduled_dispatch.updated', rec.scheduled_dispatch_id, null, 'Rebound under revision ' + rec.revision + '.');
      persistNow();
      ui.editingMsgId = null;
      reRender(ctx);
      ctx.toast('Schedule updated', 'Revision ' + rec.revision + ' recorded.');
      return;
    }
    var rec2 = commitMessage(ctx);
    if (!rec2) { ctx.toast('Nothing scheduled', 'Message text is required.'); return; }
    ui.msgDraft = defaultMsgDraft(ctx);
    reRender(ctx);
    ctx.toast('Message scheduled', 'Frozen for ' + to12h(rec2.local_wall_time) + ' ' + tzLabel(rec2.timezone) + '. It revalidates its destination and route immediately before dispatch.');
  };
  ACT['sched-cancel-message'] = function (ctx, btn) {
    var ok = cancelMessage(btn.dataset.id);
    reRender(ctx);
    ctx.toast(ok ? 'Schedule cancelled' : 'Could not cancel', ok ? 'Retained for audit; it will never dispatch.' : 'It may have already dispatched.');
  };
  ACT['sched-dispatch-message'] = function (ctx, btn) {
    var res = dispatchMessage(ctx, btn.dataset.id);
    if (!res) return;
    reRender(ctx);
    if (res.duplicate) ctx.toast('Duplicate suppressed', 'Idempotency key already resolved; nothing sent twice.');
    else if (res.held) ctx.toast('Dispatch held', res.reason);
    else if (res.dispatched) ctx.toast('Scheduled message sent', 'Delivered the exact text frozen at schedule time into ' + (res.thread ? res.thread.title : 'the thread') + '.');
  };
  ACT['sched-edit-message'] = function (ctx, btn) {
    var rec = findMessage(btn.dataset.id); if (!rec) return;
    ui.editingMsgId = rec.scheduled_dispatch_id;
    ui.msgDraft = loadMessageForEdit(rec);
    reRender(ctx);
  };
  ACT['sched-cancel-edit-message'] = function (ctx) {
    ui.editingMsgId = null; ui.msgDraft = defaultMsgDraft(ctx);
    reRender(ctx);
  };
  ACT['sched-create-build'] = function (ctx, btn) {
    if (!ui.buildDraft) ui.buildDraft = defaultBuildDraft(btn.dataset.planId, Number(btn.dataset.planVersion));
    var rec = commitBuild(ctx);
    if (!rec) return;
    reRender(ctx);
    ctx.toast('Build schedule created', rec.schedule_kind === 'one_time'
      ? ('One-time at ' + to12h(rec.local_start) + ' ' + tzLabel(rec.timezone) + '.')
      : ('Recurring ' + to12h(rec.local_start) + '–' + to12h(rec.local_pause) + ' ' + tzLabel(rec.timezone) + ', ' + daysSummary(rec.days_of_week) + '.'));
  };
  ACT['sched-cancel-build'] = function (ctx, btn) {
    var ok = cancelBuild(btn.dataset.id);
    reRender(ctx);
    ctx.toast(ok ? 'Schedule cancelled' : 'Could not cancel', ok ? 'Any already-admitted work continues under its own owner.' : 'It may have already completed.');
  };
  ACT['sched-rebind-build'] = function (ctx, btn) {
    var rec = rebindBuild(btn.dataset.id);
    reRender(ctx);
    if (rec) ctx.toast('Rebound', 'Now bound to V' + rec.exact_target_version + ' (hash ' + rec.exact_target_hash + ').');
  };
  ACT['sched-simulate-revision'] = function (ctx, btn) {
    var rec = simulateRevision(btn.dataset.id);
    reRender(ctx);
    if (rec) ctx.toast('Plan revised (simulated)', rec.invalidated_reason);
  };
  ACT['sched-advance-window'] = function (ctx, btn) {
    var res = advanceWindow(btn.dataset.id);
    reRender(ctx);
    if (res.refused) ctx.toast('Advance refused', res.detail);
    else if (res.duplicate) ctx.toast('Duplicate suppressed', res.detail);
  };
  ACT['sched-fire-duplicate'] = function (ctx, btn) {
    var rec = fireDuplicateOccurrence(btn.dataset.id);
    reRender(ctx);
    if (rec) ctx.toast('Duplicate suppressed', 'Idempotency key ' + idempotencyKey(rec) + ' already resolved for this occurrence.');
  };
  ACT['sched-jump-transition'] = function (ctx, btn) {
    var rec = jumpToTransition(btn.dataset.id, btn.dataset.which);
    reRender(ctx);
    if (rec) ctx.toast('Demo clock jumped', 'Press Advance window to walk into the ' + (btn.dataset.which === 'spring_forward' ? 'spring-forward' : 'fall-back') + ' occurrence.');
    else ctx.toast('No transition found', 'This timezone has no such transition this year.');
  };
  ACT['sched-set-build-kind'] = function (ctx, btn) {
    if (!ui.buildDraft) return;
    ui.buildDraft.kind = btn.dataset.value;
    reRender(ctx);
  };
  ACT['sched-toggle-day'] = function (ctx, btn) {
    if (!ui.buildDraft) return;
    var day = Number(btn.dataset.day), i = ui.buildDraft.days.indexOf(day);
    if (i >= 0) ui.buildDraft.days.splice(i, 1); else ui.buildDraft.days.push(day);
    reRender(ctx);
  };
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
    ctx.toast('Manual Stop latched', 'Every scheduled dispatch, window resume and quota auto-resume now refuses until you explicitly resume.');
  };
  ACT['sched-clear-stop'] = function (ctx) {
    clearStop();
    persistNow();
    reRender(ctx);
    ctx.toast('Stop cleared', 'You resumed explicitly. That is the only thing that clears a latched stop.');
  };
  ACT['sched-race-demo'] = function (ctx) {
    var epoch = P().stopEpoch;
    latchStop('Manual Stop, latched mid-flight by the race demo.');
    var elig = evaluateEligibility('message', { state: 'scheduled' }, epoch);
    persistNow();
    reRender(ctx);
    ctx.toast(elig.ok ? 'Unexpected: would have delivered' : 'Discarded, not delivered', elig.detail);
  };
  ACT['sched-attempt-resume'] = function (ctx) {
    var elig = attemptAutoResume();
    reRender(ctx);
    ctx.toast(elig.ok ? 'Resume eligible' : 'Resume refused', elig.detail);
  };
  ACT['sched-simulate-quota-reset'] = function (ctx) {
    var elig = simulateQuotaReset();
    reRender(ctx);
    ctx.toast(elig.ok ? 'Window reopened — resumed' : 'Window reopened, resume refused', elig.detail);
  };
  ACT['sched-reload-now'] = function () {
    try { sessionStorage.setItem('pm56-sched-reopen', '1'); } catch (e) { }
    location.reload();
  };
  Object.keys(ACT).forEach(function (name) { EXT.action(name, function (ctx, btn, ev) { ACT[name](ctx, btn, ev); return true; }); });

  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    var k = t.getAttribute('data-sched-input'); if (!k) return;
    var ctx = EXT.ctx && EXT.ctx(); if (!ctx) return;
    var md = ui.msgDraft, bd = ui.buildDraft;
    if (k === 'msg-text' && md) md.text = t.value;
    else if (k === 'msg-date' && md) md.date = t.value;
    else if (k === 'msg-time' && md) md.time = t.value;
    else if (k === 'msg-tz' && md) md.timezone = t.value;
    else if (k === 'msg-model' && md) md.modelId = t.value;
    else if (k === 'msg-missed' && md) md.missed = t.value;
    else if (k === 'msg-grace' && md) md.grace = clamp(t.value, 1, 1440);
    else if (k === 'build-date' && bd) bd.date = t.value;
    else if (k === 'build-time' && bd) bd.time = t.value;
    else if (k === 'build-start' && bd) bd.startTime = t.value;
    else if (k === 'build-pause' && bd) bd.pauseTime = t.value;
    else if (k === 'build-tz' && bd) bd.timezone = t.value;
    else if (k === 'build-wind' && bd) bd.windDown = clamp(t.value, 0, 180);
    else if (k === 'build-missed' && bd) bd.missed = t.value;
    else return;
    reRender(ctx);
  });

  /* =====================================================================
     10. RESET-ALL CHAIN + PUBLIC SURFACE + BOOT
     ===================================================================== */
  var prevReset = EXT._actions && EXT._actions['reset-all'];
  EXT.chainAction('reset-all', function (ctx, btn, ev) {
    restoreFixture();
    return prevReset ? prevReset(ctx, btn, ev) : false;
  });

  window.PM56_SCHED = {
    openBuildAt: openBuildAt,
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
    topologyOf: function (scheduleId) {
      var arr = P().buildSchedules, i;
      for (i = 0; i < arr.length; i++) if (arr[i].schedule_id === scheduleId) return arr[i].topology_snapshot || null;
      return null;
    },
    restore: restoreFixture,
    fixture: function () { return JSON.parse(SEED_JSON); }
  };

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
