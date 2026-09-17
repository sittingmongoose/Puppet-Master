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
  function tzToUTC(iana,y,mo,d,h,mi){const r=PM56_SCHEDULE_TIME.resolve(iana,{y,mo,d,h,mi});return r.ok?r.at:NaN;}
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
  function nextOccurrenceUTC(iana,days,hh,mi,fromMs){return PM56_SCHEDULE_TIME.next(iana,days,hh,mi,fromMs);}
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
  var ui = { msgDraft: null, editingMsgId: null, buildDraft: null, buildDraftPlanId: null, buildDraftVersion: null, manageTab: 'messages', managerFilters:{} };

  var STORE_KEY = 'pm56-scheduling.v1';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v);return true; } catch (e) { return false; } },
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
          timezone: 'America/Chicago', local_start: '23:30', local_pause: null,
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
          timezone: 'America/Chicago', local_start: '02:15', local_pause: null,
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
    ui.msgDraft=null;ui.buildDraft=null;ui.editingMsgId=null;ui.editingBuildId=null;ui.focusSchedule=null;ui.cardOpen={};ui.manageTab='messages';
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
      if(a.content_hash&&a.content_hash!==resolved.revision.content_key)return msgError('attachment_hash_changed');
      const snapshotCheck=window.PM56_ATTACHMENTS?.inspectScheduleSnapshot?.(ref);
      if(snapshotCheck&&!snapshotCheck.ok)return msgError(snapshotCheck.error,snapshotCheck.detail);
      if(a.folder_manifest_hash&&snapshotCheck?.manifest_sha256!==a.folder_manifest_hash)return msgError('folder_manifest_changed');
      out.push({id:a.id||ref.artifact_id,name:attachmentLabel(a),kind:a.kind||'file',artifact_id:ref.artifact_id,artifact_version:ref.artifact_version,content_hash:resolved.revision.content_key,folder_manifest_hash:a.folder_manifest_hash||null,snapshot_ref:copy(ref),availability:'available',state:'ready'});
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
  function messageTicket(id,atMs=Date.now()){
    const m=findMessage(id);return !m?msgError('schedule_not_found'):{ok:true,ticket:{...captureMessage(id),at:atMs,stop_epoch:P().stopEpoch,attempt_id:id+':r'+m.revision+':a'+((m.dispatch_attempts||[]).length+1)}};
  }
  function messageEligibility(m,ticket,publishedMessage){
    if(!Number.isFinite(ticket.at))return msgError('invalid_dispatch_time');
    const gate=evaluateEligibility('message',m,ticket.stop_epoch);if(!gate.ok)return msgError(gate.clause,gate.detail);
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
  function dispatchMessageAt(id,at,expected){const decision=expected?.attempt_id?{ok:true,ticket:expected}:messageTicket(id,at);return decision.ok?deliverMessage(decision.ticket):decision;}

  /* =====================================================================
     5. SCHEDULED MESSAGES — SQR-002. Freeze, revalidate, dispatch or hold.
     ===================================================================== */
  function defaultMsgDraft(ctx) {
    const tid=ctx.state.selectedThread,source=PM56_COMPOSER_STATE.captureForSchedule(ctx,tid),zone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
    const local=PM56_SCHEDULE_TIME.parts(zone,Date.now()+2*3600000);
    return {threadId:tid,text:source.buffer.text,attachments:copy(source.buffer.attachments),browser_context_refs:copy(source.buffer.browser_context_refs||[]),
      destination:copy(source.buffer.destination),workflow_config:source.buffer.workflow_config,held_request:source.buffer.held_request,
      sourceScope:scopeMessage(tid),sourceBuffer:source,requestKey:ctx.uid('schedule-request'),modelId:ctx.state.model,
      date:local.y+'-'+pad2(local.mo)+'-'+pad2(local.d),time:pad2(local.h)+':'+pad2(local.mi),timezone:zone,missed:'hold',grace:30};
  }
  function loadMessageForEdit(rec) {
    const local=PM56_SCHEDULE_TIME.parts(rec.timezone,Date.parse(rec.scheduled_at_utc));
    return {threadId:rec.thread_id,text:rec.text,attachments:copy(rec.attachment_refs||[]),destination:copy(rec.destination_ref),browser_context_refs:[],
      sourceScope:rec.scope_snapshot||scopeMessage(rec.thread_id),requestKey:EXT.ctx().uid('schedule-update'),expectedRevision:rec.revision,expectedCurrentness:msgCurrent(rec),
      modelId:rec.requested_runtime?.modelId,date:local.y+'-'+pad2(local.mo)+'-'+pad2(local.d),time:rec.local_wall_time,timezone:rec.timezone,missed:rec.missed_policy,grace:rec.grace_seconds/60};
  }
  function commitMessage(ctx) {
    const out=saveMessage(ctx,ui.msgDraft,ui.editingMsgId);
    if(!out.ok){if(ui.msgDraft)ui.msgDraft.error=out.detail||out.error;ctx.renderOverlays();return null;}
    return out.record;
  }
  function cancelMessage(id,expected) { return cancelMessageExact(id,expected||captureMessage(id)).ok; }
  function dispatchMessage(ctx,id) { const m=findMessage(id);if(!m)return null;
    const out=dispatchMessageAt(id,Date.now());return {...out,rec:m,thread:threadByIdRaw(m.thread_id),refused:!out.ok&&!out.held,reason:out.detail||out.error}; }

  function defaultBuildDraft(planId, version) {
    var plan=window.PM56_PLANS&&window.PM56_PLANS.get(planId);
    return {
      contentHash:plan?window.PM56_PLANS.hash(planId):null,
      expected:plan?window.PM56_PLANS.admissionSnapshot(planId):null,executionTopology:'agent',
      requestKey:EXT.ctx().uid('build-schedule-request'),planId: planId, version: version, kind: 'recurring_window',
      date: new Date(Date.now()+86400000).toISOString().slice(0,10), time: '22:00', startTime: '22:00', pauseTime: '02:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone||'America/New_York', days: [1, 2, 3, 4, 5],
      windDown: 10, autoResumeNext: true, missed: 'hold'
    };
  }
  function commitBuild(ctx) {
    var d = ui.buildDraft; if (!d) return null;
    if(!d.requestKey){d.error='Missing schedule request identity.';return null;}
    const requestBinding=PM56_ARTIFACTS.key({planId:d.planId,version:d.version,hash:d.contentHash,expected:d.expected,kind:d.kind,date:d.date,time:d.time,start:d.startTime,pause:d.pauseTime,timezone:d.timezone,days:d.days,wind:d.windDown,auto:d.autoResumeNext,missed:d.missed,topology:d.executionTopology,crew:d.crewDefinition||null,editing:ui.editingBuildId||null});
    const prior=P().buildRequests?.[d.requestKey];
    if(prior){if(prior.binding!==requestBinding){d.error='idempotency_conflict';return null;}return findBuild(prior.id);}
    if(ui.editingBuildId){const old=findBuild(ui.editingBuildId);if(!old||old.revision!==d.expectedRevision||buildCurrent(old)!==d.expectedCurrentness||old.state!=='active'){d.error='stale_schedule_revision';return null;}}
    if(!['one_time','recurring_window'].includes(d.kind)||!['hold','next_available','cancel_after_grace'].includes(d.missed)||typeof d.autoResumeNext!=='boolean'||!Number.isFinite(Number(d.windDown))||Number(d.windDown)<0||Number(d.windDown)>180){d.error='invalid_schedule_configuration';return null;}
    if(d.kind==='one_time'){const invalid=validateWall(d.date,d.time,d.timezone);if(invalid){d.error=invalid;return null;}}
    const badWindow=d.kind==='recurring_window'&&(!PM56_SCHEDULE_TIME.parse('2000-01-01',d.startTime)||!PM56_SCHEDULE_TIME.parse('2000-01-01',d.pauseTime)||d.startTime===d.pauseTime||!PM56_SCHEDULE_TIME.parts(d.timezone,Date.now())||!Array.isArray(d.days)||!d.days.length||d.days.some(x=>!Number.isInteger(x)||x<0||x>6));
    if(badWindow){d.error='Choose valid window times, weekdays and IANA timezone.';ctx.renderOverlays();return null;}
    if(ui.editingBuildId&&findBuild(ui.editingBuildId)?.dispatchReceipt){d.error='Dispatch already started; this frozen schedule cannot be edited.';ctx.renderOverlays();return null;}
    var plan=window.PM56_PLANS&&window.PM56_PLANS.get(d.planId);
    if(!plan||plan.status!=='ready'||plan.version!==d.version||window.PM56_PLANS.hash(d.planId)!==d.contentHash){
      d.error='Plan changed. Close this form and schedule the current version.';ctx.renderOverlays();return null;
    }
    const currentSnapshot=window.PM56_PLANS.admissionSnapshot(d.planId);
    if(d.expected&&JSON.stringify(d.expected)!==JSON.stringify(currentSnapshot)){d.error='Project, worktree, permissions or provider route changed. Reopen this form.';ctx.renderOverlays();return null;}
    if(!['agent','goal_driven','crew'].includes(d.executionTopology||'agent')){d.error='Unsupported execution topology.';return null;}
    if(d.executionTopology==='crew'){const v=window.PM56_COLLAB.validatePlanCrew(d.crewDefinition,d.planId,false);if(!v.ok){d.error=v.message||v.error;return null;}}
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
      topology_snapshot:{schema:'pm.schedule.plan_topology_snapshot.v1',execution_topology:d.executionTopology||'agent'},user_stop_epoch:P().stopEpoch,
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
      grace_seconds:1800,missed_policy: d.missed, auto_resume_next_window: !!d.autoResumeNext,
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
    if(!result.ok){d.error=result.error;ctx.renderOverlays();return null;}return result.record;
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
  function planSummary(planId){
    var rows=buildsForTarget(planId).filter(function(b){return b.binding_kind==='plan_content_v1';});
    if(!rows.length)return '';
    var b=rows[0],label=b.state==='invalidated'?'Schedule needs update':b.state==='canceled'?'Schedule canceled':b.dispatchReceipt?(window.PM56_PLANS.get(planId)?.status==='completed'?'Scheduled build completed':'Scheduled build started'):'Build scheduled';
    var suffix=b.state==='invalidated'?'V'+b.exact_target_version+' → V'+b.pendingVersion:'V'+b.exact_target_version+' · '+(b.schedule_kind==='recurring_window'?daysSummary(b.days_of_week)+' '+to12h(b.local_start)+'–'+to12h(b.local_pause)+' · '+b.timezone:whenLabel(b.scheduled_at_utc,b.timezone));
    const a=window.PM56_PLANS.attention(planId);if(a&&b.dispatchReceipt)label=a.line;
    return '<div class="plan-schedule-line" data-plan-schedule="'+esc(b.schedule_id)+'"><span><strong>'+label+'</strong><small>'+esc(suffix)+'</small></span><button class="text-button" data-action="sched-open-plan-record" data-id="'+esc(b.schedule_id)+'">'+(b.state==='invalidated'?'Review':'Details')+'</button></div>';
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
    const captured=epochAtDecision??b.user_stop_epoch??P().stopEpoch;
    const eligible=evaluateEligibility('build',b,captured);if(!eligible.ok)return fail(eligible.clause,eligible.detail);
    if(b.state!=='active')return fail('schedule_not_active');
    if(b.topology_snapshot?.execution_topology!==b.execution_topology)return fail('topology_snapshot_changed');
    if(b.binding_kind!=='plan_content_v1'||!['one_time','recurring_window'].includes(b.schedule_kind)||!['agent','goal_driven','crew'].includes(b.execution_topology))return fail('unsupported_demo_schedule');
    const due=b.schedule_kind==='one_time'?Date.parse(b.scheduled_at_utc):Date.parse(b.next_occurrence_at||b.createdAt);
    if(!Number.isFinite(atMs)||!Number.isFinite(due)||atMs<due)return fail('window_not_open');
    const calendar=buildWindow(b,atMs);
    if(b.schedule_kind==='recurring_window'&&(!calendar.ok||!calendar.open||calendar.phase==='winding_down')){b.held_reason='Outside an admissible execution window; no run was created.';persistNow();return fail('window_inactive',b.held_reason);}
    if(b.schedule_kind==='one_time'&&atMs-due>(b.grace_seconds||1800)*1000&&b.missed_policy!=='next_available'){
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
      if(!evaluateEligibility('build',b,captured).ok)TX.fail('stale_stop_epoch');
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
  function advanceWindow(id) {
    var rec = findBuild(id); if (!rec) return { refused: true, detail: 'Schedule not found.' };
    if(rec.binding_kind==='plan_content_v1'&&!rec.dispatchReceipt){
      var dispatched=dispatchBuildAt(id,Date.parse(rec.schedule_kind==='one_time'?rec.scheduled_at_utc:rec.next_occurrence_at),rec.revision,rec.user_stop_epoch);
      return {refused:!dispatched.ok,duplicate:!!dispatched.duplicate,detail:dispatched.detail||dispatched.clause||'Scheduled build started.'};
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
    if(rec.binding_kind==='plan_content_v1'){const out=dispatchBuildAt(id,Date.parse(rec.lastOccurrenceStart),rec.revision,rec.user_stop_epoch);return out.ok&&out.duplicate?rec:null;}
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
  var MSG_STATE_LABEL = { scheduled: 'Scheduled', held: 'Held', dispatched: 'Sent', sent:'Sent', cancelled: 'Canceled', canceled:'Canceled', failed: 'Failed', expired: 'Expired' };
  var MSG_STATE_TONE = { scheduled: 'active', held: 'attention', dispatched: 'done', sent:'done', cancelled: 'idle', canceled:'idle', failed: 'blocked', expired: 'idle' };
  var BLD_STATE_LABEL = { active: 'Active', paused: 'Paused', cancelled: 'Canceled', canceled:'Canceled', completed: 'Completed', invalidated: 'Needs update' };
  var BLD_STATE_TONE = { active: 'active', paused: 'attention', cancelled: 'idle', canceled:'idle', completed: 'done', invalidated: 'blocked' };
  var PHASE_LABEL = { completed:'Build completed', idle: 'Idle · window closed', admitted: 'Admitted · running', winding_down: 'Winding down', paused_safe: 'Paused at safe checkpoint' };
  function chip(label, tone) { return '<span class="sched-chip sched-tone-' + esc(tone) + '">' + esc(label) + '</span>'; }

  function zoneName(zone){ return String(zone||'UTC').split('/').pop().replace(/_/g,' '); }
  function whenLabel(iso,zone){
    if(!iso||!Number.isFinite(Date.parse(iso)))return 'Time not set';
    try{return new Intl.DateTimeFormat('en-US',{timeZone:zone||'UTC',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(iso));}catch(e){return iso;}
  }
  function destinationLabel(m){var t=threadByIdRaw(m.thread_id);return m.destination_ref?.label||t?.title||m.thread_id||'This thread';}
  function facts(rows){return '<dl class="sched-facts">'+rows.filter(r=>r[1]!=null&&r[1]!=='').map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('')+'</dl>';}
  function messageActions(ctx,m){const pr=messageProjection(m),id=esc(m.scheduled_dispatch_id),token=' data-revision="'+m.revision+'" data-currentness="'+esc(msgCurrent(m))+'"';
    return (pr.can_edit?'<button class="soft-button" data-action="sched-edit-message" data-id="'+id+'"'+token+'>Edit</button>':'')+
      (pr.can_cancel?'<button class="text-button danger" data-action="sched-card-cancel" data-id="'+id+'"'+token+'>Cancel</button>':'')+
      (pr.dispatched_message_id?'<button class="text-button" data-action="sched-open-sent" data-id="'+id+'">Open message</button>':'');
  }
  function attentionLabel(record){
    var reason=record.heldReason||record.failureReason||record.expiredReason||'';
    if(/attach|file.*missing|missing.*file/i.test(reason))return 'Attachment unavailable';
    if(/thread|destination|project|deleted|archived/i.test(reason))return 'Destination unavailable';
    if(/model|account|route|provider/i.test(reason))return 'Model or account unavailable';
    if(/expired|grace|missed/i.test(reason))return 'Scheduled time passed';
    return record.state==='failed'?'Delivery failed':record.state==='expired'?'Schedule expired':'Needs your attention';
  }
  function messageDetails(ctx,m){
    var attachments=attachmentSnapshots(m);
    return '<div class="sched-details-body"><div class="sched-full-message">'+esc(m.text)+'</div>'+facts([
      ['Issue',m.heldReason||m.failureReason||m.expiredReason],['Destination',destinationLabel(m)],['Model',m.requested_runtime?.modelName||'Default'],['Account',m.requested_runtime?.account],
      ['Timezone',m.timezone],['If missed',({hold:'Hold for you',next_available:'Send when available',cancel_after_grace:'Cancel after grace'})[m.missed_policy]],
      ['Grace',m.missed_policy==='cancel_after_grace'?Math.round(m.grace_seconds/60)+' min':null],['Revision',m.revision]
    ])+(attachments.length?'<div class="sched-attached">'+attachments.map(a=>'<span>'+ctx.icon('attach',12)+esc(a.filename||a.attachment_id)+' · '+esc(a.availability)+'</span>').join(''):'')+
      '<details class="sched-audit"><summary>Record & history</summary>'+facts([['Schedule ID',m.scheduled_dispatch_id],['UTC time',m.scheduled_at_utc],['Idempotency key',m.idempotencyKey],['Created',m.createdAt],['Updated',m.updatedAt]])+
      (attachments.length?'<pre>'+esc(JSON.stringify(attachments,null,2))+'</pre>':'')+'</details></div>';
  }
  function validateWall(date,time,zone){const r=PM56_SCHEDULE_TIME.resolve(zone,PM56_SCHEDULE_TIME.parse(date,time));return !r.ok?'Choose a valid date, time and IANA timezone.':r.at<=Date.now()?'Choose a time in the future.':'';}

  function renderMessageRow(ctx,m){
    var label=SM_STATE[m.state]?.label||MSG_STATE_LABEL[m.state]||m.state,tone=MSG_STATE_TONE[m.state]||'idle';
    var why=m.heldReason||m.failureReason||m.expiredReason;
    return '<article class="schedule-item" data-k="schedule-'+esc(m.scheduled_dispatch_id)+'" data-schedule-id="'+esc(m.scheduled_dispatch_id)+'">'+
      '<div class="schedule-item-head"><span class="schedule-item-icon">'+ctx.icon('history',17)+'</span><div class="schedule-item-copy"><strong>'+esc(String(m.text||'Untitled message'))+'</strong><span>'+esc(whenLabel(m.scheduled_at_utc,m.timezone)+' · '+m.timezone)+'</span></div>'+chip(label,tone)+'</div>'+
      '<div class="schedule-item-destination">'+ctx.icon('chat',12)+esc(destinationLabel(m))+'</div>'+
      (why&&['held','failed','expired'].includes(m.state)?'<div class="schedule-attention">'+ctx.icon('warning',13)+'<span>'+esc(attentionLabel(m))+'</span></div>':'')+
      '<div class="schedule-item-controls">'+messageActions(ctx,m)+'</div>'+
      '<details class="schedule-details" '+(ui.focusSchedule===m.scheduled_dispatch_id?'open':'')+'><summary>Details '+ctx.icon('down',11)+'</summary>'+messageDetails(ctx,m)+'</details></article>';
  }


  function renderBuildRow(ctx,b){
    var plan=window.PM56_PLANS?.get(b.target_id),id=esc(b.schedule_id),label=BLD_STATE_LABEL[b.state]||b.state;
    var one=b.schedule_kind==='one_time';
    var when=one?whenLabel(b.scheduled_at_utc,b.timezone):daysSummary(b.days_of_week)+' · '+to12h(b.local_start)+'–'+to12h(b.local_pause)+' · '+zoneName(b.timezone);
    var next= b.state==='active'?(one?Date.parse(b.scheduled_at_utc):computeNextOccurrence(b,b.clock_ms??Date.now())):null;
    var nextIso=typeof next==='number'?new Date(next).toISOString():next?.startMs?new Date(next.startMs).toISOString():null;
    return '<article class="schedule-item" data-k="build-window-'+id+'"><div class="schedule-item-head"><span class="schedule-item-icon">'+ctx.icon('document',17)+'</span><div class="schedule-item-copy"><strong>'+esc(plan?.title||b.target_id)+'</strong><span>V'+b.exact_target_version+' · '+esc(when)+'</span></div>'+chip(label,BLD_STATE_TONE[b.state]||'idle')+'</div>'+
      (b.state==='invalidated'?'<div class="schedule-attention">'+ctx.icon('warning',13)+'<span>Plan changed to V'+esc(b.pendingVersion)+'. Review before scheduling.</span></div>':'<div class="schedule-item-destination">'+esc(b.dispatchReceipt?(plan?.status==='completed'?'Build completed':'Build started'):(one&&b.runPhase==='idle'?'Waiting for scheduled time':PHASE_LABEL[b.runPhase]||b.runPhase||'Waiting'))+(nextIso&&!one?' · Next '+esc(whenLabel(nextIso,b.timezone)):'')+'</div>')+
      (b.held_reason?'<div class="schedule-attention">'+esc(b.held_reason)+'</div>':'')+'<div class="schedule-item-controls"><button class="soft-button" data-action="pd-info" data-id="'+esc(b.target_id)+'">Open plan</button>'+
      (b.state==='invalidated'?'<button class="soft-button" data-action="sched-rebind-build" data-id="'+id+'" data-version="'+esc(b.pendingVersion)+'" data-hash="'+esc(b.pendingHash)+'" data-revision="'+b.revision+'">Use V'+esc(b.pendingVersion)+'</button>':'')+
      (b.state==='active'&&!b.dispatchReceipt?'<button class="text-button" data-action="sched-edit-build" data-id="'+id+'">Edit window</button>':'')+
      (['active','paused','invalidated'].includes(b.state)?'<button class="text-button danger" data-action="sched-cancel-build" data-id="'+id+'" data-revision="'+b.revision+'" data-currentness="'+esc(buildCurrent(b))+'">Cancel</button>':'')+'</div>'+
      '<details class="schedule-details"><summary>Details '+ctx.icon('down',11)+'</summary><div class="sched-details-body">'+(b.binding_kind==='plan_content_v1'&&b.state==='active'?'<p class="schedule-caption">Local clock control only. This page does not run a background scheduling service.</p><button class="soft-button" data-action="sched-advance-window" data-id="'+id+'">Evaluate next local boundary</button>':'')+facts([
        ['Timezone',b.timezone],['Wind-down',b.wind_down_seconds/60+' min'],['Resume next window',b.auto_resume_next_window?'On':'Off'],['If missed',b.missed_policy],['Exact plan version','V'+b.exact_target_version],['Revision',b.revision]
      ])+'<details class="sched-audit"><summary>Record & history</summary>'+facts([['Schedule ID',b.schedule_id],['Bound hash (demo)',b.exact_target_hash],['Idempotency key',idempotencyKey(b)]])+
      (b.log||[]).map(l=>'<p><time>'+esc(fmtClock(l.at))+'</time> '+esc(l.text)+'</p>').join('')+'</details></div></details></article>';
  }


  function wallResolution(date,time,zone){const r=PM56_SCHEDULE_TIME.resolve(zone,PM56_SCHEDULE_TIME.parse(date,time));if(!r.ok)return '';return '<p class="b18-time-resolution">'+esc(r.kind==='gap_forward'?'Clock change: first valid local instant after the gap.':r.kind==='fold_first'?'Repeated local time: first occurrence only.':'Exact local time.')+' '+esc(new Date(r.at).toISOString())+' · '+esc(zone)+'</p>';}
  function renderMessageDialog(ctx){
    var d=ui.msgDraft||(ui.msgDraft=defaultMsgDraft(ctx)),editing=ui.editingMsgId,th=threadByIdRaw(d.threadId),text=String(d.text||'');
    var tzOpts=TZ_OPTIONS.map(t=>'<option value="'+esc(t.id)+'" '+(t.id===d.timezone?'selected':'')+'>'+esc(zoneName(t.id))+'</option>').join('');
    if(!TZ_OPTIONS.some(t=>t.id===d.timezone))tzOpts='<option selected value="'+esc(d.timezone)+'">'+esc(zoneName(d.timezone))+'</option>'+tzOpts;
    return '<section class="dialog sched-dialog sched-dialog--message" role="dialog" aria-modal="true" aria-label="Schedule Message"><div class="drawer-head">'+ctx.icon('history',16)+'<strong>'+(editing?'Edit scheduled message':'Schedule a message')+'</strong><span class="spacer"></span><button class="icon-button" data-action="sched-close-dialog" aria-label="Close">'+ctx.icon('close',14)+'</button></div>'+
      '<div class="dialog-body"><div class="sched-destination-tag">'+ctx.icon('chat',14)+esc(d.destination?.label||th?.title||'This thread')+'</div>'+
      '<label class="sched-field"><span>Message</span><textarea class="sched-text" data-sched-input="msg-text" rows="4" maxlength="8000" placeholder="What should be sent?">'+esc(text)+'</textarea></label>'+
      (d.attachments?.length?'<div class="sched-attached">'+d.attachments.map(a=>'<span>'+ctx.icon('attach',12)+esc(attachmentLabel(a))+'</span>').join('')+'</div>':'')+
      '<div class="schedule-when"><h3>Send on</h3><div class="sched-field-grid"><label class="sched-field"><span>Date</span><input type="date" data-sched-input="msg-date" value="'+esc(d.date)+'"></label><label class="sched-field"><span>Time</span><input type="time" data-sched-input="msg-time" value="'+esc(d.time)+'"></label><label class="sched-field schedule-zone"><span>Timezone</span><select data-sched-input="msg-tz">'+tzOpts+'</select></label></div></div>'+
      wallResolution(d.date,d.time,d.timezone)+'<label class="sched-field"><span>Model & account</span>'+window.PM56_PICKERS.modelButton('sched-pick-model','schedule-model',d.modelId)+'</label>'+
      '<details class="schedule-details"><summary>If the send time is missed '+ctx.icon('down',11)+'</summary><div class="sched-field-grid"><label class="sched-field"><span>Action</span><select data-sched-input="msg-missed">'+[['hold','Hold for me'],['next_available','Send when available'],['cancel_after_grace','Cancel after grace']].map(([v,l])=>'<option value="'+v+'" '+(d.missed===v?'selected':'')+'>'+l+'</option>').join('')+'</select></label>'+(d.missed==='cancel_after_grace'?'<label class="sched-field"><span>Grace · minutes</span><input type="number" min="1" max="1440" data-sched-input="msg-grace" value="'+d.grace+'"></label>':'')+'</div></details>'+
      '<div class="sched-form-error" role="alert">'+esc(d.error||'')+'</div></div><div class="schedule-form-foot"><button class="text-button" data-action="sched-open-manage">All schedules</button><span class="spacer"></span><button class="soft-button" data-action="sched-close-dialog">Cancel</button><button class="primary-button" data-action="sched-create-message" '+(!text.trim()||text.length>8000||ui.snapshotBusy?'disabled':'')+'>'+(ui.snapshotBusy?'Retaining selected bytes…':editing?'Save changes':'Schedule message')+'</button></div></section>';
  }

  function renderQuotaHint() {
    var q = RT.quota;
    if (!q || !q.waiting) return '<p class="sched-hint">Provider Usage currently available.</p>';
    return '<p class="sched-hint attention">Provider Usage is exhausted right now (reset ' + esc(q.resetAt || 'unknown') + ' · ' + esc(q.resetSource) + '). A window opening while usage is unavailable holds rather than dispatching.</p>';
  }


  function renderBuildDialog(ctx){
    var x=ctx.state.dialog,d=ui.buildDraft;if(!d||d.planId!==x.planId)d=ui.buildDraft=defaultBuildDraft(x.planId,x.version);
    var plan=window.PM56_PLANS?.get(d.planId),one=d.kind==='one_time';
    var zones=TZ_OPTIONS.map(t=>'<option value="'+esc(t.id)+'" '+(d.timezone===t.id?'selected':'')+'>'+esc(zoneName(t.id))+'</option>').join('');
    if(!TZ_OPTIONS.some(t=>t.id===d.timezone))zones='<option selected value="'+esc(d.timezone)+'">'+esc(zoneName(d.timezone))+'</option>'+zones;
    return '<section class="dialog sched-dialog sched-dialog--build" role="dialog" aria-modal="true" aria-label="Build At"><div class="drawer-head">'+ctx.icon('document',16)+'<strong>'+(ui.editingBuildId?'Edit build window':'Schedule a build')+'</strong><span class="spacer"></span><button class="icon-button" data-action="sched-close-dialog" aria-label="Close">'+ctx.icon('close',14)+'</button></div><div class="dialog-body">'+
      '<div class="schedule-plan-target"><strong>'+esc(plan?.title||d.planId)+'</strong><span>V'+esc(d.version)+' · Fixed version</span></div>'+
      (one?wallResolution(d.date,d.time,d.timezone):'')+'<label class="sched-field"><span>Execution</span><select data-sched-input="build-topology"><option value="agent" '+((d.executionTopology||'agent')==='agent'?'selected':'')+'>Build normally</option><option value="goal_driven" '+(d.executionTopology==='goal_driven'?'selected':'')+'>Build as Goal</option><option value="crew" '+(d.executionTopology==='crew'?'selected':'')+'>Build with Crew</option></select></label>'+(d.executionTopology==='goal_driven'?'<p class="schedule-caption">The Goal is created only when this exact build is admitted.</p>':'')+
      (d.executionTopology==='crew'?'<section class="schedule-crew-config"><button class="soft-button" data-action="sched-configure-crew">'+(d.crewDefinition?'Review frozen Crew':'Configure Crew')+'</button><p class="schedule-caption">'+(d.crewDefinition?esc(d.crewDefinition.name)+' · '+d.crewDefinition.participants.length+' participants · no run until dispatch':'Choose the roster before scheduling. No unattended modal opens at dispatch.')+'</p></section>':'')+
      '<div class="schedule-kind">'+[['one_time','Once'],['recurring_window','Recurring window']].map(([v,l])=>'<button class="soft-button '+(d.kind===v?'active':'')+'" data-action="sched-set-build-kind" data-value="'+v+'">'+l+'</button>').join('')+'</div>'+
      '<div class="sched-field-grid">'+(one?'<label class="sched-field"><span>Date</span><input type="date" data-sched-input="build-date" value="'+esc(d.date)+'"></label><label class="sched-field"><span>Start</span><input type="time" data-sched-input="build-time" value="'+esc(d.time)+'"></label>':'<label class="sched-field"><span>Start</span><input type="time" data-sched-input="build-start" value="'+esc(d.startTime)+'"></label><label class="sched-field"><span>Pause</span><input type="time" data-sched-input="build-pause" value="'+esc(d.pauseTime)+'"></label>')+
      '<label class="sched-field schedule-zone"><span>Timezone</span><select data-sched-input="build-tz">'+zones+'</select></label></div>'+
      (!one?'<div class="sched-days">'+DAY_LABELS.map((l,i)=>'<button class="sched-day-chip '+(d.days.includes(i)?'on':'')+'" aria-pressed="'+d.days.includes(i)+'" data-action="sched-toggle-day" data-day="'+i+'">'+l+'</button>').join('')+'</div><label class="sched-check-row"><input type="checkbox" data-action="sched-toggle-autoresume" '+(d.autoResumeNext?'checked':'')+'>Resume next window</label>':'')+
      '<details class="schedule-details"><summary>More options '+ctx.icon('down',11)+'</summary><div class="sched-field-grid">'+(!one?'<label class="sched-field"><span>Wind-down · minutes</span><input type="number" data-sched-input="build-wind" min="0" max="180" value="'+d.windDown+'"></label>':'')+
      '<label class="sched-field"><span>If missed</span><select data-sched-input="build-missed">'+[['hold','Hold'],['next_available','Next available'],['cancel_after_grace','Cancel after grace']].map(([v,l])=>'<option value="'+v+'" '+(d.missed===v?'selected':'')+'>'+l+'</option>').join('')+'</select></label></div><details class="sched-audit"><summary>Timezone rules</summary>'+describeDst(d.timezone,[],d.days).map(l=>'<p>'+esc(l)+'</p>').join('')+'</details></details>'+
      '<div class="sched-form-error" role="alert">'+esc(d.error||'')+'</div></div><div class="schedule-form-foot"><span class="schedule-caption">Plan revisions require review.</span><span class="spacer"></span><button class="soft-button" data-action="sched-close-dialog">Cancel</button><button class="primary-button" data-action="sched-create-build" data-plan-id="'+esc(d.planId)+'" data-plan-version="'+esc(d.version)+'">'+(ui.editingBuildId?'Save window':'Schedule build')+'</button></div>'+(window.PM56_SCHEDULE_DEMOS?window.PM56_SCHEDULE_DEMOS.dialogGuide(ctx):'')+'</section>';
  }


  function renderPrecedenceSection(){
    var S=P();return '<section class="schedule-safety"><div><strong>Manual stop</strong><span>'+(S.stopped?'Automations paused':'Not active')+'</span></div>'+
      (S.stopped?'<button class="soft-button" data-action="sched-clear-stop">Resume automations</button>':'')+'</section>'+
      (S.stopped?'<p class="schedule-attention">'+esc(S.stopReason||'Stopped by you')+'</p>':'')+
      '<details class="sched-audit"><summary>Stop record</summary>'+facts([['Epoch',S.stopEpoch],['Stopped',S.stopAt],['Rule','Manual stop, pause or cancel wins over automatic continuation.']])+'</details>';
  }


  function renderQuotaSection(){
    var q=RT.quota,c=P().quotaConsents[0];return '<section class="schedule-safety"><div><strong>Quota resume</strong><span>'+(q?.waiting?'Waiting for provider quota':'No quota wait')+'</span></div>'+chip(q?.resumeAutomatically?'Opted in':'Off','idle')+'</section>'+facts([
      ['Expected reset',q?.resetAt||'Unknown'],['Reset source',q?.resetSource||'Unknown'],['Provider',c?.provider_id],['Account',c?.account_id]
    ])+'<details class="sched-audit"><summary>Consent record</summary>'+facts([['Run',c?.run_id],['Scope','This run and account only'],['Control','Use the quota wait strip in chat.']])+'</details>';
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


  function renderPersistenceFooter(ctx){return '<div class="schedule-footer"><span title="This HTML demonstrates schedules; no background dispatch service runs here.">Concept · local records</span><span title="'+(ui.persistenceAvailable===false?'Browser storage unavailable. Changes last for this session.':'')+'">'+(ui.persistenceAvailable===false?'Session only':P().lastSavedAt?'Saved '+esc(fmtClock(P().lastSavedAt)):'')+'</span></div>';}


  function managerFilter(tab){return (ui.managerFilters||(ui.managerFilters={}))[tab]||((ui.managerFilters)[tab]={status:'all',query:'',sort:'time_asc'});}
  function visibleSchedules(rows,tab){const f=managerFilter(tab),q=f.query.toLowerCase();return rows.filter(r=>{
    const state=r.state==='scheduled'?'active':r.state==='sent'||r.state==='dispatched'?'completed':r.state==='held'||r.state==='invalidated'?'held':r.state==='cancelled'?'canceled':r.runPhase==='paused_safe'?'paused':r.state;
    return (f.status==='all'||state===f.status)&&(!q||[r.text,r.target_id,r.destination_ref?.label,r.timezone,PM56_PLANS.get(r.target_id)?.title].filter(Boolean).join(' ').toLowerCase().includes(q));
  }).sort((a,b)=>{const n=(Date.parse(a.scheduled_at_utc||a.next_occurrence_at||a.createdAt)||0)-(Date.parse(b.scheduled_at_utc||b.next_occurrence_at||b.createdAt)||0);return (f.sort==='time_desc'?-n:n)||String(a.scheduled_dispatch_id||a.schedule_id).localeCompare(String(b.scheduled_dispatch_id||b.schedule_id));});}
  function managerToolbar(tab,focused){const f=managerFilter(tab);return '<div class="b18-manager-filter"><label>Search<input data-sched-input="manager-query" value="'+esc(f.query)+'" placeholder="Text, destination or timezone"></label><label>Status<select data-sched-input="manager-status">'+[['all','All'],['active','Active'],['paused','Paused'],['held','Held / needs review'],['completed','Completed / sent'],['failed','Failed'],['expired','Expired'],['canceled','Canceled']].map(([v,l])=>'<option value="'+v+'" '+(f.status===v?'selected':'')+'>'+l+'</option>').join('')+'</select></label><label>Order<select data-sched-input="manager-sort"><option value="time_asc" '+(f.sort==='time_asc'?'selected':'')+'>Earliest first</option><option value="time_desc" '+(f.sort==='time_desc'?'selected':'')+'>Latest first</option></select></label></div>'+(focused?'<button class="text-button" data-action="sched-show-all-builds">All build windows</button>':'');}
  function renderManageDialog(ctx){
    var S=P(),tab=ui.manageTab||'messages';if(tab==='precedence')tab='quota';
    const focused=tab==='builds'&&!!findBuild(ui.focusBuild),allActive=S.scheduledMessages.filter(m=>['scheduled','held','failed'].includes(m.state));
    const msgs=visibleSchedules(S.scheduledMessages,'messages'),active=msgs.filter(m=>['scheduled','held'].includes(m.state)),attention=active.filter(m=>m.state==='held'),upcoming=active.filter(m=>m.state==='scheduled'),past=msgs.filter(m=>!active.includes(m));
    const tabs=[['messages','Scheduled Messages'],['builds','Execution & Build Windows'],['quota','Resume & Safety Policy'],['events','Events & Automation']];
    function section(label,rows){return rows.length?'<section class="schedule-list-section"><h3>'+label+' <span>'+rows.length+'</span></h3>'+rows.map(m=>renderMessageRow(ctx,m)).join('')+'</section>':'';}
    var content='';
    if(tab==='messages')content=section('Needs attention',attention)+section('Upcoming',upcoming)+(past.length?'<details class="schedule-history" '+(managerFilter(tab).status!=='all'||past.some(m=>m.scheduled_dispatch_id===ui.focusSchedule)?'open':'')+'><summary>History <span>'+past.length+'</span></summary>'+past.map(m=>renderMessageRow(ctx,m)).join('')+'</details>':'')+(!msgs.length?'<div class="schedule-empty">'+ctx.icon('history',28)+'<strong>No matching scheduled messages</strong><span>Create a message schedule from the Assistant wand.</span></div>':'');
    else if(tab==='builds'){const rows=visibleSchedules(S.buildSchedules.filter(b=>!ui.focusBuild||b.schedule_id===ui.focusBuild),'builds');content='<section class="schedule-list-section"><h3>Execution &amp; build windows</h3>'+(rows.length?rows.map(b=>renderBuildRow(ctx,b)).join(''):'<div class="schedule-empty"><strong>No matching windows</strong><span>Use Build At from a Plan.</span></div>')+'</section>';}
    else if(tab==='quota')content=renderPrecedenceSection()+renderQuotaSection();
    else content='<p class="schedule-caption">Session event history. Native webhook and automation services are not running in this concept.</p>'+renderEventLog();
    return '<section class="dialog sched-dialog sched-dialog--manage'+(focused?' sched-dialog--focused':'')+'" role="dialog" aria-modal="true" aria-label="Scheduled and Automations"><div class="drawer-head"><strong>'+(focused?'Build schedule':'Scheduled &amp; automations')+'</strong><span class="spacer"></span><button class="icon-button" data-action="sched-close-dialog" aria-label="Close">'+ctx.icon('close',14)+'</button></div>'+
      '<div class="schedule-overview"><div><strong>'+allActive.length+'</strong><span>pending messages</span></div><div><strong>'+S.buildSchedules.filter(b=>b.state==='active').length+'</strong><span>active windows</span></div><div class="schedule-overview-state">'+chip(S.stopped?'Automations paused':allActive.some(m=>m.state==='held')?'Needs attention':'No blockers',S.stopped?'attention':'idle')+'</div></div>'+
      '<div class="sched-tabs" role="tablist">'+tabs.map(([v,l])=>'<button role="tab" aria-selected="'+(v===tab)+'" class="text-button sched-tab '+(v===tab?'active':'')+'" data-action="sched-manage-tab" data-tab="'+v+'">'+l+'</button>').join('')+'</div>'+
      (['messages','builds'].includes(tab)?managerToolbar(tab,focused):'')+'<div class="dialog-body">'+content+'</div>'+renderPersistenceFooter(ctx)+(window.PM56_SCHEDULE_DEMOS?window.PM56_SCHEDULE_DEMOS.dialogGuide(ctx):'')+'</section>';
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
    dispatched:{label:'Sent',tone:'done'}, cancelled:{label:'Canceled',tone:'idle'},
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

  function renderMessageCard(ctx,m){
    var pr=messageProjection(m),st=SM_STATE[m.state]||{label:m.state,tone:'idle'},id=esc(m.scheduled_dispatch_id),open=!!ui.cardOpen?.[m.scheduled_dispatch_id];
    var why=pr.held_reason||pr.failure_reason||pr.expired_reason;
    return '<article class="sched-card sched-card-'+esc(m.state)+'" data-k="sched-card-'+id+'" data-schedule-id="'+id+'" data-schedule-state="'+esc(m.state)+'"><div class="sched-card-head"><span class="sched-kind">'+ctx.icon('history',14)+' Scheduled message</span>'+chip(st.label,st.tone)+'</div>'+
      '<p class="sched-card-preview">'+esc(pr.text_preview)+(m.text.length>120?'…':'')+'</p>'+
      '<div class="sched-card-route">'+esc(destinationLabel(m))+' · '+esc(m.requested_runtime?.modelName||'Default')+'</div><div class="sched-card-time">'+esc(whenLabel(m.scheduled_at_utc,m.timezone)+' · '+m.timezone)+(pr.attachment_count?' · '+pr.attachment_count+' attached':'')+'</div>'+
      (why&&['held','failed','expired'].includes(m.state)?'<div class="schedule-attention">'+ctx.icon('warning',12)+'<span>'+esc(attentionLabel(m))+'</span></div>':'')+
      '<div class="sched-card-foot"><button class="text-button" data-action="sched-card-details" data-id="'+id+'" aria-expanded="'+open+'">'+(open?'Less':'Details')+'</button>'+
      (pr.can_edit?'<button class="text-button" data-action="sched-card-edit" data-id="'+id+'">Edit</button>':'')+(pr.dispatched_message_id?'<button class="text-button" data-action="sched-open-sent" data-id="'+id+'">Open message</button>':'')+'</div>'+
      (open?messageDetails(ctx,m)+'<div class="sched-card-foot">'+(pr.can_cancel?'<button class="text-button danger" data-action="sched-card-cancel" data-id="'+id+'" data-revision="'+m.revision+'" data-currentness="'+esc(msgCurrent(m))+'">Cancel schedule</button>':'')+'<button class="text-button" data-action="sched-focus-record" data-id="'+id+'">All schedules</button></div>':'')+'</article>';
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
  EXT.action('sched-card-details', function(ctx,btn){ ui.cardOpen=ui.cardOpen||{}; ui.cardOpen[btn.dataset.id]=!ui.cardOpen[btn.dataset.id]; ctx.renderApp(); return true; });
  EXT.action('sched-open-sent',function(ctx,btn){
    var m=smById(btn.dataset.id);if(!m?.dispatchedMessageId)return true;
    ctx.closeDialog();ctx.switchThread(m.thread_id);
    requestAnimationFrame(()=>document.querySelector('[data-message-id="'+CSS.escape(m.dispatchedMessageId)+'"]')?.scrollIntoView({block:'center',behavior:'smooth'}));return true;
  });
  EXT.action('sched-focus-record',function(ctx,btn){ui.focusSchedule=btn.dataset.id;ui.manageTab='messages';ctx.openDialog({type:'sched-manage'});return true;});
  EXT.action('sched-pick-model',function(ctx,btn){
    var d=ui.msgDraft;if(!d)return true;
    window.PM56_PICKERS.openModel(btn,{model:d.modelId,effort:d.effort,fast:d.fast},v=>{if(ui.msgDraft!==d||ctx.state.dialog?.type!=='sched-message')return;d.modelId=v.model;d.effort=v.effort;d.fast=v.fast;ctx.renderOverlays();});return true;
  });
  EXT.action('sched-card-edit', function(ctx,btn){
    var rec=smById(btn.dataset.id); if(!rec) return true;
    var pr=messageProjection(rec);
    if(!pr.can_edit){
      ctx.toast('Refused','A '+pr.state_label+' schedule cannot be edited. Editing uses expected revision and currentness and fails closed.');
      return true;
    }
    ui.editingMsgId=rec.scheduled_dispatch_id;
    ui.msgDraft=loadMessageForEdit(rec);
    ctx.openDialog({ type:'sched-message' });
    return true;
  });
  EXT.action('sched-card-cancel',function(ctx,btn){const id=btn.dataset.id,m=findMessage(id);if(!m)return true;
    const token=btn.dataset.revision?{id,revision:Number(btn.dataset.revision),currentness:btn.dataset.currentness}:m.binding_kind==='scheduled_message_v2'?null:captureMessage(id);
    const out=cancelMessageExact(id,token);ctx.renderApp();ctx.toast(out.ok?'Schedule canceled':'Cancel refused',out.ok?'Only this schedule was canceled. History is retained.':out.detail);return true;
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
    ui.editingBuildId=null;
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
  ACT['sched-show-all-builds']=function(ctx){ui.focusBuild=null;ctx.renderApp();};
  ACT['sched-open-plan-record']=function(ctx,btn){ui.focusBuild=btn.dataset.id;ui.manageTab='builds';ctx.openDialog({type:'sched-manage'});};
  ACT['sched-open-manage'] = function (ctx) {
    ui.focusBuild=null;
    ctx.closeMenu && ctx.closeMenu();
    ctx.openDialog({ type: 'sched-manage' });
  };
  ACT['sched-open-build-at'] = function (ctx, btn) {
    openBuildAt(ctx, btn.dataset.planId, btn.dataset.planVersion);
  };
  ACT['sched-close-dialog'] = function (ctx) {
    ui.msgDraft = null; ui.editingMsgId = null; ui.buildDraft = null;ui.editingBuildId=null;
    ctx.closeDialog();
  };
  ACT['sched-create-message'] = async function(ctx){
    if(!ui.msgDraft||ui.snapshotBusy)return;
    const draft=ui.msgDraft,editingId=ui.editingMsgId,editing=!!editingId;
    const finish=rec=>{ui.msgDraft=null;ui.editingMsgId=null;ui.focusSchedule=rec.scheduled_dispatch_id;ui.manageTab='messages';ctx.openDialog({type:'sched-manage'});ctx.renderApp();ctx.toast(editing?'Schedule updated':'Message scheduled','Exact session-local snapshot recorded. No provider or background timer has started.');};
    if(!(draft.attachments||[]).some(a=>!a.snapshot_ref&&!a.artifact_ref&&!a.artifact_id)){const rec=commitMessage(ctx);if(rec)finish(rec);return;}
    ui.snapshotBusy=true;ctx.renderOverlays();
    const out=await saveMessageWithSnapshots(draft,editingId,()=>ui.msgDraft===draft&&ui.editingMsgId===editingId);
    ui.snapshotBusy=false;
    if(ui.msgDraft!==draft||ui.editingMsgId!==editingId)return;
    if(!out.ok){draft.error=out.detail||out.error;ctx.renderOverlays();return;}
    finish(out.record);
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
    else if (res.refused) ctx.toast('Not sent',res.reason);
    else if (res.held) ctx.toast('Dispatch held', res.reason);
    else if (res.dispatched) ctx.toast('Scheduled message sent', 'Delivered the exact text frozen at schedule time into ' + (res.thread ? res.thread.title : 'the thread') + '.');
  };
  ACT['sched-edit-message'] = function (ctx, btn) {
    var rec = findMessage(btn.dataset.id); if (!rec) return;
    ui.editingMsgId = rec.scheduled_dispatch_id;
    if(!messageProjection(rec).can_edit)return;
    ui.msgDraft = loadMessageForEdit(rec);
    ctx.openDialog({type:'sched-message'});
  };
  ACT['sched-cancel-edit-message'] = function (ctx) {
    ui.editingMsgId = null; ui.msgDraft = defaultMsgDraft(ctx);
    reRender(ctx);
  };
  ACT['sched-edit-build']=function(ctx,btn){
    var b=findBuild(btn.dataset.id);if(!b||b.state!=='active'||b.dispatchReceipt)return;
    ui.editingBuildId=b.schedule_id;
    var local=tzParts(b.timezone,Date.parse(b.scheduled_at_utc||b.next_occurrence_at));
    ui.buildDraft={requestKey:ctx.uid('build-schedule-update'),expectedCurrentness:buildCurrent(b),executionTopology:b.execution_topology||'agent',crewDefinition:b.topology_snapshot?.collaboration_definition_ref||null,expected:window.PM56_PLANS.admissionSnapshot(b.target_id),planId:b.target_id,version:b.exact_target_version,contentHash:b.exact_target_hash,expectedRevision:b.revision,kind:b.schedule_kind,date:local?local.y+'-'+pad2(local.mo)+'-'+pad2(local.d):'',time:b.local_start,startTime:b.local_start,pauseTime:b.local_pause||'02:00',timezone:b.timezone,days:b.days_of_week.slice(),windDown:b.wind_down_seconds/60,autoResumeNext:b.auto_resume_next_window,missed:b.missed_policy};
    ctx.openDialog({type:'sched-build-at',planId:b.target_id,version:b.exact_target_version});
  };
  ACT['sched-configure-crew']=function(ctx){const d=ui.buildDraft;if(!d)return;const out=PM56_COLLAB.openScheduledCrew({...d.expected},d.crewDefinition);if(!out.ok){d.error=out.message||out.error;ctx.renderOverlays();}};
  ACT['sched-create-build'] = function (ctx, btn) {
    // A completed or canceled form cannot be replayed into a second schedule.
    if (!ui.buildDraft) return;
    var d=ui.buildDraft,err=d.kind==='one_time'?validateWall(d.date,d.time,d.timezone):(!d.days.length?'Select at least one day.':d.startTime===d.pauseTime?'Start and pause must be different.':'');
    if(err){d.error=err;ctx.renderOverlays();return;}
    var old=ui.editingBuildId?findBuild(ui.editingBuildId):null;
    if(ui.editingBuildId&&(!old||old.state!=='active'||old.exact_target_version!==d.version||old.revision!==d.expectedRevision)){d.error='Schedule changed. Reopen it before editing.';ctx.renderOverlays();return;}
    var rec=commitBuild(ctx);if(!rec)return;
    ui.editingBuildId=null;ui.buildDraft=null;ui.manageTab='builds';ui.focusBuild=rec.schedule_id;ctx.openDialog({type:'sched-manage'});
    reRender(ctx);
    ctx.toast(old?'Build window updated':'Build window scheduled', rec.schedule_kind === 'one_time'
      ? ('One-time at ' + to12h(rec.local_start) + ' ' + tzLabel(rec.timezone) + '.')
      : ('Recurring ' + to12h(rec.local_start) + '–' + to12h(rec.local_pause) + ' ' + tzLabel(rec.timezone) + ', ' + daysSummary(rec.days_of_week) + '.'));
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

  document.addEventListener('input',function(e){
    if(e.target.dataset.schedInput!=='msg-text'||!ui.msgDraft)return;
    ui.msgDraft.text=e.target.value;ui.msgDraft.error='';
    var save=document.querySelector('[data-action="sched-create-message"]');if(save)save.disabled=!e.target.value.trim()||e.target.value.length>8000;
  });
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || !t.getAttribute) return;
    var k = t.getAttribute('data-sched-input'); if (!k) return;
    var ctx = EXT.ctx && EXT.ctx(); if (!ctx) return;
    var md = ui.msgDraft, bd = ui.buildDraft;
    if(k.startsWith('manager-')){const f=managerFilter(ui.manageTab);f[k==='manager-query'?'query':k==='manager-status'?'status':'sort']=t.value;ctx.renderOverlays();return;}
    if (k === 'msg-text' && md) md.text = t.value;
    else if (k === 'msg-date' && md) md.date = t.value;
    else if (k === 'msg-time' && md) md.time = t.value;
    else if (k === 'msg-tz' && md) md.timezone = t.value;
    else if (k === 'msg-model' && md) md.modelId = t.value;
    else if (k === 'msg-missed' && md) md.missed = t.value;
    else if (k === 'msg-grace' && md) md.grace = clamp(t.value, 1, 1440);
    else if (k === 'build-topology' && bd) bd.executionTopology=t.value;
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
    stopSnapshot:()=>({epoch:P().stopEpoch,stopped:P().stopped}),
    checkEpoch:token=>token?.epoch!==P().stopEpoch?{ok:false,error:"stale_stop_epoch"}:P().stopped?{ok:false,error:"manual_stop_latched"}:{ok:true},
    planSummary:planSummary,
    dispatchBuildAt:dispatchBuildAt,
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
