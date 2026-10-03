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
  /* a tower's fill offset (translateY %, of the track's height) and its --v (0-100, one decimal) */
  function colDetail(c) { var w = c.w; return C.fmt(w.pct, 'pct') + ' used · ' + C.fmt(Math.max(0, 100 - w.pct), 'pct') + ' left · ' + F.resetLine(w).text + ' · ' + PMU.fmt.truth(w.truth) + (w.est ? ' · estimated' : '') + ' · ' + c.a.ageText; }
  function skyOff(pct) { return +(100 - Math.max(1.5, Math.min(100, pct))).toFixed(2); }
  function skyV(pct) { return +Math.max(0, Math.min(100, pct)).toFixed(1); }
  C.skyOff = skyOff; C.skyV = skyV;
  function skySig(m) {
    m = m || C.skylineModel();
    return JSON.stringify([m.th.auto, m.th.switchLeft, m.th.warnLeft, m.cols.map(function (c) { return [c.p.id, c.a.key, c.w.key, c.w.pct, c.w.truth, c.w.resetAt ? shortReset(c.w) : '']; })]);
  }
  /* the reset under a gauge in one short word: "1h41" today, "Tue" this week, "Nov 1" later, "-" unknown */
  function shortReset(w) {
    if (!w.resetAt || w.truth === 'unknown') return '-';
    var ms = w.resetAt - PMU.clock.now(); if (ms <= 0) return 'now';
    if (ms < 86400000) { var h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000); return h ? h + 'h' + (m < 10 ? '0' : '') + m : m + 'm'; }
    return ms < 6 * 86400000 ? F.day(w.resetAt) : F.date(w.resetAt);
  }
  var skyImpl;
  C.kind('skyline', skyImpl = {
    liveSig: function () { return skySig(); },
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
          var hv = C.hover(c.p.name + ' · ' + c.a.nickname + ' · ' + w.label, colDetail(c));
          var key = 'win:' + c.a.key + '/' + w.key, off = skyOff(w.pct);
          /* WOW-TASKS-3 N3-7: --v (the used value) drives the spectrum; the fill and its rider move by translateY in a
             clipped track (never by height); N3-1: the track is the window's share, the value its share text */
          return '<div class="pmu-skycol" data-ramp="' + r + '" style="--v:' + skyV(w.pct) + '" data-i="' + i + '" data-prov="' + esc(c.p.id) + '" data-acct="' + esc(c.a.key) + '" data-win="' + esc(w.key) + '" role="button" tabindex="0"' + hv + '>' +
            '<span class="pmu-skyval" data-share-v="' + esc(key) + '"><b class="pmu-num" data-v="' + w.pct + '">' + esc(C.numOnly(w.pct, w.pct < 10 && w.pct % 1 ? 'pct1' : 'pct')) + '</b><i>%</i></span>' +
            '<span class="pmu-skytrack' + (w.est ? ' is-est' : '') + '" data-share="' + esc(key) + '" data-share-dir="v"><span class="pmu-skyclip"><i class="pmu-skyfill" style="transform:translateY(' + off + '%)"><i class="pmu-skyheat"></i><i class="pmu-skyflare"></i></i></span></span>' +
            '<span class="pmu-skyfoot">' + C.shareMark(c.p.id, 16) + '<b>' + esc(WIN_WORD[w.key] || w.short.slice(0, 3).toUpperCase()) + '</b></span>' +
            '<span class="pmu-skyreset">' + esc(shortReset(w)) + '</span></div>';
        }).join('') +
        '<i class="pmu-skyswitch"' + (th.auto ? '' : ' data-off') + ' data-at="' + swAt + '" style="bottom:calc(var(--sky-foot) + ' + (swAt / 100) + ' * var(--sky-h))"><span>' + (th.auto ? swAt + '%' : 'OFF') + '</span></i>' +
        '<i class="pmu-skyfront" style="bottom:calc(var(--sky-foot) + ' + (swAt / 100) + ' * var(--sky-h))"></i>' +
        '</div>' + (cols.length > n ? C.more(cols.length - n, 'windows', false, cols.slice(n).map(function (c) { return c.p.name + ' · ' + c.a.nickname + ' · ' + c.w.label + ' ' + C.fmt(c.w.pct, 'pct') + ' used · ' + F.resetLine(c.w).text; })) : '') + '</div>';
      if (body._pmuDry) return;
      /* the plot's geometry for the beats and the toggle (no layout read later): the line runs from -4 px to the plot's
         width less 34 px; the body is the plot's width */
      body._pmuSky = { plotH: plotH, plotW: bw, n: n };
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
      /* a live beat that only moves readings (same towers in the same order, same switch line): each tower is patched
         from the model directly (no dry render: the VM budget of a beat is 8 ms) */
      if (fastLive(body, plot, ctx)) { body._pmuSkySig = dsig; return true; }
      var dry = document.createElement('div'); dry._pmuDry = true;
      try { skyImpl.render(dry, ctx); } catch (error) { return false; }
      var norm = function (root) {
        var c = root.cloneNode(true);
        Array.prototype.forEach.call(c.querySelectorAll('.pmu-skyval b, .pmu-skyswitch span, .pmu-herohead'), function (el) { el.textContent = ''; });
        return c.innerHTML.replace(/ (?:style|data-ramp|data-off|data-at|data-v|data-pm-hover-[a-z-]+|aria-describedby|aria-label|data-tone)(?:="[^"]*")?/g, '');
      };
      var next = dry.querySelector('.pmu-skyplot'); if (!next) return false;
      if (norm(next) !== norm(plot)) {
        /* the same towers in a new order (an auto-switch: the switched provider's tower takes the new account's reading and
           the skyline re-ranks): FLIP, FINAL-REVIEW-3 must-fix 7 */
        if (!rerank(plot, next, ctx)) return false;
      } else {
        Array.prototype.forEach.call(next.querySelectorAll('.pmu-skycol'), function (c1, i) {
          var c0 = plot.querySelectorAll('.pmu-skycol')[i]; if (!c0) return;
          ['data-pm-hover-label', 'data-pm-hover-detail'].forEach(function (a) { c0.setAttribute(a, c1.getAttribute(a) || ''); });
          moveTower(c0, c1, ctx, { flash: ctx.reason !== 'live', final: !!ctx.liveFinal });
        });
        var s1 = next.querySelector('.pmu-skyswitch');
        if (s1) patchSwitch(body, plot, +s1.getAttribute('data-at'), s1.hasAttribute('data-off'), (s1.querySelector('span') || {}).textContent || '', ctx);
      }
      var h0 = body.querySelector('.pmu-herohead'), hh = dry.querySelector('.pmu-herohead');
      if (h0 && hh) {
        var sb0 = h0.querySelector('.pmu-herosub'), sb1 = hh.querySelector('.pmu-herosub'); if (sb0 && sb1 && sb0.innerHTML !== sb1.innerHTML) { C.setHtml(sb0, sb1.innerHTML); if (!ctx.liveFinal) M.animate(sb0, [{ opacity: 0.25 }, { opacity: 1 }], { dur: 160 }); }
        var hn = h0.querySelector('.pmu-num[data-k]'), hn1 = hh.querySelector('.pmu-num[data-k]');
        if (hn && hn1) { var o = parseFloat(hn.getAttribute('data-v')), z = parseFloat(hn1.getAttribute('data-v')); if (isFinite(o) && isFinite(z) && o !== z) { hn.setAttribute('data-v', String(z)); if (ctx.liveFinal) hn.textContent = C.numOnly(z, 'pct'); else M.countUp(hn, o, z, function (v) { return C.numOnly(v, 'pct'); }, { dur: 'value' }); } }
        if (h0.getAttribute('data-tone') !== hh.getAttribute('data-tone')) { if (hh.getAttribute('data-tone')) h0.setAttribute('data-tone', hh.getAttribute('data-tone')); else h0.removeAttribute('data-tone'); }
        var lb0 = h0.querySelector('.pmu-herolabel'), lb1 = hh.querySelector('.pmu-herolabel'); if (lb0 && lb1 && lb0.textContent !== lb1.textContent) lb0.textContent = lb1.textContent;
      }
      body._pmuSkySig = dsig;
      return true;
    },
    /* WOW-SPEC-3 7 Overview hero: the towers rise left to right 40 apart (fill 900 ROLL with the lit cap riding the top,
       transform only); with a GPU each tower's value rolls with it, without one (the no-GPU profile) the values are final
       (PERF-3: odometer columns only where the light is); the auto-switch line is not drawn here: the room's beat draws it
       (the scan, 70-rooms-a.js). With no beat (Reduce Motion, a refresh) the line is simply there. */
    enter: function (body, ctx, delay) {
      var d = delay || 0, st = stepped(), soft = film() && film().soft ? film().soft() : false;
      C.enterAll(body, ctx, d);
      var cols = Array.prototype.slice.call(body.querySelectorAll('.pmu-skycol'));
      var ease = st ? 'steps(6,jump-start)' : E('roll', 'cubic-bezier(.16,1,.3,1)');
      cols.forEach(function (col, i) {
        var dl = d + 40 * i, num = col.querySelector('.pmu-num');
        var off = C.skyOff(parseFloat(num ? num.getAttribute('data-v') : 0) || 0);
        var fillEl = col.querySelector('.pmu-skyfill');
        if (fillEl) M.animate(fillEl, [{ transform: 'translateY(100%)' }, { transform: 'translateY(' + off + '%)' }], { dur: 900, delay: dl, easing: ease, fill: 'backwards' });
        /* the tower's value appears with its tower (final; WOW-SPEC-3 7: only the hero number rolls, PERF-3: odometer
           columns only where the light is); without a GPU it is simply there */
        var val = col.querySelector('.pmu-skyval'); if (val && !soft) M.animate(val, [{ opacity: 0 }, { opacity: 1 }], { dur: 160, delay: dl + 120, easing: E('out', 'ease-out'), fill: 'backwards' });
      });
    }
  });
  /* the skyline re-ranks (WOW-SPEC-3 8.4 "a tower whose order changes slides sideways with the skyline's FLIP (420 SLIDE,
     20 apart)", 8.6 the demo hour's auto-switch: "the skyline's Claude tower re-labels its account and drops to Lab's
     reading"; FINAL-REVIEW-3 must-fix 7: it was a cut). The towers are the same windows (provider and window) in a new
     order: the old columns' places are read once before anything is written, the plot takes the new columns, and each
     tower slides from its old place to its new one while its fill and value move from the old reading to the new one. */
  function rerank(plot, next, ctx) {
    var cols0 = Array.prototype.slice.call(plot.querySelectorAll('.pmu-skycol')), cols1 = Array.prototype.slice.call(next.querySelectorAll('.pmu-skycol'));
    if (!cols0.length || cols0.length !== cols1.length) return false;
    var idOf = function (c) { return c.getAttribute('data-prov') + '|' + c.getAttribute('data-win'); };
    var ids0 = cols0.map(idOf), ids1 = cols1.map(idOf);
    if (ids0.slice().sort().join(',') !== ids1.slice().sort().join(',')) return false;
    var quiet = M.reduced() || !!ctx.liveFinal, st = stepped();
    var xs = quiet ? null : cols0.map(function (c) { return c.offsetLeft; });
    var olds = {};
    cols0.forEach(function (c, i) { var n = c.querySelector('.pmu-num'); olds[ids0[i]] = { i: i, v: parseFloat(n && n.getAttribute('data-v')), ramp: c.getAttribute('data-ramp'), acct: c.getAttribute('data-acct') }; });
    if (PMU.charts && PMU.charts.patchHtml) PMU.charts.patchHtml(plot, next.innerHTML); else plot.innerHTML = next.innerHTML;
    plot.setAttribute('style', next.getAttribute('style') || '');
    if (quiet) return true;
    var ease = st ? 'steps(5,jump-start)' : E('roll', 'cubic-bezier(.16,1,.3,1)');
    Array.prototype.slice.call(plot.querySelectorAll('.pmu-skycol')).forEach(function (col, j) {
      var o = olds[idOf(col)]; if (!o) return;
      var n = col.querySelector('.pmu-num'), v1 = parseFloat(n && n.getAttribute('data-v'));
      if (o.i !== j && xs) M.animate(col, [{ transform: 'translateX(' + (xs[o.i] - xs[j]).toFixed(1) + 'px)' }, { transform: 'none' }], { dur: st ? 200 : 420, delay: 20 * j, easing: st ? 'steps(4,jump-start)' : 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      if (isFinite(o.v) && isFinite(v1) && o.v !== v1) {
        var fillEl = col.querySelector('.pmu-skyfill');
        if (fillEl) M.animate(fillEl, [{ transform: 'translateY(' + C.skyOff(o.v) + '%)' }, { transform: 'translateY(' + C.skyOff(v1) + '%)' }], { dur: 520, delay: 20 * j, easing: ease, fill: 'backwards' });
        var fmt = v1 < 10 && v1 % 1 ? 'pct1' : 'pct';
        M.countUp(n, o.v, v1, function (v) { return C.numOnly(v, fmt); }, { dur: 'value' });
      }
      /* the switched provider's tower re-labels its account: its foot mark rings once */
      if (o.acct !== col.getAttribute('data-acct')) { var mk = col.querySelector('.pmu-skyfoot'); if (mk && film() && film().flash) film().flash(mk, { delay: 200, noSweep: true }); }
    });
    return true;
  }
  /* one tower takes a new reading in place (a live beat, a Settings change, a refresh): the fill and its rider move from
     the old offset to the new one (520 ROLL, compositor transforms); the colour follows the ramp by a cross-fade of the
     pre-painted heat layer (it holds the old colour and fades out over 300 OUT at the end of the move, NOTES3-perf Q7);
     a crossing of the warn line flares the cap once; only the changed digits roll (the odometer leaves an unchanged
     text alone). opts.flash flashes the column (a refresh; a live beat's lead flash is the engine's). */
  function moveTower(c0, c1, ctx, opts) {
    var n1 = c1.querySelector('.pmu-num');
    return moveTowerTo(c0, parseFloat(n1 && n1.getAttribute('data-v')), c1.getAttribute('data-ramp'), ctx, opts);
  }
  function moveTowerTo(c0, v1, r1, ctx, opts) {
    opts = opts || {};
    var n0 = c0.querySelector('.pmu-num');
    var v0 = parseFloat(n0 && n0.getAttribute('data-v'));
    if (!isFinite(v0) || !isFinite(v1) || v0 === v1) return false;
    var st = stepped(), quiet = M.reduced() || opts.final;
    var r0 = c0.getAttribute('data-ramp'); r1 = String(r1);
    var off0 = C.skyOff(v0), off1 = C.skyOff(v1);
    var moving = Array.prototype.slice.call(c0.querySelectorAll('.pmu-skyfill'));
    moving.forEach(function (el) { el.style.transform = 'translateY(' + off1 + '%)'; });
    var heat = c0.querySelector('.pmu-skyheat');
    if (heat && !quiet && (r0 !== r1 || r1 === '0' || r1 === '1')) {
      heat.setAttribute('data-ramp', r0); heat.style.setProperty('--v', String(C.skyV(v0)));
    }
    c0.setAttribute('data-ramp', r1); c0.style.setProperty('--v', String(C.skyV(v1)));
    n0.setAttribute('data-v', String(v1));
    var fmt = v1 < 10 && v1 % 1 ? 'pct1' : 'pct';
    if (quiet) { n0.textContent = C.numOnly(v1, fmt); return true; }
    var dur = 520, ease = st ? 'steps(5,jump-start)' : E('roll', 'cubic-bezier(.16,1,.3,1)');
    moving.forEach(function (el) { M.animate(el, [{ transform: 'translateY(' + off0 + '%)' }, { transform: 'translateY(' + off1 + '%)' }], { dur: dur, easing: ease }); });
    if (heat && heat.hasAttribute('data-ramp')) M.animate(heat, [{ opacity: 1 }, { opacity: 1, offset: dur / (dur + 300) }, { opacity: 0 }], { dur: dur + 300, easing: 'linear' });
    var crossed = (+r1 >= 2) && (+r0 < 2);
    var flare = c0.querySelector('.pmu-skyflare');
    if (crossed && flare) M.animate(flare, [{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { dur: 260 * 2, delay: dur - 120, easing: E('out', 'ease-out'), fill: 'backwards' });
    M.countUp(n0, v0, v1, function (v) { return C.numOnly(v, fmt); }, { dur: 'value' });
    if (opts.flash) C.flashRow(c0);
    return true;
  }
  C.moveTower = moveTower;
  /* the auto-switch line takes a new level or state in place (WOW-SPEC-3 9.2): a new level slides 320 SLIDE and the towers
     now at or past it flare once; off, the line dims with a light front running right to left (360 SLIDE); on, it draws
     left to right with the scan (520) and the caps flare as the front passes. Animations are kept on the element
     (_pmuSlides) so the Settings ripple retimes them without getAnimations() (NOTES3-perf C2). */
  function patchSwitch(body, plot, a1, off1, label, ctx) {
    var s0 = plot.querySelector('.pmu-skyswitch'); if (!s0) return;
    var st = stepped(), a0 = +s0.getAttribute('data-at'), fr0 = plot.querySelector('.pmu-skyfront');
    if (a0 !== a1) {
      var skyH = (body._pmuSky && body._pmuSky.plotH) || 0, bottom = 'calc(var(--sky-foot) + ' + (a1 / 100) + ' * var(--sky-h))';
      s0.style.bottom = bottom; s0.setAttribute('data-at', String(a1)); if (fr0) fr0.style.bottom = bottom;
      s0._pmuSlides = [M.animate(s0, [{ transform: 'translateY(' + ((a1 - a0) / 100 * skyH).toFixed(1) + 'px)' }, { transform: 'none' }], { dur: st ? 160 : 320, easing: st ? 'steps(4,jump-start)' : 'cubic-bezier(.22,1,.36,1)' })];
      if (!off1 && !M.reduced()) Array.prototype.forEach.call(plot.querySelectorAll('.pmu-skycol'), function (col) {
        var v = parseFloat(col.querySelector('.pmu-num').getAttribute('data-v')), fl = col.querySelector('.pmu-skyflare');
        if (fl && v >= a1) M.animate(fl, [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { dur: 260, delay: st ? 160 : 260, easing: E('out', 'ease-out'), fill: 'backwards' });
      });
    }
    if (s0.hasAttribute('data-off') !== off1) {
      s0.toggleAttribute('data-off', off1);
      s0._pmuSlides = (s0._pmuSlides || []).concat([M.animate(s0, off1 ? [{ opacity: 1 }, { opacity: 0.3 }] : [{ opacity: 0.3 }, { opacity: 1 }], { dur: st ? 120 : off1 ? 360 : 240, easing: st ? 'steps(3,jump-start)' : 'cubic-bezier(.2,.8,.2,1)' })]);
      if (ctx.reason !== 'live') C.skyScan(body, off1 ? { dir: -1, dur: 360, delay: 180, flare: false } : { dir: 1, dur: 520, delay: 180, draw: true });
    }
    var l0 = s0.querySelector('span'); if (l0 && label && l0.textContent !== label) l0.textContent = label;
  }
  function fastLive(body, plot, ctx) {
    var m = C.skylineModel(), sw = plot.querySelector('.pmu-skyswitch');
    /* the towers in their shown order (a re-rank moves them by CSS order, never in the DOM) */
    var cols = Array.prototype.slice.call(plot.querySelectorAll('.pmu-skycol')).sort(function (a, z) { return (a.style.order !== '' ? +a.style.order : +a.dataset.i) - (z.style.order !== '' ? +z.style.order : +z.dataset.i); });
    if (!cols.length || m.cols.length < cols.length || !sw) return false;
    var keyOf = function (el) { return el.getAttribute('data-acct') + '/' + el.getAttribute('data-win'); };
    var shown = m.cols.slice(0, cols.length), want = shown.map(function (c) { return c.a.key + '/' + c.w.key; }), have = cols.map(keyOf);
    if (want.slice().sort().join(',') !== have.slice().sort().join(',')) return false;
    var more = body.querySelector('.pmu-sky > .pmu-more');
    if ((m.cols.length > cols.length) !== !!more) return false;
    /* WOW-SPEC-3 8.4: a tower whose order changes slides sideways to its new slot (FLIP 420 SLIDE, 20 apart); slots from the
       render's geometry (no layout read) */
    if (want.join(',') !== have.join(',')) {
      var g = body._pmuSky || { plotW: 0, n: cols.length }, n = cols.length, pitch = g.plotW ? (g.plotW - 40 - 8 * (n - 1)) / n + 8 : 0, k = 0;
      var quiet = M.reduced() || ctx.liveFinal, st = stepped();
      cols.forEach(function (el, oldI) {
        var newI = want.indexOf(keyOf(el)); el.style.order = String(newI);
        if (newI !== oldI && pitch && !quiet) M.animate(el, [{ transform: 'translateX(' + ((oldI - newI) * pitch).toFixed(1) + 'px)' }, { transform: 'none' }], { dur: st ? 200 : 420, delay: 20 * (k++), easing: st ? 'steps(4,jump-start)' : 'cubic-bezier(.22,1,.36,1)' });
      });
      cols.sort(function (a, z) { return +a.style.order - +z.style.order; });
    }
    patchSwitch(body, plot, 100 - m.th.switchLeft, !m.th.auto, m.th.auto ? (100 - m.th.switchLeft) + '%' : 'OFF', ctx);
    cols.forEach(function (c0, k) {
      var c = m.cols[k];
      moveTowerTo(c0, c.w.pct, C.ramp(c.w.pct), ctx, { final: !!ctx.liveFinal, flash: ctx.reason !== 'live' });
      var det = colDetail(c); if (c0.getAttribute('data-pm-hover-detail') !== det) c0.setAttribute('data-pm-hover-detail', det);
      var rs = c0.querySelector('.pmu-skyreset'), rt = shortReset(c.w); if (rs && rs.textContent !== rt) rs.textContent = rt;
    });
    var h0 = body.querySelector('.pmu-herohead');
    if (h0) {
      var tmp = document.createElement('div'), top = m.cols[0], th = m.th;
      var warnN = m.cols.filter(function (c) { return c.w.pct >= 100 - th.warnLeft; }).length;
      tmp.innerHTML = C.heroHead(ctx, { value: top.w.pct, fmt: top.w.pct < 10 && top.w.pct % 1 ? 'pct1' : 'pct', label: 'highest window · ' + top.p.name + ' ' + top.w.short.toLowerCase(),
        sub: b(C.plural(m.cols.length, 'window')) + ' · ' + b(warnN) + ' at or past the warn line · ' + (th.auto ? 'auto-switch at ' + b((100 - th.switchLeft) + '%') : 'auto-switch ' + b('off')),
        tone: { 2: 'warn', 3: 'crit', 4: 'crit', 5: 'crit' }[C.ramp(top.w.pct)] || null });
      var hh = tmp.firstChild;
      var sb0 = h0.querySelector('.pmu-herosub'), sb1 = hh.querySelector('.pmu-herosub'); if (sb0 && sb1 && sb0.innerHTML !== sb1.innerHTML) C.setHtml(sb0, sb1.innerHTML);
      var lb0 = h0.querySelector('.pmu-herolabel'), lb1 = hh.querySelector('.pmu-herolabel'); if (lb0 && lb1 && lb0.textContent !== lb1.textContent) lb0.textContent = lb1.textContent;
      if (h0.getAttribute('data-tone') !== hh.getAttribute('data-tone')) { if (hh.getAttribute('data-tone')) h0.setAttribute('data-tone', hh.getAttribute('data-tone')); else h0.removeAttribute('data-tone'); }
      var hn = h0.querySelector('.pmu-num[data-k]'), o = parseFloat(hn && hn.getAttribute('data-v')), z = top.w.pct;
      if (hn && isFinite(o) && o !== z) { hn.setAttribute('data-v', String(z)); if (ctx.liveFinal) hn.textContent = C.numOnly(z, 'pct'); else M.countUp(hn, o, z, function (v) { return C.numOnly(v, 'pct'); }, { dur: 'value' }); }
    }
    return true;
  }

  /* the time (0..1 of the duration) at which a cubic-bezier easing reaches a progress p (the light front passing a tower) */
  function easeInv(cb, p) {
    if (!cb) return p;
    var bx = function (u) { return 3 * cb[0] * u * (1 - u) * (1 - u) + 3 * cb[2] * u * u * (1 - u) + u * u * u; };
    var by = function (u) { return 3 * cb[1] * u * (1 - u) * (1 - u) + 3 * cb[3] * u * u * (1 - u) + u * u * u; };
    var lo = 0, hi = 1;
    for (var k = 0; k < 24; k++) { var mid = (lo + hi) / 2; if (by(mid) < p) lo = mid; else hi = mid; }
    return Math.max(0, Math.min(1, bx((lo + hi) / 2)));
  }
  C.easeInv = easeInv;
  var SLIDE = [0.22, 1, 0.36, 1];
  /* the light front along the auto-switch line (WOW-SPEC-3 7 Overview beat, 9.2 toggle): dir 1 runs left to right (with
     draw: the line draws from the left, scaleX on its own layer, 520 SLIDE), dir -1 runs right to left (the toggle off,
     360 SLIDE); each tower's cap flares once as the front passes it (flare: 'all' | 'past' = only the towers at or past
     the line | false). Geometry from the render (body._pmuSky), no layout read. Returns the time the front leaves the
     plot (ms after o.delay). Every animation is created now with its delay (one task). */
  C.skyScan = function (body, o) {
    o = o || {};
    var g = body && body._pmuSky, sw = body && body.querySelector('.pmu-skyswitch'), front = body && body.querySelector('.pmu-skyfront');
    if (!g || !sw || M.reduced()) return 0;
    var st = stepped(), dir = o.dir || 1, dur = o.dur || (dir > 0 ? 520 : 360), d = o.delay || 0;
    var ease = st ? 'steps(8,jump-start)' : 'cubic-bezier(' + SLIDE.join(',') + ')';
    var span = Math.max(40, g.plotW - 30);
    if (o.draw) M.animate(sw, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { dur: dur, delay: d, easing: ease, fill: 'backwards' });
    if (front && !sw.hasAttribute('data-off') || (front && dir < 0)) {
      var x0 = -24, x1 = span - 24;
      M.animate(front, [{ transform: 'translateX(' + (dir > 0 ? x0 : x1) + 'px)', opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.82 },
        { transform: 'translateX(' + (dir > 0 ? x1 : x0) + 'px)', opacity: 0 }], { dur: dur, delay: d, easing: ease, fill: 'backwards' });
    }
    if (o.flare !== false) {
      var cols = Array.prototype.slice.call(body.querySelectorAll('.pmu-skycol')), n = cols.length || 1;
      var cw = (g.plotW - 40 - 8 * (n - 1)) / n, at = +sw.getAttribute('data-at') || 90;
      cols.forEach(function (col, i) {
        var flare = col.querySelector('.pmu-skyflare'); if (!flare || i >= 8) return;   /* the eight highest towers (the beat's 24-animation budget) */
        if (o.flare === 'past') { var v = parseFloat((col.querySelector('.pmu-num') || {}).getAttribute ? col.querySelector('.pmu-num').getAttribute('data-v') : 0); if (!(v >= at)) return; }
        var x = i * (cw + 8) + cw / 2 + 4, p = Math.max(0, Math.min(1, x / span));
        if (dir < 0) p = 1 - p;
        var t = st ? p : easeInv(SLIDE, p);
        M.animate(flare, [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { dur: 260, delay: d + Math.round(t * dur) - 40, easing: E('out', 'ease-out'), fill: 'backwards' });
      });
    }
    return dur;
  };

  /* ================================================================== attempts (Ledger hero): the attempt timeline */
  /* Details of the hero kinds whose content does not come from a model (CONTENT-3: every reading a card holds is in its
     Details): the account windows of the windows-ahead line, the attempts of the ledger lanes, the authority flow's
     sources */
  var winReadings = function () {
    var rows = [];
    PMU.roster.read().providers.forEach(function (p) {
      if (!p.effective || !D.settingsInScope(p.id)) return;
      p.effective.windows.forEach(function (w) { rows.push([p.name + ' · ' + p.effective.nickname + ' · ' + w.label, (w.pct === null ? PMU.roster.vsWord(w) : C.fmt(w.pct, 'pct') + ' used') + ' · ' + F.resetLine(w).text + ' · ' + PMU.fmt.truth(w.truth)]); });
    });
    return rows;
  };
  C.kindReadings.windows = winReadings;
  C.kindReadings.attempts = function () {
    return D.attempts().slice().sort(function (a, z) { return new Date(a.occurred_at) - new Date(z.occurred_at); }).map(function (a) {
      return [a.attempt_id + ' · ' + F.clock(new Date(a.occurred_at).getTime()), C.legName(a.provider_id) + ' · ' + C.money((a.charge || 0) + (a.plan_allocation_estimate || 0)) + (a.charge ? '' : ' est.') + ' · ' + a.settlement_status];
    });
  };
  C.kindReadings.flow = function () {
    return (DATA.authority || []).map(function (r) { return [C.oldName(r[0]), r[1] + ' · ' + r[2] + ' · ' + r[3]]; });
  };
  var attemptsImpl;
  C.kind('attempts', attemptsImpl = {
    /* live (WOW-SPEC-3 8.4 "an attempt arrives", FINAL-REVIEW-3 must-fix 2): the lanes re-render in the beat; a new attempt
       pops onto its lane at NOW with one halo, a receipt that settles fills its hollow dot; the hero count rolls */
    live: function (body, ctx) {
      if (ctx.liveFinal || !body.querySelector('.pmu-atarea')) return false;
      var was = {};
      Array.prototype.forEach.call(body.querySelectorAll('.pmu-atdot[data-aid]'), function (d) { was[d.getAttribute('data-aid')] = d.classList.contains('is-pending'); });
      C.liveRender(body, ctx, attemptsImpl);
      if (M.reduced()) return true;
      var st = stepped();
      Array.prototype.forEach.call(body.querySelectorAll('.pmu-atdot[data-aid]'), function (d) {
        var id = d.getAttribute('data-aid'), pend = d.classList.contains('is-pending');
        if (!(id in was)) {
          M.animate(d, [{ transform: 'translate(-50%,-50%) scale(0)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }],
            { dur: 420, delay: 120, easing: st ? 'steps(3,jump-start)' : E('pop', 'cubic-bezier(.34,1.45,.64,1)'), fill: 'backwards' });
          if (film() && film().halo) film().halo(d, { delay: 300 });
        } else if (was[id] && !pend) {
          M.animate(d, [{ transform: 'translate(-50%,-50%) scale(.4)' }, { transform: 'translate(-50%,-50%) scale(1.2)', offset: 0.6 }, { transform: 'translate(-50%,-50%) scale(1)' }],
            { dur: 360, easing: st ? 'steps(3,jump-start)' : E('pop', 'cubic-bezier(.34,1.45,.64,1)') });
        }
      });
      return true;
    },
    render: function (body, ctx) {
      var list = D.attempts().slice().sort(function (a, z) { return new Date(a.occurred_at) - new Date(z.occurred_at); });
      if (!list.length) { body.innerHTML = C.empty('No attempts for the selected scope and range', 'Unknown is never shown as zero'); return; }
      var bw = ctx.tier.bw, bh = ctx.tier.bh, c = D.costs();
      var hrs = c.hours || 24, now = PMU.clock.now(), t0 = now - hrs * 3600000;
      var lanes = []; list.forEach(function (a) { if (lanes.indexOf(a.provider_id) < 0) lanes.push(a.provider_id); });
      var heroOk = bh >= 200;
      var value = function (a) { return (a.charge || 0) + (a.plan_allocation_estimate || 0); };
      var pending = list.filter(function (a) { return !(value(a) > 0) && /pending/i.test(a.settlement_status || ''); }).length;
      var head = heroOk ? C.heroHead(ctx, { value: list.length, fmt: 'int', label: (list.length === 1 ? 'attempt' : 'attempts') + ' · ' + D.rangeLabel(ctx.state.range),
        sub: b(C.money(c.selected)) + ' recorded value · ' + b(C.money(c.settled)) + ' settled' + (pending ? ' · ' + b(pending) + ' pending ' + (pending === 1 ? 'receipt' : 'receipts') : '') }) : '';
      /* the lane labels take the Settings names when they fit (final fix M8): the column grows to the longest name, up
         to a fifth of the card; a name that still does not fit keeps its short word */
      var nameW = 0; lanes.forEach(function (pid) { nameW = Math.max(nameW, C.wrapW(C.legName(pid), 12.5, 560)); });
      var labW = bw >= 420 ? Math.max(96, Math.min(Math.round(bw * 0.2), Math.ceil(nameW * 1.1 + 16 + 7 + 8))) : 30, axisH = 22;
      var laneName = function (pid) { return C.fitsW(C.legName(pid), labW - 8 - 16 - 7, 12.5, 560) ? C.legName(pid) : SHORT[pid] || C.legName(pid); };
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
        return '<span class="pmu-atdot' + (pend ? ' is-pending' : '') + (a.charge ? '' : ' is-est') + '" data-i="' + i + '" data-aid="' + esc(a.attempt_id) + '" data-vendor="' + mk.vendor + '" role="button" tabindex="0" style="left:' + x(t).toFixed(2) + '%;top:' + (lane * laneH + laneH / 2) + 'px;--r:' + r + 'px"' + hv + '></span>';
      }).join('');
      body.innerHTML = '<div class="pmu-attl">' + head + '<div class="pmu-atplot" style="--lab:' + labW + 'px;height:' + (lanes.length * laneH + axisH) + 'px">' +
        '<div class="pmu-atlanes">' + lanes.map(function (pid, k) {
          var sid = PMU.roster.legacyProvider(pid);
          return '<div class="pmu-atlane" style="top:' + (k * laneH) + 'px;height:' + laneH + 'px"><span class="pmu-atlab"' + C.hover(C.legName(pid), '') + '>' + PMU.mark(sid, 16) + (labW > 60 ? '<span>' + esc(laneName(pid)) + '</span>' : '') + '</span></div>';
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
      /* a source box names its reading by its Settings name with its age when both fit, the name alone when only the
         name fits (the age stays in the hover tag), else the short word with the age (final fix M8) */
      var srcName = function (r) {
        /* padding 2 x 10, the 16 px mark and two 8 px gaps; the age is in the mono face (Mac stills: "ChatGPT / Code" was
           cut beside "31s old" when the age was measured in the text face) and 6 px of margin */
        var room = colW - 20 - 16 - 8 - 6, ageW = tight ? 0 : (PMU.charts && PMU.charts.textW ? PMU.charts.textW(r.age, 11, true) * 1.12 : r.age.length * 7) + 8;
        if (C.fitsW(r.name, room - ageW, 12.5, 560)) return { name: r.name, age: !tight };
        if (C.fitsW(r.name, room, 12.5, 560)) return { name: r.name, age: false };
        return { name: r.short, age: !tight };
      };
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
            (r.prov ? PMU.mark(r.prov, 16) : C.glyph(r.est ? 'pencil' : 'check')) + '<span>' + esc(srcName(r).name) + '</span>' + (srcName(r).age ? '<em>' + esc(r.age) + '</em>' : '') + '</div>';
        }).join('') +
        mid.map(function (m0) { return m0.n ? '<div class="pmu-flowmid' + (m0.h < 54 ? ' is-row' : '') + '" data-k="' + m0.key + '" style="left:' + x2 + 'px;top:' + m0.y + 'px;height:' + m0.h + 'px;width:' + colW + 'px"><b>' + m0.n + '</b><span>' + esc(m0.label) + '</span></div>' : ''; }).join('') +
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
      /* a clip reveal is not composited: with a GPU only; without one the bands fade in (one opacity animation, PERF-3) */
      var soft = film() && film().soft ? film().soft() : false;
      if (svg && !soft) M.animate(svg, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { dur: 900, delay: d + 180, easing: st ? 'steps(10,jump-start)' : E('draw', 'cubic-bezier(.65,0,.35,1)'), fill: 'backwards' });
      else if (svg) M.animate(svg, [{ opacity: 0 }, { opacity: 1 }], { dur: 300, delay: d + 180, easing: E('out', 'ease-out'), fill: 'backwards' });
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
  /* a live beat on the windows line (a reading moved): the markers keep their places (they sit at reset times); each
     marker's words ("5H 79%") and tone, its bar's tone and the hero's label patch in place; no dry render */
  function windowsLive(body, ctx) {
    var now = PMU.clock.now(), span = 7 * 86400000, marks = body.querySelectorAll('.pmu-wmk[data-reset]'), byKey = {}, ok = true;
    PMU.roster.read().providers.forEach(function (p) {
      if (!p.effective || !D.settingsInScope(p.id)) return;
      p.effective.windows.forEach(function (w) { if (w.pct !== null && w.resetAt) byKey[p.effective.key + '/' + Math.round(w.resetAt / 60000)] = { p: p, a: p.effective, w: w }; });
    });
    Array.prototype.forEach.call(marks, function (mk) { if (!byKey[mk.getAttribute('data-reset')]) ok = false; });
    if (!ok || !marks.length) return false;
    Array.prototype.forEach.call(marks, function (mk) {
      var it = byKey[mk.getAttribute('data-reset')], w = it.w, r = String(C.ramp(w.pct));
      var lab = ({ fiveHour: '5H', weekly: 'WK', monthly: 'MO' }[w.key] || w.short.slice(0, 3).toUpperCase()) + ' ' + C.fmt(w.pct, w.pct < 10 && w.pct % 1 ? 'pct1' : 'pct') + (w.resetAt - now > span ? ' · ' + F.date(w.resetAt) : '');
      var em = mk.querySelector('em'); if (em && em.textContent !== lab) em.textContent = lab;
      if (mk.getAttribute('data-ramp') !== r) mk.setAttribute('data-ramp', r);
      var bar = body.querySelector('.pmu-wbar[data-share="win:' + it.a.key + '/' + w.key + '"]'); if (bar && bar.getAttribute('data-ramp') !== r) bar.setAttribute('data-ramp', r);
      var det = C.fmt(w.pct, 'pct') + ' used · ' + F.resetLine(w).text + ' · ' + PMU.fmt.truth(w.truth); if (mk.getAttribute('data-pm-hover-detail') !== det) mk.setAttribute('data-pm-hover-detail', det);
    });
    var all = Object.keys(byKey).map(function (k) { return byKey[k]; }).filter(function (x) { return x.w.resetAt > now && x.w.truth !== 'unknown'; }).sort(function (x, y) { return x.w.resetAt - y.w.resetAt; });
    var lb = body.querySelector('.pmu-herolabel'), next = all[0];
    if (lb && next) { var t = 'next reset · ' + next.p.name + ' ' + next.w.short.toLowerCase() + ' · ' + C.fmt(next.w.pct, 'pct') + ' used'; if (lb.textContent !== t) lb.textContent = t; }
    return true;
  }
  C.kind('windows', {
    live: function (body, ctx) { return windowsLive(body, ctx); },
    liveSig: function () {
      return JSON.stringify(PMU.roster.read().providers.map(function (p) { return p.effective && D.settingsInScope(p.id) ? [p.id, p.effective.key, p.effective.windows.map(function (w) { return [w.pct, w.resetAt ? Math.round(w.resetAt / 60000) : null, w.truth]; })] : 0; }));
    },
    render: function (body, ctx) {
      var lanes = [], now = PMU.clock.now(), span = 7 * 86400000, all = [];
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
          /* integ3: a label beyond the week also gives way to the previous MARKER itself, not only to its right-hand words
             (Friendly Light 1440: Kimi's "MO 36% · Nov 1" was printed over the WK 52% diamond) */
          if (it.beyond) { var pEnd = prev ? (prev.side === 'r' ? prev.x + prev.w : prev.x + 16) : -labW; it.side = pEnd > it.x - it.w ? 'none' : 'l'; it.m.side = it.side; return; }
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
        return '<i class="pmu-wbar" data-ramp="' + r + '"' + C.shareAttr('win:' + ln.a.key + '/' + m.w.key) + ' style="width:' + x.toFixed(2) + '%;z-index:' + (10 - j) + '"></i>' +
          '<span class="pmu-wmk' + (beyond ? ' is-beyond' : '') + (m.side === 'l' && !beyond ? ' is-left' : '') + (m.side === 'none' ? ' no-label' : '') + '" data-ramp="' + r + '" data-shape="' + (SHAPE[m.w.key] || 'c') + '" data-reset="' + esc(ln.a.key + '/' + Math.round(m.at / 60000)) + '" style="' + (beyond ? 'right:-6px' : 'left:' + x.toFixed(2) + '%') + '"' +
          C.hover(ln.p.name + ' · ' + ln.a.nickname + ' · ' + m.w.label, C.fmt(m.w.pct, 'pct') + ' used · ' + F.resetLine(m.w).text + ' · ' + PMU.fmt.truth(m.w.truth)) + '><i></i><em>' + esc(lab) + '</em></span>';
      };
      body.innerHTML = '<div class="pmu-wline">' + head + '<div class="pmu-wplot" style="--lab:' + labW + 'px;--edge:' + edge + 'px;height:' + (lanesN * laneH + axisH) + 'px">' +
        '<div class="pmu-wlanes">' + lanes.slice(0, lanesN).map(function (ln, k) {
          return '<div class="pmu-wlane" style="top:' + (k * laneH) + 'px;height:' + laneH + 'px" data-acct="' + esc(ln.a.key) + '"><span class="pmu-wlab"' + C.hover(ln.p.name, ln.a.nickname) + '>' + C.shareMark(ln.p.id, 16) +
            (labW > 60 ? '<span>' + esc(laneName(ln)) + '</span>' : '') + '</span>' +
            '<span class="pmu-wtrack">' + ln.ms.slice().sort(function (x, y) { return (y.at || 0) - (x.at || 0); }).map(function (m, j) { return mk(m, ln, j); }).join('') + '</span></div>';
        }).join('') + '</div>' +
        '<div class="pmu-wgrid">' + days.map(function (t) { return '<i style="left:' + xOf(t).toFixed(2) + '%"></i>'; }).join('') + '<i class="pmu-wnow"></i></div>' +
        '<div class="pmu-waxis"><span class="is-now" style="left:0">NOW</span>' + days.map(function (t) { return '<span style="left:' + xOf(t).toFixed(2) + '%">' + esc(F.day(t)) + '</span>'; }).join('') + '</div>' +
        '</div>' + (lanes.length > lanesN ? C.more(lanes.length - lanesN, 'providers', false, lanes.slice(lanesN).map(function (ln) { return ln.p.name + ' · ' + ln.a.nickname + ' · ' + ln.ms.map(function (m) { return m.w.short + ' ' + C.fmt(m.w.pct, 'pct') + ' used · ' + F.resetLine(m.w).text; }).join(' · '); })) : '') + '</div>';
      body.querySelector('.pmu-wplot').addEventListener('click', function (event) {
        var lane = event.target.closest('.pmu-wlane'); if (lane && PMU.accounts) PMU.accounts.inspect(lane.getAttribute('data-acct'), lane);
      });
    },
    /* WOW-SPEC-3 7 Plans hero: the NOW line drops (260 SETTLE); each lane's window bars grow from the NOW line 36 apart
       down the lanes (520 ROLL). The reset markers pop in the room's beat (70-rooms-a.js), so a refresh or Reduce Motion
       shows them at once. */
    enter: function (body, ctx, delay) {
      var d = delay || 0, st = stepped();
      C.enterAll(body, ctx, d);
      var nowEl = body.querySelector('.pmu-wnow'); if (nowEl && film() && film().drop) film().drop(nowEl, { from: 24, delay: d, dur: 260 });
      Array.prototype.forEach.call(body.querySelectorAll('.pmu-wlane'), function (ln, k) {
        Array.prototype.forEach.call(ln.querySelectorAll('.pmu-wbar'), function (bar) {
          M.animate(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { dur: 520, delay: d + 200 + 36 * k, easing: st ? 'steps(6,jump-start)' : E('roll', 'cubic-bezier(.16,1,.3,1)'), fill: 'backwards' });
        });
      });
    }
  });
  /* the hero's reset markers in time order (the soonest first; a reset past the horizon last) */
  C.windowMarks = function (card) {
    return Array.prototype.slice.call(card.querySelectorAll('.pmu-wmk')).sort(function (a, z) { return (a.style.left ? parseFloat(a.style.left) : 101) - (z.style.left ? parseFloat(z.style.left) : 101); });
  };
})();
