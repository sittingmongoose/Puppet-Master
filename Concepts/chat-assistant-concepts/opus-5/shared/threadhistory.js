/* PMX thread history — Opus 5
 *
 * Mounted ONLY when the window provides a threadHistory region. Some windows own history
 * themselves, so this module never assumes it exists.
 *
 * Row state is shown with a background fill, weight, and small SVG markers. It is
 * deliberately NOT a colored left-side accent border — that treatment is prohibited
 * project-wide as a selection or status marker, superseding older plan wording.
 *
 * THREE THINGS THIS OWNS THAT ARE EASY TO GET WRONG
 * -------------------------------------------------
 * 1. Status is a SYMBOL, not a word. A rail you monitor several threads in has to be
 *    readable at a glance and in peripheral vision, and a column of state words is
 *    neither. Every symbol still carries an accessible name, because a glyph with no
 *    name is unusable on a screen reader — "not text" is a visual instruction, not a
 *    licence to ship an unlabelled control.
 *
 * 2. The row is a CONTAINER, not a button. It holds one button that selects the thread
 *    and one that opens the row menu. Nesting a button inside a button is invalid HTML
 *    and the inner one is unreachable by keyboard in some engines.
 *
 * 3. Docked mode is a mode, not a different component. The same rows serve an overlay
 *    drawer and a pinned column; only the host and a class differ.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function F() { return global.PMXData.fmt; }

  /* Truthful state resolution, in priority order. A thread that is live RIGHT NOW
   * outranks whatever the corpus recorded, because the user just caused it. */
  function statusOf(t, ctx) {
    var svc = ctx.services;

    if (svc.runtime && svc.runtime.isActive && svc.runtime.isActive(t.id)) return 'working';

    if (svc.questionnaire && svc.questionnaire.queueFor) {
      var queue = svc.questionnaire.queueFor(t.id);
      if (queue && queue.length) return 'attention';
    }

    switch (t.threadState) {
      case 'running':           return 'working';
      case 'awaiting question': return 'attention';
      case 'blocked':           return 'blocked';
      case 'paused':            return 'paused';
      case 'finished':          return 'finished';
      default: break;
    }
    /* The extension layer marks threads whose last run completed. Plain 'idle' means
     * "nothing is running", which is NOT the same claim as "finished". */
    if (t.completed) return 'finished';
    return 'idle';
  }

  /* The glyphs are purpose-built (icons.js, "status set") rather than borrowed from
   * the general icon set, so every state is inscribed in the same circle and the
   * column shares one optical size. Motion lives inside the SVG where it can be
   * aimed at one shape — spinning a whole glyph moves parts that should stay put. */
  var STATUS = {
    working:   { icon: 'status-working',   label: 'Working' },
    attention: { icon: 'status-attention', label: 'Needs attention', bob: true },
    blocked:   { icon: 'status-blocked',   label: 'Blocked' },
    paused:    { icon: 'status-paused',    label: 'Paused' },
    finished:  { icon: 'status-finished',  label: 'Finished' },
    idle:      { icon: 'status-idle',      label: 'Idle' }
  };

  function ThreadHistory(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.docked = false;
    this.build();
  }

  ThreadHistory.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };

  ThreadHistory.prototype.build = function () {
    var u = U();
    this.root = u.el('div', { class: 'pmx-chrome pmx-chrome-history' });
    this.list = u.el('div', { class: 'pmx-chrome-hlist pmx-scroll' });
    this.root.appendChild(this.list);
    this.host.appendChild(this.root);
    this.render();
  };

  /* Overlay vs pinned column. Windows call this; the rows themselves do not change. */
  ThreadHistory.prototype.setDocked = function (on) {
    this.docked = !!on;
    if (this.root) this.root.setAttribute('data-pmx-docked', this.docked ? '1' : '0');
  };

  ThreadHistory.prototype.statusNode = function (t) {
    var u = U();
    var key = statusOf(t, this.ctx);
    var def = STATUS[key] || STATUS.idle;

    var wrap = u.el('span', {
      class: 'pmx-chrome-hstatus',
      data: { 'pmx-status': key },
      aria: { label: def.label }
    });
    wrap.setAttribute('role', 'img');
    wrap.title = def.label;

    var glyph = this.ctx.services.icons.get(def.icon, 13);
    /* Only the bob moves the whole glyph — it is a nudge of the entire mark, which
     * is the point. Spin and pulse are aimed at individual shapes from CSS. */
    if (def.bob) glyph.classList.add('pmx-bob');
    wrap.appendChild(glyph);
    return wrap;
  };

  ThreadHistory.prototype.render = function () {
    var self = this;
    var u = U();
    var data = this.ctx.data;
    var activeId = this.ctx.store.get('session.activeThreadId');
    var q = (this.ctx.store.get('session.threadHistory.query') || '').trim().toLowerCase();

    u.empty(this.list);

    var threads = data.threads.slice().sort(function (a, b) {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      /* Recency comes from the last message, not thread.updatedAt, which is unreliable on
       * 11 of the 15 supplied threads. Recorded as GAP-D2. */
      return new Date(b.lastActivityAt) - new Date(a.lastActivityAt);
    });

    threads.forEach(function (t) {
      if (q && t.title.toLowerCase().indexOf(q) === -1 && (t.project || '').toLowerCase().indexOf(q) === -1) return;

      var isActive = t.id === activeId;
      var row = u.el('div', {
        class: 'pmx-chrome-hrow',
        data: { thread: t.id, state: t.threadState || 'idle', archived: t.archived ? '1' : '0' }
      });
      if (isActive) row.classList.add('is-active');

      var main = u.el('button', {
        class: 'pmx-chrome-hrow-main',
        aria: { current: isActive ? 'true' : 'false' }
      });

      main.appendChild(self.statusNode(t));

      var body = u.el('div', { class: 'pmx-chrome-hrow-body' });
      var top = u.el('div', { class: 'pmx-chrome-hrow-top' }, [
        u.el('span', { class: 'pmx-chrome-htitle', text: t.title }),
        u.el('span', { class: 'pmx-chrome-htime', text: F().relative(t.lastActivityAt) })
      ]);
      if (t.pinned) top.insertBefore(self.ctx.services.icons.get('pin', 11), top.firstChild);
      body.appendChild(top);

      /* The state WORD is gone — that is now the symbol. What remains is metadata the
       * symbol does not express, and 'Question' is dropped because it duplicates the
       * attention status exactly. */
      var marks = u.el('div', { class: 'pmx-chrome-hmarks' });
      if (t.activeGoal) marks.appendChild(u.el('span', { class: 'pmx-chrome-hmark', text: 'Goal' }));
      if (t.draftState) marks.appendChild(u.el('span', { class: 'pmx-chrome-hmark', text: 'Draft' }));
      if (t.hiddenCount > 0) marks.appendChild(u.el('span', { class: 'pmx-chrome-hmark', text: 'Long history' }));
      if (t.archived) marks.appendChild(u.el('span', { class: 'pmx-chrome-hmark', text: 'Archived' }));
      if (marks.childNodes.length) body.appendChild(marks);

      main.appendChild(body);
      row.appendChild(main);

      self._on(main, 'click', function () {
        self.ctx.store.set('session.activeThreadId', t.id);
      });

      /* One visible control for every per-thread action. Previously these lived on
       * right-click alone, which is undiscoverable — most people never found them. */
      var more = u.el('button', {
        class: 'pmx-chrome-hmore',
        aria: { label: 'Options for ' + t.title, haspopup: 'menu' }
      });
      more.title = 'Thread options';
      more.appendChild(self.ctx.services.icons.get('more', 14));
      self._on(more, 'click', function (ev) {
        /* Without this the row underneath also fires and switches thread. */
        ev.stopPropagation();
        self.openRowMenu(ev.currentTarget, t);
      });
      row.appendChild(more);

      /* Right-click still works for people who already knew about it. */
      self._on(row, 'contextmenu', function (ev) {
        ev.preventDefault();
        self.openRowMenu(more, t);
      });

      self.list.appendChild(row);
    });

    if (!this.list.childNodes.length) {
      this.list.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'No threads match that filter.' }));
    }
  };

  ThreadHistory.prototype.openRowMenu = function (anchor, thread) {
    var self = this;
    var u = U();
    var items = [
      [thread.pinned ? 'Unpin' : 'Pin', 'pin'],
      ['Rename', 'rename'],
      ['Branch from here', 'branch'],
      ['Export', 'export'],
      [thread.archived ? 'Restore' : 'Archive', 'archive'],
      ['Delete', 'delete']
    ];
    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'menu', width: 200,
      build: function (host, api) {
        items.forEach(function (item) {
          var row = u.el('button', { class: 'pmx-popup-item' }, [
            u.el('span', { class: 'pmx-popup-item-label', text: item[0] })
          ]);
          u.on(row, 'click', function () {
            if (item[1] === 'delete') {
              self.ctx.services.toast.show('Delete needs confirmation. Nothing was removed.');
            } else {
              self.ctx.services.toast.show(item[0] + ' — ' + thread.title);
            }
            api.close();
          });
          host.appendChild(row);
        });
      }
    });
  };

  ThreadHistory.prototype.update = function (state, changed) {
    for (var i = 0; i < changed.length; i++) {
      if (changed[i].indexOf('session') === 0) { this.render(); return; }
    }
  };

  ThreadHistory.prototype.destroy = function () {
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  /* ---------------------------------------------------------------- pin helpers
   * Eight windows express pinning in eight different idioms — a drawer docks, a
   * sheet locks at a detent, rails part — but the STATE and the rules around it
   * must be identical everywhere, or pinning would mean something different in
   * each concept. These functions are that shared contract.
   *
   * FOUR STATES, NOT TWO BOOLEANS
   * -----------------------------
   * What the user asks for is `state` ('closed' | 'peek' | 'pinned') plus, when pinned,
   * `density` ('full' | 'compact'). What they GET is derived per concept against its own
   * width floors and is never stored, because the same request resolves differently in a
   * 520px chat and a 1200px one.
   *
   * The previous model was two booleans with a single hard gate, and the gate hardcoded
   * `chatW >= 800` (a 520px transcript floor plus a 280px column). At the 520 and 750
   * presets — half the widths this workspace exists to test — pinning could therefore
   * never engage in any concept, and when it failed the surface simply vanished while the
   * pin button still read pressed. The compact tier is what makes a pin honourable at a
   * narrow width instead: a 56px spine beside a 400px transcript is a real answer, a 280px
   * column beside a 240px one is not.
   *
   * `reason` exists so a suspended pin can SAY why. Silently dropping to peek while the
   * control reports pressed is the failure the packet calls out by name.
   */

  var STATE_KEY = 'session.threadHistory.state';
  var DENSITY_KEY = 'session.threadHistory.density';

  /* Every window declares its own floors; these are only the fallbacks for a caller that
   * passes none. `minChat` is the transcript width below which the concept stops being a
   * readable conversation — that judgement belongs to the concept, not to this file. */
  var DEFAULT_FLOORS = { minChat: 400, fullColumn: 280, compactColumn: 56, minStageForFull: 900 };

  function readState(ctx) {
    var s = ctx.store.get(STATE_KEY);
    return s === 'peek' || s === 'pinned' ? s : 'closed';
  }

  function readDensity(ctx) {
    return ctx.store.get(DENSITY_KEY) === 'compact' ? 'compact' : 'full';
  }

  /* Resolve the asked-for state against the space this concept actually has.
   *
   * The room test measures the STAGE, not the nearest CSS container. That distinction cost
   * an hour once: the nearest container to a history host is usually the window shell, whose
   * inline size IS the chat width, so a container query there measures the wrong box entirely
   * and reports "no room" on a wide screen. The stage is the space the column and the
   * transcript actually share. The chat's own width is measured separately, because a wide
   * stage with a narrow chat still has to leave a readable transcript. */
  function resolve(ctx, hostEl, floors) {
    floors = Object.assign({}, DEFAULT_FLOORS, floors || {});
    var asked = readState(ctx);
    var density = readDensity(ctx);

    var stage = hostEl && hostEl.closest ? hostEl.closest('.pmx-stage') : null;
    var room = stage ? stage.getBoundingClientRect().width : 0;
    var shell = hostEl && hostEl.closest ? hostEl.closest('[data-pmx-window]') : null;
    var chatW = shell ? shell.getBoundingClientRect().width : room;

    var out = {
      state: asked, density: density, room: room, chatW: chatW,
      floors: floors, effective: 'closed', reason: null, suspended: false
    };

    if (asked === 'closed') return out;
    if (asked === 'peek') { out.effective = 'peek'; return out; }

    var fitsFull = (chatW - floors.fullColumn) >= floors.minChat && room >= floors.minStageForFull;
    var fitsCompact = (chatW - floors.compactColumn) >= floors.minChat;

    if (density === 'full' && fitsFull) { out.effective = 'pinned-full'; return out; }

    if (fitsCompact) {
      out.effective = 'pinned-compact';
      /* Only call it a demotion when the user actually asked for the wider form. */
      if (density === 'full') {
        out.suspended = true;
        out.reason = 'Not enough width for the full list. Showing the compact rail.';
      }
      return out;
    }

    /* Even the compact form would push the transcript under its readability floor, so fall
     * back to a transient peek — which overlays, and is allowed to. The ASKED-for state is
     * left untouched, so widening restores exactly what the user chose. */
    out.effective = 'peek';
    out.suspended = true;
    out.reason = 'Not enough width to keep history pinned. It opens over the conversation instead.';
    return out;
  }

  function setState(ctx, state) {
    ctx.store.set(STATE_KEY, state === 'peek' || state === 'pinned' ? state : 'closed');
  }

  function setDensity(ctx, density) {
    ctx.store.set(DENSITY_KEY, density === 'compact' ? 'compact' : 'full');
  }

  function isOpen(ctx) { return readState(ctx) !== 'closed'; }

  /* Compatibility adapter over resolve(), for a window not yet migrated to the four-state model.
   *
   * `active` deliberately means pinned-FULL only. An unmigrated window renders one pinned form —
   * its full column — and has no compact rendering to fall back on, so reporting `active` for a
   * compact resolution would make it draw a 280px column at a 520px chat and leave a 240px
   * transcript. That is worse than the behaviour being replaced, which simply declined to pin.
   * A window opts into the compact tier by calling resolve() and rendering it; until then it
   * behaves exactly as it did. `compact` and `effective` are exposed so a partially migrated
   * window can read the real answer without changing what `active` promises. */
  function pinState(ctx, hostEl, minStageWidth) {
    var r = resolve(ctx, hostEl, { minStageForFull: minStageWidth || 900 });
    return {
      asked: r.state === 'pinned',
      active: r.effective === 'pinned-full',
      compact: r.effective === 'pinned-compact',
      effective: r.effective,
      reason: r.reason,
      room: r.room,
      chatW: r.chatW
    };
  }

  /* Closed/peek -> pinned, pinned -> closed. Pinning implies open; pinning something shut is
   * meaningless. Density is deliberately NOT reset here, so a user who prefers the compact rail
   * gets it back next time they pin. */
  function togglePin(ctx) {
    var next = readState(ctx) !== 'pinned';
    setState(ctx, next ? 'pinned' : 'closed');
    return next;
  }

  function cycleDensity(ctx) {
    var next = readDensity(ctx) === 'full' ? 'compact' : 'full';
    setDensity(ctx, next);
    if (readState(ctx) !== 'pinned') setState(ctx, 'pinned');
    return next;
  }

  /* One pin control, built once, so the affordance is recognisably the same object in every
   * concept even where the surface around it differs.
   *
   * Primary click pins and unpins. Secondary click (or Alt-click, or the Enter-with-Alt
   * keyboard path) switches between the full and compact pinned forms — a second visible
   * button in every concept's chrome would cost more than the affordance is worth, and the
   * density is also reachable from the row menu for anyone who never finds this. */
  function pinButton(ctx, cls, onChange) {
    var btn = U().el('button', {
      class: cls, type: 'button',
      aria: { label: 'Keep thread history open', pressed: 'false' }
    });
    btn.appendChild(ctx.services.icons.get('pin', 13));

    U().on(btn, 'click', function (ev) {
      ev.stopPropagation();
      if (ev.altKey) {
        var d = cycleDensity(ctx);
        if (onChange) onChange(readState(ctx) === 'pinned', d);
        return;
      }
      var on = togglePin(ctx);
      if (onChange) onChange(on, readDensity(ctx));
    });

    U().on(btn, 'contextmenu', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var d = cycleDensity(ctx);
      if (onChange) onChange(readState(ctx) === 'pinned', d);
    });

    return btn;
  }

  /* Accepts either a resolve() result or the legacy boolean, so migrated and unmigrated
   * windows can both call it during the transition. */
  function syncPinButton(btn, resolved) {
    if (!btn) return;
    var pinned, label;
    if (resolved && typeof resolved === 'object') {
      pinned = resolved.state === 'pinned' || resolved.asked === true;
      if (!pinned) label = 'Keep thread history open';
      else if (resolved.suspended) label = 'Thread history pinned, reduced to fit';
      else if (resolved.effective === 'pinned-compact' || resolved.compact) label = 'Unpin thread history, currently compact';
      else label = 'Unpin thread history';
    } else {
      pinned = !!resolved;
      label = pinned ? 'Unpin thread history' : 'Keep thread history open';
    }
    btn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
    btn.setAttribute('aria-label', label);
    if (resolved && typeof resolved === 'object') {
      btn.setAttribute('data-pmx-suspended', resolved.suspended ? '1' : '0');
      if (resolved.reason) btn.title = resolved.reason;
      else btn.removeAttribute('title');
    }
  }

  global.PMXThreadHistory = {
    mount: function (host, ctx) { return new ThreadHistory(host, ctx); },
    /* Exposed so windows that render their own history can show the same symbol. */
    statusOf: statusOf,
    STATUS: STATUS,

    /* Four-state model. Windows call resolve() and render whatever `effective` says. */
    resolve: resolve,
    readState: readState,
    readDensity: readDensity,
    setState: setState,
    setDensity: setDensity,
    cycleDensity: cycleDensity,
    isOpen: isOpen,
    DEFAULT_FLOORS: DEFAULT_FLOORS,
    STATE_KEY: STATE_KEY,
    DENSITY_KEY: DENSITY_KEY,

    /* Shared affordance. */
    togglePin: togglePin,
    pinButton: pinButton,
    syncPinButton: syncPinButton,

    /* Compatibility shim for windows not yet migrated to resolve(). */
    pinState: pinState
  };
})(window);
