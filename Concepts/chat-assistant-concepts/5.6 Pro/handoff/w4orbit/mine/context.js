/* context.js — feature module.  OWNER: Wave 3 — Context agent (item 6: u11 compact menu, drawer gaps, legible growth chart)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS FILE DOES
 *
 * A. REPLACES the context compact menu (slot `contextCompactMenu`).
 *    The old panel ended in two stacked full-width `.menu-item` rows for
 *    "Compact Now" and "More Details".  That is the specific thing the
 *    requester rejected.  The replacement carries u11-prism's information
 *    architecture and density, drawn in 5.6 Pro's own tokens:
 *      head `used / limit · pct`
 *      segmented composition bar + legend (top 3 families, rest rolled up)
 *      plan-limits block (product · connection, meter rows, "More limits (N)")
 *      ONE dense action row: cache hit on the left, then two small side-by-side
 *      minibuttons — not two stacked rows
 *      post-compact status line with spinner + ok/info/warn tones
 *      `model · account` footnote
 *
 * B. KEEPS the More Details drawer (slot `contextDrawer`).  Its design and its
 *    section vocabulary (`.context-hero`, `.metric-card`, `.context-section`,
 *    `.composition-key`) are unchanged; every addition is styled to match.
 *    Added: token counts beside the percentages, Product / Connection used /
 *    Model / Account, the six `state.capabilities`, and a legible growth chart.
 *
 * ---------------------------------------------------------------------------
 * FOUR THINGS THAT ARE EASY TO GET WRONG HERE
 *
 * 1. `renderApp()` calls `renderOverlays()`, and the 2s work tick calls
 *    `renderApp()`.  So an OPEN compact menu is re-patched twice a second.
 *    Every scrap of transient state (the compaction run, the "More limits"
 *    disclosure) therefore lives in module state below and is RENDERED from
 *    there — never held in the DOM, which pmPatch is free to rewrite.
 *
 * 2. Segment colour is keyed to the FAMILY NAME, never to the array index, so
 *    a family keeps its colour when a thread lists its sources in a different
 *    order.  See SEG_BY_FAMILY.
 *
 * 3. Two hardcoded literals in `styles.css` have to be beaten, not ignored:
 *    `.context-bar i{width:64%}` (beaten with an inline width) and
 *    `.composition-bar i:nth-child(N)` which pins five widths AND five colours
 *    at specificity (0,2,1) — a bare `.ctxseg-N` class would lose, so
 *    `context.css` matches that specificity and the width goes inline.
 *
 * 4. Honesty rule, borrowed from u11's charting conventions: a value that is
 *    not reported reads "not reported" and a series that is absent says so.
 *    It never renders as 0, and a connection that exposes no plan limits says
 *    that rather than drawing an empty meter.
 * ---------------------------------------------------------------------------
 */
(function () {
  'use strict';

  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;
  var D = window.PM56_DATA || {};

  /* =====================================================================
     Fixture clock.  data.js is deterministic (fixed epoch + offsets), so
     "now" must be derived from the fixture and never from Date.now(), or
     every reset countdown drifts and the screenshot baseline moves.  The
     newest growth sample across every thread IS the fixture's now.
     ===================================================================== */
  var FIXTURE_NOW = (function () {
    var newest = 0;
    var by = D.contextByThread || {};
    Object.keys(by).forEach(function (k) {
      var g = (by[k] && by[k].window && by[k].window.growth) || [];
      g.forEach(function (p) { var t = Date.parse(p.at); if (t > newest) newest = t; });
    });
    return newest || Date.parse('2026-08-24T18:00:00Z');
  })();

  /* =====================================================================
     Formatting.  One implementation of each, because two copies is how a
     concept comes to print 78 in one place and 78.4 in another.
     ===================================================================== */
  function ktok(n) {
    if (n == null || isNaN(n)) return 'not reported';
    if (n < 1000) return String(Math.round(n));
    var v = n / 1000;
    var s = v < 100 ? v.toFixed(1) : String(Math.round(v));
    if (s.slice(-2) === '.0') s = s.slice(0, -2);
    return s + 'K';
  }
  function num(n) {
    if (n == null || isNaN(n)) return 'not reported';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function pct(n, dp) {
    if (n == null || isNaN(n)) return 'not reported';
    var r = dp ? Math.round(n * 10) / 10 : Math.round(n);
    return r + '%';
  }
  function usd(n) { return n == null || isNaN(n) ? 'not reported' : '$' + n.toFixed(3); }
  function hhmm(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return '—';
    var d = new Date(t);
    return ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2);
  }
  function dhm(ms) {
    var m = Math.round(Math.abs(ms) / 60000);
    if (m < 60) return m + 'm';
    var h = Math.floor(m / 60), r = m % 60;
    if (h < 24) return r ? h + 'h ' + r + 'm' : h + 'h';
    var dd = Math.floor(h / 24);
    return dd + 'd ' + (h % 24) + 'h';
  }
  /* Reset copy is written against the FIXTURE clock, so it is stable across
     loads and across screenshot runs. */
  function resetText(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return '';
    var delta = t - FIXTURE_NOW;
    return delta >= 0 ? 'resets in ' + dhm(delta) : 'reset ' + dhm(delta) + ' ago';
  }

  /* =====================================================================
     Source-family colour.  Keyed on the family NAME.  The eight themes
     cannot carry six distinguishable families on the existing five accent
     tokens — `--accent` and `--positive` are #19734c and #16734c in
     retro-light, i.e. the same colour — so context.css defines six real
     per-theme tokens and these classes select them.
     ===================================================================== */
  var SEG_BY_FAMILY = {
    'Conversation': 'ctxseg-1',
    'Plans and specifications': 'ctxseg-2',
    'Files and code': 'ctxseg-3',
    'Tool and browser evidence': 'ctxseg-4',
    'System and provider': 'ctxseg-5',
    'Attachments and images': 'ctxseg-6'
  };
  var SEG_FALLBACK = ['ctxseg-1', 'ctxseg-2', 'ctxseg-3', 'ctxseg-4', 'ctxseg-5', 'ctxseg-6'];
  function segClass(family, i) {
    return SEG_BY_FAMILY[family] || SEG_FALLBACK[i % SEG_FALLBACK.length];
  }

  /* =====================================================================
     Module state.  Everything transient lives here, never in the DOM.
     ===================================================================== */
  var CS = {
    run: Object.create(null),      /* threadId -> {phase:'working'|'done', outcome} */
    cursor: Object.create(null),   /* threadId -> how many times Compact now has run */
    moreLimits: false,             /* the "More limits (N)" disclosure           */
    timers: Object.create(null)
  };

  /* =====================================================================
     Fixture access.  Every renderer goes through here, and every field is
     read defensively: a missing collection falls back to the flat
     active-thread view and then to an empty record, so the concept still
     boots if data.js is ever trimmed.
     ===================================================================== */
  function record(state) {
    var id = state && state.selectedThread;
    var by = D.contextByThread || {};
    var r = (id && by[id]) || null;
    if (r) return r;
    return {
      threadId: id || null,
      sources: D.contextSources || [],
      window: D.contextWindow || {},
      compactionPreview: D.contextCompaction || null,
      limits: []
    };
  }
  function windowPct(w) {
    if (!w || !w.limit) return null;
    if (w.pct != null) return w.pct;
    return Math.round(w.used / w.limit * 1000) / 10;
  }

  /* Exposed so app.js can drive the ring and the status bar from the same
     number the menu prints, with a one-line patch instead of a literal.
     Falls back to today's 64 when the fixture is absent. */
  window.PM56_CTX = {
    /* `PM56_DEMO.snapshot()` and NOT `getState()`: getState() is
       `JSON.parse(JSON.stringify(state))` over every thread and every message,
       and app.js calls this helper twice on every render, i.e. twice a second
       for the life of the page. snapshot() copies six scalars.
       Nor is the live `state` object cached here: `globalReset()` REASSIGNS the
       variable, so a captured reference would silently go stale after Reset. */
    ringPct: function () {
      try {
        var snap = window.PM56_DEMO && window.PM56_DEMO.snapshot ? window.PM56_DEMO.snapshot() : null;
        var p = windowPct(record(snap ? { selectedThread: snap.thread } : null).window);
        return p == null ? 64 : Math.round(p);
      } catch (e) { return 64; }
    },
    ringTitle: function () { return 'Context ' + window.PM56_CTX.ringPct() + '% used'; },
    _fixtureNow: FIXTURE_NOW,
    _segClass: segClass
  };

  /* =====================================================================
     A. THE COMPACT MENU
     ===================================================================== */

  /* Segmented bar + legend.  The legend names the top three families and
     rolls the rest into "N smaller sources P%"; the roll-up swatch is a
     neutral outline that belongs to no family, so it can never be mistaken
     for one. */
  function segBar(esc, sources, used, limit, withLegend, extraClass) {
    var vis = [];
    sources.forEach(function (s, i) { if (s.tokens > 0) vis.push({ s: s, i: i }); });
    var html = '<div class="ctx-segbar' + (extraClass ? ' ' + extraClass : '') + '" role="img" aria-label="Source composition: ' +
      esc(vis.map(function (x) { return x.s.family + ' ' + pct(x.s.pct, true); }).join(', ')) + '">';
    vis.forEach(function (x) {
      var w = used ? (x.s.tokens / used * 100) : 0;
      html += '<i class="' + segClass(x.s.family, x.i) + '" style="width:' + w.toFixed(2) + '%" title="' +
        esc(x.s.family + ' · ' + num(x.s.tokens) + ' tokens · ' + pct(x.s.pct, true) + ' of the ' + ktok(used) + ' now in context') + '"></i>';
    });
    html += '</div>';
    if (!withLegend) return html;

    html += '<div class="ctx-legend">';
    vis.slice(0, 3).forEach(function (x) {
      html += '<span class="ctx-leg"><i class="' + segClass(x.s.family, x.i) + '"></i>' +
        esc(x.s.family) + ' ' + pct(x.s.pct) + '</span>';
    });
    var rest = vis.slice(3), restPct = 0, restTok = 0;
    rest.forEach(function (x) { restPct += x.s.tokens / used * 100; restTok += x.s.tokens; });
    if (rest.length) {
      html += '<span class="ctx-leg dim" title="' + esc(rest.map(function (x) { return x.s.family + ' ' + num(x.s.tokens); }).join(' · ')) + '">' +
        '<i class="ctx-seg-rest"></i>' + rest.length + ' smaller sources ' + Math.round(restPct) + '%</span>';
    }
    html += '</div>';
    html += '<div class="ctx-segbase">Shares of the ' + ktok(used) + ' now in context, not of the ' + ktok(limit) + ' window.</div>';
    return html;
  }

  function meterTone(v) { return v == null ? 'mute' : v >= 90 ? 'hot' : v >= 70 ? 'warn' : 'ok'; }
  function limitRow(esc, m) {
    var tone = meterTone(m.used);
    var rst = m.resetAt ? resetText(m.resetAt) : '';
    return '<div class="ctx-limrow">' +
      '<span class="ctx-limlab" title="' + esc(m.note || m.label) + '">' + esc(m.label) + '</span>' +
      (m.used != null
        ? '<span class="ctx-meter ' + tone + '"><i style="width:' + Math.max(0, Math.min(100, m.used)) + '%"></i></span>'
        : '<span class="ctx-limunk">limit not exposed</span>') +
      '<span class="ctx-limval">' + pct(m.used) + '</span>' +
      (rst ? '<span class="ctx-limrst" title="' + esc(m.resetAt) + '">' + esc(rst) + '</span>' : '') +
      '</div>';
  }

  function limitsBlock(esc, icon, rec) {
    var w = rec.window || {}, lims = rec.limits || [];
    var head = '<div class="ctx-limhead">' + esc(w.product || 'Current plan') +
      (w.connection && w.connection !== 'none' ? ' · ' + esc(w.connection) : ' · no connection') + '</div>';
    if (!lims.length) {
      /* The sanctioned honest-gap pattern: say what is not exposed rather
         than drawing an empty meter that reads as zero usage. */
      return '<div class="ctx-limits" data-k="ctxlimits">' + head +
        '<div class="ctx-limnone">No plan limits are exposed for this connection.</div></div>';
    }
    var shown = lims.slice(0, 2), rest = lims.slice(2);
    var html = '<div class="ctx-limits" data-k="ctxlimits">' + head +
      shown.map(function (m) { return limitRow(esc, m); }).join('');
    if (rest.length) {
      html += '<div class="ctx-morelim">' +
        '<button class="ctx-minibtn ctx-morebtn' + (CS.moreLimits ? ' on' : '') + '" data-action="ctx-more-limits" aria-expanded="' + (CS.moreLimits ? 'true' : 'false') + '">' +
        '<span class="ctx-chev">' + icon('down', 10) + '</span>' +
        '<span>' + (CS.moreLimits ? 'Hide' : 'More') + ' limits (' + rest.length + ')</span></button>' +
        (CS.moreLimits ? '<div class="ctx-morelim-b">' + rest.map(function (m) { return limitRow(esc, m); }).join('') + '</div>' : '') +
        '</div>';
    }
    return html + '</div>';
  }

  /* ---- the seven-outcome Compact Now machine -------------------------
     u11's point, kept: a Compact Now that always succeeds is a placeholder.
     The FIRST run on a thread reports the outcome the thread's own fixture
     supports — a thread with nothing to reclaim reports no gain, an
     under-filled thread reports "not recommended" — and every run after
     that walks the full seven so a reviewer can see all of them. */
  function outcomeById(id) {
    var list = D.compactionOutcomes || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0] || { id: 'completed', tone: 'ok', title: 'Context compacted', detail: '' };
  }
  function firstOutcomeFor(rec) {
    var p = rec.compactionPreview || {}, w = rec.window || {};
    if (!p.wouldRemove) return outcomeById('no-gain');
    var used = windowPct(w);
    if (used != null && used < 45) return outcomeById('declined');
    return outcomeById('completed');
  }
  function nextOutcome(rec, tid) {
    var n = CS.cursor[tid] || 0;
    CS.cursor[tid] = n + 1;
    if (n === 0) return firstOutcomeFor(rec);
    var list = D.compactionOutcomes || [];
    return list.length ? list[(n - 1) % list.length] : outcomeById('completed');
  }
  /* The outcome copy carries the THREAD's numbers where the outcome is
     numeric, so six threads do not all report the same 18,420 tokens. */
  function outcomeDetail(rec, o) {
    var p = rec.compactionPreview || {}, w = rec.window || {};
    if (o.id === 'completed' && p.wouldRemove != null) {
      return 'Removed ' + num(p.wouldRemove) + ' tokens. ' + num(p.wouldRetain) + ' loaded. ' +
        (p.reversible ? 'Every dropped source kept its rehydration handle.'
          : 'NOT reversible on this thread: the dropped sources were muted-but-resident, so their rehydration handles went with them.');
    }
    if (o.id === 'partial' && p.wouldRemove != null) {
      return 'Removed ' + num(Math.round(p.wouldRemove / 3)) + ' of a possible ' + num(p.wouldRemove) +
        ' tokens. The rest is pinned by active requirements.';
    }
    /* The preview note only belongs to an outcome that AGREES with it.  Pasting
       it under "Not recommended" produced a status line whose title said do not
       bother and whose body said it reclaims 18,420 tokens. */
    if (o.id === 'no-gain') return (!p.wouldRemove && p.note) ? p.note : o.detail;
    if (o.id === 'declined') {
      var used = windowPct(w);
      return 'This thread is at ' + pct(used) + ' of its ' + ktok(w.limit) + ' window' +
        (p.wouldRemove ? ' and would reclaim only ' + num(p.wouldRemove) + ' tokens' : '') +
        '. Compaction is available but would cost more provenance than it saves.';
    }
    return o.detail || '';
  }
  function statusLine(esc, rec, tid) {
    var run = CS.run[tid];
    if (!run) return '';
    if (run.phase === 'working') {
      return '<div class="ctx-status working" data-k="ctxstatus" role="status">' +
        '<span class="ctx-spin" aria-hidden="true"></span><span>Compacting thread context…</span></div>';
    }
    var o = run.outcome || {};
    var tone = o.tone === 'ok' ? 'ok' : o.tone === 'warn' ? 'warn' : 'info';
    return '<div class="ctx-status ' + tone + '" data-k="ctxstatus" role="status" data-outcome="' + esc(o.id || '') + '">' +
      '<b>' + esc(o.title || '') + '</b>' +
      '<span>' + esc(outcomeDetail(rec, o)) + '</span>' +
      '<span class="ctx-hist">Historical usage totals unchanged.</span></div>';
  }

  function compactMenu(ctx) {
    var esc = ctx.esc, state = ctx.state;
    var rec = record(state), w = rec.window || {}, sources = rec.sources || [];
    var tid = state.selectedThread;
    var p = windowPct(w);
    /* A thread that never got a route has no cache statistics -- printing 0%
       would claim the cache missed every time, which is a different statement
       from "nothing was ever asked of it". */
    var noRoute = !w.connection || w.connection === 'none';
    var busy = !!(CS.run[tid] && CS.run[tid].phase === 'working');

    var html = '<div class="ctx-pop" data-k="ctxpop">';

    html += '<div class="ctx-head" data-k="ctxhead"><span class="ctx-tt">Context</span>' +
      '<span class="ctx-frac">' + ktok(w.used) + ' / ' + ktok(w.limit) + ' · ' + pct(p) + '</span></div>';

    /* 5.6 Pro keeps its own caption over the bar -- the old menu ended with
       "Source composition / 5 source groups" and that vocabulary is worth
       keeping even though u11 has no heading here. */
    html += '<div class="ctx-caption" data-k="ctxcap"><span>Source composition</span>' +
      '<span>' + (sources.filter(function (s) { return s.tokens > 0; }).length) + ' of ' + sources.length + ' source families</span></div>';
    html += segBar(esc, sources, w.used, w.limit, true);
    html += limitsBlock(esc, ctx.icon, rec);

    /* ONE dense action row.  This is the specific replacement the requester
       asked for: the cache-hit reading on the left, then two SMALL
       side-by-side minibuttons — never two stacked full-width rows. */
    html += '<div class="ctx-acts" data-k="ctxacts">' +
      /* The label drops the word "Context" in the unknown case purely so the
         longer value still fits the one dense row -- an ellipsised
         "Context cache hit not..." would be worse than a shorter label. */
      '<span class="ctx-cache"' + (noRoute ? ' title="No turn ever ran on this thread, so there are no cache statistics to report — unknown, not zero."' : '') + '>' +
      (noRoute ? 'Cache hit <b>not reported</b>' : 'Context cache hit <b>' + pct(w.cacheHitPct) + '</b>') + '</span>' +
      /* While a pass is in flight the button says so and refuses a second one.
         The guard is in the handler either way; this is the affordance. */
      '<button class="ctx-minibtn' + (busy ? ' busy' : '') + '" data-action="ctx-compact-now"' + (busy ? ' aria-busy="true"' : '') +
      ' title="Run a source-aware compaction on this thread">' +
      ctx.icon('collapse', 10) + '<span>' + (busy ? 'Compacting…' : 'Compact now') + '</span></button>' +
      '<button class="ctx-minibtn" data-action="context-details" title="Window, tokens, cache, composition, cost, and raw projection">' +
      ctx.icon('expand', 10) + '<span>More details</span></button>' +
      '</div>';

    html += statusLine(esc, rec, tid);

    html += '<div class="ctx-threadnote" data-k="ctxnote">' + esc(w.model || 'No configured model') + ' · ' +
      esc(w.account || '—') + '</div>';

    return html + '</div>';
  }

  /* =====================================================================
     B. THE DRAWER — kept, with the four gaps filled.
     ===================================================================== */

  /* Source composition rows: [dot] [family] [pct%] [tokens], tabular-nums,
     copied from u11 exactly.  Today the drawer shows percentages and no
     token counts at all. */
  function compositionKey(esc, sources, used) {
    return '<div class="composition-key ctx-key4">' + sources.map(function (s, i) {
      var zero = !s.tokens;
      return '<div class="ctx-srcrow' + (zero ? ' zero' : '') + '" title="' +
        esc((s.detail || s.family) + (s.supersededTokens ? ' — ' + num(s.supersededTokens) + ' tokens of it superseded and still loaded.' : '')) + '">' +
        '<i class="' + segClass(s.family, i) + '"></i>' +
        '<span class="ctx-srclab">' + esc(s.family) + '</span>' +
        '<b class="ctx-srcpct">' + (zero ? '0%' : pct(s.pct, true)) + '</b>' +
        '<b class="ctx-srctok">' + num(s.tokens) + '</b>' +
        '</div>';
    }).join('') + '</div>';
  }

  /* ---- the growth chart ---------------------------------------------
     NOT a port: u11-prism has no context-growth chart.  What is borrowed
     is its charting CONVENTIONS — tick labels, stated units, per-point
     tooltips, and "not reported — unknown, not zero" for a missing value.
     The fix here is legibility, not a redesign:
       * y-axis reference values in real tokens
       * x-axis time ticks in UTC
       * the window limit drawn as a MARKED CEILING, not an invisible max
       * a legend, explicit units, and a per-point hover value
       * `preserveAspectRatio="none"` is GONE.  The old chart stretched a
         420x90 viewBox to whatever width the drawer happened to be, which
         scaled x and y by different factors and turned the 2px stroke into
         an ellipse.  The container now carries the viewBox's aspect ratio
         so the default (uniform) `xMidYMid meet` fits exactly, and the
         whole plot lives in an overflow-x:auto wrapper with a min-width so
         a narrow drawer scrolls instead of shrinking the labels to soup.
     ------------------------------------------------------------------- */
  var GX0 = 48, GX1 = 452, GY0 = 22, GY1 = 140, GW = 460, GH = 184;

  function growthChart(esc, w) {
    var series = (w && w.growth) || [];
    if (series.length < 2) {
      return '<div class="ctx-growth-empty">Growth is not reported for this thread — unknown, not zero. ' +
        'A series needs at least two samples to draw.</div>';
    }
    var limit = w.limit || Math.max.apply(null, series.map(function (g) { return g.tokens || 0; })) || 1;
    var t0 = Date.parse(series[0].at), t1 = Date.parse(series[series.length - 1].at);
    var span = (t1 - t0) || 1;

    function X(i) {
      var t = Date.parse(series[i].at);
      var f = isNaN(t) ? i / (series.length - 1) : (t - t0) / span;
      return GX0 + f * (GX1 - GX0);
    }
    function Y(v) {
      var f = Math.max(0, Math.min(1, v / limit));
      return GY1 - f * (GY1 - GY0);
    }

    /* Gridlines and y labels at quarters of the WINDOW, so the ceiling is
       a real ceiling and headroom is visible rather than implied. */
    var grid = '';
    [0, 0.25, 0.5, 0.75].forEach(function (f) {
      var y = GY1 - f * (GY1 - GY0);
      grid += '<line class="ctx-grid" x1="' + GX0 + '" y1="' + y.toFixed(1) + '" x2="' + GX1 + '" y2="' + y.toFixed(1) + '"/>' +
        '<text class="ctx-ylab" x="' + (GX0 - 6) + '" y="' + (y + 3.2).toFixed(1) + '" text-anchor="end">' + ktok(limit * f) + '</text>';
    });
    /* the marked ceiling */
    grid += '<line class="ctx-ceiling" x1="' + GX0 + '" y1="' + GY0 + '" x2="' + GX1 + '" y2="' + GY0 + '"/>' +
      '<text class="ctx-ylab" x="' + (GX0 - 6) + '" y="' + (GY0 + 3.2) + '" text-anchor="end">' + ktok(limit) + '</text>' +
      '<text class="ctx-ceillab" x="' + GX1 + '" y="' + (GY0 - 6) + '" text-anchor="end">Window limit · ' + esc(ktok(limit)) + '</text>' +
      '<text class="ctx-unitlab" x="' + (GX0 - 6) + '" y="14" text-anchor="end">tokens</text>';

    /* Path segments, broken wherever a sample is not reported.  A gap is
       drawn as a dotted connector and a hollow marker, never as a zero. */
    var runs = [], cur = [];
    series.forEach(function (g, i) {
      if (g.tokens == null || isNaN(g.tokens)) { if (cur.length) { runs.push(cur); cur = []; } return; }
      cur.push(i);
    });
    if (cur.length) runs.push(cur);

    var area = '', line = '';
    runs.forEach(function (run) {
      if (run.length < 2) return;
      var pts = run.map(function (i) { return X(i).toFixed(1) + ' ' + Y(series[i].tokens).toFixed(1); });
      line += '<path class="ctx-line" d="M' + pts.join(' L') + '"/>';
      area += '<path class="ctx-area" d="M' + X(run[0]).toFixed(1) + ' ' + GY1 + ' L' + pts.join(' L') +
        ' L' + X(run[run.length - 1]).toFixed(1) + ' ' + GY1 + 'Z"/>';
    });

    /* Per-point markers with a real hover value, u11's convention. */
    var dots = '';
    series.forEach(function (g, i) {
      var x = X(i);
      if (g.tokens == null || isNaN(g.tokens)) {
        dots += '<circle class="ctx-dot unknown" cx="' + x.toFixed(1) + '" cy="' + ((GY0 + GY1) / 2).toFixed(1) + '" r="3">' +
          '<title>' + esc(hhmm(g.at) + ' UTC · not reported — unknown, not zero') + '</title></circle>';
        return;
      }
      var y = Y(g.tokens);
      var share = limit ? Math.round(g.tokens / limit * 100) : 0;
      dots += '<g class="ctx-pt"><circle class="ctx-hit" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="11"/>' +
        '<circle class="ctx-dot" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.6"/>' +
        '<title>' + esc(hhmm(g.at) + ' UTC · ' + num(g.tokens) + ' tokens · ' + share + '% of the ' + ktok(limit) + ' window') + '</title></g>';
    });

    /* At most five x ticks, always including the first and the last. */
    var ticks = '';
    var n = series.length, want = Math.min(5, n), idxs = [];
    for (var k = 0; k < want; k++) idxs.push(Math.round(k * (n - 1) / (want - 1)));
    idxs.filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (i) {
      var x = X(i);
      ticks += '<line class="ctx-tick" x1="' + x.toFixed(1) + '" y1="' + GY1 + '" x2="' + x.toFixed(1) + '" y2="' + (GY1 + 4) + '"/>' +
        '<text class="ctx-xlab" x="' + x.toFixed(1) + '" y="' + (GY1 + 16) + '" text-anchor="' +
        (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle') + '">' + hhmm(series[i].at) + '</text>';
    });

    var last = null;
    for (var j = series.length - 1; j >= 0; j--) { if (series[j].tokens != null) { last = series[j]; break; } }
    var peak = series.reduce(function (m, g) { return (g.tokens != null && g.tokens > m) ? g.tokens : m; }, 0);

    /* Keeps the base sheet's `.growth-chart` class on the wrapper: it carries the
       section's designed bottom rule, and dropping the class outright would have
       left `.growth-chart` in styles.css matching nothing -- a fresh orphan of
       exactly the kind the standing orphan gate exists to catch. Its
       height/overflow are overridden in context.css. */
    return '<div class="ctx-growth-wrap growth-chart" data-k="ctxgrowthwrap">' +
      '<div class="ctx-growth" data-k="ctxgrowth">' +
      '<svg viewBox="0 0 ' + GW + ' ' + GH + '" role="img" aria-label="' +
      esc('Context growth from ' + hhmm(series[0].at) + ' to ' + hhmm(series[series.length - 1].at) +
        ' UTC, ' + num(series[0].tokens) + ' to ' + num(last ? last.tokens : 0) + ' tokens against a ' + ktok(limit) + ' window limit') + '">' +
      '<defs><linearGradient id="ctxgrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop stop-color="var(--accent)" stop-opacity=".34"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<line class="ctx-axis" x1="' + GX0 + '" y1="' + GY0 + '" x2="' + GX0 + '" y2="' + GY1 + '"/>' +
      grid + area + line + ticks + dots +
      '</svg></div></div>' +
      '<div class="ctx-growth-legend">' +
      '<span class="ctx-gleg"><i class="line"></i>Tokens in context</span>' +
      '<span class="ctx-gleg"><i class="ceil"></i>Window limit ' + ktok(limit) + '</span>' +
      '<span class="ctx-gleg dim">x: time (UTC) · y: tokens</span>' +
      '</div>' +
      '<div class="ctx-growth-read">Latest ' + hhmm(series[series.length - 1].at) + ' UTC · <b>' +
      num(last ? last.tokens : null) + '</b> tokens · ' + pct(limit ? (last ? last.tokens : 0) / limit * 100 : null) +
      ' of the ' + ktok(limit) + ' window · peak ' + num(peak) + ' · ' + series.length + ' samples. Hover a point for its value.</div>';
  }

  /* Capabilities — `state.capabilities` is never surfaced in the drawer
     today.  Rendered in the section vocabulary already in use. */
  function capabilityRows(esc, state) {
    var c = state.capabilities || {};
    var rows = [
      ['Goal', c.goal ? 'On' : 'Off', c.goal, 'A durable goal artifact rides alongside whatever mode is active.'],
      ['Crew', c.crew ? 'On' : 'Off', c.crew, 'Parallel child agents with their own routes.'],
      ['Back Seat Driver', c.bsd || 'Off', c.bsd && c.bsd !== 'Off', 'Independent evaluation of the current turn.'],
      ['Context Lens', c.context || 'Off', c.context && c.context !== 'Off', 'Mute, Focus and staged Subcompact over selected messages.'],
      ['ELI5', c.eli5 ? 'On' : 'Off', c.eli5, 'Plain-language restatement alongside the technical answer.'],
      ['Thought Stream', c.thought || 'Off', c.thought && c.thought !== 'Off', 'Streamed reasoning summary while a turn runs.']
    ];
    return '<div class="ctx-caps">' + rows.map(function (r) {
      return '<div class="ctx-cap' + (r[2] ? ' on' : '') + '" title="' + esc(r[3]) + '">' +
        '<span class="ctx-capdot"></span><span class="ctx-caplab">' + esc(r[0]) + '</span>' +
        '<b class="ctx-capval">' + esc(String(r[1])) + '</b></div>';
    }).join('') + '</div>';
  }

  function drawer(ctx) {
    var esc = ctx.esc, state = ctx.state, icon = ctx.icon;
    var rec = record(state), w = rec.window || {}, sources = rec.sources || [];
    var p = windowPct(w);
    var sel = ctx.selectedModel ? ctx.selectedModel() : null;
    var prev = rec.compactionPreview || {};
    var combined = (w.costApiUsd == null || w.costPlanUsd == null) ? null : w.costApiUsd + w.costPlanUsd;
    var superseded = sources.reduce(function (s, x) { return s + (x.supersededTokens || 0); }, 0);
    var noRoute = !w.connection || w.connection === 'none';

    var html = '<aside class="drawer ctx-drawer">' +
      '<div class="drawer-head"><span class="event-icon">' + icon('info', 13) + '</span>' +
      '<strong>Context More Details</strong><span class="meta-pill">Curated</span><span class="spacer"></span>' +
      '<button class="icon-button" data-action="close-context-details" title="Close">' + icon('close', 13) + '</button></div>' +
      '<div class="drawer-scroll" data-scroll-key="context-drawer">';

    /* hero — the one place the 64% literal used to live */
    html += '<div class="context-hero"><div class="context-big"><strong>' + pct(p) + '</strong>' +
      '<span>current window used · ' + num(w.used) + ' / ' + num(w.limit) + ' tokens</span></div>' +
      '<div class="context-bar"><i style="width:' + (p == null ? 0 : Math.max(0, Math.min(100, p))) + '%"></i></div></div>';

    html += '<div class="metric-grid">' +
      card('Tokens loaded', ktok(w.used)) +
      card('Cache hit', noRoute ? 'not reported' : pct(w.cacheHitPct)) +
      card('Cached tokens', ktok(w.cached)) +
      card('Available', ktok(w.available != null ? w.available : (w.limit - w.used))) +
      card('Input this turn', ktok(w.inputThisTurn)) +
      card('Output this turn', ktok(w.outputThisTurn)) +
      '</div>';

    /* --- Source composition: percentages AND token counts --- */
    html += section('Source composition',
      segBar(esc, sources, w.used, w.limit, false, 'composition-bar') +
      compositionKey(esc, sources, w.used) +
      '<p class="ctx-note">' + sources.length + ' source families · ' + num(w.used) + ' tokens in context' +
      (superseded ? ' · ' + num(superseded) + ' of them superseded and still loaded' : '') + '.</p>');

    /* --- Context growth: legible --- */
    html += section('Context growth', growthChart(esc, w));

    /* --- Product, connection, model, route --- */
    var mismatch = sel && w.model && sel.name !== w.model;
    html += section('Product, connection and route',
      '<div class="metric-grid ctx-grid2">' +
      card('Product', esc(w.product || 'not reported')) +
      card('Connection used', esc(w.connection && w.connection !== 'none' ? w.connection : 'none — this thread never got a route')) +
      card('Model', esc(w.model || 'not reported')) +
      card('Account', esc(w.account || 'not reported')) +
      '</div>' +
      '<div class="activity-line"><div class="copy"><strong>' + esc(state.mode) + ' · ' + esc(state.persona) + '</strong>' +
      '<span>Worker route: ' + esc(state.worktree) + ' · local execution server · ' + esc(state.effort) + ' effort · ' +
      (state.fast ? 'Fast eligible route' : 'Standard route') + '</span></div></div>' +
      (mismatch
        ? '<p class="ctx-note warn">Currently selected model is ' + esc(sel.name) +
          '. This thread’s context was built with ' + esc(w.model) + ', so the numbers above describe that route, not the selection.</p>'
        : ''));

    /* --- Capabilities: never surfaced here before --- */
    html += section('Capabilities in this thread', capabilityRows(esc, state) +
      '<p class="ctx-note">A capability that is On contributes its own instructions and tool definitions to the System and provider family above.</p>');

    html += section('Cost and cache',
      '<div class="metric-grid">' +
      card('API billed', usd(w.costApiUsd)) +
      card('Plan estimated', usd(w.costPlanUsd)) +
      card('Combined est.', usd(combined)) +
      '</div>' +
      (noRoute
        ? '<p class="ctx-note">No turn ever ran on this thread, so there is no cache statistic to report — unknown, not zero.</p>'
        : '<p class="ctx-note">' + ktok(w.cached) + ' cached tokens avoided repeat input billing at a ' + pct(w.cacheHitPct) + ' hit rate.</p>'));

    /* --- Compaction preview, from the thread's own record --- */
    html += section('Compaction preview',
      (prev.wouldRemove != null
        ? '<p class="ctx-note">' + esc(prev.note || '') + '</p>' +
          '<div class="metric-grid">' +
          card('Would remove', ktok(prev.wouldRemove)) +
          card('Would retain', ktok(prev.wouldRetain)) +
          card('Estimated', prev.estimatedSeconds != null ? prev.estimatedSeconds + 's' : 'not reported') +
          '</div>' +
          '<div class="ctx-prevcols">' +
          '<div><h4>Retains</h4>' + (prev.retains || []).map(function (x) { return '<div class="ctx-prevrow keep">' + icon('check', 10) + '<span>' + esc(x) + '</span></div>'; }).join('') + '</div>' +
          '<div><h4>Drops</h4>' + ((prev.drops || []).length ? (prev.drops || []).map(function (x) { return '<div class="ctx-prevrow drop">' + icon('minus', 10) + '<span>' + esc(x) + '</span></div>'; }).join('') : '<div class="ctx-prevrow"><span>Nothing would be dropped.</span></div>') + '</div>' +
          '</div>' +
          (prev.reversible === false
            ? '<p class="ctx-note warn">' + icon('warning', 10) + ' Not reversible: this pass drops sources that are currently muted-but-resident, so their rehydration handles go with them.</p>'
            : '<p class="ctx-note">Reversible: every dropped source keeps a rehydration handle.</p>')
        : '<p class="ctx-note">No compaction preview is reported for this thread.</p>') +
      '<div class="context-actions">' +
      '<button class="soft-button" data-action="compact-now">' + icon('collapse', 12) + ' Preview Compact</button>' +
      '<button class="soft-button" data-action="export-context">' + icon('download', 12) + ' Redacted JSON</button>' +
      '<button class="soft-button" data-action="raw-context">' + icon('code', 12) + ' Raw projection</button>' +
      '</div>');

    return html + '</div></aside>';

    function card(label, value) {
      return '<div class="metric-card"><label>' + label + '</label><strong>' + value + '</strong></div>';
    }
    function section(title, body) {
      return '<section class="context-section"><h3>' + title + '</h3><div class="context-section-body">' + body + '</div></section>';
    }
  }

  /* =====================================================================
     Registration
     ===================================================================== */
  EXT.slot('contextCompactMenu', function (ctx) { return compactMenu(ctx); });

  EXT.slot('contextDrawer', function (ctx) { return drawer(ctx); });

  EXT.action('ctx-more-limits', function (ctx, btn, e) {
    e.stopPropagation();
    CS.moreLimits = !CS.moreLimits;
    ctx.renderOverlays();
    return true;
  });

  EXT.action('ctx-compact-now', function (ctx, btn, e) {
    e.stopPropagation();
    var tid = ctx.state.selectedThread;
    if (CS.run[tid] && CS.run[tid].phase === 'working') return true;
    var rec = record(ctx.state);
    var outcome = nextOutcome(rec, tid);
    CS.run[tid] = { phase: 'working' };
    ctx.renderOverlays();
    if (CS.timers[tid]) clearTimeout(CS.timers[tid]);
    CS.timers[tid] = setTimeout(function () {
      CS.timers[tid] = null;
      CS.run[tid] = { phase: 'done', outcome: outcome };
      if (outcome.id === 'completed' || outcome.id === 'partial') {
        /* A consequential action, not a toast: the status bar, the receipt
           trail and the thread all record it. */
        ctx.state.context.compacted = true;
        ctx.addReceipt('context-compacted', outcome.title, outcomeDetail(rec, outcome));
        ctx.renderApp();
      } else {
        ctx.renderOverlays();
      }
    }, 900);
    return true;
  });

})();
