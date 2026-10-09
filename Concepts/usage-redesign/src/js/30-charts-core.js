/* Chart kit core (owner: charts; ARCHITECTURE.md section 4.6, DESIGN-SPEC section 7, DESIGN-SPEC-ATLAS sections 6 to 8).
   Every primitive is PMU.charts.<name>(host, spec, opts) -> {el, update, resize, enter, destroy}.

   Measuring: a chart reads its host's layout box (clientWidth / clientHeight), never getBoundingClientRect, so the NieR
   unfold (the card runs scaleY(.04) while charts mount) can never collapse a chart. Charts created in one task are
   measured together in one read pass and drawn in one write pass (a microtask batch), and one shared ResizeObserver
   re-draws a chart (without its entrance) when its host's layout size changes.

   Painting: every mark carries .pmu-mark[data-mark] plus one colour key (data-tk token type, data-vendor provider hue,
   data-series-index slot, data-tone state) and is painted from 30-charts.css, never from presentation attributes, so the
   families and NieR restyle every mark. Inline style carries geometry only.

   Motion: one-shot reveals use a sliding window (wrapper and content translate in opposite directions, transform only,
   so the compositor runs them), bars grow by scale, meters slide, numbers roll, paths morph through PMU.motion.tween.
   Everything goes through PMU.motion (Reduce Motion jumps to the end; the Animation speed scales el.animate and tweens). */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var HOUR = 3600000, DAY = 86400000;
  var charts = PMU.charts = PMU.charts || {};
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var finite = function (v) { return typeof v === 'number' && isFinite(v); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var r1 = function (v) { return Math.round(v * 10) / 10; };
  charts.util = { finite: finite, clamp: clamp, r1: r1, HOUR: HOUR, DAY: DAY };

  /* ---------- elements ---------- */
  function S(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  function H(tag, cls, parent, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    if (parent) parent.appendChild(el);
    return el;
  }
  charts.svg = S;
  charts.el = H;
  /* a colour key on a mark: {tk} token type, {vendor} provider hue, {idx} series slot, {tone} state */
  function key(el, k) {
    if (!k) return el;
    if (k.tk) el.setAttribute('data-tk', k.tk);
    if (k.vendor) el.setAttribute('data-vendor', k.vendor);
    if (k.idx != null && !k.tk && !k.vendor) el.setAttribute('data-series-index', k.idx);
    if (k.shade) el.setAttribute('data-shade', k.shade);
    if (k.tone) el.setAttribute('data-tone', k.tone);
    if (k.prov) el.setAttribute('data-prov', k.prov);
    if (k.role) el.setAttribute('data-series-role', k.role);
    if (k.est) el.setAttribute('data-est', '1');
    return el;
  }
  charts.key = key;
  function keyAttrs(k) {
    if (!k) return '';
    var s = '';
    if (k.tk) s += ' data-tk="' + esc(k.tk) + '"';
    if (k.vendor) s += ' data-vendor="' + esc(k.vendor) + '"';
    if (k.idx != null && !k.tk && !k.vendor) s += ' data-series-index="' + esc(k.idx) + '"';
    if (k.shade) s += ' data-shade="' + esc(k.shade) + '"';
    if (k.tone) s += ' data-tone="' + esc(k.tone) + '"';
    if (k.prov) s += ' data-prov="' + esc(k.prov) + '"';
    if (k.est) s += ' data-est="1"';
    return s;
  }
  charts.keyAttrs = keyAttrs;

  /* ---------- look and motion helpers ---------- */
  function fam() { var l = PMU.theme.look(); return l.nier ? 'nier' : l.family; }
  function reduced() { return !!(PMU.motion && PMU.motion.reduced()); }
  var EASE = { out: 'cubic-bezier(.2,.8,.2,1)', io: 'cubic-bezier(.65,0,.35,1)', spring: 'cubic-bezier(.34,1.45,.64,1)',
    soft: 'cubic-bezier(.3,1.22,.6,1)', inq: 'cubic-bezier(.4,0,1,1)' };
  /* per-family voice (DESIGN-SPEC 8.3, A1 8.3): path and easing differ, timing and order do not */
  function voice(kind) {
    var f = fam();
    if (f === 'retro') return kind === 'draw' ? 'steps(8,end)' : kind === 'count' ? 'steps(6,end)' : 'steps(4,end)';
    if (f === 'nier') return kind === 'draw' ? 'steps(7,end)' : 'steps(5,end)';
    if (kind === 'draw' || kind === 'sweep') return f === 'glass' ? 'cubic-bezier(.05,.7,.1,1)' : EASE.io;   /* Glass draws on DEPTH (WOW-SPEC 1.3) */
    /* values never overshoot (Jared caught a 99% meter bouncing to 100% in Atlas): fills and bars ease out; springs are
       for marks that carry no value (dots, notches, halos) */
    if (kind === 'fill') return 'cubic-bezier(.16,1,.3,1)';
    if (kind === 'grow') return f === 'glass' ? 'cubic-bezier(.16,1,.3,1)' : EASE.out;
    if (kind === 'pop') return EASE.spring;
    return EASE.out;
  }
  /* easing function for tweens (the JS side of the same voices); never overshoots for values */
  function curve(kind) {
    var f = fam();
    if (f === 'retro' || f === 'nier') {
      var n = f === 'retro' ? (kind === 'count' ? 6 : 8) : (kind === 'count' ? 5 : 7);
      return function (t) { return t >= 1 ? 1 : Math.floor(t * n) / n; };
    }
    if (kind === 'io' || kind === 'draw' || kind === 'sweep') return function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    return function (t) { return 1 - Math.pow(1 - t, 3); };
  }
  function anim(el, frames, dur, delay, easing, fill) {
    if (!el || reduced() || typeof el.animate !== 'function') return null;
    return PMU.motion.animate(el, frames, { dur: dur, delay: delay || 0, easing: easing || EASE.out, fill: fill || 'backwards' });
  }
  /* tween 0..1 through the shared queue (no idle rAF); step gets the eased progress */
  function tw(dur, kind, step, done, delay) {
    var ease = curve(kind);
    return PMU.motion.tween({ from: 0, to: 1, dur: dur, delay: delay || 0, ease: 'linear',
      step: function (v, t) { step(ease(t == null ? v : t)); }, done: done });
  }
  /* sliding-window reveal: wrap and inner move in opposite directions (transform only) so the inner content stays
     put while the clip edge sweeps across it. dir 'x' (left to right) or 'y' (top to bottom). */
  /* o.quiet (WOW-SPEC-3 3.3, C3-3): a supporting plot draws without the comet and its light front */
  function reveal(wrap, inner, dur, delay, dir, easing, o) {
    if (reduced() || !wrap || !inner) return null;
    var ax = dir === 'y' ? 'Y' : 'X';
    var e = easing || voice('draw');
    var aw = anim(wrap, [{ transform: 'translate' + ax + '(-100%)' }, { transform: 'translate' + ax + '(0)' }], dur, delay, e, 'backwards');
    var a = anim(inner, [{ transform: 'translate' + ax + '(100%)' }, { transform: 'translate' + ax + '(0)' }], dur, delay, e, 'backwards');
    wrap._pmuRv = [aw, a];
    /* the comet: a light riding the primary line on the reveal edge (WOW-SPEC 3.1 Phase C, 3.3; PMU.film.comet) */
    if (ax === 'X' && !(o && o.quiet) && PMU.film && PMU.film.comet) PMU.film.comet(wrap, inner, { dur: dur, delay: delay, easing: e, noFront: o && o.noFront });
    return a;
  }
  charts.motion = { fam: fam, reduced: reduced, EASE: EASE, voice: voice, curve: curve, anim: anim, tween: tw, reveal: reveal };

  /* ---------- round 3 (WOW-SPEC-3 3.3, 5 Phase C; WOW-TASKS-3 C3-3): quiet entrances. A supporting plate's charts arrive
     quiet and already true: plots draw 600 DRAW without a comet or light front (their marks appear at draw end), meters
     fill 520 ROLL without a head glow and write their value final, rows / columns / rings grow without light; on the
     no-GPU profile a quiet chart shows final. The engine's quiet reveal runs the card's entrance inside
     PMU.charts.quietly(fn) (or sets PMU.film.quietNow); the state is captured when chart.enter() is called. ---------- */
  var quietDepth = 0;
  function soft() { return !!(PMU.film && PMU.film.soft ? PMU.film.soft() : document.documentElement.hasAttribute('data-pmu-soft')); }
  function quietNow() {
    if (quietDepth > 0) return true;
    var q = PMU.film && PMU.film.quietNow;
    return typeof q === 'function' ? !!q() : q === true;
  }
  charts.quietly = function (fn) { quietDepth++; try { return fn(); } finally { quietDepth--; } };
  charts.motion.quiet = quietNow;
  charts.motion.soft = soft;
  /* the light a chart may carry in its entrance (WOW-SPEC-3 3.3): never when quiet; the engine's light budget also drops
     comet and head-glow layers for cards outside it (PMU.film.comet / headGlow return null there) */
  charts.motion.lit = function (c) { return !(c && c._quiet); };
  /* the card a chart sits in, and whether it is the room's hero (data-hero, E3-5) */
  function cardOf(el) { return el && el.closest ? el.closest('.pmu-card') : null; }
  charts.cardOf = cardOf;
  charts.isHero = function (c) { var k = cardOf(c && (c.host || c.el)); return !!(k && k.hasAttribute('data-hero')); };
  /* in view (no layout read: the board's cached grid geometry); a chart outside the viewport never animates (PERF-3 rule 3) */
  charts.inView = function (c) {
    var k = cardOf(c && (c.host || c.el));
    if (!k || !PMU.board || !PMU.board.inView) return true;
    try { return PMU.board.inView(k); } catch (error) { return true; }
  };
  /* PMU.charts.of(el): the chart object of a chart root or of the chart that holds el (live hooks, flyers) */
  charts.of = function (el) {
    if (!el) return null;
    if (el._pmuChart) return el._pmuChart;
    var r = el.closest ? el.closest('[data-pmu-chart]') : null;
    return r && r._pmuChart ? r._pmuChart : null;
  };

  /* ---------- the calm ramp (WOW-SPEC-3 4.5, WOW-TASKS-3 C3-1): the step of a "% used" reading on the severity ramp and
     its value. Step 0 below 50 and 1 for 50-79 shade continuously by --v (indigo -> cyan -> mint, 30-charts.css, behind
     the spectrum flag); 2 warn, 3 crit / switch, 4 exhausted, 5 over follow the Settings thresholds through the tone.
     A missing reading has no step (missing never draws as zero). ---------- */
  var RAMP = { warn: 2, crit: 3, hot: 3, exhausted: 4, over: 5 };
  function toneFor(pct, tone) {
    var tn = tone || (PMU.roster && PMU.roster.tone ? PMU.roster.tone(pct) : null) || 'calm';
    if (tn === 'hot') tn = 'crit';
    if (tn === 'watch') tn = 'calm';
    if (pct > 100 && tn !== 'over') tn = 'over';
    if (pct >= 100 && tn === 'calm') tn = 'exhausted';
    return tn;
  }
  function rampStep(tone, pct) { return RAMP[tone] != null ? RAMP[tone] : pct >= 50 ? 1 : 0; }
  charts.ramp = function (pct, tone) {
    if (!finite(pct)) return { ramp: null, v: null, tone: 'missing' };
    var tn = toneFor(pct, tone);
    return { ramp: rampStep(tn, pct), v: r1(clamp(pct, 0, 100)), tone: tn };
  };
  charts.rampAttr = function (pct, tone) { var r = charts.ramp(pct, tone); return r.ramp == null ? '' : ' data-ramp="' + r.ramp + '"'; };
  charts.rampVar = function (pct) { return finite(pct) ? '--v:' + r1(clamp(pct, 0, 100)) : ''; };
  charts.rampTone = toneFor;
  charts.rampStep = rampStep;

  /* ---------- HTML marks (WOW-TASKS C-9): every mark that animates on its own (end dots, NOW halos, cost dots, the
     TODAY marker, the budget rule) is an HTML element in a layer over the plot, never an SVG child: an animation of an
     SVG child runs on the main thread and keeps a full frame running on the CPU-only VM, an HTML transform or opacity
     runs on the compositor. Positions are left / top (laid out once); transform stays free for the motion. ---------- */
  charts.dotHtml = function (x, y, k, o) {
    o = o || {};
    var pos = ' style="left:' + r1(x) + 'px;top:' + r1(y) + 'px"';
    return (o.halo ? '<i class="pmu-hhalo"' + keyAttrs(k) + (o.key ? ' data-key="' + esc(o.key) + '"' : '') + pos + '></i>' : '') +
      '<i class="pmu-hdot pmu-mark' + (o.size ? ' is-' + o.size : '') + (o.hollow ? ' is-hollow' : '') + '" data-mark="dot"' + keyAttrs(k) +
      (o.key ? ' data-key="' + esc(o.key) + '"' : '') + (o.attrs || '') + pos + '></i>';
  };
  /* a dot pops (or blinks on in three steps under NieR, WOW-SPEC 5); a halo swells .2 -> 1.35 -> 1 */
  charts.popDot = function (el, delay, dur) {
    if (!el || reduced()) return null;
    var f = fam();
    if (f === 'nier') return anim(el, [{ opacity: 0 }, { opacity: 1 }], 90, delay, 'steps(3,jump-start)', 'backwards');
    if (f === 'retro') return anim(el, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], 120, delay, 'steps(2,jump-start)', 'backwards');
    return anim(el, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], dur || 260, delay, f === 'friendly' ? 'cubic-bezier(.34,1.56,.64,1)' : EASE.spring, 'backwards');
  };
  charts.swellHalo = function (el, delay) {
    if (!el || reduced()) return null;
    return anim(el, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.35)', opacity: 1, offset: 0.45 }, { transform: 'scale(1)', opacity: 1 }], 620, delay, EASE.out, 'backwards');
  };

  /* ---------- the compositor arc sweep (WOW-TASKS C-2): a ring or donut picture is revealed from 12 o'clock by two
     rotating half masks, each holding a counter-rotated copy of the picture, so the arc grows without a frame of main
     thread work (the old sweep re-wrote stroke-dasharray from a JS tween every frame). The wedge [0, a] (degrees,
     clockwise from 12 o'clock) is the intersection of a static half plane and a rotating half plane: the right half
     shows [0, min(a, 180)], the left half [180, max(a, 180)]. With the effect easing on the whole animation, keyframe
     offsets are eased progress, so the two halves and the glint arm stay on one timeline. The copies are removed when
     the sweep ends and the original (its arcs hidden while it ran) shows the same picture. ---------- */
  charts.arcSweep = function (box, picture, o) {
    o = o || {};
    if (!box || !picture || reduced() || typeof box.animate !== 'function') return null;
    var a0 = clamp(o.from || 0, 0, 360), a1 = clamp(o.to == null ? 360 : o.to, 0, 360);
    if (Math.abs(a1 - a0) < 0.5) return null;
    var dur = o.dur || 900, delay = o.delay || 0, f = fam();
    var easing = o.easing || (f === 'retro' ? 'steps(8,jump-start)' : f === 'nier' ? 'steps(6,jump-start)' : 'cubic-bezier(.16,1,.3,1)');
    if (box._pmuSweep) box._pmuSweep.cancel();
    var wrap = H('div', 'pmu-sweep');
    wrap.setAttribute('aria-hidden', 'true');
    /* keyframes of a rotation that is a piecewise-linear function of the wedge angle, sampled at the wedge's kink */
    function frames(fn, sign) {
      var pts = [0, 1], kink = (180 - a0) / (a1 - a0);
      if (kink > 0 && kink < 1) pts.splice(1, 0, kink);
      return pts.map(function (p) { var a = a0 + (a1 - a0) * p; return { offset: p, transform: 'rotate(' + (sign * fn(a)).toFixed(2) + 'deg)' }; });
    }
    var halves = [
      { side: 'r', fn: function (a) { return Math.min(a, 180) - 180; }, need: Math.min(a0, a1) < 180 },
      { side: 'l', fn: function (a) { return Math.max(a, 180) - 180; }, need: Math.max(a0, a1) > 180 }
    ];
    var anims = [];
    halves.forEach(function (h) {
      if (!h.need) return;
      var half = H('div', 'pmu-sweep-h is-' + h.side, wrap), rot = H('div', 'pmu-sweep-r', half), cnt = H('div', 'pmu-sweep-c', rot);
      cnt.appendChild(picture.cloneNode(true));
      anims.push(anim(rot, frames(h.fn, 1), dur, delay, easing, 'both'), anim(cnt, frames(h.fn, -1), dur, delay, easing, 'both'));
    });
    /* the glint (WOW-SPEC 3.3): a 6 px white light at 60 % rides the leading cap on an arm that turns with the wedge */
    if (o.glint !== false && f !== 'nier') {
      var arm = H('div', 'pmu-sweep-arm', wrap), g = H('i', 'pmu-sweep-glint', arm);
      if (o.radius) g.style.top = r1(o.radius) + '%';
      anims.push(anim(arm, [{ transform: 'rotate(' + a0 + 'deg)', opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.82 },
        { transform: 'rotate(' + a1 + 'deg)', opacity: 0 }], dur, delay, easing, 'both'));
    }
    box.appendChild(wrap);
    box.setAttribute('data-sweeping', '');
    var done = false, handle = {
      cancel: function () { if (done) return; done = true; anims.forEach(function (a) { if (a) try { a.cancel(); } catch (e) {} }); wrap.remove(); box.removeAttribute('data-sweeping'); if (box._pmuSweep === handle) box._pmuSweep = null; }
    };
    box._pmuSweep = handle;
    var first = anims.filter(Boolean)[0];
    if (!first) { handle.cancel(); return null; }
    first.finished.then(function () { setTimeout(handle.cancel, 40); }, function () {});
    return handle;
  };
  /* the film vocabulary carries the sweep too (NOTES2-charts engine 1): PMU.film.arcSweep is this function */
  if (PMU.film && !PMU.film.arcSweep) PMU.film.arcSweep = charts.arcSweep;

  /* number roll: from the value on screen to the new one (first time from 0), tabular, no overshoot. The element keeps
     the shown value in data-shown so a later change counts from it (DESIGN-SPEC 8.5, A1 8.1). */
  charts.roll = function (el, to, format, opts) {
    if (!el) return null;
    opts = opts || {};
    format = format || function (v) { return String(Math.round(v)); };
    if (el._pmuRoll) { el._pmuRoll.cancel(); el._pmuRoll = null; }
    var shown = parseFloat(el.getAttribute('data-shown'));
    var first = !finite(shown);
    var from = first ? (opts.from != null ? opts.from : 0) : shown;
    if (!finite(to)) { el.textContent = opts.missing || '-'; el.removeAttribute('data-shown'); return null; }
    el.setAttribute('data-shown', String(to));
    /* a quiet entrance writes its numbers final (WOW-SPEC-3 3.3: supporting values never roll on an entrance) */
    if (reduced() || from === to || opts.instant || opts.quiet || (first && quietNow())) { el.textContent = opts.finalText != null ? opts.finalText : format(to); return null; }
    /* every roll is an odometer since the WOW round (WOW-SPEC 3.1, 3.6; PMU.film.odometer): digit columns on the compositor */
    if (opts.finalText == null && PMU.film && PMU.film.odometer) {
      el._pmuRoll = PMU.film.odometer(el, to, format, { from: first ? null : from, change: !first, delay: opts.delay || 0, dur: opts.dur, spins: opts.spins });
      return el._pmuRoll;
    }
    el.textContent = format(from);
    el._pmuRoll = tw(opts.dur || (first ? 1000 : 520), 'count', function (k) { el.textContent = format(k >= 1 ? to : from + (to - from) * k); },
      function () { el._pmuRoll = null; el.textContent = opts.finalText != null ? opts.finalText : format(to); }, opts.delay || 0);
    return el._pmuRoll;
  };
  /* value-change pulse (WOW-SPEC 3.6): the reading flashes once (a pre-painted glow layer, opacity only) and a light
     sweeps across it (PMU.film.flash); values never scale or bounce. Nothing pulses on first render. */
  charts.pulse = function (el) {
    if (!el || reduced()) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    if (PMU.film && PMU.film.flash) { PMU.film.flash(el, {}); return; }
    var u = H('i', 'pmu-pulseline', el);
    var a = anim(u, [{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1, offset: 0.55 }, { transform: 'scaleX(1)', opacity: 0 }], 460, 0, EASE.out, 'none');
    if (a) a.onfinish = function () { u.remove(); }; else u.remove();
  };

  /* ---------- measuring: one batch per task, one ResizeObserver for every chart ---------- */
  var pending = [], scheduled = false;
  function flush() {
    scheduled = false;
    var list = pending; pending = [];
    /* opts.size {w, h} (round 3): a kind that knows its plot's box passes it, so the first draw forces no layout of the
       body that was just built (the flush's size read was most of the "chart flush" in the room-change profiles); the
       ResizeObserver corrects a wrong hint after the frame's own layout */
    var sizes = list.map(function (c) { if (c._dead) return null; var hz = c._first && c.opts.size; return hz && hz.w > 0 ? { w: hz.w, h: hz.h || 0 } : { w: c.host.clientWidth, h: c.host.clientHeight }; });
    list.forEach(function (c, i) {
      if (!sizes[i]) return;
      c._w = sizes[i].w; c._h = sizes[i].h;
      /* a chart re-created in the same card in the same task (a content update or resize re-renders the body) morphs from
         the one it replaces instead of appearing in its final state (WOW-SPEC 3.4) */
      /* never during an entrance for a chart outside the light budget (a supporting card re-rendered by the release's
         re-measure shows final, WOW-SPEC-3 3.3; the soft arrival probe caught a meter morphing with its heat layer) */
      var carried = c._carry && c._first && !c._entered && c._pendingEnter == null && !reduced() && !charts.noCarry &&
        !(PMU.film && PMU.film.isQuiet && PMU.film.isQuiet(c.el)) ? c._carry : null;
      c._carry = null;
      try {
        if (carried && c._impl.carry) { Object.assign(c, carried.state || {}); c._impl.carry(c, carried); c._drawn = true; }
        else c._draw(c._first, !c._first);
      } catch (error) { console.error('[pm-usage] chart draw', c.name, error); }
      c._first = false;
      if (c._pendingEnter != null && c._drawn) { var d = c._pendingEnter; c._pendingEnter = null; c._enter(d, c._pendingQuiet); }
    });
  }
  function schedule(c) {
    if (pending.indexOf(c) < 0) pending.push(c);
    if (!scheduled) { scheduled = true; (window.queueMicrotask || function (f) { Promise.resolve().then(f); })(flush); }
  }
  charts.flush = flush;
  /* a host's layout size changed: re-lay the chart on the next frame (never inside the observer callback, so a chart
     that changes its host's height cannot loop the observer); flow charts (content sets their height) track width only */
  var watched = new Map(), resizeQ = [], resizeRaf = 0;
  function runResizes() {
    resizeRaf = 0;
    var list = resizeQ; resizeQ = [];
    var sizes = list.map(function (c) { return c._dead ? null : { w: c.host.clientWidth, h: c.host.clientHeight }; });
    list.forEach(function (c, i) {
      var sz = sizes[i];
      if (!sz) return;
      if (Math.abs(sz.w - c._w) < 1 && (c._flow || Math.abs(sz.h - c._h) < 1)) return;
      c._w = sz.w; c._h = sz.h;
      try { c._draw(false, true); } catch (error) { console.error('[pm-usage] chart resize', c.name, error); }
    });
  }
  var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function (entries) {
    entries.forEach(function (entry) {
      var c = watched.get(entry.target);
      if (!c || c._dead || !c._drawn) return;
      var w = entry.contentRect.width, h = entry.contentRect.height;
      if (Math.abs(w - c._cw) < 1 && (c._flow || Math.abs(h - c._ch) < 1)) return;
      c._cw = w; c._ch = h;
      /* the box the chart was drawn for (a size hint, or the first read): nothing to do, and no read in the next frame */
      if (Math.abs(w - c._w) < 1 && (c._flow || Math.abs(h - c._h) < 1)) return;
      if (resizeQ.indexOf(c) < 0) resizeQ.push(c);
    });
    if (resizeQ.length && !resizeRaf) resizeRaf = requestAnimationFrame(runResizes);
  }) : null;

  /* make(name, host, spec, opts, impl): the shared chart object. impl.draw(c, first, resized) builds or re-lays the
     chart from c.spec at c._w x c._h; impl.enter(c, delay) plays the one entrance; impl.update(c, prevSpec) morphs. */
  var carry = {}, carryClear = false;
  function carryKey(c) {
    var card = c.host && c.host.closest ? c.host.closest('.pmu-card[data-widget]') : null;
    if (!card) return null;
    /* a chart inside a keyed row (an account row, a list row) pairs with the same row's chart, not with whatever chart
       now sits at the same index (integration 2, Mac film of "Use this account": the plate changed its columns and the
       Personal row's meter morphed from Work Claude's weekly 54 %) */
    var row = c.host.closest('[data-flash-key]');
    if (row && card.contains(row)) {
      var inRow = row.querySelectorAll('[data-pmu-chart="' + c.name + '"]');
      return card.getAttribute('data-widget') + '|' + c.name + '|row:' + row.getAttribute('data-flash-key') + '|' + Array.prototype.indexOf.call(inRow, c.el);
    }
    var same = card.querySelectorAll('[data-pmu-chart="' + c.name + '"]');
    return card.getAttribute('data-widget') + '|' + c.name + '|' + Array.prototype.indexOf.call(same, c.el);
  }
  function keepCarry(k, entry) {
    carry[k] = entry;
    if (!carryClear) { carryClear = true; (window.queueMicrotask || function (f) { Promise.resolve().then(f); })(function () { carry = {}; carryClear = false; }); }
  }
  charts.make = function (name, host, spec, opts, impl) {
    opts = opts || {};
    var root = H(impl.tag || 'div', 'pmu-chart pmu-c-' + name);
    root.setAttribute('data-pmu-chart', name);
    root.setAttribute('role', impl.role || 'img');
    if (opts.label) root.setAttribute('aria-label', opts.label);
    if (impl.flow) root.setAttribute('data-flow', '1');
    host.appendChild(root);
    var c = { name: name, host: host, el: root, spec: spec || {}, opts: opts, _w: 0, _h: 0, _cw: -1, _ch: -1, _first: true, _drawn: false, _pendingEnter: null,
      _dead: false, _entered: false, _flow: !!impl.flow, _impl: impl, _quiet: false };
    root._pmuChart = c;
    if (impl.carry) { var ck = carryKey(c); if (ck && carry[ck] && carry[ck].name === name) { c._carry = carry[ck]; delete carry[ck]; } }
    c._draw = function (first, resized) {
      if (c._dead) return;
      impl.draw(c, first, !!resized);
      c._drawn = true;
    };
    /* quiet (round 3): a quiet chart on the no-GPU profile shows final (impl.still cleans up whatever the entrance would
       have revealed); otherwise impl.enter reads c._quiet and plays its quiet form */
    c._enter = function (delay, quiet) {
      if (c._entered) return;
      c._entered = true;
      c._quiet = !!quiet;
      if (reduced() || !impl.enter || charts.noEnter) return;
      if (c._quiet && soft()) { if (impl.still) impl.still(c); return; }
      impl.enter(c, delay || 0);
    };
    c.update = function (next, nextOpts) {
      if (c._dead) return;
      var prev = c.spec;
      c.spec = next || c.spec;
      if (nextOpts) c.opts = Object.assign({}, c.opts, nextOpts);
      if (!c._drawn) { schedule(c); return; }
      if (impl.update) impl.update(c, prev); else c._draw(false, false);
    };
    /* a live change (WOW-SPEC-3 8.4, WOW-TASKS-3 C3-4): in place, only what changed; o.lead carries the light. A chart
       outside the viewport, under Reduce Motion or not yet drawn takes its final state without motion. Returns the
       number of animations it created (the engine counts the beat's budget). */
    c.live = function (next, lo) {
      if (c._dead) return { anims: 0 };
      lo = lo || {};
      var prev = c.spec;
      c.spec = next || c.spec;
      if (!c._drawn) { schedule(c); return { anims: 0 }; }
      var still = reduced() || !charts.inView(c) || lo.still;
      if (impl.live) return impl.live(c, prev, { lead: !!lo.lead, delay: lo.delay || 0, still: still, soft: soft() }) || { anims: 0 };
      if (still) { c._draw(false, false); return { anims: 0 }; }
      if (impl.update) impl.update(c, prev); else c._draw(false, false);
      return { anims: 0 };
    };
    c.resize = function () { if (!c._dead) schedule(c); };
    c.enter = function (delay, eo) {
      if (c._dead) return;
      var q = eo && eo.quiet != null ? !!eo.quiet : quietNow() || !!(PMU.film && PMU.film.isQuiet && PMU.film.isQuiet(c.el));
      if (!c._drawn) { c._pendingEnter = delay || 0; c._pendingQuiet = q; return; }
      c._enter(delay || 0, q);
    };
    /* the chart side of a room's signature beat (C3-6); impl.beat returns the ms (after delay) at which it ends */
    c.beat = function (delay) { if (c._dead || reduced() || !impl.beat) return 0; return impl.beat(c, delay || 0) || 0; };
    c.destroy = function () {
      if (impl.carry && c._drawn && !c._dead && !reduced()) {
        var ck = carryKey(c);
        if (ck) try { keepCarry(ck, { name: name, spec: c.spec, state: { _geo: c._geo, _lgeo: c._lgeo, _colH: c._colH, _arcs: c._arcs, _sp: c._sp, _end: c._end, _iso: c._iso },
          snap: impl.snapshot ? impl.snapshot(c) : null }); } catch (error) {}
      }
      c._dead = true;
      ['_tw', '_rt', '_dt'].forEach(function (k) { if (c[k] && c[k].cancel) c[k].cancel(); c[k] = null; });
      if (ro && watched.get(host) === c) { ro.unobserve(host); watched.delete(host); }
      if (impl.destroy) impl.destroy(c);
      if (c._hover) c._hover.destroy();
      root.remove();
    };
    if (ro && !impl.noObserve) {
      var prevChart = watched.get(host);
      if (prevChart && prevChart !== c) ro.unobserve(host);
      watched.set(host, c); ro.observe(host);
    }
    schedule(c);
    if (opts.enter) c.enter(opts.delay || 0);
    return c;
  };
  /* layout size only: transform-independent */
  charts.size = function (host) { return { w: Math.max(0, host.clientWidth), h: Math.max(0, host.clientHeight) }; };
  /* does the widget already draw its own legend beside this chart? (a legend element in the host's parent that is not
     the chart's own); then the chart draws none, so a legend never shows twice */
  charts.ownLegend = function (c) {
    if (c.opts.legend === true) return false;
    if (c.opts.legend === false || (c.spec && c.spec.legend === false)) return true;
    var par = c.host && c.host.parentNode;
    if (!par || !par.querySelectorAll) return false;
    var list = par.querySelectorAll('.pmu-legend, .pmu-trendlegend, .pmu-heatlegend, .pmu-efflegend, [data-pmu-legend]');
    for (var i = 0; i < list.length; i++) if (!c.el.contains(list[i])) return true;
    return false;
  };

  /* ---------- text width without layout: canvas measure of the theme faces, cached per look ---------- */
  /* Embedded faces (DL-161: data-URI woff2, font-display: swap) load on first use, and a canvas measure never waits for
     one: a face or weight that is still loading measures in the fallback face (Jared's item 9, 2026-10-09: a Friendly
     switch rendered the board while Poppins 500 was still loading). So every measure asks first whether its face is
     ready (document.fonts.check, once per font string), asks for it when it is not, and counts the miss; a memo never
     keeps a measure that missed (50-w-common.js wrapLines). When the faces asked for have landed, every measure is
     redone once: the charts.onFaces listeners run (the wrap memo clears, the board's bodies re-render at their size,
     the heads and the room subtitle re-fit). The sample holds a Latin letter and two PM Symbols, so the symbol faces
     mirrored on each text face (unicode-range) are asked for together with it. */
  var FACE_SAMPLE = 'Ag0 ≈→';
  var cv = null, fontKey = '', faces = { mono: 'monospace', font: 'sans-serif' }, faceOk = {}, faceAsked = {}, missN = 0, missAt = 0, faceFns = [], landT = 0;
  function faceReady(font) {
    if (faceOk[font]) return true;
    var fs = document.fonts;
    if (!fs || typeof fs.check !== 'function' || typeof fs.load !== 'function') { faceOk[font] = true; return true; }
    if (!faceAsked[font]) {
      var ok = true;
      try { ok = fs.check(font, FACE_SAMPLE); } catch (error) { ok = true; }
      if (ok) { faceOk[font] = true; return true; }
      faceAsked[font] = true;
      /* settled either way: a face that failed to load is final too (the fallback is then what the page draws) */
      var done = function () { faceOk[font] = true; delete faceAsked[font]; landed(); };
      try { fs.load(font, FACE_SAMPLE).then(done, done); } catch (error) { done(); }
    }
    missN++;
    return false;
  }
  function landed() {
    if (landT) return;
    /* one batch for the faces that land together (a look's regular and bold cuts arrive within a few ms) */
    landT = setTimeout(function () {
      landT = 0;
      if (Object.keys(faceAsked).length) return;   /* the last face to land runs the batch */
      if (missN === missAt) return;
      missAt = missN; fontKey = '';
      faceFns.slice().forEach(function (fn) { try { fn(); } catch (error) { console.error('[pm-usage] faces listener', error); } });
    }, 16);
  }
  function textW(str, px, mono, weight) {
    var look = PMU.theme.look().key;
    if (fontKey !== look) {
      fontKey = look;
      faces.mono = PMU.theme.token('--pmu-mono') || 'monospace';
      faces.font = PMU.theme.token('--pmu-font') || 'sans-serif';
    }
    if (!cv) cv = document.createElement('canvas').getContext('2d');
    cv.font = (weight || 400) + ' ' + (px || 11) + 'px ' + (mono ? faces.mono : faces.font);
    faceReady(cv.font);
    return cv.measureText(String(str)).width * (mono ? 0.9 : 1);
  }
  charts.textW = textW;
  /* a font string ('600 13px Inter, system-ui'), ready to measure? (false: a fallback measure, counted; the face is asked for) */
  charts.faceReady = faceReady;
  /* the miss count so far: a caller that memoizes compares it before and after its measures */
  charts.faceMisses = function () { return missN; };
  /* fn() once the faces a missed measure asked for have landed */
  charts.onFaces = function (fn) { faceFns.push(fn); };

  /* ---------- scales ---------- */
  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
    var c = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < c.length; i++) if (n <= c[i] + 1e-9) return c[i] * p;
    return 10 * p;
  }
  function nice(max, k) { var step = niceStep((max > 0 ? max : 1) / k); return { step: step, top: step * k, k: k }; }
  /* k divisions for one or two axes: {4,5,6} at 300 px or taller, {3,4} below, {2,3} under 110 px; both axes share k
     so their gridlines line up (A1 7.1, Atlas trendGeo) */
  function scales(maxA, maxB, plotH) {
    /* at least ~18 px between gridlines, so 11 px tick labels never touch (short plots get 2 or 1 divisions) */
    var ks = plotH >= 300 ? [4, 5, 6] : plotH >= 110 ? [3, 4] : plotH >= 60 ? [2, 3] : plotH >= 36 ? [2] : [1];
    var best = null, waste = Infinity;
    ks.forEach(function (k) {
      var a = nice(maxA * 1.04, k), b = maxB == null ? null : nice(maxB * 1.04, k);
      var w = Math.max(maxA > 0 ? a.top / maxA : 1, b && maxB > 0 ? b.top / maxB : 1);
      if (w < waste - 1e-9) { waste = w; best = { a: a, b: b }; }
    });
    return best;
  }
  charts.nice = nice;
  charts.scales = scales;
  charts.ticks = function (min, max, n) {
    var s = nice(max - min, n || 4), out = [];
    for (var v = Math.floor(min / s.step) * s.step; v <= max + s.step * 0.001; v += s.step) out.push(+v.toFixed(10));
    return out;
  };

  /* ---------- formats for axes and values ---------- */
  function fmtAxis(v, unit, step) {
    if (v === 0) return unit === 'usd' ? '$0' : unit === 'pct' ? '0%' : '0';
    if (unit === 'usd') {
      /* decimals follow the step, so a 1.5 step reads $1.5 / $3 / $4.5, never $2 / $3 / $5 */
      var dec = 0; while (dec < 2 && Math.abs((step || 1) * Math.pow(10, dec) - Math.round((step || 1) * Math.pow(10, dec))) > 1e-6) dec++;
      if (dec && Math.abs(v - Math.round(v)) < 1e-9) dec = 0;
      if (v >= 10000) return '$' + +(v / 1000).toFixed(1) + 'k';
      return '$' + v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    if (unit === 'pct') return Math.round(v) + '%';
    if (unit === 's') return v < 1 ? +v.toFixed(2) + 's' : Math.round(v) + 's';
    if (v >= 1e9) return +(v / 1e9).toFixed(1) + 'B';
    if (v >= 1e6) return +(v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return +(v / 1e3).toFixed(1) + 'k';
    return String(+v.toFixed(2));
  }
  /* money with the microdollar rule (6 decimals below $0.01, 4 below $1, else 2); separators only in the integer part */
  function money(v) {
    var a = Math.abs(v), d = a === 0 ? 2 : a < 0.01 ? 6 : a < 1 ? 4 : 2;
    var parts = a.toFixed(d).split('.');
    return (v < 0 ? '-' : '') + '$' + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? '.' + parts[1] : '');
  }
  charts.money = money;
  function fmtValue(v, unit) {
    if (!finite(v)) return '-';
    var f = PMU.fmt || {};
    if (unit === 'usd') return money(v);
    if (unit === 'pct') return Math.round(v * 10) / 10 + '%';
    if (unit === 'count') return f.num ? f.num(Math.round(v)) : String(Math.round(v));
    if (unit === 's') return v < 10 ? v.toFixed(2) + ' s' : v.toFixed(1) + ' s';
    return f.tok ? f.tok(v) : String(v);
  }
  charts.fmtAxis = fmtAxis;
  charts.fmtValue = fmtValue;
  var UNIT_TITLE = { tokens: 'TOKENS', usd: 'USD', pct: '% USED', count: 'COUNT', s: 'SECONDS' };
  charts.unitTitle = function (unit) { return UNIT_TITLE[unit] || ''; };

  /* ---------- time ---------- */
  function clock(ms) { var d = new Date(ms); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function dayLabel(ms) { var d = new Date(ms); return WD[d.getDay()] + ' ' + d.getDate(); }
  function mdLabel(ms) { var d = new Date(ms); return MO[d.getMonth()] + ' ' + d.getDate(); }
  function wmd(ms) { var d = new Date(ms); return WD[d.getDay()] + ', ' + MO[d.getMonth()] + ' ' + d.getDate(); }
  charts.time = { clock: clock, day: dayLabel, md: mdLabel, wmd: wmd };
  /* x ticks: the smallest step of 1h 2h 3h 6h 12h 1d 2d 7d that is at least the bucket and leaves 74 px per tick;
     a midnight tick reads "Thu 1", others "15:00" (24-hour); steps of two days or more read "Sep 24" */
  function xTicks(t0, t1, bucket, pw, minPx) {
    var span = Math.max(1, t1 - t0), need = minPx || 74;
    var cands = [HOUR, 2 * HOUR, 3 * HOUR, 6 * HOUR, 12 * HOUR, DAY, 2 * DAY, 7 * DAY].filter(function (s) { return s >= Math.min(bucket || HOUR, DAY); });
    var step = 7 * DAY;
    for (var i = 0; i < cands.length; i++) if (pw / (span / cands[i]) >= need) { step = cands[i]; break; }
    var out = [], d = new Date(t0), tt;
    if (step >= DAY) { d.setHours(0, 0, 0, 0); tt = d.getTime(); if (tt < t0) { d.setDate(d.getDate() + 1); tt = d.getTime(); } }
    else { d.setMinutes(0, 0, 0); tt = d.getTime(); var hs = step / HOUR; while (tt < t0 || new Date(tt).getHours() % hs) tt += HOUR; }
    for (var n = 0; tt < t1 && n < 400; n++) {
      var dt = new Date(tt), midnight = dt.getHours() === 0;
      out.push({ t: tt, major: midnight, label: step >= 2 * DAY ? mdLabel(tt) : midnight ? dayLabel(tt) : clock(tt) });
      if (step >= DAY) { dt.setDate(dt.getDate() + Math.round(step / DAY)); dt.setHours(0, 0, 0, 0); tt = dt.getTime(); } else tt += step;
    }
    return out;
  }
  charts.xTicks = xTicks;
  /* bucket span words for readouts: "THU, OCT 1 · 15:00 TO 16:00" */
  charts.spanLabel = function (lo, hi, bucket) {
    if (bucket >= DAY) return wmd(lo).toUpperCase();
    return (wmd(lo) + ' · ' + clock(lo) + ' to ' + clock(hi)).toUpperCase();
  };
  /* the time domain of a series: explicit bucket starts (spec.x) or buckets that end now */
  charts.xDomain = function (spec, n) {
    var x = spec.x && spec.x.length === n ? spec.x.slice() : null;
    var bucket = spec.bucketMs || (x && x.length > 1 ? x[1] - x[0] : HOUR);
    if (!x) { var end = spec.end || Date.now(); x = []; for (var i = 0; i < n; i++) x.push(end - (n - i) * bucket); }
    var t0 = x[0], t1 = x[n - 1] + bucket;
    return { x: x, bucket: bucket, t0: t0, t1: t1 };
  };

  /* ---------- curves: monotone cubic (Fritsch-Carlson, never overshoots between nodes) ---------- */
  function monoFn(xs, ys) {
    var n = xs.length;
    if (n === 1) return function () { return ys[0]; };
    var dx = [], m = [], tg = new Array(n), i;
    for (i = 0; i < n - 1; i++) { dx[i] = (xs[i + 1] - xs[i]) || 1e-6; m[i] = (ys[i + 1] - ys[i]) / dx[i]; }
    tg[0] = m[0]; tg[n - 1] = m[n - 2];
    for (i = 1; i < n - 1; i++) tg[i] = m[i - 1] * m[i] <= 0 ? 0 : 3 * (dx[i - 1] + dx[i]) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    var j = 0;
    return function (x) {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      if (x < xs[j]) j = 0;
      while (j < n - 2 && x > xs[j + 1]) j++;
      var h = dx[j], s = (x - xs[j]) / h, s2 = s * s, s3 = s2 * s;
      var y = (2 * s3 - 3 * s2 + 1) * ys[j] + (s3 - 2 * s2 + s) * h * tg[j] + (-2 * s3 + 3 * s2) * ys[j + 1] + (s3 - s2) * h * tg[j + 1];
      return clamp(y, Math.min(ys[j], ys[j + 1]), Math.max(ys[j], ys[j + 1]));
    };
  }
  charts.monotone = monoFn;
  /* cubic Bezier segments through points with monotone tangents: a smooth path without sampling */
  function monoD(pts, move) {
    var n = pts.length;
    if (!n) return '';
    if (n === 1) return (move === false ? 'L' : 'M') + r1(pts[0][0]) + ',' + r1(pts[0][1]);
    var dx = [], m = [], tg = new Array(n), i;
    for (i = 0; i < n - 1; i++) { dx[i] = (pts[i + 1][0] - pts[i][0]) || 1e-6; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
    tg[0] = m[0]; tg[n - 1] = m[n - 2];
    for (i = 1; i < n - 1; i++) tg[i] = m[i - 1] * m[i] <= 0 ? 0 : 3 * (dx[i - 1] + dx[i]) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    var d = (move === false ? 'L' : 'M') + r1(pts[0][0]) + ',' + r1(pts[0][1]);
    for (i = 0; i < n - 1; i++) {
      var h = dx[i] / 3;
      d += 'C' + r1(pts[i][0] + h) + ',' + r1(pts[i][1] + tg[i] * h) + ',' + r1(pts[i + 1][0] - h) + ',' + r1(pts[i + 1][1] - tg[i + 1] * h) + ',' +
        r1(pts[i + 1][0]) + ',' + r1(pts[i + 1][1]);
    }
    return d;
  }
  charts.monoD = monoD;
  /* polyline through sampled y values between x0 and x1 */
  function lineD(x0, x1, ys) {
    var n = ys.length, d = '';
    for (var i = 0; i < n; i++) d += (i ? 'L' : 'M') + r1(x0 + (x1 - x0) * (n > 1 ? i / (n - 1) : 0)) + ',' + r1(ys[i]);
    return d;
  }
  function bandD(x0, x1, top, bot) {
    var n = top.length, d = '', i;
    for (i = 0; i < n; i++) d += (i ? 'L' : 'M') + r1(x0 + (x1 - x0) * (n > 1 ? i / (n - 1) : 0)) + ',' + r1(top[i]);
    for (i = n - 1; i >= 0; i--) d += 'L' + r1(x0 + (x1 - x0) * (n > 1 ? i / (n - 1) : 0)) + ',' + r1(bot[i]);
    return d + 'Z';
  }
  charts.lineD = lineD;
  charts.bandD = bandD;
  /* split a series into runs of non-null indices (gaps stay gaps, R-STATE-01) */
  charts.runs = function (values) {
    var out = [], cur = null;
    (values || []).forEach(function (v, i) {
      if (finite(v)) { if (!cur) { cur = []; out.push(cur); } cur.push(i); } else cur = null;
    });
    return out;
  };

  /* ---------- page-level defs: gradients per token type, vendor, state and slot; patterns ---------- */
  var TK = ['in', 'out', 'rsn', 'cw', 'cr', 'all'];
  var VENDORS = ['anthropic', 'openai', 'google', 'alibaba', 'moonshot', 'github', 'meta', 'xai', 'zai', 'minimax', 'opencode', 'cursor', 'community', 'network'];
  charts.TK = TK;
  charts.VENDORS = VENDORS;
  function grad(id, color, a, b) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" style="stop-color:' + color + ';stop-opacity:' + a + '"/>' +
      '<stop offset="1" style="stop-color:' + color + ';stop-opacity:' + b + '"/></linearGradient>';
  }
  charts.defs = function () {
    var defs = document.getElementById('pmuDefs');
    if (!defs || defs.getAttribute('data-ready') === 'v4') return defs;
    var html = '', k;
    for (k = 0; k < 8; k++) {
      html += grad('pmu-g-' + k, 'var(--pmu-s' + k + ')', 0.42, 0);
      html += grad('pmu-gl-' + k, 'var(--pmu-s' + k + ')', 0.32, 0);
      html += '<linearGradient id="pmu-gh-' + k + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--pmu-s' + k + '-b)"/>' +
        '<stop offset="1" style="stop-color:var(--pmu-s' + k + ')"/></linearGradient>';
    }
    TK.forEach(function (tk) {
      html += grad('pmu-ga-tk-' + tk, 'var(--pmu-tk-' + tk + ')', 0.40, 0.04);
      html += grad('pmu-gb-tk-' + tk, 'var(--pmu-tk-' + tk + ')', 0.78, 0.46);
      html += grad('pmu-gl-tk-' + tk, 'var(--pmu-tk-' + tk + ')', 0.32, 0);
    });
    VENDORS.forEach(function (v) { html += grad('pmu-ga-v-' + v, 'var(--pmu-v-' + v + ')', 0.34, 0.03); });
    /* ring arcs: a diagonal sheen from the lighter end to the full colour */
    TK.concat(['calm', 'warn', 'crit']).forEach(function (k) {
      var col = /^(calm|warn|crit)$/.test(k) ? 'var(--pmu-' + k + ')' : 'var(--pmu-tk-' + k + ')';
      html += '<linearGradient id="pmu-gr-' + k + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:' + col + ';stop-opacity:.55"/>' +
        '<stop offset=".6" style="stop-color:' + col + ';stop-opacity:1"/></linearGradient>';
    });
    html += grad('pmu-gq-calm', 'var(--pmu-calm)', 0.34, 0.03) + grad('pmu-gq-warn', 'var(--pmu-warn)', 0.46, 0.05) + grad('pmu-gq-crit', 'var(--pmu-crit)', 0.5, 0.06) +
      grad('pmu-gq-over', 'var(--pmu-over)', 0.5, 0.06);
    html += grad('pmu-ga-calm', 'var(--pmu-calm)', 0.16, 0.02) + grad('pmu-ga-warn', 'var(--pmu-warn)', 0.2, 0.02) +
      grad('pmu-ga-crit', 'var(--pmu-crit)', 0.22, 0.02) + grad('pmu-ga-over', 'var(--pmu-over)', 0.22, 0.02) + grad('pmu-ga-ink', 'var(--pmu-ink)', 0.14, 0.01);
    /* patterns: their strokes are painted by class, so CSS sets the colour per theme */
    html += '<pattern id="pmu-pat-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="pmu-pat-bg" width="6" height="6"/><path class="pmu-pat-ink" d="M0 0v6" stroke-width="2.2"/></pattern>' +
      '<pattern id="pmu-pat-cross" width="7" height="7" patternUnits="userSpaceOnUse"><rect class="pmu-pat-bg" width="7" height="7"/><path class="pmu-pat-ink" d="M0 0l7 7M7 0l-7 7" stroke-width="1.1"/></pattern>' +
      '<pattern id="pmu-pat-dots" width="5" height="5" patternUnits="userSpaceOnUse"><rect class="pmu-pat-bg" width="5" height="5"/><circle class="pmu-pat-dot" cx="2.5" cy="2.5" r="1.2"/></pattern>' +
      '<pattern id="pmu-pat-rules" width="6" height="6" patternUnits="userSpaceOnUse"><rect class="pmu-pat-bg" width="6" height="6"/><path class="pmu-pat-ink" d="M0 3h6" stroke-width="1.4"/></pattern>' +
      '<pattern id="pmu-pat-solid" width="4" height="4" patternUnits="userSpaceOnUse"><rect class="pmu-pat-full" width="4" height="4"/></pattern>' +
      '<pattern id="pmu-pat-est" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="pmu-pat-est" d="M0 0v6" stroke-width="2"/></pattern>' +
      '<pattern id="pmu-pat-out" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="pmu-pat-out" d="M0 0v6" stroke-width="1.2"/></pattern>';
    defs.innerHTML = html;
    defs.setAttribute('data-ready', 'v4');
    return defs;
  };

  /* ---------- legend (A1 7.1): swatch + name + qualifier; a click isolates that series, a second click restores ---------- */
  /* items: {key, name, qual?, swatch: 'box'|'line'|'half'|'soft'|'dash'|'hatch', tk?, vendor?, idx?, tone?, valueText?, parts?} */
  charts.legend = function (host, items, opts) {
    opts = opts || {};
    var el = H('div', 'pmu-legend' + (opts.inline ? ' pmu-legend-inline' : '') + (opts.cls ? ' ' + opts.cls : ''));
    var isolated = null;
    function render(list) {
      el.innerHTML = (list || []).map(function (it) {
        var sw = it.swatch || 'box';
        var swHtml = sw === 'half'
          ? '<i class="pmu-swatch" data-sw="half"' + keyAttrs(it.parts ? it.parts[0] : it) + '></i><i class="pmu-swatch" data-sw="half"' + keyAttrs(it.parts ? it.parts[1] : it) + '></i>'
          : '<i class="pmu-swatch" data-sw="' + sw + '"' + keyAttrs(it) + '></i>';
        var k = it.key || it.name;
        /* compact items (narrow stacked charts): swatch + the provider's official mark, the name in the hover tag */
        if (it.compact && it.prov && PMU.mark) {
          return '<span class="pmu-legend-item is-compact' + (isolated && isolated !== k ? ' is-dim' : '') + '" data-key="' + esc(k) + '" data-prov="' + esc(it.prov) + '" data-pm-hover-label="' + esc(it.name) + '"' +
            (opts.onToggle ? ' role="button" tabindex="0"' : '') + ' aria-label="' + esc(it.name) + '">' + swHtml + PMU.mark(it.prov, 14) + '</span>';
        }
        return '<span class="pmu-legend-item' + (isolated && isolated !== k ? ' is-dim' : '') + '" data-key="' + esc(k) + '"' + (it.prov ? ' data-prov="' + esc(it.prov) + '"' : '') +
          (it.full && it.full !== it.name ? ' data-pm-hover-label="' + esc(it.full) + '"' : '') +
          (opts.onToggle ? ' role="button" tabindex="0"' : '') + '>' + swHtml + (it.markName && it.prov && PMU.mark ? PMU.mark(it.prov, 14) : '') + '<span class="pmu-legend-name">' + esc(it.name) + '</span>' +
          (it.qual ? '<em>' + esc(it.qual) + '</em>' : '') + (it.valueText ? '<b>' + esc(it.valueText) + '</b>' : '') + '</span>';
      }).join('');
    }
    render(items);
    if (opts.onToggle) {
      var act = function (e) {
        var item = e.target.closest('.pmu-legend-item');
        if (!item) return;
        var k = item.getAttribute('data-key');
        isolated = isolated === k ? null : k;
        $$('.pmu-legend-item', el).forEach(function (n) { n.classList.toggle('is-dim', !!isolated && n.getAttribute('data-key') !== isolated); });
        opts.onToggle(isolated);
      };
      el.addEventListener('click', act);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(e); } });
    }
    if (host) host.appendChild(el);
    el._pmuRender = render;
    el._pmuReset = function () { isolated = null; };
    return el;
  };

  /* ---------- crosshair and readout card (A1 7.1) ---------- */
  /* hover(box, cfg): cfg.n, cfg.xAt(i) px, cfg.dots(i) -> [{y, key}], cfg.html(i) -> readout inner html, cfg.pad {t, h, l, r},
     cfg.onIndex(i|null). The line and the dots live in the plot; the card lives in one fixed layer inside the Usage shell
     (so the card body's paint containment never clips it, and it keeps the shell's tokens). Line, dots and card glide
     with transform (140 ms); on first entry they appear in place and fade in. Hover maths reads rects only inside the
     pointer handler (the card is at rest then). */
  var roLayer = null;
  function layer() {
    if (roLayer && roLayer.isConnected) return roLayer;
    var root = document.getElementById('pmuApp') || document.body;
    roLayer = H('div', 'pmu-rolayer', root);
    roLayer.setAttribute('aria-hidden', 'true');
    return roLayer;
  }
  var openCards = new Set();
  window.addEventListener('scroll', function () { openCards.forEach(function (h) { h.hide(); }); }, true);
  /* WOW-SPEC 3.5 (WOW-TASKS C-5): a bucket-wide band (accent 8 %) fades in 120 ms and follows the crosshair by transform;
     the hovered series' dot grows to 5 px with a 12 px halo and the other series dim to 35 % (the series nearest the
     pointer is the hovered one); the card appears from the dot's side (scale .96 -> 1, 120 ms), keeps its side until the
     other side is 48 px better (the flip glides 220 ms), is at most 220 px wide, and rolls only the changed digits of a
     changed value (160 ms odometer); leaving fades everything in 160 ms. */
  function rollText(el, oldText, newText) {
    if (!PMU.film || !PMU.film.odometer || reduced() || oldText === newText || !/\d/.test(newText) || !/\d/.test(oldText)) return;
    var a = parseFloat(String(oldText).replace(/[^0-9.\-]/g, '')), b = parseFloat(String(newText).replace(/[^0-9.\-]/g, ''));
    var from = 0, to = 1;
    if (finite(a) && finite(b) && a !== b) { from = a; to = b; }
    PMU.film.odometer(el, to, function (v) { return v === to ? newText : oldText; }, { from: from, change: true, dur: 160 });
  }
  charts.rollText = rollText;
  /* the readout's content changes in place when its shape is the same (PERF-3): a new child list on every bucket made the
     app's document observers re-scan (its pointer field re-queried every box of the page on the next pointer frame,
     about 10 ms on the VM, and its hover-tag controller bound the new nodes); text and attributes are patched instead,
     and a different shape falls back to innerHTML */
  var tpl = document.createElement('template');
  function sameShape(a, b) {
    if (a.nodeType !== b.nodeType) return false;
    if (a.nodeType !== 1) return a.nodeType === 3;
    if (a.tagName !== b.tagName || a.childNodes.length !== b.childNodes.length) return false;
    for (var i = 0; i < a.childNodes.length; i++) if (!sameShape(a.childNodes[i], b.childNodes[i])) return false;
    return true;
  }
  function copyInto(a, b) {
    if (a.nodeType === 3) { if (a.data !== b.data) a.data = b.data; return; }
    if (a.nodeType !== 1) return;
    var i, at;
    for (i = a.attributes.length - 1; i >= 0; i--) { at = a.attributes[i]; if (!b.hasAttribute(at.name)) a.removeAttribute(at.name); }
    for (i = 0; i < b.attributes.length; i++) { at = b.attributes[i]; if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value); }
    for (i = 0; i < a.childNodes.length; i++) copyInto(a.childNodes[i], b.childNodes[i]);
  }
  function patchHtml(el, html) {
    tpl.innerHTML = html;
    var next = tpl.content;
    var same = el.childNodes.length === next.childNodes.length;
    for (var i = 0; same && i < el.childNodes.length; i++) same = sameShape(el.childNodes[i], next.childNodes[i]);
    if (!same) { el.innerHTML = html; return; }
    for (var j = 0; j < el.childNodes.length; j++) copyInto(el.childNodes[j], next.childNodes[j]);
  }
  charts.patchHtml = patchHtml;
  /* the same for an SVG root's content (parsed in the SVG namespace): a live change patches attributes and text in place */
  var tplSvg = null;
  function patchSvg(svg, html) {
    if (!tplSvg) tplSvg = document.createElementNS(NS, 'svg');
    tplSvg.innerHTML = html;
    var same = svg.childNodes.length === tplSvg.childNodes.length;
    for (var i = 0; same && i < svg.childNodes.length; i++) same = sameShape(svg.childNodes[i], tplSvg.childNodes[i]);
    if (!same) { svg.innerHTML = html; return false; }
    for (var j = 0; j < svg.childNodes.length; j++) copyInto(svg.childNodes[j], tplSvg.childNodes[j]);
    return true;
  }
  charts.patchSvg = patchSvg;
  /* a live patch of an SVG root (WOW-SPEC-3 8.4): the same shape -> every attribute is written in place except the path
     data that changed, which morphs in ONE tween (numbers interpolated where both paths have the same command skeleton:
     the quota row's last segment, the budget's last point, the cone); a different shape -> plain patch. Returns the tween
     (or null). */
  function pathSkel(d) { var nums = []; var sk = String(d || '').replace(/-?\d*\.?\d+(?:e-?\d+)?/gi, function (m) { nums.push(+m); return '#'; }); return { sk: sk, n: nums }; }
  function pathFrom(sk, nums) { var i = 0; return sk.replace(/#/g, function () { var v = nums[i++]; return String(Math.round(v * 10) / 10); }); }
  charts.livePatchSvg = function (svg, html, dur, delay) {
    if (!tplSvg) tplSvg = document.createElementNS(NS, 'svg');
    tplSvg.innerHTML = html;
    var same = svg.childNodes.length === tplSvg.childNodes.length;
    for (var i = 0; same && i < svg.childNodes.length; i++) same = sameShape(svg.childNodes[i], tplSvg.childNodes[i]);
    if (!same || reduced()) { patchSvg(svg, html); return null; }
    var jobs = [];
    var walk = function (a, b) {
      if (a.nodeType !== 1) { if (a.nodeType === 3 && a.data !== b.data) a.data = b.data; return; }
      var d0 = a.getAttribute('d'), d1 = b.getAttribute('d');
      if (d0 != null && d1 != null && d0 !== d1) {
        var p0 = pathSkel(d0), p1 = pathSkel(d1);
        b.removeAttribute('d');
        copyAttrs(a, b);
        if (p0.sk === p1.sk && p0.n.length === p1.n.length) jobs.push({ el: a, sk: p1.sk, a: p0.n, b: p1.n, d1: d1 }); else a.setAttribute('d', d1);
      } else copyAttrs(a, b);
      for (var k = 0; k < a.childNodes.length; k++) walk(a.childNodes[k], b.childNodes[k]);
    };
    var copyAttrs = function (a, b) {
      var at, j;
      for (j = a.attributes.length - 1; j >= 0; j--) { at = a.attributes[j]; if (at.name !== 'd' && !b.hasAttribute(at.name)) a.removeAttribute(at.name); }
      for (j = 0; j < b.attributes.length; j++) { at = b.attributes[j]; if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value); }
    };
    for (var q = 0; q < svg.childNodes.length; q++) walk(svg.childNodes[q], tplSvg.childNodes[q]);
    if (!jobs.length) return null;
    return PMU.motion.tween({ from: 0, to: 1, dur: dur || 420, delay: delay || 0, ease: 'linear',
      step: function (v, t) {
        var x = t == null ? v : t, k = 1 - Math.pow(1 - x, 3);
        jobs.forEach(function (j) { j.el.setAttribute('d', pathFrom(j.sk, j.a.map(function (a0, i) { return a0 + (j.b[i] - a0) * k; }))); });
      },
      done: function () { jobs.forEach(function (j) { j.el.setAttribute('d', j.d1); }); } });
  };
  /* round 3 (PERF-3 open item "crosshair first move"): the first move into a plot no longer flushes style twice. The
     state classes sit on the few elements that change (line, band, dots, card), never on the plot box (a class on the
     box restyled its whole subtree: axes, marks, layers); the dots are built when the chart binds its hover (never a
     child-list change on the pointer frame); one readout card is shared by every chart (only one crosshair shows at a
     time), so a first move usually patches its words in place; the reads come first (the plot's rect, then the card's
     size after its words changed), the writes after; the "appear in place" class is lifted in the next frame instead of
     a forced style flush (void offsetWidth). */
  var sharedCard = null, cardOwner = null;
  function readoutCard() {
    if (sharedCard && sharedCard.isConnected) return sharedCard;
    sharedCard = H('div', 'pmu-readout', layer());
    return sharedCard;
  }
  charts.crosshairOn = function () { return openCards.size > 0; };
  charts.hover = function (box, cfg) {
    var band = H('div', 'pmu-xband', box), xh = H('div', 'pmu-xh', box), dotEls = [];
    var on = false, last = -1, api, side = 1, hotKey = null, py = -1, lastSwap = 0, instantT = 0;
    var geo = null, geoAt = 0, cardSize = null;
    function ensureDots() {
      var n = 0;
      try { n = cfg.n && cfg.dots ? (cfg.dots(Math.max(0, cfg.n - 1)) || []).length : 0; } catch (error) { n = 0; }
      while (dotEls.length < n) dotEls.push(H('i', 'pmu-xdot', box));
    }
    ensureDots();
    function boxGeo() {
      var now = performance.now();
      if (!geo || now - geoAt > 120) { var r = box.getBoundingClientRect(); geo = { r: r, cw: box.clientWidth || r.width || 1 }; geoAt = now; }
      return geo;
    }
    function bandW() {
      if (cfg.bw) return cfg.bw;
      if (cfg.n > 1) return Math.abs(cfg.xAt(1) - cfg.xAt(0));
      return 24;
    }
    function setHot(k) {
      if (k === hotKey) return;
      hotKey = k;
      var root = box.parentNode || box;
      $$('.pmu-mark[data-key]', root).forEach(function (m) { m.classList.toggle('is-cold', !!k && m.getAttribute('data-key') !== k); });
    }
    function parts() { return [xh, band, readoutCard()].concat(dotEls); }
    function place(i, instant) {
      var card = readoutCard();
      /* reads first: the plot's rect (cached for 120 ms), then the card's size once its words changed */
      var g = boxGeo(), r = g.r, k2 = r.width / g.cw;
      var x = cfg.xAt(i), top = cfg.pad.t;
      var olds = null;
      if (last !== i || cardOwner !== api) {
        var nowT = performance.now(), calm = nowT - lastSwap > 90 * (PMU.motion.speed ? PMU.motion.speed() : 1);
        lastSwap = nowT;
        olds = calm && last >= 0 && !instant && cardOwner === api ? $$('.pmu-ro-row', card).map(function (rw) { var n = rw.querySelector('span'), b = rw.querySelector('b'); return [n ? n.textContent : '', b ? b.textContent : '']; }) : null;
        patchHtml(card, cfg.html(i)); cardSize = null;
        cardOwner = api;
      }
      if (!cardSize) cardSize = { w: card.offsetWidth, h: card.offsetHeight };
      /* then the writes */
      if (olds && !charts.noRoll) $$('.pmu-ro-row', card).forEach(function (rw, k) {
        var n = rw.querySelector('span'), b = rw.querySelector('b');
        if (b && olds[k] && n && olds[k][0] === n.textContent) rollText(b, olds[k][1], b.textContent);
      });
      last = i;
      xh.style.height = cfg.pad.h + 'px';
      xh.style.transform = 'translate(' + r1(x) + 'px,' + r1(top) + 'px)';
      var bw = Math.max(4, bandW());
      band.style.height = cfg.pad.h + 'px';
      band.style.width = r1(bw) + 'px';
      band.style.transform = 'translate(' + r1(x - bw / 2) + 'px,' + r1(top) + 'px)';
      var dots = cfg.dots ? cfg.dots(i) : [], nearest = -1, nd = Infinity;
      while (dotEls.length < dots.length) dotEls.push(H('i', 'pmu-xdot', box));
      dotEls.forEach(function (d, k) {
        var p = dots[k];
        if (!p || !finite(p.y)) { if (d.style.visibility !== 'hidden') d.style.visibility = 'hidden'; return; }
        if (d.style.visibility) d.style.visibility = '';
        ['data-tk', 'data-vendor', 'data-series-index', 'data-tone', 'data-dot'].forEach(function (a) { if (d.hasAttribute(a)) d.removeAttribute(a); });
        key(d, p.key);
        if (p.ink) d.setAttribute('data-dot', 'ink');
        d.style.transform = 'translate(' + r1(x) + 'px,' + r1(p.y) + 'px)';
        if (py >= 0 && Math.abs(p.y - py) < nd) { nd = Math.abs(p.y - py); nearest = k; }
      });
      dotEls.forEach(function (d, k) { d.classList.toggle('is-hot', dots.length < 2 || k === nearest); });
      setHot(dots.length > 1 && nearest >= 0 && dots[nearest].dk ? dots[nearest].dk : null);
      var sx = r.left + x * k2, sy = r.top + (top + 4) * k2;
      var cw = cardSize.w, ch = cardSize.h, vw = window.innerWidth, vh = window.innerHeight;
      var limit = Math.min(vw, r.right) - 6, roomR = limit - (sx + 16 + cw), roomL = (sx - 16 - cw) - Math.max(4, r.left - 40);
      /* keep the side; flip only when the current side does not fit and the other is 48 px better (hysteresis) */
      var was = side;
      if (side > 0 && roomR < 0 && roomL > roomR + 48) side = -1;
      else if (side < 0 && (roomL < 0 || roomR > 48) && roomR > roomL - 48 && roomR >= 0) side = 1;
      if (instant) side = roomR >= 0 ? 1 : -1;
      var left = side > 0 ? sx + 16 : sx - 16 - cw;
      left = clamp(left, 4, Math.max(4, vw - cw - 4));
      var y = clamp(sy, 4, Math.max(4, vh - ch - 4));
      card.classList.toggle('is-flip', was !== side && !instant);
      card.style.transformOrigin = side > 0 ? '0 12px' : '100% 12px';
      card.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(y) + 'px)';
    }
    function move(e) {
      if (!cfg.n) return;
      if (!on) geo = null;   /* a fresh read on entry */
      var g = boxGeo(), r = g.r, sc = g.cw / (r.width || 1), mx = (e.clientX - r.left) * sc;
      py = (e.clientY - r.top) * sc;
      if (mx < cfg.pad.l - 10 || mx > g.cw - cfg.pad.r + 10) { hide(); return; }
      var best = 0, bd = Infinity;
      for (var i = 0; i < cfg.n; i++) { var d = Math.abs(cfg.xAt(i) - mx); if (d < bd) { bd = d; best = i; } }
      var first = !on;
      if (first) show(best, true); else place(best, false);
      if (cfg.onIndex) cfg.onIndex(best);
    }
    function show(i, instant) {
      if (cardOwner && cardOwner !== api && cardOwner.hide) cardOwner.hide();
      var card = readoutCard();
      if (instant) parts().forEach(function (el) { el.classList.add('is-instant'); });
      place(i, instant);
      parts().forEach(function (el) { el.classList.add('is-on'); });
      /* a marker only (no rule reads it, so it restyles nothing): the engine's live holds see a crosshair shown */
      box.classList.add('pmu-xh-on');
      on = true; openCards.add(api);
      if (instant) {
        cancelAnimationFrame(instantT);
        instantT = requestAnimationFrame(function () { instantT = 0; parts().forEach(function (el) { el.classList.remove('is-instant'); }); });
        if (!reduced()) anim(card, [{ scale: '.96', opacity: 0 }, { scale: '1', opacity: 1 }], 120, 0, 'cubic-bezier(.22,.8,.28,1)', 'backwards');
      }
    }
    function hide() {
      if (!on) return;
      on = false; last = -1;
      setHot(null);
      [xh, band].concat(dotEls).forEach(function (el) { el.classList.remove('is-on'); });
      box.classList.remove('pmu-xh-on');
      if (cardOwner === api) readoutCard().classList.remove('is-on');
      openCards.delete(api);
      if (cfg.onIndex) cfg.onIndex(null);
    }
    box.addEventListener('pointermove', move);
    box.addEventListener('pointerleave', hide);
    api = {
      set: function (next) { Object.assign(cfg, next); last = -1; geo = null; cardSize = null; if (on) hide(); ensureDots(); },
      hide: hide,
      showAt: function (i) { if (!cfg.n) return; show(clamp(i, 0, cfg.n - 1), true); },
      destroy: function () { hide(); if (cardOwner === api) cardOwner = null; box.removeEventListener('pointermove', move); box.removeEventListener('pointerleave', hide); band.remove(); xh.remove(); dotEls.forEach(function (d) { d.remove(); }); }
    };
    return api;
  };
  /* readout markup helpers */
  charts.ro = {
    title: function (text) { return '<strong>' + esc(text) + '</strong>'; },
    row: function (k, name, value, cls, sw) {
      return '<div class="pmu-ro-row' + (cls ? ' ' + cls : '') + '"><i class="pmu-swatch" data-sw="' + (sw || 'box') + '"' + keyAttrs(k) + '></i><span>' + esc(name) +
        '</span><b>' + esc(value) + '</b></div>';
    },
    sep: function () { return '<div class="pmu-ro-sep"></div>'; },
    foot: function (text) { return text ? '<p>' + esc(text) + '</p>' : ''; }
  };

  /* ---------- chart flyers (WOW-SPEC-3 6.3 "chart:", WOW-TASKS-3 C3-5): a chart that repeats in the next room flies from
     its plot to the target's. The flyer is an SVG whose viewBox is the source's DATA BOX (the plot area of its domain, in
     the source's plot px) holding copies of the primary line and its area (colours inlined, non-scaling strokes); the
     engine scales it non-uniformly from the source's data box to the box the SAME domain occupies on the target, so the
     line lands on the target's line when both show the same data. Rings fly as their picture, scaled uniformly. ---------- */
  function shareOf(el) { var c = charts.of(el && el.querySelector && !el.hasAttribute('data-pmu-chart') && !el._pmuChart ? (el.querySelector('[data-pmu-chart]') || el) : el); return c && c._fly ? c : null; }
  function clientBox(c, box, rect) {
    var ref = c._fly.ref, r = rect || ref.getBoundingClientRect(), w = ref.clientWidth || r.width || 1, k = r.width / w;
    return { left: r.left + box.l * k, top: r.top + box.t * k, width: box.w * k, height: box.h * k };
  }
  var INLINE = ['stroke', 'fill', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity', 'fill-opacity', 'stroke-opacity'];
  charts.flyClone = function (shareEl, rect) {
    var c = shareOf(shareEl);
    if (!c || c._dead) return null;
    var F = c._fly, box = F.box;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'pmu-flychart');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', F.vb || [box.l, box.t, box.w, box.h].map(r1).join(' '));
    svg.setAttribute('preserveAspectRatio', F.ring ? 'xMidYMid meet' : 'none');
    svg.style.overflow = 'visible';
    (F.paths ? F.paths() : []).forEach(function (src) {
      if (!src || !src.getAttribute) return;
      var cs = getComputedStyle(src), cl = src.cloneNode(false);
      Array.prototype.slice.call(cl.attributes).forEach(function (a) { if (a.name !== 'd' && a.name !== 'cx' && a.name !== 'cy' && a.name !== 'r') cl.removeAttribute(a.name); });
      INLINE.forEach(function (k) { var v = cs.getPropertyValue(k); if (v) cl.style.setProperty(k, v); });
      if (!F.ring) cl.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(cl);
    });
    var cr = clientBox(c, box, rect);
    svg.setAttribute('width', r1(cr.width)); svg.setAttribute('height', r1(cr.height));
    return { el: svg, rect: cr, domain: F.domain, ring: !!F.ring, key: F.key };
  };
  charts.flyTarget = function (shareEl, domain, rect) {
    var c = shareOf(shareEl);
    if (!c || c._dead) return null;
    var F = c._fly;
    return clientBox(c, F.boxOf ? F.boxOf(domain || F.domain) : F.box, rect);
  };
  /* a chart whose shared part arrives by flight (WOW-SPEC-3 6.2: "its shared parts arrive by flight") never draws it
     again under the flyer: when its share element is (or becomes, during the entrance) a flight target
     ([data-pmu-fly-target], set by the engine's pairing), the reveal is finished at once under the target's hold, so the
     flyer lands on the finished picture; the marks and beats timed after the landing still play */
  charts.flightTarget = function (c) { var r = c && c._fly && c._fly.share; return !!(r && r.hasAttribute('data-pmu-fly-target')); };
  charts.watchFlight = function (c, finish) {
    var r = c && c._fly && c._fly.share;
    if (!r || typeof MutationObserver !== 'function') return;
    if (c._flyMo) c._flyMo.disconnect();
    var mo = c._flyMo = new MutationObserver(function () { if (r.hasAttribute('data-pmu-fly-target')) { mo.disconnect(); c._flyMo = null; try { finish(); } catch (error) {} } });
    mo.observe(r, { attributes: true, attributeFilter: ['data-pmu-fly-target'] });
    setTimeout(function () { if (c._flyMo === mo) { mo.disconnect(); c._flyMo = null; } }, 2500);
  };
  charts.finishReveal = function (rv) {
    (rv && rv._pmuRv || []).forEach(function (a) { if (a) try { a.finish(); } catch (error) {} });
    var box = rv && rv.parentNode;
    if (box) $$(':scope > .pmu-film-comet, :scope > .pmu-film-front', box).forEach(function (el) { el.remove(); });
  };
  /* charts call this when they draw: where their data box sits and how a domain maps into it */
  /* the share attribute sits on the element that FLIES (the line layer .pmu-rv, the ring's svg), never on the whole plot:
     the engine holds a flight target at opacity 0 and finishes every animation inside it (settleTarget), so the axes,
     markers, cone and rule outside it keep their own entrance and the room's beat; o.ref stays the geometry reference */
  charts.setFly = function (c, ref, key, o) {
    c._fly = Object.assign({ ref: ref, key: key }, o);
    var sh = c._fly.share = (o && o.shareEl) || ref;
    if (key && sh) { var k = 'chart:' + key; if (sh.getAttribute('data-share') !== k) sh.setAttribute('data-share', k); }
  };

  /* ---------- the empty sentence (never a zero line) ---------- */
  charts.empty = function (host, text) {
    var e = H('div', 'pmu-chart-empty', host);
    e.textContent = text || t('charts.empty');
    return e;
  };

  /* ---------- cross-highlight (DESIGN-SPEC 7.1): after a 110 ms intent delay the other providers' marks dim and the
     provider's rows light. Only the elements that change get a class (a board attribute restyled every [data-prov]
     descendant on each exit: about 1,700 elements, 75 ms on the CPU-only VM) ---------- */
  (function crossHighlight() {
    var root = document.getElementById('pmuApp');
    if (!root) return;
    var timer = 0, clearTimer = 0, current = null, lit = [];
    function set(id) {
      var b = document.getElementById('pmuBoard');
      if (!b) return;
      lit.forEach(function (el) { el.classList.remove('is-hl-dim', 'is-hl-on'); });
      lit = [];
      current = id;
      if (!id) return;
      $$('.pmu-mark[data-prov]', b).forEach(function (el) { if (el.getAttribute('data-prov') !== id) { el.classList.add('is-hl-dim'); lit.push(el); } });
      $$('.pmu-irow[data-prov]', b).forEach(function (el) { if (el.getAttribute('data-prov') === id) { el.classList.add('is-hl-on'); lit.push(el); } });
    }
    root.addEventListener('pointerover', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-prov]') : null;
      if (!el || !root.contains(el) || el.closest('.pmu-gallery')) return;
      var id = el.getAttribute('data-prov');
      clearTimeout(clearTimer);
      if (id === current) return;
      clearTimeout(timer);
      timer = setTimeout(function () { set(id); }, 110);
    });
    root.addEventListener('pointerout', function (e) {
      var from = e.target && e.target.closest ? e.target.closest('[data-prov]') : null;
      var to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('[data-prov]') : null;
      if (!from || (to && to.getAttribute('data-prov') === from.getAttribute('data-prov'))) return;
      clearTimeout(timer);
      clearTimeout(clearTimer);
      clearTimer = setTimeout(function () { set(null); }, 60);
    });
  })();

  /* placeholder factory (kept for withdrawn primitives): a quiet labelled box */
  charts.placeholder = function (name) {
    return function (host, spec, opts) {
      var el = H('div', 'pmu-chart pmu-chart-todo', host);
      el.setAttribute('data-pmu-chart', name);
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', (opts && opts.label) || name);
      el.textContent = name;
      return { el: el, update: function () {}, resize: function () {}, enter: function () {}, destroy: function () { el.remove(); } };
    };
  };

  charts.defs();
})();
