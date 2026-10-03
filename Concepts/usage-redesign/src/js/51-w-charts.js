/* Chart-backed widget kinds (owner: content; split out of 50-w-common.js to keep files readable; DESIGN-SPEC 4 and 7,
   DESIGN-SPEC-ATLAS 7.2, 7.7, 7.8, 7.11): trend (area / line / spark), columns (labelled and stacked), budget, heat.
   Every chart is drawn by PMU.charts; the kinds add the headline, legend, facts, notes and the head tools. */
(function () {
  var C = PMU.content;

  function hostH(ctx, reserve) { return Math.max(40, Math.floor(ctx.tier.bh - reserve)); }
  /* a chart's scope caveat sits behind ONE info icon (final fix M5, Atlas d: "Scope caveats sit behind ONE info icon
     instead of paragraphs"): the icon ends the facts row, or sits in the hero row or the legend line, and its hover tag
     carries the sentence; the plot takes the line the paragraph used to take */
  function caveat(note) {
    return note ? '<span class="pmu-caveat" tabindex="0" role="note" aria-label="' + esc(note) + '"' + C.hover('About this chart', note) + '>' + C.glyph('info') + '</span>' : '';
  }
  /* the icon's words: the caveat, then the facts the card has no row for at this size (CONTENT-3: a chart card's facts
     were silently dropped below the l tier; they are one hover away and in Details) */
  function cavText(m, factsShown, extra) {
    var folded = (!factsShown && m.facts && m.facts.length ? m.facts.map(C.factText) : []).concat(extra || []).filter(Boolean).join('; ');
    return [m.note || '', folded ? (m.note ? 'Not shown at this size: ' : '') + folded : ''].filter(Boolean).join(' ');
  }
  function factSpans(facts) { return facts.map(function (f) { return '<span><em>' + esc(f[0]) + '</em> <b>' + esc(f[1]) + '</b></span>'; }).join(''); }
  C.caveat = caveat;

  /* ================================================================== trend: area, line and the spark form */
  /* model: {chart: 'area'|'line', spec, headline: {value, fmt, label}, legend: [items], facts: [[...]], note, tools?: html,
             spark: {values, idx|tk}} */
  C.kind('trend', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('No series for the selected range'); return; }
      var sparkForm = ctx.tier.w === 'xs' || ctx.tier.h === 'h1' || ctx.tier.h === 'h0';
      var head = m.headline ? '<div class="pmu-trendhead">' + C.valHtml(m.headline.value, m.headline.fmt, 'pmu-bigval', ctx.id + ':h').replace('class="pmu-num"', 'class="pmu-num" data-count="1"') +
        '<span class="pmu-trendlabel">' + esc(m.headline.label || '') + '</span></div>' : '';
      if (sparkForm) {
        body.innerHTML = '<div class="pmu-trend is-spark">' + head + '<div class="pmu-trendspark" style="height:' + Math.max(28, Math.min(40, ctx.tier.bh - 34)) + 'px"></div></div>';
        var sp = m.spark || { values: (m.spec.series && m.spec.series[0] ? m.spec.series[0].values : []) };
        C.chart(body, 'spark', body.querySelector('.pmu-trendspark'), sp, { label: ctx.def.title });
        C.headNote(ctx, body, caveat(cavText(m, false)));
        return;
      }
      var tools = C.headTools(ctx, m.tools && C.w(ctx, m.toolsMin || 's') ? m.tools : '');
      var legendOk = !!m.legendOwn && C.w(ctx, 's');
      /* a room's hero chart leads with its number (WOW-TASKS N-2) */
      var heroH = m.hero && m.headline && C.isHero(ctx) ? C.heroHead(ctx, { value: m.headline.value, fmt: m.headline.fmt, label: m.headline.label, sub: m.heroSub, tone: m.heroTone, note: C.w(ctx, 'xl') ? m.heroNote : '', noteTone: m.heroTone }) : '';
      /* rangebars are rows (18 px axis + 30 px per tool): they need their whole height before facts or a note get room */
      var MINP = m.chart === 'rangebars' ? 22 + ((m.spec && m.spec.rows) || []).length * 30 : 120;
      var room = ctx.tier.bh - (tools ? 34 : 0) - (legendOk ? 24 : 0) - (heroH ? 66 : 0) - MINP;
      var frH = m.facts && m.facts.length ? 10 + 18 * Math.min(3, C.wrapLines(m.facts.map(function (f) { return f[0] + ' ' + f[1]; }).join('      '), ctx.tier.bw - 20, 12.5, 500)) : 0;
      var factsOk = m.facts && m.facts.length && C.w(ctx, 'l') && room >= frH; if (factsOk) room -= frH;
      var reserve = (tools ? 34 : 0) + (legendOk ? 24 : 0) + (heroH ? 66 : 0) + (factsOk ? frH : 0) + 6;
      /* the caveat icon: the facts row's end, else the hero row, else the legend line (final fix M5) */
      var cav = caveat(cavText(m, factsOk)), cavAt = !cav ? '' : factsOk ? 'facts' : heroH ? 'hero' : legendOk ? 'legend' : '';
      if (cavAt === 'hero') heroH = heroH.replace(/<\/div>$/, cav + '</div>');
      body.innerHTML = '<div class="pmu-trend' + (heroH ? ' is-hero' : '') + '">' + heroH + tools + (legendOk ? '<div class="pmu-trendlegend"></div>' : '') +
        '<div class="pmu-trendplot" style="height:' + (m.chart === 'rangebars' ? Math.max(MINP, hostH(ctx, reserve)) : hostH(ctx, reserve)) + 'px"></div>' +
        (factsOk ? '<div class="pmu-factrow">' + factSpans(m.facts) + (cavAt === 'facts' ? cav : '') + '</div>' : '') + '</div>';
      if (legendOk) { try { PMU.charts.legend(body.querySelector('.pmu-trendlegend'), m.legendOwn, { inline: true }); } catch (error) { console.error('[pm-usage] legend', error); } }
      if (cavAt === 'legend') { var lg = body.querySelector('.pmu-trendlegend'); if (lg) lg.insertAdjacentHTML('beforeend', cav); }
      /* no facts row, hero row or legend line: the icon sits in the card head (CONTENT-3) */
      if (cav && !cavAt) C.headNote(ctx, body, cav);
      var plotH = m.chart === 'rangebars' ? Math.max(MINP, hostH(ctx, reserve)) : hostH(ctx, reserve);
      C.chart(body, m.chart || 'area', body.querySelector('.pmu-trendplot'), m.spec, { label: m.label || ctx.def.title, tier: ctx.tier, readout: true, fmt: m.fmt, size: { w: ctx.tier.bw, h: plotH } });
      C.bag(body).sig = sig(ctx);
    },
    /* same tier and same structure: morph the plot in place (paths tween, axes cross-fade) instead of rebuilding it */
    update: function (body, ctx) {
      var b = body._pmu, m = ctx.model;
      if (!b || b.charts.length !== 1 || !m || !m.spec || b.sig !== sig(ctx) || !body.querySelector('.pmu-trendplot')) return false;
      try { C.chartTo(b.charts[0], m.spec, ctx); } catch (error) { return false; }
      var legend = body.querySelector('.pmu-trendlegend');
      if (legend && m.legendOwn) { legend.textContent = ''; try { PMU.charts.legend(legend, m.legendOwn, { inline: true }); } catch (error) {} }
      var cvT = cavText(m, !!body.querySelector('.pmu-factrow')), cv = body.querySelector('.pmu-caveat') || (ctx.head && ctx.head.querySelector('.pmu-caveat'));
      if (cv && cvT && cv.getAttribute('data-pm-hover-detail') !== cvT) { cv.setAttribute('data-pm-hover-detail', cvT); cv.setAttribute('aria-label', cvT); }
      /* the hero number rolls its changed digits and its row flashes (WOW-SPEC 3.6) */
      var hn = body.querySelector('.pmu-herohead .pmu-num[data-k]');
      if (hn && m.headline) {
        var oldV = parseFloat(hn.getAttribute('data-v')), f = hn.getAttribute('data-f'), to = m.headline.value;
        var lb = body.querySelector('.pmu-herohead .pmu-herolabel'); if (lb && lb.textContent !== (m.headline.label || '')) lb.textContent = m.headline.label || '';
        /* the line under the label follows the range too (integration 2, Mac film: after 24h -> 7d it still read the
           24-hour peak and in / out while the facts below had changed): it cross-fades to the new words */
        var hs = body.querySelector('.pmu-herohead .pmu-herosub');
        if (hs) {
          var tmp = document.createElement('div');
          tmp.innerHTML = C.heroHead(ctx, { value: m.headline.value, fmt: m.headline.fmt, label: m.headline.label, sub: m.heroSub, tone: m.heroTone, note: C.w(ctx, 'xl') ? m.heroNote : '', noteTone: m.heroTone });
          var ns = tmp.querySelector('.pmu-herosub');
          /* patched in place where the shape is the same (NOTES3-perf C5: no innerHTML child-list change in an update) */
          if (ns && ns.innerHTML !== hs.innerHTML) { if (PMU.charts.patchHtml) PMU.charts.patchHtml(hs, ns.innerHTML); else hs.innerHTML = ns.innerHTML; if (ctx.reason !== 'live') PMU.motion.animate(hs, [{ opacity: 0.2 }, { opacity: 1 }], { dur: 320, easing: 'cubic-bezier(.22,.8,.28,1)' }); }
        }
        if (isFinite(oldV) && isFinite(to) && oldV !== to) {
          hn.setAttribute('data-v', String(to));
          if (ctx.liveFinal) hn.textContent = C.numOnly(to, f); else PMU.motion.countUp(hn, oldV, to, function (v) { return C.numOnly(v, f); }, { dur: 'value' });
          if (ctx.reason !== 'live') C.flashRow(hn.closest('.pmu-herohead'));
        }
      }
      /* the facts under the chart follow the range with the chart (REVIEW-jared must-fix 4: they stayed at 24 hours) */
      var fr = body.querySelector('.pmu-factrow');
      if (fr && m.facts) {
        var fh = factSpans(m.facts) + (fr.querySelector('.pmu-caveat') && m.note ? caveat(cavText(m, true)) : '');
        if (fr.innerHTML !== fh) { if (PMU.charts.patchHtml) PMU.charts.patchHtml(fr, fh); else fr.innerHTML = fh; if (ctx.reason !== 'live' && PMU.motion && PMU.motion.animate) PMU.motion.animate(fr, [{ opacity: 0.25 }, { opacity: 1 }], { dur: 420, ease: 'out' }); }
      }
      return true;
    }
  });
  function sig(ctx) { return ctx.tier.w + ctx.tier.h + (ctx.model && ctx.model.sig || '') + (ctx.model && ctx.model.tools || '') + (ctx.model && ctx.model.hero && C.isHero(ctx) ? 'H' : ''); }

  /* ================================================================== columns: labelled columns, stacked columns */
  /* model: {labels, values, idx, unit, fmt, states?, highlightLast?, caption?, stacks?, facts?, note?, legend?, tools?}
     The kind re-buckets to at most floor(plotWidth / 28) bars (sum of neighbours) so every bar keeps its label (R-ANLY-03). */
  function rebucket(m, maxBars) {
    var n = (m.labels || []).length;
    if (!n || n <= maxBars) return m;
    var g = Math.ceil(n / maxBars), out = Object.assign({}, m, { labels: [], values: [], states: m.states ? [] : undefined, est: m.est ? [] : undefined, labelsLong: [] });
    if (m.stacks) out.stacks = m.stacks.map(function (s) { return Object.assign({}, s, { settled: [], estimate: [] }); });
    for (var i = 0; i < n; i += g) {
      var j = Math.min(n, i + g);
      /* a group's axis label is its first day ("Sep 29"; the caption names the bucket size, so a range never reads
         "Sep 29-2"); the readout names the whole span ("Sep 29 to Oct 2") */
      out.labels.push(m.labels[i]);
      if (m.values) { var s = 0, any = false; for (var k = i; k < j; k++) if (m.values[k] != null) { s += m.values[k]; any = true; } out.values.push(any ? Math.round(s * 100) / 100 : null); }
      if (m.states) out.states.push(m.states[j - 1]);
      if (m.est) { var es = 0; for (var q = i; q < j; q++) es += m.est[q] || 0; out.est.push(Math.round(es * 100) / 100); }
      var ll = m.labelsLong || m.labels;
      out.labelsLong.push(j - 1 > i ? ll[i] + ' to ' + ll[j - 1] : ll[i]);
      if (m.stacks) m.stacks.forEach(function (st, si) {
        var a = 0, e = 0, anyA = false, anyE = false;
        for (var k = i; k < j; k++) { if (st.settled[k] != null) { a += st.settled[k]; anyA = true; } if (st.estimate[k] != null) { e += st.estimate[k]; anyE = true; } }
        /* a group with no value stays unknown (null), never $0 */
        out.stacks[si].settled.push(anyA ? Math.round(a * 100) / 100 : null); out.stacks[si].estimate.push(anyE ? Math.round(e * 100) / 100 : null);
      });
    }
    if (m.totals) { out.totals = []; for (var t = 0; t < n; t += g) { var tt = 0; for (var u = t; u < Math.min(n, t + g); u++) tt += m.totals[u] || 0; out.totals.push(Math.round(tt * 100) / 100); } }
    out.rebucketed = g;
    return out;
  }
  C.rebucket = rebucket;
  C.kind('columns', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('No values for the selected range'); return; }
      var tools = C.headTools(ctx, m.tools || '');
      var legendOk = false, MINP = m.stacks ? 150 : 120;
      var room = ctx.tier.bh - (tools ? 34 : 0) - MINP;
      /* the caption's own wrapped height: a two-line caption no longer squeezes the plot by a line it did not count */
      var capH = m.caption ? 22 + 18 * (Math.min(2, C.wrapLines(m.caption, ctx.tier.bw, 12.5, 600)) - 1) : 0;
      var capOk = m.caption && C.w(ctx, 's') && room >= capH; if (capOk) room -= capH;
      /* the facts row's own wrapped height (CONTENT-3: two lines at 8 tracks clipped the card by 2 px) */
      var frH = m.facts && m.facts.length ? 10 + 18 * Math.min(3, C.wrapLines(m.facts.map(function (f) { return f[0] + ' ' + f[1]; }).join('      '), ctx.tier.bw - 20, 12.5, 500)) : 0;
      var factsOk = m.facts && m.facts.length && C.w(ctx, 'm') && room >= frH; if (factsOk) room -= frH;
      var reserve = (tools ? 34 : 0) + (capOk ? capH : 0) + (factsOk ? frH : 0) + 6;
      /* the caveat icon ends the facts row, else the caption (final fix M5) */
      var cav = caveat(cavText(m, factsOk, m.caption && !capOk ? [String(m.caption).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()] : [])), cavAt = !cav ? '' : factsOk ? 'facts' : capOk ? 'cap' : '';
      var plotW = Math.max(80, ctx.tier.bw - 52);
      var spec = rebucket(m, Math.max(3, Math.floor(plotW / 28)));
      body.innerHTML = '<div class="pmu-colsw">' + tools + (capOk ? '<div class="pmu-colscap">' + m.caption + (cavAt === 'cap' ? cav : '') + '</div>' : '') + (legendOk ? '<div class="pmu-trendlegend"></div>' : '') +
        '<div class="pmu-colsplot" style="height:' + hostH(ctx, reserve) + 'px"></div>' +
        (factsOk ? '<div class="pmu-factrow">' + factSpans(m.facts) + (cavAt === 'facts' ? cav : '') + '</div>' : '') + '</div>';
      if (legendOk) { try { PMU.charts.legend(body.querySelector('.pmu-trendlegend'), m.legend, { inline: true }); } catch (error) {} }
      /* no facts row or caption: the icon sits in the card head (CONTENT-3: the forecast's caveat was nowhere at 10 x 7) */
      if (cav && !cavAt) C.headNote(ctx, body, cav);
      var cs = Object.assign({ unit: m.unit || 'usd' }, spec); delete cs.caption; delete cs.facts; delete cs.note; delete cs.tools;
      C.chart(body, 'columns', body.querySelector('.pmu-colsplot'), cs, { label: ctx.def.title, tier: ctx.tier, readout: true, legend: m.legend !== false && (!m.stacks || C.w(ctx, 'l') || (C.w(ctx, 's') && ctx.tier.bh >= 190)) });
    }
  });

  /* ================================================================== budget: hero + cumulative line with the projection band */
  /* model: {spent, budget, projection: {to, lo, hi, label, confidence}, days, today, cumulative, facts: [[...]], mix?: segments} */
  C.kind('budget', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('No month to date spend'); return; }
      var compact = !C.w(ctx, 'm') || !C.h(ctx, 'h2');
      var pct = m.budget ? Math.round(100 * m.spent / m.budget) : null;
      var big = C.isHero(ctx);
      var hero = '<div class="pmu-budgethero' + (big ? ' is-hero' : '') + '">' + C.share(C.valHtml(m.spent, 'money2', big ? 'pmu-heronum' : 'pmu-bigval', ctx.id + ':spent').replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"'), m.share || 'num:spend.month') +
        '<span class="pmu-budgetof">' + (m.budget ? 'of ' + esc(C.money(m.budget)) + ' budget · ' + pct + '%' : 'No budget set') + '</span>' +
        '<span class="pmu-budgetest">est. ' + esc(C.money(m.projection.to)) + (m.periodEnd ? ' by ' + esc(PMU.fmt.date(m.periodEnd)) : ' month end') + '</span></div>';
      /* the facts row from about 300 px (it wraps; the plot takes what is left); narrower, the info icon in the hero row
         lists them (CONTENT-3: "Forecast used" was nowhere on the Overview card) */
      var factsOk = C.h(ctx, 'h3') && m.facts && ctx.tier.bw >= 300;
      if (!factsOk && m.facts && m.facts.length) hero = hero.replace(/<\/div>$/, caveat(cavText(m, false)) + '</div>');
      var mixOk = m.mix && C.w(ctx, 'xl') && C.h(ctx, 'h3');
      /* the one-line hero is 29 px plus a 6 px gap (measured); compact heroes wrap to two lines */
      var reserve = (compact ? 56 : 40) + (factsOk ? 30 : 0) + (mixOk ? 40 : 0);
      /* the plot takes whatever the hero leaves (the hero wraps to a second line at some widths), so no band stays empty */
      void reserve;
      body.innerHTML = '<div class="pmu-budget' + (compact ? ' is-compact' : '') + '">' + hero + '<div class="pmu-budgetplot pmu-fillplot"></div>' +
        (factsOk ? '<div class="pmu-factrow">' + m.facts.map(function (f) { return '<span><em>' + esc(f[0]) + '</em> <b>' + esc(f[1]) + '</b></span>'; }).join('') + '</div>' : '') +
        (mixOk ? '<div class="pmu-budgetmix"></div>' : '') + '</div>';
      C.chart(body, 'budget', body.querySelector('.pmu-budgetplot'), budgetSpec(m, compact),
        { label: 'Budget projection: ' + C.money(m.spent) + ' of ' + C.money(m.budget), tier: ctx.tier, readout: true });
      if (mixOk) C.chart(body, 'mix', body.querySelector('.pmu-budgetmix'), { segments: m.mix, legend: true }, { label: 'Plan allocation versus metered' });
    },
    /* a live beat (spend): the number rolls its changed digits, the "of budget" words and the facts row patch in place,
       the line takes its next point through charts' chart.live; no dry render (E3-7 budget) */
    live: function (body, ctx) {
      var m = ctx.model, b = body._pmu, hero = body.querySelector('.pmu-budgethero');
      if (!m || !b || !b.objs || !b.objs.length || b.objs[0].name !== 'budget' || !hero) return false;
      var num = hero.querySelector('.pmu-num[data-k]'), from = num ? parseFloat(num.getAttribute('data-v')) : NaN;
      if (num && isFinite(from) && from !== m.spent) {
        num.setAttribute('data-v', String(m.spent));
        if (ctx.liveFinal) num.textContent = C.numOnly(m.spent, 'money2'); else PMU.motion.countUp(num, from, m.spent, function (v) { return C.numOnly(v, 'money2'); }, { dur: 'value' });
      }
      var pct = m.budget ? Math.round(100 * m.spent / m.budget) : null, of = hero.querySelector('.pmu-budgetof');
      var ofT = m.budget ? 'of ' + C.money(m.budget) + ' budget · ' + pct + '%' : 'No budget set'; if (of && of.textContent !== ofT) of.textContent = ofT;
      var fr = body.querySelector('.pmu-factrow');
      if (fr && m.facts) { var fh = m.facts.map(function (f) { return '<span><em>' + esc(f[0]) + '</em> <b>' + esc(f[1]) + '</b></span>'; }).join(''); if (fr.innerHTML !== fh) C.setHtml(fr, fh); }
      var compact = body.querySelector('.pmu-budget.is-compact') !== null, spec = budgetSpec(m, compact), o = b.objs[0], same = false;
      try { same = JSON.stringify(spec) === JSON.stringify(o.spec); } catch (error) {}
      if (!same && o.chart) C.chartTo(o.chart, spec, ctx);
      o.spec = spec;
      /* the legend's plan allocation part takes the live spend too (FINAL-REVIEW-3 must-fix 3: "$145.88 + $38.74" stayed
         beside a rising headline) */
      b.objs.forEach(function (x) {
        if (x.name !== 'mix' || !m.mix) return;
        var ms = { segments: m.mix, legend: true }, eq = false;
        try { eq = JSON.stringify(ms) === JSON.stringify(x.spec); } catch (error) {}
        if (!eq && x.chart) C.chartTo(x.chart, ms, ctx);
        x.spec = ms;
      });
      return true;
    }
  });
  function budgetSpec(m, compact) { return { days: m.days, today: m.today, cumulative: m.cumulative, projection: m.projection, budget: m.budget || 0, unit: 'usd', compact: compact, monthStart: m.periodStart }; }

  /* ================================================================== heat: weekday x hour (A1 7.7) */
  C.kind('heat', {
    render: function (body, ctx) {
      var mode = C.cfg(ctx.id, 'mode', 'tokens');
      var h = PMU.data.heat(mode);
      var tools = C.headTools(ctx, C.w(ctx, 'm') ? '<span data-key="mode">' + C.seg('seg', [{ value: 'tokens', label: 'Tokens' }, { value: 'cost', label: 'Cost', disabled: !h.hasValue, reason: 'Value per hour is not recorded for this range' }], h.mode, 'Heat measure') + '</span>' : '');
      var toolsH = (tools ? 34 : 0) + 6;
      var fmt = h.mode === 'cost' ? function (v) { return C.money(v); } : function (v) { return PMU.fmt.tok(v); };
      var peak = h.peak.v >= 0 ? h.rows[h.peak.r].label + ' ' + (h.peak.c < 10 ? '0' : '') + h.peak.c + ':00 · ' + fmt(h.peak.v) : '';
      body.innerHTML = '<div class="pmu-heatw">' + tools + '<div class="pmu-heatplot" style="height:' + hostH(ctx, toolsH) + 'px"></div></div>';
      C.chart(body, 'heat', body.querySelector('.pmu-heatplot'), {
        rows: h.rows.map(function (r) { return r.label; }), cols: 24,
        values: h.rows.map(function (r) { return r.cells.map(function (c) { return c.v; }); }),
        outside: h.rows.map(function (r) { return r.cells.map(function (c) { return c.outside; }); }),
        requests: h.rows.map(function (r) { return r.cells.map(function (c) { return c.req; }); }),
        top: h.rows.map(function (r) { return r.cells.map(function (c) { return c.top; }); }),
        peak: { row: h.peak.r, col: h.peak.c, label: peak }, unit: h.mode === 'cost' ? 'usd' : 'tokens', mode: h.mode
      }, { label: 'Activity by hour, ' + h.mode + ', last 7 days. Busiest ' + peak, tier: ctx.tier });
    }
  });
})();
