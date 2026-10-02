/* Chart-backed widget kinds (owner: content; split out of 50-w-common.js to keep files readable; DESIGN-SPEC 4 and 7,
   DESIGN-SPEC-ATLAS 7.2, 7.7, 7.8, 7.11): trend (area / line / spark), columns (labelled and stacked), budget, heat.
   Every chart is drawn by PMU.charts; the kinds add the headline, legend, facts, notes and the head tools. */
(function () {
  var C = PMU.content;

  function hostH(ctx, reserve) { return Math.max(40, Math.floor(ctx.tier.bh - reserve)); }

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
        return;
      }
      var tools = C.headTools(ctx, m.tools && C.w(ctx, m.toolsMin || 's') ? m.tools : '');
      var legendOk = !!m.legendOwn && C.w(ctx, 's');
      /* a room's hero chart leads with its number (WOW-TASKS N-2) */
      var heroH = m.hero && m.headline && C.isHero(ctx) ? C.heroHead(ctx, { value: m.headline.value, fmt: m.headline.fmt, label: m.headline.label, sub: m.heroSub, tone: m.heroTone, note: C.w(ctx, 'xl') ? m.heroNote : '', noteTone: m.heroTone }) : '';
      /* rangebars are rows (18 px axis + 30 px per tool): they need their whole height before facts or a note get room */
      var MINP = m.chart === 'rangebars' ? 22 + ((m.spec && m.spec.rows) || []).length * 30 : 120;
      var room = ctx.tier.bh - (tools ? 34 : 0) - (legendOk ? 24 : 0) - (heroH ? 66 : 0) - MINP;
      var factsOk = m.facts && m.facts.length && C.w(ctx, 'l') && room >= 28; if (factsOk) room -= 28;
      var noteOk = m.note && C.w(ctx, 'm') && room >= 24; if (noteOk) room -= 24;
      var reserve = (tools ? 34 : 0) + (legendOk ? 24 : 0) + (heroH ? 66 : 0) + (noteOk ? 24 : 0) + (factsOk ? 28 : 0) + 6;
      body.innerHTML = '<div class="pmu-trend' + (heroH ? ' is-hero' : '') + '">' + heroH + tools + (legendOk ? '<div class="pmu-trendlegend"></div>' : '') +
        '<div class="pmu-trendplot" style="height:' + (m.chart === 'rangebars' ? Math.max(MINP, hostH(ctx, reserve)) : hostH(ctx, reserve)) + 'px"></div>' +
        (factsOk ? '<div class="pmu-factrow">' + m.facts.map(function (f) { return '<span><em>' + esc(f[0]) + '</em> <b>' + esc(f[1]) + '</b></span>'; }).join('') + '</div>' : '') +
        (noteOk ? '<p class="pmu-note">' + esc(m.note) + '</p>' : '') + '</div>';
      if (legendOk) { try { PMU.charts.legend(body.querySelector('.pmu-trendlegend'), m.legendOwn, { inline: true }); } catch (error) { console.error('[pm-usage] legend', error); } }
      C.chart(body, m.chart || 'area', body.querySelector('.pmu-trendplot'), m.spec, { label: m.label || ctx.def.title, tier: ctx.tier, readout: true, fmt: m.fmt });
      C.bag(body).sig = sig(ctx);
    },
    /* same tier and same structure: morph the plot in place (paths tween, axes cross-fade) instead of rebuilding it */
    update: function (body, ctx) {
      var b = body._pmu, m = ctx.model;
      if (!b || b.charts.length !== 1 || !m || !m.spec || b.sig !== sig(ctx) || !body.querySelector('.pmu-trendplot')) return false;
      try { b.charts[0].update(m.spec); } catch (error) { return false; }
      var legend = body.querySelector('.pmu-trendlegend');
      if (legend && m.legendOwn) { legend.textContent = ''; try { PMU.charts.legend(legend, m.legendOwn, { inline: true }); } catch (error) {} }
      var note = body.querySelector('.pmu-note'); if (note && m.note) note.textContent = m.note;
      /* the hero number rolls its changed digits and its row flashes (WOW-SPEC 3.6) */
      var hn = body.querySelector('.pmu-herohead .pmu-num[data-k]');
      if (hn && m.headline) {
        var oldV = parseFloat(hn.getAttribute('data-v')), f = hn.getAttribute('data-f'), to = m.headline.value;
        var lb = body.querySelector('.pmu-herohead .pmu-herolabel'); if (lb && lb.textContent !== (m.headline.label || '')) lb.textContent = m.headline.label || '';
        if (isFinite(oldV) && isFinite(to) && oldV !== to) {
          hn.setAttribute('data-v', String(to));
          PMU.motion.countUp(hn, oldV, to, function (v) { return C.numOnly(v, f); }, { dur: 'value' });
          C.flashRow(hn.closest('.pmu-herohead'));
        }
      }
      /* the facts under the chart follow the range with the chart (REVIEW-jared must-fix 4: they stayed at 24 hours) */
      var fr = body.querySelector('.pmu-factrow');
      if (fr && m.facts) {
        var fh = m.facts.map(function (f) { return '<span><em>' + esc(f[0]) + '</em> <b>' + esc(f[1]) + '</b></span>'; }).join('');
        if (fr.innerHTML !== fh) { fr.innerHTML = fh; if (PMU.motion && PMU.motion.animate) PMU.motion.animate(fr, [{ opacity: 0.25 }, { opacity: 1 }], { dur: 420, ease: 'out' }); }
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
      var factsOk = m.facts && m.facts.length && C.w(ctx, 'm') && room >= 28; if (factsOk) room -= 28;
      var noteOk = m.note && C.w(ctx, 'm') && room >= 24; if (noteOk) room -= 24;
      var reserve = (tools ? 34 : 0) + (capOk ? capH : 0) + (noteOk ? 24 : 0) + (factsOk ? 28 : 0) + 6;
      var plotW = Math.max(80, ctx.tier.bw - 52);
      var spec = rebucket(m, Math.max(3, Math.floor(plotW / 28)));
      body.innerHTML = '<div class="pmu-colsw">' + tools + (capOk ? '<div class="pmu-colscap">' + m.caption + '</div>' : '') + (legendOk ? '<div class="pmu-trendlegend"></div>' : '') +
        '<div class="pmu-colsplot" style="height:' + hostH(ctx, reserve) + 'px"></div>' +
        (factsOk ? '<div class="pmu-factrow">' + m.facts.map(function (f) { return '<span><em>' + esc(f[0]) + '</em> <b>' + esc(f[1]) + '</b></span>'; }).join('') + '</div>' : '') +
        (noteOk ? '<p class="pmu-note">' + esc(m.note) + '</p>' : '') + '</div>';
      if (legendOk) { try { PMU.charts.legend(body.querySelector('.pmu-trendlegend'), m.legend, { inline: true }); } catch (error) {} }
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
      var hero = '<div class="pmu-budgethero' + (big ? ' is-hero' : '') + '">' + C.valHtml(m.spent, 'money2', big ? 'pmu-heronum' : 'pmu-bigval', ctx.id + ':spent').replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"') +
        '<span class="pmu-budgetof">' + (m.budget ? 'of ' + esc(C.money(m.budget)) + ' budget · ' + pct + '%' : 'No budget set') + '</span>' +
        '<span class="pmu-budgetest">est. ' + esc(C.money(m.projection.to)) + (m.periodEnd ? ' by ' + esc(PMU.fmt.date(m.periodEnd)) : ' month end') + '</span></div>';
      var factsOk = C.w(ctx, 'l') && C.h(ctx, 'h3') && m.facts;
      var mixOk = m.mix && C.w(ctx, 'xl') && C.h(ctx, 'h3');
      /* the one-line hero is 29 px plus a 6 px gap (measured); compact heroes wrap to two lines */
      var reserve = (compact ? 56 : 40) + (factsOk ? 30 : 0) + (mixOk ? 40 : 0);
      /* the plot takes whatever the hero leaves (the hero wraps to a second line at some widths), so no band stays empty */
      void reserve;
      body.innerHTML = '<div class="pmu-budget' + (compact ? ' is-compact' : '') + '">' + hero + '<div class="pmu-budgetplot pmu-fillplot"></div>' +
        (factsOk ? '<div class="pmu-factrow">' + m.facts.map(function (f) { return '<span><em>' + esc(f[0]) + '</em> <b>' + esc(f[1]) + '</b></span>'; }).join('') + '</div>' : '') +
        (mixOk ? '<div class="pmu-budgetmix"></div>' : '') + '</div>';
      C.chart(body, 'budget', body.querySelector('.pmu-budgetplot'), { days: m.days, today: m.today, cumulative: m.cumulative, projection: m.projection, budget: m.budget || 0, unit: 'usd', compact: compact, monthStart: m.periodStart },
        { label: 'Budget projection: ' + C.money(m.spent) + ' of ' + C.money(m.budget), tier: ctx.tier, readout: true });
      if (mixOk) C.chart(body, 'mix', body.querySelector('.pmu-budgetmix'), { segments: m.mix, legend: true }, { label: 'Plan allocation versus metered' });
    }
  });

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
