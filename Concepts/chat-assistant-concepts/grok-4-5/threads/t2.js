/* t2 — Turn Beats: numbered beat spine.
   Activity, thoughts, and thread work surfaces attach TO beats — not a bottom dump. */
(function () {
  'use strict';

  var ID = 't2';
  var LABEL = 'Turn Beats';

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
    /* Thoughts + activity stay on the message inside the beat (attached, not external) */
    return (
      '<article class="pm-msg t2-line' + (msg.collapsedByDefault ? ' has-expand' : '') +
      hit +
      '" data-role="' +
      K.escapeHtml(role) +
      '" data-message-id="' +
      K.escapeHtml(msg.id) +
      '">' +
      '<div class="t2-line-role">' +
      (role === 'user' ? 'You' : 'Grok') +
      '</div>' +
      K.renderThoughts(msg.thoughtSegments, ui.expandedThoughtIds || {}) +
      '<div class="pm-msg-body t2-body' +
      (collapsed ? ' is-collapsed' : '') +
      '">' +
      K.renderBodyHtml(body) +
      '</div>' +
      expand +
      (msg.activityGroup && msg.activityGroup.status !== 'running'
        ? '<div class="t2-beat-activity">' +
          K.renderActivityHistory(msg.activityGroup) +
          '</div>'
        : '') +
      K.renderHoverRow(msg, { active: !!opts.active }) +
      '</article>'
    );
  }

  /** Beat-attached work: numbered index chips + per-kind beat panels (not a flat helper dump). */
  function beatSurfacesHtml(thread, ui, K) {
    if (!thread) return '';
    var panels = [];
    var n = 0;
    function pushBeatPanel(key, title, bodyHtml) {
      if (!bodyHtml) return;
      n += 1;
      panels.push(
        '<details class="t2-beat-work pm-work-surface" data-kind="' +
          K.escapeHtml(key) +
          '" data-beat-work="' +
          K.escapeHtml(key) +
          '">' +
          '<summary class="t2-beat-work-sum">' +
          '<span class="t2-beat-work-tick" aria-hidden="true">' +
          String(n) +
          '</span>' +
          '<span class="t2-beat-work-title">' +
          K.escapeHtml(title) +
          '</span>' +
          '<span class="pm-work-chev" aria-hidden="true">›</span>' +
          '</summary>' +
          '<div class="t2-beat-work-body pm-work-surface-body">' +
          bodyHtml +
          '</div>' +
          '</details>'
      );
    }
    pushBeatPanel(
      'goal',
      'Goal',
      K.renderGoal(thread.goal, {
        goalExpanded:
          ui.goalExpanded != null ? ui.goalExpanded : thread.goal && thread.goal.expanded
      })
    );
    pushBeatPanel('todo', 'Todo', K.renderTodo(thread.todos));
    pushBeatPanel(
      'subagent',
      'Agents',
      K.renderSubagents(thread.subagentGroups, ui.expandedSubagentIds || {})
    );
    pushBeatPanel('diff', 'Diffs', K.renderDiffs(thread.diffGroups));
    pushBeatPanel('artifacts', 'Artifacts', K.renderArtifacts(thread.artifacts));
    if (!panels.length) {
      var compactOnly =
        (K.renderCompactWork && K.renderCompactWork(thread, 'beats')) ||
        (window.PMChatV2 && window.PMChatV2.renderCompactWorkBand
          ? window.PMChatV2.renderCompactWorkBand(thread, 'beats')
          : '');
      return compactOnly || '';
    }
    var compact =
      (K.renderCompactWork && K.renderCompactWork(thread, 'beats')) ||
      (window.PMChatV2 && window.PMChatV2.renderCompactWorkBand
        ? window.PMChatV2.renderCompactWorkBand(thread, 'beats')
        : '');
    return (
      (compact || '') +
      '<div class="t2-beat-surfaces" data-surfaces data-work-detail-stack>' +
      '<div class="t2-beat-surfaces-label">Beat-attached index</div>' +
      '<div class="t2-beat-work-stack">' +
      panels.join('') +
      '</div>' +
      '</div>'
    );
  }

  function mount(slotEl, props) {
    if (!window.PMChatThreadKit) throw new Error('PMChatThreadKit required for t2');
    var K = window.PMChatThreadKit;
    return K.createThreadMount(
      { id: ID, label: LABEL },
      {
        rootClass: 'pm-t2-beats',
        applyWidth: function (root, w) {
          root.setAttribute('data-chat-tier', w <= 560 ? 'min' : w <= 800 ? 'mid' : 'wide');
        },
        paint: function (ctx) {
          var running = !!(ctx.running && !ctx.running.stopped);
          var turns = K.groupTurns(ctx.msgs);
          var lastIdx = turns.length - 1;
          var attachedSurfaces = beatSurfacesHtml(ctx.thread, ctx.ui, K);

          var beats = turns
            .map(function (turn, i) {
              var parts = [];
              if (turn.user) {
                parts.push(msgHtml(turn.user, ctx.ui, { active: false }, K, ctx.highlightId));
              }
              turn.assistant.forEach(function (m) {
                parts.push(msgHtml(m, ctx.ui, { active: running }, K, ctx.highlightId));
              });
              var who =
                turn.user && turn.assistant.length
                  ? 'You → Grok'
                  : turn.user
                    ? 'You'
                    : 'Grok';
              /* Thread surfaces hitch to the final beat only */
              var surfaceAttach = i === lastIdx ? attachedSurfaces : '';
              return (
                '<section class="t2-beat" data-turn-id="' +
                K.escapeHtml(turn.id) +
                '" style="--t2-i:' +
                i +
                '">' +
                '<div class="t2-spine" aria-hidden="true">' +
                '<span class="t2-tick">' +
                (i + 1) +
                '</span>' +
                '<span class="t2-spine-seg"></span>' +
                '</div>' +
                '<div class="t2-beat-panel">' +
                '<header class="t2-beat-head">' +
                '<span class="t2-beat-label">Beat ' +
                (i + 1) +
                '</span>' +
                '<span class="t2-beat-who">' +
                who +
                '</span>' +
                '</header>' +
                '<div class="t2-beat-lines">' +
                parts.join('') +
                '</div>' +
                surfaceAttach +
                '</div>' +
                '</section>'
              );
            })
            .join('');

          /* Orphan surfaces when no turns yet */
          var orphan =
            !turns.length && attachedSurfaces
              ? '<div class="t2-orphan">' + attachedSurfaces + '</div>'
              : '';

          ctx.root.innerHTML =
            '<header class="t2-chrome" aria-label="' +
            K.escapeHtml(LABEL) +
            '">' +
            '<span class="t2-chrome-paradigm">' +
            K.escapeHtml(LABEL) +
            '</span>' +
            '<span class="t2-chrome-count">' +
            turns.length +
            ' beat' +
            (turns.length === 1 ? '' : 's') +
            '</span>' +
            '</header>' +
            '<div class="pm-transcript pm-scroll t2-transcript" data-transcript>' +
            '<div class="t2-rail-line" aria-hidden="true"></div>' +
            beats +
            orphan +
            '<div class="t2-live" data-live-host>' +
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
