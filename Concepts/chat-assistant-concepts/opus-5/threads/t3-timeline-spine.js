/* t3 "Timeline Spine" — Opus 5
 *
 * A single continuous, NEUTRAL vertical line runs the full height of the transcript. Every
 * turn hangs an SVG node marker off that line; prose sits to the right of the marker. The
 * line itself never changes color, never thickens, never encodes selection or status — it is
 * pure structure, identical on every turn, so it can never become a left-side accent bar by
 * another name.
 *
 * A conversational turn (user or assistant) gets a filled CIRCLE marker. An execution unit —
 * the tool-use work that produced a reply — gets a filled SQUARE marker instead, inserted on
 * the spine directly above the assistant turn it belongs to. That shape difference is the
 * entire signal for "this is not prose, it is work"; everything else (who is speaking, what
 * state a unit is in) is a plain text label next to the marker, never a color.
 *
 * Goal, Todo, subagents, diffs, and artifacts are thread-level state, not discrete chronological
 * events, so they do not get their own timestamped spine entries. They render as a short run
 * of status nodes appended at the foot of the spine (the "now" end) when there is no
 * work-surface host, or into the host itself when there is one.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }

  /* Collapse rule for this concept: eligibility at 800 characters, preview clamped to 5
   * lines. Every entry on the spine already carries a marker and a meta line of its own, so
   * the preview is kept tighter than a typographic concept would need, in order to keep
   * several turns of rhythm visible together on the timeline at once. */
  var COLLAPSE_ELIGIBLE_CHARS = 800;
  var PREVIEW_LINES = 5;

  function T3Thread(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.rendered = {};       /* msgId -> { el, bodyEl, proseEl } */
    this.lastThreadId = null;
    this.build();
  }

  T3Thread.prototype._on = function (el, ev, fn, opts) {
    this.offs.push(U().on(el, ev, fn, opts));
  };

  T3Thread.prototype.build = function () {
    var self = this;
    var u = U();

    this.root = u.el('div', { class: 't3-root' });

    this.head = u.el('div', { class: 't3-head' }, [
      u.el('span', { class: 't3-head-name', text: 'Timeline Spine' }),
      u.el('span', { class: 't3-head-model', text: this.ctx.label })
    ]);
    this.root.appendChild(this.head);

    this.scroller = u.el('div', { class: 't3-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't3-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    this.inlineQuestion = u.el('div', { class: 't3-inline-question' });
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);

    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t3-row',
      messageAttr: 'data-pmx-msg'
    });

    this.jumpBtn = u.el('button', { class: 't3-jump', text: 'Jump to latest' });
    this._on(this.jumpBtn, 'click', function () {
      self.scrollCtl.scrollToBottom ? self.scrollCtl.scrollToBottom() :
        (self.scroller.scrollTop = self.scroller.scrollHeight);
    });
    /* The pill lives in its OWN lane directly after the scroller, not floating over it.
     * Floating meant the pill sat on top of whatever line happened to be at the bottom of
     * the viewport mid-scroll — measured covering prose at 17 of 24 scroll positions. The
     * lane is a permanent flex item, so the transcript viewport never changes height and
     * the overlap is impossible by construction rather than by clearance arithmetic. */
    this.jumpLane = u.el('div', { class: 't3-jump-lane' });
    this.jumpLane.appendChild(this.jumpBtn);
    this.root.insertBefore(this.jumpLane, this.scroller.nextSibling);
    if (this.scrollCtl.onAwayChange) {
      this.scrollCtl.onAwayChange(function (away) {
        self.jumpBtn.setAttribute('data-visible', away ? '1' : '0');
      });
    }

    this._tickOff = this.ctx.services.runtime.onTick(function () { self.syncLive(); });

    this.renderThread();
  };

  T3Thread.prototype.tid = function () {
    return this.ctx.store.get('session.activeThreadId');
  };

  /* ---------------------------------------------------------------- markers */

  /* The only two marker shapes on the spine. Both are neutral (currentColor, inherited text
   * color) and identical across every turn/unit of the same kind — no theme, state, or
   * selection ever changes their color. */
  T3Thread.prototype.markerNode = function (kind) {
    return this.ctx.services.icons.get(kind === 'unit' ? 'square' : 'dot', 15);
  };

  /* ---------------------------------------------------------------- rendering */

  T3Thread.prototype.renderThread = function () {
    var tid = this.tid();
    var data = this.ctx.data;
    var view = this.ctx.store.view(tid);
    var msgs = data.visibleSlice(tid, view.loadedFrom);

    U().empty(this.list);
    this.rendered = {};
    this.lastThreadId = tid;
    /* The live indicator node, if any, was just detached along with everything else in the
     * list. Drop the stale reference so syncLive() below rebuilds a properly attached one
     * instead of quietly updating an orphaned element that is no longer on screen. */
    this.liveEl = null;

    var thread = data.threadById(tid);
    var hidden = thread ? Math.max(0, thread.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlderNotice(hidden));

    for (var i = 0; i < msgs.length; i++) {
      var msg = msgs[i];
      var svc = this.ctx.services;
      var group = svc.surfaces && svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : null;
      if (msg.role === 'assistant' && group) {
        this.list.appendChild(this.buildActivityUnit(msg, group));
      }
      this.list.appendChild(this.buildTurn(msg));
    }

    this.surfacesTail = U().el('div', { class: 't3-tail' });
    this.list.appendChild(this.surfacesTail);

    this.renderSurfaces();
    this.renderQuestion();
    this.syncLive();
  };

  T3Thread.prototype.buildOlderNotice = function (hidden) {
    var self = this;
    var u = U();
    var btn = u.el('button', {
      class: 't3-older',
      text: 'Load ' + hidden.toLocaleString() + ' earlier messages'
    });
    this._on(btn, 'click', function () {
      var tid = self.tid();
      var view = self.ctx.store.view(tid);
      var thread = self.ctx.data.threadById(tid);
      var current = view.loadedFrom == null
        ? thread.messages.length - thread.initialVisibleMessageCount
        : view.loadedFrom;
      view.loadedFrom = Math.max(0, current - 100);
      self.scrollCtl.preserveAcross(self.list, function () { self.renderThread(); });
    });
    return u.el('div', { class: 't3-older-wrap' }, [btn]);
  };

  /* An execution-unit row: square marker, condensed label, worked time. Opens the full stage
   * list on click. It is not a turn — it carries no hover row and is not itself editable. */
  T3Thread.prototype.buildActivityUnit = function (msg, group) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var row = u.el('div', {
      class: 't3-unit',
      data: { 'pmx-unit': msg.id + '-activity' }
    });
    row.appendChild(u.el('div', { class: 't3-marker' }, [this.markerNode('unit')]));
    var content = u.el('div', { class: 't3-unit-content' });
    var btn = u.el('button', { class: 't3-unit-btn' }, [
      u.el('span', { class: 't3-unit-kind', text: 'Execution' }),
      u.el('span', { class: 't3-unit-label', text: svc.surfaces && svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : 'Activity' }),
      u.el('span', { class: 't3-unit-dur', text: group.workedSeconds != null ? F().duration(group.workedSeconds) : '' })
    ]);
    this._on(btn, 'click', function (ev) {
      svc.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 320,
        build: function (host) { self.buildActivityDetail(host, group); }
      });
    });
    content.appendChild(btn);
    row.appendChild(content);
    return row;
  };

  T3Thread.prototype.buildTurn = function (msg) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var isUser = msg.role === 'user';
    var lensState = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;

    var row = u.el('div', {
      class: ['t3-row', 'pmx-msg'],
      /* Quoted, already-hyphenated keys: setAttribute lowercases an HTML attribute name
       * without inserting hyphens at camelCase boundaries, so pmxMsg would land as
       * data-pmxmsg and silently break the data-pmx-msg lookup scroll.attach() depends on. */
      data: { 'pmx-msg': msg.id, 'pmx-role': msg.role, lens: lensState || '' }
    });

    row.appendChild(u.el('div', { class: 't3-marker' }, [this.markerNode('turn')]));

    var body = u.el('div', { class: ['t3-body', 'pmx-msg-body'] });

    var meta = u.el('div', { class: 't3-meta' }, [
      u.el('span', { class: 't3-role-label', text: isUser ? 'You' : 'Assistant' })
    ]);
    if (msg.stopped) meta.appendChild(u.el('span', { class: 't3-meta-status', text: 'Stopped' }));
    body.appendChild(meta);

    var eligible = (msg.body || '').length >= COLLAPSE_ELIGIBLE_CHARS;
    var expanded = !!this.ctx.store.view(this.tid()).expanded[msg.id];

    var prose = u.el('div', { class: 't3-prose' });
    this.writeProse(prose, msg.body || '');
    body.appendChild(prose);

    if (eligible) {
      body.setAttribute('data-collapsible', '1');
      body.setAttribute('data-expanded', expanded ? '1' : '0');
      var toggle = u.el('button', { class: 't3-more', text: expanded ? 'Show less' : 'Show more' });
      this._on(toggle, 'click', function () { self.setExpanded(msg.id, !self.isExpanded(msg.id)); });
      body.appendChild(toggle);
    }

    /* Thought stream: an inline disclosure using the store's dedicated per-message expansion
     * slot, collapsed by default. Never claims access to hidden model reasoning — only
     * provider-exposed summaries are shown. */
    if (msg.thoughtSegments && msg.thoughtSegments.length) {
      body.appendChild(this.buildThoughtBlock(msg));
    }

    /* Completed questionnaire stays inline in history as a compact, inspectable record. */
    if (msg.completedQuestionnaire) {
      body.appendChild(this.buildAnsweredInline(msg.completedQuestionnaire));
    }

    row.appendChild(body);

    var hoverRow = global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage(),
      onEdit: function () { svc.toast.show('Editing replaces this message and supersedes the turn'); }
    });
    row.appendChild(hoverRow);

    this.rendered[msg.id] = { el: row, bodyEl: body, proseEl: prose };
    return row;
  };

  T3Thread.prototype.writeProse = function (host, text) {
    var u = U();
    var paras = String(text).split(/\n{2,}/);
    for (var i = 0; i < paras.length; i++) {
      var p = paras[i].replace(/\n/g, ' ').trim();
      if (!p) continue;
      host.appendChild(u.el('p', { class: 't3-p', text: p }));
    }
    if (!host.childNodes.length) host.appendChild(u.el('p', { class: 't3-p', text: text }));
  };

  T3Thread.prototype.lastMessage = function () {
    var msgs = this.ctx.data.messagesFor(this.tid());
    return msgs[msgs.length - 1];
  };

  /* ---------------------------------------------------------------- thought (inline toggle) */

  T3Thread.prototype.buildThoughtBlock = function (msg) {
    var self = this;
    var u = U();
    var tid = this.tid();
    var thoughtView = this.ctx.store.view(tid).thought;
    var open = !!thoughtView.expanded[msg.id];

    var wrap = u.el('div', { class: 't3-thought', data: { open: open ? '1' : '0' } });
    var n = msg.thoughtSegments.length;
    var toggle = u.el('button', { class: 't3-thought-toggle' }, [
      u.el('span', { class: 't3-thought-label', text: 'Thought · ' + n + (n === 1 ? ' segment' : ' segments') }),
      u.el('span', { class: 't3-thought-chevron' }, [this.ctx.services.icons.get(open ? 'chevron-up' : 'chevron-down', 12)])
    ]);
    var body = u.el('div', { class: 't3-thought-body pmx-scroll' });
    this.fillThoughtBody(body, msg.thoughtSegments);
    if (!open) body.style.display = 'none';

    this._on(toggle, 'click', function () {
      var next = !thoughtView.expanded[msg.id];
      thoughtView.expanded[msg.id] = next;
      wrap.setAttribute('data-open', next ? '1' : '0');
      var chevronHost = toggle.querySelector('.t3-thought-chevron');
      U().empty(chevronHost);
      chevronHost.appendChild(self.ctx.services.icons.get(next ? 'chevron-up' : 'chevron-down', 12));
      if (next) body.style.display = '';
      self.ctx.services.motion.collapseTo(body, next, { collapsedHeight: 0, onDone: function () {
        if (!next) body.style.display = 'none';
      } });
    });

    wrap.appendChild(toggle);
    wrap.appendChild(body);
    return wrap;
  };

  T3Thread.prototype.fillThoughtBody = function (host, segments) {
    var u = U();
    segments.forEach(function (seg) {
      host.appendChild(u.el('div', { class: 't3-thought-row' }, [
        u.el('span', { class: 't3-thought-status', text: F().label(seg.status) }),
        u.el('span', { class: 't3-thought-summary', text: seg.summary || seg.label || '' })
      ]));
    });
    host.appendChild(u.el('div', { class: 't3-thought-note', text: 'Provider-exposed summary only.' }));
  };

  /* ---------------------------------------------------------------- answered questionnaire (inline) */

  T3Thread.prototype.buildAnsweredInline = function (q) {
    var u = U();
    var wrap = u.el('div', { class: 't3-answered' });
    wrap.appendChild(u.el('div', { class: 't3-answered-label', text: 'Question answered' }));
    (q.questionsAndAnswers || []).forEach(function (qa) {
      wrap.appendChild(u.el('div', { class: 't3-qa' }, [
        u.el('div', { class: 't3-qa-q', text: qa.question }),
        u.el('div', { class: 't3-qa-a', text: qa.answer })
      ]));
    });
    return wrap;
  };

  T3Thread.prototype.buildActivityDetail = function (host, group) {
    var u = U();
    var svc = this.ctx.services;
    host.appendChild(u.el('div', { class: 't3-sheet-title', text: 'What this turn did' }));
    var stages = svc.surfaces && svc.surfaces.activityStages ? svc.surfaces.activityStages(group) : (group.stages || []);
    var list = u.el('div', { class: 't3-sheet-list pmx-scroll' });
    stages.forEach(function (st) {
      list.appendChild(u.el('div', { class: 't3-sheet-row' }, [
        u.el('span', { class: 't3-sheet-kind', text: F().label(st.kind) }),
        u.el('span', { class: 't3-sheet-label', text: st.label || '' }),
        u.el('span', { class: 't3-sheet-dur', text: st.durationSeconds != null ? F().duration(st.durationSeconds) : '' })
      ]));
    });
    host.appendChild(list);
    if (group.workedSeconds != null) {
      host.appendChild(u.el('div', { class: 't3-sheet-foot', text: 'Worked for ' + F().duration(group.workedSeconds) }));
    }
  };

  /* ---------------------------------------------------------------- thread-level surfaces (spine foot) */

  T3Thread.prototype.renderSurfaces = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var active = svc.surfaces ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());

    function each(v) { return v == null ? [] : (Object.prototype.toString.call(v) === '[object Array]' ? v : [v]); }

    var entries = [];
    if (active && active.goal) entries.push({ kind: 'goal', label: 'Goal · ' + F().label(active.goal.status), build: function (h, api) { self.buildGoalDetail(h, active.goal, api); } });
    if (active && active.todo) {
      var done = (active.todo.items || []).filter(function (i) { return i.state === 'complete'; }).length;
      entries.push({ kind: 'todo', label: 'Todo · ' + done + ' of ' + (active.todo.items || []).length, build: function (h) { self.buildTodoDetail(h, active.todo); } });
    }
    if (active) {
      each(active.subagents).forEach(function (g) {
        var c = g.counts || {};
        var parts = [];
        if (c.working) parts.push(c.working + ' working');
        if (c.complete) parts.push(c.complete + ' complete');
        if (c.blocked) parts.push(c.blocked + ' blocked');
        if (c.waiting) parts.push(c.waiting + ' waiting for parent');
        entries.push({ kind: 'subagents', label: 'Agents · ' + (parts.join(', ') || 'none active'), build: function (h) { self.buildAgentsDetail(h, g); } });
      });
      each(active.diffs).forEach(function (g) {
        var files = g.files || [];
        entries.push({ kind: 'diff', label: 'Changes · ' + files.length + (files.length === 1 ? ' file' : ' files'), build: function (h) { self.buildDiffDetail(h, g); } });
      });
    }
    if (thread && thread.artifacts && thread.artifacts.length) {
      entries.push({ kind: 'artifacts', label: 'Artifacts · ' + thread.artifacts.length, build: function (h) { self.buildArtifactsDetail(h, thread.artifacts); } });
    }

    if (this.ctx.capabilities.workSurfaceHost) {
      var hostEl = this.ctx.regions.workSurfaceHost;
      U().empty(hostEl);
      entries.forEach(function (e) { hostEl.appendChild(self.buildSurfaceNode(e, true)); });
      if (this.surfacesTail) U().empty(this.surfacesTail);
      return;
    }

    if (!this.surfacesTail) return;
    U().empty(this.surfacesTail);
    entries.forEach(function (e) { self.surfacesTail.appendChild(self.buildSurfaceNode(e, false)); });
  };

  /* A thread-level surface entry, styled with the same square execution-unit marker as
   * activity: it too is "work", just not a discrete timestamped moment. inHost drops the
   * marker/spine framing since a work-surface host is its own region, outside the transcript. */
  T3Thread.prototype.buildSurfaceNode = function (entry, inHost) {
    var self = this;
    var u = U();
    var row = u.el('div', { class: inHost ? 't3-host-unit' : 't3-unit', data: { surface: entry.kind } });
    if (!inHost) row.appendChild(u.el('div', { class: 't3-marker' }, [this.markerNode('unit')]));
    var content = inHost ? row : u.el('div', { class: 't3-unit-content' });
    var btn = u.el('button', { class: 't3-unit-btn' }, [
      u.el('span', { class: 't3-unit-label', text: entry.label })
    ]);
    this._on(btn, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 340,
        build: function (host, api) { entry.build(host, api); }
      });
    });
    content.appendChild(btn);
    if (!inHost) row.appendChild(content);
    return row;
  };

  T3Thread.prototype.buildGoalDetail = function (host, goal, api) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    U().empty(host);
    host.appendChild(u.el('div', { class: 't3-sheet-title', text: 'Goal' }));
    var body = u.el('div', { class: 't3-goal' });
    body.appendChild(u.el('div', { class: 't3-goal-head' }, [
      u.el('span', { class: 't3-goal-obj', text: goal.title || goal.objective }),
      u.el('span', { class: 't3-status', text: F().label(goal.status) })
    ]));
    var acts = u.el('div', { class: 't3-goal-acts' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (action) {
      if (svc.surfaces.canAct && !svc.surfaces.canAct(goal, action)) return;
      var b = u.el('button', { class: 't3-act', text: action.charAt(0).toUpperCase() + action.slice(1) });
      self._on(b, 'click', function () {
        svc.surfaces.act(self.tid(), action);
        var fresh = svc.surfaces.goalFor(self.tid());
        if (fresh) { self.buildGoalDetail(host, fresh, api); if (api && api.resize) api.resize(); }
        else if (api) { api.close(); }
      });
      acts.appendChild(b);
    });
    body.appendChild(acts);

    if (goal.status === 'blocked' && goal.blocker) {
      var b2 = goal.blocker;
      var det = u.el('div', { class: 't3-blocker' });
      [['Cause', b2.cause], ['Affected', b2.affectedScope], ['Tried', b2.lastAttemptedRecovery],
       ['Stopped because', b2.whyRecoveryStopped], ['Next safe action', b2.nextSafeAction]].forEach(function (row) {
        if (!row[1]) return;
        det.appendChild(u.el('div', { class: 't3-blocker-row' }, [
          u.el('span', { class: 't3-blocker-k', text: row[0] }),
          u.el('span', { class: 't3-blocker-v', text: row[1] })
        ]));
      });
      body.appendChild(det);
    }
    if (goal.replan) {
      body.appendChild(u.el('div', { class: 't3-replan' }, [
        u.el('span', { class: 't3-replan-k', text: 'Replanning' }),
        u.el('span', { class: 't3-replan-v', text: goal.replan.impact || goal.replan.reason })
      ]));
    }
    host.appendChild(body);
  };

  T3Thread.prototype.buildTodoDetail = function (host, todo) {
    var u = U();
    host.appendChild(u.el('div', { class: 't3-sheet-title', text: 'Todo' }));
    var list = u.el('div', { class: 't3-sheet-list pmx-scroll' });
    (todo.items || []).forEach(function (it) {
      list.appendChild(u.el('div', { class: 't3-todo-row', data: { state: it.state } }, [
        u.el('span', { class: 't3-todo-state', text: F().label(it.state) }),
        u.el('span', { class: 't3-todo-label', text: it.label })
      ]));
    });
    host.appendChild(list);
  };

  T3Thread.prototype.buildAgentsDetail = function (host, group) {
    var u = U();
    host.appendChild(u.el('div', { class: 't3-sheet-title', text: 'Agents' }));
    var list = u.el('div', { class: 't3-sheet-list pmx-scroll' });
    (group.agents || []).forEach(function (a) {
      list.appendChild(u.el('div', { class: 't3-agent' }, [
        u.el('div', { class: 't3-agent-head' }, [
          u.el('span', { class: 't3-agent-name', text: a.name }),
          u.el('span', { class: 't3-status', text: F().label(a.status) })
        ]),
        u.el('div', { class: 't3-agent-task', text: a.task }),
        u.el('div', { class: 't3-agent-act', text: a.currentActivity || (a.status === 'waiting_for_parent' ? 'Waiting for parent' : '') }),
        u.el('div', { class: 't3-agent-dur', text: a.workedSeconds != null ? F().duration(a.workedSeconds) : '' })
      ]));
    });
    host.appendChild(list);
  };

  T3Thread.prototype.buildDiffDetail = function (host, group) {
    var self = this;
    var u = U();
    host.appendChild(u.el('div', { class: 't3-sheet-title', text: 'Changes' }));
    var list = u.el('div', { class: 't3-sheet-list pmx-scroll' });
    (group.files || []).forEach(function (f) {
      var row = u.el('button', { class: 't3-file', data: { status: f.status } }, [
        u.el('span', { class: 't3-file-path', text: f.path }),
        u.el('span', { class: 't3-file-status', text: F().label(f.status) }),
        u.el('span', { class: 't3-file-n', text: '+' + f.added + ' -' + f.removed })
      ]);
      self._on(row, 'click', function () {
        self.ctx.services.editorHost.openArtifact(
          { id: 'file-' + f.path, title: f.path, kind: 'file', projectPath: f.path, openTarget: 'editor tab' },
          self.ctx
        );
      });
      list.appendChild(row);
    });
    if (group.hiddenFileCount) {
      list.appendChild(u.el('div', { class: 't3-file-more', text: group.hiddenFileCount + ' more files' }));
    }
    host.appendChild(list);
  };

  T3Thread.prototype.buildArtifactsDetail = function (host, artifacts) {
    var self = this;
    var u = U();
    host.appendChild(u.el('div', { class: 't3-sheet-title', text: 'Artifacts' }));
    var list = u.el('div', { class: 't3-sheet-list pmx-scroll' });
    artifacts.forEach(function (a) {
      var row = u.el('div', { class: 't3-artifact' }, [
        u.el('div', { class: 't3-artifact-title', text: a.title }),
        u.el('div', { class: 't3-artifact-meta', text: F().label(a.kind || 'file') + (a.projectPath ? ' · ' + a.projectPath : '') })
      ]);
      var openBtn = u.el('button', { class: 't3-act', text: 'Open' });
      self._on(openBtn, 'click', function () { self.ctx.services.editorHost.openArtifact(a, self.ctx); });
      row.appendChild(openBtn);
      list.appendChild(row);
    });
    host.appendChild(list);
  };

  /* ---------------------------------------------------------------- questionnaire */

  T3Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard. yieldForQuestion notifies the store, which re-enters update()
     * and therefore this function, mid-render. The inner pass appends a card, the outer
     * pass then appends a second one into a host it already emptied — two identical
     * questionnaires on screen. */
    if (this._inRenderQuestion) return;

    /* Measure the outgoing card BEFORE the rebuild empties the host, so an
     * advance between questions has a height to spring from. The reveal call
     * sits outside the guard because the guard's whole job is to suppress the
     * re-entrant inner pass, and the choreography must run once, on the outer. */
    var pmxHost = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    var pmxFrom = global.PMXReveal ? global.PMXReveal.measure(pmxHost && pmxHost.firstElementChild) : undefined;

    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }

    if (global.PMXReveal) {
      global.PMXReveal.afterRender(pmxHost, this.ctx.services, this.tid(), pmxFrom);
    }
  };

T3Thread.prototype._renderQuestionBody = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    U().empty(host);

    var q = svc.questionnaire ? svc.questionnaire.activeFor(this.tid()) : null;
    if (!q) return;

    if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(this.tid(), true);

    var idx = svc.questionnaire.currentIndex ? svc.questionnaire.currentIndex(q.id) : (q.currentQuestionIndex || 0);
    var question = (q.questions || [])[idx];
    if (!question) return;

    var card = u.el('div', { class: 't3-question' });
    card.appendChild(u.el('div', { class: 't3-question-head' }, [
      u.el('span', { class: 't3-question-count', text: (idx + 1) + ' of ' + (q.questions || []).length }),
      u.el('span', { class: 't3-question-req', text: question.required ? 'Required' : 'Optional' })
    ]));
    card.appendChild(u.el('p', { class: 't3-question-prompt', text: question.prompt }));

    if (question.options && question.options.length) {
      var opts = u.el('div', { class: 't3-question-opts' });
      question.options.forEach(function (opt) {
        var selected = (question.selected || []).indexOf(opt) >= 0;
        var b = u.el('button', { class: 't3-opt', text: opt, aria: { pressed: selected ? 'true' : 'false' } });
        self._on(b, 'click', function (ev) {
          if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
          svc.questionnaire.answer(q.id, question.id, opt);
          self.renderQuestion();
        });
        opts.appendChild(b);
      });
      card.appendChild(opts);
    } else {
      var ta = u.el('textarea', { class: 't3-question-free pmx-scroll', aria: { label: question.prompt } });
      ta.setAttribute('spellcheck', 'true');
      ta.value = question.draft || '';
      this._on(ta, 'input', function () { svc.questionnaire.answer(q.id, question.id, ta.value); });
      card.appendChild(ta);
    }

    var acts = u.el('div', { class: 't3-question-acts' });
    var skip = u.el('button', { class: 't3-act', text: 'Skip' });
    this._on(skip, 'click', function () { svc.questionnaire.skip(q.id, question.id); self.renderQuestion(); });
    acts.appendChild(skip);

    var isLast = idx === (q.questions || []).length - 1;
    var primary = u.el('button', { class: 't3-act t3-act-primary', text: isLast ? 'Submit' : 'Next' });
    this._on(primary, 'click', function () {
      if (isLast) {
        var can = svc.questionnaire.canSubmit(q.id);
        if (!can.ok) { if (global.PMXReveal) global.PMXReveal.reject(this); svc.toast.show('Answer the required questions first'); return; }
        svc.questionnaire.submit(q.id);
      } else {
        svc.questionnaire.next(q.id);
      }
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(primary);

    var cancel = u.el('button', { class: 't3-act', text: 'Cancel' });
    this._on(cancel, 'click', function () {
      svc.questionnaire.cancel(q.id);
      if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(self.tid(), false);
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(cancel);

    card.appendChild(acts);
    host.appendChild(card);
  };

  /* ---------------------------------------------------------------- live status */

  T3Thread.prototype.syncLive = function () {
    var u = U();
    var svc = this.ctx.services;
    var status = svc.runtime.liveStatus(this.tid());

    if (!status) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null;
      return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't3-unit t3-live pmx-live' });
      this.liveEl.appendChild(u.el('div', { class: 't3-marker' }, [this.ctx.services.icons.get('square', 15)]));
      var content = u.el('div', { class: 't3-unit-content' }, [
        u.el('span', { class: 't3-live-dot pmx-pulse' }),
        u.el('span', { class: 't3-unit-label t3-live-text' }),
        u.el('span', { class: 't3-unit-dur t3-live-time' })
      ]);
      this.liveEl.appendChild(content);
      if (this.surfacesTail && this.surfacesTail.parentNode === this.list) {
        this.list.insertBefore(this.liveEl, this.surfacesTail);
      } else {
        this.list.appendChild(this.liveEl);
      }
    }
    svc.motion.swapTextInstant(this.liveEl.querySelector('.t3-live-text'), status.text || '');
    svc.motion.swapTextInstant(this.liveEl.querySelector('.t3-live-time'),
      status.workedSeconds != null ? F().duration(status.workedSeconds) : '');
  };

  /* ---------------------------------------------------------------- ThreadInstance API */

  T3Thread.prototype.isExpanded = function (msgId) {
    return !!this.ctx.store.view(this.tid()).expanded[msgId];
  };

  T3Thread.prototype.setExpanded = function (msgId, on) {
    var self = this;
    var rec = this.rendered[msgId];
    this.ctx.store.view(this.tid()).expanded[msgId] = !!on;
    if (!rec) return;
    var body = rec.bodyEl;
    var btn = body.querySelector('.t3-more');

    this.scrollCtl.preserveAcross(body, function () {
      body.setAttribute('data-expanded', on ? '1' : '0');
      if (btn) btn.textContent = on ? 'Show less' : 'Show more';
      self.ctx.services.motion.snapToEnd(body);
    });
  };

  T3Thread.prototype.revealHidden = function (msgId) {
    this.setExpanded(msgId, true);
  };

  T3Thread.prototype.scrollToMessage = function (id, opts) {
    var rec = this.rendered[id];
    if (!rec) {
      var tid = this.tid();
      var thread = this.ctx.data.threadById(tid);
      var idx = -1;
      for (var i = 0; i < thread.messages.length; i++) {
        if (thread.messages[i].id === id) { idx = i; break; }
      }
      if (idx >= 0) {
        this.ctx.store.view(tid).loadedFrom = Math.max(0, idx - 20);
        this.renderThread();
        rec = this.rendered[id];
      }
    }
    if (!rec) return false;
    if (this.isExpandedEligible(id)) this.setExpanded(id, true);
    this.scrollCtl.jumpTo(id, opts || { highlight: true });
    return true;
  };

  T3Thread.prototype.isExpandedEligible = function (id) {
    var msgs = this.ctx.data.messagesFor(this.tid());
    for (var i = 0; i < msgs.length; i++) {
      if (msgs[i].id === id) return (msgs[i].body || '').length >= COLLAPSE_ELIGIBLE_CHARS;
    }
    return false;
  };

  T3Thread.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T3Thread.prototype.setAnchor = function (tok) { return this.scrollCtl.restoreAnchor(tok); };

  T3Thread.prototype.update = function (state, changed) {
    var needsFull = false, needsSurfaces = false, needsQuestion = false;
    for (var i = 0; i < changed.length; i++) {
      var k = changed[i];
      if (k === 'session.activeThreadId') needsFull = true;
      if (k.indexOf('view') === 0) { needsSurfaces = true; needsQuestion = true; }
      /* A new sent/received message changes the set of turns and execution units painted on
       * the spine, not just the thread-level surfaces at its foot. */
      if (k === 'view.lens' || k === 'view.expanded' || k === 'view.thought' || k === 'view.messages') needsFull = true;
    }
    if (state.session.activeThreadId !== this.lastThreadId) needsFull = true;
    if (needsFull) { this.renderThread(); return; }
    if (needsSurfaces) this.renderSurfaces();
    if (needsQuestion) this.renderQuestion();
  };

  T3Thread.prototype.destroy = function () {
    /* A thread renders into regions the WINDOW owns, so tearing down only its own root
     * leaves that content orphaned in the window. An instance replaced while the window
     * survives would otherwise leave a second questionnaire card behind. Clear what it
     * rendered into the window before anything else. */
    if (this.ctx && this.ctx.regions) {
      ['questionHost', 'workSurfaceHost'].forEach(function (r) {
        var el = this.ctx.regions[r];
        if (el && el.parentNode) { while (el.firstChild) el.removeChild(el.firstChild); }
      }, this);
    }
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this._tickOff) { try { this._tickOff(); } catch (e) {} this._tickOff = null; }
    if (this.scrollCtl && this.scrollCtl.destroy) { try { this.scrollCtl.destroy(); } catch (e) {} }
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    if (this.inlineQuestion && this.inlineQuestion.parentNode) this.inlineQuestion.parentNode.removeChild(this.inlineQuestion);
    this.rendered = {};
  };

  global.PMX.thread.register('t3', {
    name: 'Timeline Spine',
    blurb: 'A neutral vertical line runs the length of the transcript with a marker per turn; a square marker (never a color) sets execution work apart from conversation.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T3Thread(regionEl, ctx);
      return {
        update: function (s, c) { inst.update(s, c); },
        destroy: function () { inst.destroy(); },
        scrollToMessage: function (id, o) { return inst.scrollToMessage(id, o); },
        getAnchor: function () { return inst.getAnchor(); },
        setAnchor: function (t) { return inst.setAnchor(t); },
        setExpanded: function (id, on) { inst.setExpanded(id, on); },
        revealHidden: function (id, r) { inst.revealHidden(id, r); }
      };
    }
  });
})(window);
