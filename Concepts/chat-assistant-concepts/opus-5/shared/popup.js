/* PMX popup family — Opus 5
 *
 * This motion contract is LOCKED by canon and is not open to redesign:
 *   click activation only, corner-origin sprout, existing popup chrome, animated open and
 *   close, in-place resizing when option count or submenu content changes, submenus,
 *   mutual exclusion so only one transient overlay is active, reduced-motion final state,
 *   viewport-aware placement.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function M() { return global.PMXMotion; }

  var roots = [];          /* one per composition */
  var openHandles = [];    /* stack: [base, submenu, ...] */

  function currentRoot(anchorEl) {
    if (roots.length === 1) return roots[0];
    /* With several compositions on one contact sheet, portal into the stage that owns the anchor. */
    for (var i = 0; i < roots.length; i++) {
      if (anchorEl && roots[i].el.ownerDocument === anchorEl.ownerDocument) {
        var stage = roots[i].el.closest ? roots[i].el.closest('.pmx-stage') : null;
        if (!stage || stage.contains(anchorEl)) return roots[i];
      }
    }
    return roots[roots.length - 1];
  }

  /* Corner-origin: sprout from the corner of the popup nearest its trigger. */
  function setSprout(el, anchorRect, placement, isSide) {
    var ax = anchorRect.left + anchorRect.width / 2;
    var ay = anchorRect.top + anchorRect.height / 2;

    if (isSide) {
      /* Sprout from the edge that FACES the row that opened this flyout: if the
       * popup's own centre is right of the anchor it opened rightward, so it
       * must grow out of its own left edge. */
      var fromLeft = (placement.left + placement.width / 2) >= ax;
      el.style.setProperty('--pmx-sprout-ox', fromLeft ? '0%' : '100%');
      var oy = ((ay - placement.top) / Math.max(placement.height, 1)) * 100;
      el.style.setProperty('--pmx-sprout-oy', U().clamp(oy, 10, 90) + '%');
      el.style.setProperty('--pmx-sprout-tx', (fromLeft ? -10 : 10) + 'px');
      el.style.setProperty('--pmx-sprout-ty', '0px');
      el.style.setProperty('--pmx-sprout-sx', '0.48');
      el.style.setProperty('--pmx-sprout-sy', '0.72');
      el.setAttribute('data-sprout', (fromLeft ? 'l' : 'r'));
      return;
    }

    /* Vertical popouts snap to whichever of their OWN four corners sits nearest
     * the trigger, measured against the popup's placed box rather than against
     * the viewport midpoint. Viewport-relative guessing gets the corner wrong
     * whenever the popup is clamped to an edge — which is most of the time at
     * 520px — and the box then appears to grow out of thin air instead of out
     * of the control that was clicked. */
    var pw = Math.max(placement.width, 1);
    var ph = Math.max(placement.height, 1);
    var ox = ((ax - placement.left) / pw) * 100;
    var oy = ((ay - placement.top) / ph) * 100;

    var snapX = ox < 50 ? 12 : 88;
    var snapY = oy < 50 ? 8 : 100;
    /* Flush-edge overrides: when the trigger sits exactly on one of the
     * popup's own edges, snap to that edge rather than to the nearer half. */
    if (ay >= placement.bottom - 2) snapY = 100;
    else if (ay <= placement.top + 2) snapY = 0;
    if (ax <= placement.left + 2) snapX = 8;
    else if (ax >= placement.right - 2) snapX = 92;

    var fromBottom = snapY >= 50;
    el.style.setProperty('--pmx-sprout-ox', snapX + '%');
    el.style.setProperty('--pmx-sprout-oy', snapY + '%');
    el.style.setProperty('--pmx-sprout-tx', '0px');
    el.style.setProperty('--pmx-sprout-ty', (fromBottom ? 10 : -10) + 'px');
    el.style.setProperty('--pmx-sprout-sx', '0.72');
    el.style.setProperty('--pmx-sprout-sy', '0.48');
    el.setAttribute('data-sprout', (fromBottom ? 'b' : 't') + (snapX < 50 ? 'l' : 'r'));
  }

  /* Viewport-aware placement. When the popup would overflow the bottom we anchor it to the
   * bottom edge and let it grow upward, so a content-size change moves the TOP edge only and
   * the row under the pointer stays put. */
  /* Measure the box a `position: fixed` popup is ACTUALLY offset against.
   *
   * First attempt at this read the overlay root's rect, on the reasoning that it is
   * `position: fixed; inset: 0` and therefore fills the containing block. That is
   * true in w1 — and false in w2..w8, which override it with
   * `[data-pmx-window="wN"] .wN-overlay { position: static }`. A static parent still
   * lays out in flow, so its rect is some arbitrary strip of the page, and
   * subtracting it produced garbage.
   *
   * Asking the element itself removes the guesswork entirely. Park the popup at
   * offset 0,0 and read where it lands: for a fixed box, that IS its containing
   * block's origin in viewport coordinates, whether the containing block is the
   * viewport, a transformed ancestor, or a backdrop-filtered one. No assumption
   * about any other element's position, and it stays correct if the structure
   * changes again.
   *
   * The cost is one write plus one read. It is paid only when a popup is genuinely
   * being repositioned — retrack() skips placement entirely while the anchor has
   * not moved, which is the common case during a scroll. */
  var probeEl = null;

  function containingBlockRect(el) {
    var parent = el.parentNode;
    if (!parent || !parent.appendChild) {
      return { left: 0, top: 0, right: global.innerWidth, bottom: global.innerHeight };
    }

    /* Measure with a SEPARATE probe rather than the popup itself.
     *
     * The obvious version of this parks the popup at 0,0 and reads where it lands.
     * That is wrong here: `getBoundingClientRect()` reports the TRANSFORMED box, and
     * the popup is mid-sprout exactly when placement runs — scaled to .72/.48 and
     * offset -10px by the opening transition. The reading would carry that animation
     * offset into the origin and the menu would drift as it opened.
     *
     * A zero-size probe with no transform of its own has no such offset. It is a
     * sibling of the popup, so it shares the popup's containing block by definition,
     * whatever establishes it — the viewport, a backdrop-filtered stage, or the
     * transform the contact sheet scales its cells with. */
    if (!probeEl) {
      probeEl = el.ownerDocument.createElement('div');
      probeEl.setAttribute('aria-hidden', 'true');
      probeEl.style.cssText =
        'position:fixed;left:0;top:0;width:0;height:0;' +
        'padding:0;margin:0;border:0;visibility:hidden;pointer-events:none;transform:none;';
    }
    parent.appendChild(probeEl);
    var o = probeEl.getBoundingClientRect();
    parent.removeChild(probeEl);

    /* Two different boxes matter here, and conflating them put a menu outside the app.
     *
     * ox/oy and cbW/cbH describe the CONTAINING BLOCK, which is what CSS `left`/`top`/
     * `bottom` resolve against — get this wrong and the popup lands in the wrong place.
     *
     * left/top/right/bottom describe the region placement may USE, which is the
     * containing block intersected with the stage. Those differ whenever nothing
     * contains the popup: the block is then the whole viewport, while the visible
     * frame stops at the stage. Clamping to the viewport let a menu in w5 open
     * downward into 98.7px of room for a 99.2px popup and poke 1.2px past the stage —
     * unclipped, because a fixed box only obeys `overflow: hidden` on its own
     * containing block. Clamping to the intersection makes it flip up instead. */
    var host = parent.closest ? parent.closest('.pmx-stage') : null;
    var contained = (o.left !== 0 || o.top !== 0);
    var hr = host ? host.getBoundingClientRect() : null;
    var cbW = contained && hr ? hr.width : global.innerWidth;
    var cbH = contained && hr ? hr.height : global.innerHeight;

    var box = { ox: o.left, oy: o.top, cbW: cbW, cbH: cbH,
                left: o.left, top: o.top, right: o.left + cbW, bottom: o.top + cbH };
    if (hr) {
      box.left = Math.max(box.left, hr.left);
      box.top = Math.max(box.top, hr.top);
      box.right = Math.min(box.right, hr.right);
      box.bottom = Math.min(box.bottom, hr.bottom);
    }
    return box;
  }

  /* rectOpt lets a caller that has ALREADY measured the anchor pass its rect in.
   * During scroll tracking the same rect was previously read three times per
   * popup per frame — once here, once by the visibility test, once by
   * setSprout — and each read after a style write forces a synchronous layout. */
  function place(el, anchorEl, isSide, rectOpt) {
    var r = rectOpt || anchorEl.getBoundingClientRect();
    /* offsetWidth/offsetHeight are layout metrics and are NOT affected by the
     * closed-state transform, so no neutralise-measure-restore dance is needed
     * here. That matters: this runs once per animation frame while scrolling. */
    var w = el.offsetWidth, h = el.offsetHeight;

    /* A zero-sized anchor cannot be positioned against. It happens for real —
     * the trailing header selectors collapse to 0x0 at narrow widths — and
     * without this guard the popup pins itself to the corner of the containing
     * block, a thousand pixels from anything the user touched.
     *
     * Returning null here only helps because BOTH callers now treat null as
     * "close it". They previously ignored the null and opened the popup anyway,
     * at whatever position it already had, which produced exactly the stranded
     * menu this guard was written to prevent. */
    if (!r.width && !r.height) return null;

    /* THE CONTAINING BLOCK, not the viewport.
     *
     * These popups are `position: fixed`, so their offsets resolve against the
     * viewport ONLY while no ancestor establishes a containing block. Any
     * ancestor with transform, filter, backdrop-filter, perspective or
     * containment takes that job over silently, and viewport maths then lands
     * every popup off by that ancestor's offset. The glass themes put
     * `backdrop-filter` on .pmx-stage, which displaced every popup by exactly
     * the stage's padding-box origin (+18, +124 at the default layout) and let
     * the stage's `overflow: hidden` clip the overhang.
     *
     * Rather than forbid the material, measure the box we are actually being
     * positioned against — see containingBlockRect(). Geometry is still reasoned
     * about in viewport coordinates below; only the final write is converted.
     * This is durable: it stays correct if anyone later adds a filter or a
     * transform anywhere above the overlay. */
    var cb = containingBlockRect(el);

    /* Offsets resolve against the containing block; placement is confined to the
     * usable region. See containingBlockRect() for why those are not the same box. */
    var pad = 8;
    var ox = cb.ox, oy = cb.oy;
    var vw = cb.cbW, vh = cb.cbH;
    /* Usable region, expressed in containing-block coordinates. */
    var rx0 = cb.left - ox, ry0 = cb.top - oy;
    var rx1 = cb.right - ox, ry1 = cb.bottom - oy;
    r = { left: r.left - ox, top: r.top - oy, right: r.right - ox, bottom: r.bottom - oy,
          width: r.width, height: r.height };

    /* An anchor lying entirely OUTSIDE the containing block cannot be pointed at,
     * and the clamps below would drag the popup back into view anyway — pinning a
     * menu to the left edge of the screen while its trigger sits somewhere off it.
     * That is the "one concept over another" artefact: the test harness parks its
     * host at left:-10000px, so any popup opened against it clamped to x=8 and
     * painted over the real page. Clamping is for nudging a popup that would
     * overhang an edge, not for inventing a position for an anchor that is gone. */
    if (r.right < rx0 || r.bottom < ry0 || r.left > rx1 || r.top > ry1) return null;

    /* Travel limits for the popup's top-left corner inside the usable region. */
    var minL = rx0 + pad, maxL = rx1 - w - pad;
    var minT = ry0 + pad, maxT = ry1 - h - pad;
    var left, top;

    if (isSide) {
      /* Open to the right of the row, flipping left only when there is no room. */
      left = r.right + 6;
      if (left > maxL) left = r.left - w - 6;
      left = U().clamp(left, minL, Math.max(minL, maxL));
      top = U().clamp(r.top, minT, Math.max(minT, maxT));
      el.style.left = left + 'px';
      el.style.top = top + 'px';
      el.style.bottom = 'auto';
    } else {
      left = (r.left + r.width / 2) > (rx0 + rx1) / 2 ? r.right - w : r.left;
      left = U().clamp(left, minL, Math.max(minL, maxL));
      el.style.left = left + 'px';

      if (r.bottom + 6 <= maxT) {
        top = U().clamp(r.bottom + 6, minT, Math.max(minT, maxT));
        el.style.top = top + 'px';
        el.style.bottom = 'auto';
      } else {
        /* Bottom-anchored. Pin the bottom edge just above the trigger and let
         * the box grow upward, so a content change — filtering a list, swapping
         * a submenu — moves the TOP edge only. Anchoring by `top` instead makes
         * a shrinking list slide down over the control that opened it.
         *
         * Solved as a clamped TOP and converted, so the same limits govern both
         * branches; `bottom` still measures from the containing block's edge. */
        top = U().clamp(r.top - 6 - h, minT, Math.max(minT, maxT));
        el.style.top = 'auto';
        el.style.bottom = (vh - (top + h)) + 'px';
      }
    }

    /* Back to viewport coordinates on the way out. setSprout compares this against
     * a viewport-space anchor rect to pick the corner the popup grows from, so
     * handing it containing-block coordinates would snap to the wrong corner
     * whenever the two spaces differ. */
    return {
      top: top + oy, left: left + ox, width: w, height: h,
      right: left + ox + w, bottom: top + oy + h
    };
  }

  /* ------------------------------------------------------------ scroll tracking
   * A position:fixed menu placed once does not move when the surface beneath it
   * scrolls, so it visibly detaches from the control that opened it. These
   * popups are triggered from inside the transcript and the side panels, both
   * of which scroll, so the detachment is easy to hit.
   *
   * Every scroll and resize re-places each open popup against the live anchor
   * rect. Once the anchor has scrolled out of its own scroll container the
   * popup is dismissed outright — a menu that keeps following a trigger the
   * user can no longer see is worse than one that closes.
   */
  var trackFrame = 0;
  var tracking = false;

  function scrollParentOf(el) {
    var n = el && el.parentElement;
    while (n) {
      var cs = global.getComputedStyle(n);
      if (/(auto|scroll|overlay)/.test(cs.overflowY) || /(auto|scroll|overlay)/.test(cs.overflowX)) return n;
      n = n.parentElement;
    }
    return null;
  }

  /* Takes the rect rather than measuring, so the caller can read once per frame. */
  function anchorVisibleFromRect(handle, r) {
    if (!r || (!r.width && !r.height)) return false;
    var sp = handle._scrollParent;
    if (sp) {
      var sr = sp.getBoundingClientRect();
      if (r.bottom <= sr.top || r.top >= sr.bottom || r.right <= sr.left || r.left >= sr.right) return false;
    }
    return !(r.bottom <= 0 || r.top >= global.innerHeight || r.right <= 0 || r.left >= global.innerWidth);
  }

  function retrack() {
    trackFrame = 0;
    var list = openHandles.slice();
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      if (h._closed) continue;

      var a = h.anchorEl;
      if (!a || a.isConnected === false) { closeHandle(h, true); continue; }

      /* ONE measurement per popup per frame, reused by the visibility test, the
       * placement and the sprout origin. */
      var r = a.getBoundingClientRect();
      if (!anchorVisibleFromRect(h, r)) {
        /* Immediate: animating a close while the page scrolls reads as a glitch. */
        closeHandle(h, true);
        continue;
      }

      /* Do nothing at all when the anchor has not actually moved. A scroll on a
       * container that does not contain the anchor still fires the listener, and
       * re-writing identical inline styles every frame is what turned scrolling
       * with a menu open into a forced-layout storm: write, then read, then
       * write again, sixty times a second. */
      var key = Math.round(r.left) + ',' + Math.round(r.top) + ',' +
                Math.round(r.width) + ',' + Math.round(r.height);
      if (h._anchorKey === key) continue;
      h._anchorKey = key;

      var placement = place(h.el, a, h.isSide, r);
      /* A refused placement must CLOSE the popup, not leave it where it was. place()
       * returns null when the anchor cannot be positioned against at all, and a popup
       * that stays open then is a menu floating with no relationship to anything. */
      if (!placement) { closeHandle(h, true); continue; }
      setSprout(h.el, r, placement, h.isSide);
    }
  }

  function onScrollOrResize() {
    if (!openHandles.length || trackFrame) return;
    trackFrame = global.requestAnimationFrame(retrack);
  }

  function startTracking() {
    if (tracking) return;
    tracking = true;
    /* Capture phase so scrolls inside the transcript are seen, not just page scroll. */
    global.addEventListener('scroll', onScrollOrResize, true);
    global.addEventListener('resize', onScrollOrResize);
  }

  function stopTracking() {
    if (!tracking) return;
    tracking = false;
    global.removeEventListener('scroll', onScrollOrResize, true);
    global.removeEventListener('resize', onScrollOrResize);
    if (trackFrame) { global.cancelAnimationFrame(trackFrame); trackFrame = 0; }
  }

  function closeHandle(handle, immediate) {
    if (!handle || handle._closed) return;
    handle._closed = true;

    /* Close descendants first so a submenu never outlives its parent. */
    for (var i = openHandles.length - 1; i >= 0; i--) {
      if (openHandles[i]._parent === handle) closeHandle(openHandles[i], immediate);
    }
    var idx = openHandles.indexOf(handle);
    if (idx >= 0) openHandles.splice(idx, 1);
    if (!openHandles.length) stopTracking();

    var el = handle.el;
    if (handle.anchorEl) handle.anchorEl.setAttribute('aria-expanded', 'false');

    function remove() {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      if (handle.onClose) handle.onClose();
    }

    if (immediate || M().reduced(el)) {
      el.classList.remove('is-open');
      remove();
      return;
    }
    el.classList.remove('is-open');
    el.classList.add('is-closing');
    M().afterTransition(el, 'transform', remove, 300);
  }

  function closeAll(except) {
    var list = openHandles.slice();
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i] !== except) closeHandle(list[i]);
    }
  }

  /* In-place resize with spring overshoot when option count or submenu content changes. */
  function resizeHandle(handle) {
    var el = handle.el;
    if (!el) return;
    if (M().reduced(el)) { el.style.height = ''; place(el, handle.anchorEl, handle.isSide); return; }

    var from = el.getBoundingClientRect().height;
    el.style.height = 'auto';
    var to = el.getBoundingClientRect().height;
    if (Math.abs(to - from) < 1) { el.style.height = ''; return; }

    el.style.height = from + 'px';
    void el.offsetHeight;
    el.style.height = to + 'px';
    el.classList.add('is-size-bounce');
    M().afterTransition(el, 'height', function () {
      el.style.height = '';
      el.classList.remove('is-size-bounce');
      place(el, handle.anchorEl, handle.isSide);
    }, handle.isSide ? 520 : 460);
  }

  function open(spec) {
    if (!spec || !spec.anchorEl) return null;
    var root = currentRoot(spec.anchorEl);
    if (!root) return null;

    var parent = spec.submenuOf || null;

    /* Mutual exclusion: exactly one transient overlay chain is live at a time. */
    if (parent) {
      for (var i = openHandles.length - 1; i >= 0; i--) {
        if (openHandles[i]._parent === parent) closeHandle(openHandles[i], true);
      }
    } else {
      closeAll(null);
    }

    var isSide = !!parent;
    var el = U().el('div', {
      class: ['pmx-popup', spec.kind ? 'pmx-popup-' + spec.kind : '', isSide ? 'pmx-popup-side' : ''],
      data: { pmxPopup: '1' }
    });

    /* Carry the originating concept's scope onto the portalled surface. Popup content is
     * appended to the overlay root, outside the stage subtree, so without this a concept
     * could only style its own popup content with an unscoped selector — which is exactly
     * what the CSS-scoping test forbids. */
    var scopeSrc = spec.anchorEl.closest ? spec.anchorEl.closest('[data-pmx-thread],[data-pmx-window]') : null;
    var stageSrc = spec.anchorEl.closest ? spec.anchorEl.closest('.pmx-stage') : null;
    var scopeHost = stageSrc || scopeSrc;
    if (scopeHost) {
      if (scopeHost.getAttribute('data-pmx-thread')) el.setAttribute('data-pmx-thread', scopeHost.getAttribute('data-pmx-thread'));
      /* The window id lives on the chat host, not the stage, so it is looked up separately:
       * copying only what the stage carries would leave a portalled popup unscoped and its
       * window-specific rules dead. */
      var winHost = scopeSrc && scopeSrc.getAttribute('data-pmx-window')
        ? scopeSrc
        : (spec.anchorEl.closest ? spec.anchorEl.closest('[data-pmx-window]') : null);
      if (winHost && winHost.getAttribute('data-pmx-window')) el.setAttribute('data-pmx-window', winHost.getAttribute('data-pmx-window'));
      if (scopeHost.getAttribute('data-theme')) el.setAttribute('data-theme', scopeHost.getAttribute('data-theme'));
      if (scopeHost.getAttribute('data-motion')) el.setAttribute('data-motion', scopeHost.getAttribute('data-motion'));
    }
    el.setAttribute('role', spec.kind === 'menu' ? 'menu' : 'dialog');
    if (spec.width) el.style.width = spec.width + 'px';

    var handle = {
      el: el, anchorEl: spec.anchorEl, isSide: isSide,
      _parent: parent, _closed: false, onClose: spec.onClose,
      /* Cached once: walking the ancestor chain on every scroll frame would
       * cost more than the repositioning it informs. */
      _scrollParent: scrollParentOf(spec.anchorEl)
    };

    var api = {
      host: el,
      close: function () { closeHandle(handle); },
      closeAll: function () { closeAll(null); },
      resize: function () { resizeHandle(handle); },
      openSubmenu: function (subSpec) {
        subSpec.submenuOf = handle;
        return open(subSpec);
      }
    };

    if (spec.build) spec.build(el, api);

    root.el.appendChild(el);
    var anchorRect = spec.anchorEl.getBoundingClientRect();
    var placement = place(el, spec.anchorEl, isSide, anchorRect);

    /* No usable position means no popup. Opening anyway would show it at whatever
     * position it happened to have — the corner of the containing block — with no
     * visual relationship to the control that was activated. Bail out completely:
     * remove the element, leave aria-expanded alone, and register nothing, so no
     * tracking runs and no stale handle survives for the next outside click. */
    if (!placement) {
      if (el.parentNode) el.parentNode.removeChild(el);
      handle._closed = true;
      return handle;
    }
    setSprout(el, anchorRect, placement, isSide);

    spec.anchorEl.setAttribute('aria-expanded', 'true');
    openHandles.push(handle);
    startTracking();

    /* One frame so the closed state commits before the open transition starts.
     * The guard matters: if this popup is closed again before the frame fires — which happens
     * whenever a second trigger is hit quickly — the pending callback would re-add `is-open`
     * to an element already on its way out, leaving a ghost overlay on screen that nothing
     * owns and no outside click can dismiss. */
    if (M().reduced(el)) {
      if (!handle._closed) el.classList.add('is-open');
    } else {
      global.requestAnimationFrame(function () {
        global.requestAnimationFrame(function () {
          if (handle._closed) return;
          el.classList.add('is-open');
        });
      });
    }

    return handle;
  }

  function attachRoot(overlayRootEl, ctx) {
    var rec = { el: overlayRootEl, ctx: ctx };
    roots.push(rec);
    overlayRootEl.classList.add('pmx-overlay-root');

    function onDocDown(ev) {
      if (!openHandles.length) return;
      var t = ev.target;
      for (var i = 0; i < openHandles.length; i++) {
        var h = openHandles[i];
        if (h.el.contains(t) || (h.anchorEl && h.anchorEl.contains(t))) return;
      }
      closeAll(null);
    }
    function onKey(ev) {
      if (ev.key !== 'Escape' || !openHandles.length) return;
      ev.stopPropagation();
      closeHandle(openHandles[openHandles.length - 1]);
    }
    var offDown = U().on(document, 'pointerdown', onDocDown, true);
    var offKey = U().on(document, 'keydown', onKey, true);

    return {
      destroy: function () {
        offDown(); offKey();
        closeAll(null);
        var i = roots.indexOf(rec);
        if (i >= 0) roots.splice(i, 1);
        overlayRootEl.classList.remove('pmx-overlay-root');
      }
    };
  }

  global.PMXPopup = {
    attachRoot: attachRoot,
    open: open,
    close: function (h) { closeHandle(h); },
    closeAll: closeAll,
    isOpen: function (h) { return !!h && !h._closed; },
    current: function () { return openHandles.length ? openHandles[openHandles.length - 1] : null; },
    openCount: function () { return openHandles.length; }
  };
})(window);
