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
    this.renderThread();
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

    U().empty(this.list);
    this.rendered = {};
    this.lastThreadId = tid;

    var thread = data.threadById(tid);
    var hidden = thread ? Math.max(0, thread.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlderNotice(hidden));

    for (var i = 0; i < msgs.length; i++) {
      var isTail = i >= msgs.length - FULL_TAIL;
      this.list.appendChild(this.buildTurn(msgs[i], isTail));
    }

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
    this._on(toggle, 'click', function () { self.setExpanded(msg.id, !self.isOpen(msg.id, isTail)); });
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

  T4Thread.prototype.renderSurfaces = function () {
    var self = this;
    var u = U();
    var host = this.surfaceHost();
    if (!host) return;
    U().empty(host);
    var active = this.ctx.services.surfaces.activeFor(this.tid());
    if (!active) return;

    function each(v) {
      return v == null ? [] : (Object.prototype.toString.call(v) === '[object Array]' ? v : [v]);
    }

    /* Consistent with the concept: each surface is itself a digest line that opens. */
    if (active.goal) host.appendChild(this.surfaceLine('Goal', active.goal.title || active.goal.objective,
      F().label(active.goal.status), function (h) { self.goalDetail(h, active.goal); }));

    if (active.todo) {
      var items = active.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete'; }).length;
      host.appendChild(this.surfaceLine('Todo', done + ' of ' + items.length + ' complete', '',
        function (h) { self.todoDetail(h, active.todo); }));
    }

    each(active.subagents).forEach(function (g) {
      host.appendChild(self.surfaceLine('Agents', self.ctx.services.surfaces.subagentSummary(g), '',
        function (h) { self.agentDetail(h, g); }));
    });

    each(active.diffs).forEach(function (g) {
      var files = g.files || [];
      var add = files.reduce(function (a, f) { return a + (f.added || 0); }, 0);
      var rem = files.reduce(function (a, f) { return a + (f.removed || 0); }, 0);
      host.appendChild(self.surfaceLine('Changes',
        files.length + ' files, ' + add + ' added, ' + rem + ' removed', '',
        function (h) { self.diffDetail(h, g); }));
    });
  };

  T4Thread.prototype.surfaceLine = function (kind, text, status, build) {
    var self = this;
    var u = U();
    var row = u.el('button', { class: 't4-surface' }, [
      u.el('span', { class: 't4-surface-kind', text: kind }),
      u.el('span', { class: 't4-surface-text', text: text })
    ]);
    if (status) row.appendChild(u.el('span', { class: 't4-surface-status', text: status }));
    this._on(row, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 320,
        build: function (host) { build(host); }
      });
    });
    return row;
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

  T4Thread.prototype.renderQuestion = function () {
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

T4Thread.prototype._renderQuestionBody = function () {
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

    var card = u.el('div', { class: 't4-question' });
    card.appendChild(u.el('div', { class: 't4-question-head' }, [
      u.el('span', { text: (idx + 1) + ' of ' + (q.questions || []).length }),
      u.el('span', { class: 't4-question-req', text: question.required ? 'Required' : 'Optional' })
    ]));
    card.appendChild(u.el('p', { class: 't4-question-prompt', text: question.prompt }));

    if (question.options && question.options.length) {
      var opts = u.el('div', { class: 't4-question-opts' });
      question.options.forEach(function (opt) {
        var sel = (question.selected || []).indexOf(opt) >= 0;
        var b = u.el('button', { class: 't4-opt', text: opt, aria: { pressed: sel ? 'true' : 'false' } });
        u.on(b, 'click', function (ev) { if (global.PMXReveal) global.PMXReveal.ripple(this, ev); svc.questionnaire.answer(q.id, question.id, opt); self.renderQuestion(); });
        opts.appendChild(b);
      });
      card.appendChild(opts);
    } else {
      var ta = u.el('textarea', { class: 't4-question-free pmx-scroll' });
      ta.setAttribute('spellcheck', 'false');
      ta.value = question.draft || '';
      u.on(ta, 'input', function () { svc.questionnaire.answer(q.id, question.id, ta.value); });
      card.appendChild(ta);
    }

    var acts = u.el('div', { class: 't4-question-acts' });
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
      var b = u.el('button', { class: 't4-act' + (i === 1 ? ' t4-act-primary' : ''), text: a[0] });
      u.on(b, 'click', function () { a[1](); self.renderQuestion(); self.renderSurfaces(); });
      acts.appendChild(b);
    });
    card.appendChild(acts);
    host.appendChild(card);
  };

  /* ---------------------------------------------------------------- live */

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
    if (this.scrollCtl && this.scrollCtl.destroy) { try { this.scrollCtl.destroy(); } catch (e) {} }
    [this.root, this.inlineSurfaces, this.inlineQuestion].forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    this.rendered = {};
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
