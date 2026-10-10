/* The Plan viewer kind (D9: "Plan viewer (sticky Build / Revise / More footer)") and Deep Plan discovery.
   Ids: plan:<planId>, the chat's alias plan-query (canonical plan:ap-index), deep-discovery:<runId>.
   Content is the 5.6 Pro chat's demo (plans.js, deep-plan-batch14.js), drawn in the shared document frame
   (PMW.frames.doc) with the chat's bans replaced (digest 05 sections 2-4): no pills or boxed step chips (one plain meta
   line per step), no per-step cards and no inner max-height (the tab body is the only scroller), the Markdown rail's
   dot character drawn in CSS, the Build control always the same button. The header row carries the tab-level controls
   (Rich Text / Markdown, Versions, Copy Markdown, Maximize); the footer carries Build / Revise / More.
   File references in steps follow D7 (click previews, double click keeps, Alt+click a new panel, Ctrl+click behind). */

var D = document;
var DBL_MS = 240;          // a click waits this long for a second one before it opens a preview (D7)
var TICK_MS = 2600;        // the demo build finishes one step this often while the tab is visible
var NARROW_FOOT = 420;     // below this body width the footer shows Build + More only (Revise moves into More)

function h(tag, attrs, kids) {
  var el = D.createElement(tag);
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
  add(el, kids);
  return el;
}
function add(el, kids) {
  if (kids == null || kids === false) return el;
  if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) add(el, kids[i]); return el; }
  el.appendChild(typeof kids === 'string' || typeof kids === 'number' ? D.createTextNode(String(kids)) : kids);
  return el;
}
var SVGNS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs, kids) {
  var el = D.createElementNS(SVGNS, tag);
  for (var k in (attrs || {})) if (attrs[k] != null) el.setAttribute(k, String(attrs[k]));
  (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? D.createTextNode(c) : c); });
  return el;
}
function svgBox(w, hh, kids, cls) {
  return sv('svg', { viewBox: '0 0 ' + w + ' ' + hh, width: w, height: hh, class: cls || null, 'aria-hidden': 'true', focusable: 'false' }, kids);
}
function base(path) { return String(path || '').split('/').pop(); }
function reduced() { try { return PMW.reduced(); } catch (_) { return false; } }
function saveSoon() { try { if (PMW.persist && PMW.persist.saveSoon) PMW.persist.saveSoon(); } catch (_) {} }
function copyText(text, done) {
  function fallback() {
    var ta = h('textarea', { class: 'pmw-plan-clip', 'aria-hidden': 'true' });
    ta.value = text;
    (PMW.overlay ? PMW.overlay() : D.body).appendChild(ta);
    ta.select();
    try { D.execCommand('copy'); } catch (_) {}
    ta.remove();
    PMW.toast(done);
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { PMW.toast(done); }, fallback); return; }
  } catch (_) {}
  fallback();
}
function download(name, text, type) {
  try {
    var a = D.createElement('a');
    var url = URL.createObjectURL(new Blob([text], { type: type || 'text/markdown' }));
    a.href = url; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  } catch (_) {}
}

/* ---- the plan document model (the chat's block list) ---- */
function H(text, level) { return { t: 'h', text: text, level: level || 2 }; }
function P(text) { return { t: 'p', text: text }; }
function UL(items) { return { t: 'ul', items: items }; }
function TABLE(head, rows) { return { t: 'table', head: head, rows: rows }; }
function CODE(lang, text) { return { t: 'code', lang: lang, text: text }; }
function ART(id, label, kind, version, sub) { return { t: 'art', id: id, label: label, kind: kind, version: version, sub: sub }; }
function CALLOUT(tone, text) { return { t: 'callout', tone: tone, text: text }; }
function STEP(id, title, text, after, parallel, files) { return { t: 'step', id: id, title: title, text: text, after: after || [], parallel: parallel || null, files: files || null }; }
function SUBSTEP(id, parent, title, text, after) { return { t: 'step', id: id, parent: parent, title: title, text: text, after: after || [] }; }
function EMBED(o) { return Object.assign({ t: 'embed' }, o); }

var IDX_V1 = [
  H('Objective'),
  P('Add a composite index to the tenant-scoped analytics read path so the dashboard stops timing out.'),
  H('Steps'),
  STEP('ps-1', 'Add the composite index', 'Create idx_events_tenant_created over (tenant_id, created_at DESC).'),
  STEP('ps-2', 'Re-run the benchmark', 'Confirm the read win against the existing benchmark harness.', ['ps-1'])
];
var IDX_V2 = [
  H('Objective'),
  P('Add a composite index to the tenant-scoped analytics read path and measure it against a benchmark fixture that matches production row shape.'),
  H('Measured starting point'),
  TABLE(['Measurement', 'Reported', 'At production row shape'], [['p95 read', '310 ms', '482 ms'], ['Rows in fixture', '3,200', '128,400'], ['Tenants', '8', '214']]),
  H('Steps'),
  STEP('ps-0', 'Correct the benchmark fixture', 'Rebuild the fixture at 214 tenants and 128,400 rows before any change is measured.'),
  STEP('ps-1', 'Add the composite index', 'Create idx_events_tenant_created over (tenant_id, created_at DESC).', ['ps-0']),
  STEP('ps-2', 'Re-run the benchmark', 'Record p50, p95 and throughput against the corrected fixture.', ['ps-1'])
];
var IDX_V3 = IDX_V2.slice(0, 5).concat([
  STEP('ps-0', 'Correct the benchmark fixture', 'Rebuild the fixture at 214 tenants and 128,400 rows before any change is measured.'),
  STEP('ps-1', 'Add the composite index', 'Create idx_events_tenant_created over (tenant_id, created_at DESC).', ['ps-0']),
  STEP('ps-2', 'Remove the N+1 fan-out', 'Replace the per-tenant loop with one tenant-first batched query.', ['ps-1']),
  STEP('ps-3', 'Measure write amplification', 'Insert 50,000 rows and record the write overhead the index adds.', ['ps-1']),
  H('Acceptance'),
  UL(['p95 read below 100 ms at production row shape', 'No tenant crossover in the isolation test', 'Write overhead below 8%'])
]);
var IDX_V4 = IDX_V3.concat([
  H('Rollback'),
  P('The forward migration is rehearsed against a restored snapshot before it ships. The materialized view stays documented as a fallback rather than becoming the default: it adds refresh lag and a second piece of operational state for a win the index already delivers.'),
  CALLOUT('warning', 'The 8% write-amplification threshold comes from incident history, not from a principle. It is the largest write regression this project has never paged on.')
]);
var IDX_V5 = [
  H('Objective'),
  P('Bring the tenant-scoped analytics read path under a 100 ms p95 at production row shape without exceeding the accepted 8% write-amplification threshold, and ship it behind a rehearsed rollback.'),
  H('Measured starting point'),
  P('Every number below is measured against the corrected fixture. The originally reported 310 ms p95 was taken against an 8×400-row fixture small enough that a sequential scan wins, so it was hiding the effect it was supposed to measure.'),
  TABLE(['Measurement', 'Baseline', 'Target', 'Measured after'], [
    ['p95 read', '482 ms', '< 100 ms', '71 ms'],
    ['p50 read', '118 ms', '—', '24 ms'],
    ['Throughput', '1,420 rows/s', '—', '3,980 rows/s'],
    ['Write overhead', '0%', '< 8%', '+4.8%']
  ]),
  H('Steps'),
  STEP('ps-0', 'Correct the benchmark fixture', 'Rebuild the benchmark at 214 tenants and 128,400 rows, and record the baseline before any change lands.', [], null,
    [{ path: 'src/analytics/bench.rs', line: 44 }]),
  STEP('ps-1', 'Add the composite index', 'idx_events_tenant_created over (tenant_id, created_at DESC), created concurrently.', ['ps-0'], 'pg-index',
    [{ path: 'migrations/0043_tenant_created_index.sql', line: 1 }]),
  STEP('ps-2', 'Measure write amplification', '50,000 inserts, measured rather than estimated, against the accepted 8% ceiling.', ['ps-0'], 'pg-index'),
  STEP('ps-3', 'Remove the N+1 fan-out', 'One tenant-first batched query replaces the two per-tenant call sites.', ['ps-1'], null,
    [{ path: 'src/analytics/queries.rs', line: 128 }, { path: 'src/analytics/legacy_rollup.rs' }]),
  STEP('ps-4', 'Rehearse the rollback', 'Restore a snapshot and run the down migration before the forward migration ships.', ['ps-1'], null,
    [{ path: 'tests/analytics_query_test.rs', line: 31 }]),
  STEP('ps-5', 'Publish the comparison', 'Report the write cost beside the read win in the same artifact.', ['ps-2', 'ps-3'], null,
    [{ path: 'docs/query-performance.md' }]),
  H('Migration note', 3),
  P('CREATE INDEX CONCURRENTLY takes two table passes and cannot run inside a transaction block. Every migration file in this project is wrapped in one, so the index moves into its own no-transaction migration. This is the change that produced V4.'),
  CODE('sql', '-- 0043_events_tenant_created.sql\n-- pm:no-transaction\nCREATE INDEX CONCURRENTLY IF NOT EXISTS\n  idx_events_tenant_created\n  ON events (tenant_id, created_at DESC);'),
  H('Acceptance'),
  UL(['p95 read below 100 ms at production row shape', 'No incorrect tenant crossover in the isolation test',
    'Write overhead below 8%, measured over 50,000 inserts', 'All tests green, including the rollback rehearsal']),
  H('Evidence'),
  ART('dashboard-query', 'Query Benchmark Dashboard', 'dashboard', 6, 'p95 71 ms after, from 482 ms · write overhead +4.8%'),
  CALLOUT('warning', 'Two things are still unmeasured and are named rather than hidden: behaviour under concurrent write load, and whether the planner still selects the index after a statistics refresh under the current autovacuum settings.')
];

var CACHE_V1 = [
  H('Objective'),
  P('Replace the per-request cache stampede on the session read path with a single-flight loader, and prove the failure mode is gone under the load that produced it.'),
  H('What the ledger established'),
  P('Five sources were read before this Plan existed; the two that changed the shape of it are named here rather than summarised away.'),
  TABLE(['Source', 'What it settled'], [
    ['incident 2026-08-19 timeline', 'The stampede is on cold start, not steady state'],
    ['session_store.rs:210-288', 'Three call sites share one uninstrumented cache read'],
    ['bench/session_load.rs', 'The existing benchmark never models a cold cache']
  ]),
  H('Alternatives considered'),
  UL(['Single-flight loader — chosen. Bounded change, no new operational state.',
    'Probabilistic early expiry — rejected: smooths the curve but does not remove the stampede, and adds a tuning constant nobody owns.',
    'Warm on deploy — rejected as the primary fix: it hides cold start rather than fixing it, and the first cache miss after an eviction still stampedes.']),
  H('Steps'),
  STEP('cs-0', 'Instrument the cache read path', 'Add hit, miss and in-flight counters at the three call sites so the fix is measurable before it lands.', [], null,
    [{ path: 'src/session/session_store.rs', line: 210 }]),
  STEP('cs-1', 'Model cold start in the benchmark', 'Extend bench/session_load.rs with a cold-cache phase; the current benchmark cannot reproduce the incident.', ['cs-0'], null,
    [{ path: 'bench/session_load.rs' }]),
  STEP('cs-2', 'Add the single-flight loader', 'One in-flight future per key, shared by every waiter.', ['cs-0'], 'sf-core'),
  SUBSTEP('cs-2a', 'cs-2', 'Share one in-flight future per key', 'Replace the three independent loads with a keyed in-flight map.', ['cs-0']),
  SUBSTEP('cs-2b', 'cs-2', 'Bound the shared future', 'A shared future needs one owner for timeout and cancellation; this is that decision.', ['cs-2a']),
  STEP('cs-3', 'Decide the failure policy', 'A failed load must not be cached and must not leave waiters hanging; this is a behaviour decision, not a detail.', ['cs-0'], 'sf-core'),
  STEP('cs-4', 'Re-run under the incident load', 'Reproduce the incident profile against the corrected benchmark.', ['cs-1', 'cs-2', 'cs-3']),
  STEP('cs-5', 'Validate eviction behaviour', 'Confirm an eviction mid-flight does not bring back a stale value.', ['cs-2']),
  STEP('cs-6', 'Backfill the ops dashboard panel', 'Show the new counters where the on-call already looks.', ['cs-0']),
  H('Risks'),
  UL(['A shared future turns three independent timeouts into one shared timeout; the failure policy step exists because of that.',
    'The counters added in cs-0 are permanent surface area, not scaffolding, and are named in the acceptance list for that reason.']),
  H('Acceptance'),
  UL(['No more than one origin load per key per cold-start window, measured', 'Waiters observe the same error as the loader, and no error is cached',
    'p99 cold-start latency below the incident threshold', 'Eviction mid-flight yields no stale read']),
  CALLOUT('info', 'This plan keeps a ledger of what it read and decided. Its build units are made when it builds, for this version only.')
];

var AUTH_V2 = [
  H('Objective'),
  P('Move refresh-token rotation off the request path so a slow identity provider stops holding request threads.'),
  H('Steps'),
  STEP('as-0', 'Move rotation to the background worker', 'Rotation runs ahead of expiry rather than on the first request that notices.', [], null, [{ path: 'src/routes/auth.rs' }]),
  STEP('as-1', 'Keep a synchronous fallback', 'If the background rotation has not run, the request path still rotates rather than failing.', ['as-0']),
  STEP('as-2', 'Alarm on fallback use', 'A fallback that fires regularly means the background path is broken and silent.', ['as-1']),
  H('Acceptance'),
  UL(['No request-path rotation under normal operation', 'Fallback path exercised by test and alarmed in production'])
];

var FLAGS_V1 = [
  H('Objective'),
  P('Introduce a typed feature-flag facade over the three ad-hoc flag lookups in the billing path.'),
  H('Steps'),
  STEP('fs-0', 'Inventory the existing lookups', 'Three call sites, two of which disagree about the default.'),
  STEP('fs-1', 'Define the typed facade', 'One accessor, one default, one place to change it.', ['fs-0'])
];

var EMBED_V1 = [
  H('Objective'),
  P('Carry the measured evidence for the read-path work inside the Plan itself, at the exact artifact versions that were approved, so a later change to any of them cannot silently change what this Plan says.'),
  H('Evidence'),
  EMBED({ artifact: 'art-flow-read-path', version: 3, kind: 'mermaid', caption: 'Read path before and after the index change',
    summary: 'Two lanes: the current path fans out per tenant row; the corrected path resolves one covering index scan.', fallback: 'picture' }),
  EMBED({ artifact: 'art-p99-by-tenant', version: 7, kind: 'chart', caption: 'p99 by tenant size, 24h window',
    summary: 'p99 rises linearly with tenant row count above 40k rows; below that it is flat.', fallback: 'picture' }),
  EMBED({ artifact: 'art-call-graph', version: 2, kind: 'graph', caption: 'Call graph for the analytics read',
    summary: 'Four call sites reach the same query builder; two of them bypass the tenant scope.', fallback: 'picture' }),
  EMBED({ artifact: 'art-explain-plan', version: 1, kind: 'image', caption: 'EXPLAIN ANALYZE output, annotated',
    summary: 'Sequential scan on analytics_events with a 41× row estimate error.', fallback: 'picture' }),
  EMBED({ artifact: 'art-schema-delta', version: 4, kind: 'diagram', caption: 'Schema delta',
    summary: 'One partial index added; no column change; no destructive migration.', fallback: 'picture' }),
  EMBED({ artifact: 'art-rollout-checks', version: 2, kind: 'checklist', caption: 'Rollout checks',
    summary: 'Six checks, all read-only, none of which is a To-Do: this is a document block, not the To-Do list.' }),
  EMBED({ artifact: 'art-repro-capture', version: 1, kind: 'video', caption: 'Reproduction capture, 38 s',
    summary: 'Screen capture of the stall reproducing under the 40k-row tenant.', fallback: 'still frame' }),
  EMBED({ artifact: 'art-latency-explorer', version: 5, kind: 'interactive', caption: 'Latency explorer',
    summary: 'Filterable latency table; runs sandboxed, and exports as the static table below.', fallback: 'static table', sandboxed: true }),
  TABLE(['Renderer', 'Frozen version', 'PDF behaviour'], [['mermaid', 'V3', 'rendered'], ['chart', 'V7', 'rendered'], ['video', 'V1', 'still frame + caption'], ['interactive', 'V5', 'static table + caption']]),
  CODE('sql', 'CREATE INDEX CONCURRENTLY idx_events_tenant_created\n  ON analytics_events (tenant_id, created_at DESC);'),
  H('Embeds that could not resolve'),
  P('Four blocks below name why they are unavailable. None of them was dropped, and none of them resolved to a different version of the same artifact.'),
  EMBED({ artifact: 'art-deleted-trace', version: 1, kind: 'chart', caption: 'Trace waterfall', summary: 'The referenced version no longer exists.', state: 'missing' }),
  EMBED({ artifact: 'art-row-counts', version: 2, kind: 'chart', caption: 'Row counts', summary: 'The approved V2 exists but its source data has been replaced; V5 is current.', state: 'stale' }),
  EMBED({ artifact: 'art-prod-dashboard', version: 9, kind: 'image', caption: 'Production dashboard', summary: 'Reading this artifact needs a permission this project does not hold.', state: 'denied' }),
  EMBED({ artifact: 'art-cad-model', version: 1, kind: 'cad', caption: 'CAD model', summary: 'Nothing here can draw a CAD model yet.', state: 'unsupported' }),
  CALLOUT('info', 'An approved Plan reads the frozen version of every artifact. Changing any artifact above later does not change one byte of this document; the Plan would show an unavailable block rather than a different picture.')
];

var PLANS = {
  'ap-index': { title: 'Tenant-scoped analytics read path', strategy: 'Thorough', version: 5, status: 'ready', thread: 'Query performance',
    revisions: { 1: IDX_V1, 2: IDX_V2, 3: IDX_V3, 4: IDX_V4, 5: IDX_V5 },
    log: [{ v: 1, at: '11:20', why: 'First draft from the request.' }, { v: 2, at: '11:42', why: 'Benchmark fixture did not match production row shape.' },
      { v: 3, at: '12:05', why: 'Add the N+1 fan-out and write-amplification work.' }, { v: 4, at: '12:31', why: 'CREATE INDEX CONCURRENTLY cannot run inside a transaction.' },
      { v: 5, at: '12:58', why: 'Fold in measured results and name what is still unmeasured.' }],
    schedule: { text: 'Builds weeknights 10 PM–2 AM (Chicago time)', next: 'next: tonight' } },
  'ap-cache': { title: 'Session cache stampede', strategy: 'Deep · Thorough', version: 1, status: 'building', thread: 'Deep Plan',
    revisions: { 1: CACHE_V1 }, log: [{ v: 1, at: '9:30 PM', why: 'Deep Plan requested for the incident.' }],
    build: { done: 2, waiting: true },
    window: 'Outside the build window (10 PM–6 AM). The build picks up again when the window opens.',
    history: [{ at: '9:52 PM', what: 'Attempt 1 stopped: the connection to the model dropped mid-step. Nothing it did was repeated.', state: 'bad' },
      { at: '10:04 PM', what: 'Attempt 2 started from the step that stopped.', state: null }] },
  'ap-auth': { title: 'Refresh-token rotation off the request path', strategy: 'Standard', version: 2, status: 'completed', thread: 'Query performance',
    revisions: { 1: AUTH_V2, 2: AUTH_V2 }, log: [{ v: 1, at: 'Sep 1', why: 'First draft.' }, { v: 2, at: 'Sep 1', why: 'Added the alarm on fallback use.' }] },
  'ap-flags': { title: 'Typed feature-flag facade', strategy: 'Quick', version: 1, status: 'canceled', thread: 'Query performance',
    revisions: { 1: FLAGS_V1 }, log: [{ v: 1, at: 'Aug 30', why: 'First draft.' }],
    canceled: 'Canceled when a new Plan was asked for in the same thread while this one was still unfinished.' },
  'ap-embeds': { title: 'Evidence pack for the read-path work', strategy: 'Thorough', version: 1, status: 'completed', thread: 'Query performance',
    revisions: { 1: EMBED_V1 }, log: [{ v: 1, at: '13:10', why: 'Every renderer, frozen to an exact version.' }] }
};

/* ---- Deep Plan discovery (deep-plan-batch14.js), one demo run ---- */
var STATE_WORD = { proposed: 'Not asked', researching: 'Checking source', researched: 'Source checked', reused: 'Reused answer',
  answered: 'Answered', presented: 'Awaiting your decision', stale: 'Source changed', unresolved: 'Unresolved' };
var FIELD_SOURCE = '{\n  "source": "Export field inventory",\n  "version": 1,\n  "fields": [\n    { "name": "title", "sensitive": false },\n' +
  '    { "name": "created_at", "sensitive": false },\n    { "name": "tags", "sensitive": false },\n    { "name": "private_notes", "sensitive": true },\n' +
  '    { "name": "access_token", "sensitive": true }\n  ]\n}';
var ANSWER_SOURCE = '{\n  "source": "Recorded planning answer",\n  "version": 1,\n  "question": "Does the export require a network?",\n' +
  '  "answer": "The export must work without a network connection.",\n  "recorded": "2026-09-28"\n}';
function discoveryRun() {
  return {
    objective: 'Plan a reversible offline collection export without leaking sensitive fields.',
    strategy: 'Thorough', base: 20, grill: 25,
    questions: [
      { id: 'offline', prompt: 'Does the export require a network?', type: 'decision', state: 'reused', who: 'Planner', required: true,
        answer: 'The export must work without a network connection.', source: { name: 'Recorded planning answer.json', text: ANSWER_SOURCE, id: 'buffer:discovery-answer' } },
      { id: 'fields', prompt: 'Which supplied fields can be exported?', type: 'fact', state: 'researched', who: 'Researcher', required: true,
        answer: 'Exported: title, created_at and tags. Kept out: private_notes and access_token, both marked sensitive.',
        source: { name: 'Export field inventory.json', text: FIELD_SOURCE, id: 'buffer:discovery-fields' } },
      { id: 'format', prompt: 'Which export format should be primary?', type: 'decision', state: 'presented', who: 'Planner', required: true,
        options: ['CSV with explicit quoting', 'JSON with a schema version'] },
      { id: 'rollout', prompt: 'How should the first rollout proceed?', type: 'decision', state: 'proposed', who: 'Planner', required: false,
        options: ['Opt-in with a reversible fallback', 'One internal collection first'] }
    ]
  };
}
var DISCOVERY = {};   // runId -> live run (one per tab; one tab per id)
function discoveryFor(runId, saved) {
  if (!DISCOVERY[runId]) {
    var run = discoveryRun();
    run.grillOn = false; run.preview = false; run.created = false; run.choices = {};
    if (saved) {
      run.grillOn = !!saved.grillOn; run.created = !!saved.created; run.preview = !!saved.preview;
      run.choices = saved.choices || {};
      (saved.asked || []).forEach(function (qid) { run.questions.forEach(function (q) { if (q.id === qid && q.state === 'proposed') q.state = 'presented'; }); });
      run.questions.forEach(function (q) { if (run.choices[q.id] != null) q.state = 'answered'; });
    }
    DISCOVERY[runId] = run;
  }
  return DISCOVERY[runId];
}
/* the Plan that "Create this Plan" makes, from the frozen answers */
function exportPlanFrom(run) {
  var fmt = run && run.choices.format, roll = run && run.choices.rollout;
  var fmtText = fmt != null ? run.questions[2].options[fmt] : null, rollText = roll != null ? run.questions[3].options[roll] : null;
  var blocks = [
    H('Objective'), P('Plan a reversible offline collection export without leaking sensitive fields.'),
    H('Decisions'),
    UL(['Works without a network connection (a recorded answer, reused).', 'Exports title, created_at and tags; private_notes and access_token stay out.',
      'Primary format: ' + (fmtText || 'not decided yet') + '.', 'First rollout: ' + (rollText || 'not decided yet') + '.']),
    H('Steps'),
    STEP('es-0', 'Build the field allow-list', 'Only title, created_at and tags pass; every other field is dropped before anything is written.'),
    STEP('es-1', 'Write the export', fmtText ? 'Write the collection as ' + fmtText + '.' : 'Write the collection in the format chosen before Build.', ['es-0']),
    STEP('es-2', 'Prove nothing sensitive leaks', 'A test fails if private_notes or access_token appear in any export.', ['es-1']),
    STEP('es-3', 'Roll out', rollText ? rollText + '.' : 'Roll out the way chosen before Build.', ['es-2']),
    H('Acceptance'),
    UL(['The export works with the network off', 'No sensitive field appears in any export, by test', 'Turning the export off restores the previous behaviour'])
  ];
  if (!fmtText || !rollText) blocks.push(CALLOUT('warning', 'Open items were frozen with this Plan: ' + [!fmtText ? 'the export format' : null, !rollText ? 'the first rollout' : null].filter(Boolean).join(' and ') + '. Build stays blocked until they are answered.'));
  return { title: 'Offline collection export', strategy: 'Deep · Thorough', version: 1, status: 'ready', thread: 'Deep Plan',
    revisions: { 1: blocks }, log: [{ v: 1, at: 'now', why: 'Created from discovery.' }], blocked: !fmtText || !rollText };
}

/* ---- live build state per plan (one tab per id, so one record per plan) ---- */
var LIVE = {};
function liveFor(planId, plan, saved) {
  if (!LIVE[planId]) {
    var b = plan.build || {};
    LIVE[planId] = { status: plan.status, done: b.done || 0, waiting: !!b.waiting, confirmCancel: false };
    if (saved && saved.status) { LIVE[planId].status = saved.status; LIVE[planId].done = saved.done || 0; LIVE[planId].waiting = !!saved.waiting; }
  }
  return LIVE[planId];
}
/* the discovery's answers as last saved with the layout (its tab may not be mounted yet after a reload) */
function savedRun(runId) {
  try { var t = PMW.state.layout.tabs['deep-discovery:' + runId]; return t && t.state && t.state.run ? t.state.run : null; } catch (_) { return null; }
}
function planById(planId) {
  if (planId === 'ap-export') {
    var saved = DISCOVERY['b14-thorough-1'] ? null : savedRun('b14-thorough-1');
    return exportPlanFrom(DISCOVERY['b14-thorough-1'] || (saved ? discoveryFor('b14-thorough-1', saved) : null));
  }
  return PLANS[planId] || null;
}

/* ---- blocks, steps and their marks ---- */
function stepsOf(blocks) { return blocks.filter(function (b) { return b.t === 'step'; }); }
function stepStates(blocks, live) {
  var steps = stepsOf(blocks), out = {};
  steps.forEach(function (s, i) {
    var st = 'idle';
    if (live.status === 'completed') st = 'done';
    else if (live.status === 'building') st = i < live.done ? 'done' : i === live.done ? (live.waiting ? 'wait' : 'working') : 'next';
    else if (live.status === 'canceled') st = i < live.done ? 'done' : 'idle';
    out[s.id] = st;
  });
  return out;
}
var MARK_WORD = { done: 'done', working: 'working on it', wait: 'waiting for the build window', next: 'not started' };
function stepMark(state) {
  var kids;
  if (state === 'done') kids = [sv('circle', { cx: 8, cy: 8, r: 6.25 }), sv('path', { d: 'M5.2 8.3l1.9 1.9 3.8-4.2' })];
  else if (state === 'working') kids = [sv('circle', { cx: 8, cy: 8, r: 6.25, class: 'pmw-plan-mtrack' }), sv('path', { d: 'M8 1.75a6.25 6.25 0 0 1 6.25 6.25', class: 'pmw-plan-marc' })];
  else if (state === 'wait') kids = [sv('circle', { cx: 8, cy: 8, r: 6.25 }), sv('path', { d: 'M8 4.8V8l2.1 1.4' })];
  else kids = [sv('circle', { cx: 8, cy: 8, r: 5.75 })];
  return h('span', { class: 'pmw-plan-mark is-' + state, 'aria-hidden': 'true' }, [svgBox(16, 16, kids)]);
}

/* the Markdown projection (plans.js mdBlock): status lives in the rail, never in the bytes */
function md(b) {
  switch (b.t) {
    case 'h': return new Array(b.level + 1).join('#') + ' ' + b.text;
    case 'p': return b.text;
    case 'ul': return b.items.map(function (i) { return '- ' + i; }).join('\n');
    case 'table': return '| ' + b.head.join(' | ') + ' |\n|' + b.head.map(function () { return '---'; }).join('|') + '|\n' +
      b.rows.map(function (r) { return '| ' + r.join(' | ') + ' |'; }).join('\n');
    case 'code': return '```' + b.lang + '\n' + b.text + '\n```';
    case 'art': return '[' + b.label + '](' + b.kind + ':' + b.id + ')';
    case 'embed': return '![' + b.caption + '](' + b.artifact + '@v' + b.version + ' "' + b.kind + '")\n\n> ' + b.summary;
    case 'callout': return '> **' + (b.tone === 'warning' ? 'Warning' : 'Note') + '** ' + b.text;
    case 'step': return (b.parent ? '  ' : '') + '- **' + b.title + '** `' + b.id + '`' + (b.after.length ? ' _(after ' + b.after.join(', ') + ')_' : '') +
      (b.parallel ? ' _(parallel: ' + b.parallel + ')_' : '') + '\n      ' + (b.parent ? '  ' : '') + b.text;
  }
  return '';
}
function markdownOf(plan, version) {
  return '# ' + plan.title + '\n\n' + plan.revisions[version].map(md).join('\n\n') + '\n';
}

/* ---- D7 file references: click previews (after a beat, so a double click can keep), double click keeps, Alt+click
   opens a new panel, Ctrl/Cmd+click opens behind ---- */
function fileRef(api, ref, o) {
  o = o || {};
  var text = ref.path + (ref.line ? ':' + ref.line : '');
  var b = h('button', { type: 'button', class: 'pmw-plan-file' + (o.cls ? ' ' + o.cls : ''), 'data-k': 'file:' + text + (o.key || ''),
    'data-pm-hover-label': 'Open ' + base(ref.path), 'data-pm-hover-detail': 'Click to preview, double-click to keep, Alt+click for a new panel', 'data-pmh': 'icon' },
  [PMW.icon('file', { size: 13 }), h('span', { text: o.short ? base(ref.path) + (ref.line ? ':' + ref.line : '') : text })]);
  var timer = 0;
  function go(e, mode) {
    var spec = { kind: 'editor', path: ref.path, mode: mode };
    if (ref.line) spec.line = ref.line;
    if (e.altKey) spec.where = 'panel';
    if (e.ctrlKey || e.metaKey) spec.background = true;
    api.open(spec);
  }
  b.addEventListener('click', function (e) {
    if (e.detail > 1) return;
    if (e.detail === 0) { go(e, 'preview'); return; }   // keyboard activation: no double click to wait for
    var snap = { altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey };
    clearTimeout(timer);
    timer = setTimeout(function () { go(snap, 'preview'); }, DBL_MS);
  });
  b.addEventListener('dblclick', function (e) { clearTimeout(timer); go(e, 'keep'); });
  return b;
}

/* ---- embed previews: small, honest sketches of each renderer (one series, text in text colours) ---- */
var P99 = [['2k', 41], ['5k', 42], ['10k', 41], ['20k', 43], ['40k', 44], ['60k', 61], ['80k', 79], ['120k', 112]];
function embedPreview(b) {
  var k = b.kind, kids = [];
  if (k === 'chart') {
    var W = 320, HH = 112, x0 = 30, base0 = 92, top = 10, bw = 26, gap = 9, max = 120;
    kids.push(sv('line', { x1: x0, y1: base0, x2: W - 6, y2: base0, class: 'pmw-plan-pv-axis' }));
    [40, 80, 120].forEach(function (v) {
      var y = base0 - (v / max) * (base0 - top);
      kids.push(sv('line', { x1: x0, y1: y, x2: W - 6, y2: y, class: 'pmw-plan-pv-grid' }));
      kids.push(sv('text', { x: x0 - 6, y: y + 3.5, 'text-anchor': 'end', class: 'pmw-plan-pv-tick' }, [String(v)]));
    });
    P99.forEach(function (d, i) {
      var hgt = (d[1] / max) * (base0 - top), x = x0 + 8 + i * (bw + gap), y = base0 - hgt, r = 4;
      var path = 'M' + x + ' ' + base0 + 'V' + (y + r) + 'q0 -' + r + ' ' + r + ' -' + r + 'h' + (bw - 2 * r) + 'q' + r + ' 0 ' + r + ' ' + r + 'V' + base0 + 'z';
      kids.push(sv('path', { d: path, class: 'pmw-plan-pv-bar' }, [sv('title', {}, [d[0] + ' rows: p99 ' + d[1] + ' ms'])]));
      kids.push(sv('text', { x: x + bw / 2, y: base0 + 13, 'text-anchor': 'middle', class: 'pmw-plan-pv-tick' }, [d[0]]));
    });
    kids.push(sv('text', { x: x0, y: 8, class: 'pmw-plan-pv-tick' }, ['ms']));
    return svgBox(W, HH + 4, kids, 'pmw-plan-pv-svg');
  }
  if (k === 'mermaid' || k === 'diagram') {
    var boxes = k === 'mermaid'
      ? [[8, 12, 'request'], [118, 12, 'per-tenant loop'], [228, 12, 'events scan'], [8, 66, 'request'], [118, 66, 'batched query'], [228, 66, 'index scan']]
      : [[8, 38, 'events'], [118, 12, '+ partial index'], [118, 66, 'columns: no change'], [228, 38, 'migration 0043']];
    boxes.forEach(function (bx) {
      kids.push(sv('rect', { x: bx[0], y: bx[1], width: 92, height: 30, rx: 4, class: 'pmw-plan-pv-node' }));
      kids.push(sv('text', { x: bx[0] + 46, y: bx[1] + 19, 'text-anchor': 'middle', class: 'pmw-plan-pv-label' }, [bx[2]]));
    });
    var arrows = k === 'mermaid' ? [[100, 27, 118, 27], [210, 27, 228, 27], [100, 81, 118, 81], [210, 81, 228, 81]] : [[100, 46, 118, 30], [100, 60, 118, 76], [210, 27, 228, 46], [210, 81, 228, 62]];
    arrows.forEach(function (a) { kids.push(sv('path', { d: 'M' + a[0] + ' ' + a[1] + 'L' + a[2] + ' ' + a[3], class: 'pmw-plan-pv-edge' })); });
    return svgBox(328, 104, kids, 'pmw-plan-pv-svg');
  }
  if (k === 'graph') {
    var nodes = [[160, 18, 'query builder'], [40, 84, 'dashboard'], [120, 84, 'export'], [200, 84, 'alerts'], [280, 84, 'admin']];
    [1, 2, 3, 4].forEach(function (i) { kids.push(sv('path', { d: 'M' + nodes[i][0] + ' ' + (nodes[i][1] - 9) + 'L' + nodes[0][0] + ' ' + (nodes[0][1] + 9), class: 'pmw-plan-pv-edge' + (i > 2 ? ' is-off' : '') })); });
    nodes.forEach(function (n, i) {
      kids.push(sv('circle', { cx: n[0], cy: n[1], r: 7, class: 'pmw-plan-pv-dot' + (i > 2 ? ' is-off' : '') }));
      kids.push(sv('text', { x: n[0], y: n[1] + (i ? 22 : -12), 'text-anchor': 'middle', class: 'pmw-plan-pv-label' }, [n[2]]));
    });
    return svgBox(320, 112, kids, 'pmw-plan-pv-svg');
  }
  if (k === 'image') {
    return h('pre', { class: 'pmw-plan-pv-pre', 'data-pmh': 'off' }, [h('code', { text:
      'Seq Scan on analytics_events  (rows=128400 loops=1)\n  Filter: (tenant_id = 42)\n  Rows Removed by Filter: 125270\n  estimate 3,130 × 41 off\nPlanning Time: 0.21 ms\nExecution Time: 482.6 ms' })]);
  }
  if (k === 'checklist') {
    var items = ['Index exists on the replica', 'Planner picks the index', 'No lock longer than 2 s', 'Write overhead under 8%', 'Rollback rehearsed', 'Dashboards updated'];
    return h('ul', { class: 'pmw-plan-pv-list' }, items.map(function (t) {
      return h('li', null, [svgBox(14, 14, [sv('rect', { x: 1.5, y: 1.5, width: 11, height: 11, rx: 2 }), sv('path', { d: 'M4 7.2l2 2 4-4.4' })], 'pmw-plan-pv-check'), h('span', { text: t })]);
    }));
  }
  if (k === 'video') {
    kids.push(sv('rect', { x: 4, y: 4, width: 312, height: 96, rx: 4, class: 'pmw-plan-pv-node' }));
    kids.push(sv('path', { d: 'M150 36v32l26-16z', class: 'pmw-plan-pv-play' }));
    kids.push(sv('text', { x: 304, y: 92, 'text-anchor': 'end', class: 'pmw-plan-pv-tick' }, ['0:38']));
    return svgBox(320, 104, kids, 'pmw-plan-pv-svg');
  }
  if (k === 'interactive') {
    var rows = [['Tenant size', 'p50', 'p95', 'p99'], ['under 10k rows', '9 ms', '22 ms', '41 ms'], ['10k to 40k', '14 ms', '31 ms', '44 ms'], ['over 40k', '24 ms', '71 ms', '112 ms']];
    return h('table', { class: 'pmw-plan-pv-table' }, rows.map(function (r, i) { return h('tr', null, r.map(function (c) { return h(i ? 'td' : 'th', { text: c }); })); }));
  }
  return null;
}
var EMBED_STATE = { missing: 'Missing', stale: 'Out of date', denied: 'No access', unsupported: 'Cannot be shown' };

/* ---- the Plan tab ---- */
function mountPlan(host, state, api) {
  var tabId = api.id;
  var planId = tabId.indexOf('plan:') === 0 ? tabId.slice(5) : (state && state.plan) || 'ap-index';
  var plan = planById(planId);
  var root = h('div', { class: 'pmw-plan' });
  var stage = h('div', { class: 'pmw-plan-stage' });
  host.appendChild(root);
  if (!plan) {
    api.update({ label: 'Plan', title: 'Plan' });
    root.appendChild(stage);
    stage.appendChild(PMW.frames.doc({ title: 'This plan is not here', meta: ['Plan'], body: [h('p', { text: 'It may have been made in another thread or removed. Ask the chat to open it again.' })] }));
    return {};
  }
  var live = liveFor(planId, plan, state && state.live);
  var view = state && state.view === 'markdown' ? 'markdown' : 'rich';
  var viewing = state && state.version && plan.revisions[state.version] ? state.version : plan.version;
  var scrolls = (state && state.scrolls) || { rich: 0, markdown: 0 };
  var frame = null, timer = 0, visible = false, gone = false, width = 0, restored = false;

  api.update({ label: plan.title, title: plan.title + ' · Plan V' + plan.version });

  var seg = PMW.frames.seg([{ value: 'rich', label: 'Rich Text' }, { value: 'markdown', label: 'Markdown' }], view, function (v) {
    if (v === view) return;
    remember();
    view = v;
    paint();
    if (frame) frame._scroll.scrollTop = scrolls[view] || 0;
    api.announce(v === 'rich' ? 'Showing the plan as rich text' : 'Showing the plan as Markdown');
    saveSoon();
  }, { label: 'Plan view', cls: 'pmw-plan-hseg' });
  var versions = Object.keys(plan.revisions).length;
  var row = api.headerRow({
    label: 'Plan controls',
    left: [{ id: 'view', el: seg }],
    actions: [
      versions > 1 ? { id: 'versions', label: 'Versions', icon: 'history', detail: 'Read an earlier version of this plan', menu: versionMenu } : null,
      { id: 'copy', label: 'Copy Markdown', icon: 'document', detail: 'The plan as Markdown, for anywhere', run: function () { copyText(markdownOf(plan, viewing), 'Markdown copied'); } },
      { id: 'max', label: 'Maximize', icon: 'maximize', shortcut: 'Shift+Escape', run: function () { api.toggleMaximize(); } }
    ]
  });
  root.appendChild(row.el);
  root.appendChild(stage);
  api.on('maximize', syncMax);

  function syncMax() {
    var m = api.isMaximized();
    var b = row.action('max');
    if (b && (b.getAttribute('data-max') === 'on') !== m) {
      row.setAction('max', { label: m ? 'Restore' : 'Maximize', icon: m ? 'restore' : 'maximize' });
      var nb = row.action('max');
      if (nb) nb.setAttribute('data-max', m ? 'on' : 'off');
    }
  }
  function versionMenu() {
    var vs = Object.keys(plan.revisions).map(Number).sort(function (a, b) { return b - a; });
    return { id: 'plan-versions', title: 'Versions', width: 320, align: 'end', rows: vs.map(function (v) {
      var log = (plan.log || []).filter(function (x) { return x.v === v; })[0];
      return { id: 'v' + v, label: 'V' + v + (v === plan.version ? ' · current' : ''), sub: log ? log.at + ' · ' + log.why : '', checked: v === viewing,
        run: function () { if (v === viewing) return; remember(); viewing = v; paint(); if (frame) frame._scroll.scrollTop = 0; api.announce('Showing version ' + v); saveSoon(); } };
    }) };
  }
  function remember() { if (frame) scrolls[view] = frame._scroll.scrollTop; }

  /* ---- body ---- */
  function blocksNow() { return plan.revisions[viewing]; }
  function richBody(blocks, states) {
    var out = [], list = null;
    blocks.forEach(function (b) {
      if (b.t !== 'step') list = null;
      if (b.t === 'h') { out.push(h(b.level === 3 ? 'h3' : 'h2', { class: b.level === 3 ? 'pmw-plan-h3' : 'pmw-plan-h2', text: b.text })); return; }
      if (b.t === 'p') { out.push(h('p', { class: 'pmw-plan-p', text: b.text })); return; }
      if (b.t === 'ul') { out.push(h('ul', { class: 'pmw-plan-ul' }, b.items.map(function (t) { return h('li', { text: t }); }))); return; }
      if (b.t === 'table') { out.push(table(b)); return; }
      if (b.t === 'code') { var c = PMW.frames.code(b.text, { cls: 'pmw-plan-code' }); c.setAttribute('data-pmh', 'off'); c.setAttribute('aria-label', b.lang + ' code'); out.push(c); return; }
      if (b.t === 'art') { out.push(artifactRow(b)); return; }
      if (b.t === 'callout') { out.push(callout(b.tone, b.text)); return; }
      if (b.t === 'embed') { out.push(embed(b)); return; }
      if (b.t === 'step') {
        if (!list) { list = h('ol', { class: 'pmw-plan-steps' }); out.push(list); }
        list.appendChild(step(b, states[b.id]));
      }
    });
    return out;
  }
  function table(b) {
    return h('div', { class: 'pmw-plan-tablewrap', role: 'region', 'aria-label': b.head[0] + ' table', tabindex: '0' }, [
      h('table', { class: 'pmw-plan-table' }, [
        h('thead', null, [h('tr', null, b.head.map(function (c) { return h('th', { scope: 'col', text: c }); }))]),
        h('tbody', null, b.rows.map(function (r) { return h('tr', null, r.map(function (c, i) { return h(i ? 'td' : 'th', i ? { text: c } : { scope: 'row', text: c }); })); }))
      ])
    ]);
  }
  function callout(tone, text) {
    var warn = tone === 'warning';
    var glyph = warn
      ? svgBox(16, 16, [sv('path', { d: 'M8 2.4 14 13H2z' }), sv('path', { d: 'M8 6.6v3.2M8 11.4v.2' })])
      : svgBox(16, 16, [sv('circle', { cx: 8, cy: 8, r: 6 }), sv('path', { d: 'M8 7.2v4M8 4.9v.2' })]);
    return h('div', { class: 'pmw-plan-callout' + (warn ? ' is-warn' : ''), role: 'note' }, [
      h('span', { class: 'pmw-plan-callout-ico', 'aria-hidden': 'true' }, [glyph]),
      h('p', null, [h('b', { text: warn ? 'Warning ' : 'Note ' }), text])
    ]);
  }
  function openArtifact(e, spec) {
    var s = Object.assign({}, spec);
    if (e.altKey) s.where = 'panel';
    if (e.ctrlKey || e.metaKey) s.background = true;
    api.open(s);
  }
  function artifactRow(b) {
    var btn = h('button', { type: 'button', class: 'pmw-plan-art pmw-cur', 'data-k': 'art:' + b.id,
      'data-pm-hover-label': 'Open ' + b.label, 'data-pm-hover-detail': 'Opens the artifact; Alt+click opens it in a new panel' }, [
      PMW.kindIcon('artifact'),
      h('span', { class: 'pmw-plan-art-copy' }, [h('b', { text: b.label }), h('span', { text: b.kind + ' · V' + b.version + (b.sub ? ' · ' + b.sub : '') })]),
      h('span', { class: 'pmw-plan-art-go' }, ['Open', PMW.icon('chevronRight', { size: 13 })])
    ]);
    btn.addEventListener('click', function (e) { openArtifact(e, { id: b.id, kind: 'artifact', label: b.label }); });
    return btn;
  }
  function embed(b) {
    var off = !!b.state;
    var label = b.caption + ' · V' + b.version;
    var meta = ['V' + b.version, b.kind];
    if (b.sandboxed) meta.push('sandboxed');
    if (b.fallback && !off) meta.push('prints as a ' + b.fallback);
    var fig = h('figure', { class: 'pmw-plan-embed' + (off ? ' is-off' : ''), 'data-state': b.state || 'ok' }, [
      h('figcaption', { class: 'pmw-plan-embed-head' }, [h('b', { text: b.caption }), PMW.frames.meta(meta)])
    ]);
    if (off) {
      fig.appendChild(h('p', { class: 'pmw-plan-embed-off' }, [svgBox(14, 14, [sv('circle', { cx: 7, cy: 7, r: 5.5 }), sv('path', { d: 'M3.2 10.8l7.6-7.6' })]),
        h('b', { text: EMBED_STATE[b.state] || 'Unavailable' }), h('span', { text: b.summary })]));
      return fig;
    }
    var pv = embedPreview(b);
    if (pv) fig.appendChild(h('div', { class: 'pmw-plan-embed-pv', role: 'img', 'aria-label': b.caption }, [pv]));
    fig.appendChild(h('p', { class: 'pmw-plan-embed-sum', text: b.summary }));
    var open = h('button', { type: 'button', class: 'pmw-plan-link', 'data-k': 'embed:' + b.artifact, 'data-pm-hover-label': 'Open this exact version', 'data-pm-hover-detail': 'V' + b.version + ', frozen when the plan was approved' }, ['Open V' + b.version]);
    open.addEventListener('click', function (e) { openArtifact(e, { id: 'artifact:' + b.artifact + '@v' + b.version, kind: 'artifact', label: label, title: b.caption }); });
    fig.appendChild(h('div', { class: 'pmw-plan-embed-acts' }, [open]));
    return fig;
  }
  function step(b, st) {
    var li = h('li', { class: 'pmw-plan-step is-' + st + (b.parent ? ' is-child' : ''), id: domId('step', b.id), tabindex: '-1' });
    li.appendChild(stepMark(st));
    var body = h('div', { class: 'pmw-plan-step-body' });
    body.appendChild(h('p', { class: 'pmw-plan-step-title', text: b.title }));
    body.appendChild(h('p', { class: 'pmw-plan-step-text', text: b.text }));
    var meta = h('p', { class: 'pmw-plan-step-meta' }, [h('span', { class: 'pmw-plan-sid', text: b.id })]);
    function sep() { meta.appendChild(h('span', { class: 'pmw-plan-sep', 'aria-hidden': 'true', text: '·' })); }
    if (b.parent) { sep(); meta.appendChild(h('span', { text: 'part of ' })); meta.appendChild(depLink(b.parent, b.id)); }
    if (b.after.length) {
      sep();
      meta.appendChild(h('span', { text: 'after ' }));
      b.after.forEach(function (a, i) { if (i) meta.appendChild(D.createTextNode(', ')); meta.appendChild(depLink(a, b.id)); });
    }
    if (b.parallel) { sep(); meta.appendChild(h('span', { text: 'parallel with ' + b.parallel })); }
    if (MARK_WORD[st] && (live.status === 'building' || live.status === 'canceled')) { sep(); meta.appendChild(h('span', { class: 'pmw-plan-sstate is-' + st, text: MARK_WORD[st] })); }
    body.appendChild(meta);
    if (b.files && b.files.length) {
      body.appendChild(h('p', { class: 'pmw-plan-step-files' }, b.files.map(function (f) { return fileRef(api, f, { key: ':' + b.id }); })));
    }
    li.appendChild(body);
    return li;
  }
  function domId(kind, id) { return 'pmw-plan-' + kind + '-' + String(tabId).replace(/[^a-z0-9_-]/gi, '_') + '-' + id; }
  function depLink(id, from) {
    var b = h('button', { type: 'button', class: 'pmw-plan-dep', 'data-k': 'dep:' + from + ':' + id, 'data-pm-hover-label': 'Go to ' + id, 'data-pmh': 'icon', text: id });
    b.addEventListener('click', function () {
      var t = D.getElementById(domId('step', id));
      if (!t) return;
      t.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
      t.classList.remove('is-flash'); void t.offsetWidth; t.classList.add('is-flash');
      try { t.focus({ preventScroll: true }); } catch (_) {}
      setTimeout(function () { t.classList.remove('is-flash'); }, 1400);
    });
    return b;
  }
  function markdownBody(blocks, states) {
    var wrap = h('div', { class: 'pmw-plan-md', role: 'document', 'aria-label': 'The plan as Markdown', 'data-pmh': 'off' });
    blocks.forEach(function (b) {
      var st = b.t === 'step' ? states[b.id] : null;
      var dot = st === 'done' ? 'is-done' : st === 'working' || st === 'wait' ? 'is-now' : '';
      wrap.appendChild(h('div', { class: 'pmw-plan-mdrow' }, [
        h('span', { class: 'pmw-plan-mdrail' + (dot ? ' ' + dot : ''), 'aria-label': dot ? (st === 'done' ? 'Done' : 'In progress') : null, role: dot ? 'img' : null }),
        h('pre', { class: 'pmw-plan-mdtext' }, [h('code', { text: md(b) })])
      ]));
    });
    return [wrap];
  }

  /* ---- the footer: Build / Revise / More, one 32 px row ---- */
  function buildLabel() {
    return { ready: 'Build', building: 'Building…', completed: 'Completed', canceled: 'Canceled' }[live.status] || 'Build';
  }
  function footer(steps) {
    var foot = h('div', { class: 'pmw-plan-foot' });
    var old = viewing !== plan.version;
    var blocked = !!plan.blocked && live.status === 'ready';
    var canBuild = live.status === 'ready' && !old && !blocked;
    var reason = old ? 'Build uses the current version, V' + plan.version : blocked ? 'Answer the open items first' : live.status === 'building' ? 'The build is running' : live.status === 'completed' ? 'This plan was built' : live.status === 'canceled' ? 'This plan was canceled' : '';
    var build = PMW.frames.button({ label: buildLabel(), primary: canBuild, disabled: !canBuild, reason: reason, detail: canBuild ? 'Start the steps in order' : reason, run: startBuild });
    build.classList.add('pmw-plan-build', 'is-' + live.status);
    build.setAttribute('data-k', 'build');
    if (live.status === 'building') build.appendChild(h('span', { class: 'pmw-plan-busy', 'aria-hidden': 'true' }));
    foot.appendChild(build);
    if (live.status === 'ready' || live.status === 'building') {
      var rv = PMW.frames.button({ label: live.status === 'building' ? 'Stop and revise' : 'Revise', detail: 'Say what to change in the chat', run: revise });
      rv.classList.add('pmw-plan-revise');
      rv.setAttribute('data-k', 'revise');
      foot.appendChild(rv);
    }
    var more = PMW.frames.button({ label: 'More', icon: null, detail: 'Export, send, copy a link', menu: moreMenu });
    more.classList.add('pmw-plan-more');
    more.setAttribute('data-k', 'more');
    more.appendChild(PMW.icon('chevronDown', { size: 12 }));
    foot.appendChild(more);
    var note = footNote(steps);
    if (note) foot.appendChild(h('span', { class: 'pmw-plan-footnote', text: note }));
    return foot;
  }
  function footNote(steps) {
    var n = steps.length;
    if (live.status === 'building') {
      var cur = steps[live.done];
      return live.done + ' of ' + n + ' steps done' + (live.waiting ? ' · waiting for the build window' : cur ? ' · now: ' + cur.title : '');
    }
    if (live.status === 'completed') return n + ' of ' + n + ' steps done';
    if (live.status === 'canceled') return live.done ? live.done + ' of ' + n + ' steps were done' : 'Nothing was built';
    if (plan.blocked) return 'Build blocked: open items';
    if (plan.schedule) return 'Also scheduled: weeknights 10 PM';
    return '';
  }
  function moreMenu() {
    var rows = [];
    if (width < NARROW_FOOT && (live.status === 'ready' || live.status === 'building')) {
      rows.push({ id: 'revise', label: live.status === 'building' ? 'Stop and revise' : 'Revise', icon: 'rename', run: revise }, '-');
    }
    rows.push(
      { id: 'md', label: 'Export as Markdown', icon: 'document', sub: 'A .md file of V' + viewing, run: function () { download(slug(plan.title) + '-v' + viewing + '.md', markdownOf(plan, viewing)); PMW.toast('Saved the plan as Markdown'); } },
      { id: 'pdf', label: 'Export as PDF', icon: 'document', sub: 'Embeds print as their still versions', run: function () { PMW.toast('PDF export runs in the app, not in this concept'); } },
      { id: 'wizard', label: 'Send to Planning Wizard', icon: 'popOut', sub: 'Keeps this version as it is', run: function () { PMW.toast('Sent V' + viewing + ' to the Planning Wizard'); api.announce('Sent to the Planning Wizard'); } },
      { id: 'link', label: 'Copy plan link', icon: 'link', run: function () { copyText('pm://plans/' + planId + '@v' + viewing, 'Plan link copied'); } }
    );
    if (live.status === 'building') {
      rows.push('-', { id: 'cancel', label: 'Cancel build', icon: 'stop', danger: true, submenu: function () {
        return { id: 'plan-cancel', title: 'Cancel this build?', meta: 'Steps already done stay done.', rows: [
          { id: 'yes', label: 'Cancel the build', danger: true, run: cancelBuild },
          { id: 'no', label: 'Keep building', run: function () {} }
        ] };
      } });
    }
    return { id: 'plan-more', rows: rows, width: 280, align: 'start' };
  }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function revise() {
    var text = 'Revise the plan "' + plan.title + '": ';
    /* the chat's message box only (never an editable title); the chat port will bring PM_HOME-level compose */
    var box = D.querySelector('#chatPanel textarea.pm6-chat-input') || D.querySelector('#chatPanel textarea');
    if (box && box.offsetParent !== null) {
      box.value = text;
      try { box.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
      try { box.setSelectionRange(text.length, text.length); } catch (_) {}
      box.focus();
      api.announce('Say what to change in the chat');
      return;
    }
    PMW.toast('Say what to change in the chat, and a new version appears here');
  }
  function startBuild() {
    if (live.status !== 'ready') return;
    live.status = 'building'; live.done = 0; live.waiting = false;
    api.update({ busy: true });
    api.announce('Build started: ' + plan.title);
    paint();
    tick();
    saveSoon();
  }
  function cancelBuild() {
    live.status = 'canceled'; live.waiting = false;
    clearTimeout(timer);
    api.update({ busy: false });
    api.announce('Build canceled. Steps already done stay done.');
    paint();
    saveSoon();
  }
  function resume() {
    live.waiting = false;
    api.announce('Build resumed');
    paint();
    tick();
    saveSoon();
  }
  function tick() {
    clearTimeout(timer);
    if (gone || !visible || live.status !== 'building' || live.waiting) return;
    timer = setTimeout(function () {
      if (gone || live.status !== 'building' || live.waiting) return;
      var n = stepsOf(plan.revisions[plan.version]).length;
      live.done += 1;
      if (live.done >= n) {
        live.status = 'completed'; live.done = n;
        api.update({ busy: false });
        api.announce('Build finished: ' + plan.title);
      }
      if (PMW.menu.isOpen()) { setTimeout(function () { paint(); tick(); }, 600); return; }
      paint();
      tick();
      saveSoon();
    }, TICK_MS);
  }

  /* ---- the top of the body: schedule, waiting window, canceled, older version ---- */
  function topLines() {
    var out = [];
    if (viewing !== plan.version) {
      var back = h('button', { type: 'button', class: 'pmw-plan-link', 'data-k': 'back-current', text: 'Back to V' + plan.version });
      back.addEventListener('click', function () { remember(); viewing = plan.version; paint(); if (frame) frame._scroll.scrollTop = 0; saveSoon(); });
      out.push(h('div', { class: 'pmw-plan-line is-note' }, [PMW.icon('history', { size: 14 }), h('span', { text: 'You are reading V' + viewing + ', an earlier version. Nothing here can build.' }), back]));
    }
    if (plan.schedule && live.status === 'ready' && viewing === plan.version) {
      out.push(h('div', { class: 'pmw-plan-line' }, [PMW.icon('clock', { size: 14 }), h('span', null, [h('b', { text: plan.schedule.text }), ' · ' + plan.schedule.next])]));
    }
    if (live.status === 'building' && live.waiting && plan.window) {
      var go = h('button', { type: 'button', class: 'pmw-plan-link', 'data-k': 'resume', text: 'Resume now' });
      go.addEventListener('click', resume);
      out.push(h('div', { class: 'pmw-plan-line is-warn', role: 'status' }, [PMW.icon('clock', { size: 14 }), h('span', { text: plan.window }), go]));
    }
    if (live.status === 'canceled') {
      out.push(h('div', { class: 'pmw-plan-line' }, [svgBox(14, 14, [sv('circle', { cx: 7, cy: 7, r: 5.5 }), sv('path', { d: 'M3.2 10.8l7.6-7.6' })], 'pmw-plan-line-ico'),
        h('span', { text: plan.canceled || 'You canceled this build. Steps already done stay done.' })]));
    }
    return out;
  }
  function history() {
    if (!plan.history || viewing !== plan.version) return null;
    return PMW.frames.section('Build history', plan.history.length + ' attempts', h('ol', { class: 'pmw-plan-hist' }, plan.history.map(function (x) {
      return h('li', { class: x.state ? 'is-' + x.state : null }, [h('span', { class: 'pmw-plan-hist-at', text: x.at }), h('span', { text: x.what })]);
    })));
  }

  function paint() {
    if (gone) return;
    var active = D.activeElement, key = active && host.contains(active) ? active.getAttribute('data-k') : null;
    var keepScroll = frame ? frame._scroll.scrollTop : (scrolls[view] || 0);
    var blocks = blocksNow();
    var states = viewing === plan.version ? stepStates(blocks, live) : stepStates(blocks, { status: 'ready', done: 0 });
    var steps = stepsOf(blocks);
    var statusWord = { ready: 'Ready', building: 'Building', completed: 'Completed', canceled: 'Canceled' }[live.status];
    var meta = ['Plan', 'V' + viewing, plan.strategy, viewing === plan.version ? { text: statusWord, state: live.status === 'completed' ? 'ok' : null } : 'Earlier version',
      steps.length + ' steps', plan.thread];
    var body = topLines().concat(view === 'rich' ? richBody(blocks, states) : markdownBody(blocks, states));
    var hist = view === 'rich' ? history() : null;
    if (hist) body.push(hist);
    var next = PMW.frames.doc({ title: plan.title, meta: meta, body: body, footer: footer(steps), cls: 'pmw-plan-doc is-' + view });
    next._scroll.setAttribute('data-pmh', 'off');
    if (frame) frame.replaceWith(next); else stage.appendChild(next);
    frame = next;
    frame._scroll.scrollTop = keepScroll;
    frame._scroll.addEventListener('scroll', function () { scrolls[view] = frame._scroll.scrollTop; }, { passive: true });
    if (key) {
      var el = host.querySelector('[data-k="' + key.replace(/"/g, '\\"') + '"]');
      if (el) { try { el.focus({ preventScroll: true }); } catch (_) {} }
    }
  }
  paint();
  if (live.status === 'building') api.update({ busy: true });

  return {
    onShow: function () { visible = true; tick(); },
    onHide: function () { visible = false; clearTimeout(timer); },
    onResize: function (s) {
      width = s.w;
      root.classList.toggle('is-narrow', s.w < NARROW_FOOT);
      if (!restored && frame) { restored = true; frame._scroll.scrollTop = scrolls[view] || 0; }
      syncMax();
    },
    focus: function () { var t = frame && frame._scroll; if (t) { t.setAttribute('tabindex', '-1'); try { t.focus({ preventScroll: true }); } catch (_) {} } },
    serialize: function () {
      remember();
      var out = { plan: planId, view: view, scrolls: { rich: Math.round(scrolls.rich || 0), markdown: Math.round(scrolls.markdown || 0) } };
      if (viewing !== plan.version) out.version = viewing;
      if (live.status !== plan.status || live.done !== ((plan.build || {}).done || 0) || live.waiting !== !!(plan.build || {}).waiting) {
        out.live = { status: live.status, done: live.done, waiting: live.waiting };
      }
      return out;
    },
    unmount: function () { gone = true; clearTimeout(timer); }
  };
}

/* ---- the Deep Plan discovery tab (deep-discovery:<runId>) ---- */
function mountDiscovery(host, state, api) {
  var runId = api.id.slice('deep-discovery:'.length) || 'b14-thorough-1';
  var run = discoveryFor(runId, state && state.run);
  var root = h('div', { class: 'pmw-plan pmw-plan-discovery' });
  var stage = h('div', { class: 'pmw-plan-stage' });
  var frame = null, gone = false, restored = false, scrollTop = (state && state.scrollTop) || 0;
  host.appendChild(root);
  api.update({ label: 'Deep Plan · discovery', title: 'Deep Plan · discovery: ' + run.objective });
  var row = api.headerRow({
    label: 'Discovery controls',
    left: [{ id: 'kind', icon: 'plan', text: 'Deep Plan · discovery', strong: true }, { id: 'strategy', text: run.strategy, dim: true }],
    actions: [
      { id: 'next', label: 'Next questions', icon: 'arrowDown', detail: 'Ask the next question that matters', run: nextQuestion },
      { id: 'max', label: 'Maximize', icon: 'maximize', shortcut: 'Shift+Escape', run: function () { api.toggleMaximize(); } }
    ]
  });
  root.appendChild(row.el);
  root.appendChild(stage);
  api.on('maximize', function () { var m = api.isMaximized(); row.setAction('max', { label: m ? 'Restore' : 'Maximize', icon: m ? 'restore' : 'maximize' }); });

  function counts() {
    var asked = 0, reused = 0, researched = 0;
    run.questions.forEach(function (q) {
      if (q.state !== 'proposed') asked += 1;
      if (q.state === 'reused') reused += 1;
      if (q.state === 'researched') researched += 1;
    });
    var budget = run.base + (run.grillOn ? run.grill : 0);
    return { asked: asked, remaining: budget - asked, reused: reused, researched: researched, budget: budget };
  }
  function nextQuestion() {
    var q = run.questions.filter(function (x) { return x.state === 'proposed'; })[0];
    if (!q) { PMW.toast('No more questions matter for this plan'); return; }
    q.state = 'presented';
    paint();
    var el = D.getElementById('pmw-plan-q-' + runId + '-' + q.id);
    if (el) { el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); el.classList.add('is-flash'); setTimeout(function () { el.classList.remove('is-flash'); }, 1400); }
    api.announce('New question: ' + q.prompt);
    saveSoon();
  }
  function choose(q, i) {
    run.choices[q.id] = i;
    q.state = 'answered';
    run.created = false;
    paint();
    api.announce('Answered: ' + q.options[i]);
    saveSoon();
  }
  function openSource(e, q) {
    var spec = { kind: 'editor', id: q.source.id, text: q.source.text, language: 'json', title: q.source.name, label: q.source.name };
    if (e.altKey) spec.where = 'panel';
    api.open(spec);
  }
  function recheck(q) {
    q.state = 'researching';
    paint();
    setTimeout(function () { if (gone) return; q.state = 'researched'; paint(); api.announce('Source checked: nothing changed'); }, reduced() ? 300 : 1100);
  }
  function question(q) {
    var sec = h('section', { class: 'pmw-plan-q is-' + q.state, id: 'pmw-plan-q-' + runId + '-' + q.id, tabindex: '-1' });
    sec.appendChild(h('p', { class: 'pmw-plan-q-prompt', text: q.prompt }));
    sec.appendChild(PMW.frames.meta([{ text: STATE_WORD[q.state] || q.state, state: q.state === 'presented' ? 'warn' : q.state === 'answered' || q.state === 'researched' || q.state === 'reused' ? 'ok' : null },
      q.who, q.type === 'fact' ? 'a fact to check' : 'a decision', q.required ? 'required before Build' : null]));
    if (q.answer) sec.appendChild(h('p', { class: 'pmw-plan-q-answer', text: q.answer }));
    if (q.options && q.state !== 'proposed') {
      var name = 'pmw-plan-q-' + runId + '-' + q.id + '-opt';
      var group = h('div', { class: 'pmw-plan-q-opts', role: 'radiogroup', 'aria-label': q.prompt });
      q.options.forEach(function (opt, i) {
        var input = h('input', { type: 'radio', name: name, value: String(i), 'data-k': 'opt:' + q.id + ':' + i });
        if (run.choices[q.id] === i) input.checked = true;
        input.addEventListener('change', function () { choose(q, i); });
        group.appendChild(h('label', { class: 'pmw-plan-q-opt pmw-cur' }, [input, h('span', { text: opt })]));
      });
      sec.appendChild(group);
    }
    var acts = [];
    if (q.state === 'proposed') {
      var ask = h('button', { type: 'button', class: 'pmw-plan-link', 'data-k': 'ask:' + q.id, text: 'Ask it now' });
      ask.addEventListener('click', function () { q.state = 'presented'; paint(); saveSoon(); });
      acts.push(ask);
    }
    if (q.source) {
      var src = h('button', { type: 'button', class: 'pmw-plan-link', 'data-k': 'src:' + q.id, 'data-pm-hover-label': 'Open ' + q.source.name, text: 'Source' });
      src.addEventListener('click', function (e) { openSource(e, q); });
      acts.push(src);
      if (q.type === 'fact') {
        var rc = h('button', { type: 'button', class: 'pmw-plan-link', 'data-k': 'recheck:' + q.id, text: q.state === 'researching' ? 'Checking…' : 'Recheck source' });
        if (q.state === 'researching') rc.setAttribute('aria-disabled', 'true');
        else rc.addEventListener('click', function () { recheck(q); });
        acts.push(rc);
      }
    }
    if (acts.length) sec.appendChild(h('div', { class: 'pmw-plan-q-acts' }, acts));
    return sec;
  }
  function preview() {
    var p = exportPlanFrom(run);
    var list = h('ol', { class: 'pmw-plan-frozen' }, p.revisions[1].filter(function (b) { return b.t !== 'p'; }).map(function (b) {
      if (b.t === 'h') return h('li', { class: 'is-h', text: b.text });
      if (b.t === 'ul') return h('li', null, [h('ul', { class: 'pmw-plan-ul' }, b.items.map(function (t) { return h('li', { text: t }); }))]);
      if (b.t === 'step') return h('li', null, [h('span', { class: 'pmw-plan-sid', text: b.id }), ' ' + b.title]);
      if (b.t === 'callout') return h('li', null, [callout(b.tone, b.text)]);
      return null;
    }).filter(Boolean));
    var cancel = PMW.frames.button({ label: 'Cancel preview', run: function () { run.preview = false; paint(); saveSoon(); } });
    cancel.setAttribute('data-k', 'cancel-preview');
    var create = PMW.frames.button({ label: 'Create this Plan', primary: true, detail: 'Opens it beside this tab; it does not build', run: createPlan });
    create.setAttribute('data-k', 'create');
    return PMW.frames.section('Review before creating', 'Plan · V1', [
      h('p', { class: 'pmw-plan-p', text: 'This freezes the current answers, source versions and open items. Creating the Plan does not Build it.' }),
      list,
      h('div', { class: 'pmw-plan-q-acts is-buttons' }, [cancel, create])
    ]);
  }
  function callout(tone, text) {
    return h('div', { class: 'pmw-plan-callout' + (tone === 'warning' ? ' is-warn' : ''), role: 'note' }, [
      h('span', { class: 'pmw-plan-callout-ico', 'aria-hidden': 'true' }, [svgBox(16, 16, [sv('path', { d: 'M8 2.4 14 13H2z' }), sv('path', { d: 'M8 6.6v3.2M8 11.4v.2' })])]),
      h('p', null, [h('b', { text: 'Warning ' }), text])
    ]);
  }
  function createPlan() {
    run.created = true;
    run.preview = false;
    PM_HOME.catalog.add('plan', [{ id: 'plan:ap-export', label: 'Offline collection export', sub: 'Plan · V1 · from discovery', icon: 'plan',
      spec: { id: 'plan:ap-export', kind: 'plan', label: 'Offline collection export' } }]);
    delete LIVE['ap-export'];
    var res = api.split('auto', { id: 'plan:ap-export', kind: 'plan', label: 'Offline collection export' });
    paint();
    if (!res || !res.ok) api.open({ id: 'plan:ap-export', kind: 'plan', label: 'Offline collection export' });
    saveSoon();
  }
  function paint() {
    if (gone) return;
    var active = D.activeElement, key = active && host.contains(active) ? active.getAttribute('data-k') : null;
    var keep = frame ? frame._scroll.scrollTop : scrollTop;
    var c = counts();
    var stats = h('p', { class: 'pmw-plan-stats' }, [
      h('b', { text: String(c.asked) }), ' asked', h('span', { class: 'pmw-plan-sep', 'aria-hidden': 'true', text: '·' }),
      h('b', { text: String(c.remaining) }), ' remaining', h('span', { class: 'pmw-plan-sep', 'aria-hidden': 'true', text: '·' }),
      h('b', { text: String(c.reused) }), ' reused', h('span', { class: 'pmw-plan-sep', 'aria-hidden': 'true', text: '·' }),
      h('b', { text: String(c.researched) }), ' researched'
    ]);
    var grill = h('input', { type: 'checkbox', 'data-k': 'grill' });
    grill.checked = run.grillOn;
    grill.addEventListener('change', function () { run.grillOn = grill.checked; paint(); api.announce(run.grillOn ? 'Grill Me on: up to 25 more questions' : 'Grill Me off'); saveSoon(); });
    var body = [
      h('p', { class: 'pmw-plan-p', text: 'Inspect the sources, answer only what matters, then review one Plan. No work starts here.' }),
      stats,
      h('p', { class: 'pmw-fine', text: run.strategy + ' · base ' + run.base + (run.grillOn ? ' + ' + run.grill + ' Grill Me = ' + c.budget : '; Grill Me adds ' + run.grill) + '. This is a ceiling, not a target.' }),
      h('label', { class: 'pmw-plan-check pmw-cur' }, [grill, h('span', null, [h('b', { text: 'Grill Me' }), h('span', { text: 'Ask up to ' + run.grill + ' more questions that try to break the plan.' })])])
    ];
    if (run.created) body.push(h('div', { class: 'pmw-plan-line is-note', role: 'status' }, [PMW.icon('check', { size: 14 }), h('span', { text: 'The Plan has been created. Build is a separate, explicit action.' })]));
    body.push(PMW.frames.section('Sources and decisions', run.questions.length + ' questions', run.questions.map(question)));
    if (run.preview) body.push(preview());
    var foot = h('div', { class: 'pmw-plan-foot' });
    var review = PMW.frames.button({ label: run.created ? 'Open the Plan' : 'Review Plan', primary: true, detail: run.created ? 'Opens the plan made from these answers' : 'See the Plan these answers make, before it exists', run: function () {
      if (run.created) { api.open({ id: 'plan:ap-export', kind: 'plan', label: 'Offline collection export' }); return; }
      run.preview = true; paint();
      var sec = frame && frame.querySelector('.pmw-plan-frozen');
      if (sec) sec.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
      saveSoon();
    } });
    review.setAttribute('data-k', 'review');
    var nextB = PMW.frames.button({ label: 'Next questions', run: nextQuestion });
    nextB.classList.add('pmw-plan-revise');
    nextB.setAttribute('data-k', 'nextq');
    var more = PMW.frames.button({ label: 'More', detail: 'Export the answers', menu: function () {
      return { id: 'disc-more', width: 260, rows: [
        { id: 'next', label: 'Next questions', icon: 'arrowDown', run: nextQuestion },
        { id: 'export', label: 'Export answers', icon: 'document', sub: 'A .json file of the sources and answers', run: function () {
          download('discovery-answers.json', JSON.stringify({ objective: run.objective, questions: run.questions.map(function (q) { return { prompt: q.prompt, state: STATE_WORD[q.state], answer: q.answer || (q.options && run.choices[q.id] != null ? q.options[run.choices[q.id]] : null) }; }) }, null, 2), 'application/json');
          PMW.toast('Saved the answers'); } },
        '-',
        { id: 'cancel', label: 'Cancel discovery', icon: 'stop', danger: true, sub: 'Sources and answers are kept', run: function () { PMW.toast('Discovery canceled. Sources and answers are kept.'); } }
      ] };
    } });
    more.setAttribute('data-k', 'more');
    more.appendChild(PMW.icon('chevronDown', { size: 12 }));
    foot.appendChild(review); foot.appendChild(nextB); foot.appendChild(more);
    foot.appendChild(h('span', { class: 'pmw-plan-footnote', text: c.asked + ' of ' + c.budget + ' questions asked' }));
    var next = PMW.frames.doc({ title: run.objective, meta: ['Deep Plan', 'Discovery', run.strategy, 'nothing runs here'], body: body, footer: foot, cls: 'pmw-plan-doc' });
    next._scroll.setAttribute('data-pmh', 'off');
    if (frame) frame.replaceWith(next); else stage.appendChild(next);
    frame = next;
    frame._scroll.scrollTop = keep;
    if (key) { var el = host.querySelector('[data-k="' + key + '"]'); if (el) { try { el.focus({ preventScroll: true }); } catch (_) {} } }
  }
  paint();
  return {
    onResize: function (s) {
      root.classList.toggle('is-narrow', s.w < NARROW_FOOT);
      if (!restored && frame) { restored = true; frame._scroll.scrollTop = scrollTop; }
    },
    serialize: function () {
      return { scrollTop: frame ? Math.round(frame._scroll.scrollTop) : 0, run: { grillOn: run.grillOn, created: run.created, preview: run.preview, choices: run.choices,
        asked: run.questions.filter(function (q) { return q.state !== 'proposed'; }).map(function (q) { return q.id; }) } };
    },
    unmount: function () { gone = true; }
  };
}

/* ---- the catalog (one source for the "+" picker, Ctrl+P and the stand-in chat) ---- */
var STATUS_SUB = { ready: 'Ready', building: 'Building', completed: 'Completed', canceled: 'Canceled' };
PM_HOME.catalog.add('plan', Object.keys(PLANS).map(function (id) {
  var p = PLANS[id];
  return { id: 'plan:' + id, label: p.title, sub: 'Plan · V' + p.version + ' · ' + STATUS_SUB[p.status] + (id === 'ap-embeds' ? ' · every embed kind' : ''),
    icon: 'plan', keywords: 'plan ' + p.strategy + ' ' + p.thread, spec: { id: 'plan:' + id, kind: 'plan', label: p.title } };
}).concat([{ id: 'deep-discovery:b14-thorough-1', label: 'Deep Plan · discovery', sub: 'Offline collection export · 3 asked', icon: 'plan',
  keywords: 'deep plan discovery questions', spec: { id: 'deep-discovery:b14-thorough-1', kind: 'plan', label: 'Deep Plan · discovery' } }]));

/* "Plan or document...": one picker over both kinds, headed Plans and Documents (the kinds share one group) */
function pickPlanOrDocument(ctx) {
  var hnd = PMW.catalogPicker(ctx.anchor, { kinds: ['plan', 'document'], title: 'Open a plan or document', panelId: ctx.panelId, newPanel: ctx.newPanel });
  if (hnd && hnd.spec && hnd.spec.sections && hnd.spec.sections.length === 2) {
    hnd.spec.sections[0].label = 'Plans';
    hnd.spec.sections[1].label = 'Documents';
    hnd.update(hnd.spec);
    if (hnd.search) { try { hnd.search.focus({ preventScroll: true }); } catch (_) {} }
  }
  return hnd;
}

PM_HOME.registerKind('plan', {
  label: 'Plan',
  group: 'Plans and documents',
  icon: 'plan',
  prefixes: ['plan:', 'plan-query', 'deep-discovery:'],
  document: true,
  min: { w: 280, h: 160 },
  canonical: function (id) { return id === 'plan-query' ? 'plan:ap-index' : id; },
  idFor: function (spec) { return spec.run ? 'deep-discovery:' + spec.run : 'plan:' + (spec.plan || 'ap-index'); },
  plus: {
    order: 50,
    label: 'Plan or document...',
    keywords: 'plan document rules memory revert debug lens wonderer discovery',
    pick: pickPlanOrDocument,
    spec: function () { return { id: 'plan:ap-index', kind: 'plan' }; }
  },
  mount: function (host, state, api) {
    if (api.id.indexOf('deep-discovery:') === 0) return mountDiscovery(host, state || {}, api);
    return mountPlan(host, state || {}, api);
  }
});
