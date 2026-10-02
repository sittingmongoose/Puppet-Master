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
  DATA.alerts.forEach(function (al, i) {
    var x = ALERT_X[i];
    def('alert-' + i, 'attention', { title: (PMU_BOARDS.widgets['alert-' + i] || {}).title || al.title, mark: al.provider_id ? PMU.roster.legacyProvider(al.provider_id) : null, prov: al.provider_id ? PMU.roster.legacyProvider(al.provider_id) : null,
      meta: function () { return (al.time === 'now' ? 'now' : al.time + ' ago') + ' · ' + C.oldName(al.owner); }, model: function () {
        if (al.provider_id && !D.inScope(al.provider_id)) return null;
        var warn = al.state === 'warn', acts = [];
        if (warn) acts.push({ label: 'Switch route', primary: true, act: 'alert-route', value: String(i), hover: 'cmd.provider.switch_route · moves new work to the next eligible route' });
        acts.push({ label: 'Acknowledge', demo: 'usage.alert_ack', arg: 'alert-' + i, hover: 'Keeps the warning here; stops raising it on the Dashboard' });
        acts.push({ label: 'Snooze 1h', demo: 'usage.alert_snooze', arg: 'alert-' + i, hover: 'Snoozes the alert for one hour' });
        if (x.anomaly) { acts.push({ label: 'Keep guard', demo: 'usage.anomaly_keep', arg: 'alert-' + i }); acts.push({ label: 'Allow once', demo: 'usage.anomaly_allow', arg: 'alert-' + i }); }
        return { sev: warn ? 'warn' : 'ok', sevWord: warn ? 'Attention' : 'Healthy', when: al.time === 'now' ? 'now' : al.time + ' ago', detail: C.alertCopy[i], score: al.score, raise: 70, baseline: '24-hour norm',
          owner: C.oldName(al.owner), observed: al.time === 'now' ? 'now' : al.time + ' ago', disposition: x.disposition, scope: x.scope, threshold: x.threshold, receipt: x.receipt, actions: acts, foot: x.foot };
      }, inspect: function () { return C.insp(al.title, [['Detail', C.alertCopy[i]], ['Score', al.score + ' of 100 · raises at 70'], ['Owner', C.oldName(al.owner)], ['Observed', al.time], ['Disposition', x.disposition], ['Scope', x.scope], ['Threshold', x.threshold], ['Receipt', x.receipt], ['Authority', 'provider reported · PM pace model for the comparison']]); } });
  });
  C.act('alert-route', function (el) {
    var al = DATA.alerts[+el.getAttribute('data-value')]; if (!al) return;
    var r = command('cmd.provider.switch_route', { provider_id: al.provider_id, reason: 'attention_' + (al.provider_id || 'route'), source: 'usage.attention', alert_title: al.title }, { requested: true });
    if (r.dispatch_accepted !== false) PMU.shell.toast('Route change requested for ' + legName(al.provider_id) + '. New work moves to the next eligible route.');
  });
  def('attention-policy', 'attention', { meta: function () { return 'current · alert rules'; }, model: function () {
    var th = PMU.roster.thresholds();
    return { text: '4', unit: ' / 4', sub: 'alert rules reporting · ' + b('healthy'), facts: [['Allowance', 'on'], ['Pricing', 'on'], ['Freshness', 'on'], ['Fallback', 'on'], ['Last review', '2d'],
      ['Thresholds', 'warn ' + (100 - th.warnLeft) + '% used · switch ' + (100 - th.switchLeft) + '% used'], ['Quiet window', 'not set', { vs: 'disabled', word: 'not set' }]],
      foot: '<button type="button" class="pmu-textbtn" data-pmu-act="policy-settings">Adjust in Settings</button>' };
  } });
  C.act('policy-settings', function () { var r = command('cmd.settings.open', { category: 'ai', setting_id: 'ai.accounts.soft-warning-level' }, { opened: true }); if (r.dispatch_accepted !== false) PMU.settings.open(null, 'ai.accounts.soft-warning-level'); });
  def('anom', 'attention', { meta: function () { return 'Hourly · 24 hours · score versus the 24-hour norm'; }, model: function () {
    var A = D.series('anomaly24h'), B = D.series('anomalyBaseline24h'), n = A.values.length, now = new Date(); now.setMinutes(0, 0, 0);
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
    var H = D.series('attentionHistory7d'), today = new Date(); today.setHours(0, 0, 0, 0);
    var labels = H.raised.map(function (v, i) { return F.day(today.getTime() - (H.raised.length - 1 - i) * 86400000); });
    return { labels: labels, unit: 'count', stacks: [{ providerId: 'raised', name: 'Raised', idx: 2, settled: H.raised, estimate: H.raised.map(function () { return 0; }) },
      { providerId: 'resolved', name: 'Resolved', idx: 1, settled: H.resolved, estimate: H.resolved.map(function () { return 0; }) }],
      totals: H.raised.map(function (v, i) { return v + H.resolved[i]; }),
      caption: '<span class="pmu-cap">RAISED</span> <b>11</b> · <span class="pmu-cap">RESOLVED</span> <b>9</b> · <span class="pmu-cap">OPEN</span> <b>2</b> · <span class="pmu-cap">MEDIAN</span> <b>18m</b>',
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
    var S = D.series('cacheDaily30'), n = S.read.length, today = new Date(); today.setHours(0, 0, 0, 0);
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
      facts: [['Median', T.overall.p50 + 's'], ['P95', T.overall.p95 + 's'], ['Retries', String(T.overall.retries)], ['Timeouts', String(T.overall.timeouts)]], note: 'Browser and terminal calls dominate the long tail.' };
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
    var S = D.series('signalHealth24h'), n = S.values.length, now = new Date(); now.setMinutes(0, 0, 0);
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

  /* ================================================================== room beats (WOW-SPEC 4, WOW-TASKS N-1) */
  if (PMU.film && PMU.film.beat) {
    var FB = PMU.film;
    /* Attention: the anomaly line draws with its comet (the chart's own entrance); the spike's annotation then unfolds
       from its line (scaleY, 260 SETTLE) and the hero number takes the light */
    FB.beat('attention', function (b) {
      var an = C.beatCard(b, 'anom'); if (!an) return;
      /* the spike's ring swells on the point, then its label unfolds from the leader (scaleX from the point's side) */
      var note = an.querySelector('.pmu-callout') || an.querySelector('.pmu-heronote'), ring = an.querySelector('.pmu-callring'), f = PMU.motion.family ? PMU.motion.family() : 'basic';
      var stp = f === 'retro' || f === 'nier';
      if (ring) PMU.motion.animate(ring, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.35)', opacity: 1, offset: 0.55 }, { transform: 'scale(1)', opacity: 1 }],
        { dur: 420, delay: C.beatAt(b, an, 900), easing: stp ? 'steps(3,jump-start)' : FB.E.out, fill: 'backwards' });
      if (note) PMU.motion.animate(note, [{ transform: 'scaleX(.04)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'scaleX(1)', opacity: 1 }],
        { dur: 320, delay: C.beatAt(b, an, 1080), easing: stp ? 'steps(3,jump-start)' : FB.E.settle, fill: 'backwards' });
      C.sweepHero(b, an, 1150);
      C.byPos(C.beatCards(b, function (c) { return c.getAttribute('data-kind') === 'alert' && c.querySelector('.pmu-alerttop[data-tone="warn"]'); }))
        .forEach(function (c, i) { FB.flash(c.querySelector('.pmu-alerttop') || c, { tone: 'warn', delay: C.beatAt(b, an, 1400 + 90 * i), noSweep: true }); });
    });
    /* Prompt cache: the read arcs sweep, then the write arcs (the rings' own entrance); one light then crosses the four
       rings left to right and the savings roll */
    FB.beat('cache', function (b) {
      C.byPos(C.beatCards(b, function (c) { return c.getAttribute('data-kind') === 'cache'; })).forEach(function (c, i) {
        var ring = c.querySelector('.pmu-cachering'); if (ring) FB.sweep(ring, { delay: C.beatAt(b, c, 1000 + 70 * i), dur: 600 });
      });
    });
    /* Tools: the p50 dots pop and the p95 bars grow with their head glows (the ladder's own entrance); the light then
       crosses the hero number and the five tool tiles */
    FB.beat('tools', function (b) {
      var lat = C.beatCard(b, 'tool-latency'); C.sweepHero(b, lat, 1100);
      var tiles = C.byPos(C.beatCards(b, function (c) { return /^tool-\d$/.test(c.getAttribute('data-widget') || ''); }));
      var t0 = 0; tiles.forEach(function (c) { t0 = Math.max(t0, C.beatAt(b, c, 900)); });
      tiles.forEach(function (c, i) { FB.sweep(c, { delay: t0 + 70 * i }); });
    });
    /* Signals: the health history paints with its light front (the chart's own entrance); the signals that need review
       flash once */
    FB.beat('signals', function (b) {
      var h = C.beatCard(b, 'signal-history'); C.sweepHero(b, h, 1100);
      C.beatCards(b, function (c) { return /^signal-\d$/.test(c.getAttribute('data-widget') || '') && c.querySelector('.pmu-kpiline[data-tone="warn"]'); })
        .forEach(function (c) { FB.flash(c.querySelector('.pmu-kpiline'), { tone: 'warn', delay: C.beatAt(b, h, 1300) }); });
      var list = C.beatCard(b, 'signal-list');
      if (list) Array.prototype.forEach.call(list.querySelectorAll('.pmu-lrow[data-tone="warn"]'), function (row) { FB.flash(row, { tone: 'warn', delay: C.beatAt(b, h, 1400) }); });
    });
    /* Source authority: the bands flow left to right (the flow's own entrance); a light then crosses the authority and
       label boxes 80 ms apart */
    FB.beat('authority', function (b) {
      var fl = C.beatCard(b, 'auth-flow'); if (!fl) return;
      Array.prototype.forEach.call(fl.querySelectorAll('.pmu-flowmid, .pmu-flowlab'), function (bx, i) { FB.sweep(bx, { delay: C.beatAt(b, fl, 1000 + 80 * i), dur: 600 }); });
      C.sweepHero(b, fl, 1300);
    });
  }
})();
