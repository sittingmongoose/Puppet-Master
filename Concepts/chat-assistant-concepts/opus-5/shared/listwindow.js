/* PMX listwindow — Opus 5
 * A bounded message-window renderer: the smallest thing that makes a ~700
 * message thread perform. Not a general virtualization framework — no
 * variable row recycling across unrelated keys, no horizontal mode, no
 * sticky headers. Just a top spacer, a bottom spacer, a measured-height
 * cache, and a minimal DOM diff at the edges of the rendered range.
 *
 * This file is self-contained (no dependency on sibling shared/*.js load
 * order) so it behaves the same regardless of script include order.
 * Contract: CONTRACT.md section 9. SERVICES.md "PMXListWindow".
 */
(function (global) {
  'use strict';

  var DEFAULT_OVERSCAN = 10;
  var DEFAULT_ESTIMATE = 64;

  function logError(label, e) {
    if (global.console && console.error) console.error('[pmx-listwindow] ' + label, e);
  }

  function clamp(n, lo, hi) {
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  }

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

  /* ---- ListWindow ----------------------------------------------------------- */

  function ListWindow(containerEl, opts) {
    if (!containerEl || containerEl.nodeType !== 1) {
      throw new Error('[pmx-listwindow] create() requires a container element');
    }
    this.container = containerEl;
    this.opts = opts || {};
    this.overscan = typeof this.opts.overscan === 'number' ? this.opts.overscan : DEFAULT_OVERSCAN;

    this._items = [];
    this._heightCache = {};        // key -> measured (or estimated) px height
    this._renderedNodes = {};      // key -> DOM node
    this._renderedOrder = [];      // keys currently attached, in index order
    this._startIndex = 0;
    this._endIndex = -1;
    this._topSpacerHeight = 0;
    this._forcedIndex = null;      // set only during ensureVisible()'s render pass
    this._destroyed = false;
    this._ro = null;

    /* The container is fully owned by the list window once created(); start
     * from a clean slate rather than trusting whatever markup happened to be
     * there (never innerHTML — remove nodes one at a time). */
    while (containerEl.firstChild) containerEl.removeChild(containerEl.firstChild);

    this.topSpacer = global.document.createElement('div');
    this.topSpacer.className = 'pmx-lw-spacer pmx-lw-spacer-top';
    this.topSpacer.style.height = '0px';
    this.bottomSpacer = global.document.createElement('div');
    this.bottomSpacer.className = 'pmx-lw-spacer pmx-lw-spacer-bottom';
    this.bottomSpacer.style.height = '0px';
    containerEl.appendChild(this.topSpacer);
    containerEl.appendChild(this.bottomSpacer);

    var self = this;
    this._onScroll = rafBatch(function () { self.refresh(); });
    this.container.addEventListener('scroll', this._onScroll, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      this._roScheduled = false;
      this._ro = new ResizeObserver(function () {
        if (self._roScheduled) return;
        self._roScheduled = true;
        global.requestAnimationFrame(function () {
          self._roScheduled = false;
          self._onResize();
        });
      });
      this._ro.observe(containerEl);
    }

    this._pullItems();
    this._render();
  }

  /* ---- item access ------------------------------------------------------ */

  ListWindow.prototype._keyOf = function (item, index) {
    if (typeof this.opts.keyOf === 'function') return this.opts.keyOf(item, index);
    return String(index);
  };

  ListWindow.prototype._estimate = function (item, index) {
    var e = this.opts.estimateHeight;
    if (typeof e === 'function') {
      var v = e(item, index);
      return (typeof v === 'number' && v > 0) ? v : DEFAULT_ESTIMATE;
    }
    if (typeof e === 'number' && e > 0) return e;
    return DEFAULT_ESTIMATE;
  };

  ListWindow.prototype._pullItems = function () {
    if (typeof this.opts.getItems === 'function') {
      var items = this.opts.getItems();
      this._items = items || [];
    }
    return this._items;
  };

  ListWindow.prototype._indexOfKey = function (key) {
    for (var i = 0; i < this._items.length; i++) {
      if (this._keyOf(this._items[i], i) === key) return i;
    }
    return -1;
  };

  /* ---- layout: cumulative offsets from the height cache ------------------ */

  ListWindow.prototype._computeLayout = function () {
    var items = this._items;
    var n = items.length;
    var offsets = new Array(n + 1);
    offsets[0] = 0;
    for (var i = 0; i < n; i++) {
      var key = this._keyOf(items[i], i);
      var h = Object.prototype.hasOwnProperty.call(this._heightCache, key)
        ? this._heightCache[key]
        : this._estimate(items[i], i);
      offsets[i + 1] = offsets[i] + h;
    }
    return { offsets: offsets, total: offsets[n] };
  };

  ListWindow.prototype._offsetIndex = function (offsets, y, n) {
    if (n <= 0) return 0;
    if (y <= 0) return 0;
    var lo = 0, hi = n - 1;
    while (lo < hi) {
      var mid = (lo + hi + 1) >> 1;
      if (offsets[mid] <= y) lo = mid; else hi = mid - 1;
    }
    return lo;
  };

  ListWindow.prototype._computeRange = function (layout) {
    var n = this._items.length;
    if (n === 0) return { start: 0, end: -1 };
    var start, end;
    if (this._forcedIndex !== null) {
      /* ensureVisible(): render a small window around the target index
       * alone, in place of the viewport-derived range — NOT a union of the
       * two. Unioning would mean rendering every item between the current
       * viewport and a target hundreds of messages away, defeating the
       * point of virtualizing at all. The caller (jumpTo/scrollIntoView)
       * is about to move scrollTop to the target anyway, and the next
       * natural scroll-triggered refresh() re-derives the range from the
       * new scrollTop, cleanly dropping this temporary window. */
      start = this._forcedIndex - this.overscan;
      end = this._forcedIndex + this.overscan;
    } else {
      var scrollTop = this.container.scrollTop;
      var viewportHeight = this.container.clientHeight || 0;
      start = this._offsetIndex(layout.offsets, scrollTop, n) - this.overscan;
      end = this._offsetIndex(layout.offsets, scrollTop + viewportHeight, n) + this.overscan;
    }
    start = clamp(start, 0, n - 1);
    end = clamp(end, 0, n - 1);
    if (end < start) end = start;
    return { start: start, end: end };
  };

  /* ---- render: minimal DOM diff + the no-scroll-jump invariant ----------- */

  ListWindow.prototype._render = function () {
    if (this._destroyed) return;
    var items = this._items;
    var layout = this._computeLayout();
    var range = this._computeRange(layout);
    var start = range.start, end = range.end;
    var oldTopHeight = this._topSpacerHeight;

    var newKeys = [];
    var newKeySet = {};
    var i, key;
    for (i = start; i <= end; i++) {
      key = this._keyOf(items[i], i);
      newKeys.push(key);
      newKeySet[key] = true;
    }

    /* Remove nodes that fell out of range. Nodes whose key is still in
     * range are left exactly where they are (no re-render, no DOM move
     * unless their position among siblings actually changed below). The
     * height cache entry is deliberately NOT cleared here — heights vary
     * enormously in this content, so a once-measured height is kept and
     * reused for offset math even while the item is unrendered again. */
    for (i = 0; i < this._renderedOrder.length; i++) {
      var oldKey = this._renderedOrder[i];
      if (newKeySet[oldKey]) continue;
      var doomed = this._renderedNodes[oldKey];
      if (doomed && doomed.parentNode) doomed.parentNode.removeChild(doomed);
      delete this._renderedNodes[oldKey];
    }

    /* Create-or-reuse in index order, inserting only where the DOM order
     * does not already match (cheap check, avoids needless reflow on the
     * common case of scrolling by a node or two). */
    var prevNode = this.topSpacer;
    var newlyMeasured = [];
    for (i = start; i <= end; i++) {
      key = newKeys[i - start];
      var el = this._renderedNodes[key];
      if (!el) {
        el = this.opts.renderItem(items[i], i);
        if (!el || el.nodeType !== 1) continue; // defensive: renderItem must return an element
        this._renderedNodes[key] = el;
        newlyMeasured.push({ key: key, el: el });
      }
      if (el.previousSibling !== prevNode) {
        this.container.insertBefore(el, prevNode.nextSibling);
      }
      prevNode = el;
    }
    this._renderedOrder = newKeys;

    /* Measure real height only for nodes just attached; already-rendered
     * nodes keep their cached measurement (re-measuring every node on every
     * scroll tick is exactly the layout-thrash this module exists to avoid). */
    for (i = 0; i < newlyMeasured.length; i++) {
      var rec = newlyMeasured[i];
      var h = rec.el.getBoundingClientRect().height || rec.el.offsetHeight || 0;
      this._heightCache[rec.key] = h;
    }

    /* Recompute offsets if any estimate was just replaced by a real
     * measurement so the spacer heights below reflect reality. */
    var layout2 = newlyMeasured.length ? this._computeLayout() : layout;
    var topHeight = layout2.offsets[start];
    var bottomHeight = layout2.total - layout2.offsets[end + 1];

    /* INVARIANT (do not break this): the top spacer's height stands in for
     * the real pixel height of every unrendered item above `start`. Any time
     * that stand-in height changes — because an item just crossed from
     * "estimated, in the spacer" to "rendered and measured" — the spacer
     * resize alone would shove every already-visible node down or up on
     * screen even though scrollTop did not move, which is the scroll jump.
     * Setting the spacer height and correcting scrollTop by the exact same
     * delta in this one synchronous pass (same frame, before paint) cancels
     * that shift: the pixel the user was looking at stays under their eye. */
    var delta = topHeight - oldTopHeight;
    this.topSpacer.style.height = topHeight + 'px';
    this.bottomSpacer.style.height = bottomHeight + 'px';
    if (delta) this.container.scrollTop = this.container.scrollTop + delta;

    this._topSpacerHeight = topHeight;
    this._startIndex = start;
    this._endIndex = end;
  };

  /* ---- resize: width changes invalidate every height estimate ------------ */

  ListWindow.prototype._onResize = function () {
    if (this._destroyed) return;
    /* Currently-rendered nodes are already laid out at the new width, so
     * their real height is cheap to re-read. Everything else falls back to
     * estimateHeight again until it is next rendered and honestly measured. */
    var kept = {};
    for (var key in this._renderedNodes) {
      if (!Object.prototype.hasOwnProperty.call(this._renderedNodes, key)) continue;
      var node = this._renderedNodes[key];
      kept[key] = node.getBoundingClientRect().height || node.offsetHeight || 0;
    }
    this._heightCache = kept;
    this._render();
  };

  /* ---- public API --------------------------------------------------------- */

  ListWindow.prototype.setItems = function (items) {
    this._items = items || [];
    this._render();
  };

  ListWindow.prototype.refresh = function () {
    this._pullItems();
    this._render();
  };

  ListWindow.prototype.ensureVisible = function (key) {
    var idx = this._indexOfKey(key);
    if (idx < 0) return false;
    this._forcedIndex = idx;
    try {
      this._render();
    } finally {
      this._forcedIndex = null;
    }
    return true;
  };

  ListWindow.prototype.measuredRange = function () {
    return { startIndex: this._startIndex, endIndex: this._endIndex };
  };

  ListWindow.prototype.destroy = function () {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this._ro) { try { this._ro.disconnect(); } catch (e) { logError('ResizeObserver disconnect failed', e); } this._ro = null; }
    if (this._onScroll) { this.container.removeEventListener('scroll', this._onScroll); this._onScroll = null; }
    for (var key in this._renderedNodes) {
      if (!Object.prototype.hasOwnProperty.call(this._renderedNodes, key)) continue;
      var node = this._renderedNodes[key];
      if (node && node.parentNode) node.parentNode.removeChild(node);
    }
    this._renderedNodes = {};
    this._renderedOrder = [];
    this._heightCache = {};
    if (this.topSpacer && this.topSpacer.parentNode) this.topSpacer.parentNode.removeChild(this.topSpacer);
    if (this.bottomSpacer && this.bottomSpacer.parentNode) this.bottomSpacer.parentNode.removeChild(this.bottomSpacer);
    this.topSpacer = null;
    this.bottomSpacer = null;
    this._items = [];
  };

  global.PMXListWindow = {
    create: function (containerEl, opts) { return new ListWindow(containerEl, opts); }
  };
})(window);
