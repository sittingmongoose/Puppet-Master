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
    /* item 2: every meter's notch sits at its own provider's switch point (this account's own, where it has one) and dims
       with that provider's toggle; C.meterSpec reads the shared policy */
    var pol = a.policy || polOf(p);
    if (m.notch) m.notch = { at: 100 - pol.switchLeft, faint: !a.effective, off: !pol.auto };
    m.thresholds = { warn: 100 - pol.warnLeft, switch: 100 - pol.switchLeft };
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

  /* ================================================================== per-provider auto-switch (Jared 2026-10-09 item 2)
     Every provider with two or more accounts has its own toggle and switch level (AAC: one policy per provider), bound to
     the Settings rows of that provider (PMU.settings.setProvider: the Settings transaction, then the Settings owner's
     write); a provider without its own value follows the shared one. A provider with one account shows one quiet line
     instead. The same controls appear on the provider's plate (the policy band), in the Auto-switch hero (one cell per
     provider) and in the Overview's headroom card (a switch on each provider row). */
  function polOf(p) { return (p && p.policy) || PMU.roster.thresholds(p ? p.id : null); }
  function switchable(p) { return !!p && p.accounts.length > 1; }
  function ownAny(pol) { var o = (pol && pol.own) || {}; return !!(o.auto || o.switchLeft || o.warnLeft || o.cooldown); }
  function polAt(p) { return 100 - polOf(p).switchLeft; }
  /* the words of a provider's policy for its hover tags and Details */
  function polDetail(p) {
    var pol = polOf(p), sh = pol.shared || pol, st = p.auto || {};
    var bits = [pol.auto ? 'On · switches at ' + (100 - pol.switchLeft) + '% used' : 'Off', 'warns at ' + (100 - pol.warnLeft) + '% used',
      ownAny(pol) ? p.name + '’s own setting (the shared one: ' + (sh.auto ? 'on' : 'off') + ', ' + (100 - sh.switchLeft) + '% used)' : 'the shared setting'];
    if (st.words && st.state !== 'off' && st.state !== 'single') bits.push(st.words);
    return bits.join(' · ') + '. Shared with Settings > AI > Providers & Accounts. ' + t('accounts.not_consent');
  }
  function polToggle(p, share) {
    var pol = polOf(p), ok = pol.available;
    return '<button type="button" class="pmu-toggle' + (pol.auto ? ' on' : '') + '" role="switch" aria-checked="' + pol.auto + '" aria-label="Auto-switch for ' + esc(p.name) + '" data-pmu-act="auto" data-prov="' + esc(p.id) + '"' +
      (share ? C.shareAttr('ctl:auto:' + p.id) : '') + (ok ? '' : ' disabled') + C.hover('Auto-switch · ' + p.name, ok ? polDetail(p) : 'Settings is not available') + '></button>';
  }
  /* the level as a stepper "at [- 90% +] used" (the plate) */
  function polStepper(p) {
    var pol = polOf(p), ok = pol.available, used = 100 - pol.switchLeft, pid = esc(p.id);
    return '<span class="pmu-swat">at</span><span class="pmu-stepper" data-prov="' + pid + '"' + C.hover('Switch level · ' + p.name, ok ? polDetail(p) : 'Settings is not available') + '>' +
      '<button type="button" data-pmu-act="sw-step" data-prov="' + pid + '" data-value="1" aria-label="Switch ' + esc(p.name) + ' earlier"' + (ok && pol.switchLeft + 5 < Math.min(35, pol.warnLeft) ? '' : ' disabled') + '>' + SVG.minus + '</button>' +
      '<button type="button" class="pmu-stepval" data-pmu-act="sw-pick" data-prov="' + pid + '" aria-haspopup="menu"' + (ok ? '' : ' disabled') + '>' + used + '%</button>' +
      '<button type="button" data-pmu-act="sw-step" data-prov="' + pid + '" data-value="-1" aria-label="Switch ' + esc(p.name) + ' later"' + (ok && pol.switchLeft > 5 ? '' : ' disabled') + '>' + SVG.plus + '</button></span><span class="pmu-swat">used</span>';
  }
  /* the level as one value that opens the level menu (the hero's cells) */
  function polValue(p) {
    var pol = polOf(p), ok = pol.available;
    return '<button type="button" class="pmu-polval" data-pmu-act="sw-pick" data-prov="' + esc(p.id) + '" aria-haspopup="menu" aria-label="' + esc(p.name) + ' switches at ' + (100 - pol.switchLeft) + '% used"' + (ok ? '' : ' disabled') +
      (pol.auto ? '' : ' data-off') + C.hover(p.name + ' · switch level', ok ? polDetail(p) : 'Settings is not available') + '>' + (100 - pol.switchLeft) + '%</button>';
  }
  /* what auto-switch is doing, when there is something to say (AAC: a stuck switch says why on the row itself) */
  function polStatus(p) {
    var st = p.auto, pol = polOf(p); if (!st || !st.words) return null;
    var show = st.state === 'waiting_idle' || st.state === 'due' || st.state === 'no_candidate' || (st.state === 'off' && st.past) || (st.state === 'unread' && pol.auto);
    if (!show) return null;
    var c = st.candidate, now = st.state === 'waiting_idle' && c && c.supportsManual && c.eligible.ok ? 'Use ' + c.nickname + ' now' : '';
    var why = (st.blocked || []).map(function (x) { return x.account.nickname + ': ' + x.why; });
    return { state: st.state, tone: st.warn ? 'warn' : '', words: st.words, now: now, nowKey: c ? c.key : '', why: why,
      html: '<div class="pmu-polstat" data-state="' + st.state + '"' + (st.warn ? ' data-tone="warn"' : '') + C.hover('Auto-switch · ' + p.name, st.words + (why.length ? ' · ' + why.join(' · ') : '')) + '>' +
        C.glyph(st.state === 'waiting_idle' || st.state === 'due' ? 'hourglass' : 'alert') + '<span>' + esc(st.words) + (now ? ' <button type="button" class="pmu-textbtn pmu-polnow" data-pmu-act="acct-use" data-value="' + esc(c.key) + '"' +
        C.hover(now, 'Switches now instead of when ' + st.tool + ' goes idle · ' + t('accounts.use_override')) + '>' + esc(now) + '</button>' : '') + '</span></div>' };
  }
  /* the plate's policy band: [toggle] Auto-switch at [- 90% +] used ... Shared setting, and the status line under it.
     Its height is known before it is drawn (the plate's fit budget); data-shape names what decides that height, so a
     change that keeps it is patched in place */
  function polBand(p, bw) {
    var pol = polOf(p), st = polStatus(p), full = bw >= 360, mid = bw >= 290;
    var scope = full ? '<span class="pmu-polscope"' + C.hover(ownAny(pol) ? p.name + '’s own setting' : 'Shared setting', polDetail(p)) + '>' + (ownAny(pol) ? 'Own setting' : 'Shared setting') + '</span>' : '';
    var lines = st ? Math.min(3, C.wrapLines(st.words + (st.now ? ' ' + st.now + ' xx' : ''), bw - 24, 12.5)) : 0;
    var shape = (full ? 'f' : mid ? 'm' : 'n') + lines;
    var html = '<div class="pmu-accpol" data-prov="' + esc(p.id) + '" data-shape="' + shape + '"' + (pol.auto ? '' : ' data-off') + '>' +
      '<div class="pmu-polrow">' + polToggle(p) + (mid ? '<span class="pmu-swlabel">Auto-switch</span>' : '') + polStepper(p) + scope + '</div>' + (st ? st.html : '') + '</div>';
    /* measured: 41 px in Basic, 45 in NieR and Retro (their switches and the stepper run taller); the plate's last row is
       folded by the fit pass when the band is under-counted, so the larger one is reserved */
    return { html: html, h: 46 + (lines ? 3 + 18 * lines : 0), shape: shape };
  }
  /* one string of what the policy shows (a plate whose policy or status changed is patched, never left stale) */
  function polSig(p) {
    if (!switchable(p)) return '';
    var pol = polOf(p), st = p.auto || {};
    return [pol.auto, pol.switchLeft, pol.warnLeft, ownAny(pol), st.state, st.candidate ? st.candidate.key : '', st.words].join('|');
  }
  /* a live policy element takes the next one's state in place: switches slide on their own CSS transition, a level rolls
     (odometer 220), words cross-fade (160); nothing is re-rendered */
  function patchPolIn(live, next, ctx) {
    var fin = ctx && (ctx.liveFinal || ctx.reason === 'live');
    Array.prototype.forEach.call(next.querySelectorAll('.pmu-toggle[data-prov]'), function (t1) {
      var t0 = live.querySelector('.pmu-toggle[data-prov="' + t1.getAttribute('data-prov') + '"]'); if (!t0) return;
      t0.classList.toggle('on', t1.classList.contains('on')); t0.setAttribute('aria-checked', t1.getAttribute('aria-checked')); t0.disabled = t1.disabled; copyHover(t1, t0);
    });
    Array.prototype.forEach.call(next.querySelectorAll('.pmu-stepval[data-prov], .pmu-polval[data-prov]'), function (v1) {
      var sel = (v1.classList.contains('pmu-polval') ? '.pmu-polval' : '.pmu-stepval') + '[data-prov="' + v1.getAttribute('data-prov') + '"]', v0 = live.querySelector(sel); if (!v0) return;
      v0.toggleAttribute('data-off', v1.hasAttribute('data-off')); copyHover(v1, v0); if (v1.hasAttribute('aria-label')) v0.setAttribute('aria-label', v1.getAttribute('aria-label'));
      if (v0.textContent === v1.textContent) return;
      var from = parseFloat(v0.textContent), to = parseFloat(v1.textContent);
      if (!fin && PMU.film && PMU.film.odometer && isFinite(from) && isFinite(to)) PMU.film.odometer(v0, to, function (v) { return Math.round(v) + '%'; }, { from: from, change: true, dur: 220 });
      else v0.textContent = v1.textContent;
    });
    Array.prototype.forEach.call(next.querySelectorAll('[data-pmu-act="sw-step"][data-prov]'), function (b1) {
      var b0 = live.querySelector('[data-pmu-act="sw-step"][data-prov="' + b1.getAttribute('data-prov') + '"][data-value="' + b1.getAttribute('data-value') + '"]'); if (b0) b0.disabled = b1.disabled;
    });
    Array.prototype.forEach.call(next.querySelectorAll('.pmu-stepper[data-prov]'), function (s1) { var s0 = live.querySelector('.pmu-stepper[data-prov="' + s1.getAttribute('data-prov') + '"]'); if (s0) copyHover(s1, s0); });
    ['.pmu-polscope', '.pmu-polstat', '.pmu-polshared'].forEach(function (sel) {
      var a0 = live.querySelector(sel), a1 = next.querySelector(sel);
      if (!a0 || !a1) return;
      if (a0.innerHTML !== a1.innerHTML) { C.setHtml(a0, a1.innerHTML); if (!fin) PMU.motion.animate(a0, [{ opacity: 0.25 }, { opacity: 1 }], { dur: 160, easing: 'cubic-bezier(.22,.8,.28,1)' }); }
      ['data-state', 'data-tone'].forEach(function (an) { var v = a1.getAttribute(an); if (v === null) a0.removeAttribute(an); else a0.setAttribute(an, v); });
      copyHover(a1, a0);
    });
    if (live.hasAttribute('data-prov')) live.toggleAttribute('data-off', next.hasAttribute('data-off'));
  }
  /* the plate's band patched in place; false when it has to be drawn again (it came, went or changed height) */
  function patchPol(body, p, ctx) {
    var live = body.querySelector(':scope > .pmu-accpol'), want = switchable(p) && !!body.querySelector(':scope > .pmu-acc.is-group');
    if (!live) return !want;
    if (!want) return false;
    var tmp = document.createElement('div'); tmp.innerHTML = polBand(p, ctx.tier.bw).html;
    var next = tmp.firstChild;
    if (!next || live.getAttribute('data-shape') !== next.getAttribute('data-shape')) return false;
    patchPolIn(live, next, ctx);
    return true;
  }

  /* ================================================================== provider: group plate (A1 10.1) and single plate (A1 10.2) */
  /* every meter of a plate is recorded with its spec (C.recMeter); a Settings change patches the plate in place (C.patch) */
  function meter(body, key, host, spec, opts, make) { C.recMeter(body, key, host, spec, opts); var rs = body._pmuMeterRecs; if (rs && rs.length) rs[rs.length - 1].make = make || null; }
  function sealPlate(body) { C.seal(body, '.pmu-acc', '.pmu-accfoot, .pmu-accsfoot'); }
  function renderPlate(body, ctx, p) {
    body._pmuMeterRecs = []; body._pmuSig = null;
    if (p.accounts.length > 1) group(body, ctx, p); else single(body, ctx, p, p.accounts[0]);
    if (!body._pmuDry) { body._pmuPlateShape = plateShape(p); body._pmuPlateRows = plateRows(p); }
  }
  /* what a plate shows, as one string (a live beat that leaves it unchanged leaves the plate alone) */
  function plateSig(p) {
    var th = polOf(p);
    return p ? JSON.stringify([th.auto, th.switchLeft, th.warnLeft, polSig(p), p.accounts.map(function (a) { return [a.key, a.shownState, a.stateWord, a.effective, a.override, a.eligible.ok, a.ageText, a.windows.map(function (w) { return [w.pct, w.resetAt ? Math.round(w.resetAt / 60000) : null, w.truth]; })]; })]) : '';
  }
  C.kind('provider', {
    liveSig: function (ctx) { return plateSig(PMU.roster.provider(ctx.id.replace(/^acct-/, ''))); },
    live: function (body, ctx) { return plateLive(body, ctx); },
    /* a single plate whose meters all show grows its facts into a free band (its meters keep their size) */
    grow: function (body) { return !!body.querySelector('.pmu-acc.is-single') && !body._pmuWinHidden; },
    render: function (body, ctx) {
      var p = PMU.roster.provider(ctx.id.replace(/^acct-/, ''));
      if (!p || !p.accounts.length) { body._pmuSig = null; body.innerHTML = C.empty('No account is set up for this provider.', 'Set one up in Settings > AI > Providers & Accounts'); return; }
      renderPlate(body, ctx, p);
    },
    update: function (body, ctx) {
      var p = PMU.roster.provider(ctx.id.replace(/^acct-/, ''));
      if (!p || !p.accounts.length) return false;
      /* the policy band first (item 2): a toggle or a level is patched in place; a band that changes height renders again */
      if (!patchPol(body, p, ctx)) return false;
      /* a policy change alone: the band is patched above and every meter takes its new notch, nothing is rendered dry */
      if (body._pmuPlateRows && body._pmuPlateRows === plateRows(p) && body._pmuPlateShape !== plateShape(p) && ctx.reason === 'settings' && metersTo(body, p, ctx)) { body._pmuPlateShape = plateShape(p); return true; }
      var fn = function (dry) { renderPlate(dry, ctx, p); };
      if (C.patch(body, fn, '.pmu-accfoot, .pmu-accsfoot', ctx)) { body._pmuPlateShape = plateShape(p); body._pmuPlateRows = plateRows(p); return true; }
      return platePatch(body, fn, ctx);
    }
  });
  /* WOW-SPEC-3 9.1 / N3-6: a plate whose rows changed state (Use this account, a cooldown ending, a reset passing) keeps
     its columns and patches only what changed in place: each row's class and state, its identity and action cells
     (small trees, PMU.charts.patchHtml), its meters through charts (a meter whose spec is the same is not touched, so an
     unchanged reading never moves or rolls), the foot and the "N more" line. The active light is pre-painted in every
     row (CSS shows it on the effective row), so no element is added or removed. */
  function platePatch(body, fn, ctx) {
    var dry = document.createElement('div'); dry._pmuDry = true; dry._pmuMeterRecs = [];
    try { fn(dry); } catch (error) { return false; }
    var live = body._pmuMeterRecs, next = dry._pmuMeterRecs || [];
    if (!live || next.length !== live.length || next.some(function (r, i) { return r.key !== live[i].key || !live[i].chart; })) return false;
    var a0 = body.querySelector('.pmu-acc'), a1 = dry.querySelector('.pmu-acc');
    if (!a0 || !a1 || a0.className !== a1.className || a0.getAttribute('data-mode') !== a1.getAttribute('data-mode')) return false;
    if (a0.classList.contains('is-single')) { if (!C.livePatch(body, dry, ctx)) return false; }
    else {
      var r0 = a0.querySelectorAll('.pmu-accrow'), r1 = a1.querySelectorAll('.pmu-accrow');
      if (r0.length !== r1.length) return false;
      /* a live change of the effective account (the demo hour's auto-switch) is read before anything is written: the light
         travels from the old active row to the new one after the patch (FINAL-REVIEW-3 must-fix 7) */
      var eOld = a0.querySelector('.pmu-accrow.is-eff'), eNewDry = a1.querySelector('.pmu-accrow.is-eff'), lightMove = null;
      if (ctx.reason === 'live' && !ctx.liveFinal && eOld && eNewDry && eOld.getAttribute('data-acct') !== eNewDry.getAttribute('data-acct') && !reducedNow()) {
        var eNew = a0.querySelector('.pmu-accrow[data-acct="' + eNewDry.getAttribute('data-acct') + '"]'), bd = body.closest('.pmu-board');
        if (eNew && bd) lightMove = { board: bd, br: bd.getBoundingClientRect(), from: eOld.getBoundingClientRect(), to: eNew.getBoundingClientRect(), row: eNew };
      }
      for (var i = 0; i < r0.length; i++) {
        if (r0[i].getAttribute('data-acct') !== r1[i].getAttribute('data-acct') || r0[i].querySelectorAll('.pmu-acccell').length !== r1[i].querySelectorAll('.pmu-acccell').length) return false;
        var w0 = Array.prototype.map.call(r0[i].querySelectorAll('.pmu-acccell'), function (c) { return c.getAttribute('data-win') + (c.classList.contains('is-merged') ? 'm' : ''); }).join(',');
        var w1 = Array.prototype.map.call(r1[i].querySelectorAll('.pmu-acccell'), function (c) { return c.getAttribute('data-win') + (c.classList.contains('is-merged') ? 'm' : ''); }).join(',');
        if (w0 !== w1) return false;
      }
      Array.prototype.forEach.call(r0, function (row, k) {
        var nx = r1[k];
        ['class', 'data-state', 'data-flash-sig', 'style', 'data-pm-hover-label', 'data-pm-hover-detail'].forEach(function (an) { var v = nx.getAttribute(an); if (v === null) row.removeAttribute(an); else if (row.getAttribute(an) !== v) row.setAttribute(an, v); });
        /* the state words cross-fade (160) and a Use button that becomes available fades in (200), WOW-SPEC-3 8.4 */
        var g0 = row.querySelector('.pmu-accglyph'), g1 = nx.querySelector('.pmu-accglyph'), glyphChanged = g0 && g1 && g0.innerHTML !== g1.innerHTML;
        ['.pmu-accid', '.pmu-accactcell'].forEach(function (sel) {
          var e0 = row.querySelector(sel), e1 = nx.querySelector(sel); if (!e0 || !e1 || e0.innerHTML === e1.innerHTML) return;
          C.setHtml(e0, e1.innerHTML);
          /* a state glyph that changes (a cooldown ending: hourglass -> standby check) draws in with a pop (260) */
          if (sel === '.pmu-accid' && glyphChanged && !ctx.liveFinal && !(PMU.motion.reduced && PMU.motion.reduced())) {
            var ng = e0.querySelector('.pmu-accglyph'); if (ng) PMU.motion.animate(ng, [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.2)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { dur: 260, easing: PMU.motion.family && /retro|nier/.test(PMU.motion.family()) ? 'steps(3,jump-start)' : 'cubic-bezier(.34,1.45,.64,1)' });
          }
          if (!ctx.liveFinal && !(PMU.motion.reduced && PMU.motion.reduced())) PMU.motion.animate(e0, [{ opacity: 0.25 }, { opacity: 1 }], { dur: sel === '.pmu-accactcell' ? 200 : 160, easing: 'cubic-bezier(.22,.8,.28,1)' });
        });
        Array.prototype.forEach.call(row.querySelectorAll('.pmu-acccell.is-merged'), function (c0, j) { var c1 = nx.querySelectorAll('.pmu-acccell.is-merged')[j]; if (c1 && c0.innerHTML !== c1.innerHTML) C.setHtml(c0, c1.innerHTML); });
      });
      var m0 = a0.querySelector(':scope > .pmu-more:not([data-auto])'), m1 = a1.querySelector(':scope > .pmu-more');
      if (m0 && m1) { if (m0.textContent !== m1.textContent && !m0.hasAttribute('data-base')) m0.textContent = m1.textContent; ['data-pm-hover-label', 'data-pm-hover-detail'].forEach(function (an) { if (m1.hasAttribute(an)) m0.setAttribute(an, m1.getAttribute(an)); }); }
      else if (!!m0 !== !!m1) return true;   /* the line comes or goes with an account; the next idle refresh lays it out */
    }
    next.forEach(function (r, i) { var same = false; try { same = JSON.stringify(r.spec) === JSON.stringify(live[i].spec); } catch (error) {} if (!same) C.chartTo(live[i].chart, r.spec, ctx); live[i].spec = r.spec; });
    var f0 = body.querySelector('.pmu-accfoot, .pmu-accsfoot'), f1 = dry.querySelector('.pmu-accfoot, .pmu-accsfoot');
    var swLine0 = f0 ? (Array.prototype.filter.call(f0.querySelectorAll('.pmu-accfootline'), function (l) { return /Auto-switch/.test(l.textContent); })[0] || null) : null, swText0 = swLine0 ? swLine0.textContent : '';
    if (f0 && f1 && f0.innerHTML !== f1.innerHTML) C.setHtml(f0, f1.innerHTML);
    if (typeof lightMove !== 'undefined' && lightMove) {
      travelLight(lightMove.board, lightMove.br, lightMove.from, lightMove.to);
      var gl = lightMove.row.querySelector('.pmu-accglyph'); if (gl && PMU.film && (PMU.film.halo || PMU.film.ring)) (PMU.film.halo || PMU.film.ring)(gl, { tone: 'good', delay: 300 });
      /* the switch history's new line in the plate foot flashes once */
      var swLine = f0 ? Array.prototype.filter.call(f0.querySelectorAll('.pmu-accfootline'), function (l) { return /Auto-switch/.test(l.textContent); })[0] : null;
      if (swLine && swLine.textContent !== swText0 && PMU.film && PMU.film.flash) PMU.film.flash(swLine, { delay: 380, noSweep: true });
    }
    body._pmuSig = dry._pmuSig; body._pmuFoot = dry._pmuFoot;
    var pv = PMU.roster.provider(ctx.id.replace(/^acct-/, '')); if (pv) { body._pmuPlateShape = plateShape(pv); body._pmuPlateRows = plateRows(pv); }
    return true;
  }

  /* the active light travels from one row to another (WOW-SPEC 3.9 "Use this account", WOW-SPEC-3 8.6 the demo hour's
     auto-switch; FINAL-REVIEW-3 must-fix 7: the hour's switch was a cut): one transient light in the board layer, FLIP
     from the old row's rect to the new row's, 620 (the move 420 on SLIDE, then it fades into the row's own light).
     from / to are viewport rects read before anything was written, br the board's. */
  function travelLight(board, br, from, to) {
    if (!board || !br || !from || !to || reducedNow()) return null;
    var f = PMU.motion.family ? PMU.motion.family() : 'basic', stp = f === 'retro' || f === 'nier';
    var light = document.createElement('i'); light.className = 'pmu-actlight'; light.setAttribute('aria-hidden', 'true');
    light.style.cssText = 'left:' + (to.left - br.left) + 'px;top:' + (to.top - br.top) + 'px;width:' + to.width + 'px;height:' + to.height + 'px';
    board.appendChild(light);
    var sx = from.width / Math.max(1, to.width), sy = from.height / Math.max(1, to.height);
    var an = PMU.motion.animate(light, [{ transform: 'translate(' + (from.left - to.left).toFixed(1) + 'px,' + (from.top - to.top).toFixed(1) + 'px) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')', opacity: 1 },
      { transform: 'none', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 0 }], { dur: 620, easing: stp ? 'steps(5,jump-start)' : 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    if (an && an.finished) an.finished.then(function () { light.remove(); }, function () { light.remove(); }); else light.remove();
    return an;
  }
  C.travelLight = travelLight;
  function footLinesOf(p, th) {
    var footLines = [];
    var fb = fallbackSentence(p); if (fb) footLines.push({ glyph: 'alert', tone: 'warn', html: esc(fb) });
    var mr = mostRoom(p); if (mr && p.windows.length) footLines.push({ glyph: 'info', html: esc(t('accounts.most_room', { name: mr.account.nickname, left: Math.round(mr.left) + '%' })) + (mr.account.fresh.stale ? ' <em>(' + esc(mr.account.ageText) + ')</em>' : '') });
    var evs = switchEvents(p, 2);
    /* the last switches (the policy band above says whether auto-switch is on: item 2) */
    if (!fb && evs.length) footLines.push({ glyph: 'refresh', html: esc(evs.map(function (e) { return whenText(e.at) + ' ' + e.text; }).join(' · ')) });
    return footLines;
  }
  /* what a plate shows apart from its window readings (a live beat that only moves readings keeps this) */
  /* what a plate shows of its accounts apart from their readings and the policy */
  function plateRows(p) {
    return JSON.stringify(p.accounts.map(function (a) { return [a.key, a.shownState, a.stateWord, a.effective, a.override, a.eligible.ok, a.ageText, a.binding ? a.binding.key : '', a.windows.map(function (w) { return w.pct === null ? 'n' : w.resetAt ? Math.round(w.resetAt / 60000) : 0; })]; }));
  }
  function plateShape(p) {
    var th = polOf(p);
    return JSON.stringify([th.auto, th.switchLeft, th.warnLeft, polSig(p)]) + plateRows(p);
  }
  /* every meter takes its next spec (an unchanged one is not touched): the readings of a live beat, or the notches of a
     policy change (item 2: no dry render in the toggle's click task) */
  function metersTo(body, p, ctx) {
    var recs = body._pmuMeterRecs;
    if (!recs || !recs.length || recs.some(function (r) { return !r.make || !r.chart; })) return false;
    var acc = {}; p.accounts.forEach(function (a) { acc[a.key] = a; });
    recs.forEach(function (r) {
      var k = r.key.split('|'), a = acc[k[0]]; if (!a) return;
      var w = k[1] === 'binding' ? a.binding || a.windows[0] : a.windows.filter(function (x) { return x.key === k[1]; })[0]; if (!w) return;
      var spec = r.make(a, w), same = false;
      try { same = JSON.stringify(spec) === JSON.stringify(r.spec); } catch (error) {}
      if (!same) { C.chartTo(r.chart, spec, ctx); r.spec = spec; }
    });
    return true;
  }
  /* a live beat on a plate: the readings move, nothing else did -> each meter takes its next spec through charts'
     chart.live (an unchanged meter is not touched), the foot lines patch their words; no dry render (E3-7 budget) */
  function plateLive(body, ctx) {
    var p = PMU.roster.provider(ctx.id.replace(/^acct-/, '')), recs = body._pmuMeterRecs;
    if (!p || !recs || !recs.length || body._pmuPlateShape !== plateShape(p) || !metersTo(body, p, ctx)) return false;
    var lines = footLinesOf(p, polOf(p)), shown = body.querySelectorAll('.pmu-accfootline > span:not(.pmu-ico)');   /* integ3: the glyph span is not a text slot (a live beat wrote each line into the one before it) */
    Array.prototype.forEach.call(shown, function (sp, i) { if (lines[i] && sp.innerHTML !== lines[i].html) C.setHtml(sp, lines[i].html); });
    return true;
  }
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
    /* WOW-SPEC-3 9.1 / N3-6: the column is as wide as the widest word ANY row can show in any state it can reach by a
       click (Use, Active, Active · override), so "Use this account" never re-lays the plate (5-hour / weekly columns ->
       binding window) and an unchanged reading never re-rolls */
    /* "Active · override" takes two lines in that column rather than widen it (a wider column would cost the plate its
       window columns at 1920: Codex) */
    var canWords = function (a, full) {
      var cur = actText(a, full), w = [cur.t === 'Active · override' ? { t: 'Active', btn: false } : cur];
      if (a.supportsManual) { w.push({ t: 'Active', btn: false }); w.push({ t: full ? t('accounts.use_override') : 'Use', btn: true }); }
      return w;
    };
    /* the word's measure plus its padding; a state word keeps 8 px (Mac film: "Active · override" wrapped at +2) */
    var wOf = function (x) { return x.t ? tw(x.t, 12.5, x.btn ? 600 : 640) * 1.04 + (x.btn ? 22 : 8) : 0; };
    var actW = Math.ceil(Math.max(48, Math.max.apply(null, p.accounts.map(function (a) { return Math.max.apply(null, canWords(a, false).map(wOf)); }))));
    var fullAct = n && bw >= 150 + n * 112 + 176 + GAP * (n + 1);
    if (fullAct) actW = Math.ceil(Math.max(actW, Math.max.apply(null, p.accounts.map(function (a) { return Math.max.apply(null, canWords(a, true).map(wOf)); }))));
    /* a window column keeps "78% used" and "resets in 1h 41m" on one line each from about 104 px */
    var IDENT = 112, WIN = 104;
    /* with two or more windows the identity column may go to 100 px, so a plate whose action column reserves its widest
       word ("Sign in") keeps its 5-hour and weekly columns at 1920 instead of falling back to the binding window */
    if (n >= 2 && bw < IDENT + n * WIN + actW + GAP * (n + 1)) IDENT = 100;
    var mode = !n ? 'none' : bw >= IDENT + n * WIN + actW + GAP * (n + 1) ? 'full' : bw >= 100 + WIN + actW + GAP * 2 ? 'binding' : 'narrow';
    var winTmpl = mode === 'full' ? p.windows.map(function () { return 'minmax(' + WIN + 'px,1fr)'; }).join(' ') : mode === 'binding' ? 'minmax(' + WIN + 'px,1fr)' : '';
    var tmpl = mode === 'none' ? 'minmax(0,1.3fr) minmax(0,1fr) ' + actW + 'px'
      : mode === 'narrow' ? 'minmax(0,1fr) ' + actW + 'px'
      : 'minmax(' + (mode === 'full' ? IDENT : 100) + 'px,1.5fr) ' + winTmpl + ' ' + actW + 'px';
    var band = !n || mode === 'narrow' ? '' : '<div class="pmu-colhead pmu-accband" style="grid-template-columns:' + tmpl + '"><span class="pmu-cap">ACCOUNT</span>' +
      (mode === 'binding' ? '<span class="pmu-cap">BINDING WINDOW</span>' : p.windows.map(function (w) { return '<span class="pmu-cap">' + esc(w.label.replace(/ window$/i, '').toUpperCase()) + '</span>'; }).join('')) +
      '<span></span></div>';
    /* foot copy (R-ACCT-10), most room, Codex: auto-switch state and the last two switch events */
    var th = polOf(p), footLines = footLinesOf(p, th);
    /* the provider's own auto-switch controls (item 2): always drawn, so the rows give way first */
    var polB = switchable(p) ? polBand(p, bw) : null;
    var bandH = (band ? 26 : 0) + (polB ? polB.h : 0), rowsN = p.accounts.length;
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
    /* priority: every account in comfortable rows; then fewer foot lines; then the LAST accounts in compact rows while the
       first ones keep their facts (item 2: the policy band takes about 40 px, and an all-compact plate left a free band
       under its rows); then compact rows; then fewer rows */
    var footCap = Math.min(footLines.length, C.w(ctx, 'm') ? 3 : 2), comfy = false, comfyN = 0;
    for (var k = footCap; k >= 0 && !comfy; k--) { if (bandH + sumRows(comfyHOf, rowsN) + footHOf(k) <= bh + 10) { comfy = true; footCap = k; comfyN = rowsN; } }
    if (!comfy) {
      var mixOf = function (m) { var s = 0; p.accounts.forEach(function (a, i) { s += i < m ? comfyHOf(a) : compactHOf(a); }); return s; };
      for (var kk = Math.min(footLines.length, 1); kk >= 0 && !comfyN; kk--) for (var m = rowsN - 1; m >= 1 && !comfyN; m--) if (bandH + mixOf(m) + footHOf(kk) <= bh + 10) { comfyN = m; footCap = kk; }
      if (!comfyN) footCap = Math.min(footLines.length, 1);
    }
    /* by key: a live beat's make() gets the account from a newer roster read */
    var comfyKeys = {}; p.accounts.slice(0, comfyN).forEach(function (a) { comfyKeys[a.key] = true; });
    var isComfy = function (a) { return !!comfyKeys[a.key]; };
    var rowHOf = function (a) { return isComfy(a) ? comfyHOf(a) : compactHOf(a); };
    var shownN = rowsN;
    while (shownN > 1 && bandH + sumRows(rowHOf, shownN) + footHOf(footCap) + (shownN < rowsN ? 22 : 0) > bh + 10) shownN -= 1;
    if (shownN < rowsN && footCap > 1) footCap = 1;
    var shown = p.accounts.slice(0, shownN);
    var sizeOf = function (a) { return isComfy(a) ? 'c' : 'k'; };
    var rows = shown.map(function (a) {
      var hidden = allHidden(a), act = actText(a, fullAct), comfy = isComfy(a);
      /* the effective row's state is in the action column; its meta line shows the plan */
      var stateInAct = act.t && !act.btn;
      var longState = String(a.stateWord || '').length > 12;
      var line1 = stateInAct ? (a.plan ? esc(a.plan) : '') : longState ? metaLine(a, []) : metaLine(a, ['plan']);
      var line2 = [!stateInAct && longState && a.plan ? esc(a.plan) : '', a.host ? esc(a.host) : '', a.fresh.stale ? '<span class="pmu-stale">' + C.glyph('clockCircle') + esc(a.ageText) + '</span>' : esc(a.ageText)].filter(Boolean).join('<i class="pmu-dot"> · </i>');
      var amountsLine = a.amounts.length && !hidden && n ? '<span class="pmu-amounts">' + a.amounts.slice(0, 1).map(function (x) { return esc(x.label) + ' <b>' + esc(x.value || x.word) + '</b>' + (x.suffix ? ' ' + esc(x.suffix) : ''); }).join('') + '</span>' : '';
      var ident = '<span class="pmu-accid"><span class="pmu-accglyph">' + (a.stateGlyph ? C.glyph(a.stateGlyph) : '') + '</span>' +
        '<span class="pmu-acctext"><b class="pmu-ident' + (a.effective ? ' is-eff' : p.effective ? ' is-other' : '') + '"' + C.shareAttr('acct:' + a.key) + '>' + esc(a.nickname) + '</b>' +
        (comfy ? (line1 ? '<span class="pmu-identmeta">' + line1 + '</span>' : '') + '<span class="pmu-identmeta is-2">' + line2 + '</span>' + amountsLine
          : '<span class="pmu-identmeta">' + (stateInAct ? esc(a.plan || '') : stateHtml(a, { glyph: false })) + '</span>') + '</span></span>';
      var cells;
      if (!n || hidden) {
        var word = !n ? a.noWindowsWord || 'Quota not exposed' : (a.windows[0].note && /limit/.test(a.windows[0].note) ? 'Limit not exposed' : 'Quota not exposed');
        cells = ['<span class="pmu-acccell is-merged"' + (mode === 'full' && n > 1 ? ' style="grid-column:span ' + n + '"' : '') + '>' + (a.amounts.length ? amountLines(a, 2, bw < 420) : '') +
          (!n && a.amounts.length ? '' : '<span class="pmu-accna">' + C.vs('not_exposed', word) + '</span>') + '</span>'];
      } else if (mode === 'full') cells = p.windows.map(function (w) { return '<span class="pmu-acccell" data-win="' + esc(w.key) + '"' + C.shareAttr('win:' + a.key + '/' + w.key) + '></span>'; });
      else { var bwin = a.binding || a.windows[0]; cells = ['<span class="pmu-acccell" data-win="binding"' + (bwin ? C.shareAttr('win:' + a.key + '/' + bwin.key) : '') + '></span>']; }
      var actCell = '<span class="pmu-accactcell">' + useBtn(a, fullAct) + '</span>';
      var sig = a.shownState + '|' + a.effective + '|' + a.windows.map(function (w) { return w.pct; }).join(',');
      var parts = '<i class="pmu-acclight" aria-hidden="true"></i>' + (mode === 'narrow' ? ident + actCell + cells.join('') : ident + cells.join('') + actCell);
      return '<div class="pmu-row pmu-accrow' + (comfy ? ' is-comfy' : ' is-compact') + (a.effective ? ' is-eff' : '') + '" data-reveal data-flash-key="' + esc(a.key) + '" data-flash-sig="' + esc(sig) + '" data-acct="' + esc(a.key) + '" data-state="' + a.shownState + '" data-pmu-act="acct-inspect" data-value="' + esc(a.key) + '" role="button" tabindex="0"' +
        ' style="grid-template-columns:' + tmpl + '"' + C.hover(a.nickname, a.identity + (a.routeRole ? ' · ' + a.routeRole : '') + ' · priority ' + a.priority) + '>' + parts + '</div>';
    }).join('');
    var foot = footLines.slice(0, footCap).map(function (l) { return '<span class="pmu-accfootline" data-fit-first' + (l.tone ? ' data-tone="' + l.tone + '"' : '') + '>' + C.glyph(l.glyph) + '<span>' + l.html + '</span></span>'; }).join('');
    /* the accounts and foot notes the plate has no room for are listed in the "N more" line's hover tag, or the plate's
       (CONTENT-3) */
    var accFold = p.accounts.slice(shown.length).map(function (a) { return a.nickname + ' · ' + a.stateWord + (a.binding && a.binding.pct !== null ? ' · ' + a.binding.short + ' ' + C.fmt(a.binding.pct, 'pct') + ' used' : ''); })
      .concat(footLines.slice(footCap).map(function (l) { return String(l.html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }));
    body.innerHTML = '<div class="pmu-acc is-group" data-mode="' + mode + '"' + (rowsN > shown.length ? '' : C.foldHover(accFold)) + '>' + band + '<div class="pmu-accrows">' + rows + '</div>' + C.more(rowsN - shown.length, rowsN - shown.length === 1 ? 'account' : 'accounts', false, accFold) + '</div>' +
      (polB ? polB.html : '') + (foot ? '<div class="pmu-cardfoot pmu-accfoot">' + foot + '</div>' : '');
    shown.forEach(function (a) {
      var row = body.querySelector('.pmu-accrow[data-acct="' + a.key + '"]');
      if (!row || allHidden(a) || !n) return;
      if (mode !== 'full') {
        var b = a.binding || a.windows[0];
        var host = row.querySelector('[data-win="binding"]');
        var mkB = function (a2, w2) { return Object.assign(meterOpts(a2, p, sizeOf(a2), w2, true, !isComfy(a2)), { label: w2.short }); };
        if (b) meter(body, a.key + '|binding', host, mkB(a, b), { label: a.nickname + ' ' + b.label }, mkB);
        return;
      }
      var mkW = function (a2, w2) { return Object.assign(meterOpts(a2, p, sizeOf(a2), w2, true, !isComfy(a2)), { noLabel: true }); };
      a.windows.forEach(function (w) {
        var h = row.querySelector('[data-win="' + w.key + '"]');
        /* a window column names its window in the column head, so a missing reading says "Not exposed" at every width
           (NieR Light at 1440: "Quota not exposed" ran into the next column's "17%") */
        meter(body, a.key + '|' + w.key, h, mkW(a, w), { label: a.nickname + ' ' + w.label }, mkW);
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
    wins.forEach(function (w, i) { blocks.push({ h: mh, html: '<div class="pmu-accmeter" data-win="' + esc(w.key) + '"' + C.shareAttr('win:' + a.key + '/' + w.key) + '></div>', win: w }); });
    if (!p.windows.length && (a.noWindowsWord || !a.amounts.length)) blocks.push({ h: 58, html: '<div class="pmu-accmeter is-na"><div class="pmu-natrack"></div>' + C.vs('not_exposed', a.noWindowsWord ? a.noWindowsWord.charAt(0).toUpperCase() + a.noWindowsWord.slice(1) : 'Quota not exposed') + '</div>' });
    a.amounts.forEach(function (x) { var nar = ctx.tier.bw < 260; blocks.push({ h: x.suffix && nar ? 50 : 32, html: amountLines({ amounts: [x] }, 1, nar) }); });
    /* the plate's facts in priority order, each hidden whole when it does not fit (a tall plate shows them all instead
       of an empty band); a fact's height follows its wrapped label and value. A wide plate (a 10 x 5 strip) lays them
       out in columns under its meters (C.factLayout) instead of one per line (round 3: OpenCode Go at 1920 showed no fact
       over a 75 px band) */
    /* item 2 (AAC): a provider with one account has no auto-switch controls, only this quiet line */
    var plateFacts = [['Plan', a.planLine || a.plan], ['Auto-switch', p.auto && p.auto.state === 'single' ? t('accounts.auto_single') : '', { hover: 'Auto-switch moves work between the accounts of one provider. ' + p.name + ' has one account; its own toggle and switch level appear when a second account is signed in (Settings > AI > Providers & Accounts).' }],
      ['Route role', a.routeRole], ['Auth', a.auth], ['Source', a.fresh.source], ['Default', a.isDefault ? 'yes' : 'no']]
      .concat(a.legacy ? [['Billing', a.legacy.billing_basis], ['Entitlement', a.legacy.entitlement_class], ['Settlement', a.legacy.settlement_status]] : [])
      .filter(function (f) { return f[1]; });
    var wideFacts = ctx.tier.bw >= 360 && plateFacts.length > 1;
    if (!wideFacts) plateFacts.forEach(function (f) { blocks.push({ h: C.factH(f, ctx.tier.bw), html: C.facts([f]) }); });
    /* the single plate spaces its blocks 12 px apart (consecutive facts sit flush, separated by their hairline): the
       budget counts those gaps, so the last block never slides under the footer */
    var prevFact = false;
    blocks.forEach(function (b, i) { var isFact = !b.win && b.html.indexOf('pmu-facts') >= 0; b.h += i === 0 || (isFact && prevFact) ? 0 : 12; prevFact = isFact; });
    var res = C.stack(blocks, bh - footH - 8), headP = C.smallCard(ctx);
    if (wideFacts) {
      /* the meters and amounts first (as stacked), then the facts in columns in the room they leave */
      var lay = C.factLayout(plateFacts, ctx.tier.bw, 0, 3), roomF = bh - footH - 8 - res.used - (res.used ? 12 : 0);
      var frF = lay.fit(roomF), moreF = false;
      if (frF.n < plateFacts.length && !headP && roomF - 30 >= 27) { frF = lay.fit(roomF - 30); moreF = true; }
      var hidF = plateFacts.slice(frF.n);
      if (frF.n) { res.html += lay.html(frF.n); res.used += (res.used ? 12 : 0) + frF.used; }
      hidF.forEach(function (f) { res.hidden.push({ h: 27, html: C.facts([f]) }); });
      if (!moreF && !headP && hidF.length && roomF < 60) headP = true;   /* no room even for the line: the head counts them */
    }
    /* anything that does not fit is counted on the plate's own "N more" line (inside the plate, above its footer; its
       hover tag lists them) and the line's 33 px come off the budget (CONTENT-3: the fit pass's line used to land under
       the footer after it trimmed two facts); a narrow plate counts them in its head instead (round 3) */
    if (res.hidden.length && !headP && !wideFacts) res = C.stack(blocks, bh - footH - 8 - 30);
    var hiddenWins = res.hidden.filter(function (b) { return b.win; }).length, hiddenN = res.hidden.length;
    body._pmuWinHidden = hiddenWins;
    var foot = '<div class="pmu-accsfoot"><span class="pmu-sampled' + (a.fresh.stale ? ' is-stale' : '') + '">' + (a.fresh.stale ? C.glyph('clockCircle') : '') + esc(a.fresh.ageS === null ? 'no reading yet' : 'sampled ' + a.ageText.replace(/^cached /, '')) + '</span>' +
      (ctx.tier.bw < 200 && actText(a).btn ? '' : '<span class="pmu-host">' + esc(a.host || '') + '</span>') + (actText(a).btn ? useBtn(a, false) : '') + '</div>';
    /* the windows and facts the plate has no room for: listed in the "N more" line's hover tag, or the plate's (CONTENT-3) */
    var oneFold = res.hidden.map(function (b) { return b.win ? b.win.label + ' ' + (b.win.pct === null ? PMU.roster.vsWord(b.win) : C.fmt(b.win.pct, 'pct') + ' used · ' + PMU.fmt.resetLine(b.win).text) : String(b.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    C.headMore(ctx, body, headP ? oneFold : []);
    body.innerHTML = '<div class="pmu-acc is-single" data-acct="' + esc(a.key) + '" data-state="' + a.shownState + '">' + res.html + (hiddenN && !headP ? C.countRow(oneFold) : '') + '</div>' + foot;
    var mkS = function (a2, w2) { return Object.assign(meterOpts(a2, p, size === 'i' && w2.pct !== null ? 'i' : 'k', w2, true), { label: w2.label }); };
    wins.forEach(function (w) {
      var h = body.querySelector('.pmu-accmeter[data-win="' + w.key + '"]');
      meter(body, a.key + '|' + w.key, h, mkS(a, w), { label: p.name + ' ' + w.label }, mkS);
    });
    sealPlate(body);
  }

  var FAM_SHORT = { 'claude-code': 'Claude', 'openai-codex': 'Codex', 'qwen-coding': 'Qwen', 'github-copilot': 'Copilot', 'kimi-coding': 'Kimi', 'gemini-direct': 'Gemini' };
  function famShort(p) { return FAM_SHORT[p.id] || p.name; }
  /* ================================================================== switch: the bound auto-switch strip (A1 10.3) */
  var switchImpl;
  /* the providers whose auto-switch is drawn (item 2: two or more accounts, in scope), in Settings order */
  function polFams() { return PMU.roster.read().providers.filter(function (p) { return switchable(p) && PMU.data.settingsInScope(p.id); }); }
  /* the shared setting, for every provider without its own choice (one quiet line; opens the Settings row) */
  function sharedLine(cls, short) {
    var g = PMU.roster.thresholds(), follow = polFams().filter(function (p) { return !ownAny(polOf(p)); }).map(function (p) { return p.name; });
    var words = short ? 'Shared ' + (g.auto ? b((100 - g.switchLeft) + '%') : b('off'))
      : 'Shared: ' + (g.auto ? 'switch at ' + b((100 - g.switchLeft) + '%') : 'auto-switch ' + b('off')) + ' · warn at ' + b((100 - g.warnLeft) + '%') + ' used';
    return '<span class="pmu-polshared' + (cls ? ' ' + cls : '') + '" data-pmu-act="pol-shared" role="button" tabindex="0"' + C.hover('The shared auto-switch setting', (g.auto ? 'Switches at ' + (100 - g.switchLeft) + '% used' : 'Off') + ' · warns at ' + (100 - g.warnLeft) + '% used. ' +
      (follow.length ? follow.join(', ') + ' follow' + (follow.length === 1 ? 's' : '') + ' it' : 'Every service here has its own setting') + '. Settings > AI > Providers & Accounts > Limits & switching · ' + t('accounts.not_consent')) + '>' + words + '</span>';
  }
  /* Details of the switch strips and the not-set-up lists (CONTENT-3): each provider's own policy and what it is doing,
     the shared setting, each family's most room now */
  C.kindReadings.switch = function () {
    var g = PMU.roster.thresholds(), rows = [];
    polFams().forEach(function (p) {
      var pol = polOf(p), st = p.auto || {};
      rows.push([p.name + ' · auto-switch', (pol.auto ? 'on · switches at ' + (100 - pol.switchLeft) + '% used (' + pol.switchLeft + '% left)' : 'off') + ' · warns at ' + (100 - pol.warnLeft) + '% used · ' + (ownAny(pol) ? 'its own setting' : 'shared setting')]);
      if (st.words && st.state !== 'off') rows.push([p.name + ' · now', st.words + ((st.blocked || []).length ? ' (' + st.blocked.map(function (x) { return x.account.nickname + ': ' + x.why; }).join('; ') + ')' : '')]);
      var mr = p.windows.length ? mostRoom(p) : null; if (mr) rows.push([p.name + ' · most room now', mr.text]);
    });
    rows.push(['Shared setting', (g.auto ? 'on · switches at ' + (100 - g.switchLeft) + '% used' : 'off') + ' · warns at ' + (100 - g.warnLeft) + '% used']);
    var single = PMU.roster.read().providers.filter(function (p) { return p.accounts.length === 1 && PMU.data.settingsInScope(p.id); });
    if (single.length) rows.push(['One account', single.map(function (p) { return p.name; }).join(', ') + ': auto-switch is off until a second account is signed in']);
    return rows;
  };
  C.kindReadings.providers = function (ctx) {
    var group = ctx.model && ctx.model.group, ro = PMU.roster.read(), g = ro.groups.filter(function (x) { return x.id === group; })[0];
    return g ? g.providers.filter(function (p) { return !p.accounts.length; }).map(function (p) { return [p.name, p.statusWord + ' · ' + (p.windows.length ? p.windows.map(function (w) { return w.label; }).join(', ') : 'no plan windows') + ' · ' + p.product]; }) : [];
  };
  /* the hero's sub line: how many providers switch on their own and how many accounts are at their switch point */
  function heroSub(rows) {
    var fams = polFams(), on = fams.filter(function (p) { return polOf(p).auto; }).length;
    var past = rows.filter(function (r) { return r.a.pastSwitch; }).length;
    return (!fams.length ? 'auto-switch needs two accounts' : on === fams.length ? 'auto-switch on for ' + b(fams.length) + (fams.length === 1 ? ' service' : ' services') : on ? 'auto-switch on for ' + b(on) + ' of ' + fams.length : 'auto-switch ' + b('off')) +
      (past ? ' · ' + b(past) + ' at the switch point' : '');
  }
  /* a live beat on the ladder (a binding window moved): same rows in the same order -> each row's bar, value and ramp move
     in place (ladMove), the hero number rolls and its sub follows; anything else -> the dry-render update */
  function ladderLive(body, ctx) {
    var lad = body.querySelector('.pmu-ladder'); if (!lad) return false;
    var L = C.ladderRows(), rows = lad.querySelectorAll('.pmu-ladrow');
    var byAcct = {}; L.rows.forEach(function (r) { byAcct[r.a.key] = r; });
    var order = L.rows.map(function (r) { return r.a.key; }).slice(0, rows.length).join(',');
    var shown = Array.prototype.slice.call(rows).sort(function (a, z) { return (a.style.order !== '' ? +a.style.order : 0) - (z.style.order !== '' ? +z.style.order : 0); });
    if (shown.map(function (r) { return r.getAttribute('data-acct'); }).join(',') !== order) return false;
    /* a policy change or a status change is not a reading: the update path patches it */
    if (body._pmuPolSig !== polFams().map(polSig).join('/')) return false;
    Array.prototype.forEach.call(rows, function (r0) {
      var r = byAcct[r0.getAttribute('data-acct')]; if (!r) return;
      var usedV = Math.max(0, Math.min(100, 100 - r.left)), tone = r.w.tone || 'calm';
      var tmp = document.createElement('div');
      tmp.innerHTML = '<div class="pmu-ladrow"' + (PMU.charts && PMU.charts.rampAttr ? PMU.charts.rampAttr(usedV, tone) : '') + ' style="--v:' + (+usedV.toFixed(1)) + '"><span class="pmu-ladtrack"><i class="pmu-ladfill" style="transform:translateX(' + ladOff(r.left) + '%)"></i></span><b class="pmu-ladval"><span class="pmu-num" data-v="' + Math.round(r.left) + '">' + esc(C.numOnly(Math.round(r.left), 'pct')) + '</span>%</b></div>';
      var r1 = tmp.firstChild;
      if (r0.getAttribute('data-tone') !== tone) r0.setAttribute('data-tone', tone);
      ladMove(r0, r1, ctx);
    });
    var top = L.rows[0], hn = lad.querySelector('.pmu-herohead .pmu-num[data-k]');
    if (top && hn) { var o = parseFloat(hn.getAttribute('data-v')), z = Math.round(top.left); if (isFinite(o) && o !== z) { hn.setAttribute('data-v', String(z)); if (ctx.liveFinal) hn.textContent = C.numOnly(z, 'pct'); else PMU.motion.countUp(hn, o, z, function (v) { return C.numOnly(v, 'pct'); }, { dur: 'value' }); } }
    var sub = lad.querySelector('.pmu-herosub');
    /* integ3: the render dropped trailing " · " parts by measure (heroHead); a live patch keeps that many parts (a beat had
       grown "switch at 90% used" into "... · 2 past the line" past the measured width) */
    if (sub) { var sh = heroSub(L.rows); var nShown = sub.innerHTML.split(' · ').length, shp = sh.split(' · '); if (shp.length > nShown) sh = shp.slice(0, nShown).join(' · '); if (sub.innerHTML !== sh) C.setHtml(sub, sh); }
    return true;
  }
  /* one provider's cell in the hero: its mark (and name where the cell is wide), its switch and its switch level */
  function polCell(p, named) {
    var pol = polOf(p);
    return '<div class="pmu-polcell' + (named ? ' is-named' : '') + '" data-prov="' + esc(p.id) + '"' + (pol.auto ? '' : ' data-off') + (p.auto && p.auto.warn ? ' data-tone="warn"' : '') + '>' +
      '<span class="pmu-polmark"' + C.hover(p.name, polDetail(p)) + '>' + PMU.mark(p.id, 16) + (named ? '<span class="pmu-polname">' + esc(famShort(p)) + '</span>' : '') + '</span>' +
      polToggle(p, true) + polValue(p) + '</div>';
  }
  /* the cells' grid: as many columns as fit cells of minW */
  function polCells(fams, width) {
    if (!fams.length) return '<p class="pmu-polshared is-none">' + esc(t('accounts.auto_needs_two')) + '</p>';
    /* a cell names its provider where that costs no extra row of cells (the mark alone otherwise; the hover names it) */
    var n = fams.length, plain = Math.max(1, Math.min(n, Math.floor((width + 10) / 110))), namedC = Math.max(1, Math.min(n, Math.floor((width + 10) / 160)));
    var named = Math.ceil(n / namedC) <= Math.ceil(n / plain), cols = named ? namedC : plain;
    return '<div class="pmu-polcells" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' + fams.map(function (p) { return polCell(p, named); }).join('') + '</div>';
  }
  /* what the ladder shows apart from the policies: its rows, in order, with their readings and states */
  function ladRowsSig(L) { return JSON.stringify(L.rows.map(function (r) { return [r.a.key, Math.round(r.left), r.a.effective, r.a.shownState]; })) + L.none.length; }
  /* a policy change on the ladder (item 2): the cells, the shared line, the sub and every row's notch and tone are patched
     in place without a dry render of the hero (the toggle's click task; PERF-3 "Toggle / threshold under 16 ms") */
  function ladderPol(body, ctx) {
    var lad = body.querySelector('.pmu-ladder'); if (!lad || !body._pmuLadRows) return false;
    var L = C.ladderRows(); if (body._pmuLadRows !== ladRowsSig(L)) return false;
    var fams = polFams(), cells = lad.querySelectorAll('.pmu-polcell');
    if (cells.length !== fams.length || fams.some(function (p, i) { return cells[i].getAttribute('data-prov') !== p.id; })) return false;
    var named = !!(cells[0] && cells[0].classList.contains('is-named')), reduced = PMU.motion.reduced && PMU.motion.reduced();
    var f = PMU.motion.family ? PMU.motion.family() : 'basic', stp = f === 'retro' || f === 'nier';
    var stackedNow = lad.classList.contains('is-stacked');
    var tmp = document.createElement('div'); tmp.innerHTML = '<div>' + fams.map(function (p) { return polCell(p, named); }).join('') + sharedLine('is-cap', !stackedNow) + '</div>';
    var next = tmp.firstChild;
    patchPolIn(lad, next, ctx);
    Array.prototype.forEach.call(next.querySelectorAll('.pmu-polcell'), function (c1, i) {
      var c0 = cells[i]; c0.toggleAttribute('data-off', c1.hasAttribute('data-off'));
      var tn = c1.getAttribute('data-tone'); if (tn) c0.setAttribute('data-tone', tn); else c0.removeAttribute('data-tone');
      var m1 = c1.querySelector('.pmu-polmark'), m0 = c0.querySelector('.pmu-polmark'); if (m1 && m0) copyHover(m1, m0);
    });
    var byKey = {}; L.rows.forEach(function (r) { byKey[r.a.key] = r; });
    var tw = body._pmuLadTrackW || 0;
    Array.prototype.forEach.call(lad.querySelectorAll('.pmu-ladrow'), function (r0) {
      var r = byKey[r0.getAttribute('data-acct')]; if (!r) return;
      var pol = r.a.policy || polOf(r.p), z = pol.switchLeft / 100, a = parseFloat(r0.style.getPropertyValue('--swf')), n0 = r0.querySelector('.pmu-ladnotch');
      if (n0 && isFinite(a) && a !== z) {
        r0.style.setProperty('--swf', String(z));
        if (!reduced && tw) n0._pmuSlides = [PMU.motion.animate(n0, [{ transform: 'translateX(' + (-(z - a) * tw).toFixed(1) + 'px)' }, { transform: 'none' }], { dur: stp ? 160 : 320, easing: stp ? 'steps(4,jump-start)' : 'cubic-bezier(.2,.8,.2,1)' })];
      }
      if (n0) n0.toggleAttribute('data-off', !pol.auto);
      var tone = r.w.tone || 'calm';
      if (r0.getAttribute('data-tone') !== tone) {
        r0.setAttribute('data-tone', tone);
        var rk = PMU.charts && PMU.charts.ramp ? PMU.charts.ramp(Math.max(0, Math.min(100, 100 - r.left)), tone) : null;
        if (rk && rk.ramp != null) r0.setAttribute('data-ramp', String(rk.ramp));
        if (ctx.reason !== 'live') C.flashRow(r0);
      }
    });
    var sub = lad.querySelector('.pmu-herosub');
    if (sub) { var sh = heroSub(L.rows), nShown = sub.innerHTML.split(' · ').length, shp = sh.split(' · '); if (shp.length > nShown) sh = shp.slice(0, nShown).join(' · '); if (sub.innerHTML !== sh) { C.setHtml(sub, sh); if (!reduced) PMU.motion.animate(sub, [{ opacity: 0.25 }, { opacity: 1 }], { dur: 160, easing: 'cubic-bezier(.22,.8,.28,1)' }); } }
    body._pmuPolSig = fams.map(polSig).join('/');
    return true;
  }
  C.kind('switch', switchImpl = {
    live: function (body, ctx) { return body._pmuSw && body._pmuSw.form === 'ladder' ? ladderLive(body, ctx) : false; },
    liveSig: function () {
      return JSON.stringify([polFams().map(polSig), C.ladderRows().rows.map(function (r) { return [r.a.key, r.left, r.a.effective, r.w.tone]; }),
        PMU.roster.read().providers.map(function (p) { var mr = p.accounts.length > 1 ? mostRoom(p) : null; return mr ? [p.id, mr.account.key, mr.left] : 0; })]);
    },
    render: function (body, ctx) {
      var panel = ctx.tier.w === 'xs' || ctx.tier.w === 's' || (ctx.tier.bw < 470 && ctx.tier.bh >= 96);   /* the one-line controls need about 450 px */
      var fams = polFams(), famsR = fams.filter(function (p) { return p.windows.length; }).map(function (p) { return { p: p, mr: mostRoom(p) }; });
      if (!body._pmuDry) body._pmuPolSig = fams.map(polSig).join('/');
      var ladder = ctx.tier.bw >= 420 && ctx.tier.bh >= 200 || (!panel && ctx.tier.bh >= 140 && ctx.tier.bw >= 560);
      if (ladder) { var lh = ladderHtml(ctx, fams); body.innerHTML = lh.html; if (!body._pmuDry) { body._pmuLadTrackW = lh.trackW; body._pmuLadRows = ladRowsSig(C.ladderRows()); } body._pmuSw = { form: 'ladder' }; return; }
      body._pmuSw = { form: panel ? 'panel' : 'strip' };
      /* a family row (panel) or item (strip): mark, name, its most room now, its own switch (item 2) */
      var famHtml = function (p, i, mr) {
        var hv = C.hover(p.name + ' · auto-switch', (mr ? 'Most room now ' + mr.text + ' · ' : '') + polDetail(p));
        return '<span class="pmu-swfam" data-prov="' + esc(p.id) + '"' + (polOf(p).auto ? '' : ' data-off') + hv + '>' + PMU.mark(p.id, 16) +
          '<span class="pmu-swfamname">' + esc(famName(p)) + '</span>' + (mr ? '<span class="pmu-swbar" data-i="' + i + '"></span>' : '<span class="pmu-swbar is-none">' + esc(PMU.roster.vsWord({ vs: 'unknown' })) + '</span>') + polToggle(p, true) + '</span>';
      };
      /* a family's Settings name where it fits (panel rows: 16 px mark, a bar of at least 44 px, the 30 px switch, three
         6 px gaps), else its short word (final fix M8) */
      var famName = function (p) { return !panel || C.fitsW(p.name, ctx.tier.bw * 0.54 - 16 - 12 - 2 - 36, 13, 400) ? (panel ? p.name : famShort(p)) : famShort(p); };
      var famFold = function (list) { return list.map(function (p) { var mr = mostRoom(p); return p.name + ' · auto-switch ' + (polOf(p).auto ? 'at ' + polAt(p) + '% used' : 'off') + (mr ? ' · most room now ' + mr.text : ''); }); };
      var mrOf = function (p) { var x = famsR.filter(function (y) { return y.p === p; })[0]; return x ? x.mr : null; };
      if (panel) {
        /* one row per provider, under the caption; the shared setting on the last line; providers past the room are
           counted on one "N more" line whose hover tag lists them (CONTENT-3) */
        var fit = C.fit(ctx.tier.bh - 4 - 22 - 26, 30, 0);
        if (fit < fams.length && fit > 0) fit = C.fit(ctx.tier.bh - 4 - 22 - 26 - 25, 30, 0);
        var famHid = fams.slice(fit);
        var narrowP = ctx.tier.bw < 270;
        body.innerHTML = '<div class="pmu-switch is-panel"' + (fit ? '' : C.foldHover(famFold(famHid))) + '>' +
          '<div class="pmu-cap pmu-swcap">' + (narrowP ? 'AUTO-SWITCH' : 'AUTO-SWITCH · MOST ROOM NOW') + '</div>' + (fams.length ? fams.slice(0, fit).map(function (p, i) { return famHtml(p, i, mrOf(p)); }).join('') + C.more(famHid.length, 'services', ctx.tier.bw < 260, famFold(famHid)) : '<p class="pmu-polshared is-none">' + esc(t('accounts.auto_needs_two')) + '</p>') +
          sharedLine('is-foot', ctx.tier.bw < 330) + '</div>';
      } else {
        /* two lines when the body has the height; on one line the families take what the caption (about 110 px) and the
           shared line (about 250 px) leave, whole families only */
        var two = ctx.tier.bh >= 56;
        var avail = two ? ctx.tier.bw : ctx.tier.bw - 250 - 110, n = 0;
        fams.forEach(function (p, i) { var wpx = 150 + 36 + 7 * famShort(p).length; if (n === i && avail - wpx >= 0) { avail -= wpx + 18; n += 1; } });
        /* the families a one-line strip has no room for are listed in the strip's hover tag (CONTENT-3) */
        body.innerHTML = '<div class="pmu-switch' + (two ? ' is-two' : '') + '"' + C.foldHover(famFold(fams.slice(n))) + '>' +
          (fams.length && n ? '<div class="pmu-swfams"><span class="pmu-cap">AUTO-SWITCH</span>' + fams.slice(0, n).map(function (p, i) { return famHtml(p, i, mrOf(p)); }).join('') + '</div>' : '') + sharedLine() + '</div>';
      }
      body._pmuSwCharts = [];
      fams.forEach(function (p, i) {
        var h = body.querySelector('.pmu-swbar[data-i="' + i + '"]'), mr = mrOf(p); if (!h || !mr) return;
        var spec = { pct: mr.left, tone: mr.account.binding.tone, label: p.name, hover: { label: p.name + ' · most room now', detail: mr.text + ' · ' + mr.account.binding.short + ' window · switches at ' + polAt(p) + '% used' } };
        body._pmuSwCharts.push({ spec: spec, chart: body._pmuDry ? null : C.chart(body, 'headroom', h, spec, { label: p.name + ' headroom' }) });
      });
    },
    enter: function (body, ctx, delay) { if (body.querySelector('.pmu-ladder')) enterLadder(body, ctx, delay); else C.enterAll(body, ctx, delay || 0); },
    /* every switch and level is patched in place (WOW-SPEC 3.9, WOW-TASKS N-3): a knob slides on its own CSS transition, a
       level rolls (odometer 220), the provider's notches slide 320 ms (dim when its auto-switch is off), words cross-fade;
       the room is never rendered again for them */
    update: function (body, ctx) {
      var live = body.querySelector('.pmu-switch, .pmu-ladder'); if (!live || !body._pmuSw) return false;
      if (body._pmuSw.form === 'ladder' && ctx.reason === 'settings' && ladderPol(body, ctx)) return true;
      var dry = document.createElement('div'); dry._pmuDry = true;
      try { switchImpl.render(dry, ctx); } catch (error) { return false; }
      var norm = function (root) {
        var c = root.cloneNode(true);
        Array.prototype.forEach.call(c.querySelectorAll('[data-pmu-chart]'), function (el) { el.remove(); });
        Array.prototype.forEach.call(c.querySelectorAll('.pmu-stepval, .pmu-polval, .pmu-polshared, .pmu-herosub, .pmu-heronum, .pmu-ladval'), function (el) { el.textContent = ''; });
        /* the ladder's rows compared as a set per column (a re-rank moves them in place, ladRerank) */
        Array.prototype.forEach.call(c.querySelectorAll('.pmu-ladcol'), function (col) {
          var rs = Array.prototype.slice.call(col.querySelectorAll(':scope > .pmu-ladrow')).sort(function (x, y) { return x.getAttribute('data-acct') < y.getAttribute('data-acct') ? -1 : 1; });
          rs.forEach(function (r) { col.appendChild(r); });
        });
        /* the app's hover-tag controller adds its own attributes to live nodes (data-pm-hover-*, aria-describedby) */
        return c.innerHTML.replace(/ (?:aria-checked|aria-label|aria-describedby|data-pm-hover-[a-z-]+|style|data-tone|data-ramp|data-v|data-off|disabled)(?:="[^"]*")?/g, '').replace(/ on"/g, '"');
      };
      var next = dry.querySelector('.pmu-switch, .pmu-ladder');
      var order = function (root) { return Array.prototype.map.call(root.querySelectorAll('.pmu-ladrow'), function (r) { return r.getAttribute('data-acct'); }).join(','); };
      if (!next || (dry._pmuSw || {}).form !== body._pmuSw.form) return false;
      /* a re-rank (the order of the ladder changed): rows FLIP to their new places (WOW-SPEC-3 8.4) */
      if (order(next) !== order(live) && !ladRerank(live, next, ctx)) return false;
      if (norm(next) !== norm(live)) { body._pmuPatchMiss = [norm(live), norm(next)]; return false; }
      var f = PMU.motion.family ? PMU.motion.family() : 'basic', st = f === 'retro' || f === 'nier', reduced = PMU.motion.reduced && PMU.motion.reduced();
      /* the providers' switches, levels, cells and the shared line */
      patchPolIn(live, next, ctx);
      Array.prototype.forEach.call(next.querySelectorAll('.pmu-polcell[data-prov], .pmu-swfam[data-prov]'), function (c1) {
        var c0 = live.querySelector((c1.classList.contains('pmu-polcell') ? '.pmu-polcell' : '.pmu-swfam') + '[data-prov="' + c1.getAttribute('data-prov') + '"]'); if (!c0) return;
        c0.toggleAttribute('data-off', c1.hasAttribute('data-off')); var tn = c1.getAttribute('data-tone'); if (tn) c0.setAttribute('data-tone', tn); else c0.removeAttribute('data-tone');
        copyHover(c1, c0); var m1 = c1.querySelector('.pmu-polmark'), m0 = c0.querySelector('.pmu-polmark'); if (m1 && m0) copyHover(m1, m0);
      });
      /* words cross-fade */
      ['.pmu-herosub', '.pmu-herolabel'].forEach(function (sel) {
        var a0 = live.querySelector(sel), a1 = next.querySelector(sel);
        if (a0 && a1 && a0.innerHTML !== a1.innerHTML) { C.setHtml(a0, a1.innerHTML); copyHover(a1, a0); if (ctx.reason !== 'live' && !reduced) PMU.motion.animate(a0, [{ opacity: 0.25 }, { opacity: 1 }], { dur: 160, easing: 'cubic-bezier(.22,.8,.28,1)' }); }
      });
      /* each ladder row: its provider's notch slides to the new level (or dims when that provider's auto-switch is off), the
         row takes its new tone; the track's width is known from the render (no layout read in the click task) */
      var tw = body._pmuLadTrackW || 0;
      Array.prototype.forEach.call(next.querySelectorAll('.pmu-ladrow'), function (r1) {
        var r0 = live.querySelector('.pmu-ladrow[data-acct="' + r1.getAttribute('data-acct') + '"]'); if (!r0) return;
        var n0 = r0.querySelector('.pmu-ladnotch'), n1 = r1.querySelector('.pmu-ladnotch');
        var a = parseFloat(r0.style.getPropertyValue('--swf')), z = parseFloat(r1.style.getPropertyValue('--swf'));
        if (n0 && isFinite(a) && isFinite(z) && a !== z) {
          r0.style.setProperty('--swf', String(z));
          if (!reduced && tw) n0._pmuSlides = [PMU.motion.animate(n0, [{ transform: 'translateX(' + (-(z - a) * tw).toFixed(1) + 'px)' }, { transform: 'none' }], { dur: st ? 160 : 320, easing: st ? 'steps(4,jump-start)' : 'cubic-bezier(.2,.8,.2,1)' })];
        }
        if (n0 && n1 && n0.hasAttribute('data-off') !== n1.hasAttribute('data-off')) n0.toggleAttribute('data-off', n1.hasAttribute('data-off'));
        var toneChanged = r0.getAttribute('data-tone') !== r1.getAttribute('data-tone');
        if (toneChanged) r0.setAttribute('data-tone', r1.getAttribute('data-tone'));
        ladMove(r0, r1, ctx);
        if (toneChanged && ctx.reason !== 'live') C.flashRow(r0);
      });
      (dry._pmuSwCharts || []).forEach(function (r, i) { var lc = (body._pmuSwCharts || [])[i]; if (lc && lc.chart && JSON.stringify(lc.spec) !== JSON.stringify(r.spec)) { C.chartTo(lc.chart, r.spec, ctx); lc.spec = r.spec; } });
      body._pmuPolSig = dry._pmuPolSig || polFams().map(polSig).join('/');
      if (body._pmuSw.form === 'ladder') body._pmuLadRows = ladRowsSig(C.ladderRows());
      return true;
    }
  });
  /* one ladder row takes a new reading in place: the bar slides (520 ROLL, transform), the colour follows the ramp (--v,
     data-ramp), the value rolls only its changed digits; live off screen writes final */
  function ladMove(r0, r1, ctx) {
    var f0 = r0.querySelector('.pmu-ladfill'), f1 = r1.querySelector('.pmu-ladfill');
    var n0 = r0.querySelector('.pmu-ladval .pmu-num'), n1 = r1.querySelector('.pmu-ladval .pmu-num');
    var fin = ctx.liveFinal || (PMU.motion.reduced && PMU.motion.reduced()), st = PMU.motion.family && /retro|nier/.test(PMU.motion.family());
    if (r1.hasAttribute('data-ramp')) r0.setAttribute('data-ramp', r1.getAttribute('data-ramp'));
    var v1 = r1.style.getPropertyValue('--v'); if (v1 && r0.style.getPropertyValue('--v') !== v1) r0.style.setProperty('--v', v1);
    copyHover(r1, r0);
    if (f0 && f1 && f0.style.transform !== f1.style.transform) {
      var from = f0.style.transform; f0.style.transform = f1.style.transform;
      if (!fin) PMU.motion.animate(f0, [{ transform: from }, { transform: f1.style.transform }], { dur: 520, easing: st ? 'steps(5,jump-start)' : 'cubic-bezier(.16,1,.3,1)' });
    }
    if (n0 && n1) {
      var a = parseFloat(n0.getAttribute('data-v')), z = parseFloat(n1.getAttribute('data-v'));
      if (isFinite(a) && isFinite(z) && a !== z) { n0.setAttribute('data-v', String(z)); if (fin) n0.textContent = n1.textContent; else PMU.motion.countUp(n0, a, z, function (v) { return String(Math.round(v)); }, { dur: 'value' }); }
    }
  }
  /* the ladder re-ranks in place: inside each column the rows take their new order through CSS order (no child-list
     change) and FLIP from their old slots (24 px rows, no layout read), 420 SLIDE 20 apart, the moved row carrying a soft
     highlight; a row that changes column cannot move in place (false: re-render) */
  function ladRerank(live, next, ctx) {
    var c0 = live.querySelectorAll('.pmu-ladcol'), c1 = next.querySelectorAll('.pmu-ladcol');
    if (c0.length !== c1.length) return false;
    for (var i = 0; i < c0.length; i++) {
      var a0 = Array.prototype.map.call(c0[i].querySelectorAll('.pmu-ladrow'), function (r) { return r.getAttribute('data-acct'); });
      var a1 = Array.prototype.map.call(c1[i].querySelectorAll('.pmu-ladrow'), function (r) { return r.getAttribute('data-acct'); });
      if (a0.slice().sort().join(',') !== a1.slice().sort().join(',')) return false;
    }
    var fin = ctx.liveFinal || (PMU.motion.reduced && PMU.motion.reduced()), st = PMU.motion.family && /retro|nier/.test(PMU.motion.family()), k = 0;
    Array.prototype.forEach.call(c0, function (col, ci) {
      var rows = Array.prototype.slice.call(col.querySelectorAll('.pmu-ladrow'));
      var want = Array.prototype.map.call(c1[ci].querySelectorAll('.pmu-ladrow'), function (r) { return r.getAttribute('data-acct'); });
      col.style.display = 'flex'; col.style.flexDirection = 'column';
      rows.forEach(function (r, oldI) {
        var newI = want.indexOf(r.getAttribute('data-acct'));
        r.style.order = String(newI);
        if (newI !== oldI && !fin) {
          PMU.motion.animate(r, [{ transform: 'translateY(' + ((oldI - newI) * 24) + 'px)' }, { transform: 'none' }], { dur: st ? 200 : 420, delay: 20 * (k++), easing: st ? 'steps(4,jump-start)' : 'cubic-bezier(.22,1,.36,1)' });
          if (PMU.film && PMU.film.flash && Math.abs(newI - oldI) > 0) PMU.film.flash(r, { noSweep: true, delay: 20 * k });
        }
      });
    });
    /* the live rows now read in the new order: the dry render's comparison runs against it */
    Array.prototype.forEach.call(c1, function (col, ci) { Array.prototype.forEach.call(col.querySelectorAll('.pmu-ladrow'), function (r, j) { r.style.order = String(j); }); c1[ci].style.display = 'flex'; c1[ci].style.flexDirection = 'column'; });
    return true;
  }
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
  /* a ladder bar is full width and translated (transform, so a live change runs on the compositor) */
  function ladOff(left) { return -(100 - Math.max(0.5, Math.min(100, left))).toFixed(1); }
  C.ladOff = ladOff;
  /* the hero (item 2): the side column holds the number, one cell per provider with two or more accounts (its mark, its
     own switch, its own level) and the shared setting under them; every ladder row carries its own provider's notch at that
     provider's switch point (the rows of providers that share a level line up into one dashed line). -> {html, trackW} */
  function ladderHtml(ctx, fams) {
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
    if (!stacked && lw < 2 * rowMin + 28 && lw >= 2 * Math.min(rowMin, 104 + 110 + 48) + 28) nameCol = Math.min(nameCol, Math.floor((lw - 28) / 2) - 152);
    var colsN = lw >= 2 * (104 + nameCol + 48) + 28 ? 2 : 1, rowH = 24, capH = 22, footH = L.none.length ? 20 + (stacked ? 16 : 0) : 0;
    /* the policy cells: rows of cells in the side column (or across a stacked card) */
    var namedCols = Math.floor((sideW + 10) / 160), plainCols = Math.floor((sideW + 10) / 110), n = fams.length || 1;
    var cellRows = Math.ceil(n / Math.max(1, Math.min(n, plainCols)));
    if (stacked) bh -= 66 + 10 + cellRows * 30 + 20;
    var perCol = Math.max(1, Math.floor((bh - capH - footH) / rowH)), cap = perCol * colsN;
    if (rows.length <= cap) perCol = Math.ceil(rows.length / colsN);   /* balanced columns when every row fits */
    var shown = rows.slice(0, cap), top = rows[0];
    /* the hero head sits in the side column: its words wrap at the column's width (CONTENT-3: measured at the card's
       864 px it took four lines in Glass at 1920 and ran the card 9 px past its body) */
    var headCtx = stacked ? ctx : Object.assign({}, ctx, { tier: Object.assign({}, ctx.tier, { bw: sideW }) });
    var head = top ? C.heroHead(headCtx, { value: Math.round(top.left), fmt: 'pct', label: 'left · ' + top.a.nickname + (top.a.nickname.indexOf(famShort(top.p)) >= 0 ? '' : ' · ' + famShort(top.p)), sub: heroSub(rows) }) : '';
    var cols = []; for (var c = 0; c < colsN; c++) cols.push(shown.slice(c * perCol, (c + 1) * perCol));
    /* the track's width in px, for the notch slides (the row's fixed columns and gaps take 104 px and the name column) */
    var trackW = Math.max(48, Math.floor((lw - 28 * (colsN - 1)) / colsN) - 104 - nameCol);
    /* the provider mark names the family, so a row says the account and its window ("Qwen Global wk"); the family word
       comes back only where two rows would read the same (Mac stills 2026-10-02: "Qwen Global Qwen wk" clipped) */
    var seen = dup;
    var rowHtml = function (r) {
      var winWord = winWordOf(r), pol = r.a.policy || polOf(r.p);
      var tone = r.w.tone || 'calm', eff = r.a.effective;
      var usedV = Math.max(0, Math.min(100, 100 - r.left)), rk = PMU.charts && PMU.charts.rampAttr ? PMU.charts.rampAttr(usedV, tone) : '';
      return '<div class="pmu-ladrow' + (eff ? ' is-eff' : '') + '" data-tone="' + tone + '"' + rk + ' style="--v:' + (+usedV.toFixed(1)) + ';--swf:' + (pol.switchLeft / 100) + '" data-acct="' + esc(r.a.key) + '" data-prov="' + esc(r.p.id) + '" data-pmu-act="acct-inspect" data-value="' + esc(r.a.key) + '" role="button" tabindex="0"' +
        C.hover(r.p.name + ' · ' + r.a.nickname, C.fmt(r.left, 'pct') + ' left in the ' + r.w.short.toLowerCase() + ' window · ' + PMU.fmt.resetLine(r.w).text + ' · ' + r.a.stateWord + ' · ' + r.a.ageText + ' · ' + (pol.auto ? r.p.name + ' switches at ' + (100 - pol.switchLeft) + '% used' + (pol.scope === 'account' ? ' (this account’s own point)' : '') : 'auto-switch off for ' + r.p.name)) + '>' +
        PMU.mark(r.p.id, 16) + '<span class="pmu-ladname"><b' + C.shareAttr('acct:' + r.a.key) + '>' + esc(r.a.nickname) + '</b><em>' + esc((seen[r.a.nickname] > 1 ? famShort(r.p) + ' ' : '') + winWord) + '</em></span>' +
        '<span class="pmu-ladtrack"' + C.shareAttr('win:' + r.a.key + '/' + r.w.key) + '><i class="pmu-ladfill" style="transform:translateX(' + ladOff(r.left) + '%)"></i></span>' +
        '<b class="pmu-ladval" data-share-v="win:' + esc(r.a.key + '/' + r.w.key) + '"><span class="pmu-num" data-v="' + Math.round(r.left) + '">' + esc(C.numOnly(Math.round(r.left), 'pct')) + '</span>%</b>' + (eff ? '<span class="pmu-ladact">' + C.glyph('checkCircle') + '</span>' : '<span class="pmu-ladact"></span>') +
        '<i class="pmu-ladnotch"' + (pol.auto ? '' : ' data-off') + ' aria-hidden="true"></i></div>';
    };
    var html = '<div class="pmu-ladder' + (stacked ? ' is-stacked' : '') + '" style="grid-template-columns:' + (stacked ? 'minmax(0,1fr)' : sideW + 'px minmax(0,1fr)') + ';--ln:' + nameCol + 'px">' +
      '<div class="pmu-ladside">' + head + '<div class="pmu-ladpol"><div class="pmu-polcap"><span class="pmu-cap">' + (stacked ? 'AUTO-SWITCH · EACH SERVICE AT % USED' : 'AUTO-SWITCH AT % USED') + '</span>' + sharedLine('is-cap', !stacked) + '</div>' + polCells(fams, stacked ? bw : sideW) + '</div></div>' +
      '<div class="pmu-ladmain"><div class="pmu-ladcap"><span class="pmu-cap">MOST ROOM NOW</span><span class="pmu-cap">LEFT IN THE BINDING WINDOW</span></div>' +
      '<div class="pmu-ladcols" style="grid-template-columns:repeat(' + colsN + ',minmax(0,1fr))">' + cols.map(function (cl) {
        return '<div class="pmu-ladcol">' + cl.map(rowHtml).join('') + '</div>';
      }).join('') + '</div>' +
      (rows.length > shown.length || L.none.length ? '<p class="pmu-ladfoot"' + C.foldHover(rows.slice(shown.length).map(function (r) { return r.p.name + ' · ' + r.a.nickname + ' ' + C.fmt(Math.round(r.left), 'pct') + ' left in the ' + r.w.short.toLowerCase() + ' window'; })) + '>' + esc([rows.length > shown.length ? (rows.length - shown.length) + ' more at a taller size' : '', L.none.length ? L.none.map(function (x) { return x.a.nickname + ' (' + famShort(x.p) + ')'; }).join(', ') + ': Usage unknown' : ''].filter(Boolean).join(' · ')) + '</p>' : '') +
      '</div></div>';
    return { html: html, trackW: trackW };
  }
  /* the ladder's entrance: the bars fill from the left 36 ms apart down the rows, then each row's switch notch drops in, in
     reading order (WOW-SPEC 4, Accounts) */
  function enterLadder(body, ctx, delay) {
    var d = delay || 0, f = PMU.motion.family ? PMU.motion.family() : 'basic', st = f === 'retro' || f === 'nier';
    C.enterAll(body, ctx, d);
    Array.prototype.forEach.call(body.querySelectorAll('.pmu-ladrow'), function (row, i) {
      var fill = row.querySelector('.pmu-ladfill');
      if (fill) PMU.motion.animate(fill, [{ transform: 'translateX(-100%)' }, { transform: fill.style.transform || 'translateX(0)' }], { dur: 900, delay: d + 36 * i, easing: st ? 'steps(6,jump-start)' : 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      PMU.motion.animate(row, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: 280, delay: d + 36 * i, easing: st ? 'steps(3,jump-start)' : 'cubic-bezier(.22,.8,.28,1)', fill: 'backwards' });
      var notch = row.querySelector('.pmu-ladnotch');
      if (notch) PMU.motion.animate(notch, [{ opacity: 0, transform: 'translateY(-8px) scaleY(.4)' }, { opacity: 1, transform: 'none' }], { dur: st ? 160 : 300, delay: d + 640 + 22 * i, easing: st ? 'steps(3,jump-start)' : 'cubic-bezier(.34,1.3,.64,1)', fill: 'backwards' });
    });
  }
  C.enterLadder = enterLadder;

  /* ================================================================== providers: compact rows for providers with no account (A1 10.4) */
  C.kind('providers', {
    grow: function (body) { return (body._pmuProvCols || 1) === 1; },
    render: function (body, ctx) {
      var group = ctx.model && ctx.model.group, ro = PMU.roster.read();
      var g = ro.groups.filter(function (x) { return x.id === group; })[0];
      var list = g ? g.providers.filter(function (p) { return !p.accounts.length && !(ctx.model.exclude || []).some(function (x) { return x === p.id; }); }) : [];
      if (!list.length) { body.innerHTML = C.empty('Every provider here is set up.'); return; }
      /* a wide strip lays the lines out in columns (Free and your own: three providers on one line); a column narrower than
         about 300 px puts the state word under the name, so neither breaks inside a word (LOOK-REVIEW-2 13 and 15:
         "OpenCod / e Zen", "Not / set / up") */
      var colsN = ctx.tier.bw >= 720 ? 3 : ctx.tier.bw >= 460 ? 2 : 1, colW = (ctx.tier.bw - 28 * (colsN - 1)) / colsN, stacked = colW < 300;
      if (!body._pmuDry) body._pmuProvCols = colsN;
      var word = true;
      var fit = C.fit(ctx.tier.bh, stacked ? 48 : 32, 2) * colsN;   /* measured: a stacked row 47-48 px (1440, +2 px clip) */
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
      }).join('') + C.more(list.length - shown.length, 'providers', false, list.slice(shown.length).map(function (p) { return p.name + ' · ' + p.statusWord; })) + '</div>';
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
  /* the cards that hold the bound controls, notches, switch lines and active marks are named first (NOTES3-perf C3: the
     engine may patch these in the click task and slice the rest; a refresh that does not know the option ignores it) */
  function boundCards(pid) {
    /* item 2: a provider's own change touches only the cards that show that provider (its plate, the hero's cell and
       rows, its meters elsewhere): those patch in the click task, every other card follows in slices (the old click task
       re-rendered every bound card dry: 47-55 ms of the 98-117 ms toggle task, PERF-3) */
    var board = document.getElementById('pmuBoard'), ids = [], leg = pid && PMU.roster.settingsToLegacy ? PMU.roster.settingsToLegacy(pid) : null;
    var sel = pid ? '[data-prov="' + pid + '"]' + (leg ? ', [data-prov="' + leg + '"]' : '') : '.pmu-notch, .pmu-ladnotch, .pmu-skyswitch, .pmu-toggle, .pmu-accrow.is-eff, .pmu-stepper';
    if (board) Array.prototype.forEach.call(board.querySelectorAll(':scope > .pmu-card'), function (c) {
      if (c.querySelector(sel)) ids.push(c.getAttribute('data-widget'));
    });
    return ids;
  }
  function refreshAccounts(pid) { PMU.roster.invalidate(); if (PMU.data.invalidate) PMU.data.invalidate(); if (PMU.board && PMU.board.refresh) PMU.board.refresh('settings', { first: boundCards(pid) }); }
  /* the Settings change ripples down the board (WOW-SPEC 3.9): every notch keeps its old look until its row's turn,
     30 ms apart in reading order (24 ms for a level change), then eases to the new one; the rows are patched in place,
     so the notch elements are the same before and after */
  function reducedNow() { return PMU.motion.reduced ? PMU.motion.reduced() : false; }
  /* NOTES3-perf C2: no layout read in the click task. A notch's ripple rank comes from its card's grid row and its order
     in the card (the old per-notch rect read was a 23-33 ms forced layout on the VM); the rail's --at is a style read */
  function rippleCapture() {
    var board = document.getElementById('pmuBoard'); if (!board || reducedNow()) return null;
    var ns = Array.prototype.slice.call(board.querySelectorAll('.pmu-notch, .pmu-ladnotch, .pmu-skyswitch'));
    var local = new Map(), tops = ns.map(function (n) {
      var card = n.closest('.pmu-card'); if (!card) return null;
      var k = local.get(card) || 0; local.set(card, k + 1);
      return (+card.dataset.y || 0) * 64 + Math.min(63, k);
    });
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
      if (n.classList.contains('pmu-notch') || n.classList.contains('pmu-ladnotch')) {
        var off = n.hasAttribute('data-off'), faint = n.hasAttribute('data-faint');
        if (off !== c.off || faint !== c.faint) PMU.motion.animate(n, [vis(c.off, c.faint), vis(off, faint)], { dur: stp ? 120 : 240, delay: d, easing: stp ? 'steps(3,jump-start)' : 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
        /* the rail's notch slide is kept on the rail by the chart kit (rail._pmuSlide): retimed directly, no getAnimations()
           (a style flush per call, 25-36 ms per ripple on the VM; NOTES3-perf C2) */
        var rail = n.parentNode, sl = rail && rail._pmuSlide;
        if (sl && sl.playState !== 'finished' && rail.style.getPropertyValue('--at') !== c.at) { try { sl.effect.updateTiming({ delay: d * sp, fill: 'backwards' }); } catch (error) {} }
      } else (n._pmuSlides || []).forEach(function (a) { if (a && a.playState !== 'finished') { try { a.effect.updateTiming({ delay: d * sp, fill: 'backwards' }); } catch (error) {} } });
    });
  }
  /* one auto-switch write (item 2): a provider id writes that provider's own value through the Settings transaction
     and the Settings owner (PMU.settings.setProvider); no provider id writes the shared value (setSettingFromHost). The
     notches of the providers that changed ripple down the board; the toast names the provider. */
  var POL_WORD = { 'ai.accounts.multi-account-switching': 'auto-switch', 'ai.accounts.hard-switch-level': 'switch level', 'ai.accounts.soft-warning-level': 'warn level', 'ai.accounts.cooldown-policy': 'rest after a rate limit' };
  function writePolicy(pid, id, value, step) {
    var cap = rippleCapture(), ok, p = pid ? PMU.roster.provider(pid) : null;
    if (pid) { var r = PMU.settings.setProvider(pid, id, value, 'usage.accounts'); ok = !!(r && r.ok); }
    else ok = PMU.settings.set(id, value);
    if (!ok) { PMU.shell.toast('Not saved: Settings is not available'); return false; }
    refreshAccounts(pid);
    var pol = PMU.roster.thresholds(pid || null), what = id === 'ai.accounts.multi-account-switching' ? (pol.auto ? 'auto-switch on' : 'auto-switch off')
      : id === 'ai.accounts.hard-switch-level' ? 'switches at ' + (100 - pol.switchLeft) + '% used' : id === 'ai.accounts.soft-warning-level' ? 'warns at ' + (100 - pol.warnLeft) + '% used' : POL_WORD[id] + ' ' + pol.cooldown;
    PMU.shell.toast(t('toast.saved_settings') + ' · ' + (p ? p.name : 'shared setting') + ': ' + what + (pid && value === null ? ' (shared)' : ''));
    ripplePlay(cap, step || 30);
    return true;
  }
  var IDS = function () { return PMU.roster.POLICY_IDS; };
  PMU.accounts = {
    /* providerId: that provider's own switch (item 2); none: the shared setting */
    toggleAutoSwitch: function (providerId) {
      return writePolicy(providerId || null, IDS().auto, !PMU.roster.thresholds(providerId || null).auto, 30);
    },
    setSwitchLevel: function (pctLeft, providerId) {
      var th = PMU.roster.thresholds(providerId || null);
      var v = Math.max(5, Math.min(30, Math.round(Number(pctLeft) / 5) * 5));
      if (v >= th.warnLeft) v = Math.max(5, th.warnLeft - 5);   /* the switch point stays under the warn level */
      if (v === th.switchLeft && !(providerId && !th.own.switchLeft)) return false;
      return writePolicy(providerId || null, IDS().switchLeft, v, 24);
    },
    setWarnLevel: function (pctLeft, providerId) { return writePolicy(providerId || null, IDS().warnLeft, Number(pctLeft), 24); },
    /* a provider follows the shared setting again for one value (or all four: id omitted) */
    useShared: function (providerId, id) {
      if (!providerId) return false;
      var ids = id ? [id] : [IDS().auto, IDS().switchLeft, IDS().warnLeft, IDS().cooldown], own = PMU.roster.thresholds(providerId).own || {};
      var keys = { 'ai.accounts.multi-account-switching': 'auto', 'ai.accounts.hard-switch-level': 'switchLeft', 'ai.accounts.soft-warning-level': 'warnLeft', 'ai.accounts.cooldown-policy': 'cooldown' };
      var todo = ids.filter(function (x) { return own[keys[x]]; }); if (!todo.length) return false;
      todo.slice(0, -1).forEach(function (x) { PMU.settings.setProvider(providerId, x, null, 'usage.accounts'); });
      return writePolicy(providerId, todo[todo.length - 1], null, 24);
    },
    /* "Use this account" on an account already at its provider's switch point asks first (AAC: the inline question before
       activating an account past the switch point); the answer is never consent for auto-switch */
    askUse: function (key, anchor) {
      var a = PMU.roster.account(key); if (!a || !a.eligible.ok) return null;
      if (!a.pastSwitch || !a.binding) return PMU.accounts.useAccount(key);
      var p = PMU.roster.provider(a.providerId), pol = a.policy || PMU.roster.thresholds(a.providerId), at = 100 - pol.switchLeft, used = Math.round(a.binding.pct);
      var el = anchor && anchor.isConnected ? anchor : document.querySelector('#pmuBoard .pmu-accrow[data-acct="' + key + '"] .pmu-usebtn');
      PMU.menu.choice(el, { title: used + '% used, above the ' + at + '% switch point', current: '', width: 320,
        foot: (pol.auto ? 'Auto-switch would move off it again on its next check. ' : 'Auto-switch is off for ' + (p ? p.name : 'this provider') + ', so it stays until you switch. ') + t('accounts.not_consent'),
        options: [{ value: 'use', label: 'Use ' + a.nickname + ' anyway', sub: (a.binding.short || 'Binding') + ' window ' + used + '% used · ' + PMU.fmt.resetLine(a.binding).text },
          { value: 'keep', label: p && p.effective ? 'Keep ' + p.effective.nickname : 'Cancel', sub: p && p.effective && p.effective.binding ? Math.round(p.effective.binding.pct) + '% used' : '' }],
        onPick: function (v) { if (v === 'use') PMU.accounts.useAccount(key); } });
      return null;
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
        if (from && to0) travelLight(board, br, from, to);
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
      if (a.supportsManual) acts.push({ label: t('accounts.use_override'), primary: true, disabled: !a.eligible.ok, reason: a.eligible.reason, onClick: function () { PMU.inspector.close(); PMU.accounts.askUse(key); } });
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

  /* the switches and levels name their provider (data-prov, item 2); without one they are the shared setting */
  C.act('auto', function (el) { PMU.accounts.toggleAutoSwitch(el.getAttribute('data-prov') || null); });
  C.act('sw-step', function (el) { var pid = el.getAttribute('data-prov') || null, th = PMU.roster.thresholds(pid); PMU.accounts.setSwitchLevel(th.switchLeft + 5 * (+el.getAttribute('data-value') || 0), pid); });
  C.act('sw-pick', function (el) {
    var pid = el.getAttribute('data-prov') || null, th = PMU.roster.thresholds(pid), p = pid ? PMU.roster.provider(pid) : null, g = PMU.roster.thresholds();
    var own = !p || (th.own && th.own.switchLeft);
    var levels = LEVELS.map(function (v) { return { value: v, label: (100 - v) + '% used', sub: v + '% left' + (p ? '' : v === 10 ? ' · default' : ''), disabled: v >= th.warnLeft, reason: v >= th.warnLeft ? 'At or above the warn level (' + (100 - th.warnLeft) + '% used)' : '' }; });
    var spec = { title: p ? 'Switch ' + famShort(p) + ' accounts at' : 'Switch accounts at', value: own ? th.switchLeft : 'shared', current: (100 - th.switchLeft) + '% used' + (p && !own ? ' · shared' : ''),
      foot: (p ? p.name + ' only. ' : '') + 'Shared with Settings > AI > Providers & Accounts. ' + t('accounts.not_consent'),
      onPick: function (v) { if (v === 'shared') PMU.accounts.useShared(pid, IDS().switchLeft); else PMU.accounts.setSwitchLevel(v, pid); } };
    /* a provider's menu leads with the shared setting (what it follows when it has no level of its own) */
    if (p) spec.sections = [{ rows: [{ value: 'shared', label: 'Shared setting · ' + (100 - g.switchLeft) + '% used', sub: 'Follows Settings > Limits & switching', active: !own }] },
      { label: 'ITS OWN LEVEL', rows: levels.map(function (o) { return Object.assign({ active: own && o.value === th.switchLeft }, o); }) }];
    else spec.options = levels;
    PMU.menu.choice(el, spec);
  });
  C.act('pol-shared', function () { PMU.settings.open(null, 'ai.accounts.hard-switch-level'); });
  C.act('acct-use', function (el) { PMU.accounts.askUse(el.getAttribute('data-value'), el); });
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
