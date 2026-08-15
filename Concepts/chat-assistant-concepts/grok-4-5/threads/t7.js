/* t7 — One-Turn Focus: one large turn stage; functional filmstrip switches focus. */
(function () {
  'use strict';

  var ID = 't7';
  var LABEL = 'One-Turn Focus';

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
      '<article class="pm-msg t7-msg' + (msg.collapsedByDefault ? ' has-expand' : '') +
      hit +
      '" data-role="' +
      K.escapeHtml(role) +
      '" data-message-id="' +
      K.escapeHtml(msg.id) +
      '">' +
      '<div class="t7-msg-kicker">' +
      (role === 'user' ? 'You asked' : 'Reply') +
      '</div>' +
      K.renderThoughts(msg.thoughtSegments, ui.expandedThoughtIds || {}) +
      '<div class="pm-msg-body t7-body' +
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

  function turnSnip(t) {
    var raw = '';
    if (t.user) raw = String(t.user.body || '');
    else if (t.assistant[0]) raw = String(t.assistant[0].body || '');
    else return 'Turn';
    raw = raw.replace(/\s+/g, ' ').trim();
    if (raw.length <= 48) return raw;
    var cut = raw.slice(0, 48);
    var sp = cut.lastIndexOf(' ');
    return (sp > 24 ? cut.slice(0, sp) : cut).replace(/[.,;:]+$/, '') + '…';
  }


  function focusWorkHtml(thread, ui, K) {
    if (!thread) return '';
    var thumbs = [];
    var panels = [];
    function push(key, title, bodyHtml) {
      if (!bodyHtml) return;
      thumbs.push(
        '<button type="button" class="t7-work-thumb" data-cw-expand="' +
          K.escapeHtml(key) +
          '" aria-pressed="false">' +
          '<span class="t7-work-thumb-title">' +
          K.escapeHtml(title) +
          '</span></button>'
      );
      panels.push(
        '<details class="t7-work-panel pm-work-surface" data-kind="' +
          K.escapeHtml(key) +
          '">' +
          '<summary class="pm-work-surface-head"><span class="pm-work-chev" aria-hidden="true">›</span><span class="pm-work-surface-title">' +
          K.escapeHtml(title) +
          '</span></summary>' +
          '<div class="pm-work-surface-body">' +
          bodyHtml +
          '</div></details>'
      );
    }
    push(
      'goal',
      'Goal',
      K.renderGoal(thread.goal, {
        goalExpanded:
          ui.goalExpanded != null ? ui.goalExpanded : thread.goal && thread.goal.expanded
      })
    );
    push('todo', 'Todo', K.renderTodo(thread.todos));
    push(
      'subagent',
      'Agents',
      K.renderSubagents(thread.subagentGroups, ui.expandedSubagentIds || {})
    );
    push('diff', 'Diffs', K.renderDiffs(thread.diffGroups));
    push('artifacts', 'Artifacts', K.renderArtifacts(thread.artifacts));
    if (!thumbs.length) return '';
    var compact =
      (K.renderCompactWork && K.renderCompactWork(thread, 'focus')) ||
      (window.PMChatV2 && window.PMChatV2.renderCompactWorkBand
        ? window.PMChatV2.renderCompactWorkBand(thread, 'focus')
        : '');
    return (
      (compact || '') +
      '<div class="t7-work-focus" data-surfaces data-work-detail-stack>' +
      '<div class="t7-work-film" data-cw-band aria-label="Work filmstrip">' +
      thumbs.join('') +
      '</div>' +
      '<div class="t7-work-panels">' +
      panels.join('') +
      '</div></div>'
    );
  }

  function mount(slotEl, props) {
    if (!window.PMChatThreadKit) throw new Error('PMChatThreadKit required for t7');
    var K = window.PMChatThreadKit;
    return K.createThreadMount(
      { id: ID, label: LABEL },
      {
        rootClass: 'pm-t7-focus',
        initLocal: function (local) {
          local.focusTurnId = null;
          local.prevFocusIdx = null;
        },
        applyWidth: function (root, w) {
          root.setAttribute('data-chat-tier', w <= 560 ? 'min' : w <= 800 ? 'mid' : 'wide');
        },
        paint: function (ctx) {
          var running = !!(ctx.running && !ctx.running.stopped);
          var turns = K.groupTurns(ctx.msgs);
          if (!turns.length) {
            ctx.local.focusTurnId = null;
          } else {
            var found = false;
            for (var i = 0; i < turns.length; i++) {
              if (turns[i].id === ctx.local.focusTurnId) {
                found = true;
                break;
              }
            }
            if (!found) ctx.local.focusTurnId = turns[turns.length - 1].id;
          }

          var focusIdx = -1;
          var focus = null;
          for (var j = 0; j < turns.length; j++) {
            if (turns[j].id === ctx.local.focusTurnId) {
              focus = turns[j];
              focusIdx = j;
              break;
            }
          }
          if (!focus && turns.length) {
            focus = turns[turns.length - 1];
            focusIdx = turns.length - 1;
          }

          var prev = focusIdx > 0 ? turns[focusIdx - 1] : null;
          var next = focusIdx >= 0 && focusIdx < turns.length - 1 ? turns[focusIdx + 1] : null;

          var film = turns
            .map(function (t, idx) {
              var hasUser = !!t.user;
              var asstN = (t.assistant && t.assistant.length) || 0;
              return (
                '<button type="button" class="t7-thumb' +
                (focus && focus.id === t.id ? ' is-active' : '') +
                '" data-focus-turn="' +
                K.escapeHtml(t.id) +
                '" aria-pressed="' +
                (focus && focus.id === t.id ? 'true' : 'false') +
                '" aria-label="Show turn ' +
                (idx + 1) +
                '">' +
                '<span class="t7-thumb-n">' +
                (idx + 1) +
                '</span>' +
                '<span class="t7-thumb-snip">' +
                K.escapeHtml(turnSnip(t)) +
                '</span>' +
                '<span class="t7-thumb-bits">' +
                (hasUser ? '<span class="t7-bit is-user">You</span>' : '') +
                (asstN
                  ? '<span class="t7-bit is-asst">' + asstN + ' reply</span>'
                  : '') +
                '</span>' +
                '</button>'
              );
            })
            .join('');

          var slideDir = '';
          if (
            ctx.local.prevFocusIdx != null &&
            focusIdx >= 0 &&
            focusIdx !== ctx.local.prevFocusIdx
          ) {
            slideDir = focusIdx > ctx.local.prevFocusIdx ? 'forward' : 'back';
          }
          ctx.local.prevFocusIdx = focusIdx;

          var room = '';
          if (focus) {
            var parts = [];
            if (focus.user) {
              parts.push(msgHtml(focus.user, ctx.ui, { active: false }, K, ctx.highlightId));
            }
            focus.assistant.forEach(function (m) {
              parts.push(msgHtml(m, ctx.ui, { active: running }, K, ctx.highlightId));
            });
            room = parts.join('');
          }

          var surfaces = ctx.q ? '' : focusWorkHtml(ctx.thread, ctx.ui, K);

          ctx.root.innerHTML =
            '<div class="t7-frame">' +
            '<div class="t7-paradigm">' +
            '<span class="t7-paradigm-label">' +
            K.escapeHtml(LABEL) +
            '</span>' +
            '<div class="t7-nav">' +
            (prev
              ? '<button type="button" class="pm-btn pm-btn-ghost t7-nav-btn" data-focus-turn="' +
                K.escapeHtml(prev.id) +
                '">Prev</button>'
              : '<button type="button" class="pm-btn pm-btn-ghost t7-nav-btn" disabled>Prev</button>') +
            '<span class="t7-pos">' +
            (focus
              ? 'Turn ' + (focusIdx + 1) + ' / ' + turns.length
              : 'No turns') +
            '</span>' +
            (next
              ? '<button type="button" class="pm-btn pm-btn-ghost t7-nav-btn" data-focus-turn="' +
                K.escapeHtml(next.id) +
                '">Next</button>'
              : '<button type="button" class="pm-btn pm-btn-ghost t7-nav-btn" disabled>Next</button>') +
            '</div>' +
            '</div>' +
            '<div class="t7-stage">' +
            '<div class="pm-transcript pm-scroll t7-room" data-transcript data-focus-pane>' +
            (room
              ? '<div class="t7-room-inner" data-focus-turn-id="' +
                K.escapeHtml(focus.id) +
                '"' +
                (slideDir ? ' data-slide-dir="' + slideDir + '"' : '') +
                '>' +
                '<div class="t7-room-banner">Focusing turn ' +
                (focusIdx + 1) +
                '</div>' +
                room +
                '</div>'
              : '<div class="t7-empty">No turns yet</div>') +
            '<div data-live-host class="t7-live">' +
            (running ? K.renderActivityLive(ctx.running) : '') +
            '</div>' +
            '</div>' +
            '<nav class="t7-film pm-scroll" aria-label="Turn filmstrip">' +
            '<div class="t7-film-label">All turns · click to focus</div>' +
            '<div class="t7-film-row">' +
            film +
            '</div>' +
            '</nav>' +
            surfaces +
            (K.renderGoalStrip(ctx.thread) || '') +
            K.renderDock(ctx.store, ctx.tid, ctx.q, ID) +
            '</div>' +
            '</div>';
        },
        onAfterPaint: function (ctx) {
          var active = ctx.root.querySelector('.t7-thumb.is-active');
          if (active && typeof active.scrollIntoView === 'function') {
            active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
          }
          /* Clear slide-dir after enter so reverse visits don't inherit stale class */
          var inner = ctx.root.querySelector('.t7-room-inner[data-slide-dir]');
          if (inner) {
            window.setTimeout(function () {
              if (inner.isConnected) inner.removeAttribute('data-slide-dir');
            }, 420);
          }
        }
      }
    )(slotEl, props);
  }

  window.PMChatThreads = window.PMChatThreads || {};
  window.PMChatThreads[ID] = { id: ID, label: LABEL, mount: mount };
})();
