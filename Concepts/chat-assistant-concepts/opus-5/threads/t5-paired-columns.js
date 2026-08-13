/* t5 "Paired Columns" — Opus 5
 *
 * The width-adaptive extreme. Above roughly 900px the user's turns occupy a narrow left
 * column and the assistant's a wide right column, so the eye tracks two lanes and scanning
 * who-said-what is trivial. Below that it degrades to a single column with a compact role tag.
 *
 * This concept exists to test whether a genuinely different wide-width layout can degrade
 * cleanly, so the transition must leave no orphaned column and no horizontal scroll at any
 * point in the range. The switch is a container query, never a JS width read, because the
 * same concept renders at eight different sizes in one document on a contact sheet.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }
  var ELIGIBLE = 850;

  function T5(host, ctx) {
    this.host = host; this.ctx = ctx; this.offs = []; this.rendered = {}; this.lastTid = null;
    this.build();
  }
  T5.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };
  T5.prototype.tid = function () { return this.ctx.store.get('session.activeThreadId'); };

  T5.prototype.build = function () {
    var self = this, u = U();
    this.root = u.el('div', { class: 't5-root' });
    this.root.appendChild(u.el('div', { class: 't5-head' }, [
      u.el('span', { class: 't5-head-name', text: 'Paired Columns' }),
      u.el('span', { class: 't5-head-model', text: this.ctx.label })
    ]));
    this.scroller = u.el('div', { class: 't5-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't5-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    this.inlineSurfaces = u.el('div', { class: 't5-inline-surfaces' });
    this.inlineQuestion = u.el('div', { class: 't5-inline-question' });
    if (!this.ctx.capabilities.workSurfaceHost) this.root.appendChild(this.inlineSurfaces);
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);
    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t5-turn', messageAttr: 'data-pmx-msg'
    });
    this._tickOff = this.ctx.services.runtime.onTick(function () { self.syncLive(); });
    /* Artifact state lives outside the store - the service keeps its own subscribers - so its ticks
     * arrive here and nowhere else. Without this the handoff card says `compiling` forever. */
    if (this.ctx.services.artifacts && this.ctx.services.artifacts.subscribe && !this._artOff) {
      this._artOff = this.ctx.services.artifacts.subscribe(function () {
        if (self._handoffHost) self._renderHandoff(self._handoffHost);
      });
    }
    this.renderThread();
  };

  T5.prototype.renderThread = function () {
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

  T5.prototype.buildOlder = function (hidden) {
    var self = this, u = U();
    var b = u.el('button', { class: 't5-older', text: 'Load ' + hidden.toLocaleString() + ' earlier messages' });
    this._on(b, 'click', function () {
      var tid = self.tid(), v = self.ctx.store.view(tid), t = self.ctx.data.threadById(tid);
      var cur = v.loadedFrom == null ? t.messages.length - t.initialVisibleMessageCount : v.loadedFrom;
      v.loadedFrom = Math.max(0, cur - 120);
      self.scrollCtl.preserveAcross(self.list, function () { self.renderThread(); });
    });
    return u.el('div', { class: 't5-older-wrap' }, [b]);
  };

  T5.prototype.buildTurn = function (msg) {
    var self = this, u = U(), svc = this.ctx.services;
    var lens = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;
    var turn = u.el('div', {
      class: 't5-turn pmx-msg',
      data: { pmxMsg: msg.id, pmxRole: msg.role, lens: lens || '' }
    });

    var body = u.el('div', { class: 't5-body pmx-msg-body' });
    /* The role tag is what carries identity once the two lanes collapse into one. */
    body.appendChild(u.el('span', { class: 't5-tag', text: msg.role === 'user' ? 'You' : 'Assistant' }));

    var prose = u.el('div', { class: 't5-prose' });
    String(msg.body || '').split(/\n{2,}/).forEach(function (p) {
      var s = p.replace(/\n/g, ' ').trim();
      if (s) prose.appendChild(u.el('p', { class: 't5-p', text: s }));
    });
    body.appendChild(prose);

    if ((msg.body || '').length >= ELIGIBLE) {
      var open = !!this.ctx.store.view(this.tid()).expanded[msg.id];
      body.setAttribute('data-collapsible', '1');
      body.setAttribute('data-expanded', open ? '1' : '0');
      var more = u.el('button', { class: 't5-more', text: open ? 'Show less' : 'Show more' });
      this._on(more, 'click', function () { self.setExpanded(msg.id, !self.isExpanded(msg.id)); });
      body.appendChild(more);
    }

    turn.appendChild(body);
    turn.appendChild(global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage()
    }));

    var strip = this.buildStrip(msg);
    if (strip) turn.appendChild(strip);

    this.rendered[msg.id] = { el: turn, bodyEl: body };
    return turn;
  };

  T5.prototype.buildStrip = function (msg) {
    var self = this, u = U(), svc = this.ctx.services, bits = [];
    var group = svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : msg.activityGroup;
    if (group) bits.push({ label: svc.surfaces.condenseLabel(group), kind: 'activity', group: group });
    if (msg.thoughtSegments && msg.thoughtSegments.length) {
      bits.push({ label: 'reasoning summary', kind: 'thought', segs: msg.thoughtSegments });
    }
    if (msg.completedQuestionnaire) bits.push({ label: 'question answered', kind: 'q', q: msg.completedQuestionnaire });
    if (!bits.length) return null;

    var strip = u.el('div', { class: 't5-strip' });
    bits.forEach(function (b, i) {
      if (i) strip.appendChild(u.el('span', { class: 't5-strip-sep', text: '·' }));
      var btn = u.el('button', { class: 't5-strip-btn', text: b.label });
      self._on(btn, 'click', function (ev) {
        svc.popup.open({
          anchorEl: ev.currentTarget, kind: 'panel', width: 310,
          build: function (host) { self.detail(host, b); }
        });
      });
      strip.appendChild(btn);
    });
    return strip;
  };

  T5.prototype.detail = function (host, b) {
    var u = U();
    host.appendChild(u.el('div', { class: 't5-sheet-title', text: b.label }));
    var list = u.el('div', { class: 't5-sheet-list pmx-scroll' });
    if (b.kind === 'activity') {
      this.ctx.services.surfaces.activityStages(b.group).forEach(function (st) {
        list.appendChild(u.el('div', { class: 't5-sheet-row' }, [
          u.el('span', { class: 't5-sheet-k', text: F().label(st.kind) }),
          u.el('span', { class: 't5-sheet-v', text: st.label || '' })
        ]));
      });
    } else if (b.kind === 'thought') {
      b.segs.forEach(function (s) {
        list.appendChild(u.el('div', { class: 't5-sheet-row' }, [
          u.el('span', { class: 't5-sheet-k', text: F().label(s.status) }),
          u.el('span', { class: 't5-sheet-v', text: s.summary || s.label || '' })
        ]));
      });
    } else {
      (b.q.questionsAndAnswers || []).forEach(function (qa) {
        list.appendChild(u.el('div', { class: 't5-sheet-row' }, [
          u.el('span', { class: 't5-sheet-k', text: qa.question }),
          u.el('span', { class: 't5-sheet-v', text: qa.answer })
        ]));
      });
    }
    host.appendChild(list);
    if (b.kind === 'thought') {
      host.appendChild(u.el('div', { class: 't5-sheet-foot', text: 'Provider-exposed summary only.' }));
    }
  };

  T5.prototype.lastMessage = function () { var m = this.ctx.data.messagesFor(this.tid()); return m[m.length - 1]; };

  /* ---------------------------------------------------------------- work: the third rail
   *
   * The matrix assigns this concept a THIRD WORK RAIL right of the assistant lane at 900px and up,
   * folding under the turn below that width, with each rail row opening its detail IN THE USER LANE.
   *
   * Two things make that different from every other concept's cluster, and both are deliberate:
   *
   *   1. The rail is a THIRD COLUMN, not a block inside a lane. The paired-columns grid grows from
   *      two tracks to three at 900px, so work sits beside the conversation rather than interrupting
   *      it. Below 900px the same rows fold under the turn, because a third column at 520px would be
   *      three unreadable measures.
   *   2. Detail opens in the USER LANE. Not a popup, not an inline expansion under the row - the lane
   *      that is otherwise the user's side of the dialogue becomes the reading surface for whatever the
   *      rail is asked about. That is only coherent in a concept that HAS lanes, which is exactly why
   *      it is this concept's assignment.
   *
   * What this replaces: five inert `<div class="t5-surface">` rows that could not be clicked and had no
   * detail to open. They looked like a work surface and did nothing.
   */
  T5.prototype.renderSurfaces = function () {
    var self = this, u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
    if (!host) return;
    u.empty(host);

    /* Ask the flow, not the yield flag: this runs BEFORE renderQuestion on every pass, so reading
     * `surfacesYielded` paints the rail for one frame before the dialogue takes the lanes. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    var a = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());
    var v = this.ctx.store.view(this.tid());
    var openKind = (v.surfaces && v.surfaces.expanded) || null;

    function each(val) { return val == null ? [] : (Object.prototype.toString.call(val) === '[object Array]' ? val : [val]); }

    var rows = [];

    if (a && a.goal) {
      var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(a.goal) : null;
      rows.push({
        kind: 'goal', label: 'Goal',
        text: phase ? ('Phase ' + phase.index + ' of ' + phase.total) : F().label(a.goal.status),
        status: F().label(a.goal.status),
        build: function (h) { self._detailGoal(h, a.goal); }
      });
    }

    if (a && a.todo) {
      var items = a.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
      var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
      rows.push({
        kind: 'todo', label: 'Todo',
        text: done + '/' + items.length + (blocked ? ' \u00b7 ' + blocked + ' blocked' : ''),
        build: function (h) { self._detailTodo(h, a.todo); }
      });
    }

    each(a && a.subagents).forEach(function (g, n) {
      rows.push({
        kind: 'agents' + (n || ''), label: 'Agents',
        text: (svc.surfaces.subagentSummary && svc.surfaces.subagentSummary(g)) || 'None active',
        build: function (h) { self._detailAgents(h, g); }
      });
    });

    /* Activity carries the six kinds the packet requires be visible. */
    var stages = (thread && thread.activityStages) || [];
    if (stages.length) {
      rows.push({
        kind: 'activity', label: 'Activity',
        text: stages.length + (stages.length === 1 ? ' step' : ' steps'),
        build: function (h) { self._detailStages(h, stages); }
      });
    }

    each(a && a.diffs).forEach(function (g, n) {
      var files = g.files || [];
      var add = 0, rem = 0;
      files.forEach(function (f) { add += f.added || 0; rem += f.removed || 0; });
      rows.push({
        kind: 'diff' + (n || ''), label: 'Changes',
        text: files.length + (files.length === 1 ? ' file' : ' files') + ' \u00b7 +' + add + ' \u2212' + rem,
        build: function (h) { self._detailDiff(h, g); }
      });
    });

    var verified = this._verificationRecord();
    if (verified) {
      rows.push({
        kind: 'verify', label: 'Verified',
        text: F().duration(verified.workedSeconds),
        build: function (h) {
          h.appendChild(u.el('p', { class: 't5-detail-p', text: verified.note }));
        }
      });
    }

    /* ---- the CONDENSED form: the matrix says the rail becomes a THREE-ROW summary block.
     * Three rows, not one: this concept has vertical room in a rail that a chip strip does not, and the
     * three facts a finished run leaves behind are what it did, what came out, and how long it took. */
    var group = a ? a.activity : null;
    var complete = !!(group && group.status === 'complete');
    var railRows = rows;
    if (complete && rows.length) {
      var arts = (thread && thread.artifacts) || [];
      railRows = [
        { kind: 'sum-work', label: 'Work', text: (svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : ((group.stages || []).length + ' steps')),
          build: function (h) { self._detailStages(h, (group.stages || [])); } },
        { kind: 'sum-out', label: 'Output', text: arts.length + (arts.length === 1 ? ' artifact' : ' artifacts'),
          build: function (h) { self._detailArtifacts(h, arts); } },
        { kind: 'sum-time', label: 'Elapsed', text: group.workedSeconds != null ? F().duration(group.workedSeconds) : '\u2014',
          build: function (h) { h.appendChild(u.el('p', { class: 't5-detail-p', text: 'Worked for ' + F().duration(group.workedSeconds || 0) + '.' })); } }
      ];
    }

    /* Activity, verification and advice are read straight off the thread rather than through
     * `activeFor`, so without this guard they survive the yield and leave a partial cluster beside the
     * question. The work surfaces yield as ONE thing or the yield means nothing. */
    if (railRows.length && !pendingQuestion) {
      var rail = u.el('div', { class: 't5-rail', data: { condensed: complete ? '1' : '0' } });
      railRows.forEach(function (r) {
        var on = openKind === r.kind;
        var btn = u.el('button', {
          class: 't5-rail-row', type: 'button',
          data: { kind: r.kind, open: on ? '1' : '0' },
          aria: { expanded: on ? 'true' : 'false' }
        });
        btn.appendChild(u.el('span', { class: 't5-rail-kind', text: r.label }));
        var textEl = u.el('span', { class: 't5-rail-text' });
        /* In-place morph: a rail row that appends on every count tick would grow the rail past the
         * conversation beside it. */
        if (svc.motion && svc.motion.swapText) svc.motion.swapText(textEl, r.text);
        else textEl.textContent = r.text;
        btn.appendChild(textEl);
        self._on(btn, 'click', function () {
          var vv = self.ctx.store.view(self.tid());
          vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
          vv.surfaces.expanded = (vv.surfaces.expanded === r.kind) ? null : r.kind;
          self.ctx.store.touchView('surfaces');
        });
        rail.appendChild(btn);
      });
      host.appendChild(rail);

      /* ---- the detail, rendered into the USER LANE.
       * It is a sibling of the rail with `data-lane="user"`, which the grid places in column 1 at 900px
       * and stacks below at narrow widths - the same fold the turns use, so nothing needs a second
       * breakpoint. */
      var open = null;
      for (var i = 0; i < railRows.length; i++) if (railRows[i].kind === openKind) { open = railRows[i]; break; }
      if (open) {
        var pane = u.el('div', { class: 't5-lane-detail', data: { lane: 'user', kind: open.kind } });
        var head = u.el('div', { class: 't5-lane-detail-head' });
        head.appendChild(u.el('span', { class: 't5-rail-kind', text: open.label }));
        var close = u.el('button', { class: 't5-lane-close', type: 'button', text: 'Close', aria: { label: 'Close this detail' } });
        this._on(close, 'click', function () {
          var vv = self.ctx.store.view(self.tid());
          if (vv.surfaces) vv.surfaces.expanded = null;
          self.ctx.store.touchView('surfaces');
        });
        head.appendChild(close);
        pane.appendChild(head);
        var bodyEl = u.el('div', { class: 't5-lane-detail-body pmx-scroll' });
        open.build(bodyEl);
        pane.appendChild(bodyEl);
        host.appendChild(pane);
      }
    }

    /* Advice is a NOTE IN THE USER LANE per the matrix, and the handoff sits under the rail; both get
     * their own hosts so an artifact tick repaints the card without rebuilding the rail. */
    this._bsdHost = u.el('div', { class: 't5-bsd-host' });
    this._handoffHost = u.el('div', { class: 't5-handoff-host' });
    host.appendChild(this._bsdHost);
    host.appendChild(this._handoffHost);
    this._renderBsdNote(this._bsdHost);
    this._renderHandoff(this._handoffHost);
  };

  T5.prototype._verificationRecord = function () {
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].verification) return msgs[i].verification;
    return null;
  };

  /* ---- detail builders. They render into the user lane, so they are prose-width, not sheet-width. */

  T5.prototype._detailGoal = function (host, goal) {
    var self = this, u = U();
    var svc = this.ctx.services;
    host.appendChild(u.el('p', { class: 't5-detail-p', text: goal.title || goal.objective || 'Goal' }));
    if (goal.objective && goal.title) host.appendChild(u.el('p', { class: 't5-detail-p', text: goal.objective }));

    if (goal.status === 'blocked' && goal.blocker) {
      var b = goal.blocker;
      [['Cause', b.cause], ['Affected', b.affectedScope], ['Tried', b.lastAttemptedRecovery],
       ['Stopped because', b.whyRecoveryStopped], ['Next safe action', b.nextSafeAction]].forEach(function (r) {
        if (!r[1]) return;
        host.appendChild(u.el('div', { class: 't5-detail-row' }, [
          u.el('span', { class: 't5-sheet-k', text: r[0] }),
          u.el('span', { class: 't5-sheet-v', text: r[1] })
        ]));
      });
    }

    var acts = u.el('div', { class: 't5-detail-acts' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (action) {
      if (svc.surfaces.canAct && !svc.surfaces.canAct(goal, action)) return;
      var btn = u.el('button', { class: 't5-act', type: 'button', text: action.charAt(0).toUpperCase() + action.slice(1) });
      self._on(btn, 'click', function () { svc.surfaces.act(self.tid(), action); });
      acts.appendChild(btn);
    });
    if (acts.childNodes.length) host.appendChild(acts);
  };

  T5.prototype._detailTodo = function (host, todo) {
    var u = U();
    (todo.items || []).forEach(function (it) {
      host.appendChild(u.el('div', { class: 't5-detail-row' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(it.state) }),
        u.el('span', { class: 't5-sheet-v', text: it.label })
      ]));
    });
  };

  T5.prototype._detailAgents = function (host, group) {
    var u = U();
    (group.agents || []).forEach(function (ag) {
      host.appendChild(u.el('div', { class: 't5-detail-row' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(ag.status) }),
        u.el('span', { class: 't5-sheet-v', text: ag.name + ' \u2014 ' + (ag.currentActivity || ag.task || '') }),
        u.el('span', { class: 't5-sheet-k', text: ag.workedSeconds != null ? F().duration(ag.workedSeconds) : '' })
      ]));
    });
  };

  T5.prototype._detailStages = function (host, stages) {
    var u = U();
    stages.forEach(function (st) {
      host.appendChild(u.el('div', { class: 't5-detail-row' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(st.kind) }),
        u.el('span', { class: 't5-sheet-v', text: st.label + (st.detail ? ' \u2014 ' + st.detail : '') }),
        u.el('span', { class: 't5-sheet-k', text: st.durationMs != null ? F().duration(Math.round(st.durationMs / 1000)) : (st.durationSeconds != null ? F().duration(st.durationSeconds) : '') })
      ]));
    });
  };

  T5.prototype._detailDiff = function (host, group) {
    var self = this, u = U();
    (group.files || []).forEach(function (f) {
      var row = u.el('button', { class: 't5-detail-row t5-detail-file', type: 'button' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(f.status) }),
        u.el('span', { class: 't5-sheet-v', text: f.path }),
        u.el('span', { class: 't5-sheet-k', text: '+' + (f.added || 0) + ' \u2212' + (f.removed || 0) })
      ]);
      self._on(row, 'click', function () {
        self.ctx.services.editorHost.openArtifact(
          { id: 'file-' + f.path, title: f.path, kind: 'file', projectPath: f.path }, self.ctx);
      });
      host.appendChild(row);
    });
    if (group.hiddenFileCount) host.appendChild(u.el('p', { class: 't5-detail-p', text: group.hiddenFileCount + ' more files' }));
  };

  T5.prototype._detailArtifacts = function (host, artifacts) {
    var self = this, u = U();
    var A = this.ctx.services.artifacts;
    artifacts.forEach(function (art) {
      var row = u.el('button', { class: 't5-detail-row t5-detail-file', type: 'button' }, [
        u.el('span', { class: 't5-sheet-k', text: F().label(art.kind || 'artifact') }),
        u.el('span', { class: 't5-sheet-v', text: art.title })
      ]);
      self._on(row, 'click', function () {
        A.open(art.id);
        if (A.forceReady) A.forceReady(art.id);
      });
      host.appendChild(row);
    });
  };

  /* ---------------------------------------------------------------- BSD: a note in the user lane
   *
   * The user lane is the reader's own side of the dialogue, which is the right place for a comment
   * addressed TO them about the work. It is a note, not a row in the rail: the rail reports what the
   * run is doing, and advice is not something the run is doing.
   */
  T5.prototype._renderBsdNote = function (host) {
    var self = this, u = U();
    u.empty(host);
    var bsd = this.ctx.services.bsd;
    if (!bsd || !bsd.advice) return;
    var list = bsd.advice(this.tid()) || [];
    if (!list.length) return;

    list.forEach(function (adv) {
      var note = u.el('div', { class: 't5-note', data: { lane: 'user', severity: adv.severity } });
      note.appendChild(u.el('span', {
        class: 't5-note-kind',
        text: adv.severity === 'caution' ? 'Back Seat Driver \u00b7 caution' : 'Back Seat Driver \u00b7 note'
      }));
      note.appendChild(u.el('p', { class: 't5-note-text', text: adv.text }));
      if (adv.evidenceRefs && adv.evidenceRefs.length) {
        note.appendChild(u.el('span', { class: 't5-note-ev', text: adv.evidenceRefs.join(', ') }));
      }
      /* Dismiss only: advice is read-only, and there is no service call that would apply it. */
      var dis = u.el('button', { class: 't5-note-dismiss', type: 'button', text: 'Dismiss' });
      self._on(dis, 'click', function () { bsd.dismiss(self.tid(), adv.id); });
      note.appendChild(dis);
      host.appendChild(note);
    });
  };

  /* ---------------------------------------------------------------- artifact handoff */

  T5.prototype._renderHandoff = function (host) {
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
    var card = u.el('div', { class: 't5-handoff', data: { state: state } });
    card.appendChild(u.el('span', { class: 't5-rail-kind', text: 'Artifact' }));
    card.appendChild(u.el('span', { class: 't5-handoff-title', text: ref.title }));

    var stateEl = u.el('span', { class: 't5-handoff-state' });
    var label = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, label);
    else stateEl.textContent = label;
    card.appendChild(stateEl);

    var worked = this._handoffWorkedSeconds();
    if (worked != null) card.appendChild(u.el('span', { class: 't5-handoff-worked', text: 'Worked for ' + F().duration(worked) }));

    var open = u.el('button', { class: 't5-act t5-handoff-open', type: 'button', text: 'Open' });
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

  T5.prototype._handoffWorkedSeconds = function () {
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

    /* ---------------------------------------------------------------- question: the lane dialogue
   *
   * The matrix assigns this concept a LANE DIALOGUE: the prompt renders in the ASSISTANT lane and the
   * answer form in the USER lane, and below 900px the two fold into a stacked stepper.
   *
   * That is the only question form in the eight that uses position to say who is speaking. The prompt is
   * something the assistant said, so it sits where assistant turns sit; the answer is something the
   * reader is composing, so it sits where their turns sit. Nothing labels the two halves - the lanes
   * already do, which is why this concept can afford a question with no head, no card and no chrome.
   *
   * The fold is free: both halves carry `data-lane`, and the same container query that pairs the turns
   * assigns the columns. There is no second breakpoint and no JavaScript measurement anywhere.
   */
  T5.prototype.renderQuestion = function () {
    /* Re-entrancy guard: claiming the surfaces notifies the store, which re-enters update() and
     * therefore this function mid-render. */
    if (this._inRenderQuestion) return;

    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    var prevKey = this._qkey || '';

    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }

    this._choreographLanes(host, prevKey);
  };

  /* This concept's OWN choreography: the lanes CROSS-FADE, per the matrix.
   *
   * Not a height spring - the two halves sit side by side at full width, so springing a height would
   * move the conversation above them. A cross-fade changes what the lanes say without moving anything,
   * which is the only motion that respects a two-column reading surface. */
  T5.prototype._choreographLanes = function (host, prevKey) {
    var R = global.PMXReveal;
    if (!R || !host) return;

    var svc = this.ctx.services;
    var key = R.keyFor(svc, this.tid());
    this._qkey = key;

    /* Same question, one more keystroke: silence. */
    if (prevKey === key) return;

    var halves = Array.prototype.slice.call(host.querySelectorAll('.t5-qlane'));
    if (!halves.length || R.reduced(host)) return;
    halves.forEach(function (el) { R.oneShot(el, 't5-qlane-fade', 320); });
  };

  T5.prototype._renderQuestionBody = function () {
    var self = this, u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    u.empty(host);

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;
    if (!flow) return;

    if (!flow.record) {
      this._renderLaneReceipt(host, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    var q = flow.question;

    /* ---- the assistant lane: the prompt, and nothing else. It is a thing that was said. */
    var said = u.el('div', { class: 't5-qlane', data: { lane: 'assistant', phase: flow.status } });

    if (flow.status === 'preparing' || flow.status === 'submitting') {
      said.appendChild(global.PMXReveal.capsule(
        flow.status === 'preparing' ? 'Preparing questions' : 'Submitting answers', this.ctx));
      host.appendChild(said);
      return;
    }

    said.appendChild(u.el('p', {
      class: 't5-qprompt',
      text: flow.atEnd ? 'That is every question.' : (q ? q.prompt : '')
    }));
    if (q && q.required && !flow.atEnd) said.appendChild(u.el('span', { class: 't5-qreq', text: 'Required' }));
    host.appendChild(said);

    /* ---- the user lane: the form. `Question 2 of 3` sits ABOVE it, per the matrix. */
    var mine = u.el('div', { class: 't5-qlane', data: { lane: 'user' } });

    mine.appendChild(u.el('span', {
      class: 't5-qcount',
      text: 'Question ' + flow.position + ' of ' + flow.total
    }));

    if (q && !flow.atEnd) {
      if (q.options && q.options.length) {
        var opts = u.el('div', { class: 't5-qopts' });
        q.options.forEach(function (opt) {
          var sel = (q.selected || []).indexOf(opt) >= 0;
          var b = u.el('button', { class: 't5-opt', type: 'button', text: opt, aria: { pressed: sel ? 'true' : 'false' } });
          self._on(b, 'click', function (ev) {
            if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
            svc.qflow.act(svc, self.tid(), 'answer', opt);
            self.renderQuestion();
          });
          opts.appendChild(b);
        });
        mine.appendChild(opts);
      } else {
        var ta = u.el('textarea', { class: 't5-qfree pmx-scroll', aria: { label: q.prompt } });
        ta.setAttribute('spellcheck', 'false');
        ta.value = q.draft || '';
        this._on(ta, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', ta.value); });
        mine.appendChild(ta);
      }
    }

    /* The refusal renders in the USER lane at the field, because that is where the thing it complains
     * about lives. */
    var reason = u.el('p', { class: 't5-qreason', data: { show: this._pendingReason ? '1' : '0' } });
    if (this._pendingReason) { reason.textContent = this._pendingReason; this._pendingReason = null; }
    mine.appendChild(reason);

    var acts = u.el('div', { class: 't5-qacts' });

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
      var back = u.el('button', { class: 't5-act', type: 'button', text: 'Back' });
      this._on(back, 'click', function () { svc.qflow.act(svc, self.tid(), 'prev'); self.renderQuestion(); });
      acts.appendChild(back);
    }

    /* Skip lives in the USER lane: skipping is the reader's decision, so it belongs on the reader's
     * side. The matrix says so explicitly and it is the right instinct. */
    if (q && !flow.atEnd) {
      var skip = u.el('button', { class: 't5-act', type: 'button', text: 'Skip' });
      this._on(skip, 'click', function () { svc.qflow.act(svc, self.tid(), 'skip'); self.renderQuestion(); });
      acts.appendChild(skip);
    }

    if (q && flow.isSkipped(q)) {
      var un = u.el('button', { class: 't5-act', type: 'button', text: 'Unskip' });
      this._on(un, 'click', function () { svc.qflow.act(svc, self.tid(), 'unskip', flow.index); self.renderQuestion(); });
      acts.appendChild(un);
    }

    var primary = u.el('button', { class: 't5-act t5-act-primary', type: 'button', text: flow.atEnd ? 'Send' : 'Next' });
    this._on(primary, 'click', function () {
      var res = svc.qflow.act(svc, self.tid(), flow.atEnd ? 'submit' : 'next');
      if (!res.ok) { refuse(res, 'Answer the required questions first.'); return; }
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(primary);

    /* Cancel collapses BOTH lanes to one receipt row - the matrix's exact requirement, and the reason
     * the receipt is a single full-width row rather than a pair of lanes. */
    var cancel = u.el('button', { class: 't5-act', type: 'button', text: 'Cancel' });
    this._on(cancel, 'click', function () {
      svc.qflow.act(svc, self.tid(), 'cancel');
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(cancel);

    if (flow.skippedCount) {
      acts.appendChild(u.el('span', {
        class: 't5-qskipped',
        text: flow.skippedCount === 1 ? '1 skipped' : flow.skippedCount + ' skipped'
      }));
    }

    mine.appendChild(acts);
    host.appendChild(mine);
  };

  /* One receipt row spanning both lanes. */
  T5.prototype._renderLaneReceipt = function (host, receipt) {
    var self = this, u = U();
    if (!receipt) return;

    var row = u.el('div', { class: 't5-qreceipt', data: { status: receipt.status } });
    row.appendChild(u.el('span', { class: 't5-rail-kind', text: 'Questions' }));
    row.appendChild(u.el('span', {
      class: 't5-qreceipt-text',
      text: receipt.cancelled
        ? 'Cancelled'
        : (receipt.answered + (receipt.answered === 1 ? ' answer sent' : ' answers sent') +
           (receipt.skipped ? ', ' + receipt.skipped + ' skipped' : ''))
    }));

    var show = u.el('button', { class: 't5-act', type: 'button', text: 'Show answers' });
    this._on(show, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 340,
        build: function (h) {
          h.appendChild(u.el('div', { class: 't5-sheet-title', text: receipt.cancelled ? 'Cancelled questions' : 'Answers sent' }));
          (receipt.questions || []).forEach(function (question) {
            var val = receipt.answers[question.id];
            var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't5-sheet-row' }, [
              u.el('span', { class: 't5-sheet-k', text: wasSkipped ? 'skipped' : 'answered' }),
              u.el('span', { class: 't5-sheet-v', text: question.prompt + (val == null ? '' : ' \u2014 ' + [].concat(val).join(', ')) })
            ]));
          });
        }
      });
    });
    row.appendChild(show);
    host.appendChild(row);
  };

    T5.prototype.syncLive = function () {
    var u = U(), s = this.ctx.services.runtime.liveStatus(this.tid());
    if (!s) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null; return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't5-live pmx-live' }, [
        u.el('span', { class: 't5-live-dot pmx-pulse' }),
        u.el('span', { class: 't5-live-text' }),
        u.el('span', { class: 't5-live-time' })
      ]);
      this.list.appendChild(this.liveEl);
    }
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t5-live-text'), s.text || '');
    this.ctx.services.motion.swapTextInstant(this.liveEl.querySelector('.t5-live-time'),
      s.workedSeconds != null ? F().duration(s.workedSeconds) : '');
  };

  T5.prototype.isExpanded = function (id) { return !!this.ctx.store.view(this.tid()).expanded[id]; };
  T5.prototype.setExpanded = function (id, on) {
    var self = this, rec = this.rendered[id];
    this.ctx.store.view(this.tid()).expanded[id] = !!on;
    if (!rec) return;
    this.scrollCtl.preserveAcross(rec.bodyEl, function () {
      rec.bodyEl.setAttribute('data-expanded', on ? '1' : '0');
      var b = rec.bodyEl.querySelector('.t5-more');
      if (b) b.textContent = on ? 'Show less' : 'Show more';
      self.ctx.services.motion.snapToEnd(rec.bodyEl);
    });
  };
  T5.prototype.revealHidden = function (id) { this.setExpanded(id, true); };

  T5.prototype.scrollToMessage = function (id, opts) {
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

  T5.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T5.prototype.setAnchor = function (t) { return this.scrollCtl.restoreAnchor(t); };

  T5.prototype.update = function (state, changed) {
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

  T5.prototype.destroy = function () {
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

  global.PMX.thread.register('t5', {
    name: 'Paired Columns',
    blurb: 'Above nine hundred pixels the two speakers occupy their own lanes, a narrow one for you and a wide one for the assistant, and below that the lanes fold into a single column with a compact role tag.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T5(regionEl, ctx);
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
