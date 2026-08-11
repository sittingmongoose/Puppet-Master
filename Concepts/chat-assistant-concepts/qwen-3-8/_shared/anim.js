/* PMAnim — shared motion API for the Qwen 3.8 concept.
   See _build/POLISH_SPEC.md §A. Static, no build step.
   Every method degrades safely: missing/odd elements never throw,
   and reduced motion snaps to the correct static end-state. */
(function () {
  "use strict";

  function toArray(els) {
    if (!els) return [];
    if (Array.isArray(els)) return els;
    if (typeof els.length === "number") {
      try { return Array.prototype.slice.call(els); } catch (e) { return []; }
    }
    return [els];
  }

  function reduced() {
    try {
      if (document.documentElement.dataset.motion === "reduced") return true;
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) {
      return false;
    }
  }

  function clearWillChange(el) {
    try { if (el && el.style) el.style.willChange = ""; } catch (e) {}
  }

  /* WAAPI parses `easing` eagerly and rejects var() tokens, so map the
     motion.css tokens to their literal curves for the retry path. */
  var EASE_LITERALS = {
    "var(--ease-snap-spring)": "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "var(--ease-gentle-overshoot)": "cubic-bezier(0.22, 1.15, 0.36, 1)",
    "var(--ease-bouncy)": "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
    "var(--ease-spring)": "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "var(--ease-sprout)": "cubic-bezier(0.22, 1.55, 0.36, 1)",
    "var(--ease-smooth)": "cubic-bezier(0.25, 1, 0.5, 1)",
    "var(--ease-out)": "cubic-bezier(0.22, 1, 0.36, 1)"
  };

  function waapi(el, frames, timing) {
    if (!el || typeof el.animate !== "function") return null;
    try { return el.animate(frames, timing); } catch (e) {}
    if (timing && typeof timing.easing === "string" && timing.easing.indexOf("var(") === 0) {
      var retry = {};
      for (var k in timing) retry[k] = timing[k];
      retry.easing = EASE_LITERALS[timing.easing] || "cubic-bezier(0.34, 1.56, 0.64, 1)";
      try { return el.animate(frames, retry); } catch (e2) {}
    }
    return null;
  }

  function flip(els, mutate, opts) {
    opts = opts || {};
    var list = toArray(els);
    if (reduced()) {
      if (typeof mutate === "function") mutate();
      return;
    }
    var before = [];
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el && typeof el.getBoundingClientRect === "function") {
        try { before[i] = el.getBoundingClientRect(); } catch (e) { before[i] = null; }
      } else {
        before[i] = null;
      }
    }
    if (typeof mutate === "function") mutate();
    for (var j = 0; j < list.length; j++) {
      var node = list[j];
      var b = before[j];
      if (!node || !b || typeof node.getBoundingClientRect !== "function") continue;
      try {
        var a = node.getBoundingClientRect();
        var dx = b.left - a.left;
        var dy = b.top - a.top;
        if (!dx && !dy) continue;
        node.style.willChange = "transform";
        var anim = waapi(
          node,
          [{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }],
          { duration: opts.duration || 420, easing: opts.ease || "var(--ease-snap-spring)" }
        );
        if (anim && anim.finished) {
          anim.finished.then(function (n) { return function () { clearWillChange(n); }; }(node))
            .catch(function (n) { return function () { clearWillChange(n); }; }(node));
        } else {
          clearWillChange(node);
        }
      } catch (e) {
        clearWillChange(node);
      }
    }
  }

  function staggerIn(els, opts) {
    opts = opts || {};
    var list = toArray(els);
    var rise = opts.rise != null ? opts.rise : 12;
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (!el || !el.style) continue;
      if (reduced()) {
        el.style.opacity = "1";
        el.style.transform = "none";
        continue;
      }
      try {
        el.style.willChange = "transform,opacity";
        var anim = waapi(
          el,
          [{ opacity: 0, transform: "translateY(" + rise + "px)" }, { opacity: 1, transform: "none" }],
          {
            duration: opts.duration || 320,
            delay: Math.min(i * (opts.step || 35), opts.cap || 280),
            easing: "var(--ease-snap-spring)"
          }
        );
        if (anim && anim.finished) {
          anim.finished.then(function (n) { return function () { clearWillChange(n); }; }(el))
            .catch(function (n) { return function () { clearWillChange(n); }; }(el));
        } else {
          clearWillChange(el);
        }
      } catch (e) {
        clearWillChange(el);
      }
    }
  }

  function springTo(setter, from, to, opts) {
    opts = opts || {};
    if (typeof setter !== "function") return;
    if (reduced()) {
      try { setter(to); } catch (e) {}
      return;
    }
    var stiffness = opts.stiffness != null ? opts.stiffness : 170;
    var damping = opts.damping != null ? opts.damping : 18;
    var mass = opts.mass != null ? opts.mass : 1;
    var x = from;
    var v = 0;
    var last = performance.now();
    function step(now) {
      var dt = (now - last) / 1000;
      last = now;
      if (dt > 1 / 30) dt = 1 / 30;
      var accel = (-stiffness * (x - to) - damping * v) / mass;
      v += accel * dt;
      x += v * dt;
      try {
        if (Math.abs(v) < 0.1 && Math.abs(x - to) < 0.5) {
          setter(to);
          return;
        }
        setter(x);
      } catch (e) {
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function crossfadeNum(cellEl, newText, opts) {
    opts = opts || {};
    if (!cellEl || !cellEl.style) return;
    if (reduced()) {
      cellEl.textContent = newText;
      return;
    }
    var base = cellEl.firstElementChild;
    if (!base) {
      base = document.createElement("span");
      base.textContent = cellEl.textContent;
      cellEl.textContent = "";
      cellEl.appendChild(base);
    }
    if (!cellEl.dataset || !cellEl.dataset.pmqNumLock) {
      try {
        var w = cellEl.getBoundingClientRect ? cellEl.getBoundingClientRect().width : 0;
        if (w) cellEl.style.minWidth = w + "px";
      } catch (e) {}
      cellEl.style.fontVariantNumeric = "tabular-nums";
      try { cellEl.dataset.pmqNumLock = "1"; } catch (e) {}
    }
    var nu = base.cloneNode(true);
    nu.textContent = newText;
    try {
      cellEl.style.display = "grid";
      base.style.gridArea = "1/1";
      nu.style.gridArea = "1/1";
    } catch (e) {}
    cellEl.appendChild(nu);
    var swap = function () {
      try { if (base.parentNode) base.parentNode.removeChild(base); } catch (e) {}
    };
    try {
      var outAnim = waapi(
        base,
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-.6em)" }],
        { duration: opts.outDuration || 180, easing: "ease-in" }
      );
      if (outAnim && outAnim.finished) {
        outAnim.finished.then(swap).catch(swap);
      } else {
        swap();
      }
      var inAnim = waapi(
        nu,
        [{ opacity: 0, transform: "translateY(.6em)" }, { opacity: 1, transform: "none" }],
        { duration: opts.duration || 220, easing: "var(--ease-snap-spring)" }
      );
      if (inAnim && inAnim.finished) inAnim.finished.catch(function () {});
    } catch (e) {
      swap();
    }
  }

  function morphClip(el, fromInset, toInset, opts) {
    opts = opts || {};
    var done = function () {
      if (typeof opts.onDone === "function") {
        try { opts.onDone(); } catch (e) {}
      }
    };
    if (!el || !el.style) {
      done();
      return;
    }
    el.style.clipPath = "inset(" + toInset + ")";
    if (reduced()) {
      done();
      return;
    }
    try {
      var anim = waapi(
        el,
        [{ clipPath: "inset(" + fromInset + ")" }, { clipPath: "inset(" + toInset + ")" }],
        { duration: opts.duration || 420, easing: opts.ease || "var(--ease-gentle-overshoot)" }
      );
      if (anim && anim.finished) {
        anim.finished.then(done).catch(done);
      } else {
        done();
      }
    } catch (e) {
      done();
    }
  }

  function pop(el, opts) {
    opts = opts || {};
    if (!el || !el.classList) return;
    if (reduced()) return;
    if (el.classList.contains("pmq-pop")) return;
    el.classList.add("pmq-pop");
    var off = function () {
      try { el.classList.remove("pmq-pop"); } catch (e) {}
    };
    el.addEventListener("animationend", off, { once: true });
    setTimeout(off, opts.timeout || 800);
  }

  function strike(el) {
    if (!el || !el.classList) return;
    el.classList.add("pmq-strike");
  }

  window.PMAnim = {
    reduced: reduced,
    flip: flip,
    staggerIn: staggerIn,
    springTo: springTo,
    crossfadeNum: crossfadeNum,
    morphClip: morphClip,
    pop: pop,
    strike: strike
  };
})();
