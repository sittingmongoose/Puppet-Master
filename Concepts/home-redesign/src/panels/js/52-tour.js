/* The Guided Tour's Home steps for the panels (D25), rewritten at runtime so the opus-5.5 sources stay untouched until
   the panels publish (digest 01, section 9.10). PMW.tour.install() runs once the panels have booted (90-boot.js) and
   edits O55.tour.defs / O55.tour.byId in place:
   - workspace_orientation: its middle spotlight is the panels centre (#pm-home-centre) and its copy names the panels;
   - move_or_dock_chat is retired (D3: the chat moves only by popping out; the orientation copy says so);
   - three new action steps, each finished by what the panels report, never by a timer: open a tab from "+"
     (open_from_plus), open a file from the rail (open_file_from_rail), split by dragging a tab to a panel edge
     (split_by_drag; the tab menu's Split right / Split down with this tab counts too);
   - widget_action first shows the Home dashboard tab, then keeps its own add-and-place logic.
   Steps are re-indexed after the splice. A saved checkpoint holds a position, not a step id, so a run saved under
   another step order (the published page's 18 steps) would pick up at the wrong step: every save is stamped with its
   step id and this order's signature, and at install a checkpoint without this signature is moved to its step by id.
   A checkpoint whose step is retired (move_or_dock_chat) picks up at the first step of that step's chapter, and done
   ids of retired steps are dropped (Plans rule proposed by the planning thread, 2026-10-10). Back puts the panels
   back as they were when the step began (PMW.snapshot at entry, PMW.restoreSnapshot on Back). The tour's own start
   snapshot and its Skip / Finish restore go through PM_HOME_WORKSPACE.layout.pmw and o55RestoreSnapshot (00-shim.js).
   At publish these defs move into 83-tour-steps.js and their copy into copy.json. */

(function () {
/* its own scope: the names below never meet the core's */
var tour = PMW.tour = { installed: false, version: 1 };

/* the copy the new and changed steps need, merged into O55.copy at install (keys copy.json lacks; NieR's Pod lines too) */
var TOUR_COPY = {
  workspace_orientation: {
    title: 'Your workspace',
    do: 'Pages sit across the top. Everything you open lands in these panels: files, terminals, browsers, plans. The chat stays on the right; pop it out to move it.',
    doEli5: 'Pages are on top. What you open shows up in these panels. Chat stays on the right.'
  },
  open_from_plus: {
    title: 'Open anything from +',
    do: 'Choose + at the end of the tabs, then pick something to open, like a terminal or a browser.',
    doEli5: 'Click +, then pick something.',
    pick: 'Pick something to open. It opens as a new tab in this panel.',
    pickEli5: 'Pick one.',
    after: 'It opened as a new tab in this panel. Each panel has its own +.'
  },
  open_file_from_rail: {
    title: 'Open a file into a panel',
    do: 'Click a file in the Files list. One click opens a preview tab; a double click keeps it open.',
    doEli5: 'Click a file on the left.',
    after: 'A preview tab makes way for the next file you click. Double-click a file, or its tab, to keep it.'
  },
  split_by_drag: {
    title: 'Split by dragging a tab',
    do: 'Drag this tab to the edge of a panel and let go when that half lights up. Or right-click the tab and choose Split right with this tab.',
    doDown: 'Drag this tab to the edge of a panel and let go when that half lights up. Or right-click the tab and choose Split down with this tab.',
    doEli5: 'Drag the tab to the edge of a panel.',
    doDownEli5: 'Drag the tab to the edge of a panel.',
    after: 'The tab has a panel of its own now. Drag it back onto the other tabs to join them again.'
  },
  widget_action: {
    do: 'Add the Approval queue widget to the Home dashboard, then place it where you can glance at it while planning.'
  }
};
var POD_COPY = {
  workspace_orientation: { line: 'Report: Scan complete. Pages on top, panels in the middle, Chat on the right.' },
  open_from_plus: { line: 'Proposal: Use + to open a new tab. Any kind will do.' },
  open_file_from_rail: { line: 'Report: One click previews a file. Two clicks keep it.' },
  split_by_drag: { line: 'Proposal: Drag the tab to an edge. It gets a panel of its own.' }
};

/* ---- small helpers (the page's own lookups; nothing here throws into the core) ---- */
function tourApi() { var O = window.O55; return O && O.tour && Array.isArray(O.tour.defs) && O.tour.byId ? O.tour : null; }
function tVis(el) { return !!(el && el.isConnected && el.getClientRects().length && el.getBoundingClientRect().width > 0); }
function firstVis(sel, from) { var all = qsa(sel, from); for (var i = 0; i < all.length; i++) if (tVis(all[i])) return all[i]; return null; }
function cssId(v) { return window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/["\\]/g, '\\$&'); }
function currentPage() { var t = qs('.page-tab.active[data-page]'); return t ? t.getAttribute('data-page') : ''; }
function goPage(p) { if (currentPage() === p) return; var t = firstVis('.page-tab[data-page="' + p + '"]'); if (t) t.click(); }
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
async function waitFor(fn, ms) { var t0 = Date.now(); while (Date.now() - t0 < ms) { var v = null; try { v = fn(); } catch (_) {} if (v) return v; await wait(60); } return null; }
function tabIds() { var l = state.layout; return l ? Object.keys(l.tabs) : []; }
function panelCount() { var l = state.layout; return l ? model.panels(l).length : 0; }
function kick() { var TR = tourApi(); if (TR && TR.st && TR.st.kick && TR.running) { try { TR.st.kick(); } catch (_) {} } }
function stepIs(id) { var TR = tourApi(); return !!(TR && TR.running && TR.st && TR.st.step && TR.st.step.id === id); }
function stepDone(id) { var TR = tourApi(); return !!(TR && TR.st && TR.st.sess && TR.st.sess.done.indexOf(id) >= 0); }

/* what each new step has seen since it began (reset at its entry) */
var marks = { plus: null, file: null, split: null };
/* the panels as each step found them: Back puts them back (the tour's rewind covers the chat and the widgets) */
var entrySnaps = {};
function stepEntry(id, o) {
  if (o && o.back && entrySnaps[id]) {
    try { PMW.restoreSnapshot(entrySnaps[id], 'guided_tour_back'); } catch (err) { try { console.warn('[pm-home] tour: Back could not put the panels back', err); } catch (_) {} }
    return;
  }
  try { entrySnaps[id] = PMW.snapshot(); } catch (_) {}
}

/* the rail marks the file a click opened (.fm-row.active-file, 48-shims.js); the tour's restore puts the panels back,
   so the mark goes back with them */
function railMarks() { return qsa('#panel-files .fm-row.active-file[data-path]').map(function (r) { return r.getAttribute('data-path'); }); }
function setRailMarks(paths) {
  if (!paths) return;
  qsa('#panel-files .fm-row.active-file').forEach(function (r) { if (paths.indexOf(r.getAttribute('data-path')) < 0) r.classList.remove('active-file'); });
  paths.forEach(function (p) { var r = qs('#panel-files .fm-row[data-path="' + cssId(p) + '"]'); if (r) r.classList.add('active-file'); });
}
var startMarks = null, fileMarks = null;

/* ---- panels lookups ---- */
function panelEl(pid) { return pid ? qs('#pm-home-centre .pmw-panel[data-pmw-panel="' + cssId(pid) + '"]') : null; }
function focusedPanelId() {
  var l = state.layout; if (!l) return null;
  var f = l.view && l.view.focus && model.panel(l, l.view.focus);
  var el = f && panelEl(f.id);
  if (f && tVis(el)) return f.id;
  var ps = model.panels(l);
  for (var i = 0; i < ps.length; i++) if (tVis(panelEl(ps[i].id))) return ps[i].id;
  return null;
}
function plusBtn() {
  var el = panelEl(focusedPanelId());
  var b = el && qs('.pmw-plus', el);
  return tVis(b) ? b : firstVis('#pm-home-centre .pmw-plus');
}
function plusMenuEl() {
  var cur = PMW.menu && PMW.menu.current;
  if (!cur || !cur.spec || String(cur.spec.id || '').indexOf('plus') !== 0) return null;
  return tVis(cur.el) ? cur.el : null;
}
/* the row Show Me picks: Browser, else Terminal, else the first row that opens at once (no picker, no submenu) */
function plusRowEl() {
  var m = plusMenuEl(); if (!m) return null;
  var items = qsa('.pmw-mitem', m).filter(tVis);
  var want = ['kind-browser', 'kind-terminal'];
  for (var w = 0; w < want.length; w++) {
    for (var i = 0; i < items.length; i++) if (items[i]._pmwRow && items[i]._pmwRow.id === want[w]) return items[i];
  }
  for (var j = 0; j < items.length; j++) {
    var r = items[j]._pmwRow;
    if (r && /^kind-/.test(r.id) && !r.submenu && !r.disabled) {
      var k = PMW.kinds[r.id.slice(5)];
      if (!(k && k.plus && k.plus.pick)) return items[j];
    }
  }
  return null;
}

/* a file row in the rail's Files list that is not open yet (README.md or Cargo.toml first: short, plain files) */
var fileChoice = null;
function fileRows() {
  return qsa('#panel-files .fm-row[data-path]').filter(function (r) {
    return r.getAttribute('data-kind') !== 'folder' && !r.classList.contains('ignored') && tVis(r);
  });
}
function fileRow() {
  var rows = fileRows(); if (!rows.length) return null;
  if (fileChoice) { for (var i = 0; i < rows.length; i++) if (rows[i].getAttribute('data-path') === fileChoice) return rows[i]; }
  var l = state.layout || { tabs: {} };
  var fresh = rows.filter(function (r) { return !l.tabs['file:' + r.getAttribute('data-path')] && !/\.(bin|log)$/.test(r.getAttribute('data-path')); });
  var pref = ['README.md', 'Cargo.toml'];
  var pick = null;
  for (var p = 0; p < pref.length && !pick; p++) pick = fresh.filter(function (r) { return r.getAttribute('data-path') === pref[p]; })[0] || null;
  pick = pick || fresh[0] || rows[0];
  fileChoice = pick.getAttribute('data-path');
  return pick;
}
/* the Files list on the rail, shown through the activity bar's own Files icon when another rail panel is up */
function showFiles() {
  if (fileRows().length) return;
  var ic = firstVis('#activityBar .icon[data-ab-id="files"]');
  if (ic) ic.click();
}

/* the tab the split step asks for: the documents panel's active tab (it has company there to split from) */
var splitChoice = null;
function docsPanel() {
  var l = state.layout; if (!l) return null;
  var ps = model.panels(l).filter(function (p) { return PMW.panelRole(l, p) === 'documents' && p.tabs.length > 1 && tVis(panelEl(p.id)); });
  var f = l.view && l.view.focus;
  return ps.filter(function (p) { return p.id === f; })[0] || ps[0] || null;
}
function splitTabId() {
  var l = state.layout; if (!l) return null;
  if (splitChoice && l.tabs[splitChoice]) { var hp = model.panelOf(l, splitChoice); if (hp && hp.tabs.length > 1) return splitChoice; }
  var p = docsPanel(); if (!p) return null;
  var t = p.active && !l.tabs[p.active].pinned ? p.active : p.tabs.filter(function (x) { return !l.tabs[x].pinned; }).pop();
  splitChoice = t || null;
  return splitChoice;
}
function tabEl(tid) { return tid ? firstVis('#pm-home-centre .pmw-tab[data-tab-id="' + cssId(tid) + '"]') : null; }
/* which way the tab's panel can split (the same fit rule the drag and the tab menu use) */
function splitEdge(tid) {
  var l = state.layout, p = tid && l && model.panelOf(l, tid); if (!p) return null;
  try {
    var rects = PMW.treeRects(), min = PMW.panelMin(l, { tabs: [tid] });
    if (geom.splitFits(l, p.id, 'right', rects, min)) return 'right';
    if (geom.splitFits(l, p.id, 'bottom', rects, min)) return 'bottom';
  } catch (_) {}
  return null;
}
/* the moves that split since the step began, accepted by the panels (a receipt with outcome applied) */
function splitMoves(since) {
  var rec = PM_HOME.receipt_log || [];
  return (PM_HOME.command_log || []).filter(function (c) {
    return c.seq > since && c.command_id === CMD.move && c.args && c.args.split &&
      rec.some(function (r) { return r.seq === c.seq && r.outcome === 'applied'; });
  });
}
function splitCommitted(since) { return splitMoves(since).length > 0; }
/* the tab the learner split off (the last applied split move since the step began) */
function splitMovedTab(since) { var m = splitMoves(since); return m.length ? m[m.length - 1].args.tabId : null; }
function lastSeq() { var log = PM_HOME.command_log || []; return log.length ? log[log.length - 1].seq : 0; }

/* the Home dashboard tab, shown and active, so the widget step's Add widget button is on screen */
async function showDashboard() {
  var l = state.layout; if (!l) return;
  if (l.tabs['dashboard:home']) PM_HOME.reveal('dashboard:home');
  else PM_HOME.open({ kind: 'dashboard', board: 'home' });
  await waitFor(function () { return tVis(document.getElementById('pm6DashAddBtn')); }, 1500);
}

/* While a tab is carried the tour's callout and bar hold still and step back, as they do for any drag in the tour
   (80-tour-core.js reads body.pm-home-dragging); the class is the tour's, set here only while this step carries. */
var dragHold = false;
function syncDragHold(on) {
  var cl = doc.body.classList;
  if (on && !dragHold) { dragHold = true; cl.add('pm-home-dragging'); }
  else if (!on && dragHold) { dragHold = false; cl.remove('pm-home-dragging'); }
}

/* ---- the step definitions ---- */
function defs(TR) {
  var O55 = window.O55;
  var refresh = function () { try { TR.refresh(); } catch (_) {} };
  var phaseSound = function () { try { O55.sound.play('phase'); } catch (_) {} };

  var openFromPlus = {
    id: 'open_from_plus', chapter: 'workspace', kind: 'action', after: true,
    enter: function (st, o) {
      stepEntry('open_from_plus', o);
      goPage('dashboard');
      marks.plus = { used: false, opened: [], tabs: tabIds() };
      st.plusPhase = null;
    },
    leave: function (st) { st.plusPhase = null; },
    /* two moves: open the menu, then pick a row; the spotlight follows the menu while it is open */
    tick: function (st) {
      var ph = plusMenuEl() ? 'pick' : 'do';
      if (st.plusPhase !== ph) { var first = st.plusPhase == null; st.plusPhase = ph; if (!first) { st.side = null; st.fixed = null; refresh(); } }
    },
    doKey: function (st) { return st.plusPhase === 'pick' ? 'pick' : 'do'; },
    target: function () { return plusMenuEl() || plusBtn(); },
    done: function () {
      var m = marks.plus; if (!m || !m.used) return false;
      if (m.opened.length) return true;
      return tabIds().some(function (t) { return m.tabs.indexOf(t) < 0; });
    },
    showMe: async function (sm) {
      if (!plusMenuEl()) { await sm.click(plusBtn()); await sm.wait(380); }
      var row = plusRowEl(); if (row) await sm.click(row);
    },
    goTo: function () { goPage('dashboard'); }
  };

  var openFileFromRail = {
    id: 'open_file_from_rail', chapter: 'workspace', kind: 'action', after: true,
    enter: async function (st, o) {
      stepEntry('open_file_from_rail', o);
      if (o && o.back) setRailMarks(fileMarks); else fileMarks = railMarks();
      goPage('dashboard');
      fileChoice = null;
      marks.file = { opened: [], tabs: tabIds() };
      showFiles();
      await waitFor(function () { return fileRow(); }, 900);
    },
    target: function () { return fileRow(); },
    done: function () {
      var m = marks.file; if (!m) return false;
      if (m.opened.length) return true;
      var l = state.layout;
      return tabIds().some(function (t) { return m.tabs.indexOf(t) < 0 && l.tabs[t] && l.tabs[t].kind === 'editor'; });
    },
    showMe: async function (sm) { showFiles(); await sm.click(fileRow()); },
    goTo: function () { goPage('dashboard'); showFiles(); }
  };

  var splitByDrag = {
    id: 'split_by_drag', chapter: 'workspace', kind: 'action', after: true, pad: 6,
    enter: function (st, o) {
      stepEntry('split_by_drag', o);
      goPage('dashboard');
      splitChoice = null;
      marks.split = { seq: lastSeq(), panels: panelCount(), panel: null };
      st.splitEdge = splitEdge(splitTabId());
    },
    tick: function (st) {
      syncDragHold(doc.body.classList.contains('pmw-dragging'));
      if (dragHold || stepDone('split_by_drag')) return;
      var e = splitEdge(splitTabId());
      if (e && e !== st.splitEdge) { st.splitEdge = e; refresh(); }
    },
    leave: function () { syncDragHold(false); },
    doKey: function (st) { return st.splitEdge === 'bottom' ? 'doDown' : 'do'; },
    /* the tab; while it is carried, the whole centre (every edge it can land on); once split, its new panel */
    target: function () {
      if (doc.body.classList.contains('pmw-dragging')) return state.centre;
      if (stepDone('split_by_drag')) {
        var moved = marks.split && splitMovedTab(marks.split.seq), p = moved && model.panelOf(state.layout, moved);
        return (p && panelEl(p.id)) || state.centre;
      }
      return tabEl(splitTabId());
    },
    done: function () {
      var m = marks.split; if (!m) return false;
      return splitCommitted(m.seq) && panelCount() > m.panels;
    },
    showMe: async function (sm) {
      var tid = splitTabId(), el = tabEl(tid), l = state.layout, p = tid && model.panelOf(l, tid), pe = p && panelEl(p.id);
      if (!el || !pe) return;
      var edge = splitEdge(tid) || 'bottom';
      var strip = qs('.pmw-strip', pe), pr = pe.getBoundingClientRect(), top = strip ? strip.getBoundingClientRect().bottom : pr.top;
      /* inside the panel's own edge band, clear of the centre's outer band (which would make a full-length panel) */
      var to = edge === 'right' ? { x: pr.right - 34, y: (top + pr.bottom) / 2 } : { x: pr.left + pr.width / 2, y: pr.bottom - 30 };
      await sm.drag(el, to, { ready: function () { var g = PMW.gesture.active; return !!(g && g.zone && g.zone.type === 'split'); } });
    },
    goTo: function () { goPage('dashboard'); }
  };
  return [openFromPlus, openFileFromRail, splitByDrag];
}

/* ---- install ---- */
function mergeCopy(O55) {
  var c = O55.copy; if (!c || !c.tour) return;
  var steps = c.tour.steps = c.tour.steps || {};
  Object.keys(TOUR_COPY).forEach(function (id) { steps[id] = Object.assign({}, steps[id] || {}, TOUR_COPY[id]); });
  var pod = c.tour.nier && c.tour.nier.pod;
  if (pod) {
    pod.steps = pod.steps || {};
    Object.keys(POD_COPY).forEach(function (id) { pod.steps[id] = Object.assign({}, pod.steps[id] || {}, POD_COPY[id]); });
  }
}

function patchOrientation(TR) {
  var d = TR.byId.workspace_orientation; if (!d) return;
  var ORIENT = [
    function () { return TR.q('.page-tabs'); },
    function () { return document.getElementById('pm-home-centre'); },
    function () { return document.getElementById('chatPanel'); }
  ];
  d.target = function (st) { return ORIENT[(st && st.orient) || 0](); };
  d.avoid = function () { return [ORIENT[0](), ORIENT[2]()]; };
}

function patchWidget(TR) {
  var d = TR.byId.widget_action; if (!d || d._pmwPatched) return;
  d._pmwPatched = true;
  var enter0 = d.enter, goTo0 = d.goTo;
  d.enter = async function (st, o) {
    stepEntry('widget_action', o);
    goPage('dashboard');
    await showDashboard();
    if (enter0) return enter0.call(this, st, o);
  };
  d.goTo = function (st) {
    if (goTo0) goTo0.call(this, st);
    showDashboard();
  };
}

function splice(TR, steps) {
  var list = TR.defs;
  // retire the chat drag (D3), then the new steps go in after the orientation, before the widget step
  var old = TR.byId.move_or_dock_chat;
  if (old) { var oi = list.indexOf(old); if (oi >= 0) list.splice(oi, 1); delete TR.byId.move_or_dock_chat; }
  steps.forEach(function (s) { if (TR.byId[s.id]) { var i0 = list.indexOf(TR.byId[s.id]); if (i0 >= 0) list.splice(i0, 1); } });
  var anchor = TR.byId.widget_action ? list.indexOf(TR.byId.widget_action) : -1;
  if (anchor < 0) { var orient = TR.byId.workspace_orientation; anchor = orient ? list.indexOf(orient) + 1 : list.length; }
  Array.prototype.splice.apply(list, [anchor, 0].concat(steps));
  steps.forEach(function (s) { TR.byId[s.id] = s; });
  list.forEach(function (d, i) { d.index = i; });
}

/* ---- checkpoints across step orders ---- */
// a retired step's chapter, for a checkpoint that names it when the published defs are not at hand to say so
var RETIRED = { move_or_dock_chat: 'workspace' };
function orderSignature(TR) {
  var str = TR.defs.map(function (d) { return d.id; }).join('|'), h = 5381;
  for (var i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return 'pmw-' + TR.defs.length + '-' + h.toString(36);
}
function chapterStart(TR, chapter) {
  for (var i = 0; i < TR.defs.length; i++) if (TR.defs[i].chapter === chapter) return i;
  return -1;
}
// every checkpoint this page writes names its step and this step order
function stampSaves(TR) {
  var O = window.O55;
  if (!O || !O.store || typeof O.store.set !== 'function' || O.store.set._pmwTour) return;
  var set0 = O.store.set;
  O.store.set = function (name, value) {
    if (name === 'tour' && value && typeof value === 'object' && !Array.isArray(value) && Number.isInteger(value.index)) {
      var d = TR.defs[value.index];
      value = Object.assign({}, value, { order: tour.order, step: d ? d.id : null });
    }
    return set0.call(this, name, value);
  };
  O.store.set._pmwTour = true;
}
/* A checkpoint written under another step order goes to its own step by id, or, when that step is retired, to the
   first step of its chapter. before: the published defs' ids and chapters, read before the splice. Returns true when
   the checkpoint moved. */
function migrateCheckpoint(TR, before) {
  var O = window.O55;
  if (!O || !O.store) return false;
  var saved = O.store.get('tour', null);
  if (!saved || saved.v !== 2 || !Number.isInteger(saved.index) || saved.order === tour.order) return false;
  var id = saved.step || (before[saved.index] && before[saved.index].id) || null;
  if (!id) return false;
  var at = -1;
  if (TR.byId[id]) at = TR.byId[id].index;
  else {
    var chapter = RETIRED[id] || null;
    before.forEach(function (b) { if (b.id === id && b.chapter) chapter = b.chapter; });
    at = chapter ? chapterStart(TR, chapter) : -1;
  }
  if (at < 0) return false;
  var done = (Array.isArray(saved.done) ? saved.done : []).filter(function (d) { return TR.byId[d] && TR.byId[d].index < at; });
  O.store.set('tour', Object.assign({}, saved, { index: at, done: done }));
  tour.migrated = { from: id, to: TR.defs[at].id };
  return true;
}

function wireEvents(TR) {
  // the "+" menu opened (by its button, Ctrl+Shift+Space or the empty-panel launcher's "+"): the plus step may count
  // the open that follows
  if (PMW.menus && PMW.menus.plus && !PMW.menus.plus._pmwTour) {
    var plus0 = PMW.menus.plus;
    PMW.menus.plus = function () {
      if (marks.plus && stepIs('open_from_plus')) marks.plus.used = true;
      return plus0.apply(this, arguments);
    };
    PMW.menus.plus._pmwTour = true;
  }
  PM_HOME.on('open', function (ev) {
    if (!ev || !ev.created) return;
    if (marks.plus && marks.plus.used && stepIs('open_from_plus')) { marks.plus.opened.push(ev.tabId); kick(); }
    if (marks.file && ev.kind === 'editor' && stepIs('open_file_from_rail')) { marks.file.opened.push(ev.tabId); kick(); }
  });
  // a new run remembers nothing of the last one
  window.addEventListener('o55:tour', function (e) {
    var t = e && e.detail && e.detail.type;
    if (t === 'started') { entrySnaps = {}; marks = { plus: null, file: null, split: null }; startMarks = railMarks(); fileMarks = null; }
    if (t === 'skipped' || t === 'finished') { entrySnaps = {}; syncDragHold(false); }
  });
  // the tour ended mid-carry: the hold goes with it
  if (TR.on) TR.on('end', function (d) {
    syncDragHold(false);
    if (d && !d.keep && d.status !== 'restore-pending' && startMarks) setRailMarks(startMarks);
  });
  // about 5.2 minutes at 200 words a minute with every action shown, estimated (three actions replace one; the
  // census tool measures it at publish), rounded up so the promise is kept
  TR.minutes = function () { return 6; };
}

tour.install = function () {
  if (tour.installed) return true;
  var TR = tourApi();
  if (!TR || !TR.byId.workspace_orientation) {
    // the tour engine is not there yet (or this page has none): try again a few times, then leave the tour as it is
    tour.tries = (tour.tries || 0) + 1;
    if (tour.tries <= 25) setTimeout(tour.install, 200);
    return false;
  }
  tour.installed = true;
  try {
    mergeCopy(window.O55);
    patchOrientation(TR);
    patchWidget(TR);
    var before = TR.defs.map(function (d) { return { id: d.id, chapter: d.chapter || null }; });
    splice(TR, defs(TR));
    tour.order = orderSignature(TR);
    stampSaves(TR);
    // Settings' Resume row and its "step N of M" are redrawn on o55:tour
    if (migrateCheckpoint(TR, before)) { try { window.dispatchEvent(new CustomEvent('o55:tour', { detail: { type: 'steps-changed' } })); } catch (_) {} }
    wireEvents(TR);
    if (TR.running) { try { TR.renderBar(); TR.refresh(); } catch (_) {} }
  } catch (err) {
    try { console.error('[pm-home] tour steps failed', err); } catch (_) {}
  }
  return true;
};
/* for checks: the panels' view of the tour's Home steps */
tour.ids = function () { var TR = tourApi(); return TR ? TR.defs.map(function (d) { return d.id; }) : []; };
})();
