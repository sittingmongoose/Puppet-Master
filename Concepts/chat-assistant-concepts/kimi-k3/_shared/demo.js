/* ============================================================================
   Kimi K3 — deterministic demo trigger API (window.K3Demo).

   Consumed by _shared/states.js (URL ?state= keys), the ?demo=1 dev drawer,
   and the index.html "Demo triggers" broadcast. NO production UI references
   this module.

   Every method takes ctx first and operates on the ACTIVE thread unless an
   argument says otherwise. Cross-module references (K3Route, K3Access,
   K3BSD, K3Sync, K3Attachments, K3ThreadOps, K3Work, K3ArtifactWS, K3Lens)
   are LAZY — resolved as window.K3Xxx at call time so load order never
   matters; each lazy call has a direct store/data fallback so a trigger
   still lands when the owning module is absent.

   Deterministic: fixed UTC timestamps, ids from session counters
   ('k3d-' prefix). No timers — multi-step flows (reconnect) advance one
   step per call.

   Full scenario reset = reload with a fresh `sess` query param (persisted
   semantic slice is per-session). resetScenario() below is the reload-free
   path: clears persistence, resets the semantic slice, re-seeds the packet
   storeSeeds (BSD fixtures), then simulates a restart.
   ========================================================================== */
(function () {
  'use strict';

  var FIXED_AT = '2026-08-08T15:20:00Z';
  var idSeq = 0;
  var lastRequestId = null;

  function nextId(kind) { idSeq += 1; return 'k3d-' + kind + '-' + idSeq; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function activeTid(ctx) { return ctx.store.get('activeThreadId', null); }
  function threadOf(ctx, tid) { return ctx.data.thread(tid || activeTid(ctx)); }
  function emit(ctx, evt) { ctx.emit('data', evt); }
  function touch(ctx, tid, type) { ctx.data.touchThread(tid || activeTid(ctx), type || 'threads-changed'); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function anchorFor(testids) {
    for (var i = 0; i < testids.length; i++) {
      var hit = document.querySelector('[data-testid="' + testids[i] + '"]');
      if (hit) return hit;
    }
    return document.body;
  }

  /* --- history (window modules read these surfaceView flags) ----------------- */
  // Per-window "open" keys; w1/w8 keep history-open in module-local state, so
  // the demo falls back to pinning there (pin forces the history open).
  var HISTORY_OPEN_KEYS = {
    w1: null,
    w2: null, // persistent rail — always open
    w3: { key: 'w3Tab', value: 'chats' },
    w5: { key: 'w5ConsoleOpen', value: true },
    w6: { key: 'w6Panel', value: 'chats' },
    w7: { key: 'w7ChatsOpen', value: true },
    w8: null
  };
  function pinKey(ctx) { return (ctx.env.windowId || 'w1') + 'HistoryPinned'; }
  function compactKey(ctx) { return (ctx.env.windowId || 'w1') + 'HistoryCompact'; }
  function setSurface(ctx, tid, key, value) {
    ctx.store.set('surfaceView.' + tid + '.' + key, value);
  }

  var K3Demo = {
    /* --- scenario ---------------------------------------------------------- */
    resetScenario: function (ctx) {
      window.K3Store.clearPersisted();
      window.K3Store.resetSemantic();
      var pkt = window.K3_DEMO_PACKET;
      if (pkt && pkt.storeSeeds) {
        Object.keys(pkt.storeSeeds).forEach(function (key) {
          ctx.store.set(key, clone(pkt.storeSeeds[key]));
        });
      }
      if (typeof ctx.data.simulateRestart === 'function') ctx.data.simulateRestart();
      emit(ctx, { type: 'threads-changed' });
      return true;
    },

    /* --- history ------------------------------------------------------------ */
    openHistory: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var spec = HISTORY_OPEN_KEYS[ctx.env.windowId || 'w1'];
      if (spec) {
        setSurface(ctx, tid, spec.key, spec.value);
        if (ctx.env.windowId === 'w6') setSurface(ctx, tid, 'w6PanelOpen', true);
      } else {
        // w1/w8: history-open is module-local; pin forces it open.
        setSurface(ctx, tid, pinKey(ctx), true);
      }
      touch(ctx, tid);
      return true;
    },
    closeHistory: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var spec = HISTORY_OPEN_KEYS[ctx.env.windowId || 'w1'];
      if (spec) {
        setSurface(ctx, tid, spec.key, spec.key === 'w3Tab' ? null : false);
        if (ctx.env.windowId === 'w6') setSurface(ctx, tid, 'w6PanelOpen', false);
      } else if (ctx.store.get('surfaceView.' + tid + '.' + pinKey(ctx), false)) {
        // was opened via the pin fallback — release it
        setSurface(ctx, tid, pinKey(ctx), false);
      }
      touch(ctx, tid);
      return true;
    },
    pinHistory: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      setSurface(ctx, tid, pinKey(ctx), true);
      touch(ctx, tid);
      return true;
    },
    unpinHistory: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      setSurface(ctx, tid, pinKey(ctx), false);
      touch(ctx, tid);
      return true;
    },
    togglePinnedCompact: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var key = compactKey(ctx);
      setSurface(ctx, tid, key, !ctx.store.get('surfaceView.' + tid + '.' + key, false));
      touch(ctx, tid);
      return true;
    },

    /* --- questions ------------------------------------------------------------ */
    // Resets the thread's first questionnaire to a fresh unresolved flow;
    // fabricates a two-question flow when the thread has none.
    triggerQuestionFlow: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      if (!t) return false;
      t.questionnaires = arr(t.questionnaires);
      if (t.questionnaires.length === 0) {
        t.questionnaires.push({
          id: 'k3q-demo-flow',
          status: 'incomplete',
          createdAt: FIXED_AT,
          currentQuestionIndex: 0,
          questions: [
            { id: 'q1', prompt: 'Which routes must appear in the first rail?', kind: 'multi select', required: true, options: ['Anthropic', 'OpenAI', 'Google', 'xAI'], selected: [] },
            { id: 'q2', prompt: 'Anything the migration note must call out?', kind: 'freeform', required: false, draft: '' }
          ]
        });
        touch(ctx, tid);
      }
      var qid = t.questionnaires[0].id;
      ctx.store.set('questionnaires.' + tid + '.' + qid, {
        answers: {}, skipped: {}, currentIndex: 0, status: null, resolvedAt: null
      });
      emit(ctx, { type: 'questionnaire-updated', threadId: tid, questionnaireId: qid });
      return true;
    },
    answerCurrent: function (ctx) {
      var tid = activeTid(ctx);
      var mq = ctx.data.activeQuestionnaire(tid);
      if (!mq) return false;
      var q = mq.questions[mq.currentQuestionIndex] || mq.questions[0];
      if (!q) return false;
      var value = q.kind === 'freeform'
        ? 'Keep the migration note short.'
        : [arr(q.options)[0] || 'Yes'];
      ctx.data.answerQuestion(tid, mq.id, q.id, value);
      ctx.data.navigateQuestion(tid, mq.id, Math.min(mq.currentQuestionIndex + 1, mq.questions.length - 1));
      return true;
    },
    skipCurrent: function (ctx) {
      var tid = activeTid(ctx);
      var mq = ctx.data.activeQuestionnaire(tid);
      if (!mq) return false;
      var q = mq.questions[mq.currentQuestionIndex] || mq.questions[0];
      return q ? ctx.data.skipQuestion(tid, mq.id, q.id) : false;
    },
    cancelFlow: function (ctx) {
      var tid = activeTid(ctx);
      var mq = ctx.data.activeQuestionnaire(tid);
      return mq ? ctx.data.cancelQuestionnaire(tid, mq.id) : false;
    },
    submitFlow: function (ctx) {
      var tid = activeTid(ctx);
      var mq = ctx.data.activeQuestionnaire(tid);
      if (!mq) return false;
      // auto-answer any missing required question so the demo submit lands
      mq.questions.forEach(function (q) {
        if (!q.required) return;
        var answered = q.kind === 'freeform'
          ? (typeof q.draft === 'string' && q.draft.trim().length > 0)
          : arr(q.selected).length > 0;
        if (!answered) {
          ctx.data.answerQuestion(tid, mq.id, q.id,
            q.kind === 'freeform' ? 'Noted in the migration doc.' : [arr(q.options)[0] || 'Yes']);
        }
      });
      return ctx.data.submitQuestionnaire(tid, mq.id);
    },
    resetFlow: function (ctx) { return K3Demo.triggerQuestionFlow(ctx); },

    /* --- goal (via K3Work) ------------------------------------------------------ */
    goalStart: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      if (!t) return false;
      if (t.activeGoal && t.activeGoal.status === 'paused') return window.K3Work.resumeGoal(tid);
      return window.K3Work.startGoal(tid, t.activeGoal ? undefined : {
        title: 'Ship the route picker',
        objective: 'Ship the provider/account/model route picker with explicit connections, setup states, and material route warnings.',
        phase: 'Discovery',
        progress: { done: 0, total: 4 }
      });
    },
    goalPause: function (ctx) { return window.K3Work.pauseGoal(activeTid(ctx)); },
    goalResume: function (ctx) { return window.K3Work.resumeGoal(activeTid(ctx)); },
    goalUpdate: function (ctx) {
      return window.K3Work.updateGoal(activeTid(ctx), {
        phase: 'Verification',
        note: 'Phase advanced to Verification.'
      });
    },
    goalStop: function (ctx) { return window.K3Work.stopGoal(activeTid(ctx)); },
    goalReplan: function (ctx) {
      return window.K3Work.replanGoal(activeTid(ctx), 'Re-scoped around the provider allowance reserve.');
    },
    goalComplete: function (ctx) { return window.K3Work.completeGoal(activeTid(ctx)); },
    goalBlocked: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      if (!t || !t.activeGoal) return false;
      var goal = t.activeGoal;
      goal.status = 'blocked';
      goal.canPause = false;
      goal.canResume = true;
      goal.canStop = true;
      goal.blockedCause = 'Waiting on the OpenAI API key connection';
      var gv = ctx.store.get('goalView.' + tid, null) || {};
      gv.expanded = true;
      ctx.store.set('goalView.' + tid, gv);
      touch(ctx, tid);
      return goal;
    },

    /* --- todos ------------------------------------------------------------------- */
    todoAdd: function (ctx, label) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      if (!t) return false;
      t.todo = t.todo || { id: nextId('todo'), items: [] };
      t.todo.items = arr(t.todo.items);
      var item = {
        id: nextId('td'),
        label: label || 'Write the migration note for Plans',
        state: 'pending'
      };
      t.todo.items.push(item);
      var goal = t.activeGoal;
      if (goal && goal.progress) goal.progress.total = (goal.progress.total || 0) + 1;
      touch(ctx, tid);
      return item;
    },
    todoComplete: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      var items = (t && t.todo) ? arr(t.todo.items) : [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].state !== 'complete') {
          items[i].state = 'complete';
          var goal = t.activeGoal;
          if (goal && goal.progress) goal.progress.done = Math.min((goal.progress.done || 0) + 1, goal.progress.total || 99);
          touch(ctx, tid);
          return items[i];
        }
      }
      return null;
    },
    todoReopen: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      var items = (t && t.todo) ? arr(t.todo.items) : [];
      for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].state === 'complete') {
          items[i].state = 'pending';
          var goal = t.activeGoal;
          if (goal && goal.progress) goal.progress.done = Math.max(0, (goal.progress.done || 0) - 1);
          touch(ctx, tid);
          return items[i];
        }
      }
      return null;
    },

    /* --- subagents ----------------------------------------------------------------- */
    subagentSpawn: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      if (!t) return false;
      t.subagentGroups = arr(t.subagentGroups);
      if (t.subagentGroups.length === 0) {
        t.subagentGroups.push({
          id: nextId('sg'), label: 'Route research crew', state: 'working',
          counts: { working: 0, complete: 0, blocked: 0, waiting: 0 }, agents: []
        });
      }
      var g = t.subagentGroups[0];
      g.agents = arr(g.agents);
      g.agents.push({
        name: 'xAI route reviewer',
        task: 'Review the Grok route against the capability matrix',
        route: 'xai/work/grok-4.5',
        status: 'waiting',
        currentActivity: 'Queued — wave two',
        workedSeconds: 0
      });
      recountAgents(g);
      touch(ctx, tid);
      return g;
    },
    subagentAdvance: function (ctx) {
      return mutateAgent(ctx, function (a) {
        if (a.status === 'waiting' || a.status === 'queued') {
          a.status = 'working';
          a.currentActivity = 'Reading provider sources';
          return true;
        }
        if (a.status === 'working') {
          a.workedSeconds = (a.workedSeconds || 0) + 30;
          a.currentActivity = 'Drafting findings (' + a.workedSeconds + 's in)';
          return true;
        }
        return false;
      });
    },
    subagentComplete: function (ctx) {
      return mutateAgent(ctx, function (a) {
        if (a.status !== 'working') return false;
        a.status = 'complete';
        a.currentActivity = 'Completed — findings attached to the Goal evidence';
        return true;
      });
    },
    subagentFail: function (ctx) {
      return mutateAgent(ctx, function (a) {
        if (a.status !== 'working' && a.status !== 'waiting' && a.status !== 'queued') return false;
        a.status = 'failed';
        a.currentActivity = 'Failed — provider allowance exhausted';
        return true;
      });
    },
    subagentStop: function (ctx) {
      return mutateAgent(ctx, function (a) {
        if (a.status !== 'working') return false;
        a.status = 'stopped';
        a.currentActivity = 'Stopped by you';
        return true;
      });
    },

    /* --- activity ------------------------------------------------------------------- */
    advanceActivity: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      ctx.data.appendRecord(tid, {
        body: 'Follow-up pass complete.',
        activityGroup: {
          id: nextId('activity'),
          status: 'complete',
          workedSeconds: 12,
          compactLabel: '1 stage completed',
          stages: [{
            kind: 'search', label: 'Searched repository', count: 2,
            durationSeconds: 12, status: 'complete',
            summary: 'Looked up route vocabulary across Plans and Concepts.'
          }]
        }
      });
      return true;
    },

    /* --- diff ------------------------------------------------------------------------ */
    createDiff: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      if (!t) return false;
      t.diffGroups = arr(t.diffGroups);
      if (t.diffGroups.length > 0) return t.diffGroups[0];
      var g = {
        id: nextId('diff'),
        label: 'Route picker edits',
        files: [
          { path: 'Concepts/settings/ProviderManager.tsx', added: 214, removed: 96, status: 'edited' },
          { path: 'Concepts/settings/provider-routes.ts', added: 88, removed: 12, status: 'edited' },
          { path: 'docs/provider-settings.md', added: 47, removed: 0, status: 'added' }
        ]
      };
      t.diffGroups.push(g);
      touch(ctx, tid);
      return g;
    },
    updateDiff: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      var g = t && arr(t.diffGroups)[0];
      if (!g) return K3Demo.createDiff(ctx) ? K3Demo.updateDiff(ctx) : null;
      g.files[0].added += 12;
      g.files[0].removed += 2;
      g.label = 'Route picker edits (updated)';
      touch(ctx, tid);
      return g;
    },
    // Opens the thread's diff: the diff-kind artifact in the left workspace
    // when one exists (thread-16), else the diff surface's open flag.
    diffOpen: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      if (!t) return false;
      if (arr(t.diffGroups).length === 0 && !K3Demo.createDiff(ctx)) return false;
      var diffArt = null;
      arr(t.artifacts).forEach(function (a) { if (!diffArt && a && a.kind === 'diff') diffArt = a; });
      if (diffArt && window.K3ArtifactWS && typeof window.K3ArtifactWS.open === 'function') {
        return window.K3ArtifactWS.open(ctx, tid, diffArt.id);
      }
      setSurface(ctx, tid, 'diffOpen', true);
      touch(ctx, tid);
      return true;
    },

    /* --- artifacts (via K3ArtifactWS) -------------------------------------------------- */
    artifactOpen: function (ctx, artifactId) {
      var tid = activeTid(ctx);
      var arts = tid ? arr(threadOf(ctx, tid).artifacts) : [];
      var id = artifactId || (arts[0] && arts[0].id);
      if (!id) return false;
      return window.K3ArtifactWS.open(ctx, tid, id);
    },
    artifactClose: function (ctx) {
      return window.K3ArtifactWS.close(ctx, activeTid(ctx));
    },
    artifactSwitch: function (ctx, artifactId) {
      var tid = activeTid(ctx);
      var arts = tid ? arr(threadOf(ctx, tid).artifacts) : [];
      if (arts.length === 0) return false;
      var id = artifactId;
      if (!id) {
        var ws = ctx.store.get('artifactWs.' + tid, {}) || {};
        var idx = -1;
        for (var i = 0; i < arts.length; i++) if (arts[i].id === ws.activeId) idx = i;
        id = arts[(idx + 1) % arts.length].id;
      }
      return window.K3ArtifactWS.switchTo(ctx, tid, id);
    },
    artifactLoading: function (ctx) {
      var tid = activeTid(ctx);
      var ws = ctx.store.get('artifactWs.' + tid, {}) || {};
      return ws.activeId ? window.K3ArtifactWS.setStatus(tid, ws.activeId, 'loading') : false;
    },
    // Puts the active artifact into the error state; the surface's own Retry
    // button drives error -> loading.
    artifactErrorRetry: function (ctx) {
      var tid = activeTid(ctx);
      var ws = ctx.store.get('artifactWs.' + tid, {}) || {};
      return ws.activeId ? window.K3ArtifactWS.setStatus(tid, ws.activeId, 'error') : false;
    },
    artifactSetUpdated: function (ctx) {
      var tid = activeTid(ctx);
      var ws = ctx.store.get('artifactWs.' + tid, {}) || {};
      return ws.activeId ? window.K3ArtifactWS.setStatus(tid, ws.activeId, 'updated') : false;
    },

    /* --- route (K3Route lazy) ------------------------------------------------------------ */
    routePickerDemo: function (ctx) {
      if (window.K3Route && typeof window.K3Route.openPicker === 'function') {
        return window.K3Route.openPicker(ctx, anchorFor(['k3r-route', 'k3w-kit-model']));
      }
      return false;
    },
    selectRoute: function (ctx, routeKey) {
      var tid = activeTid(ctx);
      if (!tid || !routeKey) return false;
      if (window.K3Route && typeof window.K3Route.select === 'function') {
        return window.K3Route.select(ctx, routeKey, {});
      }
      ctx.data.setThreadLocal(tid, { route: routeKey });
      emit(ctx, { type: 'route-changed', threadId: tid, routeKey: routeKey });
      return true;
    },
    injectRouteWarning: function (ctx) {
      var tid = activeTid(ctx);
      var eff = tid ? ctx.data.effective(tid) : null;
      var fromLabel = eff && eff.route
        ? eff.route.providerName + ' · ' + eff.route.accountLabel + ' · ' + eff.route.modelLabel
        : 'Anthropic · Work · Claude Sonnet 4.5';
      ctx.data.appendRecord(tid, {
        routeWarningCard: {
          id: nextId('rw'), kind: 'route-switch',
          headline: 'Switch to Gemini 3 Pro?',
          primary: 'This restarts the prompt cache — earlier context is re-sent to a new provider.',
          fromLabel: fromLabel,
          toLabel: 'Google · Personal · Gemini 3 Pro',
          consequences: [
            { kind: 'cache', text: 'Prompt cache restarts; earlier context is re-sent.' },
            { kind: 'privacy', text: 'Hosting, terms, and data location change with the provider.' },
            { kind: 'cost', text: 'Usage bills to a different account and plan.' },
            { kind: 'context', text: 'Context window changes from 200k to 1M tokens.' }
          ],
          choices: ['continue', 'branch', 'new', 'cancel'],
          // resolveWarning fails closed without a recoverable route — the
          // injected card must carry one or its choice buttons dead-end.
          pendingRoute: { routeKey: 'google/personal/gemini-3-pro', effort: null, speed: null },
          status: 'open'
        }
      });
      emit(ctx, { type: 'route-warning', threadId: tid });
      return true;
    },

    /* --- access (K3Access lazy) ------------------------------------------------------------ */
    setAccess: function (ctx, profile) {
      var tid = activeTid(ctx);
      if (!tid || !profile) return false;
      ctx.data.setThreadLocal(tid, { access: profile });
      emit(ctx, { type: 'access-changed', threadId: tid, access: profile });
      return true;
    },
    injectApproval: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var card = {
        id: nextId('ap'),
        title: 'Run 2 commands?',
        scope: 'Workspace only',
        reason: 'Needed to run the settings test suite',
        commands: ['npm run test -- settings-providers', 'npm run build'],
        files: ['Concepts/settings/**'],
        servers: [], domains: [],
        persistence: 'Allow once applies to this run only',
        saferAlternative: 'Run the read-only static checks instead',
        receipts: ['Node v22.18.0', '2 test files, 41 assertions'],
        decision: null
      };
      ctx.data.appendRecord(tid, { approvalCard: card });
      emit(ctx, { type: 'approval-requested', threadId: tid, approvalId: card.id });
      return card;
    },
    // Records a compact approval decision on the active thread's latest
    // undecided approval card (injects one first when none is pending).
    decideApproval: function (ctx, decision) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var msgs = [];
      try { msgs = ctx.data.messages(tid) || []; } catch (e) { msgs = []; }
      var card = null;
      for (var i = msgs.length - 1; i >= 0; i--) {
        var c = msgs[i] && msgs[i].approvalCard;
        if (c && !c.decision && !(ctx.store.get('approvals.' + c.id, null) || {}).decision) { card = c; break; }
      }
      if (!card) card = K3Demo.injectApproval(ctx);
      if (!card) return false;
      var d = decision || 'once';
      ctx.store.set('approvals.' + card.id, { decision: d, at: FIXED_AT });
      card.decision = d;
      touch(ctx, tid);
      emit(ctx, { type: 'approval-decided', approvalId: card.id, decision: d, threadId: tid });
      return true;
    },

    /* --- bsd (K3BSD lazy) ------------------------------------------------------------------- */
    setBsd: function (ctx, mode, scope) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      if (window.K3BSD && typeof window.K3BSD.set === 'function') {
        return window.K3BSD.set(tid, { mode: mode, scope: scope });
      }
      var cur = ctx.store.get('bsdState.' + tid, {}) || {};
      if (mode != null) cur.mode = mode;
      if (scope != null) cur.scope = scope;
      ctx.store.set('bsdState.' + tid, cur);
      emit(ctx, { type: 'bsd-changed', threadId: tid });
      return true;
    },
    bsdAutoGlow: function (ctx, on) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      if (window.K3BSD && typeof window.K3BSD.setAutoActive === 'function') {
        return window.K3BSD.setAutoActive(tid, !!on);
      }
      var cur = ctx.store.get('bsdState.' + tid, {}) || {};
      cur.autoActive = !!on;
      ctx.store.set('bsdState.' + tid, cur);
      emit(ctx, { type: 'bsd-changed', threadId: tid });
      return true;
    },
    bsdPushAdvice: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var advice = {
        kind: 'advice',
        summary: 'BSD advice: the same model under two accounts is two distinct routes with separate caches.',
        at: FIXED_AT
      };
      if (window.K3BSD && typeof window.K3BSD.pushResult === 'function') {
        window.K3BSD.pushResult(tid, advice);
      } else {
        var cur = ctx.store.get('bsdState.' + tid, {}) || {};
        cur.lastResult = advice;
        ctx.store.set('bsdState.' + tid, cur);
        emit(ctx, { type: 'bsd-advice', threadId: tid, result: advice });
      }
      ctx.data.appendRecord(tid, {
        bsdAdviceCard: {
          id: nextId('bsd'),
          summary: advice.summary,
          detail: 'Caches, billing, and allowance never mix across the Work and Personal connections.',
          state: 'available'
        }
      });
      return true;
    },
    bsdPushResult: function (ctx, kind) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var summaries = {
        silent: 'BSD checked the follow-up — no advice.',
        duplicate: 'BSD suppressed a duplicate suggestion.',
        timeout: 'BSD timed out — the send was never blocked.',
        unavailable: 'BSD unavailable — continuing without advice.',
        quota: 'BSD quota limited — advice resumes next window.'
      };
      var result = { kind: kind || 'silent', summary: summaries[kind] || summaries.silent, at: FIXED_AT };
      if (window.K3BSD && typeof window.K3BSD.pushResult === 'function') {
        window.K3BSD.pushResult(tid, result);
      } else {
        var cur = ctx.store.get('bsdState.' + tid, {}) || {};
        cur.lastResult = result;
        ctx.store.set('bsdState.' + tid, cur);
        emit(ctx, { type: 'bsd-changed', threadId: tid });
      }
      return true;
    },

    /* --- context ----------------------------------------------------------------------------- */
    compactNow: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      ctx.data.appendRecord(tid, {
        receiptCard: {
          id: nextId('receipt'),
          kind: 'compact-now',
          title: 'Context compacted',
          summary: 'Context compacted · 41,200 → 9,800 tokens · 34 messages represented by summary',
          lines: [
            { label: 'Before', value: '41,200 tokens' },
            { label: 'After', value: '9,800 tokens' },
            { label: 'Summary', value: '34 messages represented by summary' }
          ]
        }
      });
      emit(ctx, { type: 'compact-now-done', threadId: tid });
      return true;
    },
    lensReceipt: function (ctx) {
      if (window.K3Lens && typeof window.K3Lens.openReceipt === 'function') {
        return window.K3Lens.openReceipt(ctx, anchorFor(['k3-lens-button', 'k3w-kit-lens']));
      }
      return false;
    },

    /* --- threads (K3ThreadOps lazy) ------------------------------------------------------------ */
    threadRequestTo: function (ctx, targetId) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var spec = {
        source: tid,
        target: targetId || 'thread-09',
        task: 'Summarize the scrollback pacing findings from messages 40-90',
        refs: ['thread-09:t09-m0041', 'thread-09:t09-m0063'],
        scope: 'read-only, bounded range',
        budget: '1 response, 400 words max'
      };
      if (window.K3ThreadOps && typeof window.K3ThreadOps.sendRequest === 'function') {
        var rec = window.K3ThreadOps.sendRequest(spec);
        if (rec && rec.id) lastRequestId = rec.id;
        return rec;
      }
      // fallback: fabricate the pending typed record + transcript card
      var t = threadOf(ctx, tid);
      t.threadRequests = arr(t.threadRequests);
      var request = {
        id: nextId('tr'),
        sourceThread: spec.source,
        targetThread: spec.target,
        sender: 'Assistant (Kimi K3)',
        boundedTask: spec.task,
        evidenceRefs: spec.refs.slice(),
        scope: spec.scope,
        budget: spec.budget,
        createdAt: FIXED_AT,
        status: 'pending',
        resultRefs: []
      };
      t.threadRequests.push(request);
      lastRequestId = request.id;
      ctx.data.appendRecord(tid, { threadRequestCard: { id: nextId('trc'), requestId: request.id } });
      touch(ctx, tid);
      return request;
    },
    threadAwait: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid || !lastRequestId) return false;
      if (window.K3ThreadOps && typeof window.K3ThreadOps.awaitRequest === 'function') {
        return window.K3ThreadOps.awaitRequest(lastRequestId);
      }
      var t = threadOf(ctx, tid);
      var reqs = arr(t && t.threadRequests);
      for (var i = 0; i < reqs.length; i++) {
        if (reqs[i].id === lastRequestId) {
          reqs[i].status = 'answered';
          reqs[i].respondedAt = FIXED_AT;
          reqs[i].resultRefs = ['thread-09:summary-scrollback-01'];
          touch(ctx, tid);
          return reqs[i];
        }
      }
      return false;
    },
    threadSpawn: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      if (window.K3ThreadOps && typeof window.K3ThreadOps.spawnThread === 'function') {
        return window.K3ThreadOps.spawnThread({
          fromThreadId: tid, kind: 'child',
          task: 'Research the two selected evidence refs only'
        });
      }
      var t = threadOf(ctx, tid);
      var msgs = arr(t && t.messages);
      var atMsg = msgs[msgs.length - 1];
      var child = ctx.data.createThread('Spawned child — bounded research');
      child.lineage = { sourceThreadId: tid, atMessageId: atMsg ? atMsg.id : null, kind: 'child' };
      t.spawnedThreads = arr(t.spawnedThreads);
      t.spawnedThreads.push({
        id: child.id, title: child.title, kind: 'child',
        sourceMessageId: atMsg ? atMsg.id : null, createdAt: FIXED_AT, status: 'running'
      });
      touch(ctx, tid);
      return child;
    },
    threadBranch: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      var msgs = arr(t && t.messages);
      var atMsg = msgs[Math.max(0, msgs.length - 2)];
      if (!t || !atMsg) return false;
      if (window.K3ThreadOps && typeof window.K3ThreadOps.branchFrom === 'function') {
        return window.K3ThreadOps.branchFrom(tid, atMsg.id, {});
      }
      return ctx.data.branchThread(tid, atMsg.id);
    },
    threadRestorePoint: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      if (window.K3ThreadOps && typeof window.K3ThreadOps.createRestorePoint === 'function') {
        return window.K3ThreadOps.createRestorePoint(tid, 'Demo restore point');
      }
      var t = threadOf(ctx, tid);
      t.restorePoints = arr(t.restorePoints);
      var rp = { id: nextId('rp'), label: 'Demo restore point', at: FIXED_AT, messageCount: arr(t.messages).length };
      t.restorePoints.push(rp);
      ctx.data.appendRecord(tid, {
        restorePointCard: { id: rp.id, label: rp.label, at: rp.at, messageCount: rp.messageCount }
      });
      touch(ctx, tid);
      return rp;
    },
    threadRewind: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      var msgs = arr(t && t.messages);
      var atMsg = msgs[Math.max(0, msgs.length - 3)];
      if (!t || !atMsg) return false;
      if (window.K3ThreadOps && typeof window.K3ThreadOps.rewindTo === 'function') {
        return window.K3ThreadOps.rewindTo(tid, atMsg.id);
      }
      ctx.data.appendRecord(tid, {
        body: 'Rewound 2 messages into a collapsed region — nothing was deleted.',
        marker: { kind: 'rewound', count: 2, restorePointId: null }
      });
      return true;
    },
    redirectActive: function (ctx, text) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var redirectText = text || 'Hold on — compare the two Anthropic accounts first.';
      if (window.K3ThreadOps && typeof window.K3ThreadOps.redirect === 'function') {
        return window.K3ThreadOps.redirect(tid, redirectText);
      }
      ctx.data.appendRecord(tid, {
        body: 'Drafting the rollout checklist — first the OpenAI key connection, then…',
        redirectMarker: { state: 'interrupted', note: 'Interrupted — redirected by you' }
      });
      ctx.data.send(tid, redirectText, { noReply: true });
      ctx.data.appendRecord(tid, {
        body: 'Resumed with the new instruction. Work vs Personal on Anthropic: same models, separate connections — billing, allowance, and cache never mix.',
        redirectMarker: { state: 'resumed', note: 'Resumed with redirected instruction' }
      });
      return true;
    },

    /* --- sync (K3Sync lazy; stepper is deterministic — one transition per call) ----------------- */
    goOffline: function (ctx) {
      if (window.K3Sync && typeof window.K3Sync.goOffline === 'function') {
        return window.K3Sync.goOffline(ctx);
      }
      ctx.store.set('sync.state', 'offline');
      emit(ctx, { type: 'sync-changed', state: 'offline' });
      return true;
    },
    queueOffline: function (ctx, text) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var body = text || 'Queued while offline';
      if (window.K3Sync && typeof window.K3Sync.queueSend === 'function') {
        return window.K3Sync.queueSend(tid, body, []);
      }
      var opId = tid + '-' + (++idSeq);
      var outbox = ctx.store.get('outbox', {}) || {};
      outbox[tid] = arr(outbox[tid]);
      outbox[tid].push({
        opId: opId, text: body, attachments: [],
        routeSnapshot: (ctx.data.effective(tid) || {}).routeKey || null,
        queuedAt: FIXED_AT, status: 'queued'
      });
      ctx.store.set('outbox', outbox);
      ctx.store.set('sync.state', 'queued');
      ctx.data.send(tid, body, { opId: opId, queued: true, noReply: true });
      emit(ctx, { type: 'outbox-changed', threadId: tid });
      emit(ctx, { type: 'sync-changed', state: 'queued' });
      return opId;
    },
    // offline/queued -> reconnecting -> replay (outbox flushed, each op applied
    // exactly once via the opId fence) -> snapshot -> live. One step per call.
    reconnectStep: function (ctx) {
      var state = ctx.store.get('sync.state', 'live');
      var next = null;
      if (state === 'offline' || state === 'queued') next = 'reconnecting';
      else if (state === 'reconnecting') next = 'replay';
      else if (state === 'replay') next = 'snapshot';
      else if (state === 'snapshot') next = 'live';
      if (!next) return state;
      ctx.store.set('sync.state', next);
      if (next === 'replay') flushOutbox(ctx);
      emit(ctx, { type: 'sync-changed', state: next });
      return next;
    },
    reconnectFull: function (ctx) {
      if (window.K3Sync && typeof window.K3Sync.reconnect === 'function') {
        return window.K3Sync.reconnect(ctx);
      }
      var guard = 0;
      while (ctx.store.get('sync.state', 'live') !== 'live' && guard++ < 6) {
        K3Demo.reconnectStep(ctx);
      }
      return ctx.store.get('sync.state', 'live');
    },
    failSearchDomain: function (ctx) {
      if (window.K3Sync && typeof window.K3Sync.failDomain === 'function') {
        return window.K3Sync.failDomain('Search index');
      }
      var sync = ctx.store.get('sync', {}) || {};
      sync.domainNotes = arr(sync.domainNotes);
      var exists = sync.domainNotes.some(function (n) { return n && n.id === 'dn-search'; });
      if (!exists) {
        sync.domainNotes.push({ id: 'dn-search', name: 'Search index', state: 'failed', note: 'sync failed · retry', at: FIXED_AT });
      }
      ctx.store.set('sync', sync);
      emit(ctx, { type: 'sync-changed', domain: 'Search index' });
      return true;
    },
    serverContinuing: function (ctx, on) {
      if (window.K3Sync && typeof window.K3Sync.setServerContinuing === 'function') {
        return window.K3Sync.setServerContinuing(!!on);
      }
      ctx.store.set('sync.serverContinuing', !!on);
      emit(ctx, { type: 'sync-changed', serverContinuing: !!on });
      return true;
    },

    /* --- attachments (K3Attachments lazy) ------------------------------------------------------- */
    attachFile: function (ctx, name) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      if (window.K3Attachments && typeof window.K3Attachments.attachDemo === 'function') {
        return window.K3Attachments.attachDemo(ctx, name);
      }
      var draft = ctx.data.getDraft(tid) || { text: '', attachments: [], revisions: [] };
      var atts = draft.attachments.slice();
      atts.push({ id: nextId('file'), name: name || 'demo.mov', status: 'pending' });
      ctx.data.saveDraft(tid, draft.text, atts);
      return true;
    },
    resolveAttachment: function (ctx, choice) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      if (window.K3Attachments && typeof window.K3Attachments.resolveChoice === 'function') {
        return window.K3Attachments.resolveChoice(ctx, choice);
      }
      emit(ctx, { type: 'attachment-resolved', threadId: tid, choice: choice || 'extract' });
      return true;
    },

    /* --- notifications (title-bar inbox feed) ---------------------------------------------------- */
    injectApprovalNeeded: function (ctx) {
      return pushNotification(ctx, {
        id: 'ntf-approval-1', kind: 'approval',
        title: 'Approval needed',
        body: 'A thread wants to run 2 commands — review the approval card in the thread.',
        at: FIXED_AT, read: false
      });
    },
    injectCiFailure: function (ctx) {
      return pushNotification(ctx, {
        id: 'ntf-ci-1', kind: 'ci',
        title: 'CI test failed',
        body: 'settings-providers: 2 assertions failed in the route picker suite.',
        at: FIXED_AT, read: false
      });
    },
    injectProviderUpdate: function (ctx) {
      return pushNotification(ctx, {
        id: 'ntf-update-1', kind: 'provider-update',
        title: 'Provider update available',
        body: 'The xAI connection has an update — scheduled when idle.',
        at: FIXED_AT, read: false
      });
    },
    // redacted lifecycle copy only — never sign-in details
    injectSigninWaiting: function (ctx) {
      return pushNotification(ctx, {
        id: 'ntf-signin-1', kind: 'signin',
        title: 'Secure sign-in waiting for you',
        body: 'Complete the sign-in in the secure window to continue.',
        at: FIXED_AT, read: false
      });
    },

    /* --- ops / crew / grant / spell --------------------------------------------------------------- */
    injectPortConflict: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      if (!t) return false;
      // re-surface the catalog port-3000 lease if it was resolved earlier
      if (t.opsResolutions && t.opsResolutions['port-3000']) {
        delete t.opsResolutions['port-3000'];
      }
      touch(ctx, tid, 'ops-conflict');
      return true;
    },
    worktreeStates: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      touch(ctx, tid, 'ops-conflict'); // catalog worktrees already carry the states
      return true;
    },
    selectCrew: function (ctx, templateId) {
      return window.K3Work.selectCrew(activeTid(ctx), templateId || 'crew-provider-matrix');
    },
    crewWave: function (ctx) {
      var tid = activeTid(ctx);
      var crew = window.K3Work.crew(tid);
      if (!crew) return false;
      var promoted = 0;
      arr(crew.members).forEach(function (m) {
        if (m.status === 'running') {
          m.status = 'complete';
          m.workedSeconds = (m.workedSeconds || 0) + 240;
        } else if ((m.status === 'queued' || m.status === 'waiting') && promoted < 2) {
          m.status = 'running';
          promoted += 1;
        }
      });
      crew.waves = crew.waves || {};
      crew.waves.queued = arr(crew.members).filter(function (m) { return m.status === 'queued' || m.status === 'waiting'; }).length;
      crew.waves.concurrent = arr(crew.members).filter(function (m) { return m.status === 'running'; }).length;
      touch(ctx, tid, 'crew-changed');
      return crew;
    },
    injectCrossProjectGrant: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var card = {
        id: nextId('xp'),
        readProject: 'Project A — Tastebook',
        writeProject: 'Project B — Checkout redesign',
        state: 'open'
      };
      ctx.data.appendRecord(tid, { crossProjectCard: card });
      emit(ctx, { type: 'approval-requested', threadId: tid, approvalId: card.id });
      return card;
    },
    // spell demo is interactive (right-click the composer) — no trigger
    spellDemo: function () { return false; },

    /* --- trigger-contract completion (correction 2026-08-13) ------------------ */
    todoBlock: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      var items = t && t.todo && arr(t.todo.items);
      if (!items.length) return false;
      var target = null;
      items.forEach(function (i) { if (!target && i.state === 'pending') target = i; });
      if (!target) target = items[items.length - 1];
      target.state = 'blocked';
      touch(ctx, tid);
      return true;
    },
    subagentRetry: function (ctx) {
      var tid = activeTid(ctx);
      var t = threadOf(ctx, tid);
      var groups = t && arr(t.subagentGroups);
      if (!groups.length) return false;
      var ag = null;
      groups.forEach(function (g) {
        arr(g.agents).forEach(function (a) { if (!ag && (a.status === 'failed' || a.status === 'blocked')) ag = a; });
      });
      if (!ag) { // no failed agent yet — fail one first so the arc demos end-to-end
        groups.forEach(function (g) {
          arr(g.agents).forEach(function (a) {
            if (!ag && (a.status === 'working' || a.status === 'queued' || a.status === 'waiting for capacity')) {
              a.status = 'failed';
              a.currentActivity = 'Failed — provider allowance exhausted';
              ag = a;
            }
          });
        });
      }
      if (!ag) return false;
      ag.status = 'retrying';
      ag.currentActivity = 'Retrying after the failure — backoff elapsed';
      groups.forEach(function (g) { recountAgents(g); });
      touch(ctx, tid);
      return true;
    },
    decisionBranch: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var card = null;
      arr(ctx.data.messages(tid)).forEach(function (m) {
        if (m.routeWarningCard && m.routeWarningCard.status === 'open') card = m.routeWarningCard;
      });
      if (!card) {
        K3Demo.injectRouteWarning(ctx);
        arr(ctx.data.messages(tid)).forEach(function (m) {
          if (m.routeWarningCard && m.routeWarningCard.status === 'open') card = m.routeWarningCard;
        });
      }
      return card ? window.K3Route.resolveWarning(ctx, tid, card.id, 'branch') : false;
    },
    historyPeek: function (ctx) { return K3Demo.openHistory(ctx); }, // transient, unpinned view
    historySwitchThread: function (ctx) {
      var cur = activeTid(ctx);
      var next = cur === 'thread-16' ? 'thread-17' : 'thread-16';
      ctx.store.set('activeThreadId', next);
      emit(ctx, { type: 'threads-changed' });
      return next;
    },
    worktreeCollision: function (ctx) {
      var tid = activeTid(ctx);
      if (!tid) return false;
      var wts = ctx.data.worktrees();
      var wt = null;
      wts.forEach(function (w) { if (!wt && w.id === 'wt-docs') wt = w; });
      if (!wt) return false;
      wt.state = 'conflict-detected';
      wt.detail = 'Merge conflict surfaced while the Verifier wave wrote — patch staged';
      touch(ctx, tid, 'ops-conflict');
      return true;
    }
  };

  /* --- family helpers --------------------------------------------------------- */
  function recountAgents(g) {
    var counts = { working: 0, complete: 0, blocked: 0, waiting: 0 };
    arr(g.agents).forEach(function (a) {
      if (a.status === 'working') counts.working += 1;
      else if (a.status === 'complete') counts.complete += 1;
      else if (a.status === 'blocked' || a.status === 'failed' || a.status === 'stopped') counts.blocked += 1;
      else counts.waiting += 1;
    });
    g.counts = counts;
    g.state = counts.working > 0 ? 'working' : (counts.waiting > 0 ? 'working' : (counts.complete === arr(g.agents).length ? 'complete' : 'idle'));
  }

  function mutateAgent(ctx, fn) {
    var tid = activeTid(ctx);
    var t = threadOf(ctx, tid);
    var g = t && arr(t.subagentGroups)[0];
    if (!g) return false;
    var agents = arr(g.agents);
    for (var i = 0; i < agents.length; i++) {
      if (fn(agents[i])) {
        recountAgents(g);
        touch(ctx, tid);
        return agents[i];
      }
    }
    return null;
  }

  function flushOutbox(ctx) {
    var outbox = ctx.store.get('outbox', {}) || {};
    var changed = false;
    Object.keys(outbox).forEach(function (tid) {
      arr(outbox[tid]).forEach(function (op) {
        if (op.status !== 'queued') return;
        // idempotent replay: the opId fence in data.send skips re-application
        var applied = ctx.data.send(tid, op.text, { opId: op.opId, noReply: true });
        if (applied === null) {
          // already applied — skipped (logged on the op for the replay receipt)
          op.skipped = 'already applied — skipped';
        }
        ctx.data.markMessageSent(tid, op.opId);
        op.status = 'sent';
        changed = true;
      });
    });
    if (changed) {
      ctx.store.set('outbox', outbox);
      emit(ctx, { type: 'outbox-changed' });
    }
  }

  function pushNotification(ctx, entry) {
    var list = ctx.store.get('notifications', []);
    if (!Array.isArray(list)) list = [];
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === entry.id) idx = i;
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    ctx.store.set('notifications', list);
    emit(ctx, { type: 'notification-added', notification: entry });
    return entry;
  }

  window.K3Demo = K3Demo;
})();
