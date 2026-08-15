/* t4 "Digest" — Opus 5
 *
 * Long-message collapse is not a feature here, it is the entire concept. Every completed
 * turn auto-condenses to a two or three line digest; only the newest two turns render in
 * full. Reading a seven-hundred message thread becomes scanning a list.
 *
 * The bet: at 520px the scarce resource is vertical space, not horizontal. If every turn
 * costs three lines until you ask for more, a narrow window finally shows enough of the
 * conversation to follow its shape.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }

  var FULL_TAIL = 2;          /* newest N turns always render in full */
  var DIGEST_CHARS = 190;     /* upper bound on a digest line */

  function T4Thread(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.rendered = {};
    this.lastThreadId = null;
    this.build();
  }

  T4Thread.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };

  T4Thread.prototype.build = function () {
    var self = this;
    var u = U();

    this.root = u.el('div', { class: 't4-root' });
    this.head = u.el('div', { class: 't4-head' }, [
      u.el('span', { class: 't4-head-name', text: 'Digest' }),
      u.el('span', { class: 't4-head-hint', text: 'Completed turns condense. Newest two stay open.' }),
      u.el('span', { class: 't4-head-model', text: this.ctx.label })
    ]);
    this.root.appendChild(this.head);

    this.scroller = u.el('div', { class: 't4-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't4-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    this.inlineSurfaces = u.el('div', { class: 't4-inline-surfaces' });
    this.inlineQuestion = u.el('div', { class: 't4-inline-question' });
    if (!this.ctx.capabilities.workSurfaceHost) this.root.appendChild(this.inlineSurfaces);
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);

    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t4-turn', messageAttr: 'data-pmx-msg'
    });

    this.jumpBtn = u.el('button', { class: 't4-jump', text: 'Jump to latest' });
    this._on(this.jumpBtn, 'click', function () {
      self.scroller.scrollTop = self.scroller.scrollHeight;
    });
    /* The pill lives in its OWN lane directly after the scroller, not floating over it.
     * Floating meant the pill sat on top of whatever line happened to be at the bottom of
     * the viewport mid-scroll — measured covering prose at 17 of 24 scroll positions. The
     * lane is a permanent flex item, so the transcript viewport never changes height and
     * the overlap is impossible by construction rather than by clearance arithmetic. */
    this.jumpLane = u.el('div', { class: 't4-jump-lane' });
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
     * JavaScript, and a card left holding one is exactly the "parked mid-bounce" state reduced motion
     * exists to forbid. So the two height owners in this concept are FINISHED when the flag turns on -
     * finish lands the committed end state and clears everything they wrote. */
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
   * the card stayed clamped at an inline height with a transition still running under a stage marked
   * `reduced`. Settled handles are pruned on the way in, so the list is never longer than what is
   * genuinely in flight. */
  T4Thread.prototype._trackBounce = function (h) {
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

  T4Thread.prototype._settleMotion = function () {
    var mo = this.ctx.services.motion;
    if (!mo || !mo.reduced || !mo.reduced(this.root)) return;
    var list = this._qbounces || [];
    this._qbounces = [];
    for (var i = 0; i < list.length; i++) { try { list[i].finish(); } catch (e) {} }
    if (this._runHandover) { this._runHandover.finish(); this._runHandover = null; }
  };

  T4Thread.prototype.tid = function () { return this.ctx.store.get('session.activeThreadId'); };

  /* A digest is one sentence of prose plus a count of what the turn did. It must convey
   * subject and direction without the reader opening it. */
  T4Thread.prototype.digestText = function (msg) {
    var body = String(msg.body || '').replace(/\s+/g, ' ').trim();
    if (body.length <= DIGEST_CHARS) return body;
    var cut = body.slice(0, DIGEST_CHARS);
    var stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
    if (stop > DIGEST_CHARS * 0.45) return cut.slice(0, stop + 1);
    var sp = cut.lastIndexOf(' ');
    return (sp > 0 ? cut.slice(0, sp) : cut) + '…';
  };

  T4Thread.prototype.workSummary = function (msg) {
    var svc = this.ctx.services;
    var bits = [];
    var group = svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : msg.activityGroup;
    if (group) bits.push(svc.surfaces.condenseLabel(group));
    if (msg.thoughtSegments && msg.thoughtSegments.length) {
      bits.push(msg.thoughtSegments.length === 1 ? '1 thought segment' : msg.thoughtSegments.length + ' thought segments');
    }
    if (msg.completedQuestionnaire) bits.push('1 question answered');
    return bits.join(', ');
  };

  T4Thread.prototype.renderThread = function () {
    var tid = this.tid();
    var data = this.ctx.data;
    var view = this.ctx.store.view(tid);
    var msgs = data.visibleSlice(tid, view.loadedFrom);

    /* 01_message_arrival_spatial_continuity.mov, frames 47 to 63 (about 280ms at 57.6fps): the new
     * message enters as a flattened sliver at a seam and expands into its box, while everything
     * already on screen keeps its identity. Rebuilding the whole list cannot say that - every entry
     * replays its condense, so the one that actually arrived is indistinguishable from the twenty
     * that did not.
     *
     * So an append is an append. When the only difference is messages added at the END of the same
     * thread and the same loaded range, the existing entries are kept and the new ones are inserted
     * through motion.displace(); anything else is a genuine rebuild. */
    if (this._canAppendOnly(tid, view, msgs)) { this._appendTurns(msgs); return; }

    U().empty(this.list);
/* The live status row lives IN the list, so emptying it detaches the node this reference
     * points at. Dropping the reference makes syncLive() below rebuild an attached one instead of
     * quietly updating an orphan, which is why the running indicator vanished after a rebuild. */
    this.liveEl = null;
    this.rendered = {};
    this.lastThreadId = tid;

    var thread = data.threadById(tid);
    var hidden = thread ? Math.max(0, thread.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlderNotice(hidden));

    for (var i = 0; i < msgs.length; i++) {
      var isTail = i >= msgs.length - FULL_TAIL;
      this.list.appendChild(this.buildTurn(msgs[i], isTail));
    }

    /* What the next render compares against to decide whether anything ARRIVED. */
    this._renderedIds = msgs.map(function (m) { return m.id; });
    this._renderedFrom = view.loadedFrom;

    this.renderSurfaces();
    this.renderQuestion();
    this.syncLive();
  };

  T4Thread.prototype.buildOlderNotice = function (hidden) {
    var self = this;
    var u = U();
    var btn = u.el('button', { class: 't4-older', text: 'Load ' + hidden.toLocaleString() + ' earlier turns' });
    this._on(btn, 'click', function () {
      var tid = self.tid();
      var view = self.ctx.store.view(tid);
      var thread = self.ctx.data.threadById(tid);
      var current = view.loadedFrom == null
        ? thread.messages.length - thread.initialVisibleMessageCount : view.loadedFrom;
      view.loadedFrom = Math.max(0, current - 150);
      self.scrollCtl.preserveAcross(self.list, function () { self.renderThread(); });
    });
    return u.el('div', { class: 't4-older-wrap' }, [btn]);
  };

  /* True only when this render differs from the last by messages APPENDED to the end. A changed
   * thread, a changed loaded range, a removal, or any edit to an existing entry all fail this and
   * fall back to the rebuild, because none of those is an arrival and animating a reflow as though
   * something had just been said would be a lie about what happened. */
  T4Thread.prototype._canAppendOnly = function (tid, view, msgs) {
    if (!this._renderedIds || tid !== this.lastThreadId) return false;
    if (view.loadedFrom !== this._renderedFrom) return false;
    if (msgs.length <= this._renderedIds.length) return false;
    for (var i = 0; i < this._renderedIds.length; i++) {
      if (msgs[i].id !== this._renderedIds[i]) return false;
    }
    return true;
  };

  /* The running indicator is the FOOT of the list, not a turn, so an arriving entry is filed above
   * it rather than after it. */
  T4Thread.prototype._listTail = function () {
    return (this.liveEl && this.liveEl.parentNode === this.list) ? this.liveEl : null;
  };

  /* The tail window is the newest FULL_TAIL turns, so every arrival pushes one entry out of it and
   * that entry must condense. On a rebuild this happened for free; on the append path it has to be
   * done deliberately, and it is done INSIDE displace's mutation so the FLIP measures it: the
   * entry above shrinks, the rows below it move up, and the reference's "neighbouring rows displace
   * in the same beat" (f.47 to f.63) is reproduced literally rather than merely quoted. An entry
   * the reader opened or closed by hand is left alone - an explicit choice outranks the window. */
  T4Thread.prototype._recondense = function (msgs) {
    var expanded = this.ctx.store.view(this.tid()).expanded;
    for (var i = 0; i < this._renderedIds.length; i++) {
      var id = this._renderedIds[i];
      var rec = this.rendered[id];
      if (!rec) continue;
      var isTail = i >= msgs.length - FULL_TAIL;
      if (rec.isTail === isTail) continue;
      rec.isTail = isTail;
      if (expanded[id] !== undefined) continue;
      rec.el.setAttribute('data-open', isTail ? '1' : '0');
      var t = rec.el.querySelector('.t4-toggle');
      if (t) t.textContent = isTail ? 'Condense' : 'Open turn';
    }
  };

  T4Thread.prototype._appendTurns = function (msgs) {
    var self = this;
    var svc = this.ctx.services;
    var start = this._renderedIds.length;
    var tail = this._listTail();

    function insert() {
      self._recondense(msgs);
      var last = null;
      for (var i = start; i < msgs.length; i++) {
        last = self.buildTurn(msgs[i], i >= msgs.length - FULL_TAIL);
        self.list.insertBefore(last, tail);
      }
      /* displace stamps the node this returns, so it names the entry that actually arrived. */
      return last;
    }

    /* Measure, mutate, re-pin - in that order. A reader sitting at the bottom is carried with the
     * new entry; a reader who has scrolled up is left where they are, which is the whole reason
     * stickIfAtBottom measures BEFORE the mutation. */
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

  T4Thread.prototype.isOpen = function (msgId, isTail) {
    var explicit = this.ctx.store.view(this.tid()).expanded[msgId];
    if (explicit !== undefined) return !!explicit;
    return !!isTail;
  };

  T4Thread.prototype.buildTurn = function (msg, isTail) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var open = this.isOpen(msg.id, isTail);
    var lensState = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;

    var turn = u.el('div', {
      class: 't4-turn pmx-msg',
      data: { pmxMsg: msg.id, pmxRole: msg.role, open: open ? '1' : '0', lens: lensState || '' }
    });

    var body = u.el('div', { class: 't4-body pmx-msg-body' });

    var role = u.el('span', { class: 't4-role', text: msg.role === 'user' ? 'You' : 'Assistant' });

    var digest = u.el('div', { class: 't4-digest' }, [
      role,
      u.el('span', { class: 't4-digest-text', text: this.digestText(msg) })
    ]);
    var work = this.workSummary(msg);
    if (work) digest.appendChild(u.el('span', { class: 't4-digest-work', text: work }));
    body.appendChild(digest);

    var full = u.el('div', { class: 't4-full' });
    String(msg.body || '').split(/\n{2,}/).forEach(function (p) {
      var t = p.replace(/\n/g, ' ').trim();
      if (t) full.appendChild(u.el('p', { class: 't4-p', text: t }));
    });
    body.appendChild(full);

    turn.appendChild(body);

    /* Hover row is a sibling of the body, never nested inside it. */
    turn.appendChild(global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage(),
      onEdit: function () { svc.toast.show('Editing supersedes this message'); }
    }));

    var toggle = u.el('button', { class: 't4-toggle', text: open ? 'Condense' : 'Open turn' });
    /* The tail window MOVES as messages arrive, so the flag is read back from the record the append
     * path keeps current rather than from the value captured when this turn was built. Closing over
     * the build-time flag meant the first click after an arrival toggled against a window that had
     * already moved on, which showed as a button that appeared to do nothing. */
    this._on(toggle, 'click', function () {
      var live = self.rendered[msg.id];
      self.setExpanded(msg.id, !self.isOpen(msg.id, live ? live.isTail : isTail));
    });
    turn.appendChild(toggle);

    this.rendered[msg.id] = { el: turn, bodyEl: body, isTail: isTail };
    return turn;
  };

  T4Thread.prototype.lastMessage = function () {
    var m = this.ctx.data.messagesFor(this.tid());
    return m[m.length - 1];
  };

  /* ---------------------------------------------------------------- surfaces */

  T4Thread.prototype.surfaceHost = function () {
    return this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
  };

  /* ---------------------------------------------------------------- work: ONE digest line
   *
   * The matrix assigns this concept a WORK DIGEST LINE: every live surface reduced to one sentence -
   * `Phase 3 of 5 · 6/8 Todos · 3 agents · +182 −41` - condensing to `Verified · 4 artifacts · 22m`
   * when the work is done, and opening into a bounded internal-scroll ledger.
   *
   * That is a different claim from the old code, which drew one `t4-surface` row PER surface: four
   * rows is not a digest, it is a list with digest styling. A digest concept must be able to say
   * everything in one line, and the cost of that decision is that the line has to be BUILT from the
   * live facts rather than picked from them - which is exactly what makes it worth building here.
   */
  T4Thread.prototype.renderSurfaces = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.surfaceHost();
    if (!host) return;
    U().empty(host);

    /* Ask the flow, not `surfacesYielded`: that flag is written by renderQuestion, which runs AFTER
     * this on every pass, so reading it here paints the digest for one frame before the question
     * displaces it. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    /* Advice and the handoff are not work surfaces - one is a comment on the work, the other is its
     * product - so they survive the yield and hang below in their own hosts. */
    this._bsdHost = u.el('div', { class: 't4-bsd-host' });
    this._handoffHost = u.el('div', { class: 't4-handoff-host' });

    if (!pendingQuestion) {
      var active = svc.surfaces.activeFor(this.tid());
      var thread = this.ctx.data.threadById(this.tid());
      var parts = [];
      var detail = [];

      function each(v) { return v == null ? [] : (Object.prototype.toString.call(v) === '[object Array]' ? v : [v]); }

      if (active && active.goal) {
        /* The phase index leads. On one line, "where are we" outranks everything else. */
        var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(active.goal) : null;
        parts.push(phase ? ('Phase ' + phase.index + ' of ' + phase.total) : F().label(active.goal.status));
        detail.push({ kind: 'Goal', build: function (h) { self.goalDetail(h, active.goal); } });
      }

      if (active && active.todo) {
        var items = active.todo.items || [];
        var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
        var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
        parts.push(done + '/' + items.length + ' Todos' + (blocked ? ' (' + blocked + ' blocked)' : ''));
        detail.push({ kind: 'Todo', build: function (h) { self.todoDetail(h, active.todo); } });
      }

      each(active && active.subagents).forEach(function (g) {
        var c = g.counts || {};
        var n = (c.working || 0) + (c.queued || 0) + (c.blocked || 0) + (c.complete || 0) + (c.failed || 0) + (c.waiting || 0);
        parts.push(n + (n === 1 ? ' agent' : ' agents'));
        detail.push({ kind: 'Agents', build: function (h) { self.agentDetail(h, g); } });
      });

      each(active && active.diffs).forEach(function (g) {
        var files = g.files || [];
        var add = 0, rem = 0;
        files.forEach(function (f) { add += f.added || 0; rem += f.removed || 0; });
        parts.push('+' + add + ' \u2212' + rem);
        detail.push({ kind: 'Changes', build: function (h) { self.diffDetail(h, g); } });
      });

      /* Activity is six kinds on one line: the digest register cannot afford six rows, and dropping
       * them entirely would lose the read/search/web/browser/test/verify coverage the packet wants. */
      var stages = (thread && thread.activityStages) || [];
      if (stages.length) {
        parts.push(stages.length + ' steps');
        detail.push({ kind: 'Activity', build: function (h) { self.activityDetail(h, stages); } });
      }

      /* The CONDENSED form. The matrix names it exactly: `Verified · 4 artifacts · 22m`. It replaces
       * the live digest rather than shortening it - a finished run has different facts, not fewer. */
      var verified = this._verificationRecord();
      var complete = !!(active && active.goal && (active.goal.status === 'complete' || active.goal.completed));
      var arts = (thread && thread.artifacts) || [];

      var text, condensed = false;
      if (complete && verified) {
        condensed = true;
        text = ['Verified',
                arts.length + (arts.length === 1 ? ' artifact' : ' artifacts'),
                F().duration(verified.workedSeconds)].join(' \u00b7 ');
      } else {
        text = parts.join(' \u00b7 ');
      }

      /* The run leads the digest stack. It is what is happening NOW; the work line under it is what is
       * true of the thread, and the advice line and handoff card under that are comments on it. The
       * order also matters mechanically: groupReopen carries the siblings AFTER the capsule, so a
       * phase reopening pushes the work, advice and handoff lines down instead of displacing them.
       *
       * Three guards, because all three states are real: the service may not be loaded, the thread may
       * have no activity stages at all, and a run that has not started yet renders NOTHING rather than
       * an empty frame reserving space for work that has not happened. */
      var run = svc.runtrace ? svc.runtrace.read(this.tid()) : null;
      if (run && run.started) {
        /* appendChild MOVES the surviving element rather than adopting a copy, so emptying the host
         * above detached the run line and this puts the same one back. That is what lets the marks and
         * the sentence be morphed at all - see _runHost for why identity is the whole mechanism. */
        host.appendChild(this._syncRunDigest(run));
        /* Same rule the work ledger states below: `scrollTop` only takes effect once the element is in
         * the document, so the run ledger's offset is restored AFTER the append. Unfolding a phase low
         * in the ledger rebuilds the whole surface from the store, and an unfold that threw the ledger
         * back to its top would not be happening "in place". */
        if (this._runLedgerEl && this._runMemoState && this._runMemoState.scroll) {
          this._runLedgerEl.scrollTop = this._runMemoState.scroll;
        }
      } else {
        /* A run that has been reset is GONE, not merely unrendered: the marks it left behind would
         * otherwise be re-appended by the next render as an index into phases that no longer exist. */
        this._dropRunDigest();
      }

      if (text) {
        host.appendChild(this._workDigest(text, condensed, detail));
        /* `scrollTop` only takes effect once the element is in the document, so the ledger's offset is
         * restored AFTER the append. Without it, unfolding an operation low in the ledger - which
         * rebuilds the whole surface from the store - threw the ledger back to the top, and an unfold
         * that moves the thing you were reading is not happening "in place". */
        if (this._ledgerEl && this._ledgerScroll) this._ledgerEl.scrollTop = this._ledgerScroll;
      }
    }

    host.appendChild(this._bsdHost);
    host.appendChild(this._handoffHost);
    this._renderBsdDigest(this._bsdHost);
    this._renderHandoff(this._handoffHost);
  };

  /* The digest line itself. Opening uses the concept's OWN `data-open` mechanism - the same attribute
   * its turns use - rather than a popup: the matrix says "opening expands a bounded internal-scroll
   * ledger", and a popup is not an expansion, it is a different surface. */
  T4Thread.prototype._workDigest = function (text, condensed, detail) {
    var self = this;
    var u = U();
    var v = this.ctx.store.view(this.tid());
    var open = !!(v.surfaces && v.surfaces.expanded === 'work');
    this._ledgerEl = null;

    var wrap = u.el('div', { class: 't4-work', data: { open: open ? '1' : '0', condensed: condensed ? '1' : '0' } });

    var line = u.el('button', {
      class: 't4-work-line', type: 'button',
      aria: { expanded: open ? 'true' : 'false' }
    });
    line.appendChild(u.el('span', { class: 't4-work-kind', text: condensed ? 'Done' : 'Work' }));

    /* In-place morph. Counts change constantly in a live run and a digest that appends a second line
     * per tick stops being a digest by the third one. */
    var textEl = u.el('span', { class: 't4-work-text' });
    if (this.ctx.services.motion && this.ctx.services.motion.swapText) this.ctx.services.motion.swapText(textEl, text);
    else textEl.textContent = text;
    line.appendChild(textEl);
    line.appendChild(u.el('span', { class: 't4-work-chevron', text: open ? '\u2212' : '+' }));

    this._on(line, 'click', function () {
      var vv = self.ctx.store.view(self.tid());
      vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
      vv.surfaces.expanded = vv.surfaces.expanded === 'work' ? null : 'work';
      /* update() re-renders surfaces for any `view*` change, so one touch is the whole job. */
      self.ctx.store.touchView('surfaces');
    });
    wrap.appendChild(line);

    if (open) {
      /* The bounded ledger. `pmx-scroll` is the shared scrollbar treatment and the max-height lives in
       * CSS, so the ledger can never grow the transcript past the digest register. */
      var ledger = u.el('div', { class: 't4-ledger pmx-scroll' });
      this._ledgerEl = ledger;
      this._on(ledger, 'scroll', function () { self._ledgerScroll = ledger.scrollTop; });
      detail.forEach(function (d) {
        var section = u.el('div', { class: 't4-ledger-section' });
        section.appendChild(u.el('div', { class: 't4-ledger-kind', text: d.kind }));
        var body = u.el('div', { class: 't4-ledger-body' });
        d.build(body);
        section.appendChild(body);
        ledger.appendChild(section);
      });
      wrap.appendChild(ledger);
    }

    return wrap;
  };

  /* ---------------------------------------------------------------- the run: one sentence and its marks
   *
   * t4's reading of `reference/videos/03_compact_execution_activity.mov`. Everything in this concept
   * compresses to ONE SENTENCE on ONE LINE, so the run does too:
   *
   *     RUN  [marks]  Explored 7 files
   *     RUN  [marks]  13 tools used, 38s
   *
   * The reference draws its capsule as a stack of rows, which is the exact shape a digest refuses. So
   * the glyph chain becomes small MARKS ON THE LINE, and the per-phase record moves into the bounded
   * internal-scroll ledger this concept already opens for its work digest — one disclosure mechanism
   * for the whole concept rather than a second one invented for the run.
   *
   * Carried over as behaviour, not as look (its colours, radii and easing are its own):
   *   - one mark per ENTERED phase in entry order, each a real button that reopens THAT phase; f.1170
   *     reopens `Made 1 create, 2 edits` and f.1300 reopens `Explored 7 files`;
   *   - the count rewritten in place, digits only, at the same y (f.208 -> f.286 -> f.338);
   *   - present participle while running, past tense once settled (f.194 versus f.1170);
   *   - condensed is the RESTING state, not a deletion: at f.910 the run becomes `13 tools used` and
   *     the surfaces below it are pushed down when a phase is reopened, never replaced;
   *   - the chain scrolls rather than truncating, because the mark is the only route back to a phase.
   *
   * What is t4's rather than the reference's: opening a phase unfolds ONE SECTION of the ledger. The
   * other phases stay one sentence each, which is exactly the relationship the operation digest below
   * already has with its own unfold.
   *
   * WHY THE LINE IS RECONCILED RATHER THAN REBUILT
   * ----------------------------------------------
   * This capsule used to be rebuilt from scratch on every render, and a memo re-seeded each new span
   * with what the line had said a moment earlier so countMorph had something to morph FROM. That made
   * the digits move, but it could not make the two-beat phase handover of f.194-211 exist at all: a
   * handover is a statement about ONE element surviving a change, and an element that is rebuilt has
   * nothing to survive.
   *
   * The geometry here is the reference's own, which is why this concept is the one that takes it. The
   * chain is a real flex sibling BETWEEN the kind label and the sentence, so a mark whose slot opens
   * from zero width pushes the sentence right by exactly one slot - literally f.205-209. The other
   * concepts re-idiom that beat because their chains cannot reach their labels; this one does not have
   * to.
   *
   * So the line, the chain, every mark and both halves of the sentence are created ONCE and kept. The
   * ledger below them is not: it is a disclosure, one sentence per phase, and nothing in it morphs.
   */

  /* Per-thread memo for the run line. It holds what the line last SAID (per span), which phase was
   * disclosed, and where the ledger was scrolled to.
   *
   * None of that is a fact about the run, so none of it belongs on the store: it is a fact about the
   * last paint of this element. It is keyed by thread id because a sentence from another thread is not
   * a previous state of this one, so switching threads starts the memo again. */
  T4Thread.prototype._runMemo = function () {
    var tid = this.tid();
    if (!this._runMemoState || this._runMemoState.tid !== tid) {
      this._runMemoState = { tid: tid, text: {}, openId: null, scroll: 0 };
    }
    return this._runMemoState;
  };

  /* countMorph, never swapText: `6 files` becoming `7 files` has to move the digits and leave the word
   * `files` in the layout box it already had (f.208 -> f.338). Cross-fading the whole label reads as
   * the line being replaced, which is the difference between a running tally and a series of different
   * sentences. countMorph falls back to a label swap by itself when the WORDS changed too — the honest
   * outcome, and also beat one of the two-beat phase handover at f.198-203.
   *
   * ON CHANGE ONLY, and that is a consequence of the span now surviving. While the line was rebuilt
   * per render the memo had to re-seed each new span with the previous string, inside a freshness
   * window, or countMorph took its entrance path every tick and no digit ever moved. The span is kept
   * now, so the opposite guard is the one that matters: calling countMorph with an unchanged string
   * would replay the digit animation on every unrelated view touch, and a count that appears to tick
   * when no work happened is a lie told by animation.
   *
   * `hold` is how phaseHandover takes ownership of a beat. During a handover the sentence is being
   * crossed by the handover itself (f.198-203), so writing it here as well would run two animations
   * at one element and the later one would win with no cross-fade at all. The memo is still advanced,
   * because what the line is ABOUT to say is what the next render must compare against. */
  T4Thread.prototype._morphText = function (el, memo, key, next, hold) {
    var motion = this.ctx.services.motion;
    var slot = memo.text[key] || (memo.text[key] = { text: null });
    if (slot.text === next) return;
    slot.text = next;
    if (!hold) {
      if (!motion || !motion.countMorph) { el.textContent = next; return; }
      motion.countMorph(el, next);
    }

    /* The memo is advanced OPTIMISTICALLY, before the write lands, and BOTH paths need the backstop
     * for the same reason. countMorph's non-digit path and swapText both defer through a double
     * requestAnimationFrame, so a dropped frame — a backgrounded tab, a throttled rAF — would leave
     * the memo claiming this text while the span still shows the old one, and the equality guard above
     * would then refuse to repaint it forever. The held path is the more dangerous of the two: nothing
     * here wrote the span at all, so a handover that lost its frame would strand the sentence on the
     * previous phase's words with no later render able to notice. The window is longer for it because
     * phaseHandover's own two beats have to be given their time first. */
    if (slot.timer) global.clearTimeout(slot.timer);
    slot.timer = global.setTimeout(function () {
      slot.timer = null;
      /* Only while the memo still expects this exact string: a later morph owns the span by then. */
      if (slot.text === next && el.textContent !== next) el.textContent = next;
    }, hold ? 480 : 320);
  };

  /* The run line's elements, built ONCE per thread and kept.
   *
   * Every control below reads the run at CLICK time rather than closing over the record this render
   * happened to see. That is forced by the element surviving: a handler bound once to a run that has
   * since condensed would answer with the state of a moment that is over. */
  T4Thread.prototype._runHost = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var tid = this.tid();
    if (this._runEls && this._runTid === tid) return this._runEls;
    /* A sentence from another thread is not a previous state of this one, so a thread change starts
     * the line again - the same rule _runMemo already applies to the words. */
    this._dropRunDigest();

    var wrap = u.el('div', {
      class: 't4-run', data: { open: '0', condensed: '0', running: '0' }
    });

    var line = u.el('div', { class: 't4-run-line' });
    /* The kind label is the shared digest register's, not a new one: in this concept the run line, the
     * work line and the advice line ARE the same kind of object, and the register is where that is
     * said. Only the run-specific state gets a t4-run class of its own. */
    line.appendChild(u.el('span', { class: 't4-work-kind t4-run-kind', text: 'Run' }));

    /* ---- the marks: the chain, indexed onto the line itself.
     *
     * The chain sits between the label and the sentence because that is where the reference grows it:
     * at f.205-209 the new glyph fades in BETWEEN the last glyph and the label and pushes the label
     * right by exactly one slot. It is a real flex sibling of both, so that push is this concept's own
     * layout doing what the reference's does rather than an effect standing in for it. */
    var chain = u.el('span', { class: 't4-run-chain pmx-chain' });
    line.appendChild(chain);

    /* ---- the sentence, morphed in place */
    var sentence = u.el('button', {
      class: 't4-run-sentence', type: 'button', aria: { expanded: 'false' }
    });
    var verbEl = u.el('span', { class: 't4-run-verb' });
    var argEl = u.el('span', { class: 't4-run-arg' });
    var chevron = u.el('span', { class: 't4-work-chevron', text: '+', aria: { hidden: 'true' } });
    sentence.appendChild(verbEl);
    sentence.appendChild(argEl);
    sentence.appendChild(chevron);

    /* One control, three meanings, in the order a reader means them: dismiss what is open, disclose a
     * condensed run, condense a live one. The run is read at CLICK time because this handler is bound
     * once: a record captured when the line was built would answer with a moment that is over. */
    this._on(sentence, 'click', function () {
      var live = svc.runtrace && svc.runtrace.read ? svc.runtrace.read(self.tid()) : null;
      if (!live) return;
      if (live.open) { svc.runtrace.close(self.tid()); return; }
      if (live.condensed) {
        if (svc.motion && svc.motion.groupReopen) {
          svc.motion.groupReopen(wrap, function () { svc.runtrace.open(self.tid()); });
        } else {
          svc.runtrace.open(self.tid());
        }
        return;
      }
      svc.runtrace.condense(self.tid());
    });
    line.appendChild(sentence);
    wrap.appendChild(line);

    this._runEls = {
      wrap: wrap, line: line, chain: chain,
      sentence: sentence, verb: verbEl, arg: argEl, chevron: chevron, ledger: null
    };
    this._runTid = tid;
    this._runMarkEls = {};
    this._runSubjectId = null;
    return this._runEls;
  };

  T4Thread.prototype._dropRunDigest = function () {
    /* Finish rather than abandon: a handover caught mid-beat still owes its final state, and
     * phaseHandover's own endNow is what pays it. */
    if (this._runHandover) { this._runHandover.finish(); this._runHandover = null; }
    if (this._runEls && this._runEls.wrap && this._runEls.wrap.parentNode) {
      this._runEls.wrap.parentNode.removeChild(this._runEls.wrap);
    }
    this._runEls = null;
    this._runTid = null;
    this._runMarkEls = {};
    this._runSubjectId = null;
    this._runLedgerEl = null;
  };

  /* One mark: the button that reopens THAT phase (f.1170 reopens `Made 1 create, 2 edits`, f.1300
   * reopens `Explored 7 files`). One element per phase, enforced HERE rather than trusted — the
   * handover inserts its mark on beat two, asynchronously, so any reconciliation done during the
   * render that scheduled it runs too early to see the result, and overwriting the record without
   * detaching the element it replaced would leave an unreachable duplicate in the chain. */
  T4Thread.prototype._makeRunMark = function (p) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var pid = p.id;

    var prior = this._runMarkEls && this._runMarkEls[pid];
    if (prior && prior.slot && prior.slot.parentNode) prior.slot.parentNode.removeChild(prior.slot);

    /* Every mark lives in its own slot, so the chain has a box whose width can open when a phase hands
     * over. Without the slot there is nothing to animate and the sentence jumps a mark-width. */
    var slot = u.el('span', { class: 'pmx-chain-slot' });
    var mark = u.el('button', {
      class: 't4-run-mark', type: 'button',
      data: { kind: p.kind, state: p.running ? 'running' : 'done', open: '0' }
    });
    if (svc.icons) mark.appendChild(svc.icons.get(p.glyph, 11));
    this._on(mark, 'click', function () {
      /* groupReopen carries the siblings BELOW the run line — the work digest, the advice line and
       * the handoff card — so they are pushed down as one block instead of jumping (f.910). */
      if (svc.motion && svc.motion.groupReopen && self._runEls) {
        svc.motion.groupReopen(self._runEls.wrap, function () { svc.runtrace.open(self.tid(), pid); });
      } else {
        svc.runtrace.open(self.tid(), pid);
      }
    });
    slot.appendChild(mark);

    var rec = { slot: slot, mark: mark };
    this._runMarkEls[pid] = rec;
    return rec;
  };

  /* A mark's state and its words. The headline is re-stated on every pass because the tense flips
   * inside it (`Exploring` becomes `Explored`) and the title is the only place a mark speaks at all. */
  T4Thread.prototype._writeRunMark = function (rec, p, isSubject) {
    rec.mark.setAttribute('data-state', p.running ? 'running' : 'done');
    rec.mark.setAttribute('data-open', isSubject ? '1' : '0');
    rec.mark.setAttribute('aria-expanded', isSubject ? 'true' : 'false');
    rec.mark.setAttribute('aria-label', p.headline);
    rec.mark.title = p.headline;
  };

  /* The chain: one mark per ENTERED phase, in entry order (f.208 two, f.390 three, f.780 four, f.910
   * six). Returns true when a handover is in flight, which is the one case where the caller must not
   * roll the chain itself — the mark it would have to reach does not exist until beat two. */
  T4Thread.prototype._syncRunChain = function (run, subject, verbText, argText) {
    var self = this;
    var svc = this.ctx.services;
    var els = this._runEls;
    var chain = els.chain;
    this._runMarkEls = this._runMarkEls || {};

    var wanted = {};
    run.chain.forEach(function (p) { wanted[p.id] = true; });
    for (var id in this._runMarkEls) {
      if (!Object.prototype.hasOwnProperty.call(this._runMarkEls, id)) continue;
      if (wanted[id]) continue;
      /* Only a reset ever takes a phase out of the chain. Nothing else removes a mark, because the
       * mark is the only route back into its phase and dropping one would silently make that part of
       * the run unreachable. */
      var gone = this._runMarkEls[id];
      if (gone.slot && gone.slot.parentNode) gone.slot.parentNode.removeChild(gone.slot);
      delete this._runMarkEls[id];
    }

    /* A phase HANDS OVER only when the sentence moves to a mark that is arriving NOW, at the end of
     * the chain. A reader reopening an old phase, or a whole finished run appearing at once, is not a
     * handover and must not be animated as one — and deferring a mark that is not the newest entry
     * would also append it out of entry order. */
    var last = run.chain.length ? run.chain[run.chain.length - 1] : null;
    var arriving = (subject && last && subject.id === last.id && !this._runMarkEls[subject.id]) ? subject : null;
    /* The sentence is ONE element in this concept rather than one per mark, so `outgoing` is not an
     * element to fade: it is the FACT that another phase owned the line a moment ago. With no previous
     * subject there is nothing to hand over from, and beat one is the line's first words arriving. */
    var outgoing = (arriving && this._runSubjectId && this._runSubjectId !== arriving.id)
      ? this._runSubjectId : null;

    run.chain.forEach(function (p) {
      if (arriving && arriving.id === p.id) return;    /* inserted below, on beat two */
      var rec = self._runMarkEls[p.id] || self._makeRunMark(p);
      self._writeRunMark(rec, p, !!(subject && subject.id === p.id));
      /* Re-appending a survivor is how DOM order is kept equal to entry order without touching the
       * element itself: appendChild moves a node it already owns rather than recreating it. */
      chain.appendChild(rec.slot);
    });

    /* The chain is whatever `_runMarkEls` says it is, and nothing else. Reconciling by identity rather
     * than trusting the map to be complete is what makes a stale slot impossible to reach, whatever
     * caused the map and the element to disagree. */
    var live = {};
    for (var liveId in this._runMarkEls) {
      if (Object.prototype.hasOwnProperty.call(this._runMarkEls, liveId)) live[liveId] = this._runMarkEls[liveId].slot;
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
      born = self._makeRunMark(arriving);
      self._writeRunMark(born, arriving, true);
      chain.appendChild(born.slot);
      return born.mark;
    }

    var mo = svc.motion;
    if (!mo || !mo.phaseHandover) {
      insert();
      els.verb.textContent = verbText;
      els.arg.textContent = argText;
      this._rollChain(born.mark);
      return true;
    }

    /* THE TWO-BEAT HANDOVER, f.194-211, and the ORDER is the whole of it:
     *
     *   198-200  the sentence lets go of the phase that is finishing
     *   201-203  the new sentence is written where the old one stood, having moved nowhere yet
     *   205-209  the arriving mark's slot opens from zero width BETWEEN the last mark and the
     *            sentence, and pushes the sentence right by exactly one slot
     *
     * A single cross-fade of marks and sentence together is what this replaces, and it reads as the
     * row being replaced wholesale — which loses the fact that the phase just finished SURVIVES as an
     * index entry. phaseHandover owns both beats. The verb rides beat one beside the argument because
     * they are one sentence split across two spans (the tense flips on the verb alone while the
     * argument keeps its words), and swapText's own 110ms cross-fade is what makes the two agree by
     * construction rather than by two constants kept in step by hand. */
    if (outgoing && mo.swapText) mo.swapText(els.verb, verbText);
    else els.verb.textContent = verbText;

    this._runHandover = mo.phaseHandover(chain, els.arg, insert, argText)
      .then(function () {
        self._runHandover = null;
        self._rollChain(born ? born.mark : null);
      });
    return true;
  };

  /* The chain SCROLLS rather than truncating, and brings the phase being read back into view. The
   * reference caps its own chain and rolls the oldest glyph off the left as a seventh phase starts
   * (f.910 shows six); the glyph is scrolled out, never dropped, because dropping it would silently
   * make that phase unreachable. */
  T4Thread.prototype._rollChain = function (into) {
    var self = this;
    var svc = this.ctx.services;
    var els = this._runEls;
    if (!els || !svc.motion || !svc.motion.chainRoll) return;
    var chain = els.chain;
    global.requestAnimationFrame(function () {
      if (!self._runEls || self._runEls.chain !== chain || !chain.isConnected) return;
      svc.motion.chainRoll(chain, into && into.isConnected ? { into: into } : null);
    });
  };

  T4Thread.prototype._syncRunDigest = function (run) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var memo = this._runMemo();
    var els = this._runHost();
    var wrap = els.wrap;
    var open = run.open;

    /* The subject of the sentence: whatever the reader opened, else whatever is running, else the last
     * thing the run did. A condensed run with nothing open has no subject — it has a total. */
    var subject = open || run.running || (run.chain.length ? run.chain[run.chain.length - 1] : null);
    var unfoldId = open ? open.id : (!run.condensed && run.running ? run.running.id : null);
    var showLedger = unfoldId != null;

    wrap.setAttribute('data-open', showLedger ? '1' : '0');
    wrap.setAttribute('data-condensed', run.condensed ? '1' : '0');
    wrap.setAttribute('data-running', run.running ? '1' : '0');
    els.sentence.setAttribute('aria-expanded', showLedger ? 'true' : 'false');
    els.chevron.textContent = showLedger ? '\u2212' : '+';

    /* Resting state: the whole run stated as its total. The duration follows in the register's own
     * mid-dot idiom rather than as a second row, which is what the condensed work line already does. */
    var resting = run.condensed && !open;
    var verbText = resting ? run.summaryLabel : (subject ? subject.verb : '');
    var argText = resting
      ? (run.workedSeconds ? '\u00b7 ' + F().duration(run.workedSeconds) : '')
      : (subject ? subject.argument : '');

    /* The chain is reconciled BEFORE the sentence is morphed, because what it finds — an arriving mark
     * or none — is what decides whether the sentence is being handed over or merely re-counted. */
    var handingOver = this._syncRunChain(run, subject, verbText, argText);

    /* The memo is a keyed map by design (see _runMemo's `text: {}`), so the key is what the call has to
     * pass. Both spans are HELD during a handover, because phaseHandover owns that beat. */
    this._morphText(els.verb, memo, 'verb', verbText, handingOver);
    this._morphText(els.arg, memo, 'arg', argText, handingOver);

    /* The subject of the last paint, stamped AFTER the sync so the next arrival can tell which phase
     * is handing the sentence over. */
    this._runSubjectId = subject ? subject.id : null;

    var activeMark = (subject && this._runMarkEls[subject.id]) ? this._runMarkEls[subject.id].mark : null;

    /* ---- the ledger: one sentence per entered phase, and ONE of them unfolded.
     *
     * The line above survives every render; this does not, and the difference is not an oversight. A
     * mark and a sentence are objects the reader watches CHANGE, so they have to be the same elements
     * from one render to the next or the change has nothing to happen to. The ledger is a disclosure —
     * it is either open on one phase or it is not there at all — and nothing in it morphs, so rebuilding
     * it states exactly what it is. */
    var ledger = null;
    var openSection = null;
    if (els.ledger && els.ledger.parentNode) els.ledger.parentNode.removeChild(els.ledger);
    els.ledger = null;
    this._runLedgerEl = null;

    if (showLedger) {
      ledger = u.el('div', { class: 't4-ledger t4-run-ledger pmx-scroll' });
      this._runLedgerEl = ledger;
      this._on(ledger, 'scroll', function () { memo.scroll = ledger.scrollTop; });

      run.chain.forEach(function (p) {
        var isOpen = p.id === unfoldId;
        var section = u.el('div', {
          class: 't4-run-section', data: { open: isOpen ? '1' : '0', state: p.status }
        });

        var phaseLine = u.el('button', {
          class: 't4-run-phase', type: 'button', title: p.headline,
          aria: { expanded: isOpen ? 'true' : 'false' }
        });
        phaseLine.appendChild(u.el('span', { class: 't4-run-phase-verb', text: p.verb }));
        if (p.argument) phaseLine.appendChild(u.el('span', { class: 't4-run-phase-arg', text: p.argument }));
        /* A duration is printed only once the phase is DONE. `durationMs` is how long the stage took,
         * so stating it beside a phase that is still running would report a measurement the run has
         * not finished making. */
        if (p.status === 'done' && p.durationMs) {
          phaseLine.appendChild(u.el('span', {
            class: 't4-run-phase-time', text: F().duration(Math.round(p.durationMs / 1000))
          }));
        }
        self._on(phaseLine, 'click', function () {
          if (svc.motion && svc.motion.groupReopen) {
            svc.motion.groupReopen(wrap, function () { svc.runtrace.open(self.tid(), p.id); });
          } else {
            svc.runtrace.open(self.tid(), p.id);
          }
        });
        section.appendChild(phaseLine);
        /* The fold mark is a SIBLING of the line, exactly as in the operation digest: inside the button
         * the ellipsis would eat it whenever the sentence overflowed. */
        section.appendChild(u.el('span', {
          class: 't4-run-fold-mark', text: isOpen ? '\u2212' : '+', aria: { hidden: 'true' }
        }));

        if (isOpen) {
          var fold = u.el('div', { class: 't4-run-unfold' });
          if (p.detail) fold.appendChild(u.el('div', { class: 't4-run-detail', text: p.detail }));
          (p.rows || []).forEach(function (r) {
            /* Deliberately the operation digest's own three classes. A per-file line is ONE object in
             * this concept — `Edited shared/selectors.js +92 −18` — and styling it twice would be two
             * idioms for one fact. */
            var row = u.el('div', { class: 't4-op-file' }, [
              u.el('span', { class: 't4-op-lead', text: r.verb || '' }),
              u.el('span', { class: 't4-op-path', text: r.target || '' })
            ]);
            if (r.added != null || r.removed != null) {
              row.appendChild(u.el('span', {
                class: 't4-op-delta', text: '+' + (r.added || 0) + ' \u2212' + (r.removed || 0)
              }));
            }
            fold.appendChild(row);
          });
          if (fold.firstChild) section.appendChild(fold);
          openSection = section;
        }

        ledger.appendChild(section);
      });
      wrap.appendChild(ledger);
      els.ledger = ledger;
    }

    /* A handover schedules its own roll, because the mark it has to reach does not exist until beat
     * two. Rolling here as well would scroll to where that mark is about to be and then again. */
    if (!handingOver) this._rollChain(activeMark);

    /* Random access has to actually REACH the phase: the ledger is height-bounded, so a mark whose
     * section sits below the fold would unfold somewhere the reader cannot see. Only a CHANGE of
     * disclosure scrolls it — a re-render caused by anything else must never move the ledger under
     * the reader, which is the whole reason the scroll offset is preserved in the first place. */
    var disclosureChanged = memo.openId !== run.openId;
    memo.openId = run.openId;
    if (openSection && disclosureChanged) {
      global.requestAnimationFrame(function () {
        if (!ledger || !ledger.isConnected) return;
        var box = ledger.getBoundingClientRect();
        var sec = openSection.getBoundingClientRect();
        if (sec.top < box.top) ledger.scrollTop += sec.top - box.top;
        else if (sec.bottom > box.bottom) ledger.scrollTop += Math.min(sec.top - box.top, sec.bottom - box.bottom);
        memo.scroll = ledger.scrollTop;
      });
    }

    return wrap;
  };

  /* ---------------------------------------------------------------- operations: the digest unfolds
   *
   * `reference/screenshots/pm7_popout.png` renders one unit of tool work as a headline, a why line,
   * six labelled fields, per-file deltas and two chips. Nine of those blocks is roughly two hundred
   * lines of detail, which is the exact wall this concept exists to refuse: a digest that prints a
   * card per step has stopped being a digest.
   *
   * So the card FOLDS INTO ONE SENTENCE per operation - the three facts that decide whether you need
   * to look further, in the order you would say them out loud:
   *
   *     COMPLETED  Searched web: schema.org Recipe markup coverage 2026 · cmd.chat.web.search · cache miss
   *
   * and unfolding writes the rest as MORE SENTENCES in the same register: the `why` first, because it
   * is the only line that says whether the operation should have run at all, then the four fields the
   * line could not carry with their key as a lead-in word rather than a column, then one line per
   * changed file, then the chips. The unfold only ever adds lines - no box, no grid, no card - which
   * is why it can happen in place inside the ledger without changing what kind of surface this is.
   *
   * Every value is printed as the record states it. The tense in `headline`, the count in it, and the
   * status word all come from `opcard`; re-deriving any of them here is how two surfaces start
   * disagreeing about the same operation.
   */
  T4Thread.prototype.activityDetail = function (host, stages) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var recs = svc.opcard ? svc.opcard.forThread(this.ctx, this.tid()) : [];
    var byId = {};
    for (var i = 0; i < recs.length; i++) byId[recs[i].id] = recs[i];

    stages.forEach(function (st) {
      var rec = byId[st.id];
      if (rec) { host.appendChild(self._opDigest(rec)); return; }
      /* A stage carrying no operation facts stays the plain ledger row it always was. Printing an
       * operation sentence for it would claim a command and a cache result that do not exist. */
      host.appendChild(u.el('div', { class: 't4-sheet-row' }, [
        u.el('span', { class: 't4-sheet-k', text: F().label(st.kind) }),
        u.el('span', { class: 't4-sheet-v', text: st.label + (st.detail ? ' \u2014 ' + st.detail : '') })
      ]));
    });
  };

  T4Thread.prototype._opField = function (rec, key) {
    for (var i = 0; i < rec.fields.length; i++) {
      if (rec.fields[i].key === key) return rec.fields[i].value;
    }
    return '';
  };

  T4Thread.prototype._opDigest = function (rec) {
    var self = this;
    var u = U();
    var v = this.ctx.store.view(this.tid());
    var open = !!(v.surfaces && v.surfaces.openIds && v.surfaces.openIds[rec.id]);

    var entry = u.el('div', { class: 't4-op-entry', data: { open: open ? '1' : '0', status: rec.status } });

    var cmd = this._opField(rec, 'COMMAND');
    /* `cache` is a LEAD-IN, not a value: the record says `miss`, and `· miss` alone in a sentence
     * names nothing. The word that makes it readable is added; the value is printed verbatim. */
    var cache = 'cache ' + this._opField(rec, 'CACHE');

    /* ONE LINE, and deliberately not a flex row of cells: a single run of inline text, so the CSS
     * ellipsis truncates the SENTENCE at its end instead of clipping four independent columns. */
    var line = u.el('button', {
      class: 't4-op-line', type: 'button',
      title: rec.statusLabel + ' \u00b7 ' + rec.headline + ' \u00b7 ' + cmd + ' \u00b7 ' + cache,
      aria: { expanded: open ? 'true' : 'false' }
    });
    line.appendChild(u.el('span', { class: 't4-op-status', text: rec.statusLabel }));
    line.appendChild(u.el('span', { class: 't4-op-head', text: rec.headline }));
    line.appendChild(u.el('span', { class: 't4-op-sep', text: '\u00b7' }));
    line.appendChild(u.el('span', { class: 't4-op-cmd', text: cmd }));
    line.appendChild(u.el('span', { class: 't4-op-sep', text: '\u00b7' }));
    line.appendChild(u.el('span', { class: 't4-op-cache', text: cache }));

    this._on(line, 'click', function () {
      var vv = self.ctx.store.view(self.tid());
      vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
      vv.surfaces.openIds = vv.surfaces.openIds || {};
      /* `openIds` is the store's per-record open SET, which is what this needs: unfolding one
       * operation must not fold the one you were comparing it against. `expanded` stays the single
       * key that says which SURFACE is open, so no second disclosure mechanism appears. */
      if (vv.surfaces.openIds[rec.id]) delete vv.surfaces.openIds[rec.id];
      else vv.surfaces.openIds[rec.id] = true;
      self.ctx.store.touchView('surfaces');
    });
    entry.appendChild(line);

    /* The fold mark is a SIBLING of the line, not a child of it: inside the button the ellipsis would
     * eat it whenever the sentence overflowed. It never takes the pointer, so the whole line stays
     * one control. */
    entry.appendChild(u.el('span', { class: 't4-op-mark', text: open ? '\u2212' : '+', aria: { hidden: 'true' } }));

    if (!open) return entry;

    var fold = u.el('div', { class: 't4-op-unfold' });

    if (rec.why) fold.appendChild(u.el('div', { class: 't4-op-why', text: rec.why }));

    rec.fields.forEach(function (f) {
      /* COMMAND and CACHE are already in the line above. Repeating them here would turn the unfold
       * into a table of the sentence it came out of. */
      if (f.key === 'COMMAND' || f.key === 'CACHE') return;
      fold.appendChild(u.el('div', { class: 't4-op-sub', title: f.value, data: { key: f.key } }, [
        u.el('span', { class: 't4-op-lead', text: f.key.toLowerCase().replace(/_/g, ' ') }),
        u.el('span', { class: 't4-op-val', text: f.value })
      ]));
    });

    /* One line per file, the shape the reference prints: `Edited shared/selectors.js +92 −18`. */
    (rec.rows || []).forEach(function (r) {
      var fileRow = u.el('div', { class: 't4-op-file' }, [
        u.el('span', { class: 't4-op-lead', text: r.verb }),
        u.el('span', { class: 't4-op-path', text: r.target })
      ]);
      /* Only edits carry a line delta. A read or a check has none, and concatenating an absent one
       * prints "+undefined -undefined"; writing "+0 -0" instead would assert a zero-line edit that
       * did not happen. Omitting the span is the only rendering that claims nothing. */
      if (r.added != null || r.removed != null) {
        fileRow.appendChild(u.el('span', {
          class: 't4-op-delta',
          text: (r.added != null ? '+' + r.added : '') +
                (r.added != null && r.removed != null ? ' ' : '') +
                (r.removed != null ? '\u2212' + r.removed : '')
        }));
      }
      fold.appendChild(fileRow);
    });

    if (rec.chips.length) {
      var chips = u.el('div', { class: 't4-op-chips' });
      rec.chips.forEach(function (chip) {
        if (chip.kind === 'artifact') {
          var btn = u.el('button', {
            class: 't4-op-chip', type: 'button', data: { kind: 'artifact' },
            title: 'Opens ' + chip.artifactId, text: chip.label
          });
          self._on(btn, 'click', function () { self.ctx.services.artifacts.open(chip.artifactId); });
          chips.appendChild(btn);
          return;
        }
        /* `/sources · 5` is a count, not a destination - there is nothing to open - so it renders as
         * a quiet tag. A chip that looks pressable and does nothing is worse than no chip. */
        chips.appendChild(u.el('span', { class: 't4-op-chip', data: { kind: chip.kind }, text: chip.label }));
      });
      fold.appendChild(chips);
    }

    entry.appendChild(fold);
    return entry;
  };

  T4Thread.prototype._verificationRecord = function () {
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].verification) return msgs[i].verification;
    return null;
  };

  /* ---------------------------------------------------------------- BSD: its own digest line */

  T4Thread.prototype._renderBsdDigest = function (host) {
    var self = this;
    var u = U();
    U().empty(host);
    var bsd = this.ctx.services.bsd;
    if (!bsd || !bsd.advice) return;

    var list = bsd.advice(this.tid()) || [];
    if (!list.length) return;

    var cautions = list.filter(function (a) { return a.severity === 'caution'; }).length;
    var v = this.ctx.store.view(this.tid());
    var open = !!(v.surfaces && v.surfaces.expanded === 'bsd');

    var wrap = u.el('div', { class: 't4-bsd', data: { open: open ? '1' : '0' } });
    var line = u.el('button', { class: 't4-work-line', type: 'button', aria: { expanded: open ? 'true' : 'false' } });
    line.appendChild(u.el('span', { class: 't4-work-kind', text: 'Advice' }));
    /* The summary states the severity in words. A digest line has no room for a legend, so the
     * distinction cannot rest on colour. */
    line.appendChild(u.el('span', {
      class: 't4-work-text',
      text: cautions
        ? (cautions + (cautions === 1 ? ' caution' : ' cautions') + (list.length > cautions ? ', ' + (list.length - cautions) + ' notes' : ''))
        : (list.length + (list.length === 1 ? ' note' : ' notes'))
    }));
    line.appendChild(u.el('span', { class: 't4-work-chevron', text: open ? '\u2212' : '+' }));
    this._on(line, 'click', function () {
      var vv = self.ctx.store.view(self.tid());
      vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
      vv.surfaces.expanded = vv.surfaces.expanded === 'bsd' ? null : 'bsd';
      self.ctx.store.touchView('surfaces');
    });
    wrap.appendChild(line);

    if (open) {
      var body = u.el('div', { class: 't4-ledger pmx-scroll' });
      list.forEach(function (adv) {
        var row = u.el('div', { class: 't4-advice', data: { severity: adv.severity } });
        row.appendChild(u.el('span', { class: 't4-advice-kind', text: adv.severity === 'caution' ? 'Caution' : 'Note' }));
        row.appendChild(u.el('span', { class: 't4-advice-text', text: adv.text }));
        if (adv.evidenceRefs && adv.evidenceRefs.length) {
          row.appendChild(u.el('span', { class: 't4-advice-ev', text: adv.evidenceRefs.join(', ') }));
        }
        /* Dismiss is the only verb. Advice is read-only: there is no API to apply it and there must
         * not be one - an advisor that can write is not an advisor. */
        var dis = u.el('button', { class: 't4-act', type: 'button', text: 'Dismiss' });
        self._on(dis, 'click', function () { bsd.dismiss(self.tid(), adv.id); });
        row.appendChild(dis);
        body.appendChild(row);
      });
      wrap.appendChild(body);
    }

    host.appendChild(wrap);
  };

  /* ---------------------------------------------------------------- artifact handoff card */

  T4Thread.prototype._renderHandoff = function (host) {
    var self = this;
    var u = U();
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

    /* Compact, and connected to the work: it sits directly under the work digest it came out of, in the
     * same register - one line plus a control, no card chrome, because this concept has none. */
    var card = u.el('div', { class: 't4-handoff', data: { state: state } });
    card.appendChild(u.el('span', { class: 't4-work-kind', text: 'Artifact' }));
    card.appendChild(u.el('span', { class: 't4-handoff-title', text: ref.title }));

    var stateEl = u.el('span', { class: 't4-handoff-state' });
    var label = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, label);
    else stateEl.textContent = label;
    card.appendChild(stateEl);

    var worked = this._handoffWorkedSeconds();
    if (worked != null) card.appendChild(u.el('span', { class: 't4-handoff-worked', text: 'Worked for ' + F().duration(worked) }));

    var open = u.el('button', { class: 't4-act t4-handoff-open', type: 'button', text: 'Open' });
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

  T4Thread.prototype._handoffWorkedSeconds = function () {
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

  T4Thread.prototype.goalDetail = function (host, goal) {
    var self = this;
    var u = U();
    host.appendChild(u.el('div', { class: 't4-sheet-title', text: goal.title || 'Goal' }));
    host.appendChild(u.el('p', { class: 't4-sheet-p', text: goal.objective || '' }));
    if (goal.status === 'blocked' && goal.blocker) {
      var b = goal.blocker;
      [['Cause', b.cause], ['Affected', b.affectedScope], ['Tried', b.lastAttemptedRecovery],
       ['Stopped because', b.whyRecoveryStopped], ['Next safe action', b.nextSafeAction]]
        .forEach(function (r) {
          if (!r[1]) return;
          host.appendChild(u.el('div', { class: 't4-sheet-row' }, [
            u.el('span', { class: 't4-sheet-k', text: r[0] }),
            u.el('span', { class: 't4-sheet-v', text: r[1] })
          ]));
        });
    }
    var acts = u.el('div', { class: 't4-sheet-acts' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (a) {
      if (!self.ctx.services.surfaces.canAct(goal, a)) return;
      var btn = u.el('button', { class: 't4-act', text: a.charAt(0).toUpperCase() + a.slice(1) });
      u.on(btn, 'click', function () { self.ctx.services.surfaces.act(self.tid(), a); });
      acts.appendChild(btn);
    });
    host.appendChild(acts);
  };

  T4Thread.prototype.todoDetail = function (host, todo) {
    var u = U();
    host.appendChild(u.el('div', { class: 't4-sheet-title', text: 'Tasks' }));
    var list = u.el('div', { class: 't4-sheet-list pmx-scroll' });
    (todo.items || []).forEach(function (it) {
      list.appendChild(u.el('div', { class: 't4-sheet-row' }, [
        u.el('span', { class: 't4-sheet-k', text: F().label(it.state) }),
        u.el('span', { class: 't4-sheet-v', text: it.label })
      ]));
    });
    host.appendChild(list);
  };

  T4Thread.prototype.agentDetail = function (host, group) {
    var u = U();
    host.appendChild(u.el('div', { class: 't4-sheet-title', text: group.label || 'Agents' }));
    var list = u.el('div', { class: 't4-sheet-list pmx-scroll' });
    (group.agents || []).forEach(function (a) {
      list.appendChild(u.el('div', { class: 't4-agent' }, [
        u.el('span', { class: 't4-agent-name', text: a.name }),
        u.el('span', { class: 't4-agent-task', text: a.task }),
        u.el('span', { class: 't4-agent-act', text: a.currentActivity || '' }),
        u.el('span', { class: 't4-sheet-k', text: F().label(a.status) }),
        u.el('span', { class: 't4-agent-dur', text: a.workedSeconds != null ? F().duration(a.workedSeconds) : '' })
      ]));
    });
    host.appendChild(list);
  };

  T4Thread.prototype.diffDetail = function (host, group) {
    var self = this;
    var u = U();
    host.appendChild(u.el('div', { class: 't4-sheet-title', text: group.label || 'Changes' }));
    var list = u.el('div', { class: 't4-sheet-list pmx-scroll' });
    (group.files || []).forEach(function (f) {
      var row = u.el('button', { class: 't4-file' }, [
        u.el('span', { class: 't4-file-path', text: f.path }),
        u.el('span', { class: 't4-sheet-k', text: F().label(f.status) }),
        u.el('span', { class: 't4-file-n', text: '+' + f.added + ' -' + f.removed })
      ]);
      u.on(row, 'click', function () {
        self.ctx.services.editorHost.openArtifact(
          { id: 'file-' + f.path, title: f.path, kind: 'file', projectPath: f.path }, self.ctx);
      });
      list.appendChild(row);
    });
    if (group.hiddenFileCount) {
      list.appendChild(u.el('div', { class: 't4-sheet-k', text: group.hiddenFileCount + ' more files' }));
    }
    host.appendChild(list);
  };

  /* ---------------------------------------------------------------- questionnaire */

  /* ---------------------------------------------------------------- question: the digest that unfolds
   *
   * This concept renders every turn as a 2-3 line digest that opens to full and re-condenses. A
   * questionnaire is therefore not a card dropped into the transcript - it is ONE MORE DIGEST ENTRY,
   * with the same `data-open` mechanism and the same open/close affordance as every other entry.
   *
   * That has a consequence worth stating: the progress indicator lives INSIDE the digest line while
   * open (`2/3`), and when the flow resolves the entry re-condenses carrying its own answer, so the
   * transcript keeps reading as a list of digests rather than growing a foreign surface.
   *
   * Skip writes `— skipped` into the line. Cancel closes the entry and marks it `Cancelled`. Neither
   * removes it: a digest concept whose digest disappears has lost the record of what happened.
   */
  /* THE ENTRY SURVIVES EVERY PAGE.
   *
   * `reference/videos/02_stable_paged_questionnaire.mov` is a REVIEWABLE questionnaire: one card
   * stands still while the questions page through it, and paging BACK shows the answer already there
   * without replaying the arrival. Both halves of that need an element that outlives the page.
   *
   * This used to empty the host and build a new entry per render, which made two things impossible
   * rather than merely unpolished. A card that is rebuilt has no size to change FROM, so the resize
   * had to be faked by measuring the outgoing element and springing the incoming one from that number
   * — two surfaces pretending to be one. And "have I shown this question before" had nowhere to live,
   * so stepping backwards animated exactly like stepping forwards, which tells the reader they have
   * moved on when they have gone back.
   *
   * So the entry is created once and only its CONTENTS are rebuilt, inside the resize bounce. Its two
   * parts are kept as well: one render of a page change reaches this concept as TWO passes — the store
   * announces the answer and the click handler renders again — and a beat played on a part that the
   * second pass replaces is a beat nobody sees. */
  T4Thread.prototype._questionCardFor = function (host) {
    if (this._qcard && this._qcard.parentNode === host) return this._qcard;
    var u = U();
    /* `pmx-resize-up` is the bottom anchor PMConcept7's model picker uses (`top: auto`, "height
     * changes shrink the top edge, not the spawn edge"). The question host sits directly above the
     * composer in every window that offers one, and inline it is the last thing in the thread, so the
     * card growing must move its own top edge rather than shove the transcript. Where the host is not
     * a column with room to spare the class simply does nothing, which is the honest outcome: an
     * anchor is layout, and the layout belongs to the window. */
    this._qcard = u.el('div', { class: 't4-qdigest pmx-resize-up', data: { open: '1' } });
    this._qline = u.el('div', { class: 't4-qdigest-line' });
    this._qbody = u.el('div', { class: 't4-qdigest-body' });
    this._qcard.appendChild(this._qline);
    this._qcard.appendChild(this._qbody);
    /* Pinned SHUT at birth, so the arrival has somewhere to open from. `collapseTo(el, true)` on an
     * element already standing at its natural height animates from auto to auto and does nothing at
     * all — an entrance that exists in the code and not on the screen, which is the same failure as a
     * measured height that no one reads. _unfoldQuestion owns the release, on both paths. */
    this._qcard.style.height = '0px';
    this._qcard.style.overflow = 'hidden';
    host.appendChild(this._qcard);
    return this._qcard;
  };

  T4Thread.prototype._dropQuestionCard = function (host) {
    if (this._qcard && this._qcard.parentNode) this._qcard.parentNode.removeChild(this._qcard);
    this._qcard = null;
    this._qline = null;
    this._qbody = null;
    this._qOptionCount = null;
    /* The visit memory died with the element, so the flow it belonged to has to be forgotten too or
     * the next run of the same flow would be compared against a card that no longer exists. */
    this._qflowId = null;
    if (host) U().empty(host);
  };

  /* How many options the page being rendered offers. A freeform question offers none, and the
   * receipt none either — both are honest zeroes rather than absences, because what the bounce needs
   * to know is whether the number CHANGED. */
  T4Thread.prototype._questionOptionCount = function (flow) {
    if (!flow || !flow.record || !flow.question || flow.atEnd) return 0;
    return (flow.question.options || []).length;
  };

  T4Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard. Claiming the work surfaces notifies the store, which re-enters update() and
     * therefore this function mid-render: the inner pass fills the entry and the outer pass fills it
     * again from a flow it read before the claim. */
    if (this._inRenderQuestion) return;

    var self = this;
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;
    /* Nothing live and nothing resolved: there is no entry to keep. */
    if (!flow || (!flow.record && !flow.receipt)) { this._dropQuestionCard(host); return; }

    var R = global.PMXReveal;
    var key = R ? R.keyFor(svc, this.tid()) : '';
    var prevKey = this._qkey || '';
    this._qkey = key;

    /* Measured BEFORE the mutation, because after it the previous page is gone. An option count that
     * changes is a change of SHAPE rather than of size, which is the case the reference's firmer
     * bounce exists for. */
    var count = this._questionOptionCount(flow);
    var countChanged = this._qOptionCount != null && this._qOptionCount !== count;
    this._qOptionCount = count;

    var born = !this._qcard || this._qcard.parentNode !== host;
    var card = this._questionCardFor(host);
    var mo = svc.motion;

    /* A genuinely NEW questionnaire in a card that survived the last one forgets what the old one
     * showed. The ids of a demo flow repeat, so without this the second run would find every key
     * already stamped and arrive in silence - the exact opposite of the failure firstVisit exists to
     * prevent, reached from the other side. */
    var flowId = flow.record ? flow.id : null;
    if (flowId) {
      if (this._qflowId && this._qflowId !== flowId && mo && mo.forgetVisits) mo.forgetVisits(card);
      this._qflowId = flowId;
    }

    function fill() { self._renderQuestionBody(card, flow); }

    this._inRenderQuestion = true;
    try {
      if (born || !mo || !mo.resizeBounce) {
        /* A card that did not exist a moment ago did not change size, it arrived. The entrance below
         * is what states an arrival, and it owns the height it was born pinned to. */
        fill();
      } else {
        /* The handle is kept for one reason: if the reader turns reduced motion ON mid-flight, the
         * pinned height has to be landed rather than left behind. See _settleMotion. */
        this._trackBounce(mo.resizeBounce(card, fill, {
          bounceClass: countChanged ? 'pmx-size-bounce-strong' : 'pmx-size-bounce'
        }));
      }
    } finally { this._inRenderQuestion = false; }

    this._unfoldQuestion(card, key, prevKey, born, !!flow.record);
  };

  /* This concept's OWN choreography, and deliberately the quietest of the eight: it reuses the digest
   * unfold and adds no new motion vocabulary. The shared `afterRender` that used to live here sprang a
   * height for all eight concepts identically - which on a digest read as a panel inflating, in a
   * register whose entire premise is that entries open and close the same restrained way.
   *
   * The height is now resizeBounce's alone. `springHeight` used to run here for the advance and is
   * gone: two owners of one height is one of them losing, and which one won depended on the order two
   * transitions happened to be committed in. */
  T4Thread.prototype._unfoldQuestion = function (card, key, prevKey, born, live) {
    var R = global.PMXReveal;
    var mo = this.ctx.services.motion;
    if (!R || !mo || !card) return;

    /* THE GUARD, and the whole of behaviour 15: a beat plays for a question this card has never shown,
     * and for no other reason. Paging back to question 1 finds its key already stamped on the element,
     * so the answer is simply there — which is what the reference does at the moment the reader steps
     * backwards. The visit is recorded whether or not it is animated, so turning reduced motion off
     * later does not make an old question replay its arrival. */
    var first = mo.firstVisit ? mo.firstVisit(card, key) : true;
    var play = first && live && !R.reduced(card);

    if (born) {
      /* ENTRANCE: a real zero-to-natural travel, driven by the same primitive that owns every other
       * height in this entry. The mutate is the RELEASE of the pin the card was created with, so
       * resizeBounce measures a start of nothing and an end of the whole entry.
       *
       * `collapseTo` is not used and the reason is worth stating, because it was: it would be a second
       * owner of this height, and the render immediately after this one hands the height to the bounce
       * anyway — two transitions on one property where the winner depends on the order they were
       * committed in. It is also inert on the path it was written for, since an element already
       * standing at its natural height asked to open animates from auto to auto.
       *
       * Whoever does not animate still owes the release, or the card stays at the zero height it was
       * born with. */
      var shut = function () { card.style.height = ''; card.style.overflow = ''; };
      if (play && mo.resizeBounce) this._trackBounce(mo.resizeBounce(card, shut, { bounceClass: 'pmx-size-bounce' }));
      else shut();
      if (play) this._pageBeat();
      return;
    }

    /* Same question, one more keystroke: silence. A freeform answer re-renders per character because
     * typing writes a draft and the draft notifies the store. */
    if (prevKey === key || !play) return;

    /* A NEW PAGE in a card that is standing still. The bounce already states the change of size, so
     * this states only that the content is new. */
    this._pageBeat();
  };

  /* The unfold, on the BODY rather than the card: the card's height and its scale beat both belong to
   * resizeBounce, and a second transform on the same box would fight it for the same 340ms.
   * `pmx-t4-expand` is this concept's own unfold, the one every digest entry and every run detail
   * already uses. A folded question has no body to speak of, so the line takes the beat instead. */
  T4Thread.prototype._pageBeat = function () {
    var R = global.PMXReveal;
    var target = (this._qbody && this._qbody.firstChild) ? this._qbody : this._qline;
    if (R && target) R.oneShot(target, 't4-qdigest-page', 320);
  };

  /* Fills the entry. The card, its line and its body are the caller's and are the same three elements
   * they were on the previous page; what is rebuilt is what they SAY. */
  T4Thread.prototype._renderQuestionBody = function (entry, flow) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    if (!entry || !flow) return;
    var line = this._qline;
    var body = this._qbody;
    U().empty(line);
    U().empty(body);
    entry.classList.remove('t4-qdigest-done');
    entry.removeAttribute('data-status');

    if (!flow.record) {
      /* Resolved. The entry re-condenses carrying its answer - it does not vanish, and it is not
       * replaced either: the card the reader answered IS the card that now holds the receipt. */
      entry.removeAttribute('data-phase');
      this._renderQuestionReceipt(entry, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    var open = this._questionOpen !== false; // an active question opens by default; the user may fold it
    entry.setAttribute('data-open', open ? '1' : '0');
    entry.setAttribute('data-phase', flow.status);

    /* ---- the digest line. `2/3` lives HERE, inside the line, per the matrix. */
    line.appendChild(u.el('span', { class: 't4-work-kind', text: 'Question' }));

    var summary = u.el('span', { class: 't4-qdigest-text' });
    var q = flow.question;
    if (flow.status === 'preparing') {
      summary.textContent = 'Preparing questions';
    } else if (flow.status === 'submitting') {
      summary.textContent = 'Submitting answers';
    } else if (flow.atEnd) {
      summary.textContent = 'Every question visited';
    } else {
      /* Two-to-three lines of digest: the prompt, clamped by CSS, never re-worded here. */
      summary.textContent = q ? q.prompt : '';
    }
    line.appendChild(summary);

    if (flow.status !== 'preparing' && flow.total) {
      /* Progress INSIDE the digest line, and only while open - the matrix is explicit, and a closed
       * digest that carries a live counter would be claiming to be open. */
      if (open) line.appendChild(u.el('span', { class: 't4-qdigest-count', text: flow.position + '/' + flow.total }));
    }

    var fold = u.el('button', {
      class: 't4-work-chevron', type: 'button',
      text: open ? '\u2212' : '+', aria: { label: open ? 'Fold the question' : 'Unfold the question', expanded: open ? 'true' : 'false' }
    });
    this._on(fold, 'click', function () {
      self._questionOpen = !open;
      self.renderQuestion();
    });
    line.appendChild(fold);

    /* ---- the unfolded body. It stays EMPTY rather than absent when the entry is folded or mid-phase:
     * the element is the one the page beat is played on, and CSS drops an empty one out of the layout
     * so nothing is spent on a body with nothing in it. */
    if (!open || flow.status === 'preparing' || flow.status === 'submitting') return;

    if (q && !flow.atEnd) {
      if (q.options && q.options.length) {
        var opts = u.el('div', { class: 't4-qopts' });
        q.options.forEach(function (opt) {
          var sel = (q.selected || []).indexOf(opt) >= 0;
          var b = u.el('button', { class: 't4-qopt', type: 'button', text: opt, aria: { pressed: sel ? 'true' : 'false' } });
          self._on(b, 'click', function (ev) {
            if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
            svc.qflow.act(svc, self.tid(), 'answer', opt);
            self.renderQuestion();
          });
          opts.appendChild(b);
        });
        body.appendChild(opts);
      } else {
        var ta = u.el('textarea', { class: 't4-qfree pmx-scroll', aria: { label: q.prompt } });
        ta.setAttribute('spellcheck', 'false');
        ta.value = q.draft || '';
        this._on(ta, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', ta.value); });
        body.appendChild(ta);
      }
    }

    /* The refusal renders at the field. `_pendingReason` carries a submit refusal across the single
     * render it takes to travel to the offending question, then is consumed. */
    var reason = u.el('p', { class: 't4-qreason', data: { show: this._pendingReason ? '1' : '0' } });
    if (this._pendingReason) { reason.textContent = this._pendingReason; this._pendingReason = null; }
    body.appendChild(reason);

    /* ---- actions */
    var acts = u.el('div', { class: 't4-qacts' });

    function refuse(res, fallback) {
      var text = res.reason || fallback;
      reason.textContent = text;
      reason.setAttribute('data-show', '1');
      if (global.PMXReveal) global.PMXReveal.reject(reason);
      /* If the refusal belongs to a DIFFERENT question, carry it across the travel. */
      if (res.offenderIndex != null && res.offenderIndex !== flow.index) {
        self._pendingReason = text;
        self.renderQuestion();
      }
    }

    if (flow.index > 0) {
      var back = u.el('button', { class: 't4-act', type: 'button', text: 'Back' });
      this._on(back, 'click', function () { svc.qflow.act(svc, self.tid(), 'prev'); self.renderQuestion(); });
      acts.appendChild(back);
    }

    if (q && !flow.atEnd) {
      var skip = u.el('button', { class: 't4-act', type: 'button', text: 'Skip' });
      this._on(skip, 'click', function () {
        svc.qflow.act(svc, self.tid(), 'skip');
        self.renderQuestion();
      });
      acts.appendChild(skip);
    }

    if (q && flow.isSkipped(q)) {
      var un = u.el('button', { class: 't4-act', type: 'button', text: 'Unskip' });
      this._on(un, 'click', function () { svc.qflow.act(svc, self.tid(), 'unskip', flow.index); self.renderQuestion(); });
      acts.appendChild(un);
    }

    var primary = u.el('button', { class: 't4-act t4-act-primary', type: 'button', text: flow.atEnd ? 'Submit' : 'Next' });
    this._on(primary, 'click', function () {
      var res = svc.qflow.act(svc, self.tid(), flow.atEnd ? 'submit' : 'next');
      if (!res.ok) { refuse(res, 'Answer the required questions first.'); return; }
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(primary);

    var cancel = u.el('button', { class: 't4-act', type: 'button', text: 'Cancel' });
    this._on(cancel, 'click', function () {
      svc.qflow.act(svc, self.tid(), 'cancel');
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(cancel);

    body.appendChild(acts);

    /* The skipped trail. `— skipped` is written into the digest for each skipped question, which is what
     * makes a skip visible after you have moved past it. */
    var trail = [];
    flow.questions.forEach(function (question, i) {
      if (!flow.isSkipped(question)) return;
      trail.push({ i: i, prompt: question.prompt });
    });
    if (trail.length) {
      var trailEl = u.el('div', { class: 't4-qtrail' });
      trail.forEach(function (t) {
        var row = u.el('div', { class: 't4-qtrail-row' });
        row.appendChild(u.el('span', { class: 't4-qtrail-text', text: t.prompt }));
        row.appendChild(u.el('span', { class: 't4-qtrail-mark', text: '\u2014 skipped' }));
        var back2 = u.el('button', { class: 't4-qtrail-back', type: 'button', text: 'Unskip' });
        self._on(back2, 'click', function () { svc.qflow.act(svc, self.tid(), 'unskip', t.i); self.renderQuestion(); });
        row.appendChild(back2);
        trailEl.appendChild(row);
      });
      body.appendChild(trailEl);
    }
  };

  /* The re-condensed entry. Submitted carries the answer count; cancelled is marked `Cancelled`.
   *
   * It is written INTO the card that asked the questions rather than appended beside it, which is what
   * makes the resize a re-condensation the reader can watch: the same box, holding less. */
  T4Thread.prototype._renderQuestionReceipt = function (entry, receipt) {
    var self = this;
    var u = U();
    if (!receipt) return;

    entry.classList.add('t4-qdigest-done');
    entry.setAttribute('data-open', '0');
    entry.setAttribute('data-status', receipt.status);
    var line = this._qline;
    line.appendChild(u.el('span', { class: 't4-work-kind', text: 'Question' }));

    var text = receipt.cancelled
      ? 'Cancelled'
      : (receipt.answered + ' answered' + (receipt.skipped ? ', ' + receipt.skipped + ' skipped' : ''));
    line.appendChild(u.el('span', { class: 't4-qdigest-text', text: text }));

    var show = u.el('button', { class: 't4-work-chevron', type: 'button', text: '+', aria: { label: 'Show the answers' } });
    this._on(show, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 320,
        build: function (h) {
          h.appendChild(u.el('div', { class: 't4-sheet-title', text: receipt.cancelled ? 'Cancelled questions' : 'Answers' }));
          (receipt.questions || []).forEach(function (question) {
            var val = receipt.answers[question.id];
            var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't4-sheet-row' }, [
              u.el('span', { class: 't4-sheet-k', text: wasSkipped ? 'skipped' : 'answered' }),
              u.el('span', { class: 't4-sheet-v', text: question.prompt + (val == null ? '' : ' \u2014 ' + [].concat(val).join(', ')) })
            ]));
          });
        }
      });
    });
    line.appendChild(show);
  };

    T4Thread.prototype.syncLive = function () {
    var u = U();
    var status = this.ctx.services.runtime.liveStatus(this.tid());
    if (!status) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null;
      return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't4-live pmx-live' }, [
        u.el('span', { class: 't4-live-dot pmx-pulse' }),
        u.el('span', { class: 't4-live-text' }),
        u.el('span', { class: 't4-live-time' })
      ]);
      this.list.appendChild(this.liveEl);
    }
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t4-live-text'), status.text || '');
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t4-live-time'),
      status.workedSeconds != null ? F().duration(status.workedSeconds) : '');
  };

  /* ---------------------------------------------------------------- API */

  T4Thread.prototype.setExpanded = function (msgId, on) {
    var self = this;
    var rec = this.rendered[msgId];
    this.ctx.store.view(this.tid()).expanded[msgId] = !!on;
    if (!rec) return;
    this.scrollCtl.preserveAcross(rec.el, function () {
      rec.el.setAttribute('data-open', on ? '1' : '0');
      var t = rec.el.querySelector('.t4-toggle');
      if (t) t.textContent = on ? 'Condense' : 'Open turn';
      self.ctx.services.motion.snapToEnd(rec.el);
    });
  };

  T4Thread.prototype.revealHidden = function (msgId) { this.setExpanded(msgId, true); };

  T4Thread.prototype.scrollToMessage = function (id, opts) {
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
    /* A digest hides the match by definition, so a jump always opens its target. */
    this.setExpanded(id, true);
    this.scrollCtl.jumpTo(id, opts || { highlight: true });
    return true;
  };

  T4Thread.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T4Thread.prototype.setAnchor = function (t) { return this.scrollCtl.restoreAnchor(t); };

  T4Thread.prototype.update = function (state, changed) {
    var full = false, soft = false;
    for (var i = 0; i < changed.length; i++) {
      var k = changed[i];
      if (k === 'session.activeThreadId' || k === 'view.lens' || k === 'view.messages') full = true;
      else if (k.indexOf('view') === 0) soft = true;
    }
    if (state.session.activeThreadId !== this.lastThreadId) full = true;
    if (full) { this.renderThread(); return; }
    if (soft) { this.renderSurfaces(); this.renderQuestion(); }
  };

  T4Thread.prototype.destroy = function () {
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
    [this.root, this.inlineSurfaces, this.inlineQuestion].forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    this.rendered = {};
    /* The append-only path keys off these. A destroyed instance that left them behind would let the
     * next render mistake a fresh mount for an append and skip building the entries already on
     * screen. */
    this._renderedIds = null;
    this._renderedFrom = null;
  };

  global.PMX.thread.register('t4', {
    name: 'Digest',
    blurb: 'Every completed turn condenses to a two or three line digest and only the newest two stay open, so a very long thread reads as a scannable list rather than an endless scroll.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T4Thread(regionEl, ctx);
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
