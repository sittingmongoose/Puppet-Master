/* Chart gallery (owner: charts): a hidden review aid that renders every chart primitive in every state on the active
   theme, inside the Usage shell so the page's tokens apply. Open it with PM7_USAGE-independent PMU.charts.gallery()
   (toggle) or the URL flag ?usagegallery=1. Nothing on the page links to it; it adds no listener until opened.
   Sample values come from PMU_SERIES where a series exists; the rest are labelled gallery samples. */
(function () {
  var charts = PMU.charts, U = charts.util, H = charts.el;
  var HOUR = U.HOUR, DAY = U.DAY;
  var open = null;

  function series(path, fallback) {
    var node = typeof PMU_SERIES === 'object' ? PMU_SERIES : null;
    path.split('.').forEach(function (k) { node = node && node[k]; });
    return node || fallback;
  }
  function hours(n, end, step) { var out = []; for (var i = 0; i < n; i++) out.push(end - (n - i) * step); return out; }
  function wave(n, base, amp, phase) { var o = []; for (var i = 0; i < n; i++) o.push(Math.max(0, Math.round(base + amp * Math.sin((i + (phase || 0)) / 3.1) + amp * 0.4 * Math.cos(i / 1.7)))); return o; }

  function specimens() {
    var now = Date.now(), endH = Math.floor(now / HOUR) * HOUR + HOUR;
    var tk24 = series('tokens.24h', null) || { input: wave(24, 60000, 40000), output: wave(24, 55000, 30000, 2), reasoning: wave(24, 15000, 8000, 1), cacheWrite: wave(24, 20000, 12000, 3), cacheRead: wave(24, 380000, 200000) };
    var x24 = hours(24, endH, HOUR);
    var cost24 = tk24.input.map(function (v, i) { return i % 7 === 3 ? null : +(v * 0.000012 + tk24.output[i] * 0.00004).toFixed(2); });
    var tokSeries = [
      { name: 'Input', key: 'input', values: tk24.input }, { name: 'Output', key: 'output', values: tk24.output }, { name: 'Reasoning', key: 'reasoning', values: tk24.reasoning || wave(24, 15000, 8000, 1) },
      { name: 'Cache write', key: 'cacheWrite', values: tk24.cacheWrite }, { name: 'Cache read', key: 'cacheRead', values: tk24.cacheRead }];
    var spend = series('spendDaily30', null) || { values: wave(28, 7, 4), settled: wave(28, 1.4, 0.8), today: 28, days: 30 };
    var cum = []; spend.values.reduce(function (a, v) { var s = a + v; cum.push(+s.toFixed(2)); return s; }, 0);
    var heat = series('heat7x24.values', null) || (function () { var r = []; for (var d = 0; d < 7; d++) r.push(wave(24, 40000 + d * 5000, 38000, d)); return r; })();
    var outside = heat.map(function (row, r) { return row.map(function (v, h) { return r === 6 && h > new Date().getHours(); }); });
    var q1 = []; for (var i = 0; i < 42; i++) q1.push(i < 6 ? null : Math.min(100, 12 + (i - 6) * 3));
    var q2 = []; for (i = 0; i < 42; i++) q2.push(i < 20 ? 30 + i * 3.6 : i < 26 ? 100 : (i - 26) * 4);
    var q3 = []; for (i = 0; i < 42; i++) q3.push(i % 14 < 9 ? 20 + (i % 14) * 6 : null);
    var t0 = now - 7 * DAY;
    var pts = function (arr) { return arr.map(function (v, k) { return { t: t0 + k * 4 * HOUR, v: v, reset: k === 26 }; }); };
    var models = [
      { id: 'sonnet', name: 'claude-sonnet-4-6', providerId: 'claude-code', vendor: 'anthropic', v: [0.31, 4.1, 0.6, 0.9, 1.2], tok: 3800000 },
      { id: 'gpt5', name: 'gpt-5.1-codex', providerId: 'openai-codex', vendor: 'openai', v: [0.42, 2.2, 0.4, 0, 0.6], tok: 2100000 },
      { id: 'opus', name: 'claude-opus-4-5', providerId: 'claude-code', vendor: 'anthropic', v: [0.12, 1.6, 0.3, 0.4, 0.5], tok: 640000 },
      { id: 'qwen', name: 'qwen3-coder-plus', providerId: 'qwen-coding', vendor: 'alibaba', v: [0.08, 0.5, 0, 0, 0.1], tok: 410000 },
      { id: 'gem', name: 'gemini-2.5-pro', providerId: 'gemini-direct', vendor: 'google', v: [0.05, 0.3, 0.1, 0, 0.05], tok: 220000 },
      { id: 'kimi', name: 'kimi-k2', providerId: 'kimi-coding', vendor: 'moonshot', v: [0.01, 0.06, 0, 0, 0], tok: 41000 }];
    var maxV = Math.max.apply(null, models.map(function (m) { return m.v.reduce(function (a, b) { return a + b; }, 0); }));
    var totV = models.reduce(function (a, m) { return a + m.v.reduce(function (x, y) { return x + y; }, 0); }, 0);
    var types = ['in', 'out', 'rsn', 'cw', 'cr'];
    var stackRows = models.map(function (m) {
      var v = m.v.reduce(function (a, b) { return a + b; }, 0);
      return { id: m.id, name: m.name, providerId: m.providerId, vendor: m.vendor, fill: v / maxV, segments: types.map(function (tk, k) { return { type: tk, value: m.v[k], tokens: m.tok * [0.2, 0.15, 0.05, 0.1, 0.5][k] }; }),
        tokensText: PMU.fmt.tok(m.tok), valueText: PMU.fmt.money(v), shareText: (v / totV * 100).toFixed(1) + '%', attemptsText: '12 · 14 requests', hover: 'primary code · requested = effective' };
    });
    var shades = {};
    var donutSegs = models.map(function (m) { shades[m.vendor] = (shades[m.vendor] || 0) + 1; return { id: m.id, name: m.name, value: m.tok, vendor: m.vendor, shade: shades[m.vendor], prov: m.providerId }; });
    donutSegs.push({ id: 'x1', name: 'haiku-4-5', value: 9000, vendor: 'anthropic', shade: 3 }, { id: 'x2', name: 'gpt-5-mini', value: 7000, vendor: 'openai', shade: 2 });
    var stacks = [
      { providerId: 'claude-code', vendor: 'anthropic', name: 'Claude', settled: spend.values.map(function () { return 0; }), estimate: spend.values.map(function (v) { return +(v * 0.45).toFixed(2); }) },
      { providerId: 'openai-codex', vendor: 'openai', name: 'ChatGPT / Codex', settled: spend.values.map(function () { return 0; }), estimate: spend.values.map(function (v) { return +(v * 0.25).toFixed(2); }) },
      { providerId: 'gemini-direct', vendor: 'google', name: 'Gemini API', settled: spend.values.map(function (v) { return +(v * 0.18).toFixed(2); }), estimate: spend.values.map(function () { return 0; }) },
      { providerId: 'qwen-coding', vendor: 'alibaba', name: 'Qwen Coding Plan', settled: spend.values.map(function (v) { return +(v * 0.12).toFixed(2); }), estimate: spend.values.map(function () { return 0; }) }];
    var day0 = new Date(); day0.setHours(0, 0, 0, 0);
    var last14 = function (arr) { return arr.slice(-14); };
    var dayLabels = spend.values.map(function (v, k) { return charts.time.md(day0.getTime() - (spend.values.length - 1 - k) * DAY); });
    var meterBase = { notch: { at: 90 }, resetText: 'resets in 1h 42m' };
    return [
      { group: 'Meters (A1 6)', items: [
        { title: 'Comfortable, calm', w: 220, kind: 'meter', spec: Object.assign({ pct: 54, label: 'Weekly', amount: '105 / 300 requests' }, meterBase) },
        { title: 'Warn', w: 220, kind: 'meter', spec: Object.assign({ pct: 84, label: '5-hour', resetSoon: true, resetText: 'resets in 42m' }, { notch: { at: 90 } }) },
        { title: 'Crit', w: 220, kind: 'meter', spec: Object.assign({ pct: 93, label: '5-hour' }, meterBase) },
        { title: 'Exhausted', w: 220, kind: 'meter', spec: { pct: 100, label: 'Weekly', notch: { at: 90, faint: true }, resetText: 'reset unknown' } },
        { title: 'Over a budget', w: 220, kind: 'meter', spec: { pct: 118, label: 'Monthly budget', resetText: 'resets Oct 1', amount: '$59 / $50' } },
        { title: 'Missing: not exposed', w: 220, kind: 'meter', spec: { pct: null, vs: 'not_exposed', label: '5-hour' } },
        { title: 'Stale (cached 3h)', w: 220, kind: 'meter', spec: { pct: 61, stale: true, label: 'Weekly', notch: { at: 90, faint: true }, resetText: '≈ resets Thu 03:06' } },
        { title: 'Estimated', w: 220, kind: 'meter', spec: { pct: 47, estimated: true, label: 'Monthly budget', resetText: 'resets Oct 1' } },
        { title: 'Notch off (auto-switch off)', w: 220, kind: 'meter', spec: { pct: 38, label: 'Weekly', notch: { at: 90, off: true }, resetText: 'resets Mon 03:06' } },
        { title: 'Compact cells', w: 120, kind: 'meter', spec: { pct: 78, size: 'k', label: '5-hour', notch: { at: 90 }, resetText: 'in 1h 42m' } },
        { title: 'Compact, crit', w: 120, kind: 'meter', spec: { pct: 96, size: 'k', label: 'Weekly', notch: { at: 90 }, resetText: 'in 6d 20h' } },
        { title: 'Inline (single plate)', w: 240, kind: 'meter', spec: { pct: 52, size: 'i', label: 'Weekly window', notch: { at: 90 }, resetText: 'resets Sun 03:06', amount: '52 / 100' } },
        { title: 'Headroom (most room now)', w: 130, kind: 'headroom', spec: { pct: 69, label: 'Lab' } }
      ] },
      { group: 'Usage trend (A1 7.2)', items: [
        { title: 'Dual axis: tokens and estimated cost', w: 760, h: 300, kind: 'area', spec: { x: x24, bucketMs: HOUR, unit: 'tokens', series: tokSeries, cost: { values: cost24, unit: 'usd' }, now: now, source: 'provider reported tokens · PM estimate value' } },
        { title: 'Token types (split)', w: 520, h: 260, kind: 'area', spec: { x: x24, bucketMs: HOUR, unit: 'tokens', series: tokSeries, cost: { values: cost24, unit: 'usd' }, split: true, cacheReads: true } },
        { title: 'Compact (xs/s)', w: 160, h: 64, kind: 'area', spec: { x: x24, bucketMs: HOUR, unit: 'tokens', series: tokSeries } },
        { title: 'Empty range', w: 300, h: 160, kind: 'area', spec: { series: [], emptyText: 'No Claude activity in this range.' } }
      ] },
      { group: 'Lines (7.11)', items: [
        { title: 'Anomaly vs baseline, limit rule', w: 420, h: 220, kind: 'line', spec: { x: x24, bucketMs: HOUR, unit: 'count', series: [{ name: 'Requests', idx: 0, values: wave(24, 40, 22), area: true }, { name: 'Baseline', idx: 7, role: 'baseline', values: wave(24, 36, 6, 5) }],
          limits: [{ value: 75, label: 'Alert at 75 requests', role: 'warn' }] } },
        { title: 'Percent with switch and warn, gaps', w: 420, h: 220, kind: 'line', spec: { x: x24, bucketMs: HOUR, unit: 'pct', series: [{ name: 'Claude weekly', idx: 0, values: x24.map(function (_, k) { return k > 15 && k < 18 ? null : 20 + k * 2.6; }) }, { name: 'Codex weekly', idx: 1, values: x24.map(function (_, k) { return 10 + k * 1.4; }) }],
          limits: [{ value: 80, label: 'Warn at 80% used · Settings', role: 'warn' }, { value: 90, label: 'Switch at 90% used · Settings', role: 'switch' }] } },
        { title: 'Forecast with a confidence band', w: 420, h: 220, kind: 'line', spec: { x: x24, bucketMs: HOUR, unit: 'usd', series: [{ name: 'Spend', idx: 0, values: x24.map(function (_, k) { return k < 16 ? +(k * 0.9 + Math.sin(k) * 0.6).toFixed(2) : null; }) }],
          forecast: { from: 16, values: [14.6, 15.4, 16.1, 17.0, 17.8, 18.5, 19.3, 20.1], band: [[14.6, 15.0, 15.4, 15.9, 16.3, 16.6, 17.0, 17.4], [14.6, 15.8, 16.9, 18.1, 19.3, 20.4, 21.6, 22.8]], label: 'Projection · PM estimate' } } }
      ] },
      { group: 'Columns (A1 7.8, 7.11)', items: [
        { title: 'Daily spend (zero day, latest bold, caption)', w: 520, h: 220, kind: 'columns', spec: { labels: last14(dayLabels), values: last14(spend.values), est: last14(spend.values).map(function (v) { return +(v * 0.6).toFixed(2); }), idx: 0, unit: 'usd',
          caption: 'Today $1.53 · 7 days $63.40 · 30 days $184.62', states: last14(spend.values).map(function (v, k) { return k === 4 ? 'hidden_subscription' : null; }).map(function (s, k) { return s; }) } },
        { title: 'Daily cost by provider (stacked)', w: 620, h: 240, kind: 'columns', spec: { labels: last14(dayLabels), stacks: stacks.map(function (s) { return { providerId: s.providerId, vendor: s.vendor, name: s.name, settled: last14(s.settled), estimate: last14(s.estimate) }; }), unit: 'usd' } },
        { title: 'Narrow, no axis', w: 200, h: 140, kind: 'columns', spec: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], values: [3.1, 4.4, 0, 2.2, 5.9], idx: 1, unit: 'usd' } }
      ] },
      { group: 'Sparks, budget, heat', items: [
        { title: 'Sparks', w: 140, h: 28, kind: 'spark', spec: { values: wave(30, 10, 6), idx: 0 } },
        { title: 'Spark by token type', w: 140, h: 28, kind: 'spark', spec: { values: wave(30, 10, 6, 4), tk: 'cr' } },
        { title: 'Spark by vendor', w: 140, h: 28, kind: 'spark', spec: { values: wave(30, 10, 6, 2), vendor: 'anthropic' } },
        { title: 'Budget with projection', w: 460, h: 220, kind: 'budget', spec: { days: spend.days || 30, today: spend.today || 28, cumulative: cum, projection: { to: 201.3, lo: 195.4, hi: 208.9, label: 'PM estimate · local-time pace · 87% confidence' }, budget: 250 } },
        { title: 'Budget, none set', w: 300, h: 180, kind: 'budget', spec: { days: 30, today: 28, cumulative: cum, projection: { to: 201.3, lo: 195.4, hi: 208.9 }, budget: 0 } },
        { title: 'Weekday x hour', w: 640, h: 260, kind: 'heat', spec: { rows: ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'], cols: 24, values: heat, outside: outside, unit: 'tokens' } }
      ] },
      { group: 'Quota history (A1 7.9)', items: [
        { title: 'Row: calm rising into warn', w: 360, h: 24, kind: 'qspark', spec: { points: q1 } },
        { title: 'Row: exhausted, reset, calm again', w: 360, h: 24, kind: 'qspark', spec: { points: q2, resets: [26] } },
        { title: 'Row: gaps (not ok)', w: 360, h: 24, kind: 'qspark', spec: { points: q3 } },
        { title: 'Focus chart (every window)', w: 620, h: 230, kind: 'qspark', spec: { windows: [{ label: 'Weekly', points: pts(q2) }, { label: '5-hour', points: pts(q1.map(function (v, k) { return v == null ? null : (v * 1.7) % 100; })) }],
          thresholds: { warn: 80, switch: 90 }, resets: [t0 + 26 * 4 * HOUR], now: now, t0: t0, t1: now } }
      ] },
      { group: 'Bars, mixes and lists', items: [
        { title: 'Ranked (provider value, estimate hatched)', w: 340, kind: 'ranked', spec: { rows: [
          { id: 'c', name: 'Claude', role: 'plan estimate', value: 96.2, est: 96.2, valueText: '$96.20', share: 52, vendor: 'anthropic', prov: 'claude-code', mark: 'claude-code' },
          { id: 'x', name: 'ChatGPT / Codex', role: 'plan estimate', value: 49.7, est: 30, valueText: '$49.70', share: 27, vendor: 'openai', prov: 'openai-codex', mark: 'openai-codex' },
          { id: 'g', name: 'Gemini API', role: 'settled', value: 22.1, valueText: '$22.10', share: 12, vendor: 'google', prov: 'gemini-direct', mark: 'gemini-direct' },
          { id: 'q', name: 'Qwen Coding Plan', role: 'settled', value: 16.6, valueText: '$16.60', share: 9, vendor: 'alibaba', prov: 'qwen-coding', mark: 'qwen-coding' },
          { id: 'u', name: 'Kimi Code', value: null, vs: 'not_exposed', vendor: 'moonshot' }] } },
        { title: 'Ranked inline (narrow)', w: 220, kind: 'ranked', spec: { inline: true, rows: [{ id: 'a', name: 'Read', value: 41, idx: 0 }, { id: 'b', name: 'Edit', value: 28, idx: 1 }, { id: 'c', name: 'Bash', value: 12, idx: 2 }] } },
        { title: 'Mix (value kinds)', w: 340, kind: 'mix', spec: { unit: 'usd', legend: 'rows', segments: [{ name: 'Settled API', value: 38.74, idx: 1 }, { name: 'Plan estimate', value: 145.88, idx: 0, est: true }, { name: 'Pending', value: 4.2, idx: 2 }] } },
        { title: 'Split (cache)', w: 340, kind: 'split', spec: { parts: [{ name: 'Reads', value: 5400000, token: 'cr' }, { name: 'Writes', value: 347000, token: 'cw' }] } },
        { title: 'Tool latency (p50 to p95)', w: 380, kind: 'rangebars', spec: { rows: [{ name: 'Read', p50: 0.21, p95: 0.9, calls: 412 }, { name: 'Edit', p50: 0.4, p95: 1.8, calls: 233 }, { name: 'Bash', p50: 1.2, p95: 9.5, calls: 120, errors: 3 }, { name: 'WebFetch', p50: 2.8, p95: 21, calls: 14 }] } }
      ] },
      { group: 'Rings, donut, tables (A1 7.3 to 7.6)', items: [
        { title: 'Cache read share ring', w: 140, h: 130, kind: 'ring', spec: { value: 96.8, max: 100, centre: '96.8%', centreValue: 96.8, centreFmt: function (v) { return v.toFixed(1) + '%'; }, caption: 'read share', token: 'cr', size: 120 } },
        { title: 'Context ring (families)', w: 140, h: 130, kind: 'ring', spec: { segments: [{ name: 'Messages', value: 18000, idx: 0 }, { name: 'Instructions', value: 9000, idx: 1 }, { name: 'Tools', value: 7000, idx: 2 }, { name: 'Skills', value: 4000, idx: 3 }, { name: 'Reserved output', value: 8000, idx: 7, hatched: true }], limit: 128000, centre: '36%', caption: '46.2k / 128k', size: 120 } },
        { title: 'Gauge (tool health)', w: 110, h: 100, kind: 'gauge', spec: { value: 99.7, max: 100, centre: '99.7%', idx: 1, size: 84 } },
        { title: 'Cost by model (wide)', w: 760, kind: 'stackbar', spec: { rows: stackRows } },
        { title: 'Cost by model (narrow, two-line rows)', w: 300, kind: 'stackbar', spec: { rows: stackRows.slice(0, 4) } },
        { title: 'Model usage donut (side)', w: 520, kind: 'donut', spec: { segments: donutSegs, centre: { value: PMU.fmt.tok(donutSegs.reduce(function (a, s) { return a + s.value; }, 0)), caption: 'tokens, all models' }, mode: 'tokens' } },
        { title: 'Donut (stacked, cost)', w: 300, kind: 'donut', spec: { segments: models.map(function (m, k) { return { id: m.id, name: m.name, value: m.v.reduce(function (a, b) { return a + b; }, 0), vendor: m.vendor, shade: k > 1 && m.vendor === 'anthropic' ? 2 : 1 }; }), centre: { value: PMU.fmt.money(totV), caption: 'estimated cost' }, mode: 'cost' } },
        { title: 'Token breakdown', w: 520, h: 230, kind: 'sharebars', spec: { rows: [
          { type: 'in', name: 'Input', tokens: 1180000, tokenShare: 15.3, value: 9.71, valueShare: 45 }, { type: 'out', name: 'Output', tokens: 474000, tokenShare: 6.1, value: 7.11, valueShare: 32.9 },
          { type: 'rsn', name: 'Reasoning', tokens: 62500, tokenShare: 0.8, value: 0.94, valueShare: 4.4 }, { type: 'cw', name: 'Cache write', tokens: 347000, tokenShare: 4.5, value: 1.3, valueShare: 6 },
          { type: 'cr', name: 'Cache read', tokens: 5400000, tokenShare: 73.3, value: 2.53, valueShare: 11.7 }, { type: 'unknown', name: 'Unknown', vs: 'unknown', vsWord: '4 events · not zero' }] } },
        { title: 'Token breakdown (narrow)', w: 300, h: 230, kind: 'sharebars', spec: { rows: [
          { type: 'in', name: 'Input', tokens: 1180000, tokenShare: 15.3, value: 9.71, valueShare: 45 }, { type: 'out', name: 'Output', tokens: 474000, tokenShare: 6.1, value: 7.11, valueShare: 32.9 },
          { type: 'cr', name: 'Cache read', tokens: 5400000, tokenShare: 73.3, value: 2.53, valueShare: 11.7 }] } }
      ] },
      { group: 'KPI values, legends and value states', items: [
        { title: 'KPI with delta', w: 190, kind: 'kpi', spec: { value: 2860000, fmt: PMU.fmt.tok, delta: { text: '+1.8%', dir: 'up', tone: 'ok' }, sub: '<b>2.39M</b> in · <b>474k</b> out · 184 calls' } },
        { title: 'KPI money, narrow', w: 140, kind: 'kpi', spec: { value: 184.62, fmt: PMU.fmt.money, delta: { text: '+4.1%', dir: 'up', tone: 'warn' }, sub: '<b>$38.74</b> settled' } },
        { title: 'KPI missing', w: 190, kind: 'kpi', spec: { value: null, vs: 'not_exposed', sub: 'Kimi Code exposes no token counts' } },
        { title: 'Legend swatches', w: 520, kind: 'legend' },
        { title: 'Value states', w: 520, kind: 'states' }
      ] }
    ];
  }

  function build(root) {
    var made = [];
    var body = root.querySelector('.pmu-gal-body');
    body.innerHTML = '';
    specimens().forEach(function (grp) {
      var sec = H('section', 'pmu-gal-group', body);
      H('h3', 'pmu-gal-gh', sec).textContent = grp.group;
      var row = H('div', 'pmu-gal-row', sec);
      grp.items.forEach(function (it) {
        var card = H('div', 'pmu-gal-card', row);
        card.style.width = (it.w + 28) + 'px';
        H('div', 'pmu-gal-t', card).textContent = it.title;
        var host = H('div', 'pmu-gal-host', card);
        host.style.width = it.w + 'px';
        if (it.h) host.style.height = it.h + 'px';
        if (it.kind === 'legend') {
          charts.legend(host, [{ name: 'Input', tk: 'in' }, { name: 'Output', tk: 'out' }, { name: 'Tokens without cache reads', tk: 'all', qual: 'left axis' }, { name: 'Estimated cost', idx: 'ink', swatch: 'line', qual: 'right axis, USD' },
            { name: 'Cache tokens', swatch: 'half', parts: [{ tk: 'cw' }, { tk: 'cr' }] }, { name: 'Share of tokens', tk: 'in', swatch: 'soft' }, { name: 'Projection', idx: 0, swatch: 'dash' }, { name: 'Plan estimate', idx: 0, swatch: 'hatch' }, { name: 'Claude', vendor: 'anthropic' }], { onToggle: function () {} });
          return;
        }
        if (it.kind === 'states') {
          host.innerHTML = '<div class="pmu-gal-states">' + Object.keys(PMU.vs.STATES).map(function (k) { return PMU.vs.html(k); }).join('') + '</div>';
          return;
        }
        var c = charts[it.kind](host, it.spec, { enter: false, label: it.title, onRow: function () {} });
        made.push(c);
      });
    });
    return made;
  }
  function play(made) {
    made.forEach(function (c, i) { c._entered = false; c.enter(160 + Math.min(480, i * 32)); });
  }

  charts.gallery = function (show) {
    var app = document.getElementById('pmuApp');
    if (!app) return false;
    if (open && show !== true) { open.made.forEach(function (c) { c.destroy(); }); open.root.remove(); open = null; return false; }
    if (open) return true;
    var root = H('div', 'pmu-gallery', app);
    root.setAttribute('data-pmu-gallery', '1');
    root.innerHTML = '<header class="pmu-gal-head"><div><h2>' + esc(t('charts.gallery_title')) + '</h2><p>' + esc(t('charts.gallery_sub')) + ' · ' + esc(PMU.theme.look().slug + (PMU.theme.look().nier ? ' · NieR' : '')) + '</p></div>' +
      '<div class="pmu-gal-tools"><button type="button" class="pmu-gal-btn" data-act="replay">' + esc(t('charts.gallery_replay')) + '</button><button type="button" class="pmu-gal-btn" data-act="close">' + esc(t('charts.gallery_close')) + '</button></div></header>' +
      '<div class="pmu-gal-body"></div>';
    var made = build(root);
    open = { root: root, made: made };
    play(made);
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.getAttribute('data-act') === 'close') charts.gallery(false);
      else { open.made.forEach(function (c) { c.destroy(); }); open.made = build(root); play(open.made); }
    });
    return true;
  };
  charts.galleryOpen = function () { return !!open; };

  if (/[?&]usagegallery=1\b/.test(location.search)) {
    var boot = function () {
      if (window.PM_PAGES && typeof window.PM_PAGES.go === 'function') { try { window.PM_PAGES.go('usage'); } catch (error) { /* page routing not ready */ } }
      setTimeout(function () { charts.gallery(true); }, 600);
    };
    if (document.readyState === 'complete') setTimeout(boot, 1200); else window.addEventListener('load', function () { setTimeout(boot, 1200); }, { once: true });
  }
})();
