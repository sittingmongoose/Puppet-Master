/* The panels' menus, all on PMW.menu: the "+" menu (D6), the "+N" list (D5), the panel menu, the tab menu and the
   narrow switcher. Opening any of them is view-only; each leaf dispatches exactly one command. */

var menus = PMW.menus = {};
var RECENT_KEY = 'pm.home.recent:v1';

/* recent files (the "+" menu's inline three, the empty launcher's five) */
PMW.recent = {
  list: function () { return store.get(RECENT_KEY) || ['src/routes/recipes.rs', 'PRD.md', 'web/src/routes/+page.svelte']; },
  push: function (path) {
    if (!path) return;
    var l = PMW.recent.list().filter(function (p) { return p !== path; });
    l.unshift(path);
    store.set(RECENT_KEY, l.slice(0, 12));
  }
};
bus.on('open', function (e) {
  var rec = state.layout && state.layout.tabs[e.tabId];
  if (rec && rec.kind === 'editor' && rec.state && rec.state.path) PMW.recent.push(rec.state.path);
});

function openIn(panelId, spec, newPanel) {
  return PM_HOME.open(Object.assign({}, spec, { where: newPanel ? 'panel' : panelId, source: panelId }));
}

/* the kind rows, from the registry (CONTRACT section 7); a kind joins through its `plus` field */
PMW.plusRows = function (panelId, o) {
  o = o || {};
  var rows = [];
  var list = Object.keys(KINDS).map(function (k) { return KINDS[k]; }).filter(function (k) { return k.plus; });
  list.sort(function (a, b) { return (a.plus.order || 99) - (b.plus.order || 99); });
  list.forEach(function (k) {
    var p = k.plus;
    if (p.group) return;   // grouped rows (Output, Problems, Ports, Debug Console) are added below
    var row = {
      id: 'kind-' + k.id, label: p.label || k.label, kind: k.icon, right: p.shortcut || '', keywords: (p.keywords || '') + ' ' + k.id,
      run: function (info) {
        // a picker hangs from the control that asked for it (the launcher's row button), else from the "+" button
        if (p.pick) { p.pick({ panelId: panelId, newPanel: !!info.alt, anchor: info.anchor || o.anchor }); return; }
        openIn(panelId, p.spec(null), !!info.alt);
      },
      alt: { label: 'Open in new panel', run: function (info) {
        if (p.pick) { p.pick({ panelId: panelId, newPanel: true, anchor: (info && info.anchor) || o.anchor }); return; }
        openIn(panelId, p.spec(null), true);
      } }
    };
    var sub = typeof p.sub === 'function' ? (function () { try { return p.sub(); } catch (_) { return []; } })() : null;
    if (sub && sub.length) {
      row.links = sub.slice(0, p.subMax || 4).map(function (s) {
        return { label: s.label, title: s.detail || s.label, run: function (info) { openIn(panelId, p.spec(s.id), !!(info && info.alt)); } };
      });
    }
    rows.push(row);
  });
  var tools = list.filter(function (k) { return k.plus.group === 'tools'; });
  if (tools.length) {
    rows.push({
      id: 'tools', label: tools.map(function (k) { return k.plus.label || k.label; }).join(', ').replace(/, ([^,]*)$/, ', $1'),
      kind: 'output', keywords: 'output problems ports debug console',
      submenu: function () {
        return { id: 'plus-tools', title: 'Output, Problems, Ports, Debug Console', rows: tools.map(function (k) {
          return { id: 'kind-' + k.id, label: k.plus.label || k.label, kind: k.icon, right: k.plus.shortcut || '',
            run: function (info) { openIn(panelId, k.plus.spec(null), !!info.alt); },
            alt: { label: 'Open in new panel', run: function () { openIn(panelId, k.plus.spec(null), true); } } };
        }) };
      }
    });
  }
  return rows;
};

menus.plus = function (panelId, anchor) {
  var rows = PMW.plusRows(panelId, { anchor: anchor });
  // the File row gets three recent files inline (D6)
  rows.forEach(function (r) {
    if (r.id === 'kind-editor') {
      r.links = PMW.recent.list().slice(0, 3).map(function (path) {
        return { label: path.split('/').pop(), title: path, run: function (info) { openIn(panelId, { kind: 'editor', path: path, mode: 'keep' }, !!(info && info.alt)); } };
      });
    }
  });
  var narrow = PMW.narrow && PMW.narrow.singleColumn();
  var l = state.layout;
  var closedN = l.closed.length;
  var actions = [
    { id: 'split-right', label: 'Split right', right: KEYS.splitRight, icon: 'splitRight', disabled: narrow, reason: 'The window is too narrow to split', run: function () { PMW.splitPanel(panelId, 'right'); } },
    { id: 'split-down', label: 'Split down', right: KEYS.splitDown, icon: 'splitDown', disabled: narrow, reason: 'The window is too narrow to split', run: function () { PMW.splitPanel(panelId, 'bottom'); } },
    { id: 'reopen', label: 'Reopen closed tab', right: KEYS.reopen, icon: 'reopen', disabled: !closedN, reason: 'No closed tab yet', run: function () { PMW.reopenClosed(); } }
  ];
  return menu.open(anchor, {
    id: 'plus:' + panelId, search: { placeholder: 'Open anything: kinds, files, URLs' }, width: 320,
    sections: [{ rows: rows }, { rows: actions }],
    filter: function (q) { return PMW.quickOpenSections(panelId, q, rows, actions); }
  });
};

/* typing in the "+" field: the kind rows that match, then files, then a URL row when it looks like one */
PMW.quickOpenSections = function (panelId, q, rows, actions) {
  var out = [{ rows: rows }];
  var files = PMW.fileIndex ? PMW.fileIndex(q, 6) : [];
  if (files.length) out.push({ label: 'Files', rows: files.map(function (path) {
    return { id: 'file:' + path, label: path.split('/').pop(), sub: path, kind: 'file', keywords: path,
      run: function (info) { openIn(panelId, { kind: 'editor', path: path, mode: 'keep' }, !!info.alt); },
      alt: { label: 'Open in new panel', run: function () { openIn(panelId, { kind: 'editor', path: path, mode: 'keep' }, true); } } };
  }) });
  if (/^(https?:\/\/|localhost|[\w-]+\.[a-z]{2,})(\S*)$/i.test(q.trim())) {
    var url = /^https?:/i.test(q.trim()) ? q.trim() : 'http://' + q.trim();
    out.push({ label: 'Address', rows: [{ id: 'url', label: 'Open ' + q.trim(), kind: 'browser', keywords: q,
      run: function (info) { openIn(panelId, { kind: 'browser', url: url }, !!info.alt); },
      alt: { label: 'Open in new panel', run: function () { openIn(panelId, { kind: 'browser', url: url }, true); } } }] });
  }
  out.push({ rows: actions });
  return out;
};

/* "+N": the hidden tabs, grouped by kind, searchable; Delete closes, Alt+Enter opens in a new panel */
var KIND_GROUP_ORDER = ['editor', 'terminal', 'browser', 'dashboard', 'plan', 'document', 'artifact', 'run', 'transcript', 'context', 'record', 'output', 'problems', 'ports', 'debug-console'];
menus.overflow = function (panelId, anchor, o) {
  o = o || {};
  var l = state.layout, p = model.panel(l, panelId);
  if (!p) return null;
  var s = strip.stateOf(panelId);
  var hiddenIds = o.all ? p.tabs.slice() : (s ? s.hidden.slice() : []);
  function live() { var lay = state.layout, pp = model.panel(lay, panelId); return (o.all ? (pp ? pp.tabs : []) : hiddenIds).filter(function (t) { return !!lay.tabs[t]; }); }
  function sections() {
    var lay = state.layout, pp = model.panel(lay, panelId);
    var ids = live();
    var groups = {};
    ids.forEach(function (t) { var k = lay.tabs[t].kind; (groups[k] = groups[k] || []).push(t); });
    var keys = Object.keys(groups).sort(function (a, b) { return KIND_GROUP_ORDER.indexOf(a) - KIND_GROUP_ORDER.indexOf(b); });
    return keys.map(function (k) {
      var def = kindDef(k);
      return { label: def ? def.group : k, rows: groups[k].map(function (t) {
        var r = lay.tabs[t];
        return {
          id: t, label: tabLabel(r), sub: r.state && r.state.path ? r.state.path : (r.title || ''), kind: tabIcon(r),
          right: r.dirty ? 'unsaved' : (r.pinned ? 'pinned' : ''), current: pp && pp.active === t,
          run: function () { PMW.activateTab(t, { focus: true }); },
          // returns the close's promise: the menu refreshes once the tab is really gone (or its canClose said no)
          close: function () { return PMW.closeTab(t, { refocus: false }); }
        };
      }) };
    });
  }
  function title() { var n = live().length; return o.all ? 'Tabs in this panel' : n + ' more tab' + (n === 1 ? '' : 's'); }
  // sections and title are functions, so a row closed from the list leaves it and the count follows; the "+N" list
  // closes once nothing is hidden any more
  return menu.open(anchor, { id: 'overflow:' + panelId, title: title,
    search: { placeholder: 'Find a tab' }, width: 320, sections: sections, empty: 'No tabs match.',
    onItemClosed: function () { return live().length > 0; } });
};

/* every tab in every panel (Ctrl+Shift+A) */
menus.allTabs = function (anchor) {
  function secs() {
    var l = state.layout;
    return model.panels(l).map(function (p, i) {
      return { label: 'Panel ' + (i + 1) + ': ' + model.describe(l, p.id), rows: p.tabs.map(function (t) {
        var r = l.tabs[t];
        return { id: t, label: tabLabel(r), sub: r.state && r.state.path ? r.state.path : '', kind: tabIcon(r), current: p.active === t,
          run: function () { PMW.activateTab(t, { focus: true }); }, close: function () { return PMW.closeTab(t, { refocus: false }); } };
      }) };
    });
  }
  // no control to hang from: a point near the top of the centre (never the centre itself as the anchor)
  return menu.open(anchor || null, { id: 'alltabs', title: 'All tabs', search: { placeholder: 'Find a tab in any panel' }, width: 360, sections: secs,
    at: anchor ? null : centreTopPoint() });
};

/* the panel menu (the strip's options button): split, maximize, collapse, lock, layouts, move, close */
menus.panel = function (panelId, anchor) {
  var l = state.layout, p = model.panel(l, panelId);
  if (!p) return null;
  var narrow = PMW.narrow && PMW.narrow.singleColumn();
  var maxed = l.view.maximized === panelId;
  var only = model.panels(l).length === 1;
  var rows = [
    { id: 'split-right', label: 'Split right', right: KEYS.splitRight, icon: 'splitRight', disabled: narrow, reason: 'The window is too narrow to split', run: function () { PMW.splitPanel(panelId, 'right'); } },
    { id: 'split-down', label: 'Split down', right: KEYS.splitDown, icon: 'splitDown', disabled: narrow, reason: 'The window is too narrow to split', run: function () { PMW.splitPanel(panelId, 'bottom'); } },
    { id: 'max', label: maxed ? 'Restore panels' : 'Maximize', right: KEYS.maximize, icon: maxed ? 'restore' : 'maximize', disabled: only || narrow, reason: only ? 'This is the only panel' : 'The window is too narrow', run: function () { PMW.toggleMaximize(panelId); } },
    { id: 'collapse', label: p.collapsed ? 'Expand' : 'Collapse to tabs', icon: 'panel', disabled: only || (!p.collapsed && lastOpenInSplit(l, panelId)),
      reason: only ? 'This is the only panel' : 'The panels beside it are already collapsed', run: function () { PMW.setCollapsed(panelId, !p.collapsed); } },
    '-',
    { id: 'move', label: 'Move panel', icon: 'grip', disabled: only, reason: 'This is the only panel', submenu: function () { return menus.moveTargets(panelId); } },
    { id: 'lock', label: p.locked ? 'Unlock panel' : 'Lock panel', sub: p.locked ? 'Files can open here again' : 'Files open in other panels', icon: 'lock', run: function () { PMW.lockPanel(panelId, !p.locked); } },
    { id: 'tabs', label: 'Show all tabs in this panel', icon: 'moreH', disabled: !p.tabs.length, run: function () { menus.overflow(panelId, anchor, { all: true }); } },
    '-',
    { id: 'layouts', label: 'Layouts', icon: 'layout', submenu: function () { return menus.layouts(anchor); } },
    '-',
    { id: 'close-others', label: 'Close other tabs', icon: 'close', disabled: p.tabs.length < 2, run: function () { if (p.active) PMW.closeOthers(p.active); } },
    { id: 'close', label: 'Close panel', sub: p.tabs.length ? p.tabs.length + ' tab' + (p.tabs.length === 1 ? '' : 's') + ' close with it' : '', icon: 'close', danger: true, run: function () { PMW.closePanel(panelId); } }
  ];
  return menu.open(anchor, { id: 'panel:' + panelId, title: panelTitle(panelId), rows: rows, width: 280, align: 'end' });
};
function lastOpenInSplit(l, panelId) {
  var parent = model.parentOf(l, panelId);
  if (!parent) return true;
  return parent.kids.every(function (k) { return k.id === panelId || (k.t === 'panel' && k.collapsed); });
}
function panelTitle(panelId) {
  var l = state.layout, p = model.panel(l, panelId);
  var role = p ? PMW.panelRole(l, p) : 'documents';
  var names = { documents: 'Panel', terminal: 'Terminal panel', browser: 'Browser panel', dashboard: 'Dashboard panel', tools: 'Tools panel' };
  return (names[role] || 'Panel') + ', ' + model.describe(l, panelId);
}

/* where a panel can move: beside each other panel, or to an edge of the whole centre (only offers that fit) */
menus.moveTargets = function (panelId) {
  var l = state.layout, rows = [];
  var rects = PMW.treeRects ? PMW.treeRects() : render.rects();   // never the maximized rects
  model.panels(l).forEach(function (q) {
    if (q.id === panelId) return;
    var name = tabLabel(l.tabs[q.active]) + ' panel';
    [['left', 'Left of '], ['right', 'Right of '], ['top', 'Above '], ['bottom', 'Below ']].forEach(function (e) {
      var fits = rects && geom.splitFits(l, q.id, e[0], rects, PMW.panelMin(l, model.panel(l, panelId)));
      if (fits) rows.push({ id: q.id + e[0], label: e[1] + name, icon: e[0] === 'left' || e[0] === 'right' ? 'splitRight' : 'splitDown', run: function () { PMW.movePanel(panelId, q.id, e[0]); } });
    });
    rows.push({ id: q.id + 'merge', label: 'Into ' + name + ' (as tabs)', icon: 'panel', run: function () { PMW.mergePanel(panelId, q.id); } });
  });
  [['left', 'Left edge of the centre'], ['right', 'Right edge of the centre'], ['top', 'Top of the centre'], ['bottom', 'Bottom of the centre']].forEach(function (e) {
    rows.push({ id: 'root' + e[0], label: e[1], icon: 'layout', run: function () { PMW.movePanel(panelId, '@root', e[0]); } });
  });
  return { id: 'move:' + panelId, title: 'Move panel', search: { placeholder: 'Find a place' }, rows: rows };
};
PMW.mergePanel = function (panelId, intoId) {
  var res = commit(CMD.movePanel, { panelId: panelId, target: { panelId: intoId, edge: 'center' } }, function (d) {
    var from = model.panel(d, panelId), to = model.panel(d, intoId);
    if (!from || !to) return false;
    from.tabs.slice().forEach(function (t) { model.moveTab(d, t, intoId); });
    d.view.focus = intoId;
    return {};
  });
  if (res.ok) announce('Tabs moved into the ' + model.describe(state.layout, intoId));
  return res.ok;
};

/* named layouts */
menus.layouts = function () {
  var current = state.layout.named;
  var rows = PMW.NAMED_ORDER.map(function (name) {
    return { id: name, label: PMW.NAMED[name].label, checked: current === name, run: function () { PMW.applyNamed(name); } };
  });
  var saved = PMW.savedLayouts();
  Object.keys(saved).forEach(function (name) { rows.push({ id: 'saved:' + name, label: name, checked: current === name, run: function () { PMW.applyNamed(name); } }); });
  rows.push('-');
  rows.push({ id: 'save', label: 'Save this layout...', icon: 'keep', run: function () {
    nextFrame(function () { menu.prompt(state.centre.querySelector('.pmw-panel[data-focused] .pmw-pmenu') || null, { title: 'Save layout as', ok: 'Save', value: '', done: function (v) { PMW.saveNamedLayout(v); } }); });
  } });
  rows.push({ id: 'reset', label: 'Restore home layout', icon: 'reopen', sub: 'Open tabs stay open', run: function () { PMW.resetLayout(); } });
  return { id: 'layouts', title: 'Layouts', rows: rows };
};

/* the tab menu (right click, Shift+F10) */
menus.tab = function (tabId, anchor, at) {
  var l = state.layout, rec = l.tabs[tabId], p = model.panelOf(l, tabId);
  if (!rec || !p) return null;
  var narrow = PMW.narrow && PMW.narrow.singleColumn();
  var rows = [
    { id: 'close', label: 'Close', right: KEYS.closeTab, icon: 'close', run: function () { PMW.closeTab(tabId); } },
    { id: 'close-others', label: 'Close others', disabled: p.tabs.length < 2, run: function () { PMW.closeOthers(tabId); } },
    { id: 'close-right', label: 'Close to the right', disabled: p.tabs.indexOf(tabId) === p.tabs.length - 1, run: function () { PMW.closeToRight(tabId); } },
    '-',
    rec.preview ? { id: 'keep', label: 'Keep open', sub: 'This preview tab will not be replaced', icon: 'keep', run: function () { PMW.keepTab(tabId); } } : null,
    { id: 'pin', label: rec.pinned ? 'Unpin' : 'Pin', icon: 'pin', run: function () { PMW.pinTab(tabId, !rec.pinned); } },
    { id: 'rename', label: 'Rename...', icon: 'rename', run: function () {
      nextFrame(function () { menu.prompt(strip.tabEl(tabId) || anchor, { title: 'Rename tab', value: tabLabel(rec), ok: 'Rename', done: function (v) { PMW.renameTab(tabId, v); } }); });
    } },
    '-',
    { id: 'new-panel', label: 'Move to new panel', right: 'Alt+click', icon: 'newPanel', disabled: narrow || p.tabs.length < 2, reason: narrow ? 'The window is too narrow' : 'It is the only tab here', run: function () { PMW.moveTabToNewPanel(tabId); } },
    { id: 'move-to', label: 'Move to panel', icon: 'panel', disabled: model.panels(l).length < 2, submenu: function () {
      return { id: 'moveto:' + tabId, title: 'Move to panel', rows: model.panels(state.layout).filter(function (q) { return q.id !== p.id; }).map(function (q) {
        return { id: q.id, label: tabLabel(state.layout.tabs[q.active]) + ' panel', sub: model.describe(state.layout, q.id), icon: 'panel', run: function () { PMW.moveTab(tabId, q.id); } };
      }) };
    } },
    { id: 'split-right', label: 'Split right with this tab', icon: 'splitRight', disabled: narrow, run: function () { PMW.moveTabToSplit(tabId, p.id, 'right'); } },
    { id: 'split-down', label: 'Split down with this tab', icon: 'splitDown', disabled: narrow, run: function () { PMW.moveTabToSplit(tabId, p.id, 'bottom'); } }
  ].filter(Boolean);
  var k = kindDef(rec.kind);
  if (k && typeof k.tabMenu === 'function') {
    try { var extra = k.tabMenu(tabId, rec); if (extra && extra.length) rows = extra.concat(['-'], rows); } catch (_) {}
  }
  return menu.open(anchor, { id: 'tab:' + tabId, title: tabLabel(rec), rows: rows, width: 270, at: at || null });
};

/* the narrow switcher: every panel, as a list (D4 step 3) */
menus.switcher = function (panelId, anchor) {
  var l = state.layout;
  var rows = model.panels(l).map(function (q, i) {
    var r = q.active && l.tabs[q.active];
    return { id: q.id, label: (i + 1) + '. ' + (r ? tabLabel(r) : 'Empty panel'), sub: q.tabs.length + ' tab' + (q.tabs.length === 1 ? '' : 's') + ', ' + model.describe(l, q.id),
      current: q.id === panelId, icon: 'panel', run: function () { PMW.focusPanel(q.id); render.schedule({ animate: true }); } };
  });
  return menu.open(anchor, { id: 'switcher', title: 'Panels', rows: rows, width: 300 });
};
