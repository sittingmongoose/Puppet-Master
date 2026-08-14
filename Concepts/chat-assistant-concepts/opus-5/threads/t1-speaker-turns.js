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
    /* Artifact state lives OUTSIDE the store - the service keeps its own subscribers - so its ticks
     * arrive here and nowhere else. Without this the handoff card renders `compiling` and stays there
     * forever, because `artifacts.open()` writes session state and no `view*` key covers it. */
    var selfArt = this;
    if (this.ctx.services.artifacts && this.ctx.services.artifacts.subscribe && !this._artOff) {
      this._artOff = this.ctx.services.artifacts.subscribe(function () {
        if (selfArt._handoffHost) selfArt._renderHandoff(selfArt._handoffHost);
      });
    }
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

  /* ---------------------------------------------------------------- work: the two-row strip
   *
   * The matrix assigns this concept a TWO-ROW WORK STRIP: row one is a phase glyph index, row two is
   * ONE label that morphs in place. Not one block per surface - one strip for all of them.
   *
   * Why that shape belongs here: this concept is hanging labels and prose measure with no containers
   * anywhere. A stack of bordered surface cards (what this function used to build) is the one thing the
   * concept promises not to do. A glyph index plus a single sentence carries the same information in the
   * register the transcript already reads in.
   *
   * Groups reopen INDEPENDENTLY, so the open set lives in `view[tid].surfaces.openIds` - the per-record
   * map the store carries for exactly this - rather than the single `expanded` slot used by concepts
   * that promise single-detail behaviour.
   */
  T1Thread.prototype.renderSurfaces = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.surfaceHost();
    if (!host) return;
    U().empty(host);

    /* Ask the flow, not `surfacesYielded`: that flag is written by renderQuestion, which runs AFTER
     * this on every pass, so reading it here paints the strip for one frame before the question
     * displaces it. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    this._bsdHost = u.el('div', { class: 't1-bsd-host' });
    this._handoffHost = u.el('div', { class: 't1-handoff-host' });

    if (!pendingQuestion) {
      var active = svc.surfaces ? svc.surfaces.activeFor(this.tid()) : null;
      var thread = this.ctx.data.threadById(this.tid());
      var v = this.ctx.store.view(this.tid());
      var openIds = (v.surfaces && v.surfaces.openIds) || {};

      function each(val) { return val == null ? [] : (Object.prototype.toString.call(val) === '[object Array]' ? val : [val]); }
      function glyph(name) { return (svc.icons && svc.icons.has && svc.icons.has(name)) ? name : 'dot'; }

      var groups = [];

      if (active && active.goal) {
        var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(active.goal) : null;
        groups.push({
          key: 'goal', icon: glyph('gauge'),
          /* The phase index leads the strip: on one line, "where are we" outranks everything else. */
          short: phase ? ('Phase ' + phase.index + ' of ' + phase.total) : F().label(active.goal.status),
          title: active.goal.title || active.goal.objective,
          build: function (h) { h.appendChild(self.buildGoal(active.goal)); }
        });
      }

      if (active && active.todo) {
        var items = active.todo.items || [];
        var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
        var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
        groups.push({
          key: 'todo', icon: glyph('check'),
          short: done + '/' + items.length + ' Todos' + (blocked ? ', ' + blocked + ' blocked' : ''),
          title: 'Tasks',
          build: function (h) { h.appendChild(self.buildTodo(active.todo)); }
        });
      }

      each(active && active.subagents).forEach(function (g, n) {
        groups.push({
          key: 'agents' + (n || ''), icon: glyph('crew'),
          /* subagentSummary returns '' when every count is zero, and an empty segment renders as a
           * hollow `· ·` gap in the one-line strip. State the absence instead. */
          short: (svc.surfaces.subagentSummary && svc.surfaces.subagentSummary(g)) || 'No agents active',
          title: g.label || 'Agents',
          build: function (h) { h.appendChild(self.buildSubagents(g)); }
        });
      });

      /* Activity carries the six kinds the packet wants visible: read, search, web, browser, test,
       * verify. Without it the strip cannot report what the run actually did. */
      var stages = (thread && thread.activityStages) || [];
      if (stages.length) {
        groups.push({
          key: 'activity', icon: glyph('beaker'),
          short: self._activityShort(stages),
          title: 'Activity',
          build: function (h) { self.buildStagesDetail(h, stages); }
        });
      }

      each(active && active.diffs).forEach(function (g, n) {
        var fs = g.files || [];
        var add = 0, rem = 0;
        fs.forEach(function (f) { add += f.added || 0; rem += f.removed || 0; });
        groups.push({
          key: 'diff' + (n || ''), icon: glyph('diff'),
          short: fs.length + (fs.length === 1 ? ' file' : ' files') + ', +' + add + ' \u2212' + rem,
          title: g.label || 'Changes',
          build: function (h) { h.appendChild(self.buildDiff(g)); }
        });
      });

      var verified = this._verificationRecord();
      if (verified) {
        groups.push({
          key: 'verify', icon: glyph('shield'),
          short: 'Verified',
          title: 'Verification',
          build: function (h) {
            h.appendChild(u.el('p', { class: 't1-wstrip-note', text: verified.note }));
            h.appendChild(u.el('p', { class: 't1-wstrip-note', text: 'Worked for ' + F().duration(verified.workedSeconds) }));
          }
        });
      }

      if (groups.length) host.appendChild(this._buildWorkStripRows(groups, openIds));

      /* Every operation the run performed, as marginalia beneath the strip that summarised them. The
       * strip says WHAT HAPPENED in one line; the ledger is the record, and it is the only place the
       * command, cache, permission and operation input are readable. */
      var opHost = u.el('div', { class: 't1-ops' });
      this._renderOpLedger(opHost);
      if (opHost.firstChild) host.appendChild(opHost);
    }

    host.appendChild(this._bsdHost);
    host.appendChild(this._handoffHost);
    this._renderBsdMargin(this._bsdHost);
    this._renderHandoff(this._handoffHost);
  };

  T1Thread.prototype._activityShort = function (stages) {
    var kinds = {};
    stages.forEach(function (st) { kinds[st.kind] = (kinds[st.kind] || 0) + 1; });
    var words = { read: 'read', search: 'searched', web: 'fetched', browser: 'inspected', test: 'tested', verify: 'verified' };
    var parts = [];
    for (var k in kinds) {
      if (!Object.prototype.hasOwnProperty.call(kinds, k)) continue;
      parts.push(kinds[k] + ' ' + (words[k] || F().label(k).toLowerCase()));
    }
    return parts.join(', ');
  };

  /* The strip. Two rows, and row two is ONE element for the whole strip - which is what makes the count
   * morph a morph rather than an append: `motion.swapText` replaces the text of a row that was already
   * there, so a live run never grows the transcript by a line per tick. */
  T1Thread.prototype._buildWorkStripRows = function (groups, openIds) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;

    /* The LATEST activity group in the thread, not the newest message's - the newest turn frequently
     * carries none, which left the completed sentence unreachable. */
    var activeNow = this.ctx.services.surfaces ? this.ctx.services.surfaces.activeFor(this.tid()) : null;
    var group = activeNow ? activeNow.activity : null;
    var complete = !!(group && group.status === 'complete');

    var strip = u.el('div', { class: 't1-wstrip', data: { complete: complete ? '1' : '0' } });

    /* ---- row 1: the phase glyph index */
    var index = u.el('div', { class: 't1-wstrip-index' });
    groups.forEach(function (g) {
      var on = !!openIds[g.key];
      var btn = u.el('button', {
        class: 't1-wstrip-glyph', type: 'button',
        data: { kind: g.key, open: on ? '1' : '0' },
        aria: { expanded: on ? 'true' : 'false', label: g.title + ', ' + g.short }
      });
      btn.title = g.title + ' \u2014 ' + g.short;
      if (svc.icons) btn.appendChild(svc.icons.get(g.icon, 14));
      self._on(btn, 'click', function () {
        var v = self.ctx.store.view(self.tid());
        v.surfaces = v.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
        v.surfaces.openIds = v.surfaces.openIds || {};
        /* Independent: opening one group says nothing about the others, and each keeps its own state
         * across a remount because it lives in the store rather than in a module local. */
        if (v.surfaces.openIds[g.key]) delete v.surfaces.openIds[g.key];
        else v.surfaces.openIds[g.key] = true;
        self.ctx.store.touchView('surfaces');
      });
      index.appendChild(btn);
    });
    strip.appendChild(index);

    /* ---- row 2: one label, morphed in place */
    var line = u.el('div', { class: 't1-wstrip-line' });
    var text;
    if (complete) {
      /* The completed form is a different sentence, exactly as the matrix specifies. */
      var toolCount = svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : ((group.stages || []).length + ' steps');
      text = toolCount + (group.workedSeconds != null ? ' \u00b7 Worked for ' + F().duration(group.workedSeconds) : '');
    } else {
      text = groups.map(function (g) { return g.short; })
        .filter(function (part) { return part && String(part).length; })
        .join(' \u00b7 ');
    }
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(line, text);
    else line.textContent = text;
    strip.appendChild(line);

    /* ---- expanded groups, beneath the strip, in index order */
    groups.forEach(function (g) {
      if (!openIds[g.key]) return;
      var panel = u.el('div', { class: 't1-wstrip-panel', data: { kind: g.key } });
      panel.appendChild(u.el('div', { class: 't1-wstrip-panel-title', text: g.title }));
      g.build(panel);
      strip.appendChild(panel);
    });

    return strip;
  };

  T1Thread.prototype.buildStagesDetail = function (host, stages) {
    var u = U();
    stages.forEach(function (st) {
      var row = u.el('div', { class: 't1-stage', data: { kind: st.kind } });
      row.appendChild(u.el('span', { class: 't1-stage-kind', text: F().label(st.kind) }));
      row.appendChild(u.el('span', { class: 't1-stage-label', text: st.label }));
      if (st.detail) row.appendChild(u.el('span', { class: 't1-stage-detail', text: st.detail }));
      if (st.durationMs != null) row.appendChild(u.el('span', { class: 't1-stage-dur', text: F().duration(Math.round(st.durationMs / 1000)) }));
      host.appendChild(row);
    });
  };

  T1Thread.prototype._verificationRecord = function () {
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].verification) return msgs[i].verification;
    return null;
  };

  /* ---------------------------------------------------------------- BSD: a margin annotation
   *
   * The matrix places advice in the MARGIN beside the turn it concerns - the same margin the speaker
   * labels hang in. That is the honest position for it in this concept: advice is not part of the
   * conversation, it is written alongside it, the way a reader annotates a page.
   */
  T1Thread.prototype._renderBsdMargin = function (host) {
    var self = this;
    var u = U();
    U().empty(host);
    var bsd = this.ctx.services.bsd;
    if (!bsd || !bsd.advice) return;

    var list = bsd.advice(this.tid()) || [];
    if (!list.length) return;

    list.forEach(function (adv) {
      var note = u.el('div', { class: 't1-annot', data: { severity: adv.severity } });

      /* The margin carries the severity IN WORDS, in the same slot a speaker label occupies, so the
       * distinction never rests on colour alone. */
      note.appendChild(u.el('div', { class: 't1-annot-margin' }, [
        u.el('span', { class: 't1-annot-kind', text: adv.severity === 'caution' ? 'Caution' : 'Note' })
      ]));

      var body = u.el('div', { class: 't1-annot-body' });
      body.appendChild(u.el('p', { class: 't1-annot-text', text: adv.text }));
      if (adv.evidenceRefs && adv.evidenceRefs.length) {
        body.appendChild(u.el('span', { class: 't1-annot-ev', text: adv.evidenceRefs.join(', ') }));
      }
      /* Dismiss and nothing else. Advice is read-only by construction: there is no API to apply it and
       * there must not be one - an advisor that can write is not an advisor. */
      var dis = u.el('button', { class: 't1-annot-dismiss', type: 'button', text: 'Dismiss' });
      self._on(dis, 'click', function () { bsd.dismiss(self.tid(), adv.id); });
      body.appendChild(dis);

      note.appendChild(body);
      host.appendChild(note);
    });
  };

  /* ---------------------------------------------------------------- artifact handoff */

  T1Thread.prototype._renderHandoff = function (host) {
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

    /* Compact and CONNECTED to the work: it sits directly under the strip that produced it, and hangs
     * its kind in the margin like every other row in this concept. */
    var card = u.el('div', { class: 't1-handoff', data: { state: state } });
    card.appendChild(u.el('div', { class: 't1-annot-margin' }, [
      u.el('span', { class: 't1-annot-kind', text: 'Artifact' })
    ]));

    var body = u.el('div', { class: 't1-handoff-body' });
    body.appendChild(u.el('span', { class: 't1-handoff-title', text: ref.title }));

    var stateEl = u.el('span', { class: 't1-handoff-state' });
    var label = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, label);
    else stateEl.textContent = label;
    body.appendChild(stateEl);

    var worked = this._handoffWorkedSeconds();
    if (worked != null) body.appendChild(u.el('span', { class: 't1-handoff-worked', text: 'Worked for ' + F().duration(worked) }));

    var open = u.el('button', { class: 't1-handoff-open', type: 'button', text: 'Open' });
    this._on(open, 'click', function () {
      A.open(ref.id);
      /* Settle the simulated transport in the same interaction. The card repaints through the artifact
       * subscription, not from here: `open` writes session state, which no `view*` key covers. */
      if (A.forceReady) A.forceReady(ref.id);
      if (svc.motion && svc.motion.handoff) svc.motion.handoff(card);
    });
    body.appendChild(open);

    card.appendChild(body);
    host.appendChild(card);
  };

  T1Thread.prototype._handoffWorkedSeconds = function () {
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

  /* ---------------------------------------------------------------- the operation ledger
   *
   * `reference/screenshots/pm7_popout.png` prints one unit of tool work as a header, a reason, six
   * named fields, its per-file deltas and two chips. This concept renders that record the only way it
   * can without breaking its own promise: as MARGINALIA. The headline is a small-caps margin label,
   * the reason is an italic gloss on the measure, and the six fields become a hanging definition list
   * whose keys sit in the same column as every speaker label in the transcript - so the ledger aligns
   * with the conversation instead of forming a table beside it.
   *
   * There is no card, no pill and no chip box in it. Status is a word after the headline, `/sources`
   * is plain text, and the artifact is the same underlined text button the work strip already uses, so
   * the transcript gains no second control vocabulary.
   */
  T1Thread.prototype._renderOpLedger = function (host) {
    var u = U();
    var svc = this.ctx.services;
    if (!svc.opcard || !svc.opcard.forThread) return;

    var recs = svc.opcard.forThread(this.ctx, this.tid());
    if (!recs.length) return;

    /* One margin label for the ledger, in the slot a speaker label occupies. */
    host.appendChild(u.el('div', { class: 't1-annot-margin' }, [
      u.el('span', { class: 't1-annot-kind', text: 'Operations' }),
      u.el('span', { class: 't1-op-meta', text: recs.length + ' recorded' })
    ]));

    for (var i = 0; i < recs.length; i++) host.appendChild(this._buildOpBlock(recs[i]));
  };

  T1Thread.prototype._buildOpBlock = function (rec) {
    var self = this;
    var u = U();
    /* The SAME expand map long messages use, keyed by operation id. Reusing it is what keeps a
     * reopened thread showing the operations it was left showing, and it means this concept still has
     * exactly one disclosure mechanism. */
    var view = this.ctx.store.view(this.tid());
    var key = 'op-' + rec.id;
    var open = !!view.expanded[key];

    var block = u.el('div', {
      class: 't1-annot t1-op',
      data: { opKind: rec.kind, opStatus: rec.status, expanded: open ? '1' : '0' }
    });

    /* ---- the margin label. Status is a WORD after the headline: a coloured capsule here would be the
     * first pill in a transcript that has none. The count, its unit and the duration are printed as the
     * record states them - a renderer that recomputed either would drift from the run. */
    var margin = u.el('div', { class: 't1-annot-margin' }, [
      u.el('span', { class: 't1-op-label', text: rec.headline }),
      u.el('span', { class: 't1-op-status', text: '\u2014 ' + rec.statusLabel })
    ]);
    if (rec.count != null) {
      margin.appendChild(u.el('span', {
        class: 't1-op-meta',
        text: rec.count + (rec.unit ? ' ' + rec.unit : '')
      }));
    }
    if (rec.durationMs != null) {
      margin.appendChild(u.el('span', {
        class: 't1-op-meta',
        text: F().duration(Math.round(rec.durationMs / 1000))
      }));
    }
    block.appendChild(margin);

    /* ---- why it ran, as an italic gloss directly under the label. */
    if (rec.why) block.appendChild(u.el('p', { class: 't1-annot-text t1-op-why', text: rec.why }));

    /* ---- the detail: six keys in the margin, six values on the measure. */
    var detail = u.el('div', { class: 't1-op-detail' });
    var fields = u.el('dl', { class: 't1-op-fields' });
    rec.fields.forEach(function (f) {
      fields.appendChild(u.el('div', { class: 't1-op-field' }, [
        u.el('dt', { class: 't1-op-key', text: f.key }),
        u.el('dd', { class: 't1-op-val', data: { key: f.key }, text: f.value })
      ]));
    });

    /* Per-file deltas are one more term in the same list, so they read as part of the record rather
     * than as a diff widget parked inside it. */
    if (rec.rows && rec.rows.length) {
      var rowsVal = u.el('dd', { class: 't1-op-val' });
      rec.rows.forEach(function (r) {
        rowsVal.appendChild(u.el('div', { class: 't1-op-row' }, [
          u.el('span', { class: 't1-op-row-verb', text: r.verb }),
          u.el('span', { class: 't1-annot-ev', text: r.target }),
          u.el('span', { class: 't1-op-row-delta', text: '+' + r.added + ' \u2212' + r.removed })
        ]));
      });
      fields.appendChild(u.el('div', { class: 't1-op-field' }, [
        u.el('dt', { class: 't1-op-key', text: 'FILES' }),
        rowsVal
      ]));
    }
    detail.appendChild(fields);

    if (rec.chips && rec.chips.length) detail.appendChild(this._buildOpLinks(rec.chips));
    block.appendChild(detail);

    /* ---- disclosure: `.t1-more`, the control this concept already uses to open a long turn.
     * Collapsed, an operation states its headline and its reason and nothing else. */
    var more = u.el('button', {
      class: 't1-more', type: 'button',
      text: open ? 'Hide operation' : 'Show operation',
      aria: { expanded: open ? 'true' : 'false' }
    });
    this._on(more, 'click', function () {
      var v = self.ctx.store.view(self.tid());
      var now = !v.expanded[key];
      v.expanded[key] = now;
      block.setAttribute('data-expanded', now ? '1' : '0');
      more.setAttribute('aria-expanded', now ? 'true' : 'false');
      more.textContent = now ? 'Hide operation' : 'Show operation';
    });
    block.appendChild(more);

    return block;
  };

  /* Chips as TEXT. `/sources` is a plain count because nothing in this workspace can open it, and the
   * artifact is a real button because something can: it hands the id to the artifact service, which is
   * the same call the handoff row makes. A link that looks live and does nothing is worse than none. */
  T1Thread.prototype._buildOpLinks = function (chips) {
    var self = this;
    var u = U();
    var links = u.el('div', { class: 't1-op-links' });
    chips.forEach(function (chip, i) {
      if (i) links.appendChild(u.el('span', { class: 't1-strip-sep', text: '\u00b7' }));
      if (chip.kind === 'artifact') {
        var btn = u.el('button', {
          class: 't1-strip-btn', type: 'button', text: chip.label,
          aria: { label: chip.label + ' ' + chip.artifactId }
        });
        self._on(btn, 'click', function () { self.ctx.services.artifacts.open(chip.artifactId); });
        links.appendChild(btn);
        links.appendChild(u.el('span', { class: 't1-annot-ev', text: chip.artifactId }));
        return;
      }
      links.appendChild(u.el('span', { class: 't1-op-meta', text: chip.label }));
    });
    return links;
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

  /* ---------------------------------------------------------------- question: the margin interview
   *
   * This concept has no containers: turns are hanging labels beside prose at a reading measure. So a
   * questionnaire here is NOT a card dropped into the transcript - it is A REAL SPEAKER TURN, labelled
   * `Puppet Master asks` in the same margin every other speaker label hangs in.
   *
   * Everything follows from that one decision:
   *   - the options are hanging-indent rows inside the prose measure, not a button grid;
   *   - the progress reads `1 of 3` IN THE MARGIN, under the speaker label, because that is where this
   *     concept puts metadata about a turn;
   *   - submitting CONDENSES the turn into a one-line receipt turn, the same way a long turn collapses,
   *     so the transcript keeps reading as a conversation with one more thing said in it;
   *   - cancelling condenses to `Questions cancelled` rather than removing the turn, because a
   *     conversation does not un-say things.
   */
  T1Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard. Claiming the work surfaces notifies the store, which re-enters update() and
     * therefore this function mid-render: the inner pass appends the turn and the outer pass appends a
     * second one into a host it already emptied - two identical interviews on screen. */
    if (this._inRenderQuestion) return;

    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    var prevKey = this._qkey || '';

    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }

    this._choreographInterview(host, prevKey);
  };

  /* This concept's OWN choreography, composed from primitives.
   *
   * A turn ARRIVES - it does not inflate. So the entrance is the cascade this concept already uses for
   * appended prose (opacity plus a small rise, staggered down the option rows), and an advance between
   * questions is a text swap inside a turn that stays exactly where it is. Nothing springs a height,
   * because a bounded box springing open is the vocabulary of a card, and this concept has none. */
  T1Thread.prototype._choreographInterview = function (host, prevKey) {
    var R = global.PMXReveal;
    if (!R || !host) return;

    var svc = this.ctx.services;
    var key = R.keyFor(svc, this.tid());
    this._qkey = key;

    /* Same question, one more keystroke: silence. A freeform answer re-renders per character because
     * typing writes a draft and the draft notifies the store. */
    if (prevKey === key) return;

    var turn = host.querySelector('.t1-qturn');
    if (!turn || R.reduced(turn)) return;

    var rows = Array.prototype.slice.call(turn.querySelectorAll('.t1-qrow'));

    if (!prevKey) {
      /* ENTRANCE: the turn arrives, and its option rows cascade down the measure. */
      R.oneShot(turn, 't1-qturn-arrive', 420);
      R.stagger(turn, rows);
      global.setTimeout(function () { R.clearStagger(turn, rows); }, 900);
      return;
    }

    /* ADVANCE: the same turn now says something else. Only the rows move. */
    R.stagger(turn, rows);
    global.setTimeout(function () { R.clearStagger(turn, rows); }, 700);
  };

  T1Thread.prototype._renderQuestionBody = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    U().empty(host);

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;
    if (!flow) return;

    if (!flow.record) {
      this._renderInterviewReceipt(host, flow.receipt);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    var turn = u.el('div', { class: 't1-turn t1-qturn', data: { pmxRole: 'assistant', phase: flow.status } });
    turn.classList.add('pmx-msg');
    turn.setAttribute('data-turn-start', '1');

    /* ---- the hanging margin: speaker label, then the progress beneath it */
    var margin = u.el('div', { class: 't1-speaker t1-qmargin' });
    margin.appendChild(u.el('span', { class: 't1-speaker-label', text: 'Puppet Master asks' }));
    if (flow.status !== 'preparing' && flow.total) {
      /* `1 of 3` lives HERE, in the margin - not in a card head, because there is no card. */
      margin.appendChild(u.el('span', { class: 't1-qcount', text: flow.position + ' of ' + flow.total }));
    }
    if (flow.skippedCount) {
      /* A skip stays visible after you move past it. Without this the margin would claim a clean run. */
      margin.appendChild(u.el('span', {
        class: 't1-qskipmark',
        text: flow.skippedCount === 1 ? '1 skipped' : flow.skippedCount + ' skipped'
      }));
    }
    turn.appendChild(margin);

    var body = u.el('div', { class: 't1-body pmx-msg-body' });

    if (flow.status === 'preparing') {
      body.appendChild(global.PMXReveal.capsule('Preparing questions', this.ctx));
      turn.appendChild(body);
      host.appendChild(turn);
      return;
    }
    if (flow.status === 'submitting') {
      body.appendChild(global.PMXReveal.capsule('Submitting answers', this.ctx));
      turn.appendChild(body);
      host.appendChild(turn);
      return;
    }

    var q = flow.question;

    /* ---- the prompt, as prose at the reading measure */
    if (flow.atEnd) {
      body.appendChild(u.el('p', { class: 't1-prose t1-qprompt', text: 'That is every question. Send the answers when you are ready.' }));
    } else if (q) {
      body.appendChild(u.el('p', { class: 't1-prose t1-qprompt', text: q.prompt }));
      if (q.required) body.appendChild(u.el('span', { class: 't1-qreq', text: 'An answer is required' }));
    }

    /* ---- options as HANGING-INDENT ROWS inside the measure */
    if (q && !flow.atEnd) {
      if (q.options && q.options.length) {
        var list = u.el('div', { class: 't1-qrows' });
        q.options.forEach(function (opt, n) {
          var sel = (q.selected || []).indexOf(opt) >= 0;
          var row = u.el('button', {
            class: 't1-qrow', type: 'button',
            aria: { pressed: sel ? 'true' : 'false' }
          });
          /* The hanging marker sits in the indent, so the option text starts on the prose measure and
           * wraps under itself rather than under the marker. */
          row.appendChild(u.el('span', { class: 't1-qrow-mark', text: String(n + 1) }));
          row.appendChild(u.el('span', { class: 't1-qrow-text', text: opt }));
          self._on(row, 'click', function (ev) {
            if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
            svc.qflow.act(svc, self.tid(), 'answer', opt);
            self.renderQuestion();
          });
          list.appendChild(row);
        });
        body.appendChild(list);
      } else {
        var ta = u.el('textarea', { class: 't1-qfree pmx-scroll', aria: { label: q.prompt } });
        ta.setAttribute('spellcheck', 'false');
        ta.value = q.draft || '';
        this._on(ta, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', ta.value); });
        body.appendChild(ta);
      }
    }

    /* The refusal renders at the field. `_pendingReason` carries a submit refusal across the one render
     * it takes to travel to the offending question, then is consumed. */
    var reason = u.el('p', { class: 't1-qreason', data: { show: this._pendingReason ? '1' : '0' } });
    if (this._pendingReason) { reason.textContent = this._pendingReason; this._pendingReason = null; }
    body.appendChild(reason);

    /* ---- actions, as a quiet row at the end of the prose */
    var acts = u.el('div', { class: 't1-qacts' });

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
      var back = u.el('button', { class: 't1-qact', type: 'button', text: 'Back' });
      this._on(back, 'click', function () { svc.qflow.act(svc, self.tid(), 'prev'); self.renderQuestion(); });
      acts.appendChild(back);
    }

    if (q && !flow.atEnd) {
      var skip = u.el('button', { class: 't1-qact', type: 'button', text: 'Skip' });
      this._on(skip, 'click', function () { svc.qflow.act(svc, self.tid(), 'skip'); self.renderQuestion(); });
      acts.appendChild(skip);
    }

    if (q && flow.isSkipped(q)) {
      var un = u.el('button', { class: 't1-qact', type: 'button', text: 'Unskip' });
      this._on(un, 'click', function () { svc.qflow.act(svc, self.tid(), 'unskip', flow.index); self.renderQuestion(); });
      acts.appendChild(un);
    }

    var primary = u.el('button', { class: 't1-qact t1-qact-primary', type: 'button', text: flow.atEnd ? 'Send answers' : 'Next' });
    this._on(primary, 'click', function () {
      var wasEnd = flow.atEnd;
      var res = svc.qflow.act(svc, self.tid(), wasEnd ? 'submit' : 'next');
      if (!res.ok) { refuse(res, 'Answer the required questions first.'); return; }
      if (res.resolved) {
        /* CONDENSE the turn into its receipt. `motion.condense` measures the live height, swaps the
         * content and animates to the new one, which is exactly the long-turn collapse this concept
         * already uses - so the interview leaves the transcript the same way a long answer does. */
        self._condenseInterview(turn, function () { self.renderQuestion(); self.renderSurfaces(); });
        return;
      }
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(primary);

    var cancel = u.el('button', { class: 't1-qact', type: 'button', text: 'Cancel' });
    this._on(cancel, 'click', function () {
      svc.qflow.act(svc, self.tid(), 'cancel');
      self._condenseInterview(turn, function () { self.renderQuestion(); self.renderSurfaces(); });
    });
    acts.appendChild(cancel);

    body.appendChild(acts);
    turn.appendChild(body);
    host.appendChild(turn);
  };

  /* The collapse into a one-line receipt turn. Falls straight through when motion is reduced or absent -
   * the receipt still lands, it simply lands without travel. */
  T1Thread.prototype._condenseInterview = function (turn, done) {
    var svc = this.ctx.services;
    if (!turn || !svc.motion || !svc.motion.condense) { done(); return; }
    svc.motion.condense(turn, function (hostEl) {
      /* The summary is drawn by the caller's next render; this is only the transitional content, so it
       * must not claim a fact of its own. */
      hostEl.appendChild(U().el('span', { class: 't1-qreceipt-line', text: 'Questions closed' }));
    }, { duration: 240, onDone: done });
  };

  /* The receipt turn: one line, in the margin register, durable. */
  T1Thread.prototype._renderInterviewReceipt = function (host, receipt) {
    var self = this;
    var u = U();
    if (!receipt) return;

    var turn = u.el('div', { class: 't1-turn t1-qreceipt', data: { pmxRole: 'assistant', status: receipt.status } });
    turn.classList.add('pmx-msg');

    var margin = u.el('div', { class: 't1-speaker t1-qmargin' });
    margin.appendChild(u.el('span', { class: 't1-speaker-label', text: 'Puppet Master asked' }));
    turn.appendChild(margin);

    var body = u.el('div', { class: 't1-body pmx-msg-body' });
    var text = receipt.cancelled
      ? 'Questions cancelled'
      : (receipt.answered + (receipt.answered === 1 ? ' answer sent' : ' answers sent') +
         (receipt.skipped ? ', ' + receipt.skipped + ' skipped' : ''));
    var lineEl = u.el('p', { class: 't1-prose t1-qreceipt-line', text: text });
    body.appendChild(lineEl);

    var show = u.el('button', { class: 't1-qact', type: 'button', text: 'Show answers' });
    this._on(show, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 320,
        build: function (h) {
          h.appendChild(u.el('div', { class: 't1-sheet-title', text: receipt.cancelled ? 'Cancelled questions' : 'Answers sent' }));
          (receipt.questions || []).forEach(function (question) {
            var val = receipt.answers[question.id];
            var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't1-sheet-row' }, [
              u.el('span', { class: 't1-sheet-kind', text: wasSkipped ? 'skipped' : 'answered' }),
              u.el('span', { class: 't1-sheet-label', text: question.prompt + (val == null ? '' : ' \u2014 ' + [].concat(val).join(', ')) })
            ]));
          });
        }
      });
    });
    body.appendChild(show);

    turn.appendChild(body);
    host.appendChild(turn);
  };

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
