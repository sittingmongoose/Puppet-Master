/* t2 "Two-Tone Slabs" — Opus 5
 *
 * Role contrast lives in the FIELD, never a border. A user turn is an inset slab: a tinted
 * background, rounded corners, a narrower measure, held to the right margin. An assistant
 * turn is full-bleed: untinted, edge to edge, the widest possible measure. Nothing in this
 * concept draws a bubble outline anywhere — the tint plus the inset alone tell you who is
 * speaking.
 *
 * The bet: once role is legible from field and position alone, every piece of machinery
 * (Goal, Todo, subagents, diffs, per-turn activity, thought, answered questions, artifacts)
 * can be demoted to one horizontal run of small chips sitting under the assistant slab it
 * belongs to. A chip carries only a category word and a condensed status; the full record
 * opens in a popup sheet on click. Nothing ever grows inline, so a long conversation never
 * accumulates nested cards.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }

  /* Collapse rule for this concept: eligibility at 850 characters, preview clamped to 7
   * lines. The assistant slab is full-bleed (a wide measure), so a slightly taller preview
   * still reads as bounded; the user slab is narrower and wraps sooner regardless. */
  var COLLAPSE_ELIGIBLE_CHARS = 850;
  var PREVIEW_LINES = 7;

  /* Operations in the chip run. Four loose chips is the point at which the run stops reading as a
   * row of facts and starts reading as a wall, so past it the settled operations fold into the one
   * count chip this concept already uses for a tool run. */
  var OPS_CHIP_MAX = 4;

  /* A decorative glyph per operation kind. The chip's own words carry the meaning (contract 8.1);
   * every name here is checked against the icon set before use and falls back to `dot`. */
  var OP_GLYPH = {
    thought: 'layers', read: 'file', search: 'search', web: 'globe', browser: 'browser',
    test: 'beaker', edit: 'edit', generate: 'sparkle', verify: 'check'
  };

  function T2Thread(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.rendered = {};        /* msgId -> { el, bodyEl, proseEl, chipsRowEl, surfaceChipsEl } */
    this.latestAssistantId = null;
    this.lastThreadId = null;
    this.build();
  }

  T2Thread.prototype._on = function (el, ev, fn, opts) {
    this.offs.push(U().on(el, ev, fn, opts));
  };

  T2Thread.prototype.build = function () {
    var self = this;
    var u = U();

    this.root = u.el('div', { class: 't2-root' });

    this.head = u.el('div', { class: 't2-head' }, [
      u.el('span', { class: 't2-head-name', text: 'Two-Tone Slabs' }),
      u.el('span', { class: 't2-head-model', text: this.ctx.label })
    ]);
    this.root.appendChild(this.head);

    this.scroller = u.el('div', { class: 't2-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't2-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    /* Fallback footer, used only when the window offers no work-surface host AND no
     * assistant turn has rendered yet to carry the chip run (an edge case at the very start
     * of a thread). Two of the eight windows provide neither host, so this path is real. */
    this.inlineSurfaces = u.el('div', { class: 't2-inline-surfaces' });
    this.inlineQuestion = u.el('div', { class: 't2-inline-question' });
    if (!this.ctx.capabilities.workSurfaceHost) this.root.appendChild(this.inlineSurfaces);
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);

    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t2-turn',
      messageAttr: 'data-pmx-msg'
    });

    this.jumpBtn = u.el('button', { class: 't2-jump', text: 'Jump to latest' });
    this._on(this.jumpBtn, 'click', function () {
      self.scrollCtl.scrollToBottom ? self.scrollCtl.scrollToBottom() :
        (self.scroller.scrollTop = self.scroller.scrollHeight);
    });
    /* The pill lives in its OWN lane directly after the scroller, not floating over it.
     * Floating meant the pill sat on top of whatever line happened to be at the bottom of
     * the viewport mid-scroll — measured covering prose at 17 of 24 scroll positions. The
     * lane is a permanent flex item, so the transcript viewport never changes height and
     * the overlap is impossible by construction rather than by clearance arithmetic. */
    this.jumpLane = u.el('div', { class: 't2-jump-lane' });
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

  T2Thread.prototype.tid = function () {
    return this.ctx.store.get('session.activeThreadId');
  };

  /* ---------------------------------------------------------------- rendering */

  T2Thread.prototype.renderThread = function () {
    var tid = this.tid();
    var data = this.ctx.data;
    var view = this.ctx.store.view(tid);
    var msgs = data.visibleSlice(tid, view.loadedFrom);

    /* 01_message_arrival_spatial_continuity.mov, frames 47 to 63 (about 280ms at 57.6fps): the new
     * message enters as a flattened sliver at a seam and expands into its box, while everything
     * already on screen keeps its identity. Rebuilding the whole list cannot say that - every slab
     * is new, so every slab replays its tone fade, and the one that actually arrived is
     * indistinguishable from the twenty that did not.
     *
     * So an append is an append. When the only difference is messages added at the END of the same
     * thread and the same loaded range, the existing slabs are kept and the new ones are inserted
     * through motion.displace(); anything else is a genuine rebuild. */
    if (this._canAppendOnly(tid, view, msgs)) { this._appendTurns(msgs); return; }

    U().empty(this.list);
    this.rendered = {};
    this.lastThreadId = tid;
    /* The live indicator node, if any, was just detached along with everything else in the
     * list. Drop the stale reference so syncLive() below rebuilds a properly attached one
     * instead of quietly updating an orphaned element that is no longer on screen. */
    this.liveEl = null;

    this.latestAssistantId = null;
    for (var a = msgs.length - 1; a >= 0; a--) {
      if (msgs[a].role === 'assistant') { this.latestAssistantId = msgs[a].id; break; }
    }

    var thread = data.threadById(tid);
    var hidden = thread ? Math.max(0, thread.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlderNotice(hidden));

    var prevRole = null;
    for (var i = 0; i < msgs.length; i++) {
      var turn = this.buildTurn(msgs[i], prevRole);
      this.list.appendChild(turn);
      prevRole = msgs[i].role;
    }

    /* What the next render compares against to decide whether anything ARRIVED. */
    this._renderedIds = msgs.map(function (m) { return m.id; });
    this._renderedFrom = view.loadedFrom;
    this._lastRole = prevRole;

    this.renderSurfaces();
    this.renderQuestion();
    this.syncLive();
    /* Artifact state lives outside the store, so its ticks arrive here and nowhere else. */
    var selfArt = this;
    if (this.ctx.services.artifacts && this.ctx.services.artifacts.subscribe && !this._artOff) {
      this._artOff = this.ctx.services.artifacts.subscribe(function () {
        if (selfArt._handoffHost) selfArt._renderHandoff(selfArt._handoffHost);
      });
    }
  };

  T2Thread.prototype.buildOlderNotice = function (hidden) {
    var self = this;
    var u = U();
    var btn = u.el('button', {
      class: 't2-older',
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
    return u.el('div', { class: 't2-older-wrap' }, [btn]);
  };

  /* True only when this render differs from the last by messages APPENDED to the end. A changed
   * thread, a changed loaded range, a removal, or any edit to an existing slab all fail this and
   * fall back to the rebuild, because none of those is an arrival and animating a reflow as though
   * something had just been said would be a lie about what happened. */
  T2Thread.prototype._canAppendOnly = function (tid, view, msgs) {
    if (!this._renderedIds || tid !== this.lastThreadId) return false;
    if (view.loadedFrom !== this._renderedFrom) return false;
    if (msgs.length <= this._renderedIds.length) return false;
    for (var i = 0; i < this._renderedIds.length; i++) {
      if (msgs[i].id !== this._renderedIds[i]) return false;
    }
    return true;
  };

  /* The running indicator is the FOOT of the list, not a message, so an arriving turn is filed
   * above it rather than after it. */
  T2Thread.prototype._listTail = function () {
    return (this.liveEl && this.liveEl.parentNode === this.list) ? this.liveEl : null;
  };

  T2Thread.prototype._appendTurns = function (msgs) {
    var self = this;
    var svc = this.ctx.services;
    var start = this._renderedIds.length;
    var prevRole = this._lastRole;
    var tail = this._listTail();

    /* When the window offers no work-surface host the chip run hangs off the LATEST assistant turn,
     * so an arriving assistant turn takes that role over. Recomputing before the turns are built is
     * what lets buildChipsRow reserve the nested container on the new turn, and detaching the run
     * that is still parented to the previous one is what stops _surfaceContainer from building a
     * second run and leaving the first on screen underneath it. */
    var prevLatest = this.latestAssistantId;
    for (var a = msgs.length - 1; a >= 0; a--) {
      if (msgs[a].role === 'assistant') { this.latestAssistantId = msgs[a].id; break; }
    }
    if (!this.ctx.capabilities.workSurfaceHost && this.latestAssistantId !== prevLatest) {
      /* Only in the inline case. When the window DOES offer a host the run lives there, it is not
       * moving anywhere, and detaching it would throw away the chip identity that the count morph
       * depends on.
       *
       * The whole reserved container goes, not just the run inside it: an emptied one would leave a
       * flex gap under the previous assistant turn exactly where the chips used to be, and a chips
       * row that existed only to hold it would be an empty row. */
      var prevRec = prevLatest ? this.rendered[prevLatest] : null;
      var slot = prevRec ? prevRec.surfaceChipsEl : null;
      if (slot && slot.parentNode) {
        var row = slot.parentNode;
        row.removeChild(slot);
        if (!row.children.length && row.parentNode) {
          row.parentNode.removeChild(row);
          prevRec.chipsRowEl = null;
        }
        prevRec.surfaceChipsEl = null;
      }
    }

    function insert() {
      var last = null;
      for (var i = start; i < msgs.length; i++) {
        last = self.buildTurn(msgs[i], prevRole);
        self.list.insertBefore(last, tail);
        prevRole = msgs[i].role;
      }
      /* displace stamps the node this returns, so it names the turn that actually arrived. */
      return last;
    }

    /* Measure, mutate, re-pin - in that order. A reader sitting at the bottom is carried with the
     * new slab; a reader who has scrolled up is left where they are, which is the whole reason
     * stickIfAtBottom measures BEFORE the mutation. */
    var run = function () {
      if (svc.motion && svc.motion.displace) svc.motion.displace(self.list, insert);
      else insert();
    };
    if (this.scrollCtl && this.scrollCtl.stickIfAtBottom) this.scrollCtl.stickIfAtBottom(run);
    else run();

    this._renderedIds = msgs.map(function (m) { return m.id; });
    this._lastRole = prevRole;

    this.renderSurfaces();
    this.renderQuestion();
    this.syncLive();
  };

  T2Thread.prototype.buildTurn = function (msg, prevRole) {
    var u = U();
    var svc = this.ctx.services;
    var isUser = msg.role === 'user';
    var lensState = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;

    var turn = u.el('div', {
      class: ['t2-turn', 'pmx-msg'],
      /* Quoted, already-hyphenated keys: PMXUtil.el()'s data:{} helper does a plain
       * setAttribute('data-' + key, ...), and setAttribute lowercases an HTML attribute
       * name WITHOUT inserting hyphens at camelCase boundaries. A key of pmxMsg would
       * therefore land as data-pmxmsg, silently breaking the data-pmx-msg lookup that
       * scroll.attach()'s messageAttr option depends on. */
      data: { 'pmx-msg': msg.id, 'pmx-role': msg.role, lens: lensState || '' }
    });

    var slab = u.el('div', { class: ['t2-slab', 'pmx-msg-body', isUser ? 't2-slab-user' : 't2-slab-assistant'] });
    slab.appendChild(u.el('span', { class: 't2-role-label', text: isUser ? 'You' : 'Assistant' }));

    var eligible = (msg.body || '').length >= COLLAPSE_ELIGIBLE_CHARS;
    var expanded = !!this.ctx.store.view(this.tid()).expanded[msg.id];

    var prose = u.el('div', { class: 't2-prose' });
    this.writeProse(prose, msg.body || '');
    slab.appendChild(prose);

    if (eligible) {
      slab.setAttribute('data-collapsible', '1');
      slab.setAttribute('data-expanded', expanded ? '1' : '0');
      var toggle = u.el('button', { class: 't2-more', text: expanded ? 'Show less' : 'Show more' });
      var self = this;
      this._on(toggle, 'click', function () { self.setExpanded(msg.id, !self.isExpanded(msg.id)); });
      slab.appendChild(toggle);
    }

    turn.appendChild(slab);

    /* Hover row is a SIBLING of the slab, never nested inside it. */
    var hoverRow = global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage(),
      onEdit: function () { svc.toast.show('Editing replaces this message and supersedes the turn'); }
    });
    turn.appendChild(hoverRow);

    var chipInfo = this.buildChipsRow(msg);
    var chipsRowEl = null, surfaceChipsEl = null;
    if (chipInfo) {
      turn.appendChild(chipInfo.row);
      chipsRowEl = chipInfo.row;
      surfaceChipsEl = chipInfo.surfacesEl;
    }

    this.rendered[msg.id] = {
      el: turn, bodyEl: slab, proseEl: prose,
      chipsRowEl: chipsRowEl, surfaceChipsEl: surfaceChipsEl
    };
    return turn;
  };

  T2Thread.prototype.writeProse = function (host, text) {
    var u = U();
    var paras = String(text).split(/\n{2,}/);
    for (var i = 0; i < paras.length; i++) {
      var p = paras[i].replace(/\n/g, ' ').trim();
      if (!p) continue;
      host.appendChild(u.el('p', { class: 't2-p', text: p }));
    }
    if (!host.childNodes.length) host.appendChild(u.el('p', { class: 't2-p', text: text }));
  };

  T2Thread.prototype.lastMessage = function () {
    var msgs = this.ctx.data.messagesFor(this.tid());
    return msgs[msgs.length - 1];
  };

  /* ---------------------------------------------------------------- chips */

  /* A chip is a small pill: category word + condensed status in the visible text (icons stay
   * decorative per contract 8.1), opening a popup sheet with the full record on click. */
  T2Thread.prototype._chip = function (kind, iconName, label, buildDetail, popupWidth) {
    var self = this;
    var u = U();
    var b = u.el('button', { class: 't2-chip', data: { chip: kind } });
    b.appendChild(this.ctx.services.icons.get(iconName, 13));
    b.appendChild(u.el('span', { class: 't2-chip-label', text: label }));
    this._on(b, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget,
        kind: 'panel',
        width: popupWidth || 300,
        build: function (host, api) { buildDetail(host, api); }
      });
    });
    return b;
  };

  /* Builds the chip run for one turn's OWN machinery (activity/thought/answered question).
   * For the latest assistant turn, when no work-surface host exists, also reserves a nested
   * container for the thread-level surfaces (Goal/Todo/Agents/Diff/Artifacts) so they render
   * literally beneath the assistant slab, per this concept's brief. */
  T2Thread.prototype.buildChipsRow = function (msg) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var isAssistant = msg.role === 'assistant';
    var isLatestAssistant = isAssistant && msg.id === this.latestAssistantId;
    var chips = [];

    if (isAssistant) {
      var group = svc.surfaces && svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : null;
      if (group) {
        var actLabel = 'Activity · ' + (svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : 'steps');
        chips.push(this._chip('activity', 'terminal', actLabel, function (host) {
          self.buildActivityDetail(host, group);
        }, 320));
      }
      if (msg.thoughtSegments && msg.thoughtSegments.length) {
        var n = msg.thoughtSegments.length;
        chips.push(this._chip('thought', 'layers', 'Thought · ' + n + (n === 1 ? ' segment' : ' segments'), function (host) {
          self.buildThoughtDetail(host, msg.thoughtSegments);
        }, 320));
      }
      if (msg.completedQuestionnaire) {
        chips.push(this._chip('question', 'info', 'Question · Answered', function (host) {
          self.buildAnsweredDetail(host, msg.completedQuestionnaire);
        }, 320));
      }
    }

    var surfacesEl = null;
    if (isLatestAssistant && !this.ctx.capabilities.workSurfaceHost) {
      surfacesEl = u.el('div', { class: 't2-chips-surfaces' });
    }

    if (!chips.length && !surfacesEl) return null;

    var row = u.el('div', { class: 't2-chips' });
    chips.forEach(function (c) { row.appendChild(c); });
    if (surfacesEl) row.appendChild(surfacesEl);
    return { row: row, surfacesEl: surfacesEl };
  };

  T2Thread.prototype.buildActivityDetail = function (host, group) {
    var u = U();
    var svc = this.ctx.services;
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'What this turn did' }));
    var stages = svc.surfaces && svc.surfaces.activityStages ? svc.surfaces.activityStages(group) : (group.stages || []);
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    stages.forEach(function (st) {
      list.appendChild(u.el('div', { class: 't2-sheet-row' }, [
        u.el('span', { class: 't2-sheet-kind', text: F().label(st.kind) }),
        u.el('span', { class: 't2-sheet-label', text: st.label || '' }),
        u.el('span', { class: 't2-sheet-dur', text: st.durationSeconds != null ? F().duration(st.durationSeconds) : '' })
      ]));
    });
    host.appendChild(list);
    if (group.workedSeconds != null) {
      host.appendChild(u.el('div', { class: 't2-sheet-foot', text: 'Worked for ' + F().duration(group.workedSeconds) }));
    }
  };

  T2Thread.prototype.buildThoughtDetail = function (host, segments) {
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Reasoning summary' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    segments.forEach(function (seg) {
      list.appendChild(u.el('div', { class: 't2-sheet-row' }, [
        u.el('span', { class: 't2-sheet-kind', text: F().label(seg.status) }),
        u.el('span', { class: 't2-sheet-label', text: seg.summary || seg.label || '' })
      ]));
    });
    host.appendChild(list);
    host.appendChild(u.el('div', { class: 't2-sheet-foot', text: 'Provider-exposed summary only.' }));
  };

  T2Thread.prototype.buildAnsweredDetail = function (host, q) {
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Answered question' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    (q.questionsAndAnswers || []).forEach(function (qa) {
      list.appendChild(u.el('div', { class: 't2-qa' }, [
        u.el('div', { class: 't2-qa-q', text: qa.question }),
        u.el('div', { class: 't2-qa-a', text: qa.answer })
      ]));
    });
    host.appendChild(list);
  };

  /* ---------------------------------------------------------------- thread-level surfaces */

  /* ---------------------------------------------------------------- work: the chip run
   *
   * The matrix assigns this concept a CHIP RUN WITH COUNT MORPH: one chip per domain, counts updating
   * INSIDE the chip, the whole run collapsing to a single `13 tools used` chip when the work completes,
   * and that chip reopening the run. Each chip opens its own popup sheet, which is already this
   * concept's established idiom.
   *
   * The load-bearing detail is element IDENTITY. A count that "updates inside the chip" cannot be a
   * rebuilt chip that happens to carry a new string: rebuilding restarts the entrance, drops focus, and
   * closes any sheet anchored to the old node. So this function DIFFS the run - chips are keyed by
   * domain, survivors are updated in place through `motion.swapText`, vanished domains are removed, new
   * ones are appended. That is the whole reason it keeps `_chipEls` rather than emptying its container.
   */
  T2Thread.prototype.renderSurfaces = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;

    var container = this._surfaceContainer();
    if (!container) return;

    /* Ask the flow, not `surfacesYielded`: that flag is written by renderQuestion, which runs after
     * this on every pass, so reading it here paints the run for one frame before the question takes
     * the space. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    var active = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());
    var v = this.ctx.store.view(this.tid());

    function each(val) { return val == null ? [] : (Object.prototype.toString.call(val) === '[object Array]' ? val : [val]); }
    function glyph(name) { return (svc.icons && svc.icons.has && svc.icons.has(name)) ? name : 'dot'; }

    /* ---- the domain list */
    var specs = [];

    if (active && active.goal) {
      var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(active.goal) : null;
      specs.push({
        kind: 'goal', icon: glyph('gauge'),
        /* Phase index first: it is the one fact a compact surface must not lose. */
        label: phase ? ('Phase ' + phase.index + ' of ' + phase.total) : ('Goal \u00b7 ' + F().label(active.goal.status)),
        width: 340,
        build: function (host, api) { self.buildGoalDetail(host, active.goal, api); }
      });
    }

    if (active && active.todo) {
      var items = active.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
      var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
      specs.push({
        kind: 'todo', icon: glyph('check'),
        label: done + '/' + items.length + ' Todos' + (blocked ? ' \u00b7 ' + blocked + ' blocked' : ''),
        width: 300,
        build: function (host) { self.buildTodoDetail(host, active.todo); }
      });
    }

    each(active && active.subagents).forEach(function (g, n) {
      specs.push({
        kind: 'agents' + (n || ''), icon: glyph('crew'),
        label: (svc.surfaces.subagentSummary && svc.surfaces.subagentSummary(g)) || 'No agents active',
        width: 340,
        build: function (host) { self.buildAgentsDetail(host, g); }
      });
    });

    /* ---- the operations.
     *
     * One operation, one chip. The chip says what the record says - `headline`, which already carries
     * the tense rule, plus the count when the wording does not spell it out - and opens the operation
     * card in this concept's popup sheet. Nothing about an operation is ever printed into the
     * transcript: a chip run under the slab is the whole vocabulary here, and a card growing inline
     * would be the nested block this concept exists to avoid.
     *
     * Nine chips would swamp a run that already carries goal, todo, agents, diffs, artifacts and
     * advice, so past OPS_CHIP_MAX they fold into the same count chip the run already uses for a tool
     * run, and that chip's sheet becomes an index over all nine. A RUNNING operation keeps its own
     * chip regardless: what is happening right now is the one fact a compact run must not fold away,
     * and the fold is a display choice, so the count chip still stands for the whole set. */
    var ops = (svc.opcard && svc.opcard.forThread) ? svc.opcard.forThread(this.ctx, this.tid()) : [];
    if (ops.length) {
      var loose = ops;
      if (ops.length > OPS_CHIP_MAX) {
        loose = ops.filter(function (op) { return op.running; });
      }
      loose.forEach(function (op) {
        specs.push({
          kind: 'op-' + op.id, icon: glyph(OP_GLYPH[op.kind] || 'dot'),
          label: self.opChipLabel(op),
          running: op.running,
          width: 360,
          build: function (host, api) { self.buildOpDetail(host, api, op, null); }
        });
      });
      if (loose.length < ops.length) {
        specs.push({
          kind: 'ops', icon: glyph('beaker'),
          label: ops.length + (ops.length === 1 ? ' operation' : ' operations'),
          width: 360,
          build: function (host, api) { self.buildOpsIndex(host, api, ops); }
        });
      }
    }

    each(active && active.diffs).forEach(function (g, n) {
      var fs = g.files || [];
      var add = 0, rem = 0;
      fs.forEach(function (f) { add += f.added || 0; rem += f.removed || 0; });
      specs.push({
        kind: 'diff' + (n || ''), icon: glyph('diff'),
        label: fs.length + (fs.length === 1 ? ' file' : ' files') + ' \u00b7 +' + add + ' \u2212' + rem,
        width: 360,
        build: function (host) { self.buildDiffDetail(host, g); }
      });
    });

    if (thread && thread.artifacts && thread.artifacts.length) {
      specs.push({
        kind: 'artifacts', icon: glyph('artifact'),
        label: thread.artifacts.length + (thread.artifacts.length === 1 ? ' artifact' : ' artifacts'),
        width: 320,
        build: function (host) { self.buildArtifactsDetail(host, thread.artifacts); }
      });
    }

    /* ---- the BSD chip. It joins the run rather than sitting apart, because in this concept a chip IS
     * how a domain announces itself, and advice is a domain. Its sheet is read-only. */
    var bsd = svc.bsd;
    var advice = (bsd && bsd.advice) ? (bsd.advice(this.tid()) || []) : [];
    if (advice.length) {
      var cautions = advice.filter(function (a) { return a.severity === 'caution'; }).length;
      specs.push({
        kind: 'bsd', icon: glyph('bsd'),
        /* The chip states the severity in words: a chip has no room for a legend, so the distinction
         * must not rest on colour. */
        label: cautions
          ? (cautions + (cautions === 1 ? ' caution' : ' cautions'))
          : (advice.length + (advice.length === 1 ? ' note' : ' notes')),
        width: 340,
        severity: cautions ? 'caution' : 'note',
        build: function (host) { self.buildAdviceDetail(host, advice); }
      });
    }

    /* ---- the completed form: ONE chip for the whole run.
     * `13 tools used` comes from the activity group's own condense label - it is the count the corpus
     * recorded, not one this renderer invented. */
    /* activeFor().activity is the LATEST activity group in the thread, found by walking back through
     * the messages. Reading activityGroupFor(lastMessage()) instead - which is what this did first -
     * asks the wrong question: the newest turn frequently carries no activity group at all, so the run
     * never saw a completed group and the collapsed form was unreachable. */
    var group = active ? active.activity : null;
    var complete = !!(group && group.status === 'complete');
    var runOpen = !!(v.surfaces && v.surfaces.expanded === 'run');

    if (!pendingQuestion && complete && !runOpen && specs.length) {
      var collapsed = svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : ((group.stages || []).length + ' steps');
      specs = [{
        kind: 'collapsed', icon: glyph('beaker'), label: collapsed, width: 360,
        /* Clicking it REOPENS the run rather than opening a sheet - it is a state control, not a
         * domain. That is why it carries `reopen` instead of `build`. */
        reopen: true
      }];
    }

    /* ---- the run capsule, above the chips.
     *
     * It renders into its own element inserted before the chip run, so what the run is DOING sits
     * above what is true of the thread, and so groupReopen has real siblings below it to carry when a
     * phase is disclosed. Built here rather than after `_diffChipRun` for one reason: the chips are
     * still on screen from the previous pass, so the displacement the capsule causes on its first
     * appearance is measured against boxes that actually exist. */
    this._renderRunCapsule(container, pendingQuestion);

    /* A pending question yields the WHOLE run. The bsd and artifacts chips are read from the thread and
     * the advice service rather than through `activeFor`, so without this they survived the yield and left
     * a two-chip stub beside the question - a partial cluster, which is worse than none. Advice hides with
     * the run in this concept because it IS a chip in it; there is no separate host for it to outlive. */
    this._diffChipRun(container, pendingQuestion ? [] : specs, !pendingQuestion && runOpen && complete);

    /* Advice and the handoff live in their own hosts so an artifact tick repaints the card without
     * rebuilding the chip run underneath it. */
    if (!this._handoffHost || this._handoffHost.parentNode !== container.parentNode) {
      this._handoffHost = u.el('div', { class: 't2-handoff-host' });
      if (container.parentNode) container.parentNode.appendChild(this._handoffHost);
    }
    this._renderHandoff(this._handoffHost);
  };

  T2Thread.prototype._surfaceContainer = function () {
    var u = U();
    if (this.ctx.capabilities.workSurfaceHost) {
      var host = this.ctx.regions.workSurfaceHost;
      if (!host) return null;
      /* One persistent run element. Emptying the host on every pass is what made a chip's identity - and
       * therefore its morph - impossible. */
      if (!this._chipRun || this._chipRun.parentNode !== host) {
        U().empty(host);
        this._chipRun = u.el('div', { class: ['t2-chips', 't2-chips-host'] });
        this._chipEls = {};
        host.appendChild(this._chipRun);
      }
      return this._chipRun;
    }

    var rec = this.latestAssistantId ? this.rendered[this.latestAssistantId] : null;
    var parent = (rec && rec.surfaceChipsEl) ? rec.surfaceChipsEl : this.inlineSurfaces;
    if (!parent) return null;
    if (!this._chipRun || this._chipRun.parentNode !== parent) {
      U().empty(parent);
      this._chipRun = u.el('div', { class: 't2-chips' });
      this._chipEls = {};
      parent.appendChild(this._chipRun);
    }
    return this._chipRun;
  };

  /* The diff. Survivors keep their element - and therefore their popup anchor, their focus and their
   * entrance - while only their text changes. */
  T2Thread.prototype._diffChipRun = function (container, specs, showCollapseControl) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    this._chipEls = this._chipEls || {};

    var wanted = {};
    specs.forEach(function (s) { wanted[s.kind] = true; });

    /* remove chips whose domain is gone */
    for (var kind in this._chipEls) {
      if (!Object.prototype.hasOwnProperty.call(this._chipEls, kind)) continue;
      if (wanted[kind]) continue;
      var gone = this._chipEls[kind];
      if (gone && gone.btn && gone.btn.parentNode) gone.btn.parentNode.removeChild(gone.btn);
      delete this._chipEls[kind];
    }

    specs.forEach(function (spec) {
      var rec = self._chipEls[spec.kind];

      if (!rec) {
        var btn = u.el('button', {
          class: 't2-chip', type: 'button',
          data: { chip: spec.kind, severity: spec.severity || '', running: spec.running ? '1' : '' }
        });
        if (svc.icons) btn.appendChild(svc.icons.get(spec.icon, 13));
        var label = u.el('span', { class: 't2-chip-label', text: spec.label });
        btn.appendChild(label);
        rec = self._chipEls[spec.kind] = { btn: btn, label: label, text: spec.label, spec: spec };

        self._on(btn, 'click', function (ev) {
          var cur = self._chipEls[spec.kind];
          var live = cur ? cur.spec : spec;
          if (live.reopen) {
            /* Reopen the run. Stored, so it survives a remount and a theme change. */
            var vv = self.ctx.store.view(self.tid());
            vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
            vv.surfaces.expanded = 'run';
            self.ctx.store.touchView('surfaces');
            return;
          }
          svc.popup.open({
            anchorEl: ev.currentTarget, kind: 'panel', width: live.width || 300,
            build: function (host, api) { live.build(host, api); }
          });
        });

        container.appendChild(btn);
        return;
      }

      /* survivor: keep the element, morph the text */
      rec.spec = spec;
      rec.btn.setAttribute('data-severity', spec.severity || '');
      /* An operation settling is a state change on the SAME chip, so the attribute is rewritten in
       * place next to the text morph rather than the chip being rebuilt in its settled form. */
      rec.btn.setAttribute('data-running', spec.running ? '1' : '');
      if (rec.text !== spec.label) {
        if (svc.motion && svc.motion.swapText) svc.motion.swapText(rec.label, spec.label);
        else rec.label.textContent = spec.label;
        rec.text = spec.label;
      }
      /* keep DOM order stable with the spec order */
      container.appendChild(rec.btn);
    });

    /* When the run has been reopened after completing, offer the way back. Without this the collapse is
     * a one-way door and the compact form becomes unreachable. */
    var back = this._chipEls.__back;
    if (showCollapseControl) {
      if (!back) {
        var b = u.el('button', { class: 't2-chip t2-chip-quiet', type: 'button', data: { chip: 'collapse' } }, [
          u.el('span', { class: 't2-chip-label', text: 'Collapse' })
        ]);
        this._on(b, 'click', function () {
          var vv = self.ctx.store.view(self.tid());
          if (vv.surfaces) vv.surfaces.expanded = null;
          self.ctx.store.touchView('surfaces');
        });
        this._chipEls.__back = { btn: b, label: null, text: 'Collapse', spec: {} };
        container.appendChild(b);
      } else {
        container.appendChild(back.btn);
      }
    } else if (back) {
      if (back.btn.parentNode) back.btn.parentNode.removeChild(back.btn);
      delete this._chipEls.__back;
    }
  };

  /* ---------------------------------------------------------------- the run capsule
   *
   * t2's reading of 03_compact_execution_activity.mov. Everything else in this concept demotes to a
   * chip, and the run is no exception: the capsule IS a chip run - one chip per phase the run
   * entered, in entry order, with a lead chip carrying the run's own state.
   *
   * Why a chip run is the honest reading here rather than a convenient one. `_diffChipRun` above is
   * the one place in this workspace that keeps a chip's ELEMENT across renders instead of rebuilding
   * the row, and the two behaviours the reference is most precise about both need an element that was
   * already on screen. `Exploring 5 files` becoming `6 files` becoming `7 files` (f.208 -> f.286 ->
   * f.338) is a morph of a chip that has been sitting there since the phase started, not a new chip
   * wearing a new string; and the glyph that reopens `Explored 7 files` at f.1300 is the same button
   * the reader watched do the work. Rebuild the row and both claims become theatre.
   *
   * Where this parts company with the reference on purpose: the dense record - command, cache,
   * permission, operation input, per-file rows - stays in a popup sheet. A block growing inline is
   * the single thing this concept exists to avoid, so the capsule discloses the phase's own sentence
   * and hands the record to `buildOpDetail`, which is the sheet every other chip here already opens.
   *
   * What is NOT used, and why: `motion.condense` empties its element and rebuilds it from a summary
   * callback. That is right for a concept whose collapsed form replaces its expanded one, and wrong
   * here twice over - the chain has to SURVIVE condensation (f.910 keeps every glyph, because each
   * one is still the route back into its phase), and rebuilding it would destroy the element identity
   * this whole capsule rests on. Condensing is therefore a morph of the lead chip, not a teardown.
   */

  /* The capsule's host, kept for exactly the reason the chip run is kept: a chip whose element is
   * rebuilt cannot morph. It sits ABOVE the domain chips because the run is what is happening now and
   * the chips are what is true of the thread.
   *
   * `_surfaceContainer` empties the work-surface host whenever it has to rebuild the run - a remount,
   * or a window handing over a different region - which detaches this with it. Dropping the chip map
   * in the same breath is what keeps `_runChipEls` from holding elements that are no longer on
   * screen, which is the failure mode that would make a later morph animate nothing. */
  T2Thread.prototype._runHostFor = function (chipRun) {
    var u = U();
    var svc = this.ctx.services;
    var parent = chipRun.parentNode;
    if (!parent) return null;
    if (this._runHost && this._runHost.parentNode === parent) return this._runHost;

    var host = u.el('div', { class: 't2-run', data: { condensed: '0', running: '0' } });
    this._runChain = u.el('div', { class: ['t2-run-chain', 'pmx-chain'] });
    host.appendChild(this._runChain);
    this._runHost = host;
    this._runChipEls = {};
    this._runLead = null;
    this._runDetail = null;
    this._runDetailId = null;
    this._runSubjectId = null;

    /* displace, not an entrance: an arriving element is simply THERE and its NEIGHBOURS move to make
     * room. The chips and the artifact handoff below the capsule are those neighbours, and they slide
     * down rather than jumping the first time a run reports itself. */
    if (svc.motion && svc.motion.displace) {
      svc.motion.displace(parent, function () { parent.insertBefore(host, chipRun); return host; });
    } else {
      parent.insertBefore(host, chipRun);
    }
    return host;
  };

  T2Thread.prototype._dropRunCapsule = function () {
    if (this._runHost && this._runHost.parentNode) this._runHost.parentNode.removeChild(this._runHost);
    this._runHost = null;
    this._runChain = null;
    this._runChipEls = {};
    this._runLead = null;
    this._runDetail = null;
    this._runDetailId = null;
    this._runSubjectId = null;
  };

  T2Thread.prototype._renderRunCapsule = function (chipRun, yielded) {
    var svc = this.ctx.services;

    /* Guarded at every step. The service may be absent entirely, `read` returns null for a thread
     * with no authored stages, and a run nobody has started has nothing true to say yet. All three
     * render NOTHING: an empty frame saying "no activity" is reserved space for a surface that is not
     * active, which is the one thing the work-surface contract forbids. A pending question yields the
     * capsule for the same reason it yields the chips - a partial cluster beside a question is worse
     * than none. */
    var run = (!yielded && svc.runtrace && svc.runtrace.read) ? svc.runtrace.read(this.tid()) : null;
    if (!run || !run.started) { this._dropRunCapsule(); return; }

    var host = this._runHostFor(chipRun);
    if (!host) return;

    /* The subject is the phase whose sentence the capsule is showing: the one the reader disclosed,
     * or else the running one while the run is expanded. Condensed with nothing open has no subject
     * at all, and that is the resting state - `13 tools used` and the chain, nothing more (f.910). */
    /* The settled phase is still the subject until the run is condensed or the next phase starts.
     * This read dropped it: after `settle` the run has no `running` phase and is not yet condensed,
     * so the subject went null and the capsule showed its chain with NO sentence at all — which is
     * exactly the moment reference 03 shows the past tense arriving (`Reading 7 files` becoming
     * `Read 7 files`, f.1170). Falling back to the last entered phase is what makes the tense flip
     * observable rather than a state that exists only between two renders. */
    var subject = run.open
      || (run.condensed ? null : (run.running || run.chain[run.chain.length - 1]))
      || null;

    host.setAttribute('data-condensed', run.condensed ? '1' : '0');
    host.setAttribute('data-running', run.running ? '1' : '0');

    this._syncRunLead(host, run);
    var handingOver = this._syncRunChain(run, subject);
    this._syncRunDetail(host, run, subject);
    this._runSubjectId = subject ? subject.id : null;

    /* A handover schedules its own roll, because the chip it has to reach does not exist until beat
     * two. Rolling now as well would scroll to where that chip is about to be and then again. */
    if (!handingOver) {
      var rec = subject ? this._runChipEls[subject.id] : null;
      this._rollChain(rec ? rec.btn : null);
    }
  };

  /* The lead chip. ONE element across both states rather than a summary chip and a collapse chip that
   * replace each other, because the resting form of a run is a morph of the control that produced it:
   * `Condense` becomes `13 tools used` in place (f.910). The words change, so countMorph honestly
   * falls back to a label cross-fade - what it must not do, and here cannot do, is swap the element. */
  T2Thread.prototype._syncRunLead = function (host, run) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var text = run.condensed ? (run.summaryLabel || 'Run') : 'Condense';
    var rec = this._runLead;

    if (!rec) {
      var btn = u.el('button', { class: ['t2-chip', 't2-run-lead'], type: 'button', data: { chip: 'run' } });
      if (svc.icons) btn.appendChild(svc.icons.get(this._runGlyph('beaker'), 13));
      var label = u.el('span', { class: ['t2-chip-label', 't2-run-sum'], text: text });
      btn.appendChild(label);
      rec = this._runLead = { btn: btn, label: label, text: text };

      /* The run is read fresh inside the handler rather than closed over. This element outlives every
       * render that touches it, so a captured record would be a snapshot of the run as it looked the
       * first time the capsule was built - and the control would act on a run that has moved on. */
      this._on(btn, 'click', function () {
        var rt = self.ctx.services.runtrace;
        if (!rt) return;
        var live = rt.read(self.tid());
        if (!live) return;
        var mo = self.ctx.services.motion;
        if (live.openId) { rt.close(self.tid()); return; }
        if (live.condensed) {
          /* Reopening the most recent phase is what a summary chip means. It goes through groupReopen
           * so the chips and the handoff below are carried down rather than jumping (f.910: the run
           * condenses and the prose, verification and artifact below it are pushed, never replaced). */
          if (mo && mo.groupReopen && self._runHost) {
            mo.groupReopen(self._runHost, function () { rt.open(self.tid()); });
          } else {
            rt.open(self.tid());
          }
          return;
        }
        rt.condense(self.tid());
      });
      host.insertBefore(btn, this._runChain);
    } else if (rec.text !== text) {
      if (svc.motion && svc.motion.countMorph) svc.motion.countMorph(rec.label, text);
      else rec.label.textContent = text;
      rec.text = text;
    }

    rec.btn.setAttribute('data-condensed', run.condensed ? '1' : '0');
    rec.btn.setAttribute('aria-expanded', run.condensed ? 'false' : 'true');
    /* Worked-for belongs to the run rather than to any phase, and the resting state is one chip plus
     * the chain - so it rides on the control's own title instead of buying a second row. */
    rec.btn.title = run.workedSeconds
      ? (run.summaryLabel + ' \u00b7 Worked for ' + F().duration(run.workedSeconds))
      : run.summaryLabel;
  };

  /* Every glyph name is checked against the icon set before use, the same guard the domain chips run
   * on: a missing name would render an empty box where a chip's only mark is. */
  T2Thread.prototype._runGlyph = function (name) {
    var svc = this.ctx.services;
    return (svc.icons && svc.icons.has && svc.icons.has(name)) ? name : 'dot';
  };

  /* One phase chip. The button IS the random access of behaviour 1: clicking the pencil at f.1170
   * reopens `Made 1 create, 2 edits`, clicking the magnifier at f.1300 reopens `Explored 7 files`,
   * and this is that control in this concept's material. */
  T2Thread.prototype._makeRunChip = function (p) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var pid = p.id;

    /* One element per phase, enforced HERE rather than trusted.
     *
     * A chip can be built for a phase that already has one — the handover inserts its chip on beat
     * two, asynchronously, so any reconciliation done during the render that scheduled it runs too
     * early to see the result. Overwriting the record without detaching the element it replaced left
     * the old chip in the chain: ten chips for a three-phase run, the extras frozen on whatever
     * sentence they last held (`Reading 5 files` long after the count reached seven) and unreachable,
     * because the record that owned them had been replaced. */
    var prior = this._runChipEls && this._runChipEls[pid];
    if (prior && prior.slot && prior.slot.parentNode) prior.slot.parentNode.removeChild(prior.slot);

    /* The slot is the box phaseHandover opens from zero width, which is why the chip is wrapped
     * rather than sitting in the chain directly. */
    var slot = u.el('span', { class: 'pmx-chain-slot' });
    var btn = u.el('button', {
      class: ['t2-chip', 't2-run-chip'], type: 'button',
      data: { chip: 'phase', kind: p.kind, state: p.running ? 'running' : 'done', open: '0' }
    });
    if (svc.icons) btn.appendChild(svc.icons.get(this._runGlyph(p.glyph), 13));
    /* Two elements, not one: the verb flips tense on its own (behaviour 3, `Exploring` -> `Explored`)
     * while the argument keeps its words and moves only its digits, and countMorph can only do that
     * to an element whose whole text is the part being rewritten. */
    var verbEl = u.el('span', { class: 't2-run-verb' });
    var argEl = u.el('span', { class: ['t2-chip-label', 't2-run-arg'] });
    btn.appendChild(verbEl);
    btn.appendChild(argEl);
    slot.appendChild(btn);

    var rec = { slot: slot, btn: btn, verbEl: verbEl, argEl: argEl, verbText: '', argText: '' };
    this._runChipEls[pid] = rec;

    this._on(btn, 'click', function () {
      var rt = self.ctx.services.runtrace;
      if (!rt) return;
      var mo = self.ctx.services.motion;
      /* groupReopen carries the siblings BELOW the capsule, so disclosing a phase pushes the domain
       * chips and the artifact handoff down as one block instead of making them jump. */
      if (mo && mo.groupReopen && self._runHost) {
        mo.groupReopen(self._runHost, function () { rt.open(self.tid(), pid); });
      } else {
        rt.open(self.tid(), pid);
      }
    });
    return rec;
  };

  /* One chip's state and words. `hold` leaves the text alone because phaseHandover owns that beat. */
  T2Thread.prototype._writeRunChip = function (rec, p, isSubject, hold) {
    rec.btn.setAttribute('data-state', p.running ? 'running' : 'done');
    rec.btn.setAttribute('data-open', isSubject ? '1' : '0');
    rec.btn.setAttribute('aria-expanded', isSubject ? 'true' : 'false');
    rec.btn.setAttribute('aria-label', p.headline);
    rec.btn.title = p.headline;
    if (hold) return;
    /* Only the subject wears its sentence; every other chip is its glyph alone. That is what keeps
     * the run one line and the chain an index rather than a list. */
    this._morphRunText(rec, 'verb', isSubject ? p.verb : '');
    this._morphRunText(rec, 'arg', isSubject ? p.argument : '');
  };

  /* Behaviour 2, and the reason it works here: the digits are rewritten inside a chip that was
   * already on screen (f.208 -> f.286 -> f.338), so `Exploring 5 files` -> `7 files` moves the number
   * and nothing else - same row, same y, same word `files` in the layout box it already had.
   *
   * Morph ONLY on change. t1 rebuilds its capsule every render and can therefore morph
   * unconditionally; here the element survives, so calling countMorph with an unchanged string would
   * replay the digit animation on every unrelated view touch - a count that appears to tick when no
   * work happened, which is a lie told by animation. */
  T2Thread.prototype._morphRunText = function (rec, part, text) {
    var svc = this.ctx.services;
    var el = part === 'verb' ? rec.verbEl : rec.argEl;
    var key = part === 'verb' ? 'verbText' : 'argText';
    if (rec[key] === text) return;
    rec[key] = text;
    if (svc.motion && svc.motion.countMorph) svc.motion.countMorph(el, text);
    else { el.textContent = text; return; }

    /* The memo is updated OPTIMISTICALLY, before the write lands. countMorph's non-digit path defers
     * through swapText's double requestAnimationFrame, so a dropped frame — a backgrounded tab, a
     * throttled rAF — would leave the memo claiming this text while the element still shows the old
     * one, and the `rec[key] === text` guard above would then refuse to repaint it FOREVER.
     *
     * phaseHandover carries its own endNow() backstop for exactly this reason; the chip morph had
     * none. This is that backstop: past the animation's own window, assert the text. */
    if (rec[key + 'Timer']) clearTimeout(rec[key + 'Timer']);
    rec[key + 'Timer'] = setTimeout(function () {
      rec[key + 'Timer'] = null;
      /* Only if the memo still expects this exact string. A later morph owns the element by then. */
      if (rec[key] === text && el.textContent !== text) el.textContent = text;
    }, 320);
  };

  T2Thread.prototype._clearRunChipText = function (rec) {
    rec.verbEl.textContent = '';
    rec.argEl.textContent = '';
    rec.verbText = '';
    rec.argText = '';
  };

  /* The chain: one chip per ENTERED phase, in entry order (f.208 two, f.390 three, f.780 four,
   * f.910 six). Returns true when a handover is in flight, which is the one case where the caller
   * must not roll the chain itself. */
  T2Thread.prototype._syncRunChain = function (run, subject) {
    var self = this;
    var svc = this.ctx.services;
    var chain = this._runChain;
    this._runChipEls = this._runChipEls || {};

    var wanted = {};
    run.chain.forEach(function (p) { wanted[p.id] = true; });
    for (var id in this._runChipEls) {
      if (!Object.prototype.hasOwnProperty.call(this._runChipEls, id)) continue;
      if (wanted[id]) continue;
      /* Only a reset ever takes a phase out of the chain. Nothing else removes a chip, because the
       * chip is the only route back into its phase and dropping one would silently make that part of
       * the run unreachable. */
      var gone = this._runChipEls[id];
      if (gone.slot && gone.slot.parentNode) gone.slot.parentNode.removeChild(gone.slot);
      delete this._runChipEls[id];
    }

    /* A phase HANDS OVER only when the sentence moves to a chip that is arriving now, at the end of
     * the chain. A reader reopening an old phase, or a whole finished run appearing at once, is not a
     * handover and must not be animated as one - and deferring a chip that is not the newest entry
     * would also append it out of entry order. */
    var last = run.chain.length ? run.chain[run.chain.length - 1] : null;
    var arriving = (subject && last && subject.id === last.id && !this._runChipEls[subject.id]) ? subject : null;
    var outgoing = (arriving && this._runSubjectId && this._runSubjectId !== arriving.id)
      ? this._runChipEls[this._runSubjectId] : null;

    run.chain.forEach(function (p) {
      if (arriving && arriving.id === p.id) return;    /* inserted below, on beat two */
      var rec = self._runChipEls[p.id] || self._makeRunChip(p);
      self._writeRunChip(rec, p, !!(subject && subject.id === p.id), rec === outgoing);
      /* Re-appending a survivor is how DOM order is kept equal to entry order without touching the
       * element itself: appendChild moves a node it already owns rather than recreating it. */
      chain.appendChild(rec.slot);
    });

    /* The chain is whatever `_runChipEls` says it is, and nothing else.
     *
     * The record map and the chain element have separate lifetimes here: the surface host is rebuilt
     * when an arriving turn takes over the inline chip run, and a rebuild that replaced the map while
     * leaving the old chips in place left them in the DOM, unreachable and still carrying whatever
     * sentence they last held. The visible result was a chain of six or more chips where the run had
     * three phases, the stale ones frozen on intermediate text like `Reading 5 files` long after the
     * count had reached seven.
     *
     * Reconciling by identity rather than trusting the map to be complete is what makes that
     * impossible to reach, whatever caused the map and the element to disagree. */
    var live = {};
    for (var liveId in this._runChipEls) {
      if (Object.prototype.hasOwnProperty.call(this._runChipEls, liveId)) live[liveId] = this._runChipEls[liveId].slot;
    }
    var slots = [];
    for (var si = 0; si < chain.children.length; si++) slots.push(chain.children[si]);
    slots.forEach(function (slot) {
      var known = false;
      for (var k in live) {
        if (Object.prototype.hasOwnProperty.call(live, k) && live[k] === slot) { known = true; break; }
      }
      if (!known && slot.parentNode === chain) chain.removeChild(slot);
    });

    if (!arriving) return false;

    var born = null;
    function insert() {
      born = self._makeRunChip(arriving);
      self._writeRunChip(born, arriving, true, false);
      chain.appendChild(born.slot);
      return born.btn;
    }

    var mo = svc.motion;
    if (!mo || !mo.phaseHandover) {
      if (outgoing) this._clearRunChipText(outgoing);
      insert();
      this._rollChain(born.btn);
      return true;
    }

    /* Two beats, and the ORDER is the whole point (f.194-211): the phase that is finishing lets go of
     * its sentence first and settles into a plain glyph, and only then does the arriving phase open
     * its slot from zero width. A single cross-fade of the whole row reads as the run being replaced,
     * which loses the fact that the finished phase survives as an index entry.
     *
     * The reference can fade the new label in before its glyph arrives because there a label and a
     * glyph are two objects. In a chip run they are one, so the new sentence rides in with its chip
     * on beat two. That deviation is forced by the material; the causal order it exists to protect -
     * settle, then arrive - is intact. */
    if (outgoing) {
      /* Both halves of the outgoing sentence fade together. phaseHandover drives the timing from the
       * count-bearing half, which is the half the reference is explicit about. */
      if (mo.swapText) mo.swapText(outgoing.verbEl, '');
      else outgoing.verbEl.textContent = '';
      outgoing.verbText = '';
      outgoing.argText = '';
    }
    mo.phaseHandover(chain, outgoing ? outgoing.argEl : null, insert, '')
      .then(function () { self._rollChain(born ? born.btn : null); });
    return true;
  };

  /* The disclosed phase, and only ever one line of it. Behaviour 4 is that reopening PUSHES what is
   * below the capsule down rather than replacing it, so what grows here has to stay small enough that
   * the push is a nudge: the phase's own sentence, its duration, and a chip that opens the record.
   * Everything dense stays in the sheet, which is where every record in this concept lives. */
  T2Thread.prototype._syncRunDetail = function (host, run, subject) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;

    var ops = subject ? this._runOps(run) : [];
    var op = null;
    var i;
    for (i = 0; i < ops.length; i++) { if (ops[i].id === subject.id) { op = ops[i]; break; } }

    /* No subject, or a phase with nothing of its own to say, removes the line entirely rather than
     * leaving an empty rule below the chain - the resting state is one chip and the chain. */
    if (!subject || (!subject.detail && subject.durationMs == null && !op)) {
      if (this._runDetail && this._runDetail.parentNode) this._runDetail.parentNode.removeChild(this._runDetail);
      this._runDetail = null;
      this._runDetailId = null;
      return;
    }
    /* Nothing inside a phase changes while it runs except its count, and the count lives on the chip.
     * So this is rebuilt when the disclosed phase changes and left alone on every other pass. */
    if (this._runDetailId === subject.id && this._runDetail && this._runDetail.parentNode === host) return;
    if (this._runDetail && this._runDetail.parentNode) this._runDetail.parentNode.removeChild(this._runDetail);

    var el = u.el('div', { class: 't2-run-detail', data: { kind: subject.kind } });
    el.appendChild(u.el('span', {
      class: 't2-run-detail-text',
      text: subject.detail || subject.headline
    }));
    if (subject.durationMs != null) {
      el.appendChild(u.el('span', {
        class: 't2-run-detail-dur',
        text: F().duration(Math.round(subject.durationMs / 1000))
      }));
    }
    if (op) {
      var rec = u.el('button', { class: ['t2-chip', 't2-run-record'], type: 'button', data: { chip: 'record' } }, [
        u.el('span', { class: 't2-chip-label', text: 'Record' })
      ]);
      /* The same sheet, the same two contents: `buildOpDetail` for this phase, and `buildOpsIndex`
       * behind it through `_swapSheet` so the reader can step sideways into any other operation the
       * run performed without ever stacking a second overlay. */
      this._on(rec, 'click', function (ev) {
        svc.popup.open({
          anchorEl: ev.currentTarget, kind: 'panel', width: 360,
          build: function (h, api) { self.buildOpDetail(h, api, op, ops); }
        });
      });
      el.appendChild(rec);
    }

    host.appendChild(el);
    this._runDetail = el;
    this._runDetailId = subject.id;
  };

  /* The operations the run actually performed, in authored order. Filtered to the chain rather than
   * taken whole from the thread: an index over every authored stage would offer the reader work the
   * run never did, and a glyph - or a row - is a claim that the work happened. */
  T2Thread.prototype._runOps = function (run) {
    var svc = this.ctx.services;
    if (!svc.opcard || !svc.opcard.forThread) return [];
    var entered = {};
    run.chain.forEach(function (p) { entered[p.id] = true; });
    return svc.opcard.forThread(this.ctx, this.tid()).filter(function (op) { return !!entered[op.id]; });
  };

  /* Behaviour 5: the chain SCROLLS, it never truncates. The reference caps at six glyphs and rolls
   * the oldest off the left, then scrolls it back when the reader clicks toward it - the glyph is not
   * deleted, because it is the route back into that phase. The roll runs in a rAF because the chip it
   * has to bring into view may have been appended in this very pass and has no box until layout. */
  T2Thread.prototype._rollChain = function (into) {
    var self = this;
    var svc = this.ctx.services;
    var chain = this._runChain;
    if (!chain || !svc.motion || !svc.motion.chainRoll) return;
    global.requestAnimationFrame(function () {
      if (self._runChain !== chain || !chain.isConnected) return;
      svc.motion.chainRoll(chain, into && into.isConnected ? { into: into } : null);
    });
  };

  /* ---------------------------------------------------------------- the operation card
   *
   * The card only ever exists inside a popup sheet. That is not a shortcut: this concept demoted
   * every piece of machinery to a chip precisely so a long conversation cannot accumulate nested
   * blocks, and an operation card is the densest block in the packet.
   *
   * The sheet is the SAME popup a chip has always opened - `ctx.services.popup`, one overlay, no
   * second mechanism. The index and the card are two contents of one sheet rather than two sheets,
   * so drilling in and stepping back never stacks overlays; `_swapSheet` rewrites the host in place
   * and asks the popup to remeasure. */

  /* The chip's words. `headline` already carries the tense rule, and it usually already spells the
   * count out ("Read 7 files"), so the count is appended only when the record's own wording does
   * not contain it - the count is printed, never recomputed, and never printed twice. */
  T2Thread.prototype.opChipLabel = function (op) {
    var label = op.headline || '';
    if (op.count == null) return label;
    var n = String(op.count);
    if (label.indexOf(n) >= 0) return label;
    return label + ' \u00b7 ' + n + (op.unit ? ' ' + op.unit : '');
  };

  T2Thread.prototype._swapSheet = function (host, api, build) {
    U().empty(host);
    build(host, api);
    if (api && api.resize) api.resize();
  };

  /* The index the folded count chip opens: every operation on the thread, each row drilling into its
   * own card inside this same sheet. */
  T2Thread.prototype.buildOpsIndex = function (host, api, ops) {
    var self = this;
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Operations' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    ops.forEach(function (op) {
      var row = u.el('button', { class: 't2-sheet-row t2-op-pick', type: 'button', data: { running: op.running ? '1' : '' } }, [
        u.el('span', { class: 't2-sheet-kind', text: op.statusLabel }),
        u.el('span', { class: 't2-sheet-label', text: self.opChipLabel(op) }),
        u.el('span', { class: 't2-sheet-dur', text: op.durationMs != null ? F().duration(Math.round(op.durationMs / 1000)) : '' })
      ]);
      self._on(row, 'click', function () {
        self._swapSheet(host, api, function (h, a) { self.buildOpDetail(h, a, op, ops); });
      });
      list.appendChild(row);
    });
    host.appendChild(list);
  };

  /* One operation card. `backTo` is the operation list to step back to, and is null when the chip
   * that opened the sheet was the operation's own - there is nothing behind it to return to. */
  T2Thread.prototype.buildOpDetail = function (host, api, op, backTo) {
    var self = this;
    var u = U();
    var card = u.el('div', { class: 't2-op', data: { running: op.running ? '1' : '' } });

    /* Title, with the status as its suffix - the same fact the chip is wearing. */
    var head = u.el('div', { class: 't2-op-head' }, [
      u.el('span', { class: 't2-op-title', text: op.headline }),
      u.el('span', { class: 't2-status', text: op.statusLabel })
    ]);
    card.appendChild(head);

    if (op.why) card.appendChild(u.el('p', { class: 't2-op-why', text: op.why }));

    /* The six fields, two columns, keys in small caps. */
    var grid = u.el('div', { class: 't2-op-grid' });
    (op.fields || []).forEach(function (f) {
      grid.appendChild(u.el('span', { class: 't2-op-k', text: f.key }));
      grid.appendChild(u.el('span', { class: 't2-op-v', text: f.value }));
    });
    card.appendChild(grid);

    var chips = op.chips || [];
    if (chips.length) {
      var chipRow = u.el('div', { class: 't2-op-chips' });
      chips.forEach(function (chip) {
        /* `/sources · 5` is a count, not a destination - there is no sources surface to open - so it
         * is rendered as a label. Only the artifact chip is a button, and it goes somewhere. */
        var isArtifact = chip.kind === 'artifact' && !!chip.artifactId;
        var b = u.el(isArtifact ? 'button' : 'span', {
          class: 't2-op-chip', data: { kind: chip.kind }, text: chip.label
        });
        if (isArtifact) {
          b.setAttribute('type', 'button');
          self._on(b, 'click', function () {
            self.ctx.services.artifacts.open(chip.artifactId);
            /* The artifact takes over the surface it opens into, so the sheet that sent the user
             * there must not be left hanging in front of it. */
            if (api && api.close) api.close();
            else self.ctx.services.popup.closeAll(null);
          });
        }
        chipRow.appendChild(b);
      });
      card.appendChild(chipRow);
    }

    var rows = op.rows || [];
    if (rows.length) {
      var rowsEl = u.el('div', { class: 't2-op-rows' });
      rows.forEach(function (r) {
        var opRow = u.el('div', { class: 't2-op-row' }, [
          u.el('span', { class: 't2-op-verb', text: r.verb }),
          u.el('span', { class: 't2-op-target', text: r.target })
        ]);
        /* `|| 0` printed `+0 -0` on every row that has no delta at all — reads, searches, fetches and
         * checks. That is not a safe default: it asserts a zero-line edit, which is a different claim
         * from "this operation did not touch lines". Absent means absent. */
        if (r.added != null) opRow.appendChild(u.el('span', { class: 't2-op-add', text: '+' + r.added }));
        if (r.removed != null) opRow.appendChild(u.el('span', { class: 't2-op-rem', text: '\u2212' + r.removed }));
        rowsEl.appendChild(opRow);
      });
      card.appendChild(rowsEl);
    }

    host.appendChild(card);

    if (backTo && backTo.length > 1) {
      var back = u.el('button', { class: 't2-act t2-op-back', type: 'button', text: '\u2190 All operations' });
      this._on(back, 'click', function () {
        self._swapSheet(host, api, function (h, a) { self.buildOpsIndex(h, a, backTo); });
      });
      host.appendChild(back);
    }
  };

  /* The advice sheet. Read-only: Dismiss is the only verb, because there is no API to apply advice and
   * there must not be one - an advisor that can write is not an advisor. */
  T2Thread.prototype.buildAdviceDetail = function (host, advice) {
    var self = this;
    var u = U();
    var bsd = this.ctx.services.bsd;
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Back Seat Driver' }));
    advice.forEach(function (adv) {
      var row = u.el('div', { class: 't2-advice', data: { severity: adv.severity } });
      row.appendChild(u.el('span', { class: 't2-advice-kind', text: adv.severity === 'caution' ? 'Caution' : 'Note' }));
      row.appendChild(u.el('p', { class: 't2-advice-text', text: adv.text }));
      if (adv.evidenceRefs && adv.evidenceRefs.length) {
        row.appendChild(u.el('span', { class: 't2-advice-ev', text: adv.evidenceRefs.join(', ') }));
      }
      var dis = u.el('button', { class: 't2-advice-dismiss', type: 'button', text: 'Dismiss' });
      self._on(dis, 'click', function () {
        bsd.dismiss(self.tid(), adv.id);
        self.ctx.services.popup.closeAll(null);
      });
      row.appendChild(dis);
      host.appendChild(row);
    });
  };

  /* ---------------------------------------------------------------- artifact handoff */

  T2Thread.prototype._renderHandoff = function (host) {
    var self = this;
    var u = U();
    if (!host) return;
    U().empty(host);
    var svc = this.ctx.services;
    var A = svc.artifacts;
    if (!A) return;

    var thread = this.ctx.data.threadById(this.tid());
    var refs = (thread && thread.artifacts) || [];
    if (!refs.length) return;

    var ref = refs[refs.length - 1];
    if (!ref.id) return;
    var state = A.stateOf ? A.stateOf(ref.id) : 'idle';

    /* A slab, because that is this concept's material - but a COMPACT one: one row, no nesting, sitting
     * directly under the run that produced it. */
    var card = u.el('div', { class: 't2-handoff', data: { state: state } });
    card.appendChild(u.el('span', { class: 't2-handoff-kind', text: 'Artifact' }));
    card.appendChild(u.el('span', { class: 't2-handoff-title', text: ref.title }));

    var stateEl = u.el('span', { class: 't2-handoff-state' });
    var label = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, label);
    else stateEl.textContent = label;
    card.appendChild(stateEl);

    var worked = this._handoffWorkedSeconds();
    if (worked != null) card.appendChild(u.el('span', { class: 't2-handoff-worked', text: 'Worked for ' + F().duration(worked) }));

    var open = u.el('button', { class: 't2-handoff-open', type: 'button', text: 'Open' });
    this._on(open, 'click', function () {
      A.open(ref.id);
      /* Settle the simulated transport in the same interaction. The card repaints through the artifact
       * subscription, not from here: `open` writes session state, which no `view*` key covers. */
      if (A.forceReady) A.forceReady(ref.id);
      if (svc.motion && svc.motion.handoff) svc.motion.handoff(card);
    });
    card.appendChild(open);

    host.appendChild(card);
  };

  T2Thread.prototype._handoffWorkedSeconds = function () {
    var svc = this.ctx.services;
    var active = svc.surfaces ? svc.surfaces.activeFor(this.tid()) : null;
    if (active && active.goal && svc.goals && svc.goals.completionReceipt) {
      var r = svc.goals.completionReceipt(active.goal);
      if (r && r.workedSeconds != null) return r.workedSeconds;
    }
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].runtime && msgs[i].runtime.workedSeconds != null) return msgs[i].runtime.workedSeconds;
    return null;
  };

    T2Thread.prototype.buildGoalDetail = function (host, goal, api) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    U().empty(host);

    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Goal' }));
    var body = u.el('div', { class: 't2-goal' });
    body.appendChild(u.el('div', { class: 't2-goal-head' }, [
      u.el('span', { class: 't2-goal-obj', text: goal.title || goal.objective }),
      u.el('span', { class: 't2-status', text: F().label(goal.status) })
    ]));

    var acts = u.el('div', { class: 't2-goal-acts' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (action) {
      if (svc.surfaces.canAct && !svc.surfaces.canAct(goal, action)) return;
      var b = u.el('button', { class: 't2-act', text: action.charAt(0).toUpperCase() + action.slice(1) });
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
      var det = u.el('div', { class: 't2-blocker' });
      [['Cause', b2.cause], ['Affected', b2.affectedScope], ['Tried', b2.lastAttemptedRecovery],
       ['Stopped because', b2.whyRecoveryStopped], ['Next safe action', b2.nextSafeAction]].forEach(function (row) {
        if (!row[1]) return;
        det.appendChild(u.el('div', { class: 't2-blocker-row' }, [
          u.el('span', { class: 't2-blocker-k', text: row[0] }),
          u.el('span', { class: 't2-blocker-v', text: row[1] })
        ]));
      });
      body.appendChild(det);
    }

    if (goal.replan) {
      body.appendChild(u.el('div', { class: 't2-replan' }, [
        u.el('span', { class: 't2-replan-k', text: 'Replanning' }),
        u.el('span', { class: 't2-replan-v', text: goal.replan.impact || goal.replan.reason })
      ]));
    }
    host.appendChild(body);
  };

  T2Thread.prototype.buildTodoDetail = function (host, todo) {
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Todo' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    (todo.items || []).forEach(function (it) {
      list.appendChild(u.el('div', { class: 't2-todo-row', data: { state: it.state } }, [
        u.el('span', { class: 't2-todo-state', text: F().label(it.state) }),
        u.el('span', { class: 't2-todo-label', text: it.label })
      ]));
    });
    host.appendChild(list);
  };

  T2Thread.prototype.buildAgentsDetail = function (host, group) {
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Agents' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    (group.agents || []).forEach(function (a) {
      list.appendChild(u.el('div', { class: 't2-agent' }, [
        u.el('div', { class: 't2-agent-head' }, [
          u.el('span', { class: 't2-agent-name', text: a.name }),
          u.el('span', { class: 't2-status', text: F().label(a.status) })
        ]),
        u.el('div', { class: 't2-agent-task', text: a.task }),
        /* Children never ask the user directly. A blocked child shows this line; the
         * parent is what raises any question with the human. */
        u.el('div', { class: 't2-agent-act', text: a.currentActivity || (a.status === 'waiting_for_parent' ? 'Waiting for parent' : '') }),
        u.el('div', { class: 't2-agent-dur', text: a.workedSeconds != null ? F().duration(a.workedSeconds) : '' })
      ]));
    });
    host.appendChild(list);
  };

  T2Thread.prototype.buildDiffDetail = function (host, group) {
    var self = this;
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Changes' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    (group.files || []).forEach(function (f) {
      var row = u.el('button', { class: 't2-file', data: { status: f.status } }, [
        u.el('span', { class: 't2-file-path', text: f.path }),
        u.el('span', { class: 't2-file-status', text: F().label(f.status) }),
        u.el('span', { class: 't2-file-n', text: '+' + f.added + ' -' + f.removed })
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
      list.appendChild(u.el('div', { class: 't2-file-more', text: group.hiddenFileCount + ' more files' }));
    }
    host.appendChild(list);
  };

  T2Thread.prototype.buildArtifactsDetail = function (host, artifacts) {
    var self = this;
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Artifacts' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    artifacts.forEach(function (a) {
      var row = u.el('div', { class: 't2-artifact' }, [
        u.el('div', { class: 't2-artifact-title', text: a.title }),
        u.el('div', { class: 't2-artifact-meta', text: F().label(a.kind || 'file') + (a.projectPath ? ' · ' + a.projectPath : '') })
      ]);
      /* Opening does not remove the shortcut and needs no active/open state here — the
       * editor tab owns that state, per contract. */
      var openBtn = u.el('button', { class: 't2-act', text: 'Open' });
      self._on(openBtn, 'click', function () { self.ctx.services.editorHost.openArtifact(a, self.ctx); });
      row.appendChild(openBtn);
      list.appendChild(row);
    });
    host.appendChild(list);
  };

  /* ---------------------------------------------------------------- questionnaire */

  /* ---------------------------------------------------------------- question: the composer capsule
   *
   * This is the most demanding row in the matrix and the reason it is worth stating precisely:
   *
   *   a slim `Preparing questions` capsule appears above the composer,
   *   EXPANDS into one card,
   *   then COMPRESSES to `Submitting answers`.
   *
   * It must be ONE surface throughout. The capsule may not disappear and reappear as a different
   * element wearing a different class - that would be three surfaces taking turns, which reads as three
   * things happening rather than one thing changing shape. So:
   *
   *   - `_capsuleEl` is created once per flow and REUSED across every phase and every question;
   *   - the phases are attributes on that element (`data-phase`), never separate nodes;
   *   - only its CONTENTS are rebuilt, inside the mutation `motion.resizeBounce` wraps, so the bounds
   *     travel from the size the capsule had to the size it needs instead of jumping;
   *   - `data-pmx-qid` on the element is the identity proof: it is the same node in the same position
   *     before and after the expansion, which is exactly what the probe asserts.
   *
   * The resize used to run on `PMXReveal.springHeight`, called by hand around each rebuild. It now runs
   * on `motion.resizeBounce`, and the swap is not cosmetic. resizeBounce is PMConcept7's model-picker
   * resize - a height on `--ease-bounce` (y1 = 1.72, so it overshoots and settles) with a one-shot
   * scale beat riding on top - which is this product's own tuned answer to "a box changed size", and it
   * measures the end state with `height: auto` so a clamp is respected rather than overrun. Having ONE
   * owner of this element's height is the other half of it: the CSS beside `.t2-capsule` has warned
   * since it was written that two owners of one property turn a spring into a stutter, and a hand-rolled
   * spring plus a primitive would have been exactly that.
   *
   * The composer is owned by the WINDOW, not by this concept, so "above the composer" means the last
   * thing in the question host - the region every window places immediately above its composer.
   */
  T2Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard. Claiming the work surfaces notifies the store, which re-enters update() and
     * therefore this function mid-render; the inner pass builds the capsule and the outer pass builds a
     * second one into a host it already emptied. */
    if (this._inRenderQuestion) return;

    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }
  };

  T2Thread.prototype._renderQuestionBody = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;

    if (!flow || !flow.record) {
      /* The flow is over. Compress the capsule one last time, then let it go - and only then draw the
       * receipt, so the two never overlap. */
      var dying = this._capsuleEl;
      this._capsuleEl = null;
      this._capsuleQid = null;
      this._capsuleOptCount = null;
      if (dying && dying.parentNode) {
        /* The teardown finishes ~180ms later, and by then this thread may not be the one on screen.
         * Switching away to a thread with no questionnaire and straight back is an ordinary thing to
         * do — it is what a reader does, and what the paging suite does to make the entrance
         * observable — and it left this callback holding a host that the NEW thread had already
         * built its capsule into. `U().empty(host)` then deleted a live card belonging to a
         * questionnaire that had nothing to do with the one being torn down.
         *
         * The teardown is only allowed to finish if the world it was scheduled for is still the
         * world on screen: same thread, and no capsule built since. */
        var forThread = this.tid();
        this._compressAndRemove(dying, function () {
          if (self.tid() !== forThread) return;
          if (self._capsuleEl) return;
          U().empty(host);
          self._renderQuestionReceipt(host, flow ? flow.receipt : null);
        });
        return;
      }
      U().empty(host);
      this._renderQuestionReceipt(host, flow ? flow.receipt : null);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    /* ---- the ONE element.
     * Created for this questionnaire and kept for its whole life. A new questionnaire id gets a new
     * capsule, which is correct: that genuinely is a different thing being asked. */
    var fresh = false;
    if (!this._capsuleEl || !this._capsuleEl.parentNode || this._capsuleQid !== flow.id) {
      U().empty(host);
      /* `pmx-resize-up` is the shared opt-in for a bottom-anchored resize, and this is precisely the
       * case it exists for: the capsule is the last thing in the question host, which every window
       * places immediately above its composer. The transcript above is the flexible sibling, so the
       * capsule expanding moves its OWN top edge and no slab below it shifts. */
      this._capsuleEl = u.el('div', {
        class: 't2-capsule pmx-resize-up',
        data: { pmxQid: flow.id, phase: flow.status }
      });
      this._capsuleQid = flow.id;
      this._capsuleOptCount = null;
      host.appendChild(this._capsuleEl);
      fresh = true;
    }

    var el = this._capsuleEl;

    /* Everything that changes the capsule's size happens inside here, and nowhere else, so the bounce
     * measures one before and one after rather than chasing a box that is still being written. */
    function rebuild() {
      el.setAttribute('data-phase', flow.status);
      /* `expanded` drives the material change (slim strip versus card) in CSS. One attribute, two
       * appearances, one element. */
      el.setAttribute('data-expanded', (flow.status === 'active') ? '1' : '0');
      U().empty(el);

      if (flow.status === 'preparing') {
        el.appendChild(u.el('span', { class: 't2-capsule-spinner pmx-spin' }));
        el.appendChild(u.el('span', { class: 't2-capsule-text', text: 'Preparing questions' }));
      } else if (flow.status === 'submitting') {
        el.appendChild(u.el('span', { class: 't2-capsule-spinner pmx-spin' }));
        el.appendChild(u.el('span', { class: 't2-capsule-text', text: 'Submitting answers' }));
      } else {
        self._buildCapsuleCard(el, flow);
      }
    }

    var count = this._capsuleOptionCount(flow);
    var countChanged = this._capsuleOptCount != null && this._capsuleOptCount !== count;
    this._capsuleOptCount = count;

    if (fresh || !svc.motion || !svc.motion.resizeBounce) {
      /* The very first paint has no size to have come from. The capsule simply arrives, which is what
       * the slim strip appearing above the composer already is. */
      rebuild();
    } else {
      this._endCapsuleBounce();
      this._capsuleBounce = svc.motion.resizeBounce(el, rebuild, {
        bounceClass: countChanged ? 'pmx-size-bounce-strong' : 'pmx-size-bounce'
      });
    }

    this._choreographCapsule(el, fresh);
  };

  /* Land any bounce still in flight before starting anything else on this element.
   *
   * One interaction renders the capsule twice - answering notifies the store, which re-enters update()
   * and renders, and then the click handler renders again on its own account. The second pass would
   * otherwise measure a height that is mid-flight and pinned inline, and the first pass's own
   * `transitionend` listener would fire on the SECOND bounce's transition and strip its inline height
   * halfway through. `finish()` commits the previous change outright, so the new one starts from a
   * settled box - which is also the honest reading of an interrupted resize: the size it was travelling
   * to already happened, and only the travel is abandoned. */
  T2Thread.prototype._endCapsuleBounce = function () {
    var h = this._capsuleBounce;
    this._capsuleBounce = null;
    if (h && h.state && h.state() === 'running' && h.finish) { try { h.finish(); } catch (e) {} }
  };

  /* How many options the capsule is showing, which picks the bounce's amplitude. The reference draws
   * the line at the option COUNT: an ordinary change nudges the box, a change of count re-shapes it and
   * takes `pmx-size-bounce-strong`. Preparing and submitting are their own sentinels because the strip
   * becoming the card, and the card becoming the strip again, are the two largest changes this one
   * element ever makes. */
  T2Thread.prototype._capsuleOptionCount = function (flow) {
    if (!flow || flow.status !== 'active') return -1;
    if (flow.atEnd) return -2;
    var q = flow.question;
    return q && q.options ? q.options.length : 0;
  };

  /* The entrance, and the reason it is gated.
   *
   * Reference 02 is a REVIEWABLE questionnaire: paging back to question one shows the answer still
   * there and animates nothing on the way in. Without a gate the option row cascade fires on every
   * render, so travelling backwards looked exactly like travelling forwards. `motion.firstVisit` is
   * stamped on the capsule, which is why this only works against an element that survives its renders -
   * a capsule rebuilt per pass would call every page a first visit.
   *
   * The resize is deliberately NOT gated with it. A revisited question can still be a different size
   * from the one you just left, and the box saying so is a report of fact, not an entrance. */
  T2Thread.prototype._choreographCapsule = function (el, fresh) {
    var R = global.PMXReveal;
    var svc = this.ctx.services;
    if (!R || !el) return;

    var key = R.keyFor(svc, this.tid());
    /* Asked once per render and before any early return, because firstVisit records the visit as a
     * side effect. It also subsumes the per-keystroke case: a freeform answer re-renders on every
     * character and the key does not move while you are typing into one question. */
    var first = svc.motion && svc.motion.firstVisit ? svc.motion.firstVisit(el, key) : !!fresh;
    if (!first || R.reduced(el)) return;

    /* The cascade ladder is `.pmx-cascade > *`, so it belongs on the options' own row container. */
    var list = el.querySelector('.t2-capsule-opts');
    if (!list) return;
    var opts = Array.prototype.slice.call(list.querySelectorAll('.t2-capsule-opt'));
    if (!opts.length) return;

    R.stagger(list, opts);
    global.setTimeout(function () { R.clearStagger(list, opts); }, fresh ? 900 : 700);
  };

  /* The expanded card - still inside the capsule element. */
  T2Thread.prototype._buildCapsuleCard = function (el, flow) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var q = flow.question;

    var body = u.el('div', { class: 't2-capsule-body' });

    /* head: the prompt, and Cancel as the card's CLOSE control - the matrix is explicit that cancel is
     * the close affordance here, not a third button in a row. */
    var head = u.el('div', { class: 't2-capsule-head' });
    head.appendChild(u.el('p', {
      class: 't2-capsule-prompt',
      text: flow.atEnd ? 'Every question has been answered.' : (q ? q.prompt : '')
    }));
    var close = u.el('button', { class: 't2-capsule-close', type: 'button', text: '\u00d7', aria: { label: 'Cancel these questions' } });
    this._on(close, 'click', function () {
      /* Compress back to the capsule FIRST, then resolve - so the reviewer sees the card become the
       * capsule again rather than a card vanishing. */
      self._compressToCapsule(el, function () {
        svc.qflow.act(svc, self.tid(), 'cancel');
        self.renderQuestion();
        self.renderSurfaces();
      }, 'Cancelling questions');
    });
    head.appendChild(close);
    body.appendChild(head);

    if (q && q.required && !flow.atEnd) body.appendChild(u.el('span', { class: 't2-capsule-req', text: 'Required' }));

    /* options */
    if (q && !flow.atEnd) {
      if (q.options && q.options.length) {
        var opts = u.el('div', { class: 't2-capsule-opts' });
        q.options.forEach(function (opt) {
          var sel = (q.selected || []).indexOf(opt) >= 0;
          var b = u.el('button', { class: 't2-capsule-opt', type: 'button', text: opt, aria: { pressed: sel ? 'true' : 'false' } });
          self._on(b, 'click', function (ev) {
            if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
            svc.qflow.act(svc, self.tid(), 'answer', opt);
            self.renderQuestion();
          });
          opts.appendChild(b);
        });
        body.appendChild(opts);
      } else {
        var ta = u.el('textarea', { class: 't2-capsule-free pmx-scroll', aria: { label: q.prompt } });
        ta.setAttribute('spellcheck', 'false');
        ta.value = q.draft || '';
        this._on(ta, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', ta.value); });
        body.appendChild(ta);
      }
    }

    /* the refusal, at the field */
    var reason = u.el('p', { class: 't2-capsule-reason', data: { show: this._pendingReason ? '1' : '0' } });
    if (this._pendingReason) { reason.textContent = this._pendingReason; this._pendingReason = null; }
    body.appendChild(reason);

    /* foot: progress BOTTOM-LEFT, the skip/submit control BOTTOM-RIGHT. Both positions are specified. */
    var foot = u.el('div', { class: 't2-capsule-foot' });

    var left = u.el('div', { class: 't2-capsule-foot-left' });
    left.appendChild(u.el('span', {
      class: 't2-capsule-count',
      text: 'Question ' + flow.position + ' of ' + flow.total
    }));
    if (flow.skippedCount) {
      left.appendChild(u.el('span', {
        class: 't2-capsule-skipped',
        text: flow.skippedCount === 1 ? '1 skipped' : flow.skippedCount + ' skipped'
      }));
    }
    /* Back and Unskip are quiet, bottom-left, beside the counter: they are navigation, not the primary
     * decision, and before this build neither was reachable from any concept. */
    if (flow.index > 0) {
      var back = u.el('button', { class: 't2-capsule-quiet', type: 'button', text: 'Back' });
      this._on(back, 'click', function () { svc.qflow.act(svc, self.tid(), 'prev'); self.renderQuestion(); });
      left.appendChild(back);
    }
    if (q && flow.isSkipped(q)) {
      var un = u.el('button', { class: 't2-capsule-quiet', type: 'button', text: 'Unskip' });
      this._on(un, 'click', function () { svc.qflow.act(svc, self.tid(), 'unskip', flow.index); self.renderQuestion(); });
      left.appendChild(un);
    }
    foot.appendChild(left);

    /* ONE bottom-right control that CHANGES ITS WORD: `Skip` until the last answer lands, then `Submit`.
     * Two separate buttons would mean the reviewer has to notice which one appeared; one button that
     * relabels is the behaviour the matrix asks for. */
    var primaryLabel = flow.atEnd ? 'Submit' : 'Skip';
    var primary = u.el('button', {
      class: 't2-capsule-primary', type: 'button',
      text: primaryLabel,
      data: { verb: flow.atEnd ? 'submit' : 'skip' }
    });
    this._on(primary, 'click', function () {
      if (flow.atEnd) {
        var res = svc.qflow.act(svc, self.tid(), 'submit');
        if (!res.ok) {
          /* The refusal belongs at the offending question, so carry it across the travel. */
          if (res.offenderIndex != null && res.offenderIndex !== flow.index) self._pendingReason = res.reason;
          else { reason.textContent = res.reason || 'Answer the required questions first.'; reason.setAttribute('data-show', '1'); if (global.PMXReveal) global.PMXReveal.reject(reason); }
          self.renderQuestion();
          return;
        }
        self.renderQuestion();
        self.renderSurfaces();
        return;
      }
      svc.qflow.act(svc, self.tid(), 'skip');
      self.renderQuestion();
    });
    foot.appendChild(primary);

    /* Next is the ordinary advance and stays distinct from Skip: skipping and answering are different
     * instructions and must not share a control. */
    if (!flow.atEnd) {
      var next = u.el('button', { class: 't2-capsule-next', type: 'button', text: 'Next' });
      this._on(next, 'click', function () {
        var res = svc.qflow.act(svc, self.tid(), 'next');
        if (!res.ok) {
          reason.textContent = res.reason || 'Answer this question first.';
          reason.setAttribute('data-show', '1');
          if (global.PMXReveal) global.PMXReveal.reject(reason);
          return;
        }
        self.renderQuestion();
      });
      foot.appendChild(next);
    }

    body.appendChild(foot);
    el.appendChild(body);
  };

  /* Compress the card back into the slim capsule, keeping the SAME element. */
  T2Thread.prototype._compressToCapsule = function (el, done, label) {
    var u = U();
    var R = global.PMXReveal;
    var svc = this.ctx.services;
    if (!el) { done(); return; }

    function shrink() {
      el.setAttribute('data-expanded', '0');
      el.setAttribute('data-phase', 'submitting');
      U().empty(el);
      /* The specified copy for the compressed phase. `qflow.act('submit')` settles the record in the same
       * interaction, so this is the ONLY frame in which the submitting state is visible - which is exactly
       * why it must carry the right words rather than a generic transitional label. */
      el.appendChild(u.el('span', { class: 't2-capsule-spinner pmx-spin' }));
      el.appendChild(u.el('span', { class: 't2-capsule-text', text: label || 'Submitting answers' }));
    }

    /* The compression is a size change like any other and goes through the same single owner, so the
     * card shrinking back into the strip is the exact inverse of the strip opening into the card. It
     * takes the firmer beat because it is the largest change this element makes:
     * 04_questionnaire_morph_prepare_submit.mov is built on that symmetry. */
    if (svc.motion && svc.motion.resizeBounce) {
      this._endCapsuleBounce();
      this._capsuleBounce = svc.motion.resizeBounce(el, shrink, { bounceClass: 'pmx-size-bounce-strong' });
    } else {
      shrink();
    }
    /* The next expansion is a new shape, not a continuation of this one. */
    this._capsuleOptCount = null;
    global.setTimeout(done, R && R.reduced(el) ? 0 : 180);
  };

  T2Thread.prototype._compressAndRemove = function (el, done) {
    var self = this;
    this._compressToCapsule(el, function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      done();
    });
  };

  /* The receipt. A slab, because that is what this concept records things in. */
  T2Thread.prototype._renderQuestionReceipt = function (host, receipt) {
    var self = this;
    var u = U();
    if (!receipt) return;

    var slab = u.el('div', { class: 't2-qreceipt', data: { status: receipt.status } });
    slab.appendChild(u.el('span', { class: 't2-qreceipt-kind', text: 'Questions' }));
    slab.appendChild(u.el('span', {
      class: 't2-qreceipt-text',
      text: receipt.cancelled
        ? 'Cancelled'
        : (receipt.answered + (receipt.answered === 1 ? ' answer sent' : ' answers sent') +
           (receipt.skipped ? ', ' + receipt.skipped + ' skipped' : ''))
    }));

    var show = u.el('button', { class: 't2-qreceipt-open', type: 'button', text: 'Show answers' });
    this._on(show, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 340,
        build: function (h) {
          h.appendChild(u.el('div', { class: 't2-sheet-title', text: receipt.cancelled ? 'Cancelled questions' : 'Answers sent' }));
          (receipt.questions || []).forEach(function (question) {
            var val = receipt.answers[question.id];
            var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't2-sheet-row' }, [
              u.el('span', { class: 't2-sheet-kind', text: wasSkipped ? 'skipped' : 'answered' }),
              u.el('span', { class: 't2-sheet-label', text: question.prompt + (val == null ? '' : ' \u2014 ' + [].concat(val).join(', ')) })
            ]));
          });
        }
      });
    });
    slab.appendChild(show);
    host.appendChild(slab);
  };

    T2Thread.prototype.syncLive = function () {
    var u = U();
    var svc = this.ctx.services;
    var status = svc.runtime.liveStatus(this.tid());

    if (!status) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null;
      return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't2-live pmx-live' }, [
        u.el('span', { class: 't2-live-dot pmx-pulse' }),
        u.el('span', { class: 't2-live-text' }),
        u.el('span', { class: 't2-live-time' })
      ]);
      this.list.appendChild(this.liveEl);
    }
    svc.motion.swapTextInstant(this.liveEl.querySelector('.t2-live-text'), status.text || '');
    svc.motion.swapTextInstant(this.liveEl.querySelector('.t2-live-time'),
      status.workedSeconds != null ? F().duration(status.workedSeconds) : '');
  };

  /* ---------------------------------------------------------------- ThreadInstance API */

  T2Thread.prototype.isExpanded = function (msgId) {
    return !!this.ctx.store.view(this.tid()).expanded[msgId];
  };

  T2Thread.prototype.setExpanded = function (msgId, on) {
    var self = this;
    var rec = this.rendered[msgId];
    this.ctx.store.view(this.tid()).expanded[msgId] = !!on;
    if (!rec) return;
    var body = rec.bodyEl;
    var btn = body.querySelector('.t2-more');

    this.scrollCtl.preserveAcross(body, function () {
      body.setAttribute('data-expanded', on ? '1' : '0');
      if (btn) btn.textContent = on ? 'Show less' : 'Show more';
      self.ctx.services.motion.snapToEnd(body);
    });
  };

  T2Thread.prototype.revealHidden = function (msgId) {
    this.setExpanded(msgId, true);
  };

  T2Thread.prototype.scrollToMessage = function (id, opts) {
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

  T2Thread.prototype.isExpandedEligible = function (id) {
    var msgs = this.ctx.data.messagesFor(this.tid());
    for (var i = 0; i < msgs.length; i++) {
      if (msgs[i].id === id) return (msgs[i].body || '').length >= COLLAPSE_ELIGIBLE_CHARS;
    }
    return false;
  };

  T2Thread.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T2Thread.prototype.setAnchor = function (tok) { return this.scrollCtl.restoreAnchor(tok); };

  T2Thread.prototype.update = function (state, changed) {
    var needsFull = false, needsSurfaces = false, needsQuestion = false;
    for (var i = 0; i < changed.length; i++) {
      var k = changed[i];
      if (k === 'session.activeThreadId') needsFull = true;
      if (k.indexOf('view') === 0) { needsSurfaces = true; needsQuestion = true; }
      /* A new sent/received message changes which message is "latest assistant" and must be
       * painted into the list, not just have its surfaces refreshed. */
      if (k === 'view.lens' || k === 'view.expanded' || k === 'view.messages') needsFull = true;
    }
    if (state.session.activeThreadId !== this.lastThreadId) needsFull = true;
    if (needsFull) { this.renderThread(); return; }
    if (needsSurfaces) this.renderSurfaces();
    if (needsQuestion) this.renderQuestion();
  };

  T2Thread.prototype.destroy = function () {
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
    if (this.scrollCtl && this.scrollCtl.destroy) { try { this.scrollCtl.destroy(); } catch (e) {} }
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    if (this.inlineSurfaces && this.inlineSurfaces.parentNode) this.inlineSurfaces.parentNode.removeChild(this.inlineSurfaces);
    if (this.inlineQuestion && this.inlineQuestion.parentNode) this.inlineQuestion.parentNode.removeChild(this.inlineQuestion);
    this.rendered = {};
    /* The append-only path keys off these. A destroyed instance that left them behind would let the
     * next render mistake a fresh mount for an append and skip building the slabs already on
     * screen. */
    this._renderedIds = null;
    this._renderedFrom = null;
    this._lastRole = null;
    /* The capsule outlives its renders, so a destroyed instance has to let go of it explicitly -
     * otherwise the next mount would adopt a capsule belonging to a dead thread, along with the
     * firstVisit record stamped on it. */
    this._capsuleEl = null;
    this._capsuleQid = null;
    this._capsuleOptCount = null;
    this._endCapsuleBounce();
  };

  global.PMX.thread.register('t2', {
    name: 'Two-Tone Slabs',
    blurb: 'Role reads from a tinted, inset user field against a full-bleed assistant field, no bubble outline anywhere. Every piece of machinery demotes to a small chip that opens a detail sheet.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T2Thread(regionEl, ctx);
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
