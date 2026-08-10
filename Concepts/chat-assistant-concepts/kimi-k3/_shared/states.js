/* ============================================================================
   Kimi K3 — feature-state driver (window.K3States).

   Drives the 28 test-harness feature states. Called by host boot after the
   pairing mounts, when `?state=<key>` is present. Each key sets up a
   specific, reproducible view of the active thread (and, where needed, a
   specific thread) so the matrix/feature-state sweeps can capture exactly
   the state the audit requires.

   Contract (HANDOFF §7):
     K3States.apply(key, ctx)
       -> sets window.__k3.stateApplied = key on success
       -> drives via ctx.store / ctx.data, then K3.emit('data', {...}) or
          selects the target thread so kits repaint.

   Keys (28):
     baseline · long-a-collapsed · long-a-expanded · long-u-collapsed ·
     long-u-expanded · live-activity · activity-collapsed · activity-expanded ·
     questionnaire · questionnaire-history · goal-only · todo-only ·
     subagents-only · diff-only · goal-todo · all-surfaces · search-current ·
     search-all · lens-select · lens-applied · thought-collapsed ·
     thought-expanded · stop-visible · send-visible · draft-restored ·
     artifact-handoff · deep-jump · mount-restored

   Where a key's ideal payload does not exist on a single thread, the closest
   thread is chosen and the substitution is recorded in TEST_REPORT.md.
   ========================================================================== */
(function () {
  'use strict';

  // ---- target threads / messages per spec (HANDOFF §7) -------------------
  var T = {
    baseline:        'thread-01',
    longA:           'thread-01',  // t01-m0014 (assistant, collapsedByDefault)
    longU:           'thread-03',  // t03-m0005 (user, collapsedByDefault)
    activity:        'thread-05',  // t05-m0008 activityGroup
    questionnaire:   'thread-12',  // active questionnaire, 2 queued
    questionnaireHistory: 'thread-03',
    goalOnly:        'thread-11',  // has goal + todo; hide todo via surfaceView
    todoOnly:        'thread-06',  // has goal + todo; hide goal via goalView.cleared
    subagentsOnly:   'thread-05',
    diffOnly:        'thread-10',  // has subs + diffs + activity; isolate diff
    goalTodo:        'thread-11',
    allSurfaces:     'thread-01',  // goal + todo + subs + diffs + activity + artifact
    searchLong:      'thread-09',  // 121-msg long thread
    lensThread:      'thread-02',  // augment ships a focus/mute applied lens here
    lensSubcompact:  'thread-09',
    thought:         'thread-11',  // t11-m0006: one complete + one active segment
    draft:           'thread-08',  // "Draft recovery check"
    artifact:        'thread-13',  // artifacts (editor-tab handoff)
    deepJump:        'thread-09'   // t09-m0113 — older, paged-out message
  };

  var M = {
    longA:        't01-m0014',
    longU:        't03-m0005',
    activity:     't05-m0008',
    thought:      't11-m0006',
    deepJump:     't09-m0113'
  };

  var SEARCH = {
    current: 'retention window nine days',   // lives in thread-09 long history
    all:     'canonical source history'      // unique to thread-09 collapsed msg
  };

  function emit(ctx, type, extra) {
    var K3 = window.K3;
    if (K3 && typeof K3.emit === 'function') K3.emit('data', Object.assign({ type: type }, extra || {}));
  }

  // Reset the view-shaping store slices to a clean baseline so successive
  // state drives (within one page load) don't bleed into each other.
  function resetViewSlices(ctx) {
    var s = ctx.store;
    s.set('collapsedMessages', {});
    s.set('expandedMessages', {});
    s.set('lens', {});
    s.set('goalView', {});
    s.set('surfaceView', {});
    s.set('search', { query: '', scope: 'current', selectedResult: null, focusTarget: null });
    s.set('thoughtPref', { keepActiveExpanded: false });
  }

  function selectThread(ctx, tid) {
    ctx.store.set('activeThreadId', tid);
    emit(ctx, 'threads-changed');
  }

  // ---- individual state drivers ------------------------------------------
  var DRIVERS = {

    baseline: function (ctx) {
      // A clean sustained-conversation reference. thread-01 ships a pending
      // questionnaire by default; dismiss it here so the baseline shows the
      // composer + conversation (the questionnaire state covers it on its own).
      resetViewSlices(ctx);
      selectThread(ctx, T.baseline);
      var q = ctx.data.activeQuestionnaire(T.baseline);
      if (q) ctx.data.cancelQuestionnaire(T.baseline, q.id);
    },

    'long-a-collapsed': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.longA);
      // ensure the long assistant message is collapsed (its resting default)
      var s = ctx.store;
      var c = Object.assign({}, s.get('collapsedMessages', {}));
      c[M.longA] = true;
      var e = Object.assign({}, s.get('expandedMessages', {}));
      delete e[M.longA];
      s.set('collapsedMessages', c);
      s.set('expandedMessages', e);
      emit(ctx, 'threads-changed');
    },

    'long-a-expanded': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.longA);
      var s = ctx.store;
      var c = Object.assign({}, s.get('collapsedMessages', {}));
      delete c[M.longA];
      var e = Object.assign({}, s.get('expandedMessages', {}));
      e[M.longA] = true;
      s.set('collapsedMessages', c);
      s.set('expandedMessages', e);
      emit(ctx, 'threads-changed');
    },

    'long-u-collapsed': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.longU);
      var s = ctx.store;
      var c = Object.assign({}, s.get('collapsedMessages', {}));
      c[M.longU] = true;
      var e = Object.assign({}, s.get('expandedMessages', {}));
      delete e[M.longU];
      s.set('collapsedMessages', c);
      s.set('expandedMessages', e);
      emit(ctx, 'threads-changed');
    },

    'long-u-expanded': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.longU);
      var s = ctx.store;
      var c = Object.assign({}, s.get('collapsedMessages', {}));
      delete c[M.longU];
      var e = Object.assign({}, s.get('expandedMessages', {}));
      e[M.longU] = true;
      s.set('collapsedMessages', c);
      s.set('expandedMessages', e);
      emit(ctx, 'threads-changed');
    },

    'live-activity': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.baseline);
      // start a fake working sequence on the baseline thread
      ctx.data.send(T.baseline, 'Continue from the last point');
      emit(ctx, 'working');
    },

    'activity-collapsed': function (ctx) {
      // Completed activity history, collapsed (its resting default).
      resetViewSlices(ctx);
      selectThread(ctx, T.activity);
      emit(ctx, 'threads-changed');
    },

    'activity-expanded': function (ctx) {
      // Completed activity history, expanded. The activity card renders inline
      // per-message as a kit accordion whose open state is local DOM (not a
      // store key), so we expand it by clicking its header after mount.
      resetViewSlices(ctx);
      selectThread(ctx, T.activity);
      emit(ctx, 'threads-changed');
      setTimeout(function () {
        try {
          var head = document.querySelector('[data-testid="k3t-activity"] .k3t-rowhead');
          if (head && head.getAttribute('aria-expanded') !== 'true') head.click();
        } catch (e) { /* not mounted yet */ }
      }, 80);
    },

    questionnaire: function (ctx) {
      resetViewSlices(ctx);
      // thread-12 ships an active questionnaire with a second queued.
      selectThread(ctx, T.questionnaire);
      emit(ctx, 'threads-changed');
    },

    'questionnaire-history': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.questionnaireHistory);
      emit(ctx, 'threads-changed');
    },

    'goal-only': function (ctx) {
      // thread-11 has goal + todo; hide the todo surface.
      resetViewSlices(ctx);
      selectThread(ctx, T.goalOnly);
      var s = ctx.store;
      var sv = Object.assign({}, s.get('surfaceView', {}));
      sv[T.goalOnly] = Object.assign({}, sv[T.goalOnly] || {}, { todoOpen: false, todoHidden: true });
      s.set('surfaceView', sv);
      emit(ctx, 'threads-changed');
    },

    'todo-only': function (ctx) {
      // thread-06 has goal + todo; hide the goal surface via goalView.cleared.
      resetViewSlices(ctx);
      selectThread(ctx, T.todoOnly);
      var s = ctx.store;
      var gv = Object.assign({}, s.get('goalView', {}));
      gv[T.todoOnly] = Object.assign({}, gv[T.todoOnly] || {}, { cleared: true });
      s.set('goalView', gv);
      emit(ctx, 'threads-changed');
    },

    'subagents-only': function (ctx) {
      // thread-05 has subagents + activity; suppress the activity surface.
      resetViewSlices(ctx);
      selectThread(ctx, T.subagentsOnly);
      var s = ctx.store;
      var sv = Object.assign({}, s.get('surfaceView', {}));
      sv[T.subagentsOnly] = Object.assign({}, sv[T.subagentsOnly] || {}, { activityOpen: false });
      s.set('surfaceView', sv);
      emit(ctx, 'threads-changed');
    },

    'diff-only': function (ctx) {
      // thread-10 has subs + diffs + activity; isolate the diff surface.
      resetViewSlices(ctx);
      selectThread(ctx, T.diffOnly);
      var s = ctx.store;
      var sv = Object.assign({}, s.get('surfaceView', {}));
      sv[T.diffOnly] = Object.assign({}, sv[T.diffOnly] || {}, { subagentsOpen: false, activityOpen: false });
      s.set('surfaceView', sv);
      emit(ctx, 'threads-changed');
    },

    'goal-todo': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.goalTodo);
      emit(ctx, 'threads-changed');
    },

    'all-surfaces': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.allSurfaces); // goal + todo + subs + diffs + activity + artifact
      emit(ctx, 'threads-changed');
    },

    'search-current': function (ctx) {
      // Current-Thread scope on the long thread; the result opens the popup.
      resetViewSlices(ctx);
      selectThread(ctx, T.searchLong);
      var s = ctx.store;
      s.set('search', { query: SEARCH.current, scope: 'current', selectedResult: null, focusTarget: null });
      // run the search via the data facade so results are materialised
      try {
        var res = ctx.data.search(SEARCH.current, { scope: 'current', threadId: T.searchLong });
        s.set('search', { query: SEARCH.current, scope: 'current', selectedResult: (res[0] || null), focusTarget: null });
      } catch (e) { /* search popup will run live if facade differs */ }
      emit(ctx, 'threads-changed');
    },

    'search-all': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.searchLong);
      var s = ctx.store;
      s.set('search', { query: SEARCH.all, scope: 'all', selectedResult: null, focusTarget: null });
      try {
        var res = ctx.data.search(SEARCH.all, { scope: 'all' });
        s.set('search', { query: SEARCH.all, scope: 'all', selectedResult: (res[0] || null), focusTarget: null });
      } catch (e) { /* search popup will run live */ }
      emit(ctx, 'threads-changed');
    },

    'lens-select': function (ctx) {
      // thread-02: enter selection mode (mute). Augment's applied lens is NOT
      // active here — this is the pre-Apply selection state.
      resetViewSlices(ctx);
      selectThread(ctx, T.lensThread);
      ctx.data.setSelecting(T.lensThread, true);
      emit(ctx, 'threads-changed');
    },

    'lens-applied': function (ctx) {
      // thread-02: surface the augment's focus/mute applied shaping.
      resetViewSlices(ctx);
      selectThread(ctx, T.lensThread);
      // The augment merges its lensExamples into K3Data at init, so the
      // applied shaping is already present on the thread; just ensure the
      // store lens slice reflects it (selecting off, applied populated).
      var s = ctx.store;
      var lens = Object.assign({}, s.get('lens', {}));
      // mirror the facade's applied lens into the store slice if absent
      try {
        var st = ctx.data.lensState(T.lensThread);
        lens[T.lensThread] = st;
      } catch (e) { /* applied already merged by augment */ }
      s.set('lens', lens);
      emit(ctx, 'lens-changed', { threadId: T.lensThread });
    },

    'thought-collapsed': function (ctx) {
      // thread-11 t11-m0006: active segment auto-collapses (keepActiveExpanded=false)
      resetViewSlices(ctx);
      selectThread(ctx, T.thought);
      ctx.store.set('thoughtPref', { keepActiveExpanded: false });
      emit(ctx, 'threads-changed');
    },

    'thought-expanded': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.thought);
      ctx.store.set('thoughtPref', { keepActiveExpanded: true });
      emit(ctx, 'threads-changed');
    },

    'stop-visible': function (ctx) {
      // Agent working, composer empty -> Stop button. The composer's Send/Stop
      // morph reads its live textarea, so after clearing the store draft we
      // also clear the mounted textarea and fire its input event so the morph
      // reflects the real Stop state.
      resetViewSlices(ctx);
      selectThread(ctx, T.baseline);
      // cancel any pre-existing questionnaire so the composer is reachable,
      // clear the draft, then start working.
      var q = ctx.data.activeQuestionnaire(T.baseline);
      if (q) ctx.data.cancelQuestionnaire(T.baseline, q.id);
      ctx.data.clearDraft(T.baseline);
      ctx.data.send(T.baseline, ' ');  // empty-ish send triggers working; draft stays empty
      try {
        var ta = document.querySelector('[data-testid="k3-composer-input"]');
        if (ta) {
          ta.value = '';
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } catch (e) { /* textarea not mounted */ }
      emit(ctx, 'working');
    },

    'send-visible': function (ctx) {
      // Agent working while a draft is present -> Send button. The composer's
      // Send/Stop morph reads its live textarea (not just the store draft),
      // so after starting work + saving the draft we also mirror the draft
      // text into the mounted textarea and fire its input event so the morph
      // reflects the real Send state.
      resetViewSlices(ctx);
      selectThread(ctx, T.baseline);
      var q = ctx.data.activeQuestionnaire(T.baseline);
      if (q) ctx.data.cancelQuestionnaire(T.baseline, q.id);
      ctx.data.send(T.baseline, 'Pick this back up');   // begins working
      ctx.data.saveDraft(T.baseline, 'Follow up on the artifact path'); // draft present
      // mirror into the live composer textarea so the Send/Stop morph is real
      try {
        var ta = document.querySelector('[data-testid="k3-composer-input"]');
        if (ta) {
          ta.value = 'Follow up on the artifact path';
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } catch (e) { /* textarea not mounted; store draft still set */ }
      emit(ctx, 'working');
    },

    'draft-restored': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.draft);
      ctx.data.saveDraft(T.draft, 'Restored draft after restart — checkpoint at the cedar marker');
      try { ctx.data.pushRevision(T.draft, 'Earlier draft: review the import path before resending'); } catch (e) { /* */ }
      ctx.data.simulateRestart();
      emit(ctx, 'restarted');
    },

    'artifact-handoff': function (ctx) {
      resetViewSlices(ctx);
      selectThread(ctx, T.artifact);
      // Push the thread's first artifact into the fake editor-tab set so the
      // handoff (source stays in thread, opens in an editor tab) is visible.
      var t = ctx.data.thread(T.artifact);
      var arts = (t && t.artifacts) || [];
      var tabs = ctx.store.get('openTabs', []).slice();
      arts.slice(0, 2).forEach(function (a) {
        if (!tabs.some(function (tb) { return tb.id === a.id; })) {
          tabs.push({ id: a.id, title: a.title, kind: a.kind, projectPath: a.projectPath, target: a.openTarget || 'editor tab' });
        }
      });
      ctx.store.set('openTabs', tabs);
      emit(ctx, 'threads-changed');
    },

    'deep-jump': function (ctx) {
      // Reveal an older, paged-out message in the long thread.
      resetViewSlices(ctx);
      selectThread(ctx, T.deepJump);
      // Defer the reveal one tick so the thread has mounted + paged first.
      var K3 = window.K3;
      setTimeout(function () {
        if (K3 && typeof K3.emit === 'function') K3.emit('reveal-message', { threadId: T.deepJump, messageId: M.deepJump });
      }, 60);
    },

    'mount-restored': function (ctx) {
      // Non-trivial store state already present; this key simply asserts the
      // mount restores it. Set a representative slice + active thread.
      resetViewSlices(ctx);
      selectThread(ctx, T.baseline);
      var s = ctx.store;
      var e = Object.assign({}, s.get('expandedMessages', {}));
      e[M.longA] = true;
      s.set('expandedMessages', e);
      var sv = Object.assign({}, s.get('surfaceView', {}));
      sv[T.baseline] = Object.assign({}, sv[T.baseline] || {}, { activityOpen: true, todoOpen: true });
      s.set('surfaceView', sv);
      emit(ctx, 'threads-changed');
    }
  };

  var KEYS = [
    'baseline',
    'long-a-collapsed', 'long-a-expanded',
    'long-u-collapsed', 'long-u-expanded',
    'live-activity',
    'activity-collapsed', 'activity-expanded',
    'questionnaire', 'questionnaire-history',
    'goal-only', 'todo-only', 'subagents-only', 'diff-only',
    'goal-todo', 'all-surfaces',
    'search-current', 'search-all',
    'lens-select', 'lens-applied',
    'thought-collapsed', 'thought-expanded',
    'stop-visible', 'send-visible',
    'draft-restored', 'artifact-handoff',
    'deep-jump', 'mount-restored'
  ];

  function apply(key, ctx) {
    var fn = DRIVERS[key];
    if (typeof fn !== 'function') {
      if (window.__k3) window.__k3.stateApplied = null;
      return false;
    }
    try {
      fn(ctx || (window.K3 && window.K3.makeCtx ? window.K3.makeCtx() : { store: window.K3Store, data: window.K3Data }));
      if (window.__k3) window.__k3.stateApplied = key;
      return true;
    } catch (e) {
      if (window.__k3) window.__k3.stateApplied = null;
      if (window.console) console.warn('[K3States] state "' + key + '" failed:', e && e.message);
      return false;
    }
  }

  window.K3States = { apply: apply, KEYS: KEYS, drivers: Object.keys(DRIVERS) };
})();
