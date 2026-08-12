/* t6 "Work Interleave" — Opus 5
 *
 * Execution units are first-class siblings of messages, distinguished by TYPOGRAPHIC
 * REGISTER rather than by a container: a monospace label line, tighter leading, muted colour,
 * and no box at all.
 *
 * Self-imposed hard rule: ZERO nested boxes. Nothing in this concept may carry a border or
 * background inside another element that carries a border or background. Anything needing
 * more room opens a sheet. This is the concept that tests whether "boxes inside boxes" can
 * be solved by typography alone.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }
  var ELIGIBLE = 850;

  function T6(host, ctx) {
    this.host = host; this.ctx = ctx; this.offs = []; this.rendered = {}; this.lastTid = null;
    this.build();
  }
  T6.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };
  T6.prototype.tid = function () { return this.ctx.store.get('session.activeThreadId'); };

  T6.prototype.build = function () {
    var self = this, u = U();
    this.root = u.el('div', { class: 't6-root' });
    this.root.appendChild(u.el('div', { class: 't6-head' }, [
      u.el('span', { class: 't6-head-name', text: 'Work Interleave' }),
      u.el('span', { class: 't6-head-model', text: this.ctx.label })
    ]));
    this.scroller = u.el('div', { class: 't6-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't6-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    this.inlineSurfaces = u.el('div', { class: 't6-inline-surfaces' });
    this.inlineQuestion = u.el('div', { class: 't6-inline-question' });
    if (!this.ctx.capabilities.workSurfaceHost) this.root.appendChild(this.inlineSurfaces);
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);
    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t6-turn', messageAttr: 'data-pmx-msg'
    });
    this._tickOff = this.ctx.services.runtime.onTick(function () { self.syncLive(); });
    this.renderThread();
  };

  T6.prototype.renderThread = function () {
    var tid = this.tid(), u = U();
    var v = this.ctx.store.view(tid);
    var msgs = this.ctx.data.visibleSlice(tid, v.loadedFrom);
    u.empty(this.list); this.rendered = {}; this.lastTid = tid;

    var t = this.ctx.data.threadById(tid);
    var hidden = t ? Math.max(0, t.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlder(hidden));

    for (var i = 0; i < msgs.length; i++) {
      this.list.appendChild(this.buildTurn(msgs[i]));
      /* Execution units are siblings, not children. They sit between turns in the flow. */
      var work = this.buildWorkRows(msgs[i]);
      for (var j = 0; j < work.length; j++) this.list.appendChild(work[j]);
    }
    this.renderSurfaces(); this.renderQuestion(); this.syncLive();
  };

  T6.prototype.buildOlder = function (hidden) {
    var self = this, u = U();
    var b = u.el('button', { class: 't6-older', text: 'Load ' + hidden.toLocaleString() + ' earlier messages' });
    this._on(b, 'click', function () {
      var tid = self.tid(), v = self.ctx.store.view(tid), t = self.ctx.data.threadById(tid);
      var cur = v.loadedFrom == null ? t.messages.length - t.initialVisibleMessageCount : v.loadedFrom;
      v.loadedFrom = Math.max(0, cur - 120);
      self.scrollCtl.preserveAcross(self.list, function () { self.renderThread(); });
    });
    return u.el('div', { class: 't6-older-wrap' }, [b]);
  };

  T6.prototype.buildTurn = function (msg) {
    var self = this, u = U(), svc = this.ctx.services;
    var lens = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;
    var turn = u.el('div', {
      class: 't6-turn pmx-msg',
      data: { pmxMsg: msg.id, pmxRole: msg.role, lens: lens || '' }
    });
    var body = u.el('div', { class: 't6-body pmx-msg-body' });
    body.appendChild(u.el('span', { class: 't6-role', text: msg.role === 'user' ? 'You' : 'Assistant' }));

    var prose = u.el('div', { class: 't6-prose' });
    String(msg.body || '').split(/\n{2,}/).forEach(function (p) {
      var s = p.replace(/\n/g, ' ').trim();
      if (s) prose.appendChild(u.el('p', { class: 't6-p', text: s }));
    });
    body.appendChild(prose);

    if ((msg.body || '').length >= ELIGIBLE) {
      var open = !!this.ctx.store.view(this.tid()).expanded[msg.id];
      body.setAttribute('data-collapsible', '1');
      body.setAttribute('data-expanded', open ? '1' : '0');
      var more = u.el('button', { class: 't6-more', text: open ? 'Show less' : 'Show more' });
      this._on(more, 'click', function () { self.setExpanded(msg.id, !self.isExpanded(msg.id)); });
      body.appendChild(more);
    }

    turn.appendChild(body);
    turn.appendChild(global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage()
    }));
    this.rendered[msg.id] = { el: turn, bodyEl: body };
    return turn;
  };

  /* A different VOICE, not a different box: monospace, muted, unboxed. */
  T6.prototype.buildWorkRows = function (msg) {
    var self = this, u = U(), svc = this.ctx.services, rows = [];
    var group = svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : msg.activityGroup;

    if (group) {
      svc.surfaces.activityStages(group).forEach(function (st) {
        var row = u.el('div', { class: 't6-exec' }, [
          u.el('span', { class: 't6-exec-kind', text: F().label(st.kind) }),
          u.el('span', { class: 't6-exec-label', text: st.label || '' })
        ]);
        if (st.durationSeconds != null) {
          row.appendChild(u.el('span', { class: 't6-exec-dur', text: F().duration(st.durationSeconds) }));
        }
        rows.push(row);
      });
      rows.push(u.el('div', { class: 't6-exec t6-exec-sum' }, [
        u.el('span', { class: 't6-exec-kind', text: 'Summary' }),
        u.el('span', { class: 't6-exec-label', text: svc.surfaces.condenseLabel(group) })
      ]));
    }

    (msg.thoughtSegments || []).forEach(function (s) {
      var row = u.el('div', { class: 't6-exec' }, [
        u.el('span', { class: 't6-exec-kind', text: 'Reasoning' }),
        u.el('span', { class: 't6-exec-label', text: s.summary || s.label || '' }),
        u.el('span', { class: 't6-exec-dur', text: F().label(s.status) })
      ]);
      rows.push(row);
    });

    if (msg.completedQuestionnaire) {
      var q = msg.completedQuestionnaire;
      var b = u.el('button', { class: 't6-exec t6-exec-btn' }, [
        u.el('span', { class: 't6-exec-kind', text: 'Question' }),
        u.el('span', { class: 't6-exec-label', text: q.summary || 'Answered' })
      ]);
      this._on(b, 'click', function (ev) {
        self.ctx.services.popup.open({
          anchorEl: ev.currentTarget, kind: 'panel', width: 320,
          build: function (host) {
            host.appendChild(u.el('div', { class: 't6-sheet-title', text: 'Answered question' }));
            var l = u.el('div', { class: 't6-sheet-list pmx-scroll' });
            (q.questionsAndAnswers || []).forEach(function (qa) {
              l.appendChild(u.el('div', { class: 't6-sheet-row' }, [
                u.el('span', { class: 't6-sheet-k', text: qa.question }),
                u.el('span', { class: 't6-sheet-v', text: qa.answer })
              ]));
            });
            host.appendChild(l);
          }
        });
      });
      rows.push(b);
    }
    return rows;
  };

  T6.prototype.lastMessage = function () {
    var m = this.ctx.data.messagesFor(this.tid()); return m[m.length - 1];
  };

  T6.prototype.renderSurfaces = function () {
    var self = this, u = U();
    var host = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
    if (!host) return;
    u.empty(host);
    var a = this.ctx.services.surfaces.activeFor(this.tid());
    if (!a) return;
    function each(v) { return v == null ? [] : (Object.prototype.toString.call(v) === '[object Array]' ? v : [v]); }
    function row(kind, text, status) {
      var r = u.el('div', { class: 't6-surface' }, [
        u.el('span', { class: 't6-exec-kind', text: kind }),
        u.el('span', { class: 't6-exec-label', text: text })
      ]);
      if (status) r.appendChild(u.el('span', { class: 't6-exec-dur', text: status }));
      return r;
    }
    if (a.goal) host.appendChild(row('Goal', a.goal.title || a.goal.objective, F().label(a.goal.status)));
    if (a.todo) {
      var items = a.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete'; }).length;
      host.appendChild(row('Todo', done + ' of ' + items.length + ' complete', ''));
      items.forEach(function (it) { host.appendChild(row('', it.label, F().label(it.state))); });
    }
    each(a.subagents).forEach(function (g) {
      host.appendChild(row('Agents', self.ctx.services.surfaces.subagentSummary(g), ''));
      (g.agents || []).forEach(function (ag) {
        host.appendChild(row('', ag.name + ' — ' + ag.task, F().label(ag.status)));
      });
    });
    each(a.diffs).forEach(function (g) {
      (g.files || []).forEach(function (f) {
        host.appendChild(row('', f.path, '+' + f.added + ' -' + f.removed));
      });
    });
  };

  T6.prototype.renderQuestion = function () {
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

T6.prototype._renderQuestionBody = function () {
    var self = this, u = U(), svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    u.empty(host);
    var q = svc.questionnaire.activeFor(this.tid());
    if (!q) { svc.surfaces.yieldForQuestion(this.tid(), false); return; }
    svc.surfaces.yieldForQuestion(this.tid(), true);
    var idx = q.currentQuestionIndex || 0, question = (q.questions || [])[idx];
    if (!question) return;

    var card = u.el('div', { class: 't6-question' }, [
      u.el('div', { class: 't6-exec-kind', text: 'Question ' + (idx + 1) + ' of ' + (q.questions || []).length }),
      u.el('p', { class: 't6-question-prompt', text: question.prompt })
    ]);
    if (question.options && question.options.length) {
      question.options.forEach(function (o) {
        var sel = (question.selected || []).indexOf(o) >= 0;
        var b = u.el('button', { class: 't6-opt', text: o, aria: { pressed: sel ? 'true' : 'false' } });
        u.on(b, 'click', function (ev) { if (global.PMXReveal) global.PMXReveal.ripple(this, ev); svc.questionnaire.answer(q.id, question.id, o); self.renderQuestion(); });
        card.appendChild(b);
      });
    } else {
      var ta = u.el('textarea', { class: 't6-question-free pmx-scroll' });
      ta.setAttribute('spellcheck', 'false'); ta.value = question.draft || '';
      u.on(ta, 'input', function () { svc.questionnaire.answer(q.id, question.id, ta.value); });
      card.appendChild(ta);
    }
    var acts = u.el('div', { class: 't6-question-acts' });
    var isLast = idx === (q.questions || []).length - 1;
    [['Skip', function () { svc.questionnaire.skip(q.id, question.id); }],
     [isLast ? 'Submit' : 'Next', function () {
       if (isLast) {
         var c = svc.questionnaire.canSubmit(q.id);
         if (!c.ok) { svc.toast.show('Answer the required questions first'); return; }
         svc.questionnaire.submit(q.id);
       } else svc.questionnaire.next(q.id);
     }],
     ['Cancel', function () { svc.questionnaire.cancel(q.id); }]
    ].forEach(function (a, i) {
      var b = u.el('button', { class: 't6-act' + (i === 1 ? ' t6-act-primary' : ''), text: a[0] });
      u.on(b, 'click', function () { a[1](); self.renderQuestion(); self.renderSurfaces(); });
      acts.appendChild(b);
    });
    card.appendChild(acts);
    host.appendChild(card);
  };

  T6.prototype.syncLive = function () {
    var u = U(), s = this.ctx.services.runtime.liveStatus(this.tid());
    if (!s) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null; return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't6-exec t6-live pmx-live' }, [
        u.el('span', { class: 't6-exec-kind', text: 'Running' }),
        u.el('span', { class: 't6-exec-label t6-live-text' }),
        u.el('span', { class: 't6-exec-dur t6-live-time' })
      ]);
      this.list.appendChild(this.liveEl);
    }
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t6-live-text'), s.text || '');
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t6-live-time'),
      s.workedSeconds != null ? F().duration(s.workedSeconds) : '');
  };

  T6.prototype.isExpanded = function (id) { return !!this.ctx.store.view(this.tid()).expanded[id]; };
  T6.prototype.setExpanded = function (id, on) {
    var self = this, rec = this.rendered[id];
    this.ctx.store.view(this.tid()).expanded[id] = !!on;
    if (!rec) return;
    this.scrollCtl.preserveAcross(rec.bodyEl, function () {
      rec.bodyEl.setAttribute('data-expanded', on ? '1' : '0');
      var b = rec.bodyEl.querySelector('.t6-more');
      if (b) b.textContent = on ? 'Show less' : 'Show more';
      self.ctx.services.motion.snapToEnd(rec.bodyEl);
    });
  };
  T6.prototype.revealHidden = function (id) { this.setExpanded(id, true); };

  T6.prototype.scrollToMessage = function (id, opts) {
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

  T6.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T6.prototype.setAnchor = function (t) { return this.scrollCtl.restoreAnchor(t); };

  T6.prototype.update = function (state, changed) {
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

  T6.prototype.destroy = function () {
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

  global.PMX.thread.register('t6', {
    name: 'Work Interleave',
    blurb: 'Execution steps sit as siblings of the messages in a quieter monospace voice with no container at all, so telemetry reads as a different register rather than another box inside a box.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T6(regionEl, ctx);
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
