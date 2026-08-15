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

  /* ---------- shared body furniture ----------
     Video grammar: data-first cards. The scope strip renders ONLY when a
     widget overrides the page scope; everything else is rows, meters,
     tiles, a footnote and (where a drill-in exists) one CTA. */
  function topStrip(item, label) {
    if (!scopeOverridden(item)) return '';
    var sn = D().scopeNode(effScope(item));
    return '<div class="u11w-top"><span class="u11w-scopechip on" title="This widget overrides the page scope">' +
      ic('filter') + '<span>' + sn.label + '</span>' +
      '<button type="button" class="u11w-minibtn" data-u11-act="usescope">Use page scope</button></span>' +
      (label ? '<span class="u11w-toplab">' + label + '</span>' : '') + '</div>';
  }

  /* ---------- video-grammar builders ----------
     Three type tiers: bold tabular value / muted sentence-case label / tiny
     unit. One row grammar: ring bullet + label left, value right. Color
     lives on data only (per-series hues), chrome stays neutral. */
  function unitHTML(u) { return u ? '<i class="u11w-unit">' + u + '</i>' : ''; }
  function numHTML(v, o) {
    o = o || {};
    var f = o.fmt || 'num', init;
    if (v == null) init = '\u2014';
    else if (f === 'num') init = (o.prefix || '') + fmt().num(Math.round(v));
    else if (f === 'tok') init = (o.prefix || '') + fmt().tok(v);
    else if (f === 'cost') init = fmt().cost(v);
    else if (f === 'dec') init = (o.prefix || '') + v.toFixed(o.dec != null ? o.dec : 1);
    else init = (o.prefix || '') + String(v);
    return '<b class="u11w-num" data-ucnt="' + (v == null ? 0 : v) + '" data-ufmt="' + f + '"' +
      (o.dec != null ? ' data-udec="' + o.dec + '"' : '') +
      (o.prefix ? ' data-uprefix="' + o.prefix + '"' : '') +
      (v == null ? ' data-unull="1"' : '') + '>' + init + '</b>';
  }
  /* static value (no count-up) for strings that are not tweenable numbers */
  function pval(str, u) { return '<span class="u11w-vval"><b class="u11w-num static">' + str + '</b>' + unitHTML(u) + '</span>'; }
  function valHTML(v, u, o) { return '<span class="u11w-vval">' + numHTML(v, o) + unitHTML(u) + '</span>'; }
  function vrow(hue, label, val, cls) {
    return '<div class="u11w-vrow' + (cls ? ' ' + cls : '') + '"><span class="u11w-vdot ' + (hue || 'h-mute') + '"></span>' +
      '<span class="u11w-vlab">' + label + '</span>' + val + '</div>';
  }
  function sub(line) { return line ? '<div class="u11w-sub">' + line + '</div>' : ''; }
  function mrow(label, val, pct, fillCls) {
    return '<div class="u11w-mrow"><div class="u11w-mtop"><span class="u11w-mlab">' + label + '</span>' + val + '</div>' +
      '<span class="us-track u11w-track"><span class="us-fill ' + (fillCls || 'ok') + '" data-fill="' + (pct || 0) + '" style="--wf:' + (pct || 0) + '%"></span></span></div>';
  }
  function tiles(list) {
    var h = '<div class="u11w-tiles">';
    list.forEach(function (t) {
      h += '<div class="u11w-tile"><div class="u11w-tval">' + numHTML(t.v, t.o) + unitHTML(t.u) + '</div>' +
        '<div class="u11w-tlab">' + t.label + '</div>' +
        '<span class="u11w-tico ' + (t.hue || 'h-mute') + '">' + ic(t.icon) + '</span></div>';
    });
    return h + '</div>';
  }
  function note(text) { return '<div class="u11w-note">' + text + '</div>'; }
  function cta(label, attrs) {
    return '<div class="u11w-cta"><button type="button" class="u11w-ctab" ' + attrs + '><span>' + label + '</span>' + ic('chevR') + '</button></div>';
  }
  function ring(pct, strokeVar, label) {
    return '<span class="u11w-ring" role="img" aria-label="' + (label || 'value') + ' ' + pct + '%"><svg viewBox="0 0 64 64">' +
      '<circle class="dbg" cx="32" cy="32" r="26"></circle>' +
      '<circle class="dfill" cx="32" cy="32" r="26" stroke="' + strokeVar + '" data-pct="' + pct + '" style="stroke-dasharray:163.4;stroke-dashoffset:163.4"></circle></svg></span>';
  }
  function dots(n, total, hue) {
    var h = '<span class="u11w-dots" title="' + n + ' of ' + total + '">';
    for (var i = 0; i < total; i++) h += '<i class="' + (i < n ? 'on ' + (hue || 'h-lime') : '') + '"></i>';
    return h + '</span>';
  }
  function spark(vals, hue) {
    var max = Math.max.apply(null, vals.concat([1]));
    var h = '<span class="u11w-spark">';
    vals.forEach(function (v) { h += '<i class="' + (hue || 'sp-purple') + '" data-h="' + Math.round(v / max * 100) + '" style="height:8%"></i>'; });
    return h + '</span>';
  }
  /* red->green index bar; the mask dims the region beyond the value */
  function gradBar(pct) {
    return '<span class="u11w-grad" title="' + pct + '%"><span class="u11w-gradmask" data-gm="' + (100 - (pct || 0)) + '"></span></span>';
  }
  var SERIES_FILLS = ['f-blue', 'f-pink', 'f-orange', 'f-lime', 'f-purple', 'f-teal'];
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
      var path = conn ? d.accountLabel(conn.accountId) + ' · ' + conn.label : '';
      var pct = m.usedPct;
      var tone = toneForPct(pct);
      var fill = tone === 'hot' ? 'f-pink' : tone === 'warn' ? 'f-orange' : 'f-lime';
      var resetTxt = '';
      if (m.resetAt) resetTxt = t.when(m.resetAt, d.meta.now, 'reset');
      else if (m.expiresAt) resetTxt = t.when(m.expiresAt, d.meta.now, 'expiry');
      else if (m.vs === 'unknown') resetTxt = 'Reset time unavailable';

      html += '<div class="u11w-prow">';
      if (pct != null) {
        html += mrow(p.label + vsChipIf(m.vs), valHTML(pct, '%'), pct, fill);
      } else {
        html += vrow('h-mute', p.label + vsChipIf(m.vs), '<span class="u11w-vval"><b class="u11w-num static">—</b></span>');
      }
      html += sub(path + (resetTxt ? (path ? ' · ' : '') + resetTxt : '') +
        (m.vs === 'unknown' && m.note ? ' · ' + m.note : '') +
        (m.vs === 'unknown' && pct == null ? ' · observed use ' + numfmt(item, m.used) : ''));
      row.meters.forEach(function (mm) {
        if (mm === row.top) return;
        if (mm.vs === 'unavailable' && mm.estimate) {
          html += '<div class="u11w-sub estimate">' + ic('trend') + '<span>' + mm.label +
            ' · Provider data unavailable · PM estimate ' + mm.estimate.usedPct + '% · ' + mm.estimate.conf + ' confidence</span></div>';
        }
      });
      if (showNext && !tiny && d.continuation[p.id]) {
        html += '<div class="u11w-next">' + ic('route') + '<span>' + d.continuation[p.id].whatHappensNext + '</span></div>';
      }
      html += '</div>';
    });

    if (rows.length > shown.length) {
      html += '<div class="u11w-more" data-u11-more="plans">' +
        '<button type="button" class="u11w-minibtn u11w-more-t">' + ic('chevD') + '<span>Other ' + (rows.length - shown.length) + ' products</span></button>' +
        '<div class="u11w-more-b" hidden>' + rows.slice(shown.length).map(function (row) {
          var m = row.top, pct = m.usedPct;
          var tone = toneForPct(pct);
          return '<div class="u11w-vrow slim"><span class="u11w-vdot ' + (pct == null ? 'h-mute' : tone === 'hot' ? 'h-pink' : tone === 'warn' ? 'h-orange' : 'h-lime') + '"></span>' +
            '<span class="u11w-vlab">' + row.product.label + '</span>' +
            (pct != null ? valHTML(pct, '%') : '<span class="u11w-vval u11w-dimtxt">limit not exposed</span>') + '</div>';
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
    var html = topStrip(item);

    html += '<div class="u11w-hero">';
    html += '<span class="u11w-heroval">' + numHTML(spent / 1e6, { fmt: 'cost' }) + '</span>';
    html += '<span class="u11w-herosub">spent of ' + moneyFmt(limit) + ' spending limit · warn at ' + c.warningThresholdPct + '%</span>';
    html += '</div>';
    html += mrow('Spending limit used', valHTML(pct, '%'), pct, tone === 'hot' ? 'f-pink' : tone === 'warn' ? 'f-orange' : 'f-lime');

    html += '<div class="u11w-rows">';
    html += vrow('h-blue', 'API-billed', '<span class="u11w-vval">' + numHTML(c.apiBilledMicro / 1e6, { fmt: 'cost' }) + '</span>');
    html += vrow('h-lime', 'Plan-included', '<span class="u11w-vval">' + numHTML(c.planIncludedMicro / 1e6, { fmt: 'cost' }) + '</span>');
    html += vrow('h-mute', 'Burn', pval('$' + c.burn.perHour.toFixed(2) + '/h · $' + c.burn.perDay.toFixed(2) + '/d'), 'dim');
    html += vrow('h-mute', 'Forecast', pval(moneyFmt(c.forecastMonthMicro) + ' by month end'), 'dim');
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
      } else if (fams.length) {
        html += '<div class="u11w-fams">';
        fams.forEach(function (f, i) {
          var fp = Math.round(f.micro / spent * 100);
          html += mrow(d.familyById[f.familyId].label, pval(moneyFmt(f.micro)), fp, SERIES_FILLS[i % SERIES_FILLS.length]);
        });
        html += '</div>';
      }
    }
    html += note('One cost authority · the API/plan split is a projection, not a second model. Spending limit is user-controlled, not a plan allowance.');
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
    var ok = a.state === 'ready';
    var html = '<div class="u11w-acctrow">';
    html += '<span class="u11w-vdot ' + (ok ? 'h-lime' : 'h-orange') + (ok ? '' : ' pulse') + '"></span>';
    html += '<div class="u11w-amain">';
    html += '<div class="u11w-atop"><span class="u11w-aname">' + a.label + '</span><span class="u11w-adetail">' + a.detail + '</span></div>';
    if (a.attention) html += '<div class="u11w-attn">' + ic('alert') + '<span>' + a.attention + '</span>' +
      '<button type="button" class="u11w-minibtn" data-u11-act="reconnect" data-acct="' + a.id + '">Reconnect</button></div>';
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
        html += sub('+' + (accts.length - shownAccts.length) + ' more in this family');
      }
      html += '</div>';
    });

    if (!any) html += '<div class="u11w-empty">' + ic('users') + '<p>No accounts in this scope.</p></div>';
    html += note('Using an account collapses to “Using Personal OpenAI · ChatGPT plan”. Requested-vs-used mismatches surface only when they matter.');
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
      html += '<div class="u11w-ghead"><span class="u11w-gico ' + cls + '">' + ic(g.state === 'blocked' ? 'shield' : (g.state === 'warn' ? 'alert' : 'check')) + '</span>' +
        '<span class="u11w-gt">' + g.title + '</span><span class="u11w-gtime">' + T().atClock(g.at) + '</span></div>';
      html += sub(g.where);
      html += '<div class="u11w-gbody">' + g.body + '</div>';
      html += '<div class="u11w-more" data-u11-more="g' + g.id + '">' +
        '<button type="button" class="u11w-minibtn u11w-more-t">' + ic('chevD') + '<span>Why</span></button>' +
        '<div class="u11w-more-b" hidden>' + g.why.map(function (w) {
          return vrow('h-mute', w[0], pval(w[1]));
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
    var html = topStrip(item);

    html += '<div class="u11w-hero">';
    html += '<span class="u11w-heroval">' + numHTML(ctx.used, { fmt: 'tok' }) + '<i class="u11w-unit">/ ' + fmt().tok(ctx.limit).replace('.0k', 'k') + '</i></span>';
    html += '<span class="u11w-herosub">' + ctx.pct + '% of the current effective window · ' + th.title + '</span>';
    html += '</div>';
    html += mrow('Window used', valHTML(ctx.pct, '%'), ctx.pct, ctx.pct >= 90 ? 'f-pink' : ctx.pct >= 70 ? 'f-orange' : 'f-teal');

    html += '<div class="u11w-rows">';
    html += vrow('h-teal', 'Context cache hit', valHTML(ctx.cacheHitRate, '%'));
    var saved = d.cacheStats.reduce(function (s, cs) { return s + (cs.save || 0); }, 0);
    html += vrow('h-lime', 'Prompt-cache saved today', pval('$' + saved.toFixed(2)));
    html += vrow('h-mute', 'Last activity', pval(T().atClock(ctx.lastActivityAt)), 'dim');
    html += '</div>';

    if (sizeKey !== 'S') {
      var SEG_HUES = ['h-blue', 'h-pink', 'h-orange', 'h-lime'];
      html += '<div class="u11w-rows">';
      ctx.segments.slice(0, 4).forEach(function (s, i) {
        html += vrow(SEG_HUES[i], s.family, valHTML(s.pct, '%'));
      });
      html += '</div>';
    }
    html += cta('Open Context details', 'data-u11-act="opendetails" data-thread="thread:t-88"');
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
    var html = topStrip(item);

    var totReq = 0, totAdm = 0, totQue = 0, totWav = 0;
    runs.forEach(function (run) {
      var req = run.requested.children != null ? run.requested.children : run.requested.members;
      var adm = run.admitted.now;
      var que = run.queued.children != null ? run.queued.children : run.queued.members;
      totReq += req; totAdm += adm; totQue += que; totWav += run.queued.waves;
    });
    html += tiles([
      { v: totReq, label: 'Requested', icon: 'gauge', hue: 'h-blue' },
      { v: totAdm, label: 'Can run now', icon: 'check', hue: 'h-lime' },
      { v: totQue, label: 'Queued', icon: 'inbox', hue: 'h-orange' },
      { v: totWav, label: 'Waves', icon: 'layers', hue: 'h-purple' }
    ]);

    runs.forEach(function (run) {
      var fc = run.forecastId ? d.forecastById[run.forecastId] : null;
      var req = run.requested.children != null ? run.requested.children : run.requested.members;
      var admitted = run.admitted.now;
      var queued = run.queued.children != null ? run.queued.children : run.queued.members;
      var waves = run.queued.waves;
      var kindLab = run.kind === 'goal' ? 'Goal' : (run.kind === 'planning_run' ? 'Planning run' : 'Crew');

      html += '<div class="u11w-prow">';
      html += '<div class="u11w-atop"><span class="u11w-aname">' + run.title + '</span><span class="u11w-kind">' + kindLab + '</span></div>';
      html += '<div class="u11w-rows">';
      html += vrow('h-blue', 'Requested', valHTML(req));
      html += vrow('h-lime', 'Can run now', valHTML(admitted));
      html += vrow('h-orange', 'Queued', valHTML(queued));
      html += '</div>';
      var subTxt = admitted + ' at a time · ' + waves + ' waves';
      if (run.reservedFor && run.reservedFor.length) subTxt += ' · capacity kept aside for ' + run.reservedFor.join(', ');
      html += sub(subTxt);
      if (run.capacity) {
        var cap = run.capacity;
        html += '<div class="u11w-sub dimtxt u11w-capenv">' + cap.hardMax + ' hard max · ' + cap.configuredPreferred +
          ' preferred · ' + cap.providerAdvertised + ' advertised · ' + cap.predictedSustainable + ' sustainable</div>';
      }
      if (fc) {
        html += '<div class="u11w-next ok">' + ic('check') + '<span>' + fc.recommendation + '</span></div>';
        html += sub(fc.confidence + ' · generated ' + T().atClock(fc.generatedAt));
        html += cta('Refresh forecast', 'data-u11-act="reqforecast" data-run="' + run.id + '"');
      }
      html += cta('Open run detail', 'data-u11-act="openrun" data-run="' + run.id + '"');
      html += '</div>';
    });
    html += note('Usage supplies the forecast. Goal Runtime owns admission, scheduling, waves, and dispatch.');
    html += footActs(item);
    return html;
  }

  /* ---------- runs: Runs & agents (Standard+) ---------- */
  function renderRuns(item, sizeKey) {
    var d = D();
    var html = topStrip(item);
    d.runs.forEach(function (run) {
      var kindLab = run.kind === 'goal' ? 'Goal' : (run.kind === 'planning_run' ? 'Planning run' : 'Crew');
      var visLab = run.visibility === 'visible' ? 'visible' : (run.visibility === 'internal' ? 'internal' : 'orchestrator');
      var members = run.members || [];
      var running = members.filter(function (m) { return m.state === 'running'; }).length;
      var queued = members.filter(function (m) { return m.state === 'queued'; }).length;
      var done = members.filter(function (m) { return m.state === 'completed'; }).length;

      html += '<div class="u11w-prow">';
      html += '<div class="u11w-atop"><span class="u11w-aname">' + run.title + '</span><span class="u11w-kind">' + kindLab + '</span></div>';
      html += '<div class="u11w-rows">';
      html += vrow('h-lime', 'Running', valHTML(running));
      html += vrow('h-blue', 'Done', valHTML(done));
      html += vrow('h-orange', 'Queued', valHTML(queued));
      html += '</div>';
      var subTxt = run.phase + ' · ' + visLab;
      if (run.timing && sizeKey !== 'S') {
        var tm = run.timing;
        var active = null;
        tm.rows.forEach(function (r) { if (r.label === 'Provider/model active') active = r; });
        subTxt += ' · elapsed ' + T().dur(tm.elapsedMs) +
          (active ? ' · provider active ' + T().dur(active.ms) : '');
      }
      html += sub(subTxt);
      html += cta('Open run detail', 'data-u11-act="openrun" data-run="' + run.id + '" title="Owning surface: ' + R().human(run.owningSurface) + ' · visibility: ' + visLab + '"');
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
        html += '<div class="u11w-prow' + (cooling ? ' dim' : '') + '">';
        html += '<div class="u11w-atop"><span class="u11w-aname">' + model.label + '</span></div>';
        html += sub(fm.label + ' · via ' + (conn ? conn.label : ''));
        if (cooling) {
          html += '<div class="u11w-sub warntxt">Cooldown · back in ' + T().dur(Date.parse(fm.cooldownUntil) - Date.parse(d.meta.now)) + '</div>';
        }
        if (meter && meter.usedPct != null) {
          var t2 = toneForPct(meter.usedPct);
          html += mrow('Allowance used', valHTML(meter.usedPct, '%'), meter.usedPct, t2 === 'hot' ? 'f-pink' : t2 === 'warn' ? 'f-orange' : 'f-lime');
        }
        html += sub(fm.detail);
        html += '</div>';
      });
      html += '</div>';
    });

    var flagged = d.freeModels.filter(function (fm) { return !fm.eligible; });
    if (flagged.length && sizeKey !== 'S') {
      html += '<div class="u11w-freegroup"><div class="u11w-acctfam">Changes & issues</div>';
      flagged.forEach(function (fm) {
        html += '<div class="u11w-prow dim"><div class="u11w-atop"><span class="u11w-aname">' + d.modelById[fm.modelId].label + '</span></div>' +
          sub(fm.label + ' · ' + fm.detail) + '</div>';
      });
      html += '</div>';
    }
    html += note('Free Models is a routing lens, not a provider or billing identity. Only routes whose underlying source is set up appear. Active probes consume allowance as validation, not user work.');
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
        html += cta('Open attempt detail', 'data-u11-act="openattempt" data-att="' + main.eventId + '"');
      }
      html += '</div>';
    });

    if (!shown) html += '<div class="u11w-empty">' + ic('clipboard') + '<p>No usage events in this scope.</p></div>';

    /* historical / removed-account rows always stay inspectable */
    var hist = d.attempts.filter(function (a) { return a.historicalIdentity; });
    if (hist.length && (bucketFilter === 'all')) {
      html += '<div class="u11w-freegroup">' + sub('Historical · removed sources');
      hist.forEach(function (a) {
        html += '<div class="u11w-prow dim"><div class="u11w-atop"><span class="u11w-aname">' + a.historicalIdentity.label + '</span>' +
          '<span class="u11w-adetail">' + T().stamp(a.startedAt) + '</span></div>' +
          sub((attemptTokensLabel(item, a) || 'no provider usage') + (a.costMicro > 0 ? ' · ' + moneyFmt(a.costMicro) : '')) +
          '<div class="u11w-cta"><button type="button" class="u11w-minibtn" data-u11-act="openattempt" data-att="' + a.eventId + '">inspect</button></div></div>';
      });
      html += '</div>';
    }
    html += footActs(item);
    return denseWrap(item, html);
  }

  /* ---------- operations: maintenance & operations (packet §04) ---------- */
  var OPS_KIND_ICON = { cli_update: 'route', offline_outbox: 'alert', server_continuity: 'check',
    sound_preview: 'check', notification_test: 'check', backup: 'check', project_move: 'check',
    setup_required: 'alert' };
  function renderOperations(item, sizeKey) {
    var d = D();
    var ops = d.operationsFor();
    var html = topStrip(item, ops.length + ' activities');
    ops.forEach(function (op) {
      var host = d.hostById[op.hostId], env = d.envById[op.envId];
      html += '<div class="u11w-opcard">';
      html += '<div class="u11w-atop"><span class="u11w-opico">' + ic(OPS_KIND_ICON[op.kind] || 'check') + '</span>' +
        '<span class="u11w-aname">' + op.title + '</span><span class="u11w-kind ' +
        (op.status === 'rolled_back' ? 'warn' : op.status === 'completed' ? 'ok' : '') + '">' + R().human(op.status) + '</span></div>';
      html += sub(op.copy);
      if (op.phases && op.phases.length) {
        html += '<div class="u11w-ophases">';
        op.phases.forEach(function (ph) {
          html += '<span class="u11w-ophase"><b>' + ph.label + '</b>' + T().dur(ph.ms) + '</span>';
        });
        html += '</div>';
      }
      if (host || env) html += sub((host ? host.label : '—') + (env ? ' · ' + env.label : ''));
      if (op.acquisition) {
        html += '<div class="u11w-opacq">' + ic('lock') + '<span>Explicit user setup · ' + op.acquisition.source +
          ' · bound to ' + (host ? host.label : op.hostId) + ' / ' + (env ? env.label : op.envId) +
          (op.acquisition.installation ? ' · v' + op.acquisition.installation.version : '') +
          ' · updates/repair post-consent only</span></div>';
      }
      html += '<div class="u11w-sub dimtxt">' + op.detail + '</div>';
      if (op.validationEventId) {
        html += cta('View the verification call', 'data-u11-act="openattempt" data-att="' + op.validationEventId + '"');
      }
      if (op.kind === 'setup_required' && op.setupLink) {
        html += cta('Open provider setup', 'data-u11-act="setuplink" data-ops="' + op.id + '"');
      }
      html += '</div>';
    });
    html += note('Maintenance is never model usage. First acquisition is explicit user setup from the official source for the exact host/environment; Auto/On maintain only already-approved installations. When a flow verifies with a model, that call appears separately as a validation event.');
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
    html += note('Recovered tool calls are not rerun — no duplicate user work, no provider tokens.');
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
      html += '<div class="u11w-prow">';
      html += '<div class="u11w-atop"><span class="u11w-aname">' + (conn ? conn.label : '') + '</span><span class="u11w-adetail">' + acct + '</span></div>';
      if (cs.state === 'unsupported') {
        html += sub('unsupported — a missing cache-write field is “—”, never zero');
      } else {
        html += mrow('Cache hit', valHTML(cs.hit != null ? cs.hit : 0, '%'), cs.hit || 0, 'f-teal');
        html += vrow('h-lime', 'Saved today', pval('−$' + cs.save.toFixed(2)));
      }
      if (cs.note) html += sub(cs.note);
      html += '</div>';
    });
    html += note('These are per-provider prompt-cache figures — distinct from the context-ring cache metric.');
    html += footActs(item);
    return html;
  }

  /* ---------- signals ---------- */
  function renderSignals(item, sizeKey) {
    var d = D(), s = d.signals;
    var html = topStrip(item);
    html += '<div class="u11w-hero"><span class="u11w-heroval"><b class="u11w-num static u11w-gradenum">' + s.grade + '</b></span>' +
      '<span class="u11w-herosub">efficiency · ' + s.score + '/100</span></div>';
    html += gradBar(s.score);
    function sigList(title, arr, cls, hue) {
      if (!arr.length) return '';
      var h = '<div class="u11w-siglist">' + sub(title);
      arr.forEach(function (sg) { h += vrow(hue, sg.text, '', 'sig ' + cls); });
      return h + '</div>';
    }
    html += sigList('Wins', s.wins, 'win', 'h-lime');
    html += sigList('Improvements', s.improvements, 'imp', 'h-blue');
    html += sigList('Risks', s.risks, 'risk', 'h-orange');
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
    var html = topStrip(item);
    html += '<div class="u11w-rows">';
    Object.keys(counts).sort().forEach(function (k, i) {
      html += vrow(SERIES_FILLS[i % SERIES_FILLS.length].replace('f-', 'h-'), R().human(k), valHTML(counts[k], 'events'));
    });
    html += '</div>';
    html += '<div class="u11w-freegroup">' + sub('Settlement & freshness');
    html += '<div class="u11w-rows">';
    html += vrow('h-blue', 'Projection freshness', pval(d.meta.projectionFreshness));
    html += vrow('h-teal', 'Projection health', pval(d.meta.projectionHealth));
    html += vrow('h-orange', 'Next auto-refresh', pval(T().atClock(d.meta.nextAutoRefresh)));
    html += vrow('h-mute', 'Retention', pval(d.meta.retentionDays + ' days'));
    html += '</div></div>';

    html += '<div class="u11w-freegroup">' + sub('Catalog & probes');
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
    html += note('Route snapshots, receipt refs, pricing versions and source authority live here — never in the Essentials view. Absent is not zero; unknown is not unavailable.');
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
        window.U11.dispatch('cmd.provider.switch_route', { accountId: acctId });
        if (window.toast) window.toast('Future work will prefer ' + window.U11.accountLabel(acctId) + '. In-flight requests are never moved.');
        return;
      }
      if (a === 'openmgmt') {
        var resM = window.U11.dispatch('cmd.provider.usage.open_management', { familyId: act.getAttribute('data-fam') });
        if (window.toast) window.toast(resM.toast);
        return;
      }
      if (a === 'reqforecast') {
        var resF = window.U11.dispatch('cmd.usage.forecast.request', { runId: act.getAttribute('data-run') });
        if (window.toast) window.toast(resF.toast);
        return;
      }
      if (a === 'setuplink') {
        var op = null;
        window.U11.operational.forEach(function (o) { if (o.id === act.getAttribute('data-ops')) op = o; });
        if (op && op.setupLink) {
          var resS = window.U11.deepLink(op.setupLink);
          if (window.toast) window.toast(resS.toast);
        }
        return;
      }
    });
  };

  /* local count-up for [data-ucnt]: comma-grouped numbers like the video,
     ease-out over ~0.9-1.2s from zero on each render; RM renders final state */
  function animateUcnt(scope) {
    var Rv = R();
    if (!Rv) return;
    var rm = Rv.isRM();
    scope.querySelectorAll('[data-ucnt]').forEach(function (el, i) {
      if (el.getAttribute('data-unull')) return;
      var target = parseFloat(el.getAttribute('data-ucnt')) || 0;
      var f = el.getAttribute('data-ufmt') || 'num';
      var pre = el.getAttribute('data-uprefix') || '';
      var dec = el.getAttribute('data-udec');
      function fmtV(v) {
        if (f === 'num') return pre + fmt().num(Math.round(v));
        if (f === 'tok') return pre + fmt().tok(Math.round(v));
        if (f === 'cost') return fmt().cost(v);
        if (f === 'dec') return pre + v.toFixed(dec != null ? +dec : 1);
        return pre + String(Math.round(v));
      }
      if (el._ucntRaf) cancelAnimationFrame(el._ucntRaf);
      if (rm) { el.textContent = fmtV(target); return; }
      var dur = 1500 + Math.min(i * 60, 700);
      var t0 = performance.now();
      function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmtV(target * e);
        if (p < 1) el._ucntRaf = requestAnimationFrame(tick);
        else el._ucntRaf = 0;
      }
      el._ucntRaf = requestAnimationFrame(tick);
    });
  }

  /* animate chart bars + fills + choreography after bodies render:
     fills/rings/counters start, tiles pop staggered, footnote fades last */
  U11W.animateBody = function (scope) {
    var Rv = R();
    if (!Rv) return;
    Rv.animateFills(scope);
    if (Rv.animateDonuts) Rv.animateDonuts(scope);
    if (Rv.animateCounters) Rv.animateCounters(scope);
    animateUcnt(scope);
    scope.querySelectorAll('.u11w-colbar i[data-h]').forEach(function (el, i) {
      var h = el.getAttribute('data-h');
      el.style.transition = 'height 480ms cubic-bezier(0.22,1,0.36,1) ' + Math.min(i * 12, 240) + 'ms';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.height = h + '%'; }); });
    });
    scope.querySelectorAll('.u11w-spark i[data-h]').forEach(function (el, i) {
      var h = Math.max(parseFloat(el.getAttribute('data-h')) || 0, 8);
      if (Rv.isRM()) { el.style.height = h + '%'; return; }
      el.style.transition = 'height 520ms cubic-bezier(0.22,1,0.36,1) ' + Math.min(i * 40, 480) + 'ms';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.height = h + '%'; }); });
    });
    scope.querySelectorAll('.u11w-gradmask[data-gm]').forEach(function (el) {
      var w = el.getAttribute('data-gm');
      if (Rv.isRM()) { el.style.width = w + '%'; return; }
      el.style.transition = 'width 700ms cubic-bezier(0.22,1,0.36,1) 150ms';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.width = w + '%'; }); });
    });
    scope.querySelectorAll('.u11w-tile').forEach(function (el, i) {
      el.style.animationDelay = (140 + i * 95) + 'ms';
      el.classList.add('go');
    });
    scope.querySelectorAll('.u11w-note').forEach(function (el) { el.classList.add('go'); });
  };

  window.U11W = U11W;
})();
