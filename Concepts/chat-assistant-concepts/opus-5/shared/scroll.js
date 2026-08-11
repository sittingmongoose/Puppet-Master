/* PMX scroll — Opus 5
 * Scroll-position service for a transcript container: semantic anchor
 * capture/restore across remount, stick-to-bottom during streaming, an
 * above-viewport height-change correction, and jump-to-message with an
 * optional temporary highlight.
 *
 * Anchor tokens are always { msgId, offsetWithinMessage } — never a raw
 * scrollTop — because docked/pop-out remount destroys and rebuilds the DOM
 * at a different width (CONTRACT.md section 6). A message element is any
 * descendant of the attached container carrying a `data-msg-id` attribute;
 * every thread concept's renderItem() must set that attribute for anchor
 * capture/restore and jumpTo() to find it.
 *
 * This file is self-contained (no dependency on sibling shared/*.js load
 * order) so it behaves the same regardless of script include order.
 * Contract: CONTRACT.md section 6, 9. SERVICES.md "PMXScroll".
 */
(function (global) {
  'use strict';

  var DEFAULT_BOTTOM_THRESHOLD = 24;
  var DEFAULT_MESSAGE_ATTR = 'data-msg-id';
  var HIGHLIGHT_CLASS = 'pmx-jump-hit';
  var HIGHLIGHT_MS = 1600;

  function logError(label, e) {
    if (global.console && console.error) console.error('[pmx-scroll] ' + label, e);
  }

  /* ---- tiny local helpers (kept inline so this file has no load-order
   * dependency on shared/util.js) ------------------------------------------ */

  function rafBatch(fn) {
    var scheduled = false;
    return function batched() {
      if (scheduled) return;
      scheduled = true;
      global.requestAnimationFrame(function () {
        scheduled = false;
        fn();
      });
    };
  }

  function closest(node, selector) {
    if (node && typeof node.closest === 'function') return node.closest(selector);
    var cur = node;
    while (cur && cur.nodeType === 1) {
      var m = cur.matches || cur.msMatchesSelector || cur.webkitMatchesSelector;
      if (m && m.call(cur, selector)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  /* Reduced-motion is read from the nearest [data-motion] stage attribute,
   * never from documentElement, because a contact sheet renders several
   * stages (and several motion preferences) as siblings in one document. */
  function reducedMotion(refEl) {
    if (global.PMXMotion && typeof global.PMXMotion.reduced === 'function') {
      try { return !!global.PMXMotion.reduced(refEl); } catch (e) { logError('PMXMotion.reduced() threw, falling back', e); }
    }
    var stage = closest(refEl, '[data-motion]');
    if (stage) return stage.getAttribute('data-motion') === 'reduced';
    try {
      return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  /* ---- ScrollCtl ----------------------------------------------------------- */

  function ScrollCtl(scrollEl, opts) {
    if (!scrollEl || scrollEl.nodeType !== 1) {
      throw new Error('[pmx-scroll] attach() requires a scroll container element');
    }
    this.scrollEl = scrollEl;
    this.opts = opts || {};
    this.messageAttr = this.opts.messageAttr || DEFAULT_MESSAGE_ATTR;
    this.messageSelector = '[' + this.messageAttr + ']';
    this.threshold = typeof this.opts.bottomThreshold === 'number'
      ? this.opts.bottomThreshold
      : DEFAULT_BOTTOM_THRESHOLD;

    this._awayListeners = [];
    this._timers = [];        // { id, el } pending highlight-removal timeouts
    this._destroyed = false;

    /* Explicit scrollTop corrections (stickIfAtBottom, preserveAcross) are
     * applied synchronously in the same frame as the mutation that prompted
     * them. Native scroll anchoring tries to do the same job heuristically
     * and will fight an explicit correction, producing a double-shift. It is
     * switched off here from JS so no CSS file is needed for it. */
    this.scrollEl.style.overflowAnchor = 'none';

    this._lastAway = !this.isNearBottom();

    var self = this;
    this._onScroll = rafBatch(function () { self._checkAway(); });
    this.scrollEl.addEventListener('scroll', this._onScroll, { passive: true });
  }

  /* ---- anchor capture / restore -------------------------------------------
   * captureAnchor(): the first message element whose box intersects the top
   * edge of the container is the anchor; offsetWithinMessage records how far
   * the container has scrolled into it, so restoreAnchor() can reproduce the
   * exact same reading position even though the message re-rendered at a
   * different height (different width, different DOM). */

  ScrollCtl.prototype.captureAnchor = function () {
    var containerTop = this.scrollEl.getBoundingClientRect().top;
    var nodes = this.scrollEl.querySelectorAll(this.messageSelector);
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var rect = node.getBoundingClientRect();
      /* Skip messages that have fully scrolled past the top; the first one
       * whose bottom edge is still at or below the top edge is the anchor. */
      if (rect.bottom <= containerTop) continue;
      var msgId = node.getAttribute(this.messageAttr);
      if (!msgId) continue;
      var offsetWithinMessage = containerTop - rect.top;
      if (offsetWithinMessage < 0) offsetWithinMessage = 0;
      return { msgId: msgId, offsetWithinMessage: offsetWithinMessage };
    }
    return null;
  };

  ScrollCtl.prototype._findMessageEl = function (msgId) {
    if (msgId === null || msgId === undefined) return null;
    var nodes = this.scrollEl.querySelectorAll(this.messageSelector);
    var target = String(msgId);
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].getAttribute(this.messageAttr) === target) return nodes[i];
    }
    return null;
  };

  /* If the message referenced by the token is not currently rendered (e.g.
   * still outside a virtualized window's range), this returns gracefully so
   * the caller can load/ensureVisible the range and retry. */
  ScrollCtl.prototype.restoreAnchor = function (token) {
    if (!token || token.msgId === null || token.msgId === undefined) return false;
    var node = this._findMessageEl(token.msgId);
    if (!node) return false;
    var containerTop = this.scrollEl.getBoundingClientRect().top;
    var nodeTop = node.getBoundingClientRect().top;
    var currentOffset = containerTop - nodeTop;
    var wantOffset = typeof token.offsetWithinMessage === 'number' ? token.offsetWithinMessage : 0;
    var delta = wantOffset - currentOffset;
    if (delta) this.scrollEl.scrollTop += delta;
    return true;
  };

  /* ---- bottom stickiness ---------------------------------------------------
   * Threshold: within 24px of the bottom, or content shorter than the
   * viewport (nothing to scroll at all counts as "at the bottom"). */

  ScrollCtl.prototype.isNearBottom = function () {
    var el = this.scrollEl;
    if (el.scrollHeight <= el.clientHeight) return true;
    var distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance <= this.threshold;
  };

  /* Measure BEFORE mutating, mutate, then re-pin only if we were at the
   * bottom before the mutation ran. Reversing this order is the classic
   * streaming bug: measuring after the DOM has already grown always reads
   * "not at the bottom" because the just-appended content pushed the old
   * bottom out of view. */
  ScrollCtl.prototype.stickIfAtBottom = function (mutateFn) {
    var wasAtBottom = this.isNearBottom();
    if (typeof mutateFn === 'function') mutateFn();
    if (wasAtBottom) this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
    return wasAtBottom;
  };

  /* ---- above-viewport height correction -------------------------------- */

  ScrollCtl.prototype.preserveAcross = function (el, mutateFn) {
    if (!el || el.nodeType !== 1) {
      if (typeof mutateFn === 'function') mutateFn();
      return;
    }
    var containerTop = this.scrollEl.getBoundingClientRect().top;
    var beforeRect = el.getBoundingClientRect();
    var isAbove = beforeRect.bottom <= containerTop;
    var beforeHeight = beforeRect.height;

    if (typeof mutateFn === 'function') mutateFn();

    if (!isAbove) return; // on-screen: let the height transition read naturally
    var afterHeight = el.getBoundingClientRect().height;
    var delta = afterHeight - beforeHeight;
    if (delta) this.scrollEl.scrollTop += delta;
  };

  /* ---- jump to message --------------------------------------------------- */

  ScrollCtl.prototype.jumpTo = function (msgId, opts) {
    opts = opts || {};
    var el = this._findMessageEl(msgId);
    if (!el) return false;

    var reduced = reducedMotion(this.scrollEl);
    var behavior = reduced ? 'auto' : 'smooth';
    var block = opts.block || 'center';
    try {
      el.scrollIntoView({ behavior: behavior, block: block, inline: 'nearest' });
    } catch (e) {
      el.scrollIntoView(); // very old engines without the options-object form
    }

    if (opts.highlight) this._highlight(el);
    return true;
  };

  ScrollCtl.prototype._highlight = function (el) {
    var self = this;
    el.classList.add(HIGHLIGHT_CLASS);
    var entry = { id: null, el: el };
    entry.id = global.setTimeout(function () {
      el.classList.remove(HIGHLIGHT_CLASS);
      var idx = self._timers.indexOf(entry);
      if (idx >= 0) self._timers.splice(idx, 1);
    }, HIGHLIGHT_MS);
    this._timers.push(entry);
  };

  /* ---- away-from-bottom notifications --------------------------------------
   * Batched onto rAF (see rafBatch() above) so scroll events never trigger a
   * synchronous layout read; the listener list is checked once per frame at
   * most, and only notified when the near-bottom state actually flips. */

  ScrollCtl.prototype._checkAway = function () {
    if (this._destroyed) return;
    var away = !this.isNearBottom();
    if (away === this._lastAway) return;
    this._lastAway = away;
    var list = this._awayListeners.slice();
    for (var i = 0; i < list.length; i++) {
      try { list[i](away); } catch (e) { logError('onAwayChange listener failed', e); }
    }
  };

  ScrollCtl.prototype.onAwayChange = function (fn) {
    if (typeof fn !== 'function') return function () {};
    this._awayListeners.push(fn);
    /* Seed the cache by MEASURING before the first notification.
     *
     * `_lastAway` starts undefined, so this used to hand every new listener a falsy
     * value regardless of where the transcript actually sat, and _checkAway() only
     * runs on a real scroll — so nothing corrected it until the user scrolled. A
     * thread that mounts away from the bottom therefore showed no "jump to latest"
     * at exactly the moment it was most useful. */
    if (this._lastAway === undefined) this._lastAway = !this.isNearBottom();
    try { fn(this._lastAway); } catch (e) { logError('onAwayChange listener failed', e); }
    var self = this;
    return function off() {
      var idx = self._awayListeners.indexOf(fn);
      if (idx >= 0) self._awayListeners.splice(idx, 1);
    };
  };

  /* ---- teardown ------------------------------------------------------------
   * 8 instances exist at once on a contact sheet; nothing may be left
   * attached to the element (or, transitively, to document) after this. */
  ScrollCtl.prototype.destroy = function () {
    if (this._destroyed) return;
    this._destroyed = true;
    this.scrollEl.removeEventListener('scroll', this._onScroll);
    this._onScroll = null;
    for (var i = 0; i < this._timers.length; i++) {
      global.clearTimeout(this._timers[i].id);
      if (this._timers[i].el) this._timers[i].el.classList.remove(HIGHLIGHT_CLASS);
    }
    this._timers = [];
    this._awayListeners = [];
  };

  /* Find the element that ACTUALLY scrolls inside a region.
   *
   * A window owns a transcript region but does not own what goes in it: the thread module
   * renders its own scroll container (`.tN-scroll`) inside, and that is where the overflow
   * lives. A window reading `region.scrollTop` therefore reads a number that never changes.
   * This cost w3 all three of its gutter affordances (both jump buttons and the position
   * track, against a 5px range instead of the real 2026px) and cost w8 its auto-hiding
   * header capsule, which is that concept's signature behaviour.
   *
   * Returns the host itself when nothing better exists, and NEVER caches that fallback —
   * callers resolve before the thread has mounted, and a cached host would never be
   * reconsidered once the real scroller arrived. Callers should cache only a genuine hit
   * and re-resolve when it leaves the document. */
  function resolveScroller(host) {
    if (!host || !host.querySelectorAll) return host;
    var best = null, bestRange = host.scrollHeight - host.clientHeight;
    var kids = host.querySelectorAll('*');
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      var range = el.scrollHeight - el.clientHeight;
      if (range <= bestRange) continue;
      var oy = global.getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') { best = el; bestRange = range; }
    }
    return best || host;
  }

  global.PMXScroll = {
    attach: function (scrollEl, opts) { return new ScrollCtl(scrollEl, opts); },
    resolveScroller: resolveScroller
  };

  /* The namespace is not a controller. Every per-container method lives on the instance
   * attach() returns, because there is no single "current" scroller — a contact sheet has eight.
   *
   * Calling one of them on the namespace used to be a plain TypeError, which is fine when it
   * happens inline but disappears entirely inside a setTimeout or an event handler. That is
   * precisely how search-result jumping and every thread's above-viewport scroll correction were
   * broken for a whole build while the suites reported them green. These stubs make the mistake
   * name itself instead. */
  ['captureAnchor', 'restoreAnchor', 'isNearBottom', 'stickIfAtBottom',
   'preserveAcross', 'jumpTo', 'onAwayChange', 'destroy'].forEach(function (name) {
    global.PMXScroll[name] = function () {
      throw new Error('[pmx-scroll] ' + name + '() is a ScrollCtl method, not a PMXScroll one. ' +
        'Use the controller returned by PMXScroll.attach(el), or ThreadInstance.scrollToMessage() ' +
        'from a module that owns no scroll container.');
    };
  });
})(window);
