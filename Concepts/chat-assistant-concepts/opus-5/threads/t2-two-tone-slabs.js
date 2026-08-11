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

  T2Thread.prototype.renderSurfaces = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var container;

    if (this.ctx.capabilities.workSurfaceHost) {
      var host = this.ctx.regions.workSurfaceHost;
      U().empty(host);
      container = u.el('div', { class: ['t2-chips', 't2-chips-host'] });
      host.appendChild(container);
    } else {
      var rec = this.latestAssistantId ? this.rendered[this.latestAssistantId] : null;
      if (rec && rec.surfaceChipsEl) {
        container = rec.surfaceChipsEl;
        U().empty(container);
      } else {
        U().empty(this.inlineSurfaces);
        container = this.inlineSurfaces;
      }
    }

    var active = svc.surfaces ? svc.surfaces.activeFor(this.tid()) : null;
    var thread = this.ctx.data.threadById(this.tid());

    /* Absent members are null; nothing reserves space for a surface that is not active. */
    function each(v) { return v == null ? [] : (Object.prototype.toString.call(v) === '[object Array]' ? v : [v]); }

    var chips = [];
    if (active && active.goal) {
      chips.push(this._chip('goal', 'sparkle', 'Goal · ' + F().label(active.goal.status), function (host, api) {
        self.buildGoalDetail(host, active.goal, api);
      }, 340));
    }
    if (active && active.todo) {
      var done = (active.todo.items || []).filter(function (i) { return i.state === 'complete'; }).length;
      chips.push(this._chip('todo', 'check', 'Todo · ' + done + ' of ' + (active.todo.items || []).length, function (host) {
        self.buildTodoDetail(host, active.todo);
      }, 300));
    }
    if (active) {
      each(active.subagents).forEach(function (g) {
        var c = g.counts || {};
        var parts = [];
        if (c.working) parts.push(c.working + ' working');
        if (c.complete) parts.push(c.complete + ' complete');
        if (c.blocked) parts.push(c.blocked + ' blocked');
        if (c.waiting) parts.push(c.waiting + ' waiting for parent');
        chips.push(self._chip('subagents', 'branch', 'Agents · ' + (parts.join(', ') || 'none active'), function (host) {
          self.buildAgentsDetail(host, g);
        }, 340));
      });
      each(active.diffs).forEach(function (g) {
        var files = g.files || [];
        chips.push(self._chip('diff', 'file', 'Changes · ' + files.length + (files.length === 1 ? ' file' : ' files'), function (host) {
          self.buildDiffDetail(host, g);
        }, 320));
      });
    }
    if (thread && thread.artifacts && thread.artifacts.length) {
      chips.push(this._chip('artifacts', 'folder', 'Artifacts · ' + thread.artifacts.length, function (host) {
        self.buildArtifactsDetail(host, thread.artifacts);
      }, 300));
    }

    chips.forEach(function (c) { container.appendChild(c); });
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

  T2Thread.prototype.renderQuestion = function () {
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

T2Thread.prototype._renderQuestionBody = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var host = this.ctx.capabilities.questionHost ? this.ctx.regions.questionHost : this.inlineQuestion;
    if (!host) return;
    U().empty(host);

    var q = svc.questionnaire ? svc.questionnaire.activeFor(this.tid()) : null;
    if (!q) return;

    if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(this.tid(), true);

    var idx = svc.questionnaire.currentIndex ? svc.questionnaire.currentIndex(q.id) : (q.currentQuestionIndex || 0);
    var question = (q.questions || [])[idx];
    if (!question) return;

    var card = u.el('div', { class: 't2-question' });
    card.appendChild(u.el('div', { class: 't2-question-head' }, [
      u.el('span', { class: 't2-question-count', text: (idx + 1) + ' of ' + (q.questions || []).length }),
      u.el('span', { class: 't2-question-req', text: question.required ? 'Required' : 'Optional' })
    ]));
    card.appendChild(u.el('p', { class: 't2-question-prompt', text: question.prompt }));

    if (question.options && question.options.length) {
      var opts = u.el('div', { class: 't2-question-opts' });
      question.options.forEach(function (opt) {
        var selected = (question.selected || []).indexOf(opt) >= 0;
        var b = u.el('button', { class: 't2-opt', text: opt, aria: { pressed: selected ? 'true' : 'false' } });
        self._on(b, 'click', function (ev) {
          if (global.PMXReveal) global.PMXReveal.ripple(this, ev);
          svc.questionnaire.answer(q.id, question.id, opt);
          self.renderQuestion();
        });
        opts.appendChild(b);
      });
      card.appendChild(opts);
    } else {
      var ta = u.el('textarea', { class: 't2-question-free pmx-scroll', aria: { label: question.prompt } });
      ta.setAttribute('spellcheck', 'true');
      ta.value = question.draft || '';
      this._on(ta, 'input', function () { svc.questionnaire.answer(q.id, question.id, ta.value); });
      card.appendChild(ta);
    }

    var acts = u.el('div', { class: 't2-question-acts' });
    var skip = u.el('button', { class: 't2-act', text: 'Skip' });
    this._on(skip, 'click', function () { svc.questionnaire.skip(q.id, question.id); self.renderQuestion(); });
    acts.appendChild(skip);

    var isLast = idx === (q.questions || []).length - 1;
    var primary = u.el('button', { class: 't2-act t2-act-primary', text: isLast ? 'Submit' : 'Next' });
    this._on(primary, 'click', function () {
      if (isLast) {
        var can = svc.questionnaire.canSubmit(q.id);
        if (!can.ok) { if (global.PMXReveal) global.PMXReveal.reject(this); svc.toast.show('Answer the required questions first'); return; }
        svc.questionnaire.submit(q.id);
      } else {
        svc.questionnaire.next(q.id);
      }
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(primary);

    var cancel = u.el('button', { class: 't2-act', text: 'Cancel' });
    this._on(cancel, 'click', function () {
      svc.questionnaire.cancel(q.id);
      if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(self.tid(), false);
      self.renderQuestion();
      self.renderSurfaces();
    });
    acts.appendChild(cancel);

    card.appendChild(acts);
    host.appendChild(card);
  };

  /* ---------------------------------------------------------------- live status */

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
