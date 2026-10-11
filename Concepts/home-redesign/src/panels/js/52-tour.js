/* The panels' Guided Tour hooks (D25). The tour's workspace steps are native to the tour (opus-5.5 src/js/83-tour-steps.js:
   workspace_orientation, open_from_plus, open_file_from_rail, split_by_drag and widget_action, their copy in copy.json
   and NieR's Pod lines in copy.d/50-nier-tour.json; checkpoints across step orders are the tour core's). What only the
   panels know is here, on PMW.tour, and the steps look it up when they run (the panels boot after the tour's script):
   - entry(id, o): Back puts the panels and the dashboard boards back as they were when the step began (PMW.snapshot
     at entry, PMW.restoreSnapshot and PMW.dashboard.restore on Back);
   - the + step: watchPlus(), plusButton(), plusMenu(), plusRow() (what Show Me picks), plusDone();
   - the file step: watchFile(o), showFiles(), fileRow(), fileDone();
   - the split step: watchSplit(), splitEdge(), carrying(), splitTarget(done), splitDone(), splitDrag() (Show Me's carry);
   - the widget step (Upcoming resets on the Home dashboard board, D10 round two P10): watchWidget(), showDashboard(),
     widgetAddButton(), widgetDone(st), widgetShowMe().
   install() follows the tour through its public events only: the + menu and the open events feed the + and file
   steps, a new run forgets the last one, and Skip and Finish put the boards and the rail's file marks back after the
   panels are restored (TR.on('end')). Nothing here defines or edits a step. The tour's own start snapshot and its
   Skip / Finish restore of the panels go through PM_HOME_WORKSPACE.layout.pmw and o55RestoreSnapshot (00-shim.js). */

(function () {
/* its own scope: the names below never meet the core's */
var tour = PMW.tour = { installed: false, version: 2 };

/* ---- small helpers (the page's own lookups; nothing here throws into the core) ---- */
function tourApi() { var O = window.O55; return O && O.tour && Array.isArray(O.tour.defs) && O.tour.byId ? O.tour : null; }
function tVis(el) { return !!(el && el.isConnected && el.getClientRects().length && el.getBoundingClientRect().width > 0); }
function firstVis(sel, from) { var all = qsa(sel, from); for (var i = 0; i < all.length; i++) if (tVis(all[i])) return all[i]; return null; }
function cssId(v) { return window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/["\\]/g, '\\$&'); }
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
async function waitFor(fn, ms) { var t0 = Date.now(); while (Date.now() - t0 < ms) { var v = null; try { v = fn(); } catch (_) {} if (v) return v; await wait(60); } return null; }
function nextPaint() { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); }
function tabIds() { var l = state.layout; return l ? Object.keys(l.tabs) : []; }
function panelCount() { var l = state.layout; return l ? model.panels(l).length : 0; }
function kick() { var TR = tourApi(); if (TR && TR.st && TR.st.kick && TR.running) { try { TR.st.kick(); } catch (_) {} } }
function stepIs(id) { var TR = tourApi(); return !!(TR && TR.running && TR.st && TR.st.step && TR.st.step.id === id); }

/* what each step has seen since it began (reset at its entry) */
var marks = { plus: null, file: null, split: null };
/* the panels and the dashboard boards as each step found them: Back puts them back (the tour's rewind covers the chat
   and the page's own widgets; the boards go back through PMW.dashboard) */
var entrySnaps = {};
function dashSnapshot() { try { return PMW.dashboard && PMW.dashboard.snapshot ? PMW.dashboard.snapshot() : null; } catch (_) { return null; } }
function dashRestore(snap) {
  if (!snap) return;
  try { if (PMW.dashboard && PMW.dashboard.restore) PMW.dashboard.restore(snap); }
  catch (err) { try { console.warn('[pm-home] tour: the dashboards could not be put back', err); } catch (_) {} }
}
tour.entry = function (id, o) {
  if (o && o.back && entrySnaps[id]) {
    var e = entrySnaps[id], panels = e && e.panels ? e.panels : e;
    try { PMW.restoreSnapshot(panels, 'guided_tour_back'); } catch (err) { try { console.warn('[pm-home] tour: Back could not put the panels back', err); } catch (_) {} }
    if (e && e.dash) dashRestore(e.dash);
    return;
  }
  try { entrySnaps[id] = { panels: PMW.snapshot(), dash: dashSnapshot() }; } catch (_) {}
};
/* the boards as the run found them: Skip and Finish put them back after the panels are restored (P10) */
var tourStartDash = null;

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

/* ---- open_from_plus: the + at the end of a panel's tabs ---- */
tour.watchPlus = function () { marks.plus = { used: false, opened: [], tabs: tabIds() }; };
tour.plusButton = function () {
  var el = panelEl(focusedPanelId());
  var b = el && qs('.pmw-plus', el);
  return tVis(b) ? b : firstVis('#pm-home-centre .pmw-plus');
};
tour.plusMenu = function () {
  var cur = PMW.menu && PMW.menu.current;
  if (!cur || !cur.spec || String(cur.spec.id || '').indexOf('plus') !== 0) return null;
  return tVis(cur.el) ? cur.el : null;
};
/* the row Show Me picks: Browser, else Terminal, else the first row that opens at once (no picker, no submenu) */
tour.plusRow = function () {
  var m = tour.plusMenu(); if (!m) return null;
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
};
/* done once the + menu was used and then something opened (a created 'open' event or a new tab id) */
tour.plusDone = function () {
  var m = marks.plus; if (!m || !m.used) return false;
  if (m.opened.length) return true;
  return tabIds().some(function (t) { return m.tabs.indexOf(t) < 0; });
};

/* ---- open_file_from_rail: a file row in the rail's Files list that is not open yet ---- */
var fileChoice = null;
function fileRows() {
  return qsa('#panel-files .fm-row[data-path]').filter(function (r) {
    return r.getAttribute('data-kind') !== 'folder' && !r.classList.contains('ignored') && tVis(r);
  });
}
/* README.md or Cargo.toml first (short, plain files), then any file not open yet */
tour.fileRow = function () {
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
};
/* the Files list on the rail, shown through the activity bar's own Files icon when another rail panel is up */
tour.showFiles = function () {
  if (fileRows().length) return;
  var ic = firstVis('#activityBar .icon[data-ab-id="files"]');
  if (ic) ic.click();
};
/* at the step's entry: the rail's file marks as they were (Back puts them back), a fresh choice, the Files list shown */
tour.watchFile = async function (o) {
  if (o && o.back) setRailMarks(fileMarks); else fileMarks = railMarks();
  fileChoice = null;
  marks.file = { opened: [], tabs: tabIds() };
  tour.showFiles();
  await waitFor(function () { return tour.fileRow(); }, 900);
};
/* done once an editor tab was created since the step began */
tour.fileDone = function () {
  var m = marks.file; if (!m) return false;
  if (m.opened.length) return true;
  var l = state.layout;
  return tabIds().some(function (t) { return m.tabs.indexOf(t) < 0 && l.tabs[t] && l.tabs[t].kind === 'editor'; });
};

/* ---- split_by_drag: the documents panel's active tab, dragged to a panel edge ---- */
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
/* which way the tab's panel can split (the same fit rule the drag and the tab menu use): 'right', 'bottom' or null */
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
/* the tab the learner split off (the last applied split move since the step began) */
function splitMovedTab(since) { var m = splitMoves(since); return m.length ? m[m.length - 1].args.tabId : null; }
function lastSeq() { var log = PM_HOME.command_log || []; return log.length ? log[log.length - 1].seq : 0; }
/* at the step's entry: a fresh choice, the log position and panel count to compare with; returns the edge to name */
tour.watchSplit = function () {
  splitChoice = null;
  marks.split = { seq: lastSeq(), panels: panelCount() };
  return splitEdge(splitTabId());
};
tour.splitEdge = function () { return splitEdge(splitTabId()); };
/* a tab is being carried */
tour.carrying = function () { return doc.body.classList.contains('pmw-dragging'); };
/* the tab; while it is carried, the whole centre (every edge it can land on); once split (done), its new panel */
tour.splitTarget = function (done) {
  if (tour.carrying()) return state.centre;
  if (done) {
    var moved = marks.split && splitMovedTab(marks.split.seq), p = moved && model.panelOf(state.layout, moved);
    return (p && panelEl(p.id)) || state.centre;
  }
  return tabEl(splitTabId());
};
/* done once a split move was applied since the step began and the panel count grew */
tour.splitDone = function () {
  var m = marks.split; if (!m) return false;
  return splitMoves(m.seq).length > 0 && panelCount() > m.panels;
};
/* Show Me's carry: from the tab to a point inside its panel's own edge band, clear of the centre's outer band (which
   would make a full-length panel); ready once the gesture has a split zone */
tour.splitDrag = function () {
  var tid = splitTabId(), el = tabEl(tid), l = state.layout, p = tid && model.panelOf(l, tid), pe = p && panelEl(p.id);
  if (!el || !pe) return null;
  var edge = splitEdge(tid) || 'bottom';
  var strip = qs('.pmw-strip', pe), pr = pe.getBoundingClientRect(), top = strip ? strip.getBoundingClientRect().bottom : pr.top;
  var to = edge === 'right' ? { x: pr.right - 34, y: (top + pr.bottom) / 2 } : { x: pr.left + pr.width / 2, y: pr.bottom - 30 };
  return { el: el, to: to, ready: function () { var g = PMW.gesture.active; return !!(g && g.zone && g.zone.type === 'split'); } };
};

/* ---- widget_action: Upcoming resets on the Home dashboard board ---- */
/* the Home dashboard tab, open and holding its board, so the step's Add widget button is on screen. An open of the open
   tab reveals it. Waits, polling each frame, until the Home board exists and its element is in the document. */
tour.showDashboard = async function () {
  var l = state.layout; if (!l) return null;
  try { PM_HOME.open({ id: 'dashboard:home', kind: 'dashboard', board: 'home', mode: 'keep' }); } catch (_) {}
  var t0 = Date.now();
  while (Date.now() - t0 < 1500) {
    var b = null, el = null;
    try { b = PMW.dashboard && PMW.dashboard.board ? PMW.dashboard.board('home') : null; } catch (_) {}
    try { el = b && b.el ? b.el() : null; } catch (_) {}
    if (b && el && el.isConnected) return b;
    await nextPaint();
  }
  return null;
};
/* at the step's entry: the Home board shown, Upcoming resets hidden when the board already shows it (the step adds
   it), and the Usage log position to read from (returned) */
tour.watchWidget = async function () {
  var b = await tour.showDashboard();
  try { if (b && b.visible && b.visible().indexOf('ov-resets') >= 0) b.setVisible('ov-resets', false); } catch (_) {}
  var U = window.PM7_USAGE;
  return U && U.command_log ? U.command_log.length : 0;
};
/* the Home dashboard tab's Add widget button (the header row of the panel whose active tab is dashboard:home) */
tour.widgetAddButton = function () {
  var btns = qsa('.pmw-tabbody[data-pmw-tab="dashboard:home"] .pmw-hrow .pmw-hbtn[data-id="add"]');
  for (var i = 0; i < btns.length; i++) if (tVis(btns[i])) return btns[i];
  return null;
};
/* done when, since the step began (st.wlog), the Usage log shows Upcoming resets added to the Home board and then moved
   or resized there. Entries join their receipts by the command's instance id; only accepted ones count. */
tour.widgetDone = function (st) {
  var U = window.PM7_USAGE;
  if (!U || !U.command_log || !U.receipt_log) return false;
  var cmds = U.command_log.slice((st && st.wlog) || 0), ok = {};
  U.receipt_log.forEach(function (r) {
    if (r && (r.status === 'accepted' || r.outcome === 'accepted' || r.outcome === 'applied')) ok[r.command_instance_id] = true;
  });
  function mine(c, id) {
    return c && c.command_id === id && c.payload && c.payload.room === 'home' && c.payload.widget_id === 'ov-resets' &&
      ok[c.command_instance_id];
  }
  var at = -1;
  for (var i = 0; i < cmds.length; i++) if (mine(cmds[i], 'cmd.widget.add')) { at = i; break; }
  if (at < 0) return false;
  for (var j = at + 1; j < cmds.length; j++) {
    if (mine(cmds[j], 'cmd.widget.move') || mine(cmds[j], 'cmd.widget.resize')) return true;
  }
  return false;
};
/* Show Me: add Upcoming resets to the Home board, then move it to the top */
tour.widgetShowMe = async function () {
  var b = null;
  try { b = PMW.dashboard && PMW.dashboard.board ? PMW.dashboard.board('home') : null; } catch (_) {}
  if (!b) return;
  try { b.add('ov-resets'); } catch (_) {}
  await nextPaint();
  try {
    var rect = b.rect ? b.rect('ov-resets') : null;
    if (rect) b.move('ov-resets', Object.assign({}, rect, { x: 0, y: 0 }), 'tour');
  } catch (_) {}
};

/* ---- install: the tour's public events only ---- */
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
  // a new run remembers nothing of the last one (and the boards as the run found them, for Skip and Finish)
  window.addEventListener('o55:tour', function (e) {
    var t = e && e.detail && e.detail.type;
    if (t === 'started') { entrySnaps = {}; marks = { plus: null, file: null, split: null }; startMarks = railMarks(); fileMarks = null; tourStartDash = dashSnapshot(); }
    else if (t === 'resumed' && !tourStartDash) tourStartDash = dashSnapshot();
    if (t === 'skipped' || t === 'finished') { entrySnaps = {}; tourStartDash = null; }
  });
  // Skip and Finish put the boards and the rail's file marks back after the panels are restored (the 'end' hook runs
  // after the restore); Keep this layout keeps them as they are
  if (TR.on) TR.on('end', function (d) {
    if (d && !d.keep && d.status !== 'restore-pending' && startMarks) setRailMarks(startMarks);
    if (d && !d.keep && d.status !== 'restore-pending' && tourStartDash) dashRestore(tourStartDash);
  });
}

tour.install = function () {
  if (tour.installed) return true;
  var TR = tourApi();
  if (!TR) {
    // the tour engine is not there yet (or this page has none): try again a few times, then leave it
    tour.tries = (tour.tries || 0) + 1;
    if (tour.tries <= 25) setTimeout(tour.install, 200);
    return false;
  }
  tour.installed = true;
  try { wireEvents(TR); } catch (err) { try { console.error('[pm-home] tour hooks failed', err); } catch (_) {} }
  return true;
};
})();
