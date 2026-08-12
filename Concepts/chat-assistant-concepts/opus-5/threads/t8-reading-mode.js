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

  T8Thread.prototype.renderSurfaces = function () {
    var self = this;
    var u = U();
    var host = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
    if (!host) return;
    U().empty(host);
    var a = this.ctx.services.surfaces.activeFor(this.tid());
    if (!a) return;
    function each(v) { return v == null ? [] : (Object.prototype.toString.call(v) === '[object Array]' ? v : [v]); }

    function line(kind, text, status) {
      var row = u.el('div', { class: 't8-surface' }, [
        u.el('span', { class: 't8-surface-kind', text: kind }),
        u.el('span', { class: 't8-surface-text', text: text })
      ]);
      if (status) row.appendChild(u.el('span', { class: 't8-surface-status', text: status }));
      return row;
    }

    if (a.goal) host.appendChild(line('Goal', a.goal.title || a.goal.objective, F().label(a.goal.status)));
    if (a.todo) {
      var items = a.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete'; }).length;
      host.appendChild(line('Todo', done + ' of ' + items.length + ' complete', ''));
    }
    each(a.subagents).forEach(function (g) {
      host.appendChild(line('Agents', self.ctx.services.surfaces.subagentSummary(g), ''));
    });
    each(a.diffs).forEach(function (g) {
      var files = g.files || [];
      var add = files.reduce(function (x, f) { return x + (f.added || 0); }, 0);
      var rem = files.reduce(function (x, f) { return x + (f.removed || 0); }, 0);
      host.appendChild(line('Changes', files.length + ' files, ' + add + ' added, ' + rem + ' removed', ''));
    });
  };

  T8Thread.prototype.renderQuestion = function () {
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

T8Thread.prototype._renderQuestionBody = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    U().empty(host);
    var q = svc.questionnaire.activeFor(this.tid());
    if (!q) { svc.surfaces.yieldForQuestion(this.tid(), false); return; }
    svc.surfaces.yieldForQuestion(this.tid(), true);

    var idx = q.currentQuestionIndex || 0;
    var question = (q.questions || [])[idx];
    if (!question) return;

    var card = u.el('div', { class: 't8-question' }, [
      u.el('div', { class: 't8-question-head' }, [
        u.el('span', { text: (idx + 1) + ' of ' + (q.questions || []).length }),
        u.el('span', { class: 't8-question-req', text: question.required ? 'Required' : 'Optional' })
      ]),
      u.el('p', { class: 't8-question-prompt', text: question.prompt })
    ]);

    if (question.options && question.options.length) {
      var opts = u.el('div', { class: 't8-question-opts' });
      question.options.forEach(function (o) {
        var sel = (question.selected || []).indexOf(o) >= 0;
        var b = u.el('button', { class: 't8-opt', text: o, aria: { pressed: sel ? 'true' : 'false' } });
        u.on(b, 'click', function (ev) { if (global.PMXReveal) global.PMXReveal.ripple(this, ev); svc.questionnaire.answer(q.id, question.id, o); self.renderQuestion(); });
        opts.appendChild(b);
      });
      card.appendChild(opts);
    } else {
      var ta = u.el('textarea', { class: 't8-question-free pmx-scroll' });
      ta.setAttribute('spellcheck', 'false');
      ta.value = question.draft || '';
      u.on(ta, 'input', function () { svc.questionnaire.answer(q.id, question.id, ta.value); });
      card.appendChild(ta);
    }

    var acts = u.el('div', { class: 't8-question-acts' });
    var isLast = idx === (q.questions || []).length - 1;
    [['Skip', function () { svc.questionnaire.skip(q.id, question.id); }],
     [isLast ? 'Submit' : 'Next', function () {
       if (isLast) {
         var can = svc.questionnaire.canSubmit(q.id);
         if (!can.ok) { if (global.PMXReveal) global.PMXReveal.reject(this); svc.toast.show('Answer the required questions first'); return; }
         svc.questionnaire.submit(q.id);
       } else { svc.questionnaire.next(q.id); }
     }],
     ['Cancel', function () { svc.questionnaire.cancel(q.id); }]
    ].forEach(function (a, i) {
      var b = u.el('button', { class: 't8-act' + (i === 1 ? ' t8-act-primary' : ''), text: a[0] });
      u.on(b, 'click', function () { a[1](); self.renderQuestion(); self.renderSurfaces(); });
      acts.appendChild(b);
    });
    card.appendChild(acts);
    host.appendChild(card);
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
