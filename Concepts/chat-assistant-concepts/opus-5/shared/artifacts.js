/* PMX artifacts — Opus 5
 * Global: window.PMXArtifacts -> ctx.services.artifacts
 *
 * The left-of-Chat artifact workspace: a sibling region OUTSIDE the transcript and composer,
 * with a real per-artifact state machine.
 *
 * WHY A SERVICE AND NOT A RENDERER
 * --------------------------------
 * Eight window concepts place this surface in eight different ways — a second ledger column, the
 * left two-thirds of a split desk, a fourth accordion pane, a side-sheet at a detent, a floating
 * capsule. What must NOT vary is when an artifact is loading, when it is ready, what "update"
 * means, and whether a failure is recoverable. That is this file. Presentation belongs to the
 * window; the window asks `stateOf(id)` and draws its own answer.
 *
 * IDENTITY-NATIVE OPENS
 * ---------------------
 * open() takes an artifact id, never a path. Runtime_Artifacts_Panel.md (RAP-008) makes
 * identity the canonical route for generated artifacts and keeps path-based opens for concrete
 * workspace files; a concept that opened `docs/foo.md` directly would be modelling the wrong
 * contract. The supplied demo records carry `projectPath` for display only.
 *
 * DETERMINISM
 * -----------
 * Load latency is a fixed per-artifact constant, not a random or wall-clock value, so an
 * automated probe and a visual capture reproduce the same frames. Nothing here reads Date.now()
 * for identity; the only timers are the simulated transports.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  var _store = null;
  var _data = null;
  var _subs = [];
  var _timers = {};

  /* Simulated transport latency per state, in ms. Deliberately short enough that a reviewer is
   * not kept waiting and long enough that the loading state is genuinely observable. */
  var LOAD_MS = 520;
  var UPDATE_MS = 340;

  function bind(store, data) { _store = store || _store; _data = data || _data; }
  function store() { if (!_store) _store = global.PMXStore.create(); return _store; }

  function slice() {
    var s = store().get('session.artifact');
    if (!s) { store().set('session.artifact', { open: false, activeId: null, byId: {} }); s = store().get('session.artifact'); }
    if (!s.byId) s.byId = {};
    return s;
  }

  function notify() {
    var list = _subs.slice();
    for (var i = 0; i < list.length; i++) {
      try { list[i](slice()); } catch (e) {
        if (global.console && console.error) console.error('[pmx-artifacts] subscriber failed', e);
      }
    }
  }

  /* Every state write goes through here so the store emit and the local notify can never drift.
   * The store key is coarsened to 'session.artifact', which is what window modules subscribe to. */
  function put(id, patch) {
    var s = slice();
    var cur = s.byId[id] || { state: 'idle', error: null, scrollTop: 0, loadedAt: null };
    s.byId[id] = Object.assign(cur, patch);
    store().set('session.artifact.byId', s.byId);
    notify();
  }

  /* ---- the catalogue -----------------------------------------------------------------
   * Metadata for the supplied records comes from the demo data; bodies live here because a
   * body is a rendering fixture, not part of the supplied dataset (demoData.json is frozen and
   * byte-identical). The five entries cover every category the packet requires a concept to
   * demonstrate: code/file, multi-file diff, image or test screenshot, test report, and a
   * structured document. */
  var CATALOG = [
    {
      id: 'artifact-diff',
      title: 'Assistant Chat change set',
      kind: 'multi_file_diff',
      subtitle: '3 files · +184 −67',
      projectPath: 'worktree: chat-selector-redesign',
      /* The designated UPDATE demo: its counts change in place while it is open. */
      supportsUpdate: true,
      files: [
        { path: 'shared/selectors.js', additions: 92, deletions: 18, status: 'edited' },
        { path: 'shared/access-controls.css', additions: 61, deletions: 39, status: 'created' },
        { path: 'tests/interaction-probes.js', additions: 31, deletions: 10, status: 'edited' }
      ]
    },
    {
      id: 'artifact-source',
      title: 'shared/selectors.js',
      kind: 'source',
      subtitle: 'Changed range highlighted',
      projectPath: 'shared/selectors.js',
      lines: [
        { n: 104, text: '  Selectors.prototype.openFor = function (kind, anchor) {' },
        { n: 105, text: '    var runtime = this.runtimeFor(this.activeThreadId());', hot: true },
        { n: 106, text: '    if (kind === \'model\') return this.openModel(anchor, runtime);', hot: true },
        { n: 107, text: '    if (kind === \'access\') return this.openAccess(anchor, runtime);', hot: true },
        { n: 108, text: '    return this.openPlain(anchor, kind, runtime);' },
        { n: 109, text: '  };' }
      ]
    },
    {
      id: 'artifact-preview',
      title: 'Provider selector preview',
      kind: 'image',
      subtitle: 'Captured at 975 px · Glass Dark',
      projectPath: 'artifacts/provider-selector-975.png',
      /* The designated ERROR demo, so retry is genuinely exercisable rather than described. */
      failsFirstLoad: true
    },
    {
      id: 'artifact-test',
      title: 'Interaction verification report',
      kind: 'test_report',
      subtitle: '18 checks · 1 skipped',
      projectPath: 'artifacts/interaction-verification.json',
      rows: [
        { name: 'Pinned history clears the transcript at 520', result: 'pass' },
        { name: 'Full pin demotes to compact under the floor', result: 'pass' },
        { name: 'Artifact opens left of the composer rectangle', result: 'pass' },
        { name: 'Composer draft survives a question flow', result: 'pass' },
        { name: 'History and artifact coexist at 1200', result: 'pass' },
        { name: 'Pop-out preserves pin density', result: 'skipped', note: 'covered by the width sweep' }
      ]
    },
    {
      id: 'artifact-handoff',
      title: 'Implementation impact handoff',
      kind: 'document',
      subtitle: 'Markdown · 4 sections',
      projectPath: 'docs/assistant-chat-impact-handoff.md',
      sections: [
        { heading: 'Scope', body: 'Provider settings and Assistant Chat access controls. PMConcept7 and Plans are read-only references throughout.' },
        { heading: 'Route model', body: 'Provider, account and model are three separate axes. The same model under two accounts is two distinct routes, and the effective route is shown whenever it differs from the requested one.' },
        { heading: 'Access profiles', body: 'Ask for approval, Auto accept edits, Auto, and Full Access. Conversation mode and access profile stay separate axes; a permissive profile narrowed by the mode reports the effective limit rather than the request.' },
        { heading: 'Portability', body: 'Every surface stays inside the Slint 1.17.1 envelope: measured height transitions with a fallback, no backdrop-filter carrying information, no property-animation as the only signal.' }
      ]
    }
  ];

  var BY_ID = {};
  CATALOG.forEach(function (a) { BY_ID[a.id] = a; });

  /* Supplied demo records are surfaced too, so a thread that references its own artifact opens
   * something real rather than a dead id. They render through the document renderer. */
  function catalogFor(id) {
    if (BY_ID[id]) return BY_ID[id];
    if (_data && _data.threads) {
      for (var i = 0; i < _data.threads.length; i++) {
        var list = _data.threads[i].artifacts || [];
        for (var j = 0; j < list.length; j++) {
          if (list[j].id === id) {
            return {
              id: id, title: list[j].title, kind: 'document',
              subtitle: list[j].kind, projectPath: list[j].projectPath,
              sections: [{ heading: list[j].title, body: 'Supplied demo record. Opened by identity; ' + list[j].projectPath + ' is shown for provenance only.' }]
            };
          }
        }
      }
    }
    return null;
  }

  function list() { return CATALOG.slice(); }

  function clearTimer(id) {
    if (_timers[id]) { global.clearTimeout(_timers[id]); delete _timers[id]; }
  }

  /* ---- the state machine -------------------------------------------------------------
   *   idle ──open──> loading ──> ready
   *   ready ──update──> updating ──> ready
   *   loading ──(failsFirstLoad)──> error ──retry──> loading
   *
   * A loading state that cannot resolve is called out by the packet as a hard failure, so every
   * transition here terminates: the error path is entered only once per artifact and a retry
   * always succeeds. */
  function open(id) {
    var def = catalogFor(id);
    if (!def) return false;
    var s = slice();
    store().patch({ 'session.artifact.open': true, 'session.artifact.activeId': id });

    var rec = s.byId[id];
    if (rec && rec.state === 'ready') { notify(); return true; }

    clearTimer(id);
    put(id, { state: 'loading', error: null });
    _timers[id] = global.setTimeout(function () {
      delete _timers[id];
      var prior = slice().byId[id] || {};
      if (def.failsFirstLoad && !prior.hasFailedOnce) {
        put(id, { state: 'error', hasFailedOnce: true, error: 'The capture could not be read. The projector index row is stale.' });
      } else {
        put(id, { state: 'ready', error: null });
      }
    }, LOAD_MS);
    return true;
  }

  function retry(id) {
    var rec = slice().byId[id];
    if (!rec || rec.state !== 'error') return false;
    clearTimer(id);
    put(id, { state: 'loading', error: null });
    _timers[id] = global.setTimeout(function () {
      delete _timers[id];
      put(id, { state: 'ready', error: null });
    }, LOAD_MS);
    return true;
  }

  /* An in-place refresh of an already-open artifact — the diff's counts changing while the user
   * watches. Distinct from loading because the previous body stays on screen throughout. */
  function update(id, patch) {
    var rec = slice().byId[id];
    if (!rec || rec.state !== 'ready') return false;
    var def = catalogFor(id);
    clearTimer(id);
    put(id, { state: 'updating' });
    _timers[id] = global.setTimeout(function () {
      delete _timers[id];
      if (def && patch) Object.assign(def, patch);
      put(id, { state: 'ready', updatedTick: (rec.updatedTick || 0) + 1 });
    }, UPDATE_MS);
    return true;
  }

  function switchTo(id) {
    if (!catalogFor(id)) return false;
    return open(id);
  }

  function close() {
    store().patch({ 'session.artifact.open': false });
    notify();
    return true;
  }

  function activeId() { return slice().activeId; }
  function isOpen() { return !!slice().open; }
  function stateOf(id) {
    var rec = slice().byId[id];
    return rec ? rec.state : 'idle';
  }
  function errorOf(id) {
    var rec = slice().byId[id];
    return rec ? rec.error : null;
  }

  /* Scroll position is per artifact so switching away and back restores where you were —
   * the panel scrolls independently of the transcript, which is a stated requirement. */
  function scrollTop(id, value) {
    if (value === undefined) { var r = slice().byId[id]; return r ? (r.scrollTop || 0) : 0; }
    put(id, { scrollTop: value });
  }

  function reset() {
    for (var k in _timers) if (Object.prototype.hasOwnProperty.call(_timers, k)) global.clearTimeout(_timers[k]);
    _timers = {};
    store().patch({
      'session.artifact.open': false,
      'session.artifact.activeId': null,
      'session.artifact.byId': {}
    });
    /* Mutable catalogue entries are restored too, or a reset would leave the diff carrying the
     * counts a previous demo run pushed into it. */
    CATALOG[0].files = [
      { path: 'shared/selectors.js', additions: 92, deletions: 18, status: 'edited' },
      { path: 'shared/access-controls.css', additions: 61, deletions: 39, status: 'created' },
      { path: 'tests/interaction-probes.js', additions: 31, deletions: 10, status: 'edited' }
    ];
    CATALOG[0].subtitle = '3 files · +184 −67';
    notify();
  }

  function subscribe(fn) {
    _subs.push(fn);
    return function () { var i = _subs.indexOf(fn); if (i >= 0) _subs.splice(i, 1); };
  }

  global.PMXArtifacts = {
    bind: bind,
    list: list,
    get: catalogFor,
    open: open,
    switchTo: switchTo,
    retry: retry,
    update: update,
    close: close,
    isOpen: isOpen,
    activeId: activeId,
    stateOf: stateOf,
    errorOf: errorOf,
    scrollTop: scrollTop,
    reset: reset,
    subscribe: subscribe,
    LOAD_MS: LOAD_MS,
    UPDATE_MS: UPDATE_MS
  };
})(window);
