/* PMX window concept — w1 "Ledger" — Opus 5
 *
 * Thread history costs zero permanent width: it lives in a full-height overlay drawer that
 * slides over the transcript from the chat's own left edge, and is dismissed on selection
 * (session.activeThreadId changes) or on an outside click. Work surfaces and the active
 * question dock to a bottom shelf that has zero height when nothing is active and grows only
 * as far as the mounted content needs, with its own internal scroll.
 *
 * Net effect: the transcript is full chat width at all times. Nothing about message rendering
 * lives here — regions.transcript is handed to whichever of the 8 thread concepts mounts.
 *
 * Contract: ../CONTRACT.md sections 1, 2, 4, 7, 8, 9. Services: ../shared/SERVICES.md.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  var MIN_W = 520;
  var MAX_W = 1200;

  function W1Window(root, ctx) {
    this.root = root;
    this.ctx = ctx;
    this.offs = [];
    this.shelfOpen = false;
    this.lastActiveThreadId = ctx.store.get('session.activeThreadId');
    this._mo = null;
    this.build();
  }

  W1Window.prototype._on = function (el, ev, fn, opts) {
    this.offs.push(U().on(el, ev, fn, opts));
  };

  W1Window.prototype.build = function () {
    var self = this;
    var ctx = this.ctx;
    var svc = ctx.services;
    var u = U();

    /* Outermost element for the container query. overlayRoot is deliberately kept OUTSIDE
     * this element (a sibling appended straight into root) — container-type establishes a
     * new containing block for fixed-position descendants, which would silently break the
     * popup system's viewport-relative math if the overlay lived underneath it. */
    var shell = u.el('div', {
      class: 'w1-shell',
      data: { pmxWindow: 'w1', w1Mount: 'docked' },
      style: { containerType: 'inline-size', containerName: 'pmx-chat' }
    });

    /* ---------------------------------------------------------------- header (single row) */
    var header = u.el('header', { class: 'w1-header' });

    this.historyBtn = u.el('button', {
      class: 'w1-history-btn', type: 'button',
      aria: { label: 'Thread history', expanded: 'false' }
    }, [
      svc.icons.get('thread', 15),
      u.el('span', { class: 'w1-history-btn-label', text: 'Threads' })
    ]);
    header.appendChild(this.historyBtn);

    var brand = u.el('div', { class: 'w1-brand' }, [
      u.el('span', { class: 'w1-brand-name', text: 'Ledger' }),
      u.el('span', { class: 'w1-brand-sep', text: String.fromCharCode(183) }),
      u.el('span', { class: 'w1-brand-model', text: ctx.label })
    ]);
    header.appendChild(brand);

    this.headerTools = u.el('div', { class: 'w1-header-tools' });
    header.appendChild(this.headerTools);

    shell.appendChild(header);

    /* ---------------------------------------------------------------- main: transcript + drawer */
    var main = u.el('div', { class: 'w1-main' });

    this.transcript = u.el('div', { class: 'w1-transcript pmx-scroll', data: { pmxRegion: 'transcript' } });
    main.appendChild(this.transcript);

    this.scrim = u.el('div', { class: 'w1-drawer-scrim', data: { open: '0' } });
    main.appendChild(this.scrim);

    this.drawer = u.el('div', { class: 'w1-drawer', data: { open: '0' } });
    var drawerHead = u.el('div', { class: 'w1-drawer-head' }, [
      u.el('span', { class: 'w1-drawer-title', text: 'Threads' })
    ]);
    /* Pinning turns the overlay into a column that keeps its width. Monitoring
     * several threads at once is a real workflow, and a drawer that hides the
     * conversation every time you check on another thread actively fights it. */
    this.drawerPin = u.el('button', {
      class: 'w1-drawer-pin', type: 'button',
      aria: { label: 'Keep thread history open', pressed: 'false' }
    }, [svc.icons.get('pin', 13)]);
    drawerHead.appendChild(this.drawerPin);

    this.drawerClose = u.el('button', {
      class: 'w1-drawer-close', type: 'button',
      aria: { label: 'Close thread history' }
    }, [svc.icons.get('close', 13)]);
    drawerHead.appendChild(this.drawerClose);
    this.drawer.appendChild(drawerHead);

    /* NOT .pmx-scroll, and not a scroller. The thread-history module mounts its own
     * `.pmx-chrome-hlist` scroller inside this element, and both carried
     * `scrollbar-gutter: stable` — so the column reserved 10px twice, leaving 20px
     * of permanently dead space down the right while the left edge sat flush. The
     * asymmetry read as the row fills being shifted left. Only the inner list ever
     * overflows, so it is the only one that should reserve a gutter. */
    this.drawerBody = u.el('div', { class: 'w1-drawer-body', data: { pmxRegion: 'threadHistory' } });
    this.drawer.appendChild(this.drawerBody);
    main.appendChild(this.drawer);

    shell.appendChild(main);

    /* ---------------------------------------------------------------- bottom shelf */
    this.shelf = u.el('div', { class: 'w1-shelf', data: { open: '0' } });
    var shelfBar = u.el('div', { class: 'w1-shelf-bar' }, [
      u.el('span', { class: 'w1-shelf-label', text: 'Work surfaces' })
    ]);
    this.shelf.appendChild(shelfBar);

    this.shelfBody = u.el('div', { class: 'w1-shelf-body pmx-scroll' });
    this.questionHost = u.el('div', { class: 'w1-question-host', data: { pmxRegion: 'questionHost' } });
    this.surfaceHost = u.el('div', { class: 'w1-surface-host', data: { pmxRegion: 'workSurfaceHost' } });
    this.shelfBody.appendChild(this.questionHost);
    this.shelfBody.appendChild(this.surfaceHost);
    this.shelf.appendChild(this.shelfBody);

    shell.appendChild(this.shelf);

    /* ---------------------------------------------------------------- composer */
    this.composerHost = u.el('div', { class: 'w1-composer', data: { pmxRegion: 'composerHost' } });
    shell.appendChild(this.composerHost);

    this.shell = shell;
    this.root.appendChild(shell);

    /* overlayRoot: a true sibling, so it stays anchored to the real viewport. */
    this.overlay = u.el('div', {
      class: 'w1-overlay pmx-overlay-root',
      data: { pmxWindow: 'w1', pmxRegion: 'overlayRoot' }
    });
    this.root.appendChild(this.overlay);

    /* ---------------------------------------------------------------- wiring
     * All of this used to write session.threadHistory.open / .pinned directly — a private
     * copy of a rule the shared module already owned, which is how this window drifted from
     * the other seven. It now goes through PMXThreadHistory so "pinned" means one thing
     * across all eight concepts. */
    var TH = global.PMXThreadHistory;

    this._on(this.historyBtn, 'click', function () {
      /* The header button is the transient affordance: it peeks and closes. It never
       * silently un-pins, because a pin is an explicit choice the user made. */
      var s = TH.readState(ctx);
      TH.setState(ctx, s === 'closed' ? 'peek' : (s === 'peek' ? 'closed' : 'closed'));
    });

    this._on(this.drawerPin, 'click', function (ev) {
      if (ev.altKey) { TH.cycleDensity(ctx); return; }
      TH.togglePin(ctx);
    });
    this._on(this.drawerPin, 'contextmenu', function (ev) {
      ev.preventDefault();
      TH.cycleDensity(ctx);
    });

    this._on(this.drawerClose, 'click', function () {
      /* Closing releases the pin too, otherwise the next open would silently
       * reclaim width the user just gave back. */
      TH.setState(ctx, 'closed');
    });
    this._on(this.scrim, 'click', function () { TH.setState(ctx, 'closed'); });

    this._on(global.document, 'pointerdown', function (ev) {
      /* A pinned column is not a transient overlay: dismissing it on an outside click would
       * undo an explicit choice. Only a peek is dismissible this way. */
      if (TH.readState(ctx) !== 'peek') return;
      var t = ev.target;
      if (self.drawer.contains(t) || self.historyBtn.contains(t)) return;
      TH.setState(ctx, 'closed');
    });
    this._on(global.document, 'keydown', function (ev) {
      if (ev.key === 'Escape' && TH.readState(ctx) === 'peek') TH.setState(ctx, 'closed');
    });

    /* Bottom shelf: starts at zero height, opens/closes as content is mounted or cleared by
     * whichever thread concept renders into questionHost / workSurfaceHost. Thread-agnostic
     * on purpose — any of 8 thread concepts may mount here. */
    var initialOpen = this.questionHost.childNodes.length > 0 || this.surfaceHost.childNodes.length > 0;
    this.shelfOpen = initialOpen;
    this.shelf.setAttribute('data-open', initialOpen ? '1' : '0');
    this.shelf.style.height = initialOpen ? '' : '0px';
    this.shelf.style.overflow = initialOpen ? '' : 'hidden';

    this._mo = new global.MutationObserver(function () { self.syncShelf(); });
    this._mo.observe(this.shelfBody, { childList: true, subtree: true });

    this.syncDrawer();
  };

  W1Window.prototype.syncShelf = function () {
    var svc = this.ctx.services;
    var shouldOpen = this.questionHost.childNodes.length > 0 || this.surfaceHost.childNodes.length > 0;
    if (shouldOpen === this.shelfOpen) return;
    this.shelfOpen = shouldOpen;
    this.shelf.setAttribute('data-open', shouldOpen ? '1' : '0');
    svc.motion.collapseTo(this.shelf, shouldOpen, { collapsedHeight: 0, duration: 260 });
  };

  /* The Ledger's floors. A 280px column beside a 400px transcript is a real ledger; the same
   * column beside a 240px one is a list wider than the conversation it exists to navigate.
   * The compact form is a 56px ruled spine, which costs little enough that it still fits
   * beside a readable transcript at the 520px minimum — which is the whole point of having
   * a compact tier rather than simply suspending the pin. */
  var W1_FLOORS = { minChat: 400, fullColumn: 280, compactColumn: 56, minStageForFull: 900 };

  W1Window.prototype.syncDrawer = function () {
    var TH = global.PMXThreadHistory;
    var r = TH.resolve(this.ctx, this.shell, W1_FLOORS);

    var open = r.effective !== 'closed';
    var pinnedFull = r.effective === 'pinned-full';
    var pinnedCompact = r.effective === 'pinned-compact';
    var pinActive = pinnedFull || pinnedCompact;

    this.drawer.setAttribute('data-open', open ? '1' : '0');
    this.drawer.setAttribute('data-pinned', pinActive ? '1' : '0');
    this.drawer.setAttribute('data-density', pinnedCompact ? 'compact' : 'full');
    this.shell.setAttribute('data-w1-pin-active', pinActive ? '1' : '0');
    this.shell.setAttribute('data-w1-history', r.effective);
    /* A pinned column sits beside the transcript rather than over it, so the
     * scrim — which exists to signal "this covers your reading" — must go. */
    this.scrim.setAttribute('data-open', (open && !pinActive) ? '1' : '0');
    this.shell.setAttribute('data-w1-pinned', r.state === 'pinned' ? '1' : '0');
    this.historyBtn.setAttribute('aria-expanded', open ? 'true' : 'false');

    TH.syncPinButton(this.drawerPin, r);

    /* The history module is mounted into the region by compose.js, so the window does not
     * hold its instance. setDocked() is its own API for exactly this and was never called by
     * any window — all eight stamped the attribute by hand, which left the module's internal
     * `docked` field permanently false. */
    var hist = this.drawerBody.querySelector('.pmx-chrome-history');
    if (hist) {
      hist.setAttribute('data-pmx-docked', pinActive ? '1' : '0');
      hist.setAttribute('data-pmx-density', pinnedCompact ? 'compact' : 'full');
    }

    /* A suspended pin says so, in place, rather than leaving a pressed control beside an
     * absent surface. */
    if (!this._suspendNote) {
      this._suspendNote = U().el('div', { class: 'w1-drawer-note' });
      this.drawer.insertBefore(this._suspendNote, this.drawerBody);
    }
    this._suspendNote.textContent = r.reason || '';
    this._suspendNote.setAttribute('data-show', r.reason ? '1' : '0');
  };

  /* ---------------------------------------------------------------- WindowInstance API */

  W1Window.prototype.setWidth = function (px) {
    var w = U().clamp(Number(px) || MIN_W, MIN_W, MAX_W);
    this.shell.style.width = w + 'px';
    /* The pin resolves against the chat's own width, so a width change can promote or demote
     * it. syncDrawer() only ran on session.* changes, so dragging the width slider across a
     * threshold left the drawer, the scrim and the pin button reporting the previous tier
     * until some unrelated session mutation happened to refresh them. */
    if (this.drawer) this.syncDrawer();
  };

  W1Window.prototype.setRail = function (open) {
    /* The fake application rail is owned by the shell, not by this window; chat width and
     * rail width are independent axes. Recorded as a data attribute so it is real, inspectable
     * state rather than a silent no-op. */
    this.shell.setAttribute('data-rail', open ? 'open' : 'closed');
  };

  W1Window.prototype.setMount = function (form) {
    var mount = form === 'popout' ? 'popout' : 'docked';
    this.shell.setAttribute('data-w1-mount', mount);
  };

  W1Window.prototype.update = function (state, changed) {
    var touchedSession = false;
    for (var i = 0; i < changed.length; i++) {
      if (changed[i].indexOf('session') === 0) { touchedSession = true; break; }
    }
    if (!touchedSession) return;

    var activeId = state.session.activeThreadId;
    if (activeId !== this.lastActiveThreadId) {
      this.lastActiveThreadId = activeId;
      /* Dismissed on selection — but only a PEEK is dismissed. A pinned column exists
       * precisely so you can switch threads without losing the list, so closing it here
       * would defeat the state the user asked for. */
      if (global.PMXThreadHistory.readState(this.ctx) === 'peek') {
        global.PMXThreadHistory.setState(this.ctx, 'closed');
      }
    }
    this.syncDrawer();
  };

  W1Window.prototype.destroy = function () {
    for (var i = 0; i < this.offs.length; i++) {
      try { this.offs[i](); } catch (e) {}
    }
    this.offs = [];
    if (this._mo) { try { this._mo.disconnect(); } catch (e) {} this._mo = null; }
    if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  };

  global.PMX.window.register('w1', {
    name: 'Ledger',
    blurb: 'Thread history slides in as a drawer so the transcript always keeps full chat width, while work surfaces gather in a bottom shelf that only takes space when something is active.',
    provides: ['threadHistory', 'workSurfaceHost', 'questionHost'],
    mount: function (root, ctx) {
      var inst = new W1Window(root, ctx);
      return {
        regions: {
          transcript: inst.transcript,
          composerHost: inst.composerHost,
          headerTools: inst.headerTools,
          overlayRoot: inst.overlay,
          threadHistory: inst.drawerBody,
          workSurfaceHost: inst.surfaceHost,
          questionHost: inst.questionHost
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
