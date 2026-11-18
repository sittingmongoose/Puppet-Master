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
     estimated, stale, dimmed, binding, window, prov, left (show % left: headroom), hover: {label, detail}, valueText}
     Round 3 (WOW-SPEC-3 4.5, 4.6): the meter carries --v (the USED value, also for a headroom bar) next to data-ramp, so the
     calm ramp shades it continuously (30-charts.css); at rest a recessed track, a gradient fill with a specular top line and
     a 3 px lit tip whose glow leaves the track. */
  charts.meter = function (host, spec, opts) {
    return charts.make('meter', host, spec, opts, {
      flow: true, noObserve: true, role: 'meter',
      draw: function (c, first) { paintMeter(c, first); },
      update: function (c, prev) { paintMeter(c, false, prev); },
      live: function (c, prev, lo) { return paintMeter(c, false, prev, lo); },
      snapshot: function (c) { var m = c.el._m; return m ? { size: m.size, known: m.known, fill: m.fill, at: m.at, shown: m.shown, v: m.v, ramp: c.el.getAttribute('data-ramp'), tone: c.el.getAttribute('data-tone') } : null; },
      carry: function (c, from) {
        paintMeter(c, true);
        var o = from.snap, m = c.el._m;
        if (!o || !m || o.size !== m.size || o.known !== m.known) return;
        m.fill = o.fill; m.at = o.at; m.shown = o.shown; m.v = o.v;
        if (o.ramp != null) c.el.setAttribute('data-ramp', o.ramp);
        if (o.tone) c.el.setAttribute('data-tone', o.tone);
        if (finite(o.v)) c.el.style.setProperty('--v', String(o.v));
        paintMeter(c, false, from.spec);
      },
      enter: function (c, delay) { enterMeter(c, delay); },
      still: function () {}
    });
  };
  function meterTone(spec) { return finite(spec.pct) ? charts.rampTone(spec.pct, spec.tone) : 'missing'; }
  /* the fill's step on the severity ramp (WOW-SPEC 2.3, WOW-SPEC-3 4.5) */
  function rampOf(tone, pct) { return tone === 'missing' ? null : charts.rampStep(tone, pct); }
  function setV(el, v) { if (finite(v)) el.style.setProperty('--v', String(v)); else el.style.removeProperty('--v'); }
  /* paintMeter(c, first, prev, lo): lo = a live change ({lead, still, soft, delay}); returns {anims} */
  function paintMeter(c, first, prev, lo) {
    var spec = c.spec || {}, el = c.el, size = spec.size || (c.opts && c.opts.size) || 'c';
    el.classList.add('pmu-meter');
    var known = finite(spec.pct), tone = meterTone(spec);
    var shownPct = known ? (spec.left ? Math.max(0, 100 - spec.pct) : spec.pct) : null;
    var fillPct = known ? clamp(spec.left ? 100 - spec.pct : spec.pct, 0, 100) : 0;
    var vUsed = known ? r1(clamp(spec.pct, 0, 100)) : null;
    el.setAttribute('data-size', size);
    var ramp = known ? rampOf(tone, spec.pct) : null;
    var same = el._m && el._m.size === size && el._m.known === known;
    /* the colour holds while the fill moves (the heat layer brings the new one, 34 heatUp); every other path paints the
       new colour at once */
    var moving = !first && same && !Mo.reduced() && !(lo && lo.still) && finite(el._m.fill) && Math.abs(el._m.fill - fillPct) > 0.05;
    if (!moving) {
      el.setAttribute('data-tone', tone);
      if (ramp == null) el.removeAttribute('data-ramp'); else el.setAttribute('data-ramp', String(ramp));
      if (!el._m || el._m.v !== vUsed) setV(el, vUsed);
    }
    el.toggleAttribute('data-zero', known && fillPct < 0.5);
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
    var hl = hv.label || label || t('charts.window');
    if (el.getAttribute('data-pm-hover-label') !== hl) el.setAttribute('data-pm-hover-label', hl);
    if (el.getAttribute('data-pm-hover-detail') !== detail) el.setAttribute('data-pm-hover-detail', detail);
    /* spec.suffix replaces "used" / "left" and spec.noPct drops the % sign (a pressure score reads "78 score") */
    var suffix = spec.suffix != null ? spec.suffix : spec.left ? t('charts.left') : t('charts.used');
    var numText = known ? String(spec.valueText || pctText(shownPct)) : '';
    var valueHtml = known
      ? '<b class="pmu-meterval"><span class="pmu-num">' + esc(numText) + '</span>' + (spec.valueText || spec.noPct ? '' : '<span class="pmu-u">%</span>') + '</b>' +
        '<span class="pmu-suffix">' + esc(suffix) + (spec.estimated ? ' ' + esc(t('charts.est')) : '') + '</span>'
      : '<span class="pmu-meterna">' + PMU.vs.html(spec.vs && spec.vs !== 'ok' ? spec.vs : 'unknown', spec.vsWord) + '</span>';
    var notch = spec.notch && finite(spec.notch.at) && !spec.left ? spec.notch : null;
    if (!same) {
      el.innerHTML = '<div class="pmu-meterline">' + (size === 'i' ? '<span class="pmu-meterlabel">' + esc(label) + '</span>' : size === 'k' && spec.window && !spec.noLabel ? '<span class="pmu-meterlabel is-short"' + '>' + esc(shortWin(spec)) + '</span>' : '') + '<span class="pmu-metervalue"></span></div>' +
        '<div class="pmu-metertrack"><span class="pmu-meterclip"><i class="pmu-meterfill pmu-mark" data-mark="fill"><i class="pmu-meterwash"></i></i></span><i class="pmu-meterover pmu-mark" data-mark="segment"></i>' +
        '<span class="pmu-notchrail"><i class="pmu-notch"></i></span></div>' +
        '<div class="pmu-meterfoot"><span class="pmu-reset"></span><span class="pmu-meteramt"></span></div>';
      el._m = { size: size, known: known, fill: null, at: null, v: null, html: null };
    } else if (size === 'i') { var lb = el.querySelector('.pmu-meterlabel'); if (lb && lb.textContent !== label) lb.textContent = label; }
    else if (size === 'k') { var lk = el.querySelector('.pmu-meterlabel.is-short'), sw = shortWin(spec); if (lk && lk.textContent !== sw) lk.textContent = sw; }
    var valEl = el.querySelector('.pmu-metervalue');
    var prevShown = el._m.shown;
    /* the value line is patched in place (PERF-3 rule 7: a live beat changes no child list): the number's text follows
       below (rolled or written), the rest only when its words changed */
    var shapeKey = known ? 'k|' + (spec.valueText || spec.noPct ? '1' : '0') + '|' + suffix + '|' + !!spec.estimated : 'n|' + spec.vs + '|' + (spec.vsWord || '');
    if (el._m.html !== shapeKey || !valEl.firstChild) { valEl.innerHTML = valueHtml; el._m.html = shapeKey; }
    var fill = el.querySelector('.pmu-meterfill'), rail = el.querySelector('.pmu-notchrail'), nEl = el.querySelector('.pmu-notch');
    var reset = el.querySelector('.pmu-reset'), amount = el.querySelector('.pmu-meteramt');
    if (reset.textContent !== (spec.resetText || '')) reset.textContent = spec.resetText || '';
    reset.classList.toggle('is-soon', !!spec.resetSoon);
    if (amount.textContent !== (spec.amount || '')) amount.textContent = spec.amount || '';
    var footDisp = spec.resetText || spec.amount ? '' : 'none', footEl = el.querySelector('.pmu-meterfoot');
    if (footEl.style.display !== footDisp) footEl.style.display = footDisp;
    var overEl = el.querySelector('.pmu-meterover'), ov = over ? String(clamp((spec.pct - 100) / 100, 0, 1)) : '0';
    if (overEl.style.getPropertyValue('--over') !== ov) overEl.style.setProperty('--over', ov);
    var oldFill = el._m.fill, oldAt = el._m.at, oldV = el._m.v;
    fill.style.setProperty('--fill', fillPct + '%');
    var railDisp = notch ? '' : 'none';
    if (rail.style.display !== railDisp) rail.style.display = railDisp;
    if (notch) {
      rail.style.setProperty('--at', clamp(notch.at, 0, 100) + '%');
      nEl.toggleAttribute('data-faint', !!notch.faint);
      nEl.toggleAttribute('data-off', !!notch.off);
    }
    var num = valEl.querySelector('.pmu-num'), anims = 0;
    /* a change (WOW-SPEC 3.8, WOW-SPEC-3 8.4): the fill slides old -> new 520 ROLL with the head glow riding it (a live
       change: only the beat's lead carries it, never without a GPU); the colour follows through the pre-painted heat
       layer; the notch slides 320 ms (.2,.8,.2,1) and pops at a threshold crossing; the value rolls only its changed
       digits; a meter that reaches 95 % or more rings once. Unchanged readings never animate (WOW-SPEC-3 9.1). */
    if (!first && same && !Mo.reduced() && !(lo && lo.still)) {
      var fam = Mo.fam(), stepped = fam === 'retro' || fam === 'nier';
      var fillEase = stepped ? (fam === 'nier' ? 'steps(5,jump-start)' : 'steps(6,jump-start)') : noOvershoot;
      var delay = lo && lo.delay || 0, hu = null;
      if (moving) {
        if (Mo.anim(fill, [{ transform: 'translateX(' + (oldFill - 100) + '%)' }, { transform: 'translateX(' + (fillPct - 100) + '%)' }], 520, delay, fillEase, lo ? 'backwards' : 'none')) anims++;
        var glow = !spec.estimated && (!lo || (lo.lead && !lo.soft));
        if (glow && PMU.film && PMU.film.headGlow && PMU.film.headGlow(fill.closest('.pmu-metertrack'), { from: oldFill, to: fillPct, dur: 520, delay: delay, easing: fillEase })) anims++;
        var hu = heatUp(el, fill, prev, spec, oldFill, fillPct, fillEase, oldV, vUsed, tone, ramp, delay);
        anims += hu.n;
        /* Friendly (WOW-SPEC-3 8.4): the lit head hops 3 px when a live fill lands; the number never bounces */
        if (lo && fam === 'friendly' && !lo.soft && !spec.estimated && fillPct > 0.5) {
          try { fill.animate([{ transform: 'none' }, { transform: 'translateY(-3px)', offset: 0.4 }, { transform: 'none' }], { duration: 260, delay: delay + 520, easing: 'cubic-bezier(.34,1.56,.64,1)', pseudoElement: '::after' }); anims++; } catch (error) {}
        }
      }
      if (notch && finite(oldAt) && Math.abs(oldAt - notch.at) > 0.05) {
        /* the slide is kept on the rail (rail._pmuSlide) so a Settings ripple can retime it without getAnimations() (a style
           flush per call: 25-36 ms per ripple on the VM, PERF-3) */
        rail._pmuSlide = Mo.anim(rail, [{ transform: 'translateX(' + (oldAt - notch.at).toFixed(2) + '%)' }, { transform: 'none' }], stepped ? 160 : 320, 0, stepped ? 'steps(4,jump-start)' : 'cubic-bezier(.2,.8,.2,1)', 'none');
        if (rail._pmuSlide) anims++;
      }
      /* a threshold crossing (calm -> warn, warn -> switch, ...): the notch pops once as the head reaches it (260 POP) */
      /* the notch flashes at the frame the head crosses a threshold (warn, switch, exhausted): the heat layer's crossing */
      if (lo && notch && nEl && hu && finite(hu.crossAt)) {
        if (Mo.anim(nEl, [{ scale: '1' }, { scale: '1.6', offset: 0.4 }, { scale: '1' }], 260, hu.crossAt, stepped ? 'steps(3,jump-start)' : (PMU.film && PMU.film.E ? PMU.film.E.pop : Mo.EASE.spring), 'none')) anims++;
      }
      if (num && known && !spec.valueText && finite(prevShown) && Math.abs(prevShown - shownPct) >= 0.05 && String(pctText(prevShown)) !== String(pctText(shownPct))) {
        num.setAttribute('data-shown', String(prevShown));
        charts.roll(num, shownPct, function (v) { return String(pctText(v)); }, { dur: 420, delay: delay });
        anims++;
      } else if (num && num.textContent !== numText && !num._pmuOdo) num.textContent = numText;
      if (known && spec.pct >= 95 && !(prev && finite(prev.pct) && prev.pct >= 95) && PMU.film && PMU.film.ring && (!lo || lo.lead)) { if (PMU.film.ring(fill.closest('.pmu-metertrack'), { delay: delay + 420 })) anims++; }
    } else if (num && num.textContent !== numText) {
      if (num._pmuOdo) num._pmuOdo.cancel();
      num.textContent = numText;
    }
    if (num && known) num.setAttribute('data-shown', String(shownPct));
    el._m.fill = fillPct; el._m.at = notch ? notch.at : null; el._m.shown = shownPct;
    if (!moving) el._m.v = vUsed;
    return { anims: anims };
  }
  /* heat-up while the fill moves (WOW-SPEC-3 8.4, NOTES3-perf Q7): the colour of a moving value changes through a layer
     pre-painted in the new colour (ramp step + --v) that cross-fades in by opacity (300 OUT, compositor) at the frame the
     head crosses a step, or at the end of the move when the step stays and the spectrum shade moved visibly; never an
     animated custom property. When the move ends the meter takes the new step, tone and --v and the layers go (one task). */
  function heatUp(el, fill, prev, spec, a, b, easing, oldV, newV, newTone, newR, delay) {
    var prevR = prev && finite(prev.pct) ? rampOf(meterTone(prev), prev.pct) : +el.getAttribute('data-ramp');
    var layers = [], lastAt = 0, n = 0, crossAt = null;
    var mkLayer = function (step, v, at) {
      if (step >= 2 && crossAt == null) crossAt = at;
      var lay = H('i', 'pmu-meterheat');
      lay.setAttribute('data-step', String(step));
      if (finite(v)) lay.style.setProperty('--v', String(v));
      fill.insertBefore(lay, fill.querySelector('.pmu-meterwash'));   /* in step order: the latest step paints on top */
      layers.push({ el: lay, at: at });
      lastAt = Math.max(lastAt, at);
    };
    if (finite(prevR) && newR != null && prevR !== newR && !spec.left) {
      /* the value where each step starts: 50 (cyan), the warn and switch points of the tones, 100. A meter that carries its
         own warn and switch points (its provider's policy, item 2: C.meterSpec thresholds) steps at those, not the shared */
      var starts = { 0: 0, 1: 50 }, thr = spec.thresholds && finite(spec.thresholds.warn) && finite(spec.thresholds.switch) ? spec.thresholds : null;
      for (var v = 50; v <= 101; v += 1) { var r = rampOf(thr ? (v > 100 ? 'over' : v >= 100 ? 'exhausted' : v >= thr.switch ? 'crit' : v >= thr.warn ? 'warn' : 'calm') : meterTone({ pct: v }), v); if (starts[r] == null) starts[r] = v; }
      var dir = newR > prevR ? 1 : -1;
      for (var step = prevR + dir; dir > 0 ? step <= newR : step >= newR; step += dir) {
        var at = starts[dir > 0 ? step : step + 1];
        if (!finite(at)) at = dir > 0 ? b : a;
        var frac = clamp((at - a) / ((b - a) || 1), 0, 1);
        mkLayer(step, step === newR ? newV : at, delay + 520 * (PMU.film && PMU.film.edgeAt ? PMU.film.edgeAt(frac, easing) : frac));
      }
    } else if (newR != null && newR <= 1 && finite(oldV) && finite(newV) && Math.abs(newV - oldV) >= 4) {
      mkLayer(newR, newV, delay + 220);   /* the shade moved visibly inside the calm ramp: it lands with the move */
    }
    layers.forEach(function (L) { if (Mo.anim(L.el, [{ opacity: 0 }, { opacity: 1 }], 300, L.at, 'cubic-bezier(.22,.8,.28,1)', 'both')) n++; });
    var swapTone = function () { el.setAttribute('data-tone', newTone); };
    var finish = function () {
      if (newR == null) el.removeAttribute('data-ramp'); else el.setAttribute('data-ramp', String(newR));
      el.setAttribute('data-tone', newTone);
      setV(el, newV);
      if (el._m) el._m.v = newV;
      layers.forEach(function (L) { L.el.remove(); });
    };
    /* the value words take their new tone at the last crossing (the colour follows the counting value) */
    var endAt = Math.max(delay + 520, lastAt + 300);
    if (Mo.reduced() || !PMU.film || !PMU.film.at) finish();
    else { if (layers.length) PMU.film.at(lastAt, swapTone); PMU.film.at(endAt + 10, finish); }
    return { n: n, crossAt: crossAt };
  }
  /* the short window word of a narrow meter: 5h / Wk / Mo (the full name stays in the hover tag) */
  var SHORT_WIN = { fiveHour: '5h', weekly: 'Wk', monthly: 'Mo', daily: 'Day' };
  function shortWin(spec) { return SHORT_WIN[spec.window] || String(spec.label || '').split(/\s+/)[0]; }
  /* the entrance: the hero's meters fill 900 ROLL with the head glow riding and the value rolling with the fill; a quiet
     (supporting) meter fills 520 ROLL with no light and its value already final (WOW-SPEC-3 5 Phase C) */
  function enterMeter(c, delay) {
    var el = c.el, fill = el.querySelector('.pmu-meterfill'), rail = el.querySelector('.pmu-notchrail');
    if (!fill) return;
    var f = Mo.fam(), easing = f === 'retro' || f === 'nier' ? Mo.voice('fill') : noOvershoot;
    var target = el._m.fill || 0, q = c._quiet, dur = q ? 520 : 900;
    Mo.anim(fill, [{ transform: 'translateX(-100%)' }, { transform: 'translateX(' + (target - 100) + '%)' }], dur, delay, easing, 'backwards');
    /* the head glow rides the fill's head (WOW-SPEC 3.1 Phase C, 3.8; PMU.film.headGlow); never on a quiet meter */
    if (!q && PMU.film && PMU.film.headGlow && target > 0.5 && !c.spec.estimated) PMU.film.headGlow(fill.closest('.pmu-metertrack'), { to: target, dur: dur, delay: delay, easing: easing });
    var ov = el.querySelector('.pmu-meterover');
    if (el.hasAttribute('data-over')) Mo.anim(ov, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 260, delay + dur - 80, Mo.EASE.out, 'backwards');
    if (!q && rail && rail.style.display !== 'none') {
      var n = rail.querySelector('.pmu-notch');
      var fin = n.hasAttribute('data-off') ? 'scaleY(.7)' : n.hasAttribute('data-faint') ? 'scaleY(.7)' : 'scaleY(1)';
      /* the notch drops 140 ms after its fill ends: 240 ms, zero overshoot (WOW-SPEC 3.1 Phase C) */
      Mo.anim(n, [{ transform: 'scaleY(0)' }, { transform: fin }], 240, delay + dur + 140, f === 'retro' || f === 'nier' ? 'steps(3,end)' : 'cubic-bezier(.17,.84,.29,.99)', 'backwards');
    }
    var num = el.querySelector('.pmu-num');
    if (!q && num && finite(el._m.shown) && !c.spec.valueText) {
      num.removeAttribute('data-shown');
      /* the number rolls with its fill (same 900 ms), digits straight to their place (no spin: the fill shows the value) */
      charts.roll(num, el._m.shown, function (v) { return String(pctText(v)); }, { dur: 900, delay: delay, spins: 0 });
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
      snapshot: function (c) { var o = {}; $$('.pmu-rk', c.el).forEach(function (el) { o[el.getAttribute('data-id')] = parseFloat(el.getAttribute('data-f')); }); return o; },
      carry: function (c, from) { c._old = from.snap; drawRanked(c, true); c._old = null; },
      enter: function (c, delay) { growRows(c, '.pmu-rkfill', delay, c._quiet ? 520 : 760, 36, null, c._quiet); },
      live: function (c, prev, lo) { return liveRanked(c, lo); },
      still: function () {}
    });
  };
  function drawRanked(c, morph) {
    var spec = c.spec || {}, rows = spec.rows || [], w = c._w || 300;
    /* (lane c-presets) a spec that says inline: false (the ranked kind measured no room for its names) keeps two lines */
    var inline = spec.inline === false ? false : (c.opts.tier && (c.opts.tier.w === 'xs' || c.opts.tier.w === 's')) || w < 248 || spec.inline;
    var max = spec.scale || 0;
    rows.forEach(function (r) { if (finite(r.value)) max = Math.max(max, r.value); });
    var old = c._old || {};
    if (morph && !c._old) $$('.pmu-rk', c.el).forEach(function (el) { old[el.getAttribute('data-id')] = parseFloat(el.getAttribute('data-f')); });
    c.el.setAttribute('data-inline', inline ? '1' : '0');
    /* one-line rows share a name column as wide as the longest name (measured without layout, capped at 55 %), so
       every bar starts at the same x and no short name is cut */
    if (inline) {
      var nw = 0; rows.forEach(function (r) { nw = Math.max(nw, charts.textW(r.name || '', 13) + (r.mark ? 24 : 0)); });
      /* +15 %: NieR and Retro draw these names in wider faces than the measured theme font */
      c.el.style.setProperty('--rk-name', 'minmax(0, ' + Math.ceil(nw * 1.15 + 8) + 'px)');
    } else c.el.style.removeProperty('--rk-name');
    c.el.innerHTML = rows.map(function (r, i) {
      var f = finite(r.value) && max > 0 ? clamp(r.value / max, 0, 1) : 0;
      var k = { idx: r.idx != null ? r.idx : i, vendor: r.vendor, tk: r.tk, tone: r.tone };
      var estF = finite(r.est) && finite(r.value) && r.value > 0 ? clamp(r.est / r.value, 0, 1) : 0;
      var val = finite(r.value) ? esc(r.valueText || charts.fmtValue(r.value, spec.unit)) : PMU.vs.html(r.vs || 'unknown');
      /* shared-element keys (content N3-1): the bar carries the row's window (row.shareKey, win:...; row.share is the numeric
         share column), the mark its provider (row.markShare, prov:...) */
      var bar = '<span class="pmu-rkbar"' + (r.shareKey ? ' data-share="' + esc(r.shareKey) + '"' : '') + '><i class="pmu-rkfill" style="--f:' + (f * 100).toFixed(2) + '%">' +
        (estF < 1 ? '<i class="pmu-mark" data-mark="bar"' + charts.keyAttrs(k) + ' style="flex-grow:' + (1 - estF) + '"></i>' : '') +
        (estF > 0 ? '<i class="pmu-mark" data-mark="bar" data-est="1"' + charts.keyAttrs(k) + ' style="flex-grow:' + estF + '"></i>' : '') + '</i></span>';
      /* a "% used" row (route pressure: a state tone on a 100 scale) takes the calm ramp by its value (WOW-SPEC-3 4.5) */
      var rampOn = finite(r.value) && r.tone && r.ramp !== false && (spec.scale === 100 || spec.ramp);
      return '<div class="pmu-rk pmu-irow" data-id="' + esc(r.id || i) + '" data-f="' + f + '"' + (r.prov ? ' data-prov="' + esc(r.prov) + '"' : '') +
        (rampOn ? charts.rampAttr(r.value, r.tone) + ' style="' + charts.rampVar(r.value) + '"' : '') +
        hoverAttrs(r.name, r.hover) + '>' +
        '<span class="pmu-rkname">' + (r.mark ? (r.markShare ? '<span class="pmu-rkmark" data-share="' + esc(r.markShare) + '">' + PMU.mark(r.mark, 16) + '</span>' : PMU.mark(r.mark, 16)) : '') + '<span class="pmu-rkt">' + esc(r.name) + '</span>' + (r.role && !inline ? '<em>' + esc(r.role) + '</em>' : '') + '</span>' +
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
  /* rows grow left to right with light (WOW-SPEC 3.3, WOW-TASKS C-3): scaleX 0 -> 1, 760 ms ROLL, 36 ms apart, and the
     head glow (PMU.film.headGlow) rides each bar's head on its track; Retro grows in six steps, NieR in five */
  function growEase() { var f = Mo.fam(); return f === 'retro' ? 'steps(6,jump-start)' : f === 'nier' ? 'steps(5,jump-start)' : noOvershoot; }
  /* a live change of a ranked list (WOW-SPEC-3 8.4, C3-4), in place: the changed values roll only their changed digits,
     the bars scale from their old length (420 SLIDE), and when the order changes the rows re-rank by CSS order (no
     child-list change: the app's document observers stay asleep) with a FLIP slide 420 SLIDE 20 apart and the moving row's
     soft highlight (row-sel 60 % -> 0, 600). One batched read of the row tops, only when the order changes. A structure
     change (rows added or removed, another form) redraws without motion. */
  var SLIDE = 'cubic-bezier(.22,1,.36,1)';
  function rollTo(el, oldText, newText, dur, delay) {
    if (!el || oldText === newText) return false;
    var a = parseFloat(String(oldText).replace(/[^0-9.\-]/g, '')), b = parseFloat(String(newText).replace(/[^0-9.\-]/g, ''));
    if (!PMU.film || !PMU.film.odometer || !finite(a) || !finite(b) || a === b) { el.textContent = newText; return false; }
    PMU.film.odometer(el, b, function (v) { return v === b ? newText : oldText; }, { from: a, change: true, dur: dur || 420, delay: delay || 0 });
    return true;
  }
  charts.rollTo = rollTo;
  function liveRanked(c, lo) {
    var spec = c.spec || {}, rows = spec.rows || [], els = $$('.pmu-rk', c.el), byId = {}, n = 0;
    els.forEach(function (el) { byId[el.getAttribute('data-id')] = el; });
    var idOf = function (r, i) { return String(r.id != null ? r.id : i); };
    var w = c._w || 300, inline = (c.opts.tier && (c.opts.tier.w === 'xs' || c.opts.tier.w === 's')) || w < 248 || spec.inline;
    if (rows.length !== els.length || c.el.getAttribute('data-inline') !== (inline ? '1' : '0') || rows.some(function (r, i) { return !byId[idOf(r, i)]; })) {
      drawRanked(c, !lo.still);
      return { anims: 0 };
    }
    var max = spec.scale || 0;
    rows.forEach(function (r) { if (finite(r.value)) max = Math.max(max, r.value); });
    var rank = {}; els.forEach(function (el, i) { rank[el.getAttribute('data-id')] = el.style.order !== '' ? +el.style.order : i; });
    var moved = rows.some(function (r, i) { return rank[idOf(r, i)] !== i; });
    var slot = null;
    if (moved && !lo.still) { slot = []; els.forEach(function (el) { slot[rank[el.getAttribute('data-id')]] = el.offsetTop; }); }   /* the one read */
    var changed = {};
    rows.forEach(function (r, i) {
      var el = byId[idOf(r, i)], id = idOf(r, i);
      var f = finite(r.value) && max > 0 ? clamp(r.value / max, 0, 1) : 0, oldF = parseFloat(el.getAttribute('data-f'));
      var b = el.querySelector('.pmu-rkval b'), em = el.querySelector('.pmu-rkval em');
      var newText = finite(r.value) ? (r.valueText || charts.fmtValue(r.value, spec.unit)) : null;
      if (b && newText != null && b.textContent !== newText) { changed[id] = true; if (lo.still) b.textContent = newText; else if (rollTo(b, b.textContent, newText, 420, lo.delay)) n++; }
      var shareT = finite(r.share) && !inline ? pctText(r.share) + '%' : null;
      if (em && shareT != null && em.textContent !== shareT) em.textContent = shareT;
      if (finite(oldF) && Math.abs(oldF - f) > 0.002) {
        changed[id] = true;
        var fillEl = el.querySelector('.pmu-rkfill');
        el.setAttribute('data-f', String(f));
        if (fillEl) {
          fillEl.style.setProperty('--f', (f * 100).toFixed(2) + '%');
          if (!lo.still && f > 0 && Mo.anim(fillEl, [{ transform: 'scaleX(' + clamp(oldF / f, 0, 20) + ')' }, { transform: 'scaleX(1)' }], 420, lo.delay, SLIDE, 'none')) n++;
        }
      }
      /* the ramp colour and the state tone follow at the end of the move (a shade, never an animated property) */
      var rampOn = finite(r.value) && r.tone && r.ramp !== false && (spec.scale === 100 || spec.ramp);
      var swap = function () {
        if (rampOn) { var rp = charts.ramp(r.value, r.tone); el.setAttribute('data-ramp', String(rp.ramp)); el.style.setProperty('--v', String(rp.v)); }
        $$('.pmu-rkfill > i', el).forEach(function (m) { if (r.tone) m.setAttribute('data-tone', r.tone); });
      };
      if (lo.still || !PMU.film || !PMU.film.at) swap(); else PMU.film.at(lo.delay + 420, swap);
      var hv = r.hover; if (hv != null && el.getAttribute('data-pm-hover-detail') !== hv) el.setAttribute('data-pm-hover-detail', hv);
    });
    if (moved) {
      rows.forEach(function (r, i) { byId[idOf(r, i)].style.order = String(i); });
      if (slot) rows.forEach(function (r, i) {
        var id = idOf(r, i), el = byId[id], from = slot[rank[id]], to = slot[i];
        if (!finite(from) || !finite(to) || Math.abs(from - to) < 0.5) return;
        if (Mo.anim(el, [{ transform: 'translateY(' + r1(from - to) + 'px)' }, { transform: 'none' }], 420, lo.delay + 20 * i, SLIDE, 'backwards')) n++;
        if (changed[id] && !Mo.reduced()) { try { el.animate([{ opacity: 0.6 }, { opacity: 0 }], { duration: 600, delay: lo.delay, easing: 'cubic-bezier(.22,.8,.28,1)', pseudoElement: '::before' }); n++; } catch (error) {} }
      });
    }
    return { anims: n };
  }
  /* quiet (C3-3): the rows grow together (no stagger) without the head glow */
  function growRows(c, sel, delay, dur, step, cap, quiet) {
    var e = growEase();
    $$(sel, c.el).forEach(function (el, i) {
      var dl = quiet ? delay : delay + Math.min(cap || 560, i * (step || 36));
      Mo.anim(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], dur, dl, e);
      if (quiet) return;
      var f = parseFloat(el.style.getPropertyValue('--f'));
      var track = el.parentNode;
      if (PMU.film && PMU.film.headGlow && track && finite(f) && f > 3) PMU.film.headGlow(track, { to: f, dur: dur, delay: dl, easing: e });
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
        if (c._quiet) { var mb = c.el.querySelector('.pmu-mixbar'); if (mb) Mo.anim(mb, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 520, delay, Mo.voice('grow')); return; }
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
        return { f: s.value / lim, k: { idx: s.idx != null ? s.idx : i, tk: s.tk || s.token, vendor: s.vendor, tone: s.tone }, hatched: s.hatched || s.est, name: s.name, value: s.value };
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
      carry: function (c, from) { this.update(c, from.spec); },
      update: function (c, prev) {
        var fromEnd = c._end, oldCv = c.el.querySelector('.pmu-centre-v'), before = oldCv ? parseFloat(oldCv.getAttribute('data-shown')) : NaN;
        drawRing(c);
        if (finite(fromEnd) && !Mo.reduced()) sweepRing(c, 0, 520, fromEnd);
        var cv = c.el.querySelector('.pmu-centre-v');
        if (cv && finite(c.spec.centreValue) && finite(before) && before !== c.spec.centreValue) {
          cv.setAttribute('data-shown', String(before));
          charts.roll(cv, c.spec.centreValue, c.spec.centreFmt, { dur: 520, finalText: c.spec.centre != null ? String(c.spec.centre) : null });
          charts.pulse(cv);
        }
        void prev;
      },
      enter: function (c, delay) {
        /* quiet (C3-3): the arcs sweep 600 without the glint, the centre is already final */
        if (c._quiet) { if (!charts.flightTarget(c)) sweepRing(c, delay, 600, null, false); return; }
        /* the ring that arrives by flight does not sweep again under the flyer */
        if (!charts.flightTarget(c)) {
          sweepRing(c, delay, 900, null);
          if (c._fly) charts.watchFlight(c, function () { var bx = c.el.querySelector('.pmu-ringbox'); if (bx && bx._pmuSweep) bx._pmuSweep.cancel(); });
        }
        var cv = c.el.querySelector('.pmu-centre-v');
        if (cv && finite(c.spec.centreValue)) { cv.removeAttribute('data-shown'); charts.roll(cv, c.spec.centreValue, c.spec.centreFmt, { dur: 1000, delay: delay }); }
        var ct = c.el.querySelector('.pmu-centre');
        if (ct) Mo.anim(ct, [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], 420, delay + 120, Mo.EASE.out);
        /* the Context hero's beat (WOW-SPEC-3 7, C3-6): when the sweep has closed, the limit tick drops onto the ring */
        if (charts.isHero(c)) c.beatEnd = ringBeat(c, delay + 900 + 40) - delay;
      },
      beat: function (c, delay) { return ringBeat(c, delay); },
      live: function (c, prev, lo) {
        var fromEnd = c._end, oldCv = c.el.querySelector('.pmu-centre-v'), before = oldCv ? parseFloat(oldCv.getAttribute('data-shown')) : NaN, n = 0;
        drawRing(c);
        if (lo.still) return { anims: 0 };
        if (finite(fromEnd) && Math.abs(fromEnd - c._end) > 0.3) { sweepRing(c, lo.delay, 520, fromEnd, !!lo.lead && !lo.soft); n += 4; }
        var cv = c.el.querySelector('.pmu-centre-v');
        if (cv && finite(c.spec.centreValue) && finite(before) && before !== c.spec.centreValue) {
          cv.setAttribute('data-shown', String(before));
          charts.roll(cv, c.spec.centreValue, c.spec.centreFmt, { dur: 420, delay: lo.delay, finalText: c.spec.centre != null ? String(c.spec.centre) : null });
          n++;
        }
        void prev;
        return { anims: n };
      },
      still: function () {}
    });
  }
  /* the limit tick drops onto the ring (260 SETTLE): where the window closes, at 12 o'clock */
  function ringBeat(c, at) {
    var tk = c.el.querySelector('.pmu-ringtick');
    if (!tk || Mo.reduced()) return at;
    var fm = Mo.fam(), stepped = fm === 'retro' || fm === 'nier';
    Mo.anim(tk, [{ transform: 'translateY(-10px)', opacity: 0 }, { opacity: 1, offset: 0.4 }, { transform: 'none', opacity: 1 }], 260, at, stepped ? 'steps(3,jump-start)' : (PMU.film && PMU.film.E ? PMU.film.E.settle : Mo.EASE.out), 'backwards');
    return at + 260;
  }
  /* a point on the ring (r 50 around 60,60) at `deg` clockwise from 12 o'clock */
  function ringPt(deg, r) { var a = deg * Math.PI / 180; return r1(60 + r * Math.sin(a)) + ',' + r1(60 - r * Math.cos(a)); }
  function ringArcD(d0, d1, r) {
    if (d1 - d0 >= 359.9) d1 = d0 + 359.9;
    return 'M' + ringPt(d0, r) + 'A' + r + ',' + r + ' 0 ' + (d1 - d0 > 180 ? 1 : 0) + ' 1 ' + ringPt(d1, r);
  }
  /* WOW-SPEC 2.5: each arc is lit along its length (a conic ramp drawn as short sub-arcs, 55 % of its colour at the start
     to 100 % at the head), segments sit 1 px apart, the start is round and the leading cap is round and lit (the -b
     colour with a soft static glow); estimates are hatched and never lit */
  function ringArcs(segs, sw, unit) {
    var r = 50, gapDeg = segs.length > 1 ? 1.3 : 0;   /* about 1 px at the usual sizes */
    var total = 0; segs.forEach(function (s) { total += s.f * 360; });
    var out = '', at = 0, end = 0;
    /* the light ramps across the whole sweep (62 % of the colour at 12 o'clock to 100 % at the head), so a segmented ring
       reads as one lit sweep whose hue changes per segment; sub-arcs of at most 5 degrees keep the ramp seamless */
    var lit = function (deg) { return Math.round(62 + 38 * clamp(deg / (total || 1), 0, 1)); };
    segs.forEach(function (s, i) {
      var span = s.f * 360, d0 = at, d1 = at + span - (gapDeg && i < segs.length - 1 ? gapDeg : 0);
      at += span;
      if (d1 - d0 < 0.3) return;
      var ka = charts.keyAttrs(s.k) + (s.hatched ? ' data-est="1"' : '');
      var hov = hoverAttrs(s.name, s.name ? charts.fmtValue(s.value, unit) : '');
      var n = Math.max(1, Math.min(72, Math.ceil((d1 - d0) / 5)));
      for (var k = 0; k < n; k++) {
        var a = d0 + (d1 - d0) * k / n, b = d0 + (d1 - d0) * (k + 1) / n + (k < n - 1 ? 0.4 : 0);
        out += '<path class="pmu-mark" data-mark="arc" data-seg="' + i + '"' + ka + ' style="--k:' + (s.hatched ? 100 : lit((a + b) / 2)) + '%" d="' + ringArcD(a, b, r) + '"' + hov + '/>';
      }
      if (i === 0) { var p0 = ringPt(d0, r).split(','); out += '<circle class="pmu-ringcap is-start"' + ka + ' cx="' + p0[0] + '" cy="' + p0[1] + '" r="' + r1(sw / 2) + '" style="--k:' + lit(0) + '%"/>'; }
      end = d1;
      if (i === segs.length - 1) {
        var p = ringPt(d1, r).split(',');
        out += (s.hatched ? '' : '<circle class="pmu-ringglow"' + ka + ' cx="' + p[0] + '" cy="' + p[1] + '" r="' + r1(sw / 2 + 5) + '"/>') +
          '<circle class="pmu-ringcap is-head"' + ka + ' cx="' + p[0] + '" cy="' + p[1] + '" r="' + r1(sw / 2) + '"/>';
      }
    });
    return { html: out, end: end };
  }
  function drawRing(c) {
    var spec = c.spec || {};
    var size = spec.size || c.opts.size || clamp(Math.min(c._w || 120, c._h > 40 ? c._h : 120), 56, 160);
    var stroke = spec.stroke || 12;
    var segs = ringSegs(spec);
    var arcs = ringArcs(segs, stroke, spec.unit);
    c._end = arcs.end;
    c.el.setAttribute('data-ring', size < 76 ? 'xs' : size < 104 ? 's' : 'm');
    /* the limit tick (WOW-SPEC 4 Context, WOW-SPEC-3 7): a segmented ring measured against a limit (the context window)
       marks where the window closes, at 12 o'clock, across the track (HTML: it drops on the compositor) */
    var tick = spec.limitTick || (spec.limitTick !== false && spec.segments && finite(spec.limit) && finite(spec.max));
    c.el.innerHTML = '<div class="pmu-ringbox" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg class="pmu-ringsvg" viewBox="0 0 120 120" width="' + size + '" height="' + size + '" style="--sw:' + stroke + '">' +
      '<circle class="pmu-ringtrack" cx="60" cy="60" r="50"/><g class="pmu-ringarcs">' + arcs.html + '</g></svg>' +
      (tick ? '<i class="pmu-ringtick" aria-hidden="true" style="top:' + r1((60 - 50 - stroke / 2 - 4) / 1.2) + '%;height:' + r1((stroke + 8) / 1.2) + '%"' + hoverAttrs(t('charts.limit_tick'), '') + '></i>' : '') +
      '<div class="pmu-centre"><b class="pmu-centre-v"' + (spec.centreShare ? ' data-share="' + esc(spec.centreShare) + '"' : '') + '>' + esc(spec.centre != null ? spec.centre : '') + '</b>' + (spec.caption ? '<span class="pmu-centre-c">' + esc(spec.caption) + '</span>' : '') + '</div></div>';
    var pm = !finite(spec.centreValue) && finite(spec.value) && typeof spec.centre === 'string' ? /^(\d+)(?:\.(\d+))?%$/.exec(spec.centre) : null;
    if (pm && Math.abs(parseFloat(spec.centre) - spec.value) < 0.06) {
      var dec = pm[2] ? pm[2].length : 0;
      spec.centreValue = spec.value; spec.centreFmt = function (v) { return v.toFixed(dec) + '%'; };
    }
    if (finite(spec.centreValue)) { var cv = c.el.querySelector('.pmu-centre-v'); cv.setAttribute('data-shown', String(spec.centreValue)); }
    /* the flyer map (C3-5): the context ring repeats on Overview and Context (chart:context); a ring flies as its picture */
    var shareKey = c.opts.share || spec.share || (tick ? 'context' : null);
    if (shareKey) {
      var rb = c.el.querySelector('.pmu-ringbox');
      charts.setFly(c, rb, shareKey, { ring: true, shareEl: rb.querySelector('.pmu-ringsvg'), box: { l: 0, t: 0, w: size, h: size }, vb: '0 0 120 120', domain: null,
        paths: function () { var sv = rb.querySelector('.pmu-ringsvg'); return sv ? $$('.pmu-ringtrack, [data-mark="arc"], .pmu-ringcap, .pmu-ringglow', sv) : []; } });
    }
  }
  /* the sweep (WOW-TASKS C-2) runs on the compositor: the arcs (and their caps) are copied into two rotating half masks
     (PMU.charts.arcSweep) while the track stays; a change sweeps the new picture from the old end angle (a shrink shows
     the new picture at once: the wedge cannot hide what is already gone, so it cross-fades instead) */
  function sweepRing(c, delay, dur, fromEnd, glint) {
    var box = c.el.querySelector('.pmu-ringbox'), svg = box && box.querySelector('.pmu-ringsvg');
    if (!box || !svg || !(c._end > 0.5)) return;
    var from = finite(fromEnd) ? fromEnd : 0;
    if (from > c._end + 0.5) { Mo.anim(svg.querySelector('.pmu-ringarcs'), [{ opacity: 0.35 }, { opacity: 1 }], 260, delay, Mo.EASE.out, 'none'); return; }
    var pic = svg.cloneNode(true), tr = pic.querySelector('.pmu-ringtrack');
    if (tr) tr.remove();
    ['data-share', 'data-pmu-fly-target'].forEach(function (a) { pic.removeAttribute(a); });   /* the sweep's copies never pose as the shared ring */
    charts.arcSweep(box, pic, { from: from, to: c._end, dur: dur, delay: delay, radius: 10 / 120 * 100, glint: glint !== false });
  }

  /* ================= stackbar: cost by model by token type (A1 7.3) ================= */
  /* spec: {rows: [{id, name, providerId, vendor, segments: [{type, value, tokens}], fill, tokensText, valueText, shareText, attemptsText, hover}],
     heads?: {model, bar, tokens, cost, share, attempts}}; opts.onRow(id, el, row) */
  charts.stackbar = function (host, spec, opts) {
    return charts.make('stackbar', host, spec, opts, {
      flow: true, role: 'table',
      draw: function (c) { drawStackbar(c); },
      /* a range change (WOW-SPEC 3.4): rows FLIP to their new rank (420 ms (.2,.8,.2,1), 20 ms apart), each bar's width
         morphs from the old one (520 ms), the number cells roll only their changed digits; positions are read once
         before the change and once after it, never inside a frame of motion. A body re-rendered by its kind carries the
         old rows over (charts.make carry) and plays the same morph. */
      update: function (c) {
        if (!c.el.querySelector('.pmu-sbbody') || Mo.reduced()) { drawStackbar(c); return; }
        var old = sbSnap(c);
        drawStackbar(c);
        sbFlip(c, old);
      },
      snapshot: function (c) { return sbSnap(c); },
      carry: function (c, from) { drawStackbar(c); if (from.snap) sbFlip(c, from.snap); },
      enter: function (c, delay) { growRows(c, '.pmu-sbfill', delay, c._quiet ? 520 : 760, 36, null, c._quiet); }
    });
  };
  var TKN = function (tk) { return (charts.TK_NAMES || {})[tk] || tk; };
  /* rows sit at a fixed pitch per form (40 px, 46 px in the two-line form; names never wrap), so the FLIP needs no
     layout read: the move is the change of rank times the pitch */
  function sbPitch(c) { return c.el.getAttribute('data-form') === 'two' ? 46 : 40; }
  function sbSnap(c) {
    var old = {}, pitch = sbPitch(c);
    $$('.pmu-sbrow', c.el).forEach(function (r, i) {
      old[r.getAttribute('data-id')] = { top: i * pitch, f: parseFloat((r.querySelector('.pmu-sbfill') || r).style.getPropertyValue('--f')),
        nums: $$('.pmu-sbnum', r).map(function (n) { return n.textContent; }) };
    });
    return old;
  }
  function sbFlip(c, old) {
    var pitch = sbPitch(c);
    $$('.pmu-sbrow', c.el).forEach(function (r, i) {
      var o = old[r.getAttribute('data-id')], fill = r.querySelector('.pmu-sbfill');
      if (!o) { Mo.anim(r, [{ opacity: 0 }, { opacity: 1 }], 260, 200 + i * 20, Mo.EASE.out, 'backwards'); if (fill) growRows({ el: r }, '.pmu-sbfill', 200 + i * 20, 520, 0); return; }
      var dy = o.top - i * pitch;
      if (Math.abs(dy) > 0.5) Mo.anim(r, [{ transform: 'translateY(' + r1(dy) + 'px)' }, { transform: 'none' }], 420, i * 20, 'cubic-bezier(.2,.8,.2,1)', 'backwards');
      var nf = fill ? parseFloat(fill.style.getPropertyValue('--f')) : NaN;
      if (fill && finite(o.f) && nf > 0 && Math.abs(o.f - nf) > 0.05) Mo.anim(fill, [{ transform: 'scaleX(' + clamp(o.f / nf, 0, 40) + ')' }, { transform: 'scaleX(1)' }], 520, 0, 'cubic-bezier(.33,1,.68,1)', 'backwards');
      $$('.pmu-sbnum', r).forEach(function (n, k) { if (o.nums[k] != null && charts.rollText) charts.rollText(n, o.nums[k], n.textContent); });
    });
  }
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
      /* live (C3-4): in place (the same rows patch their text, the arcs morph 420 from the old angles), the centre total
         rolls only its changed digits */
      live: function (c, prev, lo) {
        var pa = c._arcs, cv0 = c.el.querySelector('.pmu-dc-v'), t0 = cv0 ? cv0.textContent : null;
        c._live = lo; try { drawDonut(c, lo.still ? null : pa); } finally { c._live = null; }
        var cv = c.el.querySelector('.pmu-dc-v'), n = lo.still ? 0 : 1;
        if (!lo.still && cv && t0 != null && t0 !== cv.textContent && rollTo(cv, t0, cv.textContent, 420, lo.delay)) n++;
        return { anims: n };
      },
      carry: function (c) { var prev = c._arcs; drawDonut(c, prev); },
      enter: function (c, delay) {
        /* the arcs sweep from 12 o'clock on the compositor (WOW-TASKS C-2), the share labels fade in at the end */
        var box = c.el.querySelector('.pmu-donut'), svg = box && box.querySelector('svg');
        if (!box || !svg) return;
        var labels = c.el.querySelector('.pmu-dlabels');
        var pic = svg.cloneNode(true), tr = pic.querySelector('.pmu-ringtrack');
        if (tr) tr.remove();
        /* quiet (C3-3): the slices sweep 600, labels, centre and legend are already final */
        if (c._quiet) { charts.arcSweep(box, pic, { from: 0, to: 360, dur: 600, delay: delay, glint: false }); return; }
        charts.arcSweep(box, pic, { from: 0, to: 360, dur: 900, delay: delay, glint: false });
        if (labels) Mo.anim(labels, [{ opacity: 0 }, { opacity: 1 }], 260, delay + 820, Mo.EASE.out);
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
  var donutSeq = 0;
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
    var side = w >= 420, hostH = c._h || 0, ROW = 27;
    var Sz = side ? clamp(0.44 * w, 200, 280) : clamp(0.62 * w, 168, 220);
    /* the legend names slices by share until its "Other" row is the smallest row, or 5 rows fit (LOOK-REVIEW-2 item 20:
       an "Other" bigger than every named slice hides the answer); the ring gives up height for those rows first */
    var want = segs.length;
    for (var nn = 1; nn < segs.length; nn++) {
      var restV = 0; for (var q = nn; q < segs.length; q++) restV += segs[q].value;
      if (restV <= segs[nn - 1].value) { want = nn + 1; break; }
    }
    want = Math.min(Math.max(want, Math.min(5, segs.length)), 7);
    if (hostH >= 120) Sz = side ? Math.min(Sz, Math.max(150, hostH)) : Math.min(Sz, Math.max(120, hostH - 12 - want * ROW));
    /* a small donut drops its outside share labels (the legend carries every share) and gives the ring that margin */
    var outside = Sz >= 190;
    var m = !outside ? 6 : Sz < 220 ? 30 : 40, R1 = Sz / 2 - m, R0 = R1 - Math.max(16, Math.round(0.13 * Sz)), cx = Sz / 2, cy = Sz / 2;
    var maxRows = hostH >= 120 ? Math.max(2, Math.floor(((side ? hostH : hostH - Sz - 12) + 2) / ROW)) : 7;
    var a = 0, arcs = segs.map(function (s) { var f = total ? s.value / total : 0, r = { id: s.id || s.name, a0: a, a1: a + f * Math.PI * 2, f: f, s: s }; a += f * Math.PI * 2; return r; });
    c._arcs = arcs.map(function (x) { return { id: x.id, a0: x.a0, a1: x.a1 }; });
    var gap = 0.01;
    var paths = arcs.map(function (x, i) {
      var k = x.s.other ? { idx: 7 } : { vendor: x.s.vendor || 'community', shade: x.s.shade || 1 };
      return '<path class="pmu-mark" data-mark="arc" data-i="' + i + '"' + charts.keyAttrs(k) + (x.s.prov ? ' data-prov="' + esc(x.s.prov) + '"' : '') + '/>';
    }).join('');
    /* share labels are HTML (they fade in on the compositor), placed outside the ring by their arc's middle angle */
    var labels = arcs.filter(function (x) { return outside && x.f >= 0.05; }).map(function (x) {
      var mid = (x.a0 + x.a1) / 2, rr = R1 + 12, lx = cx + rr * Math.sin(mid), ly = cy - rr * Math.cos(mid);
      var anchor = Math.sin(mid) > 0.2 ? '0' : Math.sin(mid) < -0.2 ? '-100%' : '-50%';
      return '<span class="pmu-dl-pct" style="left:' + r1(lx) + 'px;top:' + r1(ly) + 'px;transform:translate(' + anchor + ',-50%)">' + esc(pctText(x.f * 100)) + '%</span>';
    }).join('');
    var centreVal = spec.centre && spec.centre.value != null ? spec.centre.value : fmtV(total);
    var centreCap = spec.centre && spec.centre.caption ? spec.centre.caption : '';
    /* every row fits: up to 7 rows, else the first rows plus one "N smaller models" row (complete or hidden) */
    var showN = arcs.length <= Math.min(7, maxRows) ? arcs.length : Math.max(1, Math.min(6, maxRows - 1));
    /* the share column is as wide as its widest share in the theme's face (NOTES3-content E6: a fixed 52 px cut "Other 2
       models" and "Gemini 3.1 Pro" at 1440 in Glass and Retro, while "9.8%" needs about 30) */
    var shareW = 30;
    arcs.forEach(function (x) { shareW = Math.max(shareW, Math.ceil(charts.textW(pctText(x.f * 100) + '%', 12.5) * 1.06) + 3); });
    var legendRows = arcs.slice(0, showN).map(function (x, i) {
      var k = x.s.other ? { idx: 7 } : { vendor: x.s.vendor || 'community', shade: x.s.shade || 1 };
      return '<div class="pmu-dl-row" data-i="' + i + '"' + charts.keyAttrs(k) + ' style="--shf:' + x.f.toFixed(3) + '"' + (x.s.prov ? ' data-prov="' + esc(x.s.prov) + '"' : '') + '><i class="pmu-swatch"' + charts.keyAttrs(k) + '></i><span class="pmu-dl-n">' + esc(x.s.name) +
        '</span><b>' + esc(x.s.valueText || fmtV(x.s.value)) + '</b><em>' + esc(pctText(x.f * 100)) + '%</em></div>';
    }).join('');
    if (arcs.length > showN) {
      var restArcs = arcs.slice(showN), rest = restArcs.reduce(function (s, x) { return s + x.s.value; }, 0);
      var restN = restArcs.reduce(function (n, x) { return n + (x.s.other ? small.length : 1); }, 0);
      legendRows += '<div class="pmu-dl-row is-rest" data-series-index="7" style="--shf:' + (rest / total).toFixed(3) + '"><i class="pmu-swatch" data-series-index="7"></i><span class="pmu-dl-n">' + esc(t('charts.smaller_models', { n: restN })) + '</span><b>' + esc(fmtV(rest)) + '</b><em>' + esc(pctText(rest / total * 100)) + '%</em></div>';
    }
    /* the centre value is sized to the hole; the caption shows only where it fits */
    var holeW = 2 * R0 - 14, cfs = 22, ctw = charts.textW(centreVal, 22, false, 640);
    if (ctw > holeW) cfs = Math.max(12, Math.floor(22 * holeW / ctw));
    var capOk = R0 >= 44;
    c.el.setAttribute('data-side', side ? '1' : '0');
    /* depth (WOW-SPEC 2.5): one static radial shade over the slices, a lit outer rim and a soft inner shadow */
    var gid = 'pmu-dsh-' + (++donutSeq), k0 = R0 / R1;
    var shade = '<defs><radialGradient id="' + gid + '" cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(R1) + '" gradientUnits="userSpaceOnUse">' +
      '<stop offset="' + (k0 - 0.002).toFixed(3) + '" class="pmu-dsh-none"/><stop offset="' + k0.toFixed(3) + '" class="pmu-dsh-in"/>' +
      '<stop offset="' + Math.min(0.97, k0 + 0.16).toFixed(3) + '" class="pmu-dsh-none"/><stop offset=".9" class="pmu-dsh-none"/><stop offset="1" class="pmu-dsh-out"/></radialGradient></defs>';
    charts.patchHtml(c.el, '<div class="pmu-donut" style="width:' + r1(Sz) + 'px;height:' + r1(Sz) + 'px"><svg width="' + r1(Sz) + '" height="' + r1(Sz) + '" viewBox="0 0 ' + r1(Sz) + ' ' + r1(Sz) + '">' + shade +
      '<circle class="pmu-ringtrack" cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1((R0 + R1) / 2) + '" style="stroke-width:' + r1(R1 - R0) + 'px"/>' + paths +
      '<circle class="pmu-dshade" data-mark="arc" cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(R1) + '" style="fill:url(#' + gid + ')"/>' +
      '</svg><div class="pmu-dlabels">' + labels + '</div><div class="pmu-dcentre" style="padding:0 ' + r1(m + (R1 - R0) + 6) + 'px"><b class="pmu-dc-v" style="font-size:' + cfs + 'px">' + esc(centreVal) + '</b><span class="pmu-dc-c"' + (capOk ? '' : ' hidden') + '>' + esc(centreCap) + '</span></div></div>' +
      '<div class="pmu-dlegend" style="--dl-share:' + Math.min(52, shareW) + 'px">' + legendRows + '</div>');
    var pathEls = $$('path[data-mark="arc"]', c.el);
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
      c._dt = Mo.tween(c._live ? 420 : 520, 'io', function (k) { paint(k, prevArcs); }, function () { c._dt = null; paint(1); }, c._live ? c._live.delay : 0);
    }
    /* centre number roll (tokens or money) */
    var cv = c.el.querySelector('.pmu-dc-v');
    c._centreNum = spec.centre && finite(spec.centre.num) ? spec.centre.num : (centreVal === fmtV(total) ? total : null);
    c._centreFmt = spec.centre && spec.centre.fmt ? spec.centre.fmt : fmtV;
    if (finite(c._centreNum)) cv.setAttribute('data-shown', String(c._centreNum));
    /* hover: the arc's share moves into the centre and the other arcs dim to .3 */
    /* hover reads the chart's current state (a live patch keeps the elements and their listeners) */
    c._dh = { arcs: arcs, centreVal: centreVal, centreCap: centreCap, fmtV: fmtV, mode: mode };
    var hot = function (i) {
      var D = c._dh, cvx = c.el.querySelector('.pmu-dc-v'), capx = c.el.querySelector('.pmu-dc-c');
      $$('path[data-mark="arc"]', c.el).forEach(function (p, j) { p.classList.toggle('is-dim', i != null && j !== i); });
      $$('.pmu-dl-row', c.el).forEach(function (r) { r.classList.toggle('is-hot', i != null && +r.getAttribute('data-i') === i); });
      if (!cvx || !capx) return;
      if (i == null || !D.arcs[i]) { cvx.textContent = D.centreVal; capx.textContent = D.centreCap; return; }
      var x = D.arcs[i];
      cvx.textContent = (Math.round(x.f * 1000) / 10).toFixed(1) + '%';
      capx.textContent = x.s.name + ' · ' + (x.s.valueText || D.fmtV(x.s.value)) + (D.mode === 'cost' ? '' : ' ' + t('charts.tokens_word'));
    };
    pathEls.forEach(function (p, i) { if (p._pmuHot) return; p._pmuHot = 1; p.addEventListener('pointerenter', function () { hot(i); }); p.addEventListener('pointerleave', function () { hot(null); }); });
    $$('.pmu-dl-row[data-i]', c.el).forEach(function (r) { if (r._pmuHot) return; r._pmuHot = 1; r.addEventListener('pointerenter', function () { hot(+r.getAttribute('data-i')); }); r.addEventListener('pointerleave', function () { hot(null); }); });
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
        var e = growEase();
        if (c._quiet) { $$('.pmu-tbbars', c.el).forEach(function (bx) { Mo.anim(bx, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 520, delay, e); }); return; }
        $$('.pmu-tbrow', c.el).forEach(function (row, i) {
          $$('.pmu-tb i', row).forEach(function (el, j) {
            var dl = delay + i * 36 + j * 40, f = parseFloat(el.style.getPropertyValue('--f'));
            Mo.anim(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 760, dl, e);
            if (PMU.film && PMU.film.headGlow && finite(f) && f > 3) PMU.film.headGlow(el.parentNode, { to: f, dur: 760, delay: dl, easing: e });
          });
          Mo.anim(row, [{ opacity: 0 }, { opacity: 1 }], 420, delay + i * 36, Mo.EASE.out);
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
        if (c._quiet) return;   /* a supporting value arrives final with its body (WOW-SPEC-3 3.3) */
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
