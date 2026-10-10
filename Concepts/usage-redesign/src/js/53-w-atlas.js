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
      body.innerHTML = '<div class="pmu-models">' + tools + '<div class="pmu-modelshost"></div>' + C.more(shown.length - rows.length, 'models', false, shown.slice(rows.length).map(function (m) { return m.name + ' ' + PMU.fmt.tok(m.tokens.total) + ' · ' + C.money(m.value.total); })) + '</div>' + C.foot(esc(footText), 'info');
      var host = body.querySelector('.pmu-modelshost');
      var c = C.chart(body, 'stackbar', host, { rows: rows.map(function (m) {
        return { id: m.id, name: m.name, providerId: m.providerId, vendor: m.vendor, fill: Math.max(0.004, m.value.total / maxV),
          segments: TK.map(function (t) { return { type: t[0], value: m.value[t[0]], tokens: m.tokens[t[0]] }; }),
          tokensText: PMU.fmt.tok(m.tokens.total), valueText: C.money(m.value.total), shareText: shareText(m.valueShare), attemptsText: m.attempts + ' · ' + C.plural(m.requests, 'request'),
          hover: m.role + (m.requested && m.requested !== m.effective ? ' · requested ' + m.requested + ', effective ' + m.effective : ' · requested and effective match') };
      }) }, { label: 'Estimated cost by model and token type', onRow: function (id, el) { C.modelPop(rows.filter(function (m) { return m.id === id; })[0], el); } });
      if (!c && !body._pmuDry) host.innerHTML = rows.map(function (m) { return '<div class="pmu-lrow"><span class="pmu-lname"><b>' + esc(m.name) + '</b></span><span class="pmu-lval">' + esc(C.money(m.value.total)) + '</span></div>'; }).join('');
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
      '<div class="pmu-cap">ATTEMPTS</div><p class="pmu-mpline">' + esc(C.plural(m.attempts, 'attempt') + ' · ' + C.plural(m.requests, 'request') + ' · settled ' + C.money(m.settled) + ' · plan estimate ' + C.money(m.planEstimate)) + '</p>' +
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
      /* 4 px under the body: the chart's legend rows round up (census: +2 px at 1440 in Friendly, Glass and Retro) */
      body.innerHTML = '<div class="pmu-donutw">' + tools + '<div class="pmu-donuthost" style="height:' + Math.max(120, ctx.tier.bh - (tools ? 34 : 0) - 4) + 'px"></div></div>';
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
      if (!c && !body._pmuDry) body.querySelector(".pmu-breakhost").innerHTML = rows.map(function (r) { return '<div class="pmu-lrow"><span class="pmu-lname"><b>' + esc(r.name) + '</b></span><span class="pmu-lval">' + esc(PMU.fmt.tok(r.tokens) + ' · ' + C.money(r.value)) + '</span></div>'; }).join('');
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
      /* the notes (and the explanation, the split) the card has no line for at this size: one info icon beside "Estimated
         savings" carries them (CONTENT-3: "Cache fields are explicit facts on selected attempt fixtures." was nowhere) */
      var notes = m.notes || [], unseen = [];
      if (!explOk) unseen.push('Cache reads priced at the cache-read rate instead of the input rate · PM estimate');
      if (!splitOk) unseen.push('Reads ' + PMU.fmt.tok(m.read) + ' · Writes ' + (m.write ? PMU.fmt.tok(m.write) : 'none recorded'));
      if (!costOk) unseen.push('Cache cost ' + C.money(m.cost) + ' · writes ' + C.money(m.costWrite) + ' · reads ' + C.money(m.costRead));
      notes.forEach(function (n, i) { if (!footOk || (i > 0 && !foot2)) unseen.push(n); });
      var cav = unseen.length && C.caveat ? C.caveat(unseen.join(' ')) : '';
      body.innerHTML = '<div class="pmu-eff' + (narrow ? ' is-narrow' : '') + '">' +
        '<div class="pmu-efftop"><div class="pmu-effring" style="width:' + ring + 'px;height:' + ring + 'px"></div><div class="pmu-efffacts">' +
        '<div class="pmu-effsave"><span>Estimated savings' + cav + '</span>' + C.valHtml(m.savings, 'money2', 'pmu-factv big', ctx.id + ':sv').replace('class="pmu-num"', 'class="pmu-num" data-count="1"') +
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
  /* lane d-plans (AAC's quota focus, research R3 2): the open row's focus chart can compare its main window across every
     account of its provider ("Compare weekly across Claude accounts"): one step line per account, the open account solid
     and the others dashed, never added, averaged or merged; an account without history is named "no history" in the
     legend, never drawn as 0. The open account's active spans (from the switch log) run along the plot's top edge. View
     state only, per card, like the open row. */
  var compareOn = {};
  /* when an account was the active one, from the provider's switch log: a span starts at a switch to it and ends at the
     next switch away from it, or now while it is still the active account; a span whose end the log does not show (the
     next switch leaves another account) is not drawn */
  function activeSpans(acct, now) {
    var log = PMU.roster.read().switchLog.filter(function (e) { return e.providerId === acct.providerId && e.to && (!e.outcome || e.outcome === 'switched'); })
      .sort(function (a, b) { return a.at - b.at; }), out = [];
    log.forEach(function (e, i) {
      if (e.to !== acct.id) return;
      var nx = log[i + 1];
      if (nx) { if (nx.from === acct.id) out.push({ from: e.at, to: nx.at }); }
      else if (acct.effective) out.push({ from: e.at, to: now });
    });
    return out;
  }
  function compareGroup(q, key) {
    var hit = null;
    q.groups.forEach(function (g) { g.rows.forEach(function (r) { if (r.account.key === key) hit = { g: g, r: r }; }); });
    if (!hit || !hit.r.main || hit.g.rows.length < 2) return null;
    var mk = hit.r.main.key, peers = hit.g.rows.filter(function (x) { return x.focus.some(function (f) { return f.key === mk && f.points; }); });
    return peers.length > 1 ? { g: hit.g, r: hit.r, key: mk, label: String(hit.r.main.short).toLowerCase() } : null;
  }
  /* Details of the quota history (CONTENT-3): each account's main window now and its next reset */
  C.kindReadings.qhist = function (ctx) {
    var q = ctx.model, rows = [];
    ((q && q.groups) || []).forEach(function (g) { g.rows.forEach(function (r) {
      var mw = r.main; rows.push([g.name + ' · ' + r.account.nickname, (mw ? mw.label + ' ' + (mw.pct === null ? PMU.roster.vsWord(mw) : C.fmt(mw.pct, 'pct') + ' used') : 'no main window') + (r.next ? ' · next reset ' + PMU.fmt.date(r.next.resetAt) + ' ' + PMU.fmt.clock(r.next.resetAt) : '')]);
    }); });
    ((q && q.noWindows) || []).forEach(function (x) { rows.push([x.name || String(x), 'no quota windows']); });
    return rows;
  };
  /* a live beat on the quota history (a main window moved): each shown row's used value and tone patch in place and its
     history line takes the new last point through charts' qspark.live; rows that come or go need a render (false) */
  function qhistLive(body, ctx) {
    var q = ctx.model; if (!q) return false;
    var byKey = {}; q.groups.forEach(function (g) { g.rows.forEach(function (r) { byKey[r.account.key] = r; }); });
    var rows = body.querySelectorAll('.pmu-qrow[data-value]'); if (!rows.length) return false;
    for (var i = 0; i < rows.length; i++) if (!byKey[rows[i].getAttribute('data-value')]) return false;
    Array.prototype.forEach.call(rows, function (row) {
      var r = byKey[row.getAttribute('data-value')], main = r.main, pct = main ? main.pct : null, u = row.querySelector('.pmu-qused');
      if (u && pct !== null) {
        var txt = C.fmt(pct, pct < 10 && pct % 1 ? 'pct1' : 'pct'), tone = main.tone || 'calm';
        if (u.textContent !== txt) u.textContent = txt;
        if (u.getAttribute('data-tone') !== tone) u.setAttribute('data-tone', tone);
      }
      var root = r.points ? row.querySelector('.pmu-qline [data-pmu-chart]') : null, ch = root && PMU.charts && PMU.charts.of ? PMU.charts.of(root) : null;
      if (ch) C.chartTo(ch, { runs: r.runs, ref100: true, points: r.points }, ctx);
    });
    return true;
  }
  C.kind('qhist', {
    live: function (body, ctx) { return qhistLive(body, ctx); },
    liveSig: function (ctx) {
      var q = ctx.model; if (!q) return '';
      return JSON.stringify([q.now, q.groups.map(function (g) { return g.rows.map(function (r) { return [r.account.key, r.account.effective, r.main ? r.main.key : '', r.main ? r.main.pct : null, r.points ? r.points[r.points.length - 1] : null, r.next ? r.next.resetAt : 0]; }); }), q.noWindows]);
    },
    render: function (body, ctx) {
      var q = ctx.model; if (!q || !q.groups.length) { body.innerHTML = C.empty('No provider in scope reports quota windows.'); return; }
      var bw = ctx.tier.bw, wide = bw >= 760, mid = bw >= 560;
      /* the timeline takes the middle of the row (Atlas; coordinator review 1 item 3: a third of the row was too little) */
      var tmpl = wide ? 'minmax(210px,26%) minmax(160px,1fr) 76px 110px 26px' : mid ? 'minmax(170px,36%) minmax(110px,1fr) 64px 96px 22px' : 'minmax(120px,40%) minmax(80px,1fr) 56px 20px';
      var collapsed = (C.view(ctx.id, 'collapsed', '') || '').split(',').filter(Boolean);
      var open = openRows[ctx.id] || '';
      var cmpG = open ? compareGroup(q, open) : null, cmpOn = !!(cmpG && compareOn[ctx.id]);
      var rowH = mid ? 36 : 40, headH = 36, focusH = 236 + (cmpG ? 32 : 0);
      var budget = ctx.tier.bh - 22 - (q.noWindows.length ? 34 : 0) - (open ? focusH : 0);
      var used = 0, hiddenRows = 0, out = [], rowsDrawn = [], hiddenNames = [];
      var tlW = wide ? bw * 0.66 - 230 : mid ? bw * 0.64 - 200 : bw * 0.6 - 110;
      var axis = axisTicks(q, Math.max(1, Math.ceil(7 * 34 / Math.max(60, tlW))), tlW);
      out.push('<div class="pmu-qrow pmu-qaxis" style="grid-template-columns:' + tmpl + '"><span></span><span class="pmu-qticks">' + axis.map(function (t) { return '<i style="left:' + t.x + '%"' + (t.now ? ' class="is-now"' : '') + '>' + esc(t.label) + '</i>'; }).join('') +
        '</span><span class="pmu-cap" data-align="r">USED</span>' + (mid ? '<span class="pmu-cap" data-align="r">NEXT RESET</span>' : '') + '<span></span></div>');
      q.groups.forEach(function (g) {
        var single = g.rows.length === 1, isCol = collapsed.indexOf(g.providerId) >= 0;
        if (!single) {
          if (used + headH > budget) { hiddenRows += g.rows.length; g.rows.forEach(function (r) { hiddenNames.push(g.name + ' · ' + r.account.nickname + (r.main && r.main.pct !== null ? ' ' + C.fmt(r.main.pct, 'pct') + ' used' : '')); }); return; }
          used += headH;
          out.push('<button type="button" class="pmu-qgroup" data-reveal data-pmu-act="qgroup" data-value="' + esc(g.providerId) + '" aria-expanded="' + !isCol + '" data-prov="' + esc(g.providerId) + '">' +
            '<span class="pmu-qchev' + (isCol ? ' is-col' : '') + '">' + SVG.chevronDown + '</span>' + PMU.mark(g.providerId, 20) + '<b>' + esc(g.name) + '</b><span>' + esc(g.rows.length + ' accounts · ' + g.windowLabel) + '</span></button>');
        }
        if (isCol && !single) return;
        g.rows.forEach(function (r) {
          var a = r.account, key = a.key, isOpen = open === key;
          if (used + rowH > budget) { hiddenRows += 1; hiddenNames.push(g.name + ' · ' + a.nickname + (r.main && r.main.pct !== null ? ' ' + C.fmt(r.main.pct, 'pct') + ' used' : '')); return; }
          used += rowH;
          var main = r.main, pct = main ? main.pct : null;
          var usedHtml = pct === null ? C.vs(main && main.vs === 'not_exposed' ? 'not_exposed' : 'unknown', main ? PMU.roster.vsWord(main) : 'Usage unknown')
            : '<b class="pmu-qused" data-tone="' + (main.tone || 'calm') + '">' + esc(C.fmt(pct, pct < 10 && pct % 1 ? 'pct1' : 'pct')) + '</b>';
          var nextTxt = r.next ? (r.next.truth === 'locally_inferred' ? '≈ ' : '') + PMU.fmt.until(r.next.resetAt) : 'reset unknown';
          var nextHover = (r.next ? r.next.short + ' window · ' + PMU.fmt.date(r.next.resetAt) + ' ' + PMU.fmt.clock(r.next.resetAt) + ' · ' + PMU.fmt.truth(r.next.truth) : (main ? main.short + ' window · reset unknown' : 'No upcoming reset is known')) +
            (r.soonest && r.soonest !== r.next ? ' · soonest of any window: ' + r.soonest.short + ' ' + PMU.fmt.until(r.soonest.resetAt) : '');
          /* words that repeat the provider name are left out ("OpenCode Go · OpenCode Go", "Muse Code · Muse Code") */
          var ident = single ? PMU.mark(g.providerId, 20) + '<b' + C.shareAttr('acct:' + key) + '>' + esc(g.name) + '</b>' + (a.nickname && !C.nickRepeats(a.nickname, g.name) ? '<span class="pmu-qacct">' + esc(a.nickname) + '</span>' : '') : '<b' + C.shareAttr('acct:' + key) + '>' + esc(a.nickname) + '</b>';
          /* a single-account row already carries the provider name: its plan shows from 560 px, its window word from 760 px */
          var meta = (a.effective && g.rows.length > 1 ? '<em class="pmu-qactive">Active</em>' : '') + (a.plan && !(single && (a.plan === g.name || !mid)) ? '<span class="pmu-qplan">' + esc(a.plan) + '</span>' : '') +
            (main && single && wide ? '<span class="pmu-qplan">' + esc(main.short.toLowerCase()) + '</span>' : '');
          out.push('<div class="pmu-qrow pmu-row' + (single ? ' is-single' : '') + (isOpen ? ' is-open' : '') + '" data-reveal data-flash-key="' + esc(key) + '" data-flash-sig="' + esc(String(pct) + '|' + a.effective) + '" data-prov="' + esc(g.providerId) + '" data-pmu-act="qrow" data-value="' + esc(key) + '" role="button" tabindex="0" aria-expanded="' + isOpen + '" style="grid-template-columns:' + tmpl + '"' +
            C.hover(a.nickname, a.identity) + '><span class="pmu-qident">' + ident + meta + '</span><span class="pmu-qline" data-key="' + esc(key) + '"' + (main ? C.shareAttr('win:' + key + '/' + main.key) : '') + '></span><span class="pmu-qusedcell" data-align="r"' + (main ? ' data-share-v="win:' + esc(key + '/' + main.key) + '"' : '') + '>' + usedHtml +
            (mid ? '' : '<em>' + esc(nextTxt) + '</em>') + '</span>' + (mid ? '<span class="pmu-qnext" data-align="r"' + C.hover('Next reset', nextHover) + '>' + esc(nextTxt) + '</span>' : '') +
            '<span class="pmu-qchev pmu-qrowchev' + (isOpen ? ' is-open' : '') + '">' + SVG.chevronDown + '</span></div>');
          rowsDrawn.push(r);
          if (isOpen) out.push('<div class="pmu-qfocus" data-key="' + esc(key) + '">' + (cmpG ? '<div class="pmu-qfocustools">' + C.switchBtn('qcompare', cmpOn, 'Compare ' + cmpG.label + ' across ' + cmpG.g.name + ' accounts',
            'One line per account, never added or averaged; the open account is the solid line and its active time runs along the top') + '</div>' : '') + '<div class="pmu-qfocushost"></div></div>');
        });
      });
      if (hiddenRows) out.push(C.more(hiddenRows, hiddenRows === 1 ? 'account' : 'accounts', false, hiddenNames));
      body.innerHTML = '<div class="pmu-qhist">' + out.join('') + '</div>' + (q.noWindows.length ? C.foot(esc(listWords(q.noWindows) + (q.noWindows.length > 1 ? ' expose' : ' exposes') + ' no quota windows.'), 'info') : '');
      var drawRow = function (r) {
        var host = body.querySelector('.pmu-qline[data-key="' + r.account.key + '"]');
        if (!host) return;
        if (!r.points) { host.innerHTML = '<span class="pmu-qnone">' + esc(r.main && r.main.pct === null ? '' : 'no history yet') + '</span>'; return; }
        /* the row's runs turn warn and crit at its account's own levels (item 2), never the shared ones */
        C.chart(body, 'qspark', host, { runs: r.runs, ref100: true, points: r.points, toneOf: function (v) { return PMU.roster.tone(v, r.account.providerId, r.account.id); } }, { label: r.account.nickname + ' ' + (r.main ? r.main.short : '') + ' history, 7 days' });
      };
      /* NOTES3-perf C4: the body was one 50-110 ms task on the VM (cold), most of it the rows' history lines. The first six
         lines are drawn with the body; the rest follow in frames of at most about 5 ms each (rows keep their place, so
         nothing moves); a newer render of the body stops the old queue */
      var FIRST = 0, tok = body._pmuQhTok = {};   /* 0: the body alone is 13 ms on the VM, each line about 3-5 ms */
      if (body._pmuDry || rowsDrawn.length <= FIRST) rowsDrawn.forEach(drawRow);
      else {
        rowsDrawn.slice(0, FIRST).forEach(drawRow);
        var rest = rowsDrawn.slice(FIRST);
        var next = function () {
          if (body._pmuQhTok !== tok || !body.isConnected) return;
          var t0 = performance.now();
          while (rest.length && performance.now() - t0 < 5) drawRow(rest.shift());
          if (PMU.charts && PMU.charts.flush) PMU.charts.flush();
          if (rest.length) requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      }
      if (open) {
        var r = rowsDrawn.filter(function (x) { return x.account.key === open; })[0], fh = body.querySelector('.pmu-qfocushost');
        if (r && fh) {
          /* the account's own provider policy (item 2: AAC draws the provider's own threshold line on the focus chart): the
             account's resolved policy, else thresholds(providerId, accountId) (shared levels without a provider) */
          var th = r.account.policy || PMU.roster.thresholds(r.account.providerId, r.account.id);
          var bands = activeSpans(r.account, q.now).map(function (sp) { return { from: sp.from, to: sp.to, label: 'active' }; });
          var wins = cmpOn ? [r].concat(cmpG.g.rows.filter(function (x) { return x !== r; })).map(function (x, i) {
            var f = x.focus.filter(function (ff) { return ff.key === cmpG.key; })[0], pts = x.main && x.main.key === cmpG.key && x.points ? x.points : f && f.points;
            return { label: x.account.nickname + (x.account.effective ? ' (active)' : '') + (pts ? '' : ' · no history'), dash: ['', '9 4', '9 3 2 3', '2 3'][i % 4], points: pts || [] };
          }) : r.focus.filter(function (f) { return f.points; }).map(function (f, i) { return { label: f.label, dash: ['', '9 4', '9 3 2 3'][i % 3], points: f.points }; });
          body._pmuFocusChart = C.chart(body, 'qspark', fh, { windows: wins, bands: bands,
            thresholds: { warn: 100 - th.warnLeft, switch: 100 - th.switchLeft }, resets: cmpOn ? [r.main && r.main.resetAt].filter(Boolean) : r.focus.map(function (f) { return f.resetAt; }).filter(Boolean), now: q.now, bucketMs: q.bucketMs, n: q.points },
            { label: cmpOn ? cmpG.g.name + ' accounts, ' + cmpG.label + ' window, 7 days' : r.account.nickname + ', every window, 7 days', readout: true });
        }
      }
    }
  });
  function listWords(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  C.listWords = listWords;
  function axisTicks(q, every, tlW) {
    var n = q.points, span = n * q.bucketMs, start = q.now - span, out = [], d = new Date(start), k = 0; d.setHours(0, 0, 0, 0); d = d.getTime() + 86400000;
    /* a day tick closer than 48 px to NOW is dropped (LOOK-REVIEW-2 7: "NOW" printed over "FRI") */
    var last = q.now - Math.max((every > 1 ? 12 : 3) * 3600000, tlW ? 48 / Math.max(60, tlW) * span : 0);
    for (; d < last; d += 86400000, k++) if (k % (every || 1) === 0) out.push({ x: (100 * (d - start) / span).toFixed(2), label: PMU.fmt.day(d) });
    out.push({ x: 100, label: 'Now', now: true });
    return out;
  }
  C.act('qgroup', function (el, id) {
    var cur = (C.view(id, 'collapsed', '') || '').split(',').filter(Boolean), v = el.getAttribute('data-value');
    C.setView(id, { collapsed: (cur.indexOf(v) >= 0 ? cur.filter(function (x) { return x !== v; }) : cur.concat([v])).join(',') });
  });
  /* opening a row grows it to its focus chart (WOW-SPEC 3.10): the rows below slide to their new places (FLIP 250
     SLIDE), the focus opens top-down and its chart draws with its comet */
  C.act('qcompare', function (el, id) {
    compareOn[id] = !compareOn[id];
    viewAction('view.usage.quota_compare_toggled', { widget_id: id, account: openRows[id] || '', compare: !!compareOn[id] });
    var card = PMU.board.card(id); if (!card) return;
    PMU.cards.updateAll([card], 'config');
    var body = card.querySelector('.pmu-cardbody');
    if (body && body._pmuFocusChart && body._pmuFocusChart.enter) { try { body._pmuFocusChart.enter(0); } catch (error) {} }
  });
  C.act('qrow', function (el, id) {
    var v = el.getAttribute('data-value');
    openRows[id] = openRows[id] === v ? '' : v;
    viewAction('view.usage.quota_row_toggled', { widget_id: id, account: v, open: !!openRows[id] });
    var card = PMU.board.card(id); if (!card) return;
    var before = {};
    Array.prototype.forEach.call(card.querySelectorAll('.pmu-qhist > [data-value], .pmu-qhist > .pmu-qgroup'), function (r) { before[r.getAttribute('data-value') + '|' + r.className.split(' ')[0]] = r.getBoundingClientRect().top; });
    PMU.cards.updateAll([card], 'config');
    var reduced = PMU.motion.reduced && PMU.motion.reduced();
    if (!reduced) Array.prototype.forEach.call(card.querySelectorAll('.pmu-qhist > [data-value], .pmu-qhist > .pmu-qgroup'), function (r) {
      var k = r.getAttribute('data-value') + '|' + r.className.split(' ')[0], top0 = before[k]; if (top0 == null) return;
      var dy = top0 - r.getBoundingClientRect().top;
      if (Math.abs(dy) > 0.5) PMU.motion.animate(r, [{ transform: 'translateY(' + dy.toFixed(1) + 'px)' }, { transform: 'none' }], { dur: 250, easing: 'cubic-bezier(.22,1,.36,1)' });
    });
    var focus = card.querySelector('.pmu-qfocus');
    if (focus && PMU.motion.clipReveal) PMU.motion.clipReveal(focus, { dur: 250, dir: 'y' });
    var body = card.querySelector('.pmu-cardbody');
    if (focus && body && body._pmuFocusChart && body._pmuFocusChart.enter) { try { body._pmuFocusChart.enter(120); } catch (error) {} }
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
    liveSig: function (ctx) {
      var ag = PMU.data.agenda(C.cfg(ctx.id, 'horizon', ctx.def.horizon || '7d')), ev = function (e) { return [e.key, e.used, e.stale]; };
      return JSON.stringify([ag.passed.map(ev), ag.days.map(function (d) { return d.events.map(ev); }), ag.unknown.map(ev), ag.beyond]);
    },
    live: function (body, ctx) { return agendaLive(body, ctx); },
    /* one column only: a wider budget lets every column run long and the fit pass then trims the last column first */
    grow: function (body) { return (body._pmuAgCols || 1) === 1; },
    render: function (body, ctx) {
      var hz = C.cfg(ctx.id, 'horizon', ctx.def.horizon || '7d');
      var ag = PMU.data.agenda(hz);
      var groups = [];
      if (ag.passed.length) groups.push({ label: 'Passed', note: 'pending recheck', events: ag.passed, passed: true });
      ag.days.forEach(function (d) { groups.push(d); });
      if (ag.unknown.length) groups.push({ label: 'Reset unknown', note: '', events: ag.unknown, unknown: true });
      if (!groups.length) { body.innerHTML = C.empty('Nothing resets or expires in the ' + ({ '24h': 'next 24 hours', '7d': 'next 7 days', '30d': 'next 30 days' }[hz]) + '.'); return; }
      /* explicit columns, filled in reading order by each line's own wrapped height (LOOK-REVIEW-2 10: CSS columns laid
         days out in a hidden fourth column and printed "continued" under its own day). Two columns from 520 px, three from
         900; a day that runs into the next column carries its head there ("continued", only at a column top); the foot line
         counts what was actually laid out. */
      var bw = ctx.tier.bw, colsN = bw >= 900 ? 3 : bw >= 520 ? 2 : 1, GAP = 28;
      var colW = (bw - GAP * (colsN - 1)) / colsN, narrow = colW < 300;
      var minLine = narrow ? 48 : 42, headH = 32;
      /* the text column: the line's grid (time 46 / 52 px, mark 18, the used column as wide as its widest value) */
      var usedW = 0; groups.forEach(function (g) { g.events.forEach(function (ev) { var u = ev.used.filter(function (x) { return x !== null && x !== undefined; }); usedW = Math.max(usedW, PMU.charts && PMU.charts.textW ? PMU.charts.textW(u.length ? C.fmt(u[0], 'pct') : '', 12.5, false, 600) : 30); }); });
      /* a few px of tolerance: the estimate leans long, and the fit pass still removes a line that does not fit */
      var textW = colW - (narrow ? 46 : 52) - 18 - Math.ceil(usedW) - 3 * (narrow ? 8 : 10) + 4;
      var lineHOf = function (ev) {
        var a = ev.account;
        var bl = C.wrapLines(C.nickRepeats(a.nickname, a.providerName) ? a.providerName : a.nickname + (narrow ? '' : '  ' + a.providerName), textW, 13, 540), sl = C.wrapLines(ev.what + (ev.stale ? ' · ' + a.ageText : ''), textW, 12.5);
        return Math.max(minLine, Math.ceil(9 + 17.6 * bl + 17 * sl)) + 1;
      };
      var total = 0; groups.forEach(function (g) { total += headH; g.events.forEach(function (ev) { total += lineHOf(ev); }); });
      var footNeed = ag.beyond || total > (ctx.tier.bh - 4) * colsN;
      var capacity = ctx.tier.bh - (footNeed ? 24 : 2), cols = [[]], used = [0], col = 0, hidden = 0, done = false, laid = 0, hiddenEv = [];
      groups.forEach(function (g) {
        if (done) { hidden += g.events.length; hiddenEv = hiddenEv.concat(g.events); return; }
        if (used[col] + headH + lineHOf(g.events[0]) > capacity) {
          if (col + 1 < colsN && used[col] > 0) { col += 1; cols.push([]); used.push(0); } else { done = true; hidden += g.events.length; hiddenEv = hiddenEv.concat(g.events); return; }
        }
        used[col] += headH;
        var lines = [], cont = false;
        g.events.forEach(function (ev) {
          if (done) { hidden += 1; hiddenEv.push(ev); return; }
          var lh = lineHOf(ev);
          if (used[col] + lh > capacity && lines.length && col + 1 < colsN) {
            cols[col].push(groupHtml(cont ? Object.assign({}, g, { note: 'continued' }) : g, lines, narrow));
            lines = []; cont = true; col += 1; cols.push([]); used.push(headH);
          }
          if (used[col] + lh > capacity) { done = true; hidden += 1; hiddenEv.push(ev); return; }
          used[col] += lh; lines.push(ev); laid += 1;
        });
        if (lines.length) cols[col].push(groupHtml(cont ? Object.assign({}, g, { note: 'continued' }) : g, lines, narrow));
      });
      var parts = [];
      if (hidden) parts.push(hidden + ' more ' + (C.atMax(body) ? 'in Details' : 'at a taller size'));
      if (ag.beyond) parts.push(ag.beyond + (hidden ? ' after ' : ' more after ') + PMU.fmt.date(PMU.clock.now() + ({ '24h': 1, '7d': 7, '30d': 30 }[hz]) * 86400000));
      /* one whole line: the "after" part gives way when both do not fit (Retro: "4 more at a taller size · 15 af...");
         its count stays in the line's hover tag */
      if (parts.length > 1 && C.wrapLines(parts.join(' · ') + ' 0', ctx.tier.bw, 12) > 1) parts.pop();
      /* the line is also the card's "N more" line, so a line the fit pass removes is counted in it */
      /* the hover tag lists the lines this card has no room for, then the ones after its horizon (CONTENT-3) */
      var evText = function (e) { return (C.nickRepeats(e.account.nickname, e.account.providerName) ? e.account.providerName : e.account.providerName + ' · ' + e.account.nickname) + ' ' + e.what + ' ' + (e.at ? PMU.fmt.date(e.at) + ' ' + PMU.fmt.clock(e.at) : 'reset unknown'); };
      var agFold = hiddenEv.map(evText).concat(ag.beyond ? ag.beyondList.slice(0, 12).map(function (e) { return 'after the horizon: ' + evText(e); }) : []);
      var beyond = parts.length ? '<p class="pmu-agbeyond' + (hidden ? ' pmu-more' : '') + '"' + (agFold.length ? C.hover(hidden ? C.FOLD_LABEL : ag.beyond + ' more after this horizon', agFold.join('; ')) : '') + '>' +
        esc(parts.join(' · ')) + '</p>' : '';
      body.innerHTML = '<div class="pmu-agenda is-cols" style="grid-template-columns:repeat(' + colsN + ',minmax(0,1fr))">' + cols.map(function (c) { return '<div class="pmu-agcol">' + c.join('') + '</div>'; }).join('') + '</div>' + beyond;
      body._pmuAgenda = { hidden: hidden, beyond: ag.beyond, hz: hz, passed: ag.passed.length, unknown: ag.unknown.length }; body._pmuAgCols = colsN;
      body.querySelector('.pmu-agenda').addEventListener('click', function (event) {
        var row = event.target.closest('[data-key]'); if (!row) return;
        var acct = PMU.roster.account(row.getAttribute('data-acct')); if (acct && PMU.accounts) PMU.accounts.inspect(acct.key, row);
      });
    }
  });
  /* Details of a resets card: every line of its horizon, then the ones after it (CONTENT-3) */
  C.kindReadings.agenda = function (ctx, def) {
    var ag = PMU.data.agenda(C.cfg(ctx.id, 'horizon', def.horizon || '7d')), rows = [];
    var line = function (e, k) { rows.push([k || (e.at ? PMU.fmt.date(e.at) + ' ' + PMU.fmt.clock(e.at) : 'Reset unknown'), e.account.providerName + ' · ' + e.account.nickname + ' · ' + e.what +
      (e.used && e.used.filter(function (u) { return u != null; }).length ? ' · ' + e.used.filter(function (u) { return u != null; }).map(function (u) { return C.fmt(u, 'pct'); }).join(' / ') + ' used' : '')]); };
    ag.passed.forEach(function (e) { line(e, 'Passed · pending recheck'); });
    ag.days.forEach(function (d) { d.events.forEach(function (e) { line(e); }); });
    ag.unknown.forEach(function (e) { line(e, 'Reset unknown'); });
    (ag.beyondList || []).forEach(function (e) { line(e, 'After the horizon · ' + PMU.fmt.date(e.at)); });
    return rows;
  };
  function agUsedHtml(ev) {
    var used = ev.used.filter(function (u) { return u !== null && u !== undefined; });
    /* item 2: the tone uses this account's own warn and switch levels, not the shared ones */
    var ac = ev.account || null, tone = function (u) { return ac ? PMU.roster.tone(u, ac.providerId, ac.id) : PMU.roster.tone(u); };
    return used.length > 1 && used.every(function (u) { return u === used[0]; }) ? '<b data-tone="' + (tone(used[0]) || 'calm') + '">' + esc(C.fmt(used[0], 'pct')) + '</b><em>both</em>'
      : used.map(function (u) { return '<b data-tone="' + (tone(u) || 'calm') + '">' + esc(C.fmt(u, u < 10 && u % 1 ? 'pct1' : 'pct')) + '</b>'; }).join('');
  }
  /* a live beat (a window reading moved): the lines keep their place; each shown line's used % patches in place. Lines that
     come or go (a reset passing) are a new structure: false (the wrapper defers an idle re-render) */
  function agendaLive(body, ctx) {
    var ag = PMU.data.agenda(C.cfg(ctx.id, 'horizon', ctx.def.horizon || '7d')), byKey = {}, order = [];
    var add = function (e) { byKey[e.key] = e; order.push(e.key); };
    ag.passed.forEach(add); ag.days.forEach(function (d) { d.events.forEach(add); }); ag.unknown.forEach(add);
    var lines = body.querySelectorAll('.pmu-agline'); if (!lines.length || !body._pmuAgenda || body._pmuAgenda.passed !== ag.passed.length || body._pmuAgenda.unknown !== ag.unknown.length) return false;
    /* the shown lines must still read in the agenda's order (the fit pass may have removed some; a reset that passed moves
       its line to "Passed": a new structure) */
    for (var i = 0, j = 0; i < lines.length; i++, j++) { var k = lines[i].getAttribute('data-key'); while (j < order.length && order[j] !== k) j++; if (j >= order.length) return false; }
    Array.prototype.forEach.call(lines, function (ln) {
      var u = ln.querySelector('.pmu-agused'), h = agUsedHtml(byKey[ln.getAttribute('data-key')]);
      if (u && u.innerHTML !== h) C.setHtml(u, h);
    });
    /* integ3: a day head's relative note ("in 2d 5h") follows the clock (the demo hour moves it as plain text) */
    Array.prototype.forEach.call(body.querySelectorAll('.pmu-agday'), function (sec) {
      var ln = sec.querySelector('.pmu-agline'), ev = ln && byKey[ln.getAttribute('data-key')], sp = sec.querySelector('header > span'), lb = sec.querySelector('header > b');
      if (!ev || !ev.at || !sp || /continued/i.test(sp.textContent)) return;
      var hd = PMU.fmt.dayHead(ev.at), note = hd.note || '';
      if (/^in \d/.test(sp.textContent) && /^in \d/.test(note) && sp.textContent !== note) sp.textContent = note;
      /* the demo clock can pass midnight: "Tomorrow" becomes "Today" */
      if (lb && /^(Today|Tomorrow|Yesterday)$/.test(lb.textContent) && /^(Today|Tomorrow|Yesterday)$/.test(hd.label || '') && lb.textContent !== hd.label) lb.textContent = hd.label;
    });
    return true;
  }
  function groupHtml(g, lines, narrow) {
    return '<section class="pmu-agday" data-reveal><header><b>' + esc(g.label) + '</b><span>' + esc(g.note || '') + '</span></header>' + lines.map(function (ev) {
      var a = ev.account, time = ev.at ? (ev.inferred ? '≈ ' : '') + PMU.fmt.clock(ev.at) : '-';
      var usedHtml = agUsedHtml(ev);
      var what = ev.what + (ev.stale ? '' : '');
      var hover = (ev.at ? PMU.fmt.dayHead(ev.at).note + ' ' + PMU.fmt.clock(ev.at) + ' · ' : '') + (ev.windows[0] ? PMU.fmt.truth(ev.windows[0].truth) + ' · ' + a.fresh.source + ' · ' + a.ageText : a.fresh.source) +
        (ev.windows[0] && ev.windows[0].amount ? ' · ' + ev.windows[0].amount : '');
      return '<div class="pmu-agline" data-key="' + esc(ev.key) + '"' + C.shareAttr('reset:' + ev.key) + ' data-acct="' + esc(a.key) + '" data-prov="' + esc(ev.provider.id) + '" role="button" tabindex="0"' + C.hover(a.providerName + ' · ' + a.nickname, hover) + '>' +
        '<span class="pmu-agtime">' + esc(time) + '</span>' + PMU.mark(ev.provider.id, 18) +
        '<span class="pmu-agtext"><b' + C.shareAttr('acct:' + a.key) + '>' + (C.nickRepeats(a.nickname, a.providerName) ? esc(a.providerName) : esc(a.nickname) + (narrow ? '' : ' <em>' + esc(a.providerName) + '</em>')) + '</b><span>' + esc(what) + (ev.stale ? ' · <i class="pmu-agstale">' + esc(a.ageText) + '</i>' : '') + '</span></span>' +
        '<span class="pmu-agused">' + usedHtml + '</span></div>';
    }).join('') + '</section>';
  }
})();
