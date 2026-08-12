/* PMX store — Opus 5
 * One plain object, shallow-diffed change keys, no proxy magic.
 * The ONLY source of truth. Nothing reads semantic state from the DOM.
 * Contract: CONTRACT.md section 5.
 */
(function (global) {
  'use strict';

  var LS_KEY = 'pmx.opus5.state';
  /* v5 adds the packet's domain slices: route recents and provider setup ladder, transport/domain
   * sync with an idempotent outbox, operational grants, the title-bar notification inbox, a spell
   * source, and the per-thread BSD / decision / context / thread-operation / attachment / Crew /
   * capacity records. rehydrate() rejects a version mismatch outright, so a stale v4
   * `pmx.opus5.state` is discarded rather than half-merged into a shape it does not fit — which is
   * why there is no migration code here and must not be. */
  var LS_VERSION = 5;

  function clone(v) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(clone);
    var o = {};
    for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) o[k] = clone(v[k]);
    return o;
  }

  function defaultView() {
    return {
      anchor: null,
      expanded: {},
      lens: { mode: 'off', selection: [], applied: [] },
      questionnaire: null,
      draft: { text: '', attachments: [], revisions: [] },
      /* Work-surface expansion. The old shape was five independent booleans
       * (goalExpanded/todoOpen/subagentOpen/diffOpen/activityOpen) that no thread ever read or
       * wrote — every concept kept its open/closed state in a module local, so it was lost on
       * remount. `expanded` carries the single open domain for the concepts that promise
       * single-detail behaviour; `openIds` carries a per-record set for the ones that allow
       * several; `phaseIndex` is which activity phase a reopened group is showing. */
      surfaces: { expanded: null, openIds: {}, phaseIndex: null },
      surfacesYielded: false,
      /* Thread-local runtime. Canon requires provider/account/model, Persona, effort,
       * Normal/Fast, mode, access profile, Crew and worktree to apply to THIS thread and future
       * turns only. They lived in session.selectors, which is global, so choosing a model in one
       * thread silently retargeted every other thread. Seeded from session.defaults by
       * Store.view() the first time a thread is touched. */
      runtime: null,
      /* A running Goal freezes the runtime it was started with, so a later selector change does
       * not silently retarget it. Cleared when the Goal completes or is explicitly updated. */
      goalRuntime: null,
      thought: { keepActiveOpen: false, expanded: {} },
      loadedFrom: null,
      run: null,
      /* ---- v5 per-thread domain slices -------------------------------------------------
       * Every one of these is thread-local by construction. The packet requires a Back Seat
       * Driver mode, a route/approval decision surface, context admission edits, thread
       * operations, attachments, a Crew and a capacity forecast to apply to THIS thread only;
       * putting them in session state is the exact bug that made selectors global in v3. */
      bsd: { state: 'auto-idle', advice: [], lastAt: null, scope: 'thread' },
      /* Approvals, material warnings, operational conflicts and cross-project grants share one
       * compact-decision list so a concept needs one renderer, not four. Formalizes the ad-hoc
       * `pending` array the demo director used to write. */
      decisions: [],
      context: { removed: [], compact: null },
      threadOps: {
        requests: [], spawned: [], branches: [], restorePoints: [],
        rewoundTo: null, redirect: null
      },
      attachments: [],
      crew: null,
      capacity: null,
      /* Set once the fixture's authored seeds (bsd/decisions/attachments/threadOps/conflicts/
       * outboxSeed/syncSeed) have been folded into this slice, so a remount does not re-seed
       * over the user's own edits. */
      seeded: false
    };
  }

  function defaultState() {
    return {
      ui: {
        theme: 'friendly-dark',
        chatWidth: 750,
        railOpen: true,
        reducedMotion: false,
        mount: 'docked',
        windowId: 'w1',
        threadId: 't1'
      },
      session: {
        activeThreadId: 'thread-01',
        /* Project-level defaults. A thread's runtime is seeded from these on first touch;
         * changing one thread's runtime never writes back here. Broadening a change to the
         * project requires an explicit scope choice, which is a separate action. */
        defaults: {
          persona: 'Product designer',
          provider: 'Anthropic',
          account: 'Anthropic — Work',
          model: 'Opus 5',
          effort: 'High',
          speed: 'normal',          // 'normal' | 'fast', capability-gated per route
          mode: 'Agent',
          access: 'ask',            // ask | auto_edits | auto | full
          bsd: 'auto',              // off | auto | on
          bsdScope: 'thread',       // turn | thread
          worktree: 'main',
          crew: null
        },
        favorites: { models: ['Opus 5', 'Sonnet 5'], accounts: [] },
        search: { open: false, query: '', scope: 'current', selectedId: null, focusId: null },
        /* Four-state thread history. `state` is what the user asked for and `density` is which
         * pinned form they asked for; both persist. The EFFECTIVE state is derived against the
         * hosting concept's own width floors and is deliberately never stored — see
         * PMXThreadHistory.resolve(). Keeping the request separate from the resolution is what
         * lets a narrow window suspend a pin without forgetting the preference. */
        threadHistory: { state: 'closed', density: 'full', query: '', filter: 'all', scrollTop: 0 },
        /* Left-of-chat artifact workspace. Lives in session rather than ui so an artifact state
         * tick does not re-run every composition's width/rail/mount layout pass. */
        artifact: { open: false, activeId: null, byId: {} },
        spell: {
          enabled: true, disabledThreads: {}, ignoredInDraft: {}, personal: [], project: [],
          /* Which dictionary PM is using. 'automatic' resolves to the system dictionary when one
           * is available and to PM's own list otherwise; the resolution is shown, never guessed at
           * by the reader. */
          source: 'automatic',      // automatic | system | pm-local
          language: 'en-US'
        },
        /* Most-recently-used routes, distinct from favorites: favorites are chosen, recents are
         * observed. Both are needed because the picker shows them as separate groups. */
        recents: { models: [], accounts: [] },
        /* accountId -> setup ladder literal. The eight install/update states plus the four
         * connection states share one field because a route is either usable or it is not, and the
         * reason has to be one specific sentence rather than a generic failure. */
        providerSetup: {},
        /* Transport and domain health are separate axes: a live connection can still carry a
         * degraded provider, and an offline client can still hold a healthy last-known domain. */
        sync: {
          transport: 'live',        // live | offline | reconnecting | synchronizing | cached
          domain: 'live',           // live | degraded | failed
          outbox: [],
          replayed: {},             // outbox entry id -> true; the idempotency ledger
          snapshot: null,
          serverWork: []
        },
        /* Cross-project and operational grants. `resolved` records which conflicts have been
         * settled so a resolved conflict does not reappear on the next projection. */
        ops: { grants: {}, resolved: {} },
        /* Title-bar inbox. Chat itself owns no notification panel — see PMXNotify. */
        notify: { items: [], open: false },
        /* Bumped by the demo harness on every reset so a deterministic run can be identified. */
        demo: { generation: 0 }
      },
      view: {}
    };
  }

  function Store() {
    this._s = defaultState();
    this._subs = [];
    this._batching = false;
    this._pending = {};
  }

  Store.prototype.state = function () { return this._s; };

  Store.prototype.get = function (path) {
    var parts = String(path).split('.');
    var cur = this._s;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  };

  Store.prototype.set = function (path, value) {
    var parts = String(path).split('.');
    var cur = this._s;
    for (var i = 0; i < parts.length - 1; i++) {
      if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    var last = parts[parts.length - 1];
    if (cur[last] === value) return;
    cur[last] = value;
    this._emit([parts[0] + (parts.length > 1 ? '.' + parts[1] : '')]);
  };

  Store.prototype.patch = function (obj) {
    var keys = [];
    for (var path in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, path)) continue;
      var parts = path.split('.');
      var cur = this._s;
      for (var i = 0; i < parts.length - 1; i++) {
        if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = obj[path];
      keys.push(parts[0] + (parts.length > 1 ? '.' + parts[1] : ''));
    }
    this._emit(keys);
  };

  /* Per-thread view slice. Created lazily so a thread never carries defaults it did not set.
   *
   * The runtime is seeded here rather than in defaultView() because defaultView() is a pure
   * function with no access to the project defaults, and because seeding must also repair a
   * rehydrated view whose runtime predates this shape. A COPY is taken, never a reference —
   * sharing the defaults object would make every thread's selector writes global again, which
   * is the exact bug this slice exists to fix.
   *
   * The same call also folds the fixture's authored per-thread state (BSD mode and advice,
   * decisions, attachments, thread operations, operational conflicts, outbox and sync seeds) into
   * the view exactly once. The fixture is allowed to AUTHOR state; the store remains the single
   * source of truth for it. `attachData` supplies the normalized thread record — without it the
   * seed step is skipped, so an unbound store still returns a usable view. */
  Store.prototype.view = function (threadId) {
    var tid = threadId || this._s.session.activeThreadId;
    if (!this._s.view[tid]) this._s.view[tid] = defaultView();
    var v = this._s.view[tid];
    if (!v.runtime) v.runtime = clone(this._s.session.defaults);
    if (!v.seeded && this._data) this._seedView(tid, v);
    return v;
  };

  /* Called once by PMXData after normalization so `view()` can seed from authored fixture state.
   * Passing the data in rather than reaching for a global keeps the store dependency-free. */
  Store.prototype.attachData = function (data) {
    this._data = data || null;
    return this;
  };

  Store.prototype._seedView = function (tid, v) {
    v.seeded = true;
    var t = null;
    try { t = this._data && this._data.threadById ? this._data.threadById(tid) : null; } catch (e) { t = null; }
    if (!t) return;
    if (t.bsd) {
      v.bsd.scope = t.bsd.scope || v.bsd.scope;
      v.bsd.state = t.bsd.mode === 'on' ? 'on' : (t.bsd.mode === 'off' ? 'off' : 'auto-idle');
      v.bsd.advice = clone(t.bsd.advice || []);
      if (t.bsd.mode) this.setRuntimeQuiet(tid, 'bsd', t.bsd.mode);
    }
    if (t.decisions && t.decisions.length) v.decisions = clone(t.decisions);
    if (t.conflicts && t.conflicts.length) {
      /* A conflict is a decision with an owner, so it joins the same compact-decision list
       * rather than founding a second one. */
      for (var i = 0; i < t.conflicts.length; i++) {
        var c = clone(t.conflicts[i]);
        c.kind = 'conflict';
        c.status = c.status || 'pending';
        v.decisions.push(c);
      }
    }
    if (t.attachments && t.attachments.length) v.attachments = clone(t.attachments);
    if (t.threadOps) {
      for (var k in t.threadOps) {
        if (Object.prototype.hasOwnProperty.call(t.threadOps, k)) v.threadOps[k] = clone(t.threadOps[k]);
      }
    }
    if (t.outboxSeed && t.outboxSeed.length && !this._s.session.sync.outbox.length) {
      this._s.session.sync.outbox = clone(t.outboxSeed);
    }
    if (t.syncSeed) {
      if (t.syncSeed.transport) this._s.session.sync.transport = t.syncSeed.transport;
      if (t.syncSeed.domain) this._s.session.sync.domain = t.syncSeed.domain;
    }
  };

  /* Seed-time runtime write. Identical to setRuntime but silent, because seeding happens inside
   * a view() read and must not notify subscribers mid-render. */
  Store.prototype.setRuntimeQuiet = function (threadId, key, value) {
    var v = this._s.view[threadId];
    if (!v || !v.runtime) return;
    v.runtime[key] = value;
  };

  /* Read one thread-local runtime field, falling back to the project default. */
  Store.prototype.runtime = function (threadId, key) {
    var rt = this.view(threadId).runtime;
    if (key === undefined) return rt;
    return rt[key] !== undefined ? rt[key] : this._s.session.defaults[key];
  };

  /* Write one thread-local runtime field. Applies to this thread and future turns only. */
  Store.prototype.setRuntime = function (threadId, key, value) {
    var rt = this.view(threadId).runtime;
    if (rt[key] === value) return;
    rt[key] = value;
    this._emit(['view.runtime']);
  };

  Store.prototype.setView = function (threadId, key, value) {
    var v = this.view(threadId);
    v[key] = value;
    this._emit(['view.' + key]);
  };

  Store.prototype.touchView = function (key) {
    this._emit(['view.' + (key || 'any')]);
  };

  Store.prototype.subscribe = function (fn) {
    this._subs.push(fn);
    var self = this;
    return function () {
      var i = self._subs.indexOf(fn);
      if (i >= 0) self._subs.splice(i, 1);
    };
  };

  /* Batch several mutations into one notification. Used by remount and by the
   * scripted-reply player so subscribers do not see torn intermediate state. */
  Store.prototype.batch = function (fn) {
    var wasBatching = this._batching;
    this._batching = true;
    try { fn(); } finally {
      this._batching = wasBatching;
      if (!wasBatching) {
        var keys = Object.keys(this._pending);
        this._pending = {};
        if (keys.length) this._notify(keys);
      }
    }
  };

  Store.prototype._emit = function (keys) {
    if (this._batching) {
      for (var i = 0; i < keys.length; i++) this._pending[keys[i]] = true;
      return;
    }
    this._notify(keys);
  };

  Store.prototype._notify = function (keys) {
    var s = this._s;
    var list = this._subs.slice();
    for (var i = 0; i < list.length; i++) {
      try { list[i](s, keys); } catch (e) {
        if (global.console && console.error) console.error('[pmx-store] subscriber failed', e);
      }
    }
  };

  /* ---- Persistence. This is how "simulated restart or crash" is demonstrated. ----
   * snapshot() serializes; rehydrate() restores. A hard reload between them proves
   * draft, questionnaire, anchor, Lens, and selector state came back. */
  Store.prototype.snapshot = function () {
    try {
      var payload = { v: LS_VERSION, at: new Date().toISOString(), state: clone(this._s) };
      global.localStorage.setItem(LS_KEY, JSON.stringify(payload));
      return true;
    } catch (e) { return false; }
  };

  Store.prototype.rehydrate = function () {
    try {
      var raw = global.localStorage.getItem(LS_KEY);
      if (!raw) return false;
      var payload = JSON.parse(raw);
      if (!payload || payload.v !== LS_VERSION || !payload.state) return false;
      var base = defaultState();
      var s = payload.state;
      /* Merge defensively so a stale snapshot missing a newer key still boots. */
      base.ui = Object.assign(base.ui, s.ui || {});
      base.session = Object.assign(base.session, s.session || {});
      var fresh = defaultState().session;
      var incomingSession = s.session || {};
      /* Nested session objects are merged key-by-key against a fresh default, so a snapshot
       * written before a sub-key existed still boots with that key present rather than
       * undefined. Listing them explicitly (rather than deep-merging) keeps the set of
       * persisted session slices visible in one place. */
      ['defaults', 'favorites', 'search', 'threadHistory', 'artifact', 'spell', 'demo',
       'recents', 'providerSetup', 'sync', 'ops', 'notify']
        .forEach(function (slice) {
          base.session[slice] = Object.assign(fresh[slice], incomingSession[slice] || {});
        });
      base.view = {};
      var sv = s.view || {};
      for (var tid in sv) {
        if (!Object.prototype.hasOwnProperty.call(sv, tid)) continue;
        var d = defaultView();
        var incoming = sv[tid] || {};
        for (var k in d) if (Object.prototype.hasOwnProperty.call(incoming, k)) d[k] = incoming[k];
        base.view[tid] = d;
      }
      this._s = base;
      this._notify(['ui', 'session', 'view']);
      return true;
    } catch (e) { return false; }
  };

  Store.prototype.clearPersisted = function () {
    try { global.localStorage.removeItem(LS_KEY); return true; } catch (e) { return false; }
  };

  Store.prototype.reset = function () {
    var d = this._data;
    this._s = defaultState();
    this._data = d;
    this._notify(['ui', 'session', 'view']);
  };

  global.PMXStore = { create: function () { return new Store(); }, defaultView: defaultView };
})(window);
