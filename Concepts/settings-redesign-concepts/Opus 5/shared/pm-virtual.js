/* Opus 5 — windowed lists and latest-request-wins generations.
 *
 * Added by the 2026-08-13 dependency correction. The decision register requires
 * virtualized long lists (§7.3, §20.2) and generation/latest-request-wins
 * cancellation for search, previews and filters (§7.3). The original build
 * rendered every row of every list and had no cancellation token at all, so a
 * 100-installation or 50-server fixture would have produced one DOM node per
 * record and a slow filter could overwrite a fast one.
 *
 * Portability note (Slint 1.17.1): this returns a plain index window plus two
 * spacer heights. It measures nothing itself and holds no DOM, which is the
 * same shape a Slint `ListView` viewport callback provides.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------- windowing */

  /* windowFor() answers "which rows should exist right now". Everything above
   * and below the window is represented by one spacer each, so the scrollbar
   * stays truthful while the node count stays bounded. */
  function windowFor(opts) {
    var o = opts || {};
    var total = Math.max(0, o.total || 0);
    var rowHeight = o.rowHeight || 44;
    var viewport = o.viewport || 0;
    var scrollTop = Math.max(0, o.scrollTop || 0);
    var overscan = o.overscan == null ? 6 : o.overscan;

    /* A list that has not been measured yet renders a small first page rather
     * than everything: an unmeasured box is not a reason to build 800 rows. */
    if (!viewport) {
      var firstPage = Math.min(total, o.firstPage || 24);
      return { start: 0, end: firstPage, before: 0, after: Math.max(0, (total - firstPage) * rowHeight), total: total, windowed: total > firstPage };
    }

    var visible = Math.ceil(viewport / rowHeight);
    var start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    var end = Math.min(total, start + visible + overscan * 2);

    return {
      start: start,
      end: end,
      before: start * rowHeight,
      after: Math.max(0, (total - end) * rowHeight),
      total: total,
      windowed: (end - start) < total
    };
  }

  /* Threshold above which a list must be windowed. Below it the honest thing is
   * to render the rows: a spacer for nine items costs more than it saves. */
  var THRESHOLD = 40;

  function shouldVirtualize(count) { return count > THRESHOLD; }

  /* ----------------------------------------------------------- generations */

  /* Latest-request-wins. A slow filter that resolves after a fast one must not
   * overwrite it; the stale worker checks `current()` and discards itself. */
  function generations(name) {
    var current = 0;
    return {
      name: name || "generation",
      next: function () { current += 1; return current; },
      current: function () { return current; },
      isCurrent: function (token) { return token === current; },
      /* guard(fn) wraps a callback so it becomes a no-op once superseded. */
      guard: function (token, fn) {
        return function () {
          if (token !== current) return undefined;
          return fn.apply(null, arguments);
        };
      }
    };
  }

  /* ------------------------------------------------------- release helpers */

  /* A surface that goes away must be able to hand back everything it took.
   * Register §7.3: hidden surfaces stop hydrating and release subscriptions. */
  function releasePool() {
    var releases = [];
    return {
      add: function (off) { if (typeof off === "function") releases.push(off); return off; },
      size: function () { return releases.length; },
      releaseAll: function () {
        while (releases.length) {
          var off = releases.pop();
          try { off(); } catch (e) {}
        }
      }
    };
  }

  window.PMVirtual = {
    windowFor: windowFor,
    shouldVirtualize: shouldVirtualize,
    THRESHOLD: THRESHOLD,
    generations: generations,
    releasePool: releasePool
  };
})();
