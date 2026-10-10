/* The stand-in chat (brief 3.5 and 3.8; D3, D7, D8; digest 05 section 13): a believable chat column that drives every
   open path the 5.6 Pro chat will use, before that chat is ported. It is one layer, div#pmw-chat, appended as the last
   child of the page's own #chatPanel (never moved, wrapped or replaced, and #chatResizer is never touched), absolutely
   filling it above the page's chat content. On by default (settings 'chat.standIn'); hidden while the Guided Tour runs
   (html[data-o55-tour]), because the tour teaches the page's own chat.

   What it holds: a header (thread title, History flyout (D3), the context ring with More Details, Pop out / Dock back,
   More), a scripted transcript whose work rows and cards carry EVERY control of digest 05 section 13 with its exact id,
   label and by, a compact command card (it replaces the 5.6 chat's inline Shell box: D27), an Agent activity card that
   simulates agents opening things on their own (D8: background tabs with the hollow square, never focus), and a
   composer (Enter sends; a short scripted reply follows).

   Opening rules: file references and Changes rows follow D7 (single click: the preview tab; double click: kept;
   Alt+click: a new panel; Ctrl/Cmd+click: in the background). Every other control calls PM_HOME.openEditor(id,
   { label, kind, by }) (the 5.6 chat's openEditor contract, CONTRACT 6.1); Alt+click opens it in a new panel. Run cards
   watch PM_HOME 'activate', 'close', 'open' and 'layout': while their run is the active tab of a panel the card says
   "Deciding in the panel beside the chat" in place of its controls, and its controls come back when that ends.

   Sizing keys on the layer itself (container pmw-sc, inline-size): the message area runs 400-760 px (440 floating);
   pinned History adds PMW.LADDER.chatHistoryW to the column (the chat column widens, 46-chat.js), drawn at
   chatHistoryWNarrow while the whole layer is under chatHistoryAt; folded to its 32 px strip the shell hides every
   child of #chatPanel, this layer included.

   Hooks for the kinds (it registers itself as PMW.chatCol.surface, so PM_HOME.chat reaches it): compose(text) and
   PMW.standIn.prefill(text) put text in the composer; reveal({ thread, messageId }) finds a message (an id below, or the
   id of a tab or file a row opens) and marks it; a finished scripted reply emits PMW.bus 'chat' { type: 'turn-finished',
   threadId }. The browser kind's captures ('browser:capture') land in the composer as attachment cards, and its
   Send to chat ('browser:send') posts, lists or inserts the part it picked. */

var SC_KEY = 'chat.standIn';
var THREAD = 'Query performance';
var CWD = '~/tastebook/api';

PM_HOME.settings.register('chat', { standIn: { type: 'boolean', label: 'Stand-in chat' } }, { standIn: true });

/* ---- small DOM helper (this file runs in its own scope) ---- */
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
function ico(name, size) { return PMW.icon(name, { size: size || 14 }); }
function basename(p) { var i = p.lastIndexOf('/'); return i < 0 ? p : p.slice(i + 1); }

/* ---- opening ---- */
function goHome() {
  try { if (window.PM_PAGES && PM_PAGES.current && PM_PAGES.current !== 'dashboard') PM_PAGES.go('dashboard'); } catch (_) {}
}
function catalogLabel(id, fallback) {
  try { var it = PM_HOME.catalog.find(id); if (it && it.label) return it.label; } catch (_) {}
  return fallback;
}
/* a person clicked a control in the chat: it opens and takes focus (D8); Alt+click: a new panel; Ctrl/Cmd: background */
function openTarget(t, e) {
  goHome();
  var label = t.label || catalogLabel(t.id, null);
  if (e && (e.ctrlKey || e.metaKey)) {
    return PM_HOME.open(Object.assign({ id: t.id, kind: t.kind, label: label, by: 'user', background: true }, t.extra || {})).tabId || null;
  }
  if (t.extra) {
    return PM_HOME.open(Object.assign({ id: t.id, kind: t.kind, label: label, by: 'user', where: e && e.altKey ? 'panel' : undefined }, t.extra)).tabId || null;
  }
  return PM_HOME.openEditor(t.id, { label: label, kind: t.kind, by: 'user', where: e && e.altKey ? 'panel' : undefined });
}
/* D7: single click previews, double click keeps, Alt+click a new panel, Ctrl/Cmd+click in the background */
function openFile(path, line, e) {
  goHome();
  var keep = !!(e && e.detail >= 2);
  return PM_HOME.open({ kind: 'editor', path: path, line: line || undefined, mode: keep ? 'keep' : 'preview',
    where: e && e.altKey ? 'panel' : 'auto', background: !!(e && (e.ctrlKey || e.metaKey)), by: 'user' });
}

/* ---- the controls (digest 05 section 13: exact text, id, label, by) ---- */
var T = {
  planIndex: { id: 'plan:ap-index', kind: 'plan', label: 'Tenant-scoped analytics read path' },
  planAlias: { id: 'plan-query', kind: 'plan', label: 'Tenant-scoped analytics read path' },
  planCache: { id: 'plan:ap-cache', kind: 'plan', label: 'Session cache stampede' },
  discovery: { id: 'deep-discovery:b14-thorough-1', kind: 'plan', label: 'Deep Plan · discovery' },
  agentQuery: { id: 'thread-agent-query', kind: 'transcript', label: 'Query Analyzer' },
  agentSchema: { id: 'thread-agent-schema', kind: 'transcript', label: 'Schema Reviewer' },
  dashboard: { id: 'dashboard-query', kind: 'artifact', label: 'Query Benchmark Dashboard' },
  dashboardV6: { id: 'artifact-revision:' + encodeURIComponent(JSON.stringify({ artifact_id: 'dashboard-query', artifact_version: 6, project_id: 'pm', thread_id: 'query' })),
    kind: 'artifact', label: 'Query Benchmark Dashboard · V6' },
  mermaid: { id: 'mermaid-runtime', kind: 'artifact', label: 'How an Assistant Turn Flows' },
  testEvidence: { id: 'test-evidence', kind: 'artifact', label: 'Browser Test Evidence' },
  search: { id: 'search:postgres%20composite%20index%20write%20amplification|8%20results', kind: 'record', label: 'postgres composite index wr…' },
  mcp: { id: 'mcp:grafana.query-range|Called%20grafana.query-range%20%E2%80%94%20p95%20series%2C%20last%2024h', kind: 'record', label: 'grafana.query-range' },
  inspector: { id: 'app:inspector', kind: 'record', label: 'Database inspector' },
  link: { id: 'link:postgresql.org|PostgreSQL%2016%20%C2%B7%20Multicolumn%20Indexes', kind: 'browser', label: 'PostgreSQL 16 · Multicolumn Indexes',
    extra: { url: 'https://www.postgresql.org/docs/16/indexes-multicolumn.html' } },
  room: { id: 'room:chatroom-onboarding', kind: 'run', label: 'Chat Room · Onboarding Redesign Options' },
  roomFrame: { id: 'collab-run:chatroom-onboarding', kind: 'run', label: 'Chat Room · Onboarding Redesign Options' },
  review: { id: 'review:review-orchestrator-boundary', kind: 'run', label: 'Multi-Pass Review · Orchestrator Boundary Changes' },
  reviewEvidence: { id: 'review-evidence:review-orchestrator-boundary:ev-1', kind: 'run', label: 'Review evidence' },
  brainstorm: { id: 'brainstorm:brainstorm-provider-failover', kind: 'run', label: 'BrainStorm' },
  crew: { id: 'crew-work:crew-query-perf', kind: 'run', label: 'Crew · Query Performance Rollout' },
  teach: { id: 'teach:query', kind: 'document', label: 'Your rules' },
  memory: { id: 'memory:query', kind: 'document', label: 'Gist Review' },
  revert: { id: 'revert:turn-1', kind: 'document', label: 'Revert · files' },
  debug: { id: 'debug:dbg-investigation-1', kind: 'document', label: 'Debug · r1' },
  lensSource: { id: 'lens-source:query:m-12', kind: 'document', label: 'Lens source' },
  lensEffective: { id: 'lens-effective:query', kind: 'document', label: 'What it would read' },
  wonderer: { id: 'wonderer:w-1', kind: 'document', label: 'Wonderer’s ideas' },
  wonderSource: { id: 'wonder-source:dashboard-query', kind: 'document', label: 'Wonderer · source' },
  context: { id: 'context:query', kind: 'context', label: 'Context · Query performance' },
  workNote: { id: 'work-record:m-7', kind: 'record', label: 'Kept idx_events_created until the new index is proven' },
  capture: { id: 'browser:1', kind: 'browser', label: 'Query performance dashboard', extra: { url: 'https://app.internal/dashboards/query-performance' } }
};
var ARTIFACT_ROWS = [
  { id: 'data-explorer', title: 'Trace Data Explorer', word: 'data', status: 'Ready' },
  { id: 'chart-cost', title: 'Provider Cost and Latency', word: 'chart', status: 'Ready' },
  { id: 'quiz-indexes', title: 'Index Strategy Quiz', word: 'quiz', status: 'Ready' },
  { id: 'periodic-capabilities', title: 'Agent Capability Matrix', word: 'table', status: 'Ready' },
  { id: 'architecture-map', title: 'Puppet Master Host Map', word: 'architecture', status: 'Ready' },
  { id: 'flow-plan', title: 'Plan Approval Flow', word: 'flowchart', status: 'Ready' },
  { id: 'generated-image', title: 'Generated Operations Console', word: 'image', status: 'Ready' },
  { id: 'report-query', title: 'Query Optimization Report', word: 'report', status: 'Stale', state: 'warn' },
  { id: 'broken-viz', title: 'Usage Projection Dashboard', word: 'dashboard', status: 'Could not render', state: 'bad' },
  { id: 'render-forecast', title: 'Context Growth Forecast', word: 'chart', status: 'Rendering', state: 'busy' }
];
var CHANGES = [
  { path: 'migrations/0043_tenant_created_index.sql', line: 1, status: 'Added', plus: 14, minus: 0, ref: 'migrations/0043_tenant_created_index.sql:1' },
  { path: 'src/analytics/queries.rs', line: 128, status: 'Modified', plus: 23, minus: 9, ref: 'src/analytics/queries.rs:128' },
  { path: 'src/analytics/legacy_rollup.rs', line: 1, status: 'Deleted', plus: 0, minus: 37, ref: 'src/analytics/legacy_rollup.rs', state: 'bad' }
];
/* D8: agents opening things on their own land in the background with the hollow square and never take focus */
var AGENT_OPENS = [
  { id: 'terminal', icon: 'terminal', who: 'Query Analyzer', what: 'opens a terminal to rerun the bench',
    spec: { kind: 'terminal', id: 'terminal:agent-bench', session: 'agent-bench', cwd: CWD, invocation: 'cargo bench --bench analytics', label: 'cargo bench · api', by: 'agent:Query Analyzer' } },
  { id: 'browser', icon: 'browser', who: 'Query Analyzer', what: 'opens the live dashboard in a browser',
    spec: { kind: 'browser', id: 'browser:2', url: 'https://app.internal/dashboards/query-performance?tenant=214', label: 'Dashboard · tenant 214', by: 'agent:Query Analyzer' } },
  { id: 'plan', icon: 'plan', who: 'Builder', what: 'opens the plan it is building',
    spec: { kind: 'plan', id: 'plan:ap-embeds', label: 'Evidence pack for the read-path work', by: 'agent:Builder' } },
  { id: 'file', icon: 'file', who: 'Builder', what: 'opens a file it changed',
    spec: { kind: 'editor', path: 'src/analytics/index_hints.rs', line: 1, by: 'agent:Builder' } },
  { id: 'run', icon: 'run', who: 'Builder', what: 'opens the Crew run it joined',
    spec: { kind: 'run', id: 'crew-work:crew-query-perf', label: 'Crew · Query Performance Rollout', by: 'agent:Builder' } },
  { id: 'schema', icon: 'transcript', who: 'Schema Reviewer', what: 'is blocked, so Query Performance opens its transcript',
    spec: { kind: 'transcript', id: 'thread-agent-schema', label: 'Schema Reviewer', by: 'agent:Query Performance' } }
];
var THREADS = {
  pinned: [
    ['Query performance', 'I’ll check the query and the index it uses.'],
    ['Two-stage rollout', 'One assistant turn with two stages.'],
    ['Follow-up messages', 'Agent is working; two follow-ups queued.'],
    ['Live turns', 'Send a message and watch the turn.'],
    ['Product design discussion', 'Start with the current project.'],
    ['Deployment questions', 'First, let’s confirm the target.']
  ],
  recent: [
    ['Architecture review', 'The reviewers will inspect the boundary.'],
    ['Advisor feedback', 'Back Seat Driver can offer a second view.'],
    ['Focus a conversation', 'Context Lens lets you focus a thread.'],
    ['Working with artifacts', 'The diagram, chart and data explorer.'],
    ['Investigate a browser issue', 'I’ll bind the target and reproduce it.'],
    ['Files in a conversation', 'The files remain attached to the thread.'],
    ['Deep Plan', 'I’ll compare the approaches first.'],
    ['Crew and shared work', 'The coordinator assigns the parts.']
  ]
};
/* thread ids: the History titles in lower-case words joined by hyphens, plus the short ids other kinds use for the same
   threads (the context kind's thread keys) */
var THREAD_ALIAS = { query: THREAD, subagents: 'Architecture review', visuals: 'Working with artifacts', 'plan-deep': 'Deep Plan', crew: 'Crew and shared work' };
function slug(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function allThreads() { return THREADS.pinned.concat(THREADS.recent); }
function threadByKey(key) {
  if (key == null || key === '') return null;
  var k = String(key).trim(), low = k.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(THREAD_ALIAS, low)) return THREAD_ALIAS[low];
  var list = allThreads();
  for (var i = 0; i < list.length; i++) if (list[i][0].toLowerCase() === low || slug(list[i][0]) === slug(k)) return list[i][0];
  return null;
}
function threadIdOf(title) {
  for (var a in THREAD_ALIAS) if (THREAD_ALIAS[a] === title) return a;
  return slug(title);
}
function threadPreview(title) { var list = allThreads(); for (var i = 0; i < list.length; i++) if (list[i][0] === title) return list[i][1]; return ''; }

var REPLIES = [
  ['On it. The composite index holds at 71 ms p95, so next I check the write overhead in ', { file: 'src/analytics/bench.rs', line: 44 }, '.'],
  ['The rollback rehearsal waits for the migration. The Crew card above shows where it stands.'],
  ['Nothing new to open yet. When I open a file, a plan or a run, it lands in the panel beside the chat.'],
  ['I checked ', { file: 'src/analytics/schema.rs', line: 88 }, ': the index name matches the migration, so nothing else changes.']
];

/* ---- state ---- */
var S = { layer: null, scroll: null, list: null, hist: null, histOpen: false, input: null, popBtn: null, runCards: [], replyN: 0, rerunN: 0,
  thread: THREAD, scripted: null, installed: false, recomputeQueued: false,
  sent: {},            // thread title -> the nodes sent and replied there, so a thread switch keeps them
  atts: [], attsEl: null, caret: null, marked: null, markTimer: 0 };

function isOn() { return PM_HOME.settings.get(SC_KEY) !== false; }
/* the layer is what the person sees in the chat column: on, installed, and not lifted for the Guided Tour */
function drawn() { return !!S.installed && isOn() && !document.documentElement.hasAttribute('data-o55-tour'); }
function apply() {
  if (!S.layer) return;
  var on = isOn();
  S.layer.hidden = !on;
  /* the page's own chat content under the layer is hidden while the stand-in shows (visibility only: nothing moves,
     and keyboard focus cannot wander into it); the tour lifts this (CSS) */
  var cp = document.getElementById('chatPanel');
  if (cp) { if (on) cp.setAttribute('data-pmw-sc', 'on'); else cp.removeAttribute('data-pmw-sc'); }
  if (!on) closeHistory();
  if (PMW.narrow) PMW.narrow.schedule();   // pinned History widens the column only while the layer draws it
}
function toggle() {
  var next = !isOn();
  PM_HOME.settings.set(SC_KEY, next);
  apply();
  PMW.announce(next ? 'Showing the stand-in chat' : 'Showing the current chat');
  return next;
}

/* ---- building blocks ---- */
function btn(label, o) {
  o = o || {};
  var b = h('button', { type: 'button', class: 'pmw-sc-btn' + (o.primary ? ' is-primary' : '') + (o.quiet ? ' is-quiet' : ''),
    'data-pm-hover-label': o.hover || label, 'data-pm-hover-detail': o.detail || 'Alt+click opens it in a new panel' }, [o.icon ? ico(o.icon) : null, h('span', { text: label })]);
  if (o.run) b.addEventListener('click', function (e) { o.run(e); });
  return b;
}
function targetBtn(label, t, o) {
  o = Object.assign({}, o || {});
  o.run = function (e) { openTarget(t, e); };
  var b = btn(label, o);
  b.setAttribute('data-pmw-sc-open', t.id);
  return b;
}
function iconBtn(iconName, label, detail, run) {
  var b = h('button', { type: 'button', class: 'pmw-sc-ib', 'aria-label': label, 'data-pm-hover-label': label, 'data-pm-hover-detail': detail || '', 'data-pmh': 'icon' }, [ico(iconName, 16)]);
  if (run) b.addEventListener('click', function (e) { run(e, b); });
  return b;
}
/* a file reference in prose: the code face, D7 on click */
function fileRef(path, line, text) {
  var a = h('button', { type: 'button', class: 'pmw-sc-fref', 'data-pmw-sc-file': path,
    'data-pm-hover-label': path + (line ? ':' + line : ''), 'data-pm-hover-detail': 'Click to preview, double-click to keep, Alt+click for a new panel' },
    text || (basename(path) + (line ? ':' + line : '')));
  a.addEventListener('click', function (e) { openFile(path, line, e); });
  return a;
}
/* a work row: icon, text, quiet meta; the whole row is the control */
function workRow(o) {
  var row = h('button', { type: 'button', class: 'pmw-sc-row', 'data-pmh': 'row', 'data-pm-hover-label': o.hover || o.text,
    'data-pm-hover-detail': o.file ? 'Click to preview, double-click to keep, Alt+click for a new panel' : 'Opens beside the chat · Alt+click for a new panel' }, [
    h('span', { class: 'pmw-sc-row-ico', 'aria-hidden': 'true' }, [ico(o.icon || 'file')]),
    h('span', { class: 'pmw-sc-row-t' }, o.textEl || o.text),
    o.meta ? h('span', { class: 'pmw-sc-row-m' + (o.state ? ' is-' + o.state : ''), text: o.meta }) : null
  ]);
  if (o.file) { row.setAttribute('data-pmw-sc-file', o.file); row.addEventListener('click', function (e) { openFile(o.file, o.line, e); }); }
  else if (o.target) { row.setAttribute('data-pmw-sc-open', o.target.id); row.addEventListener('click', function (e) { openTarget(o.target, e); }); }
  return row;
}
function card(o) {
  var head = h('header', { class: 'pmw-sc-card-head' }, [
    o.icon ? h('span', { class: 'pmw-sc-card-ico', 'aria-hidden': 'true' }, [ico(o.icon)]) : null,
    h('div', { class: 'pmw-sc-card-titles' }, [
      o.kicker ? h('p', { class: 'pmw-sc-kicker', text: o.kicker }) : null,
      o.titleEl || h('p', { class: 'pmw-sc-card-title', text: o.title })
    ]),
    o.status ? h('span', { class: 'pmw-sc-state' + (o.state ? ' is-' + o.state : ''), text: o.status }) : null
  ]);
  var c = h('section', { class: 'pmw-sc-card' + (o.cls ? ' ' + o.cls : ''), 'aria-label': o.aria || o.title || o.kicker, 'data-pmw-sc-msg': o.msg || null }, [head]);
  if (o.body) add(c, o.body);
  if (o.actions) c.appendChild(h('div', { class: 'pmw-sc-acts' }, o.actions));
  return c;
}
function para(parts) {
  var p = h('p', { class: 'pmw-sc-p' });
  parts.forEach(function (x) {
    if (typeof x === 'string') p.appendChild(document.createTextNode(x));
    else if (x.file) p.appendChild(fileRef(x.file, x.line, x.text));
    else if (x.code) p.appendChild(h('code', { class: 'pmw-sc-code', text: x.code }));
    else if (x.strong) p.appendChild(h('strong', { text: x.strong }));
  });
  return p;
}
function msgUser(text, time, atts) {
  return h('div', { class: 'pmw-sc-msg is-user' }, [text ? h('div', { class: 'pmw-sc-bubble', text: text }) : null,
    atts && atts.length ? h('div', { class: 'pmw-sc-msg-atts' }, atts.map(function (a) { return chipEl(a, false); })) : null,
    h('p', { class: 'pmw-sc-when', text: time || 'now' })]);
}
function msgAgent(kids, meta) {
  return h('div', { class: 'pmw-sc-msg is-agent' }, [h('div', { class: 'pmw-sc-agent' }, kids), meta ? h('p', { class: 'pmw-sc-when', text: meta }) : null]);
}
/* a message id for PM_HOME.chat.reveal (the scripted thread's ids are listed by PMW.standIn.messages()) */
function mid(el, id) { el.setAttribute('data-pmw-sc-msg', id); return el; }
function workGroup(title, rows) {
  return h('div', { class: 'pmw-sc-work' }, [h('p', { class: 'pmw-sc-work-head' }, [ico('clock', 13), h('span', { text: title })]), h('div', { class: 'pmw-sc-work-rows' }, rows)]);
}
function stateMark(kind) {
  /* drawn marks (no glyphs): check, cross, or a static square for "running" */
  var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16'); svg.setAttribute('width', '14'); svg.setAttribute('height', '14');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'pmw-sc-mark is-' + kind);
  var p = document.createElementNS(ns, 'path');
  p.setAttribute('d', kind === 'ok' ? 'M3.5 8.5l3 3 6-7' : kind === 'bad' ? 'M4.5 4.5l7 7M11.5 4.5l-7 7' : 'M5 5h6v6H5z');
  svg.appendChild(p);
  return svg;
}

/* ---- run cards: "Deciding in the panel beside the chat" while the run is the active tab of a panel ---- */
function runCard(o) {
  var acts = h('div', { class: 'pmw-sc-acts' }, o.actions);
  var deciding = h('p', { class: 'pmw-sc-deciding', hidden: true, role: 'status' }, [stateMark('run'), h('span', { text: 'Deciding in the panel beside the chat' })]);
  var c = card({ icon: 'run', kicker: o.kicker, title: o.title, status: o.status, state: o.state, body: o.body, cls: 'is-run' });
  c.appendChild(acts);
  c.appendChild(deciding);
  var rec = { ids: o.ids, el: c, acts: acts, deciding: deciding, on: false };
  S.runCards.push(rec);
  return c;
}
function recomputeRuns() {
  S.recomputeQueued = false;
  var tabs = [];
  try { tabs = PM_HOME.tabs() || []; } catch (_) { tabs = []; }
  S.runCards.forEach(function (r) {
    var on = tabs.some(function (t) { return t.active && r.ids.indexOf(t.tabId) >= 0; });
    if (on === r.on) return;
    r.on = on;
    r.acts.hidden = on;
    r.deciding.hidden = !on;
    r.el.toggleAttribute('data-deciding', on);
  });
}
function queueRecompute() {
  if (S.recomputeQueued) return;
  S.recomputeQueued = true;
  setTimeout(recomputeRuns, 0);
}

/* ---- the command card (replaces the 5.6 chat's inline Shell box) ---- */
function commandCard() {
  var lines = ['     Running benches/analytics.rs', 'tenant_read/composite_index  time: [68.9 ms 71.2 ms 73.8 ms]', 'tenant_read/created_at_only  time: [471 ms 482 ms 495 ms]',
    '                             change: -85.2% (p = 0.00 < 0.05)'];
  var pre = h('pre', { class: 'pmw-sc-cmd-out', 'data-pmh': 'off', 'aria-label': 'Last lines of the output' }, lines.join('\n'));
  var status = h('p', { class: 'pmw-sc-cmd-exit is-ok' }, [stateMark('ok'), h('span', { text: 'Exit code 0' }), h('span', { class: 'pmw-sc-dim', text: ' · ran in 45s' })]);
  var openSpec = { kind: 'terminal', id: 'terminal:cmd-bench', session: 'cmd-bench', cwd: CWD, invocation: 'cargo bench' };
  return card({ icon: 'terminal', kicker: 'Command · ' + CWD, cls: 'is-cmd', aria: 'Command cargo bench',
    titleEl: h('p', { class: 'pmw-sc-cmd-line' }, [h('span', { class: 'pmw-sc-dim', 'aria-hidden': 'true', text: '$ ' }), h('code', { text: 'cargo bench' })]),
    body: [pre, status],
    actions: [
      btn('Open in Terminal', { icon: 'terminal', primary: true, detail: 'Opens this command’s terminal tab · Alt+click for a new panel', run: function (e) {
        goHome();
        PM_HOME.open(Object.assign({}, openSpec, { label: 'cargo bench · api', by: 'user', where: e.altKey ? 'panel' : 'auto', background: !!(e.ctrlKey || e.metaKey) }));
      } }),
      btn('Rerun in Terminal', { icon: 'reload', detail: 'Runs cargo bench again in its terminal tab', run: function (e) {
        goHome();
        S.rerunN += 1;
        PM_HOME.open(Object.assign({}, openSpec, { label: 'cargo bench · api', by: 'user', rerun: true, state: { rerun: S.rerunN }, where: e.altKey ? 'panel' : 'auto' }));
        status.textContent = '';
        add(status, [stateMark('run'), h('span', { text: 'Running again in Terminal' })]);
        status.className = 'pmw-sc-cmd-exit';
        PMW.announce('Running cargo bench again in its terminal tab');
      } })
    ] });
}

/* ---- the Agent activity card (D8) ---- */
function agentCard() {
  var rows = AGENT_OPENS.map(function (a) {
    var res = h('span', { class: 'pmw-sc-row-m', text: 'Background' });
    var row = h('button', { type: 'button', class: 'pmw-sc-row', 'data-pmh': 'row', 'data-pmw-sc-agent': a.id,
      'data-pm-hover-label': a.who + ' ' + a.what, 'data-pm-hover-detail': 'Lands as a background tab with the hollow square; your focus stays here' }, [
      h('span', { class: 'pmw-sc-row-ico', 'aria-hidden': 'true' }, [ico(a.icon)]),
      h('span', { class: 'pmw-sc-row-t' }, [h('strong', { text: a.who }), ' ' + a.what]),
      res
    ]);
    row.addEventListener('click', function () { agentOpen(a, res); });
    a._res = res;
    return row;
  });
  return card({ icon: 'agent', kicker: 'Demo', title: 'Agent activity', cls: 'is-agents',
    body: [h('p', { class: 'pmw-sc-fine', text: 'Each row plays an agent opening something on its own. It lands behind your work with the hollow square and never takes your keyboard.' }),
      h('div', { class: 'pmw-sc-rows' }, rows)],
    actions: [btn('Play all', { icon: 'play', hover: 'Play every agent open', detail: 'One after another, all in the background', run: function () {
      var gap = PMW.reduced() ? 0 : 260;
      AGENT_OPENS.forEach(function (a, i) { setTimeout(function () { agentOpen(a, a._res); }, i * gap); });
    } })] });
}
function agentOpen(a, res) {
  var before = PM_HOME.active();
  var spec = Object.assign({}, a.spec);
  if (spec.kind === 'editor') spec.mode = 'keep';
  var r = PM_HOME.open(spec);
  var after = PM_HOME.active();
  var kept = JSON.stringify(before) === JSON.stringify(after);
  if (!r || !r.ok) { res.textContent = 'Could not open'; res.className = 'pmw-sc-row-m is-bad'; return r; }
  res.textContent = !kept ? 'Took focus' : r.created ? 'Opened behind' : 'Already open, marked';
  res.className = 'pmw-sc-row-m' + (kept ? ' is-ok' : ' is-bad');
  if (a.id === 'schema') addEvent('Schema Reviewer is blocked on the migration lock. Query Performance opened its transcript beside the chat.', T.agentSchema);
  return r;
}
function addEvent(text, t) {
  if (!S.list) return;
  var row = h('div', { class: 'pmw-sc-event' }, [ico('problems', 14), h('span', { class: 'pmw-sc-event-t', text: text }), t ? targetBtn('Open', t, { quiet: true }) : null]);
  keep(THREAD, row);
}
/* a node sent or replied in a thread: kept with that thread, and shown now when it is the thread on screen */
function keep(thread, node) {
  node.setAttribute('data-pmw-sc-sent', '');
  (S.sent[thread] = S.sent[thread] || []).push(node);
  if (thread === S.thread && S.list) { S.list.appendChild(node); scrollEnd(); }
}

/* ---- the scripted transcript ---- */
function transcript() {
  var out = [];
  out.push(mid(msgUser('Analytics is slow for our biggest tenants. Find out why and plan a fix.', '9:02 PM'), 'q-ask'));

  /* turn 1: the investigation */
  out.push(msgAgent([
    workGroup('Worked for 3m 12s', [
      workRow({ icon: 'file', text: 'Read src/analytics/queries.rs', meta: 'line 128', file: 'src/analytics/queries.rs', line: 128 }),
      workRow({ icon: 'search', text: 'Searched “postgres composite index write amplification” · 8 results', target: T.search }),
      workRow({ icon: 'link', text: 'PostgreSQL 16 · Multicolumn Indexes · postgresql.org', target: T.link }),
      workRow({ icon: 'record', text: 'Called grafana.query-range — p95 series, last 24h', target: T.mcp }),
      workRow({ icon: 'record', text: 'Refreshed schema metadata in the database inspector', target: T.inspector }),
      mid(workRow({ icon: 'document', textEl: [h('span', { class: 'pmw-sc-dim', text: 'Work note · ' }), document.createTextNode(T.workNote.label)], hover: 'Work note: ' + T.workNote.label, target: T.workNote }), 'm-7')
    ]),
    card({ icon: 'browser', kicker: 'Browser', title: 'Inspecting the live query dashboard', status: '8s ago',
      body: h('p', { class: 'pmw-sc-fine', text: 'Opened the Query Performance dashboard. Captured p50 118 ms and p95 482 ms. No console errors across 3 reloads.' }),
      actions: [targetBtn('Capture · browser fixture', T.capture, { icon: 'camera', detail: 'Opens the captured page in a browser tab' })] }),
    commandCard(),
    para(['The read filters on ', { code: 'tenant_id' }, ' and sorts on ', { code: 'created_at' }, ' in ', { file: 'src/analytics/queries.rs', line: 128 },
      ', but the only index is on ', { code: 'created_at' }, ' alone, so Postgres walks every tenant’s rows. A composite index on ',
      { code: '(tenant_id, created_at DESC)' }, ' takes p95 from 482 ms to 71 ms in the bench above.']),
    lensStrip(),
    planCard()
  ], 'Agent · Claude Sonnet 4.6 · 9:05 PM'));
  mid(out[out.length - 1], 'q-investigation');

  /* subagents */
  out.push(card({ icon: 'transcript', kicker: 'Live subagents', title: 'Two helpers on the read path', status: '2 running', cls: 'is-agents-live', msg: 'q-subagents',
    body: h('div', { class: 'pmw-sc-rows' }, [
      workRow({ icon: 'agent', text: 'Query Analyzer · Benchmarking tenant-scoped query alternatives', meta: 'running', state: 'ok', target: T.agentQuery }),
      workRow({ icon: 'agent', text: 'Schema Reviewer · Checking the migration lock', meta: 'waiting', state: 'warn', target: T.agentSchema })
    ]) }));

  /* turn 2: artifacts and evidence */
  out.push(msgAgent([
    workGroup('Worked for 1m 48s', [
      workRow({ icon: 'artifact', text: 'Rendered the rollout order diagram (mermaid)', target: T.mermaid }),
      workRow({ icon: 'artifact', textEl: [document.createTextNode('Replayed the dashboard workflow at 1440 px '), h('span', { class: 'is-ok', text: '(pass)' })], hover: 'Replayed the dashboard workflow at 1440 px (pass)', target: T.testEvidence })
    ]),
    artifactCard()
  ], 'Agent · Claude Sonnet 4.6 · 9:11 PM'));
  mid(out[out.length - 1], 'q-artifacts');

  out.push(mid(activityCard(), 'q-activity'));

  /* runs */
  out.push(mid(msgUser('Get a few opinions on the rollout before we ship it.', '9:14 PM'), 'q-ask-opinions'));
  out.push(msgAgent([
    para(['Four runs are going. Open one to decide in the panel beside the chat.']),
    runCard({ ids: [T.crew.id], kicker: 'Crew', title: 'Crew · Query Performance Rollout', status: 'Running', state: 'ok',
      body: h('p', { class: 'pmw-sc-fine', text: '3 helpers · part 1 done, 2 waiting · $0.34 of $6.00' }),
      actions: [targetBtn('Open Panel', T.crew, { primary: true, detail: 'Opens the run beside the chat · Alt+click for a new panel' })] }),
    runCard({ ids: [T.review.id, T.reviewEvidence.id], kicker: 'Multi-Pass Review', title: 'Multi-Pass Review · Orchestrator Boundary Changes', status: 'Pass 2 of 3',
      body: h('p', { class: 'pmw-sc-fine', text: '3 reviewers · 4 findings so far · $0.71 of $3.00' }),
      actions: [targetBtn('Open Panel', T.review, { primary: true, detail: 'Opens the run beside the chat · Alt+click for a new panel' }),
        targetBtn('Review evidence', T.reviewEvidence, { quiet: true, detail: 'The exact text every reviewer read' })] }),
    runCard({ ids: [T.room.id], kicker: 'Chat Room', title: 'Chat Room · Onboarding Redesign Options', status: 'Your move', state: 'warn',
      body: [h('p', { class: 'pmw-sc-p', text: 'Round 2 done. The Moderator summed it up.' }), h('p', { class: 'pmw-sc-fine', text: 'Round 2 of 5 · $0.22 so far of your $4.00 limit' })],
      actions: [targetBtn('Open Panel', T.room, { primary: true, detail: 'Opens the run beside the chat · Alt+click for a new panel' }),
        targetBtn('Open in the run frame', T.roomFrame, { quiet: true, detail: 'The same run: it reveals the Chat Room tab when it is open' })] }),
    runCard({ ids: [T.brainstorm.id], kicker: 'BrainStorm', title: 'BrainStorm · Provider Failover Strategy', status: 'Voting',
      body: h('p', { class: 'pmw-sc-fine', text: '3 options · Implementation leads · $2.68 of $14.00' }),
      actions: [targetBtn('Open Panel', T.brainstorm, { primary: true, detail: 'Opens the run beside the chat · Alt+click for a new panel' })] })
  ], 'Agent · 9:15 PM'));
  mid(out[out.length - 1], 'q-runs');

  /* planning and receipts */
  out.push(msgAgent([
    card({ icon: 'plan', kicker: 'Deep Plan · discovery', title: 'Session cache stampede: what the project already does', status: 'Done', state: 'ok',
      body: h('p', { class: 'pmw-sc-fine', text: 'Three passes · 14 sources read · 2 open questions' }),
      actions: [targetBtn('Open discovery', T.discovery, { primary: true })] }),
    card({ icon: 'plan', kicker: 'Plan · V1 · Deep · Thorough', title: 'Session cache stampede', status: 'Building',
      body: h('p', { class: 'pmw-sc-fine', text: '4 of 7 steps written' }),
      actions: [targetBtn('Open plan', T.planCache, { primary: true })] }),
    receipt('keep', [h('strong', { text: 'Rule saved: ' }), 'Measure against the production row shape before calling a query fast.'], targetBtn('View', T.teach, { quiet: true })),
    receipt('document', ['Took 1 note about this project for next time.'], targetBtn('Review', T.memory, { quiet: true })),
    receipt('reopen', ['Reverted 3 files from the first attempt.'], targetBtn('See what happened', T.revert, { quiet: true })),
    receipt('eye', [h('strong', { text: 'Wonderer ' }), 'has 3 ideas about the dashboard.'], [targetBtn('Open', T.wonderer, { quiet: true }), targetBtn('Open the source', T.wonderSource, { quiet: true })]),
    card({ icon: 'debug', kicker: 'Debug', title: 'Debug · Keep zero quantities', status: 'Phase 3 of 5',
      body: h('p', { class: 'pmw-sc-fine', text: 'Reproduced on the local example. The cause is narrowed to the unit table.' }),
      actions: [targetBtn('Open investigation', T.debug, { primary: true })] })
  ], 'Agent · 9:20 PM'));
  mid(out[out.length - 1], 'q-plans');

  out.push(mid(agentCard(), 'q-agent-activity'));
  return out;
}
function lensStrip() {
  return h('p', { class: 'pmw-sc-lens' }, [ico('eye', 14), h('span', { text: 'Lens: this answer read 4 messages.' }),
    targetBtn('Source', T.lensSource, { quiet: true, detail: 'The full message the answer read' }),
    targetBtn('See what it would read', T.lensEffective, { quiet: true, detail: 'Everything the next turn would read' })]);
}
function planCard() {
  var title = h('button', { type: 'button', class: 'pmw-sc-titlelink', 'data-pmw-sc-open': T.planAlias.id, 'data-pm-hover-label': 'Open the plan',
    'data-pm-hover-detail': 'The chat’s own name for it; it reveals the same tab' }, 'Tenant-scoped analytics read path');
  title.addEventListener('click', function (e) { openTarget(T.planAlias, e); });
  return card({ icon: 'plan', kicker: 'Plan · V5 · Thorough', titleEl: title, status: 'Ready', state: 'ok', aria: 'Plan Tenant-scoped analytics read path',
    body: h('p', { class: 'pmw-sc-fine', text: '6 steps · p95 under 100 ms · write overhead under 8%' }),
    actions: [targetBtn('Open plan', T.planIndex, { primary: true })] });
}
function artifactCard() {
  var vals = [482, 118, 71, 24, 38, 61, 44, 52];
  var max = 482, bars = h('div', { class: 'pmw-sc-bars', 'aria-hidden': 'true' });
  vals.forEach(function (v) { bars.appendChild(h('span', { class: 'pmw-sc-bar', style: 'height:' + Math.max(8, Math.round(v / max * 100)) + '%' })); });
  var v6 = h('button', { type: 'button', class: 'pmw-sc-fref is-ui', 'data-pmw-sc-open': T.dashboardV6.id, 'data-pm-hover-label': 'Open version 6', 'data-pm-hover-detail': 'The exact version this message used' },
    'Query Benchmark Dashboard · V6');
  v6.addEventListener('click', function (e) { openTarget(T.dashboardV6, e); });
  return card({ icon: 'artifact', kicker: 'dashboard', title: 'Query Benchmark Dashboard', status: 'Ready', state: 'ok', cls: 'is-artifact',
    body: [bars, h('p', { class: 'pmw-sc-fine', text: 'p50, p95, throughput, cache hits and write overhead, before and after the index.' }),
      h('p', { class: 'pmw-sc-fine' }, ['This message used ', v6])],
    actions: [targetBtn('Open', T.dashboard, { primary: true, icon: 'maximize' })] });
}
function receipt(iconName, text, actions) {
  return h('div', { class: 'pmw-sc-receipt' }, [h('span', { class: 'pmw-sc-row-ico', 'aria-hidden': 'true' }, [ico(iconName)]), h('p', { class: 'pmw-sc-receipt-t' }, text),
    h('span', { class: 'pmw-sc-receipt-acts' }, actions)]);
}
function activityCard() {
  var changeRows = CHANGES.map(function (c) {
    var meta = (c.plus ? '+' + c.plus : '') + (c.plus && c.minus ? ' ' : '') + (c.minus ? '−' + c.minus : '');
    var t = h('span', { class: 'pmw-sc-path' }, [h('span', { class: 'pmw-sc-path-t', text: c.ref }), h('span', { class: 'pmw-sc-path-s' + (c.state ? ' is-' + c.state : ''), text: ' ' + c.status.toLowerCase() })]);
    return workRow({ icon: 'diff', textEl: t, hover: c.ref + (c.status === 'Deleted' ? ' (deleted)' : ''), meta: meta, file: c.path, line: c.line });
  });
  var artRows = ARTIFACT_ROWS.map(function (a) {
    return workRow({ icon: 'artifact', textEl: [h('span', { text: catalogLabel(a.id, a.title) }), h('span', { class: 'pmw-sc-dim', text: ' · ' + a.word })],
      hover: a.title, meta: a.status, state: a.state === 'busy' ? null : a.state, target: { id: a.id, kind: 'artifact', label: catalogLabel(a.id, a.title) } });
  });
  return card({ icon: 'diff', kicker: 'Activity', title: 'This thread so far', cls: 'is-activity',
    body: [h('p', { class: 'pmw-sc-sum' }, ['Todo 4/12', sep(), 'Subagents 5', sep(), 'Changes 3 ', h('span', { class: 'is-ok', text: '+37' }), ' ', h('span', { class: 'is-bad', text: '−46' }), sep(), 'Artifacts 10']),
      h('h3', { class: 'pmw-sc-sub', text: 'Changes' }), h('div', { class: 'pmw-sc-rows' }, changeRows),
      h('h3', { class: 'pmw-sc-sub', text: 'Artifacts' }), h('div', { class: 'pmw-sc-rows' }, artRows)] });
}
function sep() { return h('span', { class: 'pmw-sc-sep', 'aria-hidden': 'true', text: ' · ' }); }

function otherThread(name, preview) {
  return [msgUser('Pick up where we left off.', 'Yesterday'),
    msgAgent([para([preview || 'Nothing new here since yesterday.']), h('div', { class: 'pmw-sc-acts' }, [btn('Back to ' + THREAD, { icon: 'chevronLeft', hover: 'Back to ' + THREAD, detail: 'The thread with every open path', run: function () { showThread(THREAD); } })])], 'Agent · Yesterday')];
}

/* ---- header, history, composer ---- */
function header() {
  var title = h('span', { class: 'pmw-sc-title', text: S.thread });
  S.titleEl = title;
  var hist = iconBtn('history', 'History', 'Every thread · a flyout that you can pin', function (e, b) { toggleHistory(b); });
  hist.setAttribute('aria-expanded', 'false');
  hist.setAttribute('aria-controls', 'pmw-sc-hist');
  S.histBtn = hist;
  var ring = contextRing(64);
  var pop = iconBtn('popOut', 'Pop out', 'Float the chat over the page; the only way to move it', function () {
    if (PMW.chatCol && PMW.chatCol.isFloating()) PMW.chatCol.dockBack(); else if (PMW.chatCol) PMW.chatCol.popOut();
    syncPop();
  });
  S.popBtn = pop;
  var more = iconBtn('more', 'More', 'Chat options', function (e, b) { moreMenu(b); });
  more.setAttribute('aria-haspopup', 'menu');
  return h('header', { class: 'pmw-sc-head' }, [hist,
    h('div', { class: 'pmw-sc-titles' }, [title, h('span', { class: 'pmw-sc-status' }, [stateMark('run'), h('span', { text: 'Working' })])]),
    ring, pop, more]);
}
function contextRing(pct) {
  var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '26'); svg.setAttribute('height', '26'); svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'pmw-sc-ring');
  var bg = document.createElementNS(ns, 'circle'), fg = document.createElementNS(ns, 'circle');
  [bg, fg].forEach(function (c) { c.setAttribute('cx', '12'); c.setAttribute('cy', '12'); c.setAttribute('r', '10.5'); });
  bg.setAttribute('class', 'pmw-sc-ring-bg'); fg.setAttribute('class', 'pmw-sc-ring-fg');
  var len = 2 * Math.PI * 10.5;
  fg.setAttribute('stroke-dasharray', (len * pct / 100).toFixed(1) + ' ' + len.toFixed(1));
  fg.setAttribute('transform', 'rotate(-90 12 12)');
  svg.appendChild(bg); svg.appendChild(fg);
  var b = h('button', { type: 'button', class: 'pmw-sc-ib pmw-sc-ringbtn', 'aria-label': 'Context ' + pct + ' percent used', 'aria-haspopup': 'menu',
    'data-pm-hover-label': 'Context ' + pct + '% used', 'data-pm-hover-detail': 'More Details opens it beside the chat', 'data-pmh': 'icon' }, [svg, h('span', { class: 'pmw-sc-ringn', text: String(pct) })]);
  b.addEventListener('click', function () {
    PMW.menu.open(b, { id: 'pmw-sc-context', title: 'Context', meta: pct + '% used', align: 'end', width: 260, rows: [
      { id: 'more-details', label: 'More Details', sub: 'What this thread holds, by source', icon: 'context', run: function (info) { openTarget(T.context, info && info.alt ? { altKey: true } : null); },
        alt: { label: 'Open in new panel', run: function () { openTarget(T.context, { altKey: true }); } } }
    ] });
  });
  return b;
}
function syncPop() {
  if (!S.popBtn) return;
  var floating = !!(PMW.chatCol && PMW.chatCol.isFloating());
  var label = floating ? 'Dock back' : 'Pop out';
  S.popBtn.setAttribute('aria-label', label);
  S.popBtn.setAttribute('data-pm-hover-label', label);
  S.popBtn.setAttribute('data-pm-hover-detail', floating ? 'Return the chat to the right side' : 'Float the chat over the page; the only way to move it');
  S.popBtn.setAttribute('aria-pressed', floating ? 'true' : 'false');
}
function moreMenu(anchor) {
  var floating = !!(PMW.chatCol && PMW.chatCol.isFloating());
  var pinned = PM_HOME.settings.get('chat.history') === 'pinned';
  PMW.menu.open(anchor, { id: 'pmw-sc-more', title: 'Chat', align: 'end', width: 280, rows: [
    { id: 'current', label: 'Show the current chat', sub: 'The stand-in comes back from Home options', icon: 'chat', run: function () { toggle(); } },
    floating ? { id: 'dock', label: 'Dock back', icon: 'popOut', run: function () { PMW.chatCol.dockBack(); syncPop(); } }
      : { id: 'pop', label: 'Pop out', sub: 'The only way to move the chat', icon: 'popOut', run: function () { PMW.chatCol.popOut(); syncPop(); } },
    { id: 'pin', label: 'Keep History open', sub: 'The chat grows by its width', checked: pinned, run: function () { setPinned(!pinned); } },
    { id: 'clear', label: 'Clear what you sent', icon: 'reopen', disabled: !S.sentCount, run: function () { resetThread(); } }
  ] });
}
function setPinned(on) {
  PM_HOME.settings.set('chat.history', on ? 'pinned' : 'flyout');
  paintHistoryMode();
  PMW.announce(on ? 'History stays open' : 'History opens as a flyout');
}
function paintHistoryMode() {
  if (!S.layer) return;
  var pinned = PM_HOME.settings.get('chat.history') === 'pinned';
  S.layer.toggleAttribute('data-pmw-sc-pinned', pinned);
  if (pinned) { S.hist.hidden = false; S.histOpen = false; S.histBtn.setAttribute('aria-expanded', 'true'); }
  else if (!S.histOpen) { S.hist.hidden = true; S.histBtn.setAttribute('aria-expanded', 'false'); }
  if (S.pinBtn) {
    S.pinBtn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
    var lbl = pinned ? 'Unpin History' : 'Pin History';
    S.pinBtn.setAttribute('aria-label', lbl); S.pinBtn.setAttribute('data-pm-hover-label', lbl);
  }
}
function history() {
  var search = h('input', { type: 'search', class: 'pmw-sc-hsearch', placeholder: 'Find a thread', 'aria-label': 'Find a thread', autocomplete: 'off', spellcheck: 'false',
    'data-pmh': 'off', 'data-pm-hover-visual-suppressed': 'true' });
  var list = h('div', { class: 'pmw-sc-hlist', role: 'list' });
  function fill(q) {
    list.textContent = '';
    q = (q || '').toLowerCase();
    [['Pinned', THREADS.pinned], ['Recent', THREADS.recent]].forEach(function (sec) {
      var rows = sec[1].filter(function (t) { return !q || (t[0] + ' ' + t[1]).toLowerCase().indexOf(q) >= 0; });
      if (!rows.length) return;
      list.appendChild(h('p', { class: 'pmw-sc-hsec', text: sec[0] }));
      rows.forEach(function (t) {
        var cur = t[0] === S.thread;
        var r = h('button', { type: 'button', role: 'listitem', class: 'pmw-sc-hrow pmw-cur' + (cur ? ' pmw-chosen' : ''), 'data-pmh': 'row', 'aria-current': cur ? 'true' : null,
          'data-pm-hover-visual-suppressed': 'true' }, [h('span', { class: 'pmw-sc-hrow-t', text: t[0] }), h('span', { class: 'pmw-sc-hrow-p', text: t[1] })]);
        r.addEventListener('click', function () { showThread(t[0], t[1]); if (PM_HOME.settings.get('chat.history') !== 'pinned') closeHistory(true); fill(search.value); });
        list.appendChild(r);
      });
    });
    if (!list.children.length) list.appendChild(h('p', { class: 'pmw-sc-fine pmw-sc-hempty', text: 'No thread matches.' }));
  }
  search.addEventListener('input', function () { fill(search.value); });
  S.fillHistory = function () { fill(search.value); };
  fill('');
  var pin = iconBtn('pin', 'Pin History', 'Keep the list open; the chat grows by its width', function () { setPinned(PM_HOME.settings.get('chat.history') !== 'pinned'); });
  S.pinBtn = pin;
  var panel = h('nav', { id: 'pmw-sc-hist', class: 'pmw-sc-hist', 'aria-label': 'Threads', hidden: true }, [
    h('div', { class: 'pmw-sc-hhead' }, [h('span', { class: 'pmw-sc-htitle', text: 'Threads' }), pin]),
    h('label', { class: 'pmw-sc-hfind' }, [ico('search', 14), search]),
    list]);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.histOpen) { e.stopPropagation(); closeHistory(true); } });
  S.histSearch = search;
  return panel;
}
function toggleHistory(b) {
  if (PM_HOME.settings.get('chat.history') === 'pinned') { setPinned(false); return; }
  if (S.histOpen) closeHistory(true); else openHistory();
}
function openHistory() {
  S.histOpen = true;
  S.hist.hidden = false;
  S.layer.setAttribute('data-pmw-sc-hist', 'open');
  S.histBtn.setAttribute('aria-expanded', 'true');
  if (S.fillHistory) S.fillHistory();
  setTimeout(function () { try { S.histSearch.focus({ preventScroll: true }); } catch (_) {} }, 0);
}
function closeHistory(returnFocus) {
  if (!S.histOpen) return;
  S.histOpen = false;
  S.layer.removeAttribute('data-pmw-sc-hist');
  if (PM_HOME.settings.get('chat.history') !== 'pinned') { S.hist.hidden = true; S.histBtn.setAttribute('aria-expanded', 'false'); }
  if (returnFocus) try { S.histBtn.focus({ preventScroll: true }); } catch (_) {}
}
function composer() {
  var ta = h('textarea', { class: 'pmw-sc-input', rows: '2', placeholder: 'Ask Puppet Master about this project', 'aria-label': 'Message', 'data-pmh': 'off',
    'data-pm-hover-visual-suppressed': 'true', spellcheck: 'true' });
  var send = iconBtn('arrowUp', 'Send', 'Enter sends · Shift+Enter starts a new line', function () { submit(); });
  send.classList.add('pmw-sc-send');
  ta.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
  });
  ta.addEventListener('input', fit);
  /* where Insert at cursor lands: the caret when the box last had it (the end before it ever had it) */
  function remember() { S.caret = { start: ta.selectionStart, end: ta.selectionEnd }; }
  ta.addEventListener('blur', remember);
  ta.addEventListener('select', remember);
  S.input = ta;
  S.attsEl = h('div', { class: 'pmw-sc-atts', role: 'list', 'aria-label': 'Attached to this message', hidden: true });
  return h('div', { class: 'pmw-sc-comp' }, [h('div', { class: 'pmw-sc-box' }, [S.attsEl, ta,
    h('div', { class: 'pmw-sc-comprow' }, [h('span', { class: 'pmw-sc-mode', text: 'Agent · Claude Sonnet 4.6 · Auto' }), send])])]);
}
/* the box grows with its text up to 160 px, then scrolls */
function fit() {
  if (!S.input) return;
  S.input.style.height = 'auto';
  S.input.style.height = Math.min(160, Math.max(44, S.input.scrollHeight)) + 'px';
}
function focusComposer(caret) {
  if (!S.input) return;
  var n = caret == null ? S.input.value.length : caret;
  function go() {
    try { S.input.focus({ preventScroll: true }); } catch (_) {}
    try { S.input.setSelectionRange(n, n); } catch (_) {}
  }
  go();
  /* a menu or button that ran this may hand focus back to itself as it closes: take it once more, next frame */
  requestAnimationFrame(function () { var a = document.activeElement; if (a !== S.input && !(S.layer && S.layer.contains(a))) go(); });
}

/* ---- attachments: the browser's captures and picked parts, drawn as small cards (never pills) ---- */
var capKeys = typeof WeakMap === 'function' ? new WeakMap() : null, capSeq = 0;
function capKey(tabId, c) {
  if (!capKeys) return 'cap:' + tabId + ':' + c.kind + ':' + c.at + ':' + c.w + 'x' + c.h;
  var k = capKeys.get(c);
  if (!k) { capSeq += 1; k = 'cap:' + tabId + ':' + capSeq; capKeys.set(c, k); }
  return k;
}
function compName(i) { return i.comp ? (i.comp.charAt(0) === '<' ? i.comp : '<' + i.comp + '>') : '<' + (i.el || 'element') + '>'; }
function attFromCapture(tabId, c) {
  if (!c || c.kind === 'refused') return null;
  if (c.kind === 'component') {
    var name = compName({ comp: c.comp });
    return { key: 'comp:' + tabId + ':' + name, type: 'component', tabId: tabId, label: name, detail: c.title || '', page: c.title || '' };
  }
  var word = c.kind === 'page' ? 'Full page screenshot' : c.kind === 'region' ? 'Region screenshot' : 'Full screenshot';
  return { key: capKey(tabId, c), type: 'capture', tabId: tabId, kind: c.kind, label: word, page: c.title || '',
    detail: (c.title || 'Browser') + (c.w ? ' · ' + c.w + ' × ' + c.h : ''), thumb: c.thumb };
}
function attFromComponent(tabId, i) {
  if (!i) return null;
  var name = compName(i), key = 'comp:' + tabId + ':' + name;
  var had = S.atts.filter(function (a) { return a.key === key; })[0];
  return { key: key, type: 'component', tabId: tabId, label: name, src: i.src || '', page: had ? had.page : '',
    detail: i.src || (had && had.detail) || i.text || '' };
}
function chipEl(a, removable) {
  var thumb;
  if (a.type === 'capture') {
    var t = a.thumb || ['#888', '#aaa', '#ddd'];
    thumb = h('span', { class: 'pmw-sc-att-thumb' + (a.kind === 'region' ? ' is-crop' : ''), 'aria-hidden': 'true', style: '--t1:' + t[0] + ';--t2:' + t[1] + ';--t3:' + t[2] }, [h('i'), h('i'), h('i')]);
  } else thumb = h('span', { class: 'pmw-sc-att-thumb is-comp', 'aria-hidden': 'true' }, [ico('code', 14)]);
  var body = h('button', { type: 'button', class: 'pmw-sc-att-body', 'data-pmh': 'off', 'aria-label': a.label + (a.detail ? ', ' + a.detail : '') + '. Show the browser tab',
    'data-pm-hover-label': a.label, 'data-pm-hover-detail': 'Shows the browser tab it came from' }, [thumb,
    h('span', { class: 'pmw-sc-att-t' }, [h('span', { class: 'pmw-sc-att-l', text: a.label }), a.detail ? h('span', { class: 'pmw-sc-att-d', text: a.detail }) : null])]);
  body.addEventListener('click', function () {
    var r = null;
    try { r = a.tabId ? PM_HOME.reveal(a.tabId) : null; } catch (_) { r = null; }
    if (!r || r.ok === false) PMW.announce('The browser tab it came from is closed');
  });
  var chip = h('span', { class: 'pmw-sc-att' + (a.type === 'component' ? ' is-comp' : ''), role: removable ? 'listitem' : null }, [body]);
  if (removable) {
    var x = h('button', { type: 'button', class: 'pmw-sc-att-x', 'aria-label': 'Remove ' + a.label, 'data-pm-hover-label': 'Remove', 'data-pm-hover-detail': 'Takes it off this message', 'data-pmh': 'icon' }, [ico('close', 12)]);
    x.addEventListener('click', function () { removeAtt(a.key); PMW.announce(a.label + ' removed'); focusComposer(); });
    chip.appendChild(x);
  }
  return chip;
}
function renderAtts() {
  if (!S.attsEl) return;
  S.attsEl.textContent = '';
  S.atts.forEach(function (a) { S.attsEl.appendChild(chipEl(a, true)); });
  S.attsEl.hidden = !S.atts.length;
}
var MAX_ATTS = 6;
function addAtt(a) {
  if (!a) return;
  S.atts = S.atts.filter(function (x) { return x.key !== a.key; });
  S.atts.push(a);
  if (S.atts.length > MAX_ATTS) S.atts = S.atts.slice(S.atts.length - MAX_ATTS);
  renderAtts();
}
function removeAtt(key) { S.atts = S.atts.filter(function (x) { return x.key !== key; }); renderAtts(); }

/* ---- sending and the scripted replies ---- */
function fileKnown(path) { try { return !!PMW.fileIndex && PMW.fileIndex(path, 40).indexOf(path) >= 0; } catch (_) { return false; } }
function replyFor(atts) {
  var comp = atts.filter(function (a) { return a.type === 'component'; })[0];
  if (comp) {
    var m = /^(.*?):(\d+)/.exec(comp.src || '');
    if (m && fileKnown(m[1])) return ['I’ll look at ', { code: comp.label }, '. It is drawn in ', { file: m[1], line: +m[2] }, '.'];
    return ['I’ll look at ', { code: comp.label }, ' on ' + (comp.page || 'that page') + '. The page has no source for it, so I’ll work from what it draws.'];
  }
  var cap = atts.filter(function (a) { return a.type === 'capture'; })[0];
  if (cap) return ['I have the ' + cap.label.toLowerCase() + ' of ' + (cap.page || 'the page') + '. I’ll use it when I check the layout.'];
  var r = REPLIES[S.replyN % REPLIES.length];
  S.replyN += 1;
  return r;
}
function post(text, atts) {
  atts = atts || [];
  var thread = S.thread;
  S.sentCount = (S.sentCount || 0) + 1;
  keep(thread, msgUser(text, 'now', atts));
  var reply = replyFor(atts);
  setTimeout(function () {
    keep(thread, msgAgent([para(reply)], 'Agent · now'));
    PMW.announce('Puppet Master replied');
    try { PMW.bus.emit('chat', { type: 'turn-finished', threadId: threadIdOf(thread) }); } catch (_) {}
  }, PMW.reduced() ? 120 : 650);
}
function submit() {
  var text = (S.input.value || '').trim();
  if (!text && !S.atts.length) return;
  var atts = S.atts.slice();
  S.input.value = '';
  fit();
  S.atts = [];
  renderAtts();
  post(text, atts);
}
function scrollEnd() {
  if (!S.scroll) return;
  var smooth = !PMW.reduced();
  try { S.scroll.scrollTo({ top: S.scroll.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }); } catch (_) { S.scroll.scrollTop = S.scroll.scrollHeight; }
}
function resetThread() {
  (S.sent[S.thread] || []).forEach(function (n) { n.remove(); });
  S.sent[S.thread] = [];
  S.sentCount = 0;
}
function showThread(name, preview, quiet) {
  if (name === S.thread) return;
  S.thread = name;
  S.titleEl.textContent = name;
  S.list.textContent = '';
  if (name === THREAD) { add(S.list, S.scripted); queueRecompute(); }
  else add(S.list, otherThread(name, preview || threadPreview(name)));
  add(S.list, S.sent[name] || []);
  S.scroll.scrollTop = name === THREAD ? S.scroll.scrollHeight : 0;
  if (S.fillHistory) S.fillHistory();
  if (!quiet) PMW.announce('Showing ' + name);
}

/* ---- the hooks for the kinds (PM_HOME.chat in 46-chat.js reaches these through PMW.chatCol.surface) ---- */
/* compose: the text goes in the composer, focused, caret at the end; a draft already there is kept and the text follows
   it on a new line (the same text twice is not added twice) */
function compose(text) {
  if (!S.input) return { ok: false, reason: 'not_installed' };
  closeHistory(false);
  var t = String(text == null ? '' : text), cur = S.input.value || '', tt = t.trim();
  var next = !tt ? cur : !cur.trim() ? t : cur.replace(/\s+$/, '').slice(-tt.length) === tt ? cur : cur.replace(/\s+$/, '') + '\n' + t;
  S.input.value = next;
  fit();
  focusComposer(next.length);
  return { ok: true, surface: 'stand-in' };
}
function findIn(nodes, id) {
  var v = String(id), path = v.indexOf('file:') === 0 ? v.slice(5) : v;
  var sels = [];
  try {
    var e = window.CSS && CSS.escape ? CSS.escape : function (x) { return x.replace(/["\\]/g, '\\$&'); };
    sels.push('[data-pmw-sc-msg="' + e(v) + '"]', '[data-pmw-sc-open="' + e(v) + '"]', '[data-pmw-sc-file="' + e(path) + '"]');
    if (/^work-record:/.test(v)) sels.push('[data-pmw-sc-msg="' + e(v.slice(12)) + '"]');
  } catch (_) { return null; }
  for (var s = 0; s < sels.length; s++) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!n || n.nodeType !== 1) continue;
      if (n.matches(sels[s])) return n;
      var hit = n.querySelector(sels[s]);
      if (hit) return hit;
    }
  }
  return null;
}
function nodesOf(thread) { return (thread === THREAD ? S.scripted : []).concat(S.sent[thread] || []); }
function scrollToEl(el) {
  var sc = S.scroll;
  if (!sc) return;
  var sr = sc.getBoundingClientRect(), er = el.getBoundingClientRect();
  var top = Math.max(0, sc.scrollTop + (er.top - sr.top) - Math.max(16, (sr.height - er.height) / 2));
  try { sc.scrollTo({ top: top, behavior: PMW.reduced() ? 'auto' : 'smooth' }); } catch (_) { sc.scrollTop = top; }
}
function markEl(el) {
  if (el.classList.contains('pmw-sc-msg') && el.classList.contains('is-user')) el = el.querySelector('.pmw-sc-bubble, .pmw-sc-msg-atts') || el;
  if (S.marked) S.marked.removeAttribute('data-pmw-sc-found');
  clearTimeout(S.markTimer);
  S.marked = el;
  el.removeAttribute('data-pmw-sc-found');
  void el.offsetWidth;   // restart the fade when the same message is marked twice
  el.setAttribute('data-pmw-sc-found', '');
  S.markTimer = setTimeout(function () { el.removeAttribute('data-pmw-sc-found'); if (S.marked === el) S.marked = null; }, 2400);
}
function reveal(o) {
  o = o || {};
  if (!S.list) return { ok: false, found: false, thread: null, reason: 'not_installed' };
  closeHistory(false);
  var want = null;
  if (o.thread != null && o.thread !== '') {
    want = threadByKey(o.thread);
    if (!want) { PMW.announce('That thread is not in this demo'); return { ok: false, found: false, thread: threadIdOf(S.thread), reason: 'unknown_thread' }; }
  } else if (o.messageId) {
    // no thread named: the thread on screen when it has the message, else the scripted thread when that has it
    want = findIn(nodesOf(S.thread), o.messageId) ? S.thread : findIn(nodesOf(THREAD), o.messageId) ? THREAD : S.thread;
  }
  if (want && want !== S.thread) showThread(want, threadPreview(want), true);
  var el = o.messageId ? findIn(nodesOf(S.thread), o.messageId) : null;
  if (!el || !S.list.contains(el)) {
    PMW.announce(o.messageId ? 'That message is not in this demo' : 'Showing ' + S.thread);
    return { ok: true, found: false, thread: threadIdOf(S.thread) };
  }
  scrollToEl(el);
  markEl(el);
  PMW.announce('Showing the message in ' + S.thread);
  return { ok: true, found: true, thread: threadIdOf(S.thread) };
}

/* ---- the browser kind: its captures attach here; Send to chat posts, lists or inserts the part it picked ---- */
function onCapture(e) {
  if (!e || !e.capture) return;
  addAtt(attFromCapture(e.tabId, e.capture));
}
function insertAtCaret(text) {
  var v = S.input.value || '';
  var at = S.caret && S.caret.start != null && S.caret.start <= v.length ? S.caret : { start: v.length, end: v.length };
  var before = v.slice(0, at.start), after = v.slice(Math.max(at.start, at.end));
  var pre = before && !/\s$/.test(before) ? ' ' : '';
  S.input.value = before + pre + text + after;
  var caret = (before + pre + text).length;
  S.caret = { start: caret, end: caret };
  fit();
  focusComposer(caret);
}
function onSend(e) {
  if (!e || !e.what) return;
  var a = e.how === 'capture' ? attFromCapture(e.tabId, e.what) : attFromComponent(e.tabId, e.what);
  if (!a) return;
  if (!drawn()) {
    // the page's own chat is showing: the reference goes in its box; it cannot take attachments
    if (e.how === 'list' || e.how === 'insert') PM_HOME.chat.compose(a.label + ' ');
    return;
  }
  if (PMW.chatCol) PMW.chatCol.show();
  closeHistory(false);
  if (e.how === 'capture') {
    // "Sends the capture as its own message"
    removeAtt(a.key);
    post('', [a]);
    return;
  }
  if (e.how === 'send') {
    // the draft is the instruction; everything attached goes with it
    var text = (S.input.value || '').trim() || 'Look at ' + a.label + (a.page ? ' on ' + a.page : '') + '.';
    var atts = S.atts.filter(function (x) { return x.key !== a.key; }).concat([a]);
    S.input.value = '';
    fit();
    S.atts = [];
    renderAtts();
    post(text, atts);
    return;
  }
  addAtt(a);
  if (e.how === 'list') {
    var v = (S.input.value || '').replace(/\s+$/, '');
    var n = (v.match(/^\s*\d+\.\s/gm) || []).length + 1;
    S.input.value = (v ? v + '\n' : '') + n + '. ' + a.label + ' ';
    fit();
    focusComposer();
  } else insertAtCaret(a.label + ' ');
}

/* ---- install ---- */
function build() {
  S.runCards = [];
  S.scripted = transcript();
  S.list = h('div', { class: 'pmw-sc-list' });
  add(S.list, S.scripted);
  S.scroll = h('div', { class: 'pmw-sc-scroll', role: 'log', 'aria-label': 'Messages', tabindex: '-1', 'data-pmh': 'off' }, [S.list]);
  S.hist = history();
  var body = h('div', { class: 'pmw-sc-body' }, [S.hist, h('div', { class: 'pmw-sc-main' }, [S.scroll, composer()])]);
  var layer = h('div', { id: 'pmw-chat', class: 'pmw-scope pmw-sc', role: 'region', 'aria-label': 'Chat' }, [header(), body]);
  S.layer = layer;
  /* the flyout closes on a click outside it */
  layer.addEventListener('pointerdown', function (e) {
    if (!S.histOpen) return;
    if (e.target.closest && (e.target.closest('.pmw-sc-hist') || e.target.closest('.pmw-sc-ib[aria-controls="pmw-sc-hist"]'))) return;
    closeHistory(false);
  });
  layer.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.histOpen) { e.stopPropagation(); closeHistory(true); } });
  /* pinned History's width comes from the ladder's constants: chatHistoryW, or chatHistoryWNarrow while the whole layer
     is under chatHistoryAt (only a squeezed or capped column gets there; the column normally grows by chatHistoryW) */
  if (typeof ResizeObserver === 'function') new ResizeObserver(fitHistory).observe(layer);
  fitHistory();
  return layer;
}
function fitHistory() {
  if (!S.layer) return;
  var L = PMW.LADDER || {}, w = S.layer.getBoundingClientRect().width;
  var hw = w && w < (L.chatHistoryAt || 540) ? (L.chatHistoryWNarrow || 200) : (L.chatHistoryW || 240);
  var px = hw + 'px';
  if (S.layer.style.getPropertyValue('--pmw-sc-hist-w') !== px) S.layer.style.setProperty('--pmw-sc-hist-w', px);
}
function seat() {
  var cp = document.getElementById('chatPanel');
  if (!cp || !S.layer) return;
  if (S.layer.parentNode !== cp) cp.appendChild(S.layer);
}
function install() {
  if (S.installed) { seat(); return; }
  var cp = document.getElementById('chatPanel');
  if (!cp) return;
  S.installed = true;
  build();
  cp.appendChild(S.layer);
  apply();
  paintHistoryMode();
  syncPop();
  /* the page's chat may re-render its own content; the layer goes back in (same node, state kept) */
  if (typeof MutationObserver === 'function') new MutationObserver(function () { if (S.layer.parentNode !== cp) seat(); }).observe(cp, { childList: true });
  ['activate', 'close', 'open', 'layout'].forEach(function (ev) { PM_HOME.on(ev, queueRecompute); });
  PM_HOME.on('chat', function (e) { if (!e || e.type == null) syncPop(); });
  PM_HOME.settings.on(SC_KEY, apply);
  PM_HOME.settings.on('chat.history', paintHistoryMode);
  PMW.bus.on('browser:capture', onCapture);
  PMW.bus.on('browser:send', onSend);
  /* the chat column asks the surface on screen whether it draws pinned History and routes PM_HOME.chat to it */
  if (PMW.chatCol) PMW.chatCol.surface = { drawsHistory: drawn, shown: drawn, compose: compose, reveal: reveal };
  /* the Guided Tour lifts the layer (CSS); the column then loses the History's width until the tour ends */
  if (typeof MutationObserver === 'function') new MutationObserver(function () {
    if (document.documentElement.hasAttribute('data-o55-tour')) closeHistory(false);
    if (PMW.narrow) PMW.narrow.schedule();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-o55-tour'] });
  if (PMW.narrow) PMW.narrow.schedule();
  queueRecompute();
  setTimeout(function () { if (S.scroll) S.scroll.scrollTop = S.scroll.scrollHeight; }, 0);
}

PMW.standIn = {
  install: install,
  isOn: isOn,
  toggle: toggle,
  /* the kinds' hook (the run kind's "Message" uses it): show the chat, the text in its composer, caret at the end */
  prefill: function (text) { return PM_HOME.chat ? PM_HOME.chat.compose(text) : compose(text); },
  compose: compose,
  reveal: reveal,
  drawn: drawn,
  /* tests: the controls in the transcript, by id */
  controls: function () { return Object.keys(T).map(function (k) { return { key: k, id: T[k].id, kind: T[k].kind, label: T[k].label }; }); },
  agentOpens: function () { return AGENT_OPENS.map(function (a) { return { id: a.id, by: a.spec.by, kind: a.spec.kind }; }); },
  messages: function () { return (S.scripted || []).reduce(function (out, n) { return out.concat(n.matches('[data-pmw-sc-msg]') ? [n] : [], Array.prototype.slice.call(n.querySelectorAll('[data-pmw-sc-msg]'))); }, []).map(function (n) { return n.getAttribute('data-pmw-sc-msg'); }); },
  threads: function () { return allThreads().map(function (t) { return { id: threadIdOf(t[0]), title: t[0] }; }); },
  attachments: function () { return S.atts.map(function (a) { return { key: a.key, type: a.type, label: a.label, detail: a.detail }; }); },
  draft: function () { return S.input ? S.input.value : ''; }
};
