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

   Two boards are not on the engine:
   - agents (dashboard:agents) is drawn here: one card per agent at work, opening its transcript.
   - current (dashboard:current, "Home (current)") keeps the page's own Home widgets until the Orchestrator redesign. The
     page's #dashboardView (the Main, Metrics and Monitoring grids inside #pm6DashScroll, the catalog #pm6DashCatalog
     and the Add widget button #pm6DashAddBtn) is one node other code holds references to (PM7_DASH_WIDGETS, the widget
     drag and size popover, the tour's widget_action step, the live demo updates), so it is never cloned: it is MOVED
     into the Home (current) tab, which points it at Main, Metrics or Monitoring (its Board menu) by clicking the page's
     hidden internal tab, and it parks back in #panel-dashboard when the tab closes. #pm6DashAddBtn is adopted into that
     tab's header row as its { id: 'add', el } action (restyled as a header button: no pill, D22). Where the page's
     container rules give 3 columns (a 700-1060 px grid) and every visible widget is an even width, the third column
     would stand empty, so the tab sets 4 columns (or 2 when a column would be under 200 px); see fitColumns.

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
  agents: { label: 'Agents', sub: 'Every agent at work and what it is doing' },
  current: { label: 'Home (current)', sub: 'Run progress, lanes, results and metrics' }
};
var FIXED_ORDER = ['home', 'metrics', 'monitoring', 'agents', 'current'];
var ENGINE_ID = /^(home|metrics|monitoring|dash-[1-9][0-9]{0,3})$/;
var DASH_TAB = /^dashboard:dash-([1-9][0-9]{0,3})$/;
var DASH_KEY = /^widget_layout:v1:dash-([1-9][0-9]{0,3})$/;
var KEY_PREFIX = 'widget_layout:v1:';
var NEW_SUB = 'An empty board for widgets you pick';

function isEngineId(b) { return typeof b === 'string' && ENGINE_ID.test(b); }
function allowed(b) { return isEngineId(b) || b === 'agents' || b === 'current'; }
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

/* ==================================================================================================================
   Home (current): the page's own widgets (#dashboardView), adopted
   ================================================================================================================== */
var LEGACY = {
  main: { label: 'Main', grid: 'dashGridMain', internal: 'Main' },
  metrics: { label: 'Metrics', grid: 'dashGridMetrics', internal: 'Metrics' },
  monitoring: { label: 'Monitoring', grid: 'dashGridMonitoring', internal: 'Monitoring' }
};
var LEGACY_ORDER = ['main', 'metrics', 'monitoring'];
var INTERNAL_TO_SUB = { Main: 'main', Metrics: 'metrics', Monitoring: 'monitoring' };

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

/* The starting widgets of each internal board, read once from the page's markup before PM7_DASH_WIDGETS restores a
   saved layout (this file runs at the end of <body>, before DOMContentLoaded): "Reset widgets of this board" returns
   to it. */
var DEFAULTS = {};
(function snapshotDefaults() {
  LEGACY_ORDER.forEach(function (s) {
    DEFAULTS[s] = gridCards(byId(LEGACY[s].grid)).map(function (c) {
      return { key: cardKey(c), size: cardSize(c), clone: c.cloneNode(true) };
    });
  });
})();

/* which internal board the page shows now (its hidden Main / Metrics / Monitoring strip) */
function internalTabs() { var n = node(); return n ? Array.prototype.slice.call(n.querySelectorAll('.dashboard-tabs .tab')) : []; }
function internalBoard() {
  var t = internalTabs().filter(function (x) { return x.classList.contains('active'); })[0];
  return t ? INTERNAL_TO_SUB[t.textContent.trim()] || null : null;
}

var owner = null;       // the Home (current) rec whose stage holds the node (one tab per id: at most one)
var expected = null;    // the internal board this file last pointed the node at
var stashed = null;     // the Add widget button's own attributes while it sits in a header row

function selectSub(sub) {
  var want = LEGACY[sub] && LEGACY[sub].internal;
  if (!want) return;
  expected = sub;
  if (internalBoard() === sub) return;
  var tab = internalTabs().filter(function (t) { return t.textContent.trim() === want; })[0];
  if (tab) { tab.click(); return; }
  // no internal strip: toggle the grids the way the page does
  LEGACY_ORDER.forEach(function (s) {
    var g = byId(LEGACY[s].grid);
    if (g) g.style.display = s === sub ? 'contents' : 'none';
  });
}

/* the page's Add widget button: dressed as a header button while the Home (current) row holds it, adopted as that
   row's { id: 'add', el } action */
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
function syncCurrentRow(rec) { if (rec && !rec.gone && rec.row) rec.row.set({ actions: rowActions(rec) }); }

function claim(rec) {
  var n = node();
  if (!n || !rec || rec.gone || rec.type !== 'current') return;
  if (n.parentNode !== rec.stage) rec.stage.appendChild(n);
  owner = rec;
  if (rec.row) dressAddButton();
  syncCurrentRow(rec);
  selectSub(rec.sub);
  rec.paintLeft();
  watchColumns(rec);
}
function park(rec) {
  var n = node(), page = byId('panel-dashboard');
  if (owner !== rec) return;
  owner = null;
  watchColumns(null);
  syncCurrentRow(rec);
  homeAddButton();
  // close the catalog if it was open in the tab that let go
  var cat = byId('pm6DashCatalog');
  if (cat && !cat.hidden) cat.hidden = true;
  if (n && page && n.parentNode !== page) page.appendChild(n);
}

/* the page switched its internal board on its own (a widget was added to Main): the Home (current) tab follows, so its
   header never names another board than the one it shows */
function watchInternal() {
  var n = node();
  var strip = n && n.querySelector('.dashboard-tabs');
  if (!strip || typeof MutationObserver !== 'function') return;
  new MutationObserver(function () {
    var now = internalBoard();
    if (!now || now === expected) return;
    expected = now;
    recList().forEach(function (r) {
      if (r.gone || r.type !== 'current') return;
      r.sub = now;
      r.paintLeft();
      if (r.api.saveSoon) r.api.saveSoon();
    });
  }).observe(strip, { attributes: true, subtree: true, attributeFilter: ['class'] });
}
/* widget counts for the Home (current) header */
function countFor(sub) { return LEGACY[sub] ? gridCards(byId(LEGACY[sub].grid)).length : 0; }
function watchGrids() {
  if (typeof MutationObserver !== 'function') return;
  var mo = new MutationObserver(function () { recList().forEach(function (r) { if (r.type === 'current' && r.paintLeft) r.paintLeft(); }); });
  LEGACY_ORDER.forEach(function (s) { var g = byId(LEGACY[s].grid); if (g) mo.observe(g, { childList: true }); });
}

/* back to the starting widgets: widgets added from the catalog go through their own Remove (so the catalog can add
   them again), removed starting widgets come back, order and sizes return to the start */
function resetLegacy(sub) {
  var grid = LEGACY[sub] && byId(LEGACY[sub].grid);
  var defs = DEFAULTS[sub];
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
  var what = LEGACY[sub].label + ' board is back to its starting widgets.';
  PMW.announce(what);
  if (PMW.toast) PMW.toast(what);
  return true;
}
function openCatalog(rec) {
  if (owner !== rec) claim(rec);
  var b = addBtn();
  if (b) b.click();
}

/* ---- columns of the adopted grid (interim, until the old widgets retire) ----
   The page's container rules give the grid 2 columns under 700 px, 3 from 700 and 4 from 1060. Main and Monitoring
   widgets are all two columns wide, so in the 3-column range (the Focus layout, a maximized panel) a third column stood
   empty. While the tab holds the grid and the page would give 3: 3 stays only when some visible widget has an odd width
   (Metrics: 2 + 1 + 1 tiles), else 4 when each column gets at least 200 px, else 2. Outside that range the page's rules
   decide. The count goes on #pm6DashGrid as an !important inline style, plus data-pmw-dash-cols for the card spans
   in 62-kind-dashboard.css; it is recomputed on the holder's resize, on claim, and when the visible board's widgets are
   added, removed or resized (never mid-drag or mid-resize: the end of the gesture recomputes). */
var COLS_MIN = 700, COLS_MAX = 1060, COL_MIN_W = 200;
var colWatch = { mo: null, sub: null, raf: 0 };
function dashGrid() { return byId('pm6DashGrid'); }
function wantColumns() {
  var g = dashGrid();
  if (!g || !owner || owner.gone || !owner.stage.contains(g)) return 0;
  var w = g.getBoundingClientRect().width;
  if (!w) return -1;   // not laid out (hidden): keep what it has
  if (w < COLS_MIN || w >= COLS_MAX) return 0;
  var cards = gridCards(byId(LEGACY[owner.sub].grid));
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
/* watch the visible internal board's cards (their own style and class only: the grid's style is this file's) */
function watchColumns(rec) {
  var sub = rec && LEGACY[rec.sub] ? rec.sub : null;
  if (sub !== colWatch.sub) {
    if (colWatch.mo) colWatch.mo.disconnect();
    colWatch.sub = sub;
    colWatch.mo = null;
    var host = sub && byId(LEGACY[sub].grid);
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
  if (!sub) { if (colWatch.raf) { cancelAnimationFrame(colWatch.raf); colWatch.raf = 0; } setColumns(0); return; }
  fitColumnsSoon();
}

/* plain words: the page's demo widgets write internal field names into their text (the Budget card's
   "effective_account: jared@main", the custom metric's "query: planunits_built · refresh 30s", which its live updates
   write again, and the catalog's Budget donuts "effective_account_id"). Text under #dashboardView is reworded as it
   appears, so no tab shows a key. */
var PLAIN = [
  [/ · query: [a-z_]+/g, ''],
  [/\brefresh (\d+)s\b/g, 'refreshed every $1 s'],
  [/ cycle · effective_account: /g, ' this cycle · account '],
  [/cost attributed to effective_account_id · /g, 'cost charged to account ']
];
function plainText(t) {
  var v = t.nodeValue, w = v;
  if (!w || w.indexOf('_') < 0 && w.indexOf('refresh ') < 0) return;
  PLAIN.forEach(function (p) { w = w.replace(p[0], p[1]); });
  if (w !== v) t.nodeValue = w;
}
function plainWords(root) {
  if (!root) return;
  if (root.nodeType === 3) { plainText(root); return; }
  if (root.nodeType !== 1) return;
  var walk = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT), t;
  while ((t = walk.nextNode())) plainText(t);
}
function watchWords() {
  var n = node();
  if (!n) return;
  plainWords(n);
  if (typeof MutationObserver !== 'function') return;
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      if (m.type === 'characterData') plainText(m.target);
      else m.addedNodes.forEach(plainWords);
    });
  }).observe(n, { childList: true, characterData: true, subtree: true });
}

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
    if (rec.gone) dropKey(rec.board);
    var l = PMW.state && PMW.state.layout;
    if (l && l.closed) {
      var kept = l.closed.filter(function (c) { return !(c && c.tab && c.tab.id === id); });
      if (kept.length !== l.closed.length) { l.closed = kept; if (PMW.persist && PMW.persist.saveSoon) PMW.persist.saveSoon(); }
    }
    PMW.announce(name + ' deleted');
  });
}
function dropKey(board) {
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
  var rows = FIXED_ORDER.map(function (b) {
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
  } else if (rec.type === 'current') {
    sections.push({ label: 'This board', rows: LEGACY_ORDER.map(function (s) {
      return { id: 'sub-' + s, label: LEGACY[s].label, checked: rec.sub === s, run: function () { setSub(rec, s); } };
    }) });
    sections.push({ label: 'Widgets', rows: [
      { id: 'catalog', label: 'Add widget...', icon: 'plus', run: function () { openCatalog(rec); } },
      { id: 'reset', label: 'Reset widgets of this board', icon: 'reopen', sub: 'Starting widgets, order and sizes', run: function () { resetLegacy(rec.sub); } }
    ] });
  } else if (rec.type === 'agents') {
    sections.push({ label: 'Show', rows: FILTERS.map(function (f) {
      return { id: 'filter-' + f.id, label: f.label, checked: (rec.filter || 'all') === f.id, run: function () { setFilter(rec, f.id); } };
    }) });
  }
  return { id: 'dash-board-menu', title: nameOf(rec), width: 320, align: 'end', className: 'pmw-dash-menu', sections: sections };
}
function setSub(rec, s) {
  if (!LEGACY[s]) return;
  rec.sub = s;
  if (owner === rec) { selectSub(s); watchColumns(rec); } else claim(rec);
  rec.paintLeft();
  if (rec.api.saveSoon) rec.api.saveSoon();
  rec.api.announce('Showing the ' + LEGACY[s].label + ' board.');
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
  } else if (rec.type === 'current') {
    var page = owner === rec && stashed ? addBtn() : null;
    actions.push(page ? { id: 'add', el: page }
      : { id: 'add', label: 'Add widget', icon: 'plus', detail: 'Pick one from the widget catalog', run: function () { openCatalog(rec); } });
    actions.push({ id: 'board', label: 'Board', icon: 'layout', detail: 'Boards, Main, Metrics, Monitoring, reset widgets', menu: function () { return boardMenu(rec); } });
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
  } else if (rec.type === 'current') {
    n = countFor(rec.sub);
    left.push({ id: 'sub', text: LEGACY[rec.sub] ? LEGACY[rec.sub].label : 'Main', dim: true });
    left.push({ id: 'count', text: n + (n === 1 ? ' widget' : ' widgets'), dim: true });
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
  if (board === 'current') return 'current';
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
    return 'dashboard:' + (allowed(b) ? b : 'home');
  },
  canonical: function (id) { return id === 'dashboard:new' ? mintId() : null; },
  labelFor: function (id, st) { var b = boardOf(id, st); return allowed(b) ? labelOf(b) : 'Dashboard'; },
  iconFor: function () { return 'dashboard'; },
  plus: {
    order: 40,
    label: 'Dashboard',
    subMax: 6,
    sub: function () {
      return FIXED_ORDER.map(function (b) { return { id: b, label: FIXED[b].label, detail: FIXED[b].sub, icon: 'dashboard' }; })
        .concat([{ id: 'new', label: 'New dashboard', detail: NEW_SUB, icon: 'plus' }]);
    },
    spec: function (sub) {
      if (sub === 'new') return { kind: 'dashboard', board: 'new' };
      var b = FIXED[sub] ? sub : 'home';
      return { kind: 'dashboard', board: b, id: 'dashboard:' + b, label: FIXED[b].label };
    }
  },
  mount: function (host, st, api) {
    var board = boardOf(api.id, st), type = allowed(board) ? typeOf(board) : 'refused';
    var rec = { id: api.id, api: api, board: board, type: type, filter: (st && st.filter) || 'all', host: host, gone: false, shown: false, b: null, offs: [] };
    if (type === 'current') rec.sub = st && LEGACY[st.sub] ? st.sub : 'main';
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
        if (type === 'current' && rec.sub) o.sub = rec.sub;
        return o;
      },
      onShow: function () {
        rec.shown = true;
        if (rec.b) { if (pageActive()) rec.b.show(); }
        else if (type === 'current') claim(rec);
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
        else if (owner === rec) fitColumnsSoon();
      },
      onLook: function (look) { if (rec.b) rec.b.relook(look); },
      wantsKey: function () { return !!(rec.b && rec.b.gesture()); },
      /* an open of this tab: { widget } scrolls an engine board to that card, { sub } points Home (current) at Main,
         Metrics or Monitoring */
      reveal: function (fields) {
        if (!fields) return;
        if (rec.b && typeof fields.widget === 'string') rec.b.reveal(fields.widget);
        else if (type === 'current' && LEGACY[fields.sub] && fields.sub !== rec.sub) setSub(rec, fields.sub);
      },
      unmount: function () {
        if (type === 'agents' && rec.clockOn) { rec.clockOn = false; clockStop(); }
        rec.gone = true;
        delete recs[api.id];
        rec.offs.splice(0).forEach(function (off) { try { off(); } catch (_) {} });
        if (rec.b) { try { rec.b.destroy(); } catch (err) { try { console.error('[pm-home] dashboard board destroy failed', err); } catch (_) {} } }
        if (rec.deleting) dropKey(board);
        if (owner === rec) park(rec);
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

PM_HOME.catalog.add('dashboard', FIXED_ORDER.map(function (b) {
  return { id: 'dashboard:' + b, label: FIXED[b].label, sub: FIXED[b].sub, icon: 'dashboard', keywords: 'dashboard board widgets ' + b + (b === 'current' ? ' main' : ''),
    spec: { kind: 'dashboard', board: b, id: 'dashboard:' + b, label: FIXED[b].label } };
}).concat([{ id: 'dashboard:new', label: 'New dashboard', sub: NEW_SUB, icon: 'dashboard', keywords: 'dashboard board widgets new empty',
  spec: { kind: 'dashboard', board: 'new' } }]));

/* ---- engine hooks for the tour and checks ---- */
function reveal(board, o) {
  if (board === 'new') return PM_HOME.open({ kind: 'dashboard', board: 'new' });
  if (!allowed(board)) board = 'home';
  var spec = { kind: 'dashboard', id: 'dashboard:' + board, board: board, label: labelOf(board) };
  if (board === 'current' && o && LEGACY[o.sub]) spec.sub = o.sub;
  return PM_HOME.open(spec);
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
  /* show a board's tab (open it when it is not open); 'new' makes a new dashboard; reveal('current', { sub: 'metrics' })
     also points Home (current) at one of its boards */
  reveal: reveal,
  /* back to the starting widgets: an engine board's reset (cmd.widget.reset_layout), or one of Home (current)'s boards */
  reset: function (board, sub) {
    var r = recList().filter(function (x) { return x.board === board && !x.gone; })[0];
    if (r && r.b) return resetEngine(r);
    if (board === 'current') return resetLegacy(LEGACY[sub] ? sub : (r && r.sub) || 'main');
    return false;
  },
  /* the boards on screen now (the Home (current) tab counts while it holds the page's widgets) */
  holder: function () {
    return recList().filter(function (r) { return visible(r) && (r.b || (r.type === 'current' && owner === r)); }).map(function (r) { return r.board; });
  },
  boards: function () {
    var out = FIXED_ORDER.slice();
    try { PM_HOME.tabs().forEach(function (t) { if (DASH_TAB.test(t.tabId)) out.push(boardOf(t.tabId)); }); } catch (_) {}
    return out;
  },
  /* the engine board of a dashboard tab that is mounted, else null */
  board: function (id) { var r = engineRecs().filter(function (x) { return x.board === id; })[0]; return r ? r.b : null; },
  /* every engine dashboard's store, written now: { <board id>: envelope | null } (the tour's snapshot, D10 4.8) */
  snapshot: function () {
    engineRecs().forEach(function (r) { try { r.b.flush(); } catch (_) {} });
    var out = {};
    storedBoards().forEach(function (id) { out[id] = readKey(id); });
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

/* the page's own route to a dashboard sub-board (PM_PAGES.go('dashboard', 'Metrics')) reveals that board's tab */
function routeSubtabs() {
  if (!window.PM_PAGES || typeof PM_PAGES.registerSubtab !== 'function') return;
  var map = { main: 'home', home: 'home', metrics: 'metrics', monitoring: 'monitoring', agents: 'agents', current: 'current' };
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
  if (!expected) expected = internalBoard();
  watchInternal(); watchGrids(); watchWords(); routeSubtabs();
  // a rename (a layout commit) shows in the header facts
  PM_HOME.on('layout', repaintAll);
}
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', install); else install();
