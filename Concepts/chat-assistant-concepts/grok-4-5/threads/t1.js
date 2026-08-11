/* t1 — Prose Column: magazine reading measure (~66ch).
   Work surfaces live in a UNIQUE collapsible folio (not renderWorkSurfaces dump).
   Quiet paradigm label only — no second Grok brand masthead. */
(function () {
  'use strict';

  var ID = 't1';
  var LABEL = 'Prose Column';

  function msgHtml(msg, ui, opts, K, hitId) {
    if (!msg) return '';
    opts = opts || {};
    ui = ui || {};
    var expanded = !!(ui.expandedMessageIds && ui.expandedMessageIds[msg.id]);
    var collapsed = !!(msg.collapsedByDefault && !expanded);
    var role = msg.role || 'assistant';
    var body = msg.body != null ? String(msg.body) : '';
    var hit = hitId === msg.id ? ' is-search-hit' : '';
    var expand = msg.collapsedByDefault
      ? '<button type="button" class="pm-msg-expand t1-expand" data-msg-action="expand" data-message-id="' +
        K.escapeHtml(msg.id) +
        '" aria-label="' +
        (collapsed ? 'Show more' : 'Show less') +
        '">' +
        (typeof window.PMIcon === 'function' ? window.PMIcon(collapsed ? 'chevD' : 'chevR', 'pm-btn-icon') : '') +
        '<span>' +
        (collapsed ? 'Show more' : 'Show less') +
        '</span></button>'
      : '';
    var thoughts = K.renderThoughts(msg.thoughtSegments, ui.expandedThoughtIds || {});
    var hist =
      msg.activityGroup && msg.activityGroup.status !== 'running'
        ? K.renderActivityHistory(msg.activityGroup)
        : '';
    return (
      '<article class="pm-msg t1-entry' +
      (msg.collapsedByDefault ? ' has-expand' : '') +
      hit +
      '" data-role="' +
      K.escapeHtml(role) +
      '" data-message-id="' +
      K.escapeHtml(msg.id) +
      '">' +
      (role === 'assistant'
        ? '<div class="t1-entry-rule" aria-hidden="true"></div>'
        : '') +
      thoughts +
      '<div class="pm-msg-body t1-prose' +
      (collapsed ? ' is-collapsed' : '') +
      '">' +
      K.renderBodyHtml(body) +
      '</div>' +
      expand +
      hist +
      K.renderHoverRow(msg, { active: !!opts.active }) +
      '</article>'
    );
  }

  /** Folio unique to t1: each surface is a named leaf page, composed here. */
  function folioHtml(thread, ui, K) {
    if (!thread) return '';
    var leaves = [];

    function pushLeaf(key, title, bodyHtml) {
      if (!bodyHtml) return;
      leaves.push({ key: key, title: title, body: bodyHtml });
    }

    pushLeaf(
      'goal',
      'Goal',
      K.renderGoal(thread.goal, {
        goalExpanded:
          ui.goalExpanded != null ? ui.goalExpanded : thread.goal && thread.goal.expanded
      })
    );
    pushLeaf('todo', 'Todo', K.renderTodo(thread.todos));
    pushLeaf(
      'subagents',
      'Subagents',
      K.renderSubagents(thread.subagentGroups, ui.expandedSubagentIds || {})
    );
    pushLeaf('diffs', 'Diffs', K.renderDiffs(thread.diffGroups));
    pushLeaf('artifacts', 'Artifacts', K.renderArtifacts(thread.artifacts));
    pushLeaf('browser', 'Browser', K.renderBrowserSessions(thread.browserSessions));

    if (!leaves.length) return '';

    var pages = leaves
      .map(function (leaf, i) {
        return (
          '<details class="t1-folio-leaf pm-folio-leaf" data-folio-key="' +
          K.escapeHtml(leaf.key) +
          '" data-kind="' +
          K.escapeHtml(leaf.key === 'subagents' ? 'subagent' : leaf.key === 'diffs' ? 'diff' : leaf.key) +
          '"' +
          (i === 0 ? ' open' : '') +
          '>' +
          '<summary class="t1-folio-tab">' +
          '<span class="t1-folio-roman" aria-hidden="true">' +
          String(i + 1) +
          '</span>' +
          '<span class="t1-folio-title">' +
          K.escapeHtml(leaf.title) +
          '</span>' +
          '<span class="pm-work-chev" aria-hidden="true">›</span>' +
          '</summary>' +
          '<div class="t1-folio-page pm-work-surface-body">' +
          leaf.body +
          '</div>' +
          '</details>'
        );
      })
      .join('');

    var compact =
      (K.renderCompactWork && K.renderCompactWork(thread, 'folio')) ||
      (window.PMChatV2 && window.PMChatV2.renderCompactWorkBand
        ? window.PMChatV2.renderCompactWorkBand(thread, 'folio')
        : '');

    return (
      (compact || '') +
      '<aside class="t1-folio" data-surfaces data-work-detail-stack aria-label="Work folio">' +
      '<div class="t1-folio-spine">' +
      '<span class="t1-folio-kicker">Folio</span>' +
      '<span class="t1-folio-count">' +
      leaves.length +
      ' leaf' +
      (leaves.length === 1 ? '' : 's') +
      '</span>' +
      '</div>' +
      '<div class="t1-folio-leaves pm-stagger">' +
      pages +
      '</div>' +
      '</aside>'
    );
  }

  function mount(slotEl, props) {
    if (!window.PMChatThreadKit) throw new Error('PMChatThreadKit required for t1');
    var K = window.PMChatThreadKit;
    return K.createThreadMount(
      { id: ID, label: LABEL, rootClass: 'pm-t1-prose' },
      {
        rootClass: 'pm-t1-prose',
        applyWidth: function (root, w) {
          var px = Math.min(680, Math.max(300, (w || 750) - 40));
          root.style.setProperty('--t1-measure', px + 'px');
          root.setAttribute('data-chat-tier', w <= 560 ? 'min' : w <= 800 ? 'mid' : 'wide');
        },
        paint: function (ctx) {
          var running = !!(ctx.running && !ctx.running.stopped);
          var stream = ctx.msgs
            .map(function (m) {
              return msgHtml(m, ctx.ui, { active: running }, K, ctx.highlightId);
            })
            .join('');

          /* Folio stays under stream even when Q is docked — surfaces don't vanish */
          var folio = folioHtml(ctx.thread, ctx.ui, K);

          ctx.root.innerHTML =
            '<header class="t1-chrome" aria-label="' +
            K.escapeHtml(LABEL) +
            '">' +
            '<span class="t1-chrome-paradigm">' +
            K.escapeHtml(LABEL) +
            '</span>' +
            '</header>' +
            '<div class="pm-transcript pm-scroll t1-stream" data-transcript>' +
            '<div class="t1-measure">' +
            stream +
            '<div class="t1-live-host" data-live-host>' +
            (running ? K.renderActivityLive(ctx.running) : '') +
            '</div>' +
            (folio || '') +
            '</div>' +
            '</div>' +
            (K.renderGoalStrip(ctx.thread) || '') +
            K.renderDock(ctx.store, ctx.tid, ctx.q, ID);
        }
      }
    )(slotEl, props);
  }

  window.PMChatThreads = window.PMChatThreads || {};
  window.PMChatThreads[ID] = { id: ID, label: LABEL, mount: mount };
})();
