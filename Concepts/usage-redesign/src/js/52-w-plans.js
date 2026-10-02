/* Plan, alert, free-model and prompt-cache kinds (owner: content; DESIGN-SPEC 4 and 15, DESIGN-SPEC-ATLAS 6 and 11):
   limit (plan cards), alert (attention cards), free (free-model cards), cache (prompt-cache cards).
   Blocks are stacked in priority order and a block that does not fit is hidden whole (complete-or-hidden). */
(function () {
  var C = PMU.content;

  /* stack blocks [{h, html, need?}] into a height budget; returns the html of the blocks that fit (in order) */
  function stack(blocks, budget) {
    var used = 0, out = [], hidden = [];
    blocks.forEach(function (b) {
      if (!b || !b.html) return;
      if (used + b.h <= budget || b.always) { used += b.h; out.push(b.html); } else hidden.push(b);
    });
    return { html: out.join(''), hidden: hidden, used: used };
  }
  C.stack = stack;

  /* one meter spec for a WindowView (A1 6) */
  C.meterSpec = function (w, opts) {
    opts = opts || {};
    var th = PMU.roster.thresholds();
    var rl = PMU.fmt.resetLine(w);
    return { label: opts.label || w.short, pct: w.pct, vs: w.pct === null ? (w.vs === 'ok' ? 'unknown' : w.vs) : undefined, vsWord: w.pct === null ? PMU.roster.vsWord(w) : undefined,
      tone: w.tone, size: opts.size || 'c', window: w.key, binding: !!w.binding, estimated: !!w.est, dimmed: !!opts.stale, stale: !!opts.stale,
      notch: w.governed && w.pct !== null ? { at: 100 - th.switchLeft, faint: !opts.effective, off: !th.auto } : null,
      resetText: w.pct === null ? '' : rl.text, resetSoon: rl.soon, amount: opts.noAmount ? '' : (w.amount || (w.note && w.pct !== null ? w.note : '')), prov: opts.prov,
      source: (w.truth ? w.truth.replace(/_/g, ' ') + (opts.age ? ' · ' + opts.age : '') : '') + (w.pacePts !== null && w.pacePts !== undefined ? ' · ' + (w.pacePts > 0 ? '+' : '') + w.pacePts + ' pts vs pace' : ''), thresholds: { warn: 100 - th.warnLeft, switch: 100 - th.switchLeft },
      hover: { label: (opts.hoverName ? opts.hoverName + ' · ' : '') + w.label } };
  };
  var METER_H = { c: 58, i: 58, k: 50 };

  /* ================================================================== limit: provider plan cards */
  /* model: planView + {facts, pace, foot, plan, requests, tokens} (defined in 70-rooms-a.js) */
  C.kind('limit', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('This provider is not in the selected scope.'); return; }
      var size = ctx.tier.bw >= 220 ? 'i' : 'k', mh = METER_H[size] + 8;
      var wins = m.windows || [];
      var xl = ctx.tier.w === 'xl' && C.h(ctx, 'h3');
      var bh = ctx.tier.bh, footH = m.foot ? 34 : 0;
      if (ctx.tier.h === 'h0') {
        var b = m.binding || wins[0];
        body.innerHTML = '<div class="pmu-limit is-h0"><span class="pmu-limitinline">' + (b ? esc(b.short) + ' <b>' + esc(b.pct === null ? PMU.roster.vsWord(b) : C.fmt(b.pct, 'pct')) + '</b>' + (b.pct === null ? '' : ' used · ' + esc(PMU.fmt.resetLine(b).text)) : esc('No plan windows')) + '</span></div>';
        return;
      }
      if (wins.length * mh + footH > bh + 2) footH = 0;   /* every window stays visible before the foot does (R-PLAN-01) */
      var meterRoom = Math.max(1, C.fit(bh - footH, mh));
      var shownWins = wins.slice(0, meterRoom), hiddenWins = wins.length - shownWins.length;
      var meters = '<div class="pmu-limitmeters">' + shownWins.map(function (w, i) { return '<div class="pmu-limitmeter" data-i="' + i + '"></div>'; }).join('') +
        (hiddenWins ? '<div class="pmu-more">' + esc(hiddenWins + ' more ' + (hiddenWins === 1 ? 'window' : 'windows') + ' at a larger size') + '</div>' : '') +
        (!wins.length ? '<div class="pmu-limitnone">' + C.vs('not_exposed', 'Quota not exposed') + '</div>' : '') + '</div>';
      var used = shownWins.length * mh + (hiddenWins ? 24 : 0) + (wins.length ? 0 : 30);
      var lines = (m.amounts || []).map(function (a) {
        var nar = ctx.tier.bw < 260, label = nar && /^Spend/.test(a.label) ? 'Spend' : a.label, vsA = a.vs && a.vs !== 'ok';
        return { h: 32, html: '<div class="pmu-amount pmu-amt"' + C.hover(a.label + (a.value ? ' ' + a.value : ''), [a.suffix, a.word, a.hover].filter(Boolean).join(' · ')) + '>' + (vsA ? '<span></span>' : C.glyph(a.glyph || 'info')) + '<span>' + esc(label) + '</span>' +
          (vsA ? '<span class="pmu-amtv">' + C.vs(a.vs, a.word) + '</span>' : '<b>' + esc(a.value) + (a.suffix && !nar ? ' <em>' + esc(a.suffix) + '</em>' : '') + '</b>') + '</div>' };
      });
      var planLine = { h: 24, html: '<div class="pmu-limitplan"><b>' + esc(m.plan) + '</b>' + (m.requests != null ? ' · ' + esc(PMU.fmt.num(m.requests)) + ' requests' : '') + (m.tokens != null ? ' · ' + esc(PMU.fmt.tok(m.tokens)) + ' tokens' : '') + '</div>' };
      var facts = (m.facts || []).map(function (f) { return { h: 27, html: C.facts([f]) }; });
      var side = '';
      if (xl) {
        var right = stack([planLine].concat(lines).concat(facts), bh - footH);
        side = '<div class="pmu-limitside">' + right.html + '</div>';
        body.innerHTML = '<div class="pmu-limit is-xl"><div class="pmu-limitmain">' + meters + '</div>' + side + '</div>' + (m.foot && footH ? C.foot(m.foot, m.footGlyph) : '');
      } else {
        var rest = stack([planLine].concat(lines).concat(C.h(ctx, 'h3') || C.w(ctx, 'm') ? facts : []), bh - footH - used - 4);
        body.innerHTML = '<div class="pmu-limit">' + meters + rest.html + '</div>' + (m.foot && footH ? C.foot(m.foot, m.footGlyph) : '');
      }
      shownWins.forEach(function (w, i) {
        C.chart(body, 'meter', body.querySelector('.pmu-limitmeter[data-i="' + i + '"]'), C.meterSpec(w, { size: w.pct === null ? 'k' : size, effective: true, prov: m.settingsId, stale: m.account && m.account.fresh.stale, age: m.account ? m.account.ageText : '', hoverName: m.name }),
          { label: m.name + ' ' + w.label });
      });
    }
  });

  /* ================================================================== alert: attention cards */
  /* model: {sev: 'warn'|'ok', sevWord, detail, score, threshold, owner, observed, disposition, scope, receipt, prov, actions: [...]} */
  C.kind('alert', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('This alert is not in the selected scope.', 'Scope filters alerts by provider'); return; }
      var bh = ctx.tier.bh, narrow = ctx.tier.bw < 300;
      var top = '<div class="pmu-alerttop" data-tone="' + (m.sev === 'ok' ? 'good' : 'warn') + '">' + C.glyph(m.sev === 'ok' ? 'checkCircle' : 'alert') + '<b>' + esc(m.sevWord) + '</b><span>' + esc(m.when) + '</span></div>' +
        '<p class="pmu-alertdetail">' + esc(m.detail) + '</p>';
      /* the detail's lines from its measured width in the theme's face (Retro's mono runs wider), plus a word-wrap margin */
      var tw = PMU.charts && PMU.charts.textW ? PMU.charts.textW(m.detail, 13) * 1.1 : m.detail.length * 6.6;
      var detailH = 26 + Math.ceil(tw / Math.max(120, ctx.tier.bw)) * 19;
      var meter = { h: 64, html: '<div class="pmu-alertmeter"></div>' };
      var facts = [['Owner', m.owner], ['Observed', m.observed], ['Disposition', m.disposition], ['Scope', m.scope], ['Threshold', m.threshold], ['Receipt', m.receipt]];
      var actions = { h: narrow ? 68 : 38, html: '<div class="pmu-alertacts">' + m.actions.map(function (a) {
        return '<button type="button" class="pmu-textbtn' + (a.primary ? ' is-primary' : '') + '"' + (a.act ? ' data-pmu-act="' + esc(a.act) + '" data-value="' + esc(a.value || '') + '"' : '') +
          (a.demo ? ' data-demo-action="' + esc(a.demo) + '" data-demo-arg="' + esc(a.arg || '') + '"' : '') + (a.disabled ? ' disabled' : '') + C.hover(a.label, a.hover || '') + '>' + esc(a.label) + '</button>';
      }).join('') + '</div>' };
      var blocks = [meter, actions].concat(facts.map(function (f) { return { h: 27, html: C.facts([f]) }; }));
      var footOk = m.foot && C.h(ctx, 'h3');
      var rest = stack(blocks, bh - detailH - (footOk ? 34 : 0));
      body.innerHTML = '<div class="pmu-alert">' + top + rest.html + '</div>' + (footOk ? C.foot(esc(m.foot), m.sev === 'ok' ? 'checkCircle' : 'info') : '');
      var host = body.querySelector('.pmu-alertmeter');
      if (host) C.chart(body, 'meter', host, { label: 'Current pressure', pct: m.score, suffix: 'pressure score', noPct: true, tone: m.score >= m.raise ? 'warn' : 'calm', size: 'k', notch: { at: m.raise, faint: false, off: false },
        resetText: 'baseline ' + m.baseline + ' · raise at ' + m.raise, hover: { label: 'Pressure score', detail: m.score + ' of 100 · raises an alert at ' + m.raise + ' · 24-hour norm ' + m.baseline } }, { label: 'Current pressure ' + m.score });
    }
  });

  /* ================================================================== free: free-model cards */
  /* model: {state, stateTone, provider, price, context, capacity, capacitySource, availability: {pct, tone, label}, facts: [[...]]} */
  C.kind('free', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('No free route in scope'); return; }
      var head = '<div class="pmu-freetop"><span class="pmu-freestate" data-tone="' + m.stateTone + '">' + C.glyph(m.stateGlyph) + esc(m.state) + '</span><span class="pmu-freeprov">' + esc(m.provider) + '</span></div>';
      var blocks = [
        { h: 30, html: '<div class="pmu-freeprice"><b>' + esc(m.price) + '</b><span>' + esc(m.priceSource) + '</span></div>' },
        { h: 27, html: C.facts([['Context window', m.context]]) },
        { h: 27, html: C.facts([['Capacity', m.capacity, { hover: m.capacitySource }]]) }
      ].concat((m.facts || []).map(function (f) { return { h: 27, html: C.facts([f]) }; }));
      var rest = C.h(ctx, 'h2') ? stack(blocks, ctx.tier.bh - 46) : { html: '' };
      body.innerHTML = '<div class="pmu-free">' + head + rest.html + '</div>';
    }
  });

  /* ================================================================== cache: prompt-cache cards (A1 11: the efficiency look in small) */
  /* model: {share, shareVs?, read, write, writeVs?, savings, est, reporting, reportingVs, authority, age, prov} */
  C.kind('cache', {
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('This provider is not in the selected scope.'); return; }
      var ringPx = ctx.tier.bw >= 200 && C.h(ctx, 'h2') ? 64 : 0;
      var top = '<div class="pmu-cachetop">' + (ringPx ? '<div class="pmu-cachering" style="width:' + ringPx + 'px;height:' + ringPx + 'px"></div>' : '') +
        '<div class="pmu-cachehead">' + C.valHtml(m.share, 'pct1', 'pmu-kpivalue', ctx.id + ':s').replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"') + '<span class="pmu-cacheword">read share' + (m.est ? ' · est.' : '') + '</span>' +
        '<span class="pmu-cacherep">' + (m.reportingVs ? C.vs(m.reportingVs, m.reporting) : esc(m.reporting)) + '</span></div></div>';
      var blocks = [
        { h: 40, html: '<div class="pmu-cachesplit"></div>' },
        { h: 27, html: C.facts([['Savings', C.money(m.savings) + ' est.', { tone: 'good' }]]) },
        { h: 27, html: C.facts([['Read', m.read]]) },
        { h: 27, html: C.facts([['Write', m.write, m.writeVs ? { vs: m.writeVs, word: m.write } : {}]]) },
        { h: 27, html: C.facts([['Authority', m.authority]]) },
        { h: 27, html: C.facts([['Age', m.age]]) }
      ];
      var rest = C.h(ctx, 'h2') ? stack(blocks, ctx.tier.bh - Math.max(ringPx, 54) - 6) : { html: '' };
      body.innerHTML = '<div class="pmu-cache">' + top + rest.html + '</div>';
      if (ringPx) C.chart(body, 'ring', body.querySelector('.pmu-cachering'), { value: m.share, max: 100, centre: '', caption: '', token: 'cr' }, { label: 'Read share ' + m.share + '%' });
      var sp = body.querySelector('.pmu-cachesplit');
      if (sp) C.chart(body, 'split', sp, { parts: [{ name: 'Reads', value: m.readN, token: 'cr' }, { name: 'Writes', value: m.writeN || 0, token: 'cw', vs: m.writeVs }] }, { label: 'Cache reads versus writes' });
    }
  });
})();
