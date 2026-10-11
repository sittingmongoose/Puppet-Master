/* The Record viewer kind (D9; CONTRACT section 2; digest 05 sections 8 and 12): the read-only records a working
   activity row opens. Ids keep the chat's grammar exactly (app.js:1355 workDocId):
     search:<enc query>|<enc tag>     a web search and the results it kept
     mcp:<enc tool>|<enc text>        an MCP tool call: the request and the response
     app:inspector                    the database inspector: the schema, its indexes and the planner's choice
     work-record:<message>            a work note with no other owner (no linked file or artifact)
   The shared header row says what the record is ("Web search", "8 results") with Copy, Show in chat and Maximize; the
   body is the shared document frame: the title, a plain meta line, one quiet line that nothing was fetched, then the
   request and the result in the code face. A search result that is a project file is the shared file reference
   (PMW.fileRef: single click a preview tab, double click a kept one, D7) drawn as a result row; a web result opens a
   Browser tab under the chat's link: id. Show in chat finds the work row in its thread (PM_HOME.chat.reveal).
   Never claims live data. Single column; the column stops at 960 px; tables scroll sideways in a narrow tab. */

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
function dec(s) { try { return decodeURIComponent(s); } catch (_) { return s; } }
function enc(s) { return encodeURIComponent(s); }

/* the id grammar: kind + ':' + encode(a) + ('|' + encode(b))? */
function parseId(id) {
  id = String(id || '');
  var i = id.indexOf(':');
  var kind = i < 0 ? id : id.slice(0, i), rest = i < 0 ? '' : id.slice(i + 1);
  if (kind === 'work-record') return { kind: kind, a: rest, b: '' };
  var bar = rest.indexOf('|');
  return { kind: kind, a: dec(bar < 0 ? rest : rest.slice(0, bar)), b: bar < 0 ? '' : dec(rest.slice(bar + 1)) };
}
function recordId(kind, a, b) { return kind + ':' + enc(a) + (b ? '|' + enc(b) : ''); }

/* ---- the recorded content (the query thread's working card, data.js:361-410) ---- */
var SEARCHES = {
  'postgres composite index write amplification': {
    at: '12:02 PM', thread: 'Query performance', engine: 'web', total: 8,
    results: [
      { web: 'postgresql.org', path: '/docs/16/indexes-multicolumn.html', title: 'PostgreSQL 16 · Multicolumn Indexes',
        snippet: 'A multicolumn B-tree index can be used with query conditions that involve any subset of the index’s columns, but the index is most efficient when there are constraints on the leading (leftmost) columns.' },
      { web: 'postgresql.org', path: '/docs/16/indexes-index-only-scans.html', title: 'PostgreSQL 16 · Index-Only Scans',
        snippet: 'Every index costs something on each insert: the table row is written once and every index on the table is updated with it.' },
      { web: 'wiki.postgresql.org', path: '/wiki/Index_Maintenance', title: 'Locking notes for concurrent index builds',
        snippet: 'CREATE INDEX CONCURRENTLY scans the table twice and waits for existing transactions, so it cannot run inside a transaction block.' },
      { file: 'src/analytics/queries.rs', line: 128, title: 'queries.rs · events_for_tenant',
        snippet: 'SELECT * FROM events WHERE tenant_id = $1 AND created_at >= $2 ORDER BY created_at DESC: the read the composite index serves.' },
      { file: 'benches/fixtures/events.rs', line: 12, title: 'events.rs · the benchmark fixture',
        snippet: '214 tenants x 600 events = 128,400 rows, so write amplification is measured at production row shape.' }
    ]
  },
  'index only scan visibility map': {
    at: '12:02 PM', thread: 'Query performance', engine: 'web', total: 3,
    results: [
      { web: 'postgresql.org', path: '/docs/16/indexes-index-only-scans.html', title: 'PostgreSQL 16 · Index-Only Scans',
        snippet: 'An index-only scan skips the heap only for pages the visibility map marks all-visible; recently written pages still need a heap visit.' },
      { web: 'postgresql.org', path: '/docs/16/storage-vm.html', title: 'PostgreSQL 16 · Visibility Map',
        snippet: 'Each heap relation has a visibility map to keep track of which pages contain only tuples that are known to be visible to all active transactions.' },
      { web: 'wiki.postgresql.org', path: '/wiki/Index-only_scans', title: 'Index-only scans',
        snippet: 'Vacuum sets the all-visible bits; a table with heavy writes and a lazy autovacuum gets fewer index-only scans than its plan suggests.' }
    ]
  },
  'autovacuum analyze threshold after create index': {
    at: '12:09 PM', thread: 'Query performance', engine: 'web', total: 6,
    results: [
      { web: 'postgresql.org', path: '/docs/16/routine-vacuuming.html', title: 'PostgreSQL 16 · Routine Vacuuming',
        snippet: 'The autovacuum daemon runs ANALYZE when the number of rows changed since the last one exceeds the analyze threshold plus a fraction of the table.' },
      { web: 'postgresql.org', path: '/docs/16/autovacuum-settings.html', title: 'PostgreSQL 16 · Automatic Vacuuming settings',
        snippet: 'autovacuum_analyze_scale_factor defaults to 0.1, so a 128,400-row table is analyzed again after about 12,890 changed rows.' },
      { file: 'migrations/0043_tenant_created_index.sql', line: 1, title: '0043_tenant_created_index.sql',
        snippet: 'CREATE INDEX CONCURRENTLY idx_events_tenant_created ON events (tenant_id, created_at DESC); marked no-transaction.' }
    ]
  }
};
var MCP = {
  'grafana.query-range': {
    server: 'Grafana', at: '12:04 PM', thread: 'Query performance', state: 'Succeeded',
    request: { query: 'histogram_quantile(0.95, sum by (le, route) (rate(http_request_duration_seconds_bucket{route=~"/analytics/.*"}[5m])))', range: '24h', step: '5m' },
    summary: '2 series, 288 points each. The report starts from this baseline.',
    table: { head: ['Series', 'Points', 'Lowest', 'Median', 'Highest'], rows: [
      ['/analytics/events p95', '288', '431 ms', '482 ms', '611 ms'],
      ['/analytics/rollup p95', '288', '96 ms', '118 ms', '164 ms']] },
    response: '{\n  "status": "success",\n  "resultType": "matrix",\n  "result": [\n    { "metric": { "route": "/analytics/events" }, "values": [[1760004000, "0.482"], [1760004300, "0.477"], "286 more"] },\n    { "metric": { "route": "/analytics/rollup" }, "values": [[1760004000, "0.118"], [1760004300, "0.121"], "286 more"] }\n  ]\n}'
  },
  'linear.update-issue': {
    server: 'Linear', at: '12:14 PM', thread: 'Query performance', state: 'Succeeded',
    request: { issue: 'PERF-218', state: 'In Review', comment: 'index landed: p95 482 ms to 71 ms, inserts 4.8% slower. Benchmark dashboard attached.' },
    summary: 'PERF-218 moved to In Review, with the comment and the dashboard link.',
    response: '{\n  "issue": "PERF-218",\n  "title": "Analytics dashboard p95 over budget",\n  "state": "In Review",\n  "comment_added": true,\n  "attachments": 1,\n  "updated": "2026-10-09T12:14:03Z"\n}'
  }
};
var WORK = {
  'm-7': { title: 'Kept idx_events_created until the new index is proven', at: '12:04 PM', thread: 'Query performance',
    detail: 'Dropping `idx_events_created` waits for one full day of **p95 under 100 ms** on `idx_events_tenant_created`. Until then both indexes cost write time: about **2.1% more** on inserts, measured over 50,000 rows.' }
};

/* inline `code` and **bold** only (the chat's formatRecord) */
function inline(text) {
  var out = [], rx = /`([^`]+)`|\*\*([^*]+)\*\*/g, last = 0, m;
  while ((m = rx.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[1] != null ? h('code', { class: 'pmw-rec-ic', text: m[1] }) : h('b', { text: m[2] }));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function plain(text) { return String(text).replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1'); }

/* the tab's label, also before it is mounted (an agent's background open, a restored tab) */
function labelFor(id) {
  var r = parseId(id);
  if (r.kind === 'search') return r.a ? (r.a.length > 28 ? r.a.slice(0, 27) + '…' : r.a) : 'Search';
  if (r.kind === 'mcp') return r.a || 'MCP';
  if (r.kind === 'app') return 'Database inspector';
  if (r.kind === 'work-record') return WORK[r.a] ? WORK[r.a].title : 'Work note';
  return null;
}

/* ---- pieces ---- */
function quiet() {
  return h('p', { class: 'pmw-rec-quiet' }, [PMW.icon('eye', { size: 13, glyph: false }), h('span', { text: 'Recorded in this concept; nothing was fetched.' })]);
}
function codeBlock(text, label) {
  var pre = PMW.frames.code(text, { cls: 'pmw-rec-code' });
  pre.setAttribute('tabindex', '0');
  pre.setAttribute('data-pmh', 'off');
  if (label) pre.setAttribute('aria-label', label);
  return pre;
}
function table(spec, label) {
  var t = h('table', { class: 'pmw-rec-table' }, [h('caption', { class: 'pmw-rec-sr', text: label }),
    h('thead', {}, [h('tr', {}, spec.head.map(function (c) { return h('th', { scope: 'col', text: c }); }))]),
    h('tbody', {}, spec.rows.map(function (r) { return h('tr', {}, r.map(function (c, i) { return i ? h('td', { text: c }) : h('th', { scope: 'row', text: c }); })); }))]);
  return h('div', { class: 'pmw-rec-tablewrap', tabindex: '0', role: 'region', 'aria-label': label, 'data-pmh': 'off' }, [t]);
}

/* ---- the four bodies; each returns { word, facts, title, meta, body, text } ---- */
function searchRecord(r, api) {
  var rec = SEARCHES[r.a];
  var tag = r.b || (rec ? rec.total + ' results' : 'results');
  var out = { word: 'Web search', icon: 'search', facts: [{ id: 'rec-tag', text: tag }], title: r.a || 'Search',
    meta: rec ? [rec.thread, 'searched at ' + rec.at] : ['Web search'] };
  var req = JSON.stringify({ query: r.a, engine: rec ? rec.engine : 'web', max_results: rec ? rec.total : null }, null, 2);
  var body = [quiet(), PMW.frames.section('Request', null, codeBlock(req, 'Search request'))];
  var lines = ['Web search: ' + r.a, tag, ''];
  if (!rec) {
    body.push(PMW.frames.section('Recorded results', null, h('p', { text: 'The results of this search were not kept. The query and its count are the record.' })));
  } else {
    var list = h('div', { class: 'pmw-rec-results', role: 'list' });
    rec.results.forEach(function (res) {
      list.appendChild(resultRow(res, api));
      lines.push(res.title + ' — ' + (res.file || res.web + res.path), res.snippet, '');
    });
    var shown = rec.results.length;
    body.push(PMW.frames.section('Recorded results', shown < rec.total ? shown + ' of ' + rec.total + ' kept with a preview' : shown + ' results', list));
    body.push(h('p', { class: 'pmw-rec-hint', text: 'A project file opens in the editor: click to preview it, double click to keep it open. A web result opens in a Browser tab.' }));
  }
  out.body = body;
  out.text = lines.join('\n');
  return out;
}
function resultRow(res, api) {
  var isFile = !!res.file;
  var where = isFile ? res.file + (res.line ? ':' + res.line : '') : res.web + res.path;
  var kids = [
    h('span', { class: 'pmw-rec-rico', 'aria-hidden': 'true' }, [PMW.kindIcon(isFile ? 'file' : 'browser')]),
    h('span', { class: 'pmw-rec-rcopy' }, [
      h('span', { class: 'pmw-rec-rtitle', text: res.title }),
      h('span', { class: 'pmw-rec-rwhere', text: isFile ? where + ' · in this project' : res.web + res.path }),
      h('span', { class: 'pmw-rec-rsnip', text: res.snippet })
    ])
  ];
  var b;
  if (isFile) {
    /* the shared file reference carries the D7 opens (its own click timing, Enter keeps); the row draws its content */
    b = PMW.fileRef({ path: res.file, line: res.line || null }, { api: api, icon: false, cls: 'pmw-rec-result' });
    b.textContent = '';
    add(b, kids);
  } else {
    b = h('button', { type: 'button', class: 'pmw-rec-result', 'data-pm-hover-label': 'Open in a Browser tab', 'data-pm-hover-detail': 'https://' + res.web + res.path }, kids);
    b.addEventListener('click', function (e) {
      api.open({ id: 'link:' + enc(res.web) + '|' + enc(res.title), kind: 'browser', label: res.title, url: 'https://' + res.web + res.path, title: res.title,
        where: e.altKey ? 'panel' : undefined, background: e.ctrlKey || e.metaKey || undefined });
    });
  }
  b.setAttribute('role', 'listitem');
  b.setAttribute('data-pmh', 'row');
  b.setAttribute('data-k', 'res:' + where);
  return b;
}
function mcpRecord(r) {
  var tool = r.a || 'MCP', rec = MCP[tool];
  var said = r.b || 'Tool call record opened from a working-activity row.';
  var out = { word: 'MCP call', icon: 'ports', facts: [{ id: 'rec-tool', text: tool, mono: true }], title: 'MCP · ' + tool,
    meta: rec ? [rec.server, rec.thread, 'called at ' + rec.at, { text: rec.state, state: 'ok' }] : ['MCP call'] };
  var body = [h('p', { class: 'pmw-rec-lead', text: said }), quiet()];
  var lines = ['MCP call: ' + tool, said, ''];
  if (rec) {
    var req = JSON.stringify({ tool: tool, arguments: rec.request }, null, 2);
    body.push(PMW.frames.section('Request', null, codeBlock(req, 'Request')));
    var res = [h('p', { class: 'pmw-rec-sum', text: rec.summary })];
    if (rec.table) res.push(table(rec.table, 'The series the call returned'));
    res.push(codeBlock(rec.response, 'Response'));
    body.push(PMW.frames.section('Response', rec.state, res));
    lines.push('Request:', req, '', 'Response:', rec.response);
  } else {
    body.push(PMW.frames.section('Request', null, codeBlock(tool, 'Tool')));
    body.push(h('p', { text: 'The request and response of this call were not kept.' }));
  }
  out.body = body;
  out.text = lines.join('\n');
  return out;
}
function inspectorRecord() {
  var cols = { head: ['Column', 'Type', 'Null', 'Notes'], rows: [
    ['id', 'bigint', 'not null', 'primary key'],
    ['tenant_id', 'uuid', 'not null', 'every read filters on it'],
    ['created_at', 'timestamptz', 'not null', 'default now()'],
    ['kind', 'text', 'not null', ''],
    ['payload', 'jsonb', 'null', 'unbounded; 61% of the average row width']] };
  var idx = { head: ['Index', 'Columns', 'Size', 'Planner'], rows: [
    ['events_pkey', '(id)', '2.8 MB', 'used for single-row reads'],
    ['idx_events_created', '(created_at)', '2.9 MB', 'kept until the new index is proven'],
    ['idx_events_tenant_created', '(tenant_id, created_at DESC)', '4.1 MB', 'chosen for the analytics read path']] };
  var plan = 'index idx_events_tenant_created (tenant_id, created_at)\nplanner: index-only capable on the tenant-scoped analytics path\n\nIndex Scan using idx_events_tenant_created on events  (cost=0.42..812.40 rows=600)\n  Index Cond: ((tenant_id = $1) AND (created_at >= $2))';
  return {
    word: 'App control', icon: 'debug', facts: [{ id: 'rec-where', text: 'local' }], title: 'Database inspector',
    meta: ['Query performance', 'refreshed at 12:11 PM', 'events table on the benchmark copy', '128,400 rows'],
    body: [
      h('p', { class: 'pmw-rec-lead' }, ['Schema metadata refreshed. The planner selects ', h('b', { text: 'idx_events_tenant_created' }), '.']),
      quiet(),
      PMW.frames.section('events', '5 columns', table(cols, 'Columns of the events table')),
      PMW.frames.section('Indexes', '3 on events', table(idx, 'Indexes on the events table')),
      PMW.frames.section('Planner', 'for the tenant-scoped read', codeBlock(plan, 'Query plan'))
    ],
    text: 'Database inspector\nSchema metadata refreshed. The planner selects idx_events_tenant_created.\n\n' + plan
  };
}
function workRecord(r) {
  var rec = WORK[r.a];
  if (!rec) {
    return { word: 'Work note', icon: 'document', facts: [{ id: 'rec-link', text: 'No linked file or artifact', dim: true }], title: 'Work note', meta: ['Work note'],
      body: [h('p', { text: 'This note is not in the chat any more. It may belong to an earlier session.' })], text: 'Work note' };
  }
  var src = h('button', { type: 'button', class: 'pmw-rec-srcbtn', 'data-pmh': 'icon', 'data-k': 'source', 'data-pm-hover-label': 'Show in chat', 'data-pm-hover-detail': 'Where this note was written' },
    [PMW.icon('chat', { size: 13, glyph: false }), h('span', { text: rec.thread })]);
  src.addEventListener('click', function () { showInChat('work-record:' + r.a, rec.thread, rec.at); });
  return {
    word: 'Work note', icon: 'document', facts: [{ id: 'rec-link', text: 'No linked file or artifact', dim: true }], title: rec.title,
    meta: ['Work note', 'No linked file or artifact', 'written at ' + rec.at],
    body: [h('p', { class: 'pmw-rec-note' }, inline(rec.detail)), h('p', { class: 'pmw-rec-source' }, [h('span', { text: 'Source thread' }), src])],
    text: rec.title + '\n' + plain(rec.detail)
  };
}
function unknownRecord() {
  return { word: 'Record', icon: 'record', facts: [], title: 'This record is not here', meta: ['Record'],
    body: [h('p', { text: 'It may have been opened from an earlier session. Open it again from the chat’s work rows.' })], text: '' };
}
/* the work row this record came from, found and marked in its thread (the chat says when the demo lacks it) */
function showInChat(id, thread, at) {
  var res = PM_HOME.chat && PM_HOME.chat.reveal ? PM_HOME.chat.reveal({ thread: thread, messageId: id }) : null;
  if (!res || res.ok === false) PMW.toast('In the chat: ' + (thread || 'the thread') + (at ? ', the work row at ' + at : ''));
}

function mountRecord(host, state, api) {
  state = state || {};
  var r = parseId(api.id);
  var rec = r.kind === 'search' ? searchRecord(r, api) : r.kind === 'mcp' ? mcpRecord(r) : r.kind === 'app' ? inspectorRecord() : r.kind === 'work-record' ? workRecord(r) : unknownRecord();
  api.update({ label: labelFor(api.id), title: rec.word + ' · ' + rec.title });
  var src = r.kind === 'search' ? SEARCHES[r.a] : r.kind === 'mcp' ? MCP[r.a] : r.kind === 'work-record' ? WORK[r.a] : null;
  var thread = src ? src.thread : 'Query performance', at = src ? src.at : null;
  function actions() {
    var m = api.isMaximized();
    return [
      { id: 'copy', label: 'Copy', icon: 'document', detail: 'Copy the record as plain text', disabled: !rec.text, run: function () {
        try { navigator.clipboard.writeText(rec.text).then(function () { PMW.toast('Record copied'); }, function () { PMW.toast('Copying is not allowed here'); }); }
        catch (_) { PMW.toast('Copying is not allowed here'); }
      } },
      { id: 'chat', label: 'Show in chat', icon: 'chat', detail: 'The work row this record came from', run: function () { showInChat(api.id, thread, at); } },
      { id: 'max', label: m ? 'Restore' : 'Maximize', icon: m ? 'restore' : 'maximize', shortcut: 'Shift+Escape', run: function () { api.toggleMaximize(); row.setAction('max', { label: api.isMaximized() ? 'Restore' : 'Maximize', icon: api.isMaximized() ? 'restore' : 'maximize' }); } }
    ];
  }
  var root = h('div', { class: 'pmw-rec pmw-rec-' + r.kind });
  /* the last fact takes the free width and ends in an ellipsis; the buttons go to icons below 600 px */
  var facts = rec.facts.map(function (f, i) { return i === rec.facts.length - 1 ? Object.assign({ grow: true }, f) : f; });
  var row = api.headerRow({ label: rec.word + ' controls', left: [{ id: 'rec-kind', icon: rec.icon, text: rec.word, strong: true }].concat(facts), actions: actions(), labelsAt: 600 });
  var frame = PMW.frames.doc({ title: rec.title, meta: rec.meta, body: rec.body, cls: 'pmw-rec-doc' });
  frame._scroll.setAttribute('data-pmh', 'off');
  frame._scroll.setAttribute('tabindex', '-1');
  var stage = h('div', { class: 'pmw-rec-stage' }, [frame]);
  add(root, [row.el, stage]);
  host.appendChild(root);
  var restored = false;
  return {
    onResize: function () { if (!restored) { restored = true; if (state.scrollTop) frame._scroll.scrollTop = state.scrollTop; } },
    focus: function () { try { frame._scroll.focus({ preventScroll: true }); } catch (_) {} },
    serialize: function () { return { scrollTop: Math.round(frame._scroll.scrollTop) }; }
  };
}

PM_HOME.registerKind('record', {
  label: 'Record',
  group: 'Records',
  icon: 'record',
  prefixes: ['search:', 'mcp:', 'app:', 'work-record:'],
  document: true,
  min: { w: 280, h: 120 },
  idFor: function (spec) {
    if (spec.query) return recordId('search', spec.query, spec.tag || '');
    if (spec.tool) return recordId('mcp', spec.tool, spec.text || '');
    if (spec.app) return 'app:' + spec.app;
    if (spec.message) return 'work-record:' + spec.message;
    return null;
  },
  labelFor: labelFor,
  mount: mountRecord
});

var CATALOG_IDS = [
  ['search:postgres%20composite%20index%20write%20amplification|8%20results', 'Web search · 8 results'],
  ['search:index%20only%20scan%20visibility%20map|3%20results', 'Web search · 3 results'],
  ['search:autovacuum%20analyze%20threshold%20after%20create%20index|6%20results', 'Web search · 6 results'],
  ['mcp:grafana.query-range|Called%20grafana.query-range%20%E2%80%94%20p95%20series%2C%20last%2024h', 'MCP call · p95 series, last 24h'],
  ['mcp:linear.update-issue|Called%20linear.update-issue%20%E2%80%94%20PERF-218%20%E2%86%92%20%22index%20landed%22', 'MCP call · PERF-218 to “index landed”'],
  ['app:inspector', 'App control · local · the planner’s choice'],
  ['work-record:m-7', 'Work note · Query performance']
];
PM_HOME.catalog.add('record', CATALOG_IDS.map(function (x) {
  var label = labelFor(x[0]);
  return { id: x[0], label: label, sub: x[1], icon: 'record', keywords: 'record ' + parseId(x[0]).kind + ' ' + parseId(x[0]).a, spec: { id: x[0], kind: 'record', label: label } };
}));
