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
  /* blocks that do not fit are never dropped silently (CONTENT-3): where the room allows it one "N more" line counts the
     hidden data blocks (b.t, the block's words) and its hover tag lists them; else r.folded goes to the caller's root
     hover tag. Blocks without words (a meter, the action buttons) are not counted. */
  /* gap: the container's flex gap, counted once per block (limit, alert, free and cache stack with 6 px) */
  function fitBlocks(blocks, budget, prefix, word, short, gap, head) {
    var g = gap == null ? 6 : gap, dataOf = function (b) { return b && b.t; };
    blocks = blocks.map(function (b) { return b && b.html ? Object.assign({}, b, { h: b.h + g }) : b; });
    var r = stack(blocks, budget, prefix), hid = r.hidden.filter(dataOf);
    if (!hid.length) return { html: r.html, folded: [], more: false, used: r.used };
    /* a small card counts what it folds in its head (C.headMore): no line, the room stays with the blocks */
    if (head) return { html: r.html, folded: [], head: hid.map(dataOf), more: false, used: r.used };
    /* round 3: the count row (a glyph and "+N", 18 px) instead of a "N more facts" line (no wall of words lines) */
    if (budget >= 18 + g) {
      var r2 = stack(blocks, budget - 18 - g, prefix), hid2 = r2.hidden.filter(dataOf);
      return { html: r2.html + C.countRow(hid2.map(dataOf)), folded: [], more: true, used: r2.used + 18 + g };
    }
    return { html: r.html, folded: hid.map(dataOf), more: false, used: r.used };
  }
  C.fitBlocks = fitBlocks;

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
  var METER_H = { c: 58, i: 58, k: 44 };   /* measured k: 44 (CONTENT-3, VM 1920 and 1440) */

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
      /* the foot's lines by its wrapped words (measured: 34 px one line, 52 two, about 18 a line more; the Gemini API foot
         takes five lines at 4 tracks: its old two-line estimate let the card run 30 px past its body until the settled fit) */
      var footLines = footText ? Math.max(1, Math.min(6, C.wrapLines(footText, Math.max(80, ctx.tier.bw - 26), 12.5))) : 1;
      var bh = ctx.tier.bh, footH = m.foot ? (footLines > 1 ? 16 + 18 * footLines : 34) : 0;
      if (ctx.tier.h === 'h0') {
        var b = m.binding || wins[0];
        body.innerHTML = '<div class="pmu-limit is-h0"><span class="pmu-limitinline">' + (b ? esc(b.short) + ' <b>' + esc(b.pct === null ? PMU.roster.vsWord(b) : C.fmt(b.pct, 'pct')) + '</b>' + (b.pct === null ? '' : ' used · ' + esc(PMU.fmt.resetLine(b).text)) : esc('No plan windows')) + '</span></div>';
        return;
      }
      if (wins.length * mh + footH > bh + 2) footH = 0;   /* every window stays visible before the foot does (R-PLAN-01) */
      var meterRoom = Math.max(1, C.fit(bh - footH, mh));
      var shownWins = wins.slice(0, meterRoom), hiddenWins = wins.length - shownWins.length;
      var meters = '<div class="pmu-limitmeters">' + shownWins.map(function (w, i) { return '<div class="pmu-limitmeter" data-i="' + i + '"' + (m.account ? C.shareAttr('win:' + m.account.key + '/' + w.key) : '') + '></div>'; }).join('') +
        (hiddenWins ? '<div class="pmu-more"' + C.foldHover(wins.slice(shownWins.length).map(function (w) { return w.label + ' ' + (w.pct === null ? PMU.roster.vsWord(w) : C.fmt(w.pct, 'pct') + ' used · ' + PMU.fmt.resetLine(w).text); })) + '>' + esc(hiddenWins + ' more ' + (hiddenWins === 1 ? 'window' : 'windows') + ' at a larger size') + '</div>' : '') +
        (!wins.length ? '<div class="pmu-limitnone">' + C.vs('not_exposed', 'Quota not exposed') + '</div>' : '') + '</div>';
      /* the meters block: 44 px meters 8 px apart (measured), its own "N more windows" line (21 + 4) */
      var used = Math.max(0, shownWins.length * mh - 8) + (hiddenWins ? 25 : 0) + (wins.length ? 0 : 30);
      var lines = (m.amounts || []).map(function (a) {
        var nar = ctx.tier.bw < 260, label = nar && /^Spend/.test(a.label) ? 'Spend' : a.label, vsA = a.vs && a.vs !== 'ok';
        /* a state word that does not fit beside its label stacks under it (OWNER-REVIEW 4: "Chat (vs) disabled by" was
           cut at the card edge) */
        var stackIt = vsA && C.wrapLines(label + '      ' + (a.word || ''), ctx.tier.bw - 26, 12.5) > 1;
        return { t: a.label + ' ' + (vsA ? a.word || '' : (a.value || '') + (a.suffix ? ' ' + a.suffix : '')), h: stackIt ? 18 + 18 * C.wrapLines(a.word || '', ctx.tier.bw - 44, 12.5) + 8 : 32, html: '<div class="pmu-amount pmu-amt' + (stackIt ? ' is-stack' : '') + '"' + C.hover(a.label + (a.value ? ' ' + a.value : ''), [a.suffix, a.word, a.hover].filter(Boolean).join(' · ')) + '>' + (vsA ? '<span></span>' : C.glyph(a.glyph || 'info')) + '<span>' + esc(label) + '</span>' +
          (vsA ? '<span class="pmu-amtv">' + C.vs(a.vs, a.word) + '</span>' : '<b>' + esc(a.value) + (a.suffix && !nar ? ' <em>' + esc(a.suffix) + '</em>' : '') + '</b>') + '</div>' };
      });
      var planText = (m.plan || '') + (m.requests != null ? ' · ' + PMU.fmt.num(m.requests) + ' requests' : '') + (m.tokens != null ? ' · ' + PMU.fmt.tok(m.tokens) + ' tokens' : '');
      var planLine = { t: planText, h: 6 + 18 * C.textLines(planText, ctx.tier.bw, 12.5), html: '<div class="pmu-limitplan"><b>' + esc(m.plan) + '</b>' + (m.requests != null ? ' · ' + esc(PMU.fmt.num(m.requests)) + ' requests' : '') + (m.tokens != null ? ' · ' + esc(PMU.fmt.tok(m.tokens)) + ' tokens' : '') + '</div>' };
      var facts = (m.facts || []).map(function (f) { return { t: C.factText(f), h: C.factH(f, ctx.tier.bw), html: C.facts([f]) }; });
      var side = '', footFold = m.foot && !footH ? [String(m.foot).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim()] : [];
      if (xl) {
        var right = fitBlocks([planLine].concat(lines).concat(facts), bh - footH, true, 'facts', false, null, C.smallCard(ctx));
        C.headMore(ctx, body, right.head || []);
        side = '<div class="pmu-limitside">' + right.html + '</div>';
        body.innerHTML = '<div class="pmu-limit is-xl"' + C.foldHover(right.folded.concat(footFold)) + '><div class="pmu-limitmain">' + meters + '</div>' + side + '</div>' + (m.foot && footH ? C.foot(m.foot, m.footGlyph) : '');
      } else {
        /* a short amount (Spend $14.82) goes before the long plan line, so a narrow card keeps the figure; the plan line
           and the facts then fill what is left, each that does not fit counted on the "N more" line (CONTENT-3: the
           plan cards showed no fact over an 86 px band at 1920) */
        var amt = stack(lines.map(function (x) { return Object.assign({}, x, { h: x.h + 6 }); }), bh - footH - used, true);
        var rest = fitBlocks([planLine].concat(facts), bh - footH - used - amt.used, false, 'facts', ctx.tier.bw < 260, null, C.smallCard(ctx));
        C.headMore(ctx, body, rest.head ? rest.head.concat(amt.hidden.map(function (x) { return x.t; })) : []);
        body.innerHTML = '<div class="pmu-limit"' + C.foldHover((rest.head ? [] : amt.hidden.map(function (x) { return x.t; })).concat(rest.folded, footFold)) + '>' + meters + amt.html + rest.html + '</div>' + (m.foot && footH ? C.foot(m.foot, m.footGlyph) : '');
      }
      shownWins.forEach(function (w, i) {
        C.chart(body, 'meter', body.querySelector('.pmu-limitmeter[data-i="' + i + '"]'), C.meterSpec(w, { size: w.pct === null ? 'k' : size, effective: true, prov: m.settingsId, stale: m.account && m.account.fresh.stale, age: m.account ? m.account.ageText : '', hoverName: m.name }),
          { label: m.name + ' ' + w.label });
      });
    }
  });

  /* ================================================================== alert: attention cards */
  /* model: {sev: 'warn'|'ok', sevWord, detail, score, threshold, owner, observed, disposition, scope, receipt, prov, actions: [...]} */
  var alertImpl;
  C.kind('alert', alertImpl = {
    /* live (FINAL-REVIEW-3 must-fix 5): when a live alert arrives the cards are slots and each takes the alert of the card
       before it: the card's content slides in from the left (one animation per card, 40 apart along the row); the new
       alert's severity glyph pops and its card flashes once in the warn tone. The same alert: the generic in-place patch. */
    live: function (body, ctx) {
      var m = ctx.model, k0 = body._pmuAlertKey;
      if (!m || !k0 || k0 === m.key) return false;
      C.liveRender(body, ctx, alertImpl);
      if (ctx.liveFinal || (PMU.motion.reduced && PMU.motion.reduced())) return true;
      var slot = +(/(\d+)$/.exec(String(ctx.id)) || [0, 0])[1], st = PMU.motion.family && /retro|nier/.test(PMU.motion.family());
      var inner = body.querySelector('.pmu-alert');
      if (inner) PMU.motion.animate(inner, [{ opacity: 0, transform: 'translateX(-14px)' }, { opacity: 1, transform: 'none' }], { dur: st ? 200 : 300, delay: 40 * slot, easing: st ? 'steps(4,jump-start)' : 'cubic-bezier(.22,.8,.28,1)', fill: 'backwards' });
      if (m.live) {
        var g = body.querySelector('.pmu-alerttop .pmu-ico, .pmu-alerttop svg');
        if (g) PMU.motion.animate(g, [{ transform: 'scale(.2)' }, { transform: 'scale(1.25)', offset: 0.6 }, { transform: 'none' }], { dur: 260, delay: 260, easing: st ? 'steps(3,jump-start)' : 'cubic-bezier(.34,1.45,.64,1)', fill: 'backwards' });
        var top = body.querySelector('.pmu-alerttop');
        if (top && PMU.film && PMU.film.flash) PMU.film.flash(top, { delay: 300, tone: 'warn', noSweep: true });
      }
      return true;
    },
    render: function (body, ctx) {
      var m = ctx.model;
      if (!body._pmuDry) {
        body._pmuAlertKey = m ? m.key || null : null;
        /* the card's provider follows its slot (the cross-highlight hover reads data-prov) */
        if (ctx.card) { if (m && m.prov) ctx.card.setAttribute('data-prov', m.prov); else if (ctx.card.hasAttribute('data-prov')) ctx.card.removeAttribute('data-prov'); }
      }
      if (!m) { body.innerHTML = C.empty('This alert is not in the selected scope.', 'Scope filters alerts by provider'); return; }
      var bh = ctx.tier.bh, narrow = ctx.tier.bw < 300;
      var top = '<div class="pmu-alerttop" data-tone="' + (m.sev === 'ok' ? 'good' : 'warn') + '">' + C.glyph(m.sev === 'ok' ? 'checkCircle' : 'alert') + '<b>' + esc(m.sevWord) + '</b></div>' +
        '<p class="pmu-alertdetail">' + esc(m.detail) + '</p>';
      /* the detail's lines from its measured width in the theme's face (Retro's mono runs wider), plus a word-wrap margin */
      var tw = PMU.charts && PMU.charts.textW ? PMU.charts.textW(m.detail, 13) * 1.1 : m.detail.length * 6.6;
      /* measured: the state line 18, a 6 px gap, the detail 19 a line, a 6 px gap */
      var detailH = 30 + Math.ceil(tw / Math.max(120, ctx.tier.bw)) * 19;
      /* the meter's own reset line wraps on a narrow card ("baseline 24-hour norm · raise at / 70"): its height counts it */
      /* measured (VM 1920 / 1440): the pressure meter is 52 px with a one-line reset line, 15 px more a wrapped line */
      var meter = { t: 'Current pressure ' + m.score + ' · baseline ' + m.baseline + ' · raise at ' + m.raise, h: 37 + 15 * Math.min(3, C.wrapLines('baseline ' + m.baseline + ' · raise at ' + m.raise, ctx.tier.bw, 12)), html: '<div class="pmu-alertmeter"></div>' };
      /* the time and the owner are the subtitle's (each said once, LOOK-REVIEW-2 16) */
      var facts = [['Disposition', m.disposition], ['Scope', m.scope], ['Threshold', m.threshold], ['Receipt', m.receipt]].concat(m.more && m.more.length ? [['More alerts', m.more.join(' · ')]] : []);
      var actions = !(m.actions || []).length ? null : { h: narrow ? 68 : 38, html: '<div class="pmu-alertacts">' + m.actions.map(function (a) {
        return '<button type="button" class="pmu-textbtn' + (a.primary ? ' is-primary' : '') + '"' + (a.act ? ' data-pmu-act="' + esc(a.act) + '" data-value="' + esc(a.value || '') + '"' : '') +
          (a.demo ? ' data-demo-action="' + esc(a.demo) + '" data-demo-arg="' + esc(a.arg || '') + '"' : '') + (a.disabled ? ' disabled' : '') + C.hover(a.label, a.hover || '') + '>' + esc(a.label) + '</button>';
      }).join('') + '</div>' };
      var blocks = [meter, actions].concat(facts.map(function (f) { return { t: C.factText(f), h: C.factH(f, ctx.tier.bw), html: C.facts([f]) }; }));
      var footOk = m.foot && C.h(ctx, 'h3');
      var rest = fitBlocks(blocks, bh - detailH - (footOk ? 34 : 0), false, 'facts', narrow, null, C.smallCard(ctx));
      C.headMore(ctx, body, rest.head || []);
      body.innerHTML = '<div class="pmu-alert"' + C.foldHover(rest.folded.concat(m.foot && !footOk ? [m.foot] : [])) + '>' + top + rest.html + '</div>' + (footOk ? C.foot(esc(m.foot), m.sev === 'ok' ? 'checkCircle' : 'info') : '');
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
    /* a tall card's facts grow into a free band (the ring keeps its size from 200 px up) */
    grow: function (body) { var c = body._pmuCtxK; return !!c && c.tier.bh >= 220; },
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
      /* the hero's height from its wrapped words beside the ring (the state line wrapped to four lines in a 102 px column
         and the facts were placed under an 87 px estimate of a 188 px hero) */
      var topW = Math.max(60, ringPx ? bw - ringPx - 16 : bw);
      var capH = cap.vs ? 20 * C.wrapLines(cap.word, topW - 22, 14, 560) : 29 + (cap.value != null && C.wrapW(String(cap.value), 28, 640) + 8 + C.wrapW(cap.unit || '', 12.5) > topW ? 18 : 0);
      var topH = 20 * C.wrapLines(m.state, topW - 22, 14, 640) + 4 + capH + 4 + 17 * C.wrapLines(m.provider, topW, 12);
      var headH = Math.max(ringPx, topH) + 6 + 6;
      /* the price line, then the facts placed by C.factLayout (two columns where a pair fits); the facts that do not fit
         are counted on one "N more facts" line whose hover tag lists them (CONTENT-3) */
      var priceH = 30, facts = [['Context window', m.context]].concat((m.facts || []).filter(function (f) { return f[0] !== 'Capacity note' || f[1] !== m.capacity; }));
      var priceOk = bh - headH >= priceH, lay = C.factLayout(facts, bw), room = bh - headH - (priceOk ? priceH + 6 : 0) - 4;   /* .pmu-free stacks with 6 px gaps; 2 px of rounding */
      var fr = lay.fit(room), moreLine = false, headF = C.smallCard(ctx);
      if (fr.n < facts.length && room >= 18 && !headF) { fr = lay.fit(room - 18); moreLine = true; }
      var hidden = facts.slice(fr.n);
      var folded = hidden.map(C.factText).concat(priceOk ? [] : [m.price + ' ' + m.priceSource]);
      if (headF) { C.headMore(ctx, body, folded); if (folded.length) folded = []; }
      body.innerHTML = '<div class="pmu-free' + (lay.cols === 2 ? ' is-wide' : '') + '"' + (!moreLine && folded.length ? C.foldHover(folded) : '') + '>' + head +
        (priceOk ? '<div class="pmu-freeprice"><b>' + esc(m.price) + '</b><span>' + esc(m.priceSource) + '</span></div>' : '') + (fr.n ? lay.html(fr.n) : '') + '</div>' +
        (moreLine && hidden.length ? C.countRow(folded) : '');
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
      /* measured: the big hero is the ring, 6 px, the savings line 26, 4 px, the reporting line 17 a line (VM 1440) */
      var topH = big ? ringPx + 36 + 17 * C.wrapLines(m.reporting, bw, 12.5) : Math.max(ringPx, 54) + 6;
      /* the facts in one block placed by C.factLayout (Read and Write side by side where they fit); the split bar first
         on the small form; whatever does not fit is counted on one "N more facts" line (CONTENT-3) */
      var cfacts = (big ? [] : [['Savings', C.money(m.savings) + ' est.', { tone: 'good' }]]).concat([['Read', m.read], ['Write', m.write, m.writeVs ? { vs: m.writeVs, word: m.write } : {}], ['Authority', m.authority], ['Age', m.age]]);
      var splitOk = !big && C.h(ctx, 'h2') && bh - topH >= 46, clay = C.factLayout(cfacts, bw), croom = C.h(ctx, 'h2') ? bh - topH - (big ? 8 : 6) - (splitOk ? 46 : 0) - 2 : 0;
      var cfr = clay.fit(croom), cmore = false, headC = C.smallCard(ctx);
      if (cfr.n < cfacts.length && croom >= 18 && !headC) { cfr = clay.fit(croom - 18); cmore = true; }
      var chid = cfacts.slice(cfr.n).map(C.factText).concat(!big && !splitOk ? ['Reads ' + m.read + ' · Writes ' + m.write] : []);
      if (headC) { C.headMore(ctx, body, chid); chid = []; }
      var rest = { html: (splitOk ? '<div class="pmu-cachesplit"></div>' : '') + (cfr.n ? clay.html(cfr.n) : '') + (cmore ? C.countRow(chid) : ''), folded: cmore ? [] : chid };
      body.innerHTML = '<div class="pmu-cache' + (big ? ' is-hero' : '') + '"' + C.foldHover(rest.folded) + '>' + top + rest.html + '</div>';
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
