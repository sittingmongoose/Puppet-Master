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

  /* ---------- honest token totals · counting semantics ----------
     The shared dataset publishes a counting-semantics table
     (window.USAGE.countingSemantics, keyed by provider/plan): for some
     providers cache read and reasoning are a SUBSET of an inclusive
     input/output pair, for others they are a separate additive bucket.
     Adding every bucket blindly double-counts the inclusive providers, so
     every displayed total goes through tokenTotal() and carries the basis
     it was computed on. When no published row matches the route we do NOT
     guess: the total is the exclusive input + output sum and the basis
     says the counting rule is unpublished. A bucket the provider never
     reported stays unknown — it is never read as a zero. */
  var SEM_PREFIX = [
    ['Claude Code', 'Claude Code'],
    ['Claude', 'Claude'],
    ['Codex', 'Codex · ChatGPT plan'],
    ['Copilot', 'Copilot'],
    ['Cursor', 'Cursor'],
    ['OpenCode', 'OpenCode'],
    ['Antigravity', 'Antigravity CLI'],
    ['Gemini', 'Gemini Direct']
  ];
  function semTable() { return (window.USAGE && window.USAGE.countingSemantics) || {}; }
  function semByName(name) {
    if (!name) return null;
    var tab = semTable(), i;
    if (tab[name]) return { key: name, sem: tab[name] };
    for (i = 0; i < SEM_PREFIX.length; i++) {
      if (String(name).indexOf(SEM_PREFIX[i][0]) === 0 && tab[SEM_PREFIX[i][1]]) {
        return { key: SEM_PREFIX[i][1], sem: tab[SEM_PREFIX[i][1]] };
      }
    }
    return null;
  }
  /* route identity (attempt / ledger row / free route) → published row.
     Most specific name first: product, then connection, then family. */
  function semForRoute(route) {
    if (!route) return null;
    var d = D(), names = [], hit, i;
    var conn = route.connectionId ? d.connectionById[route.connectionId] : null;
    var prod = route.productId ? d.productById[route.productId] : null;
    var acct = d.accountById[route.effectiveAccountId || route.requestedAccountId] ||
      (conn ? d.accountById[conn.accountId] : null);
    var fam = acct ? d.familyById[acct.familyId] : null;
    if (prod) names.push(prod.label);
    if (conn) names.push(conn.label);
    if (fam) names.push(fam.label);
    for (i = 0; i < names.length; i++) { hit = semByName(names[i]); if (hit) return hit; }
    return null;
  }
  function semNote(sem, subject) {
    if (!sem) {
      return 'Counting basis for this ' + subject + ' is not published, so only input and output are added · ' +
        'cache read and reasoning stay visible but are never added on top.';
    }
    return (sem.cache_in_input === 'additive' ? 'Cache read counted as its own bucket' : 'Cache read counted inside input') +
      ' · ' + (sem.reasoning_in_output === 'additive' ? 'reasoning counted as its own bucket' : 'reasoning counted inside output') +
      ' · ' + R().human(sem.provider_style) + ' style counting.';
  }
  /* tokenTotal(tokens, route, opts) →
       { total: Number|null   — null when nothing was reported (never a fake 0)
         known: Boolean       — a published semantics row matched the route
         semKey: String|null  — which row matched, so the number is falsifiable
         partial: Boolean     — one of input / output was not reported
         cacheAdded, reasoningAdded: Boolean
         parts: [String]      — the buckets actually summed
         basis: String        — short, user-facing (no underscores)
         note: String         — one sentence for a title attribute } */
  function tokenTotal(tokens, route, opts) {
    opts = opts || {};
    var t = tokens || {};
    var hit = semForRoute(route);
    var sem = hit ? hit.sem : null;
    var subject = opts.subject || 'route';
    var inp = t.input == null ? null : Number(t.input);
    var out = t.output == null ? null : Number(t.output);
    var res = { total: null, known: !!sem, semKey: hit ? hit.key : null, partial: false,
      cacheAdded: false, reasoningAdded: false, parts: [], basis: 'not reported', note: '' };
    if (inp == null && out == null) {
      res.note = 'No input or output count was reported for this ' + subject + ' — unknown, not zero.';
      return res;
    }
    var total = 0;
    if (inp != null) { total += inp; res.parts.push('input'); } else res.partial = true;
    if (out != null) { total += out; res.parts.push('output'); } else res.partial = true;
    if (sem && sem.cache_in_input === 'additive') {
      if (t.cacheRead != null) { total += Number(t.cacheRead); res.cacheAdded = true; res.parts.push('cache read'); }
      if (t.cacheWrite != null) { total += Number(t.cacheWrite); res.cacheAdded = true; res.parts.push('cache write'); }
    }
    if (sem && sem.reasoning_in_output === 'additive' && t.reasoning != null) {
      total += Number(t.reasoning); res.reasoningAdded = true; res.parts.push('reasoning');
    }
    res.total = total;
    res.basis = res.parts.join(' plus ');
    res.note = semNote(sem, subject) +
      (res.partial ? ' Only one of input or output was reported, so this total is partial.' : '');
    return res;
  }
  /* aggregate over records that each carry their own route identity */
  function tokenTotalMany(records, opts) {
    var out = { total: null, count: 0, counted: 0, missing: 0, unknownRoutes: 0,
      inclusive: 0, additive: 0, parts: [], basis: 'not reported', note: '' };
    var sum = 0, any = false, seen = {}, qual = [];
    (records || []).forEach(function (rec) {
      var r = tokenTotal(rec.tokens, rec, opts);
      out.count += 1;
      if (r.total == null) { out.missing += 1; return; }
      any = true; sum += r.total; out.counted += 1;
      if (!r.known) out.unknownRoutes += 1;
      else if (r.cacheAdded || r.reasoningAdded) out.additive += 1;
      else out.inclusive += 1;
      r.parts.forEach(function (p) { if (!seen[p]) { seen[p] = 1; out.parts.push(p); } });
    });
    if (!any) {
      out.note = 'No attempt in this group reported a provider count — unknown, not zero.';
      return out;
    }
    out.total = sum;
    out.basis = out.parts.join(' plus ');
    if (out.additive) qual.push('cache added only for providers that bill it as its own bucket');
    if (out.inclusive) qual.push('cache not added where the provider reports it inside input');
    if (out.unknownRoutes) qual.push(out.unknownRoutes + ' route' + (out.unknownRoutes > 1 ? 's' : '') + ' publish no counting basis, so only input plus output is added there');
    if (out.missing) qual.push(out.missing + ' attempt' + (out.missing > 1 ? 's' : '') + ' reported no provider usage');
    out.note = qual.join(' · ') + '.';
    return out;
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
     Three type levels: bold tabular value / muted sentence-case label / tiny
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
  /* One metric, one rendering. A rate is written to the precision the record
     carries, in every surface that shows it. Sending the context cache-hit
     rate through the whole-number path in the widget and through this one in
     Context Details printed 97 in one place and 96.8 in the other — one
     metric reading as two. This is the single implementation; u11-context.js
     calls it rather than keeping a second copy. */
  function ratePct(v) { return v == null ? '—' : (Math.round(v * 10) / 10) + '%'; }
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

  /* Which Settings row each widget is actually about (audit A10-08).

     The footer affordance used to open the read-only sheet for every widget, so
     the register's claim that policy actions deep-link to Settings was satisfied
     only one hop later, by the sheet's own rows. A widget knows its own subject:
     the quota widget's route is not the analytics widget's route. Every id below
     was verified present in Plans/settings_inventory.json - inventing a settings
     id is the defect that made the original deep-link envelope invalid. Widgets
     with no single apt row keep the sheet route and are absent from this map. */
  var WIDGET_SETTING = {
    plans:      'ai.usage.usage-windows',
    costs:      'ai.usage.monthly-spend-limit',
    accounts:   'ai.accounts.multi-account-switching',
    attention:  'ai.usage.pressure-sensitivity',
    capacity:   'ai.usage.quota-management',
    free:       'ai.usage.free-models-auto-apply',
    ledger:     'ai.usage.ledger-page-size',
    analytics:  'ai.usage.chart-type',
    tools:      'ai.usage.tool-usage-window',
    cache:      'ai.usage.usage-retention',
    authority:  'ai.usage.pricing-version',
    operations: 'ai.accounts.provider-connections',
    runs:       'ai.usage.quota-management'
  };

  function footActs(item) {
    var html = '<div class="u11w-foot">';
    html += '<button type="button" class="u11w-minibtn" data-u11-act="duplicate" title="Duplicate this widget instance">' + ic('copy') + '<span>Duplicate</span></button>';
    if (cfgDirty(item)) {
      html += '<button type="button" class="u11w-minibtn" data-u11-act="resetcfg" title="Reset this instance’s settings to defaults">' + ic('undo') + '<span>Reset settings</span></button>';
    }
    html += '<span class="u11w-footsp"></span>';
    var wsid = WIDGET_SETTING[item && item.type];
    if (wsid) {
      var wlab = (D().settingsRowLabel && D().settingsRowLabel(wsid)) || 'this widget\u2019s setting';
      html += '<button type="button" class="u11w-minibtn dim" data-u11-act="opensetting" data-setting="' + wsid + '"' +
        ' data-u11-fields="focus_setting_id:' + wsid + '"' +
        ' title="Open the Settings row this widget reports on: ' + attrSafe(wlab) + '">' +
        ic('cog') + '<span>Open ' + attrSafe(wlab) + '</span></button>';
    } else {
      html += '<button type="button" class="u11w-minibtn dim" data-u11-act="opensettings" title="Open the Usage settings sheet - this widget has no single owning setting">' + ic('cog') + '<span>Open Usage settings</span></button>';
    }
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
  /* A confidence marker is only worth the ink when it is not the default —
     and a bare "medium" is not a value label. The word used to stand alone
     with nothing but a hover title naming it, which touch and screen readers
     never reach; 05_GUI_CONTEXT_RING_DEMO_AND_TESTS forbids bare high /
     medium / low as value labels in ordinary context UI. The visible text now
     says what the word measures. */
  var CONF_TEXT = {
    high: 'high confidence', medium: 'medium confidence',
    low: 'low confidence', unknown: 'confidence not recorded'
  };
  function confChipIf(c) {
    if (!c || c === 'high') return '';
    var lab = CONF_TEXT[c] || 'confidence ' + R().human(c);
    return '<span class="conf conf-' + c + '" title="' + attrSafe('source confidence · ' + lab) + '">' +
      '<span class="cd"></span>' + lab + '</span>';
  }
  /* A humanised enum is not user copy either: "cli reported" is the token
     with its underscore taken out. Each source class gets the same words the
     run inspector uses, so one fact carries one name across the concept. */
  var SOURCE_CLASS_TEXT = {
    provider_reported: 'reported by the provider', provider_header: 'read from a provider header',
    cli_reported: 'reported by the provider CLI', local_estimated: 'measured by Puppet Master',
    pricing_estimated: 'estimated from published prices', pm_observed: 'observed by Puppet Master',
    unknown: 'not recorded'
  };
  function sourceClassText(k) { return SOURCE_CLASS_TEXT[k] || R().human(k); }
  function sourceClassLabel(k) { var s = sourceClassText(k); return s.charAt(0).toUpperCase() + s.slice(1); }
  /* the one wording for "there is no number here" — never a 0, never a 0% */
  function unkVal(txt) { return '<span class="u11w-vval u11w-dimtxt">' + txt + '</span>'; }
  /* title/aria text is user-visible, so it may not carry a raw double quote */
  function attrSafe(s) { return String(s == null ? '' : s).replace(/"/g, '”'); }

  /* ---------- diagnostic identity: machine half and human half ----------
     A title is rendered by the browser as a tooltip, and Slint renders
     tooltips too, so a title IS user-visible text. Putting the raw pairs
     there ("state not_exposed · usage_reporting_state:unknown") only moved
     the database column one hover away from the reader, and mixed it with
     humanised copy in the same string.

     The two halves are now separated by shape, not by luck. The canonical
     field names are what makes the fixture cross-check falsifiable, so every
     raw field:value pair goes into data-u11-fields — present in the DOM,
     queryable, never rendered. The tooltip says the same thing in prose,
     with every field name and every value through R().human. One shape,
     applied to every diagnostic row on the page. */
  function diagLive(pairs) {
    return (pairs || []).filter(function (p) { return p && p[1] != null && p[1] !== ''; });
  }
  /* machine half — an attribute fragment, raw tokens intact */
  function diagFields(pairs) {
    var live = diagLive(pairs);
    if (!live.length) return '';
    return ' data-u11-fields="' + attrSafe(live.map(function (p) {
      return p[0] + ':' + p[1];
    }).join(' · ')) + '"';
  }
  /* human half — field named in prose, value humanised */
  function diagProse(pairs) {
    return diagLive(pairs).map(function (p) {
      return R().human(p[0]) + ' ' + R().human(p[1]);
    });
  }
  function diagTitle(parts) {
    var str = (parts || []).filter(Boolean).join(' · ');
    return attrSafe(str.charAt(0).toUpperCase() + str.slice(1));
  }

  /* ---------- honest cost cells · fixtures GUI-USG-002/003/004 ----------
     A price is a number only when a provider actually reported one.
     costStatus, displayCostPolicy, hiddenByok and hiddenSubscription decide
     which of five honest cases applies, so a suppressed price (BYOK or plan),
     an unknown price and a genuine provider-reported zero can never collapse
     into the same fabricated "$0.00". Unknown is never zero; zero is never
     unknown. */
  function costState(a) {
    if (!a) return 'unknown';
    if (a.hiddenByok || a.costStatus === 'hidden_byok' || a.displayCostPolicy === 'hide') return 'hidden_byok';
    if (a.hiddenSubscription || a.costStatus === 'hidden_subscription' ||
      a.displayCostPolicy === 'subscription_covered') return 'hidden_subscription';
    if (a.costStatus === 'unknown' || a.costMicro == null) return 'unknown';
    if (Number(a.costMicro) === 0) return 'reported zero';
    return 'priced';
  }
  var COST_SHORT = {
    hidden_byok: 'cost hidden · your own key',
    hidden_subscription: 'cost hidden · plan covers it',
    unknown: 'cost unknown',
    'reported zero': '$0.00 reported'
  };
  var COST_LONG = {
    hidden_byok: 'Cost hidden — this route is billed to your own provider key, so Puppet Master does not hold the price you pay. Tokens, route and settlement are kept in full.',
    hidden_subscription: 'Cost hidden — the plan covers this call, so there is no per-token price to show.',
    unknown: 'Cost unknown — no price was reported, so nothing is shown rather than a zero.',
    'reported zero': 'The provider reported a zero charge for this call. That is a measured zero, not a missing price.'
  };
  function costShort(a) {
    var s = costState(a);
    return s === 'priced' ? moneyFmt(a.costMicro) : COST_SHORT[s];
  }
  /* The aggregate line speaks the SAME five-case vocabulary as the rows it
     sits above. A group total counted every attempt carrying a price as a
     "priced call", so five provider-reported zeros were summed into a
     "$0.00 reported on 2 priced calls" while each of those same attempts
     rendered "$0.00 reported" one row below — the aggregate contradicting
     the per-attempt vocabulary directly beneath it. costState is the one
     authority for which case an attempt is in, and this counts through it
     rather than deciding a sixth time. */
  function costCaseCounts(list) {
    var c = { priced: 0, 'reported zero': 0, hidden_subscription: 0, hidden_byok: 0, unknown: 0, micro: 0 };
    (list || []).forEach(function (a) {
      var st = costState(a);
      c[st] += 1;
      if (st === 'priced') c.micro += Number(a.costMicro) || 0;
    });
    return c;
  }
  function costLong(a) {
    var s = costState(a);
    if (s === 'priced') return moneyFmt(a.costMicro) + ' billed to this route';
    if (s === 'unknown' && a.unknownReason) return COST_LONG.unknown + ' Reason: ' + a.unknownReason + '.';
    return COST_LONG[s];
  }
  /* the falsifiable half: which state, which policy, which authority, and the
     refs a receipt drill-through needs (fixture GUI-USG-004 keeps the usage
     event and record refs even when the price is suppressed) */
  function costTitle(a) {
    var p = [costLong(a)];
    p.push('cost state ' + R().human(a.costStatus || 'unknown'));
    p.push('display policy ' + R().human(a.displayCostPolicy || 'unknown'));
    p.push('source class ' + sourceClassText(a.sourceClass || 'unknown'));
    p.push(a.sourceAuthority ? 'source authority ' + a.sourceAuthority : 'source authority not stated on this record');
    p.push('source confidence not stated on this record');
    /* The event id lived here as tooltip text. A title attribute is read aloud
       and shown on hover, so it is user-facing prose by any useful definition;
       the id now rides the element as data-u11-event instead. */
    if (a.receiptRef) p.push('receipt ' + a.receiptRef);
    return attrSafe(p.join(' · '));
  }
  function costChip(a) {
    var s = costState(a);
    if (s === 'hidden_byok') return R().chip('hidden_byok');
    if (s === 'hidden_subscription') return R().chip('hidden_subscription');
    if (s === 'unknown') return R().chip('unknown');
    if (s === 'reported zero') return R().chip('zero');
    return '';
  }
  function costCellHTML(a) {
    var s = costState(a);
    return '<span class="u11w-attcost' + (s === 'priced' || s === 'reported zero' ? '' : ' unk') +
      '" data-u11-event="' + attrSafe(a.eventId || '') + '" title="' + costTitle(a) + '">' + costShort(a) + '</span>';
  }
  /* the summary line carries the canonical value-state chip instead of
     repeating the sentence the chip already says */
  function costTurnHTML(a) {
    var s = costState(a);
    var open = '<span data-u11-event="' + attrSafe(a.eventId || '') + '" title="' + costTitle(a) + '">';
    if (s === 'priced') return open + moneyFmt(a.costMicro) + '</span>';
    if (s === 'reported zero') return open + moneyFmt(0) + '</span>' + costChip(a);
    return open + 'cost</span>' + costChip(a);
  }

  /* ---------- meters: native value, named window, value state ----------
     A meter is a quantity, in a unit, inside a named window. Rendering only a
     bare percentage loses the unit, the native value, the used/left polarity
     and the window name, and it flattens four different unknown states into
     one sentence. These helpers keep all four visible. */
  var WINDOW_LABEL = {
    rolling: 'rolling window', fixed_reset: 'fixed window', billing_cycle: 'billing cycle',
    session_only: 'session only', balance: 'prepaid balance', pack: 'purchased pack',
    pool: 'shared pool', banked: 'banked credit', trial: 'trial', none: 'no window'
  };
  /* only these window kinds have a reset to speak of; a balance, a pack, a
     pool or a banked credit never resets, so claiming an unreadable reset for
     one of them would invent a countdown */
  var WINDOW_RESETS = { rolling: 1, fixed_reset: 1, billing_cycle: 1 };
  /* the window kind is already named beside the value, so this half only says
     what the kind does instead of repeating it */
  var WINDOW_NO_RESET = {
    balance: 'nothing resets — it draws down', pack: 'nothing resets — it expires',
    pool: 'nothing resets', banked: 'nothing resets',
    trial: 'nothing resets — it ends on a date', none: 'nothing resets',
    session_only: 'nothing resets'
  };
  var UNIT_WORD = { requests: 'requests', tokens: 'tokens', credits: 'credits', count: 'saved resets' };
  function meterAmount(item, v, unit) {
    if (v == null) return '—';
    if (unit === 'USD') return fmt().cost(v);
    if (unit === '%') return Math.round(v) + '%';
    return numfmt(item, v);
  }
  function meterWindow(m) {
    return m.label + ' · ' + (WINDOW_LABEL[m.windowKind] || R().human(m.windowKind));
  }
  function meterNative(item, m) {
    var unit = m.unit, word = UNIT_WORD[unit] || '';
    /* a bucket the user switched off has no reading to report — printing its
       stored 0 next to "Turned off" would be exactly the fabricated zero the
       state text exists to prevent */
    if (m.vs === 'disabled') return '';
    if (m.used == null && m.limit == null) return '';
    if (m.limit == null) {
      return meterAmount(item, m.used, unit) + (word ? ' ' + word : '') + ' observed · limit not exposed';
    }
    var left = m.used == null ? null : m.limit - m.used;
    return meterAmount(item, m.used, unit) + ' of ' + meterAmount(item, m.limit, unit) +
      (word ? ' ' + word : '') + ' used' +
      (left == null ? '' : ' · ' + meterAmount(item, left, unit) + ' left');
  }
  /* the ONE place a null percentage becomes words. A bucket the user switched
     off, a provider that exposes no limit, a provider that is ready but has no
     figures yet, and a counter Puppet Master keeps itself are four different
     facts and must not share one sentence. */
  function meterStateText(item, m) {
    if (m.vs === 'disabled') return 'Turned off' + (m.note ? ' · ' + m.note : '');
    if (m.vs === 'not_exposed') return 'Not exposed by this provider';
    if (m.vs === 'unavailable') return m.note || 'Provider ready · Usage details unavailable';
    if (m.vs === 'measured' && m.limit == null) {
      return meterAmount(item, m.used, m.unit) + ' ' + (UNIT_WORD[m.unit] || '') + ' observed by Puppet Master · no limit to report';
    }
    if (m.limit == null) {
      return 'Limit not exposed' + (m.used != null ? ' · ' + meterAmount(item, m.used, m.unit) + ' observed' : '');
    }
    return 'Not reported';
  }
  /* "background validation consumes allowance" is only a claim until the
     split is on screen: how much of this window was your work and how much
     was a probe validating the route */
  function allowanceSplitText(m) {
    var aa = m && m.allowanceAttribution;
    if (!aa) return '';
    var w = UNIT_WORD[aa.unit] || aa.unit || '';
    var ids = aa.validationEventIds || [];
    return 'Allowance drawn · ' + aa.total + ' ' + w + ' · ' + aa.userWork + ' your work · ' +
      aa.validation + ' background validation' +
      /* This parenthetical used to read "(ue-615)": a bare internal id in prose,
         and the only rendered id leak in the whole bundle. It becomes the same
         affordance every other event ref got. */
      (ids.length ? ' \u00b7 ' + ids.map(function (id) { return eventLink(id); }).join(', ') : '');
  }
  /* WHETHER a window resets is a property of the window kind; whether its
     reset can be READ is a property of the value state. Choosing the copy
     from the value state alone lets a pool or a balance with an unknown
     value claim a reset it does not have. U11.meterResetState answers the
     first question from the kind, so this asks it there and keeps only the
     wording here. */
  function meterResetText(m, d, t) {
    var st = D().meterResetState ? D().meterResetState(m) : null;
    var hasReset = st ? st.hasReset : !!WINDOW_RESETS[m.windowKind];
    if (hasReset && m.resetAt) return t.when(m.resetAt, d.meta.now, 'reset');
    if (m.expiresAt) return t.when(m.expiresAt, d.meta.now, 'expiry');
    if (!hasReset) return WINDOW_NO_RESET[m.windowKind] || '';
    /* only reachable once the WINDOW KIND has said it resets, so the value
       state decides whether the time can be READ — never whether a reset
       exists (audit A03-19). A pool or a balance never reaches this line. */
    return st ? st.text : 'Reset time unavailable';
  }

  /* ---------- server-first lineage · all seven levels ----------
     Project, Home Server, Execution Host, Execution Environment, Source
     Location, Client, then the work. Source Location and Client are the two
     levels the dataset carried and nothing rendered; a level that genuinely
     does not apply says so rather than borrowing a neighbour's value. */
  function lineageText(rec) {
    var ln = D().lineageOf(rec);
    if (!ln) return '';
    var p = [];
    if (ln.project) p.push(ln.project);
    if (ln.host) p.push(ln.host.label + (ln.homeServer ? ' · home server' : ''));
    if (ln.environment) p.push(ln.environment.label);
    p.push(ln.sourceLocation ? ln.sourceLocation.label : 'Source location not recorded');
    p.push(ln.client ? ln.client.label + ' · ' + R().human(ln.client.state) : 'No client attached');
    return p.join(' · ');
  }

  /* a clickable column header — the sort controls used to live only inside the
     kebab config sheet, so no sort was reachable from the surface itself */
  function sortTh(key, label, cur, act, numeric) {
    return '<th' + (numeric ? ' class="num"' : '') + '><button type="button" class="u11w-sortb' +
      (cur === key ? ' on' : '') + '" data-u11-act="' + act + '" data-s="' + key +
      '" aria-pressed="' + (cur === key) + '" title="Sort by ' + attrSafe(label) + '">' + label + '</button></th>';
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

    /* one sibling-window row: named window, value state, confidence, and either
       a real percentage carrying its used/left polarity or the specific words
       for the state that has no percentage */
    function meterRowHTML(m) {
      var pct = m.usedPct;
      var tone = toneForPct(pct);
      var dot = pct == null ? 'h-mute' : (tone === 'hot' ? 'h-pink' : tone === 'warn' ? 'h-orange' : 'h-lime');
      return '<div class="u11w-vrow slim"><span class="u11w-vdot ' + dot + '"></span>' +
        '<span class="u11w-vlab"><i class="u11w-win">' + meterWindow(m) + '</i>' +
        vsChipIf(m.vs) + confChipIf(m.conf) + '</span>' +
        (pct != null ? valHTML(pct, '% used') : unkVal(meterStateText(item, m))) + '</div>';
    }
    function meterSubHTML(m) {
      var bits = [meterNative(item, m), meterResetText(m, d, t), allowanceSplitText(m)];
      if (m.note && m.vs !== 'disabled' && m.vs !== 'unavailable') bits.push(m.note);
      bits = bits.filter(Boolean);
      var out = bits.length ? sub(bits.join(' · ')) : '';
      if (m.estimate) {
        out += '<div class="u11w-sub estimate">' + ic('trend') + '<span>' + m.label +
          ' · Puppet Master estimate ' + m.estimate.usedPct + '% · ' + m.estimate.conf +
          ' confidence · ' + m.estimate.basis + '</span></div>';
      }
      return out;
    }

    shown.forEach(function (row) {
      var p = row.product, m = row.top;
      var conn = d.connectionById[p.connectionId];
      var path = conn ? d.accountLabel(conn.accountId) + ' · ' + conn.label : '';
      var pct = m.usedPct;
      var tone = toneForPct(pct);
      var fill = tone === 'hot' ? 'f-pink' : tone === 'warn' ? 'f-orange' : 'f-lime';
      var lab = p.label + ' <i class="u11w-win">' + meterWindow(m) + '</i>' + vsChipIf(m.vs) + confChipIf(m.conf);

      html += '<div class="u11w-prow">';
      if (pct != null) {
        html += mrow(lab, valHTML(pct, '% used'), pct, fill);
      } else {
        html += vrow('h-mute', lab, unkVal(meterStateText(item, m)));
      }
      html += sub([path, meterNative(item, m), meterResetText(m, d, t), allowanceSplitText(m),
        (m.note && m.vs !== 'disabled' && m.vs !== 'unavailable' ? m.note : '')].filter(Boolean).join(' · '));
      /* every other window this product exposes — the sibling windows used to
         be dropped entirely, so a weekly window at 96% on an account already
         at its limit never reached this room */
      if (!tiny) {
        row.meters.forEach(function (mm) {
          if (mm === row.top) return;
          html += meterRowHTML(mm);
          html += meterSubHTML(mm);
        });
      }
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
          var sb = [meterNative(item, m), meterResetText(m, d, t), allowanceSplitText(m)].filter(Boolean).join(' · ');
          return '<div class="u11w-vrow slim"><span class="u11w-vdot ' + (pct == null ? 'h-mute' : tone === 'hot' ? 'h-pink' : tone === 'warn' ? 'h-orange' : 'h-lime') + '"></span>' +
            '<span class="u11w-vlab">' + row.product.label + ' <i class="u11w-win">' + meterWindow(m) + '</i>' +
            vsChipIf(m.vs) + confChipIf(m.conf) + '</span>' +
            (pct != null ? valHTML(pct, '% used') : unkVal(meterStateText(item, m))) + '</div>' +
            (sb ? sub(sb) : '');
        }).join('') + '</div></div>';
    }
    html += note('Every row names its window and its native unit, and the percentage is the share used. A bucket you switched off says so, a provider that exposes no limit says so, and a counter Puppet Master keeps itself says so — they are four different facts, never one sentence.');
    html += footActs(item);
    return denseWrap(item, html);
  }

  /* ---------- costs: spending this month ---------- */
  function renderCosts(item, sizeKey) {
    var d = D(), c = d.costs;
    var scope = effScope(item);
    var mode = (item.cfg && item.cfg.mode) || 'cards';
    var spent = c.spentMonthMicro, limit = c.spendingLimitMicro;
    /* Corrected 2026-08-18 (audit A03-16). The gauge used to fill from the whole
       month figure, but $125.57 of that is plan-included valuation the user is
       never charged for. A spending limit governs money that LEAVES the account,
       so the track now fills from the billed figure: 21% of the $300 limit, not
       62%. Disclosing the difference in copy was not enough - a guard set at 80%
       would still have fired on 21% of real spend. The plan-included valuation is
       shown as its own quantity below rather than folded into the same track. */
    var billed = c.apiBilledMicro;
    var pct = billed == null ? null : Math.round(billed / limit * 100);
    var valuationPct = Math.round(spent / limit * 100);
    var tone = pct == null ? 'ok' : (pct >= 90 ? 'hot' : (pct >= c.warningThresholdPct ? 'warn' : 'ok'));
    var html = topStrip(item);

    html += '<div class="u11w-hero">';
    html += '<span class="u11w-heroval">' + numHTML(billed == null ? null : billed / 1e6, { fmt: 'cost' }) + '</span>';
    html += '<span class="u11w-herosub">billed of ' + moneyFmt(limit) + ' spending limit · warn at ' + c.warningThresholdPct + '%</span>';
    html += '</div>';
    html += mrow('Spending limit used · billed money', valHTML(pct, '%'), pct, tone === 'hot' ? 'f-pink' : tone === 'warn' ? 'f-orange' : 'f-lime');
    /* The gauge counts plan-included valuation, which is never charged to a
       card — so the reader needs the basis of the ratio, not only the ratio.
       The guard fires on the same total, and the limit is one user-set figure
       rather than the sum of the per-product limits. */
    html += sub('Counted against the limit · only the ' + moneyFmt(billed) + ' billed to a card, because a spending limit governs money that leaves the account. ' +
      moneyFmt(c.planIncludedMicro) + ' of this month\'s ' + moneyFmt(spent) + ' is plan-included valuation your subscriptions already cover, and it is not counted here — it would read ' +
      valuationPct + '% if it were. The ' + c.warningThresholdPct + '% warning follows the billed figure, and the limit itself is one user-set number, not the sum of the per-product limits.');

    html += '<div class="u11w-rows">';
    html += vrow('h-blue', 'API-billed', '<span class="u11w-vval">' + numHTML(c.apiBilledMicro / 1e6, { fmt: 'cost' }) + '</span>');
    html += vrow('h-lime', 'Plan-included · not counted against the limit', '<span class="u11w-vval">' + numHTML(c.planIncludedMicro / 1e6, { fmt: 'cost' }) + '</span>');
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
  /* the ten facts an account row owes the reader: nickname, owner detail,
     provider family, plan/product, connections, active-or-off, routing
     priority, current pressure with its reset, what happens next, and the
     requested-versus-used record. Five of them used to be missing, and the
     widget's own footnote advertised a collapsed form it never produced. */
  function accountFacts(d, a) {
    var out = { products: [], top: null, topProduct: null, routedAway: 0, servedInstead: 0 };
    d.connectionsOfAccount(a.id).forEach(function (cn) {
      d.productsOfConnection(cn.id).forEach(function (p) {
        out.products.push(p);
        d.metersOfProduct(p.id).forEach(function (m) {
          if (m.usedPct == null) return;
          if (!out.top || m.usedPct > out.top.usedPct) { out.top = m; out.topProduct = p; }
        });
      });
    });
    if (!out.topProduct && out.products.length) out.topProduct = out.products[0];
    /* the continuation policy hangs off the product that has one, which is not
       always the product under the most pressure */
    out.nextProduct = null;
    if (out.topProduct && d.continuation[out.topProduct.id]) out.nextProduct = out.topProduct;
    else {
      out.products.forEach(function (p) { if (!out.nextProduct && d.continuation[p.id]) out.nextProduct = p; });
    }
    d.attempts.forEach(function (at) {
      if (at.requestedAccountId === a.id && at.effectiveAccountId && at.effectiveAccountId !== a.id) out.routedAway += 1;
      if (at.effectiveAccountId === a.id && at.requestedAccountId && at.requestedAccountId !== a.id) out.servedInstead += 1;
    });
    return out;
  }
  function accountRowHTML(d, a) {
    var conns = d.connectionsOfAccount(a.id);
    var ok = a.state === 'ready';
    var f = accountFacts(d, a);
    var html = '<div class="u11w-acctrow">';
    html += '<span class="u11w-vdot ' + (ok ? 'h-lime' : 'h-orange') + (ok ? '' : ' pulse') + '"></span>';
    html += '<div class="u11w-amain">';
    html += '<div class="u11w-atop"><span class="u11w-aname" title="' + attrSafe(a.label) + '">' + a.label +
      '</span><span class="u11w-adetail" title="' + attrSafe(a.detail) + '">' + a.detail + '</span>' +
      '<span class="u11w-kind ' + (a.enabled === false ? 'warn' : 'ok') + '">' + (a.enabled === false ? 'Turned off' : 'Active') + '</span></div>';
    /* the collapsed form the footnote promises, produced for real */
    html += '<div class="u11w-acctusing">Using ' + d.accountLabel(a.id) +
      (f.topProduct ? ' · ' + f.topProduct.label : ' · plan not identified') + '</div>';
    if (a.attention) html += '<div class="u11w-attn">' + ic('alert') + '<span>' + a.attention + '</span>' +
      '<button type="button" class="u11w-minibtn" data-u11-act="reconnect" data-acct="' + a.id + '">Reconnect</button></div>';
    html += '<div class="u11w-conns">';
    conns.forEach(function (cn) {
      var cliBadge = cn.authMethod === 'cli_owned_profile' ? '<span class="u11w-cli" title="OAuth owned by ' + cn.authOwnedBy + ' — the CLI owns the session">CLI profile</span>' : '';
      var stCls = cn.state === 'needs_reconnect' ? ' warn' : '';
      html += '<span class="u11w-conn' + stCls + '" title="' + attrSafe(cn.note || cn.label) + '">' + cn.label + cliBadge +
        (cn.state === 'needs_reconnect' ? '<em>needs attention</em>' : '') + '</span>';
    });
    html += '</div>';
    /* A CLI-bridged route is answered by an installation, and what one build
       exposes is not what another one does. The account row states, per
       installation, which command answered and which did not — and keeps the
       credit pool as a credit pool: never a token bucket, a price, a quota or
       a provider total. */
    var cliRecs = (d.cliBridged || []).filter(function (c) { return c.accountId === a.id; });
    cliRecs.forEach(function (rec) {
      var host = d.hostById[rec.hostId], env = d.envById[rec.envId];
      html += '<div class="u11w-cliacct" title="' + cbpIdentity(rec) + '"' + cbpIdentityFields(rec) + '>';
      html += '<div class="u11w-cliacct-h">' + ic('terminal') + '<b>' + rec.label + ' · v' + rec.cliVersion + '</b>' +
        '<span>' + (host ? host.label : rec.hostId) + ' · ' + (env ? env.label : rec.envId) + '</span></div>';
      html += cbpProbeRowsHTML(rec);
      html += '<div class="u11w-clicredit" title="' + cbpCreditsTitle(rec) + '"' + cbpCreditsFields(rec) + '>' + ic('coin') +
        '<span>' + cbpCreditsLine(rec) + ' · a credit pool only — never tokens, never a price, never a quota, never a provider total</span></div>';
      html += '</div>';
    });
    /* pressure and its reset belong on the row in every grouping, not only
       when the widget happens to be grouped by pressure */
    if (f.top) {
      var rt = meterResetText(f.top, d, T());
      html += '<div class="u11w-acctpress">' + (f.topProduct ? f.topProduct.label + ' · ' : '') + meterWindow(f.top) +
        ' · ' + f.top.usedPct + '% used' + vsChipIf(f.top.vs) + confChipIf(f.top.conf) +
        (rt ? ' · ' + rt : '') + '</div>';
    } else {
      html += '<div class="u11w-acctpress">No readable meter on this account · pressure unknown, not zero</div>';
    }
    if (f.nextProduct) {
      html += sub('What happens next · ' + f.nextProduct.label + ' · ' + d.continuation[f.nextProduct.id].whatHappensNext);
    } else {
      html += sub('What happens next · no continuation policy is published for this account');
    }
    if (f.routedAway || f.servedInstead) {
      html += sub('Requested versus used · ' +
        (f.routedAway ? f.routedAway + ' request' + (f.routedAway > 1 ? 's' : '') + ' asked for this account and ran elsewhere' : '') +
        (f.routedAway && f.servedInstead ? ' · ' : '') +
        (f.servedInstead ? f.servedInstead + ' request' + (f.servedInstead > 1 ? 's' : '') + ' asked for another account and ran here' : ''));
    }
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
    html += vrow('h-teal', 'Context cache hit', pval(ratePct(ctx.cacheHitRate)));
    /* one of the per-connection savings is a Puppet Master estimate, so the
       roll-up says so rather than presenting an estimate as a measurement */
    var saved = 0, anySave = false, estSave = 0;
    d.cacheStats.forEach(function (cs) {
      if (cs.save == null) return;
      saved += cs.save; anySave = true;
      if (cs.state === 'estimated') estSave += 1;
    });
    html += vrow('h-lime', 'Prompt-cache saved today' + (estSave ? ' · includes ' + estSave + ' estimate' + (estSave > 1 ? 's' : '') : ''),
      anySave ? pval(fmt().cost(saved)) : unkVal('not reported'));
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

  /* ---------- the forecast, rendered as a reading (audit A06-12) ----------
     The pane used to print a frozen recommendation, a frozen confidence line
     and "generated HH:MM" from a timestamp nothing ever moved, so pressing
     "Refresh forecast" left the pane byte-identical: the affordance dispatched
     the canonical command and recomputed nothing.

     U11.recomputeForecast owns the arithmetic — this only formats it. Every
     row below is one derived figure with its unit, and a figure that has no
     input behind it says "not projected" rather than borrowing a zero: the
     planning run records no elapsed range, so it projects no finish time, and
     that absence is visible instead of being papered over. The raw canonical
     pairs ride data-u11-fields, never the copy and never a tooltip. */
  function fcTone(p) {
    if (!p) return 'ok';
    if (p.budgetVerdict === 'over' || p.finishVerdict === 'after') return 'warn';
    if (p.budgetVerdict === 'tight' || p.finishVerdict === 'close') return 'warn';
    return 'ok';
  }
  function forecastBlock(fc) {
    var d = D();
    var p = fc.projection;
    var html = '<div class="u11w-next ' + fcTone(p) + '">' + ic('check') +
      '<span>' + fc.recommendation + '</span></div>';
    if (!p) {
      html += sub(fc.confidence);
      return html;
    }
    var perUnit = p.unitNoun === 'members' ? 'member' : 'child';
    var meter = p.resetMeterId ? d.meterById[p.resetMeterId] : null;
    var prod = meter && meter.productId ? d.productById[meter.productId] : null;
    var resetLab = meter ? ((prod ? prod.label + ' · ' : '') + meter.label) : null;

    html += '<div class="u11w-rows u11w-fcproj"' + diagFields([
      ['forecast_id', fc.id],
      ['generation', p.generation],
      ['budget_verdict', p.budgetVerdict.replace(/ /g, '_')],
      ['finish_verdict', p.finishVerdict.replace(/ /g, '_')],
      ['projected_tokens_low', p.tokensLo], ['projected_tokens_high', p.tokensHi],
      ['usable_tokens', p.usableTokens],
      ['projected_minutes_low', p.minutesLo], ['projected_minutes_high', p.minutesHi],
      ['reset_meter_id', p.resetMeterId], ['minutes_to_reset', p.minutesToReset]
    ]) + '>';
    html += vrow('h-orange', 'Still to run',
      pval(p.queued + ' queued ' + p.unitNoun + ' · ' + p.concurrency + ' at a time'));
    html += vrow('h-blue', 'Waves still to run',
      p.wavesPlanned == null ? valHTML(p.wavesLeft)
        : pval(p.wavesLeft + ' of ' + p.wavesPlanned + ' planned'));
    html += vrow('h-teal', 'Usage it projects',
      p.tokensLo == null ? unkVal('not projected')
        : pval(fmt().tok(p.tokensLo) + '–' + fmt().tok(p.tokensHi), 'tokens'));
    /* static, not a count-up: a reading is a statement taken at an instant,
       and a tweening number in it would make two identical readings look
       different while they were still settling */
    html += vrow('h-purple', 'Budget it spends against',
      p.usableTokens == null ? unkVal('not recorded') : pval(fmt().tok(p.usableTokens), 'tokens'));
    html += vrow('h-lime', 'Time it projects',
      p.minutesLo == null ? unkVal('not projected')
        : pval(p.minutesLo + '–' + p.minutesHi, 'min'));
    html += vrow('h-mute', 'Window it is racing',
      p.resetAt == null ? unkVal('none still ahead')
        : pval(T().when(p.resetAt, d.meta.now, 'reset')), 'dim');
    html += '</div>';

    if (p.tokensLo != null && p.usableTokens != null) {
      html += sub('Projected from ' + p.queued + ' queued ' + p.unitNoun + ' × ' +
        fmt().tok(p.perChildLo) + '–' + fmt().tok(p.perChildHi) + ' per ' + perUnit +
        ', against ' + fmt().tok(p.usableTokens) + ' usable once the ' +
        fmt().tok(p.reservedTokens) + ' reserve is held back' +
        (p.headroomTokens != null
          ? ' — ' + (p.headroomTokens >= 0
            ? fmt().tok(p.headroomTokens) + ' to spare at the high end'
            : fmt().tok(Math.abs(p.headroomTokens)) + ' short at the high end')
          : '') + '.');
    }
    if (resetLab) {
      html += sub('The window ahead of this run is the ' + resetLab +
        ', and how much of it is left is what moves between readings.');
    }
    html += sub(fc.confidence + ' · reading ' + p.generation + ' · taken as of ' +
      T().atClock(p.computedAt) +
      (p.elapsedMs != null ? ' · this run has been open ' + T().dur(p.elapsedMs) : ''));
    if (p.generation > 1) {
      html += sub(p.movedSince && p.movedSince.length
        ? 'This reading is not the previous one redrawn · ' + p.movedSince.join(', ') +
          ' moved since reading ' + (p.generation - 1) + ', and the figures above followed.'
        : 'Recomputed against the same inputs as reading ' + (p.generation - 1) +
          ' and it came back the same — nothing this forecast depends on has moved.');
    }
    html += sub('It is advice, not a promise: every figure above is a range over what similar work has cost, ' +
      'read against what this run has actually admitted and against the window still ahead of it. ' +
      'Take the reading again and it follows those inputs — it does not restate the last one.');
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

    /* Workers add up across concurrent runs; wave depth does not. The three
       runs execute on three different hosts, so summing their wave plans
       produced a "9" no run needs and nothing a user could act on. Requested,
       admitted and queued stay sums; the wave tile reports the longest single
       plan and says so. */
    var totReq = 0, totAdm = 0, totQue = 0, maxWav = null, maxWavRun = null;
    runs.forEach(function (run) {
      var req = run.requested.children != null ? run.requested.children : run.requested.members;
      var adm = run.admitted.now;
      var que = run.queued.children != null ? run.queued.children : run.queued.members;
      totReq += req; totAdm += adm; totQue += que;
      if (run.queued.waves != null && (maxWav == null || run.queued.waves > maxWav)) { maxWav = run.queued.waves; maxWavRun = run; }
    });
    html += tiles([
      { v: totReq, label: 'Requested', icon: 'gauge', hue: 'h-blue' },
      { v: totAdm, label: 'Can run now', icon: 'check', hue: 'h-lime' },
      { v: totQue, label: 'Queued', icon: 'inbox', hue: 'h-orange' },
      { v: maxWav, label: 'Longest wave plan', icon: 'layers', hue: 'h-purple' }
    ]);
    html += sub('Across ' + runs.length + ' active run' + (runs.length > 1 ? 's' : '') +
      ' · requested, can run now and queued are worker counts and add up. Wave depth does not add up — these runs are concurrent on different hosts — so the longest single plan is shown' +
      (maxWavRun ? ' (' + maxWavRun.title + ')' : '') + '.');

    runs.forEach(function (run) {
      var fc = run.forecastId ? d.forecastById[run.forecastId] : null;
      var req = run.requested.children != null ? run.requested.children : run.requested.members;
      var admitted = run.admitted.now;
      var queued = run.queued.children != null ? run.queued.children : run.queued.members;
      var waves = run.queued.waves;
      var kindLab = run.kind === 'goal' ? 'Goal' : (run.kind === 'planning_run' ? 'Planning run' : 'Crew');

      html += '<div class="u11w-prow">';
      html += '<div class="u11w-atop"><span class="u11w-aname" title="' + attrSafe(run.title) + '">' + run.title +
        '</span><span class="u11w-kind">' + kindLab + '</span></div>';
      html += '<div class="u11w-rows">';
      html += vrow('h-blue', 'Requested', valHTML(req));
      html += vrow('h-lime', 'Can run now', valHTML(admitted));
      html += vrow('h-orange', 'Queued', valHTML(queued));
      html += '</div>';
      var subTxt = admitted + ' at a time · ' + waves + ' waves';
      if ((!run.reserve) && run.reservedFor && run.reservedFor.length) subTxt += ' · capacity kept aside for ' + run.reservedFor.join(', ');
      html += sub(subTxt);
      if (run.capacity) {
        var cap = run.capacity;
        /* five ceilings and, since nothing rendered it, the sixth maximum:
           what actually ran at once */
        html += '<div class="u11w-sub dimtxt u11w-capenv"' +
          (cap.actualPeakBasis ? ' title="' + attrSafe('actual peak · ' + cap.actualPeakBasis) + '"' : '') + '>' +
          cap.hardMax + ' hard max · ' + cap.configuredPreferred +
          ' preferred · ' + cap.providerAdvertised + ' advertised · ' + cap.predictedSustainable + ' sustainable' +
          (cap.actualPeak != null ? ' · ' + cap.actualPeak + ' actual peak' +
            (cap.actualPeakAt ? ' at ' + T().atClock(cap.actualPeakAt) : '') : '') + '</div>';
        /* Reference canon item 20 / audit A06-15: these ceilings are a
           COMPLETION FORECAST. Bare, the adjacent hard maximum reads as the
           number of agents Puppet Master supports, which is the phrasing item
           40 forbids. The run-detail block carries this sentence; the widget
           line carries the same one rather than a shorter cousin of it. */
        html += sub('Reason: completion forecast, not a hard provider concurrency limit. ' +
          'The hard maximum of ' + cap.hardMax + ' is Puppet Master’s own safety ceiling, and the ' +
          'admitted and sustainable figures are what this run is forecast to finish with.');
      }
      /* The reserve used to be four category words with no quantity behind
         them, so nothing on the page could be seen to be smaller because of
         it. It is a budget: what it holds back, and what that costs the run. */
      if (run.reserve) {
        var rs = run.reserve;
        html += '<div class="u11w-rows">';
        html += vrow('h-purple', 'Reserved worker slots', rs.workers == null ? unkVal('not reported') : valHTML(rs.workers));
        html += vrow('h-teal', 'Reserved tokens', rs.tokens == null ? unkVal('not reported') : valHTML(rs.tokens, '', { fmt: 'tok' }));
        html += vrow('h-mute', 'Reserved spend', pval(costShort(rs)), 'dim');
        html += '</div>';
        html += sub('Kept aside for ' + (rs.categories || []).join(', ') +
          (rs.workersNote ? ' · ' + rs.workersNote : '') + (rs.tokensNote ? ' · ' + rs.tokensNote : ''));
        if (rs.effect) {
          html += '<div class="u11w-sub u11w-resfx" title="' + attrSafe('affected figure · ' + rs.effect.field) + '">' +
            'Effect · ' + fmt().tok(rs.effect.withoutReserve) + ' ' + rs.effect.unit + ' usable without the reserve, ' +
            fmt().tok(rs.effect.withReserve) + ' with it · the forecast this run is judged against uses the smaller figure.</div>';
        }
      }
      if (fc) {
        html += forecastBlock(fc);
        html += cta('Refresh forecast', 'data-u11-act="reqforecast" data-run="' + run.id + '"');
      }
      html += cta('Open run detail', 'data-u11-act="openrun" data-run="' + run.id + '"');
      html += '</div>';
    });
    html += note('Usage supplies the forecast. Goal Runtime owns admission, scheduling, waves, and dispatch.');
    html += footActs(item);
    return html;
  }

  /* ---------- runs: Runs & agents (Standard+) ----------
     A run states its workers either as a member list or as an admission
     block. Deriving all three counters from `members` alone printed
     "Running 0 / Done 0 / Queued 0" for a running planning run that the very
     same dataset — and the capacity widget one card away — describes as 2
     admitted and 4 queued. Read whichever form the run actually carries, say
     which one was read, and leave the counter that form cannot answer
     unknown instead of zero. */
  function runCounts(run) {
    var members = run.members || [];
    var req = run.requested || {}, qu = run.queued || {};
    var requested = req.children != null ? req.children : (req.members != null ? req.members : null);
    if (members.length) {
      return {
        running: members.filter(function (m) { return m.state === 'running'; }).length,
        done: members.filter(function (m) { return m.state === 'completed'; }).length,
        queued: members.filter(function (m) { return m.state === 'queued'; }).length,
        requested: requested, basis: 'member list'
      };
    }
    return {
      running: run.admitted ? run.admitted.now : null,
      done: null,
      queued: qu.children != null ? qu.children : (qu.members != null ? qu.members : null),
      requested: requested, basis: 'admission block'
    };
  }
  function renderRuns(item, sizeKey) {
    var d = D();
    var html = topStrip(item);
    d.runs.forEach(function (run) {
      var kindLab = run.kind === 'goal' ? 'Goal' : (run.kind === 'planning_run' ? 'Planning run' : 'Crew');
      var visLab = run.visibility === 'visible' ? 'visible' : (run.visibility === 'internal' ? 'internal' : 'orchestrator');
      var c = runCounts(run);

      html += '<div class="u11w-prow">';
      html += '<div class="u11w-atop"><span class="u11w-aname" title="' + attrSafe(run.title) + '">' + run.title +
        '</span><span class="u11w-kind">' + kindLab + '</span></div>';
      html += '<div class="u11w-rows">';
      html += vrow('h-mute', 'Requested', c.requested == null ? unkVal('not reported') : valHTML(c.requested));
      html += vrow('h-lime', c.basis === 'member list' ? 'Running' : 'Can run now', c.running == null ? unkVal('not reported') : valHTML(c.running));
      html += vrow('h-blue', 'Done', c.done == null ? unkVal('not broken out') : valHTML(c.done));
      html += vrow('h-orange', 'Queued', c.queued == null ? unkVal('not reported') : valHTML(c.queued));
      html += '</div>';
      html += sub('Counted from this run’s ' + c.basis +
        (c.basis === 'admission block' ? ' — it reports admission, not a per-member list, so completed work is not broken out here.' : '.'));
      var subTxt = run.stage + ' · ' + visLab;
      if (run.timing && sizeKey !== 'S') {
        var tm = run.timing;
        var active = null;
        tm.rows.forEach(function (r) { if (r.label === 'Provider/model active') active = r; });
        subTxt += ' · elapsed ' + T().dur(tm.elapsedMs) +
          (active ? ' · provider active ' + T().dur(active.ms) : '');
      }
      html += sub(subTxt);
      html += sub(lineageText(run));
      html += cta('Open run detail', 'data-u11-act="openrun" data-run="' + run.id + '" title="Owning surface: ' + R().human(run.owningSurface) + ' · visibility: ' + visLab + '"');
      html += '</div>';
    });
    html += note('Worker counts come from whichever form each run records. Goal Runtime and the Orchestrator own admission, scheduling and waves; this room only reports them.');
    html += footActs(item);
    return html;
  }

  /* ---------- free: Free Models lens ---------- */
  var FREE_COND_LABEL = {
    request_limited: 'Free, limited', token_day: 'Free, limited', compute_units: 'Free, limited',
    conditional_on_plan: 'Free with account requirements', free_until: 'Free until a date',
    keyless_shared: 'Shared free access', local: 'Local'
  };
  /* Every Free Models row — eligible, cooling, ended or unverified — must name
     the route underneath it: provider family, account/profile, and the
     connection (plus the product when a meter pins one). A free route is a
     lens over a real account, never an identity of its own, so a row that
     cannot say which account it belongs to is a hard failure. */
  function freeIdentity(fm) {
    var d = D();
    var conn = fm.connectionId ? d.connectionById[fm.connectionId] : null;
    var acct = conn ? d.accountById[conn.accountId] : null;
    var fam = acct ? d.familyById[acct.familyId] : null;
    var meter = fm.meterId ? d.meterById[fm.meterId] : null;
    var prod = meter ? d.productById[meter.productId] : null;
    var parts = [];
    if (fam && acct) parts.push(d.accountLabel(acct.id));
    else if (fam) parts.push(fam.label + ' · account not identified');
    else parts.push('Underlying provider and account not identified');
    parts.push(conn ? conn.label : 'connection not identified');
    if (prod) parts.push(prod.label);
    if (acct && acct.detail) parts.push(acct.detail);
    /* a connection and its product sometimes share a name — say it once */
    return parts.filter(function (p, i) { return i === 0 || p !== parts[i - 1]; }).join(' · ');
  }
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
        var model = d.modelById[fm.modelId];
        var meter = fm.meterId ? d.meterById[fm.meterId] : null;
        var cooling = fm.cooldownUntil && Date.parse(fm.cooldownUntil) > Date.parse(d.meta.now);
        html += '<div class="u11w-prow' + (cooling ? ' dim' : '') + '">';
        html += '<div class="u11w-atop"><span class="u11w-aname" title="' + attrSafe(model.label) + '">' + model.label + '</span></div>';
        html += sub(freeIdentity(fm));
        html += sub(fm.label + ' · selected through Free Models' + (cooling ? ' · cooling down' : ''));
        if (cooling) {
          html += '<div class="u11w-sub warntxt">Cooldown · back in ' + T().dur(Date.parse(fm.cooldownUntil) - Date.parse(d.meta.now)) + '</div>';
        }
        if (meter && meter.usedPct != null) {
          var t2 = toneForPct(meter.usedPct);
          html += mrow('Allowance used' + vsChipIf(meter.vs) + confChipIf(meter.conf),
            valHTML(meter.usedPct, '% used'), meter.usedPct, t2 === 'hot' ? 'f-pink' : t2 === 'warn' ? 'f-orange' : 'f-lime');
        }
        if (meter) {
          html += sub([meterWindow(meter), meterNative(item, meter), meterResetText(meter, d, T())].filter(Boolean).join(' · '));
          var split = allowanceSplitText(meter);
          if (split) html += '<div class="u11w-sub warntxt">' + split + '</div>';
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
        html += '<div class="u11w-prow dim"><div class="u11w-atop"><span class="u11w-aname" title="' +
          attrSafe(d.modelById[fm.modelId].label) + '">' + d.modelById[fm.modelId].label + '</span></div>' +
          sub(freeIdentity(fm)) +
          sub(fm.label + ' · selected through Free Models · ' + fm.detail) +
          '<div class="u11w-sub warntxt">Not selectable now · the route above stays set up and keeps its own usage</div></div>';
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
  /* A chart column aggregates every route in the range, so no published
     counting-semantics row applies to it: the honest column total is the
     exclusive input + output sum. Cache read keeps its own band but is never
     added on top, because adding it would double-count every provider that
     reports cache inside input. */
  function anColTotal(col) {
    return tokenTotal({ input: col[1], output: col[2], cacheRead: col[4] }, null, { subject: 'range' });
  }
  /* the series list carries a reasoning bucket, but the renderer only draws a
     band an event substantiates — if nothing in the ledger reports
     tokens.reasoning the band is withheld and the legend says so. */
  function reasoningReported() {
    var atts = D().attempts || [];
    for (var i = 0; i < atts.length; i++) {
      if (atts[i].tokens && atts[i].tokens.reasoning != null) return true;
    }
    return false;
  }
  /* ---------- per model / provider / account breakdown ----------
     "Per model/provider/account sorting" was two thirds implemented: nothing
     anywhere grouped, scoped or sorted by MODEL, and every sort control the
     concept had lived behind a kebab. This breakdown groups the real attempt
     records and totals them through tokenTotalMany, so a group total and the
     ledger rows under it cannot disagree, and a group nobody reported stays
     unknown instead of summing to zero. */
  var BD_GROUPS = { model: 'Model', provider: 'Provider', account: 'Account' };
  function breakdownGroups(scope, groupBy) {
    var d = D(), map = {}, order = [];
    d.attempts.forEach(function (a) {
      if (!d.attemptInScope(a, scope)) return;
      var key, label, acct, fam, mid, mo;
      if (groupBy === 'provider') {
        acct = d.accountById[a.effectiveAccountId || a.requestedAccountId];
        fam = acct ? d.familyById[acct.familyId] : null;
        key = fam ? fam.id : 'route:unidentified'; label = fam ? fam.label : 'Provider not identified';
      } else if (groupBy === 'account') {
        acct = d.accountById[a.effectiveAccountId || a.requestedAccountId];
        key = acct ? acct.id : 'route:unidentified'; label = acct ? d.accountLabel(acct.id) : 'Account not identified';
      } else {
        mid = a.effectiveModelId || a.requestedModelId;
        mo = mid ? d.modelById[mid] : null;
        key = mid || 'route:unidentified'; label = mo ? mo.label : 'Model not identified';
      }
      var g = map[key];
      if (!g) {
        g = map[key] = { key: key, label: label, recs: [], attempts: 0, costMicro: 0, priced: 0, hidden: 0, unknown: 0 };
        order.push(g);
      }
      g.recs.push(a);
      g.attempts += 1;
      var cst = costState(a);
      if (cst === 'priced' || cst === 'reported zero') { g.costMicro += a.costMicro || 0; g.priced += 1; }
      else if (cst === 'unknown') g.unknown += 1;
      else g.hidden += 1;
    });
    order.forEach(function (g) { g.tok = tokenTotalMany(g.recs, { subject: 'group' }); });
    return order;
  }
  function breakdownHTML(item, scope) {
    var gby = (item.cfg && item.cfg.groupby) || 'model';
    var bsort = (item.cfg && item.cfg.bsort) || 'tokens';
    var groups = breakdownGroups(scope, gby);
    if (!groups.length) return '';
    groups.sort(function (a, b) {
      var at = a.tok.total == null ? -1 : a.tok.total, bt = b.tok.total == null ? -1 : b.tok.total;
      if (bsort === 'name') return a.label.localeCompare(b.label);
      if (bsort === 'attempts') return (b.attempts - a.attempts) || (bt - at);
      if (bsort === 'cost') return ((b.priced ? b.costMicro : -1) - (a.priced ? a.costMicro : -1)) || (bt - at);
      return bt - at;
    });
    /* the table is tall and this card also carries the chart, so it opens from
       one labelled control in the card body — not from the kebab sheet, which
       is where every sort control in this concept used to hide. The open state
       lives in the instance config so a sort or a regroup does not close it. */
    var open = (item.cfg && item.cfg.bdopen) === 'on';
    var html = '<div class="u11w-bd">' +
      '<button type="button" class="u11w-minibtn u11w-bdtog' + (open ? ' on' : '') +
      '" data-u11-act="bdopen" data-s="' + (open ? 'off' : 'on') + '" aria-expanded="' + open + '">' +
      ic('chevD') + '<span>' + (open ? 'Hide the breakdown' : 'Break down by model, provider or account') + '</span></button>';
    if (!open) return html + '</div>';
    html += '<div class="u11w-bdctl"><span class="u11w-bdlab">Break down by</span>';
    Object.keys(BD_GROUPS).forEach(function (k) {
      html += '<button type="button" class="u11w-minibtn' + (k === gby ? ' on' : '') +
        '" data-u11-act="bgroup" data-g="' + k + '" aria-pressed="' + (k === gby) + '">' + BD_GROUPS[k] + '</button>';
    });
    html += '</div>';
    html += '<div class="u11w-tbl"><table class="us-tbl"><thead><tr>' +
      sortTh('name', BD_GROUPS[gby], bsort, 'bsort') +
      sortTh('tokens', 'Tokens', bsort, 'bsort', true) +
      sortTh('attempts', 'Attempts', bsort, 'bsort', true) +
      sortTh('cost', 'Cost', bsort, 'bsort', true) +
      '</tr></thead><tbody>';
    groups.forEach(function (g) {
      var costCell;
      if (!g.priced) costCell = '<span class="u11w-dimtxt">' + (g.hidden ? 'no price shown here' : 'not priced') + '</span>';
      else if (g.costMicro === 0) costCell = moneyFmt(0) + ' <i class="u11w-bdmini">reported</i>';
      else costCell = moneyFmt(g.costMicro);
      var hidNote = [];
      if (g.hidden) hidNote.push(g.hidden + ' hidden');
      if (g.unknown) hidNote.push(g.unknown + ' unknown');
      html += '<tr><td title="' + attrSafe(g.tok.note) + '">' + g.label + '</td>' +
        '<td class="num">' + (g.tok.total == null ? '<span class="u11w-dimtxt">not reported</span>' : fmt().tok(g.tok.total)) + '</td>' +
        '<td class="num">' + g.attempts + '</td>' +
        '<td class="num">' + costCell + (hidNote.length ? ' <i class="u11w-bdmini">' + hidNote.join(' · ') + '</i>' : '') + '</td></tr>';
    });
    html += '</tbody></table></div>';
    html += sub('Totals use each route’s published counting basis, so cache read is added only where the provider bills it as its own bucket. A cost column that says hidden or unknown is a cost Puppet Master does not hold — never a zero.');
    return html + '</div>';
  }

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
    var hasReason = reasoningReported();
    if (compare === 'prev') {
      var tot = 0;
      chart.cols.forEach(function (c) { var r = anColTotal(c); if (r.total != null) tot += r.total; });
      var prev = Math.round(tot * 0.88);
      var delta = Math.round((tot - prev) / prev * 100);
      html += '<span class="u11w-cmp" title="Demo comparison against the previous ' + win + '">' + ic('trend') +
        '<span>' + (delta >= 0 ? '+' : '') + delta + '% tokens vs previous ' + win + '</span></span>';
    }
    html += '</div>';

    /* the bar height normalises over the bands actually drawn, so the picture
       and the stated total describe the same buckets */
    var max = 0;
    chart.cols.forEach(function (col) {
      var stack = col[1] + col[2] + col[4] + (hasReason ? col[3] : 0);
      if (stack > max) max = stack;
    });
    html += '<div class="u11w-chart">';
    chart.cols.forEach(function (col) {
      var res = anColTotal(col);
      var title = col[0] + ' · ' + (res.total == null ? 'not reported' : res.total + 'k tokens') +
        ' · ' + res.basis +
        (col[4] ? ' · cache read ' + col[4] + 'k shown beside it, not added' : '') +
        ' · ' + res.note;
      html += '<div class="u11w-col" title="' + title + '">';
      html += '<span class="u11w-colbar">';
      AN_SERIES.forEach(function (s) {
        if (s.cls === 's-reason' && !hasReason) return;
        var v = col[s.key];
        if (!v) return;
        html += '<i class="' + s.cls + '" data-h="' + Math.round(v / max * 100) + '" style="height:0%"></i>';
      });
      html += '</span><span class="u11w-collab">' + col[0] + '</span></div>';
    });
    html += '</div>';

    html += '<div class="u11w-legend">';
    AN_SERIES.forEach(function (s) {
      if (s.cls === 's-reason' && !hasReason) {
        html += '<span class="u11w-leg muted" title="No usage event in this range reports a reasoning bucket, so no Reasoning band is drawn. Unknown, not zero.">' +
          '<span class="u11w-legdot ' + s.cls + '"></span>' + s.label + ' · not reported</span>';
        return;
      }
      html += '<button type="button" class="u11w-leg" data-u11-act="aser" data-ser="' + s.cls + '"><span class="u11w-legdot ' + s.cls + '"></span>' + s.label + '</button>';
    });
    html += '</div>';
    /* a band is only as good as the events behind it: the chart and the
       ledger are two views of the same records, so the chart says how many
       records report the bucket it draws and the ledger row for each of them
       now prints that bucket too */
    var reasonAtts = d.attempts.filter(function (a) { return a.tokens && a.tokens.reasoning != null; });
    html += sub(hasReason
      ? plural(reasonAtts.length, 'usage event reports a reasoning bucket', 'usage events report a reasoning bucket') +
        ' of ' + d.attempts.length + ' · each one prints the same bucket on its Ledger row, so the band can be checked against them rather than taken on trust.'
      : 'No usage event in this range reports a reasoning bucket, so no Reasoning band is drawn — unknown, not zero.');
    html += breakdownHTML(item, effScope(item));
    html += note('Column totals add input plus output only. A range mixes routes whose counting rules differ, so cache read keeps its own band and is never added on top — adding it would double-count every provider that reports cache inside input.');
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
  /* Five buckets are canonical, and this label used to emit three: an event
     that reported reasoning or a cache write showed neither here, so the
     analytics Reasoning band had no ledger row to reconcile against. A bucket
     the provider did not report is still omitted rather than printed as 0. */
  function attemptTokensLabel(item, a) {
    var t = a.tokens || {};
    var parts = [];
    if (t.input != null) parts.push(numfmt(item, t.input) + ' input');
    if (t.output != null) parts.push(numfmt(item, t.output) + ' output');
    if (t.reasoning != null) parts.push(numfmt(item, t.reasoning) + ' reasoning');
    if (t.cacheRead != null) parts.push(numfmt(item, t.cacheRead) + ' cache read');
    if (t.cacheWrite != null) parts.push(numfmt(item, t.cacheWrite) + ' cache write');
    return parts.join(' · ');
  }
  /* the buckets this GROUP actually reported, so a sum is only shown for a
     bucket some attempt in it stated — an unreported bucket stays off the
     line instead of being added in as a zero */
  function groupReported(list, key) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].tokens && list[i].tokens[key] != null) return true;
    }
    return false;
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  /* a child call is a subagent, a crew member or a mixture-of-agents worker,
     and each of those has its own name — "subagents" was applied to all of
     them and to the headline attempt as well */
  var CHILD_WORD = {
    subagent: ['subagent', 'subagents'],
    crew_member: ['crew member', 'crew members'],
    moa_reference: ['mixture-of-agents reference', 'mixture-of-agents references'],
    moa_aggregator: ['mixture-of-agents aggregator', 'mixture-of-agents aggregators']
  };
  function childWord(children) {
    var kinds = [];
    children.forEach(function (a) { if (kinds.indexOf(a.purpose) === -1) kinds.push(a.purpose); });
    var w = kinds.length === 1 ? CHILD_WORD[kinds[0]] : null;
    return w ? plural(children.length, w[0], w[1]) : plural(children.length, 'child call', 'child calls');
  }
  /* the provider families a set of attempts actually ran on. A logical work
     item that crossed four families was rendered under whichever member was
     read first, which is the one thing the dataset's own note forbids. */
  function routeSpread(list) {
    var d = D(), order = [], map = {};
    list.forEach(function (a) {
      var acct = d.accountById[a.effectiveAccountId || a.requestedAccountId];
      var famId = acct ? acct.familyId : null;
      var key = famId || 'route:unidentified';
      if (!map[key]) {
        map[key] = { familyId: famId, eventIds: [],
          label: famId && d.familyById[famId] ? d.familyById[famId].label : 'Route not identified' };
        order.push(map[key]);
      }
      map[key].eventIds.push(a.eventId);
    });
    return order;
  }
  function distinctRoutes(list) {
    var out = [];
    list.forEach(function (a) { var r = attemptRouteLabel(a); if (out.indexOf(r) === -1) out.push(r); });
    return out;
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
      var kindLab = R().human(g.work.kind);
      /* THE CARD DESCRIBES THE WORK ITEM, NOT ONE OF ITS ATTEMPTS.
         It used to render the first main-bucket attempt's route and tokens
         under the work item's title and call every other attempt a "helper
         call" — so an interrupted 6.2k attempt spoke for a work item that ran
         58.3k, and two user-work primaries were counted as helpers. Roles come
         from the roster (primary / helper / child are disjoint and add up),
         figures from the work total, and the route from the family spread. */
      var roster = d.workRoster ? d.workRoster(g.work.id, scope) : null;
      var totals = d.workTotals ? d.workTotals(g.work.id, scope) : null;
      var rAtts = (roster && roster.attempts.length) ? roster.attempts : attempts;
      var fams = routeSpread(rAtts);
      var routes = distinctRoutes(rAtts);
      var spread = (g.work.runId && d.runRouteSpread) ? d.runRouteSpread(g.work.runId) : null;

      html += '<div class="u11w-turncard">';
      html += '<div class="u11w-turnhead">';
      html += '<span class="u11w-turnkind">' + kindLab + '</span>';
      html += '<span class="u11w-turntt" title="' + attrSafe(g.work.label) + '">' + g.work.label + '</span>';
      html += '<span class="u11w-turntime">' + (g.work.endedAt ? T().atClock(g.work.endedAt) : 'now') + '</span>';
      html += '</div>';
      var multi = routes.length > 1;
      var routeLab = routes.length === 1 ? routes[0]
        : (fams.length > 1
          ? plural(fams.length, 'provider family', 'provider families') + ' · ' + fams.map(function (f) { return f.label; }).join(' · ')
          : fams[0].label + ' · ' + plural(routes.length, 'route on this family', 'routes on this family'));
      html += '<div class="u11w-turnroute' + (multi ? ' multi' : '') + '" title="' +
        attrSafe('route · ' + routes.join(' | ') + (spread ? ' · ' + spread.note : '')) + '">' + routeLab + '</div>';
      if (fams.length > 1) {
        html += '<div class="u11w-turnnote">' + (spread ? spread.note :
          'This work item ran across ' + fams.length + ' provider families. It is never collapsed under one member\'s route.') + '</div>';
      }
      /* the turn-level figure the card never had */
      var tokLab = '';
      if (totals && totals.total == null) {
        tokLab = 'no provider count reported for this work item — unknown, not zero';
      } else if (totals) {
        var tb = [];
        if (groupReported(rAtts, 'input')) tb.push(numfmt(item, totals.input_total) + ' input');
        if (groupReported(rAtts, 'output')) tb.push(numfmt(item, totals.output_total) + ' output');
        if (groupReported(rAtts, 'reasoning')) tb.push(numfmt(item, totals.reasoning) + ' reasoning');
        if (groupReported(rAtts, 'cacheRead')) tb.push(numfmt(item, totals.cache_read) + ' cache read');
        if (groupReported(rAtts, 'cacheWrite')) tb.push(numfmt(item, totals.cache_write) + ' cache write');
        tokLab = tb.join(' · ');
        if (totals.notReported) {
          tokLab += ' · ' + plural(totals.notReported, 'attempt reported no provider usage', 'attempts reported no provider usage');
        }
      } else {
        tokLab = attemptTokensLabel(item, main);
      }
      var many = totals ? U11W.tokenTotalMany(rAtts, { subject: 'work item' }) : null;
      html += '<div class="u11w-turntok" title="' + attrSafe('Work item total across ' +
        plural(rAtts.length, 'attempt', 'attempts') +
        (many && many.total != null ? ' · counted total ' + fmt().num(many.total) + ' tokens on the basis ' + many.basis : '') +
        (many ? ' · ' + many.note : '')) + '">Work item total · ' + (tokLab || 'no provider usage') + '</div>';
      /* one cost line for the work item, in the same five-case vocabulary */
      if (totals) {
        /* the five cases, counted over exactly the attempts workTotals added */
        var cc = costCaseCounts(roster ? roster.attempts : rAtts);
        var cb = [];
        if (cc.priced) cb.push(moneyFmt(cc.micro) + ' on ' + plural(cc.priced, 'priced call', 'priced calls'));
        /* a provider-reported zero is a measured zero, not a priced call and
           not a missing price — the same word the row below it uses */
        if (cc['reported zero']) {
          cb.push(COST_SHORT['reported zero'] + ' on ' +
            plural(cc['reported zero'], 'call', 'calls'));
        }
        if (cc.hidden_subscription) cb.push(plural(cc.hidden_subscription, 'call the plan covers', 'calls the plan cover'));
        if (cc.hidden_byok) cb.push(plural(cc.hidden_byok, 'call billed to your own key', 'calls billed to your own key'));
        if (cc.unknown) cb.push(plural(cc.unknown, 'call with no price reported', 'calls with no price reported'));
        html += '<div class="u11w-turntok dim">Cost · ' + (cb.length ? cb.join(' · ') : 'no price reported') + '</div>';
      }
      /* roles, disjoint and adding up to the attempt count */
      if (roster) {
        var rb = [plural(roster.counts.attempts, 'attempt', 'attempts')];
        if (roster.counts.primaries) rb.push(plural(roster.counts.primaries, 'primary call', 'primary calls'));
        if (roster.counts.helpers) rb.push(plural(roster.counts.helpers, 'helper call', 'helper calls'));
        if (roster.counts.children) rb.push(childWord(roster.children));
        html += '<div class="u11w-turnroster" title="' + attrSafe(roster.note) + '">' + rb.join(' · ') + '</div>';
        if (attempts.length !== rAtts.length) {
          html += sub('Filtered to ' + (d.buckets[bucketFilter] || bucketFilter) + ' · ' + attempts.length +
            ' of ' + rAtts.length + ' attempts shown. The totals above are the whole work item.');
        }
      }
      /* sessions were carried on every attempt and displayed nowhere */
      var sess = [];
      attempts.forEach(function (a) { if (a.sessionId && sess.indexOf(a.sessionId) === -1) sess.push(a.sessionId); });
      if (sess.length) html += sub('Session ' + sess.join(' · '));
      /* a mismatch or a redirect on a non-headline attempt used to be invisible */
      var seenNote = {};
      rAtts.forEach(function (a) {
        if (a.mismatch && a.mismatch.reason && !seenNote[a.mismatch.reason]) {
          seenNote[a.mismatch.reason] = 1;
          html += '<div class="u11w-mismatch">' + ic('alert') + '<span>' + a.mismatch.reason + '</span></div>';
        }
        if (a.redirect && a.redirect.note && !seenNote[a.redirect.note]) {
          seenNote[a.redirect.note] = 1;
          html += '<div class="u11w-mismatch info">' + ic('info') + '<span>' + a.redirect.note + '</span></div>';
        }
      });

      if (advanced) {
        html += '<div class="u11w-attempts">';
        attempts.forEach(function (a) {
          var stCls = a.status === 'failed' || a.status === 'interrupted' ? ' err' : (a.status === 'queued' ? ' dim' : '');
          html += '<div class="u11w-attrow' + stCls + '">';
          /* wide, these three still ellipsise — so each carries its own full
             string in a title and none of them is cut off silently */
          var bucketLab = d.buckets[a.bucket];
          var purposeLab = R().human(a.purpose);
          var attTok = attemptTokensLabel(item, a) || 'no provider usage';
          html += '<span class="u11w-attbucket" title="' + attrSafe('bucket · ' + bucketLab) + '">' + bucketLab + '</span>';
          html += '<span class="u11w-attpurpose" title="' + attrSafe('purpose · ' + purposeLab) + '">' + purposeLab + '</span>';
          html += '<span class="u11w-attstatus">' + R().human(STATUS_LABEL[a.status] || a.status) + '</span>';
          html += '<span class="u11w-atttok" title="' + attrSafe(attTok) + '">' + attTok + '</span>';
          /* a cost cell always renders: a hidden price, an unknown price and a
             provider-reported zero are three different facts and none of them
             is the absence of a cell */
          html += costCellHTML(a);
          /* The tooltip used to spell out the dedupe key and the pricing snapshot
             id. This bundle already settled that question once, when 39 raw enum
             pairs moved out of title attributes into data-u11-fields: a tooltip is
             read aloud and shown on hover, so it is user-facing text, and an
             internal key there is jargon a reader cannot act on. The keys ride the
             element as data attributes; the tooltip keeps what a person can use. */
          html += '<span class="u11w-attid" title="' + attrSafe('usage event ref and usage record id' +
            (a.streamState ? ' · stream state ' + R().human(a.streamState) : '') +
            (a.pricingVersion ? ' · priced from pricing version ' + a.pricingVersion : '')) + '"' +
            ' data-u11-rollup="' + attrSafe(a.dedupeKey || '') + '"' +
            ' data-u11-snapshot="' + attrSafe(a.pricingSnapshotId || '') + '">' + a.eventId + '</span>';
          html += '<button type="button" class="u11w-minibtn" data-u11-act="openattempt" data-att="' + a.eventId + '">inspect</button>';
          /* the row's own route: mixed-route work was only recoverable by
             opening each attempt, so the account a row ran on was invisible
             exactly where the rows sit side by side */
          var attRoute = attemptRouteLabel(a);
          html += '<span class="u11w-attroute" title="' + attrSafe('route · ' + attRoute +
            (a.requestedAccountId && a.effectiveAccountId && a.requestedAccountId !== a.effectiveAccountId
              ? ' · requested ' + d.accountLabel(a.requestedAccountId) + ' · served by ' + d.accountLabel(a.effectiveAccountId) : '')) +
            '">' + attRoute + '</span>';
          html += '</div>';
        });
        html += '</div>';
      } else {
        html += cta('Open attempt detail', 'data-u11-act="openattempt" data-att="' + main.eventId + '"');
      }
      html += '</div>';
    });

    if (!shown) html += '<div class="u11w-empty">' + ic('clipboard') + '<p>No usage events in this scope.</p></div>';

    /* Historical / removed-account rows always stay inspectable — and they
       keep the logical work they belong to. Two things used to go missing
       here: the group was dropped whenever a bucket filter was set, including
       the very bucket its own rows are in, and the rows were shown detached
       from their work, so "Legacy: catalog sync" appeared nowhere on the page.
       The bucket filter now applies to these rows like any other, and each
       removed-source group is headed by the work item it belongs to.

       And it is the PAGE SCOPE's list, not the whole dataset's: reading
       d.attempts directly put a removed OpenAI account's rows inside a
       Claude-only view, byte for byte identical under every scope, which is
       the proof that no scope was applied at all. attemptsInScope already
       answers both halves of the question — in this scope, and historical —
       so it answers them here rather than a hand-written filter. */
    var hist = d.attemptsInScope(scope, { include: 'historical' }).filter(function (a) {
      return a.historicalIdentity && (bucketFilter === 'all' || a.bucket === bucketFilter);
    });
    if (hist.length) {
      html += '<div class="u11w-freegroup">' + sub('Historical · removed sources');
      var hOrder = [], hByWork = {};
      hist.forEach(function (a) {
        var k = a.workId || 'work:none';
        if (!hByWork[k]) { hByWork[k] = []; hOrder.push(k); }
        hByWork[k].push(a);
      });
      hOrder.forEach(function (k) {
        var w = d.workById ? d.workById[k] : null;
        var hAtts = hByWork[k];
        html += '<div class="u11w-histwork">';
        html += '<div class="u11w-turnhead"><span class="u11w-turnkind">' +
          (w ? R().human(w.kind) : 'no logical work') + '</span>' +
          '<span class="u11w-turntt" title="' + attrSafe(w ? w.label : 'These events carry no logical work') + '">' +
          (w ? w.label : 'No logical work recorded') + '</span>' +
          '<span class="u11w-turntime">removed source</span></div>';
        /* The heading totals the ROWS UNDERNEATH IT and says so. It used to
           print d.workTotals(w.id) — the whole work item, unscoped and
           unfiltered — above a list holding only that work's historical
           attempts: correct only while every attempt of the work happened to
           be historical, and a full work total under a "removed source"
           heading the moment one of them was not. tokenTotalMany is the one
           summation, run over the rows actually shown. */
        var hMany = U11W.tokenTotalMany(hAtts, { subject: 'removed-source group' });
        html += '<div class="u11w-turntok" title="' + attrSafe('Totals the ' +
          plural(hAtts.length, 'row', 'rows') + ' shown here, not the whole work item' +
          (hMany.total != null ? ' · counted on the basis ' + hMany.basis : '') +
          (hMany.note ? ' · ' + hMany.note : '')) + '">Rows shown · ' +
          (hMany.total != null
            ? numfmt(item, hMany.total) + ' tokens'
            : 'no provider count reported — unknown, not zero') +
          ' · ' + plural(hAtts.length, 'attempt', 'attempts') + '</div>';
        hAtts.forEach(function (a) {
          html += '<div class="u11w-prow dim"><div class="u11w-atop"><span class="u11w-aname" title="' +
            attrSafe(a.historicalIdentity.label) + '">' + a.historicalIdentity.label + '</span>' +
            '<span class="u11w-adetail" title="' + attrSafe(T().stamp(a.startedAt)) + '">' + T().stamp(a.startedAt) + '</span></div>' +
            sub((attemptTokensLabel(item, a) || 'no provider usage') + ' · ' + costShort(a) +
              ' · ' + (d.buckets[a.bucket] || a.bucket) + ' · ' + R().human(a.purpose)) +
            '<div class="u11w-cta"><button type="button" class="u11w-minibtn" data-u11-act="openattempt" data-att="' + a.eventId + '">inspect</button></div></div>';
        });
        html += '</div>';
      });
      html += sub('A removed account keeps its history. These events are not current usage, and they stay grouped under the work they were part of.');
      html += '</div>';
    }
    html += footActs(item);
    return denseWrap(item, html);
  }

  /* ---------- operations: maintenance & operations (packet §04) ---------- */
  var OPS_KIND_ICON = { cli_update: 'route', offline_outbox: 'alert', server_continuity: 'check',
    sound_preview: 'check', notification_test: 'check', backup: 'check', project_move: 'check',
    setup_required: 'alert' };
  /* An internal event id inside user-facing prose is a dead end: the card told
     the reader to "see ue-610" and gave them nothing to click, while the card
     above it had a proper CTA for the same kind of join. Every usage-event ref
     in operational copy becomes the affordance the sentence promises.

     Corrected again 2026-08-18. The first repair added the affordance but left
     the BARE ID as the button's visible label, so "see ue-610" became a link
     that still read "see ue-610" - the dead end was now clickable, which is not
     the same as being readable. The label is now built from the record's own
     purpose and start time; the id moves to a data attribute so a developer
     keeps the join without a reader being shown a token they cannot use. */
  function eventLabel(id) {
    var a = (D().attemptById || {})[id];
    /* No purpose on the record means no honest name. A neutral noun is correct
       here and a borrowed one is not: a plausible wrong label cannot be spotted
       by the reader, whereas a raw id at least announces itself as opaque. */
    if (!a || !a.purpose) return 'this usage event';
    var t = (T() && T().clock && a.startedAt != null) ? T().clock(a.startedAt) : null;
    return R().human(a.purpose) + (t ? ' at ' + t : '');
  }
  function eventLink(id, label) {
    var text = label || eventLabel(id);
    return '<button type="button" class="u11w-evlink" data-u11-act="openattempt" data-att="' + id +
      '" data-u11-event="' + attrSafe(id) + '" title="' + attrSafe('Open ' + text) + '">' + text + '</button>';
  }
  function linkEventIds(text) {
    return String(text == null ? '' : text).replace(/\bue-\d+\b/g, function (id) { return eventLink(id); });
  }
  /* A maintenance record's own state is its outcome. Rendering status in the
     badge put a green "completed" directly above "Provider Setup Required",
     because the acquisition was blocked while the flow that asked for it had
     finished running. Both facts are kept; the badge shows the one that says
     what happened. */
  var OPS_STATE_TONE = { rolled_back: 'warn', setup_required: 'warn', failed: 'warn',
    blocked: 'warn', cancelled: 'warn', completed: 'ok' };
  function opsStateBadge(op) {
    var state = op.outcome || op.status;
    return '<span class="u11w-kind ' + (OPS_STATE_TONE[state] || '') + '" title="' +
      attrSafe('outcome ' + R().human(op.outcome || 'not recorded') + ' · status ' + R().human(op.status) +
        (op.failureClass ? ' · failure class ' + R().human(op.failureClass) : '')) + '">' + R().human(state) + '</span>';
  }
  /* ---------- the failure class, as a labelled fact (audit A08-01) ----------
     ops-1 carries failureClass 'verify_failed' and it reached no label on any
     of the thirteen rooms, so a reader was told a provider-CLI update had
     rolled back and never told what failed. Packet §04 requires the record to
     expose the class, and "expose" is a label a reader can read, not an enum
     token buried in a tooltip: the humanised class rides the copy, the raw
     canonical pairs ride data-u11-fields.

     What the failure cost is read off the record rather than authored beside
     it — the version that is installed and the version that was being
     installed both live under acquisition.installation, which is nested and
     not a peer of acquisition, so the path is read, never assumed. */
  function opsFailureBlock(op) {
    if (!op.failureClass) return '';
    var inst = (op.acquisition && op.acquisition.installation) || null;
    var html = '<div class="u11w-opfail"' + diagFields([
      ['operational_id', op.id], ['outcome', op.outcome], ['status', op.status],
      ['failure_class', op.failureClass], ['failure_stage', op.failureStage],
      ['installed_version', inst && inst.version], ['target_version', inst && inst.targetVersion]
    ]) + '>' + ic('alert') +
      '<div><b>Failure class · ' + R().humanCap(op.failureClass) + '</b>';
    var says = [];
    if (op.failureStage) says.push('The ' + op.failureStage + ' stage is the one that did not pass');
    if (inst && inst.targetVersion && inst.version) {
      says.push((says.length ? 'so ' : 'The rollback means ') + inst.targetVersion +
        ' never became the running version and ' + inst.version + ' is what is installed');
    }
    if (says.length) html += '<span>' + says.join(', ') + '.</span>';
    html += '</div></div>';
    return html;
  }
  function renderOperations(item, sizeKey) {
    var d = D();
    var ops = d.operationsFor();
    var html = topStrip(item, ops.length + ' activities');
    ops.forEach(function (op) {
      var host = d.hostById[op.hostId], env = d.envById[op.envId];
      html += '<div class="u11w-opcard">';
      html += '<div class="u11w-atop"><span class="u11w-opico">' + ic(OPS_KIND_ICON[op.kind] || 'check') + '</span>' +
        '<span class="u11w-aname" title="' + attrSafe(op.title) + '">' + op.title + '</span>' + opsStateBadge(op) + '</div>';
      html += sub(op.copy);
      /* The failure class is a peer of the outcome, not a footnote to it: any
         record that did not simply complete states its class, and states that
         none was recorded rather than leaving the reader to infer one. */
      var outState = op.outcome || op.status;
      html += sub('Outcome · ' + R().humanCap(op.outcome || 'not recorded') +
        (op.failureClass || outState !== 'completed'
          ? ' · failure class ' + (op.failureClass ? R().human(op.failureClass) : 'none recorded')
          : '') +
        ' · run status ' + R().human(op.status) +
        ' · provider usage ' + R().human(op.providerUsage || 'unknown'));
      html += opsFailureBlock(op);
      if (op.stages && op.stages.length) {
        html += '<div class="u11w-ophases">';
        op.stages.forEach(function (ph) {
          /* the stage the failure class names is marked where the stages are
             read, so the class and the timeline point at the same thing */
          var failed = op.failureStage && ph.label === op.failureStage;
          html += '<span class="u11w-ophase' + (failed ? ' bad' : '') + '"' +
            (failed ? ' title="' + attrSafe('this stage is the one the failure class names') + '"' : '') +
            '><b>' + ph.label + '</b>' + T().dur(ph.ms) + '</span>';
        });
        html += '</div>';
      }
      if (host || env || op.sourceLocationId || op.clientId) html += sub(lineageText(op));
      if (op.acquisition) {
        /* consent and source are nested under acquisition; provenance, arch,
           version and targetVersion are nested one level deeper under
           acquisition.installation. Read them, rather than restating the
           consent class as a hard-coded phrase that cannot follow the record. */
        var acq = op.acquisition, aInst = acq.installation || null;
        html += '<div class="u11w-opacq">' + ic('lock') + '<span>' +
          R().humanCap(acq.consent || 'consent not recorded') + ' · ' + acq.source +
          ' · bound to ' + (host ? host.label : op.hostId) + ' / ' + (env ? env.label : op.envId) +
          (aInst ? ' · v' + aInst.version +
            (aInst.targetVersion ? ' · update to v' + aInst.targetVersion : '') +
            (aInst.provenance ? ' · ' + aInst.provenance : '') +
            (aInst.arch ? ' · ' + aInst.arch : '') : '') +
          ' · updates/repair post-consent only</span></div>';
      }
      html += '<div class="u11w-sub dimtxt">' + linkEventIds(op.detail) + '</div>';
      if (op.validationEventId) {
        html += cta('View the verification call', 'data-u11-act="openattempt" data-att="' + op.validationEventId + '"');
      }
      /* the reconnect replay is a real provider attempt and the record names
         it — so the record links it, the same way the verification call is
         linked from the update record */
      if (op.replayEventId) {
        html += cta('View the replayed provider attempt', 'data-u11-act="openattempt" data-att="' + op.replayEventId + '"');
      }
      var opLinked = {};
      if (op.validationEventId) opLinked[op.validationEventId] = 1;
      if (op.replayEventId) opLinked[op.replayEventId] = 1;
      var opRest = (op.relatedEventIds || []).filter(function (id) { return !opLinked[id]; });
      if (opRest.length) {
        html += sub('Provider attempts recorded against this operation · ' +
          opRest.map(function (id) { return eventLink(id); }).join(' '));
      }
      if (op.kind === 'setup_required' && op.setupLink) {
        html += cta('Open provider setup', 'data-u11-act="setuplink" data-ops="' + op.id + '"');
      }
      html += '</div>';
    });

    /* A Back Seat Driver check that made no provider call has no usage event
       to hang on, and inventing one would be a fabricated attempt. It reaches
       a surface here, through its operational decision record — otherwise the
       one BSD state that proves "no second provider call was made" is the one
       state the user can never see. */
    var bsdNoCall = d.bsdEventsWithoutAttempt();
    if (bsdNoCall.length) {
      html += '<div class="u11w-freegroup">' + sub('Decisions that made no provider call');
      bsdNoCall.forEach(function (b) {
        var op = b.operationalId ? d.operationalById[b.operationalId] : null;
        html += '<div class="u11w-opcard">';
        html += '<div class="u11w-atop"><span class="u11w-opico">' + ic('shield') + '</span>' +
          '<span class="u11w-aname" title="' + attrSafe('Back Seat Driver · ' + b.copy) + '">Back Seat Driver · ' + b.copy + '</span>' +
          '<span class="u11w-kind ok">' + R().humanCap(b.result) + '</span></div>';
        html += sub(b.trigger + ' · requested ' + b.requestedState + ' · effective ' + b.effectiveState +
          (b.duplicateOfEventId ? ' · duplicate of ' + eventLink(b.duplicateOfEventId) : ''));
        html += '<div class="u11w-sub dimtxt">' + linkEventIds(b.detail) + '</div>';
        /* The record was named by its internal id in a sentence. It carries a
           real human title of its own, so use that and put the id on the element. */
        if (op) html += '<div class="u11w-sub" data-u11-ops="' + attrSafe(op.id) + '">' +
          'Operational decision record · ' + (op.title || R().human(op.kind || 'unknown')) +
          ' · ' + lineageText(op) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += note('Maintenance is never model usage. First acquisition is explicit user setup from the official source for the exact host/environment; Auto/On maintain only already-approved installations. When a flow verifies with a model, that call appears separately as a validation event. A decision that made no provider call carries no usage event at all — that zero is a decision, not a measurement.');
    html += footActs(item);
    return html;
  }

  /* ---------- tools ---------- */
  function renderTools(item, sizeKey) {
    var d = D();
    var sort = (item.cfg && item.cfg.sort) || 'calls';
    var tools = d.tools.slice().sort(function (a, b) {
      if (sort === 'tool') return String(a.tool).localeCompare(String(b.tool));
      if (sort === 'schema') return (b.schemaOverheadTokens || -1) - (a.schemaOverheadTokens || -1);
      return b[sort] - a[sort];
    });
    var schemaTotal = 0, schemaKnown = 0;
    d.tools.forEach(function (t) { if (t.schemaOverheadTokens != null) { schemaTotal += t.schemaOverheadTokens; schemaKnown += 1; } });
    var html = topStrip(item, 'last 24h');
    html += '<div class="u11w-tbl"><table class="us-tbl"><thead><tr>' +
      sortTh('tool', 'Tool', sort, 'tsort') +
      sortTh('calls', 'Calls', sort, 'tsort', true) +
      sortTh('p50', 'p50', sort, 'tsort', true) +
      sortTh('p95', 'p95', sort, 'tsort', true) +
      sortTh('err', 'Err %', sort, 'tsort', true) +
      sortTh('schema', 'Schema tokens', sort, 'tsort', true) +
      '<th>Source</th></tr></thead><tbody>';
    tools.forEach(function (t) {
      var srcTitle = attrSafe(sourceClassLabel(t.sourceClass || 'unknown') +
        (t.sourceAuthority ? ' · authority ' + t.sourceAuthority : ' · source authority not stated') +
        ' · ' + (CONF_TEXT[t.sourceConfidence] || 'confidence not recorded'));
      html += '<tr><td>' + t.tool + (t.recoveries ? ' <span class="u11w-rec" title="' + t.recoveries + ' self-recovery">↺' + t.recoveries + '</span>' : '') + '</td>' +
        '<td class="num">' + t.calls + '</td><td class="num">' + t.p50 + 'ms</td><td class="num">' + t.p95 + 'ms</td>' +
        '<td class="num' + (t.err >= 2 ? ' u11w-hot' : '') + '">' + t.err.toFixed(1) + '</td>' +
        '<td class="num">' + (t.schemaOverheadTokens == null ? '<span class="u11w-dimtxt">not reported</span>' : fmt().num(t.schemaOverheadTokens)) + '</td>' +
        '<td class="dim" title="' + srcTitle + '">' + sourceClassText(t.sourceClass || 'unknown') +
        confChipIf(t.sourceConfidence) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    html += sub('Selected tool and MCP schemas cost ' + fmt().num(schemaTotal) + ' context tokens across ' + schemaKnown +
      ' tools before any call is made — the same figure the Tools segment of the context window reports.');
    d.toolOps.forEach(function (op) {
      html += '<div class="u11w-toolop">' + ic('check') + '<div><b>' + op.copy + '</b><span>' + op.detail + '</span></div></div>';
    });
    html += note('These are Puppet Master’s own measurements of its own calls — ' + sourceClassText('local_estimated') +
      ', not a provider figure. Recovered tool calls are not rerun — no duplicate user work, no provider tokens.');
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
      /* three states, not two: a provider that reports cache, a route that
         exposes no cache at all, and a route Puppet Master could not ask.
         A reported zero and an unsupported cache are different facts
         (fixture GUI-USG-006) and the old guard keyed on a state string, so
         any row with a null hit would have rendered "Cache hit 0%". */
      var crs = cs.cacheReportingState || (cs.state === 'unsupported' ? 'not_exposed' : 'reported');
      var est = cs.state === 'estimated';
      /* Fixtures GUI-USG-002 and GUI-USG-006 (audit A05-17). A route the
         provider reported and reported as zero is its own state, and it must
         not read like either of the other two: a reported zero is a figure
         that was measured, an unexposed cache is nothing to read, and an
         unknown cache is a question that could not be asked. The distinction
         is derived from the figures rather than declared by a flag, so a row
         cannot claim to be a measured zero without carrying measured zeros. */
      var repZero = crs === 'reported' && cs.hit === 0 && cs.cr === 0 && cs.cw === 0;
      html += '<div class="u11w-prow' + (repZero ? ' u11w-zerorow' : '') + '"' + diagFields([
        ['connection_id', cs.connectionId],
        ['cache_reporting_state', crs],
        ['cache_write_breakdown_state', cs.cacheWriteBreakdownState],
        ['cache_miss_reason', cs.cacheMissReason],
        ['cache_read_tokens', cs.cr], ['cache_write_tokens', cs.cw],
        ['cache_hit_rate', cs.hit], ['source_class', cs.sourceClass]
      ]) + '>';
      html += '<div class="u11w-atop"><span class="u11w-aname" title="' + attrSafe(conn ? conn.label : '') + '">' +
        (conn ? conn.label : '') + '</span>' +
        '<span class="u11w-adetail" title="' + attrSafe(acct) + '">' + acct + '</span>' +
        R().chip(est ? 'estimated' : (repZero ? 'zero' : (crs === 'reported' ? 'measured' : crs))) + '</div>';
      if (crs === 'reported') {
        /* said first, before any figure: otherwise a column of zeros reads as
           a route with nothing in it rather than a route that reported zeros */
        if (repZero) {
          html += sub('Cache reported, and every figure in it is zero. This is a measured zero — the provider returned the cache block and the numbers in it were zeros, which is not the same as a route with no cache to read.');
        }
        if (cs.hit == null) html += vrow('h-mute', 'Cache hit', unkVal('not reported'));
        else html += mrow('Cache hit' + (est ? ' · Puppet Master estimate' : ''), valHTML(cs.hit, '%'), cs.hit, est ? 'f-purple' : 'f-teal');
        html += vrow('h-lime', 'Saved today' + (est ? ' · Puppet Master estimate' : ''),
          cs.save == null ? unkVal('not reported')
            : pval(Number(cs.save) === 0 ? fmt().cost(0) : '−$' + Number(cs.save).toFixed(2)));
        html += vrow('h-mute', 'Cache read', cs.cr == null ? unkVal('—') : valHTML(cs.cr, '', { fmt: 'tok' }), 'dim');
        html += vrow('h-mute', 'Cache write', cs.cw == null ? unkVal('—') : valHTML(cs.cw, '', { fmt: 'tok' }), 'dim');
        if (cs.cw == null) {
          html += sub('Cache write is an em dash because this provider does not expose the field · write breakdown ' +
            R().human(cs.cacheWriteBreakdownState || 'unknown') + ' — never zero.');
        }
        /* a zero is only a real zero with evidence behind it, so the row that
           claims one names its authority and the calls it was read from */
        if (repZero) {
          html += sub('Saved today is ' + fmt().cost(0) + ' because nothing was reused, not because the saving is unknown' +
            (cs.observedCalls != null ? ' · read from ' + cs.observedCalls + ' call' + (cs.observedCalls === 1 ? '' : 's') + ' on this route today' : '') +
            (cs.sourceClass ? ' · ' + sourceClassText(cs.sourceClass) : '') +
            (cs.sourceAuthority ? ' · ' + cs.sourceAuthority : '') +
            (cs.settlement ? ' · ' + R().human(cs.settlement) : '') + '.');
          if (cs.evidenceEventIds && cs.evidenceEventIds.length) {
            html += sub('The calls it was read from · ' +
              cs.evidenceEventIds.map(function (id) { return eventLink(id); }).join(' '));
          }
        }
        if (est) html += sub('Hit rate and saving on this connection are Puppet Master estimates, not provider figures — they carry less weight than the measured rows above.');
      } else {
        html += sub(crs === 'not_exposed'
          ? 'Cache not exposed on this route — there is nothing to read here at all, which is a different fact from reading a zero.'
          : 'Cache reporting unknown — Puppet Master could not ask here, so this is neither a zero nor a proven absence.');
        html += vrow('h-mute', 'Cache hit', unkVal('—'), 'dim');
        html += vrow('h-mute', 'Cache read', unkVal('—'), 'dim');
        html += vrow('h-mute', 'Cache write', unkVal('—'), 'dim');
        html += vrow('h-mute', 'Saved today', unkVal('not reported'), 'dim');
        if (cs.cacheMissReason) html += sub('Reason · ' + R().human(cs.cacheMissReason));
      }
      if (cs.note) html += sub(cs.note);
      html += '</div>';
    });
    html += note('These are per-provider prompt-cache figures — distinct from the context-ring cache metric. Three states, never two: a route that reported its cache prints the figures it reported — including a zero, which stays a zero; a route that exposes no cache prints em dashes and says there is nothing to read; and a route Puppet Master could not ask says so and claims neither. A missing cache-write field renders as an em dash, never as zero, and a measured figure never carries the same weight as an estimate.');
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

  /* ---------- CLI-bridged provider routes · CBP-027 ----------
     Fixtures GUI-CBP-001 and GUI-CBP-002 score on this vocabulary, and the
     concept modelled all of it and rendered none of it, so the two fixtures
     had nothing to read.

     GUI-CBP-001: /stats, /usage, /quota and /credits render as not exposed,
     unknown, broken or disabled — never as a fabricated figure, never as a
     zero and never as a countdown nobody published.
     GUI-CBP-002: G1 credits are credits-only. Every credit row here carries
     isTokenBucket / isCost / isQuota / isProviderTotal false and a
     neverSummedInto list, and nothing below adds a credit into a token
     bucket, a price, a quota or a provider total.

     The machine-readable half — provider_id, route, the probe field names and
     their raw values — lives in each row's data-u11-fields attribute, which is
     in the DOM and queryable but never rendered. The title is prose: a tooltip
     is user-visible text, so it names each field in words and humanises each
     value, exactly like the copy it sits behind. */
  var CBP_PROBE_FIELD = { '/stats': 'stats', '/usage': 'usage', '/quota': 'quota', '/credits': 'credits' };
  function cbpIdentityPairs(rec) {
    return [['provider_id', rec.provider_id], ['route', rec.route],
      ['provider_route_kind', rec.provider_route_kind]];
  }
  function cbpIdentity(rec) { return diagTitle(diagProse(cbpIdentityPairs(rec))); }
  function cbpIdentityFields(rec) { return diagFields(cbpIdentityPairs(rec)); }
  function cbpProbePairs(rec, p) {
    var pairs = cbpIdentityPairs(rec).concat([['probe', p.probe], ['state', p.state]]);
    var pre = CBP_PROBE_FIELD[p.probe];
    if (pre && p.value != null) pairs.push([pre, p.value]);
    if (p.field && p.value != null) pairs.push([p.field, p.value]);
    pairs.push(['payload_ref', p.payload_ref], ['fabricated', p.fabricated ? 'true' : 'false']);
    return pairs;
  }
  function cbpProbeTitle(rec, p) {
    var t = diagProse(cbpIdentityPairs(rec));
    t.push('probe ' + p.probe, 'state ' + R().human(p.state));
    var pre = CBP_PROBE_FIELD[p.probe];
    if (p.field && p.value != null) t.push(R().human(p.field) + ' ' + R().human(p.value));
    else if (pre && p.value != null) t.push(pre + ' ' + R().human(p.value));
    t.push(p.payload_ref ? 'payload ref ' + p.payload_ref : 'no payload ref — nothing was returned to keep');
    t.push(p.fabricated ? 'fabricated' : 'nothing on this probe is invented');
    if (p.detail) t.push(p.detail);
    return diagTitle(t);
  }
  function cbpProbeValue(p) {
    if (p.copy) return p.copy;
    if (p.value != null) return R().human(p.value);
    return R().human(p.state);
  }
  function cbpCreditsPairs(rec) {
    var c = rec.credits;
    return cbpIdentityPairs(rec).concat([
      ['use_g1_credits', c.use_g1_credits == null ? null : String(c.use_g1_credits)],
      ['credits_status', c.credits_status],
      ['credits_remaining', c.credits_remaining == null ? null : c.credits_remaining],
      ['evidence_source', c.evidence_source],
      ['never_summed_into', (c.neverSummedInto || []).join(', ')]
    ]);
  }
  function cbpCreditsFields(rec) { return diagFields(cbpCreditsPairs(rec)); }
  function cbpCreditsTitle(rec) {
    var c = rec.credits;
    var t = diagProse(cbpIdentityPairs(rec));
    t.push('setting UseG1Credits ' + (c.use_g1_credits === true ? 'on'
      : (c.use_g1_credits === false ? 'off' : 'not readable on this build')));
    t.push('credits status ' + R().human(c.credits_status));
    t.push('credits remaining ' + (c.credits_remaining == null ? 'not exposed' : c.credits_remaining));
    t.push('evidence source ' + R().human(c.evidence_source));
    t.push('never summed into ' + R().human((c.neverSummedInto || []).join(', ')));
    if (c.note) t.push(c.note);
    return diagTitle(t);
  }
  function cbpCreditsLine(rec) {
    var c = rec.credits;
    var val = c.credits_status === 'reported' && c.credits_remaining != null
      ? fmt().num(c.credits_remaining) + ' ' + (c.unit || 'credits') + ' remaining'
      : (c.copy || R().human(c.credits_status));
    var setting = c.use_g1_credits === true ? 'on' : (c.use_g1_credits === false ? 'off' : 'not readable on this build');
    return 'G1 credits · ' + val + ' · setting UseG1Credits ' + setting;
  }
  function cbpProbeRowsHTML(rec) {
    var h = '<div class="u11w-cliprobes">';
    rec.probes.forEach(function (p) {
      h += '<div class="u11w-cliprobe" title="' + cbpProbeTitle(rec, p) + '"' +
        diagFields(cbpProbePairs(rec, p)) + '>' +
        '<b>' + p.probe + '</b><span>' + cbpProbeValue(p) + '</span>' +
        '<em>' + R().human(p.state) + '</em></div>';
    });
    return h + '</div>';
  }
  function cbpHeadHTML(rec, d) {
    var host = d.hostById[rec.hostId], env = d.envById[rec.envId];
    return '<div class="u11w-atop"><span class="u11w-opico">' + ic('terminal') + '</span>' +
      '<span class="u11w-aname" title="' + cbpIdentity(rec) + '"' + cbpIdentityFields(rec) + '>' +
      rec.label + ' · v' + rec.cliVersion + '</span>' +
      '<span class="u11w-adetail">' + (host ? host.label : rec.hostId) + ' · ' + (env ? env.label : rec.envId) + '</span></div>';
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
      html += vrow(SERIES_FILLS[i % SERIES_FILLS.length].replace('f-', 'h-'), sourceClassLabel(k), valHTML(counts[k], 'events'));
    });
    html += '</div>';
    html += '<div class="u11w-freegroup">' + sub('Settlement & freshness');
    html += '<div class="u11w-rows">';
    html += vrow('h-blue', 'Projection freshness', pval(d.meta.projectionFreshness));
    html += vrow('h-teal', 'Projection health', pval(d.meta.projectionHealth));
    html += vrow('h-orange', 'Next auto-refresh', pval(T().atClock(d.meta.nextAutoRefresh)));
    html += vrow('h-mute', 'Retention', pval(d.meta.retentionDays + ' days'));
    html += '</div></div>';

    html += '<div class="u11w-freegroup">' + sub('Catalog refresh — never active model probing');
    d.catalogEvents.forEach(function (ce) {
      /* the row used to drop every falsifiable field it had: how many models
         moved, how many free states flipped, and how long the backoff runs */
      var bits = [];
      if (ce.modelsChanged != null) bits.push(ce.modelsChanged + ' model' + (ce.modelsChanged === 1 ? '' : 's') + ' changed');
      if (ce.freeStateChanges != null) bits.push(ce.freeStateChanges + ' free-state change' + (ce.freeStateChanges === 1 ? '' : 's'));
      if (ce.failureBackoffUntil) bits.push('backing off until ' + T().atClock(ce.failureBackoffUntil));
      /* a catalog refresh and a model probe are different events, so the join
         between them is a field: either this refresh sent a real model request
         and names it, or it sent none and says so */
      bits.push(ce.probeEventId
        ? 'this refresh did send one model request · ' + eventLink(ce.probeEventId)
        : 'no model request was sent by this refresh, so there is no probe event to join');
      html += '<div class="u11w-toolop cat">' + ic('refresh') + '<div><b>' + ce.copy + '</b><span>' + ce.detail +
        ' · ' + R().human(ce.source) + ' · ' + R().human(ce.status) + ' · ' + T().atClock(ce.at) +
        (bits.length ? '</span><span class="u11w-catfields">' + bits.join(' · ') : '') + '</span>' +
        (ce.probeEventId ? '<button type="button" class="u11w-minibtn" data-u11-act="openattempt" data-att="' + ce.probeEventId + '">Open the refresh call</button>' : '') +
        '</div></div>';
    });
    /* Background work is everything with no logical turn behind it — active
       model probes AND catalog validation calls. The old filter was
       bucket 'validation' AND purpose 'probe', which left the catalog
       validation event unreachable; this widens to the shared accessor and
       keeps every probe that does hang off a turn. */
    var bgList = d.backgroundAttempts().slice();
    d.attempts.forEach(function (a) {
      if (a.bucket === 'validation' && a.purpose === 'probe' && bgList.indexOf(a) === -1) bgList.push(a);
    });
    /* A maintenance flow's model call is a validation event OF THAT FLOW, not
       catalog probing: rendering it as one more "Active probe" put a CLI
       update's verify call in the same words as a free-route catalog probe,
       with nothing naming the operation it belongs to. */
    var opOfEvent = {};
    d.operational.forEach(function (o) {
      if (o.validationEventId) opOfEvent[o.validationEventId] = o;
      (o.relatedEventIds || []).forEach(function (id) { if (!opOfEvent[id]) opOfEvent[id] = o; });
    });
    html += sub('Background and validation calls');
    bgList.forEach(function (pr) {
      var model = d.modelById[pr.effectiveModelId || pr.requestedModelId];
      var isCat = pr.purpose === 'catalog_validation';
      var mop = opOfEvent[pr.eventId];
      var kindCopy = mop
        ? 'verification call for maintenance · ' + mop.title + ' — attributed to that flow, never user work and never catalog probing'
        : (isCat ? 'catalog validation — a refresh that had to ask a model, not active model probing'
          : 'active model probe · attributed to validation, never user work');
      var lines = [(attemptTokensLabel(item, pr) || 'no provider usage'), kindCopy,
        R().human(pr.status), T().atClock(pr.startedAt)];
      html += '<div class="u11w-toolop' + (isCat || mop ? ' cat' : '') + '">' + ic(mop ? 'route' : (isCat ? 'refresh' : 'target')) +
        '<div><b>' + (mop ? 'Maintenance verification call · ' : (isCat ? 'Catalog validation call · ' : 'Active probe · ')) +
        (model ? model.label : 'model') + '</b>' +
        '<span>' + lines.join(' · ') + '</span>';
      if (pr.allowance) {
        var al = pr.allowance, mt = d.meterById[al.meterId], prod = mt ? d.productById[mt.productId] : null;
        var uw = al.consumedUnits === 1 ? String(al.unit).replace(/s$/, '') : al.unit;
        html += '<span class="u11w-alw">' + ic('dial') + 'Consumes allowance · ' + al.consumedUnits + ' ' + uw + ' from ' +
          (prod ? prod.label + ' · ' : '') + (mt ? mt.label : al.meterId) + ' · ' +
          al.usedAfter + ' of ' + al.limit + ' used after this call · ' + al.remainingAfter + ' left · quota ' +
          R().human(al.quotaStatus || 'unknown') + '</span>';
        if (al.note) html += '<span class="u11w-opline">' + al.note + '</span>';
      } else {
        html += '<span class="u11w-alw dim">' + ic('dial') + 'No allowance recorded for this route — nothing to draw down, which is not the same as drawing zero.</span>';
      }
      html += '<span class="u11w-opline">' + lineageText(pr) + (pr.sessionId ? ' · session ' + pr.sessionId : '') + '</span>';
      html += '<button type="button" class="u11w-minibtn" data-u11-act="openattempt" data-att="' + pr.eventId + '">inspect</button>';
      html += '</div></div>';
    });
    html += '</div>';

    /* ---- CLI-bridged routes: what each installation actually answered ---- */
    var cli = d.cliBridged || [];
    if (cli.length) {
      html += '<div class="u11w-freegroup">' + sub('CLI-bridged routes · probe state per installation');
      cli.forEach(function (rec) {
        html += '<div class="u11w-cliinst">';
        html += cbpHeadHTML(rec, d);
        html += sub(sourceClassLabel(rec.source_class) + ' · ' + (CONF_TEXT[rec.source_confidence] || R().human(rec.source_confidence)) +
          ' · read ' + T().atClock(rec.observedAt) + ' · payload ref ' + rec.payload_ref);
        html += cbpProbeRowsHTML(rec);
        /* usage: every canonical bucket, unknown, and never derived from the
           credit pool or from quota progress */
        var u = rec.usage;
        html += '<div class="u11w-clinote" title="' + diagTitle(diagProse([
          ['usage_reporting_state', u.usage_reporting_state], ['evidence_source', u.evidence_source]]).concat([u.note])) + '"' +
          diagFields([['usage_reporting_state', u.usage_reporting_state], ['evidence_source', u.evidence_source]]) + '>' +
          'Token buckets · ' + R().humanCap(u.copy) + ' — input, output, cache read, cache write, reasoning and provider total ' +
          'are each unknown here, and none of them is written as 0. ' + u.note + '</div>';
        /* Models & Quota: a disabled bucket draws no bar and reads disabled */
        var mq = rec.modelsAndQuota;
        if (mq.buckets && mq.buckets.length) {
          html += sub('Models & Quota page · ' + R().human(mq.state) + ' · scope ' + R().human(mq.window_scope));
          mq.buckets.forEach(function (b) {
            var bPairs = [['quota_status', b.quota_status], ['window_kind', b.window_kind],
              ['evidence_source', b.evidence_source]];
            var bTitle = diagTitle(diagProse(bPairs).concat([
              b.disabled_reason ? 'disabled reason ' + b.disabled_reason : '', b.note || '']));
            var bFields = diagFields(bPairs);
            if (b.quota_status === 'disabled') {
              html += '<div class="u11w-clibucket" title="' + bTitle + '"' + bFields + '><b>' + b.label + '</b>' +
                '<span>' + (b.copy || R().humanCap(b.quota_status)) + ' — ' + b.disabled_reason +
                ' No progress is drawn for it: disabled is not zero left and not exhausted.</span></div>';
              return;
            }
            var pct = (b.quota_limit ? Math.round(b.quota_used / b.quota_limit * 100) : null);
            html += '<div class="u11w-clibucket" title="' + bTitle + '"' + bFields + '><b>' + b.label + '</b><span>' +
              b.quota_used + ' of ' + b.quota_limit + ' requests used · ' + b.quota_remaining + ' left' +
              (b.reset_at ? ' · ' + T().when(b.reset_at, d.meta.now, 'reset') : '') +
              (b.exhaustion_message ? ' · ' + b.exhaustion_message : '') + '</span></div>';
            if (b.showProgress && pct != null) {
              html += mrow('Used', valHTML(pct, '%'), pct, pct >= 100 ? 'f-pink' : 'f-blue');
            }
          });
          html += sub(mq.note);
        } else {
          html += '<div class="u11w-clinote" title="' + diagTitle(diagProse([['page_state', mq.state]]).concat([mq.note])) + '"' +
            diagFields([['page_state', mq.state]]) + '>' +
            'Models & Quota page · ' + R().human(mq.state) + ' — ' + mq.note + '</div>';
        }
        /* statusline: observed signals, never billing authority */
        var sl = rec.statusline;
        if (sl.fields && sl.fields.length) {
          html += sub('Statusline signals · observed, never provider billing authority');
          sl.fields.forEach(function (f) {
            html += '<div class="u11w-clibucket" title="' + diagTitle([R().human(f.field),
              'state ' + R().human(f.state), f.note || '']) + '"' +
              diagFields([['field', f.field], ['state', f.state]]) + '>' +
              '<b>' + f.label + '</b><span>' + (f.value == null ? 'not stated by the statusline · unknown, not zero' : f.value) +
              (f.state !== 'reported' ? ' · ' + R().human(f.state) : '') + '</span></div>';
          });
          html += sub(sl.note);
        } else {
          html += '<div class="u11w-clinote" title="' + diagTitle(diagProse([['statusline_state', sl.state]]).concat([sl.note])) + '"' +
            diagFields([['statusline_state', sl.state]]) + '>' +
            'Statusline · ' + R().human(sl.state) + ' — ' + sl.note + '</div>';
        }
        /* credits: their own row, and only their own row */
        html += '<div class="u11w-clicredit" title="' + cbpCreditsTitle(rec) + '"' + cbpCreditsFields(rec) + '>' + ic('coin') +
          '<span>' + cbpCreditsLine(rec) + '</span></div>';
        html += '<div class="u11w-clinote">' + rec.credits.note + '</div>';
        html += '</div>';
      });
      html += note('A missing command is a recorded state, not a silence: stats unavailable, usage unknown, quota not exposed and credits not exposed each say what was asked and what came back. No figure is derived from a failed probe, and G1 credits are never added into a token bucket, a price, a quota or a provider total.');
      html += '</div>';
    }

    /* ---- pricing provenance: which snapshot priced which call ---- */
    if (d.pricing && d.pricing.snapshots && d.pricing.snapshots.length) {
      html += '<div class="u11w-freegroup">' + sub('Pricing provenance');
      d.pricing.snapshots.forEach(function (ps) {
        var users = d.attempts.filter(function (a) { return a.pricingSnapshotId === ps.id; });
        html += '<div class="u11w-toolop cat">' + ic('wallet') + '<div><b>' + ps.label + '</b><span>' +
          [sourceClassText(ps.source), 'version ' + ps.version, 'effective ' + T().stamp(ps.effectiveAt), ps.currency].join(' · ') +
          '</span><span class="u11w-opline">' +
          (users.length
            ? plural(users.length, 'call priced from this snapshot', 'calls priced from this snapshot') + ' · ' +
              users.map(function (a) { return eventLink(a.eventId); }).join(' ')
            : 'No call is priced from this snapshot right now.') +
          '</span><span class="u11w-opline">' + ps.note + '</span></div></div>';
      });
      html += sub(d.pricing.note);
      html += '</div>';
    }

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
        { key: 'groupby', label: 'Break down by', type: 'select', options: ['model', 'provider', 'account'], value: (item.cfg && item.cfg.groupby) || 'model' },
        { key: 'bsort', label: 'Breakdown sort', type: 'select', options: ['tokens', 'attempts', 'cost', 'name'], value: (item.cfg && item.cfg.bsort) || 'tokens' },
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
        { key: 'sort', label: 'Sort', type: 'select', options: ['calls', 'p50', 'p95', 'err', 'schema', 'tool'], value: (item.cfg && item.cfg.sort) || 'calls' }
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

  /* Repaint every instance of one widget type, on every room's canvas.
     A forecast is not a property of the card that was clicked: the same run's
     reading is drawn by the capacity widget in Overview and again in Plans, so
     retaking it on one card and leaving the other showing the previous reading
     would put two different readings of one run on one page. The engine's
     rerender(uid) replaces only that instance's body, so nothing else on the
     board moves. */
  function repaintType(type) {
    document.querySelectorAll('[data-u11-page]').forEach(function (cv) {
      var pmw = cv._pmw;
      if (!pmw || !pmw.handle) return;
      pmw.items.forEach(function (it) { if (it.type === type) pmw.handle.rerender(it.uid); });
    });
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
      /* body-level controls that write one instance config key and re-render.
         Sorting and grouping used to be reachable only through the kebab
         config sheet, so no sort control existed on any surface. */
      var CFGACT = { awin: ['win', 'data-win'], bgroup: ['groupby', 'data-g'],
        bsort: ['bsort', 'data-s'], tsort: ['sort', 'data-s'], bdopen: ['bdopen', 'data-s'] };
      if (CFGACT[a]) {
        var itw = null;
        for (var j = 0; j < canvas._pmw.items.length; j++) if (canvas._pmw.items[j].uid === uidv) itw = canvas._pmw.items[j];
        if (itw) {
          itw.cfg = itw.cfg || {};
          itw.cfg[CFGACT[a][0]] = act.getAttribute(CFGACT[a][1]);
          U11W.persist(canvas);
          canvas._pmw.handle.rerender(uidv);
        }
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
      if (a === 'opensetting') {
        /* A real deep link to the row this widget reports on, not a hop through
           the sheet (audit A10-08). */
        var sid = act.getAttribute('data-setting');
        var res = D().openSettings('ai', sid, 'usage_widget');
        if (window.toast && res && res.toast) window.toast(res.toast);
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
      /* A06-12: the command was dispatched and nothing was recomputed, so the
         pane was byte-identical before and after the press. The command still
         goes out first — Goal Runtime owns admission and this surface never
         pretends otherwise — and then the reading is genuinely retaken and
         every surface showing that forecast is repainted, not just the card
         that was clicked. */
      if (a === 'reqforecast') {
        var runIdF = act.getAttribute('data-run');
        var resF = window.U11.dispatch('cmd.usage.forecast.request', { runId: runIdF });
        var p = window.U11.recomputeForecast(runIdF);
        repaintType('capacity');
        if (window.toast) {
          window.toast(resF.toast + (p ? ' · reading ' + p.generation : ''));
        }
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
    /* The floor used to be applied to every bar, so a bar carrying no value
       painted at exactly the height of the smallest real one — an unmeasurable
       route and a genuine small saving were the same picture. A reported value
       is scaled into the visible band above the floor, so small values stay
       visible AND stay different from each other; a bar with nothing to report
       paints no column at all and says so. */
    scope.querySelectorAll('.u11w-spark i[data-h]').forEach(function (el, i) {
      var raw = parseFloat(el.getAttribute('data-h'));
      var reported = raw > 0;
      var h = reported ? 8 + Math.min(raw, 100) * 0.92 : 0;
      if (!reported) {
        el.classList.add('nil');
        if (!el.getAttribute('title')) el.setAttribute('title', 'nothing reported for this bar — unknown, not a small value');
      } else if (!el.getAttribute('title')) {
        el.setAttribute('title', raw + '% of the largest bar');
      }
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

  /* one honest-total implementation for every U11 surface (run detail reuses it) */
  U11W.tokenTotal = tokenTotal;
  U11W.tokenTotalMany = tokenTotalMany;
  /* one rate rendering for every U11 surface (Context Details reuses it) */
  U11W.ratePct = ratePct;

  window.U11W = U11W;
})();
