/* w6 "Docked Sheets" — Opus 5
 *
 * The transcript is the base layer and every secondary surface arrives as a bottom sheet
 * with three snap points: peek, half, and full. Only one sheet is open at a time and it is
 * draggable between snaps. Above ~980px sheets promote to a side panel instead, so the
 * concept reads as a phone at narrow width and a desktop at wide width.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  var MIN_W = 520, MAX_W = 1200;
  /* `rail` is the compact PINNED detent: tall enough to monitor a column of thread status
   * glyphs, short enough that the transcript keeps its height. It is deliberately not a
   * drag target — dragging moves between peek/half/full, and the rail is reached by asking
   * for a compact pin. */
  var SNAPS = { rail: 64, peek: 56, half: 0.5, full: 0.88 };

  function W6Window(root, ctx) {
    this.root = root;
    this.ctx = ctx;
    this.offs = [];
    this.sheet = null;      /* 'history' | 'work' | null */
    this.snap = 'peek';
    this.build();
  }

  W6Window.prototype._on = function (el, ev, fn, opts) { this.offs.push(U().on(el, ev, fn, opts)); };

  W6Window.prototype.build = function () {
    var self = this;
    var u = U();
    var icons = this.ctx.services.icons;

    this.shell = u.el('div', { class: 'w6-shell', data: { pmxWindow: 'w6', sheet: '', snap: 'peek' } });

    this.header = u.el('div', { class: 'w6-header' });
    this.header.appendChild(u.el('span', { class: 'w6-brand' }, [
      u.el('span', { class: 'w6-brand-name', text: 'Docked Sheets' }),
      u.el('span', { class: 'w6-brand-model', text: this.ctx.label })
    ]));
    this.tools = u.el('div', { class: 'w6-tools', data: { pmxRegion: 'headerTools' } });
    this.header.appendChild(this.tools);
    this.shell.appendChild(this.header);

    this.transcript = u.el('div', { class: 'w6-transcript pmx-scroll', data: { pmxRegion: 'transcript' } });
    this.shell.appendChild(this.transcript);
    /* Artifact workspace: a left docked column at >=980px, and a `full`-detent SHEET below it —
     * the only concept where the artifact becomes a sheet, because sheets are this concept's
     * entire vocabulary. Switcher is the existing .w6-tabs sheet tab row. */
    this.artifactBody = u.el('div', { class: 'w6-artifact-body', data: { pmxRegion: 'artifactHost' } });
    this.artifactHost = u.el('div', { class: 'w6-artifact-host' }, [this.artifactBody]);
    this.shell.appendChild(this.artifactHost);

    this.questionHost = u.el('div', { class: 'w6-question', data: { pmxRegion: 'questionHost' } });
    this.shell.appendChild(this.questionHost);

    this.composerHost = u.el('div', { class: 'w6-composer', data: { pmxRegion: 'composerHost' } });
    this.shell.appendChild(this.composerHost);

    /* The sheet. Its handle is a real drag target; snapping is discrete. */
    this.sheetEl = u.el('div', { class: 'w6-sheet' });
    this.handle = u.el('div', { class: 'w6-handle' }, [u.el('span', { class: 'w6-grip' })]);
    this.sheetTitle = u.el('span', { class: 'w6-sheet-title' });
    var closeBtn = u.el('button', { class: 'w6-sheet-close', aria: { label: 'Close sheet' } });
    closeBtn.appendChild(icons.get('close', 13));
    this._on(closeBtn, 'click', function () {
      /* Closing releases the pin, or the sheet would spring straight back. */
      global.PMXThreadHistory.setState(self.ctx, 'closed');
      self.openSheet(null);
    });
    /* Pinning a sheet means locking it at its half detent: a peeking sheet is not
     * monitoring anything, and a full sheet has swallowed the conversation. */
    this.pinBtn = global.PMXThreadHistory.pinButton(this.ctx, 'w6-sheet-pin', function (on) {
      if (on) { self.sheet = 'history'; self.setSnap('half'); }
      self.sync();
    });
    var head = u.el('div', { class: 'w6-sheet-head' }, [this.sheetTitle, this.pinBtn, closeBtn]);

    this.historyHost = u.el('div', { class: 'w6-sheet-body pmx-scroll', data: { pmxRegion: 'threadHistory' } });
    this.workHost = u.el('div', { class: 'w6-sheet-body pmx-scroll', data: { pmxRegion: 'workSurfaceHost' } });

    this.sheetEl.appendChild(this.handle);
    this.sheetEl.appendChild(head);
    this.sheetEl.appendChild(this.historyHost);
    this.sheetEl.appendChild(this.workHost);
    this.shell.appendChild(this.sheetEl);

    /* Two tabs pick which sheet is open. */
    this.tabs = u.el('div', { class: 'w6-tabs' });
    [['history', 'thread', 'Conversations'], ['work', 'layers', 'Work']].forEach(function (t) {
      var b = u.el('button', { class: 'w6-tab', data: { sheet: t[0] }, aria: { label: t[2] } });
      b.title = t[2];
      b.appendChild(icons.get(t[1], 13));
      b.appendChild(u.el('span', { class: 'w6-tab-label', text: t[2] }));
      self._on(b, 'click', function () { self.openSheet(t[0]); });
      self.tabs.appendChild(b);
    });
    this.shell.appendChild(this.tabs);

    this.root.appendChild(this.shell);

    this.overlay = u.el('div', { class: 'w6-overlay', data: { pmxWindow: 'w6', pmxRegion: 'overlayRoot' } });
    this.root.appendChild(this.overlay);

    /* The artifact service keeps its state outside the store's per-thread view, so it needs
     * its own subscription rather than a store change key. */
    if (global.PMXArtifacts && global.PMXArtifacts.subscribe) {
      this._artOff = global.PMXArtifacts.subscribe(function () { self.syncArtifact(); });
    }
    this.syncArtifact();

    this.wireDrag();
    this.sync();
  };

  W6Window.prototype.wireDrag = function () {
    var self = this;
    var startY = 0, startH = 0, dragging = false;

    this._on(this.handle, 'pointerdown', function (ev) {
      if (!self.sheet) return;
      dragging = true;
      startY = ev.clientY;
      startH = self.sheetEl.getBoundingClientRect().height;
      try { self.handle.setPointerCapture(ev.pointerId); } catch (e) {}
      self.sheetEl.setAttribute('data-dragging', '1');
    });

    /* Bound to the handle, not to document, so eight instances on one contact sheet never
     * fight each other for pointermove. */
    this._on(this.handle, 'pointermove', function (ev) {
      if (!dragging) return;
      var h = startH + (startY - ev.clientY);
      var max = self.shell.getBoundingClientRect().height;
      self.sheetEl.style.height = Math.max(SNAPS.peek, Math.min(h, max * SNAPS.full)) + 'px';
    });

    function end(ev) {
      if (!dragging) return;
      dragging = false;
      self.sheetEl.removeAttribute('data-dragging');
      try { self.handle.releasePointerCapture(ev.pointerId); } catch (e) {}
      /* A drag ALWAYS lands on a snap point, including under reduced motion. */
      var h = self.sheetEl.getBoundingClientRect().height;
      var max = self.shell.getBoundingClientRect().height;
      var half = max * SNAPS.half, full = max * SNAPS.full;
      var next = 'peek';
      if (h > (half + full) / 2) next = 'full';
      else if (h > (SNAPS.peek + half) / 2) next = 'half';
      self.sheetEl.style.height = '';
      self.setSnap(next);
    }
    this._on(this.handle, 'pointerup', end);
    this._on(this.handle, 'pointercancel', end);
  };

  W6Window.prototype.setSnap = function (snap) {
    this.snap = snap;
    this.shell.setAttribute('data-snap', snap);
  };

  W6Window.prototype.openSheet = function (kind) {
    if (this.sheet === kind) { this.sheet = null; }
    else { this.sheet = kind; if (this.snap === 'peek') this.setSnap('half'); }
    this.sync();
  };

  /* Docked Sheets thinks in detents, so its compact pinned form is a detent too: a 64px rail
   * rather than the 300px side panel. Its minStageForFull stays lower than the other concepts'
   * because a sheet promotes to a reserved grid track at 980px, not a borrowed column. */

  /* The sheet is absolutely positioned, so it has to be told where the bottom of the
   * conversation actually is. Both the composer and the question host grow with content. */
  W6Window.prototype.syncReserve = function () {
    var h = 0;
    if (this.composerHost) h += this.composerHost.offsetHeight || 0;
    if (this.questionHost) h += this.questionHost.offsetHeight || 0;
    this.shell.style.setProperty('--w6-reserve', h + 'px');
  };

  W6Window.prototype.sync = function () {
    var TH = global.PMXThreadHistory;
    var r = TH.applyTo(this.historyHost, TH.resolve(this.ctx, this.historyHost, TH.floorsFor('w6')));
    TH.reasonNode(this.historyHost, r);
    var pinActive = r.effective === 'pinned-full' || r.effective === 'pinned-compact';

    if (pinActive) {
      /* Honour the pin by holding the sheet open. The snap machinery is untouched — the user
       * can still drag — but nothing else closes it. A compact pin holds the rail detent
       * rather than half, so the transcript keeps its height. */
      this.sheet = 'history';
      var want = r.effective === 'pinned-compact' ? 'rail' : 'half';
      if (this.snap === 'peek' || (r.effective === 'pinned-compact' && this.snap === 'half')) this.snap = want;
      this.shell.setAttribute('data-snap', this.snap);
    }
    this.shell.setAttribute('data-pinned', pinActive ? '1' : '0');
    this.shell.setAttribute('data-w6-history', r.effective);
    TH.syncPinButton(this.pinBtn, r);
    this.syncReserve();

    /* The sheet is absolutely positioned, so it only knows where the bottom of the conversation is
     * because syncReserve() measures it. Both the composer and the question host GROW with content,
     * and nothing re-measured on growth: a three-line draft pushed the composer up under a sheet
     * that stayed put, so the sheet covered the field being typed into. A ResizeObserver on both
     * hosts is the only signal that fires for content-driven growth. */
    if (global.ResizeObserver) {
      var self6 = this;
      this._ro = new global.ResizeObserver(function () { self6.syncReserve(); });
      if (this.composerHost) this._ro.observe(this.composerHost);
      if (this.questionHost) this._ro.observe(this.questionHost);
    }
    var histRoot = this.historyHost.querySelector('.pmx-chrome-history');
    if (histRoot) {
      histRoot.setAttribute('data-pmx-docked', pinActive ? '1' : '0');
      histRoot.setAttribute('data-pmx-density', r.effective === 'pinned-compact' ? 'compact' : 'full');
    }

    this.shell.setAttribute('data-sheet', this.sheet || '');
    this.sheetEl.style.height = '';
    this.historyHost.style.display = this.sheet === 'history' ? '' : 'none';
    this.workHost.style.display = this.sheet === 'work' ? '' : 'none';
    this.sheetTitle.textContent = this.sheet === 'history' ? 'Conversations'
      : (this.sheet === 'work' ? 'Work surfaces' : '');
    var kids = this.tabs.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].setAttribute('aria-pressed', kids[i].getAttribute('data-sheet') === this.sheet ? 'true' : 'false');
    }
  };

  W6Window.prototype.setWidth = function (px) {
    this.shell.style.width = U().clamp(Number(px) || MIN_W, MIN_W, MAX_W) + 'px';
    /* The pin tier resolves against the chat's own width, so a width change can promote or
     * demote it. Without this the sheet held whatever tier it had when the window mounted. */
    if (this.sheetEl) this.sync();
  };
  W6Window.prototype.setRail = function (o) { this.shell.setAttribute('data-rail', o ? 'open' : 'closed'); };
  W6Window.prototype.setMount = function (f) {
    /* pin: re-evaluate once the regions exist, so the docked flag lands on
     * the history root the shared module just rendered. */
    if (this.sync) this.sync(); this.shell.setAttribute('data-w6-mount', f === 'popout' ? 'popout' : 'docked'); };

  W6Window.prototype.update = function (state, changed) {
    for (var i = 0; i < changed.length; i++) {
      /* A pinned sheet survives a thread switch — that is the entire point of pinning it
       * when you are watching several threads. This test has to come BEFORE the generic
       * session branch: 'session.activeThreadId'.indexOf('session') is 0, so the generic
       * branch always returned first and this rule was unreachable dead code. */
      if (changed[i] === 'session.activeThreadId' && this.sheet === 'history'
          && global.PMXThreadHistory.readState(this.ctx) !== 'pinned') {
        this.openSheet(null);
        return;
      }
      if (changed[i].indexOf('session') === 0) { this.sync(); return; }
      /* A questionnaire needs the floor, so an open sheet steps back to peek. */
      if (changed[i].indexOf('view') === 0 && this.sheet && this.questionHost.childNodes.length) {
        this.setSnap('peek');
        return;
      }
    }
  };


  /* ---------------------------------------------------------------- artifact frame
   * The window owns PLACEMENT and the SWITCHER; the shared panel renders the body. */
  W6Window.prototype.syncArtifact = function () {
    var A = global.PMXArtifacts;
    if (!A) return;
    var open = A.isOpen();
    var activeId = A.activeId();
    this.shell.setAttribute('data-w6-artifact', open ? '1' : '0');

    /* The existing sheet tab row is the switcher. Reusing .w6-tabs is the point: an artifact is
     * another sheet in this concept, so it is switched the way sheets are switched. */
    if (!this.tabs) return;
    var u = U();
    var existing = this.tabs.querySelector('.w6-artifact-tabs');
    if (existing) this.tabs.removeChild(existing);
    if (!open) return;
    var holder = u.el('span', { class: 'w6-artifact-tabs' });
    var self = this;
    A.list().forEach(function (a) {
      var b = u.el('button', {
        class: 'w6-tab', type: 'button',
        aria: { pressed: a.id === activeId ? 'true' : 'false' }
      }, [u.el('span', { text: a.title })]);
      u.on(b, 'click', function () { A.switchTo(a.id); });
      holder.appendChild(b);
    });
    this.tabs.appendChild(holder);
  };

  W6Window.prototype.destroy = function () {
    if (this._ro) { try { this._ro.disconnect(); } catch (e) {} this._ro = null; }
    if (this._artOff) { try { this._artOff(); } catch (e) {} this._artOff = null; }
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  };

  global.PMX.window.register('w6', {
    name: 'Docked Sheets',
    blurb: 'Every secondary surface arrives as a bottom sheet with peek, half, and full snap points, so the transcript is never permanently divided and the concept reads as a phone at narrow width and a desktop when wide.',
    provides: ['threadHistory', 'workSurfaceHost', 'questionHost', 'artifactHost'],
    mount: function (root, ctx) {
      var inst = new W6Window(root, ctx);
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
