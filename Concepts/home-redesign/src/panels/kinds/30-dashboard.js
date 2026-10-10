/* The Dashboard tab kind (D10 step two, decision A1; D10-DESIGN-per-instance-boards.md section 4).

   Dashboards run on the Usage board engine: each dashboard tab holds one board of its own, made with
   PMU.boards.create (lane A, Concepts/usage-redesign/src/js/40-board.js) inside the tab's stage. Board ids, tab ids and
   store keys:
     home        dashboard:home (the pinned Home tab)   widget_layout:v1:home
     metrics     dashboard:metrics                      widget_layout:v1:metrics
     monitoring  dashboard:monitoring                   widget_layout:v1:monitoring
     dash-<n>    dashboard:dash-<n> ("Dashboard n")     widget_layout:v1:dash-<n>
   No other id gets an engine board (the engine accepts more, so this kind restricts). The tab serializes { board } only:
   the layout, the view and the widget settings live in the board's own key, written by the engine. A dashboard has its
   own range and scope (Board menu), no "Start from" (Reset only), the plain entrance on its first show and none under
   Reduced Motion; Details on a card opens it in Usage. Live readings stay on the Usage page.

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

/* ---- boards, ids and labels ---- */
var FIXED = {
  home: { label: 'Home', sub: 'Usage widgets at a glance' },
  metrics: { label: 'Metrics', sub: 'Quota, budget and token trends' },
  monitoring: { label: 'Monitoring', sub: 'Tool health, alerts and probes' },
  agents: { label: 'Agents', sub: 'Every agent at work and what it is doing' }
};
var FIXED_IDS = ['home', 'metrics', 'monitoring', 'agents'];
var ENGINE_ID = /^(home|metrics|monitoring|dash-[1-9][0-9]{0,3})$/;
var DASH_TAB = /^dashboard:dash-([1-9][0-9]{0,3})$/;
var DASH_KEY = /^widget_layout:v1:dash-([1-9][0-9]{0,3})$/;
var KEY_PREFIX = 'widget_layout:v1:';
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
function labelOf(b) { return FIXED[b] ? FIXED[b].label : dashNumber(b) ? 'Dashboard ' + dashNumber(b) : 'Dashboard'; }
/* the name a person sees: their rename of the tab, else the board's label */
function nameOf(rec) {
  var l = PMW.state && PMW.state.layout, t = l && l.tabs[rec.id];
  return (t && t.userLabel) || labelOf(rec.board);
}
function engineReady() { return !!(window.PMU && PMU.boards && typeof PMU.boards.create === 'function'); }

/* a new dashboard's id: one more than the largest n over the open tabs, the reopen stack, the stored boards and the
   live ones (like the browser kind's nextBrowserId), so a closed dashboard's widgets are never handed to a new one */
function mintId() {
  var max = 0;
  function see(s, rx) { var m = rx.exec(s || ''); if (m) max = Math.max(max, +m[1]); }
  try { PM_HOME.tabs().forEach(function (t) { see(t.tabId, DASH_TAB); }); } catch (_) {}
  try { var l = PMW.state && PMW.state.layout; ((l && l.closed) || []).forEach(function (c) { see(c && c.tab && c.tab.id, DASH_TAB); }); } catch (_) {}
  try { for (var i = 0; i < localStorage.length; i++) see(localStorage.key(i), DASH_KEY); } catch (_) {}
  try { if (engineReady()) PMU.boards.all().forEach(function (b) { see('dashboard:' + b.id, DASH_TAB); }); } catch (_) {}
  return max >= 9999 ? 'dashboard:home' : 'dashboard:dash-' + (max + 1);
}

/* ---- tabs of this kind ---- */
var recs = {};          // tabId -> rec
function recList() { return Object.keys(recs).map(function (id) { return recs[id]; }); }
function engineRecs() { return recList().filter(function (r) { return !r.gone && r.b; }); }
function visible(rec) { return !!rec && !rec.gone && rec.api.isVisible(); }
function repaintAll() { recList().forEach(function (r) { if (!r.gone && r.paintLeft) r.paintLeft(); }); }

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
  var opts = {
    id: rec.board, hostId: 'home.dashboard', mount: rec.stage, overlay: PMW.overlay(),
    rooms: false, film: false, resize: 'host', shown: false,
    announce: function (text) { rec.api.announce(text); },
    details: function (spec, opener) { var id = widgetOf(spec, opener); openInUsage(id, id && rec.b ? homeRoomOf(rec.b, id) : null, spec); },
    navigate: function (room) { openInUsage(null, room); }
  };
  /* P7: the plain reading-order entrance on a board's first show, none under Reduced Motion (read when it mounts) */
  Object.defineProperty(opts, 'entrance', { enumerable: true, get: function () { return PMW.reduced() ? 'none' : 'plain'; } });
  var b = null;
  try { b = PMU.boards.create(opts); } catch (err) { try { console.error('[pm-home] dashboard board failed', err); } catch (_) {} }
  if (!b) { showNote(rec, 'This dashboard could not be shown', 'Close it and open it again from +.'); return; }
  rec.b = b;
  rec.offs = ['mount', 'commit', 'change', 'class'].map(function (e) { return b.on(e, function () { rec.paintLeft(); }); });
}

/* Add widget: every Usage widget the board can be given, by Usage room in room order; one on the board already is
   checked and disabled. A pick adds it (cmd.widget.add), scrolls to it and moves focus onto it. */
function addPicker(rec, anchor) {
  var b = rec.b;
  if (!b) return null;
  var list = [];
  try { list = b.catalog() || []; } catch (err) { try { console.error('[pm-home] dashboard catalog failed', err); } catch (_) {} }
  var sections = [], byRoom = {};
  list.forEach(function (e) {
    var key = e.homeRoom || '';
    var sec = byRoom[key];
    if (!sec) { sec = byRoom[key] = { label: e.homeRoomLabel || 'More widgets', rows: [] }; sections.push(sec); }
    var word = KIND_WORDS[e.kind] || '';
    sec.rows.push({
      id: 'w-' + e.id, label: e.title, sub: [e.homeRoomLabel, word].filter(Boolean).join(' · '),
      checked: !!e.on, disabled: !!e.on, reason: 'Already on this dashboard',
      keywords: [e.id, e.kind, word, e.homeRoomLabel].filter(Boolean).join(' '),
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
  if (card && card.focus) { try { card.focus({ preventScroll: true }); } catch (_) {} }
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
function resetEngine(rec) {
  var b = rec.b;
  if (!b) return null;
  var r = b.reset('room');
  var what = nameOf(rec) + ' is back to its starting widgets.';
  rec.api.announce(what);
  if (PMW.toast) PMW.toast(what);
  return r;
}
/* Delete dashboard (dash-<n> only): the tab closes, its key goes (after the board's last write, in unmount) and it
   leaves the reopen stack, so Reopen closed tab cannot bring back an empty copy */
function deleteDash(rec) {
  if (!dashNumber(rec.board)) return;
  var id = rec.id, name = nameOf(rec);
  rec.deleting = true;
  PMW.closeTab(id, { quiet: true }).then(function (ok) {
    if (!ok) { rec.deleting = false; return; }
    if (rec.gone) forget(rec.board);
    var l = PMW.state && PMW.state.layout;
    if (l && l.closed) {
      var kept = l.closed.filter(function (c) { return !(c && c.tab && c.tab.id === id); });
      if (kept.length !== l.closed.length) { l.closed = kept; if (PMW.persist && PMW.persist.saveSoon) PMW.persist.saveSoon(); }
    }
    PMW.announce(name + ' deleted');
  });
}
/* forget: the ONE place that knows a board's store keys (its layout and its quarantine copy). Delete dashboard and
   the closed-list drop (P6) both go through it. */
function forget(board) {
  try { localStorage.removeItem(KEY_PREFIX + board); localStorage.removeItem(KEY_PREFIX + board + ':quarantine'); } catch (_) {}
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

/* ==================================================================================================================
   The header row (every dashboard tab)
   ================================================================================================================== */
function openBoard(rec, b) {
  if (b === 'new') { rec.api.open({ kind: 'dashboard', board: 'new' }); return; }
  if (b === rec.board) return;
  rec.api.open({ kind: 'dashboard', id: 'dashboard:' + b, board: b, label: labelOf(b) });
}
function boardRows(rec) {
  var rows = FIXED_IDS.map(function (b) {
    return { id: 'board-' + b, label: FIXED[b].label, sub: FIXED[b].sub, checked: rec.board === b, run: function () { openBoard(rec, b); } };
  });
  var dash = [];
  try { dash = PM_HOME.tabs().filter(function (t) { return DASH_TAB.test(t.tabId); }); } catch (_) {}
  dash.sort(function (a, c) { return dashNumber(boardOf(a.tabId)) - dashNumber(boardOf(c.tabId)); });
  dash.forEach(function (t) {
    var b = boardOf(t.tabId);
    rows.push({ id: 'board-' + b, label: t.label || labelOf(b), checked: rec.board === b, run: function () { openBoard(rec, b); } });
  });
  rows.push({ id: 'board-new', label: 'New dashboard', icon: 'plus', sub: NEW_SUB, run: function () { openBoard(rec, 'new'); } });
  return rows;
}
function boardMenu(rec) {
  var sections = [{ label: 'Boards', rows: boardRows(rec) }];
  if (rec.type === 'engine' && rec.b) {
    var b = rec.b, st = b.state || {};
    var rows = [
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
      { id: 'tidy', label: 'Tidy', icon: 'layout', sub: 'Close the gaps between widgets', run: function () { b.tidy(); } },
      { id: 'reset', label: 'Reset widgets', icon: 'reopen', sub: dashNumber(rec.board) ? 'Back to an empty dashboard' : 'Back to its starting widgets', run: function () { resetEngine(rec); } }
    ];
    if (dashNumber(rec.board)) {
      rows.push({ id: 'delete', label: 'Delete dashboard...', icon: 'cross', danger: true, sub: 'Closes it and forgets its widgets', submenu: function () {
        return { id: 'dash-delete', title: 'Delete ' + nameOf(rec) + '?', rows: [
          { id: 'delete-yes', label: 'Delete dashboard', icon: 'cross', danger: true, sub: 'Its widgets cannot be brought back', run: function () { deleteDash(rec); } },
          { id: 'delete-no', label: 'Keep it', icon: 'check', run: function () {} }
        ] };
      } });
    }
    sections.push({ label: 'This dashboard', rows: rows });
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
    actions.push({ id: 'add', label: 'Add widget', icon: 'plus', detail: 'Pick one of the Usage widgets', run: function (e, button) { addPicker(rec, button); } });
    actions.push({ id: 'board', label: 'Board', icon: 'layout', detail: 'Boards, range, scope, tidy, reset', menu: function () { return boardMenu(rec); } });
  } else if (rec.type === 'agents') {
    actions.push({ id: 'board', label: 'Show', icon: 'eye', detail: 'Filter the agents, switch boards', menu: function () { return boardMenu(rec); } });
  } else {
    actions.push({ id: 'board', label: 'Board', icon: 'layout', detail: 'Switch boards', menu: function () { return boardMenu(rec); } });
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
  if (rec.type === 'engine' && rec.b) {
    try { n = rec.b.count(); } catch (_) { n = 0; }
    left.push({ id: 'count', text: n + (n === 1 ? ' widget' : ' widgets'), dim: true });
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
  plus: {
    order: 40,
    label: 'Dashboard',
    subMax: 5,
    sub: function () {
      return FIXED_IDS.map(function (b) { return { id: b, label: FIXED[b].label, detail: FIXED[b].sub, icon: 'dashboard' }; })
        .concat([{ id: 'new', label: 'New dashboard', detail: NEW_SUB, icon: 'plus' }]);
    },
    spec: function (sub) {
      if (sub === 'new') return { kind: 'dashboard', board: 'new' };
      var b = FIXED[sub] ? sub : 'home';
      return { kind: 'dashboard', board: b, id: 'dashboard:' + b, label: FIXED[b].label };
    }
  },
  mount: function (host, st, api) {
    var board = boardOf(api.id, st), type = isBoard(board) ? typeOf(board) : 'refused';
    var rec = { id: api.id, api: api, board: board, type: type, filter: (st && st.filter) || 'all', host: host, gone: false, shown: false, b: null, offs: [] };
    recs[api.id] = rec;
    var stage = rec.stage = h('div', { class: 'pmw-dash-stage', 'data-board': board, 'data-kind': type });
    var wrap = h('div', { class: 'pmw-dash', 'data-board': board }, [null, stage]);
    host.appendChild(wrap);
    if (type === 'engine') mountEngine(rec);
    else if (type === 'agents') mountAgents(rec);
    else if (type === 'fallback') showNote(rec, 'Usage widgets are not available in this build', 'The other dashboards and the panels work as usual.');
    else if (type === 'refused') showNote(rec, 'This dashboard is not part of this build', 'Open Home, Metrics, Monitoring or a new dashboard from the Board menu.');
    wrap.insertBefore(buildRow(rec), stage);
    var name = nameOf(rec);
    api.update({ label: labelOf(board), title: 'Dashboard: ' + name, icon: 'dashboard' });

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
      },
      onResize: function (size) {
        refreshMax(rec);
        if (rec.b) rec.b.hostResize(size);
      },
      onLook: function (look) { if (rec.b) rec.b.relook(look); },
      wantsKey: function () { return !!(rec.b && rec.b.gesture()); },
      /* an open of this tab: { widget } scrolls an engine board to that card */
      reveal: function (fields) {
        if (!fields) return;
        if (rec.b && typeof fields.widget === 'string') rec.b.reveal(fields.widget);
      },
      unmount: function () {
        if (type === 'agents' && rec.clockOn) { rec.clockOn = false; clockStop(); }
        rec.gone = true;
        delete recs[api.id];
        rec.offs.splice(0).forEach(function (off) { try { off(); } catch (_) {} });
        if (rec.b) { try { rec.b.destroy(); } catch (err) { try { console.error('[pm-home] dashboard board destroy failed', err); } catch (_) {} } }
        if (rec.deleting) forget(board);
      }
    };
    /* keyboard focus on an engine board: its first card in reading order, else Add widget (the other tabs take the
       host's default, their panel) */
    if (type === 'engine') inst.focus = function () {
      if (rec.b && rec.b.focus()) return;
      var add = rec.row && rec.row.action('add');
      if (add && add.focus) add.focus({ preventScroll: true });
    };
    return inst;
  }
});

PM_HOME.catalog.add('dashboard', FIXED_IDS.map(function (b) {
  return { id: 'dashboard:' + b, label: FIXED[b].label, sub: FIXED[b].sub, icon: 'dashboard', keywords: 'dashboard board widgets ' + b,
    spec: { kind: 'dashboard', board: b, id: 'dashboard:' + b, label: FIXED[b].label } };
}).concat([{ id: 'dashboard:new', label: 'New dashboard', sub: NEW_SUB, icon: 'dashboard', keywords: 'dashboard board widgets new empty',
  spec: { kind: 'dashboard', board: 'new' } }]));

/* ---- engine hooks for the tour and checks ---- */
function reveal(board) {
  if (board === 'new') return PM_HOME.open({ kind: 'dashboard', board: 'new' });
  if (!isBoard(board)) board = 'home';
  return PM_HOME.open({ kind: 'dashboard', id: 'dashboard:' + board, board: board, label: labelOf(board) });
}
/* the stored dashboards: every key of an engine board id, plus the live boards' (a board not written yet reads null) */
function storedBoards() {
  var ids = {};
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(KEY_PREFIX) === 0 && isEngineId(k.slice(KEY_PREFIX.length))) ids[k.slice(KEY_PREFIX.length)] = true;
    }
  } catch (_) {}
  engineRecs().forEach(function (r) { ids[r.board] = true; });
  return Object.keys(ids);
}
function readKey(board) {
  try { var v = localStorage.getItem(KEY_PREFIX + board); return v == null ? null : JSON.parse(v); } catch (_) { return null; }
}
PMW.dashboard = {
  /* show a board's tab (open it when it is not open); 'new' makes a new dashboard */
  reveal: reveal,
  /* back to the starting widgets: an engine board's reset (cmd.widget.reset_layout) */
  reset: function (board) {
    var r = recList().filter(function (x) { return x.board === board && !x.gone; })[0];
    if (r && r.b) return resetEngine(r);
    return false;
  },
  /* the boards on screen now */
  holder: function () {
    return recList().filter(function (r) { return visible(r) && r.b; }).map(function (r) { return r.board; });
  },
  boards: function () {
    var out = FIXED_IDS.slice();
    try { PM_HOME.tabs().forEach(function (t) { if (DASH_TAB.test(t.tabId)) out.push(boardOf(t.tabId)); }); } catch (_) {}
    return out;
  },
  /* the engine board of a dashboard tab that is mounted, else null */
  board: function (id) { var r = engineRecs().filter(function (x) { return x.board === id; })[0]; return r ? r.b : null; },
  /* forget a board's stores (its layout and its quarantine copy): the ONE place that knows the keys */
  forget: forget,
  /* every engine dashboard's store, written now: { <board id>: envelope | null } (the tour's snapshot, D10 4.8).
     With an id list, only those boards (a named layout's boards, P6). */
  snapshot: function (ids) {
    engineRecs().forEach(function (r) { try { r.b.flush(); } catch (_) {} });
    var list = Array.isArray(ids) ? ids.filter(isEngineId) : storedBoards();
    var out = {};
    list.forEach(function (id) { out[id] = readKey(id); });
    return out;
  },
  /* the stores written back (null removes one) and every mounted board read again */
  restore: function (snap) {
    if (!snap || typeof snap !== 'object') return false;
    Object.keys(snap).forEach(function (id) {
      if (!isEngineId(id)) return;
      try {
        if (snap[id] == null) localStorage.removeItem(KEY_PREFIX + id);
        else localStorage.setItem(KEY_PREFIX + id, JSON.stringify(snap[id]));
      } catch (_) {}
    });
    engineRecs().forEach(function (r) {
      if (!Object.prototype.hasOwnProperty.call(snap, r.board)) return;
      try { r.b.reload(); } catch (err) { try { console.error('[pm-home] dashboard reload failed', err); } catch (_) {} }
      r.paintLeft();
    });
    return true;
  }
};

/* P6: a dashboard that leaves the reopen list is forgotten (its stores go with it), unless it is open as a tab.
   Only made dashboards (dash-<n>) are forgotten; the fixed boards keep their stores. */
function onClosedDropped(ev) {
  var ids = ev && ev.ids;
  if (!Array.isArray(ids) || !ids.length) return;
  var open = {};
  try { PM_HOME.tabs().forEach(function (t) { open[t.tabId] = true; }); } catch (_) {}
  ids.forEach(function (id) {
    if (typeof id !== 'string' || !DASH_TAB.test(id) || open[id]) return;
    forget(boardOf(id));
  });
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

function install() {
  // ?home=current keeps today's Home: the page's own dashboard code runs as published
  if (doc.documentElement.getAttribute('data-pmw-home') !== 'on') return;
  routeSubtabs();
  // a rename (a layout commit) shows in the header facts
  PM_HOME.on('layout', repaintAll);
  // a closed dashboard that leaves the reopen list is forgotten (P6)
  PM_HOME.on('closed-dropped', onClosedDropped);
}
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', install); else install();
