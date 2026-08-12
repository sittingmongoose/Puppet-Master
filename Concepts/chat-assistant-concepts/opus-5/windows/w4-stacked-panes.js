/* PMX window concept — w4 "Stacked Panes" — Opus 5
 *
 * Conversation, Work, and History are three panes multiplexed in TIME rather than divided in
 * space: a vertical accordion where exactly one pane is expanded at a narrow width and the
 * other two sit as slim, persistent ~32px headers that keep showing a live one-line status.
 * Above ~980px the accordion turns sideways and the two most recently focused panes — the
 * "primary" and the "secondary" — sit side by side, sharing the width, while the third stays
 * collapsed as a narrow vertical strip. Panes are never removed from the DOM when collapsed,
 * so each keeps its own scroll position across every switch.
 *
 * Provides threadHistory (the History pane), workSurfaceHost and questionHost (the Work pane,
 * question first — it outranks the work surfaces exactly like w1's shelf).
 *
 * The accordion itself is pure CSS: each pane's flex-grow toggles between 0 and 1 off a
 * `data-role` attribute, so the resize is a single transitionable number, not a measured
 * height animation. Reduced motion is covered twice — the blanket .01ms override in
 * motion.css, plus an explicit `transition: none` here, same belt-and-braces the w1 drawer
 * uses — so a pane is never caught mid-open.
 *
 * Contract: ../CONTRACT.md sections 1, 2, 4, 7, 8, 9. Services: ../shared/SERVICES.md.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  var MIN_W = 520;
  var MAX_W = 1200;
  var ROLES = ['primary', 'secondary', 'collapsed'];

  /* The artifact is a FOURTH PANE, not a column. This is the only concept where that is the right
   * answer: the accordion already owns "one thing expanded at a time", so an artifact column would
   * introduce a second, contradictory space model inside the same window. As a pane it inherits the
   * promotion rules for free — opening it makes it `primary` and drops History to a collapsed
   * strip, which is exactly the coexistence rule the matrix specifies. */
  var PANE_DEFS = [
    { key: 'conversation', label: 'Conversation', icon: 'layers' },
    { key: 'work', label: 'Work', icon: 'terminal' },
    { key: 'history', label: 'History', icon: 'thread' },
    { key: 'artifact', label: 'Artifact', icon: 'artifact' }
  ];

  function W4Window(root, ctx) {
    this.root = root;
    this.ctx = ctx;
    this.offs = [];
    this.panes = {};
    /* Most-recently-focused order: index 0 is primary (always expanded), index 1 is
     * secondary (expanded only when the container is wide enough for two), index 2 is
     * collapsed. Local instance state, not store state — this is window chrome, like w1's
     * drawer-open flag, and every mount starts from the same sensible default. */
    /* The artifact starts last: it has nothing in it until something is produced, and a pane that
     * opens empty teaches the reader that panes are decoration. */
    this.order = ['conversation', 'work', 'history', 'artifact'];
    this.build();
  }

  W4Window.prototype._on = function (el, ev, fn, opts) {
    this.offs.push(U().on(el, ev, fn, opts));
  };

  W4Window.prototype.build = function () {
    var self = this;
    var ctx = this.ctx;
    var svc = ctx.services;
    var u = U();

    var shell = u.el('div', {
      class: 'w4-shell',
      data: { pmxWindow: 'w4' },
      style: { containerType: 'inline-size', containerName: 'pmx-chat' }
    });

    /* ---------------------------------------------------------------- header (single row) */
    var header = u.el('header', { class: 'w4-header' });
    var brand = u.el('div', { class: 'w4-brand' }, [
      u.el('span', { class: 'w4-brand-name', text: 'Stacked Panes' }),
      u.el('span', { class: 'w4-brand-sep', text: String.fromCharCode(183) }),
      u.el('span', { class: 'w4-brand-model', text: ctx.label })
    ]);
    header.appendChild(brand);
    this.headerTools = u.el('div', { class: 'w4-header-tools' });
    header.appendChild(this.headerTools);
    shell.appendChild(header);

    /* ---------------------------------------------------------------- accordion */
    var accordion = u.el('div', { class: 'w4-accordion' });

    PANE_DEFS.forEach(function (def) {
      var pane = self.buildPane(def);
      self.panes[def.key] = pane;
      accordion.appendChild(pane.el);
    });

    shell.appendChild(accordion);

    /* ---------------------------------------------------------------- composer */
    this.composerHost = u.el('div', { class: 'w4-composer', data: { pmxRegion: 'composerHost' } });
    shell.appendChild(this.composerHost);

    this.shell = shell;
    this.root.appendChild(shell);

    /* overlayRoot: a true sibling of the shell, outside the container-query / scroll subtree,
     * so popups are never clipped by a collapsed pane's overflow:hidden. */
    this.overlay = u.el('div', {
      class: 'w4-overlay pmx-overlay-root',
      data: { pmxWindow: 'w4', pmxRegion: 'overlayRoot' }
    });
    this.root.appendChild(this.overlay);

    this.transcript = this.panes.conversation.body;
    this.questionHost = this.panes.work.questionHost;
    this.surfaceHost = this.panes.work.surfaceHost;
    this.threadHistory = this.panes.history.historyHost;
    this.artifactHost = this.panes.artifact.artifactHost;

    /* Opening an artifact promotes its pane and, by the accordion's own rules, drops History to a
     * collapsed strip. That is the coexistence rule for this concept: one expanded surface, no new
     * space model. */
    if (global.PMXArtifacts && global.PMXArtifacts.subscribe) {
      this._artOff = global.PMXArtifacts.subscribe(function () { self.syncArtifact(); });
    }
    this.syncArtifact();

    this.applyRoles();
    this.syncStatus();

    this.offs.push(svc.runtime.onTick(function () { self.syncStatus(); }));
  };

  /* The segmented control is rebuilt from the catalog rather than stored, so a new artifact record
   * appears without this window knowing anything about artifact kinds. */
  W4Window.prototype.syncArtifact = function () {
    var A = global.PMXArtifacts;
    if (!A || !this.artifactSeg) return;
    var self = this;
    var u = U();
    var open = A.isOpen();
    var activeId = A.activeId();

    this.shell.setAttribute('data-w4-artifact', open ? '1' : '0');
    var pane = this.panes.artifact;
    if (pane) pane.el.setAttribute('data-has-content', open ? '1' : '0');

    if (open && this.order[0] !== 'artifact') this.promote('artifact');

    u.empty(this.artifactSeg);
    if (!open) return;
    A.list().forEach(function (a) {
      var seg = u.el('button', {
        class: 'w4-artifact-seg-btn', type: 'button',
        aria: { pressed: a.id === activeId ? 'true' : 'false' }
      }, [u.el('span', { text: a.title })]);
      u.on(seg, 'click', function () { A.switchTo(a.id); });
      self.artifactSeg.appendChild(seg);
    });
  };

  W4Window.prototype.buildPane = function (def) {
    var self = this;
    var ctx = this.ctx;
    var u = U();
    var icons = ctx.services.icons;

    var el = u.el('div', { class: 'w4-pane', data: { pane: def.key, role: 'collapsed' } });

    var head = u.el('button', {
      class: 'w4-pane-head', type: 'button',
      aria: { expanded: 'false' }
    });
    head.appendChild(u.el('span', { class: 'w4-pane-icon' }, [icons.get(def.icon, 15)]));
    head.appendChild(u.el('span', { class: 'w4-pane-label', text: def.label }));
    var status = u.el('span', { class: 'w4-pane-status' });
    head.appendChild(status);
    var chevron = u.el('span', { class: 'w4-pane-chevron' }, [icons.get('chevron-down', 12)]);
    head.appendChild(chevron);
    this._on(head, 'click', function () { self.promote(def.key); });
    el.appendChild(head);

    var body, questionHost = null, surfaceHost = null, historyHost = null, artifactHost = null;

    if (def.key === 'conversation') {
      body = u.el('div', {
        class: 'w4-pane-body w4-transcript pmx-scroll',
        data: { pmxRegion: 'transcript' }
      });
    } else if (def.key === 'work') {
      body = u.el('div', { class: 'w4-pane-body pmx-scroll' });
      questionHost = u.el('div', { class: 'w4-question', data: { pmxRegion: 'questionHost' } });
      surfaceHost = u.el('div', { class: 'w4-surface-host', data: { pmxRegion: 'workSurfaceHost' } });
      body.appendChild(questionHost);
      body.appendChild(surfaceHost);
    } else if (def.key === 'artifact') {
      body = u.el('div', { class: 'w4-pane-body w4-artifact-body-wrap pmx-scroll' });
      /* Sub-header segmented control, per the matrix. It sits inside the pane body rather than the
       * head because the head is a single button that promotes the pane — putting segments in it
       * would nest interactive controls inside a control. */
      this.artifactSeg = u.el('div', { class: 'w4-artifact-seg' });
      artifactHost = u.el('div', { class: 'w4-artifact-body', data: { pmxRegion: 'artifactHost' } });
      body.appendChild(this.artifactSeg);
      body.appendChild(artifactHost);
    } else {
      body = u.el('div', { class: 'w4-pane-body w4-history-body' });
      historyHost = u.el('div', { class: 'w4-history-host', data: { pmxRegion: 'threadHistory' } });
      body.appendChild(historyHost);

      /* The pin lives in the pane HEAD, which stays visible even when the pane is
       * collapsed — so the control that un-collapses it is always reachable. */
      var selfW4 = this;
      this.historyPinBtn = global.PMXThreadHistory.pinButton(this.ctx, 'w4-pane-pin', function () {
        selfW4.applyRoles();
      });
      head.appendChild(this.historyPinBtn);
    }
    el.appendChild(body);

    return {
      key: def.key, el: el, head: head, status: status, chevron: chevron, body: body,
      questionHost: questionHost, surfaceHost: surfaceHost, historyHost: historyHost,
      artifactHost: artifactHost
    };
  };

  /* Bring a pane to the front of the MRU order. Index 0 becomes primary (always expanded),
   * whatever was primary slides to secondary (expanded only when the container is wide), and
   * whatever was secondary slides to collapsed. Clicking the pane that is already primary is a
   * no-op — there is always exactly one primary and collapsing it would leave none. */
  W4Window.prototype.promote = function (key) {
    var idx = this.order.indexOf(key);
    if (idx <= 0) return;
    this.order.splice(idx, 1);
    this.order.unshift(key);
    this.applyRoles();
  };

  W4Window.prototype.applyRoles = function () {
    var TH = global.PMXThreadHistory;
    var histPane = this.panes.history;
    /* fullColumn and minStageForFull are both 0 for this concept: history is a PANE in the
     * existing accordion and never takes width, so a width floor would gate a pin that costs
     * nothing. */
    var r = (TH && histPane)
      ? TH.applyTo(histPane.historyHost, TH.resolve(this.ctx, histPane.el, TH.floorsFor('w4')))
      : { state: 'closed', effective: 'closed', reason: null };
    if (histPane) TH.reasonNode(histPane.historyHost, r);
    var pin = { asked: r.state === 'pinned', active: r.effective === 'pinned-full',
                compact: r.effective === 'pinned-compact', effective: r.effective };

    /* A pinned pane never collapses. It is lifted to SECONDARY rather than primary
     * on purpose: the conversation keeps the primary slot, because pinning history
     * is about watching it alongside the chat, not instead of it. */
    var order = this.order.slice();
    if (pin.active) {
      var at = order.indexOf('history');
      if (at === 2) { order.splice(at, 1); order.splice(1, 0, 'history'); }
    }

    if (TH && TH.syncPinButton) TH.syncPinButton(this.historyPinBtn, pin.asked);
    if (histPane) {
      var histRoot = histPane.el.querySelector('.pmx-chrome-history');
      if (histRoot) histRoot.setAttribute('data-pmx-docked', pin.active ? '1' : '0');
    }

    for (var i = 0; i < order.length; i++) {
      var pane = this.panes[order[i]];
      var role = ROLES[i];
      pane.el.setAttribute('data-role', role);
      pane.head.setAttribute('aria-expanded', role === 'collapsed' ? 'false' : 'true');
    }
  };

  /* Every collapsed pane keeps showing a one-line live status, per the concept brief. Cheap
   * string builds only; called on relevant store changes and on the shared runtime tick. */
  W4Window.prototype.syncStatus = function () {
    var ctx = this.ctx;
    var svc = ctx.services;
    var data = ctx.data;
    var fmt = data.fmt;
    var tid = ctx.store.get('session.activeThreadId');
    var motion = svc.motion;

    var live = svc.runtime.liveStatus(tid);
    var convText;
    if (live) {
      convText = live.text + ' — ' + fmt.duration(live.workedSeconds);
    } else {
      var msgs = data.messagesFor(tid) || [];
      var last = msgs[msgs.length - 1];
      convText = last ? (fmt.label(last.role) + ' · ' + fmt.relative(last.sentAt)) : 'No messages yet';
    }
    motion.swapTextInstant(this.panes.conversation.status, convText);

    var active = svc.surfaces.activeFor(tid);
    var q = svc.questionnaire.activeFor(tid);
    var workParts = [];
    if (q) workParts.push('Question pending');
    if (active.goal) workParts.push('Goal ' + fmt.label(active.goal.status || 'active'));
    if (active.todo) workParts.push('Todo open');
    if (active.subagents) workParts.push(active.subagents.length + (active.subagents.length === 1 ? ' subagent' : ' subagents'));
    if (active.diffs) workParts.push(active.diffs.length + (active.diffs.length === 1 ? ' diff' : ' diffs'));
    if (active.activity) workParts.push('Activity running');
    motion.swapTextInstant(this.panes.work.status, workParts.length ? workParts.join(' · ') : 'No active work');

    var count = data.threads.length;
    motion.swapTextInstant(this.panes.history.status, count + (count === 1 ? ' thread' : ' threads'));
  };

  /* ---------------------------------------------------------------- WindowInstance API */

  W4Window.prototype.setWidth = function (px) {
    var w = U().clamp(Number(px) || MIN_W, MIN_W, MAX_W);
    this.shell.style.width = w + 'px';
  };

  W4Window.prototype.setRail = function (open) {
    this.shell.setAttribute('data-rail', open ? 'open' : 'closed');
  };

  W4Window.prototype.setMount = function (form) {
    /* pin: re-evaluate once the regions exist, so the docked flag lands on
     * the history root the shared module just rendered. */
    if (this.applyRoles) this.applyRoles();
    this.shell.setAttribute('data-w4-mount', form === 'popout' ? 'popout' : 'docked');
  };

  W4Window.prototype.update = function (state, changed) {
    for (var p = 0; p < changed.length; p++) {
      if (changed[p].indexOf('session') === 0) { this.applyRoles(); break; }
    }
    var relevant = false;
    for (var i = 0; i < changed.length; i++) {
      if (changed[i].indexOf('session') === 0 || changed[i].indexOf('view') === 0) { relevant = true; break; }
    }
    if (!relevant) return;
    this.syncStatus();
  };

  W4Window.prototype.destroy = function () {
    if (this._artOff) { try { this._artOff(); } catch (e) {} this._artOff = null; }
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  };

  global.PMX.window.register('w4', {
    name: 'Stacked Panes',
    blurb: 'Conversation, Work, and History share one vertical accordion instead of splitting the width — exactly one expanded at a narrow chat, two side by side once there is room, and the rest as slim headers that keep their live status visible.',
    provides: ['threadHistory', 'workSurfaceHost', 'questionHost', 'artifactHost'],
    mount: function (root, ctx) {
      var inst = new W4Window(root, ctx);
      return {
        regions: {
          transcript: inst.transcript,
          composerHost: inst.composerHost,
          headerTools: inst.headerTools,
          overlayRoot: inst.overlay,
          threadHistory: inst.threadHistory,
          workSurfaceHost: inst.surfaceHost,
          questionHost: inst.questionHost,
          artifactHost: inst.artifactHost
        },
        setWidth: function (px) { inst.setWidth(px); },
        setRail: function (open) { inst.setRail(open); },
        setMount: function (form) { inst.setMount(form); },
        update: function (state, changed) { inst.update(state, changed); },
        destroy: function () { inst.destroy(); }
      };
    }
  });
})(window);
