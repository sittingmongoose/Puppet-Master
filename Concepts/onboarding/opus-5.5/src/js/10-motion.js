/* O55.motion — one clock for every JS-driven movement (springs, pointer travel, charm flights) with a time-scale hook
   for slow-motion filming, family easing, Reduced Motion and low-resource detection.
   CSS/WAAPI motion is slowed by the film tool through CDP Animation.setPlaybackRate; JS motion reads timeScale.
   Canon timing (PWIZ-022): hero 1.2-1.5 s, step 420-560 ms, stagger 60-80 ms, micro 120-220 ms, success ~700 ms. */
(function () {
  'use strict';
  const O55 = window.O55;
  const real = { setTimeout: window.setTimeout.bind(window), clearTimeout: window.clearTimeout.bind(window), raf: window.requestAnimationFrame.bind(window) };
  const M = O55.motion = { timeScale: 1, lowResource: false, real };

  let vNow = performance.now(), last = performance.now();
  M.now = function now() { const r = performance.now(); vNow += (r - last) * M.timeScale; last = r; return vNow; };
  M.setTimeScale = function setTimeScale(k) { M.now(); M.timeScale = Math.max(0, Number(k) || 0); };

  M.reduced = function reduced() {
    return document.documentElement.getAttribute('data-motion') === 'reduced'
      || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  M.delay = function delay(ms) {
    return new Promise((res) => {
      if (M.timeScale === 0) { const poll = () => (M.timeScale === 0 ? real.setTimeout(poll, 50) : real.setTimeout(res, ms / M.timeScale)); poll(); return; }
      real.setTimeout(res, ms / M.timeScale);
    });
  };

  /* after(ms, fn): a timer on the motion clock (slow-motion filming stretches it; timeScale 0 holds it). */
  M.after = function after(ms, fn) {
    let id = null, cancelled = false;
    const arm = () => { if (cancelled) return; if (M.timeScale === 0) { id = real.setTimeout(arm, 50); return; } id = real.setTimeout(() => { if (!cancelled) fn(); }, (ms || 0) / M.timeScale); };
    arm();
    return { cancel() { cancelled = true; if (id != null) real.clearTimeout(id); } };
  };
  /* settled(el, {subtree, fallback}) -> Promise: resolves when the element's running animations finish (or are
     cancelled), with a clock-scaled fallback so a missed event never strands a class. */
  M.settled = function settled(el, o) {
    o = o || {};
    return new Promise((res) => {
      let done = false; const finish = () => { if (!done) { done = true; t.cancel(); res(); } };
      const t = M.after(o.fallback || 2400, finish);
      real.raf(() => real.raf(() => {
        /* ambient loops and spinners never finish: only finite animations count */
        const anims = (el && el.getAnimations ? el.getAnimations({ subtree: o.subtree !== false }) : [])
          .filter((a) => { try { return Number.isFinite(a.effect.getComputedTiming().endTime); } catch (_) { return false; } });
        if (!anims.length) return finish();
        Promise.all(anims.map((a) => a.finished.catch(() => null))).then(finish);
      }));
    });
  };

  /* Durations (ms) — canon budgets; families differ in easing, not in waiting time. */
  M.T = { micro: 160, step: 500, stepOut: 350, stagger: 70, success: 700, hero: 1350, charm: 620, travel: 900 };

  /* cubic-bezier solver (Newton + bisection fallback). */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t, dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) { const e = sx(t) - x; const d = dx(t); if (Math.abs(e) < 1e-5) return sy(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
      let lo = 0, hi = 1; t = x;
      for (let i = 0; i < 30; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-5) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      return sy(t);
    };
  }
  M.bezier = bezier;
  M.ease = {
    linear: (t) => t,
    standard: bezier(0.2, 0, 0, 1),
    emphasized: bezier(0.05, 0.7, 0.1, 1),
    accelerate: bezier(0.3, 0, 1, 1),
    overshoot: bezier(0.34, 1.56, 0.64, 1),
    glide: bezier(0.22, 0.61, 0.36, 1),
    /* a hand reaching for something: speeds up, then slows into the target (the Show Me pointer and its drags) */
    hand: bezier(0.45, 0.05, 0.2, 1),
    handSpring: bezier(0.42, 0, 0.3, 1.16),
    handGlide: bezier(0.32, 0.08, 0.12, 1),
    steps: (n) => (t) => Math.min(1, Math.floor(t * n + 1e-9) / n)
  };
  /* Per-family curves: Basic crisp standard, Friendly springy overshoot, Glass long emphasized glide, Retro stepped. */
  M.familyEase = function familyEase(family) {
    return ({ basic: M.ease.standard, friendly: M.ease.overshoot, glass: M.ease.emphasized, retro: M.ease.steps(6) })[family] || M.ease.standard;
  };
  M.familyCss = { basic: 'cubic-bezier(0.2,0,0,1)', friendly: 'cubic-bezier(0.34,1.56,0.64,1)', glass: 'cubic-bezier(0.05,0.7,0.1,1)', retro: 'steps(6, end)' };

  /* tween({from,to,duration,ease,onUpdate}) -> {cancel(), finished} ; interruptible and clock-scaled. */
  M.tween = function tween(opts) {
    const from = opts.from, to = opts.to, dur = Math.max(1, opts.duration || M.T.step), ease = opts.ease || M.ease.standard;
    const keys = typeof from === 'number' ? null : Object.keys(to);
    let cancelled = false, done;
    const finished = new Promise((res) => { done = res; });
    if (M.reduced() && !opts.ignoreReduced) { opts.onUpdate && opts.onUpdate(to, 1); done(true); return { cancel() {}, finished }; }
    const start = M.now();
    const frame = () => {
      if (cancelled) return;
      const p = Math.min(1, (M.now() - start) / dur), e = ease(p);
      const value = keys ? Object.fromEntries(keys.map((k) => [k, from[k] + (to[k] - from[k]) * e])) : from + (to - from) * e;
      opts.onUpdate && opts.onUpdate(value, p);
      if (p < 1) real.raf(frame); else done(true);
    };
    real.raf(frame);
    return { cancel() { cancelled = true; done(false); }, finished };
  };

  /* spring({from,to,velocity,stiffness,damping,mass,onUpdate}) — semi-implicit Euler on the scaled clock.
     Critically damped by default (no overshoot) unless the gesture carried momentum (WWDC fluid interfaces). */
  M.spring = function spring(opts) {
    const k = opts.stiffness || 260, c = opts.damping || 2 * Math.sqrt(k * (opts.mass || 1)), m = opts.mass || 1;
    const dims = typeof opts.from === 'number' ? ['v'] : Object.keys(opts.to);
    const x = {}, v = {}, target = {};
    dims.forEach((d) => { x[d] = d === 'v' ? opts.from : opts.from[d]; target[d] = d === 'v' ? opts.to : opts.to[d]; v[d] = opts.velocity ? (d === 'v' ? opts.velocity : (opts.velocity[d] || 0)) : 0; });
    let cancelled = false, done, lastT = M.now();
    const finished = new Promise((res) => { done = res; });
    const emit = () => opts.onUpdate && opts.onUpdate(dims.length === 1 && dims[0] === 'v' ? x.v : Object.assign({}, x));
    if (M.reduced() && !opts.ignoreReduced) { dims.forEach((d) => { x[d] = target[d]; }); emit(); done(true); return { cancel() {}, finished, retarget() {} }; }
    const frame = () => {
      if (cancelled) return;
      const t = M.now(); let dt = Math.min(0.064, (t - lastT) / 1000); lastT = t;
      let settled = true;
      const steps = Math.max(1, Math.ceil(dt / 0.008)); dt /= steps;
      for (let s = 0; s < steps; s++) dims.forEach((d) => { const a = (-k * (x[d] - target[d]) - c * v[d]) / m; v[d] += a * dt; x[d] += v[d] * dt; });
      dims.forEach((d) => { if (Math.abs(x[d] - target[d]) > 0.05 || Math.abs(v[d]) > 0.5) settled = false; });
      if (settled) dims.forEach((d) => { x[d] = target[d]; v[d] = 0; });
      emit();
      if (!settled) real.raf(frame); else done(true);
    };
    real.raf(frame);
    return {
      cancel() { cancelled = true; done(false); },
      finished,
      retarget(to) { dims.forEach((d) => { target[d] = d === 'v' ? to : to[d]; }); },
      state() { return { x: Object.assign({}, x), v: Object.assign({}, v) }; }
    };
  };

  /* WAAPI helper: family timing, Reduced Motion collapse to a short fade, and exits at ~70% of entrance. */
  M.play = function play(el, keyframes, opts) {
    if (!el || !el.animate) return null;
    opts = Object.assign({ duration: M.T.step, easing: 'cubic-bezier(0.2,0,0,1)', fill: 'both' }, opts || {});
    if (M.reduced() && !opts.essential) {
      const last = keyframes[keyframes.length - 1] || {};
      const fade = [{ opacity: keyframes[0] && keyframes[0].opacity != null ? keyframes[0].opacity : 1 }, { opacity: last.opacity != null ? last.opacity : 1 }];
      return el.animate(fade, { duration: Math.min(140, opts.duration), fill: opts.fill, delay: 0 });
    }
    return el.animate(keyframes, opts);
  };

  /* Long-task watch. Opening the window and changing screens are expected heavy moments (building a screen, mounting
     a scene) and never count: M.quiet(ms) marks them. Outside those, three long tasks over 200 ms inside ten seconds
     while onboarding is open switch low-resource mode on (ambient loops and pre-warming stop; choices and receipts
     never change). A mode switched on this way switches itself off again after twenty calm seconds; one chosen by the
     setting or the scenario stays. */
  let quietUntil = 0, lastLong = 0;
  M.quiet = function quiet(ms) { quietUntil = Math.max(quietUntil, performance.now() + (ms || 1800)); };
  M.watchLongTasks = function watchLongTasks() {
    if (!('PerformanceObserver' in window)) return;
    const seen = [];
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.duration < 200 || e.startTime < quietUntil) continue;
          const t = performance.now(); seen.push(t); lastLong = t;
          while (seen.length && t - seen[0] > 10000) seen.shift();
          if (seen.length >= 3 && !M.lowResource && document.documentElement.hasAttribute('data-o55-open')) M.setLowResource(true, 'long_tasks');
        }
      }).observe({ entryTypes: ['longtask'] });
      window.setInterval(() => { if (M.lowResource && M.lowResourceReason === 'long_tasks' && performance.now() - lastLong > 20000) M.setLowResource(false, null); }, 5000);
    } catch (_) {}
  };
  M.setLowResource = function setLowResource(on, reason) {
    M.lowResource = !!on; M.lowResourceReason = reason || null;
    document.documentElement.toggleAttribute('data-o55-lowres', M.lowResource);
    window.dispatchEvent(new CustomEvent('o55:lowresource', { detail: { on: M.lowResource, reason } }));
  };
})();
