/* PMX store — Opus 5
 * One plain object, shallow-diffed change keys, no proxy magic.
 * The ONLY source of truth. Nothing reads semantic state from the DOM.
 * Contract: CONTRACT.md section 5.
 */
(function (global) {
  'use strict';

  var LS_KEY = 'pmx.opus5.state';
  /* v4 replaced the threadHistory open/pinned boolean pair with a four-state enum, moved the
   * runtime selectors from global session state into the per-thread view, and added the
   * artifact and spellcheck slices. rehydrate() rejects a version mismatch outright, so an
   * older snapshot is discarded rather than half-merged into a shape it does not fit. */
  var LS_VERSION = 4;

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
      run: null
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
          access: 'ask',            // ask | autoEdits | auto | full
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
        spell: { enabled: true, disabledThreads: {}, ignoredInDraft: {}, personal: [], project: [] },
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
   * is the exact bug this slice exists to fix. */
  Store.prototype.view = function (threadId) {
    var tid = threadId || this._s.session.activeThreadId;
    if (!this._s.view[tid]) this._s.view[tid] = defaultView();
    var v = this._s.view[tid];
    if (!v.runtime) v.runtime = clone(this._s.session.defaults);
    return v;
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
      ['defaults', 'favorites', 'search', 'threadHistory', 'artifact', 'spell', 'demo']
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
    this._s = defaultState();
    this._notify(['ui', 'session', 'view']);
  };

  global.PMXStore = { create: function () { return new Store(); }, defaultView: defaultView };
})(window);
