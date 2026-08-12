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

      if (text) {
        host.appendChild(this._workDigest(text, condensed, detail));
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

  T4Thread.prototype.activityDetail = function (host, stages) {
    var u = U();
    stages.forEach(function (st) {
      host.appendChild(u.el('div', { class: 't4-sheet-row' }, [
        u.el('span', { class: 't4-sheet-k', text: F().label(st.kind) }),
        u.el('span', { class: 't4-sheet-v', text: st.label + (st.detail ? ' \u2014 ' + st.detail : '') })
      ]));
    });
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
  T4Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard. Claiming the work surfaces notifies the store, which re-enters update() and
     * therefore this function mid-render: the inner pass appends the entry and the outer pass appends
     * a second one into a host it already emptied. */
    if (this._inRenderQuestion) return;

    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    var from = global.PMXReveal ? global.PMXReveal.measure(host && host.firstElementChild) : undefined;
    var prevKey = this._qkey || '';

    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }

    this._unfoldQuestion(host, from, prevKey);
  };

  /* This concept's OWN choreography, and deliberately the quietest of the eight: it reuses the digest
   * unfold and adds no new motion vocabulary. The shared `afterRender` that used to live here sprang a
   * height for all eight concepts identically - which on a digest read as a panel inflating, in a
   * register whose entire premise is that entries open and close the same restrained way. */
  T4Thread.prototype._unfoldQuestion = function (host, from, prevKey) {
    var R = global.PMXReveal;
    if (!R || !host) return;

    var svc = this.ctx.services;
    var key = R.keyFor(svc, this.tid());
    this._qkey = key;

    /* Same question, one more keystroke: silence. A freeform answer re-renders per character because
     * typing writes a draft and the draft notifies the store. */
    if (prevKey === key) return;

    var entry = host.querySelector('.t4-qdigest');
    if (!entry || R.reduced(entry)) return;

    if (!prevKey) {
      /* ENTRANCE: the same unfold an ordinary digest entry uses when it opens. */
      if (svc.motion && svc.motion.collapseTo) svc.motion.collapseTo(entry, true, { collapsedHeight: 0, duration: 240 });
      return;
    }

    /* ADVANCE: spring from the outgoing entry's height so the fold reads as one surface changing its
     * mind, not two surfaces swapping. */
    if (from != null) R.springHeight(entry, from);
  };

  T4Thread.prototype._renderQuestionBody = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    U().empty(host);

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;
    if (!flow) return;

    if (!flow.record) {
      /* Resolved. The entry re-condenses carrying its answer - it does not vanish. */
      this._renderQuestionReceipt(host, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    var open = this._questionOpen !== false; // an active question opens by default; the user may fold it
    var entry = u.el('div', { class: 't4-qdigest', data: { open: open ? '1' : '0', phase: flow.status } });

    /* ---- the digest line. `2/3` lives HERE, inside the line, per the matrix. */
    var line = u.el('div', { class: 't4-qdigest-line' });
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
    entry.appendChild(line);

    if (!open || flow.status === 'preparing' || flow.status === 'submitting') {
      host.appendChild(entry);
      return;
    }

    /* ---- the unfolded body */
    var body = u.el('div', { class: 't4-qdigest-body' });

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

    entry.appendChild(body);
    host.appendChild(entry);
  };

  /* The re-condensed entry. Submitted carries the answer count; cancelled is marked `Cancelled`. */
  T4Thread.prototype._renderQuestionReceipt = function (host, receipt) {
    var self = this;
    var u = U();
    if (!receipt) return;

    var entry = u.el('div', { class: 't4-qdigest t4-qdigest-done', data: { open: '0', status: receipt.status } });
    var line = u.el('div', { class: 't4-qdigest-line' });
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
    entry.appendChild(line);
    host.appendChild(entry);
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
