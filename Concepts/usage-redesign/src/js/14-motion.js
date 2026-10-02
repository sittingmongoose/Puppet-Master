/* Motion (owner: engine; ARCHITECTURE.md section 4.3, DESIGN-SPEC section 8). Every animation on the page goes through
   here: Reduce Motion jumps to the end, the Animation speed setting scales everything (el.animate is wrapped by the look
   sheet; JS tweens multiply by speed()), and the tween queue runs a rAF only while a tween is active (no idle loop). */
(function () {
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var BASE = { exit: 140, enter: 380, title: 220, draw: 680, rise: 560, grow: 520, fill: 620, sweep: 720, count: 700, value: 520,
    pulse: 420, morph: 480, slide: 260, lift: 140, settle: 220, morphSize: 260, cancel: 300, hover: 160, pop: 180, insp: 320 };
  var EASE = {
    basic: { enter: 'cubic-bezier(.22,1,.36,1)', draw: 'cubic-bezier(.33,.8,.3,1)', value: 'cubic-bezier(.16,1,.3,1)', slide: 'cubic-bezier(.22,1,.36,1)',
      settle: 'cubic-bezier(.17,.84,.29,.99)', pop: 'cubic-bezier(.2,.8,.2,1)', lift: 'cubic-bezier(.2,.8,.2,1)' },
    friendly: { enter: 'cubic-bezier(.34,1.36,.64,1)', settle: 'cubic-bezier(.34,1.3,.64,1)' },
    glass: { enter: 'cubic-bezier(.16,1,.3,1)', draw: 'cubic-bezier(.16,1,.3,1)', slide: 'cubic-bezier(.16,1,.3,1)', settle: 'cubic-bezier(.16,1,.3,1)' },
    retro: { enter: 'steps(4,end)', draw: 'steps(8,end)', value: 'steps(6,end)', slide: 'steps(4,end)', settle: 'steps(4,end)', pop: 'steps(4,end)', lift: 'steps(2,end)' },
    nier: { enter: 'steps(5,end)', draw: 'steps(7,end)', value: 'steps(5,end)', slide: 'cubic-bezier(.2,.85,.25,1)', settle: 'steps(4,end)' }
  };
  var speedCache = { key: null, value: 1 };

  function reduced() { return root.getAttribute('data-motion') === 'reduced' || !!(mq && mq.matches); }
  function family() { var l = PMU.theme.look(); return l.nier ? 'nier' : l.family; }
  function speed() {
    var key = PMU.theme.look().key;
    if (speedCache.key === key) return speedCache.value;
    var value = 1;
    try { var probe = document.createElement('i').animate(null, { duration: 1000 }); value = (probe.effect.getTiming().duration || 1000) / 1000; probe.cancel(); } catch (error) { value = 1; }
    speedCache = { key: key, value: value };
    return value;
  }
  function dur(name) { return typeof name === 'number' ? name : (BASE[name] || 200); }
  function ease(name) { var f = EASE[family()] || {}; return f[name] || EASE.basic[name] || 'ease'; }

  function animate(el, keyframes, opts) {
    if (!el || reduced() || typeof el.animate !== 'function') return null;
    opts = opts || {};
    return el.animate(keyframes, { duration: dur(opts.dur || 'enter'), delay: opts.delay || 0, easing: opts.easing || ease(opts.ease || 'enter'),
      fill: opts.fill || 'none' });
  }

  /* one shared rAF queue, alive only while a tween runs */
  var queue = [], raf = 0;
  function frame(now) {
    raf = 0;
    queue = queue.filter(function (tw) {
      if (tw.cancelled) return false;
      if (tw.start === null) tw.start = now + tw.delay;
      var t = tw.total ? Math.min(1, Math.max(0, (now - tw.start) / tw.total)) : 1;
      tw.step(tw.from + (tw.to - tw.from) * tw.curve(t), t);
      if (t >= 1) { if (tw.done) tw.done(); return false; }
      return true;
    });
    if (queue.length) raf = requestAnimationFrame(frame);
  }
  function curveFor(easing) {
    if (/^steps\((\d+)/.test(easing)) { var n = +RegExp.$1; return function (t) { return Math.min(1, Math.floor(t * n) / n + (t >= 1 ? 1 : 0)); }; }
    return function (t) { return 1 - Math.pow(1 - t, 4); };
  }
  function tween(o) {
    var handle = { cancelled: false, cancel: function () { handle.cancelled = true; } };
    if (reduced()) { o.step(o.to, 1); if (o.done) o.done(); return handle; }
    handle.from = o.from; handle.to = o.to; handle.step = o.step; handle.done = o.done; handle.start = null;
    handle.delay = (o.delay || 0) * speed(); handle.total = dur(o.dur || 'value') * speed(); handle.curve = curveFor(o.ease || ease('value'));
    queue.push(handle);
    if (!raf) raf = requestAnimationFrame(frame);
    return handle;
  }
  function countUp(el, from, to, format, opts) {
    opts = opts || {};
    return tween({ from: from == null ? 0 : from, to: to, dur: opts.dur || (from == null ? 'count' : 'value'), delay: opts.delay,
      step: function (v) { el.textContent = format(v); } });
  }
  function enter(cards, opts) {
    var base = (opts && opts.base) || 0, f = family();
    cards.forEach(function (card, rank) {
      var delay = base + Math.min(360, 22 * rank);
      var from = f === 'nier' ? { transform: 'scaleY(.04)', transformOrigin: '50% 0', opacity: 0 }
        : f === 'friendly' ? { transform: 'translateY(16px) scale(.96)', opacity: 0 }
        : f === 'glass' ? { transform: 'translateY(8px) scale(.94)', opacity: 0 }
        : f === 'retro' ? { transform: 'translateY(8px)', opacity: 0 }
        : { transform: 'translateY(14px) scale(.975)', opacity: 0 };
      animate(card, [from, { transform: 'none', opacity: 1, transformOrigin: from.transformOrigin || '50% 50%' }], { dur: 'enter', delay: delay, fill: 'backwards' });
    });
  }
  function flip(els, mutate, opts) {
    var before = new Map(els.map(function (el) { return [el, el.getBoundingClientRect()]; }));
    mutate();
    if (reduced()) return;
    els.forEach(function (el) {
      var a = before.get(el), b = el.getBoundingClientRect();
      var dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      if (el._pmuFlip) el._pmuFlip.cancel();
      el._pmuFlip = animate(el, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { dur: (opts && opts.dur) || 'slide', ease: 'slide' });
    });
  }
  function pulse(el) {
    animate(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.05)', offset: 0.4 }, { transform: 'scale(1)' }], { dur: 'pulse', ease: 'pop' });
  }
  function release(board) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { board.removeAttribute('data-held'); }); });
  }

  PMU.motion = { reduced: reduced, speed: speed, dur: dur, ease: ease, family: family, animate: animate, tween: tween,
    countUp: countUp, enter: enter, flip: flip, pulse: pulse, release: release };
})();
