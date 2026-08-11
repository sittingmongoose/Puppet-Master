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
        ensureGoal(s, id, 'updated_replan', 'Prototype');
        break;
      case 'goal.blocked':
        ensureGoal(s, id, 'blocked');
        break;
      case 'goal.complete':
        if (s.goalAction) s.goalAction(id, 'stop');
        ensureGoal(s, id, 'completed', 'Handoff');
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
      case 'thread.send_request':
        pushMessage(s, id, 'user', 'Please review the provider access flow in the sibling thread.');
        break;
      case 'thread.receive_response':
        pushMessage(s, id, 'assistant', 'Cross-thread response linked · provenance in Context Lens.');
        break;
      case 'thread.spawn_related':
        if (s.branchThread) s.branchThread(id);
        break;
      case 'thread.branch':
        if (s.branchThread) s.branchThread(id);
        break;
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
        s.session.compactNow = { status: 'running', progress: 0.4 };
        if (s._emit) s._emit();
        setTimeout(function () {
          s.session.compactNow = {
            status: 'done',
            progress: 1,
            included: ['Goal summary', 'Latest 8 turns', 'Open Todos', 'Active questionnaire receipt'],
            leftOut: ['Raw tool dumps', 'Older search pages', 'Duplicate diffs', 'Browser console noise']
          };
          if (s._emit) s._emit();
          refresh();
        }, 600);
        break;
      case 'system.attachment_incompatible':
        s.session.warning = {
          tier: 'modal',
          text: 'The selected model cannot inspect video natively; PM can extract frames or use the configured vision route.',
          choices: ['Extract frames', 'Alternate model', 'Cancel', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.active_turn_redirect':
        pushMessage(
          s,
          id,
          'assistant',
          'Active-turn redirect · original attempt preserved · interruption recorded · replacement attempt resumed.'
        );
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
        s.session.warning = {
          tier: 'compact',
          text: 'Remaining included usage is unlikely to finish eight specialists; run two at a time and reserve capacity for synthesis.',
          choices: ['Run two at a time', 'Cancel', 'Details']
        };
        if (s._emit) s._emit();
        break;
      case 'system.cross_project':
        s.session.warning = {
          tier: 'modal',
          text: 'This action would reach outside the current project. Confirm once, for this thread, or open Settings.',
          choices: ['Allow once', 'Allow for this thread', 'Open Settings', 'Cancel']
        };
        if (s._emit) s._emit();
        break;
      case 'system.crew':
        s.session.crewDefaultPrompted = true;
        s.session.crewConfirmOpen = false;
        s.session.crewPendingConfirm = null;
        s.session.crewId = 'review-wave';
        s.session.crew = {
          requested: 'review-wave',
          effective: 'research-pair',
          reason: 'Adaptive route · capacity prefers Research pair for this turn',
          waves: [
            { id: 'w1', label: 'Provider research', state: 'running' },
            { id: 'w2', label: 'Diff review', state: 'queued' },
            { id: 'w3', label: 'Synthesis', state: 'queued' }
          ]
        };
        if (s._emit) s._emit();
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
    ['system', 'compact_now'],
    ['system', 'active_turn_redirect'],
    ['thread', 'spawn_related'],
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
  }

  window.PMChatDemoHarness = {
    mount: mount,
    fire: fire,
    BUTTONS: BUTTONS
  };
})();
