/* t8 — Paired Breath: inhale/exhale pairs; no decorative voids; stacks at min. */
(function () {
  'use strict';

  var ID = 't8';
  var LABEL = 'Paired Breath';

  function msgHtml(msg, ui, opts, K, hitId, side) {
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
      '<article class="pm-msg t8-msg t8-msg-' +
      K.escapeHtml(side) +
      (msg.collapsedByDefault ? ' has-expand' : '') +
      hit +
      '" data-role="' +
      K.escapeHtml(role) +
      '" data-message-id="' +
      K.escapeHtml(msg.id) +
      '">' +
      K.renderThoughts(msg.thoughtSegments, ui.expandedThoughtIds || {}) +
      '<div class="pm-msg-body t8-body' +
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


  /** Inhale/exhale paired work lanes — plan vs output, not a shared dump. */
  function breathWorkHtml(thread, ui, K) {
    if (!thread) return '';
    function body(key, html) {
      if (!html) return '';
      return (
        '<details class="t8-work-leaf pm-work-surface" data-kind="' +
        K.escapeHtml(key) +
        '">' +
        '<summary class="pm-work-surface-head"><span class="pm-work-chev" aria-hidden="true">›</span><span class="pm-work-surface-title">' +
        K.escapeHtml(key) +
        '</span></summary>' +
        '<div class="pm-work-surface-body">' +
        html +
        '</div>' +
        '</details>'
      );
    }
    var inhale =
      body(
        'goal',
        K.renderGoal(thread.goal, {
          goalExpanded:
            ui.goalExpanded != null ? ui.goalExpanded : thread.goal && thread.goal.expanded
        })
      ) + body('todo', K.renderTodo(thread.todos));
    var exhale =
      body(
        'subagent',
        K.renderSubagents(thread.subagentGroups, ui.expandedSubagentIds || {})
      ) +
      body('diff', K.renderDiffs(thread.diffGroups)) +
      body('artifacts', K.renderArtifacts(thread.artifacts));
    if (!inhale && !exhale) return '';
    var compact =
      (K.renderCompactWork && K.renderCompactWork(thread, 'breath')) ||
      (window.PMChatV2 && window.PMChatV2.renderCompactWorkBand
        ? window.PMChatV2.renderCompactWorkBand(thread, 'breath')
        : '');
    return (
      (compact || '') +
      '<section class="t8-work-breath" data-surfaces data-work-detail-stack aria-label="Paired work lanes">' +
      '<div class="t8-work-inhale" data-side="inhale">' +
      '<div class="t8-col-tag">Inhale · Plan work</div>' +
      (inhale || '<div class="t8-work-empty">No plan surfaces</div>') +
      '</div>' +
      '<div class="t8-work-gutter" aria-hidden="true"><span class="t8-gutter-dot"></span></div>' +
      '<div class="t8-work-exhale" data-side="exhale">' +
      '<div class="t8-col-tag">Exhale · Output work</div>' +
      (exhale || '<div class="t8-work-empty">No output surfaces</div>') +
      '</div>' +
      '</section>'
    );
  }

  function mount(slotEl, props) {
    if (!window.PMChatThreadKit) throw new Error('PMChatThreadKit required for t8');
    var K = window.PMChatThreadKit;
    return K.createThreadMount(
      { id: ID, label: LABEL },
      {
        rootClass: 'pm-t8-breath',
        applyWidth: function (root, w) {
          var tier = w <= 560 ? 'min' : w <= 800 ? 'mid' : 'wide';
          root.setAttribute('data-chat-tier', tier);
          root.setAttribute('data-narrow', tier === 'min' ? '1' : '0');
        },
        paint: function (ctx) {
          var running = !!(ctx.running && !ctx.running.stopped);
          var pairs = [];
          var i = 0;
          var msgs = ctx.msgs || [];
          while (i < msgs.length) {
            var user = null;
            var asst = [];
            if (msgs[i].role === 'user') {
              user = msgs[i];
              i += 1;
              while (i < msgs.length && msgs[i].role !== 'user') {
                asst.push(msgs[i]);
                i += 1;
              }
            } else {
              while (i < msgs.length && msgs[i].role !== 'user') {
                asst.push(msgs[i]);
                i += 1;
              }
            }
            pairs.push({
              user: user,
              assistant: asst,
              id: 'pair-' + (user || asst[0]).id
            });
          }

          var breaths = pairs
            .map(function (p, idx) {
              var hasIn = !!p.user;
              var hasOut = !!(p.assistant && p.assistant.length);
              var layout =
                hasIn && hasOut ? 'pair' : hasIn ? 'inhale-only' : 'exhale-only';

              var inhale = '';
              if (hasIn) {
                inhale =
                  '<div class="t8-inhale" data-side="user">' +
                  '<div class="t8-col-tag">Inhale · You</div>' +
                  msgHtml(p.user, ctx.ui, { active: false }, K, ctx.highlightId, 'inhale') +
                  '</div>';
              }

              var exhale = '';
              if (hasOut) {
                exhale =
                  '<div class="t8-exhale" data-side="assistant">' +
                  '<div class="t8-col-tag">Exhale · Reply</div>' +
                  p.assistant
                    .map(function (m) {
                      return msgHtml(
                        m,
                        ctx.ui,
                        { active: running },
                        K,
                        ctx.highlightId,
                        'exhale'
                      );
                    })
                    .join('') +
                  '</div>';
              }

              var gutter =
                hasIn && hasOut
                  ? '<div class="t8-gutter" aria-hidden="true"><span class="t8-gutter-dot"></span></div>'
                  : '';

              return (
                '<section class="t8-breath is-' +
                layout +
                '" data-pair-id="' +
                K.escapeHtml(p.id) +
                '" style="--t8-i:' +
                idx +
                '">' +
                inhale +
                gutter +
                exhale +
                '</section>'
              );
            })
            .join('');

          var surfaces = ctx.q ? '' : breathWorkHtml(ctx.thread, ctx.ui, K);

          var stacked = ctx.contentWidthPx <= 560;

          ctx.root.innerHTML =
            '<div class="t8-frame">' +
            '<div class="t8-paradigm">' +
            '<span class="t8-paradigm-label">' +
            K.escapeHtml(LABEL) +
            '</span>' +
            '<span class="t8-mode">' +
            (stacked ? 'Stacked' : '34 / 66') +
            '</span>' +
            '</div>' +
            '<div class="pm-transcript pm-scroll t8-stream" data-transcript>' +
            breaths +
            '<div data-live-host class="t8-live">' +
            (running ? K.renderActivityLive(ctx.running) : '') +
            '</div>' +
            '</div>' +
            surfaces +
            (K.renderGoalStrip(ctx.thread) || '') +
            K.renderDock(ctx.store, ctx.tid, ctx.q, ID) +
            '</div>';
        }
      }
    )(slotEl, props);
  }

  window.PMChatThreads = window.PMChatThreads || {};
  window.PMChatThreads[ID] = { id: ID, label: LABEL, mount: mount };
})();
