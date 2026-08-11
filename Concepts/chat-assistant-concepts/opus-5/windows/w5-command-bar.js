/* w5 "Command Bar" — Opus 5
 *
 * All chrome fuses into ONE persistent bottom bar that also holds the composer. The top of
 * the window is pure transcript, edge to edge, with no header at all.
 *
 * The bet: a header and a composer are two bands of fixed vertical cost. At 520px that cost
 * is most of what the reader loses. Merging them into one band gives the transcript back an
 * entire strip of height, and thread history moves to a command overlay that costs nothing
 * until summoned.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  var MIN_W = 520, MAX_W = 1200;

  function W5Window(root, ctx) {
    this.root = root;
    this.ctx = ctx;
    this.offs = [];
    this.build();
  }

  W5Window.prototype._on = function (el, ev, fn, opts) { this.offs.push(U().on(el, ev, fn, opts)); };

  W5Window.prototype.build = function () {
    var self = this;
    var u = U();
    var icons = this.ctx.services.icons;

    this.shell = u.el('div', { class: 'w5-shell', data: { pmxWindow: 'w5' } });

    /* Transcript first in the DOM and first visually: nothing sits above it. */
    this.transcript = u.el('div', { class: 'w5-transcript pmx-scroll', data: { pmxRegion: 'transcript' } });
    this.shell.appendChild(this.transcript);

    /* Rises above the bar only when something is actually active. */
    this.surfaceHost = u.el('div', { class: 'w5-surfaces pmx-scroll', data: { pmxRegion: 'workSurfaceHost' } });
    this.shell.appendChild(this.surfaceHost);

    this.questionHost = u.el('div', { class: 'w5-question', data: { pmxRegion: 'questionHost' } });
    this.shell.appendChild(this.questionHost);

    /* The single band. Tools row and composer row, wrapping rather than overflowing. */
    this.bar = u.el('div', { class: 'w5-bar' });

    this.toolRow = u.el('div', { class: 'w5-toolrow' });
    this.cmdBtn = u.el('button', { class: 'w5-cmd', aria: { label: 'Open command overlay' } });
    this.cmdBtn.title = 'Threads and commands';
    this.cmdBtn.appendChild(icons.get('thread', 14));
    this.cmdBtn.appendChild(u.el('span', { class: 'w5-cmd-label', text: 'Threads' }));
    this.cmdBtn.appendChild(u.el('kbd', { class: 'w5-kbd', text: 'Ctrl K' }));
    this._on(this.cmdBtn, 'click', function () { self.openCommand(); });
    this.toolRow.appendChild(this.cmdBtn);

    this.tools = u.el('div', { class: 'w5-tools', data: { pmxRegion: 'headerTools' } });
    this.toolRow.appendChild(this.tools);

    this.brand = u.el('span', { class: 'w5-brand' }, [
      u.el('span', { class: 'w5-brand-name', text: 'Command Bar' }),
      u.el('span', { class: 'w5-brand-model', text: this.ctx.label })
    ]);
    this.toolRow.appendChild(this.brand);

    this.bar.appendChild(this.toolRow);

    this.composerHost = u.el('div', { class: 'w5-composer', data: { pmxRegion: 'composerHost' } });
    this.bar.appendChild(this.composerHost);

    this.shell.appendChild(this.bar);

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
    this.pinRail = u.el('div', { class: 'w5-pinrail', data: { 'w5-pinned': '0' } });
    var pinHead = u.el('div', { class: 'w5-pinrail-head' }, [
      u.el('span', { class: 'w5-pinrail-title', text: 'Conversations' })
    ]);
    this.pinBtn = global.PMXThreadHistory.pinButton(this.ctx, 'w5-pinrail-pin', function () {
      selfPin.syncPin();
    });
    pinHead.appendChild(this.pinBtn);
    this.pinRail.appendChild(pinHead);
    this.pinRailBody = u.el('div', {
      class: 'w5-pinrail-body pmx-scroll',
      data: { pmxRegion: 'threadHistory' }
    });
    this.pinRail.appendChild(this.pinRailBody);
    this.shell.insertBefore(this.pinRail, this.shell.firstChild);

    this.root.appendChild(this.shell);

    /* overlayRoot is a sibling of the shell, outside every scroller. */
    this.overlay = u.el('div', { class: 'w5-overlay', data: { pmxWindow: 'w5', pmxRegion: 'overlayRoot' } });
    this.root.appendChild(this.overlay);

    /* The command overlay, built here because this window owns thread history itself. */
    this.cmdLayer = u.el('div', { class: 'w5-cmdlayer', data: { open: '0' } });
    this.cmdPanel = u.el('div', { class: 'w5-cmdpanel' });
    this.cmdInput = u.el('input', {
      class: 'w5-cmdinput', type: 'search',
      placeholder: 'Jump to a conversation', aria: { label: 'Jump to a conversation' }
    });
    this.cmdList = u.el('div', { class: 'w5-cmdlist pmx-scroll' });
    this.cmdPanel.appendChild(this.cmdInput);
    this.cmdPanel.appendChild(this.cmdList);
    this.cmdLayer.appendChild(this.cmdPanel);
    this.shell.appendChild(this.cmdLayer);

    this._on(this.cmdInput, 'input', function () { self.renderCommand(); });
    this._on(this.cmdLayer, 'click', function (ev) {
      if (ev.target === self.cmdLayer) self.closeCommand();
    });
    this._on(this.shell, 'keydown', function (ev) {
      if (ev.key === 'Escape') self.closeCommand();
      if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'k' || ev.key === 'K')) {
        ev.preventDefault();
        self.openCommand();
      }
    });
  };

  W5Window.prototype.openCommand = function () {
    this.cmdLayer.setAttribute('data-open', '1');
    this.cmdBtn.setAttribute('aria-expanded', 'true');
    this.renderCommand();
    var input = this.cmdInput;
    global.setTimeout(function () { try { input.focus(); } catch (e) {} }, 30);
  };

  W5Window.prototype.closeCommand = function () {
    this.cmdLayer.setAttribute('data-open', '0');
    this.cmdBtn.setAttribute('aria-expanded', 'false');
  };

  W5Window.prototype.renderCommand = function () {
    var self = this;
    var u = U();
    var q = this.cmdInput.value.trim().toLowerCase();
    var active = this.ctx.store.get('session.activeThreadId');
    U().empty(this.cmdList);

    var threads = this.ctx.data.threads.slice().sort(function (a, b) {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.lastActivityAt) - new Date(a.lastActivityAt);
    });

    threads.forEach(function (t) {
      if (q && t.title.toLowerCase().indexOf(q) === -1 && (t.project || '').toLowerCase().indexOf(q) === -1) return;
      var row = u.el('button', { class: 'w5-cmdrow', data: { thread: t.id } });
      if (t.id === active) row.classList.add('is-active');
      row.appendChild(u.el('span', { class: 'w5-cmdrow-title', text: t.title }));
      row.appendChild(u.el('span', { class: 'w5-cmdrow-meta', text: global.PMXData.fmt.relative(t.lastActivityAt) }));
      if (t.threadState && t.threadState !== 'idle') {
        row.appendChild(u.el('span', { class: 'w5-cmdrow-state', text: global.PMXData.fmt.label(t.threadState) }));
      }
      self._on(row, 'click', function () {
        self.ctx.store.set('session.activeThreadId', t.id);
        self.closeCommand();
      });
      self.cmdList.appendChild(row);
    });

    if (!this.cmdList.childNodes.length) {
      this.cmdList.appendChild(u.el('div', { class: 'w5-cmdempty', text: 'No conversation matches that.' }));
    }
  };


  W5Window.prototype.syncPin = function () {
    var TH = global.PMXThreadHistory;
    var pin = TH.pinState(this.ctx, this.pinRailBody, 900);
    this.pinRail.setAttribute('data-w5-pinned', pin.active ? '1' : '0');
    if (this.shell) this.shell.setAttribute('data-w5-pinned', pin.active ? '1' : '0');
    TH.syncPinButton(this.pinBtn, pin.asked);
    var histRoot = this.pinRailBody.querySelector('.pmx-chrome-history');
    if (histRoot) histRoot.setAttribute('data-pmx-docked', pin.active ? '1' : '0');
  };

  W5Window.prototype.setWidth = function (px) {
    this.shell.style.width = U().clamp(Number(px) || MIN_W, MIN_W, MAX_W) + 'px';
  };
  W5Window.prototype.setRail = function (open) {
    this.shell.setAttribute('data-rail', open ? 'open' : 'closed');
  };
  W5Window.prototype.setMount = function (form) {
    /* pin: re-evaluate once the regions exist, so the docked flag lands on
     * the history root the shared module just rendered. */
    if (this.syncPin) this.syncPin();
    this.shell.setAttribute('data-w5-mount', form === 'popout' ? 'popout' : 'docked');
  };

  W5Window.prototype.update = function (state, changed) {
    for (var pk = 0; pk < changed.length; pk++) {
      if (changed[pk].indexOf('session') === 0) {
        if (this.syncPin) this.syncPin();
        break;
      }
    }
    for (var i = 0; i < changed.length; i++) {
      if (changed[i].indexOf('session') === 0) {
        if (this.cmdLayer.getAttribute('data-open') === '1') this.renderCommand();
        return;
      }
    }
  };

  W5Window.prototype.destroy = function () {
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  };

  global.PMX.window.register('w5', {
    name: 'Command Bar',
    blurb: 'Every control fuses into one bottom band shared with the composer, leaving the transcript edge to edge with no header, and thread history opens as a command overlay that costs no space until summoned.',
    provides: ['threadHistory', 'workSurfaceHost', 'questionHost'],
    mount: function (root, ctx) {
      var inst = new W5Window(root, ctx);
      return {
        regions: {
          transcript: inst.transcript,
          composerHost: inst.composerHost,
          headerTools: inst.tools,
          overlayRoot: inst.overlay,
          workSurfaceHost: inst.surfaceHost,
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
