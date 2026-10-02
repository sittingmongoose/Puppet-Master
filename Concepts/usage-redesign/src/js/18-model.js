/* Shared projections (owner: content; ARCHITECTURE.md section 4.5, DESIGN-SPEC-ATLAS sections 4.2, 7 and 9). Widgets read
   PMU.data and PMU.roster, never raw arrays (R-GRID-08). Nothing here writes to DATA or its records: the boot check
   compares PM7_USAGE.data with the old page, so every derived view is a new object.

   PMU.roster: who exists comes from Settings (PMU.settings.providers(): the one roster both pages share), how much they
   used from PM_USAGE_ROSTER.facts (keyed providerId/accountId) and the legacy DATA.accounts facts (legacy_id map).
   Missing stays missing: a Settings account with no Usage facts reads "Usage unknown", never 0 %. */
(function () {
  var MIN = 60000, DAY = 86400000;
  var ROSTER = window.PM_USAGE_ROSTER || { facts: {}, switch_log: [] };
  var LEGACY_PROVIDER = { claude: 'claude-code', codex: 'openai-codex', qwen: 'qwen-coding', gemini: 'gemini-direct', kimi: 'kimi-coding', copilot: 'github-copilot', opencode: 'opencode' };
  var SETTINGS_LEGACY = {}; Object.keys(LEGACY_PROVIDER).forEach(function (k) { SETTINGS_LEGACY[LEGACY_PROVIDER[k]] = k; });
  var WINDOW_MIN = { fiveHour: 300, weekly: 10080 };
  var WINDOW_ORDER = ['fiveHour', 'weekly', 'monthly'];
  var STATE_WORD = { active: 'Active', standby: 'Standby', exhausted: 'Usage exhausted', cooldown: 'Cooldown', 'signed-out': 'Signed out', 'needs-seat': 'Needs a seat', unknown: 'Usage unknown' };
  var STATE_GLYPH = { active: 'checkCircle', exhausted: 'alert', cooldown: 'hourglass', 'signed-out': 'key', 'needs-seat': 'minusCircle', unknown: 'dashedCircle' };
  var STATE_TONE = { active: 'good', exhausted: 'crit', cooldown: 'warn', 'signed-out': 'warn', 'needs-seat': 'muted', standby: 'muted', unknown: 'muted' };
  var loadedAt = Date.now();
  var cache = null, memo = {};
  var st = PMU.core.state;

  function series() { return typeof PMU_SERIES === 'object' ? PMU_SERIES : {}; }
  function nextMonthStart() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0).getTime(); }
  function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }
  function sum(a) { var s = 0; (a || []).forEach(function (v) { if (typeof v === 'number') s += v; }); return s; }

  /* ---------------------------------------------------------------- thresholds and the A1 state colours (4.2) */
  function thresholds() {
    var auto = PMU.settings.value('ai.accounts.multi-account-switching');
    var sw = Number(PMU.settings.value('ai.accounts.hard-switch-level')), warn = Number(PMU.settings.value('ai.accounts.soft-warning-level'));
    return { auto: auto !== false && auto !== 'off' && auto !== 'false', switchLeft: isFinite(sw) && sw > 0 ? sw : 10, warnLeft: isFinite(warn) && warn > 0 ? warn : 20,
      available: PMU.settings.available() };
  }
  /* calm | warn | crit | exhausted | over | null (null = missing: no bar) */
  function tone(pctUsed) {
    if (pctUsed === null || pctUsed === undefined || !isFinite(pctUsed)) return null;
    var th = thresholds(), left = 100 - pctUsed;
    if (pctUsed > 100) return 'over';
    if (left <= 0) return 'exhausted';
    if (left <= th.switchLeft) return 'crit';
    if (left <= th.warnLeft) return 'warn';
    return 'calm';
  }

  /* ---------------------------------------------------------------- windows */
  function amountText(f) {
    if (!f || num(f.used) === null || num(f.limit) === null) return '';
    var big = f.limit >= 1e6, a = big ? PMU.fmt.tok(f.used) : PMU.fmt.num(f.used), b = big ? PMU.fmt.tok(f.limit) : PMU.fmt.num(f.limit);
    return a + ' / ' + b + (f.unit ? ' ' + f.unit : '');
  }
  function shortLabel(key, label) {
    var s = String(label || key).replace(/ window$/i, '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function windowView(key, label, fact, governed) {
    fact = fact || { vs: 'unknown' };
    var pct = num(fact.pct);
    var resetAt = num(fact.reset_in_min) !== null ? loadedAt + fact.reset_in_min * MIN : fact.reset_rule === 'next_month' ? nextMonthStart() : null;
    var winMin = fact.win_min || WINDOW_MIN[key] || null;
    var truth = fact.truth || 'unknown';
    var pace = resetAt && winMin ? Math.max(0, Math.min(1, 1 - (resetAt - Date.now()) / (winMin * MIN))) : null;
    var vsState = fact.vs && fact.vs !== 'ok' && fact.vs !== 'estimated' ? fact.vs : pct === null ? 'unknown' : (pct === 0 && fact.zero ? 'zero' : 'ok');
    return { key: key, label: label, short: shortLabel(key, label), pct: pct, left: pct === null ? null : Math.max(0, 100 - pct), used: num(fact.used), limit: num(fact.limit),
      unit: fact.unit || '', amount: amountText(fact), resetAt: resetAt, truth: truth, conf: fact.conf || '', vs: vsState, est: fact.vs === 'estimated',
      note: fact.note || '', tone: tone(pct), pace: pace, pacePts: num(fact.pace_pts), governed: !!governed, binding: false };
  }
  function vsWord(w) {
    if (w.vs === 'not_exposed') return w.note && /limit/.test(w.note) ? 'Limit not exposed' : 'Quota not exposed';
    if (w.vs === 'disabled') return 'Disabled';
    if (w.vs === 'unknown') return 'Usage unknown';
    return (PMU.vs.STATES[w.vs] || {}).word || 'Usage unknown';
  }

  /* ---------------------------------------------------------------- the roster */
  function legacyFor(id) { return id ? DATA.accounts.filter(function (a) { return a.id === id; })[0] || null : null; }
  /* the Usage override, one per provider: {providerId: 'providerId/accountId'} */
  function overrideMap() {
    var o = st.accountOverride;
    if (o && typeof o === 'object' && typeof o.key === 'string') { var m = {}; m[o.key.split('/')[0]] = o.key; st.accountOverride = m; return m; }
    if (!o || typeof o !== 'object') st.accountOverride = {};
    return st.accountOverride;
  }
  function bridgeKey() {
    var id = window.PM7_USAGE && window.PM7_USAGE.active_account_id;
    if (!id) return null;
    var m = /^account:([^:]+):(.+)$/.exec(String(id));
    if (m) return m[1] + '/' + m[2];
    var raw = String(id).replace(/^(account|connection):/, '');
    return Object.keys(ROSTER.facts || {}).filter(function (k) { return ROSTER.facts[k].legacy_id === raw; })[0] || null;
  }
  function statusWord(p) {
    var s = String(p.statusLabel || '');
    if (p.id === 'free-models') return s.replace(/^Ready\s*·\s*/, '') || 'Routes on';
    if (p.status === 'not-installed') return 'Not installed';
    if (/sign-?in/i.test(s)) return 'Needs sign-in';
    if (p.status === 'active') return s.replace(/^Ready\s*·\s*/, '') || 'Ready';
    return s || 'Not set up';
  }

  function build() {
    var providers = PMU.settings.providers() || [], next = PMU.settings.nextAccount(), ovr = overrideMap(), bridge = bridgeKey();
    var th = thresholds();
    var groups = PMU.settings.GROUPS.map(function (g) { return { id: g.id, label: g.label, providers: [] }; });
    var views = [], accounts = [];
    providers.forEach(function (p) {
      var winDefs = p.windows && typeof p.windows === 'object' && !Array.isArray(p.windows) ? p.windows : {};
      var winKeys = WINDOW_ORDER.filter(function (k) { return winDefs[k] != null; }).concat(Object.keys(winDefs).filter(function (k) { return WINDOW_ORDER.indexOf(k) < 0; }));
      var order = (p.routing && Array.isArray(p.routing.accountOrder)) ? p.routing.accountOrder : [];
      var accs = (p.accounts || []).slice().sort(function (a, b) {
        var ia = order.indexOf(a.id), ib = order.indexOf(b.id); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
      });
      var group = p.bill || 'own', governed = group === 'plan';
      var mk = PMU.markOf ? PMU.markOf(p.id) : { vendor: 'community' };
      var view = { id: p.id, name: p.name, group: group, kind: p.kind, product: p.product, vendor: mk.vendor, vendorName: p.vendor, status: p.status,
        statusWord: statusWord(p), installed: p.installed !== false, seriesIndex: 7,
        windows: winKeys.map(function (k) { return { key: k, label: typeof winDefs[k] === 'string' ? winDefs[k] : k, short: shortLabel(k, winDefs[k]) }; }),
        accounts: [], setUp: accs.length > 0, widgetId: 'acct-' + p.id, defaultAccount: p.defaultAccount || '' };
      /* the effective account: Usage override > bridge switch > Settings "next run" > roster fact > default */
      var keys = accs.map(function (a) { return p.id + '/' + a.id; });
      var factEff = keys.filter(function (k) { var f = (ROSTER.facts || {})[k]; return f && f.effective; })[0];
      var nextKey = next && next.provider === p.id ? p.id + '/' + next.account : null;
      var eff = ovr[p.id] && keys.indexOf(ovr[p.id]) >= 0 ? ovr[p.id]
        : bridge && keys.indexOf(bridge) >= 0 ? bridge
        : nextKey && keys.indexOf(nextKey) >= 0 ? nextKey
        : factEff || (p.defaultAccount && keys.indexOf(p.id + '/' + p.defaultAccount) >= 0 ? p.id + '/' + p.defaultAccount : keys[0]);
      var isOverride = eff !== factEff && (!!(ovr[p.id] && ovr[p.id] === eff) || nextKey === eff);
      accs.forEach(function (a, i) {
        var key = p.id + '/' + a.id, f = (ROSTER.facts || {})[key] || null;
        var wins = view.windows.map(function (w) {
          var fact = f && f.windows ? f.windows[w.key] : null;
          if (!fact && !f && a.usage && a.usage.windows && a.usage.windows[w.key] && typeof a.usage.windows[w.key].pct === 'number') fact = { pct: a.usage.windows[w.key].pct, truth: 'unknown' };
          return windowView(w.key, w.label, fact, governed);
        });
        var known = wins.filter(function (w) { return w.pct !== null; });
        var binding = known.slice().sort(function (x, y) { return (x.left - y.left) || (WINDOW_ORDER.indexOf(x.key) - WINDOW_ORDER.indexOf(y.key)); })[0] || null;
        if (binding) binding.binding = true;
        var state = f && f.state ? f.state : (a.active === false ? 'signed-out' : /limit/i.test(a.health || '') ? 'exhausted' : f ? 'standby' : 'unknown');
        var effective = key === eff;
        var cooldown = f && f.cooldown ? { untilAt: loadedAt + (f.cooldown.until_in_min || 0) * MIN, reason: f.cooldown.reason, source: f.cooldown.source, retry: f.cooldown.retry_budget } : null;
        if (cooldown && window.PM7_USAGE && Number(window.PM7_USAGE.cooldown_seconds) > 0) cooldown.untilAt = Date.now() + Number(window.PM7_USAGE.cooldown_seconds) * 1000;
        if (cooldown && cooldown.untilAt <= Date.now()) { cooldown = null; if (state === 'cooldown') state = 'standby'; }
        var supports = !!(f && f.supports_manual_set_active) && accs.length > 1;
        var exhaustedWin = wins.filter(function (w) { return w.pct !== null && w.pct >= 100; })[0];
        var eligible = !supports ? { ok: false, reason: accs.length > 1 ? 'Manual choice not supported' : 'Only account' }
          : effective ? { ok: false, reason: 'Already in use' }
          : state === 'exhausted' ? { ok: false, reason: exhaustedWin && exhaustedWin.resetAt ? 'Usage exhausted until ' + PMU.fmt.clock(exhaustedWin.resetAt) : 'Usage exhausted' }
          : state === 'cooldown' ? { ok: false, reason: 'Cooldown until ' + PMU.fmt.clock(cooldown ? cooldown.untilAt : Date.now()) }
          : state === 'signed-out' ? { ok: false, reason: 'Signed out' }
          : state === 'needs-seat' ? { ok: false, reason: 'Needs a seat' } : { ok: true };
        var fresh = f && f.fresh ? { ageS: f.fresh.age_s, source: f.fresh.source, stale: !!f.fresh.stale } : { ageS: null, source: 'no reading yet', stale: false };
        var shownState = state === 'standby' && effective && p.accounts.length > 1 ? 'active' : state;
        var word = shownState === 'active' && isOverride && effective ? 'Active · override'
          : shownState === 'cooldown' && cooldown ? 'Cooldown until ' + PMU.fmt.clock(cooldown.untilAt) : STATE_WORD[shownState] || 'Usage unknown';
        var amounts = [];
        if (f && f.credits) amounts.push({ glyph: 'coin', label: 'Credits', value: f.credits.vs === 'not_exposed' ? null : PMU.fmt.num(f.credits.left) + ' left', vs: f.credits.vs === 'not_exposed' ? 'not_exposed' : 'ok', word: 'credits not exposed', note: f.credits.source });
        ((f && f.extra) || []).forEach(function (x) {
          if (x.vs === 'not_exposed' && !view.windows.length) return;   /* shown as the dashed track of the plate */
          amounts.push({ glyph: x.vs === 'disabled' ? 'minusCircle' : x.label === 'Credits' ? 'coin' : 'info', label: x.label, value: x.vs === 'ok' ? x.text : null, vs: x.vs, word: x.text,
            expiresAt: num(x.expires_in_min) !== null ? loadedAt + x.expires_in_min * MIN : null, expiresText: x.expires_text || '' });
        });
        if (f && f.spend) amounts.push({ glyph: 'wallet', label: f.spend.label || 'Spend this month', value: PMU.content.money(f.spend.usd), vs: 'ok', suffix: f.spend.state || '', usd: f.spend.usd });
        var noWindowsWord = !view.windows.length ? ((((f && f.extra) || []).filter(function (x) { return x.vs === 'not_exposed'; })[0] || {}).text || '') : '';
        var av = { key: key, id: a.id, providerId: p.id, providerName: p.name, nickname: a.nickname || a.id, identity: a.identity || '', signedIn: a.active !== false,
          isDefault: !!a.default, priority: i + 1, state: state, shownState: shownState, stateWord: word, stateGlyph: STATE_GLYPH[shownState] || null, stateTone: STATE_TONE[shownState] || 'muted',
          effective: effective, override: isOverride && effective, plan: f ? f.plan : '', planLine: f ? f.plan_line : '', host: f ? f.host : '', auth: f ? f.auth : (a.method || ''),
          method: a.method || '', health: a.health || '', fresh: fresh,
          ageText: fresh.ageS === null ? 'no reading yet' : (fresh.stale ? 'cached ' + PMU.fmt.age(fresh.ageS) : PMU.fmt.age(fresh.ageS)),
          windows: wins, binding: binding, amounts: amounts, noWindowsWord: noWindowsWord, extra: (f && f.extra) || [], credits: f && f.credits, spend: f && f.spend, cooldown: cooldown,
          failure: f && f.failure, routeRole: f ? f.route_role : '', legacy: f && f.legacy_id ? legacyFor(f.legacy_id) : null, legacyId: f ? f.legacy_id : null,
          supportsManual: supports, eligible: eligible, history: (f && f.history) || {}, hasFacts: !!f, roles: (a.props && a.props['ai.accounts.account-roles']) || [],
          billingEntity: a.props ? a.props['ai.accounts.billing-entity'] || '' : '' };
        view.accounts.push(av); accounts.push(av);
      });
      view.effective = view.accounts.filter(function (a) { return a.effective; })[0] || null;
      view.exhausted = view.accounts.filter(function (a) { return a.state === 'exhausted'; });
      views.push(view);
      var g = groups.filter(function (x) { return x.id === view.group; })[0] || groups[groups.length - 1];
      g.providers.push(view);
    });
    var log = (ROSTER.switch_log || []).map(function (e) {
      var p = views.filter(function (v) { return v.id === e.provider; })[0];
      var nick = function (id) { var a = p && p.accounts.filter(function (x) { return x.id === id; })[0]; return a ? a.nickname : id; };
      return { at: loadedAt - e.at_min_ago * MIN, providerId: e.provider, providerName: p ? p.name : e.provider, from: e.from, to: e.to, fromName: e.from ? nick(e.from) : '', toName: e.to ? nick(e.to) : '',
        code: e.code, text: e.text, outcome: e.outcome };
    }).sort(function (a, b) { return b.at - a.at; });
    return { groups: groups, providers: views, accounts: accounts, switchLog: log, thresholds: th };
  }

  PMU.roster = {
    read: function () { if (!cache) cache = build(); return cache; },
    provider: function (id) { return PMU.roster.read().providers.filter(function (p) { return p.id === id; })[0] || null; },
    account: function (key) { return PMU.roster.read().accounts.filter(function (a) { return a.key === key; })[0] || null; },
    byLegacy: function (handle) {
      var id = String(handle || '').replace(/^(account|connection):/, '');
      var m = /^([^:]+):(.+)$/.exec(id); if (m && PMU.roster.account(m[1] + '/' + m[2])) return PMU.roster.account(m[1] + '/' + m[2]);
      return PMU.roster.read().accounts.filter(function (a) { return a.legacyId === id; })[0] || null;
    },
    effectiveFor: function (legacyOrSettingsId) {
      var p = PMU.roster.provider(LEGACY_PROVIDER[legacyOrSettingsId] || legacyOrSettingsId);
      return p ? p.effective : null;
    },
    legacyProvider: function (id) { return LEGACY_PROVIDER[id] || id; },
    settingsToLegacy: function (id) { return SETTINGS_LEGACY[id] || null; },
    thresholds: thresholds,
    tone: tone,
    vsWord: vsWord,
    loadedAt: loadedAt,
    invalidate: function () { cache = null; memo = {}; }
  };
  PMU.settings.onChange(function () { cache = null; memo = {}; });

  /* ---------------------------------------------------------------- PMU.data */
  function rangeKey(range) { return range || st.range || '24h'; }
  function scopeLegacy() { var s = st.scope || 'all'; return s.indexOf('provider:') === 0 ? s.slice(9) : null; }
  function inScope(legacyId) {
    var s = st.scope || 'all';
    if (s.indexOf('provider:') === 0) return s.slice(9) === legacyId;
    if (s === 'work' || s === 'personal') { var acc = DATA.accounts.filter(function (a) { return a.provider_id === legacyId && !a.setup_required; })[0]; return !acc || acc.scope === s; }
    return true;
  }
  function settingsInScope(settingsId) {
    var s = st.scope || 'all'; if (s === 'all') return true;
    var l = SETTINGS_LEGACY[settingsId];
    if (s.indexOf('provider:') === 0) return l === s.slice(9);
    return l ? inScope(l) : true;
  }

  /* bucket geometry per range: the last bucket ends at the newest reading (partial) */
  function buckets(range) {
    var tk = (series().tokens || {})[rangeKey(range)] || { bucket_min: 60, input: [] };
    var n = (tk.input || []).length, bm = tk.bucket_min * MIN, now = Date.now();
    var lastStart = Math.floor(now / bm) * bm;
    if (tk.bucket_min >= 1440) { var d = new Date(now); lastStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
    else if (tk.bucket_min >= 60) { var h = new Date(now); h.setMinutes(0, 0, 0); var hs = h.getTime(); lastStart = hs - ((h.getHours() % (tk.bucket_min / 60)) * 3600000); }
    var x = []; for (var i = 0; i < n; i++) x.push(lastStart - (n - 1 - i) * bm);
    return { n: n, bucketMin: tk.bucket_min, bucketMs: bm, x: x, now: now,
      label: { 30: 'Half-hour buckets', 60: 'Hourly buckets', 360: '6-hour buckets', 1440: 'Daily buckets' }[tk.bucket_min] || 'Buckets' };
  }
  /* provider share of each bucket for the current scope (tokensByProvider); null when the scope is everything */
  function scopeShare(range) {
    var by = (series().tokensByProvider || {})[rangeKey(range)];
    if (!by || (st.scope || 'all') === 'all') return null;
    var ids = Object.keys(by).filter(function (k) { return k[0] !== '_'; });
    var n = by[ids[0]].length, out = [];
    for (var i = 0; i < n; i++) {
      var tot = 0, part = 0;
      ids.forEach(function (id) { tot += by[id][i] || 0; if (inScope(id)) part += by[id][i] || 0; });
      out.push(tot ? part / tot : 0);
    }
    return out;
  }
  function tokens(range) {
    var key = rangeKey(range) + '|' + st.scope;
    if (memo['tok' + key]) return memo['tok' + key];
    var tk = (series().tokens || {})[rangeKey(range)] || {};
    var share = scopeShare(range), b = buckets(range);
    function sc(arr) { return (arr || []).map(function (v, i) { return v == null ? null : Math.round(v * (share ? share[i] : 1)); }); }
    var out = { x: b.x, buckets: b, input: sc(tk.input), output: sc(tk.output), reasoning: sc(tk.reasoning), cacheWrite: sc(tk.cacheWrite), cacheRead: sc(tk.cacheRead) };
    out.noCache = out.input.map(function (v, i) { return (v || 0) + (out.output[i] || 0) + (out.reasoning[i] || 0) + (out.cacheWrite[i] || 0); });
    out.all = out.noCache.map(function (v, i) { return v + (out.cacheRead[i] || 0); });
    out.totals = { input: sum(out.input), output: sum(out.output), reasoning: sum(out.reasoning), cacheWrite: sum(out.cacheWrite), cacheRead: sum(out.cacheRead) };
    out.totals.noCache = out.totals.input + out.totals.output + out.totals.reasoning + out.totals.cacheWrite;
    out.totals.all = out.totals.noCache + out.totals.cacheRead;
    var peakI = 0; out.noCache.forEach(function (v, i) { if (v > out.noCache[peakI]) peakI = i; });
    out.peak = { i: peakI, x: b.x[peakI], v: out.noCache[peakI] };
    memo['tok' + key] = out;
    return out;
  }
  /* the cost line: settled charge + plan allocation estimate of the recorded attempts, summed per bucket (exact) */
  /* buckets no recorded attempt covers stay null (missing is never zero): the line breaks there */
  function costLine(range) {
    var b = buckets(range), list = projectedAttempts(), vals = b.x.map(function () { return null; }), split = b.x.map(function () { return {}; });
    var first = b.x[0];
    list.forEach(function (a) {
      var t = new Date(a.occurred_at).getTime(); if (t < first) return;
      var i = Math.min(b.n - 1, Math.floor((t - first) / b.bucketMs)), v = (a.charge || 0) + (a.plan_allocation_estimate || 0);
      vals[i] = (vals[i] || 0) + v;
      split[i][a.provider_id] = (split[i][a.provider_id] || 0) + v;
    });
    return { values: vals.map(function (v) { return v === null ? null : Math.round(v * 100) / 100; }), split: split, total: sum(vals), attempts: list.length };
  }
  /* split one attempt into the five disjoint buckets (R-DATA-03) with the provider's counting basis */
  function attemptBuckets(a) {
    var basis = (series().countingBasis || {})[a.provider_id] || { cache: 'inclusive', reasoning: 'inclusive' };
    var cr = a.cache_read_tokens || 0, cw = a.cache_write_tokens || 0, rsn = a.reasoning_tokens || 0;
    var inp = basis.cache === 'inclusive' ? Math.max(0, a.input_tokens - cr - cw) : a.input_tokens;
    var out = basis.reasoning === 'inclusive' ? Math.max(0, a.output_tokens - rsn) : a.output_tokens;
    return { in: inp, out: out, rsn: rsn, cw: cw, cr: cr, total: inp + out + rsn + cw + cr, partial: !!basis.partial };
  }
  function models() {
    var key = st.range + '|' + st.scope;
    if (memo['models' + key]) return memo['models' + key];
    var names = series().models || {}, rates = series().catalogRates || {};
    var by = {};
    projectedAttempts().forEach(function (a) {
      var m = by[a.model_id] || (by[a.model_id] = { id: a.model_id, legacy: a.provider_id, tokens: { in: 0, out: 0, rsn: 0, cw: 0, cr: 0, total: 0 }, attempts: 0, requests: 0, settled: 0, planEstimate: 0, cacheAvoided: 0, partial: false, ids: [] });
      var bk = attemptBuckets(a);
      ['in', 'out', 'rsn', 'cw', 'cr', 'total'].forEach(function (k) { m.tokens[k] += bk[k]; });
      m.partial = m.partial || bk.partial; m.ids.push(a.attempt_id);
      m.attempts += 1; m.requests += a.request_count || 0; m.settled += a.charge || 0; m.planEstimate += a.plan_allocation_estimate || 0; m.cacheAvoided += a.cache_avoided_estimate || 0;
    });
    var list = Object.keys(by).map(function (id) {
      var m = by[id], meta = names[id] || { name: id.replace(/^model:/, ''), id: id, requested: '', role: '' }, r = rates[id] || { in: 1, out: 1, rsn: 1, cw: 1, cr: 1 };
      var total = Math.round((m.settled + m.planEstimate) * 1e6) / 1e6;
      var raw = { in: m.tokens.in * r.in, out: m.tokens.out * r.out, rsn: m.tokens.rsn * r.rsn, cw: m.tokens.cw * r.cw, cr: m.tokens.cr * r.cr };
      var rs = raw.in + raw.out + raw.rsn + raw.cw + raw.cr;
      var value = {}; Object.keys(raw).forEach(function (k) { value[k] = rs ? total * raw[k] / rs : 0; }); value.total = total;
      var sid = LEGACY_PROVIDER[m.legacy] || m.legacy, mk = PMU.markOf ? PMU.markOf(sid) : { vendor: 'community' };
      return { id: id, name: meta.name, modelId: meta.id || id, providerId: sid, legacy: m.legacy, vendor: mk.vendor, role: meta.role || '', requested: meta.requested || meta.name, effective: meta.name,
        tokens: m.tokens, value: value, attempts: m.attempts, requests: m.requests, settled: m.settled, planEstimate: m.planEstimate, cacheAvoided: m.cacheAvoided, partial: m.partial, rates: r, attemptIds: m.ids };
    });
    var tokAll = sum(list.map(function (m) { return m.tokens.total; })), valAll = sum(list.map(function (m) { return m.value.total; }));
    list.forEach(function (m) { m.share = tokAll ? m.tokens.total / tokAll : 0; m.valueShare = valAll ? m.value.total / valAll : 0; });
    list.sort(function (a, b) { return b.value.total - a.value.total || b.tokens.total - a.tokens.total; });
    list.forEach(function (m, i) { m.rank = i + 1; });
    var vendorRank = {};
    list.slice().sort(function (a, b) { return b.tokens.total - a.tokens.total; }).forEach(function (m) { vendorRank[m.vendor] = (vendorRank[m.vendor] || 0) + 1; m.shade = Math.min(4, vendorRank[m.vendor]); });
    memo['models' + key] = list;
    return list;
  }
  function valueByType() {
    var out = { input: 0, output: 0, reasoning: 0, cacheWrite: 0, cacheRead: 0, total: 0, tokens: { input: 0, output: 0, reasoning: 0, cacheWrite: 0, cacheRead: 0, total: 0 }, est: true };
    models().forEach(function (m) {
      out.input += m.value.in; out.output += m.value.out; out.reasoning += m.value.rsn; out.cacheWrite += m.value.cw; out.cacheRead += m.value.cr; out.total += m.value.total;
      out.tokens.input += m.tokens.in; out.tokens.output += m.tokens.out; out.tokens.reasoning += m.tokens.rsn; out.tokens.cacheWrite += m.tokens.cw; out.tokens.cacheRead += m.tokens.cr; out.tokens.total += m.tokens.total;
    });
    return out;
  }
  function costs() {
    var list = projectedAttempts(), out = { selected: 0, settled: 0, plan: 0, cache: 0, pending: 0, attempts: list.length, providers: 0, requests: 0, input: 0, output: 0,
      cacheRead: 0, cacheWrite: 0, planAttempts: 0, meteredAttempts: 0, settledAttempts: 0, byProvider: {}, hours: rangeHours(), statuses: {} };
    var seen = {};
    list.forEach(function (a) {
      out.settled += a.charge || 0; out.plan += a.plan_allocation_estimate || 0; out.cache += a.cache_avoided_estimate || 0;
      out.requests += a.request_count || 0; out.input += a.input_tokens || 0; out.output += a.output_tokens || 0;
      out.cacheRead += a.cache_read_tokens || 0; out.cacheWrite += a.cache_write_tokens || 0;
      out.statuses[a.settlement_status] = (out.statuses[a.settlement_status] || 0) + 1;
      if (/pending/.test(a.settlement_status)) out.pending += 1; else out.settledAttempts += 1;
      if (a.billing_basis === 'metered API') out.meteredAttempts += 1; else out.planAttempts += 1;
      seen[a.provider_id] = 1;
      var p = out.byProvider[a.provider_id] || (out.byProvider[a.provider_id] = { id: a.provider_id, attempts: 0, requests: 0, settled: 0, plan: 0, cache: 0, input: 0, output: 0, cacheRead: 0, pending: 0, billing: a.billing_basis, entitlement: a.entitlement_class });
      p.attempts += 1; p.requests += a.request_count || 0; p.settled += a.charge || 0; p.plan += a.plan_allocation_estimate || 0; p.cache += a.cache_avoided_estimate || 0;
      p.input += a.input_tokens || 0; p.output += a.output_tokens || 0; p.cacheRead += a.cache_read_tokens || 0; if (/pending/.test(a.settlement_status)) p.pending += 1;
    });
    out.selected = out.settled + out.plan; out.providers = Object.keys(seen).length;
    out.dayEquivalent = out.hours ? out.selected * 24 / out.hours : 0;
    return out;
  }

  /* daily cost by provider (A1 7.8): 30d and 7d daily stacks; the hourly variants use the heat value grid */
  function dailyByProvider(range) {
    var r = rangeKey(range), S = series(), spend = S.spendDaily30 || { values: [] }, by = S.spendDailyByProvider30 || {};
    var ids = Object.keys(by).filter(function (k) { return k[0] !== '_'; });
    var order = (PMU.settings.providers() || []).map(function (p) { return p.id; });
    ids.sort(function (a, b) { return (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b)); });
    ids = ids.filter(settingsInScope);
    var n = spend.values.length, take = r === '7d' || r === '24h' || r === '5h' ? 7 : n, start = n - take, today = new Date(); today.setHours(0, 0, 0, 0);
    var labels = [], xs = [];
    for (var d = start; d < n; d++) { var ms = today.getTime() - (n - 1 - d) * DAY; xs.push(ms); labels.push(PMU.fmt.date(ms)); }
    var stacks = ids.map(function (id) {
      var mk = PMU.markOf ? PMU.markOf(id) : { vendor: 'community' };
      return { providerId: id, vendor: mk.vendor, name: (PMU.roster.provider(id) || { name: id }).name, settled: by[id].settled.slice(start), estimate: by[id].estimate.slice(start) };
    }).filter(function (s) { return sum(s.settled) + sum(s.estimate) > 0; });
    var totals = xs.map(function (x, i) { return Math.round(sum(stacks.map(function (s) { return (s.settled[i] || 0) + (s.estimate[i] || 0); })) * 100) / 100; });
    return { labels: labels, x: xs, stacks: stacks, totals: totals, unit: 'usd', days: take, start: start,
      settled: sum(stacks.map(function (s) { return sum(s.settled); })), estimate: sum(stacks.map(function (s) { return sum(s.estimate); })) };
  }

  /* weekday x hour (A1 7.7): rows oldest day first, today last; hours after now are outside the range */
  function heat(mode) {
    var h = series().heat7x24 || { values: [] }, rows = [], today = new Date(); today.setHours(0, 0, 0, 0);
    var nowH = new Date().getHours();
    var useValue = mode === 'cost' && !!h.value;
    var grid = useValue ? h.value : h.values;
    var max = 0;
    for (var r = 0; r < 7; r++) {
      var ms = today.getTime() - (6 - r) * DAY;
      var cells = (grid[r] || []).map(function (v, c) {
        var outside = r === 6 && c > nowH; if (!outside && v > max) max = v;
        return { v: outside ? null : v, outside: outside, req: h.requests && h.requests[r] ? h.requests[r][c] : null, top: h.topModel ? h.topModel[c] : '' };
      });
      rows.push({ label: PMU.fmt.day(ms), ms: ms, cells: cells });
    }
    var peak = { r: 0, c: 0, v: -1 };
    rows.forEach(function (row, r) { row.cells.forEach(function (cell, c) { if (cell.v !== null && cell.v > peak.v) peak = { r: r, c: c, v: cell.v }; }); });
    return { rows: rows, max: max, peak: peak, mode: useValue ? 'cost' : 'tokens', hasValue: !!h.value };
  }

  /* resets and expiries (A1 7.10) */
  function agenda(horizon) {
    var hz = { '24h': DAY, '7d': 7 * DAY, '30d': 30 * DAY }[horizon || '7d'] || 7 * DAY, now = Date.now();
    var ro = PMU.roster.read(), events = [], unknown = [], passed = [], beyond = [];
    ro.providers.forEach(function (p) {
      if (!settingsInScope(p.id)) return;
      p.accounts.forEach(function (a) {
        var byMinute = {};
        a.windows.forEach(function (w) {
          if (w.pct === null) return;   /* no reading: nothing resets that we know of */
          if (w.truth === 'unknown' || w.resetAt === null) { unknown.push({ key: a.key + '/' + w.key, at: null, account: a, provider: p, windows: [w], what: w.short + ' reset unknown', used: [w.pct], stale: a.fresh.stale }); return; }
          var mk = Math.round(w.resetAt / MIN);
          (byMinute[mk] = byMinute[mk] || []).push(w);
        });
        Object.keys(byMinute).forEach(function (mk) {
          var ws = byMinute[mk], at = ws[0].resetAt;
          var what = ws.length === 1 ? ws[0].short + ' limit resets' : ws.map(function (w, i) { return i ? w.short.toLowerCase() : w.short; }).join(' and ') + ' limits reset';
          var ev = { key: a.key + '/' + mk, at: at, account: a, provider: p, windows: ws, what: what, used: ws.map(function (w) { return w.pct; }), inferred: ws.some(function (w) { return w.truth === 'locally_inferred'; }), stale: a.fresh.stale };
          if (at <= now) passed.push(ev); else if (at - now <= hz) events.push(ev); else beyond.push(ev);
        });
        a.amounts.forEach(function (x) {
          if (!x.expiresAt) return;
          var ev = { key: a.key + '/exp/' + x.label, at: x.expiresAt, account: a, provider: p, windows: [], what: (x.expiresText || 'Expires') + ' · ' + (x.value || x.word), used: [], expiry: true, stale: a.fresh.stale };
          if (ev.at <= now) passed.push(ev); else if (ev.at - now <= hz) events.push(ev); else beyond.push(ev);
        });
      });
    });
    events.sort(function (a, b) { return a.at - b.at; });
    var days = [];
    events.forEach(function (ev) {
      var d = new Date(ev.at); d.setHours(0, 0, 0, 0);
      var day = days[days.length - 1];
      if (!day || day.ms !== d.getTime()) { var head = PMU.fmt.dayHead(ev.at); day = { ms: d.getTime(), label: head.label, note: head.note, events: [] }; days.push(day); }
      day.events.push(ev);
    });
    beyond.sort(function (a, b) { return a.at - b.at; });
    return { days: days, unknown: unknown, passed: passed, beyond: beyond.length, beyondList: beyond, count: events.length };
  }

  /* quota history rows (A1 7.9): step runs, each coloured by its own state; a reset starts a new run with no connector */
  function runsOf(points) {
    var runs = [], n = points.length, cur = null;
    points.forEach(function (v, i) {
      if (v === null || v === undefined) { cur = null; return; }
      var prev = i > 0 ? points[i - 1] : null, reset = prev !== null && prev !== undefined && v < prev - 4;
      var tn = tone(v) || 'calm';
      if (!cur || reset || cur.tone !== tn) { cur = { i0: i, i1: i, v: [v], from: reset || !cur ? null : cur.v[cur.v.length - 1], tone: tn }; runs.push(cur); }
      else { cur.i1 = i; cur.v.push(v); }
    });
    return runs.map(function (r) { return { x0: r.i0 / n, x1: (r.i1 + 1) / n, i0: r.i0, i1: r.i1, v: r.v, from: r.from, tone: r.tone }; });
  }
  function quotaRows() {
    var ro = PMU.roster.read(), qh = series().quotaHistory7d || {}, bucketMs = (qh.bucket_min || 240) * MIN, groups = [], noWindows = [];
    var order = ['monthly', 'weekly', 'fiveHour'];
    var byLength = function (x, y) { return (order.indexOf(x.key) < 0 ? 9 : order.indexOf(x.key)) - (order.indexOf(y.key) < 0 ? 9 : order.indexOf(y.key)); };
    ro.providers.forEach(function (p) {
      if (!p.accounts.length || !settingsInScope(p.id)) return;
      if (!p.windows.length) { noWindows.push(p.name); return; }
      var rows = p.accounts.map(function (a) {
        var withHist = a.windows.filter(function (w) { return qh[a.key + '/' + w.key]; });
        var main = withHist.slice().sort(byLength)[0] || a.windows.slice().sort(byLength)[0];
        var pts = main ? qh[a.key + '/' + main.key] || null : null;
        var upcoming = a.windows.filter(function (w) { return w.resetAt && w.resetAt > Date.now() && w.truth !== 'unknown'; }).sort(function (x, y) { return x.resetAt - y.resetAt; })[0] || null;
        return { account: a, main: main, points: pts, runs: pts ? runsOf(pts) : [], next: upcoming,
          focus: a.windows.map(function (w) { return { label: w.short, key: w.key, points: qh[a.key + '/' + w.key] || null, resetAt: w.resetAt, pct: w.pct }; }) };
      });
      var mainKey = rows[0] && rows[0].main ? rows[0].main.key : p.windows[0].key;
      groups.push({ providerId: p.id, name: p.name, vendor: p.vendor, windowLabel: String((p.windows.filter(function (w) { return w.key === mainKey; })[0] || p.windows[0]).label).toLowerCase(), rows: rows, provider: p });
    });
    return { groups: groups, noWindows: noWindows, points: 42, bucketMs: bucketMs, now: Date.now() };
  }

  /* a plan card (Plans & limits, Overview): one of the six legacy providers, with the windows of the provider's effective
     Settings account so both rooms agree (R-PLAN-03/04) */
  function planView(legacyId) {
    var p = DATA.providers.filter(function (x) { return x.id === legacyId; })[0]; if (!p) return null;
    var sid = LEGACY_PROVIDER[legacyId] || legacyId, rp = PMU.roster.provider(sid), eff = rp ? rp.effective : null;
    var c = costs().byProvider[legacyId] || { attempts: 0, requests: 0, settled: 0, plan: 0, input: 0, output: 0, pending: 0 };
    var list = projectedAttempts().filter(function (a) { return a.provider_id === legacyId; });
    return { legacy: p, settingsId: sid, provider: rp, account: eff, windows: eff ? eff.windows : [], binding: eff ? eff.binding : null, costs: c, attempts: list,
      name: rp ? rp.name : p.name, plan: p.plan };
  }

  PMU.data = {
    attempts: function () { return projectedAttempts(); },
    providers: function () { return DATA.providers.filter(function (p) { return inScope(p.id); }); },
    inScope: inScope,
    settingsInScope: settingsInScope,
    scopeLegacy: scopeLegacy,
    costs: costs,
    buckets: buckets,
    tokens: tokens,
    costLine: costLine,
    attemptBuckets: attemptBuckets,
    models: models,
    valueByType: valueByType,
    dailyByProvider: dailyByProvider,
    heat: heat,
    agenda: agenda,
    quotaRows: quotaRows,
    planView: planView,
    series: function (name, range) { var s = series()[name]; return s && range && s[range] ? s[range] : s || null; },
    sum: sum,
    rangeLabel: function (range) { return { '5h': '5 hours', '24h': '24 hours', '7d': '7 days', '30d': '30 days' }[rangeKey(range)] || range; },
    scopeText: function () { var s = st.scope || 'all'; return s === 'all' ? 'All providers' : PMU.shell && PMU.shell.scopeLabel ? PMU.shell.scopeLabel(s) : s; },
    invalidate: function () { memo = {}; cache = null; }
  };
})();
