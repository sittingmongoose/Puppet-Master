/* w7 "Two-Rail" — Opus 5
 *
 * An ultra-thin 44px icon rail on the CHAT'S OWN left edge, distinct from and visually
 * subordinate to the fake application rail further left. Selecting an entry opens an overlay
 * column that borrows width from the transcript only while it is open.
 *
 * The design risk this concept exists to test: can two rails coexist without reading as a
 * mistake? The answer here is hierarchy — this one is thinner, quieter, unlabelled, and
 * clearly inside the chat surface rather than beside it.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  var MIN_W = 520, MAX_W = 1200;

  var ENTRIES = [
    { id: 'history', icon: 'thread', label: 'Conversations' },
    { id: 'work', icon: 'layers', label: 'Work surfaces' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'lens', icon: 'lens', label: 'Context Lens' }
  ];

  function W7Window(root, ctx) {
    this.root = root;
    this.ctx = ctx;
    this.offs = [];
    this.open = null;
    this.pinned = false;
    this.build();
  }

  W7Window.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };

  W7Window.prototype.build = function () {
    var self = this;
    var u = U();
    var icons = this.ctx.services.icons;

    this.shell = u.el('div', { class: 'w7-shell', data: { pmxWindow: 'w7', open: '' } });

    /* The chat's own rail. No text labels at any width — that is the hierarchy signal that
     * separates it from the application rail, which does carry labels when open. */
    this.rail = u.el('div', { class: 'w7-rail' });
    this.railBtns = {};
    ENTRIES.forEach(function (e) {
      var b = u.el('button', { class: 'w7-railbtn', data: { entry: e.id }, aria: { label: e.label } });
      b.title = e.label;
      b.appendChild(icons.get(e.icon, 16));
      self._on(b, 'click', function () { self.toggle(e.id); });
      self.railBtns[e.id] = b;
      self.rail.appendChild(b);
    });
    this.shell.appendChild(this.rail);

    /* The overlay column. */
    this.column = u.el('div', { class: 'w7-column' });
    this.colHead = u.el('div', { class: 'w7-col-head' });
    this.colTitle = u.el('span', { class: 'w7-col-title' });
    this.pinBtn = u.el('button', { class: 'w7-col-pin', aria: { label: 'Pin open' } });
    this.pinBtn.title = 'Pin open';
    this.pinBtn.appendChild(icons.get('pin', 13));
    this._on(this.pinBtn, 'click', function () { self.togglePin(); });
    var closeBtn = u.el('button', { class: 'w7-col-close', aria: { label: 'Close' } });
    closeBtn.appendChild(icons.get('close', 13));
    this._on(closeBtn, 'click', function () { self.toggle(null); });
    this.colHead.appendChild(this.colTitle);
    this.colHead.appendChild(this.pinBtn);
    this.colHead.appendChild(closeBtn);
    this.column.appendChild(this.colHead);

    this.historyHost = u.el('div', { class: 'w7-col-body pmx-scroll', data: { pmxRegion: 'threadHistory' } });
    this.workHost = u.el('div', { class: 'w7-col-body pmx-scroll', data: { pmxRegion: 'workSurfaceHost' } });
    this.noteHost = u.el('div', { class: 'w7-col-body pmx-scroll' });
    this.column.appendChild(this.historyHost);
    this.column.appendChild(this.workHost);
    this.column.appendChild(this.noteHost);
    this.shell.appendChild(this.column);
    /* Artifact workspace: a persistent left column OUTSIDE the 44px inner rail, which grows a third
     * icon for it. Rail icons are mutually exclusive, so opening the artifact leaves pinned history
     * in its compact 72px rail rather than fighting for the borrowed column. */
    this.artifactBody = u.el('div', { class: 'w7-artifact-body', data: { pmxRegion: 'artifactHost' } });
    this.artifactHost = u.el('div', { class: 'w7-artifact-host' }, [this.artifactBody]);
    this.shell.appendChild(this.artifactHost);

    /* Main area. */
    this.main = u.el('div', { class: 'w7-main' });
    this.header = u.el('div', { class: 'w7-header' }, [
      u.el('span', { class: 'w7-brand' }, [
        u.el('span', { class: 'w7-brand-name', text: 'Two-Rail' }),
        u.el('span', { class: 'w7-brand-model', text: this.ctx.label })
      ])
    ]);
    this.tools = u.el('div', { class: 'w7-tools', data: { pmxRegion: 'headerTools' } });
    this.header.appendChild(this.tools);
    this.main.appendChild(this.header);

    this.transcript = u.el('div', { class: 'w7-transcript pmx-scroll', data: { pmxRegion: 'transcript' } });
    this.main.appendChild(this.transcript);

    /* A question renders inline above the composer, never behind a rail or column. */
    this.questionHost = u.el('div', { class: 'w7-question', data: { pmxRegion: 'questionHost' } });
    this.main.appendChild(this.questionHost);

    this.composerHost = u.el('div', { class: 'w7-composer', data: { pmxRegion: 'composerHost' } });
    this.main.appendChild(this.composerHost);

    this.shell.appendChild(this.main);
    this.root.appendChild(this.shell);

    this.overlay = u.el('div', { class: 'w7-overlay', data: { pmxWindow: 'w7', pmxRegion: 'overlayRoot' } });
    this.root.appendChild(this.overlay);

    /* The artifact service keeps its state outside the store's per-thread view, so it needs
     * its own subscription rather than a store change key. */
    if (global.PMXArtifacts && global.PMXArtifacts.subscribe) {
      this._artOff = global.PMXArtifacts.subscribe(function () { self.syncArtifact(); });
    }
    this.syncArtifact();

    this.syncColumn();
  };

  W7Window.prototype.toggle = function (id) {
    if (this.open === id) { this.open = null; }
    else { this.open = id; }

    if (this.open === 'search') {
      this.ctx.services.search.openPopup(this.railBtns.search, this.ctx);
      this.open = null;
    } else if (this.open === 'lens') {
      this.ctx.services.toast.show('Context Lens is in the header tools of this concept');
      this.open = null;
    }
    this.syncColumn();
  };

  /* Pin state moved onto the shared store. It was local to this window, which meant
   * pinning here said nothing about pinning anywhere else and the concept could not
   * participate in the workspace-wide behaviour. */
  W7Window.prototype.togglePin = function () {
    var TH = global.PMXThreadHistory;
    if (TH && TH.togglePin) TH.togglePin(this.ctx);
    if (this.open !== 'history') this.open = 'history';
    this.syncColumn();
  };

  W7Window.prototype.syncColumn = function () {
    var TH = global.PMXThreadHistory;
    /* `compactColumn: 72`: the compact form IS the inner rail grown from 44px to 72px, so the
     * floor is the grown rail rather than a separate column. */
    var r = TH
      ? TH.applyTo(this.historyHost, TH.resolve(this.ctx, this.historyHost, TH.floorsFor('w7')))
      : { state: 'closed', effective: 'closed', reason: null };
    if (TH) TH.reasonNode(this.historyHost, r);
    var pin = { asked: r.state === 'pinned', active: r.effective === 'pinned-full',
                compact: r.effective === 'pinned-compact', effective: r.effective };
    if (this.shell) this.shell.setAttribute('data-w7-history', r.effective);
    this.pinned = pin.asked;

    /* A pinned column outlives an explicit close: the rail button still toggles the
     * panel, but the pin is what keeps it from evaporating on a thread switch. */
    var open = pin.active ? 'history' : this.open;
    this.open = open;

    this.shell.setAttribute('data-open', open || '');
    this.shell.setAttribute('data-pinned', pin.active ? '1' : '0');
    if (TH && TH.syncPinButton) TH.syncPinButton(this.pinBtn, pin.asked);
    var hist = this.historyHost.querySelector('.pmx-chrome-history');
    if (hist) hist.setAttribute('data-pmx-docked', pin.active ? '1' : '0');

    for (var id in this.railBtns) {
      this.railBtns[id].setAttribute('aria-pressed', id === open ? 'true' : 'false');
    }

    this.historyHost.style.display = open === 'history' ? '' : 'none';
    this.workHost.style.display = open === 'work' ? '' : 'none';
    this.noteHost.style.display = 'none';

    if (open === 'history') this.colTitle.textContent = 'Conversations';
    else if (open === 'work') this.colTitle.textContent = 'Work surfaces';
    else this.colTitle.textContent = '';
  };

  W7Window.prototype.setWidth = function (px) {
    this.shell.style.width = U().clamp(Number(px) || MIN_W, MIN_W, MAX_W) + 'px';
  };
  /* The application rail is the shell's, not this window's. Chat width and application-rail
   * width remain independent even though this concept has a rail of its own. */
  W7Window.prototype.setRail = function (open) { this.shell.setAttribute('data-rail', open ? 'open' : 'closed'); };
  W7Window.prototype.setMount = function (f) {
    /* pin: re-evaluate once the regions exist, so the docked flag lands on
     * the history root the shared module just rendered. */
    if (this.syncColumn) this.syncColumn(); this.shell.setAttribute('data-w7-mount', f === 'popout' ? 'popout' : 'docked'); };

  /* The specific key is tested BEFORE the generic prefix. It was the other way round, and
   * `'session.activeThreadId'.indexOf('session')` is 0 — so the generic branch always returned
   * first and the "close the borrowed history column when the thread changes" rule was dead code.
   * A borrowed column that survives a thread switch keeps covering the conversation the user just
   * asked to read. */
  W7Window.prototype.update = function (state, changed) {
    var sessionTouched = false;
    for (var i = 0; i < changed.length; i++) {
      var k = String(changed[i]);
      if (k === 'session.activeThreadId' && this.open === 'history' && !this.pinned) {
        this.open = null;
        this.syncColumn();
        return;
      }
      if (k.indexOf('session') === 0) sessionTouched = true;
    }
    if (sessionTouched) this.syncColumn();
  };


  /* ---------------------------------------------------------------- artifact frame
   * The window owns PLACEMENT and the SWITCHER; the shared panel renders the body. */
  W7Window.prototype.syncArtifact = function () {
    var A = global.PMXArtifacts;
    if (!A) return;
    var open = A.isOpen();
    var activeId = A.activeId();
    this.shell.setAttribute('data-w7-artifact', open ? '1' : '0');

    /* A third rail icon opens a long-list popup. The rail is this concept's only navigation surface,
     * so the artifact joins it rather than growing a header somewhere else. */
    var u = U();
    if (!this.artifactRailBtn && this.rail) {
      var self0 = this;
      this.artifactRailBtn = u.el('button', {
        class: 'w7-rail-btn', type: 'button',
        aria: { label: 'Artifacts', haspopup: 'menu' }
      }, [this.ctx.services.icons.get('artifact', 16)]);
      u.on(this.artifactRailBtn, 'click', function (ev) { self0.openArtifactList(ev.currentTarget); });
      this.rail.appendChild(this.artifactRailBtn);
    }
    if (this.artifactRailBtn) this.artifactRailBtn.setAttribute('aria-pressed', open ? 'true' : 'false');
  };

  /* The rail's long-list popup. Rail icons are mutually exclusive by design, so opening this closes
   * the borrowed history column and leaves pinned history in its compact 72px rail. */
  W7Window.prototype.openArtifactList = function (anchor) {
    var A = global.PMXArtifacts;
    var u = U();
    var self = this;
    if (!A) return null;
    return this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'list', width: 260,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Artifacts' }));
        A.list().forEach(function (a) {
          var row = u.el('button', { class: 'pmx-popup-item' }, [
            u.el('span', { class: 'pmx-popup-item-label', text: a.title }),
            u.el('span', { class: 'pmx-popup-item-hint', text: a.subtitle || '' })
          ]);
          u.on(row, 'click', function () { A.open(a.id); api.close(); self.syncArtifact(); });
          host.appendChild(row);
        });
      }
    });
  };

  W7Window.prototype.destroy = function () {
    if (this._artOff) { try { this._artOff(); } catch (e) {} this._artOff = null; }
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  };

  global.PMX.window.register('w7', {
    name: 'Two-Rail',
    blurb: 'A deliberately thin icon rail inside the chat opens overlay columns that borrow width only while they are open, so history and work surfaces are one click away without ever holding space.',
    provides: ['threadHistory', 'workSurfaceHost', 'questionHost', 'artifactHost'],
    mount: function (root, ctx) {
      var inst = new W7Window(root, ctx);
      return {
        regions: {
          transcript: inst.transcript,
          composerHost: inst.composerHost,
          headerTools: inst.tools,
          overlayRoot: inst.overlay,
          threadHistory: inst.historyHost,
          workSurfaceHost: inst.workHost,
          questionHost: inst.questionHost,
          artifactHost: inst.artifactBody
        },
        setWidth: function (px) { inst.setWidth(px); },
        setRail: function (o) { inst.setRail(o); },
        setMount: function (f) { inst.setMount(f); },
        update: function (s, c) { inst.update(s, c); },
        destroy: function () { inst.destroy(); }
      };
    }
  });
})(window);
