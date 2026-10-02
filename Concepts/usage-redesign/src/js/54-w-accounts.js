/* Accounts kinds and actions (owner: content; DESIGN-SPEC 10, DESIGN-SPEC-ATLAS 10, ARCHITECTURE.md 4.11 and 6):
   provider (one account: the single plate; two or more: the provider plate with aligned window columns), switch (the
   bound auto-switch strip), providers (compact rows for providers not set up), setup (the canon "Provider Setup
   Required" card). Who exists comes from Settings (PMU.roster), and every control writes through the Settings owner:
   the toggle and the switch level through PMU.settings.set (setSettingFromHost), "Use this account" through
   cmd.account.select_profile plus the Settings action "Use for the next run". */
(function () {
  var C = PMU.content, st = PMU.core.state, b = C.b;
  var LEVELS = [5, 10, 15, 20, 25, 30];   /* % left choices (B v2 10.8): 95 % used .. 70 % used */

  /* ------------------------------------------------------------------ pieces */
  function stateHtml(a, opts) {
    opts = opts || {};
    return '<span class="pmu-acstate" data-state="' + a.shownState + '" data-tone="' + a.stateTone + '">' + (opts.glyph !== false && a.stateGlyph ? C.glyph(a.stateGlyph) : '') + '<b>' + esc(a.stateWord) + '</b></span>';
  }
  function metaLine(a, parts) {
    var bits = [stateHtml(a, { glyph: false })];
    (parts || ['plan', 'host', 'age']).forEach(function (p) {
      if (p === 'plan' && a.plan) bits.push(esc(a.plan));
      if (p === 'host' && a.host) bits.push(esc(a.host));
      if (p === 'age') bits.push(a.fresh.stale ? '<span class="pmu-stale">' + C.glyph('clockCircle') + esc(a.ageText) + '</span>' : esc(a.ageText));
      if (p === 'nick') bits.push(esc(a.nickname));
      if (p === 'identity' && a.identity) bits.push(esc(a.identity));
    });
    return bits.join('<i class="pmu-dot"> · </i>');
  }
  function amountLines(a, max, narrow) {
    return (a.amounts || []).slice(0, max == null ? 9 : max).map(function (x) {
      var vsA = x.vs && x.vs !== 'ok', label = narrow && /^Spend/.test(x.label) ? 'Spend' : x.label;
      var val = vsA ? C.vs(x.vs, x.word) : '<b>' + esc(x.value) + '</b>' + (x.suffix ? (narrow ? '<em class="pmu-amtline2">' + esc(x.suffix) + '</em>' : ' <em>' + esc(x.suffix) + '</em>') : '');
      return '<div class="pmu-amount pmu-amt"' + C.hover(x.label + (x.value ? ' ' + x.value : ''), [x.suffix, x.note].filter(Boolean).join(' · ')) + '>' + (vsA ? '<span></span>' : C.glyph(x.glyph || 'info')) + '<span>' + esc(label) + '</span><span class="pmu-amtv">' + val + '</span></div>' +
'';
    }).join('');
  }
  function useBtn(a, full) {
    if (a.effective && (a.shownState === 'active' || a.override)) return '<span class="pmu-accact is-active">' + esc(a.override ? 'Active · override' : 'Active') + '</span>';
    if (a.state === 'signed-out') return '<button type="button" class="pmu-textbtn pmu-accbtn" data-pmu-act="acct-settings" data-value="' + esc(a.key) + '"' + C.hover('Sign in', 'Sign in again from Settings > Providers & Accounts') + '>Sign in</button>';
    if (a.state === 'needs-seat') return '<button type="button" class="pmu-textbtn pmu-accbtn" data-pmu-act="acct-settings" data-value="' + esc(a.key) + '"' + C.hover('Set up', 'Choose a plan in Settings > Providers & Accounts') + '>Set up</button>';
    if (!a.supportsManual) return '';
    var label = full ? t('accounts.use_override') : 'Use';
    return '<button type="button" class="pmu-textbtn pmu-accbtn pmu-usebtn" data-pmu-act="acct-use" data-value="' + esc(a.key) + '"' + (a.eligible.ok ? '' : ' disabled') +
      C.hover(t('accounts.use_override') + ' · next run', a.eligible.ok ? 'Dispatches cmd.account.select_profile and sets "Use for the next run" in Settings' : a.eligible.reason) + '>' + esc(label) + '</button>';
  }
  function meterOpts(a, p, size, w, narrow, noReset) {
    var m = C.meterSpec(w, { size: size, effective: a.effective, prov: p.id, stale: a.fresh.stale, age: a.ageText, hoverName: p.name + ' · ' + a.nickname });
    if (noReset && w.pct !== null) { m.hover = { label: p.name + ' · ' + a.nickname + ' · ' + w.label, detail: C.fmt(w.pct, 'pct') + ' used · ' + C.fmt(100 - w.pct, 'pct') + ' left · ' + m.resetText + (w.amount ? ' · ' + w.amount : '') + ' · ' + m.source }; m.resetText = ''; }
    if (narrow && w.pct === null) m.vsWord = { not_exposed: 'Not exposed', unknown: 'Unknown', disabled: 'Disabled' }[m.vs] || m.vsWord;
    return m;
  }
  function fallbackSentence(p) {
    var ex = p.exhausted[0];
    if (!ex) return '';
    var others = p.accounts.filter(function (a) { return a !== ex && (a.state === 'active' || a.state === 'standby') && a.binding && a.binding.left > 0; });
    return others.length ? t('accounts.exhausted_fallback', { name: ex.nickname }) : ex.nickname + ': Usage exhausted. No other eligible account has room until a reset.';
  }
  function mostRoom(p) {
    var c = p.accounts.filter(function (a) { return (a.state === 'active' || a.state === 'standby') && a.binding; }).sort(function (x, y) { return y.binding.left - x.binding.left; })[0];
    return c ? { account: c, left: c.binding.left, text: c.nickname + ' ' + Math.round(c.binding.left) + '% left' + (c.fresh.stale ? ' (' + c.ageText + ')' : '') } : null;
  }
  C.mostRoom = mostRoom;
  function switchEvents(p, n) {
    return PMU.roster.read().switchLog.filter(function (e) { return e.providerId === p.id; }).slice(0, n || 2);
  }
  function whenText(ms) {
    var d = PMU.fmt.dayHead(ms);
    return (d.offset === 0 ? '' : d.label === 'Yesterday' ? 'Yesterday ' : PMU.fmt.day(ms) + ' ') + PMU.fmt.clock(ms);
  }

  /* ================================================================== provider: group plate (A1 10.1) and single plate (A1 10.2) */
  /* every meter of a plate is recorded with its spec (C.recMeter); a Settings change patches the plate in place (C.patch) */
  function meter(body, key, host, spec, opts) { C.recMeter(body, key, host, spec, opts); }
  function sealPlate(body) { C.seal(body, '.pmu-acc', '.pmu-accfoot, .pmu-accsfoot'); }
  function renderPlate(body, ctx, p) {
    body._pmuMeterRecs = []; body._pmuSig = null;
    if (p.accounts.length > 1) group(body, ctx, p); else single(body, ctx, p, p.accounts[0]);
  }
  C.kind('provider', {
    render: function (body, ctx) {
      var p = PMU.roster.provider(ctx.id.replace(/^acct-/, ''));
      if (!p || !p.accounts.length) { body._pmuSig = null; body.innerHTML = C.empty('No account is set up for this provider.', 'Set one up in Settings > AI > Providers & Accounts'); return; }
      renderPlate(body, ctx, p);
    },
    update: function (body, ctx) {
      var p = PMU.roster.provider(ctx.id.replace(/^acct-/, ''));
      if (!p || !p.accounts.length) return false;
      return C.patch(body, function (dry) { renderPlate(dry, ctx, p); }, '.pmu-accfoot, .pmu-accsfoot');
    }
  });

  /* the action word of a row, for the action column's width: Use / Sign in / Set up / Active / Active · override */
  function actText(a, full) {
    if (a.effective && (a.shownState === 'active' || a.override)) return { t: a.override ? 'Active · override' : 'Active', btn: false };
    if (a.state === 'signed-out') return { t: 'Sign in', btn: true };
    if (a.state === 'needs-seat') return { t: 'Set up', btn: true };
    if (!a.supportsManual) return { t: '', btn: false };
    return { t: full ? t('accounts.use_override') : 'Use', btn: true };
  }
  function tw(s, px, wt) { return PMU.charts && PMU.charts.textW ? PMU.charts.textW(s, px, false, wt) : String(s).length * px * 0.55; }
  /* a row whose every window reads "not exposed" (an API key on a plan provider) says so once, across the window
     columns, with its spend beside it (LOOK-REVIEW-2 6: "Quota not exposed" printed twice into each other) */
  function allHidden(a) { return a.windows.length > 0 && a.windows.every(function (w) { return w.pct === null && (w.vs === 'not_exposed' || w.vs === 'disabled'); }); }

  /* the provider plate with aligned window columns (A1 10.1). The action column stays at every width (LOOK-REVIEW-2 5:
     at M the plates folded it into the identity meta, where Use and Sign in were clipped): the window columns give way
     first (every window, then the binding window, then the binding window under the identity on a narrow plate). Each
     state is said once (LOOK-REVIEW-2 16): the effective row's "Active" lives in the action column, so its meta line
     shows the plan. */
  function group(body, ctx, p) {
    var bw = ctx.tier.bw, n = p.windows.length, GAP = 16;
    var bh = ctx.tier.bh;
    var acts = p.accounts.map(function (a) { return actText(a, false); });
    var actW = Math.ceil(Math.max(48, Math.max.apply(null, acts.map(function (x) { return x.t ? tw(x.t, 12.5, x.btn ? 600 : 640) + (x.btn ? 22 : 2) : 0; }))));
    var fullAct = n && bw >= 150 + n * 112 + 176 + GAP * (n + 1);
    if (fullAct) actW = Math.ceil(Math.max(actW, Math.max.apply(null, p.accounts.map(function (a) { var x = actText(a, true); return x.t ? tw(x.t, 12.5, 600) + (x.btn ? 22 : 2) : 0; }))));
    /* a window column keeps "78% used" and "resets in 1h 41m" on one line each from about 104 px */
    var IDENT = 112, WIN = 104;
    var mode = !n ? 'none' : bw >= IDENT + n * WIN + actW + GAP * (n + 1) ? 'full' : bw >= 100 + WIN + actW + GAP * 2 ? 'binding' : 'narrow';
    var winTmpl = mode === 'full' ? p.windows.map(function () { return 'minmax(' + WIN + 'px,1fr)'; }).join(' ') : mode === 'binding' ? 'minmax(' + WIN + 'px,1fr)' : '';
    var tmpl = mode === 'none' ? 'minmax(0,1.3fr) minmax(0,1fr) ' + actW + 'px'
      : mode === 'narrow' ? 'minmax(0,1fr) ' + actW + 'px'
      : 'minmax(' + (mode === 'full' ? IDENT : 100) + 'px,1.5fr) ' + winTmpl + ' ' + actW + 'px';
    var band = !n || mode === 'narrow' ? '' : '<div class="pmu-colhead pmu-accband" style="grid-template-columns:' + tmpl + '"><span class="pmu-cap">ACCOUNT</span>' +
      (mode === 'binding' ? '<span class="pmu-cap">BINDING WINDOW</span>' : p.windows.map(function (w) { return '<span class="pmu-cap">' + esc(w.label.replace(/ window$/i, '').toUpperCase()) + '</span>'; }).join('')) +
      '<span></span></div>';
    /* foot copy (R-ACCT-10), most room, Codex: auto-switch state and the last two switch events */
    var th = PMU.roster.thresholds(), footLines = [];
    var fb = fallbackSentence(p); if (fb) footLines.push({ glyph: 'alert', tone: 'warn', html: esc(fb) });
    var mr = mostRoom(p); if (mr && p.windows.length) footLines.push({ glyph: 'info', html: esc(t('accounts.most_room', { name: mr.account.nickname, left: Math.round(mr.left) + '%' })) + (mr.account.fresh.stale ? ' <em>(' + esc(mr.account.ageText) + ')</em>' : '') });
    var evs = switchEvents(p, 2);
    if (!fb && evs.length) footLines.push({ glyph: 'refresh', html: esc((th.auto ? 'Auto-switch on' : 'Auto-switch off') + ' · ' + evs.map(function (e) { return whenText(e.at) + ' ' + e.text; }).join(' · ')) });
    var bandH = band ? 26 : 0, rowsN = p.accounts.length;
    /* the grid's own share of the width (fr columns above their minimums), for the wrap-aware row heights */
    var free = bw - actW - GAP * ((mode === 'full' ? n : mode === 'narrow' ? 0 : 1) + 1);
    var identW = mode === 'narrow' ? bw - actW - GAP : mode === 'none' ? free * 1.3 / 2.3 : mode === 'binding' ? Math.max(100, free * 1.5 / 2.5) : Math.max(IDENT, free * 1.5 / (1.5 + n));
    var winW = mode === 'full' ? Math.max(WIN, (free - identW) / n) : mode === 'binding' ? Math.max(WIN, free - identW) : mode === 'narrow' ? bw : free - identW;
    if (mode === 'full' && (free - n * WIN) < identW) { identW = Math.max(IDENT, free - n * WIN); winW = WIN; }
    var footHOf = function (k) { if (!k) return 0; var h = 10; footLines.slice(0, k).forEach(function (l) { h += 19 * Math.min(3, C.wrapLines(l.html, bw - 26, 12.5)); }); return h; };
    var textW = identW - 24;
    var metaOf = function (a) {
      var act = actText(a, false), stateIn = act.t && !act.btn, longState = String(a.stateWord || '').length > 12;
      var l1 = stateIn ? a.plan || '' : longState ? a.stateWord : [a.stateWord, a.plan].filter(Boolean).join(' · ');
      /* a stale age carries its clock glyph (about one capital's width) */
      var l2 = [!stateIn && longState ? a.plan : '', a.host, (a.fresh && a.fresh.stale ? 'M ' : '') + a.ageText].filter(Boolean).join(' · ');
      return { l1: l1, l2: l2 };
    };
    /* a comfortable row: the name, the state or plan, the host and age, and a credits line (or a merged "not exposed"
       cell with its spend); a narrow plate puts the binding meter under the identity. Each line's height comes from
       its own wrapped text (a fixed 66 px row let a wrapped meta line run under the plate's foot) */
    var comfyHOf = function (a) {
      var mt = metaOf(a);
      var ih = 18 * C.wrapLines(a.nickname, textW, 13.5, 600) + 16 * (C.wrapLines(mt.l1, textW, 12, actText(a, false).t && !actText(a, false).btn ? 400 : 600) + C.wrapLines(mt.l2, textW, 12)) +
        (a.amounts.length && !allHidden(a) && n ? 16 * C.wrapLines(a.amounts[0].label + ' ' + (a.amounts[0].value || a.amounts[0].word) + ' ' + (a.amounts[0].suffix || ''), textW, 12) : 0);
      var mh = 0;
      if (n && !allHidden(a)) (mode === 'full' ? a.windows : [a.binding || a.windows[0]]).forEach(function (w) {
        if (!w) return;
        var rt = w.pct === null ? '' : PMU.fmt.resetLine(w).text;
        mh = Math.max(mh, 22 + 12 + (rt ? 16 * C.wrapLines(rt, winW, 12) : 0));
      });
      if (!n || allHidden(a)) mh = 22 * Math.min(3, a.amounts.length + 1);
      var h = mode === 'narrow' ? ih + 6 + mh : Math.max(ih, mh);
      return Math.max(66, Math.ceil(h + 20));
    };
    /* a compact row's one meta line (the state word, or the plan beside "Active") wraps rather than run under the
       window cell beside it ("Cooldown until 08:33" over "Not exposed", Mac stills 2026-10-02) */
    var compactHOf = function (a) {
      var act = actText(a, false), stateIn = act.t && !act.btn;
      var lines = Math.min(3, C.wrapLines(stateIn ? a.plan || '' : a.stateWord || '', textW, 12, stateIn ? 400 : 600) || 1);
      return (mode === 'narrow' ? 92 : 44) + 16 * (lines - 1);
    };
    var sumRows = function (f, k) { var s = 0; p.accounts.slice(0, k).forEach(function (a) { s += f(a); }); return s; };
    /* priority: every account in comfortable rows; then fewer foot lines; then compact rows; then fewer rows */
    var footCap = Math.min(footLines.length, C.w(ctx, 'm') ? 3 : 2), comfy = false;
    for (var k = footCap; k >= 0 && !comfy; k--) { if (bandH + sumRows(comfyHOf, rowsN) + footHOf(k) <= bh + 10) { comfy = true; footCap = k; } }
    if (!comfy) footCap = Math.min(footLines.length, 1);
    var rowHOf = comfy ? comfyHOf : compactHOf;
    var shownN = rowsN;
    while (shownN > 1 && bandH + sumRows(rowHOf, shownN) + footHOf(footCap) + (shownN < rowsN ? 22 : 0) > bh + 10) shownN -= 1;
    if (shownN < rowsN && footCap > 1) footCap = 1;
    var shown = p.accounts.slice(0, shownN);
    var size = comfy ? 'c' : 'k';
    var rows = shown.map(function (a) {
      var hidden = allHidden(a), act = actText(a, fullAct);
      /* the effective row's state is in the action column; its meta line shows the plan */
      var stateInAct = act.t && !act.btn;
      var longState = String(a.stateWord || '').length > 12;
      var line1 = stateInAct ? (a.plan ? esc(a.plan) : '') : longState ? metaLine(a, []) : metaLine(a, ['plan']);
      var line2 = [!stateInAct && longState && a.plan ? esc(a.plan) : '', a.host ? esc(a.host) : '', a.fresh.stale ? '<span class="pmu-stale">' + C.glyph('clockCircle') + esc(a.ageText) + '</span>' : esc(a.ageText)].filter(Boolean).join('<i class="pmu-dot"> · </i>');
      var amountsLine = a.amounts.length && !hidden && n ? '<span class="pmu-amounts">' + a.amounts.slice(0, 1).map(function (x) { return esc(x.label) + ' <b>' + esc(x.value || x.word) + '</b>' + (x.suffix ? ' ' + esc(x.suffix) : ''); }).join('') + '</span>' : '';
      var ident = '<span class="pmu-accid"><span class="pmu-accglyph">' + (a.stateGlyph ? C.glyph(a.stateGlyph) : '') + '</span>' +
        '<span class="pmu-acctext"><b class="pmu-ident' + (a.effective ? ' is-eff' : p.effective ? ' is-other' : '') + '">' + esc(a.nickname) + '</b>' +
        (comfy ? (line1 ? '<span class="pmu-identmeta">' + line1 + '</span>' : '') + '<span class="pmu-identmeta is-2">' + line2 + '</span>' + amountsLine
          : '<span class="pmu-identmeta">' + (stateInAct ? esc(a.plan || '') : stateHtml(a, { glyph: false })) + '</span>') + '</span></span>';
      var cells;
      if (!n || hidden) {
        var word = !n ? a.noWindowsWord || 'Quota not exposed' : (a.windows[0].note && /limit/.test(a.windows[0].note) ? 'Limit not exposed' : 'Quota not exposed');
        cells = ['<span class="pmu-acccell is-merged"' + (mode === 'full' && n > 1 ? ' style="grid-column:span ' + n + '"' : '') + '>' + (a.amounts.length ? amountLines(a, 2, bw < 420) : '') +
          (!n && a.amounts.length ? '' : '<span class="pmu-accna">' + C.vs('not_exposed', word) + '</span>') + '</span>'];
      } else if (mode === 'full') cells = p.windows.map(function (w) { return '<span class="pmu-acccell" data-win="' + esc(w.key) + '"></span>'; });
      else cells = ['<span class="pmu-acccell" data-win="binding"></span>'];
      var actCell = '<span class="pmu-accactcell">' + useBtn(a, fullAct) + '</span>';
      var sig = a.shownState + '|' + a.effective + '|' + a.windows.map(function (w) { return w.pct; }).join(',');
      var parts = mode === 'narrow' ? ident + actCell + cells.join('') : ident + cells.join('') + actCell;
      return '<div class="pmu-row pmu-accrow' + (comfy ? ' is-comfy' : ' is-compact') + (a.effective ? ' is-eff' : '') + '" data-reveal data-flash-key="' + esc(a.key) + '" data-flash-sig="' + esc(sig) + '" data-acct="' + esc(a.key) + '" data-state="' + a.shownState + '" data-pmu-act="acct-inspect" data-value="' + esc(a.key) + '" role="button" tabindex="0"' +
        ' style="grid-template-columns:' + tmpl + '"' + C.hover(a.nickname, a.identity + (a.routeRole ? ' · ' + a.routeRole : '') + ' · priority ' + a.priority) + '>' + parts + '</div>';
    }).join('');
    var foot = footLines.slice(0, footCap).map(function (l) { return '<span class="pmu-accfootline" data-fit-first' + (l.tone ? ' data-tone="' + l.tone + '"' : '') + '>' + C.glyph(l.glyph) + '<span>' + l.html + '</span></span>'; }).join('');
    body.innerHTML = '<div class="pmu-acc is-group" data-mode="' + mode + '">' + band + '<div class="pmu-accrows">' + rows + '</div>' + C.more(rowsN - shown.length, rowsN - shown.length === 1 ? 'account' : 'accounts') + '</div>' +
      (foot ? '<div class="pmu-cardfoot pmu-accfoot">' + foot + '</div>' : '');
    shown.forEach(function (a) {
      var row = body.querySelector('.pmu-accrow[data-acct="' + a.key + '"]');
      if (!row || allHidden(a) || !n) return;
      if (mode !== 'full') {
        var b = a.binding || a.windows[0];
        var host = row.querySelector('[data-win="binding"]');
        if (b) meter(body, a.key + '|binding', host, Object.assign(meterOpts(a, p, size, b, true, !comfy), { label: b.short }), { label: a.nickname + ' ' + b.label });
        return;
      }
      a.windows.forEach(function (w) {
        var h = row.querySelector('[data-win="' + w.key + '"]');
        /* a window column names its window in the column head, so a missing reading says "Not exposed" at every width
           (NieR Light at 1440: "Quota not exposed" ran into the next column's "17%") */
        meter(body, a.key + '|' + w.key, h, Object.assign(meterOpts(a, p, size, w, true, !comfy), { noLabel: true }), { label: a.nickname + ' ' + w.label });
      });
    });
    sealPlate(body);
  }

  function single(body, ctx, p, a) {
    /* measured meter heights (Mac, Basic): inline 52 px, compact 44 px; 2 px of slack each */
    var bh = ctx.tier.bh, size = ctx.tier.bw >= 220 ? 'i' : 'k', mh = size === 'i' ? 54 : 46;
    var big = C.w(ctx, 'l') && C.h(ctx, 'h3');
    var footH = 30;
    if (ctx.tier.h === 'h0') {
      var b = a.binding;
      body.innerHTML = '<div class="pmu-acc is-single is-h0"><span class="pmu-limitinline">' + stateHtml(a) + (b ? ' · ' + esc(b.short) + ' <b>' + esc(C.fmt(b.pct, 'pct')) + '</b> used' : '') + '</span></div>';
      return;
    }
    var blocks = [];
    var spend = a.amounts.filter(function (x) { return x.label && /spend/i.test(x.label); })[0];
    var wins = (p.windows.length ? a.windows : []).filter(function (w) { return !(w.pct === null && spend); });
    if (spend && p.windows.length && wins.length < a.windows.length) {
      var gone = a.windows.filter(function (w) { return w.pct === null; })[0];
      spend = Object.assign({}, spend, { suffix: (spend.suffix ? spend.suffix + ' · ' : '') + (gone.note || 'limit not exposed') });
      a = Object.assign({}, a, { amounts: a.amounts.map(function (x) { return x.label === spend.label ? spend : x; }) });
    }
    wins.forEach(function (w, i) { blocks.push({ h: mh, html: '<div class="pmu-accmeter" data-win="' + esc(w.key) + '"></div>', win: w }); });
    if (!p.windows.length && (a.noWindowsWord || !a.amounts.length)) blocks.push({ h: 58, html: '<div class="pmu-accmeter is-na"><div class="pmu-natrack"></div>' + C.vs('not_exposed', a.noWindowsWord ? a.noWindowsWord.charAt(0).toUpperCase() + a.noWindowsWord.slice(1) : 'Quota not exposed') + '</div>' });
    a.amounts.forEach(function (x) { var nar = ctx.tier.bw < 260; blocks.push({ h: x.suffix && nar ? 50 : 32, html: amountLines({ amounts: [x] }, 1, nar) }); });
    /* the plate's facts in priority order, each hidden whole when it does not fit (a tall plate shows them all instead
       of an empty band); a fact's height follows its wrapped label and value */
    [['Plan', a.planLine || a.plan], ['Route role', a.routeRole], ['Auth', a.auth], ['Source', a.fresh.source], ['Default', a.isDefault ? 'yes' : 'no']]
      .concat(a.legacy ? [['Billing', a.legacy.billing_basis], ['Entitlement', a.legacy.entitlement_class], ['Settlement', a.legacy.settlement_status]] : [])
      .forEach(function (f) { if (f[1]) blocks.push({ h: C.factH(f, ctx.tier.bw), html: C.facts([f]) }); });
    /* the single plate spaces its blocks 12 px apart (consecutive facts sit flush, separated by their hairline): the
       budget counts those gaps, so the last block never slides under the footer */
    var prevFact = false;
    blocks.forEach(function (b, i) { var isFact = !b.win && b.html.indexOf('pmu-facts') >= 0; b.h += i === 0 || (isFact && prevFact) ? 0 : 12; prevFact = isFact; });
    var res = C.stack(blocks, bh - footH - 8);
    var hiddenWins = res.hidden.filter(function (b) { return b.win; }).length;
    var foot = '<div class="pmu-accsfoot"><span class="pmu-sampled' + (a.fresh.stale ? ' is-stale' : '') + '">' + (a.fresh.stale ? C.glyph('clockCircle') : '') + esc(a.fresh.ageS === null ? 'no reading yet' : 'sampled ' + a.ageText.replace(/^cached /, '')) + '</span>' +
      (ctx.tier.bw < 200 && actText(a).btn ? '' : '<span class="pmu-host">' + esc(a.host || '') + '</span>') + (actText(a).btn ? useBtn(a, false) : '') + '</div>';
    body.innerHTML = '<div class="pmu-acc is-single" data-acct="' + esc(a.key) + '" data-state="' + a.shownState + '">' + res.html + (hiddenWins ? '<div class="pmu-more">' + esc(hiddenWins + ' more ' + (hiddenWins === 1 ? 'window' : 'windows') + ' at a larger size') + '</div>' : '') + '</div>' + foot;
    wins.forEach(function (w) {
      var h = body.querySelector('.pmu-accmeter[data-win="' + w.key + '"]');
      meter(body, a.key + '|' + w.key, h, Object.assign(meterOpts(a, p, size === 'i' && w.pct !== null ? 'i' : 'k', w, true), { label: w.label }), { label: p.name + ' ' + w.label });
    });
    sealPlate(body);
  }

  var FAM_SHORT = { 'claude-code': 'Claude', 'openai-codex': 'Codex', 'qwen-coding': 'Qwen', 'github-copilot': 'Copilot', 'kimi-coding': 'Kimi', 'gemini-direct': 'Gemini' };
  function famShort(p) { return FAM_SHORT[p.id] || p.name; }
  /* ================================================================== switch: the bound auto-switch strip (A1 10.3) */
  var switchImpl;
  C.kind('switch', switchImpl = {
    render: function (body, ctx) {
      var th = PMU.roster.thresholds(), ok = th.available;
      var used = 100 - th.switchLeft, warnUsed = 100 - th.warnLeft;
      var panel = ctx.tier.w === 'xs' || ctx.tier.w === 's' || (ctx.tier.bw < 470 && ctx.tier.bh >= 96);   /* the one-line controls need about 450 px */
      var dis = ok ? '' : ' disabled';
      var reason = ok ? '' : 'Settings is not available';
      var toggle = '<button type="button" class="pmu-toggle' + (th.auto ? ' on' : '') + '" role="switch" aria-checked="' + th.auto + '" data-pmu-act="auto"' + dis +
        C.hover('Auto-switch', reason || 'Shared with Settings > AI > Providers & Accounts (ai.accounts.multi-account-switching). ' + t('accounts.not_consent')) + '></button><span class="pmu-swlabel">Auto-switch</span>';
      var stepper = '<span class="pmu-swat">at</span><span class="pmu-stepper"' + C.hover('Switch level', reason || 'ai.accounts.hard-switch-level: switch at ' + used + '% used (' + th.switchLeft + '% left)') + '>' +
        '<button type="button" data-pmu-act="sw-step" data-value="1" aria-label="Switch earlier"' + (ok && th.switchLeft < 30 ? '' : ' disabled') + '>' + SVG.minus + '</button>' +
        '<button type="button" class="pmu-stepval" data-pmu-act="sw-pick" aria-haspopup="menu"' + dis + '>' + used + '%</button>' +
        '<button type="button" data-pmu-act="sw-step" data-value="-1" aria-label="Switch later"' + (ok && th.switchLeft > 5 ? '' : ' disabled') + '>' + SVG.plus + '</button></span><span class="pmu-swat">used</span>';
      var warn = '<span class="pmu-swwarn"' + C.hover('Warn level', 'ai.accounts.soft-warning-level: warn at ' + warnUsed + '% used (' + th.warnLeft + '% left)') + '>Warn at <b>' + warnUsed + '%</b> used</span>';
      var ro = PMU.roster.read();
      var fams = ro.providers.filter(function (p) { return p.accounts.length > 1 && p.windows.length && PMU.data.settingsInScope(p.id); }).map(function (p) { return { p: p, mr: mostRoom(p) }; }).filter(function (x) { return x.mr; });
      var famHtml = function (x, i) {
        return '<span class="pmu-swfam" data-prov="' + esc(x.p.id) + '"' + C.hover(x.p.name + ' · most room now', x.mr.text + ' · ' + x.mr.account.binding.short + ' window') + '>' + PMU.mark(x.p.id, 16) +
          '<span class="pmu-swfamname">' + esc(famName(x.p)) + '</span><span class="pmu-swbar" data-i="' + i + '"></span></span>';
      };
      /* a family's Settings name where it fits (panel rows: 16 px mark, a bar of at least 44 px, two 6 px gaps), else
         its short word (final fix M8) */
      var famName = function (p) { return !panel || C.fitsW(p.name, ctx.tier.bw - 16 - 44 - 12, 13, 400) ? (panel ? p.name : famShort(p)) : famShort(p); };
      var ladder = ctx.tier.bw >= 420 && ctx.tier.bh >= 200 || (!panel && ctx.tier.bh >= 140 && ctx.tier.bw >= 560);
      if (ladder) { body.innerHTML = ladderHtml(ctx, th, toggle, stepper, warn); body._pmuSw = { form: 'ladder' }; return; }
      body._pmuSw = { form: panel ? 'panel' : 'strip' };
      if (panel) {
        /* toggle and level share a row from about 300 px; the MOST ROOM NOW caption shows only with at least one family */
        var joined = ctx.tier.bw >= 280, ctlRows = joined ? 2 : 3;
        var fit = C.fit(ctx.tier.bh, 30, ctlRows * 34 + 22);
        body.innerHTML = '<div class="pmu-switch is-panel">' + (joined ? '<div class="pmu-swrow">' + toggle + stepper + '</div>' : '<div class="pmu-swrow">' + toggle + '</div><div class="pmu-swrow">' + stepper + '</div>') + '<div class="pmu-swrow">' + warn + '</div>' +
          (fams.length && fit ? '<div class="pmu-cap pmu-swcap">MOST ROOM NOW</div>' + fams.slice(0, fit).map(famHtml).join('') : '') + '</div>';
      } else {
        /* two lines when the body has the height; on one line the families take what the controls (about 450 px) and
           the MOST ROOM NOW caption (about 110 px) leave, whole families only */
        var two = ctx.tier.bh >= 56;
        var avail = two ? ctx.tier.bw - 120 : ctx.tier.bw - 450 - 110, n = 0;
        fams.forEach(function (x) { var wpx = 150 + 7 * famShort(x.p).length; if (n === fams.indexOf(x) && avail - wpx >= 0) { avail -= wpx + 18; n += 1; } });
        if (two) n = fams.length;   /* two-line form: the families wrap; whole ones that do not fit are hidden by the fit pass */
        body.innerHTML = '<div class="pmu-switch' + (two ? ' is-two' : '') + '"><div class="pmu-swctl">' + toggle + stepper + warn + '</div>' +
          (fams.length && n ? '<div class="pmu-swfams"><span class="pmu-cap">MOST ROOM NOW</span>' + fams.slice(0, n).map(famHtml).join('') + '</div>' : '') + '</div>';
      }
      body._pmuSwCharts = [];
      fams.forEach(function (x, i) {
        var h = body.querySelector('.pmu-swbar[data-i="' + i + '"]');
        var spec = { pct: x.mr.left, tone: x.mr.account.binding.tone, label: x.p.name, hover: { label: x.p.name + ' · most room now', detail: x.mr.text + ' · ' + x.mr.account.binding.short + ' window' } };
        if (h) body._pmuSwCharts.push({ spec: spec, chart: body._pmuDry ? null : C.chart(body, 'headroom', h, spec, { label: x.p.name + ' headroom' }) });
      });
    },
    enter: function (body, ctx, delay) { if (body.querySelector('.pmu-ladder')) enterLadder(body, ctx, delay); else C.enterAll(body, ctx, delay || 0); },
    /* the toggle and the switch level are patched in place (WOW-SPEC 3.9, WOW-TASKS N-3): the knob slides on its own
       CSS transition, the level rolls (odometer 220), the switch line slides 320 ms, words cross-fade; the room is never
       rendered again for them */
    update: function (body, ctx) {
      var live = body.querySelector('.pmu-switch, .pmu-ladder'); if (!live || !body._pmuSw) return false;
      var dry = document.createElement('div'); dry._pmuDry = true;
      try { switchImpl.render(dry, ctx); } catch (error) { return false; }
      var norm = function (root) {
        var c = root.cloneNode(true);
        Array.prototype.forEach.call(c.querySelectorAll('[data-pmu-chart]'), function (el) { el.remove(); });
        Array.prototype.forEach.call(c.querySelectorAll('.pmu-stepval, .pmu-swwarn b, .pmu-herosub, .pmu-heronum, .pmu-ladval'), function (el) { el.textContent = ''; });
        /* the app's hover-tag controller adds its own attributes to live nodes (data-pm-hover-*, aria-describedby) */
        return c.innerHTML.replace(/ (?:aria-checked|aria-label|aria-describedby|data-pm-hover-[a-z-]+|style|data-tone|data-off|disabled)(?:="[^"]*")?/g, '').replace(/ on"/g, '"');
      };
      var next = dry.querySelector('.pmu-switch, .pmu-ladder');
      if (!next || (dry._pmuSw || {}).form !== body._pmuSw.form || norm(next) !== norm(live)) { body._pmuPatchMiss = next ? [norm(live), norm(next)] : null; return false; }
      var f = PMU.motion.family ? PMU.motion.family() : 'basic', st = f === 'retro' || f === 'nier';
      /* toggle */
      var t0 = live.querySelector('.pmu-toggle'), t1 = next.querySelector('.pmu-toggle');
      if (t0 && t1) { t0.classList.toggle('on', t1.classList.contains('on')); t0.setAttribute('aria-checked', t1.getAttribute('aria-checked')); copyHover(t1, t0); }
      /* the level: its digits roll */
      var v0 = live.querySelector('.pmu-stepval'), v1 = next.querySelector('.pmu-stepval');
      if (v0 && v1 && v0.textContent !== v1.textContent) {
        var from = parseFloat(v0.textContent), to = parseFloat(v1.textContent);
        if (PMU.film && PMU.film.odometer && isFinite(from) && isFinite(to)) PMU.film.odometer(v0, to, function (v) { return Math.round(v) + '%'; }, { from: from, change: true, dur: 220 });
        else v0.textContent = v1.textContent;
      }
      Array.prototype.forEach.call(next.querySelectorAll('[data-pmu-act="sw-step"]'), function (bt, i) { var lb = live.querySelectorAll('[data-pmu-act="sw-step"]')[i]; if (lb) lb.disabled = bt.disabled; });
      var st0 = live.querySelector('.pmu-stepper'), st1 = next.querySelector('.pmu-stepper'); if (st0 && st1) copyHover(st1, st0);
      /* words cross-fade */
      ['.pmu-swwarn', '.pmu-herosub', '.pmu-herolabel'].forEach(function (sel) {
        var a0 = live.querySelector(sel), a1 = next.querySelector(sel);
        if (a0 && a1 && a0.innerHTML !== a1.innerHTML) { a0.innerHTML = a1.innerHTML; copyHover(a1, a0); PMU.motion.animate(a0, [{ opacity: 0.25 }, { opacity: 1 }], { dur: 160, easing: 'cubic-bezier(.22,.8,.28,1)' }); }
      });
      /* the ladder's switch line slides to the new level (or dims when auto-switch is off); rows take their new tone */
      var cols0 = live.querySelectorAll('.pmu-ladcol'), cols1 = next.querySelectorAll('.pmu-ladcol');
      Array.prototype.forEach.call(cols0, function (c0, i) {
        var c1 = cols1[i]; if (!c1) return;
        var ln = c0.querySelector('.pmu-ladline'), ln1 = c1.querySelector('.pmu-ladline');
        var a = parseFloat(c0.style.getPropertyValue('--swf')), z = parseFloat(c1.style.getPropertyValue('--swf'));
        if (ln && isFinite(a) && isFinite(z) && a !== z) {
          var tw = ln.parentNode.querySelector('.pmu-ladtrack'), px = tw ? (z - a) * tw.clientWidth : 0;
          c0.style.setProperty('--swf', String(z));
          PMU.motion.animate(ln, [{ transform: 'translateX(' + (-px).toFixed(1) + 'px)' }, { transform: 'none' }], { dur: st ? 160 : 320, easing: st ? 'steps(4,jump-start)' : 'cubic-bezier(.2,.8,.2,1)' });
        }
        if (ln && ln1 && ln.hasAttribute('data-off') !== ln1.hasAttribute('data-off')) {
          var off = ln1.hasAttribute('data-off');
          ln.toggleAttribute('data-off', off);
          PMU.motion.animate(ln, off ? [{ opacity: 1 }, { opacity: 0.25 }] : [{ opacity: 0.25 }, { opacity: 1 }], { dur: st ? 120 : 240, easing: st ? 'steps(3,jump-start)' : 'cubic-bezier(.2,.8,.2,1)' });
        }
        Array.prototype.forEach.call(c1.querySelectorAll('.pmu-ladrow'), function (r1, k) {
          var r0 = c0.querySelectorAll('.pmu-ladrow')[k]; if (!r0) return;
          if (r0.getAttribute('data-tone') !== r1.getAttribute('data-tone')) { r0.setAttribute('data-tone', r1.getAttribute('data-tone')); C.flashRow(r0); }
        });
      });
      (dry._pmuSwCharts || []).forEach(function (r, i) { var lc = (body._pmuSwCharts || [])[i]; if (lc && lc.chart) { lc.chart.update(r.spec); lc.spec = r.spec; } });
      return true;
    }
  });
  function copyHover(from, to) { ['data-pm-hover-label', 'data-pm-hover-detail'].forEach(function (a) { var v = from.getAttribute(a); if (v == null) to.removeAttribute(a); else to.setAttribute(a, v); }); }

  /* the Accounts hero (WOW-SPEC 4, LOOK-REVIEW-2 2): the auto-switch strip as a "most room now" ladder. Every account of
     the providers that switch between accounts, ordered by the room left in its binding window, against the switch line;
     the active accounts are lit; an account with no reading stays a word at the foot (missing is never zero). */
  C.ladderRows = function () {
    var rows = [], none = [];
    PMU.roster.read().providers.forEach(function (p) {
      if (p.accounts.length < 2 || !p.windows.length || !PMU.data.settingsInScope(p.id)) return;
      p.accounts.forEach(function (a) { if (a.binding) rows.push({ p: p, a: a, left: a.binding.left, w: a.binding }); else none.push({ p: p, a: a }); });
    });
    rows.sort(function (x, y) { return (y.left - x.left) || (x.a.priority - y.a.priority); });
    return { rows: rows, none: none };
  };
  function ladderHtml(ctx, th, toggle, stepper, warn) {
    var L = C.ladderRows(), rows = L.rows, bw = ctx.tier.bw, bh = ctx.tier.bh;
    /* a narrow card stacks the number and the controls above the ladder */
    var stacked = bw < 600, sideW = stacked ? bw : Math.min(300, Math.max(230, Math.round(bw * 0.3))), lw = stacked ? bw : bw - sideW - 28;
    /* the name column is as wide as its longest "name window" (measured in the theme's face: Retro's mono runs wider),
       so a row never cuts its name; two columns when both keep that column and a 48 px track */
    var dup = {}; rows.forEach(function (r) { dup[r.a.nickname] = (dup[r.a.nickname] || 0) + 1; });
    var winWordOf = function (r) { return ({ fiveHour: '5h', weekly: 'wk', monthly: 'mo' })[r.w.key] || r.w.short.toLowerCase(); };
    var nameCol = Math.ceil(Math.max(90, Math.max.apply(null, rows.map(function (r) {
      return (tw(r.a.nickname, 13, r.a.effective ? 680 : 540) + 6 + tw((dup[r.a.nickname] > 1 ? famShort(r.p) + ' ' : '') + winWordOf(r), 12, 400)) * 1.04 + 4;
    }).concat([0]))));
    var rowMin = 104 + nameCol + 48;
    /* the side column keeps "Auto-switch at [- 90% +] used" on one line where the two ladder columns still fit (Retro's
       mono pushed "used" to a line of its own) */
    var ctlW = Math.ceil(34 + C.wrapW('Auto-switch', 12.5, 540) + C.wrapW('at', 12.5) + 94 + C.wrapW('used', 12.5) + 4 * 7 + 4);
    if (!stacked && ctlW > sideW && ctlW <= 340 && bw - ctlW - 28 >= 2 * rowMin + 28) { sideW = ctlW; lw = bw - sideW - 28; }
    if (!stacked && lw < 2 * rowMin + 28 && lw >= 2 * Math.min(rowMin, 104 + 110 + 48) + 28) nameCol = Math.min(nameCol, Math.floor((lw - 28) / 2) - 152);
    var colsN = lw >= 2 * (104 + nameCol + 48) + 28 ? 2 : 1, rowH = 24, capH = 22, footH = L.none.length ? 20 + (stacked ? 16 : 0) : 0;
    if (stacked) bh -= 66 + 40;
    var perCol = Math.max(1, Math.floor((bh - capH - footH) / rowH)), cap = perCol * colsN;
    if (rows.length <= cap) perCol = Math.ceil(rows.length / colsN);   /* balanced columns when every row fits */
    var shown = rows.slice(0, cap), top = rows[0];
    var past = rows.filter(function (r) { return r.left <= th.switchLeft; }).length;
    var head = top ? C.heroHead(ctx, { value: Math.round(top.left), fmt: 'pct', label: 'left · ' + top.a.nickname + (top.a.nickname.indexOf(famShort(top.p)) >= 0 ? '' : ' · ' + famShort(top.p)),
      sub: (th.auto ? 'switch at ' + b((100 - th.switchLeft) + '%') + ' used' : 'auto-switch ' + b('off')) + (past ? ' · ' + b(past) + ' past the line' : '') }) : '';
    var cols = []; for (var c = 0; c < colsN; c++) cols.push(shown.slice(c * perCol, (c + 1) * perCol));
    /* the provider mark names the family, so a row says the account and its window ("Qwen Global wk"); the family word
       comes back only where two rows would read the same (Mac stills 2026-10-02: "Qwen Global Qwen wk" clipped) */
    var seen = dup;
    var rowHtml = function (r, i) {
      var winWord = winWordOf(r);
      var tone = r.w.tone || 'calm', eff = r.a.effective;
      return '<div class="pmu-ladrow' + (eff ? ' is-eff' : '') + '" data-tone="' + tone + '" data-acct="' + esc(r.a.key) + '" data-pmu-act="acct-inspect" data-value="' + esc(r.a.key) + '" role="button" tabindex="0"' +
        C.hover(r.p.name + ' · ' + r.a.nickname, C.fmt(r.left, 'pct') + ' left in the ' + r.w.short.toLowerCase() + ' window · ' + PMU.fmt.resetLine(r.w).text + ' · ' + r.a.stateWord + ' · ' + r.a.ageText) + '>' +
        PMU.mark(r.p.id, 16) + '<span class="pmu-ladname"><b>' + esc(r.a.nickname) + '</b><em>' + esc((seen[r.a.nickname] > 1 ? famShort(r.p) + ' ' : '') + winWord) + '</em></span>' +
        '<span class="pmu-ladtrack"><i class="pmu-ladfill" style="width:' + Math.max(0.5, Math.min(100, r.left)).toFixed(1) + '%"></i></span>' +
        '<b class="pmu-ladval">' + esc(C.fmt(Math.round(r.left), 'pct')) + '</b>' + (eff ? '<span class="pmu-ladact">' + C.glyph('checkCircle') + '</span>' : '<span class="pmu-ladact"></span>') + '</div>';
    };
    return '<div class="pmu-ladder' + (stacked ? ' is-stacked' : '') + '" style="grid-template-columns:' + (stacked ? 'minmax(0,1fr)' : sideW + 'px minmax(0,1fr)') + ';--ln:' + nameCol + 'px">' +
      '<div class="pmu-ladside">' + head + '<div class="pmu-swctl pmu-ladctl">' + toggle + stepper + '</div><div class="pmu-ladwarn">' + warn + '</div></div>' +
      '<div class="pmu-ladmain"><div class="pmu-ladcap"><span class="pmu-cap">MOST ROOM NOW</span><span class="pmu-cap">LEFT IN THE BINDING WINDOW</span></div>' +
      '<div class="pmu-ladcols" style="grid-template-columns:repeat(' + colsN + ',minmax(0,1fr))">' + cols.map(function (cl) {
        return '<div class="pmu-ladcol" style="--swf:' + (th.switchLeft / 100) + '">' + cl.map(rowHtml).join('') + '<i class="pmu-ladline"' + (th.auto ? '' : ' data-off') + ' aria-hidden="true"></i></div>';
      }).join('') + '</div>' +
      (rows.length > shown.length || L.none.length ? '<p class="pmu-ladfoot">' + esc([rows.length > shown.length ? (rows.length - shown.length) + ' more at a taller size' : '', L.none.length ? L.none.map(function (x) { return x.a.nickname + ' (' + famShort(x.p) + ')'; }).join(', ') + ': Usage unknown' : ''].filter(Boolean).join(' · ')) + '</p>' : '') +
      '</div></div>';
  }
  /* the ladder's entrance: the bars fill from the left 36 ms apart down the rows, the switch line drops in (WOW-SPEC 4,
     Accounts) */
  function enterLadder(body, ctx, delay) {
    var d = delay || 0, f = PMU.motion.family ? PMU.motion.family() : 'basic', st = f === 'retro' || f === 'nier';
    C.enterAll(body, ctx, d);
    Array.prototype.forEach.call(body.querySelectorAll('.pmu-ladrow'), function (row, i) {
      var fill = row.querySelector('.pmu-ladfill');
      if (fill) PMU.motion.animate(fill, [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }], { dur: 900, delay: d + 36 * i, easing: st ? 'steps(6,jump-start)' : 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      PMU.motion.animate(row, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: 280, delay: d + 36 * i, easing: st ? 'steps(3,jump-start)' : 'cubic-bezier(.22,.8,.28,1)', fill: 'backwards' });
    });
    Array.prototype.forEach.call(body.querySelectorAll('.pmu-ladline'), function (ln) {
      if (PMU.film && PMU.film.drop) PMU.film.drop(ln, { from: 24, delay: d + 700 });
    });
  }
  C.enterLadder = enterLadder;

  /* ================================================================== providers: compact rows for providers with no account (A1 10.4) */
  C.kind('providers', {
    render: function (body, ctx) {
      var group = ctx.model && ctx.model.group, ro = PMU.roster.read();
      var g = ro.groups.filter(function (x) { return x.id === group; })[0];
      var list = g ? g.providers.filter(function (p) { return !p.accounts.length && !(ctx.model.exclude || []).some(function (x) { return x === p.id; }); }) : [];
      if (!list.length) { body.innerHTML = C.empty('Every provider here is set up.'); return; }
      /* a wide strip lays the lines out in columns (Free and your own: three providers on one line); a column narrower than
         about 300 px puts the state word under the name, so neither breaks inside a word (LOOK-REVIEW-2 13 and 15:
         "OpenCod / e Zen", "Not / set / up") */
      var colsN = ctx.tier.bw >= 720 ? 3 : ctx.tier.bw >= 460 ? 2 : 1, colW = (ctx.tier.bw - 28 * (colsN - 1)) / colsN, stacked = colW < 300;
      var word = true;
      var fit = C.fit(ctx.tier.bh, stacked ? 46 : 32, 2) * colsN;
      var shown = list.length > fit ? list.slice(0, Math.max(1, fit - 1)) : list;
      var setupAcct = DATA.accounts.filter(function (x) { return x.setup_required; })[0];
      body.innerHTML = '<div class="pmu-provlist"' + (colsN > 1 ? ' data-cols="' + colsN + '" style="grid-template-columns:repeat(' + colsN + ',minmax(0,1fr))"' : '') + '>' + shown.map(function (p) {
        /* three cases, one line each (DECISIONS "Provider catalog"): ready without accounts (Free Models routes: Manage),
           the canon Provider Setup Required provider (OpenCode on your computer: Not installed, Set up = the canon
           continuation; the row opens its setup facts), and not set up (Set up in Settings at that provider) */
        var ready = p.status === 'active', setup = !ready && setupAcct && p.id === PMU.roster.legacyProvider(setupAcct.provider_id);
        var wordText = setup ? (p.installed ? p.statusWord : 'Not installed') : p.statusWord;
        var btn = ready ? '<button type="button" class="pmu-textbtn" data-pmu-act="prov-setup" data-value="' + esc(p.id) + '"' + C.hover('Manage ' + p.name, 'Opens Settings > AI > Providers & Accounts at ' + p.name) + '>' + esc(t('accounts.manage')) + '</button>'
          : setup ? '<button type="button" class="pmu-textbtn" data-pmu-act="setup-open"' + C.hover(t('accounts.setup_required'), 'Opens Provider Connections · operation ' + setupAcct.operation_id + ' · continuation ' + setupAcct.continuation_id) + '>' + esc(t('accounts.set_up')) + '</button>'
          : '<button type="button" class="pmu-textbtn" data-pmu-act="prov-setup" data-value="' + esc(p.id) + '"' + C.hover('Set up ' + p.name, 'Opens Settings > AI > Providers & Accounts at ' + p.name) + '>' + esc(t('accounts.set_up')) + '</button>';
        var hover = setup ? C.hover(p.name, t('accounts.setup_required') + ' · ' + setupAcct.installation_status + ' · ' + setupAcct.authentication_status + ' · select for details')
          : C.hover(p.name, p.statusWord + ' · ' + (p.windows.length ? p.windows.map(function (w) { return w.label; }).join(', ') : 'no plan windows') + ' · ' + p.product);
        var wordHtml = '<span class="pmu-provword"' + (ready ? ' data-tone="good"' : setup ? ' data-tone="warn"' : '') + '>' + esc(wordText) + '</span>';
        return '<div class="pmu-provrow' + (setup ? ' is-setup' : '') + (stacked ? ' is-stacked' : '') + '" data-reveal data-prov="' + esc(p.id) + '"' + (setup ? ' data-pmu-act="setup-details" role="button" tabindex="0"' : '') + hover + '>' +
          PMU.mark(p.id, 18) + (stacked ? '<span class="pmu-provtext"><span class="pmu-provname">' + esc(p.name) + '</span>' + wordHtml + '</span>' : '<span class="pmu-provname">' + esc(p.name) + '</span>' + wordHtml) + btn + '</div>';
      }).join('') + C.more(list.length - shown.length, 'providers') + '</div>';
    }
  });

  /* ================================================================== setup: the canon Provider Setup Required card (A1 10.6) */
  C.kind('setup', {
    render: function (body, ctx) {
      var acct = DATA.accounts.filter(function (a) { return a.setup_required; })[0];
      if (!acct) { body.innerHTML = C.empty('Nothing needs setup.'); return; }
      var rows = [['Installation', acct.installation_status, 'tool'], ['Authentication', acct.authentication_status, 'key'], ['Billing', acct.billing_basis, 'wallet'], ['Entitlement', acct.entitlement_class, 'shield'], ['Settlement', acct.settlement_status, 'check'],
        ['Requests', String(acct.requests), 'list'], ['Activity', 'No acquisition attempted', 'minusCircle'], ['Last seen', acct.last, 'clockCircle'], ['Effective route', acct.effective_route_id, 'link']];
      var cta = '<button type="button" class="pmu-textbtn pmu-setupcta" data-pmu-act="setup-open"' + C.hover('Open Provider Connections', 'Settings · AI · operation ' + acct.operation_id + ' · continuation ' + acct.continuation_id) + '>Open Provider Connections</button>';
      var blocks = [{ h: 34, html: '<div class="pmu-setuphead">' + C.glyph('gear') + '<b>' + esc(acct.status) + '</b></div>', always: true }]
        .concat([{ h: 36, html: '<div class="pmu-setupcta-row">' + cta + '</div>', always: true }])
        .concat([{ h: 22, html: '<p class="pmu-setupnote">No automatic acquisition or route change.</p>' }])
        .concat(rows.map(function (r) { return { h: 32, html: '<div class="pmu-amount pmu-amt">' + C.glyph(r[2]) + '<span>' + esc(r[0]) + '</span><span class="pmu-amtv"><b>' + esc(r[1]) + '</b></span></div>' }; }));
      var res = C.stack(blocks, ctx.tier.bh);
      body.innerHTML = '<div class="pmu-setup">' + res.html + '</div>';
    }
  });

  /* ================================================================== actions (ARCHITECTURE 4.11, DESIGN-SPEC 10.8) */
  function refreshAccounts() { PMU.roster.invalidate(); if (PMU.data.invalidate) PMU.data.invalidate(); if (PMU.board && PMU.board.refresh) PMU.board.refresh('settings'); }
  /* the Settings change ripples down the board (WOW-SPEC 3.9): every notch keeps its old look until its row's turn,
     30 ms apart in reading order (24 ms for a level change), then eases to the new one; the rows are patched in place,
     so the notch elements are the same before and after */
  function reducedNow() { return PMU.motion.reduced ? PMU.motion.reduced() : false; }
  function rippleCapture() {
    var board = document.getElementById('pmuBoard'); if (!board || reducedNow()) return null;
    var ns = Array.prototype.slice.call(board.querySelectorAll('.pmu-notch, .pmu-ladline, .pmu-skyswitch'));
    var tops = ns.map(function (n) { var r = n.getBoundingClientRect(); return r.height ? Math.round(r.top / 8) : null; });
    var uniq = tops.filter(function (v, i) { return v !== null && tops.indexOf(v) === i; }).sort(function (a, z) { return a - z; });
    return ns.map(function (n, i) { return { el: n, rank: Math.max(0, uniq.indexOf(tops[i])), off: n.hasAttribute('data-off'), faint: n.hasAttribute('data-faint'), at: n.parentNode ? n.parentNode.style.getPropertyValue('--at') : '' }; });
  }
  function ripplePlay(cap, step) {
    if (!cap) return;
    var f = PMU.motion.family ? PMU.motion.family() : 'basic', stp = f === 'retro' || f === 'nier', sp = PMU.motion.speed ? PMU.motion.speed() : 1;
    var vis = function (o, fa) { return o ? { opacity: 0.18, transform: 'scaleY(.7)' } : fa ? { opacity: 0.32, transform: 'scaleY(.7)' } : { opacity: 1, transform: 'scaleY(1)' }; };
    cap.forEach(function (c) {
      var n = c.el; if (!n.isConnected) return;
      var d = (step || 30) * c.rank;
      if (n.classList.contains('pmu-notch')) {
        var off = n.hasAttribute('data-off'), faint = n.hasAttribute('data-faint');
        if (off !== c.off || faint !== c.faint) PMU.motion.animate(n, [vis(c.off, c.faint), vis(off, faint)], { dur: stp ? 120 : 240, delay: d, easing: stp ? 'steps(3,jump-start)' : 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
        var rail = n.parentNode;
        if (rail && rail.style.getPropertyValue('--at') !== c.at && rail.getAnimations) rail.getAnimations().forEach(function (a) { try { a.effect.updateTiming({ delay: d * sp, fill: 'backwards' }); } catch (error) {} });
      } else if (n.getAnimations) n.getAnimations().forEach(function (a) { try { a.effect.updateTiming({ delay: d * sp, fill: 'backwards' }); } catch (error) {} });
    });
  }
  PMU.accounts = {
    toggleAutoSwitch: function () {
      var next = !PMU.roster.thresholds().auto, cap = rippleCapture();
      var ok = PMU.settings.set('ai.accounts.multi-account-switching', next);
      if (ok) { PMU.shell.toast(t('toast.saved_settings')); refreshAccounts(); ripplePlay(cap, 30); }
      return ok;
    },
    setSwitchLevel: function (pctLeft) {
      var v = Math.max(5, Math.min(30, Math.round(Number(pctLeft) / 5) * 5)), cap = rippleCapture();
      var ok = PMU.settings.set('ai.accounts.hard-switch-level', v);
      if (ok) { PMU.shell.toast(t('toast.saved_settings')); refreshAccounts(); ripplePlay(cap, 24); }
      return ok;
    },
    setWarnLevel: function (pctLeft) {
      var ok = PMU.settings.set('ai.accounts.soft-warning-level', Number(pctLeft));
      if (ok) { PMU.shell.toast(t('toast.saved_settings')); refreshAccounts(); }
      return ok;
    },
    useAccount: function (key) {
      var a = PMU.roster.account(key); if (!a || !a.eligible.ok) return null;
      var board = document.getElementById('pmuBoard'), p0 = PMU.roster.provider(a.providerId), oldKey = p0 && p0.effective ? p0.effective.key : null;
      var rectOf = function (k) { var r = board && k ? board.querySelector('.pmu-accrow[data-acct="' + k + '"]') : null; return r ? r.getBoundingClientRect() : null; };
      var from = rectOf(oldKey), to0 = rectOf(key);
      var legacy = a.legacy || {};
      var receipt = command('cmd.account.select_profile', { provider_id: a.providerId, account_id: a.id, connection_id: legacy.connection_id || null,
        override: true, scope: 'next_run', source: 'usage.accounts' }, { selected: true });
      if (receipt.dispatch_accepted === false) return receipt;
      PMU.settings.useNext(a.providerId, a.id);
      var map = st.accountOverride && typeof st.accountOverride === 'object' && !st.accountOverride.key ? st.accountOverride : {};
      map[a.providerId] = key; st.accountOverride = map;
      if (window.PM7_USAGE) window.PM7_USAGE.active_account_id = legacy.account_id || 'account:' + a.providerId + ':' + a.id;
      /* the active light travels from the old active row to the new one (WOW-SPEC 3.9): one light in the board layer,
         FLIP 420 SLIDE; the two rows' action words cross-fade and the new row's state glyph pulses once */
      refreshAccounts();
      var row = board ? board.querySelector('.pmu-accrow[data-acct="' + key + '"]') : null;
      if (row && board && !reducedNow()) {
        var br = board.getBoundingClientRect(), to = row.getBoundingClientRect(), f = PMU.motion.family ? PMU.motion.family() : 'basic', stp = f === 'retro' || f === 'nier';
        if (from && to0) {
          var light = document.createElement('i'); light.className = 'pmu-actlight'; light.setAttribute('aria-hidden', 'true');
          light.style.cssText = 'left:' + (to.left - br.left) + 'px;top:' + (to.top - br.top) + 'px;width:' + to.width + 'px;height:' + to.height + 'px';
          board.appendChild(light);
          var sx = from.width / Math.max(1, to.width), sy = from.height / Math.max(1, to.height);
          var an = PMU.motion.animate(light, [{ transform: 'translate(' + (from.left - to.left).toFixed(1) + 'px,' + (from.top - to.top).toFixed(1) + 'px) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')', opacity: 1 },
            { transform: 'none', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 0 }], { dur: 620, easing: stp ? 'steps(5,jump-start)' : 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
          if (an && an.finished) an.finished.then(function () { light.remove(); }, function () { light.remove(); }); else light.remove();
        }
        [key, oldKey].forEach(function (k) {
          var r = k && board.querySelector('.pmu-accrow[data-acct="' + k + '"] .pmu-accactcell');
          if (r) PMU.motion.animate(r, [{ opacity: 0 }, { opacity: 1 }], { dur: 160, delay: 120, easing: 'cubic-bezier(.22,.8,.28,1)', fill: 'backwards' });
        });
        var glyph = row.querySelector('.pmu-accglyph');
        if (glyph && PMU.film) (PMU.film.halo || PMU.film.ring)(glyph, { tone: 'good', delay: 300 });
      } else if (row) C.flashRow(row);
      return receipt;
    },
    openSettings: function (providerId, accountId) {
      var receipt = command('cmd.settings.open', { category: 'ai', setting_id: 'ai.accounts.provider-connections', provider_id: providerId || null, account_id: accountId || null }, { opened: true });
      PMU.settings.open(providerId);
      return receipt;
    },
    openSetup: function () {
      var a = DATA.accounts.filter(function (x) { return x.setup_required; })[0]; if (!a) return null;
      var receipt = command('cmd.settings.open', {
        route_id: 'settings-route:usage-provider-setup',
        target: { target_type: 'setting', setting_id: 'ai.accounts.provider-connections', manager_id: null, detail_id: null },
        origin_surface: 'usage', origin_route: 'usage/provider-setup',
        provider_id: a.provider_id, installation_id: a.installation_id, account_id: a.account_id, connection_id: a.connection_id,
        product_id: a.product_id, model_id: a.model_id, requested_route_id: a.requested_route_id, effective_route_id: a.effective_route_id,
        attempt_id: a.attempt_id, host: a.host, environment: a.environment, operation_id: a.operation_id, continuation_id: a.continuation_id,
        automatic_acquisition: false, automatic_authentication: false, automatic_route_change: false
      }, { opened: true, continuation_preserved: true });
      viewAction('usage.provider_setup.open_settings', { provider_id: a.provider_id, operation_id: a.operation_id, continuation_id: a.continuation_id });
      if (receipt.dispatch_accepted !== false) PMU.settings.open('opencode');
      return receipt;
    },
    inspect: function (key, opener) {
      var a = PMU.roster.account(key); if (!a) return;
      var p = PMU.roster.provider(a.providerId), L = a.legacy;
      var acts = [];
      if (a.supportsManual) acts.push({ label: t('accounts.use_override'), primary: true, disabled: !a.eligible.ok, reason: a.eligible.reason, onClick: function () { PMU.accounts.useAccount(key); PMU.inspector.close(); } });
      acts.push({ label: 'Refresh Usage', onClick: function () { if (window.PM7_USAGE) window.PM7_USAGE.refresh(); } });
      acts.push({ label: 'Open Provider Settings', onClick: function () { PMU.accounts.openSettings(a.providerId, a.id); } });
      var row = function (k, v) { return [k, esc(v == null || v === '' ? '-' : v)]; };
      var sections = [
        { title: 'Identity', rows: [row('Display name', a.nickname), row('Provider identity', a.identity), row('Provider', a.providerName), row('Plan', a.planLine || a.plan), row('Host', a.host), row('Auth family', a.auth),
          row('Credential', 'handle only · ' + (a.method || 'sign-in')), row('Priority', String(a.priority)), row('Default', a.isDefault ? 'yes' : 'no'), row('Billing entity', a.billingEntity), row('Roles', (a.roles || []).join(', '))] },
        { title: 'State', rows: [['Lifecycle', stateHtml(a)], row('Credential', a.signedIn ? 'signed in' : 'signed out'), row('Configuration', p && p.status === 'active' ? 'configured' : (p ? p.statusWord : '-')),
          row('Availability', a.eligible.ok ? 'eligible' : a.eligible.reason), row('Pressure', a.binding ? a.binding.short + ' ' + C.fmt(a.binding.pct, 'pct') + ' used (' + (a.binding.tone || 'calm') + ')' : 'no reading'),
          row('Health', a.health), row('Usage availability', a.hasFacts ? a.fresh.source + ' · ' + a.ageText : 'Usage unknown · no reading yet')] },
        { title: 'Windows', rows: a.windows.length ? a.windows.map(function (w) {
          return [w.label, esc(w.pct === null ? PMU.roster.vsWord(w) : C.fmt(w.pct, 'pct') + ' used · ' + C.fmt(100 - w.pct, 'pct') + ' left' + (w.amount ? ' · ' + w.amount : '') + ' · ' + PMU.fmt.reset(w).text + ' · ' + PMU.fmt.truth(w.truth) + (w.est ? ' · estimated' : ''))];
        }) : [row('Windows', a.noWindowsWord || 'This provider reports no plan windows')] }
      ];
      if (a.amounts.length) sections.push({ title: 'Credits and spend', rows: a.amounts.map(function (x) { return [x.label, x.vs && x.vs !== 'ok' ? C.vs(x.vs, x.word) : esc((x.value || '') + (x.suffix ? ' ' + x.suffix : ''))]; }) });
      sections.push({ title: 'Cooldown and retry', rows: a.cooldown ? [row('Cooldown until', PMU.fmt.clock(a.cooldown.untilAt)), row('Reason', a.cooldown.reason), row('Source', a.cooldown.source), row('Retry budget', a.cooldown.retry)] : [row('Cooldown', 'none')] });
      if (a.failure) sections.push({ title: 'Failure', rows: [row('Failure', a.failure.text), row('Code', a.failure.code), row('Remedy', a.failure.remedy)] });
      var eff = p && p.effective;
      sections.push({ title: 'Requested versus effective', rows: [row('Requested account', p && p.defaultAccount ? (p.accounts.filter(function (x) { return x.id === p.defaultAccount; })[0] || {}).nickname : '-'), row('Binding', a.binding ? a.binding.label : '-'),
        row('Effective account', eff ? eff.nickname + (eff.override ? ' (override)' : '') : '-'), row('Switch reason', (switchEvents(p, 1)[0] || {}).text || 'none recorded')] });
      var hist = PMU.roster.read().switchLog.filter(function (e) { return e.providerId === a.providerId && (e.from === a.id || e.to === a.id); });
      sections.push({ title: 'Switch history for this account', rows: hist.length ? hist.map(function (e) { return [whenText(e.at), esc(e.text)]; }) : [row('History', 'no switches recorded')] });
      if (L) sections.push({ title: 'Usage facts', rows: [row('Installation', L.installation_status), row('Authentication', L.authentication_status), row('Status', L.status === 'Connected' ? 'Working' : L.status), row('Requests', String(L.requests)),
        row('Billing', L.billing_basis), row('Entitlement', L.entitlement_class), row('Settlement', L.settlement_status), row('Connection health', L.health + '%'), row('Last seen', L.last), row('Scope', L.scope), row('Route', L.route), row('Cost', L.cost)] });
      if (L) sections.push({ title: 'Identifiers', rows: [row('Account', L.account_id), row('Connection', L.connection_id), row('Installation', L.installation_id), row('Product / model', L.product_id + ' · ' + L.model_id),
        row('Requested route', L.requested_route_id), row('Effective route', L.effective_route_id), row('Host / environment', L.host + ' / ' + L.environment), row('Legacy card', 'acct-' + L.id)] });
      PMU.inspector.open({ kind: 'account', title: a.nickname, subtitle: a.providerName + ' · ' + a.stateWord, actions: acts, sections: sections,
        raw: { provider_id: a.providerId, account_id: a.id, state: a.state, windows: a.windows.map(function (w) { return { key: w.key, pct: w.pct, reset_at: w.resetAt, truth: w.truth }; }), credential_ref: 'handle:' + a.providerId + ':' + a.id } }, opener);
    }
  };

  C.act('auto', function () { PMU.accounts.toggleAutoSwitch(); });
  C.act('sw-step', function (el) { var th = PMU.roster.thresholds(); PMU.accounts.setSwitchLevel(th.switchLeft + 5 * (+el.getAttribute('data-value') || 0)); });
  C.act('sw-pick', function (el) {
    var th = PMU.roster.thresholds();
    PMU.menu.choice(el, { title: 'Switch accounts at', value: th.switchLeft, current: (100 - th.switchLeft) + '% used', foot: 'Shared with Settings > AI > Providers & Accounts. ' + t('accounts.not_consent'),
      options: LEVELS.map(function (v) { return { value: v, label: (100 - v) + '% used', sub: v + '% left' + (v === 10 ? ' · default' : ''), disabled: v >= th.warnLeft, reason: v >= th.warnLeft ? 'At or above the warn level (' + th.warnLeft + '% left)' : '' }; }),
      onPick: function (v) { PMU.accounts.setSwitchLevel(v); } });
  });
  C.act('acct-use', function (el) { PMU.accounts.useAccount(el.getAttribute('data-value')); });
  C.act('acct-settings', function (el) { var k = el.getAttribute('data-value').split('/'); PMU.accounts.openSettings(k[0], k[1]); });
  C.act('acct-inspect', function (el) { PMU.accounts.inspect(el.getAttribute('data-value'), el); });
  C.act('prov-setup', function (el) { PMU.accounts.openSettings(el.getAttribute('data-value')); });
  C.act('setup-open', function () { PMU.accounts.openSetup(); });
  /* the setup line's Details: every fact of the canon Provider Setup Required card (parity with the old card) */
  C.act('setup-details', function (el) { var d = PMU.widgets.get('acct-opencode-personal-setup'); if (d && d.inspect) { var spec = d.inspect(); if (spec) PMU.inspector.open(spec, el); } });

  /* ================================================================== group: a Settings group heading band (Subscriptions
     and plans, Pay as you go, Free and your own) over the Accounts plates, in Settings order */
  C.kind('group', { render: function (body) { body.innerHTML = ''; } });
})();
