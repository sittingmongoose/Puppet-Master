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

  /* ---- context admission receipt body -------------------------------------------------
   * The Context ring's `More details` needs a catalogue record to open (D7). A receipt copied
   * once and frozen would be a stale claim about live context, which the packet rules out by
   * making Context Lens render the admission receipt rather than a generic dump, so these
   * sections are re-projected from PMXContextAdmit on every lookup. The fallback figures are
   * the fixture's own for thread-01 — 7,620 of 128,000 with a warm cache, read off the last
   * message runtime — so the record is real before any service is bound. */
  var FIXTURE_INCLUDED = [
    'Current objective', 'Recent messages', 'Scoped project instructions', 'Persona capsule',
    'Selected tools', '2 prior-thread excerpts', '1 attachment representation'
  ];
  var FIXTURE_OMITTED = [
    'Older messages represented by summary', '17 unused tool schemas', 'Unrelated logs',
    'Memories below relevance threshold'
  ];

  /* These two sections never vary with the live receipt. They state what the receipt is, and
   * they are the visible half of the boundary the packet draws around this surface: no raw
   * secrets, no FileSafe policy body, no system prompt, no internal registry dump. */
  var RECEIPT_POLICY = [
    { heading: 'Provenance and removal',
      body: 'Every admitted row carries its provenance, and an admitted historical excerpt can be removed from this receipt without deleting it from the thread.' },
    { heading: 'What this receipt never shows',
      body: 'Raw secrets, the full FileSafe policy, full system prompts and internal registry dumps are outside the receipt by construction. This is an admission record, not a token dump.' }
  ];

  function num(n) { return Number(n || 0).toLocaleString(); }
  function sentences(list, empty) { return list.length ? list.join('. ') + '.' : empty; }

  /* Guarded peer lookup. The Phase B services are written concurrently and load order is not
   * guaranteed, so an absent or throwing PMXContextAdmit degrades to the fixture body instead
   * of taking the artifact workspace down with it. */
  function liveReceipt() {
    var CA = global.PMXContextAdmit;
    if (!CA || typeof CA.receipt !== 'function' || !_store) return null;
    try { return CA.receipt(_store.get('session.activeThreadId')); } catch (e) { return null; }
  }

  function contextSections(receipt) {
    var pressure = '7,620 of 128,000 tokens admitted for this turn. The prompt cache is warm.';
    var inc = FIXTURE_INCLUDED, omit = FIXTURE_OMITTED;
    if (receipt) {
      var p = receipt.pressure || {};
      pressure = num(p.used) + ' of ' + num(p.limit) + ' tokens admitted for this turn. The prompt cache is '
        + ((receipt.cache && receipt.cache.state) || 'warm') + '.';
      inc = (receipt.included || []).map(function (r) { return r.label; });
      omit = (receipt.omitted || []).map(function (r) { return r.label + ' — ' + r.reason; });
    }
    return [
      { heading: 'Pressure', body: pressure },
      { heading: 'Included', body: sentences(inc, 'Nothing is admitted for this turn yet.') },
      { heading: 'Left out', body: sentences(omit, 'Nothing was left out of this turn.') }
    ].concat(RECEIPT_POLICY);
  }

  /* ---- the catalogue -----------------------------------------------------------------
   * Metadata for the supplied records comes from the demo data; bodies live here because a
   * body is a rendering fixture, not part of the supplied dataset. (This used to say demoData.json
   * was frozen and byte-identical. The freeze was retired when DEMO_SCENARIO_MANIFEST.json was
   * instantiated; what still holds, and is asserted, is that the generator reproduces the corpus
   * byte-identically across runs.) The five entries cover every category the packet requires a concept to
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
      /* The three files and their line counts come from DEMO_SCENARIO_MANIFEST.json `diff_files`
       * (92/18, 61/39, 31/10, and the +184 -67 total above). The PATHS are deliberately not the
       * manifest's: it names `threads/provider-selector.js`, `threads/access-controls.css` and
       * `verification/interaction-probes.mjs`, and none of those exist in this workspace — the demo
       * is a change set against THIS concept, so a diff naming files it does not contain would be a
       * diff of an imaginary repository. They are mapped one-for-one onto the real files that do the
       * same jobs here. Written down because a checker comparing the manifest to the corpus finds
       * three paths missing and cannot tell a deliberate localisation from an omission. */
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
    },
    {
      id: 'artifact-test',
      title: 'Interaction verification report',
      kind: 'test_report',
      subtitle: '18 checks · 1 skipped',
      projectPath: 'artifacts/interaction-verification.json',
      /* The final-verification state the packet requires to be visible: a result, the thing that
       * was verified, and both clocks. Elapsed is wall time and worked is attributed time; they
       * differ because the run waited on an approval, and reporting only one of them would
       * overstate or understate the cost of the turn. */
      verification: {
        result: 'passed',
        note: 'Updated provider settings screen renders correctly',
        /* 94 and 71 seconds, matching the corpus's own completion receipt and the manifest's
         * `elapsed: "1m 34s"`. These read 5640 and 4210 - the same string misparsed as 1h34m - so the
         * artifact reported a run an hour and a half long while the goal beside it reported a minute
         * and a half of the same work. */
        elapsedSeconds: 94,
        workedSeconds: 71
      },
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
      /* D7. `More details` in the Context ring opened `context-detail`, an id no catalogue held,
       * so the call fell through to a legacy editor tab instead of the left artifact workspace.
       * This is that record under an id the catalogue actually carries. Its sections are rebuilt
       * per lookup by contextSections(); the literal here is only the pre-bind body. */
      id: 'artifact-context',
      title: 'Context admission receipt',
      kind: 'document',
      subtitle: 'Admission record · not a token dump',
      projectPath: 'context: Tastebook — planning chat',
      sections: contextSections(null)
    },
    {
      /* Crew synthesis. The packet's artifact taxonomy has four categories, so a Crew report is
       * catalogued as a document; the panel dispatches on the `crew` payload rather than on the
       * category, because a heading-and-paragraph renderer cannot show members, routes, waves,
       * a shared board and a parent reducer.
       *
       * The content is the fixture's own `sg-tastebook` review group re-expressed as a Crew —
       * same three members, same tasks, same states — with routes drawn from the two-accounts
       * catalogue so the "one model, two accounts, two routes" rule is visible here too. This
       * is the FALLBACK body: the panel prefers PMXCrew.of(threadId) whenever a Crew is actually
       * running in the thread. Ids follow the conventions PMXCrew owns. */
      id: 'artifact-crew',
      title: 'Interface review crew — synthesis',
      kind: 'document',
      subtitle: 'Crew · 3 members · 2 waves',
      projectPath: 'crew: Tastebook — planning chat',
      crew: {
        id: 'crew-thread-01-crew-interface-review',
        templateId: 'crew-interface-review',
        name: 'Interface review crew',
        members: [
          { id: 'm-flow-reviewer', name: 'Flow reviewer', role: 'Check first-session sequence',
            route: 'Anthropic — Work · Opus 5', state: 'waiting for parent', resultRef: null },
          { id: 'm-import-reviewer', name: 'Import reviewer', role: 'Check import recovery states',
            route: 'OpenAI — Team · GPT-5.6 Pro', state: 'complete', resultRef: 'diff-tastebook' },
          { id: 'm-content-reviewer', name: 'Content reviewer', role: 'Check user-facing language',
            route: 'Anthropic — Personal · Sonnet 5', state: 'complete', resultRef: 'artifact-tastebook-flow' }
        ],
        waves: [['m-flow-reviewer', 'm-import-reviewer'], ['m-content-reviewer']],
        board: [
          { at: '2026-07-29T14:41:00Z', memberId: 'm-import-reviewer',
            text: 'Blocked-import recovery has three states, not two. The retry path needs its own copy.' },
          { at: '2026-07-29T14:52:00Z', memberId: 'm-content-reviewer',
            text: 'The skip path currently reads as a failure. Reworded against the onboarding plan.' },
          { at: '2026-07-29T14:58:00Z', memberId: 'm-flow-reviewer',
            text: 'Holding the sequence review until the import question is answered.' }
        ],
        reducer: { state: 'waiting', synthesisRef: 'artifact-tastebook-flow' },
        reason: '2 concurrent across 2 waves · provider allowance and verification reserve'
      }
    }
  ];

  var BY_ID = {};
  /* CATALOG carried `artifact-test` TWICE, and every consequence of that was silent. BY_ID is
   * last-wins, so the first record — the one without the verification block — was dead. `list()`
   * returned the duplicate, so any switcher rendering it showed the same report in two rows. And
   * `PMXDemo.artifact.switch` walks list() by index, so from artifact-handoff it advanced onto the
   * second copy and back again: a two-cycle from which `artifact-context` and `artifact-crew` were
   * UNREACHABLE. The `artifact` suite asserted `list().length >= 7`, which the duplicate satisfied,
   * so the count that should have caught this was the thing hiding it.
   *
   * The records are merged and this loop now refuses a repeat id rather than absorbing it. A
   * catalogue with two rows claiming one id has no correct interpretation, so the honest response
   * is to fail loudly at load. */
  CATALOG.forEach(function (a) {
    if (BY_ID[a.id]) throw new Error('PMXArtifacts: duplicate catalog id ' + a.id);
    BY_ID[a.id] = a;
  });

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
  /* forceReady(id) -> boolean
   *
   * Collapses the simulated load latency and lands `ready` in the SAME tick, cancelling the pending
   * timer so it cannot fire afterwards and re-enter `loading`.
   *
   * This exists because the demo director's `artifact.ready` trigger used to schedule an empty 0 ms
   * callback and then leave the artifact in `loading` for the full LOAD_MS: the trigger claimed to
   * produce a ready artifact and did not. A director step that names a state must ARRIVE at that
   * state, both for the reviewer clicking it and for the probe asserting it, so the honest fix is a
   * real synchronous transition rather than a shorter timeout.
   *
   * It deliberately ignores `failsFirstLoad`: a caller asking for ready is asking for ready, and the
   * error path has its own director trigger. */
  function forceReady(id) {
    var def = catalogFor(id);
    if (!def) return false;
    clearTimer(id);
    put(id, { state: 'ready', error: null, loadedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z') });
    return true;
  }

  /* frame(windowId) -> { switcher }
   *
   * The one thing the artifact panel must know about its host without knowing its layout. Each
   * window places the workspace differently and therefore needs a different SWITCHER idiom — the
   * ledger has a row list, the split desk has desk tabs, the focus column has a marker gutter, the
   * command-bar concept has no artifact header at all and fuses its controls into the bottom band.
   * Returning the idiom by name keeps placement with the window and body rendering with the panel,
   * which is what lets one body renderer serve eight frames.
   *
   * An unknown id falls back to `rows`: a list of artifact titles is the only switcher that works
   * in any container, so an unmapped window degrades to something usable rather than to nothing. */
  var FRAMES = {
    w1: { switcher: 'rows' },        /* ledger row list at the artifact head */
    w2: { switcher: 'tabs' },        /* desk tabs across the head */
    w3: { switcher: 'markers' },     /* vertical marker list in the artifact's own left gutter */
    w4: { switcher: 'segments' },    /* pane sub-header segmented control */
    w5: { switcher: 'band' },        /* the bottom command band owns the switcher; no artifact header */
    w6: { switcher: 'sheettabs' },   /* the sheet tab row */
    w7: { switcher: 'railpopup' },   /* a rail icon opens a long-list popup */
    w8: { switcher: 'capsules' }     /* a small capsule strip above the artifact */
  };

  function frame(windowId) {
    return FRAMES[windowId] || { switcher: 'rows' };
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
    forceReady: forceReady,
    frame: frame,
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
