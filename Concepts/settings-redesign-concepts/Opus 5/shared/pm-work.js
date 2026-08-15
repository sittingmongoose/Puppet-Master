/* Opus 5 — ObservableWork and the RuntimeResourceGovernor projection.
 *
 * Added by the 2026-08-13 dependency correction. The original build shipped a
 * timer-driven phase animation (`pm-sim.js`) with five outcome words and no
 * wait reason, which is exactly the "fake progress" the decision register
 * forbids: a clock advanced the bar whether or not anything was happening.
 *
 * Two contracts live here, and only here:
 *
 *   ObservableWork          the truthful progress/wait projection
 *   RuntimeResourceGovernor the single resource/admission owner
 *
 * Settings never admits work and never invents a second scheduler. It asks the
 * governor for a permit, renders the answer, and shows the operation honestly.
 * `02_FULL_THREAD_CURRENT_DECISION_REGISTER.md` §2.3, §11.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------- states */

  /* Register §11. Every state a concept may render. "Loading" is not one of
   * them: the user is always told what is being waited on. */
  var STATES = [
    "accepted", "queued", "starting", "running", "synchronizing",
    "waiting_provider", "waiting_host", "waiting_network", "waiting_resource",
    "waiting_permission", "waiting_for_sign_in", "waiting_for_idle", "waiting_user",
    "retrying", "backgrounded", "degraded", "stalled",
    "committing", "verifying", "rolling_back",
    "completed", "failed", "cancelled", "recovery_required"
  ];

  var TERMINAL = ["completed", "failed", "cancelled", "recovery_required"];

  var WAITING = [
    "queued", "waiting_provider", "waiting_host", "waiting_network",
    "waiting_resource", "waiting_permission", "waiting_for_sign_in",
    "waiting_for_idle", "waiting_user"
  ];

  /* Human phrase per state. A generic spinner must never conceal which of these
   * is true (PERFORMANCE_SETTINGS_RETURN §12). */
  var STATE_WORD = {
    accepted: "Accepted",
    queued: "Queued",
    starting: "Starting",
    running: "Working",
    synchronizing: "Synchronizing",
    waiting_provider: "Waiting for the provider",
    waiting_host: "Waiting for the host",
    waiting_network: "Waiting for the network",
    waiting_resource: "Waiting for capacity",
    waiting_permission: "Waiting for permission",
    waiting_for_sign_in: "Waiting for sign-in",
    waiting_for_idle: "Waiting until the machine is idle",
    waiting_user: "Waiting for you",
    retrying: "Retrying",
    backgrounded: "Running in the background",
    degraded: "Running degraded",
    stalled: "Stalled",
    committing: "Committing",
    verifying: "Verifying",
    rolling_back: "Rolling back",
    completed: "Done",
    failed: "Failed",
    cancelled: "Cancelled",
    recovery_required: "Needs recovery"
  };

  /* Status tone reused by the shared semantics layer, so one vocabulary paints
   * both settings rows and operations. */
  var STATE_TONE = {
    accepted: "loading", queued: "loading", starting: "loading", running: "loading",
    synchronizing: "loading", retrying: "loading", committing: "loading", verifying: "loading",
    waiting_provider: "attention", waiting_host: "attention", waiting_network: "attention",
    waiting_resource: "attention", waiting_permission: "attention",
    waiting_for_sign_in: "setup", waiting_for_idle: "managed", waiting_user: "setup",
    backgrounded: "managed", degraded: "attention", stalled: "attention",
    rolling_back: "attention", completed: "ok", failed: "risky",
    cancelled: "unavailable", recovery_required: "risky"
  };

  /* Progress provenance. Register §11: a determinate bar requires a real
   * denominator, and the source of that number is part of the projection. */
  var PROGRESS_SOURCES = ["measured", "provider_reported", "derived", "unknown"];

  /* --------------------------------------------------- governor projection */

  /* RuntimeResourceGovernor is the ONLY admission owner. This is a read-only
   * projection of its decision for concept purposes: Settings shows policy and
   * the effective answer, it does not schedule. Register §2.3. */
  var PERMIT_OUTCOMES = ["admitted", "queued", "admitted_degraded", "blocked_permission", "blocked_resource", "cancelled"];

  var governorPolicy = {
    profile: "auto",            /* auto | performance | efficiency | legacy */
    backgroundWork: "when_idle",
    meteredNetwork: "defer_large",
    batteryOrLowPower: "reduce_background",
    interactiveReserve: true
  };

  /* A permit answer is derived from the declared policy and the demo state, not
   * invented per manager. Nothing here is a second scheduler: it reports what
   * the one governor would decide. */
  function permit(spec) {
    var s = spec || {};
    var profile = governorPolicy.profile;

    if (s.needsPermission) {
      return { outcome: "blocked_permission", reason: "This operation needs permission that has not been granted.", lane: s.lane || "blocking" };
    }
    if (s.offline && s.needsNetwork) {
      return { outcome: "blocked_resource", reason: "No network route to the owning host.", lane: s.lane || "io" };
    }
    if (profile === "legacy" && s.heavy) {
      return { outcome: "admitted_degraded", reason: "Legacy profile: fewer simultaneous helpers, smaller caches.", lane: s.lane || "cpu" };
    }
    if (profile === "efficiency" && s.heavy) {
      return { outcome: "queued", reason: "Efficiency profile: heavy work waits for the interactive reserve to clear.", lane: s.lane || "cpu" };
    }
    if (s.contended) {
      return { outcome: "queued", reason: "Another operation holds the lane.", lane: s.lane || "cpu" };
    }
    return { outcome: "admitted", reason: null, lane: s.lane || "cpu" };
  }

  function policy() { return Object.assign({}, governorPolicy); }

  function setPolicy(patch) {
    governorPolicy = Object.assign({}, governorPolicy, patch || {});
    emitPolicy();
    return policy();
  }

  var policyListeners = [];
  function onPolicy(fn) { policyListeners.push(fn); return function () { var i = policyListeners.indexOf(fn); if (i >= 0) policyListeners.splice(i, 1); }; }
  function emitPolicy() { policyListeners.forEach(function (fn) { try { fn(policy()); } catch (e) {} }); }

  /* ------------------------------------------------------------ operations */

  var ops = [];
  var listeners = [];
  var seq = 0;

  /* Byte contract, not an item count. Register §8.2: "Item counts alone are
   * insufficient." The list is trimmed by measured payload size first and by a
   * hard ceiling second. */
  var BYTE_BUDGET = 64 * 1024;
  var HARD_CEILING = 80;

  function approxBytes(op) {
    var n = 0;
    for (var k in op) {
      if (!Object.prototype.hasOwnProperty.call(op, k)) continue;
      var v = op[k];
      n += k.length * 2;
      if (typeof v === "string") n += v.length * 2;
      else if (typeof v === "number") n += 8;
      else if (v && typeof v === "object") n += JSON.stringify(v).length * 2;
      else n += 4;
    }
    return n;
  }

  function trim() {
    var used = 0;
    for (var i = 0; i < ops.length; i++) {
      used += ops[i]._bytes || (ops[i]._bytes = approxBytes(ops[i]));
      if (used > BYTE_BUDGET || i >= HARD_CEILING) { ops.length = i; return; }
    }
  }

  function emit() {
    var snapshot = list();
    listeners.forEach(function (fn) { try { fn(snapshot); } catch (e) {} });
  }

  function onChange(fn) {
    listeners.push(fn);
    /* Every subscription is releasable. Register §7.3 forbids surfaces that
     * subscribe and never detach. */
    return function unsubscribe() {
      var i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  function listenerCount() { return listeners.length; }

  function now() { return Date.now(); }

  function reducedMotion() {
    return document.documentElement.getAttribute("data-reduced-motion") === "1";
  }

  /* start(spec) opens an operation. It does NOT invent progress: the caller
   * advances it with real facts through the returned handle. An operation that
   * is never advanced stays in its declared wait state and says why. */
  function start(spec) {
    var s = spec || {};
    seq += 1;

    var op = {
      operation_id: (s.id || "op") + ":" + seq,
      owner_domain: s.ownerDomain || "settings",
      scope: s.scope || null,
      object_ref: s.objectRef || null,
      title: s.title || s.label || "Operation",
      phase: s.phase || null,
      state: s.state || "accepted",
      progress_kind: s.progressKind || "indeterminate",   /* indeterminate | fraction | bytes | stages */
      completed: null,
      total: null,
      progress_source: s.progressSource || "unknown",
      wait_reason: s.waitReason || null,
      blocking_scope: s.blockingScope || null,
      started_at: now(),
      last_activity: now(),
      can_cancel: s.canCancel === true,
      can_background: s.canBackground === true,
      can_retry: false,
      real_call: s.realCall || null,
      receipt: null,
      simulated: true,
      permit: null,
      history: []
    };

    /* Ask the one governor before doing anything. */
    var p = permit(s.permit || {});
    op.permit = p;
    if (p.outcome === "queued") { op.state = "queued"; op.wait_reason = p.reason; }
    else if (p.outcome === "admitted_degraded") { op.state = "degraded"; op.wait_reason = p.reason; }
    else if (p.outcome === "blocked_permission") { op.state = "waiting_permission"; op.wait_reason = p.reason; }
    else if (p.outcome === "blocked_resource") { op.state = "failed"; op.wait_reason = p.reason; }

    op.history.push({ at: op.started_at, state: op.state, reason: op.wait_reason });
    ops.unshift(op);
    trim();
    emit();

    return handleFor(op);
  }

  function handleFor(op) {
    return {
      id: op.operation_id,
      get: function () { return project(op); },

      /* advance() records a real transition. Progress numbers are only accepted
       * with a source; a fraction without a denominator is rejected outright
       * rather than rendered as a lie. */
      advance: function (patch) {
        var p = patch || {};
        if (p.state && STATES.indexOf(p.state) < 0) throw new Error("PMWork: unknown state " + p.state);
        if (p.state) op.state = p.state;
        if (p.phase !== undefined) op.phase = p.phase;
        if (p.waitReason !== undefined) op.wait_reason = p.waitReason;
        if (p.blockingScope !== undefined) op.blocking_scope = p.blockingScope;

        if (p.completed !== undefined || p.total !== undefined) {
          var total = p.total === undefined ? op.total : p.total;
          var done = p.completed === undefined ? op.completed : p.completed;
          if (typeof total === "number" && total > 0 && typeof done === "number") {
            op.completed = done;
            op.total = total;
            op.progress_kind = p.progressKind || (op.progress_kind === "indeterminate" ? "fraction" : op.progress_kind);
            op.progress_source = p.progressSource || (op.progress_source === "unknown" ? "derived" : op.progress_source);
          } else {
            /* No trustworthy denominator: stay indeterminate and say so. */
            op.completed = null;
            op.total = null;
            op.progress_kind = "indeterminate";
          }
        }
        if (p.canCancel !== undefined) op.can_cancel = p.canCancel === true;
        if (p.canBackground !== undefined) op.can_background = p.canBackground === true;
        if (p.canRetry !== undefined) op.can_retry = p.canRetry === true;

        op.last_activity = now();
        op._bytes = null;
        op.history.push({ at: op.last_activity, state: op.state, reason: op.wait_reason });
        if (op.history.length > 12) op.history.splice(0, op.history.length - 12);
        trim();
        emit();
        return op.state;
      },

      finish: function (outcome, detail, receipt) {
        var state = outcome || "completed";
        if (TERMINAL.indexOf(state) < 0) state = "completed";
        op.state = state;
        op.phase = null;
        op.wait_reason = null;
        op.detail = detail || null;
        op.receipt = receipt || null;
        op.can_cancel = false;
        op.can_background = false;
        op.can_retry = state === "failed" || state === "recovery_required";
        op.last_activity = now();
        op._bytes = null;
        op.history.push({ at: op.last_activity, state: state, reason: null });
        trim();
        emit();
        return project(op);
      },

      cancel: function () {
        if (!op.can_cancel) return false;
        op.state = "cancelled";
        op.wait_reason = null;
        op.can_cancel = false;
        op.can_background = false;
        op.can_retry = true;
        op.last_activity = now();
        emit();
        return true;
      },

      background: function () {
        if (!op.can_background) return false;
        op.state = "backgrounded";
        op.last_activity = now();
        emit();
        return true;
      }
    };
  }

  /* project() is what a concept renders. It never exposes internals. */
  function project(op) {
    var waiting = WAITING.indexOf(op.state) >= 0;
    var terminal = TERMINAL.indexOf(op.state) >= 0;
    var determinate = op.progress_kind !== "indeterminate" &&
      typeof op.total === "number" && op.total > 0 && typeof op.completed === "number";

    return {
      operation_id: op.operation_id,
      owner_domain: op.owner_domain,
      scope: op.scope,
      object_ref: op.object_ref,
      title: op.title,
      phase: op.phase,
      state: op.state,
      state_word: STATE_WORD[op.state] || op.state,
      tone: STATE_TONE[op.state] || "loading",
      waiting: waiting,
      terminal: terminal,
      /* Determinate only with a real denominator, and the source travels with
       * the number so a reviewer can see whether it is measured or guessed. */
      determinate: determinate,
      completed: determinate ? op.completed : null,
      total: determinate ? op.total : null,
      progress_kind: op.progress_kind,
      progress_source: op.progress_source,
      wait_reason: op.wait_reason,
      blocking_scope: op.blocking_scope,
      can_cancel: op.can_cancel,
      can_background: op.can_background,
      can_retry: op.can_retry,
      real_call: op.real_call,
      receipt: op.receipt,
      detail: op.detail || null,
      permit: op.permit,
      simulated: op.simulated,
      /* Hidden rows stop clocks: a static projection carries no animation hint
       * when reduced motion is on. Register §11. */
      animate: !reducedMotion() && !terminal,
      age_ms: now() - op.started_at,
      stale_ms: now() - op.last_activity
    };
  }

  function find(id) { return ops.filter(function (o) { return o.operation_id === id; })[0] || null; }

  /* The shell renders projections, not handles, so cancellation is addressed by
   * id. The operation and the governor remain the single source of truth. */
  function cancelById(id) {
    var op = find(id);
    if (!op || !op.can_cancel) return false;
    op.state = "cancelled";
    op.wait_reason = null;
    op.can_cancel = false;
    op.can_background = false;
    op.can_retry = true;
    op.last_activity = now();
    emit();
    return true;
  }

  function backgroundById(id) {
    var op = find(id);
    if (!op || !op.can_background) return false;
    op.state = "backgrounded";
    op.last_activity = now();
    emit();
    return true;
  }

  function list() { return ops.map(project); }
  function active() { return list().filter(function (o) { return !o.terminal; }); }
  function byId(id) { var o = ops.filter(function (x) { return x.operation_id === id; })[0]; return o ? project(o) : null; }
  function clear() { ops.length = 0; emit(); }

  /* Stall detection: an operation with no activity for its own budget is
   * reported as stalled rather than left spinning forever. Callers poll this;
   * nothing here runs a background timer of its own. */
  function reapStalled(thresholdMs) {
    var t = thresholdMs || 12000;
    var changed = false;
    ops.forEach(function (op) {
      if (TERMINAL.indexOf(op.state) >= 0 || op.state === "stalled") return;
      if (now() - op.last_activity > t) { op.state = "stalled"; changed = true; }
    });
    if (changed) emit();
    return changed;
  }

  window.PMWork = {
    STATES: STATES,
    TERMINAL: TERMINAL,
    WAITING: WAITING,
    STATE_WORD: STATE_WORD,
    STATE_TONE: STATE_TONE,
    PROGRESS_SOURCES: PROGRESS_SOURCES,
    PERMIT_OUTCOMES: PERMIT_OUTCOMES,
    start: start,
    list: list,
    cancelById: cancelById,
    backgroundById: backgroundById,
    active: active,
    byId: byId,
    onChange: onChange,
    listenerCount: listenerCount,
    clear: clear,
    reapStalled: reapStalled,
    stateWord: function (s) { return STATE_WORD[s] || s; },
    tone: function (s) { return STATE_TONE[s] || "loading"; },
    byteBudget: function () { return BYTE_BUDGET; },
    governor: {
      permit: permit,
      policy: policy,
      setPolicy: setPolicy,
      onPolicy: onPolicy,
      OUTCOMES: PERMIT_OUTCOMES
    }
  };
})();
