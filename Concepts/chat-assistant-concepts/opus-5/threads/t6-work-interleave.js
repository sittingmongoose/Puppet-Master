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

  /* Zero-padded to the widest number in the SAME operation, so `+92 \u221218` and `+61 \u221200` put
   * their digits in the same character cells. Right-aligning the token alone would only line up its
   * last digit; in a monospace log the pairs have to line up column for column. */
  function pad(n, width) {
    var s = String(n);
    while (s.length < width) s = '0' + s;
    return s;
  }

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
    /* Artifact state lives outside the store, so its ticks arrive here and nowhere else. */
    if (this.ctx.services.artifacts && this.ctx.services.artifacts.subscribe && !this._artOff) {
      this._artOff = this.ctx.services.artifacts.subscribe(function () {
        if (self._handoffHost) self._renderHandoff(self._handoffHost);
      });
    }
    this.renderThread();
  };

  T6.prototype.renderThread = function () {
    var tid = this.tid(), u = U();
    var v = this.ctx.store.view(tid);
    var msgs = this.ctx.data.visibleSlice(tid, v.loadedFrom);

    /* 01_message_arrival_spatial_continuity.mov, frames 47 to 63 (about 280ms at 57.6fps): the new
     * message enters as a flattened sliver at a seam and expands into its box, while everything
     * already on screen keeps its identity. Reprinting the whole log cannot say that - every line
     * slots in again, so the line that was actually just printed is indistinguishable from the two
     * hundred above it.
     *
     * So an append is an append. When the only difference is messages added at the END of the same
     * thread and the same loaded range, the existing lines are kept and the new ones are inserted
     * through motion.displace(); anything else is a genuine rebuild. */
    if (this._canAppendOnly(tid, v, msgs)) { this._appendTurns(msgs); return; }

    u.empty(this.list); this.rendered = {}; this.lastTid = tid;
/* The live status row lives IN the list, so emptying it detaches the node this reference
     * points at. Dropping the reference makes syncLive() below rebuild an attached one instead of
     * quietly updating an orphan, which is why the running indicator vanished after a rebuild. */
    this.liveEl = null;

    var t = this.ctx.data.threadById(tid);
    var hidden = t ? Math.max(0, t.messages.length - msgs.length) : 0;
    if (hidden > 0) this.list.appendChild(this.buildOlder(hidden));

    for (var i = 0; i < msgs.length; i++) {
      this.list.appendChild(this.buildTurn(msgs[i]));
      /* Execution units are siblings, not children. They sit between turns in the flow. */
      var work = this.buildWorkRows(msgs[i]);
      for (var j = 0; j < work.length; j++) this.list.appendChild(work[j]);
    }

    /* What the next render compares against to decide whether anything ARRIVED. */
    this._renderedIds = msgs.map(function (m) { return m.id; });
    this._renderedFrom = v.loadedFrom;

    this.renderSurfaces(); this.renderQuestion(); this.syncLive();
  };

  /* True only when this render differs from the last by messages APPENDED to the end. A changed
   * thread, a changed loaded range, a removal, or any edit to an existing line all fail this and
   * fall back to the rebuild, because none of those is an arrival and animating a reflow as though
   * something had just been said would be a lie about what happened. */
  T6.prototype._canAppendOnly = function (tid, v, msgs) {
    if (!this._renderedIds || tid !== this.lastTid) return false;
    if (v.loadedFrom !== this._renderedFrom) return false;
    if (msgs.length <= this._renderedIds.length) return false;
    for (var i = 0; i < this._renderedIds.length; i++) {
      if (msgs[i].id !== this._renderedIds[i]) return false;
    }
    return true;
  };

  /* The running indicator is the tail of the log, not a line in it, so an arriving turn is printed
   * above it rather than after it. */
  T6.prototype._listTail = function () {
    return (this.liveEl && this.liveEl.parentNode === this.list) ? this.liveEl : null;
  };

  T6.prototype._appendTurns = function (msgs) {
    var self = this;
    var svc = this.ctx.services;
    var start = this._renderedIds.length;
    var tail = this._listTail();

    function insert() {
      var last = null;
      for (var i = start; i < msgs.length; i++) {
        last = self.buildTurn(msgs[i]);
        self.list.insertBefore(last, tail);
        var work = self.buildWorkRows(msgs[i]);
        for (var j = 0; j < work.length; j++) self.list.insertBefore(work[j], tail);
      }
      /* The TURN is what arrived. Its execution rows keep their own lateral slot-in, which is the
       * distinction this concept exists to draw: prose and telemetry are different voices and they
       * do not enter the same way. */
      return last;
    }

    /* Measure, mutate, re-pin - in that order. A reader sitting at the bottom is carried with the
     * new line; a reader who has scrolled up is left where they are, which is the whole reason
     * stickIfAtBottom measures BEFORE the mutation. */
    var run = function () {
      if (svc.motion && svc.motion.displace) svc.motion.displace(self.list, insert);
      else insert();
    };
    if (this.scrollCtl && this.scrollCtl.stickIfAtBottom) this.scrollCtl.stickIfAtBottom(run);
    else run();

    this._renderedIds = msgs.map(function (m) { return m.id; });

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

  /* ---------------------------------------------------------------- work: the exec log
   *
   * The matrix assigns this concept an EXEC LOG with fixed `kind | label | duration` columns, counts
   * updating IN PLACE, condensing to one `+22 steps` row that expands the log beneath it.
   *
   * The register is the argument. This concept is monospace with no containers, so its work surface is
   * a log - and a log has columns that line up. That means:
   *
   *   - the three columns are a real grid with a fixed first track, so `kind` aligns down the whole
   *     log regardless of what any row says;
   *   - a count that changes rewrites the text of an existing row. Appending a row per tick would make
   *     the log grow forever, which in a log is not a cosmetic problem: it destroys the ability to read
   *     what happened, because the same step appears eight times with different numbers.
   *
   * What this replaces: `row()` built inert `<div class="t6-surface">` lines - one per todo item, per
   * agent, per file - with no interaction and no condensation. It printed state; it did not report it.
   */
  T6.prototype.renderSurfaces = function () {
    var self = this, u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.workSurfaceHost ? this.ctx.regions.workSurfaceHost : this.inlineSurfaces;
    if (!host) return;
    u.empty(host);

    /* Digits are rebound per pass, exactly as the question form does it: one handler per render would
     * otherwise expand an operation once per pass that ever ran. */
    this._unbindOpKeys();

    /* The element the run printed into, dropped with the pass that printed it. groupReopen has to be
     * handed the run that is ON SCREEN; a handler still holding last pass's element would push the
     * siblings of something no longer in the document. */
    this._runEl = null;

    /* Ask the flow, not the yield flag: this runs BEFORE renderQuestion on every pass. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    var a = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());
    var v = this.ctx.store.view(this.tid());
    var openIds = (v.surfaces && v.surfaces.openIds) || {};

    /* ---- the run, read BEFORE the log because the log's digits depend on whether there is one.
     *
     * Three guards, and all three are real states: PMXRunTrace may not be loaded at all, a thread with
     * no activity stages reads null, and a run that has not started renders NOTHING rather than an
     * empty frame reserving space for work that has not happened. The pending-question guard is the
     * same yield the log below obeys - the work surfaces yield as ONE thing or the yield means
     * nothing. */
    var run = (!pendingQuestion && svc.runtrace && svc.runtrace.read) ? svc.runtrace.read(this.tid()) : null;
    if (run && !run.started) run = null;

    function each(val) { return val == null ? [] : (Object.prototype.toString.call(val) === '[object Array]' ? val : [val]); }

    /* Every entry is one log line: kind, label, duration. `rows` is the expandable detail beneath. */
    var lines = [];

    if (a && a.goal) {
      var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(a.goal) : null;
      lines.push({
        key: 'goal', kind: 'goal',
        label: (a.goal.title || a.goal.objective || 'Goal') + (phase ? ('  [' + phase.index + '/' + phase.total + ' ' + phase.label + ']') : ''),
        dur: F().label(a.goal.status),
        detail: function (h) { self._logGoal(h, a.goal); }
      });
    }

    if (a && a.todo) {
      var items = a.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
      var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
      lines.push({
        key: 'todo', kind: 'todo',
        /* `6/8` in the fixed column, morphed in place - this is the line the packet's own smoke test
         * watches go from 6/8 to 8/8 without a new row appearing. */
        label: done + '/' + items.length + ' complete' + (blocked ? ', ' + blocked + ' blocked' : ''),
        dur: '',
        detail: function (h) {
          items.forEach(function (it) { self._logLine(h, F().label(it.state), it.label, ''); });
        }
      });
    }

    each(a && a.subagents).forEach(function (g, n) {
      lines.push({
        key: 'agents' + (n || ''), kind: 'agents',
        label: (svc.surfaces.subagentSummary && svc.surfaces.subagentSummary(g)) || 'none active',
        dur: '',
        detail: function (h) {
          (g.agents || []).forEach(function (ag) {
            self._logLine(h, F().label(ag.status), ag.name + ' \u2014 ' + (ag.currentActivity || ag.task || ''),
              ag.workedSeconds != null ? F().duration(ag.workedSeconds) : '');
          });
        }
      });
    });

    /* ---- the nine operations, each an exec-log row with its own record's rows beneath it.
     *
     * `opcard.forThread` is the one contract and this concept's reading of it is ALIGNED COLUMNS. The
     * six fields are not a card face here, they are six more log rows in the grid that the operation
     * row itself uses: key in the kind column, value in the label column, count in the duration
     * column. That is also why the field rows are appended to the log ITSELF rather than into a
     * `t6-log-sub` wrapper - an indented sub-block would break the one property this form exists to
     * demonstrate, which is that every key and every value sits in the same character cell.
     *
     * The kind column widens to 18ch for these rows because `OPERATION_INPUT` is fifteen characters
     * and the key is printed whole. Ellipsising a field key in a log that is ABOUT alignment would be
     * the one unreadable outcome.
     */
    var ops = (svc.opcard && svc.opcard.forThread) ? svc.opcard.forThread(this.ctx, this.tid()) : [];
    var opById = {};
    for (var oi = 0; oi < ops.length; oi++) opById[ops[oi].id] = ops[oi];

    /* digit -> line key, rebuilt every pass so the printed numbers always name what is on screen.
     *
     * A run on screen TAKES the digits. Its chain is already a numbered index and one keystroke may
     * only ever mean one thing, so the operations print no number for as long as the run holds them;
     * with no run started - this thread's state until an activity verb fires - they keep 1-9 exactly
     * as before. The handover is visible rather than silent, because the numbers themselves move. */
    this._opKeys = {};
    var opCount = 0;

    var stages = (thread && thread.activityStages) || [];
    stages.forEach(function (st) {
      var rec = opById[st.id];
      /* A stage with no operation facts is still a step; it just has nothing to expand. */
      if (!rec) {
        lines.push({
          key: 'stage-' + st.id, kind: st.kind,
          label: st.label,
          dur: st.durationMs != null ? F().duration(Math.round(st.durationMs / 1000)) : '',
          detail: st.detail ? function (h) { self._logLine(h, '', st.detail, ''); } : null
        });
        return;
      }
      opCount++;
      var key = 'op-' + rec.id;
      /* This concept numbers whatever it expects a keyboard to reach, and 1-9 is what one keystroke
       * can name. The number is printed, so the promise is visible rather than folklore. */
      if (!run && opCount <= 9) self._opKeys[String(opCount)] = key;
      lines.push({
        key: key, kind: rec.kind, op: true, flat: true,
        num: (!run && opCount <= 9) ? opCount : null,
        /* headline and statusLabel verbatim: the record owns the tense and the count. The status is a
         * token in the row's own duration column - there are no pills anywhere in this concept. */
        label: rec.headline, dur: rec.statusLabel, status: rec.status,
        detail: function (h) { self._logOpRows(h, rec); }
      });
    });

    each(a && a.diffs).forEach(function (g, n) {
      var files = g.files || [];
      var add = 0, rem = 0;
      files.forEach(function (f) { add += f.added || 0; rem += f.removed || 0; });
      lines.push({
        key: 'diff' + (n || ''), kind: 'diff',
        label: files.length + ' files  +' + add + ' \u2212' + rem,
        dur: '',
        detail: function (h) {
          files.forEach(function (f) {
            self._logLine(h, F().label(f.status), f.path, '+' + (f.added || 0) + ' \u2212' + (f.removed || 0));
          });
        }
      });
    });

    var verified = this._verificationRecord();
    if (verified) {
      lines.push({
        key: 'verify', kind: 'verify', label: verified.note,
        dur: F().duration(verified.workedSeconds), detail: null
      });
    }

    /* ---- BSD as an exec row in the monospace register, per the matrix. It is a log line like any
     * other, because in this concept that is how everything announces itself. */
    var bsd = svc.bsd;
    var advice = (bsd && bsd.advice) ? (bsd.advice(this.tid()) || []) : [];
    if (advice.length) {
      var cautions = advice.filter(function (x) { return x.severity === 'caution'; }).length;
      lines.push({
        key: 'bsd', kind: 'bsd',
        label: cautions ? (cautions + ' caution' + (cautions === 1 ? '' : 's')) : (advice.length + ' note' + (advice.length === 1 ? '' : 's')),
        dur: 'advisory',
        severity: cautions ? 'caution' : 'note',
        detail: function (h) {
          advice.forEach(function (adv) {
            var row = self._logLine(h, adv.severity === 'caution' ? 'caution' : 'note', adv.text,
              (adv.evidenceRefs || []).join(' '));
            /* Dismiss is the only verb: advice is read-only and no service call would apply it. */
            var dis = u.el('button', { class: 't6-log-dismiss', type: 'button', text: '[dismiss]' });
            self._on(dis, 'click', function () { bsd.dismiss(self.tid(), adv.id); });
            row.appendChild(dis);
          });
        }
      });
    }

    /* ---- the condensed form: ONE `+22 steps` row that expands the log beneath it. */
    var group = a ? a.activity : null;
    var complete = !!(group && group.status === 'complete');
    var logOpen = !!(v.surfaces && v.surfaces.expanded === 'log');

    /* The run prints ABOVE the log, which is both a claim and a mechanism. The claim: the run is what
     * is happening NOW and the log is what is true of the thread. The mechanism: groupReopen carries
     * the siblings AFTER the element it is given, so reopening a phase PUSHES the log and the handoff
     * row down instead of replacing them - behaviour 4 of shared/runtrace.js, f.910. */
    var opsKeyed = false;
    if (run) host.appendChild(this._buildRunLog(run));

    /* Activity, verification and advice are read straight off the thread rather than through
     * `activeFor`, so without this guard they survive the yield and leave a partial cluster beside the
     * question. The work surfaces yield as ONE thing or the yield means nothing. */
    var logEl = u.el('div', { class: 't6-log', data: { condensed: (complete && !logOpen) ? '1' : '0' } });

    if (!pendingQuestion && complete && !logOpen && lines.length) {
      /* The operation rows are not on screen in this state, so their digits must not be live either: a
       * key that expands a row nobody can see is the same class of leak as a handler left behind by a
       * re-render. The run above keeps its own, because its chain IS printed here. */
      this._opKeys = {};
      var plus = u.el('button', {
        class: 't6-log-row t6-log-more', type: 'button',
        data: { kind: 'summary' }, aria: { expanded: 'false' }
      });
      plus.appendChild(u.el('span', { class: 't6-log-kind', text: '' }));
      plus.appendChild(u.el('span', { class: 't6-log-label', text: '+' + lines.length + ' steps' }));
      plus.appendChild(u.el('span', { class: 't6-log-dur', text: group.workedSeconds != null ? F().duration(group.workedSeconds) : '' }));
      this._on(plus, 'click', function () {
        var vv = self.ctx.store.view(self.tid());
        vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
        vv.surfaces.expanded = 'log';
        self.ctx.store.touchView('surfaces');
      });
      logEl.appendChild(plus);
      host.appendChild(logEl);
    } else if (lines.length && !pendingQuestion) {
      lines.forEach(function (line) {
        var on = !!openIds[line.key];
        var cls = 't6-log-row' + (line.op ? ' t6-op' : '');
        var el = line.detail
          ? u.el('button', { class: cls, type: 'button', data: { kind: line.kind, open: on ? '1' : '0', severity: line.severity || '', status: line.status || '' }, aria: { expanded: on ? 'true' : 'false' } })
          : u.el('div', { class: cls, data: { kind: line.kind, severity: line.severity || '', status: line.status || '' } });

        el.appendChild(u.el('span', { class: 't6-log-kind', text: line.kind }));
        var labelEl = u.el('span', { class: 't6-log-label' });
        var textEl = labelEl;
        if (line.num != null) {
          /* The keyboard number, in the same glyph the question form uses for the same promise. */
          labelEl.appendChild(u.el('span', { class: 't6-form-num', text: String(line.num) }));
          textEl = u.el('span', { class: 't6-op-head' });
          labelEl.appendChild(textEl);
        }
        /* In place. A log that appends on every count tick stops being readable by the third tick. */
        if (svc.motion && svc.motion.swapText) svc.motion.swapText(textEl, line.label);
        else textEl.textContent = line.label;
        el.appendChild(labelEl);
        el.appendChild(u.el('span', { class: 't6-log-dur', text: line.dur || '' }));

        if (line.detail) self._on(el, 'click', function () { self._toggleLine(line.key); });

        logEl.appendChild(el);

        /* An operation's rows are SIBLINGS in the log, not children of an indented block: the columns
         * line up only while every row shares the log's own grid. Everything else keeps the indented
         * sub-block, which is right for detail that is a list rather than a continuation. */
        if (on && line.detail) {
          if (line.flat) {
            line.detail(logEl);
          } else {
            var sub = u.el('div', { class: 't6-log-sub' });
            line.detail(sub);
            logEl.appendChild(sub);
          }
        }
      });

      /* The digits are live, so they are advertised once - in the same columns as everything else. The
       * range names whoever actually holds them this pass: while a run is on screen the digits reopen
       * its steps and are advertised on the run's own keys row, so this row stops claiming them rather
       * than printing a promise the keyboard would not keep. */
      if (opCount) {
        opsKeyed = !run;
        logEl.appendChild(u.el('div', { class: 't6-log-row t6-op-hint' }, [
          u.el('span', { class: 't6-log-kind', text: 'keys' }),
          u.el('span', {
            class: 't6-log-label',
            text: run
              ? 'enter toggles the focused row \u00b7 the digits index the run above'
              : '1\u2013' + Math.min(opCount, 9) + ' expands an operation \u00b7 enter toggles the focused row'
          }),
          u.el('span', { class: 't6-log-dur', text: '' })
        ]));
      }

      if (complete && logOpen) {
        var back = u.el('button', { class: 't6-log-row t6-log-more', type: 'button' }, [
          u.el('span', { class: 't6-log-kind', text: '' }),
          u.el('span', { class: 't6-log-label', text: '- collapse' }),
          u.el('span', { class: 't6-log-dur', text: '' })
        ]);
        this._on(back, 'click', function () {
          var vv = self.ctx.store.view(self.tid());
          if (vv.surfaces) vv.surfaces.expanded = null;
          self.ctx.store.touchView('surfaces');
        });
        logEl.appendChild(back);
      }

      host.appendChild(logEl);
    }

    /* ONE handler for whatever digits this pass actually printed, and none at all when it printed
     * none. Binding here rather than inside a branch is what lets the run keep its keyboard in the
     * state where the log has condensed to `+22 steps` and prints no operation rows at all. */
    if (opsKeyed || (run && run.chain.length)) this._bindOpKeys();

    this._handoffHost = u.el('div', { class: 't6-handoff-host' });
    host.appendChild(this._handoffHost);
    this._renderHandoff(this._handoffHost);
  };

  /* One log line, returned so a caller can append to it. */
  T6.prototype._logLine = function (host, kind, label, dur) {
    var u = U();
    var row = u.el('div', { class: 't6-log-row t6-log-subrow' }, [
      u.el('span', { class: 't6-log-kind', text: kind || '' }),
      u.el('span', { class: 't6-log-label', text: label || '' }),
      u.el('span', { class: 't6-log-dur', text: dur || '' })
    ]);
    host.appendChild(row);
    return row;
  };

  /* One line's disclosure, shared by the pointer and the keyboard so both do the same single thing. */
  T6.prototype._toggleLine = function (key) {
    var vv = this.ctx.store.view(this.tid());
    vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
    vv.surfaces.openIds = vv.surfaces.openIds || {};
    /* Independent per line: a log is read line by line, so opening one says nothing about the others. */
    if (vv.surfaces.openIds[key]) delete vv.surfaces.openIds[key];
    else vv.surfaces.openIds[key] = true;
    this.ctx.store.touchView('surfaces');
  };

  /* ---------------------------------------------------------------- the run, as a numbered prefix run
   *
   * t6's reading of `reference/videos/03_compact_execution_activity.mov`, whose five behaviours and
   * frame citations are set out in the header of `shared/runtrace.js`.
   *
   * The reference draws the run as a capsule: a chain of glyphs inline to the left of a headline, with
   * the rows of the open phase indented beneath it. This concept cannot draw that and stay itself. It
   * is an exec log with fixed column stops, so:
   *
   *   run    1 2 3 4 5                                       38s
   *   - read Read 7 files                                     2s
   *   Edited shared/selectors.js                         +92 -18
   *   keys   1-5 reopens that step, from the keyboard alone
   *
   *   - the chain becomes a NUMBERED PREFIX RUN on its own row: each entered phase is a log POSITION,
   *     printed as its number, and the number is a real button that reopens THAT phase (f.1170 reopens
   *     `Made 1 create, 2 edits`, f.1300 reopens `Explored 7 files`);
   *   - because the positions are numbers, the digit shortcut this concept already binds for its
   *     operation rows becomes the keyboard route INTO the run: pressing 3 reopens phase 3. That makes
   *     random access into a finished run work with no pointer at all, which is the one thing the
   *     reference's own capsule cannot claim;
   *   - the chain sits on its own row rather than beside the headline, because a variable-width run of
   *     glyphs in the label column would push the headline off the column stop the rows below it share.
   *     The reference pushes its label right by one slot per glyph (f.205-209); this register cannot
   *     afford that, and alignment is the whole argument of the concept;
   *   - the open phase's rows land FLAT in the same block, each one a `t6-log-row`, exactly as an
   *     operation's own detail rows already do - an indented sub-block would break the one property
   *     this form exists to demonstrate.
   *
   * Carried over as behaviour, not as look: the count rewritten in place and digits only (f.208 ->
   * f.286 -> f.338), the present participle while running against the past tense once settled (f.194
   * against f.1170), condense as the RESTING state rather than a deletion (f.910), and a chain that
   * scrolls rather than truncating because a number IS the route back to its phase. Not carried over:
   * the reference's colours, radii, ring treatment and easing.
   */

  /* How long a printed line stays FRESH, in ms. See _morphRunText: inside this window a rebuild of the
   * run re-issues the count morph from what the line said last instead of writing the new text flat.
   * It only has to outlast ONE extra render, because a single activity verb reaches this concept
   * twice - `view.runtrace` from the trace's own announce and `view.surfaces` from the Director's
   * touch. countMorph itself runs for 220ms, so a shorter window would let a genuinely later render
   * restart an animation that is most of the way through. */
  var RUN_MORPH_FRESH_MS = 180;

  /* What the run line last SAID, per span: the text, what it changed from, and when. None of that is a
   * fact about the run, so none of it belongs in the store - it is a fact about the last paint of this
   * element. Keyed by thread, because a sentence from another thread is not a previous state of this
   * one and morphing between them would animate a change that never happened. */
  T6.prototype._runMemo = function () {
    var tid = this.tid();
    if (!this._runMemoState || this._runMemoState.tid !== tid) {
      /* `chainIds` is what makes a handover detectable in a concept that rebuilds its whole run block
       * every render. With no surviving element to compare against, the only way to know that a
       * position is ARRIVING rather than merely present is to remember what was printed a pass ago. */
      this._runMemoState = { tid: tid, text: {}, chainIds: null };
    }
    return this._runMemoState;
  };

  /* countMorph, never swapText. `Reading 6 files` becoming `Reading 7 files` has to move the digit and
   * leave the word `files` in the layout box it already had (f.208 -> f.338); cross-fading the whole
   * label reads as the line being replaced, which is the difference between a running tally and a
   * series of different sentences. countMorph falls back to a swap by itself when the WORDS changed
   * too, which is the honest outcome because at that point the sentence really did change.
   *
   * The memo is what makes the morph real here. renderSurfaces empties its host and rebuilds on every
   * view change, so the span handed to countMorph is always brand new and empty - without a remembered
   * previous string it would take its entrance path on every tick and no digit would ever move. The
   * count would still be CORRECT, which is exactly why nothing would look broken while behaviour 2
   * quietly did not happen. */
  T6.prototype._morphRunText = function (el, key, next, flat) {
    var motion = this.ctx.services.motion;
    var memo = this._runMemo();
    var slot = memo.text[key] || (memo.text[key] = { text: null, from: null, at: 0 });
    var now = Date.now();
    if (slot.text !== next) { slot.from = slot.text; slot.text = next; slot.at = now; }
    var from = slot.from;
    /* `flat` writes the new string outright while still keeping the memo current. Beat two of a
     * handover asks for it: seeding the span with the remembered previous sentence is what makes a
     * digit move within one phase, but across a handover that sentence belongs to the step that just
     * finished, so seeding it would REPRINT the outgoing line for a frame at the very moment the new
     * position arrives - the opposite of the order the two beats exist to state. */
    if (flat || from == null || from === next || (now - slot.at) > RUN_MORPH_FRESH_MS
        || !motion || !motion.countMorph) {
      el.textContent = next;
      return;
    }
    el.textContent = from;
    motion.countMorph(el, next);
  };

  /* One phase's disclosure, shared by the numbered button and by the digit that names it, so the
   * pointer and the keyboard cannot drift into doing two different things - the same rule _toggleLine
   * states for a log line. */
  T6.prototype._openRunPhase = function (phaseId) {
    var self = this;
    var svc = this.ctx.services;
    if (!svc.runtrace || !svc.runtrace.open) return;
    var el = this._runEl;
    /* groupReopen carries the siblings BELOW the run - the exec log and the handoff row - so a phase
     * opening pushes them down as one block instead of making them jump (f.910). */
    if (el && el.isConnected && svc.motion && svc.motion.groupReopen) {
      svc.motion.groupReopen(el, function () { svc.runtrace.open(self.tid(), phaseId); });
    } else {
      svc.runtrace.open(self.tid(), phaseId);
    }
  };

  T6.prototype._buildRunLog = function (run) {
    var self = this, u = U();
    var svc = this.ctx.services;
    var memo = this._runMemo();
    var open = run.open;
    /* While the run is live the running phase is its own disclosure, which is why the reference shows
     * rows under a running phase nobody asked to open. Once it condenses, nothing is disclosed until
     * the reader names a step. */
    var showRows = !!open || (!run.condensed && !!run.running);
    var subject = open || run.running || (run.chain.length ? run.chain[run.chain.length - 1] : null);
    var resting = run.condensed && !open;
    /* Which step the run is actually SHOWING, which is not always the subject of the headline. A
     * resting run falls back to its last phase for the headline but discloses nothing, so marking that
     * step as read would tell the reader they are looking at a phase while the line beside it states
     * the total. Nothing is marked until something is genuinely open or running. */
    var focus = open || run.running || null;

    var wrap = u.el('div', {
      class: 't6-run',
      data: { condensed: run.condensed ? '1' : '0', running: run.running ? '1' : '0' }
    });
    this._runEl = wrap;

    /* ---- row 1: the prefix run. One position per ENTERED phase, in entry order, because a number
     * here is a claim that the work happened. */
    this._runKeys = {};
    var idx = u.el('div', { class: 't6-log-row t6-run-index' });
    idx.appendChild(u.el('span', { class: 't6-log-kind', text: 'run' }));

    var chain = u.el('span', { class: 't6-run-chain pmx-chain' });
    var activeStep = null;
    var runningStep = null;

    /* One position, built the same way whether it is printed with the rest of the run or arrives a
     * beat later on a handover. Two builders would be two definitions of what a position is, and the
     * one that runs less often is the one that would drift. */
    function stepFor(p, i) {
      var n = i + 1;
      var isOpen = !!(focus && focus.id === p.id);
      /* Every position sits in its own slot, which is the box phaseHandover opens from zero width when
       * one phase hands over to the next (f.205-209). Without the slot there is nothing to animate and
       * the run would gain a number by jumping a character cell. */
      var slot = u.el('span', { class: 'pmx-chain-slot' });
      var btn = u.el('button', {
        class: 't6-run-step', type: 'button',
        data: { kind: p.kind, state: p.running ? 'running' : 'done', open: isOpen ? '1' : '0' },
        aria: { expanded: isOpen ? 'true' : 'false', label: 'Step ' + n + ', ' + p.headline }
      });
      btn.title = n + '. ' + p.headline;
      btn.appendChild(u.el('span', { class: 't6-run-n', text: String(n) }));
      /* Nine is what one keystroke can name. A tenth phase still prints its number and is still a
       * button - it just has no shortcut, which is a smaller loss than renumbering the run.
       *
       * The digit is registered against the map this pass owns. A beat-two insertion whose chain has
       * already been replaced by a later render must not write into the new pass's map: the position
       * it names was never printed there, so the keystroke would open a step the reader cannot see. */
      if (n <= 9 && (chain.isConnected || !self._runEl || self._runEl === wrap)) self._runKeys[String(n)] = p.id;
      self._on(btn, 'click', function () { self._openRunPhase(p.id); });
      if (isOpen) activeStep = btn;
      if (p.running) runningStep = btn;
      slot.appendChild(btn);
      chain.appendChild(slot);
      return btn;
    }

    /* THE HANDOVER, and its order (f.194-211).
     *
     * The reference lets the outgoing sentence go FIRST - at f.198-200 the label and the reasoning text
     * fade out while the old glyph stays - and only at f.205-209 does the new glyph arrive and push the
     * label one slot right. The lateral push is the part this concept cannot copy: the chain has its
     * own row beside `run` and the elapsed column, so a slot opening here would push the DURATION and
     * not the label, which `t6-work-interleave.css:474-476` refuses by name and is still right to.
     * What is copied is the CAUSAL ORDER, which is where the meaning lives: the phase that finished
     * lets go of the sentence, and only then does the phase that took over appear to claim it. A
     * single frame that swapped both at once would read as the run being replaced and would lose the
     * fact that the finished phase survives as a numbered entry.
     *
     * A handover is one specific event: the run gained EXACTLY ONE position on the end since the last
     * print and the headline is now speaking for it. A reader reopening step 2, a finished run
     * printing all its positions at once, and a reset that starts a new run all fail that test. The
     * one-position check is what covers the reset: the memo outlives the run it described, so a
     * shorter run than the one remembered is a different run, not the next step of that one. */
    var lastPhase = run.chain.length ? run.chain[run.chain.length - 1] : null;
    var painted = memo.chainIds;
    var arriving = (lastPhase && painted && painted.length === run.chain.length - 1
      && painted.indexOf(lastPhase.id) < 0
      && subject && subject.id === lastPhase.id && !run.condensed) ? lastPhase : null;
    var arrivingIndex = arriving ? run.chain.length - 1 : -1;

    memo.chainIds = [];
    run.chain.forEach(function (p) { memo.chainIds.push(p.id); });

    run.chain.forEach(function (p, i) {
      if (arriving && arriving.id === p.id) return;   /* printed on beat two, below */
      stepFor(p, i);
    });
    idx.appendChild(chain);
    /* The run's own elapsed, in the column every other row states its elapsed in. It is printed only
     * once nothing is running, because `workedSeconds` sums the AUTHORED durations of the phases
     * entered so far and the running one has not finished elapsing. */
    idx.appendChild(u.el('span', {
      class: 't6-log-dur',
      text: (!run.running && run.workedSeconds) ? F().duration(run.workedSeconds) : ''
    }));
    wrap.appendChild(idx);

    /* ---- row 2: the headline, rewritten in place, in the label column the rows below it share. */
    var head = u.el('button', {
      class: 't6-log-row t6-run-head', type: 'button',
      data: { kind: subject ? subject.kind : '', open: showRows ? '1' : '0' },
      aria: { expanded: showRows ? 'true' : 'false' }
    });
    /* The kind column keeps carrying the taxonomy word, so a run row and an operation row for the same
     * stage read as the same kind of thing. `total` is the resting run: it is not a phase. */
    head.appendChild(u.el('span', {
      class: 't6-log-kind', text: resting ? 'total' : (subject ? subject.kind : 'run')
    }));

    var line = u.el('span', { class: 't6-log-label t6-run-line' });
    var verbEl = u.el('span', { class: 't6-run-verb' });
    var argEl = u.el('span', { class: 't6-run-arg' });
    /* Behaviour 4: condensed is the RESTING state, so the resting line is the run stated as its total
     * (`13 tools used` at f.910) rather than the last thing it happened to do. */
    var verbText = resting ? run.summaryLabel : (subject ? subject.verb : '');
    var argText = resting ? '' : (subject ? subject.argument : '');

    /* On a handover both halves stay EMPTY on beat one: that IS the outgoing sentence being let go,
     * and writing the new one here would collapse the two beats into a single swap. `writeRunLine` is
     * called on beat two, beside the arriving position, and writes flat there - see `_morphRunText`. */
    function writeRunLine(flat) {
      self._morphRunText(verbEl, 'verb', verbText, flat);
      self._morphRunText(argEl, 'arg', argText, flat);
    }
    if (!arriving) writeRunLine(false);
    line.appendChild(verbEl);
    line.appendChild(argEl);
    head.appendChild(line);

    /* A phase states its duration only once it is DONE. `durationMs` is how long the stage took, so
     * printing it beside a phase still running would report a measurement the run has not made. */
    head.appendChild(u.el('span', {
      class: 't6-log-dur',
      text: (!resting && subject && subject.status === 'done' && subject.durationMs)
        ? F().duration(Math.round(subject.durationMs / 1000)) : ''
    }));

    /* One control, three meanings, in the order a reader means them: dismiss what is open, disclose a
     * condensed run, condense a live one. */
    this._on(head, 'click', function () {
      if (!svc.runtrace) return;
      if (open) { svc.runtrace.close(self.tid()); return; }
      if (run.condensed) { self._openRunPhase(null); return; }
      svc.runtrace.condense(self.tid());
    });
    wrap.appendChild(head);

    /* ---- the open phase's rows, FLAT in the block so the column stops hold. */
    if (showRows && subject) {
      var rows = subject.rows || [];
      if (rows.length) {
        /* Zero-padded to the widest number in this PHASE, the same rule the operation rows follow: in
         * a monospace log the pairs have to line up column for column, not merely end together. */
        var wAdd = 1, wRem = 1, i;
        for (i = 0; i < rows.length; i++) {
          wAdd = Math.max(wAdd, String(rows[i].added || 0).length);
          wRem = Math.max(wRem, String(rows[i].removed || 0).length);
        }
        rows.forEach(function (r) {
          var delta = (r.added != null || r.removed != null)
            ? '+' + pad(r.added || 0, wAdd) + ' \u2212' + pad(r.removed || 0, wRem) : '';
          wrap.appendChild(u.el('div', { class: 't6-log-row t6-run-row' }, [
            u.el('span', { class: 't6-log-kind', text: r.verb || '' }),
            u.el('span', { class: 't6-log-label', text: r.target || r.label || '' }),
            u.el('span', { class: 't6-log-dur', text: delta })
          ]));
        });
      } else if (subject.detail) {
        wrap.appendChild(u.el('div', { class: 't6-log-row t6-run-row' }, [
          u.el('span', { class: 't6-log-kind', text: '' }),
          u.el('span', { class: 't6-log-label', text: subject.detail }),
          u.el('span', { class: 't6-log-dur', text: '' })
        ]));
      }
    }

    /* ---- the keys row. The shortcut is advertised where the numbers are, because a keyboard route
     * nobody is told about is folklore rather than an affordance. */
    if (run.chain.length) {
      var last = Math.min(run.chain.length, 9);
      wrap.appendChild(u.el('div', { class: 't6-log-row t6-run-keys' }, [
        u.el('span', { class: 't6-log-kind', text: 'keys' }),
        u.el('span', {
          class: 't6-log-label',
          text: (last === 1 ? '1' : '1\u2013' + last) + ' reopens that step of the run, pointer or not'
        }),
        u.el('span', { class: 't6-log-dur', text: '' })
      ]));
    }

    /* The prefix run SCROLLS rather than truncating, and brings the step being read back into view.
     * The reference rolls its oldest glyph off the left as a seventh phase starts (f.910 shows six)
     * and scrolls it back when the reader clicks toward it; dropping a position would silently make
     * that phase unreachable, from the pointer and from the digit alike. */
    function rollChain(into) {
      if (!svc.motion || !svc.motion.chainRoll) return;
      var target = into || activeStep || runningStep;
      global.requestAnimationFrame(function () {
        if (chain.isConnected) svc.motion.chainRoll(chain, target ? { into: target } : null);
      });
    }

    if (arriving) {
      /* Beat two. phaseHandover is handed an already-empty label and an empty string: the sentence was
       * let go above, so there is nothing left to cross-fade, and what the primitive is here for is the
       * second beat - the slot opening from zero width at the position's own measured size, once the
       * first beat has been seen. The new sentence rides in with the position, because the line speaks
       * for whichever step the run is pointing at and writing it earlier would have the line speak for
       * a step the run has not printed yet.
       *
       * The roll waits for the insertion: rolling a run that is one position short would scroll to the
       * wrong end and correct itself a beat later. */
      var born = null;
      var insertStep = function () {
        born = stepFor(arriving, arrivingIndex);
        writeRunLine(true);
        return born;
      };
      if (svc.motion && svc.motion.phaseHandover) {
        svc.motion.phaseHandover(chain, argEl, insertStep, '').then(function () { rollChain(born); });
      } else {
        insertStep();
        rollChain(born);
      }
    } else {
      rollChain(null);
    }

    return wrap;
  };

  /* ---------------------------------------------------------------- one operation, as aligned rows
   *
   * Reference `pm7_popout.png` prints an operation as a header, a reason, six labelled facts, its
   * per-file deltas and a chip row. In this register those are nine log rows in one column grid: no
   * card, no pill, no second typeface. The only thing carrying the structure is the column stops.
   */
  T6.prototype._logOpRows = function (host, rec) {
    var self = this, u = U();
    var A = this.ctx.services.artifacts;

    /* The reason, marked the way this concept already marks commentary, spanning to the last column
     * because a sentence has no business being cropped to the width of a value. */
    if (rec.why) {
      host.appendChild(u.el('div', { class: 't6-log-row t6-op-why' }, [
        u.el('span', { class: 't6-log-kind', text: '' }),
        u.el('span', { class: 't6-log-label', text: '\u2192 ' + rec.why })
      ]));
    }

    /* All six fields, in the record's order, printed whole. */
    rec.fields.forEach(function (f) {
      /* The duration column carries the operation's own tally beside the command that produced it,
       * verbatim from the record - the count is the record's to grow, not this renderer's to derive. */
      var tally = (f.key === 'COMMAND' && rec.count != null)
        ? (rec.count + (rec.unit ? ' ' + rec.unit : '')) : '';
      host.appendChild(u.el('div', { class: 't6-log-row t6-op-field' }, [
        u.el('span', { class: 't6-log-kind', text: f.key }),
        u.el('span', { class: 't6-log-label', text: f.value }),
        u.el('span', { class: 't6-log-dur', text: tally })
      ]));
    });

    /* Per-file deltas, right-aligned in the duration column and padded to the widest number in this
     * operation, so the digits stack across files instead of merely ending together. */
    var rows = rec.rows || [];
    if (rows.length) {
      var wAdd = 1, wRem = 1, i;
      for (i = 0; i < rows.length; i++) {
        wAdd = Math.max(wAdd, String(rows[i].added || 0).length);
        wRem = Math.max(wRem, String(rows[i].removed || 0).length);
      }
      rows.forEach(function (r) {
        host.appendChild(u.el('div', { class: 't6-log-row t6-op-file' }, [
          u.el('span', { class: 't6-log-kind', text: r.verb || '' }),
          u.el('span', { class: 't6-log-label', text: r.target || '' }),
          u.el('span', {
            class: 't6-log-dur',
            text: '+' + pad(r.added || 0, wAdd) + ' \u2212' + pad(r.removed || 0, wRem)
          })
        ]));
      });
    }

    /* The closing row: bracketed tokens in the label column, elapsed in the duration column. */
    var chips = rec.chips || [];
    var elapsed = rec.durationMs != null ? F().duration(Math.round(rec.durationMs / 1000)) : '';
    if (!chips.length && !elapsed) return;

    var foot = u.el('div', { class: 't6-log-row t6-op-foot' });
    foot.appendChild(u.el('span', { class: 't6-log-kind', text: '' }));
    var cell = u.el('span', { class: 't6-log-label' });
    chips.forEach(function (chip) {
      /* The artifact token is a real button in the same brackets every command in this concept wears.
       * A token that looks live and opens nothing is worse than printing no token at all. */
      if (chip.kind === 'artifact' && chip.artifactId && A && A.open) {
        var b = u.el('button', { class: 't6-log-dismiss', type: 'button', text: '[' + chip.label + ']' });
        self._on(b, 'click', function () { self.ctx.services.artifacts.open(chip.artifactId); });
        cell.appendChild(b);
        return;
      }
      cell.appendChild(u.el('span', { class: 't6-op-chip', text: '[' + chip.label + ']' }));
    });
    foot.appendChild(cell);
    foot.appendChild(u.el('span', { class: 't6-log-dur', text: elapsed }));
    host.appendChild(foot);
  };

  /* The log's digits. Bound on the document because the log has no focusable container of its own
   * - it is rows, not a box - and released on every re-render and on destroy through the same
   * `PMXUtil.on` disposer the question keys use.
   *
   * Two maps, one keystroke. `_runKeys` reaches a numbered step of the run, which is behaviour 1 of
   * `shared/runtrace.js` reached without a pointer (f.1170, f.1300); `_opKeys` reaches an operation
   * row. Only ever one of them is filled, because a printed digit that meant two things at once would
   * be worse than printing no digit at all. */
  T6.prototype._bindOpKeys = function () {
    var self = this;
    /* One handler per pass. renderSurfaces drops the previous one before it can install this one, so
     * reaching here with a handler already bound means a second call in the same pass - and stacking
     * would open a phase once per pass that ever ran. */
    if (this._opKeyOff) return;
    var handler = function (ev) {
      if (ev.defaultPrevented || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
      if (!/^[1-9]$/.test(ev.key)) return;
      var svc = self.ctx.services;
      /* While a question is open the form owns the digits, and the log is not on screen to take them. */
      if (svc.qflow && svc.qflow.pending(svc, self.tid())) return;
      var phaseId = self._runKeys ? self._runKeys[ev.key] : null;
      if (phaseId) {
        ev.preventDefault();
        self._openRunPhase(phaseId);
        return;
      }
      var key = self._opKeys ? self._opKeys[ev.key] : null;
      if (!key) return;
      ev.preventDefault();
      self._toggleLine(key);
    };
    this._opKeyOff = U().on(global.document, 'keydown', handler);
  };

  T6.prototype._unbindOpKeys = function () {
    if (this._opKeyOff) { try { this._opKeyOff(); } catch (e) {} this._opKeyOff = null; }
    /* The maps go with the handler, so "no handler" and "no live digits" cannot disagree. A map that
     * outlived its binding would let the next handler act on rows and phases that were printed by a
     * pass - or by a thread - the reader has already navigated away from. */
    this._opKeys = {};
    this._runKeys = {};
  };

  T6.prototype._logGoal = function (host, goal) {
    var self = this, u = U();
    var svc = this.ctx.services;
    if (goal.objective) this._logLine(host, 'objective', goal.objective, '');
    if (goal.status === 'blocked' && goal.blocker) {
      var b = goal.blocker;
      [['cause', b.cause], ['scope', b.affectedScope], ['tried', b.lastAttemptedRecovery],
       ['stopped', b.whyRecoveryStopped], ['next', b.nextSafeAction]].forEach(function (r) {
        if (r[1]) self._logLine(host, r[0], r[1], '');
      });
    }
    var acts = u.el('div', { class: 't6-log-acts' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (action) {
      if (svc.surfaces.canAct && !svc.surfaces.canAct(goal, action)) return;
      var btn = u.el('button', { class: 't6-log-dismiss', type: 'button', text: '[' + action + ']' });
      self._on(btn, 'click', function () { svc.surfaces.act(self.tid(), action); });
      acts.appendChild(btn);
    });
    if (acts.childNodes.length) host.appendChild(acts);
  };

  T6.prototype._verificationRecord = function () {
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].verification) return msgs[i].verification;
    return null;
  };

  /* ---------------------------------------------------------------- artifact handoff, as a log row */

  T6.prototype._renderHandoff = function (host) {
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
    var card = u.el('div', { class: 't6-handoff', data: { state: state } });
    card.appendChild(u.el('span', { class: 't6-log-kind', text: 'artifact' }));

    var mid = u.el('span', { class: 't6-log-label' });
    mid.appendChild(u.el('span', { class: 't6-handoff-title', text: ref.title }));
    var stateEl = u.el('span', { class: 't6-handoff-state' });
    var label = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, label);
    else stateEl.textContent = label;
    mid.appendChild(stateEl);
    card.appendChild(mid);

    var worked = this._handoffWorkedSeconds();
    card.appendChild(u.el('span', { class: 't6-log-dur', text: worked != null ? F().duration(worked) : '' }));

    var open = u.el('button', { class: 't6-log-dismiss', type: 'button', text: '[open]' });
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

  T6.prototype._handoffWorkedSeconds = function () {
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

    /* ---------------------------------------------------------------- question: the monospace field form
   *
   * The matrix assigns this concept a MONOSPACE FIELD FORM: `Q1/3` fixed-width prefix rows, options
   * keyboard-numbered 1-4, answers echoing back as `-> answer` rows, and NO CARD AT ALL.
   *
   * "No card" is the whole point and the hardest part to hold onto. Every instinct says to draw a box
   * around a form; this concept has no boxes, so the question has to be legible purely from alignment:
   * a fixed prefix column, a label column, and an echo row underneath. If it needed a border to be
   * readable, the form would be wrong for the concept.
   *
   * The keyboard numbering is not decoration either - the digits are live. `1`-`9` selects, `Enter`
   * advances, `Escape` cancels. In a monospace register a numbered list implies a keyboard, and implying
   * an affordance that does not work is worse than not offering it.
   *
   * THE FORM GROWS, AND IT SAYS SO. What stood here refused any motion of the form's bounds - "a
   * log-like surface that springs its height reads as a different kind of object entirely" - and that
   * refusal was written about a surface whose rows simply appear. This form is not that. Every question
   * is printed at once and the echo rows ACCUMULATE as answers land, so paging forward grows the block
   * monotonically: the `Q1/n` row gains its `-> answer` line, then `Q2/n` gains its own, and the block
   * is taller after every one. Rows arriving one by one under a still frame reads as a list appended by
   * something else; the same rows arriving while the block itself flexes to its new size reads as this
   * form growing, which is what actually happened. The bounce is PMConcept7's own measured resize
   * (`--ease-bounce`, y1 = 1.72, plus a one-shot scale beat), and `pmx-resize-up` anchors the growth to
   * the form's bottom edge wherever a window puts this region above the composer, so what moves is the
   * form's own top edge and not the log above it.
   */
  T6.prototype.renderQuestion = function () {
    /* Re-entrancy guard: claiming the surfaces notifies the store, which re-enters update(). */
    if (this._inRenderQuestion) return;
    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }
  };

  T6.prototype._renderQuestionBody = function () {
    var self = this;
    var svc = this.ctx.services;
    var motion = svc.motion;
    var R = global.PMXReveal;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;

    /* Drop any previous key handler before this pass can install another. Without this, one handler is
     * bound per render and a single keystroke selects an option once per pass that ever ran. This runs
     * before anything below can return early, so no path leaves a handler bound to a form that is no
     * longer on screen. */
    this._unbindQuestionKeys();

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;
    if (!flow) { this._dropForm(host); return; }

    if (!flow.record) {
      /* The receipt is the questionnaire ENDING, not the form resizing, so the persistent root really
       * is released here and the receipt renders as its own block. */
      this._dropForm(host);
      this._renderFormReceipt(host, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    var made = this._ensureForm(host);
    var form = made.el;

    /* The option COUNT picks the beat. `pmx-size-bounce-strong` overshoots further and undershoots
     * once before settling, which is what a page with a different number of options is - a change of
     * shape rather than a nudge. An answer echoing back under the same question keeps the ordinary
     * beat, because the block gained one row and not a new form. */
    var q = flow.question;
    var count = (q && q.options) ? q.options.length : 0;
    var hadCount = this._qOptionCount;
    this._qOptionCount = count;

    /* A NEW questionnaire in the same form forgets what the old one showed. Question identity is
     * `qid/questionId/phase`, and the demo fixture prepares every flow under one fixed record id, so
     * a second questionnaire's question two is indistinguishable from the first one's - and the form
     * would refuse the entrance for a question the reader has genuinely never seen. `createdAt` is
     * stamped once at prepare and never rewritten, so it names the RUN rather than the record, and
     * `forgetVisits` is motion.js's own way to say this element has shown nothing yet. */
    var stamp = flow.id + '@' + ((flow.record && flow.record.createdAt) || '');
    if (this._formStamp !== stamp) {
      this._formStamp = stamp;
      if (motion && motion.forgetVisits) motion.forgetVisits(form);
    }

    /* Reference 02 is a REVIEWABLE questionnaire: paging back to an answered question shows the answer
     * still there and does NOT replay the entrance. `keyFor` is qid/questionId/phase, so it changes
     * when the reader moves to a different question and not when they type into this one, and
     * `firstVisit` stamps it on the root that SURVIVES the render - which is the only reason the stamp
     * outlives the pass that wrote it. Paging back therefore prints nothing new; the block still
     * bounces, because it really did change size, and that is a different statement from an entrance. */
    var key = R ? R.keyFor(svc, this.tid()) : '';
    var fresh = (motion && motion.firstVisit) ? motion.firstVisit(form, key) : true;

    /* NOTHING CHANGED, NOTHING MOVES.
     *
     * Advancing the flow renders this surface twice - once from the handler and once from the store
     * notification `qflow.claim` raises about ten milliseconds later - and typing into the freeform
     * line writes a draft, which notifies again. Rebuilding on a pass that changes nothing is
     * invisible by itself, but a BOUNCE on such a pass is not: it would measure the first bounce
     * mid-flight, pin that, and hand the settle a target taken from a block already on its way
     * somewhere. Comparing what the fill actually reads is the honest test and costs one string. */
    var sig = this._formSignature(flow);
    if (!made.created && sig === this._formSig) { this._bindQuestionKeys(flow); return; }
    this._formSig = sig;

    if (made.created || !motion || !motion.resizeBounce) {
      /* A form that did not exist a frame ago has no previous height. Bouncing it would animate a
       * change from zero, which states that the form shrank into existence. */
      this._fillForm(form, flow, fresh);
    } else {
      /* A bounce still in flight is LANDED first. Two overlapping bounces on one element sabotage
       * each other - the older one's cleanup timer fires inside the younger one's flight and clears
       * the pinned height, so the younger animation ends by snapping. With the signature gate above,
       * this is only reached by a real second change inside the settle window, such as answering and
       * advancing in quick succession, and there the change the reader just made is the one that
       * deserves the complete curve. */
      if (this._formBounce && this._formBounce.state && this._formBounce.state() === 'running'
          && this._formBounce.finish) {
        try { this._formBounce.finish(); } catch (e) {}
      }
      this._formBounce = motion.resizeBounce(form, function () { self._fillForm(form, flow, fresh); }, {
        bounceClass: (hadCount != null && hadCount !== count) ? 'pmx-size-bounce-strong' : 'pmx-size-bounce'
      });
    }

    /* resizeBounce runs its mutation SYNCHRONOUSLY in both its animated and its reduced-motion path,
     * so every row the digits name exists by the time the handler is bound. One unbind above and one
     * bind here, on every path that reaches a form: the pair cannot stack. */
    this._bindQuestionKeys(flow);
  };

  /* Everything the fill reads, as one string. This concept prints EVERY question at once and echoes
   * every answer, so the signature has to cover all of them: an answer landing on question two
   * changes a row this form is showing even while the reader stands on question three. */
  T6.prototype._formSignature = function (flow) {
    var parts = [
      flow.id, flow.status, flow.index, flow.total,
      flow.atEnd ? 1 : 0, this._pendingReason || ''
    ];
    (flow.questions || []).forEach(function (question) {
      parts.push(question.id, (question.options || []).length,
        (question.selected || []).join('\u0001'), question.draft || '',
        flow.isSkipped(question) ? 1 : 0, global.PMXQFlow.isAnswered(question) ? 1 : 0);
    });
    /* Delimited with escaped control characters rather than a comma: a draft is free text, and a
     * separator it could itself contain would let two different states collapse to one signature. */
    return parts.join('\u0002');
  };

  /* The form root, created ONCE and kept. It used to be destroyed and rebuilt on every render, which
   * is why there was never anything to resize: an element that did not exist a frame ago has no
   * previous height, and the `firstVisit` stamp written on it would die with it every pass. */
  T6.prototype._ensureForm = function (host) {
    var u = U();
    var tid = this.tid();
    if (this._formEl && this._formTid === tid && this._formEl.parentNode === host) {
      return { el: this._formEl, created: false };
    }

    u.empty(host);
    var form = u.el('div', { class: 't6-form', data: { phase: 'active' } });
    /* Bottom-anchored only where the region puts this above the composer. Inline in the log the form
     * is one more block with rows below it as well as above, so anchoring its bottom edge there would
     * move what follows it - the thing this class exists to prevent in the region case. */
    if (this.ctx.capabilities.questionHost) form.classList.add('pmx-resize-up');
    host.appendChild(form);

    /* Keyed by thread: another thread's questionnaire is a different form, so it must not bounce from
     * this one's height or inherit its record of what has already been shown. */
    this._formEl = form;
    this._formTid = tid;
    this._qOptionCount = null;
    this._formBounce = null;
    this._formSig = null;
    this._formStamp = null;
    return { el: form, created: true };
  };

  T6.prototype._dropForm = function (host) {
    this._formEl = null;
    this._formTid = null;
    this._qOptionCount = null;
    this._formBounce = null;
    this._formSig = null;
    this._formStamp = null;
    if (host) U().empty(host);
  };

  /* The form's CONTENTS. This is the mutation resizeBounce measures around, so it must leave the root
   * itself alone: the root's identity, its classes and its size are what the bounce is about. */
  T6.prototype._fillForm = function (form, flow, fresh) {
    var self = this, u = U();
    var svc = this.ctx.services;

    u.empty(form);
    form.setAttribute('data-phase', flow.status);
    /* The refusal line is rebuilt every fill, so the references the command row reaches for have to be
     * cleared with it. A stale one would write a refusal into a row that is no longer in the tree. */
    form._reason = null;
    form._reasonText = null;

    /* The rows that PRINT on a first visit. Only the current question's own block is in this list: the
     * echo rows and the questions above are already-known facts being re-stated, and printing them
     * again on every pass would read as the whole log being retyped. */
    var entering = [];

    if (flow.status === 'preparing' || flow.status === 'submitting') {
      this._formRow(form, flow.status === 'preparing' ? 'prep' : 'send',
        flow.status === 'preparing' ? 'preparing questions...' : 'submitting answers...');
      return;
    }

    /* ---- one row per question: `Q1/3  prompt`, with answered ones echoing `-> answer`.
     * Every question is on screen at once, which a monospace list can afford and a card cannot. */
    flow.questions.forEach(function (question, i) {
      var isCurrent = i === flow.index && !flow.atEnd;
      var skipped = flow.isSkipped(question);
      var answered = global.PMXQFlow.isAnswered(question);

      var row = self._formRow(form, 'Q' + (i + 1) + '/' + flow.total, question.prompt, {
        current: isCurrent, skipped: skipped, answered: answered
      });
      if (isCurrent) entering.push(row);

      /* Any row is reachable: clicking a past question travels to it. A form where you cannot revisit
       * question two is a wizard, not a conversation. */
      if (!isCurrent) {
        row.setAttribute('data-jump', '1');
        self._on(row, 'click', function () { svc.qflow.act(svc, self.tid(), 'goto', i); self.renderQuestion(); });
      }

      /* the echo row: what the answer WAS, in the same columns */
      if (skipped) {
        self._formEcho(form, 'skipped');
      } else if (answered) {
        var val = question.kind === 'freeform'
          ? String(question.draft || '').replace(/\s+/g, ' ').slice(0, 90)
          : (question.selected || []).join(', ');
        self._formEcho(form, val);
      }

      if (!isCurrent) return;

      /* ---- the current question's field: numbered options or a freeform line */
      if (question.options && question.options.length) {
        var list = u.el('div', { class: 't6-form-opts' });
        question.options.forEach(function (opt, n) {
          var sel = (question.selected || []).indexOf(opt) >= 0;
          var b = u.el('button', {
            class: 't6-form-opt', type: 'button',
            data: { n: String(n + 1) },
            aria: { pressed: sel ? 'true' : 'false' }
          });
          b.appendChild(u.el('span', { class: 't6-form-num', text: String(n + 1) }));
          b.appendChild(u.el('span', { class: 't6-form-opt-label', text: opt }));
          self._on(b, 'click', function () {
            svc.qflow.act(svc, self.tid(), 'answer', opt);
            self.renderQuestion();
          });
          list.appendChild(b);
        });
        form.appendChild(list);
        entering.push(list);
      } else {
        var field = u.el('textarea', { class: 't6-form-field pmx-scroll', aria: { label: question.prompt } });
        field.setAttribute('spellcheck', 'false');
        field.value = question.draft || '';
        self._on(field, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', field.value); });
        form.appendChild(field);
        entering.push(field);
      }

      /* the refusal, in the same columns, at the field */
      var reason = u.el('div', { class: 't6-form-reason', data: { show: self._pendingReason ? '1' : '0' } });
      reason.appendChild(u.el('span', { class: 't6-log-kind', text: '!' }));
      var reasonText = u.el('span', { class: 't6-log-label', text: self._pendingReason || '' });
      reason.appendChild(reasonText);
      if (self._pendingReason) self._pendingReason = null;
      form.appendChild(reason);
      form._reason = reason;
      form._reasonText = reasonText;
    });

    if (flow.atEnd) this._formRow(form, 'end', 'every question visited', { current: true });

    /* ---- the command row. Monospace verbs, keyboard hints included, because the hints are real. */
    var cmds = u.el('div', { class: 't6-form-cmds' });

    function refuse(res, fallback) {
      var text = res.reason || fallback;
      if (res.offenderIndex != null && res.offenderIndex !== flow.index) {
        self._pendingReason = text;
        self.renderQuestion();
        return;
      }
      if (form._reason) {
        form._reasonText.textContent = text;
        form._reason.setAttribute('data-show', '1');
        if (global.PMXReveal) global.PMXReveal.reject(form._reason);
      }
    }

    function cmd(label, fn) {
      var b = u.el('button', { class: 't6-form-cmd', type: 'button', text: label });
      self._on(b, 'click', fn);
      cmds.appendChild(b);
      return b;
    }

    if (flow.index > 0) cmd('[back]', function () { svc.qflow.act(svc, self.tid(), 'prev'); self.renderQuestion(); });
    if (!flow.atEnd) cmd('[skip]', function () { svc.qflow.act(svc, self.tid(), 'skip'); self.renderQuestion(); });
    if (flow.question && flow.isSkipped(flow.question)) {
      cmd('[unskip]', function () { svc.qflow.act(svc, self.tid(), 'unskip', flow.index); self.renderQuestion(); });
    }
    cmd(flow.atEnd ? '[submit]' : '[next]', function () {
      var res = svc.qflow.act(svc, self.tid(), flow.atEnd ? 'submit' : 'next');
      if (!res.ok) { refuse(res, 'answer the required questions first.'); return; }
      self.renderQuestion();
      self.renderSurfaces();
    });
    cmd('[cancel]', function () {
      svc.qflow.act(svc, self.tid(), 'cancel');
      self.renderQuestion();
      self.renderSurfaces();
    });
    cmds.appendChild(u.el('span', { class: 't6-form-hint', text: flow.atEnd ? 'enter submits \u00b7 esc cancels' : '1-9 selects \u00b7 enter advances \u00b7 esc cancels' }));

    form.appendChild(cmds);

    /* The entrance, and only on a question this form has not shown before. The rows PRINT - the same
     * left-to-right reveal every line in this log arrives with - so a new question reads as having
     * been typed out where it stands, while the block around it flexes to its new size. Paging BACK
     * takes this path with `fresh` false and prints nothing: the answer is simply there, which is what
     * reference 02 shows a reviewable questionnaire doing. */
    if (fresh) {
      for (var e = 0; e < entering.length; e++) {
        entering[e].classList.add('t6-form-enter');
        entering[e].style.setProperty('--pmx-i', String(e));
      }
    }
  };

  /* Keyboard: the digits the rows advertise. Bound on the document because the form has no focusable
   * container of its own - it is rows, not a box - and released on every re-render and on destroy. */
  T6.prototype._bindQuestionKeys = function (flow) {
    var self = this;
    var svc = this.ctx.services;
    var handler = function (ev) {
      if (ev.defaultPrevented) return;
      var tag = (ev.target && ev.target.tagName) || '';
      var typing = tag === 'TEXTAREA' || tag === 'INPUT';

      if (ev.key === 'Escape') {
        svc.qflow.act(svc, self.tid(), 'cancel');
        self.renderQuestion();
        self.renderSurfaces();
        return;
      }
      if (ev.key === 'Enter' && !ev.shiftKey && !typing) {
        ev.preventDefault();
        var res = svc.qflow.act(svc, self.tid(), flow.atEnd ? 'submit' : 'next');
        if (res.ok) { self.renderQuestion(); self.renderSurfaces(); }
        return;
      }
      if (typing) return;
      if (!/^[1-9]$/.test(ev.key)) return;

      var q = flow.question;
      if (!q || !q.options || !q.options.length) return;
      var opt = q.options[Number(ev.key) - 1];
      if (!opt) return;
      ev.preventDefault();
      svc.qflow.act(svc, self.tid(), 'answer', opt);
      self.renderQuestion();
    };
    this._qKeyOff = U().on(global.document, 'keydown', handler);
  };

  T6.prototype._unbindQuestionKeys = function () {
    if (this._qKeyOff) { try { this._qKeyOff(); } catch (e) {} this._qKeyOff = null; }
  };

  /* A form row in the log's own three columns, so the question aligns with the work above it. */
  T6.prototype._formRow = function (host, prefix, text, state) {
    var u = U();
    state = state || {};
    var row = u.el('div', {
      class: 't6-form-row',
      data: {
        current: state.current ? '1' : '0',
        skipped: state.skipped ? '1' : '0',
        answered: state.answered ? '1' : '0'
      }
    }, [
      u.el('span', { class: 't6-log-kind', text: prefix }),
      u.el('span', { class: 't6-log-label', text: text })
    ]);
    host.appendChild(row);
    return row;
  };

  T6.prototype._formEcho = function (host, text) {
    var u = U();
    var row = u.el('div', { class: 't6-form-echo' }, [
      u.el('span', { class: 't6-log-kind', text: '' }),
      u.el('span', { class: 't6-log-label', text: '\u2192 ' + text })
    ]);
    host.appendChild(row);
    return row;
  };

  T6.prototype._renderFormReceipt = function (host, receipt) {
    var self = this, u = U();
    if (!receipt) return;
    var form = u.el('div', { class: 't6-form', data: { phase: receipt.status } });
    this._formRow(form, 'q', receipt.cancelled
      ? '\u2192 cancelled'
      : ('\u2192 ' + receipt.answered + ' answered' + (receipt.skipped ? ', ' + receipt.skipped + ' skipped' : '')));
    var show = u.el('button', { class: 't6-form-cmd', type: 'button', text: '[answers]' });
    this._on(show, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 340,
        build: function (h) {
          h.appendChild(u.el('div', { class: 't6-sheet-title', text: receipt.cancelled ? 'cancelled questions' : 'answers sent' }));
          (receipt.questions || []).forEach(function (question) {
            var val = receipt.answers[question.id];
            var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't6-sheet-row' }, [
              u.el('span', { class: 't6-sheet-k', text: wasSkipped ? 'skipped' : 'answered' }),
              u.el('span', { class: 't6-sheet-v', text: question.prompt + (val == null ? '' : '  \u2192 ' + [].concat(val).join(', ')) })
            ]));
          });
        }
      });
    });
    form.appendChild(show);
    host.appendChild(form);
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
    this._unbindQuestionKeys();
    /* Drops the keydown handler AND the digit maps behind it, so a keystroke cannot reach a run that
     * this instance printed into a window region it no longer owns. */
    this._unbindOpKeys();
    this._runEl = null;
    this._runMemoState = null;
    /* The form root survives renders, so it has to be released HERE or the next instance would hold a
     * reference to an element this destroy is about to detach and would never build a new one. */
    this._formEl = null;
    this._formTid = null;
    this._qOptionCount = null;
    this._formBounce = null;
    this._formSig = null;
    this._formStamp = null;
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
    /* The append-only path keys off these. A destroyed instance that left them behind would let the
     * next render mistake a fresh mount for an append and skip printing the log already on
     * screen. */
    this._renderedIds = null;
    this._renderedFrom = null;
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
