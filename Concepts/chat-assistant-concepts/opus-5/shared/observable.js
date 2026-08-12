/* PMXObservable — Opus 5
 *
 * The single truthful projection of in-flight work, named by SHARED_PROCESS_RULES.md as the
 * ObservableWork owner's concept-side stand-in. SHARED_PROCESS_RULES forbids a second progress
 * system, so everything that takes time routes through here: Compact Now, artifact loading,
 * outbox replay and snapshot catch-up, provider install and update, worktree requests, the
 * capacity forecast, thread-request awaits, exports, and the Back Seat Driver `auto-active` glow.
 *
 * Two design decisions are load-bearing.
 *
 * 1. Ops live in MODULE state, not in the store. An op is not user state — it does not survive a
 *    reload, it is not part of a snapshot, and it must not make `store.snapshot()` grow without
 *    bound while a long run is in flight. Announcement still goes through the store, via
 *    `store.touchView('observable')`, so subscribers keep their single notification path and the
 *    "nothing reads semantic state from the DOM" rule is untouched.
 *
 * 2. A repeating animation is legal ONLY while a real op is running. Every indefinite pulse in
 *    this workspace carries `data-pmx-op="<id>"`; the motion contract asserts that such an
 *    element has a live running op here. That is what makes "the glow can never pulse
 *    indefinitely" a property of the code rather than a promise in prose.
 *
 * Contract: CONTRACT.md section 5 (store is the only source of truth for *semantic* state);
 * SERVICES.md "PMXObservable".
 */
(function (global) {
  'use strict';

  var STATES = ['queued', 'running', 'blocked', 'complete', 'failed', 'cancelled'];
  var TERMINAL = { complete: true, failed: true, cancelled: true };

  var store = null;
  var ops = {};          /* id -> op record */
  var order = [];        /* insertion order, so active() is stable and not hash-ordered */
  var subs = [];
  var seq = 0;

  function now() { return new Date().toISOString(); }

  function announce(op) {
    for (var i = 0; i < subs.length; i++) {
      try { subs[i](op, ops); } catch (e) {
        if (global.console && console.error) console.error('[pmx-observable] subscriber failed', e);
      }
    }
    /* One coarse change key for every op transition. Subscribers that care about a specific op
     * read it back with get(); the store is only the notification bus here. */
    if (store && typeof store.touchView === 'function') store.touchView('observable');
  }

  function bind(s) {
    store = s || null;
    return api;
  }

  /* start({ id, kind, label, determinate, total }) -> op
   *
   * `id` is optional; an omitted id is minted from the kind so a caller that fires a one-shot op
   * does not have to invent a name. Starting an id that already exists RESTARTS it rather than
   * silently returning the stale record — a second Compact Now is a second operation. */
  function start(spec) {
    var sp = spec || {};
    var kind = sp.kind || 'work';
    var id = sp.id || (kind + '-' + (++seq));
    var determinate = !!sp.determinate;
    var total = Number(sp.total);
    if (!isFinite(total) || total <= 0) total = 0;
    if (determinate && !total) determinate = false;
    var op = {
      id: id,
      kind: kind,
      label: sp.label || '',
      state: sp.queued ? 'queued' : 'running',
      determinate: determinate,
      progress: determinate ? { done: 0, total: total } : null,
      startedAt: now(),
      endedAt: null,
      receipt: null,
      reason: null
    };
    if (!ops[id]) order.push(id);
    ops[id] = op;
    announce(op);
    return op;
  }

  /* step(id, done, label) -> boolean
   *
   * Advances a determinate op and morphs its label IN PLACE. The label is part of the same record
   * on purpose: the packet requires counts to update inside an existing line rather than by
   * appending a new one, and a renderer can only do that if the count and the line are one thing. */
  function step(id, done, label) {
    var op = ops[id];
    if (!op || TERMINAL[op.state]) return false;
    if (op.state === 'queued' || op.state === 'blocked') op.state = 'running';
    if (op.progress && done !== undefined && done !== null) {
      var d = Number(done);
      if (isFinite(d)) op.progress.done = Math.max(0, Math.min(op.progress.total, d));
    }
    if (label !== undefined && label !== null) op.label = String(label);
    announce(op);
    return true;
  }

  /* block(id, reason) -> boolean. A blocked op is still live: it holds its progress and its
   * element keeps its op binding, but it must not animate — a blocked thing that keeps pulsing is
   * the exact lie this module exists to prevent. */
  function block(id, reason) {
    var op = ops[id];
    if (!op || TERMINAL[op.state]) return false;
    op.state = 'blocked';
    op.reason = reason ? String(reason) : null;
    announce(op);
    return true;
  }

  function resume(id, label) {
    var op = ops[id];
    if (!op || TERMINAL[op.state]) return false;
    op.state = 'running';
    op.reason = null;
    if (label !== undefined && label !== null) op.label = String(label);
    announce(op);
    return true;
  }

  /* finish(id, receipt) -> boolean. The receipt is what remains visible afterwards; an op that
   * completes without one leaves nothing durable behind, which is why every caller passes one. */
  function finish(id, receipt) {
    var op = ops[id];
    if (!op || TERMINAL[op.state]) return false;
    op.state = 'complete';
    op.endedAt = now();
    op.receipt = receipt === undefined ? null : receipt;
    if (op.progress) op.progress.done = op.progress.total;
    announce(op);
    return true;
  }

  function fail(id, reason) {
    var op = ops[id];
    if (!op || TERMINAL[op.state]) return false;
    op.state = 'failed';
    op.endedAt = now();
    op.reason = reason ? String(reason) : null;
    announce(op);
    return true;
  }

  function cancel(id) {
    var op = ops[id];
    if (!op || TERMINAL[op.state]) return false;
    op.state = 'cancelled';
    op.endedAt = now();
    announce(op);
    return true;
  }

  function get(id) { return ops[id] || null; }

  /* active() -> op[]  — queued, running and blocked ops in start order. Terminal ops are kept in
   * the table (a receipt outlives its op) but are not "active". */
  function active() {
    var out = [];
    for (var i = 0; i < order.length; i++) {
      var op = ops[order[i]];
      if (op && !TERMINAL[op.state]) out.push(op);
    }
    return out;
  }

  function all() {
    var out = [];
    for (var i = 0; i < order.length; i++) if (ops[order[i]]) out.push(ops[order[i]]);
    return out;
  }

  function byKind(kind) {
    var out = [];
    for (var i = 0; i < order.length; i++) {
      var op = ops[order[i]];
      if (op && op.kind === kind) out.push(op);
    }
    return out;
  }

  /* isRunning(id) -> boolean. The motion contract's gate: an infinite animation is only legal
   * while this returns true for the element's `data-pmx-op`. */
  function isRunning(id) {
    var op = ops[id];
    return !!(op && op.state === 'running');
  }

  /* elapsedMs(id) -> number. Uses endedAt when the op is terminal so a receipt reads the same
   * duration every time it is rendered rather than growing while it sits on screen. */
  function elapsedMs(id) {
    var op = ops[id];
    if (!op) return 0;
    var end = op.endedAt ? Date.parse(op.endedAt) : Date.now();
    var startMs = Date.parse(op.startedAt);
    if (!isFinite(end) || !isFinite(startMs)) return 0;
    return Math.max(0, end - startMs);
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return function () {};
    subs.push(fn);
    return function () {
      var i = subs.indexOf(fn);
      if (i >= 0) subs.splice(i, 1);
    };
  }

  /* clear() drops every op. Only the demo director's reset calls it; it exists so a scripted run
   * starts from one known state rather than inheriting a previous run's in-flight work. */
  function clear() {
    ops = {};
    order = [];
    seq = 0;
    if (store && typeof store.touchView === 'function') store.touchView('observable');
    return true;
  }

  var api = {
    STATES: STATES,
    bind: bind,
    start: start,
    step: step,
    block: block,
    resume: resume,
    finish: finish,
    fail: fail,
    cancel: cancel,
    get: get,
    active: active,
    all: all,
    byKind: byKind,
    isRunning: isRunning,
    elapsedMs: elapsedMs,
    subscribe: subscribe,
    clear: clear
  };

  global.PMXObservable = api;
})(window);
