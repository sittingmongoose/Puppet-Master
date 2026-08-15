/* t6 — Margin Index: readable A–Z + time nav; message col ≥ ~280px at 520. */
(function () {
  'use strict';

  var ID = 't6';
  var LABEL = 'Margin Index';
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function markLabel(i) {
    if (i < 26) return LETTERS.charAt(i);
    return LETTERS.charAt(i % 26) + String(Math.floor(i / 26));
  }

  function clock(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch (_) {
      return '—';
    }
  }

  function msgHtml(msg, ui, opts, K, hitId, idx) {
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
      '<article class="pm-msg t6-msg' + (msg.collapsedByDefault ? ' has-expand' : '') +
      hit +
      '" data-role="' +
      K.escapeHtml(role) +
      '" data-message-id="' +
      K.escapeHtml(msg.id) +
      '" id="t6-anchor-' +
      K.escapeHtml(msg.id) +
      '">' +
      '<div class="t6-msg-head">' +
      '<span class="t6-msg-mark">' +
      markLabel(idx) +
      '</span>' +
      '<span class="t6-msg-who">' +
      (role === 'user' ? 'You' : 'Assistant') +
      '</span>' +
      (msg.sentAt
        ? '<span class="t6-msg-time">' + K.escapeHtml(clock(msg.sentAt)) + '</span>'
        : '') +
      '</div>' +
      K.renderThoughts(msg.thoughtSegments, ui.expandedThoughtIds || {}) +
      '<div class="pm-msg-body t6-body' +
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


  /** Margin sidecar work ticks — lettered marks in the index, not a bottom dump. */
  function workSidecarHtml(thread, ui, K) {
    if (!thread) return { ticks: '', detail: '' };
    var kinds = [];
    function push(key, title, body) {
      if (!body) return;
      kinds.push({ key: key, title: title, body: body });
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
    if (!kinds.length) return { ticks: '', detail: '' };
    var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var ticks = kinds
      .map(function (k, i) {
        return (
          '<button type="button" class="t6-work-tick" data-cw-expand="' +
          K.escapeHtml(k.key) +
          '" aria-pressed="false" title="' +
          K.escapeHtml(k.title) +
          '">' +
          '<span class="t6-tick-row">' +
          '<span class="t6-tick-letter">W' +
          LETTERS.charAt(i % 26) +
          '</span>' +
          '<span class="t6-tick-time">work</span>' +
          '</span>' +
          '<span class="t6-tick-role">' +
          K.escapeHtml(k.title) +
          '</span>' +
          '<span class="t6-tick-snip">' +
          K.escapeHtml(k.title) +
          '</span>' +
          '</button>'
        );
      })
      .join('');
    var detail = kinds
      .map(function (k) {
        return (
          '<details class="t6-work-leaf pm-work-surface" data-kind="' +
          K.escapeHtml(k.key) +
          '">' +
          '<summary class="pm-work-surface-head"><span class="pm-work-chev" aria-hidden="true">›</span><span class="pm-work-surface-title">' +
          K.escapeHtml(k.title) +
          '</span></summary>' +
          '<div class="pm-work-surface-body">' +
          k.body +
          '</div>' +
          '</details>'
        );
      })
      .join('');
    var compact =
      (K.renderCompactWork && K.renderCompactWork(thread, 'margin')) ||
      (window.PMChatV2 && window.PMChatV2.renderCompactWorkBand
        ? window.PMChatV2.renderCompactWorkBand(thread, 'margin')
        : '');
    return {
      ticks: '<div class="t6-work-sidecar" data-cw-band aria-label="Work margin">' + ticks + '</div>',
      detail:
        (compact || '') +
        '<div class="t6-surfaces t6-work-detail pm-thread-surfaces" data-surfaces data-work-detail-stack>' +
        detail +
        '</div>'
    };
  }

  function mount(slotEl, props) {
    if (!window.PMChatThreadKit) throw new Error('PMChatThreadKit required for t6');
    var K = window.PMChatThreadKit;
    return K.createThreadMount(
      { id: ID, label: LABEL },
      {
        rootClass: 'pm-t6-margin',
        initLocal: function (local) {
          local.activeJumpId = null;
        },
        onJump: function (jid, local) {
          local.activeJumpId = jid;
        },
        onAfterPaint: function (ctx) {
          var active = ctx.root.querySelector('.t6-tick.is-active');
          var index = ctx.root.querySelector('.t6-index');
          if (index && active) {
            var slider = index.querySelector('.t6-active-slider');
            if (!slider) {
              slider = document.createElement('span');
              slider.className = 't6-active-slider';
              slider.setAttribute('aria-hidden', 'true');
              index.appendChild(slider);
            }
            slider.style.top = active.offsetTop + 'px';
            slider.style.height = Math.max(12, active.offsetHeight) + 'px';
          }
          if (ctx.root.getAttribute('data-t6-jump-wired') === '1') return;
          ctx.root.setAttribute('data-t6-jump-wired', '1');
          ctx.root.addEventListener('click', function (ev) {
            var tick = ev.target && ev.target.closest && ev.target.closest('.t6-tick');
            if (!tick || !ctx.root.contains(tick)) return;
            var ticks = ctx.root.querySelectorAll('.t6-tick');
            for (var i = 0; i < ticks.length; i++) ticks[i].classList.remove('is-active');
            tick.classList.add('is-active', 'is-flash');
            setTimeout(function () {
              tick.classList.remove('is-flash');
            }, 420);
            var idx = ctx.root.querySelector('.t6-index');
            if (idx) {
              var s = idx.querySelector('.t6-active-slider');
              if (!s) {
                s = document.createElement('span');
                s.className = 't6-active-slider';
                s.setAttribute('aria-hidden', 'true');
                idx.appendChild(s);
              }
              s.style.top = tick.offsetTop + 'px';
              s.style.height = Math.max(12, tick.offsetHeight) + 'px';
            }
          });
        },
        applyWidth: function (root, w) {
          /*
            Index width is capped so the message column stays readable at 520:
            520 − 120 = 400px message column (≥ ~280 floor).
            Never a 28–34px wrap gutter.
          */
          var indexW = w <= 560 ? 120 : w <= 800 ? 136 : 148;
          root.setAttribute('data-chat-tier', w <= 560 ? 'min' : w <= 800 ? 'mid' : 'wide');
          root.style.setProperty('--t6-index-w', indexW + 'px');
        },
        paint: function (ctx) {
          var running = !!(ctx.running && !ctx.running.stopped);

          var index = ctx.msgs
            .map(function (m, i) {
              var snip = String(m.body || '').replace(/\s+/g, ' ').slice(0, 36);
              var role = m.role === 'user' ? 'You' : 'Grok';
              return (
                '<button type="button" class="t6-tick' +
                (ctx.local.activeJumpId === m.id ? ' is-active' : '') +
                (ctx.highlightId === m.id ? ' is-search-hit' : '') +
                '" data-jump-message="' +
                K.escapeHtml(m.id) +
                '" title="' +
                K.escapeHtml(snip) +
                '" aria-label="Jump to message ' +
                markLabel(i) +
                ', ' +
                clock(m.sentAt) +
                '">' +
                '<span class="t6-tick-row">' +
                '<span class="t6-tick-letter">' +
                markLabel(i) +
                '</span>' +
                '<span class="t6-tick-time">' +
                K.escapeHtml(clock(m.sentAt)) +
                '</span>' +
                '</span>' +
                '<span class="t6-tick-role">' +
                role +
                '</span>' +
                '<span class="t6-tick-snip">' +
                K.escapeHtml(snip || '…') +
                '</span>' +
                '</button>'
              );
            })
            .join('');

          var msgOut = ctx.msgs
            .map(function (m, i) {
              return msgHtml(m, ctx.ui, { active: running }, K, ctx.highlightId, i);
            })
            .join('');

          var workSide = ctx.q ? { ticks: '', detail: '' } : workSidecarHtml(ctx.thread, ctx.ui, K);
          var surfaces = workSide.detail || '';

          ctx.root.innerHTML =
            '<div class="t6-frame">' +
            '<div class="t6-paradigm">' +
            '<span class="t6-paradigm-label">' +
            K.escapeHtml(LABEL) +
            '</span>' +
            '<span class="t6-count">' +
            ctx.msgs.length +
            ' indexed</span>' +
            '</div>' +
            '<div class="t6-shell">' +
            '<nav class="t6-index pm-scroll" aria-label="Message index">' +
            '<div class="t6-index-head">' +
            '<span>Letter</span><span>Time</span>' +
            '</div>' +
            index +
            (workSide.ticks || '') +
            '</nav>' +
            '<div class="t6-main">' +
            '<div class="pm-transcript pm-scroll t6-stream" data-transcript>' +
            msgOut +
            '<div data-live-host class="t6-live">' +
            (running ? K.renderActivityLive(ctx.running) : '') +
            '</div>' +
            '</div>' +
            surfaces +
            (K.renderGoalStrip(ctx.thread) || '') +
            K.renderDock(ctx.store, ctx.tid, ctx.q, ID) +
            '</div>' +
            '</div>' +
            '</div>';
        }
      }
    )(slotEl, props);
  }

  window.PMChatThreads = window.PMChatThreads || {};
  window.PMChatThreads[ID] = { id: ID, label: LABEL, mount: mount };
})();
