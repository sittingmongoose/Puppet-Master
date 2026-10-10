/* Plot primitives (owner: charts; DESIGN-SPEC 7.2, DESIGN-SPEC-ATLAS 7.1 to 7.9 and 7.11): area (with the dual-axis cost
   line and token-type bands), line (limits, forecast and confidence band), columns (single and stacked by provider),
   spark, budget, heat (weekday x hour), qspark (quota history row and focus chart), rangebars (tool latency).
   timeline is withdrawn (the agenda kind renders DOM rows). Every one is PMU.charts.<name>(host, spec, opts) -> Chart. */
(function () {
  var charts = PMU.charts, U = charts.util, S = charts.svg, H = charts.el, Mo = charts.motion;
  var finite = U.finite, clamp = U.clamp, r1 = U.r1, HOUR = U.HOUR, DAY = U.DAY;

  /* ---------- shared plot frame ---------- */
  /* frame(c): root (flex column) > [legend] + .pmu-plotbox > svg.pmu-axes + .pmu-rv > .pmu-rv-in > svg.pmu-plot + svg.pmu-over */
  function frame(c) {
    if (c.f) return c.f;
    var f = c.f = {};
    f.legendHost = H('div', 'pmu-legendslot', c.el);
    f.box = H('div', 'pmu-plotbox', c.el);
    f.axes = S('svg', { class: 'pmu-axes', 'aria-hidden': 'true' }, f.box);
    f.rv = H('div', 'pmu-rv', f.box);
    f.rvin = H('div', 'pmu-rv-in', f.rv);
    f.plot = S('svg', { class: 'pmu-plot', 'aria-hidden': 'true', width: 0, height: 0 }, f.rvin);
    f.over = S('svg', { class: 'pmu-over', 'aria-hidden': 'true', width: 0, height: 0 }, f.box);
    /* HTML marks (dots, halos, markers) over the plot: they animate on the compositor (WOW-TASKS C-9) */
    f.hl = H('div', 'pmu-hmarks', f.box);
    f.hl.setAttribute('aria-hidden', 'true');
    return f;
  }
  /* legend height without layout: lines from the measured text widths */
  function legendLines(items, w) {
    if (!items || !items.length) return 0;
    var lines = 1, x = 0;
    items.forEach(function (it) {
      var iw = it.compact ? 10 + 5 + 14 : 10 + 7 + (it.markName ? 21 : 0) + charts.textW(it.name, 12.5) + (it.qual ? 6 + charts.textW(it.qual, 12) : 0) + (it.valueText ? 6 + charts.textW(it.valueText, 12.5, false, 600) : 0);
      var gap = it.compact ? 12 : 18;
      if (x > 0 && x + gap + iw > w) { lines++; x = iw; } else x += (x ? gap : 0) + iw;
    });
    return lines;
  }
  function setLegend(c, items, onToggle) {
    var f = c.f;
    if (!items || !items.length || charts.ownLegend(c)) { f.legendHost.innerHTML = ''; f.legendHost.style.display = 'none'; f.legendSig = null; return 0; }
    f.legendHost.style.display = '';
    var sig = JSON.stringify(items.map(function (i) { return [i.key || i.name, i.name, i.qual, i.valueText, i.tk, i.vendor, i.idx, i.swatch]; }));
    if (f.legendSig !== sig) {
      f.legendSig = sig;
      f.legendHost.innerHTML = '';
      f.legend = charts.legend(f.legendHost, items, { onToggle: onToggle, cls: items.every(function (i) { return i.compact; }) ? 'pmu-legend-compact' : '' });
    }
    var lines = legendLines(items, c._w - 4);
    var h = lines * 18 + (lines - 1) * 6;
    f.legendHost.style.height = h + 'px';
    return h + 8;
  }
  /* the chart's drawable size: the host's layout box, or a fallback height when the host gives none */
  function dims(c, fallbackH) {
    var W = Math.max(60, c._w || 0), Hh = c._h || 0;
    if (Hh < 48) { Hh = c.opts.height || c.spec.height || fallbackH || 180; c.el.style.height = Hh + 'px'; } else c.el.style.height = '';
    return { W: W, H: Hh };
  }
  /* width tier from the opts or from the measured width (DESIGN-SPEC 2.3) */
  function tierW(c) {
    var t = c.opts.tier && c.opts.tier.w;
    if (t) return t;
    var w = c._w;
    return w < 168 ? 'xs' : w < 248 ? 's' : w < 360 ? 'm' : w < 520 ? 'l' : 'xl';
  }
  var COMPACT = { xs: 1, s: 1 };
  function axisW(labels) { var m = 0; labels.forEach(function (s) { m = Math.max(m, charts.textW(s, 11, true)); }); return m; }
  /* axes: horizontal gridlines with left (and right) ticks sharing k divisions, unit titles, x ticks and grid */
  function drawAxes(svg, g, patch) {
    svg.setAttribute('width', g.W); svg.setAttribute('height', g.H);
    var s = '', i, y;
    for (i = 0; i <= g.ya.k; i++) {
      y = r1(g.pad.t + g.ph - g.ph * i / g.ya.k) + 0.5;
      s += '<path class="pmu-grid' + (i === 0 && g.yMin0 ? ' is-zero' : '') + '" d="M' + g.pad.l + ' ' + y + 'H' + (g.pad.l + g.pw) + '"/>';
      if (!g.noY) s += '<text class="pmu-tick" x="' + (g.pad.l - 10) + '" y="' + (y + 3.5) + '" text-anchor="end">' + esc(g.ylab(i)) + '</text>';
      if (g.yb) s += '<text class="pmu-tick is-right" x="' + (g.pad.l + g.pw + 10) + '" y="' + (y + 3.5) + '">' + esc(g.ylab2(i)) + '</text>';
    }
    if (g.unitA && !g.noY) s += '<text class="pmu-tick is-unit" x="' + (g.pad.l - 10) + '" y="14" text-anchor="end">' + esc(g.unitA) + '</text>';
    if (g.yb && g.unitB) s += '<text class="pmu-tick is-unit" x="' + (g.pad.l + g.pw + 10) + '" y="14">' + esc(g.unitB) + '</text>';
    (g.xt || []).forEach(function (tk) {
      var x = r1(tk.x);
      /* bar labels (columns) stay while they fit inside the svg; time ticks keep clear of the plot edges */
      if (tk.bar) { var hw = charts.textW(tk.label, 11, true) / 2; if (x - hw < 1 || x + hw > g.W - 1) return; }
      else if (x < g.pad.l + 18 || x > g.pad.l + g.pw - 18) return;
      if (g.vgrid !== false) s += '<path class="pmu-vgrid' + (tk.major ? ' is-major' : '') + '" d="M' + x + ' ' + g.pad.t + 'V' + (g.pad.t + g.ph) + '"/>';
      s += '<text class="pmu-tick' + (tk.major ? ' is-major' : '') + '" x="' + x + '" y="' + (g.pad.t + g.ph + 20) + '" text-anchor="middle">' + esc(tk.label) + '</text>';
    });
    var html = s + (g.extra || '');
    /* a live patch with the same words costs nothing (no parse) */
    if (patch) { if (svg._pmuAx !== html) charts.patchSvg(svg, html); } else svg.innerHTML = html;
    svg._pmuAx = html;
  }
  /* swap the static axes layer on a morph (WOW-SPEC 3.4): the old labels leave first (140 ms IN) and the new ones arrive
     after them (from 150 ms over 220 ms OUT), so two labels never print over each other at a readable opacity; both
     layers are whole SVG roots, so the swap runs on the compositor */
  function swapAxes(f, g, morph) {
    /* a live change patches the ticks in place (no new layer, no child-list change when the shape is the same) */
    if (morph === 'live') { drawAxes(f.axes, g, true); return; }
    if (!morph || Mo.reduced()) { drawAxes(f.axes, g); return; }
    var old = f.axes, next = S('svg', { class: 'pmu-axes', 'aria-hidden': 'true' });
    drawAxes(next, g);
    f.box.insertBefore(next, old.nextSibling);
    f.axes = next;
    Mo.anim(next, [{ opacity: 0 }, { opacity: 1 }], 220, 150, 'cubic-bezier(.22,.8,.28,1)', 'backwards');
    var a = Mo.anim(old, [{ opacity: 1 }, { opacity: 0 }], 140, 0, Mo.EASE.inq, 'forwards');
    if (a) a.onfinish = function () { old.remove(); }; else old.remove();
  }
  /* one light re-scans the new line left to right after a range morph (WOW-SPEC 3.4, 420 ms, no re-draw) */
  function rescan(c) {
    var f = c.f;
    if (!f || Mo.reduced() || !PMU.film || !PMU.film.comet) return;
    PMU.film.comet(f.rv, f.rvin, { dur: 420, delay: 0, easing: 'cubic-bezier(.33,1,.68,1)', noFront: true });
  }
  /* sample a series of bucket values (with gaps) at N x positions between x0 and x1 */
  function sampleRuns(xs, vals, N, x0, x1) {
    var out = new Array(N), runs = charts.runs(vals);
    var fns = runs.map(function (run) {
      return { a: xs[run[0]], b: xs[run[run.length - 1]], f: charts.monotone(run.map(function (i) { return xs[i]; }), run.map(function (i) { return vals[i]; })) };
    });
    for (var s = 0; s < N; s++) {
      var x = x0 + (x1 - x0) * (N > 1 ? s / (N - 1) : 0), v = null;
      for (var k = 0; k < fns.length; k++) if (x >= fns[k].a - 0.5 && x <= fns[k].b + 0.5) { v = fns[k].f(x); break; }
      out[s] = v;
    }
    return out;
  }
  /* path through sampled ys with null gaps (each finite run is its own subpath); band closes against a bottom */
  function gapLine(x0, x1, ys) {
    var n = ys.length, d = '', open = false;
    for (var i = 0; i < n; i++) {
      if (!finite(ys[i])) { open = false; continue; }
      d += (open ? 'L' : 'M') + r1(x0 + (x1 - x0) * (n > 1 ? i / (n - 1) : 0)) + ',' + r1(ys[i]);
      open = true;
    }
    return d;
  }
  function gapBand(x0, x1, top, bot) {
    var n = top.length, d = '', i = 0;
    var X = function (k) { return r1(x0 + (x1 - x0) * (n > 1 ? k / (n - 1) : 0)); };
    while (i < n) {
      if (!finite(top[i])) { i++; continue; }
      var j = i;
      while (j + 1 < n && finite(top[j + 1])) j++;
      var k;
      d += 'M' + X(i) + ',' + r1(top[i]);
      for (k = i + 1; k <= j; k++) d += 'L' + X(k) + ',' + r1(top[k]);
      for (k = j; k >= i; k--) d += 'L' + X(k) + ',' + r1(bot[k]);
      d += 'Z';
      i = j + 1;
    }
    return d;
  }
  function lastFinite(arr) { for (var i = arr.length - 1; i >= 0; i--) if (finite(arr[i])) return i; return -1; }
  /* resample a sampled row (with null gaps) to n points by position, so a morph can run between ranges whose sample
     counts differ */
  function resample(row, n) {
    var m = row.length, out = new Array(n);
    if (m === n) return row.slice();
    for (var i = 0; i < n; i++) {
      var p = m > 1 ? i * (m - 1) / Math.max(1, n - 1) : 0, a = Math.floor(p), b = Math.min(m - 1, a + 1), k = p - a;
      out[i] = finite(row[a]) && finite(row[b]) ? row[a] + (row[b] - row[a]) * k : finite(row[a]) ? row[a] : finite(row[b]) ? row[b] : null;
    }
    return out;
  }
  /* the estimated-cost overlay (WOW-SPEC 2.4, LOOK-REVIEW-2 item 3): one smooth line through the buckets that hold a
     recorded value (never a dip to $0 across a bucket without one: missing is never zero), a dot on each of them, and a
     hollow dashed marker on a faint baseline for a bucket whose receipts are still pending (spec.cost.pending[i] > 0).
     The dots are HTML (they pop and morph on the compositor); the line is part of the revealed plot. */
  function costPoints(cost, mids, YB) {
    var pts = [];
    (cost || []).forEach(function (v, i) { if (finite(v)) pts.push({ i: i, x: mids[i], y: YB(v) }); });
    return pts;
  }
  function paintCostMarks(c, geo, cost, mids, YB, opts) {
    var P = c.P; if (!P || !P.cost) return;
    opts = opts || {};
    var hl = c.f.hl;
    $$('.pmu-costmark', hl).forEach(function (el) { el.remove(); });
    if (!cost || geo.compact) { P.cost.setAttribute('d', ''); if (P.costBase) P.costBase.setAttribute('d', ''); return; }
    var pts = costPoints(cost, mids, YB);
    P.cost.setAttribute('d', pts.length > 1 ? charts.monoD(pts.map(function (p) { return [p.x, p.y]; })) : '');
    var pend = (c.spec.cost && c.spec.cost.pending) || [], baseY = geo.pad.t + geo.ph - 3, anyPend = false, html = '';
    pts.forEach(function (p, j) {
      html += charts.dotHtml(p.x, p.y, c._ov.key, { key: 'cost', size: pts.length > 1 ? 'sm' : '', halo: pts.length === 1, attrs: ' data-ci="' + p.i + '" data-cost-dot="1"' });
    });
    cost.forEach(function (v, i) {
      if (finite(v) || !(pend[i] > 0)) return;
      anyPend = true;
      html += charts.dotHtml(mids[i], baseY, c._ov.key, { key: 'cost', size: 'pending', attrs: ' data-ci="' + i + '" data-cost-dot="pending"' });
    });
    if (P.costBase) P.costBase.setAttribute('d', anyPend ? 'M' + r1(geo.pad.l) + ',' + r1(baseY) + 'H' + r1(geo.pad.l + geo.pw) : '');
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var els = Array.prototype.slice.call(tmp.children);
    els.forEach(function (el) { el.classList.add('pmu-costmark'); hl.appendChild(el); });
    c._costEls = els;
    return els;
  }
  /* the cost line sampled at N positions (null outside its first and last recorded bucket), so a range morph can run
     between ranges whose bucket counts differ, like the area */
  function costSamples(cost, mids, YB, N, x0, x1) {
    var pts = costPoints(cost, mids, YB), out = new Array(N).fill(null);
    if (!pts.length) return out;
    var fn = pts.length > 1 ? charts.monotone(pts.map(function (p) { return p.x; }), pts.map(function (p) { return p.y; })) : function () { return pts[0].y; };
    var a = pts[0].x, b = pts[pts.length - 1].x;
    for (var k = 0; k < N; k++) { var x = x0 + (x1 - x0) * (N > 1 ? k / (N - 1) : 0); out[k] = x >= a - 0.5 && x <= b + 0.5 ? fn(x) : null; }
    return out;
  }
  function mix(a, b, k) { return !finite(b) ? null : !finite(a) ? b : a + (b - a) * k; }
  /* where each recorded cost point starts a morph (a Live beat, a range or size change): on the old cost line at the same
     sample position (the area's own morph is by sample, so the two move together), or at its place when the old line had
     no value there. The morphing cost line is drawn through the points mixed from these starts (monoD, the curve it rests
     on) and the dots ride the same mix (charts.ride), so a cost dot is on its line in every frame (item 3; before, a beat
     that added or dropped a recorded bucket rebuilt the dots at their end places while the sampled line was still morphing,
     1-5 px off it, and a dot at a steep end sat past the sampled line's last vertex) */
  function costStarts(pts, geo, from) {
    var N = geo.N, span = geo.x1 - geo.x0;
    return pts.map(function (p) {
      var u = N > 1 && span > 0 ? clamp((p.x - geo.x0) / span * (N - 1), 0, N - 1) : 0;
      var y = from && from.cs ? rowAt(from.cs, 0, N - 1, u) : null;
      if (!finite(y)) return { x: p.x, y: p.y };
      return { x: from.x0 + (from.x1 - from.x0) * (N > 1 ? u / (N - 1) : 0), y: y };
    });
  }
  function costMixD(pts, starts, k) {
    return pts.length > 1 ? charts.monoD(pts.map(function (p, j) { var s0 = starts[j]; return [s0.x + (p.x - s0.x) * k, s0.y + (p.y - s0.y) * k]; })) : '';
  }
  /* the y of a sampled row (N samples from x0 to x1, the polyline the plot draws) at plot x; null in a gap. The crosshair's
     dots glide along it between buckets (charts.hover cfg.yAt) */
  function rowAt(row, x0, x1, x) {
    var n = row ? row.length : 0; if (!n) return null;
    var u = n > 1 && x1 > x0 ? (x - x0) / (x1 - x0) * (n - 1) : 0;
    if (u < -0.01 || u > n - 0.99) return null;
    u = clamp(u, 0, n - 1);
    var i = Math.min(n - 2, Math.floor(u)), f = u - i, a = row[i], b = row[Math.min(n - 1, i + 1)];
    if (n === 1) return finite(a) ? a : null;
    if (finite(a) && finite(b)) return a + (b - a) * f;
    return f < 0.01 && finite(a) ? a : f > 0.99 && finite(b) ? b : null;
  }
  /* y at plot x on a series drawn as monotone runs through (xs[i], ys[i]) (charts.monoD draws the same curve); null in a gap */
  function runsAt(xs, ys) {
    var fns = charts.runs(ys).map(function (run) { return { a: xs[run[0]], b: xs[run[run.length - 1]], f: charts.monotone(run.map(function (i) { return xs[i]; }), run.map(function (i) { return ys[i]; })) }; });
    return function (x) { for (var q = 0; q < fns.length; q++) if (x >= fns[q].a - 0.01 && x <= fns[q].b + 0.01) return fns[q].f(x); return null; };
  }
  /* morphs read as data in every family (WOW-SPEC 5): one continuous ease-out, the same on the JS path tween and on the
     WAAPI marks that ride it */
  var MORPH_EASE = 'cubic-bezier(.33,1,.68,1)';
  /* a live change of an HTML mark layer (end dots, halos): the markup is patched in place and every mark slides from where
     it was. slideJobs patches and returns the marks' offsets; rideOrSlide hangs them on the path's own tween (charts.ride:
     the same frame and the same k as the line they mark, item 3), or, with no path tween, slides them by translate on the
     morph's ease; both return the number of marks that move */
  function slideJobs(layer, html) {
    var olds = $$(':scope > *', layer).map(function (el) { return [parseFloat(el.style.left), parseFloat(el.style.top)]; }), jobs = [];
    charts.patchHtml(layer, html);
    $$(':scope > *', layer).forEach(function (el, i) {
      var o = olds[i]; if (!o) return;
      var dx = o[0] - parseFloat(el.style.left), dy = o[1] - parseFloat(el.style.top);
      if (finite(dx) && finite(dy) && (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3)) jobs.push({ el: el, dx: dx, dy: dy });
    });
    return jobs;
  }
  function rideOrSlide(tw, jobs, dur, delay) {
    jobs = (jobs || []).filter(function (j) { return finite(j.dx) && finite(j.dy) && (Math.abs(j.dx) > 0.3 || Math.abs(j.dy) > 0.3); });
    if (!jobs.length) return 0;
    var n = charts.ride(tw, jobs); if (n) return n;
    jobs.forEach(function (j) { if (Mo.anim(j.el, [{ translate: r1(j.dx) + 'px ' + r1(j.dy) + 'px' }, { translate: '0px 0px' }], dur || 420, delay || 0, MORPH_EASE, 'backwards')) n++; });
    return n;
  }
  function slideMarks(layer, html, lo, tw) { return rideOrSlide(tw, slideJobs(layer, html), 420, (lo && lo.delay) || 0); }
  /* marks leaving with a morph, with the line they sit on (ghost, may be null): they shrink and fade over the first `frac`
     of the tween's own time (the same frames as the path; quickest at the start, where the path's ease-out moves it most),
     the ghost line fades with them while the new line (incoming) fades in, and the leaving parts are removed when gone,
     when the tween lands or when it is cancelled. Until the tween's first frame only the old line and its dots show. */
  function leaveOnTween(tw, els, ghost, frac, incoming) {
    if (!els.length || !tw || tw.cancelled || typeof tw.step !== 'function') return false;
    var step = tw.step, done = tw.done, cancel = tw.cancel, gone = false;
    var xf = function (el, v) { if (v == null) { el.removeAttribute('data-xf'); el.style.removeProperty('--xf'); } else { el.setAttribute('data-xf', ''); el.style.setProperty('--xf', v.toFixed(3)); } };
    /* the new line lands at full strength at once; the attribute goes a frame later, once that strength is the computed
       style, so the marks' transition does not fade it in again */
    var drop = function () {
      if (gone) return; gone = true;
      els.forEach(function (el) { el.remove(); }); if (ghost) ghost.remove();
      if (incoming && incoming.hasAttribute('data-xf')) {
        var tok = {}; incoming._xf = tok; xf(incoming, 1);
        requestAnimationFrame(function () { requestAnimationFrame(function () { if (incoming._xf === tok) { incoming._xf = null; xf(incoming, null); } }); });
      }
    };
    /* the line's cross-fade rides --xf (30-charts.css: no transition there, which would lag the tween by its duration) */
    if (ghost) { xf(ghost, 1); if (incoming) { incoming._xf = null; xf(incoming, 0); } }
    tw.step = function (v, t) {
      step(v, t);
      if (gone) return;
      var x = t == null ? v : t, p = Math.max(0, 1 - x / frac), s = p * p;
      if (p <= 0) { drop(); return; }
      els.forEach(function (el) { el.style.transform = 'scale(' + s.toFixed(3) + ')'; el.style.opacity = s.toFixed(3); });
      if (ghost) { xf(ghost, s); if (incoming) xf(incoming, 1 - s); }
    };
    tw.done = function () { if (done) done(); drop(); };
    tw.cancel = function () { cancel(); drop(); };
    return true;
  }
  /* fn once, when the tween lands or is cancelled (a cancel is followed by the next render, which places things itself) */
  function onLand(tw, fn) {
    var done = tw.done, cancel = tw.cancel, ran = false;
    tw.done = function () { if (done) done(); if (!ran) { ran = true; fn(true); } };
    tw.cancel = function () { cancel(); if (!ran) { ran = true; fn(false); } };
  }
  /* a range morph's end marks (Jared 2026-10-09, item 3). They used to be placed at their end places at once and their layer
     faded 0, 0 at 70 %, 1 over 640; the fade's ease-out is the effect's curve, so it showed from about 20 % of the time,
     and a busy main thread (a whole room re-rendering) starts the JS path tween a frame or more late: on the GPU probe the
     token trend's NOW dot showed up to 15 px off its still-morphing line (opacity .15 to .6). Now the marks ride the
     morphing path (charts.ride: the same tween, the same k), so the NOW dot travels with the line's end and is on it in
     every frame, the way cost marks interpolate with the area (WOW-SPEC 3.4). A mark with no old place to ride from (a
     new series, a callout placed by right:) and the extra layers (the peak label) appear only when the tween lands. */
  function morphMarks(tw, layer, html, extra) {
    var before = layer.children.length, jobs = slideJobs(layer, html), moved = new Set(jobs.map(function (j) { return j.el; })), wait = [];
    charts.ride(tw, jobs);
    $$(':scope > *', layer).forEach(function (el, i) {
      if (moved.has(el)) return;
      var fresh = i >= before, placed = finite(parseFloat(el.style.left)) && finite(parseFloat(el.style.top));
      if (fresh || !placed) wait.push(el);
    });
    (extra || []).forEach(function (el) { if (el) wait.push(el); });
    if (!wait.length) return;
    wait.forEach(function (el) { el.style.opacity = '0'; });
    onLand(tw, function (landed) {
      wait.forEach(function (el) { el.style.opacity = ''; if (landed) Mo.anim(el, [{ opacity: 0 }, { opacity: 1 }], 200, 0, Mo.EASE.out, 'backwards'); });
    });
  }
  function morphTween(dur, step, done) {
    return PMU.motion.tween({ from: 0, to: 1, dur: dur, ease: 'linear', step: function (v, t) { var x = t == null ? v : t; step(1 - Math.pow(1 - x, 3)); }, done: done });
  }

  /* token-type helpers */
  var TK_ORDER = ['in', 'out', 'rsn', 'cw', 'cr'];
  var TK_NAMES = { in: 'Input', out: 'Output', rsn: 'Reasoning', cw: 'Cache write', cr: 'Cache read', all: 'All tokens' };
  var TK_MAP = { input: 'in', in: 'in', output: 'out', out: 'out', reasoning: 'rsn', rsn: 'rsn', cachewrite: 'cw', cw: 'cw', cacheread: 'cr', cr: 'cr' };
  function tkOf(s) {
    if (s.tk) return s.tk;
    var k = String(s.key || s.id || s.name || '').toLowerCase().replace(/[^a-z]/g, '');
    return TK_MAP[k] || null;
  }
  charts.TK_NAMES = TK_NAMES;

  /* ================= area: token trend with the dual-axis cost line (A1 7.2), or generic areas ================= */
  charts.area = function (host, spec, opts) {
    return charts.make('area', host, spec, opts, {
      draw: function (c, first, resized) { drawArea(c, first ? 'first' : resized ? 'resize' : 'redraw'); },
      update: function (c, prev) { drawArea(c, 'morph', prev); },
      live: function (c, prev, lo) { return liveArea(c, prev, lo); },
      carry: function (c, from) { drawArea(c, 'morph', from.spec); },
      enter: function (c, delay) { enterPlot(c, delay); },
      beat: function (c, delay) { return areaBeat(c, delay); }
    });
  };
  function areaModel(spec) {
    var series = (spec.series || []).map(function (s, i) { return Object.assign({ _i: i, _tk: tkOf(s) }, s); });
    var token = series.length > 0 && series.every(function (s) { return s._tk; });
    var n = 0; series.forEach(function (s) { n = Math.max(n, (s.values || []).length); });
    var byTk = {}; series.forEach(function (s) { if (s._tk) byTk[s._tk] = s; });
    return { series: series, token: token, n: n, byTk: byTk };
  }
  /* a live change of the token trend (WOW-SPEC-3 8.4, C3-4): the paths morph (one tween, 420), the end dots slide to the
     new NOW point and the NOW halo swells once (the lead), cost dots slide; axes and the peak label are patched in place */
  function liveArea(c, prev, lo) {
    c._live = lo;
    try { drawArea(c, lo.still ? 'redraw' : 'live', prev); } finally { c._live = null; }
    return { anims: lo.still ? 0 : (c._liveAnims || 0) };
  }
  function drawArea(c, mode, prevSpec) {
    var spec = c.spec, m = areaModel(spec), f = frame(c), tw = tierW(c);
    var live = mode === 'live';
    c._liveAnims = 0;
    var compact = !!COMPACT[tw] || c.opts.compact;
    c.el.setAttribute('data-compact', compact ? '1' : '0');
    /* token series stack by type when split is on, or when a widget asks for stacked bands without the split switch
       (reasoning mix: visible output and reasoning) */
    var split = (spec.split != null ? !!spec.split : !!spec.stacked) && m.token, cacheReads = spec.cacheReads != null ? !!spec.cacheReads : !m.byTk.in;
    var include = function (tk) { return tk !== 'cr' || cacheReads; };
    /* the right-axis overlay: estimated cost in USD by default; spec.cost {unit, name, tk|idx} puts any second measure on
       its own small axis (the savings trend's cache writes, LOOK-REVIEW-2 item 3) */
    var ov = c._ov = spec.cost ? { unit: spec.cost.unit || 'usd', name: spec.cost.name || t('charts.est_cost'),
      key: spec.cost.tk ? { tk: spec.cost.tk } : spec.cost.idx != null ? { idx: spec.cost.idx } : { idx: 'ink' } } : null;
    var ovQual = ov ? (ov.unit === 'usd' ? t('charts.right_axis_usd') : t('charts.right_axis')) : '';
    /* legend */
    var items = [];
    if (!compact) {
      if (m.token) {
        if (split) TK_ORDER.forEach(function (tk) { if (m.byTk[tk] && include(tk)) items.push({ key: tk, name: TK_NAMES[tk], tk: tk }); });
        /* one token series (the savings trend's cache reads) keeps its own name and colour */
        else if (m.series.length === 1) items.push({ key: 'all', name: m.series[0].name, qual: spec.cost ? t('charts.left_axis') : '', tk: m.series[0]._tk });
        else items.push({ key: 'all', name: cacheReads ? t('charts.all_tokens') : t('charts.tokens_wo_cache'), qual: spec.cost ? t('charts.left_axis') : '', tk: 'all' });
        if (ov) items.push(Object.assign({ key: 'cost', name: ov.name, qual: ovQual, swatch: 'line' }, ov.key));
      } else {
        m.series.forEach(function (s) { items.push({ key: 'S' + s._i, name: s.name, idx: s.idx != null ? s.idx : s._i, vendor: s.vendor, tk: s.tk, swatch: s.role === 'forecast' ? 'dash' : 'box' }); });
        if (ov) items.push(Object.assign({ key: 'cost', name: ov.name, qual: ovQual, swatch: 'line' }, ov.key));
      }
    }
    var legendH = setLegend(c, items, function (k) { c._iso = k; paintIso(c); });
    var d = dims(c, compact ? 64 : 200);
    var W = d.W, Hh = d.H - legendH;
    f.box.style.height = Hh + 'px';
    var n = m.n;
    if (!n) { showEmpty(c, spec.emptyText); return; }
    hideEmpty(c);
    var dom = charts.xDomain(spec, n);
    var t1 = spec.now && spec.now > dom.x[n - 1] && spec.now < dom.t1 ? spec.now : dom.t1;
    /* bucket totals */
    var incSeries = m.token ? TK_ORDER.filter(function (tk) { return m.byTk[tk] && include(tk); }).map(function (tk) { return m.byTk[tk]; }) : m.series;
    var stacked = m.token ? true : !!spec.stacked;
    var tops = []; /* per layer, per bucket cumulative top */
    var acc = new Array(n).fill(0), miss = new Array(n).fill(false);
    incSeries.forEach(function (s) {
      var row = [];
      for (var i = 0; i < n; i++) {
        var v = (s.values || [])[i];
        if (!finite(v)) { miss[i] = true; row.push(null); continue; }
        acc[i] += v; row.push(stacked ? acc[i] : v);
      }
      tops.push(row);
    });
    var totals = acc.map(function (v, i) { return miss[i] ? null : v; });
    var maxA = 0;
    if (stacked) totals.forEach(function (v) { if (finite(v)) maxA = Math.max(maxA, v); });
    else tops.forEach(function (row) { row.forEach(function (v) { if (finite(v)) maxA = Math.max(maxA, v); }); });
    if (finite(spec.yMax)) maxA = Math.max(maxA, spec.yMax * 0.96);
    var cost = spec.cost && !compact ? spec.cost.values || [] : null;
    var maxB = null;
    if (cost) { maxB = 0; cost.forEach(function (v) { if (finite(v)) maxB = Math.max(maxB, v); }); }
    var unit = spec.unit || 'tokens';
    /* geometry */
    var pad, ph, pw, sc;
    if (compact) {
      pad = { l: 2, r: 6, t: 6, b: 3 };
      ph = Math.max(16, Hh - pad.t - pad.b); pw = Math.max(20, W - 4);
      sc = { a: charts.nice(maxA * 1.04, 2), b: null };
    } else {
      pad = { l: 44, r: 14, t: 28, b: 30 };
      ph = Math.max(30, Hh - pad.t - pad.b);
      sc = charts.scales(maxA, maxB, ph);
      /* a live change keeps the scale while the data still fits under it (the axes never churn on a beat) */
      if (live && c._geo && c._geo.sc && c._geo.ph === ph && !!c._geo.sc.b === !!sc.b) {
        var osc = c._geo.sc;
        if (osc.a.top >= maxA && (!sc.b || osc.b.top >= maxB)) sc = osc;
        /* it has to grow: the same number of divisions, so the ticks patch their words in place */
        else sc = { a: osc.a.top >= maxA ? osc.a : charts.nice(maxA * 1.04, osc.a.k), b: !sc.b ? null : osc.b.top >= maxB ? osc.b : charts.nice(maxB * 1.04, osc.b.k) };
      }
      var labsA = [], labsB = [];
      for (var k = 0; k <= sc.a.k; k++) { labsA.push(charts.fmtAxis(sc.a.step * k, unit, sc.a.step)); if (sc.b) labsB.push(charts.fmtAxis(sc.b.step * k, ov.unit, sc.b.step)); }
      pad.l = Math.max(44, Math.ceil(axisW(labsA.concat([spec.unitTitle || charts.unitTitle(unit)]))) + 14);
      if (sc.b) pad.r = Math.max(40, Math.ceil(axisW(labsB.concat([charts.unitTitle(ov.unit)]))) + 14);
      pw = Math.max(40, W - pad.l - pad.r);
    }
    var X = function (tt) { return pad.l + (tt - dom.t0) / Math.max(1, t1 - dom.t0) * pw; };
    var mids = dom.x.map(function (x0, i) { var hi = Math.min(x0 + dom.bucket, t1); return X((x0 + hi) / 2); });
    var Y = function (v) { return pad.t + ph - v / sc.a.top * ph; };
    var YB = function (v) { return sc.b ? pad.t + ph - v / sc.b.top * ph : 0; };
    var N = clamp(Math.round((mids[n - 1] - mids[0]) / 2), 2, 360);
    if (n === 1) N = 2;
    var x0 = n === 1 ? pad.l : mids[0], x1 = n === 1 ? pad.l + pw : mids[n - 1];
    var mxs = n === 1 ? [x0, x1] : mids;
    var dup = function (row) { return n === 1 ? [row[0], row[0]] : row; };
    var lv = tops.map(function (row) { return sampleRuns(mxs, dup(row), N, x0, x1).map(function (v) { return finite(v) ? Y(v) : null; }); });
    var tot = sampleRuns(mxs, dup(totals), N, x0, x1).map(function (v) { return finite(v) ? Y(v) : null; });
    var base = new Array(N).fill(Y(0));
    var cs = cost ? costSamples(cost, mids, YB, N, x0, x1) : null;
    var geo = { W: W, H: Hh, pad: pad, pw: pw, ph: ph, x0: x0, x1: x1, lv: lv, tot: tot, base: base, cs: cs, N: N, sc: sc, compact: compact, split: split,
      stacked: stacked, token: m.token, keys: incSeries.map(function (s) { return s._tk || ('S' + s._i); }),
      /* the token total line's own colour: one token series (the savings trend's cache reads) keeps its type's colour, so its
         end dot, NOW halo and crosshair dot wear the colour of the line they sit on, never the all-tokens blue */
      totTk: m.token && m.series.length === 1 ? m.series[0]._tk : 'all' };
    /* axes */
    if (!compact) {
      var xt = charts.xTicks(dom.t0, t1, dom.bucket, pw).map(function (tk) { return { x: X(tk.t), label: tk.label, major: tk.major }; });
      var extra = '';
      geo.nowX = null;
      if (spec.now && spec.now <= dom.t1 + 1 && spec.now >= dom.t0) {
        var xn = r1(X(Math.min(spec.now, t1)));
        var nowText = t('charts.now_label', { time: charts.time.clock(spec.now) });
        geo.nowX = xn; geo.nowW = charts.textW(nowText, 11, true) + 6;
        extra += '<path class="pmu-now" d="M' + xn + ' ' + (pad.t - 4) + 'V' + (pad.t + ph) + '"/>' +
          '<text class="pmu-tick is-note pmu-nowlab" x="' + (xn - 6) + '" y="' + (pad.t - 8) + '" text-anchor="end">' + esc(nowText) + '</text>';
      }
      swapAxes(f, { W: W, H: Hh, pad: pad, pw: pw, ph: ph, ya: sc.a, yb: sc.b, yMin0: true, unitA: spec.unitTitle || charts.unitTitle(unit), unitB: sc.b ? charts.unitTitle(ov.unit) : '',
        ylab: function (i) { return charts.fmtAxis(sc.a.step * i, unit, sc.a.step); }, ylab2: function (i) { return charts.fmtAxis(sc.b.step * i, ov.unit, sc.b.step); },
        xt: xt, extra: extra }, live ? 'live' : mode === 'morph');
    } else { f.axes.innerHTML = ''; }
    /* plot layer */
    var P = c.P;
    var sig = (m.token ? 'tk' : 'g') + '|' + geo.keys.join(',') + '|' + (cost ? 1 : 0) + '|' + stacked + '|' + compact;
    if (!P || c._psig !== sig) {
      c._psig = sig;
      f.plot.innerHTML = '';
      f.hl.innerHTML = '';
      P = c.P = { bands: [], edges: [] };
      P.endL = H('div', 'pmu-hend', f.hl);
      var gTot = P.gTot = S('g', { class: 'pmu-g-total' }, f.plot);
      var gBands = P.gBands = S('g', { class: 'pmu-g-bands' }, f.plot);
      if (m.token) {
        var totTk = m.series.length === 1 ? m.series[0]._tk : 'all';
        P.total = S('path', { class: 'pmu-mark', 'data-mark': 'area', 'data-tk': totTk, 'data-key': 'all' }, gTot);
        /* the hero line is a line (the comet rides the primary line, WOW-SPEC 3.3) */
        P.totalLine = S('path', { class: 'pmu-mark', 'data-mark': 'line', 'data-tk': totTk, 'data-key': 'all', 'data-primary': '1' }, gTot);
        P.glow = S('path', { class: 'pmu-mark', 'data-mark': 'glow', 'data-tk': totTk, 'data-key': 'all' }, gTot);
        gTot.insertBefore(P.glow, P.totalLine);
        /* a bright hairline core on the hero line: it reads as light, not ink (dark themes) */
        P.core = S('path', { class: 'pmu-mark', 'data-mark': 'core', 'data-tk': totTk, 'data-key': 'all' }, gTot);
      }
      incSeries.forEach(function (s, i) {
        var k = s._tk ? { tk: s._tk } : { idx: s.idx != null ? s.idx : s._i, vendor: s.vendor };
        var a = charts.key(S('path', { class: 'pmu-mark', 'data-mark': m.token || stacked ? 'band' : 'area', 'data-key': geo.keys[i] }, m.token ? gBands : gTot), k);
        var e = charts.key(S('path', { class: 'pmu-mark', 'data-mark': m.token || stacked ? 'edge' : 'line', 'data-key': geo.keys[i] }, m.token ? gBands : gTot), k);
        if (!m.token && !stacked && i === 0) e.setAttribute('data-primary', '1');
        if (s.role) { a.setAttribute('data-series-role', s.role); e.setAttribute('data-series-role', s.role); }
        P.bands.push(a); P.edges.push(e);
      });
      if (cost) {
        P.costBase = S('path', { class: 'pmu-costbase', 'data-key': 'cost' }, f.plot);
        P.cost = charts.key(S('path', { class: 'pmu-mark', 'data-mark': 'line', 'data-key': 'cost', 'data-role': 'cost' }, f.plot), ov.key);
      }
    }
    f.plot.setAttribute('width', W); f.plot.setAttribute('height', Hh);
    f.over.setAttribute('width', W); f.over.setAttribute('height', Hh);
    f.plot.classList.toggle('is-split', split);
    /* split token bands hide the total line: the comet then rides the top band's edge (the stack's top is the last series) */
    P.edges.forEach(function (e, i) { if (split && m.token && i === P.edges.length - 1) e.setAttribute('data-comet', '1'); else e.removeAttribute('data-comet'); });
    var prev = c._geo;
    /* a re-render at another size (a resize release re-renders the body; charts.make carries the old chart over) morphs
       from the old shape scaled into the new plot, never from a blank (WOW-SPEC 3.12) */
    if (mode === 'morph' && prev && (prev.W !== W || prev.H !== Hh) && prev.pad && prev.ph > 0 && prev.lv.length === lv.length) {
      var ky = ph / prev.ph, sy = function (v) { return finite(v) ? pad.t + (v - prev.pad.t) * ky : v; };
      prev = { W: W, H: Hh, x0: x0, x1: x1, N: prev.N, pad: pad, ph: ph, lv: prev.lv.map(function (row) { return row.map(sy); }), tot: prev.tot.map(sy), base: prev.base.map(sy),
        cs: prev.cs ? prev.cs.map(function (v) { return finite(v) && sc.b && prev.sc && prev.sc.b ? sy(v) : null; }) : null };
    }
    var morph = (mode === 'morph' || live) && prev && prev.W === W && prev.H === Hh && prev.lv.length === lv.length && !Mo.reduced();
    if (c._tw) { c._tw.cancel(); c._tw = null; }
    if (morph) {
      var from = prev.N === N ? prev : { x0: prev.x0, x1: prev.x1, lv: prev.lv.map(function (row) { return resample(row, N); }), tot: resample(prev.tot, N), base: resample(prev.base, N),
        cs: prev.cs ? resample(prev.cs, N) : null };
      if (live) c._liveAnims++;
      var cpts = cost && !geo.compact ? costPoints(cost, mids, YB) : null, cst = cpts ? costStarts(cpts, geo, from) : null;
      c._tw = morphTween(live ? 420 : 520, function (k) {
        paintArea(c, {
          x0: from.x0 + (geo.x0 - from.x0) * k, x1: from.x1 + (geo.x1 - from.x1) * k,
          lv: geo.lv.map(function (row, j) { return row.map(function (v, i) { return mix(from.lv[j][i], v, k); }); }),
          tot: geo.tot.map(function (v, i) { return mix(from.tot[i], v, k); }),
          base: geo.base.map(function (v, i) { return mix(from.base[i], v, k); }),
          cs: geo.cs ? geo.cs.map(function (v, i) { return mix(from.cs ? from.cs[i] : v, v, k); }) : null,
          cd: cpts ? costMixD(cpts, cst, k) : null
        }, geo);
      }, function () { c._tw = null; paintArea(c, geo, geo); if (P.cost && cost) { var cp = costPoints(cost, mids, YB); P.cost.setAttribute('d', cp.length > 1 ? charts.monoD(cp.map(function (q) { return [q.x, q.y]; })) : ''); } if (!live) rescan(c); });
      if (live) liveCostMarks(c, geo, cost, mids, YB, false, cst);
      else morphCostMarks(c, geo, from, cost, mids, YB, cst);
      /* until the tween's first frame the cost line stays where its dots start (a rebuild just wrote its end shape) */
      if (cpts && P.cost) P.cost.setAttribute('d', costMixD(cpts, cst, 0));
    } else { paintArea(c, geo, geo); if (!live || !liveCostMarks(c, geo, cost, mids, YB, true)) paintCostMarks(c, geo, cost, mids, YB); }
    c._geo = geo;
    /* the flyer map (C3-5): the token trend repeats on Overview and Analytics (chart:tokens). A plot of ONE token type (the
       savings trend's cache reads) is not that chart: it never claims the key, so the all-tokens line never flies into it
       and the token trend's live beats never repaint it */
    if (!compact) {
      var yTop = sc.a.top, tt0 = dom.t0, tt1 = t1;
      charts.setFly(c, f.box, c.opts.share || spec.share || (m.token && m.series.length > 1 ? 'tokens' : null), { shareEl: f.rv,
        box: { l: pad.l, t: pad.t, w: pw, h: ph }, domain: { x0: tt0, x1: tt1, y0: 0, y1: yTop },
        boxOf: function (d) { var l = X(d.x0), r = X(d.x1); return { l: l, t: Y(d.y1), w: r - l, h: Y(d.y0) - Y(d.y1) }; },
        paths: function () { return P.total ? [P.total, P.glow, P.totalLine] : [P.bands[0], P.edges[0]]; } });
    }
    /* end dots and peak label: a live change and a range morph slide the dots on the line's own tween (item 3); after a
       range morph the peak label appears where the morph lands, never over the old shape */
    peakLabel(c, geo, spec, m, totals, Y, mids, dom, tw, live);
    endDots(c, geo, m, totals, cost, Y, YB, mids, live && morph, morph && !live && c._tw ? [f.over] : null);
    /* hover */
    if (!compact) bindAreaHover(c, geo, m, dom, mids, totals, cost, Y, YB, incSeries, include, t1);
    else if (c._hover) { c._hover.destroy(); c._hover = null; }
    paintIso(c);
  }
  function paintArea(c, cur, geo) {
    var P = c.P;
    if (geo.token) {
      P.total.setAttribute('d', gapBand(cur.x0, cur.x1, cur.tot, cur.base));
      var tl = gapLine(cur.x0, cur.x1, cur.tot);
      P.totalLine.setAttribute('d', tl); P.glow.setAttribute('d', tl); if (P.core) P.core.setAttribute('d', tl);
    }
    cur.lv.forEach(function (row, j) {
      var bot = geo.stacked ? (j ? cur.lv[j - 1] : cur.base) : cur.base;
      P.bands[j].setAttribute('d', gapBand(cur.x0, cur.x1, row, bot.map(function (v, i) { return finite(v) ? v : cur.base[i]; })));
      P.edges[j].setAttribute('d', gapLine(cur.x0, cur.x1, row));
    });
    if (P.cost && cur.cd != null) P.cost.setAttribute('d', cur.cd);
    else if (P.cost && cur.cs) P.cost.setAttribute('d', gapLine(cur.x0, cur.x1, cur.cs));
  }
  /* the NOW / last point of each line: a 3.5 px dot with a static 10 px halo (WOW-SPEC 2.4), HTML over the plot */
  function endDots(c, geo, m, totals, cost, Y, YB, mids, slide, morphing) {
    var P = c.P, s = '';
    var li = lastFinite(totals);
    if (geo.token && li >= 0) s += charts.dotHtml(mids[li], Y(totals[li]), { tk: geo.totTk }, { key: 'all', halo: true });
    else if (!geo.token) {
      geo.keys.forEach(function (k, j) {
        var row = m.series[j] && m.series[j].values || [];
        var i = lastFinite(row);
        if (i < 0 || (geo.stacked && j !== geo.keys.length - 1)) return;
        var v = geo.stacked ? totals[i] : row[i];
        if (finite(v)) s += charts.dotHtml(mids[i], Y(v), { idx: m.series[j].idx != null ? m.series[j].idx : j, vendor: m.series[j].vendor }, { key: k, halo: true });
      });
    }
    var html = geo.compact && !c.opts.endDot ? '' : s;
    if (slide) {
      /* live: the dots keep their elements and slide from where they were (translate, the morph's ease); the lead's NOW
         halo swells once */
      var lo = c._live || {};
      /* they ride the area's own morph tween (charts.ride), so the NOW dot is on the line's last point in every frame */
      c._liveAnims += slideMarks(P.endL, html, lo, c._tw);
      var halo = P.endL.querySelector('.pmu-hhalo');
      if (halo && lo.lead && charts.swellHalo(halo, (lo.delay || 0) + 120)) c._liveAnims++;
      return;
    }
    if (morphing) { morphMarks(c._tw, P.endL, html, morphing); return; }
    P.endL.innerHTML = html;
  }
  /* live cost dots: same count -> they slide to their new place in place; otherwise false (the caller rebuilds) */
  function liveCostMarks(c, geo, cost, mids, YB, still, starts) {
    var els = (c._costEls || []).filter(function (el) { return el.isConnected; });
    if (!cost || geo.compact) return false;
    var pts = costPoints(cost, mids, YB), real = els.filter(function (el) { return el.getAttribute('data-cost-dot') === '1'; });
    /* pending markers stay where they are (a bucket's receipts still pending keeps its place); a changed set of recorded
       buckets or pending markers rebuilds */
    var pend = (c.spec.cost && c.spec.cost.pending) || [], nPend = 0;
    cost.forEach(function (v, i) { if (!finite(v) && pend[i] > 0) nPend++; });
    var lo = c._live || {}, jobs = [];
    /* a changed set rebuilds the dots at their end places; mid-morph they still start on the old line (starts) */
    if (real.length !== pts.length || els.length - real.length !== nPend) {
      real = (paintCostMarks(c, geo, cost, mids, YB) || []).filter(function (el) { return el.getAttribute('data-cost-dot') === '1'; });
      if (still || !starts) return true;
    }
    real.forEach(function (el, j) {
      var p = pts[j], ox = parseFloat(el.style.left), oy = parseFloat(el.style.top), s0 = starts && starts[j];
      el.style.left = r1(p.x) + 'px'; el.style.top = r1(p.y) + 'px'; el.setAttribute('data-ci', String(p.i));
      if (!still) jobs.push(s0 ? { el: el, dx: s0.x - r1(p.x), dy: s0.y - r1(p.y) } : { el: el, dx: ox - p.x, dy: oy - p.y });
    });
    /* the cost dots ride the cost line's morph (the area's tween, charts.ride), from the same starts as the line */
    if (jobs.length) c._liveAnims += rideOrSlide(c._tw, jobs, 420, lo.delay || 0);
    if (still && c.P && c.P.cost) c.P.cost.setAttribute('d', pts.length > 1 ? charts.monoD(pts.map(function (q) { return [q.x, q.y]; })) : '');
    return true;
  }
  /* a range change (WOW-SPEC 3.4, MOTION-REVIEW-2 item 4): the old cost dots shrink away (160 ms), the new ones ride the
     morphing line from where the old line was at their sample (translate on the compositor, the same ease as the path)
     and grow in from 320 ms; nothing is drawn across a bucket without a recorded value */
  function morphCostMarks(c, geo, from, cost, mids, YB, starts) {
    var old = (c._costEls || []).filter(function (el) { return el.isConnected; });
    old.forEach(function (el) { el.classList.remove('pmu-costmark'); });
    /* the leaving dots keep the line they sit on (item 3). The morphing cost line starts through the new points' starts,
       a coarser curve than the old one (7 starts across a 30-point line), and a WAAPI shrink stayed pending (no start
       time) while the room re-rendered, so on the GPU probe the old dots sat whole for 130 ms or more, up to 22 px off
       the line. Now a ghost of the old line (through the old dots' own places) stays under them and fades as they shrink,
       on the morph's own tween, from the frame the new line starts to move, while the new line fades in: every dot is on
       its line in every frame, and the old line cross-fades into the new one */
    var oldPts = old.filter(function (el) { return el.getAttribute('data-cost-dot') === '1'; })
      .map(function (el) { return [parseFloat(el.style.left), parseFloat(el.style.top)]; }).filter(function (q) { return finite(q[0]) && finite(q[1]); })
      .sort(function (a, b) { return a[0] - b[0]; });
    var ghost = null;
    if (old.length && c.P && c.P.cost && oldPts.length > 1 && c._tw) {
      ghost = c.P.cost.cloneNode(false);
      ghost.setAttribute('d', charts.monoD(oldPts));
      ghost.setAttribute('data-ghost', '1');
      c.P.cost.parentNode.insertBefore(ghost, c.P.cost);
    }
    if (!leaveOnTween(c._tw, old, ghost, 160 / 520, c.P && c.P.cost)) { if (ghost) ghost.remove(); old.forEach(function (el) {
      var a = Mo.anim(el, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }], 160, 0, Mo.EASE.inq, 'forwards');
      if (a) a.onfinish = function () { el.remove(); }; else el.remove();
    }); }
    var els = paintCostMarks(c, geo, cost, mids, YB) || [];
    var N = geo.N, span = Math.max(1, geo.x1 - geo.x0), jobs = [], ri = 0;
    els.forEach(function (el) {
      var x = parseFloat(el.style.left), y = parseFloat(el.style.top);
      if (starts && el.getAttribute('data-cost-dot') === '1') {
        var s0 = starts[ri++];
        if (s0) { jobs.push({ el: el, dx: s0.x - x, dy: s0.y - y }); Mo.anim(el, [{ scale: '0' }, { scale: '1' }], 200, 320, Mo.EASE.out, 'backwards'); return; }
      }
      var sIdx = clamp(Math.round((x - geo.x0) / span * (N - 1)), 0, N - 1);
      var ox = from.x0 + (from.x1 - from.x0) * (N > 1 ? sIdx / (N - 1) : 0), oy = from.cs && finite(from.cs[sIdx]) && el.getAttribute('data-cost-dot') === '1' ? from.cs[sIdx] : y;
      jobs.push({ el: el, dx: ox - x, dy: oy - y });
      Mo.anim(el, [{ scale: '0' }, { scale: '1' }], 200, 320, Mo.EASE.out, 'backwards');
    });
    /* they ride the morphing cost line (the area's tween, charts.ride), never a slide on its own clock */
    rideOrSlide(c._tw, jobs, 520, 0);
  }
  function peakLabel(c, geo, spec, m, totals, Y, mids, dom, tw, live) {
    var f = c.f;
    var put = function (html) { if (live) charts.patchSvg(f.over, html); else f.over.innerHTML = html; };
    if (geo.compact || spec.peak === false || (tw !== 'm' && tw !== 'l' && tw !== 'xl') || !m.token || geo.ph < 56) { put(''); return; }
    var best = -1;
    totals.forEach(function (v, i) { if (finite(v) && (best < 0 || v > totals[best])) best = i; });
    if (best < 0 || !(totals[best] > 0)) { put(''); return; }
    /* a sub-day bucket in a multi-day range names its day too ("Tue 06:00"), the way the card's own Peak fact does */
    var multiDay = dom.x.length > 1 && dom.x[dom.x.length - 1] - dom.x[0] >= 86400000;
    var when = dom.bucket >= 86400000 ? charts.time.md(dom.x[best]) : (multiDay ? charts.time.day(dom.x[best]) + ' ' : '') + charts.time.clock(dom.x[best]);
    var label = t('charts.peak_label', { time: when, value: charts.fmtValue(totals[best], 'tokens') });
    var w = charts.textW(label, 11, true);
    /* the label keeps 6 px off the stroke (LOOK-REVIEW-2 item 3) and off the NOW words: above the line over its whole
       span when there is room, else beside the apex on the side where the line falls away, else under the NOW words */
    var px = mids[best], py = Y(totals[best]);
    /* the highest stroke (token line or cost line) under a span; a cost line far below the label does not count */
    var lineTop = function (a, b, below) { var m = Infinity; for (var k = 0; k < geo.N; k++) { var xx = geo.x0 + (geo.x1 - geo.x0) * (geo.N > 1 ? k / (geo.N - 1) : 0); if (xx < a || xx > b) continue;
      if (finite(geo.tot[k])) m = Math.min(m, geo.tot[k]); if (geo.cs && finite(geo.cs[k])) m = Math.min(m, geo.cs[k] - 3); } return m; };
    var nowBox = geo.nowX != null ? { a: geo.nowX - 6 - geo.nowW, b: geo.nowX + 2, y: geo.pad.t - 8 } : null;
    var hitsNow = function (a, b, yb) { return nowBox && b > nowBox.a - 6 && a < nowBox.b + 6 && Math.abs(yb - nowBox.y) < 15; };
    var cands = [], cx0 = clamp(px - w / 2, geo.pad.l + 2, geo.pad.l + geo.pw - w - 2);
    cands.push({ a: cx0, anchor: 'middle', x: cx0 + w / 2 });
    cands.push({ a: px - 10 - w, anchor: 'end', x: px - 10 });
    cands.push({ a: px + 10, anchor: 'start', x: px + 10 });
    var pick = null;
    for (var q = 0; q < cands.length && !pick; q++) {
      var cd = cands[q], b = cd.a + w;
      if (cd.a < geo.pad.l + 2 || b > geo.pad.l + geo.pw + geo.pad.r - 4) continue;
      var top = lineTop(cd.a - 2, b + 2), yb = Math.min(top, cd.anchor === 'middle' ? py : top) - 6 - 3;
      if (cd.anchor !== 'middle') yb = Math.min(top - 9, py + 4);
      if (yb - 9 < 2 || hitsNow(cd.a, b, yb)) continue;
      pick = { x: cd.x, y: yb, anchor: cd.anchor };
    }
    if (!pick) pick = { x: px - 10, y: Math.max(geo.pad.t + 12, py + 4), anchor: 'end' };
    var x = pick.x, anchor = pick.anchor, y = pick.y;
    put('<text class="pmu-tick is-peak" x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + anchor + '">' + esc(label) + '</text>');
  }
  function bindAreaHover(c, geo, m, dom, mids, totals, cost, Y, YB, incSeries, include, t1) {
    var spec = c.spec, n = mids.length;
    var cfg = {
      n: n, pad: { t: geo.pad.t, h: geo.ph, l: geo.pad.l, r: geo.pad.r },
      xAt: function (i) { return mids[i]; },
      /* the same rows the plot draws, in the order of dots(i) */
      yAt: function (k, x) {
        var rows = geo.token || geo.stacked ? [geo.tot] : geo.lv.slice();
        if (cost) rows.push(geo.cs);
        return rowAt(rows[k], geo.x0, geo.x1, x);
      },
      dots: function (i) {
        var out = [];
        if (geo.token || geo.stacked) { if (finite(totals[i])) out.push({ y: Y(totals[i]), key: geo.token ? { tk: geo.totTk } : { idx: incSeries[incSeries.length - 1].idx }, dk: geo.token ? 'all' : null }); }
        else incSeries.forEach(function (s, j) { var v = (s.values || [])[i]; out.push({ y: finite(v) ? Y(v) : null, key: { idx: s.idx != null ? s.idx : j, vendor: s.vendor }, dk: geo.keys[j] }); });
        if (cost) out.push({ y: finite(cost[i]) ? YB(cost[i]) : null, key: c._ov.key, ink: c._ov.key.idx === 'ink', dk: 'cost' });
        return out;
      },
      html: function (i) {
        var lo = dom.x[i], hi = Math.min(lo + dom.bucket, t1), ro = charts.ro;
        var partial = hi < lo + dom.bucket - 1000;
        var h = ro.title(charts.spanLabel(lo, hi, dom.bucket));
        if (geo.token) {
          var all = 0, anyMiss = false;
          TK_ORDER.forEach(function (tk) {
            var s = m.byTk[tk]; if (!s) return;
            var v = (s.values || [])[i];
            if (finite(v)) all += v; else anyMiss = true;
            h += ro.row({ tk: tk }, TK_NAMES[tk], finite(v) ? charts.fmtValue(v, 'tokens') : PMU.vs.STATES.unknown.word, include(tk) ? '' : 'is-dim');
          });
          /* one token type (the savings trend's cache reads) has no all-tokens total: its row would repeat the value under the
             all-tokens blue, a swatch no line or dot on that plot wears */
          if (geo.totTk === 'all') h += ro.sep() + ro.row({ tk: 'all' }, t('charts.all_tokens'), anyMiss ? '-' : charts.fmtValue(all, 'tokens'), 'is-total');
          if (cost) h += ro.row(c._ov.key, c._ov.name, finite(cost[i]) ? charts.fmtValue(cost[i], c._ov.unit) : t('charts.none_recorded'), 'is-total', 'line');
        } else {
          var sum = 0;
          incSeries.forEach(function (s, j) {
            var v = (s.values || [])[i]; if (finite(v)) sum += v;
            h += ro.row({ idx: s.idx != null ? s.idx : j, vendor: s.vendor, tk: s.tk }, s.name, finite(v) ? charts.fmtValue(v, spec.unit) : PMU.vs.STATES.unknown.word);
          });
          if (geo.stacked && incSeries.length > 1) h += ro.sep() + ro.row({ idx: 'ink' }, t('charts.total'), charts.fmtValue(sum, spec.unit), 'is-total');
          if (cost) h += ro.row(c._ov.key, c._ov.name, finite(cost[i]) ? charts.fmtValue(cost[i], c._ov.unit) : PMU.vs.STATES.unknown.word, '', 'line');
        }
        if (partial) h += ro.foot(t('charts.partial', { from: charts.time.clock(lo), to: charts.time.clock(hi) }));
        var extra = typeof spec.readoutFoot === 'function' ? spec.readoutFoot(i) : null;
        var said = cost && !finite(cost[i]);
        (Array.isArray(extra) ? extra : extra ? [extra] : []).forEach(function (line) { if (!(said && /no attempts recorded/i.test(line))) h += ro.foot(line); });
        if (spec.source) h += ro.foot(spec.source);
        return h;
      }
    };
    if (c._hover) c._hover.set(cfg); else c._hover = charts.hover(c.f.box, cfg);
  }
  /* legend isolation: other marks dim to .2 */
  function paintIso(c) {
    var iso = c._iso;
    $$('.pmu-mark[data-key]', c.el).forEach(function (el) {
      var k = el.getAttribute('data-key');
      el.classList.toggle('is-dim', !!iso && k !== iso && !(iso === 'all' && k === 'all'));
    });
  }
  function showEmpty(c, text) {
    var f = c.f;
    f.axes.innerHTML = ''; f.plot.innerHTML = ''; f.over.innerHTML = ''; if (f.hl) f.hl.innerHTML = ''; c.P = null; c._psig = null; c._costEls = null;
    if (!f.empty) f.empty = charts.empty(f.box, text);
    else f.empty.textContent = text || t('charts.empty');
  }
  function hideEmpty(c) { if (c.f && c.f.empty) { c.f.empty.remove(); c.f.empty = null; } }
  /* the plot entrance (WOW-SPEC 3.3): axes fade (260 ms), the plot reveals left to right (900 ms, NieR 600 in ten steps)
     with the comet on its primary line, each mark on the line lights up when the reveal edge reaches it (end dots pop,
     NOW halos swell .2 -> 1.35 -> 1), then the cost dots pop left to right 40 ms apart and pending markers fade in last.
     Every animated mark is HTML or a whole SVG root, so the moment runs on the compositor (WOW-TASKS C-9). */
  function enterPlot(c, delay, dur) {
    var f = c.f;
    if (!f) return;
    f.rv.style.visibility = '';
    if (c._quiet) return quietPlot(c, delay);
    var fm = Mo.fam(), draw = fm === 'nier' ? 600 : (dur || 900);
    /* the hero's line starts drawing with its number (NOTES3b-engine, Mac film: on DRAW (.65,0,.35,1) the first 200 ms
       revealed about 4 % of the plot, so the line read as starting 230 ms after the number): a hero draws on a softer
       ease-in that still lands like DRAW (.45,.05,.25,1); Glass keeps DEPTH, Retro / NieR their steps */
    var heroEase = charts.isHero(c) && fm !== 'glass' && fm !== 'retro' && fm !== 'nier' ? 'cubic-bezier(.45,.05,.25,1)' : null;
    /* the shared line arrives by flight: no draw under the flyer (see charts.watchFlight) */
    var flown = charts.flightTarget(c);
    if (!flown) {
      Mo.anim(f.axes, [{ opacity: 0 }, { opacity: 1 }], 260, delay, fm === 'nier' || fm === 'retro' ? 'steps(3,jump-start)' : Mo.EASE.out);
      Mo.reveal(f.rv, f.rvin, draw, delay, 'x', fm === 'nier' ? 'steps(10,jump-start)' : fm === 'retro' ? 'steps(10,jump-start)' : heroEase);
      if (c._fly) charts.watchFlight(c, function () { charts.finishReveal(f.rv); });
    }
    var pw = +f.plot.getAttribute('width') || 0, de = fm === 'nier' || fm === 'retro' ? 'linear' : heroEase || Mo.voice('draw');
    var at = function (el, fallback) {
      var x = parseFloat(el.style.left) || 0;
      return PMU.film && PMU.film.edgeAt && pw > 0 && x > 0 ? delay + draw * PMU.film.edgeAt(x / pw, de) - 20 : delay + draw - fallback;
    };
    var endAt = delay + draw - 80, costs = [], pend = [];
    /* the hero's signature beat (WOW-SPEC-3 7, C3-6): the area's NOW halo waits for the cost dots, then swells and the
       peak label drops onto the peak */
    var heroArea = c.name === 'area' && charts.isHero(c) && !c._quiet;
    var nowHalo = heroArea ? f.hl.querySelector('.pmu-hhalo[data-key="all"], .pmu-hhalo') : null;
    $$('.pmu-hdot', f.hl).forEach(function (d) {
      var kind = d.getAttribute('data-cost-dot');
      if (kind === '1') { costs.push(d); return; }
      if (kind === 'pending') { pend.push(d); return; }
      charts.popDot(d, at(d, 80));
    });
    $$('.pmu-hhalo', f.hl).forEach(function (d) { if (d !== nowHalo) charts.swellHalo(d, at(d, 60)); });
    /* the line's annotation (spec.callout): its ring swells when the comet reaches the point, then the label unfolds from
       its leader (scaleX from the point's side); the chart owns the moment, so a re-draw never shows it early */
    var cring = f.hl.querySelector('.pmu-callring'), cnote = f.hl.querySelector('.pmu-callout');
    if (cring) {
      var ct = at(cring, 60), stp = fm === 'nier' || fm === 'retro';
      Mo.anim(cring, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.35)', opacity: 1, offset: 0.55 }, { transform: 'scale(1)', opacity: 1 }], 420, ct, stp ? 'steps(3,jump-start)' : Mo.EASE.out);
      if (cnote) Mo.anim(cnote, [{ transform: 'scaleX(.04)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'scaleX(1)', opacity: 1 }], 320, ct + 160, stp ? 'steps(3,jump-start)' : 'cubic-bezier(.17,.84,.29,.99)');
    }
    costs.sort(function (a, b) { return parseFloat(a.style.left) - parseFloat(b.style.left); })
      .forEach(function (d, i) { charts.popDot(d, endAt + Math.min(600, 40 * i), 300); });
    pend.forEach(function (d, i) { Mo.anim(d, [{ opacity: 0 }, { opacity: 1 }], 260, endAt + Math.min(600, 40 * costs.length) + 120 + 30 * i, Mo.EASE.out); });
    var dotsEnd = endAt + (costs.length ? Math.min(600, 40 * (costs.length - 1)) + 300 : 0);
    if (heroArea) { c.beatEnd = areaBeat(c, dotsEnd, nowHalo) - delay; }
    else if (f.over.firstChild && !c._ownOver) Mo.anim(f.over, [{ opacity: 0 }, { opacity: 1 }], 260, delay + draw - 40, Mo.EASE.out);
    /* Signals (the line hero): the readings that dipped flash once in time order, 40 apart, when the draw has landed */
    if (c.name === 'line' && charts.isHero(c) && !c._quiet) c.beatEnd = lineBeat(c, delay + draw + 60) - delay;
    if (f.legendHost.firstChild) Mo.anim(f.legendHost, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], 420, delay, Mo.EASE.out);
    /* Retro: at draw end the line blooms once, a phosphor afterglow that settles to its static .14 (WOW-SPEC 7) */
    if (fm === 'retro') afterglow(c, delay + draw);
    return delay + draw;
  }
  /* the quiet draw of a supporting plot (WOW-SPEC-3 5 Phase C, C3-3): 600 DRAW without comet or light front; the marks
     over the plot (dots, halos, cost dots, markers, labels) appear together at draw end in one fade; the axes and the
     legend come with the body's own reveal (the engine fades the body). Five animations at most. */
  var QUIET_DRAW = 600;
  function quietPlot(c, delay) {
    var f = c.f, fm = Mo.fam(), stepped = fm === 'nier' || fm === 'retro';
    Mo.reveal(f.rv, f.rvin, QUIET_DRAW, delay, 'x', stepped ? 'steps(8,jump-start)' : null, { quiet: true });
    var endAt = delay + QUIET_DRAW - 60;
    if (f.hl.firstChild) Mo.anim(f.hl, [{ opacity: 0 }, { opacity: 1 }], 200, endAt, stepped ? 'steps(2,jump-start)' : Mo.EASE.out, 'backwards');
    if (f.over.firstChild && !c._ownOver) Mo.anim(f.over, [{ opacity: 0 }, { opacity: 1 }], 200, endAt, stepped ? 'steps(2,jump-start)' : Mo.EASE.out, 'backwards');
    return delay + QUIET_DRAW;
  }
  /* the area's beat part (Analytics; WOW-SPEC-3 7): the NOW halo swells .2 -> 1.35 -> 1 (620) and the peak label drops onto
     the peak 80 later (260 SETTLE). Returns its end time. */
  function areaBeat(c, at, halo) {
    var f = c.f; if (!f || Mo.reduced()) return at;
    halo = halo || f.hl.querySelector('.pmu-hhalo[data-key="all"], .pmu-hhalo');
    if (halo) charts.swellHalo(halo, at);
    var fm = Mo.fam(), stepped = fm === 'nier' || fm === 'retro', end = at + 620;
    if (f.over.firstChild && !c._ownOver) {
      Mo.anim(f.over, [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, offset: 0.4 }, { opacity: 1, transform: 'none' }], 260, at + 80,
        stepped ? 'steps(3,jump-start)' : (PMU.film && PMU.film.E ? PMU.film.E.settle : Mo.EASE.out), 'backwards');
      end = Math.max(end, at + 340);
    }
    return end;
  }
  /* the line hero's beat (Signals; WOW-SPEC-3 7): the readings that dipped (spec.incidents, else the buckets in the lower
     40 % of a fixed axis) light once in time order, 40 apart: a warn-tone halo swells off each point and fades */
  function lineBeat(c, at) {
    var f = c.f, g = c._lgeo, spec = c.spec || {};
    if (!f || !g || Mo.reduced() || !g.pts || !g.pts[0]) return at;
    var row = g.pts[0], vals = (spec.series && spec.series[0] && spec.series[0].values) || [], list = spec.incidents;
    if (!list) {
      if (!finite(spec.yMin) || !finite(spec.yMax) || spec.yMax <= spec.yMin) return at;
      var cut = spec.yMin + 0.6 * (spec.yMax - spec.yMin);
      list = []; vals.forEach(function (v, i) { if (finite(v) && v < cut) list.push(i); });
    }
    var end = at, made = 0;
    list.slice(0, 6).forEach(function (i, k) {
      if (!finite(row[i]) || !g.xs) return;
      var h = H('i', 'pmu-hhalo pmu-hinc', f.hl);
      h.setAttribute('data-tone', 'warn');
      h.style.left = r1(g.xs[i]) + 'px'; h.style.top = r1(row[i]) + 'px';
      var a = Mo.anim(h, [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.5)', opacity: 1, offset: 0.35 }, { transform: 'scale(1.9)', opacity: 0 }], 620, at + 40 * k, Mo.EASE.out, 'both');
      if (a) a.finished.then(function () { h.remove(); }, function () { h.remove(); }); else h.remove();
      end = at + 40 * k + 620; made++;
    });
    return made ? end : at;
  }
  /* the Retro phosphor afterglow: a copy of the primary line in its own SVG root over the plot flares to .6 and settles
     onto the static .14 glow over 700 ms (an SVG root's opacity runs on the compositor), then goes */
  function afterglow(c, at) {
    var f = c.f, line = f.plot.querySelector('[data-mark="line"][data-primary="1"], [data-mark="edge"][data-primary="1"]');
    if (!line || Mo.reduced()) return;
    var svg = S('svg', { class: 'pmu-afterglow', 'aria-hidden': 'true', width: f.plot.getAttribute('width'), height: f.plot.getAttribute('height') }, f.box);
    var p = S('path', { class: 'pmu-mark', 'data-mark': 'glow', d: line.getAttribute('d') }, svg);
    ['data-series-index', 'data-tk', 'data-vendor'].forEach(function (a) { var v = line.getAttribute(a); if (v != null) p.setAttribute(a, v); });
    var a = Mo.anim(svg, [{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 0 }], 760, at - 60, 'steps(6,jump-start)', 'both');
    if (a) a.onfinish = function () { svg.remove(); }; else svg.remove();
  }
  charts._plot = { frame: frame, setLegend: setLegend, dims: dims, tierW: tierW, drawAxes: drawAxes, swapAxes: swapAxes, enterPlot: enterPlot,
    showEmpty: showEmpty, hideEmpty: hideEmpty, gapLine: gapLine, gapBand: gapBand, axisW: axisW };

  /* ================= line: multi-series lines, limit rules, forecast with a confidence band ================= */
  charts.line = function (host, spec, opts) {
    return charts.make('line', host, spec, opts, {
      draw: function (c, first, resized) { drawLine(c, first ? 'first' : 'redraw'); },
      update: function (c) { drawLine(c, 'morph'); },
      carry: function (c) { drawLine(c, 'morph'); },
      enter: function (c, delay) { enterPlot(c, delay); },
      beat: function (c, delay) { return lineBeat(c, delay); },
      live: function (c, prev, lo) { c._live = lo; c._liveAnims = 0; try { drawLine(c, lo.still ? 'redraw' : 'live'); } finally { c._live = null; } return { anims: c._liveAnims || 0 }; }
    });
  };
  function drawLine(c, mode) {
    var spec = c.spec, f = frame(c), tw = tierW(c), compact = !!COMPACT[tw] || c.opts.compact, live = mode === 'live';
    var series = spec.series || [];
    var n = 0; series.forEach(function (s) { n = Math.max(n, (s.values || []).length); });
    var fc = spec.forecast;
    var items = compact ? [] : series.map(function (s, i) {
      return { key: 'S' + i, name: s.name, idx: s.idx != null ? s.idx : i, vendor: s.vendor, tk: s.tk, swatch: s.dash || s.role === 'baseline' ? 'dash' : 'line' };
    });
    if (fc && !compact) items.push({ key: 'fc', name: fc.label || t('charts.forecast'), idx: series[0] && series[0].idx != null ? series[0].idx : 0, swatch: 'dash' });
    var legendH = setLegend(c, items, function (k) { c._iso = k; paintIso(c); });
    var d = dims(c, compact ? 64 : 180), W = d.W, Hh = d.H - legendH;
    f.box.style.height = Hh + 'px';
    if (!n) { showEmpty(c, spec.emptyText); return; }
    hideEmpty(c);
    var dom = charts.xDomain(spec, n);
    var unit = spec.unit || 'count';
    var lo = finite(spec.yMin) ? spec.yMin : 0, hiV = 0;
    series.forEach(function (s) { (s.values || []).forEach(function (v) { if (finite(v)) hiV = Math.max(hiV, v); }); });
    (spec.limits || []).forEach(function (l) { if (finite(l.value)) hiV = Math.max(hiV, l.value); });
    if (fc) { (fc.values || []).forEach(function (v) { if (finite(v)) hiV = Math.max(hiV, v); }); if (fc.band) (fc.band[1] || []).forEach(function (v) { if (finite(v)) hiV = Math.max(hiV, v); }); }
    var pad = compact ? { l: 2, r: 6, t: 6, b: 3 } : { l: 44, r: 14, t: 28, b: 30 };
    var ph = Math.max(16, Hh - pad.t - pad.b);
    var ya;
    if (unit === 'pct' && !finite(spec.yMax) && lo === 0) ya = { step: 25, top: 100, k: 4 };
    else if (finite(spec.yMax)) { var kk = ph >= 160 ? 4 : 2; ya = { step: (spec.yMax - lo) / kk, top: spec.yMax - lo, k: kk }; }
    else ya = charts.scales(Math.max(1e-9, hiV - lo), null, ph).a;
    if (live && c._lgeo && c._lgeo.ya && c._lgeo.ph === ph && c._lgeo.lo === lo && c._lgeo.ya.top >= hiV - lo) ya = c._lgeo.ya;
    var labs = []; for (var k = 0; k <= ya.k; k++) labs.push(charts.fmtAxis(lo + ya.step * k, unit, ya.step));
    if (!compact) pad.l = Math.max(44, Math.ceil(axisW(labs.concat([spec.unitTitle || charts.unitTitle(unit)]))) + 14);
    var limitLab = (spec.limits || []).some(function (l) { return l.label; });
    if (!compact && limitLab) pad.t = 28;
    var pw = Math.max(30, W - pad.l - pad.r);
    var X = function (tt) { return pad.l + (tt - dom.t0) / Math.max(1, dom.t1 - dom.t0) * pw; };
    var xs = dom.x.map(function (x0) { return X(x0 + dom.bucket / 2); });
    if (n === 1) xs = [pad.l + pw / 2];
    var Y = function (v) { return pad.t + ph - (v - lo) / ya.top * ph; };
    if (!compact) {
      var xt = charts.xTicks(dom.t0, dom.t1, dom.bucket, pw).map(function (tk) { return { x: X(tk.t), label: tk.label, major: tk.major }; });
      var extra = '';
      (spec.limits || []).forEach(function (l) {
        if (!finite(l.value)) return;
        var y = r1(Y(l.value)) + 0.5;
        extra += '<path class="pmu-limit" data-role="' + esc(l.role || 'limit') + '" d="M' + pad.l + ' ' + y + 'H' + (pad.l + pw) + '"/>';
        if (l.label) extra += '<text class="pmu-tick is-limit" data-role="' + esc(l.role || 'limit') + '" x="' + (pad.l + pw - 2) + '" y="' + (y - 5) + '" text-anchor="end">' + esc(l.label) + '</text>';
      });
      swapAxes(f, { W: W, H: Hh, pad: pad, pw: pw, ph: ph, ya: ya, yMin0: lo === 0, unitA: spec.unitTitle || charts.unitTitle(unit),
        ylab: function (i) { return charts.fmtAxis(lo + ya.step * i, unit, ya.step); }, xt: xt, extra: extra }, live ? 'live' : mode === 'morph');
    } else f.axes.innerHTML = '';
    f.plot.setAttribute('width', W); f.plot.setAttribute('height', Hh);
    f.over.setAttribute('width', W); f.over.setAttribute('height', Hh);
    var pts = series.map(function (s) { return (s.values || []).map(function (v) { return finite(v) ? Y(v) : null; }); });
    var bandPts = null, fcPts = null;
    if (fc && finite(fc.from)) {
      var fv = fc.values || [];
      fcPts = []; for (var i = 0; i < fv.length; i++) if (finite(fv[i])) fcPts.push([xAtIndex(fc.from + i), Y(fv[i])]);
      if (fc.band) {
        var blo = fc.band[0] || [], bhi = fc.band[1] || [], top = [], bot = [];
        for (i = 0; i < Math.max(blo.length, bhi.length); i++) if (finite(blo[i]) && finite(bhi[i])) { top.push([xAtIndex(fc.from + i), Y(bhi[i])]); bot.push([xAtIndex(fc.from + i), Y(blo[i])]); }
        bandPts = { top: top, bot: bot };
      }
    }
    function xAtIndex(i) { return i < n ? xs[i] : xs[n - 1] + (i - n + 1) * (n > 1 ? xs[1] - xs[0] : 10); }
    var sig = series.length + '|' + n + '|' + !!fc;
    var prev = c._lgeo;
    if (mode === 'morph' && prev && prev.sig === sig && (prev.W !== W || prev.H !== Hh) && prev.ph > 0) {
      var ky = ph / prev.ph;
      prev = { sig: sig, W: W, H: Hh, pad: pad, ph: ph, pts: prev.pts.map(function (row) { return row.map(function (v) { return finite(v) ? pad.t + (v - prev.pad.t) * ky : v; }); }) };
    }
    var morph = (mode === 'morph' || live) && prev && prev.sig === sig && prev.W === W && prev.H === Hh && !Mo.reduced();
    var slid = null;
    function paint(cur) {
      var s = '';
      if (bandPts && bandPts.top.length > 1) s += '<path class="pmu-mark" data-mark="band" data-series-role="forecast" data-series-index="' + (series[0] && series[0].idx != null ? series[0].idx : 0) + '" data-key="fc" d="' +
        charts.monoD(bandPts.top) + charts.monoD(bandPts.bot.slice().reverse(), false).replace(/^L/, 'L') + 'Z"/>';
      series.forEach(function (sr, j) {
        var keyA = charts.keyAttrs({ idx: sr.idx != null ? sr.idx : j, vendor: sr.vendor, tk: sr.tk, tone: sr.tone });
        var role = sr.role ? ' data-series-role="' + esc(sr.role) + '"' : '';
        charts.runs(cur[j]).forEach(function (run) {
          var p = run.map(function (i) { return [xs[i], cur[j][i]]; });
          if ((sr.area || (spec.area && j === 0)) && p.length > 1) s += '<path class="pmu-mark" data-mark="area"' + keyA + role + ' data-key="S' + j + '" d="' + charts.monoD(p) + 'L' + r1(p[p.length - 1][0]) + ',' + r1(pad.t + ph) + 'L' + r1(p[0][0]) + ',' + r1(pad.t + ph) + 'Z"/>';
          if (j === 0 && !compact) s += '<path class="pmu-mark" data-mark="glow"' + keyA + ' data-key="S' + j + '" d="' + charts.monoD(p) + '"/>';
          s += '<path class="pmu-mark" data-mark="line"' + keyA + role + (sr.dash ? ' data-dash="' + esc(sr.dash) + '"' : '') + (j === 0 ? ' data-primary="1"' : '') + ' data-key="S' + j + '" d="' + charts.monoD(p) + '"/>';
          if (j === 0 && !compact && !sr.dash) s += '<path class="pmu-mark" data-mark="core"' + keyA + ' data-key="S' + j + '" d="' + charts.monoD(p) + '"/>';
        });
      });
      if (fcPts && fcPts.length > 1) {
        var lastJ = series.length ? lastFinite(cur[0]) : -1;
        var pp = (lastJ >= 0 && fc.from > 0 ? [[xs[lastJ], cur[0][lastJ]]] : []).concat(fcPts.filter(function (q) { return q[0] != null; }));
        s += '<path class="pmu-mark" data-mark="forecast" data-series-role="forecast" data-series-index="' + (series[0] && series[0].idx != null ? series[0].idx : 0) + '" data-key="fc" d="' + charts.monoD(pp) + '"/>';
      }
      /* in place when the paths are the same (a morph tween patches d attributes every frame, never a new child list) */
      charts.patchSvg(f.plot, s);
    }
    /* end dots with their NOW halos, HTML over the plot (WOW-TASKS C-9) */
    function dots() {
      var h = '';
      if (!compact) series.forEach(function (sr, j) {
        var li = lastFinite(pts[j]);
        if (li >= 0 && !sr.dash && sr.role !== 'baseline') h += charts.dotHtml(xs[li], pts[j][li], { idx: sr.idx != null ? sr.idx : j, vendor: sr.vendor, tk: sr.tk, tone: sr.tone }, { key: 'S' + j, halo: j === 0 });
      });
      /* an annotation on the line itself (spec.callout {i, title, sub, tone}: the anomaly's spike): a ring on the point and a
         label beside it on a short leader, on the side with room; HTML over the plot, so the room's beat can unfold it */
      var co = spec.callout;
      if (co && !compact && W >= 360 && pts[0] && finite(pts[0][co.i])) {
        var cx = xs[co.i], cy = pts[0][co.i], left = cx > pad.l + pw * 0.6;
        var top = Math.max(2, Math.min(Hh - pad.b - 44, cy - 20));
        h += '<i class="pmu-callring" data-tone="' + esc(co.tone || 'warn') + '" style="left:' + r1(cx) + 'px;top:' + r1(cy) + 'px"></i>' +
          '<div class="pmu-callout" data-tone="' + esc(co.tone || 'warn') + '" data-side="' + (left ? 'l' : 'r') + '" style="' + (left ? 'right:' + r1(W - cx + 16) : 'left:' + r1(cx + 16)) + 'px;top:' + r1(top) + 'px;--stem-y:' + r1(cy - top) + 'px">' +
          '<b>' + esc(co.title || '') + '</b>' + (co.sub ? '<span>' + esc(co.sub) + '</span>' : '') + '</div>';
      }
      if (live && morph) slid = slideJobs(f.hl, h); else if (morph) morphMarks(c._tw, f.hl, h); else charts.patchHtml(f.hl, h);
    }
    if (c._tw) { c._tw.cancel(); c._tw = null; }
    if (morph) {
      var from = prev.pts;
      if (live) c._liveAnims++;
      c._tw = morphTween(live ? 420 : 520, function (k) { paint(pts.map(function (row, j) { return row.map(function (v, i) { return mix(from[j] ? from[j][i] : v, v, k); }); })); },
        function () { c._tw = null; paint(pts); paintIso(c); if (!live) rescan(c); });
      /* the end dots ride the lines' own tween on a live beat and a range morph (charts.ride, item 3) */
      dots();
      if (slid) c._liveAnims += rideOrSlide(c._tw, slid, 420, (c._live && c._live.delay) || 0);
    } else {
      dots();
      paint(pts);
      /* a different bucket count re-scans the line left to right (WOW-SPEC 3.4: one light runs along the new line) */
      if (mode === 'morph' && prev && !Mo.reduced() && f.rv) { Mo.reveal(f.rv, f.rvin, 640, 60, 'x'); Mo.anim(f.hl, [{ opacity: 0 }, { opacity: 1 }], 220, 620, Mo.EASE.out, 'backwards'); }
    }
    c._lgeo = { sig: sig, W: W, H: Hh, pts: pts, pad: pad, ph: ph, xs: xs, lo: lo, top: ya.top, ya: ya, t0: dom.t0, t1: dom.t1 };
    if (!compact) {
      var curves = [];
      var cfg = {
        n: n, pad: { t: pad.t, h: ph, l: pad.l, r: pad.r }, xAt: function (i) { return xs[i]; },
        yAt: function (k, x) { var cv = curves[k] || (curves[k] = pts[k] ? runsAt(xs, pts[k]) : function () { return null; }); return cv(x); },
        dots: function (i) { return series.map(function (sr, j) { return { y: pts[j][i], key: { idx: sr.idx != null ? sr.idx : j, vendor: sr.vendor, tk: sr.tk }, dk: 'S' + j }; }); },
        html: function (i) {
          var ro = charts.ro, lo2 = dom.x[i], h = ro.title(charts.spanLabel(lo2, lo2 + dom.bucket, dom.bucket));
          series.forEach(function (sr, j) {
            var v = (sr.values || [])[i];
            h += ro.row({ idx: sr.idx != null ? sr.idx : j, vendor: sr.vendor, tk: sr.tk }, sr.name, finite(v) ? charts.fmtValue(v, unit) : PMU.vs.STATES.unknown.word, '', 'line');
          });
          (spec.limits || []).forEach(function (l) { if (l.label) h += ro.foot(l.label); });
          var extra = typeof spec.readoutFoot === 'function' ? spec.readoutFoot(i) : null;
          (Array.isArray(extra) ? extra : extra ? [extra] : []).forEach(function (line) { h += ro.foot(line); });
          if (spec.source) h += ro.foot(spec.source);
          return h;
        }
      };
      if (c._hover) c._hover.set(cfg); else c._hover = charts.hover(f.box, cfg);
    }
    paintIso(c);
  }

  /* ================= columns: single series or stacked by provider (A1 7.8, 7.11); DOM bars over SVG axes ================= */
  charts.columns = function (host, spec, opts) {
    return charts.make('columns', host, spec, opts, {
      draw: function (c, first) { drawColumns(c, first ? 'first' : 'redraw'); },
      update: function (c) { drawColumns(c, 'morph'); },
      /* live (C3-4): the changed columns grow from their old height (scaleY 420), their labels roll the changed digits */
      live: function (c, prev, lo) { c._live = lo; c._liveAnims = 0; try { drawColumns(c, lo.still ? 'redraw' : 'live'); } finally { c._live = null; } return { anims: c._liveAnims || 0 }; },
      carry: function (c) { drawColumns(c, 'morph'); },
      enter: function (c, delay) { enterColumns(c, delay); }
    });
  };
  /* stacks beyond the top five (by total) merge into one "Other N" stack at the bottom (LOOK-REVIEW-2 item 18: ten hatched
     hues in a column read as noise); the readout still names every provider of the merged stack */
  function topStacks(spec) {
    var st = spec.stacks || [];
    if (st.length <= 6) return st;
    var tot = function (s) { var v = 0; (s.settled || []).concat(s.estimate || []).forEach(function (x) { if (finite(x)) v += x; }); return v; };
    var ranked = st.slice().sort(function (a, b) { return tot(b) - tot(a); }), keep = ranked.slice(0, 5), rest = ranked.slice(5);
    var n = 0; st.forEach(function (s) { n = Math.max(n, (s.settled || []).length, (s.estimate || []).length); });
    var other = { providerId: '_other', name: t('charts.other_providers', { n: rest.length }), idx: 7, settled: [], estimate: [], members: rest };
    for (var i = 0; i < n; i++) {
      var a = null, b = null;
      rest.forEach(function (s) { var x = (s.settled || [])[i], y = (s.estimate || [])[i]; if (finite(x)) a = (a || 0) + x; if (finite(y)) b = (b || 0) + y; });
      other.settled.push(a); other.estimate.push(b);
    }
    return [other].concat(st.filter(function (s) { return keep.indexOf(s) >= 0; }));
  }
  function colModel(spec) {
    if (spec.stacks && spec.stacks.length > 6 && !spec._topped) { spec = Object.assign({}, spec, { stacks: topStacks(spec), _topped: true }); }
    var stacked = !!(spec.stacks && spec.stacks.length);
    var n = stacked ? (spec.labels || []).length || Math.max.apply(null, spec.stacks.map(function (s) { return Math.max((s.settled || []).length, (s.estimate || []).length); })) : (spec.values || []).length;
    var totals = [];
    for (var i = 0; i < n; i++) {
      if (stacked) {
        var sum = 0, any = false;
        spec.stacks.forEach(function (s) { var a = (s.settled || [])[i], b = (s.estimate || [])[i]; if (finite(a)) { sum += a; any = true; } if (finite(b)) { sum += b; any = true; } });
        totals.push(any ? sum : null);
      } else totals.push(finite((spec.values || [])[i]) ? spec.values[i] : null);
    }
    return { stacked: stacked, n: n, totals: totals, spec: spec };
  }
  /* a stack's colour key: its vendor (provider stacks), else its series index or token type (raised / resolved), else neutral */
  function stackKey(s) { return s.vendor ? { vendor: s.vendor } : (s.idx != null || s.tk) ? { idx: s.idx, tk: s.tk } : { vendor: 'community' }; }
  /* short money for a column label: two decimals under $10 (LOOK-REVIEW-2 item 18: "$1.5" read as clipped) */
  function moneyShort(v) { return v >= 1000 ? '$' + +(v / 1000).toFixed(1) + 'k' : v >= 10 ? '$' + Math.round(v) : '$' + v.toFixed(2); }
  /* a short provider name for a narrow legend: the product word ("ChatGPT / Codex" -> "Codex", "Qwen Coding Plan" -> "Qwen") */
  function shortName(name) {
    var n = String(name || '');
    if (n.indexOf(' / ') > 0) n = n.split(' / ').pop();
    n = n.replace(/^(GitHub|Google) /, '').replace(/ (Coding Plan|Token Plan|Code|API|Build|Plan|Direct)$/, '');
    return n;
  }
  function drawColumns(c, mode) {
    var spec = c.spec, f = frame(c), tw = tierW(c), m = colModel(spec), unit = spec.unit || 'usd', live = mode === 'live';
    spec = m.spec;
    var items = [];
    if (m.stacked && c.opts.legend !== false && tw !== 'xs') spec.stacks.forEach(function (s) {
      var tot = 0; (s.settled || []).concat(s.estimate || []).forEach(function (v) { if (finite(v)) tot += v; });
      var full = s.name || (PMU.roster && PMU.roster.provider && PMU.roster.provider(s.providerId) ? PMU.roster.provider(s.providerId).name : s.providerId);
      /* every legend item names its provider: the official mark plus a short name (LOOK-REVIEW-2 item 18) */
      if (tot > 0) items.unshift(Object.assign({ key: s.providerId, name: full, _short: shortName(full), full: full, prov: s.members ? null : s.providerId,
        markName: !!s.vendor && !s.members }, stackKey(s)));
    });
    /* the Settings names (final fix M8): a legend may take one more line for them; only a narrower legend, where they
       would take two more, falls back to the short words */
    if (items.length && (tw === 'm' || tw === 's')) {
      var shortItems = items.map(function (it) { return Object.assign({}, it, { name: it._short }); });
      if (legendLines(items, (c._w || 300) - 4) > legendLines(shortItems, (c._w || 300) - 4) + (tw === 'm' ? 1 : 0)) items = shortItems;
    }
    var legendH = setLegend(c, items, function (k) {
      $$('.pmu-colstack > i', c.el).forEach(function (el) { el.classList.toggle('is-dim', !!k && el.getAttribute('data-prov') !== k); });
    });
    var capH = 0;
    if (spec.caption) {
      if (!f.cap) { f.cap = H('div', 'pmu-colcaption'); c.el.insertBefore(f.cap, f.box); }
      f.cap.textContent = spec.caption; capH = 24;
    } else if (f.cap) { f.cap.remove(); f.cap = null; }
    var d = dims(c, 160), W = d.W, Hh = d.H - legendH - capH;
    f.box.style.height = Hh + 'px';
    if (!m.n) { showEmpty(c, spec.emptyText); return; }
    hideEmpty(c);
    var noAxis = W < 248 || c.opts.axis === false;
    var maxV = 0; m.totals.forEach(function (v) { if (finite(v)) maxV = Math.max(maxV, v); });
    var pad = { l: noAxis ? 2 : 44, r: noAxis ? 2 : 10, t: 20, b: 22 };
    var ph = Math.max(20, Hh - pad.t - pad.b);
    var ya = charts.scales(maxV, null, ph).a;
    if (live && c._colGeo && c._colGeo.ya && c._colGeo.ph === ph && c._colGeo.ya.top >= maxV) ya = c._colGeo.ya;
    var labs = []; for (var k = 0; k <= ya.k; k++) labs.push(charts.fmtAxis(ya.step * k, unit, ya.step));
    if (!noAxis) pad.l = Math.max(40, Math.ceil(axisW(labs)) + 12);
    var pw = Math.max(20, W - pad.l - pad.r), n = m.n, slot = pw / n;
    var bw = clamp(0.62 * slot, 4, 64);
    var labels = spec.labels || [];
    var xt = [];
    var lw = 0; labels.forEach(function (l) { if (l != null) lw = Math.max(lw, charts.textW(String(l), 11, true)); });
    var every = Math.max(1, Math.ceil((lw + 12) / slot));
    for (var i = 0; i < n; i++) if ((n - 1 - i) % every === 0 && labels[i] != null) xt.push({ x: pad.l + slot * (i + 0.5), label: String(labels[i]), major: false, bar: true });
    var g = { W: W, H: Hh, pad: pad, pw: pw, ph: ph, ya: ya, yMin0: true, noY: noAxis, vgrid: false,
      ylab: function (i) { return charts.fmtAxis(ya.step * i, unit, ya.step); }, xt: xt };
    swapAxes(f, g, live ? 'live' : mode === 'morph');
    /* the overlay svg keeps the plot's size (an unsized svg is 300 x 150 and pushed short cards into overflow) */
    f.over.setAttribute('width', W); f.over.setAttribute('height', Hh);
    /* bars (DOM) */
    if (!f.bars) { f.bars = H('div', 'pmu-cols', f.box); }
    var bars = f.bars;
    var prevH = c._colH || [];
    var newH = [];
    var html = '';
    var Yh = function (v) { return v / ya.top * ph; };
    var est = spec.est || [];
    /* value labels never overprint: when the widest one does not fit its slot, every k-th column from the latest keeps its
       label (and the tallest), the readout names every value */
    var maxLab = 0, maxI = -1;
    m.totals.forEach(function (v, i2) {
      if (!finite(v)) return;
      if (maxI < 0 || v > m.totals[maxI]) maxI = i2;
      var l2 = unit === 'usd' ? moneyShort(v) : PMU.fmt.tok(v);
      maxLab = Math.max(maxLab, charts.textW(l2, 11, true));
    });
    var labelEvery = Math.max(1, Math.ceil((maxLab + 6) / slot));
    for (i = 0; i < n; i++) {
      var tot = m.totals[i], x = pad.l + slot * i + (slot - bw) / 2, last = i === n - 1;
      var st = (spec.states || [])[i];
      var lab;
      if (!finite(tot)) {
        newH.push(0);
        lab = st ? (st === 'hidden_subscription' ? t('charts.covered') : PMU.vs.STATES[st] ? PMU.vs.STATES[st].word : '') : '';
        /* the state word fits its slot (and its neighbours' labels): the full word, its first word, or nothing (the readout
           still names it) */
        if (lab && charts.textW(lab, 11, true) + 4 > slot * 1.6) lab = lab.split(' ')[0];
        if (lab && charts.textW(lab, 11, true) + 4 > slot * 1.6) lab = '';
        html += '<div class="pmu-col is-gap" data-i="' + i + '" style="left:' + r1(x) + 'px;width:' + r1(bw) + 'px;bottom:' + pad.b + 'px;height:0">' +
          (lab ? '<span class="pmu-collab is-state" style="bottom:4px">' + esc(lab) + '</span>' : '') + '</div>';
        continue;
      }
      var h = tot === 0 ? 2 : Math.max(2, Yh(tot));
      newH.push(h);
      var full = unit === 'usd' ? charts.fmtValue(tot, 'usd') : charts.fmtValue(tot, unit);
      /* the short form keeps three significant figures (3,980 reads 3.98k, never 4k) */
      lab = charts.textW(full, 11, true) + 4 <= slot ? full : unit === 'usd' ? moneyShort(tot) : PMU.fmt.tok(tot);
      var segs = '', kAttrs = '';
      if (m.stacked) {
        spec.stacks.forEach(function (s) {
          var a = (s.settled || [])[i], b = (s.estimate || [])[i];
          var ka = charts.keyAttrs(stackKey(s));
          if (finite(a) && a > 0) segs += '<i class="pmu-mark" data-mark="segment"' + ka + ' data-prov="' + esc(s.providerId) + '" style="flex-grow:' + a + '"></i>';
          if (finite(b) && b > 0) segs += '<i class="pmu-mark" data-mark="segment" data-est="1"' + ka + ' data-prov="' + esc(s.providerId) + '" style="flex-grow:' + b + '"></i>';
        });
      } else {
        kAttrs = charts.keyAttrs({ idx: spec.idx != null ? spec.idx : 0, tk: spec.tk, vendor: spec.vendor, tone: (spec.tones || [])[i] });
        var e = est[i];
        if (finite(e) && e > 0 && e < tot) segs = '<i class="pmu-mark" data-mark="segment"' + kAttrs + ' style="flex-grow:' + (tot - e) + '"></i><i class="pmu-mark" data-mark="segment" data-est="1"' + kAttrs + ' style="flex-grow:' + e + '"></i>';
        else segs = '<i class="pmu-mark" data-mark="segment"' + kAttrs + (finite(e) && e >= tot && tot > 0 ? ' data-est="1"' : '') + ' style="flex-grow:1"></i>';
      }
      /* the lit cap takes the top segment's colour; a single-series value sits inside its column when it fits (WOW-SPEC 2.5) */
      var topKey = m.stacked ? (function () { var k0 = null; spec.stacks.forEach(function (st0) { var a0 = (st0.settled || [])[i], b0 = (st0.estimate || [])[i];
        if (finite(a0) && a0 > 0) k0 = charts.keyAttrs(stackKey(st0)); if (finite(b0) && b0 > 0) k0 = charts.keyAttrs(stackKey(st0)) + ' data-est="1"'; }); return k0 || ''; })()
        : kAttrs + (finite(est[i]) && est[i] >= tot && tot > 0 ? ' data-est="1"' : '');
      var inside = !m.stacked && h >= 26 && charts.textW(lab, 11, true, 600) + 8 <= bw;
      /* a reported zero says so (LOOK-REVIEW-2 item 18): "$0" over "reported", never a bare "$0.00" */
      var zeroWord = tot === 0 && !st;
      var show = zeroWord || labelEvery <= 1 || (n - 1 - i) % labelEvery === 0 || i === maxI;
      html += '<div class="pmu-col' + (tot === 0 ? ' is-zero' : '') + (last && spec.highlightLast !== false ? ' is-latest' : '') + '" data-i="' + i + '" style="left:' + r1(x) + 'px;width:' + r1(bw) + 'px;bottom:' + pad.b + 'px;height:' + r1(h) + 'px">' +
        '<span class="pmu-colstack">' + segs + '</span>' + (tot > 0 ? '<i class="pmu-colcap"' + topKey + '></i>' : '') +
        (zeroWord ? '<span class="pmu-collab is-zero">' + (unit === 'usd' ? '$0' : '0') + '<i>' + esc(t('charts.reported_word')) + '</i></span>'
          : show || inside ? '<span class="pmu-collab' + (inside ? ' is-in' : '') + '">' + esc(lab) + '</span>' : '') + '</div>';
    }
    var oldLabs = live ? $$('.pmu-col', bars).map(function (el) { var l = el.querySelector('.pmu-collab'); return l ? l.textContent : null; }) : null;
    charts.patchHtml(bars, html);
    if (live && oldLabs) $$('.pmu-col', bars).forEach(function (el, j) {
      var l = el.querySelector('.pmu-collab');
      if (l && oldLabs[j] != null && oldLabs[j] !== l.textContent && charts.rollTo && charts.rollTo(l, oldLabs[j], l.textContent, 420, (c._live && c._live.delay) || 0)) c._liveAnims++;
    });
    c._colH = newH;
    c._colGeo = { pad: pad, slot: slot, n: n, ph: ph, W: W, ya: ya };
    /* morph: each bar scales from its old height (transform only) */
    if ((mode === 'morph' || live) && !Mo.reduced() && prevH.length) {
      var regrow = prevH.length !== newH.length;
      $$('.pmu-col', bars).forEach(function (el, j) {
        var a = regrow ? 0 : prevH[j], b = newH[j];
        if (!(b > 0) || !finite(a) || Math.abs(a - b) < 0.5) return;
        var st2 = el.querySelector('.pmu-colstack');
        if (Mo.anim(st2, [{ transform: 'scaleY(' + clamp(a / b, 0, 40) + ')' }, { transform: 'scaleY(1)' }], live ? 420 : 520, regrow ? Math.min(240, j * 14) : live ? (c._live.delay || 0) : 0, live ? 'cubic-bezier(.16,1,.3,1)' : Mo.EASE.io, regrow || live ? 'backwards' : undefined) && live) c._liveAnims++;
        if (regrow) { var lb = el.querySelector('.pmu-collab'); if (lb) Mo.anim(lb, [{ opacity: 0 }, { opacity: 1 }], 260, 300 + Math.min(240, j * 14), Mo.EASE.out, 'backwards'); }
      });
    }
    bindColumnsHover(c, m);
  }
  function bindColumnsHover(c, m) {
    var spec = c.spec, f = c.f, g = c._colGeo, unit = spec.unit || 'usd';
    var cfg = {
      n: g.n, pad: { t: g.pad.t, h: g.ph, l: g.pad.l, r: g.pad.r },
      xAt: function (i) { return g.pad.l + g.slot * (i + 0.5); },
      dots: function () { return []; },
      onIndex: function (i) {
        f.bars.classList.toggle('is-hot', i != null);
        $$('.pmu-col.is-hot-col', f.bars).forEach(function (el) { el.classList.remove('is-hot-col'); });
        if (i != null) { var el = f.bars.querySelector('.pmu-col[data-i="' + i + '"]'); if (el) el.classList.add('is-hot-col'); }
      },
      html: function (i) {
        var ro = charts.ro, label = (spec.labelsLong || spec.labels || [])[i];
        var h = ro.title(String(label == null ? '' : label).toUpperCase());
        var tot = m.totals[i];
        if (m.stacked) {
          var settled = 0, estimate = 0;
          spec.stacks.forEach(function (s) {
            var a = (s.settled || [])[i], b = (s.estimate || [])[i];
            if (!finite(a) && !finite(b)) return;
            var v = (finite(a) ? a : 0) + (finite(b) ? b : 0);
            settled += finite(a) ? a : 0; estimate += finite(b) ? b : 0;
            /* a provider that reported zero says so in words, never "$0.00" (covered work is never $0.00, Truth 2) */
            if (v > 0) h += ro.row(stackKey(s), s.name || s.providerId, charts.fmtValue(v, unit) + (finite(b) && b > 0 && !(finite(a) && a > 0) ? ' est.' : ''));
            else if (finite(a) && a === 0) h += ro.row(stackKey(s), s.name || s.providerId, s.covered ? t('charts.covered_by_plan') : t('charts.zero_reported'), 'is-dim');
          });
          h += ro.sep() + ro.row({ idx: 'ink' }, t('charts.total'), finite(tot) ? charts.fmtValue(tot, unit) : '-', 'is-total');
          if (unit === 'usd') h += ro.foot(t('charts.settled_vs_est', { settled: charts.fmtValue(settled, 'usd'), est: charts.fmtValue(estimate, 'usd') }));
        } else {
          var st = (spec.states || [])[i];
          h += ro.row({ idx: spec.idx != null ? spec.idx : 0, tk: spec.tk, vendor: spec.vendor }, spec.name || t('charts.value'),
            finite(tot) ? (tot === 0 ? (unit === 'usd' ? t('charts.zero_reported') : '0 · ' + t('charts.reported_word')) : charts.fmtValue(tot, unit)) : st ? (PMU.vs.STATES[st] || {}).word || '-' : PMU.vs.STATES.unknown.word, 'is-total');
          var e = (spec.est || [])[i];
          if (finite(e) && e > 0) h += ro.foot(t('charts.settled_vs_est', { settled: charts.fmtValue(tot - e, 'usd'), est: charts.fmtValue(e, 'usd') }));
        }
        if (spec.source) h += ro.foot(spec.source);
        return h;
      }
    };
    if (c._hover) c._hover.set(cfg); else c._hover = charts.hover(f.box, cfg);
  }
  function enterColumns(c, delay) {
    var f = c.f;
    if (!f || !f.bars) return;
    f.bars.style.visibility = '';
    /* quiet (C3-3): the columns rise together behind one clip from the baseline (GPU only; one animation), no lit caps */
    if (c._quiet) {
      var fq = Mo.fam(), st = fq === 'retro' || fq === 'nier';
      Mo.anim(f.bars, [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 520, delay, st ? 'steps(5,jump-start)' : 'cubic-bezier(.16,1,.3,1)', 'backwards');
      return;
    }
    Mo.anim(f.axes, [{ opacity: 0 }, { opacity: 1 }], 260, delay, Mo.EASE.out);
    /* columns grow from the baseline 760 ms ROLL, 30 ms apart left to right; the lit cap fades in as each grow lands and
       the value label rises in after it (WOW-SPEC 3.3, WOW-TASKS C-3) */
    var cols = $$('.pmu-col', f.bars), n = cols.length || 1, step = Math.min(30, 600 / n), fm = Mo.fam();
    var e = fm === 'retro' ? 'steps(6,jump-start)' : fm === 'nier' ? 'steps(5,jump-start)' : 'cubic-bezier(.16,1,.3,1)';
    cols.forEach(function (el, i) {
      var st = el.querySelector('.pmu-colstack'), lab = el.querySelector('.pmu-collab'), cap = el.querySelector('.pmu-colcap');
      var dl = delay + Math.min(600, i * step);
      if (st) Mo.anim(st, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], 760, dl, e);
      if (cap) Mo.anim(cap, [{ opacity: 0 }, { opacity: 1 }], 220, dl + 520, Mo.EASE.out);
      if (lab) Mo.anim(lab, [{ opacity: 0, transform: lab.classList.contains('is-in') ? 'none' : 'translateY(4px)' }, { opacity: 1, transform: 'none' }], 200, dl + 560, Mo.EASE.out);
    });
    if (f.legendHost.firstChild) Mo.anim(f.legendHost, [{ opacity: 0 }, { opacity: 1 }], 420, delay, Mo.EASE.out);
  }

  /* ================= spark: 1.5 px line + gradient area .32 to 0, end dot (A1 7.11) ================= */
  charts.spark = function (host, spec, opts) {
    return charts.make('spark', host, spec, opts, {
      draw: function (c, first) { drawSpark(c, first); },
      update: function (c) { drawSpark(c, false, true); },
      live: function (c, prev, lo) { c._live = lo; try { drawSpark(c, false, !lo.still, lo.still ? null : 420); } finally { c._live = null; } return { anims: lo.still ? 0 : 2 }; },
      carry: function (c) { drawSpark(c, false, true); },
      enter: function (c, delay) {
        if (!c.f) return;
        c.f.rv.style.visibility = '';
        var q = c._quiet;
        Mo.reveal(c.f.rv, c.f.rvin, q ? 600 : 900, delay, 'x', null, { quiet: q });
        var dot = c.f.hl.querySelector('.pmu-hdot');
        if (dot) { if (q) Mo.anim(dot, [{ opacity: 0 }, { opacity: 1 }], 160, delay + 560, Mo.EASE.out, 'backwards'); else charts.popDot(dot, delay + 820, 240); }
      }
    });
  };
  function drawSpark(c, first, morph, morphDur) {
    var spec = c.spec, f = c.f;
    if (!f) {
      f = c.f = {};
      f.rv = H('div', 'pmu-rv', c.el); f.rvin = H('div', 'pmu-rv-in', f.rv);
      f.plot = S('svg', { class: 'pmu-plot', 'aria-hidden': 'true' }, f.rvin);
      f.hl = H('div', 'pmu-hmarks', c.el);
    }
    var W = Math.max(24, c._w || 0), Hh = c._h >= 12 ? c._h : (spec.height || c.opts.height || 28);
    c.el.style.height = Hh + 'px';
    var vals = (spec.values || []), n = vals.length;
    f.plot.setAttribute('width', W); f.plot.setAttribute('height', Hh);
    if (!n) { f.plot.innerHTML = ''; return; }
    var lo = Infinity, hi = -Infinity;
    vals.forEach(function (v) { if (finite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
    if (!finite(lo)) { f.plot.innerHTML = ''; return; }
    if (spec.zero !== false) lo = Math.min(0, lo);
    if (finite(spec.yMin)) lo = spec.yMin;
    if (finite(spec.yMax)) hi = spec.yMax;
    if (hi === lo) hi = lo + 1;
    var padY = 3, padX = 3;
    var pts = vals.map(function (v, i) { return finite(v) ? [padX + (W - 2 * padX) * (n > 1 ? i / (n - 1) : 0.5), padY + (Hh - 2 * padY) * (1 - (v - lo) / (hi - lo))] : null; });
    var k = charts.keyAttrs({ idx: spec.idx != null ? spec.idx : 0, tk: spec.tk, vendor: spec.vendor, tone: spec.tone });
    function paint(P) {
      var s = '';
      var runs = charts.runs(P.map(function (p) { return p ? p[1] : null; }));
      runs.forEach(function (run) {
        var p = run.map(function (i) { return P[i]; });
        if (p.length > 1) s += '<path class="pmu-mark" data-mark="area" data-spark="1"' + k + ' d="' + charts.monoD(p) + 'L' + r1(p[p.length - 1][0]) + ',' + Hh + 'L' + r1(p[0][0]) + ',' + Hh + 'Z"/>';
        s += '<path class="pmu-mark" data-mark="line" data-spark="1"' + k + ' d="' + charts.monoD(p) + '"/>';
      });
      charts.patchSvg(f.plot, s);
    }
    function dot(P) {
      var li = lastFinite(P.map(function (p) { return p ? 1 : null; }));
      charts.patchHtml(f.hl, li >= 0 && spec.dot !== false ? charts.dotHtml(P[li][0], P[li][1], { idx: spec.idx != null ? spec.idx : 0, tk: spec.tk, vendor: spec.vendor, tone: spec.tone }, { size: 'xs', attrs: ' data-spark="1"' }) : '');
    }
    var prev = c._sp;
    if (c._tw) { c._tw.cancel(); c._tw = null; }
    if (morph && prev && prev.length === pts.length && !Mo.reduced()) {
      var md = morphDur || 520, ld = (c._live && c._live.delay) || 0;
      c._tw = PMU.motion.tween({ from: 0, to: 1, dur: md, delay: ld, ease: 'linear', step: function (v, t) { var x = t == null ? v : t, q = 1 - Math.pow(1 - x, 3); paint(pts.map(function (p, i) { return p && prev[i] ? [p[0], prev[i][1] + (p[1] - prev[i][1]) * q] : p; })); }, done: function () { c._tw = null; paint(pts); } });
      var li = lastFinite(pts.map(function (p) { return p ? 1 : null; })), d0 = li >= 0 && prev[li] ? prev[li][1] - pts[li][1] : 0;
      dot(pts);
      var de = f.hl.firstChild;
      /* the end dot rides the line's own tween (charts.ride, item 3) */
      if (de && d0) rideOrSlide(c._tw, [{ el: de, dx: 0, dy: d0 }], md, ld);
    } else { paint(pts); dot(pts); }
    c._sp = pts;
  }

  /* ================= budget: cumulative month-to-date spend, projection and the Settings budget rule (A1 7.11) ================= */
  charts.budget = function (host, spec, opts) {
    return charts.make('budget', host, spec, opts, {
      draw: function (c, first) { drawBudget(c, first); },
      update: function (c) { drawBudget(c, false, true); },
      /* live (spend beats): the line's last point, the cone and the markers move in place (one path tween, 420); the
         axes patch in place */
      live: function (c, prev, lo) { c._live = lo; try { drawBudget(c, false, lo.still ? false : 'live'); } finally { c._live = null; } return { anims: lo.still ? 0 : (c._liveAnims || 0) }; },
      enter: function (c, delay) {
        c._ownOver = true;
        var end = enterPlot(c, delay);
        var f = c.f, g = c._bgeo;
        if (!g || !f) return;
        var fm = Mo.fam(), stepped = fm === 'retro' || fm === 'nier';
        /* quiet (Overview, WOW-SPEC-3 5 Phase C and C3-3): the line draws 600 without a comet; at the end of the draw the
           projection fades in and the TODAY marker drops onto today (260 SETTLE, no light) */
        if (c._quiet) {
          var qe = (end || delay + 600) - 60, settle = stepped ? 'steps(3,jump-start)' : (PMU.film && PMU.film.E ? PMU.film.E.settle : Mo.EASE.out);
          if (f.over.firstChild) Mo.anim(f.over, [{ opacity: 0 }, { opacity: 1 }], 260, qe, Mo.EASE.out, 'backwards');
          var qm = f.hl.querySelector('.pmu-hnow'), ql = f.hl.querySelector('.pmu-hlab.is-today');
          [qm, ql].forEach(function (el) { if (el) Mo.anim(el, [{ transform: 'translateY(-16px)' }, { transform: 'none' }], 260, qe, settle, 'backwards'); });
          return;
        }
        /* the hero (Costs) and the full entrance: the comet reaches today, the TODAY marker drops onto it from the top of the
           plot (its label 40 ms later); then the signature beat (C3-6): the estimate cone opens from the last point (520,
           clip on a GPU, a fade without one), "est. $... by ..." counts from today's spend to the projection in step with
           the cone's edge, and the budget rule draws from the axis (360). All HTML or whole SVG roots (WOW-TASKS C-9). */
        var draw = fm === 'nier' ? 600 : 900, de = fm === 'nier' || fm === 'retro' ? 'linear' : charts.isHero(c) && fm !== 'glass' ? 'cubic-bezier(.45,.05,.25,1)' : Mo.voice('draw');
        var tNow = PMU.film && PMU.film.edgeAt && g.W > 0 ? delay + draw * PMU.film.edgeAt(g.xNow / g.W, de) : delay + draw;
        var mk = f.hl.querySelector('.pmu-hnow'), lab = f.hl.querySelector('.pmu-hlab.is-today');
        if (mk && PMU.film && PMU.film.drop) {
          PMU.film.drop(mk, { from: Math.round(g.ph * 0.6), delay: tNow + 40 });
          if (lab) PMU.film.drop(lab, { from: Math.round(g.ph * 0.6), delay: tNow + 80 });
        }
        c.beatEnd = budgetBeat(c, tNow + 60) - delay;
      },
      beat: function (c, delay) { return budgetBeat(c, delay); }
    });
  };
  function budgetBeat(c, at) {
    var f = c.f, g = c._bgeo;
    if (!f || !g || Mo.reduced()) return at;
    var fm = Mo.fam(), stepped = fm === 'retro' || fm === 'nier', soft = Mo.soft(), CONE = 520;
    var coneEase = stepped ? 'steps(6,jump-start)' : 'cubic-bezier(.22,1,.36,1)';
    if (f.over.firstChild) {
      if (soft || !g.xLast) Mo.anim(f.over, [{ opacity: 0 }, { opacity: 1 }], 260, at, Mo.EASE.out, 'backwards');
      else Mo.anim(f.over, [{ clipPath: 'inset(-4px ' + r1(Math.max(0, g.W - g.xLast)) + 'px -4px ' + r1(g.xLast) + 'px)' }, { clipPath: 'inset(-4px -4px -4px ' + r1(g.xLast) + 'px)' }], CONE, at, coneEase, 'backwards');
    }
    /* the projection's hollow marker lands with the cone's edge */
    var pj = f.hl.querySelector('.pmu-hdot[data-proj]');
    if (pj) Mo.anim(pj, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'none' }], 200, at + CONE - 120, Mo.EASE.out, 'backwards');
    /* "est. $201.30 by Oct 4" counts up from today's spend in step with the cone (the same 520 and easing) */
    var est = c.opts.coneLabel || (function () { var b = c.host.closest('.pmu-cardbody'); return b ? b.querySelector('.pmu-budgetest') : null; })();
    var pr = c.spec.projection, cum = c.spec.cumulative || [], fromV = cum.length ? cum[cum.length - 1] : null;
    if (est && pr && finite(pr.to) && finite(fromV) && fromV < pr.to && PMU.film && PMU.film.odometer && !est._pmuOdo) {
      var txt = est.textContent, m = /\$[\d,]+\.\d{2}/.exec(txt), money = charts.money;
      if (m && money(pr.to) === m[0]) {
        var pre = txt.slice(0, m.index), post = txt.slice(m.index + m[0].length), fmtE = function (v) { return pre + money(Math.round(v * 100) / 100) + post; };
        /* the estimate is not on screen before its cone: the label waits hidden (an opacity hold created in this task, so
           no frame shows the count's start value as an estimate) and counts up as the cone opens */
        est.textContent = fmtE(fromV);
        Mo.anim(est, [{ opacity: 0 }, { opacity: 1 }], 160, at, Mo.EASE.out, 'backwards');
        PMU.film.odometer(est, pr.to, fmtE, { from: fromV, change: true, dur: CONE, delay: at });
        if (est.textContent === fmtE(fromV) && !est._pmuOdo) est.textContent = txt;   /* the odometer declined: the final words */
      }
    }
    var rule = f.hl.querySelector('.pmu-hrule'), rlab = f.hl.querySelector('.pmu-hlab[data-role="budget"]');
    if (rule) Mo.anim(rule, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 360, at + 200, stepped ? 'steps(6,jump-start)' : Mo.EASE.out, 'backwards');
    if (rlab) Mo.anim(rlab, [{ opacity: 0 }, { opacity: 1 }], 220, at + 420, Mo.EASE.out, 'backwards');
    return at + Math.max(CONE, 640);
  }
  function drawBudget(c, first, morph) {
    var spec = c.spec, f = frame(c), tw = tierW(c), live = morph === 'live';
    c._liveAnims = 0;
    setLegend(c, []);
    var d = dims(c, 150), W = d.W, Hh = d.H;
    f.box.style.height = Hh + 'px';
    var days = spec.days || 30, today = clamp(spec.today || (spec.cumulative || []).length, 1, days), cum = spec.cumulative || [];
    if (!cum.length) { showEmpty(c, spec.emptyText); return; }
    hideEmpty(c);
    var pr = spec.projection || null, budget = spec.budget || 0;
    var compact = !!COMPACT[tw];
    var maxV = 0; cum.forEach(function (v) { if (finite(v)) maxV = Math.max(maxV, v); });
    if (pr) maxV = Math.max(maxV, pr.hi || pr.to || 0);
    if (budget > 0) maxV = Math.max(maxV, budget);
    var pad = compact ? { l: 2, r: 2, t: 8, b: 4 } : { l: 44, r: 12, t: 22, b: 28 };
    var ph = Math.max(20, Hh - pad.t - pad.b);
    var ya = charts.scales(maxV, null, ph).a;
    if (live && c._bgeo && c._bgeo.ya && c._bgeo.ph === ph && c._bgeo.ya.top >= maxV) ya = c._bgeo.ya;
    var labs = []; for (var k = 0; k <= ya.k; k++) labs.push(charts.fmtAxis(ya.step * k, 'usd', ya.step));
    if (!compact) pad.l = Math.max(40, Math.ceil(axisW(labs)) + 14);
    var pw = Math.max(30, W - pad.l - pad.r);
    var X = function (day) { return pad.l + (day - 1) / Math.max(1, days - 1) * pw; };
    var Y = function (v) { return pad.t + ph - v / ya.top * ph; };
    var ms0 = spec.monthStart || (function () { var dd = new Date(); dd.setDate(1); dd.setHours(0, 0, 0, 0); return dd.getTime(); })();
    /* day 1 is the period's first day (spec.monthStart; the calendar month's 1st when none is given) */
    var dayMs = function (day) { var dd = new Date(ms0); dd.setDate(dd.getDate() + day - 1); return dd.getTime(); };
    /* at least three date ticks across the period (LOOK-REVIEW-2 item 3: one tick for 30 days read as no axis), as many as
       fit at about 64 px apart, on whole steps of days; they stay while they fit inside the svg */
    var xt = [];
    if (!compact) {
      var fit = Math.max(3, Math.floor(pw / 64)), stepD = [1, 2, 3, 5, 7, 10, 14].filter(function (k) { return Math.ceil(days / k) <= fit; })[0] || 14;
      for (var dd = 1; dd <= days; dd += stepD) xt.push({ x: X(dd), label: charts.time.md(dayMs(dd)), bar: true });
    }
    var extra = '', hl = '';
    var xtd = X(today);
    if (!compact) {
      /* the TODAY marker and the budget rule are HTML (they drop and draw on the compositor) */
      var todayTxt = t('charts.today_caps'), tw0 = charts.textW(todayTxt, 11, true, 600) + 4;
      hl += '<i class="pmu-hnow is-today" style="left:' + r1(xtd) + 'px;top:' + r1(pad.t - 2) + 'px;height:' + r1(ph + 2) + 'px"><b></b></i>';
      var labX = xtd - 7 - tw0 < pad.l + 2 ? xtd + 7 : xtd - 7 - tw0, labY = pad.t + 3;
      hl += '<span class="pmu-hlab is-today" style="left:' + r1(labX) + 'px;top:' + r1(labY) + 'px">' + esc(todayTxt) + '</span>';
      if (budget > 0) {
        var yb = Y(budget), btxt = t('charts.budget_label', { value: charts.fmtValue(budget, 'usd').replace(/\.00$/, '') }), bw = charts.textW(btxt, 11, true) + 4;
        var by = yb - 16;
        /* the budget words never sit on the TODAY words: below the rule when they would meet */
        if (Math.abs(by - labY) < 14 && pad.l + 4 < labX + tw0 && pad.l + 4 + bw > labX) by = yb + 4;
        hl += '<i class="pmu-hrule" data-role="budget" style="left:' + r1(pad.l) + 'px;top:' + r1(yb) + 'px;width:' + r1(pw) + 'px"></i>' +
          '<span class="pmu-hlab" data-role="budget" style="left:' + r1(pad.l + 4) + 'px;top:' + r1(by) + 'px">' + esc(btxt) + '</span>';
      } else hl += '<span class="pmu-hlab" style="left:' + r1(pad.l + 4) + 'px;top:' + r1(pad.t - 18) + 'px">' + esc(t('charts.no_budget')) + '</span>';
    }
    swapAxes(f, { W: W, H: Hh, pad: pad, pw: pw, ph: ph, ya: ya, yMin0: true, noY: compact, unitA: '', vgrid: false,
      ylab: function (i) { return charts.fmtAxis(ya.step * i, 'usd', ya.step); }, xt: xt, extra: extra }, live ? 'live' : morph);
    c._bgeo = { W: W, ph: ph, xNow: xtd, pad: pad, pw: pw, days: days, top: ya.top, ya: ya, xLast: null };
    if (compact) f.axes.innerHTML = '';
    f.plot.setAttribute('width', W); f.plot.setAttribute('height', Hh);
    f.over.setAttribute('width', W); f.over.setAttribute('height', Hh);
    var pts = []; cum.forEach(function (v, i) { if (finite(v)) pts.push([X(i + 1), Y(v)]); });
    if (pts.length) c._bgeo.xLast = pts[pts.length - 1][0];
    /* the flyer map (C3-5): the budget repeats on Overview and Costs (chart:budget); its domain is the month x [0, top] */
    if (!compact) charts.setFly(c, f.box, c.opts.share || spec.share || 'budget', { shareEl: f.rv,
      box: { l: pad.l, t: pad.t, w: pw, h: ph }, domain: { x0: 1, x1: days, y0: 0, y1: ya.top },
      boxOf: function (d) { var l = X(d.x0), r = X(d.x1); return { l: l, t: Y(d.y1), w: r - l, h: Y(d.y0) - Y(d.y1) }; },
      paths: function () { return $$('path[data-mark="area"], path[data-mark="glow"], path[data-mark="line"]', f.plot); } });
    var s = '', fs = '';
    /* the projection (an estimate: dashed, hatched cone, hollow marker, never lit) lives in the overlay root, so it opens
       as one layer after the comet passes today */
    if (pr && finite(pr.to) && pts.length && !compact) {
      var last = pts[pts.length - 1], ex = X(days);
      if (finite(pr.lo) && finite(pr.hi)) fs += '<path class="pmu-mark" data-mark="band" data-series-role="forecast" data-series-index="0" d="M' + r1(last[0]) + ',' + r1(last[1]) + 'L' + r1(ex) + ',' + r1(Y(pr.hi)) + 'L' + r1(ex) + ',' + r1(Y(pr.lo)) + 'Z"/>' +
        '<path class="pmu-mark" data-mark="cone" data-series-index="0" d="M' + r1(last[0]) + ',' + r1(last[1]) + 'L' + r1(ex) + ',' + r1(Y(pr.hi)) + 'L' + r1(ex) + ',' + r1(Y(pr.lo)) + 'Z"/>';
      fs += '<path class="pmu-mark" data-mark="forecast" data-series-role="forecast" data-series-index="0" d="M' + r1(last[0]) + ',' + r1(last[1]) + 'L' + r1(ex) + ',' + r1(Y(pr.to)) + '"/>';
      hl += charts.dotHtml(ex, Y(pr.to), { idx: 0 }, { hollow: true, attrs: ' data-series-role="forecast" data-proj="1"' });
    }
    if (pts.length > 1) s += '<path class="pmu-mark" data-mark="area" data-series-index="0" d="' + charts.monoD(pts) + 'L' + r1(pts[pts.length - 1][0]) + ',' + r1(pad.t + ph) + 'L' + r1(pts[0][0]) + ',' + r1(pad.t + ph) + 'Z"/>';
    if (pts.length > 1 && !compact) s += '<path class="pmu-mark" data-mark="glow" data-series-index="0" d="' + charts.monoD(pts) + '"/>';
    if (pts.length) {
      s += '<path class="pmu-mark" data-mark="line" data-primary="1" data-series-index="0" d="' + charts.monoD(pts) + '"/>' +
        (compact ? '' : '<path class="pmu-mark" data-mark="core" data-series-index="0" d="' + charts.monoD(pts) + '"/>');
      hl += charts.dotHtml(pts[pts.length - 1][0], pts[pts.length - 1][1], { idx: 0 }, { halo: !compact, size: compact ? 'xs' : '' });
    }
    if (live) {
      var lo0 = c._live || {};
      var twP = f._pS !== s ? charts.livePatchSvg(f.plot, s, 420, lo0.delay) : null, twO = f._pO !== fs ? charts.livePatchSvg(f.over, fs, 420, lo0.delay) : null;
      if (twP) c._liveAnims++;
      if (twO) c._liveAnims++;
      /* the today dot and the projection's hollow marker ride the paths' tween (both tweens share duration, delay and first
         frame; charts.ride, item 3) */
      if (f._pH !== hl) c._liveAnims += slideMarks(f.hl, hl, lo0, twP || twO);
    } else { charts.patchSvg(f.plot, s); charts.patchSvg(f.over, fs); charts.patchHtml(f.hl, hl); }
    f._pS = s; f._pO = fs; f._pH = hl;
    if (!compact) {
      var n = days, lineAt = null;
      var cfg = {
        n: n, pad: { t: pad.t, h: ph, l: pad.l, r: pad.r }, xAt: function (i) { return X(i + 1); },
        /* on the spend line up to its last point, then on the projection's straight line to the period's end */
        yAt: function (k, x) {
          if (k || !pts.length) return null;
          var lp = pts[pts.length - 1];
          if (x <= lp[0] + 0.01) { if (!lineAt) lineAt = runsAt(pts.map(function (q) { return q[0]; }), pts.map(function (q) { return q[1]; })); return lineAt(x); }
          if (!pr || !finite(pr.to) || !finite(cum[cum.length - 1])) return null;
          var xa = X(cum.length), xb = X(days), ya0 = Y(cum[cum.length - 1]), yb0 = Y(pr.to);
          return xb > xa ? ya0 + (yb0 - ya0) * clamp((x - xa) / (xb - xa), 0, 1) : ya0;
        },
        dots: function (i) {
          if (i < cum.length && finite(cum[i])) return [{ y: Y(cum[i]), key: { idx: 0 } }];
          if (pr && finite(pr.to) && cum.length) { var a = cum[cum.length - 1], fr = (i + 1 - cum.length) / Math.max(1, days - cum.length); return [{ y: Y(a + (pr.to - a) * fr), key: { idx: 0 } }]; }
          return [];
        },
        html: function (i) {
          var ro = charts.ro, h = ro.title(charts.time.wmd(dayMs(i + 1)).toUpperCase());
          if (i < cum.length && finite(cum[i])) {
            var day = cum[i] - (i > 0 && finite(cum[i - 1]) ? cum[i - 1] : 0);
            h += ro.row({ idx: 0 }, t('charts.day_spend'), charts.fmtValue(day, 'usd')) + ro.row({ idx: 0 }, t('charts.cumulative'), charts.fmtValue(cum[i], 'usd'), 'is-total', 'line');
            if (budget > 0) h += ro.row({ idx: 'ink' }, t('charts.budget_left'), charts.fmtValue(Math.max(0, budget - cum[i]), 'usd'));
            if (spec.source) h += ro.foot(spec.source);
          } else if (pr && cum.length) {
            var a = cum[cum.length - 1], fr = (i + 1 - cum.length) / Math.max(1, days - cum.length);
            h += ro.row({ idx: 0 }, t('charts.projected'), '≈ ' + charts.fmtValue(a + (pr.to - a) * fr, 'usd'), 'is-total', 'dash');
            h += ro.foot(pr.label || t('charts.projection_source'));
          }
          return h;
        }
      };
      if (c._hover) c._hover.set(cfg); else c._hover = charts.hover(f.box, cfg);
    }
  }

  /* ================= heat: weekday x hour grid (A1 7.7), DOM cells painted from the precomputed heat steps ================= */
  charts.heat = function (host, spec, opts) {
    return charts.make('heat', host, spec, opts, {
      flow: true,
      draw: function (c, first) { drawHeat(c, first); },
      update: function (c) {
        drawHeat(c, false, true);
        var g = c.el.querySelector('.pmu-heatgrid');
        if (g) Mo.anim(g, [{ opacity: 0.45 }, { opacity: 1 }], 360, 0, Mo.EASE.out, 'none');
      },
      enter: function (c, delay) {
        /* quiet (C3-3): the grid arrives with its body, no wash and no peak flash */
        if (c._quiet) return;
        /* a diagonal wash: each weekday row slides in from the left while it fades (one layer per row, not one per cell,
           so the entrance stays cheap on the CPU-only VM; A1 8.4 fallback) */
        var fm = Mo.fam(), stepped = fm === 'retro' || fm === 'nier', rows = $$('.pmu-hrow', c.el);
        rows.forEach(function (el, r) {
          Mo.anim(el, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], stepped ? 240 : 520, delay + 36 * r, stepped ? 'steps(3,jump-start)' : 'cubic-bezier(.22,.8,.28,1)');
        });
        /* the hottest cell flashes once when the wash has landed (WOW-SPEC 3.3): a lit ring swells off it */
        var pk = c.el.querySelector('.pmu-hc[data-peak]');
        if (pk && !Mo.reduced()) {
          var at = delay + 36 * rows.length + (stepped ? 240 : 420);
          Mo.anim(pk, [{ opacity: 0.6 }, { opacity: 1 }], 300, at, Mo.EASE.out, 'none');
          var fl = H('i', 'pmu-hpeakfx', pk);
          var a = Mo.anim(fl, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1.15)', offset: 0.3 }, { opacity: 0, transform: 'scale(1.6)' }], 620, at, 'cubic-bezier(.2,.6,.3,1)', 'both');
          if (a) a.onfinish = function () { fl.remove(); }; else fl.remove();
        }
        var lg = c.el.querySelector('.pmu-heatleg');
        if (lg && lg.firstChild) Mo.anim(lg, [{ opacity: 0 }, { opacity: 1 }], 260, delay + 420, Mo.EASE.out);
      }
    });
  };
  function heatStep(v, max) { if (!finite(v)) return -1; if (v <= 0) return 0; return Math.max(1, Math.min(6, Math.ceil(6 * Math.sqrt(v / max)))); }
  function drawHeat(c, first, morph) {
    var spec = c.spec, rows = spec.rows || [], cols = spec.cols || 24, vals = spec.values || [];
    var W = c._w, Hh = c._h, unit = spec.unit || 'tokens';
    var max = 0;
    vals.forEach(function (row) { (row || []).forEach(function (v) { if (finite(v)) max = Math.max(max, v); }); });
    var ownLeg = charts.ownLegend(c);
    var fmtV0 = spec.fmt || function (v) { return charts.fmtValue(v, unit); };
    /* the legend's lines from measured text widths (it wraps at narrow widths), so the grid leaves it room */
    var legLines = 0;
    if (!ownLeg) {
      var pk0 = null; vals.forEach(function (row) { (row || []).forEach(function (v) { if (finite(v) && (!pk0 || v > pk0)) pk0 = v; }); });
      var parts = [charts.textW(t('charts.less'), 12) + 6 + 6 * 18 + 6 + charts.textW(t('charts.more') + ' · ' + t('charts.busiest') + ' Sun 15:00 · ' + (pk0 != null ? fmtV0(pk0) : ''), 12),
        23 + charts.textW(t('charts.heat_nothing'), 12), 23 + charts.textW(t('charts.heat_outside'), 12)];
      var x0 = 0; legLines = 1;
      parts.forEach(function (pw) { if (x0 > 0 && x0 + 10 + pw > (W || 300)) { legLines++; x0 = pw; } else x0 += (x0 ? 10 : 0) + pw; });
    }
    var reserve = 20 + (ownLeg ? 0 : 12 + legLines * 17 + (legLines - 1) * 6);
    var cellH = clamp(Math.floor(((Hh || 220) - reserve - 3 * rows.length) / Math.max(1, rows.length)), 11, 26);
    var every = W < 520 ? 6 : 3;
    var fmtV = spec.fmt || function (v) { return charts.fmtValue(v, unit); };
    var labelW = 38;
    if (!c.f || c.f.sig !== rows.length + 'x' + cols) {
      c.f = { sig: rows.length + 'x' + cols };
      var html = '<div class="pmu-heatgrid" style="grid-template-columns:' + labelW + 'px repeat(' + cols + ',minmax(0,1fr))"><span></span>';
      for (var h = 0; h < cols; h++) html += '<span class="pmu-hh">' + (h % every === 0 ? esc(spec.hourLabels ? spec.hourLabels[h] : String(h).padStart(2, '0') + ':00') : '') + '</span>';
      rows.forEach(function (label, r) {
        html += '<div class="pmu-hrow" style="grid-template-columns:' + labelW + 'px repeat(' + cols + ',minmax(0,1fr))"><span class="pmu-hl">' + esc(label) + '</span>';
        for (var hh = 0; hh < cols; hh++) html += '<i class="pmu-hc pmu-mark" data-mark="cell" data-r="' + r + '" data-c="' + hh + '"></i>';
        html += '</div>';
      });
      html += '</div><div class="pmu-heatleg"></div>';
      c.el.innerHTML = html;
    }
    var grid = c.el.querySelector('.pmu-heatgrid');
    grid.style.setProperty('--hc-h', cellH + 'px');
    $$('.pmu-hh', grid).forEach(function (el, h) { el.textContent = h % every === 0 ? (spec.hourLabels ? spec.hourLabels[h] : String(h).padStart(2, '0') + ':00') : ''; });
    $$('.pmu-hc', grid).forEach(function (el) {
      var r = +el.getAttribute('data-r'), h = +el.getAttribute('data-c'), v = (vals[r] || [])[h];
      var out = spec.outside && spec.outside[r] && spec.outside[r][h];
      var step = out ? -1 : heatStep(v, max || 1);
      el.setAttribute('data-step', String(step));
      var label = rows[r] + ' ' + String(h).padStart(2, '0') + ':00';
      var req = spec.requests && spec.requests[r] ? spec.requests[r][h] : null;
      var top = spec.top ? (Array.isArray(spec.top[r]) ? spec.top[r][h] : null) : null;
      var detail = out || step < 0 ? t('charts.heat_outside') : step === 0 ? t('charts.heat_nothing') :
        fmtV(v) + (unit === 'tokens' ? ' ' + t('charts.tokens_word') : '') + (finite(req) ? ' · ' + req + ' requests' : '') + (top ? ' · top model ' + top : '') + (spec.detail ? spec.detail(r, h) : '');
      el.setAttribute('data-pm-hover-label', label);
      el.setAttribute('data-pm-hover-detail', detail);
      el.setAttribute('aria-label', label + ': ' + detail);
    });
    var pk = spec.peak;
    if (!pk) {
      var best = null;
      vals.forEach(function (row, r) { (row || []).forEach(function (v, h) { if (finite(v) && (!best || v > best.v)) best = { r: r, c: h, v: v }; }); });
      if (best) pk = { row: best.r, col: best.c, label: rows[best.r] + ' ' + String(best.c).padStart(2, '0') + ':00 · ' + fmtV(best.v) };
    }
    var lg = c.el.querySelector('.pmu-heatleg');
    var chips = ''; for (var s = 1; s <= 6; s++) chips += '<i data-step="' + s + '"></i>';
    lg.style.display = ownLeg ? 'none' : '';
    if (!ownLeg) charts.patchHtml(lg, '<span>' + esc(t('charts.less')) + '</span><span class="pmu-hs">' + chips + '</span><span>' + esc(t('charts.more')) +
      (pk ? ' · ' + esc(t('charts.busiest')) + ' <b>' + esc(pk.label) + '</b>' : '') + '</span>' +
      '<span class="pmu-hs-key is-first"><i data-step="0"></i>' + esc(t('charts.heat_nothing')) + '</span><span class="pmu-hs-key"><i data-step="-1"></i>' + esc(t('charts.heat_outside')) + '</span>');
    if (pk) { var pc = c.el.querySelector('.pmu-hc[data-r="' + pk.row + '"][data-c="' + pk.col + '"]'); if (pc) pc.setAttribute('data-peak', '1'); }
    void morph;
  }

  /* ================= qspark: quota history row (step runs) and the focus chart (A1 7.9) ================= */
  charts.qspark = function (host, spec, opts) {
    var focus = !!(spec && spec.windows);
    return charts.make(focus ? 'qfocus' : 'qspark', host, spec, opts, focus ? {
      draw: function (c, first) { drawQFocus(c, first); },
      update: function (c) { drawQFocus(c, false, true); },
      enter: function (c, delay) { enterPlot(c, delay, 760); }
    } : {
      draw: function (c, first) { drawQRow(c, first); },
      update: function (c) { drawQRow(c, false); },
      /* live (C3-4): the last segment morphs (one path tween, 420) and an exhausted span grows from its right edge */
      live: function (c, prev, lo) { c._live = lo; c._liveAnims = 0; try { drawQRow(c, false, !lo.still); } finally { c._live = null; } return { anims: c._liveAnims || 0 }; },
      /* the mini line draws 600 ms (no comet on minis), then each exhausted span fills in from the left 300 ms */
      enter: function (c, delay) {
        if (!c.f) return;
        c.f.rv.style.visibility = '';
        var fm = Mo.fam(), q = c._quiet;
        Mo.reveal(c.f.rv, c.f.rvin, 600, delay, 'x', fm === 'nier' || fm === 'retro' ? 'steps(10,jump-start)' : Mo.voice('draw'), { quiet: true });
        /* quiet: the exhausted spans appear with the line's end in one fade of their layer */
        if (q) { if (c.f.hl.firstChild) Mo.anim(c.f.hl, [{ opacity: 0 }, { opacity: 1 }], 200, delay + 540, Mo.EASE.out, 'backwards'); return; }
        $$('.pmu-qx', c.f.hl).forEach(function (el) { Mo.anim(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 300, delay + 600, fm === 'nier' || fm === 'retro' ? 'steps(4,jump-start)' : 'cubic-bezier(.16,1,.3,1)'); });
      }
    });
  };
  function toneOf(v, spec) {
    if (!finite(v)) return null;
    if (spec.toneOf) return spec.toneOf(v);
    if (PMU.roster && PMU.roster.tone) { var tn = PMU.roster.tone(v); if (tn === 'hot') tn = 'crit'; if (tn === 'watch') tn = 'calm'; return tn || 'calm'; }
    return v > 100 ? 'over' : v >= 100 ? 'exhausted' : v >= 90 ? 'crit' : v >= 80 ? 'warn' : 'calm';
  }
  /* runs from points: each reading holds until the next; a null ends the run; a reset starts a new run with no connector;
     each run takes its own state colour */
  function qRuns(spec) {
    var numeric = Array.isArray(spec.points) && spec.points.some(finite);
    if (spec.runs && !numeric) return spec.runs.map(function (r) {
      if (Array.isArray(r.v)) {
        var n0 = r.v.length, w = (r.x1 - r.x0) / Math.max(1, n0), p = [];
        r.v.forEach(function (v, k) { p.push([r.x0 + k * w, v], [r.x0 + (k + 1) * w, v]); });
        return { x0: r.x0, x1: r.x1, pts: p, tone: r.tone || toneOf(r.v[0], spec), from: r.from };
      }
      return { x0: r.x0, x1: r.x1, pts: r.pts || [[r.x0, r.v], [r.x1, r.v]], tone: r.tone || toneOf(r.v, spec), from: r.from };
    });
    var vals = spec.points || spec.values || [], n = vals.length, resets = {};
    (spec.resets || []).forEach(function (i) { resets[i] = true; });
    var out = [], cur = null;
    for (var i = 0; i < n; i++) {
      var v = vals[i], x0 = n > 1 ? i / n : 0, x1 = n > 1 ? (i + 1) / n : 1;
      if (!finite(v)) { cur = null; continue; }
      var tone = (spec.tones && spec.tones[i]) || toneOf(v, spec);
      var prevV = i > 0 ? vals[i - 1] : null;
      if (finite(prevV) && v < prevV - 4) resets[i] = true;
      if (cur && !resets[i] && cur.tone === tone) { cur.pts.push([x0, v], [x1, v]); cur.x1 = x1; }
      else {
        var fromV = cur && !resets[i] ? cur.pts[cur.pts.length - 1][1] : null;
        cur = { x0: x0, x1: x1, pts: [[x0, v], [x1, v]], tone: tone, from: fromV };
        out.push(cur);
      }
    }
    return out;
  }
  /* a quota history row (LOOK-REVIEW-2 item 3, WOW-SPEC 3.10): 30 px, each state run a step line over a vertical
     gradient of its tone, the dashed 100 % reference on top; a run at or over 100 % (exhausted) is a warm red hatched
     span laid over the row in HTML, so it can fill in from the left on the compositor after the line has drawn */
  function drawQRow(c, first, live) {
    var spec = c.spec, f = c.f, Hh = spec.height || 30;
    if (!f) {
      f = c.f = {};
      f.rv = H('div', 'pmu-rv', c.el); f.rvin = H('div', 'pmu-rv-in', f.rv);
      f.plot = S('svg', { class: 'pmu-plot pmu-qsvg', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, f.rvin);
      f.hl = H('div', 'pmu-qspans', c.el);
    }
    f.plot.setAttribute('viewBox', '0 0 600 ' + Hh);
    var Y = function (v) { return Hh - 1.5 - clamp(v, 0, 104) / 100 * (Hh - 4.5); };
    var s = spec.ref100 !== false ? '<path class="pmu-qref" d="M0 ' + r1(Y(100)) + 'H600"/>' : '', spans = '';
    qRuns(spec).forEach(function (run) {
      var p = run.pts.map(function (q) { return [q[0] * 600, Y(q[1])]; });
      var d = 'M' + r1(p[0][0]) + ',' + r1(p[0][1]);
      for (var i = 1; i < p.length; i++) d += (p[i][1] !== p[i - 1][1] ? 'V' + r1(p[i][1]) : '') + 'H' + r1(p[i][0]);
      var fill = d + 'V' + Hh + 'H' + r1(p[0][0]) + 'Z';
      var conn = finite(run.from) ? '<path class="pmu-mark" data-mark="line" data-q="1" data-tone="' + run.tone + '" d="M' + r1(p[0][0]) + ',' + r1(Y(run.from)) + 'V' + r1(p[0][1]) + '"/>' : '';
      s += '<path class="pmu-mark" data-mark="area" data-q="1" data-tone="' + run.tone + '" d="' + fill + '"/>' + conn +
        '<path class="pmu-mark" data-mark="line" data-q="1" data-tone="' + run.tone + '" d="' + d + '"/>';
      if (run.tone === 'exhausted' || run.tone === 'over') spans += '<i class="pmu-qx" data-tone="' + run.tone + '" style="left:' + r1(run.x0 * 100) + '%;width:' + r1(Math.max(0.6, (run.x1 - run.x0) * 100)) + '%"></i>';
    });
    if (live) {
      var lo1 = c._live || {}, oldSpans = $$('.pmu-qx', f.hl).map(function (el) { return parseFloat(el.style.width); });
      if (charts.livePatchSvg(f.plot, s, 420, lo1.delay)) c._liveAnims++;
      charts.patchHtml(f.hl, spans);
      $$('.pmu-qx', f.hl).forEach(function (el, i) {
        var w0 = oldSpans[i], w1 = parseFloat(el.style.width);
        if (finite(w1) && w1 > 0 && (!finite(w0) || Math.abs(w0 - w1) > 0.05)) {
          /* a growing exhausted span grows from its right edge */
          el.style.transformOrigin = '100% 50%';
          if (Mo.anim(el, [{ transform: 'scaleX(' + clamp(finite(w0) ? w0 / w1 : 0, 0, 1) + ')' }, { transform: 'none' }], 420, lo1.delay || 0, 'cubic-bezier(.16,1,.3,1)', 'backwards')) c._liveAnims++;
        }
      });
    } else { charts.patchSvg(f.plot, s); charts.patchHtml(f.hl, spans); }
    c.el.style.height = Hh + 'px';
  }
  var DASHES = ['', '9 4', '9 3 2 3', '2 3'];
  /* focus windows may carry readings as {t, v, reset} or as a plain array of numbers spaced bucketMs apart ending now */
  function focusPoints(spec, w) {
    var pts = w.points || [];
    if (!pts.length || typeof pts[0] === 'object') return pts;
    var n = pts.length, now = spec.now || Date.now(), step = spec.bucketMs || 4 * HOUR, out = [];
    pts.forEach(function (v, i) {
      var prev = i > 0 ? pts[i - 1] : null;
      out.push({ t: now - (n - i) * step, v: finite(v) ? v : null, reset: finite(v) && finite(prev) && v < prev - 4 });
    });
    return out;
  }
  function drawQFocus(c, first, morph) {
    var spec = c.spec, f = frame(c);
    var wins = (spec.windows || []).map(function (w) { return Object.assign({}, w, { points: focusPoints(spec, w) }); });
    var items = wins.map(function (w, i) { return { key: 'W' + i, name: w.label, swatch: i ? 'dash' : 'line', idx: 'ink' }; });
    var legendH = setLegend(c, items, function (k) { c._iso = k; paintIso(c); });
    var d = dims(c, 220), W = d.W, Hh = d.H - legendH;
    f.box.style.height = Hh + 'px';
    var now = spec.now || Date.now();
    var t0 = spec.t0, t1 = spec.t1 || now;
    wins.forEach(function (w) { (w.points || []).forEach(function (p) { if (!finite(t0) || p.t < t0) t0 = p.t; }); });
    if (!finite(t0)) t0 = now - 7 * DAY;
    var pad = { l: 44, r: 14, t: 20, b: 28 }, ph = Math.max(40, Hh - pad.t - pad.b), pw = Math.max(40, W - pad.l - pad.r);
    var X = function (tt) { return pad.l + (tt - t0) / Math.max(1, t1 - t0) * pw; };
    var Y = function (v) { return pad.t + ph - clamp(v, 0, 104) / 100 * ph; };
    var xt = charts.xTicks(t0, t1, HOUR, pw).map(function (tk) { return { x: X(tk.t), label: tk.label, major: tk.major }; });
    var extra = '';
    var th = spec.thresholds || {};
    [['warn', th.warn, th.warnLabel], ['switch', th.switch, th.switchLabel]].forEach(function (row) {
      if (!finite(row[1])) return;
      var y = r1(Y(row[1])) + 0.5;
      extra += '<path class="pmu-limit" data-role="' + row[0] + '" d="M' + pad.l + ' ' + y + 'H' + (pad.l + pw) + '"/>';
      extra += '<text class="pmu-tick is-limit" data-role="' + row[0] + '" x="' + (pad.l + pw - 2) + '" y="' + (y - 5) + '" text-anchor="end">' +
        esc(row[2] || (row[0] === 'switch' ? t('charts.switch_at', { pct: row[1] }) : t('charts.warn_at', { pct: row[1] }))) + '</text>';
    });
    (spec.resets || []).forEach(function (tt) { if (tt > t0 && tt < t1) { var x = r1(X(tt)); extra += '<path class="pmu-reset" d="M' + x + ' ' + pad.t + 'V' + (pad.t + ph) + '"/>'; } });
    var xn = r1(X(Math.min(now, t1)));
    extra += '<path class="pmu-now is-strong" d="M' + xn + ' ' + (pad.t - 2) + 'V' + (pad.t + ph) + '"/>';
    var ya = { step: 25, top: 100, k: 4 };
    swapAxes(f, { W: W, H: Hh, pad: pad, pw: pw, ph: ph, ya: ya, yMin0: true, unitA: '',
      ylab: function (i) { return (25 * i) + '%'; }, xt: xt, extra: extra }, morph);
    $$('.pmu-grid', f.axes).forEach(function (g, i) { if (i === 4) g.classList.add('is-100'); });
    f.plot.setAttribute('width', W); f.plot.setAttribute('height', Hh);
    f.over.setAttribute('width', W); f.over.setAttribute('height', Hh);
    var s = '', hl = '';
    wins.forEach(function (w, i) {
      var pts = (w.points || []).filter(function (p) { return finite(p.v); });
      var dash = w.dash != null ? w.dash : DASHES[i % DASHES.length];
      /* steps: hold each reading; break at nulls (gaps) and at resets (no connector) */
      var segs = [], cur = null, all = w.points || [];
      all.forEach(function (p, k) {
        if (!finite(p.v)) { cur = null; return; }
        if (!cur || p.reset) { cur = []; segs.push(cur); }
        var next = all[k + 1];
        cur.push([X(p.t), Y(p.v)], [X(next ? next.t : Math.min(now, t1)), Y(p.v)]);
      });
      segs.forEach(function (seg) {
        var dd = 'M' + r1(seg[0][0]) + ',' + r1(seg[0][1]);
        for (var q = 1; q < seg.length; q++) dd += (seg[q][1] !== seg[q - 1][1] ? 'V' + r1(seg[q][1]) : '') + 'H' + r1(seg[q][0]);
        s += '<path class="pmu-mark" data-mark="line" data-series-index="ink" data-focus="1" data-key="W' + i + '"' + (dash ? ' style="stroke-dasharray:' + dash + '"' : '') + ' d="' + dd + '"/>';
      });
      if (pts.length) { var lp = pts[pts.length - 1]; hl += charts.dotHtml(Math.min(X(now), pad.l + pw), Y(lp.v), { tone: toneOf(lp.v, spec) || 'calm' }, { key: 'W' + i, halo: i === 0 }); }
    });
    charts.patchSvg(f.plot, s);
    charts.patchHtml(f.hl, hl);
    /* readout: the nearest sample time across windows */
    var times = [];
    wins.forEach(function (w) { (w.points || []).forEach(function (p) { if (times.indexOf(p.t) < 0) times.push(p.t); }); });
    times.sort(function (a, b) { return a - b; });
    var valAt = function (w, tt) { var v = null; (w.points || []).forEach(function (p) { if (p.t <= tt) v = p.v; }); return v; };
    var cfg = {
      n: times.length, pad: { t: pad.t, h: ph, l: pad.l, r: pad.r }, xAt: function (i) { return X(times[i]); },
      /* the window's step line: each reading holds until the next */
      yAt: function (k, x) { var w = wins[k]; if (!w) return null; var v = valAt(w, t0 + (x - pad.l) / Math.max(1, pw) * (t1 - t0) + 1); return finite(v) ? Y(v) : null; },
      dots: function (i) { return wins.map(function (w) { var v = valAt(w, times[i]); return { y: finite(v) ? Y(v) : null, key: { idx: 'ink' }, ink: true }; }); },
      html: function (i) {
        var ro = charts.ro, h = ro.title((charts.time.wmd(times[i]) + ' · ' + charts.time.clock(times[i])).toUpperCase());
        wins.forEach(function (w, k) { var v = valAt(w, times[i]); h += ro.row({ idx: 'ink' }, w.label, finite(v) ? Math.round(v * 10) / 10 + '% used' : PMU.vs.STATES.unknown.word, '', k ? 'dash' : 'line'); });
        if (spec.source) h += ro.foot(spec.source);
        return h;
      }
    };
    if (c._hover) c._hover.set(cfg); else c._hover = charts.hover(f.box, cfg);
    paintIso(c);
  }

  /* ================= rangebars: tool latency p50 to p95 on a log axis (A1 7.11) ================= */
  charts.rangebars = function (host, spec, opts) {
    return charts.make('rangebars', host, spec, opts, {
      flow: true,
      draw: function (c, first) { drawRange(c, first); },
      update: function (c) { drawRange(c, false); },
      /* the p50 mark pops, then the p50 -> p95 bar grows right 520 ms ROLL with the head glow, rows 36 ms apart (WOW-SPEC 3.3) */
      enter: function (c, delay) {
        var fm = Mo.fam(), e = fm === 'retro' ? 'steps(6,jump-start)' : fm === 'nier' ? 'steps(5,jump-start)' : 'cubic-bezier(.16,1,.3,1)', q = c._quiet, last = delay;
        $$('.pmu-rrow', c.el).forEach(function (row, i) {
          var dl = delay + Math.min(560, i * 36), bar = row.querySelector('.pmu-rbar'), p50 = row.querySelector('.pmu-rp50');
          if (p50 && !q) charts.popDot(p50, dl, 220);
          if (!bar) return;
          Mo.anim(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 520, (q ? delay : dl + 140), e);
          last = Math.max(last, dl + 140 + 520);
          var a = parseFloat(bar.style.left), w = parseFloat(bar.style.width);
          if (!q && PMU.film && PMU.film.headGlow && finite(a) && w > 3) PMU.film.headGlow(bar.parentNode, { from: a, to: a + w, dur: 520, delay: dl + 140, easing: e });
        });
        c.el.classList.remove('is-pre');
        /* the Tools hero's beat (WOW-SPEC-3 7, C3-6): the slowest tool's p95 head rings once when the bars have landed */
        if (!q && charts.isHero(c)) c.beatEnd = rangeBeat(c, last + 80) - delay;
      },
      beat: function (c, delay) { return rangeBeat(c, delay); }
    });
  };
  /* the ring on the slowest tool: in the warn tone when the row is past its own budget (spec row.budget), otherwise in
     its series light (the data has no per-tool budget: an honest "slowest", not an invented "over budget") */
  function rangeBeat(c, at) {
    if (Mo.reduced()) return at;
    var rows = (c.spec && c.spec.rows) || [], best = -1;
    rows.forEach(function (r, i) { if (finite(r.p95) && (best < 0 || r.p95 > rows[best].p95)) best = i; });
    var row = best >= 0 ? $$('.pmu-rrow', c.el)[best] : null, bar = row && row.querySelector('.pmu-rbar');
    if (!bar || !PMU.film || !(PMU.film.halo || PMU.film.ring)) return at;
    var r = rows[best], over = finite(r.budget) && r.p95 > r.budget;
    var tip = H('i', 'pmu-rtip', bar.parentNode);
    tip.style.left = (parseFloat(bar.style.left) + parseFloat(bar.style.width)) + '%';
    var a = PMU.film.halo ? PMU.film.halo(tip, { tone: over ? 'warn' : null, delay: at, dur: 700 }) : PMU.film.ring(tip, { delay: at });
    if (a) a.finished.then(function () { tip.remove(); }, function () { tip.remove(); }); else tip.remove();
    return at + 700;
  }
  function drawRange(c, first) {
    var spec = c.spec, rows = spec.rows || [];
    var lo = Math.log10(spec.min || 0.1), hi = Math.log10(spec.max || 30);
    var P = function (v) { return clamp((Math.log10(Math.max(v, spec.min || 0.1)) - lo) / (hi - lo) * 100, 0, 100); };
    var ticks = (spec.ticks || [0.1, 1, 10, 30]).filter(function (v) { return v >= (spec.min || 0.1) && v <= (spec.max || 30); });
    var html = '<div class="pmu-raxis"><span></span><span class="pmu-raxis-t">' + ticks.map(function (v) { return '<i style="left:' + P(v) + '%">' + esc(charts.fmtAxis(v, 's')) + '</i>'; }).join('') + '</span><span></span></div>';
    rows.forEach(function (r) {
      var a = P(r.p50), b = P(r.p95);
      html += '<div class="pmu-rrow" data-pm-hover-label="' + esc(r.name) + '" data-pm-hover-detail="' + esc('p50 ' + charts.fmtValue(r.p50, 's') + ' · p95 ' + charts.fmtValue(r.p95, 's') +
        (finite(r.calls) ? ' · ' + r.calls + ' calls' : '') + (finite(r.errors) ? ' · ' + r.errors + ' errors' : '')) + '">' +
        '<span class="pmu-rname">' + esc(r.name) + '</span><span class="pmu-rtrack">' +
        ticks.map(function (v) { return '<i class="pmu-rgrid" style="left:' + P(v) + '%"></i>'; }).join('') +
        '<i class="pmu-rbar pmu-mark" data-mark="bar" data-series-index="' + (r.idx != null ? r.idx : 0) + '"' + (r.tone ? ' data-tone="' + r.tone + '"' : '') + ' style="left:' + a + '%;width:' + Math.max(0.8, b - a) + '%"></i>' +
        '<i class="pmu-rp50" style="left:' + a + '%"></i></span><span class="pmu-rval"><b>' + esc(charts.fmtValue(r.p50, 's')) + '</b> · ' + esc(charts.fmtValue(r.p95, 's')) + '</span></div>';
    });
    charts.patchHtml(c.el, html);
  }

  /* timeline is withdrawn (A1 7.10: the agenda kind renders DOM rows); kept as a quiet placeholder so old calls do not throw */
  if (!charts.timeline) charts.timeline = charts.placeholder('timeline');
})();
