/* The Artifact viewer kind (D9; CONTRACT section 2; digest 05 section 5). One tab per artifact: the chat's bare ids
   (dashboard-query, mermaid-runtime, ...) opened with kind 'artifact', the panels' own artifact:<id> and
   artifact:<id>@v<n>, and the chat's versioned route artifact-revision:<encoded JSON>. Every subtype draws from the
   artifact's payload (the plan's numbers), never from hard-coded figures: dashboard and chart (HTML columns with a
   target line, horizontal bars when the body is narrow, a line for the forecast), the data table (sortable,
   filterable), three diagrams drawn as SVG boxes and arrows (a mermaid flowchart, the host map, the approval flow),
   the quiz, the capability table, a generated image stand-in, test evidence with drawn pass marks, reports and code,
   plus the stale, error and loading states. The shared header row carries the Fit / Source toggle, Versions, Open in
   new panel and More; the meta row is plain text, never pills. Sizes key on the tab body (@container pmw-body). */

var SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, attrs, kids) {
  var el = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  return add(el, kids);
}
function add(el, kids) {
  if (kids == null || kids === false) return el;
  if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) add(el, kids[i]); return el; }
  el.appendChild(typeof kids === 'string' || typeof kids === 'number' ? document.createTextNode(String(kids)) : kids);
  return el;
}
function sv(tag, attrs, kids) {
  var el = document.createElementNS(SVGNS, tag);
  for (var k in (attrs || {})) if (attrs[k] != null) el.setAttribute(k, String(attrs[k]));
  return add(el, kids);
}
function num(v, dp) {
  if (v == null) return 'not reported';
  return Number(v).toLocaleString('en-US', { maximumFractionDigits: dp == null ? 1 : dp });
}

/* small drawn marks (never emoji): pass, open, fail, miss, cond */
function mark(kind, label) {
  var s = sv('svg', { viewBox: '0 0 16 16', width: 14, height: 14, class: 'pmw-art-mark is-' + kind, 'aria-hidden': label ? null : 'true', role: label ? 'img' : null, 'aria-label': label || null });
  if (kind === 'pass') add(s, [sv('circle', { cx: 8, cy: 8, r: 6.4 }), sv('path', { d: 'M5 8.3l2 2 4-4.4' })]);
  else if (kind === 'open') add(s, [sv('circle', { cx: 8, cy: 8, r: 6.4 }), sv('path', { d: 'M8 4.6V8.4M8 11v.1' })]);
  else if (kind === 'fail') add(s, [sv('circle', { cx: 8, cy: 8, r: 6.4 }), sv('path', { d: 'M5.7 5.7l4.6 4.6M10.3 5.7l-4.6 4.6' })]);
  else if (kind === 'miss') add(s, [sv('circle', { cx: 8, cy: 8, r: 6.4 }), sv('path', { d: 'M5 8h6' })]);
  else if (kind === 'cond') add(s, [sv('circle', { cx: 8, cy: 8, r: 6.4 }), sv('path', { d: 'M8 1.6a6.4 6.4 0 0 1 0 12.8z', class: 'is-fill' })]);
  return s;
}

/* ---- the demo artifacts (the chat's data.js payloads; titles and copy kept plain) ---- */
var THREADS = { query: 'Query performance', plain: 'Product design discussion', subagents: 'Architecture review', debug: 'Investigate a browser issue',
  context: 'Focus a conversation', 'plan-deep': 'Deep Plan', crew: 'Crew and shared work', route: 'Provider route change', visuals: 'Working with artifacts' };
var KIND_WORD = { dashboard: 'dashboard', chart: 'chart', data: 'data table', mermaid: 'diagram', architecture: 'architecture map', flowchart: 'flowchart',
  quiz: 'quiz', periodic: 'capability table', image: 'image', evidence: 'test evidence', document: 'report', code: 'code' };
var STATUS_WORD = { ready: 'Ready', stale: 'Stale', error: 'Needs retry', loading: 'Rendering' };
var VISUAL = { mermaid: 1, architecture: 1, flowchart: 1, image: 1 };

var ART = {
  'dashboard-query': { kind: 'dashboard', title: 'Query Benchmark Dashboard', status: 'ready', version: 6, updated: '1m ago', thread: 'query',
    path: 'artifacts/query-benchmark.json', summary: 'p50, p95, throughput, cache-hit and write-cost comparison for the tenant-scoped read path.',
    revisions: { 1: 'Baseline only: p50 and p95 before any change.', 2: 'Added the index-only run.', 3: 'Corrected the fixture to 128,400 rows.',
      4: 'Added the throughput and cache-hit tiles.', 5: 'Added the index plus batching run.', 6: 'Added write cost, measured at 4.8 %.' },
    payload: { metric: 'p95 read latency', unit: 'ms',
      series: [{ label: 'Baseline', value: 482 }, { label: 'Index only', value: 118 }, { label: 'Index + batching', value: 71 }, { label: 'Target', value: 100 }],
      secondary: [{ label: 'p50 read', before: 118, after: 24, unit: 'ms' }, { label: 'Throughput', before: 1420, after: 3980, unit: 'rows/s' },
        { label: 'Cache hit', before: 41, after: 78, unit: '%' }, { label: 'Write cost', before: 0, after: 4.8, unit: '%' }] } },
  'mermaid-runtime': { kind: 'mermaid', title: 'How an Assistant Turn Flows', status: 'ready', version: 2, updated: '8m ago', thread: 'visuals',
    path: 'docs/diagrams/assistant-turn.mmd', summary: 'From your message to the activity the chat shows: routing, the provider, and what the turn produces.',
    revisions: { 1: 'First drawing: composer to provider.', 2: 'Added the activity projection and its five outputs.' },
    payload: { source: ['flowchart TD', '  U[User turn] --> C[Composer]', '  C --> R{Route}', '  R -->|configured account| P[Provider]',
      '  R -->|no eligible account| W[Warning receipt]', '  P --> A[Assistant turn]', '  A --> AP[Activity projection]', '  AP --> G[Goal]',
      '  AP --> T[Todo]', '  AP --> S[Subagents]', '  AP --> D[Changes]', '  AP --> F[Artifacts]', '  S --> S1[Child thread]', '  S1 --> AP',
      '  D --> E[Editor]', '  F --> E'].join('\n') } },
  'render-forecast': { kind: 'chart', title: 'Context Growth Forecast', status: 'loading', version: 1, updated: 'now', thread: 'context',
    path: 'artifacts/context-forecast.json', summary: 'Projected window use for the next twelve turns at the current growth rate.',
    loading: { label: 'Rendering forecast', etaMs: 2400, progress: 0.4 },
    payload: { metric: 'Projected window use', unit: 'tokens', line: true,
      series: [{ label: 'Turn +2', value: 91200 }, { label: 'Turn +4', value: 99800 }, { label: 'Turn +6', value: 108400 },
        { label: 'Turn +8', value: 117900 }, { label: 'Turn +10', value: 126100 }, { label: 'Turn +12', value: 131000 }] } },
  'test-evidence': { kind: 'evidence', title: 'Browser Test Evidence', status: 'ready', version: 5, updated: '11m ago', thread: 'debug',
    path: 'verification/evidence/2026-08-24.json', summary: 'Browser, console, network, screenshot and benchmark evidence, grouped by acceptance gate.',
    payload: { gates: [{ name: 'Interaction probes', passed: 14, total: 14 }, { name: 'Painted-pixel assertions', passed: 9, total: 9 },
      { name: 'Theme sweep', passed: 8, total: 8 }, { name: 'Reduced motion', passed: 6, total: 7 }, { name: 'Console cleanliness', passed: 3, total: 3 }],
      log: ['Opened the dashboard at 1440 x 900 from the local file', 'Captured p50 and p95 traces across 3 reloads', 'No console errors and no page errors',
        { text: 'One reduced-motion gate is still open: the sonar take keeps a named loop', open: true }, 'Screenshots stored beside this record, not inlined'] } },
  'data-explorer': { kind: 'data', title: 'Trace Data Explorer', status: 'ready', version: 2, updated: '17m ago', thread: 'debug',
    path: 'artifacts/traces.csv', summary: 'Query traces with duration, tenant, route, cache and plan.',
    payload: { columns: ['Trace', 'Tenant', 'Route', 'Duration', 'Cache', 'Plan'],
      rows: [['tr-8841', 'acme', 'events_for', '71 ms', 'hit', 'idx_events_tenant_created'], ['tr-8842', 'acme', 'events_for', '68 ms', 'hit', 'idx_events_tenant_created'],
        ['tr-8843', 'northwind', 'events_for', '112 ms', 'miss', 'idx_events_tenant_created'], ['tr-8844', 'northwind', 'rollup_hourly', '482 ms', 'miss', 'seq scan (removed)'],
        ['tr-8845', 'globex', 'events_for', '24 ms', 'hit', 'idx_events_tenant_created'], ['tr-8846', 'globex', 'events_for', null, null, null]],
      note: 'One trace did not report its timing, cache or plan. It shows as not reported, never as zero.' } },
  'architecture-map': { kind: 'architecture', title: 'Puppet Master Host Map', status: 'ready', version: 3, updated: '23m ago', thread: 'subagents',
    path: 'docs/diagrams/hosts.json', summary: 'The server, the machines it hands work to, the desktop client and the providers it calls.',
    payload: { nodes: [{ id: 'server', label: 'Puppet Master server', role: 'Server', host: 'TrueNAS Docker' }, { id: 'win', label: 'Windows host', role: 'Host', host: 'Windows' },
      { id: 'wsl', label: 'Windows WSL host', role: 'Host', host: 'WSL' }, { id: 'linux', label: 'Linux container host', role: 'Host', host: 'Linux container' },
      { id: 'client-a', label: 'Desktop client', role: 'Client', host: 'macOS' }, { id: 'anthropic', label: 'Anthropic', role: 'Provider', host: '2 accounts' },
      { id: 'alibaba', label: 'Alibaba', role: 'Provider', host: '2 accounts' }],
      edges: [['client-a', 'server'], ['server', 'win'], ['server', 'wsl'], ['server', 'linux'], ['server', 'anthropic'], ['server', 'alibaba']] } },
  'report-query': { kind: 'document', title: 'Query Optimization Report', status: 'stale', version: 2, updated: '46m ago', thread: 'query',
    path: 'docs/query-performance.md', summary: 'Findings, changes, benchmark evidence, risks and rollback for the tenant-scoped read path.',
    staleReason: 'Written before revision 4 split the concurrent index into its own migration.',
    payload: { wordCount: 1840, lastAuthor: 'Claude Opus 5', sections: [
      ['Findings', 'Every analytics read filters by tenant first, but the events table had no index that starts with tenant_id, so the planner fell back to a sequential scan of the hourly rollup. Two call sites also fetched events one row at a time.'],
      ['Changes', 'Added idx_events_tenant_created on (tenant_id, created_at) as a concurrent migration, and replaced the two per-row lookups with one batched, tenant-first query.'],
      ['Benchmark evidence', 'At production row shape (214 tenants, 128,400 rows) p95 read latency fell from 482 ms to 71 ms and p50 from 118 ms to 24 ms. Throughput rose from 1,420 to 3,980 rows a second. Write cost is 4.8 %, under the 8 % limit.'],
      ['Risks', 'The concurrent build takes two table passes and cannot run inside a transaction block. A tenant with very few rows may still get a sequential scan, which is fine at that size.'],
      ['Rollback', 'Drop the index concurrently and restore the per-row query behind its flag. The rollback is rehearsed against a restored snapshot before the forward migration ships.']] } },
  'flow-plan': { kind: 'flowchart', title: 'Plan Approval Flow', status: 'ready', version: 2, updated: '52m ago', thread: 'plan-deep',
    path: 'docs/diagrams/plan-approval.json', summary: 'What happens to a plan after it is drafted: review, revise, approve, build now or later, or cancel.',
    payload: { nodes: [{ id: 'draft', label: 'Plan drafted' }, { id: 'review', label: 'Awaiting review' }, { id: 'revise', label: 'Revision requested' },
      { id: 'approved', label: 'Approved' }, { id: 'build', label: 'Building' }, { id: 'later', label: 'Approved, build later' }, { id: 'cancel', label: 'Cancelled', quiet: true }],
      edges: [['draft', 'review'], ['review', 'revise'], ['revise', 'review'], ['review', 'approved'], ['approved', 'build'], ['approved', 'later'], ['later', 'build'], ['review', 'cancel']] } },
  'chart-cost': { kind: 'chart', title: 'Provider Cost and Latency', status: 'ready', version: 2, updated: '1h ago', thread: 'route',
    path: 'artifacts/provider-cost.json', summary: 'Cost per million output tokens across the configured accounts.',
    payload: { metric: 'Cost per 1M output tokens', unit: 'USD', money: true,
      series: [{ label: 'Claude Sonnet 4.6', value: 15 }, { label: 'Claude Opus 5', value: 75 }, { label: 'Qwen 3.8', value: 2.2 }, { label: 'Kimi K3', value: 2.5 },
        { label: 'GLM 5.2', value: 1.9 }, { label: 'Cursor Auto', value: null }],
      note: 'Cursor Auto bills against a seat, not per token: its value is unknown, not zero.' } },
  'quiz-indexes': { kind: 'quiz', title: 'Index Strategy Quiz', status: 'ready', version: 1, updated: '1h ago', thread: 'query',
    path: 'artifacts/index-quiz.json', summary: 'Three questions on leading columns, building an index without a lock, and write cost.',
    payload: { questions: [
      { q: 'Which column leads the composite index?', a: 'tenant_id', choices: ['created_at', 'tenant_id', 'event_type'], why: 'Every analytics read is tenant-scoped, so it is the most selective equality filter.' },
      { q: 'What does building the index CONCURRENTLY cost?', a: 'Two table passes and no transaction block', choices: ['A lock on the table for the whole build', 'Two table passes and no transaction block', 'Nothing extra'], why: 'That is why the migration is split into its own file.' },
      { q: 'What is the write cost of this index?', a: '+4.8%', choices: ['+0.5%', '+4.8%', '+12%'], why: 'Measured, not estimated, on the corrected 128,400-row fixture.' }] } },
  'periodic-capabilities': { kind: 'periodic', title: 'Agent Capability Matrix', status: 'ready', version: 3, updated: '2h ago', thread: 'subagents',
    path: 'artifacts/capability-matrix.json', summary: 'Each model as one cell: how many tools it can use, what it is best at, its cost tier and whether it is qualified here.',
    payload: { columns: ['Model', 'Tools', 'Specialty', 'Cost tier', 'Qualified'],
      rows: [['Claude Sonnet 4.6', '14', 'Implementation', 'Mid', 'yes'], ['Claude Opus 5', '14', 'Review and planning', 'High', 'yes'], ['Qwen 3.8', '11', 'Bulk refactor', 'Low', 'yes'],
        ['Kimi K3', '11', 'Browser control', 'Low', 'yes'], ['GLM 5.2', '9', 'Summarization', 'Low', 'conditional'], ['Cursor Auto', '6', 'Inline edits', 'Seat', 'no']] } },
  'generated-image': { kind: 'image', title: 'Generated Operations Console', status: 'ready', version: 1, updated: '2h ago', thread: 'visuals',
    path: 'artifacts/ops-console.png', summary: 'A generated interface image: compact in the chat, full size here.',
    payload: { width: 1280, height: 720, alt: 'A drawn operations console with a run list, a host panel and a receipt column.' } },
  'transcript-summary': { kind: 'document', title: 'Design Discussion Summary', status: 'ready', version: 7, updated: '3h ago', thread: 'plain',
    path: 'docs/notes/design-discussion.md', summary: 'A rolling summary of the long product-design thread, rewritten after each turn that changes something.',
    payload: { wordCount: 620, lastAuthor: 'Claude Sonnet 4.6', sections: [
      ['What was decided', 'Onboarding starts with progressive disclosure: people see three things first and the rest arrives when they need it. The resume nudge is louder than a banner.'],
      ['What is still open', 'Whether a short guided checklist, under five steps, replaces the nudge for new teams. Growth wants a trial; Design Systems points at the four new components it needs.'],
      ['What was rejected and why', 'Skip-by-default with only a banner. It measured better in the first session and worse in week-two retention in every dataset the team could cite.']] } },
  'lens-receipt': { kind: 'evidence', title: 'Context Lens Receipts', status: 'ready', version: 3, updated: '4h ago', thread: 'context',
    path: 'verification/lens-operations.json', summary: 'Every Mute, Focus and Subcompact with its cap, its sources and how to bring the messages back.',
    payload: { gates: [{ name: 'Operations under the 25-message cap', passed: 3, total: 3 }, { name: 'A way back for every operation', passed: 3, total: 3 }, { name: 'Sources kept', passed: 3, total: 3 }],
      log: ['Focus applied to 6 messages, cap 25 (operation 1)', 'Mute applied to 11 messages, cap 25 (operation 2)', 'Subcompact applied to 9 messages, cap 25 (operation 3); summary card written'] } },
  'crew-board': { kind: 'dashboard', title: 'Crew Assignment Board', status: 'stale', version: 2, updated: '5h ago', thread: 'crew',
    path: 'artifacts/crew-board.json', summary: 'How busy each role in the Crew is.', staleReason: 'The reviewer role was reassigned after this board was written.',
    payload: { metric: 'Crew utilisation', unit: '%', series: [{ label: 'Planner', value: 100 }, { label: 'Implementer', value: 82 }, { label: 'Reviewer', value: 0 }, { label: 'Browser auditor', value: 44 }] } },
  'broken-viz': { kind: 'dashboard', title: 'Usage Projection Dashboard', status: 'error', version: 1, updated: '6h ago', thread: 'visuals',
    path: 'artifacts/usage-projection.json', summary: 'Projected monthly use.',
    error: { reason: 'The chart received a series with no points and would not draw an empty chart.', retryLabel: 'Retry render', recovers: false,
      detail: 'The source is intact; only the drawing failed. Retrying reads the same source again.' },
    payload: { metric: 'Projected monthly usage', unit: 'tokens', series: [] } },
  'chart-latency': { kind: 'chart', title: 'Route Latency Comparison', status: 'error', version: 2, updated: '7h ago', thread: 'route',
    path: 'artifacts/route-latency.json', summary: 'First-token latency for each account on the configured routes.',
    error: { reason: 'Two accounts offer the same model name, so the earlier drawing merged them into one series.', retryLabel: 'Retry with account keys', recovers: true,
      detail: 'Retrying keys each series on provider and account instead of the model name.' },
    payload: { metric: 'First-token latency', unit: 'ms',
      series: [{ label: 'Anthropic · Work', value: 410 }, { label: 'Anthropic · Personal', value: 520 }, { label: 'Alibaba · Coding Plan', value: 280 },
        { label: 'Alibaba · Team', value: 310 }, { label: 'Moonshot · Kimi Coding', value: 265 }] } },
  'deep-plan-sources': { kind: 'code', title: 'Deep Plan Sources', status: 'ready', version: 1, updated: '12m ago', thread: 'plan-deep',
    path: 'artifacts/deep-plan-sources.json', summary: 'What the Deep Plan read before it wrote the session cache plan, and why.',
    payload: { language: 'json', content: JSON.stringify({ plan: 'Session cache stampede', read_at: '9:48 PM', complete: true, sources: [
      { kind: 'code', ref: 'src/cache/loader.rs', lines: '40-88', why: 'the read path every request takes' },
      { kind: 'incident', ref: 'INC-2291', why: 'the cold-start stampede this plan answers' },
      { kind: 'benchmark', ref: 'bench/cache_cold_start.rs', why: 'reproduces the incident profile' }] }, null, 2) } }
};
Object.keys(ART).forEach(function (id) { ART[id].id = id; });

/* what this session changed (a refresh, a retry, a finished render), so a re-mount shows the same state */
var SESSION = {};
function live(id) { return SESSION[id] || (SESSION[id] = {}); }

/* ---- ids ---- */
function parseRef(tabId) {
  var m;
  if (tabId.indexOf('artifact-revision:') === 0) {
    var raw = tabId.slice('artifact-revision:'.length), o = null;
    try { o = JSON.parse(decodeURIComponent(raw)); } catch (_) { o = null; }
    if (!o || !o.artifact_id) return { id: null, version: null, revision: true, broken: true };
    return { id: String(o.artifact_id), version: o.artifact_version != null ? Number(o.artifact_version) : null, revision: true, project: o.project_id || null, thread: o.thread_id || null };
  }
  if ((m = /^artifact:([^@]+)(?:@v(\d+))?$/.exec(tabId))) return { id: m[1], version: m[2] ? Number(m[2]) : null, revision: !!m[2] };
  return { id: tabId, version: null, revision: false };
}
function labelFor(tabId) {
  var ref = parseRef(tabId), art = ref.id && ART[ref.id];
  if (ref.revision && ref.version != null) return (art ? art.title : 'Unavailable artifact') + ' · V' + ref.version;
  return art ? art.title : null;
}
function versionId(art, v) { return v === art.version ? art.id : 'artifact:' + art.id + '@v' + v; }

/* ---- charts (single series: one colour, thin marks, a marked target, values at the tips; narrow bodies get bars) ---- */
function niceStep(range, count) {
  var raw = range / (count || 4), p = Math.pow(10, Math.floor(Math.log10(raw || 1))), m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}
function ticks(lo, hi, count) {
  var st = niceStep(hi - lo || 1, count), a = Math.floor(lo / st) * st, b = Math.ceil(hi / st) * st, out = [];
  if (b === a) b = a + st;
  for (var v = a; v <= b + st / 2; v += st) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}
function compact(v) {
  var a = Math.abs(v);
  if (a >= 1e6) return num(v / 1e6, 1) + 'M';
  if (a >= 1e4) return num(v / 1e3, 0) + 'k';
  return num(v, 1);
}
function chart(series, o) {
  var vals = series.map(function (s) { return s.value; }).filter(function (v) { return v != null; });
  var hi = Math.max.apply(null, vals.concat(o.target ? [o.target.value] : [], [0]));
  var tk = ticks(0, hi, 4), top = tk[tk.length - 1] || 1;
  var fig = h('figure', { class: 'pmw-art-chart', 'data-pmh': 'off' });
  if (o.caption) fig.appendChild(h('figcaption', { class: 'pmw-art-cap', text: o.caption }));
  // columns (wide bodies)
  var plot = h('div', { class: 'pmw-art-plot' });
  tk.forEach(function (t) { plot.appendChild(h('div', { class: 'pmw-art-grid', style: 'bottom:' + (t / top * 100) + '%' }, [h('span', { class: 'pmw-art-tick', text: o.axis ? o.axis(t) : compact(t) })])); });
  var cols = h('div', { class: 'pmw-art-cols' });
  series.forEach(function (s) {
    var pct = s.value == null ? 0 : s.value / top * 100;
    var col = h('div', { class: 'pmw-art-col', role: 'img', tabindex: '0', 'aria-label': s.label + ': ' + o.fmt(s.value),
      'data-pm-hover-label': s.label, 'data-pm-hover-detail': o.fmt(s.value) });
    if (s.value == null) col.appendChild(h('span', { class: 'pmw-art-na', text: 'not reported' }));
    else {
      col.appendChild(h('span', { class: 'pmw-art-bar' + (s.value === 0 ? ' is-zero' : ''), style: 'height:' + pct + '%' }));
      col.appendChild(h('span', { class: 'pmw-art-val', style: 'bottom:calc(' + pct + '% + 4px)', text: o.fmt(s.value) }));
    }
    cols.appendChild(col);
  });
  plot.appendChild(cols);
  if (o.target) plot.appendChild(h('div', { class: 'pmw-art-target', style: 'bottom:' + (o.target.value / top * 100) + '%' }, [h('span', { text: o.target.label })]));
  var xl = h('div', { class: 'pmw-art-xl', 'aria-hidden': 'true' }, series.map(function (s) { return h('span', { text: s.label }); }));
  fig.appendChild(h('div', { class: 'pmw-art-cform' }, [plot, xl]));
  // bars (narrow bodies)
  var bars = h('div', { class: 'pmw-art-hform' });
  series.forEach(function (s) {
    var pct = s.value == null ? 0 : s.value / top * 100;
    var track = h('span', { class: 'pmw-art-htrack' });
    if (s.value != null) track.appendChild(h('span', { class: 'pmw-art-hbar' + (s.value === 0 ? ' is-zero' : ''), style: 'width:' + pct + '%' }));
    if (o.target) track.appendChild(h('i', { class: 'pmw-art-htgt', style: 'left:' + (o.target.value / top * 100) + '%' }));
    bars.appendChild(h('div', { class: 'pmw-art-hb' }, [h('span', { class: 'pmw-art-hlabel', text: s.label }), track,
      h('span', { class: 'pmw-art-hval' + (s.value == null ? ' is-na' : ''), text: o.fmt(s.value) })]));
  });
  if (o.target) bars.appendChild(h('p', { class: 'pmw-art-hnote' }, [h('i', { class: 'pmw-art-htgt is-key' }), h('span', { text: o.target.label })]));
  fig.appendChild(bars);
  return fig;
}
/* a line for change over time (the forecast): HTML ticks and dots over one stretched SVG path */
function lineChart(series, o) {
  var vals = series.map(function (s) { return s.value; });
  var lo0 = Math.min.apply(null, vals), hi0 = Math.max.apply(null, vals);
  var tk = ticks(lo0 - (hi0 - lo0) * 0.15, hi0, 4), lo = tk[0], top = tk[tk.length - 1];
  var n = series.length;
  function x(i) { return (i + 0.5) / n * 100; }
  function y(v) { return (v - lo) / (top - lo) * 100; }
  var fig = h('figure', { class: 'pmw-art-chart is-line', 'data-pmh': 'off' });
  if (o.caption) fig.appendChild(h('figcaption', { class: 'pmw-art-cap', text: o.caption }));
  var plot = h('div', { class: 'pmw-art-plot' });
  tk.forEach(function (t) { plot.appendChild(h('div', { class: 'pmw-art-grid', style: 'bottom:' + y(t) + '%' }, [h('span', { class: 'pmw-art-tick', text: compact(t) })])); });
  var pts = series.map(function (s, i) { return x(i) + ',' + (100 - y(s.value)); });
  var svg = sv('svg', { class: 'pmw-art-linesvg', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, [
    sv('polygon', { class: 'pmw-art-area', points: x(0) + ',100 ' + pts.join(' ') + ' ' + x(n - 1) + ',100' }),
    sv('polyline', { class: 'pmw-art-line', points: pts.join(' '), 'vector-effect': 'non-scaling-stroke' })]);
  plot.appendChild(svg);
  series.forEach(function (s, i) {
    plot.appendChild(h('span', { class: 'pmw-art-dot', role: 'img', tabindex: '0', 'aria-label': s.label + ': ' + o.fmt(s.value), style: 'left:' + x(i) + '%;bottom:' + y(s.value) + '%',
      'data-pm-hover-label': s.label, 'data-pm-hover-detail': o.fmt(s.value) }));
  });
  var last = series[n - 1];
  plot.appendChild(h('span', { class: 'pmw-art-endval', style: 'bottom:calc(' + y(last.value) + '% + 10px)', text: o.fmt(last.value) }));
  fig.appendChild(h('div', { class: 'pmw-art-cform is-always' }, [plot, h('div', { class: 'pmw-art-xl', 'aria-hidden': 'true' }, series.map(function (s) { return h('span', { text: s.label }); }))]));
  return fig;
}
function unitFmt(unit, money) {
  return function (v) {
    if (v == null) return 'not reported';
    if (money) return '$' + Number(v).toFixed(2);
    if (unit === '%') return num(v, 1) + ' %';
    if (unit === 'tokens') return num(v, 0) + ' tokens';
    return num(v, 1) + ' ' + unit;
  };
}

/* ---- diagrams: a layered layout (top to bottom), boxes and arrows in SVG, never clipped ---- */
function parseMermaid(src) {
  var nodes = {}, order = [], edges = [];
  function node(id, label, shape) {
    if (!nodes[id]) { nodes[id] = { id: id, label: label || id, shape: shape || 'box' }; order.push(id); }
    else if (label) { nodes[id].label = label; nodes[id].shape = shape || nodes[id].shape; }
  }
  var rx = /^\s*(\w+)(?:\[([^\]]+)\]|\{([^}]+)\})?\s*-->\s*(?:\|([^|]+)\|\s*)?(\w+)(?:\[([^\]]+)\]|\{([^}]+)\})?\s*$/;
  src.split('\n').forEach(function (line) {
    var m = rx.exec(line);
    if (!m) return;
    node(m[1], m[2] || m[3], m[3] ? 'decision' : null);
    node(m[5], m[6] || m[7], m[7] ? 'decision' : null);
    edges.push({ from: m[1], to: m[5], label: m[4] || '' });
  });
  return { nodes: order.map(function (id) { return nodes[id]; }), edges: edges };
}
function layered(g) {
  var byId = {}, out = {}, inc = {};
  g.nodes.forEach(function (n) { byId[n.id] = n; out[n.id] = []; inc[n.id] = 0; });
  g.edges.forEach(function (e) { out[e.from].push(e); inc[e.to] += 1; });
  // back edges by depth-first search from the roots, in node order
  var seen = {}, stack = {};
  function dfs(id) {
    seen[id] = true; stack[id] = true;
    out[id].forEach(function (e) { if (stack[e.to]) e.back = true; else if (!seen[e.to]) dfs(e.to); });
    stack[id] = false;
  }
  g.nodes.forEach(function (n) { if (!inc[n.id] && !seen[n.id]) dfs(n.id); });
  g.nodes.forEach(function (n) { if (!seen[n.id]) dfs(n.id); });
  // longest path layering over the forward edges
  var layer = {};
  g.nodes.forEach(function (n) { layer[n.id] = 0; });
  for (var pass = 0; pass < g.nodes.length; pass++) {
    var moved = false;
    g.edges.forEach(function (e) { if (!e.back && layer[e.to] < layer[e.from] + 1) { layer[e.to] = layer[e.from] + 1; moved = true; } });
    if (!moved) break;
  }
  var rows = [];
  g.nodes.forEach(function (n) { (rows[layer[n.id]] = rows[layer[n.id]] || []).push(n); });
  // one barycentre pass: each row ordered by its parents' positions
  var pos = {};
  rows.forEach(function (row, ri) {
    if (ri) {
      row.forEach(function (n) {
        var ps = g.edges.filter(function (e) { return e.to === n.id && !e.back && pos[e.from] != null; }).map(function (e) { return pos[e.from]; });
        n._bc = ps.length ? ps.reduce(function (a, b) { return a + b; }, 0) / ps.length : 0;
      });
      row.sort(function (a, b) { return a._bc - b._bc; });
    }
    row.forEach(function (n, i) { pos[n.id] = i - (row.length - 1) / 2; });
  });
  return { rows: rows, layer: layer, byId: byId };
}
function textW(s, px) { return Math.ceil(String(s).length * (px || 12) * 0.56); }
function diagram(g, o) {
  o = o || {};
  var L = layered(g), NH = o.sub ? 52 : 38, VG = 48, HG = 22, PAD = 18;
  g.nodes.forEach(function (n) { n.w = Math.max(96, Math.min(220, Math.max(textW(n.label, 13), n.sub ? textW(n.sub, 12) : 0) + 28)); if (n.shape === 'decision') n.w += 18; });
  function lineW(line) { return line.reduce(function (a, n) { return a + n.w; }, 0) + HG * (line.length - 1); }
  var hasBack = g.edges.some(function (e) { return e.back; });
  var SIDE = hasBack ? 40 : 0, CH = 16, EDGE = 8;
  // Fit (o.maxW, the figure's inner width) wraps a row that is too wide onto more lines, so every node shows at full size;
  // edges to a later line run down a channel outside the lines above it
  var lines = L.rows.map(function (r) { return [r]; });
  if (o.maxW) {
    var room = o.maxW - (EDGE + CH) * 2 - SIDE * 2;
    // only when the svg's 92 % floor (below) could not take it in
    if (L.rows.some(function (r) { return (lineW(r) + PAD * 2 + SIDE * 2) * 0.92 > o.maxW; })) {
      lines = L.rows.map(function (r) {
        if (lineW(r) <= room) return [r];
        var out = [[]];
        r.forEach(function (n) { var cur = out[out.length - 1]; if (cur.length && lineW(cur.concat([n])) > room) out.push([n]); else cur.push(n); });
        return out;
      });
    }
  }
  var wrapped = lines.some(function (ls) { return ls.length > 1; });
  var maxLine = Math.max.apply(null, [].concat.apply([], lines.map(function (ls) { return ls.map(lineW); })));
  var nLines = lines.reduce(function (a, ls) { return a + ls.length; }, 0);
  var W = maxLine + (wrapped ? EDGE + CH : PAD) * 2 + SIDE * 2, H = nLines * NH + (nLines - 1) * VG + PAD * 2;
  var core = W, li0 = 0;
  lines.forEach(function (ls, ri) {
    ls.forEach(function (line, k) {
      var x = (core - lineW(line)) / 2, y = PAD + li0 * (NH + VG);
      line.forEach(function (n) { n.x = x; n.y = y; n.h = NH; n.cx = x + n.w / 2; n.line = k; x += n.w + HG; });
      li0++;
    });
    // the row's span, for edges that pass it or reach a later line of it
    var all = L.rows[ri];
    ls.span = { left: Math.min.apply(null, all.map(function (n) { return n.x; })), right: Math.max.apply(null, all.map(function (n) { return n.x + n.w; })),
      top: ls[0][0].y };
  });
  var svg = sv('svg', { class: 'pmw-art-svg', viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': o.label || 'Diagram' });
  // Fit never shrinks the drawing below 92 %, so its smallest text stays at 11 px; narrower panels scroll sideways
  svg.style.minWidth = Math.round(W * 0.92) + 'px';
  var edgesG = sv('g', { class: 'pmw-art-edges' }), labelsG = sv('g', { class: 'pmw-art-elabels' }), nodesG = sv('g', { class: 'pmw-art-nodes' });
  var right = Math.max.apply(null, g.nodes.map(function (n) { return n.x + n.w; }));
  g.edges.forEach(function (e, i) {
    var a = L.byId[e.from], b = L.byId[e.to], d, ex, ey, cx, cy, mx, my;
    if (e.back) {
      // around the outside, on the side where the source is the outermost node of its row (orthogonal, rounded corners)
      var rowA = L.rows[L.layer[a.id]], leftSide = rowA[0] === a && a.cx < core / 2;
      var y1 = a.y + a.h / 2, y2 = b.y + b.h / 2, r = 8;
      var xs = leftSide ? Math.min.apply(null, g.nodes.map(function (n) { return n.x; })) - 22 : right + 22;
      var sx = leftSide ? a.x : a.x + a.w, tx = leftSide ? b.x - 6 : b.x + b.w + 6, dir = leftSide ? -1 : 1;
      d = 'M' + sx + ' ' + y1 + ' H' + (xs - dir * r) + ' Q' + xs + ' ' + y1 + ' ' + xs + ' ' + (y1 - r) + ' V' + (y2 + r) + ' Q' + xs + ' ' + y2 + ' ' + (xs - dir * r) + ' ' + y2 + ' H' + tx;
      ex = leftSide ? b.x : b.x + b.w; ey = y2; cx = xs; cy = y2; mx = xs; my = (y1 + y2) / 2;
    } else {
      var x1 = a.cx, yy1 = a.y + a.h, x2 = b.cx, yy2 = b.y, dy = (yy2 - yy1) / 2;
      var block = null;
      for (var li = L.layer[a.id] + 1; li < L.layer[b.id] && !block; li++) {
        var t = (li - L.layer[a.id]) / (L.layer[b.id] - L.layer[a.id]), lx = x1 + (x2 - x1) * t;
        // a wrapped row in the way is passed outside all of its lines
        if (lines[li].length > 1) { var sp = lines[li].span, lastL = lines[li][lines[li].length - 1][0]; block = { x: sp.left, w: sp.right - sp.left, y: sp.top, h: lastL.y + lastL.h - sp.top, cx: core / 2 }; }
        else L.rows[li].forEach(function (n) { if (!block && lx > n.x - 8 && lx < n.x + n.w + 8) block = n; });
      }
      // in a wrapped row, an edge leaves an earlier line past the lines below it, on the source's side, and reaches a later
      // line past the lines above it, on the target's side
      var side = null, la = lines[L.layer[a.id]], lb = lines[L.layer[b.id]];
      if (!block && a.line < la.length - 1) {
        var below = la[a.line + 1][0], last = la[la.length - 1][0];
        block = { x: la.span.left, w: la.span.right - la.span.left, y: below.y, h: last.y + last.h - below.y }; side = x1 >= core / 2;
      } else if (!block && b.line) {
        var above = lb[b.line - 1][0];
        block = { x: lb.span.left, w: lb.span.right - lb.span.left, y: lb.span.top, h: above.y + above.h - lb.span.top }; side = x2 >= core / 2;
      }
      if (block) {
        var wx = (side != null ? side : (x1 + x2) / 2 >= block.cx) ? block.x + block.w + 16 : block.x - 16, top2 = block.y - 6, bot2 = block.y + block.h + 6;
        d = 'M' + x1 + ' ' + yy1 + ' C' + x1 + ' ' + (yy1 + 18) + ' ' + wx + ' ' + (top2 - 18) + ' ' + wx + ' ' + top2 + ' V' + bot2 +
          ' C' + wx + ' ' + (bot2 + 18) + ' ' + x2 + ' ' + (yy2 - 24) + ' ' + x2 + ' ' + (yy2 - 6);
        ex = x2; ey = yy2; cx = x2; cy = yy2 - 24; mx = wx; my = (top2 + bot2) / 2;
      } else {
        d = 'M' + x1 + ' ' + yy1 + ' C' + x1 + ' ' + (yy1 + dy) + ' ' + x2 + ' ' + (yy2 - dy) + ' ' + x2 + ' ' + (yy2 - 6);
        ex = x2; ey = yy2; cx = x2; cy = yy2 - dy; mx = (x1 + x2) / 2; my = (yy1 + yy2) / 2;
      }
    }
    edgesG.appendChild(sv('path', { d: d, class: 'pmw-art-edge' + (e.back ? ' is-back' : '') + (b.quiet ? ' is-quiet' : '') }));
    var ang = Math.atan2(ey - cy, ex - cx), s = 6;
    var p1 = (ex - s * Math.cos(ang - 0.45)) + ',' + (ey - s * Math.sin(ang - 0.45)), p2 = (ex - s * Math.cos(ang + 0.45)) + ',' + (ey - s * Math.sin(ang + 0.45));
    edgesG.appendChild(sv('polygon', { class: 'pmw-art-head' + (b.quiet ? ' is-quiet' : ''), points: ex + ',' + ey + ' ' + p1 + ' ' + p2 }));
    if (e.label) {
      // just above the target, so labels of sibling edges never sit on each other
      var lw = textW(e.label, 12) + 10, ly = e.back ? my : b.y - 16, lx = e.back ? mx : b.cx;
      labelsG.appendChild(sv('rect', { class: 'pmw-art-elbg', x: lx - lw / 2, y: ly - 10, width: lw, height: 20 }));
      labelsG.appendChild(sv('text', { class: 'pmw-art-elabel', x: lx, y: ly + 4, 'text-anchor': 'middle' }, [e.label]));
    }
  });
  g.nodes.forEach(function (n) {
    var grp = sv('g', { class: 'pmw-art-node' + (n.strong ? ' is-strong' : '') + (n.quiet ? ' is-quiet' : '') + (n.dashed ? ' is-dashed' : '') });
    if (n.shape === 'decision') {
      var k = 12;
      grp.appendChild(sv('polygon', { class: 'pmw-art-box', points: [n.x, n.y + n.h / 2, n.x + k, n.y, n.x + n.w - k, n.y, n.x + n.w, n.y + n.h / 2, n.x + n.w - k, n.y + n.h, n.x + k, n.y + n.h].join(' ').replace(/(\S+) (\S+)( |$)/g, '$1,$2$3') }));
    } else grp.appendChild(sv('rect', { class: 'pmw-art-box', x: n.x, y: n.y, width: n.w, height: n.h, rx: 6 }));
    if (n.sub) {
      grp.appendChild(sv('text', { class: 'pmw-art-nlabel', x: n.cx, y: n.y + 22, 'text-anchor': 'middle' }, [n.label]));
      grp.appendChild(sv('text', { class: 'pmw-art-nsub', x: n.cx, y: n.y + 39, 'text-anchor': 'middle' }, [n.sub]));
    } else grp.appendChild(sv('text', { class: 'pmw-art-nlabel', x: n.cx, y: n.y + n.h / 2 + 4.5, 'text-anchor': 'middle' }, [n.label]));
    nodesG.appendChild(grp);
  });
  add(svg, [edgesG, labelsG, nodesG]);
  return svg;
}
function connections(g) {
  var byId = {};
  g.nodes.forEach(function (n) { byId[n.id] = n; });
  var d = h('details', { class: 'pmw-art-conn' }, [h('summary', { text: 'Connections, as a list (' + g.edges.length + ')' })]);
  d.appendChild(h('ul', null, g.edges.map(function (e) {
    return h('li', null, [byId[e.from].label, h('span', { class: 'pmw-art-arrow', 'aria-label': ' leads to ', text: ' to ' }), byId[e.to].label, e.label ? h('span', { class: 'pmw-art-dim', text: ' (' + e.label + ')' }) : null]);
  })));
  return d;
}

/* ---- the generated image stand-in: an operations console, drawn in the look's own colours ---- */
function consoleImage(p) {
  var s = sv('svg', { class: 'pmw-art-svg pmw-art-img', viewBox: '0 0 ' + p.width + ' ' + p.height, width: p.width, height: p.height, role: 'img', 'aria-label': p.alt });
  add(s, [sv('rect', { class: 'i-bg', x: 0, y: 0, width: 1280, height: 720 }), sv('rect', { class: 'i-bar', x: 0, y: 0, width: 1280, height: 56 }),
    sv('rect', { class: 'i-acc', x: 28, y: 20, width: 16, height: 16, rx: 3 }), sv('rect', { class: 'i-ink2', x: 56, y: 22, width: 150, height: 12, rx: 3 }),
    sv('rect', { class: 'i-ink3', x: 1080, y: 22, width: 170, height: 12, rx: 3 })]);
  // run list
  add(s, sv('rect', { class: 'i-card', x: 24, y: 80, width: 248, height: 616, rx: 12 }));
  for (var i = 0; i < 7; i++) {
    var y = 112 + i * 80;
    add(s, [sv('rect', { class: i === 1 ? 'i-sel' : 'i-none', x: 36, y: y - 16, width: 224, height: 64, rx: 8 }),
      sv('rect', { class: i === 3 ? 'i-warn' : 'i-ok', x: 52, y: y + 2, width: 10, height: 10, rx: 2 }),
      sv('rect', { class: 'i-ink2', x: 76, y: y, width: 140 - (i % 3) * 22, height: 12, rx: 3 }),
      sv('rect', { class: 'i-ink3', x: 76, y: y + 22, width: 96 + (i % 2) * 30, height: 9, rx: 3 })]);
  }
  // host panel: six tiles with small traces
  add(s, sv('rect', { class: 'i-card', x: 296, y: 80, width: 640, height: 616, rx: 12 }));
  add(s, sv('rect', { class: 'i-ink2', x: 324, y: 106, width: 180, height: 14, rx: 3 }));
  var traces = ['0,30 20,26 40,28 60,18 80,22 100,12 120,16 140,8', '0,12 20,18 40,14 60,22 80,20 100,26 120,22 140,28', '0,24 20,22 40,24 60,20 80,14 100,16 120,10 140,12',
    '0,20 20,28 40,18 60,24 80,12 100,20 120,8 140,14', '0,28 20,24 40,20 60,22 80,16 100,12 120,14 140,6', '0,16 20,14 40,20 60,12 80,18 100,10 120,16 140,12'];
  for (var t = 0; t < 6; t++) {
    var tx = 324 + (t % 3) * 200, ty = 146 + Math.floor(t / 3) * 180;
    add(s, [sv('rect', { class: 'i-tile', x: tx, y: ty, width: 184, height: 160, rx: 10 }), sv('rect', { class: 'i-ink3', x: tx + 18, y: ty + 20, width: 70, height: 9, rx: 3 }),
      sv('rect', { class: 'i-ink1', x: tx + 18, y: ty + 40, width: 96, height: 20, rx: 4 }),
      sv('polyline', { class: t === 4 ? 'i-tracew' : 'i-trace', points: traces[t], transform: 'translate(' + (tx + 22) + ' ' + (ty + 90) + ') scale(1 1.6)' })]);
  }
  add(s, [sv('rect', { class: 'i-tile', x: 324, y: 506, width: 584, height: 164, rx: 10 }), sv('rect', { class: 'i-ink3', x: 344, y: 528, width: 120, height: 9, rx: 3 })]);
  for (var b = 0; b < 14; b++) add(s, sv('rect', { class: 'i-acc', x: 348 + b * 39, y: 650 - (30 + ((b * 37) % 70)), width: 18, height: 30 + ((b * 37) % 70), rx: 3 }));
  // receipt column
  add(s, sv('rect', { class: 'i-card', x: 960, y: 80, width: 296, height: 616, rx: 12 }));
  for (var r = 0; r < 9; r++) {
    var ry = 116 + r * 64;
    add(s, [sv('path', { class: 'i-check', d: 'M984 ' + (ry + 6) + 'l5 5 9-10' }), sv('rect', { class: 'i-ink2', x: 1012, y: ry, width: 170 - (r % 4) * 18, height: 11, rx: 3 }),
      sv('rect', { class: 'i-ink3', x: 1012, y: ry + 20, width: 110, height: 8, rx: 3 })]);
  }
  return s;
}

/* ---- the kind ---- */
function mountArtifact(host, state, api) {
  var ref = parseRef(api.id);
  var art = ref.id ? ART[ref.id] || null : null;
  var st = {
    view: state.view || 'fit',
    metric: state.metric || 'p95',
    filter: state.filter || 'all',
    sort: state.sort || null,
    answers: state.answers || {}
  };
  var shownVersion = art ? (ref.version || art.version) : ref.version;
  var older = !!(art && ref.version && ref.version < art.version);
  var missing = !art || ref.broken || (ref.version != null && art && ref.version > art.version);
  var timers = [], visible = false, frame = null, disposed = false;
  var hasFile = !!(art && PMW.fileRef && PM_HOME.fileExists && PM_HOME.fileExists(art.path));

  api.update({ label: labelFor(api.id) || 'Artifact', title: art ? art.title + ' · ' + KIND_WORD[art.kind] + ' · Version ' + shownVersion : 'Artifact' });

  function status() {
    if (!art) return 'missing';
    var s = live(art.id);
    if (s.status) return s.status;
    if (art.status === 'loading' && s.loaded) return 'ready';
    return art.status;
  }

  // the header row: Fit / Source (and Actual size for drawings), Versions, Open in new panel, More
  var viewOpts = [{ value: 'fit', label: 'Fit' }];
  if (art && VISUAL[art.kind]) viewOpts.push({ value: 'actual', label: 'Actual size' });
  viewOpts.push({ value: 'source', label: 'Source' });
  var seg = h('div', { class: 'pmw-art-hseg', role: 'radiogroup', 'aria-label': 'View' });
  viewOpts.forEach(function (op) {
    var b = h('button', { type: 'button', class: 'pmw-art-hopt', role: 'radio', 'data-v': op.value, 'data-pmh': 'icon',
      'data-pm-hover-label': op.label, 'data-pm-hover-detail': op.value === 'source' ? 'The artifact as written' : op.value === 'actual' ? 'At its own size; scroll to see all of it' : 'Drawn to fit this panel' }, [op.label]);
    b.addEventListener('click', function () { setView(op.value); });
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var i = viewOpts.findIndex(function (x) { return x.value === st.view; });
      var nx = viewOpts[(i + (e.key === 'ArrowRight' ? 1 : -1) + viewOpts.length) % viewOpts.length];
      setView(nx.value);
      var el = seg.querySelector('[data-v="' + nx.value + '"]');
      if (el) el.focus();
    });
    seg.appendChild(b);
  });
  function paintSeg() {
    Array.prototype.forEach.call(seg.children, function (b) {
      var on = b.getAttribute('data-v') === st.view;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      b.classList.toggle('pmw-chosen', on);
    });
  }
  function setView(v) { if (st.view === v) return; st.view = v; paintSeg(); render(); api.saveSoon(); }

  function versionRows() {
    var rows = [];
    for (var v = art.version; v >= 1; v--) {
      (function (v) {
        rows.push({ id: 'v' + v, label: 'Version ' + v + (v === art.version ? ' (current)' : ''), sub: (art.revisions && art.revisions[v]) || (v === art.version ? 'The newest version' : 'Kept as written'),
          checked: v === shownVersion, run: function () { openVersion(v); } });
      })(v);
    }
    return rows;
  }
  function openVersion(v) {
    var id = versionId(art, v);
    if (id === api.id) return;
    api.open({ id: id, kind: 'artifact', label: v === art.version ? art.title : art.title + ' · V' + v, mode: 'keep' });
  }
  function sourceText() {
    if (!art) return '';
    if (art.kind === 'mermaid') return art.payload.source;
    if (art.kind === 'code') return art.payload.content;
    return JSON.stringify(art.payload, null, 2);
  }
  function copy(text, what) {
    function done() { PMW.toast(what + ' copied'); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { PMW.toast('Copying is not allowed here; open Source and select the text'); }); return; }
    } catch (_) {}
    PMW.toast('Copying is not allowed here; open Source and select the text');
  }
  function fileBase() { return art.path.split('/').pop().replace(/\.[^.]+$/, ''); }
  function moreRows() {
    if (!art) return [{ id: 'none', label: 'Nothing to copy', disabled: true }];
    var rows = [
      { id: 'copy-source', label: 'Copy source', sub: art.kind === 'mermaid' ? 'The diagram as text' : 'The data this view draws', icon: 'code', run: function () { copy(sourceText(), 'Source'); } },
      { id: 'copy-link', label: 'Copy link to this version', icon: 'link', run: function () { copy('pm://artifact/' + art.id + '/v' + shownVersion, 'Link'); } },
      '-',
      { id: 'export-png', label: 'Export as image', sub: fileBase() + '-v' + shownVersion + '.png', icon: 'camera', run: function () { PMW.toast('Exported ' + fileBase() + '-v' + shownVersion + '.png to Downloads'); } },
      { id: 'export-data', label: 'Export the data', sub: art.path.split('/').pop(), icon: 'output', run: function () { PMW.toast('Exported ' + art.path.split('/').pop() + ' to Downloads'); } },
      '-',
      { id: 'open-file', label: 'Open the source file', sub: art.path, icon: 'file', disabled: !hasFile, reason: 'This demo project has no copy of it',
        run: function () { api.open({ kind: 'editor', path: art.path, mode: 'keep' }); } }
    ];
    return rows;
  }
  var actions = [];
  if (art && !missing) {
    actions.push({ id: 'versions', label: 'Versions', icon: 'history', detail: art.version + ' versions', menu: function () { return { id: 'art-versions', title: 'Versions', rows: versionRows(), width: 300, align: 'end' }; } });
  }
  actions.push({ id: 'newpanel', label: 'Open in new panel', icon: 'newPanel', detail: 'Moves this tab into a panel of its own', run: function () { PMW.moveTabToNewPanel(api.id); } });
  actions.push({ id: 'more', label: 'More', icon: 'more', detail: 'Copy and export', menu: function () { return moreRows(); } });
  var left = [];
  if (art && !missing) left.push({ id: 'view', el: seg });
  // the source file: a D7 file reference when the demo project has it (preview on click, kept on double click)
  if (art && hasFile) left.push({ id: 'path', el: PMW.fileRef({ path: art.path }, { api: api, inline: true }), mono: true });
  else if (art) left.push({ id: 'path', icon: 'file', text: art.path, mono: true, dim: true, title: 'Source file' });
  var row = api.headerRow({ left: left, actions: actions, label: 'Artifact controls' });
  var stage = h('div', { class: 'pmw-art-stage' });
  var frameRoot = h('div', { class: 'pmw-art' }, [row.el, stage]);
  host.appendChild(frameRoot);
  paintSeg();

  /* ---- notices ---- */
  function note(state2, iconName, title, text, buttons) {
    var box = h('div', { class: 'pmw-notice pmw-art-note is-' + state2, role: state2 === 'bad' ? 'alert' : null });
    box.appendChild(PMW.icon(iconName, { size: 14 }));
    var body = h('div', { class: 'pmw-art-notebody' }, [h('b', { text: title }), text ? h('span', { text: text }) : null]);
    if (buttons && buttons.length) body.appendChild(h('div', { class: 'pmw-art-noteacts' }, buttons.map(PMW.frames.button)));
    box.appendChild(body);
    return box;
  }

  /* ---- subtype bodies ---- */
  function dashboardBody() {
    var p = art.payload, out = [];
    if (p.secondary) {
      var main = p.series.filter(function (s) { return s.label !== 'Target'; });
      var base = main[0], best = main[main.length - 1];
      var tiles = [{ label: 'p95 read', value: num(best.value) + ' ms', sub: 'was ' + num(base.value) + ' ms · ' + Math.round((1 - best.value / base.value) * 100) + '% lower' }];
      p.secondary.forEach(function (s) {
        var sub;
        if (s.unit === '%' && s.label === 'Write cost') sub = 'was ' + num(s.before) + ' % · under the 8 % limit';
        else if (s.unit === '%') sub = 'was ' + num(s.before) + ' % · ' + num(s.after - s.before) + ' points higher';
        else if (s.after > s.before) sub = 'was ' + num(s.before) + ' · ' + num(s.after / s.before, 1) + ' times as many';
        else sub = 'was ' + num(s.before) + ' ' + s.unit + ' · ' + Math.round((1 - s.after / s.before) * 100) + '% lower';
        tiles.push({ label: s.label, value: num(s.after) + (s.unit === '%' ? ' %' : ' ' + s.unit), sub: sub });
      });
      out.push(PMW.frames.tiles(tiles));
      var opts = [{ value: 'p95', label: 'p95 read' }].concat(p.secondary.map(function (s, i) { return { value: 's' + i, label: s.label }; }));
      var chartHost = h('div');
      var seg2 = PMW.frames.seg(opts, st.metric, function (v) { st.metric = v; chartHost.textContent = ''; chartHost.appendChild(dashChart()); api.saveSoon(); }, { label: 'Metric', cls: 'pmw-art-metric' });
      out.push(PMW.frames.section('Comparison', 'before and after', [seg2, chartHost]));
      chartHost.appendChild(dashChart());
    } else {
      out.push(chart(p.series, { fmt: unitFmt(p.unit), caption: p.metric + (p.unit === '%' ? ', %' : ', ' + p.unit), label: p.metric }));
    }
    return out;
  }
  function dashChart() {
    var p = art.payload;
    if (st.metric === 'p95' || !/^s\d$/.test(st.metric)) {
      var tgt = p.series.filter(function (s) { return s.label === 'Target'; })[0];
      return chart(p.series.filter(function (s) { return s.label !== 'Target'; }), { fmt: unitFmt(p.unit), caption: p.metric + ', ' + p.unit + ' (lower is better)', label: p.metric,
        target: tgt ? { value: tgt.value, label: 'Target ' + num(tgt.value) + ' ' + p.unit } : null });
    }
    var s = p.secondary[Number(st.metric.slice(1))];
    var up = s.label === 'Throughput' || s.label === 'Cache hit';
    return chart([{ label: 'Before', value: s.before }, { label: 'After', value: s.after }], { fmt: unitFmt(s.unit), label: s.label,
      caption: s.label + ', ' + s.unit + (up ? ' (higher is better)' : ' (lower is better)'), target: s.label === 'Write cost' ? { value: 8, label: 'Limit 8 %' } : null });
  }
  function chartBody() {
    var p = art.payload, out = [];
    if (p.line) out.push(lineChart(p.series, { fmt: unitFmt(p.unit), caption: p.metric + ', ' + p.unit }));
    else out.push(chart(p.series, { fmt: unitFmt(p.unit, p.money), caption: p.metric + (p.money ? ', US dollars' : ', ' + p.unit), label: p.metric, axis: p.money ? function (t) { return '$' + num(t, 0); } : null }));
    if (p.note) out.push(h('p', { class: 'pmw-art-fine', text: p.note }));
    return out;
  }
  function durationOf(v) { var m = /([\d.]+)/.exec(v || ''); return m ? Number(m[1]) : null; }
  function dataBody() {
    var p = art.payload;
    var counts = { all: p.rows.length, hit: 0, miss: 0 };
    p.rows.forEach(function (r) { if (r[4] === 'hit') counts.hit++; else if (r[4] === 'miss') counts.miss++; });
    var tableHost = h('div', { class: 'pmw-art-tablewrap', 'data-pmh': 'off' });
    var filter = PMW.frames.seg([{ value: 'all', label: 'All', count: counts.all }, { value: 'hit', label: 'Cache hits', count: counts.hit }, { value: 'miss', label: 'Cache misses', count: counts.miss }],
      st.filter, function (v) { st.filter = v; fillTable(); api.saveSoon(); }, { label: 'Filter', cls: 'pmw-art-filter' });
    function fillTable() {
      tableHost.textContent = '';
      var rows = p.rows.filter(function (r) { return st.filter === 'all' || r[4] === st.filter; });
      if (st.sort) {
        var c = st.sort.col, dir = st.sort.dir === 'desc' ? -1 : 1;
        rows = rows.slice().sort(function (a, b) {
          var x = a[c], y = b[c];
          if (x == null && y == null) return 0;
          if (x == null) return 1;
          if (y == null) return -1;
          if (c === 3) return (durationOf(x) - durationOf(y)) * dir;
          return String(x).localeCompare(String(y)) * dir;
        });
      }
      var thead = h('tr');
      p.columns.forEach(function (name, ci) {
        var sorted = st.sort && st.sort.col === ci;
        var btn = h('button', { type: 'button', class: 'pmw-art-sort', 'data-pmh': 'icon', 'data-pm-hover-label': 'Sort by ' + name.toLowerCase(),
          'data-pm-hover-detail': sorted ? (st.sort.dir === 'asc' ? 'Now low to high' : 'Now high to low') : 'Click again to reverse' }, [name]);
        var chev = PMW.icon('chevronDown', { size: 12, cls: 'pmw-art-sortmark' + (sorted ? ' is-on' : '') + (sorted && st.sort.dir === 'asc' ? ' is-up' : '') });
        btn.appendChild(chev);
        btn.addEventListener('click', function () {
          st.sort = sorted && st.sort.dir === 'asc' ? { col: ci, dir: 'desc' } : sorted && st.sort.dir === 'desc' ? null : { col: ci, dir: 'asc' };
          fillTable();
          api.saveSoon();
          var again = tableHost.querySelectorAll('.pmw-art-sort')[ci];
          if (again) again.focus();
          api.announce(st.sort ? 'Sorted by ' + name.toLowerCase() + (st.sort.dir === 'asc' ? ', low to high' : ', high to low') : 'Original order');
        });
        thead.appendChild(h('th', { scope: 'col', class: ci === 3 ? 'is-num' : null, 'aria-sort': sorted ? (st.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none' }, [btn]));
      });
      var tbody = h('tbody');
      rows.forEach(function (r) {
        tbody.appendChild(h('tr', { class: 'pmw-cur' }, r.map(function (cell, ci) {
          if (cell == null) return h('td', { class: 'is-na' + (ci === 3 ? ' is-num' : '') }, ['not reported']);
          if (ci === 4) return h('td', { class: 'pmw-art-cache' }, [mark(cell === 'hit' ? 'pass' : 'miss'), ' ', cell]);
          return h('td', { class: (ci === 0 || ci === 2 || ci === 5 ? 'is-mono' : '') + (ci === 3 ? ' is-num' : '') }, [cell]);
        })));
      });
      if (!rows.length) tbody.appendChild(h('tr', null, [h('td', { colspan: p.columns.length, class: 'is-na' }, ['No traces match this filter.'])]));
      tableHost.appendChild(h('table', { class: 'pmw-art-table' }, [h('thead', null, [thead]), tbody]));
    }
    fillTable();
    return [filter, tableHost, h('p', { class: 'pmw-art-fine', text: p.note })];
  }
  function diagramBody() {
    var p = art.payload, g, label;
    if (art.kind === 'mermaid') { g = parseMermaid(p.source); label = art.title; }
    else if (art.kind === 'architecture') {
      g = { nodes: p.nodes.map(function (n) { return { id: n.id, label: n.label, sub: n.role + ' · ' + n.host, strong: n.role === 'Server', dashed: n.role === 'Provider' }; }),
        edges: p.edges.map(function (e) { return { from: e[0], to: e[1] }; }) };
      label = art.title;
    } else {
      g = { nodes: p.nodes.map(function (n) { return { id: n.id, label: n.label, quiet: !!n.quiet, strong: n.id === 'approved' }; }), edges: p.edges.map(function (e) { return { from: e[0], to: e[1] }; }) };
      label = art.title;
    }
    var dOpts = { sub: art.kind === 'architecture', label: label + ', a diagram of ' + g.nodes.length + ' steps' };
    var svg = diagram(g, dOpts);
    var fig = h('figure', { class: 'pmw-art-fig' + (st.view === 'actual' ? ' is-actual' : '') }, [svg]);
    // Fit redraws the diagram for the figure's width once it is on the page (fitFigures)
    if (st.view !== 'actual') fig._fit = function (w) { dOpts.maxW = w; return diagram(g, dOpts); };
    var out = [fig, connections(g)];
    if (art.kind === 'mermaid') out.splice(1, 0, h('p', { class: 'pmw-art-fine', text: 'Drawn from the Mermaid source; Source shows it as written.' }));
    return out;
  }
  function quizBody() {
    var qs = art.payload.questions, right = 0, answered = 0;
    var list = h('ol', { class: 'pmw-art-quiz' });
    qs.forEach(function (q, qi) {
      var pick = st.answers[qi];
      if (pick != null) { answered++; if (q.choices[pick] === q.a) right++; }
      var li = h('li', { class: 'pmw-art-q' }, [h('p', { class: 'pmw-art-qtext', text: q.q })]);
      var group = h('div', { class: 'pmw-art-choices', role: 'radiogroup', 'aria-label': q.q });
      q.choices.forEach(function (c, ci) {
        var chosen = pick === ci, correct = c === q.a;
        var cls = 'pmw-art-choice pmw-cur' + (chosen ? ' pmw-chosen is-chosen' : '') + (pick != null && correct ? ' is-right' : '') + (chosen && !correct ? ' is-wrong' : '');
        var b = h('button', { type: 'button', class: cls, role: 'radio', 'aria-checked': chosen ? 'true' : 'false', 'data-pmh': 'row',
          'data-pm-hover-label': 'Answer', 'data-pm-hover-detail': c }, [h('span', { class: 'pmw-art-choicek', text: String.fromCharCode(65 + ci) }), h('span', { text: c })]);
        if (pick != null && correct) b.appendChild(mark('pass', 'Right answer'));
        else if (chosen) b.appendChild(mark('fail', 'Not this one'));
        b.addEventListener('click', function () {
          st.answers[qi] = ci;
          render();
          api.saveSoon();
          api.announce(correct ? 'Right. ' + q.why : 'Not quite. The answer is ' + q.a + '. ' + q.why);
        });
        group.appendChild(b);
      });
      li.appendChild(group);
      if (pick != null) li.appendChild(h('p', { class: 'pmw-art-why' + (q.choices[pick] === q.a ? ' is-right' : ' is-wrong') }, [h('b', { text: q.choices[pick] === q.a ? 'Right. ' : 'Not quite: the answer is ' + q.a + '. ' }), q.why]));
      list.appendChild(li);
    });
    var score = h('p', { class: 'pmw-art-score', role: 'status' }, [answered ? right + ' of ' + qs.length + ' right' + (answered < qs.length ? ', ' + (qs.length - answered) + ' to go' : '') : qs.length + ' questions. Pick an answer to see why.']);
    var out = [score, list];
    if (answered) out.push(h('div', { class: 'pmw-art-acts' }, [PMW.frames.button({ label: 'Start over', icon: 'reload', run: function () { st.answers = {}; render(); api.saveSoon(); } })]));
    return out;
  }
  function periodicBody() {
    var p = art.payload;
    var grid = h('div', { class: 'pmw-art-cells', role: 'list' });
    p.rows.forEach(function (r) {
      var sym = r[0].replace(/^Claude /, '').slice(0, 2);
      var q = r[4], qWord = q === 'yes' ? 'Qualified' : q === 'conditional' ? 'Qualified with conditions' : 'Not qualified';
      grid.appendChild(h('div', { class: 'pmw-art-cell pmw-cur is-' + (q === 'yes' ? 'yes' : q === 'conditional' ? 'cond' : 'no'), role: 'listitem', tabindex: '0',
        'aria-label': r[0] + ', ' + r[1] + ' tools, ' + r[2] + ', cost ' + r[3] + ', ' + qWord.toLowerCase() }, [
        h('span', { class: 'pmw-art-cellnum', text: r[1] }), h('span', { class: 'pmw-art-celltier', text: r[3] }),
        h('b', { class: 'pmw-art-sym', text: sym }), h('span', { class: 'pmw-art-cellname', text: r[0] }), h('span', { class: 'pmw-art-cellspec', text: r[2] }),
        h('span', { class: 'pmw-art-cellq' }, [mark(q === 'yes' ? 'pass' : q === 'conditional' ? 'cond' : 'fail'), qWord])
      ]));
    });
    var key = h('p', { class: 'pmw-art-fine pmw-art-key' }, [h('span', null, ['Top left: tools it can use. Top right: cost tier. ']),
      h('span', { class: 'pmw-art-keyi' }, [mark('pass'), ' qualified ']), h('span', { class: 'pmw-art-keyi' }, [mark('cond'), ' with conditions ']), h('span', { class: 'pmw-art-keyi' }, [mark('fail'), ' not qualified'])]);
    return [grid, key];
  }
  function imageBody() {
    var p = art.payload;
    return [h('figure', { class: 'pmw-art-fig is-image' + (st.view === 'actual' ? ' is-actual' : '') }, [consoleImage(p)]),
      h('p', { class: 'pmw-art-fine' }, [p.width + ' × ' + p.height + ' · PNG · ', h('span', { text: p.alt })])];
  }
  function evidenceBody() {
    var p = art.payload, ok = 0, checks = 0, total = 0;
    p.gates.forEach(function (g) { if (g.passed === g.total) ok++; checks += g.passed; total += g.total; });
    var open = p.gates.length - ok;
    var tiles = PMW.frames.tiles([{ label: 'Gates passed', value: ok + ' of ' + p.gates.length, sub: open ? open + ' still open' : 'all closed' },
      { label: 'Checks passed', value: num(checks, 0) + ' of ' + num(total, 0) }, { label: 'Console errors', value: '0', sub: 'and no page errors' }]);
    if (art.id === 'lens-receipt') tiles = PMW.frames.tiles([{ label: 'Gates passed', value: ok + ' of ' + p.gates.length }, { label: 'Operations', value: String(p.log.length), sub: 'each can be undone' }]);
    var gates = h('ul', { class: 'pmw-art-gates' }, p.gates.map(function (g) {
      var pass = g.passed === g.total;
      return h('li', { class: 'pmw-art-gate' + (pass ? '' : ' is-open') }, [mark(pass ? 'pass' : 'open', pass ? 'Passed' : 'Open'), h('span', { class: 'pmw-art-gname', text: g.name }),
        h('span', { class: 'pmw-art-gcount', text: g.passed + ' of ' + g.total + (pass ? '' : ' · ' + (g.total - g.passed) + ' open') })]);
    }));
    var steps = h('ol', { class: 'pmw-art-steps', 'data-pmh': 'off' }, p.log.map(function (l) {
      var t = typeof l === 'string' ? l : l.text, isOpen = typeof l === 'object' && l.open;
      return h('li', { class: isOpen ? 'is-open' : '' }, [mark(isOpen ? 'open' : 'pass', isOpen ? 'Open' : 'Done'), h('span', { text: t })]);
    }));
    return [tiles, PMW.frames.section('Gates', p.gates.length + ' gates', gates), PMW.frames.section('Steps', 'in the order they ran', steps)];
  }
  function documentBody() {
    var p = art.payload;
    var toc = h('nav', { class: 'pmw-art-toc', 'aria-label': 'Sections' }, p.sections.map(function (s, i) {
      return h('button', { type: 'button', class: 'pmw-art-tocl', 'data-pmh': 'icon', 'data-pm-hover-label': 'Go to ' + s[0], onclick: function () {
        var target = frame && frame.querySelectorAll('.pmw-art-docsec')[i];
        if (target) target.scrollIntoView({ block: 'start', behavior: PMW.reduced() ? 'auto' : 'smooth' });
      } }, [s[0]]);
    }));
    var secs = p.sections.map(function (s) { return h('section', { class: 'pmw-art-docsec', 'data-pmh': 'off' }, [h('h2', { text: s[0] }), h('p', { text: s[1] })]); });
    return [h('p', { class: 'pmw-art-lead', text: art.summary }), h('p', { class: 'pmw-art-fine', text: num(p.wordCount, 0) + ' words · last written by ' + p.lastAuthor }), toc].concat(secs);
  }
  function codeBlock(text, lang) {
    var pre = h('pre', { class: 'pmw-code pmw-art-codeln', 'data-pmh': 'off', tabindex: '0', 'aria-label': 'Source' });
    var code = h('code');
    text.split('\n').forEach(function (line) {
      var ln = h('span', { class: 'pmw-art-ln' });
      if (lang === 'json') {
        var rx = /("(?:[^"\\]|\\.)*")(\s*:)?|(\b-?\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g, at = 0, m;
        while ((m = rx.exec(line))) {
          if (m.index > at) ln.appendChild(document.createTextNode(line.slice(at, m.index)));
          if (m[1]) { ln.appendChild(h('span', { class: m[2] ? 'pmw-art-tk-key' : 'pmw-art-tk-str', text: m[1] })); if (m[2]) ln.appendChild(document.createTextNode(m[2])); }
          else ln.appendChild(h('span', { class: m[3] ? 'pmw-art-tk-num' : 'pmw-art-tk-kw', text: m[0] }));
          at = rx.lastIndex;
        }
        if (at < line.length) ln.appendChild(document.createTextNode(line.slice(at)));
      } else if (lang === 'mermaid') {
        var mm = /^(\s*)(flowchart\s+\w+)?(.*)$/.exec(line);
        ln.appendChild(document.createTextNode(mm[1]));
        if (mm[2]) ln.appendChild(h('span', { class: 'pmw-art-tk-kw', text: mm[2] }));
        mm[3].split(/(-->|\|[^|]*\|)/).forEach(function (part) {
          if (!part) return;
          if (part === '-->') ln.appendChild(h('span', { class: 'pmw-art-tk-op', text: part }));
          else if (part.charAt(0) === '|') ln.appendChild(h('span', { class: 'pmw-art-tk-str', text: part }));
          else ln.appendChild(document.createTextNode(part));
        });
      } else ln.textContent = line;
      code.appendChild(ln);
      code.appendChild(document.createTextNode('\n'));
    });
    pre.appendChild(code);
    return pre;
  }
  function codeBody() {
    return [h('p', { class: 'pmw-art-lead', text: art.summary }), codeBlock(art.payload.content, art.payload.language)];
  }
  function sourceBody() {
    var lang = art.kind === 'mermaid' ? 'mermaid' : 'json';
    return [h('p', { class: 'pmw-art-fine', text: art.kind === 'mermaid' ? 'The diagram as written, in Mermaid.' : 'The data this view draws, as stored in ' + art.path + '.' }),
      h('div', { class: 'pmw-art-acts' }, [PMW.frames.button({ label: 'Copy source', icon: 'code', run: function () { copy(sourceText(), 'Source'); } })]),
      codeBlock(sourceText(), art.kind === 'code' ? art.payload.language : lang)];
  }
  function subtypeBody() {
    switch (art.kind) {
      case 'dashboard': return dashboardBody();
      case 'chart': return chartBody();
      case 'data': return dataBody();
      case 'mermaid': case 'architecture': case 'flowchart': return diagramBody();
      case 'quiz': return quizBody();
      case 'periodic': return periodicBody();
      case 'image': return imageBody();
      case 'evidence': return evidenceBody();
      case 'document': return documentBody();
      case 'code': return codeBody();
    }
    return [h('p', { text: 'This kind of artifact has no view here yet; Source shows it as written.' })];
  }

  /* ---- states ---- */
  function loadingBody() {
    var s = live(art.id), L = art.loading;
    var prog = s.progress != null ? s.progress : L.progress;
    var left = Math.max(0, Math.round(L.etaMs * (1 - prog) / 100) / 10);
    return [h('div', { class: 'pmw-art-loading', role: 'status', 'aria-live': 'polite' }, [
      h('p', { class: 'pmw-art-loadt' }, [h('b', { text: L.label }), h('span', { text: left > 0 ? ' · about ' + num(left, 1) + ' s left' : ' · almost done' })]),
      h('div', { class: 'pmw-art-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(prog * 100)), 'aria-label': L.label }, [
        h('span', { class: 'pmw-art-progbar', style: 'width:' + Math.round(prog * 100) + '%' })]),
      h('p', { class: 'pmw-art-fine', text: 'The forecast appears here when it is drawn. Nothing else waits on it.' })])];
  }
  function startLoading() {
    var s = live(art.id), L = art.loading;
    if (s.loaded || s.timer) return;
    var start = Date.now(), from = s.progress != null ? s.progress : L.progress, total = L.etaMs * (1 - from);
    s.timer = setInterval(function () {
      var t = Math.min(1, (Date.now() - start) / total);
      s.progress = from + (1 - from) * t;
      if (t >= 1) {
        clearInterval(s.timer); s.timer = 0; s.loaded = true; s.status = null; s.progress = null;
        if (!disposed && api.isVisible()) { render(); api.announce(art.title + ' is ready'); }
        else if (!disposed) dirtyWhileHidden = true;
        return;
      }
      if (!disposed && visible) {
        var bar = stage.querySelector('.pmw-art-progbar'), pb = stage.querySelector('.pmw-art-progress'), lt = stage.querySelector('.pmw-art-loadt span');
        if (bar) bar.style.width = Math.round(s.progress * 100) + '%';
        if (pb) pb.setAttribute('aria-valuenow', String(Math.round(s.progress * 100)));
        if (lt) { var left = Math.max(0, Math.round(L.etaMs * (1 - s.progress) / 100) / 10); lt.textContent = left > 0 ? ' · about ' + num(left, 1) + ' s left' : ' · almost done'; }
      }
    }, 120);
  }
  var dirtyWhileHidden = false;
  function retry() {
    var s = live(art.id), e = art.error;
    s.retrying = true;
    render();
    var t = setTimeout(function () {
      s.retrying = false;
      s.retries = (s.retries || 0) + 1;
      if (e.recovers) { s.status = 'ready'; api.announce(art.title + ' drawn again with account keys'); }
      else api.announce('Retried: the source still has no points');
      if (!disposed) render();
    }, PMW.reduced() ? 300 : 900);
    timers.push(t);
  }

  function metaItems() {
    var stt = status(), s = live(art.id);
    var word = s.retrying ? 'Rendering' : (stt === 'ready' && s.pinned ? 'Pinned' : STATUS_WORD[stt] || 'Ready');
    var cls = stt === 'error' && !s.retrying ? 'bad' : stt === 'stale' ? 'warn' : null;
    var items = [KIND_WORD[art.kind], older ? 'Version ' + shownVersion + ' of ' + art.version : 'Version ' + shownVersion, cls ? { text: word, state: cls } : word,
      s.refreshed ? 'refreshed just now' : older ? 'kept as written' : art.updated];
    if (THREADS[art.thread]) items.push('from ' + THREADS[art.thread]);
    return items;
  }

  function identity() {
    var d = h('details', { class: 'pmw-art-ident' }, [h('summary', { text: 'Identity and source' })]);
    var dl = h('dl');
    [['Artifact', art.title], ['Version', shownVersion + (older ? ' (current is ' + art.version + ')' : ' (current)')], ['Kind', KIND_WORD[art.kind]],
      ['Thread', THREADS[ref.thread || art.thread] || 'This project'], ['Source file', art.path],
      ['Currentness', older ? 'Superseded by version ' + art.version : status() === 'stale' ? 'A newer source exists' : 'Current']].forEach(function (r) {
      dl.appendChild(h('dt', { text: r[0] })); dl.appendChild(h('dd', { text: r[1] }));
    });
    d.appendChild(dl);
    return d;
  }

  function body() {
    if (missing) {
      var why = ref.broken ? 'This link to an artifact could not be read.' : !art ? 'This artifact revision no longer exists.' : 'This version was never written: the newest is version ' + art.version + '.';
      return [note('warn', 'problems', 'Unavailable', why, art ? [{ label: 'Open the current version', icon: 'artifact', run: function () { openVersion(art.version); } }] : null)];
    }
    var out = [], stt = status(), s = live(art.id);
    if (older) out.push(note('warn', 'history', 'An older version', 'Version ' + shownVersion + ' is kept exactly as it was written. Version ' + art.version + ' is current.',
      [{ label: 'Open version ' + art.version, icon: 'artifact', run: function () { openVersion(art.version); } }]));
    if (stt === 'stale' && !s.pinned && !older) {
      out.push(note('warn', 'clock', 'A newer source exists', art.staleReason + ' Refresh this view, look at the versions, or keep this one.', [
        { label: 'Refresh this view', icon: 'reload', run: function () { s.status = 'ready'; s.refreshed = true; render(); api.announce('Refreshed from the newest source'); } },
        { label: 'Keep this version', run: function () { s.pinned = true; render(); api.announce('Kept this version'); } }]));
    }
    if (stt === 'loading' && !s.retrying) { out = out.concat(loadingBody()); startLoading(); return out; }
    if (s.retrying) return out.concat([h('div', { class: 'pmw-art-loading', role: 'status' }, [h('p', { class: 'pmw-art-loadt' }, [h('b', { text: 'Drawing it again' }), h('span', { text: ' · reading the same source' })]),
      h('div', { class: 'pmw-art-progress is-indeterminate', 'aria-hidden': 'true' }, [h('span', { class: 'pmw-art-progbar' })])])]);
    if (stt === 'error') {
      var e = art.error;
      out.push(note('bad', 'problems', s.retries ? 'Still could not draw this view' : 'This view could not be drawn', e.reason + ' ' + e.detail, [
        { label: e.retryLabel, icon: 'reload', primary: true, run: retry },
        { label: 'Show source', icon: 'code', run: function () { setView('source'); } }]));
      if (!e.recovers) {
        out.push(h('div', { class: 'pmw-art-empty' }, [h('p', { text: 'Nothing to draw: ' + art.payload.metric.toLowerCase() + ' has no points yet.' }),
          h('p', { class: 'pmw-art-fine', text: 'When the source gains points, this view draws them on the next refresh.' })]));
      }
      if (st.view !== 'source') return out;
    }
    if (st.view === 'source') return out.concat(sourceBody());
    if (art.kind !== 'document' && art.kind !== 'code' && art.summary) out.push(h('p', { class: 'pmw-art-lead', text: art.summary }));
    out = out.concat(subtypeBody());
    if (ref.revision) out.push(identity());
    return out;
  }

  function render() {
    if (disposed) return;
    var keep = frame && frame._scroll ? frame._scroll.scrollTop : 0;
    stage.textContent = '';
    var title = art ? art.title : 'Unavailable artifact';
    frame = PMW.frames.doc({
      title: title,
      badge: ref.revision && shownVersion ? 'V' + shownVersion : null,
      meta: art && !missing ? metaItems() : ['artifact', ref.version ? 'Version ' + ref.version : null, { text: 'Unavailable', state: 'warn' }],
      body: body(),
      cls: 'pmw-art-doc pmw-art-k-' + (art ? art.kind : 'missing')
    });
    if (ref.revision) frame._head.insertBefore(h('p', { class: 'pmw-art-eyebrow', text: 'Retained artifact · V' + (shownVersion || '?') }), frame._head.firstChild);
    frame._scroll.setAttribute('tabindex', '-1');
    stage.appendChild(frame);
    if (keep) frame._scroll.scrollTop = keep;
    centreFigures();
  }
  /* Fit wraps a diagram's wide rows to the figure's width; a drawing still wider than the panel (Actual size, an image,
     a single node wider than the panel) scrolls sideways and starts centred, where the flow is */
  function centreFigures() {
    Array.prototype.forEach.call(stage.querySelectorAll('.pmw-art-fig'), function (f) {
      if (f._fit && f.clientWidth) {
        var cs = getComputedStyle(f), w = Math.floor(f.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
        if (w > 0 && w !== f._fitW) {
          f._fitW = w;
          var next = f._fit(w), cur = f.querySelector('.pmw-art-svg');
          if (cur && next.getAttribute('viewBox') !== cur.getAttribute('viewBox')) f.replaceChild(next, cur);
        }
      }
      if (f.scrollWidth > f.clientWidth + 1) f.scrollLeft = (f.scrollWidth - f.clientWidth) / 2;
    });
  }
  render();

  return {
    onShow: function () {
      visible = true;
      var s = art && live(art.id);
      if (dirtyWhileHidden || (s && art.status === 'loading' && s.loaded && stage.querySelector('.pmw-art-loading'))) { dirtyWhileHidden = false; render(); }
      else centreFigures();
    },
    onHide: function () { visible = false; },
    onResize: function (sz) { if (sz.final) centreFigures(); },
    /* a reopen that names a view (view: 'source') shows it; any other key is ignored */
    reveal: function (s) {
      var v = s && s.view;
      if (typeof v === 'string' && !missing && viewOpts.some(function (o) { return o.value === v; })) setView(v);
    },
    focus: function () { if (frame && frame._scroll) frame._scroll.focus({ preventScroll: true }); },
    unmount: function () {
      disposed = true;
      timers.forEach(clearTimeout);
      // a loading render keeps going in the session (it is state, not motion) so a reopened tab shows the result
    },
    serialize: function () { return { view: st.view, metric: st.metric, filter: st.filter, sort: st.sort, answers: st.answers }; }
  };
}

PM_HOME.registerKind('artifact', {
  label: 'Artifact',
  group: 'Artifacts',
  icon: 'artifact',
  prefixes: ['artifact:', 'artifact-revision:'],
  min: { w: 280, h: 160 },
  document: true,
  /* an artifact opened in the background or by an agent mounts lazily; its strip label comes from here until then */
  labelFor: function (id) { return labelFor(id); },
  idFor: function (spec) {
    var a = spec.artifactId || spec.artifact;
    if (!a) return null;
    return spec.version && ART[a] && spec.version !== ART[a].version ? 'artifact:' + a + '@v' + spec.version : a;
  },
  /* one tab per artifact: artifact:<id> and artifact:<id>@v<current> are the chat's bare id */
  canonical: function (id) {
    var m = /^artifact:([^@]+)(?:@v(\d+))?$/.exec(id);
    if (m && ART[m[1]] && (!m[2] || Number(m[2]) === ART[m[1]].version)) return m[1];
    return id;
  },
  plus: {
    order: 60,
    label: 'Artifact...',
    keywords: 'artifact chart diagram dashboard report quiz image evidence',
    pick: function (ctx) { PMW.catalogPicker(ctx.anchor, { kind: 'artifact', title: 'Open an artifact', panelId: ctx.panelId, newPanel: ctx.newPanel }); }
  },
  mount: mountArtifact
});

PM_HOME.catalog.add('artifact', Object.keys(ART).map(function (id) {
  var a = ART[id];
  return { id: id, label: a.title, sub: KIND_WORD[a.kind] + ' · Version ' + a.version + ' · ' + STATUS_WORD[a.status], icon: 'artifact',
    keywords: a.kind + ' ' + KIND_WORD[a.kind] + ' ' + (THREADS[a.thread] || ''), spec: { id: id, kind: 'artifact', label: a.title } };
}).concat([{ id: 'artifact-revision:' + encodeURIComponent(JSON.stringify({ artifact_id: 'dashboard-query', artifact_version: 4, project_id: 'pm', thread_id: 'query' })),
  label: 'Query Benchmark Dashboard · V4', sub: 'dashboard · an older version, kept as written', icon: 'artifact', keywords: 'version revision retained',
  spec: { id: 'artifact-revision:' + encodeURIComponent(JSON.stringify({ artifact_id: 'dashboard-query', artifact_version: 4, project_id: 'pm', thread_id: 'query' })), kind: 'artifact', label: 'Query Benchmark Dashboard · V4' } }]));
