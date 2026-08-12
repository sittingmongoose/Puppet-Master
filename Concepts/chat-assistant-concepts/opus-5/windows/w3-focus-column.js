/* PMX window concept — w3 "Focus Column" — Opus 5
 *
 * The transcript is a single centred column capped at a hard maximum measure (~68 characters)
 * so prose stays readable even when the chat is the full 1200px wide. Two lightweight
 * affordance gutters flank it — symmetric, fixed-width rails that hold only jump markers
 * and a thin scroll-position indicator. They never carry
 * per-message content: the contract gives inline Lens selection to the thread, not the
 * window. Below ~640px both gutters disappear entirely (not relocated, not doubled up
 * anywhere else) and the column simply takes the full width.
 *
 * Provides `threadHistory` AND owns a command-style overlay. The header used to claim it did
 * NOT provide the region at all — a leftover from an earlier revision — which made the file
 * read as the set's absent-region case when in fact w8 is that case. Both are true here and
 * they are not in conflict: the shared module renders the pinned rail in the left gutter, and
 * the command overlay is the transient switcher this concept builds itself (title, filter,
 * list) and opens through ctx.services.popup. The rail is the persistent surface; the overlay
 * is the fast path.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  var MIN_W = 520;
  var MAX_W = 1200;

  function W3Window(root, ctx) {
    this.root = root;
    this.ctx = ctx;
    this.offs = [];
    this._mo = null;
    this._ro = null;
    this._shelfMo = null;
    this.shelfOpen = false;
    this.build();
  }

  W3Window.prototype._on = function (el, ev, fn, opts) {
    this.offs.push(U().on(el, ev, fn, opts));
  };

  W3Window.prototype.build = function () {
    var self = this;
    var ctx = this.ctx;
    var svc = ctx.services;
    var u = U();

    var shell = u.el('div', {
      class: 'w3-shell',
      data: { pmxWindow: 'w3' },
      style: { containerType: 'inline-size', containerName: 'pmx-chat' }
    });

    /* ---------------------------------------------------------------- header (single row) */
    var header = u.el('header', { class: 'w3-header' });

    this.historyBtn = u.el('button', {
      class: 'w3-history-btn', type: 'button',
      aria: { label: 'Switch thread', expanded: 'false' }
    }, [
      svc.icons.get('thread', 15),
      u.el('span', { class: 'w3-history-btn-label', text: 'Threads' })
    ]);
    this._on(this.historyBtn, 'click', function () { self.openCommand(self.historyBtn); });
    header.appendChild(this.historyBtn);

    var brand = u.el('div', { class: 'w3-brand' }, [
      u.el('span', { class: 'w3-brand-name', text: 'Focus Column' }),
      u.el('span', { class: 'w3-brand-sep', text: String.fromCharCode(183) }),
      u.el('span', { class: 'w3-brand-model', text: ctx.label })
    ]);
    header.appendChild(brand);

    this.headerTools = u.el('div', { class: 'w3-header-tools' });
    header.appendChild(this.headerTools);

    shell.appendChild(header);

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
    this.pinRail = u.el('div', { class: 'w3-pinrail', data: { 'w3-pinned': '0' } });
    var pinHead = u.el('div', { class: 'w3-pinrail-head' }, [
      u.el('span', { class: 'w3-pinrail-title', text: 'Conversations' })
    ]);
    this.pinBtn = global.PMXThreadHistory.pinButton(this.ctx, 'w3-pinrail-pin', function () {
      selfPin.syncPin();
    });
    pinHead.appendChild(this.pinBtn);
    this.pinRail.appendChild(pinHead);
    this.pinRailBody = u.el('div', {
      class: 'w3-pinrail-body pmx-scroll',
      data: { pmxRegion: 'threadHistory' }
    });
    this.pinRail.appendChild(this.pinRailBody);
    shell.insertBefore(this.pinRail, shell.firstChild);


    /* ---------------------------------------------------------------- main: gutter | column | gutter */
    var main = u.el('div', { class: 'w3-main' });

    var gutterLeft = u.el('div', { class: 'w3-gutter w3-gutter-left' });
    this.jumpTopBtn = u.el('button', {
      class: 'w3-jump w3-jump-top', type: 'button',
      aria: { label: 'Jump to the top of the transcript' }
    }, [svc.icons.get('chevron-up', 14)]);
    gutterLeft.appendChild(this.jumpTopBtn);

    /* NO lens quick-modes in this gutter. The Context Lens is a shared header tool that
     * every concept already gets from headertools.js, so a second copy here was
     * redundant — and it was a PARTIAL copy: it could set `subcompact` but carried
     * neither the selection budget nor Apply, so it could enter a mode it gave the
     * reader no way to finish. w7 meets the same temptation by pointing at the header
     * rather than reimplementing the control; this concept now simply leaves it there. */
    main.appendChild(gutterLeft);

    /* Centred column: capped at the hard max measure so prose never runs the full chat width. */
    var column = u.el('div', { class: 'w3-column' });

    this.transcript = u.el('div', { class: 'w3-transcript pmx-scroll', data: { pmxRegion: 'transcript' } });
    column.appendChild(this.transcript);

    this.shelf = u.el('div', { class: 'w3-shelf', data: { open: '0' } });
    this.shelfBody = u.el('div', { class: 'w3-shelf-body pmx-scroll' });
    this.questionHost = u.el('div', { class: 'w3-question-host', data: { pmxRegion: 'questionHost' } });
    this.surfaceHost = u.el('div', { class: 'w3-surface-host', data: { pmxRegion: 'workSurfaceHost' } });
    this.shelfBody.appendChild(this.questionHost);
    this.shelfBody.appendChild(this.surfaceHost);
    this.shelf.appendChild(this.shelfBody);
    column.appendChild(this.shelf);

    main.appendChild(column);

    /* Right gutter: same fixed width as the left one — "symmetric" is a layout guarantee so
     * the column stays centred, not a claim that both sides hold identical controls. */
    var gutterRight = u.el('div', { class: 'w3-gutter w3-gutter-right' });
    this.positionTrack = u.el('div', { class: 'w3-position', aria: { hidden: 'true' } });
    this.positionFill = u.el('div', { class: 'w3-position-fill' });
    this.positionTrack.appendChild(this.positionFill);
    gutterRight.appendChild(this.positionTrack);
    this.jumpLatestBtn = u.el('button', {
      class: 'w3-jump w3-jump-latest', type: 'button',
      aria: { label: 'Jump to the latest message' }
    }, [svc.icons.get('chevron-down', 14)]);
    gutterRight.appendChild(this.jumpLatestBtn);
    main.appendChild(gutterRight);

    shell.appendChild(main);
    /* Artifact workspace: a column OUTSIDE .w3-main, sized so --w3-measure stays centred in the
     * remainder. Pinned history owns the left gutter, so the artifact takes the outer column and
     * the two never contend. Switcher is a vertical marker list in the artifact's own gutter,
     * matching the jump-marker idiom this concept already uses. */
    this.artifactSwitch = u.el('div', { class: 'w3-artifact-markers' });
    this.artifactBody = u.el('div', { class: 'w3-artifact-body', data: { pmxRegion: 'artifactHost' } });
    this.artifactHost = u.el('div', { class: 'w3-artifact-host' }, [this.artifactSwitch, this.artifactBody]);
    shell.insertBefore(this.artifactHost, main);

    /* ---------------------------------------------------------------- composer */
    this.composerHost = u.el('div', { class: 'w3-composer', data: { pmxRegion: 'composerHost' } });
    shell.appendChild(this.composerHost);

    this.shell = shell;
    this.root.appendChild(shell);

    /* overlayRoot: a true sibling of the shell, outside the container-query / scroll subtree,
     * so the command overlay and every other popup are never clipped or mispositioned. */
    this.overlay = u.el('div', {
      class: 'w3-overlay pmx-overlay-root',
      data: { pmxWindow: 'w3', pmxRegion: 'overlayRoot' }
    });
    this.root.appendChild(this.overlay);

    /* The artifact service keeps its state outside the store's per-thread view, so it needs
     * its own subscription rather than a store change key. */
    if (global.PMXArtifacts && global.PMXArtifacts.subscribe) {
      this._artOff = global.PMXArtifacts.subscribe(function () { self.syncArtifact(); });
    }
    this.syncArtifact();

    /* ---------------------------------------------------------------- wiring */
    this._on(this.jumpTopBtn, 'click', function () { self.jumpTo(0); });
    this._on(this.jumpLatestBtn, 'click', function () { self.jumpTo(self.scrollEl().scrollHeight); });

    /* CAPTURE, because the scroller is a descendant this window does not own and `scroll`
     * does not bubble. Listening on the host in the bubble phase heard nothing at all once
     * the thread module supplied its own scroll container. */
    var onScroll = u.rafBatch(function () { self.updatePosition(); });
    this._on(this.transcript, 'scroll', onScroll, { passive: true, capture: true });

    /* The position indicator and jump-affordance disabled state depend on transcript geometry,
     * which changes as the thread module appends messages — never on semantic app state, so a
     * MutationObserver here is reading layout, not reaching into someone else's state. */
    this._mo = new global.MutationObserver(function () { self.updatePosition(); });
    this._mo.observe(this.transcript, { childList: true, subtree: true });
    if (global.ResizeObserver) {
      this._ro = new global.ResizeObserver(function () { self.updatePosition(); });
      this._ro.observe(this.transcript);
    }

    /* Bottom shelf: zero height until a thread mounts something into questionHost or
     * workSurfaceHost, exactly like w1's. Thread-agnostic on purpose. */
    var initialOpen = this.questionHost.childNodes.length > 0 || this.surfaceHost.childNodes.length > 0;
    this.shelfOpen = initialOpen;
    this.shelf.setAttribute('data-open', initialOpen ? '1' : '0');
    this.shelf.style.height = initialOpen ? '' : '0px';
    this.shelf.style.overflow = initialOpen ? '' : 'hidden';
    this._shelfMo = new global.MutationObserver(function () { self.syncShelf(); });
    this._shelfMo.observe(this.shelfBody, { childList: true, subtree: true });

    this.updatePosition();
  };

  W3Window.prototype.syncShelf = function () {
    var svc = this.ctx.services;
    var shouldOpen = this.questionHost.childNodes.length > 0 || this.surfaceHost.childNodes.length > 0;
    if (shouldOpen === this.shelfOpen) return;
    this.shelfOpen = shouldOpen;
    this.shelf.setAttribute('data-open', shouldOpen ? '1' : '0');
    svc.motion.collapseTo(this.shelf, shouldOpen, { collapsedHeight: 0, duration: 260 });
  };

  /* The element that ACTUALLY scrolls, which is not necessarily the region this window
   * owns. `.w3-transcript` is only the host: a thread module renders its own scroller
   * inside it (`.tN-scroll`), and that is where the overflow lives. Measuring the host
   * instead gave a scroll range of 5px against the real 1699px, so the position track
   * stayed at 0% height and both jump buttons sat permanently disabled — three dead
   * affordances from one wrong assumption.
   *
   * Cached ONLY when the resolver returned something other than the host: callers resolve
   * before the thread has mounted, and caching the fallback would be permanent since the
   * host never disconnects. A genuine hit invalidates itself on remount, when the old
   * scroller leaves the document. */
  W3Window.prototype.scrollEl = function () {
    if (this._scrollEl && this._scrollEl.isConnected) return this._scrollEl;
    var found = global.PMXScroll.resolveScroller(this.transcript);
    if (found !== this.transcript) this._scrollEl = found;
    return found;
  };

  W3Window.prototype.jumpTo = function (top) {
    var el = this.scrollEl();
    var reduced = this.ctx.services.motion.reduced(this.shell);
    try { el.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' }); }
    catch (e) { el.scrollTop = top; }
  };

  W3Window.prototype.updatePosition = function () {
    var el = this.scrollEl();
    var max = el.scrollHeight - el.clientHeight;
    var ratio = max > 1 ? U().clamp(el.scrollTop / max, 0, 1) : 0;
    this.positionFill.style.height = (ratio * 100).toFixed(1) + '%';
    this.jumpTopBtn.disabled = ratio <= 0.02;
    this.jumpLatestBtn.disabled = max <= 1 || ratio >= 0.98;
  };

  /* The command-style thread switcher this window owns. A single popup: title, filter input,
   * filtered list. Filter text is kept in session.threadHistory.query — the same store slice
   * the contract reserves for thread-history state — so it is preserved by construction across
   * a docked/pop-out remount even though this window renders history itself. */
  W3Window.prototype.openCommand = function (anchor) {
    var ctx = this.ctx;
    var u = U();
    var data = ctx.data;
    var fmt = data.fmt;

    ctx.services.popup.open({
      anchorEl: anchor, kind: 'panel', width: 320,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'w3-cmd-title', text: 'Switch thread' }));

        var searchWrap = u.el('div', { class: 'w3-cmd-search' });
        searchWrap.appendChild(ctx.services.icons.get('search', 13));
        var input = u.el('input', {
          class: 'w3-cmd-input', type: 'search', placeholder: 'Filter threads',
          aria: { label: 'Filter threads' }
        });
        searchWrap.appendChild(input);
        host.appendChild(searchWrap);

        var list = u.el('div', { class: 'w3-cmd-list pmx-scroll' });
        host.appendChild(list);

        function render() {
          u.empty(list);
          var q = (input.value || '').trim().toLowerCase();
          var activeId = ctx.store.get('session.activeThreadId');
          var threads = data.threads.slice().sort(function (a, b) {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.lastActivityAt) - new Date(a.lastActivityAt);
          });
          threads.forEach(function (t) {
            if (q && t.title.toLowerCase().indexOf(q) === -1 &&
                (t.project || '').toLowerCase().indexOf(q) === -1) return;
            var isActive = t.id === activeId;
            var row = u.el('button', {
              class: 'w3-cmd-row', type: 'button',
              aria: { current: isActive ? 'true' : 'false' }
            });
            if (isActive) row.classList.add('is-active');
            var top = u.el('div', { class: 'w3-cmd-row-top' }, [
              u.el('span', { class: 'w3-cmd-row-title', text: t.title }),
              u.el('span', { class: 'w3-cmd-row-time', text: fmt.relative(t.lastActivityAt) })
            ]);
            if (t.pinned) top.insertBefore(ctx.services.icons.get('pin', 11), top.firstChild);
            row.appendChild(top);
            if (t.threadState && t.threadState !== 'idle') {
              row.appendChild(u.el('div', { class: 'w3-cmd-row-state', text: fmt.label(t.threadState) }));
            }
            u.on(row, 'click', function () {
              ctx.store.set('session.activeThreadId', t.id);
              api.close();
            });
            list.appendChild(row);
          });
          if (!list.childNodes.length) {
            list.appendChild(u.el('div', { class: 'w3-cmd-empty', text: 'No threads match that filter.' }));
          }
        }

        input.value = ctx.store.get('session.threadHistory.query') || '';
        render();
        u.on(input, 'input', function () {
          ctx.store.set('session.threadHistory.query', input.value);
          render();
          api.resize();
        });
        u.on(input, 'keydown', function (ev) {
          if (ev.key !== 'Enter') return;
          var first = list.querySelector('.w3-cmd-row');
          if (first) first.click();
        });
        global.setTimeout(function () { try { input.focus(); } catch (e) {} }, 0);
      }
    });
  };

  /* ---------------------------------------------------------------- WindowInstance API */


  W3Window.prototype.syncPin = function () {
    var TH = global.PMXThreadHistory;
    /* minChat is 440 here, higher than every other concept, because this one protects a 68ch
     * measure: below 440 it is the measure that breaks first, not the history. */
    var r = TH.applyTo(this.pinRailBody, TH.resolve(this.ctx, this.pinRailBody, TH.floorsFor('w3')));
    TH.reasonNode(this.pinRailBody, r);
    var pin = { asked: r.state === 'pinned', active: r.effective === 'pinned-full',
                compact: r.effective === 'pinned-compact', effective: r.effective };
    if (this.shell) this.shell.setAttribute('data-w3-history', r.effective);
    this.pinRail.setAttribute('data-w3-pinned', pin.active ? '1' : '0');
    if (this.shell) this.shell.setAttribute('data-w3-pinned', pin.active ? '1' : '0');
    TH.syncPinButton(this.pinBtn, pin.asked);
    var histRoot = this.pinRailBody.querySelector('.pmx-chrome-history');
    if (histRoot) histRoot.setAttribute('data-pmx-docked', pin.active ? '1' : '0');
  };

  W3Window.prototype.setWidth = function (px) {
    var w = U().clamp(Number(px) || MIN_W, MIN_W, MAX_W);
    this.shell.style.width = w + 'px';
  };

  W3Window.prototype.setRail = function (open) {
    this.shell.setAttribute('data-rail', open ? 'open' : 'closed');
  };

  W3Window.prototype.setMount = function (form) {
    /* pin: re-evaluate once the regions exist, so the docked flag lands on
     * the history root the shared module just rendered. */
    if (this.syncPin) this.syncPin();
    this.shell.setAttribute('data-w3-mount', form === 'popout' ? 'popout' : 'docked');
  };

  W3Window.prototype.update = function (state, changed) {
    for (var pk = 0; pk < changed.length; pk++) {
      if (changed[pk].indexOf('session') === 0) {
        if (this.syncPin) this.syncPin();
        break;
      }
    }
    /* Nothing else here reads the store. The `session`/`view` branch that used to follow
     * existed solely to re-press the lens quick-targets, and the shelf keeps itself in
     * step through its own MutationObserver rather than through store updates. */
  };


  /* ---------------------------------------------------------------- artifact frame
   * The window owns PLACEMENT and the SWITCHER; the shared panel renders the body. */
  W3Window.prototype.syncArtifact = function () {
    var A = global.PMXArtifacts;
    if (!A) return;
    var open = A.isOpen();
    var activeId = A.activeId();
    this.shell.setAttribute('data-w3-artifact', open ? '1' : '0');

    /* A vertical marker list, the same square-marker idiom as the transcript's jump markers. Titles
     * live in the title attribute: a 28px gutter cannot hold text, and a clipped label is worse than
     * a marker with a tooltip. */
    var u = U();
    u.empty(this.artifactSwitch);
    if (!open) return;
    var self = this;
    A.list().forEach(function (a) {
      var m = u.el('button', {
        class: 'w3-artifact-marker', type: 'button',
        aria: { pressed: a.id === activeId ? 'true' : 'false', label: a.title }
      });
      m.title = a.title;
      u.on(m, 'click', function () { A.switchTo(a.id); });
      self.artifactSwitch.appendChild(m);
    });
  };

  W3Window.prototype.destroy = function () {
    if (this._artOff) { try { this._artOff(); } catch (e) {} this._artOff = null; }
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this._mo) { try { this._mo.disconnect(); } catch (e) {} this._mo = null; }
    if (this._ro) { try { this._ro.disconnect(); } catch (e) {} this._ro = null; }
    if (this._shelfMo) { try { this._shelfMo.disconnect(); } catch (e) {} this._shelfMo = null; }
    if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
  };

  global.PMX.window.register('w3', {
    name: 'Focus Column',
    blurb: 'A centred transcript column capped at a comfortable reading width, flanked by slim symmetric gutters for jump markers and a scroll-position indicator, with thread switching as a command-style overlay the window builds itself.',
    provides: ['threadHistory', 'workSurfaceHost', 'questionHost', 'artifactHost'],
    mount: function (root, ctx) {
      var inst = new W3Window(root, ctx);
      return {
        regions: {
          transcript: inst.transcript,
          composerHost: inst.composerHost,
          headerTools: inst.headerTools,
          overlayRoot: inst.overlay,
          workSurfaceHost: inst.surfaceHost,
          threadHistory: inst.pinRailBody,
          questionHost: inst.questionHost,
          artifactHost: inst.artifactBody
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
