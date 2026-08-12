/* PMXBsd — Opus 5
 *
 * Back Seat Driver state, and nothing else. `01_SELECTOR_ACCESS_BSD_AND_WARNINGS.md:75-107` gives
 * BSD three modes, two scopes, and ten visual states; this module owns all three axes as DATA so
 * that eight window concepts and eight thread concepts can each draw the same truth in their own
 * register. No DOM, no class names, no copy beyond the prose enum labels a renderer must not
 * reinvent (CONTRACT section 8.3 forbids showing a raw `duplicate-suppressed` to a user).
 *
 * Three properties of the packet are enforced here in code rather than promised in prose, because
 * each of them is the kind of rule a renderer would otherwise quietly break:
 *
 * 1. "read-only by default" — every record `advice()` hands out is a copy carrying
 *    `readOnly: true`. A caller that mutates what it receives changes nothing here, and there is
 *    no `addEvidence`/`applyAdvice` path at all. Advice is a suggestion; acting on it is the
 *    user's turn, taken through the ordinary controls.
 *
 * 2. "cannot widen authority" — the only runtime keys this file may write are `bsd` and
 *    `bsdScope`, and `writeRuntime()` refuses anything else. In particular BSD can never reach
 *    `runtime.access`: turning the reviewer on must not hand the agent more permission than the
 *    user granted. The whitelist is the reason a future edit cannot introduce that path by
 *    accident.
 *
 * 3. "cannot block the primary turn when unavailable" — this module contains no reference to
 *    PMXRuntime whatsoever. `unavailable`, `timeout` and `quota-limited` are therefore states
 *    that a renderer displays and that nothing in the send path consults. The absence is the
 *    guarantee; a Phase G grep asserts it.
 *
 * The `auto-active` glow is bound to a real PMXObservable op (`bsd-<threadId>`, kind `bsd`).
 * SHARED_PROCESS_RULES forbids a second progress system, and the motion contract only permits an
 * indefinite animation while the element's `data-pmx-op` names a running op — so entering
 * `auto-active` starts the op, leaving it finishes the op, and `visualState()` degrades a stale
 * `auto-active` back to `auto-idle` when the op is gone. A glow that outlives its work is not
 * reachable.
 *
 * Contract: CONTRACT.md section 5 (store owns semantic state), section 8.3 (prose enums).
 */
(function (global) {
  'use strict';

  /* The ten visual states, verbatim ids for the ten rows of `01_...:94-105`. `evaluate()` accepts
   * exactly these and `visualState()` returns exactly one of them, so a concept can switch on the
   * literal without a default branch that silently swallows a typo. */
  var STATES = ['off', 'auto-idle', 'auto-active', 'on', 'silent', 'advice',
                'duplicate-suppressed', 'timeout', 'unavailable', 'quota-limited'];

  /* Prose for each state. A renderer that needs words uses these; the ids never reach a user. */
  var STATE_LABELS = {
    'off': 'Off',
    'auto-idle': 'Auto idle',
    'auto-active': 'Auto actively evaluating',
    'on': 'On',
    'silent': 'Silent result',
    'advice': 'Advice available',
    'duplicate-suppressed': 'Duplicate suppressed',
    'timeout': 'Timed out',
    'unavailable': 'Unavailable',
    'quota-limited': 'Quota limited'
  };

  /* Selector rows, verbatim from `01_...:79-90`. Exported for the same reason PMXAccess exports
   * PROFILES: the label text is packet copy, so the selector must not retype it. */
  var MODES = [
    { id: 'off', label: 'Off' },
    { id: 'auto', label: 'Auto \u2014 system default' },
    { id: 'on', label: 'On' }
  ];
  var SCOPES = [
    { id: 'turn', label: 'This turn' },
    { id: 'thread', label: 'This thread' }
  ];

  /* The complete set of runtime keys this module is permitted to write. See header note 2. */
  var WRITABLE_RUNTIME_KEYS = { bsd: true, bsdScope: true };

  /* States that describe the reviewer's availability rather than its opinion. They survive a mode
   * projection: an `unavailable` service is still unavailable while the user holds the selector
   * on manual, and pretending otherwise would make the chip lie. */
  var SERVICE_STATES = { 'unavailable': true, 'timeout': true, 'quota-limited': true };

  /* States that report the outcome of one evaluation. Legal under `auto` and under manual `on`;
   * meaningless under `off`, which has no evaluation to report. */
  var OUTCOME_STATES = { 'silent': true, 'advice': true, 'duplicate-suppressed': true };

  /* The advice text the fixture authors for thread-01. Used as the default when a caller asks for
   * the `advice` state without supplying its own detail, so a scripted demo run and a test land on
   * the same string instead of an invented placeholder. */
  var DEFAULT_ADVICE = 'The port change was not reflected in the test config.';

  var store = null;
  var seq = 0;

  /* Turn-scoped overrides live in module state, deliberately. A `This turn` choice is bounded by
   * the turn that is running now: it must not survive a reload, and it must not be persisted into
   * the view slice whose documented shape is `{state, advice, lastAt, scope}`. Keyed by thread so
   * two threads can each hold their own turn override. */
  var turnHolds = {};

  function bind(s) {
    store = s || null;
    return api;
  }

  function nowIso() { return new Date().toISOString(); }

  function isState(v) {
    for (var i = 0; i < STATES.length; i++) if (STATES[i] === v) return true;
    return false;
  }

  function isMode(v) {
    for (var i = 0; i < MODES.length; i++) if (MODES[i].id === v) return true;
    return false;
  }

  function isScope(v) {
    for (var i = 0; i < SCOPES.length; i++) if (SCOPES[i].id === v) return true;
    return false;
  }

  /* The view's `bsd` slice, or null when unbound. Every reader tolerates null so a service bound
   * after the corpus loads still answers neutrally during boot rather than throwing into a mount. */
  function slice(threadId) {
    if (!store || !threadId) return null;
    var v = store.view(threadId);
    if (!v) return null;
    if (!v.bsd) v.bsd = { state: 'auto-idle', advice: [], lastAt: null, scope: 'thread' };
    if (!v.bsd.advice) v.bsd.advice = [];
    return v.bsd;
  }

  /* The single write path into thread runtime. See header note 2: the whitelist is what makes
   * "BSD cannot widen authority" a property of the code. */
  function writeRuntime(threadId, key, value) {
    if (!store || !WRITABLE_RUNTIME_KEYS[key]) return false;
    store.setRuntime(threadId, key, value);
    return true;
  }

  function announce() {
    if (store && typeof store.touchView === 'function') store.touchView('bsd');
  }

  function observable() {
    return global.PMXObservable || null;
  }

  function opIdFor(threadId) { return 'bsd-' + threadId; }

  /* Enter the glow. The op is the whole point: the renderer stamps `data-pmx-op` with this id and
   * the motion contract only lets the pulse repeat while the op runs. */
  function startOp(threadId) {
    var obs = observable();
    if (!obs || typeof obs.start !== 'function') return;
    if (typeof obs.isRunning === 'function' && obs.isRunning(opIdFor(threadId))) return;
    obs.start({ id: opIdFor(threadId), kind: 'bsd', label: 'Reviewing the turn' });
  }

  /* Leave the glow. Called on every transition out of `auto-active`, including a mode change and
   * a turn-scope revert, so no path can leave an op running behind a chip that no longer glows. */
  function stopOp(threadId, landedState) {
    var obs = observable();
    if (!obs || typeof obs.get !== 'function') return;
    var op = obs.get(opIdFor(threadId));
    if (!op) return;
    if (op.state === 'running' || op.state === 'queued' || op.state === 'blocked') {
      obs.finish(opIdFor(threadId), { outcome: landedState || 'auto-idle' });
    }
  }

  /* Fold a fixture-authored or legacy advice record up to the full shape, in place. Done lazily on
   * read rather than at seed time because `store._seedView` copies the fixture verbatim and must
   * not know this module's record shape. In place, because `dismiss()` needs the id to be stable
   * across reads. */
  function normalizeAdvice(list) {
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (!r || typeof r !== 'object') { list.splice(i, 1); i--; continue; }
      if (!r.id) { seq += 1; r.id = 'bsd-advice-' + Date.now().toString(36) + '-' + seq.toString(36); }
      if (!r.at) r.at = nowIso();
      if (r.severity !== 'caution') r.severity = r.severity === 'note' ? 'note' : 'caution';
      r.text = r.text ? String(r.text) : '';
      if (!r.evidenceRefs || typeof r.evidenceRefs.length !== 'number') r.evidenceRefs = [];
      r.readOnly = true;
    }
    return list;
  }

  function mode(threadId) {
    if (!store || !threadId) return 'auto';
    var m = store.runtime(threadId, 'bsd');
    return isMode(m) ? m : 'auto';
  }

  function scope(threadId) {
    if (!store || !threadId) return 'thread';
    var sc = store.runtime(threadId, 'bsdScope');
    if (isScope(sc)) return sc;
    var sl = slice(threadId);
    return sl && isScope(sl.scope) ? sl.scope : 'thread';
  }

  /* set(threadId, mode, scope) -> boolean.
   *
   * Refuses an unknown mode or scope outright rather than coercing to a default: a selector that
   * sends a stale id must show that it failed, not silently reset the user's reviewer. `scope` is
   * optional and keeps the current value when omitted.
   *
   * Choosing `This turn` records the value to fall back to, so `noteTurnEnd()` can restore the
   * thread's own setting exactly. It never writes `session.defaults` and never touches any runtime
   * key but `bsd` / `bsdScope`. */
  function set(threadId, nextMode, nextScope) {
    if (!store || !threadId) return false;
    if (!isMode(nextMode)) return false;
    var sc = nextScope === undefined || nextScope === null ? scope(threadId) : nextScope;
    if (!isScope(sc)) return false;

    var sl = slice(threadId);
    if (!sl) return false;

    var priorMode = mode(threadId);
    var priorScope = scope(threadId);

    if (sc === 'turn') {
      /* Only capture the fallback on the first turn-scoped set. A second one inside the same turn
       * must still revert to the thread setting, not to the first override. */
      if (!turnHolds[threadId]) {
        turnHolds[threadId] = { mode: priorScope === 'turn' ? mode(threadId) : priorMode, scope: 'thread' };
      }
    } else {
      delete turnHolds[threadId];
    }

    writeRuntime(threadId, 'bsd', nextMode);
    writeRuntime(threadId, 'bsdScope', sc);
    sl.scope = sc;

    applyModeState(threadId, sl, nextMode);
    sl.lastAt = nowIso();
    announce();
    return true;
  }

  /* Reconcile the stored state with a mode change. Switching to `off` or to manual `on` ends any
   * evaluation in flight, which is what keeps the glow bounded when a user overrides mid-review. */
  function applyModeState(threadId, sl, m) {
    if (m === 'off') {
      stopOp(threadId, 'off');
      sl.state = 'off';
      return;
    }
    if (m === 'on') {
      if (sl.state === 'auto-active' || sl.state === 'auto-idle' || sl.state === 'off') {
        stopOp(threadId, 'on');
        sl.state = 'on';
      }
      return;
    }
    if (sl.state === 'off' || sl.state === 'on') sl.state = 'auto-idle';
  }

  /* visualState(threadId) -> one of STATES.
   *
   * A projection, never a mutation: the mode is authoritative over the stored state, so a stale
   * `auto-active` left by a mode flip can never leak into a renderer. Manual `on` deliberately
   * outranks `auto-active` — the packet asks for a distinct static treatment for manual, and a
   * glow there would read as "the system decided", which is the opposite of what the user did. */
  function visualState(threadId) {
    var sl = slice(threadId);
    if (!sl) return 'off';
    var m = mode(threadId);
    var s = isState(sl.state) ? sl.state : 'auto-idle';

    if (SERVICE_STATES[s]) return s;
    if (m === 'off') return 'off';
    if (m === 'on') return OUTCOME_STATES[s] ? s : 'on';
    /* Auto. A glow is only real while its op runs; without a live op it degrades to idle. */
    if (s === 'auto-active') {
      var obs = observable();
      if (obs && typeof obs.isRunning === 'function' && !obs.isRunning(opIdFor(threadId))) return 'auto-idle';
      return 'auto-active';
    }
    if (s === 'on' || s === 'off') return 'auto-idle';
    return s;
  }

  /* opId(threadId) -> string | null. Non-null only while the evaluation op is genuinely running,
   * so a renderer that stamps `data-pmx-op` from this can never mark a dead op as live. */
  function opId(threadId) {
    if (!threadId) return null;
    var obs = observable();
    if (!obs || typeof obs.isRunning !== 'function') return null;
    return obs.isRunning(opIdFor(threadId)) ? opIdFor(threadId) : null;
  }

  /* advice(threadId) -> record[]. Copies, with `readOnly` forced true. See header note 1. */
  function advice(threadId) {
    var sl = slice(threadId);
    if (!sl) return [];
    normalizeAdvice(sl.advice);
    var out = [];
    for (var i = 0; i < sl.advice.length; i++) {
      var r = sl.advice[i];
      out.push({
        id: r.id,
        at: r.at,
        severity: r.severity,
        text: r.text,
        evidenceRefs: r.evidenceRefs.slice(),
        readOnly: true
      });
    }
    return out;
  }

  /* dismiss(threadId, adviceId) -> boolean. Dismissal is the only mutation a user can make to
   * advice, and it removes rather than edits — read-only means the text is never rewritten. When
   * the last record goes, the `advice` state has nothing left to point at and falls back to idle. */
  function dismiss(threadId, adviceId) {
    var sl = slice(threadId);
    if (!sl || !adviceId) return false;
    normalizeAdvice(sl.advice);
    for (var i = 0; i < sl.advice.length; i++) {
      if (sl.advice[i].id === adviceId) {
        sl.advice.splice(i, 1);
        if (!sl.advice.length && sl.state === 'advice') sl.state = mode(threadId) === 'on' ? 'on' : 'auto-idle';
        sl.lastAt = nowIso();
        announce();
        return true;
      }
    }
    return false;
  }

  /* evaluate(threadId, outcome, detail) -> the landed visual state, or null.
   *
   * The deterministic entry point the demo director and the test suite drive. `outcome` names one
   * of the ten states and this lands on exactly that state, aligning the mode when the state
   * implies one (`off` and `on` are modes as well as states; the auto pair requires auto). That is
   * why it returns the landed literal: an assertion can compare against `visualState()` without
   * knowing which mode the thread happened to be in.
   *
   * `detail` is optional and only read for the `advice` outcome, where it supplies
   * `{severity, text, evidenceRefs}`. Timers are deliberately absent — every transition is caused
   * by a call, so a probe never has to wait to observe a state. */
  function evaluate(threadId, outcome, detail) {
    if (!store || !threadId || !isState(outcome)) return null;
    var sl = slice(threadId);
    if (!sl) return null;

    /* `off` and `on` name a mode as well as a state, so landing on them means aligning the mode
     * first. This does not route through `set()`: `set()` preserves an outcome or service state
     * that is still true, which is right for a user flipping the selector but wrong here, where
     * the caller has named the state it wants to observe. Scope is untouched either way. */
    if (outcome === 'off' || outcome === 'on') {
      writeRuntime(threadId, 'bsd', outcome);
    } else if (outcome === 'auto-idle' || outcome === 'auto-active') {
      if (mode(threadId) !== 'auto') writeRuntime(threadId, 'bsd', 'auto');
    } else if (mode(threadId) === 'off') {
      /* An outcome cannot be reported by a reviewer that is switched off. Landing on the named
       * state therefore implies re-arming it; anything else would return a literal the renderer
       * would immediately contradict. */
      writeRuntime(threadId, 'bsd', 'auto');
    }

    if (outcome === 'auto-active') {
      startOp(threadId);
    } else {
      /* Every other outcome is a resting state, so the evaluation op ends here and the glow with
       * it. `unavailable`, `timeout` and `quota-limited` take this path too: the reviewer stops,
       * the turn is untouched. */
      stopOp(threadId, outcome);
    }

    if (outcome === 'advice') {
      var d = detail && typeof detail === 'object' ? detail : {};
      seq += 1;
      sl.advice.push({
        id: 'bsd-advice-' + Date.now().toString(36) + '-' + seq.toString(36),
        at: nowIso(),
        severity: d.severity === 'note' ? 'note' : 'caution',
        text: d.text ? String(d.text) : DEFAULT_ADVICE,
        evidenceRefs: d.evidenceRefs && typeof d.evidenceRefs.length === 'number' ? d.evidenceRefs.slice() : [],
        readOnly: true
      });
    }

    sl.state = outcome;
    sl.lastAt = nowIso();
    announce();
    return visualState(threadId);
  }

  /* noteTurnEnd(threadId) -> boolean.
   *
   * The revert for `scope: 'turn'`, exposed as a function instead of a timer so the runtime and
   * the demo director decide when a turn ends and a probe can assert the transition without
   * waiting on the clock. Returns false when the thread holds no turn-scoped override, which lets
   * the caller fire it after every turn unconditionally. */
  function noteTurnEnd(threadId) {
    var hold = threadId ? turnHolds[threadId] : null;
    if (!hold) return false;
    delete turnHolds[threadId];
    var sl = slice(threadId);
    if (!sl) return false;
    stopOp(threadId, 'auto-idle');
    writeRuntime(threadId, 'bsd', hold.mode);
    writeRuntime(threadId, 'bsdScope', 'thread');
    sl.scope = 'thread';
    applyModeState(threadId, sl, hold.mode);
    sl.lastAt = nowIso();
    announce();
    return true;
  }

  function stateLabel(state) {
    return STATE_LABELS[state] || '';
  }

  var api = {
    STATES: STATES,
    MODES: MODES,
    SCOPES: SCOPES,
    bind: bind,
    mode: mode,
    scope: scope,
    set: set,
    visualState: visualState,
    advice: advice,
    dismiss: dismiss,
    evaluate: evaluate,
    noteTurnEnd: noteTurnEnd,
    opId: opId,
    stateLabel: stateLabel
  };

  global.PMXBsd = api;
})(window);
