/* Named layouts (D2): Home, Build, Terminals 2x2, Focus, plus the user's saved ones. A named layout is a tree of slots;
   applying it keeps every open tab (no terminal is killed, no dirty buffer dropped): each tab goes to the first slot
   that accepts its kind, the rest to the slot marked `rest`, and a slot left empty gets its `ensure` tabs. */

var DEFAULT_TABS = PMW.DEFAULT_TABS = {
  'dashboard:home': { kind: 'dashboard', label: 'Home', pinned: true, state: { board: 'home' } },
  'dashboard:agents': { kind: 'dashboard', label: 'Agents', state: { board: 'agents' } },
  'file:src/main.rs': { kind: 'editor', state: { path: 'src/main.rs' } },
  'file:src/routes/recipes.rs': { kind: 'editor', state: { path: 'src/routes/recipes.rs' } },
  'plan:ap-index': { kind: 'plan', label: 'Tenant-scoped analytics read path', state: { plan: 'ap-index' } },
  'terminal:t1': { kind: 'terminal', state: { profile: 'zsh', cwd: '~/tastebook/api', session: 't1', script: 'idle' } },
  'terminal:t2': { kind: 'terminal', state: { profile: 'zsh', cwd: '~/tastebook/api', session: 't2', script: 'cargo-test' } },
  'output:build': { kind: 'output', label: 'Output', state: { channel: 'build' } }
};

/* slot trees: { dir, sizes, kids } or { slot: name, accepts: [kinds], ensure: [tabIds], rest, active } */
var NAMED = PMW.NAMED = {
  home: {
    label: 'Home',
    tree: { dir: 'col', sizes: [0.6, 0.4], kids: [
      { dir: 'row', sizes: [0.5, 0.5], kids: [
        { slot: 'dash', accepts: ['dashboard'], ensure: ['dashboard:home', 'dashboard:agents'], active: 'dashboard:home' },
        { slot: 'docs', accepts: ['editor', 'plan', 'document', 'artifact', 'run', 'transcript', 'context', 'record', 'browser'], rest: true,
          ensure: ['file:src/main.rs', 'file:src/routes/recipes.rs', 'plan:ap-index'], active: 'file:src/main.rs' }
      ] },
      { slot: 'tools', accepts: ['terminal', 'output', 'problems', 'ports', 'debug-console'], ensure: ['terminal:t1', 'terminal:t2', 'output:build'], active: 'terminal:t1' }
    ] }
  },
  build: {
    label: 'Build',
    tree: { dir: 'col', sizes: [0.62, 0.38], kids: [
      { dir: 'row', sizes: [0.66, 0.34], kids: [
        { slot: 'docs', accepts: ['editor', 'plan', 'document', 'artifact', 'run', 'transcript', 'context', 'record'], rest: true, ensure: ['file:src/main.rs'] },
        { slot: 'side', accepts: ['browser', 'dashboard'], ensure: ['dashboard:home'] }
      ] },
      { dir: 'row', sizes: [0.6, 0.4], kids: [
        { slot: 'term', accepts: ['terminal'], ensure: ['terminal:t1'] },
        { slot: 'tools', accepts: ['output', 'problems', 'ports', 'debug-console'], ensure: ['output:build', 'problems'] }
      ] }
    ] }
  },
  terminals: {
    label: 'Terminals 2x2',
    tree: { dir: 'col', sizes: [0.5, 0.5], kids: [
      { dir: 'row', sizes: [0.5, 0.5], kids: [
        { slot: 't1', accepts: ['terminal'], ensure: ['@terminal'], rest: true },
        { slot: 't2', accepts: ['terminal'], ensure: ['@terminal'] }
      ] },
      { dir: 'row', sizes: [0.5, 0.5], kids: [
        { slot: 't3', accepts: ['terminal'], ensure: ['@terminal'] },
        { slot: 't4', accepts: ['terminal'], ensure: ['@terminal'] }
      ] }
    ] },
    oneEach: 'terminal'
  },
  focus: {
    label: 'Focus',
    tree: { slot: 'all', accepts: null, rest: true }
  }
};
PMW.NAMED_ORDER = ['home', 'build', 'terminals', 'focus'];

function defaultTabRecord(id) {
  var spec = DEFAULT_TABS[id];
  if (!spec) return null;
  return { id: id, kind: spec.kind, label: spec.label || null, title: null, icon: null, state: Object.assign({}, spec.state),
    pinned: !!spec.pinned, preview: false, userLabel: null };
}
PMW.defaultTabRecord = defaultTabRecord;

/* Build a layout from a named definition, distributing `existing` (a previous layout) when given. */
function buildNamed(name, existing, opts) {
  opts = opts || {};
  var def = NAMED[name] || (PMW.savedLayouts && PMW.savedLayouts()[name]);
  if (!def) return null;
  var l = model.empty();
  if (existing) { l.seq = existing.seq || 0; l.closed = (existing.closed || []).slice(); l.view.mru = (existing.view.mru || []).slice(); }
  var slots = [];
  function build(node) {
    if (node.slot) {
      var p = model.newPanel(l, []);
      p.slotName = node.slot;
      p.locked = !!node.locked;          // a saved locked panel survives even when it comes back empty
      p.collapsed = !!node.collapsed;
      slots.push({ def: node, panel: p });
      return p;
    }
    var kids = node.kids.map(build);
    return model.newSplit(l, node.dir, kids, node.sizes.slice());
  }
  l.root = build(def.tree);
  var restSlot = slots.filter(function (s) { return s.def.rest; })[0] || slots[0];
  // 1. existing tabs, in their old order (panel by panel). A saved layout's slot that held a tab when it was saved
  //    takes it back; the others go to a slot that accepts their kind, preferring one nothing has gone to yet (so two
  //    slots that accept the same kinds both keep a tab: a generalised oneEach), else the first that accepts them.
  if (existing) {
    var focusTab = null;
    var fp = existing.view && existing.view.focus && model.panel(existing, existing.view.focus);
    if (fp) focusTab = fp.active;
    var order = [];
    model.panels(existing).forEach(function (op) { op.tabs.forEach(function (tid) { if (existing.tabs[tid]) order.push(tid); }); });
    var targetOf = {}, used = {};
    order.forEach(function (tid) {
      for (var i = 0; i < slots.length; i++) {
        if (slots[i].def.tabs && slots[i].def.tabs.indexOf(tid) >= 0) { targetOf[tid] = slots[i]; used[i] = true; return; }
      }
    });
    order.forEach(function (tid) {
      if (targetOf[tid]) return;
      var rec = existing.tabs[tid];
      var first = null, fresh = null;
      for (var i = 0; i < slots.length; i++) {
        var acc = slots[i].def.accepts;
        if (!acc) { if (def.saved) continue; first = first || slots[i]; break; }   // a saved empty panel (older records) takes nothing new
        if (acc.indexOf(rec.kind) < 0) continue;
        if (!first) first = slots[i];
        if (!used[i]) { fresh = slots[i]; break; }
      }
      var target = fresh || (def.oneEach === rec.kind ? null : first);
      if (target) used[slots.indexOf(target)] = true;   // a tab sent to the rest slot does not fill it for its kind
      targetOf[tid] = target || restSlot;
    });
    order.forEach(function (tid) {
      var copy = JSON.parse(JSON.stringify(existing.tabs[tid]));
      // added as a kept tab: addTab replaces a panel's preview in place, and two panels' previews meeting in one slot
      // would delete one. The flag goes back on afterwards; normalize keeps one preview per panel and keeps the rest.
      var wasPreview = !!copy.preview;
      copy.preview = false;
      model.addTab(l, targetOf[tid].panel.id, copy, { activate: false });
      if (wasPreview && l.tabs[copy.id]) l.tabs[copy.id].preview = true;
    });
    if (focusTab && l.tabs[focusTab]) {
      var holder = model.panelOf(l, focusTab);
      if (holder) { holder.active = focusTab; l.view.focus = holder.id; }
    }
  }
  // 2. ensure tabs in empty slots
  slots.forEach(function (s) {
    if (s.panel.tabs.length || !s.def.ensure) return;
    s.def.ensure.forEach(function (tid) {
      if (tid === '@terminal') {
        var rec = PMW.newTabRecord ? PMW.newTabRecord({ kind: 'terminal', profile: 'zsh', cwd: '~/tastebook' }) : null;
        if (rec) model.addTab(l, s.panel.id, rec, { activate: false });
        return;
      }
      if (l.tabs[tid]) return;
      var r = defaultTabRecord(tid);
      if (r) model.addTab(l, s.panel.id, r, { activate: false });
    });
  });
  // 3. each slot's active tab: the slot's named tab on a fresh layout, else the first tab
  slots.forEach(function (s) {
    var p = s.panel;
    var keep = existing && p.active && p.tabs.indexOf(p.active) >= 0 && p.tabs.indexOf(p.active) !== 0;
    if (!keep && s.def.active && p.tabs.indexOf(s.def.active) >= 0) p.active = s.def.active;
    if (!p.active || p.tabs.indexOf(p.active) < 0) p.active = p.tabs[0] || null;
    delete p.slotName;
  });
  l.named = name;
  var focusSet = !!l.view.focus;
  model.normalize(l, { keepEmpty: !!opts.keepEmpty });
  if (!focusSet || !model.panel(l, l.view.focus)) {
    var docs = slots.filter(function (s) { return s.def.rest; })[0];
    l.view.focus = docs && model.panel(l, docs.panel.id) ? docs.panel.id : (model.panels(l)[0] || {}).id || null;
  }
  return l;
}
PMW.buildNamed = buildNamed;

/* Saved layouts: the user's own trees (shape, sizes, each panel's tabs, lock and collapse). Applied, each tab still
   open goes back to its own panel; the rest are distributed like a named layout. */
var SAVED_KEY = 'pm.home.panels.saved:v1';
PMW.savedLayouts = function () { return store.get(SAVED_KEY) || {}; };
PMW.saveNamed = function (name, layout) {
  function shape(n) {
    if (n.t === 'panel') {
      var kinds = {};
      n.tabs.forEach(function (t) { var r = layout.tabs[t]; if (r) kinds[r.kind] = 1; });
      // the tab ids bring each tab back to its own slot; an empty panel accepts nothing new (it is kept by its lock)
      return { slot: n.id, accepts: Object.keys(kinds), tabs: n.tabs.slice(), active: n.active || null,
        locked: !!n.locked, collapsed: !!n.collapsed };
    }
    return { dir: n.dir, sizes: n.sizes.slice(), kids: n.kids.map(shape) };
  }
  var all = PMW.savedLayouts();
  var tree = shape(layout.root);
  // the first slot that accepts documents takes the rest
  var marked = false;
  (function mark(n) {
    if (marked) return;
    if (n.slot) { if ((n.accepts || []).some(function (k) { return PMW.isDocumentKind(k); })) { n.rest = true; marked = true; } return; }
    n.kids.forEach(mark);
  })(tree);
  if (!marked) (function first(n) { if (n.slot) { n.rest = true; return; } first(n.kids[0]); })(tree);
  all[name] = { label: name, tree: tree, saved: true };
  return store.set(SAVED_KEY, all);
};
