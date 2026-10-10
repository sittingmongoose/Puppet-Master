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

  /* "sampled 20s ago" from a reading time (the demo clock: a reading not polled again ages while the page is open) */
  C.sampledText = function (at) { return at === null || at === undefined || !isFinite(at) ? 'no reading yet' : 'sampled ' + PMU.fmt.age(Math.max(0, (PMU.clock.now() - at) / 1000)); };
  /* a window's provenance in one line (AAC: source and sampled time per account and window, in the hover tag and Details,
     never as body clutter): "provider reported · status line rate_limits · sampled 20s ago" */
  C.winSource = function (w, age) {
    var sampled = w.sampledAt !== null && w.sampledAt !== undefined ? C.sampledText(w.sampledAt) : age ? 'sampled ' + String(age).replace(/^cached /, '') : '';
    /* the truth word once: a reading whose source is its truth word (Qwen's windows: source "provider reported") says it
       one time (polish pass: Plan Details read "provider reported · provider reported · sampled 1m ago") */
    var truth = w.truth && w.truth !== 'unknown' ? PMU.fmt.truth(w.truth) : '', src = String(w.source || '');
    return [truth, src && src.toLowerCase() !== truth.toLowerCase() ? src : '', sampled].filter(Boolean).join(' · ');
  };
  /* one meter spec for a WindowView (A1 6). The notch and the warn line are the window's own provider policy: lane d-switch
     (item 2) puts providerId, switchAt, warnAt (% used) and autoOn on every window from thresholds(providerId, accountId), so
     Codex's notch sits at its own 85 % while Claude keeps the shared 90 %; a window without them (this lane's base) asks
     thresholds(providerId, accountId), and a roster without per-provider policy answers with the shared levels. A window
     built from the shared policy (providerId null) yields to its provider's own when the caller names the provider. */
  C.policyOf = function (w, pid, accountId) {
    var th = (pid && PMU.roster.thresholds(pid, accountId)) || PMU.roster.thresholds();
    var mine = !!w && (!!w.providerId || !pid), own = mine && typeof w.switchAt === 'number' && isFinite(w.switchAt);
    /* autoOn stands on its own: a provider with one account (d-switch: nothing to switch to) dims its notch even where
       the window carries no switch point of its own */
    return { switchAt: own ? w.switchAt : 100 - th.switchLeft, warnAt: own && typeof w.warnAt === 'number' && isFinite(w.warnAt) ? w.warnAt : 100 - th.warnLeft,
      auto: mine && typeof w.autoOn === 'boolean' ? w.autoOn : !!th.auto };
  };
  C.meterSpec = function (w, opts) {
    opts = opts || {};
    var pid = opts.prov || w.providerId || null, pol = C.policyOf(w, pid, opts.acct || null);
    var rl = PMU.fmt.resetLine(w), src = C.winSource(w, opts.age);
    var pace = w.pacePts !== null && w.pacePts !== undefined ? (w.pacePts > 0 ? '+' : '') + w.pacePts + ' pts vs norm' : '';
    var label = (opts.hoverName ? opts.hoverName + ' · ' : '') + w.label;
    /* reset truth: no current reading after a passed reset says so, with when it was last read (the old % never shows) */
    var hover = w.resetPending ? { label: label, detail: PMU.roster.vsWord(w) + ' · last reading ' + (w.sampledAt !== null && w.sampledAt !== undefined ? PMU.fmt.age(Math.max(0, (PMU.clock.now() - w.sampledAt) / 1000)) : 'time not recorded') +
      (w.source ? ' (' + w.source + ')' : '') + ', before the reset' } : { label: label };
    return { label: opts.label || w.short, pct: w.pct, vs: w.pct === null ? (w.vs === 'ok' ? 'unknown' : w.vs) : undefined, vsWord: w.pct === null ? PMU.roster.vsWord(w) : undefined,
      tone: w.tone, size: opts.size || 'c', window: w.key, binding: !!w.binding, estimated: !!w.est, dimmed: !!opts.stale, stale: !!opts.stale,
      notch: w.governed && w.pct !== null ? { at: pol.switchAt, faint: !opts.effective, off: !pol.auto } : null,
      resetText: w.pct === null ? '' : rl.text, resetSoon: rl.soon, amount: opts.noAmount ? '' : (w.amount || (w.note && w.pct !== null ? w.note : '')), prov: opts.prov,
      source: [src, pace].filter(Boolean).join(' · '), thresholds: { warn: pol.warnAt, switch: pol.switchAt },
      hover: hover };
  };
  var METER_H = { c: 58, i: 58, k: 44 };   /* measured k: 44 (CONTENT-3, VM 1920 and 1440) */

  /* ================================================================== limit, two or more accounts: the account rows plate
     (lane d-plans, Jared item 4: "The plans and limits page doesn't have all the multiple accounts from the same provider.
     For example the 3 codex accounts."; canon MA-049: never one generic account label for a provider). AAC's Home rule
     (research R3 2): one row per account, every window a meter cell with its reset, an Active mark, the account column as
     wide as the widest identity. Plans & limits shows limits, not actions: the effective account is said by its check
     glyph, its 680 name, the "Active" word leading its meta line and the room's active light (the Accounts room's row
     grammar, so both rooms read alike); a row opens that account's Details. Source and sampled time live in the hover
     tags (identity and every meter) and in the plate's Details, never as body clutter; a cached account says "cached".
     Content grows by rows (WS-017 presets): a short plate shows its first accounts and folds the rest into "N more
     accounts" (hover lists each with its windows; Details lists everything); the provider's plan facts fill what the rows
     leave, the rest counted in the head. Two layouts by measured width: columns (ACCOUNT | one column per window) where
     every window fits beside the identity, else stacked (each account a block: identity over its window meters), so
     every window of every account shows at every width (the binding-window fallback is gone). */
  var PGAP = 12, PWIN = 88, PIDENT = 96;
  function stateHtmlP(a) { return '<span class="pmu-acstate" data-state="' + a.shownState + '" data-tone="' + a.stateTone + '"><b>' + esc(a.stateWord) + '</b></span>'; }
  /* the meta line: the state word (Active first, in its tone), the plan; a cached reading says so with its age */
  function metaText(a) { return [a.stateWord, a.plan, a.fresh && a.fresh.stale ? 'M ' + a.ageText : ''].filter(Boolean).join(' · '); }
  function metaHtml(a) {
    return [stateHtmlP(a), a.plan ? esc(a.plan) : '', a.fresh && a.fresh.stale ? '<span class="pmu-stale">' + C.glyph('clockCircle') + esc(a.ageText) + '</span>' : ''].filter(Boolean).join('<i class="pmu-dot"> · </i>');
  }
  /* who, how fresh and from where: the identity's hover tag (the nickname is never cut without this path, and Details) */
  function identHover(p, a) {
    return C.hover(a.nickname + (a.effective ? ' · Active' + (a.override ? ' (override)' : '') : ''), [p.name, a.identity, a.planLine || a.plan, a.stateWord, a.host, (a.fresh ? a.fresh.source : '') + ' · ' + C.sampledText(a.sampledAt)]
      .filter(Boolean).join(' · ') + ' · select for Details');
  }
  function allHiddenP(a) { return a.windows.length > 0 && a.windows.every(function (w) { return w.pct === null && (w.vs === 'not_exposed' || w.vs === 'disabled'); }); }
  function foldLine(a) {
    return a.nickname + ' · ' + a.stateWord + ' · ' + (a.windows.length ? a.windows.map(function (w) { return w.short + ' ' + (w.pct === null ? PMU.roster.vsWord(w) : C.fmt(w.pct, 'pct') + ' used · ' + PMU.fmt.resetLine(w).text); }).join(' · ') : (a.noWindowsWord || 'no plan windows'));
  }
  C.planFoldLine = foldLine;
  function rowsPlate(body, ctx, m) {
    var p = m.provider, accs = p.accounts, n = p.windows.length, bw = ctx.tier.bw, bh = ctx.tier.bh;
    var look = PMU.theme.look(), k = look.nier || look.family === 'retro' ? 1.12 : look.family === 'glass' ? 1.04 : 1;
    var kOn = true, tw = function (s, px, wt) { return C.wrapW(s, px, wt) * (kOn ? k : 1); };
    /* the identity column: the widest nickname, state word or plan (AAC: sized to the widest identity; the meta line wraps
       at its middle dot), never under 96 px and never so wide that a window column falls under 92 px. Columns only where
       the identity keeps its longest word whole ("sittingmongoose" was broken inside the word at 138 px) */
    var metaW = function (a) { return tw(a.stateWord, 12, 600) + (a.plan ? tw(' · ' + a.plan, 12) : '') + (a.fresh && a.fresh.stale ? tw(' · M ' + a.ageText, 12) : 0); };
    var amtText = function (a) { var x = a.amounts[0]; return x ? x.label + ' ' + (x.value || x.word) + ' ' + (x.suffix || '') : ''; };
    var wantId = Math.ceil(24 + Math.max.apply(null, accs.map(function (a) { return Math.max(tw(a.nickname, 13.5, 600), metaW(a), a.amounts.length && n && !allHiddenP(a) ? tw(amtText(a), 12) : 0); })));
    var longWord = Math.ceil(24 + Math.max.apply(null, accs.map(function (a) { return Math.max.apply(null, String(a.nickname).split(/\s+/).map(function (x) { return tw(x, 13.5, 600); }).concat(
      String(a.stateWord + ' ' + (a.plan || '')).split(/\s+/).map(function (x) { return tw(x, 12, 600); }))); })));
    var cols = n > 0 && bw - n * (PWIN + PGAP) >= Math.max(PIDENT, longWord);
    /* the identity yields to the windows: a window column keeps about 118 px where the plate has it ("resets in 1h 41m"
       and "Reset at 21:56 ·" on one line each), the identity's meta line wraps at its dot instead */
    /* (the identity still keeps its nickname and its state word on one line each where the windows' minimum allows) */
    var nickW = Math.ceil(24 + Math.max.apply(null, accs.map(function (a) { return Math.max(tw(a.nickname, 13.5, 600), tw(a.stateWord, 12, 600)); })));
    var identW = cols ? Math.max(PIDENT, longWord, Math.min(wantId, 200, bw - n * (PWIN + PGAP), Math.max(nickW, bw - n * (118 + PGAP)))) : bw;
    var winW = cols ? (bw - identW - n * PGAP) / n : 0;
    /* stacked: the window meters of an account side by side where they fit (at least 88 px each), else in rows */
    var perLine = cols ? n : Math.max(1, Math.min(Math.max(1, n), Math.floor((bw + 10) / (88 + 10))));
    var cellW = cols ? winW : (bw - 10 * (perLine - 1)) / perLine;
    var textW = (cols ? identW : bw) - 24;
    /* the meta line's words are measured as drawn (the state word 600, the rest 400), so a wrap is counted where it happens */
    var identH = function (a) {
      var sl = kOn ? 1 : 1.06;   /* the likely heights give C.wrapLines back its own 6 % over-measure */
      var am = a.amounts.length && n && !allHiddenP(a) ? 16 * C.wrapLines(amtText(a), textW * sl, 12) : 0;
      return 18 * C.wrapLines(a.nickname, textW * sl, 13.5, 600) + 16 * Math.max(1, Math.ceil(metaW(a) * (kOn ? 1.02 : 1 / 1.04) / Math.max(40, textW))) + am;
    };
    /* one window cell: the value line (17), the track (14), the reset line (14 a line, wrapped in its column) */
    var cellH = function (a, w) {
      var sl = kOn ? 1 : 1.06;
      if (w.pct === null) return 8 + (w.resetPending ? 15 : 17) * Math.min(4, C.wrapLines(PMU.roster.vsWord(w), (cellW - 20) * sl, w.resetPending ? 12 : 13, 520));
      /* the meter foot puts the reset and the amount ("105 / 300 requests") side by side, each wrapping in its half */
      var half = (w.amount ? (cellW - 8) / 2 : cellW) * sl;
      return 17 + 14 + 4 + 14 * Math.min(4, Math.max(C.wrapLines(PMU.fmt.resetLine(w).text, half, 12), w.amount ? C.wrapLines(w.amount, half, 12) : 0));
    };
    var rowH = function (a) {
      if (!n || allHiddenP(a)) return Math.max(56, Math.max(identH(a), 22 * Math.min(3, a.amounts.length + 1)) + 18);
      if (cols) return Math.max(64, Math.ceil(Math.max(identH(a), Math.max.apply(null, a.windows.map(function (w) { return cellH(a, w); }))) + 22));
      var lines = Math.ceil(n / perLine), mh = 0;
      for (var li = 0; li < lines; li++) mh += 6 + Math.max.apply(null, a.windows.slice(li * perLine, li * perLine + perLine).map(function (w) { return Math.max(42, cellH(a, w)); }));
      return Math.ceil(identH(a) + mh + 16);
    };
    var bandH = cols ? 26 : 0, MORE = 26;
    var hs = accs.map(rowH);
    /* the rows' likely heights, measured without the look factor (the canvas width already runs over the laid-out width):
       the facts take their room by these (Retro at 1920 left a 46 px band where its facts row fits, the k measure
       having wrapped every meta line); a fact the estimate lets through that does not fit is the first thing the fit
       pass takes ([data-fit-first]), never an account row */
    kOn = false; var hs1 = accs.map(rowH); kOn = true;
    /* the account line (small plates): an account with no room for its full row still shows, as one line (two where
       narrow): its state glyph, nickname and state word, then every window's value ("5H 78% · WK 54%"; a missing reading
       says its word, never 0 %). Content grows by rows: as the plate grows the first accounts take their full rows
       (meters, resets) and the rest stay lines, so every account of the provider shows at every size where a line fits
       (a 4x8 Codex plate was "3 more accounts at a taller size" over 155 px of nothing); only where even the lines run
       out does "N more accounts" fold the rest (its hover lists each with its windows, Details everything) */
    var WCODE = { fiveHour: '5H', weekly: 'WK', monthly: 'MO', daily: 'DAY' };
    var wcode = function (w) { return WCODE[w.key] || String(w.short).slice(0, 3).toUpperCase(); };
    var shortVs = function (w) { return w.resetPending ? 'pending' : w.vs === 'not_exposed' ? 'not exposed' : w.vs === 'disabled' ? 'disabled' : 'unknown'; };
    var lineL = function (a) { return a.nickname + ' · ' + a.stateWord; };
    var lineR = function (a) {
      if (!n || allHiddenP(a)) return a.amounts.length ? amtText(a).replace(/\s+/g, ' ').trim() : !n ? a.noWindowsWord || 'No plan windows' : 'Quota not exposed';
      if (a.windows.every(function (w) { return w.pct === null && !w.resetPending; })) return PMU.roster.vsWord(a.windows[0]);
      return a.windows.map(function (w) { return wcode(w) + ' ' + (w.pct === null ? shortVs(w) : C.fmt(w.pct, 'pct')); }).join(' · ');
    };
    /* a line's height as the page lays it out: the nickname, the state word and each window's value ("5H 78%") are whole
       inline blocks that wrap at the middle dots between them (never "WK" / "61%", never "Usage" / "exhausted" while the
       column has room for the phrase), so the estimate flows the same blocks greedily through the line's text column (the
       row less its 16 px glyph and 8 px gap). The old estimate divided a whole string by the column, and in Glass at 4x8 a
       Claude plate showed one account over 93 px of room; a line the estimate still lets through that does not fit is
       taken by the fit pass into the "N more" count, exactly */
    /* measured with C.wrapW as it is: the theme face's canvas width already runs 1-6 % over the laid-out width in every look
       (VM calibration 2026-10-10, Basic, Friendly, Glass, Retro, NieR), so the rows' extra look factor k over-counted the
       lines (Glass 4x8 Claude: one account line over 91 px of free room) */
    var lw = function (s, px, wt) { return C.wrapW(s, px, wt); };
    var colW = Math.max(60, bw - 24), sepW = lw(' · ', 13, 400);
    var nameW = function (a, px) { return lw(a.nickname, px, a.effective ? 680 : 520); };
    /* a nickname wider than the column steps down to 12 px, and where even that does not fit it ends in an ellipsis (the
       line's hover tag and Details carry it whole): "sittingmongoose" broke inside the word ("sittingmongoos / e") */
    var nameCls = function (a) { return nameW(a, 13) <= colW ? '' : nameW(a, 12) <= colW ? ' is-tight' : ' is-cut'; };
    var blockL = function (a) {
      var c = nameCls(a), sw = lw(a.stateWord, 12, 600);
      return [{ w: c === ' is-cut' ? colW : nameW(a, c ? 12 : 13) }, { w: sw, n: sw > colW ? C.wrapLines(a.stateWord, colW, 12, 600) : 1 }];
    };
    var wordsR = function (a) { return !n || allHiddenP(a) || a.windows.every(function (w) { return w.pct === null && !w.resetPending; }); };
    var blockR = function (a) {
      if (wordsR(a)) { var t = lineR(a); return [{ w: lw(t, 12.5), n: C.wrapLines(t, colW, 12.5) }]; }
      return a.windows.map(function (w) { return { w: lw(wcode(w) + ' ', 12, 500) + (w.pct === null ? lw(shortVs(w), 12) : lw(C.fmt(w.pct, 'pct'), 13, 650)) }; });
    };
    var flow = function (bs) {
      var lines = 1, cur = 0;
      bs.forEach(function (b) {
        var w = Math.min(b.w, colW);   /* a block wider than the column wraps inside itself (its own lines) and fills it */
        if (cur > 0 && cur + sepW + w > colW) { lines++; cur = 0; }
        lines += (b.n || 1) - 1; cur += (cur > 0 ? sepW : 0) + w;
      });
      return lines;
    };
    var sumW = function (bs) { return bs.reduce(function (s, b, i) { return s + b.w + (i ? sepW : 0); }, 0); };
    var lineOne = function (a) { var l = blockL(a), r = blockR(a); return l.every(function (b) { return (b.n || 1) === 1; }) && r.every(function (b) { return (b.n || 1) === 1; }) && sumW(l) + 8 + sumW(r) <= colW; };
    var lineH = function (a) { return lineOne(a) ? 28 : 10 + 18 * flow(blockL(a)) + 17 * flow(blockR(a)); };
    var lh = accs.map(lineH);
    /* the most full rows with every other account as a line; else lines only, as many as fit, and the "N more" line */
    var need = function (kf) { var u = kf && cols ? bandH : 0; for (var q = 0; q < accs.length; q++) u += q < kf ? hs[q] : lh[q]; return u; };
    var shownN = accs.length; while (shownN > 0 && need(shownN) > bh + 4) shownN--;
    var lineN = accs.length - shownN, used;
    if (need(shownN) <= bh + 4) used = need(shownN);
    else { shownN = 0; used = MORE; lineN = 0; while (lineN < accs.length && used + lh[lineN] <= bh + 4) { used += lh[lineN]; lineN++; } lineN = Math.max(1, lineN); }
    var shown = accs.slice(0, shownN), asLines = accs.slice(shownN, shownN + lineN), folded = accs.slice(shownN + lineN);
    if (!shownN) { cols = false; bandH = 0; }
    var tmpl = cols ? identW + 'px ' + p.windows.map(function () { return 'minmax(' + PWIN + 'px,1fr)'; }).join(' ') : '';
    var band = cols ? '<div class="pmu-colhead pmu-accband pmu-planband" style="grid-template-columns:' + tmpl + ';column-gap:' + PGAP + 'px"><span class="pmu-cap">' + esc(C.plural(accs.length, 'ACCOUNT', 'ACCOUNTS')) + '</span>' +
      p.windows.map(function (w) { return '<span class="pmu-cap">' + esc(String(w.label).replace(/ window$/i, '').toUpperCase()) + '</span>'; }).join('') + '</div>' : '';
    var rows = shown.map(function (a) {
      var hidden = !n || allHiddenP(a);
      var amountsLine = a.amounts.length && !hidden ? '<span class="pmu-amounts">' + esc(a.amounts[0].label) + ' <b>' + esc(a.amounts[0].value || a.amounts[0].word) + '</b>' + (a.amounts[0].suffix ? ' ' + esc(a.amounts[0].suffix) : '') + '</span>' : '';
      var ident = '<span class="pmu-accid"' + identHover(p, a) + '><span class="pmu-accglyph">' + (a.stateGlyph ? C.glyph(a.stateGlyph) : '') + '</span>' +
        '<span class="pmu-acctext"><b class="pmu-ident' + (a.effective ? ' is-eff' : p.effective ? ' is-other' : '') + '"' + C.shareAttr('acct:' + a.key) + '>' + esc(a.nickname) + '</b>' +
        '<span class="pmu-identmeta">' + metaHtml(a) + '</span>' + amountsLine + '</span></span>';
      var cells;
      if (hidden) {
        var word = !n ? a.noWindowsWord || 'Quota not exposed' : (a.windows[0].note && /limit/.test(a.windows[0].note) ? 'Limit not exposed' : 'Quota not exposed');
        cells = '<span class="pmu-acccell is-merged"' + (cols && n > 1 ? ' style="grid-column:span ' + n + '"' : '') + '>' +
          (a.amounts || []).slice(0, 2).map(function (x) { var vsA = x.vs && x.vs !== 'ok'; return '<div class="pmu-amount pmu-amt"' + C.hover(x.label + (x.value ? ' ' + x.value : ''), [x.suffix, x.note, x.word].filter(Boolean).join(' · ')) + '>' + (vsA ? '<span></span>' : C.glyph(x.glyph || 'info')) + '<span>' + esc(bw < 420 && /^Spend/.test(x.label) ? 'Spend' : x.label) + '</span><span class="pmu-amtv">' + (vsA ? C.vs(x.vs, x.word) : '<b>' + esc(x.value) + '</b>' + (x.suffix ? ' <em>' + esc(x.suffix) + '</em>' : '')) + '</span></div>'; }).join('') +
          ((!n && a.amounts.length) ? '' : '<span class="pmu-accna">' + C.vs('not_exposed', word) + '</span>') + '</span>';
      } else if (cols) cells = a.windows.map(function (w) { return '<span class="pmu-acccell" data-win="' + esc(w.key) + '"' + C.shareAttr('win:' + a.key + '/' + w.key) + '></span>'; }).join('');
      else cells = '<span class="pmu-planmeters" style="grid-template-columns:repeat(' + perLine + ',minmax(0,1fr))">' + a.windows.map(function (w) { return '<span class="pmu-acccell" data-win="' + esc(w.key) + '"' + C.shareAttr('win:' + a.key + '/' + w.key) + '></span>'; }).join('') + '</span>';
      var sig = a.shownState + '|' + a.effective + '|' + a.windows.map(function (w) { return w.pct; }).join(',');
      return '<div class="pmu-row pmu-accrow pmu-planrow is-comfy' + (cols ? '' : ' is-stack') + (a.effective ? ' is-eff' : '') + '" data-reveal data-flash-key="' + esc(a.key) + '" data-flash-sig="' + esc(sig) + '" data-acct="' + esc(a.key) + '" data-state="' + a.shownState + '"' +
        ' data-pmu-act="acct-inspect" data-value="' + esc(a.key) + '" role="button" tabindex="0"' + (cols ? ' style="grid-template-columns:' + tmpl + ';column-gap:' + PGAP + 'px"' : '') + '>' +
        '<i class="pmu-acclight" aria-hidden="true"></i>' + ident + cells + '</div>';
    }).join('') + asLines.map(function (a) {
      /* the line's values in their tones; its hover tag says every window with its reset, and it opens the account's Details */
      var right = wordsR(a) ? '<span class="pmu-plword">' + esc(lineR(a)) + '</span>'
        : a.windows.map(function (w) { return '<span class="pmu-plwin">' + esc(wcode(w)) + ' ' + (w.pct === null ? '<em>' + esc(shortVs(w)) + '</em>' : '<b data-tone="' + esc(w.tone || 'calm') + '">' + esc(C.fmt(w.pct, 'pct')) + '</b>') + '</span>'; }).join('<i class="pmu-dot"> · </i>');
      var sig = a.shownState + '|' + a.effective + '|' + a.windows.map(function (w) { return w.pct; }).join(',');
      return '<div class="pmu-row pmu-accrow pmu-planline' + (lineOne(a) ? '' : ' is-two') + (a.effective ? ' is-eff' : '') + '" data-reveal data-flash-key="' + esc(a.key) + '" data-flash-sig="' + esc(sig) + '" data-acct="' + esc(a.key) + '" data-state="' + a.shownState + '"' +
        ' data-pmu-act="acct-inspect" data-value="' + esc(a.key) + '" role="button" tabindex="0"' + C.hover(p.name + ' · ' + a.nickname + (a.effective ? ' · Active' : ''), foldLine(a) + ' · ' + (a.fresh ? a.fresh.source + ' · ' : '') + C.sampledText(a.sampledAt) + ' · select for Details') + '>' +
        '<span class="pmu-accglyph">' + (a.stateGlyph ? C.glyph(a.stateGlyph) : '') + '</span><span class="pmu-plid"><b class="pmu-ident' + (a.effective ? ' is-eff' : '') + nameCls(a) + '"' + C.shareAttr('acct:' + a.key) + '>' + esc(a.nickname) + '</b>' +
        '<i class="pmu-dot"> · </i>' + stateHtmlP(a) + '</span><span class="pmu-plvals">' + right + '</span></div>';
    }).join('');
    var foldItems = folded.map(foldLine);
    /* the provider's plan facts in the room the rows leave (two columns where pairs fit), the rest counted in the head. The
       row estimates lean long so an account row is never cut; the facts and the foot take the room by the rows' likely
       height instead (each a little shorter), and the fit pass trims a fact or the foot that does not fit, exactly */
    var tight = 0; shown.forEach(function (a, i) { tight += Math.min(hs[i] - (cols ? 4 : 8), hs1[i]); }); asLines.forEach(function (a, i) { tight += lh[shownN + i]; });
    /* the foot's height from its wrapped words (one line 34 px, about 18 a line more: a 226 px plate wraps "+3 pts vs norm ·
       provider reported" to two lines, and a one-line estimate let it run past the body) */
    var footText = m.foot ? String(m.foot).replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ') : '';
    var footLinesN = footText ? Math.max(1, Math.min(4, C.wrapLines(footText, Math.max(80, bw - 26), 12.5))) : 1, footH = footLinesN > 1 ? 16 + 18 * footLinesN : 34;
    /* the foot only where every account shows (an account line comes before the foot's source words, which then go to the
       head count's hover tag: a 4x8 Claude plate kept a two-line foot over "3 more accounts") */
    var room = bh - bandH - tight - (folded.length ? MORE : 0) - 4, facts = (m.facts || []).slice(), footOk = m.foot && !folded.length && room >= footH + 4;
    if (footOk) room -= footH;
    var lay = facts.length ? C.factLayout(facts, bw) : null, fr = lay && !folded.length ? lay.fit(room) : { n: 0, used: 0 };
    var headItems = facts.slice(fr.n).map(C.factText).concat(m.foot && !footOk ? [String(m.foot).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim()] : []);
    C.headMore(ctx, body, headItems);
    body.innerHTML = '<div class="pmu-acc is-group pmu-planplate" data-mode="' + (!shownN ? 'lines' : cols ? 'full' : 'stack') + '"' + (folded.length || C.smallCard(ctx) || !headItems.length ? '' : C.foldHover(headItems)) + '>' + band + '<div class="pmu-accrows">' + rows + '</div>' +
      (folded.length ? C.more(folded.length, folded.length === 1 ? 'account' : 'accounts', bw < 320, foldItems) : '') + (fr.n ? lay.html(fr.n) : '') + '</div>' + (footOk ? C.foot(m.foot, m.footGlyph) : '');
    /* the facts give way before any account row (the engine's fit pass takes [data-fit-first] lines first, the last first),
       and the foot does where no fact shows (it names the source, so it stays while a fact can go instead). Without this
       a foot that ran 6 px past the body cost the plate its last account (Copilot at 1920, Basic Dark: 1 of 2 rows); what
       gives way joins the head count's hover tag */
    Array.prototype.forEach.call(body.querySelectorAll(fr.n ? '.pmu-planplate > .pmu-facts > .pmu-fact' : '.pmu-cardfoot'), function (el) { el.setAttribute('data-fit-first', ''); });
    if (headItems.length && !folded.length) body._pmuHeadFold = true;
    body._pmuPlanEst = { bh: bh, hs: hs.slice(0, shownN), hs1: hs1.slice(0, shownN), lh: lh.slice(shownN, shownN + lineN), tight: tight, room: room, footH: footOk ? footH : 0, facts: fr.n };   /* for probes */
    shown.forEach(function (a) {
      var row = body.querySelector('.pmu-planrow[data-acct="' + a.key + '"]');
      if (!row || !n || allHiddenP(a)) return;
      a.windows.forEach(function (w) {
        var h = row.querySelector('[data-win="' + w.key + '"]');
        var spec = C.meterSpec(w, { size: cols ? 'c' : 'k', effective: a.effective, prov: p.id, acct: a.id, stale: a.fresh.stale, age: a.ageText, hoverName: p.name + ' · ' + a.nickname });
        if (cols) spec.noLabel = true; else spec.label = w.short;
        C.chart(body, 'meter', h, spec, { label: a.nickname + ' ' + w.label });
      });
    });
  }

  /* ================================================================== limit: provider plan cards */
  /* model: planView + {facts, pace, foot, plan, requests, tokens} (defined in 70-rooms-a.js); a provider with two or more
     accounts renders the account rows plate (rowsPlate above) */
  C.kind('limit', {
    /* a rows plate whose "N more accounts" line sits over a free band renders once more with the band added (the engine's
       grow step, as list and agenda do); the fit pass then trims what the estimate let through, exactly */
    grow: function (body) { return !!(body && body.querySelector && body.querySelector('.pmu-planplate')); },
    render: function (body, ctx) {
      var m = ctx.model; if (!m) { body.innerHTML = C.empty('This provider is not in the selected scope.'); return; }
      if (m.provider && m.provider.accounts.length > 1 && ctx.tier.h !== 'h0') { rowsPlate(body, ctx, m); return; }
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
        /* a strip: the effective account's binding window; every account of the provider is in the hover tag and Details */
        var all = m.provider && m.provider.accounts.length > 1 ? m.provider.accounts : [];
        /* the strip's parts fit its lines (Retro and Glass at 6x3 ran the third line 11-13 px past the body): the reset gives
           way first, then the "N more accounts" count, then the nickname; each is in the hover tag and Details */
        var lk0 = PMU.theme.look(), kx = lk0.nier || lk0.family === 'retro' ? 1.14 : lk0.family === 'glass' ? 1.06 : 1;
        var lead = b ? esc(b.short) + ' <b>' + esc(b.pct === null ? PMU.roster.vsWord(b) : C.fmt(b.pct, 'pct')) + '</b>' + (b.pct === null ? '' : ' used') : esc('No plan windows');
        var parts = [{ k: 'nick', h: all.length && m.account ? esc(m.account.nickname) : '' }, { k: 'lead', h: lead }, { k: 'more', h: all.length > 1 ? esc(C.plural(all.length - 1, 'more account', 'more accounts')) : '' },
          { k: 'reset', h: b && b.pct !== null ? esc(PMU.fmt.resetLine(b).text) : '' }].filter(function (x) { return x.h; });
        /* the strip's body is about 10 px taller than its tier budget (measured on the VM: bh 34-36, body 44-46) */
        var maxL = Math.max(1, Math.floor((bh + 8) / 19.5)), stripText = function () { return parts.map(function (x) { return x.h.replace(/<[^>]+>/g, ''); }).join(' · '); };
        ['reset', 'more', 'nick'].forEach(function (drop) { if (C.wrapLines(stripText(), ctx.tier.bw / kx, 12.5) > maxL) parts = parts.filter(function (x) { return x.k !== drop; }); });
        body.innerHTML = '<div class="pmu-limit is-h0"' + C.foldHover(all.length ? all.map(foldLine) : b && b.pct !== null ? [b.label + ' ' + C.fmt(b.pct, 'pct') + ' used · ' + PMU.fmt.resetLine(b).text] : []) + '><span class="pmu-limitinline">' + parts.map(function (x) { return x.h; }).join(' · ') + '</span></div>';
        return;
      }
      /* a missing reading's word wraps beside its window code in a narrow meter (30-charts.css), 15 px a line more ("Limit
         not exposed" ran 14 px past a 157 px plate on a 487 px board) */
      var mhOf = function (w) { return w.pct === null ? mh + 15 * (Math.min(3, C.wrapLines(PMU.roster.vsWord(w), ctx.tier.bw - 48, 13, 520)) - 1) : mh; };
      var sumMh = function (ws) { return ws.reduce(function (s, w) { return s + mhOf(w); }, 0); };
      if (sumMh(wins) + footH > bh + 2) footH = 0;   /* every window stays visible before the foot does (R-PLAN-01) */
      var meterRoom = 0; while (meterRoom < wins.length && sumMh(wins.slice(0, meterRoom + 1)) <= bh - footH + 0.5) meterRoom++;
      meterRoom = Math.max(1, meterRoom);
      var shownWins = wins.slice(0, meterRoom), hiddenWins = wins.length - shownWins.length;
      var meters = '<div class="pmu-limitmeters">' + shownWins.map(function (w, i) { return '<div class="pmu-limitmeter" data-i="' + i + '"' + (m.account ? C.shareAttr('win:' + m.account.key + '/' + w.key) : '') + '></div>'; }).join('') +
        (hiddenWins ? '<div class="pmu-more"' + C.foldHover(wins.slice(shownWins.length).map(function (w) { return w.label + ' ' + (w.pct === null ? PMU.roster.vsWord(w) : C.fmt(w.pct, 'pct') + ' used · ' + PMU.fmt.resetLine(w).text); })) + '>' + esc(hiddenWins + ' more ' + (hiddenWins === 1 ? 'window' : 'windows') + ' at a larger size') + '</div>' : '') +
        (!wins.length ? '<div class="pmu-limitnone">' + C.vs('not_exposed', 'Quota not exposed') + '</div>' : '') + '</div>';
      /* the meters block: 44 px meters 8 px apart (measured), its own "N more windows" line (21 + 4) */
      var used = Math.max(0, sumMh(shownWins) - 8) + (hiddenWins ? 25 : 0) + (wins.length ? 0 : 30 + 17 * (Math.min(3, C.wrapLines('Quota not exposed', ctx.tier.bw - 18, 12.5, 520)) - 1));
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
        C.chart(body, 'meter', body.querySelector('.pmu-limitmeter[data-i="' + i + '"]'), C.meterSpec(w, { size: w.pct === null ? 'k' : size, effective: true, prov: m.settingsId, acct: m.account ? m.account.id : null, stale: m.account && m.account.fresh.stale, age: m.account ? m.account.ageText : '', hoverName: m.name }),
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
      /* (lane c-presets) a narrow card (the 180-200 px Compact) keeps a smaller ring beside the state and the number and runs
         the route line under them at the card's full width: beside the ring it wrapped a word a line and ran past the card */
      var provBelow = !!ringPx && bw - ringPx - 16 < 110;
      if (provBelow) ringPx = Math.max(56, Math.min(ringPx, bw - 16 - 80));
      var cap = capOf(m);
      var capHtml = cap.vs ? '<span class="pmu-freecapvs">' + C.vs(cap.vs, cap.word) + '</span>'
        : cap.value != null ? C.valHtml(cap.value, 'int', 'pmu-freecap', ctx.id + ':cap').replace('class="pmu-num"', 'class="pmu-num" data-count="kpi"') + '<span class="pmu-freecapu">' + esc(cap.unit) + '</span>'
        : '<b class="pmu-freecap"><span class="pmu-num">' + esc(cap.text) + '</span></b><span class="pmu-freecapu">' + esc(cap.unit) + '</span>';
      var head = '<div class="pmu-freehero' + (ringPx ? '' : ' no-ring') + '">' + (ringPx ? '<div class="pmu-freering" style="width:' + ringPx + 'px;height:' + ringPx + 'px"></div>' : '') +
        '<div class="pmu-freetop"><span class="pmu-freestate" data-tone="' + m.stateTone + '">' + C.glyph(m.stateGlyph) + esc(m.state) + '</span>' +
        '<span class="pmu-freecapline"' + C.hover('Capacity', m.capacitySource) + '>' + capHtml + '</span>' +
        (provBelow ? '' : '<span class="pmu-freeprov">' + esc(m.provider) + '</span>') + '</div></div>' +
        (provBelow ? '<span class="pmu-freeprov is-below">' + esc(m.provider) + '</span>' : '');
      /* the hero's height from its wrapped words beside the ring (the state line wrapped to four lines in a 102 px column
         and the facts were placed under an 87 px estimate of a 188 px hero) */
      var topW = Math.max(60, ringPx ? bw - ringPx - 16 : bw);
      var capH = cap.vs ? 20 * C.wrapLines(cap.word, topW - 22, 14, 560) : 29 + (cap.value != null && C.wrapW(String(cap.value), 28, 640) + 8 + C.wrapW(cap.unit || '', 12.5) > topW ? 18 : 0);
      var topH = 20 * C.wrapLines(m.state, topW - 22, 14, 640) + 4 + capH + (provBelow ? 0 : 4 + 17 * C.wrapLines(m.provider, topW, 12));
      var headH = Math.max(ringPx, topH) + 6 + 6 + (provBelow ? 17 * C.wrapLines(m.provider, bw, 12) + 6 : 0);
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
