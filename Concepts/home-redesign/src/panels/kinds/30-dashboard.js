/* The Dashboard tab kind (D10 step two, decision A1; D10-DESIGN-per-instance-boards.md section 4; D10 round two).

   Dashboards run on the Usage board engine: each dashboard tab holds one board of its own, made with
   PMU.boards.create (Concepts/usage-redesign/src/js/40-board.js) inside the tab's stage. Board ids, tab ids and store
   keys, where <project> is the project the panels' layout is bound to (PMW.persist.boundId; round two P5):
     home        dashboard:home (the pinned Home tab)   widget_layout:v1:<project>:home
     metrics     dashboard:metrics                      widget_layout:v1:<project>:metrics
     monitoring  dashboard:monitoring                   widget_layout:v1:<project>:monitoring
     dash-<n>    dashboard:dash-<n> (its name)          widget_layout:v1:<project>:dash-<n>
   A board's unscoped key from before (widget_layout:v1:<board>) is adopted once, by the first project that shows that
   board (the engine does it). No other id gets an engine board (the engine accepts more, so this kind restricts). The
   tab serializes { board } only: the layout, the view and the widget settings live in the board's own key, written by
   the engine. A project switch re-keys every mounted board, hidden ones too (board.setProject).

   Custom dashboards (D35, PLN-4): New dashboard makes one, and it starts empty (P13); Rename dashboard... names it;
   Delete dashboard... deletes it. The name belongs to the board: it is kept per project in pm.home.dashboards:v1:<project>
   beside the board's key, follows a rename of its tab both ways, and shows on the tab, in the Board menu's dashboards,
   in the "+" menu's Dashboard sub-row and in the catalog. A project lists only its own custom dashboards. Home, Metrics,
   Monitoring and Agents can be reset but never deleted.

   The Board menu: the dashboards; this dashboard's range, scope, Start from (its default set, the dashboard starter,
   the 13 Usage rooms and the user's saved presets; P4), Save as preset..., Tidy and Reset widgets; Live readings and
   Play the next hour (P12); Rename and Delete on a custom dashboard. Start from replaces the widgets, so it offers Undo
   for a few seconds. The header facts carry the Live mark (one pulse per beat the board patches) and the demo time
   while the demo hour runs. An empty board shows the kind's own invitation: Add widget and Start from.

   One board is not on the engine: agents (dashboard:agents) is drawn here: one card per agent at work, opening
   its transcript.

   D10 round two (P1): the page's own Home widgets (#dashboardView) are no longer used by any tab. The node stays
   parked and hidden in #panel-dashboard; this kind never moves it.

   Without the Usage engine (PMU.boards missing: the Usage boot failed) a grid dashboard shows a quiet note instead. */

var doc = document;

function h(tag, attrs, kids) {
  var el = doc.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    });
  }
  (Array.isArray(kids) ? kids : kids != null ? [kids] : []).forEach(function (c) {
    if (c == null || c === false) return;
    el.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c);
  });
  return el;
}
function byId(id) { return doc.getElementById(id); }
function setText(el, text) { text = String(text == null ? '' : text); if (el.textContent !== text) el.textContent = text; }
function logError(what, err) { try { console.error('[pm-home] ' + what, err); } catch (_) {} }

/* ---- boards, ids and labels ---- */
var FIXED = {
  home: { label: 'Home', sub: 'Usage widgets at a glance' },
  metrics: { label: 'Metrics', sub: 'Quota, budget and token trends' },
  monitoring: { label: 'Monitoring', sub: 'Tool health, alerts and probes' },
  agents: { label: 'Agents', sub: 'Every agent at work right now' }
};
var FIXED_IDS = ['home', 'metrics', 'monitoring', 'agents'];
var ENGINE_ID = /^(home|metrics|monitoring|dash-[1-9][0-9]{0,3})$/;
var DASH_TAB = /^dashboard:dash-([1-9][0-9]{0,3})$/;
var KEY_PREFIX = 'widget_layout:v1:';
var NAMES_PREFIX = 'pm.home.dashboards:v1:';
var NEW_SUB = 'An empty board for widgets you pick';

function isEngineId(b) { return typeof b === 'string' && ENGINE_ID.test(b); }
function isBoard(b) { return isEngineId(b) || b === 'agents'; }
function dashNumber(b) { var m = /^dash-([1-9][0-9]{0,3})$/.exec(b || ''); return m ? +m[1] : 0; }
/* the board a tab shows: its id names it for life (dashboard:<board>), else its state */
function boardOf(id, st) {
  var b = typeof id === 'string' && id.indexOf('dashboard:') === 0 ? id.slice('dashboard:'.length) : '';
  if (!b && st && typeof st.board === 'string') b = st.board;
  return b || 'home';
}
function engineReady() { return !!(window.PMU && PMU.boards && typeof PMU.boards.create === 'function'); }

/* the project a board's contents belong to (P5): the one the panels' layout is bound to (16-persist.js), so a board is
   always written beside the layout it sits in. The engine takes up to 64 characters without spaces or colons. */
function boardProject() {
  var p = '';
  try { p = String((PMW.persist && PMW.persist.boundId) || PMW.projectId() || ''); } catch (_) { p = ''; }
  p = p.replace(/[\s:]+/g, '-').slice(0, 64);
  return p || 'tastebook';
}
function keyFor(board, project) { return KEY_PREFIX + (project || boardProject()) + ':' + board; }
/* the n of the dash-<n> a store key names: this project's key, or the old unscoped one (until a project adopts it) */
function dashOfKey(k, project) {
  if (typeof k !== 'string' || k.indexOf(KEY_PREFIX) !== 0) return 0;
  var rest = k.slice(KEY_PREFIX.length);
  if (rest.indexOf(project + ':') === 0) rest = rest.slice(project.length + 1);
  return dashNumber(rest);
}
/* the engine boards this project has a store for (from their keys) */
function storedIds(project) {
  var out = [], pre = KEY_PREFIX + (project || boardProject()) + ':';
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(pre) === 0 && isEngineId(k.slice(pre.length))) out.push(k.slice(pre.length));
    }
  } catch (_) {}
  return out;
}

/* ---- custom dashboard names (D35): one record per project, { schema_id, names: { 'dash-<n>': name } }. A name equal
   to the board's default ("Dashboard n") is not stored. ---- */
function namesOf(project) {
  var s = PMW.store.get(NAMES_PREFIX + (project || boardProject()));
  return s && typeof s === 'object' && s.names && typeof s.names === 'object' ? s.names : {};
}
/* at most 80 characters, cut by code point (a cut by UTF-16 unit could leave half an emoji) */
function cleanName(v) { return Array.from(String(v == null ? '' : v).replace(/\s+/g, ' ').trim()).slice(0, 80).join(''); }
function defaultLabel(b) { return FIXED[b] ? FIXED[b].label : dashNumber(b) ? 'Dashboard ' + dashNumber(b) : 'Dashboard'; }
function setName(board, name, project) {
  if (!dashNumber(board)) return false;
  var p = project || boardProject(), names = Object.assign({}, namesOf(p));
  name = cleanName(name);
  if (!name || name === defaultLabel(board)) delete names[board]; else names[board] = name;
  if (!Object.keys(names).length) { PMW.store.remove(NAMES_PREFIX + p); return true; }
  return PMW.store.set(NAMES_PREFIX + p, { schema_id: 'pm.home.dashboards.v1', names: names });
}
/* a board's name: the fixed label, a custom dashboard's own name, else "Dashboard n" */
function labelOf(b) {
  if (dashNumber(b)) { var n = namesOf()[b]; if (typeof n === 'string' && n) return n; }
  return defaultLabel(b);
}
/* the name a person sees on a tab: their rename of the tab (a custom dashboard's name follows it), else the board's */
function nameOf(rec) {
  var l = PMW.state && PMW.state.layout, t = l && l.tabs[rec.id];
  return (t && t.userLabel) || labelOf(rec.board);
}
/* this project's custom dashboards, by number: the open tabs, the stored boards (a closed one keeps its key while it can
   be reopened, P6) and the named ones */
function customBoards() {
  var seen = {}, p = boardProject();
  function add(b) { if (dashNumber(b)) seen[b] = true; }
  try { PM_HOME.tabs().forEach(function (t) { if (DASH_TAB.test(t.tabId)) add(boardOf(t.tabId)); }); } catch (_) {}
  storedIds(p).forEach(add);
  Object.keys(namesOf(p)).forEach(add);
  return Object.keys(seen).sort(function (a, c) { return dashNumber(a) - dashNumber(c); });
}

/* a new dashboard's id: one more than the largest n over the open tabs, the reopen stack, this project's stored boards
   and the old unscoped ones not adopted yet, the names and the live boards (like the browser kind's nextBrowserId),
   so a closed dashboard's widgets, or an unscoped board another project may still adopt, are never handed to a new one */
function mintId() {
  var max = 0, p = boardProject();
  function see(n) { if (n > max) max = n; }
  try { PM_HOME.tabs().forEach(function (t) { var m = DASH_TAB.exec(t.tabId); if (m) see(+m[1]); }); } catch (_) {}
  try { var l = PMW.state && PMW.state.layout; ((l && l.closed) || []).forEach(function (c) { var m = DASH_TAB.exec((c && c.tab && c.tab.id) || ''); if (m) see(+m[1]); }); } catch (_) {}
  try { for (var i = 0; i < localStorage.length; i++) see(dashOfKey(localStorage.key(i), p)); } catch (_) {}
  try { Object.keys(namesOf(p)).forEach(function (b) { see(dashNumber(b)); }); } catch (_) {}
  try { if (engineReady()) PMU.boards.all().forEach(function (b) { see(dashNumber(b.id)); }); } catch (_) {}
  return max >= 9999 ? 'dashboard:home' : 'dashboard:dash-' + (max + 1);
}

/* the Home board opens as the pinned Home tab from every path (the "+" menu, the Board menu, a page's subtab), so a Home
   tab opened anywhere is the same compact tab the layouts make (14-layouts.js 'dashboard:home'; Jared, 2026-10-15: "you
   can add another home but its not small like the first one is") */
function homePinned(b) { return b === 'home'; }

/* ---- tabs of this kind ---- */
var recs = {};          // tabId -> rec
var curProject = null;  // the project the mounted boards are keyed to
function recList() { return Object.keys(recs).map(function (id) { return recs[id]; }); }
function engineRecs() { return recList().filter(function (r) { return !r.gone && r.b; }); }
function visible(rec) { return !!rec && !rec.gone && rec.api.isVisible(); }
function repaintAll() { recList().forEach(function (r) { if (!r.gone && r.paintLeft) r.paintLeft(); }); }
function boardBtn(rec) { return rec.row ? rec.row.action('board') : null; }

/* D10 round two (P1): the adopted node is gone. The page's own Home widgets (#dashboardView) stay parked and
   hidden in #panel-dashboard; no tab moves them, seats their button, follows their boards, counts, resets, refits or
   rewords them. What served only that adoption was removed with it. */

/* ==================================================================================================================
   Agents (drawn here, outside the engine)
   ================================================================================================================== */
var AGENTS = [
  { id: 'agent-query', name: 'Query Analyzer', model: 'Claude Sonnet 4.6', state: 'working', secs: 126, progress: 68,
    now: 'Benchmarking tenant-scoped query alternatives', facts: '14 tools · 9 files · 42 tests' },
  { id: 'agent-schema', name: 'Schema Reviewer', model: 'Qwen 3.8', state: 'blocked', secs: 101,
    now: 'Changing the production schema needs your explicit go-ahead.', facts: 'Waiting on you' },
  { id: 'agent-rollback', name: 'Rollback Rehearser', model: 'GLM 5.2', state: 'retrying', secs: 72,
    now: 'Attempt 2 of 3: the connection closed during step 7.', facts: '6 tools' },
  { id: 'agent-fallback', name: 'Fallback Router', model: 'Qwen 3.8', state: 'fallback', secs: 214,
    now: 'Moved to the Alibaba Coding Plan after the five-hour cap.', facts: '9 tools' },
  { id: 'agent-bench', name: 'Benchmark Runner', model: 'Kimi K3', state: 'queued', secs: 0,
    now: 'Queued behind the fixture rebuild', facts: 'Starts next' },
  { id: 'agent-orphan', name: 'Orphan Gate', model: 'GLM 5.2', state: 'failed', secs: 22,
    now: 'Found 3 orphaned rows and stopped before changing anything.', facts: '2 tools' },
  { id: 'agent-migration', name: 'Migration Auditor', model: 'Claude Opus 5', state: 'complete', secs: 262,
    now: 'Finished with one required change', facts: '11 tools · 4 files' }
];
var STATE = {
  working: { word: 'Working', icon: 'play', tone: 'accent', group: 'working', live: true },
  retrying: { word: 'Retrying', icon: 'reload', tone: 'warn', group: 'working', live: true },
  fallback: { word: 'Fallback route', icon: 'forward', tone: 'warn', group: 'working', live: true },
  blocked: { word: 'Stalled', icon: 'problems', tone: 'warn', group: 'needs' },
  failed: { word: 'Failed', icon: 'cross', tone: 'bad', group: 'needs' },
  waiting: { word: 'Waiting', icon: 'pause', tone: 'dim', group: 'waiting' },
  queued: { word: 'Queued', icon: 'clock', tone: 'dim', group: 'waiting' },
  complete: { word: 'Complete', icon: 'check', tone: 'ok', group: 'done' }
};
var FILTERS = [
  { id: 'all', label: 'All agents' },
  { id: 'working', label: 'Working' },
  { id: 'needs', label: 'Needs you' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'done', label: 'Finished' }
];
var agentClock = { secs: {}, progress: {} };   // shared, so every agents tab tells the same time
AGENTS.forEach(function (a) { agentClock.secs[a.id] = a.secs; agentClock.progress[a.id] = a.progress || null; });
var clockTimer = 0, clockUsers = 0;
function clockStart() {
  clockUsers += 1;
  if (clockTimer) return;
  clockTimer = setInterval(function () {
    AGENTS.forEach(function (a) {
      if (!STATE[a.state].live) return;
      agentClock.secs[a.id] += 1;
      if (agentClock.progress[a.id] != null && agentClock.secs[a.id] % 9 === 0) agentClock.progress[a.id] = Math.min(96, agentClock.progress[a.id] + 1);
    });
    recList().forEach(function (r) { if (r.tickAgents && r.shown) r.tickAgents(); });
  }, 1000);
}
function clockStop() {
  clockUsers = Math.max(0, clockUsers - 1);
  if (!clockUsers && clockTimer) { clearInterval(clockTimer); clockTimer = 0; }
}
function elapsed(s) {
  if (!s) return 'Not started';
  var m = Math.floor(s / 60), r = s % 60;
  return (m ? m + 'm ' : '') + (r < 10 && m ? '0' : '') + r + 's';
}
function agentSummary() {
  var g = { working: 0, needs: 0 };
  AGENTS.forEach(function (a) { var k = STATE[a.state].group; if (g[k] != null) g[k] += 1; });
  var parts = [AGENTS.length + ' agents', g.working + ' working'];
  if (g.needs) parts.push(g.needs + ' need you');
  return parts.join(' · ');
}

function openTranscript(rec, a, alt) {
  var tid = 'thread-' + a.id;
  var it = PM_HOME.catalog.find(tid);
  var spec = Object.assign({}, it && it.spec ? it.spec : { id: tid, kind: 'transcript', agentId: a.id }, { label: a.name, mode: 'keep' });
  if (alt) spec.where = 'panel';
  rec.api.open(spec);
}

function mountAgents(rec) {
  var list = h('div', { class: 'pmw-dash-agent-list', role: 'list', 'aria-label': 'Agents at work' });
  var empty = h('p', { class: 'pmw-dash-agent-empty', hidden: true, text: 'No agents match this filter.' });
  var scroll = h('div', { class: 'pmw-dash-agents' }, [list, empty]);
  rec.stage.appendChild(scroll);
  var cells = {};
  AGENTS.forEach(function (a) {
    var st = STATE[a.state];
    var time = h('span', { class: 'pmw-dash-agent-time' });
    var bar = a.progress != null ? h('i', { class: 'pmw-dash-agent-fill' }) : null;
    var barWrap = bar ? h('span', { class: 'pmw-dash-agent-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': a.name + ' progress' }, [bar]) : null;
    var open = h('button', { type: 'button', class: 'pmw-act pmw-dash-agent-open', 'data-pmh': 'icon',
      'data-pm-hover-label': 'Open transcript', 'data-pm-hover-detail': 'Alt+click opens it in a new panel' }, [PMW.icon('transcript', { size: 14 }), h('span', { text: 'Open transcript' })]);
    open.addEventListener('click', function (e) { openTranscript(rec, a, e.altKey); });
    var card = h('article', { class: 'pmw-dash-agent', role: 'listitem', 'data-pmh': 'card', 'data-state': a.state, 'data-tone': st.tone, 'aria-label': a.name + ', ' + st.word }, [
      h('header', { class: 'pmw-dash-agent-head' }, [
        h('span', { class: 'pmw-dash-st' }, [PMW.icon(st.icon, { size: 13, cls: 'pmw-dash-st-ico' }), h('span', { text: st.word })]),
        time
      ]),
      h('h3', { class: 'pmw-dash-agent-name', text: a.name }),
      h('p', { class: 'pmw-dash-agent-now', text: a.now }),
      barWrap,
      h('p', { class: 'pmw-dash-agent-meta', text: a.model + ' · ' + a.facts }),
      h('div', { class: 'pmw-dash-agent-acts' }, [open])
    ]);
    list.appendChild(card);
    cells[a.id] = { card: card, time: time, bar: bar, barWrap: barWrap, group: st.group };
  });
  rec.tickAgents = function () {
    AGENTS.forEach(function (a) {
      var c = cells[a.id];
      var t = elapsed(agentClock.secs[a.id]);
      if (c.time.textContent !== t) c.time.textContent = t;
      if (c.bar) {
        var p = agentClock.progress[a.id];
        c.bar.style.width = p + '%';
        c.barWrap.setAttribute('aria-valuenow', String(p));
      }
    });
  };
  rec.filterAgents = function () {
    var f = rec.filter || 'all', shown = 0;
    AGENTS.forEach(function (a) {
      var on = f === 'all' || cells[a.id].group === f;
      cells[a.id].card.hidden = !on;
      if (on) shown += 1;
    });
    empty.hidden = !!shown;
  };
  rec.tickAgents();
  rec.filterAgents();
}
function setFilter(rec, f) {
  rec.filter = f;
  if (rec.filterAgents) rec.filterAgents();
  rec.paintLeft();
  if (rec.api.saveSoon) rec.api.saveSoon();
  var lab = FILTERS.filter(function (x) { return x.id === f; })[0];
  rec.api.announce('Showing ' + (lab ? lab.label.toLowerCase() : 'all agents') + '.');
}

/* ==================================================================================================================
   Engine dashboards (home, metrics, monitoring, dash-<n>)
   ================================================================================================================== */
var RANGES = [['5h', 'Last 5 hours'], ['24h', 'Last 24 hours'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days']];
function rangeLabel(v) { var r = RANGES.filter(function (x) { return x[0] === v; })[0]; return r ? r[1] : 'Last 24 hours'; }
/* the scopes the Usage page offers (its scope menu, 46-shell.js): every account, work, personal, then one per provider */
function scopeChoices() {
  var out = [['all', 'All current usage'], ['work', 'Work accounts'], ['personal', 'Personal accounts']];
  var U = window.PM7_USAGE, provs = (U && U.data && U.data.providers) || [];
  provs.forEach(function (p) {
    var n = p.name;
    try { if (PMU.shell && PMU.shell.providerName) n = PMU.shell.providerName(p.id) || n; } catch (_) {}
    out.push(['provider:' + p.id, n + ' only']);
  });
  return out;
}
function scopeLabel(v) {
  var r = scopeChoices().filter(function (x) { return x[0] === v; })[0];
  if (r) return r[1];
  try { if (PMU.shell && PMU.shell.scopeLabel) return PMU.shell.scopeLabel(v); } catch (_) {}
  return 'All current usage';
}
/* what a widget is, in plain words (the Usage widget kinds), for the Add widget picker's second line */
var KIND_WORDS = {
  agenda: 'Agenda', alert: 'Alert', attempts: 'Attempts', breakdown: 'Breakdown', budget: 'Budget', cache: 'Cache',
  columns: 'Columns', context: 'Context window', donut: 'Ring chart', efficiency: 'Efficiency', flow: 'Flow',
  free: 'Free models', gauge: 'Gauge', heat: 'Heat map', kpi: 'Number', kpis: 'Numbers', limit: 'Limit windows',
  list: 'List', mix: 'Mix', models: 'Models', provider: 'Provider', providers: 'Providers', qhist: 'Quota history',
  ranked: 'Ranked list', setup: 'Setup', skyline: 'Skyline', switch: 'Switch', table: 'Table', trend: 'Trend chart',
  windows: 'Windows'
};
function widgetCount(n) { return n ? n + (n === 1 ? ' widget' : ' widgets') : 'Empty'; }

/* Details on a dashboard card, and a card's "open in Usage" rows (P8): the Usage page, at the widget's home room, with
   the details open there. The details a card asked for (its spec: the widget's, or a row's such as one attempt) open
   in the Usage inspector once the room's card is built (about 40 frames at most); without a spec, the widget's own
   (PM7_USAGE.openInspector). */
function openInUsage(widgetId, room, spec) {
  try { if (window.PM_PAGES && PM_PAGES.go) PM_PAGES.go('usage'); } catch (_) {}
  var U = window.PM7_USAGE;
  if (!U) return;
  try { if (room && U.selectRoom) U.selectRoom(room, 'api'); } catch (_) {}
  var direct = spec && typeof spec === 'object' && window.PMU && PMU.inspector && typeof PMU.inspector.open === 'function';
  if (!direct && (!widgetId || typeof U.openInspector !== 'function')) return;
  var tries = 0;
  (function wait() {
    var card = null;
    try { card = widgetId && PMU.board && PMU.board.card ? PMU.board.card(widgetId) : null; } catch (_) {}
    if (!card && widgetId && ++tries <= 40) { requestAnimationFrame(wait); return; }
    try { if (direct) PMU.inspector.open(spec, card || null); else U.openInspector(widgetId); } catch (_) {}
  })();
}
function widgetOf(spec, opener) {
  var id = spec && typeof spec === 'object' ? spec.widget_id || spec.widget || null : null;
  if (!id && opener && opener.closest) { var c = opener.closest('[data-widget]'); if (c) id = c.getAttribute('data-widget'); }
  return id || null;
}
function homeRoomOf(b, id) {
  try { var e = b.catalog().filter(function (x) { return x.id === id; })[0]; return e ? e.homeRoom : null; } catch (_) { return null; }
}

function mountEngine(rec) {
  var project = boardProject();
  var opts = {
    id: rec.board, hostId: 'home.dashboard', mount: rec.stage, overlay: PMW.overlay(),
    rooms: false, film: false, resize: 'host', shown: false,
    /* P5: the board's contents are this project's (widget_layout:v1:<project>:<board>); never a storeKey, which would
       turn the per-project keys off */
    projectId: project,
    announce: function (text) { rec.api.announce(text); },
    details: function (spec, opener) { var id = widgetOf(spec, opener); openInUsage(id, id && rec.b ? homeRoomOf(rec.b, id) : null, spec); },
    navigate: function (room) { openInUsage(null, room); }
  };
  /* P7: the plain reading-order entrance on a board's first show, none under Reduced Motion (read when it mounts) */
  Object.defineProperty(opts, 'entrance', { enumerable: true, get: function () { return PMW.reduced() ? 'none' : 'plain'; } });
  var b = null;
  try { b = PMU.boards.create(opts); } catch (err) { logError('dashboard board failed', err); }
  if (!b) { showNote(rec, 'This dashboard could not be shown', 'Close it and open it again from +.'); return; }
  rec.b = b;
  if (curProject == null) curProject = project;
  rec.offs = ['mount', 'commit', 'change', 'class'].map(function (e) { return b.on(e, function (d) { onBoardEvent(rec, e, d); }); });
  /* the Live mark pulses once per beat this board patches (the engine's 'beat' event; without it the mark is steady),
     and during the demo hour the demo time moves with the cards it patched. A beat of an hour this tab did not start
     (PMU.boards.hour.play() from elsewhere) paints too, so the demo time and its 2 s ticker start on the first one */
  rec.offs.push(b.on('beat', function () { pulseLive(rec); if (rec.paintLeft && (rec.hourTimer || hourRunning())) rec.paintLeft(); }));
}
/* a change to the widgets ends the Undo of a Start from (Undo would throw the change away); the preset hold's own resizes
   (a set's widgets settling at their presets' fit heights, right after the Start from) are not a change; everything
   repaints */
function heldCommit(d) {
  var id = d && d.receipt && d.receipt.command_instance_id, log = window.PM7_USAGE && PM7_USAGE.command_log;
  if (!id || !Array.isArray(log)) return false;
  for (var i = log.length - 1; i >= 0 && i >= log.length - 60; i--) {
    if (log[i] && log[i].command_instance_id === id) return !!(log[i].payload && log[i].payload.source === 'preset_hold');
  }
  return false;
}
function onBoardEvent(rec, e, d) {
  if (rec.undo && (e === 'change' || (e === 'commit' && !heldCommit(d)))) dismissUndo(rec);
  else if (rec.undo && e === 'commit') checkUndo(rec, rec.undo);
  if (e === 'change' && d && d.op === 'project') rec.seenLabel = tabUserLabel(rec);
  if (rec.paintLeft) rec.paintLeft();
}

/* Add widget: every widget the board can be given. Usage widgets by Usage room in room order, then another source's
   widgets (P3: their ids carry the source's prefix, and they have no home room) under that source's name. One on the
   board already is checked and disabled. A pick adds it (cmd.widget.add), scrolls to it and moves focus onto it. */
function addPicker(rec, anchor) {
  var b = rec.b;
  if (!b) return null;
  var list = [];
  try { list = b.catalog() || []; } catch (err) { logError('dashboard catalog failed', err); }
  var sections = [], byKey = {};
  list.forEach(function (e) {
    var other = !!e.source, where = other ? e.sourceLabel : e.homeRoomLabel;
    var key = other ? 'source:' + e.source : 'room:' + (e.homeRoom || '');
    var sec = byKey[key];
    if (!sec) { sec = byKey[key] = { label: where || 'More widgets', rows: [] }; sections.push(sec); }
    var word = KIND_WORDS[e.kind] || '';
    sec.rows.push({
      id: 'w-' + e.id, label: e.title, sub: [where, word].filter(Boolean).join(' · '),
      checked: !!e.on, disabled: !!e.on, reason: 'Already on this dashboard',
      keywords: [e.id, e.kind, word, where].filter(Boolean).join(' '),
      run: function () { addWidget(rec, e.id, e.title); }
    });
  });
  return PMW.menu.open(anchor || null, {
    id: 'dash-add:' + rec.id, title: 'Add a widget', search: { placeholder: 'Find a widget' }, width: 380, align: 'end',
    className: 'pmw-dash-menu', sections: sections, empty: 'No widget matches.'
  });
}
function addWidget(rec, id, title) {
  var b = rec.b;
  if (!b) return null;
  var r = b.add(id);
  if (!r || r.status === 'rejected' || r.dispatch_accepted === false) return r;
  var card = b.card(id);
  if (card && card.focus) { try { focusCard(function () { card.focus({ preventScroll: true }); }); } catch (_) {} }
  rec.api.announce((title || 'The widget') + ' added to ' + nameOf(rec) + '.');
  return r;
}
function setView(rec, patch) {
  var b = rec.b;
  if (!b || !b.setView(patch)) return;
  rec.paintLeft();
  // lower-case the first word only: a provider scope keeps its name ("Claude only", "GitHub Copilot only")
  var what = patch.range ? rangeLabel(b.state.range) : scopeLabel(b.state.scope);
  if (patch.range || String(b.state.scope).indexOf('provider:') !== 0) what = what.charAt(0).toLowerCase() + what.slice(1);
  rec.api.announce(nameOf(rec) + ' shows ' + what + '.');
}
/* Reset widgets replaces the widgets as a Start from does (a custom dashboard loses all of them), so it offers the same
   Undo when it changed anything; a reset that changed nothing only says so */
function resetEngine(rec) {
  var b = rec.b;
  if (!b) return null;
  var before = snapshotBoards([rec.board]), point = undoPoint(rec, before);
  var r = b.reset('room');
  var what = dashNumber(rec.board) ? nameOf(rec) + ' is empty again.' : nameOf(rec) + ' is back to its default widgets.';
  var changed = JSON.stringify(snapshotBoards([rec.board])) !== JSON.stringify(before);
  if (changed && rec.wrap && !(r && r.dispatch_accepted === false)) {
    rec.api.announce(what + ' Undo is available for a few seconds.');
    showUndo(rec, what, point, 'Undo Reset widgets');
  } else {
    rec.api.announce(what);
    if (PMW.toast) PMW.toast(what);
  }
  if (rec.paintLeft) rec.paintLeft();
  return r;
}

/* ---- Start from (P4): the sets a dashboard can start from (board.sets()), grouped: this dashboard's own default set,
   the dashboard starter, the 13 Usage rooms in room order, the user's saved presets. The set the widgets started from
   is checked. A pick is one cmd.widget.reset_layout with set_id (board.startFrom), and it replaces the widgets, so the
   board's committed revision and its envelope at that revision are kept first (undoPoint) and an Undo notice puts them
   back. ---- */
var SET_GROUPS = [['default', 'This dashboard'], ['host', 'Dashboard starter'], ['room', 'Usage rooms'], ['user', 'Your presets']];
function setsOf(rec) { try { return (rec.b && rec.b.sets()) || []; } catch (err) { logError('dashboard sets failed', err); return []; } }
/* the second line: the engine's detail without the words the group's heading already says ("Usage room · 6 widgets"
   under Usage rooms reads "6 widgets"); a preset adds the day it was saved */
function setDetail(s, saved) {
  var d = String(s.detail || '');
  if (s.kind === 'room') d = d.replace(/^Usage room · /, '');
  if (s.kind === 'user') {
    d = d.replace(/^Saved preset · /, '');
    if (saved) d += ' · saved ' + saved;
  }
  return d;
}
function savedDay(iso) {
  var t = Date.parse(iso || '');
  if (!isFinite(t)) return '';
  try { return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (_) { return ''; }
}
function presetList() { try { return (window.PMU && PMU.boards && PMU.boards.presets) ? PMU.boards.presets.list() : []; } catch (_) { return []; } }
function startFromSpec(rec) {
  var list = setsOf(rec), presets = {};
  presetList().forEach(function (p) { presets['user:' + p.id] = p; });
  var n = 0; try { n = rec.b.count(); } catch (_) {}
  var sections = SET_GROUPS.map(function (g) {
    var rows = list.filter(function (s) { return s.kind === g[0]; }).map(function (s) {
      var p = presets[s.id];
      return { id: 'set-' + s.id, label: s.label, sub: setDetail(s, p ? savedDay(p.created) : ''), checked: !!s.active, current: !!s.active,
        keywords: [g[1], s.kind === 'room' ? 'room usage' : '', s.kind === 'user' ? 'preset saved' : ''].join(' '),
        run: function () { startFrom(rec, s); } };
    });
    if (g[0] === 'user') {
      // an empty Your presets says what goes here and offers the way in; with presets, their rename and delete
      if (!rows.length) rows.push({ id: 'preset-first', label: 'Save this dashboard as a preset...', icon: 'keep',
        sub: 'Presets you save show here, on every dashboard', disabled: !n, reason: 'Presets you save show here. Add a widget first.',
        keywords: 'preset save', run: function () { savePreset(rec); } });
      else rows.push({ id: 'presets-manage', label: 'Rename or delete presets', icon: 'rename', keywords: 'preset rename delete manage',
        submenu: function () { return managePresetsSpec(rec); } });
    }
    return { label: g[1], rows: rows };
  });
  // a filter field once the user's presets make the list long; until then type-ahead finds a row by its first letters
  // and the whole list fits a 1080 px window
  var many = list.filter(function (s) { return s.kind === 'user'; }).length > 3;
  return { id: 'dash-start', title: 'Start from', search: many ? { placeholder: 'Find a room or a preset' } : null, width: 340,
    className: 'pmw-dash-menu', sections: sections, empty: 'Nothing matches.' };
}
/* Start from from the empty board's own button (the Board menu reaches the same spec as a submenu) */
function openStartFrom(rec, anchor) { return PMW.menu.open(anchor || null, startFromSpec(rec)); }
function activeSet(rec) { return setsOf(rec).filter(function (s) { return s.active; })[0] || null; }
function startedText(rec, s) {
  var name = nameOf(rec);
  if (s.kind === 'default') return dashNumber(rec.board) ? name + ' is empty again.' : name + ' is back to its default widgets.';
  if (s.kind === 'room') return name + ' now has the widgets of the ' + s.label + ' room.';
  if (s.kind === 'host') return name + ' now has the dashboard starter widgets.';
  return name + ' now has the widgets of your preset ' + s.label + '.';
}
function startFrom(rec, s) {
  var b = rec.b;
  if (!b || !s) return null;
  var point = undoPoint(rec, snapshotBoards([rec.board])), r = null;
  try { r = b.startFrom(s.id); } catch (err) { logError('dashboard start from failed', err); }
  if (!r) {
    // refused: a set that is gone (a preset deleted meanwhile) or a board that is gone
    var no = s.label + ' cannot be used now. It may have been deleted.';
    rec.api.announce(no);
    if (PMW.toast) PMW.toast(no);
    return null;
  }
  if (r.dispatch_accepted === false) return r;   // the engine says why in its own notice and leaves the board as it was
  var text = startedText(rec, s);
  rec.api.announce(text + ' Undo is available for a few seconds.');
  showUndo(rec, text, point);
  rec.paintLeft();
  return r;
}
/* what an Undo puts back (Plans WS-030 and UCC restore_revision, the lead's ruling of 2026-10-11): the board's committed
   layout revision just before the change, and its envelope at that revision (snapshotBoards flushed the board, so the
   two agree). The engine restores exactly that through one cmd.widget.reset_layout with restore_revision, never with
   set_id (board.restoreRevision). */
function undoPoint(rec, snap) {
  var rev = null;
  try { rev = rec.b && rec.b.revision ? rec.b.revision() : null; } catch (err) { logError('dashboard revision failed', err); }
  return rev == null || !snap ? null : { rev: rev, env: snap[rec.board] || null };
}

/* ---- the Undo notice: one plate at the foot of the tab, in the package's popover look, for 8 s (held while the pointer
   or focus is on it); a change to the widgets ends it. It sits right after the header row in the reading order, so
   Tab reaches Undo next. Undo is offered only while the notice is up; once the board's revision is no longer the one
   the change made (something was committed since that did not end the notice), Undo is disabled and says why. ---- */
var UNDO_MS = 8000;
var UNDO_WHY = {
  stale: 'The widgets changed after this, so Undo can no longer put them back.',
  envelope: 'What was there before is no longer known, so Undo cannot put it back.',
  gone: 'This dashboard is not open now, so Undo cannot put it back.'
};
function showUndo(rec, text, point, groupLabel) {
  dismissUndo(rec, { instant: true });
  if (!point || !rec.wrap) return;
  var btn = h('button', { type: 'button', class: 'pmw-dash-undo-btn', 'data-pmh': 'icon', 'data-pm-hover-label': 'Undo',
    'data-pm-hover-detail': 'Put the widgets back as they were' }, [PMW.icon('reopen', { size: 14 }), h('span', { text: 'Undo' })]);
  var el = h('div', { class: 'pmw-dash-undo pmw-pop', role: 'group', 'aria-label': groupLabel || 'Undo Start from', 'data-pmh': 'off' }, [
    h('span', { class: 'pmw-dash-undo-t', text: text }), btn]);
  var u = rec.undo = { el: el, btn: btn, point: point, timer: 0, held: false, off: null };
  function arm(ms) { clearTimeout(u.timer); u.timer = setTimeout(function () { if (!u.held && rec.undo === u) dismissUndo(rec); }, ms); }
  el.addEventListener('pointerenter', function () { u.held = true; clearTimeout(u.timer); checkUndo(rec, u); });
  el.addEventListener('pointerleave', function () { u.held = el.contains(doc.activeElement); if (!u.held) arm(3000); });
  el.addEventListener('focusin', function () { u.held = true; clearTimeout(u.timer); checkUndo(rec, u); });
  el.addEventListener('focusout', function (e) { if (el.contains(e.relatedTarget)) return; u.held = el.matches(':hover'); if (!u.held) arm(3000); });
  el.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    e.preventDefault(); e.stopPropagation();
    dismissUndo(rec);
    var to = boardBtn(rec); if (to) { try { to.focus({ preventScroll: true }); } catch (_) {} }
  });
  btn.addEventListener('click', function () { undoStart(rec, u); });
  rec.wrap.insertBefore(el, rec.stage);
  if (!PMW.reduced()) PMW.motion.animate(el, [{ opacity: 0, transform: 'translate(-50%, 8px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }],
    { dur: 220, easing: PMW.motion.ease('slide') });
  arm(UNDO_MS);
}
function dismissUndo(rec, o) {
  var u = rec.undo;
  if (!u) return;
  rec.undo = null;
  clearTimeout(u.timer);
  var el = u.el, hadFocus = el.contains(doc.activeElement);
  if (hadFocus) { var to = boardBtn(rec); if (to) { try { to.focus({ preventScroll: true }); } catch (_) {} } }
  if ((o && o.instant) || PMW.reduced() || !el.isConnected) { el.remove(); return; }
  el.style.pointerEvents = 'none';
  var a = PMW.motion.animate(el, [{ opacity: 1 }, { opacity: 0 }], { dur: 160, easing: 'linear', fill: 'forwards' });
  if (a) a.onfinish = function () { el.remove(); }; else el.remove();
}
/* the engine's word on the Undo now: null while it may run, else why not (board.restoreWhy) */
function undoWhy(rec, u) {
  var b = rec.b;
  if (!b || !b.restoreWhy) return 'gone';
  try { return b.restoreWhy(u.point.rev, u.point.env); } catch (err) { logError('dashboard undo check failed', err); return 'gone'; }
}
/* a refused Undo stays in the notice, disabled, and the notice says why (the button keeps focus, so the reason is read) */
function checkUndo(rec, u) {
  if (!u || rec.undo !== u || u.off) return !!(u && u.off);
  var why = undoWhy(rec, u);
  if (!why) return false;
  var text = UNDO_WHY[why] || UNDO_WHY.stale, t = u.el.querySelector('.pmw-dash-undo-t');
  u.off = text;
  u.btn.setAttribute('aria-disabled', 'true');
  u.btn.setAttribute('data-disabled-reason', text);
  u.btn.setAttribute('data-pm-hover-detail', text);   /* dimmed by 62-kind-dashboard.css [aria-disabled] */
  if (t) { t.textContent = text; t.title = text; }
  rec.api.announce(text);
  return true;
}
function undoStart(rec, u) {
  if (rec.undo !== u) return;
  if (!u.off) checkUndo(rec, u);
  if (u.off) { if (PMW.toast) PMW.toast(u.off); return; }
  var b = rec.b, p = u.point, r = null;
  dismissUndo(rec, { instant: true });
  try { r = b.restoreRevision(p.rev, p.env); } catch (err) { logError('dashboard undo failed', err); }
  // refused or rejected: the engine changed nothing (a rejection says so in its own notice)
  if (!r || r.refused || r.dispatch_accepted === false) { if (r && r.refused) rec.api.announce(UNDO_WHY[r.reason] || UNDO_WHY.stale); return; }
  var t = nameOf(rec) + ' is back as it was.';
  rec.api.announce(t);
  rec.paintLeft();
}

/* ---- presets (P4): the user's saved boards, one store for every project and every dashboard (PMU.boards.presets,
   widget_presets:v1). Saved from the Board menu; renamed and deleted from Start from's Your presets. ---- */
/* a name another preset (or dashboard) already has gets ' 2', ' 3' ... so two never read alike in a list; the suffix
   always fits the 80-character limit */
function uniqueAmong(base, names) {
  var taken = {};
  names.forEach(function (n) { if (n) taken[String(n).toLowerCase()] = true; });
  if (!taken[base.toLowerCase()]) return base;
  for (var i = 2; i < 100; i++) { var c = Array.from(base).slice(0, 80 - (' ' + i).length).join('') + ' ' + i; if (!taken[c.toLowerCase()]) return c; }
  return base;
}
function uniquePresetName(base, except) {
  return uniqueAmong(base, presetList().filter(function (p) { return p.id !== except; }).map(function (p) { return p.name; }));
}
function promptAt(rec, o) {
  var anchor = boardBtn(rec);
  // after the menu that asked has closed (its close returns focus to the button first)
  requestAnimationFrame(function () { if (!rec.gone) PMW.menu.prompt(anchor && anchor.isConnected ? anchor : null, o); });
}
function savePreset(rec) {
  if (!rec.b || !PMU.boards.presets) return;
  promptAt(rec, { title: 'Save as preset', value: uniquePresetName(nameOf(rec)), ok: 'Save', maxLength: 80, done: function (v) {
    var p = null;
    if (cleanName(v)) v = uniquePresetName(cleanName(v));
    try { p = PMU.boards.presets.save(rec.b, v); } catch (err) { logError('dashboard preset save failed', err); }
    var t = p ? 'Saved ' + p.name + ' as a preset. It is in Start from on every dashboard.' : 'This dashboard could not be saved as a preset.';
    rec.api.announce(t);
    if (PMW.toast) PMW.toast(t);
  } });
}
function managePresetsSpec(rec) {
  var list = presetList();
  return { id: 'dash-presets', title: 'Your presets', className: 'pmw-dash-menu', width: 320,
    search: list.length > 7 ? { placeholder: 'Find a preset' } : null, empty: 'No presets yet.',
    rows: list.map(function (p) {
      return { id: 'preset-' + p.id, label: p.name, icon: 'keep', sub: 'Saved ' + (savedDay(p.created) || 'earlier'),
        submenu: function () { return presetSpec(rec, p); } };
    }) };
}
function presetSpec(rec, p) {
  return { id: 'dash-preset:' + p.id, title: p.name, className: 'pmw-dash-menu', width: 320, rows: [
    { id: 'preset-start', label: 'Start from this preset', icon: 'widget', sub: 'Replaces the widgets on ' + nameOf(rec),
      run: function () { startFrom(rec, { id: 'user:' + p.id, label: p.name, kind: 'user' }); } },
    { id: 'preset-rename', label: 'Rename preset...', icon: 'rename', run: function () { renamePreset(rec, p); } },
    { id: 'preset-delete', label: 'Delete preset...', icon: 'cross', danger: true, sub: 'Dashboards keep their widgets', submenu: function () {
      return { id: 'dash-preset-delete', title: 'Delete ' + p.name + '?', width: 320, rows: [
        { id: 'preset-delete-yes', label: 'Delete preset', icon: 'cross', danger: true, sub: 'It leaves Start from everywhere', run: function () { deletePreset(rec, p); } },
        { id: 'preset-delete-no', label: 'Keep it', icon: 'check', run: function () {} }
      ] };
    } }
  ] };
}
function renamePreset(rec, p) {
  promptAt(rec, { title: 'Rename preset', value: p.name, ok: 'Rename', maxLength: 80, done: function (v) {
    if (cleanName(v)) v = uniquePresetName(cleanName(v), p.id);
    if (!cleanName(v)) { rec.api.announce('A preset needs a name. ' + p.name + ' keeps its name.'); if (PMW.toast) PMW.toast('A preset needs a name. ' + p.name + ' keeps its name.'); return; }
    var r = null;
    try { r = PMU.boards.presets.rename(p.id, v); } catch (err) { logError('dashboard preset rename failed', err); }
    var t = r ? 'Renamed the preset to ' + r.name + '.' : 'That preset is gone.';
    rec.api.announce(t);
    if (PMW.toast) PMW.toast(t);
    repaintAll();
  } });
}
function deletePreset(rec, p) {
  var ok = false;
  try { ok = PMU.boards.presets.remove(p.id); } catch (err) { logError('dashboard preset delete failed', err); }
  var t = ok ? 'Deleted the preset ' + p.name + '. Dashboards keep the widgets they have.' : 'That preset was already gone.';
  rec.api.announce(t);
  if (PMW.toast) PMW.toast(t);
  repaintAll();
}

/* ---- Live readings and the demo hour (P12). Live is one choice for the whole page, the Usage page's own (PMU.live):
   a shown dashboard holding Usage widgets beats about every 6 s while the Usage page is hidden. The demo hour plays
   one demo minute per second on every shown board; "Demo time HH:MM" shows in the facts until Back to now. ---- */
function liveApi() { return window.PMU && PMU.boards && PMU.boards.live ? PMU.boards.live : null; }
function hourApi() { return window.PMU && PMU.boards && PMU.boards.hour ? PMU.boards.hour : null; }
function liveEnabled() { try { return !!(PMU.live && PMU.live.enabled && PMU.live.enabled()); } catch (_) { return false; } }
function liveOn() { var L = liveApi(); try { return !!(L && L.on()); } catch (_) { return false; } }
function hourRunning() { var H = hourApi(); try { return !!(H && H.running()); } catch (_) { return false; } }
function hourAvailable() { var H = hourApi(); try { return !!(H && H.available()); } catch (_) { return false; } }
function setLive(rec, on) {
  var L = liveApi();
  if (!L) return;
  try { L.set(on); } catch (err) { logError('dashboard live switch failed', err); }
  rec.api.announce(on ? 'Live readings on: a few readings change about every 6 seconds, here and on Usage.' : 'Live readings paused, here and on Usage.');
  repaintAll();
}
function playHour(rec) {
  var H = hourApi();
  var ok = false;
  try { ok = !!(H && H.play()); } catch (err) { logError('dashboard demo hour failed', err); }
  rec.api.announce(ok ? 'Playing the next hour: one demo minute per second. Back to now is in the Board menu.' : 'The demo hour could not start.');
  repaintAll();
}
function backToNow(rec) {
  var H = hourApi();
  try { if (H) H.back(); } catch (err) { logError('dashboard back to now failed', err); }
  rec.api.announce('Back to now: the current readings.');
  repaintAll();
}
function liveRows(rec) {
  var rows = [{ id: 'live', label: 'Live readings', checked: liveOn(), disabled: !liveEnabled(),
    reason: 'Live readings are not part of this page', sub: 'Shared with Live on the Usage page',
    run: function () { setLive(rec, !liveOn()); } }];
  if (hourRunning()) rows.push({ id: 'hour-back', label: 'Back to now', icon: 'history', sub: 'Return to the current readings', run: function () { backToNow(rec); } });
  else rows.push({ id: 'hour', label: 'Play the next hour', icon: 'play', sub: 'One demo minute per second',
    disabled: !hourAvailable(), reason: 'The demo hour is not available on this page', run: function () { playHour(rec); } });
  return rows;
}
/* the Live mark: shown while Live is on and the board holds a Usage widget (a widget id without a source prefix) */
function holdsUsage(rec) {
  try { return rec.b.visible().some(function (id) { return String(id).indexOf(':') < 0; }); } catch (_) { return false; }
}
function liveWord() {
  var lk = PMW.look ? PMW.look() : { family: 'basic' };
  return lk.nier ? 'LIVE' : lk.family === 'retro' ? '[LIVE]' : 'Live';
}
function liveMark(rec) {
  if (!rec.live) {
    var ring = h('i', { class: 'pmw-dash-live-ring' });
    var word = h('span', { class: 'pmw-dash-live-word' });
    rec.live = { el: h('span', { class: 'pmw-dash-live' }, [h('i', { class: 'pmw-dash-live-dot', 'aria-hidden': 'true' }, [ring]), word]), ring: ring, word: word };
  }
  setText(rec.live.word, liveWord());
  return rec.live.el;
}
function pulseLive(rec) {
  var L = rec.live;
  if (!rec.liveShown || !L || !L.ring.isConnected || PMW.reduced()) return;
  // the Usage page's own pulse when it is there (one look for the indicator on both pages), else the same frames here
  if (window.PMU && PMU.live && typeof PMU.live.pulse === 'function') { try { PMU.live.pulse(L.ring); return; } catch (_) {} }
  var f = PMW.motion.family();
  if (f === 'retro' || f === 'nier') PMW.motion.animate(L.ring, [{ opacity: 1 }, { opacity: 0 }], { dur: 240, easing: 'steps(2, jump-none)' });
  else PMW.motion.animate(L.ring, [{ transform: 'scale(.6)', opacity: 0.5 }, { transform: 'scale(2.2)', opacity: 0 }], { dur: 600, easing: 'cubic-bezier(.22,.8,.28,1)' });
}
/* the demo time follows the hour: read on paint, and every 2 s while the hour plays and this tab is on screen */
function hourTicker(rec) {
  var H = hourApi(), playing = false;
  try { playing = !!(H && H.running() && H.step() < 30); } catch (_) {}
  var want = playing && rec.shown && pageActive() && !rec.gone;
  if (want && !rec.hourTimer) rec.hourTimer = setInterval(function () { rec.paintLeft(); }, 2000);
  else if (!want && rec.hourTimer) { clearInterval(rec.hourTimer); rec.hourTimer = 0; }
}

/* ---- Rename and Delete (custom dashboards only; D35) ---- */
function tabUserLabel(rec) {
  var l = PMW.state && PMW.state.layout, t = l && l.tabs[rec.id];
  return (t && t.userLabel) || null;
}
function renameDash(rec) {
  promptAt(rec, { title: 'Rename dashboard', value: nameOf(rec), ok: 'Rename', maxLength: 80, done: function (v) { applyName(rec, v); } });
}
/* the board's name, its tab and every list that shows it, in one step; an empty name goes back to "Dashboard n". The
   tab takes it through the rename command (cmd.panel_tab.rename, with its receipt), so the strip, the reopen list and
   the saved layout follow */
function applyName(rec, v) {
  if (!dashNumber(rec.board)) return false;
  var name = cleanName(v);
  // never the name of a built-in board or of another of this project's dashboards
  if (name) name = uniqueAmong(name, FIXED_IDS.map(function (b) { return FIXED[b].label; }).concat(customBoards().filter(function (b) { return b !== rec.board; }).map(labelOf)));
  setName(rec.board, name);
  var now = labelOf(rec.board), want = name && name !== defaultLabel(rec.board) ? now : null;
  rec.api.update({ label: now });
  if (tabUserLabel(rec) !== want) { rec.seenLabel = want; PMW.renameTab(rec.id, want || ''); }
  refreshCatalog();
  repaintAll();
  rec.api.announce('The dashboard is now called ' + now + '.');
  return true;
}
/* a rename of the tab (its own Rename..., the layout's commit) names the board; clearing that rename clears the name */
function syncNames() {
  recList().forEach(function (rec) {
    if (rec.gone || !dashNumber(rec.board)) return;
    var ul = tabUserLabel(rec);
    if (ul === rec.seenLabel) return;
    var had = rec.seenLabel;
    rec.seenLabel = ul;
    if (ul) setName(rec.board, ul);
    else if (had) { setName(rec.board, null); rec.api.update({ label: labelOf(rec.board) }); }
    refreshCatalog();
  });
}
/* Delete dashboard (dash-<n> only): the tab closes, its key goes (after the board's last write, in unmount) and it
   leaves the reopen stack, so Reopen closed tab cannot bring back an empty copy */
function deleteDash(rec) {
  if (!dashNumber(rec.board)) return;
  var id = rec.id, name = nameOf(rec), board = rec.board, project = boardProject();
  rec.deleting = true;
  PMW.closeTab(id, { quiet: true }).then(function (ok) {
    if (!ok) { rec.deleting = false; return; }
    if (rec.gone) forget(board, project);
    var l = PMW.state && PMW.state.layout;
    if (l && l.closed) {
      var kept = l.closed.filter(function (c) { return !(c && c.tab && c.tab.id === id); });
      if (kept.length !== l.closed.length) { l.closed = kept; if (PMW.persist && PMW.persist.saveSoon) PMW.persist.saveSoon(); }
    }
    PMW.announce(name + ' deleted');
  });
}
/* forget: the ONE place that drops a board's stores: its key and quarantine copy in this project (the engine's
   forgetKey), and a custom dashboard's name. Delete dashboard and the closed-list drop (P6) both go through it. */
function forget(board, project) {
  var p = project || boardProject();
  try { if (engineReady() && PMU.boards.forgetKey) PMU.boards.forgetKey(board, p); } catch (err) { logError('dashboard forget failed', err); }
  if (dashNumber(board)) { setName(board, null, p); refreshCatalog(); }
}

/* ---- a quiet note in the stage (no Usage engine in this build, an id this kind does not run) ---- */
function showNote(rec, title, sub) {
  var note = h('div', { class: 'pmw-dash-note', role: 'status' }, [
    h('div', { class: 'pmw-dash-note-col' }, [
      PMW.icon('dashboard', { size: 16, cls: 'pmw-dash-note-ico' }),
      h('p', { class: 'pmw-dash-note-t', text: title }),
      sub ? h('p', { class: 'pmw-dash-note-sub', text: sub }) : null
    ])
  ]);
  rec.stage.appendChild(note);
  rec.note = note;
}

/* ---- an empty board (P13: every new dashboard starts so): the kind's own invitation in place of the board's note: a
   sketch of a board, what to do, and the two ways in (Add widget, Start from...). The board stays laid out under it
   (hidden, not removed), so its width and mount are unchanged. ---- */
function emptyState(rec) {
  if (rec.empty) return rec.empty;
  var tiles = h('div', { class: 'pmw-dash-empty-art', 'aria-hidden': 'true' }, [
    h('i', { class: 'pmw-dash-empty-tile is-wide is-number' }), h('i', { class: 'pmw-dash-empty-tile is-ring' }),
    h('i', { class: 'pmw-dash-empty-tile is-bars' }), h('i', { class: 'pmw-dash-empty-tile is-number' }),
    h('i', { class: 'pmw-dash-empty-tile is-add' }, [PMW.icon('plus', { size: 12 })])
  ]);
  var title = h('h3', { class: 'pmw-dash-empty-t' });
  var sub = h('p', { class: 'pmw-dash-empty-sub' });
  var add = PMW.frames.button({ id: 'empty-add', label: 'Add widget', icon: 'plus', primary: true, detail: 'Pick a widget for this dashboard',
    run: function (e, btn) { addPicker(rec, btn); } });
  var start = PMW.frames.button({ id: 'empty-start', label: 'Start from...', icon: 'widget', detail: 'A Usage room, the dashboard starter or one of your presets',
    run: function (e, btn) { openStartFrom(rec, btn); } });
  start.setAttribute('aria-haspopup', 'menu');
  var acts = h('div', { class: 'pmw-dash-empty-acts' }, [add, start]);
  var col = h('div', { class: 'pmw-dash-empty-col' }, [tiles, title, sub, acts]);
  var el = h('div', { class: 'pmw-dash-empty', role: 'group', 'aria-label': 'Empty dashboard', hidden: true }, [col]);
  rec.stage.appendChild(el);
  rec.empty = { el: el, tiles: tiles, title: title, sub: sub, acts: acts, add: add, entered: false };
  return rec.empty;
}
function paintEmpty(rec) {
  if (rec.type !== 'engine' || !rec.b) return;
  var n = 1;
  try { n = rec.b.count(); } catch (_) { n = 1; }
  var on = n === 0;
  if (!on && !rec.empty) return;
  var E = emptyState(rec);
  if (on) {
    setText(E.title, nameOf(rec) + ' is empty');
    setText(E.sub, dashNumber(rec.board)
      ? 'Add widgets one by one, or start from a Usage\u00a0room, the dashboard\u00a0starter or one of your\u00a0presets.'
      : 'Add widgets one by one, or start from its default\u00a0widgets, a Usage\u00a0room or one of your\u00a0presets.');
  }
  if (E.el.hidden === !on) { if (on && !E.entered && rec.shown) enterEmpty(E); return; }
  E.el.hidden = !on;
  if (on) rec.stage.setAttribute('data-empty', ''); else { rec.stage.removeAttribute('data-empty'); E.entered = false; }
  if (on && rec.shown) enterEmpty(E);
}
/* its entrance, once each time it appears on screen: the sketch's tiles in reading order, then the words and buttons;
   none under Reduced Motion, and nothing moves after it */
function enterEmpty(E) {
  E.entered = true;
  if (PMW.reduced()) return;
  var M = PMW.motion, ease = M.ease('settle');
  Array.prototype.forEach.call(E.tiles.children, function (t, i) {
    M.animate(t, [{ opacity: 0, transform: 'translateY(6px) scale(.94)' }, { opacity: 1, transform: 'none' }], { dur: 320, delay: 40 * i, easing: ease, fill: 'backwards' });
  });
  [E.title, E.sub, E.acts].forEach(function (el, i) {
    M.animate(el, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { dur: 320, delay: 160 + 50 * i, easing: ease, fill: 'backwards' });
  });
}

/* ==================================================================================================================
   The header row (every dashboard tab)
   ================================================================================================================== */
function openBoard(rec, b) {
  if (b === 'new') { rec.api.open({ kind: 'dashboard', board: 'new' }); return; }
  if (b === rec.board) return;
  rec.api.open({ kind: 'dashboard', id: 'dashboard:' + b, board: b, label: labelOf(b), pinned: homePinned(b) });
}
/* a custom dashboard's second line: how many widgets it holds (a board not open is read from its key) */
function storedCount(b) {
  var live = engineReady() ? PMU.boards.get(b) : null;
  if (live) { try { return live.count(); } catch (_) {} }
  var env = readKey(b), n = 0;
  ((env && env.records) || []).forEach(function (r) { if (r && r.visible !== false && r.geometry && Object.keys(r.geometry).length) n += 1; });
  return n;
}
function boardRows(rec) {
  var rows = FIXED_IDS.map(function (b) {
    return { id: 'board-' + b, label: FIXED[b].label, sub: FIXED[b].sub, checked: rec.board === b, current: rec.board === b, run: function () { openBoard(rec, b); } };
  });
  customBoards().forEach(function (b) {
    rows.push({ id: 'board-' + b, label: labelOf(b), sub: widgetCount(storedCount(b)), checked: rec.board === b, current: rec.board === b, run: function () { openBoard(rec, b); } });
  });
  rows.push({ id: 'board-new', label: 'New dashboard', icon: 'plus', sub: NEW_SUB, run: function () { openBoard(rec, 'new'); } });
  return rows;
}
function boardMenu(rec) {
  var sections = [{ label: 'Dashboards', rows: boardRows(rec) }];
  if (rec.type === 'engine' && rec.b) {
    var b = rec.b, st = b.state || {}, custom = !!dashNumber(rec.board), n = 0, act = activeSet(rec);
    try { n = b.count(); } catch (_) {}
    sections.push({ label: 'This dashboard', rows: [
      { id: 'range', label: 'Range', icon: 'clock', sub: rangeLabel(st.range), submenu: function () {
        return { id: 'dash-range', title: 'Range of this dashboard', rows: RANGES.map(function (r) {
          return { id: 'range-' + r[0], label: r[1], checked: (b.state || {}).range === r[0], run: function () { setView(rec, { range: r[0] }); } };
        }) };
      } },
      { id: 'scope', label: 'Scope', icon: 'eye', sub: scopeLabel(st.scope), submenu: function () {
        return { id: 'dash-scope', title: 'Scope of this dashboard', rows: scopeChoices().map(function (s) {
          return { id: 'scope-' + s[0], label: s[1], checked: (b.state || {}).scope === s[0], run: function () { setView(rec, { scope: s[0] }); } };
        }) };
      } },
      { id: 'start', label: 'Start from', icon: 'widget', sub: act ? act.label : 'Default widgets', submenu: function () { return startFromSpec(rec); } },
      { id: 'preset-save', label: 'Save as preset...', icon: 'keep', sub: 'Reuse these widgets anywhere',
        disabled: !n, reason: 'Add a widget first', run: function () { savePreset(rec); } },
      { id: 'tidy', label: 'Tidy', icon: 'layout', sub: 'Close the gaps between widgets', disabled: !n, reason: 'Nothing to tidy yet', run: function () { b.tidy(); } },
      { id: 'reset', label: 'Reset widgets', icon: 'reopen', sub: custom ? 'Back to an empty dashboard' : 'Back to its default widgets', run: function () { resetEngine(rec); } }
    ] });
    sections.push({ label: 'Live', rows: liveRows(rec) });
    if (custom) {
      sections.push({ rows: [
        { id: 'rename', label: 'Rename dashboard...', icon: 'rename', run: function () { renameDash(rec); } },
        { id: 'delete', label: 'Delete dashboard...', icon: 'cross', danger: true, sub: 'Its widgets go with it', submenu: function () {
          return { id: 'dash-delete', title: 'Delete ' + nameOf(rec) + '?', rows: [
            { id: 'delete-yes', label: 'Delete dashboard', icon: 'cross', danger: true, sub: 'Its widgets cannot be brought back', run: function () { deleteDash(rec); } },
            { id: 'delete-no', label: 'Keep it', icon: 'check', run: function () {} }
          ] };
        } }
      ] });
    }
  } else if (rec.type === 'agents') {
    sections.push({ label: 'Show', rows: FILTERS.map(function (f) {
      return { id: 'filter-' + f.id, label: f.label, checked: (rec.filter || 'all') === f.id, run: function () { setFilter(rec, f.id); } };
    }) });
  }
  return { id: 'dash-board-menu', title: nameOf(rec), width: 320, align: 'end', className: 'pmw-dash-menu', sections: sections };
}
function maxAction(rec) {
  var on = rec.api.isMaximized();
  return { label: on ? 'Restore' : 'Maximize', icon: on ? 'restore' : 'maximize', detail: 'Shift+Escape' };
}
function refreshMax(rec) {
  if (!rec.row) return;
  var mx = maxAction(rec), el = rec.row.action('max');
  if (el && el.getAttribute('data-pm-hover-label') !== mx.label) rec.row.setAction('max', mx);
}

function rowActions(rec) {
  var actions = [];
  if (rec.type === 'engine' && rec.b) {
    actions.push({ id: 'add', label: 'Add widget', icon: 'plus', detail: 'Pick a widget for this dashboard', run: function (e, button) { addPicker(rec, button); } });
    actions.push({ id: 'board', label: 'Board', icon: 'layout', detail: 'Dashboards, range, scope, Start from, presets, Live', menu: function () { return boardMenu(rec); } });
  } else if (rec.type === 'agents') {
    actions.push({ id: 'board', label: 'Show', icon: 'eye', detail: 'Filter the agents, switch dashboards', menu: function () { return boardMenu(rec); } });
  } else {
    actions.push({ id: 'board', label: 'Board', icon: 'layout', detail: 'Switch dashboards', menu: function () { return boardMenu(rec); } });
  }
  var mx = maxAction(rec);
  actions.push({ id: 'max', label: mx.label, icon: mx.icon, detail: mx.detail, run: function () {
    rec.api.toggleMaximize();
    rec.row.setAction('max', maxAction(rec));
  } });
  return actions;
}
function factsFor(rec) {
  var left = [{ id: 'board', icon: 'dashboard', text: nameOf(rec), strong: true }];
  var n;
  rec.liveShown = false;
  if (rec.type === 'engine' && rec.b) {
    if (liveOn() && holdsUsage(rec)) {
      rec.liveShown = true;
      left.push({ id: 'live', el: liveMark(rec), title: 'Live readings', detail: 'A few readings change about every 6 seconds, here and on Usage. The Board menu turns them off.' });
    }
    if (hourRunning()) {
      var H = hourApi(), label = '', done = false;
      try { label = H.label(); done = H.step() >= 30; } catch (_) {}
      if (label) left.push({ id: 'hour', icon: 'clock', text: label, title: 'Demo time',
        detail: done ? 'The demo hour has played. Back to now is in the Board menu.' : 'The demo hour is playing, one demo minute per second. Back to now is in the Board menu.' });
    }
    try { n = rec.b.count(); } catch (_) { n = 0; }
    left.push({ id: 'count', text: n ? n + (n === 1 ? ' widget' : ' widgets') : 'No widgets', dim: true });
    var st = rec.b.state || {};
    left.push({ id: 'view', text: rangeLabel(st.range) + (st.scope && st.scope !== 'all' ? ' · ' + scopeLabel(st.scope) : ''), dim: true });
  } else if (rec.type === 'agents') {
    left.push({ id: 'count', text: agentSummary(), dim: true });
    if (rec.filter && rec.filter !== 'all') {
      var lab = FILTERS.filter(function (x) { return x.id === rec.filter; })[0];
      left.push({ id: 'filter', text: 'Showing ' + (lab ? lab.label.toLowerCase() : ''), dim: true });
    }
  }
  return left;
}
function buildRow(rec) {
  rec.row = rec.api.headerRow({ label: labelOf(rec.board) + ' board controls', actions: rowActions(rec) });
  rec.paintLeft = function () {
    if (rec.gone) return;
    // the tab's hover title follows a rename
    var title = 'Dashboard: ' + nameOf(rec);
    if (rec.title !== title) { if (rec.title != null) rec.api.update({ title: title }); rec.title = title; }
    paintEmpty(rec);
    hourTicker(rec);
    var left = factsFor(rec);
    var key = JSON.stringify(left);
    if (key === rec.leftKey) return;
    rec.leftKey = key;
    rec.row.set({ left: left });
  };
  rec.paintLeft();
  return rec.row.el;
}

/* ==================================================================================================================
   The kind
   ================================================================================================================== */
function typeOf(board) {
  if (board === 'agents') return 'agents';
  if (isEngineId(board)) return engineReady() ? 'engine' : 'fallback';
  return 'refused';
}

PM_HOME.registerKind('dashboard', {
  label: 'Dashboard',
  group: 'Dashboards',
  icon: 'dashboard',
  prefixes: ['dashboard:'],
  min: { w: 320, h: 120 },
  dedicated: true,
  /* a board id gives its tab; 'new' (and an open with no board: Ctrl+T or a split in a dashboard panel) makes a new
     dashboard; an id this kind does not run opens Home */
  idFor: function (spec) {
    var b = spec && spec.board;
    if (b == null || b === '' || b === 'new') return mintId();
    return 'dashboard:' + (isBoard(b) ? b : 'home');
  },
  /* dashboard:current (D10 round two P1: the old Home widgets left Home) opens the Home board instead of a broken tab */
  canonical: function (id) {
    if (id === 'dashboard:new') return mintId();
    if (id === 'dashboard:current') return 'dashboard:home';
    return null;
  },
  labelFor: function (id, st) { var b = boardOf(id, st); return isBoard(b) ? labelOf(b) : 'Dashboard'; },
  iconFor: function () { return 'dashboard'; },
  /* the "+" row: the four built-in boards, this project's custom dashboards by name, then New dashboard */
  plus: {
    order: 40,
    label: 'Dashboard',
    sub: function () {
      var out = FIXED_IDS.map(function (b) { return { id: b, label: FIXED[b].label, detail: FIXED[b].sub, icon: 'dashboard' }; });
      // custom dashboards go into one 'Your dashboards' row under Dashboard (PMW.SUB_GROUPS), so the inline links stay
      // the four built-ins and New dashboard however many a person makes
      customBoards().forEach(function (b) { out.push({ id: b, label: labelOf(b), detail: widgetCount(storedCount(b)), icon: 'dashboard', group: 'dash' }); });
      return out.concat([{ id: 'new', label: 'New dashboard', detail: NEW_SUB, icon: 'plus' }]);
    },
    spec: function (sub) {
      if (sub === 'new') return { kind: 'dashboard', board: 'new' };
      var b = isBoard(sub) ? sub : 'home';
      return { kind: 'dashboard', board: b, id: 'dashboard:' + b, label: labelOf(b), pinned: homePinned(b) };
    }
  },
  mount: function (host, st, api) {
    var board = boardOf(api.id, st), type = isBoard(board) ? typeOf(board) : 'refused';
    var rec = { id: api.id, api: api, board: board, type: type, filter: (st && st.filter) || 'all', host: host, gone: false, shown: false, b: null, offs: [] };
    recs[api.id] = rec;
    var stage = rec.stage = h('div', { class: 'pmw-dash-stage', 'data-board': board, 'data-kind': type });
    var wrap = rec.wrap = h('div', { class: 'pmw-dash', 'data-board': board }, [null, stage]);
    host.appendChild(wrap);
    // a custom dashboard's tab renamed before round two names its board
    rec.seenLabel = tabUserLabel(rec);
    if (dashNumber(board) && rec.seenLabel && rec.seenLabel !== labelOf(board)) setName(board, rec.seenLabel);
    if (type === 'engine') mountEngine(rec);
    else if (type === 'agents') mountAgents(rec);
    else if (type === 'fallback') showNote(rec, 'Usage widgets are not available in this build', 'The other dashboards and the panels work as usual.');
    else if (type === 'refused') showNote(rec, 'This dashboard is not part of this build', 'Open Home, Metrics, Monitoring or a new dashboard from the Board menu.');
    wrap.insertBefore(buildRow(rec), stage);
    var name = nameOf(rec);
    api.update({ label: labelOf(board), title: 'Dashboard: ' + name, icon: 'dashboard' });
    if (dashNumber(board)) refreshCatalog();

    var inst = {
      serialize: function () {
        var o = { board: board };
        if (type === 'agents' && rec.filter !== 'all') o.filter = rec.filter;
        return o;
      },
      onShow: function () {
        rec.shown = true;
        if (rec.b) { if (pageActive()) rec.b.show(); }
        // the clock runs only while Home is the page in front (a render pass in the page-out animation can still call
        // onShow); its own flag, so the host's onShow on return starts it
        else if (type === 'agents') { if (pageActive() && !rec.clockOn) { rec.clockOn = true; clockStart(); } rec.tickAgents(); }
        rec.paintLeft();
      },
      onHide: function () {
        if (!rec.shown) return;
        rec.shown = false;
        if (rec.b) rec.b.hide();
        else if (type === 'agents' && rec.clockOn) { rec.clockOn = false; clockStop(); }
        hourTicker(rec);
      },
      onResize: function (size) {
        refreshMax(rec);
        if (rec.b) rec.b.hostResize(size);
      },
      onLook: function (look) { if (rec.b) rec.b.relook(look); rec.paintLeft(); },
      wantsKey: function () { return !!(rec.b && rec.b.gesture()); },
      /* an open of this tab: { widget } scrolls an engine board to that card */
      reveal: function (fields) {
        if (!fields) return;
        if (rec.b && typeof fields.widget === 'string') rec.b.reveal(fields.widget);
      },
      unmount: function () {
        if (type === 'agents' && rec.clockOn) { rec.clockOn = false; clockStop(); }
        dismissUndo(rec, { instant: true });
        rec.gone = true;
        if (rec.hourTimer) { clearInterval(rec.hourTimer); rec.hourTimer = 0; }
        delete recs[api.id];
        rec.offs.splice(0).forEach(function (off) { try { off(); } catch (_) {} });
        if (rec.b) { try { rec.b.destroy(); } catch (err) { logError('dashboard board destroy failed', err); } }
        if (rec.deleting) forget(board, rec.b ? rec.b.project() : null);
      }
    };
    /* keyboard focus on an engine board: its first card in reading order; an empty board's Add widget, else the header
       row's (the other tabs take the host's default, their panel) */
    if (type === 'engine') inst.focus = function () {
      if (rec.b && focusCard(function () { return rec.b.focus(); })) return;
      var add = rec.empty && !rec.empty.el.hidden ? rec.empty.add : rec.row && rec.row.action('add');
      if (add && add.focus) add.focus({ preventScroll: true });
    };
    return inst;
  }
});

/* the catalog: the four built-in boards and New dashboard, then this project's custom dashboards by name (added again
   when one is made, renamed or the project changes) */
PM_HOME.catalog.add('dashboard', FIXED_IDS.map(function (b) {
  return { id: 'dashboard:' + b, label: FIXED[b].label, sub: FIXED[b].sub, icon: 'dashboard', keywords: 'dashboard board widgets ' + b,
    spec: { kind: 'dashboard', board: b, id: 'dashboard:' + b, label: FIXED[b].label, pinned: homePinned(b) } };
}).concat([{ id: 'dashboard:new', label: 'New dashboard', sub: NEW_SUB, icon: 'dashboard', keywords: 'dashboard board widgets new empty',
  spec: { kind: 'dashboard', board: 'new' } }]));
function refreshCatalog() {
  var items = customBoards().map(function (b) {
    var name = labelOf(b);
    return { id: 'dashboard:' + b, label: name, sub: 'Your dashboard', icon: 'dashboard', keywords: 'dashboard board widgets custom ' + name,
      spec: { kind: 'dashboard', board: b, id: 'dashboard:' + b, label: name } };
  });
  var now = {}; items.forEach(function (it) { now[it.id] = true; });
  var stale = PM_HOME.catalog.list('dashboard').filter(function (it) { return DASH_TAB.test(it.id) && !now[it.id]; }).map(function (it) { return it.id; });
  if (stale.length && PM_HOME.catalog.remove) PM_HOME.catalog.remove('dashboard', stale);
  if (items.length) PM_HOME.catalog.add('dashboard', items);
}

/* ---- engine hooks for the tour and checks ---- */
function reveal(board) {
  if (board === 'new') return PM_HOME.open({ kind: 'dashboard', board: 'new' });
  if (!isBoard(board)) board = 'home';
  return PM_HOME.open({ kind: 'dashboard', id: 'dashboard:' + board, board: board, label: labelOf(board), pinned: homePinned(board) });
}
/* the stored dashboards of this project: every key of an engine board id, plus the live boards' (a board not written
   yet reads null) */
function storedBoards() {
  var ids = {};
  storedIds(boardProject()).forEach(function (b) { ids[b] = true; });
  engineRecs().forEach(function (r) { ids[r.board] = true; });
  return Object.keys(ids);
}
/* a board's key now: a mounted board's own (b.STORE_KEY, which follows its project), else this project's */
function liveRec(board) { return engineRecs().filter(function (r) { return r.board === board; })[0] || null; }
function storeKeyOf(board) { var r = liveRec(board); return r && r.b.STORE_KEY ? r.b.STORE_KEY : keyFor(board); }
function readKey(board) {
  try { var v = localStorage.getItem(storeKeyOf(board)); return v == null ? null : JSON.parse(v); } catch (_) { return null; }
}
/* every listed engine dashboard's store, written now (each board flushed first): { <board id>: envelope | null } */
function snapshotBoards(ids) {
  var list = Array.isArray(ids) ? ids.filter(isEngineId) : storedBoards();
  list.forEach(function (id) { var r = liveRec(id); if (r) { try { r.b.flush(); } catch (_) {} } });
  var out = {};
  list.forEach(function (id) { out[id] = readKey(id); });
  return out;
}
/* the stores written back (null removes one) and every mounted board among them read again. An envelope from another
   project (a named layout saved there) is written as this project's. */
function restoreBoards(snap) {
  if (!snap || typeof snap !== 'object') return false;
  var p = boardProject();
  Object.keys(snap).forEach(function (id) {
    if (!isEngineId(id)) return;
    var key = storeKeyOf(id), env = snap[id];
    try {
      if (env == null) localStorage.removeItem(key);
      else {
        if (typeof env === 'object' && env.project_id && env.project_id !== p) env = Object.assign({}, env, { project_id: p });
        localStorage.setItem(key, JSON.stringify(env));
      }
    } catch (_) {}
  });
  engineRecs().forEach(function (r) {
    if (!Object.prototype.hasOwnProperty.call(snap, r.board)) return;
    try { r.b.reload(); } catch (err) { logError('dashboard reload failed', err); }
    r.paintLeft();
  });
  return true;
}
PMW.dashboard = {
  /* show a board's tab (open it when it is not open); 'new' makes a new dashboard */
  reveal: reveal,
  /* back to the default widgets: an engine board's reset (cmd.widget.reset_layout) */
  reset: function (board) {
    var r = liveRec(board);
    if (r) return resetEngine(r);
    return false;
  },
  /* the boards on screen now */
  holder: function () {
    return recList().filter(function (r) { return visible(r) && r.b; }).map(function (r) { return r.board; });
  },
  /* the built-in boards, then this project's custom dashboards */
  boards: function () { return FIXED_IDS.concat(customBoards()); },
  /* the engine board of a dashboard tab that is mounted, else null */
  board: function (id) { var r = liveRec(id); return r ? r.b : null; },
  /* a board's name, and a custom dashboard's rename (as Rename dashboard... does it; '' goes back to "Dashboard n") */
  name: function (board) { return labelOf(board); },
  rename: function (board, name) {
    var r = recList().filter(function (x) { return x.board === board && !x.gone; })[0];
    if (r) return applyName(r, name);
    if (!dashNumber(board)) return false;
    setName(board, name);
    refreshCatalog();
    return true;
  },
  /* the project the boards' keys belong to now, and a board's key in it */
  project: boardProject,
  key: function (board) { return isEngineId(board) ? storeKeyOf(board) : null; },
  /* forget a board's stores in this project (its key, its quarantine copy, a custom dashboard's name): the ONE place */
  forget: forget,
  /* every engine dashboard's store in this project, written now: { <board id>: envelope | null } (the tour's
     snapshot, D10 4.8). With an id list, only those boards (a named layout's boards, P6; a Start from's Undo). */
  snapshot: snapshotBoards,
  /* the stores written back to each board's own key (null removes one) and every mounted board read again */
  restore: restoreBoards
};

/* P6: a dashboard that leaves the reopen list is forgotten (its stores go with it), unless it is open as a tab.
   Only made dashboards (dash-<n>) are forgotten; the fixed boards keep their stores. */
function onClosedDropped(ev) {
  var ids = ev && ev.ids;
  if (!Array.isArray(ids) || !ids.length) return;
  var open = {};
  try { PM_HOME.tabs().forEach(function (t) { open[t.tabId] = true; }); } catch (_) {}
  // still in the committed reopen list (the commit that dropped it was rejected): keep it
  try { var lc = PMW.state && PMW.state.layout && PMW.state.layout.closed; (lc || []).forEach(function (c) { if (c && c.tab) open[c.tab.id] = true; }); } catch (_) {}
  ids.forEach(function (id) {
    if (typeof id !== 'string' || !DASH_TAB.test(id) || open[id]) return;
    forget(boardOf(id));
  });
}

/* P5: a project switch. 16-persist.js (watchProject, checkProject) saves the layout to the old project, binds the new
   one and restores its layout in one command, which emits 'layout' only when the two layouts differ; so this listens to
   that and to the project label itself (a moment later, once persist has bound the new project). Every mounted board
   whose tab is still in the layout takes the new project's key (setProject writes it to the old key first, then reads
   the new one; a hidden board reads at its next show). A tab the new layout no longer holds is left alone: it unmounts
   in the next render and its last write goes to the project it belonged to. */
function syncProject() {
  var p = boardProject();
  if (curProject == null) { curProject = p; return; }
  if (p === curProject) return;
  curProject = p;
  var l = PMW.state && PMW.state.layout;
  engineRecs().forEach(function (r) {
    if (l && !l.tabs[r.id]) return;
    dismissUndo(r, { instant: true });
    try { r.b.setProject(p); } catch (err) { logError('dashboard project switch failed', err); }
  });
  // the custom dashboards' names are the new project's (the same tab id can name another board there)
  recList().forEach(function (r) {
    if (r.gone || !l || !l.tabs[r.id]) return;
    r.seenLabel = tabUserLabel(r);
    if (dashNumber(r.board)) r.api.update({ label: labelOf(r.board) });
  });
  refreshCatalog();
  repaintAll();
}

/* the page's own route to a dashboard board (PM_PAGES.go('dashboard', 'Metrics')) reveals that board's tab */
function routeSubtabs() {
  if (!window.PM_PAGES || typeof PM_PAGES.registerSubtab !== 'function') return;
  var map = { main: 'home', home: 'home', metrics: 'metrics', monitoring: 'monitoring', agents: 'agents' };
  PM_PAGES.registerSubtab('dashboard', function (label) { reveal(map[String(label || 'main').toLowerCase()] || 'home'); });
}

/* Home leaving the screen: the host's page pass (90-boot.js onPageChange) sends every visible tab onHide when another
   page comes to the front and onShow when Home returns. A render pass can still reach a tab's onShow while Home is not
   the page in front (an open during the page-out animation): an engine board then waits, and the host's onShow on the
   return shows it. */
function pageActive() { var p = byId('panel-dashboard'); return !p || p.classList.contains('active'); }

/* Focus that leaves a menu or a dashboard's own controls for a card by itself. The engine ends every API move and resize
   (the preset hold after a Start from, a reload or a look change; the tour's Show me) the way a keyboard gesture ends,
   by focusing the card (40-board.js apiCommit, reported to the engine's owner). After a Start from the hold runs for
   seconds, so a person typing a preset's name or walking the Board menu with the keys lost the field to a card
   mid-word (and a typed M would pick the card up). Such a move is undone here: a card that takes focus from a PMW
   menu, the name prompt or a dashboard's header row or Undo notice gives it back, unless the person just pressed or
   pointed on a board, moved focus with Tab or F6, or the kind itself asked for it. Every other focus is left alone. */
var boardInputAt = 0, kindFocusAt = 0;
function focusCard(fn) { kindFocusAt = Date.now(); return fn(); }
function guardFocus() {
  function mark(e) {
    var t = e.target;
    if ((t && t.closest && t.closest('.pmw-dash-stage')) || (e.type === 'keydown' && (e.key === 'Tab' || e.key === 'F6'))) boardInputAt = Date.now();
  }
  doc.addEventListener('pointerdown', mark, true);
  doc.addEventListener('keydown', mark, true);
  doc.addEventListener('focusin', function (e) {
    var t = e.target, from = e.relatedTarget, now = Date.now();
    if (!from || !from.closest || !t || !t.closest || now - boardInputAt < 600 || now - kindFocusAt < 600) return;
    var stage = t.closest('.pmw-dash-stage');
    if (!stage || stage.contains(from) || !from.isConnected) return;
    if (!(from.closest('.pmw-menu') || (from.closest('.pmw-dash') && !from.closest('.pmw-dash-stage')))) return;
    try { from.focus({ preventScroll: true }); } catch (_) {}
  }, true);
}

function install() {
  routeSubtabs();
  // a layout commit: a project switch re-keys the boards, a tab rename names its board, the facts follow
  PM_HOME.on('layout', function () { syncProject(); syncNames(); repaintAll(); });
  // a closed dashboard that leaves the reopen list is forgotten (P6)
  PM_HOME.on('closed-dropped', onClosedDropped);
  guardFocus();
  var label = byId('projectMenuLabel');
  if (label && typeof MutationObserver === 'function') {
    new MutationObserver(function () { setTimeout(syncProject, 0); }).observe(label, { characterData: true, childList: true, subtree: true });
  }
  refreshCatalog();
}
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', install); else install();
