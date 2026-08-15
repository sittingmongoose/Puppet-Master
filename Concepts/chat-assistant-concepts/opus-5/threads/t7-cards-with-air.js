/* t7 "Cards with Air" — Opus 5
 *
 * The controlled counterpoint to the rest of the set. This concept is deliberately
 * card-based, but with exactly ONE level of nesting permitted, enforced: a card may contain
 * content; it may never contain another card. Anything that would need a second level opens
 * a detail sheet instead.
 *
 * The hypothesis being tested: cards fail not because they are cards, but because they nest
 * and crowd. Give them one level and real separation and see whether they hold up at 520px.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }
  var ELIGIBLE = 850;

  function T7(host, ctx) {
    this.host = host; this.ctx = ctx; this.offs = []; this.rendered = {}; this.lastTid = null;
    this.build();
  }
  T7.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };
  T7.prototype.tid = function () { return this.ctx.store.get('session.activeThreadId'); };

  T7.prototype.build = function () {
    var self = this, u = U();
    this.root = u.el('div', { class: 't7-root' });
    this.root.appendChild(u.el('div', { class: 't7-head' }, [
      u.el('span', { class: 't7-head-name', text: 'Cards with Air' }),
      u.el('span', { class: 't7-head-model', text: this.ctx.label })
    ]));
    this.scroller = u.el('div', { class: 't7-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't7-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    this.inlineSurfaces = u.el('div', { class: 't7-inline-surfaces' });
    this.inlineQuestion = u.el('div', { class: 't7-inline-question' });
    if (!this.ctx.capabilities.workSurfaceHost) this.root.appendChild(this.inlineSurfaces);
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);
    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t7-turn', messageAttr: 'data-pmx-msg'
    });
    this._tickOff = this.ctx.services.runtime.onTick(function () { self.syncLive(); });
    /* Artifact state lives outside the store, so its ticks arrive here and nowhere else. */
    if (this.ctx.services.artifacts && this.ctx.services.artifacts.subscribe && !this._artOff) {
      this._artOff = this.ctx.services.artifacts.subscribe(function () {
        if (self._handoffHost) self._renderHandoff(self._handoffHost);
      });
    }
    this.renderThread();
  };

  T7.prototype.renderThread = function () {
    var tid = this.tid(), u = U();
    var v = this.ctx.store.view(tid);
    var msgs = this.ctx.data.visibleSlice(tid, v.loadedFrom);

    /* 01_message_arrival_spatial_continuity.mov, frames 47 to 63 (about 280ms at 57.6fps): the new
     * message enters as a flattened sliver at a seam and expands into its box, while everything
     * already on screen keeps its identity. Rebuilding the deck cannot say that - every card lifts
     * again, so the one that actually arrived is indistinguishable from the twenty that did not.
     *
     * So an append is an append. When the only difference is messages added at the END of the same
     * thread and the same loaded range, the existing cards are kept and the new ones are inserted
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
   * thread, a changed loaded range, a removal, or any edit to an existing card all fail this and
   * fall back to the rebuild, because none of those is an arrival and animating a reflow as though
   * something had just been said would be a lie about what happened. */
  T7.prototype._canAppendOnly = function (tid, v, msgs) {
    if (!this._renderedIds || tid !== this.lastTid) return false;
    if (v.loadedFrom !== this._renderedFrom) return false;
    if (msgs.length <= this._renderedIds.length) return false;
    for (var i = 0; i < this._renderedIds.length; i++) {
      if (msgs[i].id !== this._renderedIds[i]) return false;
    }
    return true;
  };

  /* The running indicator sits in the air below the last card and is not a card, so an arriving
   * card is filed above it rather than after it. */
  T7.prototype._listTail = function () {
    return (this.liveEl && this.liveEl.parentNode === this.list) ? this.liveEl : null;
  };

  T7.prototype._appendTurns = function (msgs) {
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
      /* displace stamps the node this returns, so it names the card that actually arrived. */
      return last;
    }

    /* Measure, mutate, re-pin - in that order. A reader sitting at the bottom is carried with the
     * new card; a reader who has scrolled up is left where they are, which is the whole reason
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

  T7.prototype.buildOlder = function (hidden) {
    var self = this, u = U();
    var b = u.el('button', { class: 't7-older', text: 'Load ' + hidden.toLocaleString() + ' earlier messages' });
    this._on(b, 'click', function () {
      var tid = self.tid(), v = self.ctx.store.view(tid), t = self.ctx.data.threadById(tid);
      var cur = v.loadedFrom == null ? t.messages.length - t.initialVisibleMessageCount : v.loadedFrom;
      v.loadedFrom = Math.max(0, cur - 120);
      self.scrollCtl.preserveAcross(self.list, function () { self.renderThread(); });
    });
    return u.el('div', { class: 't7-older-wrap' }, [b]);
  };

  /* LEVEL ONE. This is the only card in the transcript. Nothing inside it may be a card. */
  T7.prototype.buildTurn = function (msg) {
    var self = this, u = U(), svc = this.ctx.services;
    var lens = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;
    var turn = u.el('div', {
      class: 't7-turn pmx-msg',
      data: { pmxMsg: msg.id, pmxRole: msg.role, lens: lens || '' }
    });

    var body = u.el('div', { class: 't7-body pmx-msg-body' });
    body.appendChild(u.el('span', { class: 't7-role', text: msg.role === 'user' ? 'You' : 'Assistant' }));

    var prose = u.el('div', { class: 't7-prose' });
    String(msg.body || '').split(/\n{2,}/).forEach(function (p) {
      var s = p.replace(/\n/g, ' ').trim();
      if (s) prose.appendChild(u.el('p', { class: 't7-p', text: s }));
    });
    body.appendChild(prose);

    if ((msg.body || '').length >= ELIGIBLE) {
      var open = !!this.ctx.store.view(this.tid()).expanded[msg.id];
      body.setAttribute('data-collapsible', '1');
      body.setAttribute('data-expanded', open ? '1' : '0');
      var more = u.el('button', { class: 't7-more', text: open ? 'Show less' : 'Show more' });
      this._on(more, 'click', function () { self.setExpanded(msg.id, !self.isExpanded(msg.id)); });
      body.appendChild(more);
    }

    turn.appendChild(body);
    turn.appendChild(global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage()
    }));

    /* Anything that would be a SECOND card becomes a link into a sheet instead. That rule
     * is the entire experiment, so it is applied without exception. */
    var links = this.buildLinks(msg);
    if (links) turn.appendChild(links);

    this.rendered[msg.id] = { el: turn, bodyEl: body };
    return turn;
  };

  T7.prototype.buildLinks = function (msg) {
    var self = this, u = U(), svc = this.ctx.services, items = [];
    var group = svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : msg.activityGroup;
    if (group) items.push({ label: svc.surfaces.condenseLabel(group), kind: 'activity', group: group });
    if (msg.thoughtSegments && msg.thoughtSegments.length) items.push({ label: 'Reasoning summary', kind: 'thought', segs: msg.thoughtSegments });
    if (msg.completedQuestionnaire) items.push({ label: 'Answered question', kind: 'q', q: msg.completedQuestionnaire });
    if (!items.length) return null;

    var row = u.el('div', { class: 't7-links' });
    items.forEach(function (it) {
      var b = u.el('button', { class: 't7-link' }, [
        self.ctx.services.icons.get('chevron-right', 11),
        u.el('span', { text: it.label })
      ]);
      self._on(b, 'click', function (ev) {
        svc.popup.open({
          anchorEl: ev.currentTarget, kind: 'panel', width: 320,
          build: function (host) { self.detail(host, it); }
        });
      });
      row.appendChild(b);
    });
    return row;
  };

  T7.prototype.detail = function (host, it) {
    var u = U();
    host.appendChild(u.el('div', { class: 't7-sheet-title', text: it.label }));
    var list = u.el('div', { class: 't7-sheet-list pmx-scroll' });
    if (it.kind === 'activity') {
      this.ctx.services.surfaces.activityStages(it.group).forEach(function (st) {
        list.appendChild(u.el('div', { class: 't7-sheet-row' }, [
          u.el('span', { class: 't7-sheet-k', text: F().label(st.kind) }),
          u.el('span', { class: 't7-sheet-v', text: st.label || '' })
        ]));
      });
    } else if (it.kind === 'thought') {
      it.segs.forEach(function (s) {
        list.appendChild(u.el('div', { class: 't7-sheet-row' }, [
          u.el('span', { class: 't7-sheet-k', text: F().label(s.status) }),
          u.el('span', { class: 't7-sheet-v', text: s.summary || s.label || '' })
        ]));
      });
    } else {
      (it.q.questionsAndAnswers || []).forEach(function (qa) {
        list.appendChild(u.el('div', { class: 't7-sheet-row' }, [
          u.el('span', { class: 't7-sheet-k', text: qa.question }),
          u.el('span', { class: 't7-sheet-v', text: qa.answer })
        ]));
      });
    }
    host.appendChild(list);
    if (it.kind === 'thought') {
      host.appendChild(u.el('div', { class: 't7-sheet-foot', text: 'Provider-exposed summary only.' }));
    }
  };

  T7.prototype.lastMessage = function () { var m = this.ctx.data.messagesFor(this.tid()); return m[m.length - 1]; };

  /* ---------------------------------------------------------------- work: one status card, one bar
   *
   * The matrix assigns this concept a LEVEL-ONE STATUS CARD with a SEGMENTED PHASE BAR: the bar greys and
   * the head reads `Complete - 22m` when the work is done, each segment is a button, and a segment opens
   * a detail SHEET - never a nested card.
   *
   * The nesting rule is the concept's whole discipline: one level of nesting, no more. That is why the
   * five inert cards this replaces were wrong in a way that is easy to miss - they were siblings, which
   * is legal, but five sibling cards for one run is five things claiming to be the subject. One card with
   * a phase bar is ONE thing with parts, and parts open sheets because a card inside a card is the one
   * move this concept has forbidden itself.
   */
  T7.prototype.renderSurfaces = function () {
    var self = this, u = U();
    var svc = this.ctx.services;
    /* See renderQuestion: a destroyed instance paints nothing, because the region it paints into now
     * belongs to whatever replaced it. */
    if (this._dead) return;
    var host = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
    if (!host) return;
    u.empty(host);

    /* Ask the flow, not the yield flag: this runs BEFORE renderQuestion on every pass. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    var a = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());

    /* The RUN as a record: which phases were entered and in what order, which one is running, what each
     * one counts, and which one the reader has open. Three guards because all three states are real and
     * each means something different — the service may not be present at all, `read` returns null on a
     * thread that has no authored activity stages, and a run that has not started yet has nothing to
     * say. In every one of those cases the capsule renders NOTHING, because an empty frame announcing
     * "no activity" is reserved space for a surface that is not active. */
    var run = null;
    if (!pendingQuestion && svc.runtrace && svc.runtrace.read) {
      run = svc.runtrace.read(this.tid());
      if (run && !run.started) run = null;
    }

    function each(val) { return val == null ? [] : (Object.prototype.toString.call(val) === '[object Array]' ? val : [val]); }

    /* ---- the segments. Each is one part of the run, and each opens a sheet. */
    var segments = [];

    if (a && a.goal) {
      var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(a.goal) : null;
      segments.push({
        key: 'goal', label: 'Goal',
        value: phase ? (phase.index + '/' + phase.total) : F().label(a.goal.status),
        state: a.goal.status === 'blocked' ? 'blocked' : (a.goal.status === 'complete' ? 'complete' : 'working'),
        sheet: function (h, api) { self._sheetGoal(h, a.goal, api); }
      });
    }

    if (a && a.todo) {
      var items = a.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
      var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
      segments.push({
        key: 'todo', label: 'Todo', value: done + '/' + items.length,
        state: blocked ? 'blocked' : (done === items.length ? 'complete' : 'working'),
        sheet: function (h) { self._sheetTodo(h, a.todo); }
      });
    }

    each(a && a.subagents).forEach(function (g, n) {
      var c = g.counts || {};
      segments.push({
        key: 'agents' + (n || ''), label: 'Agents',
        value: String((c.working || 0) + (c.complete || 0) + (c.blocked || 0) + (c.queued || 0) + (c.failed || 0) + (c.waiting || 0)),
        state: c.blocked ? 'blocked' : (c.working ? 'working' : 'complete'),
        sheet: function (h) { self._sheetAgents(h, g); }
      });
    });

    /* Activity is ONE segment carrying six kinds; six segments would turn the bar into a list.
     *
     * It stands down entirely once the RUN has started, because the run bar below states the same
     * stages with more truth in them — entry order, tense, live counts and random access into each
     * one. Keeping both would put two controls in one card for one fact, and the flatter of the two
     * would be the one that cannot say which phase is running. */
    var stages = (thread && thread.activityStages) || [];
    if (stages.length && !run) {
      segments.push({
        key: 'activity', label: 'Steps', value: String(stages.length), state: 'complete',
        sheet: function (h) { self._sheetStages(h, stages); }
      });
    }

    each(a && a.diffs).forEach(function (g, n) {
      var files = g.files || [];
      var add = 0, rem = 0;
      files.forEach(function (f) { add += f.added || 0; rem += f.removed || 0; });
      segments.push({
        key: 'diff' + (n || ''), label: 'Changes', value: '+' + add + ' \u2212' + rem, state: 'complete',
        sheet: function (h) { self._sheetDiff(h, g); }
      });
    });

    var verified = this._verificationRecord();
    if (verified) {
      segments.push({
        key: 'verify', label: 'Verified', value: F().duration(verified.workedSeconds), state: 'complete',
        sheet: function (h) {
          h.appendChild(u.el('div', { class: 't7-sheet-title', text: 'Verification' }));
          h.appendChild(u.el('div', { class: 't7-sheet-row' }, [
            u.el('span', { class: 't7-sheet-k', text: F().label(verified.result || 'passed') }),
            u.el('span', { class: 't7-sheet-v', text: verified.note })
          ]));
        }
      });
    }

    /* A started run is enough on its own to make the status card worth drawing: the Steps segment
     * stood down for it, so testing the segment count alone would hide the run the moment it became
     * the only thing this card had to report. */
    if (!segments.length && !run && !pendingQuestion) {
      /* Nothing live: render nothing. No empty card reserving space. */
      this._handoffHost = u.el('div', { class: 't7-handoff-host' });
      host.appendChild(this._handoffHost);
      this._renderHandoff(this._handoffHost);
      return;
    }

    /* Activity, verification and advice are read straight off the thread rather than through
     * `activeFor`, so without this guard they survive the yield and leave a partial cluster beside the
     * question. The work surfaces yield as ONE thing or the yield means nothing. */
    if ((segments.length || run) && !pendingQuestion) {
      var group = a ? a.activity : null;
      var complete = !!(group && group.status === 'complete');

      var card = u.el('div', { class: 't7-status', data: { complete: complete ? '1' : '0' } });

      /* ---- the head. When the work finishes it reads `Complete - 22m`, which is a different statement
       * from a live head, not a shortened one. */
      var head = u.el('div', { class: 't7-status-head' });
      var headText = u.el('span', { class: 't7-status-title' });
      var live = segments.filter(function (s) { return s.state === 'working'; }).length;
      var blocked = segments.filter(function (s) { return s.state === 'blocked'; }).length;
      /* A running PHASE is working even when no surface segment says so - with the Steps segment stood
       * down, a run on its own would otherwise have the card announcing `Idle` over a live capsule. */
      var text = complete
        ? ('Complete \u00b7 ' + (group.workedSeconds != null ? F().duration(group.workedSeconds) : F().duration(0)))
        : (blocked ? 'Blocked' : ((live || (run && run.running)) ? 'Working' : 'Idle'));
      if (svc.motion && svc.motion.swapText) svc.motion.swapText(headText, text);
      else headText.textContent = text;
      head.appendChild(headText);

      if (complete) {
        var toolLabel = svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : ((group.stages || []).length + ' steps');
        head.appendChild(u.el('span', { class: 't7-status-sub', text: toolLabel }));
      }
      card.appendChild(head);

      /* ---- the bar. Segments are buttons; each opens a SHEET, never a nested card. */
      var bar = u.el('div', { class: 't7-bar' });
      segments.forEach(function (seg) {
        var b = u.el('button', {
          class: 't7-seg', type: 'button',
          data: { kind: seg.key, state: seg.state },
          aria: { label: seg.label + ', ' + seg.value }
        });
        b.appendChild(u.el('span', { class: 't7-seg-label', text: seg.label }));
        var valEl = u.el('span', { class: 't7-seg-value' });
        /* In place: a segment whose count changes must not re-enter the bar, or the deck of segments
         * reshuffles on every tick. */
        if (svc.motion && svc.motion.swapText) svc.motion.swapText(valEl, seg.value);
        else valEl.textContent = seg.value;
        b.appendChild(valEl);
        self._on(b, 'click', function (ev) {
          svc.popup.open({
            anchorEl: ev.currentTarget, kind: 'panel', width: 340,
            build: function (h, api) { seg.sheet(h, api); }
          });
        });
        bar.appendChild(b);
      });
      /* An empty bar is a rule with nothing under it, so it is simply not drawn. */
      if (segments.length) card.appendChild(bar);

      /* ---- the run. A second bar in the same card rather than a second card: the run and the
       * surfaces are two readings of ONE piece of work, and giving each its own card would put two
       * things in the transcript both claiming to be the subject. Flat inside the card, so the one
       * level of nesting this concept allows is still the only one. */
      if (run) card.appendChild(this._buildRunCapsule(run));

      /* ---- BSD as a FLAT LINK inside the status card, per the matrix. A link, not a segment: advice is
       * not a phase of the work, and not a nested card either. */
      var bsd = svc.bsd;
      var advice = (bsd && bsd.advice) ? (bsd.advice(this.tid()) || []) : [];
      if (advice.length) {
        var cautions = advice.filter(function (x) { return x.severity === 'caution'; }).length;
        var link = u.el('button', {
          class: 't7-status-link', type: 'button',
          data: { severity: cautions ? 'caution' : 'note' }
        });
        link.appendChild(u.el('span', {
          class: 't7-status-link-text',
          text: 'Back Seat Driver \u00b7 ' + (cautions
            ? (cautions + (cautions === 1 ? ' caution' : ' cautions'))
            : (advice.length + (advice.length === 1 ? ' note' : ' notes')))
        }));
        this._on(link, 'click', function (ev) {
          svc.popup.open({
            anchorEl: ev.currentTarget, kind: 'panel', width: 340,
            build: function (h) { self._sheetAdvice(h, advice); }
          });
        });
        card.appendChild(link);
      }

      host.appendChild(card);
    }

    this._handoffHost = u.el('div', { class: 't7-handoff-host' });
    host.appendChild(this._handoffHost);
    this._renderHandoff(this._handoffHost);
  };

  T7.prototype._verificationRecord = function () {
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].verification) return msgs[i].verification;
    return null;
  };

  /* ---------------------------------------------------------------- the run capsule
   *
   * t7's reading of `reference/videos/03_compact_execution_activity.mov`. The five behaviours the
   * recording turns up are carried over as BEHAVIOUR; its colours, radii and easing are not.
   *
   * The concept's own answer to each:
   *
   *   1. THE CHAIN IS AN INDEX (f.208, f.390, f.780, f.910; reopened at f.1170 and f.1300). The
   *      reference spends one glyph per finished phase. This concept already owns a control that is
   *      exactly that shape — the SEGMENTED PHASE BAR — so the chain IS a second bar of segments, one
   *      per entered phase, in entry order, each a real button that reopens THAT phase.
   *   2. THE COUNT IS REWRITTEN IN PLACE (f.208 -> f.286 -> f.338). The count is the segment's VALUE,
   *      which is the slot a t7 segment already puts its number in, and it is morphed rather than
   *      swapped. See `_runMorph` for what that took.
   *   3. THE VERB CHANGES TENSE ON SETTLE (f.194 vs f.1170). The segment's label is the verb and it
   *      carries the tense; the count beside it is the argument and is muted, so a reader scanning the
   *      bar reads a row of verbs.
   *   4. CONDENSE IS THE RESTING STATE (f.910). At rest the line above the bar reads `13 tools used`
   *      and every phase is still one click away.
   *   5. THE CHAIN SCROLLS, IT DOES NOT TRUNCATE. A segment rolled off the left is still reachable,
   *      because the segment IS the route back to its phase.
   *
   * WHAT IS DELIBERATELY NOT THE REFERENCE'S: where the recording stacks the reopened phase's rows
   * BENEATH the headline, this concept opens them in a SHEET. A card inside a card is the one move t7
   * has forbidden itself, and rows stacked inside the status card would be exactly that in all but
   * name. Random access is preserved; containment is this concept's, not the reference's.
   */

  /* How long a line stays FRESH, in ms. See `_runMorph`: it is the window inside which a rebuild of
   * the capsule re-issues the count morph rather than writing the new text flat. It has to outlast the
   * fact that ONE activity verb reaches this concept as TWO renders — `view.runtrace` from the trace's
   * own announce and `view.surfaces` from the Director's touch straight after it. countMorph itself
   * runs for 220ms, so a window shorter than that keeps a genuinely later render from restarting an
   * animation that is already most of the way through. */
  var RUN_MORPH_FRESH_MS = 180;

  /* What the capsule last SAID, per span. Not a fact about the run and therefore not on the store: it
   * is a fact about the last paint of an element this concept threw away. Keyed by thread id, because
   * a sentence from another thread is not a previous state of this one. */
  T7.prototype._runMemo = function () {
    var tid = this.tid();
    if (!this._runMemoState || this._runMemoState.tid !== tid) {
      this._runMemoState = { tid: tid, text: {} };
    }
    return this._runMemoState;
  };

  /* countMorph, never swapText: `6 files` becoming `7 files` has to move the digits and leave the word
   * `files` in the layout box it already had (f.208 -> f.338). Cross-fading the whole value reads as
   * the segment being replaced, which is the difference between a running tally and a series of
   * different labels. countMorph falls back to a label swap on its own when the WORDS changed too,
   * which is the honest outcome — at that point the sentence really did change.
   *
   * The memo is what makes the morph real here. This concept empties and rebuilds its whole surface
   * host on every view change, so the span handed to countMorph is always brand new and EMPTY; with no
   * remembered previous string countMorph would take its entrance path every single time and no digit
   * would ever move. Seeding the span with what the segment said last is half of it; the freshness
   * window is the other half, because the second of the two renders finds the text unchanged and would
   * otherwise discard the element carrying the animation a fraction of a millisecond after building
   * it. Outside the window the text is written flat: animating 7 into 7 on an unrelated re-render
   * would claim work the run did not do. */
  T7.prototype._runMorph = function (el, key, next) {
    var motion = this.ctx.services.motion;
    var memo = this._runMemo();
    var slot = memo.text[key] || (memo.text[key] = { text: null, from: null, at: 0 });
    var now = Date.now();
    if (slot.text !== next) { slot.from = slot.text; slot.text = next; slot.at = now; }
    var from = slot.from;
    if (from == null || from === next || (now - slot.at) > RUN_MORPH_FRESH_MS
        || !motion || !motion.countMorph) {
      el.textContent = next;
      return;
    }
    el.textContent = from;
    motion.countMorph(el, next);
  };

  /* The segment's value: the count and its unit, `7 files`, `1 page`, `18 checks`.
   *
   * The singular is taken from the trace's own `withCount` rather than restated here. `1 files` is the
   * exact tell that a number was substituted into a fixed string, and two implementations of one
   * grammar rule eventually disagree about which of them is right. */
  T7.prototype._runCountText = function (p) {
    if (p.count == null) return '';
    if (!p.unit) return String(p.count);
    var rt = this.ctx.services.runtrace;
    if (rt && rt.withCount) {
      var out = rt.withCount('0 ' + p.unit, p.count, p.unit);
      if (out) return out;
    }
    return p.count + ' ' + p.unit;
  };

  /* The subject of the run's sentence: whatever the reader opened, else whatever is running, else the
   * last thing the run did. Derived in ONE place because the deferred second beat of a handover has to
   * answer the same question the build answered, and two copies of that rule would drift apart the
   * first time either was touched. */
  T7.prototype._runSubjectOf = function (run) {
    if (!run) return null;
    return run.open || run.running || (run.chain.length ? run.chain[run.chain.length - 1] : null);
  };

  /* How long a handover may sit between its beats before the build stops waiting for it, in ms.
   * Generous next to the 110ms + 180ms the primitive actually takes, because the only thing this
   * number decides is when a beat that will NEVER land - a tab that was backgrounded mid-run, a timer
   * the page never got to - stops costing the chain a segment. */
  var HANDOVER_STUCK_MS = 900;

  /* What the chain has already PAINTED, per thread: which phases have a segment on screen, whose
   * sentence the head last carried, and whether a handover is currently between its two beats.
   *
   * Keyed by thread id for the same reason `_runMemo` is - a run in another thread is not a previous
   * state of this one - and pruned against the live chain on every read, so a reset that empties the
   * run leaves nothing behind claiming to have been painted. */
  T7.prototype._runChainMemo = function (run) {
    var tid = this.tid();
    if (!this._runChainState || this._runChainState.tid !== tid) {
      this._runChainState = { tid: tid, seen: {}, subjectId: null, pending: null };
    }
    var memo = this._runChainState;
    if (!run) return memo;

    var wanted = {}, id;
    run.chain.forEach(function (p) { wanted[p.id] = true; });
    for (id in memo.seen) {
      if (Object.prototype.hasOwnProperty.call(memo.seen, id) && !wanted[id]) delete memo.seen[id];
    }
    if (memo.subjectId && !wanted[memo.subjectId]) memo.subjectId = null;
    if (memo.pending && !wanted[memo.pending.id]) memo.pending = null;
    return memo;
  };

  /* One segment of the chain: a phase, as a button that reopens it. Factored out of the build because
   * the second beat of a handover inserts exactly one of these, into the bar the build produced. */
  T7.prototype._buildRunSeg = function (p) {
    var self = this, u = U(), svc = this.ctx.services;
    /* Every segment lives in its own slot, so the bar has a box whose width can be opened when a phase
     * hands over (f.205-209). Without the slot there is nothing to animate and the bar jumps by a
     * segment's width. */
    var slot = u.el('span', { class: 'pmx-chain-slot' });
    var btn = u.el('button', {
      class: 't7-run-seg', type: 'button', title: p.headline,
      data: { kind: p.kind, state: p.status, open: p.open ? '1' : '0', phase: p.id },
      aria: { expanded: p.open ? 'true' : 'false', label: p.headline }
    });
    var label = u.el('span', { class: 't7-run-seg-label' });
    if (svc.icons) label.appendChild(svc.icons.get(p.glyph, 11));
    /* Present participle while it runs, past tense once it has settled. Both strings are authored on
     * the stage because a participle is not mechanically derivable from a past-tense verb; the trace
     * picks between them and this only prints what it chose. */
    label.appendChild(u.el('span', { class: 't7-run-seg-verb', text: p.verb }));
    btn.appendChild(label);
    var val = u.el('span', { class: 't7-run-seg-value' });
    this._runMorph(val, 'seg:' + p.id, this._runCountText(p));
    btn.appendChild(val);
    this._on(btn, 'click', function () { self._openPhaseSheet(p.id); });
    /* Kept so the sheet can anchor to the segment the render AFTER the click produced; the one that
     * was clicked no longer exists by then. */
    this._runSegs[p.id] = btn;
    slot.appendChild(btn);
    return { slot: slot, btn: btn };
  };

  T7.prototype._buildRunCapsule = function (run) {
    var self = this, u = U(), svc = this.ctx.services;
    var open = run.open;
    var subject = this._runSubjectOf(run);
    var resting = run.condensed && !open;

    var memo = this._runChainMemo(run);
    if (memo.pending && (Date.now() - memo.pending.at) > HANDOVER_STUCK_MS) {
      memo.seen[memo.pending.id] = true;
      memo.pending = null;
    }
    var pending = memo.pending;

    /* ---- THE HANDOVER'S CAUSAL ORDER, 03_compact_execution_activity.mov f.194-211.
     *
     * The recording is explicit that this is TWO beats and that their order carries the meaning: at
     * f.198-200 the finishing phase lets go of its sentence while its glyph stays, and only at
     * f.205-209 does the arriving phase's glyph appear. Said in that order it reads as "the work moved
     * on, and what it did is still here"; said as one cross-fade it reads as the row being replaced,
     * which loses the fact that the finished phase SURVIVES as an index entry.
     *
     * What this concept does NOT take from the reference is the lateral push. There the new glyph
     * opens its slot BETWEEN the old glyph and the label, so the label is pushed right by exactly one
     * slot and the sentence visibly moves. Here the chain is a bar BELOW the sentence and the arriving
     * segment is appended at its END, so its slot opening grows the new segment into place and pushes
     * nothing: the sentence above it does not move and could not be moved by it. Copying the push into
     * this geometry would be decoration - motion that looks like the reference while saying nothing.
     * What is carried over is the ORDER, which is the part that means anything.
     *
     * `phaseHandover` is still the driver, because the slot and its timing are the shared chain's
     * contract; the head's own halves are cleared here so both parts of the sentence let go together,
     * exactly as the reference fades label and reasoning text together at f.198-200. */
    var last = run.chain.length ? run.chain[run.chain.length - 1] : null;
    var arriving = null;
    if (!pending && last && !memo.seen[last.id] && memo.subjectId && memo.subjectId !== last.id
        && !resting && svc.motion && svc.motion.phaseHandover
        && !(svc.motion.reduced && svc.motion.reduced(this.root))) {
      /* A handover needs an OUTGOING sentence to let go of. The first paint of a run - and any paint
       * of a run that was already several phases long when this concept first saw it - has none, so
       * every segment is painted at once and nothing is deferred. Under reduced motion the same is
       * true by construction: there are no beats to put in order, only the end state. */
      arriving = last;
    }

    var cap = u.el('div', {
      class: 't7-run',
      data: { condensed: run.condensed ? '1' : '0', running: run.running ? '1' : '0' }
    });

    /* ---- the line above the bar: one sentence, rewritten in place.
     *
     * At rest it is the whole run stated as its total (`13 tools used`, f.910) with the time it took
     * beside it; disclosed, it is the subject phase's own verb and argument. */
    var head = u.el('button', {
      class: 't7-run-head', type: 'button',
      aria: { expanded: resting ? 'false' : 'true' }
    });
    var verbEl = u.el('span', { class: 't7-run-verb' });
    var argEl = u.el('span', { class: 't7-run-arg' });
    var verbText, argText;
    if (pending) {
      /* A rebuild BETWEEN the beats. renderSurfaces rebuilds this capsule on every view change and one
       * activity verb reaches this concept as two of them, so the state the first beat left has to be
       * reproduced rather than overwritten: the outgoing sentence has already let go, and beat two has
       * not written the new one yet. */
      verbText = '';
      argText = '';
    } else if (arriving) {
      /* Beat one is a CROSS-FADE out, so the head has to be built holding the sentence that is about
       * to be released - a head built empty would cut the sentence rather than let it go. The memo is
       * what the head last painted, which is exactly what is on screen at this instant. Its entries
       * are SLOTS - `{ text, from, at }` - and not strings; reading the slot itself put the object
       * through `String()` and printed `[object Object]` where the sentence should have been. */
      var said = this._runMemo().text;
      verbText = (said.verb && said.verb.text) || '';
      argText = (said.arg && said.arg.text) || '';
    } else {
      verbText = resting ? run.summaryLabel : (subject ? subject.verb : '');
      argText = resting
        ? (run.workedSeconds ? 'Worked for ' + F().duration(run.workedSeconds) : '')
        : (subject ? subject.argument : '');
    }
    this._runMorph(verbEl, 'verb', verbText);
    this._runMorph(argEl, 'arg', argText);
    head.appendChild(verbEl);
    head.appendChild(argEl);
    var chev = u.el('span', { class: 't7-run-chevron' });
    if (svc.icons) chev.appendChild(svc.icons.get(resting ? 'chevron-down' : 'chevron-up', 11));
    head.appendChild(chev);
    this._on(head, 'click', function () { self._toggleRun(cap, run); });
    cap.appendChild(head);

    /* ---- the bar. Each entered phase is one segment, in ENTRY ORDER — the order the run actually did
     * the work, which is the only order that makes a segment a landmark. A phase the run never reached
     * has no segment, because a segment here is a claim that the work happened. */
    var bar = u.el('div', { class: 't7-run-bar pmx-chain' });
    this._runSegs = {};
    var withheld = (pending && pending.id) || (arriving && arriving.id) || null;
    run.chain.forEach(function (p) {
      /* The phase that is arriving is NOT painted here. It is beat two, and beat two happens after the
       * outgoing sentence has let go. */
      if (withheld === p.id) return;
      bar.appendChild(self._buildRunSeg(p).slot);
      memo.seen[p.id] = true;
    });
    cap.appendChild(bar);

    /* The elements the deferred beat writes into. They are re-read from the instance rather than
     * closed over, because a rebuild between the beats replaces both and a closure would land the
     * arriving segment in a bar that is no longer in the document. */
    this._runBar = bar;
    this._runHeadEls = { verb: verbEl, arg: argEl };

    if (arriving) this._startRunHandover(arriving, bar, argEl, verbEl);

    /* The bar SCROLLS rather than truncating, and brings the phase being read back into view. The
     * reference caps its own chain at six and rolls the oldest off the left as a seventh phase starts
     * (f.910); the glyph is scrolled out, never dropped, because it is the only route back to that
     * phase and dropping it would silently make part of the run unreachable.
     *
     * A handover rolls the bar itself once its second beat has landed - rolling toward a segment that
     * has not been inserted yet would scroll to where it is about to be and then jump. */
    if (svc.motion && svc.motion.chainRoll && !arriving && !pending) {
      var into = (open && this._runSegs[open.id])
        || (run.running && this._runSegs[run.running.id])
        || null;
      global.requestAnimationFrame(function () {
        if (bar.isConnected) svc.motion.chainRoll(bar, into ? { into: into } : null);
      });
    }

    if (!pending && !arriving) memo.subjectId = subject ? subject.id : null;

    return cap;
  };

  /* The two beats themselves.
   *
   * Beat one is the head letting go: both halves cross-fade to nothing through `swapText`, whose own
   * 110ms cross-fade is also what `phaseHandover` waits between its beats, so the two agree by
   * construction rather than through a pair of constants somebody has to keep in step.
   *
   * Beat two is `insert()`, which the primitive calls once beat one has finished. It appends the
   * arriving segment to whichever bar is currently in the document and writes the new sentence in the
   * same turn: the reference lets its new label appear a few frames BEFORE the new glyph (f.201-203
   * against f.205-209), and this concept cannot reproduce that half without a third beat that would be
   * shorter than one frame at this timing. The order that matters - let go, then arrive - is intact;
   * the four-frame lead of the label over the glyph is not, and it is not worth pretending it is.
   *
   * The primitive is handed NO label element, and that is deliberate rather than lazy. Its `labelEl`
   * is a label whose final text it owns: it cross-fades it on beat one and writes that same string
   * again in its cleanup, which is exactly right for the outgoing chip in a concept whose glyph and
   * label are one object. Here the label is the head above the bar and its final text is the ARRIVING
   * phase's sentence, so handing it over with a target of '' would have the cleanup wipe the sentence
   * beat two had just written, about 220ms after it appeared. What is wanted from the primitive is the
   * slot mechanics and the spacing of the beats; the sentence is this concept's own. */
  T7.prototype._startRunHandover = function (arriving, bar, argEl, verbEl) {
    var self = this, svc = this.ctx.services;
    var memo = this._runChainMemo(null);
    var landed = false;

    memo.pending = { id: arriving.id, at: Date.now(), handle: null };

    function insert() {
      if (landed) return null;
      landed = true;
      var into = (self._runBar && self._runBar.isConnected) ? self._runBar : bar;
      var run = (svc.runtrace && svc.runtrace.read) ? svc.runtrace.read(self.tid()) : null;
      /* Re-read rather than trusted: 110ms is long enough for the phase to have ticked its count, or
       * for the reader to have opened another phase, and beat two must state what is true now. */
      var phase = null;
      if (run) {
        for (var i = 0; i < run.chain.length; i++) if (run.chain[i].id === arriving.id) phase = run.chain[i];
      }
      memo.pending = null;
      memo.seen[arriving.id] = true;
      if (!phase || !into || !into.isConnected) return null;

      var made = self._buildRunSeg(phase);
      into.appendChild(made.slot);

      var subject = self._runSubjectOf(run);
      var resting = run.condensed && !run.open;
      var head = self._runHeadEls || { verb: verbEl, arg: argEl };
      self._runMorph(head.verb, 'verb', resting ? run.summaryLabel : (subject ? subject.verb : ''));
      self._runMorph(head.arg, 'arg', resting
        ? (run.workedSeconds ? 'Worked for ' + F().duration(run.workedSeconds) : '')
        : (subject ? subject.argument : ''));
      memo.subjectId = subject ? subject.id : null;
      return made.btn;
    }

    /* Beat one. Both halves let go together, which is what the reference does at f.198-200 with the
     * label and the reasoning text under it. */
    if (svc.motion.swapText) {
      svc.motion.swapText(verbEl, '');
      svc.motion.swapText(argEl, '');
    } else {
      verbEl.textContent = '';
      argEl.textContent = '';
    }

    memo.pending.handle = svc.motion.phaseHandover(bar, null, insert, '')
      .then(function () {
        var seg = self._runSegs ? self._runSegs[arriving.id] : null;
        var into = (self._runBar && self._runBar.isConnected) ? self._runBar : null;
        if (into && svc.motion.chainRoll) svc.motion.chainRoll(into, seg ? { into: seg } : null);
      });
  };

  /* One control, three meanings, in the order a reader means them: dismiss what is open, disclose a
   * condensed run, condense a live one. */
  T7.prototype._toggleRun = function (cap, run) {
    var svc = this.ctx.services;
    var tid = this.tid();
    if (!svc.runtrace) return;
    if (run.open) {
      svc.runtrace.close(tid);
      /* The sheet was the disclosure of that phase, so dismissing the phase dismisses the sheet. */
      if (svc.popup && svc.popup.closeAll) svc.popup.closeAll(null);
      return;
    }
    if (run.condensed) {
      /* groupReopen is the right primitive for this and it is called here, but be clear about what it
       * can and cannot do in this concept. Its FLIP measures the siblings below the capsule, runs the
       * mutation, and plays them from their old positions — and the mutation here re-enters
       * `renderSurfaces`, which empties the whole host, so every node it measured is detached by the
       * time it looks again and it correctly skips them. The disclosure is therefore instant rather
       * than carried, and it would start being carried the day this concept stops rebuilding its
       * surface host wholesale. Where the primitive DOES do its work in t7 is inside the phase sheet,
       * which is not rebuilt: see `_sheetPhase`. */
      if (svc.motion && svc.motion.groupReopen) {
        svc.motion.groupReopen(cap, function () { svc.runtrace.open(tid); });
      } else {
        svc.runtrace.open(tid);
      }
      return;
    }
    svc.runtrace.condense(tid);
  };

  /* RANDOM ACCESS back into a finished run, in this concept's containment rule: the phase is opened on
   * the RECORD, and its detail opens as a sheet rather than unfolding inside the card.
   *
   * The order here is forced and worth stating. `runtrace.open` announces, the announce re-enters
   * `update` synchronously, and `renderSurfaces` rebuilds the bar — so by the time this line returns
   * the button that was clicked has been removed from the document. Anchoring the sheet to it would
   * place a popup against a detached element, which `place()` refuses and `retrack` then closes. The
   * anchor is therefore looked up again from the bar the re-render just produced. */
  T7.prototype._openPhaseSheet = function (phaseId) {
    var self = this, svc = this.ctx.services;
    if (!svc.runtrace || !svc.runtrace.open || !svc.popup) return;
    var tid = this.tid();
    svc.runtrace.open(tid, phaseId);

    var run = svc.runtrace.read(tid);
    /* `open` TOGGLES, so clicking the segment whose sheet is showing closes the phase. One control
     * both discloses and dismisses, and the reader never has to hunt for a separate close. */
    if (!run || run.openId !== phaseId) {
      if (svc.popup.closeAll) svc.popup.closeAll(null);
      return;
    }
    var anchor = this._runSegs ? this._runSegs[phaseId] : null;
    if (!anchor || !anchor.isConnected) return;

    /* One frame before opening, and this was measured rather than guessed. `place()` positions the
     * sheet from the anchor's rect and REFUSES a rect it cannot use, removing the popup again in the
     * same task; opening in the same turn as the rebuild produced exactly that refusal often enough
     * to be reproducible, and inserting a forced layout read before the click made it stop. Waiting a
     * frame lets the rebuilt bar be laid out before anything is measured against it, which is the
     * same reason chainRoll below waits one. */
    global.requestAnimationFrame(function () {
      if (!anchor.isConnected) return;
      svc.popup.open({
        anchorEl: anchor, kind: 'panel', width: 340,
        build: function (h, api) { self._sheetPhase(h, run.open, api); }
      });
    });
  };

  /* The normalized operation record for a phase. PMXOpCard owns the operation fields — command,
   * provider, cache, permission, cost, input — and reads provider and permission from the LIVE route
   * and access services, so switching route or narrowing the profile changes what this sheet says.
   * Re-deriving any of it here is how two surfaces start disagreeing about the same operation. */
  T7.prototype._opRecordFor = function (phaseId) {
    var svc = this.ctx.services;
    if (!svc.opcard || !svc.opcard.forThread) return null;
    var list = [];
    try { list = svc.opcard.forThread(this.ctx, this.tid()) || []; } catch (e) { list = []; }
    for (var i = 0; i < list.length; i++) if (list[i].id === phaseId) return list[i];
    return null;
  };

  /* ---- sheets. All of them are popups: this concept allows one nesting level, and a card inside the
   * status card would be the second. */

  /* The reopened phase, as a sheet. This is where the reference's stacked rows live in t7, and it is
   * also the only place in this concept where an operation record has ever been readable. */
  T7.prototype._sheetPhase = function (host, phase, api) {
    var self = this, u = U(), svc = this.ctx.services;
    var rec = this._opRecordFor(phase.id);

    host.appendChild(u.el('div', { class: 't7-sheet-title', text: phase.headline }));

    var meta = u.el('div', { class: 't7-run-meta' });
    meta.appendChild(u.el('span', {
      class: 't7-run-status', data: { state: phase.running ? 'running' : 'done' },
      text: rec ? rec.statusLabel : (phase.running ? 'RUNNING' : 'COMPLETED')
    }));
    /* A duration is printed only once the phase is DONE. `durationMs` is how long the stage took, so
     * stating it beside a phase that is still running would report a measurement not yet made. */
    if (!phase.running && phase.durationMs) {
      meta.appendChild(u.el('span', {
        class: 't7-run-dur', text: F().duration(Math.round(phase.durationMs / 1000))
      }));
    }
    host.appendChild(meta);

    /* The `why` first, because it is the only line that says whether the operation should have run at
     * all. The stage's own detail is the fallback for a phase that carries no operation record. */
    var why = (rec && rec.why) || phase.detail;
    if (why) host.appendChild(u.el('p', { class: 't7-run-why', text: why }));

    /* ---- the operation record, disclosed rather than dumped.
     *
     * This is where `motion.groupReopen` applies EXACTLY as the reference means it, and it is the only
     * place in t7 that it can: the record grows inside the sheet and the per-file rows and the chips
     * below it are carried down as one block rather than replaced (f.910). The card itself cannot host
     * that expansion, because rows stacked under the head would be the nested card this concept has
     * forbidden itself. */
    if (rec && rec.fields && rec.fields.length) {
      var record = u.el('div', { class: 't7-run-record' });
      var fields = u.el('div', { class: 't7-run-fields' });
      var shown = false;

      var toggle = u.el('button', { class: 't7-run-disclose', type: 'button', aria: { expanded: 'false' } });
      toggle.appendChild(u.el('span', { text: 'Operation record' }));
      var mark = u.el('span', { class: 't7-run-chevron' });
      if (svc.icons) mark.appendChild(svc.icons.get('chevron-down', 11));
      toggle.appendChild(mark);

      var paint = function () {
        u.empty(fields);
        if (!shown) return;
        for (var i = 0; i < rec.fields.length; i++) {
          fields.appendChild(u.el('div', { class: 't7-run-field' }, [
            u.el('span', { class: 't7-run-field-k', text: rec.fields[i].key }),
            u.el('span', { class: 't7-run-field-v', text: rec.fields[i].value })
          ]));
        }
      };

      this._on(toggle, 'click', function () {
        shown = !shown;
        toggle.setAttribute('aria-expanded', shown ? 'true' : 'false');
        u.empty(mark);
        if (svc.icons) mark.appendChild(svc.icons.get(shown ? 'chevron-up' : 'chevron-down', 11));
        if (svc.motion && svc.motion.groupReopen) svc.motion.groupReopen(record, paint);
        else paint();
        /* The sheet is positioned against its segment, so a sheet that grew without re-placing would
         * run off whichever edge it opened toward. */
        if (api && api.resize) api.resize();
      });

      record.appendChild(toggle);
      record.appendChild(fields);
      host.appendChild(record);
    }

    /* ---- one line per unit of work the phase did. The trace carries the authored rows; the record
     * carries the same list, so either source answers and neither is invented here. */
    var rows = (rec && rec.rows && rec.rows.length) ? rec.rows : phase.rows;
    if (rows && rows.length) {
      var list = u.el('div', { class: 't7-sheet-list pmx-scroll' });
      rows.forEach(function (r) {
        var row = u.el('div', { class: 't7-sheet-row' }, [
          u.el('span', { class: 't7-sheet-k', text: r.verb || '' }),
          u.el('span', { class: 't7-sheet-v', text: r.target || r.label || '' })
        ]);
        if (r.added != null || r.removed != null) {
          row.appendChild(u.el('span', {
            class: 't7-run-delta', text: '+' + (r.added || 0) + ' \u2212' + (r.removed || 0)
          }));
        }
        list.appendChild(row);
      });
      host.appendChild(list);
    }

    if (rec && rec.chips && rec.chips.length) {
      var chips = u.el('div', { class: 't7-run-chips' });
      rec.chips.forEach(function (chip) {
        /* The runtime artifact is the one chip that GOES somewhere, and it goes through the artifact
         * service the handoff card already uses rather than through a second path of its own. */
        if (chip.kind === 'artifact' && chip.artifactId && svc.artifacts) {
          var b = u.el('button', { class: 't7-act', type: 'button', text: chip.label });
          self._on(b, 'click', function () {
            svc.artifacts.open(chip.artifactId);
            if (svc.artifacts.forceReady) svc.artifacts.forceReady(chip.artifactId);
            if (api && api.close) api.close();
          });
          chips.appendChild(b);
          return;
        }
        chips.appendChild(u.el('span', { class: 't7-run-chip', text: chip.label }));
      });
      host.appendChild(chips);
    }
  };

  T7.prototype._sheetGoal = function (host, goal, api) {
    var self = this, u = U();
    var svc = this.ctx.services;
    host.appendChild(u.el('div', { class: 't7-sheet-title', text: goal.title || 'Goal' }));
    if (goal.objective) host.appendChild(u.el('div', { class: 't7-sheet-row' }, [
      u.el('span', { class: 't7-sheet-k', text: 'Objective' }),
      u.el('span', { class: 't7-sheet-v', text: goal.objective })
    ]));
    if (goal.status === 'blocked' && goal.blocker) {
      var b = goal.blocker;
      [['Cause', b.cause], ['Affected', b.affectedScope], ['Tried', b.lastAttemptedRecovery],
       ['Stopped because', b.whyRecoveryStopped], ['Next safe action', b.nextSafeAction]].forEach(function (r) {
        if (!r[1]) return;
        host.appendChild(u.el('div', { class: 't7-sheet-row' }, [
          u.el('span', { class: 't7-sheet-k', text: r[0] }),
          u.el('span', { class: 't7-sheet-v', text: r[1] })
        ]));
      });
    }
    var acts = u.el('div', { class: 't7-sheet-foot' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (action) {
      if (svc.surfaces.canAct && !svc.surfaces.canAct(goal, action)) return;
      var btn = u.el('button', { class: 't7-act', type: 'button', text: action.charAt(0).toUpperCase() + action.slice(1) });
      self._on(btn, 'click', function () {
        svc.surfaces.act(self.tid(), action);
        if (api && api.close) api.close();
      });
      acts.appendChild(btn);
    });
    if (acts.childNodes.length) host.appendChild(acts);
  };

  T7.prototype._sheetTodo = function (host, todo) {
    var u = U();
    host.appendChild(u.el('div', { class: 't7-sheet-title', text: 'Tasks' }));
    var list = u.el('div', { class: 't7-sheet-list pmx-scroll' });
    (todo.items || []).forEach(function (it) {
      list.appendChild(u.el('div', { class: 't7-sheet-row' }, [
        u.el('span', { class: 't7-sheet-k', text: F().label(it.state) }),
        u.el('span', { class: 't7-sheet-v', text: it.label })
      ]));
    });
    host.appendChild(list);
  };

  T7.prototype._sheetAgents = function (host, group) {
    var u = U();
    host.appendChild(u.el('div', { class: 't7-sheet-title', text: group.label || 'Agents' }));
    var list = u.el('div', { class: 't7-sheet-list pmx-scroll' });
    (group.agents || []).forEach(function (ag) {
      list.appendChild(u.el('div', { class: 't7-sheet-row' }, [
        u.el('span', { class: 't7-sheet-k', text: F().label(ag.status) }),
        u.el('span', { class: 't7-sheet-v', text: ag.name + ' \u2014 ' + (ag.currentActivity || ag.task || '') }),
        u.el('span', { class: 't7-sheet-k', text: ag.workedSeconds != null ? F().duration(ag.workedSeconds) : '' })
      ]));
    });
    host.appendChild(list);
  };

  T7.prototype._sheetStages = function (host, stages) {
    var u = U();
    host.appendChild(u.el('div', { class: 't7-sheet-title', text: 'Activity' }));
    var list = u.el('div', { class: 't7-sheet-list pmx-scroll' });
    stages.forEach(function (st) {
      list.appendChild(u.el('div', { class: 't7-sheet-row' }, [
        u.el('span', { class: 't7-sheet-k', text: F().label(st.kind) }),
        u.el('span', { class: 't7-sheet-v', text: st.label + (st.detail ? ' \u2014 ' + st.detail : '') }),
        u.el('span', { class: 't7-sheet-k', text: st.durationMs != null ? F().duration(Math.round(st.durationMs / 1000)) : '' })
      ]));
    });
    host.appendChild(list);
  };

  T7.prototype._sheetDiff = function (host, group) {
    var self = this, u = U();
    host.appendChild(u.el('div', { class: 't7-sheet-title', text: group.label || 'Changes' }));
    var list = u.el('div', { class: 't7-sheet-list pmx-scroll' });
    (group.files || []).forEach(function (f) {
      var row = u.el('button', { class: 't7-sheet-row', type: 'button' }, [
        u.el('span', { class: 't7-sheet-k', text: F().label(f.status) }),
        u.el('span', { class: 't7-sheet-v', text: f.path }),
        u.el('span', { class: 't7-sheet-k', text: '+' + (f.added || 0) + ' \u2212' + (f.removed || 0) })
      ]);
      self._on(row, 'click', function () {
        self.ctx.services.editorHost.openArtifact(
          { id: 'file-' + f.path, title: f.path, kind: 'file', projectPath: f.path }, self.ctx);
      });
      list.appendChild(row);
    });
    if (group.hiddenFileCount) {
      list.appendChild(u.el('div', { class: 't7-sheet-row' }, [
        u.el('span', { class: 't7-sheet-v', text: group.hiddenFileCount + ' more files' })
      ]));
    }
    host.appendChild(list);
  };

  T7.prototype._sheetAdvice = function (host, advice) {
    var self = this, u = U();
    var bsd = this.ctx.services.bsd;
    host.appendChild(u.el('div', { class: 't7-sheet-title', text: 'Back Seat Driver' }));
    advice.forEach(function (adv) {
      var row = u.el('div', { class: 't7-advice', data: { severity: adv.severity } });
      row.appendChild(u.el('span', { class: 't7-advice-kind', text: adv.severity === 'caution' ? 'Caution' : 'Note' }));
      row.appendChild(u.el('p', { class: 't7-advice-text', text: adv.text }));
      if (adv.evidenceRefs && adv.evidenceRefs.length) {
        row.appendChild(u.el('span', { class: 't7-advice-ev', text: adv.evidenceRefs.join(', ') }));
      }
      /* Dismiss only. Advice is read-only; nothing here can apply it. */
      var dis = u.el('button', { class: 't7-act', type: 'button', text: 'Dismiss' });
      self._on(dis, 'click', function () {
        bsd.dismiss(self.tid(), adv.id);
        self.ctx.services.popup.closeAll(null);
      });
      row.appendChild(dis);
      host.appendChild(row);
    });
  };

  /* ---------------------------------------------------------------- artifact handoff
   * A level-one card, sibling of the status card - never inside it. */

  T7.prototype._renderHandoff = function (host) {
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
    var card = u.el('div', { class: 't7-handoff', data: { state: state } });
    card.appendChild(u.el('span', { class: 't7-handoff-kind', text: 'Artifact' }));
    card.appendChild(u.el('span', { class: 't7-handoff-title', text: ref.title }));

    var stateEl = u.el('span', { class: 't7-handoff-state' });
    var label = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, label);
    else stateEl.textContent = label;
    card.appendChild(stateEl);

    var worked = this._handoffWorkedSeconds();
    if (worked != null) card.appendChild(u.el('span', { class: 't7-handoff-worked', text: 'Worked for ' + F().duration(worked) }));

    var open = u.el('button', { class: 't7-act t7-handoff-open', type: 'button', text: 'Open' });
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

  T7.prototype._handoffWorkedSeconds = function () {
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

    /* ---------------------------------------------------------------- question: the card deck
   *
   * The matrix assigns this concept a CARD DECK: up to three level-one cards offset behind each other,
   * answering slides the top card off, siblings translate and scale, submit collapses the deck into one
   * summary card, and the head carries a DOT RANK plus `2 of 3`.
   *
   * The cap of three is the interesting constraint. A deck of six unanswered questions would be a stack
   * of edges - unreadable, and a lie about how much is behind. Three is enough to say "there is more"
   * while every visible edge still means something, so the deck shows at most three and the dot rank
   * carries the true count. The rank is why the cap costs nothing.
   *
   * "Never nested" applies here too: the cards are SIBLINGS in a positioned deck, not cards inside a
   * container card. Answering slides the top one off and promotes the next - the deck is the only place
   * in the concept where cards overlap, and they overlap rather than nest.
   */
  T7.prototype.renderQuestion = function () {
    /* Re-entrancy guard: claiming the surfaces notifies the store, which re-enters update(). */
    if (this._inRenderQuestion) return;
    /* A destroyed instance renders NOTHING. It writes into regions the window owns and the next
     * concept is already in them, so a late callback that painted here would put one concept's card
     * inside another's shelf. */
    if (this._dead) return;

    var self = this;
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;

    var R = global.PMXReveal;
    var prevKey = this._qkey || '';
    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;

    /* Which of the deck's four states this render is: a stack of questions, the capsule while the
     * questionnaire is preparing or submitting, the collapsed summary, or nothing at all. */
    var mode = 'none';
    if (flow && flow.record) {
      mode = (flow.status === 'preparing' || flow.status === 'submitting') ? 'wait' : 'stack';
    } else if (flow && flow.receipt) {
      mode = 'summary';
    }

    /* Nothing to say: the deck is REMOVED rather than kept empty. Every window's question shelf and
     * the inline slot both hide themselves with `:empty`, so a persistent empty deck would hold that
     * strip open - a border and a band of padding reserving space for a question that does not
     * exist. The root's survival is worth a great deal, but not that. */
    if (mode === 'none') {
      this._dropDeck();
      this._qkey = R ? R.keyFor(svc, this.tid()) : '';
      return;
    }

    var deck = this._ensureDeck(host);

    /* `pmx-size-bounce-strong` is the firmer beat, for a change big enough to RESHAPE the box rather
     * than nudge it. In a question deck that is the OPTION COUNT changing between pages: three
     * options becoming six is a different card, where one prompt running to a second line is the same
     * card saying a little more. The first page has nothing to compare against and gets the ordinary
     * beat, because its size did not change - it arrived. */
    var optsNow = (flow.record && flow.question && flow.question.options)
      ? flow.question.options.length : 0;
    var strong = (this._deckOptionCount != null && optsNow !== this._deckOptionCount);
    this._deckOptionCount = optsNow;

    /* A deck built THIS render has no previous size, so there is nothing for the bounce to be about:
     * it would travel from an empty box's padding to a full card and call an arrival a resize. The
     * entrance beat below is what says "this is new"; the bounce only ever says "this changed size". */
    var born = this._deckIsNew;
    this._deckIsNew = false;

    /* ONE BOUNCE PER CHANGE, not one per render. A single click reaches this twice - `qflow.act`
     * persists, the store notifies, and update() renders; then the handler's own `renderQuestion()`
     * renders the same state again - and starting a second bounce inside the first one's flight was
     * measured doing real damage. The second call measured a start height mid-transition, found the
     * content already rebuilt and the delta below half a pixel, and took the bail path, which strips
     * the inline height the first bounce was animating. The height still arrived, but only because
     * `interpolate-size` let the abandoned transition run on to `auto`, and the scale beat was left
     * applied to an element whose animation had already been decided. While a bounce is in flight the
     * later render therefore just rebuilds the contents and lets the beat finish. */
    var running = this._deckBounce;
    var busy = !!(running && running.state && running.state() === 'running');

    this._inRenderQuestion = true;
    try {
      var mutate = function () { self._renderQuestionBody(deck, flow, mode); };
      if (born || busy || !(svc.motion && svc.motion.resizeBounce)) {
        mutate();
      } else {
        /* The entrance is over the moment the deck starts resizing, and it has to be taken off the
         * element rather than left to time out: `[data-pmx-thread="t7"] .t7-deck-enter` is a more
         * specific rule than `.pmx-size-bounce-strong`, so an entrance still in its 420ms window when
         * a page change arrives would win the whole `animation` shorthand and the resize's scale beat
         * would silently not play. Answering the first question inside that window is not a corner
         * case - it is what a quick reader does. */
        deck.classList.remove('t7-deck-enter');
        this._deckBounce = svc.motion.resizeBounce(deck, mutate, {
          bounceClass: strong ? 'pmx-size-bounce-strong' : 'pmx-size-bounce'
        });
      }
    } finally { this._inRenderQuestion = false; }

    /* A card on its way out is moved to the END of the deck, after the cards that are staying.
     *
     * It is a clone, so it carries copies of the answered card's own controls - a second Back, Skip,
     * Next and Cancel, all inert and none of them wired to anything. In DOM order it was landing
     * FIRST, so `querySelector('.t7-act')` and every harness that takes the first match found the
     * dead copy instead of the live control: a paging walk clicked the ghost's Next and recorded the
     * concept as refusing to advance. Paint order is already handled by z-index, so ordering it last
     * costs nothing and puts the real controls first for anything that reads the document. */
    var leaving = deck.querySelectorAll('[data-leaving="1"]');
    for (var n = 0; n < leaving.length; n++) deck.appendChild(leaving[n]);

    this._choreographDeck(deck, prevKey, mode);
  };

  /* THE DECK IS CREATED ONCE AND SURVIVES EVERY RENDER. Only its contents are rebuilt.
   *
   * Two things depend on the element outliving the render that filled it. `resizeBounce` measures a
   * start height, mutates, and measures an end height on the SAME element - a deck thrown away and
   * rebuilt has no start height to travel from, so there is nothing to animate and the card would
   * simply jump to its new size. And `motion.firstVisit` stamps its ledger on the element, so a deck
   * that died every render would have no memory of which questions it had already shown and would
   * replay the entrance on every backward page. */
  T7.prototype._ensureDeck = function (host) {
    if (!this._deck) {
      /* `pmx-resize-up` is the shared opt-in marker for a box that grows into its OWN space instead of
       * pushing what is under it, and it is honest here in both mounts. The deck sits directly above
       * the composer: in a window that offers a question shelf it is a fixed-size row in the chat
       * column, and inline it is a `flex: 0 0 auto` row at the bottom of `.t7-root`. Either way the
       * flexible sibling is the TRANSCRIPT above it, so a taller deck takes its height from the
       * transcript's viewport and the composer below never moves.
       *
       * The class's own `margin-top: auto` only bites where the host is a flex column, which is not
       * every window; what makes the anchoring real in every one of them is the rule this concept adds
       * beside it in its own stylesheet, which pins the deck's CONTENT to its bottom edge so a growing
       * box reveals at the top. See `.t7-deck.pmx-resize-up`. */
      this._deck = U().el('div', { class: 't7-deck pmx-resize-up' });
      this._deckIsNew = true;
    }
    if (this._deck.parentNode !== host) host.appendChild(this._deck);
    return this._deck;
  };

  T7.prototype._dropDeck = function () {
    if (this._deck && this._deck.parentNode) this._deck.parentNode.removeChild(this._deck);
    /* The element is dropped outright rather than parked. A questionnaire that starts later is a new
     * question and SHOULD play its entrance, and a fresh deck with a fresh visit ledger is what says
     * so - keeping the old one would carry the old ledger with it. */
    this._deck = null;
    this._deckOptionCount = null;
  };

  /* This concept's OWN choreography: TRANSLATE AND SCALE of the siblings, per the matrix.
   *
   * The deck's depth is expressed by transform, so an advance animates the same property the layout
   * already uses - the cards behind step forward rather than fading.
   *
   * THE HEIGHT NOW MOVES, and this paragraph used to say the opposite: "no height spring: the deck's
   * height is set by the tallest card and springing it would move the transcript above". That was
   * true of a spring on a deck sitting in normal flow, and it is not true of what runs here. The
   * bounce is `motion.resizeBounce` and the deck is `pmx-resize-up`, which anchors it to its bottom
   * edge - the composer under it does not move, and the deck's own top edge is what travels.
   *
   * Where that does NOT fully answer the old objection, and it does not: the height the deck takes
   * comes out of the TRANSCRIPT'S viewport, which is the flexible sibling above it. The cards in the
   * transcript keep their positions and their scroll offset, so nothing reflows and nothing is
   * re-laid out - but the last card or two can be cut off at the bottom edge while the deck is at its
   * taller size. That is a smaller cost than a jump cut between two card sizes with no motion
   * explaining it, and it is a real cost rather than none. */
  T7.prototype._choreographDeck = function (deck, prevKey, mode) {
    var R = global.PMXReveal, M = global.PMXMotion;
    if (!R || !deck) return;

    var svc = this.ctx.services;
    var key = R.keyFor(svc, this.tid());
    this._qkey = key;

    /* Same question, one more keystroke: silence. */
    if (prevKey === key) return;

    /* The collapse into the summary is stated by the RESIZE - the deck really did become one line -
     * and an entrance beat on top of it would be the card claiming to arrive at the same moment it
     * claims to shrink. */
    if (mode === 'summary') return;

    /* BACKWARD PAGING MUST NOT REPLAY THE ENTRANCE (02_stable_paged_questionnaire.mov). Answer
     * question 1, go on to 2, come back: the answer is still there and the card does not animate as
     * though it were new, because animating an entrance on the way back tells the reader they have
     * moved forward. `firstVisit` is asked on the deck, which is why the deck has to survive: the
     * ledger it stamps is the element's, and it dies with the element - exactly the lifetime a
     * "have I shown this yet" fact has.
     *
     * It is asked BEFORE the reduced-motion check on purpose, so the ledger records the same visits
     * whichever motion mode the reader is in and toggling the setting cannot resurrect an entrance. */
    var fresh = (M && M.firstVisit) ? M.firstVisit(deck, key) : true;
    if (!fresh) return;
    if (R.reduced(deck)) return;

    if (!prevKey) {
      R.oneShot(deck, 't7-deck-enter', 420);
      return;
    }

    /* ADVANCE: the top card has already been replaced by this render, so the beat plays on THE CARD
     * THAT WAS PROMOTED and the depth transitions carry the siblings forward.
     *
     * It used to play on the deck, and that had to change when the deck started carrying the resize.
     * Both are `transform` animations, and `[data-pmx-thread="t7"] .t7-deck-advance` is a more
     * specific rule than `.pmx-size-bounce-strong` - so with both classes on one element the advance
     * won the whole `animation` shorthand and the scale beat silently never played. Measured, not
     * reasoned about: `getAnimations()` on the deck listed the advance and the height transition and
     * no size bounce at all.
     *
     * Putting it on the card is also the truer reading. The deck is the box that changed size; the
     * card is the thing that moved up the stack, and the two cards behind it are meant to hold still
     * while it settles. The leaving still is excluded by selector - it is on its way out and is not
     * the card that was promoted. */
    var promoted = deck.querySelector('.t7-qcard[data-top="1"]:not([data-leaving])');
    R.oneShot(promoted || deck, 't7-deck-advance', 380);
  };

  /* Rebuilds the deck's CONTENTS. The deck itself belongs to `_ensureDeck` and is never replaced here:
   * this runs inside `resizeBounce`'s mutation, which has already measured the element it is handed. */
  T7.prototype._renderQuestionBody = function (deck, flow, mode) {
    var self = this, u = U();
    var svc = this.ctx.services;
    if (!deck || !flow) return;
    /* Everything except a card that is on its way OUT. `_slideTop` leaves the answered card behind as
     * an absolutely positioned still, so the deck can be rebuilt underneath it in the same turn and
     * the slide is not paid for with a 200ms wait before the answer is recorded. */
    var kid = deck.firstChild;
    while (kid) {
      var nextKid = kid.nextSibling;
      if (!(kid.getAttribute && kid.getAttribute('data-leaving') === '1')) deck.removeChild(kid);
      kid = nextKid;
    }
    /* The fan is a one-shot the cancel gesture leaves on the element. With a deck that survives the
     * render it would survive the gesture too, so every later card would be dealt out at a rakish
     * angle for no reason. */
    deck.removeAttribute('data-fan');
    deck.setAttribute('data-mode', mode);

    if (mode === 'summary') {
      deck.setAttribute('data-depth', '1');
      this._renderDeckSummary(deck, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    if (mode === 'wait') {
      var lone = u.el('div', { class: 't7-qcard', data: { rank: '0', top: '1', phase: flow.status } });
      lone.appendChild(global.PMXReveal.capsule(
        flow.status === 'preparing' ? 'Preparing questions' : 'Submitting answers', this.ctx));
      deck.setAttribute('data-depth', '1');
      deck.appendChild(lone);
      return;
    }

    /* Remaining questions from the current one onward, capped at three visible cards. */
    var remaining = [];
    for (var i = flow.index; i < flow.questions.length; i++) remaining.push({ q: flow.questions[i], i: i });
    if (flow.atEnd) remaining = [{ q: null, i: flow.questions.length }];
    var visible = remaining.slice(0, 3);

    deck.setAttribute('data-depth', String(visible.length));

    /* Painted back-to-front so the top card is LAST in the DOM and therefore last in paint order without
     * needing a z-index per card. */
    for (var d = visible.length - 1; d >= 0; d--) {
      var entry = visible[d];
      var isTop = d === 0;
      var card = u.el('div', {
        class: 't7-qcard',
        data: { rank: String(d), top: isTop ? '1' : '0' }
      });

      if (!isTop) {
        /* A card behind shows only its edge: a title line, nothing interactive. Anything clickable back
         * there would be a control the reader cannot see the context for. */
        card.appendChild(u.el('span', {
          class: 't7-qcard-edge',
          text: entry.q ? entry.q.prompt : 'Ready to send'
        }));
        deck.appendChild(card);
        continue;
      }

      /* Capture the entry for this card explicitly. `entry` is declared with `var`, so it is
       * function-scoped: every click handler built below would otherwise read whatever the loop left in
       * it. Today the loop happens to end on the top card, so it works by accident of iteration order -
       * which is not a property worth depending on. */
      var top = entry;

      /* ---- the top card: head with dot rank + `2 of 3`, body, foot */
      var head = u.el('div', { class: 't7-qcard-head' });

      /* The dot rank: one dot per question, filled to the current position. It is the true count, which
       * is what lets the deck cap at three visible cards without lying. */
      var dots = u.el('span', { class: 't7-qdots', aria: { label: 'Question ' + flow.position + ' of ' + flow.total } });
      for (var n = 0; n < flow.total; n++) {
        var state = 'ahead';
        if (n < flow.index) state = flow.isSkipped(flow.questions[n]) ? 'skipped' : 'done';
        else if (n === flow.index && !flow.atEnd) state = 'current';
        dots.appendChild(u.el('span', { class: 't7-qdot', data: { state: state } }));
      }
      head.appendChild(dots);
      head.appendChild(u.el('span', { class: 't7-qcount', text: flow.position + ' of ' + flow.total }));
      card.appendChild(head);

      var body = u.el('div', { class: 't7-qcard-body' });
      body.appendChild(u.el('p', {
        class: 't7-qprompt',
        text: top.q ? top.q.prompt : 'Every question has been answered.'
      }));
      if (top.q && top.q.required) body.appendChild(u.el('span', { class: 't7-qreq', text: 'Required' }));

      if (top.q) {
        if (top.q.options && top.q.options.length) {
          var opts = u.el('div', { class: 't7-qopts' });
          top.q.options.forEach(function (opt) {
            var sel = (top.q.selected || []).indexOf(opt) >= 0;
            var b = u.el('button', { class: 't7-opt', type: 'button', text: opt, aria: { pressed: sel ? 'true' : 'false' } });
            self._on(b, 'click', function (ev) {
              if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
              svc.qflow.act(svc, self.tid(), 'answer', opt);
              self.renderQuestion();
            });
            opts.appendChild(b);
          });
          body.appendChild(opts);
        } else {
          var ta = u.el('textarea', { class: 't7-qfree pmx-scroll', aria: { label: top.q.prompt } });
          ta.setAttribute('spellcheck', 'false');
          ta.value = top.q.draft || '';
          this._on(ta, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', ta.value); });
          body.appendChild(ta);
        }
      }

      var reason = u.el('p', { class: 't7-qreason', data: { show: this._pendingReason ? '1' : '0' } });
      if (this._pendingReason) { reason.textContent = this._pendingReason; this._pendingReason = null; }
      body.appendChild(reason);
      card.appendChild(body);

      var foot = u.el('div', { class: 't7-qcard-foot' });

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
        var back = u.el('button', { class: 't7-act', type: 'button', text: 'Back' });
        this._on(back, 'click', function () { svc.qflow.act(svc, self.tid(), 'prev'); self.renderQuestion(); });
        foot.appendChild(back);
      }

      /* Skip SLIDES the card without recording an answer - the matrix's exact wording, and the reason the
       * slide class is applied before the store changes. */
      if (top.q) {
        var skip = u.el('button', { class: 't7-act', type: 'button', text: 'Skip' });
        this._on(skip, 'click', function () {
          self._slideTop(deck, function () {
            svc.qflow.act(svc, self.tid(), 'skip');
            self.renderQuestion();
          });
        });
        foot.appendChild(skip);
      }

      if (top.q && flow.isSkipped(top.q)) {
        var un = u.el('button', { class: 't7-act', type: 'button', text: 'Unskip' });
        this._on(un, 'click', function () { svc.qflow.act(svc, self.tid(), 'unskip', flow.index); self.renderQuestion(); });
        foot.appendChild(un);
      }

      var primary = u.el('button', { class: 't7-act t7-act-primary', type: 'button', text: flow.atEnd ? 'Send' : 'Next' });
      this._on(primary, 'click', function () {
        if (flow.atEnd) {
          var res = svc.qflow.act(svc, self.tid(), 'submit');
          if (!res.ok) { refuse(res, 'Answer the required questions first.'); return; }
          self.renderQuestion();
          self.renderSurfaces();
          return;
        }
        /* Answering slides the top card off, then the next one is promoted by the re-render. */
        self._slideTop(deck, function () {
          var r = svc.qflow.act(svc, self.tid(), 'next');
          if (!r.ok) { refuse(r, 'Answer this question first.'); return; }
          self.renderQuestion();
          self.renderSurfaces();
        });
      });
      foot.appendChild(primary);

      /* Cancel FANS THE DECK OUT before it goes - the matrix's requirement, and the one gesture that
       * shows what is being discarded before it goes. The deck element itself now survives the gesture
       * and collapses to the one-line receipt instead of being torn out of the document, so the fan is
       * followed by the resize rather than by a hole where the cards were. */
      var cancel = u.el('button', { class: 't7-act', type: 'button', text: 'Cancel' });
      this._on(cancel, 'click', function () {
        self._fanOut(deck, function () {
          svc.qflow.act(svc, self.tid(), 'cancel');
          self.renderQuestion();
          self.renderSurfaces();
        });
      });
      foot.appendChild(cancel);

      card.appendChild(foot);
      deck.appendChild(card);
    }
  };

  /* Slide the top card off, and record the answer IN THE SAME TURN. Falls straight through under
   * reduced motion.
   *
   * This used to add the class to the live card and then wait 200ms before letting the caller write to
   * the store, which cost two things that only looked small. The click had no result for a fifth of a
   * second, so a reader who clicked Next twice queued two advances and watched the deck jump two
   * questions at once; and the 200ms timer outlived the instance - switch concept inside that window
   * and a destroyed t7 wrote `next` to the questionnaire the NEXT concept was showing, then rendered
   * its own deck into that concept's question host. Both were measured, the second in a paging walk
   * where t7's stray advance moved t8's question underneath it.
   *
   * So the card that is leaving is left behind as a STILL of itself: an absolutely positioned clone,
   * inert and aria-hidden, pinned to the box the real card occupied. It is out of flow, so it does not
   * enter the height `resizeBounce` is about to measure; it carries no handlers, which is right for a
   * card whose question has already been answered; and it cannot drift out of step with the record,
   * because it is a picture rather than a second copy of the state. The rebuild underneath it keeps
   * any `[data-leaving]` child, which is what lets both happen in one turn. */
  T7.prototype._slideTop = function (deck, done) {
    var R = global.PMXReveal;
    /* Never the still from a previous answer: it is a picture of a card that has already gone. */
    var topEl = deck && deck.querySelector('.t7-qcard[data-top="1"]:not([data-leaving])');
    if (!topEl || !R || R.reduced(topEl)) { done(); return; }

    var ghost = topEl.cloneNode(true);
    ghost.setAttribute('data-leaving', '1');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.left = topEl.offsetLeft + 'px';
    ghost.style.top = topEl.offsetTop + 'px';
    ghost.style.width = topEl.offsetWidth + 'px';
    deck.appendChild(ghost);

    /* A clone does not carry a textarea's live value: `value` is a property and only the ORIGINAL
     * content is in the markup, so a freeform answer would slide away blank. */
    var wroteIn = topEl.querySelectorAll('textarea');
    var copies = ghost.querySelectorAll('textarea');
    for (var i = 0; i < wroteIn.length && i < copies.length; i++) copies[i].value = wroteIn[i].value;

    void ghost.offsetWidth;
    ghost.classList.add('t7-qcard-off');
    this._ghostTimer = global.setTimeout(function () {
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
    }, 260);

    done();
  };

  /* Fan the deck out, then let the caller empty it. The attribute is cleared by the next render of the
   * deck's contents, which is what stops a surviving deck from keeping the rake forever.
   *
   * Cancel keeps its wait where the answer above does not, and the difference is what the gesture is
   * FOR: the fan exists to show what is being discarded before it goes, so the discard has to follow
   * it. The timer is held on the instance so a teardown can cancel it - a destroyed thread must not
   * cancel a questionnaire that by then belongs to whatever replaced it. */
  T7.prototype._fanOut = function (deck, done) {
    var self = this;
    var R = global.PMXReveal;
    if (!deck || !R || R.reduced(deck)) { done(); return; }
    deck.setAttribute('data-fan', '1');
    this._fanTimer = global.setTimeout(function () {
      self._fanTimer = null;
      if (self._dead) return;
      done();
    }, 260);
  };

  /* Submit collapses the deck into ONE summary card - and now it is literally the same box collapsing,
   * since the summary is built INSIDE the surviving deck and `resizeBounce` carries it from the stack's
   * height down to one line. */
  T7.prototype._renderDeckSummary = function (deck, receipt) {
    var self = this, u = U();
    if (!receipt) return;

    var card = u.el('div', { class: 't7-qsummary', data: { status: receipt.status } });
    card.appendChild(u.el('span', { class: 't7-handoff-kind', text: 'Questions' }));
    card.appendChild(u.el('span', {
      class: 't7-qsummary-text',
      text: receipt.cancelled
        ? 'Cancelled'
        : (receipt.answered + (receipt.answered === 1 ? ' answer sent' : ' answers sent') +
           (receipt.skipped ? ', ' + receipt.skipped + ' skipped' : ''))
    }));

    /* The dot rank survives into the summary, so the shape of what happened is still legible. */
    var dots = u.el('span', { class: 't7-qdots' });
    (receipt.questions || []).forEach(function (question) {
      var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
      dots.appendChild(u.el('span', { class: 't7-qdot', data: { state: wasSkipped ? 'skipped' : 'done' } }));
    });
    card.appendChild(dots);

    var show = u.el('button', { class: 't7-act', type: 'button', text: 'Show answers' });
    this._on(show, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 340,
        build: function (h) {
          h.appendChild(u.el('div', { class: 't7-sheet-title', text: receipt.cancelled ? 'Cancelled questions' : 'Answers sent' }));
          (receipt.questions || []).forEach(function (question) {
            var val = receipt.answers[question.id];
            var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't7-sheet-row' }, [
              u.el('span', { class: 't7-sheet-k', text: wasSkipped ? 'skipped' : 'answered' }),
              u.el('span', { class: 't7-sheet-v', text: question.prompt + (val == null ? '' : ' \u2014 ' + [].concat(val).join(', ')) })
            ]));
          });
        }
      });
    });
    card.appendChild(show);
    deck.appendChild(card);
  };

    T7.prototype.syncLive = function () {
    var u = U(), s = this.ctx.services.runtime.liveStatus(this.tid());
    if (!s) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null; return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't7-live pmx-live' }, [
        u.el('span', { class: 't7-live-dot pmx-pulse' }),
        u.el('span', { class: 't7-live-text' }),
        u.el('span', { class: 't7-live-time' })
      ]);
      this.list.appendChild(this.liveEl);
    }
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t7-live-text'), s.text || '');
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t7-live-time'),
      s.workedSeconds != null ? F().duration(s.workedSeconds) : '');
  };

  T7.prototype.isExpanded = function (id) { return !!this.ctx.store.view(this.tid()).expanded[id]; };
  T7.prototype.setExpanded = function (id, on) {
    var self = this, rec = this.rendered[id];
    this.ctx.store.view(this.tid()).expanded[id] = !!on;
    if (!rec) return;
    this.scrollCtl.preserveAcross(rec.bodyEl, function () {
      rec.bodyEl.setAttribute('data-expanded', on ? '1' : '0');
      var b = rec.bodyEl.querySelector('.t7-more');
      if (b) b.textContent = on ? 'Show less' : 'Show more';
      self.ctx.services.motion.snapToEnd(rec.bodyEl);
    });
  };
  T7.prototype.revealHidden = function (id) { this.setExpanded(id, true); };

  T7.prototype.scrollToMessage = function (id, opts) {
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

  T7.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T7.prototype.setAnchor = function (t) { return this.scrollCtl.restoreAnchor(t); };

  T7.prototype.update = function (state, changed) {
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

  T7.prototype.destroy = function () {
    /* Set FIRST. Everything below can re-enter through a subscription or a timer, and from this point
     * on this instance must not paint. */
    this._dead = true;
    if (this._fanTimer) { global.clearTimeout(this._fanTimer); this._fanTimer = null; }
    if (this._ghostTimer) { global.clearTimeout(this._ghostTimer); this._ghostTimer = null; }
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
    /* The deck outlives every RENDER, not the instance. Dropping the reference here is what stops a
     * replaced instance from holding a detached card with a visit ledger on it. */
    this._deck = null;
    this._deckOptionCount = null;
    /* A resize caught mid-flight is FINISHED, not abandoned: the contract's rule is that an
     * interrupted beat lands on its end state and leaves no pinned height behind. */
    if (this._deckBounce && this._deckBounce.finish) { try { this._deckBounce.finish(); } catch (e2) {} }
    this._deckBounce = null;
    /* A handover caught between its two beats is FINISHED rather than cancelled, so the arriving
     * segment is inserted and the head's sentence written before the DOM goes: the contract's rule is
     * that an interrupted beat lands on its end state, never mid-flight. */
    if (this._runChainState && this._runChainState.pending && this._runChainState.pending.handle) {
      try { this._runChainState.pending.handle.finish(); } catch (e1) {}
    }
    this._runChainState = null;
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this._tickOff) { try { this._tickOff(); } catch (e) {} this._tickOff = null; }
    if (this.scrollCtl && this.scrollCtl.destroy) { try { this.scrollCtl.destroy(); } catch (e) {} }
    [this.root, this.inlineSurfaces, this.inlineQuestion].forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    this.rendered = {};
    /* The append-only path keys off these. A destroyed instance that left them behind would let the
     * next render mistake a fresh mount for an append and skip building the cards already on
     * screen. */
    this._renderedIds = null;
    this._renderedFrom = null;
  };

  global.PMX.thread.register('t7', {
    name: 'Cards with Air',
    blurb: 'Deliberately card based, but with exactly one level of nesting allowed and real separation between cards, so anything that would become a second box opens a detail sheet instead.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T7(regionEl, ctx);
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
