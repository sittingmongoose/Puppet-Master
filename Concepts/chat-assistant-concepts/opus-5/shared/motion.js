/* PMX motion — Opus 5
 *
 * This file owns the motion VOCABULARY. The eight window concepts and eight thread concepts own the
 * choreography: they compose these helpers in their own order, with their own DOM, so no two
 * concepts move alike. That split is why there is exactly one named helper per transition family in
 * 07_DEMO_FIXTURES_MOTION_AND_TEST_GATE.md:31-45 and why none of them decides layout:
 *
 *   arrive           message / tool / activity arrival
 *   questionPhase    question prepare / open / transition / submit / close
 *   condense         compact work expand and collapse
 *   phaseStep        Goal phase transition, with the count morphing in place
 *   agentState       subagent state change
 *   handoff          diff / artifact handoff card
 *   dockShift        pinned history pin / unpin / compact fallback
 *   panelSwap        artifact open / switch / close
 *   submenu          model selector submenu stack
 *   stateFlip        Access / Back Seat Driver state change
 *   consequence      route warning arrival
 *   catchUp          offline / reconnect / snapshot catch-up
 *   lineage          branch / rewind
 *
 * Four rules hold for every helper here, and each is an automated assertion in the test gate.
 *
 * 1. REDUCED MOTION IS TWO-PART and both parts are mandatory: the blanket CSS duration override in
 *    motion.css, and an explicit early return in every JS-driven animation below. The CSS rule
 *    cannot stop a requestAnimationFrame loop or a staged JS sequence (CONTRACT section 8.11), so
 *    every helper checks reduced() FIRST and commits the final state synchronously. Reduced motion
 *    reaches the SAME complete state, never a partial one.
 *
 * 2. NO PROPERTY THAT CAN CLIP TEXT. Only opacity, transform, and interpolated height/max-height.
 *    Never width on a text run: a history column or question card that animates its width reflows
 *    its own prose mid-flight, which is the packet's "no text clipping" failure exactly. Where a
 *    width genuinely changes (a 40px gutter becoming a 268px column) the width belongs to the
 *    concept's CSS and motion only cross-fades the content across it.
 *
 * 3. NO FOCUS MOVEMENT. Not one helper touches focus. Focus is owned by the popup service and by
 *    the control that was activated; an animation that steals it is a keyboard-navigation bug.
 *
 * 4. NO INDEFINITE LOOP unless something is truthfully running. A repeating animation is legal only
 *    while the PMXObservable op named by the element's `data-pmx-op` is `running`, and `indefinite()`
 *    is the single place that rule lives. It refuses to start without a running op and stops itself
 *    the moment the op leaves `running`, so "the glow can never pulse forever" is a property of the
 *    code rather than a promise in prose.
 *
 * Every public helper returns a HANDLE (see makeHandle): thenable, so `await motion.arrive(el)`
 * works, plus `cancel()` for a destroy() path and `finish()` to jump to the end state.
 */
(function (global) {
  'use strict';

  var SUPPORTS_INTERPOLATE_SIZE = (function () {
    try { return !!(global.CSS && CSS.supports && CSS.supports('interpolate-size', 'allow-keywords')); }
    catch (e) { return false; }
  })();

  var mql = null;
  function media() {
    if (mql === null) {
      try { mql = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener: null }; }
      catch (e) { mql = { matches: false, addEventListener: null }; }
    }
    return mql;
  }

  /* Themes and motion are STAGE-scoped, not on documentElement, so walk up from the element.
   * Falling back to the first stage in the document keeps callers that have no element working. */
  function stageOf(el) {
    var n = el;
    while (n && n.nodeType === 1) {
      if (n.hasAttribute && n.hasAttribute('data-motion')) return n;
      n = n.parentNode;
    }
    return document.querySelector('[data-motion]');
  }

  function reduced(el) {
    var st = stageOf(el);
    if (st && st.getAttribute('data-motion') === 'reduced') return true;
    if (st && st.getAttribute('data-motion') === 'full') return false;
    return !!media().matches;
  }

  var changeSubs = [];
  function onChange(fn) {
    changeSubs.push(fn);
    return function () {
      var i = changeSubs.indexOf(fn);
      if (i >= 0) changeSubs.splice(i, 1);
    };
  }
  function fireChange() {
    var list = changeSubs.slice();
    for (var i = 0; i < list.length; i++) { try { list[i](); } catch (e) {} }
  }
  (function wireChangeSignals() {
    var m = media();
    if (m && m.addEventListener) { try { m.addEventListener('change', fireChange); } catch (e) {} }
    if (global.MutationObserver) {
      try {
        new MutationObserver(fireChange).observe(document.documentElement, {
          attributes: true, subtree: true, attributeFilter: ['data-motion']
        });
      } catch (e) {}
    }
  })();

  /* Cancel anything in flight and leave the element at its committed final state. */
  function snapToEnd(el) {
    if (!el || !el.getAnimations) return;
    try {
      var anims = el.getAnimations({ subtree: true });
      for (var i = 0; i < anims.length; i++) {
        try { anims[i].finish(); } catch (e) { try { anims[i].cancel(); } catch (e2) {} }
      }
    } catch (e) {}
    el.style.transition = '';
  }

  /* afterTransition(el, prop, fn, maxMs)
   *
   * Also settles on `animationend` when no specific property is named. The class-driven families
   * below are CSS ANIMATIONS, and `transitionend` never fires for an animation — without this leg
   * every one-shot beat would wait out its whole fallback timer before running its cleanup, which
   * is how a stacked sequence ends up cleaning up in the wrong order. Callers that name a property
   * (`'height'`, `'transform'`) are unaffected. */
  function afterTransition(el, prop, fn, maxMs) {
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', onEnd);
      if (!prop) el.removeEventListener('animationend', onEnd);
      clearTimeout(timer);
      fn();
    }
    function onEnd(ev) { if (ev.target === el && (!prop || ev.propertyName === prop)) finish(); }
    el.addEventListener('transitionend', onEnd);
    if (!prop) el.addEventListener('animationend', onEnd);
    /* transitionend genuinely does not always fire (interrupted, zero-delta, display change).
     * The timer is not belt-and-braces paranoia here, it is required for correctness. */
    var timer = setTimeout(finish, maxMs || 480);
    return finish;
  }

  /* ------------------------------------------------------------------------------- handles
   * Callers arrive from two different worlds: a renderer that wants to sequence work after a
   * transition, and a destroy() path that must abandon an animation mid-flight without leaving
   * inline styles or half-swapped content behind. One object answers both, so no helper has to
   * choose between taking a callback and returning a promise.
   *
   *   handle.then(fn)   fn receives 'finished' | 'cancelled'; also makes `await handle` work
   *   handle.finish()   jump to the committed final state now
   *   handle.cancel()   abandon in place, still committing the final state (never a half state)
   *   handle.state()    'running' | 'finished' | 'cancelled'
   *
   * then() resolves with a STRING, never with the handle: resolving a thenable with itself sends
   * the promise machinery into an unbounded then() recursion. */
  function makeHandle() {
    var state = 'running';
    var pending = null;
    var thens = [];
    var forceEnd = null;
    var abort = null;
    var h = {};

    function settle(kind) {
      if (state !== 'running') return h;
      state = kind || 'finished';
      forceEnd = null;
      abort = null;
      var list = thens;
      thens = [];
      for (var i = 0; i < list.length; i++) { try { list[i](state); } catch (e) {} }
      return h;
    }

    h.state = function () { return state; };
    h.then = function (fn) {
      if (typeof fn !== 'function') return h;
      if (state === 'running') thens.push(fn);
      else { try { fn(state); } catch (e) {} }
      return h;
    };
    h.finish = function () {
      if (state !== 'running') return h;
      pending = 'finished';
      var f = forceEnd;
      forceEnd = null;
      abort = null;
      if (f) { try { f(); } catch (e) {} }
      return settle(pending);
    };
    h.cancel = function () {
      if (state !== 'running') return h;
      pending = 'cancelled';
      var a = abort || forceEnd;
      forceEnd = null;
      abort = null;
      if (a) { try { a(); } catch (e) {} }
      return settle(pending);
    };
    /* Internal wiring. `_end` and `_abort` are how a helper says how to reach its final state;
     * `_done` is how it reports natural completion. The pending flag is what lets the DOM commit
     * run BEFORE subscribers see the outcome while still reporting 'cancelled' truthfully. */
    h._end = function (fn) { forceEnd = fn; return h; };
    h._abort = function (fn) { abort = fn; return h; };
    h._done = function () { return settle(pending || 'finished'); };
    return h;
  }

  function settled() { return makeHandle()._done(); }

  /* Animate height to/from auto. Uses interpolate-size where available, otherwise the
   * measured scrollHeight pattern. opts.collapsedHeight clamps to N lines instead of 0. */
  function collapseTo(el, open, opts) {
    opts = opts || {};
    var collapsed = opts.collapsedHeight != null ? opts.collapsedHeight : 0;
    var dur = opts.duration || 260;
    var onDone = opts.onDone;

    if (!el) { if (onDone) onDone(); return; }

    if (reduced(el)) {
      el.style.transition = 'none';
      el.style.overflow = open ? '' : 'hidden';
      el.style.height = open ? '' : (typeof collapsed === 'number' ? collapsed + 'px' : collapsed);
      /* Force the style to commit before clearing the transition override. */
      void el.offsetHeight;
      el.style.transition = '';
      if (onDone) onDone();
      return;
    }

    el.style.overflow = 'hidden';

    if (SUPPORTS_INTERPOLATE_SIZE) {
      el.style.transition = 'height ' + dur + 'ms var(--ease-default, ease)';
      el.style.height = open ? 'auto' : (typeof collapsed === 'number' ? collapsed + 'px' : collapsed);
      afterTransition(el, 'height', function () {
        el.style.transition = '';
        if (open) { el.style.height = ''; el.style.overflow = ''; }
        if (onDone) onDone();
      }, dur + 200);
      return;
    }

    var from = el.getBoundingClientRect().height;
    el.style.transition = 'none';
    el.style.height = from + 'px';
    void el.offsetHeight;
    var to;
    if (open) {
      el.style.height = 'auto';
      to = el.getBoundingClientRect().height;
      el.style.height = from + 'px';
      void el.offsetHeight;
    } else {
      to = typeof collapsed === 'number' ? collapsed : parseFloat(collapsed) || 0;
    }
    el.style.transition = 'height ' + dur + 'ms var(--ease-default, ease)';
    el.style.height = to + 'px';
    afterTransition(el, 'height', function () {
      el.style.transition = '';
      if (open) { el.style.height = ''; el.style.overflow = ''; }
      if (onDone) onDone();
    }, dur + 200);
  }

  /* Multi-stage activity group -> single summary row. Height plus content morph.
   *
   * This is the compact-work condensation every thread concept now calls when a work group
   * completes: t1's two-row strip becoming `13 tools used`, t2's chip run collapsing to one chip,
   * t3's detailed unit dropping to a marker, t4's ledger becoming a single digest line, and so on.
   * It was written and then left unwired for a whole build; the thread concepts are its callers.
   *
   * `alive` is an INTERNAL fourth argument, never part of the public signature: the summary swap
   * happens on a timer partway through the animation, so a cancel at 40ms must be able to stop the
   * pending swap from rebuilding content after the caller has already committed the end state. */
  function condenseImpl(el, buildSummary, opts, alive) {
    opts = opts || {};
    var dur = opts.duration || 260;
    var onDone = opts.onDone;
    if (!el) { if (onDone) onDone(); return; }

    if (reduced(el)) {
      while (el.firstChild) el.removeChild(el.firstChild);
      buildSummary(el);
      if (onDone) onDone();
      return;
    }

    var from = el.getBoundingClientRect().height;
    el.style.overflow = 'hidden';
    el.style.transition = 'none';
    el.style.height = from + 'px';
    void el.offsetHeight;

    var kids = [];
    for (var i = 0; i < el.children.length; i++) kids.push(el.children[i]);
    for (var j = 0; j < kids.length; j++) {
      kids[j].style.transition = 'opacity 120ms ease';
      kids[j].style.opacity = '0';
    }

    setTimeout(function () {
      if (alive && !alive()) return;
      while (el.firstChild) el.removeChild(el.firstChild);
      buildSummary(el);
      el.style.height = 'auto';
      var to = el.getBoundingClientRect().height;
      el.style.height = from + 'px';
      void el.offsetHeight;
      el.style.transition = 'height ' + dur + 'ms var(--ease-default, ease)';
      el.style.height = to + 'px';
      afterTransition(el, 'height', function () {
        el.style.transition = '';
        el.style.height = '';
        el.style.overflow = '';
        if (onDone) onDone();
      }, dur + 200);
    }, 130);
  }

  /* condense(el, buildSummary, opts) — the original signature, unchanged, plus a handle to await
   * or cancel. opts.onDone still fires exactly once, before the handle settles. */
  function condense(el, buildSummary, opts) {
    var h = makeHandle();
    var alive = true;
    var committed = false;
    var o = {};
    var k;
    if (opts) { for (k in opts) { if (Object.prototype.hasOwnProperty.call(opts, k)) o[k] = opts[k]; } }
    var caller = o.onDone;

    function commit() {
      if (committed) return;
      committed = true;
      if (caller) { try { caller(); } catch (e) {} }
    }
    function endNow() {
      alive = false;
      snapToEnd(el);
      if (el) {
        /* Rebuild the summary here too: at cancel time the swap may not have run yet, and the end
         * state of a condensation is the summary, never the expanded group. buildSummary always
         * receives an emptied container, so running it once more is not a double-append. */
        while (el.firstChild) el.removeChild(el.firstChild);
        try { buildSummary(el); } catch (e) {}
        el.style.transition = '';
        el.style.height = '';
        el.style.overflow = '';
      }
      commit();
    }

    o.onDone = function () { commit(); h._done(); };
    h._end(endNow);
    h._abort(endNow);
    condenseImpl(el, buildSummary, o, function () { return alive; });
    return h;
  }

  /* In-place text replacement that never moves the container. */
  function swapText(el, text) {
    if (!el) return;
    if (reduced(el)) { el.textContent = text; return; }
    /* Nothing to cross-fade FROM. An empty element is having its first value written, which is an
     * entrance rather than a morph - and deferring it to the second frame paints an empty slot first,
     * so a freshly mounted work line, chip or status label appears blank for two frames. */
    if (!String(el.textContent || '').length) { el.textContent = text; return; }
    el.style.transition = 'opacity 110ms ease';
    el.style.opacity = '0';
    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(function () {
        el.textContent = text;
        el.style.opacity = '1';
      });
    });
  }

  /* High-frequency callers (elapsed timers) must not fade — it reads as flicker. */
  function swapTextInstant(el, text) {
    if (el && el.textContent !== text) el.textContent = text;
  }

  /* ------------------------------------------------------------------------------- beats
   * Every one-shot family below is a single CSS class plus cleanup, so the personality lives in
   * the theme's --ease-* and --motion-* tokens rather than in a bespoke curve per effect. One
   * runner means the reduced-motion return, the cleanup, and the handle wiring exist once. */
  function beat(el, cls, maxMs, opts) {
    opts = opts || {};
    var h = makeHandle();
    var committed = false;
    function commit() {
      if (committed) return;
      committed = true;
      if (el && cls) el.classList.remove(cls);
      if (opts.after) { try { opts.after(); } catch (e) {} }
      if (opts.onDone) { try { opts.onDone(); } catch (e) {} }
    }
    if (!el) { commit(); return h._done(); }
    /* Reduced motion: the class is the entire animation, so not adding it IS the final state. */
    if (reduced(el)) { commit(); return h._done(); }
    if (cls) el.classList.add(cls);
    var force = afterTransition(el, null, function () { commit(); h._done(); }, maxMs || 420);
    h._end(function () { snapToEnd(el); force(); });
    h._abort(function () { force(); });
    return h;
  }

  function enter(el) { return beat(el, 'pmx-enter', 420); }

  function exit(el, onDone) { return beat(el, 'pmx-exit', 320, { onDone: onDone }); }

  /* ------------------------------------------------------------- the observable gate (rule 4)
   * indefinite(el, className, opts) -> handle
   *
   * The ONLY sanctioned way to start a repeating animation. `opts.opId` or the element's
   * `data-pmx-op` must name a PMXObservable op that is `running`; anything else is refused and the
   * class is never added, so an indefinite glow with nothing behind it cannot reach the screen.
   * The helper then stops itself the moment the op leaves `running`.
   *
   * Used by the Back Seat Driver `auto-active` glow, Compact Now, replay and snapshot catch-up,
   * provider install, worktree requests, and any subagent row that reads as busy. Manual BSD `on`
   * deliberately does NOT come here: it is a static filled treatment, not a glow. */
  function indefinite(el, className, opts) {
    opts = opts || {};
    var h = makeHandle();
    if (!el) return h._done();
    var cls = className || 'pmx-pulse';
    var opId = opts.opId || (el.getAttribute ? el.getAttribute('data-pmx-op') : null);
    var obs = global.PMXObservable;
    var unsub = null;
    var offChange = null;
    var timer = null;

    function stop() {
      if (unsub) { try { unsub(); } catch (e) {} unsub = null; }
      if (offChange) { try { offChange(); } catch (e) {} offChange = null; }
      if (timer) { clearInterval(timer); timer = null; }
      if (el && cls) el.classList.remove(cls);
      h._done();
    }

    if (!opId || !obs || typeof obs.isRunning !== 'function' || !obs.isRunning(opId)) {
      /* Refusal is silent and total. Clearing the class covers the re-entrant case where a
       * previous op for this element has already finished but the class outlived it. */
      if (cls) el.classList.remove(cls);
      return h._done();
    }
    /* Reduced motion never loops at all. The meaning — "this is running" — is already carried by
     * the op's own label and progress, which the renderer shows as text. */
    if (reduced(el)) { if (cls) el.classList.remove(cls); return h._done(); }

    el.classList.add(cls);
    unsub = obs.subscribe(function () { if (!obs.isRunning(opId)) stop(); });
    offChange = onChange(function () { if (reduced(el)) stop(); });
    /* PMXObservable.clear() — the Director's reset — empties the op table WITHOUT calling
     * subscribers, so subscription alone can leave a pulse running against no op at all. This poll
     * is what makes the gate hold across a reset; it is the backstop, not defensive padding. */
    timer = setInterval(function () { if (!obs.isRunning(opId)) stop(); }, 600);
    h._end(stop);
    h._abort(stop);
    return h;
  }

  /* ------------------------------------------------------------------------ the thirteen families, then the four causal primitives */

  /* 1. arrive(el) — message, tool row, or activity stage arriving. */
  function arrive(el) { return beat(el, 'pmx-enter', 420); }

  /* 2. questionPhase(el, phase, opts) — phase in 'prepare'|'open'|'advance'|'submit'|'close'.
   * opts: { duration, collapsedHeight, onDone }. `open` and `close` are BOUNDS changes and go
   * through collapseTo, so height interpolates and width never does — a question card that
   * animated its width would rewrap its own option rows mid-flight. The phase is stamped as
   * `data-pmx-qphase` so a concept can style five states without owning any timing; it is a
   * presentation hint, never semantic state, which still lives in view[tid].questionnaire. */
  var Q_BEAT = { prepare: { cls: 'pmx-m-q-prepare', ms: 420 }, advance: { cls: 'pmx-m-q-advance', ms: 420 }, submit: { cls: 'pmx-m-q-submit', ms: 460 } };
  function questionPhase(el, phase, opts) {
    opts = opts || {};
    if (!el) { if (opts.onDone) { try { opts.onDone(); } catch (e) {} } return settled(); }
    if (el.setAttribute) el.setAttribute('data-pmx-qphase', String(phase));

    var oneShot = Q_BEAT[phase];
    if (oneShot) return beat(el, oneShot.cls, opts.duration ? opts.duration + 200 : oneShot.ms, { onDone: opts.onDone });
    if (phase !== 'open' && phase !== 'close') { if (opts.onDone) { try { opts.onDone(); } catch (e) {} } return settled(); }

    var open = phase === 'open';
    var cls = open ? 'pmx-m-q-open' : null;
    var dur = opts.duration || 260;
    var collapsed = opts.collapsedHeight != null ? opts.collapsedHeight : 0;
    var h = makeHandle();
    var committed = false;

    function commit() {
      if (committed) return;
      committed = true;
      if (cls) el.classList.remove(cls);
      if (opts.onDone) { try { opts.onDone(); } catch (e) {} }
    }
    if (reduced(el)) {
      collapseTo(el, open, { duration: dur, collapsedHeight: collapsed, onDone: commit });
      return h._done();
    }
    if (cls) el.classList.add(cls);
    collapseTo(el, open, { duration: dur, collapsedHeight: collapsed, onDone: function () { commit(); h._done(); } });
    /* snapToEnd finishes the height transition, which lands on the committed target height, so the
     * forced end state is the same one the animation was heading for. */
    function endNow() { snapToEnd(el); commit(); }
    h._end(endNow);
    h._abort(endNow);
    return h;
  }

  /* 4. phaseStep(el, fromLabel, toLabel) — a Goal phase advancing, with its count morphing in
   * place. `el` is the label element itself. The morph must not append a new row: t6's exec log
   * going from `6/8` to `8/8` has to be the SAME row changing, because a new row would read as new
   * work having happened. */
  function phaseStep(el, fromLabel, toLabel) {
    var h = makeHandle();
    if (!el) return h._done();
    var to = toLabel == null ? '' : String(toLabel);
    if (reduced(el)) { swapTextInstant(el, to); return h._done(); }
    /* Truthful start: if the element is not already showing the label the caller says it is
     * leaving, commit that first, so the morph reads as from -> to rather than whatever -> to. */
    if (fromLabel != null && el.textContent !== String(fromLabel)) swapTextInstant(el, String(fromLabel));
    swapText(el, to);
    function endNow() {
      clearTimeout(timer);
      swapTextInstant(el, to);
      el.style.transition = '';
      el.style.opacity = '';
    }
    var timer = setTimeout(function () { endNow(); h._done(); }, 280);
    h._end(endNow);
    h._abort(endNow);
    return h;
  }

  /* 5. agentState(el, state) — a subagent changing state. Motion marks the CHANGE only; the
   * renderer keeps owning the state attribute, because an animation that also wrote the state
   * would be a second source of truth for something the store already carries. A `running` row
   * that wants to keep reading as busy calls indefinite() with its own op id. */
  var AGENT_BEAT = {
    queued: 'pmx-m-state', running: 'pmx-m-state', blocked: 'pmx-m-state',
    failed: 'pmx-shake', completed: 'pmx-m-settle', stopped: 'pmx-m-state', retried: 'pmx-m-state'
  };
  function agentState(el, state) { return beat(el, AGENT_BEAT[state] || 'pmx-m-state', 460); }

  /* 6. handoff(el) — a diff or artifact card handed off from the work that produced it. It travels
   * a short distance so the connection to the cluster above it is legible. */
  function handoff(el) { return beat(el, 'pmx-m-handoff', 480); }

  /* 7. dockShift(el, from, to) — pinned history pin, unpin, or compact fallback. Both arguments are
   * 'closed' | 'peek' | 'pinned-full' | 'pinned-compact'.
   *
   * Full <-> compact is a CROSS-FADE with no travel on purpose: that transition changes a column's
   * width (w3's 40px gutter to a 268px column, w7's 44px rail to 72px), and animating width would
   * reflow the thread titles inside it. The width belongs to the concept's CSS; motion carries the
   * content across it. Lateral travel is `--pmx-dx`, defaulting to a left-edge dock; w6's right
   * track sets it positive in its own CSS. */
  function dockShift(el, from, to) {
    var cls;
    if (to === 'closed') cls = 'pmx-m-dock-out';
    else if (from === 'closed' || from == null) cls = 'pmx-m-dock-in';
    else cls = 'pmx-m-dock-swap';
    return beat(el, cls, 460);
  }

  /* 8. panelSwap(el, dir) — artifact workspace opening, switching, or closing.
   * dir in 'open'|'close'|'next'|'prev', with 'in'/'out'/'forward'/'back' accepted as aliases. */
  var PANEL_CLS = {
    open: 'pmx-m-panel-in', 'in': 'pmx-m-panel-in',
    close: 'pmx-m-panel-out', out: 'pmx-m-panel-out',
    next: 'pmx-m-panel-next', forward: 'pmx-m-panel-next',
    prev: 'pmx-m-panel-prev', back: 'pmx-m-panel-prev'
  };
  function panelSwap(el, dir) { return beat(el, PANEL_CLS[dir] || 'pmx-m-panel-in', 460); }

  /* 9. submenu(el) — a model selector submenu entering the stack. The parent popup stays open and
   * keeps its own focus: the submenu is a peer surface, so this never touches focus (rule 3). */
  function submenu(el) { return beat(el, 'pmx-m-submenu', 360); }

  /* 10. stateFlip(el) — an Access profile or Back Seat Driver control changing state. Deliberately
   * quiet: these controls sit in dense header rows where anything larger reads as an error. */
  function stateFlip(el) { return beat(el, 'pmx-m-flip', 360); }

  /* 11. consequence(el) — a route warning arriving. Firmer than an ordinary arrival because it is
   * asking for a decision, and it settles rather than merely stopping, so it does not read as an
   * alarm either. */
  function consequence(el) { return beat(el, 'pmx-m-consequence', 520); }

  /* 12. catchUp(el, pct) — offline queue drain, reconnect replay, or snapshot catch-up progress.
   * `el` is the fill element, not the label. scaleX, never width: a fill that animates width in a
   * flex row moves the text beside it on every frame. Accepts 0..1 and 0..100, because a caller
   * holding a percentage should not have to remember which one this is. */
  function catchUp(el, pct) {
    var h = makeHandle();
    if (!el) return h._done();
    var p = Number(pct);
    if (!isFinite(p)) p = 0;
    if (p > 1) p = p / 100;
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    el.style.transformOrigin = 'left center';
    if (reduced(el)) {
      el.style.transition = 'none';
      el.style.transform = 'scaleX(' + p + ')';
      void el.offsetHeight;
      el.style.transition = '';
      return h._done();
    }
    el.style.transition = 'transform 200ms var(--ease-default, ease)';
    el.style.transform = 'scaleX(' + p + ')';
    var force = afterTransition(el, 'transform', function () { el.style.transition = ''; h._done(); }, 340);
    h._end(function () { snapToEnd(el); force(); });
    h._abort(function () { force(); });
    return h;
  }

  /* 13. lineage(el, dir) — a branch or a rewind. dir in 'branch'|'rewind', with 'forward' and
   * 'back'/'restore' accepted. A branch arrives from the side to read as a new line of descent; a
   * rewind arrives from above, along the thread it is returning to. */
  var LINEAGE_CLS = {
    branch: 'pmx-m-lineage-branch', forward: 'pmx-m-lineage-branch',
    rewind: 'pmx-m-lineage-rewind', back: 'pmx-m-lineage-rewind', restore: 'pmx-m-lineage-rewind'
  };
  function lineage(el, dir) { return beat(el, LINEAGE_CLS[dir] || 'pmx-m-lineage-branch', 480); }

  /* ---------------------------------------------------------------- the four causal primitives
   *
   * These four come from the RAW RECORDINGS, which the original packet described in prose but did not
   * supply as indexed media. Each one is a causal rule, not a look: the reference's own easing,
   * colour and radius are deliberately not copied.
   *
   * 14. displace   (01_message_arrival_spatial_continuity.mov)
   * 15. firstVisit (02_stable_paged_questionnaire.mov)
   * 16. countMorph (03_compact_execution_activity.mov)
   * 17. groupReopen(03_compact_execution_activity.mov)
   */

  /* Shared mechanism for 14 and 17: measure a set of elements, let the caller mutate the DOM, then
   * play the OLD positions forward to the new ones. Two families rather than one function because the
   * causal meanings differ — something arriving versus something being disclosed — and a reader of a
   * concept should see which one was meant. */
  /* The file reaches through `global` for platform APIs everywhere else; these two keep the four
   * primitives below reading the same way without repeating the lookup six times. */
  function raf(fn) { return global.requestAnimationFrame(fn); }
  function doc() { return global.document; }

  function flipSet(nodes, mutate, ms) {
    var list = [], i, r;
    for (i = 0; i < nodes.length; i++) {
      if (!nodes[i] || !nodes[i].getBoundingClientRect) continue;
      r = nodes[i].getBoundingClientRect();
      list.push({ el: nodes[i], top: r.top, left: r.left });
    }
    var out = null;
    try { out = mutate(); } catch (e) { out = null; }
    for (i = 0; i < list.length; i++) {
      var el = list[i].el;
      if (!el.getBoundingClientRect || !el.isConnected) continue;
      r = el.getBoundingClientRect();
      var dy = list[i].top - r.top;
      var dx = list[i].left - r.left;
      if (!dy && !dx) continue;
      el.style.transition = 'none';
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    }
    /* Two frames: one to commit the inverted position, one to release it. A single frame lets the
     * browser coalesce both writes and nothing moves at all. */
    raf(function () {
      raf(function () {
        for (var k = 0; k < list.length; k++) {
          var e2 = list[k].el;
          if (!e2.style) continue;
          e2.style.transition = 'transform ' + ms + 'ms var(--ease-spring-real, cubic-bezier(.22,.61,.36,1))';
          e2.style.transform = '';
        }
      });
    });
    return out;
  }

  function clearFlip(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] && nodes[i].style) { nodes[i].style.transition = ''; nodes[i].style.transform = ''; }
    }
  }

  /* 14. displace(container, insert, opts) — something ARRIVES.
   *
   * Reference 01 conserves position: the new bubble is already at full opacity in its final place and
   * the ROWS AROUND IT move to make room. Our `arrive()` does the opposite — it fades the new node in
   * while everything else stays nailed down, which reads as the message materialising rather than as
   * the conversation making space for it. `insert` must return the newly added element (or nothing).
   * The arrival itself is deliberately NOT animated; only its neighbours are. */
  function displace(container, insert, opts) {
    opts = opts || {};
    var h = makeHandle();
    if (!container || typeof insert !== 'function') { try { insert && insert(); } catch (e) {} return h._done(); }
    var ms = opts.duration || 320;
    var kids = [];
    var i;
    for (i = 0; i < container.children.length; i++) kids.push(container.children[i]);

    if (reduced(container)) {
      try { insert(); } catch (e) {}
      return h._done();
    }

    var added = flipSet(kids, insert, ms);
    /* The arriving node gets no entrance class on purpose: in the reference it is simply THERE. What
     * tells you it is new is that its neighbours just moved. */
    if (added && added.setAttribute) added.setAttribute('data-pmx-arrived', '1');

    function endNow() {
      clearTimeout(timer);
      clearFlip(kids);
    }
    var timer = setTimeout(function () { endNow(); h._done(); }, ms + 40);
    h._end(endNow);
    h._abort(endNow);
    return h;
  }

  /* 15. firstVisit(el, key) -> boolean. TRUE the first time this element is asked about this key.
   *
   * Reference 02 is a REVIEWABLE questionnaire: paging back to question 1 shows the answer still
   * there and the card does NOT replay its entrance. Without a guard, `questionPhase(el,'advance')`
   * fires on every render, so navigating backwards animated as though the question were new — which
   * tells the reader they have moved forward when they have moved back.
   *
   * The key is stamped on the element, so the answer survives a re-render of the surrounding tree and
   * dies with the element itself, which is exactly the lifetime a "have I shown this yet" fact has. */
  var VISIT_ATTR = 'data-pmx-visited';

  function firstVisit(el, key) {
    if (!el || !el.getAttribute) return true;
    var k = String(key == null ? '' : key);
    var seen = el.getAttribute(VISIT_ATTR);
    if (seen === k) return false;
    /* A DIFFERENT key means genuinely new content in the same slot, which should animate. Storing
     * only the latest key keeps this O(1) and matches the reference, where paging away and back is
     * still a revisit but a NEW question is an entrance. */
    var all = el.getAttribute(VISIT_ATTR + '-all') || '';
    var known = all ? all.split(' ') : [];
    var already = known.indexOf(k) >= 0;
    if (!already) { known.push(k); el.setAttribute(VISIT_ATTR + '-all', known.join(' ')); }
    el.setAttribute(VISIT_ATTR, k);
    return !already;
  }

  function forgetVisits(el) {
    if (!el || !el.removeAttribute) return;
    el.removeAttribute(VISIT_ATTR);
    el.removeAttribute(VISIT_ATTR + '-all');
  }

  /* 16. countMorph(el, to, opts) — a NUMBER is rewritten in place.
   *
   * Reference 03 grows `Exploring 5 files` into `Exploring 7 files` by changing the digit and nothing
   * else. `phaseStep` already refuses to append a new row, but it cross-fades the whole label, so a
   * one-digit change reads as the entire line being replaced. Here only the numeric part moves: the
   * surrounding words are never touched, which is what makes the count feel like a running tally
   * rather than a series of different sentences.
   *
   * `el` is the element whose textContent contains the number. `to` is the full new string. */
  function countMorph(el, to, opts) {
    opts = opts || {};
    var h = makeHandle();
    if (!el) return h._done();
    var next = to == null ? '' : String(to);
    if (reduced(el)) { swapTextInstant(el, next); return h._done(); }

    var prev = el.textContent || '';
    /* Find the first run of digits that actually differs. If the words changed too, this is not a
     * count morph and the honest answer is to hand it to the label swap instead of pretending. */
    var pd = prev.match(/\d+/);
    var nd = next.match(/\d+/);
    if (!pd || !nd || prev.replace(/\d+/, '#') !== next.replace(/\d+/, '#')) {
      swapText(el, next);
      var t0 = setTimeout(function () { swapTextInstant(el, next); h._done(); }, 280);
      h._end(function () { clearTimeout(t0); swapTextInstant(el, next); });
      h._abort(function () { clearTimeout(t0); swapTextInstant(el, next); });
      return h;
    }

    var ms = opts.duration || 220;
    var rising = Number(nd[0]) > Number(pd[0]);
    /* Rebuild as three text nodes so only the middle one is animated; the words either side keep
     * their own layout boxes and never reflow. */
    while (el.firstChild) el.removeChild(el.firstChild);
    var head = doc().createTextNode(next.slice(0, nd.index));
    var num = doc().createElement('span');
    num.className = 'pmx-count-morph';
    num.setAttribute('data-dir', rising ? 'up' : 'down');
    num.textContent = nd[0];
    var tail = doc().createTextNode(next.slice(nd.index + nd[0].length));
    el.appendChild(head); el.appendChild(num); el.appendChild(tail);

    function endNow() {
      clearTimeout(timer);
      if (num.classList) num.classList.remove('pmx-count-morph-run');
      num.style.transition = '';
      num.style.transform = '';
      num.style.opacity = '';
    }
    raf(function () { if (num.classList) num.classList.add('pmx-count-morph-run'); });
    var timer = setTimeout(function () { endNow(); h._done(); }, ms + 60);
    h._end(endNow);
    h._abort(endNow);
    return h;
  }

  /* 17. groupReopen(el, expand, opts) — a condensed group is DISCLOSED again.
   *
   * Reference 03 reopens `13 tools used` into its full run, and the answer prose and artifact card
   * BELOW it keep their positions relative to their own content while being pushed down as one block.
   * Each group also reopens independently: opening the second does not close the first. Animating the
   * expanding element alone makes the siblings jump, which reads as the whole transcript reflowing
   * rather than one group unfolding.
   *
   * `expand` mutates the DOM to reveal the group. Siblings AFTER `el` are the ones carried. */
  function groupReopen(el, expand, opts) {
    opts = opts || {};
    var h = makeHandle();
    if (!el || typeof expand !== 'function') { try { expand && expand(); } catch (e) {} return h._done(); }
    if (reduced(el)) { try { expand(); } catch (e) {} return h._done(); }

    var ms = opts.duration || 300;
    var after = [];
    var n = el.nextElementSibling;
    while (n) { after.push(n); n = n.nextElementSibling; }

    var startH = el.getBoundingClientRect ? el.getBoundingClientRect().height : 0;
    flipSet(after, function () { expand(); return null; }, ms);

    /* The group's own height interpolates through collapseTo's contract so width never animates —
     * an expanding group that also widened would rewrap every row inside it mid-flight. */
    var endH = el.getBoundingClientRect ? el.getBoundingClientRect().height : 0;
    if (endH > startH) {
      el.style.overflow = 'hidden';
      el.style.height = startH + 'px';
      raf(function () {
        el.style.transition = 'height ' + ms + 'ms var(--ease-spring-real, cubic-bezier(.22,.61,.36,1))';
        el.style.height = endH + 'px';
      });
    }

    function endNow() {
      clearTimeout(timer);
      clearFlip(after);
      el.style.transition = '';
      el.style.height = '';
      el.style.overflow = '';
    }
    var timer = setTimeout(function () { endNow(); h._done(); }, ms + 60);
    h._end(endNow);
    h._abort(endNow);
    return h;
  }

  global.PMXMotion = {
    reduced: reduced,
    onChange: onChange,
    snapToEnd: snapToEnd,
    collapseTo: collapseTo,
    swapText: swapText,
    swapTextInstant: swapTextInstant,
    enter: enter,
    exit: exit,
    afterTransition: afterTransition,
    supportsInterpolateSize: SUPPORTS_INTERPOLATE_SIZE,

    /* the guarded helper for indefinite motion — rule 4 lives here and nowhere else */
    indefinite: indefinite,

    /* the thirteen transition families */
    arrive: arrive,
    questionPhase: questionPhase,
    condense: condense,
    phaseStep: phaseStep,
    agentState: agentState,
    handoff: handoff,
    dockShift: dockShift,
    panelSwap: panelSwap,
    submenu: submenu,
    stateFlip: stateFlip,
    consequence: consequence,
    catchUp: catchUp,
    lineage: lineage,

    /* the four causal primitives taken from the raw recordings */
    displace: displace,
    firstVisit: firstVisit,
    forgetVisits: forgetVisits,
    countMorph: countMorph,
    groupReopen: groupReopen
  };
})(window);
