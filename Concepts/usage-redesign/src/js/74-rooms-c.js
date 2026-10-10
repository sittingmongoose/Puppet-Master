/* Widget definitions for Attention, Prompt cache, Tools, Signals and Source authority (owner: content; DESIGN-SPEC 15,
   DESIGN-SPEC-ATLAS 11). Every datum of the old cards is here (PARITY 2.9 to 2.13); fabricated meters are gone and their
   meaning is kept as value-state facts (X-07); "median" that was a mean is relabelled; read share is never a hit rate. */
(function () {
  var C = PMU.content, D = PMU.data, F = PMU.fmt, b = C.b;
  function def(id, room, o) { PMU.widgets.define(id, Object.assign({ room: room }, o)); }
  function money(v) { return C.money(v); }
  var legName = C.legName;

  /* ================================================================== Attention */
  var ALERT_X = [
    { disposition: 'route watch', threshold: 'crossed above 70', scope: 'Claude · Work Claude', receipt: 'receipt ue-614 linked', foot: 'Review route · run-47' },
    { disposition: 'route watch', threshold: 'crossed above 60', scope: 'Gemini API · vision helper', receipt: 'receipt ue-616 linked', foot: 'Review route · Gemini API', anomaly: true },
    { disposition: 'no action', threshold: 'clear', scope: 'Qwen Coding Plan', receipt: 'receipt ue-617 linked', foot: 'Within policy · Qwen' }
  ];
  /* the alert cards are slots (FINAL-REVIEW-3 must-fix 5): a live alert (PMU.data.liveAlerts(), WOW-SPEC-3 8.3 beat 7)
     becomes the first alert card and the fixture alerts shift down one card; an alert pushed past the last card stays
     reachable as that card's "More alerts" fact and in its Details. With no live alert every card is exactly its fixture
     alert, as before. */
  var NCARDS = DATA.alerts.length;
  function alertSlots() {
    var live = (D.liveAlerts ? D.liveAlerts() : []).map(function (al) { return { live: true, al: al, key: 'live:' + al.id }; });
    return live.concat(DATA.alerts.map(function (al, i) { return { live: false, al: al, i: i, key: 'alert-' + i }; }));
  }
  function slotOf(n) { return alertSlots()[n] || null; }
  function slotTitle(sl) { return sl.live ? sl.al.title : (PMU_BOARDS.widgets['alert-' + sl.i] || {}).title || sl.al.title; }
  function slotWhen(sl) { return sl.live || sl.al.time === 'now' ? 'now' : sl.al.time + ' ago'; }
  function liveX(al) {
    /* the warn line the alert crossed is its account's own (item 2: the provider's level, or the account's own) */
    var a = al.account ? PMU.roster.account(al.account) : null, th = (a && a.policy) || PMU.roster.thresholds(al.provider_id || null);
    return { disposition: 'route watch', threshold: 'crossed the ' + (100 - th.warnLeft) + '% warn line', scope: C.legName(al.provider_id) + (a ? ' · ' + a.nickname : ''),
      receipt: 'live demo reading · no receipt yet', foot: 'Review route · ' + C.legName(al.provider_id) };
  }
  function slotModel(sl, n) {
    var al = sl.al, x = sl.live ? liveX(al) : ALERT_X[sl.i], warn = al.state === 'warn', acts = [], arg = sl.live ? 'live:' + al.id : 'alert-' + sl.i;
    if (warn) acts.push({ label: 'Switch route', primary: true, act: 'alert-route', value: sl.live ? 'live:' + al.id : String(sl.i), hover: 'cmd.provider.switch_route · moves new work to the next eligible route' });
    acts.push({ label: 'Acknowledge', demo: 'usage.alert_ack', arg: arg, hover: 'Keeps the warning here; stops raising it on the Dashboard' });
    acts.push({ label: 'Snooze 1h', demo: 'usage.alert_snooze', arg: arg, hover: 'Snoozes the alert for one hour' });
    if (x.anomaly) { acts.push({ label: 'Keep guard', demo: 'usage.anomaly_keep', arg: arg }); acts.push({ label: 'Allow once', demo: 'usage.anomaly_allow', arg: arg }); }
    var m = { key: sl.key, live: !!sl.live, prov: al.provider_id ? PMU.roster.legacyProvider(al.provider_id) : null, sev: warn ? 'warn' : 'ok', sevWord: warn ? 'Attention' : 'Healthy', when: slotWhen(sl), detail: sl.live ? al.detail : C.alertDetail(sl.i),
      score: sl.live ? al.score : C.alertScore(sl.i, al), raise: 70, baseline: '24-hour norm', owner: C.oldName(al.owner), observed: slotWhen(sl), disposition: x.disposition, scope: x.scope,
      threshold: x.threshold, receipt: x.receipt, actions: acts, foot: x.foot };
    /* the last card names the alerts pushed past it (reachable, never dropped) */
    if (n === NCARDS - 1) {
      var more = alertSlots().slice(NCARDS);
      if (more.length) m.more = more.map(function (o) { return slotTitle(o) + ' · ' + slotWhen(o) + ' · ' + (o.live ? o.al.detail : C.alertDetail(o.i)); });
    }
    return m;
  }
  for (var n = 0; n < NCARDS; n++) (function (n) {
    def('alert-' + n, 'attention', {
      title: function () { var sl = slotOf(n); return sl ? slotTitle(sl) : DATA.alerts[n].title; },
      mark: function () { var sl = slotOf(n); return sl && sl.al.provider_id ? PMU.roster.legacyProvider(sl.al.provider_id) : ''; },
      meta: function () { var sl = slotOf(n); return sl ? slotWhen(sl) + ' · ' + C.oldName(sl.al.owner) : ''; },
      model: function () {
        var sl = slotOf(n); if (!sl) return null;
        if (sl.al.provider_id && !D.inScope(sl.al.provider_id)) return null;
        return slotModel(sl, n);
      },
      inspect: function () {
        var sl = slotOf(n); if (!sl) return C.insp('Alert', [['Detail', 'No alert in this slot']]);
        var m = slotModel(sl, n);
        var rows = [['Detail', m.detail], ['Score', m.score + ' of 100 · raises at 70'], ['Owner', m.owner], ['Observed', m.observed], ['Disposition', m.disposition], ['Scope', m.scope], ['Threshold', m.threshold], ['Receipt', m.receipt],
          ['Authority', sl.live ? 'live demo reading (concept fixture) · the demo engine raised it' : 'provider reported · PM pace model for the comparison']];
        if (m.more) rows.push(['More alerts', m.more.join(' · ')]);
        /* the Details carry the alert's own record title (the fixture's "Qwen weekly runway" lives here: never dropped) */
        return C.insp(sl.al.title, rows);
      } });
  })(n);
  C.act('alert-route', function (el) {
    var v = el.getAttribute('data-value') || '', al = v.indexOf('live:') === 0 ? (D.liveAlerts ? D.liveAlerts() : []).filter(function (x) { return 'live:' + x.id === v; })[0] : DATA.alerts[+v];
    if (!al) return;
    var r = command('cmd.provider.switch_route', { provider_id: al.provider_id, reason: 'attention_' + (al.provider_id || 'route'), source: 'usage.attention', alert_title: al.title }, { requested: true });
    if (r.dispatch_accepted !== false) PMU.shell.toast('Route change requested for ' + legName(al.provider_id) + '. New work moves to the next eligible route.');
  });
  def('attention-policy', 'attention', { meta: function () { return 'current · alert rules'; }, model: function () {
    /* the shared levels, then each provider whose own differ (item 2: auto-switch and its levels are per provider) */
    var th = PMU.roster.thresholds(), diffs = C.policyDiffs ? C.policyDiffs() : [];
    var own = diffs.map(function (d) { return d.short + ' ' + (d.pol.warnLeft !== th.warnLeft ? 'warn ' + (100 - d.pol.warnLeft) + '% · ' : '') + (d.pol.auto ? 'switch ' + (100 - d.pol.switchLeft) + '%' : 'switch off'); });
    var thHover = 'Shared: warn at ' + (100 - th.warnLeft) + '% used, ' + (th.auto ? 'switch at ' + (100 - th.switchLeft) + '% used' : 'auto-switch off') + '. ' +
      (diffs.length ? diffs.map(function (d) { return d.p.name + ': warn at ' + (100 - d.pol.warnLeft) + '% used, ' + (d.pol.auto ? 'switch at ' + (100 - d.pol.switchLeft) + '% used' : 'auto-switch off'); }).join('. ') + '. Every other service follows the shared levels' : 'Every service follows the shared levels');
    return { text: '4', unit: ' / 4', sub: 'alert rules reporting · ' + b('healthy'), facts: [['Allowance', 'on'], ['Pricing', 'on'], ['Freshness', 'on'], ['Fallback', 'on'], ['Last review', '2d'],
      ['Thresholds', 'warn ' + (100 - th.warnLeft) + '% used · switch ' + (100 - th.switchLeft) + '% used' + (own.length ? ' · ' + own.join(' · ') : ''), { hover: thHover }], ['Quiet window', 'not set', { vs: 'disabled', word: 'not set' }]],
      foot: '<button type="button" class="pmu-textbtn" data-pmu-act="policy-settings">Adjust in Settings</button>' };
  } });
  C.act('policy-settings', function () { var r = command('cmd.settings.open', { category: 'ai', setting_id: 'ai.accounts.soft-warning-level' }, { opened: true }); if (r.dispatch_accepted !== false) PMU.settings.open(null, 'ai.accounts.soft-warning-level'); });
  def('anom', 'attention', { meta: function () { return 'Hourly · 24 hours · score versus the 24-hour norm'; }, model: function () {
    var A = D.series('anomaly24h'), B = D.series('anomalyBaseline24h'), n = A.values.length, now = new Date(PMU.clock.now()); now.setMinutes(0, 0, 0);
    var x = A.values.map(function (v, i) { return now.getTime() - (n - 1 - i) * 3600000; });
    /* the peak's hour is the plotted hump's own hour (one clock: it moves with the series, never a frozen hour) */
    var pk = 0; A.values.forEach(function (v, i) { if (v > A.values[pk]) pk = i; });
    var peakAt = F.clock(x[pk]);
    var list = D.attempts(), raised = list.filter(function (a) { return a.anomaly_score >= 50; }).length;
    return { chart: 'line', spec: { x: x, unit: 'count', unitTitle: 'SCORE', yMin: 0, yMax: 100, series: [{ name: 'Anomaly score', idx: 2, values: A.values }, { name: '24-hour norm', idx: 7, values: B.values, role: 'baseline' }],
      limits: [{ value: A.raise, label: 'Raise at ' + A.raise, role: 'warn' }], notes: 'The ' + peakAt + ' spike is vision-helper traffic.',
      /* the spike is named on the line itself, at its hour (it was a box in the head's corner, far from the spike) */
      callout: { i: pk, title: peakAt + ' spike', sub: 'vision-helper traffic · ' + C.legName('gemini'), tone: 'warn' } },
      headline: { value: Math.max.apply(null, A.values), fmt: 'int', label: 'peak score · ' + peakAt }, spark: { values: A.values, idx: 2 },
      hero: true, heroTone: Math.max.apply(null, A.values) >= A.raise ? 'warn' : null, heroSub: 'raises at ' + b(A.raise) + ' · ' + b(raised) + (raised === 1 ? ' attempt raised · ' : ' attempts raised · ') + '24-hour norm ' + b('normal'),
      facts: [['Selected', String(list.length)], ['Raised', String(raised)], ['Current', '+18 pts vs norm'], ['Peak', peakAt], ['Cause', 'vision calls'], ['Baseline', 'normal']],
      note: 'The spike is limited to vision-helper traffic. Scores belong to timestamped identity-bound attempt fixtures.' };
  } });
  def('attention-history', 'attention', { meta: function () { return 'Daily · 7 days · actionable provider and pricing signals'; }, model: function () {
    var H = D.series('attentionHistory7d'), today = new Date(PMU.clock.now()); today.setHours(0, 0, 0, 0);
    var labels = H.raised.map(function (v, i) { return F.day(today.getTime() - (H.raised.length - 1 - i) * 86400000); });
    /* a live alert (beat 7) is raised today and open (FINAL-REVIEW-3 must-fix 5); the fixture's 11 / 9 / 2 are the base */
    var nLive = D.liveAlerts ? D.liveAlerts().length : 0, raised = H.raised.slice();
    if (nLive && raised.length) raised[raised.length - 1] += nLive;
    return { labels: labels, unit: 'count', stacks: [{ providerId: 'raised', name: 'Raised', idx: 2, settled: raised, estimate: raised.map(function () { return 0; }) },
      { providerId: 'resolved', name: 'Resolved', idx: 1, settled: H.resolved, estimate: H.resolved.map(function () { return 0; }) }],
      totals: raised.map(function (v, i) { return v + H.resolved[i]; }),
      caption: '<span class="pmu-cap">RAISED</span> <b>' + (11 + nLive) + '</b> · <span class="pmu-cap">RESOLVED</span> <b>9</b> · <span class="pmu-cap">OPEN</span> <b>' + (2 + nLive) + '</b> · <span class="pmu-cap">MEDIAN</span> <b>18m</b>',
      note: 'Only actionable provider and pricing signals are counted.' };
  } });

  /* ================================================================== Prompt cache */
  var CACHE_X = [
    { reporting: 'read and write reported', authority: 'provider reported' },
    { reporting: 'read only · write not exposed', reportingVs: 'not_exposed', authority: 'provider reported', writeVs: 'estimated' },
    { reporting: 'read and write reported', authority: 'provider reported' },
    { reporting: 'no breakdown · PM estimate', reportingVs: 'estimated', authority: 'PM estimate', est: true }
  ];
  function tokNum(s) { var m = /([\d.]+)\s*([kM])/.exec(s); return m ? +m[1] * (m[2] === 'M' ? 1e6 : 1e3) : null; }
  DATA.cache.forEach(function (r, i) {
    var x = CACHE_X[i];
    def('cache-' + i, 'cache', { title: legName(r.provider_id), mark: PMU.roster.legacyProvider(r.provider_id), prov: PMU.roster.legacyProvider(r.provider_id),
      meta: function () { return 'prompt cache · ' + x.reporting; }, model: function () {
        if (!D.inScope(r.provider_id)) return null;
        return { share: parseFloat(r[1]), est: !!x.est, read: r[3].replace(/ read$/, ''), write: r[4].replace(/ write$/, '') + (x.writeVs ? ' est.' : ''), writeVs: x.writeVs === 'estimated' ? null : x.writeVs,
          readN: tokNum(r[3]), writeN: tokNum(r[4]), savings: parseFloat(r[2].replace(/[$,]/g, '')), reporting: x.reporting, reportingVs: x.reportingVs, authority: x.authority, age: '20s' };
      }, inspect: function () { return C.insp(legName(r.provider_id) + ' prompt cache', [['Read share', r[1] + ' (read share, not a hit rate)'], ['Savings', r[2] + ' (estimate)'], ['Read', r[3]], ['Write', r[4]], ['Reporting', x.reporting], ['Authority', x.authority], ['Age', '20s'], ['Scope', 'current route']]); } });
  });
  def('cache-trend', 'cache', { meta: function () { return 'Daily · 30 days · cache reads with the saved estimate'; }, model: function () {
    var S = D.series('cacheDaily30'), n = S.read.length, today = new Date(PMU.clock.now()); today.setHours(0, 0, 0, 0);
    var x = S.read.map(function (v, i) { return today.getTime() - (n - 1 - i) * 86400000; });
    var c = D.costs();
    return { chart: 'area', spec: { x: x, unit: 'tokens', series: [{ name: 'Cache read', idx: 7, values: S.read }],
      /* cache writes on their own small right axis (LOOK-REVIEW-2 3): a 2 px band under an 8M area said nothing */
      cost: { values: S.write, unit: 'tokens', name: 'Cache write', tk: 'cw' }, source: 'provider reported reads and writes · savings are a PM estimate (catalog pricing)' },
      headline: { value: D.sum(S.saved), fmt: 'money', label: 'saved in 30 days (estimate)' }, spark: { values: S.saved, tk: 'cr' },
      facts: [['Saved estimate', money(D.sum(S.saved))], ['Read', F.tok(D.sum(S.read))], ['Write', F.tok(D.sum(S.write))], ['Read share', '96.8%'], ['Selected attempts', String(c.attempts)]],
      note: 'No runtime price rate is inferred; savings use provider catalog prices where receipts do not expose them.' };
  } });
  def('cache-authority', 'cache', { meta: function () { return 'reporting state per route'; }, model: function () {
    return { rows: [{ name: 'Claude', sub: 'read and write', value: 'reported', note: 'provider reading' }, { name: 'ChatGPT / Codex', sub: 'read only', vs: 'not_exposed', word: 'write not exposed', note: 'provider reading' },
      { name: 'Qwen Coding Plan', sub: 'read and write', value: 'reported', note: 'provider reading' }, { name: 'Gemini API', sub: 'no breakdown', value: 'estimated', tone: 'warn', note: 'PM estimate' }] };
  } });
  def('cache-economics', 'cache', { meta: function () { return 'month · saved estimate per route'; }, model: function () {
    var c = D.costs();
    return { rows: DATA.cache.map(function (r) {
      var x = c.byProvider[r.provider_id];
      return { id: r.provider_id, name: legName(r.provider_id), role: r[1] + ' · ' + r[3], hover: r[1] + ' read share · ' + r[3] + ' · ' + r[4] + (x ? ' · ' + x.attempts + ' selected attempts' : ''), value: parseFloat(r[2].replace(/[$,]/g, '')), valueText: r[2].replace(' saved', '') + ' est.',
        vendor: PMU.markOf(PMU.roster.legacyProvider(r.provider_id)).vendor, mark: PMU.roster.legacyProvider(r.provider_id), tone: parseFloat(r[1]) < 88 ? 'warn' : null };
    }), foot: 'Explicit estimate fields · catalog pricing.' };
  } });
  def('cache-break-even', 'cache', { meta: function () { return 'month · catalog weighted'; }, model: function () {
    var c = D.costs();
    return { value: 2.6, fmt: 'x', delta: { v: 0.3, goodWhen: 'up', text: '+0.3x' }, sub: 'avoided spend versus write cost', facts: [['Read value', '$318.22'], ['Write cost', '$5.82'], ['Net saved', '$312.40 est.', { tone: 'good' }], ['Coverage', '96.8%'],
      ['Selected saved', money(c.cache) + ' est.'], ['Cache read', F.tok(c.cacheRead)], ['Cache write', F.tok(c.cacheWrite)], ['Runtime rate', 'not used']], foot: 'Confidence · catalog weighted' };
  } });

  /* ================================================================== Tools */
  var LAT = (D.series('toolLatency') || { rows: [] }).rows;
  var totalCalls = D.sum(DATA.tools.map(function (r) { return parseInt(r[1], 10) || 0; }));
  DATA.tools.forEach(function (r, i) {
    var lat = LAT[i] || {};
    def('tool-' + i, 'tools', { title: r[0].replace(/_/g, '_\u200b'), meta: function (ctx) { return 'tool calls · ' + D.rangeLabel(ctx.state.range); }, model: function () {
      var list = D.attempts().filter(function (a) { return a.tool_id === r[0]; });
      var calls = parseInt(r[1], 10) || 0;
      return { value: calls, fmt: 'int', sub: (lat.errors != null ? b(lat.errors) + (lat.errors === 1 ? ' executed failure' : ' executed failures') : 'executed failures not reported') + ' · p50 ' + b(F.num(lat.p50) + 's') + ' · p95 ' + b(F.num(lat.p95) + 's'),
        facts: [['Errors', r[2]], ['p50', lat.p50 + 's'], ['p95', lat.p95 + 's'], ['Mean', r[3].replace(' median', '') + ' (was labelled median)'], ['Volume', r[4]], ['Share', Math.round(100 * calls / totalCalls) + '% of calls'],
          ['Selected attempts', String(list.length)], ['Selected tokens', F.tok(D.sum(list.map(function (a) { return a.input_tokens + a.output_tokens; })))]] };
    } });
  });
  def('tool-health', 'tools', { meta: function () { return 'current window · within policy'; }, model: function () {
    var o = (D.series('toolLatency') || {}).overall || {};
    return { value: 99.7, max: 100, centre: '99.7%', caption: 'successful', facts: [['Calls', '881'], ['Tools', '5'], ['Retries', String(o.retries)], ['p50', o.p50 + 's'], ['p95', o.p95 + 's'], ['Receipts', '100%'], ['Timeouts', String(o.timeouts)]] };
  } });
  def('tool-list', 'tools', { meta: function (ctx) { return 'all tools · ' + D.rangeLabel(ctx.state.range); }, model: function () {
    return { cols: [{ id: 't', label: 'TOOL', w: 'minmax(120px,1.6fr)', mono: true }, { id: 'calls', label: 'CALLS', align: 'right', w: '60px' }, { id: 'err', label: 'ERRORS', w: 'minmax(70px,1fr)', min: 's' },
      { key: 'p50', label: 'P50', align: 'right', w: '56px', min: 'm' }, { key: 'p95', label: 'P95', align: 'right', w: '56px', min: 'm' }, { id: 'vol', label: 'VOLUME', w: 'minmax(90px,1fr)', min: 'l' }, { id: 'sel', label: 'SELECTED', align: 'right', w: '150px', min: 'xl' }],
      rows: DATA.tools.map(function (r, i) {
        var lat = LAT[i] || {}, list = D.attempts().filter(function (a) { return a.tool_id === r[0]; });
        return { tone: lat.errors ? 'warn' : null, cells: { t: C.idCell(r[0]), calls: r[1].replace(' calls', ''), err: r[2], p50: lat.p50 + 's', p95: lat.p95 + 's', vol: r[4], sel: C.plural(list.length, 'attempt') + ' · ' + (D.sum(list.map(function (a) { return a.charge; })) > 0 ? money(D.sum(list.map(function (a) { return a.charge; }))) + ' settled' : 'covered') } };
      }) };
  } });
  def('tool-latency', 'tools', { kind: 'trend', meta: function () { return 'p50 to p95 per tool · log axis'; }, model: function () {
    var T = D.series('toolLatency');
    var slow = T.rows.slice().sort(function (a, z) { return z.p95 - a.p95; })[0] || {};
    return { chart: 'rangebars', spec: { rows: T.rows, unit: 's' }, headline: { value: T.overall.p95, fmt: 's', label: 'p95 overall · p50 ' + T.overall.p50 + 's' }, spark: { values: T.rows.map(function (r) { return r.p95; }), idx: 0 },
      hero: true, heroSub: 'slowest ' + b(String(slow.name || slow.tool || '').replace(/_/g, '_\u200b')) + ' · p95 ' + b(slow.p95 + 's') + ' · ' + b(T.overall.retries) + ' retry · ' + b(T.overall.timeouts) + ' timeouts',
      /* the old card's provenance note is the caveat's second sentence again (CONTENT-3; PARITY C.1) */
      facts: [['Median', T.overall.p50 + 's'], ['P95', T.overall.p95 + 's'], ['Retries', String(T.overall.retries)], ['Timeouts', String(T.overall.timeouts)]], note: 'Browser and terminal calls dominate the long tail. Latency facts belong to selected attempt fixtures.' };
  } });
  def('tool-receipts', 'tools', { meta: function () { return 'current · retention 90d'; }, model: function () {
    return { value: 100, fmt: 'pct', sub: 'tool calls linked to receipts · ' + b('881') + ' linked', facts: [['Missing', '0'], ['Redacted', '7'], ['Retries', '1'], ['Errors', '3']], foot: 'Retention · 90d' };
  } });
  def('operations-window', 'tools', { meta: function () { return '24 hours · never token usage'; }, model: function () {
    return { rows: [{ name: 'CLI update', sub: 'Codex CLI · rolled back', value: '14:22', tone: 'warn', note: 'receipt ops-1' }, { name: 'Offline replay', sub: 'client outbox recovered', value: '12:06', note: '41 events' },
      { name: 'Server continuity', sub: 'Home Server kept running', value: '08:40', note: '3 jobs' }, { name: 'Project backup', sub: 'Project Vault snapshot', value: '03:15', note: 'verified' },
      { name: 'Environment check', sub: 'cluster and WSL reachable', value: '00:41', note: '2 hosts' }].map(function (r) { return Object.assign({}, r, { value: PMU.clock.clock(r.value) }); }) };
  } });
  def('tool-allowance', 'tools', { meta: function () { return 'provider-bearing calls'; }, model: function () {
    var rows = [['browser_exec', 'Gemini vision helper route', 68, '68 calls', 'counts against API budget', 'warn'], ['run_shell_command', 'no provider usage', 284, '284 calls', 'local tool only'],
      ['read_file', 'context-bearing output', 412, '1.9M tok', 'affects context, not allowance'], ['image_gen', 'metered image generation', 18, '$3.62', 'separate billed surface', 'warn'], ['git', 'no provider usage', 71, '71 calls', 'local tool only']];
    return { rows: rows.map(function (r, i) { var sel = D.attempts().filter(function (a) { return a.tool_id === r[0]; }); return { id: r[0], name: r[0], role: r[1] + ' · ' + r[4], value: r[2], valueText: r[3], idx: i, tone: r[5] || null,
      hover: r[4] + ' · selected ' + C.plural(sel.length, 'attempt') + ' · ' + F.tok(D.sum(sel.map(function (a) { return a.input_tokens + a.output_tokens; }))) + ' tokens · ' + (D.sum(sel.map(function (a) { return a.charge; })) > 0 ? money(D.sum(sel.map(function (a) { return a.charge; }))) + ' settled' : 'covered') }; }) };
  } });
  def('catalog-refresh', 'tools', { meta: function () { return 'never active probing'; }, model: function () {
    return { rows: [{ name: 'Provider catalog', sub: 'official pricing and model metadata', value: '2h old', note: 'version 18' }, { name: 'Free allowance catalog', sub: 'provider published limits', value: '2m old', note: '4 routes' },
      { name: 'CLI capability probe', sub: 'installation feature state', value: '20m old', note: 'no usage fabricated' }, { name: 'Failed probe', sub: 'statistics command unavailable', value: '1 route', tone: 'warn', note: 'usage stays unknown' },
      { name: 'Next refresh', sub: 'scheduled metadata fetch', value: 'in 40s', note: 'not a model call' }] };
  } });

  /* ================================================================== Signals */
  var SIG = [
    { text: '6', unit: ' / 6', sub: 'providers healthy · ' + b('current · healthy'), authority: 'provider' },
    { text: '20s', sub: 'since the last sync · next in 40s', authority: 'PM' },
    { text: '2h', sub: 'old · ' + b('14') + ' providers priced', authority: 'PM' },
    { text: '3', unit: ' events', sub: 'unpriced · ' + b('0.02%') + ' of total · never zero', authority: 'PM', tone: 'warn' }
  ];
  DATA.signals.forEach(function (r, i) {
    var x = SIG[i];
    def('signal-' + i, 'signals', { title: r[0], meta: function () { return 'current reading · ' + r[3]; }, model: function () {
      return { text: x.text, unit: x.unit, tone: x.tone, sub: x.sub, facts: [['Reading', r[1]], ['Freshness', r[3]], ['State', r[2] === 'ok' ? 'current · healthy' : 'current · needs review', r[2] === 'ok' ? {} : { tone: 'warn' }], ['Scope', 'all routes'], ['Authority', x.authority === 'provider' ? 'provider reported' : 'PM reading']] };
    } });
  });
  def('signal-list', 'signals', { meta: function () { return 'current · reading provenance'; }, model: function () {
    return { rows: DATA.signals.map(function (r, i) { return { name: r[0], sub: r[3], value: r[1], tone: r[2] === 'warn' ? 'warn' : null, glyph: r[2] === 'warn' ? 'alert' : 'checkCircle', note: SIG[i].authority === 'provider' ? 'provider authority' : 'PM authority' }; }) };
  } });
  def('signal-history', 'signals', { meta: function () { return 'Hourly · 24 hours · % of provider readings healthy (90 to 100 axis)'; }, model: function () {
    var S = D.series('signalHealth24h'), n = S.values.length, now = new Date(PMU.clock.now()); now.setMinutes(0, 0, 0);
    var x = S.values.map(function (v, i) { return now.getTime() - (n - 1 - i) * 3600000; });
    var lo = 0; S.values.forEach(function (v, i) { if (v < S.values[lo]) lo = i; });
    return { chart: 'line', spec: { x: x, unit: 'pct', unitTitle: '% HEALTHY', yMin: 90, yMax: 100, series: [{ name: 'Healthy readings', idx: 1, values: S.values, area: true }] }, headline: { value: S.values[n - 1], fmt: 'pct', label: 'of provider readings healthy now' }, spark: { values: S.values, idx: 1 },
      hero: true, heroSub: 'low ' + b(C.fmt(S.values[lo], 'pct')) + ' at ' + b(F.clock(x[lo])) + ' · 2 warnings · 0 stale',
      facts: [['Healthy', '6'], ['Warnings', '2'], ['Stale', '0'], ['Unpriced', '3'], ['Selected attempts', String(D.costs().attempts)]], note: 'Health is not inferred from absent Usage attempts.' };
  } });
  def('signal-coverage', 'signals', { meta: function () { return 'current · events with usable signal data'; }, model: function () {
    return { value: 99.98, fmt: 'pct2', sub: 'events with usable signal data · ' + b('3') + ' unpriced', facts: [['Allowance', '100%'], ['Pricing', '99.98%', { tone: 'warn' }], ['Health', '100%'], ['Freshness', '100%'], ['Unknown', '0']], foot: 'Unknown · 0' };
  } });
  def('signal-authority-map', 'signals', { meta: function () { return 'reading provenance'; }, model: function () {
    return { rows: [{ name: 'Allowance', sub: 'provider receipt or plan session', value: 'direct', note: '4 routes' }, { name: 'Reset clock', sub: 'provider reported', value: 'direct', note: '4 routes' },
      { name: 'Spend', sub: 'provider invoice', value: 'direct', note: '1 route' }, { name: 'Forecast', sub: 'local-time pace model', value: 'estimate', tone: 'warn', note: 'confidence 87%' },
      { name: 'Cache savings', sub: 'catalog price model', value: 'estimate', tone: 'warn', note: 'labeled derived' }] };
  } });

  /* ================================================================== Source authority (4 / 6 / 8 panels by level, R-AUTH-01) */
  /* the Source authority hero (WOW-TASKS N-2): each top-level reading flows to its authority and its label */
  def('auth-flow', 'authority', { kind: 'flow', meta: function () { return 'current · reading, authority, label · freshness policy 5m'; } });
  def('auth-summary', 'authority', { meta: function () { return 'current · top-level readings'; }, model: function () {
    return { text: '4', unit: ' / 6', sub: 'top-level readings provider reported · ' + b('fresh'), facts: [['Allowance', '4'], ['Reset', '4'], ['Spend', '1'], ['Cache', '3']], foot: 'Oldest · 1m' };
  } });
  def('auth-est', 'authority', { meta: function () { return 'current · derived readings'; }, model: function () {
    return { value: 2, fmt: 'int', tone: 'warn', sub: 'derived readings · ' + b('labeled'), facts: [['Forecast', 'pace model'], ['Savings', 'catalog price'], ['Confidence', '87%'], ['Stale', '0']], foot: 'Derived · explicit' };
  } });
  def('auth-stale', 'authority', { meta: function () { return 'current · freshness policy 5m'; }, model: function () {
    return { value: 0, fmt: 'int', sub: 'readings older than policy · ' + b('clear'), facts: [['Policy', '5m'], ['Oldest', '1m'], ['Missing', '0'], ['Unknown', '0']], foot: 'Freshness · pass' };
  } });
  def('auth-coverage', 'authority', { meta: function () { return 'current · named authority'; }, model: function () {
    return { value: 100, fmt: 'pct', sub: 'readings with named authority · ' + b('all labeled'), facts: [['Provider', '4'], ['PM', '2'], ['Unknown', '0'], ['Expired', '0']], foot: 'Policy · pass' };
  } });
  def('auth-list', 'authority', { meta: function () { return 'diagnostics · every current source'; }, model: function () {
    return { rows: DATA.authority.map(function (r) { var est = /estimate/.test(r[1]); return { name: C.oldName(r[0]), sub: r[1] + ' · ' + r[3], value: r[2], note: est ? 'derived reading' : 'direct authority', glyph: est ? 'pencil' : 'check', noteTone: est ? 'warn' : null }; }) };
  } });
  def('pricing-provenance', 'authority', { meta: function (ctx) { return D.rangeLabel(ctx.state.range) + ' · pricing sources'; }, model: function () {
    var c = D.costs();
    return { rows: [
      { name: 'Settled charge', sub: 'attempt receipt authority', value: String(c.settledAttempts), note: 'selected attempts', glyph: 'check' },
      { name: 'Plan allocation', sub: 'explicit fixture estimate', value: String(c.planAttempts), tone: 'warn', note: 'labeled estimate', glyph: 'pencil' },
      { name: 'Pending settlement', sub: 'not promoted to charge', value: String(c.pending), tone: c.pending ? 'warn' : null, note: 'independent state', glyph: 'clockCircle' },
      { name: 'Unpriced', sub: 'rejected or preserved unknown', value: '0', note: 'never converted to zero', glyph: 'slashCircle' },
      { name: 'Provider invoice', sub: '312 events', value: '99.4% priced', note: 'month' },
      { name: 'Plan catalog', sub: '549 events', value: 'catalog v18', note: 'month' },
      { name: 'Local estimate', sub: '4 routes', value: 'confidence 87%', tone: 'warn', note: 'PM estimate' },
      { name: 'Unpriced events', sub: '3 events', value: '0.02%', tone: 'warn', note: 'month' }] };
  } });
  def('provider-probe-state', 'authority', { meta: function () { return 'per installation · a probe is setup evidence, never quota'; }, model: function () {
    return { rows: [{ name: 'Claude CLI', sub: 'allowance and reset available', value: 'reported', note: 'OAuth plan session', mark: 'claude-code' },
      { name: 'Codex CLI', sub: 'allowance and cache available', value: 'reported', note: 'ChatGPT plan session', mark: 'openai-codex' },
      { name: 'Qwen CLI', sub: 'weekly allowance available', value: 'reported', note: 'coding plan session', mark: 'qwen-coding' },
      { name: 'Gemini API', sub: 'spend available; quota partial', value: 'partial', tone: 'warn', note: 'API key route', mark: 'gemini-direct' },
      { name: 'Copilot CLI', sub: 'token statistics unavailable', vs: 'unknown', word: 'unknown', note: 'request allowance only', mark: 'github-copilot' },
      { name: 'Local Qwen', sub: 'device capacity only', value: 'local', note: 'no provider billing authority', mark: 'local-endpoint' }] };
  } });
  def('unknown-versus-zero', 'authority', { meta: function () { return 'reporting semantics · the page legend'; }, model: function () {
    return { rows: [{ name: 'Measured zero', sub: 'provider returned the field and value 0', value: '0', note: 'retained as zero' },
      { name: 'Not exposed', sub: 'provider has no usable field', vs: 'not_exposed', word: 'Quota not exposed', note: 'not converted to zero' },
      { name: 'Probe unavailable', sub: 'command failed or is missing', vs: 'unknown', word: 'Usage unknown', note: 'no figure derived' },
      { name: 'Not applicable', sub: 'route cannot report this bucket', vs: 'disabled', word: 'n/a', note: 'excluded from total' },
      { name: 'Estimated', sub: 'Puppet Master derived reading', value: 'est.', tone: 'warn', note: 'never shown as provider reported' },
      { name: 'Stale', sub: 'reading older than policy', vs: 'stale', word: 'cached 2h ago', note: 'kept with its age' },
      { name: 'Pending recheck', sub: 'a reset time has passed', vs: 'pending_recheck', word: 'Pending recheck', note: 'never shown as Ready' }] };
  } });

  /* every board widget belongs to a room even where no definition above names it (PMU.widgets.list) */
  Object.keys(PMU_BOARDS.rooms).forEach(function (room) {
    var have = PMU.widgets.list(room);
    PMU_BOARDS.rooms[room].M.forEach(function (e) {
      var d = PMU.widgets.get(e[0]);
      if (have.indexOf(e[0]) < 0 && (!d || !d.model)) PMU.widgets.define(e[0], Object.assign({}, d && d.model ? {} : {}, { room: room }));
    });
  });
  /* every widget's Details lists every reading its card holds (CONTENT-3: nothing is ever hidden silently; a fact the
     card folds at its size is in its "N more" hover tag and here) */
  /* Live (WOW-SPEC-3 8, engine E3-7): a beat patches the cards that hold one of its share keys; these cards also show a
     live reading derived from them without carrying the key, so they declare the key prefixes they follow (the engine
     writes them as data-live on the card) */
  var LIVE = {
    'month': ['num:value', 'num:attempts'], 'cost-month': ['num:value', 'num:attempts'], 'cache-saved': ['num:cache', 'num:attempts'], 'cost-save': ['num:cache', 'num:attempts'], 'burn-basis': ['num:attempts'], 'forecast': ['num:attempts'],
    'cache-trend': ['num:cache', 'num:attempts'], 'signal-history': ['num:attempts'], /* integ3: every card that prints the selected attempts count follows it */ 'plan-value-now': ['num:value'],
    'an-totals': ['num:tokens', 'num:value', 'num:cache'], 'token-trend': ['num:tokens', 'chart:tokens'], 'next-reset': ['win:'], 'route-pressure': ['win:'],
    'ov-headroom': ['win:'], 'acct-switch': ['win:'], 'ov-resets': ['win:'], 'reset-map': ['win:'], 'acct-resets': ['win:'], 'an-resets': ['win:'],
    'attention-now': ['alert:', 'win:claude-code/work-claude/fiveHour'], 'alert-0': ['alert:', 'win:claude-code/work-claude/fiveHour'], 'alert-1': ['alert:', 'win:claude-code/work-claude/fiveHour'],
    'alert-2': ['alert:', 'win:claude-code/work-claude/fiveHour'], 'attention-history': ['alert:'], 'ledger-count': ['num:attempts'], 'ledger-routes': ['num:attempts'], 'budget-now': ['num:spend', 'chart:budget'], 'budget': ['num:spend', 'chart:budget'],
    'quota-history': ['win:'], 'acct-history': ['acct:'], 'an-quota-history': ['win:'], 'plans-timeline': ['win:'], 'ov-skyline': ['win:']
  };
  /* FINAL-REVIEW-3 must-fix 2 and 3: every card whose reading derives from the selected attempts (live attempts arrive
     and settle: num:attempts.count, num:attempts.settle), from the window value (num:value.window) or from the month's
     spend (num:spend.month) follows those keys, so no split, count or caption on screen is left stale beside its headline */
  var V = 'num:value', A = 'num:attempts', SP = 'num:spend', CA = 'num:cache', TK = 'num:tokens';
  var DERIVED = {
    'budget-now': [V], 'budget': [V], 'plan-value-now': [A], 'forecast': [V, A], 'plan-settlement': [V, A], 'allowance-attribution': [V, A],
    'cost-api': [A], 'cost-plan': [V, A], 'provider-cost': [V, A], 'cost-authority': [V, A, SP], 'cost-trend': [V, A], 'cost-spend': [SP],
    'pricing-confidence': [V, A], 'burn-basis': [V, SP], 'account-fallbacks': [A], 'route-mismatches': [A],
    'an-totals': [A], 'token-trend': [V, A], 'model-mix': [A], 'an-model-donut': [A], 'an-token-breakdown': [TK, A], 'cache-read-share': [TK, A, CA], 'reasoning-mix': [TK, A],
    'ledger-timeline': [A], 'ledger-errors': [A], 'settlement-states': [A], 'ledger-main': [A], 'attempt-lineage': [A], 'ledger-coverage': [A], 'ledger-export': [A], 'usage-record-state': [A],
    'anom': [A], 'cache-economics': [CA, A], 'cache-break-even': [CA, A], 'tool-list': [A], 'tool-allowance': [A], 'pricing-provenance': [V, A]
  };
  Object.keys(DERIVED).forEach(function (id) {
    var have = LIVE[id] || [];
    LIVE[id] = have.concat(DERIVED[id].filter(function (k) { return have.indexOf(k) < 0; }));
  });
  Object.keys(LIVE).forEach(function (id) { if (PMU.widgets.get(id)) PMU.widgets.define(id, { live: LIVE[id] }); });
  ['claude', 'codex', 'qwen', 'gemini', 'kimi', 'copilot'].forEach(function (id) { if (PMU.widgets.get('tok-' + id)) PMU.widgets.define('tok-' + id, { live: ['num:tokens.' + id, A] }); });
  C.inspectAll(Object.keys(PMU_BOARDS.widgets).concat.apply(Object.keys(PMU_BOARDS.widgets), Object.keys(PMU_BOARDS.rooms).map(function (room) { return PMU.widgets.list(room); })));

  /* ================================================================== room beats (WOW-SPEC-3 7, WOW-TASKS-3 N3-5; see 70-rooms-a.js) */
  if (PMU.film && PMU.film.beat) {
    var FB = PMU.film, M = PMU.motion;
    var stepped = function () { return M.family && /retro|nier/.test(M.family()); };
    /* Attention: the ring swells on the spike and its label unfolds (the hero chart's own entrance); then the three alert
       cards' severity glyphs pop 60 apart (POP 260): the alerts answer the spike */
    FB.beat('attention', function (b) {
      var an = C.beatCard(b, 'anom'), at = C.beatT(b, an);
      C.byPos(C.beatCards(b, function (c) { return c.getAttribute('data-kind') === 'alert' && (!PMU.board.inView || PMU.board.inView(c)); })).slice(0, 6).forEach(function (c, i) {
        var g = c.querySelector('.pmu-alerttop .pmu-ico, .pmu-alerttop svg'); if (!g) return;
        if (FB.budget) FB.budget(c);
        M.animate(g, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.25)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { dur: 260, delay: at + 320 + 60 * i, easing: stepped() ? 'steps(3,jump-start)' : 'cubic-bezier(.34,1.45,.64,1)', fill: 'backwards' });
      });
    });
    /* Prompt cache: the savings trend's last point gets the NOW halo (the trend chart's own beat part) */
    FB.beat('cache', function (b) {
      var heroes = C.byPos(C.beatCards(b, function (c) { return c.getAttribute('data-kind') === 'cache'; })), at = C.beatT(b, heroes[heroes.length - 1]);
      var tr = C.beatCard(b, 'cache-trend'), plot = tr && tr.querySelector('[data-pmu-chart]'), ch = plot && PMU.charts && PMU.charts.of ? PMU.charts.of(plot) : null;
      if (ch && typeof ch.beat === 'function' && (!PMU.board.inView || PMU.board.inView(tr))) { if (FB.budget) FB.budget(tr); try { ch.beat(at); } catch (error) {} }
    });
    /* Tools: the slowest tool above its budget rings once in the warn tone (the hero chart's own entrance, charts C3-6) */
    FB.beat('tools', function () {});
    /* Signals: incident cells flash once in time order 40 apart (the hero chart's own entrance, charts C3-6) */
    FB.beat('signals', function () {});
    /* Source authority: the estimate band's label rolls its count */
    FB.beat('authority', function (b) {
      var fl = C.beatCard(b, 'auth-flow'); if (!fl) return;
      var at = C.beatT(b, fl), est = fl.querySelector('.pmu-flowmid[data-k="est"] b'); if (!est) return;
      var n = parseFloat(est.textContent); if (!isFinite(n) || n <= 0) return;
      if (FB.odometer) FB.odometer(est, n, function (v) { return String(Math.round(v)); }, { from: 0, delay: at, dur: 520 });
      FB.flash(est.parentNode, { delay: at + 520 });
    });
  }
})();
