/* Room hero kinds (owner: content; WOW-SPEC 4, WOW-TASKS N-2, LOOK-REVIEW-2 item 2): the signature lead card of the rooms
   that had no chart on their first screen. skyline (Overview: every provider window as a lit vertical gauge ordered by
   pressure, with the auto-switch line across), attempts (Ledger: the attempt timeline, one dot per attempt sized by its
   value on its provider's lane), flow (Source authority: readings flowing to their authority and label).
   Every value comes from PMU.roster / PMU.data / DATA (the same fixtures the other cards read); missing never draws as
   zero. The visuals are DOM boxes moved by transform and opacity only, so the entrances run on the compositor; nothing
   animates at rest. */
(function () {
  var C = PMU.content, D = PMU.data, F = PMU.fmt, b = C.b;
  var M = PMU.motion;
  function film() { return PMU.film || null; }
  function E(name, dflt) { var f = film(); return f && f.E && f.E[name] ? f.E[name] : dflt; }
  function fam() { return M.family ? M.family() : 'basic'; }
  function stepped() { var f = fam(); return f === 'retro' || f === 'nier'; }

  /* the headroom tone ramp (WOW-SPEC 2.3) through the Settings thresholds: 0 calm (< 50), 1 cyan, 2 warn, 3 crit,
     4 exhausted (100), 5 over */
  C.ramp = function (pct) {
    if (pct === null || pct === undefined || !isFinite(pct)) return null;
    var tn = PMU.roster.tone(pct);
    return tn === 'over' ? 5 : tn === 'exhausted' ? 4 : tn === 'crit' ? 3 : tn === 'warn' ? 2 : pct >= 50 ? 1 : 0;
  };

  /* ================================================================== skyline (Overview hero) */
  C.skylineModel = function () {
    var cols = [];
    PMU.roster.read().providers.forEach(function (p) {
      if (!p.effective || !D.settingsInScope(p.id)) return;
      p.effective.windows.forEach(function (w) { if (w.pct !== null) cols.push({ p: p, a: p.effective, w: w }); });
    });
    cols.sort(function (x, y) { return (y.w.pct - x.w.pct) || (x.w.resetAt || 0) - (y.w.resetAt || 0); });
    return { cols: cols, th: PMU.roster.thresholds() };
  };
  var WIN_WORD = { fiveHour: '5H', weekly: 'WK', monthly: 'MO', daily: 'DAY' };
  function skySig(m) {
    m = m || C.skylineModel();
    return JSON.stringify([m.th.auto, m.th.switchLeft, m.th.warnLeft, m.cols.map(function (c) { return [c.p.id, c.a.key, c.w.key, c.w.pct, c.w.truth, c.w.resetAt ? shortReset(c.w) : '']; })]);
  }
  /* the reset under a gauge in one short word: "1h41" today, "Tue" this week, "Nov 1" later, "-" unknown */
  function shortReset(w) {
    if (!w.resetAt || w.truth === 'unknown') return '-';
    var ms = w.resetAt - Date.now(); if (ms <= 0) return 'now';
    if (ms < 86400000) { var h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000); return h ? h + 'h' + (m < 10 ? '0' : '') + m : m + 'm'; }
    return ms < 6 * 86400000 ? F.day(w.resetAt) : F.date(w.resetAt);
  }
  var skyImpl;
  C.kind('skyline', skyImpl = {
    render: function (body, ctx) {
      var m = C.skylineModel(), cols = m.cols, th = m.th;
      if (!body._pmuDry) body._pmuSkySig = skySig(m);
      if (!cols.length) { body.innerHTML = C.empty('No provider in scope reports a window reading.', 'Missing readings are never shown as 0 %'); return; }
      var bw = ctx.tier.bw, bh = ctx.tier.bh;
      var n = Math.max(1, Math.min(cols.length, Math.floor((bw - 40) / 37)));
      var shown = cols.slice(0, n), top = cols[0];
      var heroOk = bh >= 200;
      var warnN = cols.filter(function (c) { return c.w.pct >= 100 - th.warnLeft; }).length;
      var head = heroOk ? C.heroHead(ctx, { value: top.w.pct, fmt: top.w.pct < 10 && top.w.pct % 1 ? 'pct1' : 'pct', label: 'highest window · ' + top.p.name + ' ' + top.w.short.toLowerCase(),
        sub: b(C.plural(cols.length, 'window')) + ' · ' + b(warnN) + ' at or past the warn line · ' + (th.auto ? 'auto-switch at ' + b((100 - th.switchLeft) + '%') : 'auto-switch ' + b('off')),
        tone: { 2: 'warn', 3: 'crit', 4: 'crit', 5: 'crit' }[C.ramp(top.w.pct)] || null }) : '';
      var plotH = Math.max(70, bh - (heroOk ? 66 : 0) - 20 - 44 - 8 - (cols.length > n ? 22 : 0));
      var swAt = 100 - th.switchLeft;
      body.innerHTML = '<div class="pmu-sky">' + head + '<div class="pmu-skyplot" style="--sky-h:' + plotH + 'px;grid-template-columns:repeat(' + n + ',minmax(0,1fr))">' +
        shown.map(function (c, i) {
          var w = c.w, r = C.ramp(w.pct), rl = F.resetLine(w);
          var hv = C.hover(c.p.name + ' · ' + c.a.nickname + ' · ' + w.label, C.fmt(w.pct, 'pct') + ' used · ' + C.fmt(Math.max(0, 100 - w.pct), 'pct') + ' left · ' + rl.text + ' · ' + PMU.fmt.truth(w.truth) + (w.est ? ' · estimated' : '') + ' · ' + c.a.ageText);
          return '<div class="pmu-skycol" data-ramp="' + r + '" data-i="' + i + '" data-prov="' + esc(c.p.id) + '" data-acct="' + esc(c.a.key) + '" role="button" tabindex="0"' + hv + '>' +
            '<span class="pmu-skyval"><b class="pmu-num" data-v="' + w.pct + '">' + esc(C.numOnly(w.pct, w.pct < 10 && w.pct % 1 ? 'pct1' : 'pct')) + '</b><i>%</i></span>' +
            '<span class="pmu-skytrack' + (w.est ? ' is-est' : '') + '"><i class="pmu-skyfill" style="height:' + Math.max(1.5, Math.min(100, w.pct)) + '%"></i></span>' +
            '<span class="pmu-skyfoot">' + PMU.mark(c.p.id, 16) + '<b>' + esc(WIN_WORD[w.key] || w.short.slice(0, 3).toUpperCase()) + '</b></span>' +
            '<span class="pmu-skyreset">' + esc(shortReset(w)) + '</span></div>';
        }).join('') +
        '<i class="pmu-skyswitch"' + (th.auto ? '' : ' data-off') + ' data-at="' + swAt + '" style="bottom:calc(var(--sky-foot) + ' + (swAt / 100) + ' * var(--sky-h))"><span>' + (th.auto ? swAt + '%' : 'OFF') + '</span></i>' +
        '</div>' + (cols.length > n ? C.more(cols.length - n, 'windows') : '') + '</div>';
      if (body._pmuDry) return;
      body.querySelector('.pmu-skyplot').addEventListener('click', function (event) {
        var col = event.target.closest('.pmu-skycol'); if (!col) return;
        if (PMU.accounts) PMU.accounts.inspect(col.getAttribute('data-acct'), col);
      });
    },
    /* a new reading or a Settings change patches the skyline in place: each gauge's fill slides to its new height with
       its value rolling, the auto-switch line slides to the new level (320) or dims when auto-switch is off (WOW-SPEC
       3.6, 3.9) */
    update: function (body, ctx) {
      var plot = body.querySelector('.pmu-skyplot'); if (!plot) return false;
      /* nothing the skyline shows changed: keep it as it is (a cheap check before the dry render) */
      var dsig = skySig(); if (body._pmuSkySig === dsig) return true;
      var dry = document.createElement('div'); dry._pmuDry = true;
      try { skyImpl.render(dry, ctx); } catch (error) { return false; }
      var norm = function (root) {
        var c = root.cloneNode(true);
        Array.prototype.forEach.call(c.querySelectorAll('.pmu-skyval b, .pmu-skyswitch span, .pmu-herohead'), function (el) { el.textContent = ''; });
        return c.innerHTML.replace(/ (?:style|data-ramp|data-off|data-at|data-v|data-pm-hover-[a-z-]+|aria-describedby|aria-label|data-tone)(?:="[^"]*")?/g, '');
      };
      var next = dry.querySelector('.pmu-skyplot'); if (!next || norm(next) !== norm(plot)) return false;
      var f = fam(), st = stepped(), trackH = 0;
      Array.prototype.forEach.call(next.querySelectorAll('.pmu-skycol'), function (c1, i) {
        var c0 = plot.querySelectorAll('.pmu-skycol')[i]; if (!c0) return;
        ['data-ramp', 'data-pm-hover-label', 'data-pm-hover-detail'].forEach(function (a) { c0.setAttribute(a, c1.getAttribute(a) || ''); });
        var f0 = c0.querySelector('.pmu-skyfill'), f1 = c1.querySelector('.pmu-skyfill');
        var h0 = parseFloat(f0.style.height), h1 = parseFloat(f1.style.height);
        if (isFinite(h0) && isFinite(h1) && Math.abs(h0 - h1) > 0.05) {
          if (!trackH) trackH = f0.parentNode.clientHeight;
          f0.style.height = f1.style.height;
          M.animate(f0, [{ transform: 'translateY(' + ((h1 - h0) / 100 * trackH).toFixed(1) + 'px)' }, { transform: 'none' }], { dur: 520, easing: st ? 'steps(5,jump-start)' : E('roll', 'cubic-bezier(.16,1,.3,1)') });
        }
        var n0 = c0.querySelector('.pmu-num'), n1 = c1.querySelector('.pmu-num');
        var v0 = parseFloat(n0.getAttribute('data-v')), v1 = parseFloat(n1.getAttribute('data-v'));
        if (isFinite(v0) && isFinite(v1) && v0 !== v1) { n0.setAttribute('data-v', String(v1)); M.countUp(n0, v0, v1, function (v) { return C.numOnly(v, v1 < 10 && v1 % 1 ? 'pct1' : 'pct'); }, { dur: 'value' }); C.flashRow(c0); }
      });
      var s0 = plot.querySelector('.pmu-skyswitch'), s1 = next.querySelector('.pmu-skyswitch');
      if (s0 && s1) {
        var a0 = +s0.getAttribute('data-at'), a1 = +s1.getAttribute('data-at');
        if (a0 !== a1) {
          var skyH = parseFloat(getComputedStyle(plot).getPropertyValue('--sky-h')) || 0;
          s0.setAttribute('style', s1.getAttribute('style')); s0.setAttribute('data-at', String(a1));
          M.animate(s0, [{ transform: 'translateY(' + ((a1 - a0) / 100 * skyH).toFixed(1) + 'px)' }, { transform: 'none' }], { dur: st ? 160 : 320, easing: st ? 'steps(4,jump-start)' : 'cubic-bezier(.2,.8,.2,1)' });
        }
        if (s0.hasAttribute('data-off') !== s1.hasAttribute('data-off')) {
          var off = s1.hasAttribute('data-off'); s0.toggleAttribute('data-off', off);
          M.animate(s0, off ? [{ opacity: 1 }, { opacity: 0.3 }] : [{ opacity: 0.3 }, { opacity: 1 }], { dur: st ? 120 : 240, easing: st ? 'steps(3,jump-start)' : 'cubic-bezier(.2,.8,.2,1)' });
        }
        var l0 = s0.querySelector('span'), l1 = s1.querySelector('span'); if (l0 && l1 && l0.textContent !== l1.textContent) l0.textContent = l1.textContent;
      }
      var h0 = body.querySelector('.pmu-herohead'), hh = dry.querySelector('.pmu-herohead');
      if (h0 && hh) {
        var sb0 = h0.querySelector('.pmu-herosub'), sb1 = hh.querySelector('.pmu-herosub'); if (sb0 && sb1 && sb0.innerHTML !== sb1.innerHTML) { sb0.innerHTML = sb1.innerHTML; M.animate(sb0, [{ opacity: 0.25 }, { opacity: 1 }], { dur: 160 }); }
        var hn = h0.querySelector('.pmu-num[data-k]'), hn1 = hh.querySelector('.pmu-num[data-k]');
        if (hn && hn1) { var o = parseFloat(hn.getAttribute('data-v')), z = parseFloat(hn1.getAttribute('data-v')); if (isFinite(o) && isFinite(z) && o !== z) { hn.setAttribute('data-v', String(z)); M.countUp(hn, o, z, function (v) { return C.numOnly(v, 'pct'); }, { dur: 'value' }); } }
        var lb0 = h0.querySelector('.pmu-herolabel'), lb1 = hh.querySelector('.pmu-herolabel'); if (lb0 && lb1 && lb0.textContent !== lb1.textContent) lb0.textContent = lb1.textContent;
      }
      body._pmuSkySig = dsig;
      return true;
    },
    /* the gauges fill bottom-up 40 ms apart (900 ROLL, the head lit), their values roll with them, then the auto-switch
       line draws across (360, from the axis) and its word fades in (WOW-SPEC 4, Overview) */
    enter: function (body, ctx, delay) {
      var d = delay || 0, st = stepped();
      C.enterAll(body, ctx, d);
      var cols = Array.prototype.slice.call(body.querySelectorAll('.pmu-skycol'));
      var ease = st ? 'steps(6,jump-start)' : E('roll', 'cubic-bezier(.16,1,.3,1)');
      cols.forEach(function (col, i) {
        var dl = d + 40 * i, fill = col.querySelector('.pmu-skyfill'), num = col.querySelector('.pmu-num');
        if (fill) M.animate(fill, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { dur: 900, delay: dl, easing: ease, fill: 'backwards' });
        if (num) { var to = parseFloat(num.getAttribute('data-v')); M.countUp(num, 0, to, function (v) { return C.numOnly(v, to < 10 && to % 1 ? 'pct1' : 'pct'); }, { delay: dl, dur: 900 }); }
        /* a gauge's value is not shown before its own roll starts (no row of zeros waiting) */
        var val = col.querySelector('.pmu-skyval'); if (val) M.animate(val, [{ opacity: 0 }, { opacity: 1 }], { dur: 160, delay: dl, easing: E('out', 'ease-out'), fill: 'backwards' });
        var foot = col.querySelector('.pmu-skyfoot');
        if (foot) M.animate(foot, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { dur: 260, delay: dl + 120, easing: E('out', 'ease-out'), fill: 'backwards' });
      });
      var sw = body.querySelector('.pmu-skyswitch');
      if (sw) {
        var at = d + 40 * Math.max(0, cols.length - 1) + 700;
        M.animate(sw, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { dur: 360, delay: at, easing: st ? 'steps(6,jump-start)' : E('settle', 'ease-out'), fill: 'backwards' });
        var lab = sw.querySelector('span');
        if (lab) M.animate(lab, [{ opacity: 0 }, { opacity: 1 }], { dur: 220, delay: at + 260, easing: E('out', 'ease-out'), fill: 'backwards' });
      }
    }
  });

  /* ================================================================== attempts (Ledger hero): the attempt timeline */
  C.kind('attempts', {
    render: function (body, ctx) {
      var list = D.attempts().slice().sort(function (a, z) { return new Date(a.occurred_at) - new Date(z.occurred_at); });
      if (!list.length) { body.innerHTML = C.empty('No attempts for the selected scope and range', 'Unknown is never shown as zero'); return; }
      var bw = ctx.tier.bw, bh = ctx.tier.bh, c = D.costs();
      var hrs = c.hours || 24, now = Date.now(), t0 = now - hrs * 3600000;
      var lanes = []; list.forEach(function (a) { if (lanes.indexOf(a.provider_id) < 0) lanes.push(a.provider_id); });
      var heroOk = bh >= 200;
      var value = function (a) { return (a.charge || 0) + (a.plan_allocation_estimate || 0); };
      var pending = list.filter(function (a) { return !(value(a) > 0) && /pending/i.test(a.settlement_status || ''); }).length;
      var head = heroOk ? C.heroHead(ctx, { value: list.length, fmt: 'int', label: (list.length === 1 ? 'attempt' : 'attempts') + ' · ' + D.rangeLabel(ctx.state.range),
        sub: b(C.money(c.selected)) + ' recorded value · ' + b(C.money(c.settled)) + ' settled' + (pending ? ' · ' + b(pending) + ' pending ' + (pending === 1 ? 'receipt' : 'receipts') : '') }) : '';
      var labW = bw >= 420 ? 96 : 30, axisH = 22;
      var laneH = Math.max(20, Math.min(46, Math.floor((bh - (heroOk ? 66 : 0) - axisH - 8) / lanes.length)));
      var rMax = Math.max(5, Math.floor(laneH / 2) - 2);
      var maxV = Math.max.apply(null, list.map(value).concat([0.01]));
      var x = function (t) { return Math.max(0, Math.min(100, 100 * (t - t0) / (now - t0))); };
      var ticks = [], stepH = hrs <= 5 ? 1 : hrs <= 24 ? (bw >= 700 ? 3 : 6) : hrs <= 168 ? 24 : 24 * 7;
      var first = new Date(t0); first.setMinutes(0, 0, 0); var tt = first.getTime() + 3600000;
      /* a tick closer than 64 px to NOW is dropped (its label would print over "NOW": NOW is right-aligned, about 30 px, and a
         clock label is centred, about 36 px) */
      var plotW = Math.max(60, bw - labW), guard = 64 / plotW * (now - t0);
      for (; tt < now - Math.max(1800000, guard); tt += 3600000) { var h = new Date(tt).getHours(); if (stepH >= 24 ? h === 0 : h % stepH === 0) ticks.push(tt); }
      var dots = list.map(function (a, i) {
        var t = new Date(a.occurred_at).getTime(), v = value(a), pend = !(v > 0) && /pending/i.test(a.settlement_status || '');
        var sid = PMU.roster.legacyProvider(a.provider_id), mk = PMU.markOf(sid), lane = lanes.indexOf(a.provider_id);
        var r = pend ? Math.min(7, rMax) : Math.round(Math.min(rMax, 4 + (rMax - 4) * Math.sqrt(v / maxV)));
        var hv = C.hover(a.attempt_id + ' · ' + C.legName(a.provider_id), F.clock(t) + ' · ' + (pend ? 'value not known yet · pending receipt' : C.money(v) + (a.charge ? ' settled' : ' plan estimate')) + ' · ' + a.model_id.replace(/^model:/, '') + ' · ' + a.settlement_status);
        return '<span class="pmu-atdot' + (pend ? ' is-pending' : '') + (a.charge ? '' : ' is-est') + '" data-i="' + i + '" data-vendor="' + mk.vendor + '" role="button" tabindex="0" style="left:' + x(t).toFixed(2) + '%;top:' + (lane * laneH + laneH / 2) + 'px;--r:' + r + 'px"' + hv + '></span>';
      }).join('');
      body.innerHTML = '<div class="pmu-attl">' + head + '<div class="pmu-atplot" style="--lab:' + labW + 'px;height:' + (lanes.length * laneH + axisH) + 'px">' +
        '<div class="pmu-atlanes">' + lanes.map(function (pid, k) {
          var sid = PMU.roster.legacyProvider(pid);
          return '<div class="pmu-atlane" style="top:' + (k * laneH) + 'px;height:' + laneH + 'px"><span class="pmu-atlab"' + C.hover(C.legName(pid), '') + '>' + PMU.mark(sid, 16) + (labW > 60 ? '<span>' + esc(SHORT[pid] || C.legName(pid)) + '</span>' : '') + '</span></div>';
        }).join('') + '</div>' +
        '<div class="pmu-atarea" style="height:' + (lanes.length * laneH) + 'px">' + ticks.map(function (t) { return '<i class="pmu-attick" style="left:' + x(t).toFixed(2) + '%"></i>'; }).join('') +
        '<i class="pmu-atnow"></i>' + dots + '</div>' +
        '<div class="pmu-ataxis">' + ticks.map(function (t) { return '<span style="left:' + x(t).toFixed(2) + '%">' + esc(F.clock(t)) + '</span>'; }).join('') + '<span class="is-now" style="left:100%">NOW</span></div>' +
        '</div></div>';
      body.querySelector('.pmu-atarea').addEventListener('click', function (event) {
        var dot = event.target.closest('.pmu-atdot'); if (!dot) return;
        var a = list[+dot.getAttribute('data-i')]; if (a && C.openAttempt) C.openAttempt(a, dot);
      });
    },
    /* the now line drops, then the attempts pop in time order 12 ms apart (POP); pending ones fade in hollow last
       (WOW-SPEC 4, Ledger) */
    enter: function (body, ctx, delay) {
      var d = delay || 0, st = stepped();
      C.enterAll(body, ctx, d);
      var nowEl = body.querySelector('.pmu-atnow');
      if (nowEl && film() && film().drop) film().drop(nowEl, { from: 30, delay: d });
      var dots = Array.prototype.slice.call(body.querySelectorAll('.pmu-atdot'));
      var pend = dots.filter(function (x) { return x.classList.contains('is-pending'); }), sol = dots.filter(function (x) { return !x.classList.contains('is-pending'); });
      sol.forEach(function (dot, i) {
        M.animate(dot, [{ transform: 'translate(-50%,-50%) scale(0)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }],
          { dur: 420, delay: d + 260 + 12 * i, easing: st ? 'steps(3,jump-start)' : E('pop', 'cubic-bezier(.34,1.45,.64,1)'), fill: 'backwards' });
      });
      pend.forEach(function (dot, i) {
        M.animate(dot, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(1.4)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }],
          { dur: 420, delay: d + 260 + 12 * sol.length + 120 + 60 * i, easing: E('out', 'ease-out'), fill: 'backwards' });
      });
    }
  });

  /* ================================================================== flow (Source authority hero): provenance */
  C.kind('flow', {
    render: function (body, ctx) {
      var rows = (DATA.authority || []).map(function (r) { var est = /estimate/i.test(r[1]); return { name: C.oldName(r[0]), short: SHORT[OLDID[r[0]]] || ({ 'Cache savings': 'Savings' })[r[0]] || C.oldName(r[0]), est: est, age: r[2], what: r[3], prov: est ? null : PMU.roster.legacyProvider(OLDID[r[0]] || '') }; });
      if (!rows.length) { body.innerHTML = C.empty('No readings in scope.'); return; }
      var bw = ctx.tier.bw, bh = ctx.tier.bh, heroOk = bh >= 200;
      var nRep = rows.filter(function (r) { return !r.est; }).length, nEst = rows.length - nRep;
      var head = heroOk ? C.heroHead(ctx, { value: 100, fmt: 'pct', label: 'of readings carry a named authority',
        sub: b(nRep) + ' provider reported · ' + b(nEst) + ' PM ' + (nEst === 1 ? 'estimate' : 'estimates') + ' · ' + b(0) + ' stale · ' + b(0) + ' unknown' }) : '';
      var H = Math.max(120, bh - (heroOk ? 66 : 0) - 26 - 6);
      var colW = Math.max(110, Math.min(200, Math.floor(bw * 0.26))), gapW = Math.max(40, Math.floor((bw - 3 * colW) / 2)), tight = colW < 170;
      var leftH = Math.floor((H - 6 * (rows.length - 1)) / rows.length);
      var sorted = rows.filter(function (r) { return !r.est; }).concat(rows.filter(function (r) { return r.est; }));
      var midTot = H - 12, repH = Math.round(midTot * nRep / rows.length), estH = midTot - repH;
      var mid = [{ key: 'rep', label: 'Provider reported', n: nRep, y: 0, h: repH }, { key: 'est', label: 'PM estimate', n: nEst, y: repH + 12, h: estH }];
      var x1 = colW, x2 = colW + gapW, x3 = x2 + colW, x4 = x3 + gapW;
      var paths = [], fillY = { rep: 0, est: 0 };
      sorted.forEach(function (r, i) {
        var y0 = i * (leftH + 6), m0 = r.est ? mid[1] : mid[0], share = m0.h / Math.max(1, m0.n), my = m0.y + fillY[r.est ? 'est' : 'rep'];
        fillY[r.est ? 'est' : 'rep'] += share;
        paths.push({ k: r.est ? 'est' : 'rep', d: band(x1, y0, y0 + leftH, x2, my, my + share), i: i });
      });
      var labTop = 0;
      mid.forEach(function (m0) { if (m0.n) paths.push({ k: m0.key, d: band(x3, m0.y, m0.y + m0.h, x4, labTop + (m0.key === 'rep' ? 0 : repH), labTop + (m0.key === 'rep' ? repH : repH + estH + 12)), stage: 2 }); });
      body.innerHTML = '<div class="pmu-flow">' + head + '<div class="pmu-flowcaps" style="grid-template-columns:' + colW + 'px ' + gapW + 'px ' + colW + 'px ' + gapW + 'px ' + colW + 'px">' +
        '<span class="pmu-cap">READING</span><span></span><span class="pmu-cap">AUTHORITY</span><span></span><span class="pmu-cap">LABEL</span></div>' +
        '<div class="pmu-flowplot" style="height:' + H + 'px">' +
        '<svg class="pmu-flowsvg" width="' + (x4 + colW) + '" height="' + H + '" viewBox="0 0 ' + (x4 + colW) + ' ' + H + '" aria-hidden="true">' + paths.map(function (p) {
          return '<path class="pmu-flowband" data-k="' + p.k + '" data-stage="' + (p.stage || 1) + '" d="' + p.d + '"/>';
        }).join('') + '</svg>' +
        sorted.map(function (r, i) {
          return '<div class="pmu-flowsrc" data-k="' + (r.est ? 'est' : 'rep') + '" style="top:' + (i * (leftH + 6)) + 'px;height:' + leftH + 'px;width:' + colW + 'px"' + C.hover(r.name, (r.est ? 'PM estimate' : 'provider reported') + ' · ' + r.what + ' · ' + r.age) + '>' +
            (r.prov ? PMU.mark(r.prov, 16) : C.glyph(r.est ? 'pencil' : 'check')) + '<span>' + esc(tight || (PMU.charts && PMU.charts.textW && PMU.charts.textW(r.name, 12.5, false, 560) > colW - 100) ? r.short : r.name) + '</span>' + (tight ? '' : '<em>' + esc(r.age) + '</em>') + '</div>';
        }).join('') +
        mid.map(function (m0) { return m0.n ? '<div class="pmu-flowmid" data-k="' + m0.key + '" style="left:' + x2 + 'px;top:' + m0.y + 'px;height:' + m0.h + 'px;width:' + colW + 'px"><b>' + m0.n + '</b><span>' + esc(m0.label) + '</span></div>' : ''; }).join('') +
        '<div class="pmu-flowlab" style="left:' + x4 + 'px;top:0;height:' + (repH + estH + 12) + 'px;width:' + colW + 'px"><b>' + rows.length + ' of ' + rows.length + '</b><span>labelled</span><em>0 stale · 0 unknown · freshness policy 5m</em></div>' +
        '</div></div>';
    },
    /* the bands flow left to right (one clip reveal per stage, 900 ms, the second 80 ms behind), the boxes rise in
       reading order (WOW-SPEC 4, Source authority) */
    enter: function (body, ctx, delay) {
      var d = delay || 0, st = stepped();
      C.enterAll(body, ctx, d);
      var boxes = Array.prototype.slice.call(body.querySelectorAll('.pmu-flowsrc, .pmu-flowmid, .pmu-flowlab'));
      boxes.forEach(function (bx, i) { M.animate(bx, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: 280, delay: d + 22 * i, easing: st ? 'steps(3,jump-start)' : E('out', 'ease-out'), fill: 'backwards' }); });
      var svg = body.querySelector('.pmu-flowsvg');
      if (svg) M.animate(svg, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { dur: 900, delay: d + 180, easing: st ? 'steps(10,jump-start)' : E('draw', 'cubic-bezier(.65,0,.35,1)'), fill: 'backwards' });
    }
  });
  var SHORT = { claude: 'Claude', codex: 'Codex', qwen: 'Qwen', gemini: 'Gemini', kimi: 'Kimi', copilot: 'Copilot' };
  var OLDID = { 'Claude Code': 'claude', 'Claude': 'claude', 'Codex': 'codex', 'Qwen': 'qwen', 'Gemini Direct': 'gemini', 'Gemini': 'gemini', 'Kimi': 'kimi', 'Copilot': 'copilot', 'GitHub Copilot': 'copilot' };
  /* a ribbon from [x0, a0..a1] to [x1, b0..b1] (cubic edges) */
  function band(x0, a0, a1, x1, b0, b1) {
    var mx = (x0 + x1) / 2, r = function (v) { return Math.round(v * 10) / 10; };
    return 'M' + r(x0) + ',' + r(a0) + ' C' + r(mx) + ',' + r(a0) + ' ' + r(mx) + ',' + r(b0) + ' ' + r(x1) + ',' + r(b0) + ' L' + r(x1) + ',' + r(b1) +
      ' C' + r(mx) + ',' + r(b1) + ' ' + r(mx) + ',' + r(a1) + ' ' + r(x0) + ',' + r(a1) + ' Z';
  }

  /* ================================================================== windows (Plans & limits hero): the 7-day windows line */
  /* every provider's active account on one lane, each window's next known reset as a marker on one 7-day axis from NOW,
     in its headroom tone with its window word and % used; a reset past the horizon waits at the right edge with its
     date; no reset is ever inferred (a window with no known reset shows none) */
  var SHAPE = { fiveHour: 'c', weekly: 'd', monthly: 's' };
  C.kind('windows', {
    render: function (body, ctx) {
      var lanes = [], now = Date.now(), span = 7 * 86400000, all = [];
      PMU.roster.read().providers.forEach(function (p) {
        if (!p.effective || !D.settingsInScope(p.id)) return;
        var ms = p.effective.windows.filter(function (w) { return w.pct !== null; }).map(function (w) {
          var known = w.resetAt && w.truth !== 'unknown' && w.resetAt > now;
          return { w: w, at: known ? w.resetAt : null };
        });
        if (!ms.length) return;
        lanes.push({ p: p, a: p.effective, ms: ms }); ms.forEach(function (m) { if (m.at) all.push({ p: p, a: p.effective, w: m.w, at: m.at }); });
      });
      if (!lanes.length) { body.innerHTML = C.empty('No active account reports a window.', 'Missing readings are never shown as 0 %'); return; }
      all.sort(function (x, y) { return x.at - y.at; });
      var bw = ctx.tier.bw, bh = ctx.tier.bh, heroOk = bh >= 200, next = all[0];
      var in7 = all.filter(function (x) { return x.at - now <= span; }).length;
      var head = heroOk && next ? C.heroHead(ctx, { text: F.clock(next.at), label: 'next reset · ' + next.p.name + ' ' + next.w.short.toLowerCase() + ' · ' + C.fmt(next.w.pct, 'pct') + ' used',
        sub: b(in7) + (in7 === 1 ? ' reset' : ' resets') + ' in the next 7 days · ' + b(all.length - in7) + ' later' }) : '';
      /* the lane label column is as wide as its longest name (Mac stills 2026-10-02: "Google AI Studi" cut at 132 px) */
      var laneName = function (ln) { return ln.a.nickname === ln.p.name || ln.p.name.indexOf(ln.a.nickname) >= 0 ? ln.p.name : ln.a.nickname; };
      var nameW = Math.max.apply(null, lanes.map(function (ln) { return PMU.charts && PMU.charts.textW ? PMU.charts.textW(laneName(ln), 13, false, 540) * 1.06 : laneName(ln).length * 7.4; }));
      var labW = bw >= 420 ? Math.round(Math.min(Math.max(164, bw * 0.24), Math.max(120, nameW + 16 + 7 + 14))) : 40, axisH = 24, edge = 64;
      var laneH = Math.max(20, Math.min(36, Math.floor((bh - (heroOk ? 66 : 0) - axisH - 6) / lanes.length)));
      var lanesN = Math.min(lanes.length, Math.floor((bh - (heroOk ? 66 : 0) - axisH - 6) / laneH));
      var xOf = function (t) { return Math.max(0, Math.min(100, 100 * (t - now) / span)); };
      var trackW = Math.max(60, bw - labW - edge);
      /* a day tick closer than 40 px to NOW is dropped ("NOW" printed into "SAT") */
      var days = []; var d0 = new Date(now); d0.setHours(0, 0, 0, 0); for (var k = 1; k <= 7; k++) { var dm = d0.getTime() + k * 86400000; if (dm - now < span && (dm - now) / span * trackW >= 40) days.push(dm); }
      /* each marker's words read to its right; when they would run into the next marker they read to its left, and
         when neither side has room they go to the hover only (the marker stays) */
      var labOf = function (m) { return ({ fiveHour: '5H', weekly: 'WK', monthly: 'MO' }[m.w.key] || m.w.short.slice(0, 3).toUpperCase()) + ' ' + C.fmt(m.w.pct, m.w.pct < 10 && m.w.pct % 1 ? 'pct1' : 'pct') + (m.at && m.at - now > span ? ' · ' + F.date(m.at) : ''); };
      var labPx = function (t) { return (PMU.charts && PMU.charts.textW ? PMU.charts.textW(t, 11, true) : t.length * 6.6) + 22; };
      lanes.forEach(function (ln) {
        var items = ln.ms.filter(function (m) { return m.at; }).map(function (m) {
          var beyond = m.at - now > span, x = beyond ? trackW : m.at - now < 0 ? 0 : (m.at - now) / span * trackW, w = labPx(labOf(m));
          return { m: m, x: x, w: w, beyond: beyond };
        }).sort(function (a, z) { return a.x - z.x; });
        items.forEach(function (it, i) {
          var next = items[i + 1], prev = items[i - 1];
          if (it.beyond) { it.side = (prev && prev.side === 'r' && prev.x + prev.w > it.x - it.w) ? 'none' : 'l'; it.m.side = it.side; return; }
          var rightEnd = it.x + it.w, nextStart = next ? (next.beyond ? next.x - next.w : next.x - 8) : trackW + edge;
          var leftStart = it.x - it.w, prevEnd = prev ? (prev.side === 'r' ? prev.x + prev.w : prev.x + 8) : -labW;
          it.side = rightEnd <= nextStart ? 'r' : leftStart >= prevEnd ? 'l' : 'none';
          it.m.side = it.side;
        });
      });
      var mk = function (m, ln, j) {
        var r = C.ramp(m.w.pct), beyond = m.at && m.at - now > span, x = m.at ? (beyond ? 100 : xOf(m.at)) : null;
        if (x === null) return '';
        var lab = labOf(m);
        return '<i class="pmu-wbar" data-ramp="' + r + '" style="width:' + x.toFixed(2) + '%;z-index:' + (10 - j) + '"></i>' +
          '<span class="pmu-wmk' + (beyond ? ' is-beyond' : '') + (m.side === 'l' && !beyond ? ' is-left' : '') + (m.side === 'none' ? ' no-label' : '') + '" data-ramp="' + r + '" data-shape="' + (SHAPE[m.w.key] || 'c') + '" style="' + (beyond ? 'right:-6px' : 'left:' + x.toFixed(2) + '%') + '"' +
          C.hover(ln.p.name + ' · ' + ln.a.nickname + ' · ' + m.w.label, C.fmt(m.w.pct, 'pct') + ' used · ' + F.resetLine(m.w).text + ' · ' + PMU.fmt.truth(m.w.truth)) + '><i></i><em>' + esc(lab) + '</em></span>';
      };
      body.innerHTML = '<div class="pmu-wline">' + head + '<div class="pmu-wplot" style="--lab:' + labW + 'px;--edge:' + edge + 'px;height:' + (lanesN * laneH + axisH) + 'px">' +
        '<div class="pmu-wlanes">' + lanes.slice(0, lanesN).map(function (ln, k) {
          return '<div class="pmu-wlane" style="top:' + (k * laneH) + 'px;height:' + laneH + 'px" data-acct="' + esc(ln.a.key) + '"><span class="pmu-wlab"' + C.hover(ln.p.name, ln.a.nickname) + '>' + PMU.mark(ln.p.id, 16) +
            (labW > 60 ? '<span>' + esc(laneName(ln)) + '</span>' : '') + '</span>' +
            '<span class="pmu-wtrack">' + ln.ms.slice().sort(function (x, y) { return (y.at || 0) - (x.at || 0); }).map(function (m, j) { return mk(m, ln, j); }).join('') + '</span></div>';
        }).join('') + '</div>' +
        '<div class="pmu-wgrid">' + days.map(function (t) { return '<i style="left:' + xOf(t).toFixed(2) + '%"></i>'; }).join('') + '<i class="pmu-wnow"></i></div>' +
        '<div class="pmu-waxis"><span class="is-now" style="left:0">NOW</span>' + days.map(function (t) { return '<span style="left:' + xOf(t).toFixed(2) + '%">' + esc(F.day(t)) + '</span>'; }).join('') + '</div>' +
        '</div>' + (lanes.length > lanesN ? C.more(lanes.length - lanesN, 'providers') : '') + '</div>';
      body.querySelector('.pmu-wplot').addEventListener('click', function (event) {
        var lane = event.target.closest('.pmu-wlane'); if (lane && PMU.accounts) PMU.accounts.inspect(lane.getAttribute('data-acct'), lane);
      });
    },
    /* the NOW line drops (260 SETTLE), then the reset markers pop in time order 30 ms apart (POP) (WOW-SPEC 4, Plans) */
    enter: function (body, ctx, delay) {
      var d = delay || 0, st = stepped();
      C.enterAll(body, ctx, d);
      var nowEl = body.querySelector('.pmu-wnow'); if (nowEl && film() && film().drop) film().drop(nowEl, { from: 24, delay: d });
      var mks = Array.prototype.slice.call(body.querySelectorAll('.pmu-wmk')).sort(function (a, z) { return (a.style.left ? parseFloat(a.style.left) : 101) - (z.style.left ? parseFloat(z.style.left) : 101); });
      /* each window's open span grows from NOW (600 ROLL, 30 ms apart down the lanes), its marker pops where it ends */
      Array.prototype.forEach.call(body.querySelectorAll('.pmu-wlane'), function (ln, k) {
        Array.prototype.forEach.call(ln.querySelectorAll('.pmu-wbar'), function (bar) {
          M.animate(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { dur: 600, delay: d + 200 + 30 * k, easing: st ? 'steps(6,jump-start)' : E('roll', 'cubic-bezier(.16,1,.3,1)'), fill: 'backwards' });
        });
      });
      mks.forEach(function (m, i) {
        M.animate(m, [{ transform: 'scale(0)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'scale(1)', opacity: 1 }],
          { dur: 380, delay: d + 500 + 30 * i, easing: st ? 'steps(3,jump-start)' : E('pop', 'cubic-bezier(.34,1.45,.64,1)'), fill: 'backwards' });
      });
    }
  });
})();
