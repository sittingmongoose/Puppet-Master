/* t2 "Two-Tone Slabs" — Opus 5
 *
 * Role contrast lives in the FIELD, never a border. A user turn is an inset slab: a tinted
 * background, rounded corners, a narrower measure, held to the right margin. An assistant
 * turn is full-bleed: untinted, edge to edge, the widest possible measure. Nothing in this
 * concept draws a bubble outline anywhere — the tint plus the inset alone tell you who is
 * speaking.
 *
 * The bet: once role is legible from field and position alone, every piece of machinery
 * (Goal, Todo, subagents, diffs, per-turn activity, thought, answered questions, artifacts)
 * can be demoted to one horizontal run of small chips sitting under the assistant slab it
 * belongs to. A chip carries only a category word and a condensed status; the full record
 * opens in a popup sheet on click. Nothing ever grows inline, so a long conversation never
 * accumulates nested cards.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }

  /* Collapse rule for this concept: eligibility at 850 characters, preview clamped to 7
   * lines. The assistant slab is full-bleed (a wide measure), so a slightly taller preview
   * still reads as bounded; the user slab is narrower and wraps sooner regardless. */
  var COLLAPSE_ELIGIBLE_CHARS = 850;
  var PREVIEW_LINES = 7;

  function T2Thread(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.rendered = {};        /* msgId -> { el, bodyEl, proseEl, chipsRowEl, surfaceChipsEl } */
    this.latestAssistantId = null;
    this.lastThreadId = null;
    this.build();
  }

  T2Thread.prototype._on = function (el, ev, fn, opts) {
    this.offs.push(U().on(el, ev, fn, opts));
  };

  T2Thread.prototype.build = function () {
    var self = this;
    var u = U();

    this.root = u.el('div', { class: 't2-root' });

    this.head = u.el('div', { class: 't2-head' }, [
      u.el('span', { class: 't2-head-name', text: 'Two-Tone Slabs' }),
      u.el('span', { class: 't2-head-model', text: this.ctx.label })
    ]);
    this.root.appendChild(this.head);

    this.scroller = u.el('div', { class: 't2-scroll pmx-scroll' });
    this.list = u.el('div', { class: 't2-list' });
    this.scroller.appendChild(this.list);
    this.root.appendChild(this.scroller);

    /* Fallback footer, used only when the window offers no work-surface host AND no
     * assistant turn has rendered yet to carry the chip run (an edge case at the very start
     * of a thread). Two of the eight windows provide neither host, so this path is real. */
    this.inlineSurfaces = u.el('div', { class: 't2-inline-surfaces' });
    this.inlineQuestion = u.el('div', { class: 't2-inline-question' });
    if (!this.ctx.capabilities.workSurfaceHost) this.root.appendChild(this.inlineSurfaces);
    if (!this.ctx.capabilities.questionHost) this.root.appendChild(this.inlineQuestion);

    this.host.appendChild(this.root);

    this.scrollCtl = this.ctx.services.scroll.attach(this.scroller, {
      messageSelector: '.t2-turn',
      messageAttr: 'data-pmx-msg'
    });

    this.jumpBtn = u.el('button', { class: 't2-jump', text: 'Jump to latest' });
    this._on(this.jumpBtn, 'click', function () {
      self.scrollCtl.scrollToBottom ? self.scrollCtl.scrollToBottom() :
        (self.scroller.scrollTop = self.scroller.scrollHeight);
    });
    /* The pill lives in its OWN lane directly after the scroller, not floating over it.
     * Floating meant the pill sat on top of whatever line happened to be at the bottom of
     * the viewport mid-scroll — measured covering prose at 17 of 24 scroll positions. The
     * lane is a permanent flex item, so the transcript viewport never changes height and
     * the overlap is impossible by construction rather than by clearance arithmetic. */
    this.jumpLane = u.el('div', { class: 't2-jump-lane' });
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

  T2Thread.prototype.tid = function () {
    return this.ctx.store.get('session.activeThreadId');
  };

  /* ---------------------------------------------------------------- rendering */

  T2Thread.prototype.renderThread = function () {
    var tid = this.tid();
    var data = this.ctx.data;
    var view = this.ctx.store.view(tid);
    var msgs = data.visibleSlice(tid, view.loadedFrom);

    U().empty(this.list);
    this.rendered = {};
    this.lastThreadId = tid;
    /* The live indicator node, if any, was just detached along with everything else in the
     * list. Drop the stale reference so syncLive() below rebuilds a properly attached one
     * instead of quietly updating an orphaned element that is no longer on screen. */
    this.liveEl = null;

    this.latestAssistantId = null;
    for (var a = msgs.length - 1; a >= 0; a--) {
      if (msgs[a].role === 'assistant') { this.latestAssistantId = msgs[a].id; break; }
    }

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
    /* Artifact state lives outside the store, so its ticks arrive here and nowhere else. */
    var selfArt = this;
    if (this.ctx.services.artifacts && this.ctx.services.artifacts.subscribe && !this._artOff) {
      this._artOff = this.ctx.services.artifacts.subscribe(function () {
        if (selfArt._handoffHost) selfArt._renderHandoff(selfArt._handoffHost);
      });
    }
  };

  T2Thread.prototype.buildOlderNotice = function (hidden) {
    var self = this;
    var u = U();
    var btn = u.el('button', {
      class: 't2-older',
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
    return u.el('div', { class: 't2-older-wrap' }, [btn]);
  };

  T2Thread.prototype.buildTurn = function (msg, prevRole) {
    var u = U();
    var svc = this.ctx.services;
    var isUser = msg.role === 'user';
    var lensState = svc.lens ? svc.lens.stateOf(this.tid(), msg.id) : null;

    var turn = u.el('div', {
      class: ['t2-turn', 'pmx-msg'],
      /* Quoted, already-hyphenated keys: PMXUtil.el()'s data:{} helper does a plain
       * setAttribute('data-' + key, ...), and setAttribute lowercases an HTML attribute
       * name WITHOUT inserting hyphens at camelCase boundaries. A key of pmxMsg would
       * therefore land as data-pmxmsg, silently breaking the data-pmx-msg lookup that
       * scroll.attach()'s messageAttr option depends on. */
      data: { 'pmx-msg': msg.id, 'pmx-role': msg.role, lens: lensState || '' }
    });

    var slab = u.el('div', { class: ['t2-slab', 'pmx-msg-body', isUser ? 't2-slab-user' : 't2-slab-assistant'] });
    slab.appendChild(u.el('span', { class: 't2-role-label', text: isUser ? 'You' : 'Assistant' }));

    var eligible = (msg.body || '').length >= COLLAPSE_ELIGIBLE_CHARS;
    var expanded = !!this.ctx.store.view(this.tid()).expanded[msg.id];

    var prose = u.el('div', { class: 't2-prose' });
    this.writeProse(prose, msg.body || '');
    slab.appendChild(prose);

    if (eligible) {
      slab.setAttribute('data-collapsible', '1');
      slab.setAttribute('data-expanded', expanded ? '1' : '0');
      var toggle = u.el('button', { class: 't2-more', text: expanded ? 'Show less' : 'Show more' });
      var self = this;
      this._on(toggle, 'click', function () { self.setExpanded(msg.id, !self.isExpanded(msg.id)); });
      slab.appendChild(toggle);
    }

    turn.appendChild(slab);

    /* Hover row is a SIBLING of the slab, never nested inside it. */
    var hoverRow = global.PMXHoverRow.build(msg, this.ctx, {
      isActive: svc.runtime.isActive(this.tid()) && msg === this.lastMessage(),
      onEdit: function () { svc.toast.show('Editing replaces this message and supersedes the turn'); }
    });
    turn.appendChild(hoverRow);

    var chipInfo = this.buildChipsRow(msg);
    var chipsRowEl = null, surfaceChipsEl = null;
    if (chipInfo) {
      turn.appendChild(chipInfo.row);
      chipsRowEl = chipInfo.row;
      surfaceChipsEl = chipInfo.surfacesEl;
    }

    this.rendered[msg.id] = {
      el: turn, bodyEl: slab, proseEl: prose,
      chipsRowEl: chipsRowEl, surfaceChipsEl: surfaceChipsEl
    };
    return turn;
  };

  T2Thread.prototype.writeProse = function (host, text) {
    var u = U();
    var paras = String(text).split(/\n{2,}/);
    for (var i = 0; i < paras.length; i++) {
      var p = paras[i].replace(/\n/g, ' ').trim();
      if (!p) continue;
      host.appendChild(u.el('p', { class: 't2-p', text: p }));
    }
    if (!host.childNodes.length) host.appendChild(u.el('p', { class: 't2-p', text: text }));
  };

  T2Thread.prototype.lastMessage = function () {
    var msgs = this.ctx.data.messagesFor(this.tid());
    return msgs[msgs.length - 1];
  };

  /* ---------------------------------------------------------------- chips */

  /* A chip is a small pill: category word + condensed status in the visible text (icons stay
   * decorative per contract 8.1), opening a popup sheet with the full record on click. */
  T2Thread.prototype._chip = function (kind, iconName, label, buildDetail, popupWidth) {
    var self = this;
    var u = U();
    var b = u.el('button', { class: 't2-chip', data: { chip: kind } });
    b.appendChild(this.ctx.services.icons.get(iconName, 13));
    b.appendChild(u.el('span', { class: 't2-chip-label', text: label }));
    this._on(b, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget,
        kind: 'panel',
        width: popupWidth || 300,
        build: function (host, api) { buildDetail(host, api); }
      });
    });
    return b;
  };

  /* Builds the chip run for one turn's OWN machinery (activity/thought/answered question).
   * For the latest assistant turn, when no work-surface host exists, also reserves a nested
   * container for the thread-level surfaces (Goal/Todo/Agents/Diff/Artifacts) so they render
   * literally beneath the assistant slab, per this concept's brief. */
  T2Thread.prototype.buildChipsRow = function (msg) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var isAssistant = msg.role === 'assistant';
    var isLatestAssistant = isAssistant && msg.id === this.latestAssistantId;
    var chips = [];

    if (isAssistant) {
      var group = svc.surfaces && svc.surfaces.activityGroupFor ? svc.surfaces.activityGroupFor(msg) : null;
      if (group) {
        var actLabel = 'Activity · ' + (svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : 'steps');
        chips.push(this._chip('activity', 'terminal', actLabel, function (host) {
          self.buildActivityDetail(host, group);
        }, 320));
      }
      if (msg.thoughtSegments && msg.thoughtSegments.length) {
        var n = msg.thoughtSegments.length;
        chips.push(this._chip('thought', 'layers', 'Thought · ' + n + (n === 1 ? ' segment' : ' segments'), function (host) {
          self.buildThoughtDetail(host, msg.thoughtSegments);
        }, 320));
      }
      if (msg.completedQuestionnaire) {
        chips.push(this._chip('question', 'info', 'Question · Answered', function (host) {
          self.buildAnsweredDetail(host, msg.completedQuestionnaire);
        }, 320));
      }
    }

    var surfacesEl = null;
    if (isLatestAssistant && !this.ctx.capabilities.workSurfaceHost) {
      surfacesEl = u.el('div', { class: 't2-chips-surfaces' });
    }

    if (!chips.length && !surfacesEl) return null;

    var row = u.el('div', { class: 't2-chips' });
    chips.forEach(function (c) { row.appendChild(c); });
    if (surfacesEl) row.appendChild(surfacesEl);
    return { row: row, surfacesEl: surfacesEl };
  };

  T2Thread.prototype.buildActivityDetail = function (host, group) {
    var u = U();
    var svc = this.ctx.services;
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'What this turn did' }));
    var stages = svc.surfaces && svc.surfaces.activityStages ? svc.surfaces.activityStages(group) : (group.stages || []);
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    stages.forEach(function (st) {
      list.appendChild(u.el('div', { class: 't2-sheet-row' }, [
        u.el('span', { class: 't2-sheet-kind', text: F().label(st.kind) }),
        u.el('span', { class: 't2-sheet-label', text: st.label || '' }),
        u.el('span', { class: 't2-sheet-dur', text: st.durationSeconds != null ? F().duration(st.durationSeconds) : '' })
      ]));
    });
    host.appendChild(list);
    if (group.workedSeconds != null) {
      host.appendChild(u.el('div', { class: 't2-sheet-foot', text: 'Worked for ' + F().duration(group.workedSeconds) }));
    }
  };

  T2Thread.prototype.buildThoughtDetail = function (host, segments) {
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Reasoning summary' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    segments.forEach(function (seg) {
      list.appendChild(u.el('div', { class: 't2-sheet-row' }, [
        u.el('span', { class: 't2-sheet-kind', text: F().label(seg.status) }),
        u.el('span', { class: 't2-sheet-label', text: seg.summary || seg.label || '' })
      ]));
    });
    host.appendChild(list);
    host.appendChild(u.el('div', { class: 't2-sheet-foot', text: 'Provider-exposed summary only.' }));
  };

  T2Thread.prototype.buildAnsweredDetail = function (host, q) {
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Answered question' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    (q.questionsAndAnswers || []).forEach(function (qa) {
      list.appendChild(u.el('div', { class: 't2-qa' }, [
        u.el('div', { class: 't2-qa-q', text: qa.question }),
        u.el('div', { class: 't2-qa-a', text: qa.answer })
      ]));
    });
    host.appendChild(list);
  };

  /* ---------------------------------------------------------------- thread-level surfaces */

  /* ---------------------------------------------------------------- work: the chip run
   *
   * The matrix assigns this concept a CHIP RUN WITH COUNT MORPH: one chip per domain, counts updating
   * INSIDE the chip, the whole run collapsing to a single `13 tools used` chip when the work completes,
   * and that chip reopening the run. Each chip opens its own popup sheet, which is already this
   * concept's established idiom.
   *
   * The load-bearing detail is element IDENTITY. A count that "updates inside the chip" cannot be a
   * rebuilt chip that happens to carry a new string: rebuilding restarts the entrance, drops focus, and
   * closes any sheet anchored to the old node. So this function DIFFS the run - chips are keyed by
   * domain, survivors are updated in place through `motion.swapText`, vanished domains are removed, new
   * ones are appended. That is the whole reason it keeps `_chipEls` rather than emptying its container.
   */
  T2Thread.prototype.renderSurfaces = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;

    var container = this._surfaceContainer();
    if (!container) return;

    /* Ask the flow, not `surfacesYielded`: that flag is written by renderQuestion, which runs after
     * this on every pass, so reading it here paints the run for one frame before the question takes
     * the space. */
    var pendingQuestion = svc.qflow ? svc.qflow.pending(svc, this.tid()) : false;

    var active = (!pendingQuestion && svc.surfaces) ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());
    var v = this.ctx.store.view(this.tid());

    function each(val) { return val == null ? [] : (Object.prototype.toString.call(val) === '[object Array]' ? val : [val]); }
    function glyph(name) { return (svc.icons && svc.icons.has && svc.icons.has(name)) ? name : 'dot'; }

    /* ---- the domain list */
    var specs = [];

    if (active && active.goal) {
      var phase = svc.goals && svc.goals.phaseOf ? svc.goals.phaseOf(active.goal) : null;
      specs.push({
        kind: 'goal', icon: glyph('gauge'),
        /* Phase index first: it is the one fact a compact surface must not lose. */
        label: phase ? ('Phase ' + phase.index + ' of ' + phase.total) : ('Goal \u00b7 ' + F().label(active.goal.status)),
        width: 340,
        build: function (host, api) { self.buildGoalDetail(host, active.goal, api); }
      });
    }

    if (active && active.todo) {
      var items = active.todo.items || [];
      var done = items.filter(function (i) { return i.state === 'complete' || i.state === 'done'; }).length;
      var blocked = items.filter(function (i) { return i.state === 'blocked'; }).length;
      specs.push({
        kind: 'todo', icon: glyph('check'),
        label: done + '/' + items.length + ' Todos' + (blocked ? ' \u00b7 ' + blocked + ' blocked' : ''),
        width: 300,
        build: function (host) { self.buildTodoDetail(host, active.todo); }
      });
    }

    each(active && active.subagents).forEach(function (g, n) {
      specs.push({
        kind: 'agents' + (n || ''), icon: glyph('crew'),
        label: (svc.surfaces.subagentSummary && svc.surfaces.subagentSummary(g)) || 'No agents active',
        width: 340,
        build: function (host) { self.buildAgentsDetail(host, g); }
      });
    });

    /* Activity carries the six kinds the packet wants visible: read, search, web, browser, test,
     * verify. One chip, six counts, morphed in place. */
    var stages = (thread && thread.activityStages) || [];
    if (stages.length) {
      specs.push({
        kind: 'activity', icon: glyph('beaker'),
        label: stages.length + (stages.length === 1 ? ' step' : ' steps'),
        width: 360,
        build: function (host) { self.buildStagesDetail(host, stages); }
      });
    }

    each(active && active.diffs).forEach(function (g, n) {
      var fs = g.files || [];
      var add = 0, rem = 0;
      fs.forEach(function (f) { add += f.added || 0; rem += f.removed || 0; });
      specs.push({
        kind: 'diff' + (n || ''), icon: glyph('diff'),
        label: fs.length + (fs.length === 1 ? ' file' : ' files') + ' \u00b7 +' + add + ' \u2212' + rem,
        width: 360,
        build: function (host) { self.buildDiffDetail(host, g); }
      });
    });

    if (thread && thread.artifacts && thread.artifacts.length) {
      specs.push({
        kind: 'artifacts', icon: glyph('artifact'),
        label: thread.artifacts.length + (thread.artifacts.length === 1 ? ' artifact' : ' artifacts'),
        width: 320,
        build: function (host) { self.buildArtifactsDetail(host, thread.artifacts); }
      });
    }

    /* ---- the BSD chip. It joins the run rather than sitting apart, because in this concept a chip IS
     * how a domain announces itself, and advice is a domain. Its sheet is read-only. */
    var bsd = svc.bsd;
    var advice = (bsd && bsd.advice) ? (bsd.advice(this.tid()) || []) : [];
    if (advice.length) {
      var cautions = advice.filter(function (a) { return a.severity === 'caution'; }).length;
      specs.push({
        kind: 'bsd', icon: glyph('bsd'),
        /* The chip states the severity in words: a chip has no room for a legend, so the distinction
         * must not rest on colour. */
        label: cautions
          ? (cautions + (cautions === 1 ? ' caution' : ' cautions'))
          : (advice.length + (advice.length === 1 ? ' note' : ' notes')),
        width: 340,
        severity: cautions ? 'caution' : 'note',
        build: function (host) { self.buildAdviceDetail(host, advice); }
      });
    }

    /* ---- the completed form: ONE chip for the whole run.
     * `13 tools used` comes from the activity group's own condense label - it is the count the corpus
     * recorded, not one this renderer invented. */
    /* activeFor().activity is the LATEST activity group in the thread, found by walking back through
     * the messages. Reading activityGroupFor(lastMessage()) instead - which is what this did first -
     * asks the wrong question: the newest turn frequently carries no activity group at all, so the run
     * never saw a completed group and the collapsed form was unreachable. */
    var group = active ? active.activity : null;
    var complete = !!(group && group.status === 'complete');
    var runOpen = !!(v.surfaces && v.surfaces.expanded === 'run');

    if (!pendingQuestion && complete && !runOpen && specs.length) {
      var collapsed = svc.surfaces.condenseLabel ? svc.surfaces.condenseLabel(group) : ((group.stages || []).length + ' steps');
      specs = [{
        kind: 'collapsed', icon: glyph('beaker'), label: collapsed, width: 360,
        /* Clicking it REOPENS the run rather than opening a sheet - it is a state control, not a
         * domain. That is why it carries `reopen` instead of `build`. */
        reopen: true
      }];
    }

    /* A pending question yields the WHOLE run. The bsd and artifacts chips are read from the thread and
     * the advice service rather than through `activeFor`, so without this they survived the yield and left
     * a two-chip stub beside the question - a partial cluster, which is worse than none. Advice hides with
     * the run in this concept because it IS a chip in it; there is no separate host for it to outlive. */
    this._diffChipRun(container, pendingQuestion ? [] : specs, !pendingQuestion && runOpen && complete);

    /* Advice and the handoff live in their own hosts so an artifact tick repaints the card without
     * rebuilding the chip run underneath it. */
    if (!this._handoffHost || this._handoffHost.parentNode !== container.parentNode) {
      this._handoffHost = u.el('div', { class: 't2-handoff-host' });
      if (container.parentNode) container.parentNode.appendChild(this._handoffHost);
    }
    this._renderHandoff(this._handoffHost);
  };

  T2Thread.prototype._surfaceContainer = function () {
    var u = U();
    if (this.ctx.capabilities.workSurfaceHost) {
      var host = this.ctx.regions.workSurfaceHost;
      if (!host) return null;
      /* One persistent run element. Emptying the host on every pass is what made a chip's identity - and
       * therefore its morph - impossible. */
      if (!this._chipRun || this._chipRun.parentNode !== host) {
        U().empty(host);
        this._chipRun = u.el('div', { class: ['t2-chips', 't2-chips-host'] });
        this._chipEls = {};
        host.appendChild(this._chipRun);
      }
      return this._chipRun;
    }

    var rec = this.latestAssistantId ? this.rendered[this.latestAssistantId] : null;
    var parent = (rec && rec.surfaceChipsEl) ? rec.surfaceChipsEl : this.inlineSurfaces;
    if (!parent) return null;
    if (!this._chipRun || this._chipRun.parentNode !== parent) {
      U().empty(parent);
      this._chipRun = u.el('div', { class: 't2-chips' });
      this._chipEls = {};
      parent.appendChild(this._chipRun);
    }
    return this._chipRun;
  };

  /* The diff. Survivors keep their element - and therefore their popup anchor, their focus and their
   * entrance - while only their text changes. */
  T2Thread.prototype._diffChipRun = function (container, specs, showCollapseControl) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    this._chipEls = this._chipEls || {};

    var wanted = {};
    specs.forEach(function (s) { wanted[s.kind] = true; });

    /* remove chips whose domain is gone */
    for (var kind in this._chipEls) {
      if (!Object.prototype.hasOwnProperty.call(this._chipEls, kind)) continue;
      if (wanted[kind]) continue;
      var gone = this._chipEls[kind];
      if (gone && gone.btn && gone.btn.parentNode) gone.btn.parentNode.removeChild(gone.btn);
      delete this._chipEls[kind];
    }

    specs.forEach(function (spec) {
      var rec = self._chipEls[spec.kind];

      if (!rec) {
        var btn = u.el('button', {
          class: 't2-chip', type: 'button',
          data: { chip: spec.kind, severity: spec.severity || '' }
        });
        if (svc.icons) btn.appendChild(svc.icons.get(spec.icon, 13));
        var label = u.el('span', { class: 't2-chip-label', text: spec.label });
        btn.appendChild(label);
        rec = self._chipEls[spec.kind] = { btn: btn, label: label, text: spec.label, spec: spec };

        self._on(btn, 'click', function (ev) {
          var cur = self._chipEls[spec.kind];
          var live = cur ? cur.spec : spec;
          if (live.reopen) {
            /* Reopen the run. Stored, so it survives a remount and a theme change. */
            var vv = self.ctx.store.view(self.tid());
            vv.surfaces = vv.surfaces || { expanded: null, openIds: {}, phaseIndex: null };
            vv.surfaces.expanded = 'run';
            self.ctx.store.touchView('surfaces');
            return;
          }
          svc.popup.open({
            anchorEl: ev.currentTarget, kind: 'panel', width: live.width || 300,
            build: function (host, api) { live.build(host, api); }
          });
        });

        container.appendChild(btn);
        return;
      }

      /* survivor: keep the element, morph the text */
      rec.spec = spec;
      rec.btn.setAttribute('data-severity', spec.severity || '');
      if (rec.text !== spec.label) {
        if (svc.motion && svc.motion.swapText) svc.motion.swapText(rec.label, spec.label);
        else rec.label.textContent = spec.label;
        rec.text = spec.label;
      }
      /* keep DOM order stable with the spec order */
      container.appendChild(rec.btn);
    });

    /* When the run has been reopened after completing, offer the way back. Without this the collapse is
     * a one-way door and the compact form becomes unreachable. */
    var back = this._chipEls.__back;
    if (showCollapseControl) {
      if (!back) {
        var b = u.el('button', { class: 't2-chip t2-chip-quiet', type: 'button', data: { chip: 'collapse' } }, [
          u.el('span', { class: 't2-chip-label', text: 'Collapse' })
        ]);
        this._on(b, 'click', function () {
          var vv = self.ctx.store.view(self.tid());
          if (vv.surfaces) vv.surfaces.expanded = null;
          self.ctx.store.touchView('surfaces');
        });
        this._chipEls.__back = { btn: b, label: null, text: 'Collapse', spec: {} };
        container.appendChild(b);
      } else {
        container.appendChild(back.btn);
      }
    } else if (back) {
      if (back.btn.parentNode) back.btn.parentNode.removeChild(back.btn);
      delete this._chipEls.__back;
    }
  };

  T2Thread.prototype.buildStagesDetail = function (host, stages) {
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Activity' }));
    stages.forEach(function (st) {
      var row = u.el('div', { class: 't2-sheet-row' }, [
        u.el('span', { class: 't2-sheet-kind', text: F().label(st.kind) }),
        u.el('span', { class: 't2-sheet-label', text: st.label + (st.detail ? ' \u2014 ' + st.detail : '') })
      ]);
      if (st.durationMs != null) row.appendChild(u.el('span', { class: 't2-sheet-kind', text: F().duration(Math.round(st.durationMs / 1000)) }));
      host.appendChild(row);
    });
  };

  /* The advice sheet. Read-only: Dismiss is the only verb, because there is no API to apply advice and
   * there must not be one - an advisor that can write is not an advisor. */
  T2Thread.prototype.buildAdviceDetail = function (host, advice) {
    var self = this;
    var u = U();
    var bsd = this.ctx.services.bsd;
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Back Seat Driver' }));
    advice.forEach(function (adv) {
      var row = u.el('div', { class: 't2-advice', data: { severity: adv.severity } });
      row.appendChild(u.el('span', { class: 't2-advice-kind', text: adv.severity === 'caution' ? 'Caution' : 'Note' }));
      row.appendChild(u.el('p', { class: 't2-advice-text', text: adv.text }));
      if (adv.evidenceRefs && adv.evidenceRefs.length) {
        row.appendChild(u.el('span', { class: 't2-advice-ev', text: adv.evidenceRefs.join(', ') }));
      }
      var dis = u.el('button', { class: 't2-advice-dismiss', type: 'button', text: 'Dismiss' });
      self._on(dis, 'click', function () {
        bsd.dismiss(self.tid(), adv.id);
        self.ctx.services.popup.closeAll(null);
      });
      row.appendChild(dis);
      host.appendChild(row);
    });
  };

  /* ---------------------------------------------------------------- artifact handoff */

  T2Thread.prototype._renderHandoff = function (host) {
    var self = this;
    var u = U();
    if (!host) return;
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

    /* A slab, because that is this concept's material - but a COMPACT one: one row, no nesting, sitting
     * directly under the run that produced it. */
    var card = u.el('div', { class: 't2-handoff', data: { state: state } });
    card.appendChild(u.el('span', { class: 't2-handoff-kind', text: 'Artifact' }));
    card.appendChild(u.el('span', { class: 't2-handoff-title', text: ref.title }));

    var stateEl = u.el('span', { class: 't2-handoff-state' });
    var label = (state === 'loading' || state === 'idle') ? 'compiling' : (state === 'error' ? 'could not be read' : 'ready');
    if (svc.motion && svc.motion.swapText) svc.motion.swapText(stateEl, label);
    else stateEl.textContent = label;
    card.appendChild(stateEl);

    var worked = this._handoffWorkedSeconds();
    if (worked != null) card.appendChild(u.el('span', { class: 't2-handoff-worked', text: 'Worked for ' + F().duration(worked) }));

    var open = u.el('button', { class: 't2-handoff-open', type: 'button', text: 'Open' });
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

  T2Thread.prototype._handoffWorkedSeconds = function () {
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

    T2Thread.prototype.buildGoalDetail = function (host, goal, api) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    U().empty(host);

    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Goal' }));
    var body = u.el('div', { class: 't2-goal' });
    body.appendChild(u.el('div', { class: 't2-goal-head' }, [
      u.el('span', { class: 't2-goal-obj', text: goal.title || goal.objective }),
      u.el('span', { class: 't2-status', text: F().label(goal.status) })
    ]));

    var acts = u.el('div', { class: 't2-goal-acts' });
    ['pause', 'resume', 'stop', 'clear', 'edit'].forEach(function (action) {
      if (svc.surfaces.canAct && !svc.surfaces.canAct(goal, action)) return;
      var b = u.el('button', { class: 't2-act', text: action.charAt(0).toUpperCase() + action.slice(1) });
      self._on(b, 'click', function () {
        svc.surfaces.act(self.tid(), action);
        var fresh = svc.surfaces.goalFor(self.tid());
        if (fresh) { self.buildGoalDetail(host, fresh, api); if (api && api.resize) api.resize(); }
        else if (api) { api.close(); }
      });
      acts.appendChild(b);
    });
    body.appendChild(acts);

    if (goal.status === 'blocked' && goal.blocker) {
      var b2 = goal.blocker;
      var det = u.el('div', { class: 't2-blocker' });
      [['Cause', b2.cause], ['Affected', b2.affectedScope], ['Tried', b2.lastAttemptedRecovery],
       ['Stopped because', b2.whyRecoveryStopped], ['Next safe action', b2.nextSafeAction]].forEach(function (row) {
        if (!row[1]) return;
        det.appendChild(u.el('div', { class: 't2-blocker-row' }, [
          u.el('span', { class: 't2-blocker-k', text: row[0] }),
          u.el('span', { class: 't2-blocker-v', text: row[1] })
        ]));
      });
      body.appendChild(det);
    }

    if (goal.replan) {
      body.appendChild(u.el('div', { class: 't2-replan' }, [
        u.el('span', { class: 't2-replan-k', text: 'Replanning' }),
        u.el('span', { class: 't2-replan-v', text: goal.replan.impact || goal.replan.reason })
      ]));
    }
    host.appendChild(body);
  };

  T2Thread.prototype.buildTodoDetail = function (host, todo) {
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Todo' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    (todo.items || []).forEach(function (it) {
      list.appendChild(u.el('div', { class: 't2-todo-row', data: { state: it.state } }, [
        u.el('span', { class: 't2-todo-state', text: F().label(it.state) }),
        u.el('span', { class: 't2-todo-label', text: it.label })
      ]));
    });
    host.appendChild(list);
  };

  T2Thread.prototype.buildAgentsDetail = function (host, group) {
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Agents' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    (group.agents || []).forEach(function (a) {
      list.appendChild(u.el('div', { class: 't2-agent' }, [
        u.el('div', { class: 't2-agent-head' }, [
          u.el('span', { class: 't2-agent-name', text: a.name }),
          u.el('span', { class: 't2-status', text: F().label(a.status) })
        ]),
        u.el('div', { class: 't2-agent-task', text: a.task }),
        /* Children never ask the user directly. A blocked child shows this line; the
         * parent is what raises any question with the human. */
        u.el('div', { class: 't2-agent-act', text: a.currentActivity || (a.status === 'waiting_for_parent' ? 'Waiting for parent' : '') }),
        u.el('div', { class: 't2-agent-dur', text: a.workedSeconds != null ? F().duration(a.workedSeconds) : '' })
      ]));
    });
    host.appendChild(list);
  };

  T2Thread.prototype.buildDiffDetail = function (host, group) {
    var self = this;
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Changes' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    (group.files || []).forEach(function (f) {
      var row = u.el('button', { class: 't2-file', data: { status: f.status } }, [
        u.el('span', { class: 't2-file-path', text: f.path }),
        u.el('span', { class: 't2-file-status', text: F().label(f.status) }),
        u.el('span', { class: 't2-file-n', text: '+' + f.added + ' -' + f.removed })
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
      list.appendChild(u.el('div', { class: 't2-file-more', text: group.hiddenFileCount + ' more files' }));
    }
    host.appendChild(list);
  };

  T2Thread.prototype.buildArtifactsDetail = function (host, artifacts) {
    var self = this;
    var u = U();
    host.appendChild(u.el('div', { class: 't2-sheet-title', text: 'Artifacts' }));
    var list = u.el('div', { class: 't2-sheet-list pmx-scroll' });
    artifacts.forEach(function (a) {
      var row = u.el('div', { class: 't2-artifact' }, [
        u.el('div', { class: 't2-artifact-title', text: a.title }),
        u.el('div', { class: 't2-artifact-meta', text: F().label(a.kind || 'file') + (a.projectPath ? ' · ' + a.projectPath : '') })
      ]);
      /* Opening does not remove the shortcut and needs no active/open state here — the
       * editor tab owns that state, per contract. */
      var openBtn = u.el('button', { class: 't2-act', text: 'Open' });
      self._on(openBtn, 'click', function () { self.ctx.services.editorHost.openArtifact(a, self.ctx); });
      row.appendChild(openBtn);
      list.appendChild(row);
    });
    host.appendChild(list);
  };

  /* ---------------------------------------------------------------- questionnaire */

  /* ---------------------------------------------------------------- question: the composer capsule
   *
   * This is the most demanding row in the matrix and the reason it is worth stating precisely:
   *
   *   a slim `Preparing questions` capsule appears above the composer,
   *   EXPANDS into one card,
   *   then COMPRESSES to `Submitting answers`.
   *
   * It must be ONE surface throughout. The capsule may not disappear and reappear as a different
   * element wearing a different class - that would be three surfaces taking turns, which reads as three
   * things happening rather than one thing changing shape. So:
   *
   *   - `_capsuleEl` is created once per flow and REUSED across every phase and every question;
   *   - the phases are attributes on that element (`data-phase`), never separate nodes;
   *   - only its CONTENTS are rebuilt, and each rebuild interpolates from the height it had before
   *     through `PMXReveal.springHeight`, so the bounds animate instead of jumping;
   *   - `data-pmx-qid` on the element is the identity proof: it is the same node in the same position
   *     before and after the expansion, which is exactly what the probe asserts.
   *
   * The composer is owned by the WINDOW, not by this concept, so "above the composer" means the last
   * thing in the question host - the region every window places immediately above its composer.
   */
  T2Thread.prototype.renderQuestion = function () {
    /* Re-entrancy guard. Claiming the work surfaces notifies the store, which re-enters update() and
     * therefore this function mid-render; the inner pass builds the capsule and the outer pass builds a
     * second one into a host it already emptied. */
    if (this._inRenderQuestion) return;

    this._inRenderQuestion = true;
    try { this._renderQuestionBody(); } finally { this._inRenderQuestion = false; }
  };

  T2Thread.prototype._renderQuestionBody = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;

    var flow = svc.qflow ? svc.qflow.read(svc, this.tid()) : null;

    if (!flow || !flow.record) {
      /* The flow is over. Compress the capsule one last time, then let it go - and only then draw the
       * receipt, so the two never overlap. */
      var dying = this._capsuleEl;
      this._capsuleEl = null;
      this._capsuleQid = null;
      if (dying && dying.parentNode) {
        this._compressAndRemove(dying, function () {
          U().empty(host);
          self._renderQuestionReceipt(host, flow ? flow.receipt : null);
        });
        return;
      }
      U().empty(host);
      this._renderQuestionReceipt(host, flow ? flow.receipt : null);
      return;
    }

    svc.qflow.claim(svc, this.tid());

    /* ---- the ONE element.
     * Created for this questionnaire and kept for its whole life. A new questionnaire id gets a new
     * capsule, which is correct: that genuinely is a different thing being asked. */
    var fresh = false;
    if (!this._capsuleEl || !this._capsuleEl.parentNode || this._capsuleQid !== flow.id) {
      U().empty(host);
      this._capsuleEl = u.el('div', { class: 't2-capsule', data: { pmxQid: flow.id, phase: flow.status } });
      this._capsuleQid = flow.id;
      host.appendChild(this._capsuleEl);
      fresh = true;
    }

    var el = this._capsuleEl;
    /* Measure BEFORE the rebuild: this is the height the bounds interpolate FROM. */
    var from = global.PMXReveal ? global.PMXReveal.measure(el) : null;

    el.setAttribute('data-phase', flow.status);
    /* `expanded` drives the material change (slim strip versus card) in CSS. One attribute, two
     * appearances, one element. */
    el.setAttribute('data-expanded', (flow.status === 'active') ? '1' : '0');
    U().empty(el);

    if (flow.status === 'preparing') {
      el.appendChild(u.el('span', { class: 't2-capsule-spinner pmx-spin' }));
      el.appendChild(u.el('span', { class: 't2-capsule-text', text: 'Preparing questions' }));
    } else if (flow.status === 'submitting') {
      el.appendChild(u.el('span', { class: 't2-capsule-spinner pmx-spin' }));
      el.appendChild(u.el('span', { class: 't2-capsule-text', text: 'Submitting answers' }));
    } else {
      this._buildCapsuleCard(el, flow);
    }

    /* Interpolate the bounds. On the very first paint there is nothing to spring from, so the capsule
     * simply arrives. */
    if (!fresh && from != null && global.PMXReveal) global.PMXReveal.springHeight(el, from);
  };

  /* The expanded card - still inside the capsule element. */
  T2Thread.prototype._buildCapsuleCard = function (el, flow) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var q = flow.question;

    var body = u.el('div', { class: 't2-capsule-body' });

    /* head: the prompt, and Cancel as the card's CLOSE control - the matrix is explicit that cancel is
     * the close affordance here, not a third button in a row. */
    var head = u.el('div', { class: 't2-capsule-head' });
    head.appendChild(u.el('p', {
      class: 't2-capsule-prompt',
      text: flow.atEnd ? 'Every question has been answered.' : (q ? q.prompt : '')
    }));
    var close = u.el('button', { class: 't2-capsule-close', type: 'button', text: '\u00d7', aria: { label: 'Cancel these questions' } });
    this._on(close, 'click', function () {
      /* Compress back to the capsule FIRST, then resolve - so the reviewer sees the card become the
       * capsule again rather than a card vanishing. */
      self._compressToCapsule(el, function () {
        svc.qflow.act(svc, self.tid(), 'cancel');
        self.renderQuestion();
        self.renderSurfaces();
      }, 'Cancelling questions');
    });
    head.appendChild(close);
    body.appendChild(head);

    if (q && q.required && !flow.atEnd) body.appendChild(u.el('span', { class: 't2-capsule-req', text: 'Required' }));

    /* options */
    if (q && !flow.atEnd) {
      if (q.options && q.options.length) {
        var opts = u.el('div', { class: 't2-capsule-opts' });
        q.options.forEach(function (opt) {
          var sel = (q.selected || []).indexOf(opt) >= 0;
          var b = u.el('button', { class: 't2-capsule-opt', type: 'button', text: opt, aria: { pressed: sel ? 'true' : 'false' } });
          self._on(b, 'click', function (ev) {
            if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
            svc.qflow.act(svc, self.tid(), 'answer', opt);
            self.renderQuestion();
          });
          opts.appendChild(b);
        });
        body.appendChild(opts);
      } else {
        var ta = u.el('textarea', { class: 't2-capsule-free pmx-scroll', aria: { label: q.prompt } });
        ta.setAttribute('spellcheck', 'false');
        ta.value = q.draft || '';
        this._on(ta, 'input', function () { svc.qflow.act(svc, self.tid(), 'answer', ta.value); });
        body.appendChild(ta);
      }
    }

    /* the refusal, at the field */
    var reason = u.el('p', { class: 't2-capsule-reason', data: { show: this._pendingReason ? '1' : '0' } });
    if (this._pendingReason) { reason.textContent = this._pendingReason; this._pendingReason = null; }
    body.appendChild(reason);

    /* foot: progress BOTTOM-LEFT, the skip/submit control BOTTOM-RIGHT. Both positions are specified. */
    var foot = u.el('div', { class: 't2-capsule-foot' });

    var left = u.el('div', { class: 't2-capsule-foot-left' });
    left.appendChild(u.el('span', {
      class: 't2-capsule-count',
      text: 'Question ' + flow.position + ' of ' + flow.total
    }));
    if (flow.skippedCount) {
      left.appendChild(u.el('span', {
        class: 't2-capsule-skipped',
        text: flow.skippedCount === 1 ? '1 skipped' : flow.skippedCount + ' skipped'
      }));
    }
    /* Back and Unskip are quiet, bottom-left, beside the counter: they are navigation, not the primary
     * decision, and before this build neither was reachable from any concept. */
    if (flow.index > 0) {
      var back = u.el('button', { class: 't2-capsule-quiet', type: 'button', text: 'Back' });
      this._on(back, 'click', function () { svc.qflow.act(svc, self.tid(), 'prev'); self.renderQuestion(); });
      left.appendChild(back);
    }
    if (q && flow.isSkipped(q)) {
      var un = u.el('button', { class: 't2-capsule-quiet', type: 'button', text: 'Unskip' });
      this._on(un, 'click', function () { svc.qflow.act(svc, self.tid(), 'unskip', flow.index); self.renderQuestion(); });
      left.appendChild(un);
    }
    foot.appendChild(left);

    /* ONE bottom-right control that CHANGES ITS WORD: `Skip` until the last answer lands, then `Submit`.
     * Two separate buttons would mean the reviewer has to notice which one appeared; one button that
     * relabels is the behaviour the matrix asks for. */
    var primaryLabel = flow.atEnd ? 'Submit' : 'Skip';
    var primary = u.el('button', {
      class: 't2-capsule-primary', type: 'button',
      text: primaryLabel,
      data: { verb: flow.atEnd ? 'submit' : 'skip' }
    });
    this._on(primary, 'click', function () {
      if (flow.atEnd) {
        var res = svc.qflow.act(svc, self.tid(), 'submit');
        if (!res.ok) {
          /* The refusal belongs at the offending question, so carry it across the travel. */
          if (res.offenderIndex != null && res.offenderIndex !== flow.index) self._pendingReason = res.reason;
          else { reason.textContent = res.reason || 'Answer the required questions first.'; reason.setAttribute('data-show', '1'); if (global.PMXReveal) global.PMXReveal.reject(reason); }
          self.renderQuestion();
          return;
        }
        self.renderQuestion();
        self.renderSurfaces();
        return;
      }
      svc.qflow.act(svc, self.tid(), 'skip');
      self.renderQuestion();
    });
    foot.appendChild(primary);

    /* Next is the ordinary advance and stays distinct from Skip: skipping and answering are different
     * instructions and must not share a control. */
    if (!flow.atEnd) {
      var next = u.el('button', { class: 't2-capsule-next', type: 'button', text: 'Next' });
      this._on(next, 'click', function () {
        var res = svc.qflow.act(svc, self.tid(), 'next');
        if (!res.ok) {
          reason.textContent = res.reason || 'Answer this question first.';
          reason.setAttribute('data-show', '1');
          if (global.PMXReveal) global.PMXReveal.reject(reason);
          return;
        }
        self.renderQuestion();
      });
      foot.appendChild(next);
    }

    body.appendChild(foot);
    el.appendChild(body);
  };

  /* Compress the card back into the slim capsule, keeping the SAME element. */
  T2Thread.prototype._compressToCapsule = function (el, done, label) {
    var u = U();
    var R = global.PMXReveal;
    if (!el) { done(); return; }
    var from = R ? R.measure(el) : null;
    el.setAttribute('data-expanded', '0');
    el.setAttribute('data-phase', 'submitting');
    U().empty(el);
    /* The specified copy for the compressed phase. `qflow.act('submit')` settles the record in the same
     * interaction, so this is the ONLY frame in which the submitting state is visible - which is exactly
     * why it must carry the right words rather than a generic transitional label. */
    el.appendChild(u.el('span', { class: 't2-capsule-spinner pmx-spin' }));
    el.appendChild(u.el('span', { class: 't2-capsule-text', text: label || 'Submitting answers' }));
    if (from != null && R) R.springHeight(el, from);
    global.setTimeout(done, R && R.reduced(el) ? 0 : 180);
  };

  T2Thread.prototype._compressAndRemove = function (el, done) {
    var self = this;
    this._compressToCapsule(el, function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      done();
    });
  };

  /* The receipt. A slab, because that is what this concept records things in. */
  T2Thread.prototype._renderQuestionReceipt = function (host, receipt) {
    var self = this;
    var u = U();
    if (!receipt) return;

    var slab = u.el('div', { class: 't2-qreceipt', data: { status: receipt.status } });
    slab.appendChild(u.el('span', { class: 't2-qreceipt-kind', text: 'Questions' }));
    slab.appendChild(u.el('span', {
      class: 't2-qreceipt-text',
      text: receipt.cancelled
        ? 'Cancelled'
        : (receipt.answered + (receipt.answered === 1 ? ' answer sent' : ' answers sent') +
           (receipt.skipped ? ', ' + receipt.skipped + ' skipped' : ''))
    }));

    var show = u.el('button', { class: 't2-qreceipt-open', type: 'button', text: 'Show answers' });
    this._on(show, 'click', function (ev) {
      self.ctx.services.popup.open({
        anchorEl: ev.currentTarget, kind: 'panel', width: 340,
        build: function (h) {
          h.appendChild(u.el('div', { class: 't2-sheet-title', text: receipt.cancelled ? 'Cancelled questions' : 'Answers sent' }));
          (receipt.questions || []).forEach(function (question) {
            var val = receipt.answers[question.id];
            var wasSkipped = (receipt.record.receipt.skipped || []).indexOf(question.id) >= 0;
            h.appendChild(u.el('div', { class: 't2-sheet-row' }, [
              u.el('span', { class: 't2-sheet-kind', text: wasSkipped ? 'skipped' : 'answered' }),
              u.el('span', { class: 't2-sheet-label', text: question.prompt + (val == null ? '' : ' \u2014 ' + [].concat(val).join(', ')) })
            ]));
          });
        }
      });
    });
    slab.appendChild(show);
    host.appendChild(slab);
  };

    T2Thread.prototype.syncLive = function () {
    var u = U();
    var svc = this.ctx.services;
    var status = svc.runtime.liveStatus(this.tid());

    if (!status) {
      if (this.liveEl && this.liveEl.parentNode) this.liveEl.parentNode.removeChild(this.liveEl);
      this.liveEl = null;
      return;
    }
    if (!this.liveEl) {
      this.liveEl = u.el('div', { class: 't2-live pmx-live' }, [
        u.el('span', { class: 't2-live-dot pmx-pulse' }),
        u.el('span', { class: 't2-live-text' }),
        u.el('span', { class: 't2-live-time' })
      ]);
      this.list.appendChild(this.liveEl);
    }
    svc.motion.swapTextInstant(this.liveEl.querySelector('.t2-live-text'), status.text || '');
    svc.motion.swapTextInstant(this.liveEl.querySelector('.t2-live-time'),
      status.workedSeconds != null ? F().duration(status.workedSeconds) : '');
  };

  /* ---------------------------------------------------------------- ThreadInstance API */

  T2Thread.prototype.isExpanded = function (msgId) {
    return !!this.ctx.store.view(this.tid()).expanded[msgId];
  };

  T2Thread.prototype.setExpanded = function (msgId, on) {
    var self = this;
    var rec = this.rendered[msgId];
    this.ctx.store.view(this.tid()).expanded[msgId] = !!on;
    if (!rec) return;
    var body = rec.bodyEl;
    var btn = body.querySelector('.t2-more');

    this.scrollCtl.preserveAcross(body, function () {
      body.setAttribute('data-expanded', on ? '1' : '0');
      if (btn) btn.textContent = on ? 'Show less' : 'Show more';
      self.ctx.services.motion.snapToEnd(body);
    });
  };

  T2Thread.prototype.revealHidden = function (msgId) {
    this.setExpanded(msgId, true);
  };

  T2Thread.prototype.scrollToMessage = function (id, opts) {
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
    if (this.isExpandedEligible(id)) this.setExpanded(id, true);
    this.scrollCtl.jumpTo(id, opts || { highlight: true });
    return true;
  };

  T2Thread.prototype.isExpandedEligible = function (id) {
    var msgs = this.ctx.data.messagesFor(this.tid());
    for (var i = 0; i < msgs.length; i++) {
      if (msgs[i].id === id) return (msgs[i].body || '').length >= COLLAPSE_ELIGIBLE_CHARS;
    }
    return false;
  };

  T2Thread.prototype.getAnchor = function () { return this.scrollCtl.captureAnchor(); };
  T2Thread.prototype.setAnchor = function (tok) { return this.scrollCtl.restoreAnchor(tok); };

  T2Thread.prototype.update = function (state, changed) {
    var needsFull = false, needsSurfaces = false, needsQuestion = false;
    for (var i = 0; i < changed.length; i++) {
      var k = changed[i];
      if (k === 'session.activeThreadId') needsFull = true;
      if (k.indexOf('view') === 0) { needsSurfaces = true; needsQuestion = true; }
      /* A new sent/received message changes which message is "latest assistant" and must be
       * painted into the list, not just have its surfaces refreshed. */
      if (k === 'view.lens' || k === 'view.expanded' || k === 'view.messages') needsFull = true;
    }
    if (state.session.activeThreadId !== this.lastThreadId) needsFull = true;
    if (needsFull) { this.renderThread(); return; }
    if (needsSurfaces) this.renderSurfaces();
    if (needsQuestion) this.renderQuestion();
  };

  T2Thread.prototype.destroy = function () {
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

  global.PMX.thread.register('t2', {
    name: 'Two-Tone Slabs',
    blurb: 'Role reads from a tinted, inset user field against a full-bleed assistant field, no bubble outline anywhere. Every piece of machinery demotes to a small chip that opens a detail sheet.',
    wants: ['workSurfaceHost', 'questionHost'],
    mount: function (regionEl, ctx) {
      var inst = new T2Thread(regionEl, ctx);
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
