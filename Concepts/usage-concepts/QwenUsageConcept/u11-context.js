/* =====================================================================
   U11 — PRISM II · context ring + Context Details (packet §12/§13)
   ---------------------------------------------------------------------
   - The ring represents the CURRENT effective context window for the
     thread. History lives in details + ledger, never as several
     simultaneously-active windows.
   - Compact module ≈300–320px: header, segmented source bar + legend,
     1–2 data-driven current meters + "More limits", and ONE action row:
     Context cache hit · Compact now · More details.
   - No explanatory cache paragraph, no High/Medium/source chips.
   - Compact now cycles the canonical maintenance statuses; it never
     rewrites historical usage totals.
   - Context Details is an editor-panel-sized docked tab concept with a
     curated, aligned label/value grid and a tucked redacted Raw view.
   ===================================================================== */
(function () {
  'use strict';

  var ringPop = null, detPanel = null;
  var ringBtn = null, detBtn = null;
  var ringOpen = false, detOpen = false;
  var curThread = 'thread:t-88';
  var compactIdx = 0, compactBusy = false;
  var lastFocus = null;

  function D() { return window.U11; }
  function T() { return window.U11time; }
  function fmt() { return window.USfmt; }
  function R() { return window.USrender; }
  function ic(n) { return window.USrender.ic(n); }
  function ktok(v) { return fmt().tok(v).replace('.0k', 'k').replace('.0M', 'M'); }

  var SEG_COLORS = ['seg-a', 'seg-b', 'seg-c', 'seg-d', 'seg-e', 'seg-f', 'seg-g', 'seg-h'];
  /* Colour belongs to the SOURCE FAMILY, not to its position in the array:
     two threads list their families in different orders, and a family that
     changed colour between them would be unreadable. Each slot is a distinct
     hue in all eight themes (audit A09-04). */
  var SEG_BY_FAMILY = {
    'Messages': 'seg-a',
    'System & instructions': 'seg-b',
    'Tools': 'seg-c',
    'Skills & MCP': 'seg-d',
    'Memory / pinned': 'seg-e',
    'Summaries': 'seg-f',
    'Attachments / media': 'seg-g',
    'Other': 'seg-h'
  };
  function segClass(family, idx) {
    return SEG_BY_FAMILY[family] || SEG_COLORS[idx % SEG_COLORS.length];
  }
  /* One metric, one rendering: the cache-hit rate is written the same way in
     the Context widget row, in the ring and in Context Details, to the
     precision the record carries (audit A05-15). The implementation lives in
     u11-widgets.js so there is exactly one of it — two copies is how the
     widget came to print 97 against Context Details' 96.8. */
  function ratePct(v) {
    var W = window.U11W;
    return W && W.ratePct ? W.ratePct(v) : (v == null ? '—' : (Math.round(v * 10) / 10) + '%');
  }

  /* ---------- compact scenarios: canonical statuses (Hermes §3) ----------
     Every scenario that claims helper usage now names the maintenance record
     it came from, and the figures are read back out of that record's own
     helper events through the shared counting helper. Nothing here invents a
     number: a scenario with no record makes no usage claim (audit A05-08). */
  var COMPACT_SCENARIOS = [
    { status: 'completed', result: 'Context compacted', ref: 'cm-1' },
    { status: 'completed', result: 'Local prune', ref: 'cm-2' },
    { status: 'completed', result: 'Context repacked after a model switch', ref: 'cm-4' },
    { status: 'no_gain', result: 'No gain',
      detail: 'Would reclaim about no tokens · no change committed', ref: null },
    { status: 'soft_deferred', result: 'Deferred · locked',
      detail: 'Context is locked by an active turn · try again when it settles', ref: null },
    { status: 'timed_out_discarded', result: 'Timed out · discarded', ref: 'cm-5' },
    { status: 'failed', result: 'Compaction failed',
      detail: 'Route unavailable · next step: retry after the current turn settles, or prune locally',
      ref: null }
  ];

  var CACHE_EFFECT = {
    rebuilt: 'cache rebuilt', preserved: 'cache preserved', broken: 'cache broken',
    unknown: 'cache effect unknown'
  };

  function maintenanceById(id) {
    var found = null;
    (D().maintenance || []).forEach(function (m) { if (m.id === id) found = m; });
    return found;
  }
  /* Cost for a helper attempt, in the record's own terms — a plan-covered or
     key-covered price is suppressed, an unknown price fails closed, and a
     provider-reported zero stays a reported zero (GUI-USG-003/004). */
  function helperCost(a) {
    if (a.hiddenByok || a.costStatus === 'hidden_byok') return 'price hidden · your own key pays it';
    if (a.hiddenSubscription || a.costStatus === 'hidden_subscription' ||
      a.displayCostPolicy === 'subscription_covered') return 'no separate charge';
    if (a.costStatus === 'unknown' || a.displayCostPolicy === 'unknown' || a.costMicro == null) return 'cost unknown';
    if (a.costMicro === 0) return fmt().cost(0) + ' reported';
    return fmt().cost(a.costMicro / 1e6);
  }
  /* The usage line for one maintenance record, read from the events it
     actually points at. Buckets go through window.U11W.tokenTotal, which
     adds cache and reasoning only on routes whose provider bills them as
     their own bucket. */
  function compactUsage(cm) {
    if (!cm) return null;
    var d = D(), W = window.U11W;
    var ids = cm.helperEventIds || [];
    var atts = [];
    ids.forEach(function (id) { if (d.attemptById[id]) atts.push(d.attemptById[id]); });
    if (!atts.length) {
      /* "no helper event is linked" and "this ran locally and cost nothing"
         are different statements; only the local-operations record can
         support the second one */
      var local = null;
      (d.localOps || []).forEach(function (o) { if (o.maintenanceId === cm.id) local = o; });
      if (local && local.providerUsage === 'none') return 'No provider call — this operation ran locally and spent no provider usage.';
      return 'No helper event is linked to this operation, so any provider usage it caused is not attributed here.';
    }
    var lines = [];
    atts.forEach(function (a) {
      var tt = W && W.tokenTotal ? W.tokenTotal(a.tokens, a, { subject: 'helper call' }) : null;
      var parts = [];
      if (a.tokens && a.tokens.input != null) parts.push(ktok(a.tokens.input) + ' in');
      if (a.tokens && a.tokens.output != null) parts.push(ktok(a.tokens.output) + ' out');
      else parts.push('output not reported');
      var total = tt && tt.total != null
        ? ktok(tt.total) + ' counted as ' + tt.basis
        : 'nothing the provider reported — unknown, not zero';
      lines.push('Helper ' + a.eventId + ': ' + parts.join(' · ') + ' · ' + total + ' · ' + helperCost(a) +
        (a.discarded ? ' · result discarded, usage counted once' : ''));
    });
    return lines.join(' ');
  }

  /* ================================================================
     RING MODULE
     ================================================================ */
  function ensureRing() {
    if (ringPop) return ringPop;
    ringPop = document.createElement('div');
    ringPop.className = 'u11ctx-pop';
    ringPop.id = 'u11-ctx-ring-pop';
    ringPop.setAttribute('role', 'dialog');
    ringPop.setAttribute('aria-label', 'Context usage');
    document.body.appendChild(ringPop);
    ringPop.addEventListener('click', onRingClick);
    return ringPop;
  }

  function segBarHTML(ctx, withLegend) {
    var html = '<div class="u11ctx-segbar" role="img" aria-label="Context sources, shares of the tokens now in context">';
    ctx.segments.forEach(function (s, i) {
      if (!s.pct) return; /* hide zero rows */
      html += '<i class="' + segClass(s.family, i) + '" style="width:' + s.pct + '%" title="' + s.family +
        ' · ' + s.pct + '% of the ' + ktok(ctx.used) + ' now in context"></i>';
    });
    html += '</div>';
    if (withLegend) {
      var vis = [];
      ctx.segments.forEach(function (s, idx) { if (s.pct > 0) vis.push({ s: s, idx: idx }); });
      html += '<div class="u11ctx-legend">';
      vis.slice(0, 3).forEach(function (x) {
        html += '<span class="u11ctx-leg"><i class="' + segClass(x.s.family, x.idx) + '"></i>' + x.s.family + ' ' + x.s.pct + '%</span>';
      });
      /* The roll-up is not a source family: it gets its own neutral swatch
         and a name no family can be confused with (audit A09-04). */
      var rest = vis.slice(3), otherPct = 0;
      rest.forEach(function (x) { otherPct += x.s.pct; });
      if (otherPct > 0) {
        html += '<span class="u11ctx-leg dim"><i class="seg-rest"></i>' + rest.length + ' smaller sources ' + otherPct + '%</span>';
      }
      html += '</div>';
      html += '<div class="u11ctx-segbase">Shares of the ' + ktok(ctx.used) + ' now in context, not of the ' +
        ktok(ctx.limit) + ' window.</div>';
    }
    return html;
  }

  function ringHTML() {
    var d = D();
    var th = d.threadById[curThread];
    var ctx = th.context;
    var model = d.modelById[th.effectiveModelId];
    var conn = d.connectionById[th.effectiveConnectionId];
    var prod = d.productById[th.effectiveProductId];

    var html = '';
    html += '<div class="u11ctx-head">';
    html += '<span class="u11ctx-tt">Context</span>';
    html += '<span class="u11ctx-frac">' + ktok(ctx.used) + ' / ' + ktok(ctx.limit) + ' · ' + ctx.pct + '%</span>';
    html += '</div>';

    html += segBarHTML(ctx, true);

    /* current plan limits — data-driven for the effective connection */
    var meters = d.currentLimitMeters(curThread);
    var shown = meters.slice(0, 2);
    html += '<div class="u11ctx-limits">';
    html += '<div class="u11ctx-limhead">' + (prod ? prod.label : 'Current plan') + ' · ' + (conn ? conn.label : '') + '</div>';
    shown.forEach(function (m) {
      var tone = m.usedPct == null ? 'mute' : (m.usedPct >= 90 ? 'hot' : (m.usedPct >= 70 ? 'warn' : 'ok'));
      /* WHETHER a window resets is a property of the window KIND; whether
         its reset time can be READ is a property of the value state. Keying
         this off m.vs alone let a pool or a balance claim a reset it does not
         have (audit A03-19). U11.meterResetState answers the first question
         from the kind, so it is asked there — the same call the widgets make. */
      var rst = d.meterResetState ? d.meterResetState(m) : null;
      var hasReset = rst ? rst.hasReset : true;
      var resetTxt = !hasReset ? ''
        : (m.resetAt ? T().when(m.resetAt, d.meta.now, 'reset') : (rst ? rst.text : ''));
      html += '<div class="u11ctx-limrow">';
      html += '<span class="u11ctx-limlab">' + m.label + '</span>';
      if (m.usedPct != null) html += R().meter(m.usedPct, tone);
      else html += '<span class="u11ctx-limunk">limit not exposed</span>';
      html += '<span class="u11ctx-limval">' + (m.usedPct != null ? m.usedPct + '%' : '—') + '</span>';
      if (resetTxt) html += '<span class="u11ctx-limrst" title="' + (m.resetAt ? T().full(m.resetAt) : '') + '">' + resetTxt + '</span>';
      html += '</div>';
    });
    if (meters.length > 2) {
      html += '<div class="u11ctx-morelim" data-u11ctx-act="morelimits" hidden-state="0">' +
        '<button type="button" class="u11ctx-minibtn">' + ic('chevD') + '<span>More limits (' + (meters.length - 2) + ')</span></button>' +
        '<div class="u11ctx-morelim-b" hidden>' + meters.slice(2).map(function (m) {
          var tone2 = m.usedPct == null ? 'mute' : (m.usedPct >= 90 ? 'hot' : (m.usedPct >= 70 ? 'warn' : 'ok'));
          return '<div class="u11ctx-limrow"><span class="u11ctx-limlab">' + m.label + '</span>' +
            (m.usedPct != null ? R().meter(m.usedPct, tone2) : '<span class="u11ctx-limunk">limit not exposed</span>') +
            '<span class="u11ctx-limval">' + (m.usedPct != null ? m.usedPct + '%' : '—') + '</span></div>';
        }).join('') + '</div></div>';
    }
    html += '</div>';

    /* one action row: cache hit · Compact now · More details */
    html += '<div class="u11ctx-acts">';
    html += '<span class="u11ctx-cache">Context cache hit <b>' + ratePct(ctx.cacheHitRate) + '</b></span>';
    html += '<button type="button" class="u11ctx-minibtn" data-u11ctx-act="compact">' + ic('compress') + '<span>Compact now</span></button>';
    html += '<button type="button" class="u11ctx-minibtn" data-u11ctx-act="moredetails">' + ic('expand') + '<span>More details</span></button>';
    html += '</div>';

    html += '<div class="u11ctx-status" data-u11ctx-status hidden></div>';
    html += '<div class="u11ctx-threadnote">' + model.label + ' · ' + D().accountLabel(conn.accountId) +
      (th.switched ? ' · switched thread — re-baselined to the current window' : '') + '</div>';
    return html;
  }

  function onRingClick(e) {
    e.stopPropagation();
    var act = e.target.closest('[data-u11ctx-act]');
    if (!act) return;
    var a = act.getAttribute('data-u11ctx-act');
    if (a === 'compact') { runCompact(); return; }
    if (a === 'moredetails') {
      var res = D().dispatch('cmd.chat.open_thread_context_details', { thread_id: curThread });
      closeRing();
      openDetails(curThread);
      if (window.toast && res.toast) window.toast(res.toast);
      return;
    }
    if (a === 'morelimits') {
      var b = act.querySelector('.u11ctx-morelim-b');
      if (b) {
        var open = !b.hidden;
        b.hidden = open;
        var lab = act.querySelector('.u11ctx-minibtn span');
        if (lab) lab.textContent = open ? lab.textContent.replace(/^Hide/, 'More') : lab.textContent.replace(/^More/, 'Hide');
        if (!open && R()) R().animateFills(b);
      }
      return;
    }
  }

  function runCompact() {
    if (compactBusy) return;
    compactBusy = true;
    var statusEl = ringPop.querySelector('[data-u11ctx-status]');
    D().dispatch('cmd.chat.compact_context', { thread_id: curThread, scenario: compactIdx });
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.className = 'u11ctx-status working';
      statusEl.innerHTML = '<span class="u11ctx-spin"></span><span>Compacting thread context…</span>';
    }
    var sc = COMPACT_SCENARIOS[compactIdx % COMPACT_SCENARIOS.length];
    compactIdx++;
    setTimeout(function () {
      compactBusy = false;
      if (!ringPop) return;
      var el = ringPop.querySelector('[data-u11ctx-status]');
      if (!el) return;
      el.hidden = false;
      var cls = sc.status === 'completed' ? 'ok' : (sc.status === 'no_gain' || sc.status === 'soft_deferred' ? 'info' : 'warn');
      el.className = 'u11ctx-status ' + cls;
      var cm = sc.ref ? maintenanceById(sc.ref) : null;
      var detail = sc.detail || (cm ? cm.detail : '');
      if (cm && cm.reclaimed != null) {
        /* the record's own figures, read out of the record — the copy no
           longer carries a hand-written duplicate to sniff for */
        detail += ' · ' + (cm.reclaimed > 0 ? ktok(cm.reclaimed) + ' reclaimed' : 'nothing reclaimed');
        detail += ' · ' + (CACHE_EFFECT[cm.cacheEffect] || 'cache ' + R().human(cm.cacheEffect));
      }
      var usage = cm ? compactUsage(cm) : null;
      var html = '<b>' + sc.result + '</b><span>' + detail + '</span>';
      if (usage) html += '<em>' + usage + '</em>';
      html += '<span class="u11ctx-hist">Historical usage totals unchanged.</span>';
      el.innerHTML = html;
      if (window.toast) window.toast(sc.result + ' — ' + detail);
    }, 900);
  }

  function placeRing(anchor) {
    var r = anchor.getBoundingClientRect();
    var pop = ensureRing();
    pop.innerHTML = ringHTML();
    pop.classList.add('on');
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = pop.offsetWidth || 308, h = pop.offsetHeight || 240;
    var left = Math.min(Math.max(8, r.right - w), vw - w - 8);
    var top = r.top - h - 8;
    if (top < 8) top = Math.min(r.bottom + 8, vh - h - 8);
    pop.style.left = left + 'px';
    pop.style.top = Math.max(8, top) + 'px';
    if (R()) R().animateFills(pop);
  }

  function openRing(anchor) {
    closeDetails();
    if (window.PMMenu && window.PMMenu.closeAll) window.PMMenu.closeAll();
    if (window.U11RunDetail) window.U11RunDetail.close();
    ringOpen = true;
    lastFocus = document.activeElement;
    placeRing(anchor || ringBtn);
    if (ringBtn) ringBtn.setAttribute('aria-expanded', 'true');
  }
  function closeRing() {
    if (!ringOpen) return;
    ringOpen = false;
    if (ringPop) ringPop.classList.remove('on');
    if (ringBtn) ringBtn.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ================================================================
     CONTEXT DETAILS — editor-panel-sized docked tab concept
     ================================================================ */
  function ensureDetails() {
    if (detPanel) return detPanel;
    detPanel = document.createElement('aside');
    detPanel.className = 'u11ctx-det';
    detPanel.id = 'u11-ctx-detail-pop';
    detPanel.setAttribute('role', 'dialog');
    detPanel.setAttribute('aria-modal', 'true');
    detPanel.setAttribute('aria-label', 'Context details');
    document.body.appendChild(detPanel);
    detPanel.addEventListener('click', onDetClick);
    return detPanel;
  }

  function detailsHTML(threadId) {
    var d = D();
    var th = d.threadById[threadId];
    if (!th) return '<div class="u11rd-empty">Thread not found.</div>';
    var ctx = th.context;
    var model = d.modelById[th.effectiveModelId];
    var conn = d.connectionById[th.effectiveConnectionId];
    var prod = d.productById[th.effectiveProductId];
    var html = '';

    /* thread fixture switcher (demo) */
    html += '<div class="u11ctx-tswitch" role="tablist" aria-label="Context thread fixture">';
    ['thread:t-88', 'thread:t-91'].forEach(function (tid) {
      var t2 = d.threadById[tid];
      html += '<button type="button" class="u11ctx-tab' + (tid === threadId ? ' is-active' : '') + '" data-u11ctx-tab="' + tid + '" role="tab" aria-selected="' + (tid === threadId) + '">' +
        t2.title + '</button>';
    });
    html += '</div>';

    /* 1 · current context */
    html += '<div class="u11ctx-card">';
    html += '<div class="u11ctx-ctt">Current context</div>';
    html += '<div class="u11rd-grid">';
    html += kv('Provider', d.familyById[conn ? d.accountById[conn.accountId].familyId : 'fam:claude'].label);
    html += kv('Account', conn ? d.accountLabel(conn.accountId) : '—');
    html += kv('Connection used', conn ? conn.label + (conn.authMethod === 'cli_owned_profile' ? ' · CLI profile' : '') : '—');
    /* the fourth and fifth levels of the hierarchy, which this grid used to
       stop short of: the entitlement the thread is spending, and the model
       with the capabilities that decide what the window can hold. The model's
       registry family is the vendor that built it and is stated separately
       whenever the account routing the call belongs to another family
       (audit A02-10). */
    html += kv('Product', prod ? prod.label : unrec('not recorded for this thread'));
    html += kv('Model and capabilities', modelLevelText(model, conn));
    html += kv('Context used', ktok(ctx.used) + ' / ' + ktok(ctx.limit) + ' · ' + ctx.pct + '% of the window');
    html += kv('Context cache hit', ratePct(ctx.cacheHitRate));
    html += kv('Current window', 'since ' + T().atClock(ctx.windowStartedAt));
    html += kv('Last activity', T().atClock(ctx.lastActivityAt));
    /* A cache record this thread does not carry is stated as unrecorded.
       Dropping the row would read as "there is no prefix", which is a
       different claim from "we do not have one recorded" (audit A05-06). */
    html += kv('Stable prefix', ctx.stablePrefixId || unrec('not recorded for this thread'));
    html += kv('Cache epoch', ctx.cacheEpoch || unrec('not recorded for this thread'));
    if (ctx.toolSchemaOverhead) {
      var tso = ctx.toolSchemaOverhead;
      /* One figure, both bases named — the same 5.9k used to read "5% of
         window" here and a bare "14%" three rows down (audit A05-10), and
         the row used to say where it came from twice (audit A09-11). */
      var ofUsed = ctx.used ? Math.round(tso.tokens / ctx.used * 100) : null;
      html += kv('Tool schema overhead', ktok(tso.tokens) +
        (ofUsed != null ? ' · ' + ofUsed + '% of the ' + ktok(ctx.used) + ' in context' : '') +
        ' · ' + tso.pctOfWindow + '% of the ' + ktok(ctx.limit) + ' window');
    } else {
      html += kv('Tool schema overhead', unrec('not recorded for this thread'));
    }
    html += '</div>';
    if (ctx.toolSchemaOverhead) {
      html += '<div class="u11ctx-note">' + ic('info') +
        '<span>Tool schema overhead is Puppet Master’s own measurement of the tool and MCP schemas held in the window. It is not a provider figure.</span></div>';
    }
    html += segBarHTML(ctx, false);
    if (th.switched) {
      html += '<div class="u11ctx-note">' + ic('info') +
        '<span>Switched thread — the ring re-baselined to the current effective model’s window. Earlier windows live in the timeline.</span></div>';
    }
    html += '</div>';

    /* 2 · what is in context — aligned grid, zero rows hidden */
    html += '<div class="u11ctx-card">';
    html += '<div class="u11ctx-ctt">What is in context</div>';
    html += '<div class="u11ctx-segbase">Every share below is a share of the ' + ktok(ctx.used) +
      ' now in context. The window is ' + ktok(ctx.limit) + '.</div>';
    html += '<div class="u11ctx-srcgrid">';
    var visIdx = [];
    ctx.segments.forEach(function (s, idx) { if (s.pct > 0) visIdx.push({ s: s, idx: idx }); });
    var head = visIdx.slice(0, 5), tail = visIdx.slice(5);
    head.forEach(function (x) { html += srcRow(x.s, x.idx); });
    if (tail.length) {
      html += '<div class="u11ctx-more" data-u11ctx-more="src">' +
        '<button type="button" class="u11ctx-minibtn u11ctx-more-t">' + ic('chevD') + '<span>All sources (' + tail.length + ' more)</span></button>' +
        '<div class="u11ctx-more-b" hidden>' + tail.map(function (x) { return srcRow(x.s, x.idx); }).join('') + '</div></div>';
    }
    html += '</div></div>';

    /* 3 · what changed */
    var events = d.timeline.filter(function (ev) { return ev.threadId === threadId; });
    if (events.length) {
      html += '<div class="u11ctx-card">';
      html += '<div class="u11ctx-ctt">What changed</div>';
      html += '<div class="u11ctx-timeline">';
      events.forEach(function (ev) {
        html += '<div class="u11ctx-tlev">';
        html += '<span class="u11ctx-tletime">' + T().atClock(ev.at) + '</span>';
        html += '<span class="u11ctx-tlekind">' + R().human(ev.kind) + '</span>';
        if (ev.kind === 'switch') {
          var fromM = d.modelById[ev.from.modelId], toM = d.modelById[ev.to.modelId];
          html += '<div class="u11ctx-tlemain">' + ev.label + '</div>';
          html += '<div class="u11rd-grid">';
          html += kv('From', fromM.label + ' · ' + ktok(ev.from.limit) + ' window');
          html += kv('To', toM.label + ' · ' + ktok(ev.to.limit) + ' window');
          html += kv('Reason', ev.reason);
          html += kv('Cache effect', ev.cacheEffect);
          if (ev.preflightCompression) html += kv('Preflight', 'compression ran before the replay');
          if (ev.replayEventId) html += kv('Replay', ev.replayEventId + ' · attributed to the new connection');
          html += '</div>';
          html += '<div class="u11ctx-note">' + ic('info') + '<span>The current meter re-baselined to the smaller window; per-attempt attribution stays with the model that handled each attempt.</span></div>';
        } else if (ev.kind === 'maintenance' && ev.refId) {
          var cm = null;
          d.maintenance.forEach(function (m) { if (m.id === ev.refId) cm = m; });
          if (cm) {
            /* the record's own copy already names the operation — repeating
               the enum token after it read as a second, rawer label
               (audit A05-18) */
            html += '<div class="u11ctx-tlemain">' + cm.copy + '</div>';
            html += '<div class="u11ctx-tlesub">' + cm.detail +
              (cm.reclaimed != null ? ' · ' + (cm.reclaimed > 0 ? ktok(cm.reclaimed) + ' reclaimed' : 'nothing reclaimed') : '') +
              ' · ' + (CACHE_EFFECT[cm.cacheEffect] || 'cache ' + R().human(cm.cacheEffect)) +
              (cm.invalidationReason ? ', because ' + R().human(cm.invalidationReason) : '') + '</div>';
            var cmUse = compactUsage(cm);
            if (cmUse) html += '<div class="u11ctx-tlesub">' + cmUse + '</div>';
          }
        } else {
          html += '<div class="u11ctx-tlemain">' + (ev.label || '') + '</div>';
          if (ev.detail) html += '<div class="u11ctx-tlesub">' + ev.detail + '</div>';
        }
        html += '</div>';
      });
      html += '</div></div>';
    }

    /* 3b · helper work whose result was thrown away or superseded.
       A helper may consume Usage even when its result is discarded: the
       provider work happened, so it is recorded once, and no context change
       was committed. These are real events, not a scenario string
       (packet 02:108, audit A05-08). */
    var unusedHelpers = d.attempts.filter(function (a) {
      if (a.status !== 'timed_out_discarded' && a.status !== 'stale_served_then_refreshed' && !a.discarded) return false;
      var w = a.workId ? d.workById[a.workId] : null;
      return !w || !w.threadId || w.threadId === threadId;
    });
    if (unusedHelpers.length) {
      html += '<div class="u11ctx-card">';
      html += '<div class="u11ctx-ctt">Helper work that was not used</div>';
      unusedHelpers.forEach(function (a) {
        var W = window.U11W;
        var tt = W && W.tokenTotal ? W.tokenTotal(a.tokens, a, { subject: 'helper call' }) : null;
        html += '<div class="u11ctx-msg">';
        html += '<div class="u11ctx-msghead">' + R().humanCap(a.purpose) + ' · ' + R().human(a.status) +
          '<span>' + (a.finishedAt ? T().atClock(a.finishedAt) : 'still running') + '</span></div>';
        var aw = a.workId ? d.workById[a.workId] : null;
        html += '<div class="u11ctx-msgsub">' + routeOf(a) +
          (aw && aw.threadId ? '' : ' · background work, not attached to this thread') + '</div>';
        /* This read "ue-501 · counted once under dk-501": two internal tokens
           welded into a phrase. The event id stays as the row's identity in its
           own element, the rollup key moves to a data attribute, and the phrase
           keeps the fact that the attempt is counted once. */
        html += '<div class="u11ctx-attrow" data-u11-rollup="' + (a.dedupeKey || '') + '">' +
          '<span><span class="u11ctx-attid">' + a.eventId + '</span>' +
          (a.dedupeKey ? ' · counted once' : ' · no rollup key recorded') +
          '</span><b>' + (tokOf(a) || 'no provider usage reported') +
          ' · ' + costOf(a) + '</b><em>' +
          (tt && tt.total != null ? 'total ' + ktok(tt.total) : 'total unknown') + '</em></div>';
        if (a.discardedReason) html += '<div class="u11ctx-msgsub">' + a.discardedReason + '</div>';
        else if (a.note) html += '<div class="u11ctx-msgsub">' + a.note + '</div>';
        html += '</div>';
      });
      html += '<div class="u11ctx-note">' + ic('info') +
        '<span>Context mutation and provider settlement are separate facts. Nothing above changed the context, and none of it is added to historical totals a second time.</span></div>';
      html += '</div>';
    }

    /* 4 · models & connections used — only when more than one */
    if (th.mainModelIds.length > 1) {
      html += '<div class="u11ctx-card">';
      html += '<div class="u11ctx-ctt">Models and connections used in this thread</div>';
      th.mainModelIds.forEach(function (mid, i) {
        var m = d.modelById[mid];
        var isCur = mid === th.effectiveModelId;
        html += '<div class="u11ctx-modelrow' + (isCur ? ' cur' : '') + '">';
        html += '<span class="u11ctx-modelname">' + m.label + (isCur ? ' · current' : '') + '</span>';
        html += '<span class="u11ctx-modelwin">' + ktok(m.contextWindow) + ' window</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    /* 5 · messages and attempts — expandable, human-readable first */
    var works = d.works.filter(function (w) { return w.threadId === threadId; });
    if (works.length) {
      html += '<div class="u11ctx-card">';
      html += '<div class="u11ctx-ctt">Messages and attempts</div>';
      html += '<div class="u11ctx-more" data-u11ctx-more="msgs">' +
        '<button type="button" class="u11ctx-minibtn u11ctx-more-t">' + ic('chevD') + '<span>Show ' + works.length + ' turns</span></button>' +
        '<div class="u11ctx-more-b" hidden>';
      works.forEach(function (w) {
        var atts = d.attempts.filter(function (a) { return a.workId === w.id; });
        var main = atts.filter(function (a) { return a.bucket === 'main'; })[0] || atts[0];
        html += '<div class="u11ctx-msg">';
        html += '<div class="u11ctx-msghead">' + w.label + '<span>' + (w.endedAt ? T().atClock(w.endedAt) : 'now') + '</span></div>';
        if (main) html += '<div class="u11ctx-msgsub">' + routeOf(main) + '</div>';
        atts.forEach(function (a) {
          var tok = tokOf(a);
          html += '<div class="u11ctx-attrow' + (a.status === 'failed' || a.status === 'interrupted' ? ' err' : '') + '">' +
            '<span>' + d.buckets[a.bucket] + ' · ' + R().human(a.purpose) + '</span>' +
            '<b>' + (tok || 'no provider usage reported') + ' · ' + costOf(a) + '</b>' +
            '<em>' + R().human(a.status) + '</em></div>';
        });
        html += '</div>';
      });
      html += '</div></div></div>';
    }

    /* 7 · technical / raw — tucked, redacted */
    html += '<div class="u11ctx-card">';
    html += '<div class="u11ctx-more" data-u11ctx-more="raw">' +
      '<button type="button" class="u11ctx-minibtn u11ctx-more-t">' + ic('chevD') + '<span>Technical · Raw</span></button>' +
      '<div class="u11ctx-more-b" hidden>';
    html += '<div class="u11ctx-rawnote">' + R().chip('unavailable') + '<span>Raw is redacted — credentials, raw payloads, account ids and local paths are withheld.</span></div>';
    /* the raw view reads the same record the curated grid reads: the epoch
       used to be synthesised from a boolean, so one panel showed two
       different context epochs (audit A05-05) */
    html += '<pre class="u11ctx-raw">' + JSON.stringify({
      thread_id: '[redacted]',
      context_epoch: ctx.cacheEpoch || 'unknown',
      stable_prefix_id: ctx.stablePrefixId || 'unknown',
      effective_model: th.effectiveModelId,
      effective_window: ctx.limit,
      provider_payload_hash: 'sha256:9f2c…a41',
      config_snapshot_hash: 'sha256:1b7e…90c',
      segments: ctx.segments.length,
      note: 'raw provider payloads are never shown in the curated view'
    }, null, 2) + '</pre>';
    html += '</div></div></div>';

    return html;
  }

  function srcRow(s, i) {
    return '<div class="u11ctx-srcrow">' +
      '<span class="u11ctx-srcdot ' + segClass(s.family, i) + '"></span>' +
      '<span class="u11ctx-srclab">' + s.family + '</span>' +
      '<span class="u11ctx-srcpct">' + s.pct + '%</span>' +
      '<span class="u11ctx-srctok">' + ktok(s.tokens) + '</span></div>';
  }
  /* A past attempt's identity comes from the snapshot the event preserved
     where it has one: today's registry must not re-label it (audit A02-04). */
  function routeOf(a) {
    var d = D();
    var parts = [];
    var model = a.effectiveModelId ? d.modelById[a.effectiveModelId] : null;
    if (model) parts.push(model.label);
    var acctId = a.effectiveAccountId || a.requestedAccountId;
    if (a.historicalIdentity && a.historicalIdentity.label &&
      (!acctId || a.historicalIdentity.accountId === acctId)) parts.push(a.historicalIdentity.label);
    else if (acctId && d.accountById[acctId]) parts.push(d.accountLabel(acctId));
    var prod = a.productId ? d.productById[a.productId] : null;
    if (prod) parts.push(prod.label);
    return parts.join(' · ');
  }
  /* Cache read and cache write are separate buckets and are never collapsed
     into one word. A write nobody reported is stated through the route's own
     cache reporting state, so unknown and unsupported stay different facts
     (audit A05-12, GUI-USG-006). */
  function tokOf(a) {
    var t = a.tokens || {};
    var parts = [];
    if (t.input != null) parts.push(ktok(t.input) + ' in');
    if (t.output != null) parts.push(ktok(t.output) + ' out');
    if (t.cacheRead != null) parts.push(ktok(t.cacheRead) + ' cache read');
    if (t.cacheWrite != null) parts.push(ktok(t.cacheWrite) + ' cache write');
    else if (t.cacheRead != null) {
      var st = cacheWriteState(a);
      if (st) parts.push('cache write ' + st);
    }
    return parts.join(' · ');
  }
  /* Only a route-level fact is worth a word on this compact row: a route that
     does not expose cache write, or one whose reporting could not be read at
     all. Both are different from a reported zero (GUI-USG-006). Attempt-level
     absence on a reporting route is carried in the attempt detail instead. */
  function cacheWriteState(a) {
    var cs = null;
    (D().cacheStats || []).forEach(function (c) { if (c.connectionId === a.connectionId) cs = c; });
    if (!cs) return 'unknown';
    var state = cs.cacheWriteBreakdownState || cs.cacheReportingState;
    if (state === 'not_exposed') return 'not exposed';
    if (state === 'unknown') return 'unknown';
    return null;
  }
  /* Compact cost state for the turn rows — never a blank where a price is
     unknown, never a zero where one is hidden. */
  function costOf(a) {
    if (a.hiddenByok || a.costStatus === 'hidden_byok') return 'price hidden';
    if (a.hiddenSubscription || a.costStatus === 'hidden_subscription' ||
      a.displayCostPolicy === 'subscription_covered') return 'no separate charge';
    if (a.costStatus === 'unknown' || a.displayCostPolicy === 'unknown' || a.costMicro == null) return 'cost unknown';
    if (a.costMicro === 0) return fmt().cost(0) + ' reported';
    return fmt().cost(a.costMicro / 1e6);
  }
  function kv(label, value) {
    return '<div class="u11rd-kv"><span>' + label + '</span><b>' + value + '</b></div>';
  }
  function unrec(text) { return '<i class="u11rd-unrec">' + text + '</i>'; }
  /* Models and capabilities is the fifth level of the source hierarchy, and
     the capabilities are the reason the window is the size it is. The family
     on the model record is the vendor that built it; the family that routed
     the call is the one that owns the account, and the two are not always the
     same. Both are named when they differ (audit A02-10). */
  function modelLevelText(m, conn) {
    var d = D();
    if (!m) return unrec('no model is recorded for this thread');
    var caps = [];
    if (m.contextWindow != null) caps.push(ktok(m.contextWindow) + ' context window');
    if (m.reasoning) caps.push('reasoning');
    if (m.vision) caps.push('vision');
    if (m.local) caps.push('runs on this machine');
    var out = m.label + (caps.length ? ' · ' + caps.join(' · ') : '');
    var acct = conn ? d.accountById[conn.accountId] : null;
    var routed = acct ? d.familyById[acct.familyId] : null;
    var vendor = m.familyId ? d.familyById[m.familyId] : null;
    if (vendor && routed && vendor.id !== routed.id) {
      out += ' — built by ' + vendor.label + ', routed through ' + routed.label;
    }
    return out;
  }

  function onDetClick(e) {
    var tab = e.target.closest('[data-u11ctx-tab]');
    if (tab) {
      var tid = tab.getAttribute('data-u11ctx-tab');
      curThread = tid;
      detPanel.innerHTML = detailsHead() + '<div class="u11ctx-detbody">' + detailsHTML(tid) + '</div>';
      if (R()) R().animateFills(detPanel);
      return;
    }
    if (e.target.closest('[data-u11ctx-close]')) { closeDetails(); return; }
    var more = e.target.closest('[data-u11ctx-more]');
    if (more && e.target.closest('.u11ctx-more-t')) {
      var b = more.querySelector('.u11ctx-more-b');
      if (b) {
        var lab = more.querySelector('.u11ctx-more-t span');
        if (lab && !lab.getAttribute('data-l0')) lab.setAttribute('data-l0', lab.textContent);
        var open = !b.hidden;
        b.hidden = open;
        if (lab) {
          var l0 = lab.getAttribute('data-l0');
          lab.textContent = open ? l0 : l0.replace(/^Show/, 'Hide').replace(/^All sources/, 'Fewer sources').replace(/^Technical/, 'Hide Technical');
        }
        if (!open && R()) R().animateFills(b);
      }
      return;
    }
  }

  function detailsHead() {
    return '<div class="u11ctx-dethead">' +
      '<div class="u11ctx-detht">' + ic('inbox') + '<span>Context details</span></div>' +
      '<button type="button" class="u11rd-x" data-u11ctx-close title="Close" aria-label="Close context details">' + ic('x') + '</button>' +
      '</div>';
  }

  function openDetails(threadId) {
    closeRing();
    if (window.PMMenu && window.PMMenu.closeAll) window.PMMenu.closeAll();
    if (window.U11RunDetail) window.U11RunDetail.close();
    if (threadId) curThread = threadId;
    var p = ensureDetails();
    lastFocus = document.activeElement;
    p.innerHTML = detailsHead() + '<div class="u11ctx-detbody">' + detailsHTML(curThread) + '</div>';
    p.classList.add('on');
    detOpen = true;
    if (R()) R().animateFills(p);
    var x = p.querySelector('[data-u11ctx-close]');
    if (x) x.focus();
  }
  function closeDetails() {
    if (!detOpen) return;
    detOpen = false;
    if (detPanel) detPanel.classList.remove('on');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    D().dispatch('cmd.chat.close_thread_context_details', { thread_id: curThread });
  }

  /* ================================================================
     TRIGGERS — mounted in the chat/status chrome
     ================================================================ */
  function ringSvg(pct) {
    var heat = pct >= 90 ? 'hot' : (pct >= 70 ? 'warm' : 'calm');
    var off = 62.8 * (1 - pct / 100);
    return '<span class="u11ctx-ring" data-heat="' + heat + '">' +
      '<svg viewBox="0 0 24 24" style="transform:rotate(-90deg)" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10" fill="none" stroke="var(--border-light)" stroke-width="4"></circle>' +
      '<circle cx="12" cy="12" r="10" fill="none" stroke="var(--accent-blue)" stroke-width="4" stroke-linecap="round" stroke-dasharray="62.8" stroke-dashoffset="' + off.toFixed(2) + '"></circle>' +
      '</svg></span>';
  }

  function mountTriggers(container) {
    if (!container) return;
    ensureRing();
    ensureDetails();
    var d = D();
    var pct = d.threadById[curThread].context.pct;

    ringBtn = document.createElement('button');
    ringBtn.type = 'button';
    ringBtn.className = 'sb-chip u11ctx-ringbtn';
    ringBtn.setAttribute('data-tip', 'Context usage');
    ringBtn.title = 'Context usage';
    ringBtn.setAttribute('aria-label', 'Context usage, ' + pct + '% used');
    ringBtn.setAttribute('aria-haspopup', 'dialog');
    ringBtn.setAttribute('aria-expanded', 'false');
    ringBtn.setAttribute('aria-controls', 'u11-ctx-ring-pop');
    ringBtn.innerHTML = ringSvg(pct); /* no token label beside the closed ring */
    ringBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (ringOpen) closeRing(); else openRing(ringBtn);
    });
    container.appendChild(ringBtn);

    detBtn = document.createElement('button');
    detBtn.type = 'button';
    detBtn.className = 'sb-chip u11ctx-detbtn';
    detBtn.setAttribute('data-tip', 'Context details');
    detBtn.title = 'Context details';
    detBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg><span>Details</span>';
    detBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (detOpen) closeDetails(); else openDetails(curThread);
    });
    container.appendChild(detBtn);

    document.addEventListener('click', function (e) {
      if (ringOpen && ringPop && !ringPop.contains(e.target) && e.target !== ringBtn && !ringBtn.contains(e.target)) closeRing();
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (ringOpen) closeRing(); if (detOpen) closeDetails(); }
    });
  }

  window.U11Context = {
    mountTriggers: mountTriggers,
    openRing: openRing,
    openDetails: openDetails,
    closeAll: function () { closeRing(); closeDetails(); }
  };
})();
