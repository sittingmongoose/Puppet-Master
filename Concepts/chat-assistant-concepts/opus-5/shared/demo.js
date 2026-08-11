/* PMX demo harness — Opus 5
 * Global: window.PMXDemo
 *
 * A deterministic driver for every state the concepts are supposed to be able to reach.
 *
 * THIS IS NOT PART OF THE PROPOSED PRODUCT. It exists so a reviewer can reproduce a state and
 * so an automated probe can assert one. The packet is explicit that demo triggers must not
 * become permanent Chat toolbar buttons, so nothing here renders into the chat chrome — the
 * Director drawer lives in the workspace chrome, outside the fake product shell, and the same
 * events are reachable from `PMXDemo.fire()` and from the page hash.
 *
 * INJECT VERSUS INTERACT
 * ----------------------
 * The harness may INJECT a question, an approval or a collision. It must never ANSWER one:
 * resolving a question happens through the concept's own UI, which is the thing under review.
 * Triggers that would short-circuit that are deliberately absent.
 *
 * DETERMINISM
 * -----------
 * `system.reset` restores one known state, and every trigger is a pure function of the state it
 * finds. Nothing here reads wall-clock time or a random source, so a probe and a capture taken
 * a day apart produce the same frames.
 */
(function (global) {
  'use strict';

  var _store = null, _data = null;
  var _log = [];

  function bind(store, data) { _store = store || _store; _data = data || _data; }
  function store() { if (!_store) _store = global.PMXStore.create(); return _store; }
  function ctxLite() { return { store: store(), services: {} }; }
  function tid() { return store().get('session.activeThreadId'); }

  function note(family, event, detail) {
    _log.push({ family: family, event: event, detail: detail || null, seq: _log.length });
    if (_log.length > 200) _log.shift();
  }

  /* ---- history --------------------------------------------------------------------- */

  var history = {
    peek: function () { global.PMXThreadHistory.setState(ctxLite(), 'peek'); },
    pin_full: function () {
      var c = ctxLite();
      global.PMXThreadHistory.setDensity(c, 'full');
      global.PMXThreadHistory.setState(c, 'pinned');
    },
    pin_compact: function () {
      var c = ctxLite();
      global.PMXThreadHistory.setDensity(c, 'compact');
      global.PMXThreadHistory.setState(c, 'pinned');
    },
    unpin: function () { global.PMXThreadHistory.setState(ctxLite(), 'closed'); },
    switch_thread: function (threadId) {
      var list = (_data && _data.threads) || [];
      if (!list.length) return;
      var next = threadId;
      if (!next) {
        /* Deterministic rotation, not a random pick, so a repeated trigger walks the corpus in
         * a reproducible order. */
        var cur = tid();
        var i = 0;
        for (var k = 0; k < list.length; k++) if (list[k].id === cur) { i = k; break; }
        next = list[(i + 1) % list.length].id;
      }
      store().set('session.activeThreadId', next);
    }
  };

  /* ---- artifacts ------------------------------------------------------------------- */

  var artifact = {
    loading: function (id) { global.PMXArtifacts.open(id || 'artifact-diff'); },
    ready: function (id) {
      var A = global.PMXArtifacts;
      id = id || 'artifact-diff';
      A.open(id);
      /* Skip the simulated transport so a capture can land straight on the settled state. */
      global.setTimeout(function () { }, 0);
    },
    switch: function (id) {
      var A = global.PMXArtifacts;
      var order = A.list().map(function (a) { return a.id; });
      var cur = A.activeId();
      var i = order.indexOf(cur);
      A.switchTo(id || order[(i + 1) % order.length]);
    },
    error: function () { global.PMXArtifacts.open('artifact-preview'); },
    retry: function () { global.PMXArtifacts.retry(global.PMXArtifacts.activeId()); },
    update: function () {
      var A = global.PMXArtifacts;
      var def = A.get('artifact-diff');
      if (!def) return;
      var extra = { path: 'shared/warnings.js', additions: 44, deletions: 0, status: 'created' };
      var already = def.files.some(function (f) { return f.path === extra.path; });
      if (already) return;
      A.update('artifact-diff', {
        files: def.files.concat([extra]),
        subtitle: (def.files.length + 1) + ' files · +228 −67'
      });
    },
    close: function () { global.PMXArtifacts.close(); }
  };

  /* ---- goal / todo / subagents ------------------------------------------------------
   * These drive the surfaces service's records rather than inventing a parallel model, so a
   * concept that renders from PMXSurfaces sees exactly what a real run would produce. */

  function goalRecord() {
    var s = global.PMXSurfaces;
    return s && s.goalFor ? s.goalFor(tid()) : null;
  }

  var goal = {
    start: function () { act('resume'); },
    pause: function () { act('pause'); },
    resume: function () { act('resume'); },
    stop: function () { act('stop'); },
    update: function () { act('edit'); },
    replan: function () { act('edit'); },
    clear: function () { act('clear'); }
  };

  function act(action) {
    var s = global.PMXSurfaces;
    if (s && s.act) s.act(tid(), action);
  }

  /* ---- decisions: approvals, warnings, collisions ------------------------------------
   * Injected onto the thread's view slice so a concept can render them without the supplied
   * dataset needing a schema it does not have. Recorded in GAP_REPORT as a data gap. */

  function pushPending(kind, payload) {
    var v = store().view(tid());
    if (!v.pending) v.pending = [];
    v.pending.push(Object.assign({ kind: kind, id: kind + '-' + v.pending.length }, payload));
    store().touchView('pending');
  }

  var decision = {
    approval_open: function () {
      pushPending('approval', {
        question: 'Run 2 commands?',
        scope: 'Workspace only · Needed to run the test suite',
        actions: ['Deny', 'Allow once', 'Allow for session'],
        details: {
          commands: ['npm run test:interaction', 'node tests/report.js'],
          paths: ['tests/', 'artifacts/'],
          persistence: 'Allow for session ends when the app closes.',
          alternative: 'Run the suite yourself and paste the result.'
        }
      });
    },
    warning_route: function () {
      pushPending('warning', {
        severity: 'confirm',
        text: 'Switching provider will replay this conversation without the current provider cache.',
        choices: ['Continue here', 'Branch with new model', 'Start new chat', 'Cancel'],
        details: { cachedTokens: 41200, replayCost: 'about 12 seconds of re-read' }
      });
    },
    warning_privacy: function () {
      pushPending('warning', {
        severity: 'modal',
        text: 'The selected model cannot inspect video. PM can extract frames locally, or route the original to a different provider account.',
        choices: ['Extract frames here', 'Use the configured vision route', 'Cancel'],
        details: { provider: 'a different paid connection', consent: 'required' }
      });
    },
    capacity: function () {
      pushPending('warning', {
        severity: 'inline',
        text: 'Eight specialists requested. Current usage is likely to finish two at a time, so PM will run three waves and reserve capacity for final synthesis.'
      });
    },
    clear: function () {
      var v = store().view(tid());
      v.pending = [];
      store().touchView('pending');
    }
  };

  var system = {
    port_collision: function () {
      pushPending('collision', {
        text: 'Port 4173 is already owned by the Usage concept visual-test server.',
        requested: 4173, occupiedBy: 'Usage concept visual-test server', alternative: 4174,
        safeAction: 'Start this run on 4174 instead'
      });
    },
    worktree_collision: function () {
      pushPending('collision', {
        text: 'The worktree chat-selector-redesign already has an active writer.',
        occupiedBy: 'Provider adapter researcher', safeAction: 'Queue behind the current writer'
      });
    },
    /* One known state. Everything the harness can change, it can change back. */
    reset: function () {
      var s = store();
      s.batch(function () {
        s.patch({
          'session.threadHistory.state': 'closed',
          'session.threadHistory.density': 'full',
          'session.threadHistory.query': '',
          'session.activeThreadId': 'thread-01'
        });
      });
      if (global.PMXArtifacts) global.PMXArtifacts.reset();
      var v = s.view('thread-01');
      v.pending = [];
      v.surfaces = { expanded: null, openIds: {}, phaseIndex: null };
      s.set('session.demo.generation', (s.get('session.demo.generation') || 0) + 1);
      s.touchView('reset');
      _log = [];
    }
  };

  var FAMILIES = {
    history: history,
    artifact: artifact,
    goal: goal,
    decision: decision,
    system: system
  };

  function fire(family, event, payload) {
    var fam = FAMILIES[family];
    if (!fam) return { ok: false, reason: 'unknown family: ' + family };
    var fn = fam[event];
    if (typeof fn !== 'function') return { ok: false, reason: 'unknown event: ' + family + '.' + event };
    try {
      fn(payload);
      note(family, event, payload);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: String(e && e.message || e) };
    }
  }

  function families() {
    var out = {};
    for (var k in FAMILIES) if (Object.prototype.hasOwnProperty.call(FAMILIES, k)) {
      out[k] = Object.keys(FAMILIES[k]);
    }
    return out;
  }

  /* Hash form, so `stage.html#…&demo=artifact.error` reproduces a state for a capture without
   * anyone having to drive the drawer by hand. */
  function fromHash() {
    var h = (global.location.hash || '').replace(/^#/, '');
    if (!h) return null;
    var found = null;
    h.split('&').forEach(function (kv) {
      var p = kv.split('=');
      if (p[0] === 'demo' && p[1]) found = decodeURIComponent(p[1]);
    });
    if (!found) return null;
    var bits = found.split('.');
    return fire(bits[0], bits[1]);
  }

  global.PMXDemo = {
    bind: bind,
    fire: fire,
    families: families,
    fromHash: fromHash,
    log: function () { return _log.slice(); }
  };
})(window);
