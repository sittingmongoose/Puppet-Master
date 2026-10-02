/* Motion (owner: engine; ARCHITECTURE.md section 4.3, DESIGN-SPEC section 8, DESIGN-SPEC-ATLAS section 8). Every
   animation on the page goes through here: Reduce Motion jumps to the end, the Animation speed setting scales everything
   (el.animate is wrapped by the look sheet; JS tweens multiply by speed()), and the tween queue runs a rAF only while a
   tween is active (no idle loop). Durations are the Atlas tokens (A1 8.1); the per-family voices are B v2 8.3. */
(function () {
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  /* A1 8.1 (the B v2 names stay as the API) */
  var BASE = { exit: 140, enter: 520, enterFade: 460, title: 220, draw: 900, rise: 520, grow: 760, fill: 900, sweep: 900, count: 1000,
    value: 520, pulse: 420, morph: 520, slide: 260, lift: 140, settle: 220, morphSize: 260, cancel: 300, hover: 260, pop: 260,
    insp: 520, readout: 140, flash: 620, toggle: 260, reveal: 480, revealFade: 420, landing: 160, outline: 120 };
  var EASE = {
    basic: { enter: 'cubic-bezier(.2,.8,.2,1)', fade: 'cubic-bezier(.65,0,.35,1)', draw: 'cubic-bezier(.65,0,.35,1)', value: 'cubic-bezier(.2,.8,.2,1)',
      slide: 'cubic-bezier(.22,1,.36,1)', settle: 'cubic-bezier(.17,.84,.29,.99)', cancel: 'cubic-bezier(.22,1,.36,1)', pop: 'cubic-bezier(.2,.8,.2,1)',
      lift: 'cubic-bezier(.2,.8,.2,1)', io: 'cubic-bezier(.65,0,.35,1)', spring: 'cubic-bezier(.34,1.45,.64,1)', soft: 'cubic-bezier(.3,1.22,.6,1)',
      panel: 'cubic-bezier(.32,1.12,.52,1)', 'in': 'cubic-bezier(.4,0,1,1)', out: 'cubic-bezier(.2,.8,.2,1)', grow: 'cubic-bezier(.2,.8,.2,1)' },
    friendly: { enter: 'cubic-bezier(.34,1.36,.64,1)', settle: 'cubic-bezier(.34,1.3,.64,1)' },
    glass: { enter: 'cubic-bezier(.16,1,.3,1)', draw: 'cubic-bezier(.16,1,.3,1)', slide: 'cubic-bezier(.16,1,.3,1)', settle: 'cubic-bezier(.16,1,.3,1)' },
    retro: { enter: 'steps(4,end)', fade: 'steps(4,end)', draw: 'steps(8,end)', value: 'steps(6,end)', slide: 'steps(4,end)', settle: 'steps(4,end)',
      cancel: 'steps(4,end)', pop: 'steps(4,end)', lift: 'steps(2,end)', grow: 'steps(6,end)' },
    nier: { enter: 'steps(5,end)', fade: 'steps(5,end)', draw: 'steps(7,end)', value: 'steps(5,end)', slide: 'cubic-bezier(.2,.85,.25,1)', settle: 'steps(4,end)',
      cancel: 'steps(4,end)', grow: 'steps(7,end)', spring: 'steps(3,end)' }
  };
  var speedCache = { key: null, value: 1 };

  function reduced() { return root.getAttribute('data-motion') === 'reduced' || !!(mq && mq.matches); }
  /* onboarding open: entrances wait (DESIGN-SPEC 8.7) */
  function paused() { return root.hasAttribute('data-o55-open'); }
  function family() { var l = PMU.theme.look(); return l.nier ? 'nier' : l.family; }
  function speed() {
    var key = PMU.theme.look().key;
    if (speedCache.key === key) return speedCache.value;
    var value = 1;
    try { var probe = document.createElement('i').animate(null, { duration: 1000 }); value = (probe.effect.getTiming().duration || 1000) / 1000; probe.cancel(); } catch (error) { value = 1; }
    if (!(value > 0)) value = 1;
    speedCache = { key: key, value: value };
    return value;
  }
  function dur(name) { return typeof name === 'number' ? name : (BASE[name] || 200); }
  function ease(name) { var f = EASE[family()] || {}; return f[name] || EASE.basic[name] || name || 'ease'; }

  function animate(el, keyframes, opts) {
    if (!el || reduced() || typeof el.animate !== 'function') return null;
    opts = opts || {};
    try {
      return el.animate(keyframes, { duration: dur(opts.dur || 'enter'), delay: opts.delay || 0, easing: opts.easing || ease(opts.ease || 'enter'),
        fill: opts.fill || 'none', composite: opts.composite || 'replace' });
    } catch (error) { return null; }
  }

  /* ---- easing curves for JS tweens: cubic-bezier solved numerically, steps(), and a cubic ease-out default ---- */
  function bezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; } function b(p1, p2) { return 3 * p2 - 6 * p1; } function c(p1) { return 3 * p1; }
    function calc(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 6; i++) { var s = slope(t, x1, x2); if (Math.abs(s) < 1e-6) break; t -= (calc(t, x1, x2) - x) / s; }
      if (t < 0 || t > 1 || Math.abs(calc(t, x1, x2) - x) > 1e-4) {
        var lo = 0, hi = 1; t = x;
        for (var j = 0; j < 24; j++) { var v = calc(t, x1, x2); if (Math.abs(v - x) < 1e-5) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      }
      return calc(t, y1, y2);
    };
  }
  var curveCache = {};
  function curveFor(easing) {
    if (curveCache[easing]) return curveCache[easing];
    var fn;
    if (/^steps\((\d+)/.test(easing)) { var n = +RegExp.$1; fn = function (t) { return t >= 1 ? 1 : Math.floor(t * n) / n; }; }
    else if (/^cubic-bezier\(([^)]+)\)/.test(easing)) { var p = RegExp.$1.split(',').map(Number); fn = bezier(p[0], p[1], p[2], p[3]); }
    else if (easing === 'linear') fn = function (t) { return t; };
    else fn = function (t) { return 1 - Math.pow(1 - t, 3); };
    curveCache[easing] = fn;
    return fn;
  }

  /* one shared rAF queue, alive only while a tween runs */
  var queue = [], raf = 0;
  function frame(now) {
    raf = 0;
    queue = queue.filter(function (tw) {
      if (tw.cancelled) return false;
      if (tw.start === null) tw.start = now + tw.delay;
      if (now < tw.start) return true;
      var t = tw.total ? Math.min(1, Math.max(0, (now - tw.start) / tw.total)) : 1;
      try { tw.step(tw.from + (tw.to - tw.from) * tw.curve(t), t); } catch (error) { console.error('[pm-usage] tween', error); return false; }
      if (t >= 1) { if (tw.done) { try { tw.done(); } catch (error) { console.error('[pm-usage] tween done', error); } } return false; }
      return true;
    });
    if (queue.length) raf = requestAnimationFrame(frame);
  }
  function tween(o) {
    var handle = { cancelled: false, cancel: function () { handle.cancelled = true; } };
    if (reduced()) { o.step(o.to, 1); if (o.done) o.done(); return handle; }
    handle.from = o.from; handle.to = o.to; handle.step = o.step; handle.done = o.done; handle.start = null;
    handle.delay = (o.delay || 0) * speed(); handle.total = dur(o.dur || 'value') * speed();
    var fam = family();
    if (typeof o.ease === 'function') handle.curve = o.ease;
    else if (!o.ease && (fam === 'retro' || fam === 'nier')) handle.curve = curveFor(ease('value'));
    else handle.curve = curveFor(o.ease ? ease(o.ease) : ease('value'));
    queue.push(handle);
    if (!raf) raf = requestAnimationFrame(frame);
    return handle;
  }
  /* count-up: first render 1000 ms from 0 with an ease-out cubic; a change 520 ms from the old value (A1 8.1) */
  function countUp(el, from, to, format, opts) {
    opts = opts || {};
    if (!el) return { cancel: function () {} };
    if (el._pmuCount) el._pmuCount.cancel();
    var fam = family(), stepped = fam === 'retro' || fam === 'nier';
    var handle = tween({ from: from == null ? 0 : from, to: to, dur: opts.dur || (from == null ? 'count' : 'value'), delay: opts.delay,
      ease: stepped ? undefined : function (t) { return 1 - Math.pow(1 - t, 3); },
      step: function (v) { el.textContent = format(v); }, done: function () { el.textContent = format(to); el._pmuCount = null; } });
    el._pmuCount = handle.cancelled === false && !reduced() ? handle : null;
    return handle;
  }

  /* ---- the room entrance (A1 8.2): plates rise in reading order, 32 ms apart (cap 480): opacity 460 ms ease-io and a
     10 px rise over 520 ms ease-out; family voices of B v2 8.3 on top ---- */
  function enterFrom(f) {
    return f === 'nier' ? { transform: 'scaleY(.04)', transformOrigin: '50% 0' }
      : f === 'friendly' ? { transform: 'translateY(16px) scale(.96)' }
      : f === 'glass' ? { transform: 'translateY(8px) scale(.94)' }
      : f === 'retro' ? { transform: 'translateY(8px)' }
      : { transform: 'translateY(10px)' };
  }
  function enter(cards, opts) {
    if (reduced() || paused()) return;
    var base = (opts && opts.base) || 0, f = family(), step = (opts && opts.step) || 32, cap = (opts && opts.cap) || 480;
    var from = enterFrom(f);
    cards.forEach(function (card, rank) {
      var delay = base + Math.min(cap, step * rank);
      card._pmuEnterDelay = delay;
      animate(card, [{ opacity: 0 }, { opacity: 1 }], { dur: 'enterFade', delay: delay, ease: 'fade', fill: 'backwards' });
      animate(card, [from, { transform: 'none', transformOrigin: from.transformOrigin || '50% 50%' }], { dur: 'enter', delay: delay, ease: 'enter', fill: 'backwards' });
    });
  }
  /* rows rise (agenda, quota rows, lists): opacity 420 + translateY(8px) 480, 16 or 22 ms apart, cap 400 */
  function reveal(nodes, opts) {
    if (reduced() || !nodes) return;
    opts = opts || {};
    var delay = opts.delay || 0, step = opts.step == null ? 22 : opts.step, cap = opts.cap == null ? 400 : opts.cap;
    var stepped = family() === 'nier' || family() === 'retro';
    Array.prototype.forEach.call(nodes, function (node, i) {
      var d = delay + Math.min(cap, step * i);
      animate(node, [{ opacity: 0 }, { opacity: 1 }], { dur: 'revealFade', delay: d, ease: stepped ? 'fade' : 'out', fill: 'backwards' });
      animate(node, [{ transform: 'translateY(8px)' }, { transform: 'none' }], { dur: 'reveal', delay: d, ease: stepped ? 'enter' : 'out', fill: 'backwards' });
    });
  }
  /* a changed reading flashes once (never on first render): --pmu-flash to transparent, 620 ms */
  function flash(row) {
    if (!row) return null;
    var c = PMU.theme.token('--pmu-flash') || 'rgba(127,127,127,.2)';
    return animate(row, [{ backgroundColor: c }, { backgroundColor: 'transparent' }], { dur: 'flash', ease: family() === 'nier' ? 'steps(4,end)' : 'out' });
  }
  /* one-shot clip-path reveal (plots draw on): inset(0 100% 0 0) -> inset(0), 900 ms ease-io */
  function clipReveal(el, opts) {
    opts = opts || {};
    var dir = opts.dir || 'x';
    var from = dir === 'y' ? 'inset(0 0 100% 0)' : dir === 'up' ? 'inset(100% 0 0 0)' : 'inset(0 100% 0 0)';
    return animate(el, [{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], { dur: opts.dur || 'draw', delay: opts.delay || 0, ease: 'draw', fill: 'backwards' });
  }
  /* FLIP: interruptible; each slide starts from the element's current visual position */
  function flip(els, mutate, opts) {
    opts = opts || {};
    var before = new Map(els.map(function (el) { return [el, el.getBoundingClientRect()]; }));
    mutate();
    els.forEach(function (el) { if (el._pmuFlip) { el._pmuFlip.cancel(); el._pmuFlip = null; } });
    if (reduced()) return;
    var after = els.map(function (el) { return el.getBoundingClientRect(); });
    els.forEach(function (el, i) {
      var a = before.get(el), b = after[i];
      var dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      el._pmuFlip = animate(el, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'translate(0,0)' }], { dur: opts.dur || 'slide', ease: opts.ease || 'slide' });
      if (el._pmuFlip) el._pmuFlip.onfinish = function () { el._pmuFlip = null; };
    });
  }
  /* value-change pulse (B v2 8.5): scale 1 -> 1.05 -> 1 and an accent underline sweep; nothing on first render */
  function pulse(el) {
    if (!el || reduced()) return;
    var f = family();
    var peak = f === 'friendly' ? 1.07 : f === 'retro' || f === 'nier' ? 1 : 1.05;
    if (peak !== 1) animate(el, [{ transform: 'scale(1)' }, { transform: 'scale(' + peak + ')', offset: 0.4 }, { transform: 'scale(1)' }], { dur: 'pulse', ease: f === 'friendly' ? 'spring' : 'pop' });
    el.classList.remove('pmu-pulse-ul'); void el.offsetWidth; el.classList.add('pmu-pulse-ul');
    clearTimeout(el._pmuPulseT); el._pmuPulseT = setTimeout(function () { el.classList.remove('pmu-pulse-ul'); }, 520 * speed());
  }
  function release(board) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { board.removeAttribute('data-held'); }); });
  }
  /* wait helper that honours speed (setTimeout scaled) */
  function after(ms, fn) { return setTimeout(fn, reduced() ? 0 : ms * speed()); }

  PMU.motion = { reduced: reduced, paused: paused, speed: speed, dur: dur, ease: ease, family: family, animate: animate, tween: tween,
    countUp: countUp, enter: enter, reveal: reveal, flash: flash, clipReveal: clipReveal, flip: flip, pulse: pulse, release: release,
    after: after, curve: curveFor, BASE: BASE };
})();
