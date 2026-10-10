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
  /* a window reading that cannot decide a switch: an estimate, a local inference or one waiting for a recheck (AAC: local
     session logs never decide; a reading with an unknown reset time still can) */
  var UNTRUSTED = { pm_estimate: 1, locally_inferred: 1, pending_recheck: 1 };
  var loadedAt = clockNow();
  var cache = null, memo = {};
  var st = PMU.core.state;

  /* WOW-TASKS-3 P3-1: every "now" of the model goes through the engine's demo clock */
  function clockNow() { return PMU.clock && PMU.clock.now ? PMU.clock.now() : Date.now(); }
  function series() { return typeof PMU_SERIES === 'object' ? PMU_SERIES : {}; }
  /* the live overlay (WOW-SPEC-3 8.1, WOW-TASKS-3 N3-3): deltas the live script added while Usage is open (engine-owned
     object PMU.live.overlay; content reads it in every projection that feeds a shown reading). DATA never changes. */
  function OV() { return (PMU.live && PMU.live.overlay) || null; }
  function ov(key) { var o = OV(), v = o ? o[key] : 0; return typeof v === 'number' && isFinite(v) ? v : 0; }
  function round2(v) { return Math.round(v * 100) / 100; }
  function nextMonthStart() { var d = new Date(clockNow()); return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0).getTime(); }
  function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }
  function sum(a) { var s = 0; (a || []).forEach(function (v) { if (typeof v === 'number') s += v; }); return s; }

  /* ---------------------------------------------------------------- thresholds and the A1 state colours (4.2)
     Auto-switch is per provider (Jared 2026-10-09 item 2; AAC research R3 section 1). Four Settings rows carry a provider
     scope: ai.accounts.multi-account-switching, hard-switch-level and soft-warning-level (% LEFT; Usage shows % used) and
     cooldown-policy. Every threshold resolves through one ladder (USG-1, Jared 2026-10-10): global < project < provider <
     account, the most specific set value winning; an account's own switch level is ai.accounts.hard-switch-level at scope
     account (its warn level and rest period the same rows at scope account), and the retired
     ai.accounts.account-threshold-override is carried there by the Settings owner at load, never read here. The concept
     keeps project and global as one value (the Settings value), and that value is the default for every provider
     without one of its own; an account without its own value follows its provider. The provider values live in the
     Settings owner (PM51 providers manager, p.props[id], the providers-service scope); Usage reads them through
     PMU.settings and writes them only through the Settings owner (54-w-accounts.js PMU.accounts.setPolicy).
     thresholds() -> the global policy (unchanged contract); thresholds(providerId) -> that provider's resolved policy;
     thresholds(providerId, accountId) -> the same with the account's own values (switch level, warn level, rest period). A legacy provider id ('claude')
     resolves to its Settings id. Fields: auto, switchLeft, warnLeft (% left), cooldown, available, providerId, scope
     ('global' | 'provider' | 'account'), own {auto, switchLeft, warnLeft, cooldown}: true where the provider has its own
     value, shared: the global policy. */
  var POLICY_IDS = { auto: 'ai.accounts.multi-account-switching', switchLeft: 'ai.accounts.hard-switch-level', warnLeft: 'ai.accounts.soft-warning-level', cooldown: 'ai.accounts.cooldown-policy' };
  var policyMemo = {}, cooldownEnd = null;
  function autoOn(v) { return v !== false && v !== 'off' && v !== 'false' && v != null; }
  function levelOf(v, dflt) { if (v === '' || v === null || v === undefined) return dflt; var n = Number(v); return isFinite(n) && n > 0 && n < 100 ? n : dflt; }
  function cooldownOf(v) { return v === '' || v === null || v === undefined ? 'provider defaults' : String(v); }
  function globalPolicy() {
    if (policyMemo._g) return policyMemo._g;
    var auto = PMU.settings.value(POLICY_IDS.auto);
    return (policyMemo._g = { auto: auto === undefined ? true : autoOn(auto), switchLeft: levelOf(PMU.settings.value(POLICY_IDS.switchLeft), 10), warnLeft: levelOf(PMU.settings.value(POLICY_IDS.warnLeft), 20),
      cooldown: cooldownOf(PMU.settings.value(POLICY_IDS.cooldown)), available: PMU.settings.available(), scope: 'global', providerId: null, own: {}, shared: null });
  }
  function thresholds(providerId, accountId) {
    var g = globalPolicy(); if (!providerId) return g;
    var pid = LEGACY_PROVIDER[providerId] || providerId, key = pid + '/' + (accountId || '');
    if (policyMemo[key]) return policyMemo[key];
    var own = (PMU.settings.providerPolicy && PMU.settings.providerPolicy(pid, POLICY_IDS)) || {};
    var has = function (k) { return Object.prototype.hasOwnProperty.call(own, k) && own[k] !== null && own[k] !== undefined && own[k] !== ''; };
    var pol = { auto: has('auto') ? autoOn(own.auto) : g.auto, switchLeft: has('switchLeft') ? levelOf(own.switchLeft, g.switchLeft) : g.switchLeft,
      warnLeft: has('warnLeft') ? levelOf(own.warnLeft, g.warnLeft) : g.warnLeft, cooldown: has('cooldown') ? cooldownOf(own.cooldown) : g.cooldown,
      available: g.available && !!(PMU.settings.providerWritable && PMU.settings.providerWritable()), scope: 'provider', providerId: pid,
      own: { auto: has('auto'), switchLeft: has('switchLeft'), warnLeft: has('warnLeft'), cooldown: has('cooldown') }, shared: g };
    if (accountId && PMU.settings.accountValue) {
      var acc = function (id) { return PMU.settings.accountValue(pid, accountId, id); };
      var sw = levelOf(acc(POLICY_IDS.switchLeft), null), wn = levelOf(acc(POLICY_IDS.warnLeft), null), cd = acc(POLICY_IDS.cooldown);
      var cdOwn = cd !== undefined && cd !== null && cd !== '';
      if (sw !== null || wn !== null || cdOwn) {
        pol = Object.assign({}, pol, { scope: 'account', accountId: accountId,
          accountOwn: { switchLeft: sw !== null, warnLeft: wn !== null, cooldown: cdOwn }, provider: pol });
        if (wn !== null) pol.warnLeft = wn;
        if (sw !== null) pol.switchLeft = sw;
        if (cdOwn) pol.cooldown = cooldownOf(cd);
        /* the switch level stays under the warn level at the account scope too (the owner holds every write; a level that
           a later provider or shared warn change crossed is read at the highest switch choice below the warn level) */
        if (pol.switchLeft >= pol.warnLeft) pol.switchLeft = Math.max(5, Math.ceil(pol.warnLeft / 5) * 5 - 5);
      }
    }
    return (policyMemo[key] = pol);
  }
  /* calm | warn | crit | exhausted | over | null (null = missing: no bar); with a provider id, that provider's levels */
  function toneWith(pctUsed, th) {
    if (pctUsed === null || pctUsed === undefined || !isFinite(pctUsed)) return null;
    var left = 100 - pctUsed;
    if (pctUsed > 100) return 'over';
    if (left <= 0) return 'exhausted';
    if (left <= th.switchLeft) return 'crit';
    if (left <= th.warnLeft) return 'warn';
    return 'calm';
  }
  function tone(pctUsed, providerId, accountId) { return toneWith(pctUsed, thresholds(providerId, accountId)); }

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
  /* src: {pid, sampledAt (the account's reading time), source, readAt (a newer reading of this window: the demo hour's
     poll after a reset)}. Reset truth (lane d-plans, from AAC's pendingReset): a window whose reset time has passed while
     its reading predates that reset has no current reading: pct is null, vs 'reset_pending', and it reads "Reset at
     <time> · new reading pending" (never 0 %, never the old %; the old reading stays history only, in quota history).
     pol (lane d-switch, item 2): the account's resolved auto-switch policy, thresholds(providerId, accountId); without it
     the provider's own policy (src.pid), else the shared one */
  function windowView(key, label, fact, governed, rolls, src, pol) {
    fact = fact || { vs: 'unknown' };
    src = src || {};
    pol = pol || thresholds(src.pid);
    var pct = num(fact.pct);
    var resetAt = num(fact.reset_in_min) !== null ? loadedAt + fact.reset_in_min * MIN : num(fact.reset_passed_min) !== null ? loadedAt - fact.reset_passed_min * MIN
      : fact.reset_rule === 'next_month' ? nextMonthStart() : null;
    var winMin = fact.win_min || WINDOW_MIN[key] || null;
    /* a window whose reset passed during the demo hour (8.6) starts its next window: the reset moves on by whole windows */
    if (rolls > 0 && resetAt !== null && winMin) resetAt += rolls * winMin * MIN;
    var truth = fact.truth || 'unknown';
    /* when this window was read: its own age (a fact may carry age_s), a newer demo reading, else the account's reading */
    var sampledAt = num(src.readAt) !== null ? src.readAt : num(fact.age_s) !== null ? loadedAt - fact.age_s * 1000 : num(src.sampledAt);
    var lastPct = pct === null ? num(fact.last_pct) : pct;
    var passed = lastPct !== null && resetAt !== null && truth !== 'unknown' && (!fact.vs || fact.vs === 'ok' || fact.vs === 'estimated') && resetAt <= clockNow() && (sampledAt === null || sampledAt < resetAt);
    if (passed) pct = null;
    var pace = resetAt && winMin && !passed ? Math.max(0, Math.min(1, 1 - (resetAt - clockNow()) / (winMin * MIN))) : null;
    var vsState = passed ? 'reset_pending' : fact.vs && fact.vs !== 'ok' && fact.vs !== 'estimated' ? fact.vs : pct === null ? 'unknown' : (pct === 0 && fact.zero ? 'zero' : 'ok');
    return { key: key, label: label, short: shortLabel(key, label), pct: pct, left: pct === null ? null : Math.max(0, 100 - pct), used: passed ? null : num(fact.used), limit: num(fact.limit),
      unit: fact.unit || '', amount: passed ? '' : amountText(fact), resetAt: resetAt, truth: truth, conf: fact.conf || '', vs: vsState, est: fact.vs === 'estimated',
      note: fact.note || '', tone: toneWith(pct, pol), pace: pace, pacePts: passed ? null : num(fact.pace_pts), governed: !!governed, binding: false,
      resetPending: passed, lastPct: passed ? lastPct : null, sampledAt: sampledAt, source: src.source || '',
      /* this window's own provider policy (item 2): the notch of every meter sits at switchAt (% used) */
      providerId: pol.providerId || src.pid || '', switchAt: 100 - pol.switchLeft, warnAt: 100 - pol.warnLeft, autoOn: !!pol.auto };
  }
  /* "Reset at 13:50 · new reading pending" (a reset earlier today), "Reset at Tue 13:50 · ..." (this week), "Reset at Oct 2 · ..." */
  function resetPendingWord(w) {
    var dt = clockNow() - w.resetAt;
    var when = dt < DAY && new Date(w.resetAt).getDate() === new Date(clockNow()).getDate() ? PMU.fmt.clock(w.resetAt) : dt < 6 * DAY ? PMU.fmt.day(w.resetAt) + ' ' + PMU.fmt.clock(w.resetAt) : PMU.fmt.date(w.resetAt);
    /* "Reset at <time>" stays on one line where the words wrap in a narrow meter cell ("Reset at 22:59 ·" / "new reading
       pending", never "Reset at" / "22:59 · new" / "reading" / "pending": Retro at 1920; polish pass: nor "Reset" / "at
       06:03 ·"); the break may come after the time. The " · " stays a plain space so the fit code's ' · ' split holds */
    return 'Reset\u00a0at\u00a0' + String(when).replace(/ /g, '\u00a0') + ' · new reading pending';
  }
  function vsWord(w) {
    if (w.vs === 'reset_pending' && w.resetAt !== null) return resetPendingWord(w);
    if (w.vs === 'not_exposed') return w.note && /limit/.test(w.note) ? 'Limit not exposed' : 'Quota not exposed';
    if (w.vs === 'disabled') return 'Disabled';
    if (w.vs === 'unknown') return 'Usage unknown';
    return (PMU.vs.STATES[w.vs] || {}).word || 'Usage unknown';
  }

  /* the meters draw a missing reading with PMU.vs: a passed reset waiting for its next reading has its own state */
  if (PMU.vs && PMU.vs.STATES && !PMU.vs.STATES.reset_pending) PMU.vs.STATES.reset_pending = { glyph: 'refresh', word: 'New reading pending', tone: 'neutral' };

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

  /* ---------------------------------------------------------------- what auto-switch is doing for one provider
     (item 2; AAC policies() and codexFoot, research R3 section 1). One closed set of states, said in plain words:
       single        fewer than two accounts: "Auto-switch is off until a second account is signed in"
       no_windows    the provider reports no usage window to switch on
       off           the provider's toggle is off (past its switch point: the active account stays until you switch)
       unread        the active account has no fresh, identity-bound reading, so nothing is decided
       watching      the active account is under its switch point
       waiting_idle  past the switch point with a target chosen, the provider's tool is mid-work: the switch waits
       due           past the switch point with a target chosen and the tool idle: the next check switches
       no_candidate  past the switch point and no other account has a fresh reading with room (credits: paid credits
                     are being drawn by new work)
     The target is the eligible account with the most remaining (ties by priority); an account is eligible when it is
     signed in, not exhausted or cooling down, has a fresh trusted reading and is under its own switch point. */
  var TOOL = { 'claude-code': 'Claude Code', 'openai-codex': 'Codex', 'github-copilot': 'Copilot', 'qwen-coding': 'Qwen Code', 'kimi-coding': 'Kimi Code', 'gemini-direct': 'Gemini CLI',
    'cursor-cli': 'Cursor', antigravity: 'Antigravity', muse: 'Muse Code', 'zai-coding': 'Z.AI', 'opencode-go': 'OpenCode', grok: 'Grok Build', 'minimax-coding': 'MiniMax' };
  function toolOf(view) { return TOOL[view.id] || view.name; }
  /* a provider's tool is busy while one of its live attempts is pending (the overlay's own attempt rows) */
  function busyOf(view) {
    var o = OV(); if (!o || !o._attempts) return false;
    return o._attempts.some(function (x) { return x && !x.settled && (LEGACY_PROVIDER[x.provider] || x.provider) === view.id; });
  }
  /* why an account cannot take over, in plain words ('' = it can) */
  function whyNot(a) {
    if (!a.signedIn || a.state === 'signed-out') return 'signed out';
    if (a.state === 'needs-seat') return 'needs a seat';
    if (a.state === 'exhausted') { var x = a.windows.filter(function (w) { return w.pct !== null && w.pct >= 100; })[0]; return x && x.resetAt ? 'usage exhausted until ' + PMU.fmt.clock(x.resetAt) : 'usage exhausted'; }
    if (a.state === 'cooldown') return a.cooldown ? 'cooling down until ' + PMU.fmt.clock(a.cooldown.untilAt) : 'cooling down';
    if (!a.hasFacts) return 'no reading yet';
    if (!a.binding) return 'no usage window reported';
    if (a.fresh.stale) return 'its reading is ' + PMU.fmt.age(a.fresh.ageS) + ' old';
    if (UNTRUSTED[a.binding.truth]) return 'its reading is an estimate';
    if (a.binding.left <= a.policy.switchLeft) return Math.round(100 - a.binding.left) + '% used, at its switch point';
    return '';
  }
  function hasCredits(a) {
    return !!((a.credits && a.credits.vs !== 'not_exposed' && a.credits.left > 0) || (a.extra || []).some(function (x) { return /credit/i.test(x.label || '') && x.vs === 'ok'; }));
  }
  function autoStatus(view) {
    var pol = view.policy, a = view.effective, name = view.name, tool = toolOf(view);
    var at = a && a.policy ? 100 - a.policy.switchLeft : 100 - pol.switchLeft;
    var out = { providerId: view.id, name: name, policy: pol, switchAt: at, tool: tool, active: a, candidate: null, blocked: [], past: false, warn: false, credits: false, state: 'watching', words: '' };
    if (view.accounts.length < 2) { out.state = 'single'; out.words = 'Auto-switch is off until a second account is signed in'; return out; }
    if (!view.windows.length) { out.state = 'no_windows'; out.words = name + ' reports no usage window, so auto-switch moves on only when an account runs out'; return out; }
    out.past = !!(a && a.pastSwitch);
    if (!pol.auto) {
      out.state = 'off'; out.warn = out.past;
      out.words = out.past ? a.nickname + ' is at ' + Math.round(a.binding.pct) + '% used, ' + (Math.round(a.binding.pct) <= at ? 'at' : 'past') + ' the ' + at + '% switch point. Auto-switch is off, so it stays active until you switch' : 'Auto-switch is off for ' + name;
      return out;
    }
    if (!a) { out.state = 'unread'; out.words = 'No ' + name + ' account is active'; return out; }
    if (!a.readable) { out.state = 'unread'; out.words = 'Waiting for a fresh reading of ' + a.nickname + ' (' + (whyNot(a) || 'no reading yet') + ')'; return out; }
    if (!out.past) { out.state = 'watching'; out.words = a.nickname + ' moves on at ' + at + '% used'; return out; }
    var others = view.accounts.filter(function (x) { return x !== a; });
    var cands = others.filter(function (x) { return !whyNot(x); }).sort(function (x, y) { return (y.binding.left - x.binding.left) || (x.priority - y.priority); });
    out.blocked = others.filter(function (x) { return whyNot(x); }).map(function (x) { return { account: x, why: whyNot(x) }; });
    out.warn = true;
    /* an account that has run out says so, not that it "reached the 90% switch point" */
    var reached = a.binding.left <= 0 ? a.nickname + ' has run out' : a.nickname + ' reached the ' + at + '% switch point';
    if (!cands.length) {
      out.state = 'no_candidate'; out.credits = a.binding.left <= 0 && hasCredits(a);
      out.words = reached + '. No other ' + name + ' account has a fresh reading with room' +
        (out.credits ? '. New ' + tool + ' work draws on ' + a.nickname + '’s paid credits' : '');
      return out;
    }
    out.candidate = cands[0];
    if (busyOf(view)) { out.state = 'waiting_idle'; out.words = 'Will switch to ' + out.candidate.nickname + ' when ' + tool + ' goes idle'; }
    else { out.state = 'due'; out.words = reached + '. Switching to ' + out.candidate.nickname + ' on the next check'; }
    return out;
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
      var demoEff = OV() && OV()['eff:' + p.id];
      var eff = ovr[p.id] && keys.indexOf(ovr[p.id]) >= 0 ? ovr[p.id]
        : typeof demoEff === 'string' && keys.indexOf(demoEff) >= 0 ? demoEff
        : bridge && keys.indexOf(bridge) >= 0 ? bridge
        : nextKey && keys.indexOf(nextKey) >= 0 ? nextKey
        : factEff || (p.defaultAccount && keys.indexOf(p.id + '/' + p.defaultAccount) >= 0 ? p.id + '/' + p.defaultAccount : keys[0]);
      var isOverride = eff !== factEff && (!!(ovr[p.id] && ovr[p.id] === eff) || nextKey === eff);
      /* the provider's own auto-switch policy (item 2); an account with its own switch level reads it on its windows */
      view.policy = thresholds(p.id);
      accs.forEach(function (a, i) {
        var key = p.id + '/' + a.id, f = (ROSTER.facts || {})[key] || null, apol = thresholds(p.id, a.id);
        var wins = view.windows.map(function (w) {
          var fact = f && f.windows ? f.windows[w.key] : null;
          if (!fact && !f && a.usage && a.usage.windows && a.usage.windows[w.key] && typeof a.usage.windows[w.key].pct === 'number') fact = { pct: a.usage.windows[w.key].pct, truth: 'unknown' };
          var dw = ov('win:' + key + '/' + w.key);
          if (dw && fact && num(fact.pct) !== null) {
            fact = Object.assign({}, fact, { pct: Math.max(0, Math.round((fact.pct + dw) * 10) / 10) });
            if (num(fact.used) !== null && num(fact.limit) !== null) fact.used = Math.round(fact.used + dw / 100 * fact.limit);
          }
          var wv = windowView(w.key, w.label, fact, governed, ov('roll:' + key + '/' + w.key),
            { pid: p.id, sampledAt: f && f.fresh && num(f.fresh.age_s) !== null ? loadedAt - f.fresh.age_s * 1000 : null, source: f && f.fresh ? f.fresh.source || '' : '', readAt: OV() ? OV()['read:' + key + '/' + w.key] : null }, apol);
          /* a provider with one account does not switch (AAC; its plate says "Off · one account"), so its notch is dim on
             every meter that reads autoOn (the Plans & limits meters too) */
          if (accs.length < 2) wv.autoOn = false;
          return wv;
        });
        var known = wins.filter(function (w) { return w.pct !== null; });
        var binding = known.slice().sort(function (x, y) { return (x.left - y.left) || (WINDOW_ORDER.indexOf(x.key) - WINDOW_ORDER.indexOf(y.key)); })[0] || null;
        if (binding) binding.binding = true;
        var state = f && f.state ? f.state : (a.active === false ? 'signed-out' : /limit/i.test(a.health || '') ? 'exhausted' : f ? 'standby' : 'unknown');
        var ovState = OV() && OV()['state:' + key]; if (typeof ovState === 'string' && STATE_WORD[ovState]) state = ovState;
        var effective = key === eff;
        var cooldown = f && f.cooldown ? { untilAt: loadedAt + (f.cooldown.until_in_min || 0) * MIN, reason: f.cooldown.reason, source: f.cooldown.source, retry: f.cooldown.retry_budget } : null;
        /* the bridge's seconds count down on the real clock: anchored there, the demo hour's clock passes the end (8.6) */
        /* the app's countdown (seconds left, ticked by the host) gives the same end each second within its jitter: the end
           seen first is kept while a new reading lands within 5 s of it, so "Cooldown until 00:42" never flips to 00:43 and
           back between two roster builds (d-switch: the flip re-rendered the Codex plate in the auto-switch click task) */
        if (cooldown && window.PM7_USAGE && Number(window.PM7_USAGE.cooldown_seconds) > 0) {
          var cdAt = Date.now() + Number(window.PM7_USAGE.cooldown_seconds) * 1000;
          if (cooldownEnd !== null && Math.abs(cdAt - cooldownEnd) < 5000) cdAt = cooldownEnd;
          cooldown.untilAt = cooldownEnd = cdAt;
        }
        if (cooldown && cooldown.untilAt <= clockNow()) { cooldown = null; if (state === 'cooldown') state = 'standby'; }
        var supports = !!(f && f.supports_manual_set_active) && accs.length > 1;
        var exhaustedWin = wins.filter(function (w) { return w.pct !== null && w.pct >= 100; })[0];
        var eligible = !supports ? { ok: false, reason: accs.length > 1 ? 'Manual choice not supported' : 'Only account' }
          : effective ? { ok: false, reason: 'Already in use' }
          : state === 'exhausted' ? { ok: false, reason: exhaustedWin && exhaustedWin.resetAt ? 'Usage exhausted until ' + PMU.fmt.clock(exhaustedWin.resetAt) : 'Usage exhausted' }
          : state === 'cooldown' ? { ok: false, reason: 'Cooldown until ' + PMU.fmt.clock(cooldown ? cooldown.untilAt : clockNow()) }
          : state === 'signed-out' ? { ok: false, reason: 'Signed out' }
          : state === 'needs-seat' ? { ok: false, reason: 'Needs a seat' } : { ok: true };
        var fresh = f && f.fresh ? { ageS: f.fresh.age_s, source: f.fresh.source, stale: !!f.fresh.stale } : { ageS: null, source: 'no reading yet', stale: false };
        /* one active account per provider: the effective one (integ3: after "Use this account" the routing default kept
           reading "Active" beside the override's "Active · override") */
        var shownState = state === 'standby' && effective && p.accounts.length > 1 ? 'active' : state === 'active' && !effective && p.accounts.length > 1 ? 'standby' : state;
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
          sampledAt: fresh.ageS === null ? null : loadedAt - fresh.ageS * 1000,
          windows: wins, binding: binding, amounts: amounts, noWindowsWord: noWindowsWord, extra: (f && f.extra) || [], credits: f && f.credits, spend: f && f.spend, cooldown: cooldown,
          failure: f && f.failure, routeRole: f ? f.route_role : '', legacy: f && f.legacy_id ? legacyFor(f.legacy_id) : null, legacyId: f ? f.legacy_id : null,
          supportsManual: supports, eligible: eligible, history: (f && f.history) || {}, hasFacts: !!f, roles: (a.props && a.props['ai.accounts.account-roles']) || [],
          billingEntity: a.props ? a.props['ai.accounts.billing-entity'] || '' : '',
          /* item 2: this account's resolved policy and whether its binding window is at or past its switch point; only a
             fresh, identity-bound reading may decide a switch (AAC assessRemaining): a reading the provider reported for
             this account, not a cached one */
          policy: apol, pastSwitch: !!(binding && binding.left <= apol.switchLeft), readable: !!(f && !fresh.stale && binding && !UNTRUSTED[binding.truth]) };
        view.accounts.push(av); accounts.push(av);
      });
      view.effective = view.accounts.filter(function (a) { return a.effective; })[0] || null;
      view.exhausted = view.accounts.filter(function (a) { return a.state === 'exhausted'; });
      view.auto = autoStatus(view);
      views.push(view);
      var g = groups.filter(function (x) { return x.id === view.group; })[0] || groups[groups.length - 1];
      g.providers.push(view);
    });
    var demoLog = ((OV() && OV()._switches) || []).map(function (e) { return { at_ms: e.at, provider: e.provider, from: e.from, to: e.to, code: 'threshold_preemptive_switch', text: e.text, outcome: 'switched', demo: true }; });
    var log = demoLog.concat(ROSTER.switch_log || []).map(function (e) {
      var p = views.filter(function (v) { return v.id === e.provider; })[0];
      var nick = function (id) { var a = p && p.accounts.filter(function (x) { return x.id === id; })[0]; return a ? a.nickname : id; };
      return { at: e.at_ms != null ? e.at_ms : loadedAt - e.at_min_ago * MIN, providerId: e.provider, providerName: p ? p.name : e.provider, from: e.from, to: e.to, fromName: e.from ? nick(e.from) : '', toName: e.to ? nick(e.to) : '',
        code: e.code, text: e.text, outcome: e.outcome };
    }).sort(function (a, b) { return b.at - a.at; });
    /* every resolved auto-switch policy in one string (item 2): the card memo signature (50-w-common.js msig) holds it, so
       a per-provider or per-account change re-renders the cards that draw a notch or a tone */
    var policySig = accounts.map(function (a) { var q = a.policy || th; return a.key + ':' + (q.auto ? 1 : 0) + '/' + q.switchLeft + '/' + q.warnLeft; }).join(',');
    return { groups: groups, providers: views, accounts: accounts, switchLog: log, thresholds: th, policySig: policySig };
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
    /* item 2: one provider's resolved policy and what its auto-switch is doing (autoStatus); the Settings ids */
    policy: function (id, accountId) { return thresholds(id, accountId); },
    autoStatus: function (id) { var p = PMU.roster.provider(LEGACY_PROVIDER[id] || id); return p ? p.auto : null; },
    whyNot: whyNot,
    POLICY_IDS: POLICY_IDS,
    vsWord: vsWord,
    loadedAt: loadedAt,
    invalidate: function () { cache = null; memo = {}; policyMemo = {}; }
  };
  PMU.settings.onChange(function () { cache = null; memo = {}; policyMemo = {}; });

  /* ---------------------------------------------------------------- one fixture clock (REVIEW-jared must-fix 8)
     The series and the roster facts are anchored to the page's load time; the old page's frozen clock strings
     ("16:05:42", "resets 16:48", "Cooldown · 40m") were written at their own "now", 16:08. Every such string is shown
     on the page clock: the same offset from now that it had from 16:08, so a cooldown that ends in 40 minutes ends 40
     minutes from now and an event 3 minutes old is 3 minutes old. The fixture text itself is never changed. */
  var FIXTURE_NOW_MIN = 16 * 60 + 8;
  function fixtureAt(hms) {
    var p = String(hms || '').split(':').map(Number); if (p.length < 2 || !isFinite(p[0]) || !isFinite(p[1])) return null;
    return loadedAt + ((p[0] * 60 + p[1] + (p[2] || 0) / 60) - FIXTURE_NOW_MIN) * MIN;
  }
  /* the engine's demo clock (00-core.js PMU.clock: now / date / offset / advance / reset / demo, WOW-TASKS-3 P3-1) is
     extended here, never replaced */
  PMU.clock = Object.assign(PMU.clock || {}, {
    loadedAt: loadedAt,
    fixtureAt: fixtureAt,
    /* "16:48" -> the page clock time; "16:05:42" -> "HH:MM" */
    clock: function (hms) { var at = fixtureAt(hms); return at === null ? String(hms) : PMU.fmt.clock(at); },
    /* replace every HH:MM(:SS) in a fixture sentence with its page clock time */
    text: function (str) { return String(str == null ? '' : str).replace(/\b(\d\d):(\d\d)(?::\d\d)?\b/g, function (m0) { return PMU.clock.clock(m0); }); },
    ago: function (hms) { var at = fixtureAt(hms); return at === null ? '' : PMU.fmt.age(Math.max(0, (clockNow() - at) / 1000)); },
    until: function (hms) { var at = fixtureAt(hms); return at === null ? '' : PMU.fmt.span(Math.max(0, at - clockNow())); }
  });

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
    var n = (tk.input || []).length, bm = tk.bucket_min * MIN, now = clockNow();
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
    /* live: the running work's tokens (tok:<provider>, split 3 : 1 into input and output) and cache reads land in the NOW
       (last) bucket; a missing bucket stays missing */
    var o = OV(), last = out.input.length - 1;
    if (o && last >= 0) {
      Object.keys(o).forEach(function (k) {
        if (k.indexOf('tok:') !== 0 || !inScope(k.slice(4)) || !(o[k] > 0)) return;
        var dIn = Math.round(o[k] * 0.75);
        if (out.input[last] !== null) out.input[last] += dIn;
        if (out.output[last] !== null) out.output[last] += o[k] - dIn;
      });
      if (ov('cache.read') > 0 && (st.scope || 'all') === 'all' && out.cacheRead[last] !== null) out.cacheRead[last] += Math.round(ov('cache.read'));
    }
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
  /* ---------------------------------------------------------------- live attempts (FINAL-REVIEW-3 must-fix 2)
     An attempt the live script plays (roster.json live: "attempt") is a real attempt row of the overlay (overlay._attempts,
     WOW-SPEC-3 8.4 "an attempt arrives"): it arrives with its receipt pending (no value yet: never $0), and the next live
     value beat settles it with that beat's value (the value moves from the running work onto the receipt, so every total
     stays continuous). It carries the identity axes of its provider's newest fixture attempt and is labelled a live demo
     reading. DATA and PM7_USAGE.projectedAttempts never change: these rows exist only in the overlay. Newest first. */
  var LIVE_TPL = {};
  function liveTemplate(legacy) {
    if (LIVE_TPL[legacy] !== undefined) return LIVE_TPL[legacy];
    var best = null;
    DATA.attempts.forEach(function (a) { if (a.provider_id === legacy && (!best || new Date(a.occurred_at) > new Date(best.occurred_at))) best = a; });
    LIVE_TPL[legacy] = best;
    return best;
  }
  function liveAttempts() {
    var o = OV(), list = o && o._attempts;
    if (!list || !list.length) return [];
    var s = st.scope || 'all', out = [];
    list.forEach(function (x) {
      var tpl = liveTemplate(x.provider); if (!tpl) return;
      if ((s === 'work' || s === 'personal') && tpl.scope !== s) return;
      if (s.indexOf('provider:') === 0 && tpl.provider_id !== s.slice(9)) return;
      var tin = Math.round((x.tokens || 0) * 0.75), n = String(x.n), settled = !!x.settled;
      out.push(Object.assign({}, tpl, {
        attempt_id: 'live-' + (n.length < 2 ? '0' : '') + n, usage_event_ref: 'ue-live-' + n, usage_record_id: 'ur-live-' + n, provider_attempt_ref: settled ? 'pa-live-' + n : 'pending',
        occurred_at: new Date(x.at).toISOString(), input_tokens: tin, output_tokens: (x.tokens || 0) - tin, charge: 0,
        plan_allocation_estimate: settled ? x.value : 0, cache_avoided_estimate: 0, request_count: 1,
        settlement_status: settled ? 'settled' : 'pending provider receipt', settlement_authority: 'live demo reading (concept fixture)',
        source_authority: 'live demo reading (concept fixture)', projection_freshness: 'current', projection_health: 'healthy',
        plan_allocation_authority: settled ? 'live demo estimate (concept fixture)' : 'receipt pending', cache_avoided_authority: 'not exposed',
        cache_read_tokens: 0, cache_write_tokens: 0, tool_error_count: 0, reasoning_tokens: 0, anomaly_score: 12, live: true
      }));
    });
    return out.reverse();
  }
  /* every attempt the page shows: the live rows (newest first) and the projected fixture attempts */
  function attemptsNow() { var live = liveAttempts(); return live.length ? live.concat(projectedAttempts()) : projectedAttempts(); }

  /* the cost line: settled charge + plan allocation estimate of the recorded attempts, summed per bucket (exact) */
  /* buckets no recorded attempt covers stay null (missing is never zero): the line breaks there */
  function costLine(range) {
    var b = buckets(range), list = projectedAttempts(), vals = b.x.map(function () { return null; }), split = b.x.map(function () { return {}; });
    var first = b.x[0];
    function place(a) {
      var t = new Date(a.occurred_at).getTime(); if (t < first) return -1;
      return Math.min(b.n - 1, Math.floor((t - first) / b.bucketMs));
    }
    list.forEach(function (a) {
      var i = place(a); if (i < 0) return;
      var v = (a.charge || 0) + (a.plan_allocation_estimate || 0);
      /* a receipt still pending with no value yet is unknown, not $0 (missing is never zero): the bucket keeps its gap */
      if (!(v > 0) && /pending/i.test(a.settlement_status || '')) { split[i]._pending = (split[i]._pending || 0) + 1; return; }
      vals[i] = (vals[i] || 0) + v;
      split[i][a.provider_id] = (split[i][a.provider_id] || 0) + v;
    });
    /* Live (FINAL-REVIEW-3 must-fix 1 and 2): the live demo readings move points that exist and never draw a point into a
       gap. A live attempt still waiting for its receipt is a pending marker; a live receipt and the running work's value
       join their bucket only where it already holds a recorded attempt (null + $0.04 drew a fake ~$0 point at NOW for the
       first half of every hour). What is not drawn stays in the total and is said in the readout (running). */
    var running = 0, live = liveAttempts();
    live.forEach(function (a) {
      var i = place(a); if (i < 0) return;
      var v = (a.charge || 0) + (a.plan_allocation_estimate || 0);
      if (!(v > 0)) { split[i]._pending = (split[i]._pending || 0) + 1; return; }
      if (vals[i] === null) { running += v; return; }
      vals[i] += v; split[i][a.provider_id] = (split[i][a.provider_id] || 0) + v;
    });
    var dv = (st.scope || 'all') === 'all' ? ov('value.window') : 0, li = vals.length - 1;
    if (dv && li >= 0 && vals[li] !== null) { vals[li] += dv; split[li].live = (split[li].live || 0) + dv; } else running += dv;
    return { values: vals.map(function (v) { return v === null ? null : Math.round(v * 100) / 100; }), split: split, total: sum(vals) + running, running: Math.round(running * 100) / 100,
      attempts: list.length + live.length };
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
    attemptsNow().forEach(function (a) {
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
    var list = attemptsNow(), out = { selected: 0, settled: 0, plan: 0, cache: 0, pending: 0, attempts: list.length, providers: 0, requests: 0, input: 0, output: 0,
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
    /* live: the running work's value (plan estimate) and cache facts (WOW-SPEC-3 8.3); live attempts are rows of the list
       above (pending until their receipt settles: FINAL-REVIEW-3 must-fix 2) */
    if (OV() && (st.scope || 'all') === 'all') {
      out.plan = round2(out.plan + ov('value.window'));
      out.cacheRead += Math.round(ov('cache.read')); out.cache = round2(out.cache + ov('cache.saved'));
    }
    out.plan = round2(out.plan); out.settled = round2(out.settled);
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
    var n = spend.values.length, take = r === '7d' || r === '24h' || r === '5h' ? 7 : n, start = n - take, today = new Date(clockNow()); today.setHours(0, 0, 0, 0);
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
    var h = series().heat7x24 || { values: [] }, rows = [], today = new Date(clockNow()); today.setHours(0, 0, 0, 0);
    var nowH = new Date(clockNow()).getHours();
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
    var hz = { '24h': DAY, '7d': 7 * DAY, '30d': 30 * DAY }[horizon || '7d'] || 7 * DAY, now = clockNow();
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

  /* quota history rows (A1 7.9): step runs, each coloured by its own state; a reset starts a new run with no connector.
     pol: the row account's resolved auto-switch policy (item 2), so a run turns warn or crit at that account's own levels */
  function runsOf(points, pol) {
    var runs = [], n = points.length, cur = null;
    points.forEach(function (v, i) {
      if (v === null || v === undefined) { cur = null; return; }
      var prev = i > 0 ? points[i - 1] : null, reset = prev !== null && prev !== undefined && v < prev - 4;
      var tn = (pol ? toneWith(v, pol) : tone(v)) || 'calm';
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
        if (pts && main && ov('win:' + a.key + '/' + main.key) && main.pct !== null) { pts = pts.slice(); pts[pts.length - 1] = main.pct; }
        /* the reset shown on the row is the plotted (main) window's own reset, never another window's (R-PLAN-07);
           the soonest reset of any window stays in the hover */
        var known = function (w) { return w && w.resetAt && w.resetAt > clockNow() && w.truth !== 'unknown'; };
        var upcoming = a.windows.filter(known).sort(function (x, y) { return x.resetAt - y.resetAt; })[0] || null;
        return { account: a, main: main, points: pts, runs: pts ? runsOf(pts, a.policy) : [], next: known(main) ? main : null, soonest: upcoming,
          focus: a.windows.map(function (w) { return { label: w.short, key: w.key, points: qh[a.key + '/' + w.key] || null, resetAt: w.resetAt, pct: w.pct }; }) };
      });
      var mainKey = rows[0] && rows[0].main ? rows[0].main.key : p.windows[0].key;
      groups.push({ providerId: p.id, name: p.name, vendor: p.vendor, windowLabel: String((p.windows.filter(function (w) { return w.key === mainKey; })[0] || p.windows[0]).label).toLowerCase(), rows: rows, provider: p });
    });
    /* now on the minute: the rows read the same within a minute, so a refresh that changes nothing keeps them */
    return { groups: groups, noWindows: noWindows, points: 42, bucketMs: bucketMs, now: Math.floor(clockNow() / 60000) * 60000 };
  }

  /* a plan plate (Plans & limits): one Settings provider with EVERY account (lane d-plans, Jared item 4: "doesn't have
     all the multiple accounts from the same provider"; MA-049: never one generic account label for a provider). id is a
     legacy id (claude, codex, ...: the old card's facts come along) or a Settings provider id (muse, antigravity, ...).
     account / windows / binding stay the effective account's, so the Overview and the pressure rows agree (R-PLAN-03/04) */
  function planView(id) {
    var legacyId = LEGACY_PROVIDER[id] && id !== 'opencode' ? id : SETTINGS_LEGACY[id] || null;
    var p = legacyId ? DATA.providers.filter(function (x) { return x.id === legacyId; })[0] || null : null;
    var sid = LEGACY_PROVIDER[id] || id, rp = PMU.roster.provider(sid), eff = rp ? rp.effective : null;
    if (!p && !rp) return null;
    var c = (legacyId && costs().byProvider[legacyId]) || { attempts: 0, requests: 0, settled: 0, plan: 0, input: 0, output: 0, pending: 0 };
    var list = legacyId ? attemptsNow().filter(function (a) { return a.provider_id === legacyId; }) : [];
    return { legacy: p, legacyId: legacyId, settingsId: sid, provider: rp, account: eff, accounts: rp ? rp.accounts : [], windowDefs: rp ? rp.windows : [],
      windows: eff ? eff.windows : [], binding: eff ? eff.binding : null, costs: c, attempts: list,
      name: rp ? rp.name : p.name, plan: p ? p.plan : eff ? eff.plan : '' };
  }

  PMU.data = {
    attempts: function () { return attemptsNow(); },
    liveAttempts: liveAttempts,
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
    invalidate: function () { memo = {}; cache = null; policyMemo = {}; },
    ov: ov,
    /* tokens of one legacy provider in the range, the live NOW bucket included (the token tiles) */
    provTokens: function (range, legacyId) {
      var by = (series().tokensByProvider || {})[rangeKey(range)] || {}, arr = by[legacyId];
      if (!arr) return null;
      return sum(arr) + (ov('tok:' + legacyId) > 0 ? ov('tok:' + legacyId) : 0);
    },
    provSeries: function (range, legacyId) {
      var by = (series().tokensByProvider || {})[rangeKey(range)] || {}, arr = by[legacyId];
      if (!arr) return null;
      var d = ov('tok:' + legacyId); if (!(d > 0) || !arr.length) return arr;
      arr = arr.slice(); arr[arr.length - 1] = (arr[arr.length - 1] || 0) + d; return arr;
    },
    /* the live alerts (beat 7), newest first: {id, title, detail, state, provider_id, owner, account, at} */
    /* the month's spend with the Live running work (FINAL-REVIEW-3 must-fix 3): the running work is plan-covered, so the
       live spend.month delta lands on the plan allocation estimate part and on today's spend; the API part is receipts
       only. Every split of the month (budget legend, Spend period, cost authority, burn basis) reads this, so each sums
       to its headline after any number of beats. */
    monthSpend: function () {
      var live = ov('spend.month'), c = DATA.costs;
      return { month: round2(c.month + live), plans: round2(c.plans + live), api: c.api, live: round2(live) };
    },
    /* today's spend with the live delta (the last day of spendDaily30) */
    spendDaily: function () {
      var S = series().spendDaily30 || { values: [] }, v = (S.values || []).slice(), live = ov('spend.month');
      if (live && v.length && v[v.length - 1] !== null) v[v.length - 1] = round2(v[v.length - 1] + live);
      return Object.assign({}, S, { values: v });
    },
    liveAlerts: function () {
      var o = OV(); if (!o) return [];
      return Object.keys(o).filter(function (k) { return k.indexOf('alert:') === 0 && o[k] && typeof o[k] === 'object'; }).map(function (k) { return o[k]; })
        .sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    },
    live: liveApi()
  };
  /* ---------------------------------------------------------------- the live script (WOW-SPEC-3 8.3, roster.json live)
     PMU.data.live.apply(overlay, i) adds beat i's deltas into the engine's overlay object and returns the share keys that
     changed and the lead keys (in preference order). The 1x loop: window beats in the first loop only, beat 7 (the warn
     line) once per page load; later loops play the spend and token beats. */
  function liveApi() {
    function script() { var L = (window.PM_USAGE_ROSTER && window.PM_USAGE_ROSTER.live) || ROSTER.live || null; return (L && L.loop) || []; }
    var SHARE_OF = { 'spend.month': ['num:spend.month', 'chart:budget'], 'value.window': ['num:value.window'], attempts: ['num:attempts.count'],
      'cache.read': ['num:cache.read'], 'cache.saved': ['num:cache.saved'] };
    function sharesOf(beat) {
      var out = [];
      Object.keys(beat.deltas || {}).forEach(function (k) {
        if (k.indexOf('win:') === 0) { out.push(k); out.push('acct:' + k.slice(4).split('/').slice(0, 2).join('/')); }
        else if (k.indexOf('tok:') === 0) { out.push('num:tokens.total'); out.push('chart:tokens'); out.push('num:tokens.' + k.slice(4)); }
        else (SHARE_OF[k] || ['num:' + k]).forEach(function (x) { out.push(x); });
      });
      if (beat.alert) out.push('alert:' + beat.alert.id);
      if (beat.attempt) out.push('num:attempts.count');
      return out.filter(function (x, i) { return out.indexOf(x) === i; });
    }
    /* a live attempt arrives with its receipt pending (FINAL-REVIEW-3 must-fix 2) */
    function addAttempt(o, spec, at) {
      if (!spec || !spec.provider) return false;
      o._attemptSeq = (o._attemptSeq || 0) + 1;
      o._attempts = (o._attempts || []).concat([{ n: o._attemptSeq, provider: spec.provider, tokens: spec.tokens || 0, at: at, settled: false, value: 0 }]);
      return true;
    }
    /* a live value beat settles the oldest live attempt still pending: the beat's value moves onto its receipt (instead of
       the running work), so the window value and every total move by the same amount either way */
    function settleWith(o, d, at) {
      var p = (o._attempts || []).filter(function (x) { return !x.settled; })[0];
      if (!p || !(d > 0)) return false;
      p.settled = true; p.value = Math.round(d * 1e6) / 1e6; p.settledAt = at;
      return true;
    }
    function playable(o, i) {
      var b = script()[i]; if (!b) return false;
      var played = o._played || {};
      if (b.once && played[b.beat]) return false;
      if (b.firstLoop && (o._loop || 0) > 0) return false;
      return true;
    }
    return {
      script: script,
      size: function () { return script().length; },
      sharesOf: function (i) { var b = script()[i]; return b ? sharesOf(b) : []; },
      /* the next playable beat from the overlay's cursor (advances the cursor and the loop count) */
      next: function (o) {
        var n = script().length; if (!n || !o) return -1;
        for (var k = 0; k < n * 2; k++) {
          var i = o._cursor || 0;
          o._cursor = (i + 1) % n; if (o._cursor === 0) o._loop = (o._loop || 0) + 1;
          if (playable(o, i)) return i;
        }
        return -1;
      },
      apply: function (o, i) {
        var b = script()[i]; if (!b || !o) return null;
        var extra = [], now = clockNow();
        /* the value of this beat settles a pending live attempt first (it then is that receipt's value, not running work) */
        var settled = b.deltas && settleWith(o, b.deltas['value.window'], now);
        if (settled) extra.push('num:attempts.settle');
        Object.keys(b.deltas || {}).forEach(function (k) {
          var d = b.deltas[k]; if (typeof d !== 'number' || !isFinite(d)) return;
          if (settled && k === 'value.window') return;
          /* a window that has no reading never moves (missing never becomes a number) */
          if (k.indexOf('win:') === 0) { var parts = k.slice(4).split('/'), acc = PMU.roster.account(parts[0] + '/' + parts[1]); var w = acc && acc.windows.filter(function (x) { return x.key === parts[2]; })[0]; if (!w || w.pct === null) return; }
          o[k] = Math.round(((o[k] || 0) + d) * 1e6) / 1e6;
        });
        if (b.alert) o['alert:' + b.alert.id] = Object.assign({}, b.alert, { at: now, time: 'now', live: true });
        if (b.attempt) addAttempt(o, b.attempt, now);
        o._played = o._played || {}; o._played[b.beat] = (o._played[b.beat] || 0) + 1;
        memo = {}; cache = null;
        return { beat: i, n: b.beat, shares: sharesOf(b).concat(extra), lead: (b.lead || []).slice() };
      },
      reset: function (o) { if (!o) return; Object.keys(o).forEach(function (k) { delete o[k]; }); memo = {}; cache = null; },
      /* WOW-SPEC-3 8.6 / WOW-TASKS-3 P3-2 (flag playHour): one step of "Play the next hour" (the engine advanced the demo
         clock by two demo minutes before calling). Readings rise every step (roster.json live.hour); the climbing window
         is the effective account's, so after an auto-switch the next account climbs; a window whose reset time the demo
         clock passed starts its next window (0 % used, its reset moved on, "Usage exhausted" ends); a cooldown ends by
         the clock (the roster already reads it); the auto-switch is per provider (item 2): it happens when that
         provider's toggle is on and its active account's fresh reading reaches that provider's own switch point, to the
         eligible account with a fresh reading and the most room, once the provider's tool is idle (a pending live attempt
         of that provider holds it: "Will switch to X when <tool> goes idle"); the switch history gains "Auto-switch
         (demo)". Settings is never written; DATA never changes.
         Returns {shares, lead} like apply(): every changed number and every account whose state, effective flag or
         window readings changed. */
      hourStep: function (o, now, step) {
        if (!o) return null;
        var L = (window.PM_USAGE_ROSTER && window.PM_USAGE_ROSTER.live) || ROSTER.live || {}, H = L.hour || {};
        var changed = {}, lead = [];
        var add = function (k, d) {
          if (typeof d !== 'number' || !isFinite(d) || !d) return;
          /* the step's value settles a pending live attempt first (must-fix 2) */
          if (k === 'value.window' && settleWith(o, d, now)) { changed['attempts.settle'] = true; return; }
          o[k] = Math.round(((o[k] || 0) + d) * 1e6) / 1e6; changed[k] = true;
        };
        var inval = function () { memo = {}; cache = null; };
        var snap = function () {
          var out = {};
          PMU.roster.read().accounts.forEach(function (a) {
            out[a.key] = JSON.stringify([a.shownState, a.stateWord, a.effective, a.windows.map(function (w) { return [w.key, w.pct, w.resetAt]; })]);
          });
          /* what auto-switch is doing for each provider (item 2): a change patches the provider's cards through its active
             account's keys */
          PMU.roster.read().providers.forEach(function (p) { if (p.auto && p.accounts.length > 1) out['auto:' + p.id] = p.auto.state + '|' + (p.auto.candidate ? p.auto.candidate.key : '') + '|' + (p.effective ? p.effective.key : ''); });
          return out;
        };
        var before = o._hourSnap || snap();
        /* 1 the steady readings (tokens, spend, value, cache, attempts) */
        var every = function (map, n) { if (map && (!n || step % n === 0)) Object.keys(map).forEach(function (k) { add(k, map[k]); }); };
        every(H.every); every(H.every3, 3); every(H.every4, 4);
        /* a live attempt arrives every attempt_every steps, its receipt pending until the next step's value */
        if (H.attempt && H.attempt_every && step % H.attempt_every === 0 && addAttempt(o, H.attempt, now)) changed.attempts = true;
        /* more providers' tools at work (item 2: a provider's tool is busy while its live attempt is pending, and its
           auto-switch waits for it to go idle): {provider, tokens, every, from} */
        (H.attempts || []).forEach(function (x) { if (x && x.every && step >= (x.from || 0) && (step - (x.from || 0)) % x.every === 0 && addAttempt(o, x, now)) changed.attempts = true; });
        /* 2 the climbing windows: the effective account of each provider in the script */
        inval();
        var crossedWarn = [];
        (H.climb || []).forEach(function (c) {
          var pv = PMU.roster.provider(c.provider), a = pv && pv.effective; if (!a) return;
          Object.keys(c.windows || {}).forEach(function (wk) {
            var w = a.windows.filter(function (x) { return x.key === wk; })[0]; if (!w || w.pct === null) return;
            var k = 'win:' + a.key + '/' + wk, was = w.pct, thl = a.policy || PMU.roster.thresholds(pv.id);
            add(k, c.windows[wk]);
            if (was < 100 - thl.warnLeft && was + c.windows[wk] >= 100 - thl.warnLeft) crossedWarn.push(a);
            if (!lead.length) lead.push(k);
          });
        });
        /* 3 resets the demo clock passed (reset truth, lane d-plans): the window first reads "Reset at <time> · new reading
           pending" (no reading: never 0 %, never the old %); the account's next poll, two steps (4 demo minutes) later,
           brings the new window's first reading (0 % used, its reset moved on by whole windows). An account whose readings
           are cached (stale) is not polled, so its window stays pending. Rolling windows with a known length only. */
        inval();
        PMU.roster.read().accounts.forEach(function (a) {
          var reset = false;
          a.windows.forEach(function (w) {
            if (!w.resetPending || w.lastPct === null || !(WINDOW_MIN[w.key])) return;
            var k = a.key + '/' + w.key;
            if (o['pend:' + k] == null) { o['pend:' + k] = step; changed['win:' + k] = true; if (!lead.length) lead.push('win:' + k); return; }
            if (a.fresh.stale || step - o['pend:' + k] < 2) return;
            o['roll:' + k] = (o['roll:' + k] || 0) + 1;
            o['win:' + k] = Math.round(((o['win:' + k] || 0) - w.lastPct) * 1e6) / 1e6;
            o['read:' + k] = now; delete o['pend:' + k];
            changed['win:' + k] = true; reset = true;
          });
          if (reset && a.state === 'exhausted' && !a.windows.some(function (w) { return w.pct !== null && w.pct >= 100 && !(w.resetAt !== null && w.resetAt <= now); })) o['state:' + a.key] = 'standby';
        });
        /* 4 the auto-switch, per provider (item 2, AAC rules): each provider in the climb script follows its own policy
           (PMU.roster.provider(id).auto, autoStatus): it switches only when its toggle is on, its active account's fresh
           reading reached that provider's own switch point, an eligible account with a fresh reading and room exists (the
           one with the most remaining) and its tool is idle; "waiting_idle" waits for the next step, "no_candidate" and
           "unread" say why on the plate and never switch */
        inval();
        (H.climb || []).forEach(function (c) {
          var pv = PMU.roster.provider(c.provider), a = pv && pv.effective, st = pv && pv.auto;
          if (!a || !st || st.state !== 'due' || !st.candidate || o['eff:' + pv.id]) return;   /* one demo switch per provider */
          var next = st.candidate;
          o['eff:' + pv.id] = next.key;
          if (a.state === 'active') o['state:' + a.key] = 'standby';
          o._switches = (o._switches || []).concat([{ provider: pv.id, from: a.id, to: next.id, at: now,
            text: (H.switch_text || 'Auto-switch (demo)') + ' · ' + a.nickname + ' reached ' + st.switchAt + '% used; switched to ' + next.nickname }]);
          lead.unshift('acct:' + next.key);
        });
        /* 5 the warn line crossed: the same alert the 1x loop plays once (beat 7), if it has not arrived yet */
        if (crossedWarn.length) script().forEach(function (b) {
          if (!b.alert || o['alert:' + b.alert.id]) return;
          if (crossedWarn.some(function (a) { return b.alert.account === a.key; })) { o['alert:' + b.alert.id] = Object.assign({}, b.alert, { at: now, time: 'now', live: true }); changed['alert:' + b.alert.id] = true; lead.push('alert:' + b.alert.id); }
        });
        inval();
        var after = snap(); o._hourSnap = after;
        var shares = sharesOf({ deltas: Object.keys(changed).filter(function (k) { return k.indexOf('alert:') !== 0; }).reduce(function (m, k) { m[k] = 1; return m; }, {}) });
        Object.keys(changed).forEach(function (k) { if (k.indexOf('alert:') === 0) shares.push(k); });
        /* relative times move with the demo clock: every window with a reset time is touched (its cards patch as text) */
        PMU.roster.read().accounts.forEach(function (a) { a.windows.forEach(function (w) { if (w.resetAt !== null && w.pct !== null) shares.push('win:' + a.key + '/' + w.key); }); });
        Object.keys(after).forEach(function (key) {
          if (before[key] === after[key]) return;
          if (key.indexOf('auto:') === 0) {
            var pa = PMU.roster.provider(key.slice(5)), ea = pa && pa.effective;
            if (ea) { shares.push('acct:' + ea.key); ea.windows.forEach(function (w) { shares.push('win:' + ea.key + '/' + w.key); }); if (lead.indexOf('acct:' + ea.key) < 0) lead.push('acct:' + ea.key); }
            return;
          }
          shares.push('acct:' + key);
          var a = PMU.roster.account(key); (a ? a.windows : []).forEach(function (w) { shares.push('win:' + key + '/' + w.key); });
        });
        if (!lead.length) lead = ['num:spend.month', 'num:value.window'];
        return { step: step, shares: shares.filter(function (x, i) { return shares.indexOf(x) === i; }), lead: lead };
      }
    };
  }
})();
