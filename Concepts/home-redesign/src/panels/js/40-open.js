/* Opening things (D7, D8): the one module every caller uses: the file tree and its shim, chat file references, diff
   views, search results, Ctrl+P, the "+" menu, the empty-panel launcher, agents, the terminal's links. CONTRACT
   section 6. Rules in order: one tab per id (reveal, never duplicate, never move); placement by kind affinity; the
   panel's single preview tab for tree clicks; user opens take focus, agent opens land in the background with the
   hollow square; in the narrow centre no new panels are made. */

var HOST_FIELDS = { kind: 1, id: 1, mode: 1, where: 1, by: 1, background: 1, focus: 1, source: 1, label: 1, title: 1, icon: 1, render: 1, pinned: 1, reason: 1 };
var KIND_ALIASES = { file: 'editor', 'editor-buffer': 'editor' };
var bufferSeq = 0;

function normalizeSpec(spec) {
  var s = Object.assign({}, spec || {});
  if (!s.kind && s.path) s.kind = 'editor';
  if (!s.kind && s.id) s.kind = PM_HOME.kindOf(s.id);
  s.kind = KIND_ALIASES[s.kind] || s.kind;
  s.by = s.by || 'user';
  s.agent = /^agent:/.test(s.by) ? s.by.slice(6) : null;
  return s;
}

/* The stable id for a spec: given, or the kind's idFor, or a default per kind. */
/* one tab per canonical id: a kind may map aliases (plan-query -> plan:ap-index, collab-run:X -> room:X) */
function canonicalId(s, id) {
  var k = kindDef(s.kind);
  if (k && typeof k.canonical === 'function') {
    try { var c = k.canonical(id, s); if (c) return c; } catch (_) {}
  }
  return id;
}
function idForSpec(s) {
  if (s.id) return canonicalId(s, s.id);
  var k = kindDef(s.kind);
  if (k && typeof k.idFor === 'function') {
    try { var got = k.idFor(s); if (got) return canonicalId(s, got); } catch (err) { try { console.error('[pm-home] idFor failed', err); } catch (_) {} }
  }
  if (s.kind === 'editor') {
    if (s.path) return 'file:' + s.path;
    bufferSeq += 1;
    return 'buffer:' + Date.now().toString(36) + bufferSeq;
  }
  if (s.kind === 'problems' || s.kind === 'ports') return s.kind;
  if (s.kind === 'dashboard') return 'dashboard:' + (s.board || ('board-' + Date.now().toString(36)));
  if (s.kind === 'output') return 'output:' + (s.channel || 'main');
  if (s.kind === 'debug-console') return 'debug-console:' + (s.session || 'main');
  if (s.kind === 'browser') { bufferSeq += 1; return 'browser:' + Date.now().toString(36) + bufferSeq; }
  bufferSeq += 1;
  return s.kind + ':' + Date.now().toString(36) + bufferSeq;
}

function kindState(s) {
  var st = {};
  for (var k in s) if (!HOST_FIELDS[k] && k !== 'agent' && s[k] !== undefined && typeof s[k] !== 'function') st[k] = s[k];
  return st;
}

/* D7: every file reference a person single-clicks opens as the panel's preview tab; a double click passes mode 'keep';
   Ctrl+P with Enter and the "+" menu's recent files pass 'keep'; agent opens are kept (and in the background). */
function isPreviewOpen(s) {
  if (s.kind !== 'editor' || !s.path) return false;
  if (s.agent) return false;
  return s.mode ? s.mode === 'preview' : true;
}
function newTabRecord(s, id) {
  s = normalizeSpec(s);
  id = id || idForSpec(s);
  return {
    id: id, kind: s.kind, label: s.label || null, title: s.title || null, icon: s.icon || null,
    state: kindState(s), pinned: !!s.pinned, preview: isPreviewOpen(s) && PMW.settings.get('panels.tabs.preview'),
    userLabel: null, attention: false, agent: s.agent || null
  };
}
PMW.newTabRecord = newTabRecord;

/* Placement (rule 2). Returns { panelId } or { split: { panelId, edge } } or { root: edge } */
function place(l, s) {
  var panels = model.panels(l);
  var narrow = PMW.narrow && PMW.narrow.singleColumn();
  var source = s.source && model.panel(l, s.source) ? s.source : l.view.focus;
  var where = s.where || 'auto';
  if (where !== 'auto' && where !== 'tab' && where !== 'panel' && where !== 'right' && where !== 'down' &&
      where !== 'bottom' && where !== 'left' && where !== 'top' && where !== 'split-auto' && model.panel(l, where)) {
    return { panelId: where };
  }
  if (where === 'tab') return { panelId: source || panels[0].id };
  if (where === 'down') where = 'bottom';
  var newPanel = where === 'panel' || where === 'split-auto' || where === 'right' || where === 'bottom' || where === 'left' || where === 'top';
  if (newPanel) {
    if (narrow) return { panelId: nextPanelInSwitcher(l, source), narrowed: true };
    var edge = where === 'panel' || where === 'split-auto' ? fitEdge(l, source) : where;
    if (!edge) return { panelId: largestPanel(l), noRoom: true };
    return { split: { panelId: source, edge: edge } };
  }
  // auto: kind affinity, most recently focused first
  var order = mruPanels(l);
  var dedicated = PMW.isDedicatedKind(s.kind) || s.kind === 'output' || s.kind === 'problems' || s.kind === 'ports' || s.kind === 'debug-console';
  var i, p;
  if (dedicated) {
    for (i = 0; i < order.length; i++) { p = order[i]; if (!p.locked && PMW.panelHolds(l, p, s.kind)) return { panelId: p.id }; }
    if (s.kind !== 'terminal' && s.kind !== 'browser' && s.kind !== 'dashboard') {
      // tool kinds (output, problems, ports, debug console) join the panel holding terminals
      for (i = 0; i < order.length; i++) { p = order[i]; if (!p.locked && PMW.panelHolds(l, p, 'terminal')) return { panelId: p.id }; }
    }
  }
  for (i = 0; i < order.length; i++) {
    p = order[i];
    if (p.locked) continue;
    if (PMW.panelRole(l, p) === 'documents') return { panelId: p.id };
  }
  if (panels.length === 1 && !panels[0].locked) return { panelId: panels[0].id };
  if (narrow) return { panelId: source || panels[0].id };
  var e2 = fitEdge(l, source || panels[0].id);
  if (e2) return { split: { panelId: source || panels[0].id, edge: e2 } };
  return { panelId: largestPanel(l) };
}
function mruPanels(l) {
  var seen = {}, out = [];
  var focus = model.panel(l, l.view.focus);
  if (focus) { out.push(focus); seen[focus.id] = 1; }
  (l.view.mru || []).forEach(function (tid) {
    var p = model.panelOf(l, tid);
    if (p && !seen[p.id]) { seen[p.id] = 1; out.push(p); }
  });
  model.panels(l).forEach(function (p) { if (!seen[p.id]) out.push(p); });
  return out;
}
function fitEdge(l, panelId) {
  var rects = render.rects();
  if (!rects || !rects.panels[panelId]) return 'right';
  if (geom.splitFits(l, panelId, 'right', rects)) return 'right';
  if (geom.splitFits(l, panelId, 'bottom', rects)) return 'bottom';
  return null;
}
function largestPanel(l) {
  var rects = render.rects(), best = null, area = -1;
  model.panels(l).forEach(function (p) {
    var r = rects && rects.panels[p.id];
    var a = r ? r.w * r.h : 0;
    if (a > area && !p.locked) { area = a; best = p.id; }
  });
  return best || model.panels(l)[0].id;
}
function nextPanelInSwitcher(l, from) {
  var ps = model.panels(l);
  var i = ps.map(function (p) { return p.id; }).indexOf(from);
  return ps[(i + 1) % ps.length].id;
}

PM_HOME.open = function (spec) {
  var s = normalizeSpec(spec);
  if (!s.kind) return { ok: false, reason: 'unknown_kind' };
  var l = state.layout;
  if (!l) return { ok: false, reason: 'not_ready' };
  var id = idForSpec(s);
  var background = !!s.background || !!s.agent;
  var focus = s.focus != null ? !!s.focus && !background : !background;

  // 1. one id, one tab: reveal it
  if (l.tabs[id] && model.panelOf(l, id)) {
    var holder = model.panelOf(l, id);
    if (s.mode === 'keep' && l.tabs[id].preview) PMW.keepTab(id);
    if (s.line != null || s.state) {
      var e = instances[id];
      if (e && e.instance && e.instance.reveal) { try { e.instance.reveal(kindState(s)); } catch (_) {} }
      else l.tabs[id].state = Object.assign({}, l.tabs[id].state, kindState(s));
    }
    if (background) {
      if (holder.active !== id) PMW.updateTab(id, { attention: true });
    } else {
      PMW.activateTab(id, { focus: focus, reason: 'reveal' });
    }
    if (s.render) registerRenderer(id, s);
    return { ok: true, tabId: id, panelId: holder.id, created: false };
  }

  // 2-5. a new tab
  var target = place(l, s);
  var rec = newTabRecord(s, id);
  if (background) rec.attention = true;
  if (s.render) registerRenderer(id, s);
  var newPanelId = null;
  var res = commit(CMD.open, { kind: s.kind, id: id, where: s.where || 'auto', by: s.by }, function (d) {
    var pid;
    if (target.split) {
      var np = model.newPanel(d, []);
      var ok = model.insertBeside(d, target.split.panelId, target.split.edge, np, 0.5);
      if (!ok) return false;
      pid = np.id;
      newPanelId = np.id;
    } else pid = target.panelId;
    var panel = model.panel(d, pid);
    if (!panel) return false;
    var activate = !background || !panel.tabs.length;
    model.addTab(d, pid, rec, { activate: activate, after: activate ? null : panel.active });
    if (!background) { d.view.focus = pid; touchMru(d, id); }
    return { panelId: pid };
  });
  if (!res.ok) return { ok: false, reason: res.reason };
  var placed = model.panelOf(state.layout, id);
  var pid2 = placed ? placed.id : null;
  bus.emit('open', { tabId: id, panelId: pid2, kind: s.kind, created: true, by: s.by });
  if (!background) bus.emit('activate', { tabId: id, panelId: pid2, kind: s.kind, reason: 'open' });
  if (background) announce((s.agent ? s.agent + ' opened ' : 'Opened in the background: ') + tabLabel(rec));
  else if (target.narrowed) announce(tabLabel(rec) + ' opened in the next panel: the window is too narrow for a new panel');
  else if (newPanelId) announce(tabLabel(rec) + ' opened in a new panel');
  else if (target.noRoom) announce(tabLabel(rec) + ' opened here: there is not room for a new panel');
  if (focus && pid2) {
    nextFrame(function () {
      var e2 = instances[id];
      if (e2 && e2.instance && e2.instance.focus) { try { e2.instance.focus(); } catch (_) {} }
      else PMW.focusPanelDom(pid2);
    });
  }
  return { ok: true, tabId: id, panelId: pid2, created: true };
};

PM_HOME.openFile = function (path, o) { return PM_HOME.open(Object.assign({ kind: 'editor', path: path }, o || {})); };
PM_HOME.reveal = function (id) {
  if (!state.layout.tabs[id]) return { ok: false, reason: 'not_open' };
  PMW.activateTab(id, { focus: true, reason: 'reveal' });
  return { ok: true, tabId: id };
};
PM_HOME.close = function (id) { return PMW.closeTab(id); };
PM_HOME.closeEditor = PM_HOME.close;
PM_HOME.active = function () {
  var l = state.layout, p = l && model.panel(l, l.view.focus);
  if (!p || !p.active) return null;
  return { tabId: p.active, panelId: p.id, kind: l.tabs[p.active].kind };
};
PM_HOME.activeIn = function (panelId) {
  var l = state.layout, p = l && model.panel(l, panelId);
  if (!p || !p.active) return null;
  return { tabId: p.active, panelId: p.id, kind: l.tabs[p.active].kind };
};
PM_HOME.tabs = function () {
  var l = state.layout, out = [];
  model.panels(l).forEach(function (p) {
    p.tabs.forEach(function (t) {
      var r = l.tabs[t];
      out.push({ tabId: t, panelId: p.id, kind: r.kind, label: tabLabel(r), active: p.active === t, preview: !!r.preview, pinned: !!r.pinned });
    });
  });
  return out;
};
PM_HOME.panels = function () {
  var l = state.layout;
  return model.panels(l).map(function (p) { return { panelId: p.id, tabs: p.tabs.slice(), active: p.active, focused: l.view.focus === p.id, role: PMW.panelRole(l, p) }; });
};

/* ---- the 5.6 Pro chat's openEditor (CONTRACT 6.1): the chat supplies label and body ---- */
var renderers = PMW.renderers = {};
function registerRenderer(id, s) {
  renderers[id] = { render: s.render, label: s.label };
  var e = instances[id];
  if (e && e.instance && e.instance.rerender) e.instance.rerender();
}
PM_HOME.openEditor = function (id, o) {
  o = o || {};
  var label = typeof o.label === 'function' ? o.label(id) : o.label;
  var res = PM_HOME.open({ id: id, kind: o.kind || PM_HOME.kindOf(id) || 'document', label: label || null, title: o.title || null,
    icon: o.icon || null, render: o.render || null, by: o.by || 'user', where: o.where });
  return res.ok ? res.tabId : null;
};
PM_HOME.refresh = function (id) {
  var e = instances[id];
  if (e && e.instance && e.instance.rerender) e.instance.rerender();
};
