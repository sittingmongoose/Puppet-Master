/* PMX compose — Opus 5
 * Mounts a (window, thread) pairing into a stage, and performs remounts
 * (docked <-> pop-out, concept swap) without losing semantic state.
 * Contract: CONTRACT.md section 6.
 */
(function (global) {
  'use strict';

  var PMX = global.PMX;

  function Composition(stageEl, ctxBase) {
    this.stage = stageEl;
    this.ctxBase = ctxBase;
    this.windowInst = null;
    this.threadInst = null;
    this.windowId = null;
    this.threadId = null;
    this.shell = null;
    this.attachments = [];   // composer/header/etc. mounted into window regions
    this.lastError = null;
  }

  /* Everything the shared chrome (composer, header tools, thread history) needs to be
   * torn down on remount is registered here so destroy() is total. */
  Composition.prototype._attach = function (obj) {
    if (obj && typeof obj.destroy === 'function') this.attachments.push(obj);
    return obj;
  };

  Composition.prototype.mount = function (windowId, threadId) {
    var store = this.ctxBase.store;
    var winDef = PMX.window.get(windowId);
    var thrDef = PMX.thread.get(threadId);
    if (!winDef) throw new Error('[pmx-compose] unknown window concept: ' + windowId);
    if (!thrDef) throw new Error('[pmx-compose] unknown thread concept: ' + threadId);

    this.windowId = windowId;
    this.threadId = threadId;

    var ui = store.get('ui');

    /* Scope attributes drive all concept CSS. Theme goes on the stage container, never on
     * documentElement, so a contact sheet can render 8 themes as siblings in one document.
     *
     * `data-pmx-window` deliberately does NOT go on the stage. It marks the window concept's own
     * area — the chat host — and it is set just below, after the shell has produced that element.
     * Two things depend on that distinction:
     *
     *   1. `PMXThreadHistory.resolve()` measures the chat width with
     *      `hostEl.closest('[data-pmx-window]')`. With the attribute on the stage that measured
     *      the WHOLE STAGE, so `chatW` equalled `room` and every `minChat` floor was compared
     *      against the wrong number — a pin was suspended or allowed for the wrong reason.
     *   2. The application rail, the dashboard and the title bar are shell scenery, not Chat.
     *      With the attribute on the stage they counted as "inside the window concept", which
     *      made the notification boundary (CHAT-021: title bar only, never a Chat panel)
     *      unassertable — the title-bar inbox looked like a Chat surface to any structural test.
     *
     * Window CSS is unaffected: every `wN-` element lives inside the chat host, so
     * `[data-pmx-window="wN"] .wN-thing` still matches. */
    this.stage.setAttribute('data-pmx-thread', threadId);
    /* A theme-locked stage keeps its own theme. The contact sheet renders eight themes as
     * eight sibling stages, so a composition must not force the global theme onto a cell
     * that was deliberately pinned to a different one. */
    this.stage.setAttribute('data-theme', this._themeLock || ui.theme);
    this.stage.setAttribute('data-motion', ui.reducedMotion ? 'reduced' : 'full');
    this.stage.setAttribute('data-rail', ui.railOpen ? 'open' : 'closed');
    this.stage.setAttribute('data-mount', ui.mount);
    this.stage.style.setProperty('--pmx-chat-w', ui.chatWidth + 'px');

    /* The fake Puppet Master shell: dashboard background + left application rail.
     * Shared across all eight window concepts. Provides the chat host element. */
    this.shell = global.PMXShell.mount(this.stage, this.ctxBase);
    /* The window concept's scope marker, on the element the window concept actually fills. */
    this.shell.chatHost.setAttribute('data-pmx-window', windowId);

    var ctx = Object.create(this.ctxBase);
    ctx.windowId = windowId;
    ctx.threadId = threadId;
    ctx.capabilities = {};   // filled below, before the thread mounts

    var winInst = winDef.mount(this.shell.chatHost, ctx);
    PMX.registry.validateWindowInstance(windowId, winInst);
    this.windowInst = winInst;

    var caps = PMX.registry.capabilitiesOf(winInst);
    ctx.capabilities = caps;
    ctx.regions = winInst.regions;

    /* Shared chrome mounts into window-provided regions. The window decides WHERE;
     * these modules decide WHAT, so behavior is identical across all 8 windows. */
    this._attach(global.PMXPopup.attachRoot(winInst.regions.overlayRoot, ctx));
    this._attach(global.PMXHeaderTools.mount(winInst.regions.headerTools, ctx));
    this._attach(global.PMXComposer.mount(winInst.regions.composerHost, ctx));
    if (caps.threadHistory) {
      this._attach(global.PMXThreadHistory.mount(winInst.regions.threadHistory, ctx));
    }
    /* The artifact workspace mounts into the window's own artifactHost when it declares one,
     * and otherwise into the shell's sibling host, which sits immediately before the chat host
     * in flex order. Either way it is outside the transcript and composer, which is the part
     * that matters; where exactly it sits is the window concept's differentiator. */
    var artifactHostEl = caps.artifactHost ? winInst.regions.artifactHost : this.shell.artifactHost;
    if (artifactHostEl && global.PMXArtifactPanel) {
      this._attach(global.PMXArtifactPanel.mount(artifactHostEl, ctx));
    }

    /* Back-reference to the mounted thread, exposed on ctx so a shared service that owns no
     * scroll container of its own — search is the one that matters — can reach the contract's
     * ThreadInstance.scrollToMessage() instead of guessing at a scroll controller. It is a
     * getter rather than a value because the thread does not exist yet at this point, and a
     * captured null would never be reconsidered. */
    var selfRef = this;
    Object.defineProperty(ctx, 'thread', {
      configurable: true,
      get: function () { return selfRef.threadInst; }
    });

    var thrInst = thrDef.mount(winInst.regions.transcript, ctx);
    PMX.registry.validateThreadInstance(threadId, thrInst);
    this.threadInst = thrInst;

    winInst.setWidth(ui.chatWidth);
    winInst.setRail(ui.railOpen);
    winInst.setMount(ui.mount);

    /* Restore the scroll anchor last, after all content exists. */
    var view = store.view(store.get('session.activeThreadId'));
    if (view.anchor) {
      try { thrInst.setAnchor(view.anchor); } catch (e) { /* anchor may reference an unloaded message */ }
    }

    var self = this;
    this._unsub = store.subscribe(function (state, changed) { self._onState(state, changed); });

    return this;
  };

  Composition.prototype._onState = function (state, changed) {
    if (!this.windowInst) return;
    var touchedUi = changed.some(function (k) { return k.indexOf('ui') === 0; });
    if (touchedUi) {
      var ui = state.ui;
      /* Same rule as mount(): a theme-locked stage keeps its own theme. Omitting the lock here
       * meant the contact sheet's eight themes were correct until the Theme control was touched
       * once, after which all eight cells rendered the global theme. */
      this.stage.setAttribute('data-theme', this._themeLock || ui.theme);
      this.stage.setAttribute('data-motion', ui.reducedMotion ? 'reduced' : 'full');
      this.stage.setAttribute('data-rail', ui.railOpen ? 'open' : 'closed');
      this.stage.setAttribute('data-mount', ui.mount);
      this.stage.style.setProperty('--pmx-chat-w', ui.chatWidth + 'px');
      this.windowInst.setWidth(ui.chatWidth);
      this.windowInst.setRail(ui.railOpen);
      /* Stamping data-mount alone left every window's pop-out chrome — which keys off
       * data-wN-mount, set inside setMount() — frozen at whatever it was when the composition
       * mounted. The live workspace therefore never changed form; only the test harness did,
       * because it pairs the store write with an explicit remount(). */
      this.windowInst.setMount(ui.mount);
      if (this.shell && this.shell.setRail) this.shell.setRail(ui.railOpen);
    }
    try { this.windowInst.update(state, changed); } catch (e) { this._report(e); }
    try { this.threadInst.update(state, changed); } catch (e) { this._report(e); }
    for (var i = 0; i < this.attachments.length; i++) {
      var a = this.attachments[i];
      if (a && typeof a.update === 'function') {
        try { a.update(state, changed); } catch (e) { this._report(e); }
      }
    }
  };

  Composition.prototype._report = function (e) {
    this.lastError = e;
    if (global.console && console.error) console.error('[pmx-compose]', e);
  };

  Composition.prototype.destroy = function () {
    if (this._unsub) { this._unsub(); this._unsub = null; }
    for (var i = this.attachments.length - 1; i >= 0; i--) {
      try { this.attachments[i].destroy(); } catch (e) { this._report(e); }
    }
    this.attachments = [];
    if (this.threadInst) { try { this.threadInst.destroy(); } catch (e) { this._report(e); } this.threadInst = null; }
    if (this.windowInst) { try { this.windowInst.destroy(); } catch (e) { this._report(e); } this.windowInst = null; }
    if (this.shell) { try { this.shell.destroy(); } catch (e) { this._report(e); } this.shell = null; }
    this.stage.innerHTML = '';
  };

  /* The remount path. Semantic state is captured into the store BEFORE teardown, then the
   * whole tree is rebuilt. Nothing is carried in a closure, so nothing can silently survive
   * that should not — and everything in the store survives by construction. */
  Composition.prototype.remount = function (windowId, threadId) {
    var store = this.ctxBase.store;
    var tid = store.get('session.activeThreadId');

    if (this.threadInst) {
      try {
        var anchor = this.threadInst.getAnchor();
        if (anchor) store.view(tid).anchor = anchor;
      } catch (e) { /* a thread with nothing rendered yet has no anchor */ }
    }

    var nextWindow = windowId || this.windowId;
    var nextThread = threadId || this.threadId;

    this.destroy();
    return this.mount(nextWindow, nextThread);
  };

  global.PMXCompose = {
    create: function (stageEl, ctxBase) { return new Composition(stageEl, ctxBase); }
  };
})(window);
