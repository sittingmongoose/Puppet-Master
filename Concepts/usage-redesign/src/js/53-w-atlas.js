/* The Atlas widget kinds (owner: content; DESIGN-SPEC-ATLAS 7.3 to 7.10): models (cost by model), donut (model usage),
   breakdown (token types), efficiency (cache), qhist (quota history rows), agenda (resets and expiries). Split out of
   50-w-common.js to keep files readable; same rules: charts from PMU.charts only, rows hidden whole when they do not fit. */
(function () {
  var C = PMU.content;
  var TK = [['in', 'Input'], ['out', 'Output'], ['rsn', 'Reasoning'], ['cw', 'Cache write'], ['cr', 'Cache read']];

  function tkLegend(list) {
    return '<span class="pmu-legend pmu-legend-inline">' + list.map(function (t) {
      return '<span class="pmu-legend-item"><i class="pmu-swatch" data-sw="box" data-tk="' + t[0] + '"></i><span class="pmu-legend-name">' + esc(t[1]) + '</span></span>';
    }).join('') + '</span>';
  }
  C.tkLegend = tkLegend;
  function shareText(s) { return s <= 0 ? '0%' : s < 0.001 ? '<0.1%' : (100 * s).toFixed(1) + '%'; }
  C.shareText = shareText;

  /* ================================================================== models: cost by model (A1 7.3) */
  C.kind('models', {
    render: function (body, ctx) {
      var list = (ctx.model && ctx.model.rows) || [];
      var shown = list.filter(function (m) { return m.tokens.total > 0 || m.value.total > 0; }), left = list.filter(function (m) { return !(m.tokens.total > 0 || m.value.total > 0); });
      if (!shown.length) { body.innerHTML = C.empty('No model activity in this range.', 'Selected scope and range'); return; }
      var two = ctx.tier.bw < 360;
      var tools = C.headTools(ctx, tkLegend(TK));
      var footText = (left.length ? left.map(function (m) { return m.name; }).join(', ') + (left.length > 1 ? ' are' : ' is') + ' left out: no tokens or value recorded. ' : '') +
        'Value by token type is a PM estimate at catalog rates; the parts add up to the recorded value.';
      var rowH = two ? 48 : 42, reserve = (tools ? 34 : 0) + (two ? 0 : 28) + 44;
      var fit = C.fit(ctx.tier.bh, rowH, reserve);
      var rows = shown.length > fit ? shown.slice(0, Math.max(1, fit * rowH + 22 + reserve <= ctx.tier.bh ? fit : fit - 1)) : shown;
      var maxV = Math.max.apply(null, shown.map(function (m) { return m.value.total; }).concat([1e-9]));
      body.innerHTML = '<div class="pmu-models">' + tools + '<div class="pmu-modelshost"></div>' + C.more(shown.length - rows.length, 'models') + '</div>' + C.foot(esc(footText), 'info');
      var host = body.querySelector('.pmu-modelshost');
      var c = C.chart(body, 'stackbar', host, { rows: rows.map(function (m) {
        return { id: m.id, name: m.name, providerId: m.providerId, vendor: m.vendor, fill: Math.max(0.004, m.value.total / maxV),
          segments: TK.map(function (t) { return { type: t[0], value: m.value[t[0]], tokens: m.tokens[t[0]] }; }),
          tokensText: PMU.fmt.tok(m.tokens.total), valueText: C.money(m.value.total), shareText: shareText(m.valueShare), attemptsText: m.attempts + ' · ' + m.requests + ' requests',
          hover: m.role + (m.requested && m.requested !== m.effective ? ' · requested ' + m.requested + ', effective ' + m.effective : ' · requested and effective match') };
      }) }, { label: 'Estimated cost by model and token type', onRow: function (id, el) { C.modelPop(rows.filter(function (m) { return m.id === id; })[0], el); } });
      if (!c) host.innerHTML = rows.map(function (m) { return '<div class="pmu-lrow"><span class="pmu-lname"><b>' + esc(m.name) + '</b></span><span class="pmu-lval">' + esc(C.money(m.value.total)) + '</span></div>'; }).join('');
    }
  });
  /* the model popover (A1 7.3.1) through the shared menu component (custom body) */
  C.modelPop = function (m, anchor) {
    if (!m || !PMU.menu) return;
    var vt = PMU.data.valueByType(), allTok = vt.tokens.total || 1;
    var ratio = m.tokens.out + m.tokens.rsn > 0 ? (m.tokens.in + m.tokens.cr + m.tokens.cw) / (m.tokens.out + m.tokens.rsn) : null;
    var maxT = Math.max.apply(null, TK.map(function (t) { return m.tokens[t[0]]; }).concat([1]));
    var html = '<div class="pmu-modelpop">' +
      '<div class="pmu-mpstats"><span><b>' + esc(shareText(m.tokens.total / allTok)) + '</b><em>share of all tokens</em></span><span><b>' + esc(C.money(m.value.total)) + '</b><em>estimated cost</em></span>' +
      '<span><b>' + esc(PMU.fmt.tok(m.tokens.total)) + '</b><em>tokens of all types</em></span></div>' +
      '<div class="pmu-cap">TOKEN TYPES</div>' + TK.map(function (t) {
        return '<div class="pmu-mptype"><i class="pmu-swatch" data-sw="box" data-tk="' + t[0] + '"></i><span>' + esc(t[1]) + '</span><span class="pmu-mpbar"><i data-tk="' + t[0] + '" style="--f:' + (100 * m.tokens[t[0]] / maxT).toFixed(1) + '%"></i></span>' +
          '<b>' + esc(PMU.fmt.tok(m.tokens[t[0]])) + '</b><b>' + esc(C.money(m.value[t[0]])) + '</b></div>';
      }).join('') +
      '<div class="pmu-cap">INPUT TO OUTPUT RATIO</div><div class="pmu-mpratio"><b>' + (ratio === null ? '-' : ratio.toFixed(1) + ' to 1') + '</b><span>' +
      esc(ratio === null ? 'No output recorded.' : ratio >= 3 ? 'More input than output: a reading-heavy workload.' : ratio >= 1 ? 'Input and output are close: a balanced workload.' : 'More output than input: a writing-heavy workload.') + '</span></div>' +
      '<div class="pmu-cap">ATTEMPTS</div><p class="pmu-mpline">' + esc(m.attempts + ' attempts · ' + m.requests + ' requests · settled ' + C.money(m.settled) + ' · plan estimate ' + C.money(m.planEstimate)) + '</p>' +
      '<p class="pmu-mpline">' + esc('Requested ' + m.requested + ' · effective ' + m.effective + ' · ' + m.role) + '</p>' +
      '<p class="pmu-mprates">' + esc('Catalog rates: $' + m.rates.in.toFixed(2) + ' in, $' + m.rates.out.toFixed(2) + ' out, $' + m.rates.cw.toFixed(2) + ' cache write, $' + m.rates.cr.toFixed(3).replace(/0$/, '') + ' cache read per million tokens') + '</p>' +
      '<button type="button" class="pmu-textbtn" data-mp-details>Details</button></div>';
    PMU.menu.toggle(anchor, { id: 'model-' + m.id, title: m.name, current: (PMU.roster.provider(m.providerId) || { name: m.providerId }).name + ' · selected range', width: 440, className: 'pmu-modelmenu',
      rows: [], empty: ' ', body: function (host, h) {
        host.innerHTML = html;
        var btn = host.querySelector('[data-mp-details]');
        if (btn) btn.addEventListener('click', function () { h.close({ focus: false }); C.modelInspect(m, anchor); });
      } });
  };
  C.modelInspect = function (m, opener) {
    PMU.inspector.open({ kind: 'panel', title: m.name, subtitle: m.role, sections: [
      { title: 'Model', rows: [['Effective', esc(m.effective)], ['Requested', esc(m.requested)], ['Model id', esc(m.modelId)], ['Provider', esc((PMU.roster.provider(m.providerId) || { name: m.providerId }).name)], ['Role', esc(m.role)]] },
      { title: 'Tokens by type', rows: TK.map(function (t) { return [t[1], esc(PMU.fmt.tok(m.tokens[t[0]]) + ' · ' + C.money(m.value[t[0]]) + ' est.')]; }) },
      { title: 'Value', rows: [['Recorded value', esc(C.money(m.value.total))], ['Settled', esc(C.money(m.settled))], ['Plan estimate', esc(C.money(m.planEstimate))], ['Cache avoided', esc(C.money(m.cacheAvoided) + ' est.')],
        ['Basis', 'PM estimate at catalog rates; the parts add up to the recorded value']] },
      { title: 'Attempts', rows: [['Attempts', esc(String(m.attempts))], ['Requests', esc(String(m.requests))], ['Attempt ids', esc(m.attemptIds.join(', '))]] }
    ] }, opener);
  };

  /* ================================================================== donut: model usage (A1 7.4) */
  C.kind('donut', {
    render: function (body, ctx) {
      var mode = C.cfg(ctx.id, 'mode', 'tokens');
      var list = ((ctx.model && ctx.model.rows) || []).filter(function (m) { return mode === 'cost' ? m.value.total > 0 : m.tokens.total > 0; });
      if (!list.length) { body.innerHTML = C.empty('No model activity in this range.'); return; }
      var val = function (m) { return mode === 'cost' ? m.value.total : m.tokens.total; };
      var total = PMU.data.sum(list.map(val));
      var fmt = mode === 'cost' ? function (v) { return C.money(v); } : function (v) { return PMU.fmt.tok(v); };
      var tools = C.headTools(ctx, C.w(ctx, 'm') ? '<span data-key="mode">' + C.seg('seg', [{ value: 'tokens', label: 'Tokens' }, { value: 'cost', label: 'Cost' }], mode, 'Measure') + '</span>' : '');
      body.innerHTML = '<div class="pmu-donutw">' + tools + '<div class="pmu-donuthost" style="height:' + Math.max(120, ctx.tier.bh - (tools ? 34 : 0)) + 'px"></div></div>';
      C.chart(body, 'donut', body.querySelector('.pmu-donuthost'), { segments: list.map(function (m) { return { id: m.id, name: m.name, value: val(m), vendor: m.vendor, shade: m.shade || 1, prov: m.providerId, sub: m.role }; }),
        centre: { value: fmt(total), caption: mode === 'cost' ? 'estimated cost, all models' : 'tokens, all models' }, mode: mode, fmt: fmt }, { label: 'Model usage by ' + mode });
    }
  });

  /* ================================================================== breakdown: token types (A1 7.5) */
  C.kind('breakdown', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m || !m.rows.length) { body.innerHTML = C.empty('No token activity in this range.'); return; }
      var tools = C.headTools(ctx, '<span class="pmu-legend pmu-legend-inline"><span class="pmu-legend-item"><i class="pmu-swatch" data-sw="soft" data-tk="all"></i><span class="pmu-legend-name">Share of tokens</span></span>' +
        '<span class="pmu-legend-item"><i class="pmu-swatch" data-sw="box" data-tk="all"></i><span class="pmu-legend-name">Share of cost</span></span></span>');
      var narrow = ctx.tier.bw < 360, rowH = narrow ? 41 : 36, gap = 12;
      var rows = m.rows, need = rows.length * rowH + (rows.length - 1) * gap + (tools ? 34 : 0);
      var footOk = m.foot && need + 50 <= ctx.tier.bh + 12;
      body.innerHTML = '<div class="pmu-breakw">' + tools + '<div class="pmu-breakhost"></div></div>' + (footOk ? C.foot(esc(m.foot), 'info') : '');
      var c = C.chart(body, 'sharebars', body.querySelector('.pmu-breakhost'), { rows: rows, narrow: narrow }, { label: 'Token breakdown' });
      if (!c) body.querySelector('.pmu-breakhost').innerHTML = rows.map(function (r) { return '<div class="pmu-lrow"><span class="pmu-lname"><b>' + esc(r.name) + '</b></span><span class="pmu-lval">' + esc(PMU.fmt.tok(r.tokens) + ' · ' + C.money(r.value)) + '</span></div>'; }).join('');
    }
  });

  /* ================================================================== efficiency: cache (A1 7.6) */
  /* model: {read, write, share, savings, cost, costRead, costWrite, spark?: values, notes: [..]} */
  C.kind('efficiency', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('No cache activity in this range.'); return; }
      var bw = ctx.tier.bw, bh = ctx.tier.bh, narrow = bw < 300;
      /* priority: ring + savings, the read / write split, cache cost, the explanation, the foot, the 30-day spark */
      var ring = narrow ? Math.max(72, Math.min(96, bh - 150)) : Math.max(80, Math.min(bw < 360 ? 104 : 120, bh - 50));
      var used = 0, saveH = 56, costH = 70, explH = 34, splitH = 48, footH = 56, sparkH = 50;
      var top = function (cost, expl) { var f = saveH + (cost ? costH : 0) + (expl ? explH : 0); return narrow ? ring + 10 + f : Math.max(ring, f); };
      used = top(false, false);
      var splitOk = used + splitH <= bh; if (splitOk) used += splitH;
      var costOk = top(true, false) - top(false, false) + used <= bh; if (costOk) used += top(true, false) - top(false, false);
      var explOk = bw >= 260 && top(costOk, true) - top(costOk, false) + used <= bh; if (explOk) used += top(costOk, true) - top(costOk, false);
      var footOk = used + footH <= bh; if (footOk) used += footH;
      var sparkOk = m.spark && used + sparkH <= bh; if (sparkOk) used += sparkH;
      var foot2 = C.w(ctx, 'm');
      body.innerHTML = '<div class="pmu-eff' + (narrow ? ' is-narrow' : '') + '">' +
        '<div class="pmu-efftop"><div class="pmu-effring" style="width:' + ring + 'px;height:' + ring + 'px"></div><div class="pmu-efffacts">' +
        '<div class="pmu-effsave"><span>Estimated savings</span>' + C.valHtml(m.savings, 'money2', 'pmu-factv big', ctx.id + ':sv').replace('class="pmu-num"', 'class="pmu-num" data-count="1"') +
        (explOk ? '<em>Cache reads priced at the cache-read rate instead of the input rate · PM estimate</em>' : '') + '</div>' +
        (costOk ? '<div class="pmu-effcost"><span>Cache cost</span>' + C.valHtml(m.cost, 'money2', 'pmu-factv', ctx.id + ':cc') +
          '<em>writes ' + esc(C.money(m.costWrite)) + ' · reads ' + esc(C.money(m.costRead)) + '</em></div>' : '') + '</div></div>' +
        (splitOk ? '<div class="pmu-effsplit"></div><p class="pmu-efflegend"><i class="pmu-swatch" data-sw="box" data-tk="cr"></i>Reads <b>' + esc(PMU.fmt.tok(m.read)) + '</b> · <i class="pmu-swatch" data-sw="box" data-tk="cw"></i>Writes <b>' +
          esc(m.write ? PMU.fmt.tok(m.write) : 'none recorded') + '</b></p>' : '') + (sparkOk ? '<div class="pmu-effspark"></div>' : '') + '</div>' +
        (footOk ? C.foot(esc(m.notes[0]) + (foot2 && m.notes[1] ? '<br>' + esc(m.notes[1]) : ''), 'info') : '');
      C.chart(body, 'ring', body.querySelector('.pmu-effring'), { value: m.share, max: 100, centre: m.share.toFixed(1) + '%', caption: 'read share', token: 'cr' }, { label: 'Cache read share ' + m.share.toFixed(1) + '%' });
      if (splitOk) C.chart(body, 'split', body.querySelector('.pmu-effsplit'), { parts: [{ name: 'Reads', value: m.read, token: 'cr' }, { name: 'Writes', value: m.write, token: 'cw' }], legend: false }, { label: 'Cache reads versus writes' });
      if (sparkOk) C.chart(body, 'spark', body.querySelector('.pmu-effspark'), { values: m.spark, tk: 'cr', idx: 7 }, { label: '30-day read share' });
    }
  });

  /* ================================================================== qhist: quota history rows (A1 7.9) */
  var openRows = {};
  C.kind('qhist', {
    render: function (body, ctx) {
      var q = ctx.model; if (!q || !q.groups.length) { body.innerHTML = C.empty('No provider in scope reports quota windows.'); return; }
      var bw = ctx.tier.bw, wide = bw >= 760, mid = bw >= 560;
      var tmpl = wide ? 'minmax(240px,34%) minmax(140px,1fr) 76px 110px 26px' : mid ? 'minmax(170px,36%) minmax(110px,1fr) 64px 96px 22px' : 'minmax(120px,40%) minmax(80px,1fr) 56px 20px';
      var collapsed = (C.view(ctx.id, 'collapsed', '') || '').split(',').filter(Boolean);
      var open = openRows[ctx.id] || '';
      var rowH = mid ? 36 : 40, headH = 36, focusH = 236;
      var budget = ctx.tier.bh - 22 - (q.noWindows.length ? 34 : 0) - (open ? focusH : 0);
      var used = 0, hiddenRows = 0, out = [], rowsDrawn = [];
      var tlW = wide ? bw * 0.66 - 230 : mid ? bw * 0.64 - 200 : bw * 0.6 - 110;
      var axis = axisTicks(q, Math.max(1, Math.ceil(7 * 34 / Math.max(60, tlW))));
      out.push('<div class="pmu-qrow pmu-qaxis" style="grid-template-columns:' + tmpl + '"><span></span><span class="pmu-qticks">' + axis.map(function (t) { return '<i style="left:' + t.x + '%"' + (t.now ? ' class="is-now"' : '') + '>' + esc(t.label) + '</i>'; }).join('') +
        '</span><span class="pmu-cap" data-align="r">USED</span>' + (mid ? '<span class="pmu-cap" data-align="r">NEXT RESET</span>' : '') + '<span></span></div>');
      q.groups.forEach(function (g) {
        var single = g.rows.length === 1, isCol = collapsed.indexOf(g.providerId) >= 0;
        if (!single) {
          if (used + headH > budget) { hiddenRows += g.rows.length; return; }
          used += headH;
          out.push('<button type="button" class="pmu-qgroup" data-reveal data-pmu-act="qgroup" data-value="' + esc(g.providerId) + '" aria-expanded="' + !isCol + '" data-prov="' + esc(g.providerId) + '">' +
            '<span class="pmu-qchev' + (isCol ? ' is-col' : '') + '">' + SVG.chevronDown + '</span>' + PMU.mark(g.providerId, 20) + '<b>' + esc(g.name) + '</b><span>' + esc(g.rows.length + ' accounts · ' + g.windowLabel) + '</span></button>');
        }
        if (isCol && !single) return;
        g.rows.forEach(function (r) {
          var a = r.account, key = a.key, isOpen = open === key;
          if (used + rowH > budget) { hiddenRows += 1; return; }
          used += rowH;
          var main = r.main, pct = main ? main.pct : null;
          var usedHtml = pct === null ? C.vs(main && main.vs === 'not_exposed' ? 'not_exposed' : 'unknown', main ? PMU.roster.vsWord(main) : 'Usage unknown')
            : '<b class="pmu-qused" data-tone="' + (main.tone || 'calm') + '">' + esc(C.fmt(pct, pct < 10 && pct % 1 ? 'pct1' : 'pct')) + '</b>';
          var nextTxt = r.next ? (r.next.truth === 'locally_inferred' ? '≈ ' : '') + PMU.fmt.until(r.next.resetAt) : 'reset unknown';
          var nextHover = r.next ? r.next.short + ' window · ' + PMU.fmt.date(r.next.resetAt) + ' ' + PMU.fmt.clock(r.next.resetAt) + ' · ' + r.next.truth.replace(/_/g, ' ') : 'No upcoming reset is known';
          /* words that repeat the provider name are left out ("OpenCode Go · OpenCode Go", "Muse Code · Muse Code") */
          var ident = single ? PMU.mark(g.providerId, 20) + '<b>' + esc(g.name) + '</b>' + (a.nickname && a.nickname !== g.name ? '<span class="pmu-qacct">' + esc(a.nickname) + '</span>' : '') : '<b>' + esc(a.nickname) + '</b>';
          /* a single-account row already carries the provider name: its plan shows from 560 px, its window word from 760 px */
          var meta = (a.effective && g.rows.length > 1 ? '<em class="pmu-qactive">Active</em>' : '') + (a.plan && !(single && (a.plan === g.name || !mid)) ? '<span class="pmu-qplan">' + esc(a.plan) + '</span>' : '') +
            (main && single && wide ? '<span class="pmu-qplan">' + esc(main.short.toLowerCase()) + '</span>' : '');
          out.push('<div class="pmu-qrow pmu-row' + (single ? ' is-single' : '') + (isOpen ? ' is-open' : '') + '" data-reveal data-flash-key="' + esc(key) + '" data-flash-sig="' + esc(String(pct) + '|' + a.effective) + '" data-prov="' + esc(g.providerId) + '" data-pmu-act="qrow" data-value="' + esc(key) + '" role="button" tabindex="0" aria-expanded="' + isOpen + '" style="grid-template-columns:' + tmpl + '"' +
            C.hover(a.nickname, a.identity) + '><span class="pmu-qident">' + ident + meta + '</span><span class="pmu-qline" data-key="' + esc(key) + '"></span><span class="pmu-qusedcell" data-align="r">' + usedHtml +
            (mid ? '' : '<em>' + esc(nextTxt) + '</em>') + '</span>' + (mid ? '<span class="pmu-qnext" data-align="r"' + C.hover('Next reset', nextHover) + '>' + esc(nextTxt) + '</span>' : '') +
            '<span class="pmu-qchev pmu-qrowchev' + (isOpen ? ' is-open' : '') + '">' + SVG.chevronDown + '</span></div>');
          rowsDrawn.push(r);
          if (isOpen) out.push('<div class="pmu-qfocus" data-key="' + esc(key) + '"><div class="pmu-qfocushost"></div></div>');
        });
      });
      if (hiddenRows) out.push(C.more(hiddenRows, hiddenRows === 1 ? 'account' : 'accounts'));
      body.innerHTML = '<div class="pmu-qhist">' + out.join('') + '</div>' + (q.noWindows.length ? C.foot(esc(listWords(q.noWindows) + (q.noWindows.length > 1 ? ' expose' : ' exposes') + ' no quota windows.'), 'info') : '');
      rowsDrawn.forEach(function (r) {
        var host = body.querySelector('.pmu-qline[data-key="' + r.account.key + '"]');
        if (!host) return;
        if (!r.points) { host.innerHTML = '<span class="pmu-qnone">' + esc(r.main && r.main.pct === null ? '' : 'no history yet') + '</span>'; return; }
        C.chart(body, 'qspark', host, { runs: r.runs, ref100: true, points: r.points }, { label: r.account.nickname + ' ' + (r.main ? r.main.short : '') + ' history, 7 days' });
      });
      if (open) {
        var r = rowsDrawn.filter(function (x) { return x.account.key === open; })[0], fh = body.querySelector('.pmu-qfocushost');
        if (r && fh) {
          var th = PMU.roster.thresholds();
          C.chart(body, 'qspark', fh, { windows: r.focus.filter(function (f) { return f.points; }).map(function (f, i) { return { label: f.label, dash: ['', '9 4', '9 3 2 3'][i % 3], points: f.points }; }),
            thresholds: { warn: 100 - th.warnLeft, switch: 100 - th.switchLeft }, resets: r.focus.map(function (f) { return f.resetAt; }).filter(Boolean), now: q.now, bucketMs: q.bucketMs, n: q.points },
            { label: r.account.nickname + ', every window, 7 days', readout: true });
        }
      }
    }
  });
  function listWords(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  C.listWords = listWords;
  function axisTicks(q, every) {
    var n = q.points, span = n * q.bucketMs, start = q.now - span, out = [], d = new Date(start), k = 0; d.setHours(0, 0, 0, 0); d = d.getTime() + 86400000;
    var last = q.now - (every > 1 ? 12 : 3) * 3600000;
    for (; d < last; d += 86400000, k++) if (k % (every || 1) === 0) out.push({ x: (100 * (d - start) / span).toFixed(2), label: PMU.fmt.day(d) });
    out.push({ x: 100, label: 'Now', now: true });
    return out;
  }
  C.act('qgroup', function (el, id) {
    var cur = (C.view(id, 'collapsed', '') || '').split(',').filter(Boolean), v = el.getAttribute('data-value');
    C.setView(id, { collapsed: (cur.indexOf(v) >= 0 ? cur.filter(function (x) { return x !== v; }) : cur.concat([v])).join(',') });
  });
  C.act('qrow', function (el, id) {
    var v = el.getAttribute('data-value');
    openRows[id] = openRows[id] === v ? '' : v;
    viewAction('view.usage.quota_row_toggled', { widget_id: id, account: v, open: !!openRows[id] });
    var card = PMU.board.card(id); if (card) PMU.cards.updateAll([card], 'config');
    var focus = card && card.querySelector('.pmu-qfocus');
    if (focus && PMU.motion.clipReveal) PMU.motion.clipReveal(focus, { dur: 520, dir: 'y' });
  });

  C.qhistMeta = function () {
    return "Each account's main window · 7 days · select a row for every window";
  };
  C.horizonCfg = function (dflt) {
    return { id: 'horizon', label: 'Horizon', value: dflt, options: [{ value: '24h', label: 'Next 24 hours' }, { value: '7d', label: 'Next 7 days' }, { value: '30d', label: 'Next 30 days' }] };
  };
  C.agendaMeta = function (ctx, dflt) {
    var hz = C.cfg(ctx.id, 'horizon', dflt);
    return ({ '24h': 'Next 24 hours', '7d': 'Next 7 days', '30d': 'Next 30 days' }[hz] || 'Next 7 days') + ' · local time · from the latest readings';
  };

  /* ================================================================== agenda: resets and expiries (A1 7.10) */
  C.kind('agenda', {
    render: function (body, ctx) {
      var hz = C.cfg(ctx.id, 'horizon', ctx.def.horizon || '7d');
      var ag = PMU.data.agenda(hz);
      var groups = [];
      if (ag.passed.length) groups.push({ label: 'Passed', note: 'pending recheck', events: ag.passed, passed: true });
      ag.days.forEach(function (d) { groups.push(d); });
      if (ag.unknown.length) groups.push({ label: 'Reset unknown', note: '', events: ag.unknown, unknown: true });
      if (!groups.length) { body.innerHTML = C.empty('Nothing resets or expires in the ' + ({ '24h': 'next 24 hours', '7d': 'next 7 days', '30d': 'next 30 days' }[hz]) + '.'); return; }
      var bw = ctx.tier.bw, colsN = bw >= 900 ? 3 : bw >= 600 ? 2 : 1, narrow = bw < 300;
      var lineH = narrow ? 48 : 42, headH = 32;
      /* fit by columns: fill column after column with whole day groups and whole lines; one quiet foot line says what
         is hidden at this size and what lies beyond the horizon */
      var capacity = ctx.tier.bh - 26, colsUsed = [0], col = 0, out = [], hidden = 0, done = false;
      groups.forEach(function (g) {
        if (done) { hidden += g.events.length; return; }
        var need = headH + lineH;
        if (colsUsed[col] + need > capacity) { if (col + 1 < colsN) { col += 1; colsUsed[col] = 0; } else { done = true; hidden += g.events.length; return; } }
        colsUsed[col] += headH;
        var lines = [], cont = false;
        g.events.forEach(function (ev) {
          if (!done && colsUsed[col] + lineH > capacity && col + 1 < colsN && lines.length) {
            /* the day runs on into the next column under its own head, so no column starts headless */
            out.push(groupHtml(cont ? Object.assign({}, g, { note: 'continued' }) : g, lines, narrow));
            lines = []; cont = true; col += 1; colsUsed[col] = headH;
          }
          if (done || colsUsed[col] + lineH > capacity) { done = true; hidden += 1; return; }
          colsUsed[col] += lineH; lines.push(ev);
        });
        if (lines.length) out.push(groupHtml(cont ? Object.assign({}, g, { note: 'continued' }) : g, lines, narrow));
      });
      var parts = [];
      if (hidden) parts.push(hidden + (ag.beyond ? ' more here' : ' more at a taller size'));
      if (ag.beyond) parts.push(ag.beyond + (hidden ? ' after ' : ' more after ') + PMU.fmt.date(Date.now() + ({ '24h': 1, '7d': 7, '30d': 30 }[hz]) * 86400000));
      var beyond = parts.length ? '<p class="pmu-agbeyond"' + (ag.beyond ? C.hover(ag.beyond + ' more after this horizon', ag.beyondList.slice(0, 8).map(function (e) { return e.account.nickname + ' ' + e.what + ' ' + PMU.fmt.date(e.at); }).join(' · ')) : '') + '>' +
        esc(parts.join(' · ')) + '</p>' : '';
      body.innerHTML = '<div class="pmu-agenda" style="column-count:' + colsN + (colsN > 1 ? ';height:' + Math.max(80, capacity) + 'px;flex:none' : '') + '">' + out.join('') + '</div>' + beyond;
      body.querySelector('.pmu-agenda').addEventListener('click', function (event) {
        var row = event.target.closest('[data-key]'); if (!row) return;
        var acct = PMU.roster.account(row.getAttribute('data-acct')); if (acct && PMU.accounts) PMU.accounts.inspect(acct.key, row);
      });
    }
  });
  function groupHtml(g, lines, narrow) {
    return '<section class="pmu-agday" data-reveal><header><b>' + esc(g.label) + '</b><span>' + esc(g.note || '') + '</span></header>' + lines.map(function (ev) {
      var a = ev.account, time = ev.at ? (ev.inferred ? '≈ ' : '') + PMU.fmt.clock(ev.at) : '-';
      var used = ev.used.filter(function (u) { return u !== null && u !== undefined; });
      var usedHtml = used.length > 1 && used.every(function (u) { return u === used[0]; }) ? '<b data-tone="' + (PMU.roster.tone(used[0]) || 'calm') + '">' + esc(C.fmt(used[0], 'pct')) + '</b><em>both</em>'
        : used.map(function (u) { return '<b data-tone="' + (PMU.roster.tone(u) || 'calm') + '">' + esc(C.fmt(u, u < 10 && u % 1 ? 'pct1' : 'pct')) + '</b>'; }).join('');
      var what = ev.what + (ev.stale ? '' : '');
      var hover = (ev.at ? PMU.fmt.dayHead(ev.at).note + ' ' + PMU.fmt.clock(ev.at) + ' · ' : '') + (ev.windows[0] ? ev.windows[0].truth.replace(/_/g, ' ') + ' · ' + a.fresh.source + ' · ' + a.ageText : a.fresh.source) +
        (ev.windows[0] && ev.windows[0].amount ? ' · ' + ev.windows[0].amount : '');
      return '<div class="pmu-agline" data-key="' + esc(ev.key) + '" data-acct="' + esc(a.key) + '" data-prov="' + esc(ev.provider.id) + '" role="button" tabindex="0"' + C.hover(a.providerName + ' · ' + a.nickname, hover) + '>' +
        '<span class="pmu-agtime">' + esc(time) + '</span>' + PMU.mark(ev.provider.id, 18) +
        '<span class="pmu-agtext"><b>' + esc(a.nickname) + (narrow ? '' : ' <em>' + esc(a.providerName) + '</em>') + '</b><span>' + esc(what) + (ev.stale ? ' · <i class="pmu-agstale">' + esc(a.ageText) + '</i>' : '') + '</span></span>' +
        '<span class="pmu-agused">' + usedHtml + '</span></div>';
    }).join('') + '</section>';
  }
})();
