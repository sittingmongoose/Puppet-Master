/* usage-concepts/_shared/usage-widget-renderers.js
   The ONE density-aware widget catalog for the Usage concepts. U7/U8/U9 all
   register from window.PMWidgetDefs instead of each carrying their own copy
   of the ~17 renderer bodies (the overlap was ~350 lines per page).

   Loads AFTER usage-data.js and usage-widgets.js. Exposes:
     PMWidgetDefs.TYPES        — consolidated catalog (union of U7/U8/U9):
                                 quota, guard, analytics, budget, cache,
                                 tools, accounts, context, ledger, signals,
                                 whatcounts, planGating, spend, provenance,
                                 sessions, cost, tokens
     PMWidgetDefs.register(PMWidgets, {only:[ids]})
                               — register a subset into a PMWidgets registry
     PMWidgetDefs.wireCanvas(canvas)
                               — one delegated listener set per canvas for the
                                  in-body interactions (ledger drill-through /
                                  sort / search, analytics window + legend,
                                  budget presets, guard Why, account history,
                                  topN "+N more" disclosures)
                                 plus a MutationObserver that auto-animates
                                 fills / counters / donuts / chart segments
     PMWidgetDefs.layouts      — suggested type lists per page id
     PMWidgetDefs.defaultBoard — the U7-style default board

    Density contract: render(item, sizeKey, ctx) with ctx = {D, R, fmt}.
    The tier is AREA-AWARE (fitOf): it derives from the tile's live pixel box
    (measured off the mounted .uw when present, else estimated deterministically
    from the span + canvas grid metrics — row pitch, gap, viewport track
    count). A short box is a low tier no matter how wide; a narrow box is a low
    tier no matter how tall; preset keys S/M/L/XL remain CAPS on the span-derived
    tier, never boosts. Every renderer returns {t, w, h, px} where px is the
    width sub-tier (micro <160 / narrow <340 / mid <880 / wide) that drives
    column sets and two-up list splits. tier 0 = one headline figure + a couple
    of rows; tier 1 = top-N lists with an honest "+N more" disclosure; tier 2 =
    full lists, footnotes, drill-through; tier 3 = history, forecasts, extras.
    Lists never silently drop rows — the remainder sits collapsed behind a
    one-click disclosure. All colors ride CSS vars (theme contract).

   Honesty contract: unknown is never rendered as zero — null readings surface
   value-state chips (R.chip), provenance rides R.projChip / R.conf, window
   run-out is the fail-closed derived projection from usage-data.js, and cost
   is the single cost_microdollars authority (R.costMicro). */
(function () {
  'use strict';

  /* ---------- icon self-sufficiency ----------------------------------------
     Hosts like U9 load only base icons.js; additively register the usage
     glyphs the catalog needs (same idiom as usage-widgets.js' kebabV). */
  function gs(body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }
  var FALLBACK_ICONS = {
    dial: '<path d="M4 15a8 8 0 0 1 16 0"/><path d="M12 15l3.5-3.5"/><circle cx="12" cy="15" r="1.2"/><path d="M4 19h16"/>',
    gauge: '<path d="M12 21a9 9 0 1 1 9-9"/><path d="M12 12l4-4"/><circle cx="12" cy="12" r="1"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    trend: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    pie: '<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
    scale: '<path d="M12 3v18"/><path d="M5 7l7-4 7 4"/><path d="M5 7l-3 7a3.5 3.5 0 0 0 7 0L6 7"/><path d="M19 7l-3 7a3.5 3.5 0 0 0 7 0l-3-7"/><path d="M8 21h8"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15 9.5a3 3 0 0 0-3-1.5c-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2a3 3 0 0 1-3-1.5"/>',
    wallet: '<path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M21 8h-5a2 2 0 0 0 0 4h5V8z"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    hourglass: '<path d="M6 2h12v4l-4 4 4 4v4H6v-4l4-4-4-4V2z"/><path d="M6 22h12"/>',
    hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    timer: '<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="12" y2="8"/><circle cx="12" cy="14" r="8"/>',
    history: '<path d="M3 3v6h6"/><path d="M3.5 9A9 9 0 1 1 3 14"/><path d="M12 7v5l3 3"/>'
  };
  if (window.PMIcons) {
    Object.keys(FALLBACK_ICONS).forEach(function (k) {
      if (!window.PMIcons[k]) window.PMIcons[k] = gs(FALLBACK_ICONS[k]);
    });
  }
  function ic(n, c) { return window.PMIcon ? window.PMIcon(n, c || 'pm-ico sm') : ''; }
  function iconRaw(k) { return (window.PMIcons && window.PMIcons[k]) || ''; }

  /* One-line quota rows own their layout in usage-widget-renderers.css (the
     "quota (compact one-line list)" block): the compact list is ONE shared
     grid so every row's meter track aligns and soaks a healthy width. */

  /* ---------- shared bits -------------------------------------------------- */
  function CTX() { return { D: window.USAGE, R: window.USrender, fmt: window.USfmt }; }
  function escA(v) { return String(v == null ? '' : v).replace(/"/g, '&quot;'); }
  function cfgOf(it, k, d) { return (it && it.cfg && it.cfg[k] !== undefined && it.cfg[k] !== '') ? it.cfg[k] : d; }
  /* ---------- area-aware density tier ----------------------------------------
     The old tier mapped almost purely off column count, so a short-wide 6×4
     tile drew tier-3 content into a tier-0-height box and a 190px tile rendered
     a full list. fitOf derives the tier from the ACTUAL box: the live pixel
     size of the mounted .uw when it's in the DOM (every rerender path — resize
     release, config, sort, qv — measures), else a deterministic estimate from
     the span + the canvas grid metrics (row pitch 28+gap, gap per canvas,
     viewport-driven track count from usage-widgets.css breakpoints).
     Rules: area score first, then hard caps — r<=3 (grid) is tier 0 however
     wide, c<=1 is tier 0 however tall, r<=5 caps at 1; and a pixel sub-tier:
     <160px body width forces tier 0, <340px caps at 1. Presets S/M/L/XL cap
     the span-derived tier (a 2×6 M never outgrows tier 1 even on a 4-track
     board). Deterministic, no layout thrash (at most one style read/canvas). */
  var PRESET_CAP = { S: 0, M: 1, L: 2, XL: 3 };
  var PX_MICRO = 160, PX_NARROW = 340, PX_WIDE = 880;
  function canvasOf(it) {
    if (!it || !it.uid || !document.querySelectorAll) return null;
    var cvs = document.querySelectorAll('.uw-canvas');
    for (var i = 0; i < cvs.length; i++) {
      var p = cvs[i]._pmw;
      if (!p || !p.items) continue;
      for (var j = 0; j < p.items.length; j++) if (p.items[j].uid === it.uid) return cvs[i];
    }
    return null;
  }
  function tracksFor(vw) { return vw <= 600 ? 1 : vw <= 900 ? 2 : vw <= 1280 ? 3 : vw < 1800 ? 4 : vw < 2300 ? 5 : 6; }
  function boxOf(it) {
    try {
      var el = it && it.uid && document.querySelector('.uw[data-uid="' + it.uid + '"]');
      if (el && el.getClientRects().length) {
        var body = el.querySelector('.uw-body');
        return { w: el.clientWidth, h: body ? body.clientHeight : el.clientHeight, live: true };
      }
    } catch (e) {}
    var c = (it && it.c) || 2, r = (it && it.r) || 6, free = !!(it && it._free);
    var cv = canvasOf(it);
    var vw = (window.innerWidth || 1280);
    var gap = 10;
    if (cv) { var g = parseFloat(getComputedStyle(cv).rowGap); if (g > 0) gap = g; }
    var tracks = free ? 12 : tracksFor(vw);
    var cw = cv && cv.clientWidth ? cv.clientWidth : Math.max(300, vw - 48);
    var cc = Math.max(1, Math.min(c, tracks));
    var colW = (cw - gap * (tracks - 1)) / tracks;
    var w = Math.round(cc * colW + (cc - 1) * gap);
    var h = Math.round(r * (28 + gap) - gap) - 58; /* head ~36 + body padding + borders */
    return { w: w, h: Math.max(40, h), live: false };
  }
  function fitOf(sk, it) {
    var c = (it && it.c) || 2, r = (it && it.r) || 6, free = !!(it && it._free);
    var area = c * r, t;
    if (free) {
      /* 12-col model grid: 2-col free tiles really are 190px — width dominates */
      t = area >= 34 ? 3 : area >= 19 ? 2 : area >= 9 ? 1 : 0;
      if (c <= 1) t = 0;
    } else {
      t = area >= 28 ? 3 : area >= 15 ? 2 : area >= 8 ? 1 : 0;
      if (r <= 3) t = 0; else if (r <= 5) t = Math.min(t, 1); else if (r <= 6) t = Math.min(t, 2);
      if (c <= 1) t = Math.min(t, 0);
    }
    if (PRESET_CAP[sk] != null) t = Math.min(t, PRESET_CAP[sk]);
    var box = boxOf(it), w = box.w || 0;
    var px = w < PX_MICRO ? 'micro' : w < PX_NARROW ? 'narrow' : w < PX_WIDE ? 'mid' : 'wide';
    if (w > 0) { if (w < PX_MICRO) t = 0; else if (w < PX_NARROW) t = Math.min(t, 1); }
    return { t: t, w: w, h: box.h, px: px, live: box.live };
  }
  function tier(sk, it) { return fitOf(sk, it).t; }
  /* Accurate body height for a renderer's fill math. fitOf's height is a live
     measurement when the tile is mounted, but on the first paint (and for a
     still-hidden panel) it falls back to a span estimate that subtracts head +
     body padding + borders — double-counting the padding that clientHeight
     already includes, ~22px short. That folded a perfectly roomy 2×5 cache into
     the one-line sliver and left a 60%+ bottom void. Off-DOM, recompute from the
     live grid pitch (28px row + the canvas row gap) minus only head + borders so
     the first paint fills exactly like a measured re-render. Live boxes (and
     free tiles, which ride their own model) pass through untouched, so this can
     only ever lift a too-short first-paint estimate, never shrink a real one. */
  function boxH(f, it) {
    if (f.live || (it && it._free)) return f.h;
    var r = (it && it.r) || 6;
    var cv = canvasOf(it);
    var gap = 10;
    if (cv) { var g = parseFloat(getComputedStyle(cv).rowGap); if (g > 0) gap = g; }
    var tile = Math.round(r * (28 + gap) - gap);
    return Math.max(f.h, tile - 36); /* head ~34 + tile borders ~2 */
  }
  /* shared fit helpers --------------------------------------------------------
     trunc/topN: honest truncation — the tail rows stay in the DOM behind a
     "+N more" disclosure (wireCanvas toggles [data-wd-more]).
     duo(): split a list block into two side-by-side groups (each keeps its own
     aligned subgrid tracks) once the tile is comfortably wide.
     showFoot(): footnotes need ~36px of height — only when the box has it. */
  function moreBlock(html, n, label) {
    if (!n) return '';
    return '<div class="wd-more" data-wd-more><button type="button" class="wd-btn wd-more-t" aria-expanded="false">' + ic('plus') +
      '<span class="wd-more-l" data-label="+' + n + ' ' + escA(label) + '">+' + n + ' ' + label + '</span></button>' +
      '<div class="wd-more-b" hidden>' + html + '</div></div>';
  }
  function duo(a, b, cls) { return '<div class="wd-duo"><div class="' + cls + '">' + a + '</div><div class="' + cls + '">' + b + '</div></div>'; }
  function splitDuo(rowsHtml, useDuo, cls) {
    if (!useDuo) return '<div class="' + cls + '">' + rowsHtml.join('') + '</div>';
    var half = Math.ceil(rowsHtml.length / 2);
    return duo(rowsHtml.slice(0, half).join(''), rowsHtml.slice(half).join(''), cls);
  }
  function showFoot(f) { return f.t >= 3 || (f.t >= 2 && f.h >= 200); }
  function duoable(f) { return f.t >= 2 && (f.px === 'mid' || f.px === 'wide'); }
  function donut(name, pct, toneVar) {
    return '<span class="wd-donut"><svg viewBox="0 0 64 64" role="img" aria-label="' + escA(name) + ' ' + pct + '%">' +
      '<circle class="dbg" cx="32" cy="32" r="26"></circle>' +
      '<circle class="dfill" cx="32" cy="32" r="26" stroke="' + toneVar + '" data-pct="' + pct + '" style="stroke-dasharray:163.4;stroke-dashoffset:163.4"></circle>' +
      '<text x="32" y="33">' + pct + '%</text></svg><small>' + name + '</small></span>';
  }
  var TONEV = { ok: 'var(--tone-ok)', warn: 'var(--tone-warn)', hot: 'var(--tone-err)', info: 'var(--tone-info)' };
  /* Concise, DISTINCT provider label for the budget donuts. The old
     name.split(' ')[0] collapsed "Claude Code" -> "Claude", colliding with
     "Claude" (the duplicate-label chip salad). Drop the " · account" qualifier
     ("Codex · ChatGPT plan" -> "Codex"), shorten a few long names, and let the
     caller disambiguate genuine multi-account providers ("Claude · 2"). */
  var DONUT_SHORT = { 'GitHub Copilot': 'Copilot', 'Gemini Direct': 'Gemini', 'Antigravity CLI': 'Antigravity' };
  function donutLabel(name) {
    var base = String(name).split(' \u00b7 ')[0];
    return DONUT_SHORT[name] || DONUT_SHORT[base] || base;
  }
  function foot(html) { return '<div class="us-foot">' + ic('info') + '<span>' + html + '</span></div>'; }
  function provOf(w) { return { source: w.source_class, conf: w.source_confidence, fresh: w.projection_freshness }; }
  function duoCols(a, b, cls) { return duo('<div class="' + cls + '">' + a + '</div>', '<div class="' + cls + '">' + b + '</div>', 'wd-duo'); }
  /* sliver tier: sub-100px bodies (r<=3 free resizes) get ONE honest summary
     line — never a scroll. From 64px up the folded tail rides the usual
     "+N more" disclosure; under 64px even the button cannot fit, so the
     sliver states the headline and the detail returns when the tile grows. */
  function sliver(html, more, f) {
    return '<div class="wd-sliver">' + html + '</div>' + (f.h >= 64 && more ? more : '');
  }
  /* Value-state chips carry honesty information — they must NEVER clip
     mid-word. The tight list rows (quota/cache/tokens) give the chip an
     unshrinkable full label at mid width and up while the adjacent NAME
     yields with an ellipsis (chip-honesty block in the css); on narrow and
     micro tiles the same rows collapse the chip to a clean colored DOT —
     the full state always rides the title tooltip R.chip sets. */
  function vsChip(R, vsKey, f) {
    var html = R.chip(vsKey);
    if (f && (f.px === 'micro' || f.px === 'narrow')) html = html.replace('class="vs ', 'class="vs vs-dot ');
    return html;
  }

  /* ========================================================================
     RENDERERS — each is a pure(ish) HTML-string producer shaped by density.
     ====================================================================== */

  /* ---- quota: pressure per provider over its OWN independent windows ----
     Density ladder (a default [3,8] span overflowed its body ~4.6x when every
     window of every provider rendered at once): S = top-3 pressure rows,
     M = top-6, L/XL = all providers, each ONE compact line (name + value-state
     chip + worst-window bar + reset). Truncation is never silent: a "+N
     providers" affordance reveals the rest, and tiers >= M open the full
     per-window detail (every winBar, run-out label, provenance chip) through
     an explicit toggle persisted on the item (cfg.qv: '' | 'all' | 'detail'). */
  function renderQuota(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R, fmt = cx.fmt;
    var f = fitOf(sk, item), t = f.t, focus = cfgOf(item, 'win', 'auto'), notes = cfgOf(item, 'notes', 'on') === 'on';
    var qv = String(cfgOf(item, 'qv', ''));
    var N = D.quotas.length, TOPN = t === 0 ? 3 : 4;
    var winTotal = D.quotas.reduce(function (s, q) { return s + (q.windows || []).length; }, 0);
    var SEMFOOT = 'Window semantics differ by provider (<b>rolling / fixed reset / billing cycle / session only / unknown</b>) — a missing bar is explained by its chip, never assumed zero.';
    function resetSpan(q) {
      if (!q.reset) return '<span class="wd-qrst unk">no reset reported</span>';
      if (q.reset === 'unknown') return '<span class="wd-qrst unk">unknown reset</span>';
      return '<span class="wd-qrst">' + ic('timer') + 'resets ' + q.reset + '</span>';
    }
    function winPick(q) {
      var ws = q.windows || [];
      if (focus !== 'auto') { for (var i = 0; i < ws.length; i++) if (ws[i].id === focus) return ws[i]; }
      return ws[0] || null;
    }
    function worstWin(q) {
      if (focus !== 'auto') return winPick(q);
      var ws = q.windows || [], best = null;
      for (var i = 0; i < ws.length; i++) if (ws[i].used != null && (best == null || best.used == null || ws[i].used > best.used)) best = ws[i];
      return best || ws[0] || null;
    }
    var sorted = D.quotas.slice().sort(function (a, b) {
      return (b.used == null ? -1 : b.used) - (a.used == null ? -1 : a.used);
    });
    if (f.h < 120) {
      var sw = worstWin(sorted[0] || {});
      return sliver('<span class="ell">' + ((sorted[0] || {}).name || '') + '</span>' + vsChip(R, (sorted[0] || {}).vs, f) +
        '<b>' + (sw && sw.used != null ? Math.round(sw.used) + '%' : '\u2014') + '</b>',
        moreBlock('<div class="wd-qlist">' + sorted.map(function (q) { var w = worstWin(q); return '<div class="wd-qrow wd-qrowc"><span class="wd-qid"><span class="wd-qnm">' + q.name + '</span>' + vsChip(R, q.vs, f) + '</span>' + (w ? R.winBar(w) : '<span class="wd-none">no reading · see chip</span>') + '</div>'; }).join('') + '</div>', N, 'providers'), f);
    }
    function compactRow(q) {
      var w = worstWin(q);
      return '<div class="wd-qrow wd-qrowc"><span class="wd-qid"><span class="wd-qnm">' + q.name + '</span>' + vsChip(R, q.vs, f) + (t >= 2 ? R.conf(q.conf) : '') + '</span>' +
        (w ? R.winBar(w) : '<span class="wd-none">no reading · see chip</span>') + '</div>';
    }
    function detailRow(q) {
      var head = '<div class="wd-qh"><span class="wd-qnm">' + q.name + '</span>' + R.chip(q.vs) + R.conf(q.conf) + '</div>';
      var sub = '<div class="wd-qsub">' + q.plan + ' · ' + R.human(q.window_kind) + ' · ' + q.win + (t >= 2 ? ' · ' + R.human(q.scope) : '') + '</div>';
      var body = (q.windows || []).map(function (w) {
        return R.winBar(w) +
          '<div class="wd-runout">' + (w.runOutLabel || R.human(w.runOutReason) || '') + (w.runOutConf !== 'unknown' ? ' · conf ' + R.human(w.runOutConf) : '') + ' ' + R.projChip(provOf(w)) + '</div>';
      }).join('') || '<span class="wd-none">no windows · ' + R.chip(q.vs) + '</span>';
      var prem = q.premiumLeft != null ? R.meterRow('prem', Math.round(q.premiumLeft / q.premiumTotal * 100), 'info') : '';
      return '<div class="wd-qrow">' + head + sub + body + prem + resetSpan(q) +
        (t >= 2 && notes && q.note ? '<div class="wd-qnote">' + q.note + '</div>' : '') + '</div>';
    }
    /* per-window detail is tall content — a tier-1 box composes it only when
       it has the height for one full row + disclosure + the exit button; the
       toggle re-appears the moment the tile grows (qv persists on the item) */
    var detailFits = t >= 2 || f.h >= 240;
    if (qv === 'detail' && t >= 1 && detailFits) {
      var dcap = t <= 1 ? 1 : sorted.length;
      var dshown = sorted.slice(0, dcap), drest = sorted.slice(dcap);
      return dshown.map(detailRow).join('') +
        moreBlock('<div class="wd-qlist">' + drest.map(detailRow).join('') + '</div>', drest.length, 'providers') +
        '<div class="wd-qctl"><button type="button" class="wd-btn" data-wd-qv="">' + ic('minus') + 'compact list · ' + N + ' providers</button></div>' +
        (showFoot(f) ? foot(SEMFOOT) : '');
    }
    /* wide tier-2+ boxes show the full compact list in two aligned groups;
       'all' composes from tier 2 up (any width — mid tiles run it two-up);
       every other box caps at top-N with the tail behind a disclosure */
    var expandAll = ((t >= 2 && f.px === 'wide') || (qv === 'all' && t >= 2)) && f.h >= 260;
    /* short boxes keep fewer rows + disclosure — 4 rows + the control row
       overflowed a 2×5 body 1.15×; u9's tighter row pitch makes 2×5 only
       144px, so the gates are height-driven, not span-driven */
    var capN = t === 0 ? (f.h < 150 ? 2 : 3) : t === 1 ? (f.h < 160 ? 2 : f.h < 200 ? 3 : 4) : (f.h < 240 ? 3 : 4);
    var shown = expandAll ? sorted : sorted.slice(0, capN);
    var rest = expandAll ? [] : sorted.slice(capN);
    var ctl = t >= 1 && f.h >= 160 ? '<div class="wd-qctl">' +
      (qv !== 'all' && t <= 1
        ? '<button type="button" class="wd-btn" data-wd-qv="all">' + ic('plus') + 'show all ' + N + ' providers</button>'
        : (qv === 'all' && t <= 1 ? '<button type="button" class="wd-btn" data-wd-qv="">' + ic('minus') + 'top ' + TOPN + ' pressure only</button>' : '')) +
      (detailFits ? '<button type="button" class="wd-btn" data-wd-qv="detail">' + ic('chevD') + 'per-window detail · ' + winTotal + ' windows</button>' : '') +
      '</div>' : '';
    return splitDuo(shown.map(compactRow), duoable(f) && shown.length > 4, 'wd-qlist') +
      moreBlock('<div class="wd-qlist">' + rest.map(compactRow).join('') + '</div>', rest.length, 'providers · window semantics differ — chips explain missing bars') + ctl +
      (showFoot(f) ? foot(expandAll ? SEMFOOT : 'top pressure — expand for all ' + N + ' providers. ' + SEMFOOT) : '');
  }

  /* ---- guard: anomaly & spend guards with the Why behind each ---- */
  function renderGuard(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R;
    var f = fitOf(sk, item), t = f.t, scope = cfgOf(item, 'state', 'attention');
    var stChip = { blocked: R.chip('blocked'), warn: R.chip('estimated'), allowed: R.chip('measured'), watch: R.chip('partial') };
    var blocked = D.guards.filter(function (g) { return g.state === 'blocked'; }).length;
    var warned = D.guards.filter(function (g) { return g.state === 'warn'; }).length;
    var hl = '<div class="wd-hlrow"><span class="us-big err">' + blocked + '</span><span class="wd-cap">blocked · ' + warned + ' warn</span></div>';
    if (f.h < 120) {
      var gl = (scope === 'all') ? D.guards : D.guards.filter(function (g) { return g.state === 'blocked' || g.state === 'warn'; });
      return sliver('<b class="err" style="color:var(--tone-err-text)">' + blocked + '</b><span class="ell">blocked · ' + warned + ' warn</span>',
        moreBlock('<div class="wd-glist">' + gl.map(function (g) { return '<div class="wd-gcard ' + (g.state === 'blocked' ? 'blocked' : g.state === 'warn' ? 'warn' : 'okk') + '"><div class="wd-gh">' + ic(g.state === 'warn' ? 'warn' : 'shield') + '<span class="wd-gt">' + R.human(g.title) + '</span>' + (stChip[g.state] || '') + '</div><div class="wd-gb">' + g.body + '</div></div>'; }).join('') + '</div>', gl.length, 'guards'), f);
    }
    if (t === 0) {
      var top = D.guards.filter(function (g) { return g.state === 'blocked'; })[0] || D.guards[0];
      return hl + '<div class="wd-gcard blocked"><div class="wd-gh">' + ic('shield') + '<span class="wd-gt">' + R.human(top.title) + '</span>' + stChip[top.state] + '</div>' +
        (f.h >= 150 ? '<div class="wd-gb">' + top.body + '</div>' : '') + '</div>';
    }
    var list = (scope === 'all') ? D.guards : D.guards.filter(function (g) { return g.state === 'blocked' || g.state === 'warn'; });
    var CAP = t === 1 ? 2 : list.length;
    var rich = t >= 2 && f.h >= 300; /* where/why/acts need a tall box; short tier-2 boxes keep title+body cards */
    function card(g, i) {
      var cls = g.state === 'blocked' ? 'blocked' : (g.state === 'warn' ? 'warn' : 'okk');
      var why = rich ? '<div class="wd-why' + (t >= 3 && i === 0 && f.h >= 380 ? ' open' : '') + '"><button type="button" class="wd-why-t">' + ic('chevR') + '<span>Why was this ' + g.state + '?</span></button>' +
        '<div class="wd-why-b"><div class="wd-dgrid">' +
        g.why.map(function (kv) { return '<div class="wd-di"><b>' + kv[0] + '</b><span>' + kv[1] + '</span></div>'; }).join('') + '</div></div></div>' : '';
      var acts = (t >= 3 && f.h >= 330 && g.state === 'blocked')
        ? '<div class="wd-gacts"><button type="button" class="wd-btn primary" data-demo-action="usage.anomaly_keep" data-demo-arg="Keep blocking ' + R.human(g.kind) + '">Looks right — keep blocking</button>' +
          '<button type="button" class="wd-btn" data-demo-action="usage.anomaly_allow" data-demo-arg="Allow once: ' + R.human(g.kind) + '">It was expected — allow once</button></div>' : '';
      return '<div class="wd-gcard ' + cls + '"><div class="wd-gh">' + ic(g.state === 'warn' ? 'warn' : 'shield') + '<span class="wd-gt">' + R.human(g.title) + '</span>' + (stChip[g.state] || '') + '</div>' +
        '<div class="wd-gb">' + g.body + '</div>' + (rich ? '<div class="wd-gw">' + g.where + ' · ' + g.t + '</div>' : '') + why + acts + '</div>';
    }
    var shown = list.slice(0, CAP), rest = list.slice(CAP);
    /* short tier-1 boxes: the count headline stays, every card folds behind
       the disclosure instead of overflowing */
    if (t === 1 && f.h < 160) {
      return hl + moreBlock('<div class="wd-glist">' + list.map(card).join('') + '</div>', list.length, 'guards');
    }
    return hl + splitDuo(shown.map(card), t >= 2 && f.px === 'wide' && shown.length > 2, 'wd-glist') +
      moreBlock('<div class="wd-glist">' + rest.map(card).join('') + '</div>', rest.length, 'guards') +
      (showFoot(f) && f.h >= 280 && (t < 3 || f.h >= 300) ? foot(D.guardTypes.length + ' guard types · window ' + D.guardConfig.windowMin + 'min · spike ' + D.guardConfig.spikeRatio + '\u00d7 baseline · confidence ' + D.guardConfig.confidence + '.') : '');
  }

  /* ---- analytics: stacked token mix over time with budget line ---- */
  function renderAnalytics(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R;
    var f = fitOf(sk, item), t = f.t;
    var win = cfgOf(item, 'win', '24h'), style = cfgOf(item, 'style', 'bars');
    var bline = item && item.cfg && item.cfg.bline !== undefined ? !!item.cfg.bline : true;
    var ds = D.chart[win] || D.chart['24h'];
    /* the chart flexes to soak its tile (the reference "content soaks its box"
       pattern) — only the column COUNT tracks the width sub-tier */
    var ncols = t === 0 || f.px === 'micro' ? 6 : f.px === 'narrow' ? 9 : f.px === 'mid' ? 14 : ds.cols.length;
    var cols = ds.cols.slice(-ncols);
    var maxT = 1;
    ds.cols.forEach(function (c) { maxT = Math.max(maxT, c[1] + c[2] + c[3] + c[4]); });
    var plot = cols.map(function (c) {
      function seg(k, v) { return '<i class="s-' + k + '" data-h="' + (v / maxT * 100).toFixed(1) + '"></i>'; }
      return '<span class="wd-col" title="' + c[0] + ' · ' + c[1] + '% in · ' + c[2] + '% out · ' + c[3] + '% reasoning · ' + c[4] + '% cache"><span class="wd-cs">' +
        seg('inp', c[1]) + seg('out', c[2]) + seg('rea', c[3]) + seg('cache', c[4]) + '</span><b>' + c[0] + '</b></span>';
    }).join('');
    var bl = bline ? '<span class="wd-bline" style="bottom:' + D.chartBudgetLine + '%"><span>budget ' + D.budget.warningThreshold + '%</span></span>' : '';
    var series = [['inp', 'Input', '--ser-inp'], ['out', 'Output', '--ser-out'], ['rea', 'Reasoning', '--ser-rea'], ['cache', 'Cache r/w', '--ser-cache']];
    if (f.h < 120) {
      return sliver('<span class="ell">' + ds.note + ' · stacked share of peak</span>');
    }
    var wins = t >= 2 ? '<span class="wd-wins">' + ['5h', '24h', '7d'].map(function (b) {
      return '<button type="button" data-wd-awin="' + b + '" class="' + (b === win ? 'on' : '') + '">' + b + '</button>'; }).join('') + '</span>' : '';
    var legend = t >= 1 ? '<div class="wd-legend">' + series.map(function (s) {
      return '<button type="button" data-wd-ser="' + s[0] + '" title="Toggle series"><span class="wd-sw" style="background:var(' + s[2] + ')"></span>' + s[1] + '</button>'; }).join('') + '</div>' : '';
    return wins + '<span class="wd-cap wd-cnote">' + ds.note + ' · stacked share of peak</span>' +
      '<div class="wd-chart' + (style === 'outline' ? ' outline' : '') + '"><div class="wd-plot">' + plot + bl + '</div></div>' + legend;
  }

  /* ---- budget: monthly limit, presets, forecast ---- */
  function renderBudget(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R, fmt = cx.fmt;
    var f = fitOf(sk, item), t = f.t, b = D.budget;
    var sp = Math.round(b.spentMTD / b.monthlyLimit * 100);
    var pj = Math.round(b.projectedMTD / b.monthlyLimit * 100);
    var donutsOn = cfgOf(item, 'donuts', 'on') === 'on';
    function donutSet(twoOnly) {
      var seen = {}, dts = [];
      if (!twoOnly) {
        D.quotas.filter(function (q) { return q.used != null; })
          .sort(function (a, x) { return x.used - a.used; })
          .forEach(function (q) {
            if (dts.length >= 4) return;                 /* top providers only — no chip salad */
            var base = donutLabel(q.name), lb = base;
            if (seen[base]) lb = base + ' \u00b7 ' + (seen[base] + 1);   /* distinct accounts of one provider */
            seen[base] = (seen[base] || 0) + 1;
            dts.push(donut(lb, q.used, TONEV[R.fillTone(q.used)]));
          });
      }
      return '<div class="wd-donuts">' + donut('spent MTD', sp, TONEV[R.fillTone(sp)]) + donut('projected', pj, TONEV[R.fillTone(pj)]) + dts.join('') + '</div>';
    }
    if (f.h < 170) {
      return sliver('<span class="ell">spent <b>' + fmt.cost(b.spentMTD) + '</b> of ' + fmt.cost(b.monthlyLimit) + ' · projected <b>' + fmt.cost(b.projectedMTD) + '</b></span>');
    }
    if (t === 0) {
      return '<div class="wd-hlrow" style="justify-content:center">' + donut('budget MTD', sp, TONEV[R.fillTone(sp)]) + '</div>' +
        '<div class="wd-cap" style="justify-content:center;display:flex;gap:var(--sm)"><span class="us-cost">' + fmt.cost(b.spentMTD) + '</span> of ' + fmt.cost(b.monthlyLimit) + ' · <span class="vs vs-warn"><span>block at limit</span></span></div>' +
        '<div class="wd-note" style="text-align:center">projected <b>' + fmt.cost(b.projectedMTD) + '</b> by month end</div>';
    }
    var narrow = f.px === 'micro' || f.px === 'narrow';
    /* very short tier-2 boxes drop the donut row (the headline + presets +
       stats carry the readout); short tier-1 boxes ride two small donuts */
    var donutCls = (t === 1 && f.h < 150) ? 'wd-donuts wd-donuts-sm' : 'wd-donuts';
    var donutsHere = donutsOn && !(t >= 2 && f.h < 200);
    var html = '<div class="wd-hlrow"><span class="us-big" data-counter="' + b.spentMTD + '" data-prefix="$">$0.00</span>' +
      '<span class="wd-cap">spent MTD of ' + fmt.cost(b.monthlyLimit) + ' · policy <b>block at limit</b></span></div>' +
      (donutsHere ? donutSet(narrow || f.h < 150).replace('class="wd-donuts"', 'class="' + donutCls + '"') : '') +
      '<div class="wd-pres"><span class="wd-presk">Warn at</span>' + b.presets.map(function (p) {
        return '<button type="button" class="wd-pchip' + (p === b.warningThreshold ? ' on' : '') + '" data-wd-preset="' + p + '">' + p + '%</button>';
      }).join('') + '</div>';
    if (t === 1 && !narrow && f.h >= 200) {
      html += '<div class="wd-note">' + ic('bolt') + 'burn ' + fmt.cost(D.burn.perHour) + '/hr · month pace <span style="color:var(--tone-warn-text)">' + fmt.cost(D.forecast.monthPace) + '</span> (+' + D.forecast.monthPaceDelta + '% vs last mo)</div>';
    }
    if (t >= 2) {
      var lite = f.h < 245; /* short tier-2 boxes get the two-line stats + small donuts */
      if (lite) html = html.replace('wd-donuts', 'wd-donuts wd-donuts-sm');
      function stat(icn, k, v, s, cls) {
        return '<div class="wd-stat"><span class="k">' + ic(icn) + k + '</span><span class="v' + (cls ? ' ' + cls : '') + '">' + v + '</span>' + (lite ? '' : '<span class="s">' + s + '</span>') + '</div>';
      }
      html += '<div class="wd-stats">' +
        stat('trend', 'month pace', fmt.cost(D.forecast.monthPace), '+' + D.forecast.monthPaceDelta + '% vs last month', 'warn') +
        stat('hourglass', '5h block proj', fmt.cost(D.forecast.blockProjection), 'at current burn') +
        stat('bolt', 'burn', fmt.cost(D.burn.perHour) + '/hr', fmt.cost(D.burn.perDay) + '/day pace') +
        '</div>' + (t >= 3 && f.h >= 300 ? R.costMicro(D.cost_microdollars, D.costSplit.settlement_status) : '');
    }
    return html + (showFoot(f) && (t < 3 || f.h >= 300) ? foot('Presets are exactly 50 / 80 / 90 / 95 / 100. A budget does not cap spend by itself — policy is <b>block at limit</b>.') : '');
  }

  /* ---- cache: two DISTINCT metrics — the CONTEXT cache-hit rate (share of
     in-context tokens served from cache, D.contextByRole) vs the PROVIDER
     prompt-cache savings (per-provider hit/save in D.cache). They render under
     separate labelled sub-headers so they are never read as one "cache hit"
     figure; zero vs unsupported stay distinct provider states. ---- */
  function renderCache(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R, fmt = cx.fmt;
    var f0 = fitOf(sk, item);
    var f = { t: f0.t, w: f0.w, h: boxH(f0, item), px: f0.px, live: f0.live };
    var t = f.t, sort = cfgOf(item, 'sort', 'save');
    var cb = D.contextByRole || {};
    var list = D.cache.slice();
    if (sort === 'hit') list.sort(function (a, b) { return (b.hit || 0) - (a.hit || 0); });
    else if (sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    else list.sort(function (a, b) { return (b.save || 0) - (a.save || 0); });
    /* Height-driven, MONOTONIC top-N: the cap counts how many provider rows the
       box actually holds so the list soaks its tile instead of clinging to the
       top over a big void — yet never scrolls. Full meter rows (mid/wide) are
       taller than slim name+save rows (narrow/micro), so the row budget tracks
       the width sub-tier; bigger box ⇒ ≥ rows, and the honest "+N more"
       disclosure keeps the tail. Tier 2+ spreads the full list two-up. */
    var fullCols = t >= 1 && (f.px === 'mid' || f.px === 'wide'); /* meter + r/w drop on narrow tiles */
    /* full meter rows run ~28px, slim name+save rows ~25px. The overhead is
       body pad(20) + headline(~26) + disclosure seat(26) + the two inter-block
       gaps(16) + a 6px safety, so the natural row stack always seats UNDER the
       body (never scrolls); the list then flexes to soak the tile (renderers
       css) and the slack reads as even breathing room, not a bottom void. */
    var rowH = fullCols ? 28 : 25;
    var rowsFit = Math.floor((f.h - 94) / rowH);
    var CAP = t >= 2 ? (t >= 3 && f.h < 240 ? 4 : list.length) : Math.min(list.length, Math.max(2, rowsFit));
    var shown = list.slice(0, CAP), rest = list.slice(CAP);
    function row(c) {
      if (c.state === 'unsupported') {
        return '<div class="wd-crow' + (fullCols ? '' : ' slim') + '"><span class="wd-cid"><span class="wd-cnm">' + c.name + '</span>' + vsChip(R, 'unsupported', f) + '</span>' +
          (fullCols ? '<span class="wd-cnum dim">no cache fields exposed</span>' : '') + '<span class="wd-csave na">n/a</span>' +
          (t >= 3 && c.note ? '<div class="wd-cnote">' + c.note + '</div>' : '') + '</div>';
      }
      var zero = (c.save || 0) === 0;
      var note = t >= 3 && f.h >= 260 && (c.zeroNote || c.missReason) ? '<div class="wd-cnote">' + (c.zeroNote || ('miss reason: ' + c.missReason)) + '</div>' : '';
      return '<div class="wd-crow' + (fullCols ? '' : ' slim') + '"><span class="wd-cid"><span class="wd-cnm">' + c.name + '</span>' + vsChip(R, c.state, f) + '</span>' +
        (fullCols ? '<span class="us-meter">' + R.meter(c.hit, 'ok') + '<span class="pc">' + c.hit + '%</span></span><span class="wd-cnum">r ' + fmt.tok(c.cr) + ' · w ' + fmt.tok(c.cw) + '</span>' : '') +
        '<span class="wd-csave' + (zero ? ' zero' : '') + '">' + (zero ? '$0.00' : '\u2212$' + c.save.toFixed(2)) + '</span>' + note + '</div>';
    }
    var SUB = 'font-family:var(--display-font);font-size:8.5px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:var(--text-muted)';
    /* sliver only for a genuinely tiny box — one that cannot seat two rows under
       its headline + disclosure (the old fixed f.h<170 caught a roomy 2×5 whose
       first-paint estimate read short). Live heights pass straight through. */
    if (f.h < 96 || (t < 2 && rowsFit < 2)) {
      var cb0 = D.contextByRole || {};
      return sliver('<span class="ell">prompt-cache <b>\u2212' + fmt.cost(D.cacheTotalSaved) + '</b> today' +
        (cb0.cacheHitRate != null ? ' · context hit <b>' + cb0.cacheHitRate + '%</b>' : '') + '</span>',
        moreBlock('<div class="wd-clist">' + list.map(row).join('') + '</div>', list.length, 'providers · hit rates inside'), f);
    }
    /* tier 1 rides ONE headline line (context hit + provider savings side by
       side, meter soaking between) so the two metrics stay distinct without
       spending two stacked blocks; tier 2+ gets the labelled sub-headers */
    var head;
    if (t === 0) {
      head = '<div class="wd-hlrow"><span class="us-big ok">\u2212' + fmt.cost(D.cacheTotalSaved) + '</span><span class="wd-cap">provider prompt-cache saved today</span></div>';
    } else if (t === 1) {
      head = cb.cacheHitRate != null
        ? '<div class="wd-ctxline"><span class="wd-ctxk">Context cache hit</span><span class="us-meter">' + R.meter(cb.cacheHitRate, 'ok') + '<span class="pc">' + cb.cacheHitRate + '%</span></span>' +
          '<span class="wd-ctxp">prompt-cache <b>\u2212' + fmt.cost(D.cacheTotalSaved) + '</b> today</span></div>'
        : '<div class="wd-ctxline"><span class="wd-ctxk">Provider prompt-cache</span><span class="us-meter"></span><span class="wd-ctxp"><b>\u2212' + fmt.cost(D.cacheTotalSaved) + '</b> today</span></div>';
    } else {
      var ctxBlock = (cb.cacheHitRate != null)
        ? '<div class="wd-cctx" style="padding-bottom:5px;margin-bottom:3px;border-bottom:1px solid var(--border-light)">' +
            '<div style="' + SUB + '">Context cache hit <span style="font-family:var(--mono-font);text-transform:none;letter-spacing:.03em">\u00b7 context window</span></div>' +
            '<div style="display:flex;align-items:center;gap:var(--sm);margin-top:3px"><span class="us-meter" style="flex:1;min-width:24px">' + R.meter(cb.cacheHitRate, 'ok') + '<span class="pc">' + cb.cacheHitRate + '%</span></span></div>' +
            (t >= 3 && cb.cacheHitNote ? '<div class="wd-cnote">' + cb.cacheHitNote + '</div>' : '') +
          '</div>'
        : '';
      head = ctxBlock + '<div style="' + SUB + ';margin:2px 0 1px">Provider prompt-cache <span style="font-family:var(--mono-font);text-transform:none;letter-spacing:.03em;color:var(--tone-ok-text)">\u2212' + fmt.cost(D.cacheTotalSaved) + ' today</span></div>';
    }
    return head +
      splitDuo(shown.map(row), duoable(f) && shown.length > 3, 'wd-clist') +
      moreBlock('<div class="wd-clist">' + rest.map(row).join('') + '</div>', rest.length, 'providers · hit rates inside') +
      (showFoot(f) ? foot('Provider prompt-cache saved about <b>' + fmt.cost(D.cacheTotalSaved) + '</b> today (per-provider hit rates above) \u2014 distinct from the <b>context cache hit</b> rate (' + (cb.cacheHitRate == null ? '\u2014' : cb.cacheHitRate + '%') + '), the share of in-context tokens served from cache. Zero and unsupported are different states; Puppet Master cannot clear provider caches.') : '');
  }

  /* ---- tools: calls, latency p50/p95, error rate, index_used ---- */
  function renderTools(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R, fmt = cx.fmt;
    var f = fitOf(sk, item), t = f.t, key = cfgOf(item, 'sort', 'calls');
    /* deliberate column sets per width sub-tier — p50/p95 and the index meter
       only render where they fit (≥880px), so the table never cuts off right */
    var lat = f.px === 'wide', idxCol = f.px === 'wide' && t >= 2;
    var rows = D.tools.slice().sort(function (a, b) { return (b[key] || 0) - (a[key] || 0); });
    if (t === 0) rows = rows.slice(0, 3);
    var body = rows.map(function (tool) {
      var errCls = tool.err >= 5 ? 'err' : (tool.err >= 2 ? 'warn' : 'ok');
      var idx = tool.idx == null ? R.chip('not_exposed')
        : '<span class="us-meter" style="min-width:64px">' + R.meter(tool.idx, 'info') + '<span class="pc">' + tool.idx + '%</span></span>';
      return '<tr><td class="mono">' + R.humanCap(tool.tool) + '</td><td class="num">' + fmt.num(tool.calls) + '</td>' +
        (lat ? '<td class="num">' + tool.p50 + 'ms</td><td class="num">' + fmt.num(tool.p95) + 'ms</td>' : '') +
        '<td><span class="vs vs-' + errCls + '"><span>' + tool.err.toFixed(1) + '%</span></span></td>' +
        (idxCol ? '<td>' + idx + '</td>' : '') + '</tr>';
    }).join('');
    return '<div class="us-tblwrap wd-tblwrap"><table class="us-tbl"><thead><tr><th>Tool</th><th class="num">Calls</th>' +
      (lat ? '<th class="num">p50</th><th class="num">p95</th>' : '') + '<th>Error rate</th>' + (idxCol ? '<th>index used</th>' : '') +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      (t >= 1 && showFoot(f) ? foot('p95 tail latency and error rate reveal retry tax; index used = how often the tool hit the search index instead of re-reading files.') : '');
  }

  /* ---- accounts: requested vs effective, pressure & live cooldowns ---- */
  function renderAccounts(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R;
    var f = fitOf(sk, item), t = f.t, cds = cfgOf(item, 'cds', 'tick');
    var presChip = { ok: '', approaching_threshold: R.chip('estimated'), cooldown: R.chip('blocked'), exhausted: R.chip('failed') };
    if (f.h < 120) {
      var a0 = D.accounts.filter(function (a) { return a.effective; })[0] || D.accounts[0] || {};
      return sliver('<span class="ell">' + (a0.prov || '') + ' · ' + (a0.name || '') + '</span><span class="us-dot ' +
        (a0.pressure === 'cooldown' || a0.pressure === 'exhausted' ? 'err' : a0.pressure === 'approaching_threshold' ? 'warn' : 'ok') + '"></span><span class="ell">' + R.human(a0.status) + '</span>',
        moreBlock('<div class="wd-agrid">' + D.accounts.map(function (a) { return '<div class="wd-acct' + (a.effective ? ' effective' : '') + '"><div class="wd-ach"><span class="wd-acnm">' + a.prov + ' · ' + a.name + '</span></div><div class="wd-acst"><span class="wd-acstat">' + R.human(a.status) + '</span></div></div>'; }).join('') + '</div>', D.accounts.length, 'accounts'), f);
    }
    /* tier-1 boxes cap the card stack (the tail stays one click away behind
       the disclosure); tier-2+ shows every account, two-up from mid width */
    var acctsAll = t === 0 ? D.accounts.filter(function (a) { return a.effective || a.pressure !== 'ok'; }) : D.accounts;
    var acapN = t === 0 ? (f.h < 150 ? 1 : 2) : t === 1 ? (f.h < 160 ? 1 : f.h < 230 ? 2 : 3) : D.accounts.length;
    var accts = acctsAll.slice(0, acapN), acctRest = acctsAll.slice(acapN);
    function cdFor(a, i) {
      if (a.cooldownSec == null) return '';
      if (cds === 'off') return '';
      if (cds === 'static') return ' <span class="wd-cd">until ' + (a.resetAt || '\u2014') + '</span>';
      return ' <span class="wd-cd" data-wd-cd="' + i + '">' + R.fmtCd(a.cooldownSec) + '</span>';
    }
    function acctCard(a) {
      var i = D.accounts.indexOf(a);
      var dot = a.pressure === 'cooldown' || a.pressure === 'exhausted' ? 'err' : (a.pressure === 'approaching_threshold' ? 'warn' : 'ok');
      var markers = (a.requested ? '<span class="wd-mk req">requested</span>' : '') + (a.effective ? '<span class="wd-mk eff">' + ic('check') + 'effective</span>' : '');
      return '<div class="wd-acct' + (a.effective ? ' effective' : '') + '">' +
        '<div class="wd-ach"><span class="wd-acnm">' + a.prov + ' · ' + a.name + '</span>' + (t >= 2 && f.h >= 240 ? '<span class="wd-acml">' + a.mail + '</span>' : '') + (t >= 1 ? markers : '') + '</div>' +
        '<div class="wd-acst"><span class="us-dot ' + dot + (dot !== 'ok' ? ' pulse' : '') + '"></span><span class="wd-acstat">' + R.human(a.status) + cdFor(a, i) + '</span>' +
        (a.pressure !== 'ok' ? '<span style="margin-left:auto">' + presChip[a.pressure] + '</span>' : '') + '</div>' +
        (t >= 2 && f.h >= 240 && a.note ? '<div class="wd-acnt">' + R.human(a.note) + '</div>' : '') +
        (t >= 2 && f.h >= 260 && a.lastValidated ? '<div class="wd-acnt dim">validated ' + a.lastValidated + ' ago</div>' : '') + '</div>';
    }
    var cards = splitDuo(accts.map(acctCard), t >= 2 && (f.px === 'mid' || f.px === 'wide') && accts.length > 2, 'wd-agrid');
    var hist = '';
    if (t >= 2) {
      /* history is a disclosure at EVERY tier — auto-opening it at XL was the
         4×7 overflow; the record count badge keeps it discoverable */
      hist = '<hr class="us-hr"><div class="wd-hist"><button type="button" class="wd-hist-t">' + ic('chevR') + ic('history') +
        '<span>Pressure &amp; switch history</span><span class="wd-hn">' + D.pressureHistory.length + ' records</span></button><div class="wd-hist-b">' +
        D.pressureHistory.map(function (h) {
          var tone = h.kind === 'switch' ? 'info' : (h.state === 'exhausted' ? 'err' : (h.state === 'approaching' ? 'warn' : 'mute'));
          return '<div class="us-wc"><span class="q">' + h.t + ' · ' + R.human(h.text) + '</span><span class="a" style="color:var(--tone-' + tone + '-text)">' + R.human(h.reason) + '</span></div>';
        }).join('') + '</div></div>';
    }
    return cards +
      moreBlock('<div class="wd-agrid">' + acctRest.map(acctCard).join('') + '</div>', acctRest.length, 'accounts') +
      hist + (showFoot(f) ? foot('Requested is the account you chose; <b>effective</b> is the one doing the work — cost lands on effective.') : '');
  }

  /* ---- context: context budget by source family + omissions ---- */
  function renderContext(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R, fmt = cx.fmt;
    var f = fitOf(sk, item), t = f.t, cb = D.contextBudget;
    var pct = Math.round(cb.totalTokens / cb.limit * 100);
    if (f.h < 120) {
      return sliver('<span class="ell"><b>' + fmt.tok(cb.totalTokens) + '</b> of ' + fmt.tok(cb.limit) + ' tokens · ' + cb.families.length + ' families</span>',
        moreBlock('<div class="wd-famlist">' + cb.families.map(function (x) { return '<div class="wd-fam"><span class="wd-famn">' + x.name + '</span><span class="us-meter">' + R.meter(x.share, 'info') + '<span class="pc">' + x.share + '%</span></span><span class="wd-famt">' + fmt.tok(x.tokens) + '</span></div>'; }).join('') + '</div>', cb.families.length, 'families'), f);
    }
    var tinyBox = f.h < 160 || (t === 2 && f.h < 200) || (t >= 3 && f.h < 240);
    /* short boxes drop the headline (the promoted total row still carries the
       number) and cap the family stack with the tail behind a disclosure */
    var CAP = t === 0 ? 2 : t === 1 ? (f.h < 150 ? 2 : f.px === 'wide' ? 4 : 3) : (f.h < 200 ? 4 : cb.families.length);
    var fams = cb.families.slice(0, CAP), famRest = cb.families.slice(CAP);
    function famRow(x) {
      return '<div class="wd-fam"><span class="wd-famn" title="' + escA(x.note || '') + '">' + x.name + '</span>' +
        '<span class="us-meter">' + R.meter(x.share, 'info') + '<span class="pc">' + x.share + '%</span></span>' +
        '<span class="wd-famt">' + fmt.tok(x.tokens) + '</span></div>';
    }
    /* the total rides the same shared grid as the families (a promoted row, not
       a full-width meter) so every meter in the breakdown shares left/right edges */
    var total = '<div class="wd-fam wd-famtot"><span class="wd-famn">total</span>' +
      '<span class="us-meter">' + R.meter(pct, R.fillTone(pct)) + '<span class="pc">' + pct + '%</span></span>' +
      '<span class="wd-famt"></span></div>';
    var omRows = cb.omitted.map(function (o) {
      return '<div class="us-wc"><span class="q">' + o.name + '</span><span class="a part">' + o.reason + '</span></div>'; });
    var omitted = (t >= 3 && f.h >= 260) ? '<hr class="us-hr">' + omRows.join('')
      : (t >= 2 && cb.omitted.length ? moreBlock(omRows.join(''), cb.omitted.length, 'omitted families — why') : '');
    return (tinyBox ? '' : '<div class="wd-hlrow"><span class="us-big">' + fmt.tok(cb.totalTokens) + '</span><span class="wd-cap">of ' + fmt.tok(cb.limit) + ' tokens</span></div>') +
      '<div class="wd-famlist">' + total + fams.map(famRow).join('') + '</div>' +
      moreBlock('<div class="wd-famlist">' + famRest.map(famRow).join('') + '</div>', famRest.length, 'families') + omitted;
  }

  /* ---- ledger: normalized UsageRecords with drill-through, sort, filters ---- */
  function ledgerMatches(item, r) {
    var ev = cfgOf(item, 'ev', 'all'), plat = cfgOf(item, 'plat', ''), rep = cfgOf(item, 'rep', '');
    var q = String(cfgOf(item, 'q', '')).toLowerCase();
    if (ev !== 'all' && r.ev !== ev) return false;
    if (plat && r.prov !== plat) return false;
    if (rep && r.rep !== rep) return false;
    if (q) {
      var hay = (r.t + ' ' + r.ev + ' ' + r.run + ' ' + r.lane + ' ' + r.prov + ' ' + r.model + ' ' + r.acct).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }
  function ledgerSorted(item, cx) {
    var out = cx.D.ledger.filter(function (r) { return ledgerMatches(item, r); });
    var sk = item && item.cfg ? item.cfg.lsort : null, dir = (item && item.cfg && item.cfg.lsortDir) || 1;
    if (sk) {
      var isNum = { tin: 1, tout: 1, cr: 1, cost: 1 };
      out = out.slice().sort(function (a, b) {
        var av = a[sk], bv = b[sk];
        if (isNum[sk]) { av = av == null ? -1 : av; bv = bv == null ? -1 : bv; return (av - bv) * dir; }
        return String(av == null ? '' : av).localeCompare(String(bv == null ? '' : bv)) * dir;
      });
    }
    return out;
  }
  function ledgerMaxRows(item, t) {
    var size = parseInt(cfgOf(item, 'size', '12'), 10) || 12;
    if (t === 0) return 5;
    if (t === 1) return Math.min(size, 8);
    return size;
  }
  /* deliberate column sets per width sub-tier — the table drops to essential
     columns on narrow tiles instead of cutting off mid-cell; dropped values
     stay reachable in the per-row drill-through detail. */
  var LEDGER_COLS = [
    { k: 'caret' }, { k: 't', th: 'Time' }, { k: 'ev', th: 'Event' }, { k: 'run', th: 'Run · lane' },
    { k: 'prov', th: 'Platform' }, { k: 'model', th: 'Model' }, { k: 'tin', th: 'In', num: 1 },
    { k: 'tout', th: 'Out', num: 1 }, { k: 'cr', th: 'Cache r', num: 1 }, { k: 'rep', th: 'Report' }, { k: 'cost', th: 'Cost', num: 1 }
  ];
  function ledgerColSet(f) {
    if (f.px === 'wide') return LEDGER_COLS;
    var keys = f.px === 'micro' ? ['caret', 't', 'ev', 'cost']
      : f.px === 'narrow' ? ['caret', 't', 'ev', 'prov', 'cost']
      : ['caret', 't', 'ev', 'run', 'prov', 'model', 'cost'];
    return LEDGER_COLS.filter(function (c) { return keys.indexOf(c.k) >= 0; });
  }
  function ledgerCell(c, r, cx) {
    var R = cx.R, fmt = cx.fmt;
    switch (c.k) {
      case 't': return '<td class="mono">' + r.t + '</td>';
      case 'ev': return '<td class="ev-' + r.ev + '">' + (R.evLabel[r.ev] || r.ev) + '</td>';
      case 'run': return '<td class="mono">' + r.run + ' · ' + r.lane + '</td>';
      case 'prov': return '<td>' + r.prov + '</td>';
      case 'model': return '<td class="mono">' + r.model + '</td>';
      case 'tin': return '<td class="num">' + fmt.num(r.tin) + '</td>';
      case 'tout': return '<td class="num">' + fmt.num(r.tout) + '</td>';
      case 'cr': return '<td class="num">' + (r.cr == null ? '<span class="dim" title="not reported by provider">\u2014</span>' : fmt.num(r.cr)) + '</td>';
      case 'rep': return '<td>' + R.chip(r.rep) + '</td>';
      case 'cost': return '<td class="num">' + (r.cost ? fmt.cost(r.cost) : '$0.00') + '</td>';
    }
    return '';
  }
  function ledgerRowHTML(r, i, fresh, cols, cx) {
    var R = cx.R;
    var main = '<tr class="' + (fresh ? 'us-new' : '') + '" data-wd-lrow="' + i + '">' +
      '<td><button type="button" class="wd-lcaret" title="Toggle details" aria-label="Toggle details for ' + escA(r.ref || 'event') + '">' + ic('chevR') + '</button></td>' +
      cols.slice(1).map(function (c) { return ledgerCell(c, r, cx); }).join('') + '</tr>';
    var kv = r.detail || {};
    var cells = Object.keys(kv).map(function (k) { return '<div class="wd-di"><b>' + R.humanCap(k) + '</b><span>' + R.human(kv[k]) + '</span></div>'; }).join('') +
      '<div class="wd-di"><b>Account</b><span>' + r.acct + '</span></div>' +
      '<div class="wd-di"><b>Latency</b><span>' + r.lat + '</span></div>' +
      '<div class="wd-di"><b>Counting</b><span>' + (r.counting_semantics ? r.counting_semantics.provider_style + ' · cache ' + r.counting_semantics.cache_in_input : '\u2014') + '</span></div>' +
      '<div class="wd-di"><b>usage event ref</b><span>' + (r.ref || '\u2014') + '</span></div>';
    var det = '<tr class="wd-ldet" data-wd-ldetail="' + i + '" hidden><td></td><td colspan="' + (cols.length - 1) + '"><div class="wd-dgrid">' + cells + '</div>' +
      '<div class="wd-dact"><button type="button" class="wd-btn" data-demo-action="usage.drill" data-demo-arg="Open ' + escA(r.ref || 'event') + ' in Orchestrator">' +
      ic('external') + 'Open in Orchestrator</button></div></td></tr>';
    return main + det;
  }
  function ledgerRowsHTML(item, f, fresh, cx) {
    var filtered = ledgerSorted(item, cx), max = ledgerMaxRows(item, f.t), cols = ledgerColSet(f), out = [];
    for (var i = 0; i < filtered.length && out.length < max; i++) out.push(ledgerRowHTML(filtered[i], i, fresh && out.length === 0, cols, cx));
    return { html: out.join(''), n: filtered.length };
  }
  function updateLedgerTable(bodyEl, item, cx) {
    cx = cx || CTX();
    var tb = bodyEl.querySelector('.wd-ltb'); if (!tb) return;
    var res = ledgerRowsHTML(item, fitOf('custom', item), false, cx);
    tb.innerHTML = res.html;
    var c = bodyEl.querySelector('.wd-lcount');
    if (c) c.textContent = res.n + ' of ' + cx.D.ledger.length + ' events';
  }
  function renderLedger(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R;
    var f = fitOf(sk, item), t = f.t;
    var lsort = cfgOf(item, 'lsort', ''), ldir = cfgOf(item, 'lsortDir', '1');
    function th(c) {
      var on = lsort === c.k;
      return '<th class="' + (c.num ? 'num' : '') + (on ? ' on' : '') + (on && ldir === '-1' ? ' rev' : '') + '" data-wd-sort="' + c.k + '">' + c.th + '</th>';
    }
    var qv = escA(cfgOf(item, 'q', ''));
    var cols = ledgerColSet(f);
    var res = ledgerRowsHTML(item, f, false, cx);
    var search = t >= 1 ? '<label class="pm-input wd-lsearch">' + ic('search') + '<input type="text" data-wd-lq placeholder="Search run, model, account…" aria-label="Search ledger" value="' + qv + '"></label>' : '';
    /* the table rides its own .us-tblwrap scroller (the deliberate paging
       model) so sliver boxes drop the control row / footnote and let the
       table soak the body instead of scrolling it */
    var tableHtml = '<div class="us-tblwrap wd-tblwrap"><table class="us-tbl"><thead><tr>' +
      '<th style="width:22px" aria-label="Expand"></th>' + cols.slice(1).map(th).join('') +
      '</tr></thead><tbody class="wd-ltb">' + res.html + '</tbody></table></div>';
    if (f.h < 120) return tableHtml;
    return '<div class="wd-lctl">' + search +
      '<span class="wd-live"><span class="us-dot ok pulse"></span>live</span>' +
      '<span class="wd-lcount">' + res.n + ' of ' + D.ledger.length + ' events</span></div>' + tableHtml +
      (f.h >= 150 ? foot('Every row carries a stable <b>usage event ref</b> — drill-through preserves it. Cost lands on the <b>effective</b> account. Event type, platform, reporting and page size live in Configure.') : '');
  }

  /* ---- signals: efficiency grade, wins, improvements, risks ---- */
  function renderSignals(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R, fmt = cx.fmt;
    var f = fitOf(sk, item), t = f.t, e = D.efficiency;
    function sig(list, cls) {
      return list.map(function (s) { return '<div class="wd-sigrow ' + cls + '"><span class="sd"></span><span class="st">' + s.text + '</span></div>'; }).join('');
    }
    var shortBox = f.h < 200;
    var head = '<div class="wd-grade' + (shortBox && t < 3 ? ' sm' : '') + '"><b>' + e.grade + '</b><span>' + e.score + '/100 efficiency · retry tax ' + e.retryTaxPct + '% (\u2248' + fmt.cost(e.retryTaxUsd) + ')</span></div>';
    if (f.h < 120) {
      return sliver('<b>' + e.grade + '</b><span class="ell">' + e.score + '/100 efficiency · retry tax ' + e.retryTaxPct + '%</span>',
        moreBlock(sig(D.signals.wins, 'win') + sig(D.signals.improvements, 'imp') + sig(D.signals.risks, 'risk'), D.signals.wins.length + D.signals.improvements.length + D.signals.risks.length, 'signals'), f);
    }
    if (t === 0) return head + sig(D.signals.wins.slice(0, 1), 'win') + sig(D.signals.risks.slice(0, 1), 'risk');
    var comp = '<div class="wd-famlist">' + e.components.map(function (c) {
      return '<div class="wd-fam"><span class="wd-famn">' + c.k + ' (' + Math.round(c.w * 100) + '%)</span>' +
        '<span class="us-meter">' + R.meter(c.v, c.adverse ? 'hot' : 'ok') + '<span class="pc">' + c.v + '%</span></span><span class="wd-famt"></span></div>';
    }).join('') + '</div>';
    var nAll = D.signals.wins.length + D.signals.improvements.length + D.signals.risks.length;
    if (t === 1 && f.h < 200) {
      /* short tier-1 boxes keep the grade; the components + signal lists fold
         behind the disclosure */
      return head + moreBlock(comp + '<div class="wd-sigk win">WINS</div>' + sig(D.signals.wins, 'win') +
        '<div class="wd-sigk imp">IMPROVEMENTS</div>' + sig(D.signals.improvements, 'imp') +
        '<div class="wd-sigk risk">RISKS</div>' + sig(D.signals.risks, 'risk'), nAll + e.components.length, 'signals — components & lists inside');
    }
    if (t >= 3) {
      if (f.h < 460) {
        /* the grade + component meters stay visible; every signal list folds
           behind one disclosure so shorter tier-3 boxes never scroll */
        return head + comp +
          moreBlock('<div class="wd-sigk win">WINS</div>' + sig(D.signals.wins, 'win') +
            '<div class="wd-sigk imp">IMPROVEMENTS</div>' + sig(D.signals.improvements, 'imp') +
            '<div class="wd-sigk risk">RISKS</div>' + sig(D.signals.risks, 'risk'),
            nAll, 'signals — wins, improvements & risks inside');
      }
      return head + comp +
        '<div class="wd-sigk win">WINS</div>' + sig(D.signals.wins, 'win') +
        '<div class="wd-sigk imp">IMPROVEMENTS</div>' + sig(D.signals.improvements, 'imp') +
        '<div class="wd-sigk risk">RISKS</div>' + sig(D.signals.risks, 'risk');
    }
    var wcap = (t === 1 || shortBox) ? 1 : 2;
    var tail = sig(D.signals.wins.slice(wcap), 'win') +
      '<div class="wd-sigk imp">IMPROVEMENTS</div>' + sig(D.signals.improvements, 'imp') +
      '<div class="wd-sigk risk">RISKS</div>' + sig(D.signals.risks, 'risk');
    var nTail = (D.signals.wins.length - wcap) + D.signals.improvements.length + D.signals.risks.length;
    /* grade + components + lead win ride one tight column so short boxes spend
       their height on content, not inter-block gaps */
    return '<div class="wd-sigbody">' + head + comp + '<div class="wd-sigk win">WINS</div>' + sig(D.signals.wins.slice(0, wcap), 'win') + '</div>' +
      moreBlock(tail, nTail, 'signals — improvements & risks inside');
  }

  /* ---- whatcounts: which requests count as usage (quick guide) ---- */
  function renderWhatCounts(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D;
    var f = fitOf(sk, item), t = f.t;
    if (f.h < 120) {
      return sliver('<span class="ell"><b>' + D.whatCounts.length + '</b> rules — which requests count as usage</span>',
        moreBlock(D.whatCounts.map(function (w) { return '<div class="us-wc"><span class="q">' + w.q + '</span><span class="a ' + (w.counts === true ? 'yes' : w.counts === false ? 'no' : 'part') + '">' + (w.counts === true ? 'counts' : w.counts === false ? 'no' : 'partial') + '</span></div>'; }).join(''), D.whatCounts.length, 'rules'), f);
    }
    var CAP = t === 0 ? (f.h < 150 ? 3 : 4) : t === 1 ? (f.h < 160 ? 3 : 5) : D.whatCounts.length;
    var withNotes = t >= 2 && (f.px === 'mid' || f.px === 'wide');
    function wcRow(w) {
      var a = w.counts === true ? '<span class="a yes">counts</span>' : (w.counts === false ? '<span class="a no">no</span>' : '<span class="a part">partial</span>');
      return '<div class="us-wc"><span class="q">' + w.q + (w.note && withNotes ? ' <span style="color:var(--text-muted)">\u2014 ' + w.note + '</span>' : '') + '</span>' + a + '</div>';
    }
    var shown = D.whatCounts.slice(0, CAP), rest = D.whatCounts.slice(CAP);
    return splitDuo(shown.map(wcRow), duoable(f) && shown.length > 5, 'wd-wclist') +
      moreBlock(rest.map(wcRow).join(''), rest.length, 'rules') +
      (showFoot(f) ? foot('Sentry-style quick guide: when in doubt, the ledger row and its usage event ref are the receipt.')
        : (t === 0 && f.h >= 150 ? foot(D.whatCounts.length + ' rules — expand for all.') : ''));
  }

  /* ---- planGating: per-plan gating states, shown not guessed ---- */
  function renderPlanGating(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D;
    var f = fitOf(sk, item), t = f.t;
    var chip = {
      ok: '<span class="vs vs-ok"><span>included active</span></span>',
      included_premium_exhausted: '<span class="vs vs-warn"><span>premium exhausted</span></span>',
      rate_limited: '<span class="vs vs-warn"><span>rate-limited</span></span>',
      unverified: '<span class="vs vs-mute vs-dash"><span>unverified</span></span>',
      plan_not_included: '<span class="vs vs-purple vs-dash"><span>not in plan</span></span>'
    };
    /* 2×5 (tier-1) spilled ~9px with three full status rows: tight boxes get
       a single-line status (full text in the title), the shorter u9-pitch
       2×5 (144px) drops to two rows + disclosure, and sub-140px boxes
       degrade to the tier-0 shape (state chip, no status line). */
    if (f.h < 120) {
      var g0 = D.planGating[0] || {};
      return sliver('<span class="ell">' + (g0.prov || '') + '</span>' + (chip[g0.state] || ''),
        moreBlock('<div class="wd-pglist">' + D.planGating.map(function (g) { return '<div class="wd-pgrow"><div class="wd-pgh"><span class="wd-pgnm">' + g.prov + '</span>' + (chip[g.state] || '') + '</div><div class="wd-pgst">' + g.status + (g.sub ? ' \u2014 ' + g.sub : '') + '</div></div>'; }).join('') + '</div>', D.planGating.length, 'plans'), f);
    }
    var tinyBox = f.h < 140;
    var tight = !tinyBox && t === 1 && f.h < 200;
    var CAP = t === 0 ? (tinyBox ? 2 : 3) : t === 1 ? (f.h < 160 ? 2 : 3) : D.planGating.length;
    function pgRow(g) {
      var st = g.status + (g.sub ? ' \u2014 ' + g.sub : '') + (t >= 2 && g.extra ? ' · ' + g.extra : '');
      return '<div class="wd-pgrow' + (tight ? ' tight' : '') + '"><div class="wd-pgh"><span class="wd-pgnm">' + g.prov + '</span>' + (chip[g.state] || '') + '</div>' +
        (t >= 1 && !tinyBox ? '<div class="wd-pgst' + (tight ? ' tight' : '') + '"' + (tight ? ' title="' + escA(st) + '"' : '') + '>' + st + '</div>' : '') + '</div>';
    }
    var shown = D.planGating.slice(0, CAP), rest = D.planGating.slice(CAP);
    return splitDuo(shown.map(pgRow), duoable(f) && shown.length > 4, 'wd-pglist') +
      moreBlock(rest.map(pgRow).join(''), rest.length, 'plans') +
      (showFoot(f) ? foot('Gating is shown as reported or explicitly unverified — never silently assumed.') : '');
  }

  /* ---- spend: pulse readout with burn, pace, spark ---- */
  function renderSpend(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R, fmt = cx.fmt;
    var f = fitOf(sk, item), t = f.t, micro = f.px === 'micro';
    if (f.h < 170) {
      return sliver('<span class="ell">5h <b>' + fmt.cost(D.spend['5h']) + '</b> · 24h ' + fmt.cost(D.spend['24h']) + ' · 7d ' + fmt.cost(D.spend['7d']) + '</span>' + vsChip(R, D.spendBasis, f));
    }
    /* the micro tier (2×3 free tiles, ~88px bodies) is one figure + chips —
       every other composition overflowed the box */
    if (t === 0) {
      return '<div class="wd-hlrow"><span class="us-big' + (micro ? ' sm' : '') + '" data-counter="' + D.spend['5h'] + '" data-prefix="$">$0.00</span>' +
        '<span class="wd-cap">spend · 5h</span></div>' +
        '<div class="wd-chiprow">' + R.chip(D.spendBasis) +
        (micro ? '' : '<span class="wd-minichip">24h <b>' + fmt.cost(D.spend['24h']) + '</b></span><span class="wd-minichip">7d <b>' + fmt.cost(D.spend['7d']) + '</b></span>') + '</div>';
    }
    /* short tier-1 boxes keep the figure + windows, dropping the basis note
       line so a 2×4-style tile composes without scrolling */
    var spendTrim = t === 1 && f.h < 160;
    var main = '<div class="wd-hlrow"><span class="us-big" data-counter="' + D.spend['5h'] + '" data-prefix="$">$0.00</span>' +
      '<span class="wd-cap">spend · last 5h ' + R.chip(D.spendBasis) + '</span></div>' +
      (spendTrim ? '' : '<div class="wd-note">list-rate basis — may differ from your actual bill</div>' +
      '<div class="wd-cap wd-spanrow"><span>24h <b class="us-cost">' + fmt.cost(D.spend['24h']) + '</b></span><span>7d <b class="us-cost">' + fmt.cost(D.spend['7d']) + '</b></span></div>');
    var mtdPct = Math.round(D.budget.spentMTD / D.budget.monthlyLimit * 100);
    if (t === 1) {
      return main + (f.px === 'wide' || f.px === 'mid'
        ? '<div class="wd-stats">' +
          '<div class="wd-stat"><span class="k">' + ic('bolt') + 'burn</span><span class="v">$' + D.burn.perHour.toFixed(2) + '/hr</span><span class="s">$' + D.burn.perDay.toFixed(2) + '/day pace</span></div>' +
          '<div class="wd-stat"><span class="k">' + ic('trend') + 'month pace</span><span class="v warn">' + fmt.cost(D.forecast.monthPace) + '</span><span class="s">+' + D.forecast.monthPaceDelta + '% vs last mo</span></div>' +
          '</div>'
        : '<div class="wd-gaugerow">' + donut('budget MTD', mtdPct, TONEV[R.fillTone(mtdPct)]) + '<span class="vs vs-warn"><span>block at limit</span></span></div>');
    }
    var stats = '<div class="wd-stats">' +
      '<div class="wd-stat"><span class="k">' + ic('bolt') + 'burn rate</span><span class="v">$' + D.burn.perHour.toFixed(2) + '/hr</span><span class="s">$' + D.burn.perDay.toFixed(2) + '/day pace</span></div>' +
      '<div class="wd-stat"><span class="k">' + ic('trend') + 'month pace</span><span class="v warn">' + fmt.cost(D.forecast.monthPace) + '</span><span class="s">+' + D.forecast.monthPaceDelta + '% vs last mo</span></div>' +
      (t >= 2 ? '<div class="wd-stat"><span class="k">' + ic('hourglass') + '5h block proj</span><span class="v">' + fmt.cost(D.forecast.blockProjection) + '</span><span class="s">at current burn</span></div>' : '') +
      '<div class="wd-stat"><span class="k">' + ic('layers') + 'cache saved</span><span class="v ok">\u2212' + fmt.cost(D.cacheTotalSaved) + '</span><span class="s">today, provider caches</span></div>' +
      '</div>';
    var gauge = '<div class="wd-gaugerow">' + donut('budget MTD', mtdPct, TONEV[R.fillTone(mtdPct)]) + '<span class="vs vs-warn"><span>block at limit</span></span></div>';
    var spark = '';
    if (t >= 3 && f.h >= 260) {
      var sc = (D.chart['24h'] || D.chart['5h'] || { cols: [] }).cols, smx = 1;
      sc.forEach(function (c) { smx = Math.max(smx, c[1] + c[2] + c[3] + c[4]); });
      spark = '<div class="wd-spark"><span class="wd-cap">' + ic('trend') + 'activity · last 24h — token shape tracks burn</span><div class="wd-spk">' +
        sc.map(function (c) { return '<i style="height:' + ((c[1] + c[2] + c[3] + c[4]) / smx * 100).toFixed(1) + '%" title="' + c[0] + '"></i>'; }).join('') + '</div></div>';
    }
    /* wide-tall resizes (3×8, 6×6…) used to stack main + stats + gauge +
       spark and scroll; mid/wide tier-2+ boxes run the readout and the
       gauge (± spark) side by side with the stats band underneath, so the
       composition fits any legal span */
    if (t >= 2 && (f.px === 'mid' || f.px === 'wide')) {
      return duoCols(main, gauge + spark, 'wd-spendcol') + stats;
    }
    return main + stats + gauge + spark;
  }

  /* ---- provenance: the honesty panel (as-of, cadence, basis, meta) ---- */
  function renderProvenance(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R;
    var f = fitOf(sk, item), t = f.t;
    function pv(k, v) { return '<div class="wd-pv"><span>' + k + '</span><b>' + v + '</b></div>'; }
    var core = pv('as of', D.asOf + ' (' + D.asOfMin + 'm ago)') + pv('refresh cadence', 'every ' + D.refreshMin + ' min') +
      pv('projection', R.projChip(D.projectionMeta) || R.chip(D.projectionHealth === 'current' ? 'measured' : 'stale')) +
      pv('spend basis', R.chip(D.spendBasis));
    var extra = pv('next auto-refresh', D.nextAutoRefresh) + pv('retention', D.retentionDays + ' days') +
      pv('cost authority', R.costMicro(D.cost_microdollars, D.costSplit.settlement_status)) +
      pv('cost split reconciles', D.costSplit.reconciles ? '<span class="vs vs-ok"><span>yes</span></span>' : '<span class="vs vs-warn"><span>check</span></span>');
    var HONEST = '<b>missing \u2260 zero</b> — disabled, hidden, unknown and stale are states with chips, never silent zeroes.';
    if (f.h < 120) {
      return sliver('<span class="ell">as of <b>' + D.asOf + '</b> (' + D.asOfMin + 'm ago) · every ' + D.refreshMin + 'm</span>');
    }
    if (t === 0) {
      /* micro/narrow tiles (the 1-wide freeform strip) stack label-over-value —
         the two-column pv grid cannot wrap under ~160px without cutting off;
         sub-160px boxes keep the four core facts and drop only the footnote */
      var stackCls = f.px === 'micro' || f.px === 'narrow' ? ' wd-pvstack' : '';
      return '<div class="wd-pvlist' + stackCls + '">' + core + '</div>' + (f.h >= 160 ? foot(HONEST) : '');
    }
    /* the short full-width closers (6×4) are tier 1 — but they ARE wide, so the
       8 rows run two-up instead of stacking 2.7× over a 106px body; boxes too
       short for even the two-up fold the extra facts behind a disclosure */
    if (f.h < 140) {
      return '<div class="wd-pvlist">' + core + '</div>' +
        moreBlock('<div class="wd-pvlist">' + extra + '</div>', 4, 'provenance facts');
    }
    var rows = ((f.px === 'wide' || f.px === 'mid') && (f.t >= 1)) ? duo(core, extra, 'wd-pvlist') : '<div class="wd-pvlist">' + core + extra + '</div>';
    return rows + (showFoot(f) ? foot(HONEST) : '');
  }

  /* ---- sessions: per-session tokens (source-aware) + cost ---- */
  function renderSessions(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R, fmt = cx.fmt;
    var f = fitOf(sk, item), t = f.t, sort = cfgOf(item, 'sort', 'tokens');
    var list = D.sessions.slice();
    if (sort === 'cost') list.sort(function (a, b) { return (b.cost_microdollars || 0) - (a.cost_microdollars || 0); });
    else if (sort === 'started') list.sort(function (a, b) { return String(b.started).localeCompare(String(a.started)); });
    else list.sort(function (a, b) { return (b.provider_total || 0) - (a.provider_total || 0); });
    if (f.h < 170) {
      var s0 = list[0] || {};
      return sliver('<span class="ell">' + (s0.title || '') + '</span><b>' + (s0.provider_total != null ? fmt.tok(s0.provider_total) : '\u2014') + '</b>',
        moreBlock('<div class="wd-sesslist">' + list.map(function (s) { return '<div class="wd-sess slim"><div class="wd-qh"><span class="wd-qnm">' + s.title + '</span><span class="wd-stot">' + (s.provider_total != null ? fmt.tok(s.provider_total) : R.chip('unknown')) + '</span></div><div class="wd-qsub">' + s.provider + ' · ' + s.model + '</div></div>'; }).join('') + '</div>', list.length, 'sessions'), f);
    }
    /* cap table is MONOTONIC over tier/box: 2 ≤ 3 ≤ {3,4} ≤ all — a bigger
       tile never shows fewer cards than a smaller one (the old tier-2
       mid-width cap of 2 let a 2×10 show fewer cards than a 2×6). Short
       boxes ride the slim card and split two-up instead of dropping rows. */
    var shortBox = t === 2 && f.h < 200; /* short tier-2 boxes get the slim card */
    var slim = shortBox || (t === 1 && f.h < 260) || (t === 0 && f.h < 170);
    var CAP = t === 0 ? 2 : t === 1 ? 3 : t === 2 ? (f.px === 'wide' && !shortBox ? 4 : 3) : list.length;
    var shown = list.slice(0, CAP), rest = list.slice(CAP);
    function sessCard(s, slim) {
      var tok = s.provider_total != null ? fmt.tok(s.provider_total) : R.chip('unknown');
      if (slim) {
        /* slim card: title with the total inline, one sub line — cost/context
           ride the disclosure rows, which render the full card */
        return '<div class="wd-sess slim"><div class="wd-qh"><span class="wd-qnm">' + s.title + '</span><span class="wd-stot">' + tok + '</span></div>' +
          '<div class="wd-qsub">' + s.provider + ' · ' + s.model + ' · ' + s.messages + ' msgs · from ' + s.started + '</div></div>';
      }
      var flags = (s.premium ? '<span class="vs vs-purple"><span>premium</span></span> ' : '') + (s.planBacked ? '<span class="vs vs-info"><span>plan-backed</span></span>' : '');
      var ctxPct = Math.round(s.ctxUsed / s.ctxLimit * 100);
      var bs = null;
      for (var i = 0; i < D.bySession.length; i++) if (D.bySession[i].id === s.id) { bs = D.bySession[i]; break; }
      return '<div class="wd-sess">' +
        '<div class="wd-qh"><span class="wd-qnm">' + s.title + '</span>' + (t >= 2 ? flags : '') + '</div>' +
        '<div class="wd-qsub">' + s.provider + ' · ' + s.model + ' · ' + s.messages + ' msgs' + (s.subagents ? ' · ' + s.subagents + ' sub' : '') + ' · from ' + s.started + '</div>' +
        '<div class="us-kv"><span class="k">tokens (source-aware)</span><span class="v">' + tok + '</span></div>' +
        (t >= 2 ? '<div class="us-kv"><span class="k">cost</span><span class="v">' + (R.costMicro(s.cost_microdollars)) + '</span></div>' : '') +
        /* the context meter + basis note ride only tier-3 boxes tall enough
           to hold them without scrolling */
        (t >= 3 && f.h >= 300 ? R.meterRow('ctx', ctxPct, R.fillTone(ctxPct)) + (bs ? '<div class="wd-note">' + bs.tokensBasis + '</div>' : '') : '') +
        '</div>';
    }
    var wideish = f.px === 'mid' || f.px === 'wide';
    return (t >= 1 ? '<div class="us-kv wd-subkv"><span class="k">Subagent tokens</span><span class="v">' + fmt.tok(D.subagentTokens) + '</span></div>' : '') +
      splitDuo(shown.map(function (s) { return sessCard(s, slim); }), wideish && shown.length > 2 && (slim ? t >= 1 : duoable(f)), 'wd-sesslist') +
      moreBlock('<div class="wd-sesslist">' + rest.map(function (s) { return sessCard(s, false); }).join('') + '</div>', rest.length, 'sessions') +
      (t >= 3 && f.h >= 300 ? foot(R.human(D.usedTokensBasis)) : '');
  }

  /* ---- cost: single cost_microdollars authority split by entitlement ----
     The canonical three-way split (API-billed · plan-included · combined) is a
     modest breakdown: each figure carries its value-state chip and the combined
     reconciles to the single cost_microdollars authority. Kept secondary
     (usage-first) — no $ hero; quota pressure leads on the other surfaces. */
  function renderCost(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R;
    var f = fitOf(sk, item), t = f.t, cs = D.costSplit;
    var apiPct = cs.combinedMicro ? Math.round(cs.apiMicro / cs.combinedMicro * 100) : 0;
    function line(k, micro, status, strong) {
      return '<div class="wd-costrow' + (strong ? ' strong' : '') + '"><span class="k">' + k + '</span>' +
        '<span class="v">' + R.costMicro(micro, status) + '</span></div>';
    }
    if (f.h < 120) {
      return sliver('<span class="ell">combined <b>' + fmt.cost(cs.combinedMicro / 1e6) + '</b> · API ' + fmt.cost(cs.apiMicro / 1e6) + ' · plan ' + fmt.cost(cs.planEstMicro / 1e6) + '</span>');
    }
    /* tier 0 (the 2×3 micro tile, 88px body): the combined figure + the two
       entitlement chips — the three split rows only fit from tier 1 up */
    if (t === 0) {
      /* micro tile: the figure + entitlement chips, nothing else — the card
         title already says "Cost" */
      return '<div class="wd-cost">' + line('Combined', cs.combinedMicro, cs.combinedStatus, true) + '</div>' +
        '<div class="wd-chiprow"><span class="wd-minichip">API ' + R.costMicro(cs.apiMicro, cs.apiStatus) + '</span>' +
        '<span class="wd-minichip">plan ' + R.costMicro(cs.planEstMicro, cs.planStatus) + '</span></div>';
    }
    /* the breakdown composes at ANY span: mid/wide tier-2+ boxes run the
       split and the reconciliation side by side (wide-tall resizes used to
       stack everything and scroll), short boxes fold the add-ons + notes
       behind a disclosure instead of overflowing the body. */
    var breakdown = (f.h >= 165 || t >= 2 ? '<div class="wd-cap wd-cnote">cost · this cycle · one microdollars authority split by entitlement</div>' : '') +
      '<div class="wd-cost">' +
        line('API billed', cs.apiMicro, cs.apiStatus) +
        line('Plan included · est. value', cs.planEstMicro, cs.planStatus) +
        line('Combined', cs.combinedMicro, cs.combinedStatus, true) +
      '</div>' +
      /* the api-share meter yields on very short tier-1 boxes */
      (t === 1 && f.h < 150 ? '' : '<div class="us-meter"><span class="lb">api</span>' + R.meter(apiPct, 'info') + '<span class="pc">' + apiPct + '%</span></div>');
    var reconcile = '<div class="us-kv"><span class="k">reconciles to cost authority</span><span class="v">' +
        (cs.reconciles ? '<span class="vs vs-ok"><span>yes</span></span> ' + R.costMicro(D.cost_microdollars) : '<span class="vs vs-warn"><span>check</span></span>') + '</span></div>';
    if (t >= 2) {
      var addonsHtml = (D.addons || []).map(function (a) {
          return '<div class="us-list"><span class="r"><span class="k">' + a.prov + ' · ' + R.human(a.kind) + '</span><span class="chip">' + R.chip(a.vs) + '</span>' +
            '<span class="v">' + a.used + '/' + a.purchased + ' ' + R.human(a.unit) + '</span></span></div>';
        }).join('');
      var notesHtml = '<div class="wd-note">' + R.human(cs.apiNote) + '</div><div class="wd-note">' + R.human(cs.planNote) + '</div>' +
        (t >= 3 ? '<div class="wd-note">' + R.human(cs.settlement_status) + ' · ' + R.human(cs.note) + '</div>' : '');
      var nExtras = (D.addons || []).length + 2 + (t >= 3 ? 1 : 0);
      if (f.h < 210) {
        return breakdown + reconcile +
          moreBlock(addonsHtml + notesHtml, nExtras, 'add-ons · cost notes inside') +
          (showFoot(f) ? foot('One <b>cost microdollars</b> authority; the split is a projection by entitlement class, not a second cost model.') : '');
      }
      if (f.px === 'mid' || f.px === 'wide') {
        return duoCols(breakdown, reconcile + '<hr class="us-hr">' + addonsHtml + notesHtml, 'wd-costcol') +
          (showFoot(f) && f.h >= 240 ? foot('One <b>cost microdollars</b> authority; the split is a projection by entitlement class, not a second cost model.') : '');
      }
      return breakdown + reconcile + '<hr class="us-hr">' + addonsHtml + notesHtml +
        (showFoot(f) ? foot('One <b>cost microdollars</b> authority; the split is a projection by entitlement class, not a second cost model.') : '');
    }
    return breakdown + reconcile + (showFoot(f) ? foot('One <b>cost microdollars</b> authority; the split is a projection by entitlement class, not a second cost model.') : '');
  }

  /* ---- tokens: by model, source-aware totals, unknown-not-zero ---- */
  function renderTokens(item, sk, cx) {
    cx = cx || CTX(); var D = cx.D, R = cx.R, fmt = cx.fmt;
    var f = fitOf(sk, item), t = f.t, sort = cfgOf(item, 'sort', 'total');
    var list = D.byModel.slice();
    function key(m) {
      if (sort === 'input') return m.input || 0;
      if (sort === 'output') return m.output || 0;
      if (sort === 'cost') return m.cost_microdollars || 0;
      return m.provider_total == null ? -1 : m.provider_total;
    }
    list.sort(function (a, b) { return key(b) - key(a); });
    if (f.h < 120) {
      var m0 = list[0] || {};
      return sliver('<span class="ell">' + (m0.model || '') + '</span>' + vsChip(R, m0.vs || 'measured', f) +
        '<b>' + (m0.provider_total != null ? fmt.tok(m0.provider_total) : '\u2014') + '</b>',
        moreBlock('<div class="wd-tlist">' + list.map(function (m) { return '<div class="wd-trow slim"><span class="wd-tid"><span class="wd-qnm">' + m.model + '</span>' + vsChip(R, m.vs || 'measured', f) + '</span><span class="wd-ttot">' + (m.provider_total != null ? fmt.tok(m.provider_total) : R.chip('unknown')) + '</span></div>'; }).join('') + '</div>', list.length, 'models · source-aware totals, unknown never zero'), f);
    }
    var CAP = t === 0 ? 2 : t === 1 ? (f.h < 150 ? 2 : 3) : list.length;
    var shown = list.slice(0, CAP), rest = list.slice(CAP);
    var midPlus = f.px === 'mid' || f.px === 'wide';
    /* one compact shared-grid row per model (meter-style alignment): the old
       full kv cards ran 3.96× over a 2×6 body — the headline IS the total */
    function mrow(m) {
      var tot = m.provider_total != null ? fmt.tok(m.provider_total) : R.chip('unknown');
      var sub = m.provider + ' · ' + m.sessions + ' session' + (m.sessions === 1 ? '' : 's') +
        (t >= 3 && f.px === 'wide' ? ' · ' + fmt.tok(m.input) + ' in · ' + fmt.tok(m.output) + ' out · cache r ' + fmt.tok(m.cacheRead) : '');
      return '<div class="wd-trow' + (midPlus ? '' : ' slim') + '">' +
        '<span class="wd-tid"><span class="wd-qnm" title="' + escA(m.model) + '">' + m.model + '</span>' + vsChip(R, m.vs || 'measured', f) + '</span>' +
        (midPlus ? '<span class="wd-tsub">' + sub + '</span>' : '') +
        '<span class="wd-ttot">' + tot + '</span>' +
        (t >= 2 && midPlus ? '<span class="wd-tcost">' + R.costMicro(m.cost_microdollars, m.entitlement_class === 'plan_included' ? 'included' : null) + '</span>' : '') +
        '</div>';
    }
    var subKv = t >= 1 ? '<div class="us-kv wd-subkv"><span class="k">Subagent tokens</span><span class="v">' + fmt.tok(D.subagentTokens) + '</span></div>' : '';
    return subKv + splitDuo(shown.map(mrow), duoable(f) && shown.length > 4, 'wd-tlist') +
      moreBlock('<div class="wd-tlist">' + rest.map(mrow).join('') + '</div>', rest.length, 'models · source-aware totals, unknown never zero') +
      (t >= 3 || (t === 2 && f.h >= 240) ? foot(R.human(D.usedTokensBasis)) : '');
  }

  /* ========================================================================
     CATALOG
     ====================================================================== */
  var TYPES = {
    quota:      { id: 'quota',      icon: 'dial',      label: 'Quotas',        span: [3, 8],
      desc: 'Every provider quota — windows, bars, resets, run-out',
      config: function () { return [
        { key: 'win', type: 'select', label: 'Window focus', options: ['auto', '5h', '7d'], value: 'auto' },
        { key: 'notes', type: 'select', label: 'Provider notes', options: ['on', 'off'], value: 'on' }]; },
      render: renderQuota },
    guard:      { id: 'guard',      icon: 'shield',    label: 'Attention',     span: [2, 7],
      desc: 'Anomaly & spend guards with the Why behind each',
      config: function () { return [{ key: 'state', type: 'select', label: 'Show', options: ['attention', 'all'], value: 'attention' }]; },
      render: renderGuard },
    analytics:  { id: 'analytics',  icon: 'trend',     label: 'Token flow',    span: [3, 7],
      desc: 'Stacked token mix over time with budget line',
      config: function () { return [
        { key: 'win', type: 'select', label: 'Window', options: ['5h', '24h', '7d'], value: '24h' },
        { key: 'style', type: 'select', label: 'Style', options: ['bars', 'outline'], value: 'bars' },
        { key: 'bline', type: 'toggle', label: 'Budget line', value: true }]; },
      render: renderAnalytics },
    budget:     { id: 'budget',     icon: 'pie',       label: 'Budget',        span: [2, 7],
      desc: 'Monthly budget donuts, presets & forecast',
      config: function () { return [{ key: 'donuts', type: 'select', label: 'Donuts', options: ['on', 'off'], value: 'on' }]; },
      render: renderBudget },
    cache:      { id: 'cache',      icon: 'layers',    label: 'Prompt cache',  span: [2, 6],
      desc: 'Prompt-cache savings — zero vs unsupported',
      config: function () { return [{ key: 'sort', type: 'select', label: 'Sort by', options: ['save', 'hit', 'name'], value: 'save' }]; },
      render: renderCache },
    tools:      { id: 'tools',      icon: 'chip',      label: 'Tool usage',    span: [3, 7],
      desc: 'Tool calls, latency p50/p95, error rate, index used',
      config: function () { return [{ key: 'sort', type: 'select', label: 'Sort by', options: ['calls', 'p50', 'p95', 'err'], value: 'calls' }]; },
      render: renderTools },
    accounts:   { id: 'accounts',   icon: 'users',     label: 'Accounts',      span: [3, 8],
      desc: 'Requested vs effective, pressure & live cooldowns',
      config: function () { return [{ key: 'cds', type: 'select', label: 'Cooldowns', options: ['tick', 'static', 'off'], value: 'tick' }]; },
      render: renderAccounts,
      live: [{ key: 'cd', ms: 1000, tick: function (it, el, api) {
        var cx = CTX(), now = Date.now();
        if (now - lastCdTick < 900) return; lastCdTick = now;
        cx.D.accounts.forEach(function (a, i) {
          if (a.cooldownSec != null && a.cooldownSec > 0) {
            a.cooldownSec--;
            el.querySelectorAll('[data-wd-cd="' + i + '"]').forEach(function (n) { n.textContent = cx.R.fmtCd(a.cooldownSec); });
          }
        });
      } }] },
    context:    { id: 'context',    icon: 'inbox',     label: 'Context budget', span: [2, 6],
      desc: 'Context budget by source family + omissions',
      render: renderContext },
    ledger:     { id: 'ledger',     icon: 'clipboard', label: 'Event ledger',  span: [4, 10],
      desc: 'Normalized usage events with drill-through, sort & filters',
      config: function (item) {
        var provs = {}; (window.USAGE ? window.USAGE.ledger : []).forEach(function (r) { provs[r.prov] = 1; });
        var cur = (item && item.cfg) || {};
        var platOpts = [''].concat(Object.keys(provs).sort());
        return [
          { key: 'ev', type: 'select', label: 'Event type', options: ['all', 'completion', 'tool', 'error', 'guard', 'switch'], value: 'all' },
          { key: 'plat', type: 'select', label: 'Platform', options: platOpts, value: cur.plat || '' },
          { key: 'rep', type: 'select', label: 'Reporting', options: ['', 'measured', 'estimated', 'unsupported'], value: cur.rep || '' },
          { key: 'size', type: 'select', label: 'Page size', options: ['8', '12', '20', '25', '50'], value: '12' }];
      },
      render: renderLedger,
      live: [{ key: 'append', ms: 9000, tick: function (it, el) {
        if (document.visibilityState !== 'visible') return;
        var now = Date.now();
        if (now - lastAppendTick < 8000) return; lastAppendTick = now;
        var cx = CTX();
        var src = cx.D.livePool[liveIdx++ % cx.D.livePool.length];
        var r = {}; Object.keys(src).forEach(function (k) { r[k] = src[k]; });
        r.ref = 'ue-live-' + (liveRef++);
        var d = new Date();
        r.t = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        cx.D.ledger.unshift(r);
        if (cx.D.ledger.length > 48) cx.D.ledger.pop();
        updateLedgerTable(el, it, cx);
      } }] },
    signals:    { id: 'signals',    icon: 'spark',     label: 'Signals',       span: [2, 7],
      desc: 'Efficiency grade, wins, improvements, risks',
      render: renderSignals },
    whatcounts: { id: 'whatcounts', icon: 'scale',     label: 'What counts',   span: [2, 6],
      desc: 'Which requests count as usage — quick guide',
      render: renderWhatCounts },
    planGating: { id: 'planGating', icon: 'key',       label: 'Plan gating',   span: [2, 6],
      desc: 'Per-plan gating states, shown not guessed',
      render: renderPlanGating },
    spend:      { id: 'spend',      icon: 'coin',      label: 'Spend pulse',   span: [2, 6],
      desc: 'Spend now, burn rate, month pace, block projection',
      render: renderSpend },
    provenance: { id: 'provenance', icon: 'book',      label: 'Provenance',    span: [2, 5],
      desc: 'As-of, cadence, spend basis — the honesty panel',
      render: renderProvenance },
    sessions:   { id: 'sessions',   icon: 'chat',      label: 'Sessions',      span: [2, 7],
      desc: 'Per-session source-aware tokens, context, cost',
      config: function () { return [{ key: 'sort', type: 'select', label: 'Sort by', options: ['tokens', 'cost', 'started'], value: 'tokens' }]; },
      render: renderSessions },
    cost:       { id: 'cost',       icon: 'wallet',    label: 'Cost',          span: [2, 6],
      desc: 'cost microdollars authority split by entitlement',
      render: renderCost },
    tokens:     { id: 'tokens',     icon: 'hash',      label: 'Tokens by model', span: [2, 7],
      desc: 'Source-aware totals per model — unknown, never zero',
      config: function () { return [{ key: 'sort', type: 'select', label: 'Sort by', options: ['total', 'input', 'output', 'cost'], value: 'total' }]; },
      render: renderTokens }
  };
  var lastCdTick = 0, lastAppendTick = 0, liveIdx = 0, liveRef = 5000;

  /* ---------- registration ------------------------------------------------- */
  function register(pmw, opts) {
    var W = pmw || window.PMWidgets;
    if (!W || typeof W.register !== 'function') return [];
    var only = (opts && Array.isArray(opts.only) && opts.only.length) ? opts.only : Object.keys(TYPES);
    var done = [];
    only.forEach(function (id) {
      var t = TYPES[id]; if (!t) return;
      var def = { icon: iconRaw(t.icon), iconKey: t.icon, label: t.label, desc: t.desc, span: t.span.slice(), render: t.render };
      if (t.config) def.config = t.config;
      if (t.live) def.live = t.live;
      W.register(id, def);
      done.push(id);
    });
    return done;
  }

  /* ---------- suggested layouts -------------------------------------------- */
  var layouts = {
    'u7': ['quota', 'guard', 'analytics', 'budget', 'tools', 'accounts', 'cache', 'context', 'ledger'],
    'u8': ['spend', 'quota', 'guard', 'analytics', 'budget', 'cache', 'tools', 'accounts', 'context', 'ledger', 'signals', 'whatcounts', 'planGating', 'provenance'],
    'u9-overview': ['quota', 'guard', 'analytics', 'cache', 'signals', 'budget', 'context', 'ledger', 'tokens', 'provenance'],
    'u9-quotas': ['quota', 'guard', 'planGating', 'provenance', 'whatcounts'],
    'u9-tokens': ['analytics', 'context', 'tokens', 'sessions'],
    'u9-cost': ['cost', 'accounts', 'cache', 'spend', 'budget', 'provenance'],
    'u9-tools': ['tools', 'sessions', 'signals', 'whatcounts', 'provenance']
  };

  /* ---------- canvas wiring: delegation + auto-animation -------------------- */
  function animateBody(scope, cx) {
    cx = cx || CTX(); var R = cx.R; if (!R) return;
    R.animateFills(scope); R.animateCounters(scope); R.animateDonuts(scope);
    var rm = R.isRM();
    scope.querySelectorAll('.wd-cs i[data-h]').forEach(function (el, i) {
      var h = parseFloat(el.getAttribute('data-h')) || 0;
      if (rm) { el.style.height = h + '%'; return; }
      setTimeout(function () { el.style.height = h + '%'; }, Math.min(i, 90) * 12);
    });
  }
  function itemFor(canvas, el) {
    var uw = el.closest && el.closest('.uw');
    if (!uw || !canvas._pmw) return null;
    var uidv = uw.getAttribute('data-uid');
    for (var i = 0; i < canvas._pmw.items.length; i++) if (canvas._pmw.items[i].uid === uidv) return canvas._pmw.items[i];
    return null;
  }
  function bodyFor(canvas, it) {
    return canvas.querySelector('.uw[data-uid="' + it.uid + '"] .uw-body');
  }
  function wireCanvas(canvas, opts) {
    opts = opts || {};
    if (canvas._wdWired) return canvas._wdWired;
    var cx = CTX();
    canvas.addEventListener('click', function (e) {
      var el, it;
      if ((el = e.target.closest('.wd-lcaret'))) {
        var tr = el.closest('tr'); if (!tr) return;
        var body = el.closest('.uw-body'); if (!body) return;
        var det = body.querySelector('[data-wd-ldetail="' + tr.getAttribute('data-wd-lrow') + '"]');
        if (!det) return;
        det.hidden = !det.hidden; el.classList.toggle('open', !det.hidden);
        el.setAttribute('aria-label', (det.hidden ? 'Show' : 'Hide') + ' event details');
        return;
      }
      if ((el = e.target.closest('.wd-why-t'))) { el.closest('.wd-why').classList.toggle('open'); return; }
      if ((el = e.target.closest('.wd-hist-t'))) { el.closest('.wd-hist').classList.toggle('open'); return; }
      if ((el = e.target.closest('.wd-more-t'))) {
        /* topN disclosure: the hidden tail rows are already in the DOM — the
           toggle just reveals them (data is never dropped, only folded) */
        var mb = el.closest('.wd-more'); if (!mb) return;
        var bb = mb.querySelector('.wd-more-b'); if (!bb) return;
        var opening = bb.hidden;
        bb.hidden = !opening;
        el.setAttribute('aria-expanded', opening ? 'true' : 'false');
        el.classList.toggle('open', opening);
        var lb = el.querySelector('.wd-more-l');
        if (lb) lb.textContent = opening ? 'show less' : lb.getAttribute('data-label');
        if (opening && cx && cx.R) cx.R.animateFills(bb);
        return;
      }
      if ((el = e.target.closest('[data-wd-qv]'))) {
        it = itemFor(canvas, el); if (!it) return;
        it.cfg = it.cfg || {};
        it.cfg.qv = el.getAttribute('data-wd-qv');
        if (canvas._pmw && canvas._pmw.handle) canvas._pmw.handle.rerender(it.uid);
        return;
      }
      if ((el = e.target.closest('[data-wd-ser]'))) {
        var k = el.getAttribute('data-wd-ser'), b2 = el.closest('.uw-body'); if (!b2) return;
        el.classList.toggle('muted');
        var muted = el.classList.contains('muted');
        b2.querySelectorAll('.s-' + k).forEach(function (seg) { seg.style.opacity = muted ? '.12' : '1'; });
        return;
      }
      if ((el = e.target.closest('[data-wd-awin]'))) {
        it = itemFor(canvas, el); if (!it) return;
        it.cfg = it.cfg || {}; it.cfg.win = el.getAttribute('data-wd-awin');
        if (canvas._pmw && canvas._pmw.handle) canvas._pmw.handle.rerender(it.uid);
        return;
      }
      if ((el = e.target.closest('[data-wd-preset]'))) {
        it = itemFor(canvas, el); if (!it) return;
        cx.D.budget.warningThreshold = parseInt(el.getAttribute('data-wd-preset'), 10);
        if (canvas._pmw && canvas._pmw.handle) canvas._pmw.handle.rerender(it.uid);
        if (window.toast) window.toast('Budget warning threshold set to ' + el.getAttribute('data-wd-preset') + '% (demo)');
        return;
      }
      if ((el = e.target.closest('th[data-wd-sort]'))) {
        it = itemFor(canvas, el); if (!it) return;
        var key = el.getAttribute('data-wd-sort');
        it.cfg = it.cfg || {};
        if (it.cfg.lsort === key) it.cfg.lsortDir = String(it.cfg.lsortDir) === '-1' ? '1' : '-1';
        else { it.cfg.lsort = key; it.cfg.lsortDir = '1'; }
        if (canvas._pmw && canvas._pmw.handle) canvas._pmw.handle.rerender(it.uid);
        return;
      }
    });
    canvas.addEventListener('input', function (e) {
      var el = e.target.closest && e.target.closest('[data-wd-lq]');
      if (!el) return;
      var it = itemFor(canvas, el); if (!it) return;
      it.cfg = it.cfg || {}; it.cfg.q = el.value;
      var body = el.closest('.uw-body'); if (!body) return;
      updateLedgerTable(body, it, cx);
    });
    var mo = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          if (n.classList && n.classList.contains('uw-body')) { animateBody(n, cx); return; }
          if (n.querySelectorAll) {
            var bodies = n.querySelectorAll('.uw-body');
            if (bodies.length) bodies.forEach(function (b) { animateBody(b, cx); });
            else if (n.closest && n.closest('.uw-body')) animateBody(n, cx);
          }
        });
      });
    });
    mo.observe(canvas, { childList: true, subtree: true });
    canvas.querySelectorAll('.uw-body').forEach(function (b) { animateBody(b, cx); });
    canvas._wdWired = { canvas: canvas, disconnect: function () { mo.disconnect(); canvas._wdWired = null; } };
    return canvas._wdWired;
  }

  window.PMWidgetDefs = {
    VERSION: 2,
    TYPES: TYPES,
    register: register,
    wireCanvas: wireCanvas,
    animateBody: animateBody,
    layouts: layouts,
    defaultBoard: layouts['u7']
  };
})();
