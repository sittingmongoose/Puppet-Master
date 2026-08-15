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

    /* THE FLAG CAN FLIP MID-FLIGHT, and what is running then was started under the other rule.
     *
     * A class-driven beat needs nothing here: `[data-motion="reduced"]` kills the animation the
     * instant the attribute lands. A pinned height does not, because it is an inline style written by
     * JavaScript, and a node body left holding one is exactly the "parked mid-bounce" state reduced
     * motion exists to forbid. The same is true of a handover waiting on a timer to give the rail its
     * marker back. So both are settled when the flag turns on. */
    if (this.ctx.services.motion && this.ctx.services.motion.onChange) {
      this._motionOff = this.ctx.services.motion.onChange(function () { self._settleMotion(); });
    }

    this.renderThread();
  };

  /* EVERY live bounce is remembered, not just the newest, and that is the whole of this.
   *
   * One page change reaches this concept as two renders, and the second one under reduced motion takes
   * resizeBounce's early return - which hands back a handle that is already settled. Keeping a single
   * pointer therefore dropped the handle of the bounce that was actually holding a pinned height, and
   * a node body stayed clamped with a transition still running under a stage marked `reduced`. Settled
   * handles are pruned on the way in, so the list is never longer than what is genuinely in flight. */
  T3Thread.prototype._trackBounce = function (h) {
    var live = [];
    var list = this._qbounces || [];
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i] && list[i].state && list[i].state() === 'running') live.push(list[i]);
    }
    if (h && h.state && h.state() === 'running') live.push(h);
    this._qbounces = live;
    return h;
  };

  T3Thread.prototype._settleMotion = function () {
    var mo = this.ctx.services.motion;
    if (!mo || !mo.reduced || !mo.reduced(this.root)) return;
    var list = this._qbounces || [];
    this._qbounces = [];
    for (var i = 0; i < list.length; i++) { try { list[i].finish(); } catch (e) {} }
    this._flushRunHandover();
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

    /* 01_message_arrival_spatial_continuity.mov, frames 47 to 63 (about 280ms at 57.6fps): the new
     * message enters as a flattened sliver at a seam and expands into its box, while everything
     * already on screen keeps its identity. Redrawing the whole spine cannot say that - every
     * marker pops again, so the event that actually happened is indistinguishable from the twenty
     * that happened an hour ago.
     *
     * So an append is an append. When the only difference is messages added at the END of the same
     * thread and the same loaded range, the existing rows are kept and the new ones are inserted
     * through motion.displace(); anything else is a genuine rebuild. */
    if (this._canAppendOnly(tid, view, msgs)) { this._appendRows(msgs); return; }

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

    /* What the next render compares against to decide whether anything ARRIVED. */
    this._renderedIds = msgs.map(function (m) { return m.id; });
    this._renderedFrom = view.loadedFrom;

    /* Artifact state lives outside the store, so its ticks arrive here and nowhere else. */
    var self2 = this;
    if (this.ctx.services.artifacts && this.ctx.services.artifacts.subscribe && !this._artOff) {
      this._artOff = this.ctx.services.artifacts.subscribe(function () {
        if (self2._handoffHost) self2._renderHandoff(self2._handoffHost);
      });
    }
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

  /* True only when this render differs from the last by messages APPENDED to the end. A changed
   * thread, a changed loaded range, a removal, or any edit to an existing row all fail this and
   * fall back to the rebuild, because none of those is an arrival and animating a reflow as though
   * something had just been said would be a lie about what happened. */
  T3Thread.prototype._canAppendOnly = function (tid, view, msgs) {
    if (!this._renderedIds || tid !== this.lastThreadId) return false;
    if (view.loadedFrom !== this._renderedFrom) return false;
    if (msgs.length <= this._renderedIds.length) return false;
    for (var i = 0; i < this._renderedIds.length; i++) {
      if (msgs[i].id !== this._renderedIds[i]) return false;
    }
    return true;
  };

  /* Two things live at the foot of the spine and are not events on it: the running indicator and
   * the surfaces tail. An arriving row is filed ABOVE both, because the spine is chronological and
   * neither of those is a moment in the conversation. */
  T3Thread.prototype._listTail = function () {
    if (this.liveEl && this.liveEl.parentNode === this.list) return this.liveEl;
    if (this.surfacesTail && this.surfacesTail.parentNode === this.list) return this.surfacesTail;
    return null;
  };

  T3Thread.prototype._appendRows = function (msgs) {
    var self = this;
    var svc = this.ctx.services;
    var start = this._renderedIds.length;
    var tail = this._listTail();

    function insert() {
      var last = null;
      for (var i = start; i < msgs.length; i++) {
        var msg = msgs[i];
        var group = svc.surfaces && svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : null;
        if (msg.role === 'assistant' && group) {
          self.list.insertBefore(self.buildActivityUnit(msg, group), tail);
        }
        last = self.buildTurn(msg);
        self.list.insertBefore(last, tail);
      }
      /* The TURN is what arrived, not the execution unit that precedes it, so that is the node
       * displace stamps and the node the seam entrance plays on. */
      return last;
    }

    /* Measure, mutate, re-pin - in that order. A reader sitting at the bottom is carried down the
     * spine with the new event; a reader who has scrolled up is left where they are, which is the
     * whole reason stickIfAtBottom measures BEFORE the mutation. */
    var run = function () {
      if (svc.motion && svc.motion.displace) svc.motion.displace(self.list, insert);
      else insert();
    };
    if (this.scrollCtl && this.scrollCtl.stickIfAtBottom) this.scrollCtl.stickIfAtBottom(run);
    else run();

    this._renderedIds = msgs.map(function (m) { return m.id; });

    this.renderSurfaces();
    this.renderQuestion();
    this.syncLive();
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

  /* ---------------------------------------------------------------- compact work: spine units
   *
   * The matrix assigns this concept SPINE UNITS: the active group is a detailed square-marker unit,
   * completed groups collapse to marker-only nodes with no labels at all, and clicking a marker
   * expands that unit inline — ONE AT A TIME, because a spine that opens three units at once stops
   * being a chronology and becomes a list of panels.
   *
   * Compact by default is the requirement, and on a spine "compact" means the marker alone. That is
   * why the completed form drops labels entirely rather than shortening them: a column of markers is
   * scannable, a column of truncated labels is not.
   *
   * The single-open rule uses `view[tid].surfaces.expanded`, which the store already carries for
   * exactly this — concepts that promise single-detail behaviour keep one open domain there, and it
   * survives a remount.
   */
  T3Thread.prototype.renderSurfaces = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var thread = this.ctx.data.threadById(this.tid());
    var v = this.ctx.store.view(this.tid());
    var openKind = (v.surfaces && v.surfaces.expanded) || null;

    /* Ask the questionnaire whether a question is pending rather than reading `surfacesYielded`. That
     * flag is written by renderQuestion, and update() renders surfaces FIRST on every pass - so
     * reading it here painted the whole cluster for one frame before the question displaced it, and an
     * open group appeared to close itself. The pending question is the authoritative fact; the flag
     * mirrors it one render later. */
    var pendingQuestion = svc.questionnaire ? svc.questionnaire.activeFor(this.tid()) : null;
    var active = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;

    function each(val) { return val == null ? [] : (Object.prototype.toString.call(val) === '[object Array]' ? val : [val]); }

    var entries = [];

    /* GOAL — carries the phase index, which is the one fact a compact work cluster must never lose:
     * "where are we" outranks "what is happening" when the surface is one line tall. */
    if (active && active.goal) {
      var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(active.goal) : null;
      var goalLabel = phase
        ? ('Phase ' + phase.index + ' of ' + phase.total + ' \u00b7 ' + phase.label)
        : ('Goal \u00b7 ' + F().label(active.goal.status));
      entries.push({
        kind: 'goal', label: goalLabel, state: active.goal.status,
        build: function (h, api) { self.buildGoalDetail(h, active.goal, api); }
      });
    }

    if (active && active.todo) {
      var items = active.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
      var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
      entries.push({
        kind: 'todo',
        label: done + '/' + items.length + ' Todos' + (blocked ? ' \u00b7 ' + blocked + ' blocked' : ''),
        state: blocked ? 'blocked' : (done === items.length ? 'complete' : 'working'),
        build: function (h) { self.buildTodoDetail(h, active.todo); }
      });
    }

    if (active) {
      each(active.subagents).forEach(function (g) {
        var c = g.counts || {};
        var parts = [];
        /* Human-readable prose for every state, per CONTRACT 8.3: `waiting_for_parent` is never
         * shown as an underscored enum. */
        if (c.working) parts.push(c.working + ' working');
        if (c.queued) parts.push(c.queued + ' queued');
        if (c.blocked) parts.push(c.blocked + ' blocked');
        if (c.failed) parts.push(c.failed + ' failed');
        if (c.complete) parts.push(c.complete + ' complete');
        if (c.waiting) parts.push(c.waiting + ' waiting for parent');
        entries.push({
          kind: 'subagents', label: parts.join(', ') || 'No agents active',
          state: c.blocked ? 'blocked' : (c.working ? 'working' : 'complete'),
          build: function (h) { self.buildAgentsDetail(h, g); }
        });
      });

      /* ACTIVITY — reads, searches, web and browser work, tests and verification. Without this the
       * cluster cannot convey the six activity kinds the packet requires. */
      var stages = (thread && thread.activityStages) || [];
      if (stages.length) {
        var kinds = {};
        stages.forEach(function (st) { kinds[st.kind] = (kinds[st.kind] || 0) + 1; });
        var kindParts = [];
        if (kinds.read) kindParts.push(kinds.read + ' read');
        if (kinds.search) kindParts.push(kinds.search + ' searched');
        if (kinds.web) kindParts.push(kinds.web + ' fetched');
        if (kinds.browser) kindParts.push(kinds.browser + ' inspected');
        if (kinds.test) kindParts.push(kinds.test + ' tested');
        if (kinds.verify) kindParts.push(kinds.verify + ' verified');
        entries.push({
          kind: 'activity', label: kindParts.join(', '), state: 'complete',
          build: function (h) { self.buildActivityStages(h, stages); }
        });
      }

      each(active.diffs).forEach(function (g) {
        var files = g.files || [];
        var add = 0, del = 0;
        files.forEach(function (f) { add += f.added || 0; del += f.removed || 0; });
        entries.push({
          kind: 'diff',
          label: files.length + (files.length === 1 ? ' file' : ' files') + ' \u00b7 +' + add + ' \u2212' + del,
          state: 'complete',
          build: function (h) { self.buildDiffDetail(h, g); }
        });
      });
    }

    if (thread && thread.artifacts && thread.artifacts.length) {
      entries.push({
        kind: 'artifacts', label: thread.artifacts.length + ' artifacts', state: 'complete',
        build: function (h) { self.buildArtifactsDetail(h, thread.artifacts); }
      });
    }

    /* VERIFICATION — the final state the packet asks to be visible. It is derived from the message
     * that carries it rather than from a separate flag, so it cannot claim a verification that no
     * turn recorded. */
    var verified = this._verificationRecord();
    if (verified) {
      entries.push({
        kind: 'verify',
        label: 'Verified \u00b7 ' + F().duration(verified.elapsedSeconds),
        state: 'complete',
        build: function (h) {
          h.appendChild(u.el('p', { class: 't3-wunit-note', text: verified.note }));
          h.appendChild(u.el('p', { class: 't3-wunit-note', text: 'Worked for ' + F().duration(verified.workedSeconds) }));
        }
      });
    }

    var hostEl = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.surfacesTail;
    if (!hostEl) return;
    U().empty(hostEl);
    if (this.ctx.capabilities.workSurfaceHost && this.surfacesTail) U().empty(this.surfacesTail);

    /* A pending question yields the WORK surfaces and only those. Advice is a comment on the work
     * rather than a work surface, and the handoff is the work's product, so both stay reachable while
     * the question is answered. The yielded state underneath is untouched, so the cluster returns
     * exactly as it was - including which group was open. */
    if (pendingQuestion) {
      this._mountTail(hostEl);
      return;
    }

    /* Same DOM either way. The only difference between a hosted and an inline cluster is the parent
     * it is appended to — two implementations would drift the moment one was edited. */
    var runEl = u.el('div', { class: 't3-wgroup', data: { hosted: this.ctx.capabilities.workSurfaceHost ? '1' : '0' } });

    entries.forEach(function (e) {
      var isOpen = openKind === e.kind;
      /* Completed groups are marker-only when closed: that IS the condensation for this concept. */
      var condensed = !isOpen && e.state === 'complete';

      var unit = u.el('div', {
        class: 't3-wunit',
        data: { kind: e.kind, state: e.state, open: isOpen ? '1' : '0', condensed: condensed ? '1' : '0' }
      });

      var mark = u.el('button', {
        class: 't3-wunit-mark', type: 'button',
        aria: { expanded: isOpen ? 'true' : 'false', label: e.kind + ', ' + e.label }
      });
      mark.title = e.label;
      self._on(mark, 'click', function () {
        /* Single open at a time, and clicking the open one closes it. Reopening is independent:
         * every group is addressable by its own marker regardless of which one was last open. */
        var vv = self.ctx.store.view(self.tid());
        vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
        vv.surfaces.expanded = (vv.surfaces.expanded === e.kind) ? null : e.kind;
        /* The run spur above hangs off the same spine and obeys the same single-open rule, so opening
         * a domain unit closes whichever run phase was disclosed. The two writes are batched because
         * each one announces on its own, and an unbatched pair would rebuild the cluster twice per
         * click and throw away the first build's motion half way through it.
         *
         * touchView is enough on its own: update() re-renders the surfaces for any `view*` change, so
         * calling renderSurfaces here as well would rebuild this run a second time. */
        self.ctx.store.batch(function () {
          if (svc.runtrace && svc.runtrace.close) svc.runtrace.close(self.tid());
          self.ctx.store.touchView('surfaces');
        });
      });
      unit.appendChild(mark);

      var label = u.el('span', { class: 't3-wunit-label' });
      /* In-place text morph. A new row per count change would grow the spine on every tick, which is
       * the behaviour the packet's "counts update inside the existing line" rule rules out. */
      if (svc.motion && svc.motion.swapText) svc.motion.swapText(label, e.label);
      else label.textContent = e.label;
      unit.appendChild(label);

      if (isOpen) {
        var detail = u.el('div', { class: 't3-wunit-detail' });
        e.build(detail, { close: function () {
          var vv2 = self.ctx.store.view(self.tid());
          if (vv2.surfaces) vv2.surfaces.expanded = null;
          self.ctx.store.touchView('surfaces');
          self.renderSurfaces();
        } });
        unit.appendChild(detail);
      }

      runEl.appendChild(unit);
    });

    /* THE RUN — 03_compact_execution_activity.mov, drawn as a spur of this concept's own spine. It is
     * placed ABOVE the domain units for the same reason buildActivityUnit puts an execution unit
     * directly above the turn it produced: on a chronology the work comes before the state it left
     * behind. Being the earliest sibling in the host is also what gives groupReopen something to
     * carry, because every surface a reopened phase has to push down is below it. */
    var run = svc.runtrace && svc.runtrace.read ? svc.runtrace.read(this.tid()) : null;
    /* Three guards rather than one. The service may not be loaded at all; read() answers null on a
     * thread with no authored stages; and `started` stays false until the run has actually entered a
     * phase. Any of the three means there is nothing to draw, and a frame announcing that would be
     * reserved space for a surface that is not active, which this workspace forbids. */
    /* appendChild MOVES the surviving spur rather than adopting a copy, so emptying the host above
     * detached it and this puts the same one back — which is what lets its markers and its headline be
     * morphed at all. A run that has been RESET is gone rather than merely unrendered: its markers
     * would otherwise be re-appended as an index into phases that no longer exist. */
    if (run && run.started) hostEl.appendChild(this._runSpur(run));
    else this._dropRunSpur();

    hostEl.appendChild(runEl);

    /* The BSD advice surface and the handoff card hang off the same spine, below the units, because
     * both are consequences of the work the units describe. */
    this._mountTail(hostEl);
  };

  /* ---------------------------------------------------------------- the run: a spur of the spine
   *
   * This concept's reading of 03_compact_execution_activity.mov, and the first surface in t3 to ask
   * PMXOpCard for anything at all — before this, the six named operation fields the reference prints
   * (COMMAND, PROVIDER, CACHE, PERMISSION, COST, OPERATION_INPUT) were unreachable from this concept.
   *
   * WHY THE MARKERS WALK ALONG THE SPINE RATHER THAN DOWN IT
   * -------------------------------------------------------
   * The chain here is not a strip of glyphs imported from somewhere else: it is this concept's own
   * spine node — the same square, the same hairline, the same click-to-expand — repeated once per
   * entered phase. What it does not do is descend, and the reason is behaviour 4 rather than taste.
   * At f.910 a thirteen-tool run condenses to a SINGLE row; a rail that walked downward would make a
   * run's resting height grow with how much work it did, so the more the run achieved the more
   * transcript it would cost, which is the exact inverse of condensing. The spine therefore turns a
   * corner at this node and the phases walk along it: the first marker's centre sits on the vertical
   * rule at the same x as every other marker in the cluster, the segment they stand on is the same
   * 1px --border hairline the cluster draws, and the LENGTH of that segment is the number of phases
   * entered. The run stays one node on the chronology and the chain still costs one marker per phase.
   *
   * The behaviours carried over, with the frames shared/runtrace.js cites for each:
   *   - one marker per entered phase in entry order, each a button reopening THAT phase (the chain
   *     grows f.208 two, f.390 three, f.780 four, f.910 six; f.1170 and f.1300 are the reopens);
   *   - the count rewritten in place, digits only, nothing relayouts (f.208 -> f.286 -> f.338);
   *   - the verb in the present participle while running and in the past tense once settled
   *     (f.194 `Exploring` against f.1300 `Explored`);
   *   - condensed is the resting state and not a deletion, and what sits below the run is pushed
   *     down when a phase is reopened rather than replaced (f.910);
   *   - the rail scrolls rather than truncating, because a marker IS the route back to its phase.
   *
   * Deliberately not carried over: the reference's colours, radii, ring treatment and easing. Those
   * are its look. Every value below is one of this concept's existing tokens.
   */
  /* HOW LONG THE LINE STAYS EMPTY BETWEEN THE BEATS, in ms.
   *
   * It is swapText's own cross-fade, deliberately: beat one IS that fade, so the two agree by
   * construction rather than by two constants somebody has to keep in step. `motion.phaseHandover`
   * takes the same 110ms for the same reason. */
  var RUN_HANDOVER_MS = 110;

  /* _runSpur(run) — the spur, built ONCE and kept.
   *
   * renderSurfaces empties its host and rebuilds on every view change, and motion.countMorph only
   * animates digits when the element it is handed is already showing the previous text. A freshly
   * built span shows the empty string, so countMorph would take its entrance path on every tick and
   * no digit would ever move — the count would still be correct, which is precisely why nothing would
   * look broken while behaviour 2 (f.208 -> f.338) quietly did not happen.
   *
   * This used to be answered with a structural SIGNATURE: patch in place while the run kept its shape,
   * rebuild the moment a phase entered. That was enough for the counts and not enough for the thing
   * f.194-211 is actually about. A handover is a claim about ORDER — the line lets go of the phase
   * that is finishing, and only THEN does the new marker join the rail — and an element rebuilt in one
   * frame has no before for the after to follow. So the signature is gone and the rail is reconciled
   * by identity, one marker per phase, exactly as the chip run in t2 is. */
  T3Thread.prototype._runSpur = function (run) {
    var els = this._runSpurEls();
    this._syncRunSpur(els, run);
    return els.cap;
  };

  T3Thread.prototype._runSpurEls = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var tid = this.tid();
    if (this._runEls && this._runTid === tid) return this._runEls;
    /* A run from another thread is not a previous state of this one, so a thread change starts the
     * spur again. */
    this._dropRunSpur();

    var cap = u.el('div', {
      class: 't3-run', data: { condensed: '0', running: '0' }
    });

    /* ---- the rail: one spine marker per entered phase, in entry order */
    var rail = u.el('div', { class: 't3-run-rail pmx-chain' });
    cap.appendChild(rail);

    /* ---- the headline: one line, rewritten in place, never appended to */
    var head = u.el('button', {
      class: 't3-run-head', type: 'button', aria: { expanded: 'false' }
    });
    var verbEl = u.el('span', { class: 't3-run-verb' });
    var argEl = u.el('span', { class: 't3-run-arg' });
    var chev = u.el('span', { class: 't3-run-chevron', data: { show: '0' } });
    head.appendChild(verbEl);
    head.appendChild(argEl);
    head.appendChild(chev);
    /* One control, three meanings, in the order the reader's intent runs: dismiss what is open, else
     * reopen a condensed run at its most recent phase, else condense a finished one. The run is read
     * at CLICK time because this handler is bound once and the record it would have closed over is a
     * moment, not a fact. */
    this._on(head, 'click', function () {
      if (!svc.runtrace || !svc.runtrace.read) return;
      var live = svc.runtrace.read(self.tid());
      if (!live) return;
      if (live.open) { svc.runtrace.close(self.tid()); return; }
      if (live.condensed) { self._openRunPhase(cap, null); return; }
      svc.runtrace.condense(self.tid());
    });
    cap.appendChild(head);

    this._runEls = {
      cap: cap, rail: rail, head: head, verb: verbEl, arg: argEl, chev: chev,
      detail: null, foot: null, verbText: '', argText: ''
    };
    this._runTid = tid;
    this._runNodeEls = {};
    this._runSubjectId = null;
    return this._runEls;
  };

  T3Thread.prototype._dropRunSpur = function () {
    /* A pending beat two still owes the rail its marker, so it is FLUSHED rather than dropped: an
     * abandoned handover would leave a phase with no route back into it. */
    this._flushRunHandover();
    if (this._runEls && this._runEls.cap && this._runEls.cap.parentNode) {
      this._runEls.cap.parentNode.removeChild(this._runEls.cap);
    }
    this._runEls = null;
    this._runTid = null;
    this._runNodeEls = {};
    this._runSubjectId = null;
  };

  T3Thread.prototype._flushRunHandover = function () {
    if (this._runHandoverTimer) { global.clearTimeout(this._runHandoverTimer); this._runHandoverTimer = null; }
    var fn = this._runHandoverFn;
    this._runHandoverFn = null;
    this._runHandoverId = null;
    if (fn) fn();
  };

  /* One marker. The square is this concept's standing "this is work, not prose" mark and it stays. The
   * glyph inside it is what makes the rail an INDEX rather than a progress bar: a row of identical
   * squares could not tell a reader which node is the edit phase, so clicking one could not be the
   * random access f.1170 demonstrates.
   *
   * One element per phase, enforced here rather than trusted, because beat two inserts asynchronously
   * and any reconciliation running in between would otherwise build a second marker for the same
   * phase and leave the first one in the rail, unreachable. */
  T3Thread.prototype._makeRunNode = function (p) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var pid = p.id;

    var prior = this._runNodeEls && this._runNodeEls[pid];
    if (prior && prior.slot && prior.slot.parentNode) prior.slot.parentNode.removeChild(prior.slot);

    /* Every marker sits in its own slot, which is the box that opens from zero width when a phase
     * hands over (f.205-209). Without the slot the rail has nothing to animate and the marker appears
     * in one frame. */
    var slot = u.el('span', { class: 'pmx-chain-slot' });
    var node = u.el('button', {
      class: 't3-run-node', type: 'button',
      data: { kind: p.kind, state: p.running ? 'running' : 'done', open: '0' }
    });
    if (svc.icons) node.appendChild(svc.icons.get(p.glyph, 12));
    this._on(node, 'click', function () {
      if (self._runEls) self._openRunPhase(self._runEls.cap, pid);
    });
    slot.appendChild(node);

    var rec = { slot: slot, node: node };
    this._runNodeEls[pid] = rec;
    return rec;
  };

  T3Thread.prototype._writeRunNode = function (rec, p, isOpen) {
    rec.node.setAttribute('data-state', p.running ? 'running' : 'done');
    rec.node.setAttribute('data-open', isOpen ? '1' : '0');
    rec.node.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    rec.node.setAttribute('aria-label', p.headline);
    rec.node.title = p.headline;
  };

  /* The headline's words. Morph ONLY on change: the line survives every render now, so handing
   * countMorph an unchanged string would replay the digit animation on any unrelated view touch, and
   * a count that appears to tick when no work happened is a lie told by animation. */
  T3Thread.prototype._writeRunHead = function (els, verbText, argText) {
    this._morphHead(els, 'verbText', els.verb, verbText);
    this._morphHead(els, 'argText', els.arg, argText);
  };

  T3Thread.prototype._morphHead = function (els, key, el, text) {
    var svc = this.ctx.services;
    if (els[key] === text) return;
    els[key] = text;
    if (!svc.motion || !svc.motion.countMorph) { el.textContent = text; return; }
    /* countMorph, never swapText. `Reading 6 files` becoming `Reading 7 files` must move the digit and
     * leave every word around it in the layout box it already had (f.208 -> f.286 -> f.338); a
     * cross-fade of the whole label reads as the line being replaced, which is the difference between
     * a running tally and a series of different sentences. Verb and argument morph separately so the
     * tense flip lands on the verb alone and the argument beside it never twitches. */
    svc.motion.countMorph(el, text);
    /* The memo above is advanced before the write lands: countMorph's non-digit path defers through
     * swapText's double requestAnimationFrame, and a dropped frame would leave the memo claiming this
     * text while the span still shows the old one — after which the equality guard would refuse to
     * repaint it forever. Past the animation's own window, assert the text. */
    if (els[key + 'Timer']) global.clearTimeout(els[key + 'Timer']);
    els[key + 'Timer'] = global.setTimeout(function () {
      els[key + 'Timer'] = null;
      if (els[key] === text && el.textContent !== text) el.textContent = text;
    }, 320);
  };

  /* The marker joining the rail, as its own beat. This is the second half of the reference's handover
   * carried into a geometry that cannot take the first half's push: the rail is a full-width row ABOVE
   * the headline, so a slot opening here widens the rail and reaches nothing else. The headline's x is
   * constant by construction, which is what the rail's own CSS says it is for. */
  T3Thread.prototype._openRailSlot = function (slot, node) {
    var mo = this.ctx.services.motion;
    if (!mo || !mo.afterTransition) return;
    if (mo.reduced && mo.reduced(slot)) return;
    var w = node.getBoundingClientRect ? node.getBoundingClientRect().width : 0;
    if (!w) return;
    function settle() {
      slot.style.transition = '';
      slot.style.width = '';
      slot.removeAttribute('data-pmx-slot');
    }
    slot.setAttribute('data-pmx-slot', 'closed');
    slot.style.transition = 'none';
    slot.style.width = '0px';
    void slot.offsetWidth;
    /* The settle timer is armed HERE and not inside the frame below, and that is the difference
     * between a marker that always arrives and one that usually does. The width is already pinned to
     * zero; if the frame that opens it never comes — a throttled tab, a page that is not painting —
     * everything registered inside it never exists either, and the slot would stay shut with no
     * cleanup owning it. A marker stuck at zero width is a phase with no route back into it. */
    var timer = global.setTimeout(settle, 320);
    global.requestAnimationFrame(function () {
      slot.style.transition = 'width 180ms var(--ease-spring-real, cubic-bezier(.22,.61,.36,1))';
      slot.removeAttribute('data-pmx-slot');
      slot.style.width = w + 'px';
      mo.afterTransition(slot, 'width', function () {
        global.clearTimeout(timer);
        settle();
      }, 260);
    });
  };

  /* The rail scrolls rather than truncating, and brings the disclosed marker back into view when the
   * reader has scrolled away from it. Dropping the oldest marker to make room would silently make that
   * phase unreachable, because the marker is the only route back into it. With nothing disclosed the
   * running marker is the target, and with neither, chainRoll's own default — the end of the rail —
   * is where a run in progress wants to be. */
  T3Thread.prototype._rollRail = function (into) {
    var self = this;
    var svc = this.ctx.services;
    var els = this._runEls;
    if (!els || !svc.motion || !svc.motion.chainRoll) return;
    var rail = els.rail;
    global.requestAnimationFrame(function () {
      if (!self._runEls || self._runEls.rail !== rail || !rail.isConnected) return;
      svc.motion.chainRoll(rail, into && into.isConnected ? { into: into } : null);
    });
  };

  T3Thread.prototype._syncRunSpur = function (els, run) {
    var svc = this.ctx.services;
    var open = run.open;
    /* While the run is live the running phase is its own disclosure, which is why the reference shows
     * rows under a running phase without anyone having asked for them. Once the run condenses nothing
     * is disclosed until the reader opens a marker. */
    var showDetail = !!open || (!run.condensed && !!run.running);
    var subject = open || run.running || (run.chain.length ? run.chain[run.chain.length - 1] : null);

    var cap = els.cap;
    cap.setAttribute('data-condensed', run.condensed ? '1' : '0');
    cap.setAttribute('data-running', run.running ? '1' : '0');
    els.head.setAttribute('aria-expanded', showDetail ? 'true' : 'false');

    /* Condensed with nothing open, the line speaks for the whole run (`13 tools used` at f.910);
     * otherwise it speaks for the phase in hand. */
    var verbText = (run.condensed && !open) ? run.summaryLabel : (subject ? subject.verb : '');
    var argText = (run.condensed && !open) ? '' : (subject ? subject.argument : '');

    var handingOver = this._syncRunRail(els, run, subject, verbText, argText);
    if (!handingOver) this._writeRunHead(els, verbText, argText);
    this._runSubjectId = subject ? subject.id : null;

    var chevronWanted = run.chain.length > 1 || run.condensed;
    els.chev.setAttribute('data-show', chevronWanted ? '1' : '0');
    U().empty(els.chev);
    if (chevronWanted && svc.icons) {
      els.chev.appendChild(svc.icons.get(showDetail ? 'chevron-up' : 'chevron-down', 12));
    }

    var openNode = (open && this._runNodeEls[open.id]) ? this._runNodeEls[open.id].node : null;
    var runningNode = (run.running && this._runNodeEls[run.running.id]) ? this._runNodeEls[run.running.id].node : null;
    return this._syncRunDisclosure(els, run, subject, showDetail, handingOver, openNode || runningNode);
  };

  /* The rail, reconciled by identity. Returns true when a handover is in flight, which is the one case
   * where the caller must leave the headline and the roll alone: both belong to beat two. */
  T3Thread.prototype._syncRunRail = function (els, run, subject, verbText, argText) {
    var self = this;
    var svc = this.ctx.services;
    var open = run.open;
    var rail = els.rail;
    this._runNodeEls = this._runNodeEls || {};

    var wanted = {};
    run.chain.forEach(function (p) { wanted[p.id] = true; });
    for (var id in this._runNodeEls) {
      if (!Object.prototype.hasOwnProperty.call(this._runNodeEls, id)) continue;
      if (wanted[id]) continue;
      /* Only a reset ever takes a phase out of the chain. Nothing else removes a marker, because the
       * marker is the only route back into its phase. */
      var gone = this._runNodeEls[id];
      if (gone.slot && gone.slot.parentNode) gone.slot.parentNode.removeChild(gone.slot);
      delete this._runNodeEls[id];
    }

    /* A phase HANDS OVER only when the headline moves to a marker that is arriving NOW, at the end of
     * the rail. A reader reopening an old phase, or a finished run appearing all at once, is not a
     * handover and must not be animated as one. */
    var last = run.chain.length ? run.chain[run.chain.length - 1] : null;
    var arriving = (subject && last && subject.id === last.id && !this._runNodeEls[subject.id]) ? subject : null;
    /* Already mid-handover for this very phase: the marker is missing because beat two has not run
     * yet, not because it is arriving again. Starting a second handover would clear the line twice. */
    if (arriving && this._runHandoverId === arriving.id) return true;
    /* A DIFFERENT phase arriving while one is pending settles the first immediately. Two handovers in
     * flight would race for the same line, and the loser would write its sentence after the winner. */
    if (this._runHandoverId) this._flushRunHandover();

    var outgoing = (arriving && this._runSubjectId && this._runSubjectId !== arriving.id)
      ? this._runSubjectId : null;

    run.chain.forEach(function (p) {
      if (arriving && arriving.id === p.id) return;    /* joins the rail on beat two */
      var rec = self._runNodeEls[p.id] || self._makeRunNode(p);
      self._writeRunNode(rec, p, !!(open && open.id === p.id));
      /* Re-appending a survivor keeps rail order equal to entry order without touching the element:
       * appendChild moves a node the rail already owns rather than recreating it. */
      rail.appendChild(rec.slot);
    });

    if (!arriving) return false;

    function beatTwo() {
      var rec = self._runNodeEls[arriving.id] || self._makeRunNode(arriving);
      self._writeRunNode(rec, arriving, !!(open && open.id === arriving.id));
      rail.appendChild(rec.slot);
      self._openRailSlot(rec.slot, rec.node);
      /* The line takes the arriving phase's words WITH its marker. In the reference the label can
       * arrive before the glyph because there they are two objects on one row; here the marker and
       * the sentence are on two different rows, and what the reader has to be able to follow is that
       * the line went quiet BECAUSE one phase ended and spoke again BECAUSE the next one began. */
      self._writeRunHead(els, verbText, argText);
      self._rollRail(rec.node);
    }

    var mo = svc.motion;
    if (!mo || !mo.swapText || (mo.reduced && mo.reduced(els.cap))) {
      /* Reduced motion lands on the END of the sequence in one step, fully revealed. */
      beatTwo();
      return true;
    }

    /* BEAT ONE. The headline lets go of the phase that is finishing, and the rail does not change at
     * all. This is f.198-200: the reasoning text and the label fade out while the glyph stays.
     *
     * t3 takes the ORDER and not the push. The reference's second beat slides its new glyph in
     * BETWEEN the last glyph and the label, which moves the label one slot right; that is possible
     * because there the chain and the label share a row. This rail is a full-width row ABOVE the
     * headline — it is the spine turning a corner — so nothing lateral can reach the label, and the
     * concept's own CSS says keeping the headline's x constant is the point of that geometry. What
     * survives the re-idiom is the causality: quiet first, then the marker. */
    if (outgoing) {
      mo.swapText(els.verb, '');
      mo.swapText(els.arg, '');
    } else {
      els.verb.textContent = '';
      els.arg.textContent = '';
    }
    els.verbText = '';
    els.argText = '';

    this._runHandoverId = arriving.id;
    this._runHandoverFn = beatTwo;
    this._runHandoverTimer = global.setTimeout(function () {
      self._runHandoverTimer = null;
      self._runHandoverId = null;
      var fn = self._runHandoverFn;
      self._runHandoverFn = null;
      if (fn) fn();
    }, RUN_HANDOVER_MS);
    return true;
  };

  /* What the spur DISCLOSES, below the rail and the headline: the phase in hand, the settled run's
   * footer, and the roll that brings the marker being read back into view. */
  T3Thread.prototype._syncRunDisclosure = function (els, run, subject, showDetail, handingOver, into) {
    var u = U();
    var cap = els.cap;

    /* ---- the disclosed phase, below the headline.
     *
     * Rebuilt rather than kept, and the difference from the rail above is the point: a marker and a
     * headline are objects the reader watches CHANGE, so they have to be the same elements from one
     * render to the next. The detail is a DISCLOSURE — it is open on one phase or it is not there —
     * and nothing inside it morphs, so rebuilding it states exactly what it is. */
    if (els.detail && els.detail.parentNode) els.detail.parentNode.removeChild(els.detail);
    els.detail = null;
    if (showDetail && subject) {
      var detail = u.el('div', { class: 't3-run-detail' });
      var rows = (subject.rows && subject.rows.length) ? subject.rows : null;
      if (rows) {
        rows.forEach(function (r) {
          var row = u.el('div', { class: 't3-run-row' });
          row.appendChild(u.el('span', { class: 't3-run-row-verb', text: r.verb || '' }));
          row.appendChild(u.el('span', { class: 't3-run-row-target', text: r.target || '' }));
          /* Printed only when the record carries them. A generate phase touches files without adding
           * or removing a line, and `+0 -0` beside it would state a measurement nobody made. */
          if (r.added != null || r.removed != null) {
            var delta = u.el('span', { class: 't3-run-delta' });
            if (r.added != null) delta.appendChild(u.el('span', { class: 't3-run-add', text: '+' + r.added }));
            if (r.removed != null) delta.appendChild(u.el('span', { class: 't3-run-rem', text: '−' + r.removed }));
            row.appendChild(delta);
          }
          detail.appendChild(row);
        });
      } else if (subject.detail) {
        /* `.t3-wunit-note` rather than a note class of my own: the spine already has exactly one way
         * to set a muted line of explanation under a marker, and a second would be two owners. */
        detail.appendChild(u.el('p', { class: 't3-wunit-note', text: subject.detail }));
      }

      var opBlock = this._buildRunOp(subject);
      if (opBlock) detail.appendChild(opBlock);

      if (detail.firstChild) { cap.appendChild(detail); els.detail = detail; }
    }

    /* ---- the footer, once the run has settled */
    if (els.foot && els.foot.parentNode) els.foot.parentNode.removeChild(els.foot);
    els.foot = null;
    if (run.condensed && run.workedSeconds) {
      els.foot = u.el('div', {
        class: 't3-run-foot',
        text: 'Worked for ' + F().duration(run.workedSeconds)
      });
      cap.appendChild(els.foot);
    }

    /* A handover schedules its own roll, because the marker it would have to reach does not join the
     * rail until beat two. Rolling here as well would scroll to where that marker is about to be and
     * then again once it is there. */
    if (!handingOver) this._rollRail(into);
    return cap;
  };

  /* Disclosing a phase, in this concept's established single-open idiom.
   *
   * `view.surfaces.expanded` is cleared in the same write because the spine promises ONE open thing
   * at a time and a run phase is on the spine like everything else, so a phase and a domain unit must
   * not be able to stand open together. The pair is batched so the cluster is rebuilt once.
   *
   * The disclosure is routed through groupReopen rather than made as a bare state write: that
   * primitive measures the run's LATER SIBLINGS — the domain units, the advice nodes and the handoff
   * card — and carries them, which is the rule f.910 establishes, that what lives below the run is
   * pushed down when a phase is reopened and never treated as content to be replaced.
   *
   * `phaseId` of null is the chevron's meaning: PMXRunTrace.open with no id reopens the most recent
   * phase, which is what "show me what just happened" asks for. Passing the id of the phase that is
   * already open closes it, so one control both discloses and dismisses. */
  T3Thread.prototype._openRunPhase = function (cap, phaseId) {
    var self = this;
    var svc = this.ctx.services;
    if (!svc.runtrace || !svc.runtrace.open) return;
    function disclose() {
      self.ctx.store.batch(function () {
        var vv = self.ctx.store.view(self.tid());
        vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
        vv.surfaces.expanded = null;
        svc.runtrace.open(self.tid(), phaseId);
        self.ctx.store.touchView('surfaces');
      });
    }
    if (svc.motion && svc.motion.groupReopen) svc.motion.groupReopen(cap, disclose);
    else disclose();
  };

  /* The operation record behind a disclosed phase.
   *
   * `reference/screenshots/pm7_popout.png` prints one unit of tool work as a header and a status, the
   * reason it ran, six named fields and its chips, and PMXOpCard owns every one of those facts —
   * PROVIDER, PERMISSION and COST are read from the live route and access services there, so they
   * cannot claim a grant the current profile does not give. This concept had never asked it for any
   * of that, so the whole record was invisible in t3.
   *
   * It is laid out in the vocabulary the spine already uses for a stage row: an uppercase key in a
   * fixed column with its value beside it, which is the shape `.t3-act-row` gives every stage in the
   * activity detail. No card, no pill and no chip box — the status is a word, `/sources` is plain
   * text, and the artifact is the same dashed mini button the question run and the advice node
   * already use, so the spine gains no second control vocabulary from this surface. */
  T3Thread.prototype._buildRunOp = function (phase) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    if (!phase || !phase.op || !svc.opcard || !svc.opcard.forThread) return null;

    /* The phase record carries the AUTHORED op fields; the normalized record with the derived ones is
     * what PMXOpCard returns, and its id is the stage id the phase is keyed by. Reading the owner is
     * what keeps the card and the rail beside it from disagreeing about the same phase. */
    var recs = svc.opcard.forThread(this.ctx, this.tid());
    var rec = null;
    for (var i = 0; i < recs.length; i++) {
      if (recs[i].id === phase.id) { rec = recs[i]; break; }
    }
    if (!rec) return null;

    var block = u.el('div', { class: 't3-run-op', data: { status: rec.status } });
    block.appendChild(u.el('div', { class: 't3-run-op-head' }, [
      u.el('span', { class: 't3-run-op-title', text: rec.headline }),
      u.el('span', { class: 't3-run-op-status', text: rec.statusLabel })
    ]));
    /* Why it ran, as a gloss directly under the header. It is authored on the stage because no
     * service can derive a reason, and it is printed rather than reworded. */
    if (rec.why) block.appendChild(u.el('p', { class: 't3-run-op-why', text: rec.why }));

    rec.fields.forEach(function (f) {
      block.appendChild(u.el('div', { class: 't3-run-field' }, [
        u.el('span', { class: 't3-run-key', text: f.key }),
        u.el('span', { class: 't3-run-val', data: { key: f.key }, text: f.value })
      ]));
    });

    if (rec.chips && rec.chips.length) {
      var chips = u.el('div', { class: 't3-run-chips' });
      rec.chips.forEach(function (chip) {
        if (chip.kind === 'artifact' && chip.artifactId && svc.artifacts && svc.artifacts.open) {
          var btn = u.el('button', {
            class: 't3-qmini', type: 'button', text: chip.label,
            aria: { label: chip.label + ' ' + chip.artifactId }
          });
          self._on(btn, 'click', function () { svc.artifacts.open(chip.artifactId); });
          chips.appendChild(btn);
          chips.appendChild(u.el('span', { class: 't3-run-chip-id', text: chip.artifactId }));
          return;
        }
        /* `/sources` stays plain text because nothing in this workspace can open it, and a control
         * that looks live and answers nothing is worse than no control at all. */
        chips.appendChild(u.el('span', { class: 't3-run-chip', text: chip.label }));
      });
      if (chips.firstChild) block.appendChild(chips);
    }
    return block;
  };

  /* Advice and handoff each get a stable container. The artifact service ticks its own state on its
   * own subscription - not through the store - so the handoff has to be re-renderable WITHOUT
   * rebuilding the unit run underneath it, or every load frame would tear down an open group. */
  T3Thread.prototype._mountTail = function (hostEl) {
    var u = U();
    this._bsdHost = u.el('div', { class: 't3-bsd-host' });
    this._handoffHost = u.el('div', { class: 't3-handoff-host' });
    hostEl.appendChild(this._bsdHost);
    hostEl.appendChild(this._handoffHost);
    this._renderBsdAdvice(this._bsdHost);
    this._renderHandoff(this._handoffHost);
  };

  /* The verification record comes from the message that carries it. */
  T3Thread.prototype._verificationRecord = function () {
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].verification) return msgs[i].verification;
    }
    return null;
  };

  /* Activity detail, including the six kinds. Browser work uses PM-native vocabulary; the labels
   * come from the fixture and are printed rather than reworded. */
  T3Thread.prototype.buildActivityStages = function (host, stages) {
    var u = U();
    var self = this;
    stages.forEach(function (st) {
      var row = u.el('div', { class: 't3-act-row', data: { kind: st.kind } });
      row.appendChild(u.el('span', { class: 't3-act-kind', text: F().label(st.kind) }));
      row.appendChild(u.el('span', { class: 't3-act-label', text: st.label }));
      if (st.durationMs != null) {
        row.appendChild(u.el('span', { class: 't3-act-dur', text: F().duration(Math.round(st.durationMs / 1000)) }));
      }
      if (st.detail) {
        var more = u.el('button', { class: 't3-qmini', type: 'button', text: 'Detail' });
        self._on(more, 'click', function () {
          self.ctx.services.popup.open({
            anchorEl: more, kind: 'panel', width: 280,
            build: function (h) {
              h.appendChild(u.el('div', { class: 'pmx-pop-title', text: st.label }));
              h.appendChild(u.el('p', { class: 't3-wunit-note', text: st.detail }));
            }
          });
        });
        row.appendChild(more);
      }
      host.appendChild(row);
    });
  };

  /* ---------------------------------------------------------------- BSD: a side node off the spine
   *
   * The matrix gives this concept "a side node hanging off the spine". That is the right shape here
   * for a reason worth stating: advice is NOT part of the chronology — it is a comment on it — so it
   * must be attached to the spine without being a node in the run. Hence a side node, offset from the
   * column, rather than another square marker in sequence.
   */
  T3Thread.prototype._renderBsdAdvice = function (host) {
    var self = this;
    var u = U();
    var bsd = this.ctx.services.bsd;
    if (!bsd || !bsd.advice) return;

    U().empty(host);
    var list = bsd.advice(this.tid()) || [];
    if (!list.length) return;

    var state = bsd.visualState ? bsd.visualState(this.tid()) : 'auto-idle';
    var wrap = u.el('div', { class: 't3-bsd', data: { state: state } });

    list.forEach(function (adv) {
      var node = u.el('div', { class: 't3-bsd-node', data: { severity: adv.severity } });
      node.appendChild(u.el('span', { class: 't3-bsd-stem' }));
      var body = u.el('div', { class: 't3-bsd-body' });
      body.appendChild(u.el('span', {
        class: 't3-bsd-kind',
        text: adv.severity === 'caution' ? 'Back Seat Driver, caution' : 'Back Seat Driver, note'
      }));
      body.appendChild(u.el('p', { class: 't3-bsd-text', text: adv.text }));

      if (adv.evidenceRefs && adv.evidenceRefs.length) {
        body.appendChild(u.el('span', { class: 't3-bsd-ev', text: adv.evidenceRefs.join(', ') }));
      }

      /* Dismiss is the ONLY action. Advice is read-only by construction: an "Apply" here would be a
       * write path from an advisor into the thread's authority, which is exactly what the packet
       * forbids and what PMXBsd has no API for. */
      var dis = u.el('button', { class: 't3-qmini', type: 'button', text: 'Dismiss' });
      self._on(dis, 'click', function () {
        bsd.dismiss(self.tid(), adv.id);
        self.renderSurfaces();
      });
      body.appendChild(dis);

      node.appendChild(body);
      wrap.appendChild(node);
    });

    host.appendChild(wrap);
  };

  /* ---------------------------------------------------------------- artifact handoff card
   *
   * The video-B principle: a compact card CONNECTED to the work that produced it, showing
   * `compiling -> ready` and how long it took, opening the left workspace rather than inlining the
   * artifact. On this concept the card is a spine node with a square marker, so the handoff reads as
   * the next event in the chronology instead of a floating attachment.
   */
  T3Thread.prototype._renderHandoff = function (host) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var A = svc.artifacts;
    if (!A || !A.list) return;

    U().empty(host);
    var thread = this.ctx.data.threadById(this.tid());
    var refs = (thread && thread.artifacts) || [];
    if (!refs.length) return;

    /* The most recently produced artifact is the one the handoff is about. The thread's own record
     * IS the definition (title, kind, projectPath); `artifacts.get` is the per-THREAD catalog, not a
     * by-id lookup, so reaching for it here would hand back the wrong shape. */
    var ref = refs[refs.length - 1];
    var id = ref.id;
    if (!id) return;

    var state = A.stateOf ? A.stateOf(id) : 'idle';
    var card = u.el('div', { class: 't3-handoff', data: { state: state } });
    card.appendChild(u.el('span', { class: 't3-handoff-mark' }));

    var body = u.el('div', { class: 't3-handoff-body' });
    body.appendChild(u.el('span', { class: 't3-handoff-title', text: ref.title }));

    /* One line that morphs between the two states rather than two lines that swap visibility: the
     * card is showing one fact whose value changes. */
    var stateEl = u.el('span', { class: 't3-handoff-state' });
    var stateText = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, stateText);
    else stateEl.textContent = stateText;
    body.appendChild(stateEl);

    var worked = this._handoffWorkedSeconds();
    if (worked != null) {
      body.appendChild(u.el('span', { class: 't3-handoff-worked', text: 'Worked for ' + F().duration(worked) }));
    }

    var open = u.el('button', { class: 't3-handoff-open', type: 'button', text: 'Open' });
    this._on(open, 'click', function () {
      A.open(id);
      /* Land on the settled state in the same interaction rather than leaving the reviewer watching
       * the simulated transport. The card repaints through the artifact subscription, not from here:
       * `open` alone only writes session state, which no `view*` key covers. */
      if (A.forceReady) A.forceReady(id);
      if (svc.motion && svc.motion.handoff) svc.motion.handoff(card);
    });
    body.appendChild(open);

    card.appendChild(body);
    host.appendChild(card);
  };

  /* Worked time for the handoff line, taken from the goal's own receipt when it has one and from the
   * producing turn otherwise. Never invented: a card with no duration simply omits the line. */
  T3Thread.prototype._handoffWorkedSeconds = function () {
    var svc = this.ctx.services;
    var active = svc.surfaces ? svc.surfaces.activeFor(this.tid()) : null;
    if (active && active.goal && svc.goals && svc.goals.completionReceipt) {
      var receipt = svc.goals.completionReceipt(active.goal);
      if (receipt && receipt.workedSeconds != null) return receipt.workedSeconds;
    }
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].runtime && msgs[i].runtime.workedSeconds != null) return msgs[i].runtime.workedSeconds;
    }
    return null;
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

  /* ---------------------------------------------------------------- question: the spine stepper
   *
   * This concept's whole vocabulary is a vertical spine with square markers, so a question is not a
   * card dropped beside the spine — it is a RUN OF NODES ON the spine. Each question is one square
   * node; the active node holds the option list; answered nodes fill solid and skipped nodes stay
   * hollow. That means the progress indicator is not a separate label at all: **the filled-node run
   * IS the progress**, which is why there is no `2 of 3` text anywhere in this concept.
   *
   * Cancel replaces the whole run with a single `Questions cancelled` node rather than removing it,
   * because the spine is a chronology and a gap in it would be a lie about what happened.
   */
  /* The run, created ONCE and kept. Every node in it is kept too, keyed by its question.
   *
   * The old build emptied the host and re-made the whole run per render, which is why the two things
   * `reference/videos/02_stable_paged_questionnaire.mov` is most precise about could not be done here
   * at all. Paging back to an answered question has to find the answer already there and the card
   * NOT replaying its arrival — that needs an element with a memory. And the size change when a page
   * gains or loses its option list has to be something the reader watches happen — that needs a box
   * that was the same box a moment ago.
   *
   * `pmx-resize-up` is PMConcept7's bottom anchor (`top: auto`, "height changes shrink the top edge,
   * not the spawn edge"). The run sits directly above the composer in every window that hosts it, and
   * inline it is the last thing in the thread, so it must grow into its own space rather than shove
   * what is above it. Where the host gives it no spare room the class does nothing, which is the
   * honest outcome: an anchor is layout, and layout belongs to the window. */
  T3Thread.prototype._questionRunFor = function (host) {
    if (this._qrun && this._qrun.parentNode === host) return this._qrun;
    this._qrun = U().el('div', { class: 't3-qrun pmx-resize-up', data: { phase: 'active' } });
    this._qnodeEls = {};
    this._qendNode = null;
    this._qactiveBody = null;
    host.appendChild(this._qrun);
    return this._qrun;
  };

  T3Thread.prototype._dropQuestionRun = function (host) {
    if (this._qrun && this._qrun.parentNode) this._qrun.parentNode.removeChild(this._qrun);
    this._qrun = null;
    this._qnodeEls = {};
    this._qendNode = null;
    this._qactiveBody = null;
    this._qOptionCount = null;
    /* The visit memory died with the element, so the flow it belonged to has to be forgotten too or
     * the next run of the same flow would be compared against a run that no longer exists. */
    this._qflowId = null;
    if (host) U().empty(host);
  };

  /* The body of the node this page is ABOUT: the active question's, or the terminal node's once every
   * question has been visited. It is the box whose size the page actually changes, and it is looked up
   * BEFORE the rebuild so the bounce has a start height to travel from. Null on the first render of a
   * flow, when the node does not exist yet. */
  T3Thread.prototype._questionPageBody = function (q, idx, atEnd) {
    if (atEnd) return this._qendNode ? this._qendNode.body : null;
    var questions = (q && q.questions) || [];
    var question = questions[idx];
    var rec = question && this._qnodeEls ? this._qnodeEls[question.id] : null;
    return rec ? rec.body : null;
  };

  T3Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard. yieldForQuestion notifies the store, which re-enters update() and
     * therefore this function, mid-render. The inner pass fills the run, and the outer pass would
     * then fill it again from a record it read before the yield. */
    if (this._inRenderQuestion) return;

    var self = this;
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;

    var q = svc.questionnaire ? svc.questionnaire.activeFor(this.tid()) : null;
    var receipt = q ? null : this._lastReceipt();
    /* Neither a live flow nor a receipt: the spine has nothing to say about questions, so the run is
     * removed rather than left standing empty. */
    if (!q && !receipt) { this._dropQuestionRun(host); return; }

    var idx = q ? svc.questionnaire.currentIndex(q.id) : 0;
    var atEnd = q && svc.questionnaire.atEnd ? svc.questionnaire.atEnd(q.id) : false;
    var R = global.PMXReveal;
    var mo = svc.motion;
    var key = R ? R.keyFor(svc, this.tid()) : '';
    var prevKey = this._qkey || '';
    this._qkey = key;

    /* Measured before the mutation, because after it the previous page is gone. An option COUNT that
     * changes is a change of shape rather than of size, which is what the firmer bounce is for: three
     * options becoming four is a nudge, four becoming a write-in field is a different box. */
    var count = this._questionOptionCount(q, idx, atEnd);
    var countChanged = this._qOptionCount != null && this._qOptionCount !== count;
    this._qOptionCount = count;

    var born = !this._qrun || this._qrun.parentNode !== host;
    var run = this._questionRunFor(host);
    /* A genuinely NEW questionnaire in a run that survived the last one forgets what the old one
     * showed; the ids of a demo flow repeat, and without this the second run of the same flow would
     * find every key already stamped and arrive in silence. */
    if (q && q.id !== this._qflowId) {
      if (this._qflowId && mo && mo.forgetVisits) mo.forgetVisits(run);
      this._qflowId = q.id;
    }

    var outBody = this._qactiveBody;
    var inBody = this._questionPageBody(q, idx, atEnd);

    function fill() { self._renderQuestionBody(run, q, idx, atEnd, receipt); }

    this._inRenderQuestion = true;
    try {
      this._bounceQuestion(run, outBody, inBody, countChanged, born, fill);
    } finally { this._inRenderQuestion = false; }

    this._qactiveBody = this._questionPageBody(q, idx, atEnd);
    this._choreographQuestion(run, key, prevKey, born, !!q);
  };

  /* How many options the page being rendered offers. A freeform question offers none and the terminal
   * node none either — honest zeroes rather than absences, because what the bounce needs to know is
   * whether the number CHANGED. */
  T3Thread.prototype._questionOptionCount = function (q, idx, atEnd) {
    if (!q || atEnd) return 0;
    var question = (q.questions || [])[idx];
    return (question && question.options) ? question.options.length : 0;
  };

  /* WHERE THE BOUNCE LANDS, and why it is not the run.
   *
   * Every question is on screen at once here, so a page turn is not one card's contents being
   * replaced: it is one node LETTING GO of its option list while another TAKES one. Two boxes change
   * size, in opposite directions, and the run's own height is just their sum. Bouncing the run would
   * clip the whole column behind one height transition and say that the run resized, when what
   * resized is a node.
   *
   * So the outgoing body and the incoming body each get their own bounce, nested so that the outgoing
   * one is measured before the rebuild and the incoming one from inside it. They are siblings in a
   * flex column, so neither measurement can disturb the other, and the run's height follows from
   * layout without anybody animating it. The spine's rhythm is untouched: the markers keep their
   * column and their spacing, and only the distance between two of them changes.
   *
   * The firmer variant goes to the box that GAINED the shape, never to the one that let it go. */
  T3Thread.prototype._bounceQuestion = function (run, outBody, inBody, countChanged, born, fill) {
    var self = this;
    var mo = this.ctx.services.motion;
    var strong = countChanged ? 'pmx-size-bounce-strong' : 'pmx-size-bounce';

    /* A run that did not exist a moment ago did not change size, it arrived; the cascade below is what
     * states an arrival. */
    if (born || !mo || !mo.resizeBounce) { fill(); return; }

    /* Both handles are kept for one reason: if the reader turns reduced motion ON mid-flight, the
     * pinned heights have to be landed rather than left behind. See _settleMotion. */
    if (inBody && outBody && inBody !== outBody) {
      this._trackBounce(mo.resizeBounce(outBody, function () {
        self._trackBounce(mo.resizeBounce(inBody, fill, { bounceClass: strong }));
      }, { bounceClass: 'pmx-size-bounce' }));
      return;
    }
    /* One box, or none yet: the page did not move between nodes, so there is one size to state. */
    this._trackBounce(mo.resizeBounce(inBody || run, fill, { bounceClass: strong }));
  };

  /* The concept's OWN choreography, composed from primitives. The shared afterRender that used to
   * live here decided the entrance, advance and collapse for all eight concepts identically; the
   * packet makes that a hard failure, so each concept now spends its own primitives in its own order.
   *
   * ON HEIGHT, WHICH THIS CONCEPT USED TO REFUSE OUTRIGHT
   * -----------------------------------------------------
   * The note that stood here said a spine node is a fixed-size marker and that growing a box would
   * break the rhythm of the column, so nothing ever sprang. The first half was already untrue of the
   * code beside it: `.t3-qnode` is a marker AND a body, and the active node's body has always grown
   * to hold an option list. What actually happened was that it grew in one frame, unannounced, and
   * every node below it jumped — a size change nobody could watch, which is the failure the refusal
   * was meant to prevent, arriving by the other route.
   *
   * The decision is reversed deliberately and narrowly. Height motion belongs to the node BODY that
   * gained or lost the list (see _bounceQuestion), never to the marker, never to the spine segment,
   * and never to the run as a whole. The rhythm the note was protecting is the marker column, and the
   * marker column is exactly what still never moves. */
  T3Thread.prototype._choreographQuestion = function (run, key, prevKey, born, live) {
    var R = global.PMXReveal;
    var mo = this.ctx.services.motion;
    if (!R || !mo || !run) return;

    /* Same question, one more keystroke: stay completely silent. A freeform textarea re-renders on
     * every character because typing writes a draft and the draft notifies the store, so animating
     * on append would replay the entrance per character. */
    if (prevKey === key && !born) return;

    /* THE GUARD, and the whole of behaviour 15: a beat plays for a question this run has never shown,
     * and for no other reason. Travelling BACK finds the key already stamped on the run, so the
     * answer is simply there — which is what the reference shows the moment the reader steps
     * backwards, and what the old `prevKey !== key` test could not tell apart from stepping forward.
     * The visit is recorded whether or not it is animated, so turning reduced motion off later cannot
     * make an old question replay its arrival. */
    var first = mo.firstVisit ? mo.firstVisit(run, key) : true;
    if (!first || !live) return;
    if (R.reduced(run)) return;

    var nodes = Array.prototype.slice.call(run.querySelectorAll('.t3-qnode'));
    if (born) {
      /* ENTRANCE: the run arrives as a cascade down the spine, so it reads as the column being
       * extended rather than a panel appearing beside it. */
      R.stagger(run, nodes);
      global.setTimeout(function () { R.clearStagger(run, nodes); }, 900);
      return;
    }

    /* ADVANCE: vertical travel, on the node that just became current. The bounce beside it states the
     * change of size; this states which node the reader has arrived at. */
    var active = run.querySelector('.t3-qnode[data-state="active"]')
      || run.querySelector('.t3-qnode[data-state="ready"]');
    if (active) R.oneShot(active, 't3-qnode-travel', 420);
  };

  /* Fills the run. The run and its per-question nodes are kept; what is rebuilt is what each node
   * SAYS — its state, its prompt, and whether it is carrying the option list this page. */
  T3Thread.prototype._renderQuestionBody = function (run, q, idx, atEnd, receipt) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    if (!run) return;

    if (!q) {
      /* Release the yield. Only the Cancel handler ever cleared it before, so a SUBMITTED flow left
       * `surfacesYielded` true forever and every reader of surfaces.activeFor - this cluster and any
       * window chrome that asks - saw an empty thread for the rest of the session. */
      if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(this.tid(), false);
      /* A resolved flow leaves its receipt ON the run's own spine segment, in place of the nodes it
       * asked with. The receipt is durable state, so it is rendered from history rather than
       * remembered in a module local. */
      U().empty(run);
      this._qnodeEls = {};
      this._qendNode = null;
      run.setAttribute('data-phase', 'done');
      this._renderQuestionReceipt(run, receipt);
      return;
    }

    /* An active question takes priority; the work surfaces yield space but keep their state and
     * come back untouched when it resolves. */
    if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(this.tid(), true);

    var questions = q.questions || [];
    run.setAttribute('data-phase', q.status || 'active');
    this._qnodeEls = this._qnodeEls || {};

    /* The preparing beat is a single hollow node with the capsule material inside it, so the
     * surface that becomes the question is already on the spine before the question exists. It is not
     * one of the question nodes and does not survive into the flow: what replaces it is the run of
     * real questions, which is the morph 04_questionnaire_morph_prepare_submit.mov is built on. */
    if (q.status === 'preparing') {
      U().empty(run);
      this._qnodeEls = {};
      this._qendNode = null;
      var prep = u.el('div', { class: 't3-qnode', data: { state: 'preparing' } });
      prep.appendChild(u.el('span', { class: 't3-qmark' }));
      prep.appendChild(u.el('div', { class: 't3-qbody' }, [
        global.PMXReveal.capsule('Preparing questions', this.ctx)
      ]));
      run.appendChild(prep);
      return;
    }

    /* Nodes that belong to a flow this run is no longer asking are removed. Nothing else removes one,
     * because a node is a question's place on the chronology. */
    var wanted = {};
    questions.forEach(function (question) { wanted[question.id] = true; });
    for (var gone in this._qnodeEls) {
      if (!Object.prototype.hasOwnProperty.call(this._qnodeEls, gone)) continue;
      if (wanted[gone]) continue;
      var dead = this._qnodeEls[gone];
      if (dead.node && dead.node.parentNode) dead.node.parentNode.removeChild(dead.node);
      delete this._qnodeEls[gone];
    }
    /* The preparing node has no question of its own, so it is not in the map and the sweep above
     * cannot reach it. */
    var stray = run.querySelector('.t3-qnode[data-state="preparing"]');
    if (stray && stray.parentNode) stray.parentNode.removeChild(stray);

    questions.forEach(function (question, i) {
      var answered = question.kind === 'freeform'
        ? !!(question.draft && String(question.draft).trim())
        : !!(question.selected && question.selected.length);
      var skipped = self._isSkipped(q, question.id);
      var isActive = i === idx && !atEnd;

      /* ACTIVE outranks skipped. Travelling back to a skipped question makes it the current one, and
       * ranking `skipped` first rendered it as an inert hollow marker with no option list and no
       * field for a refusal to land on - the run looked frozen with nothing active anywhere. The skip
       * is still true, so it rides along as its own attribute rather than being lost. */
      var state = isActive ? 'active' : (skipped ? 'skipped' : (answered ? 'answered' : 'pending'));

      var rec = self._qnodeEls[question.id] || self._makeQuestionNode(question, i);
      var node = rec.node;
      node.setAttribute('data-state', state);
      node.setAttribute('data-skipped', skipped ? '1' : '0');
      rec.mark.setAttribute('aria-label', 'Question ' + (i + 1) + ', ' + state);
      /* Re-appending a survivor is how spine order is kept equal to question order without touching
       * the element: appendChild moves a node the run already owns rather than recreating it. */
      run.appendChild(node);

      var body = rec.body;
      U().empty(body);
      body.appendChild(u.el('p', { class: 't3-qprompt', text: question.prompt }));

      if (isActive) {
        if (question.options && question.options.length) {
          var opts = u.el('div', { class: 't3-qopts' });
          question.options.forEach(function (opt) {
            var sel = (question.selected || []).indexOf(opt) >= 0;
            var b = u.el('button', { class: 't3-opt', text: opt, aria: { pressed: sel ? 'true' : 'false' } });
            self._on(b, 'click', function (ev) {
              if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
              svc.questionnaire.answer(q.id, question.id, opt);
              self.renderQuestion();
            });
            opts.appendChild(b);
          });
          body.appendChild(opts);
        } else {
          var ta = u.el('textarea', { class: 't3-qfree pmx-scroll', aria: { label: question.prompt } });
          ta.setAttribute('spellcheck', 'false');
          ta.value = question.draft || '';
          self._on(ta, 'input', function () { svc.questionnaire.answer(q.id, question.id, ta.value); });
          body.appendChild(ta);
        }

        /* The validation reason renders AT the field that caused it. A toast above the card would
         * separate the complaint from the thing it is about, which is the whole reason the service
         * returns a per-question reason rather than a single boolean. */
        var reason = u.el('p', { class: 't3-qreason', data: { show: '0' } });
        /* A refusal raised by the terminal node is carried across the one render it takes to travel
         * to the offending question, then consumed - it must not survive into a later render. */
        if (self._pendingReason) {
          reason.textContent = self._pendingReason;
          reason.setAttribute('data-show', '1');
          self._pendingReason = null;
        }
        body.appendChild(reason);
        rec.reasonEl = reason;

        body.appendChild(self._buildQuestionActions(q, question, i, reason));
      } else {
        rec.reasonEl = null;
      }

      /* Unskip is reachable from EITHER form - active or not. It was reachable from nowhere before
       * this build: the service has always had it and no concept surfaced it, so a skip was
       * effectively permanent. */
      if (skipped) {
        var un = u.el('button', { class: 't3-qmini', type: 'button', text: 'Unskip' });
        self._on(un, 'click', function () {
          svc.questionnaire.unskip(q.id, question.id);
          svc.questionnaire.goTo(q.id, i);
          self.renderQuestion();
        });
        body.appendChild(un);
      }
    });

    if (atEnd) {
      /* A terminal node, not a floating button: the spine has to show that the run is complete and
       * waiting on one decision. It is kept like every other node, because once every question has
       * been visited THIS is the box the page is about and the box whose size changes. */
      if (!this._qendNode) {
        var end = u.el('div', { class: 't3-qnode', data: { state: 'ready' } });
        end.appendChild(u.el('span', { class: 't3-qmark' }));
        var endBody = u.el('div', { class: 't3-qbody' });
        end.appendChild(endBody);
        this._qendNode = { node: end, body: endBody };
      }
      U().empty(this._qendNode.body);
      this._qendNode.body.appendChild(u.el('p', {
        class: 't3-qprompt', text: 'Every question has been visited.'
      }));
      this._qendNode.body.appendChild(this._buildQuestionActions(q, null, idx, null));
      run.appendChild(this._qendNode.node);
    } else if (this._qendNode) {
      if (this._qendNode.node.parentNode) this._qendNode.node.parentNode.removeChild(this._qendNode.node);
      this._qendNode = null;
    }
  };

  /* One question's node, built ONCE. The marker's handler is bound here and never rebound: the
   * question's index in the flow is fixed, and the record id is read from the live flow at click time
   * so a node that outlives one pass cannot navigate a record that is over. */
  T3Thread.prototype._makeQuestionNode = function (question, i) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;

    var node = u.el('div', {
      class: 't3-qnode',
      data: { state: 'pending', q: question.id, skipped: '0' }
    });
    var mark = u.el('button', {
      class: 't3-qmark', type: 'button',
      aria: { label: 'Question ' + (i + 1) }
    });
    /* The marker is the navigation. goTo is the service's own affordance and no concept exposed it;
     * on a spine it is the obvious gesture, so it is wired here. */
    this._on(mark, 'click', function () {
      var live = svc.questionnaire ? svc.questionnaire.activeFor(self.tid()) : null;
      if (!live) return;
      svc.questionnaire.goTo(live.id, i);
      self.renderQuestion();
    });
    node.appendChild(mark);

    var body = u.el('div', { class: 't3-qbody' });
    node.appendChild(body);

    var rec = { node: node, mark: mark, body: body, reasonEl: null };
    this._qnodeEls[question.id] = rec;
    return rec;
  };

  /* The receipt of the last resolved flow, or null. Read from the store because it is durable state:
   * "what happened to those questions" must be answerable from the transcript alone. */
  T3Thread.prototype._lastReceipt = function () {
    var slice = this.ctx.store.view(this.tid()).questionnaire;
    var history = (slice && slice.history) || [];
    if (!history.length) return null;
    var last = history[history.length - 1];
    return last && last.receipt ? last : null;
  };

  /* Skip state is owned by the questionnaire service, whose key format is private to it. Asking the
   * service is the only correct read; reconstructing the key here would couple this renderer to a
   * delimiter it cannot see. */
  T3Thread.prototype._isSkipped = function (q, questionId) {
    var svc = this.ctx.services.questionnaire;
    return !!(svc && svc.isSkipped && svc.isSkipped(q.id, questionId));
  };

  T3Thread.prototype._buildQuestionActions = function (q, question, idx, reasonEl) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var acts = u.el('div', { class: 't3-qacts' });

    function showReason(text) {
      if (!reasonEl) { if (svc.toast) svc.toast.show(text); return; }
      reasonEl.textContent = text;
      reasonEl.setAttribute('data-show', '1');
      if (global.PMXReveal) global.PMXReveal.reject(reasonEl);
    }

    if (idx > 0) {
      /* Back was unreachable before this build. A three-question flow you cannot walk backwards is
       * a form, not a conversation. */
      var back = u.el('button', { class: 't3-qact', type: 'button', text: 'Back' });
      this._on(back, 'click', function () { svc.questionnaire.prev(q.id); self.renderQuestion(); });
      acts.appendChild(back);
    }

    if (question) {
      var skip = u.el('button', { class: 't3-qact', type: 'button', text: 'Skip' });
      this._on(skip, 'click', function () {
        svc.questionnaire.skip(q.id, question.id);
        self.renderQuestion();
      });
      acts.appendChild(skip);
    }

    var atEnd = svc.questionnaire.atEnd ? svc.questionnaire.atEnd(q.id) : false;
    var primary = u.el('button', {
      class: 't3-qact t3-qact-primary', type: 'button',
      text: atEnd ? 'Submit' : 'Next'
    });
    this._on(primary, 'click', function () {
      if (atEnd) {
        var res = svc.questionnaire.submit(q.id);
        if (!res.ok) {
          /* The terminal node has no field of its own, so a refusal shown HERE would be a complaint
           * detached from its cause - which is the toast behaviour the packet rules out. Travel back
           * to the offending question instead; the reason then renders at that field, and the run's
           * markers show which node is being complained about. */
          var offender = (res.missingRequired || [])[0];
          if (offender) {
            var questions = q.questions || [];
            for (var i = 0; i < questions.length; i++) {
              if (questions[i].id === (offender.id || offender)) { svc.questionnaire.goTo(q.id, i); break; }
            }
            self._pendingReason = res.reason || 'This question is required.';
            self.renderQuestion();
            return;
          }
          showReason(res.reason || 'Answer the required questions first.');
          return;
        }
        /* Settle the submitting beat so the receipt exists at the end of this interaction rather
         * than 700 ms later, which is also what makes the probe deterministic. */
        svc.questionnaire.finishSubmit(q.id);
      } else {
        var adv = svc.questionnaire.next(q.id);
        /* next() validates, and returns the refusal rather than throwing. */
        if (adv && adv.ok === false) { showReason(adv.reason); return; }
      }
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(primary);

    var cancel = u.el('button', { class: 't3-qact', type: 'button', text: 'Cancel' });
    this._on(cancel, 'click', function () {
      svc.questionnaire.cancel(q.id);
      if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(self.tid(), false);
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(cancel);

    return acts;
  };

  /* The receipt node. Submitted and cancelled both leave one, because "what happened to those
   * questions" must be answerable from the transcript alone. It is appended to the RUN, on the same
   * spine segment the questions stood on, so the chronology continues rather than restarting. */
  T3Thread.prototype._renderQuestionReceipt = function (host, last) {
    var u = U();
    var svc = this.ctx.services;
    if (!host || !last || !last.receipt) return;

    var cancelled = last.receipt.status === 'cancelled';
    var node = u.el('div', {
      class: 't3-qnode t3-qreceipt',
      data: { state: cancelled ? 'cancelled' : 'answered' }
    });
    node.appendChild(u.el('span', { class: 't3-qmark' }));

    var answered = 0;
    for (var k in last.receipt.answers) if (Object.prototype.hasOwnProperty.call(last.receipt.answers, k)) answered++;
    var skippedCount = (last.receipt.skipped || []).length;

    /* Cancel collapses the WHOLE run to one node. The matrix is explicit about it, and it is the
     * right shape: a cancelled run has one fact, not three. */
    var text = cancelled
      ? 'Questions cancelled'
      : (answered + ' answered' + (skippedCount ? ', ' + skippedCount + ' skipped' : ''));

    var body = u.el('div', { class: 't3-qbody' }, [u.el('p', { class: 't3-qprompt', text: text })]);
    var open = u.el('button', { class: 't3-qmini', type: 'button', text: 'Show answers' });
    this._on(open, 'click', function () {
      svc.popup.open({
        anchorEl: open, kind: 'panel', width: 300,
        build: function (h) {
          h.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Question receipt' }));
          (last.questions || []).forEach(function (question) {
            var val = last.receipt.answers[question.id];
            var wasSkipped = (last.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't3-qreceipt-row' }, [
              u.el('span', { class: 't3-qreceipt-q', text: question.prompt }),
              u.el('span', {
                class: 't3-qreceipt-a',
                text: wasSkipped ? 'Skipped' : (val == null ? 'No answer' : [].concat(val).join(', '))
              })
            ]));
          });
        }
      });
    });
    body.appendChild(open);
    node.appendChild(body);
    host.appendChild(node);
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
    if (this._artOff) { try { this._artOff(); } catch (e) {} this._artOff = null; }
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
    /* The motion subscription outlives the DOM it was watching for, so it is released here or a
     * replaced instance keeps answering flag changes on elements nobody can see. */
    if (this._motionOff) { try { this._motionOff(); } catch (e) {} this._motionOff = null; }
    if (this.scrollCtl && this.scrollCtl.destroy) { try { this.scrollCtl.destroy(); } catch (e) {} }
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    if (this.inlineQuestion && this.inlineQuestion.parentNode) this.inlineQuestion.parentNode.removeChild(this.inlineQuestion);
    this.rendered = {};
    /* The append-only path keys off these. A destroyed instance that left them behind would let the
     * next render mistake a fresh mount for an append and skip drawing the spine already on
     * screen. */
    this._renderedIds = null;
    this._renderedFrom = null;
    this.surfacesTail = null;
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
