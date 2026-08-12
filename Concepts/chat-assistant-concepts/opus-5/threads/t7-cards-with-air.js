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
    this.renderThread();
  };

  T7.prototype.renderThread = function () {
    var tid = this.tid(), u = U();
    var v = this.ctx.store.view(tid);
    var msgs = this.ctx.data.visibleSlice(tid, v.loadedFrom);
    u.empty(this.list); this.rendered = {}; this.lastTid = tid;
    var t = this.ctx.data.threadById(tid);
    var hidden = t ? Math.max(0, t.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlder(hidden));
    for (var i = 0; i < msgs.length; i++) this.list.appendChild(this.buildTurn(msgs[i]));
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

  T7.prototype.renderSurfaces = function () {
    var self = this, u = U();
    var host = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
    if (!host) return;
    u.empty(host);
    var a = this.ctx.services.surfaces.activeFor(this.tid());
    if (!a) return;
    function each(v) { return v == null ? [] : (Object.prototype.toString.call(v) === '[object Array]' ? v : [v]); }
    /* Each surface is its own level-one card, siblings of each other, never nested. */
    function card(kind, text, status) {
      var c = u.el('div', { class: 't7-surface' }, [
        u.el('span', { class: 't7-surface-kind', text: kind }),
        u.el('span', { class: 't7-surface-text', text: text })
      ]);
      if (status) c.appendChild(u.el('span', { class: 't7-surface-status', text: status }));
      return c;
    }
    if (a.goal) host.appendChild(card('Goal', a.goal.title || a.goal.objective, F().label(a.goal.status)));
    if (a.todo) {
      var items = a.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete'; }).length;
      host.appendChild(card('Todo', done + ' of ' + items.length + ' complete', ''));
    }
    each(a.subagents).forEach(function (g) {
      host.appendChild(card('Agents', self.ctx.services.surfaces.subagentSummary(g), ''));
    });
    each(a.diffs).forEach(function (g) {
      var files = g.files || [];
      var add = files.reduce(function (x, f) { return x + (f.added || 0); }, 0);
      var rem = files.reduce(function (x, f) { return x + (f.removed || 0); }, 0);
      host.appendChild(card('Changes', files.length + ' files, ' + add + ' added, ' + rem + ' removed', ''));
    });
  };

  T7.prototype.renderQuestion = function () {
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

T7.prototype._renderQuestionBody = function () {
    var self = this, u = U(), svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    u.empty(host);
    var q = svc.questionnaire.activeFor(this.tid());
    if (!q) { svc.surfaces.yieldForQuestion(this.tid(), false); return; }
    svc.surfaces.yieldForQuestion(this.tid(), true);
    var idx = q.currentQuestionIndex || 0, question = (q.questions || [])[idx];
    if (!question) return;

    var card = u.el('div', { class: 't7-question' }, [
      u.el('div', { class: 't7-question-head' }, [
        u.el('span', { text: (idx + 1) + ' of ' + (q.questions || []).length }),
        u.el('span', { class: 't7-question-req', text: question.required ? 'Required' : 'Optional' })
      ]),
      u.el('p', { class: 't7-question-prompt', text: question.prompt })
    ]);
    if (question.options && question.options.length) {
      var opts = u.el('div', { class: 't7-question-opts' });
      question.options.forEach(function (o) {
        var sel = (question.selected || []).indexOf(o) >= 0;
        var b = u.el('button', { class: 't7-opt', text: o, aria: { pressed: sel ? 'true' : 'false' } });
        u.on(b, 'click', function (ev) { if (global.PMXReveal) global.PMXReveal.ripple(this, ev); svc.questionnaire.answer(q.id, question.id, o); self.renderQuestion(); });
        opts.appendChild(b);
      });
      card.appendChild(opts);
    } else {
      var ta = u.el('textarea', { class: 't7-question-free pmx-scroll' });
      ta.setAttribute('spellcheck', 'false'); ta.value = question.draft || '';
      u.on(ta, 'input', function () { svc.questionnaire.answer(q.id, question.id, ta.value); });
      card.appendChild(ta);
    }
    var acts = u.el('div', { class: 't7-question-acts' });
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
      var b = u.el('button', { class: 't7-act' + (i === 1 ? ' t7-act-primary' : ''), text: a[0] });
      u.on(b, 'click', function () { a[1](); self.renderQuestion(); self.renderSurfaces(); });
      acts.appendChild(b);
    });
    card.appendChild(acts);
    host.appendChild(card);
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
