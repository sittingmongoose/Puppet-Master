/* =====================================================================
   U11 — PRISM II · widget layer
   ---------------------------------------------------------------------
   U11-only widget types registered on the SHARED PMWidgets engine via
   the public register() API. No shared file is modified; U10 keeps its
   own renderer set untouched.

   Instance contract (packet §15.1): every instance carries type id,
   instance uid, layout (c/r + S/M/L/XL preset via engine), presentation
   (density/mode/numfmt), scope (inherit page or explicit stable id),
   time (range/compare) and content (group/sort/topN) — each widget
   advertises only the controls it supports through config().

   Boundary (packet §15.3): widget config controls layout, presentation
   and safe local filtering ONLY. Domain policy lives in the Usage
   settings sheet; widgets link there semantically.
   ===================================================================== */
(function () {
  'use strict';

  function D() { return window.U11; }
  function T() { return window.U11time; }
  function fmt() { return window.USfmt; }
  function R() { return window.USrender; }
  function ic(n) { return window.USrender.ic(n); }

  /* ---------- page state shared with the host page ---------- */
  var U11W = {
    pageScope: 'scope:all',
    disclosure: 'essentials',           /* essentials | standard | advanced */
    DISC_ORDER: ['essentials', 'standard', 'advanced'],
    discAtLeast: function (lvl) {
      return U11W.DISC_ORDER.indexOf(U11W.disclosure) >= U11W.DISC_ORDER.indexOf(lvl);
    },
    /* which widget types each disclosure level may ADD (existing widgets
       are never deleted by a disclosure change — packet §5.1) */
    typesForDisclosure: {
      essentials: ['plans', 'costs', 'accounts', 'attention', 'context', 'capacity', 'free', 'ledger'],
      standard: ['plans', 'costs', 'accounts', 'attention', 'context', 'capacity', 'free', 'ledger',
        'runs', 'operations', 'analytics', 'tools', 'cache', 'signals'],
      advanced: ['plans', 'costs', 'accounts', 'attention', 'context', 'capacity', 'free', 'ledger',
        'runs', 'operations', 'analytics', 'tools', 'cache', 'signals', 'authority']
    }
  };

  /* ---------- scope helpers (stable IDs only) ---------- */
  function effScope(item) {
    var s = item.cfg && item.cfg.scope;
    return (s && s !== 'inherit') ? s : U11W.pageScope;
  }
  function scopeOverridden(item) {
    return !!(item.cfg && item.cfg.scope && item.cfg.scope !== 'inherit');
  }
  function scopeOpts() {
    var d = D();
    var opts = ['inherit · page scope'];
    opts.push('scope:all · all current usage');
    d.comparisonSets.forEach(function (c) { opts.push(c.id + ' · ' + c.label); });
    d.visibleFamilies().forEach(function (f) { opts.push(f.id + ' · ' + f.label); });
    d.visibleAccounts().forEach(function (a) { opts.push(a.id + ' · ' + d.accountLabel(a.id)); });
    return opts;
  }
  function scopeSelectSpec(item) {
    return { key: 'scope', label: 'Scope', type: 'select', options: scopeOpts(),
      value: (item.cfg && item.cfg.scope) || 'inherit · page scope' };
  }
  function densitySpec(item) {
    return { key: 'density', label: 'Density', type: 'select', options: ['comfortable', 'compact'],
      value: (item.cfg && item.cfg.density) || 'comfortable' };
  }

  /* config select values carry "id · label"; parse the id back */
  function normScopeVal(v) {
    if (!v || v.indexOf('inherit') === 0) return 'inherit';
    var id = String(v).split(' · ')[0];
    return id || 'inherit';
  }

  /* ---------- number formatting per instance ---------- */
  function numfmt(item, n) {
    if (n == null) return '—';
    var full = item.cfg && item.cfg.numfmt === 'full';
    if (full) return fmt().num(n);
    return fmt().tok(n);
  }
  function moneyFmt(micro) {
    if (micro == null) return '—';
    return fmt().cost(micro / 1e6);
  }

  /* ---------- shared body furniture ---------- */
  function topStrip(item, label) {
    var html = '<div class="u11w-top">';
    if (scopeOverridden(item)) {
      var sn = D().scopeNode(effScope(item));
      html += '<span class="u11w-scopechip on" title="This widget overrides the page scope">' +
        ic('filter') + '<span>' + sn.label + '</span>' +
        '<button type="button" class="u11w-minibtn" data-u11-act="usescope">Use page scope</button></span>';
    } else {
      html += '<span class="u11w-scopechip">' + ic('globe2') + '<span>page scope</span></span>';
    }
    if (label) html += '<span class="u11w-toplab">' + label + '</span>';
    html += '</div>';
    return html;
  }
  function cfgDirty(item) {
    return !!(item.cfg && Object.keys(item.cfg).some(function (k) {
      var v = item.cfg[k];
      return !(v === '' || v === null || v === undefined || v === 'inherit' || v === false ||
        v === 'auto' || v === 'pressure' || v === 'family' || v === 'compact' || v === 'all' ||
        v === '5' || v === '24h' || v === 'cards' || v === 'on');
    }));
  }
  function footActs(item) {
    var html = '<div class="u11w-foot">';
    html += '<button type="button" class="u11w-minibtn" data-u11-act="duplicate" title="Duplicate this widget instance">' + ic('copy') + '<span>Duplicate</span></button>';
    if (cfgDirty(item)) {
      html += '<button type="button" class="u11w-minibtn" data-u11-act="resetcfg" title="Reset this instance’s settings to defaults">' + ic('undo') + '<span>Reset settings</span></button>';
    }
    html += '<span class="u11w-footsp"></span>';
    html += '<button type="button" class="u11w-minibtn dim" data-u11-act="opensettings">' + ic('cog') + '<span>Open Usage settings</span></button>';
    html += '</div>';
    return html;
  }
  function moreBlock(id, n, label) {
    return '<div class="u11w-more" data-u11-more="' + id + '">' +
      '<button type="button" class="u11w-minibtn u11w-more-t">' + ic('chevD') + '<span>Show ' + n + ' ' + label + '</span></button>' +
      '<div class="u11w-more-b" hidden></div></div>';
  }
  function vsChipIf(vs) {
    if (!vs || vs === 'measured' || vs === 'provider_reported') return '';
    return R().chip(vs);
  }
  function toneForPct(p) {
    if (p == null) return 'mute';
    return p >= 90 ? 'hot' : (p >= 70 ? 'warn' : 'ok');
  }

  /* ================================================================
     RENDERERS
     ================================================================ */

  /* ---------- plans: Plans & limits + what happens next ---------- */
  function plansProducts(scopeId) {
    var d = D(), set = d.scopeProductSet(scopeId), out = [];
    d.products.forEach(function (p) {
      if (!set[p.id]) return;
      var meters = d.metersOfProduct(p.id);
      if (!meters.length) return;
      var top = null;
      meters.forEach(function (m) {
        if (m.windowKind === 'none') return;
        if (!top || (m.usedPct != null && (top.usedPct == null || m.usedPct > top.usedPct))) top = m;
      });
      top = top || meters[0];
      out.push({ product: p, meters: meters, top: top });
    });
    out.sort(function (a, b) {
      var ap = a.top.usedPct == null ? -1 : a.top.usedPct;
      var bp = b.top.usedPct == null ? -1 : b.top.usedPct;
      return bp - ap;
    });
    return out;
  }

  function denseWrap(item, inner) {
    var dense = item.cfg && item.cfg.density === 'compact';
    return '<div class="' + (dense ? 'u11w-dense' : 'u11w-comf') + '">' + inner + '</div>';
  }

  function renderPlans(item, sizeKey) {
    var d = D(), t = T();
    var scope = effScope(item);
    var sort = (item.cfg && item.cfg.sort) || 'pressure';
    var topn = parseInt((item.cfg && item.cfg.topn) || '5', 10);
    var showNext = !(item.cfg && item.cfg.next === 'off');
    var rows = plansProducts(scope);
    if (sort === 'name') rows.sort(function (a, b) { return a.product.label.localeCompare(b.product.label); });

    if (!rows.length) return denseWrap(item, topStrip(item) + '<div class="u11w-empty">' + ic('dial') + '<p>No plans in this scope.</p></div>');

    var tiny = sizeKey === 'S';
    var shown = tiny ? rows.slice(0, 3) : rows.slice(0, topn);
    var html = topStrip(item, rows.length + ' products');

    shown.forEach(function (row) {
      var p = row.product, m = row.top;
      var conn = d.connectionById[p.connectionId];
      var path = conn ? d.accountLabel(conn.accountId) : '';
      var pct = m.usedPct;
      var tone = toneForPct(pct);
      var resetTxt = '';
      if (m.resetAt) resetTxt = t.when(m.resetAt, d.meta.now, 'reset');
      else if (m.expiresAt) resetTxt = t.when(m.expiresAt, d.meta.now, 'expiry');
      else if (m.vs === 'unknown') resetTxt = 'Reset time unavailable';

      html += '<div class="u11w-planrow">';
      html += '<div class="u11w-planmain">';
      html += '<span class="u11w-planname">' + p.label + vsChipIf(m.vs) + '</span>';
      html += '<span class="u11w-planpath">' + path + ' · ' + (conn ? conn.label : '') + '</span>';
      html += '</div>';
      if (pct != null) {
        html += '<div class="u11w-planmeter">' + R().meter(pct, tone) + '</div>';
      } else {
        html += '<div class="u11w-planmeter unknown">' + ic('help') + '<span>' +
          (m.note || 'Limit not exposed · observed use ' + numfmt(item, m.used)) + '</span></div>';
      }
      html += '<div class="u11w-planmeta">';
      if (pct != null) html += '<b class="' + tone + '">' + pct + '%</b>';
      if (resetTxt) html += '<span class="u11w-reset" title="' + (m.resetAt ? t.full(m.resetAt) : '') + '">' + resetTxt + '</span>';
      html += '</div>';
      row.meters.forEach(function (mm) {
        if (mm === row.top) return;
        if (mm.vs === 'unavailable' && mm.estimate) {
          html += '<div class="u11w-planmeter estimate">' + ic('trend') + '<span>' + mm.label +
            ' · Provider data unavailable · PM estimate ' + mm.estimate.usedPct + '% · ' + mm.estimate.conf + ' confidence</span></div>';
        }
      });
      if (showNext && !tiny && d.continuation[p.id]) {
        html += '<div class="u11w-whatsnext">' + ic('route') + '<span>' + d.continuation[p.id].whatHappensNext + '</span></div>';
      }
      html += '</div>';
    });

    if (rows.length > shown.length) {
      html += '<div class="u11w-more" data-u11-more="plans">' +
        '<button type="button" class="u11w-minibtn u11w-more-t">' + ic('chevD') + '<span>Other ' + (rows.length - shown.length) + ' products</span></button>' +
        '<div class="u11w-more-b" hidden>' + rows.slice(shown.length).map(function (row) {
          var m = row.top, pct = m.usedPct;
          return '<div class="u11w-planrow slim"><span class="u11w-planname">' + row.product.label + '</span>' +
            (pct != null ? R().meter(pct, toneForPct(pct)) : '<span class="u11w-dim">limit not exposed</span>') +
            (pct != null ? '<b>' + pct + '%</b>' : '') + '</div>';
        }).join('') + '</div></div>';
    }
    html += footActs(item);
    return denseWrap(item, html);
  }

  /* ---------- costs: spending this month ---------- */
  function renderCosts(item, sizeKey) {
    var d = D(), c = d.costs;
    var scope = effScope(item);
    var mode = (item.cfg && item.cfg.mode) || 'cards';
    var spent = c.spentMonthMicro, limit = c.spendingLimitMicro;
    var pct = Math.round(spent / limit * 100);
    var tone = pct >= 90 ? 'hot' : (pct >= c.warningThresholdPct ? 'warn' : 'ok');
    var html = topStrip(item, 'this month');

    html += '<div class="u11w-costhero">';
    html += '<div class="u11w-costnum" data-counter="' + (spent / 1e6).toFixed(2) + '" data-prefix="$">$' + (spent / 1e6).toFixed(2) + '</div>';
    html += '<div class="u11w-costsub">spent of ' + moneyFmt(limit) + ' spending limit · warn at ' + c.warningThresholdPct + '%</div>';
    html += '<div class="u11w-costbar">' + R().meter(pct, tone) + '</div>';
    html += '</div>';

    html += '<div class="u11w-costsplit">';
    html += '<div class="u11w-splitrow"><span>API-billed</span><b>' + moneyFmt(c.apiBilledMicro) + '</b></div>';
    html += '<div class="u11w-splitrow"><span>Plan-included</span><b>' + moneyFmt(c.planIncludedMicro) + '</b></div>';
    html += '<div class="u11w-splitrow dim"><span>Burn</span><b>$' + c.burn.perHour.toFixed(2) + '/h · $' + c.burn.perDay.toFixed(2) + '/d</b></div>';
    html += '<div class="u11w-splitrow dim"><span>Forecast</span><b>' + moneyFmt(c.forecastMonthMicro) + ' by month end</b></div>';
    html += '</div>';

    if (sizeKey !== 'S') {
      var fams = c.byFamily.filter(function (f) { return f.micro > 0; });
      if (scope !== 'scope:all') {
        var set = d.scopeProductSet(scope);
        fams = fams.filter(function (f) {
          return d.accountsOfFamily(f.familyId).some(function (a) {
            return d.connectionsOfAccount(a.id).some(function (cn) {
              return d.productsOfConnection(cn.id).some(function (p) { return set[p.id]; });
            });
          });
        });
      }
      if (mode === 'table') {
        html += '<div class="u11w-tbl"><table class="us-tbl"><thead><tr><th>Provider</th><th>Spend</th><th>Basis</th></tr></thead><tbody>';
        fams.forEach(function (f) {
          html += '<tr><td>' + d.familyById[f.familyId].label + '</td><td class="num">' + moneyFmt(f.micro) + '</td><td class="dim">' + R().human(f.basis) + '</td></tr>';
        });
        html += '</tbody></table></div>';
      } else {
        html += '<div class="u11w-fams">';
        fams.forEach(function (f) {
          var fp = Math.round(f.micro / spent * 100);
          html += '<div class="u11w-famrow"><span class="u11w-famname">' + d.familyById[f.familyId].label + '</span>' +
            R().meter(fp, 'info') + '<b>' + moneyFmt(f.micro) + '</b></div>';
        });
        html += '</div>';
      }
    }
    html += '<div class="us-foot">' + ic('info') + '<span>One cost authority · the API/plan split is a projection, not a second model. Spending limit is user-controlled, not a plan allowance.</span></div>';
    html += footActs(item);
    return html;
  }

  /* ---------- accounts: grouped by family ---------- */
  function accountPressure(d, a) {
    var max = -1;
    d.connectionsOfAccount(a.id).forEach(function (cn) {
      if (cn.state === 'needs_reconnect') max = Math.max(max, 85);
      d.productsOfConnection(cn.id).forEach(function (p) {
        d.metersOfProduct(p.id).forEach(function (m) {
          if (m.usedPct != null && m.usedPct > max) max = m.usedPct;
        });
      });
    });
    if (a.state !== 'ready') max = Math.max(max, 70);
    return max;
  }
  function accountRowHTML(d, a) {
    var conns = d.connectionsOfAccount(a.id);
    var stateTone = a.state === 'ready' ? 'ok' : 'warn';
    var html = '<div class="u11w-acctrow">';
    html += '<span class="us-dot ' + stateTone + (a.state !== 'ready' ? ' pulse' : '') + '"></span>';
    html += '<div class="u11w-acctmain">';
    html += '<span class="u11w-acctname">' + a.label + '</span>';
    html += '<span class="u11w-acctdetail">' + a.detail + '</span>';
    if (a.attention) html += '<span class="u11w-attn">' + ic('alert') + '<span>' + a.attention + '</span>' +
      '<button type="button" class="u11w-minibtn" data-u11-act="reconnect" data-acct="' + a.id + '">Reconnect</button></span>';
    html += '<div class="u11w-conns">';
    conns.forEach(function (cn) {
      var cliBadge = cn.authMethod === 'cli_owned_profile' ? '<span class="u11w-cli" title="OAuth owned by ' + cn.authOwnedBy + ' — the CLI owns the session">CLI profile</span>' : '';
      var stCls = cn.state === 'needs_reconnect' ? ' warn' : '';
      html += '<span class="u11w-conn' + stCls + '" title="' + (cn.note || cn.label) + '">' + cn.label + cliBadge +
        (cn.state === 'needs_reconnect' ? '<em>needs attention</em>' : '') + '</span>';
    });
    html += '</div>';
    html += '<div class="u11w-acctmeta">';
    if (a.priority != null) html += '<span class="u11w-acctprio" title="Routing priority · 1 = first choice">Priority ' + a.priority + '</span>';
    if (a.lastUsedAt) {
      var ago = Date.parse(d.meta.now) - Date.parse(a.lastUsedAt);
      html += '<span class="u11w-acctlast">last used ' + T().dur(ago) + ' ago</span>';
    }
    html += '<span class="u11w-acctacts">' +
      '<button type="button" class="u11w-minibtn" data-u11-act="usenext" data-acct="' + a.id + '">Use next</button>' +
      '<button type="button" class="u11w-minibtn" data-u11-act="openmgmt" data-fam="' + a.familyId + '">Open provider console</button>' +
      '</span>';
    html += '</div></div></div>';
    return html;
  }

  function renderAccounts(item, sizeKey) {
    var d = D();
    var scope = effScope(item);
    var set = d.scopeProductSet(scope);
    var group = (item.cfg && item.cfg.group) || 'family';
    var dense = item.cfg && item.cfg.density === 'compact';
    var html = topStrip(item);
    var any = false;

    var inScope = function (a) {
      if (scope === 'scope:all') return true;
      var anc = d.ancestorsOf(scope);
      if (anc.familyId) return a.familyId === anc.familyId || d.ancestorsOf(a.id).familyId === anc.familyId;
      return true;
    };

    if (group === 'pressure') {
      var accts = d.visibleAccounts().filter(inScope).map(function (a) { return { a: a, p: accountPressure(d, a) }; });
      accts.sort(function (x, y) { return y.p - x.p; });
      if (dense) accts = accts.slice(0, 6);
      accts.forEach(function (row) {
        any = true;
        html += '<div class="u11w-acctgroup"><div class="u11w-acctfam">' + d.familyById[row.a.familyId].label + ' · ' + (row.p >= 0 ? row.p + '%' : '—') + '</div>' + accountRowHTML(d, row.a) + '</div>';
      });
    } else d.visibleFamilies().forEach(function (f) {
      var accts = d.accountsOfFamily(f.id).filter(function (a) { return !a.removed; });
      if (!accts.length) return;
      var famHasScope = accts.some(function (a) {
        return d.connectionsOfAccount(a.id).some(function (cn) {
          return d.productsOfConnection(cn.id).some(function (p) { return set[p.id]; });
        });
      });
      if (scope !== 'scope:all' && !famHasScope) return;
      any = true;

      html += '<div class="u11w-acctgroup' + (dense ? ' dense' : '') + '">';
      html += '<div class="u11w-acctfam">' + f.label + '</div>';
      var shownAccts = dense ? accts.slice(0, 3) : accts;
      shownAccts.forEach(function (a) { html += accountRowHTML(d, a); });
      if (accts.length > shownAccts.length) {
        html += '<div class="u11w-acctdetail" style="padding:2px 0">+' + (accts.length - shownAccts.length) + ' more in this family</div>';
      }
      html += '</div>';
    });

    if (!any) html += '<div class="u11w-empty">' + ic('users') + '<p>No accounts in this scope.</p></div>';
    html += '<div class="us-foot">' + ic('info') + '<span>Using an account collapses to “Using Personal OpenAI · ChatGPT plan”. Requested-vs-used mismatches surface only when they matter.</span></div>';
    html += footActs(item);
    return html;
  }

  /* ---------- attention: guard decisions ---------- */
  function renderAttention(item, sizeKey) {
    var d = D();
    var html = topStrip(item, d.guards.filter(function (g) { return g.state === 'blocked'; }).length + ' blocked');
    var showAll = item.cfg && item.cfg.state === 'all';
    var gs = d.guards.filter(function (g) { return showAll || g.state === 'blocked' || g.state === 'warn'; });

    gs.forEach(function (g) {
      var cls = g.state === 'blocked' ? 'blocked' : (g.state === 'warn' ? 'warn' : 'okk');
      html += '<div class="u11w-gcard ' + cls + '">';
      html += '<div class="u11w-ghead">' + ic(g.state === 'blocked' ? 'shield' : (g.state === 'warn' ? 'alert' : 'check')) +
        '<span class="u11w-gt">' + g.title + '</span><span class="u11w-gtime">' + T().atClock(g.at) + '</span></div>';
      html += '<div class="u11w-gwhere">' + g.where + '</div>';
      html += '<div class="u11w-gbody">' + g.body + '</div>';
      html += '<div class="u11w-more" data-u11-more="g' + g.id + '">' +
        '<button type="button" class="u11w-minibtn u11w-more-t">' + ic('chevD') + '<span>Why</span></button>' +
        '<div class="u11w-more-b" hidden>' + g.why.map(function (w) {
          return '<div class="u11w-whyrow"><span>' + w[0] + '</span><b>' + w[1] + '</b></div>';
        }).join('') + '</div></div>';
      html += '</div>';
    });
    html += footActs(item);
    return html;
  }

  /* ---------- context: context & cache efficiency summary ---------- */
  function renderContext(item, sizeKey) {
    var d = D();
    var th = d.threadById['thread:t-88'];
    var ctx = th.context;
    var html = topStrip(item, 'current thread');

    html += '<div class="u11w-ctxhero">';
    html += '<div class="u11w-ctxnum">' + fmt().tok(ctx.used).replace('.0k', 'k') + ' <span>/ ' + fmt().tok(ctx.limit).replace('.0k', 'k') + '</span></div>';
    html += '<div class="u11w-ctxsub">' + ctx.pct + '% of the current effective window · ' + th.title + '</div>';
    html += '<div class="u11w-ctxbar">' + R().meter(ctx.pct, toneForPct(ctx.pct)) + '</div>';
    html += '</div>';

    html += '<div class="u11w-splitrow"><span>Context cache hit</span><b>' + ctx.cacheHitRate + '%</b></div>';
    var saved = d.cacheStats.reduce(function (s, cs) { return s + (cs.save || 0); }, 0);
    html += '<div class="u11w-splitrow"><span>Prompt-cache saved today</span><b>$' + saved.toFixed(2) + '</b></div>';
    html += '<div class="u11w-splitrow dim"><span>Last activity</span><b>' + T().atClock(ctx.lastActivityAt) + '</b></div>';

    if (sizeKey !== 'S') {
      html += '<div class="u11w-segs">';
      ctx.segments.slice(0, 4).forEach(function (s, i) {
        html += '<div class="u11w-segrow"><span class="u11w-segdot" data-seg="' + i + '"></span><span class="u11w-seglab">' + s.family + '</span><b>' + s.pct + '%</b></div>';
      });
      html += '</div>';
    }
    html += '<div class="u11w-cta"><button type="button" class="u11w-minibtn" data-u11-act="opendetails" data-thread="thread:t-88">' + ic('inbox') + '<span>Open Context details</span></button></div>';
    html += footActs(item);
    return html;
  }

  /* ---------- capacity: completion-capacity forecast (conditional) ---------- */
  function renderCapacity(item, sizeKey) {
    var d = D();
    var runs = d.runs.filter(function (r) { return r.status === 'running'; });
    if (!runs.length) {
      return topStrip(item) + '<div class="u11w-empty quiet">' + ic('gauge') +
        '<p>No active Goal, Crew, or planning run. This widget appears when substantial work is active or being considered.</p></div>';
    }
    var html = topStrip(item, runs.length + ' active');

    runs.forEach(function (run) {
      var fc = run.forecastId ? d.forecastById[run.forecastId] : null;
      var req = run.requested.children != null ? run.requested.children : run.requested.members;
      var admitted = run.admitted.now;
      var queued = run.queued.children != null ? run.queued.children : run.queued.members;
      var waves = run.queued.waves;
      var kindLab = run.kind === 'goal' ? 'Goal' : (run.kind === 'planning_run' ? 'Planning run' : 'Crew');

      html += '<div class="u11w-caprow">';
      html += '<div class="u11w-caphead">';
      html += '<span class="u11w-capkind">' + kindLab + '</span>';
      html += '<span class="u11w-captt">' + run.title + '</span>';
      html += '<button type="button" class="u11w-minibtn" data-u11-act="openrun" data-run="' + run.id + '">Details</button>';
      html += '</div>';
      html += '<div class="u11w-capline"><b>' + req + '</b> requested · <b>' + admitted + '</b> can run now · <b>' + queued + '</b> queued</div>';
      html += '<div class="u11w-capline dim">' + admitted + ' at a time · ' + waves + ' waves';
      if (run.reservedFor && run.reservedFor.length) html += ' · capacity kept aside for ' + run.reservedFor.join(', ');
      html += '</div>';
      if (run.capacity) {
        var c = run.capacity;
        html += '<div class="u11w-capline dim">' + c.hardMax + ' hard max · ' + c.configuredPreferred + ' preferred · ' +
          c.providerAdvertised + ' advertised · ' + c.predictedSustainable + ' sustainable</div>';
      }
      if (fc) {
        html += '<div class="u11w-caprec">' + ic('check') + '<span>' + fc.recommendation + '</span></div>';
        html += '<div class="u11w-capconf">' + fc.confidence + ' · generated ' + T().atClock(fc.generatedAt) + '</div>';
        html += '<div class="u11w-cta"><button type="button" class="u11w-minibtn" data-u11-act="reqforecast" data-run="' + run.id + '">Refresh forecast</button></div>';
      }
      html += '</div>';
    });
    html += '<div class="us-foot">' + ic('info') + '<span>Usage supplies the forecast. Goal Runtime owns admission, scheduling, waves, and dispatch.</span></div>';
    html += footActs(item);
    return html;
  }

  /* ---------- runs: Runs & agents (Standard+) ---------- */
  function renderRuns(item, sizeKey) {
    var d = D();
    var html = topStrip(item, d.runs.length + ' runs');
    d.runs.forEach(function (run) {
      var kindLab = run.kind === 'goal' ? 'Goal' : (run.kind === 'planning_run' ? 'Planning run' : 'Crew');
      var visLab = run.visibility === 'visible' ? 'visible' : (run.visibility === 'internal' ? 'internal' : 'orchestrator');
      var members = run.members || [];
      var running = members.filter(function (m) { return m.state === 'running'; }).length;
      var queued = members.filter(function (m) { return m.state === 'queued'; }).length;
      var done = members.filter(function (m) { return m.state === 'completed'; }).length;

      html += '<div class="u11w-runrow">';
      html += '<div class="u11w-runhead">';
      html += '<span class="u11w-capkind">' + kindLab + '</span>';
      html += '<span class="u11w-captt">' + run.title + '</span>';
      html += '<span class="u11w-vis" title="Owning surface: ' + R().human(run.owningSurface) + ' · visibility: ' + visLab + '">' + visLab + '</span>';
      html += '</div>';
      html += '<div class="u11w-capline dim">' + run.phase + ' · ' + running + ' running · ' + done + ' done · ' + queued + ' queued</div>';
      if (run.timing && sizeKey !== 'S') {
        var tm = run.timing;
        var active = null;
        tm.rows.forEach(function (r) { if (r.label === 'Provider/model active') active = r; });
        html += '<div class="u11w-capline dim">Elapsed ' + T().dur(tm.elapsedMs) +
          (active ? ' · provider active ' + T().dur(active.ms) : '') + '</div>';
      }
      html += '<div class="u11w-cta"><button type="button" class="u11w-minibtn" data-u11-act="openrun" data-run="' + run.id + '">Open run detail</button></div>';
      html += '</div>';
    });
    html += footActs(item);
    return html;
  }

  /* ---------- free: Free Models lens ---------- */
  var FREE_COND_LABEL = {
    request_limited: 'Free, limited', token_day: 'Free, limited', compute_units: 'Free, limited',
    conditional_on_plan: 'Free with account requirements', free_until: 'Free until a date',
    keyless_shared: 'Shared free access', local: 'Local'
  };
  function renderFree(item, sizeKey) {
    var d = D();
    var eligible = d.eligibleFreeModels();
    var html = topStrip(item, 'catalog & routing lens');

    var groups = {};
    eligible.forEach(function (fm) {
      var lab = FREE_COND_LABEL[fm.condition] || fm.label;
      (groups[lab] = groups[lab] || []).push(fm);
    });
    Object.keys(groups).forEach(function (lab) {
      html += '<div class="u11w-freegroup"><div class="u11w-acctfam">' + lab + '</div>';
      groups[lab].forEach(function (fm) {
        var conn = d.connectionById[fm.connectionId];
        var model = d.modelById[fm.modelId];
        var meter = fm.meterId ? d.meterById[fm.meterId] : null;
        var cooling = fm.cooldownUntil && Date.parse(fm.cooldownUntil) > Date.parse(d.meta.now);
        html += '<div class="u11w-freerow' + (cooling ? ' dim' : '') + '">';
        html += '<div class="u11w-freemain"><span class="u11w-planname">' + model.label + '</span>' +
          '<span class="u11w-planpath">' + fm.label + ' · via ' + (conn ? conn.label : '') + '</span></div>';
        if (cooling) html += '<span class="u11w-freedetail warn">Cooldown · back ' + T().when(fm.cooldownUntil, d.meta.now, 'cooldown') + '</span>';
        else {
          if (meter && meter.usedPct != null) html += R().meter(meter.usedPct, toneForPct(meter.usedPct));
          html += '<span class="u11w-freedetail">' + fm.detail + '</span>';
        }
        html += '</div>';
      });
      html += '</div>';
    });

    var flagged = d.freeModels.filter(function (fm) { return !fm.eligible; });
    if (flagged.length && sizeKey !== 'S') {
      html += '<div class="u11w-freegroup"><div class="u11w-acctfam">Changes & issues</div>';
      flagged.forEach(function (fm) {
        html += '<div class="u11w-freerow dim"><div class="u11w-freemain"><span class="u11w-planname">' + d.modelById[fm.modelId].label + '</span>' +
          '<span class="u11w-planpath">' + fm.label + '</span></div><span class="u11w-freedetail">' + fm.detail + '</span></div>';
      });
      html += '</div>';
    }
    html += '<div class="us-foot">' + ic('info') + '<span>Free Models is a routing lens, not a provider or billing identity. Only routes whose underlying source is set up appear. Active probes consume allowance as validation, not user work.</span></div>';
    html += footActs(item);
    return html;
  }

  /* ---------- analytics: stacked token flow ---------- */
  var AN_SERIES = [
    { key: 1, cls: 's-input', label: 'Input' },
    { key: 2, cls: 's-output', label: 'Output' },
    { key: 3, cls: 's-reason', label: 'Reasoning' },
    { key: 4, cls: 's-cache', label: 'Cache read' }
  ];
  function renderAnalytics(item, sizeKey) {
    var d = D();
    var win = (item.cfg && item.cfg.win) || '24h';
    var compare = (item.cfg && item.cfg.compare) || 'none';
    var chart = d.analytics.chart[win];
    var html = topStrip(item, chart.note);

    html += '<div class="u11w-awins">';
    d.analytics.windows.forEach(function (w) {
      html += '<button type="button" class="u11w-minibtn' + (w === win ? ' on' : '') + '" data-u11-act="awin" data-win="' + w + '">' + w + '</button>';
    });
    if (compare === 'prev') {
      var tot = 0;
      chart.cols.forEach(function (c) { tot += c[1] + c[2] + c[3] + c[4]; });
      var prev = Math.round(tot * 0.88);
      var delta = Math.round((tot - prev) / prev * 100);
      html += '<span class="u11w-cmp" title="Demo comparison against the previous ' + win + '">' + ic('trend') +
        '<span>' + (delta >= 0 ? '+' : '') + delta + '% tokens vs previous ' + win + '</span></span>';
    }
    html += '</div>';

    var max = 0;
    chart.cols.forEach(function (col) {
      var tot = col[1] + col[2] + col[3] + col[4];
      if (tot > max) max = tot;
    });
    html += '<div class="u11w-chart">';
    chart.cols.forEach(function (col) {
      var tot = col[1] + col[2] + col[3] + col[4];
      html += '<div class="u11w-col" title="' + col[0] + ' · ' + tot + 'k tokens">';
      html += '<span class="u11w-colbar">';
      AN_SERIES.forEach(function (s) {
        var v = col[s.key];
        if (!v) return;
        html += '<i class="' + s.cls + '" data-h="' + Math.round(v / max * 100) + '" style="height:0%"></i>';
      });
      html += '</span><span class="u11w-collab">' + col[0] + '</span></div>';
    });
    html += '</div>';

    html += '<div class="u11w-legend">';
    AN_SERIES.forEach(function (s) {
      html += '<button type="button" class="u11w-leg" data-u11-act="aser" data-ser="' + s.cls + '"><span class="u11w-legdot ' + s.cls + '"></span>' + s.label + '</button>';
    });
    html += '</div>';
    html += footActs(item);
    return html;
  }

  /* ---------- ledger: grouped logical work + attempts ---------- */
  function attemptRouteLabel(a) {
    var d = D();
    var acct = d.accountById[a.effectiveAccountId || a.requestedAccountId];
    var model = a.effectiveModelId ? d.modelById[a.effectiveModelId] : null;
    var conn = a.connectionId ? d.connectionById[a.connectionId] : null;
    var prod = a.productId ? d.productById[a.productId] : null;
    var parts = [];
    if (model) parts.push(model.label);
    if (acct) parts.push(d.accountLabel(acct.id));
    if (prod) parts.push(prod.label);
    else if (conn) parts.push(conn.label);
    return parts.join(' · ') || 'Unknown route';
  }
  function attemptTokensLabel(item, a) {
    var t = a.tokens || {};
    var parts = [];
    if (t.input != null) parts.push(numfmt(item, t.input) + ' input');
    if (t.output != null) parts.push(numfmt(item, t.output) + ' output');
    if (t.cacheRead != null) parts.push(numfmt(item, t.cacheRead) + ' cache read');
    return parts.join(' · ');
  }
  var STATUS_LABEL = {
    completed: 'completed', running: 'running', failed: 'failed', interrupted: 'interrupted',
    queued: 'queued', replayed: 'replayed'
  };

  function renderLedger(item, sizeKey) {
    var d = D();
    var scope = effScope(item);
    var bucketFilter = (item.cfg && item.cfg.bucket) || 'all';
    var advanced = U11W.disclosure === 'advanced';
    var groups = d.worksWithAttempts(scope);
    var html = topStrip(item, groups.length + ' logical work items');

    var shown = 0;
    groups.forEach(function (g) {
      var attempts = g.attempts.filter(function (a) { return bucketFilter === 'all' || a.bucket === bucketFilter; });
      if (!attempts.length) return;
      shown++;
      var main = attempts.filter(function (a) { return a.bucket === 'main'; })[0] || attempts[0];
      var helpers = attempts.length - 1;
      var subagents = attempts.filter(function (a) { return a.subagent; }).length;
      var kindLab = R().human(g.work.kind);

      html += '<div class="u11w-turncard">';
      html += '<div class="u11w-turnhead">';
      html += '<span class="u11w-turnkind">' + kindLab + '</span>';
      html += '<span class="u11w-turntt">' + g.work.label + '</span>';
      html += '<span class="u11w-turntime">' + (g.work.endedAt ? T().atClock(g.work.endedAt) : 'now') + '</span>';
      html += '</div>';
      html += '<div class="u11w-turnroute">' + attemptRouteLabel(main) + '</div>';
      var tokLab = attemptTokensLabel(item, main);
      if (tokLab) html += '<div class="u11w-turntok">' + tokLab +
        (helpers > 0 ? ' · ' + helpers + ' helper call' + (helpers > 1 ? 's' : '') : '') +
        (subagents > 0 ? ' · ' + subagents + ' subagent' + (subagents > 1 ? 's' : '') : '') + '</div>';
      if (main.mismatch) html += '<div class="u11w-mismatch">' + ic('alert') + '<span>' + main.mismatch.reason + '</span></div>';
      if (main.redirect && main.redirect.note) html += '<div class="u11w-mismatch info">' + ic('info') + '<span>' + main.redirect.note + '</span></div>';

      if (advanced) {
        html += '<div class="u11w-attempts">';
        attempts.forEach(function (a) {
          var stCls = a.status === 'failed' || a.status === 'interrupted' ? ' err' : (a.status === 'queued' ? ' dim' : '');
          html += '<div class="u11w-attrow' + stCls + '">';
          html += '<span class="u11w-attbucket">' + d.buckets[a.bucket] + '</span>';
          html += '<span class="u11w-attpurpose">' + R().human(a.purpose) + '</span>';
          html += '<span class="u11w-attstatus">' + (STATUS_LABEL[a.status] || a.status) + '</span>';
          html += '<span class="u11w-atttok">' + (attemptTokensLabel(item, a) || 'no provider usage') + '</span>';
          if (a.costMicro > 0) html += '<span class="u11w-attcost">' + moneyFmt(a.costMicro) + '</span>';
          html += '<button type="button" class="u11w-minibtn" data-u11-act="openattempt" data-att="' + a.eventId + '">inspect</button>';
          html += '</div>';
        });
        html += '</div>';
      } else {
        html += '<div class="u11w-cta"><button type="button" class="u11w-minibtn" data-u11-act="openattempt" data-att="' + main.eventId + '">Open attempt detail</button></div>';
      }
      html += '</div>';
    });

    if (!shown) html += '<div class="u11w-empty">' + ic('clipboard') + '<p>No usage events in this scope.</p></div>';

    /* historical / removed-account rows always stay inspectable */
    var hist = d.attempts.filter(function (a) { return a.historicalIdentity; });
    if (hist.length && (bucketFilter === 'all')) {
      html += '<div class="u11w-freegroup"><div class="u11w-acctfam">Historical · removed sources</div>';
      hist.forEach(function (a) {
        html += '<div class="u11w-freerow dim"><div class="u11w-freemain"><span class="u11w-planname">' + a.historicalIdentity.label + '</span>' +
          '<span class="u11w-planpath">' + T().stamp(a.startedAt) + ' · ' + attemptTokensLabel(item, a) + '</span></div>' +
          '<span class="u11w-attcost">' + moneyFmt(a.costMicro) + '</span>' +
          '<button type="button" class="u11w-minibtn" data-u11-act="openattempt" data-att="' + a.eventId + '">inspect</button></div>';
      });
      html += '</div>';
    }
    html += footActs(item);
    return denseWrap(item, html);
  }

  /* ---------- operations: maintenance & operations (packet §04) ---------- */
  var OPS_KIND_ICON = { cli_update: 'route', offline_outbox: 'alert', server_continuity: 'check',
    sound_preview: 'check', notification_test: 'check', backup: 'check', project_move: 'check' };
  var OPS_STATUS_CLS = { completed: 'vs-ok', rolled_back: 'vs-warn', failed: 'vs-err', running: 'vs-info', queued: 'vs-mute' };
  function renderOperations(item, sizeKey) {
    var d = D();
    var ops = d.operationsFor();
    var html = topStrip(item, ops.length + ' activities');
    ops.forEach(function (op) {
      var host = d.hostById[op.hostId], env = d.envById[op.envId];
      html += '<div class="u11w-opcard">';
      html += '<div class="u11w-ophead">' + ic(OPS_KIND_ICON[op.kind] || 'check') +
        '<span class="u11w-optt">' + op.title + '</span>' +
        '<span class="vs ' + (OPS_STATUS_CLS[op.status] || 'vs-mute') + '"><span>' + R().human(op.status) + '</span></span></div>';
      html += '<div class="u11w-opcopy">' + op.copy + '</div>';
      if (op.phases && op.phases.length) {
        html += '<div class="u11w-ophases">';
        op.phases.forEach(function (ph) {
          html += '<span class="u11w-ophase"><b>' + ph.label + '</b>' + T().dur(ph.ms) + '</span>';
        });
        html += '</div>';
      }
      if (host || env) {
        html += '<div class="u11w-opline">' + (host ? host.label : '—') + (env ? ' · ' + env.label : '') + '</div>';
      }
      html += '<div class="u11w-opdetail">' + op.detail + '</div>';
      if (op.validationEventId) {
        html += '<div class="u11w-cta"><button type="button" class="u11w-minibtn" data-u11-act="openattempt" data-att="' + op.validationEventId + '">View the verification call</button></div>';
      }
      html += '</div>';
    });
    html += '<div class="us-foot">' + ic('info') + '<span>Maintenance is never model usage. When a maintenance flow verifies with a model, that call appears separately as a validation event.</span></div>';
    html += footActs(item);
    return html;
  }

  /* ---------- tools ---------- */
  function renderTools(item, sizeKey) {
    var d = D();
    var sort = (item.cfg && item.cfg.sort) || 'calls';
    var tools = d.tools.slice().sort(function (a, b) { return b[sort] - a[sort]; });
    var html = topStrip(item, 'last 24h');
    html += '<div class="u11w-tbl"><table class="us-tbl"><thead><tr><th>Tool</th><th>Calls</th><th>p50</th><th>p95</th><th>Err %</th></tr></thead><tbody>';
    tools.forEach(function (t) {
      html += '<tr><td>' + t.tool + (t.recoveries ? ' <span class="u11w-rec" title="' + t.recoveries + ' self-recovery">↺' + t.recoveries + '</span>' : '') + '</td>' +
        '<td class="num">' + t.calls + '</td><td class="num">' + t.p50 + 'ms</td><td class="num">' + t.p95 + 'ms</td>' +
        '<td class="num' + (t.err >= 2 ? ' u11w-hot' : '') + '">' + t.err.toFixed(1) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    d.toolOps.forEach(function (op) {
      html += '<div class="u11w-toolop">' + ic('check') + '<div><b>' + op.copy + '</b><span>' + op.detail + '</span></div></div>';
    });
    html += '<div class="us-foot">' + ic('info') + '<span>Recovered tool calls are not rerun — no duplicate user work, no provider tokens.</span></div>';
    html += footActs(item);
    return html;
  }

  /* ---------- cache: prompt cache per connection ---------- */
  function renderCache(item, sizeKey) {
    var d = D();
    var sort = (item.cfg && item.cfg.sort) || 'save';
    var html = topStrip(item);
    var stats = d.cacheStats.slice();
    stats.sort(function (a, b) {
      if (sort === 'name') return String(a.connectionId).localeCompare(String(b.connectionId));
      if (sort === 'hit') return (b.hit == null ? -1 : b.hit) - (a.hit == null ? -1 : a.hit);
      return (b.save || 0) - (a.save || 0);
    });
    stats.forEach(function (cs) {
      var conn = d.connectionById[cs.connectionId];
      var acct = conn ? d.accountLabel(conn.accountId) : '';
      html += '<div class="u11w-cacherow">';
      html += '<div class="u11w-freemain"><span class="u11w-planname">' + (conn ? conn.label : '') + '</span>' +
        '<span class="u11w-planpath">' + acct + '</span></div>';
      if (cs.state === 'unsupported') {
        html += '<span class="u11w-dim">unsupported</span>';
      } else {
        html += R().meter(Math.round(cs.hit), toneForPct(100 - cs.hit)) ;
        html += '<span class="u11w-cacheval">' + (cs.hit != null ? cs.hit + '%' : '—') + ' · −$' + cs.save.toFixed(2) + '</span>';
      }
      if (cs.note) html += '<span class="u11w-freedetail">' + cs.note + '</span>';
      html += '</div>';
    });
    html += '<div class="us-foot">' + ic('info') + '<span>These are per-provider prompt-cache figures — distinct from the context-ring cache metric. A missing cache-write field is “—”, never zero.</span></div>';
    html += footActs(item);
    return html;
  }

  /* ---------- signals ---------- */
  function renderSignals(item, sizeKey) {
    var d = D(), s = d.signals;
    var html = topStrip(item, s.grade + ' · ' + s.score);
    html += '<div class="u11w-grade"><span class="u11w-gradenum">' + s.grade + '</span><span class="u11w-gradesub">efficiency · ' + s.score + '/100</span></div>';
    function sigList(title, arr, cls) {
      if (!arr.length) return '';
      var h = '<div class="u11w-siglist"><div class="u11w-acctfam">' + title + '</div>';
      arr.forEach(function (sg) { h += '<div class="u11w-sig ' + cls + '">' + ic(cls === 'win' ? 'check' : (cls === 'risk' ? 'alert' : 'trend')) + '<span>' + sg.text + '</span></div>'; });
      return h + '</div>';
    }
    html += sigList('Wins', s.wins, 'win');
    html += sigList('Improvements', s.improvements, 'imp');
    html += sigList('Risks', s.risks, 'risk');
    html += footActs(item);
    return html;
  }

  /* ---------- authority: source authority (Advanced only) ---------- */
  function renderAuthority(item, sizeKey) {
    var d = D();
    var counts = {};
    d.attempts.forEach(function (a) {
      counts[a.sourceClass] = (counts[a.sourceClass] || 0) + 1;
    });
    var html = topStrip(item, 'raw provenance');
    html += '<div class="u11w-authgrid">';
    Object.keys(counts).sort().forEach(function (k) {
      html += '<div class="u11w-splitrow"><span>' + R().human(k) + '</span><b>' + counts[k] + ' events</b></div>';
    });
    html += '</div>';
    html += '<div class="u11w-freegroup"><div class="u11w-acctfam">Settlement & freshness</div>';
    html += '<div class="u11w-splitrow"><span>Projection freshness</span><b>' + d.meta.projectionFreshness + '</b></div>';
    html += '<div class="u11w-splitrow"><span>Projection health</span><b>' + d.meta.projectionHealth + '</b></div>';
    html += '<div class="u11w-splitrow"><span>Next auto-refresh</span><b>' + T().atClock(d.meta.nextAutoRefresh) + '</b></div>';
    html += '<div class="u11w-splitrow"><span>Retention</span><b>' + d.meta.retentionDays + ' days</b></div>';
    html += '</div>';

    /* catalog refresh + probe evidence (Hermes §9) — operational telemetry, not user work */
    html += '<div class="u11w-freegroup"><div class="u11w-acctfam">Catalog & probes</div>';
    d.catalogEvents.forEach(function (ce) {
      html += '<div class="u11w-toolop">' + ic('refresh') + '<div><b>' + ce.copy + '</b><span>' + ce.detail +
        ' · ' + R().human(ce.source) + ' · ' + R().human(ce.status) + ' · ' + T().atClock(ce.at) + '</span></div></div>';
    });
    var probes = d.attempts.filter(function (a) { return a.bucket === 'validation' && a.purpose === 'probe'; });
    probes.forEach(function (pr) {
      var model = d.modelById[pr.effectiveModelId || pr.requestedModelId];
      html += '<div class="u11w-toolop">' + ic('target') + '<div><b>Active probe · ' + (model ? model.label : 'model') + '</b><span>' +
        (attemptTokensLabel(item, pr) || 'no provider usage') + ' · attributed to validation, never user work · ' + T().atClock(pr.startedAt) + '</span></div></div>';
    });
    html += '</div>';
    html += '<div class="us-foot">' + ic('info') + '<span>Route snapshots, receipt refs, pricing versions and source authority live here — never in the Essentials view. Absent is not zero; unknown is not unavailable.</span></div>';
    html += footActs(item);
    return html;
  }

  /* ================================================================
     TYPE REGISTRY
     ================================================================ */
  var TYPES = {
    plans: { label: 'Plans & limits', icon: 'dial', span: [4, 9],
      desc: 'Included allowances, pressure, resets, and what happens next',
      render: renderPlans,
      config: function (item) { return [
        { key: 'sort', label: 'Sort', type: 'select', options: ['pressure', 'name'], value: (item.cfg && item.cfg.sort) || 'pressure' },
        { key: 'topn', label: 'Top N', type: 'select', options: ['3', '5', '8'], value: String((item.cfg && item.cfg.topn) || '5') },
        { key: 'next', label: 'What happens next', type: 'select', options: ['on', 'off'], value: (item.cfg && item.cfg.next) || 'on' },
        densitySpec(item),
        scopeSelectSpec(item)
      ]; } },
    costs: { label: 'Costs & spending', icon: 'wallet', span: [3, 8],
      desc: 'This month’s spend, API vs plan split, burn and forecast',
      render: renderCosts,
      config: function (item) { return [
        { key: 'mode', label: 'Provider breakdown', type: 'select', options: ['cards', 'table'], value: (item.cfg && item.cfg.mode) || 'cards' },
        { key: 'numfmt', label: 'Numbers', type: 'select', options: ['compact', 'full'], value: (item.cfg && item.cfg.numfmt) || 'compact' },
        scopeSelectSpec(item)
      ]; } },
    accounts: { label: 'Accounts & connections', icon: 'users', span: [3, 9],
      desc: 'Configured accounts grouped by provider, with connection state',
      render: renderAccounts,
      config: function (item) { return [
        { key: 'group', label: 'Group by', type: 'select', options: ['family', 'pressure'], value: (item.cfg && item.cfg.group) || 'family' },
        densitySpec(item),
        scopeSelectSpec(item)
      ]; } },
    attention: { label: 'Attention', icon: 'shield', span: [2, 7],
      desc: 'Anomaly & quota guard decisions with their why',
      render: renderAttention,
      config: function (item) { return [
        { key: 'state', label: 'Show', type: 'select', options: ['attention', 'all'], value: (item.cfg && item.cfg.state) || 'attention' }
      ]; } },
    context: { label: 'Context & cache', icon: 'inbox', span: [2, 7],
      desc: 'Current window, cache hit, and efficiency summary',
      render: renderContext,
      config: function (item) { return [scopeSelectSpec(item)]; } },
    capacity: { label: 'Completion capacity', icon: 'gauge', span: [3, 8],
      desc: 'Is there enough provider capacity to finish the active work?',
      render: renderCapacity,
      config: function (item) { return [scopeSelectSpec(item)]; } },
    runs: { label: 'Runs & agents', icon: 'chip', span: [3, 9],
      desc: 'Goals, planning runs and Crews with admitted vs queued members',
      render: renderRuns,
      config: function (item) { return [scopeSelectSpec(item)]; } },
    free: { label: 'Free models', icon: 'spark', span: [3, 8],
      desc: 'Configured free routes by condition — a routing lens',
      render: renderFree,
      config: function (item) { return [scopeSelectSpec(item)]; } },
    analytics: { label: 'Token analytics', icon: 'trend', span: [4, 9],
      desc: 'Input, output, reasoning and cache traffic, stacked',
      render: renderAnalytics,
      config: function (item) { return [
        { key: 'win', label: 'Window', type: 'select', options: ['5h', '24h', '7d'], value: (item.cfg && item.cfg.win) || '24h' },
        { key: 'compare', label: 'Compare', type: 'select', options: ['none', 'prev'], value: (item.cfg && item.cfg.compare) || 'none' },
        scopeSelectSpec(item)
      ]; } },
    ledger: { label: 'Ledger', icon: 'clipboard', span: [4, 10],
      desc: 'One immutable event per real attempt, grouped under logical work',
      render: renderLedger,
      config: function (item) {
        var opts = ['all'].concat(Object.keys(D().buckets));
        return [
          { key: 'bucket', label: 'Activity bucket', type: 'select', options: opts, value: (item.cfg && item.cfg.bucket) || 'all' },
          densitySpec(item),
          scopeSelectSpec(item)
        ];
      } },
    operations: { label: 'Maintenance & operations', icon: 'route', span: [2, 10],
      desc: 'CLI updates, sync, backups, previews — never model tokens',
      render: renderOperations,
      config: function (item) { return [scopeSelectSpec(item)]; } },
    tools: { label: 'Tool usage', icon: 'chip', span: [3, 7],
      desc: 'Latency and error tax by tool, with self-recovery',
      render: renderTools,
      config: function (item) { return [
        { key: 'sort', label: 'Sort', type: 'select', options: ['calls', 'p50', 'p95', 'err'], value: (item.cfg && item.cfg.sort) || 'calls' }
      ]; } },
    cache: { label: 'Prompt cache', icon: 'layers', span: [2, 7],
      desc: 'Per-connection prompt-cache hit and savings',
      render: renderCache,
      config: function (item) { return [
        { key: 'sort', label: 'Sort', type: 'select', options: ['save', 'hit', 'name'], value: (item.cfg && item.cfg.sort) || 'save' },
        scopeSelectSpec(item)
      ]; } },
    signals: { label: 'Signals', icon: 'spark', span: [3, 8],
      desc: 'Wins, improvements and risks',
      render: renderSignals,
      config: function (item) { return []; } },
    authority: { label: 'Source authority', icon: 'book', span: [2, 6],
      desc: 'Provenance, settlement and freshness (Advanced)',
      render: renderAuthority,
      config: function (item) { return []; } }
  };

  /* ---------- register on the shared engine ---------- */
  U11W.register = function () {
    var W = window.PMWidgets;
    if (!W || !W.register) return;
    Object.keys(TYPES).forEach(function (id) {
      var t = TYPES[id];
      W.register(id, {
        icon: window.PMIcon ? window.PMIcon(t.icon, '') : '',
        iconKey: t.icon,
        label: t.label,
        desc: t.desc,
        span: t.span.slice(),
        render: t.render,
        config: t.config
      });
    });
  };
  U11W.TYPES = TYPES;
  U11W.CATALOG = Object.keys(TYPES);

  /* ================================================================
     INSTANCE ACTIONS — duplicate / reset / scope / drill-down
     Duplicate & reset persist through the documented {v:2} storage
     envelope, so they are stable independent of any filename.
     ================================================================ */
  function keyFor(pageId) { return 'pmw:' + pageId; }
  U11W.persist = function (canvas) {
    var pmw = canvas._pmw;
    if (!pmw) return;
    try {
      localStorage.setItem(keyFor(pmw.pageId), JSON.stringify({
        v: 2,
        items: pmw.items.map(function (it) { return { uid: it.uid, type: it.type, c: it.c, r: it.r, cfg: it.cfg || {}, focus: !!it.focus }; })
      }));
    } catch (e) {}
  };
  function newUid() { return 'w11_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6); }
  function deepCopyCfg(cfg) { return JSON.parse(JSON.stringify(cfg || {})); }

  U11W.duplicate = function (canvas, uidv) {
    var pmw = canvas._pmw;
    if (!pmw) return;
    var idx = -1, src = null;
    for (var i = 0; i < pmw.items.length; i++) if (pmw.items[i].uid === uidv) { idx = i; src = pmw.items[i]; }
    if (!src) return;
    var copy = { uid: newUid(), type: src.type, c: src.c, r: src.r, cfg: deepCopyCfg(src.cfg), focus: false };
    pmw.items.splice(idx + 1, 0, copy);
    U11W.persist(canvas);
    if (pmw.handle) pmw.handle.rerender();
    window.U11.dispatch('cmd.widget.add', { type: src.type, via: 'duplicate' });
    if (window.toast) window.toast('Widget duplicated');
  };
  U11W.resetInstance = function (canvas, uidv) {
    var pmw = canvas._pmw;
    if (!pmw) return;
    var it = null;
    for (var i = 0; i < pmw.items.length; i++) if (pmw.items[i].uid === uidv) it = pmw.items[i];
    if (!it) return;
    it.cfg = {};
    U11W.persist(canvas);
    if (pmw.handle) pmw.handle.rerender(uidv);
    if (window.toast) window.toast('Widget settings reset to defaults');
  };

  /* The shared engine applies config-form values on click (checkboxes);
     selects need a change listener. U11-layer wiring, no shared edits:
     remember which widget's kebab/config is open, then apply changes. */
  var cfgChangeWired = false;
  function wireCfgChange() {
    if (cfgChangeWired) return;
    cfgChangeWired = true;
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || !t.hasAttribute || !t.hasAttribute('data-cfg')) return;
      var sprout = t.closest('.pm-sprout');
      if (!sprout) return;
      var canvas = null;
      var canvases = document.querySelectorAll('[data-u11-page]');
      for (var i = 0; i < canvases.length; i++) {
        if (canvases[i]._u11CfgUid) { canvas = canvases[i]; break; }
      }
      if (!canvas || !canvas._pmw) return;
      var uid = canvas._u11CfgUid;
      var it = null;
      for (var j = 0; j < canvas._pmw.items.length; j++) if (canvas._pmw.items[j].uid === uid) it = canvas._pmw.items[j];
      if (!it) return;
      it.cfg = it.cfg || {};
      var k = t.getAttribute('data-cfg');
      var raw = t.type === 'checkbox' ? t.checked : t.value;
      if (k === 'scope') raw = normScopeVal(raw);
      it.cfg[k] = raw;
      U11W.persist(canvas);
      if (canvas._pmw.handle) canvas._pmw.handle.rerender(uid);
    }, true);
  }

  /* delegated per-canvas wiring for U11 body controls */
  U11W.wireCanvas = function (canvas) {
    if (canvas._u11Wired) return;
    canvas._u11Wired = true;
    wireCfgChange();
    canvas.addEventListener('click', function (e) {
      var keb = e.target.closest('[data-pmw-kebab]');
      if (keb) {
        var uw = keb.closest('.uw');
        canvas._u11CfgUid = uw ? uw.getAttribute('data-uid') : null;
      }
    }, true);
    canvas.addEventListener('click', function (e) {
      var more = e.target.closest('[data-u11-more]');
      if (more && e.target.closest('.u11w-more-t')) {
        var b = more.querySelector('.u11w-more-b');
        if (b) {
          var open = !b.hidden;
          b.hidden = open;
          var lab = more.querySelector('.u11w-more-t span');
          if (lab) lab.textContent = open ? lab.textContent.replace(/^Hide/, 'Show') : lab.textContent.replace(/^Show/, 'Hide');
          if (!open && window.USrender) window.USrender.animateFills(b);
        }
        return;
      }
      var act = e.target.closest('[data-u11-act]');
      if (!act) return;
      var uw = act.closest('.uw');
      var uidv = uw ? uw.getAttribute('data-uid') : null;
      var a = act.getAttribute('data-u11-act');
      if (a === 'duplicate') { U11W.duplicate(canvas, uidv); return; }
      if (a === 'resetcfg') { U11W.resetInstance(canvas, uidv); return; }
      if (a === 'usescope') {
        var it = null;
        for (var i = 0; i < canvas._pmw.items.length; i++) if (canvas._pmw.items[i].uid === uidv) it = canvas._pmw.items[i];
        if (it) { it.cfg.scope = 'inherit'; U11W.persist(canvas); canvas._pmw.handle.rerender(uidv); }
        return;
      }
      if (a === 'awin') {
        var itw = null;
        for (var j = 0; j < canvas._pmw.items.length; j++) if (canvas._pmw.items[j].uid === uidv) itw = canvas._pmw.items[j];
        if (itw) { itw.cfg = itw.cfg || {}; itw.cfg.win = act.getAttribute('data-win'); U11W.persist(canvas); canvas._pmw.handle.rerender(uidv); }
        return;
      }
      if (a === 'aser') {
        var chart = act.closest('.uw-body');
        if (chart) {
          var ser = act.getAttribute('data-ser');
          chart.classList.toggle('mute-' + ser);
          act.classList.toggle('muted');
        }
        return;
      }
      if (a === 'openrun') {
        if (window.U11RunDetail) window.U11RunDetail.open(act.getAttribute('data-run'));
        return;
      }
      if (a === 'openattempt') {
        if (window.U11RunDetail) window.U11RunDetail.openAttempt(act.getAttribute('data-att'));
        return;
      }
      if (a === 'opendetails') {
        if (window.U11Context) window.U11Context.openDetails(act.getAttribute('data-thread') || 'thread:t-88');
        return;
      }
      if (a === 'opensettings') {
        document.dispatchEvent(new CustomEvent('u11:opensettings'));
        return;
      }
      if (a === 'reconnect') {
        var res = window.U11.deepLink({ surface: 'settings', manager: 'providers',
          account_id: act.getAttribute('data-acct'), section: 'routing', focus_reason: 'reconnect' });
        if (window.toast) window.toast(res.toast);
        return;
      }
      if (a === 'usenext') {
        var acctId = act.getAttribute('data-acct');
        var resU = window.U11.dispatch('cmd.provider.switch_route', { accountId: acctId });
        var lab = window.U11.accountLabel(acctId);
        if (window.toast) window.toast('Future work will prefer ' + lab + '. In-flight requests are never moved.');
        return;
      }
      if (a === 'openmgmt') {
        var famId = act.getAttribute('data-fam');
        var resM = window.U11.dispatch('cmd.provider.usage.open_management', { familyId: famId });
        if (window.toast) window.toast(resM.toast);
        return;
      }
      if (a === 'reqforecast') {
        var resF = window.U11.dispatch('cmd.usage.forecast.request', { runId: act.getAttribute('data-run') });
        if (window.toast) window.toast(resF.toast);
        return;
      }
    });
  };

  /* animate chart bars + fills after bodies render */
  U11W.animateBody = function (scope) {
    var Rv = R();
    if (!Rv) return;
    Rv.animateFills(scope);
    if (Rv.animateCounters) Rv.animateCounters(scope);
    scope.querySelectorAll('.u11w-colbar i[data-h]').forEach(function (el, i) {
      var h = el.getAttribute('data-h');
      el.style.transition = 'height 480ms cubic-bezier(0.22,1,0.36,1) ' + Math.min(i * 12, 240) + 'ms';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.height = h + '%'; }); });
    });
  };

  window.U11W = U11W;
})();
