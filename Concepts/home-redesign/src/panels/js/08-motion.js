/* Motion helpers for the panels. Ported from the Usage board engine on origin/concept/usage-pm7-20261009 (0e13ae4bb1):
   Concepts/usage-redesign/src/js/14-motion.js (animate, speed, curve, ease) and 15-film.js (spring). Constants and
   timings are Usage's unless a line says otherwise; when the Usage engine changes one, change it here in the same
   landing (one gesture vocabulary, two implementations until the board engine is multi-instance, D10). */

var motion = PMW.motion = {};

motion.reduced = reducedMotion;
motion.family = function () { var lk = look(); return lk.nier ? 'nier' : lk.family; };
/* Animation speed: the page wraps Element.animate to scale durations; probe it once per call site */
motion.speed = function () {
  try {
    var a = doc.createElement('i').animate(null, { duration: 1000 });
    var d = a.effect.getTiming().duration;
    a.cancel();
    return typeof d === 'number' && d > 0 ? d / 1000 : 1;
  } catch (_) { return 1; }
};

var EASE = {
  settle: 'cubic-bezier(.17,.84,.29,.99)', slide: 'cubic-bezier(.22,1,.36,1)', cancel: 'cubic-bezier(.22,1,.36,1)',
  lift: 'cubic-bezier(.2,.8,.2,1)', out: 'cubic-bezier(.2,.8,.2,1)', inout: 'cubic-bezier(.4,0,.2,1)'
};
var EASE_FAMILY = {
  glass: { settle: 'cubic-bezier(.16,1,.3,1)', slide: 'cubic-bezier(.16,1,.3,1)' },
  retro: { settle: 'steps(4,end)', slide: 'steps(4,end)', cancel: 'steps(4,end)', lift: 'steps(2,end)', out: 'steps(3,end)', inout: 'steps(3,end)' },
  nier: { settle: 'steps(4,end)', cancel: 'steps(4,end)', slide: 'cubic-bezier(.2,.85,.25,1)', out: 'steps(3,end)' }
};
motion.ease = function (name) {
  var f = EASE_FAMILY[motion.family()];
  return (f && f[name]) || EASE[name] || EASE.out;
};

/* cubic-bezier / steps solver for JS-driven frames (14-motion.js:59-84) */
motion.curve = function (easing) {
  var m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(easing || '');
  if (m) {
    var x1 = +m[1], y1 = +m[2], x2 = +m[3], y2 = +m[4];
    var bx = function (t) { var u = 1 - t; return 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t; };
    var by = function (t) { var u = 1 - t; return 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t; };
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 24; i++) { t = (lo + hi) / 2; if (bx(t) < x) lo = t; else hi = t; }
      return by(t);
    };
  }
  var s = /steps\(\s*(\d+)/.exec(easing || '');
  if (s) { var n = +s[1]; return function (x) { return x >= 1 ? 1 : Math.floor(x * n) / n; }; }
  return function (x) { return x; };
};

/* A spring integrated at 600 Hz into a WAAPI linear() easing (15-film.js:479-499). The panels default is critically
   damped (k 520, c 45.6): the brief asks for a settle without overshoot. */
var springCache = {};
motion.spring = function (o) {
  o = o || {};
  var k = o.k || 520, c = o.c || 45.6, mm = o.m || 1, v0 = o.v0 || 0, until = o.until || 0.005;
  var key = [k, c, mm, v0, until].join(',');
  if (springCache[key]) return springCache[key];
  var x = 0, v = v0, dt = 1 / 600, t = 0, pts = [], settleAt = 0;
  while (t < 3) {
    var a = (-k * (x - 1) - c * v) / mm; v += a * dt; x += v * dt; t += dt;
    pts.push([t, x]);
    if (Math.abs(x - 1) < until && Math.abs(v) < until * 20) { settleAt = t; break; }
  }
  var total = settleAt || t, n = 40, out = [];
  for (var i = 0; i <= n; i++) {
    var tt = total * i / n, j = Math.min(pts.length - 1, Math.round(tt / dt));
    out.push(i === n ? '1' : (i === 0 ? '0' : pts[j][1].toFixed(4)));
  }
  var res = { easing: 'linear(' + out.join(',') + ')', duration: Math.round(total * 1000) };
  springCache[key] = res;
  return res;
};
var linearSupported = (function () { try { return CSS.supports('animation-timing-function', 'linear(0, 1)'); } catch (_) { return false; } })();

/* animate(el, frames, { dur, easing, delay, fill }) -> Animation | null (null under Reduced Motion: finish at once) */
motion.animate = function (el, frames, o) {
  o = o || {};
  if (reducedMotion() || !el || !el.animate) return null;
  var easing = o.easing || motion.ease('out');
  if (/^linear\(/.test(easing) && !linearSupported) easing = EASE.settle;   // older WebKit: no linear() easing
  try {
    return el.animate(frames, { duration: o.dur == null ? 180 : o.dur, easing: easing, delay: o.delay || 0, fill: o.fill || 'none' });
  } catch (_) { return null; }
};
/* settle: the drop curve per look (critically damped spring; Retro and NieR stepped) */
motion.settle = function () {
  var f = motion.family();
  if (f === 'retro' || f === 'nier') return { dur: 160, easing: 'steps(3,jump-start)' };
  var sp = motion.spring({ k: 520, c: 45.6, until: 0.005 });
  return { dur: sp.duration, easing: sp.easing };
};
motion.cancel = function () {
  var f = motion.family();
  return { dur: 300, easing: f === 'retro' || f === 'nier' ? 'steps(4,end)' : EASE.cancel };
};
/* FLIP: measure, mutate, animate each element from where it was */
motion.flip = function (els, mutate, o) {
  o = o || {};
  var first = els.map(function (el) { return el.getBoundingClientRect(); });
  mutate();
  if (reducedMotion()) return;
  els.forEach(function (el, i) {
    var a = first[i], b = el.getBoundingClientRect();
    var dx = a.left - b.left, dy = a.top - b.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    motion.animate(el, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }],
      { dur: o.dur || 220, easing: o.easing || motion.ease('slide') });
  });
};
