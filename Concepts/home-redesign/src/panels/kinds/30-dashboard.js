/* The Dashboard tab kind (D10 step one, brief 3.7): the page's own Home widgets, hosted in dashboard tabs.

   The page's #dashboardView (the Main, Metrics and Monitoring grids #dashGridMain, #dashGridMetrics and
   #dashGridMonitoring inside #pm6DashScroll, the catalog #pm6DashCatalog and the Add widget button #pm6DashAddBtn) is
   one node that other code holds references to (PM7_DASH_WIDGETS, the widget drag and size popover, the tour's
   widget_action step, the live demo updates). So it is never cloned: it is MOVED into the visible dashboard tab that
   shows a grid, and that tab points it at its own board by clicking the page's hidden internal tab (its Main / Metrics /
   Monitoring strip is hidden: one strip per panel, D5). Boards: dashboard:home -> Main, dashboard:metrics -> Metrics,
   dashboard:monitoring -> Monitoring; dashboard:agents is drawn here (one card per agent at work, opening its
   transcript), so it never needs the node.

   Two grid tabs visible at once (two panels): the one holding the node shows it, the other a quiet note with
   "Show it here". A tab that hides hands the node to another visible grid tab; a tab that closes parks the node back
   in #panel-dashboard (hidden by the shell CSS), never removes it. #pm6DashAddBtn itself is adopted into the holding
   tab's header row as its { id: 'add', el } action (restyled as a header button: no pill, D22); the other grid tabs
   keep an Add widget button of their own, and the page's button goes home when the node is parked.

   Columns (interim, until D10 step two): where the page's container rules give 3 columns (a 700-1060 px grid) and
   every visible widget is an even width, the third column would stand empty, so the holding tab sets 4 columns (or 2
   when a column would be under 200 px); see fitColumns below.

   Later (D10 step two) these tabs run on the Usage board engine; this file is the stand-in until then. */

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

/* ---- boards ---- */
var BOARDS = {
  home: { label: 'Home', grid: 'dashGridMain', internal: 'Main', sub: 'Run progress, lanes, results and metrics' },
  metrics: { label: 'Metrics', grid: 'dashGridMetrics', internal: 'Metrics', sub: 'Quota, budget and tokens per hour' },
  monitoring: { label: 'Monitoring', grid: 'dashGridMonitoring', internal: 'Monitoring', sub: 'Lane health and containers' },
  agents: { label: 'Agents', grid: null, internal: null, sub: 'Every agent at work and what it is doing' }
};
var BOARD_ORDER = ['home', 'metrics', 'monitoring', 'agents'];
var INTERNAL_TO_BOARD = { Main: 'home', Metrics: 'metrics', Monitoring: 'monitoring' };

function boardOf(id, st) {
  var b = st && st.board;
  if (!b && id && id.indexOf('dashboard:') === 0) b = id.slice('dashboard:'.length);
  return BOARDS[b] ? b : 'home';
}
function isGrid(board) { return !!(BOARDS[board] && BOARDS[board].grid); }

/* ---- the page's node ---- */
function node() { return byId('dashboardView'); }
/* kept by reference: while a header row hands it over (the row that let go drops it before the holder adopts it) the
   button is briefly out of the document, where getElementById cannot find it */
var addEl = null;
function addBtn() { var b = byId('pm6DashAddBtn'); if (b) addEl = b; return addEl; }
function gridCards(grid) {
  if (!grid) return [];
  return Array.prototype.filter.call(grid.children, function (c) {
    return c.classList && c.classList.contains('pm6-dash-card') && !c.classList.contains('pm6-dash-placeholder') &&
      !c.classList.contains('pm7-dash-move-placeholder') && !c.classList.contains('pm7-dash-resize-placeholder');
  });
}
function cardKey(card) { return card.getAttribute('data-widget-id') || card.getAttribute('data-widget-kind') || ''; }
function cardSize(card) {
  return { w: parseInt(card.style.getPropertyValue('--dw'), 10) || 1, h: parseInt(card.style.getPropertyValue('--dh'), 10) || 1 };
}

/* The starting widgets of each board, read once from the page's markup before PM7_DASH_WIDGETS restores a saved
   layout (this file runs at the end of <body>, before DOMContentLoaded): "Reset widgets of this board" returns to it. */
var DEFAULTS = {};
(function snapshotDefaults() {
  BOARD_ORDER.forEach(function (b) {
    if (!isGrid(b)) return;
    DEFAULTS[b] = gridCards(byId(BOARDS[b].grid)).map(function (c) {
      return { key: cardKey(c), size: cardSize(c), clone: c.cloneNode(true) };
    });
  });
})();

/* which internal board the page shows now (its hidden Main / Metrics / Monitoring strip) */
function internalTabs() { var n = node(); return n ? Array.prototype.slice.call(n.querySelectorAll('.dashboard-tabs .tab')) : []; }
function internalBoard() {
  var t = internalTabs().filter(function (x) { return x.classList.contains('active'); })[0];
  return t ? INTERNAL_TO_BOARD[t.textContent.trim()] || null : null;
}

/* ---- tabs of this kind ---- */
var recs = {};          // tabId -> rec
var owner = null;       // the rec whose stage holds the node
var expected = null;    // the board this file last pointed the node at
var stashed = null;     // the Add widget button's own attributes while it sits in a header row
var pending = null;     // a tab id that takes the node when it next shows (the page or a caller asked for its board)

function visible(rec) { return !!rec && !rec.gone && rec.api.isVisible(); }
function otherVisibleGrid(except) {
  var ids = Object.keys(recs);
  for (var i = 0; i < ids.length; i++) {
    var r = recs[ids[i]];
    if (r !== except && isGrid(r.board) && visible(r)) return r;
  }
  return null;
}

function selectBoard(board) {
  var want = BOARDS[board] && BOARDS[board].internal;
  if (!want) return;
  expected = board;
  if (internalBoard() === board) return;
  var tab = internalTabs().filter(function (t) { return t.textContent.trim() === want; })[0];
  if (tab) { tab.click(); return; }
  // no internal strip: toggle the grids the way the page does
  BOARD_ORDER.forEach(function (b) {
    var g = isGrid(b) && byId(BOARDS[b].grid);
    if (g) g.style.display = b === board ? 'contents' : 'none';
  });
}

/* the page's Add widget button: dressed as a header button while a tab's header row holds it, adopted as that row's
   { id: 'add', el } action; every other grid tab's row keeps its own Add widget button */
function dressAddButton() {
  var btn = addBtn();
  if (!btn || stashed) return btn;
  stashed = { title: btn.getAttribute('title'), parent: btn.parentNode, next: btn.nextSibling };
  btn.removeAttribute('title');
  btn.classList.add('pmw-hbtn', 'pmw-dash-add');
  btn.setAttribute('data-id', 'add');
  btn.setAttribute('data-pm-hover-label', 'Add widget');
  btn.setAttribute('data-pm-hover-detail', 'Pick one from the widget catalog');
  btn.setAttribute('data-pmh', 'icon');
  btn.setAttribute('aria-label', 'Add widget');
  var spans = btn.querySelectorAll(':scope > span');
  if (spans.length) spans[spans.length - 1].classList.add('pmw-hbtn-label');
  if (!btn.querySelector('.pmw-dash-addico')) btn.insertBefore(PMW.icon('plus', { size: 14, cls: 'pmw-dash-addico' }), btn.firstChild);
  return btn;
}
function homeAddButton() {
  var btn = addBtn();
  if (!btn || !stashed) return;
  btn.classList.remove('pmw-hbtn', 'pmw-dash-add');
  ['data-id', 'data-pm-hover-label', 'data-pm-hover-detail', 'data-pmh', 'aria-label'].forEach(function (a) { btn.removeAttribute(a); });
  if (stashed.title) btn.setAttribute('title', stashed.title);
  var ico = btn.querySelector('.pmw-dash-addico');
  if (ico) ico.remove();
  var lab = btn.querySelector('.pmw-hbtn-label');
  if (lab) lab.classList.remove('pmw-hbtn-label');
  var actions = node() && node().querySelector('.pm6-dash-actions');
  var parent = actions || stashed.parent;
  if (parent) parent.insertBefore(btn, stashed.next && stashed.next.parentNode === parent ? stashed.next : null);
  stashed = null;
}
/* every grid tab's actions again: the tabs that let go first (their row drops the adopted button), the holder last */
function syncRows() {
  var list = Object.keys(recs).map(function (id) { return recs[id]; }).filter(function (r) { return !r.gone && r.row && isGrid(r.board); });
  list.sort(function (a, b) { return (a === owner) - (b === owner); });
  list.forEach(function (r) { r.row.set({ actions: rowActions(r) }); });
}

function claim(rec) {
  var n = node();
  if (!n || !rec || rec.gone || !isGrid(rec.board)) return;
  var prev = owner;
  if (n.parentNode !== rec.stage) rec.stage.appendChild(n);
  owner = rec;
  if (rec.row) dressAddButton();
  syncRows();
  selectBoard(rec.board);
  showNote(rec, false);
  if (prev && prev !== rec && visible(prev)) showNote(prev, true);
  refreshCounts();
  watchColumns(rec);
}
function park() {
  var n = node(), page = byId('panel-dashboard');
  owner = null;
  watchColumns(null);
  syncRows();
  homeAddButton();
  // close the catalog if it was open in the tab that let go
  var cat = byId('pm6DashCatalog');
  if (cat && !cat.hidden) cat.hidden = true;
  if (n && page && n.parentNode !== page) page.appendChild(n);
}
function release(rec) {
  if (owner !== rec) return;
  var next = otherVisibleGrid(rec);
  if (next) claim(next); else park();
}

/* the page switched its board on its own (a widget was added to Main, PM_PAGES routed to a sub-board): show the tab
   for that board, so the grid never reads under another board's name */
function watchInternal() {
  var n = node();
  var strip = n && n.querySelector('.dashboard-tabs');
  if (!strip || typeof MutationObserver !== 'function') return;
  new MutationObserver(function () {
    var now = internalBoard();
    if (!now || now === expected) return;
    expected = now;
    reveal(now);
  }).observe(strip, { attributes: true, subtree: true, attributeFilter: ['class'] });
}

/* show a board's tab and give it the node, even while another panel shows a grid */
function reveal(board) {
  var id = 'dashboard:' + board;
  pending = isGrid(board) ? id : null;
  var res = PM_HOME.open({ kind: 'dashboard', id: id, board: board, label: BOARDS[board].label });
  var r = recs[id];
  if (r && isGrid(board) && visible(r)) { pending = null; claim(r); }
  return res;
}

/* widget counts for the header rows */
function countFor(board) { return isGrid(board) ? gridCards(byId(BOARDS[board].grid)).length : 0; }
function refreshCounts() {
  Object.keys(recs).forEach(function (id) { var r = recs[id]; if (r.paintLeft) r.paintLeft(); });
}
function watchGrids() {
  if (typeof MutationObserver !== 'function') return;
  var mo = new MutationObserver(function () { refreshCounts(); });
  BOARD_ORDER.forEach(function (b) { var g = isGrid(b) && byId(BOARDS[b].grid); if (g) mo.observe(g, { childList: true }); });
}

/* back to the starting widgets: widgets added from the catalog go through their own Remove (so the catalog can add
   them again), removed starting widgets come back, order and sizes return to the start */
function resetBoard(board) {
  var grid = isGrid(board) && byId(BOARDS[board].grid);
  var defs = DEFAULTS[board];
  if (!grid || !defs) return false;
  var keys = defs.map(function (d) { return d.key; });
  var have = {};
  gridCards(grid).forEach(function (c) {
    var k = cardKey(c);
    if (keys.indexOf(k) < 0) {
      var rm = c.querySelector('[data-pm6-dash="remove"]');
      if (rm) rm.click(); else c.remove();
    } else have[k] = c;
  });
  defs.forEach(function (d) {
    var c = have[d.key] || d.clone.cloneNode(true);
    c.style.setProperty('--dw', d.size.w);
    c.style.setProperty('--dh', d.size.h);
    grid.appendChild(c);
  });
  try {
    if (window.PM7_SHELL_ADJUSTMENTS && PM7_SHELL_ADJUSTMENTS.syncDashCard) gridCards(grid).forEach(function (c) { PM7_SHELL_ADJUSTMENTS.syncDashCard(c); });
  } catch (_) {}
  setTimeout(function () { try { if (window.PM7_DASH_WIDGETS && PM7_DASH_WIDGETS.persist) PM7_DASH_WIDGETS.persist(); } catch (_) {} }, 240);
  var what = BOARDS[board].label + ' board is back to its starting widgets.';
  PMW.announce(what);
  if (PMW.toast) PMW.toast(what);
  return true;
}

/* ---- columns (interim, D10 step two replaces it) ----
   The page's container rules give the grid 2 columns under 700 px, 3 from 700 and 4 from 1060. Home and Monitoring
   widgets are all two columns wide, so in the 3-column range (the Focus layout, a maximized panel) a third column stood
   empty. While a tab holds the grid and the page would give 3: 3 stays only when some visible widget has an odd width
   (Metrics: 2 + 1 + 1 tiles), else 4 when each column gets at least 200 px, else 2. Outside that range the page's rules
   decide. The count goes on #pm6DashGrid as an !important inline style, plus data-pmw-dash-cols for the card spans
   in 62-kind-dashboard.css; it is recomputed on the holder's resize, on claim, and when the visible board's widgets are
   added, removed or resized (never mid-drag or mid-resize: the end of the gesture recomputes). */
var COLS_MIN = 700, COLS_MAX = 1060, COL_MIN_W = 200;
var colWatch = { mo: null, board: null, raf: 0 };
function dashGrid() { return byId('pm6DashGrid'); }
function wantColumns() {
  var g = dashGrid();
  if (!g || !owner || owner.gone || !isGrid(owner.board) || !owner.stage.contains(g)) return 0;
  var w = g.getBoundingClientRect().width;
  if (!w) return -1;   // not laid out (hidden): keep what it has
  if (w < COLS_MIN || w >= COLS_MAX) return 0;
  var cards = gridCards(byId(BOARDS[owner.board].grid));
  if (cards.some(function (c) { return cardSize(c).w % 2 === 1; })) return 3;
  var gap = parseFloat(getComputedStyle(g).columnGap) || 8;
  return (w - 3 * gap) / 4 >= COL_MIN_W ? 4 : 2;
}
function busyGrid() {
  var root = doc.documentElement.classList;
  if (root.contains('pm7-dash-resizing') || root.contains('pm7-dash-moving')) return true;
  var g = dashGrid();
  return !!(g && g.querySelector('.pm6-is-resizing, .pm6-is-dragging'));
}
function setColumns(n) {
  var g = dashGrid();
  if (!g) return;
  var now = g.getAttribute('data-pmw-dash-cols');
  if (String(n || '') === (now || '')) return;
  if (n) {
    g.style.setProperty('grid-template-columns', 'repeat(' + n + ', minmax(0, 1fr))', 'important');
    g.setAttribute('data-pmw-dash-cols', String(n));
  } else {
    g.style.removeProperty('grid-template-columns');
    g.removeAttribute('data-pmw-dash-cols');
  }
}
function fitColumns() {
  colWatch.raf = 0;
  if (busyGrid()) return;
  var n = wantColumns();
  if (n >= 0) setColumns(n);
}
function fitColumnsSoon() {
  if (!colWatch.raf) colWatch.raf = requestAnimationFrame(fitColumns);
}
/* watch the visible board's cards (their own style and class only: the grid's style is this file's) */
function watchColumns(rec) {
  var board = rec && isGrid(rec.board) ? rec.board : null;
  if (board !== colWatch.board) {
    if (colWatch.mo) colWatch.mo.disconnect();
    colWatch.board = board;
    colWatch.mo = null;
    var host = board && byId(BOARDS[board].grid);
    if (host && typeof MutationObserver === 'function') {
      var mo = colWatch.mo = new MutationObserver(function (list) {
        var hit = false;
        list.forEach(function (m) {
          if (m.type === 'childList') { hit = true; m.addedNodes.forEach(function (c) { if (c.nodeType === 1) mo.observe(c, { attributes: true, attributeFilter: ['style', 'class'] }); }); }
          else if (m.target.parentNode === host) hit = true;
        });
        if (hit) fitColumnsSoon();
      });
      mo.observe(host, { childList: true });
      gridCards(host).forEach(function (c) { mo.observe(c, { attributes: true, attributeFilter: ['style', 'class'] }); });
    }
  }
  if (!board) { if (colWatch.raf) { cancelAnimationFrame(colWatch.raf); colWatch.raf = 0; } setColumns(0); return; }
  fitColumnsSoon();
}

/* ---- the agents board (drawn here) ---- */
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
    Object.keys(recs).forEach(function (id) { var r = recs[id]; if (r.tickAgents && r.shown) r.tickAgents(); });
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

/* ---- the quiet note a second visible grid tab shows ---- */
function buildNote(rec) {
  var show = h('button', { type: 'button', class: 'pmw-act pmw-dash-note-btn', 'data-pmh': 'icon', 'data-pm-hover-label': 'Show it here',
    'data-pm-hover-detail': 'Moves the dashboard into this panel' }, [PMW.icon('target', { size: 14 }), h('span', { text: 'Show it here' })]);
  show.addEventListener('click', function () { claim(rec); });
  var note = h('div', { class: 'pmw-dash-note', hidden: true, role: 'status' }, [
    h('div', { class: 'pmw-dash-note-col' }, [
      PMW.icon('dashboard', { size: 16, cls: 'pmw-dash-note-ico' }),
      h('p', { class: 'pmw-dash-note-t', text: 'This dashboard is open in the other panel' }),
      h('p', { class: 'pmw-dash-note-sub', text: 'One dashboard shows at a time while the widgets are shared.' }),
      show
    ])
  ]);
  rec.stage.appendChild(note);
  return note;
}
function showNote(rec, on) {
  if (!rec.note) return;
  rec.note.hidden = !on;
  rec.stage.classList.toggle('is-noted', !!on);
}

/* ---- the header row ---- */
function boardMenu(rec) {
  var sections = [{ label: 'Boards', rows: BOARD_ORDER.map(function (b) {
    return { id: 'board-' + b, label: BOARDS[b].label, sub: BOARDS[b].sub, checked: rec.board === b,
      run: function () { if (b !== rec.board) rec.api.open({ kind: 'dashboard', id: 'dashboard:' + b, board: b, label: BOARDS[b].label }); } };
  }) }];
  if (isGrid(rec.board)) {
    var rows = [];
    if (owner !== rec) rows.push({ id: 'here', label: 'Show it here', icon: 'target', sub: 'Moves the dashboard into this panel', run: function () { claim(rec); } });
    rows.push({ id: 'catalog', label: 'Add widget...', icon: 'plus', run: function () { openCatalog(rec); } });
    rows.push({ id: 'reset', label: 'Reset widgets of this board', icon: 'reopen', sub: 'Starting widgets, order and sizes', run: function () { resetBoard(rec.board); } });
    sections.push({ label: 'Widgets', rows: rows });
  } else {
    sections.push({ label: 'Show', rows: FILTERS.map(function (f) {
      return { id: 'filter-' + f.id, label: f.label, checked: (rec.filter || 'all') === f.id, run: function () { setFilter(rec, f.id); } };
    }) });
  }
  return { id: 'dash-board-menu', title: BOARDS[rec.board].label + ' board', width: 280, align: 'end', className: 'pmw-dash-menu', sections: sections };
}
function setFilter(rec, f) {
  rec.filter = f;
  if (rec.filterAgents) rec.filterAgents();
  rec.paintLeft();
  if (rec.api.saveSoon) rec.api.saveSoon();
  var lab = FILTERS.filter(function (x) { return x.id === f; })[0];
  rec.api.announce('Showing ' + (lab ? lab.label.toLowerCase() : 'all agents') + '.');
}
function openCatalog(rec) {
  if (owner !== rec) claim(rec);
  var b = addBtn();
  if (b) b.click();
}
function maxAction(rec) {
  var on = rec.api.isMaximized();
  return { label: on ? 'Restore' : 'Maximize', icon: on ? 'restore' : 'maximize', detail: 'Shift+Escape' };
}

function rowActions(rec) {
  var actions = [];
  if (isGrid(rec.board)) {
    var page = owner === rec && stashed ? addBtn() : null;
    actions.push(page ? { id: 'add', el: page }
      : { id: 'add', label: 'Add widget', icon: 'plus', detail: 'Pick one from the widget catalog', run: function () { openCatalog(rec); } });
    actions.push({ id: 'board', label: 'Board', icon: 'layout', detail: 'Boards, reset widgets', menu: function () { return boardMenu(rec); } });
  } else {
    actions.push({ id: 'board', label: 'Show', icon: 'eye', detail: 'Filter the agents, switch boards', menu: function () { return boardMenu(rec); } });
  }
  var mx = maxAction(rec);
  actions.push({ id: 'max', label: mx.label, icon: mx.icon, detail: mx.detail, run: function () {
    rec.api.toggleMaximize();
    rec.row.setAction('max', maxAction(rec));
  } });
  return actions;
}
function buildRow(rec) {
  rec.row = rec.api.headerRow({ label: BOARDS[rec.board].label + ' board controls', actions: rowActions(rec) });
  rec.paintLeft = function () {
    var left = [{ id: 'board', icon: 'dashboard', text: BOARDS[rec.board].label, strong: true }];
    if (isGrid(rec.board)) {
      var n = countFor(rec.board);
      left.push({ id: 'count', text: n + (n === 1 ? ' widget' : ' widgets'), dim: true });
    } else {
      left.push({ id: 'count', text: agentSummary(), dim: true });
      if (rec.filter && rec.filter !== 'all') {
        var lab = FILTERS.filter(function (x) { return x.id === rec.filter; })[0];
        left.push({ id: 'filter', text: 'Showing ' + (lab ? lab.label.toLowerCase() : ''), dim: true });
      }
    }
    var key = JSON.stringify(left);
    if (key === rec.leftKey) return;
    rec.leftKey = key;
    rec.row.set({ left: left });
  };
  rec.paintLeft();
  return rec.row.el;
}

/* ---- the kind ---- */
PM_HOME.registerKind('dashboard', {
  label: 'Dashboard',
  group: 'Dashboards',
  icon: 'dashboard',
  prefixes: ['dashboard:'],
  min: { w: 320, h: 120 },
  dedicated: true,
  idFor: function (spec) { return 'dashboard:' + (spec && BOARDS[spec.board] ? spec.board : 'home'); },
  labelFor: function (id, st) { return BOARDS[boardOf(id, st)].label; },
  plus: {
    order: 40,
    label: 'Dashboard',
    sub: function () { return BOARD_ORDER.map(function (b) { return { id: b, label: BOARDS[b].label, detail: BOARDS[b].sub, icon: 'dashboard' }; }); },
    spec: function (sub) { var b = BOARDS[sub] ? sub : 'home'; return { kind: 'dashboard', board: b, id: 'dashboard:' + b, label: BOARDS[b].label }; }
  },
  mount: function (host, st, api) {
    var board = boardOf(api.id, st);
    var rec = { id: api.id, api: api, board: board, filter: (st && st.filter) || 'all', host: host, gone: false, shown: false };
    recs[api.id] = rec;
    var stage = rec.stage = h('div', { class: 'pmw-dash-stage', 'data-board': board });
    var wrap = h('div', { class: 'pmw-dash', 'data-board': board }, [buildRow(rec), stage]);
    host.appendChild(wrap);
    if (isGrid(board)) rec.note = buildNote(rec);
    else mountAgents(rec);
    api.update({ label: BOARDS[board].label, title: 'Dashboard: ' + BOARDS[board].label });

    return {
      serialize: function () { var o = { board: board }; if (!isGrid(board) && rec.filter !== 'all') o.filter = rec.filter; return o; },
      onShow: function () {
        var was = rec.shown;   // the host can call onShow twice (first paint, then Home's page-shown pass)
        rec.shown = true;
        if (isGrid(board)) {
          if (pending === rec.id) { pending = null; claim(rec); }
          else if (owner && owner !== rec && visible(owner)) showNote(rec, true);
          else claim(rec);
        } else {
          if (!was) clockStart();
          rec.tickAgents();
        }
        rec.paintLeft();
      },
      onHide: function () {
        if (!rec.shown) return;
        rec.shown = false;
        if (isGrid(board)) {
          // a real hide (another tab, a collapsed or covered panel), not Home leaving the screen
          if (owner === rec && !api.isVisible()) { var next = otherVisibleGrid(rec); if (next) claim(next); }
        } else clockStop();
      },
      onResize: function () {
        var mx = maxAction(rec), el = rec.row.action('max');
        if (el && el.getAttribute('data-pm-hover-label') !== mx.label) rec.row.setAction('max', mx);
        if (owner === rec) fitColumnsSoon();
      },
      unmount: function () {
        if (!isGrid(board) && rec.shown) clockStop();
        rec.gone = true;
        delete recs[api.id];
        if (owner === rec) release(rec);
      }
    };
  }
});

PM_HOME.catalog.add('dashboard', BOARD_ORDER.map(function (b) {
  return { id: 'dashboard:' + b, label: BOARDS[b].label, sub: BOARDS[b].sub, icon: 'dashboard', keywords: 'dashboard board widgets ' + b,
    spec: { kind: 'dashboard', board: b, id: 'dashboard:' + b, label: BOARDS[b].label } };
}));

/* engine hooks for the tour and checks: reveal a board (so #pm6DashAddBtn is on screen), reset one, who holds it */
PMW.dashboard = {
  reveal: function (board) { return reveal(BOARDS[board] ? board : 'home'); },
  reset: resetBoard,
  holder: function () { return owner ? owner.id : null; },
  boards: function () { return BOARD_ORDER.slice(); }
};

/* the grid tab a person activates (strip click, open, keyboard) takes the node, even from another visible panel */
function watchActivate() {
  PM_HOME.on('activate', function (e) {
    var r = e && recs[e.tabId];
    // a grid tab opened just now is not mounted yet: it takes the node at its first show
    if (!r) { if (e && typeof e.tabId === 'string' && e.tabId.indexOf('dashboard:') === 0 && isGrid(boardOf(e.tabId))) pending = e.tabId; return; }
    if (!isGrid(r.board) || owner === r) return;
    pending = r.id;
    requestAnimationFrame(function () { if (pending === r.id && visible(r)) { pending = null; claim(r); } });
  });
}

function install() { if (!expected) expected = internalBoard(); watchInternal(); watchGrids(); watchActivate(); }
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', install); else install();
