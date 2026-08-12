/* ============================================================================
   Kimi K3 — dev drawer (window.K3DevDrawer).

   Review-harness panel mounted by host.html ONLY when `?demo=1` is present.
   This is NOT product UI: it is a deterministic trigger surface for reviewers
   and the automated probes. Every button calls a real window.K3Demo method
   or a window.K3States key — no duplicated logic lives here.

   Collapses to a 28px left-edge tab. Collapse state is module-local (never
   persisted). Classes use the `k3d-` prefix; z-index sits above shell
   content (900) and below the popup layer (1400) — see devdrawer.css.
   ========================================================================== */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function mount(parentEl, ctx) {
    var root = el('div', 'k3d-root');
    root.setAttribute('data-testid', 'k3d-drawer');

    var panel = el('div', 'k3d-panel k3-scroll');

    var head = el('div', 'k3d-head');
    head.appendChild(el('div', 'k3d-title', 'Demo controls — review harness'));
    head.appendChild(el('div', 'k3-footnote',
      'Not product UI. Every button drives window.K3Demo / K3States on the active thread.'));
    panel.appendChild(head);

    var status = el('div', 'k3d-status');
    status.setAttribute('role', 'status');
    status.setAttribute('data-testid', 'k3d-status');
    panel.appendChild(status);

    function note(msg) { status.textContent = msg; }

    function run(label, fn) {
      try {
        var r = fn();
        note(label + (r === false ? ' — no-op (not applicable on this thread)' : ' — done'));
      } catch (e) {
        note(label + ' — failed: ' + (e && e.message));
      }
    }

    // Button action calling a K3Demo method by name (resolved lazily so load
    // order never matters).
    function demo(label, method, args) {
      return function () {
        run(label, function () {
          var D = window.K3Demo;
          if (!D || typeof D[method] !== 'function') throw new Error('K3Demo.' + method + ' missing');
          return D[method].apply(D, [ctx].concat(args || []));
        });
      };
    }

    // Button action applying a K3States driver key.
    function state(key) {
      return function () {
        run(key, function () {
          if (!window.K3States) throw new Error('K3States missing');
          return window.K3States.apply(key, ctx);
        });
      };
    }

    // BSD scope change keeps the current mode (K3Demo.setBsd writes both).
    function bsdScope(scope) {
      return function () {
        run('Scope: ' + scope, function () {
          var D = window.K3Demo;
          if (!D) throw new Error('K3Demo missing');
          var tid = ctx.store.get('activeThreadId', null);
          var cur = (tid && ctx.store.get('bsdState.' + tid, {})) || {};
          return D.setBsd(ctx, cur.mode || 'auto', scope);
        });
      };
    }

    function serverContinuingToggle() {
      run('Server-continuing', function () {
        var D = window.K3Demo;
        if (!D) throw new Error('K3Demo missing');
        var cur = !!ctx.store.get('sync.serverContinuing', false);
        return D.serverContinuing(ctx, !cur);
      });
    }

    var SECTIONS = [
      ['Scenario', [
        ['Reset scenario', demo('Reset scenario', 'resetScenario')]
      ]],
      ['History', [
        ['Open', demo('History open', 'openHistory')],
        ['Close', demo('History close', 'closeHistory')],
        ['Pin', demo('History pin', 'pinHistory')],
        ['Unpin', demo('History unpin', 'unpinHistory')],
        ['Full ↔ Compact', demo('History full↔compact', 'togglePinnedCompact')]
      ]],
      ['Questions', [
        ['Trigger flow', demo('Trigger question flow', 'triggerQuestionFlow')],
        ['Answer', demo('Answer current', 'answerCurrent')],
        ['Skip', demo('Skip current', 'skipCurrent')],
        ['Cancel', demo('Cancel flow', 'cancelFlow')],
        ['Submit', demo('Submit flow', 'submitFlow')],
        ['Reset', demo('Reset flow', 'resetFlow')]
      ]],
      ['Goal', [
        ['Start', demo('Goal start', 'goalStart')],
        ['Pause', demo('Goal pause', 'goalPause')],
        ['Resume', demo('Goal resume', 'goalResume')],
        ['Update', demo('Goal update', 'goalUpdate')],
        ['Stop', demo('Goal stop', 'goalStop')],
        ['Replan', demo('Goal replan', 'goalReplan')],
        ['Complete', demo('Goal complete', 'goalComplete')],
        ['Blocked', demo('Goal blocked', 'goalBlocked')]
      ]],
      ['Todos', [
        ['Add', demo('Todo add', 'todoAdd')],
        ['Complete next', demo('Todo complete', 'todoComplete')],
        ['Reopen last', demo('Todo reopen', 'todoReopen')]
      ]],
      ['Subagents', [
        ['Spawn', demo('Subagent spawn', 'subagentSpawn')],
        ['Advance', demo('Subagent advance', 'subagentAdvance')],
        ['Complete', demo('Subagent complete', 'subagentComplete')],
        ['Fail', demo('Subagent fail', 'subagentFail')],
        ['Stop', demo('Subagent stop', 'subagentStop')]
      ]],
      ['Activity', [
        ['Advance', demo('Advance activity', 'advanceActivity')]
      ]],
      ['Diff', [
        ['Create', demo('Create diff', 'createDiff')],
        ['Update', demo('Update diff', 'updateDiff')],
        ['Open', demo('Open diff', 'diffOpen')]
      ]],
      ['Artifacts', [
        ['Open', demo('Artifact open', 'artifactOpen')],
        ['Close', demo('Artifact close', 'artifactClose')],
        ['Switch', demo('Artifact switch', 'artifactSwitch')],
        ['Loading', demo('Artifact loading', 'artifactLoading')],
        ['Error · Retry', demo('Artifact error', 'artifactErrorRetry')],
        ['Updated', demo('Artifact updated', 'artifactSetUpdated')]
      ]],
      ['Route', [
        ['Picker', demo('Route picker', 'routePickerDemo')],
        ['Warning', demo('Route warning', 'injectRouteWarning')],
        ['Effective', state('route-effective')],
        ['Setup', state('provider-setup')]
      ]],
      ['Access', [
        ['Ask for approval', demo('Access: ask', 'setAccess', ['ask'])],
        ['Auto accept edits', demo('Access: auto-edits', 'setAccess', ['auto-edits'])],
        ['Auto', demo('Access: auto', 'setAccess', ['auto'])],
        ['Full Access', demo('Access: full', 'setAccess', ['full'])],
        ['Limited note', state('access-limited')]
      ]],
      ['BSD', [
        ['Off', demo('BSD off', 'setBsd', ['off'])],
        ['Auto', demo('BSD auto', 'setBsd', ['auto'])],
        ['On', demo('BSD on', 'setBsd', ['on'])],
        ['Scope: turn', bsdScope('turn')],
        ['Scope: thread', bsdScope('thread')],
        ['Glow on', demo('BSD glow on', 'bsdAutoGlow', [true])],
        ['Glow off', demo('BSD glow off', 'bsdAutoGlow', [false])],
        ['Advice', demo('BSD advice', 'bsdPushAdvice')],
        ['Silent', demo('BSD silent', 'bsdPushResult', ['silent'])],
        ['Duplicate', demo('BSD duplicate', 'bsdPushResult', ['duplicate'])],
        ['Timeout', demo('BSD timeout', 'bsdPushResult', ['timeout'])],
        ['Unavailable', demo('BSD unavailable', 'bsdPushResult', ['unavailable'])],
        ['Quota', demo('BSD quota', 'bsdPushResult', ['quota'])]
      ]],
      ['Approvals', [
        ['Inject', demo('Inject approval', 'injectApproval')],
        ['Allow once', demo('Allow once', 'decideApproval', ['once'])],
        ['Allow for session', demo('Allow for session', 'decideApproval', ['session'])],
        ['Deny', demo('Deny', 'decideApproval', ['deny'])]
      ]],
      ['Context', [
        ['Compact now', demo('Compact now', 'compactNow')],
        ['Lens receipt', demo('Lens receipt', 'lensReceipt')]
      ]],
      ['Threads', [
        ['Request', demo('Thread request', 'threadRequestTo')],
        ['Await', demo('Thread await', 'threadAwait')],
        ['Spawn', demo('Thread spawn', 'threadSpawn')],
        ['Branch', demo('Thread branch', 'threadBranch')],
        ['Restore point', demo('Restore point', 'threadRestorePoint')],
        ['Rewind', demo('Rewind', 'threadRewind')],
        ['Redirect', demo('Redirect', 'redirectActive')]
      ]],
      ['Sync', [
        ['Go offline', demo('Go offline', 'goOffline')],
        ['Queue send', demo('Queue send', 'queueOffline')],
        ['Reconnect step', demo('Reconnect step', 'reconnectStep')],
        ['Reconnect full', demo('Reconnect full', 'reconnectFull')],
        ['Domain fail', demo('Domain fail', 'failSearchDomain')],
        ['Server-continuing', serverContinuingToggle]
      ]],
      ['Attachments', [
        ['Native', state('attachment-native')],
        ['Transformed', state('attachment-transformed')],
        ['Alternate', state('attachment-alternate')],
        ['Unsupported', state('attachment-unsupported')]
      ]],
      ['Notifications', [
        ['Approval needed', demo('Notify approval', 'injectApprovalNeeded')],
        ['CI test failed', demo('Notify CI', 'injectCiFailure')],
        ['Provider update', demo('Notify update', 'injectProviderUpdate')],
        ['Sign-in waiting', demo('Notify sign-in', 'injectSigninWaiting')]
      ]]
    ];

    SECTIONS.forEach(function (pair) {
      var sec = el('div', 'k3d-section');
      sec.appendChild(el('div', 'k3d-sec-head', pair[0]));
      var grid = el('div', 'k3d-grid');
      pair[1].forEach(function (b) {
        var btn = el('button', 'k3d-btn', b[0]);
        btn.type = 'button';
        btn.addEventListener('click', b[1]);
        grid.appendChild(btn);
      });
      sec.appendChild(grid);
      panel.appendChild(sec);
    });

    panel.appendChild(el('div', 'k3-footnote k3d-foot',
      'State is not persisted. Full reset = Scenario → Reset scenario.'));

    // 28px edge tab — always visible; toggles the panel.
    var tab = el('button', 'k3d-tab', 'DEMO');
    tab.type = 'button';
    tab.setAttribute('aria-label', 'Toggle demo controls');
    tab.setAttribute('aria-expanded', 'true');
    tab.setAttribute('data-testid', 'k3d-tab');
    tab.addEventListener('click', function () {
      var collapsed = root.classList.toggle('is-collapsed');
      tab.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });

    root.appendChild(panel);
    root.appendChild(tab);
    (parentEl || document.body).appendChild(root);

    return {
      el: root,
      unmount: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  window.K3DevDrawer = { mount: mount };
})();
