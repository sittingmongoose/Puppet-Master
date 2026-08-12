/* w2 "Split Desk" — Opus 5
 *
 * Thread history costs HEIGHT, not width. It is a single horizontal strip of thread chips
 * across the top, so the transcript keeps the full chat width beneath it.
 *
 * Work surfaces live in a right-edge rail only when the chat is wide enough to spare the
 * width; below that they collapse into an inline sheet above the composer. That makes w2
 * the concept whose shape visibly changes across the four width presets, which is the point
 * of having it in the set.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  var MIN_W = 520, MAX_W = 1200;

  function W2Window(root, ctx) {
    this.root = root;
    this.ctx = ctx;
    this.offs = [];
    this.build();
  }

  W2Window.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };

  W2Window.prototype.build = function () {
    var self = this;
    var u = U();
    var icons = this.ctx.services.icons;

    this.shell = u.el('div', { class: 'w2-shell', data: { pmxWindow: 'w2' } });

    /* --- top strip: history as one scrolling row of chips --- */
    this.strip = u.el('div', { class: 'w2-strip' });

    this.filterWrap = u.el('div', { class: 'w2-filter' });
    this.filter = u.el('input', {
      class: 'w2-filter-input', type: 'search', placeholder: 'Filter threads',
      aria: { label: 'Filter threads' }
    });
    this.filterWrap.appendChild(icons.get('search', 13));
    this.filterWrap.appendChild(this.filter);
    this.strip.appendChild(this.filterWrap);

    /* The region the shared thread-history module renders into. It is a horizontal
     * scroller, which is deliberate and therefore exempt from the overflow assertion. */
    this.chips = u.el('div', {
      class: 'w2-chips pmx-scroll',
      data: { pmxRegion: 'threadHistory' }
    });
    this.strip.appendChild(this.chips);

    this._on(this.filter, 'input', function () {
      self.ctx.store.set('session.threadHistory.query', self.filter.value);
    });

    /* This concept already keeps history permanently visible — as a strip that costs
     * HEIGHT. Pinning here therefore means something different from the other seven:
     * it converts that trade from height to width, turning the chip row into a
     * column, which is what you want when you are reading several threads' states
     * rather than glancing at one. */
    this.pinBtn = global.PMXThreadHistory.pinButton(this.ctx, 'w2-strip-pin', function () {
      self.syncPin();
    });
    this.filterWrap.appendChild(this.pinBtn);

    this.shell.appendChild(this.strip);

    /* --- header row --- */
    this.header = u.el('div', { class: 'w2-header' });
    this.brand = u.el('div', { class: 'w2-brand' }, [
      u.el('span', { class: 'w2-brand-name', text: 'Split Desk' }),
      u.el('span', { class: 'w2-brand-sep', text: '·' }),
      u.el('span', { class: 'w2-brand-model', text: this.ctx.label })
    ]);
    this.header.appendChild(this.brand);
    this.tools = u.el('div', { class: 'w2-tools', data: { pmxRegion: 'headerTools' } });
    this.header.appendChild(this.tools);
    this.shell.appendChild(this.header);

    /* --- body: transcript, with the work rail beside it when width allows --- */
    this.body = u.el('div', { class: 'w2-body' });
    this.transcript = u.el('div', {
      class: 'w2-transcript pmx-scroll',
      data: { pmxRegion: 'transcript' }
    });
    this.body.appendChild(this.transcript);

    this.rail = u.el('div', { class: 'w2-rail pmx-scroll' });
    this.railHead = u.el('div', { class: 'w2-rail-head' }, [
      u.el('span', { class: 'w2-rail-title', text: 'Work' })
    ]);
    this.rail.appendChild(this.railHead);
    this.surfaceHost = u.el('div', { class: 'w2-surface-host', data: { pmxRegion: 'workSurfaceHost' } });
    this.rail.appendChild(this.surfaceHost);
    this.body.appendChild(this.rail);

    this.shell.appendChild(this.body);
    /* Artifact workspace: the LEFT grid column of .w2-shell. The chip strip continues to span
     * full width above it, which is the whole reason this concept can host an artifact without
     * competing for width — its history costs height, not width, so the artifact gets the column.
     * Switcher is a desk tab row across the artifact head. */
    this.artifactSwitch = u.el('div', { class: 'w2-artifact-tabs' });
    this.artifactBody = u.el('div', { class: 'w2-artifact-body', data: { pmxRegion: 'artifactHost' } });
    this.artifactHost = u.el('div', { class: 'w2-artifact-host' }, [this.artifactSwitch, this.artifactBody]);
    this.shell.appendChild(this.artifactHost);

    /* --- question host sits above the composer, never behind anything --- */
    this.questionHost = u.el('div', { class: 'w2-question', data: { pmxRegion: 'questionHost' } });
    this.shell.appendChild(this.questionHost);

    this.composerHost = u.el('div', { class: 'w2-composer', data: { pmxRegion: 'composerHost' } });
    this.shell.appendChild(this.composerHost);

    this.root.appendChild(this.shell);
    this.syncPin();

    /* overlayRoot is a SIBLING of the shell, deliberately outside every scroller and
     * transformed ancestor, so popups are never clipped and never mispositioned. */
    this.overlay = u.el('div', {
      class: 'w2-overlay',
      data: { pmxWindow: 'w2', pmxRegion: 'overlayRoot' }
    });
    this.root.appendChild(this.overlay);

    /* The artifact service keeps its state outside the store's per-thread view, so it needs
     * its own subscription rather than a store change key. */
    if (global.PMXArtifacts && global.PMXArtifacts.subscribe) {
      this._artOff = global.PMXArtifacts.subscribe(function () { self.syncArtifact(); });
    }
    this.syncArtifact();
  };

  W2Window.prototype.syncPin = function () {
    var TH = global.PMXThreadHistory;
    /* Four-state resolution with this concept's own floors. `compactColumn: 0` is deliberate:
     * the compact form here is a two-row wrapping chip strip, which costs HEIGHT and no width
     * at all, so demanding horizontal room for it would suspend a pin that fits perfectly. */
    var r = TH.applyTo(this.chips, TH.resolve(this.ctx, this.chips, TH.floorsFor('w2')));
    TH.reasonNode(this.chips, r);
    var pin = { asked: r.state === 'pinned', active: r.effective === 'pinned-full',
                compact: r.effective === 'pinned-compact', effective: r.effective };
    this.shell.setAttribute('data-w2-history', r.effective);
    this.shell.setAttribute('data-w2-pinned', pin.active ? '1' : '0');
    TH.syncPinButton(this.pinBtn, pin.asked);
    var histRoot = this.chips.querySelector('.pmx-chrome-history');
    if (histRoot) histRoot.setAttribute('data-pmx-docked', pin.active ? '1' : '0');
  };

  W2Window.prototype.setWidth = function (px) {
    var w = U().clamp(Number(px) || MIN_W, MIN_W, MAX_W);
    this.shell.style.width = w + 'px';
    /* The rail/sheet switch is driven by a container query in CSS, not by this number —
     * the same concept renders at eight sizes in one document on a contact sheet, so a JS
     * width read would be wrong for seven of them. */
  };

  W2Window.prototype.setRail = function (open) {
    /* The application rail belongs to the shell. Chat width and rail width are independent
     * axes; this is recorded as inspectable state, not silently ignored. */
    this.shell.setAttribute('data-rail', open ? 'open' : 'closed');
  };

  W2Window.prototype.setMount = function (form) {
    /* pin: re-evaluate once the regions exist, so the docked flag lands on
     * the history root the shared module just rendered. */
    if (this.syncPin) this.syncPin();
    this.shell.setAttribute('data-w2-mount', form === 'popout' ? 'popout' : 'docked');
  };

  /* ONE scan over changed keys. There were two identical `indexOf('session') === 0` loops here,
   * one for the pin and one for the filter, walking the same array for the same answer — a second
   * pass that could only ever agree with the first. */
  W2Window.prototype.update = function (state, changed) {
    var touched = false;
    for (var i = 0; i < changed.length; i++) {
      if (String(changed[i]).indexOf('session') === 0) { touched = true; break; }
    }
    if (!touched) return;
    this.syncPin();
    var q = state.session.threadHistory ? (state.session.threadHistory.query || '') : '';
    if (this.filter.value !== q) this.filter.value = q;
  };


  /* ---------------------------------------------------------------- artifact frame
   * The window owns PLACEMENT and the SWITCHER; the shared panel renders the body. */
  W2Window.prototype.syncArtifact = function () {
    var A = global.PMXArtifacts;
    if (!A) return;
    var open = A.isOpen();
    var activeId = A.activeId();
    this.shell.setAttribute('data-w2-artifact', open ? '1' : '0');

    /* Desk tabs: this concept already speaks in tabs, so the artifact switcher is a tab row rather
     * than a new control vocabulary. */
    var u = U();
    u.empty(this.artifactSwitch);
    if (!open) return;
    var self = this;
    A.list().forEach(function (a) {
      var tab = u.el('button', {
        class: 'w2-artifact-tab', type: 'button',
        aria: { pressed: a.id === activeId ? 'true' : 'false' }
      }, [u.el('span', { text: a.title })]);
      u.on(tab, 'click', function () { A.switchTo(a.id); });
      self.artifactSwitch.appendChild(tab);
    });
  };

  W2Window.prototype.destroy = function () {
    if (this._artOff) { try { this._artOff(); } catch (e) {} this._artOff = null; }
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  };

  global.PMX.window.register('w2', {
    name: 'Split Desk',
    blurb: 'Thread history becomes a horizontal strip of chips so it costs height instead of width, and work surfaces occupy a right rail only when the chat is wide enough to spare it.',
    provides: ['threadHistory', 'workSurfaceHost', 'questionHost', 'artifactHost'],
    mount: function (root, ctx) {
      var inst = new W2Window(root, ctx);
      return {
        regions: {
          transcript: inst.transcript,
          composerHost: inst.composerHost,
          headerTools: inst.tools,
          overlayRoot: inst.overlay,
          threadHistory: inst.chips,
          workSurfaceHost: inst.surfaceHost,
          questionHost: inst.questionHost,
          artifactHost: inst.artifactBody
        },
        setWidth: function (px) { inst.setWidth(px); },
        setRail: function (open) { inst.setRail(open); },
        setMount: function (form) { inst.setMount(form); },
        update: function (s, c) { inst.update(s, c); },
        destroy: function () { inst.destroy(); }
      };
    }
  });
})(window);
