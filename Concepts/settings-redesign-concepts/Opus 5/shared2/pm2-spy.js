/* Opus 5 — scrollspy binding for concepts 05-11.
 *
 * The packet is emphatic about this and it is easy to miss, because the jump direction
 * works without it: `01_CORE_ARCHITECTURE` § Settings Workspace item 4 — "Scrolling
 * updates the active left-nav subcategory" — and the navigation video description,
 * "when the scroll crosses into a later category/section, the left highlight changes
 * WITHOUT REQUIRING A CLICK". A page index that only responds to clicks is half the
 * contract: it tells the reader where they asked to go, never where they are.
 *
 * The measuring is `shared/pm-sections.js`, which concepts 01-04 already use and which
 * is headless — it holds no DOM of its own and measures only at explicit layout
 * checkpoints. This file is the thin binding: a concept hands over its scroller, its
 * section elements and a callback, and paints the highlight in its own idiom.
 *
 * Portability note (Slint 1.17.1): the active section is a pure function of a section
 * offset table and a scroll offset. Nothing here reads the DOM to decide meaning, so
 * the same comparison runs against a Slint ScrollView's viewport-y.
 */
(function () {
  "use strict";

  /* One spy per concept. Re-binding on every render would leak a listener per page
   * visit, so the previous binding is always released first. */
  var current = null;

  /* The section a controlled jump asked for, and where the scroller stood when it
   * landed. Cleared by the reader's own first real scroll. */
  var pinned = null;
  var lastComputed = null;
  /* Concepts bind the spy and reveal the arrival in either order, and several of them
   * re-bind more than once per navigation, so a pin has to survive a re-bind. What
   * stops one navigation's pin leaking into the next is membership: a pin is kept only
   * while the section it names is still one of the sections being bound. */

  function release() {
    if (current && typeof current.unbind === "function") {
      try { current.unbind(); } catch (e) { /* already gone */ }
    }
    if (current && current.spy && typeof current.spy.destroy === "function") {
      try { current.spy.destroy(); } catch (e) { /* already gone */ }
    }
    current = null;
  }

  /* opts:
   *   scroller  the element that actually scrolls
   *   sections  [{ id, title, el }] in document order
   *   onActive  function (sectionId) — paint your own highlight
   *   inset     px from the top of the scroller at which a section counts as current
   */
  /* The element that actually scrolls, which is not always the first ancestor with an
   * overflow rule: a concept may declare `overflow:auto` on a wrapper whose child is
   * the one that grows. Walk up and take the first ancestor that BOTH permits scrolling
   * and genuinely overflows; fall back to the document. */
  function scrollerFor(node) {
    var n = node;
    var best = null;
    while (n && n !== document.body && n !== document.documentElement) {
      var s = window.getComputedStyle(n);
      if (/auto|scroll/.test(s.overflowY)) {
        if (n.scrollHeight > n.clientHeight + 24) return n;
        if (!best) best = n;
      }
      n = n.parentElement;
    }
    return best || document.scrollingElement || document.documentElement;
  }

  function bind(opts) {
    release();
    if (!window.PMSections || !opts || !opts.sections || !opts.sections.length) return null;
    if (!opts.scroller && opts.from) opts.scroller = scrollerFor(opts.from);
    if (opts.scroller && opts.scroller.scrollHeight <= opts.scroller.clientHeight + 24) {
      var better = scrollerFor(opts.scroller);
      if (better) opts.scroller = better;
    }
    if (!opts.scroller) return null;

    var spy = window.PMSections.create({
      scroller: opts.scroller,
      anchorInset: opts.inset == null ? 96 : opts.inset,
      /* Hysteresis so a section boundary sitting exactly on the anchor line does not
       * flicker between two entries while the reader nudges the wheel. */
      hysteresis: 0.14,
      onActive: function (entry) {
        if (!entry) return;
        var id = entry.id != null ? entry.id : entry;
        /* What the MEASUREMENT says, kept separately from what is painted. Releasing a
         * pin has to repaint from this: the underlying spy only emits on a change, and
         * while the pin was held its idea of the active section never changed, so
         * asking it to re-measure produces no event at all. */
        lastComputed = id;
        /* A controlled jump wins over the measurement until the reader actually
         * scrolls. Two cases make the raw measurement wrong right after an arrival:
         * a concept that centres the target leaves the PREVIOUS section across the
         * anchor line, and a jump near the end of a short document clamps at the
         * bottom so the LAST section is across it. Either way the reader asked for a
         * specific group and the nav has to say so. */
        if (pinned != null) {
          if (typeof opts.onActive === "function") opts.onActive(pinned);
          return;
        }
        if (typeof opts.onActive === "function") opts.onActive(id);
      }
    });

    spy.setSections(opts.sections.map(function (s) {
      return { id: s.id, categoryId: s.pageId || s.categoryId || null, title: s.title, el: s.el };
    }));

    current = { spy: spy, scroller: opts.scroller, onActive: opts.onActive };
    var stillHere = false;
    for (var i = 0; i < opts.sections.length; i++) {
      if (opts.sections[i].id === pinned) { stillHere = true; break; }
    }
    if (pinned != null && stillHere) {
      if (typeof opts.onActive === "function") opts.onActive(pinned);
    } else {
      pinned = null;
    }

    /* The pin is released by the READER scrolling, not by any scroll: an arrival
     * scrolls the page programmatically, and treating that as "the reader moved" is
     * what made the highlight snap to whichever group happened to sit on the anchor
     * line. Wheel, touch, and the keys that scroll are the reader; scrollTop is not. */
    var keys = { PageDown: 1, PageUp: 1, ArrowDown: 1, ArrowUp: 1, Home: 1, End: 1, " ": 1 };
    /* Listened for on the document rather than on the scroller, because a concept may
     * nest scrollers and the reader's wheel lands on whichever one is under the
     * pointer. Anything inside the bound scroller counts as the reader moving. */
    var unpin = function (e) {
      if (pinned == null) return;
      if (e && e.type === "keydown" && !keys[e.key]) return;
      /* No containment test: a concept may nest scrollers or put the one that moves
       * ABOVE the one the spy measures, and a pin that outlives the reader's own wheel
       * is worse than one released a moment early. */
      pinned = null;
      if (typeof spy.measure === "function") spy.measure();
      if (lastComputed != null && typeof opts.onActive === "function") opts.onActive(lastComputed);
    };
    document.addEventListener("wheel", unpin, true);
    document.addEventListener("touchmove", unpin, true);
    document.addEventListener("keydown", unpin, true);
    current = current || {};
    current.unbind = function () {
      document.removeEventListener("wheel", unpin, true);
      document.removeEventListener("touchmove", unpin, true);
      document.removeEventListener("keydown", unpin, true);
    };
    return spy;
  }

  /* Hold the highlight on the group a jump landed on. Takes the element so a concept
   * does not have to know which attribute carries the id. */
  function pinNode(node) {
    if (!node || !node.getAttribute) return;
    var id = node.getAttribute("data-pm-section");
    if (!id) return;
    pin(id);
  }

  function pin(id) {
    if (!id) return;
    pinned = id;
    if (current && typeof current.onActive === "function") current.onActive(id);
  }

  /* Called after a layout change — a disclosure opening, a width switch, a theme swap —
   * so the offset table is refreshed at a checkpoint rather than on every frame. */
  function remeasure() {
    if (current && current.spy && typeof current.spy.measure === "function") current.spy.measure();
  }

  window.PM2Spy = { bind: bind, release: release, remeasure: remeasure, scrollerFor: scrollerFor, pin: pin, pinNode: pinNode };
})();
