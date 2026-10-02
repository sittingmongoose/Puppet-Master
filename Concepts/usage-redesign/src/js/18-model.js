/* Shared projections (owner: content; ARCHITECTURE.md section 4.5). Widgets read PMU.data and PMU.roster, never raw
   arrays (R-GRID-08). Nothing here writes to DATA or its records: the boot check compares PM7_USAGE.data with the old
   page, so derived views are new objects. The skeleton's roster is complete enough for the Accounts room to start. */
(function () {
  var MIN = 60000;
  var ROSTER = window.PM_USAGE_ROSTER || { facts: {}, switch_log: [] };
  var LEGACY_PROVIDER = { claude: 'claude-code', codex: 'openai-codex', qwen: 'qwen-coding', gemini: 'gemini-direct', kimi: 'kimi-coding', copilot: 'github-copilot', opencode: 'opencode' };
  var SERIES_SLOT = { 'claude-code': 0, 'openai-codex': 1, 'qwen-coding': 2, 'qwen-token': 2, 'gemini-direct': 3, vertex: 3, 'kimi-coding': 4, 'github-copilot': 5, antigravity: 6, muse: 6 };
  var WINDOW_MIN = { fiveHour: 300, weekly: 10080 };
  var loadedAt = Date.now();
  var cache = null;

  function nextMonthStart() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0).getTime(); }
  function thresholds() {
    var auto = PMU.settings.value('ai.accounts.multi-account-switching');
    var sw = Number(PMU.settings.value('ai.accounts.hard-switch-level')), warn = Number(PMU.settings.value('ai.accounts.soft-warning-level'));
    return { auto: auto !== false && auto !== 'off', switchLeft: isFinite(sw) ? sw : 10, warnLeft: isFinite(warn) ? warn : 20 };
  }
  function tone(pctUsed) {
    if (pctUsed === null || pctUsed === undefined) return null;
    var th = thresholds(), left = 100 - pctUsed;
    if (left <= 0) return 'exhausted';
    if (left <= th.switchLeft) return 'hot';
    if (left <= th.warnLeft) return 'warn';
    if (left <= th.warnLeft * 2) return 'watch';
    return 'calm';
  }
  function windowView(key, label, fact) {
    fact = fact || { vs: 'unknown' };
    var pct = typeof fact.pct === 'number' ? fact.pct : null;
    var resetAt = typeof fact.reset_in_min === 'number' ? loadedAt + fact.reset_in_min * MIN : fact.reset_rule === 'next_month' ? nextMonthStart() : null;
    var winMin = fact.win_min || WINDOW_MIN[key] || null;
    var pace = resetAt && winMin ? Math.max(0, Math.min(1, 1 - (resetAt - Date.now()) / (winMin * MIN))) : null;
    return { key: key, label: label, pct: pct, left: pct === null ? null : Math.max(0, 100 - pct), used: fact.used, limit: fact.limit, unit: fact.unit,
      resetAt: resetAt, truth: pct === null && !fact.truth ? 'unknown' : (fact.truth || 'unknown'), conf: fact.conf,
      vs: fact.vs || (pct === 0 && fact.zero ? 'zero' : 'ok'), note: fact.note || '', tone: tone(pct), pace: pace,
      pacePts: typeof fact.pace_pts === 'number' ? fact.pace_pts : null, binding: false };
  }
  function stateWord(state) {
    return { active: 'Active', standby: 'Standby', exhausted: 'Usage exhausted', cooldown: 'Cooldown', 'signed-out': 'Signed out', 'needs-seat': 'Needs a seat' }[state] || 'Usage unknown';
  }
  function legacyFor(id) { return DATA.accounts.filter(function (a) { return a.id === id; })[0] || null; }

  function build() {
    var providers = PMU.settings.providers(), next = PMU.settings.nextAccount();
    var override = PMU.core.state.accountOverride || null;
    var groups = PMU.settings.GROUPS.map(function (g) { return { id: g.id, label: g.label, providers: [] }; });
    var views = [], accounts = [];
    providers.forEach(function (p) {
      var winDefs = p.windows && typeof p.windows === 'object' ? p.windows : {};
      var winKeys = ['fiveHour', 'weekly', 'monthly'].filter(function (k) { return winDefs[k] != null; })
        .concat(Object.keys(winDefs).filter(function (k) { return ['fiveHour', 'weekly', 'monthly'].indexOf(k) < 0; }));
      var order = (p.routing && Array.isArray(p.routing.accountOrder)) ? p.routing.accountOrder : [];
      var accs = (p.accounts || []).slice().sort(function (a, b) {
        var ia = order.indexOf(a.id), ib = order.indexOf(b.id); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
      });
      var view = { id: p.id, name: p.name, group: p.bill || 'plan', kind: p.kind, product: p.product, vendor: p.vendor, status: p.status,
        statusWord: p.statusLabel || '', seriesIndex: SERIES_SLOT[p.id] === undefined ? 7 : SERIES_SLOT[p.id],
        windows: winKeys.map(function (k) { return { key: k, label: winDefs[k] }; }), accounts: [], setUp: accs.length > 0, widgetId: 'acct-' + p.id };
      accs.forEach(function (a, i) {
        var key = p.id + '/' + a.id, f = (ROSTER.facts || {})[key] || null;
        var wins = view.windows.map(function (w) { return windowView(w.key, w.label, f && f.windows ? f.windows[w.key] : null); });
        var binding = wins.filter(function (w) { return w.pct !== null; }).sort(function (x, y) { return x.left - y.left; })[0] || null;
        if (binding) binding.binding = true;
        var state = f ? f.state : (a.active ? 'standby' : 'signed-out');
        var effective = override ? override.key === key : (next && next.provider === p.id && next.account === a.id) ? true : !!(f && f.effective);
        var supports = !!(f && f.supports_manual_set_active) && accs.length > 1;
        var eligible = !supports ? { ok: false, reason: 'One account' } : state === 'exhausted' ? { ok: false, reason: 'Usage exhausted' }
          : state === 'cooldown' ? { ok: false, reason: 'Cooling down' } : state === 'signed-out' ? { ok: false, reason: 'Signed out' }
          : state === 'needs-seat' ? { ok: false, reason: 'Needs a seat' } : effective ? { ok: false, reason: 'Already in use' } : { ok: true };
        var av = { key: key, id: a.id, providerId: p.id, nickname: a.nickname || a.id, identity: a.identity || '', signedIn: !!a.active,
          isDefault: !!a.default, priority: i + 1, state: state, stateWord: stateWord(state), effective: effective, override: !!override && effective,
          plan: f ? f.plan : '', planLine: f ? f.plan_line : '', host: f ? f.host : '', auth: f ? f.auth : (a.method || ''),
          fresh: f && f.fresh ? { ageS: f.fresh.age_s, source: f.fresh.source, stale: !!f.fresh.stale } : { ageS: null, source: 'no reading yet', stale: false },
          windows: wins, binding: binding, extra: (f && f.extra) || [], credits: f && f.credits, spend: f && f.spend, cooldown: f && f.cooldown,
          failure: f && f.failure, routeRole: f ? f.route_role : '', legacy: f && f.legacy_id ? legacyFor(f.legacy_id) : null,
          supportsManual: supports, eligible: eligible, history: (f && f.history) || {} };
        view.accounts.push(av); accounts.push(av);
      });
      views.push(view);
      var g = groups.filter(function (x) { return x.id === view.group; })[0] || groups[0];
      g.providers.push(view);
    });
    return { groups: groups, providers: views, accounts: accounts, switchLog: ROSTER.switch_log || [] };
  }

  PMU.roster = {
    read: function () { if (!cache) cache = build(); return cache; },
    provider: function (id) { return PMU.roster.read().providers.filter(function (p) { return p.id === id; })[0] || null; },
    account: function (key) { return PMU.roster.read().accounts.filter(function (a) { return a.key === key; })[0] || null; },
    byLegacy: function (handle) {
      var id = String(handle || '').replace(/^(account|connection):/, '');
      var legacy = legacyFor(id); if (!legacy) return null;
      return PMU.roster.read().accounts.filter(function (a) { return a.legacy && a.legacy.id === legacy.id; })[0] || null;
    },
    legacyProvider: function (id) { return LEGACY_PROVIDER[id] || id; },
    thresholds: thresholds,
    tone: tone,
    invalidate: function () { cache = null; }
  };
  PMU.settings.onChange(function () { cache = null; });

  PMU.data = {
    attempts: function () { return projectedAttempts(); },
    providers: function () {
      var scope = PMU.core.state.scope;
      return DATA.providers.filter(function (p) { return scope.indexOf('provider:') !== 0 || p.id === scope.slice(9); });
    },
    costs: function () {
      var list = projectedAttempts(), out = { selected: 0, settled: 0, plan: 0, cache: 0, pending: 0, attempts: list.length, providers: 0 };
      var seen = {};
      list.forEach(function (a) {
        out.settled += a.charge; out.plan += a.plan_allocation_estimate; out.cache += a.cache_avoided_estimate;
        if (/pending/.test(a.settlement_status)) out.pending += 1; seen[a.provider_id] = 1;
      });
      out.selected = out.settled + out.plan; out.providers = Object.keys(seen).length;
      return out;
    },
    series: function (name) { return PMU_SERIES[name] || null; },
    invalidate: function () { cache = null; }
  };
})();
