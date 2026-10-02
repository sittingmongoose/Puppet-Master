/* Accounts kinds and actions (owner: content; DESIGN-SPEC 10, DESIGN-SPEC-ATLAS 10, ARCHITECTURE.md 4.11 and 6):
   provider (one account: the single plate; two or more: the provider plate with aligned window columns), switch (the
   bound auto-switch strip), providers (compact rows for providers not set up), setup (the canon "Provider Setup
   Required" card). Who exists comes from Settings (PMU.roster), and every control writes through the Settings owner:
   the toggle and the switch level through PMU.settings.set (setSettingFromHost), "Use this account" through
   cmd.account.select_profile plus the Settings action "Use for the next run". */
(function () {
  var C = PMU.content, st = PMU.core.state;
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
  C.kind('provider', {
    render: function (body, ctx) {
      var p = PMU.roster.provider(ctx.id.replace(/^acct-/, ''));
      if (!p || !p.accounts.length) { body.innerHTML = C.empty('No account is set up for this provider.', 'Set one up in Settings > AI > Providers & Accounts'); return; }
      if (p.accounts.length > 1) group(body, ctx, p); else single(body, ctx, p, p.accounts[0]);
    }
  });

  function group(body, ctx, p) {
    var bw = ctx.tier.bw, n = p.windows.length;
    var minFull = 130 + n * 96 + 64 + 16 * (n + 1), minFold = 112 + n * 88 + 16 * n;
    var mode = !n ? 'none' : bw >= minFull ? 'full' : bw >= minFold ? 'fold' : 'binding';
    var xlAct = bw >= 520 + n * 60 && mode === 'full';
    var cols = mode === 'binding' ? ['binding'] : p.windows.map(function (w) { return w.key; });
    var tmpl = mode === 'full' ? 'minmax(130px,1.25fr) ' + cols.map(function () { return 'minmax(96px,1fr)'; }).join(' ') + ' ' + (xlAct ? '150px' : '64px')
      : mode === 'fold' ? 'minmax(112px,1.25fr) ' + cols.map(function () { return 'minmax(88px,1fr)'; }).join(' ')
      : mode === 'binding' ? 'minmax(100px,1fr) minmax(88px,1fr)' : 'minmax(0,1fr) auto';
    var band = '<div class="pmu-colhead pmu-accband" style="grid-template-columns:' + tmpl + '"><span class="pmu-cap">ACCOUNT</span>' +
      (mode === 'binding' ? '<span class="pmu-cap">BINDING WINDOW</span>' : p.windows.map(function (w) { return '<span class="pmu-cap">' + esc(w.label.replace(/ window$/i, '').toUpperCase()) + '</span>'; }).join('')) +
      (mode === 'full' ? '<span></span>' : '') + '</div>';
    if (!n) band = '';
    /* foot copy (R-ACCT-10), most room, Codex: auto-switch state and the last two switch events */
    var th = PMU.roster.thresholds(), footLines = [];
    var fb = fallbackSentence(p); if (fb) footLines.push({ glyph: 'alert', tone: 'warn', html: esc(fb) });
    var mr = mostRoom(p); if (mr && p.windows.length) footLines.push({ glyph: 'info', html: esc(t('accounts.most_room', { name: mr.account.nickname, left: Math.round(mr.left) + '%' })) + (mr.account.fresh.stale ? ' <em>(' + esc(mr.account.ageText) + ')</em>' : '') });
    var evs = switchEvents(p, 2);
    if (!fb && evs.length) footLines.push({ glyph: 'refresh', html: esc((th.auto ? 'Auto-switch on' : 'Auto-switch off') + ' · ' + evs.map(function (e) { return whenText(e.at) + ' ' + e.text; }).join(' · ')) });
    var footCap = C.w(ctx, 'm') ? 3 : 1;
    var bh = ctx.tier.bh, bandH = n ? 26 : 0;
    var rowsN = p.accounts.length;
    var footH = Math.min(footLines.length, footCap) ? 10 + Math.min(footLines.length, footCap) * 19 : 0;
    var comfy = bandH + rowsN * 66 + footH <= bh + 12;
    var rowH = comfy ? 66 : 44;
    var fit = C.fit(bh + 12, rowH, bandH + footH);
    if (fit < rowsN) { footLines = footLines.slice(0, 1); footH = footLines.length ? 30 : 0; fit = C.fit(bh + 12, rowH, bandH + footH); }
    var shown = p.accounts.slice(0, Math.max(1, rowsN > fit ? fit - 1 : fit));
    var size = comfy ? 'c' : 'k';
    var rows = shown.map(function (a) {
      var ident = '<span class="pmu-accid">' + '<span class="pmu-accglyph">' + (a.stateGlyph ? C.glyph(a.stateGlyph) : '') + '</span>' +
        '<span class="pmu-acctext"><b class="pmu-ident' + (a.effective ? ' is-eff' : p.effective ? ' is-other' : '') + '">' + esc(a.nickname) + '</b>' +
        (comfy ? '<span class="pmu-identmeta">' + metaLine(a, ['plan', 'host', 'age']) + (mode !== 'full' ? ' ' + useBtn(a, false) : '') + '</span>' +
          (a.amounts.length ? '<span class="pmu-amounts">' + a.amounts.slice(0, 1).map(function (x) { return esc(x.label) + ' <b>' + esc(x.value || x.word) + '</b>' + (x.suffix ? ' ' + esc(x.suffix) : ''); }).join('') + '</span>' : '')
          : '<span class="pmu-identmeta">' + stateHtml(a, { glyph: false }) + (mode !== 'full' ? ' ' + useBtn(a, false) : '') + '</span>') + '</span></span>';
      var cells = mode === 'binding' ? ['<span class="pmu-acccell" data-win="binding"></span>'] : p.windows.map(function (w) { return '<span class="pmu-acccell" data-win="' + esc(w.key) + '"></span>'; });
      if (!n) cells = ['<span class="pmu-accnone">' + (a.amounts.length ? amountLines(a, 2) : C.vs('not_exposed', a.noWindowsWord || 'Quota not exposed')) + '</span>'];
      var act = mode === 'full' ? '<span class="pmu-accactcell">' + useBtn(a, xlAct) + '</span>' : '';
      var sig = a.shownState + '|' + a.effective + '|' + a.windows.map(function (w) { return w.pct; }).join(',');
      return '<div class="pmu-row pmu-accrow' + (comfy ? ' is-comfy' : ' is-compact') + (a.effective ? ' is-eff' : '') + '" data-reveal data-flash-key="' + esc(a.key) + '" data-flash-sig="' + esc(sig) + '" data-acct="' + esc(a.key) + '" data-state="' + a.shownState + '" data-pmu-act="acct-inspect" data-value="' + esc(a.key) + '" role="button" tabindex="0"' +
        ' style="grid-template-columns:' + tmpl + '"' + C.hover(a.nickname, a.identity + (a.routeRole ? ' · ' + a.routeRole : '') + ' · priority ' + a.priority) + '>' + ident + cells.join('') + act + '</div>';
    }).join('');
    var foot = footLines.slice(0, footCap).map(function (l) { return '<span class="pmu-accfootline"' + (l.tone ? ' data-tone="' + l.tone + '"' : '') + '>' + C.glyph(l.glyph) + '<span>' + l.html + '</span></span>'; }).join('');
    body.innerHTML = '<div class="pmu-acc is-group" data-mode="' + mode + '">' + band + '<div class="pmu-accrows">' + rows + '</div>' + C.more(rowsN - shown.length, rowsN - shown.length === 1 ? 'account' : 'accounts') + '</div>' +
      (foot ? '<div class="pmu-cardfoot pmu-accfoot">' + foot + '</div>' : '');
    shown.forEach(function (a) {
      var row = body.querySelector('.pmu-accrow[data-acct="' + a.key + '"]');
      if (!row) return;
      if (mode === 'binding') {
        var b = a.binding || a.windows[0];
        var host = row.querySelector('[data-win="binding"]');
        if (b && host) C.chart(body, 'meter', host, Object.assign(meterOpts(a, p, size, b, true, !comfy), { label: b.short }), { label: a.nickname + ' ' + b.label });
        return;
      }
      a.windows.forEach(function (w) {
        var h = row.querySelector('[data-win="' + w.key + '"]');
        if (h) C.chart(body, 'meter', h, Object.assign(meterOpts(a, p, size, w, mode !== 'full' || bw < 520, !comfy), { noLabel: !!n }), { label: a.nickname + ' ' + w.label });
      });
    });
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
    if (!p.windows.length && (a.noWindowsWord || !a.amounts.length)) blocks.push({ h: 58, html: '<div class="pmu-accmeter is-na"><div class="pmu-natrack"></div>' + C.vs('not_exposed', a.noWindowsWord ? a.noWindowsWord.charAt(0).toUpperCase() + a.noWindowsWord.slice(1) : 'Quota not exposed') + '<span class="pmu-naplan">' + esc(a.planLine || a.plan) + '</span></div>' });
    a.amounts.forEach(function (x) { var nar = ctx.tier.bw < 260; blocks.push({ h: x.suffix && nar ? 50 : 32, html: amountLines({ amounts: [x] }, 1, nar) }); });
    if (big) {
      [['Route role', a.routeRole], ['Plan', a.planLine], ['Auth', a.auth], ['Source', a.fresh.source], ['Default', a.isDefault ? 'yes' : 'no']].concat(a.legacy ? [['Billing', a.legacy.billing_basis], ['Entitlement', a.legacy.entitlement_class], ['Settlement', a.legacy.settlement_status]] : [])
        .forEach(function (f) { if (f[1]) blocks.push({ h: 27, html: C.facts([f]) }); });
    } else {
      /* a standard plate has room under its windows: the account, its state and plan fill it (hidden whole when they do not fit) */
      [['Account', a.nickname], ['State', a.stateWord, { tone: { good: 'good', warn: 'warn', crit: 'crit' }[a.stateTone] || null }], ['Plan', a.plan || a.planLine], ['Route role', a.routeRole], ['Auth', a.auth]]
        .forEach(function (f) { if (f[1]) blocks.push({ h: 27, html: C.facts([f]) }); });
    }
    /* the single plate spaces its blocks 12 px apart (consecutive facts sit flush, separated by their hairline): the
       budget counts those gaps, so the last block never slides under the footer */
    var prevFact = false;
    blocks.forEach(function (b, i) { var isFact = !b.win && b.html.indexOf('pmu-facts') >= 0; b.h += i === 0 || (isFact && prevFact) ? 0 : 12; prevFact = isFact; });
    var res = C.stack(blocks, bh - footH - 8);
    var hiddenWins = res.hidden.filter(function (b) { return b.win; }).length;
    var foot = '<div class="pmu-accsfoot"><span class="pmu-sampled' + (a.fresh.stale ? ' is-stale' : '') + '">' + (a.fresh.stale ? C.glyph('clockCircle') : '') + esc(a.fresh.ageS === null ? 'no reading yet' : 'sampled ' + a.ageText.replace(/^cached /, '')) + '</span>' +
      (ctx.tier.bw < 200 && (a.effective || a.eligible.ok) ? '' : '<span class="pmu-host">' + esc(a.host || '') + '</span>') + useBtn(a, false) + '</div>';
    body.innerHTML = '<div class="pmu-acc is-single" data-acct="' + esc(a.key) + '" data-state="' + a.shownState + '">' + res.html + (hiddenWins ? '<div class="pmu-more">' + esc(hiddenWins + ' more ' + (hiddenWins === 1 ? 'window' : 'windows') + ' at a larger size') + '</div>' : '') + '</div>' + foot;
    wins.forEach(function (w) {
      var h = body.querySelector('.pmu-accmeter[data-win="' + w.key + '"]');
      if (h) C.chart(body, 'meter', h, Object.assign(meterOpts(a, p, size === 'i' && w.pct !== null ? 'i' : 'k', w, true), { label: w.label }), { label: p.name + ' ' + w.label });
    });
  }

  var FAM_SHORT = { 'claude-code': 'Claude', 'openai-codex': 'Codex', 'qwen-coding': 'Qwen', 'github-copilot': 'Copilot', 'kimi-coding': 'Kimi', 'gemini-direct': 'Gemini' };
  function famShort(p) { return FAM_SHORT[p.id] || p.name; }
  /* ================================================================== switch: the bound auto-switch strip (A1 10.3) */
  C.kind('switch', {
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
          '<span class="pmu-swfamname">' + esc(famShort(x.p)) + '</span><span class="pmu-swbar" data-i="' + i + '"></span></span>';
      };
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
      fams.forEach(function (x, i) {
        var h = body.querySelector('.pmu-swbar[data-i="' + i + '"]');
        if (h) C.chart(body, 'headroom', h, { pct: x.mr.left, tone: x.mr.account.binding.tone, label: x.p.name, hover: { label: x.p.name + ' · most room now', detail: x.mr.text + ' · ' + x.mr.account.binding.short + ' window' } }, { label: x.p.name + ' headroom' });
      });
    }
  });

  /* ================================================================== providers: compact rows for providers with no account (A1 10.4) */
  C.kind('providers', {
    render: function (body, ctx) {
      var group = ctx.model && ctx.model.group, ro = PMU.roster.read();
      var g = ro.groups.filter(function (x) { return x.id === group; })[0];
      var list = g ? g.providers.filter(function (p) { return !p.accounts.length && !(ctx.model.exclude || []).some(function (x) { return x === p.id; }); }) : [];
      if (!list.length) { body.innerHTML = C.empty('Every provider here is set up.'); return; }
      var word = C.w(ctx, 's');
      /* narrow rows may wrap the name to two lines (38 px), wide rows stay one line (32 px) */
      /* a wide strip lays the lines out in columns (Free and your own: three providers on one line) */
      var colsN = ctx.tier.bw >= 720 ? 3 : ctx.tier.bw >= 460 ? 2 : 1;
      var fit = C.fit(ctx.tier.bh, word ? 32 : 38, 2) * colsN;
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
        return '<div class="pmu-provrow' + (setup ? ' is-setup' : '') + '" data-reveal data-prov="' + esc(p.id) + '"' + (setup ? ' data-pmu-act="setup-details" role="button" tabindex="0"' : '') + hover + '>' +
          PMU.mark(p.id, 18) + '<span class="pmu-provname">' + esc(p.name) + '</span>' + (word ? '<span class="pmu-provword"' + (ready ? ' data-tone="good"' : setup ? ' data-tone="warn"' : '') + '>' + esc(wordText) + '</span>' : '') + btn + '</div>';
      }).join('') + C.more(list.length - shown.length, 'providers') + '</div>';
    }
  });

  /* ================================================================== setup: the canon Provider Setup Required card (A1 10.6) */
  C.kind('setup', {
    render: function (body, ctx) {
      var acct = DATA.accounts.filter(function (a) { return a.setup_required; })[0];
      if (!acct) { body.innerHTML = C.empty('Nothing needs setup.'); return; }
      var rows = [['Installation', acct.installation_status, 'tool'], ['Authentication', acct.authentication_status, 'key'], ['Billing', acct.billing_basis, 'wallet'], ['Entitlement', acct.entitlement_class, 'shield'], ['Settlement', acct.settlement_status, 'check'],
        ['Requests', String(acct.requests), 'list'], ['Last seen', acct.last, 'clockCircle'], ['Effective route', acct.effective_route_id, 'link']];
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
  PMU.accounts = {
    toggleAutoSwitch: function () {
      var next = !PMU.roster.thresholds().auto;
      var ok = PMU.settings.set('ai.accounts.multi-account-switching', next);
      if (ok) { PMU.shell.toast(t('toast.saved_settings')); refreshAccounts(); }
      return ok;
    },
    setSwitchLevel: function (pctLeft) {
      var v = Math.max(5, Math.min(30, Math.round(Number(pctLeft) / 5) * 5));
      var ok = PMU.settings.set('ai.accounts.hard-switch-level', v);
      if (ok) { PMU.shell.toast(t('toast.saved_settings')); refreshAccounts(); }
      return ok;
    },
    setWarnLevel: function (pctLeft) {
      var ok = PMU.settings.set('ai.accounts.soft-warning-level', Number(pctLeft));
      if (ok) { PMU.shell.toast(t('toast.saved_settings')); refreshAccounts(); }
      return ok;
    },
    useAccount: function (key) {
      var a = PMU.roster.account(key); if (!a || !a.eligible.ok) return null;
      var legacy = a.legacy || {};
      var receipt = command('cmd.account.select_profile', { provider_id: a.providerId, account_id: a.id, connection_id: legacy.connection_id || null,
        override: true, scope: 'next_run', source: 'usage.accounts' }, { selected: true });
      if (receipt.dispatch_accepted === false) return receipt;
      PMU.settings.useNext(a.providerId, a.id);
      var map = st.accountOverride && typeof st.accountOverride === 'object' && !st.accountOverride.key ? st.accountOverride : {};
      map[a.providerId] = key; st.accountOverride = map;
      if (window.PM7_USAGE) window.PM7_USAGE.active_account_id = legacy.account_id || 'account:' + a.providerId + ':' + a.id;
      refreshAccounts();
      var row = document.querySelector('#pmuApp [data-acct="' + key + '"]'); if (row && PMU.motion.flash) PMU.motion.flash(row);
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
