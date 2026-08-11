/* w8 "Frameless" — Opus 5
 *
 * No window chrome at all. The transcript runs edge to edge, top to bottom. A floating
 * header capsule and a floating composer capsule hover over it; the header auto-hides on
 * scroll down and returns on scroll up.
 *
 * This is the maximum-transcript extreme of the set. It provides NEITHER threadHistory NOR
 * workSurfaceHost, which makes it the strongest test that a thread module renders its work
 * surfaces inline when no host region exists.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  var MIN_W = 520, MAX_W = 1200;

  function W8Window(root, ctx) {
    this.root = root;
    this.ctx = ctx;
    this.offs = [];
    this.lastScroll = 0;
    this.build();
  }

  W8Window.prototype._on = function (el, ev, fn, opts) { this.offs.push(U().on(el, ev, fn, opts)); };

  W8Window.prototype.build = function () {
    var self = this;
    var u = U();
    var icons = this.ctx.services.icons;

    this.shell = u.el('div', { class: 'w8-shell', data: { pmxWindow: 'w8' } });

    this.transcript = u.el('div', { class: 'w8-transcript pmx-scroll', data: { pmxRegion: 'transcript' } });
    this.shell.appendChild(this.transcript);

    /* Header capsule. The model label lives here and stays reachable: hiding is a translate,
     * and hovering the top edge brings it straight back. */
    this.headCap = u.el('div', { class: 'w8-cap w8-cap-head', data: { hidden: '0' } });
    this.histBtn = u.el('button', { class: 'w8-capbtn', aria: { label: 'Conversations' } });
    this.histBtn.title = 'Conversations';
    this.histBtn.appendChild(icons.get('thread', 14));
    this._on(this.histBtn, 'click', function () { self.openOverlay('history'); });
    this.headCap.appendChild(this.histBtn);

    this.workBtn = u.el('button', { class: 'w8-capbtn', aria: { label: 'Work surfaces' } });
    this.workBtn.title = 'Work surfaces';
    this.workBtn.appendChild(icons.get('layers', 14));
    this._on(this.workBtn, 'click', function () { self.openOverlay('work'); });
    this.headCap.appendChild(this.workBtn);

    this.tools = u.el('div', { class: 'w8-tools', data: { pmxRegion: 'headerTools' } });
    this.headCap.appendChild(this.tools);

    this.headCap.appendChild(u.el('span', { class: 'w8-brand' }, [
      u.el('span', { class: 'w8-brand-name', text: 'Frameless' }),
      u.el('span', { class: 'w8-brand-model', text: this.ctx.label })
    ]));
    this.shell.appendChild(this.headCap);

    /* ---------------------------------------------------------------- pinned history
     * This concept renders its own transient history (a popup, an overlay), which
     * means it never mounted the shared module and so never inherited the status
     * symbols or the per-row menu. The rail below declares the threadHistory region,
     * so compose.js mounts the real thing here and every concept shows thread state
     * the same way.
     *
     * The rail is ALWAYS present: a slim edge carrying just the pin when unpinned,
     * a full column when pinned. That is what keeps the pin reachable without
     * reaching into this window's own header markup and coupling the two. */
    var selfPin = this;
    this.pinRail = u.el('div', { class: 'w8-pinrail', data: { 'w8-pinned': '0' } });
    var pinHead = u.el('div', { class: 'w8-pinrail-head' }, [
      u.el('span', { class: 'w8-pinrail-title', text: 'Conversations' })
    ]);
    this.pinBtn = global.PMXThreadHistory.pinButton(this.ctx, 'w8-pinrail-pin', function () {
      selfPin.syncPin();
    });
    pinHead.appendChild(this.pinBtn);
    this.pinRail.appendChild(pinHead);
    this.pinRailBody = u.el('div', {
      class: 'w8-pinrail-body pmx-scroll',
      data: { pmxRegion: 'threadHistory' }
    });
    this.pinRail.appendChild(this.pinRailBody);
    this.shell.insertBefore(this.pinRail, this.shell.firstChild);


    /* A question is never allowed to hide behind a capsule. */
    this.questionHost = u.el('div', { class: 'w8-question', data: { pmxRegion: 'questionHost' } });
    this.shell.appendChild(this.questionHost);

    this.composerCap = u.el('div', { class: 'w8-cap w8-cap-composer' });
    this.composerHost = u.el('div', { class: 'w8-composerhost', data: { pmxRegion: 'composerHost' } });
    this.composerCap.appendChild(this.composerHost);
    this.shell.appendChild(this.composerCap);

    /* Full-surface overlay for the two regions this window does not provide. */
    this.overlay2 = u.el('div', { class: 'w8-full', data: { open: '0' } });
    this.overlayTitle = u.el('div', { class: 'w8-full-title' });
    this.overlayBody = u.el('div', { class: 'w8-full-body pmx-scroll' });
    var close = u.el('button', { class: 'w8-full-close', aria: { label: 'Close' } });
    close.appendChild(icons.get('close', 14));
    this._on(close, 'click', function () { self.closeOverlay(); });
    var head = u.el('div', { class: 'w8-full-head' }, [this.overlayTitle, close]);
    this.overlay2.appendChild(head);
    this.overlay2.appendChild(this.overlayBody);
    this.shell.appendChild(this.overlay2);

    this.root.appendChild(this.shell);

    this.overlay = u.el('div', { class: 'w8-overlay', data: { pmxWindow: 'w8', pmxRegion: 'overlayRoot' } });
    this.root.appendChild(this.overlay);

    /* CAPTURE. The thread module renders its own scroller inside this region, and `scroll`
     * does not bubble — so a bubble-phase listener on the host heard nothing and the capsule
     * never auto-hid, which is this concept's whole signature behaviour. */
    this._on(this.transcript, 'scroll', function () { self.onScroll(); }, { passive: true, capture: true });

    /* The composer capsule floats over the transcript, so the transcript must reserve
     * scroll padding equal to the capsule height or the last message hides underneath it. */
    this.reserve();
    if (global.ResizeObserver) {
      this._ro = new global.ResizeObserver(function () { self.reserve(); });
      try { this._ro.observe(this.composerCap); } catch (e) {}
    }
  };

  /* Both floating capsules AND the question surface hover over the transcript, so the
   * transcript must reserve room for whichever of them is actually present. Reserving only
   * the composer left the tail of the transcript sitting underneath an active question. */
  W8Window.prototype.reserve = function () {
    var composerH = this.composerCap ? this.composerCap.offsetHeight : 0;
    var questionH = (this.questionHost && this.questionHost.childNodes.length)
      ? this.questionHost.offsetHeight + 10 : 0;
    var top = this.headCap ? this.headCap.offsetHeight : 0;
    var bottom = composerH + questionH + 20;
    this.transcript.style.scrollPaddingBottom = (bottom - 4) + 'px';
    this.transcript.style.paddingBottom = bottom + 'px';
    this.transcript.style.paddingTop = (top + 14) + 'px';
  };

  /* Auto-hide is a comfort behavior, not a carrier of meaning, so reduced motion disables it
   * entirely rather than making it instant — a capsule that vanishes with no transition is
   * worse than one that simply stays. */
  /* See PMXScroll.resolveScroller: the region is the host, not the scroller. Cached only
   * on a genuine hit, which self-invalidates when the thread remounts. */
  W8Window.prototype.scrollEl = function () {
    if (this._scrollEl && this._scrollEl.isConnected) return this._scrollEl;
    var found = global.PMXScroll.resolveScroller(this.transcript);
    if (found !== this.transcript) this._scrollEl = found;
    return found;
  };

  W8Window.prototype.onScroll = function () {
    if (this.ctx.services.motion.reduced(this.shell)) {
      this.headCap.setAttribute('data-hidden', '0');
      return;
    }
    /* Read the element that actually scrolled, not the region hosting it: `.w8-transcript`
     * has no overflow of its own, so its scrollTop is permanently 0. */
    var y = this.scrollEl().scrollTop;
    var down = y > this.lastScroll + 6;
    var up = y < this.lastScroll - 6;
    if (down && y > 80) this.headCap.setAttribute('data-hidden', '1');
    else if (up) this.headCap.setAttribute('data-hidden', '0');
    this.lastScroll = y;
  };

  W8Window.prototype.openOverlay = function (kind) {
    var self = this;
    var u = U();
    U().empty(this.overlayBody);
    this.overlayTitle.textContent = kind === 'history' ? 'Conversations' : 'Work surfaces';

    if (kind === 'history') {
      var active = this.ctx.store.get('session.activeThreadId');
      this.ctx.data.threads.slice().sort(function (a, b) {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.lastActivityAt) - new Date(a.lastActivityAt);
      }).forEach(function (t) {
        var row = u.el('button', { class: 'w8-hrow' });
        if (t.id === active) row.classList.add('is-active');
        row.appendChild(u.el('span', { class: 'w8-hrow-title', text: t.title }));
        row.appendChild(u.el('span', { class: 'w8-hrow-meta', text: global.PMXData.fmt.relative(t.lastActivityAt) }));
        self._on(row, 'click', function () {
          self.ctx.store.set('session.activeThreadId', t.id);
          self.closeOverlay();
        });
        self.overlayBody.appendChild(row);
      });
    } else {
      /* This window provides no workSurfaceHost, so the thread module has already rendered
       * its surfaces inline. The overlay explains where they are rather than duplicating
       * them, which would create two sources for one record. */
      this.overlayBody.appendChild(u.el('p', { class: 'w8-full-note',
        text: 'This concept has no work rail. Goal, Todo, agent, and change detail render inline in the transcript, next to the turn that produced them.' }));
    }
    this.overlay2.setAttribute('data-open', '1');
  };

  W8Window.prototype.closeOverlay = function () { this.overlay2.setAttribute('data-open', '0'); };


  W8Window.prototype.syncPin = function () {
    var TH = global.PMXThreadHistory;
    var pin = TH.pinState(this.ctx, this.pinRailBody, 900);
    this.pinRail.setAttribute('data-w8-pinned', pin.active ? '1' : '0');
    if (this.shell) this.shell.setAttribute('data-w8-pinned', pin.active ? '1' : '0');
    TH.syncPinButton(this.pinBtn, pin.asked);
    var histRoot = this.pinRailBody.querySelector('.pmx-chrome-history');
    if (histRoot) histRoot.setAttribute('data-pmx-docked', pin.active ? '1' : '0');
  };

  W8Window.prototype.setWidth = function (px) {
    this.shell.style.width = U().clamp(Number(px) || MIN_W, MIN_W, MAX_W) + 'px';
    this.reserve();
  };
  W8Window.prototype.setRail = function (open) { this.shell.setAttribute('data-rail', open ? 'open' : 'closed'); };
  W8Window.prototype.setMount = function (f) {
    /* pin: re-evaluate once the regions exist, so the docked flag lands on
     * the history root the shared module just rendered. */
    if (this.syncPin) this.syncPin(); this.shell.setAttribute('data-w8-mount', f === 'popout' ? 'popout' : 'docked'); };

  W8Window.prototype.update = function (state, changed) {
    for (var pk = 0; pk < changed.length; pk++) {
      if (changed[pk].indexOf('session') === 0) {
        if (this.syncPin) this.syncPin();
        break;
      }
    }
    /* Any ui or view change can add or remove the question surface, and the reserved space
     * has to follow it or the transcript tail slides under a floating capsule. */
    for (var i = 0; i < changed.length; i++) {
      var k = changed[i];
      if (k.indexOf('ui') === 0 || k.indexOf('view') === 0 || k.indexOf('session') === 0) {
        this.reserve();
        return;
      }
    }
  };

  W8Window.prototype.destroy = function () {
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this._ro) { try { this._ro.disconnect(); } catch (e) {} this._ro = null; }
    if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  };

  global.PMX.window.register('w8', {
    name: 'Frameless',
    blurb: 'No chrome at all. The transcript runs edge to edge while a header capsule and a composer capsule float above it, and the header steps out of the way as you read downward.',
    provides: ['threadHistory', 'questionHost'],
    mount: function (root, ctx) {
      var inst = new W8Window(root, ctx);
      return {
        regions: {
          transcript: inst.transcript,
          composerHost: inst.composerHost,
          headerTools: inst.tools,
          overlayRoot: inst.overlay,
          threadHistory: inst.pinRailBody,
          questionHost: inst.questionHost
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
