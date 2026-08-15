/* t3 — Soft Shelves: role shelves that NEVER blank.
   When Q is active, keep at least one readable shelf visible; Q docks without
   erasing the transcript. No empty gray band voids. */
(function () {
  'use strict';

  var ID = 't3';
  var LABEL = 'Soft Shelves';

  function shelfGroups(messages) {
    var shelves = [];
    var cur = null;
    (messages || []).forEach(function (m) {
      var role = m.role === 'user' ? 'user' : 'assistant';
      if (!cur || cur.role !== role) {
        cur = { role: role, messages: [m], id: 'shelf-' + m.id };
        shelves.push(cur);
      } else {
        cur.messages.push(m);
      }
    });
    return shelves;
  }

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
      '<article class="pm-msg t3-item' + (msg.collapsedByDefault ? ' has-expand' : '') +
      hit +
      '" data-role="' +
      K.escapeHtml(role) +
      '" data-message-id="' +
      K.escapeHtml(msg.id) +
      '">' +
      K.renderThoughts(msg.thoughtSegments, ui.expandedThoughtIds || {}) +
      '<div class="pm-msg-body t3-copy' +
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

  /** Work shelf stubs with reopen — structure forks from shared render dumps. */
  function surfacesHtml(thread, ui, K) {
    if (!thread) return '';
    var stubs = [];
    var decks = [];

    function pushShelf(key, title, bodyHtml) {
      if (!bodyHtml) return;
      stubs.push(
        '<div class="t3-work-stub" data-cw-stub="' +
          K.escapeHtml(key) +
          '">' +
          '<div class="t3-work-stub-lip">' +
          '<span class="t3-work-stub-role">' +
          K.escapeHtml(title) +
          '</span>' +
          '</div>' +
          '<button type="button" class="t3-work-reopen" data-cw-expand="' +
          K.escapeHtml(key) +
          '" aria-pressed="false">Reopen</button>' +
          '</div>'
      );
      decks.push(
        '<details class="t3-work-deck-leaf pm-work-surface" data-kind="' +
          K.escapeHtml(key) +
          '" data-folio-key="' +
          K.escapeHtml(key) +
          '">' +
          '<summary class="t3-work-deck-sum">' +
          '<span class="t3-lip-role">' +
          K.escapeHtml(title) +
          '</span>' +
          '<span class="pm-work-chev" aria-hidden="true">›</span>' +
          '</summary>' +
          '<div class="t3-work-deck-body pm-work-surface-body">' +
          bodyHtml +
          '</div>' +
          '</details>'
      );
    }

    pushShelf(
      'goal',
      'Goal',
      K.renderGoal(thread.goal, {
        goalExpanded:
          ui.goalExpanded != null ? ui.goalExpanded : thread.goal && thread.goal.expanded
      })
    );
    pushShelf('todo', 'Todo', K.renderTodo(thread.todos));
    pushShelf(
      'subagent',
      'Agents',
      K.renderSubagents(thread.subagentGroups, ui.expandedSubagentIds || {})
    );
    pushShelf('diff', 'Diffs', K.renderDiffs(thread.diffGroups));
    pushShelf('artifacts', 'Artifacts', K.renderArtifacts(thread.artifacts));
    if (!stubs.length) return '';

    var compact =
      (K.renderCompactWork && K.renderCompactWork(thread, 'shelves')) ||
      (window.PMChatV2 && window.PMChatV2.renderCompactWorkBand
        ? window.PMChatV2.renderCompactWorkBand(thread, 'shelves')
        : '');

    return (
      (compact || '') +
      '<section class="t3-shelf t3-shelf-work" data-shelf-role="work" data-surfaces data-work-detail-stack>' +
      '<div class="t3-lip">' +
      '<span class="t3-lip-role">Work stubs</span>' +
      '<span class="t3-lip-count">' +
      stubs.length +
      ' reopenable</span>' +
      '</div>' +
      '<div class="t3-work-stub-row">' +
      stubs.join('') +
      '</div>' +
      '<div class="t3-deck t3-deck-work" data-t3-work-deck>' +
      decks.join('') +
      '</div>' +
      '</section>'
    );
  }

  function mount(slotEl, props) {
    if (!window.PMChatThreadKit) throw new Error('PMChatThreadKit required for t3');
    var K = window.PMChatThreadKit;
    return K.createThreadMount(
      { id: ID, label: LABEL },
      {
        rootClass: 'pm-t3-shelves',
        initLocal: function (local) {
          local.reopenedShelfIds = local.reopenedShelfIds || Object.create(null);
        },
        applyWidth: function (root, w) {
          root.setAttribute('data-chat-tier', w <= 560 ? 'min' : w <= 800 ? 'mid' : 'wide');
        },
        paint: function (ctx) {
          var running = !!(ctx.running && !ctx.running.stopped);
          var qActive = !!ctx.q;
          var shelves = shelfGroups(ctx.msgs);
          var workShelf = surfacesHtml(ctx.thread, ctx.ui, K);

          /*
           * Never blank: when Q is active and there are many shelves, keep the
           * last readable shelf + work shelf visible; older shelves collapse to
           * a compact stub so the transcript never becomes an empty gray band.
           */
          var keepFrom = 0;
          if (qActive && shelves.length > 1) {
            keepFrom = Math.max(0, shelves.length - 1);
          }

          var html = '';
          if (qActive && keepFrom > 0) {
            html +=
              '<div class="t3-shelf-stub" aria-hidden="false">' +
              '<span class="t3-stub-label">' +
              keepFrom +
              (keepFrom === 1 ? ' earlier shelf' : ' earlier shelves') +
              ' · scroll for full history</span>' +
              '</div>';
          }

          shelves.forEach(function (shelf, i) {
            var reopened =
              ctx.local.reopenedShelfIds && ctx.local.reopenedShelfIds[shelf.id];
            if (qActive && i < keepFrom && !reopened) {
              /* Compact stub still present in DOM for scroll restoration / lens ids */
              var lastStub = shelf.messages[shelf.messages.length - 1];
              var stubPreview = lastStub
                ? String(lastStub.body || lastStub.text || '')
                    .replace(/\s+/g, ' ')
                    .trim()
                : '';
              if (stubPreview.length > 64) {
                var cut = stubPreview.slice(0, 64);
                var sp = cut.lastIndexOf(' ');
                stubPreview = (sp > 36 ? cut.slice(0, sp) : cut).replace(/[.,;:]+$/, '') + '…';
              }
              var stubMsgs = shelf.messages
                .map(function (m) {
                  return (
                    '<span class="t3-stub-msg" data-message-id="' +
                    K.escapeHtml(m.id) +
                    '" hidden></span>'
                  );
                })
                .join('');
              html +=
                '<section class="t3-shelf is-compact" data-shelf-role="' +
                K.escapeHtml(shelf.role) +
                '" data-shelf-id="' +
                K.escapeHtml(shelf.id) +
                '">' +
                '<div class="t3-lip t3-lip-compact">' +
                '<span class="t3-lip-role">' +
                (shelf.role === 'user' ? 'You' : 'Grok') +
                '</span>' +
                '<span class="t3-lip-count">' +
                shelf.messages.length +
                '</span>' +
                '<button type="button" class="t3-shelf-reopen" data-shelf-reopen="' +
                K.escapeHtml(shelf.id) +
                '">Reopen</button>' +
                (stubPreview
                  ? '<span class="t3-lip-preview">' + K.escapeHtml(stubPreview) + '</span>'
                  : '') +
                '</div>' +
                stubMsgs +
                '</section>';
              return;
            }

            var msgs = shelf.messages
              .map(function (m) {
                return msgHtml(m, ctx.ui, { active: running }, K, ctx.highlightId);
              })
              .join('');
            var lip = shelf.role === 'user' ? 'You' : 'Grok';
            html +=
              '<section class="t3-shelf" data-shelf-role="' +
              K.escapeHtml(shelf.role) +
              '" data-shelf-id="' +
              K.escapeHtml(shelf.id) +
              '" style="--t3-i:' +
              i +
              '">' +
              '<div class="t3-lip">' +
              '<span class="t3-lip-role">' +
              lip +
              '</span>' +
              '<span class="t3-lip-count">' +
              shelf.messages.length +
              (shelf.messages.length === 1 ? ' message' : ' messages') +
              '</span>' +
              '</div>' +
              '<div class="t3-deck">' +
              msgs +
              '</div>' +
              '</section>';
          });

          /* Guarantee at least one readable shelf even with zero messages */
          if (!shelves.length) {
            html +=
              '<section class="t3-shelf t3-shelf-empty" data-shelf-role="assistant">' +
              '<div class="t3-lip"><span class="t3-lip-role">Grok</span></div>' +
              '<div class="t3-deck"><p class="t3-empty-copy">Conversation shelves appear here.</p></div>' +
              '</section>';
          }

          if (workShelf) html += workShelf;

          ctx.root.classList.toggle('has-questionnaire', qActive);
          ctx.root.innerHTML =
            '<header class="t3-chrome" aria-label="' +
            K.escapeHtml(LABEL) +
            '">' +
            '<span class="t3-chrome-paradigm">' +
            K.escapeHtml(LABEL) +
            '</span>' +
            '</header>' +
            '<div class="pm-transcript pm-scroll t3-transcript" data-transcript>' +
            html +
            '<div class="t3-live" data-live-host>' +
            (running ? K.renderActivityLive(ctx.running) : '') +
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
