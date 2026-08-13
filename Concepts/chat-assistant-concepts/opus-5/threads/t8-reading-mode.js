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
    this.showWork = false;
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

  /* One switch reveals every work line at once. Under reduced motion it must flip instantly
   * with no staggered reveal, which is why nothing here animates per element. */
  T8Thread.prototype.toggleWork = function () {
    this.showWork = !this.showWork;
    this.root.setAttribute('data-work', this.showWork ? '1' : '0');
    this.workBtn.textContent = this.showWork ? 'Hide work' : 'Show work';
    this.workBtn.setAttribute('aria-pressed', this.showWork ? 'true' : 'false');
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
    var showWork = !!this.showWork;
    var text = (complete && !showWork)
      ? 'Show work'
      : entries.map(function (e) { return e.clause; }).filter(Boolean).join(' \u00b7 ');

    var lineBtn = u.el('button', { class: 't8-cluster-text', type: 'button', aria: { pressed: showWork ? 'true' : 'false' } });
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(lineBtn, text);
    else lineBtn.textContent = text;
    /* The line is the global work toggle: this concept already has one, and adding a second control that
     * did the same thing would be two sources of truth for one piece of state. */
    this._on(lineBtn, 'click', function () { self.toggleWork(); self.renderSurfaces(); });
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
   * NUMBERED LIST, a gutter dot marks it, and it resolves into a footnote-style receipt line. The motion
   * is opacity plus a 6px rise only, so prose never jumps.
   *
   * The register decides everything again. This concept's premise is that the text is the product, so a
   * question cannot be a panel dropped into the column - it has to be something the page could plausibly
   * contain: a numbered list at the same measure, with a mark in the gutter the way a footnote reference
   * sits beside a line. And because prose must never jump, the choreography is the most restrained of the
   * eight: no bounds interpolation anywhere, only opacity and a 6px rise.
   *
   * `2 of 3` is a superscript-weight marker at the list head - a footnote number, not a progress widget.
   */
  T8Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard: claiming the surfaces notifies the store, which re-enters update(). */
    if (this._inRenderQuestion) return;

    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    var prevKey = this._qkey || '';

    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }

    this._choreographFootnote(host, prevKey);
  };

  /* Opacity plus a 6px rise. Nothing else - and specifically no height spring, because a block that
   * changes height in a reading column shoves every line below it. */
  T8Thread.prototype._choreographFootnote = function (host, prevKey) {
    var R = global.PMXReveal;
    if (!R || !host) return;

    var svc = this.ctx.services;
    var key = R.keyFor(svc, this.tid());
    this._qkey = key;

    /* Same question, one more keystroke: silence. */
    if (prevKey === key) return;

    var block = host.querySelector('.t8-qnote');
    if (!block || R.reduced(block)) return;
    R.oneShot(block, 't8-qnote-rise', 360);
  };

  T8Thread.prototype._renderQuestionBody = function () {
    var self = this, u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    U().empty(host);

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;
    if (!flow) return;

    if (!flow.record) {
      this._renderFootnoteReceipt(host, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    var block = u.el('div', { class: 't8-qnote', data: { phase: flow.status } });

    /* ---- the gutter mark. Same micro-gutter the work cluster uses, so a question announces itself the
     * way everything non-prose announces itself here. */
    var gutter = u.el('div', { class: 't8-qnote-gutter' });
    var mark = u.el('span', { class: 't8-qnote-dot' });
    if (svc.icons) mark.appendChild(svc.icons.get('dot', 7));
    mark.title = 'A question is waiting';
    gutter.appendChild(mark);
    block.appendChild(gutter);

    var bodyEl = u.el('div', { class: 't8-qnote-body' });

    if (flow.status === 'preparing' || flow.status === 'submitting') {
      bodyEl.appendChild(u.el('p', {
        class: 't8-qnote-status',
        text: flow.status === 'preparing' ? 'Preparing questions.' : 'Submitting answers.'
      }));
      block.appendChild(bodyEl);
      host.appendChild(block);
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
    host.appendChild(block);
  };

  /* The footnote receipt: one line, marked in the gutter, at the reading measure. */
  T8Thread.prototype._renderFootnoteReceipt = function (host, receipt) {
    var self = this, u = U();
    if (!receipt) return;

    var block = u.el('div', { class: 't8-qnote t8-qnote-done', data: { status: receipt.status } });

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
    host.appendChild(block);
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
