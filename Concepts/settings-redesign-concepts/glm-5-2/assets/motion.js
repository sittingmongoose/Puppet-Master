/* motion.js — shared motion utilities for all four GLM-5.2 concepts.
   Film-level: directed continuity, clear staging, confident timing. NOT constant animation.
   Every helper respects PM.state.reducedMotion → opacity/state-only fallback per moment.
   Semantic state stays separate from DOM geometry (Slint-portable per packet 05). */
(function () {
  "use strict";
  var M = window.PM.motion = {};
  var reduced = function () { return PM.state && PM.state.reducedMotion; };

  /* ---------- FLIP (First-Last-Invert-Play) ----------
     Use for reorders, expansions, and "layout settles before text is revealed". */
  M.flip = function (el, applyChange, opts) {
    opts = opts || {};
    if (!el || reduced()) { applyChange && applyChange(); return; }
    var first = el.getBoundingClientRect();
    applyChange && applyChange();
    var last = el.getBoundingClientRect();
    var dx = first.left - last.left, dy = first.top - last.top;
    var sx = first.width / Math.max(1, last.width), sy = first.height / Math.max(1, last.height);
    if (!dx && !dy && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
    var inv = "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")";
    el.style.transition = "none";
    el.style.transformOrigin = "top left";
    el.style.transform = inv;
    // force reflow
    void el.offsetWidth;
    el.style.transition = "transform " + (opts.duration || 320) + "ms " + (opts.ease || "var(--ease)");
    el.style.transform = "";
    M._after(el, opts.duration || 320, function () {
      el.style.transition = ""; el.style.transform = ""; el.style.transformOrigin = "";
      opts.done && opts.done();
    });
  };

  /* ---------- staggered reveal of children ----------
     "layout settles before text is revealed" — container appears, then items cascade. */
  M.staggerIn = function (container, selector, opts) {
    opts = opts || {};
    if (!container) return;
    var items = selector ? Array.prototype.slice.call(container.querySelectorAll(selector)) : [container];
    if (reduced()) {
      items.forEach(function (it) { it.style.opacity = ""; it.style.transform = ""; });
      return;
    }
    var step = opts.step || 35;
    var dur = opts.duration || 380;
    var delay = opts.delay || 0;
    var ease = opts.ease || "var(--ease-settle)";
    var axis = opts.axis || "y"; // 'y' | 'x' | 'none'
    items.forEach(function (it, i) {
      it.style.opacity = "0";
      if (axis === "y") it.style.transform = "translateY(8px)";
      if (axis === "x") it.style.transform = "translateX(12px)";
      it.style.transition = "opacity " + dur + "ms " + ease + ", transform " + dur + "ms " + ease;
      var t = setTimeout(function () {
        it.style.opacity = "";
        it.style.transform = "";
      }, delay + i * step);
      M._after(it, delay + i * step + dur + 40, function () {
        it.style.transition = ""; it.style.opacity = ""; it.style.transform = "";
      });
    });
  };

  /* ---------- directed view-swap ----------
     Old fades+slides out in `outDir`, new fades+slides in from `inDir`.
     dirs: 'left'|'right'|'up'|'down'|'none' */
  M.transitionView = function (fromEl, toEl, opts) {
    opts = opts || {};
    var dur = opts.duration || 300;
    var ease = opts.ease || "var(--ease)";
    var outDir = opts.outDir || "left";
    var inDir = opts.inDir || "right";
    var offset = function (dir) {
      if (reduced() || dir === "none") return { x: 0, y: 0 };
      if (dir === "left") return { x: -24, y: 0 };
      if (dir === "right") return { x: 24, y: 0 };
      if (dir === "up") return { x: 0, y: -18 };
      return { x: 0, y: 18 };
    };
    if (fromEl && !reduced()) {
      var o = offset(outDir);
      fromEl.style.transition = "opacity " + (dur * 0.7) + "ms " + ease + ", transform " + (dur * 0.7) + "ms " + ease;
      fromEl.style.transform = "translate(" + o.x + "px," + o.y + "px)";
      fromEl.style.opacity = "0";
    }
    if (toEl) {
      var n = offset(inDir);
      if (reduced()) { toEl.style.opacity = ""; toEl.style.transform = ""; return; }
      toEl.style.opacity = "0";
      toEl.style.transform = "translate(" + (-n.x) + "px," + (-n.y) + "px)";
      toEl.style.transition = "none";
      void toEl.offsetWidth;
      var startDelay = fromEl ? Math.max(0, dur * 0.3) : 0;
      setTimeout(function () {
        toEl.style.transition = "opacity " + dur + "ms " + ease + ", transform " + dur + "ms " + ease;
        toEl.style.opacity = "";
        toEl.style.transform = "";
      }, startDelay);
      M._after(toEl, startDelay + dur + 40, function () {
        toEl.style.transition = ""; toEl.style.opacity = ""; toEl.style.transform = "";
      });
    }
  };

  /* ---------- smooth jump with focus handoff ----------
     Eased scroll-to; reduced motion = instant. Returns a promise. */
  M.smoothJump = function (scroller, targetTop) {
    return new Promise(function (resolve) {
      if (!scroller) { resolve(); return; }
      if (reduced()) { scroller.scrollTop = targetTop; resolve(); return; }
      scroller.scrollTo({ top: targetTop, behavior: "smooth" });
      setTimeout(resolve, 360);
    });
  };

  /* ---------- single subtle attention pulse (NO endless pulsing) ---------- */
  M.pulseOnce = function (el, opts) {
    opts = opts || {};
    if (!el) return;
    if (reduced()) {
      // opacity-only single pulse
      el.style.transition = "opacity 200ms ease";
      el.style.opacity = "0.5";
      setTimeout(function () { el.style.opacity = ""; }, 160);
      setTimeout(function () { el.style.transition = ""; el.style.opacity = ""; }, 420);
      return;
    }
    var keyframe = opts.keyframe || "pm-pulse-once";
    el.classList.remove(keyframe);
    void el.offsetWidth;
    el.classList.add(keyframe);
    setTimeout(function () { el.classList.remove(keyframe); }, (opts.duration || 700) + 40);
  };

  /* ---------- cross-fade (used for manager channels / inline swaps) ---------- */
  M.crossFade = function (container, applyChange, opts) {
    opts = opts || {};
    if (!container) { applyChange && applyChange(); return; }
    if (reduced()) { applyChange && applyChange(); return; }
    var dur = opts.duration || 220;
    var ease = opts.ease || "var(--ease)";
    container.style.transition = "opacity " + (dur / 2) + "ms " + ease;
    container.style.opacity = "0";
    setTimeout(function () {
      applyChange && applyChange();
      void container.offsetWidth;
      container.style.opacity = "1";
      setTimeout(function () { container.style.transition = ""; container.style.opacity = ""; }, dur / 2 + 40);
    }, dur / 2);
  };

  /* ---------- grow-with-settle (Stack expand: height settles, then content fades in) ---------- */
  M.growSettle = function (container, applyChange, opts) {
    opts = opts || {};
    if (!container) { applyChange && applyChange(); return; }
    if (reduced()) { applyChange && applyChange(); return; }
    var dur = opts.duration || 320;
    var ease = opts.ease || "var(--ease-settle)";
    // measure before
    var firstH = container.getBoundingClientRect().height;
    applyChange && applyChange();
    var lastH = container.getBoundingClientRect().height;
    if (Math.abs(lastH - firstH) < 1) return;
    container.style.overflow = "hidden";
    container.style.height = firstH + "px";
    container.style.transition = "height " + dur + "ms " + ease;
    void container.offsetWidth;
    container.style.height = lastH + "px";
    // fade the inner content in after the height mostly settles
    var inner = opts.inner || container.firstElementChild;
    if (inner) {
      inner.style.opacity = "0";
      setTimeout(function () {
        inner.style.transition = "opacity 200ms " + ease;
        inner.style.opacity = "1";
      }, dur * 0.6);
    }
    setTimeout(function () {
      container.style.transition = ""; container.style.height = ""; container.style.overflow = "";
      if (inner) { inner.style.transition = ""; inner.style.opacity = ""; }
    }, dur + 80);
  };

  /* ---------- internal timer tracking (so concepts can cancel pending motion) ---------- */
  M._timers = new Set();
  M._after = function (el, ms, fn) {
    var t = setTimeout(function () { M._timers.delete(t); fn && fn(); }, ms);
    M._timers.add(t);
    return t;
  };
  M.cancelAll = function () {
    M._timers.forEach(function (t) { clearTimeout(t); });
    M._timers.clear();
  };

  /* ---------- inject the shared pulse keyframe once ---------- */
  M.install = function () {
    if (document.getElementById("pm-motion-keyframes")) return;
    var s = document.createElement("style");
    s.id = "pm-motion-keyframes";
    s.textContent = [
      "@keyframes pm-pulse-once {",
      "  0% { box-shadow: 0 0 0 0 var(--accent-soft); }",
      "  45% { box-shadow: 0 0 0 6px var(--accent-soft); }",
      "  100% { box-shadow: 0 0 0 0 transparent; }",
      "}",
      "@keyframes pm-pulse-soft {",
      "  0%,100% { opacity: 1; }",
      "  50% { opacity: .55; }",
      "}",
      "[data-reduced-motion=\"1\"] .pm-pulse-once,",
      "[data-reduced-motion=\"1\"] .pm-pulse-soft { animation: none !important; }"
    ].join("\n");
    document.head.appendChild(s);
  };
})();
