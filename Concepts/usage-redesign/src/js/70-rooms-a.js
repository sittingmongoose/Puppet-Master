/* Widget definitions for Overview, Plans & limits, Costs and Accounts (owner: content; ARCHITECTURE.md 4.7, DESIGN-SPEC 15,
   DESIGN-SPEC-ATLAS 10 and 11). PMU.widgets.define(id, {kind, room, model(ctx), meta?(ctx), inspect?(ctx), config?, mark?});
   titles, kinds and levels default to PMU_BOARDS.widgets (tools/boards.py). Every value comes from PMU.data / PMU.roster
   (attempt projections for the range and scope, the roster for accounts) or from an explicit fixture of the old page
   (05-data.js) and keeps its state, source and freshness. No countdown to running out anywhere (X-06). */
(function () {
  var C = PMU.content, D = PMU.data, F = PMU.fmt, b = C.b;
  function def(id, room, o) { PMU.widgets.define(id, Object.assign({ room: room }, o)); }
  function rangeMeta(extra) { return function (ctx) { return D.rangeLabel(ctx.state.range) + ' · ' + (extra || 'selected records') + (ctx.state.scope !== 'all' ? ' · ' + D.scopeText() : ''); }; }
  function money(v) { return C.money(v); }
  var LEG_NAME = { claude: 'Claude', codex: 'ChatGPT / Codex', qwen: 'Qwen Coding Plan', gemini: 'Gemini API', kimi: 'Kimi Code', copilot: 'GitHub Copilot' };
  function legName(id) { var p = PMU.roster.provider(PMU.roster.legacyProvider(id)); return p ? p.name : LEG_NAME[id] || id; }
  C.legName = legName;
  var SHORT_NAME = { claude: 'Claude', codex: 'Codex', qwen: 'Qwen', gemini: 'Gemini', kimi: 'Kimi', copilot: 'Copilot' };
  /* the old fixtures' provider words ("Claude Code", "Codex", "Gemini Direct") and account names ("Anthropic · Work") are
     shown by their Settings names (DECISIONS "Provider catalog"); the raw words stay in the inspectors' raw view */
  var OLD_NAME = { 'Claude Code': 'claude', 'Claude': 'claude', 'Codex': 'codex', 'Qwen': 'qwen', 'Gemini Direct': 'gemini', 'Gemini': 'gemini', 'Kimi': 'kimi', 'Copilot': 'copilot', 'GitHub Copilot': 'copilot' };
  C.oldName = function (word) { var id = OLD_NAME[word]; return id ? legName(id) : word; };
  /* a legacy account handle ("claude-work-1", "account:claude-work-1") -> "Claude · Work Claude" */
  C.acctName = function (handle) {
    var a = PMU.roster.byLegacy(handle); if (a) return a.providerName + ' · ' + a.nickname;
    return String(handle || '').replace(/^account:/, '');
  };
  function attemptInspect(a, opener) { if (C.openAttempt) C.openAttempt(a, opener); }
  C.attemptInspect = attemptInspect;

  /* ================================================================== Overview */
  def('health', 'overview', { meta: function () { return 'current reading · scope and range do not apply'; }, model: function () {
    return { value: 92.4, fmt: 'pct1', share: 'num:health.score', delta: { v: 1.8, goodWhen: 'up' }, sub: 'provider readings healthy · trust ' + b('current'),
      facts: [['Fresh', '6 / 6'], ['Warnings', '2', { tone: 'warn' }], ['Sync age', '20s'], ['Unpriced', '0.02%'], ['Routes', '6'], ['Policy', 'All routes · within policy']],
      spark: { values: D.series('healthDaily7').values, idx: 1 }, foot: 'All routes · within policy' };
  }, inspect: function () { return C.insp('Usage health', [['Health', '92.4% provider readings healthy (+1.8%)'], ['Freshness', 'current · 6 of 6 fresh · sync 20s ago'], ['Warnings', '2'], ['Unpriced', '0.02% of events (3 events)'], ['Authority', 'provider reported · 20s ago']]); } });

  def('month', 'overview', { short: 'Window value', meta: rangeMeta(), model: function (ctx) {
    var c = D.costs();
    /* integ3: the attempts count is the lead of a running-work beat on Overview (WOW-SPEC-3 8.3 beat 2: "else attempts") */
    return { value: c.selected, fmt: 'money', share: 'num:value.window', sub: '<b data-share-v="num:attempts.count">' + c.attempts + '</b>' + (c.attempts === 1 ? ' attempt' : ' attempts') + ' · attempt-backed charge plus plan allocation',
      facts: [['Settled API', money(c.settled)], ['Plan estimate', money(c.plan) + ' est.'], ['Cache estimate', money(c.cache) + ' est.'], ['Pending', String(c.pending), c.pending ? { tone: 'warn' } : {}], ['24h equivalent', money(c.dayEquivalent)], ['Basis', D.rangeLabel(ctx.state.range) + ' selected window']] };
  } });

  def('cache-saved', 'overview', { meta: function (ctx) { return 'estimated · ' + D.rangeLabel(ctx.state.range); }, model: function () {
    var c = D.costs();
    return { value: c.cache, fmt: 'money', share: 'num:cache.saved', sub: b(c.attempts) + (c.attempts === 1 ? ' attempt' : ' attempts') + ' · explicit cache-avoided estimates',
      facts: [['Cache read', F.tok(c.cacheRead)], ['Cache write', F.tok(c.cacheWrite)], ['Providers', String(c.providers)], ['Authority', 'fixture record estimate'],
        ['30-day read', '6.29M'], ['30-day write', '347k'], ['Best route', 'Codex · 97.2%'], ['Low route', 'Gemini · 84.6%'], ['Read share', '96.8%'], ['30-day gain', '+12.4%']],
      spark: { values: D.series('cacheDaily30').saved, tk: 'cr', idx: 6 } };
  } });

  def('active-runs', 'overview', { meta: function () { return 'right now · Governor reading'; }, model: function () {
    return { value: 3, fmt: 'int', sub: 'runs across ' + b(9) + ' agents · ' + b(2) + ' queued',
      /* the facts the sub line does not already say lead (CONTENT-3: Oldest and Projected were folded at every size) */
      facts: [['Oldest', '38m'], ['Projected', '$8.40 est.'], ['Nodes', '47'], ['Agents', '9'], ['Running', 'run-47 Tastebook initial build']], foot: 'Run 47 · 6 specialists' };
  } });

  def('next-reset', 'overview', { meta: function () { return 'allowance clock · effective accounts'; }, model: function () {
    var ev = null;
    PMU.roster.read().providers.forEach(function (p) {
      if (!p.effective || !D.settingsInScope(p.id)) return;
      p.effective.windows.forEach(function (w) { if (w.resetAt && w.resetAt > PMU.clock.now() && w.truth !== 'unknown' && w.pct !== null && (!ev || w.resetAt < ev.w.resetAt)) ev = { p: p, a: p.effective, w: w }; });
    });
    if (!ev) return { vs: 'unknown', word: 'Reset unknown', sub: 'No effective account reports a reset time' };
    var other = ev.a.windows.filter(function (w) { return w !== ev.w && w.resetAt; })[0];
    return { text: F.clock(ev.w.resetAt), sub: b(ev.p.name + ' ' + ev.w.short) + ' · ' + b(C.fmt(ev.w.pct, 'pct')) + ' used · ' + esc(F.resetLine(ev.w).text),
      /* the reset words are in the second line already (a "Resets: resets in 1h 41m" fact repeated them) */
      facts: [['Route', ev.p.name + ' · ' + ev.a.nickname], ['Plan', ev.a.planLine || ev.a.plan], other ? [other.short, F.resetLine(other).text + ' · ' + C.fmt(other.pct, 'pct') + ' used'] : ['Windows', String(ev.a.windows.length)],
        ['Reset truth', PMU.fmt.truth(ev.w.truth)], ['After reset', 'pending recheck'], ['Source', ev.a.fresh.source + ' · ' + ev.a.ageText]] };
  } });

  /* plan plates (lane d-plans, Jared item 4): one plate per Settings provider with accounts, listing EVERY account (two or
     more: the account rows plate, 52-w-plans.js rowsPlate; one: the plan card with its windows, amounts and facts). The six
     legacy ids keep their widget ids and the old card's facts; the other providers of the review roster (Muse Code, Google
     Antigravity, Z.AI Coding Plan, OpenCode Go, Anthropic API, Cursor) get plan-<settings id> plates. */
  var PLAN_EXTRA = {
    claude: { share: 18, model: 'Sonnet 4.6' }, codex: { share: 23, model: 'GPT-5.4' }, qwen: { share: 31, model: 'Qwen3 Coder' },
    gemini: { share: 29, model: 'Gemini 3.1 Pro' }, kimi: { share: 36, model: 'Kimi K2' }, copilot: { share: 35, model: 'Copilot completion' }
  };
  var PLAN_IDS = ['claude', 'codex', 'qwen', 'gemini', 'kimi', 'copilot', 'muse', 'antigravity', 'zai-coding', 'opencode-go', 'anthropic-api', 'cursor-cli'];
  C.PLAN_IDS = PLAN_IDS;
  var GROUP_WORD = { plan: 'subscription · plan allowance', use: 'pay as you go', own: 'your own route' };
  function planInScope(v) { return v.legacyId ? D.inScope(v.legacyId) : D.settingsInScope(v.settingsId); }
  function planModel(id) {
    return function (ctx) {
      var v = D.planView(id); if (!v || !planInScope(v)) return null;
      var p = v.legacy, a = v.account, x = PLAN_EXTRA[v.legacyId] || null, rp = v.provider, multi = !!(rp && rp.accounts.length > 1);
      var amounts = a && !multi ? a.amounts.slice() : [];
      var facts, foot;
      if (p) {
        var pace = C.pace(p.pace);
        facts = (multi ? [['Requests', F.num(v.costs.requests || p.requests) + ' in range'], ['Tokens', F.tok((v.costs.input + v.costs.output) || p.tokens) + ' in range']] : [])
          .concat([['Billing', p.billing_basis], ['Entitlement', p.entitlement_class], ['Settlement', p.settlement_status], ['Monthly share', x.share + '%'], ['Pace', pace + ' (relative)'],
            ['Cache read', p.cache + '%'], ['Authority', p.allowance_authority + ' · ' + (a ? a.ageText : p.allowance_freshness)], ['Model', x.model], ['Attempts', v.attempts.map(function (t) { return t.attempt_id; }).join(', ') || 'none in range']]);
        /* the foot names the source of the % the card shows (Gemini API: a PM estimate of spend over the budget) */
        foot = esc(pace) + ' · ' + esc(v.binding && v.binding.truth === 'pm_estimate' ? 'PM estimate · invoiced spend over the Settings budget' : p.allowance_authority);
      } else {
        facts = [['Billing', GROUP_WORD[rp.group] || rp.group], ['Auth', a ? a.auth : '-'], ['Host', a ? a.host : '-'], ['Route role', a ? a.routeRole : '-']]
          .filter(function (f) { return f[1]; });
        foot = a ? esc(a.fresh.source) + ' · ' + esc(C.sampledText(a.sampledAt)) : 'no reading yet';
      }
      return { name: v.name, settingsId: v.settingsId, provider: rp, account: a, windows: v.windows, binding: v.binding,
        /* a single account's plan and its nickname (a nickname that only repeats the provider's name is left out: "Muse") */
        plan: multi ? '' : (a && a.plan ? a.plan : v.plan) + (a && !C.nickRepeats(a.nickname, v.name) ? ' · ' + a.nickname : '') +
          /* the state word where the head's right has no room for it (said once: the aside or here) */
          (a && ctx && ctx.tier && ctx.tier.bw && !stateFitsAside(ctx, v.name, a.stateWord) ? ' · ' + a.stateWord : ''),
        requests: p && !multi ? v.costs.requests || p.requests : null, tokens: p && !multi ? (v.costs.input + v.costs.output) || p.tokens : null, amounts: amounts, facts: facts,
        foot: foot, footGlyph: 'info' };
    };
  }
  function planMeta(id) {
    return function (ctx) {
      var v = D.planView(id); if (!v) return '';
      var a = v.account, rp = v.provider, wins = (v.windowDefs || []).map(function (w) { return w.short.toLowerCase(); }).join(' + ') || 'no plan windows';
      var parts = rp && rp.accounts.length > 1 ? [rp.accounts.length + ' accounts', a ? a.nickname + ' active' : 'none active', wins] : [a ? a.nickname + ' · ' + (a.plan || v.plan) : v.plan, wins];
      /* whole parts only, the last first: a narrow plate's subtitle ended "3 accounts · Jared a..." (the plate's rows and
         Details say every part) */
      var bw = ctx && ctx.tier && ctx.tier.bw, l = PMU.theme.look(), k = l.nier || l.family === 'retro' ? 1.22 : 1.08;
      /* the subtitle runs between the provider mark (34 px) and the head's tools column (its count, about 58 px); the
         engine's own plate-head measure (42-cards.js fitSub: 12 px, the same margins) */
      if (bw) while (parts.length > 1 && C.wrapW(parts.join(' · '), 12) * k > bw - 92) parts.pop();
      return parts.join(' · ');
    };
  }
  /* Details: every account and every window with its reading, reset truth, source and sampled time (AAC: provenance per
     account and window), then the provider's plan facts and identifiers */
  function planInspect(id) {
    return function () {
      var v = D.planView(id); if (!v) return null;
      var p = v.legacy, rp = v.provider, x = PLAN_EXTRA[v.legacyId] || null;
      var row = function (k, val) { return [k, esc(val == null || val === '' ? '-' : val)]; };
      var winRow = function (a, w) {
        return row(w.label, (w.pct === null ? PMU.roster.vsWord(w) : C.fmt(w.pct, 'pct') + ' used · ' + C.fmt(Math.max(0, 100 - w.pct), 'pct') + ' left' + (w.amount ? ' · ' + w.amount : '') + ' · ' + F.reset(w).text + ' · ' + PMU.fmt.truth(w.truth) + (w.est ? ' · estimated' : '')) +
          ' · ' + (C.winSource(w, a.ageText) || 'source not recorded'));
      };
      var sections = (rp ? rp.accounts : []).map(function (a) {
        return { title: a.nickname + (a.effective ? ' · Active' + (a.override ? ' (override)' : '') : ' · ' + a.stateWord), rows: [row('Identity', a.identity), row('Plan', a.planLine || a.plan), row('Reading', (a.fresh ? a.fresh.source : '') + ' · ' + C.sampledText(a.sampledAt) + (a.fresh && a.fresh.stale ? ' (cached)' : ''))]
          .concat(a.windows.length ? a.windows.map(function (w) { return winRow(a, w); }) : [row('Windows', a.noWindowsWord || 'This provider reports no plan windows')])
          .concat(a.amounts.map(function (m2) { return row(m2.label, m2.vs && m2.vs !== 'ok' ? m2.word : (m2.value || '') + (m2.suffix ? ' ' + m2.suffix : '')); })) };
      });
      if (p) {
        sections.push({ title: 'Plan', rows: [row('Plan tier', p.plan), row('Requests', String(p.requests)), row('Tokens', F.tok(p.tokens) + ' (' + F.tok(p.input) + ' in · ' + F.tok(p.output) + ' out)'), row('Billing basis', p.billing_basis),
          row('Entitlement', p.entitlement_class), row('Settlement', p.settlement_status), row('Pace', C.pace(p.pace) + ' (relative to the 24-hour norm)'), row('Cache read share', p.cache + '%'), row('Allowance authority', p.allowance_authority + ' · ' + p.allowance_freshness),
          row('Monthly share', x.share + '%'), row('Model', x.model), row('Counting basis', JSON.stringify((D.series('countingBasis') || {})[v.legacyId] || {}).replace(/[{}"]/g, '').replace(/,/g, ', '))] });
        sections.push({ title: 'Identifiers', rows: [row('Provider', p.provider_id), row('Installation', p.installation_id), row('Account IDs', p.account_ids.join(', ')), row('Connection IDs', p.connection_ids.join(', ')),
          row('Product / model', p.product_id + ' · ' + p.model_id), row('Requested route', p.requested_route_id), row('Effective route', p.effective_route_id),
          row('Attempt IDs', v.attempts.map(function (t) { return t.attempt_id; }).join(', ') || 'none in selected window'), row('Attempts / tokens', v.costs.attempts + ' · ' + F.tok(v.costs.input + v.costs.output))] });
      } else if (rp) sections.push({ title: 'Plan', rows: [row('Billing', GROUP_WORD[rp.group] || rp.group), row('Product', rp.product), row('Vendor', rp.vendorName), row('Status', rp.statusWord)] });
      return { kind: 'provider', title: v.name, subtitle: rp && rp.accounts.length > 1 ? rp.accounts.length + ' accounts · ' + (v.account ? v.account.nickname + ' active' : 'none active') : (v.account ? v.account.nickname + ' · ' : '') + (p ? p.plan : v.plan),
        sections: sections, raw: { provider: v.settingsId, accounts: (rp ? rp.accounts : []).map(function (a) { return { account: a.id, effective: a.effective, state: a.state,
          windows: a.windows.map(function (w) { return { key: w.key, pct: w.pct, reset_at: w.resetAt, reset_pending: !!w.resetPending, truth: w.truth, sampled_at: w.sampledAt, source: w.source }; }) }; }) } };
    };
  }
  /* a single account's state word at the head's right where it fits beside the title (the Accounts plate's rule) */
  function planAside(id) {
    return function (ctx) {
      var v = D.planView(id), rp = v && v.provider; if (!rp || rp.accounts.length !== 1) return '';
      var a = rp.accounts[0];
      if (!ctx || !ctx.tier || !stateFitsAside(ctx, rp.name, a.stateWord)) return '';
      return { text: a.stateWord, tone: a.stateTone === 'muted' ? null : a.stateTone };
    };
  }
  PLAN_IDS.forEach(function (id) {
    var sid = PMU.roster.legacyProvider(id);
    def('plan-' + id, 'plans', { title: function () { var r = PMU.roster.provider(sid); return r ? r.name : legName(id); }, mark: sid, prov: sid, meta: planMeta(id), model: planModel(id), inspect: planInspect(id), aside: planAside(id) });
  });

  def('context-now', 'overview', { meta: function () { return 'current thread · app-level view'; }, model: function () { return C.contextModel(); }, inspect: function () { return C.contextInspect(); } });
  C.contextModel = function () {
    var X = DATA.context, total = X.used;
    var segs = X.labels.map(function (l, i) { return { name: l, pct: X.segments[i], tokens: Math.round(total * X.segments[i] / 100), idx: i }; });
    return { pct: X.pct, used: X.used, limit: X.limit, reserved: X.reserved, segments: segs,
      facts: [['Input / output', F.tok(X.input) + ' / ' + F.tok(X.output)], ['Reclaimable', X.compacted ? 'none right now' : F.tok(X.reclaim)], ['Reserved output', F.tok(X.reserved)], ['Cache read share', X.cache + '%'],
        ['Pinned', F.tok(X.pinned)], ['Mutable', F.tok(X.mutable)], ['Free', F.tok(X.limit - X.used)], ['Effective route', 'route:claude:effective · fallback'], ['Last compaction', X.last_compact + ' ago'], ['Last maintenance', X.last_maintenance]] };
  };
  C.contextInspect = function () {
    var X = DATA.context;
    return C.insp('Context window', [['Used', F.num(X.used) + ' of ' + F.num(X.limit) + ' (' + X.pct + '%)'], ['Families', X.labels.map(function (l, i) { return l + ' ' + X.segments[i] + '%'; }).join(' · ')],
      ['Input / output', F.num(X.input) + ' / ' + F.num(X.output)], ['Reclaimable', F.num(X.reclaim)], ['Reserved output', F.num(X.reserved)], ['Pinned / mutable', F.num(X.pinned) + ' / ' + F.num(X.mutable)],
      ['Cache read share', X.cache + '% (read share, not a hit rate)'], ['Effective route', 'route:claude:effective · model:claude:effective · fallback'], ['Last compaction', X.last_compact], ['Last maintenance', X.last_maintenance],
      ['Scope', 'this thread; compaction is never billed usage']]);
  };

  def('budget-now', 'overview', { short: 'Budget', meta: function () { return C.budgetModel().periodText + ' · period to date · range does not apply'; }, model: function () { return C.budgetModel(); } });
  C.budgetModel = function () {
    /* live: today's spend of the running work (WOW-SPEC-3 8.3) lands on today's point, the period-to-date total and the plan
       allocation part of the legend (D.monthSpend, FINAL-REVIEW-3 must-fix 3) */
    var S = D.spendDaily(), P = D.series('budgetProjection'), cum = [], s = 0, MS = D.monthSpend();
    S.values.forEach(function (v) { s += v || 0; cum.push(Math.round(s * 100) / 100); });
    var budget = DATA.costs.budget, c = D.costs();
    /* one clock (REVIEW-jared must-fix 8): the fixture is day S.today of a S.days-day budget period that ends with today's
       spend, so the period runs from today - (S.today - 1) days; the axis dates and the period end come from the real
       date, and the Spend chart's 28 days are the same days */
    var start = new Date(PMU.clock.now()); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (S.today - 1));
    var end = new Date(start.getTime()); end.setDate(end.getDate() + S.days - 1);
    return { spent: MS.month, budget: budget, share: 'num:spend.month', days: S.days, today: S.today, cumulative: cum, periodStart: start.getTime(), periodEnd: end.getTime(),
      periodText: F.date(start.getTime()) + ' to ' + F.date(end.getTime()),
      projection: { to: P.to, lo: P.lo, hi: P.hi, label: 'est. ' + C.money(P.to) + ' · PM estimate', confidence: P.confidence },
      /* "Forecast used": the projection as a share of the Settings budget (the old meter; its 30x extrapolation is gone,
         the PM projection is the forecast) */
      facts: [['Burn', C.money(DATA.costs.burn) + '/day'], ['Projection', C.money(P.to) + ' est.'], ['Forecast used', (budget ? Math.round(100 * P.to / budget) + '% of budget' : 'no budget set') + ' est.'], ['Confidence', P.confidence + '%'], ['Projected remaining', C.money(budget - P.to) + ' est.'], ['Metered overage', C.money(DATA.costs.overage)]],
      mix: [{ name: 'Plan allocation est.', value: MS.plans, idx: 0, est: true, valueText: C.money(MS.plans) }, { name: 'Settled API', value: MS.api, idx: 1, valueText: C.money(MS.api) }],
      selected: c.selected };
  };

  /* the old card's subtitle ("explicit values on selected attempts") is the subtitle's last part again (CONTENT-3) */
  def('plan-value-now', 'overview', { meta: rangeMeta('estimate · explicit values on selected attempts'), model: function () {
    var c = D.costs();
    if (!c.selected) return { segments: [], empty: 'No attempts in the selected scope and range', emptyFacts: 'Plan allocation 0 attempts · not zero, nothing recorded' };
    var plans = {}; D.attempts().forEach(function (a) { if (a.plan_allocation_estimate > 0) plans[a.provider_id] = 1; });
    return { headline: { value: 100 * c.plan / c.selected, fmt: 'pct', label: 'of value plan-covered (estimate)', short: 'plan-covered est.' },
      segments: [{ name: 'Plan estimate', value: c.plan, idx: 0, est: true, valueText: money(c.plan), sub: 'explicit values on selected attempts' }, { name: 'Settled API', value: c.settled, idx: 1, valueText: money(c.settled), sub: 'settled attempt receipts' }],
      foot: esc(c.planAttempts + ' plan attempts · ' + c.meteredAttempts + ' metered · ' + Object.keys(plans).length + ' plan providers · ' + F.tok(c.input + c.output) + ' selected tokens') };
  } });

  /* attention rows: the old copy without countdowns (X-06) */
  C.alertCopy = [
    'Claude 5-hour window is 78% used and running +11 pts above its 24-hour norm.',
    'Vision helper calls raised daily API spend by 18%.',
    'Current pace leaves an estimated 31% left at reset (estimate).'
  ];
  /* the allowance-pressure sentence and score read the window they are about (Work Claude's 5-hour window, the alert's
     scope), so a Live beat that moves that window moves them too: "crossed 80%" never sits above "78% used"
     (FINAL-REVIEW-3 must-fix 5). The fixture text is the shape; only the percentage and the score follow the reading. */
  var PRESSURE_KEY = 'claude-code/work-claude', PRESSURE_WIN = 'fiveHour', PRESSURE_FIX = 78;
  function pressureWin() {
    var a = PMU.roster.account(PRESSURE_KEY), w = a && a.windows.filter(function (x) { return x.key === PRESSURE_WIN; })[0];
    return w && w.pct !== null ? w : null;
  }
  C.alertDetail = function (i) {
    var w = i === 0 ? pressureWin() : null;
    if (!w) return C.alertCopy[i];
    return C.alertCopy[i].replace(/\b78%/, C.fmt(w.pct, 'pct'));
  };
  C.alertScore = function (i, al) {
    var w = i === 0 ? pressureWin() : null;
    return w ? Math.round(al.score + (w.pct - PRESSURE_FIX)) : al.score;
  };
  def('attention-now', 'overview', { meta: function () { return (DATA.alerts.filter(function (a) { return a.state === 'warn'; }).length + (D.liveAlerts ? D.liveAlerts().length : 0)) + ' current · scope filters by provider'; }, model: function () {
    /* live: an alert the demo engine raised while Usage is open arrives at the top (WOW-SPEC-3 8.3 beat 7) */
    var liveRows = (D.liveAlerts ? D.liveAlerts() : []).filter(function (al) { return !al.provider_id || D.inScope(al.provider_id); }).map(function (al) {
      return { name: al.title, sub: al.detail, glyph: 'alert', tone: al.state === 'warn' ? 'warn' : 'good', value: 'now', note: C.oldName(al.owner), key: 'alert:' + al.id, share: 'alert:' + al.id, live: true,
        prov: al.provider_id ? PMU.roster.legacyProvider(al.provider_id) : null, onClick: function () { PMU.shell.setView({ room: 'attention' }, 'attention-now'); } };
    });
    var rows = DATA.alerts.map(function (al, i) {
      if (al.provider_id && !D.inScope(al.provider_id)) return null;
      /* the alert's board title (no "runway": headroom, not a run-out countdown) and its Settings owner name */
      var bt = (PMU_BOARDS.widgets['alert-' + i] || {}).title || al.title;
      return { name: bt, sub: C.alertDetail(i), glyph: al.state === 'warn' ? 'alert' : 'checkCircle', tone: al.state === 'warn' ? 'warn' : 'good', value: al.time === 'now' ? 'now' : al.time + ' ago', note: C.oldName(al.owner),
        prov: al.provider_id ? PMU.roster.legacyProvider(al.provider_id) : null, onClick: function () { PMU.shell.setView({ room: 'attention' }, 'attention-now'); } };
    }).filter(Boolean);
    return { rows: liveRows.concat(rows), empty: 'No alerts for the selected scope' };
  } });

  def('route-pressure', 'overview', { meta: function () { return 'binding window · relative pace'; }, model: function () {
    var rows = D.providers().map(function (p) {
      var v = D.planView(p.id), w = v && v.binding;
      return { id: p.id, name: legName(p.id), short: SHORT_NAME[p.id], role: (w ? w.short : p.primaryLabel) + ' · ' + C.pace(p.pace), value: w ? w.pct : p.used, valueText: C.fmt(w ? w.pct : p.used, 'pct') + ' used', valueShort: C.fmt(w ? w.pct : p.used, 'pct'),
        tone: w ? w.tone : PMU.roster.tone(p.used), vendor: PMU.markOf(PMU.roster.legacyProvider(p.id)).vendor, mark: PMU.roster.legacyProvider(p.id), prov: PMU.roster.legacyProvider(p.id),
        /* N3-1: the row's bar is its provider's binding window (effective account); its mark the provider's */
        shareKey: w && v.account ? 'win:' + v.account.key + '/' + w.key : null, markShare: 'prov:' + PMU.roster.legacyProvider(p.id),
        hover: (w ? w.label : p.primaryLabel) + ' · ' + C.pace(p.pace) + ' · ' + C.routeEstimate(p) };
    }).sort(function (a, b2) { return b2.value - a.value; });
    return { rows: rows, scale: 100, foot: 'Pace is relative to the 24-hour norm; no run-out times are projected.' };
  } });
  C.routeEstimate = function (p) {
    return { claude: 'pace above norm', codex: 'healthy pace', qwen: 'about 31% left at reset (estimate)', gemini: '$21.40 month end (estimate)', kimi: 'healthy pace', copilot: '65% remaining' }[p.id] || C.pace(p.pace);
  };

  /* the Overview hero (WOW-TASKS N-2): every window of the active accounts as a lit gauge, ordered by pressure */
  def('ov-skyline', 'overview', { kind: 'skyline', meta: function () { var th = PMU.roster.thresholds(); return 'active account of each provider · ordered by pressure · ' + (th.auto ? 'auto-switch at ' + (100 - th.switchLeft) + '% used' : 'auto-switch off'); },
    inspect: function () {
      var m = C.skylineModel();
      return C.insp('Headroom skyline', m.cols.map(function (c) { return [c.p.name + ' · ' + c.w.label, C.fmt(c.w.pct, 'pct') + ' used · ' + C.fmt(Math.max(0, 100 - c.w.pct), 'pct') + ' left · ' + F.resetLine(c.w).text + ' · ' + c.a.nickname + ' · ' + PMU.fmt.truth(c.w.truth)]; }));
    } });
  def('ov-resets', 'overview', { kind: 'agenda', horizon: '24h', meta: function (ctx) { return C.agendaMeta(ctx, '24h'); }, config: [C.horizonCfg('24h')] });
  def('ov-headroom', 'overview', { meta: function () { return 'shared with Settings'; } });

  def('forecast', 'overview', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' basis · labelled estimate'; }, model: function () {
    var list = D.attempts().slice().sort(function (a, c) { return new Date(a.occurred_at) - new Date(c.occurred_at); });
    var c = D.costs(), P = D.series('budgetProjection');
    return { labels: list.map(function (a) { return a.attempt_id; }), values: list.map(function (a) { return pendingZero(a) ? null : Math.round(((a.charge || 0) + (a.plan_allocation_estimate || 0)) * 100) / 100; }),
      states: list.map(function (a) { return pendingZero(a) ? 'pending' : null; }),
      est: list.map(function (a) { return Math.round((a.plan_allocation_estimate || 0) * 100) / 100; }),
      labelsLong: list.map(function (a) { return a.attempt_id + ' · ' + C.legName(a.provider_id) + (a.plan_allocation_estimate ? ' · plan estimate hatched' : ''); }), idx: 0, unit: 'usd', highlightLast: true,
      caption: 'SELECTED <b>' + esc(money(c.selected)) + '</b> · PERIOD END EST. <b>' + esc(money(P.to)) + '</b> · BUDGET <b>' + esc(money(DATA.costs.budget)) + '</b>',
      facts: [['Attempts', String(c.attempts)], ['Confidence', P.confidence + '%'], ['Basis', 'local-time pace']], note: 'Projection uses explicit attempt charges and labeled plan-allocation estimates.', emptyText: 'No attempts in this range.' };
  } });

  def('completion-capacity', 'overview', { meta: function () { return 'current window · Governor projection'; }, model: function () {
    return { value: 74, fmt: 'pct', sub: 'safe remaining completion capacity · ' + b(3) + ' routes ready', facts: [['Immediate', '2.8M tok'], ['Queued', '604k tok'], ['Fallback', '3 routes'], ['Blocked', '0'], ['Basis', 'At pace (relative)']] };
  } });
  def('capacity-reservations', 'overview', { meta: function () { return 'current runs · Governor projection'; }, model: function () {
    /* requested and admitted are the headline (9 / 12): the facts it does not say lead (CONTENT-3) */
    return { text: '9', unit: ' / 12', sub: 'worker slots reserved · ' + b(3) + ' available', facts: [['Queued', '3'], ['Reserved tokens', '604k'], ['Reserved spend', '$8.40 est.'], ['Longest wave', '6 agents'], ['Requested', '12'], ['Admitted', '9']], foot: 'Governor projection · not usage' };
  } });
  def('run-attribution', 'overview', { meta: function () { return 'current work · child usage under its parent'; }, model: function () {
    return { cols: [{ id: 'name', label: 'RUN', w: 'minmax(120px,2fr)' }, { id: 'state', label: 'STATE', w: 'minmax(80px,1fr)' }, { id: 'agents', label: 'AGENTS', align: 'right', w: '64px', min: 'm' },
      { id: 'tokens', label: 'TOKENS', align: 'right', w: '70px' }, { id: 'cost', label: 'VALUE', align: 'right', w: '72px' }, { id: 'elapsed', label: 'ELAPSED', align: 'right', w: '70px', min: 'l' }],
      rows: DATA.runs.map(function (r) {
        var g = r.state === 'Running' ? 'halfCircle' : r.state === 'Degraded' ? 'alert' : 'check';
        return { tone: r.state === 'Degraded' ? 'warn' : null, cells: { name: { html: '<b>' + esc(r.name) + '</b> <em>' + esc(r.id) + '</em>' }, state: { html: C.glyph(g) + esc(r.state) }, agents: String(r.agents), tokens: r.tokens, cost: r.cost + ' est.', elapsed: r.elapsed } };
      }) };
  } });

  /* ================================================================== Plans & limits */
  /* the windows timeline's lanes (lane d-plans, Jared item 4: every account, "never only the active one"): one lane per
     account of every provider with plan windows, grouped by provider in Settings order, accounts in routing order. A lane
     with no reading says why ("Signed out · no reading", "Quota not exposed") instead of drawing nothing, and a window whose
     reset passed without a new reading is a pending marker at NOW ("5H pending"), never 0 % and never its old %. Providers
     without plan windows (Google Antigravity, Z.AI Coding Plan, Cursor) are named on one line under the lanes. */
  C.windowLanes = function () {
    var now = PMU.clock.now(), lanes = [], none = [];
    PMU.roster.read().providers.forEach(function (p) {
      if (!p.accounts.length || !D.settingsInScope(p.id)) return;
      if (!p.windows.length) { none.push(p); return; }
      p.accounts.forEach(function (a, i) {
        var ms = a.windows.filter(function (w) { return w.pct !== null; }).map(function (w) {
          var known = w.resetAt && w.truth !== 'unknown' && w.resetAt > now;
          return { w: w, at: known ? w.resetAt : null };
        });
        var pend = a.windows.filter(function (w) { return w.resetPending; });
        var hidden = a.windows.length && a.windows.every(function (w) { return w.pct === null && (w.vs === 'not_exposed' || w.vs === 'disabled'); });
        var note = ms.length || pend.length ? '' : hidden ? 'Quota not exposed' : a.stateWord + ' · no reading';
        lanes.push({ p: p, a: a, ms: ms, pend: pend, note: note, noteVs: hidden ? 'not_exposed' : 'unknown', first: i === 0, multi: p.accounts.length > 1 });
      });
    });
    return { lanes: lanes, none: none };
  };
  /* the Plans & limits hero (WOW-TASKS N-2): every account's windows and their next resets on one 7-day line */
  def('plans-timeline', 'plans', { kind: 'windows', meta: function () {
    var L = C.windowLanes(), n = L.lanes.length;
    return 'next 7 days from now · ' + C.plural(n, 'account') + ' · local time';
  } });
  def('reset-map', 'plans', { kind: 'agenda', horizon: '7d', meta: function (ctx) { return C.agendaMeta(ctx, '7d'); }, config: [C.horizonCfg('7d')] });
  def('quota-history', 'plans', { kind: 'qhist', meta: function () { return C.qhistMeta(); }, model: function () { return D.quotaRows(); } });
  def('plan-settlement', 'plans', { meta: rangeMeta('billing and settlement are separate axes'), model: function () {
    var c = D.costs();
    return { cols: [{ id: 'p', label: 'PROVIDER', w: 'minmax(110px,1.4fr)' }, { id: 'basis', label: 'BILLING', w: 'minmax(120px,2fr)', min: 'm' }, { id: 'set', label: 'SETTLEMENT', w: 'minmax(120px,1.6fr)' },
      { id: 'req', label: 'REQUESTS', align: 'right', w: '128px', min: 's' }],
      rows: D.providers().map(function (p) {
        var x = c.byProvider[p.id] || { attempts: 0, requests: 0, pending: 0 };
        return { tone: x.pending ? 'warn' : null, cells: { p: { html: PMU.mark(PMU.roster.legacyProvider(p.id), 16) + ' <b>' + esc(legName(p.id)) + '</b>' }, basis: p.billing_basis + ' · ' + p.entitlement_class,
          set: { html: x.attempts ? (x.pending ? C.vs('pending', x.pending + ' pending receipt') + ' · ' : '') + esc((x.attempts - x.pending) + ' settled') : C.vs('unknown', 'no attempts in range') }, req: x.attempts ? x.requests + ' attempt-backed' : '-' } };
      }) };
  } });
  def('plan-pressure', 'plans', { meta: function () { return 'current pace · relative'; }, model: function () {
    /* numeric rows like route-pressure (the ranked chart reads value / valueText / role); the pace, the watch or healthy
       word and the labelled estimate stay in the role line and the hover */
    var rows = D.providers().map(function (p) {
      var tone = PMU.roster.tone(p.used), watch = p.status === 'watch' ? 'watch' : 'healthy';
      return { id: p.id, name: legName(p.id), short: SHORT_NAME[p.id], role: p.primaryLabel + ' · ' + C.pace(p.pace) + ' · ' + watch, value: p.used, valueText: C.fmt(p.used, 'pct') + ' used', valueShort: C.fmt(p.used, 'pct'),
        tone: tone, vendor: PMU.markOf(PMU.roster.legacyProvider(p.id)).vendor, mark: PMU.roster.legacyProvider(p.id), prov: PMU.roster.legacyProvider(p.id),
        hover: p.primaryLabel + ' · ' + C.pace(p.pace) + ' · ' + watch + ' · ' + C.routeEstimate(p) };
    }).sort(function (a, b2) { return b2.value - a.value; });
    return { rows: rows, scale: 100, foot: 'Ordered by the primary window; pace is relative to the 24-hour norm.' };
  } });
  def('plan-authority', 'plans', { meta: function () { return 'diagnostics · reading provenance'; }, model: function () {
    return { rows: DATA.authority.map(function (r) { return { name: C.oldName(r[0]), sub: r[3], value: r[2], note: r[1], glyph: /estimate/.test(r[1]) ? 'pencil' : 'check', noteTone: /estimate/.test(r[1]) ? 'warn' : null }; }) };
  } });
  def('allowance-attribution', 'plans', { meta: function () { return 'work versus probes · 30 days'; }, model: function () {
    return { segments: [{ name: 'User work', value: 611, valueText: '611 req', idx: 0, sub: '71%' }, { name: 'Validation', value: 146, valueText: '146 req', idx: 1, sub: '17%' }, { name: 'Helpers', value: 69, valueText: '69 req', idx: 4, sub: '8%' },
      { name: 'Retries', value: 34, valueText: '34 req', idx: 2, sub: '4% · watch' }], fmt: 'int', foot: 'Selected records by provider are in Details.' };
  }, inspect: function () {
    var c = D.costs();
    return C.insp('Allowance attribution', Object.keys(c.byProvider).map(function (k) { var x = c.byProvider[k]; return [legName(k), C.plural(x.attempts, 'attempt') + ' · ' + C.plural(x.requests, 'request') + ' · ' + F.tok(x.input + x.output) + ' tokens · ' + (x.settled ? money(x.settled) + ' settled' : 'covered by subscription') + ' · ' + (x.plan ? money(x.plan) + ' plan estimate' : 'no plan estimate (metered)')]; })
      .concat([['User work', '71% · 611 requests'], ['Validation', '17% · 146'], ['Helpers', '8% · 69'], ['Retries', '4% · 34 (watch)']]));
  } });
  def('counting-basis', 'plans', { meta: function () { return 'inclusive versus additive'; }, model: function () {
    return { rows: [
      { name: 'Claude', sub: 'cache read is inside input', value: 'inclusive', note: 'reasoning inside output' }, { name: 'ChatGPT / Codex', sub: 'cache read is inside input', value: 'inclusive', note: 'reasoning inside output' },
      { name: 'Qwen Coding Plan', sub: 'cache reported separately', value: 'additive', tone: 'warn', note: 'never added twice' }, { name: 'Gemini API', sub: 'input and output published', value: 'partial', tone: 'warn', note: 'cache basis not published' },
      { name: 'Kimi Code', sub: 'input plus output', value: 'inclusive', note: 'single total' }, { name: 'GitHub Copilot', sub: 'request allowance only', vs: 'not_exposed', word: 'not exposed', note: 'token total stays unknown' }] };
  } });
  def('native-allowance-units', 'plans', { meta: function () { return 'provider semantics'; }, model: function () {
    var cl = D.planView('claude'), cx = D.planView('codex');
    var r = function (v) { return v && v.binding ? F.resetLine(v.windows[0]).text : 'reset unknown'; };
    return { rows: [
      { name: 'Claude', sub: 'five-hour and weekly windows', value: 'percent used', note: r(cl) }, { name: 'ChatGPT / Codex', sub: 'five-hour and weekly windows', value: 'percent used', note: r(cx) },
      { name: 'Qwen Coding Plan', sub: 'five-hour, weekly and monthly windows', value: 'percent used', note: 'weekly resets in 2d 6h' }, { name: 'Kimi Code', sub: 'weekly and monthly allowance', value: 'percent used', note: 'weekly resets in 4d 11h' },
      { name: 'Gemini API', sub: 'monthly billed budget', value: 'USD', note: 'next month' }, { name: 'GitHub Copilot', sub: 'premium requests', value: 'requests', note: '105 / 300 · next month' }] };
  } });

  /* ================================================================== Costs */
  def('cost-month', 'costs', { short: 'Window value', meta: rangeMeta(), model: function (ctx) {
    var c = D.costs();
    return { value: c.selected, fmt: 'money', share: 'num:value.window', sub: 'attempt-backed charge plus estimates · ' + b(c.attempts) + (c.attempts === 1 ? ' attempt' : ' attempts') + '',
      facts: [['Settled API', money(c.settled)], ['Plan estimate', money(c.plan) + ' est.'], ['24h equivalent', money(c.dayEquivalent)], ['Pending', String(c.pending), c.pending ? { tone: 'warn' } : {}], ['Basis', D.rangeLabel(ctx.state.range)]] };
  } });
  def('cost-api', 'costs', { short: 'Settled API', meta: rangeMeta('settled receipts'), model: function () {
    var c = D.costs(), prov = {}; D.attempts().forEach(function (a) { if (a.charge) prov[a.provider_id] = 1; });
    return { value: c.settled, fmt: 'money', sub: 'settled metered attempt receipts · ' + b(c.meteredAttempts) + ' metered',
      facts: [['Metered attempts', String(c.meteredAttempts)], ['Providers', String(Object.keys(prov).length)], ['Pending', String(c.pending), c.pending ? { tone: 'warn' } : {}], ['Authority', 'attempt receipt'], ['Unpriced', 'not converted to zero']],
      foot: 'Unpriced · not converted to zero' };
  } });
  def('cost-plan', 'costs', { short: 'Plan estimate', meta: rangeMeta('labelled estimate'), model: function () {
    var c = D.costs(), prov = {}; D.attempts().forEach(function (a) { if (a.plan_allocation_estimate) prov[a.provider_id] = 1; });
    return { value: c.plan, fmt: 'money', sub: 'covered by plans · ' + b(c.selected ? Math.round(100 * c.plan / c.selected) + '%' : '-') + ' of value',
      facts: [['Plan attempts', String(c.planAttempts)], ['Providers', String(Object.keys(prov).length)], ['Requests', F.num(c.requests)], ['Authority', 'labeled estimate'], ['Settlement', 'separate axis']], foot: 'Subscription work reads covered, never $0.00' };
  } });
  def('cost-save', 'costs', { short: 'Cache avoided', meta: rangeMeta('labelled estimate'), model: function () {
    var c = D.costs();
    return { value: c.cache, fmt: 'money', sub: b(c.attempts) + (c.attempts === 1 ? ' attempt' : ' attempts') + ' · explicit cache-avoided estimates',
      facts: [['Input', F.tok(c.input)], ['Output', F.tok(c.output)], ['Providers', String(c.providers)], ['Authority', 'labeled estimate'], ['Runtime rate', 'not used · fixture carried']] };
  } });
  def('budget', 'costs', { meta: function () { return C.budgetModel().periodText + ' · period to date · budget from Settings'; }, model: function () { return C.budgetModel(); },
    config: [{ id: 'alert', label: 'Budget alert at', value: '80', options: ['50', '80', '90', '95', '100'].map(function (v) { return { value: v, label: v + '% of budget' }; }) }] });
  /* the subtitle says the bucket the chart draws (LOOK-REVIEW-2 18: "per day" over 3-day buckets) */
  def('cost-spend', 'costs', { meta: function (ctx) {
    var n = (D.series('spendDaily30') || { values: [] }).values.length, bw = ctx && ctx.tier && ctx.tier.bw ? ctx.tier.bw : 600;
    var g = Math.ceil(n / Math.max(3, Math.floor(Math.max(80, bw - 52) / 28)));
    /* whole parts only: a part that would run past the card's edge is dropped, never cut (Mac stills 2026-10-02) */
    var parts = ['settled plus plan estimates', g > 1 ? g + '-day buckets' : 'per day', n + ' days'];
    while (parts.length > 1 && C.wrapLines(parts.join(' · '), bw - 4, 12.5) > 1) parts.pop();
    return parts.join(' · ');
  }, model: function () {
    var S = D.spendDaily(), v = S.values, n = v.length, today = new Date(PMU.clock.now()); today.setHours(0, 0, 0, 0);
    var sum = function (k) { return D.sum(v.slice(n - k)); };
    var labels = v.map(function (x, i) { return F.date(today.getTime() - (n - 1 - i) * 86400000); });
    return { labels: labels, values: v, idx: 0, unit: 'usd', highlightLast: true, states: v.map(function (x) { return x === 0 ? 'zero' : 'ok'; }),
      /* each label keeps its value on its line when the caption wraps */
      caption: [['TODAY', v[n - 1]], ['7 DAYS', sum(7)], ['PERIOD', sum(n)]].map(function (x) { return '<span style="white-space:nowrap"><span class="pmu-cap">' + x[0] + '</span> <b>' + esc(money(x[1])) + '</b></span>'; }).join(' · '),
      note: 'A provider-reported zero day is drawn as a stub labelled $0.00.' };
  } });
  def('provider-cost', 'costs', { meta: rangeMeta('settled versus plan estimate'), model: function () {
    var c = D.costs();
    var rows = D.providers().map(function (p) {
      var x = c.byProvider[p.id];
      if (!x) return { id: p.id, name: legName(p.id), role: p.billing_basis + ' · no attempts in range', value: null, vs: 'unknown', valueText: '', vendor: PMU.markOf(PMU.roster.legacyProvider(p.id)).vendor, mark: PMU.roster.legacyProvider(p.id) };
      var tot = x.settled + x.plan;
      return { id: p.id, name: legName(p.id), role: (x.settled ? 'metered API' : 'subscription · covered') + ' · ' + C.plural(x.attempts, 'attempt'), value: tot, est: x.plan, valueText: money(tot) + (x.plan && !x.settled ? ' est.' : ''),
        vendor: PMU.markOf(PMU.roster.legacyProvider(p.id)).vendor, mark: PMU.roster.legacyProvider(p.id), prov: PMU.roster.legacyProvider(p.id), tone: x.pending ? 'warn' : null,
        /* covered work reads "covered", a metered route has no plan estimate: never $0.00 for either (DESIGN-SPEC 11) */
        hover: (x.settled ? 'API ' + money(x.settled) : 'API charge not applicable · covered by subscription') + ' · ' + (x.plan ? 'plan estimate ' + money(x.plan) : 'plan estimate not applicable · metered') + (x.pending ? ' · ' + x.pending + ' pending receipt' : '') };
    }).sort(function (a, b2) { return (b2.value || 0) - (a.value || 0); });
    return { rows: rows, foot: 'Subscription routes read covered; their value is a labelled plan estimate.' };
  } });
  def('cost-authority', 'costs', { meta: function () { return 'one billing model · budget period to date'; }, model: function () {
    var c = D.costs();
    return { rows: [
      { name: 'API billed', sub: 'counts against the spending limit', value: money(DATA.costs.api), note: 'selected range ' + money(c.settled) + ' settled', glyph: 'check' },
      { name: 'Plan included', sub: 'does not count against the limit', value: money(D.monthSpend().plans) + ' est.', note: 'selected range ' + money(c.plan) + ' est.', glyph: 'pencil', noteTone: 'warn' },
      { name: 'Cache avoided', sub: 'explicit estimate', value: money(DATA.costs.saved) + ' est.', note: 'selected range ' + money(c.cache) + ' est.', glyph: 'pencil', noteTone: 'warn' },
      { name: 'Pending', sub: 'not promoted to settled charge', value: String(c.pending), note: c.pending ? 'awaiting provider receipt' : 'none', glyph: 'clockCircle', tone: c.pending ? 'warn' : null },
      { name: 'Unpriced', sub: 'excluded from billed total', value: '3 events', note: 'never converted to zero', glyph: 'slashCircle', tone: 'warn' },
      { name: 'Missing identities', sub: 'rejected before append', value: '0', note: 'fail closed', glyph: 'xCircle' },
      { name: 'Spending limit', sub: 'user controlled · not a provider allowance', value: money(DATA.costs.budget), note: 'Settings', glyph: 'gear' }] };
  } });
  function pendingZero(a) { return !((a.charge || 0) + (a.plan_allocation_estimate || 0) > 0) && /pending/i.test(a.settlement_status || ''); }
  def('cost-trend', 'costs', { meta: rangeMeta('per attempt'), model: function () {
    var list = D.attempts().slice().sort(function (a, c) { return new Date(a.occurred_at) - new Date(c.occurred_at); });
    var provs = []; list.forEach(function (a) { if (provs.indexOf(a.provider_id) < 0) provs.push(a.provider_id); });
    var c = D.costs();
    return { labels: list.map(function (a) { return a.attempt_id; }), unit: 'usd',
      stacks: provs.map(function (pid) { var sid = PMU.roster.legacyProvider(pid); return { providerId: sid, vendor: PMU.markOf(sid).vendor, name: legName(pid),
        settled: list.map(function (a) { return a.provider_id === pid && !pendingZero(a) ? a.charge || 0 : null; }), estimate: list.map(function (a) { return a.provider_id === pid && !pendingZero(a) ? a.plan_allocation_estimate || 0 : null; }) }; }),
      /* a receipt still pending with no value is unknown, never $0.00: its column is a gap labelled "Pending receipt" */
      states: list.map(function (a) { return pendingZero(a) ? 'pending' : null; }),
      totals: list.map(function (a) { return pendingZero(a) ? null : Math.round(((a.charge || 0) + (a.plan_allocation_estimate || 0)) * 100) / 100; }),
      caption: 'SELECTED <b>' + esc(money(c.selected)) + '</b> · 24H EQUIVALENT <b>' + esc(money(c.dayEquivalent)) + '</b> · PERIOD END EST. <b>' + esc(money(D.series('budgetProjection').to)) + '</b>',
      note: 'Settled charges and labeled allocation estimates remain separate fields.', emptyText: 'No attempts in this range.' };
  } });
  def('pricing-confidence', 'costs', { meta: rangeMeta('value authority'), model: function () {
    var c = D.costs();
    return { rows: [
      { name: 'Settled API', sub: 'direct attempt receipt amount', value: money(c.settled), note: c.settledAttempts + ' settled attempts', glyph: 'check' },
      { name: 'Plan allocation', sub: 'explicit per-attempt estimate', value: money(c.plan) + ' est.', note: 'catalog v18 · 2h old', glyph: 'pencil', tone: 'warn' },
      { name: 'Cache avoided', sub: 'explicit per-attempt estimate', value: money(c.cache) + ' est.', note: 'catalog pricing', glyph: 'pencil', tone: 'warn' },
      { name: 'Pending settlement', sub: 'not promoted to settled charge', value: String(c.pending), note: 'independent state', glyph: 'clockCircle' }] };
  } });
  def('burn-basis', 'costs', { meta: function () { return 'forecast inputs · labelled projection'; }, model: function (ctx) {
    var c = D.costs();
    return { value: c.dayEquivalent, fmt: 'perday', sub: '24h equivalent from selected records · ' + b(c.attempts) + (c.attempts === 1 ? ' attempt' : ' attempts') + '',
      facts: [['Settled charge', money(c.settled)], ['Plan estimate', money(c.plan) + ' est.'], ['Pending', String(c.pending)], ['Window hours', String(c.hours)], ['Confidence', '87%'], ['Provider charges', money(DATA.costs.api)],
        ['Plan allocation', money(D.monthSpend().plans) + ' est.'], ['Unpriced', '3 events'], ['Time zone', 'local 24h'], ['Period end', money(D.series('budgetProjection').to) + ' est.'], ['Overage buffer', money(DATA.costs.budget - D.series('budgetProjection').to)], ['Next refresh', '40s']],
      spark: { values: D.series('spendDaily30').settled, idx: 1 }, foot: esc(D.scopeText()) + ' · projection only' };
  } });

  /* ================================================================== Accounts */
  def('acct-switch', 'accounts', { meta: function () { return 'Shared with Settings > AI > Providers & Accounts'; }, aside: function () { return 'Shared with Settings'; } });
  /* a single plate's subtitle names the account (the state is the head's right word and the plan a fact: each said once,
     LOOK-REVIEW-2 16; a long subtitle was cut, LOOK-REVIEW-2 13) */
  /* a single account's state word sits at the head's right (the aside) where it fits beside the whole title, measured
     in the theme face; where it does not (or the plate is xs, where the aside is not drawn) it leads the subtitle instead
     (CONTENT-3, census: "Standby" ended in an ellipsis beside "Google Antigravity" and "Anthropic API" at 1440) */
  function stateFitsAside(ctx, title, word) {
    var t = ctx && ctx.tier; if (!t || !t.bw) return true;
    if (t.w === 'xs') return false;
    var l = PMU.theme.look(), k = l.nier || l.family === 'retro' ? 1.22 : l.family === 'glass' ? 1.1 : 1.04;
    var cardW = (t.pw || t.bw + 28);
    var titleW = C.wrapW(l.nier ? String(title).toUpperCase() : title, 15, 640) * k;
    return titleW + 34 + 10 + C.wrapW(word, 12.5, 600) * k + 28 + 12 <= cardW;
  }
  function providerMeta(id) {
    return function (ctx) {
      var p = PMU.roster.provider(id); if (!p || !p.accounts.length) return 'Not set up';
      if (p.accounts.length > 1) return p.accounts.length + ' accounts · ' + (p.effective ? p.effective.nickname + ' active' : 'none active');
      var a = p.accounts[0], nick = a.nickname && a.nickname !== p.name && p.name.indexOf(a.nickname) < 0 ? a.nickname : '';
      var rest = [nick, a.identity].filter(Boolean).join(' · ') || a.plan || a.nickname;
      return ctx && ctx.tier && !stateFitsAside(ctx, p.name, a.stateWord) ? a.stateWord + ' · ' + rest : rest;
    };
  }
  /* one acct-<providerId> definition per Settings provider. Settings may not be ready when this file runs, so the ids
     come from the default boards first, then from Settings now and on every Settings change (a provider that gains its
     first account later is appended by the engine and needs its definition) */
  var acctDone = {};
  function acctDefs() { try { (PMU.settings.providers() || []).forEach(function (p) { acctDef(p.id, p.name); }); } catch (error) {} }
  Object.keys(PMU_BOARDS.widgets).forEach(function (k) { if (/^acct-/.test(k) && PMU_BOARDS.widgets[k].kind === 'provider') acctDef(k.slice(5), ''); });
  acctDefs();
  if (PMU.settings.onChange) PMU.settings.onChange(acctDefs);
  function acctDef(pid, pname) {
    var id = 'acct-' + pid; if (acctDone[id]) return; acctDone[id] = true;
    var p = { id: pid, name: pname || pid };
    def(id, 'accounts', { kind: 'provider', level: 'glance', mark: p.id, prov: p.id, title: function () { var r = PMU.roster.provider(p.id); return r ? r.name : p.name; }, meta: providerMeta(p.id),
      aside: function (ctx) {
        var r = PMU.roster.provider(p.id); if (!r || !r.accounts.length) return '';
        if (r.accounts.length > 1) {
          if (ctx && ctx.form === 'plate' && r.group === 'plan' && r.windows.length) { var th = PMU.roster.thresholds();
            var tw = ctx.tier ? ctx.tier.w : 'l'; if (tw === 'xs' || tw === 's') return '';
            /* the long words only where the subtitle beside them stays whole (Retro 2026-10-02: "4 accounts · Work Claude ...") */
            var longW = 'Auto-switch at ' + (100 - th.switchLeft) + '% used', metaT = providerMeta(p.id)();
            var longOk = tw !== 'm' && C.wrapLines(metaT, (ctx.tier.bw || 0) - 44 - C.wrapW(longW, 12.5) - 40, 12.5) <= 1;
            var words = th.auto ? (longOk ? longW : 'Switch at ' + (100 - th.switchLeft) + '%') : 'Auto-switch off';
            return { html: '<span class="pmu-asw"' + C.hover('Auto-switch', (th.auto ? 'Switches at ' + (100 - th.switchLeft) + '% used. ' : '') + 'Shared with Settings; change it in the Auto-switch strip or in Settings') + '>' + SVG.notch + esc(words) + '</span>' }; }
          return r.accounts.length + ' accounts';
        }
        var a = r.accounts[0];
        if (ctx && ctx.tier && !stateFitsAside(ctx, r.name, a.stateWord)) return '';
        return { text: a.stateWord, tone: a.stateTone === 'muted' ? null : a.stateTone };
      },
      inspect: function () { var r = PMU.roster.provider(p.id); return r && r.accounts[0] ? (PMU.accounts.inspect(r.effective ? r.effective.key : r.accounts[0].key), null) : null; } });
  }
  def('acct-more-plan', 'accounts', { meta: function () { return C.moreMeta('plan'); }, model: function () { return { group: 'plan' }; } });
  def('acct-more-use', 'accounts', { meta: function () { return C.moreMeta('use'); }, model: function () { return { group: 'use' }; } });
  def('acct-more-own', 'accounts', { meta: function () { return C.moreMeta('own'); }, model: function () { return { group: 'own' }; } });
  C.moreMeta = function (g) {
    var gr = PMU.roster.read().groups.filter(function (x) { return x.id === g; })[0];
    var n = gr ? gr.providers.filter(function (p) { return !p.accounts.length; }).length : 0;
    return C.plural(n, 'provider') + ' without an account';
  };
  /* the three Settings group headings (DECISIONS "Provider catalog": group the room the way Settings does) */
  ['plan', 'use', 'own'].forEach(function (g) {
    def('acct-group-' + g, 'accounts', { title: function () { return (PMU.settings.GROUPS.filter(function (x) { return x.id === g; })[0] || {}).label || g; },
      meta: function () {
        var gr = PMU.roster.read().groups.filter(function (x) { return x.id === g; })[0]; if (!gr) return '';
        var set = gr.providers.filter(function (p) { return p.accounts.length || p.status === 'active'; }).length, accs = 0;
        gr.providers.forEach(function (p) { accs += p.accounts.length; });
        return gr.providers.length + ' providers · ' + set + ' set up' + (accs ? ' · ' + accs + (accs === 1 ? ' account' : ' accounts') : '');
      } });
  });
  def('acct-opencode-personal-setup', 'accounts', { mark: 'opencode', meta: function () { return 'Provider Setup Required · Settings · AI'; },
    inspect: function () {
      var a = DATA.accounts.filter(function (x) { return x.setup_required; })[0];
      return C.insp('OpenCode on your computer', [['Status', a.status], ['Installation', a.installation_status], ['Authentication', a.authentication_status], ['Billing', a.billing_basis], ['Entitlement', a.entitlement_class],
        ['Settlement', a.settlement_status], ['Requests', String(a.requests)], ['Last seen', a.last], ['Scope', a.scope], ['Route', a.route], ['Account', a.account_id], ['Connection', a.connection_id], ['Installation id', a.installation_id],
        ['Product / model', a.product_id + ' · ' + a.model_id], ['Requested route', a.requested_route_id], ['Effective route', a.effective_route_id], ['Attempt', a.attempt_id], ['Operation', a.operation_id], ['Continuation', a.continuation_id],
        ['Host / environment', a.host + ' / ' + a.environment], ['Activity', 'No acquisition attempted'], ['Note', 'No automatic acquisition or route change.']]);
    } });
  def('acct-history', 'accounts', { meta: function () { return 'Switch and pressure events · blocked attempts included'; }, model: function () {
    var rows = [], lastDay = null;
    PMU.roster.read().switchLog.forEach(function (e) {
      if (!D.settingsInScope(e.providerId)) return;
      var head = F.dayHead(e.at);
      if (head.label !== lastDay) { rows.push({ day: head.label, note: head.note }); lastDay = head.label; }
      var who = e.providerName + ' · ' + (e.fromName && e.toName ? e.fromName + ' to ' + e.toName : e.fromName || e.toName);
      var tone = { switched: 'good', cooldown: 'warn', blocked: 'crit', skipped: null, override: 'accent' }[e.outcome];
      rows.push({ name: who, sub: e.text, lead: '<span class="pmu-ltime">' + esc(F.clock(e.at)) + '</span>' + PMU.mark(e.providerId, 18), value: e.code === 'manual_pin' ? 'Override' : e.outcome.charAt(0).toUpperCase() + e.outcome.slice(1),
        tone: e.code === 'manual_pin' ? 'accent' : tone, prov: e.providerId, hover: e.code.replace(/_/g, ' ') + ' · ' + F.dayHead(e.at).note + ' ' + F.clock(e.at) });
    });
    return { rows: rows, empty: 'No switches recorded for the selected scope' };
  } });
  def('acct-resets', 'accounts', { kind: 'agenda', horizon: '7d', meta: function (ctx) { return C.agendaMeta(ctx, '7d'); }, config: [C.horizonCfg('7d')] });
  def('routing', 'accounts', { meta: function () { return 'current · requested and effective'; }, model: function () {
    return { rows: [
      { name: 'Code work', sub: 'Claude · Work Claude · Max', value: 'primary', note: 'requested and effective match', mark: 'claude-code' },
      { name: 'Fast edits', sub: 'ChatGPT / Codex · Jared', value: 'fallback', note: 'latency preference', mark: 'openai-codex' },
      { name: 'Long context', sub: 'Qwen Coding Plan · Qwen Global', value: 'secondary', note: 'context fit', mark: 'qwen-coding' },
      { name: 'Vision helper', sub: 'Gemini API · Google AI Studio', value: 'helper', note: 'vision-only route', mark: 'gemini-direct' },
      { name: 'Completion', sub: 'GitHub Copilot · GitHub Work', value: 'fallback', note: 'editor completion', mark: 'github-copilot' }] };
  } });
  def('account-fallbacks', 'accounts', { meta: function (ctx) { return 'last ' + D.rangeLabel(ctx.state.range) + ' · switch reasons in plain words'; }, model: function () {
    var rows = [
      { name: 'Rate-limit pressure', sub: 'Claude to ChatGPT / Codex', value: '4', tone: 'warn', note: 'requested account unchanged' },
      { name: 'Vision requirement', sub: 'Claude to Gemini API', value: '11', note: 'capability fallback' },
      { name: 'Context fit', sub: 'ChatGPT / Codex to Qwen Coding Plan', value: '3', note: 'long context' },
      { name: 'Credential unavailable', sub: 'Personal to Work', value: '1', tone: 'warn', note: 'automatic recovery' }];
    var differ = D.attempts().filter(function (a) { return a.requested_route_id !== a.effective_route_id; });
    rows.push({ name: 'Selected attempts', sub: differ.length ? C.plural(differ.length, 'attempt') + ' with a different effective route' : 'requested and effective routes match in every selected attempt', value: String(D.attempts().length), note: 'attempt receipts' });
    return { rows: rows };
  } });
  def('route-mismatches', 'accounts', { meta: function () { return 'fallback evidence · requested versus effective'; }, model: function () {
    var rows = D.attempts().map(function (a) {
      return { cells: { id: { html: '<b>' + esc(a.attempt_id) + '</b>' }, req: C.idCell(a.requested_route_id), eff: C.idCell(a.effective_route_id), who: C.acctName(a.account_id), why: a.requested_route_id === a.effective_route_id ? 'no mismatch' : 'fallback' },
        onClick: function (el) { attemptInspect(a, el); } };
    });
    [['Tastebook build', 'no mismatch'], ['Vision helper', 'capability fallback'], ['Fast edit', 'allowance pressure'], ['Long context', 'context fit'], ['Completion', 'completion-only route']].forEach(function (s) {
      rows.push({ cells: { id: { html: '<em>' + esc(s[0]) + '</em>' }, req: 'static intent', eff: '-', who: '-', why: s[1] } });
    });
    return { cols: [{ id: 'id', label: 'ATTEMPT', w: 'minmax(90px,1fr)' }, { id: 'req', label: 'REQUESTED', w: 'minmax(120px,1.4fr)', min: 'l' }, { id: 'eff', label: 'EFFECTIVE', w: 'minmax(120px,1.4fr)', min: 'm' },
      { id: 'who', label: 'PROVIDER · ACCOUNT', w: 'minmax(120px,1.6fr)', min: 'xl' }, { id: 'why', label: 'REASON', w: 'minmax(100px,1.2fr)' }], rows: rows };
  } });
  def('credential-ownership', 'accounts', { meta: function () { return 'routing authority · no secrets shown'; }, model: function () {
    return { rows: [
      { name: 'System managed', sub: 'OAuth and internal credentials', value: '4 accounts', note: 'no user key tracking', glyph: 'shield' },
      { name: 'User supplied', sub: 'provider API credentials', value: '1 account', note: 'Google AI Studio', glyph: 'key' },
      { name: 'Plan session', sub: 'provider subscription login', value: '3 accounts', note: 'Claude, Codex, Qwen', glyph: 'users' },
      { name: 'Recovery needed', sub: 'expired or unavailable', value: '0', note: 'all routes healthy', glyph: 'checkCircle' }] };
  } });
  def('connection-authority', 'accounts', { meta: function () { return 'credential and receipt source'; }, model: function () {
    return { rows: DATA.accounts.map(function (a) {
      var ra = PMU.roster.byLegacy(a.id);
      return { name: ra ? ra.providerName + ' · ' + ra.nickname : a.setup_required ? legName(a.provider_id) : a.name, sub: a.auth + ' · ' + a.scope, value: a.last, note: a.setup_required ? 'no receipt yet' : 'connection receipt', glyph: a.setup_required ? 'gear' : 'link', tone: a.setup_required ? 'warn' : null };
    }) };
  } });

  /* ================================================================== room beats (WOW-SPEC-3 7, WOW-TASKS-3 N3-5)
     PMU.film.beat(room, fn): fn(b) runs once per arrival / room change when the room's first-screen bodies are built, in
     one task, with the light budget open; b.at = ms from now when the hero's instruments end (older engines: the hero
     card's _pmuEnterDelay + b.inner + 900). Every animation is created here with its delay (the compositor plays it);
     each beat creates at most 24. The chart side of a beat (Costs cone, Analytics NOW halo, Context limit tick, Tools
     ring, Signals cells) is the hero chart's own entrance (charts C3-6). */
  C.beatT = function (b, hero, fallback) { return b && typeof b.at === 'number' ? b.at : C.beatAt(b, hero, fallback == null ? 900 : fallback); };
  if (PMU.film && PMU.film.beat) {
    var FB = PMU.film, M = PMU.motion;
    var famNow = function () { return M.family ? M.family() : 'basic'; };
    var popEase = function () { return /retro|nier/.test(famNow()) ? 'steps(3,jump-start)' : 'cubic-bezier(.34,1.45,.64,1)'; };
    /* Overview: the line scans the skyline. The auto-switch line draws left to right (520 SLIDE) with a light front in the
       warn tone riding its end; each tower's cap flares as the front passes; the front leaves the skyline at its right edge
       and goes on as the sweep across the KPI tiles beside it (70 apart, 650 OUT): one light crosses the top of the room */
    FB.beat('overview', function (b) {
      var sky = C.beatCard(b, 'ov-skyline'), at = C.beatT(b, sky), body = sky && sky.querySelector('.pmu-cardbody');
      var dur = body && C.skyScan ? C.skyScan(body, { delay: at, dir: 1, draw: true }) : 0;
      var leave = at + (dur && C.easeInv ? Math.round(C.easeInv([0.22, 1, 0.36, 1], 0.92) * dur) : 0);
      var bottom = sky ? +sky.dataset.y + +sky.dataset.h : 12;
      var tiles = C.byPos(C.beatCards(b, function (c) { return c.getAttribute('data-kind') === 'kpi' && +c.dataset.y < bottom; })).slice(0, 4);
      /* 60 apart and 560 long so the light has left the room by about T0 + 1.8 s (N3-5) */
      tiles.forEach(function (c, i) { FB.sweep(c, { delay: leave + 60 * i, dur: 560 }); });
    });
    /* Plans & limits: the reset markers pop left to right 30 apart (POP 260); then the soonest marker gets one halo and its
       line in the reset map flashes once: the hero points at the agenda */
    FB.beat('plans', function (b) {
      var tl = C.beatCard(b, 'plans-timeline'); if (!tl) return;
      var at = C.beatT(b, tl), mks = C.windowMarks ? C.windowMarks(tl) : [];
      /* 30 apart, the run held to about 360 ms when there are many markers (the beat is over by about T0 + 1.9 s) */
      var shown = mks.slice(0, 20), gap = Math.min(30, 360 / Math.max(1, shown.length));
      shown.forEach(function (m, i) {
        M.animate(m, [{ transform: 'scale(0)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'scale(1)', opacity: 1 }], { dur: 260, delay: at + Math.round(gap * i), easing: popEase(), fill: 'backwards' });
      });
      var soon = mks[0]; if (!soon) return;
      var t2 = at + Math.round(gap * shown.length) + 80;
      FB.halo(soon.querySelector('i') || soon, { delay: t2 });
      var key = soon.getAttribute('data-reset'), rm = C.beatCard(b, 'reset-map');
      var line = key && rm ? rm.querySelector('[data-share="reset:' + key + '"]') : null;
      if (line) { if (FB.budget) FB.budget(rm); FB.flash(line, { delay: t2 + 120 }); }
    });
    /* Costs: the cone opens and "est. $... by ..." rides its edge; the budget rule draws (the hero chart's own entrance,
       charts C3-6). The supporting tiles arrive quiet. */
    FB.beat('costs', function () {});
    /* Accounts: the active light settles. A soft backlight fades in on each provider plate's active row, plate by plate in
       reading order 80 apart (420 OUT), then the exhausted rows ring once (WOW-SPEC 3.6 ring) */
    FB.beat('accounts', function (b) {
      var hero = C.beatCard(b, 'acct-switch'), at = C.beatT(b, hero), k = 0, out = /retro|nier/.test(famNow()) ? 'steps(3,jump-start)' : 'cubic-bezier(.22,.8,.28,1)';
      var plates = C.byPos(C.beatCards(b, function (c) { return c.getAttribute('data-kind') === 'provider' && (!PMU.board.inView || PMU.board.inView(c)); }));
      plates.forEach(function (c) {
        var lights = c.querySelectorAll('.pmu-accrow.is-eff .pmu-acclight'); if (!lights.length || k >= 12) return;
        if (FB.budget) FB.budget(c);
        Array.prototype.forEach.call(lights, function (l) { M.animate(l, [{ opacity: 0 }, { opacity: 1 }], { dur: 420, delay: at + 80 * k, easing: out, fill: 'backwards' }); });
        k++;
      });
      var tEnd = at + 80 * k + 200;
      plates.forEach(function (c) { Array.prototype.forEach.call(c.querySelectorAll('.pmu-accrow[data-state="exhausted"]'), function (row) { FB.ring(row, { tone: 'crit', delay: tEnd }); }); });
    });
  }
})();
