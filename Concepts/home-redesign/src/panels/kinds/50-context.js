/* The Context detail kind (D9; CONTRACT section 2; digest 05 sections 10 and 12): the chat's "Context More Details"
   drawer as a thread-keyed tab, context:<thread>, one per thread. The shared header row carries the Curated / Raw text
   toggle (12 px, not the chat's 9 px boxed control), the thread and how full its window is, Preview compact and the
   redacted JSON export. Curated: the hero line (the number, the sentence, a 6 px bar), three tiles, the Back Seat
   Driver block as a plain section, then eight disclosure rows separated by hairlines (their open state is kept). In a
   wide tab (960 px and up) Source composition and Context growth open side by side. Raw: the redacted projection with
   its lock notice. Unknown values print "not reported", never 0. No blur inside the tab; sizes key on the tab body. */

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
      else if (k === 'style' && typeof v === 'object') { for (var s in v) el.style.setProperty(s, v[s]); }
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
var NR = 'not reported';
function num(v) { return v == null ? NR : Number(v).toLocaleString('en-US'); }
function ktok(v) { return v == null ? NR : (v >= 1000 ? (Math.round(v / 100) / 10).toFixed(1) + 'K' : String(v)); }
function pct(v) { return v == null ? NR : Math.round(v) + '%'; }
function pct2(v) { return v == null ? NR : Number(v).toFixed(2) + '%'; }
function usd(v) { return v == null ? NR : '$' + Number(v).toFixed(3); }
function tone(p) { return p == null ? 'none' : p >= 90 ? 'bad' : p >= 70 ? 'warn' : 'ok'; }

/* ---- the threads (context.js and bsd.js demo records; the query thread is the full one) ---- */
var THREADS = {
  query: {
    title: 'Query performance',
    window: { used: 83900, limit: 131000, cached: 65700, inputThisTurn: 12800, outputThisTurn: 1500, cacheHitPct: 78.34,
      product: 'Puppet Master Pro', connection: 'anthropic-work', model: 'Claude Sonnet 4.6', account: 'Work',
      costApi: 0.084, costPlan: 0.031, updated: '12:13 PM' },
    sources: [
      { family: 'Conversation', tokens: 28526 },
      { family: 'Plans and specifications', tokens: 18458, superseded: 4210, note: 'Plan revisions 1-3 are superseded by revision 4 and still loaded.' },
      { family: 'Files and code', tokens: 15102, note: '9 source files, 2 migrations, 1 benchmark fixture.' },
      { family: 'Tool and browser evidence', tokens: 11746, superseded: 1180, note: 'Two browser traces were replaced by newer captures.' },
      { family: 'System and provider', tokens: 6068, note: 'Instructions, tool definitions and the capabilities that are On.' },
      { family: 'Attachments and images', tokens: 4000, note: 'One schema diagram, downsampled to 1024px.' }
    ],
    growth: [12400, 24800, 38200, 49600, 58400, 66900, 74100, 79200, 83900],
    route: {
      requested: { provider: 'Anthropic', product: 'Puppet Master Pro', model: 'Claude Sonnet 4.6', connection: 'anthropic-work', account: 'Work' },
      effective: { provider: 'Anthropic', product: 'Puppet Master Pro', model: 'Claude Sonnet 4.6', connection: 'anthropic-work', account: 'Work' },
      fallback: { used: false, reason: 'Requested and effective routes match.' },
      agent: { mode: 'Agent', persona: 'Product Manager', worktree: 'feature/query-index', effort: 'High', fast: false }
    },
    limits: [
      { label: 'Session', pct: 64, sub: 'Five-hour rolling window', reset: 'resets in about 1 h' },
      { label: 'Weekly', pct: 38, sub: 'Resets Monday 09:00 UTC', reset: '' },
      { label: 'Output tokens', pct: 22, sub: 'Per five-hour window', reset: '' }
    ],
    caps: [
      { name: 'Web search', state: 'On', what: 'Searches the web and keeps what it read as a record.' },
      { name: 'Browser', state: 'Ask', what: 'Opens pages in a browser tab; asks before it signs in or submits anything.' },
      { name: 'Grafana', state: 'On', what: 'Reads dashboards and series through MCP.' },
      { name: 'Linear', state: 'On', what: 'Reads and updates issues through MCP.' },
      { name: 'Database inspector', state: 'On', what: 'Reads schema metadata and query plans on the local database.' },
      { name: 'Image generation', state: 'Off', what: 'Not used in this thread.' }
    ],
    compaction: { state: 'idle', revision: 0, wouldRemove: 18420, wouldRetain: 65480,
      note: 'A source-aware compaction removes 18,420 tokens and leaves 65,480 loaded. Provenance handles survive so every dropped source can be rehydrated.',
      retains: ['All active requirements', 'Every provenance handle', 'The current plan revision'],
      drops: ['Plan revisions 1-3', 'Superseded browser traces', 'Duplicated file reads'], reversible: true, history: [] },
    bsd: { mode: 'Auto', model: 'Claude Sonnet 4.6', role: 'Critical Advisor', watch: 'Balanced', state: 'Watching', detail: 'nothing to check yet' },
    raw: { ref: 'raw-context:query:redacted', hash: '8c0b494b…d890', omitted: { secrets: 2, credentials: 1, accountIdentifiers: 1, localPaths: 1 }, permission: 'redacted_view_allowed', epoch: 4 }
  }
};
var THREAD_TITLE = { query: 'Query performance', subagents: 'Architecture review', debug: 'Browser debug session', plain: 'Plain chat',
  context: 'Context lens', 'plan-deep': 'Deep Plan', crew: 'Crew and shared work', route: 'Provider route change', visuals: 'Working with artifacts' };
function threadOf(threadId) {
  if (THREADS[threadId]) return THREADS[threadId];
  return { title: THREAD_TITLE[threadId] || 'This thread', unknown: true, window: {}, sources: [], growth: [], route: { requested: {}, effective: {}, fallback: { used: false, reason: NR }, agent: null },
    limits: [], caps: [], compaction: { state: 'idle', revision: 0, retains: [], drops: [], history: [] }, bsd: null, raw: {} };
}

var SECTIONS = [
  { id: 'tokens', title: 'Token details' },
  { id: 'sources', title: 'Source composition', pair: true },
  { id: 'growth', title: 'Context growth', pair: true },
  { id: 'route', title: 'Product, connection and route' },
  { id: 'limits', title: 'Plan limits' },
  { id: 'caps', title: 'Capabilities in this thread' },
  { id: 'cost', title: 'Cost and cache' },
  { id: 'compaction', title: 'Compaction preview and history' }
];

function rawPayload(T) {
  var w = T.window, r = T.route || {}, rq = r.requested || {}, ef = r.effective || {}, fb = r.fallback || {};
  return {
    schema_id: 'pm.chat.context.raw_projection.v1', redacted: true,
    raw_payload_ref: T.raw.ref || 'not_reported', redaction_status: 'redacted',
    provider_payload_hash: T.raw.hash || 'not_reported',
    omitted_evidence_counts: T.raw.omitted || {},
    permission_state: T.raw.permission || 'not_reported',
    context: { epoch: T.raw.epoch == null ? null : T.raw.epoch, revision: T.compaction.revision || 0, tokens_loaded: w.used == null ? null : w.used,
      token_limit: w.limit == null ? null : w.limit, source_families: T.sources.map(function (s) { return { family: s.family, tokens: s.tokens }; }),
      compaction_state: T.compaction.state },
    route: { requested: { provider: rq.provider || null, product: rq.product || null, model: rq.model || null },
      effective: { provider: ef.provider || null, product: ef.product || null, model: ef.model || null },
      fallback: { used: !!fb.used, reason: fb.reason || null, history: [] } },
    evidence: { compaction_history_count: (T.compaction.history || []).length, event_record_count: T.unknown ? 0 : 14 }
  };
}

function mountContext(host, state, api) {
  state = state || {};
  var threadId = String(api.id).replace(/^context:/, '') || 'query';
  var T = threadOf(threadId);
  var w = T.window;
  var view = state.view === 'raw' ? 'raw' : 'curated';
  var open = null;   // null until the user or the width decides
  var auto = !Array.isArray(state.open);   // the width picks the open sections until the reader toggles one
  if (!auto) { open = {}; state.open.forEach(function (k) { open[k] = 1; }); }
  var preview = false, gone = false, frame = null, chartBox = null, chartW = 0, wide = false, keepScroll = state.scrollTop || 0;
  var p = w.used != null && w.limit ? (w.used / w.limit) * 100 : null;

  function labels() {
    api.update({ label: 'Context · ' + T.title, title: 'Context detail · ' + T.title + (p != null ? ' · ' + pct(p) + ' used' : '') });
  }
  labels();

  var seg = PMW.frames.seg([{ value: 'curated', label: 'Curated' }, { value: 'raw', label: 'Raw' }], view, function (v) { view = v; paint(); }, { cls: 'pmw-ctx-hseg', label: 'Context view' });
  Array.prototype.forEach.call(seg.children, function (b) {
    b.setAttribute('data-pmh', 'icon');
    b.setAttribute('data-pm-hover-label', b._v === 'raw' ? 'Raw' : 'Curated');
    b.setAttribute('data-pm-hover-detail', b._v === 'raw' ? 'The redacted projection, as recorded' : 'Read for people: numbers, sources, limits');
  });
  function actions() {
    var m = api.isMaximized();
    return [
      { id: 'compact', label: 'Preview compact', icon: 'eye', detail: 'Shows what a compaction would keep and drop. Nothing changes.', disabled: !!T.unknown, run: showPreview },
      { id: 'export', label: 'Redacted JSON', icon: 'arrowDown', detail: 'Download the redacted projection', run: exportJson },
      { id: 'max', label: m ? 'Restore' : 'Maximize', icon: m ? 'restore' : 'maximize', shortcut: 'Shift+Escape', run: function () { api.toggleMaximize(); row.setAction('max', { label: api.isMaximized() ? 'Restore' : 'Maximize', icon: api.isMaximized() ? 'restore' : 'maximize' }); } }
    ];
  }
  var root = h('div', { class: 'pmw-ctx' });
  var row = api.headerRow({ label: 'Context controls', left: [
    { id: 'ctx-view', el: seg },
    { id: 'ctx-thread', text: T.title, strong: true },
    { id: 'ctx-used', text: p != null ? pct(p) + ' used' : 'Nothing measured yet', dim: p == null }
  ], actions: actions() });
  var stage = h('div', { class: 'pmw-ctx-stage' });
  add(root, [row.el, stage]);
  host.appendChild(root);

  /* ---- curated pieces ---- */
  function hero() {
    var fill = p == null ? 0 : Math.max(0, Math.min(100, p));
    return h('div', { class: 'pmw-ctx-hero' }, [
      h('p', { class: 'pmw-ctx-big' }, [h('strong', { text: p == null ? NR : pct(p) }),
        h('span', { text: p == null ? 'No turn has run here yet, so the window is unknown, not empty.' : 'current window used · ' + num(w.used) + ' / ' + num(w.limit) + ' tokens' })]),
      h('div', { class: 'pmw-ctx-bar is-' + tone(p), role: 'meter', 'aria-label': 'Context window used', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': p == null ? null : String(Math.round(p)) },
        [h('i', { style: { width: fill + '%' } })])
    ]);
  }
  function tiles(list, cls) { var t = PMW.frames.tiles(list); if (cls) t.classList.add(cls); return t; }
  function note(text, cls) { return h('p', { class: 'pmw-ctx-note' + (cls ? ' ' + cls : ''), text: text }); }
  function bsdBlock() {
    var b = T.bsd;
    if (!b) return null;
    var cfg = PMW.frames.button({ label: 'Configure', icon: 'rename', detail: 'Back Seat Driver settings live in the chat', run: function () { PMW.toast('Back Seat Driver is set up from the chat’s composer'); } });
    return h('section', { class: 'pmw-ctx-bsd' }, [
      h('header', { class: 'pmw-ctx-bsdhead' }, [h('h2', { text: 'Back Seat Driver' }), cfg]),
      PMW.frames.meta([b.mode, b.model + ' as ' + b.role, 'How watchful: ' + b.watch]),
      h('p', { class: 'pmw-ctx-bsdstate' }, [h('b', { text: b.state }), ' · ' + b.detail]),
      note('Preview only: no real AI calls. The advisor reads a copy of the work and changes nothing.'),
      note('Nothing to show yet. It starts watching when the assistant starts working. Recorded examples are in Demo Studio.')
    ]);
  }
  function sourcesBody() {
    if (!T.sources.length) return [note('No sources are reported for this thread.')];
    var limit = w.limit || 1, used = w.used || 0, superseded = 0;
    var bar = h('div', { class: 'pmw-ctx-comp', role: 'img', 'aria-label': 'Source composition: ' + T.sources.map(function (s) { return s.family + ' ' + num(s.tokens); }).join(', ') + '; ' + num(limit - used) + ' free' });
    T.sources.forEach(function (s, i) {
      superseded += s.superseded || 0;
      var share = (s.tokens / used) * 100;
      var seg2 = h('span', { class: 'pmw-ctx-cseg', style: { 'flex-grow': String(s.tokens), '--c': 'var(--pmw-ctx-c' + (i + 1) + ')' },
        'data-pm-hover-label': s.family, 'data-pm-hover-detail': num(s.tokens) + ' tokens · ' + Math.round(share) + '% of what is loaded' + (s.superseded ? ' · ' + num(s.superseded) + ' superseded' : '') });
      if (s.superseded) seg2.appendChild(h('i', { class: 'pmw-ctx-csup', style: { width: (s.superseded / s.tokens * 100) + '%' } }));
      bar.appendChild(seg2);
    });
    bar.appendChild(h('span', { class: 'pmw-ctx-cfree', style: { 'flex-grow': String(limit - used) }, 'data-pm-hover-label': 'Free', 'data-pm-hover-detail': num(limit - used) + ' tokens left in the window' }));
    var key = h('ul', { class: 'pmw-ctx-key' });
    T.sources.forEach(function (s, i) {
      key.appendChild(h('li', {}, [
        h('i', { class: 'pmw-ctx-sw', style: { '--c': 'var(--pmw-ctx-c' + (i + 1) + ')' }, 'aria-hidden': 'true' }),
        h('span', { class: 'pmw-ctx-kname', text: s.family }),
        h('span', { class: 'pmw-ctx-knum', text: num(s.tokens) }),
        s.note || s.superseded ? h('span', { class: 'pmw-ctx-knote', text: (s.superseded ? num(s.superseded) + ' superseded. ' : '') + (s.note || '') }) : null
      ]));
    });
    return [bar, h('p', { class: 'pmw-ctx-axis' }, [h('span', { text: '0' }), h('span', { text: num(limit) + ' limit' })]), key,
      note(T.sources.length + ' source families · ' + num(used) + ' tokens in context' + (superseded ? ' · ' + num(superseded) + ' of them superseded and still loaded' : '') + '.')];
  }
  function growthBody() {
    if (!T.growth.length) return [note('Nothing has been loaded yet, so there is no growth to show.')];
    chartBox = h('div', { class: 'pmw-ctx-chart' });
    drawChart();
    var table = h('table', { class: 'pmw-ctx-srtable' }, [h('caption', { text: 'Tokens loaded after each turn' }),
      h('tr', {}, [h('th', { text: 'Turn' }), h('th', { text: 'Tokens' })])].concat(T.growth.map(function (v, i) {
        return h('tr', {}, [h('td', { text: String(i + 1) }), h('td', { text: num(v) })]);
      })));
    return [h('p', { class: 'pmw-ctx-charttitle', text: 'Tokens loaded after each turn, against the ' + num(w.limit) + '-token limit' }), chartBox, table];
  }
  function drawChart() {
    if (!chartBox) return;
    var W = Math.max(240, Math.round(chartBox.clientWidth || chartW || 520)), H = 168;
    chartW = W;
    var padL = 44, padR = 16, padT = 14, padB = 26;
    var maxY = 140000, data = T.growth, n = data.length;
    var x = function (i) { return padL + (n === 1 ? 0 : i * (W - padL - padR) / (n - 1)); };
    var y = function (v) { return padT + (1 - v / maxY) * (H - padT - padB); };
    var svg = sv('svg', { class: 'pmw-ctx-svg', viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img',
      'aria-label': 'Context growth over ' + n + ' turns, from ' + num(data[0]) + ' to ' + num(data[n - 1]) + ' tokens, under a limit of ' + num(w.limit) });
    [0, 50000, 100000].forEach(function (v) {
      svg.appendChild(sv('line', { class: 'pmw-ctx-grid', x1: padL, x2: W - padR, y1: y(v), y2: y(v) }));
      svg.appendChild(sv('text', { class: 'pmw-ctx-tick', x: padL - 8, y: y(v) + 4, 'text-anchor': 'end' }, [v === 0 ? '0' : (v / 1000) + 'K']));
    });
    svg.appendChild(sv('line', { class: 'pmw-ctx-ceil', x1: padL, x2: W - padR, y1: y(w.limit), y2: y(w.limit) }));
    svg.appendChild(sv('text', { class: 'pmw-ctx-ceillabel', x: W - padR, y: y(w.limit) - 5, 'text-anchor': 'end' }, ['Limit ' + num(w.limit)]));
    [0, Math.floor((n - 1) / 2), n - 1].forEach(function (i) {
      svg.appendChild(sv('text', { class: 'pmw-ctx-tick', x: x(i), y: H - 8, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle' }, ['Turn ' + (i + 1)]));
    });
    var d = data.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    svg.appendChild(sv('path', { class: 'pmw-ctx-area', d: d + ' L' + x(n - 1).toFixed(1) + ' ' + y(0) + ' L' + x(0).toFixed(1) + ' ' + y(0) + ' Z' }));
    svg.appendChild(sv('path', { class: 'pmw-ctx-line', d: d }));
    svg.appendChild(sv('circle', { class: 'pmw-ctx-end', cx: x(n - 1), cy: y(data[n - 1]), r: 4 }));
    svg.appendChild(sv('text', { class: 'pmw-ctx-endlabel', x: x(n - 1) - 8, y: y(data[n - 1]) + 16, 'text-anchor': 'end' }, [num(data[n - 1]) + ' now']));
    var cross = sv('line', { class: 'pmw-ctx-cross', y1: padT, y2: H - padB, x1: 0, x2: 0, visibility: 'hidden' });
    var dot = sv('circle', { class: 'pmw-ctx-hdot', r: 4.5, visibility: 'hidden' });
    svg.appendChild(cross); svg.appendChild(dot);
    var tip = h('div', { class: 'pmw-ctx-tip', hidden: true });
    function at(clientX) {
      var r = svg.getBoundingClientRect(), px = (clientX - r.left) * (W / r.width);
      var i = Math.round((px - padL) / ((W - padL - padR) / Math.max(1, n - 1)));
      i = Math.max(0, Math.min(n - 1, i));
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(data[i])); dot.setAttribute('visibility', 'visible');
      tip.hidden = false;
      tip.textContent = '';
      add(tip, [h('b', { text: 'Turn ' + (i + 1) }), h('span', { text: num(data[i]) + ' tokens' }), h('span', { class: 'pmw-ctx-tipdim', text: pct(data[i] / w.limit * 100) + ' of the limit' })]);
      var left = x(i) * (r.width / W);
      tip.style.left = Math.max(4, Math.min(r.width - 140, left + 10)) + 'px';
      tip.style.top = Math.max(0, y(data[i]) * (r.height / H) - 52) + 'px';
    }
    svg.addEventListener('pointermove', function (e) { at(e.clientX); });
    svg.addEventListener('pointerleave', function () { cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; });
    chartBox.textContent = '';
    add(chartBox, [svg, tip]);
  }
  function routeBody() {
    var r = T.route, rq = r.requested || {}, ef = r.effective || {}, fb = r.fallback || {};
    function line(label, x) {
      return h('div', { class: 'pmw-ctx-line2' }, [h('b', { text: label + ' · ' + (x.provider || NR) }),
        h('span', { text: [x.product || NR, x.model || NR, x.connection || 'no connection', x.account || 'account not reported'].join(' · ') })]);
    }
    var out = [tiles([{ label: 'Product', value: w.product || NR }, { label: 'Connection used', value: w.connection || 'none yet' }, { label: 'Model', value: w.model || NR }, { label: 'Account', value: w.account || NR }], 'pmw-ctx-tiles4'),
      line('Requested route', rq), line('Effective route', ef),
      h('div', { class: 'pmw-ctx-line2' + (fb.used ? ' is-warn' : '') }, [h('b', { text: 'Fallback ' + (fb.used ? 'used' : 'not used') }), h('span', { text: fb.reason || NR })])];
    if (r.agent) out.push(h('div', { class: 'pmw-ctx-line2' }, [h('b', { text: r.agent.mode + ' · ' + r.agent.persona }),
      h('span', { text: 'Worker route: ' + r.agent.worktree + ' · local server · ' + r.agent.effort + ' effort · ' + (r.agent.fast ? 'Fast eligible route' : 'Standard route') })]));
    return out;
  }
  function limitsBody() {
    if (!T.limits.length) return [note('No plan limits are shown for this connection.')];
    return [h('div', { class: 'pmw-ctx-limits' }, T.limits.map(function (m) {
      return h('div', { class: 'pmw-ctx-limit is-' + tone(m.pct) }, [
        h('span', { class: 'pmw-ctx-lname' }, [h('b', { text: m.label }), h('span', { text: m.sub })]),
        h('span', { class: 'pmw-ctx-lbar', role: 'meter', 'aria-label': m.label, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(m.pct) }, [h('i', { style: { width: m.pct + '%' } })]),
        h('span', { class: 'pmw-ctx-lnum' }, [h('b', { text: m.pct + '%' }), m.reset ? h('span', { text: m.reset }) : null])
      ]);
    }))];
  }
  function capsBody() {
    if (!T.caps.length) return [note('No capabilities are reported for this thread.')];
    return [h('ul', { class: 'pmw-ctx-caps' }, T.caps.map(function (c) {
      return h('li', {}, [h('span', { class: 'pmw-ctx-capname' }, [h('b', { text: c.name }), h('span', { text: c.what })]),
        h('span', { class: 'pmw-ctx-capstate is-' + c.state.toLowerCase(), text: c.state })]);
    })), note('A capability that is On contributes its own instructions and tool definitions to the System and provider family above.')];
  }
  function costBody() {
    var combined = w.costApi == null || w.costPlan == null ? null : w.costApi + w.costPlan;
    return [tiles([{ label: 'API billed', value: usd(w.costApi) }, { label: 'Plan estimated', value: usd(w.costPlan) }, { label: 'Combined est.', value: usd(combined) }]),
      note(w.cached == null ? 'No turn ever ran on this thread, so there is no cache figure to report: unknown, not zero.' : ktok(w.cached) + ' cached tokens avoided repeat input billing at a ' + pct2(w.cacheHitPct) + ' hit rate.')];
  }
  function compactionBody() {
    var c = T.compaction;
    var out = [];
    if (preview) out.push(PMW.frames.notice('Preview: compacting now would remove ' + num(c.wouldRemove) + ' tokens and leave ' + num(c.wouldRetain) + ' loaded. Nothing was compacted.', { state: 'ok', icon: 'eye' }));
    out.push(tiles([{ label: 'State', value: c.state || 'idle' }, { label: 'Revision', value: String(c.revision || 0) }, { label: 'Would remove', value: ktok(c.wouldRemove) }, { label: 'Would retain', value: ktok(c.wouldRetain) }], 'pmw-ctx-tiles4'));
    if (c.wouldRemove == null) out.push(note('No compaction preview is reported for this thread.'));
    else {
      out.push(note(c.note));
      out.push(h('div', { class: 'pmw-ctx-keepdrop' }, [
        h('div', {}, [h('h3', { text: 'Retains' }), h('ul', {}, c.retains.map(function (x) { return h('li', { class: 'is-keep' }, [PMW.icon('check', { size: 12, glyph: false }), h('span', { text: x })]); }))]),
        h('div', {}, [h('h3', { text: 'Drops' }), h('ul', {}, c.drops.map(function (x) { return h('li', { class: 'is-drop' }, [minusMark(), h('span', { text: x })]); }))])
      ]));
      out.push(note(c.reversible === false ? 'Not reversible: this pass drops sources and their handles.' : 'Reversible: every dropped source keeps a rehydration handle.'));
    }
    out.push(note((c.history || []).length ? '' : 'No compaction command has been dispatched for this thread.', 'is-dim'));
    out.push(h('div', { class: 'pmw-ctx-acts' }, [
      PMW.frames.button({ label: 'Preview Compact', icon: 'eye', detail: 'Nothing changes until you confirm in the chat', disabled: !!T.unknown, run: showPreview }),
      PMW.frames.button({ label: 'Redacted JSON', icon: 'arrowDown', detail: 'Download the redacted projection', run: exportJson }),
      PMW.frames.button({ label: 'Raw projection', icon: 'code', detail: 'Switch to the Raw view', run: function () { setView('raw'); } })
    ]));
    return out;
  }
  function minusMark() { var s = sv('svg', { viewBox: '0 0 16 16', width: 12, height: 12, class: 'pmw-ico', 'aria-hidden': 'true' }); s.appendChild(sv('path', { d: 'M4 8h8' })); return s; }
  var BODIES = { tokens: function () { return [tiles([{ label: 'Cached tokens', value: ktok(w.cached) }, { label: 'Input this turn', value: ktok(w.inputThisTurn) }, { label: 'Output this turn', value: ktok(w.outputThisTurn) }])]; },
    sources: sourcesBody, growth: growthBody, route: routeBody, limits: limitsBody, caps: capsBody, cost: costBody, compaction: compactionBody };

  function isOpen(id) { return open ? !!open[id] : false; }
  function section(s) {
    var on = isOpen(s.id);
    var bodyId = 'pmw-ctx-b-' + threadId.replace(/[^\w-]/g, '_') + '-' + s.id;
    var btn = h('button', { type: 'button', class: 'pmw-ctx-dis', 'data-pmh': 'row', 'aria-expanded': on ? 'true' : 'false', 'aria-controls': bodyId, 'data-k': 'sec:' + s.id }, [
      h('span', { text: s.title }), h('span', { class: 'pmw-ctx-chev', 'aria-hidden': 'true' }, [PMW.icon('chevronRight', { size: 12, glyph: false })])]);
    btn.addEventListener('click', function () {
      if (!open) open = {};
      auto = false;
      if (open[s.id]) delete open[s.id]; else open[s.id] = 1;
      paint();
    });
    var sec = h('section', { class: 'pmw-ctx-sec' + (on ? ' is-open' : ''), 'data-sec': s.id }, [h('h2', { class: 'pmw-ctx-sech' }, [btn])]);
    if (on) { var b = h('div', { class: 'pmw-ctx-secbody', id: bodyId }); add(b, BODIES[s.id]()); sec.appendChild(b); }
    return sec;
  }
  function curated() {
    var col = h('article', { class: 'pmw-doc pmw-ctx-col' });
    add(col, [hero(), tiles([{ label: 'Tokens loaded', value: ktok(w.used) }, { label: 'Available', value: w.used == null ? NR : ktok(w.limit - w.used) }, { label: 'Cache hit', value: pct2(w.cacheHitPct) }], 'pmw-ctx-tiles3'), bsdBlock()]);
    if (T.unknown) col.appendChild(PMW.frames.notice('Nothing has run on this thread yet. Every figure below is unknown, not zero.', { icon: 'eye' }));
    var list = h('div', { class: 'pmw-ctx-secs' });
    var pair = null;
    SECTIONS.forEach(function (s) {
      if (s.pair) {
        if (!pair) { pair = h('div', { class: 'pmw-ctx-pair' + (wide && isOpen('sources') && isOpen('growth') ? ' is-side' : '') }); list.appendChild(pair); }
        pair.appendChild(section(s));
      } else list.appendChild(section(s));
    });
    col.appendChild(list);
    col.appendChild(note('Updated after the turn that finished at ' + (w.updated || 'an unknown time') + '. It changes when the next turn finishes.', 'is-dim'));
    return col;
  }
  function raw() {
    var text = JSON.stringify(rawPayload(T), null, 2);
    var col = h('article', { class: 'pmw-doc pmw-ctx-col pmw-ctx-raw' });
    var pre = PMW.frames.code(text, { cls: 'pmw-ctx-pre' });
    pre.setAttribute('tabindex', '0');
    pre.setAttribute('aria-label', 'Redacted Raw projection');
    pre.setAttribute('data-pmh', 'off');
    add(col, [
      h('div', { class: 'pmw-ctx-lock' }, [h('span', { class: 'pmw-ctx-lockg', 'aria-hidden': 'true' }, [PMW.icon('lock', { size: 14, glyph: false })]),
        h('div', {}, [h('b', { text: 'Redacted Raw projection' }), h('p', { text: 'Credentials, secrets, account identifiers, and local paths are omitted. Hashes and references preserve audit correlation.' })])]),
      pre,
      h('div', { class: 'pmw-ctx-acts' }, [
        PMW.frames.button({ label: 'Copy', icon: 'document', run: function () { copy(text, 'Redacted projection copied'); } }),
        PMW.frames.button({ label: 'Redacted JSON', icon: 'arrowDown', detail: 'Download it as a file', run: exportJson }),
        PMW.frames.button({ label: 'Back to Curated', icon: 'back', run: function () { setView('curated'); } })
      ])
    ]);
    return col;
  }
  function paint() {
    if (gone) return;
    var active = document.activeElement, key = active && host.contains(active) ? active.getAttribute('data-k') : null;
    var keep = frame ? (frame.getAttribute('data-view') === view ? frame._scroll.scrollTop : 0) : keepScroll;
    var scroll = h('div', { class: 'pmw-frame-scroll', 'data-pmh': 'off', tabindex: '-1' });
    chartBox = null;
    scroll.appendChild(view === 'raw' ? raw() : curated());
    var next = h('div', { class: 'pmw-frame pmw-ctx-frame', 'data-view': view }, [scroll]);
    next._scroll = scroll;
    if (frame) frame.replaceWith(next); else stage.appendChild(next);
    frame = next;
    scroll.scrollTop = keep;
    if (chartBox) requestAnimationFrame(drawChart);
    seg.setValue(view);
    if (key) { var el = host.querySelector('[data-k="' + key + '"]'); if (el) { try { el.focus({ preventScroll: true }); } catch (_) {} } }
  }
  function setView(v) { view = v; paint(); api.announce(v === 'raw' ? 'Raw view' : 'Curated view'); }
  function showPreview() {
    if (T.unknown) return;
    view = 'curated'; preview = true;
    if (!open) open = {};
    open.compaction = 1;
    auto = false;
    paint();
    var sec = frame && frame.querySelector('[data-sec="compaction"]');
    if (sec) { try { sec.scrollIntoView({ block: 'start', behavior: PMW.reduced() ? 'auto' : 'smooth' }); } catch (_) {} }
    api.announce('Compaction preview shown. Nothing was compacted.');
  }
  function exportJson() {
    var blob = new Blob([JSON.stringify(rawPayload(T), null, 2)], { type: 'application/json' });
    var a = h('a', { href: URL.createObjectURL(blob), download: T.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-context-redacted.json' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    PMW.toast('Redacted context saved as a JSON file');
  }
  function copy(text, done) {
    try { navigator.clipboard.writeText(text).then(function () { PMW.toast(done); }, function () { PMW.toast('Copying is not allowed here'); }); }
    catch (_) { PMW.toast('Copying is not allowed here'); }
  }
  paint();

  return {
    onResize: function (s) {
      var nowWide = s.w >= 960;
      if (auto && !T.unknown && (open == null || nowWide !== wide)) { open = open || {}; if (nowWide) { open.sources = 1; open.growth = 1; } else { delete open.sources; delete open.growth; } wide = nowWide; paint(); return; }
      if (nowWide !== wide) { wide = nowWide; paint(); return; }
      if (s.final && chartBox && Math.abs((chartBox.clientWidth || 0) - chartW) > 8) drawChart();
    },
    rerender: function () { T = threadOf(threadId); w = T.window; labels(); paint(); },
    focus: function () { if (frame) { try { frame._scroll.focus({ preventScroll: true }); } catch (_) {} } },
    serialize: function () { return { threadId: threadId, view: view, open: open && !auto ? Object.keys(open) : null, scrollTop: frame ? Math.round(frame._scroll.scrollTop) : 0 }; },
    unmount: function () { gone = true; }
  };
}

PM_HOME.registerKind('context', {
  label: 'Context detail',
  group: 'Agents',
  icon: 'context',
  prefixes: ['context:'],
  document: true,
  min: { w: 280, h: 160 },
  idFor: function (spec) { return 'context:' + (spec.thread || spec.threadId || 'query'); },
  mount: mountContext
});

PM_HOME.catalog.add('context', [
  { id: 'context:query', label: 'Context · Query performance', sub: '64% of the window used · 83,900 of 131,000 tokens', icon: 'context',
    keywords: 'context window tokens compaction more details', spec: { id: 'context:query', kind: 'context', label: 'Context · Query performance' } }
]);

PM_HOME.on('open', function (e) {
  if (!e || e.kind !== 'context' || !e.created) return;
  var t = (PM_HOME.tabs() || []).filter(function (x) { return x.tabId === e.tabId; })[0];
  var thread = String(e.tabId).replace(/^context:/, '');
  if (t && (t.label === 'Context detail' || !t.label)) PM_HOME.update(e.tabId, { label: 'Context · ' + threadOf(thread).title });
});
