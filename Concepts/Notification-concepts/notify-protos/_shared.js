/* Shared helpers for PM notify prototypes — polished action model */
(function () {
  var THEMES = [
    'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light',
    'retro-dark', 'retro-light', 'basic-dark', 'basic-light'
  ];

  var ACTION_LABELS = {
    approve: 'Approve',
    decline: 'Decline',
    open_details: 'Details',
    explain: 'Explain',
    retry_safe: 'Retry from safe point',
    fresh_attempt: 'Start fresh attempt',
    open_orch: 'Open Orchestrator',
    deny: 'Deny',
    once: 'Once',
    for_session: 'For Session',
    always: 'Always',
    filesafe_once: 'Approve once',
    filesafe_add: 'Approve & add',
    cancel: 'Cancel',
    acknowledge: 'Acknowledge',
    dismiss: 'Dismiss',
    resolve: 'Resolve',
    open_usage: 'Open Usage',
    resume_wizard: 'Resume Wizard',
    view_report: 'View report',
    continue_assistant: 'Continue in Assistant',
    open: 'Open'
  };

  var eid = 0;
  function uid() { return 'n' + (++eid) + '-' + Date.now().toString(36); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function base(overrides) {
    var o = overrides || {};
    return {
      id: uid(),
      title: o.title || 'Notification',
      body: o.body || '',
      severity: o.severity || 'info',
      important: o.important !== false,
      kind: o.kind || 'advisory',
      blocked_reason_code: o.blocked_reason_code || null,
      allowed_action_ids: o.allowed_action_ids || [],
      needsRationale: !!o.needsRationale,
      rationalePlaceholder: o.rationalePlaceholder || 'Required rationale…',
      explain: o.explain || null,
      ttlMs: o.ttlMs || null,
      routePayload: o.routePayload || null,
      patternSuggest: o.patternSuggest || null,
      createdAt: Date.now()
    };
  }

  var EPHEMERAL = [
    { title: 'Mode → Agent', body: 'Assistant mode switched', severity: 'info' },
    { title: 'Model → GPT-5.2', body: 'Chat model updated', severity: 'success' },
    { title: 'Theme synced', body: 'Friendly Dark applied', severity: 'info' },
    { title: 'Auto-save on', body: 'Drafts will persist', severity: 'success' }
  ];

  window.PMNotifyShared = {
    themes: THEMES,
    actionLabel: function (id) { return ACTION_LABELS[id] || id; },
    bootTheme: function () {
      var t = localStorage.getItem('pm.notifyProto.theme');
      if (THEMES.indexOf(t) === -1) t = 'friendly-dark';
      document.documentElement.setAttribute('data-theme', t);
      return t;
    },
    wireThemeSelect: function (sel) {
      if (!sel) return;
      var t = document.documentElement.getAttribute('data-theme') || 'friendly-dark';
      sel.value = t;
      sel.addEventListener('change', function () {
        document.documentElement.setAttribute('data-theme', sel.value);
        localStorage.setItem('pm.notifyProto.theme', sel.value);
      });
    },
    wireReduced: function (btn) {
      if (!btn) return;
      var on = localStorage.getItem('pm.notifyProto.reduced') === '1';
      function apply() {
        document.body.setAttribute('data-reduced', on ? '1' : '0');
        btn.textContent = on ? 'Motion: reduced' : 'Motion: full';
      }
      apply();
      btn.addEventListener('click', function () {
        on = !on;
        localStorage.setItem('pm.notifyProto.reduced', on ? '1' : '0');
        apply();
      });
    },
    reduced: function () {
      return document.body.getAttribute('data-reduced') === '1' ||
        (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    },
    escCollapse: function (fn) {
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fn();
      });
    },

    ephemeral: function () {
      var s = pick(EPHEMERAL);
      return base({
        title: s.title, body: s.body, severity: s.severity,
        important: false, kind: 'ephemeral', allowed_action_ids: []
      });
    },

    important: function () {
      return base({
        title: 'Run complete',
        body: 'Orchestrator wave 3 finished successfully',
        severity: 'success',
        kind: 'advisory',
        allowed_action_ids: ['acknowledge', 'open'],
        routePayload: { page: 'orchestrator', label: 'Orchestrator' }
      });
    },

    warning: function () {
      return base({
        title: 'Quota warning',
        body: '80% of daily tokens used',
        severity: 'warn',
        kind: 'advisory',
        allowed_action_ids: ['acknowledge', 'open_usage'],
        routePayload: { page: 'usage', label: 'Usage' }
      });
    },

    hitl: function () {
      return base({
        title: 'Approval needed — publish package',
        body: 'Run #47 holding at n-13. Thread “Approval: Package Gate” opened.',
        severity: 'info',
        kind: 'hitl',
        blocked_reason_code: 'waiting_approval',
        allowed_action_ids: ['approve', 'decline', 'open_details', 'explain'],
        explain: 'ELI5: A package gate finished and needs your OK before publish continues.\n\nExpert: blocked_sequence wait; approve → cmd.runtime.approve; decline keeps pause and surfaces recovery CTAs.',
        routePayload: { page: 'orchestrator', label: 'Orchestrator · Progress' }
      });
    },

    hitlDeclined: function () {
      return base({
        title: 'Declined — node n-13 blocked',
        body: 'Blocked-owner: User. Parked at safe point sp-47a9.',
        severity: 'error',
        kind: 'hitl',
        blocked_reason_code: 'waiting_approval',
        allowed_action_ids: ['retry_safe', 'fresh_attempt', 'open_orch'],
        explain: 'Decline kept the run paused. Choose a recovery action from allowed_action_ids[].',
        routePayload: { page: 'orchestrator', label: 'Orchestrator' }
      });
    },

    permission: function () {
      return base({
        title: 'webfetch · docs.example.com',
        body: 'Approve this host for the rest of the session?',
        severity: 'warn',
        kind: 'permission',
        allowed_action_ids: ['deny', 'once', 'for_session', 'always'],
        patternSuggest: 'https://docs.example.com/*',
        routePayload: { page: 'home', focus: 'chat', label: 'Chat · permission card' }
      });
    },

    filesafe: function () {
      return base({
        title: 'FileSafe · Command blocklist',
        body: 'rm -rf ./dist  — blocked by command blocklist',
        severity: 'error',
        kind: 'filesafe',
        blocked_reason_code: 'filesafe_blocked',
        allowed_action_ids: ['filesafe_once', 'filesafe_add', 'cancel'],
        ttlMs: 60000,
        routePayload: { page: 'home', focus: 'chat', label: 'Chat · FileSafe card' }
      });
    },

    concern: function () {
      return base({
        title: 'Concern · Seam integration blocked',
        body: 'Projection trust degraded on seam S-12. Resolve or dismiss with rationale.',
        severity: 'warn',
        kind: 'concern',
        allowed_action_ids: ['resolve', 'dismiss', 'open_details'],
        needsRationale: true,
        rationalePlaceholder: 'Resolution / dismissal rationale (required)…',
        explain: 'Dismiss hides presentation only. Resolve requires resolution_kind + rationale (Contracts_V0).',
        routePayload: { page: 'orchestrator', label: 'Orchestrator · Concerns' }
      });
    },

    usage: function () {
      return base({
        title: 'Claude 5h window at 78%',
        body: 'Heaviest lane: lane-b (API). Cooldown resets in 00:41:12.',
        severity: 'warn',
        kind: 'usage',
        allowed_action_ids: ['acknowledge', 'open_usage'],
        routePayload: { page: 'usage', label: 'Usage' }
      });
    },

    wizard: function () {
      return base({
        title: 'Wizard blocked',
        body: 'Planning Wizard cannot continue until the report is addressed.',
        severity: 'error',
        kind: 'wizard',
        allowed_action_ids: ['resume_wizard', 'view_report'],
        routePayload: { page: 'wizard', label: 'Planning Wizard' }
      });
    }
  };
})();
