/* Non-product demo trigger harness — not Chat toolbar. */
(function () {
  'use strict';

  var ctx = null;

  function store() {
    return ctx && ctx.getStore ? ctx.getStore() : null;
  }

  function tid(s) {
    s = s || store();
    return s && s.session && s.session.activeThreadKey;
  }

  function toast(msg) {
    if (ctx && ctx.toast) ctx.toast(msg);
  }

  function refresh() {
    if (ctx && ctx.softRefresh) ctx.softRefresh();
  }

  function ensureThread(s) {
    var id = tid(s);
    if (!id && s && s.threads) {
      var keys = Object.keys(s.threads);
      if (keys[0]) {
        s.selectThread(keys[0]);
        id = keys[0];
      }
    }
    return id;
  }


  var FAN_OUT_MAX = 3;

  function countFanOutChildren(s) {
    if (!s || !s.threads) return 0;
    return Object.keys(s.threads).filter(function (k) {
      return /^thread-branch-/.test(k) || (s.threads[k] && s.threads[k].fanOutChild);
    }).length;
  }

  function spawnRelatedGuarded(s, id, opts) {
    if (countFanOutChildren(s) >= FAN_OUT_MAX) {
      toast('Fan-out capped at 3 demo children');
      return null;
    }
    if (!s.branchThread) return null;
    var nid = s.branchThread(id, opts || { label: 'spawn_related' });
    if (nid && s.threads[nid]) s.threads[nid].fanOutChild = true;
    return nid;
  }

  function deepThreadOp(s, id, kind, extra) {
    extra = extra || {};
    if (!s.session.threadOps) s.session.threadOps = [];
    var op = {
      id: 'top-' + Date.now().toString(36),
      kind: kind,
      source: extra.source || id,
      target: extra.target || null,
      sender: extra.sender || 'demo-harness',
      budget: extra.budget || { tokens: 1200, children: FAN_OUT_MAX },
      status: extra.status || 'ok',
      resultRefs: extra.resultRefs || [],
      at: new Date().toISOString()
    };
    s.session.threadOps.unshift(op);
    s.session.threadOps = s.session.threadOps.slice(0, 24);
    if (s._emit) s._emit();
    return op;
  }

  function fire(family, event, payload) {
    var s = store();
    if (!s) return;
    var id = ensureThread(s);
    var aw;
    switch (family + '.' + event) {
      case 'history.peek':
        if (s.setHistoryMode) s.setHistoryMode('peek');
        break;
      case 'history.pin_compact':
        if (s.setHistoryMode) s.setHistoryMode('pinned_compact');
        break;
      case 'history.pin_full':
        if (s.setHistoryMode) s.setHistoryMode('pinned_full');
        break;
      case 'history.unpin':
        if (s.setHistoryMode) s.setHistoryMode('closed');
        break;
      case 'history.switch_thread': {
        var keys = Object.keys(s.threads || {});
        var cur = tid(s);
        var ix = keys.indexOf(cur);
        var next = keys[(ix + 1) % keys.length];
        if (next) s.selectThread(next);
        break;
      }
      case 'question.prepare':
      case 'question.open':
        injectQuestionnaire(s, id);
        break;
      case 'question.select':
        if (s.answerQuestion) s.answerQuestion(id, payload && payload.value);
        break;
      case 'question.next':
      case 'question.skip':
        if (s.skipQuestion) s.skipQuestion(id);
        break;
      case 'question.validation_error':
        if (s.submitQuestionnaire) s.submitQuestionnaire(id);
        toast('Validation · answer required questions');
        break;
      case 'question.cancel':
        if (s.cancelQuestionnaire) s.cancelQuestionnaire(id);
        break;
      case 'question.submit':
        if (s.submitQuestionnaire) s.submitQuestionnaire(id);
        break;
      case 'goal.start':
        ensureGoal(s, id, 'running');
        break;
      case 'goal.progress':
        ensureGoal(s, id, 'running', 'Research');
        break;
      case 'goal.pause':
        if (s.goalAction) s.goalAction(id, 'pause');
        else ensureGoal(s, id, 'paused');
        break;
      case 'goal.resume':
        if (s.goalAction) s.goalAction(id, 'resume');
        else ensureGoal(s, id, 'running');
        break;
      case 'goal.update':
      case 'goal.replan':
        ensureGoal(s, id, 'running');
        if (s.goalAction) s.goalAction(id, 'replan');
        break;
      case 'goal.blocked':
        ensureGoal(s, id, 'blocked');
        break;
      case 'goal.stop':
        ensureGoal(s, id, 'running');
        if (s.goalAction) s.goalAction(id, 'stop');
        else ensureGoal(s, id, 'stopped');
        break;
      case 'goal.clear':
        ensureGoal(s, id, 'running');
        if (s.goalAction) s.goalAction(id, 'clear');
        else {
          var tClear = s.threads[id];
          if (tClear) tClear.goal = null;
          if (s._emit) s._emit();
        }
        break;
      case 'goal.edit':
        ensureGoal(s, id, 'running');
        if (s.goalAction) s.goalAction(id, 'edit');
        break;
      case 'goal.complete':
        ensureGoal(s, id, 'running');
        if (s.goalAction) s.goalAction(id, 'complete');
        else ensureGoal(s, id, 'completed', 'Handoff');
        break;
      case 'todo.add':
        mutateTodos(s, id, 'add');
        break;
      case 'todo.complete':
        mutateTodos(s, id, 'complete');
        break;
      case 'todo.reopen':
        mutateTodos(s, id, 'reopen');
        break;
      case 'todo.block':
        mutateTodos(s, id, 'block');
        break;
      case 'subagent.spawn':
      case 'subagent.queue':
      case 'subagent.progress':
      case 'subagent.complete':
      case 'subagent.fail':
      case 'subagent.retry':
        mutateSubagents(s, id, event);
        break;
      case 'activity.thinking_summary':
      case 'activity.search':
      case 'activity.read':
      case 'activity.fetch':
      case 'activity.browser':
      case 'activity.test':
      case 'activity.edit':
      case 'activity.generate':
        pushActivity(s, id, event);
        break;
      case 'diff.create':
      case 'diff.update':
        ensureDiff(s, id);
        break;
      case 'diff.open':
        if (window.PMChatV2) {
          window.PMChatV2.openArtifactWorkspace(s, id, 'artifact-diff', { status: 'loading' });
        }
        break;
      case 'artifact.loading':
        if (window.PMChatV2) {
          window.PMChatV2.openArtifactWorkspace(s, id, 'artifact-preview', { status: 'loading' });
        }
        break;
      case 'artifact.ready':
        if (window.PMChatV2) {
          window.PMChatV2.openArtifactWorkspace(s, id, 'artifact-handoff', {
            status: 'ready',
            instant: true
          });
        }
        break;
      case 'artifact.switch':
        if (window.PMChatV2) window.PMChatV2.switchArtifact(s, id, 'artifact-test');
        break;
      case 'artifact.error':
        if (window.PMChatV2) {
          window.PMChatV2.openArtifactWorkspace(s, id, 'artifact-preview', {
            status: 'loading',
            error: true,
            errorMessage: 'Preview render failed'
          });
        }
        break;
      case 'artifact.close':
        if (window.PMChatV2) window.PMChatV2.closeArtifactWorkspace(s);
        break;
      case 'decision.approval_open':
        s.session.approval = {
          question: 'Run 2 commands?',
          reason: 'Workspace only · Needed to run the test suite',
          details: 'npm test\nnode verification/run-v2-delta-probes.mjs',
          kind: 'command'
        };
        if (s._emit) s._emit();
        break;
      case 'decision.approve':
      case 'decision.deny':
        s.session.approval = null;
        if (s._emit) s._emit();
        break;
      case 'decision.branch':
      case 'decision.details':
        toast(event === 'details' ? 'Approval details open' : 'Branch with new model');
        break;
      case 'thread.send_request': {
        var reqOp = deepThreadOp(s, id, 'send_request', {
          target: 'thread-sibling',
          status: 'sent',
          resultRefs: ['msg:request']
        });
        pushMessage(
          s,
          id,
          'user',
          'Thread request · source ' +
            reqOp.source +
            ' → target sibling · budget ' +
            reqOp.budget.tokens +
            ' · Please review the provider access flow.'
        );
        break;
      }
      case 'thread.receive_response': {
        var respOp = deepThreadOp(s, id, 'receive_response', {
          source: 'thread-sibling',
          target: id,
          status: 'received',
          resultRefs: ['msg:response', 'lens:provenance']
        });
        pushMessage(
          s,
          id,
          'assistant',
          'Cross-thread response linked · provenance in Context Lens · op ' +
            respOp.id +
            ' · no hidden shared context.'
        );
        break;
      }
      case 'thread.spawn_related': {
        var child = spawnRelatedGuarded(s, id, { label: 'spawn_related' });
        deepThreadOp(s, id, 'spawn_related', {
          target: child,
          status: child ? 'spawned' : 'capped',
          resultRefs: child ? ['thread:' + child] : []
        });
        break;
      }
      case 'thread.branch': {
        var branched = spawnRelatedGuarded(s, id, { label: 'branch' });
        deepThreadOp(s, id, 'branch', {
          target: branched,
          status: branched ? 'branched' : 'capped',
          resultRefs: branched ? ['thread:' + branched] : []
        });
        break;
      }
      case 'system.port_collision':
        s.session.warning = {
          tier: 'compact',
          text: 'Port 4173 is occupied by Usage concept visual-test server. Use 4174.',
          choices: ['Use 4174', 'Cancel', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.worktree_collision':
        s.session.warning = {
          tier: 'compact',
          text: 'Worktree feature/chat already has a writer. Switch or wait.',
          choices: ['Switch', 'Wait', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.reset':
        resetScenario(s);
        break;
      case 'system.compact_now':
        if (window.PMChatLens && typeof window.PMChatLens.compactNow === 'function') {
          window.PMChatLens.compactNow(s, id);
          setTimeout(function () {
            if (s.session.compactNow && typeof s.session.compactNow._finish === 'function') {
              s.session.compactNow._finish();
            }
            refresh();
          }, 520);
        } else {
          s.session.compactNow = { status: 'running', progress: 0.4, command: 'cmd.chat.compact_context' };
          if (s._emit) s._emit();
          setTimeout(function () {
            s.session.compactNow = {
              status: 'done',
              progress: 1,
              command: 'cmd.chat.compact_context',
              included: ['Goal summary', 'Latest 8 turns', 'Open Todos', 'Active questionnaire receipt'],
              leftOut: ['Raw tool dumps', 'Older search pages', 'Duplicate diffs', 'Browser console noise'],
              historyRetained: true
            };
            if (s._emit) s._emit();
            refresh();
          }, 600);
        }
        break;
      case 'system.attachment_incompatible':
        fire('system', 'attachment_resolver');
        return;
      case 'system.active_turn_redirect':
        s.setRunning(id, {
          status: 'running',
          partialBody: 'Drafting the provider cache warning copy…',
          badge: 'Interrupted',
          stopped: false
        });
        if (typeof s.redirectActiveTurn === 'function') {
          s.redirectActiveTurn(id, 'Redirect: keep the attempt, change the closing recommendation.');
        }
        setTimeout(function () {
          if (typeof s.markRedirectResumed === 'function') s.markRedirectResumed(id);
          refresh();
        }, 700);
        break;
      case 'system.cache_warning':
        s.session.warning = {
          tier: 'compact',
          text: 'Switching provider will replay the conversation without the current provider cache.',
          choices: ['Continue here', 'Branch with new model', 'Start new chat', 'Cancel', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.capacity_warning':
        s.session.capacityForecast =
          'Requested specialists: 6 · Recommended concurrent: 2 · 3 waves · Reason: provider allowance and verification reserve';
        s.session.warning = {
          tier: 'compact',
          text:
            s.session.capacityForecast +
            ' · Remaining included usage is unlikely to finish eight specialists; run two at a time and reserve capacity for synthesis.',
          choices: ['Run two at a time', 'Cancel', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.cross_project':
        s.session.crossProjectGrant = {
          text: 'This action would reach outside the current project. Confirm once, for this Goal, or open Settings.'
        };
        s.session.warning = {
          tier: 'modal',
          text: s.session.crossProjectGrant.text,
          choices: ['Cancel', 'Allow once', 'Allow for this Goal', 'Open Settings']
        };
        if (s._emit) s._emit();
        break;
      case 'system.crew':
        /* Pending is a string crew id — host resolveCrewConfirm expects a string. */
        s.session.crewDefaultPrompted = false;
        s.session.crewConfirmOpen = true;
        s.session.crewPendingConfirm = 'review-wave';
        /* Do not set active crewId / waves until confirm accepts. */
        if (s._emit) s._emit();
        break;


      case 'system.bsd.off':
        if (s.setBsd) s.setBsd(id, { mode: 'off' });
        if (s.setBsdVisual) s.setBsdVisual(id, 'off');
        break;
      case 'system.bsd.auto_idle':
        if (s.setBsd) s.setBsd(id, { mode: 'auto' });
        if (s.setBsdVisual) s.setBsdVisual(id, 'auto-idle');
        break;
      case 'system.bsd.auto_active':
        if (s.setBsd) s.setBsd(id, { mode: 'auto' });
        if (s.setBsdVisual) s.setBsdVisual(id, 'auto-active');
        break;
      case 'system.bsd.on':
        if (s.setBsd) s.setBsd(id, { mode: 'on' });
        if (s.setBsdVisual) s.setBsdVisual(id, 'on');
        break;
      case 'system.bsd.silent':
        if (s.setBsd) s.setBsd(id, { mode: 'on', scope: 'thread' });
        if (s.setBsdVisual) s.setBsdVisual(id, 'silent');
        break;
      case 'system.bsd.advice':
        if (s.setBsd) s.setBsd(id, { mode: 'auto', scope: 'turn' });
        if (s.setBsdVisual) s.setBsdVisual(id, 'advice');
        if (s.setThreadLocal) {
          var localAdvice = s.getThreadLocal ? s.getThreadLocal(id) : null;
          if (localAdvice && localAdvice.bsd) {
            s.setThreadLocal(id, { bsd: Object.assign({}, localAdvice.bsd, { adviceId: 'bsd-advice-demo' }) });
          }
        }
        break;
      case 'system.bsd.timeout':
        if (s.setBsd) s.setBsd(id, { mode: 'auto', scope: 'turn' });
        if (s.setBsdVisual) s.setBsdVisual(id, 'timed-out');
        break;
      case 'system.bsd.unavailable':
        if (s.setBsd) s.setBsd(id, { mode: 'auto', scope: 'turn' });
        if (s.setBsdVisual) s.setBsdVisual(id, 'unavailable');
        break;
      case 'system.bsd.quota':
        if (s.setBsd) s.setBsd(id, { mode: 'auto', scope: 'turn' });
        if (s.setBsdVisual) s.setBsdVisual(id, 'quota-limited');
        break;
      case 'system.backup_snapshot':
        s.session.warning = {
          tier: 'compact',
          text: 'Backup snapshot · last good: 12m ago · testing logs retained · restore available without rewriting chat history.',
          choices: ['Open snapshot', 'Cancel', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.debug_session':
        s.session.warning = {
          tier: 'compact',
          text: 'Debug session · inspector attached · logs streaming · snapshots frozen for this Goal wave.',
          choices: ['Keep debugging', 'Detach', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.browser_program_progress':
        s.session.browserProgram = {
          label: 'Browser Program',
          status: 'running',
          step: 'Capture settings route',
          progress: 0.55
        };
        s.session.warning = {
          tier: 'compact',
          text: 'Browser Program · Capture settings route · 55% · Expert Browser Program standby.',
          choices: ['Show Program', 'Cancel', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.attachment_resolver': {
        var resolved =
          typeof s.resolveAttachment === 'function'
            ? s.resolveAttachment({ name: 'walkthrough.mp4', mime: 'video/mp4' })
            : {
                class: 'pm-transformed',
                choices: [
                  { id: 'cancel', label: 'Cancel' },
                  { id: 'extract-pm', label: 'Extract in PM' },
                  { id: 'use-gemini', label: 'Use Gemini for video' }
                ]
              };
        s.session.attachmentResolver = resolved;
        s.session.warning = {
          tier: 'modal',
          kind: 'attachment-resolver',
          text:
            'Attachment resolver · ' +
            (resolved.class || 'unsupported') +
            ' · lineage ' +
            ((resolved.lineage || []).join(' → ') || 'uploaded'),
          choices: (resolved.choices || []).map(function (c) {
            return c.label;
          })
        };
        if (s._emit) s._emit();
        break;
      }
      case 'system.provider_setup_required':
        s.session.providerSetupRequired = {
          code: 'cli-not-found',
          reason: 'CLI not found',
          message: 'CLI not found · choose another model or repair in Settings (managers Settings-owned).',
          settingsPath: 'settings://providers/xai'
        };
        s.session.composerState = 'provider-setup-required';
        s.session.composerStateReason = s.session.providerSetupRequired.message;
        s.session.sendDisabledReason =
          s.session.sendDisabledReason || 'Provider setup required · send disabled';
        if (typeof s.pushNotification === 'function') {
          s.pushNotification({
            title: 'Provider setup required',
            body: 'CLI not found · return to Settings · providers/xai',
            tone: 'warn'
          });
        }
        toast('Settings deep-link · settings://providers/xai');
        if (s._emit) s._emit();
        break;
      case 'system.access_limited_by_review':
        s.session.sendDisabledReason = 'Access limited by review · send disabled until approval';
        s.session.composerState = 'send-disabled';
        s.session.warning = {
          tier: 'compact',
          text: 'Access limited by review · primary turn can continue in Ask mode only.',
          choices: ['Stay in Ask', 'Open Settings', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.notification.push':
        if (typeof s.pushNotification === 'function') {
          s.pushNotification({
            title: 'Goal wave finished',
            body: 'Synthesis ready · open the artifact workspace when you want the diff.',
            tone: 'success'
          });
        }
        break;
      case 'system.restore_point.create': {
        var tRp = s.threads[id];
        var midRp =
          tRp && tRp.messages && tRp.messages.length
            ? tRp.messages[tRp.messages.length - 1].id
            : null;
        if (midRp && typeof s.createRestorePoint === 'function') {
          var rpid = s.createRestorePoint(id, midRp, 'Demo restore point');
          toast('Restore point · ' + rpid);
        }
        break;
      }
      case 'system.rewind': {
        var tRw = s.threads[id];
        var midRw =
          tRw && tRw.messages && tRw.messages.length > 1
            ? tRw.messages[Math.max(0, tRw.messages.length - 2)].id
            : tRw && tRw.messages && tRw.messages[0]
              ? tRw.messages[0].id
              : null;
        if (midRw && typeof s.rewindTo === 'function') {
          s.rewindTo(id, midRw);
        }
        break;
      }
      case 'system.sync.offline':
        if (s.setSyncState) s.setSyncState('offline');
        s.session.composerState = 'offline-queued';
        break;
      case 'system.sync.queued':
        /* UI label "Queued to send" = offline + outbox queued (not a sync enum). */
        if (s.setSyncState) s.setSyncState('offline');
        if (typeof s.enqueueOutbox === 'function') {
          s.enqueueOutbox({
            id: 'ob-demo-queued',
            kind: 'send',
            payload: { threadId: id, text: 'Queued demo send' },
            status: 'queued'
          });
        }
        s.session.composerState = 'offline-queued';
        if (s._emit) s._emit();
        break;
      case 'system.sync.reconnect':
        if (s.setSyncState) s.setSyncState('reconnecting');
        break;
      case 'system.sync.replay':
        if (s.setSyncState) s.setSyncState('replay');
        if (typeof s.replayOutbox === 'function') s.replayOutbox();
        break;
      case 'system.sync.snapshot':
        if (s.setSyncState) s.setSyncState('snapshot');
        break;
      case 'system.sync.server_work':
        if (s.setSyncState) s.setSyncState('server-work-continuing');
        break;
      case 'system.composer.ordinary':
        s.session.composerState = 'ordinary';
        s.session.composerStateReason = '';
        s.session.providerSetupRequired = null;
        s.session.crossProjectGrant = null;
        s.session.sendDisabledReason = '';
        if (s._emit) s._emit();
        break;
      case 'system.composer.redirect_active':
        fire('system', 'active_turn_redirect');
        return;
      case 'system.composer.spellcheck':
        s.session.composerState = 'spellcheck-suggestions';
        s.session.spellcheckSuggestions = true;
        if (s._emit) s._emit();
        break;
      case 'artifact.updated':
        if (window.PMChatV2) {
          /* Transient update, then settle to distinct updated receipt (not stuck on Updating…). */
          window.PMChatV2.openArtifactWorkspace(s, id, 'artifact-handoff', {
            status: 'update',
            settleToUpdated: true,
            instant: false
          });
        }
        break;
      case 'system.reduced_motion':
        document.documentElement.setAttribute('data-reduced-motion', '1');
        if (window.PMChatMotion && window.PMChatMotion.setReduced) window.PMChatMotion.setReduced(true);
        break;
      default:
        toast('Unknown trigger · ' + family + '.' + event);
        return;
    }
    refresh();
    toast(family + ' · ' + event);
  }

  function pushMessage(s, id, role, body) {
    var t = s.threads[id];
    if (!t) return;
    t.messages = t.messages || [];
    t.messages.push({
      id: 'demo-m-' + Date.now().toString(36),
      role: role,
      body: body,
      createdAt: new Date().toISOString()
    });
    if (s._emit) s._emit();
  }

  function injectQuestionnaire(s, id) {
    var t = s.threads[id];
    if (!t) return;
    t.questionnaires = [
      {
        id: 'q-demo-v2',
        status: 'active',
        currentQuestionIndex: 0,
        questions: [
          {
            id: 'q1',
            kind: 'single_select',
            prompt: 'Where should provider and account policy be managed?',
            options: [
              'Settings owns policy; Chat chooses the current route',
              'Chat owns everything',
              'Split policy between both surfaces'
            ],
            selected: []
          },
          {
            id: 'q2',
            kind: 'single_select',
            prompt: 'When a model switch will lose provider cache, what should PM emphasize first?',
            options: ['Continue here', 'Branch with the new model', 'Start a clean chat', 'Ask every time'],
            skippable: true,
            selected: []
          },
          {
            id: 'q3',
            kind: 'multi_select',
            prompt: 'Which artifact states must the concept demonstrate?',
            options: ['Multi-file diff', 'Rendered preview', 'Test report', 'Provider-flow document'],
            selected: []
          },
          {
            id: 'q4',
            kind: 'freeform',
            prompt: 'Any route or privacy constraint the assistant must respect?',
            draft: '',
            skippable: true
          }
        ]
      }
    ];
    if (s._emit) s._emit();
  }

  function ensureGoal(s, id, status, phase) {
    var t = s.threads[id];
    if (!t) return;
    t.goal = t.goal || {
      id: 'goal-provider-redesign',
      title: 'Redesign provider controls and Chat access flow',
      objective: 'Audit provider settings and Chat access controls without editing PMConcept7.',
      status: 'running',
      phase: 'Audit',
      workedSeconds: 94
    };
    if (status) t.goal.status = status;
    if (phase) t.goal.phase = phase;
    if (typeof s.applyGoalCapabilities === 'function') s.applyGoalCapabilities(id);
    else if (window.PMChatStore && typeof window.PMChatStore.normalizeGoalCapabilities === 'function') {
      window.PMChatStore.normalizeGoalCapabilities(t.goal);
    }
    if (s._emit) s._emit();
  }

  function mutateTodos(s, id, op) {
    var t = s.threads[id];
    if (!t) return;
    t.todos = t.todos || { items: [] };
    t.todos.items = t.todos.items || [];
    if (op === 'add') {
      t.todos.items.push({
        id: 'todo-' + Date.now().toString(36),
        text: 'Write the implementation-impact handoff',
        status: 'open'
      });
    } else if (op === 'complete' && t.todos.items[0]) {
      t.todos.items[0].status = 'completed';
      t.todos.items[0].done = true;
    } else if (op === 'reopen' && t.todos.items[0]) {
      t.todos.items[0].status = 'open';
      t.todos.items[0].done = false;
    } else if (op === 'block' && t.todos.items[0]) {
      t.todos.items[0].status = 'blocked';
    }
    if (s._emit) s._emit();
  }

  function mutateSubagents(s, id, op) {
    var t = s.threads[id];
    if (!t) return;
    if (!t.subagentGroups || !t.subagentGroups.length) {
      t.subagentGroups = [
        {
          label: 'Specialists',
          state: 'running',
          agents: [
            { id: 'sa-1', name: 'Interface systems auditor', route: 'Fable', status: 'queued' },
            { id: 'sa-2', name: 'Provider adapter researcher', route: 'Kimi K3', status: 'running' },
            { id: 'sa-3', name: 'Slint and test reviewer', route: 'Qwen 3.8', status: 'queued' }
          ],
          children: [
            { name: 'Interface systems auditor', route: 'Fable', status: 'queued' },
            { name: 'Provider adapter researcher', route: 'Kimi K3', status: 'running' },
            { name: 'Slint and test reviewer', route: 'Qwen 3.8', status: 'queued' }
          ]
        }
      ];
    }
    var g = t.subagentGroups[0];
    var kids = g.children || g.agents || [];
    if (!kids.length) {
      kids = [
        { name: 'Interface systems auditor', status: 'queued' },
        { name: 'Provider adapter researcher', status: 'running' },
        { name: 'Slint and test reviewer', status: 'queued' }
      ];
      g.children = kids;
      g.agents = kids;
    }
    if (op === 'spawn' || op === 'queue') {
      if (kids[0]) kids[0].status = 'queued';
      kids.push({
        id: 'sa-' + Date.now().toString(36),
        name: 'Spawned specialist',
        route: 'Grok',
        status: 'queued'
      });
    }
    if (op === 'progress' && kids[1]) kids[1].status = 'running';
    if (op === 'complete' && kids[1]) kids[1].status = 'completed';
    if (op === 'fail' && kids[2]) kids[2].status = 'failed';
    if (op === 'retry' && kids[2]) kids[2].status = 'retrying';
    if (s._emit) s._emit();
  }

  function pushActivity(s, id, kind) {
    var t = s.threads[id];
    if (!t) return;
    t.activity = t.activity || [];
    var map = {
      thinking_summary: 'Thinking · concise status summary',
      search: 'Searched 6 related project threads',
      read: 'Read 7 plan and concept files',
      fetch: 'Compared 4 current provider and approval implementations',
      browser: 'Checked pinning and question flow at 4 widths',
      test: 'Passed interaction and reduced-motion checks',
      edit: 'Made 1 create and 3 edits · +184 −67',
      generate: 'Generated provider-flow document'
    };
    t.activity.push({ kind: kind, summary: map[kind] || kind, at: new Date().toISOString() });
    if (s._emit) s._emit();
  }

  function ensureDiff(s, id) {
    var t = s.threads[id];
    if (!t) return;
    t.diffGroups = [
      {
        label: 'Assistant Chat change set',
        files: [
          { path: 'threads/provider-selector.js', added: 92, removed: 18, status: 'modified' },
          { path: 'threads/access-controls.css', added: 61, removed: 39, status: 'modified' },
          { path: 'verification/interaction-probes.mjs', added: 31, removed: 10, status: 'modified' }
        ]
      }
    ];
    t.artifacts = [
      { id: 'artifact-diff', title: 'Assistant Chat change set', type: 'multi_file_diff' },
      { id: 'artifact-preview', title: 'Provider selector preview', type: 'visual_preview' },
      { id: 'artifact-test', title: 'Interaction verification report', type: 'test_report' },
      { id: 'artifact-handoff', title: 'Implementation impact handoff', type: 'document' }
    ];
    if (s._emit) s._emit();
  }

  function resetScenario(s) {
    if (s.setHistoryMode) s.setHistoryMode('closed');
    if (window.PMChatV2) window.PMChatV2.closeArtifactWorkspace(s);
    s.session.approval = null;
    s.session.warning = null;
    s.session.compactNow = { status: 'idle', progress: 0 };
    var id = tid(s);
    if (id && s.threads[id]) {
      s.threads[id].questionnaires = [];
    }
    if (s._emit) s._emit();
  }

  var BUTTONS = [
    ['history', 'peek'],
    ['history', 'pin_compact'],
    ['history', 'pin_full'],
    ['history', 'unpin'],
    ['history', 'switch_thread'],
    ['question', 'open'],
    ['question', 'skip'],
    ['question', 'cancel'],
    ['question', 'submit'],
    ['question', 'validation_error'],
    ['goal', 'start'],
    ['goal', 'pause'],
    ['goal', 'resume'],
    ['goal', 'replan'],
    ['goal', 'stop'],
    ['goal', 'clear'],
    ['goal', 'edit'],
    ['goal', 'complete'],
    ['todo', 'add'],
    ['todo', 'complete'],
    ['todo', 'block'],
    ['todo', 'reopen'],
    ['subagent', 'spawn'],
    ['subagent', 'fail'],
    ['subagent', 'retry'],
    ['activity', 'thinking_summary'],
    ['activity', 'search'],
    ['activity', 'edit'],
    ['diff', 'create'],
    ['diff', 'open'],
    ['artifact', 'loading'],
    ['artifact', 'ready'],
    ['artifact', 'switch'],
    ['artifact', 'error'],
    ['artifact', 'close'],
    ['decision', 'approval_open'],
    ['decision', 'approve'],
    ['system', 'port_collision'],
    ['system', 'worktree_collision'],
    ['system', 'cache_warning'],
    ['system', 'capacity_warning'],
    ['system', 'cross_project'],
    ['system', 'crew'],
    ['system', 'attachment_incompatible'],
    ['system', 'attachment_resolver'],
    ['system', 'compact_now'],
    ['system', 'active_turn_redirect'],
    ['system', 'bsd.off'],
    ['system', 'bsd.auto_idle'],
    ['system', 'bsd.auto_active'],
    ['system', 'bsd.on'],
    ['system', 'bsd.silent'],
    ['system', 'bsd.advice'],
    ['system', 'bsd.timeout'],
    ['system', 'bsd.unavailable'],
    ['system', 'bsd.quota'],
    ['system', 'backup_snapshot'],
    ['system', 'debug_session'],
    ['system', 'browser_program_progress'],
    ['system', 'provider_setup_required'],
    ['system', 'access_limited_by_review'],
    ['system', 'notification.push'],
    ['system', 'restore_point.create'],
    ['system', 'rewind'],
    ['system', 'sync.offline'],
    ['system', 'sync.queued'],
    ['system', 'sync.reconnect'],
    ['system', 'sync.replay'],
    ['system', 'sync.snapshot'],
    ['system', 'sync.server_work'],
    ['system', 'composer.ordinary'],
    ['system', 'composer.spellcheck'],
    ['artifact', 'updated'],
    ['thread', 'send_request'],
    ['thread', 'receive_response'],
    ['thread', 'spawn_related'],
    ['thread', 'branch'],
    ['system', 'reduced_motion'],
    ['system', 'reset']
  ];

  function humanTriggerLabel(family, event) {
    return String(family) + ' · ' + String(event || '').replace(/_/g, ' ');
  }

  function mount(options) {
    ctx = options || {};
    if (document.querySelector('[data-demo-harness]')) return;
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'pm-demo-harness-toggle';
    toggle.textContent = 'Demo harness';
    toggle.setAttribute('aria-expanded', 'false');
    var panel = document.createElement('div');
    panel.className = 'pm-demo-harness';
    panel.setAttribute('data-demo-harness', '');
    panel.hidden = true;
    panel.innerHTML =
      '<div class="pm-demo-harness-head"><span>Demo triggers (non-product)</span>' +
      '<button type="button" data-harness-hide aria-label="Hide">×</button></div>' +
      '<div class="pm-demo-harness-body"></div>';
    var body = panel.querySelector('.pm-demo-harness-body');
    BUTTONS.forEach(function (pair) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = humanTriggerLabel(pair[0], pair[1]);
      b.setAttribute('data-demo-family', pair[0]);
      b.setAttribute('data-demo-event', pair[1]);
      body.appendChild(b);
    });
    document.body.appendChild(toggle);
    document.body.appendChild(panel);
    toggle.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      toggle.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
    });
    panel.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-harness-hide]')) {
        panel.hidden = true;
        toggle.hidden = false;
        return;
      }
      var btn = ev.target.closest('[data-demo-family]');
      if (!btn) return;
      fire(btn.getAttribute('data-demo-family'), btn.getAttribute('data-demo-event'));
    });
    try {
      var s0 = store();
      if (s0 && ctx && ctx.shell && typeof ctx.shell.bindStore === 'function') {
        ctx.shell.bindStore(s0);
      } else if (s0 && window.__pmChatShell && typeof window.__pmChatShell.bindStore === 'function') {
        window.__pmChatShell.bindStore(s0);
      }
    } catch (_) {}
  }

  window.PMChatDemoHarness = {
    mount: mount,
    fire: fire,
    BUTTONS: BUTTONS
  };
})();
