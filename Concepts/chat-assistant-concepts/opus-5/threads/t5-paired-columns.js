/* t5 "Paired Columns" — Opus 5
 *
 * The width-adaptive extreme. Above roughly 900px the user's turns occupy a narrow left
 * column and the assistant's a wide right column, so the eye tracks two lanes and scanning
 * who-said-what is trivial. Below that it degrades to a single column with a compact role tag.
 *
 * This concept exists to test whether a genuinely different wide-width layout can degrade
 * cleanly, so the transition must leave no orphaned column and no horizontal scroll at any
 * point in the range. The switch is a container query, never a JS width read, because the
 * same concept renders at eight different sizes in one document on a contact sheet.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }
  var ELIGIBLE = 850;

  function T5(host, ctx) {
    this.host = host; this.ctx = ctx; this.offs = []; this.rendered = {}; this.lastTid = null;
    this.build();
  }
  T5.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };
  T5.prototype.tid = function () { return this.ctx.store.get('session.activeThreadId'); };

  T5.prototype.build = function () {
    var self = this, u = U();
    this.root = u.el('div', { class: 't5-root' });
    this.root.appendChild(u.el('div', { class: 't5-head' }, [
      u.el('span', { class: 't5-head-name', text: 'Paired Columns' }),
      u.el('span', { class: 't5-head-model', text: this.ctx.label })
    ]));
    this.scroller = u.el('div', { class: 't5-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't5-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    this.inlineSurfaces = u.el('div', { class: 't5-inline-surfaces' });
    this.inlineQuestion = u.el('div', { class: 't5-inline-question' });
    if (!this.ctx.capabilities.workSurfaceHost) this.root.appendChild(this.inlineSurfaces);
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);
    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t5-turn', messageAttr: 'data-pmx-msg'
    });
    this._tickOff = this.ctx.services.runtime.onTick(function () { self.syncLive(); });
    /* Artifact state lives outside the store - the service keeps its own subscribers - so its ticks
     * arrive here and nowhere else. Without this the handoff card says `compiling` forever. */
    if (this.ctx.services.artifacts && this.ctx.services.artifacts.subscribe && !this._artOff) {
      this._artOff = this.ctx.services.artifacts.subscribe(function () {
        if (self._handoffHost) self._renderHandoff(self._handoffHost);
      });
    }
    this.renderThread();
  };

  T5.prototype.renderThread = function () {
    var tid = this.tid(), u = U();
    var v = this.ctx.store.view(tid);
    var msgs = this.ctx.data.visibleSlice(tid, v.loadedFrom);

    /* 01_message_arrival_spatial_continuity.mov, frames 47 to 63 (about 280ms at 57.6fps): the new
     * message enters as a flattened sliver at a seam and expands into its box, while everything
     * already on screen keeps its identity. Rebuilding both lanes cannot say that - every turn
     * settles again, so the one that actually arrived is indistinguishable from the twenty that did
     * not.
     *
     * So an append is an append. When the only difference is messages added at the END of the same
     * thread and the same loaded range, the existing turns are kept and the new ones are inserted
     * through motion.displace(); anything else is a genuine rebuild. */
    if (this._canAppendOnly(tid, v, msgs)) { this._appendTurns(msgs); return; }

    u.empty(this.list); this.rendered = {}; this.lastTid = tid;
/* The live status row lives IN the list, so emptying it detaches the node this reference
     * points at. Dropping the reference makes syncLive() below rebuild an attached one instead of
     * quietly updating an orphan, which is why the running indicator vanished after a rebuild. */
    this.liveEl = null;

    var t = this.ctx.data.threadById(tid);
    var hidden = t ? Math.max(0, t.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlder(hidden));
    for (var i = 0; i < msgs.length; i++) this.list.appendChild(this.buildTurn(msgs[i]));

    /* What the next render compares against to decide whether anything ARRIVED. */
    this._renderedIds = msgs.map(function (m) { return m.id; });
    this._renderedFrom = v.loadedFrom;

    this.renderSurfaces(); this.renderQuestion(); this.syncLive();
  };

  /* True only when this render differs from the last by messages APPENDED to the end. A changed
   * thread, a changed loaded range, a removal, or any edit to an existing turn all fail this and
   * fall back to the rebuild, because none of those is an arrival and animating a reflow as though
   * something had just been said would be a lie about what happened. */
  T5.prototype._canAppendOnly = function (tid, v, msgs) {
    if (!this._renderedIds || tid !== this.lastTid) return false;
    if (v.loadedFrom !== this._renderedFrom) return false;
    if (msgs.length <= this._renderedIds.length) return false;
    for (var i = 0; i < this._renderedIds.length; i++) {
      if (msgs[i].id !== this._renderedIds[i]) return false;
    }
    return true;
  };

  /* The running indicator spans both lanes at the foot of the list and is not a turn, so an
   * arriving turn is filed above it rather than after it. */
  T5.prototype._listTail = function () {
    return (this.liveEl && this.liveEl.parentNode === this.list) ? this.liveEl : null;
  };

  T5.prototype._appendTurns = function (msgs) {
    var self = this;
    var svc = this.ctx.services;
    var start = this._renderedIds.length;
    var tail = this._listTail();

    function insert() {
      var last = null;
      for (var i = start; i < msgs.length; i++) {
        last = self.buildTurn(msgs[i]);
        self.list.insertBefore(last, tail);
      }
      /* displace stamps the node this returns, so it names the turn that actually arrived - and
       * because the turn carries data-pmx-role, the seam it arrives from is its own lane's. */
      return last;
    }

    /* Measure, mutate, re-pin - in that order. A reader sitting at the bottom is carried with the
     * new turn; a reader who has scrolled up is left where they are, which is the whole reason
     * stickIfAtBottom measures BEFORE the mutation. */
    var run = function () {
      if (svc.motion && svc.motion.displace) svc.motion.displace(self.list, insert);
      else insert();
    };
    if (this.scrollCtl && this.scrollCtl.stickIfAtBottom) this.scrollCtl.stickIfAtBottom(run);
    else run();

    this._renderedIds = msgs.map(function (m) { return m.id; });

    this.renderSurfaces(); this.renderQuestion(); this.syncLive();
  };

  T5.prototype.buildOlder = function (hidden) {
    var self = this, u = U();
    var b = u.el('button', { class: 't5-older', text: 'Load ' + hidden.toLocaleString() + ' earlier messages' });
    this._on(b, 'click', function () {
      var tid = self.tid(), v = self.ctx.store.view(tid), t = self.ctx.data.threadById(tid);
      var cur = v.loadedFrom == null ? t.messages.length - t.initialVisibleMessageCount : v.loadedFrom;
      v.loadedFrom = Math.max(0, cur - 120);
      self.scrollCtl.preserveAcross(self.list, function () { self.renderThread(); });
    });
    return u.el('div', { class: 't5-older-wrap' }, [b]);
  };

  T5.prototype.buildTurn = function (msg) {
    var self = this, u = U(), svc = this.ctx.services;
    var lens = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;
    var turn = u.el('div', {
      class: 't5-turn pmx-msg',
      data: { pmxMsg: msg.id, pmxRole: msg.role, lens: lens || '' }
    });

    var body = u.el('div', { class: 't5-body pmx-msg-body' });
    /* The role tag is what carries identity once the two lanes collapse into one. */
    body.appendChild(u.el('span', { class: 't5-tag', text: msg.role === 'user' ? 'You' : 'Assistant' }));

    var prose = u.el('div', { class: 't5-prose' });
    String(msg.body || '').split(/\n{2,}/).forEach(function (p) {
      var s = p.replace(/\n/g, ' ').trim();
      if (s) prose.appendChild(u.el('p', { class: 't5-p', text: s }));
    });
    body.appendChild(prose);

    if ((msg.body || '').length >= ELIGIBLE) {
      var open = !!this.ctx.store.view(this.tid()).expanded[msg.id];
      body.setAttribute('data-collapsible', '1');
      body.setAttribute('data-expanded', open ? '1' : '0');
      var more = u.el('button', { class: 't5-more', text: open ? 'Show less' : 'Show more' });
      this._on(more, 'click', function () { self.setExpanded(msg.id, !self.isExpanded(msg.id)); });
      body.appendChild(more);
    }

    turn.appendChild(body);
    turn.appendChild(global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage()
    }));

    var strip = this.buildStrip(msg);
    if (strip) turn.appendChild(strip);

    this.rendered[msg.id] = { el: turn, bodyEl: body };
    return turn;
  };

  T5.prototype.buildStrip = function (msg) {
    var self = this, u = U(), svc = this.ctx.services, bits = [];
    var group = svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : msg.activityGroup;
    if (group) bits.push({ label: svc.surfaces.condenseLabel(group), kind: 'activity', group: group });
    if (msg.thoughtSegments && msg.thoughtSegments.length) {
      bits.push({ label: 'reasoning summary', kind: 'thought', segs: msg.thoughtSegments });
    }
    if (msg.completedQuestionnaire) bits.push({ label: 'question answered', kind: 'q', q: msg.completedQuestionnaire });
    if (!bits.length) return null;

    var strip = u.el('div', { class: 't5-strip' });
    bits.forEach(function (b, i) {
      if (i) strip.appendChild(u.el('span', { class: 't5-strip-sep', text: '·' }));
      var btn = u.el('button', { class: 't5-strip-btn', text: b.label });
      self._on(btn, 'click', function (ev) {
        svc.popup.open({
          anchorEl: ev.currentTarget, kind: 'panel', width: 310,
          build: function (host) { self.detail(host, b); }
        });
      });
      strip.appendChild(btn);
    });
    return strip;
  };

  T5.prototype.detail = function (host, b) {
    var u = U();
    host.appendChild(u.el('div', { class: 't5-sheet-title', text: b.label }));
    var list = u.el('div', { class: 't5-sheet-list pmx-scroll' });
    if (b.kind === 'activity') {
      this.ctx.services.surfaces.activityStages(b.group).forEach(function (st) {
        list.appendChild(u.el('div', { class: 't5-sheet-row' }, [
          u.el('span', { class: 't5-sheet-k', text: F().label(st.kind) }),
          u.el('span', { class: 't5-sheet-v', text: st.label || '' })
        ]));
      });
    } else if (b.kind === 'thought') {
      b.segs.forEach(function (s) {
        list.appendChild(u.el('div', { class: 't5-sheet-row' }, [
          u.el('span', { class: 't5-sheet-k', text: F().label(s.status) }),
          u.el('span', { class: 't5-sheet-v', text: s.summary || s.label || '' })
        ]));
      });
    } else {
      (b.q.questionsAndAnswers || []).forEach(function (qa) {
        list.appendChild(u.el('div', { class: 't5-sheet-row' }, [
          u.el('span', { class: 't5-sheet-k', text: qa.question }),
          u.el('span', { class: 't5-sheet-v', text: qa.answer })
        ]));
      });
    }
    host.appendChild(list);
    if (b.kind === 'thought') {
      host.appendChild(u.el('div', { class: 't5-sheet-foot', text: 'Provider-exposed summary only.' }));
    }
  };

  T5.prototype.lastMessage = function () { var m = this.ctx.data.messagesFor(this.tid()); return m[m.length - 1]; };

  /* ---------------------------------------------------------------- work: the third rail
   *
   * The matrix assigns this concept a THIRD WORK RAIL right of the assistant lane at 900px and up,
   * folding under the turn below that width, with each rail row opening its detail IN THE USER LANE.
   *
   * Two things make that different from every other concept's cluster, and both are deliberate:
   *
   *   1. The rail is a THIRD COLUMN, not a block inside a lane. The paired-columns grid grows from
   *      two tracks to three at 900px, so work sits beside the conversation rather than interrupting
   *      it. Below 900px the same rows fold under the turn, because a third column at 520px would be
   *      three unreadable measures.
   *   2. Detail opens in the USER LANE. Not a popup, not an inline expansion under the row - the lane
   *      that is otherwise the user's side of the dialogue becomes the reading surface for whatever the
   *      rail is asked about. That is only coherent in a concept that HAS lanes, which is exactly why
   *      it is this concept's assignment.
   *
   * What this replaces: five inert `<div class="t5-surface">` rows that could not be clicked and had no
   * detail to open. They looked like a work surface and did nothing.
   */
  T5.prototype.renderSurfaces = function () {
    var self = this, u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
    if (!host) return;
    u.empty(host);

    /* Ask the flow, not the yield flag: this runs BEFORE renderQuestion on every pass, so reading
     * `surfacesYielded` paints the rail for one frame before the dialogue takes the lanes. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    var a = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());
    var v = this.ctx.store.view(this.tid());
    var openKind = (v.surfaces && v.surfaces.expanded) || null;

    function each(val) { return val == null ? [] : (Object.prototype.toString.call(val) === '[object Array]' ? val : [val]); }

    var rows = [];

    if (a && a.goal) {
      var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(a.goal) : null;
      rows.push({
        kind: 'goal', label: 'Goal',
        text: phase ? ('Phase ' + phase.index + ' of ' + phase.total) : F().label(a.goal.status),
        status: F().label(a.goal.status),
        build: function (h) { self._detailGoal(h, a.goal); }
      });
    }

    if (a && a.todo) {
      var items = a.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
      var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
      rows.push({
        kind: 'todo', label: 'Todo',
        text: done + '/' + items.length + (blocked ? ' \u00b7 ' + blocked + ' blocked' : ''),
        build: function (h) { self._detailTodo(h, a.todo); }
      });
    }

    each(a && a.subagents).forEach(function (g, n) {
      rows.push({
        kind: 'agents' + (n || ''), label: 'Agents',
        text: (svc.surfaces.subagentSummary && svc.surfaces.subagentSummary(g)) || 'None active',
        build: function (h) { self._detailAgents(h, g); }
      });
    });

    /* Activity carries the six kinds the packet requires be visible. */
    var stages = (thread && thread.activityStages) || [];
    if (stages.length) {
      rows.push({
        kind: 'activity', label: 'Activity',
        text: stages.length + (stages.length === 1 ? ' step' : ' steps'),
        build: function (h) { self._detailStages(h, stages); }
      });
    }

    each(a && a.diffs).forEach(function (g, n) {
      var files = g.files || [];
      var add = 0, rem = 0;
      files.forEach(function (f) { add += f.added || 0; rem += f.removed || 0; });
      rows.push({
        kind: 'diff' + (n || ''), label: 'Changes',
        text: files.length + (files.length === 1 ? ' file' : ' files') + ' \u00b7 +' + add + ' \u2212' + rem,
        build: function (h) { self._detailDiff(h, g); }
      });
    });

    var verified = this._verificationRecord();
    if (verified) {
      rows.push({
        kind: 'verify', label: 'Verified',
        text: F().duration(verified.workedSeconds),
        build: function (h) {
          h.appendChild(u.el('p', { class: 't5-detail-p', text: verified.note }));
        }
      });
    }

    /* ---- the CONDENSED form: the matrix says the rail becomes a THREE-ROW summary block.
     * Three rows, not one: this concept has vertical room in a rail that a chip strip does not, and the
     * three facts a finished run leaves behind are what it did, what came out, and how long it took. */
    var group = a ? a.activity : null;
    var complete = !!(group && group.status === 'complete');
    var railRows = rows;
    if (complete && rows.length) {
      var arts = (thread && thread.artifacts) || [];
      railRows = [
        { kind: 'sum-work', label: 'Work', text: (svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : ((group.stages || []).length + ' steps')),
          build: function (h) { self._detailStages(h, (group.stages || [])); } },
        { kind: 'sum-out', label: 'Output', text: arts.length + (arts.length === 1 ? ' artifact' : ' artifacts'),
          build: function (h) { self._detailArtifacts(h, arts); } },
        { kind: 'sum-time', label: 'Elapsed', text: group.workedSeconds != null ? F().duration(group.workedSeconds) : '\u2014',
          build: function (h) { h.appendChild(u.el('p', { class: 't5-detail-p', text: 'Worked for ' + F().duration(group.workedSeconds || 0) + '.' })); } }
      ];
    }

    /* Activity, verification and advice are read straight off the thread rather than through
     * `activeFor`, so without this guard they survive the yield and leave a partial cluster beside the
     * question. The work surfaces yield as ONE thing or the yield means nothing. */
    /* ---- the operation ledger, appended to the same rail. These rows report what the run RAN rather
     * than what it is DOING, so they survive the condensed swap above: a finished run still has to
     * answer for every operation it performed. */
    var opRows = pendingQuestion ? [] : this._opRailRows();
    var allRows = railRows.concat(opRows);

    function swap(node, text) {
      /* In-place morph: a rail row that appended on every count tick would grow the rail past the
       * conversation beside it. */
      if (svc.motion && svc.motion.swapText) svc.motion.swapText(node, text);
      else node.textContent = text;
    }

    /* ---- the run capsule LEADS the cluster, in a grid row of its own.
     *
     * The run is what is happening now; the rail beneath it is what is true of the thread. The order
     * is mechanical as well as editorial: groupReopen carries the siblings AFTER the capsule, so
     * disclosing a phase pushes the rail, the advice note and the handoff card down as one block
     * instead of displacing them, which is the rule f.910 establishes.
     *
     * Three guards, because all three absences are real: the service may not be loaded, a thread may
     * carry no activity stages at all, and a run that has not started renders NOTHING. An empty frame
     * saying "no activity" would reserve space for work that never happened, which the work-surface
     * contract forbids. It yields to a pending question with everything else, because the work
     * surfaces yield as ONE thing or the yield means nothing. */
    var run = (!pendingQuestion && svc.runtrace && svc.runtrace.read) ? svc.runtrace.read(this.tid()) : null;
    if (run && run.started) host.appendChild(this._buildRunCapsule(run));

    if (allRows.length && !pendingQuestion) {
      var rail = u.el('div', { class: 't5-rail', data: { condensed: complete ? '1' : '0' } });
      allRows.forEach(function (r, idx) {
        /* One heading, exactly where the surfaces end and the operations begin. */
        if (r.op && (idx === 0 || !allRows[idx - 1].op)) {
          rail.appendChild(u.el('div', { class: 't5-rail-head', text: 'Operations' }));
        }

        var on = openKind === r.kind;
        var data = { kind: r.kind, open: on ? '1' : '0' };
        var countText = '';
        if (r.op) {
          /* Status is the ROW'S OWN STATE, not a badge beside its text: the compact form has room for a
           * headline and a count and nothing else. The statusLabel itself is printed in the detail, and
           * on the row's accessible name, so the compact form never withholds it. */
          data.op = '1';
          data.status = r.op.status;
          if (r.op.count != null) countText = r.op.count + (r.op.unit ? ' ' + r.op.unit : '');
        }

        var btn = u.el('button', {
          class: 't5-rail-row', type: 'button', data: data,
          aria: { expanded: on ? 'true' : 'false' }
        });

        if (r.op) {
          btn.setAttribute('aria-label', r.op.headline + ' \u2014 ' + r.op.statusLabel +
            (countText ? ' \u2014 ' + countText : ''));
          var headEl = u.el('span', { class: 't5-rail-op-head' });
          var cntEl = u.el('span', { class: 't5-rail-op-count' });
          /* The headline changes tense and the count grows on every tick; both morph rather than reflow. */
          swap(headEl, r.op.headline);
          swap(cntEl, countText);
          btn.appendChild(headEl);
          btn.appendChild(cntEl);
        } else {
          btn.appendChild(u.el('span', { class: 't5-rail-kind', text: r.label }));
          var textEl = u.el('span', { class: 't5-rail-text' });
          swap(textEl, r.text);
          btn.appendChild(textEl);
        }

        self._on(btn, 'click', function () {
          var vv = self.ctx.store.view(self.tid());
          vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
          vv.surfaces.expanded = (vv.surfaces.expanded === r.kind) ? null : r.kind;
          self.ctx.store.touchView('surfaces');
        });
        rail.appendChild(btn);

        /* ---- the detail, rendered into the USER LANE - the lane OPPOSITE the rail.
         * It is appended as the open row's NEXT SIBLING and pulled into column 1 by the same container
         * query that pairs the turns, so ONE element serves both layouts: the user lane at 900px and up,
         * and directly beneath its own row once the lanes have folded into a stepper and there is no
         * opposite lane left to borrow. */
        if (on) rail.appendChild(self._laneDetail(r));
      });
      host.appendChild(rail);
    }

    /* Advice is a NOTE IN THE USER LANE per the matrix, and the handoff sits under the rail; both get
     * their own hosts so an artifact tick repaints the card without rebuilding the rail. */
    this._bsdHost = u.el('div', { class: 't5-bsd-host' });
    this._handoffHost = u.el('div', { class: 't5-handoff-host' });
    host.appendChild(this._bsdHost);
    host.appendChild(this._handoffHost);
    this._renderBsdNote(this._bsdHost);
    this._renderHandoff(this._handoffHost);
  };

  T5.prototype._verificationRecord = function () {
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].verification) return msgs[i].verification;
    return null;
  };

  /* The cross-lane pane. ONE element, built once per open row: the layout decides whether it reads as
   * the user lane or as the step under its own rail row, and nothing here knows which. */
  T5.prototype._laneDetail = function (r) {
    var self = this, u = U();
    var pane = u.el('div', { class: 't5-lane-detail', data: { lane: 'user', kind: r.kind } });

    var head = u.el('div', { class: 't5-lane-detail-head' });
    head.appendChild(u.el('span', { class: 't5-rail-kind', text: r.label }));
    /* The compact row carries status as a state attribute; the pane is where the WORD is printed. */
    if (r.op) {
      head.appendChild(u.el('span', {
        class: 't5-op-status', data: { status: r.op.status }, text: r.op.statusLabel
      }));
    }
    var close = u.el('button', { class: 't5-lane-close', type: 'button', text: 'Close', aria: { label: 'Close this detail' } });
    this._on(close, 'click', function () {
      var vv = self.ctx.store.view(self.tid());
      if (vv.surfaces) vv.surfaces.expanded = null;
      self.ctx.store.touchView('surfaces');
    });
    head.appendChild(close);
    pane.appendChild(head);

    var bodyEl = u.el('div', { class: 't5-lane-detail-body pmx-scroll' });
    r.build(bodyEl);
    pane.appendChild(bodyEl);
    return pane;
  };

  /* ---------------------------------------------------------------- the run capsule
   *
   * t5's reading of `reference/videos/03_compact_execution_activity.mov`.
   *
   * Every other concept draws the run as one stack - chain, headline, rows, all in one column. This
   * concept has two lanes and a standing rule about what belongs in each, so the run is split along
   * that rule instead:
   *
   *   USER LANE       the INDEX: the summary line and the glyph chain. Both are controls, and the
   *                   user lane is already the side of the dialogue the reader acts on.
   *   ASSISTANT LANE  the RECORD: what the disclosed phase actually did. That lane is already what
   *                   was said and done, and it is the wide one, which is what a line like
   *                   `Edited shared/selectors.js +92 -18` needs to stay on one line.
   *
   * So clicking a glyph in one lane fills the OTHER, on the same grid row. That is the same move
   * `_laneDetail` makes for the work rail with the lanes swapped, and swapping them is the point: the
   * rail is a column of sentences, so it takes the wide lane and answers in the narrow one; the chain
   * is a row of glyphs, so it takes the narrow lane and answers in the wide one. Nothing else in the
   * set can do this, because nothing else has a lane on the far side of its work to answer in.
   *
   * Carried over as BEHAVIOUR, with the frames shared/runtrace.js cites for each:
   *   - one glyph per entered phase in entry order, each a real button that reopens THAT phase (the
   *     chain grows f.208 two, f.390 three, f.780 four, f.910 six; f.1170 and f.1300 are the reopens);
   *   - the count rewritten in place, digits only, at the same y (f.208 -> f.286 -> f.338);
   *   - the present participle while a phase runs and the past tense once it settles (f.194 against
   *     f.1300), with the verb at full contrast and its argument muted;
   *   - condensed is the RESTING state and not a deletion (f.910): the rail, the advice note and the
   *     handoff card live below the capsule and are pushed down when a phase is reopened;
   *   - the chain scrolls rather than truncating, because a glyph IS the route back to its phase and
   *     dropping one would silently make that phase unreachable.
   *
   * Deliberately NOT carried over: the reference's colours, radii, ring treatment and easing. State is
   * marked the way this concept already marks it - a rule under or beside the thing, dashed while
   * unsettled - never with a pill or a ring.
   *
   * WHY THIS IS THE REOPENABLE CLUSTER
   * ----------------------------------
   * The rail above swaps itself for a three-row summary as soon as `group.status === 'complete'`, and
   * nothing can put the rows back: the condensed form is DERIVED, so there is no state for a reader to
   * toggle and the work is gone for the rest of the session. Every disclosure here is read from
   * `store.view(tid).runTrace` instead - `condensed` for the whole run, `openId` for one phase - which
   * is a fact about what the READER has opened rather than about what the run finished. It survives a
   * remount, it is per phase, and every control that sets it can also unset it.
   */

  /* How long a line stays FRESH, in ms. See _runMorph: it is the window in which a rebuild re-issues
   * the count morph instead of writing the new text flat. One activity verb reaches this concept as
   * TWO renders - `surfaces.js` calls `PMXRunTrace.step()`, which announces `view.runtrace`, and then
   * touches `view.surfaces` itself, and the store notifies on each - so the window only has to outlast
   * a single tick. countMorph itself runs 220ms; a shorter window keeps a genuinely later render from
   * restarting an animation that is already most of the way through. */
  var RUN_MORPH_FRESH_MS = 180;

  /* Per-thread memo for the capsule. It holds what each line last SAID, which phase the assistant
   * lane last showed, and which phases the chain last painted. None of that is a fact about the run,
   * so none of it belongs in the store: it is a fact about the last paint of these elements, and it is
   * keyed by thread because a sentence from another thread is not a previous state of this one.
   *
   * `chainIds` is what makes the handover detectable in a concept that rebuilds its capsule every
   * render. With no surviving element to compare against, the only way to know that a phase is
   * ARRIVING rather than merely present is to remember what was on screen a pass ago. */
  T5.prototype._runMemo = function () {
    var tid = this.tid();
    if (!this._runMemoState || this._runMemoState.tid !== tid) {
      this._runMemoState = { tid: tid, text: {}, subjectId: null, chainIds: null };
    }
    return this._runMemoState;
  };

  /* countMorph, never swapText: `Reading 6 files` becoming `Reading 7 files` has to move the digit and
   * leave every word around it in the layout box it already had (f.208 -> f.286 -> f.338). Cross-fading
   * the whole label reads as the line being replaced, which is the difference between a running tally
   * and a series of different sentences. countMorph falls back to a label swap by itself when the words
   * changed too - the honest outcome, because at that point the sentence really did change.
   *
   * The memo is what makes the morph real. This concept empties and rebuilds its whole surface host on
   * every view change, so the span handed to countMorph is always brand new and empty; without a
   * remembered previous string it would take its entrance path every single tick and no digit would
   * ever move. Seeding the span with what the line said last is half of it, and the freshness window is
   * the other half - outside the window the text is written flat, because animating 7 into 7 on some
   * unrelated re-render would claim work that did not happen. */
  T5.prototype._runMorph = function (el, key, next, flat) {
    var motion = this.ctx.services.motion;
    var memo = this._runMemo();
    var slot = memo.text[key] || (memo.text[key] = { text: null, from: null, at: 0 });
    var now = Date.now();
    if (slot.text !== next) { slot.from = slot.text; slot.text = next; slot.at = now; }
    var from = slot.from;
    /* `flat` writes the new string outright while still keeping the memo current. Beat two of a
     * handover asks for it: seeding the span with the remembered previous sentence is what makes a
     * digit move within one phase, but across a handover that remembered sentence belongs to the
     * phase that just finished, so seeding it would REPRINT the outgoing line for a frame at the very
     * moment the new glyph arrives - the opposite of the order the two beats exist to state. */
    if (flat || from == null || from === next || (now - slot.at) > RUN_MORPH_FRESH_MS
        || !motion || !motion.countMorph) {
      el.textContent = next;
      return;
    }
    el.textContent = from;
    motion.countMorph(el, next);
  };

  T5.prototype._buildRunCapsule = function (run) {
    var self = this, u = U(), svc = this.ctx.services;
    var memo = this._runMemo();
    var open = run.open;
    /* While the run is live the running phase is its own disclosure, which is why the reference shows
     * rows under a running phase nobody asked to see. Once the run condenses, nothing is disclosed
     * until the reader opens a glyph. */
    var showReport = !!open || (!run.condensed && !!run.running);
    var subject = open || run.running || (run.chain.length ? run.chain[run.chain.length - 1] : null);

    /* The assistant lane cross-fades only when it has something DIFFERENT to say. The surface is
     * rebuilt on every view touch, so an unconditional entrance would flicker the pane on every count
     * tick; keying it to the disclosed phase makes it fire on a reopen and on a handover, which is
     * beat one of f.198-203, and stay silent while a count grows. */
    var subjectKey = (showReport && subject) ? subject.id : null;
    var laneChanged = memo.subjectId !== subjectKey;
    memo.subjectId = subjectKey;

    var cap = u.el('div', {
      class: 't5-run',
      data: {
        condensed: run.condensed ? '1' : '0',
        running: run.running ? '1' : '0',
        open: showReport ? '1' : '0'
      }
    });

    /* ---- the user lane: the index ------------------------------------------------------------- */

    var index = u.el('div', { class: 't5-run-index', data: { lane: 'user' } });

    var chain = u.el('div', { class: 't5-run-chain pmx-chain' });
    var openGlyph = null, runningGlyph = null;

    /* One glyph, built the same way whether it is painted with the rest of the chain or arrives a beat
     * later on a handover. Two builders would be two definitions of what a chain entry is, and the one
     * that runs less often is the one that would drift. */
    function glyphFor(p) {
      /* Every glyph sits in its own slot, which is the box phaseHandover opens from zero width when
       * one phase hands over to the next (f.205-209: the new glyph opens its slot and pushes the label
       * right by exactly one). Without the slot the chain has nothing to animate. */
      var slot = u.el('span', { class: 'pmx-chain-slot' });
      /* Disclosure, not "the phase the headline is about". The two differ once the run condenses, when
       * the headline speaks for the whole run and no single glyph is being read. */
      var isOpen = !!(open && open.id === p.id);
      var btn = u.el('button', {
        class: 't5-run-glyph', type: 'button',
        data: { kind: p.kind, state: p.running ? 'running' : 'done', open: isOpen ? '1' : '0' },
        aria: { expanded: isOpen ? 'true' : 'false', label: p.headline }
      });
      btn.title = p.headline;
      /* The glyph is what makes the chain an INDEX rather than a progress bar: a row of identical
       * marks could not tell a reader which one is the edit phase, so clicking one could not be the
       * random access f.1170 demonstrates. */
      if (svc.icons) btn.appendChild(svc.icons.get(p.glyph, 12));
      self._on(btn, 'click', function () { self._openRunPhase(cap, p.id); });
      if (isOpen) openGlyph = btn;
      if (p.running) runningGlyph = btn;
      slot.appendChild(btn);
      chain.appendChild(slot);
      return btn;
    }

    /* THE HANDOVER, and its order (f.194-211).
     *
     * The reference is explicit that the outgoing sentence lets go FIRST - at f.198-200 the label and
     * the reasoning text fade out while the old glyph stays - and only at f.205-209 does the new glyph
     * appear and push the label. The lateral push is the part this concept cannot copy: the chain sits
     * ABOVE the line rather than beside it, for the reason stated in `t5-paired-columns.css:608-612`,
     * and that CSS is still correct. What is copied is the CAUSAL ORDER, which is the part that
     * carries the meaning: the phase that finished lets go of the sentence, and the phase that took
     * over then arrives to claim it. A single frame that swapped both at once would read as the run
     * being replaced, and would lose the fact that the finished phase survives as an index entry.
     *
     * A handover is one specific event: the chain gained EXACTLY ONE entry on the end since the last
     * paint and the line is now speaking for it. A reader reopening an old phase, a finished run
     * painting all its glyphs at once, and a reset that starts a new run all fail that test - and each
     * of them animated as a handover would claim a transfer of work that did not happen. The
     * one-entry check is what covers the reset: the memo outlives the run it described, so a shorter
     * chain than the one remembered means this is a different run and not the next phase of that one. */
    var lastPhase = run.chain.length ? run.chain[run.chain.length - 1] : null;
    var painted = memo.chainIds;
    var arriving = (lastPhase && painted && painted.length === run.chain.length - 1
      && painted.indexOf(lastPhase.id) < 0
      && subject && subject.id === lastPhase.id && !run.condensed) ? lastPhase : null;

    memo.chainIds = [];
    run.chain.forEach(function (p) { memo.chainIds.push(p.id); });

    run.chain.forEach(function (p) {
      if (arriving && arriving.id === p.id) return;   /* inserted on beat two, below */
      glyphFor(p);
    });
    index.appendChild(chain);

    /* One line, rewritten in place, never appended to. Condensed with nothing open it speaks for the
     * whole run (`13 tools used` at f.910) and states the elapsed time beside it; otherwise it speaks
     * for the phase in hand. Verb and argument morph separately so the tense flip lands on the verb
     * alone and the argument beside it never twitches. */
    var head = u.el('button', {
      class: 't5-run-head', type: 'button',
      aria: { expanded: showReport ? 'true' : 'false' }
    });
    var verbEl = u.el('span', { class: 't5-run-verb' });
    var argEl = u.el('span', { class: 't5-run-arg' });
    var resting = run.condensed && !open;
    var verbText = resting ? run.summaryLabel : (subject ? subject.verb : '');
    var argText = resting
      ? (run.workedSeconds ? F().duration(run.workedSeconds) : '')
      : (subject ? subject.argument : '');

    /* On a handover both halves stay EMPTY on beat one: that IS the outgoing sentence letting go, and
     * writing the new one here would collapse the two beats into a single swap. `writeHeadLine` is
     * called on beat two, beside the arriving glyph, and writes flat there - see `_runMorph`. */
    function writeHeadLine(flat) {
      self._runMorph(verbEl, 'verb', verbText, flat);
      self._runMorph(argEl, 'arg', argText, flat);
    }
    if (!arriving) writeHeadLine(false);
    head.appendChild(verbEl);
    head.appendChild(argEl);

    /* One control, three meanings, in the order a reader means them: dismiss what is open, disclose a
     * condensed run at its most recent phase, condense a live one. */
    this._on(head, 'click', function () {
      if (!svc.runtrace) return;
      if (open) { svc.runtrace.close(self.tid()); return; }
      if (run.condensed) { self._openRunPhase(cap, null); return; }
      svc.runtrace.condense(self.tid());
    });
    index.appendChild(head);
    cap.appendChild(index);

    /* ---- the assistant lane: the record ------------------------------------------------------- */

    if (showReport && subject) {
      var report = u.el('div', { class: 't5-run-report', data: { lane: 'assistant', kind: subject.kind } });
      if (laneChanged) report.classList.add('t5-run-fade');

      var rhead = u.el('div', { class: 't5-run-report-head' });
      /* The concept's own register word for "which kind of thing this is", the same one the rail rows
       * and the handoff card use. A second vocabulary here would be two owners of one idea. */
      rhead.appendChild(u.el('span', { class: 't5-rail-kind', text: F().label(subject.kind) }));
      /* Printed only once the phase is DONE. `durationMs` is how long the stage took, so stating it
       * beside a phase that is still running would report a measurement the run has not finished. */
      if (subject.status === 'done' && subject.durationMs) {
        rhead.appendChild(u.el('span', {
          class: 't5-run-time', text: F().duration(Math.round(subject.durationMs / 1000))
        }));
      }
      /* Close is offered only for a phase the READER opened. While the run is live the running phase
       * is its own disclosure, so a close control there would be a button that changes nothing. */
      if (open) {
        var close = u.el('button', {
          class: 't5-run-close', type: 'button', text: 'Close',
          aria: { label: 'Close the run detail' }
        });
        this._on(close, 'click', function () { svc.runtrace.close(self.tid()); });
        rhead.appendChild(close);
      }
      report.appendChild(rhead);

      var list = subject.rows && subject.rows.length ? subject.rows : null;
      if (list) {
        var rowsEl = u.el('div', { class: 't5-run-rows' });
        list.forEach(function (r) {
          var row = u.el('div', { class: 't5-run-row' }, [
            u.el('span', { class: 't5-run-row-verb', text: r.verb || '' }),
            u.el('span', { class: 't5-run-row-target', text: r.target || '' })
          ]);
          /* Printed only when the record carries them. A generate phase touches files without adding
           * or removing a line, and `+0 -0` beside it would state a measurement nobody made. */
          if (r.added != null || r.removed != null) {
            var delta = u.el('span', { class: 't5-run-delta' });
            if (r.added != null) delta.appendChild(u.el('span', { class: 't5-run-add', text: '+' + r.added }));
            if (r.removed != null) delta.appendChild(u.el('span', { class: 't5-run-rem', text: '\u2212' + r.removed }));
            row.appendChild(delta);
          }
          rowsEl.appendChild(row);
        });
        report.appendChild(rowsEl);
      } else if (subject.detail) {
        report.appendChild(u.el('p', { class: 't5-run-detail', text: subject.detail }));
      }
      /* A phase with neither rows nor a detail still gets its head, because the head states two facts
       * the reader asked for - which phase this is and how long it took. That is a thin record, not an
       * empty frame. The operation fields are NOT restated here: PMXOpCard owns them and the rail below
       * already prints them in this same lane pairing, so a second copy would be a second owner. */
      cap.appendChild(report);
    }

    /* The chain SCROLLS rather than truncating, and brings the phase being read back into view. The
     * reference caps its own chain at six glyphs and rolls the oldest off the left as a seventh phase
     * starts (f.910); the glyph is scrolled out, never dropped. With nothing disclosed the running
     * glyph is the target, and with neither, chainRoll's own default - the end of the chain - is where
     * a run in progress wants to be. */
    function rollChain(into) {
      if (!svc.motion || !svc.motion.chainRoll) return;
      var target = into || openGlyph || runningGlyph;
      global.requestAnimationFrame(function () {
        if (chain.isConnected) svc.motion.chainRoll(chain, target ? { into: target } : null);
      });
    }

    if (arriving) {
      /* Beat two. phaseHandover is passed an EMPTY label and an empty string, exactly as t2 passes
       * them: the sentence was already let go above, so there is nothing left to cross-fade, and what
       * the primitive is here for is the second beat - the slot opening from zero width at the glyph's
       * own measured size, after the first beat has been seen. The new sentence rides in with the
       * glyph, because in this concept the line speaks for whichever phase the chain is pointing at
       * and writing it earlier would have the line speak for a phase with no entry yet.
       *
       * The roll waits for the insertion: rolling a chain that is one glyph short would scroll to the
       * wrong end and then have to correct itself a beat later. */
      var born = null;
      var insertGlyph = function () {
        born = glyphFor(arriving);
        writeHeadLine(true);
        return born;
      };
      if (svc.motion && svc.motion.phaseHandover) {
        svc.motion.phaseHandover(chain, argEl, insertGlyph, '').then(function () { rollChain(born); });
      } else {
        insertGlyph();
        rollChain(born);
      }
    } else {
      rollChain(null);
    }

    return cap;
  };

  /* Disclosing a phase, routed through groupReopen rather than made as a bare state write.
   *
   * Two different height motions live in this concept and they answer two different questions. The
   * question lanes BOUNCE to their new size, bottom-anchored, because a page with fewer options is a
   * smaller card and the reader should be told so without the transcript moving. A reader clicking a
   * glyph is a third case again: they asked for content that was not on screen at all, so the surface
   * has to make room for it rather than merely restate its own size.
   *
   * What groupReopen actually does here, measured at a 1200px chat width rather than assumed: its main
   * leg carries the siblings AFTER the capsule - the rail, the advice note, the handoff card - which is
   * the rule f.910 states, that what lives below the run is pushed down and never replaced. Its height
   * leg is guarded by `endH > startH`, and because the record lands BESIDE the index rather than under
   * it, the capsule only grows by the amount the record exceeds the index: 47px to 84px for the edit
   * phase and its three rows, not by the record's whole height. Once the lanes have folded the record
   * really is under the index and the capsule grows by all of it, which is the one case where springing
   * the height is the honest description of what happened. In the windows that put the work host
   * between the transcript and the composer that growth is taken from the transcript above, so the
   * spring is also what keeps it from being taken in a single frame.
   *
   * A null phaseId is the summary line's meaning: PMXRunTrace.open with no id reopens the most recent
   * phase, which is what "show me what just happened" asks for. Passing the id of the phase already
   * open closes it, so one control both discloses and dismisses.
   *
   * The rail's own open row is deliberately left alone. Reference 03 reopens each group independently -
   * opening the second does not close the first - and the capsule and the rail are two different
   * clusters answering two different questions. */
  T5.prototype._openRunPhase = function (cap, phaseId) {
    var self = this;
    var svc = this.ctx.services;
    if (!svc.runtrace || !svc.runtrace.open) return;
    function disclose() { svc.runtrace.open(self.tid(), phaseId); }
    if (svc.motion && svc.motion.groupReopen) svc.motion.groupReopen(cap, disclose);
    else disclose();
  };

  /* ---------------------------------------------------------------- the operation card
   *
   * `reference/screenshots/pm7_popout.png` renders one unit of tool work far denser than a one-line
   * "Read file" row: a headline, a status, the reason it ran, six named fields, its per-file deltas and
   * its chips. This concept reads that card ACROSS THE LANES.
   *
   * The rail says WHAT ran - one compact row per operation, headline and count, status carried by the
   * row's own state attribute. The OPPOSITE lane says HOW - the six fields as a two-column key/value
   * block in the user lane, under the reason the operation ran at all. No other concept can do this,
   * because no other concept has a lane on the far side of its work rail to answer in.
   *
   * Nothing here recomputes a fact the record already settled: `headline` carries the tense rule and
   * `count` grows while the operation runs, so both are printed exactly as handed over.
   */
  T5.prototype._opRailRows = function () {
    var self = this, svc = this.ctx.services;
    if (!svc.opcard || !svc.opcard.forThread) return [];
    var recs = svc.opcard.forThread(this.ctx, this.tid()) || [];
    var out = [];
    function rowFor(rec) {
      return {
        kind: 'op:' + rec.id,
        op: rec,
        label: F().label(rec.kind),
        build: function (h) { self._detailOp(h, rec); }
      };
    }
    for (var i = 0; i < recs.length; i++) out.push(rowFor(recs[i]));
    return out;
  };

  T5.prototype._detailOp = function (host, rec) {
    var self = this, u = U();
    var A = this.ctx.services.artifacts;

    /* The why line HEADS the detail. The lane answers `how` only after it has said why the run reached
     * for this operation at all. */
    if (rec.why) host.appendChild(u.el('p', { class: 't5-detail-p t5-op-why', text: rec.why }));

    /* All six fields, in the order the record hands them over, as a real two-column grid: keys in the
     * first track and values in the second, so every value starts on the same vertical line however
     * long its key is. A flex row per field could not promise that. */
    var fields = u.el('div', { class: 't5-op-fields' });
    rec.fields.forEach(function (f) {
      fields.appendChild(u.el('span', { class: 't5-op-k', text: f.key }));
      fields.appendChild(u.el('span', { class: 't5-op-v', text: f.value }));
    });
    host.appendChild(fields);

    /* `verb target +added \u2212removed`, one line per file the operation touched. */
    if (rec.rows && rec.rows.length) {
      var rowsEl = u.el('div', { class: 't5-op-rows' });
      rec.rows.forEach(function (row) {
        rowsEl.appendChild(u.el('div', { class: 't5-op-row' }, [
          u.el('span', { class: 't5-op-row-what', text: row.verb + ' ' + row.target }),
          u.el('span', { class: 't5-op-row-delta', text: '+' + (row.added || 0) + ' \u2212' + (row.removed || 0) })
        ]));
      });
      host.appendChild(rowsEl);
    }

    if (!rec.chips || !rec.chips.length) return;
    var chips = u.el('div', { class: 't5-op-chips' });
    rec.chips.forEach(function (chip) {
      /* `/sources` is a count, not a destination: there is no service call behind it, so it is a plain
       * token. Only the artifact chip is a button, and it opens the artifact it names. */
      if (chip.kind !== 'artifact') {
        chips.appendChild(u.el('span', { class: 't5-op-chip', data: { kind: chip.kind }, text: chip.label }));
        return;
      }
      var btn = u.el('button', { class: 't5-op-chip', type: 'button', data: { kind: 'artifact' } }, [
        chip.label,
        u.el('span', { class: 't5-op-chip-id', text: chip.artifactId })
      ]);
      self._on(btn, 'click', function () {
        if (!A) return;
        A.open(chip.artifactId);
        /* Settle the simulated transport in the same interaction, exactly as the handoff card does. */
        if (A.forceReady) A.forceReady(chip.artifactId);
      });
      chips.appendChild(btn);
    });
    host.appendChild(chips);
  };

  /* ---- detail builders. They render into the user lane, so they are prose-width, not sheet-width. */

  T5.prototype._detailGoal = function (host, goal) {
    var self = this, u = U();
    var svc = this.ctx.services;
    host.appendChild(u.el('p', { class: 't5-detail-p', text: goal.title || goal.objective || 'Goal' }));
    if (goal.objective && goal.title) host.appendChild(u.el('p', { class: 't5-detail-p', text: goal.objective }));

    if (goal.status === 'blocked' && goal.blocker) {
      var b = goal.blocker;
      [['Cause', b.cause], ['Affected', b.affectedScope], ['Tried', b.lastAttemptedRecovery],
       ['Stopped because', b.whyRecoveryStopped], ['Next safe action', b.nextSafeAction]].forEach(function (r) {
        if (!r[1]) return;
        host.appendChild(u.el('div', { class: 't5-detail-row' }, [
          u.el('span', { class: 't5-sheet-k', text: r[0] }),
          u.el('span', { class: 't5-sheet-v', text: r[1] })
        ]));
      });
    }

    var acts = u.el('div', { class: 't5-detail-acts' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (action) {
      if (svc.surfaces.canAct && !svc.surfaces.canAct(goal, action)) return;
      var btn = u.el('button', { class: 't5-act', type: 'button', text: action.charAt(0).toUpperCase() + action.slice(1) });
      self._on(btn, 'click', function () { svc.surfaces.act(self.tid(), action); });
      acts.appendChild(btn);
    });
    if (acts.childNodes.length) host.appendChild(acts);
  };

  T5.prototype._detailTodo = function (host, todo) {
    var u = U();
    (todo.items || []).forEach(function (it) {
      host.appendChild(u.el('div', { class: 't5-detail-row' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(it.state) }),
        u.el('span', { class: 't5-sheet-v', text: it.label })
      ]));
    });
  };

  T5.prototype._detailAgents = function (host, group) {
    var u = U();
    (group.agents || []).forEach(function (ag) {
      host.appendChild(u.el('div', { class: 't5-detail-row' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(ag.status) }),
        u.el('span', { class: 't5-sheet-v', text: ag.name + ' \u2014 ' + (ag.currentActivity || ag.task || '') }),
        u.el('span', { class: 't5-sheet-k', text: ag.workedSeconds != null ? F().duration(ag.workedSeconds) : '' })
      ]));
    });
  };

  T5.prototype._detailStages = function (host, stages) {
    var u = U();
    stages.forEach(function (st) {
      host.appendChild(u.el('div', { class: 't5-detail-row' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(st.kind) }),
        u.el('span', { class: 't5-sheet-v', text: st.label + (st.detail ? ' \u2014 ' + st.detail : '') }),
        u.el('span', { class: 't5-sheet-k', text: st.durationMs != null ? F().duration(Math.round(st.durationMs / 1000)) : (st.durationSeconds != null ? F().duration(st.durationSeconds) : '') })
      ]));
    });
  };

  T5.prototype._detailDiff = function (host, group) {
    var self = this, u = U();
    (group.files || []).forEach(function (f) {
      var row = u.el('button', { class: 't5-detail-row t5-detail-file', type: 'button' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(f.status) }),
        u.el('span', { class: 't5-sheet-v', text: f.path }),
        u.el('span', { class: 't5-sheet-k', text: '+' + (f.added || 0) + ' \u2212' + (f.removed || 0) })
      ]);
      self._on(row, 'click', function () {
        self.ctx.services.editorHost.openArtifact(
          { id: 'file-' + f.path, title: f.path, kind: 'file', projectPath: f.path }, self.ctx);
      });
      host.appendChild(row);
    });
    if (group.hiddenFileCount) host.appendChild(u.el('p', { class: 't5-detail-p', text: group.hiddenFileCount + ' more files' }));
  };

  T5.prototype._detailArtifacts = function (host, artifacts) {
    var self = this, u = U();
    var A = this.ctx.services.artifacts;
    artifacts.forEach(function (art) {
      var row = u.el('button', { class: 't5-detail-row t5-detail-file', type: 'button' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(art.kind || 'artifact') }),
        u.el('span', { class: 't5-sheet-v', text: art.title })
      ]);
      self._on(row, 'click', function () {
        A.open(art.id);
        if (A.forceReady) A.forceReady(art.id);
      });
      host.appendChild(row);
    });
  };

  /* ---------------------------------------------------------------- BSD: a note in the user lane
   *
   * The user lane is the reader's own side of the dialogue, which is the right place for a comment
   * addressed TO them about the work. It is a note, not a row in the rail: the rail reports what the
   * run is doing, and advice is not something the run is doing.
   */
  T5.prototype._renderBsdNote = function (host) {
    var self = this, u = U();
    u.empty(host);
    var bsd = this.ctx.services.bsd;
    if (!bsd || !bsd.advice) return;
    var list = bsd.advice(this.tid()) || [];
    if (!list.length) return;

    list.forEach(function (adv) {
      var note = u.el('div', { class: 't5-note', data: { lane: 'user', severity: adv.severity } });
      note.appendChild(u.el('span', {
        class: 't5-note-kind',
        text: adv.severity === 'caution' ? 'Back Seat Driver \u00b7 caution' : 'Back Seat Driver \u00b7 note'
      }));
      note.appendChild(u.el('p', { class: 't5-note-text', text: adv.text }));
      if (adv.evidenceRefs && adv.evidenceRefs.length) {
        note.appendChild(u.el('span', { class: 't5-note-ev', text: adv.evidenceRefs.join(', ') }));
      }
      /* Dismiss only: advice is read-only, and there is no service call that would apply it. */
      var dis = u.el('button', { class: 't5-note-dismiss', type: 'button', text: 'Dismiss' });
      self._on(dis, 'click', function () { bsd.dismiss(self.tid(), adv.id); });
      note.appendChild(dis);
      host.appendChild(note);
    });
  };

  /* ---------------------------------------------------------------- artifact handoff */

  T5.prototype._renderHandoff = function (host) {
    var self = this, u = U();
    if (!host) return;
    u.empty(host);
    var svc = this.ctx.services;
    var A = svc.artifacts;
    if (!A) return;

    var thread = this.ctx.data.threadById(this.tid());
    var refs = (thread && thread.artifacts) || [];
    if (!refs.length) return;
    var ref = refs[refs.length - 1];
    if (!ref.id) return;

    var state = A.stateOf ? A.stateOf(ref.id) : 'idle';
    var card = u.el('div', { class: 't5-handoff', data: { state: state } });
    card.appendChild(u.el('span', { class: 't5-rail-kind', text: 'Artifact' }));
    card.appendChild(u.el('span', { class: 't5-handoff-title', text: ref.title }));

    var stateEl = u.el('span', { class: 't5-handoff-state' });
    var label = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, label);
    else stateEl.textContent = label;
    card.appendChild(stateEl);

    var worked = this._handoffWorkedSeconds();
    if (worked != null) card.appendChild(u.el('span', { class: 't5-handoff-worked', text: 'Worked for ' + F().duration(worked) }));

    var open = u.el('button', { class: 't5-act t5-handoff-open', type: 'button', text: 'Open' });
    this._on(open, 'click', function () {
      A.open(ref.id);
      /* Settle the simulated transport in the same interaction; the card repaints through the artifact
       * subscription, since `open` writes session state that no `view*` key covers. */
      if (A.forceReady) A.forceReady(ref.id);
      if (svc.motion && svc.motion.handoff) svc.motion.handoff(card);
    });
    card.appendChild(open);
    host.appendChild(card);
  };

  T5.prototype._handoffWorkedSeconds = function () {
    var svc = this.ctx.services;
    var a = svc.surfaces ? svc.surfaces.activeFor(this.tid()) : null;
    if (a && a.goal && svc.goals && svc.goals.completionReceipt) {
      var r = svc.goals.completionReceipt(a.goal);
      if (r && r.workedSeconds != null) return r.workedSeconds;
    }
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].runtime && msgs[i].runtime.workedSeconds != null) return msgs[i].runtime.workedSeconds;
    return null;
  };

    /* ---------------------------------------------------------------- question: the lane dialogue
   *
   * The matrix assigns this concept a LANE DIALOGUE: the prompt renders in the ASSISTANT lane and the
   * answer form in the USER lane, and below 900px the two fold into a stacked stepper.
   *
   * That is the only question form in the eight that uses position to say who is speaking. The prompt is
   * something the assistant said, so it sits where assistant turns sit; the answer is something the
   * reader is composing, so it sits where their turns sit. Nothing labels the two halves - the lanes
   * already do, which is why this concept can afford a question with no head, no card and no chrome.
   *
   * The fold is free: both halves carry `data-lane`, and the same container query that pairs the turns
   * assigns the columns. There is no second breakpoint and no JavaScript measurement anywhere.
   */
  T5.prototype.renderQuestion = function () {
    /* Re-entrancy guard: claiming the surfaces notifies the store, which re-enters update() and
     * therefore this function mid-render. */
    if (this._inRenderQuestion) return;
    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }
  };

  /* ---------------------------------------------------------------- the pair changes SIZE, and says so
   *
   * What stood here was a refusal: no height motion, because "springing a height would move the
   * conversation above them". That reasoning was sound about the mechanism it had - a card pinned by
   * its TOP edge grows downward and shoves everything under it, or grows upward and shoves everything
   * over it - and it is answered rather than overruled by `pmx-resize-up`. Both lanes are anchored to
   * their BOTTOM edge wherever the window provides the question region, which is the case where the
   * card sits directly above the composer. A page that needs more room moves the pair's OWN top edge
   * into space the card already occupies; the transcript above it does not move by a pixel.
   *
   * Saying nothing was the worse failure. A four-option page and a freeform page are genuinely
   * different heights, and the pair used to snap between them - which reads as a different card
   * appearing rather than as the same card on a different page. The bounce is PMConcept7's own
   * measured resize (`--ease-bounce`, y1 = 1.72, plus a one-shot scale beat), so the two halves flex
   * to their new size the way this product's model picker already does.
   *
   * BOTH LANES, ONE BEAT. The halves are one frame to the reader - one question, asked on the left and
   * answered on the right - so they are bounced with the same options in the same synchronous beat
   * rather than wrapped in a shared container. A wrapper would have been the other legitimate answer
   * and was rejected on layout: at 900px and up the lanes are grid items of the region itself
   * (`t5-paired-columns.css:793-806` places them in columns 1 and 2 of row 1), so putting a box around
   * them would take them out of the grid and cost the concept its two columns. Two calls, same
   * `bounceClass` and same duration, started in the same frame, run on the same curve and settle
   * together; each one measures and mutates only its own half, which is also what keeps the first
   * lane's mutation from being measured as the second lane's starting height. */
  T5.prototype._renderQuestionBody = function () {
    var svc = this.ctx.services;
    var motion = svc.motion;
    var R = global.PMXReveal;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;
    if (!flow) { this._dropLanes(host); return; }

    if (!flow.record) {
      /* The receipt is one full-width row, not a pair of lanes, so the pair is genuinely gone here -
       * this is the questionnaire ending, not the card resizing. */
      this._dropLanes(host);
      this._renderLaneReceipt(host, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    var pair = this._ensureLanes(host);
    var said = pair.said, mine = pair.mine;

    /* The option COUNT is what picks the beat: `pmx-size-bounce-strong` overshoots further and
     * undershoots once before settling, which is what a page with two fewer options actually is - a
     * change of shape rather than a nudge. A page whose option count is unchanged and whose prompt
     * merely runs to a second line gets the ordinary beat. */
    var q = flow.question;
    var count = (q && q.options) ? q.options.length : 0;
    var hadCount = this._qOptionCount;
    this._qOptionCount = count;

    /* A NEW questionnaire in the same pair forgets what the old one showed. Question identity is
     * `qid/questionId/phase`, and the demo fixture prepares every flow under one fixed record id, so
     * a second questionnaire's question two is indistinguishable from the first one's - and the pair
     * would refuse the entrance for a question the reader has genuinely never seen. `createdAt` is
     * stamped once at prepare and never rewritten, so it names the RUN rather than the record, and
     * `forgetVisits` is motion.js's own way to say this element has shown nothing yet. */
    var stamp = flow.id + '@' + ((flow.record && flow.record.createdAt) || '');
    if (this._qStamp !== stamp) {
      this._qStamp = stamp;
      if (motion && motion.forgetVisits) motion.forgetVisits(said);
    }

    /* ONE identity for the PAIR. `keyFor` is qid/questionId/phase, so it changes when the reader moves
     * to a different question and not when they type into this one. It is stamped on the assistant
     * lane alone even though two elements persist: firstVisit MUTATES the element it is asked about,
     * so asking both would be two records of one fact, free to disagree after any path that rebuilds
     * one half and not the other. The prompt is what the reader is being shown, so the lane carrying
     * the prompt is where the record of having shown it belongs. */
    var key = R ? R.keyFor(svc, this.tid()) : '';
    var fresh = (motion && motion.firstVisit) ? motion.firstVisit(said, key) : true;

    /* NOTHING CHANGED, NOTHING MOVES.
     *
     * Advancing the flow renders this surface twice - once from the handler and once from the store
     * notification `qflow.claim` raises about ten milliseconds later - and typing writes a draft,
     * which notifies again. Rebuilding on a pass that changes nothing is invisible on its own, but a
     * BOUNCE on such a pass is not: it would measure the first bounce mid-flight, pin that, and hand
     * the settle a target taken from a card already on its way somewhere. Comparing what the fill
     * actually reads is the honest test, and it is cheap: one string per pass. */
    var sig = this._questionSignature(flow);
    if (!pair.created && sig === this._qSig) return;
    this._qSig = sig;

    if (pair.created) {
      /* Nothing to resize FROM. A card that has just been mounted has no previous size, so bouncing it
       * would animate a change from zero - which states that the card shrank into existence. */
      this._fillSaidLane(said, flow);
      this._fillMineLane(mine, flow);
    } else {
      this._bounceLanes(said, mine, flow, hadCount != null && hadCount !== count);
    }

    /* Reference 02 pages BACKWARD as often as forward, and paging back to an answered question shows
     * the answer still there without replaying the entrance - an entrance on the way back tells the
     * reader they moved forward when they moved back. The cross-fade is therefore played only for a
     * question this pair has not shown before; the resize above still plays, because the pair really
     * did change size and that is a different statement. */
    if (fresh) this._playLaneEntrance(said, mine);
  };

  /* The pair, created ONCE and kept. The lanes used to be destroyed and rebuilt on every render, which
   * is why there was never anything to resize: an element that did not exist a frame ago has no
   * previous height, and `firstVisit` stamped on it would die with it every pass. */
  T5.prototype._ensureLanes = function (host) {
    var u = U();
    var pair = this._qLanes;
    var tid = this.tid();
    if (pair && pair.tid === tid && pair.said.parentNode === host && pair.mine.parentNode === host) {
      return { said: pair.said, mine: pair.mine, created: false };
    }

    u.empty(host);
    var said = u.el('div', { class: 't5-qlane', data: { lane: 'assistant', phase: 'active' } });
    var mine = u.el('div', { class: 't5-qlane', data: { lane: 'user' } });

    /* Bottom-anchored ONLY where the card sits above the composer. Inline in the transcript the lanes
     * are a turn like any other and have a conversation below them as well as above, so anchoring
     * their bottom edge there would move what follows them - the very thing this class exists to
     * prevent in the region case. */
    if (this.ctx.capabilities.questionHost) {
      said.classList.add('pmx-resize-up');
      mine.classList.add('pmx-resize-up');
    }

    host.appendChild(said);
    host.appendChild(mine);
    /* Keyed by thread: another thread's questionnaire is a different card, so it must not bounce from
     * this one's height or inherit its record of what has already been shown. */
    this._qLanes = { tid: tid, said: said, mine: mine };
    this._qOptionCount = null;
    this._qBounces = null;
    this._qSig = null;
    this._qStamp = null;
    return { said: said, mine: mine, created: true };
  };

  T5.prototype._dropLanes = function (host) {
    this._qLanes = null;
    this._qOptionCount = null;
    this._qBounces = null;
    this._qSig = null;
    this._qStamp = null;
    if (host) U().empty(host);
  };

  T5.prototype._bounceLanes = function (said, mine, flow, strong) {
    var self = this;
    var motion = this.ctx.services.motion;
    var opts = { bounceClass: strong ? 'pmx-size-bounce-strong' : 'pmx-size-bounce' };

    if (!motion || !motion.resizeBounce) {
      this._fillSaidLane(said, flow);
      this._fillMineLane(mine, flow);
      return;
    }

    /* Two calls, one beat. resizeBounce runs its mutation synchronously in both the animated and the
     * reduced-motion path, so by the time this function returns both halves hold their new contents
     * and reduced motion has landed on the end state with no transform anywhere. */
    this._bounceLane(said, 'said', function () { self._fillSaidLane(said, flow); }, opts);
    this._bounceLane(mine, 'mine', function () { self._fillMineLane(mine, flow); }, opts);
  };

  /* One lane's bounce. A bounce still in flight is LANDED before the next one is measured.
   *
   * Two bounces overlapping on one element sabotage each other: the older one's cleanup timer fires
   * inside the younger one's flight and clears the pinned height, so the younger animation ends by
   * snapping. Landing the old one first costs a jump to a height the lane was already travelling to,
   * and buys a complete curve for the change the reader just made - which is the one they are
   * watching. The signature check above means this can only be reached by a real second change
   * inside the settle window, such as answering and advancing in quick succession. */
  T5.prototype._bounceLane = function (el, key, mutate, opts) {
    var live = this._qBounces || (this._qBounces = {});
    var prior = live[key];
    if (prior && prior.state && prior.state() === 'running' && prior.finish) {
      try { prior.finish(); } catch (e) {}
    }
    live[key] = this.ctx.services.motion.resizeBounce(el, mutate, opts);
  };

  /* Everything the two fills read, as one string. A pass whose signature is unchanged would rebuild
   * the same DOM, so it is skipped outright - which is also what keeps a textarea's caret alive
   * through a store notification that had nothing to do with this card. */
  T5.prototype._questionSignature = function (flow) {
    var q = flow.question;
    var parts = [
      flow.id, flow.status, flow.index, flow.position, flow.total,
      flow.atEnd ? 1 : 0, flow.skippedCount, this._pendingReason || ''
    ];
    if (q) {
      parts.push(q.id, q.required ? 1 : 0, (q.options || []).length,
        (q.selected || []).join('\u0001'), q.draft || '', flow.isSkipped(q) ? 1 : 0);
    }
    /* Delimited with escaped control characters rather than a comma: a draft is free text, and a
     * separator it could itself contain would let two different states collapse to one signature. */
    return parts.join('\u0002');
  };

  T5.prototype._playLaneEntrance = function (said, mine) {
    var R = global.PMXReveal;
    if (!R || R.reduced(said)) return;
    /* Both halves, one class, one duration: the pair reads as a single frame changing what it says. */
    R.oneShot(said, 't5-qlane-fade', 320);
    R.oneShot(mine, 't5-qlane-fade', 320);
  };

  /* ---- the assistant lane: the prompt, and nothing else. It is a thing that was said. */
  T5.prototype._fillSaidLane = function (said, flow) {
    var u = U();
    u.empty(said);
    said.setAttribute('data-phase', flow.status);

    if (flow.status === 'preparing' || flow.status === 'submitting') {
      said.appendChild(global.PMXReveal.capsule(
        flow.status === 'preparing' ? 'Preparing questions' : 'Submitting answers', this.ctx));
      return;
    }

    var q = flow.question;
    said.appendChild(u.el('p', {
      class: 't5-qprompt',
      text: flow.atEnd ? 'That is every question.' : (q ? q.prompt : '')
    }));
    if (q && q.required && !flow.atEnd) said.appendChild(u.el('span', { class: 't5-qreq', text: 'Required' }));
  };

  /* ---- the user lane: the form. `Question 2 of 3` sits ABOVE it, per the matrix. */
  T5.prototype._fillMineLane = function (mine, flow) {
    var self = this, u = U();
    var svc = this.ctx.services;
    var q = flow.question;

    u.empty(mine);
    /* While the questionnaire is preparing or submitting there is nothing for the reader to answer, so
     * the lane stays empty and the CSS `:empty` rule takes it out of the layout. It is not removed: it
     * is the same lane, waiting, and destroying it would throw away the pair's size and its record of
     * what it has shown. */
    if (flow.status === 'preparing' || flow.status === 'submitting') return;

    mine.appendChild(u.el('span', {
      class: 't5-qcount',
      text: 'Question ' + flow.position + ' of ' + flow.total
    }));

    if (q && !flow.atEnd) {
      if (q.options && q.options.length) {
        var opts = u.el('div', { class: 't5-qopts' });
        q.options.forEach(function (opt) {
          var sel = (q.selected || []).indexOf(opt) >= 0;
          var b = u.el('button', { class: 't5-opt', type: 'button', text: opt, aria: { pressed: sel ? 'true' : 'false' } });
          self._on(b, 'click', function (ev) {
            if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
            svc.qflow.act(svc, self.tid(), 'answer', opt);
            self.renderQuestion();
          });
          opts.appendChild(b);
        });
        mine.appendChild(opts);
      } else {
        var ta = u.el('textarea', { class: 't5-qfree pmx-scroll', aria: { label: q.prompt } });
        ta.setAttribute('spellcheck', 'false');
        ta.value = q.draft || '';
        this._on(ta, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', ta.value); });
        mine.appendChild(ta);
      }
    }

    /* The refusal renders in the USER lane at the field, because that is where the thing it complains
     * about lives. */
    var reason = u.el('p', { class: 't5-qreason', data: { show: this._pendingReason ? '1' : '0' } });
    if (this._pendingReason) { reason.textContent = this._pendingReason; this._pendingReason = null; }
    mine.appendChild(reason);

    var acts = u.el('div', { class: 't5-qacts' });

    function refuse(res, fallback) {
      var text = res.reason || fallback;
      if (res.offenderIndex != null && res.offenderIndex !== flow.index) {
        self._pendingReason = text;
        self.renderQuestion();
        return;
      }
      reason.textContent = text;
      reason.setAttribute('data-show', '1');
      if (global.PMXReveal) global.PMXReveal.reject(reason);
    }

    if (flow.index > 0) {
      var back = u.el('button', { class: 't5-act', type: 'button', text: 'Back' });
      this._on(back, 'click', function () { svc.qflow.act(svc, self.tid(), 'prev'); self.renderQuestion(); });
      acts.appendChild(back);
    }

    /* Skip lives in the USER lane: skipping is the reader's decision, so it belongs on the reader's
     * side. The matrix says so explicitly and it is the right instinct. */
    if (q && !flow.atEnd) {
      var skip = u.el('button', { class: 't5-act', type: 'button', text: 'Skip' });
      this._on(skip, 'click', function () { svc.qflow.act(svc, self.tid(), 'skip'); self.renderQuestion(); });
      acts.appendChild(skip);
    }

    if (q && flow.isSkipped(q)) {
      var un = u.el('button', { class: 't5-act', type: 'button', text: 'Unskip' });
      this._on(un, 'click', function () { svc.qflow.act(svc, self.tid(), 'unskip', flow.index); self.renderQuestion(); });
      acts.appendChild(un);
    }

    var primary = u.el('button', { class: 't5-act t5-act-primary', type: 'button', text: flow.atEnd ? 'Send' : 'Next' });
    this._on(primary, 'click', function () {
      var res = svc.qflow.act(svc, self.tid(), flow.atEnd ? 'submit' : 'next');
      if (!res.ok) { refuse(res, 'Answer the required questions first.'); return; }
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(primary);

    /* Cancel collapses BOTH lanes to one receipt row - the matrix's exact requirement, and the reason
     * the receipt is a single full-width row rather than a pair of lanes. */
    var cancel = u.el('button', { class: 't5-act', type: 'button', text: 'Cancel' });
    this._on(cancel, 'click', function () {
      svc.qflow.act(svc, self.tid(), 'cancel');
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(cancel);

    if (flow.skippedCount) {
      acts.appendChild(u.el('span', {
        class: 't5-qskipped',
        text: flow.skippedCount === 1 ? '1 skipped' : flow.skippedCount + ' skipped'
      }));
    }

    mine.appendChild(acts);
  };

  /* One receipt row spanning both lanes. */
  T5.prototype._renderLaneReceipt = function (host, receipt) {
    var self = this, u = U();
    if (!receipt) return;

    var row = u.el('div', { class: 't5-qreceipt', data: { status: receipt.status } });
    row.appendChild(u.el('span', { class: 't5-rail-kind', text: 'Questions' }));
    row.appendChild(u.el('span', {
      class: 't5-qreceipt-text',
      text: receipt.cancelled
        ? 'Cancelled'
        : (receipt.answered + (receipt.answered === 1 ? ' answer sent' : ' answers sent') +
           (receipt.skipped ? ', ' + receipt.skipped + ' skipped' : ''))
    }));

    var show = u.el('button', { class: 't5-act', type: 'button', text: 'Show answers' });
    this._on(show, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 340,
        build: function (h) {
          h.appendChild(u.el('div', { class: 't5-sheet-title', text: receipt.cancelled ? 'Cancelled questions' : 'Answers sent' }));
          (receipt.questions || []).forEach(function (question) {
            var val = receipt.answers[question.id];
            var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't5-sheet-row' }, [
              u.el('span', { class: 't5-sheet-k', text: wasSkipped ? 'skipped' : 'answered' }),
              u.el('span', { class: 't5-sheet-v', text: question.prompt + (val == null ? '' : ' \u2014 ' + [].concat(val).join(', ')) })
            ]));
          });
        }
      });
    });
    row.appendChild(show);
    host.appendChild(row);
  };

    T5.prototype.syncLive = function () {
    var u = U(), s = this.ctx.services.runtime.liveStatus(this.tid());
    if (!s) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null; return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't5-live pmx-live' }, [
        u.el('span', { class: 't5-live-dot pmx-pulse' }),
        u.el('span', { class: 't5-live-text' }),
        u.el('span', { class: 't5-live-time' })
      ]);
      this.list.appendChild(this.liveEl);
    }
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t5-live-text'), s.text || '');
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t5-live-time'),
      s.workedSeconds != null ? F().duration(s.workedSeconds) : '');
  };

  T5.prototype.isExpanded = function (id) { return !!this.ctx.store.view(this.tid()).expanded[id]; };
  T5.prototype.setExpanded = function (id, on) {
    var self = this, rec = this.rendered[id];
    this.ctx.store.view(this.tid()).expanded[id] = !!on;
    if (!rec) return;
    this.scrollCtl.preserveAcross(rec.bodyEl, function () {
      rec.bodyEl.setAttribute('data-expanded', on ? '1' : '0');
      var b = rec.bodyEl.querySelector('.t5-more');
      if (b) b.textContent = on ? 'Show less' : 'Show more';
      self.ctx.services.motion.snapToEnd(rec.bodyEl);
    });
  };
  T5.prototype.revealHidden = function (id) { this.setExpanded(id, true); };

  T5.prototype.scrollToMessage = function (id, opts) {
    var rec = this.rendered[id];
    if (!rec) {
      var tid = this.tid(), t = this.ctx.data.threadById(tid), idx = -1;
      for (var i = 0; i < t.messages.length; i++) if (t.messages[i].id === id) { idx = i; break; }
      if (idx >= 0) {
        this.ctx.store.view(tid).loadedFrom = Math.max(0, idx - 20);
        this.renderThread(); rec = this.rendered[id];
      }
    }
    if (!rec) return false;
    this.setExpanded(id, true);
    this.scrollCtl.jumpTo(id, opts || { highlight: true });
    return true;
  };

  T5.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T5.prototype.setAnchor = function (t) { return this.scrollCtl.restoreAnchor(t); };

  T5.prototype.update = function (state, changed) {
    var full = false, soft = false;
    for (var i = 0; i < changed.length; i++) {
      var k = changed[i];
      if (k === 'session.activeThreadId' || k === 'view.lens' || k === 'view.messages') full = true;
      else if (k.indexOf('view') === 0) soft = true;
    }
    if (state.session.activeThreadId !== this.lastTid) full = true;
    if (full) { this.renderThread(); return; }
    if (soft) { this.renderSurfaces(); this.renderQuestion(); }
  };

  T5.prototype.destroy = function () {
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
    /* The lane pair survives renders, so it has to be released HERE or the next instance would hold a
     * reference to two elements this destroy has just detached and would never build a new pair. */
    this._qLanes = null;
    this._qOptionCount = null;
    this._qBounces = null;
    this._qSig = null;
    this._qStamp = null;
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this._tickOff) { try { this._tickOff(); } catch (e) {} this._tickOff = null; }
    if (this.scrollCtl && this.scrollCtl.destroy) { try { this.scrollCtl.destroy(); } catch (e) {} }
    [this.root, this.inlineSurfaces, this.inlineQuestion].forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    this.rendered = {};
    /* The append-only path keys off these. A destroyed instance that left them behind would let the
     * next render mistake a fresh mount for an append and skip building the turns already on
     * screen. */
    this._renderedIds = null;
    this._renderedFrom = null;
  };

  global.PMX.thread.register('t5', {
    name: 'Paired Columns',
    blurb: 'Above nine hundred pixels the two speakers occupy their own lanes, a narrow one for you and a wide one for the assistant, and below that the lanes fold into a single column with a compact role tag.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T5(regionEl, ctx);
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
