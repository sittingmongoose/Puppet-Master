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
    var host = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
    if (!host) return;
    u.empty(host);

    /* Ask the flow, not the yield flag: this runs BEFORE renderQuestion on every pass. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    var a = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());

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

    /* Activity is ONE segment carrying six kinds; six segments would turn the bar into a list. */
    var stages = (thread && thread.activityStages) || [];
    if (stages.length) {
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

    if (!segments.length && !pendingQuestion) {
      /* Nothing live: render nothing. No empty card reserving space. */
      this._handoffHost = u.el('div', { class: 't7-handoff-host' });
      host.appendChild(this._handoffHost);
      this._renderHandoff(this._handoffHost);
      return;
    }

    /* Activity, verification and advice are read straight off the thread rather than through
     * `activeFor`, so without this guard they survive the yield and leave a partial cluster beside the
     * question. The work surfaces yield as ONE thing or the yield means nothing. */
    if (segments.length && !pendingQuestion) {
      var group = a ? a.activity : null;
      var complete = !!(group && group.status === 'complete');

      var card = u.el('div', { class: 't7-status', data: { complete: complete ? '1' : '0' } });

      /* ---- the head. When the work finishes it reads `Complete - 22m`, which is a different statement
       * from a live head, not a shortened one. */
      var head = u.el('div', { class: 't7-status-head' });
      var headText = u.el('span', { class: 't7-status-title' });
      var live = segments.filter(function (s) { return s.state === 'working'; }).length;
      var blocked = segments.filter(function (s) { return s.state === 'blocked'; }).length;
      var text = complete
        ? ('Complete \u00b7 ' + (group.workedSeconds != null ? F().duration(group.workedSeconds) : F().duration(0)))
        : (blocked ? 'Blocked' : (live ? 'Working' : 'Idle'));
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
      card.appendChild(bar);

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

  /* ---- sheets. All of them are popups: this concept allows one nesting level, and a card inside the
   * status card would be the second. */

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

    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    var prevKey = this._qkey || '';

    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }

    this._choreographDeck(host, prevKey);
  };

  /* This concept's OWN choreography: TRANSLATE AND SCALE of the siblings, per the matrix.
   *
   * The deck's depth is expressed by transform, so an advance animates the same property the layout
   * already uses - the cards behind step forward rather than fading. No height spring: the deck's height
   * is set by the tallest card and springing it would move the transcript above. */
  T7.prototype._choreographDeck = function (host, prevKey) {
    var R = global.PMXReveal;
    if (!R || !host) return;

    var svc = this.ctx.services;
    var key = R.keyFor(svc, this.tid());
    this._qkey = key;

    /* Same question, one more keystroke: silence. */
    if (prevKey === key) return;

    var deck = host.querySelector('.t7-deck');
    if (!deck || R.reduced(deck)) return;

    if (!prevKey) {
      R.oneShot(deck, 't7-deck-enter', 420);
      return;
    }
    /* ADVANCE: the top card has already been replaced by this render, so the beat plays on the deck and
     * the depth transitions carry the siblings forward. */
    R.oneShot(deck, 't7-deck-advance', 380);
  };

  T7.prototype._renderQuestionBody = function () {
    var self = this, u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    u.empty(host);

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;
    if (!flow) return;

    if (!flow.record) {
      this._renderDeckSummary(host, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    if (flow.status === 'preparing' || flow.status === 'submitting') {
      var lone = u.el('div', { class: 't7-qcard', data: { rank: '0', phase: flow.status } });
      lone.appendChild(global.PMXReveal.capsule(
        flow.status === 'preparing' ? 'Preparing questions' : 'Submitting answers', this.ctx));
      var deckWrap = u.el('div', { class: 't7-deck', data: { depth: '1' } }, [lone]);
      host.appendChild(deckWrap);
      return;
    }

    /* Remaining questions from the current one onward, capped at three visible cards. */
    var remaining = [];
    for (var i = flow.index; i < flow.questions.length; i++) remaining.push({ q: flow.questions[i], i: i });
    if (flow.atEnd) remaining = [{ q: null, i: flow.questions.length }];
    var visible = remaining.slice(0, 3);

    var deck = u.el('div', { class: 't7-deck', data: { depth: String(visible.length) } });

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

      /* Cancel FANS THE DECK OUT and removes it - the matrix's requirement, and the one gesture that
       * shows what is being discarded before it goes. */
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

    host.appendChild(deck);
  };

  /* Slide the top card off. Falls straight through under reduced motion. */
  T7.prototype._slideTop = function (deck, done) {
    var R = global.PMXReveal;
    var topEl = deck && deck.querySelector('.t7-qcard[data-top="1"]');
    if (!topEl || !R || R.reduced(topEl)) { done(); return; }
    topEl.classList.add('t7-qcard-off');
    global.setTimeout(done, 200);
  };

  /* Fan the deck out, then let the caller remove it. */
  T7.prototype._fanOut = function (deck, done) {
    var R = global.PMXReveal;
    if (!deck || !R || R.reduced(deck)) { done(); return; }
    deck.setAttribute('data-fan', '1');
    global.setTimeout(done, 260);
  };

  /* Submit collapses the deck into ONE summary card. */
  T7.prototype._renderDeckSummary = function (host, receipt) {
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
