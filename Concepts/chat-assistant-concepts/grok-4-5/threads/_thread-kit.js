/* Shared helpers for all thread modules (Grok 4.5). */
(function () {
  'use strict';

  var MODEL =
    (window.PMChatLabels && window.PMChatLabels.MODEL) || 'Grok 4.5';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Minimal markdown for message bodies — escaped plain text + fences/bold/code/lists. */
  function renderInlineMd(escaped) {
    var s = String(escaped == null ? '' : escaped);
    var out = '';
    var i = 0;
    while (i < s.length) {
      if (s.charAt(i) === '`') {
        var end = s.indexOf('`', i + 1);
        if (end > i) {
          out +=
            '<code class="pm-md-code">' + s.slice(i + 1, end) + '</code>';
          i = end + 1;
          continue;
        }
      }
      if (s.charAt(i) === '*' && s.charAt(i + 1) === '*') {
        var bend = s.indexOf('**', i + 2);
        if (bend > i) {
          out += '<strong>' + s.slice(i + 2, bend) + '</strong>';
          i = bend + 2;
          continue;
        }
      }
      out += s.charAt(i);
      i += 1;
    }
    return out;
  }

  function renderMdBlocks(text) {
    var chunks = String(text == null ? '' : text).split(/\n{2,}/);
    return chunks
      .map(function (para) {
        var trimmed = para.replace(/^\n+|\n+$/g, '');
        if (!trimmed) return '';
        var lines = trimmed.split('\n');
        var listLines = [];
        var isList = true;
        for (var i = 0; i < lines.length; i++) {
          var ln = lines[i];
          if (!ln.trim()) continue;
          var m = ln.match(/^[-*]\s+(.*)$/);
          if (!m) {
            isList = false;
            break;
          }
          listLines.push(m[1]);
        }
        if (isList && listLines.length) {
          return (
            '<ul class="pm-md-ul">' +
            listLines
              .map(function (item) {
                return (
                  '<li>' + renderInlineMd(escapeHtml(item)) + '</li>'
                );
              })
              .join('') +
            '</ul>'
          );
        }
        return (
          '<p class="pm-md-p">' +
          renderInlineMd(escapeHtml(trimmed).replace(/\n/g, '<br>')) +
          '</p>'
        );
      })
      .join('');
  }

  function renderBodyHtml(text) {
    var s = String(text == null ? '' : text);
    if (!s) return '<div class="pm-md"></div>';
    var out = [];
    var fenceRe = /```([^\n`]*)\n?([\s\S]*?)```/g;
    var last = 0;
    var m;
    while ((m = fenceRe.exec(s))) {
      if (m.index > last) out.push(renderMdBlocks(s.slice(last, m.index)));
      var code = m[2].replace(/\n$/, '');
      out.push(
        '<pre class="pm-md-pre"><code class="pm-md-code">' +
          escapeHtml(code) +
          '</code></pre>'
      );
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push(renderMdBlocks(s.slice(last)));
    return '<div class="pm-md">' + out.join('') + '</div>';
  }

  function captureScrollAnchor(root) {
    var transcript =
      root.querySelector('[data-transcript]') ||
      root.querySelector('[data-focus-pane]');
    if (!transcript) return null;
    var scrollTop = transcript.scrollTop;
    var nearBottom =
      transcript.scrollHeight - scrollTop - transcript.clientHeight < 48;
    var messageId = null;
    var offsetPx = 0;
    var top = transcript.getBoundingClientRect().top;
    var msgs = transcript.querySelectorAll('[data-message-id]');
    for (var i = 0; i < msgs.length; i++) {
      var r = msgs[i].getBoundingClientRect();
      if (r.bottom > top + 4) {
        messageId = msgs[i].getAttribute('data-message-id');
        offsetPx = r.top - top;
        break;
      }
    }
    return {
      scrollTop: scrollTop,
      messageId: messageId,
      offsetPx: offsetPx,
      stickToBottom: nearBottom
    };
  }

  function restoreScrollAnchorState(root, anchor) {
    if (!anchor) return;
    var transcript =
      root.querySelector('[data-transcript]') ||
      root.querySelector('[data-focus-pane]');
    if (!transcript) return;
    if (anchor.stickToBottom) {
      /* Prefer last message / live activity — not trailing folio/surfaces inside the stream. */
      var live = transcript.querySelector('[data-activity-live]');
      var msgs = transcript.querySelectorAll('[data-message-id]');
      var lastMsg = msgs.length ? msgs[msgs.length - 1] : null;
      var pin = live || lastMsg;
      if (pin) {
        var trRect = transcript.getBoundingClientRect();
        var pinRect = pin.getBoundingClientRect();
        transcript.scrollTop += pinRect.bottom - trRect.bottom + 12;
        var max = Math.max(0, transcript.scrollHeight - transcript.clientHeight);
        if (transcript.scrollTop > max) transcript.scrollTop = max;
        if (transcript.scrollTop < 0) transcript.scrollTop = 0;
      } else {
        transcript.scrollTop = transcript.scrollHeight;
      }
      return;
    }
    if (anchor.messageId) {
      var el = transcript.querySelector(
        '[data-message-id="' +
          String(anchor.messageId).replace(/\\/g, '\\\\').replace(/"/g, '\\"') +
          '"]'
      );
      if (el) {
        var top = transcript.getBoundingClientRect().top;
        var now = el.getBoundingClientRect().top;
        transcript.scrollTop += now - (top + (anchor.offsetPx || 0));
        return;
      }
    }
    if (anchor.scrollTop != null) transcript.scrollTop = anchor.scrollTop;
  }

  /** Whether paint/mount should pin transcript to bottom after layout. */
  function shouldStickTranscriptToBottom(ctx, preAnchor) {
    if (ctx && ctx.q) return true;
    if (preAnchor && preAnchor.stickToBottom) return true;
    var ui = ctx && ctx.ui;
    if (!ui) return true;
    if (ui.scrollAnchor && typeof ui.scrollAnchor.stickToBottom === 'boolean') {
      return !!ui.scrollAnchor.stickToBottom;
    }
    /* First paint / no DOM anchor yet: honor default stickToBottom. */
    if (!preAnchor) return ui.stickToBottom !== false;
    return false;
  }

  /** After paint: scroll to bottom once layout (Q dock / flex) has settled. */
  function scrollTranscriptToBottomAfterPaint(root, thenFn) {
    if (!root) return;
    function pin() {
      restoreScrollAnchorState(root, { stickToBottom: true });
    }
    requestAnimationFrame(function () {
      pin();
      requestAnimationFrame(function () {
        pin();
        if (typeof thenFn === 'function') thenFn();
      });
    });
  }

  /** Save transcript scroll position (or near-top message), run fn, restore after paint. */
  function withAnchor(root, fn) {
    var anchor = captureScrollAnchor(root);
    var result = typeof fn === 'function' ? fn() : undefined;
    restoreScrollAnchorState(root, anchor);
    return result;
  }

  function formatDuration(seconds) {
    var n = Number(seconds);
    if (!isFinite(n) || n < 0) return '';
    n = Math.round(n);
    if (n < 60) return n + 's';
    var m = Math.floor(n / 60);
    var s = n % 60;
    if (m < 60) return s ? m + 'm ' + s + 's' : m + 'm';
    var h = Math.floor(m / 60);
    m = m % 60;
    return m ? h + 'h ' + m + 'm' : h + 'h';
  }

  function formatLocalTime(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (_) {
      return String(iso);
    }
  }

  function formatStatus(s) {
    if (window.PMChatStore && typeof window.PMChatStore.formatStatus === 'function') {
      return window.PMChatStore.formatStatus(s);
    }
    if (s == null || s === '') return '';
    return String(s)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function icon(name, cls) {
    if (typeof window.PMIcon === 'function') return window.PMIcon(name, cls || '') || '';
    return '';
  }

  function isExpanded(ui, messageId) {
    return !!(ui && ui.expandedMessageIds && ui.expandedMessageIds[messageId]);
  }

  function durationLabel(runtime, opts) {
    opts = opts || {};
    if (!runtime) return '';
    var secs = runtime.workedSeconds;
    if (secs == null) return '';
    var dur = formatDuration(secs);
    if (!dur) return '';
    if (opts.active) return 'Working for ' + dur;
    return 'Worked for ' + dur;
  }

  function renderMoreInfoPanel(msg) {
    var rt = msg && msg.runtime;
    var rows = [];
    function push(label, value) {
      if (value == null || value === '') return;
      rows.push(
        '<div class="pm-more-info-row"><span class="pm-more-info-label">' +
          escapeHtml(label) +
          '</span><span class="pm-more-info-value">' +
          escapeHtml(String(value)) +
          '</span></div>'
      );
    }
    push('Timestamp', formatLocalTime(msg.sentAt));
    if (rt) {
      push('Execution start', formatLocalTime(rt.startedAt || rt.executionStart || rt.startAt));
      push(
        'Completion',
        formatLocalTime(rt.completedAt || rt.stoppedAt || rt.failedAt || rt.cancelledAt)
      );
      if (rt.workedSeconds != null) push('Worked for', formatDuration(rt.workedSeconds));
      if (
        rt.totalElapsedSeconds != null &&
        rt.totalElapsedSeconds !== rt.workedSeconds
      ) {
        push('Total elapsed', formatDuration(rt.totalElapsedSeconds));
      }
      push('Mode', rt.mode);
      push('Provider', rt.provider);
      push('Model', rt.model);
      push('Effort', rt.effort);
      push('Persona', rt.persona);
      if (rt.tokenCount != null) push('Tokens', String(rt.tokenCount));
      if (rt.contextUsed != null || rt.contextLimit != null) {
        push(
          'Context use',
          (rt.contextUsed != null ? rt.contextUsed : '?') +
            (rt.contextLimit != null ? ' / ' + rt.contextLimit : '')
        );
      }
      if (rt.estimatedCost != null) push('Estimated cost', '$' + Number(rt.estimatedCost).toFixed(4));
      if (rt.planUsage) push('Plan usage', rt.planUsage);
      push('Turn', rt.turnId || rt.runId || msg.id);
    }
    if (!rows.length) {
      rows.push('<div class="pm-more-info-empty">No runtime details</div>');
    }
    return (
      '<div class="pm-more-info" hidden data-more-info="' +
      escapeHtml(msg.id) +
      '">' +
      rows.join('') +
      '</div>'
    );
  }

  function renderHoverRow(msg, opts) {
    opts = opts || {};
    var rt = msg && msg.runtime;
    var active = !!opts.active;
    var actions = [];
    actions.push(
      '<button type="button" class="pm-btn pm-btn-ghost pm-msg-action pm-msg-action-ico" data-msg-action="copy" data-message-id="' +
        escapeHtml(msg.id) +
        '" title="Copy" aria-label="Copy">' +
        icon('copy', 'pm-btn-icon') +
        '</button>'
    );
    if (msg.eligibleForEdit) {
      actions.push(
        '<button type="button" class="pm-btn pm-btn-ghost pm-msg-action pm-msg-action-ico" data-msg-action="edit" data-message-id="' +
          escapeHtml(msg.id) +
          '" title="Edit" aria-label="Edit">' +
          icon('pencil', 'pm-btn-icon') +
          '</button>'
      );
    }
    var meta = [];
    if (rt && rt.provider) {
      meta.push('<span class="pm-msg-meta-provider">' + escapeHtml(rt.provider) + '</span>');
    }
    if (rt && rt.model) {
      meta.push('<span class="pm-msg-meta-model">' + escapeHtml(rt.model) + '</span>');
    }
    var dur = durationLabel(rt, { active: active });
    if (dur) meta.push('<span class="pm-msg-meta-duration">' + escapeHtml(dur) + '</span>');
    meta.push(
      '<button type="button" class="pm-btn pm-btn-ghost pm-msg-action pm-msg-action-ico" data-msg-action="more-info" data-message-id="' +
        escapeHtml(msg.id) +
        '" title="More info" aria-label="More info">' +
        icon('info', 'pm-btn-icon') +
        '</button>'
    );
    return (
      '<div class="pm-msg-hover">' +
      '<div class="pm-msg-hover-actions">' +
      actions.join('') +
      '</div>' +
      '<div class="pm-msg-hover-meta">' +
      meta.join('') +
      '</div>' +
      '</div>' +
      renderMoreInfoPanel(msg)
    );
  }

  function renderThoughts(segments, expandedMap) {
    var list = Array.isArray(segments) ? segments : [];
    if (!list.length) return '';
    expandedMap = expandedMap || {};
    return (
      '<div class="pm-thoughts">' +
      list
        .map(function (seg) {
          var open =
            expandedMap[seg.id] != null
              ? !!expandedMap[seg.id]
              : seg.collapsed === false || seg.status === 'active';
          return (
            '<details class="pm-work-surface pm-thought" data-kind="thought" data-thought-id="' +
            escapeHtml(seg.id) +
            '"' +
            (open ? ' open' : '') +
            '>' +
            '<summary class="pm-work-surface-head pm-thought-summary">' +
            '<span class="pm-work-chev" aria-hidden="true">›</span>' +
            '<span class="pm-work-surface-title">' +
            escapeHtml(seg.label || 'Thought') +
            '</span>' +
            (seg.status
              ? '<span class="pm-work-surface-meta">' +
                escapeHtml(formatStatus(seg.status)) +
                '</span>'
              : '') +
            '</summary>' +
            '<div class="pm-work-surface-body pm-thought-body">' +
            escapeHtml(seg.summary || '') +
            '</div>' +
            '</details>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function renderMessage(msg, ui, opts) {
    if (!msg) return '';
    opts = opts || {};
    ui = ui || {};
    var expanded = isExpanded(ui, msg.id);
    var collapsed = !!(msg.collapsedByDefault && !expanded);
    var role = msg.role || 'assistant';
    var body = msg.body != null ? String(msg.body) : '';
    var lens = opts.lens || null;
    var selecting = isLensSelecting(lens);
    var shape = lensShapeOf(lens, msg.id);
    var lensClass = applyLensMessageClasses(msg, lens, selecting);
    var hit = opts.highlightId === msg.id ? ' is-search-hit' : '';
    var expandBtn = msg.collapsedByDefault
      ? '<button type="button" class="pm-msg-expand" data-msg-action="expand" data-message-id="' +
        escapeHtml(msg.id) +
        '" aria-label="' +
        (collapsed ? 'Show more' : 'Show less') +
        '">' +
        icon(collapsed ? 'chevD' : 'arrowUp', 'pm-btn-icon') +
        '<span>' +
        (collapsed ? 'Show more' : 'Show less') +
        '</span></button>'
      : '';
    var thoughts = renderThoughts(
      msg.thoughtSegments,
      (ui && ui.expandedThoughtIds) || {}
    );
    var activity =
      msg.activityGroup && msg.activityGroup.status !== 'running'
        ? renderActivityHistory(msg.activityGroup)
        : '';
    var lensChrome =
      (selecting
        ? '<div class="pm-lens-select-host" data-lens-select-host>' +
          renderLensSelectToggle(
            msg.id,
            !!(lens && Array.isArray(lens.selectionIds) && lens.selectionIds.indexOf(msg.id) >= 0)
          ) +
          '</div>'
        : '') +
      (shape
        ? '<div class="pm-lens-chip-host" data-lens-chip-host>' +
          renderLensChip(shape, msg.id) +
          '</div>'
        : '');
    return (
      '<article class="pm-msg' +
      (msg.collapsedByDefault ? ' has-expand' : '') +
      lensClass +
      hit +
      '" data-role="' +
      escapeHtml(role) +
      '" data-message-id="' +
      escapeHtml(msg.id) +
      '">' +
      lensChrome +
      thoughts +
      '<div class="pm-msg-body' +
      (collapsed ? ' is-collapsed' : '') +
      '">' +
      renderBodyHtml(body) +
      '</div>' +
      expandBtn +
      activity +
      renderHoverRow(msg, { active: !!opts.active }) +
      '</article>'
    );
  }

  function renderActivityLive(running) {
    if (!running || running.stopped) return '';
    var summary =
      running.workingSummary || running.summary || running.label || 'Working';
    var started =
      running.startedAt != null
        ? Number(running.startedAt)
        : running.startedMs != null
          ? Number(running.startedMs)
          : Date.now() - (Number(running.workedSeconds) || 0) * 1000;
    var secs = Math.max(0, Math.floor((Date.now() - started) / 1000));
    if (running.workedSeconds != null && !running.startedAt && !running.startedMs) {
      secs = Number(running.workedSeconds) || 0;
    }
    return (
      '<div class="pm-activity-live" data-activity-live data-activity-started="' +
      escapeHtml(String(started)) +
      '">' +
      '<span class="pm-activity-live-line pm-activity-live-title">' +
      escapeHtml(summary) +
      ' · Grok 4.5 · <span class="pm-activity-live-timer" data-activity-timer>' +
      escapeHtml(formatDuration(secs) || '0s') +
      '</span></span>' +
      '</div>'
    );
  }

  function renderActivityHistory(activityGroup) {
    if (!activityGroup) return '';
    var label =
      activityGroup.compactLabel ||
      activityGroup.label ||
      formatStatus(activityGroup.status) ||
      'Activity';
    var stages = Array.isArray(activityGroup.stages) ? activityGroup.stages : [];
    var body =
      stages.length > 0
        ? '<ul class="pm-activity-stages">' +
          stages
            .map(function (st) {
              return (
                '<li>' +
                escapeHtml(st.label || st.name || formatStatus(st.status) || 'Stage') +
                (st.workedSeconds != null
                  ? ' · ' + escapeHtml(formatDuration(st.workedSeconds))
                  : '') +
                '</li>'
              );
            })
            .join('') +
          '</ul>'
        : '';
    return (
      '<details class="pm-work-surface" data-kind="activity" data-activity-id="' +
      escapeHtml(activityGroup.id || '') +
      '">' +
      '<summary class="pm-work-surface-head"><span class="pm-work-chev" aria-hidden="true">›</span><span class="pm-work-surface-title">' +
      escapeHtml(label) +
      '</span></summary>' +
      '<div class="pm-work-surface-body">' +
      body +
      '</div>' +
      '</details>'
    );
  }

  function goalActionButtons(goal, opts) {
    opts = opts || {};
    var actions = [];
    if (goal.canEdit !== false) {
      actions.push(
        '<button type="button" class="pm-btn pm-btn-ghost pm-goal-act" data-goal-action="edit" title="Edit goal" aria-label="Edit goal">' +
          icon('pencil', 'pm-btn-icon') +
          '<span>Edit</span></button>'
      );
    }
    if (goal.canPause) {
      actions.push(
        '<button type="button" class="pm-btn pm-goal-act" data-goal-action="pause" title="Pause" aria-label="Pause">' +
          icon('pause', 'pm-btn-icon') +
          '<span>Pause</span></button>'
      );
    }
    if (goal.canResume) {
      actions.push(
        '<button type="button" class="pm-btn pm-goal-act" data-goal-action="resume" title="Resume" aria-label="Resume">' +
          icon('play', 'pm-btn-icon') +
          '<span>Resume</span></button>'
      );
    }
    if (goal.canStop) {
      actions.push(
        '<button type="button" class="pm-btn pm-goal-act" data-goal-action="stop" title="Stop" aria-label="Stop">' +
          icon('stop', 'pm-btn-icon') +
          '<span>Stop</span></button>'
      );
    }
    if (goal.canClear || goal.status === 'stopped' || goal.status === 'paused') {
      actions.push(
        '<button type="button" class="pm-btn pm-btn-ghost pm-goal-act" data-goal-action="clear" title="Clear goal" aria-label="Clear goal">' +
          icon('x', 'pm-btn-icon') +
          '<span>Clear</span></button>'
      );
    }
    if (goal.canReplan !== false) {
      actions.push(
        '<button type="button" class="pm-btn pm-btn-ghost pm-goal-act" data-goal-action="replan" title="Replan" aria-label="Replan">' +
          icon('refresh', 'pm-btn-icon') +
          '<span>Replan</span></button>'
      );
    }
    if (opts.includeExpand) {
      actions.push(
        '<button type="button" class="pm-btn pm-btn-ghost pm-goal-act" data-goal-action="toggleExpand" title="' +
          (opts.expanded ? 'Collapse' : 'Expand') +
          '" aria-label="' +
          (opts.expanded ? 'Collapse' : 'Expand') +
          '">' +
          icon(opts.expanded ? 'chevD' : 'chevR', 'pm-btn-icon') +
          '<span>' +
          (opts.expanded ? 'Collapse' : 'Expand') +
          '</span></button>'
      );
    }
    return actions;
  }

  /** Compact always-reachable goal strip (above dock / work surfaces). */
  function renderGoalStrip(thread) {
    var goal = thread && (thread.goal || thread.activeGoal);
    if (!goal) return '';
    var actions = goalActionButtons(goal, { includeExpand: false });
    var dur = formatDuration(goal.workedSeconds);
    var editPanel = goal.editing
      ? '<div class="pm-goal-edit-panel" data-goal-edit-panel>' +
        '<label class="pm-goal-edit-label" for="pm-goal-edit-input">Edit objective</label>' +
        '<textarea id="pm-goal-edit-input" class="pm-goal-edit-input" data-goal-edit-input rows="3">' +
        escapeHtml(goal.objective || goal.title || '') +
        '</textarea>' +
        '<div class="pm-goal-edit-actions">' +
        '<button type="button" class="pm-btn pm-btn-ghost" data-goal-action="edit-cancel">Cancel</button>' +
        '<button type="button" class="pm-btn" data-goal-action="edit-save">Save</button>' +
        '</div></div>'
      : '';
    return (
      '<div class="pm-goal-strip' +
      (goal.editing ? ' is-editing' : '') +
      '" data-goal-strip data-goal-id="' +
      escapeHtml(goal.id || '') +
      '">' +
      '<div class="pm-goal-strip-row">' +
      '<div class="pm-goal-strip-main">' +
      '<span class="pm-goal-strip-kicker">Goal</span>' +
      '<span class="pm-goal-strip-title">' +
      escapeHtml(goal.title || 'Untitled goal') +
      '</span>' +
      '<span class="pm-goal-strip-status">' +
      escapeHtml(formatStatus(goal.status)) +
      (dur ? ' · ' + escapeHtml(dur) : '') +
      '</span>' +
      '</div>' +
      (actions.length
        ? '<div class="pm-goal-strip-actions">' + actions.join('') + '</div>'
        : '') +
      '</div>' +
      editPanel +
      '</div>'
    );
  }

  function renderGoal(goal, storeHelpers) {
    if (!goal) return '';
    var expanded = goal.expanded;
    if (storeHelpers && storeHelpers.goalExpanded != null) {
      expanded = !!storeHelpers.goalExpanded;
    }
    /* Primary controls live on the always-visible goal strip — folio is detail only. */
    var actions = [];
    var tasks = Array.isArray(goal.tasks) ? goal.tasks : [];
    var subgoals = Array.isArray(goal.subgoals) ? goal.subgoals : [];
    var evidence = Array.isArray(goal.evidence) ? goal.evidence : [];
    var depth = '';
    if (expanded) {
      depth +=
        '<div class="pm-goal-objective">' +
        escapeHtml(goal.objective || goal.summary || '') +
        '</div>';
      if (goal.blocker || goal.status === 'blocked') {
        depth +=
          '<div class="pm-goal-blocker" data-goal-blocker>' +
          '<span class="pm-goal-blocker-kicker">Blocker</span> ' +
          escapeHtml(goal.blocker || 'Blocked — needs input') +
          '</div>';
      }
      if (tasks.length) {
        depth +=
          '<div class="pm-goal-section"><div class="pm-goal-section-title">Tasks</div><ul class="pm-goal-list">' +
          tasks
            .map(function (task) {
              return (
                '<li data-state="' +
                escapeHtml(task.state || task.status || '') +
                '">' +
                escapeHtml(task.label || task.title || task.id || 'Task') +
                '</li>'
              );
            })
            .join('') +
          '</ul></div>';
      }
      if (subgoals.length) {
        depth +=
          '<div class="pm-goal-section"><div class="pm-goal-section-title">Subgoals</div><ul class="pm-goal-list">' +
          subgoals
            .map(function (sg) {
              return (
                '<li>' +
                escapeHtml(sg.label || sg.title || sg.id || 'Subgoal') +
                (sg.status
                  ? ' · ' + escapeHtml(formatStatus(sg.status))
                  : '') +
                '</li>'
              );
            })
            .join('') +
          '</ul></div>';
      }
      if (evidence.length) {
        depth +=
          '<div class="pm-goal-section"><div class="pm-goal-section-title">Evidence</div><ul class="pm-goal-list">' +
          evidence
            .map(function (ev) {
              return (
                '<li>' +
                escapeHtml(ev.label || ev.summary || ev.id || 'Evidence') +
                '</li>'
              );
            })
            .join('') +
          '</ul></div>';
      }
      if (goal.replanNote) {
        depth +=
          '<div class="pm-goal-replan-note">' +
          escapeHtml(goal.replanNote) +
          '</div>';
      }
    }
    return (
      '<details class="pm-work-surface" data-kind="goal" data-goal-id="' +
      escapeHtml(goal.id || '') +
      '"' +
      (expanded ? ' open' : '') +
      '>' +
      '<summary class="pm-work-surface-head">' +
      '<span class="pm-work-chev" aria-hidden="true">›</span>' +
      '<span class="pm-work-surface-title">Goal · ' +
      escapeHtml(formatStatus(goal.status)) +
      '</span>' +
      '<span class="pm-work-surface-meta">' +
      escapeHtml(formatDuration(goal.workedSeconds)) +
      '</span>' +
      '</summary>' +
      '<div class="pm-work-surface-body">' +
      '<div class="pm-goal-title">' +
      escapeHtml(goal.title || '') +
      '</div>' +
      depth +
      (actions.length
        ? '<div class="pm-goal-actions">' + actions.join('') + '</div>'
        : '<p class="pm-goal-strip-hint">Edit, pause, stop, and replan live in the Goal strip below.</p>') +
      '</div>' +
      '</details>'
    );
  }

  function renderBrowserSessions(sessions) {
    var list = Array.isArray(sessions) ? sessions : [];
    if (!list.length) return '';
    return (
      '<details class="pm-work-surface" data-kind="browser" data-browser-sessions>' +
      '<summary class="pm-work-surface-head"><span class="pm-work-chev" aria-hidden="true">›</span><span class="pm-work-surface-title">Browser</span>' +
      '<span class="pm-work-surface-meta">' +
      list.length +
      '</span></summary>' +
      '<div class="pm-work-surface-body pm-browser-list">' +
      list
        .map(function (s) {
          return (
            '<button type="button" class="pm-btn pm-btn-ghost pm-browser-session" data-browser-open="' +
            escapeHtml(s.id || '') +
            '" title="' +
            escapeHtml(s.url || s.title || '') +
            '">' +
            '<span class="pm-browser-session-title">' +
            escapeHtml(s.title || s.url || s.id || 'Session') +
            '</span>' +
            (s.url
              ? '<span class="pm-browser-session-url">' + escapeHtml(s.url) + '</span>'
              : '') +
            '</button>'
          );
        })
        .join('') +
      '</div></details>'
    );
  }

  function renderTodo(todos) {
    if (!todos) return '';
    var items = Array.isArray(todos) ? todos : todos.items || [];
    if (!items.length) return '';
    var label = (!Array.isArray(todos) && todos.id) || 'Todo';
    var done = items.filter(function (it) {
      return String(it.state || '').toLowerCase() === 'done' ||
        String(it.state || '').toLowerCase() === 'complete';
    }).length;
    return (
      '<details class="pm-work-surface" data-kind="todo">' +
      '<summary class="pm-work-surface-head"><span class="pm-work-chev" aria-hidden="true">›</span><span class="pm-work-surface-title">' +
      escapeHtml(typeof label === 'string' ? label : 'Todo') +
      '</span><span class="pm-work-surface-meta">' +
      done +
      '/' +
      items.length +
      '</span></summary>' +
      '<ul class="pm-work-surface-body pm-todo-list">' +
      items
        .map(function (it) {
          return (
            '<li class="pm-todo-item" data-state="' +
            escapeHtml(it.state || '') +
            '">' +
            '<span class="pm-todo-state">' +
            escapeHtml(formatStatus(it.state)) +
            '</span> ' +
            escapeHtml(it.label || it.title || it.id) +
            '</li>'
          );
        })
        .join('') +
      '</ul>' +
      '</details>'
    );
  }

  function renderSubagents(groups, expandedMap) {
    var list = Array.isArray(groups) ? groups : [];
    if (!list.length) return '';
    expandedMap = expandedMap || {};
    return list
      .map(function (g) {
        var open = expandedMap[g.id] != null ? !!expandedMap[g.id] : false;
        var agents = Array.isArray(g.agents) ? g.agents : [];
        var counts = g.counts || {};
        var countBits = ['working', 'complete', 'blocked', 'waiting']
          .filter(function (k) {
            return counts[k] != null;
          })
          .map(function (k) {
            return formatStatus(k) + ' ' + counts[k];
          })
          .join(' · ');
        return (
          '<details class="pm-work-surface" data-kind="subagent" data-subagent-id="' +
          escapeHtml(g.id || '') +
          '"' +
          (open ? ' open' : '') +
          '>' +
          '<summary class="pm-work-surface-head"><span class="pm-work-chev" aria-hidden="true">›</span><span class="pm-work-surface-title">' +
          escapeHtml(g.label || 'Subagents') +
          '</span><span class="pm-work-surface-meta">' +
          escapeHtml(formatStatus(g.state) + (countBits ? ' · ' + countBits : '')) +
          '</span></summary>' +
          '<ul class="pm-work-surface-body pm-subagent-list">' +
          agents
            .map(function (a) {
              return (
                '<li><strong>' +
                escapeHtml(a.name || 'Agent') +
                '</strong> — ' +
                escapeHtml(a.task || '') +
                '<div class="pm-subagent-meta">' +
                escapeHtml(a.currentActivity || '') +
                (a.workedSeconds != null
                  ? ' · ' + escapeHtml(formatDuration(a.workedSeconds))
                  : '') +
                ' · ' +
                escapeHtml(formatStatus(a.status)) +
                '</div></li>'
              );
            })
            .join('') +
          '</ul>' +
          '</details>'
        );
      })
      .join('');
  }

  function renderDiffs(diffGroups) {
    var list = Array.isArray(diffGroups) ? diffGroups : [];
    if (!list.length) return '';
    return list
      .map(function (g) {
        var files = Array.isArray(g.files) ? g.files : [];
        return (
          '<details class="pm-work-surface" data-kind="diff" data-diff-id="' +
          escapeHtml(g.id || '') +
          '">' +
          '<summary class="pm-work-surface-head"><span class="pm-work-chev" aria-hidden="true">›</span><span class="pm-work-surface-title">' +
          escapeHtml(g.label || 'Diffs') +
          '</span></summary>' +
          '<ul class="pm-work-surface-body pm-diff-list">' +
          files
            .map(function (f) {
              return (
                '<li><code>' +
                escapeHtml(f.path || '') +
                '</code> +' +
                escapeHtml(String(f.added != null ? f.added : 0)) +
                ' −' +
                escapeHtml(String(f.removed != null ? f.removed : 0)) +
                ' · ' +
                escapeHtml(formatStatus(f.status)) +
                '</li>'
              );
            })
            .join('') +
          '</ul>' +
          '</details>'
        );
      })
      .join('');
  }

  function renderQuestionnaire(q, handlers) {
    if (!q) return '';
    handlers = handlers || {};
    var idx = q.currentQuestionIndex | 0;
    var questions = q.questions || [];
    var total = questions.length;
    var current = questions[idx] || questions[0];
    if (!current) return '';
    var options = Array.isArray(current.options) ? current.options : [];
    var body = '';
    if (current.kind === 'freeform') {
      body =
        '<textarea class="pm-q-input" data-q-freeform rows="3" spellcheck="true" placeholder="Your answer">' +
        escapeHtml(current.draft || '') +
        '</textarea>';
    } else {
      var multi = String(current.kind || '').indexOf('multi') >= 0;
      var role = multi ? 'checkbox' : 'radio';
      var checkSvg = multi
        ? '<svg class="pm-q-mark-svg" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path class="pm-q-mark-check" d="M4.2 8.2l2.4 2.4 5-5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg class="pm-q-mark-svg" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="pm-q-mark-dot" cx="8" cy="8" r="3.1" fill="currentColor"/></svg>';
      body =
        '<div class="pm-q-options pm-stagger" role="group">' +
        options
          .map(function (opt, oi) {
            var val = typeof opt === 'string' ? opt : opt.value || opt.label;
            var selected = Array.isArray(current.selected)
              ? current.selected.indexOf(val) >= 0
              : false;
            return (
              '<button type="button" class="pm-q-option' +
              (selected ? ' is-selected' : '') +
              '" role="' +
              role +
              '" aria-checked="' +
              (selected ? 'true' : 'false') +
              '" data-q-option data-q-value="' +
              escapeHtml(val) +
              '" style="--stagger-i:' +
              oi +
              '">' +
              '<span class="pm-q-mark" aria-hidden="true">' +
              checkSvg +
              '</span>' +
              '<span class="pm-q-option-label">' +
              escapeHtml(val) +
              '</span>' +
              '</button>'
            );
          })
          .join('') +
        '</div>';
    }
    /* Markup starts expanded; armQuestionnaireMorph briefly flips to preparing pill. */
    return (
      '<section class="pm-q-stage is-expanded pm-q-card" data-questionnaire-id="' +
      escapeHtml(q.id) +
      '" data-question-id="' +
      escapeHtml(current.id) +
      '" data-q-index="' +
      idx +
      '">' +
      '<div class="pm-q-pill" data-q-pill aria-hidden="true">' +
      '<span class="pm-q-pill-label" data-q-pill-label>Preparing</span>' +
      '<span class="pm-q-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '</div>' +
      '<div class="pm-q-card-head">' +
      '<span class="pm-q-card-kicker">Questionnaire</span>' +
      '<span class="pm-q-card-progress">' +
      (idx + 1) +
      ' of ' +
      total +
      '</span>' +
      '</div>' +
      '<div class="pm-q-carousel">' +
      '<div class="pm-q-carousel-pane" data-q-pane>' +
      '<div class="pm-q-card-prompt">' +
      escapeHtml(current.prompt || '') +
      '</div>' +
      body +
      '</div>' +
      '</div>' +
      '<div class="pm-q-card-actions">' +
      '<button type="button" class="pm-btn pm-q-primary" data-q-action="submit">' +
      icon('check', 'pm-btn-icon') +
      '<span>Submit</span></button>' +
      '<button type="button" class="pm-btn pm-btn-ghost" data-q-action="skip">' +
      icon('skip', 'pm-btn-icon') +
      '<span>Skip</span></button>' +
      '<button type="button" class="pm-btn pm-btn-ghost" data-q-action="cancel" aria-label="Cancel questionnaire" title="Cancel questionnaire">' +
      icon('x', 'pm-btn-icon') +
      '<span>Cancel</span></button>' +
      '</div>' +
      '</section>'
    );
  }

  var qMorphSeen = Object.create(null);
  var qCarouselEnterPending = Object.create(null);

  function armQuestionnaireMorph(root) {
    if (!root) return;
    var stage = root.querySelector('.pm-q-stage[data-questionnaire-id]');
    if (!stage) return;
    var qid = stage.getAttribute('data-questionnaire-id') || '';
    var reduced =
      window.PMChatMotion && typeof window.PMChatMotion.isReduced === 'function'
        ? window.PMChatMotion.isReduced()
        : false;

    function playEnterIfPending() {
      var pane = stage.querySelector('[data-q-pane]');
      if (!pane || !qCarouselEnterPending[qid]) return;
      delete qCarouselEnterPending[qid];
      pane.classList.remove('is-leaving', 'is-entering');
      pane.classList.add('is-enter-prep');
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          if (!pane.isConnected) return;
          pane.classList.remove('is-enter-prep');
          pane.classList.add('is-entering');
          window.setTimeout(function () {
            if (pane.isConnected) pane.classList.remove('is-entering');
          }, 340);
        });
      });
    }

    function morphToExpanded() {
      var fromH = stage.getBoundingClientRect().height || 72;
      stage.classList.remove('is-pill', 'is-preparing');
      stage.classList.add('is-expanded', 'pm-q-morph-expand', 'pm-q-height-morph');
      stage.style.overflow = 'hidden';
      stage.style.height = 'auto';
      var toH = Math.min(stage.scrollHeight || fromH, Math.floor(window.innerHeight * 0.52) || 480);
      stage.style.height = fromH + 'px';
      void stage.offsetHeight;
      window.requestAnimationFrame(function () {
        if (!stage.isConnected) return;
        stage.style.height = toH + 'px';
      });
      var finished = false;
      var finish = function () {
        if (finished) return;
        finished = true;
        stage.removeEventListener('transitionend', onEnd);
        if (!stage.isConnected) return;
        stage.style.height = '';
        stage.style.overflow = '';
        stage.classList.remove('pm-q-height-morph');
        window.setTimeout(function () {
          if (stage.isConnected) stage.classList.remove('pm-q-morph-expand');
        }, 40);
        var opts = stage.querySelector('.pm-q-options');
        if (opts && window.PMChatMotion && typeof window.PMChatMotion.stagger === 'function') {
          window.PMChatMotion.stagger(opts, '.pm-q-option');
        }
      };
      var onEnd = function (ev) {
        if (ev.target !== stage || (ev.propertyName && ev.propertyName !== 'height')) return;
        finish();
      };
      stage.addEventListener('transitionend', onEnd);
      window.setTimeout(finish, 500);
    }

    if (reduced || qMorphSeen[qid]) {
      stage.classList.remove('is-pill', 'is-preparing', 'is-submitting', 'is-settling', 'pm-q-height-morph');
      stage.style.height = '';
      stage.classList.add('is-expanded');
      playEnterIfPending();
      return;
    }
    qMorphSeen[qid] = 1;
    var label = stage.querySelector('[data-q-pill-label]');
    if (label) label.textContent = 'Preparing questions…';
    stage.classList.remove('is-expanded', 'is-submitting', 'pm-q-morph-expand');
    stage.classList.add('is-pill', 'is-preparing', 'pm-q-morph');
    stage.style.height = '72px';
    if (root) root.classList.add('is-q-preparing');
    window.setTimeout(function () {
      if (!stage.isConnected) return;
      if (root) root.classList.remove('is-q-preparing');
      if (reduced) {
        stage.classList.remove('is-pill', 'is-preparing');
        stage.classList.add('is-expanded');
        stage.style.height = '';
        return;
      }
      morphToExpanded();
    }, 420);
  }

  function runQuestionnaireExit(stage, thenFn) {
    var done = function () {
      if (typeof thenFn === 'function') thenFn();
    };
    if (!stage) {
      done();
      return;
    }
    var qid = stage.getAttribute('data-questionnaire-id');
    if (qid) delete qMorphSeen[qid];
    if (window.PMChatMotion && typeof window.PMChatMotion.playExit === 'function') {
      window.PMChatMotion.playExit(stage, 'pm-motion-exit', done);
    } else {
      stage.classList.add('is-leaving');
      window.setTimeout(done, 180);
    }
  }

  /** Carousel between questions in-place (skip / mid-submit advance). */
  function runQuestionnaireCarousel(stage, thenFn) {
    var done = function () {
      if (typeof thenFn === 'function') thenFn();
    };
    if (!stage) {
      done();
      return;
    }
    var reduced =
      window.PMChatMotion && typeof window.PMChatMotion.isReduced === 'function'
        ? window.PMChatMotion.isReduced()
        : false;
    var pane = stage.querySelector('[data-q-pane]');
    var qid = stage.getAttribute('data-questionnaire-id') || '';
    if (reduced || !pane) {
      if (qid) qCarouselEnterPending[qid] = 1;
      done();
      return;
    }
    pane.classList.remove('is-entering', 'is-enter-prep');
    pane.classList.add('is-leaving');
    var finished = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      pane.removeEventListener('transitionend', finish);
      if (qid) qCarouselEnterPending[qid] = 1;
      done();
    };
    pane.addEventListener('transitionend', finish);
    window.setTimeout(finish, 340);
  }

  /** Post-submit spring settle before swapping dock back to composer. */
  function runQuestionnaireSettle(stage, thenFn) {
    var done = function () {
      if (typeof thenFn === 'function') thenFn();
    };
    if (!stage) {
      done();
      return;
    }
    var reduced =
      window.PMChatMotion && typeof window.PMChatMotion.isReduced === 'function'
        ? window.PMChatMotion.isReduced()
        : false;
    if (reduced) {
      done();
      return;
    }
    stage.classList.remove('is-expanded');
    stage.classList.add('is-pill', 'is-submitting', 'is-settling');
    var pillLabel = stage.querySelector('[data-q-pill-label]');
    if (pillLabel) pillLabel.textContent = 'Submitting answers…';
    window.setTimeout(function () {
      if (pillLabel && stage.isConnected) pillLabel.textContent = 'Submitted';
    }, 280);
    window.setTimeout(function () {
      stage.classList.add('pm-q-settle');
      window.setTimeout(done, 280);
    }, 220);
  }

  function composerButtonHtml(mode) {
    var isStop = mode === 'stop';
    return (
      '<button type="button" class="pm-btn pm-composer-btn" data-composer-button data-mode="' +
      escapeHtml(isStop ? 'stop' : 'send') +
      '" aria-label="' +
      (isStop ? 'Stop' : 'Send') +
      '" title="' +
      (isStop ? 'Stop' : 'Send') +
      '">' +
      icon(isStop ? 'stop' : 'arrowUp', 'pm-btn-icon') +
      '<span class="pm-composer-btn-label">' +
      (isStop ? 'Stop' : 'Send') +
      '</span></button>'
    );
  }

  function renderComposer(store, threadId, buttonMode) {
    var thread = store && store.threads && store.threads[threadId];
    var draft = (thread && thread.draft && thread.draft.text) || '';
    var attachments =
      (thread && thread.draft && Array.isArray(thread.draft.attachments)
        ? thread.draft.attachments
        : []) || [];
    var revs = (thread && thread.draftRevisions) || [];
    var mode =
      buttonMode ||
      (window.PMChatComposer
        ? window.PMChatComposer.buttonMode(store, threadId)
        : 'send');
    var chips =
      attachments.length > 0
        ? '<div class="pm-composer-attachments" data-composer-attachments>' +
          attachments
            .map(function (a, i) {
              var name = (a && (a.name || a.title || a.path)) || 'Attachment ' + (i + 1);
              var resolver = (a && (a.resolverLabel || a.resolver)) || '';
              return (
                '<span class="pm-composer-attach-chip pm-chip-in" data-attach-idx="' +
                i +
                '"' +
                (a && a.resolver ? ' data-attach-resolver="' + escapeHtml(a.resolver) + '"' : '') +
                '>' +
                '<span class="pm-composer-attach-name">' +
                escapeHtml(name) +
                '</span>' +
                (resolver
                  ? '<span class="pm-composer-attach-resolver">' + escapeHtml(resolver) + '</span>'
                  : '') +
                '<button type="button" class="pm-composer-attach-remove" data-attach-remove="' +
                i +
                '" aria-label="Remove attachment">' +
                icon('x', 'pm-btn-icon') +
                '</button>' +
                '</span>'
              );
            })
            .join('') +
          '</div>'
        : '';
    return (
      '<div class="pm-composer" data-composer>' +
      chips +
      '<textarea class="pm-composer-input" data-composer-input spellcheck="true" rows="2" placeholder="Message Grok 4.5">' +
      escapeHtml(draft) +
      '</textarea>' +
      '<div class="pm-composer-toolbar">' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-composer-attach" data-composer-attach title="Attach files" aria-label="Attach files">' +
      icon('paperclip', 'pm-btn-icon') +
      '<span class="pm-composer-attach-label">Attach</span></button>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-composer-drafts" data-draft-revisions-peek aria-expanded="false" aria-label="Draft revisions" title="Draft revisions">' +
      icon('clipboard', 'pm-btn-icon') +
      '<span>' +
      (revs.length ? 'Drafts · ' + revs.length : 'Drafts') +
      '</span></button>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-composer-clear-draft" data-composer-clear-draft title="Clear draft" aria-label="Clear draft">' +
      icon('eraser', 'pm-btn-icon') +
      '<span>Clear</span></button>' +
      '<span class="pm-composer-toolbar-spacer"></span>' +
      composerButtonHtml(mode) +
      '</div>' +
      '<div class="pm-composer-draft-peek" data-draft-revisions-panel hidden></div>' +
      '</div>'
    );
  }

  /** Dock sibling after transcript: questionnaire XOR composer — never both.
   *  paradigm / conceptId is the pairing thread module id (t1–t8), not conversation thread-NN. */
  function renderDock(store, tid, q, paradigm) {
    var threadId = tid;
    var conceptId =
      paradigm ||
      (typeof document !== 'undefined' &&
        (document.documentElement.getAttribute('data-concept-thread') ||
          new URLSearchParams(window.location.search).get('t'))) ||
      't1';
    var qHtml = '';
    if (q) {
      if (window.PMChatQRenderers && typeof window.PMChatQRenderers.renderStage === 'function') {
        qHtml = window.PMChatQRenderers.renderStage(conceptId, q);
      } else if (window.PMChatQRenderers && typeof window.PMChatQRenderers.renderForThread === 'function') {
        qHtml = window.PMChatQRenderers.renderForThread(conceptId, q, renderQuestionnaire);
      } else {
        qHtml = renderQuestionnaire(q);
      }
    }
    var inner = q ? qHtml : renderComposer(store, tid);
    return (
      '<div class="pm-thread-dock' +
      (q ? ' is-q-active' : '') +
      '" data-thread-dock' +
      (q ? ' data-q-lock="1"' : '') +
      (paradigm ? ' data-dock-paradigm="' + escapeHtml(paradigm) + '"' : '') +
      '>' +
      inner +
      '</div>'
    );
  }

  function renderArtifacts(artifacts) {
    var list = Array.isArray(artifacts) ? artifacts : [];
    if (!list.length) return '';
    return (
      '<div class="pm-artifacts" data-artifacts>' +
      '<div class="pm-artifacts-label">Artifacts · ' +
      escapeHtml(MODEL) +
      '</div>' +
      '<div class="pm-artifacts-row">' +
      list
        .map(function (a) {
          return (
            '<button type="button" class="pm-btn pm-btn-ghost pm-artifact-btn" data-artifact-open="' +
            escapeHtml(a.id || '') +
            '" title="' +
            escapeHtml(a.projectPath || a.title || '') +
            '">' +
            escapeHtml(a.title || a.id || 'Artifact') +
            '</button>'
          );
        })
        .join('') +
      '</div></div>'
    );
  }

  function renderWorkSurfaces(thread, ui) {
    if (!thread) return '';
    ui = ui || {};
    var paradigm =
      ui.paradigm ||
      ui.compactParadigm ||
      (window.PMChatV2 && window.PMChatV2.paradigmForConcept
        ? window.PMChatV2.paradigmForConcept(
            (typeof document !== 'undefined' &&
              document.documentElement.getAttribute('data-concept-thread')) ||
              ''
          )
        : 'default');
    var compact =
      window.PMChatV2 && typeof window.PMChatV2.renderCompactWorkBand === 'function'
        ? window.PMChatV2.renderCompactWorkBand(thread, paradigm)
        : '';
    var detail =
      renderGoal(thread.goal, {
        goalExpanded:
          ui.goalExpanded != null
            ? ui.goalExpanded
            : thread.goal && thread.goal.expanded
      }) +
      renderTodo(thread.todos) +
      renderSubagents(thread.subagentGroups, ui.expandedSubagentIds || {}) +
      renderDiffs(thread.diffGroups) +
      renderArtifacts(thread.artifacts) +
      renderBrowserSessions(thread.browserSessions);
    if (!compact) return detail;
    /* Compact band first; detail surfaces stay available but collapsed by default via details */
    return (
      compact +
      '<div class="pm-work-detail-stack" data-work-detail-stack>' +
      detail +
      '</div>'
    );
  }

  function openArtifact(env, store, threadId, artifactId) {
    var thread = store && store.threads && store.threads[threadId];
    var list = (thread && thread.artifacts) || [];
    var art = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === artifactId) {
        art = list[i];
        break;
      }
    }
    if (!art) {
      /* Allow catalog / harness ids */
      art = { id: artifactId, title: artifactId, type: 'document' };
    }
    /* Preserve composer draft + scroll via store scrollAnchor */
    if (store && typeof store.setScrollAnchor === 'function') {
      var stage = document.querySelector('.pm-transcript');
      if (stage) {
        store.setScrollAnchor(threadId, { top: stage.scrollTop, mid: art.id });
      }
    }
    if (window.PMChatV2 && typeof window.PMChatV2.openArtifactWorkspace === 'function') {
      window.PMChatV2.openArtifactWorkspace(store, threadId, art.id, { status: 'loading' });
      if (env && env.emit) {
        env.emit({ type: 'ui.local', kind: 'artifact-workspace-open', artifactId: art.id });
      }
      if (env && env.toast) env.toast('Artifact · ' + (art.title || art.id));
      try {
        window.dispatchEvent(new CustomEvent('pm-request-window-paint'));
      } catch (_) {}
      return;
    }
    /* Fallback façade only if v2 runtime missing */
    env.demoEditorTab = {
      id: art.id,
      title: art.title || art.id,
      path: art.projectPath || '',
      kind: art.kind || 'artifact',
      openTarget: 'artifact workspace'
    };
    if (env.toast) env.toast('Artifact workspace unavailable · ' + (art.title || art.id));
  }

  function openBrowserSession(env, store, threadId, sessionId) {
    var thread = store && store.threads && store.threads[threadId];
    var list = (thread && thread.browserSessions) || [];
    var sess = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === sessionId) {
        sess = list[i];
        break;
      }
    }
    if (!sess) return;
    env.demoEditorTab = {
      id: sess.id,
      title: sess.title || sess.url || sess.id,
      path: sess.url || '',
      kind: 'browser',
      openTarget: 'editor tab'
    };
    showEditorTabHandoff(env.demoEditorTab);
    if (env.emit) {
      env.emit({ type: 'ui.local', kind: 'open-editor-tab', tab: env.demoEditorTab });
    } else if (window.__pmShellHandle && window.__pmShellHandle.openEditorTab) {
      window.__pmShellHandle.openEditorTab(env.demoEditorTab);
    }
    if (env.toast) {
      env.toast('Browser → editor tab · ' + (sess.title || sess.id) + ' · GAP-009 façade');
    }
  }

  function showEditorTabHandoff(tab) {
    if (!tab) return;
    var existing = document.querySelector('[data-editor-tab-handoff]');
    if (existing) existing.remove();
    var panel = document.createElement('div');
    panel.className = 'pm-editor-tab-handoff';
    panel.setAttribute('data-editor-tab-handoff', '');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Editor tab handoff');
    panel.innerHTML =
      '<div class="pm-editor-tab-head">' +
      '<span class="pm-editor-tab-kicker">Editor tab</span>' +
      '<button type="button" class="pm-editor-tab-close" data-editor-tab-close aria-label="Close">' +
      icon('x', 'pm-btn-icon') +
      '</button>' +
      '</div>' +
      '<div class="pm-editor-tab-title">' +
      escapeHtml(tab.title || tab.id || 'Untitled') +
      '</div>' +
      (tab.path
        ? '<div class="pm-editor-tab-path">' + escapeHtml(tab.path) + '</div>'
        : '') +
      '<div class="pm-editor-tab-meta">' +
      escapeHtml(tab.kind || 'file') +
      ' · openTarget: ' +
      escapeHtml(tab.openTarget || 'editor tab') +
      ' · GAP-009 façade</div>';
    var stage =
      document.querySelector('.pm-chat-root') ||
      document.querySelector('.pm-thread') ||
      document.body;
    stage.appendChild(panel);
    panel.querySelector('[data-editor-tab-close]').addEventListener('click', function () {
      panel.remove();
    });
  }

  function groupTurns(messages) {
    var turns = [];
    var current = null;
    (messages || []).forEach(function (m) {
      if (m.role === 'user' || !current) {
        current = { id: 'turn-' + m.id, user: null, assistant: [], lead: m };
        if (m.role === 'user') current.user = m;
        else current.assistant.push(m);
        turns.push(current);
      } else {
        current.assistant.push(m);
      }
    });
    return turns;
  }

  function searchHighlightId(store) {
    return store &&
      store.search &&
      store.search.highlightUntil &&
      store.search.highlightUntil > Date.now()
      ? store.search.focusedTargetMessageId
      : null;
  }

  function applySearchHit(html, msgId, highlightId) {
    if (!highlightId || msgId !== highlightId) return html;
    return html.replace('class="pm-msg"', 'class="pm-msg is-search-hit"');
  }

  function lensShapeOf(lens, messageId) {
    if (!lens || !messageId) return null;
    if (Array.isArray(lens.mutedIds) && lens.mutedIds.indexOf(messageId) >= 0) {
      return 'muted';
    }
    if (Array.isArray(lens.focusedIds) && lens.focusedIds.indexOf(messageId) >= 0) {
      return 'focused';
    }
    var subs = Array.isArray(lens.subcompacts) ? lens.subcompacts : [];
    for (var i = 0; i < subs.length; i++) {
      var src = subs[i] && subs[i].sourceIds;
      if (Array.isArray(src) && src.indexOf(messageId) >= 0) return 'subcompacted';
    }
    return null;
  }

  function isLensSelecting(lens) {
    return !!(lens && lens.mode && lens.mode !== 'off');
  }

  function renderLensChip(shape, messageId) {
    if (!shape) return '';
    var label =
      shape === 'muted'
        ? 'Muted'
        : shape === 'focused'
          ? 'Focused'
          : shape === 'subcompacted'
            ? 'Subcompacted'
            : shape;
    return (
      '<div class="pm-lens-chip" data-lens-shape="' +
      escapeHtml(shape) +
      '">' +
      '<span class="pm-lens-chip-label">' +
      escapeHtml(label) +
      '</span>' +
      '<button type="button" class="pm-lens-chip-clear" data-lens-clear="' +
      escapeHtml(messageId) +
      '" aria-label="Clear lens on message">Clear</button>' +
      '</div>'
    );
  }

  function renderLensSelectToggle(messageId, selected) {
    return (
      '<label class="pm-lens-select" title="Select message">' +
      '<input type="checkbox" data-lens-select="' +
      escapeHtml(messageId) +
      '"' +
      (selected ? ' checked' : '') +
      ' aria-label="Select message" />' +
      '<span class="pm-lens-select-mark" aria-hidden="true"></span>' +
      '</label>'
    );
  }

  function syncGoalStrip(root, store, tid) {
    if (!root) return;
    var thread = tid && store && store.threads ? store.threads[tid] : null;
    var existing = root.querySelector('[data-goal-strip]');
    var html = renderGoalStrip(thread);
    if (!html) {
      if (existing) existing.remove();
      return;
    }
    if (existing) {
      existing.outerHTML = html;
    } else {
      var dock = root.querySelector('[data-thread-dock]');
      if (dock) dock.insertAdjacentHTML('beforebegin', html);
      else root.insertAdjacentHTML('beforeend', html);
    }
  }

  function renderLensBar(lens, store, threadId) {
    if (!isLensSelecting(lens)) return '';
    var n = Array.isArray(lens.selectionIds) ? lens.selectionIds.length : 0;
    var breakdown = '';
    if (
      store &&
      threadId &&
      window.PMChatLens &&
      typeof window.PMChatLens.breakdownHtml === 'function'
    ) {
      breakdown = window.PMChatLens.breakdownHtml(store, threadId) || '';
    }
    return (
      '<div class="pm-lens-bar" data-lens-bar role="toolbar" aria-label="Context Lens">' +
      '<span class="pm-lens-bar-title">' +
      icon('eye', 'pm-btn-icon') +
      '<span>Lens</span></span>' +
      '<span class="pm-lens-bar-count" data-lens-count>' +
      n +
      ' selected</span>' +
      '<div class="pm-lens-bar-actions">' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-lens-chip-btn" data-lens-action="mute" title="Mute">' +
      icon('eyeOff', 'pm-btn-icon') +
      '<span>Mute</span></button>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-lens-chip-btn" data-lens-action="focus" title="Focus">' +
      icon('filter', 'pm-btn-icon') +
      '<span>Focus</span></button>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-lens-chip-btn" data-lens-action="subcompact" title="Subcompact">' +
      icon('layers', 'pm-btn-icon') +
      '<span>Subcompact</span></button>' +
      '<button type="button" class="pm-btn pm-lens-chip-btn" data-lens-action="done" title="Done">' +
      icon('check', 'pm-btn-icon') +
      '<span>Done</span></button>' +
      '</div>' +
      breakdown +
      '</div>'
    );
  }

  function renderJumpToLatest() {
    return (
      '<button type="button" class="pm-jump-latest" data-jump-latest hidden title="Jump to latest" aria-label="Jump to latest">' +
      icon('jumpLatest', 'pm-btn-icon') +
      '<span>Latest</span></button>'
    );
  }

  function clearLensOnMessage(store, threadId, messageId) {
    var t = store && store.threads && store.threads[threadId];
    if (!t || !t.lens || !messageId) return;
    var lens = t.lens;
    var muted = (lens.mutedIds || []).filter(function (id) {
      return id !== messageId;
    });
    var focused = (lens.focusedIds || []).filter(function (id) {
      return id !== messageId;
    });
    var subs = (lens.subcompacts || [])
      .map(function (entry) {
        var src = (entry.sourceIds || []).filter(function (id) {
          return id !== messageId;
        });
        if (!src.length) return null;
        return {
          id: entry.id,
          sourceIds: src,
          summary: entry.summary || ''
        };
      })
      .filter(Boolean);
    var selection = (lens.selectionIds || []).filter(function (id) {
      return id !== messageId;
    });
    store.setLens(threadId, {
      mutedIds: muted,
      focusedIds: focused,
      subcompacts: subs,
      selectionIds: selection
    });
  }

  /**
   * After paint: inject lens bar + per-message select/chip affordances so every
   * thread paradigm gets Lens without cloning its message HTML.
   */
  function injectLensUi(ctx) {
    if (!ctx || !ctx.root || !ctx.thread) return;
    var store =
      ctx.store ||
      (window.PMChatHost && typeof window.PMChatHost.getStore === 'function'
        ? window.PMChatHost.getStore()
        : null);
    var lens = ctx.thread.lens || null;
    var selecting = isLensSelecting(lens);
    var selection = selecting && Array.isArray(lens.selectionIds) ? lens.selectionIds : [];

    var existingBar = ctx.root.querySelector('[data-lens-bar]');
    if (selecting) {
      var tid =
        ctx.tid || (store && store.session && store.session.activeThreadKey) || null;
      var barHtml = renderLensBar(lens, store, tid);
      if (existingBar) {
        existingBar.outerHTML = barHtml;
      } else {
        ctx.root.insertAdjacentHTML('afterbegin', barHtml);
      }
      ctx.root.classList.add('is-lens-selecting');
    } else {
      if (existingBar) existingBar.remove();
      ctx.root.classList.remove('is-lens-selecting');
    }

    var articles = ctx.root.querySelectorAll('[data-message-id]');
    for (var i = 0; i < articles.length; i++) {
      var el = articles[i];
      var mid = el.getAttribute('data-message-id');
      if (!mid) continue;
      var shape = lensShapeOf(lens, mid);

      el.classList.toggle('is-lens-muted', shape === 'muted');
      el.classList.toggle('is-lens-focused', shape === 'focused');
      el.classList.toggle('is-lens-subcompacted', shape === 'subcompacted');
      el.classList.toggle(
        'is-lens-selected',
        selecting && selection.indexOf(mid) >= 0
      );

      var chipHost = el.querySelector('[data-lens-chip-host]');
      if (shape) {
        var chipHtml = renderLensChip(shape, mid);
        if (chipHost) {
          chipHost.innerHTML = chipHtml;
        } else {
          el.insertAdjacentHTML(
            'afterbegin',
            '<div class="pm-lens-chip-host" data-lens-chip-host>' + chipHtml + '</div>'
          );
        }
      } else if (chipHost) {
        chipHost.remove();
      }

      var selHost = el.querySelector('[data-lens-select-host]');
      if (selecting) {
        var selHtml = renderLensSelectToggle(mid, selection.indexOf(mid) >= 0);
        if (selHost) {
          selHost.innerHTML = selHtml;
        } else {
          el.insertAdjacentHTML(
            'afterbegin',
            '<div class="pm-lens-select-host" data-lens-select-host>' + selHtml + '</div>'
          );
        }
      } else if (selHost) {
        selHost.remove();
      }
    }
  }

  function applyLensMessageClasses(msg, lens, selecting) {
    if (!msg) return '';
    var shape = lensShapeOf(lens, msg.id);
    var bits = [];
    if (shape === 'muted') bits.push('is-lens-muted');
    if (shape === 'focused') bits.push('is-lens-focused');
    if (shape === 'subcompacted') bits.push('is-lens-subcompacted');
    if (
      selecting &&
      lens &&
      Array.isArray(lens.selectionIds) &&
      lens.selectionIds.indexOf(msg.id) >= 0
    ) {
      bits.push('is-lens-selected');
    }
    return bits.length ? ' ' + bits.join(' ') : '';
  }

  /**
   * Shared mount factory. Paradigms supply paint(ctx) that writes root.innerHTML
   * (or mutate DOM). Optional local state lives on ctx.local.
   */
  function createThreadMount(meta, options) {
    options = options || {};
    return function mount(slotEl, props) {
      props = props || {};
      var env = props.env || {};
      var store = env.store;
      var contentWidthPx = props.contentWidthPx || 750;
      var composerBound = null;
      var local = Object.create(null);
      if (typeof options.initLocal === 'function') options.initLocal(local, props);

      var root = document.createElement('div');
      root.className =
        'pm-thread ' + (options.rootClass || '') + ' ' + (meta.rootClass || '');
      root.setAttribute('data-thread-module', meta.id || '');

      function activeId() {
        return store && store.session && store.session.activeThreadKey;
      }

      function threadUi(tid) {
        return (store && store.ui && store.ui.perThread && store.ui.perThread[tid]) || {};
      }

      function buildCtx() {
        store = env.store;
        var tid = activeId();
        var thread = tid && store && store.threads ? store.threads[tid] : null;
        var ui = threadUi(tid);
        var msgs =
          tid && store && typeof store.getVisibleMessages === 'function'
            ? store.getVisibleMessages(tid)
            : [];
        var running =
          store && store.demo && store.demo.runningByThread
            ? store.demo.runningByThread[tid]
            : null;
        var q =
          tid && store && typeof store.getActiveQuestionnaire === 'function'
            ? store.getActiveQuestionnaire(tid)
            : null;
        return {
          env: env,
          store: store,
          tid: tid,
          thread: thread,
          ui: ui,
          msgs: msgs,
          running: running,
          q: q,
          highlightId: searchHighlightId(store),
          contentWidthPx: contentWidthPx,
          local: local,
          root: root,
          K: window.PMChatThreadKit
        };
      }

      function rebindComposer() {
        if (composerBound) {
          composerBound.unbind();
          composerBound = null;
        }
        if (!window.PMChatComposer || !store) return;
        var tid = activeId();
        var q =
          tid && typeof store.getActiveQuestionnaire === 'function'
            ? store.getActiveQuestionnaire(tid)
            : null;
        if (q) return;
        composerBound = window.PMChatComposer.bind({
          store: store,
          getThreadId: activeId,
          getComposerEls: function () {
            return {
              input: root.querySelector('[data-composer-input]'),
              button: root.querySelector('[data-composer-button]')
            };
          },
          onRender: function () {
            var btn = root.querySelector('[data-composer-button]');
            var input = root.querySelector('[data-composer-input]');
            var id = activeId();
            if (btn && window.PMChatComposer) {
              var mode = window.PMChatComposer.buttonMode(store, id);
              btn.setAttribute('data-mode', mode);
              btn.setAttribute('aria-label', mode === 'stop' ? 'Stop' : 'Send');
              btn.setAttribute('title', mode === 'stop' ? 'Stop' : 'Send');
              btn.innerHTML =
                (typeof window.PMIcon === 'function'
                  ? window.PMIcon(mode === 'stop' ? 'stop' : 'arrowUp', 'pm-btn-icon')
                  : '') +
                '<span class="pm-composer-btn-label">' +
                (mode === 'stop' ? 'Stop' : 'Send') +
                '</span>';
            }
            if (input && store.threads[id] && store.threads[id].draft) {
              if (document.activeElement !== input) {
                input.value = store.threads[id].draft.text || '';
              }
            }
            if (
              input &&
              window.PMChatV2 &&
              typeof window.PMChatV2.applyPassiveSpellcheck === 'function' &&
              !(store.session && store.session.spellcheckEnabled === false)
            ) {
              window.PMChatV2.applyPassiveSpellcheck(input);
            }
          }
        });
      }

      function paint() {
        var ctx = buildCtx();
        if (typeof options.onBeforePaint === 'function') options.onBeforePaint(ctx);
        var preAnchor = captureScrollAnchor(root);
        var stickAfter = shouldStickTranscriptToBottom(ctx, preAnchor);
        root.classList.toggle('is-q-active', !!ctx.q);
        var chatRoot = root.closest('.pm-chat-root');
        if (chatRoot) chatRoot.classList.toggle('is-q-active', !!ctx.q);
        withAnchor(root, function () {
          options.paint(ctx);
          injectLensUi(ctx);
          syncJumpToLatest(root);
          syncGoalStrip(root, store, ctx.tid);
        });
        rebindComposer();
        armQuestionnaireMorph(root);
        if (typeof options.onAfterPaint === 'function') options.onAfterPaint(ctx);
        if (stickAfter) {
          scrollTranscriptToBottomAfterPaint(root, function () {
            if (window.PMChatMotion && typeof window.PMChatMotion.refresh === 'function') {
              window.PMChatMotion.refresh(root);
            }
            updateJumpToLatestVisibility(root);
            tickActivityTimers(root);
          });
          return;
        }
        requestAnimationFrame(function () {
          if (window.PMChatMotion && typeof window.PMChatMotion.refresh === 'function') {
            window.PMChatMotion.refresh(root);
          }
          updateJumpToLatestVisibility(root);
          tickActivityTimers(root);
        });
      }

      function tickActivityTimers(r) {
        if (!r) return;
        var lives = r.querySelectorAll('[data-activity-live][data-activity-started]');
        for (var i = 0; i < lives.length; i++) {
          var el = lives[i];
          var started = Number(el.getAttribute('data-activity-started')) || Date.now();
          var secs = Math.max(0, Math.floor((Date.now() - started) / 1000));
          var timer = el.querySelector('[data-activity-timer]');
          if (timer) timer.textContent = formatDuration(secs) || '0s';
        }
        if (lives.length && !root._pmActivityTimer) {
          root._pmActivityTimer = window.setInterval(function () {
            if (!root.isConnected) {
              window.clearInterval(root._pmActivityTimer);
              root._pmActivityTimer = null;
              return;
            }
            tickActivityTimers(root);
          }, 1000);
        }
      }

      function syncJumpToLatest(r) {
        if (!r) return;
        var existing = r.querySelector('[data-jump-latest]');
        if (existing) return;
        var tr = r.querySelector('[data-transcript], .pm-transcript');
        var html = renderJumpToLatest();
        if (tr) tr.insertAdjacentHTML('afterend', html);
        else r.insertAdjacentHTML('beforeend', html);
      }

      function updateJumpToLatestVisibility(r) {
        var btn = r && r.querySelector('[data-jump-latest]');
        var tr = r && r.querySelector('[data-transcript], .pm-transcript');
        if (!btn || !tr) return;
        var dist = tr.scrollHeight - tr.scrollTop - tr.clientHeight;
        var show = dist > 72;
        if (show) {
          var live = tr.querySelector('[data-activity-live]');
          var msgs = tr.querySelectorAll('[data-message-id]');
          var last = msgs.length ? msgs[msgs.length - 1] : null;
          var pin = live || last;
          if (pin) {
            var trRect = tr.getBoundingClientRect();
            var pinRect = pin.getBoundingClientRect();
            if (pinRect.bottom <= trRect.bottom + 48 && pinRect.top < trRect.bottom) {
              show = false;
            }
          }
        }
        var wasHidden = btn.hasAttribute('hidden');
        if (show) {
          btn._pmLeaving = false;
          btn.classList.remove('is-leaving');
          btn.removeAttribute('hidden');
          r.classList.toggle('has-jump-latest', true);
          return;
        }
        if (wasHidden || btn._pmLeaving) {
          r.classList.toggle('has-jump-latest', false);
          return;
        }
        var reduced =
          window.PMChatMotion && typeof window.PMChatMotion.isReduced === 'function'
            ? window.PMChatMotion.isReduced()
            : false;
        if (reduced) {
          btn.setAttribute('hidden', '');
          r.classList.toggle('has-jump-latest', false);
          return;
        }
        btn._pmLeaving = true;
        var finishHide = function () {
          btn._pmLeaving = false;
          if (!btn.isConnected) return;
          btn.setAttribute('hidden', '');
          btn.classList.remove('is-leaving');
          r.classList.toggle('has-jump-latest', false);
        };
        if (window.PMChatMotion && typeof window.PMChatMotion.playExit === 'function') {
          window.PMChatMotion.playExit(btn, 'pm-motion-exit', finishHide);
        } else {
          btn.classList.add('is-leaving');
          window.setTimeout(finishHide, 180);
        }
      }

      function collectQuestionnaireAnswer(card) {
        var free = card.querySelector('[data-q-freeform]');
        if (free) return free.value;
        var selected = card.querySelectorAll('[data-q-option][aria-checked="true"]');
        if (!selected || !selected.length) {
          /* Legacy native inputs, if any remain */
          var multiNative = card.querySelectorAll(
            'input[type="checkbox"][data-q-option]:checked'
          );
          if (multiNative && multiNative.length) {
            return Array.prototype.map.call(multiNative, function (el) {
              return el.value;
            });
          }
          var radioNative = card.querySelector(
            'input[type="radio"][data-q-option]:checked'
          );
          return radioNative ? radioNative.value : null;
        }
        var vals = Array.prototype.map.call(selected, function (el) {
          return (
            el.getAttribute('data-q-value') ||
            el.getAttribute('value') ||
            (el.textContent || '').trim()
          );
        });
        var isMulti = !!card.querySelector('[data-q-option][role="checkbox"]');
        return isMulti ? vals : vals[0];
      }

      function fillDraftRevisionsPanel(panel, tid) {
        var revs =
          (store.threads[tid] && store.threads[tid].draftRevisions) || [];
        if (!revs.length) {
          panel.innerHTML =
            '<div class="pm-composer-draft-empty">No draft revisions yet</div>';
          return;
        }
        var list = revs
          .slice()
          .reverse()
          .map(function (rev, i) {
            var idx = revs.length - 1 - i;
            var preview = String(rev.text || '');
            if (preview.length > 64) preview = preview.slice(0, 64) + '…';
            return (
              '<button type="button" class="pm-composer-draft-item" data-draft-revision-idx="' +
              idx +
              '">' +
              '<span class="pm-composer-draft-preview">' +
              escapeHtml(preview || '(empty)') +
              '</span>' +
              '<span class="pm-composer-draft-when">' +
              escapeHtml(formatLocalTime(rev.savedAt) || '') +
              '</span>' +
              '</button>'
            );
          })
          .join('');
        panel.innerHTML =
          '<div class="pm-composer-draft-head">Draft revisions · provisional (GAP-007)</div>' +
          list;
      }

      root.addEventListener('change', function (ev) {
        var t = ev.target;
        if (!t || !t.matches || !t.matches('[data-lens-select]')) return;
        /* Selection is owned by the click handler to avoid change→paint→
           bubble double-toggles. Keep checkbox visually in sync only. */
        ev.stopPropagation();
      });

      root.addEventListener('scroll', function () {
        updateJumpToLatestVisibility(root);
      }, true);
      root.addEventListener('click', function (ev) {
        var t = ev.target;
        if (!t || !t.closest) return;

        var lensSelectHost = t.closest('[data-lens-select-host], .pm-lens-select');
        if (lensSelectHost && root.contains(lensSelectHost)) {
          ev.preventDefault();
          ev.stopPropagation();
          var inputSel = lensSelectHost.querySelector('[data-lens-select]');
          var midSel = inputSel && inputSel.getAttribute('data-lens-select');
          var tidSel = activeId();
          if (midSel && tidSel && window.PMChatLens) {
            window.PMChatLens.toggleSelect(store, tidSel, midSel);
          }
          return;
        }

        var lensClear = t.closest('[data-lens-clear]');
        if (lensClear && root.contains(lensClear)) {
          clearLensOnMessage(store, activeId(), lensClear.getAttribute('data-lens-clear'));
          return;
        }

        var lensActionBtn = t.closest('[data-lens-action]');
        if (lensActionBtn && root.contains(lensActionBtn)) {
          var lensKind = lensActionBtn.getAttribute('data-lens-action');
          var tidLens = activeId();
          if (!tidLens || !window.PMChatLens) return;
          if (lensKind === 'mute') {
            var muteRes = window.PMChatLens.applyMute(store, tidLens);
            if (muteRes && muteRes.note && env.toast) env.toast(muteRes.note);
            else if (env.toast) env.toast('Muted selection');
          } else if (lensKind === 'focus') {
            var focusRes = window.PMChatLens.applyFocus(store, tidLens);
            if (focusRes && focusRes.note && env.toast) env.toast(focusRes.note);
            else if (env.toast) env.toast('Focused selection');
          } else if (lensKind === 'subcompact') {
            var summary = 'Subcompacted selection';
            var subRes = window.PMChatLens.applySubcompact(store, tidLens, summary);
            if (subRes && !subRes.ok) {
              if (env.toast) env.toast('Select messages before Subcompact');
              return;
            }
            if (subRes && subRes.note && env.toast) env.toast(subRes.note);
            else if (env.toast) env.toast('Subcompacted selection');
          } else if (lensKind === 'done') {
            window.PMChatLens.turnOff(store, tidLens);
            if (env.toast) env.toast('Context Lens done');
          }
          return;
        }

        var msgEl = t.closest('[data-message-id]');
        if (
          msgEl &&
          root.contains(msgEl) &&
          root.classList.contains('is-lens-selecting') &&
          !t.closest(
            'button, a, input, textarea, label, [data-msg-action], [data-lens-action], [data-lens-clear], [data-composer-button], [data-q-action], [data-goal-action], [data-q-option]'
          )
        ) {
          var midToggle = msgEl.getAttribute('data-message-id');
          var tidToggle = activeId();
          if (midToggle && tidToggle && window.PMChatLens) {
            window.PMChatLens.toggleSelect(store, tidToggle, midToggle);
            return;
          }
        }

        var qOpt = t.closest('[data-q-option]');
        if (qOpt && root.contains(qOpt) && !qOpt.matches('input')) {
          var role = qOpt.getAttribute('role');
          if (role === 'checkbox') {
            var on = qOpt.getAttribute('aria-checked') === 'true';
            qOpt.setAttribute('aria-checked', on ? 'false' : 'true');
            qOpt.classList.toggle('is-selected', !on);
          } else {
            var group = qOpt.closest('.pm-q-options');
            if (group) {
              Array.prototype.forEach.call(
                group.querySelectorAll('[data-q-option]'),
                function (el) {
                  el.setAttribute('aria-checked', 'false');
                  el.classList.remove('is-selected');
                }
              );
            }
            qOpt.setAttribute('aria-checked', 'true');
            qOpt.classList.add('is-selected');
          }
          return;
        }
        var draftPeekBtn = t.closest('[data-draft-revisions-peek]');
        if (draftPeekBtn && root.contains(draftPeekBtn)) {
          var panel = root.querySelector('[data-draft-revisions-panel]');
          if (!panel) return;
          var open = panel.hasAttribute('hidden');
          if (open) {
            fillDraftRevisionsPanel(panel, activeId());
            panel.removeAttribute('hidden');
            draftPeekBtn.setAttribute('aria-expanded', 'true');
          } else if (window.PMChatMotion && typeof window.PMChatMotion.leaveThenHide === 'function') {
            window.PMChatMotion.leaveThenHide(panel, 'pm-motion-exit', function () {
              draftPeekBtn.setAttribute('aria-expanded', 'false');
            });
          } else {
            panel.setAttribute('hidden', '');
            draftPeekBtn.setAttribute('aria-expanded', 'false');
          }
          return;
        }
        var draftItem = t.closest('[data-draft-revision-idx]');
        if (draftItem && root.contains(draftItem)) {
          var tidRev = activeId();
          var idx = Number(draftItem.getAttribute('data-draft-revision-idx'));
          var threadRev = store.threads[tidRev];
          var rev =
            threadRev && threadRev.draftRevisions
              ? threadRev.draftRevisions[idx]
              : null;
          if (rev && typeof store.setDraft === 'function') {
            store.setDraft(tidRev, { text: rev.text || '' });
            var input = root.querySelector('[data-composer-input]');
            if (input) input.value = rev.text || '';
            if (env.toast) env.toast('Restored draft revision');
          }
          var peekPanel = root.querySelector('[data-draft-revisions-panel]');
          var peekBtn = root.querySelector('[data-draft-revisions-peek]');
          if (peekPanel) peekPanel.setAttribute('hidden', '');
          if (peekBtn) peekBtn.setAttribute('aria-expanded', 'false');
          return;
        }
        var compactToggle = t.closest('[data-compact-toggle]');
        if (compactToggle && root.contains(compactToggle)) {
          var cid = compactToggle.getAttribute('data-compact-toggle');
          if (!local.openCompact) local.openCompact = Object.create(null);
          local.openCompact[cid] = !local.openCompact[cid];
          paint();
          return;
        }
        var attachBtn = t.closest('[data-composer-attach]');
        if (attachBtn && root.contains(attachBtn)) {
          var tidAtt = activeId();
          if (tidAtt && store.addAttachment) {
            var n = ((store.threads[tidAtt].draft && store.threads[tidAtt].draft.attachments) || [])
              .length + 1;
            var cycle = [
              {
                id: 'att-demo-' + n,
                name: 'note-' + n + '.md',
                mime: 'text/markdown',
                resolver: 'native',
                resolverLabel: 'Native'
              },
              {
                id: 'att-demo-' + n,
                name: 'clip-' + n + '.mp4',
                mime: 'video/mp4',
                resolver: 'pm_transformed',
                resolverLabel: 'PM extract frames'
              },
              {
                id: 'att-demo-' + n,
                name: 'design-' + n + '.fig',
                mime: 'application/octet-stream',
                resolver: 'alternate',
                resolverLabel: 'Alternate model'
              },
              {
                id: 'att-demo-' + n,
                name: 'blob-' + n + '.bin',
                mime: 'application/octet-stream',
                resolver: 'unsupported',
                resolverLabel: 'Unsupported'
              }
            ];
            var att = cycle[(n - 1) % cycle.length];
            store.addAttachment(tidAtt, att);
            if (att.resolver === 'unsupported' && store.session) {
              store.session.warning = {
                tier: 'modal',
                text: 'No safe route for this attachment on the current model.',
                choices: ['Remove', 'Alternate model', 'Cancel', 'Details']
              };
            }
            if (env.toast) env.toast('Attached · ' + (att.resolverLabel || att.name));
          }
          return;
        }
        var clearDraftBtn = t.closest('[data-composer-clear-draft]');
        if (clearDraftBtn && root.contains(clearDraftBtn)) {
          var tidClear = activeId();
          if (tidClear && store.clearDraft) {
            store.clearDraft(tidClear);
            var inputClear = root.querySelector('[data-composer-input]');
            if (inputClear) inputClear.value = '';
            if (env.toast) env.toast('Draft cleared');
            paint();
          }
          return;
        }
        var jumpLatest = t.closest('[data-jump-latest]');
        if (jumpLatest && root.contains(jumpLatest)) {
          var tidJump = activeId();
          var tr = root.querySelector('[data-transcript], .pm-transcript');
          if (tidJump && store.setScrollAnchor) {
            store.setScrollAnchor(tidJump, { stickToBottom: true, messageId: null, offsetPx: 0 });
          }
          if (tr) {
            restoreScrollAnchorState(root, { stickToBottom: true });
          }
          updateJumpToLatestVisibility(root);
          return;
        }
        var attachRm = t.closest('[data-attach-remove]');
        if (attachRm && root.contains(attachRm)) {
          var tidRm = activeId();
          var chip = attachRm.closest('[data-attach-idx], .pm-composer-attach-chip');
          var doRemove = function () {
            if (tidRm && store.removeAttachment) {
              store.removeAttachment(tidRm, Number(attachRm.getAttribute('data-attach-remove')) | 0);
            }
          };
          if (chip && window.PMChatMotion && typeof window.PMChatMotion.playExit === 'function') {
            window.PMChatMotion.playExit(chip, 'pm-chip-out', doRemove);
          } else {
            doRemove();
          }
          return;
        }
        var browserOpen = t.closest('[data-browser-open]');
        if (browserOpen && root.contains(browserOpen)) {
          openBrowserSession(
            env,
            store,
            activeId(),
            browserOpen.getAttribute('data-browser-open')
          );
          return;
        }
        var artBtn = t.closest('[data-artifact-open]');
        if (artBtn && root.contains(artBtn)) {
          openArtifact(env, store, activeId(), artBtn.getAttribute('data-artifact-open'));
          return;
        }
        var cwChip = t.closest('[data-cw-expand]');
        if (cwChip && root.contains(cwChip)) {
          if (
            window.PMChatV2 &&
            typeof window.PMChatV2.activateCompactWorkChip === 'function'
          ) {
            window.PMChatV2.activateCompactWorkChip(root, cwChip);
          }
          return;
        }
        var jump = t.closest('[data-jump-message]');
        if (jump && root.contains(jump)) {
          var jid = jump.getAttribute('data-jump-message');
          var elJump = root.querySelector('[data-message-id="' + jid + '"]');
          if (elJump) elJump.scrollIntoView({ block: 'center', behavior: 'smooth' });
          if (typeof options.onJump === 'function') options.onJump(jid, local);
          return;
        }
        var focusTurn = t.closest('[data-focus-turn]');
        if (focusTurn && root.contains(focusTurn)) {
          local.focusTurnId = focusTurn.getAttribute('data-focus-turn');
          paint();
          return;
        }
        var sheetDismiss = t.closest('[data-sheet-dismiss]');
        if (sheetDismiss && root.contains(sheetDismiss)) {
          var kind = sheetDismiss.getAttribute('data-sheet-dismiss');
          if (!local.dismissedSheets) local.dismissedSheets = Object.create(null);
          var sheetEl = sheetDismiss.closest('[data-sheet], .t4-sheet');
          var finishDismiss = function () {
            local.dismissedSheets[kind] = true;
            paint();
          };
          if (sheetEl && window.PMChatMotion && typeof window.PMChatMotion.playExit === 'function') {
            window.PMChatMotion.playExit(sheetEl, 'pm-motion-exit', finishDismiss);
          } else {
            finishDismiss();
          }
          return;
        }
        var sheetRestore = t.closest('[data-sheet-restore]');
        if (sheetRestore && root.contains(sheetRestore)) {
          var restoreKey = sheetRestore.getAttribute('data-sheet-restore');
          if (!local.dismissedSheets) local.dismissedSheets = Object.create(null);
          if (!restoreKey || restoreKey === '*') {
            local.dismissedSheets = Object.create(null);
          } else {
            delete local.dismissedSheets[restoreKey];
          }
          paint();
          return;
        }
        var el =
          t.closest(
            '[data-msg-action], [data-goal-action], [data-q-action], [data-composer-button]'
          );
        if (!el || !root.contains(el)) {
          if (typeof options.onClick === 'function') options.onClick(ev, buildCtx());
          return;
        }
        var tid = activeId();
        if (!tid) return;

        var msgAction = el.getAttribute('data-msg-action');
        var mid = el.getAttribute('data-message-id');
        if (msgAction === 'expand' && mid) {
          var bodyEl = root.querySelector(
            '[data-message-id="' + mid + '"] .pm-msg-body, [data-message-id="' + mid + '"] [data-msg-body]'
          );
          if (bodyEl) {
            bodyEl.classList.add('is-expanding');
            window.setTimeout(function () {
              bodyEl.classList.remove('is-expanding');
            }, 360);
          }
          var msgArt = root.querySelector('[data-message-id="' + mid + '"]');
          if (msgArt) msgArt.classList.add('is-long');
          store.toggleMessageExpanded(tid, mid);
          return;
        }
        if (msgAction === 'copy' && mid) {
          var thread = store.threads[tid];
          var msg =
            thread &&
            thread.messages.filter(function (m) {
              return m.id === mid;
            })[0];
          if (msg && navigator.clipboard) {
            navigator.clipboard.writeText(msg.body || '').catch(function () {});
          }
          if (env.toast) env.toast('Copied');
          return;
        }
        if (msgAction === 'edit' && mid) {
          var threadEdit = store.threads[tid];
          var msgEdit =
            threadEdit &&
            threadEdit.messages.filter(function (m) {
              return m.id === mid;
            })[0];
          if (msgEdit && store.setDraft) {
            store.setDraft(tid, { text: msgEdit.body || '', editingMessageId: mid });
            var inputEdit = root.querySelector('[data-composer-input]');
            if (inputEdit) {
              inputEdit.value = msgEdit.body || '';
              inputEdit.focus();
            }
            if (env.toast) env.toast('Editing · send to rewind later turns (demo)');
          } else if (env.toast) {
            env.toast('Edit is provisional in this concept');
          }
          return;
        }
        if (msgAction === 'more-info' && mid) {
          var panelMore = root.querySelector('[data-more-info="' + mid + '"]');
          if (panelMore) {
            if (panelMore.hidden) {
              panelMore.hidden = false;
              panelMore.removeAttribute('aria-hidden');
            } else if (window.PMChatMotion && typeof window.PMChatMotion.leaveThenHide === 'function') {
              window.PMChatMotion.leaveThenHide(panelMore, 'pm-motion-exit');
            } else {
              panelMore.hidden = true;
            }
          }
          return;
        }

        var goalAction = el.getAttribute('data-goal-action');
        if (goalAction) {
          if (goalAction === 'edit-save') {
            var inputSave = root.querySelector('[data-goal-edit-input]');
            var gSave = store.threads[tid] && store.threads[tid].goal;
            if (gSave && inputSave) {
              gSave.objective = inputSave.value;
              gSave.title = String(inputSave.value || '').trim().slice(0, 80) || gSave.title;
            }
          }
          store.goalAction(tid, goalAction);
          return;
        }

        var qAction = el.getAttribute('data-q-action');
        if (qAction) {
          var card = el.closest('[data-questionnaire-id]');
          if (qAction === 'submit' && card) {
            var qid = card.getAttribute('data-question-id');
            var answer = collectQuestionnaireAnswer(card);
            var finishSubmit = function () {
              if (typeof store.answerAndAdvanceQuestionnaire === 'function') {
                store.answerAndAdvanceQuestionnaire(tid, qid, answer);
              } else {
                if (qid) store.answerQuestion(tid, qid, answer);
                store.submitQuestionnaire(tid);
              }
            };
            var qLive =
              tid && typeof store.getActiveQuestionnaire === 'function'
                ? store.getActiveQuestionnaire(tid)
                : null;
            var qIdx = qLive ? qLive.currentQuestionIndex | 0 : 0;
            var qTotal = qLive && qLive.questions ? qLive.questions.length : 0;
            var isLast = !qLive || qIdx >= qTotal - 1;
            var reducedQ =
              window.PMChatMotion && typeof window.PMChatMotion.isReduced === 'function'
                ? window.PMChatMotion.isReduced()
                : false;
            if (!reducedQ && card.classList.contains('pm-q-stage')) {
              if (isLast) {
                runQuestionnaireSettle(card, finishSubmit);
              } else {
                runQuestionnaireCarousel(card, finishSubmit);
              }
            } else {
              finishSubmit();
            }
          } else if (qAction === 'skip') {
            runQuestionnaireCarousel(card, function () {
              store.skipQuestion(tid);
            });
          } else if (qAction === 'cancel') {
            runQuestionnaireExit(card, function () {
              store.cancelQuestionnaire(tid);
            });
          }
          return;
        }

        if (el.hasAttribute('data-composer-button') && window.PMChatComposer) {
          if (el.getAttribute('data-mode') === 'stop') window.PMChatComposer.stop(store, tid);
          else window.PMChatComposer.send(store, tid);
        }
      });

      root.addEventListener('toggle', function (ev) {
        var det = ev.target;
        if (!det || !det.matches) return;
        var tid = activeId();
        if (!tid) return;
        var ui = threadUi(tid);
        if (det.matches('[data-subagent-id]')) {
          var sid = det.getAttribute('data-subagent-id');
          if (!ui.expandedSubagentIds) ui.expandedSubagentIds = Object.create(null);
          ui.expandedSubagentIds[sid] = !!det.open;
        }
        if (det.matches('[data-thought-id]')) {
          var th = det.getAttribute('data-thought-id');
          if (!ui.expandedThoughtIds) ui.expandedThoughtIds = Object.create(null);
          ui.expandedThoughtIds[th] = !!det.open;
        }
        if (
          det.open &&
          det.matches('details.pm-work-surface, details.pm-thought, details.pm-folio-leaf') &&
          window.PMChatMotion &&
          typeof window.PMChatMotion.stagger === 'function'
        ) {
          var body = det.querySelector('.pm-work-surface-body, .pm-thought-body');
          if (body) window.PMChatMotion.stagger(body, 'li, .pm-goal-section, p, button');
        }
      });

      slotEl.innerHTML = '';
      slotEl.appendChild(root);
      if (typeof options.applyWidth === 'function') {
        options.applyWidth(root, contentWidthPx);
      }
      paint();

      return {
        update: function (next) {
          if (next && next.env) env = next.env;
          if (next && next.contentWidthPx != null) {
            contentWidthPx = next.contentWidthPx;
            if (typeof options.applyWidth === 'function') {
              options.applyWidth(root, contentWidthPx);
            }
          }
          store = env.store;
          var focusedEl = document.activeElement;
          var focused =
            focusedEl &&
            root.contains(focusedEl) &&
            focusedEl.matches(
              '[data-composer-input], [data-q-freeform], textarea, select, input:not([data-lens-select])'
            );
          if (focused) {
            var tid = activeId();
            var btn = root.querySelector('[data-composer-button]');
            if (btn && window.PMChatComposer) {
              var mode = window.PMChatComposer.buttonMode(store, tid);
              btn.setAttribute('data-mode', mode);
              btn.setAttribute('aria-label', mode === 'stop' ? 'Stop' : 'Send');
              btn.setAttribute('title', mode === 'stop' ? 'Stop' : 'Send');
              btn.innerHTML =
                (typeof window.PMIcon === 'function'
                  ? window.PMIcon(mode === 'stop' ? 'stop' : 'arrowUp', 'pm-btn-icon')
                  : '') +
                '<span class="pm-composer-btn-label">' +
                (mode === 'stop' ? 'Stop' : 'Send') +
                '</span>';
            }
            var live = root.querySelector('[data-activity-live]');
            var running =
              store.demo && store.demo.runningByThread
                ? store.demo.runningByThread[tid]
                : null;
            var liveHost =
              root.querySelector('[data-live-host]') ||
              root.querySelector('[data-transcript]');
            if (liveHost && running && !running.stopped && !live) {
              liveHost.insertAdjacentHTML('beforeend', renderActivityLive(running));
            } else if (live && (!running || running.stopped)) {
              live.remove();
            } else if (live && running && !running.stopped) {
              var title = live.querySelector('.pm-activity-live-title, .pm-activity-live-line');
              if (title) {
                title.textContent =
                  (running.workingSummary ||
                    running.summary ||
                    running.label ||
                    'Working') + ' · Grok 4.5';
              }
            }
            /* Lens/goal chrome must still refresh while composer is focused. */
            injectLensUi(buildCtx());
            syncGoalStrip(root, store, tid);
            updateJumpToLatestVisibility(root);
            if (typeof options.onFocusedUpdate === 'function') {
              options.onFocusedUpdate(buildCtx());
            }
            return;
          }
          paint();
        },
        unmount: function () {
          if (composerBound) composerBound.unbind();
          slotEl.innerHTML = '';
        },
        restoreScrollAnchor: function () {
          var tid = activeId();
          var ui = threadUi(tid);
          var anchor = ui && ui.scrollAnchor;
          var q =
            tid && store && typeof store.getActiveQuestionnaire === 'function'
              ? store.getActiveQuestionnaire(tid)
              : null;
          if (q || (anchor && anchor.stickToBottom) || (!anchor && ui && ui.stickToBottom !== false)) {
            scrollTranscriptToBottomAfterPaint(root, function () {
              updateJumpToLatestVisibility(root);
            });
            return;
          }
          if (anchor) {
            restoreScrollAnchorState(root, {
              messageId: anchor.messageId,
              offsetPx: anchor.offsetPx,
              scrollTop: anchor.scrollTop,
              stickToBottom: !!anchor.stickToBottom
            });
            return;
          }
          restoreScrollAnchorState(root, captureScrollAnchor(root));
        }
      };
    };
  }

  /** Minimal labeled thread used by stub modules. */
  function mountStubThread(slotEl, props, meta) {
    props = props || {};
    meta = meta || {};
    var env = props.env || {};
    var store = env.store;
    slotEl.innerHTML = '';
    var root = document.createElement('div');
    root.className = 'pm-thread pm-thread-stub';
    root.setAttribute('data-thread-module', meta.id || '');

    function paint() {
      var tid = store && store.session && store.session.activeThreadKey;
      var msgs =
        store && tid && typeof store.getVisibleMessages === 'function'
          ? store.getVisibleMessages(tid)
          : [];
      var ui = (store && store.ui && store.ui.perThread && store.ui.perThread[tid]) || {};
      var running = store && store.demo && store.demo.runningByThread
        ? store.demo.runningByThread[tid]
        : null;
      var q =
        store && tid && typeof store.getActiveQuestionnaire === 'function'
          ? store.getActiveQuestionnaire(tid)
          : null;
      var preAnchor = captureScrollAnchor(root);
      root.innerHTML =
        '<div class="pm-thread-label">' +
        escapeHtml((meta.label || meta.id || 'Thread') + ' · Grok 4.5') +
        '</div>' +
        '<div class="pm-transcript pm-scroll" data-transcript>' +
        msgs
          .map(function (m) {
            return renderMessage(m, ui, { active: !!(running && !running.stopped) });
          })
          .join('') +
        renderActivityLive(running) +
        '</div>' +
        (!q && tid && store.threads[tid]
          ? '<div class="pm-thread-surfaces" data-surfaces>' +
            renderGoal(store.threads[tid].goal, ui) +
            renderTodo(store.threads[tid].todos) +
            renderSubagents(
              store.threads[tid].subagentGroups,
              ui.expandedSubagentIds || {}
            ) +
            renderDiffs(store.threads[tid].diffGroups) +
            '</div>'
          : '') +
        renderGoalStrip(tid && store.threads[tid]) +
        renderDock(store, tid, q);
      var stickAfter = shouldStickTranscriptToBottom({ q: q, ui: ui }, preAnchor);
      armQuestionnaireMorph(root);
      if (stickAfter) {
        scrollTranscriptToBottomAfterPaint(root, function () {
          if (window.PMChatMotion && typeof window.PMChatMotion.refresh === 'function') {
            window.PMChatMotion.refresh(root);
          }
        });
        return;
      }
      requestAnimationFrame(function () {
        if (window.PMChatMotion && typeof window.PMChatMotion.refresh === 'function') {
          window.PMChatMotion.refresh(root);
        }
      });
    }

    paint();
    slotEl.appendChild(root);

    root.addEventListener('click', function (ev) {
      var btn = ev.target && ev.target.closest && ev.target.closest('[data-msg-action], [data-goal-action], [data-q-action], [data-composer-button]');
      if (!btn || !root.contains(btn)) return;
      var tid = store.session.activeThreadKey;
      var msgAction = btn.getAttribute('data-msg-action');
      var goalAction = btn.getAttribute('data-goal-action');
      var qAction = btn.getAttribute('data-q-action');
      if (msgAction === 'expand' && btn.getAttribute('data-message-id')) {
        store.toggleMessageExpanded(tid, btn.getAttribute('data-message-id'));
      }
      if (msgAction === 'copy') {
        var id = btn.getAttribute('data-message-id');
        var thread = store.threads[tid];
        var msg =
          thread &&
          thread.messages.filter(function (m) {
            return m.id === id;
          })[0];
        if (msg && navigator.clipboard) {
          navigator.clipboard.writeText(msg.body || '').catch(function () {});
        }
        if (env.toast) env.toast('Copied');
      }
      if (msgAction === 'more-info') {
        var panel = root.querySelector(
          '[data-more-info="' + btn.getAttribute('data-message-id') + '"]'
        );
        if (panel) {
          if (panel.hidden) {
            panel.hidden = false;
            panel.removeAttribute('aria-hidden');
          } else if (window.PMChatMotion && typeof window.PMChatMotion.leaveThenHide === 'function') {
            window.PMChatMotion.leaveThenHide(panel, 'pm-motion-exit');
          } else {
            panel.hidden = true;
          }
        }
      }
      if (goalAction) {
        if (goalAction === 'edit-save') {
          var inputSave2 = root.querySelector('[data-goal-edit-input]');
          var gSave2 = store.threads[tid] && store.threads[tid].goal;
          if (gSave2 && inputSave2) {
            gSave2.objective = inputSave2.value;
            gSave2.title = String(inputSave2.value || '').trim().slice(0, 80) || gSave2.title;
          }
        }
        store.goalAction(tid, goalAction);
      }
      if (qAction === 'submit') {
        var cardStub = btn.closest('[data-questionnaire-id]');
        var qidStub = cardStub && cardStub.getAttribute('data-question-id');
        var finishStubSubmit = function () {
          var free = cardStub && cardStub.querySelector('[data-q-freeform]');
          var ans = free ? free.value : null;
          if (ans == null && cardStub) {
            var sel = cardStub.querySelector(
              '.pm-q-option.is-selected, .pm-q-option[aria-checked="true"]'
            );
            ans = sel ? sel.getAttribute('data-q-value') : '';
          }
          if (typeof store.answerAndAdvanceQuestionnaire === 'function') {
            store.answerAndAdvanceQuestionnaire(tid, qidStub, ans);
          } else {
            if (qidStub && typeof store.answerQuestion === 'function') {
              store.answerQuestion(tid, qidStub, ans);
            }
            store.submitQuestionnaire(tid);
          }
        };
        var qStub =
          tid && typeof store.getActiveQuestionnaire === 'function'
            ? store.getActiveQuestionnaire(tid)
            : null;
        var stubIdx = qStub ? qStub.currentQuestionIndex | 0 : 0;
        var stubTotal = qStub && qStub.questions ? qStub.questions.length : 0;
        var stubLast = !qStub || stubIdx >= stubTotal - 1;
        var reducedStub =
          window.PMChatMotion && typeof window.PMChatMotion.isReduced === 'function'
            ? window.PMChatMotion.isReduced()
            : false;
        if (cardStub && !reducedStub && cardStub.classList.contains('pm-q-stage')) {
          if (stubLast) runQuestionnaireSettle(cardStub, finishStubSubmit);
          else runQuestionnaireCarousel(cardStub, finishStubSubmit);
        } else {
          finishStubSubmit();
        }
      } else if (qAction === 'skip') {
        runQuestionnaireCarousel(btn.closest('[data-questionnaire-id]'), function () {
          store.skipQuestion(tid);
        });
      } else if (qAction === 'cancel') {
        runQuestionnaireExit(btn.closest('[data-questionnaire-id]'), function () {
          store.cancelQuestionnaire(tid);
        });
      }
      if (btn.hasAttribute('data-composer-button') && window.PMChatComposer) {
        var mode = btn.getAttribute('data-mode');
        if (mode === 'stop') window.PMChatComposer.stop(store, tid);
        else window.PMChatComposer.send(store, tid);
      }
    });

    var composerBound = null;
    function rebindComposer() {
      if (composerBound) composerBound.unbind();
      if (!window.PMChatComposer) return;
      composerBound = window.PMChatComposer.bind({
        store: store,
        getThreadId: function () {
          return store.session.activeThreadKey;
        },
        getComposerEls: function () {
          return {
            input: root.querySelector('[data-composer-input]'),
            button: root.querySelector('[data-composer-button]')
          };
        },
        onRender: paint
      });
    }
    rebindComposer();

    return {
      update: function (next) {
        if (next && next.env) env = next.env;
        store = env.store;
        var focused =
          document.activeElement &&
          root.contains(document.activeElement) &&
          document.activeElement.matches('[data-composer-input], [data-q-freeform], input, textarea');
        if (focused) {
          var tid = store.session && store.session.activeThreadKey;
          var btn = root.querySelector('[data-composer-button]');
          if (btn && window.PMChatComposer) {
            var mode = window.PMChatComposer.buttonMode(store, tid);
            btn.setAttribute('data-mode', mode);
            btn.setAttribute('aria-label', mode === 'stop' ? 'Stop' : 'Send');
            btn.setAttribute('title', mode === 'stop' ? 'Stop' : 'Send');
            btn.innerHTML =
              (typeof window.PMIcon === 'function'
                ? window.PMIcon(mode === 'stop' ? 'stop' : 'arrowUp', 'pm-btn-icon')
                : '') +
              '<span class="pm-composer-btn-label">' +
              (mode === 'stop' ? 'Stop' : 'Send') +
              '</span>';
          }
          return;
        }
        paint();
        rebindComposer();
      },
      unmount: function () {
        if (composerBound) composerBound.unbind();
        slotEl.innerHTML = '';
      },
      restoreScrollAnchor: function () {
        var tid = store && store.session && store.session.activeThreadKey;
        var ui = store && store.ui && store.ui.perThread && store.ui.perThread[tid];
        var anchor = ui && ui.scrollAnchor;
        var q =
          tid && store && typeof store.getActiveQuestionnaire === 'function'
            ? store.getActiveQuestionnaire(tid)
            : null;
        if (q || (anchor && anchor.stickToBottom) || (!anchor && ui && ui.stickToBottom !== false)) {
          scrollTranscriptToBottomAfterPaint(root);
          return;
        }
        if (anchor) {
          restoreScrollAnchorState(root, {
            messageId: anchor.messageId,
            offsetPx: anchor.offsetPx,
            scrollTop: anchor.scrollTop,
            stickToBottom: !!anchor.stickToBottom
          });
        }
      }
    };
  }

  window.PMChatThreadKit = {
    escapeHtml: escapeHtml,
    renderBodyHtml: renderBodyHtml,
    formatDuration: formatDuration,
    formatLocalTime: formatLocalTime,
    formatStatus: formatStatus,
    renderMessage: renderMessage,
    renderHoverRow: renderHoverRow,
    renderJumpToLatest: renderJumpToLatest,
    renderActivityLive: renderActivityLive,
    renderActivityHistory: renderActivityHistory,
    renderGoal: renderGoal,
    renderGoalStrip: renderGoalStrip,
    renderTodo: renderTodo,
    renderSubagents: renderSubagents,
    renderDiffs: renderDiffs,
    renderQuestionnaire: renderQuestionnaire,
    armQuestionnaireMorph: armQuestionnaireMorph,
    runQuestionnaireExit: runQuestionnaireExit,
    runQuestionnaireCarousel: runQuestionnaireCarousel,
    runQuestionnaireSettle: runQuestionnaireSettle,
    renderComposer: renderComposer,
    renderDock: renderDock,
    renderThoughts: renderThoughts,
    renderMoreInfoPanel: renderMoreInfoPanel,
    renderArtifacts: renderArtifacts,
    renderBrowserSessions: renderBrowserSessions,
    renderWorkSurfaces: renderWorkSurfaces,
    renderCompactWork: function (thread, paradigm) {
      return window.PMChatV2 && window.PMChatV2.renderCompactWorkBand
        ? window.PMChatV2.renderCompactWorkBand(thread, paradigm)
        : '';
    },
    openArtifact: openArtifact,
    groupTurns: groupTurns,
    searchHighlightId: searchHighlightId,
    applySearchHit: applySearchHit,
    lensShapeOf: lensShapeOf,
    isLensSelecting: isLensSelecting,
    renderLensBar: renderLensBar,
    renderLensChip: renderLensChip,
    injectLensUi: injectLensUi,
    clearLensOnMessage: clearLensOnMessage,
    withAnchor: withAnchor,
    captureScrollAnchor: captureScrollAnchor,
    restoreScrollAnchorState: restoreScrollAnchorState,
    shouldStickTranscriptToBottom: shouldStickTranscriptToBottom,
    scrollTranscriptToBottomAfterPaint: scrollTranscriptToBottomAfterPaint,
    createThreadMount: createThreadMount,
    mountStubThread: mountStubThread,
    MODEL: MODEL
  };
})();

