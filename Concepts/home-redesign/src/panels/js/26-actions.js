/* Actions: every user-visible change goes through one of these, so the mouse, the menus and the keyboard all reach
   the same command (DRY). Structural changes are commands (PMW.commit); focus, activation and maximize are view state
   (PMW.viewAction). */

function L() { return state.layout; }

PMW.focusPanel = function (panelId, opts) {
  opts = opts || {};
  var l = L();
  if (!model.panel(l, panelId) || l.view.focus === panelId) return;
  var prev = l.view.focus;
  viewAction(UI.focus, function (lay) { lay.view.focus = panelId; }, { animate: false });
  bus.emit('focus', { panelId: panelId, previous: prev });
  if (!opts.quiet) {
    announce(panelLabelFor(panelId));
    PMW.focusPanelDom(panelId);
  }
};
function panelLabelFor(id) {
  var l = L(), p = model.panel(l, id);
  if (!p) return '';
  var rec = p.active && l.tabs[p.active];
  return (rec ? tabLabel(rec) : 'Empty panel') + ', ' + model.describe(l, id);
}
PMW.focusPanelDom = function (panelId) {
  nextFrame(function () {
    var el = render.panelEl(panelId);
    if (!el) return;
    var tab = el.querySelector('.pmw-tab[aria-selected="true"]') || el.querySelector('.pmw-plus');
    if (tab) tab.focus({ preventScroll: true });
  });
};

function touchMru(l, tabId) {
  var m = l.view.mru || (l.view.mru = []);
  var i = m.indexOf(tabId);
  if (i >= 0) m.splice(i, 1);
  m.unshift(tabId);
  if (m.length > 40) m.length = 40;
}

PMW.activateTab = function (tabId, opts) {
  opts = opts || {};
  var l = L(), p = model.panelOf(l, tabId);
  if (!p) return false;
  var changed = p.active !== tabId || p.collapsed || l.view.focus !== p.id || (l.tabs[tabId] && l.tabs[tabId].attention);
  viewAction(UI.activate, function (lay) {
    var pp = model.panelOf(lay, tabId);
    pp.active = tabId;
    pp.collapsed = false;
    if (!opts.background) lay.view.focus = pp.id;
    if (lay.tabs[tabId].attention) lay.tabs[tabId].attention = false;
    touchMru(lay, tabId);
  }, { animate: !!p.collapsed });
  if (changed) bus.emit('activate', { tabId: tabId, panelId: p.id, kind: l.tabs[tabId].kind, reason: opts.reason || 'user' });
  if (opts.focus) {
    nextFrame(function () {
      var e = instances[tabId];
      if (e && e.instance && e.instance.focus) { try { e.instance.focus(); } catch (_) {} }
      else if (e) e.host.focus({ preventScroll: true });
    });
  }
  if (PMW.strip.reveal) PMW.strip.reveal(tabId);
  return true;
};

/* Push-updates from kinds (labels and marks); never a command. */
var TAB_FIELDS = ['label', 'title', 'icon', 'exitCode', 'agent', 'attention', 'dirty', 'busy', 'readOnly'];
PMW.updateTab = function (tabId, fields) {
  var rec = L().tabs[tabId];
  if (!rec) return;
  var changed = false;
  for (var i = 0; i < TAB_FIELDS.length; i++) {
    var f = TAB_FIELDS[i];
    if (Object.prototype.hasOwnProperty.call(fields, f) && rec[f] !== fields[f]) { rec[f] = fields[f]; changed = true; }
  }
  if (fields.dirty && rec.preview) { rec.preview = false; changed = true; }   // editing keeps a preview tab (D7)
  if (changed) {
    var p = model.panelOf(L(), tabId);
    var el = p && render.panelEl(p.id);
    if (el) PMW.strip.render(el, p, L(), { narrow: PMW.narrow && PMW.narrow.singleColumn(), rects: render.rects() });
    PMW.persist.saveSoon();
  }
};
PM_HOME.update = function (tabId, fields) { PMW.updateTab(tabId, fields); };

PMW.closeTab = function (tabId, opts) {
  opts = opts || {};
  var l = L(), rec = l.tabs[tabId];
  if (!rec) return Promise.resolve(false);
  var e = instances[tabId];
  var ask = e && e.instance && e.instance.canClose ? e.instance.canClose() : true;
  return Promise.resolve(ask).then(function (yes) {
    if (!yes) return false;
    var p = model.panelOf(L(), tabId);
    var panelId = p && p.id;
    var res = commit(CMD.close, { tabId: tabId }, function (d) {
      var r = model.removeTab(d, tabId, { remember: true });
      if (!r) return false;
      // closing the last tab closes the panel unless it is the only panel or locked (then the empty launcher)
      return { panelId: r.panelId };
    });
    if (res.ok) {
      bus.emit('close', { tabId: tabId, panelId: panelId, kind: rec.kind, reason: opts.reason || 'user' });
      if (!opts.quiet) announce(tabLabel(rec) + ' closed');
      var np = model.panel(L(), panelId);
      if (np && np.active) bus.emit('activate', { tabId: np.active, panelId: np.id, kind: L().tabs[np.active].kind, reason: 'close' });
      if (opts.refocus !== false) {
        var target = np ? np.id : L().view.focus;
        if (target) PMW.focusPanelDom(target);
      }
    }
    return res.ok;
  });
};
PMW.closeOthers = function (tabId) {
  var p = model.panelOf(L(), tabId);
  if (!p) return;
  var ids = p.tabs.filter(function (t) { return t !== tabId && !L().tabs[t].pinned; });
  ids.reduce(function (pr, t) { return pr.then(function () { return PMW.closeTab(t, { quiet: true, refocus: false }); }); }, Promise.resolve())
    .then(function () { announce('Other tabs closed'); });
};
PMW.closeToRight = function (tabId) {
  var p = model.panelOf(L(), tabId);
  if (!p) return;
  var ids = p.tabs.slice(p.tabs.indexOf(tabId) + 1).filter(function (t) { return !L().tabs[t].pinned; });
  ids.reduce(function (pr, t) { return pr.then(function () { return PMW.closeTab(t, { quiet: true, refocus: false }); }); }, Promise.resolve());
};

PMW.keepTab = function (tabId) {
  var rec = L().tabs[tabId];
  if (!rec || !rec.preview) return false;
  return commit(CMD.keep, { tabId: tabId }, function (d) { d.tabs[tabId].preview = false; return {}; }, { animate: false }).ok;
};
PMW.pinTab = function (tabId, pinned) {
  var rec = L().tabs[tabId];
  if (!rec) return false;
  var res = commit(pinned ? CMD.pin : CMD.unpin, { tabId: tabId }, function (d) {
    d.tabs[tabId].pinned = !!pinned;
    if (pinned) d.tabs[tabId].preview = false;
    return {};
  });
  if (res.ok) announce(tabLabel(rec) + (pinned ? ' pinned' : ' unpinned'));
  return res.ok;
};
PMW.renameTab = function (tabId, label) {
  var rec = L().tabs[tabId];
  if (!rec) return false;
  label = (label || '').trim().slice(0, 80);
  return commit(CMD.rename, { tabId: tabId, label: label }, function (d) { d.tabs[tabId].userLabel = label || null; return {}; }, { animate: false }).ok;
};
PMW.moveTab = function (tabId, panelId, index, opts) {
  opts = opts || {};
  var l = L();
  var from = model.panelOf(l, tabId);
  if (!from) return false;
  var res = commit(CMD.move, { tabId: tabId, panelId: panelId, index: index }, function (d) {
    var ff = model.panelOf(d, tabId);
    if (ff.id === panelId) {
      var cur = ff.tabs.indexOf(tabId);
      if (index == null) index = ff.tabs.length - 1;
      if (cur === index) return false;
      ff.tabs.splice(cur, 1);
      ff.tabs.splice(index, 0, tabId);
      ff.active = tabId;
      return {};
    }
    if (!model.moveTab(d, tabId, panelId, index)) return false;
    d.view.focus = panelId;
    return {};
  }, { animate: opts.animate !== false });
  if (res.ok && !res.noChange && !opts.quiet) {
    var to = model.panel(L(), panelId);
    var pos = to ? to.tabs.indexOf(tabId) + 1 : 0;
    announce(tabLabel(l.tabs[tabId] || L().tabs[tabId]) + (from.id === panelId ? ' moved to position ' + pos : ' moved to the ' + model.describe(L(), panelId)));
  }
  return res.ok;
};
/* Move a tab into a new panel on an edge of a panel (or of the whole centre with panelId '@root'). */
PMW.moveTabToSplit = function (tabId, panelId, edge, opts) {
  opts = opts || {};
  var l = L();
  var from = model.panelOf(l, tabId);
  if (!from) return false;
  if (from.id === panelId && from.tabs.length === 1) return false;   // splitting a panel by its only tab changes nothing
  var newId = null;
  var res = commit(CMD.move, { tabId: tabId, split: { panelId: panelId, edge: edge } }, function (d) {
    var np = model.newPanel(d, []);
    newId = np.id;
    var ok = panelId === '@root' ? model.insertAtRoot(d, edge, np, opts.ratio || 0.34) : model.insertBeside(d, panelId, edge, np, opts.ratio || 0.5);
    if (!ok) return false;
    if (!model.moveTab(d, tabId, np.id, 0)) return false;
    d.view.focus = np.id;
    return { panelId: np.id };
  });
  if (res.ok) announce(tabLabel(l.tabs[tabId]) + ' split ' + (edge === 'left' || edge === 'right' ? edge : edge === 'top' ? 'up' : 'down') + ' into a new panel');
  return res.ok ? newId : null;
};

PMW.splitPanel = function (panelId, edge, spec) {
  // Split right / down from a panel's menu: a new panel beside it holding a new tab of the panel's usual kind
  // (or `spec`). Without room it says why instead of making two panels below their minimum.
  var l = L(), rects = render.rects();
  var p = model.panel(l, panelId);
  if (!p) return null;
  if (PMW.narrow && PMW.narrow.singleColumn()) { announce('The window is too narrow to split; widen it or close the chat to split.'); return null; }
  if (rects && !geom.splitFits(l, panelId, edge, rects)) {
    PMW.toast(edge === 'right' ? 'There is not room to split this panel side by side. Try Split down.' : 'There is not room to split this panel. Try Split right.');
    return null;
  }
  var s = spec || PMW.defaultSpecFor(panelId);
  return PM_HOME.open(Object.assign({}, s, { where: edge, source: panelId }));
};

PMW.toggleMaximize = function (panelId) {
  var l = L();
  var next = l.view.maximized === panelId ? null : panelId;
  viewAction(UI.maximize, function (lay) { lay.view.maximized = next; if (next) lay.view.focus = next; });
  announce(next ? panelLabelFor(next) + ' maximized. Press Escape to restore.' : 'Panels restored');
  bus.emit('maximize', { panelId: next });
};
PMW.setCollapsed = function (panelId, collapsed) {
  var res = commit(CMD.collapse, { panelId: panelId, collapsed: !!collapsed }, function (d) {
    var p = model.panel(d, panelId);
    if (!p) return false;
    if (!model.parentOf(d, panelId)) return { ok: false, reason: 'only_panel' };
    p.collapsed = !!collapsed;
    if (collapsed && d.view.focus === panelId) {
      var others = model.panels(d).filter(function (x) { return x.id !== panelId && !x.collapsed; });
      if (others[0]) d.view.focus = others[0].id;
    }
    return {};
  });
  if (res.ok) announce(panelLabelFor(panelId) + (collapsed ? ' collapsed to its tabs' : ' expanded'));
  return res.ok;
};
PMW.closePanel = function (panelId) {
  var l = L(), p = model.panel(l, panelId);
  if (!p) return Promise.resolve(false);
  var ids = p.tabs.slice();
  return ids.reduce(function (pr, t) { return pr.then(function (ok) { return ok === false ? false : PMW.closeTab(t, { quiet: true, refocus: false }); }); }, Promise.resolve(true))
    .then(function (ok) {
      if (ok === false) return false;
      var still = model.panel(L(), panelId);
      if (still && model.panels(L()).length > 1) {
        commit(CMD.closePanel, { panelId: panelId }, function (d) { return model.removePanel(d, panelId) ? {} : false; });
      }
      announce('Panel closed');
      return true;
    });
};
PMW.lockPanel = function (panelId, locked) {
  var res = commit(CMD.lock, { panelId: panelId, locked: !!locked }, function (d) {
    var p = model.panel(d, panelId); if (!p) return false; p.locked = !!locked; return {};
  }, { animate: false });
  if (res.ok) announce(locked ? 'Panel locked: files open elsewhere' : 'Panel unlocked');
  return res.ok;
};
PMW.movePanel = function (panelId, targetId, edge) {
  var res = commit(CMD.movePanel, { panelId: panelId, target: { panelId: targetId, edge: edge } }, function (d) {
    return model.movePanel(d, panelId, targetId, edge) ? {} : false;
  });
  if (res.ok) announce(panelLabelFor(panelId) + ' moved');
  return res.ok;
};
PMW.resizeSplit = function (splitId, sizes) {
  return commit(CMD.resize, { splitId: splitId, sizes: sizes }, function (d) { return model.setSizes(d, splitId, sizes) ? {} : false; }, { animate: false }).ok;
};
PMW.reopenClosed = function () {
  var l = L();
  if (!l.closed.length) { announce('No closed tab to reopen'); return false; }
  var item = l.closed[l.closed.length - 1];
  var target = model.panel(l, item.panelId) ? item.panelId : (l.view.focus || model.panels(l)[0].id);
  var res = commit(CMD.reopen, {}, function (d) {
    var it = d.closed.pop();
    if (!it) return false;
    if (d.tabs[it.tab.id]) { var pp = model.panelOf(d, it.tab.id); if (pp) pp.active = it.tab.id; return { reveal: true }; }
    it.tab.preview = false;
    model.addTab(d, target, it.tab, { index: it.index });
    d.view.focus = target;
    return {};
  });
  if (res.ok) { announce(tabLabel(item.tab) + ' reopened'); bus.emit('open', { tabId: item.tab.id, panelId: target, kind: item.tab.kind, created: true, by: 'user' }); }
  return res.ok;
};
PMW.applyNamed = function (name, opts) {
  opts = opts || {};
  var built = PMW.buildNamed(name, opts.fresh ? null : L());
  if (!built) return false;
  var res = commit(opts.reset ? CMD.reset : CMD.applyNamed, { name: name }, function (d) {
    built.revision = d.revision;
    for (var k in d) delete d[k];
    Object.assign(d, model.clone(built));
    return {};
  });
  if (res.ok) {
    PMW.settings.set('panels.layout.named', name);
    var def = PMW.NAMED[name] || PMW.savedLayouts()[name];
    announce((def && def.label ? def.label : name) + ' layout');
  }
  return res.ok;
};
PMW.resetLayout = function () { return PMW.applyNamed('home', { reset: true }); };
PMW.saveNamedLayout = function (name) {
  name = (name || '').trim();
  if (!name) return false;
  var ok = PMW.saveNamed(name, L());
  pushLog(commandLog, { seq: ++cmdSeq, command_id: CMD.saveNamed, args: { name: name }, at: Date.now() });
  pushLog(receiptLog, { seq: cmdSeq, command_id: CMD.saveNamed, outcome: ok ? 'applied' : 'rejected' });
  if (ok) announce('Layout saved as ' + name);
  return ok;
};

/* The panel's usual kind (Ctrl+T, D6): its dedicated kind, else its active tab's kind, else an editor buffer. */
PMW.defaultSpecFor = function (panelId) {
  var l = L(), p = model.panel(l, panelId);
  var role = p ? PMW.panelRole(l, p) : 'documents';
  if (role === 'terminal') return { kind: 'terminal' };
  if (role === 'browser') return { kind: 'browser' };
  if (role === 'dashboard') return { kind: 'dashboard' };
  var rec = p && p.active && l.tabs[p.active];
  if (rec && (rec.kind === 'terminal' || rec.kind === 'browser' || rec.kind === 'dashboard')) return { kind: rec.kind };
  return { kind: 'editor', title: 'Untitled', text: '', edit: true };
};

/* Commands reachable by id (PM_HOME.command) */
Object.assign(COMMAND_HANDLERS, {});
COMMAND_HANDLERS[CMD.open] = function (a) { return PM_HOME.open(a); };
COMMAND_HANDLERS[CMD.close] = function (a) { return PMW.closeTab(a.tabId); };
COMMAND_HANDLERS[CMD.keep] = function (a) { return PMW.keepTab(a.tabId); };
COMMAND_HANDLERS[CMD.pin] = function (a) { return PMW.pinTab(a.tabId, true); };
COMMAND_HANDLERS[CMD.unpin] = function (a) { return PMW.pinTab(a.tabId, false); };
COMMAND_HANDLERS[CMD.rename] = function (a) { return PMW.renameTab(a.tabId, a.label); };
COMMAND_HANDLERS[CMD.move] = function (a) {
  return a.split ? PMW.moveTabToSplit(a.tabId, a.split.panelId, a.split.edge) : PMW.moveTab(a.tabId, a.panelId, a.index);
};
COMMAND_HANDLERS[CMD.reopen] = function () { return PMW.reopenClosed(); };
COMMAND_HANDLERS[CMD.split] = function (a) { return PMW.splitPanel(a.panelId, a.direction === 'down' ? 'bottom' : a.direction === 'right' ? 'right' : a.direction, a.spec); };
COMMAND_HANDLERS[CMD.movePanel] = function (a) { return PMW.movePanel(a.panelId, a.target.panelId, a.target.edge); };
COMMAND_HANDLERS[CMD.resize] = function (a) { return PMW.resizeSplit(a.splitId, a.sizes); };
COMMAND_HANDLERS[CMD.collapse] = function (a) { return PMW.setCollapsed(a.panelId, a.collapsed); };
COMMAND_HANDLERS[CMD.closePanel] = function (a) { return PMW.closePanel(a.panelId); };
COMMAND_HANDLERS[CMD.lock] = function (a) { return PMW.lockPanel(a.panelId, a.locked); };
COMMAND_HANDLERS[CMD.applyNamed] = function (a) { return PMW.applyNamed(a.name); };
COMMAND_HANDLERS[CMD.saveNamed] = function (a) { return PMW.saveNamedLayout(a.name); };
COMMAND_HANDLERS[CMD.reset] = function () { return PMW.resetLayout(); };
COMMAND_HANDLERS[UI.activate] = function (a) { return PMW.activateTab(a.tabId, { focus: !!a.focus }); };
COMMAND_HANDLERS[UI.maximize] = function (a) { return PMW.toggleMaximize(a.panelId); };
