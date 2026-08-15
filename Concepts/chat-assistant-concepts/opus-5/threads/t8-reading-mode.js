/* t8 "Reading Mode" — Opus 5
 *
 * Prose first, to the exclusion of nearly everything. A right-edge micro-gutter of discrete
 * status dots is the only persistent sign that machinery exists; every work surface collapses
 * to one line per turn until a single global "Show work" toggle reveals them all in place.
 *
 * Reading is the default state. Inspecting is a mode you enter deliberately.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }

  var COLLAPSE_ELIGIBLE_CHARS = 800;

  function T8Thread(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.rendered = {};
    this.lastThreadId = null;
    this.build();
  }

  T8Thread.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };
  T8Thread.prototype.tid = function () { return this.ctx.store.get('session.activeThreadId'); };

  T8Thread.prototype.build = function () {
    var self = this;
    var u = U();

    this.root = u.el('div', { class: 't8-root', data: { work: '0' } });

    this.head = u.el('div', { class: 't8-head' }, [
      u.el('span', { class: 't8-head-name', text: 'Reading Mode' })
    ]);
    this.workBtn = u.el('button', { class: 't8-workbtn', text: 'Show work' });
    this._on(this.workBtn, 'click', function () { self.toggleWork(); });
    this.head.appendChild(this.workBtn);
    this.head.appendChild(u.el('span', { class: 't8-head-model', text: this.ctx.label }));
    this.root.appendChild(this.head);

    this.scroller = u.el('div', { class: 't8-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't8-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    this.inlineSurfaces = u.el('div', { class: 't8-inline-surfaces' });
    this.inlineQuestion = u.el('div', { class: 't8-inline-question' });
    if (!this.ctx.capabilities.workSurfaceHost) this.root.appendChild(this.inlineSurfaces);
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);

    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t8-turn', messageAttr: 'data-pmx-msg'
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

  /* Is the work showing? The answer lives in the STORE, keyed by thread, and it used to live in
   * `this.showWork` on the instance.
   *
   * `shared/runtrace.js` records that defect by name under WHERE THE STATE LIVES: a fact about what
   * the READER has opened has to outlive the element that displayed it, and this concept remounts on
   * a width change and on a window swap, so an instance flag threw the disclosure away every time.
   * `view.surfaces.expanded` is the slot this workspace already keeps surface disclosure in, so the
   * migration adds no state of its own — it moves the same one fact to where it survives. */
  T8Thread.prototype.workShown = function () {
    var v = this.ctx.store.view(this.tid());
    return !!(v && v.surfaces && v.surfaces.expanded === 'work');
  };

  /* One switch reveals every work line at once. Under reduced motion it must flip instantly
   * with no staggered reveal, which is why nothing here animates per element. */
  T8Thread.prototype.toggleWork = function () {
    var v = this.ctx.store.view(this.tid());
    v.surfaces = v.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
    v.surfaces.expanded = v.surfaces.expanded === 'work' ? null : 'work';
    this._syncWorkToggle();
    /* One touch is the whole repaint: update() re-renders the surfaces for any `view*` change, and
     * announcing it is also what lets a second window on the same thread agree about the toggle. */
    this.ctx.store.touchView('surfaces');
  };

  /* The header control states what the STORE says, on every render rather than only on a click. A
   * freshly mounted instance would otherwise show `Show work` over a transcript whose work lines the
   * reader had already revealed. */
  T8Thread.prototype._syncWorkToggle = function () {
    var on = this.workShown();
    if (this.root) this.root.setAttribute('data-work', on ? '1' : '0');
    if (this.workBtn) {
      this.workBtn.textContent = on ? 'Hide work' : 'Show work';
      this.workBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  };

  T8Thread.prototype.renderThread = function () {
    var tid = this.tid();
    var view = this.ctx.store.view(tid);
    var msgs = this.ctx.data.visibleSlice(tid, view.loadedFrom);

    U().empty(this.list);
    this.rendered = {};
    this.lastThreadId = tid;

    var thread = this.ctx.data.threadById(tid);
    var hidden = thread ? Math.max(0, thread.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlder(hidden));

    var prev = null;
    for (var i = 0; i < msgs.length; i++) {
      this.list.appendChild(this.buildTurn(msgs[i], prev));
      prev = msgs[i].role;
    }
    this.renderSurfaces();
    this.renderQuestion();
    this.syncLive();
  };

  T8Thread.prototype.buildOlder = function (hidden) {
    var self = this;
    var u = U();
    var b = u.el('button', { class: 't8-older', text: 'Load ' + hidden.toLocaleString() + ' earlier messages' });
    this._on(b, 'click', function () {
      var tid = self.tid();
      var v = self.ctx.store.view(tid);
      var t = self.ctx.data.threadById(tid);
      var cur = v.loadedFrom == null ? t.messages.length - t.initialVisibleMessageCount : v.loadedFrom;
      v.loadedFrom = Math.max(0, cur - 120);
      self.scrollCtl.preserveAcross(self.list, function () { self.renderThread(); });
    });
    return u.el('div', { class: 't8-older-wrap' }, [b]);
  };

  T8Thread.prototype.buildTurn = function (msg, prevRole) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var lensState = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;

    var turn = u.el('div', {
      class: 't8-turn pmx-msg',
      data: { pmxMsg: msg.id, pmxRole: msg.role, lens: lensState || '' }
    });
    if (msg.role !== prevRole) turn.setAttribute('data-turn-start', '1');

    var body = u.el('div', { class: 't8-body pmx-msg-body' });

    if (msg.role !== prevRole) {
      body.appendChild(u.el('span', { class: 't8-role', text: msg.role === 'user' ? 'You' : 'Assistant' }));
    }

    var prose = u.el('div', { class: 't8-prose' });
    String(msg.body || '').split(/\n{2,}/).forEach(function (p) {
      var t = p.replace(/\n/g, ' ').trim();
      if (t) prose.appendChild(u.el('p', { class: 't8-p', text: t }));
    });
    body.appendChild(prose);

    var eligible = (msg.body || '').length >= COLLAPSE_ELIGIBLE_CHARS;
    if (eligible) {
      var open = !!this.ctx.store.view(this.tid()).expanded[msg.id];
      body.setAttribute('data-collapsible', '1');
      body.setAttribute('data-expanded', open ? '1' : '0');
      var more = u.el('button', { class: 't8-more', text: open ? 'Show less' : 'Show more' });
      this._on(more, 'click', function () { self.setExpanded(msg.id, !self.isExpanded(msg.id)); });
      body.appendChild(more);
    }

    turn.appendChild(body);
    turn.appendChild(global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage()
    }));

    /* The work line: one row, hidden until the global toggle. */
    var work = this.buildWorkLine(msg);
    if (work) turn.appendChild(work);

    /* The micro-gutter: discrete SVG dots, deliberately spaced so they never read as a
     * continuous colored edge. Status lives in the title text, not the colour alone. */
    var dots = this.buildDots(msg);
    if (dots) turn.appendChild(dots);

    this.rendered[msg.id] = { el: turn, bodyEl: body };
    return turn;
  };

  T8Thread.prototype.buildWorkLine = function (msg) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var bits = [];
    var group = svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : msg.activityGroup;
    if (group) bits.push(svc.surfaces.condenseLabel(group));
    if (msg.thoughtSegments && msg.thoughtSegments.length) bits.push('reasoning summary');
    if (msg.completedQuestionnaire) bits.push('question answered');
    if (!bits.length) return null;

    var line = u.el('div', { class: 't8-work' });
    var btn = u.el('button', { class: 't8-work-btn', text: bits.join(', ') });
    this._on(btn, 'click', function (ev) {
      svc.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 320,
        build: function (host) { self.workDetail(host, msg, group); }
      });
    });
    line.appendChild(btn);
    return line;
  };

  T8Thread.prototype.workDetail = function (host, msg, group) {
    var u = U();
    host.appendChild(u.el('div', { class: 't8-sheet-title', text: 'What this turn did' }));
    var list = u.el('div', { class: 't8-sheet-list pmx-scroll' });
    if (group) {
      this.ctx.services.surfaces.activityStages(group).forEach(function (st) {
        list.appendChild(u.el('div', { class: 't8-sheet-row' }, [
          u.el('span', { class: 't8-sheet-k', text: F().label(st.kind) }),
          u.el('span', { class: 't8-sheet-v', text: st.label || '' })
        ]));
      });
    }
    (msg.thoughtSegments || []).forEach(function (s) {
      list.appendChild(u.el('div', { class: 't8-sheet-row' }, [
        u.el('span', { class: 't8-sheet-k', text: F().label(s.status) }),
        u.el('span', { class: 't8-sheet-v', text: s.summary || s.label || '' })
      ]));
    });
    (msg.completedQuestionnaire ? msg.completedQuestionnaire.questionsAndAnswers || [] : []).forEach(function (qa) {
      list.appendChild(u.el('div', { class: 't8-sheet-row' }, [
        u.el('span', { class: 't8-sheet-k', text: 'Answered' }),
        u.el('span', { class: 't8-sheet-v', text: qa.question + ' — ' + qa.answer })
      ]));
    });
    host.appendChild(list);
    if (msg.thoughtSegments && msg.thoughtSegments.length) {
      host.appendChild(u.el('div', { class: 't8-sheet-foot', text: 'Provider-exposed summary only.' }));
    }
  };

  T8Thread.prototype.buildDots = function (msg) {
    var u = U();
    var svc = this.ctx.services;
    var marks = [];
    if (svc.surfaces.activityGroupFor && svc.surfaces.activityGroupFor(msg)) marks.push('Tools were used');
    if (msg.thoughtSegments && msg.thoughtSegments.length) marks.push('Reasoning summary available');
    if (msg.completedQuestionnaire) marks.push('A question was answered');
    if (!marks.length) return null;

    var gutter = u.el('div', { class: 't8-gutter' });
    marks.forEach(function (title) {
      var dot = u.el('span', { class: 't8-dot' });
      dot.title = title;
      dot.appendChild(svc.icons.get('dot', 7));
      gutter.appendChild(dot);
    });
    return gutter;
  };

  T8Thread.prototype.lastMessage = function () {
    var m = this.ctx.data.messagesFor(this.tid());
    return m[m.length - 1];
  };

  /* ---------------------------------------------------------------- surfaces */

  /* ---------------------------------------------------------------- work: dots plus one quiet line
   *
   * The matrix assigns this concept MICRO-GUTTER DOTS plus ONE QUIET WORK LINE that morphs, condensing so
   * the dots stay and the line reads `Show work`, with the global work toggle revealing lines in place and
   * each gutter dot opening its own popup.
   *
   * The reason this is the right cluster for a reading concept: prose is the subject, so work must be
   * available without ever being in the way. A dot is the smallest possible mark that can still be
   * clicked; one quiet line is the smallest possible sentence that can still be read. Together they say
   * "there is machinery here" without asking the reader to look at it, and the global toggle already
   * exists for the reader who does want to look.
   *
   * What this replaces: `line()` built inert `<div class="t8-surface">` rows - one per surface - which put
   * five rows of machinery directly under prose whose entire premise is not being interrupted.
   */
  T8Thread.prototype.renderSurfaces = function () {
    var self = this, u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
    if (!host) return;
    this._syncWorkToggle();
    /* What the run last PAINTED, read off the elements that painted it and BEFORE they are thrown
     * away. See _runPaint: it is the seed countMorph needs and it is deliberately not a field. */
    var priorRun = this._runPaint(host);
    U().empty(host);

    /* Ask the flow, not the yield flag: this runs BEFORE renderQuestion on every pass. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    var a = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());

    function each(val) { return val == null ? [] : (Object.prototype.toString.call(val) === '[object Array]' ? val : [val]); }
    function glyph(name) { return (svc.icons && svc.icons.has && svc.icons.has(name)) ? name : 'dot'; }

    /* Each entry is one gutter dot AND one clause of the quiet line. */
    var entries = [];

    if (a && a.goal) {
      var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(a.goal) : null;
      entries.push({
        key: 'goal', icon: glyph('gauge'), title: 'Goal',
        clause: phase ? ('phase ' + phase.index + ' of ' + phase.total) : F().label(a.goal.status).toLowerCase(),
        sheet: function (h, api) { self._sheetGoal(h, a.goal, api); }
      });
    }

    if (a && a.todo) {
      var items = a.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
      var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
      entries.push({
        key: 'todo', icon: glyph('check'), title: 'Tasks',
        clause: done + ' of ' + items.length + ' tasks' + (blocked ? ', ' + blocked + ' blocked' : ''),
        sheet: function (h) { self._sheetTodo(h, a.todo); }
      });
    }

    each(a && a.subagents).forEach(function (g, n) {
      entries.push({
        key: 'agents' + (n || ''), icon: glyph('crew'), title: 'Agents',
        clause: (svc.surfaces.subagentSummary && svc.surfaces.subagentSummary(g)) || 'no agents active',
        sheet: function (h) { self._sheetAgents(h, g); }
      });
    });

    var stages = (thread && thread.activityStages) || [];
    if (stages.length) {
      entries.push({
        key: 'activity', icon: glyph('beaker'), title: 'Activity',
        clause: stages.length + ' steps',
        sheet: function (h) { self._sheetStages(h, stages); }
      });
    }

    each(a && a.diffs).forEach(function (g, n) {
      var files = g.files || [];
      var add = 0, rem = 0;
      files.forEach(function (f) { add += f.added || 0; rem += f.removed || 0; });
      entries.push({
        key: 'diff' + (n || ''), icon: glyph('diff'), title: 'Changes',
        clause: files.length + (files.length === 1 ? ' file' : ' files') + ' changed',
        sheet: function (h) { self._sheetDiff(h, g); }
      });
    });

    var verified = this._verificationRecord();
    if (verified) {
      entries.push({
        key: 'verify', icon: glyph('shield'), title: 'Verification',
        clause: 'verified in ' + F().duration(verified.workedSeconds),
        sheet: function (h) {
          h.appendChild(u.el('div', { class: 't8-sheet-title', text: 'Verification' }));
          h.appendChild(u.el('div', { class: 't8-sheet-row' }, [
            u.el('span', { class: 't8-sheet-k', text: F().label(verified.result || 'passed') }),
            u.el('span', { class: 't8-sheet-v', text: verified.note })
          ]));
        }
      });
    }

    /* ---- BSD: a gutter dot PLUS one quiet line, per the matrix. It is the same pair of affordances the
     * work uses, because in this concept that pair IS how anything non-prose appears. */
    var bsd = svc.bsd;
    var advice = (bsd && bsd.advice) ? (bsd.advice(this.tid()) || []) : [];
    if (advice.length) {
      var cautions = advice.filter(function (x) { return x.severity === 'caution'; }).length;
      entries.push({
        key: 'bsd', icon: glyph('bsd'), title: 'Back Seat Driver',
        severity: cautions ? 'caution' : 'note',
        clause: cautions ? (cautions + (cautions === 1 ? ' caution' : ' cautions')) : (advice.length + (advice.length === 1 ? ' note' : ' notes')),
        sheet: function (h) { self._sheetAdvice(h, advice); }
      });
    }

    /* A pending question yields the WHOLE cluster, not just the parts that come from `activeFor`.
     * Activity, verification and advice are read straight off the thread, so they survived the yield and
     * left a partial cluster on screen beside the question - which is the interruption this concept
     * exists to avoid. The handoff stays: it is the work's product, not a work surface. */
    if (pendingQuestion || !entries.length) {
      this._handoffHost = u.el('div', { class: 't8-handoff-host' });
      host.appendChild(this._handoffHost);
      this._renderHandoff(this._handoffHost);
      return;
    }

    /* The run leads the cluster. It is what is happening NOW; the cluster below it is what is true of
     * the thread, and the artifact footnote under that is the work's product. The order is also what
     * makes groupReopen mean anything: it carries the siblings AFTER the run, so opening a phase
     * pushes the cluster and the footnote down as one block instead of displacing them. */
    this._buildRunCapsule(host, priorRun);

    var group = a ? a.activity : null;
    var complete = !!(group && group.status === 'complete');

    var wrap = u.el('div', { class: 't8-cluster', data: { complete: complete ? '1' : '0' } });

    /* ---- the micro-gutter. The dots STAY in the condensed form - that is what the matrix means by
     * "dots stay": the reader never loses the fact that machinery exists, only the sentence about it. */
    var gutter = u.el('div', { class: 't8-cluster-gutter' });
    entries.forEach(function (e) {
      var dot = u.el('button', {
        class: 't8-cluster-dot', type: 'button',
        data: { kind: e.key, severity: e.severity || '' },
        aria: { label: e.title + ': ' + e.clause }
      });
      dot.title = e.title + ' \u2014 ' + e.clause;
      if (svc.icons) dot.appendChild(svc.icons.get(e.icon, 7));
      /* Each dot opens its OWN popup. In a reading surface a popup is the only detail that does not
       * reflow the prose, which is why every affordance here ends in one. */
      self._on(dot, 'click', function (ev) {
        svc.popup.open({
          anchorEl: ev.currentTarget, kind: 'panel', width: 340,
          build: function (h, api) { e.sheet(h, api); }
        });
      });
      gutter.appendChild(dot);
    });
    wrap.appendChild(gutter);

    /* ---- the one quiet line. Condensed it reads `Show work`; expanded it is the sentence. Either way it
     * is ONE line, and the text morphs in place rather than the row being replaced. */
    var lineEl = u.el('div', { class: 't8-cluster-line' });
    var showWork = this.workShown();
    var text = (complete && !showWork)
      ? 'Show work'
      : entries.map(function (e) { return e.clause; }).filter(Boolean).join(' \u00b7 ');

    var lineBtn = u.el('button', { class: 't8-cluster-text', type: 'button', aria: { pressed: showWork ? 'true' : 'false' } });
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(lineBtn, text);
    else lineBtn.textContent = text;
    /* The line is the global work toggle: this concept already has one, and adding a second control that
     * did the same thing would be two sources of truth for one piece of state. */
    this._on(lineBtn, 'click', function () { self.toggleWork(); });
    lineEl.appendChild(lineBtn);
    wrap.appendChild(lineEl);

    /* ---- expanded: the lines revealed IN PLACE by the global toggle, one per entry. */
    if (showWork) {
      var open = u.el('div', { class: 't8-cluster-lines' });
      entries.forEach(function (e) {
        var row = u.el('button', { class: 't8-cluster-row', type: 'button', data: { kind: e.key } });
        row.appendChild(u.el('span', { class: 't8-cluster-row-kind', text: e.title }));
        row.appendChild(u.el('span', { class: 't8-cluster-row-text', text: e.clause }));
        self._on(row, 'click', function (ev) {
          svc.popup.open({
            anchorEl: ev.currentTarget, kind: 'panel', width: 340,
            build: function (h, api) { e.sheet(h, api); }
          });
        });
        open.appendChild(row);
      });
      wrap.appendChild(open);
    }

    host.appendChild(wrap);

    this._handoffHost = u.el('div', { class: 't8-handoff-host' });
    host.appendChild(this._handoffHost);
    this._renderHandoff(this._handoffHost);
  };

  /* ---------------------------------------------------------------- the run: dots in the gutter,
   * one sentence at the measure, and a footnote when the reader asks
   *
   * t8's reading of `reference/videos/03_compact_execution_activity.mov`, whose five behaviours
   * `shared/runtrace.js` indexes frame by frame. The reference draws the run as a capsule with a
   * glyph chain inline to the left of a headline; this concept has spent its whole design refusing
   * that shape, so the same behaviours are stated in the two marks it already owns - a micro-gutter
   * dot and a footnote:
   *
   *   - THE GUTTER IS THE CHAIN. One dot per entered phase, in entry order, each a real button that
   *     reopens THAT phase: the pencil at f.1170 reopens `Made 1 create, 2 edits`, the magnifier at
   *     f.1300 reopens `Explored 7 files`. The dots already say "machinery happened here" in this
   *     concept, so an index into the run costs no new vocabulary and no width.
   *   - A PHASE DISCLOSES AS A FOOTNOTE at the reading measure, numbered to its dot and set under the
   *     sentence rather than inside it. A footnote is what a reading page does with detail it refuses
   *     to let interrupt the prose.
   *   - ONE SENTENCE, REWRITTEN IN PLACE: the count morphs digit-only (f.208 -> f.286 -> f.338) and
   *     the verb flips from participle to past tense when the phase settles (f.194 versus f.1170).
   *   - CONDENSED IS THE RESTING STATE (f.910): the sentence becomes `13 tools used` while the dots
   *     stay. That is already this concept's stated rule for its work cluster - the reader never
   *     loses the fact that machinery exists, only the sentence about it.
   *
   * What is deliberately NOT carried over is the reference's TRAVEL, and that refusal is narrower than
   * it used to be stated here. `motion.phaseHandover` opens the arriving glyph's slot laterally so the
   * label is pushed right by one slot; this chain runs DOWN a gutter, where animating `slot.style.width`
   * would squash a 12px dot to nothing and push no label at all, because there is no label beside it to
   * push. That call is still refused and the refusal is still correct.
   *
   * The ORDER the reference spends f.194-211 establishing is a different thing, and it is implemented
   * here in this concept's own geometry - see `_startRunHandover`. The outgoing phase lets go of the
   * sentence first (f.198-200) and the arriving phase's dot appears on the next beat (f.205-209),
   * which is the causal claim the recording makes: the work moved on, and what it did is still here.
   * Said as one frame - a dot appearing at the same instant the sentence changes - the chain reads as
   * the run being replaced rather than extended. The dot arrives with the same opacity-and-6px-rise
   * this concept uses for everything else, and the height leg of `groupReopen` is suppressed by
   * construction below. A concept that abandons its own discipline to match a reference has copied
   * the look instead of the logic; a concept that refuses the logic because it cannot use the look
   * has thrown away the part that was worth having.
   */

  /* What the run capsule last PAINTED, read off the elements that painted it.
   *
   * countMorph animates from the string an element ALREADY CONTAINS, and this concept empties and
   * rebuilds its whole surface host on every view change - so the span handed to countMorph is always
   * brand new and empty, and without the previous string every tick would take the entrance path and
   * no digit would ever move. The previous paint is a fact about the last frame, not about the run,
   * and the DOM is where it is already true; reading it here keeps it out of an instance field, which
   * is the mistake `shared/runtrace.js` records under WHERE THE STATE LIVES. A genuine remount finds
   * an empty host and therefore writes flat - correct, because a remount has nothing to morph FROM. */
  T8Thread.prototype._runPaint = function (host) {
    var out = { verb: null, arg: null, openId: null };
    if (!host || !host.querySelector) return out;
    var v = host.querySelector('.t8-run-verb');
    var a = host.querySelector('.t8-run-arg');
    var note = host.querySelector('.t8-run-note');
    if (v) out.verb = v.textContent;
    if (a) out.arg = a.textContent;
    if (note) out.openId = note.getAttribute('data-phase');
    return out;
  };

  /* countMorph, never swapText: `6 files` becoming `7 files` has to move the digits and leave the
   * word `files` in the layout box it already had (f.208 -> f.338). A cross-fade of the whole label
   * reads as the line being replaced, which is the difference between a running tally and a series of
   * different sentences. countMorph falls back to a label swap on its own when the WORDS changed too,
   * which is the honest outcome - at that point the sentence really did change.
   *
   * Unchanged text is written flat. A re-render caused by something else entirely - a keystroke in
   * the composer touches `view.draft`, which reaches update() by the same `view` prefix - must not
   * replay the digit, both because animating 7 into 7 claims work that did not happen and because a
   * reading column that twitches while you read it is the one thing this concept cannot afford. */
  T8Thread.prototype._morphRun = function (el, prior, next) {
    var motion = this.ctx.services.motion;
    var text = next == null ? '' : String(next);
    if (prior == null || prior === text || !motion || !motion.countMorph) {
      el.textContent = text;
      return;
    }
    el.textContent = prior;
    motion.countMorph(el, text);
  };

  /* How long a handover may sit between its beats before the build stops waiting for it, in ms.
   * Generous next to the 110ms the second beat actually waits, because the only thing this number
   * decides is when a beat that will NEVER land - a tab backgrounded mid-run, a timer the page never
   * got to - stops costing the gutter a dot. */
  var HANDOVER_STUCK_MS = 900;

  /* What the chain has already PAINTED, per thread: which phases have a dot in the gutter, whose
   * sentence the line last carried, and whether a handover is currently between its two beats.
   *
   * This is the one piece of run state this concept keeps in a field rather than reading back off the
   * DOM, and the reason is that it is not a fact about the last paint - it is a fact about a beat that
   * has not finished yet, which nothing in the document can be asked about. It is keyed by thread id
   * and pruned against the live chain on every read, so a reset leaves nothing behind claiming to have
   * been painted. */
  T8Thread.prototype._runChainMemo = function (run) {
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

  /* One dot of the chain: a phase, as a button that reopens it. Factored out of the build because the
   * second beat of a handover adds exactly one of these to the gutter the build produced. */
  T8Thread.prototype._buildRunDot = function (p, index, isOpen, disclose) {
    var self = this, u = U(), svc = this.ctx.services;
    var name = (svc.icons && svc.icons.has && svc.icons.has(p.glyph)) ? p.glyph : 'dot';
    /* Each dot sits in its own slot, which is the shared chain's contract: the slot is the box a chain
     * animation would open. This concept never opens one - see the header - but a chain whose markup
     * disagreed with the helper it is handed to would be a chain in name only. */
    var slot = u.el('span', { class: 'pmx-chain-slot' });
    var stateWord = p.running ? 'running' : (isOpen ? 'open' : 'finished');
    /* The ordinal is the tie between the dot and its footnote number, and the state is a WORD in the
     * label rather than a colour, because a dot that said "running" in colour alone would say nothing
     * to a reader who cannot see the difference. */
    var says = (index + 1) + '. ' + p.headline + ' — ' + stateWord;
    var dot = u.el('button', {
      class: 't8-run-dot', type: 'button',
      data: { kind: p.kind, state: p.running ? 'running' : (isOpen ? 'open' : 'done') },
      aria: { expanded: isOpen ? 'true' : 'false', label: says }
    });
    dot.title = says;
    if (svc.icons) dot.appendChild(svc.icons.get(name, 7));
    this._on(dot, 'click', function () { disclose(p.id); });
    slot.appendChild(dot);
    return { slot: slot, dot: dot };
  };

  /* THE TWO BEATS, 03_compact_execution_activity.mov f.194-211, in this concept's own geometry.
   *
   * Beat one is the sentence letting go: both halves cross-fade to nothing through `swapText`. Beat
   * two, one cross-fade later, adds the arriving phase's dot to the gutter and writes the new sentence.
   * 110ms is `swapText`'s own cross-fade and is also what `motion.phaseHandover` waits between its
   * beats, so this reads at the same tempo as the seven concepts that can use the primitive directly -
   * the only thing borrowed from it, because its lateral slot opening is the part this geometry has to
   * refuse (see the header above `_runPaint`).
   *
   * The deviation from the reference, stated rather than glossed: there the new LABEL fades in a few
   * frames before the new glyph (f.201-203 against f.205-209), so the sentence arrives first and the
   * glyph follows it. Here the sentence and the dot arrive together on beat two. Splitting them would
   * need a third beat shorter than a frame at this tempo, and the causal order the recording is about
   * - let go, then arrive - is carried by the two beats that are here. */
  T8Thread.prototype._startRunHandover = function (arriving, chain, verbEl, argEl, disclose) {
    var self = this, svc = this.ctx.services;
    var memo = this._runChainMemo(null);
    var landed = false;

    memo.pending = { id: arriving.id, at: Date.now(), timer: null };

    function land() {
      if (landed) return;
      landed = true;
      memo.pending = null;
      memo.seen[arriving.id] = true;

      var run = (svc.runtrace && svc.runtrace.read) ? svc.runtrace.read(self.tid()) : null;
      /* Re-read rather than trusted: 110ms is long enough for the phase to have ticked its count, or
       * for the reader to have opened another phase, and beat two must state what is true now. */
      var phase = null, index = 0, i;
      if (run) {
        for (i = 0; i < run.chain.length; i++) {
          if (run.chain[i].id === arriving.id) { phase = run.chain[i]; index = i; }
        }
      }
      var into = (self._runChainEl && self._runChainEl.isConnected) ? self._runChainEl : chain;
      var say = self._runSentenceEls || { verb: verbEl, arg: argEl };
      if (!run || !phase || !into || !into.isConnected) return;

      var isOpen = !!(run.open && run.open.id === phase.id);
      var made = self._buildRunDot(phase, index, isOpen, self._runDisclose || disclose);
      into.appendChild(made.slot);
      /* The dot arrives with this concept's ONE entrance - opacity and a 6px rise - which is the same
       * one-shot the question footnote and the run footnote use. A dot that appeared by some other
       * means would be a second entrance answering the same question about the same column. */
      if (global.PMXReveal && global.PMXReveal.oneShot) global.PMXReveal.oneShot(made.dot, 't8-run-rise', 360);

      var subject = run.running || (run.chain.length ? run.chain[run.chain.length - 1] : null);
      var resting = run.condensed;
      /* Written flat, not morphed: the elements are empty after beat one, so there is nothing to morph
       * FROM, and a phase change is not a count tick in any case. */
      if (say.verb) say.verb.textContent = resting ? run.summaryLabel : (subject ? subject.verb : '');
      if (say.arg) {
        say.arg.textContent = resting
          ? (run.workedSeconds ? 'worked for ' + F().duration(run.workedSeconds) : '')
          : (subject ? subject.argument : '');
      }
      memo.subjectId = subject ? subject.id : null;

      /* The chain is rolled only once the dot it should roll to exists. */
      if (svc.motion && svc.motion.chainRoll) self._rollRunChain(into, made.dot);
    }

    /* Beat one. Both halves let go together, which is what the reference does at f.198-200 with the
     * label and the reasoning text under it. */
    if (svc.motion && svc.motion.swapText) {
      svc.motion.swapText(verbEl, '');
      svc.motion.swapText(argEl, '');
    } else {
      verbEl.textContent = '';
      argEl.textContent = '';
    }

    memo.pending.timer = global.setTimeout(land, 110);
    /* The lander is exposed so a teardown can land the beat rather than abandon it: an interrupted
     * beat must arrive at its end state, never be left mid-flight. */
    memo.pending.land = land;
  };

  /* Appends the run capsule, and its footnote when a phase is disclosed. Renders NOTHING at all when
   * the service is absent, when the thread has no activity stages, or when the run has not started:
   * an empty frame that reserved space for work which has not happened is what the work surface
   * contract forbids, and it is why read() returns null rather than an empty husk. */
  T8Thread.prototype._buildRunCapsule = function (host, prior) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    if (!host || !svc.runtrace || !svc.runtrace.read) return;

    var run = svc.runtrace.read(this.tid());
    if (!run || !run.started) return;

    prior = prior || { verb: null, arg: null, openId: null };
    var open = run.open;
    /* THE SENTENCE IS ABOUT THE RUN, NEVER ABOUT THE OPENED PHASE, and this is the one place in the
     * eight concepts where that is true. It is a decision, it is deliberate, and it is worth reading
     * before it is changed.
     *
     * `run.open` is absent from this derivation on purpose: the subject is whatever is RUNNING, else
     * the last thing the run did. `run.condensed` then overrides even that, because a resting run has
     * no subject at all - it has a total. The other seven concepts start their derivation with
     * `run.open`, so clicking a glyph rewrites their headline to the phase you opened.
     *
     * Why this one does not: the disclosed phase is already printed, in full, three lines below, as
     * the footnote's own head - verb, argument, duration and status. Making it the subject of the
     * sentence as well would print the same headline twice in one block, and a page that says a thing
     * twice has not emphasised it, it has stuttered. The division of labour here is the one a printed
     * page already has: the line says what the run is doing, the footnote says what phase 2 did, and
     * NEITHER RESTATES THE OTHER.
     *
     * This is what `tools/drive.mjs` reports as `sentenceRowFollowsOpenPhase: false` for t8, separately
     * from its pass/fail verdict. That report is reading this decision, not a defect: the capsule DOES
     * show the opened phase - the harness's `everyGlyphOpensToItsOwnHeadline` reads it from the
     * footnote and passes - and what is false is only that the SENTENCE ROW follows the click. A
     * reader of that report who lands here should leave with the difference clear. */
    var subject = run.running || (run.chain.length ? run.chain[run.chain.length - 1] : null);
    var resting = run.condensed;

    var cap = u.el('div', {
      class: 't8-run',
      data: {
        condensed: run.condensed ? '1' : '0',
        running: run.running ? '1' : '0',
        open: open ? open.id : ''
      }
    });

    /* Disclosure goes through groupReopen, which is the contract's verb for it (f.910: what sits below
     * a reopened phase is pushed down, never replaced). Two things about that call are worth stating
     * exactly, because both were measured rather than assumed.
     *
     * ITS HEIGHT LEG IS SUPPRESSED, deliberately. groupReopen also interpolates the height of the
     * element it is handed, and a block that springs its own height in a reading column shoves every
     * line below it - the one thing this concept says it will never do, in the same words, above
     * `@keyframes t8-qnote-rise`. The three properties it writes are cleared on the spot; the helper's
     * later frame then finds the element already at its natural height and has nothing to travel.
     * Verified after a dot click, on the frame and again once settled: `.t8-run` carries no inline
     * height, transition or overflow at any point.
     *
     * ITS SIBLING FLIP is inert here, for a reason that belongs to this workspace rather than to the
     * helper: `expand` is a store write, the store re-renders synchronously, and renderSurfaces empties
     * and rebuilds the host - so the siblings groupReopen measured are detached by the time it would
     * play them forward, and it correctly skips them. The work cluster and the artifact footnote land
     * at their new positions without travelling, which is again what this concept wants. The call
     * stays because it states the causal intent, and it would carry those siblings the day this
     * surface stops being rebuilt from scratch. */
    function disclose(phaseId) {
      var act = function () { svc.runtrace.open(self.tid(), phaseId); };
      if (!svc.motion || !svc.motion.groupReopen) { act(); return; }
      svc.motion.groupReopen(cap, act);
      cap.style.height = '';
      cap.style.overflow = '';
      cap.style.transition = '';
    }

    /* ---- the micro-gutter IS the chain: one dot per entered phase, in entry order.
     *
     * The phase that is ARRIVING is withheld here and added on the next beat - see the header and
     * `_startRunHandover`. Everything else is painted now. */
    var memo = this._runChainMemo(run);
    if (memo.pending && (Date.now() - memo.pending.at) > HANDOVER_STUCK_MS) {
      memo.seen[memo.pending.id] = true;
      memo.pending = null;
    }
    var pending = memo.pending;

    var last = run.chain.length ? run.chain[run.chain.length - 1] : null;
    var arriving = null;
    if (!pending && last && !memo.seen[last.id] && memo.subjectId && memo.subjectId !== last.id
        && !resting && !(svc.motion && svc.motion.reduced && svc.motion.reduced(this.root))) {
      /* A handover needs an OUTGOING sentence to let go of. The first paint of a run has none - and
       * neither does the paint of a run that was already several phases long when this concept first
       * saw it - so every dot is painted at once and nothing is deferred. Under reduced motion the
       * same is true by construction: there are no beats to put in order, only the end state. */
      arriving = last;
    }
    var withheld = (pending && pending.id) || (arriving && arriving.id) || null;

    var chain = u.el('div', { class: 't8-run-gutter pmx-chain' });
    var activeDot = null;
    run.chain.forEach(function (p, i) {
      if (withheld === p.id) return;
      var isOpen = !!(open && open.id === p.id);
      var made = self._buildRunDot(p, i, isOpen, disclose);
      if (isOpen) activeDot = made.dot;
      chain.appendChild(made.slot);
      memo.seen[p.id] = true;
    });
    cap.appendChild(chain);

    /* ---- the one restrained sentence, morphed in place */
    var line = u.el('div', { class: 't8-run-line' });
    var sentence = u.el('button', {
      class: 't8-run-sentence', type: 'button',
      aria: { expanded: open ? 'true' : 'false' }
    });
    var verbEl = u.el('span', { class: 't8-run-verb' });
    var argEl = u.el('span', { class: 't8-run-arg' });

    /* Resting, the sentence states the whole run as a total and the duration follows it in this
     * concept's own words - `worked for 38s` is the phrase the artifact footnote already uses. */
    var verbText, argText;
    if (pending) {
      /* A rebuild BETWEEN the beats. renderSurfaces rebuilds this capsule on every view change and one
       * activity verb reaches this concept as two of them, so the state beat one left has to be
       * reproduced rather than overwritten: the sentence has already let go and beat two has not
       * written the next one yet. */
      verbText = '';
      argText = '';
    } else if (arriving) {
      /* Beat one is a cross-fade OUT, so the line has to be built still holding the sentence it is
       * about to release - built empty it would cut, not let go. `prior` is what the last paint of
       * these two spans said, which is exactly what is on screen at this instant. */
      verbText = prior.verb || '';
      argText = prior.arg || '';
    } else {
      verbText = resting ? run.summaryLabel : (subject ? subject.verb : '');
      argText = resting
        ? (run.workedSeconds ? 'worked for ' + F().duration(run.workedSeconds) : '')
        : (subject ? subject.argument : '');
    }

    this._morphRun(verbEl, prior.verb, verbText);
    this._morphRun(argEl, prior.arg, argText);
    sentence.appendChild(verbEl);
    /* A real space, not a flex gap. The gap is what the reference implementations use, and it makes
     * the sentence read as `Reading5 files` to find-in-page, to a screen reader and to the harness
     * that samples this header - a visible gap is not a word boundary. The button therefore needs no
     * aria-label: its accessible name is the sentence itself, which cannot drift from it. */
    sentence.appendChild(global.document.createTextNode(' '));
    sentence.appendChild(argEl);

    /* One control, three meanings, in the order a reader means them: dismiss the footnote that is
     * open, disclose a condensed run, condense a live one. */
    this._on(sentence, 'click', function () {
      if (open) { svc.runtrace.close(self.tid()); return; }
      if (run.condensed) { disclose(null); return; }
      svc.runtrace.condense(self.tid());
    });
    line.appendChild(sentence);
    cap.appendChild(line);

    /* ---- the footnote, when a phase is disclosed.
     *
     * It sits INSIDE the capsule, spanning both of its columns, so the run is one block: the number in
     * the footnote's gutter lands in the same 18px column as the dot it answers to, and the whole of
     * what the run is saying can be read - by a person or by a harness - from one root. */
    if (open) cap.appendChild(this._buildRunFootnote(run, open, prior));
    host.appendChild(cap);

    /* The elements the deferred beat writes into. They are re-read from the instance rather than
     * closed over, because a rebuild between the beats replaces all three and a closure would put the
     * arriving dot in a gutter that is no longer in the document. */
    this._runChainEl = chain;
    this._runSentenceEls = { verb: verbEl, arg: argEl };
    this._runDisclose = disclose;

    if (arriving) this._startRunHandover(arriving, chain, verbEl, argEl, disclose);

    /* A handover rolls the chain itself once its second beat has landed - rolling toward a dot that
     * does not exist yet would scroll to where it is about to be and then jump. */
    if (!arriving && !pending) this._rollRunChain(chain, activeDot);

    if (!pending && !arriving) memo.subjectId = subject ? subject.id : null;
  };

  /* The chain SCROLLS rather than truncating, and brings the phase being read back into view. The
   * reference caps its own chain at six glyphs and rolls the oldest off as a seventh phase starts
   * (f.910); the glyph is scrolled out, never dropped, because the glyph IS the route back to that
   * phase and dropping it would silently make part of the run unreachable. The same rule holds here,
   * turned ninety degrees: the gutter caps its height in CSS and scrolls. */
  T8Thread.prototype._rollRunChain = function (chain, into) {
    var svc = this.ctx.services;
    if (!chain || !svc.motion || !svc.motion.chainRoll) return;
    global.requestAnimationFrame(function () {
      if (!chain.isConnected) return;
      svc.motion.chainRoll(chain, into ? { into: into } : null);
      /* chainRoll rolls a chain along its own axis, and its axis is horizontal. This one runs down the
       * gutter, so the vertical half is done here rather than by widening the shared helper - a column
       * is t8's geometry, not a change to the contract. It is a scroll offset and not a transition, so
       * it adds no travel to a concept that has refused travel. */
      if (chain.scrollHeight <= chain.clientHeight + 1) return;
      if (!into) { chain.scrollTop = chain.scrollHeight; return; }
      var cr = chain.getBoundingClientRect();
      var ir = into.getBoundingClientRect();
      if (ir.top < cr.top) chain.scrollTop += (ir.top - cr.top) - 4;
      else if (ir.bottom > cr.bottom) chain.scrollTop += (ir.bottom - cr.bottom) + 4;
    });
  };

  /* One phase, as a footnote: numbered to its dot, at the reading measure, and carrying the operation
   * record itself.
   *
   * PMXOpCard is the owner of the operation fields, and until now this concept consumed none of them
   * - COMMAND, PROVIDER, CACHE, PERMISSION, COST and OPERATION_INPUT appeared nowhere in it, so a
   * reader could see THAT a tool ran and never what it was handed or whether the profile granted it.
   * A footnote is the right register for them: they are the apparatus of a sentence, they belong
   * under it rather than in it, and every value is printed as the record states it. PERMISSION in
   * particular is derived from the live access profile, so re-deriving any of it here is how two
   * surfaces start disagreeing about the same operation. */
  T8Thread.prototype._buildRunFootnote = function (run, phase, prior) {
    var u = U();
    var svc = this.ctx.services;

    var index = 0;
    for (var i = 0; i < run.chain.length; i++) if (run.chain[i].id === phase.id) index = i + 1;

    var note = u.el('div', { class: 't8-run-note', data: { phase: phase.id, kind: phase.kind } });
    note.appendChild(u.el('div', { class: 't8-run-note-gutter' }, [
      u.el('sup', { class: 't8-run-note-num', text: String(index) })
    ]));

    var body = u.el('div', { class: 't8-run-note-body' });

    /* The operation record for this phase. `forThread` is the reading that carries the stage's own
     * label, which is where the past tense lives; the phase record alone does not have it. */
    var rec = null;
    if (svc.opcard && svc.opcard.forThread) {
      var recs = svc.opcard.forThread(this.ctx, this.tid()) || [];
      for (var r = 0; r < recs.length; r++) if (recs[r].id === phase.id) rec = recs[r];
    }

    /* Spaces between the spans are REAL TEXT NODES, not margins. This block is prose, and a margin is
     * a gap a reader can see but not one the text contains: without them the footnote said
     * `Read7 files2sCOMPLETED` to a screen reader, to find-in-page and to anything else that reads
     * the record rather than looks at it. */
    var head = u.el('p', { class: 't8-run-note-head' });
    function word(node) {
      if (head.firstChild) head.appendChild(global.document.createTextNode(' '));
      head.appendChild(node);
    }
    word(u.el('span', { class: 't8-run-note-verb', text: phase.verb }));
    if (phase.argument) word(u.el('span', { class: 't8-run-note-arg', text: phase.argument }));
    /* A duration is printed only once the phase is DONE: `durationMs` is how long the stage took, so
     * stating it beside a phase that is still running would report a measurement not yet made. */
    if (phase.status === 'done' && phase.durationMs) {
      word(u.el('span', {
        class: 't8-run-note-time', text: F().duration(Math.round(phase.durationMs / 1000))
      }));
    }
    if (rec) word(u.el('span', { class: 't8-run-note-status', text: rec.statusLabel }));
    body.appendChild(head);

    /* Why it ran comes first, because it is the only line that says whether it should have run. */
    if (rec && rec.why) body.appendChild(u.el('p', { class: 't8-run-note-why', text: rec.why }));
    if (phase.detail) body.appendChild(u.el('p', { class: 't8-run-note-detail', text: phase.detail }));

    /* The rows as a real ordered list, for the same reason the question's options are one: the
     * numbering is the browser's and the semantics come free. */
    var rows = phase.rows || [];
    if (rows.length) {
      var list = u.el('ol', { class: 't8-run-files' });
      rows.forEach(function (row) {
        var li = u.el('li', { class: 't8-run-file' });
        function part(node) {
          if (li.firstChild) li.appendChild(global.document.createTextNode(' '));
          li.appendChild(node);
        }
        if (row.verb) part(u.el('span', { class: 't8-run-file-verb', text: row.verb }));
        part(u.el('span', { class: 't8-run-file-target', text: row.target || row.label || '' }));
        if (row.added != null || row.removed != null) {
          /* The sign carries the meaning, so the delta needs no colour of its own - which is also the
           * only reading of it that survives a reader who cannot tell red from green. */
          part(u.el('span', {
            class: 't8-run-file-delta',
            text: '+' + (row.added || 0) + ' \u2212' + (row.removed || 0)
          }));
        }
        list.appendChild(li);
      });
      body.appendChild(list);
    }

    /* The six fields as a real definition list: they ARE definitions, and a footnote of key/value
     * pairs is the one shape this concept can print them in without becoming a panel. */
    if (rec && rec.fields && rec.fields.length) {
      var dl = u.el('dl', { class: 't8-run-fields' });
      rec.fields.forEach(function (f) {
        dl.appendChild(u.el('dt', { class: 't8-run-field-k', text: f.key }));
        dl.appendChild(u.el('dd', { class: 't8-run-field-v', text: f.value }));
      });
      body.appendChild(dl);
    }

    if (rec && rec.chips && rec.chips.length) {
      var chips = u.el('p', { class: 't8-run-note-chips' });
      rec.chips.forEach(function (c) {
        if (chips.firstChild) chips.appendChild(global.document.createTextNode(' \u00b7 '));
        chips.appendChild(u.el('span', {
          class: 't8-run-chip',
          text: c.label + (c.artifactId ? ' \u00b7 ' + c.artifactId : '')
        }));
      });
      body.appendChild(chips);
    }

    note.appendChild(body);

    /* This concept's whole choreography, and the only one it allows the footnote: opacity and a 6px
     * rise, the same one-shot the question footnote uses. It runs only when the DISCLOSURE CHANGED -
     * a re-render caused by anything else must not replay an entrance for a block that was already
     * open, which is the same rule `motion.firstVisit` states for a revisited question.
     *
     * The QUESTION now calls that primitive directly rather than restating the rule (see
     * `_choreographFootnote`). This one still cannot: `firstVisit` stamps its ledger on an element and
     * answers for that element's lifetime, and this note is rebuilt from scratch on every render of
     * the capsule - there is nothing here that lives long enough to be asked twice. What it keys off
     * instead is the LAST PAINT, read back off the document by `_runPaint`, which is the same fact in
     * the only place this block has to keep it. */
    var R = global.PMXReveal;
    if (R && R.oneShot && prior && prior.openId !== phase.id) R.oneShot(note, 't8-run-rise', 360);

    return note;
  };

  T8Thread.prototype._verificationRecord = function () {
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].verification) return msgs[i].verification;
    return null;
  };

  /* ---- sheets: popups, because prose must not reflow to show machinery. */

  T8Thread.prototype._sheetGoal = function (host, goal, api) {
    var self = this, u = U();
    var svc = this.ctx.services;
    host.appendChild(u.el('div', { class: 't8-sheet-title', text: goal.title || 'Goal' }));
    if (goal.objective) host.appendChild(u.el('div', { class: 't8-sheet-row' }, [
      u.el('span', { class: 't8-sheet-k', text: 'Objective' }),
      u.el('span', { class: 't8-sheet-v', text: goal.objective })
    ]));
    if (goal.status === 'blocked' && goal.blocker) {
      var b = goal.blocker;
      [['Cause', b.cause], ['Affected', b.affectedScope], ['Tried', b.lastAttemptedRecovery],
       ['Stopped because', b.whyRecoveryStopped], ['Next safe action', b.nextSafeAction]].forEach(function (r) {
        if (!r[1]) return;
        host.appendChild(u.el('div', { class: 't8-sheet-row' }, [
          u.el('span', { class: 't8-sheet-k', text: r[0] }),
          u.el('span', { class: 't8-sheet-v', text: r[1] })
        ]));
      });
    }
    var acts = u.el('div', { class: 't8-sheet-foot' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (action) {
      if (svc.surfaces.canAct && !svc.surfaces.canAct(goal, action)) return;
      var btn = u.el('button', { class: 't8-act', type: 'button', text: action.charAt(0).toUpperCase() + action.slice(1) });
      self._on(btn, 'click', function () {
        svc.surfaces.act(self.tid(), action);
        if (api && api.close) api.close();
      });
      acts.appendChild(btn);
    });
    if (acts.childNodes.length) host.appendChild(acts);
  };

  T8Thread.prototype._sheetTodo = function (host, todo) {
    var u = U();
    host.appendChild(u.el('div', { class: 't8-sheet-title', text: 'Tasks' }));
    var list = u.el('div', { class: 't8-sheet-list pmx-scroll' });
    (todo.items || []).forEach(function (it) {
      list.appendChild(u.el('div', { class: 't8-sheet-row' }, [
        u.el('span', { class: 't8-sheet-k', text: F().label(it.state) }),
        u.el('span', { class: 't8-sheet-v', text: it.label })
      ]));
    });
    host.appendChild(list);
  };

  T8Thread.prototype._sheetAgents = function (host, group) {
    var u = U();
    host.appendChild(u.el('div', { class: 't8-sheet-title', text: group.label || 'Agents' }));
    var list = u.el('div', { class: 't8-sheet-list pmx-scroll' });
    (group.agents || []).forEach(function (ag) {
      list.appendChild(u.el('div', { class: 't8-sheet-row' }, [
        u.el('span', { class: 't8-sheet-k', text: F().label(ag.status) }),
        u.el('span', { class: 't8-sheet-v', text: ag.name + ' \u2014 ' + (ag.currentActivity || ag.task || '') })
      ]));
    });
    host.appendChild(list);
  };

  T8Thread.prototype._sheetStages = function (host, stages) {
    var u = U();
    host.appendChild(u.el('div', { class: 't8-sheet-title', text: 'Activity' }));
    var list = u.el('div', { class: 't8-sheet-list pmx-scroll' });
    stages.forEach(function (st) {
      list.appendChild(u.el('div', { class: 't8-sheet-row' }, [
        u.el('span', { class: 't8-sheet-k', text: F().label(st.kind) }),
        u.el('span', { class: 't8-sheet-v', text: st.label + (st.detail ? ' \u2014 ' + st.detail : '') }),
        u.el('span', { class: 't8-sheet-k', text: st.durationMs != null ? F().duration(Math.round(st.durationMs / 1000)) : '' })
      ]));
    });
    host.appendChild(list);
  };

  T8Thread.prototype._sheetDiff = function (host, group) {
    var self = this, u = U();
    host.appendChild(u.el('div', { class: 't8-sheet-title', text: group.label || 'Changes' }));
    var list = u.el('div', { class: 't8-sheet-list pmx-scroll' });
    (group.files || []).forEach(function (f) {
      var row = u.el('button', { class: 't8-sheet-row', type: 'button' }, [
        u.el('span', { class: 't8-sheet-k', text: F().label(f.status) }),
        u.el('span', { class: 't8-sheet-v', text: f.path }),
        u.el('span', { class: 't8-sheet-k', text: '+' + (f.added || 0) + ' \u2212' + (f.removed || 0) })
      ]);
      self._on(row, 'click', function () {
        self.ctx.services.editorHost.openArtifact(
          { id: 'file-' + f.path, title: f.path, kind: 'file', projectPath: f.path }, self.ctx);
      });
      list.appendChild(row);
    });
    host.appendChild(list);
  };

  T8Thread.prototype._sheetAdvice = function (host, advice) {
    var self = this, u = U();
    var bsd = this.ctx.services.bsd;
    host.appendChild(u.el('div', { class: 't8-sheet-title', text: 'Back Seat Driver' }));
    advice.forEach(function (adv) {
      var row = u.el('div', { class: 't8-advice', data: { severity: adv.severity } });
      row.appendChild(u.el('span', { class: 't8-advice-kind', text: adv.severity === 'caution' ? 'Caution' : 'Note' }));
      row.appendChild(u.el('p', { class: 't8-advice-text', text: adv.text }));
      if (adv.evidenceRefs && adv.evidenceRefs.length) {
        row.appendChild(u.el('span', { class: 't8-advice-ev', text: adv.evidenceRefs.join(', ') }));
      }
      /* Dismiss only: advice is read-only and nothing here can apply it. */
      var dis = u.el('button', { class: 't8-act', type: 'button', text: 'Dismiss' });
      self._on(dis, 'click', function () {
        bsd.dismiss(self.tid(), adv.id);
        self.ctx.services.popup.closeAll(null);
      });
      row.appendChild(dis);
      host.appendChild(row);
    });
  };

  /* ---------------------------------------------------------------- artifact handoff, as a footnote */

  T8Thread.prototype._renderHandoff = function (host) {
    var self = this, u = U();
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
    /* A footnote line, at the reading measure: this concept's way of saying something adjacent to the
     * prose without becoming a panel. */
    var card = u.el('div', { class: 't8-handoff', data: { state: state } });
    card.appendChild(u.el('span', { class: 't8-handoff-mark', text: '\u2020' }));
    card.appendChild(u.el('span', { class: 't8-handoff-title', text: ref.title }));

    var stateEl = u.el('span', { class: 't8-handoff-state' });
    var label = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, label);
    else stateEl.textContent = label;
    card.appendChild(stateEl);

    var worked = this._handoffWorkedSeconds();
    if (worked != null) card.appendChild(u.el('span', { class: 't8-handoff-worked', text: 'worked for ' + F().duration(worked) }));

    var open = u.el('button', { class: 't8-handoff-open', type: 'button', text: 'Open' });
    this._on(open, 'click', function () {
      A.open(ref.id);
      /* Settle the simulated transport in the same interaction; the footnote repaints through the
       * artifact subscription, since `open` writes session state that no `view*` key covers. */
      if (A.forceReady) A.forceReady(ref.id);
      if (svc.motion && svc.motion.handoff) svc.motion.handoff(card);
    });
    card.appendChild(open);
    host.appendChild(card);
  };

  T8Thread.prototype._handoffWorkedSeconds = function () {
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

    /* ---------------------------------------------------------------- question: the prose footnote
   *
   * The matrix assigns this concept a PROSE FOOTNOTE: the question renders at the reading measure as a
   * NUMBERED LIST, a gutter dot marks it, and it resolves into a footnote-style receipt line.
   *
   * The register decides everything again. This concept's premise is that the text is the product, so a
   * question cannot be a panel dropped into the column - it has to be something the page could plausibly
   * contain: a numbered list at the same measure, with a mark in the gutter the way a footnote reference
   * sits beside a line.
   *
   * THE MOTION IS NO LONGER "opacity plus a 6px rise only". That sentence stood here and it was the
   * strongest refusal of height motion in the workspace; it now reads: opacity, a 6px rise, and a
   * bottom-anchored resize when the block's SIZE changes between pages. The full accounting of what
   * that answers and what it does not is above `_choreographFootnote`, where the refusal it replaces
   * used to be.
   *
   * `2 of 3` is a superscript-weight marker at the list head - a footnote number, not a progress widget.
   */
  T8Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard: claiming the surfaces notifies the store, which re-enters update(). */
    if (this._inRenderQuestion) return;

    var self = this;
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;

    var R = global.PMXReveal;
    var prevKey = this._qkey || '';
    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;

    /* Which of the footnote's four states this render is: the question itself, the line the
     * questionnaire shows while it prepares or submits, the resolved receipt, or nothing at all. */
    var mode = 'none';
    if (flow && flow.record) {
      mode = (flow.status === 'preparing' || flow.status === 'submitting') ? 'wait' : 'ask';
    } else if (flow && flow.receipt) {
      mode = 'done';
    }

    /* Nothing to say: the block is REMOVED rather than kept empty. Every window's question shelf and
     * the inline slot hide themselves with `:empty`, so a persistent empty block would hold that strip
     * open - a band of padding reserving space for a question that does not exist. */
    if (mode === 'none') {
      this._dropNote();
      this._qkey = R ? R.keyFor(svc, this.tid()) : '';
      return;
    }

    var block = this._ensureNote(host);

    /* `pmx-size-bounce-strong` is the firmer beat, for a change big enough to RESHAPE the block rather
     * than nudge it, and in a question that is the OPTION COUNT changing between pages: a list of three
     * becoming a list of six is a different question, where one prompt running to a second line is the
     * same question saying a little more. */
    var optsNow = (flow.record && flow.question && flow.question.options)
      ? flow.question.options.length : 0;
    var strong = (this._noteOptionCount != null && optsNow !== this._noteOptionCount);
    this._noteOptionCount = optsNow;

    /* A block built THIS render has no previous size, so there is nothing for a resize to be about: it
     * would travel from an empty box to a full one and call an arrival a resize. The rise below is what
     * says "this is new"; the bounce only ever says "this changed size". */
    var born = this._noteIsNew;
    this._noteIsNew = false;

    /* ONE BOUNCE PER CHANGE, not one per render. A single click reaches this twice - `qflow.act`
     * persists, the store notifies and update() renders, then the handler's own `renderQuestion()`
     * renders the same state again - and a second bounce started inside the first one's flight
     * measures a start height mid-transition, finds the content already rebuilt, and takes
     * `resizeBounce`'s bail path, which strips the inline height the first beat was animating. While
     * one is in flight the later render just rebuilds the contents and lets the beat finish. */
    var running = this._noteBounce;
    var busy = !!(running && running.state && running.state() === 'running');

    this._inRenderQuestion = true;
    try {
      var mutate = function () { self._renderQuestionBody(block, flow, mode); };
      if (born || busy || !(svc.motion && svc.motion.resizeBounce)) {
        mutate();
      } else {
        /* The first appearance's rise is over the moment the block starts resizing, and it has to be
         * taken off the element rather than left to time out: `[data-pmx-thread="t8"] .t8-qnote-rise`
         * is a more specific rule than `.pmx-size-bounce-strong`, so a rise still inside its 360ms
         * window when a page change arrives would win the whole `animation` shorthand and the
         * resize's scale beat would silently not play. Answering the first question inside that
         * window is not a corner case - it is what a quick reader does. */
        block.classList.remove('t8-qnote-rise');
        this._noteBounce = svc.motion.resizeBounce(block, mutate, {
          bounceClass: strong ? 'pmx-size-bounce-strong' : 'pmx-size-bounce'
        });
      }
    } finally { this._inRenderQuestion = false; }

    this._choreographFootnote(block, prevKey, mode);
  };

  /* THE BLOCK IS CREATED ONCE AND SURVIVES EVERY RENDER. Only its contents are rebuilt.
   *
   * Two things depend on the element outliving the render that filled it. `resizeBounce` measures a
   * start height, mutates, and measures an end height on the SAME element - a block thrown away and
   * rebuilt has no start height to travel from, so there would be nothing to animate and the question
   * would jump between sizes. And `motion.firstVisit` stamps its ledger on the element, so a block
   * that died every render would have no memory of which questions it had already shown and would
   * replay its entrance on every backward page. */
  T8Thread.prototype._ensureNote = function (host) {
    if (!this._qnote) {
      /* `pmx-resize-up` is the shared opt-in marker for a box that grows into its OWN space instead of
       * pushing what is under it. The block sits directly above the composer in both mounts - a
       * fixed-size row in the window's chat column, or a `flex: 0 0 auto` row at the bottom of
       * `.t8-root` - so the flexible sibling above it is the transcript, and the composer below never
       * moves. See `.t8-qnote.pmx-resize-up`, which is what makes the anchoring real rather than
       * declared: the class's own `margin-top: auto` bites only where the host is a flex column. */
      this._qnote = U().el('div', { class: 't8-qnote pmx-resize-up' });
      this._noteIsNew = true;
    }
    if (this._qnote.parentNode !== host) host.appendChild(this._qnote);
    return this._qnote;
  };

  T8Thread.prototype._dropNote = function () {
    if (this._qnote && this._qnote.parentNode) this._qnote.parentNode.removeChild(this._qnote);
    /* Dropped outright rather than parked: a questionnaire that starts later is a new question and
     * SHOULD rise, and a fresh block with a fresh visit ledger is what says so. */
    this._qnote = null;
    this._noteOptionCount = null;
  };

  /* Opacity plus a 6px rise, and now a bounded height as well.
   *
   * THIS PARAGRAPH USED TO REFUSE HEIGHT MOTION OUTRIGHT - "no height spring, because a block that
   * changes height in a reading column shoves every line below it" - and that refusal was the
   * strongest one in the workspace. It has been overruled deliberately, and the honest accounting is
   * this.
   *
   * What answers it: `pmx-resize-up`. The block is bottom-anchored, so when it grows it is its OWN TOP
   * EDGE that moves, not the content under it. There is no content under it in the column - the
   * composer is below and it does not move - and the prose above does not reflow: the transcript keeps
   * its layout and its scroll offset, so not one line is re-set or re-wrapped. That is most of the
   * objection, and it is a real answer rather than a dodge.
   *
   * What it does NOT answer: the height the block takes comes out of the transcript's VIEWPORT, which
   * is the flexible sibling above it. Nothing moves, but the last line or two of the prose can be cut
   * off at the bottom edge while the block is at its taller size, and a reader whose eye was on the
   * final line will have to scroll to finish it. That is a smaller cost than a question that changes
   * size by jump cut with no motion accounting for it, and it is a cost, not nothing.
   *
   * Nothing else here animates its height: the run capsule, its footnote and the work cluster all
   * still refuse, and `groupReopen`'s height leg is still suppressed where it is called. */
  T8Thread.prototype._choreographFootnote = function (block, prevKey, mode) {
    var R = global.PMXReveal, M = global.PMXMotion;
    if (!R || !block) return;

    var svc = this.ctx.services;
    var key = R.keyFor(svc, this.tid());
    this._qkey = key;

    /* Same question, one more keystroke: silence. */
    if (prevKey === key) return;

    /* The resolution into a receipt is stated by the RESIZE - the block really did become one line -
     * and a rise on top of it would be the footnote claiming to arrive at the moment it shrinks. */
    if (mode === 'done') return;

    /* BACKWARD PAGING MUST NOT REPLAY THE ENTRANCE (02_stable_paged_questionnaire.mov). This concept
     * already hand-rolled that rule for the RUN's footnote, which rises only when the disclosure
     * actually changed; `motion.firstVisit` is the same rule as a primitive, and using it here is what
     * stops a second copy of it existing. The ledger is stamped on the block, which is why the block
     * has to survive: it dies with the element, which is exactly the lifetime a "have I shown this
     * yet" fact has.
     *
     * It is asked BEFORE the reduced-motion check so the ledger records the same visits in either
     * motion mode and toggling the setting cannot resurrect an entrance. */
    var fresh = (M && M.firstVisit) ? M.firstVisit(block, key) : true;
    if (!fresh) return;
    if (R.reduced(block)) return;
    /* THE ENTRANCE AND THE ADVANCE ARE THE SAME BEAT HERE, and that is a decision rather than an
     * oversight. The rise means one thing - new text has appeared in this column - and it is equally
     * true of the first question and of the second. The harnesses report the consequence: the paging
     * suite's "plays something on its entrance that its advance does not" is FALSE for this concept,
     * which makes its "the entrance did not replay" measurement vacuous rather than passing.
     *
     * The behaviour under that metric is still right and is measurable another way: the rise plays on
     * a first visit and does not play on a revisit, which the `data-pmx-visited-all` ledger on this
     * block records directly. Adding a second beat that exists only so the two could be told apart
     * would be motion inserted for a measurement rather than for a reader, which is the failure this
     * whole packet is written against.
     *
     * WHERE it plays is the one thing that differs between the two. On the first appearance the whole
     * footnote is new, mark and all, so the block rises. On a page change the block is already there
     * and it is the PROSE that changed, so the rise plays on the body and the gutter mark holds still
     * - which is what a footnote reference does while the note beside it is rewritten.
     *
     * That split is also what keeps the rise and the resize from fighting. Both are transform
     * animations, and `[data-pmx-thread="t8"] .t8-qnote-rise` is a more specific rule than
     * `.pmx-size-bounce-strong`, so with both classes on one element the rise wins the whole
     * `animation` shorthand and the scale beat silently never plays. Measured, not reasoned about:
     * `getAnimations()` on the block listed the rise and the height transition and no size bounce.
     * On two different elements both play, and each says its own thing. */
    var body = prevKey ? block.querySelector('.t8-qnote-body') : null;
    R.oneShot(body || block, 't8-qnote-rise', 360);
  };

  /* Rebuilds the block's CONTENTS. The block itself belongs to `_ensureNote` and is never replaced
   * here: this runs inside `resizeBounce`'s mutation, which has already measured the element. */
  T8Thread.prototype._renderQuestionBody = function (block, flow, mode) {
    var self = this, u = U();
    var svc = this.ctx.services;
    if (!block || !flow) return;
    U().empty(block);

    /* The resolved block is quieter than the live one and marks itself with a dagger instead of a dot,
     * so both states are carried on the surviving root rather than by two different elements. */
    if (mode === 'done') {
      block.classList.add('t8-qnote-done');
      block.removeAttribute('data-phase');
      this._renderFootnoteReceipt(block, flow.receipt);
      return;
    }
    block.classList.remove('t8-qnote-done');
    block.removeAttribute('data-status');
    block.setAttribute('data-phase', flow.status);

    svc.qflow.claim(svc, this.tid());

    /* ---- the gutter mark. Same micro-gutter the work cluster uses, so a question announces itself the
     * way everything non-prose announces itself here. */
    var gutter = u.el('div', { class: 't8-qnote-gutter' });
    var mark = u.el('span', { class: 't8-qnote-dot' });
    if (svc.icons) mark.appendChild(svc.icons.get('dot', 7));
    mark.title = 'A question is waiting';
    gutter.appendChild(mark);
    block.appendChild(gutter);

    var bodyEl = u.el('div', { class: 't8-qnote-body' });

    if (mode === 'wait') {
      bodyEl.appendChild(u.el('p', {
        class: 't8-qnote-status',
        text: flow.status === 'preparing' ? 'Preparing questions.' : 'Submitting answers.'
      }));
      block.appendChild(bodyEl);
      return;
    }

    /* ---- the head: `2 of 3` as a superscript-weight footnote marker. */
    var head = u.el('p', { class: 't8-qnote-head' });
    head.appendChild(u.el('sup', { class: 't8-qnote-num', text: flow.position + ' of ' + flow.total }));
    head.appendChild(u.el('span', {
      class: 't8-qnote-prompt',
      text: flow.atEnd ? 'That is every question.' : (flow.question ? flow.question.prompt : '')
    }));
    bodyEl.appendChild(head);

    if (flow.question && flow.question.required && !flow.atEnd) {
      bodyEl.appendChild(u.el('span', { class: 't8-qnote-req', text: 'An answer is required.' }));
    }

    /* ---- options as a NUMBERED LIST at the reading measure. An ordered list, because that is what a
     * numbered list is - the semantics come free and the numbering is the browser's, not mine. */
    var q = flow.question;
    if (q && !flow.atEnd) {
      if (q.options && q.options.length) {
        var list = u.el('ol', { class: 't8-qlist' });
        q.options.forEach(function (opt) {
          var li = u.el('li', { class: 't8-qlist-item' });
          var sel = (q.selected || []).indexOf(opt) >= 0;
          var b = u.el('button', { class: 't8-qlist-btn', type: 'button', text: opt, aria: { pressed: sel ? 'true' : 'false' } });
          self._on(b, 'click', function (ev) {
            if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
            svc.qflow.act(svc, self.tid(), 'answer', opt);
            self.renderQuestion();
          });
          li.appendChild(b);
          list.appendChild(li);
        });
        bodyEl.appendChild(list);
      } else {
        var ta = u.el('textarea', { class: 't8-qfree pmx-scroll', aria: { label: q.prompt } });
        ta.setAttribute('spellcheck', 'false');
        ta.value = q.draft || '';
        this._on(ta, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', ta.value); });
        bodyEl.appendChild(ta);
      }
    }

    var reason = u.el('p', { class: 't8-qnote-reason', data: { show: this._pendingReason ? '1' : '0' } });
    if (this._pendingReason) { reason.textContent = this._pendingReason; this._pendingReason = null; }
    bodyEl.appendChild(reason);

    /* ---- the actions, as a quiet footnote row */
    var acts = u.el('div', { class: 't8-qnote-acts' });

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
      var back = u.el('button', { class: 't8-act', type: 'button', text: 'Back' });
      this._on(back, 'click', function () { svc.qflow.act(svc, self.tid(), 'prev'); self.renderQuestion(); });
      acts.appendChild(back);
    }

    if (q && !flow.atEnd) {
      var skip = u.el('button', { class: 't8-act', type: 'button', text: 'Skip' });
      this._on(skip, 'click', function () { svc.qflow.act(svc, self.tid(), 'skip'); self.renderQuestion(); });
      acts.appendChild(skip);
    }

    if (q && flow.isSkipped(q)) {
      var un = u.el('button', { class: 't8-act', type: 'button', text: 'Unskip' });
      this._on(un, 'click', function () { svc.qflow.act(svc, self.tid(), 'unskip', flow.index); self.renderQuestion(); });
      acts.appendChild(un);
    }

    var primary = u.el('button', { class: 't8-act t8-act-primary', type: 'button', text: flow.atEnd ? 'Send' : 'Next' });
    this._on(primary, 'click', function () {
      var res = svc.qflow.act(svc, self.tid(), flow.atEnd ? 'submit' : 'next');
      if (!res.ok) { refuse(res, 'Answer the required questions first.'); return; }
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(primary);

    /* Cancel removes the block and leaves a single footnote - the matrix's requirement. */
    var cancel = u.el('button', { class: 't8-act', type: 'button', text: 'Cancel' });
    this._on(cancel, 'click', function () {
      svc.qflow.act(svc, self.tid(), 'cancel');
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(cancel);

    if (flow.skippedCount) {
      acts.appendChild(u.el('span', {
        class: 't8-qnote-skipped',
        text: flow.skippedCount === 1 ? '1 skipped' : flow.skippedCount + ' skipped'
      }));
    }

    bodyEl.appendChild(acts);
    block.appendChild(bodyEl);
  };

  /* The footnote receipt: one line, marked in the gutter, at the reading measure. It is built INSIDE
   * the surviving block rather than as a block of its own, so the resolution is the same box becoming
   * one line - which is what `resizeBounce` carries. */
  T8Thread.prototype._renderFootnoteReceipt = function (block, receipt) {
    var self = this, u = U();
    if (!receipt) return;

    block.setAttribute('data-status', receipt.status);

    var gutter = u.el('div', { class: 't8-qnote-gutter' });
    gutter.appendChild(u.el('span', { class: 't8-qnote-mark', text: '\u2020' }));
    block.appendChild(gutter);

    var bodyEl = u.el('div', { class: 't8-qnote-body' });
    var line = u.el('p', { class: 't8-qnote-footnote' });
    line.appendChild(u.el('span', {
      class: 't8-qnote-footnote-text',
      text: receipt.cancelled
        ? 'Questions cancelled.'
        : (receipt.answered + (receipt.answered === 1 ? ' answer sent' : ' answers sent') +
           (receipt.skipped ? ', ' + receipt.skipped + ' skipped' : '') + '.')
    }));
    var show = u.el('button', { class: 't8-qnote-link', type: 'button', text: 'Show answers' });
    this._on(show, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 340,
        build: function (h) {
          h.appendChild(u.el('div', { class: 't8-sheet-title', text: receipt.cancelled ? 'Cancelled questions' : 'Answers sent' }));
          (receipt.questions || []).forEach(function (question) {
            var val = receipt.answers[question.id];
            var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't8-sheet-row' }, [
              u.el('span', { class: 't8-sheet-k', text: wasSkipped ? 'skipped' : 'answered' }),
              u.el('span', { class: 't8-sheet-v', text: question.prompt + (val == null ? '' : ' \u2014 ' + [].concat(val).join(', ')) })
            ]));
          });
        }
      });
    });
    line.appendChild(show);
    bodyEl.appendChild(line);
    block.appendChild(bodyEl);
  };

    T8Thread.prototype.syncLive = function () {
    var u = U();
    var s = this.ctx.services.runtime.liveStatus(this.tid());
    if (!s) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null;
      return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't8-live pmx-live' }, [
        u.el('span', { class: 't8-live-dot pmx-pulse' }),
        u.el('span', { class: 't8-live-text' }),
        u.el('span', { class: 't8-live-time' })
      ]);
      this.list.appendChild(this.liveEl);
    }
    /* The dot pulses indefinitely, so it must name the operation it is reporting. `syncLive` only
     * runs while PMXRuntime holds a live run for this thread, and that run registers itself with
     * ObservableWork as `run-<threadId>` — so the binding is exact rather than decorative, and the
     * motion suite can prove it. */
    var opId = 'run-' + this.tid();
    var obs = global.PMXObservable;
    var dot = this.liveEl.querySelector('.t8-live-dot');
    if (dot) {
      if (obs && obs.isRunning && obs.isRunning(opId)) dot.setAttribute('data-pmx-op', opId);
      else dot.removeAttribute('data-pmx-op');
    }
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t8-live-text'), s.text || '');
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t8-live-time'),
      s.workedSeconds != null ? F().duration(s.workedSeconds) : '');
  };

  /* ---------------------------------------------------------------- API */

  T8Thread.prototype.isExpanded = function (id) { return !!this.ctx.store.view(this.tid()).expanded[id]; };

  T8Thread.prototype.setExpanded = function (id, on) {
    var self = this;
    var rec = this.rendered[id];
    this.ctx.store.view(this.tid()).expanded[id] = !!on;
    if (!rec) return;
    this.scrollCtl.preserveAcross(rec.bodyEl, function () {
      rec.bodyEl.setAttribute('data-expanded', on ? '1' : '0');
      var b = rec.bodyEl.querySelector('.t8-more');
      if (b) b.textContent = on ? 'Show less' : 'Show more';
      self.ctx.services.motion.snapToEnd(rec.bodyEl);
    });
  };

  T8Thread.prototype.revealHidden = function (id) { this.setExpanded(id, true); };

  T8Thread.prototype.scrollToMessage = function (id, opts) {
    var rec = this.rendered[id];
    if (!rec) {
      var tid = this.tid();
      var t = this.ctx.data.threadById(tid);
      var idx = -1;
      for (var i = 0; i < t.messages.length; i++) if (t.messages[i].id === id) { idx = i; break; }
      if (idx >= 0) {
        this.ctx.store.view(tid).loadedFrom = Math.max(0, idx - 20);
        this.renderThread();
        rec = this.rendered[id];
      }
    }
    if (!rec) return false;
    this.setExpanded(id, true);
    this.scrollCtl.jumpTo(id, opts || { highlight: true });
    return true;
  };

  T8Thread.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T8Thread.prototype.setAnchor = function (t) { return this.scrollCtl.restoreAnchor(t); };

  T8Thread.prototype.update = function (state, changed) {
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

  T8Thread.prototype.destroy = function () {
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
    /* The block outlives every RENDER, not the instance. Dropping the reference stops a replaced
     * instance from holding a detached footnote with a visit ledger on it. */
    this._qnote = null;
    this._noteOptionCount = null;
    /* A resize caught mid-flight is FINISHED, not abandoned: the contract's rule is that an
     * interrupted beat lands on its end state and leaves no pinned height behind. */
    if (this._noteBounce && this._noteBounce.finish) { try { this._noteBounce.finish(); } catch (e2) {} }
    this._noteBounce = null;
    /* A handover caught between its beats is LANDED rather than abandoned: an interrupted beat must
     * arrive at its end state, and the lander is idempotent. */
    if (this._runChainState && this._runChainState.pending) {
      if (this._runChainState.pending.timer) global.clearTimeout(this._runChainState.pending.timer);
      if (this._runChainState.pending.land) { try { this._runChainState.pending.land(); } catch (e1) {} }
    }
    this._runChainState = null;
    this._runChainEl = null;
    this._runSentenceEls = null;
    this._runDisclose = null;
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this._tickOff) { try { this._tickOff(); } catch (e) {} this._tickOff = null; }
    if (this.scrollCtl && this.scrollCtl.destroy) { try { this.scrollCtl.destroy(); } catch (e) {} }
    [this.root, this.inlineSurfaces, this.inlineQuestion].forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    this.rendered = {};
  };

  global.PMX.thread.register('t8', {
    name: 'Reading Mode',
    blurb: 'Prose gets everything. A right-edge micro-gutter of small markers is the only persistent sign that machinery exists, and one global toggle reveals every work line in place when you want it.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T8Thread(regionEl, ctx);
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
