/* Bar, meter and ring primitives (owner: charts; DESIGN-SPEC 7.2, DESIGN-SPEC-ATLAS 6, 7.3 to 7.6 and 7.11):
   meter (sizes c / k / i; windowCell = k, headroom = k of % left), ranked, mix, ring, gauge, stackbar (cost by model),
   donut (model usage), sharebars (token breakdown), split (cache reads and writes), and kpi (a tile value with its
   count-up, delta and sub-line, for content kinds that want it). DOM boxes so NieR paints them with its CSS patterns
   and Retro with segmented gradients; SVG only for rings and the donut (they stay round under NieR Square). */
(function () {
  var charts = PMU.charts, U = charts.util, S = charts.svg, H = charts.el, Mo = charts.motion;
  var finite = U.finite, clamp = U.clamp, r1 = U.r1;
  var noOvershoot = 'cubic-bezier(.16,1,.3,1)';
  function hoverAttrs(label, detail) {
    return (label ? ' data-pm-hover-label="' + esc(label) + '"' : '') + (detail ? ' data-pm-hover-detail="' + esc(detail) + '"' : '');
  }
  function pctText(v) { return Math.abs(v) < 10 && v % 1 ? (Math.round(v * 10) / 10) : Math.round(v); }

  /* ================= meter (A1 6): value line, quiet track with quarter ticks, sliding-window fill, auto-switch notch ================= */
  /* spec: {label, pct (% used) | null, vs, tone, size: 'c'|'k'|'i', notch: {at, faint, off} | null, resetText, resetSoon, amount,
     estimated, stale, dimmed, binding, window, prov, left (show % left: headroom), hover: {label, detail}, valueText} */
  charts.meter = function (host, spec, opts) {
    return charts.make('meter', host, spec, opts, {
      flow: true, noObserve: true, role: 'meter',
      draw: function (c, first) { paintMeter(c, first); },
      update: function (c, prev) { paintMeter(c, false, prev); },
      enter: function (c, delay) { enterMeter(c, delay); }
    });
  };
  function meterTone(spec) {
    if (!finite(spec.pct)) return 'missing';
    var tn = spec.tone || (PMU.roster && PMU.roster.tone ? PMU.roster.tone(spec.pct) : null) || 'calm';
    if (tn === 'hot') tn = 'crit';
    if (tn === 'watch') tn = 'calm';
    if (spec.pct > 100 && tn !== 'over') tn = 'over';
    if (spec.pct >= 100 && tn === 'calm') tn = 'exhausted';
    return tn;
  }
  function paintMeter(c, first, prev) {
    var spec = c.spec || {}, el = c.el, size = spec.size || (c.opts && c.opts.size) || 'c';
    el.classList.add('pmu-meter');
    var known = finite(spec.pct), tone = meterTone(spec);
    var shownPct = known ? (spec.left ? Math.max(0, 100 - spec.pct) : spec.pct) : null;
    var fillPct = known ? clamp(spec.left ? 100 - spec.pct : spec.pct, 0, 100) : 0;
    el.setAttribute('data-size', size);
    el.setAttribute('data-tone', tone);
    el.toggleAttribute('data-est', !!spec.estimated);
    el.toggleAttribute('data-stale', !!spec.stale);
    el.toggleAttribute('data-dim', !!spec.dimmed);
    el.toggleAttribute('data-binding', !!spec.binding);
    el.toggleAttribute('data-left', !!spec.left);
    /* the inline headroom needs about 100 px for "69% left" and its bar; in a narrower host it draws the bar alone */
    el.toggleAttribute('data-bare', !!spec.bare || (size === 'h' && c._w > 0 && c._w < 100));
    if (spec.window) el.setAttribute('data-window', spec.window); else el.removeAttribute('data-window');
    if (spec.prov) el.setAttribute('data-prov', spec.prov);
    var over = known && spec.pct > 100 && !spec.left;
    el.toggleAttribute('data-over', over);
    var label = spec.label || '';
    el.setAttribute('aria-label', label + (known ? ': ' + pctText(spec.pct) + (spec.noPct ? ' ' + (spec.suffix || '') : '% used') : ': ' + (PMU.vs.STATES[spec.vs] || PMU.vs.STATES.unknown).word));
    if (known) { el.setAttribute('aria-valuenow', String(Math.round(spec.pct))); el.setAttribute('aria-valuemin', '0'); el.setAttribute('aria-valuemax', '100'); }
    /* hover tag: window, % used and % left, used / limit, reset truth and source, what the notch means (B v2) */
    var hv = spec.hover || {};
    var detail = hv.detail || [known ? (spec.noPct ? pctText(spec.pct) + ' ' + (spec.suffix || '') : pctText(spec.pct) + '% used · ' + pctText(Math.max(0, 100 - spec.pct)) + '% left') : (PMU.vs.STATES[spec.vs] || PMU.vs.STATES.unknown).word,
      spec.amount, spec.resetText, spec.source, spec.notch && !spec.notch.off && finite(spec.notch.at) ? t('charts.notch_means', { pct: Math.round(spec.notch.at) }) : ''].filter(Boolean).join(' · ');
    el.setAttribute('data-pm-hover-label', hv.label || label || t('charts.window'));
    el.setAttribute('data-pm-hover-detail', detail);
    /* spec.suffix replaces "used" / "left" and spec.noPct drops the % sign (a pressure score reads "78 score") */
    var suffix = spec.suffix != null ? spec.suffix : spec.left ? t('charts.left') : t('charts.used');
    var valueHtml = known
      ? '<b class="pmu-meterval"><span class="pmu-num">' + esc(spec.valueText || pctText(shownPct)) + '</span>' + (spec.valueText || spec.noPct ? '' : '<span class="pmu-u">%</span>') + '</b>' +
        '<span class="pmu-suffix">' + esc(suffix) + (spec.estimated ? ' ' + esc(t('charts.est')) : '') + '</span>'
      : '<span class="pmu-meterna">' + PMU.vs.html(spec.vs && spec.vs !== 'ok' ? spec.vs : 'unknown', spec.vsWord) + '</span>';
    var notch = spec.notch && finite(spec.notch.at) && !spec.left ? spec.notch : null;
    var same = el._m && el._m.size === size && el._m.known === known;
    if (!same) {
      el.innerHTML = '<div class="pmu-meterline">' + (size === 'i' ? '<span class="pmu-meterlabel">' + esc(label) + '</span>' : '') + '<span class="pmu-metervalue"></span></div>' +
        '<div class="pmu-metertrack"><span class="pmu-meterclip"><i class="pmu-meterfill pmu-mark" data-mark="fill"><i class="pmu-meterwash"></i></i></span><i class="pmu-meterover pmu-mark" data-mark="segment"></i>' +
        '<span class="pmu-notchrail"><i class="pmu-notch"></i></span></div>' +
        '<div class="pmu-meterfoot"><span class="pmu-reset"></span><span class="pmu-meteramt"></span></div>';
      el._m = { size: size, known: known, fill: null, at: null };
    } else if (size === 'i') { var lb = el.querySelector('.pmu-meterlabel'); if (lb) lb.textContent = label; }
    var valEl = el.querySelector('.pmu-metervalue');
    var prevShown = el._m.shown;
    valEl.innerHTML = valueHtml;
    var fill = el.querySelector('.pmu-meterfill'), rail = el.querySelector('.pmu-notchrail'), nEl = el.querySelector('.pmu-notch');
    var reset = el.querySelector('.pmu-reset'), amount = el.querySelector('.pmu-meteramt');
    reset.textContent = spec.resetText || '';
    reset.classList.toggle('is-soon', !!spec.resetSoon);
    amount.textContent = spec.amount || '';
    el.querySelector('.pmu-meterfoot').style.display = spec.resetText || spec.amount ? '' : 'none';
    var overEl = el.querySelector('.pmu-meterover');
    overEl.style.setProperty('--over', over ? String(clamp((spec.pct - 100) / 100, 0, 1)) : '0');
    var oldFill = el._m.fill;
    fill.style.setProperty('--fill', fillPct + '%');
    rail.style.display = notch ? '' : 'none';
    if (notch) {
      rail.style.setProperty('--at', clamp(notch.at, 0, 100) + '%');
      nEl.toggleAttribute('data-faint', !!notch.faint);
      nEl.toggleAttribute('data-off', !!notch.off);
    }
    /* change: the fill slides old to new (520 ms), the notch slides with a spring, the number rolls and pulses */
    if (!first && same && !Mo.reduced()) {
      if (finite(oldFill) && Math.abs(oldFill - fillPct) > 0.05) {
        Mo.anim(fill, [{ transform: 'translateX(' + (oldFill - 100) + '%)' }, { transform: 'translateX(' + (fillPct - 100) + '%)' }], 520, 0, Mo.voice('fill') === Mo.EASE.soft ? noOvershoot : Mo.voice('grow'), 'none');
      }
      if (notch && finite(el._m.at) && Math.abs(el._m.at - notch.at) > 0.05) {
        Mo.anim(rail, [{ transform: 'translateX(' + el._m.at + '%)' }, { transform: 'translateX(' + notch.at + '%)' }], 520, 0, Mo.voice('pop'), 'none');
      }
      if (prev && prev.tone && meterTone(prev) !== tone) Mo.anim(fill, [{ opacity: 0.35 }, { opacity: 1 }], 520, 0, Mo.EASE.out, 'none');
      var num = valEl.querySelector('.pmu-num');
      if (num && known && finite(prevShown) && Math.abs(prevShown - shownPct) >= 0.5 && !spec.valueText) {
        num.setAttribute('data-shown', String(prevShown));
        charts.roll(num, shownPct, function (v) { return String(pctText(v)); }, { dur: 520 });
        charts.pulse(valEl.querySelector('.pmu-meterval'));
      }
    }
    el._m.fill = fillPct; el._m.at = notch ? notch.at : null; el._m.shown = shownPct;
  }
  function enterMeter(c, delay) {
    var el = c.el, fill = el.querySelector('.pmu-meterfill'), rail = el.querySelector('.pmu-notchrail');
    if (!fill) return;
    var f = Mo.fam(), easing = f === 'retro' || f === 'nier' ? Mo.voice('fill') : noOvershoot;
    var target = el._m.fill || 0;
    Mo.anim(fill, [{ transform: 'translateX(-100%)' }, { transform: 'translateX(' + (target - 100) + '%)' }], 900, delay, easing, 'backwards');
    var ov = el.querySelector('.pmu-meterover');
    if (el.hasAttribute('data-over')) Mo.anim(ov, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 260, delay + 820, Mo.EASE.out, 'backwards');
    if (rail && rail.style.display !== 'none') {
      var n = rail.querySelector('.pmu-notch');
      var fin = n.hasAttribute('data-off') ? 'scaleY(.7)' : n.hasAttribute('data-faint') ? 'scaleY(.7)' : 'scaleY(1)';
      Mo.anim(n, [{ transform: 'scaleY(0)' }, { transform: fin }], 520, delay + 700, f === 'retro' || f === 'nier' ? 'steps(3,end)' : Mo.EASE.spring, 'backwards');
    }
    var num = el.querySelector('.pmu-num');
    if (num && finite(el._m.shown) && !c.spec.valueText) {
      num.removeAttribute('data-shown');
      charts.roll(num, el._m.shown, function (v) { return String(pctText(v)); }, { dur: 900, delay: delay });
    }
  }
  charts.windowCell = function (host, spec, opts) { return charts.meter(host, Object.assign({ size: 'k' }, spec), opts); };
  /* the "most room now" headroom (A1 6, 10.3): "69% left" (12.5 / 600) and a 40 px compact bar of % left on one line,
     no ticks, no notch. spec.pct (or spec.left) is the % LEFT, as the contract names it; spec.used is accepted too;
     spec.bare draws the bar alone */
  charts.headroom = function (host, spec, opts) {
    var s = spec || {};
    var left = finite(s.left) ? s.left : finite(s.pct) ? s.pct : finite(s.used) ? 100 - s.used : null;
    return charts.meter(host, { pct: finite(left) ? 100 - left : null, left: true, size: 'h', tone: s.tone, label: s.label, notch: null, vs: s.vs, hover: s.hover, bare: !!s.bare }, opts);
  };

  /* ================= ranked: inset rows with a shared-scale bar (A1 7.11) ================= */
  charts.ranked = function (host, spec, opts) {
    return charts.make('ranked', host, spec, opts, {
      flow: true, role: 'list',
      draw: function (c) { drawRanked(c); },
      update: function (c) { drawRanked(c, true); },
      enter: function (c, delay) { growRows(c, '.pmu-rkfill', delay, 760, 70); }
    });
  };
  function drawRanked(c, morph) {
    var spec = c.spec || {}, rows = spec.rows || [], w = c._w || 300;
    var inline = (c.opts.tier && (c.opts.tier.w === 'xs' || c.opts.tier.w === 's')) || w < 248 || spec.inline;
    var max = spec.scale || 0;
    rows.forEach(function (r) { if (finite(r.value)) max = Math.max(max, r.value); });
    var old = {};
    if (morph) $$('.pmu-rk', c.el).forEach(function (el) { old[el.getAttribute('data-id')] = parseFloat(el.getAttribute('data-f')); });
    c.el.setAttribute('data-inline', inline ? '1' : '0');
    c.el.innerHTML = rows.map(function (r, i) {
      var f = finite(r.value) && max > 0 ? clamp(r.value / max, 0, 1) : 0;
      var k = { idx: r.idx != null ? r.idx : i, vendor: r.vendor, tk: r.tk, tone: r.tone };
      var estF = finite(r.est) && finite(r.value) && r.value > 0 ? clamp(r.est / r.value, 0, 1) : 0;
      var val = finite(r.value) ? esc(r.valueText || charts.fmtValue(r.value, spec.unit)) : PMU.vs.html(r.vs || 'unknown');
      var bar = '<span class="pmu-rkbar"><i class="pmu-rkfill" style="--f:' + (f * 100).toFixed(2) + '%">' +
        (estF < 1 ? '<i class="pmu-mark" data-mark="bar"' + charts.keyAttrs(k) + ' style="flex-grow:' + (1 - estF) + '"></i>' : '') +
        (estF > 0 ? '<i class="pmu-mark" data-mark="bar" data-est="1"' + charts.keyAttrs(k) + ' style="flex-grow:' + estF + '"></i>' : '') + '</i></span>';
      return '<div class="pmu-rk pmu-irow" data-id="' + esc(r.id || i) + '" data-f="' + f + '"' + (r.prov ? ' data-prov="' + esc(r.prov) + '"' : '') +
        hoverAttrs(r.name, r.hover) + '>' +
        '<span class="pmu-rkname">' + (r.mark ? PMU.mark(r.mark, 16) : '') + '<span class="pmu-rkt">' + esc(r.name) + '</span>' + (r.role && !inline ? '<em>' + esc(r.role) + '</em>' : '') + '</span>' +
        '<span class="pmu-rkval"><b>' + val + '</b>' + (finite(r.share) && !inline ? '<em>' + esc(pctText(r.share)) + '%</em>' : '') + '</span>' + bar + '</div>';
    }).join('');
    if (morph && !Mo.reduced()) {
      $$('.pmu-rk', c.el).forEach(function (el) {
        var a = old[el.getAttribute('data-id')], b = parseFloat(el.getAttribute('data-f'));
        if (!finite(a) || !(b > 0) || Math.abs(a - b) < 0.002) return;
        Mo.anim(el.querySelector('.pmu-rkfill'), [{ transform: 'scaleX(' + clamp(a / b, 0, 20) + ')' }, { transform: 'scaleX(1)' }], 520, 0, Mo.EASE.io, 'none');
      });
    }
  }
  function growRows(c, sel, delay, dur, step, cap) {
    $$(sel, c.el).forEach(function (el, i) {
      Mo.anim(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], dur, delay + Math.min(cap || 560, i * step), Mo.voice('grow'));
    });
  }

  /* ================= mix: a 10 px bar with 1 px gaps and a legend (A1 7.11) ================= */
  charts.mix = function (host, spec, opts) {
    return charts.make('mix', host, spec, opts, {
      flow: true,
      draw: function (c) { drawMix(c); },
      update: function (c) {
        var bar = c.el.querySelector('.pmu-mixbar');
        drawMix(c);
        if (bar && !Mo.reduced()) Mo.anim(c.el.querySelector('.pmu-mixbar'), [{ opacity: 0.25 }, { opacity: 1 }], 260, 0, Mo.EASE.out, 'none');
      },
      enter: function (c, delay) {
        $$('.pmu-mixseg', c.el).forEach(function (el, i) {
          Mo.anim(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 480, delay + i * 50, Mo.voice('grow'));
        });
        var lg = c.el.querySelector('.pmu-legend');
        if (lg) Mo.anim(lg, [{ opacity: 0 }, { opacity: 1 }], 260, delay + 200, Mo.EASE.out);
      }
    });
  };
  function drawMix(c) {
    var spec = c.spec || {}, segs = (spec.segments || []).filter(function (s) { return finite(s.value) && s.value > 0; });
    var total = spec.total || segs.reduce(function (a, s) { return a + s.value; }, 0);
    var html = '<div class="pmu-mixbar">' + segs.map(function (s, i) {
      var k = { idx: s.idx != null ? s.idx : i, vendor: s.vendor, tk: s.tk, prov: s.prov };
      return '<i class="pmu-mixseg pmu-mark" data-mark="segment"' + charts.keyAttrs(k) + (s.est ? ' data-est="1"' : '') + ' style="flex-grow:' + s.value + '"' +
        hoverAttrs(s.name, (s.valueText || charts.fmtValue(s.value, spec.unit)) + (total ? ' · ' + pctText(s.value / total * 100) + '%' : '')) + '></i>';
    }).join('') + '</div>';
    c.el.innerHTML = html;
    if (spec.legend !== false) {
      charts.legend(c.el, segs.map(function (s, i) {
        return { key: s.name, name: s.name, idx: s.idx != null ? s.idx : i, vendor: s.vendor, tk: s.tk, prov: s.prov, swatch: s.est ? 'hatch' : 'box',
          valueText: (s.valueText || charts.fmtValue(s.value, spec.unit)) + (total && spec.legend === 'rows' ? ' · ' + pctText(s.value / total * 100) + '%' : '') };
      }), { cls: spec.legend === 'rows' ? 'pmu-legend-rows' : '' });
    }
  }

  /* ================= ring and gauge: Atlas geometry (r 50, stroke 12 in a 120 viewBox), round caps, track ring ================= */
  /* ring spec: {value, max, centre, caption, token|tk|idx} or {segments: [{name, value, idx, tk, hatched}], limit, centre, caption} */
  charts.ring = function (host, spec, opts) { return makeRing('ring', host, spec, opts); };
  charts.gauge = function (host, spec, opts) {
    var s = spec || {};
    return makeRing('gauge', host, Object.assign({}, s, { value: s.value, max: s.max || 100, centre: s.centre, idx: s.idx != null ? s.idx : 1 }), opts);
  };
  function ringSegs(spec) {
    if (spec.segments) {
      var lim = spec.limit || spec.segments.reduce(function (a, s) { return a + (finite(s.value) ? s.value : 0); }, 0) || 1;
      return spec.segments.filter(function (s) { return finite(s.value) && s.value > 0; }).map(function (s, i) {
        return { f: s.value / lim, k: { idx: s.idx != null ? s.idx : i, tk: s.tk, vendor: s.vendor }, hatched: s.hatched, name: s.name, value: s.value };
      });
    }
    var v = finite(spec.value) ? spec.value : 0, mx = spec.max || 100, tok = spec.token || spec.tk;
    var TONES = { calm: 1, warn: 1, crit: 1, exhausted: 1, over: 1 };
    var k = TONES[tok] ? { tone: tok, idx: spec.idx != null ? spec.idx : 0 } : { tk: tok, idx: spec.idx != null ? spec.idx : 0, vendor: spec.vendor, tone: spec.tone };
    return [{ f: clamp(v / mx, 0, 1), k: k, name: spec.caption, value: v }];
  }
  function makeRing(name, host, spec, opts) {
    return charts.make(name, host, spec, opts, {
      flow: true,
      draw: function (c) { drawRing(c); },
      update: function (c, prev) {
        var from = c._segs, oldCv = c.el.querySelector('.pmu-centre-v'), before = oldCv ? parseFloat(oldCv.getAttribute('data-shown')) : NaN;
        drawRing(c);
        if (from && !Mo.reduced()) sweepRing(c, 0, 520, from);
        var cv = c.el.querySelector('.pmu-centre-v');
        if (cv && finite(c.spec.centreValue) && finite(before) && before !== c.spec.centreValue) {
          cv.setAttribute('data-shown', String(before));
          charts.roll(cv, c.spec.centreValue, c.spec.centreFmt, { dur: 520, finalText: c.spec.centre != null ? String(c.spec.centre) : null });
          charts.pulse(cv);
        }
        void prev;
      },
      enter: function (c, delay) {
        sweepRing(c, delay, 900, null);
        var cv = c.el.querySelector('.pmu-centre-v');
        if (cv && finite(c.spec.centreValue)) { cv.removeAttribute('data-shown'); charts.roll(cv, c.spec.centreValue, c.spec.centreFmt, { dur: 1000, delay: delay }); }
        var ct = c.el.querySelector('.pmu-centre');
        if (ct) Mo.anim(ct, [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], 420, delay + 120, Mo.EASE.out);
      }
    });
  }
  function drawRing(c) {
    var spec = c.spec || {};
    var size = spec.size || c.opts.size || clamp(Math.min(c._w || 120, c._h > 40 ? c._h : 120), 56, 160);
    var stroke = spec.stroke || 12;
    var segs = ringSegs(spec);
    var gap = segs.length > 1 ? 1.4 : 0;
    var off = 0, arcs = '';
    segs.forEach(function (s, i) {
      var len = Math.max(0, s.f * 100 - (gap && s.f * 100 > gap ? gap : 0));
      arcs += '<circle class="pmu-mark" data-mark="arc"' + charts.keyAttrs(s.k) + (s.hatched ? ' data-est="1"' : '') + ' cx="60" cy="60" r="50" pathLength="100"' +
        ' style="stroke-dasharray:' + r1(len) + ' 100;stroke-dashoffset:' + r1(-off) + '" data-len="' + r1(len) + '" data-off="' + r1(off) + '"' +
        hoverAttrs(s.name, s.name ? charts.fmtValue(s.value, spec.unit) : '') + '/>';
      off += s.f * 100;
    });
    c._segs = segs.map(function (s) { return s.f; });
    c.el.setAttribute('data-ring', size < 76 ? 'xs' : size < 104 ? 's' : 'm');
    c.el.innerHTML = '<div class="pmu-ringbox" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" style="--sw:' + stroke + '"><g transform="rotate(-90 60 60)">' +
      '<circle class="pmu-ringtrack" cx="60" cy="60" r="50"/>' + arcs + '</g></svg>' +
      '<div class="pmu-centre"><b class="pmu-centre-v">' + esc(spec.centre != null ? spec.centre : '') + '</b>' + (spec.caption ? '<span class="pmu-centre-c">' + esc(spec.caption) + '</span>' : '') + '</div></div>';
    var pm = !finite(spec.centreValue) && finite(spec.value) && typeof spec.centre === 'string' ? /^(\d+)(?:\.(\d+))?%$/.exec(spec.centre) : null;
    if (pm && Math.abs(parseFloat(spec.centre) - spec.value) < 0.06) {
      var dec = pm[2] ? pm[2].length : 0;
      spec.centreValue = spec.value; spec.centreFmt = function (v) { return v.toFixed(dec) + '%'; };
    }
    if (finite(spec.centreValue)) { var cv = c.el.querySelector('.pmu-centre-v'); cv.setAttribute('data-shown', String(spec.centreValue)); }
  }
  function sweepRing(c, delay, dur, from) {
    var arcs = $$('[data-mark="arc"]', c.el);
    if (!arcs.length) return;
    var tg = arcs.map(function (a) { return { len: +a.getAttribute('data-len'), off: +a.getAttribute('data-off') }; });
    var src = from ? (function () { var o = 0; return tg.map(function (x, i) { var f = (from[i] || 0) * 100, r = { len: Math.max(0, f - (tg.length > 1 ? 1.4 : 0)), off: o }; o += f; return r; }); })() : null;
    var total = tg.length ? tg[tg.length - 1].off + tg[tg.length - 1].len : 0;
    if (c._rt) c._rt.cancel();
    var paint = function (k) {
      arcs.forEach(function (a, i) {
        var len, off;
        if (src) { len = src[i].len + (tg[i].len - src[i].len) * k; off = src[i].off + (tg[i].off - src[i].off) * k; }
        else { var head = total * k; off = tg[i].off; len = clamp(head - off, 0, tg[i].len); }
        a.style.strokeDasharray = r1(len) + ' 100';
        a.style.strokeDashoffset = r1(-off);
        a.style.opacity = len > 0.05 ? '' : '0';
      });
    };
    paint(0);
    c._rt = Mo.tween(dur, 'sweep', paint, function () { c._rt = null; paint(1); }, delay);
  }

  /* ================= stackbar: cost by model by token type (A1 7.3) ================= */
  /* spec: {rows: [{id, name, providerId, vendor, segments: [{type, value, tokens}], fill, tokensText, valueText, shareText, attemptsText, hover}],
     heads?: {model, bar, tokens, cost, share, attempts}}; opts.onRow(id, el, row) */
  charts.stackbar = function (host, spec, opts) {
    return charts.make('stackbar', host, spec, opts, {
      flow: true, role: 'table',
      draw: function (c) { drawStackbar(c); },
      update: function (c) {
        var body = c.el.querySelector('.pmu-sbbody');
        if (!body || Mo.reduced()) { drawStackbar(c); return; }
        var a = Mo.anim(body, [{ opacity: 1 }, { opacity: 0 }], 160, 0, Mo.EASE.io, 'forwards');
        var swap = function () { drawStackbar(c); growRows(c, '.pmu-sbfill', 0, 760, 70); };
        if (a) a.onfinish = swap; else swap();
      },
      enter: function (c, delay) { growRows(c, '.pmu-sbfill', delay, 760, 70); }
    });
  };
  var TKN = function (tk) { return (charts.TK_NAMES || {})[tk] || tk; };
  function drawStackbar(c) {
    var spec = c.spec || {}, rows = spec.rows || [], w = c._w || 600;
    var form = w < 360 ? 'two' : w < 480 ? 'm' : w < 600 ? 'l' : w < 720 ? 'xl' : 'xxl';
    var hd = Object.assign({ model: t('charts.h_model'), bar: t('charts.h_bytype'), tokens: t('charts.h_tokens'), cost: t('charts.h_cost'), share: t('charts.h_share'), attempts: t('charts.h_attempts') }, spec.heads || {});
    var cols = form === 'two' ? null : ['name', 'bar', form !== 'm' && form !== 'l' ? 'tokens' : null, 'cost', form !== 'm' ? 'share' : null, form === 'xxl' ? 'attempts' : null].filter(Boolean);
    c.el.setAttribute('data-form', form);
    /* number columns are as wide as their widest value (measured without layout), so every row's grid lines up and a
       wide theme face (Retro's mono) never overflows */
    var FIELD = { tokens: ['tokensText', 400, 56], cost: ['valueText', 620, 76], share: ['shareText', 400, 46], attempts: ['attemptsText', 400, 90] };
    function colW(k) {
      var fd = FIELD[k], m = fd[2];
      rows.forEach(function (r) { if (r[fd[0]]) m = Math.max(m, Math.ceil(charts.textW(r[fd[0]], 13, false, fd[1])) + 6); });
      return Math.min(m, 170);
    }
    var tpl = cols ? cols.map(function (k) {
      return k === 'name' ? (w < 520 ? 'minmax(110px, 180px)' : 'minmax(150px, 220px)') : k === 'bar' ? 'minmax(90px, 1fr)' : colW(k) + 'px';
    }).join(' ') : '';
    var head = cols ? '<div class="pmu-sbhead" style="grid-template-columns:' + tpl + '">' + cols.map(function (k) {
      return '<span class="pmu-cap' + (k !== 'name' && k !== 'bar' ? ' is-num' : '') + '">' + esc(k === 'name' ? hd.model : k === 'bar' ? hd.bar : hd[k]) + '</span>';
    }).join('') + '</div>' : '';
    var body = rows.map(function (r) {
      var segs = (r.segments || []).filter(function (s) { return finite(s.value) && s.value > 0; });
      var fill = clamp(finite(r.fill) ? r.fill : 0, 0.004, 1);
      var bar = '<span class="pmu-sbbar"><span class="pmu-sbfill" style="--f:' + (fill * 100).toFixed(2) + '%">' + segs.map(function (s) {
        return '<i class="pmu-mark" data-mark="segment" data-tk="' + esc(s.type) + '" style="flex-grow:' + s.value + '"' +
          hoverAttrs(TKN(s.type), t('charts.seg_hover', { name: TKN(s.type), value: charts.fmtValue(s.value, 'usd'), tokens: charts.fmtValue(s.tokens, 'tokens') })) + '></i>';
      }).join('') + '</span></span>';
      var name = '<span class="pmu-sbname">' + (r.providerId ? PMU.mark(r.providerId, 18) : '') + '<span class="pmu-sbt">' + esc(r.name) + '</span></span>';
      var cells = { name: name, bar: bar, tokens: '<span class="pmu-sbnum is-2">' + esc(r.tokensText || '') + '</span>', cost: '<span class="pmu-sbnum is-cost">' + esc(r.valueText || '') + '</span>',
        share: '<span class="pmu-sbnum is-2">' + esc(r.shareText || '') + '</span>', attempts: '<span class="pmu-sbnum is-2">' + esc(r.attemptsText || '') + '</span>' };
      var inner = cols ? cols.map(function (k) { return cells[k]; }).join('') : '<span class="pmu-sbline">' + name + cells.cost + '</span>' + bar;
      return '<button type="button" class="pmu-sbrow pmu-irow" data-id="' + esc(r.id) + '"' + (r.providerId ? ' data-prov="' + esc(r.providerId) + '"' : '') +
        (cols ? ' style="grid-template-columns:' + tpl + '"' : '') + hoverAttrs(r.name, r.hover) + '>' + inner + '</button>';
    }).join('');
    c.el.innerHTML = head + '<div class="pmu-sbbody">' + body + '</div>';
    if (c.opts.onRow) {
      $$('.pmu-sbrow', c.el).forEach(function (el) {
        el.addEventListener('click', function () {
          var id = el.getAttribute('data-id');
          $$('.pmu-sbrow.is-sel', c.el).forEach(function (x) { x.classList.remove('is-sel'); });
          el.classList.add('is-sel');
          c.opts.onRow(id, el, rows.filter(function (r) { return String(r.id) === id; })[0]);
        });
      });
    }
  }

  /* ================= donut: model usage (A1 7.4) ================= */
  /* spec: {segments: [{id, name, value, vendor, shade, prov, sub}], centre: {value, caption}, mode: 'tokens'|'cost', fmt?} */
  charts.donut = function (host, spec, opts) {
    return charts.make('donut', host, spec, opts, {
      flow: true,
      draw: function (c) { drawDonut(c, null); },
      update: function (c) { var prev = c._arcs; drawDonut(c, prev); },
      enter: function (c, delay) {
        var paint = c._paintArcs;
        if (!paint) return;
        var labels = c.el.querySelector('.pmu-dlabels');
        paint(0);
        if (c._dt) c._dt.cancel();
        c._dt = Mo.tween(900, 'sweep', function (k) { paint(k); }, function () { c._dt = null; paint(1); }, delay);
        if (labels) Mo.anim(labels, [{ opacity: 0 }, { opacity: 1 }], 260, delay + 900, Mo.EASE.out);
        var cv = c.el.querySelector('.pmu-dc-v');
        if (cv && finite(c._centreNum)) { cv.removeAttribute('data-shown'); charts.roll(cv, c._centreNum, c._centreFmt, { dur: 1000, delay: delay }); }
        $$('.pmu-dl-row', c.el).forEach(function (el, i) { Mo.anim(el, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], 420, delay + 200 + i * 40, Mo.EASE.out); });
      }
    });
  };
  function arcPath(cx, cy, r0, r1v, a0, a1) {
    var big = a1 - a0 > Math.PI ? 1 : 0;
    var p = function (r, a) { return r1(cx + r * Math.sin(a)) + ',' + r1(cy - r * Math.cos(a)); };
    if (a1 - a0 <= 0.0005) return '';
    return 'M' + p(r1v, a0) + 'A' + r1(r1v) + ',' + r1(r1v) + ' 0 ' + big + ' 1 ' + p(r1v, a1) + 'L' + p(r0, a1) + 'A' + r1(r0) + ',' + r1(r0) + ' 0 ' + big + ' 0 ' + p(r0, a0) + 'Z';
  }
  function drawDonut(c, prevArcs) {
    var spec = c.spec || {}, w = c._w || 300, mode = spec.mode || 'tokens';
    var fmtV = spec.fmt || function (v) { return charts.fmtValue(v, mode === 'cost' ? 'usd' : 'tokens'); };
    var segs = (spec.segments || []).filter(function (s) { return finite(s.value) && s.value > 0; }).sort(function (a, b) { return b.value - a.value; });
    var total = segs.reduce(function (a, s) { return a + s.value; }, 0);
    var small = segs.filter(function (s) { return s.value / total < 0.01; });
    if (small.length >= 2) {
      segs = segs.filter(function (s) { return s.value / total >= 0.01; });
      segs.push({ id: '_small', name: t('charts.smaller_models', { n: small.length }), value: small.reduce(function (a, s) { return a + s.value; }, 0), other: true });
    }
    var side = w >= 420, hostH = c._h || 0, ROW = 30;
    var Sz = side ? clamp(0.44 * w, 200, 280) : clamp(0.62 * w, 168, 220);
    /* fit the host the widget gave (content sets its height): the ring shrinks before the legend loses its first rows */
    if (hostH >= 120) Sz = side ? Math.min(Sz, Math.max(150, hostH)) : Math.min(Sz, Math.max(140, hostH - 12 - 3 * ROW));
    var m = Sz < 220 ? 30 : 40, R1 = Sz / 2 - m, R0 = R1 - Math.max(16, Math.round(0.1 * Sz)), cx = Sz / 2, cy = Sz / 2;
    var maxRows = hostH >= 120 ? Math.max(2, Math.floor(((side ? hostH : hostH - Sz - 12) + 2) / ROW)) : 7;
    var a = 0, arcs = segs.map(function (s) { var f = total ? s.value / total : 0, r = { id: s.id || s.name, a0: a, a1: a + f * Math.PI * 2, f: f, s: s }; a += f * Math.PI * 2; return r; });
    c._arcs = arcs.map(function (x) { return { id: x.id, a0: x.a0, a1: x.a1 }; });
    var gap = 0.01;
    var paths = arcs.map(function (x, i) {
      var k = x.s.other ? { idx: 7 } : { vendor: x.s.vendor || 'community', shade: x.s.shade || 1 };
      return '<path class="pmu-mark" data-mark="arc" data-i="' + i + '"' + charts.keyAttrs(k) + (x.s.prov ? ' data-prov="' + esc(x.s.prov) + '"' : '') + '/>';
    }).join('');
    var labels = arcs.filter(function (x) { return x.f >= 0.05; }).map(function (x) {
      var mid = (x.a0 + x.a1) / 2, rr = R1 + 12, lx = cx + rr * Math.sin(mid), ly = cy - rr * Math.cos(mid) + 4;
      var anchor = Math.sin(mid) > 0.2 ? 'start' : Math.sin(mid) < -0.2 ? 'end' : 'middle';
      return '<text class="pmu-tick is-dl" x="' + r1(lx) + '" y="' + r1(ly) + '" text-anchor="' + anchor + '">' + esc(pctText(x.f * 100)) + '%</text>';
    }).join('');
    var centreVal = spec.centre && spec.centre.value != null ? spec.centre.value : fmtV(total);
    var centreCap = spec.centre && spec.centre.caption ? spec.centre.caption : '';
    /* every row fits: up to 7 rows, else the first rows plus one "N smaller models" row (complete or hidden) */
    var showN = arcs.length <= Math.min(7, maxRows) ? arcs.length : Math.max(1, Math.min(6, maxRows - 1));
    var legendRows = arcs.slice(0, showN).map(function (x, i) {
      var k = x.s.other ? { idx: 7 } : { vendor: x.s.vendor || 'community', shade: x.s.shade || 1 };
      return '<div class="pmu-dl-row" data-i="' + i + '"' + (x.s.prov ? ' data-prov="' + esc(x.s.prov) + '"' : '') + '><i class="pmu-swatch"' + charts.keyAttrs(k) + '></i><span class="pmu-dl-n">' + esc(x.s.name) +
        '</span><b>' + esc(x.s.valueText || fmtV(x.s.value)) + '</b><em>' + esc(pctText(x.f * 100)) + '%</em></div>';
    }).join('');
    if (arcs.length > showN) {
      var restArcs = arcs.slice(showN), rest = restArcs.reduce(function (s, x) { return s + x.s.value; }, 0);
      var restN = restArcs.reduce(function (n, x) { return n + (x.s.other ? small.length : 1); }, 0);
      legendRows += '<div class="pmu-dl-row is-rest"><i class="pmu-swatch" data-series-index="7"></i><span class="pmu-dl-n">' + esc(t('charts.smaller_models', { n: restN })) + '</span><b>' + esc(fmtV(rest)) + '</b><em>' + esc(pctText(rest / total * 100)) + '%</em></div>';
    }
    /* the centre value is sized to the hole; the caption shows only where it fits */
    var holeW = 2 * R0 - 14, cfs = 22, ctw = charts.textW(centreVal, 22, false, 640);
    if (ctw > holeW) cfs = Math.max(12, Math.floor(22 * holeW / ctw));
    var capOk = R0 >= 44;
    c.el.setAttribute('data-side', side ? '1' : '0');
    c.el.innerHTML = '<div class="pmu-donut" style="width:' + r1(Sz) + 'px;height:' + r1(Sz) + 'px"><svg width="' + r1(Sz) + '" height="' + r1(Sz) + '" viewBox="0 0 ' + r1(Sz) + ' ' + r1(Sz) + '">' +
      '<circle class="pmu-ringtrack" cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1((R0 + R1) / 2) + '" style="stroke-width:' + r1(R1 - R0) + 'px"/>' + paths +
      '<g class="pmu-dlabels">' + labels + '</g></svg><div class="pmu-dcentre" style="padding:0 ' + r1(m + (R1 - R0) + 6) + 'px"><b class="pmu-dc-v" style="font-size:' + cfs + 'px">' + esc(centreVal) + '</b><span class="pmu-dc-c"' + (capOk ? '' : ' hidden') + '>' + esc(centreCap) + '</span></div></div>' +
      '<div class="pmu-dlegend">' + legendRows + '</div>';
    var pathEls = $$('[data-mark="arc"]', c.el);
    var paint = c._paintArcs = function (k, from) {
      var head = k * Math.PI * 2;
      pathEls.forEach(function (p, i) {
        var x = arcs[i], a0 = x.a0, a1 = x.a1;
        if (from) { var fr = from.filter(function (q) { return q.id === x.id; })[0] || { a0: x.a1, a1: x.a1 }; a0 = fr.a0 + (x.a0 - fr.a0) * k; a1 = fr.a1 + (x.a1 - fr.a1) * k; }
        else { a1 = Math.min(a1, head); }
        p.setAttribute('d', a1 - a0 > 2 * gap ? arcPath(cx, cy, R0, R1, a0 + gap, a1 - gap) : '');
      });
    };
    paint(1);
    if (prevArcs && !Mo.reduced()) {
      if (c._dt) c._dt.cancel();
      c._dt = Mo.tween(520, 'io', function (k) { paint(k, prevArcs); }, function () { c._dt = null; paint(1); });
    }
    /* centre number roll (tokens or money) */
    var cv = c.el.querySelector('.pmu-dc-v');
    c._centreNum = spec.centre && finite(spec.centre.num) ? spec.centre.num : (centreVal === fmtV(total) ? total : null);
    c._centreFmt = spec.centre && spec.centre.fmt ? spec.centre.fmt : fmtV;
    if (finite(c._centreNum)) cv.setAttribute('data-shown', String(c._centreNum));
    /* hover: the arc's share moves into the centre and the other arcs dim to .3 */
    var cap = c.el.querySelector('.pmu-dc-c');
    var hot = function (i) {
      pathEls.forEach(function (p, j) { p.classList.toggle('is-dim', i != null && j !== i); });
      $$('.pmu-dl-row', c.el).forEach(function (r) { r.classList.toggle('is-hot', i != null && +r.getAttribute('data-i') === i); });
      if (i == null) { cv.textContent = centreVal; cap.textContent = centreCap; return; }
      var x = arcs[i];
      cv.textContent = (Math.round(x.f * 1000) / 10).toFixed(1) + '%';
      cap.textContent = x.s.name + ' · ' + (x.s.valueText || fmtV(x.s.value)) + (mode === 'cost' ? '' : ' ' + t('charts.tokens_word'));
    };
    pathEls.forEach(function (p, i) { p.addEventListener('pointerenter', function () { hot(i); }); p.addEventListener('pointerleave', function () { hot(null); }); });
    $$('.pmu-dl-row[data-i]', c.el).forEach(function (r) { r.addEventListener('pointerenter', function () { hot(+r.getAttribute('data-i')); }); r.addEventListener('pointerleave', function () { hot(null); }); });
  }

  /* ================= sharebars: token breakdown (A1 7.5) ================= */
  /* spec: {rows: [{type, name, tokens, tokenShare, value, valueShare, vs, tokensText, valueText}]} shares in % (or fractions) */
  charts.sharebars = function (host, spec, opts) {
    return charts.make('sharebars', host, spec, opts, {
      flow: true,
      draw: function (c) { drawShare(c); },
      update: function (c) {
        var old = {};
        $$('.pmu-tb i', c.el).forEach(function (el) { old[el.getAttribute('data-k')] = parseFloat(el.style.getPropertyValue('--f')); });
        drawShare(c);
        if (Mo.reduced()) return;
        $$('.pmu-tb i', c.el).forEach(function (el) {
          var a = old[el.getAttribute('data-k')], b = parseFloat(el.style.getPropertyValue('--f'));
          if (finite(a) && b > 0 && Math.abs(a - b) > 0.05) Mo.anim(el, [{ transform: 'scaleX(' + clamp(a / b, 0, 30) + ')' }, { transform: 'scaleX(1)' }], 520, 0, Mo.EASE.io, 'none');
        });
      },
      enter: function (c, delay) {
        $$('.pmu-tbrow', c.el).forEach(function (row, i) {
          $$('.pmu-tb i', row).forEach(function (el, j) {
            Mo.anim(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 820, delay + i * 90 + j * 40, Mo.voice('grow'));
          });
          Mo.anim(row, [{ opacity: 0 }, { opacity: 1 }], 420, delay + i * 60, Mo.EASE.out);
        });
        $$('b[data-roll]', c.el).forEach(function (b) {
          var v = parseFloat(b.getAttribute('data-v')), u = b.getAttribute('data-roll');
          if (!finite(v)) return;
          b.removeAttribute('data-shown');
          charts.roll(b, v, function (x) { return charts.fmtValue(x, u); }, { dur: 900, delay: delay, finalText: b.textContent });
        });
      }
    });
  };
  function drawShare(c) {
    var spec = c.spec || {}, rows = spec.rows || [], w = c._w || 400;
    var frac = rows.reduce(function (a, r) { return a + (finite(r.tokenShare) ? r.tokenShare : 0); }, 0) <= 1.0001;
    var sh = function (v) { return finite(v) ? (frac ? v * 100 : v) : null; };
    var narrow = spec.narrow != null ? !!spec.narrow : w < 360;
    c.el.setAttribute('data-narrow', narrow ? '1' : '0');
    var p = function (v) { return v == null ? '-' : v > 0 && v < 0.1 ? '<0.1%' : (Math.round(v * 10) / 10).toFixed(1) + '%'; };
    c.el.innerHTML = rows.map(function (r) {
      var ts = sh(r.tokenShare), vs = sh(r.valueShare), tk = r.type;
      var tokT = r.tokensText || charts.fmtValue(r.tokens, 'tokens'), valT = r.valueText || charts.fmtValue(r.value, 'usd');
      if (r.vs && r.vs !== 'ok' && !finite(r.tokens)) {
        return '<div class="pmu-tbrow is-unknown"><span class="pmu-tbname"><i class="pmu-swatch" data-series-index="7"></i>' + esc(r.name) + '</span><span class="pmu-tbstate">' + PMU.vs.html(r.vs, r.vsWord) + '</span></div>';
      }
      var bars = '<span class="pmu-tbbars"><span class="pmu-tb is-tok"><i data-k="' + esc(tk) + 't" data-tk="' + esc(tk) + '" style="--f:' + Math.max(ts > 0 ? 0.6 : 0, ts || 0) + '%"></i></span>' +
        '<span class="pmu-tb is-cost"><i data-k="' + esc(tk) + 'c" data-tk="' + esc(tk) + '" style="--f:' + Math.max(vs > 0 ? 0.6 : 0, vs || 0) + '%"></i></span></span>';
      var name = '<span class="pmu-tbname"><i class="pmu-swatch" data-tk="' + esc(tk) + '"></i>' + esc(r.name) + '</span>';
      if (narrow) return '<div class="pmu-tbrow"' + hoverAttrs(r.name, valT + ' · ' + p(vs) + ' ' + t('charts.of_cost')) + '><span class="pmu-tbline">' + name +
        '<span class="pmu-tbv"><b>' + esc(tokT) + '</b> · ' + p(ts) + '</span></span>' + bars + '</div>';
      return '<div class="pmu-tbrow">' + name + bars + '<span class="pmu-tbvals"><span><b data-roll="tokens" data-v="' + (finite(r.tokens) ? r.tokens : '') + '">' + esc(tokT) + '</b><em>' + p(ts) + '</em></span>' +
        '<span><b data-roll="usd" data-v="' + (finite(r.value) ? r.value : '') + '">' + esc(valT) + '</b><em>' + p(vs) + '</em></span></span></div>';
    }).join('');
  }

  /* ================= split: cache reads versus writes (A1 7.6) ================= */
  charts.split = function (host, spec, opts) {
    return charts.make('split', host, spec, opts, {
      flow: true, noObserve: true,
      draw: function (c) { drawSplit(c); },
      update: function (c) { drawSplit(c); },
      enter: function (c, delay) {
        var bar = c.el.querySelector('.pmu-splitbar');
        if (bar) Mo.anim(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 760, delay, Mo.voice('grow'));
      }
    });
  };
  function drawSplit(c) {
    var parts = (c.spec && c.spec.parts) || [];
    var total = parts.reduce(function (a, p) { return a + (finite(p.value) ? p.value : 0); }, 0);
    var own = charts.ownLegend(c);
    c.el.innerHTML = '<div class="pmu-splitbar">' + parts.map(function (p) {
      return '<i class="pmu-mark" data-mark="segment" data-tk="' + esc(p.token) + '" style="flex-grow:' + (finite(p.value) ? p.value : 0) + '"' +
        hoverAttrs(p.name, charts.fmtValue(p.value, 'tokens') + (total ? ' · ' + pctText(p.value / total * 100) + '%' : '')) + '></i>';
    }).join('') + '</div>' + (own ? '' : '<div class="pmu-splitleg">' + parts.map(function (p) {
      return '<span><i class="pmu-swatch" data-tk="' + esc(p.token) + '"></i>' + esc(p.name) + ' <b>' + (finite(p.value) && p.value > 0 ? esc(charts.fmtValue(p.value, 'tokens')) : esc(t('charts.none_recorded'))) + '</b></span>';
    }).join('<span class="pmu-dotsep">·</span>') + '</div>');
  }

  /* ================= kpi: a tile value with count-up, delta and sub-line (A1 3.5) ================= */
  /* spec: {value: number|null, fmt(v) -> string, vs?, delta?: {text, dir, tone}, sub?: html, est?: boolean}. The value rolls up
     (1000 ms) on entry and from the old value (520 ms) with the pulse on a change; a missing value shows its state words. */
  charts.kpi = function (host, spec, opts) {
    return charts.make('kpi', host, spec, opts, {
      flow: true, noObserve: true, role: 'group',
      draw: function (c) { drawKpi(c); },
      update: function (c, prev) {
        var v = c.el.querySelector('.pmu-kpivalue .pmu-num');
        var before = v ? parseFloat(v.getAttribute('data-shown')) : NaN;
        drawKpi(c, true);
        var nv = c.el.querySelector('.pmu-kpivalue .pmu-num');
        if (nv && finite(before) && finite(c.spec.value) && before !== c.spec.value) {
          nv.setAttribute('data-shown', String(before));
          charts.roll(nv, c.spec.value, c.spec.fmt, { dur: 520 });
          charts.pulse(c.el.querySelector('.pmu-kpivalue'));
        }
        void prev;
      },
      enter: function (c, delay) {
        var nv = c.el.querySelector('.pmu-kpivalue .pmu-num');
        if (nv && finite(c.spec.value)) { nv.removeAttribute('data-shown'); charts.roll(nv, c.spec.value, c.spec.fmt, { dur: 1000, delay: delay }); }
        var d = c.el.querySelector('.pmu-kpidelta');
        if (d) Mo.anim(d, [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], 240, delay + 1000, Mo.EASE.out);
      }
    });
  };
  function drawKpi(c) {
    var s = c.spec || {}, fmt = s.fmt || function (v) { return charts.fmtValue(v, s.unit); };
    var val = finite(s.value) ? '<span class="pmu-num" data-shown="' + s.value + '">' + esc(fmt(s.value)) + '</span>' + (s.est ? '<span class="pmu-u"> ' + esc(t('charts.est')) + '</span>' : '')
      : '<span class="pmu-kpina">' + PMU.vs.html(s.vs || 'unknown', s.vsWord) + '</span>';
    var delta = s.delta && s.delta.text ? '<span class="pmu-kpidelta" data-dir="' + esc(s.delta.dir || 'flat') + '" data-tone="' + esc(s.delta.tone || 'neutral') + '">' +
      (s.delta.dir === 'up' ? PMU.icon('arrowUp', 'pmu-kpiarrow') : s.delta.dir === 'down' ? PMU.icon('arrowDown', 'pmu-kpiarrow') : '') + esc(s.delta.text) + '</span>' : '';
    c.el.innerHTML = '<div class="pmu-kpiline"><b class="pmu-kpivalue">' + val + '</b>' + delta + '</div>' + (s.sub ? '<div class="pmu-kpisub">' + s.sub + '</div>' : '');
  }
})();
