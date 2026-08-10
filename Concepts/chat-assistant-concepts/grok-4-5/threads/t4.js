/* t4 — Yield Sheets: work surfaces as PRIMARY sheets above/around transcript.
   Transcript yields (smaller measure). Sheets are not a slide-over overlay. */
(function () {
  'use strict';

  var ID = 't4';
  var LABEL = 'Yield Sheets';

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
      ? '<button type="button" class="pm-msg-expand" data-msg-action="expand" data-message-id="' +
        K.escapeHtml(msg.id) +
        '" aria-label="' +
        (collapsed ? 'Show more' : 'Show less') +
        '">' +
        (typeof window.PMIcon === 'function' ? window.PMIcon(collapsed ? 'chevD' : 'chevR', 'pm-btn-icon') : '') +
        '<span>' +
        (collapsed ? 'Show more' : 'Show less') +
        '</span></button>'
      : '';
    return (
      '<article class="pm-msg t4-msg' + (msg.collapsedByDefault ? ' has-expand' : '') +
      hit +
      '" data-role="' +
      K.escapeHtml(role) +
      '" data-message-id="' +
      K.escapeHtml(msg.id) +
      '">' +
      K.renderThoughts(msg.thoughtSegments, ui.expandedThoughtIds || {}) +
      '<div class="pm-msg-body t4-body' +
      (collapsed ? ' is-collapsed' : '') +
      '">' +
      K.renderBodyHtml(body) +
      '</div>' +
      expand +
      (msg.activityGroup && msg.activityGroup.status !== 'running'
        ? K.renderActivityHistory(msg.activityGroup)
        : '') +
      K.renderHoverRow(msg, { active: !!opts.active }) +
      '</article>'
    );
  }

  function sheetBits(thread, ui, local, K) {
    if (!thread) return { chips: '', sheets: '', openCount: 0 };
    var dismissed = local.dismissedSheets || Object.create(null);
    var chips = [];
    var sheets = [];
    var openCount = 0;

    function pushSheet(key, title, bodyHtml) {
      if (!bodyHtml) return;
      if (dismissed[key]) {
        chips.push(
          '<button type="button" class="t4-chip" data-sheet-restore="' +
            K.escapeHtml(key) +
            '">' +
            K.escapeHtml(title) +
            '</button>'
        );
        return;
      }
      openCount += 1;
      sheets.push(
        '<aside class="t4-sheet" data-sheet="' +
          K.escapeHtml(key) +
          '">' +
          '<div class="t4-sheet-bar">' +
          '<span class="t4-sheet-title">' +
          K.escapeHtml(title) +
          '</span>' +
          '<button type="button" class="pm-btn pm-btn-ghost t4-yield-btn" data-sheet-dismiss="' +
          K.escapeHtml(key) +
          '">Yield</button>' +
          '</div>' +
          '<div class="t4-sheet-body">' +
          bodyHtml +
          '</div>' +
          '</aside>'
      );
    }

    pushSheet(
      'goal',
      'Goal',
      K.renderGoal(thread.goal, {
        goalExpanded:
          ui.goalExpanded != null
            ? ui.goalExpanded
            : thread.goal && thread.goal.expanded
      })
    );
    pushSheet('todo', 'Todo', K.renderTodo(thread.todos));
    pushSheet(
      'subagents',
      'Subagents',
      K.renderSubagents(thread.subagentGroups, ui.expandedSubagentIds || {})
    );
    pushSheet('diffs', 'Diffs', K.renderDiffs(thread.diffGroups));
    pushSheet('artifacts', 'Artifacts', K.renderArtifacts(thread.artifacts));

    var chipRow = chips.length
      ? '<div class="t4-chip-row">' +
        chips.join('') +
        '<button type="button" class="t4-chip t4-chip-all" data-sheet-restore="*">Restore all</button>' +
        '</div>'
      : '';

    var compact =
      (K.renderCompactWork && K.renderCompactWork(thread, 'yield')) ||
      (window.PMChatV2 && window.PMChatV2.renderCompactWorkBand
        ? window.PMChatV2.renderCompactWorkBand(thread, 'yield')
        : '');

    return {
      chips: chipRow,
      sheets: (compact || '') + '<div data-work-detail-stack data-surfaces>' + sheets.join('') + '</div>',
      openCount: openCount
    };
  }

  function mount(slotEl, props) {
    if (!window.PMChatThreadKit) throw new Error('PMChatThreadKit required for t4');
    var K = window.PMChatThreadKit;
    return K.createThreadMount(
      { id: ID, label: LABEL },
      {
        rootClass: 'pm-t4-yield',
        initLocal: function (local) {
          local.dismissedSheets = Object.create(null);
        },
        applyWidth: function (root, w) {
          root.setAttribute('data-chat-tier', w <= 560 ? 'min' : w <= 800 ? 'mid' : 'wide');
          /* Transcript measure shrinks further when sheets are open (set in paint) */
          root.style.setProperty('--t4-yield-ch', w <= 560 ? '100%' : w <= 800 ? '48ch' : '42ch');
        },
        paint: function (ctx) {
          var running = !!(ctx.running && !ctx.running.stopped);
          var msgHtmlOut = ctx.msgs
            .map(function (m) {
              return msgHtml(m, ctx.ui, { active: running }, K, ctx.highlightId);
            })
            .join('');

          /* Sheets stay primary even when Q docks — transcript yields around them */
          var bits = sheetBits(ctx.thread, ctx.ui, ctx.local, K);
          ctx.root.classList.toggle('has-sheets', bits.openCount > 0);
          ctx.root.classList.toggle('has-questionnaire', !!ctx.q);

          var primarySheets =
            bits.openCount > 0
              ? '<div class="t4-sheet-primary" data-surfaces>' +
                '<div class="t4-sheet-stack">' +
                bits.sheets +
                '</div>' +
                '</div>'
              : '<div class="t4-sheet-primary is-empty" data-surfaces hidden></div>';

          ctx.root.innerHTML =
            '<header class="t4-chrome" aria-label="' +
            K.escapeHtml(LABEL) +
            '">' +
            '<span class="t4-chrome-paradigm">' +
            K.escapeHtml(LABEL) +
            '</span>' +
            bits.chips +
            '</header>' +
            primarySheets +
            '<div class="pm-transcript pm-scroll t4-yield-stream" data-transcript>' +
            '<div class="t4-yield-measure">' +
            msgHtmlOut +
            '<div data-live-host class="t4-live">' +
            (running ? K.renderActivityLive(ctx.running) : '') +
            '</div>' +
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
