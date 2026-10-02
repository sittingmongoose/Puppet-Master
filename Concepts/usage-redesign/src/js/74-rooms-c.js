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
    def('alert-' + i, 'attention', { title: al.title, mark: al.provider_id ? PMU.roster.legacyProvider(al.provider_id) : null, prov: al.provider_id ? PMU.roster.legacyProvider(al.provider_id) : null,
      meta: function () { return (al.time === 'now' ? 'now' : al.time + ' ago') + ' · ' + al.owner; }, model: function () {
        if (al.provider_id && !D.inScope(al.provider_id)) return null;
        var warn = al.state === 'warn', acts = [];
        if (warn) acts.push({ label: 'Switch route', primary: true, act: 'alert-route', value: String(i), hover: 'cmd.provider.switch_route · moves new work to the next eligible route' });
        acts.push({ label: 'Acknowledge', demo: 'usage.alert_ack', arg: 'alert-' + i, hover: 'Keeps the warning here; stops raising it on the Dashboard' });
        acts.push({ label: 'Snooze 1h', demo: 'usage.alert_snooze', arg: 'alert-' + i, hover: 'Snoozes the alert for one hour' });
        if (x.anomaly) { acts.push({ label: 'Keep guard', demo: 'usage.anomaly_keep', arg: 'alert-' + i }); acts.push({ label: 'Allow once', demo: 'usage.anomaly_allow', arg: 'alert-' + i }); }
        return { sev: warn ? 'warn' : 'ok', sevWord: warn ? 'Attention' : 'Healthy', when: al.time === 'now' ? 'now' : al.time + ' ago', detail: C.alertCopy[i], score: al.score, raise: 70, baseline: '24-hour norm',
          owner: al.owner, observed: al.time === 'now' ? 'now' : al.time + ' ago', disposition: x.disposition, scope: x.scope, threshold: x.threshold, receipt: x.receipt, actions: acts, foot: x.foot };
      }, inspect: function () { return C.insp(al.title, [['Detail', C.alertCopy[i]], ['Score', al.score + ' of 100 · raises at 70'], ['Owner', al.owner], ['Observed', al.time], ['Disposition', x.disposition], ['Scope', x.scope], ['Threshold', x.threshold], ['Receipt', x.receipt], ['Authority', 'provider reported · PM pace model for the comparison']]); } });
  });
  C.act('alert-route', function (el) {
    var al = DATA.alerts[+el.getAttribute('data-value')]; if (!al) return;
    var r = command('cmd.provider.switch_route', { provider_id: al.provider_id, reason: 'attention_' + (al.provider_id || 'route'), source: 'usage.attention', alert_title: al.title }, { requested: true });
    if (r.dispatch_accepted !== false) PMU.shell.toast('Route change requested for ' + legName(al.provider_id) + '. New work moves to the next eligible route.');
  });
  def('attention-policy', 'attention', { meta: function () { return 'current · alert rules'; }, model: function () {
    var th = PMU.roster.thresholds();
    return { text: '4', unit: ' / 4', sub: 'alert rules reporting · ' + b('healthy'), facts: [['Allowance', 'on'], ['Pricing', 'on'], ['Freshness', 'on'], ['Fallback', 'on'],
      ['Thresholds', 'warn ' + (100 - th.warnLeft) + '% used · switch ' + (100 - th.switchLeft) + '% used'], ['Quiet window', 'not set', { vs: 'disabled', word: 'not set' }], ['Last review', '2d']],
      foot: '<span>Last review · 2d</span><button type="button" class="pmu-textbtn" data-pmu-act="policy-settings">Adjust in Settings</button>' };
  } });
  C.act('policy-settings', function () { var r = command('cmd.settings.open', { category: 'ai', setting_id: 'ai.accounts.soft-warning-level' }, { opened: true }); if (r.dispatch_accepted !== false) PMU.settings.open(null, 'ai.accounts.soft-warning-level'); });
  def('anom', 'attention', { meta: function () { return 'Hourly · 24 hours · score versus the 24-hour norm'; }, model: function () {
    var A = D.series('anomaly24h'), B = D.series('anomalyBaseline24h'), n = A.values.length, now = new Date(); now.setMinutes(0, 0, 0);
    var x = A.values.map(function (v, i) { return now.getTime() - (n - 1 - i) * 3600000; });
    var list = D.attempts(), raised = list.filter(function (a) { return a.anomaly_score >= 50; }).length;
    return { chart: 'line', spec: { x: x, unit: 'count', unitTitle: 'SCORE', yMin: 0, yMax: 100, series: [{ name: 'Anomaly score', idx: 2, values: A.values }, { name: '24-hour norm', idx: 7, values: B.values, role: 'baseline' }],
      limits: [{ value: A.raise, label: 'Raise at ' + A.raise, role: 'warn' }], notes: 'The 15:00 spike is vision-helper traffic.' },
      headline: { value: Math.max.apply(null, A.values), fmt: 'int', label: 'peak score · 15:00' }, spark: { values: A.values, idx: 2 },
      facts: [['Selected', String(list.length)], ['Raised', String(raised)], ['Current', '+18%'], ['Peak', '15:00'], ['Cause', 'vision calls'], ['Baseline', 'normal']],
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
    return { chart: 'area', spec: { x: x, unit: 'tokens', stacked: true, series: [{ name: 'Cache read', idx: 7, values: S.read }, { name: 'Cache write', idx: 2, values: S.write }], source: 'provider reported reads and writes · savings are a PM estimate (catalog pricing)' },
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
    def('tool-' + i, 'tools', { title: r[0], meta: function (ctx) { return 'tool calls · ' + D.rangeLabel(ctx.state.range); }, model: function () {
      var list = D.attempts().filter(function (a) { return a.tool_id === r[0]; });
      var calls = parseInt(r[1], 10) || 0;
      return { value: calls, fmt: 'int', sub: b(lat.errors != null ? lat.errors : '-') + ' executed failures · p50 ' + b(F.num(lat.p50) + 's') + ' · p95 ' + b(F.num(lat.p95) + 's'),
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
      { key: 'p50', label: 'P50', align: 'right', w: '56px', min: 'm' }, { key: 'p95', label: 'P95', align: 'right', w: '56px', min: 'm' }, { id: 'vol', label: 'VOLUME', w: 'minmax(90px,1fr)', min: 'l' }, { id: 'sel', label: 'SELECTED', align: 'right', w: '120px', min: 'xl' }],
      rows: DATA.tools.map(function (r, i) {
        var lat = LAT[i] || {}, list = D.attempts().filter(function (a) { return a.tool_id === r[0]; });
        return { tone: lat.errors ? 'warn' : null, cells: { t: r[0], calls: r[1].replace(' calls', ''), err: r[2], p50: lat.p50 + 's', p95: lat.p95 + 's', vol: r[4], sel: list.length + ' attempts · ' + (D.sum(list.map(function (a) { return a.charge; })) > 0 ? money(D.sum(list.map(function (a) { return a.charge; }))) + ' settled' : 'covered') } };
      }) };
  } });
  def('tool-latency', 'tools', { kind: 'trend', meta: function () { return 'p50 to p95 per tool · log axis'; }, model: function () {
    var T = D.series('toolLatency');
    return { chart: 'rangebars', spec: { rows: T.rows, unit: 's' }, headline: { value: T.overall.p95, fmt: 's', label: 'p95 overall · p50 ' + T.overall.p50 + 's' }, spark: { values: T.rows.map(function (r) { return r.p95; }), idx: 0 },
      facts: [['Median', T.overall.p50 + 's'], ['P95', T.overall.p95 + 's'], ['Retries', String(T.overall.retries)], ['Timeouts', String(T.overall.timeouts)]], note: 'Browser and terminal calls dominate the long tail.' };
  } });
  def('tool-receipts', 'tools', { meta: function () { return 'current · retention 90d'; }, model: function () {
    return { value: 100, fmt: 'pct', sub: 'tool calls linked to receipts · ' + b('881') + ' linked', facts: [['Missing', '0'], ['Redacted', '7'], ['Retries', '1'], ['Errors', '3']], foot: 'Retention · 90d' };
  } });
  def('operations-window', 'tools', { meta: function () { return '24 hours · never token usage'; }, model: function () {
    return { rows: [{ name: 'CLI update', sub: 'Codex CLI · rolled back', value: '14:22', tone: 'warn', note: 'receipt ops-1' }, { name: 'Offline replay', sub: 'client outbox recovered', value: '12:06', note: '41 events' },
      { name: 'Server continuity', sub: 'Home Server kept running', value: '08:40', note: '3 jobs' }, { name: 'Project backup', sub: 'Project Vault snapshot', value: '03:15', note: 'verified' },
      { name: 'Environment check', sub: 'cluster and WSL reachable', value: '00:41', note: '2 hosts' }] };
  } });
  def('tool-allowance', 'tools', { meta: function () { return 'provider-bearing calls'; }, model: function () {
    var rows = [['browser_exec', 'Gemini vision helper route', 68, '68 calls', 'counts against API budget', 'warn'], ['run_shell_command', 'no provider usage', 284, '284 calls', 'local tool only'],
      ['read_file', 'context-bearing output', 412, '1.9M tok', 'affects context, not allowance'], ['image_gen', 'metered image generation', 18, '$3.62', 'separate billed surface', 'warn'], ['git', 'no provider usage', 71, '71 calls', 'local tool only']];
    return { rows: rows.map(function (r, i) { var sel = D.attempts().filter(function (a) { return a.tool_id === r[0]; }); return { id: r[0], name: r[0], role: r[1] + ' · ' + r[4], value: r[2], valueText: r[3], idx: i, tone: r[5] || null,
      hover: r[4] + ' · selected ' + sel.length + ' attempts · ' + F.tok(D.sum(sel.map(function (a) { return a.input_tokens + a.output_tokens; }))) + ' tokens · ' + (D.sum(sel.map(function (a) { return a.charge; })) > 0 ? money(D.sum(sel.map(function (a) { return a.charge; }))) + ' settled' : 'covered') }; }) };
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
    return { chart: 'line', spec: { x: x, unit: 'pct', unitTitle: '% HEALTHY', yMin: 90, yMax: 100, series: [{ name: 'Healthy readings', idx: 1, values: S.values }] }, headline: { value: S.values[n - 1], fmt: 'pct', label: 'healthy now' }, spark: { values: S.values, idx: 1 },
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
    return { rows: DATA.authority.map(function (r) { var est = /estimate/.test(r[1]); return { name: r[0], sub: r[1] + ' · ' + r[3], value: r[2], note: est ? 'derived reading' : 'direct authority', glyph: est ? 'pencil' : 'check', noteTone: est ? 'warn' : null }; }) };
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
})();
