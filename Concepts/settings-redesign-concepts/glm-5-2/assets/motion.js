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
    if (opts.limit) items = items.slice(0, opts.limit); // bounded stagger (≤8 by convention)
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
     dirs: 'left'|'right'|'up'|'down'|'none'; opts.zoom adds a cartographic
     scale settle (Atlas region→focus); opts.origin {x,y in %} makes the entrance
     radiate from the invoking control (packet 09: "Establish spatial origin"). */
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
    // origin-directed entrance: offset points from the captured origin toward center
    var originOffset = function () {
      var ox = (opts.origin.x - 50) / 50, oy = (opts.origin.y - 50) / 50;
      var len = Math.max(1, Math.sqrt(ox * ox + oy * oy));
      return { x: ox / len * 22, y: oy / len * 16 };
    };
    if (fromEl && !reduced()) {
      var o = offset(outDir);
      var outScale = opts.zoom ? " scale(.985)" : "";
      fromEl.style.transition = "opacity " + (dur * 0.7) + "ms " + ease + ", transform " + (dur * 0.7) + "ms " + ease;
      fromEl.style.transform = "translate(" + o.x + "px," + o.y + "px)" + outScale;
      fromEl.style.opacity = "0";
    }
    if (toEl) {
      var n = opts.origin && !reduced() ? originOffset() : offset(inDir);
      if (reduced()) { toEl.style.opacity = ""; toEl.style.transform = ""; if (opts.origin) toEl.style.transformOrigin = ""; return; }
      var inScale = opts.zoom ? " scale(1.035)" : "";
      if (opts.origin) toEl.style.transformOrigin = opts.origin.x + "% " + opts.origin.y + "%";
      toEl.style.opacity = "0";
      toEl.style.transform = "translate(" + (-n.x) + "px," + (-n.y) + "px)" + inScale;
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
        if (opts.origin) toEl.style.transformOrigin = "";
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

  /* ---------- FLIP a set of siblings (reorder displacement) ----------
     Captures each child's rect, applies the layout change, then inverts+plays
     every child that actually moved. Used by Stack expand/collapse so the rows
     below slide open smoothly instead of jumping. */
  M.flipSiblings = function (container, applyChange, opts) {
    opts = opts || {};
    if (!container) { applyChange && applyChange(); return; }
    var kids = Array.prototype.slice.call(container.children);
    if (reduced()) { applyChange && applyChange(); return; }
    var first = kids.map(function (k) { var r = k.getBoundingClientRect(); return { el: k, top: r.top, left: r.left }; });
    applyChange && applyChange();
    kids.forEach(function (k, i) {
      var last = k.getBoundingClientRect();
      var dy = first[i].top - last.top, dx = first[i].left - last.left;
      if (Math.abs(dy) < 1 && Math.abs(dx) < 1) return;
      // showcase: a whisper of rotation during flight reads as a deck of cards
      var spin = opts.rotate ? " rotate(" + (dy >= 0 ? 0.5 : -0.5).toFixed(1) + "deg)" : "";
      k.style.transition = "none";
      k.style.transform = "translate(" + dx + "px," + dy + "px)" + spin;
      void k.offsetWidth;
      k.style.transition = "transform " + (opts.duration || 300) + "ms " + (opts.ease || "var(--ease-settle)");
      k.style.transform = "";
      M._after(k, (opts.duration || 300) + 60, function () { k.style.transition = ""; k.style.transform = ""; });
    });
  };

  /* ---------- number count-up (vitals / stats; settles, never spins forever) ---------- */
  M.countUp = function (el, to, opts) {
    opts = opts || {};
    if (!el) return;
    var from = opts.from || 0;
    var dur = opts.duration || 700;
    var t0 = null;
    if (reduced()) { el.textContent = String(to); return; }
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /* ---------- ORIGIN CAPTURE (packet 09: "Establish spatial origin") ----------
     Records the clicked control's position on the stage so view entrances radiate
     from the point of invocation. Cheap: two CSS vars, no per-frame work. */
  M.captureOrigin = function (el) {
    if (!el || !el.getBoundingClientRect) return;
    var stage = document.querySelector("[data-stage]");
    if (!stage) return;
    var r = el.getBoundingClientRect();
    var s = stage.getBoundingClientRect();
    var x = (r.left + r.width / 2 - s.left) / Math.max(1, s.width);
    var y = (r.top + r.height / 2 - s.top) / Math.max(1, s.height);
    stage.style.setProperty("--pm-origin-x", (x * 100).toFixed(1) + "%");
    stage.style.setProperty("--pm-origin-y", (y * 100).toFixed(1) + "%");
    stage.dataset.pmOrigin = "1";
  };
  M.clearOrigin = function () {
    var stage = document.querySelector("[data-stage]");
    if (stage) { stage.style.removeProperty("--pm-origin-x"); stage.style.removeProperty("--pm-origin-y"); delete stage.dataset.pmOrigin; }
  };

  /* ---------- SPRING (critically-damped rAF settle on transform) ----------
     Interactive physics for pointer returns, pin drops, reorder overshoot.
     Animates transform strings built by the caller's setter; state-only under
     reduced motion (setter applied once). */
  M.spring = function (el, apply, opts) {
    opts = opts || {};
    if (!el) return;
    var stiff = opts.stiffness || 170;   // ~spring constant
    var damp = opts.damping || 22;       // near critical
    var from = opts.from != null ? opts.from : 1.12;
    var to = opts.to != null ? opts.to : 1;
    var v = opts.velocity || 0;
    if (reduced()) { apply && apply(to); return; }
    var x = from, last = null, raf = 0, t0 = null;
    var alive = true;
    el.dataset.pmSpring = "1";
    function settle() {
      apply && apply(to);
      delete el.dataset.pmSpring;
    }
    function step(ts) {
      if (!alive) return;
      if (last === null) { last = ts; t0 = ts; }
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      var f = -stiff * (x - to) - damp * v;
      v += f * dt; x += v * dt;
      apply && apply(x);
      var settled = Math.abs(x - to) < 0.0015 && Math.abs(v) < 0.02;
      // force-settle so no spring can outlive its welcome (strict-calm guarantee)
      if (settled || (ts - t0) > 1100) { settle(); return; }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    M._springs = M._springs || new Set();
    M._springs.add(raf);
    return function stop() { alive = false; cancelAnimationFrame(raf); };
  };

  /* ---------- POINTER GLOW + TILT + MAGNETIC PRESS (showcase pass) ----------
     Delegated, rAF-throttled, transform-only. Writes CSS vars (--mx/--my for the
     cursor light, --tilt-x/--tilt-y composed into each concept's hover transform)
     so stylesheet rules stay the single owner of layout transforms. Gated:
     fine pointer + hover, not reduced motion, paused when the tab is hidden.
     Zero work when idle. */
  M.pointerFX = function (root, opts) {
    opts = opts || {};
    var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine || !fine.matches) return;
    var host = root || document;
    var tiltSel = opts.tilt || ".cr-dest, .at-region, .owned-card, .recent-item";
    var maxTilt = opts.maxTilt || 1.5;
    var pending = null, raf = 0;

    function targetOf(e) {
      if (!e.target || !e.target.closest) return null;
      var el = e.target.closest(tiltSel);
      return el && host.contains(el) ? el : null;
    }
    host.addEventListener("pointermove", function (e) {
      pending = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var ev = pending; pending = null;
        if (!ev || document.hidden || PM.state.reducedMotion) return;
        var card = targetOf(ev);
        if (!card) return;
        var r = card.getBoundingClientRect();
        var mx = ((ev.clientX - r.left) / Math.max(1, r.width)) * 100;
        var my = ((ev.clientY - r.top) / Math.max(1, r.height)) * 100;
        card.style.setProperty("--mx", mx.toFixed(1) + "%");
        card.style.setProperty("--my", my.toFixed(1) + "%");
        if (card.dataset.pmTilt === "1") {
          card.style.setProperty("--tilt-x", (((my / 100) - 0.5) * -2 * maxTilt).toFixed(2) + "deg");
          card.style.setProperty("--tilt-y", (((mx / 100) - 0.5) * 2 * maxTilt).toFixed(2) + "deg");
        }
      });
    }, { passive: true });
    host.addEventListener("pointerout", function (e) {
      var card = targetOf(e);
      if (!card) return;
      // vars fall back to 0deg in CSS; the existing transition returns the card
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    }, { passive: true });
    // magnetic press on buttons: scale-dip, spring return (button owns no hover transform)
    host.addEventListener("pointerdown", function (e) {
      var btn = e.target.closest && e.target.closest(".btn, .pm-act-btn, .theme-sw, .sr-channel, .cr-toc-cat, .cr-toc-sub");
      if (!btn || PM.state.reducedMotion || document.hidden) return;
      btn.style.transition = "transform 90ms var(--ease)";
      btn.style.transform = "scale(.96)";
      var up = function () {
        document.removeEventListener("pointerup", up);
        M.spring(btn, function (v) { btn.style.transform = "scale(" + v.toFixed(3) + ")"; }, { from: 0.96, to: 1, stiffness: 320, damping: 18 });
        setTimeout(function () { btn.style.transform = ""; btn.style.transition = ""; }, 420);
      };
      document.addEventListener("pointerup", up);
    }, { passive: true });
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
      "[data-reduced-motion=\"1\"] .pm-pulse-once { animation: none !important; }"
    ].join("\n");
    document.head.appendChild(s);
  };
})();
