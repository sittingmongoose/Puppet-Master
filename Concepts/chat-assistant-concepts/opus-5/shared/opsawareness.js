/* PMXOps — Opus 5
 *
 * THE ONLY HOST AND ENVIRONMENT SURFACE IN CHAT.
 *
 * `03_GOAL_TODO_SUBAGENTS_CREW_AND_OPERATIONAL_AWARENESS.md:99-113` lists nine things an agent can
 * ask the platform about — threads and Goals, files in flight, worktrees and leases, ports and
 * services, containers and environments, browser/test/debug/device sessions, machine pressure,
 * provider allowance, and recovery material. It then draws the line this module exists to hold:
 * Chat shows only COMPACT TASK-RELEVANT SUMMARIES AND ACTIONABLE CONFLICTS. Everything here
 * therefore returns short readable records. There is no log dump, no process table, no repeated
 * host banner — `05_...:97` bans exactly that, and CHAT-019 makes it a failure. The deep view
 * lives in the platform's own surfaces; Chat gets one collapsed `Environment` chip.
 *
 * TWO INVARIANTS ARE ENFORCED IN CODE RATHER THAN PROMISED IN PROSE.
 *
 * 1. `resolve` can never remove another owner's worktree (`03_...:146`). The worktree action set
 *    is CLOSED in this file — `Wait for writer`, `Open owner thread`, `Request new worktree` —
 *    and authored actions on a worktree conflict are discarded rather than merged. A merge would
 *    let a fixture, a Director trigger, or a future caller introduce a `Remove` that reads as
 *    legitimate. Creation is the same story: `requestWorktree` only ASKS. The Worktree Manager
 *    performs the work, so the return value is an observable op id, not a worktree.
 *
 * 2. Visible enum text is prose (CONTRACT section 8.3). The five worktree lifecycle strings are
 *    stored exactly as the packet writes them (`03_...:139-144`) instead of as underscored codes
 *    with a lookup table, because a lookup table is where a raw `patch_preserved` eventually
 *    leaks into the UI.
 *
 * Conflicts are PROJECTED, not owned. A conflict is a decision with an owner, so it lives in the
 * same `view[tid].decisions` list as approvals, warnings and grants and is rendered by the one
 * compact-decision renderer each concept already needs. This module reads that list, folds in the
 * conflicts it derives from its own environment tables, and drops anything the user already
 * settled. `PMXApprovals` owns the record; `session.ops.resolved` owns the settlement.
 *
 * PM-native browser vocabulary only (`reference/BROWSER_TERMINOLOGY_FINAL_CORRECTION.md`):
 * BrowserWorkspace, Browser Action, Browser Program, Expert Browser Program, BrowserPage,
 * TestCapture. No DOM access; no second progress system.
 *
 * Contract: CONTRACT.md sections 5 and 8.3; SERVICES.md "PMXOps".
 */
(function (global) {
  'use strict';

  /* The five worktree lifecycle strings, verbatim from `03_...:139-144`. Held as literals so the
   * only way to render a worktree state is to render prose. */
  var WT_CLEAN = 'Isolated and clean';
  var WT_WAITING = 'Waiting for writer';
  var WT_CONFLICT = 'Conflict detected';
  var WT_PATCH_PRESERVED = 'Patch preserved after failed merge';
  var WT_CLEANUP = 'Cleanup pending';

  /* The closed action sets. `worktree` is closed for a safety reason, not a tidiness one: see
   * invariant 1 in the file header. Every other kind carries `Details`, because `03_...:119`
   * requires the owner/thread/worktree evidence to be one disclosure away. */
  var ACTIONS_PORT = [
    { id: 'use-3001', label: 'Use 3001' },
    { id: 'details', label: 'Details' },
    { id: 'cancel', label: 'Cancel' }
  ];
  var ACTIONS_WORKTREE = [
    { id: 'wait-for-writer', label: 'Wait for writer' },
    { id: 'open-owner-thread', label: 'Open owner thread' },
    { id: 'request-new-worktree', label: 'Request new worktree' }
  ];
  var ACTIONS_FILE = [
    { id: 'open-owner-thread', label: 'Open owner thread' },
    { id: 'details', label: 'Details' },
    { id: 'cancel', label: 'Cancel' }
  ];
  var ACTIONS_TEST = [
    { id: 'wait-for-run', label: 'Wait for the running suite' },
    { id: 'details', label: 'Details' },
    { id: 'cancel', label: 'Cancel' }
  ];
  var ACTIONS_DEVICE = [
    { id: 'open-owner-thread', label: 'Open owner thread' },
    { id: 'details', label: 'Details' },
    { id: 'cancel', label: 'Cancel' }
  ];

  /* The closed conflict-kind union (`03_...` operational awareness). Anything outside it is a
   * category this module does not model, and inventing a sixth kind would give the concepts a
   * card they have no renderer for. */
  var KINDS = { port: true, worktree: true, file: true, test: true, device: true };

  /* An action that only INSPECTS must not settle the conflict. `Details` reveals evidence and
   * `Open owner thread` navigates to the other side of the contention; neither is a decision, so
   * the card has to survive both. Treating them as settlements is how a conflict silently
   * disappears while still being true. */
  var INSPECT_ONLY = { 'details': true, 'open-owner-thread': true };

  /* A worktree request is acknowledged by the Worktree Manager rather than performed here. This
   * concept has no manager process, so the op is completed on a short timer; the shape of the
   * receipt is what a real manager event would carry. */
  var REQUEST_MS = 900;

  var store = null;
  var data = null;
  var seq = 0;

  /* Worktrees granted during this session by `requestWorktree`, appended to the seeded table so a
   * completed request is visible where every other worktree is. */
  var granted = [];
  /* Ports taken by resolving a port conflict with the suggested alternative, for the same reason:
   * the resolution has to show up in the environment, not only in the settled card. */
  var claimed = [];

  function now() { return new Date().toISOString(); }

  function clone(v) {
    if (v == null || typeof v !== 'object') return v;
    if (Object.prototype.toString.call(v) === '[object Array]') {
      var a = [];
      for (var i = 0; i < v.length; i++) a.push(clone(v[i]));
      return a;
    }
    var o = {};
    for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) o[k] = clone(v[k]);
    return o;
  }

  /* Every store read is guarded so an unbound module returns its environment tables instead of
   * throwing. Boot binds once before the corpus loads and once after, so the unbound window is
   * real and a renderer must survive it. */
  function get(path, fallback) {
    if (!store || typeof store.get !== 'function') return fallback;
    var v = store.get(path);
    return v === undefined || v === null ? fallback : v;
  }

  function bind(s, d) {
    store = s || null;
    data = d || null;
    return api;
  }

  /* ------------------------------------------------------------------ environment tables ---- */

  /* Worktrees and leases. One row per lifecycle state so all five prose strings are reachable in
   * the Environment popup without firing a Director trigger, and so a concept can be checked
   * against `03_...:139-144` by reading the surface. */
  function seedWorktrees() {
    return [
      { id: 'wt-main', branch: 'main', state: WT_CLEAN,
        owner: { threadId: 'thread-01', threadTitle: 'Tastebook — planning chat' },
        patchPreserved: false },
      { id: 'wt-checkout', branch: 'feature/checkout', state: WT_WAITING,
        owner: { threadId: 'thread-07', threadTitle: 'Checkout redesign' },
        patchPreserved: false },
      { id: 'wt-import', branch: 'fix/import-tests', state: WT_CONFLICT,
        owner: { threadId: 'thread-06', threadTitle: 'Failing import tests' },
        patchPreserved: false },
      { id: 'wt-provider', branch: 'feature/provider-routing', state: WT_PATCH_PRESERVED,
        owner: { threadId: 'thread-04', threadTitle: 'Provider routing setup' },
        patchPreserved: true },
      { id: 'wt-usage', branch: 'spike/usage-page', state: WT_CLEANUP,
        owner: { threadId: 'thread-02', threadTitle: 'Usage page review' },
        patchPreserved: false }
    ];
  }

  function worktrees() {
    return seedWorktrees().concat(clone(granted));
  }

  /* Ports and services. Only 3000 is contested; the other two exist so the popup shows a normal
   * environment rather than a wall of problems, which is what "compact task-relevant summary"
   * means in practice. */
  function ports() {
    var list = [
      { port: 3000, owner: { threadId: 'thread-07', worktree: 'feature/checkout' },
        service: 'Checkout preview server', suggestedAlternative: 3001 },
      { port: 5173, owner: { threadId: 'thread-01', worktree: 'main' },
        service: 'Tastebook development server', suggestedAlternative: null },
      { port: 9222, owner: { threadId: 'thread-05', worktree: 'main' },
        service: 'BrowserWorkspace inspection endpoint', suggestedAlternative: null }
    ];
    return list.concat(clone(claimed));
  }

  /* Browser, test, debug and device sessions (`03_...:107`). The labels are the PM-native
   * vocabulary required by the terminology correction: a BrowserWorkspace holds BrowserPages, a
   * recorded run is a TestCapture, and a scripted sweep is a Browser Program. Third-party driver
   * names are forbidden in PM-owned surfaces, so none appears here or anywhere in this file. */
  function sessions() {
    return [
      { id: 'sess-browser-staging', kind: 'browser',
        label: 'BrowserWorkspace — 2 BrowserPages on the staging build',
        state: 'Attached', owner: { threadId: 'thread-05', worktree: 'main' } },
      { id: 'sess-browser-sweep', kind: 'browser',
        label: 'Browser Program — nightly regression sweep',
        state: 'Queued', owner: { threadId: 'thread-05', worktree: 'main' } },
      { id: 'sess-test-import', kind: 'test',
        label: 'TestCapture — import suite, 3 of 12 cases',
        state: 'Running', owner: { threadId: 'thread-06', worktree: 'fix/import-tests' } },
      { id: 'sess-debug-adapter', kind: 'debug',
        label: 'Debug session — provider adapter',
        state: 'Paused at breakpoint', owner: { threadId: 'thread-04', worktree: 'feature/provider-routing' } },
      { id: 'sess-device-pixel', kind: 'device',
        label: 'Device session — Pixel 8 emulator',
        state: 'Idle', owner: { threadId: 'thread-01', worktree: 'main' } }
    ];
  }

  /* CPU/memory/disk/GPU pressure as 0..1. Deterministic on purpose: a random walk would be a lie
   * about measurement, and a probe cannot assert against jitter. */
  function pressure() {
    return { cpu: 0.42, memory: 0.61, disk: 0.28, gpu: 0.13 };
  }

  /* Provider allowance, reset and cooldown. The provider name follows the project default so the
   * chip agrees with the route the user can actually see, rather than naming a provider they
   * never selected. `cooldownSeconds` is null when no cooldown is in force — an absent cooldown
   * must read as absent, not as zero seconds remaining. */
  function allowance() {
    return {
      provider: get('session.defaults.provider', 'Anthropic'),
      used: 412000,
      limit: 1000000,
      resetAt: '2026-08-12T00:00:00.000Z',
      cooldownSeconds: null
    };
  }

  /* Logs, backups, snapshots and restore points (`03_...:110`). Restore points are not seeded:
   * they are read out of the live views, because `PMXThreadOps.createRestorePoint` writes them
   * there and a second copy here would drift the moment a user makes one. */
  function recovery() {
    var pts = [];
    var views = get('view', {});
    for (var tid in views) {
      if (!Object.prototype.hasOwnProperty.call(views, tid)) continue;
      var ops = views[tid] && views[tid].threadOps;
      var rps = ops && ops.restorePoints;
      if (!rps || !rps.length) continue;
      for (var i = 0; i < rps.length; i++) {
        var rp = rps[i] || {};
        pts.push({
          id: rp.id || ('rp-' + tid + '-' + i),
          label: rp.label || ('Restore point in ' + threadTitle(tid)),
          at: rp.at || rp.createdAt || null
        });
      }
    }
    return {
      logs: [
        { id: 'log-run-latest', label: 'Run log — chat redesign Goal', at: '2026-08-11T09:12:00.000Z' },
        { id: 'log-adapter', label: 'Provider adapter log', at: '2026-08-10T17:40:00.000Z' }
      ],
      backups: [
        { id: 'bk-workspace-nightly', label: 'Workspace backup — nightly', at: '2026-08-11T03:00:00.000Z' }
      ],
      snapshots: [
        { id: 'snap-pre-merge', label: 'Snapshot before the provider routing merge', at: '2026-08-10T16:55:00.000Z' }
      ],
      restorePoints: pts
    };
  }

  /* ------------------------------------------------------------------------- conflicts ------ */

  /* The conflicts this module derives from its own environment tables, as opposed to the ones the
   * fixture authors into `view[tid].decisions`.
   *
   * The owner strings are AUTHORED here beside the summary rather than looked up from `data`. The
   * port summary is verbatim packet copy (`03_...:117`) and names the owning work in prose; if
   * the owner line were resolved from the thread record it could disagree with the sentence
   * directly above it the moment a fixture title changed. Copy and owner move together or the
   * card stops being truthful. Projected records get the opposite treatment — see `ownerOf`. */
  function derived() {
    return [
      { id: 'ops-conflict-port-3000', threadId: 'thread-01', kind: 'port',
        summary: 'Port 3000 is used by the checkout redesign in another worktree. Use 3001 instead?',
        owner: { threadId: 'thread-07', threadTitle: 'Checkout redesign', worktree: 'feature/checkout' } },
      { id: 'ops-conflict-worktree-checkout', threadId: 'thread-01', kind: 'worktree',
        summary: 'The checkout redesign worktree is waiting for its current writer.',
        owner: { threadId: 'thread-07', threadTitle: 'Checkout redesign', worktree: 'feature/checkout' } },
      { id: 'ops-conflict-test-import', threadId: 'thread-06', kind: 'test',
        summary: 'The import suite is already running in another worktree. Wait for it to finish?',
        owner: { threadId: 'thread-06', threadTitle: 'Failing import tests', worktree: 'fix/import-tests' } },
      { id: 'ops-conflict-file-theme', threadId: 'thread-02', kind: 'file',
        summary: 'tokens.css is held by the theme behavior review in another worktree.',
        owner: { threadId: 'thread-07', threadTitle: 'Theme behavior review', worktree: 'spike/theme-behavior' } },
      { id: 'ops-conflict-device-pixel', threadId: 'thread-05', kind: 'device',
        summary: 'The Pixel 8 emulator is attached to another thread. Wait for it to be released?',
        owner: { threadId: 'thread-01', threadTitle: 'Tastebook — planning chat', worktree: 'main' } }
    ];
  }

  function threadTitle(tid) {
    if (!tid) return '';
    var t = null;
    try { t = data && data.threadById ? data.threadById(tid) : null; } catch (e) { t = null; }
    return (t && t.title) || tid;
  }

  function actionsFor(kind) {
    if (kind === 'port') return clone(ACTIONS_PORT);
    if (kind === 'worktree') return clone(ACTIONS_WORKTREE);
    if (kind === 'test') return clone(ACTIONS_TEST);
    if (kind === 'device') return clone(ACTIONS_DEVICE);
    return clone(ACTIONS_FILE);
  }

  /* The store's view seeder stamps `kind:'conflict'` onto every fixture conflict so it joins the
   * one decision list, which means the operational kind has to be recovered from the record's own
   * fields. An explicit `conflictKind` wins; otherwise the resource named by the record decides.
   * The fallback is `file` because contention over "files and areas in flight" is the general
   * case, and a record that names no resource at all is exactly that. */
  function kindOf(rec) {
    if (rec.conflictKind && KINDS[rec.conflictKind]) return rec.conflictKind;
    if (KINDS[rec.kind]) return rec.kind;
    if (rec.port !== undefined && rec.port !== null) return 'port';
    if (rec.device) return 'device';
    if (rec.test || rec.suite) return 'test';
    if (rec.branch || rec.worktree || (rec.owner && rec.owner.worktree && !rec.file && !rec.path)) return 'worktree';
    return 'file';
  }

  /* Projected records get their missing owner title filled from the corpus, which is safe in the
   * direction that matters: the summary was authored by whoever raised the record, so completing
   * the evidence line from live data can only make the disclosure more accurate. */
  function ownerOf(rec) {
    var o = rec.owner || {};
    var tid = o.threadId || null;
    return {
      threadId: tid,
      threadTitle: o.threadTitle || (tid ? threadTitle(tid) : ''),
      worktree: o.worktree || null
    };
  }

  function normalizeActions(kind, list) {
    /* A worktree conflict never accepts authored actions. Merging them would let a `Remove` in
     * through a fixture or a Director trigger, and `03_...:146` forbids one agent silently
     * removing another owner's worktree. The three legal moves are wait, look, or ask for your
     * own — releasing someone else's lease is the Worktree Manager's call, not Chat's. */
    if (kind === 'worktree') return clone(ACTIONS_WORKTREE);
    if (!list || !list.length) return actionsFor(kind);
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (!a) continue;
      var label = a.label || a.id;
      if (!label) continue;
      out.push({ id: a.id || String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: String(label) });
    }
    return out.length ? out : actionsFor(kind);
  }

  function isResolved(id) {
    var res = get('session.ops.resolved', {});
    return !!(res && res[id]);
  }

  /* conflicts(threadId) -> [{ id, kind, summary, owner:{threadId,threadTitle,worktree}, actions }]
   *
   * Projection order is fixture-first: a record the fixture or a Director trigger raised describes
   * something that actually happened in this session, so it outranks a derived row with the same
   * id. Settled conflicts are dropped by id, which is why a derived conflict can be resolved even
   * though it has no decision record behind it. */
  function conflicts(threadId) {
    if (!threadId) return [];
    var out = [];
    var seen = {};

    var v = get('view.' + threadId, null);
    var decisions = (v && v.decisions) || [];
    for (var i = 0; i < decisions.length; i++) {
      var rec = decisions[i] || {};
      if (rec.kind !== 'conflict' && !KINDS[rec.kind] && !rec.conflictKind) continue;
      if (rec.kind !== 'conflict' && !rec.conflictKind && !KINDS[rec.kind]) continue;
      if (rec.status === 'decided') continue;
      var id = rec.id || ('ops-conflict-' + threadId + '-' + i);
      if (isResolved(id) || seen[id]) continue;
      var kind = kindOf(rec);
      seen[id] = true;
      out.push({
        id: id,
        kind: kind,
        summary: rec.summary || rec.question || '',
        owner: ownerOf(rec),
        actions: normalizeActions(kind, rec.actions)
      });
    }

    var der = derived();
    for (var j = 0; j < der.length; j++) {
      var d = der[j];
      if (d.threadId !== threadId) continue;
      if (isResolved(d.id) || seen[d.id]) continue;
      seen[d.id] = true;
      out.push({
        id: d.id,
        kind: d.kind,
        summary: d.summary,
        owner: { threadId: d.owner.threadId, threadTitle: d.owner.threadTitle, worktree: d.owner.worktree },
        actions: actionsFor(d.kind)
      });
    }
    return out;
  }

  function findConflict(threadId, conflictId) {
    var list = conflicts(threadId);
    for (var i = 0; i < list.length; i++) if (list[i].id === conflictId) return list[i];
    return null;
  }

  function hasAction(conflict, actionId) {
    for (var i = 0; i < conflict.actions.length; i++) if (conflict.actions[i].id === actionId) return true;
    return false;
  }

  function markResolved(conflictId, actionId) {
    if (!store || typeof store.set !== 'function') return;
    var prev = get('session.ops.resolved', {});
    var next = {};
    for (var k in prev) if (Object.prototype.hasOwnProperty.call(prev, k)) next[k] = prev[k];
    next[conflictId] = { at: now(), actionId: actionId };
    /* A fresh object, because the store compares by identity before emitting; mutating `prev` in
     * place would settle the conflict without telling a single subscriber. */
    store.set('session.ops.resolved', next);
  }

  /* resolve(threadId, conflictId, actionId) -> { ok, applied }
   *
   * `applied` names the action that took effect, or null when nothing did. An inspection action
   * returns ok with the conflict still standing — see INSPECT_ONLY. Settlement writes two places
   * on purpose: `session.ops.resolved` so the projection stops emitting the card even for a
   * derived conflict, and the decision record through `PMXApprovals` so the compact-decision
   * renderer shows the same settled state every other decision kind shows. */
  function resolve(threadId, conflictId, actionId) {
    var c = findConflict(threadId, conflictId);
    if (!c || !actionId || !hasAction(c, actionId)) return { ok: false, applied: null };

    if (actionId === 'open-owner-thread' && c.owner && c.owner.threadId && store && store.set) {
      /* Navigation is store state, not DOM, so it belongs here. It is still not a settlement:
       * looking at the other side of a contention does not decide anything. */
      store.set('session.activeThreadId', c.owner.threadId);
    }

    if (actionId === 'use-3001' && c.kind === 'port') {
      /* Taking the suggested alternative has to become visible in the environment, otherwise the
       * user resolved a port conflict and the port table still shows only the contested port. */
      claimed.push({
        port: 3001,
        owner: { threadId: threadId, worktree: get('view.' + threadId + '.runtime.worktree', 'main') },
        service: 'Development server',
        suggestedAlternative: null
      });
    }

    if (actionId === 'request-new-worktree') {
      requestWorktree(threadId, { branch: 'work/' + threadId, purpose: 'Requested from a worktree conflict' });
    }

    if (INSPECT_ONLY[actionId]) return { ok: true, applied: actionId };

    markResolved(conflictId, actionId);
    var ap = global.PMXApprovals;
    if (ap && typeof ap.decide === 'function') {
      /* Guarded: a projected conflict has a decision record, a derived one does not, and a partly
       * built page may not have Approvals yet. A missing record is not an error here. */
      try { ap.decide(threadId, conflictId, actionId); } catch (e) {}
    }
    return { ok: true, applied: actionId };
  }

  /* requestWorktree(threadId, spec) -> observable op id | null
   *
   * Chat asks; the Worktree Manager performs (`03_...:136`). Returning an op id rather than a
   * worktree is what makes that division legible in the code: the caller can only render progress
   * against work it does not own. There is no manager process in this concept, so the op is
   * completed on a short timer with the receipt a real manager event would carry. */
  function requestWorktree(threadId, spec) {
    var ob = global.PMXObservable;
    if (!ob || typeof ob.start !== 'function') return null;
    var sp = spec || {};
    var branch = sp.branch || ('work/' + (threadId || 'thread') + '-' + (++seq));
    var op = ob.start({
      kind: 'worktree',
      label: 'Requesting worktree ' + branch,
      determinate: false
    });
    var id = op && op.id;
    if (!id) return null;
    global.setTimeout(function () {
      if (!ob.isRunning || ob.isRunning(id)) {
        granted.push({
          id: 'wt-' + id,
          branch: branch,
          state: WT_CLEAN,
          owner: { threadId: threadId || null, threadTitle: threadTitle(threadId) },
          patchPreserved: false
        });
        if (typeof ob.finish === 'function') {
          ob.finish(id, { branch: branch, state: WT_CLEAN, purpose: sp.purpose || null });
        }
      }
    }, REQUEST_MS);
    return id;
  }

  var api = {
    bind: bind,
    conflicts: conflicts,
    resolve: resolve,
    worktrees: worktrees,
    ports: ports,
    sessions: sessions,
    pressure: pressure,
    allowance: allowance,
    recovery: recovery,
    requestWorktree: requestWorktree
  };

  global.PMXOps = api;
})(window);
