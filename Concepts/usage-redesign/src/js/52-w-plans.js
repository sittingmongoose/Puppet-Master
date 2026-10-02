/* Plan, alert, free-model and prompt-cache kinds (owner: content; DESIGN-SPEC 4 and 15, DESIGN-SPEC-ATLAS 6 and 11):
   limit (plan cards), alert (attention cards), free (free-model cards), cache (prompt-cache cards).
   Blocks are stacked in priority order and a block that does not fit is hidden whole (complete-or-hidden). */
(function () {
  var C = PMU.content;

  /* stack blocks [{h, html, need?}] into a height budget; returns the html of the blocks that fit (in order) */
  /* stack blocks into a height budget; prefix: stop at the first block that does not fit (the order is the priority, so a
     plan line is never dropped while a later fact squeezes in) */
  function stack(blocks, budget, prefix) {
    var used = 0, out = [], hidden = [], stopped = false;
    blocks.forEach(function (b) {
      if (!b || !b.html) return;
      if (!stopped && (used + b.h <= budget || b.always)) { used += b.h; out.push(b.html); } else { hidden.push(b); if (prefix && !b.always) stopped = true; }
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
      source: (w.truth ? PMU.fmt.truth(w.truth) + (opts.age ? ' · ' + opts.age : '') : '') + (w.pacePts !== null && w.pacePts !== undefined ? ' · ' + (w.pacePts > 0 ? '+' : '') + w.pacePts + ' pts vs norm' : ''), thresholds: { warn: 100 - th.warnLeft, switch: 100 - th.switchLeft },
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
      /* the foot (pace and source) takes two lines when it does not fit the card's width on one */
      var footText = m.foot ? String(m.foot).replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ') : '';
      var footLines = footText && PMU.charts && PMU.charts.textW ? Math.min(2, Math.ceil((PMU.charts.textW(footText, 12.5) * 1.06 + 26) / Math.max(80, ctx.tier.bw))) : 1;
      var bh = ctx.tier.bh, footH = m.foot ? (footLines > 1 ? 52 : 34) : 0;
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
        /* a state word that does not fit beside its label stacks under it (OWNER-REVIEW 4: "Chat (vs) disabled by" was
           cut at the card edge) */
        var stackIt = vsA && C.wrapLines(label + '      ' + (a.word || ''), ctx.tier.bw - 26, 12.5) > 1;
        return { h: stackIt ? 18 + 18 * C.wrapLines(a.word || '', ctx.tier.bw - 44, 12.5) + 8 : 32, html: '<div class="pmu-amount pmu-amt' + (stackIt ? ' is-stack' : '') + '"' + C.hover(a.label + (a.value ? ' ' + a.value : ''), [a.suffix, a.word, a.hover].filter(Boolean).join(' · ')) + '>' + (vsA ? '<span></span>' : C.glyph(a.glyph || 'info')) + '<span>' + esc(label) + '</span>' +
          (vsA ? '<span class="pmu-amtv">' + C.vs(a.vs, a.word) + '</span>' : '<b>' + esc(a.value) + (a.suffix && !nar ? ' <em>' + esc(a.suffix) + '</em>' : '') + '</b>') + '</div>' };
      });
      var planText = (m.plan || '') + (m.requests != null ? ' · ' + PMU.fmt.num(m.requests) + ' requests' : '') + (m.tokens != null ? ' · ' + PMU.fmt.tok(m.tokens) + ' tokens' : '');
      var planLine = { h: 6 + 18 * C.textLines(planText, ctx.tier.bw, 12.5), html: '<div class="pmu-limitplan"><b>' + esc(m.plan) + '</b>' + (m.requests != null ? ' · ' + esc(PMU.fmt.num(m.requests)) + ' requests' : '') + (m.tokens != null ? ' · ' + esc(PMU.fmt.tok(m.tokens)) + ' tokens' : '') + '</div>' };
      var facts = (m.facts || []).map(function (f) { return { h: C.factH(f, ctx.tier.bw), html: C.facts([f]) }; });
      var side = '';
      if (xl) {
        var right = stack([planLine].concat(lines).concat(facts), bh - footH, true);
        side = '<div class="pmu-limitside">' + right.html + '</div>';
        body.innerHTML = '<div class="pmu-limit is-xl"><div class="pmu-limitmain">' + meters + '</div>' + side + '</div>' + (m.foot && footH ? C.foot(m.foot, m.footGlyph) : '');
      } else {
        /* a short amount (Spend $14.82) goes before the long plan line, so a narrow card keeps the figure */
        var rest = stack(lines.concat([planLine]).concat(C.h(ctx, 'h3') || C.w(ctx, 'm') ? facts : []), bh - footH - used - 4, true);
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
      var top = '<div class="pmu-alerttop" data-tone="' + (m.sev === 'ok' ? 'good' : 'warn') + '">' + C.glyph(m.sev === 'ok' ? 'checkCircle' : 'alert') + '<b>' + esc(m.sevWord) + '</b></div>' +
        '<p class="pmu-alertdetail">' + esc(m.detail) + '</p>';
      /* the detail's lines from its measured width in the theme's face (Retro's mono runs wider), plus a word-wrap margin */
      var tw = PMU.charts && PMU.charts.textW ? PMU.charts.textW(m.detail, 13) * 1.1 : m.detail.length * 6.6;
      var detailH = 26 + Math.ceil(tw / Math.max(120, ctx.tier.bw)) * 19;
      /* the meter's own reset line wraps on a narrow card ("baseline 24-hour norm · raise at / 70"): its height counts it */
      var meter = { h: 48 + 16 * Math.min(3, C.wrapLines('baseline ' + m.baseline + ' · raise at ' + m.raise, ctx.tier.bw, 12)), html: '<div class="pmu-alertmeter"></div>' };
      /* the time and the owner are the subtitle's (each said once, LOOK-REVIEW-2 16) */
      var facts = [['Disposition', m.disposition], ['Scope', m.scope], ['Threshold', m.threshold], ['Receipt', m.receipt]];
      var actions = !(m.actions || []).length ? null : { h: narrow ? 68 : 38, html: '<div class="pmu-alertacts">' + m.actions.map(function (a) {
        return '<button type="button" class="pmu-textbtn' + (a.primary ? ' is-primary' : '') + '"' + (a.act ? ' data-pmu-act="' + esc(a.act) + '" data-value="' + esc(a.value || '') + '"' : '') +
          (a.demo ? ' data-demo-action="' + esc(a.demo) + '" data-demo-arg="' + esc(a.arg || '') + '"' : '') + (a.disabled ? ' disabled' : '') + C.hover(a.label, a.hover || '') + '>' + esc(a.label) + '</button>';
      }).join('') + '</div>' };
      var blocks = [meter, actions].concat(facts.map(function (f) { return { h: 27, html: C.facts([f]) }; }));
      var footOk = m.foot && C.h(ctx, 'h3');
      var rest = stack(blocks, bh - detailH - (footOk ? 34 : 0));
      body.innerHTML = '<div class="pmu-alert">' + top + rest.html + '</div>' + (footOk ? C.foot(esc(m.foot), m.sev === 'ok' ? 'checkCircle' : 'info') : '');
      var host = body.querySelector('.pmu-alertmeter');
      if (host) C.chart(body, 'meter', host, { label: 'Current pressure', pct: m.score, suffix: 'pressure score', noPct: true, tone: m.score >= m.raise ? 'warn' : 'calm', size: 'k', notch: { at: m.raise, faint: false, off: false },
        /* "raise at 70" never breaks before its number (a lone "70" on the third line) */
        resetText: 'baseline ' + m.baseline + ' · raise\u00a0at\u00a0' + m.raise, hover: { label: 'Pressure score', detail: m.score + ' of 100 · raises an alert at ' + m.raise + ' · 24-hour norm ' + m.baseline } }, { label: 'Current pressure ' + m.score });
    }
  });

  /* ================================================================== free: free-model cards */
  /* model: {state, stateTone, provider, price, context, capacity, capacitySource, availability: {pct, tone, label}, facts: [[...]]} */
  /* the capacity number of a free route: "82 calls left" -> 82 / "calls left"; "remaining not published" stays a word */
  function capOf(m) {
    var mm = /^([\d,.]+)\s+(.+)$/.exec(String(m.capacity || ''));
    if (mm) return { value: Number(mm[1].replace(/,/g, '')), unit: mm[2] };
    if (/not published/.test(m.capacity || '')) return { vs: 'not_exposed', word: 'Not published' };
    return { text: String(m.capacity || '').replace(/ capacity$/, ''), unit: /capacity$/.test(m.capacity || '') ? 'capacity' : '' };
  }
  C.kind('free', {
    /* a capacity gauge leads the card (WOW-SPEC 4, Free models; LOOK-REVIEW-2 2): the ring is the route's availability
       (a cooling route shows how much of its wait is done), the big number its published capacity; the facts follow
       in two columns where the card is wide, each hidden whole when it does not fit */
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('No free route in scope'); return; }
      var bw = ctx.tier.bw, bh = ctx.tier.bh, av = m.availability || {}, cool = m.stateTone === 'warn';
      var ringPx = bh >= 120 && bw >= 150 ? Math.round(Math.max(76, Math.min(bw * 0.4, bh - 70, 128))) : 0;
      var cap = capOf(m);
      var capHtml = cap.vs ? '<span class="pmu-freecapvs">' + C.vs(cap.vs, cap.word) + '</span>'
        : cap.value != null ? C.valHtml(cap.value, 'int', 'pmu-freecap', ctx.id + ':cap').replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"') + '<span class="pmu-freecapu">' + esc(cap.unit) + '</span>'
        : '<b class="pmu-freecap"><span class="pmu-num">' + esc(cap.text) + '</span></b><span class="pmu-freecapu">' + esc(cap.unit) + '</span>';
      var head = '<div class="pmu-freehero' + (ringPx ? '' : ' no-ring') + '">' + (ringPx ? '<div class="pmu-freering" style="width:' + ringPx + 'px;height:' + ringPx + 'px"></div>' : '') +
        '<div class="pmu-freetop"><span class="pmu-freestate" data-tone="' + m.stateTone + '">' + C.glyph(m.stateGlyph) + esc(m.state) + '</span>' +
        '<span class="pmu-freecapline"' + C.hover('Capacity', m.capacitySource) + '>' + capHtml + '</span>' +
        '<span class="pmu-freeprov">' + esc(m.provider) + '</span></div></div>';
      var headH = Math.max(ringPx, 78) + 8;
      var blocks = [
        { h: 30, html: '<div class="pmu-freeprice"><b>' + esc(m.price) + '</b><span>' + esc(m.priceSource) + '</span></div>' },
        { h: 27, html: C.facts([['Context window', m.context]]) }
      ];
      var two = bw >= 400, facts = (m.facts || []).filter(function (f) { return f[0] !== 'Capacity note' || f[1] !== m.capacity; });
      if (two) for (var fi = 0; fi < facts.length; fi += 2) blocks.push({ h: Math.max(C.factH(facts[fi], bw / 2), facts[fi + 1] ? C.factH(facts[fi + 1], bw / 2) : 27), html: C.facts(facts.slice(fi, fi + 2), null, { cols: 2 }) });
      else blocks = blocks.concat(facts.map(function (f) { return { h: C.factH(f, bw), html: C.facts([f]) }; }));
      var rest = stack(blocks, bh - headH, true);
      body.innerHTML = '<div class="pmu-free' + (two ? ' is-wide' : '') + '">' + head + rest.html + '</div>' + (rest.hidden.length ? C.more(rest.hidden.length, 'facts') : '');
      if (ringPx) C.chart(body, 'ring', body.querySelector('.pmu-freering'), { segments: [{ name: cool ? 'Wait done' : 'Available', value: av.pct || 0, tone: cool ? 'warn' : 'calm' }], limit: 100,
        centre: cool ? (av.pct || 0) + '%' : 'Ready', caption: cool ? 'waited' : '' }, { label: m.state + ' · ' + (av.detail || '') });
    }
  });

  /* ================================================================== cache: prompt-cache cards (A1 11: the efficiency look in small) */
  /* model: {share, shareVs?, read, write, writeVs?, savings, est, reporting, reportingVs, authority, age, prov} */
  C.kind('cache', {
    /* a large split ring leads the card (WOW-SPEC 4, Prompt cache): read and write arcs in their token colours, the read
       share in its centre; the savings value under it; the facts after, each hidden whole when it does not fit */
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('This provider is not in the selected scope.'); return; }
      var bw = ctx.tier.bw, bh = ctx.tier.bh;
      var ringPx = bh >= 150 && bw >= 120 ? Math.round(Math.max(88, Math.min(bw - 24, bh * 0.52, 150))) : bw >= 200 && C.h(ctx, 'h2') ? 64 : 0;
      var big = ringPx >= 88;
      var top = big ? '<div class="pmu-cachehero"><div class="pmu-cachering is-big" style="width:' + ringPx + 'px;height:' + ringPx + 'px"></div>' +
          '<div class="pmu-cachesave"><span>Saved</span>' + C.valHtml(m.savings, 'money2', 'pmu-kpivalue', ctx.id + ':sv').replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"') + '<em>est.</em></div>' +
          '<span class="pmu-cacherep">' + (m.reportingVs ? C.vs(m.reportingVs, m.reporting) : esc(m.reporting)) + '</span></div>'
        : '<div class="pmu-cachetop">' + (ringPx ? '<div class="pmu-cachering" style="width:' + ringPx + 'px;height:' + ringPx + 'px"></div>' : '') +
          '<div class="pmu-cachehead">' + C.valHtml(m.share, 'pct1', 'pmu-kpivalue', ctx.id + ':s').replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"') + '<span class="pmu-cacheword">read share' + (m.est ? ' · est.' : '') + '</span>' +
          '<span class="pmu-cacherep">' + (m.reportingVs ? C.vs(m.reportingVs, m.reporting) : esc(m.reporting)) + '</span></div></div>';
      var topH = big ? ringPx + 70 : Math.max(ringPx, 54) + 6;
      var blocks = (big ? [] : [{ h: 40, html: '<div class="pmu-cachesplit"></div>' }, { h: 27, html: C.facts([['Savings', C.money(m.savings) + ' est.', { tone: 'good' }]]) }]).concat([
        { h: 27, html: C.facts([['Read', m.read]]) },
        { h: 27, html: C.facts([['Write', m.write, m.writeVs ? { vs: m.writeVs, word: m.write } : {}]]) },
        { h: 27, html: C.facts([['Authority', m.authority]]) },
        { h: 27, html: C.facts([['Age', m.age]]) }
      ]);
      var rest = C.h(ctx, 'h2') ? stack(blocks, bh - topH) : { html: '' };
      body.innerHTML = '<div class="pmu-cache' + (big ? ' is-hero' : '') + '">' + top + rest.html + '</div>';
      var ringHost = body.querySelector('.pmu-cachering');
      if (ringHost && big) C.chart(body, 'ring', ringHost, { segments: [{ name: 'Reads', value: m.readN || 0, tk: 'cr', est: !!m.est }, { name: 'Writes', value: m.writeN || 0, tk: 'cw', est: !!m.est || /est/.test(m.write) }],
        centre: C.fmt(m.share, 'pct1'), caption: 'read share' + (m.est ? ' est.' : '') }, { label: 'Reads ' + m.read + ', writes ' + m.write + ', read share ' + m.share + '%' });
      else if (ringHost) C.chart(body, 'ring', ringHost, { segments: [{ name: 'Reads', value: m.readN || 0, tk: 'cr', est: !!m.est }, { name: 'Writes', value: m.writeN || 0, tk: 'cw', est: !!m.est || /est/.test(m.write) }],
        centre: '', caption: '' }, { label: 'Reads ' + m.read + ', writes ' + m.write + ', read share ' + m.share + '%' });
      var sp = body.querySelector('.pmu-cachesplit');
      if (sp) C.chart(body, 'split', sp, { parts: [{ name: 'Reads', value: m.readN, token: 'cr' }, { name: 'Writes', value: m.writeN || 0, token: 'cw', vs: m.writeVs }] }, { label: 'Cache reads versus writes' });
    }
  });
})();
