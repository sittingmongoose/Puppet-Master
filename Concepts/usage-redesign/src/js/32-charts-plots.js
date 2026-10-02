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
    return f;
  }
  /* legend height without layout: lines from the measured text widths */
  function legendLines(items, w) {
    if (!items || !items.length) return 0;
    var lines = 1, x = 0;
    items.forEach(function (it) {
      var iw = it.compact ? 10 + 5 + 14 : 10 + 7 + charts.textW(it.name, 12.5) + (it.qual ? 6 + charts.textW(it.qual, 12) : 0) + (it.valueText ? 6 + charts.textW(it.valueText, 12.5, false, 600) : 0);
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
  function drawAxes(svg, g) {
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
    svg.innerHTML = s + (g.extra || '');
  }
  /* cross-fade the static axes layer on a morph (380 ms) */
  function swapAxes(f, g, morph) {
    if (!morph || Mo.reduced()) { drawAxes(f.axes, g); return; }
    var old = f.axes, next = S('svg', { class: 'pmu-axes', 'aria-hidden': 'true' });
    drawAxes(next, g);
    f.box.insertBefore(next, old.nextSibling);
    f.axes = next;
    Mo.anim(next, [{ opacity: 0 }, { opacity: 1 }], 380, 0, Mo.EASE.io, 'backwards');
    var a = Mo.anim(old, [{ opacity: 1 }, { opacity: 0 }], 380, 0, Mo.EASE.io, 'forwards');
    if (a) a.onfinish = function () { old.remove(); }; else old.remove();
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
  function mix(a, b, k) { return !finite(b) ? null : !finite(a) ? b : a + (b - a) * k; }

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
      enter: function (c, delay) { enterPlot(c, delay); }
    });
  };
  function areaModel(spec) {
    var series = (spec.series || []).map(function (s, i) { return Object.assign({ _i: i, _tk: tkOf(s) }, s); });
    var token = series.length > 0 && series.every(function (s) { return s._tk; });
    var n = 0; series.forEach(function (s) { n = Math.max(n, (s.values || []).length); });
    var byTk = {}; series.forEach(function (s) { if (s._tk) byTk[s._tk] = s; });
    return { series: series, token: token, n: n, byTk: byTk };
  }
  function drawArea(c, mode, prevSpec) {
    var spec = c.spec, m = areaModel(spec), f = frame(c), tw = tierW(c);
    var compact = !!COMPACT[tw] || c.opts.compact;
    c.el.setAttribute('data-compact', compact ? '1' : '0');
    /* token series stack by type when split is on, or when a widget asks for stacked bands without the split switch
       (reasoning mix: visible output and reasoning) */
    var split = (spec.split != null ? !!spec.split : !!spec.stacked) && m.token, cacheReads = spec.cacheReads != null ? !!spec.cacheReads : !m.byTk.in;
    var include = function (tk) { return tk !== 'cr' || cacheReads; };
    /* legend */
    var items = [];
    if (!compact) {
      if (m.token) {
        if (split) TK_ORDER.forEach(function (tk) { if (m.byTk[tk] && include(tk)) items.push({ key: tk, name: TK_NAMES[tk], tk: tk }); });
        else items.push({ key: 'all', name: cacheReads ? t('charts.all_tokens') : t('charts.tokens_wo_cache'), qual: spec.cost ? t('charts.left_axis') : '', tk: 'all' });
        if (spec.cost) items.push({ key: 'cost', name: t('charts.est_cost'), qual: t('charts.right_axis_usd'), swatch: 'line', idx: 'ink' });
      } else m.series.forEach(function (s) { items.push({ key: 'S' + s._i, name: s.name, idx: s.idx != null ? s.idx : s._i, vendor: s.vendor, tk: s.tk, swatch: s.role === 'forecast' ? 'dash' : 'box' }); });
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
      pad = { l: 2, r: 2, t: 6, b: 2 };
      ph = Math.max(16, Hh - pad.t - pad.b); pw = Math.max(20, W - 4);
      sc = { a: charts.nice(maxA * 1.04, 2), b: null };
    } else {
      pad = { l: 44, r: 14, t: 28, b: 30 };
      ph = Math.max(30, Hh - pad.t - pad.b);
      sc = charts.scales(maxA, maxB, ph);
      var labsA = [], labsB = [];
      for (var k = 0; k <= sc.a.k; k++) { labsA.push(charts.fmtAxis(sc.a.step * k, unit, sc.a.step)); if (sc.b) labsB.push(charts.fmtAxis(sc.b.step * k, 'usd', sc.b.step)); }
      pad.l = Math.max(44, Math.ceil(axisW(labsA.concat([spec.unitTitle || charts.unitTitle(unit)]))) + 14);
      if (sc.b) pad.r = Math.max(40, Math.ceil(axisW(labsB.concat(['USD']))) + 14);
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
    var cs = cost ? sampleRuns(mxs, dup(cost), N, x0, x1).map(function (v) { return finite(v) ? YB(v) : null; }) : null;
    var geo = { W: W, H: Hh, pad: pad, pw: pw, ph: ph, x0: x0, x1: x1, lv: lv, tot: tot, base: base, cs: cs, N: N, sc: sc, compact: compact, split: split,
      stacked: stacked, token: m.token, keys: incSeries.map(function (s) { return s._tk || ('S' + s._i); }) };
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
      swapAxes(f, { W: W, H: Hh, pad: pad, pw: pw, ph: ph, ya: sc.a, yb: sc.b, yMin0: true, unitA: spec.unitTitle || charts.unitTitle(unit), unitB: sc.b ? 'USD' : '',
        ylab: function (i) { return charts.fmtAxis(sc.a.step * i, unit, sc.a.step); }, ylab2: function (i) { return charts.fmtAxis(sc.b.step * i, 'usd', sc.b.step); },
        xt: xt, extra: extra }, mode === 'morph');
    } else { f.axes.innerHTML = ''; }
    /* plot layer */
    var P = c.P;
    var sig = (m.token ? 'tk' : 'g') + '|' + geo.keys.join(',') + '|' + (cost ? 1 : 0) + '|' + stacked + '|' + compact;
    if (!P || c._psig !== sig) {
      c._psig = sig;
      f.plot.innerHTML = '';
      P = c.P = { bands: [], edges: [] };
      var gTot = P.gTot = S('g', { class: 'pmu-g-total' }, f.plot);
      var gBands = P.gBands = S('g', { class: 'pmu-g-bands' }, f.plot);
      if (m.token) {
        P.total = S('path', { class: 'pmu-mark', 'data-mark': 'area', 'data-tk': 'all', 'data-key': 'all' }, gTot);
        P.totalLine = S('path', { class: 'pmu-mark', 'data-mark': 'edge', 'data-tk': 'all', 'data-key': 'all', 'data-primary': '1' }, gTot);
        P.glow = S('path', { class: 'pmu-mark', 'data-mark': 'glow', 'data-tk': 'all', 'data-key': 'all' }, gTot);
        gTot.insertBefore(P.glow, P.totalLine);
      }
      incSeries.forEach(function (s, i) {
        var k = s._tk ? { tk: s._tk } : { idx: s.idx != null ? s.idx : s._i, vendor: s.vendor };
        var a = charts.key(S('path', { class: 'pmu-mark', 'data-mark': m.token || stacked ? 'band' : 'area', 'data-key': geo.keys[i] }, m.token ? gBands : gTot), k);
        var e = charts.key(S('path', { class: 'pmu-mark', 'data-mark': m.token || stacked ? 'edge' : 'line', 'data-key': geo.keys[i] }, m.token ? gBands : gTot), k);
        if (!m.token && !stacked && i === 0) e.setAttribute('data-primary', '1');
        if (s.role) { a.setAttribute('data-series-role', s.role); e.setAttribute('data-series-role', s.role); }
        P.bands.push(a); P.edges.push(e);
      });
      if (cost) P.cost = S('path', { class: 'pmu-mark', 'data-mark': 'line', 'data-series-index': 'ink', 'data-key': 'cost', 'data-role': 'cost' }, f.plot);
      P.end = S('g', { class: 'pmu-enddots' }, f.plot);
    }
    f.plot.setAttribute('width', W); f.plot.setAttribute('height', Hh);
    f.over.setAttribute('width', W); f.over.setAttribute('height', Hh);
    f.plot.classList.toggle('is-split', split);
    var prev = c._geo;
    var morph = mode === 'morph' && prev && prev.N === N && prev.W === W && prev.H === Hh && prev.lv.length === lv.length && !Mo.reduced();
    if (c._tw) { c._tw.cancel(); c._tw = null; }
    if (morph) {
      var from = prev;
      c._tw = Mo.tween(520, 'io', function (k) {
        paintArea(c, {
          x0: from.x0 + (geo.x0 - from.x0) * k, x1: from.x1 + (geo.x1 - from.x1) * k,
          lv: geo.lv.map(function (row, j) { return row.map(function (v, i) { return mix(from.lv[j][i], v, k); }); }),
          tot: geo.tot.map(function (v, i) { return mix(from.tot[i], v, k); }),
          base: geo.base.map(function (v, i) { return mix(from.base[i], v, k); }),
          cs: geo.cs ? geo.cs.map(function (v, i) { return mix(from.cs ? from.cs[i] : v, v, k); }) : null
        }, geo);
      }, function () { c._tw = null; paintArea(c, geo, geo); });
    } else paintArea(c, geo, geo);
    c._geo = geo;
    /* end dots and peak label */
    endDots(c, geo, m, totals, cost, Y, YB, mids);
    peakLabel(c, geo, spec, m, totals, Y, mids, dom, tw);
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
      P.totalLine.setAttribute('d', tl); P.glow.setAttribute('d', tl);
    }
    cur.lv.forEach(function (row, j) {
      var bot = geo.stacked ? (j ? cur.lv[j - 1] : cur.base) : cur.base;
      P.bands[j].setAttribute('d', gapBand(cur.x0, cur.x1, row, bot.map(function (v, i) { return finite(v) ? v : cur.base[i]; })));
      P.edges[j].setAttribute('d', gapLine(cur.x0, cur.x1, row));
    });
    if (P.cost && cur.cs) P.cost.setAttribute('d', gapLine(cur.x0, cur.x1, cur.cs));
  }
  function endDots(c, geo, m, totals, cost, Y, YB, mids) {
    var P = c.P, s = '';
    var dot = function (x, y, attrs) { return '<circle class="pmu-halo"' + attrs + ' cx="' + r1(x) + '" cy="' + r1(y) + '" r="8"/><circle class="pmu-mark" data-mark="dot" cx="' + r1(x) + '" cy="' + r1(y) + '" r="3.5"' + attrs + '/>'; };
    var li = lastFinite(totals);
    if (geo.token && li >= 0) s += dot(mids[li], Y(totals[li]), ' data-tk="all" data-key="all"');
    else if (!geo.token) {
      geo.keys.forEach(function (k, j) {
        var row = m.series[j] && m.series[j].values || [];
        var i = lastFinite(row);
        if (i < 0 || (geo.stacked && j !== geo.keys.length - 1)) return;
        var v = geo.stacked ? totals[i] : row[i];
        if (finite(v)) s += dot(mids[i], Y(v), ' data-series-index="' + (m.series[j].idx != null ? m.series[j].idx : j) + '" data-key="' + k + '"');
      });
    }
    if (cost) { var ci = lastFinite(cost); if (ci >= 0) s += dot(mids[ci], YB(cost[ci]), ' data-series-index="ink" data-key="cost"'); }
    P.end.innerHTML = geo.compact && !c.opts.endDot ? '' : s;
  }
  function peakLabel(c, geo, spec, m, totals, Y, mids, dom, tw) {
    var f = c.f;
    f.over.innerHTML = '';
    if (geo.compact || spec.peak === false || (tw !== 'm' && tw !== 'l' && tw !== 'xl') || !m.token || geo.ph < 56) return;
    var best = -1;
    totals.forEach(function (v, i) { if (finite(v) && (best < 0 || v > totals[best])) best = i; });
    if (best < 0 || !(totals[best] > 0)) return;
    var label = t('charts.peak_label', { time: dom.bucket >= 86400000 ? charts.time.md(dom.x[best]) : charts.time.clock(dom.x[best]), value: charts.fmtValue(totals[best], 'tokens') });
    var w = charts.textW(label, 11, true);
    var px = mids[best], anchor = 'middle', x = clamp(px, geo.pad.l + w / 2 + 2, geo.pad.l + geo.pw - w / 2 - 2);
    /* near the right end (where the NOW label sits) the label hangs to the left of its point */
    if (px > geo.pad.l + geo.pw - w / 2 - 2 || (geo.nowX != null && Math.abs(px - geo.nowX) < w / 2 + 8)) { anchor = 'end'; x = px - 8; }
    var y = Math.max(geo.pad.t + 10, Y(totals[best]) - 8);
    var tx = S('text', { class: 'pmu-tick is-peak', x: r1(x), y: r1(y), 'text-anchor': anchor }, f.over);
    tx.textContent = label;
  }
  function bindAreaHover(c, geo, m, dom, mids, totals, cost, Y, YB, incSeries, include, t1) {
    var spec = c.spec, n = mids.length;
    var cfg = {
      n: n, pad: { t: geo.pad.t, h: geo.ph, l: geo.pad.l, r: geo.pad.r },
      xAt: function (i) { return mids[i]; },
      dots: function (i) {
        var out = [];
        if (geo.token || geo.stacked) { if (finite(totals[i])) out.push({ y: Y(totals[i]), key: geo.token ? { tk: 'all' } : { idx: incSeries[incSeries.length - 1].idx } }); }
        else incSeries.forEach(function (s, j) { var v = (s.values || [])[i]; out.push({ y: finite(v) ? Y(v) : null, key: { idx: s.idx != null ? s.idx : j, vendor: s.vendor } }); });
        if (cost) out.push({ y: finite(cost[i]) ? YB(cost[i]) : null, key: { idx: 'ink' }, ink: true });
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
          h += ro.sep() + ro.row({ tk: 'all' }, t('charts.all_tokens'), anyMiss ? '-' : charts.fmtValue(all, 'tokens'), 'is-total');
          if (cost) h += ro.row({ idx: 'ink' }, t('charts.est_cost'), finite(cost[i]) ? charts.fmtValue(cost[i], 'usd') : t('charts.no_attempts'), 'is-total', 'line');
        } else {
          var sum = 0;
          incSeries.forEach(function (s, j) {
            var v = (s.values || [])[i]; if (finite(v)) sum += v;
            h += ro.row({ idx: s.idx != null ? s.idx : j, vendor: s.vendor, tk: s.tk }, s.name, finite(v) ? charts.fmtValue(v, spec.unit) : PMU.vs.STATES.unknown.word);
          });
          if (geo.stacked && incSeries.length > 1) h += ro.sep() + ro.row({ idx: 'ink' }, t('charts.total'), charts.fmtValue(sum, spec.unit), 'is-total');
        }
        if (partial) h += ro.foot(t('charts.partial', { from: charts.time.clock(lo), to: charts.time.clock(hi) }));
        var extra = typeof spec.readoutFoot === 'function' ? spec.readoutFoot(i) : null;
        (Array.isArray(extra) ? extra : extra ? [extra] : []).forEach(function (line) { h += ro.foot(line); });
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
    f.axes.innerHTML = ''; f.plot.innerHTML = ''; f.over.innerHTML = ''; c.P = null; c._psig = null;
    if (!f.empty) f.empty = charts.empty(f.box, text);
    else f.empty.textContent = text || t('charts.empty');
  }
  function hideEmpty(c) { if (c.f && c.f.empty) { c.f.empty.remove(); c.f.empty = null; } }
  /* the plot entrance: axes fade (260 ms), the plot reveals left to right (900 ms), end dots pop, labels fade */
  function enterPlot(c, delay, dur) {
    var f = c.f;
    if (!f) return;
    f.rv.style.visibility = '';
    var draw = dur || 900;
    Mo.anim(f.axes, [{ opacity: 0 }, { opacity: 1 }], 260, delay, Mo.EASE.out);
    Mo.reveal(f.rv, f.rvin, draw, delay, 'x');
    $$('[data-mark="dot"]', f.plot).forEach(function (d) {
      Mo.anim(d, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], 260, delay + draw - 80, Mo.voice('pop'));
    });
    $$('.pmu-halo', f.plot).forEach(function (d) {
      Mo.anim(d, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.35)', opacity: .5, offset: 0.45 }, { transform: 'scale(1)', opacity: .18 }], 620, delay + draw - 60, Mo.EASE.out);
    });
    if (f.over.firstChild) Mo.anim(f.over, [{ opacity: 0 }, { opacity: 1 }], 260, delay + draw - 40, Mo.EASE.out);
    if (f.legendHost.firstChild) Mo.anim(f.legendHost, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], 420, delay, Mo.EASE.out);
  }
  charts._plot = { frame: frame, setLegend: setLegend, dims: dims, tierW: tierW, drawAxes: drawAxes, swapAxes: swapAxes, enterPlot: enterPlot,
    showEmpty: showEmpty, hideEmpty: hideEmpty, gapLine: gapLine, gapBand: gapBand, axisW: axisW };

  /* ================= line: multi-series lines, limit rules, forecast with a confidence band ================= */
  charts.line = function (host, spec, opts) {
    return charts.make('line', host, spec, opts, {
      draw: function (c, first, resized) { drawLine(c, first ? 'first' : 'redraw'); },
      update: function (c) { drawLine(c, 'morph'); },
      enter: function (c, delay) { enterPlot(c, delay); }
    });
  };
  function drawLine(c, mode) {
    var spec = c.spec, f = frame(c), tw = tierW(c), compact = !!COMPACT[tw] || c.opts.compact;
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
    var pad = compact ? { l: 2, r: 2, t: 6, b: 2 } : { l: 44, r: 14, t: 28, b: 30 };
    var ph = Math.max(16, Hh - pad.t - pad.b);
    var ya;
    if (unit === 'pct' && !finite(spec.yMax) && lo === 0) ya = { step: 25, top: 100, k: 4 };
    else if (finite(spec.yMax)) { var kk = ph >= 160 ? 4 : 2; ya = { step: (spec.yMax - lo) / kk, top: spec.yMax - lo, k: kk }; }
    else ya = charts.scales(Math.max(1e-9, hiV - lo), null, ph).a;
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
        ylab: function (i) { return charts.fmtAxis(lo + ya.step * i, unit, ya.step); }, xt: xt, extra: extra }, mode === 'morph');
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
    var morph = mode === 'morph' && prev && prev.sig === sig && prev.W === W && prev.H === Hh && !Mo.reduced();
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
        });
        var li = lastFinite(cur[j]);
        if (li >= 0 && !compact) s += '<circle class="pmu-mark" data-mark="dot"' + keyA + ' data-key="S' + j + '" cx="' + r1(xs[li]) + '" cy="' + r1(cur[j][li]) + '" r="3.5"/>';
      });
      if (fcPts && fcPts.length > 1) {
        var lastJ = series.length ? lastFinite(cur[0]) : -1;
        var pp = (lastJ >= 0 && fc.from > 0 ? [[xs[lastJ], cur[0][lastJ]]] : []).concat(fcPts.filter(function (q) { return q[0] != null; }));
        s += '<path class="pmu-mark" data-mark="forecast" data-series-role="forecast" data-series-index="' + (series[0] && series[0].idx != null ? series[0].idx : 0) + '" data-key="fc" d="' + charts.monoD(pp) + '"/>';
      }
      f.plot.innerHTML = s;
    }
    if (c._tw) { c._tw.cancel(); c._tw = null; }
    if (morph) {
      var from = prev.pts;
      c._tw = Mo.tween(520, 'io', function (k) { paint(pts.map(function (row, j) { return row.map(function (v, i) { return mix(from[j] ? from[j][i] : v, v, k); }); })); },
        function () { c._tw = null; paint(pts); paintIso(c); });
    } else paint(pts);
    c._lgeo = { sig: sig, W: W, H: Hh, pts: pts };
    if (!compact) {
      var cfg = {
        n: n, pad: { t: pad.t, h: ph, l: pad.l, r: pad.r }, xAt: function (i) { return xs[i]; },
        dots: function (i) { return series.map(function (sr, j) { return { y: pts[j][i], key: { idx: sr.idx != null ? sr.idx : j, vendor: sr.vendor, tk: sr.tk } }; }); },
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
      enter: function (c, delay) { enterColumns(c, delay); }
    });
  };
  function colModel(spec) {
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
    return { stacked: stacked, n: n, totals: totals };
  }
  /* a stack's colour key: its vendor (provider stacks), else its series index or token type (raised / resolved), else neutral */
  function stackKey(s) { return s.vendor ? { vendor: s.vendor } : (s.idx != null || s.tk) ? { idx: s.idx, tk: s.tk } : { vendor: 'community' }; }
  function moneyShort(v) { return v >= 1000 ? '$' + +(v / 1000).toFixed(1) + 'k' : v >= 10 ? '$' + Math.round(v) : v >= 1 ? '$' + +v.toFixed(1) : '$' + +v.toFixed(2); }
  function drawColumns(c, mode) {
    var spec = c.spec, f = frame(c), tw = tierW(c), m = colModel(spec), unit = spec.unit || 'usd';
    var items = [];
    if (m.stacked && c.opts.legend !== false && !COMPACT[tw]) spec.stacks.forEach(function (s) {
      var tot = 0; (s.settled || []).concat(s.estimate || []).forEach(function (v) { if (finite(v)) tot += v; });
      if (tot > 0) items.push(Object.assign({ key: s.providerId, name: s.name || (PMU.roster && PMU.roster.provider && PMU.roster.provider(s.providerId) ? PMU.roster.provider(s.providerId).name : s.providerId), prov: s.providerId,
        compact: !!s.vendor && tw === 'm' }, stackKey(s)));
    });
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
    swapAxes(f, g, mode === 'morph');
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
    for (i = 0; i < n; i++) {
      var tot = m.totals[i], x = pad.l + slot * i + (slot - bw) / 2, last = i === n - 1;
      var st = (spec.states || [])[i];
      var lab;
      if (!finite(tot)) {
        newH.push(0);
        lab = st ? (st === 'hidden_subscription' ? t('charts.covered') : PMU.vs.STATES[st] ? PMU.vs.STATES[st].word : '') : '';
        html += '<div class="pmu-col is-gap" data-i="' + i + '" style="left:' + r1(x) + 'px;width:' + r1(bw) + 'px;bottom:' + pad.b + 'px;height:0">' +
          (lab ? '<span class="pmu-collab is-state" style="bottom:4px">' + esc(lab) + '</span>' : '') + '</div>';
        continue;
      }
      var h = tot === 0 ? 2 : Math.max(2, Yh(tot));
      newH.push(h);
      var full = unit === 'usd' ? charts.fmtValue(tot, 'usd') : charts.fmtValue(tot, unit);
      lab = charts.textW(full, 11, true) + 4 <= slot ? full : unit === 'usd' ? moneyShort(tot) : charts.fmtAxis(tot, unit, 1);
      var segs = '';
      if (m.stacked) {
        spec.stacks.forEach(function (s) {
          var a = (s.settled || [])[i], b = (s.estimate || [])[i];
          var ka = charts.keyAttrs(stackKey(s));
          if (finite(a) && a > 0) segs += '<i class="pmu-mark" data-mark="segment"' + ka + ' data-prov="' + esc(s.providerId) + '" style="flex-grow:' + a + '"></i>';
          if (finite(b) && b > 0) segs += '<i class="pmu-mark" data-mark="segment" data-est="1"' + ka + ' data-prov="' + esc(s.providerId) + '" style="flex-grow:' + b + '"></i>';
        });
      } else {
        var kAttrs = charts.keyAttrs({ idx: spec.idx != null ? spec.idx : 0, tk: spec.tk, vendor: spec.vendor, tone: (spec.tones || [])[i] });
        var e = est[i];
        if (finite(e) && e > 0 && e < tot) segs = '<i class="pmu-mark" data-mark="segment"' + kAttrs + ' style="flex-grow:' + (tot - e) + '"></i><i class="pmu-mark" data-mark="segment" data-est="1"' + kAttrs + ' style="flex-grow:' + e + '"></i>';
        else segs = '<i class="pmu-mark" data-mark="segment"' + kAttrs + (finite(e) && e >= tot && tot > 0 ? ' data-est="1"' : '') + ' style="flex-grow:1"></i>';
      }
      html += '<div class="pmu-col' + (tot === 0 ? ' is-zero' : '') + (last && spec.highlightLast !== false ? ' is-latest' : '') + '" data-i="' + i + '" style="left:' + r1(x) + 'px;width:' + r1(bw) + 'px;bottom:' + pad.b + 'px;height:' + r1(h) + 'px">' +
        '<span class="pmu-colstack">' + segs + '</span><span class="pmu-collab">' + esc(lab) + '</span></div>';
    }
    bars.innerHTML = html;
    c._colH = newH;
    c._colGeo = { pad: pad, slot: slot, n: n, ph: ph, W: W };
    /* morph: each bar scales from its old height (transform only) */
    if (mode === 'morph' && !Mo.reduced() && prevH.length) {
      $$('.pmu-col', bars).forEach(function (el, j) {
        var a = prevH[j], b = newH[j];
        if (!(b > 0) || !finite(a) || Math.abs(a - b) < 0.5) return;
        var st2 = el.querySelector('.pmu-colstack');
        Mo.anim(st2, [{ transform: 'scaleY(' + clamp(a / b, 0, 40) + ')' }, { transform: 'scaleY(1)' }], 520, 0, Mo.EASE.io);
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
            if (v > 0 || (finite(a) && a === 0)) h += ro.row(stackKey(s), s.name || s.providerId, charts.fmtValue(v, unit) + (finite(b) && b > 0 && !(finite(a) && a > 0) ? ' est.' : ''));
          });
          h += ro.sep() + ro.row({ idx: 'ink' }, t('charts.total'), finite(tot) ? charts.fmtValue(tot, unit) : '-', 'is-total');
          if (unit === 'usd') h += ro.foot(t('charts.settled_vs_est', { settled: charts.fmtValue(settled, 'usd'), est: charts.fmtValue(estimate, 'usd') }));
        } else {
          var st = (spec.states || [])[i];
          h += ro.row({ idx: spec.idx != null ? spec.idx : 0, tk: spec.tk, vendor: spec.vendor }, spec.name || t('charts.value'),
            finite(tot) ? charts.fmtValue(tot, unit) : st ? (PMU.vs.STATES[st] || {}).word || '-' : PMU.vs.STATES.unknown.word, 'is-total');
          var e = (spec.est || [])[i];
          if (finite(e) && e > 0) h += ro.foot(t('charts.settled_vs_est', { settled: charts.fmtValue(tot - e, 'usd'), est: charts.fmtValue(e, 'usd') }));
          if (tot === 0) h += ro.foot(t('charts.reported_zero'));
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
    Mo.anim(f.axes, [{ opacity: 0 }, { opacity: 1 }], 260, delay, Mo.EASE.out);
    var cols = $$('.pmu-col', f.bars), n = cols.length || 1, step = Math.min(70, 800 / n);
    cols.forEach(function (el, i) {
      var st = el.querySelector('.pmu-colstack'), lab = el.querySelector('.pmu-collab');
      var dl = delay + Math.min(560, i * step);
      if (st) Mo.anim(st, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], 760, dl, Mo.voice('grow'));
      if (lab) Mo.anim(lab, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], 160, dl + 600, Mo.EASE.out);
    });
    if (f.legendHost.firstChild) Mo.anim(f.legendHost, [{ opacity: 0 }, { opacity: 1 }], 420, delay, Mo.EASE.out);
  }

  /* ================= spark: 1.5 px line + gradient area .32 to 0, end dot (A1 7.11) ================= */
  charts.spark = function (host, spec, opts) {
    return charts.make('spark', host, spec, opts, {
      draw: function (c, first) { drawSpark(c, first); },
      update: function (c) { drawSpark(c, false, true); },
      enter: function (c, delay) {
        if (!c.f) return;
        c.f.rv.style.visibility = '';
        Mo.reveal(c.f.rv, c.f.rvin, 900, delay, 'x');
        var dot = c.f.plot.querySelector('[data-mark="dot"]');
        if (dot) Mo.anim(dot, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], 240, delay + 820, Mo.voice('pop'));
      }
    });
  };
  function drawSpark(c, first, morph) {
    var spec = c.spec, f = c.f;
    if (!f) {
      f = c.f = {};
      f.rv = H('div', 'pmu-rv', c.el); f.rvin = H('div', 'pmu-rv-in', f.rv);
      f.plot = S('svg', { class: 'pmu-plot', 'aria-hidden': 'true' }, f.rvin);
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
      var li = lastFinite(P.map(function (p) { return p ? 1 : null; }));
      if (li >= 0 && spec.dot !== false) s += '<circle class="pmu-mark" data-mark="dot" data-spark="1"' + k + ' cx="' + r1(P[li][0]) + '" cy="' + r1(P[li][1]) + '" r="2.4"/>';
      f.plot.innerHTML = s;
    }
    var prev = c._sp;
    if (c._tw) { c._tw.cancel(); c._tw = null; }
    if (morph && prev && prev.length === pts.length && !Mo.reduced()) {
      c._tw = Mo.tween(520, 'io', function (q) { paint(pts.map(function (p, i) { return p && prev[i] ? [p[0], prev[i][1] + (p[1] - prev[i][1]) * q] : p; })); }, function () { c._tw = null; });
    } else paint(pts);
    c._sp = pts;
  }

  /* ================= budget: cumulative month-to-date spend, projection and the Settings budget rule (A1 7.11) ================= */
  charts.budget = function (host, spec, opts) {
    return charts.make('budget', host, spec, opts, {
      draw: function (c, first) { drawBudget(c, first); },
      update: function (c) { drawBudget(c, false, true); },
      enter: function (c, delay) {
        enterPlot(c, delay);
        var f = c.f;
        var pr = $$('[data-mark="forecast"], [data-mark="band"]', f.plot);
        pr.forEach(function (el) { Mo.anim(el, [{ opacity: 0 }, { opacity: 1 }], 420, delay + 900, Mo.EASE.out); });
        var rule = f.axes.querySelector('.pmu-limit[data-role="budget"]');
        if (rule) Mo.anim(rule, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 360, delay + 1000, Mo.EASE.out);
      }
    });
  };
  function drawBudget(c, first, morph) {
    var spec = c.spec, f = frame(c), tw = tierW(c);
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
    var labs = []; for (var k = 0; k <= ya.k; k++) labs.push(charts.fmtAxis(ya.step * k, 'usd', ya.step));
    if (!compact) pad.l = Math.max(40, Math.ceil(axisW(labs)) + 14);
    var pw = Math.max(30, W - pad.l - pad.r);
    var X = function (day) { return pad.l + (day - 1) / Math.max(1, days - 1) * pw; };
    var Y = function (v) { return pad.t + ph - v / ya.top * ph; };
    var ms0 = spec.monthStart || (function () { var dd = new Date(); dd.setDate(1); dd.setHours(0, 0, 0, 0); return dd.getTime(); })();
    var dayMs = function (day) { var dd = new Date(ms0); dd.setDate(day); return dd.getTime(); };
    var xt = [];
    if (!compact) { var stepD = pw / days >= 12 ? 7 : 14; for (var dd = 1; dd <= days; dd += stepD) xt.push({ x: X(dd), label: charts.time.md(dayMs(dd)) }); }
    var extra = '';
    if (!compact) {
      var xtd = r1(X(today));
      extra += '<path class="pmu-now" d="M' + xtd + ' ' + (pad.t - 2) + 'V' + (pad.t + ph) + '"/><text class="pmu-tick is-note" x="' + (xtd - 5) + '" y="' + (pad.t + 9) + '" text-anchor="end">' + esc(t('charts.today_caps')) + '</text>';
      if (budget > 0) {
        var yb = r1(Y(budget)) + 0.5;
        extra += '<path class="pmu-limit" data-role="budget" d="M' + pad.l + ' ' + yb + 'H' + (pad.l + pw) + '"/><text class="pmu-tick is-limit" data-role="budget" x="' + (pad.l + 4) + '" y="' + (yb - 5) + '">' +
          esc(t('charts.budget_label', { value: charts.fmtValue(budget, 'usd').replace(/\.00$/, '') })) + '</text>';
      } else extra += '<text class="pmu-tick is-note" x="' + (pad.l + 4) + '" y="' + (pad.t - 8) + '">' + esc(t('charts.no_budget')) + '</text>';
    }
    swapAxes(f, { W: W, H: Hh, pad: pad, pw: pw, ph: ph, ya: ya, yMin0: true, noY: compact, unitA: '', vgrid: false,
      ylab: function (i) { return charts.fmtAxis(ya.step * i, 'usd', ya.step); }, xt: xt, extra: extra }, morph);
    if (compact) f.axes.innerHTML = '';
    f.plot.setAttribute('width', W); f.plot.setAttribute('height', Hh);
    f.over.setAttribute('width', W); f.over.setAttribute('height', Hh);
    var pts = []; cum.forEach(function (v, i) { if (finite(v)) pts.push([X(i + 1), Y(v)]); });
    var s = '';
    if (pr && finite(pr.to) && pts.length && !compact) {
      var last = pts[pts.length - 1], ex = X(days);
      if (finite(pr.lo) && finite(pr.hi)) s += '<path class="pmu-mark" data-mark="band" data-series-role="forecast" data-series-index="0" d="M' + r1(last[0]) + ',' + r1(last[1]) + 'L' + r1(ex) + ',' + r1(Y(pr.hi)) + 'L' + r1(ex) + ',' + r1(Y(pr.lo)) + 'Z"/>';
      s += '<path class="pmu-mark" data-mark="forecast" data-series-role="forecast" data-series-index="0" d="M' + r1(last[0]) + ',' + r1(last[1]) + 'L' + r1(ex) + ',' + r1(Y(pr.to)) + '"/>';
      s += '<circle class="pmu-mark" data-mark="dot" data-series-role="forecast" data-series-index="0" cx="' + r1(ex) + '" cy="' + r1(Y(pr.to)) + '" r="3"/>';
    }
    if (pts.length > 1) s += '<path class="pmu-mark" data-mark="area" data-series-index="0" d="' + charts.monoD(pts) + 'L' + r1(pts[pts.length - 1][0]) + ',' + r1(pad.t + ph) + 'L' + r1(pts[0][0]) + ',' + r1(pad.t + ph) + 'Z"/>';
    if (pts.length > 1 && !compact) s += '<path class="pmu-mark" data-mark="glow" data-series-index="0" d="' + charts.monoD(pts) + '"/>';
    if (pts.length) s += '<path class="pmu-mark" data-mark="line" data-primary="1" data-series-index="0" d="' + charts.monoD(pts) + '"/>' +
      '<circle class="pmu-mark" data-mark="dot" data-series-index="0" cx="' + r1(pts[pts.length - 1][0]) + '" cy="' + r1(pts[pts.length - 1][1]) + '" r="3.5"/>';
    f.plot.innerHTML = s;
    if (!compact) {
      var n = days;
      var cfg = {
        n: n, pad: { t: pad.t, h: ph, l: pad.l, r: pad.r }, xAt: function (i) { return X(i + 1); },
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
        /* a diagonal wash: each weekday row slides in from the left while it fades (one layer per row, not one per cell,
           so the entrance stays cheap on the CPU-only VM; A1 8.4 fallback) */
        $$('.pmu-hrow', c.el).forEach(function (el, r) {
          Mo.anim(el, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], 520, delay + 36 * r, Mo.voice('out'));
        });
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
    if (!ownLeg) lg.innerHTML = '<span>' + esc(t('charts.less')) + '</span><span class="pmu-hs">' + chips + '</span><span>' + esc(t('charts.more')) +
      (pk ? ' · ' + esc(t('charts.busiest')) + ' <b>' + esc(pk.label) + '</b>' : '') + '</span>' +
      '<span class="pmu-hs-key is-first"><i data-step="0"></i>' + esc(t('charts.heat_nothing')) + '</span><span class="pmu-hs-key"><i data-step="-1"></i>' + esc(t('charts.heat_outside')) + '</span>';
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
      enter: function (c, delay) {
        if (!c.f) return;
        c.f.rv.style.visibility = '';
        Mo.reveal(c.f.rv, c.f.rvin, 900, delay, 'x');
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
  function drawQRow(c, first) {
    var spec = c.spec, f = c.f;
    if (!f) {
      f = c.f = {};
      f.rv = H('div', 'pmu-rv', c.el); f.rvin = H('div', 'pmu-rv-in', f.rv);
      f.plot = S('svg', { class: 'pmu-plot pmu-qsvg', viewBox: '0 0 600 24', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, f.rvin);
    }
    var Y = function (v) { return 22.5 - clamp(v, 0, 104) / 100 * 20; };
    var s = spec.ref100 !== false ? '<path class="pmu-qref" d="M0 2.5H600"/>' : '';
    qRuns(spec).forEach(function (run) {
      var p = run.pts.map(function (q) { return [q[0] * 600, Y(q[1])]; });
      var d = 'M' + r1(p[0][0]) + ',' + r1(p[0][1]);
      for (var i = 1; i < p.length; i++) d += (p[i][1] !== p[i - 1][1] ? 'V' + r1(p[i][1]) : '') + 'H' + r1(p[i][0]);
      var fill = d + 'V24H' + r1(p[0][0]) + 'Z';
      var conn = finite(run.from) ? '<path class="pmu-mark" data-mark="line" data-q="1" data-tone="' + run.tone + '" d="M' + r1(p[0][0]) + ',' + r1(Y(run.from)) + 'V' + r1(p[0][1]) + '"/>' : '';
      s += '<path class="pmu-mark" data-mark="area" data-q="1" data-tone="' + run.tone + '" d="' + fill + '"/>' + conn +
        '<path class="pmu-mark" data-mark="line" data-q="1" data-tone="' + run.tone + '" d="' + d + '"/>';
    });
    f.plot.innerHTML = s;
    c.el.style.height = (spec.height || 24) + 'px';
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
    var s = '';
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
      if (pts.length) { var lp = pts[pts.length - 1]; s += '<circle class="pmu-mark" data-mark="dot" data-series-index="ink" data-key="W' + i + '" cx="' + r1(Math.min(X(now), pad.l + pw)) + '" cy="' + r1(Y(lp.v)) + '" r="3.5"/>'; }
    });
    f.plot.innerHTML = s;
    /* readout: the nearest sample time across windows */
    var times = [];
    wins.forEach(function (w) { (w.points || []).forEach(function (p) { if (times.indexOf(p.t) < 0) times.push(p.t); }); });
    times.sort(function (a, b) { return a - b; });
    var valAt = function (w, tt) { var v = null; (w.points || []).forEach(function (p) { if (p.t <= tt) v = p.v; }); return v; };
    var cfg = {
      n: times.length, pad: { t: pad.t, h: ph, l: pad.l, r: pad.r }, xAt: function (i) { return X(times[i]); },
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
      enter: function (c, delay) {
        $$('.pmu-rbar', c.el).forEach(function (el, i) {
          Mo.anim(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 520, delay + Math.min(560, i * 70), Mo.voice('grow'));
        });
        c.el.classList.remove('is-pre');
      }
    });
  };
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
    c.el.innerHTML = html;
  }

  /* timeline is withdrawn (A1 7.10: the agenda kind renders DOM rows); kept as a quiet placeholder so old calls do not throw */
  if (!charts.timeline) charts.timeline = charts.placeholder('timeline');
})();
