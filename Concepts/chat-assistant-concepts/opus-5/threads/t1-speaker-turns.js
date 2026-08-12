/* t1 "Speaker Turns" — Opus 5
 *
 * A typographic transcript, not bubbles. Role changes are marked by a hanging speaker label
 * and a hairline rule; assistant prose gets the full measure with generous leading.
 *
 * The bet this concept makes: prose wins completely, and ALL machinery — activity, todo,
 * subagents, diffs, artifacts — is demoted to a single one-line work strip beneath the turn
 * that opens a detail sheet on demand. Nothing nests. That is the direct answer to the
 * primary problem, where telemetry and prose competed at the same visual weight and boxes
 * inside boxes multiplied every wrap at narrow width.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }

  /* Collapse rule for this concept: eligibility at 900 characters, preview clamped to
   * 6 lines. Substantial enough to carry subject and direction, bounded so one message can
   * never own a 520px viewport. */
  var COLLAPSE_ELIGIBLE_CHARS = 900;
  var PREVIEW_LINES = 6;

  function T1Thread(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.rendered = {};      /* msgId -> { el, bodyEl } */
    this.lastThreadId = null;
    this.build();
  }

  T1Thread.prototype._on = function (el, ev, fn, opts) {
    this.offs.push(U().on(el, ev, fn, opts));
  };

  T1Thread.prototype.build = function () {
    var self = this;
    var u = U();

    this.root = u.el('div', { class: 't1-root' });

    this.head = u.el('div', { class: 't1-head' }, [
      u.el('span', { class: 't1-head-name', text: 'Speaker Turns' }),
      u.el('span', { class: 't1-head-model', text: this.ctx.label })
    ]);
    this.root.appendChild(this.head);

    this.scroller = u.el('div', { class: 't1-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't1-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    /* When the window offers no work-surface host, surfaces render inline at the foot of
     * the transcript instead. Two of the eight windows deliberately offer neither, so this
     * path is not a fallback — it is a first-class arrangement. */
    this.inlineSurfaces = u.el('div', { class: 't1-inline-surfaces' });
    this.inlineQuestion = u.el('div', { class: 't1-inline-question' });
    if (!this.ctx.capabilities.workSurfaceHost) this.root.appendChild(this.inlineSurfaces);
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);

    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t1-turn',
      messageAttr: 'data-pmx-msg'
    });

    this.jumpBtn = u.el('button', { class: 't1-jump', text: 'Jump to latest' });
    this._on(this.jumpBtn, 'click', function () {
      self.scrollCtl.scrollToBottom ? self.scrollCtl.scrollToBottom() :
        (self.scroller.scrollTop = self.scroller.scrollHeight);
    });
    /* The pill lives in its OWN lane directly after the scroller, not floating over it.
     * Floating meant the pill sat on top of whatever line happened to be at the bottom of
     * the viewport mid-scroll — measured covering prose at 17 of 24 scroll positions. The
     * lane is a permanent flex item, so the transcript viewport never changes height and
     * the overlap is impossible by construction rather than by clearance arithmetic. */
    this.jumpLane = u.el('div', { class: 't1-jump-lane' });
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

  T1Thread.prototype.tid = function () {
    return this.ctx.store.get('session.activeThreadId');
  };

  /* ---------------------------------------------------------------- rendering */

  T1Thread.prototype.renderThread = function () {
    var tid = this.tid();
    var data = this.ctx.data;
    var view = this.ctx.store.view(tid);
    var msgs = data.visibleSlice(tid, view.loadedFrom);

    U().empty(this.list);
    this.rendered = {};
    this.lastThreadId = tid;

    var thread = data.threadById(tid);
    var hidden = thread ? Math.max(0, thread.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlderNotice(hidden));

    var prevRole = null;
    for (var i = 0; i < msgs.length; i++) {
      var turn = this.buildTurn(msgs[i], prevRole);
      this.list.appendChild(turn);
      prevRole = msgs[i].role;
    }

    this.renderSurfaces();
    this.renderQuestion();
    this.syncLive();
  };

  T1Thread.prototype.buildOlderNotice = function (hidden) {
    var self = this;
    var u = U();
    var btn = u.el('button', {
      class: 't1-older',
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
    return u.el('div', { class: 't1-older-wrap' }, [btn]);
  };

  T1Thread.prototype.buildTurn = function (msg, prevRole) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var isUser = msg.role === 'user';
    var lensState = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;

    var turn = u.el('div', {
      class: 't1-turn',
      data: { pmxMsg: msg.id, pmxRole: msg.role, lens: lensState || '' }
    });
    turn.classList.add('pmx-msg');

    /* The speaker label hangs in the margin and only appears when the role changes, so a
     * run of turns from one side reads as continuous prose rather than repeated headers. */
    if (msg.role !== prevRole) {
      turn.appendChild(u.el('div', { class: 't1-speaker' }, [
        u.el('span', { class: 't1-speaker-label', text: isUser ? 'You' : 'Assistant' })
      ]));
      turn.setAttribute('data-turn-start', '1');
    }

    var body = u.el('div', { class: 't1-body pmx-msg-body' });
    var eligible = (msg.body || '').length >= COLLAPSE_ELIGIBLE_CHARS;
    var expanded = !!this.ctx.store.view(this.tid()).expanded[msg.id];

    var prose = u.el('div', { class: 't1-prose' });
    this.writeProse(prose, msg.body || '');
    body.appendChild(prose);

    if (eligible) {
      body.setAttribute('data-collapsible', '1');
      body.setAttribute('data-expanded', expanded ? '1' : '0');
      var toggle = u.el('button', {
        class: 't1-more',
        text: expanded ? 'Show less' : 'Show more'
      });
      this._on(toggle, 'click', function () { self.setExpanded(msg.id, !self.isExpanded(msg.id)); });
      body.appendChild(toggle);
    }

    turn.appendChild(body);

    /* Hover row is a SIBLING of the body, never nested inside it. */
    var hoverRow = global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage(),
      onEdit: function () { svc.toast.show('Editing replaces this message and supersedes the turn'); }
    });
    turn.appendChild(hoverRow);

    /* One line. Everything the turn did, in a strip that opens a sheet. No nesting. */
    var strip = this.buildWorkStrip(msg);
    if (strip) turn.appendChild(strip);

    this.rendered[msg.id] = { el: turn, bodyEl: body, proseEl: prose };
    return turn;
  };

  /* Paragraph breaks are meaningful in this concept — the whole bet is on prose. */
  T1Thread.prototype.writeProse = function (host, text) {
    var u = U();
    var paras = String(text).split(/\n{2,}/);
    for (var i = 0; i < paras.length; i++) {
      var p = paras[i].replace(/\n/g, ' ').trim();
      if (!p) continue;
      host.appendChild(u.el('p', { class: 't1-p', text: p }));
    }
    if (!host.childNodes.length) host.appendChild(u.el('p', { class: 't1-p', text: text }));
  };

  T1Thread.prototype.lastMessage = function () {
    var msgs = this.ctx.data.messagesFor(this.tid());
    return msgs[msgs.length - 1];
  };

  /* ---------------------------------------------------------------- work strip */

  T1Thread.prototype.buildWorkStrip = function (msg) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var parts = [];

    var group = svc.surfaces && svc.surfaces.activityGroupFor
      ? svc.surfaces.activityGroupFor(msg) : (msg.activityGroup || null);
    if (group) {
      parts.push({
        key: 'activity',
        label: svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : 'Activity',
        build: function (host) { self.buildActivityDetail(host, group); }
      });
    }

    if (msg.thoughtSegments && msg.thoughtSegments.length) {
      parts.push({
        key: 'thought',
        label: msg.thoughtSegments.length === 1 ? '1 thought segment'
          : msg.thoughtSegments.length + ' thought segments',
        build: function (host) { self.buildThoughtDetail(host, msg.thoughtSegments); }
      });
    }

    if (msg.completedQuestionnaire) {
      parts.push({
        key: 'question',
        label: 'Question answered',
        build: function (host) { self.buildAnsweredDetail(host, msg.completedQuestionnaire); }
      });
    }

    if (!parts.length) return null;

    var strip = u.el('div', { class: 't1-strip' });
    parts.forEach(function (part, i) {
      if (i) strip.appendChild(u.el('span', { class: 't1-strip-sep', text: '·' }));
      var b = u.el('button', { class: 't1-strip-btn', text: part.label, data: { part: part.key } });
      self._on(b, 'click', function (ev) {
        self.ctx.services.popup.open({
          anchorEl: ev.currentTarget,
          kind: 'panel',
          width: 320,
          build: function (host) { part.build(host); }
        });
      });
      strip.appendChild(b);
    });
    return strip;
  };

  T1Thread.prototype.buildActivityDetail = function (host, group) {
    var u = U();
    var svc = this.ctx.services;
    host.appendChild(u.el('div', { class: 't1-sheet-title', text: 'What this turn did' }));
    var stages = svc.surfaces && svc.surfaces.activityStages
      ? svc.surfaces.activityStages(group) : (group.stages || []);
    var list = u.el('div', { class: 't1-sheet-list pmx-scroll' });
    stages.forEach(function (st) {
      var row = u.el('div', { class: 't1-sheet-row' }, [
        u.el('span', { class: 't1-sheet-kind', text: F().label(st.kind) }),
        u.el('span', { class: 't1-sheet-label', text: st.label || '' }),
        u.el('span', { class: 't1-sheet-dur', text: st.durationSeconds != null ? F().duration(st.durationSeconds) : '' })
      ]);
      list.appendChild(row);
    });
    host.appendChild(list);
    if (group.workedSeconds != null) {
      host.appendChild(u.el('div', {
        class: 't1-sheet-foot',
        text: 'Worked for ' + F().duration(group.workedSeconds)
      }));
    }
  };

  T1Thread.prototype.buildThoughtDetail = function (host, segments) {
    var u = U();
    host.appendChild(u.el('div', { class: 't1-sheet-title', text: 'Reasoning summary' }));
    /* Only provider-exposed reasoning is represented. Nothing here claims access to hidden
     * model chain-of-thought, and the note says so plainly. */
    var list = u.el('div', { class: 't1-sheet-list pmx-scroll' });
    segments.forEach(function (seg) {
      list.appendChild(u.el('div', { class: 't1-sheet-row' }, [
        u.el('span', { class: 't1-sheet-kind', text: F().label(seg.status) }),
        u.el('span', { class: 't1-sheet-label', text: seg.summary || seg.label || '' })
      ]));
    });
    host.appendChild(list);
    host.appendChild(u.el('div', {
      class: 't1-sheet-foot',
      text: 'Provider-exposed summary only.'
    }));
  };

  T1Thread.prototype.buildAnsweredDetail = function (host, q) {
    var u = U();
    host.appendChild(u.el('div', { class: 't1-sheet-title', text: 'Answered question' }));
    var list = u.el('div', { class: 't1-sheet-list pmx-scroll' });
    (q.questionsAndAnswers || []).forEach(function (qa) {
      list.appendChild(u.el('div', { class: 't1-qa' }, [
        u.el('div', { class: 't1-qa-q', text: qa.question }),
        u.el('div', { class: 't1-qa-a', text: qa.answer })
      ]));
    });
    host.appendChild(list);
  };

  /* ---------------------------------------------------------------- surfaces */

  T1Thread.prototype.surfaceHost = function () {
    return this.ctx.capabilities.workSurfaceHost
      ? this.ctx.regions.workSurfaceHost
      : this.inlineSurfaces;
  };

  T1Thread.prototype.renderSurfaces = function () {
    var u = U();
    var svc = this.ctx.services;
    var host = this.surfaceHost();
    if (!host) return;
    U().empty(host);

    var active = svc.surfaces ? svc.surfaces.activeFor(this.tid()) : null;
    if (!active) return;

    /* Nothing reserves permanent space: absent surfaces render nothing at all.
     * activeFor may hand back either a single group or an array of them, so normalise
     * rather than assuming one shape. */
    function each(v) { return v == null ? [] : (Object.prototype.toString.call(v) === '[object Array]' ? v : [v]); }

    if (active.goal) host.appendChild(this.buildGoal(active.goal));
    if (active.todo) host.appendChild(this.buildTodo(active.todo));
    var self = this;
    each(active.subagents).forEach(function (g) { host.appendChild(self.buildSubagents(g)); });
    each(active.diffs).forEach(function (g) { host.appendChild(self.buildDiff(g)); });
  };

  T1Thread.prototype.buildGoal = function (goal) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var wrap = u.el('div', { class: 't1-surface', data: { surface: 'goal' } });

    var head = u.el('div', { class: 't1-surface-head' }, [
      u.el('span', { class: 't1-surface-kind', text: 'Goal' }),
      u.el('span', { class: 't1-surface-title', text: goal.title || goal.objective }),
      u.el('span', { class: 't1-status', text: F().label(goal.status) })
    ]);
    wrap.appendChild(head);

    var acts = u.el('div', { class: 't1-surface-acts' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (action) {
      if (svc.surfaces.canAct && !svc.surfaces.canAct(goal, action)) return;
      var b = u.el('button', { class: 't1-act', text: action.charAt(0).toUpperCase() + action.slice(1) });
      self._on(b, 'click', function () { svc.surfaces.act(self.tid(), action); });
      acts.appendChild(b);
    });
    wrap.appendChild(acts);

    /* Blocked carries the exact blocker, not a shrug. */
    if (goal.status === 'blocked' && goal.blocker) {
      var b = goal.blocker;
      var det = u.el('div', { class: 't1-blocker' });
      [['Cause', b.cause], ['Affected', b.affectedScope],
       ['Tried', b.lastAttemptedRecovery], ['Stopped because', b.whyRecoveryStopped],
       ['Next safe action', b.nextSafeAction]].forEach(function (row) {
        if (!row[1]) return;
        det.appendChild(u.el('div', { class: 't1-blocker-row' }, [
          u.el('span', { class: 't1-blocker-k', text: row[0] }),
          u.el('span', { class: 't1-blocker-v', text: row[1] })
        ]));
      });
      wrap.appendChild(det);
    }

    if (goal.replan) {
      wrap.appendChild(u.el('div', { class: 't1-replan' }, [
        u.el('span', { class: 't1-replan-k', text: 'Replanning' }),
        u.el('span', { class: 't1-replan-v', text: goal.replan.impact || goal.replan.reason })
      ]));
    }
    return wrap;
  };

  T1Thread.prototype.buildTodo = function (todo) {
    var u = U();
    var wrap = u.el('div', { class: 't1-surface', data: { surface: 'todo' } });
    var done = (todo.items || []).filter(function (i) { return i.state === 'complete'; }).length;
    wrap.appendChild(u.el('div', { class: 't1-surface-head' }, [
      u.el('span', { class: 't1-surface-kind', text: 'Todo' }),
      u.el('span', { class: 't1-surface-title', text: done + ' of ' + (todo.items || []).length + ' complete' })
    ]));
    var list = u.el('div', { class: 't1-todo' });
    (todo.items || []).forEach(function (it) {
      list.appendChild(u.el('div', { class: 't1-todo-row', data: { state: it.state } }, [
        u.el('span', { class: 't1-todo-state', text: F().label(it.state) }),
        u.el('span', { class: 't1-todo-label', text: it.label })
      ]));
    });
    wrap.appendChild(list);
    return wrap;
  };

  T1Thread.prototype.buildSubagents = function (group) {
    var self = this;
    var u = U();
    var wrap = u.el('div', { class: 't1-surface', data: { surface: 'subagents' } });
    var c = group.counts || {};
    var summary = [];
    if (c.working) summary.push(c.working + ' working');
    if (c.complete) summary.push(c.complete + ' complete');
    if (c.blocked) summary.push(c.blocked + ' blocked');
    if (c.waiting) summary.push(c.waiting + ' waiting for parent');

    var head = u.el('div', { class: 't1-surface-head' }, [
      u.el('span', { class: 't1-surface-kind', text: 'Agents' }),
      u.el('span', { class: 't1-surface-title', text: summary.join(', ') })
    ]);
    var toggle = u.el('button', { class: 't1-act', text: 'Show each' });
    var body = u.el('div', { class: 't1-agents', data: { open: '0' } });
    (group.agents || []).forEach(function (a) {
      body.appendChild(u.el('div', { class: 't1-agent' }, [
        u.el('span', { class: 't1-agent-name', text: a.name }),
        u.el('span', { class: 't1-agent-task', text: a.task }),
        u.el('span', { class: 't1-agent-act', text: a.currentActivity || '' }),
        u.el('span', { class: 't1-status', text: F().label(a.status) }),
        u.el('span', { class: 't1-agent-dur', text: a.workedSeconds != null ? F().duration(a.workedSeconds) : '' })
      ]));
    });
    this._on(toggle, 'click', function () {
      var open = body.getAttribute('data-open') === '1';
      body.setAttribute('data-open', open ? '0' : '1');
      toggle.textContent = open ? 'Show each' : 'Hide each';
      self.ctx.services.motion.collapseTo(body, !open, { collapsedHeight: 0 });
    });
    head.appendChild(toggle);
    wrap.appendChild(head);
    wrap.appendChild(body);
    return wrap;
  };

  T1Thread.prototype.buildDiff = function (group) {
    var self = this;
    var u = U();
    var wrap = u.el('div', { class: 't1-surface', data: { surface: 'diff' } });
    var files = group.files || [];
    var add = files.reduce(function (a, f) { return a + (f.added || 0); }, 0);
    var rem = files.reduce(function (a, f) { return a + (f.removed || 0); }, 0);
    wrap.appendChild(u.el('div', { class: 't1-surface-head' }, [
      u.el('span', { class: 't1-surface-kind', text: 'Changes' }),
      u.el('span', { class: 't1-surface-title', text: files.length + ' files, ' + add + ' added, ' + rem + ' removed' })
    ]));
    var list = u.el('div', { class: 't1-files' });
    files.forEach(function (f) {
      var row = u.el('button', { class: 't1-file', data: { status: f.status } }, [
        u.el('span', { class: 't1-file-path', text: f.path }),
        u.el('span', { class: 't1-file-status', text: F().label(f.status) }),
        u.el('span', { class: 't1-file-n', text: '+' + f.added + ' -' + f.removed })
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
      list.appendChild(u.el('div', { class: 't1-file-more', text: group.hiddenFileCount + ' more files' }));
    }
    wrap.appendChild(list);
    return wrap;
  };

  /* ---------------------------------------------------------------- questionnaire */

  T1Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard. yieldForQuestion notifies the store, which re-enters update()
     * and therefore this function, mid-render. The inner pass appends a card, the outer
     * pass then appends a second one into a host it already emptied — two identical
     * questionnaires on screen. */
    if (this._inRenderQuestion) return;

    /* NO CHOREOGRAPHY YET. The shared entrance/advance this concept used to call was deleted in
     * Phase E0 because it made all eight thread concepts move identically; this concept's own form is
     * still outstanding, and a no-op is the honest interim - not a borrowed animation. */
    var pmxHost = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;

    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }

  };

T1Thread.prototype._renderQuestionBody = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    U().empty(host);

    var q = svc.questionnaire ? svc.questionnaire.activeFor(this.tid()) : null;
    if (!q) return;

    /* An active question takes priority; the work surfaces yield space but keep their state
     * and come back untouched when it resolves. */
    if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(this.tid(), true);

    var idx = svc.questionnaire.currentIndex ? svc.questionnaire.currentIndex(q.id) : (q.currentQuestionIndex || 0);
    var question = (q.questions || [])[idx];
    if (!question) return;

    var card = u.el('div', { class: 't1-question' });
    card.appendChild(u.el('div', { class: 't1-question-head' }, [
      u.el('span', { class: 't1-question-count', text: (idx + 1) + ' of ' + (q.questions || []).length }),
      u.el('span', { class: 't1-question-req', text: question.required ? 'Required' : 'Optional' })
    ]));
    card.appendChild(u.el('p', { class: 't1-question-prompt', text: question.prompt }));

    if (question.options && question.options.length) {
      var opts = u.el('div', { class: 't1-question-opts' });
      question.options.forEach(function (opt) {
        var selected = (question.selected || []).indexOf(opt) >= 0;
        var b = u.el('button', {
          class: 't1-opt', text: opt,
          aria: { pressed: selected ? 'true' : 'false' }
        });
        self._on(b, 'click', function (ev) {
          if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
          svc.questionnaire.answer(q.id, question.id, opt);
          self.renderQuestion();
        });
        opts.appendChild(b);
      });
      card.appendChild(opts);
    } else {
      var ta = u.el('textarea', { class: 't1-question-free pmx-scroll', aria: { label: question.prompt } });
      ta.setAttribute('spellcheck', 'false');
      ta.value = question.draft || '';
      this._on(ta, 'input', function () { svc.questionnaire.answer(q.id, question.id, ta.value); });
      card.appendChild(ta);
    }

    var acts = u.el('div', { class: 't1-question-acts' });
    var skip = u.el('button', { class: 't1-act', text: 'Skip' });
    this._on(skip, 'click', function () { svc.questionnaire.skip(q.id, question.id); self.renderQuestion(); });
    acts.appendChild(skip);

    var isLast = idx === (q.questions || []).length - 1;
    var primary = u.el('button', { class: 't1-act t1-act-primary', text: isLast ? 'Submit' : 'Next' });
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

    var cancel = u.el('button', { class: 't1-act', text: 'Cancel' });
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

  T1Thread.prototype.syncLive = function () {
    var u = U();
    var svc = this.ctx.services;
    var status = svc.runtime.liveStatus(this.tid());

    if (!status) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null;
      return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't1-live pmx-live' }, [
        u.el('span', { class: 't1-live-dot pmx-pulse' }),
        u.el('span', { class: 't1-live-text' }),
        u.el('span', { class: 't1-live-time' })
      ]);
      this.list.appendChild(this.liveEl);
    }
    /* Updates IN PLACE. It never appends a permanent message or a card per step. */
    svc.motion.swapTextInstant(this.liveEl.querySelector('.t1-live-text'), status.text || '');
    svc.motion.swapTextInstant(this.liveEl.querySelector('.t1-live-time'),
      status.workedSeconds != null ? F().duration(status.workedSeconds) : '');
  };

  /* ---------------------------------------------------------------- ThreadInstance API */

  T1Thread.prototype.isExpanded = function (msgId) {
    return !!this.ctx.store.view(this.tid()).expanded[msgId];
  };

  T1Thread.prototype.setExpanded = function (msgId, on) {
    var self = this;
    var rec = this.rendered[msgId];
    this.ctx.store.view(this.tid()).expanded[msgId] = !!on;
    if (!rec) return;
    var body = rec.bodyEl;
    var btn = body.querySelector('.t1-more');

    /* Expanding a message above the reading position must not move the viewport. */
    this.scrollCtl.preserveAcross(body, function () {
      body.setAttribute('data-expanded', on ? '1' : '0');
      if (btn) btn.textContent = on ? 'Show less' : 'Show more';
      self.ctx.services.motion.snapToEnd(body);
    });
  };

  T1Thread.prototype.revealHidden = function (msgId) {
    this.setExpanded(msgId, true);
  };

  T1Thread.prototype.scrollToMessage = function (id, opts) {
    var self = this;
    var rec = this.rendered[id];
    if (!rec) {
      /* The target is outside the rendered window. Load the range that contains it, then jump. */
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

  T1Thread.prototype.isExpandedEligible = function (id) {
    var msgs = this.ctx.data.messagesFor(this.tid());
    for (var i = 0; i < msgs.length; i++) {
      if (msgs[i].id === id) return (msgs[i].body || '').length >= COLLAPSE_ELIGIBLE_CHARS;
    }
    return false;
  };

  T1Thread.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T1Thread.prototype.setAnchor = function (tok) { return this.scrollCtl.restoreAnchor(tok); };

  T1Thread.prototype.update = function (state, changed) {
    var needsFull = false, needsSurfaces = false, needsQuestion = false;
    for (var i = 0; i < changed.length; i++) {
      var k = changed[i];
      if (k === 'session.activeThreadId') needsFull = true;
      if (k.indexOf('view') === 0) { needsSurfaces = true; needsQuestion = true; }
      if (k === 'view.lens' || k === 'view.expanded') needsFull = true;
    }
    if (state.session.activeThreadId !== this.lastThreadId) needsFull = true;
    if (needsFull) { this.renderThread(); return; }
    if (needsSurfaces) this.renderSurfaces();
    if (needsQuestion) this.renderQuestion();
  };

  T1Thread.prototype.destroy = function () {
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
  };

  global.PMX.thread.register('t1', {
    name: 'Speaker Turns',
    blurb: 'A typographic transcript with hanging speaker labels and no bubbles. Every execution detail collapses to a single work strip beneath the turn, so prose keeps the full measure.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T1Thread(regionEl, ctx);
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
