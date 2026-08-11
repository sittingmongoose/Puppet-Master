/* Opus 5 — section model, jump, and scrollspy.
 *
 * Shared by all four concepts; each concept renders the result completely
 * differently (outline tree, margin index, adjacent column, edge mini-map).
 *
 * Portability note (Slint 1.17.1): the active subcategory is a PURE FUNCTION of
 * a section table plus a scroll offset. The DOM is measured only at explicit
 * layout checkpoints (load, resize, disclosure toggle, category swap, theme or
 * width change) to refresh that table — never per frame, and never as the
 * source of semantic state. In Slint the same table comes from layout callbacks
 * and the same comparison runs against ScrollView.viewport-y.
 */
(function () {
  "use strict";

  function create(options) {
    var scroller = options.scroller;
    var anchorInset = options.anchorInset || 88;
    var hysteresisRatio = options.hysteresis == null ? 0.12 : options.hysteresis;
    var onActive = options.onActive || function () {};
    var onScroll = options.onScroll || function () {};

    var sections = [];      // [{ id, categoryId, title, order, el, offset, height }]
    var activeIdx = -1;
    var navigationLock = 0; // timestamp until which scrollspy is suppressed
    var frame = 0;
    var alive = true;

    var measured = false;
    var retries = 0;

    function setSections(list) {
      sections = list.map(function (s, i) {
        return { id: s.id, categoryId: s.categoryId, title: s.title, order: i, el: s.el, offset: 0, height: 0 };
      });
      activeIdx = -1;
      measured = false;
      retries = 0;
      scheduleMeasure();
    }

    /* The table must be built once layout has happened — but it must never
     * depend on a frame being painted. requestAnimationFrame is throttled or
     * suspended entirely in a hidden or non-compositing tab, and a Settings page
     * that silently never measures is a real failure, not a cosmetic one. So:
     * try immediately, then on the next frame, then on plain timers. measure()
     * is idempotent, so running more than once is harmless. */
    function scheduleMeasure() {
      measure();
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(function () { window.requestAnimationFrame(measure); });
      }
      window.setTimeout(measure, 0);
      window.setTimeout(measure, 64);
    }

    /* Explicit layout checkpoint. Nothing else reads geometry. */
    function measure() {
      if (!alive || !scroller || !sections.length) return;
      if (scroller.clientHeight < 40) {
        // Not laid out yet. Retry on a timer (not a frame), and give up after a
        // bounded number of attempts rather than spinning forever.
        if (retries++ < 40) window.setTimeout(measure, 32);
        return;
      }
      var base = scroller.getBoundingClientRect().top - scroller.scrollTop;
      for (var i = 0; i < sections.length; i++) {
        var el = sections[i].el;
        if (!el) continue;
        var r = el.getBoundingClientRect();
        sections[i].offset = Math.round(r.top - base);
        sections[i].height = Math.round(r.height);
      }
      measured = true;
      evaluate();
    }

    function band() {
      var h = scroller ? scroller.clientHeight : 800;
      return Math.max(24, Math.round(h * hysteresisRatio));
    }

    /* Pure: given the table, a probe position and the current index, which
     * section is active? Hysteresis prevents oscillation at a boundary. */
    function computeActive(probe, currentIdx, bandPx, atBottom) {
      if (!sections.length) return -1;
      if (atBottom) return sections.length - 1;

      var idx = 0;
      for (var i = 0; i < sections.length; i++) {
        if (probe >= sections[i].offset) idx = i; else break;
      }
      if (currentIdx < 0) return idx;
      if (idx === currentIdx) return currentIdx;
      if (idx > currentIdx) {
        return probe >= sections[idx].offset + bandPx ? idx : currentIdx;
      }
      return probe <= sections[currentIdx].offset - bandPx ? idx : currentIdx;
    }

    /* The navigation lock is absolute. A re-measure that lands mid-travel would
     * otherwise read the scroll position part-way through a jump, reassign the
     * active section to whatever it is passing, and the hysteresis band would
     * then refuse to correct it on arrival. jump() clears the lock itself
     * before asking for the reconciling evaluation. */
    function evaluate() {
      if (!alive || !scroller || !sections.length) return;
      if (Date.now() < navigationLock) return;

      var top = scroller.scrollTop;
      var atBottom = top + scroller.clientHeight >= scroller.scrollHeight - 3;
      var idx = computeActive(top + anchorInset, activeIdx, band(), atBottom);

      // A failing readout must not be able to stop the spy itself.
      try {
        onScroll({ scrollTop: top, atBottom: atBottom, sections: sections });
      } catch (err) {
        if (window.console) window.console.error("[Opus 5] scrollspy readout failed", err);
      }

      if (idx !== activeIdx && idx >= 0) {
        activeIdx = idx;
        try {
          onActive(sections[idx].id, sections[idx]);
        } catch (err2) {
          if (window.console) window.console.error("[Opus 5] scrollspy onActive failed", err2);
        }
      }
    }

    /* Coalesce to one evaluation per frame while frames are flowing, but never
     * let a missing frame wedge the flag and stop the spy for good. */
    function handleScroll() {
      if (frame) return;
      frame = 1;
      var ran = false;
      function run() {
        if (ran) return;
        ran = true;
        frame = 0;
        evaluate();
      }
      if (window.requestAnimationFrame) window.requestAnimationFrame(run);
      window.setTimeout(run, 64);
    }

    /* The travel itself is owned here rather than delegated to CSS
     * scroll-behavior. That keeps three promises the packet asks for: the jump
     * always lands on the exact offset, the duration matches the concept's
     * motion philosophy, and reduced motion is a real branch rather than a hint
     * the platform may ignore. It also maps directly to animating a Slint
     * ScrollView's viewport-y. */
    var travelToken = 0;

    function travel(top, duration, done) {
      var token = ++travelToken;
      var start = scroller.scrollTop;
      var delta = top - start;
      var finished = false;

      function finish() {
        if (finished || token !== travelToken) return;
        finished = true;
        scroller.scrollTop = top;
        if (done) done();
      }

      if (!duration || Math.abs(delta) < 2 || !window.requestAnimationFrame) {
        finish();
        return;
      }

      var t0 = 0;
      function step(ts) {
        if (finished || token !== travelToken || !alive) return;  // superseded or torn down
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / duration);
        var eased = 1 - Math.pow(1 - p, 3);           // one confident ease-out
        scroller.scrollTop = start + delta * eased;
        if (p < 1) window.requestAnimationFrame(step);
        else finish();
      }
      window.requestAnimationFrame(step);

      // If frames are not being served (hidden tab, throttled rAF) the jump
      // still has to land. Motion is optional; arriving is not.
      window.setTimeout(finish, duration + 90);
    }

    function reducedMotion() {
      var attr = document.documentElement.getAttribute("data-reduced-motion");
      if (attr === "1") return true;
      if (attr === "0") return false;
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    /* Controlled jump: lands at a stable offset, then reconciles the spy. */
    function jump(id, opts) {
      if (!measured) measure();
      var target = null;
      for (var i = 0; i < sections.length; i++) if (sections[i].id === id) { target = sections[i]; break; }
      if (!target || !scroller) return false;

      var reduced = reducedMotion();
      var top = Math.max(0, target.offset - anchorInset);
      var max = scroller.scrollHeight - scroller.clientHeight;
      top = Math.min(top, Math.max(0, max));

      var duration = reduced ? 0 : 300;
      // Suppress the spy while the travel is in progress, then reconcile.
      navigationLock = Date.now() + duration + 60;

      var idx = sections.indexOf(target);
      if (idx !== activeIdx) {
        activeIdx = idx;
        onActive(target.id, target);
      }

      travel(top, duration, function () {
        navigationLock = 0;
        evaluate();
        if (opts && opts.focusEl) applyArrivalFocus(opts.focusEl, reduced);
      });
      return true;
    }

    function activeId() { return activeIdx >= 0 && sections[activeIdx] ? sections[activeIdx].id : null; }
    function table() { return sections; }
    function contentHeight() { return scroller ? scroller.scrollHeight : 0; }
    function viewport() {
      return scroller ? { top: scroller.scrollTop, height: scroller.clientHeight } : { top: 0, height: 0 };
    }

    function destroy() {
      alive = false;
      if (scroller) scroller.removeEventListener("scroll", handleScroll);
      frame = 0;
    }

    if (scroller) scroller.addEventListener("scroll", handleScroll, { passive: true });

    return {
      setSections: setSections,
      measure: measure,
      jump: jump,
      activeId: activeId,
      table: table,
      viewport: viewport,
      contentHeight: contentHeight,
      evaluate: evaluate,
      destroy: destroy
    };
  }

  /* Brief, non-flashing arrival treatment. One pass, no pulse loop.
   * Reduced motion holds a static ring and then releases it. */
  function applyArrivalFocus(el, reduced) {
    if (!el) return;
    el.classList.remove("pm-arrived");
    // Force the class to re-apply cleanly without reading layout for meaning.
    void el.offsetWidth;
    el.setAttribute("data-arrival", reduced ? "static" : "animated");
    el.classList.add("pm-arrived");
    var hold = reduced ? 1600 : 950;
    window.setTimeout(function () {
      el.classList.remove("pm-arrived");
      el.removeAttribute("data-arrival");
    }, hold);
    if (typeof el.focus === "function") {
      try { el.focus({ preventScroll: true }); } catch (e) { /* focus is best effort */ }
    }
  }

  /* Run fn once the browser has had a chance to lay out, without depending on a
   * frame ever being painted. Used before a deep-link jump so the section table
   * is real before we travel. */
  function afterLayout(fn) {
    var done = false;
    function run() { if (done) return; done = true; fn(); }
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function () { window.requestAnimationFrame(run); });
    }
    window.setTimeout(run, 48);
  }

  window.PMSections = { create: create, applyArrivalFocus: applyArrivalFocus, afterLayout: afterLayout };
})();
