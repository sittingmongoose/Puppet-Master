/* t5 — Live Condenser: tool/activity SPINE owns rhythm; prose is secondary. */
(function () {
  'use strict';

  var ID = 't5';
  var LABEL = 'Live Condenser';

  function shortTime(iso, K) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch (_) {
      return '';
    }
  }

  function collectSpine(msgs, running, K) {
    var nodes = [];
    (msgs || []).forEach(function (m) {
      var g = m.activityGroup;
      if (!g) return;
      var stages = Array.isArray(g.stages) && g.stages.length ? g.stages : null;
      if (stages) {
        stages.forEach(function (st, si) {
          nodes.push({
            key: (g.id || m.id) + '-s' + si,
            jumpId: m.id,
            label: st.label || st.name || 'Step',
            status: st.status || g.status || 'complete',
            dur:
              st.durationSeconds != null
                ? K.formatDuration(st.durationSeconds)
                : st.workedSeconds != null
                  ? K.formatDuration(st.workedSeconds)
                  : '',
            kind: st.kind || 'step',
            live: false
          });
        });
      } else {
        nodes.push({
          key: g.id || m.id,
          jumpId: m.id,
          label: g.compactLabel || g.label || 'Activity',
          status: g.status || 'complete',
          dur: g.workedSeconds != null ? K.formatDuration(g.workedSeconds) : '',
          kind: 'activity',
          live: false
        });
      }
    });
    if (running && !running.stopped) {
      nodes.push({
        key: 'live',
        jumpId: null,
        label:
          running.workingSummary ||
          running.summary ||
          running.label ||
          'Working',
        status: 'running',
        dur:
          running.workedSeconds != null
            ? K.formatDuration(running.workedSeconds)
            : '',
        kind: 'live',
        live: true
      });
    }
    return nodes;
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
    /* Activity lives on the spine — omit per-message activity cards */
    return (
      '<article class="pm-msg t5-msg' + (msg.collapsedByDefault ? ' has-expand' : '') +
      hit +
      '" data-role="' +
      K.escapeHtml(role) +
      '" data-message-id="' +
      K.escapeHtml(msg.id) +
      '">' +
      '<div class="t5-msg-meta">' +
      '<span class="t5-msg-who">' +
      (role === 'user' ? 'You' : 'Reply') +
      '</span>' +
      (msg.sentAt
        ? '<span class="t5-msg-time">' +
          K.escapeHtml(shortTime(msg.sentAt, K)) +
          '</span>'
        : '') +
      '</div>' +
      K.renderThoughts(msg.thoughtSegments, ui.expandedThoughtIds || {}) +
      '<div class="pm-msg-body t5-body' +
      (collapsed ? ' is-collapsed' : '') +
      '">' +
      K.renderBodyHtml(body) +
      '</div>' +
      expand +
      K.renderHoverRow(msg, { active: !!opts.active }) +
      '</article>'
    );
  }

  function spineHtml(nodes, K) {
    if (!nodes.length) {
      return (
        '<aside class="t5-spine is-empty" data-live-host aria-label="Activity spine">' +
        '<div class="t5-spine-head">Activity</div>' +
        '<p class="t5-spine-empty">No tool activity yet</p>' +
        '</aside>'
      );
    }
    var list = nodes
      .map(function (n, i) {
        var tag = n.jumpId ? 'button' : 'div';
        var jump =
          n.jumpId
            ? ' data-jump-message="' + K.escapeHtml(n.jumpId) + '"'
            : '';
        return (
          '<' +
          tag +
          (n.jumpId ? ' type="button"' : '') +
          ' class="t5-node' +
          (n.live ? ' is-live' : '') +
          (n.status === 'running' ? ' is-running' : '') +
          (n.status === 'complete' || n.status === 'completed' ? ' is-done' : '') +
          '" style="--t5-i:' +
          i +
          '"' +
          jump +
          '>' +
          '<span class="t5-node-dot" aria-hidden="true"></span>' +
          '<span class="t5-node-body">' +
          '<span class="t5-node-label">' +
          K.escapeHtml(n.label) +
          '</span>' +
          (n.dur
            ? '<span class="t5-node-dur">' + K.escapeHtml(n.dur) + '</span>'
            : '') +
          '</span>' +
          '</' +
          tag +
          '>'
        );
      })
      .join('');
    var live = nodes.some(function (n) {
      return n.live;
    });
    return (
      '<aside class="t5-spine' +
      (live ? ' is-live' : '') +
      '" data-live-host aria-label="Activity spine">' +
      '<div class="t5-spine-head">' +
      '<span class="t5-spine-kicker">Spine</span>' +
      '<span class="t5-spine-count">' +
      nodes.length +
      ' step' +
      (nodes.length === 1 ? '' : 's') +
      '</span>' +
      '</div>' +
      '<div class="t5-spine-track" aria-hidden="true"></div>' +
      '<div class="t5-spine-list">' +
      list +
      '</div>' +
      '</aside>'
    );
  }

  function mount(slotEl, props) {
    if (!window.PMChatThreadKit) throw new Error('PMChatThreadKit required for t5');
    var K = window.PMChatThreadKit;
    return K.createThreadMount(
      { id: ID, label: LABEL },
      {
        rootClass: 'pm-t5-condenser',
        applyWidth: function (root, w) {
          root.setAttribute('data-chat-tier', w <= 560 ? 'min' : w <= 800 ? 'mid' : 'wide');
        },
        onAfterPaint: function (ctx) {
          if (ctx.root.getAttribute('data-t5-handoff') === '1') return;
          ctx.root.setAttribute('data-t5-handoff', '1');
          function handoff(target) {
            if (!target || !ctx.root.contains(target)) return;
            if (target.closest && target.closest('.t5-spine')) {
              ctx.root.classList.add('is-handoff-spine');
              ctx.root.classList.remove('is-handoff-prose');
            } else if (target.closest && target.closest('.t5-main')) {
              ctx.root.classList.add('is-handoff-prose');
              ctx.root.classList.remove('is-handoff-spine');
            }
          }
          ctx.root.addEventListener('pointerdown', function (ev) {
            handoff(ev.target);
          });
          ctx.root.addEventListener('focusin', function (ev) {
            handoff(ev.target);
          });
        },
        paint: function (ctx) {
          var running = !!(ctx.running && !ctx.running.stopped);
          var nodes = collectSpine(ctx.msgs, ctx.running, K);
          var stream = ctx.msgs
            .map(function (m) {
              return msgHtml(m, ctx.ui, { active: running }, K, ctx.highlightId);
            })
            .join('');

          var surfaces = ctx.q
            ? ''
            : '<div class="t5-surfaces pm-thread-surfaces" data-surfaces>' +
              K.renderWorkSurfaces(ctx.thread, ctx.ui) +
              '</div>';

          ctx.root.innerHTML =
            '<div class="t5-frame">' +
            '<div class="t5-paradigm">' +
            '<span class="t5-paradigm-label">' +
            K.escapeHtml(LABEL) +
            '</span>' +
            '<span class="t5-paradigm-hint">' +
            (running ? 'Live spine' : 'Condensed activity') +
            '</span>' +
            '</div>' +
            '<div class="t5-layout">' +
            spineHtml(nodes, K) +
            '<div class="t5-main">' +
            '<div class="pm-transcript pm-scroll t5-stream" data-transcript>' +
            '<div class="t5-stream-kicker">Prose</div>' +
            stream +
            '</div>' +
            surfaces +
            (K.renderGoalStrip(ctx.thread) || '') +
            K.renderDock(ctx.store, ctx.tid, ctx.q, ID) +
            '</div>' +
            '</div>' +
            '</div>';
        },
        onFocusedUpdate: function (ctx) {
          var host = ctx.root.querySelector('[data-live-host]');
          if (!host) return;
          var nodes = collectSpine(ctx.msgs, ctx.running, K);
          var tmp = document.createElement('div');
          tmp.innerHTML = spineHtml(nodes, K);
          if (tmp.firstChild) host.replaceWith(tmp.firstChild);
        }
      }
    )(slotEl, props);
  }

  window.PMChatThreads = window.PMChatThreads || {};
  window.PMChatThreads[ID] = { id: ID, label: LABEL, mount: mount };
})();
