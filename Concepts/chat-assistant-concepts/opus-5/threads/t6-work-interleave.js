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

    /* Ask the flow, not the yield flag: this runs BEFORE renderQuestion on every pass. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    var a = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());
    var v = this.ctx.store.view(this.tid());
    var openIds = (v.surfaces && v.surfaces.openIds) || {};

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

    /* digit -> line key, rebuilt every pass so the printed numbers always name what is on screen. */
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
      if (opCount <= 9) self._opKeys[String(opCount)] = key;
      lines.push({
        key: key, kind: rec.kind, op: true, flat: true,
        num: opCount <= 9 ? opCount : null,
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

    /* Activity, verification and advice are read straight off the thread rather than through
     * `activeFor`, so without this guard they survive the yield and leave a partial cluster beside the
     * question. The work surfaces yield as ONE thing or the yield means nothing. */
    var logEl = u.el('div', { class: 't6-log', data: { condensed: (complete && !logOpen) ? '1' : '0' } });

    if (!pendingQuestion && complete && !logOpen && lines.length) {
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

      /* The digits are live, so they are advertised once - in the same columns as everything else. */
      if (opCount) {
        logEl.appendChild(u.el('div', { class: 't6-log-row t6-op-hint' }, [
          u.el('span', { class: 't6-log-kind', text: 'keys' }),
          u.el('span', { class: 't6-log-label', text: '1\u2013' + Math.min(opCount, 9) + ' expands an operation \u00b7 enter toggles the focused row' }),
          u.el('span', { class: 't6-log-dur', text: '' })
        ]));
        this._bindOpKeys();
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

  /* The operation digits. Bound on the document because the log has no focusable container of its own
   * - it is rows, not a box - and released on every re-render and on destroy through the same
   * `PMXUtil.on` disposer the question keys use. */
  T6.prototype._bindOpKeys = function () {
    var self = this;
    var handler = function (ev) {
      if (ev.defaultPrevented || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
      if (!/^[1-9]$/.test(ev.key)) return;
      var svc = self.ctx.services;
      /* While a question is open the form owns the digits, and the log is not on screen to take them. */
      if (svc.qflow && svc.qflow.pending(svc, self.tid())) return;
      var key = self._opKeys ? self._opKeys[ev.key] : null;
      if (!key) return;
      ev.preventDefault();
      self._toggleLine(key);
    };
    this._opKeyOff = U().on(global.document, 'keydown', handler);
  };

  T6.prototype._unbindOpKeys = function () {
    if (this._opKeyOff) { try { this._opKeyOff(); } catch (e) {} this._opKeyOff = null; }
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
   * Rows append and remove; nothing animates its bounds. That is correct for this register: a log-like
   * surface that springs its height reads as a different kind of object entirely.
   */
  T6.prototype.renderQuestion = function () {
    /* Re-entrancy guard: claiming the surfaces notifies the store, which re-enters update(). */
    if (this._inRenderQuestion) return;
    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }
  };

  T6.prototype._renderQuestionBody = function () {
    var self = this, u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    u.empty(host);

    /* Drop any previous key handler before this pass can install another. Without this, one handler is
     * bound per render and a single keystroke selects an option once per pass that ever ran. */
    this._unbindQuestionKeys();

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;
    if (!flow) return;

    if (!flow.record) {
      this._renderFormReceipt(host, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    var form = u.el('div', { class: 't6-form', data: { phase: flow.status } });

    if (flow.status === 'preparing' || flow.status === 'submitting') {
      this._formRow(form, flow.status === 'preparing' ? 'prep' : 'send',
        flow.status === 'preparing' ? 'preparing questions...' : 'submitting answers...');
      host.appendChild(form);
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
      } else {
        var field = u.el('textarea', { class: 't6-form-field pmx-scroll', aria: { label: question.prompt } });
        field.setAttribute('spellcheck', 'false');
        field.value = question.draft || '';
        self._on(field, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', field.value); });
        form.appendChild(field);
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
    host.appendChild(form);

    this._bindQuestionKeys(flow);
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
    this._unbindOpKeys();
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
