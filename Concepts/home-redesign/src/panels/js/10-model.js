/* The layout model (D1): an n-ary split tree whose leaves are panels (tab groups). Pure functions over plain JSON, so a
   command can build its draft on a copy and roll back by dropping it.

   layout = {
     schema: 'pm.home.panels.v1', revision, seq,
     root: Node,
     tabs: { <tabId>: { id, kind, label, title, icon, state, pinned, preview, userLabel } },
     view: { focus: <panelId>, maximized: <panelId>|null, mru: [<tabId>] },   // view state (ui.* actions)
     closed: [ { tab, panelId, index } ],                                      // reopen stack, newest last
     named: 'home' | 'build' | 'terminals' | 'focus' | <saved name> | null
   }
   Node = { t: 'split', id, dir: 'row'|'col', kids: [Node], sizes: [fraction] }   (sizes sum to 1)
        | { t: 'panel', id, tabs: [tabId], active: tabId|null, locked, collapsed }

   Invariants (normalize() restores them, validate() reports what it cannot): every leaf is a panel; a split has at
   least two kids and never the same direction as its parent; sizes are positive and sum to 1; every tab is in exactly
   one panel; an empty panel survives only when it is the only panel or locked; pinned tabs come first; a panel has at
   most one preview tab. Insertion takes space only from the neighbour; removal gives it back to the neighbour. */

var SCHEMA = 'pm.home.panels.v1';
var CLOSED_MAX = 20;
var MRU_MAX = 40;
var MIN_FRACTION = 0.02;
var model = PMW.model = {};

model.SCHEMA = SCHEMA;
model.clone = function (l) { return JSON.parse(JSON.stringify(l)); };
model.same = function (a, b) {
  var x = Object.assign({}, a, { revision: 0 }), y = Object.assign({}, b, { revision: 0 });
  return JSON.stringify(x) === JSON.stringify(y);
};
model.empty = function () {
  return { schema: SCHEMA, revision: 0, seq: 0, root: null, tabs: {}, view: { focus: null, maximized: null, mru: [] }, closed: [], named: null };
};

function nextId(l, prefix) { l.seq = (l.seq || 0) + 1; return prefix + l.seq; }
model.newPanel = function (l, tabs) {
  return { t: 'panel', id: nextId(l, 'p'), tabs: (tabs || []).slice(), active: tabs && tabs.length ? tabs[0] : null, locked: false, collapsed: false };
};
model.newSplit = function (l, dir, kids, sizes) {
  return { t: 'split', id: nextId(l, 's'), dir: dir, kids: kids, sizes: sizes || kids.map(function () { return 1 / kids.length; }) };
};

/* walk(node, fn(node, parent, index, depth)); return false from fn to stop descending */
function walk(node, fn, parent, index, depth) {
  if (!node) return;
  if (fn(node, parent || null, index == null ? -1 : index, depth || 0) === false) return;
  if (node.t === 'split') for (var i = 0; i < node.kids.length; i++) walk(node.kids[i], fn, node, i, (depth || 0) + 1);
}
model.walk = walk;

model.panels = function (l) {
  var out = [];
  walk(l.root, function (n) { if (n.t === 'panel') out.push(n); });
  return out;
};
model.find = function (l, id) {
  var hit = null;
  walk(l.root, function (n, p, i) { if (hit) return false; if (n.id === id) { hit = { node: n, parent: p, index: i }; return false; } });
  return hit;
};
model.panel = function (l, id) { var f = model.find(l, id); return f && f.node.t === 'panel' ? f.node : null; };
model.panelOf = function (l, tabId) {
  var hit = null;
  walk(l.root, function (n) { if (hit) return false; if (n.t === 'panel' && n.tabs.indexOf(tabId) >= 0) { hit = n; return false; } });
  return hit;
};
model.parentOf = function (l, id) { var f = model.find(l, id); return f ? f.parent : null; };
/* the path of split ancestors from the root down to the node */
model.ancestors = function (l, id) {
  var path = [];
  function rec(n) {
    if (n.id === id) return true;
    if (n.t !== 'split') return false;
    for (var i = 0; i < n.kids.length; i++) { path.push({ split: n, index: i }); if (rec(n.kids[i])) return true; path.pop(); }
    return false;
  }
  return l.root && rec(l.root) ? path : [];
};

/* ---- tabs ---- */
model.addTab = function (l, panelId, rec, opts) {
  opts = opts || {};
  var p = model.panel(l, panelId);
  if (!p || !rec || !rec.id) return false;
  if (l.tabs[rec.id] && model.panelOf(l, rec.id)) return false;   // one id, one tab
  l.tabs[rec.id] = rec;
  if (rec.preview) {
    for (var i = 0; i < p.tabs.length; i++) {
      var old = l.tabs[p.tabs[i]];
      if (old && old.preview) {                     // the panel's single preview tab is replaced in place
        var at = i;
        p.tabs.splice(at, 1, rec.id);
        delete l.tabs[old.id];
        if (p.active === old.id || opts.activate !== false) p.active = rec.id;
        return true;
      }
    }
  }
  var index = opts.index == null ? -1 : opts.index;
  if (index < 0 || index > p.tabs.length) {
    var after = opts.after != null ? p.tabs.indexOf(opts.after) : -1;
    index = after >= 0 ? after + 1 : p.tabs.length;
  }
  p.tabs.splice(index, 0, rec.id);
  if (opts.activate !== false || !p.active) p.active = rec.id;
  if (p.collapsed && opts.activate !== false) p.collapsed = false;
  return true;
};
model.removeTab = function (l, tabId, opts) {
  opts = opts || {};
  var p = model.panelOf(l, tabId);
  if (!p) return false;
  var i = p.tabs.indexOf(tabId);
  p.tabs.splice(i, 1);
  var rec = l.tabs[tabId];
  if (!opts.keepRecord) delete l.tabs[tabId];
  if (opts.remember && rec) {
    l.closed.push({ tab: rec, panelId: p.id, index: i });
    if (l.closed.length > CLOSED_MAX) l.closed.splice(0, l.closed.length - CLOSED_MAX);
  }
  if (p.active === tabId) {
    // VS Code and Chrome: activate the most recently used remaining tab of this panel, else the neighbour
    var mru = (l.view.mru || []).filter(function (id) { return p.tabs.indexOf(id) >= 0; });
    p.active = mru.length ? mru[0] : (p.tabs[Math.min(i, p.tabs.length - 1)] || null);
  }
  return { panelId: p.id, index: i, record: rec };
};
model.moveTab = function (l, tabId, toPanelId, index) {
  var from = model.panelOf(l, tabId), to = model.panel(l, toPanelId);
  if (!from || !to) return false;
  var oldIndex = from.tabs.indexOf(tabId);
  from.tabs.splice(oldIndex, 1);
  if (from.active === tabId) from.active = from.tabs[Math.min(oldIndex, from.tabs.length - 1)] || null;
  if (index == null || index < 0 || index > to.tabs.length) index = to.tabs.length;
  to.tabs.splice(index, 0, tabId);
  to.active = tabId;
  to.collapsed = false;
  var rec = l.tabs[tabId];
  if (rec && rec.preview && from !== to) {
    // a moved preview tab is kept (VS Code: dragging a preview tab makes it permanent)
    rec.preview = false;
  }
  return true;
};

/* ---- splits ---- */
var EDGE_DIR = { left: 'row', right: 'row', top: 'col', bottom: 'col' };
var EDGE_BEFORE = { left: true, top: true, right: false, bottom: false };
model.EDGE_DIR = EDGE_DIR;

/* Insert node beside targetId on edge. The new node takes `ratio` of the target's share; nothing else changes size. */
model.insertBeside = function (l, targetId, edge, node, ratio) {
  ratio = ratio == null ? 0.5 : clamp(ratio, 0.1, 0.9);
  var dir = EDGE_DIR[edge], before = EDGE_BEFORE[edge];
  if (!dir) return false;
  var f = model.find(l, targetId);
  if (!f) return false;
  var parent = f.parent;
  if (parent && parent.dir === dir) {
    var share = parent.sizes[f.index];
    var take = share * ratio;
    parent.sizes[f.index] = share - take;
    var at = before ? f.index : f.index + 1;
    parent.kids.splice(at, 0, node);
    parent.sizes.splice(at, 0, take);
    return true;
  }
  var kids = before ? [node, f.node] : [f.node, node];
  var sizes = before ? [ratio, 1 - ratio] : [1 - ratio, ratio];
  var split = model.newSplit(l, dir, kids, sizes);
  if (!parent) l.root = split;
  else parent.kids[f.index] = split;
  return true;
};
/* Dock at the outer edge of the whole centre. */
model.insertAtRoot = function (l, edge, node, ratio) {
  ratio = ratio == null ? 0.33 : clamp(ratio, 0.1, 0.9);
  var dir = EDGE_DIR[edge], before = EDGE_BEFORE[edge];
  if (!l.root) { l.root = node; return true; }
  if (l.root.t === 'split' && l.root.dir === dir) {
    var r = l.root;
    for (var i = 0; i < r.sizes.length; i++) r.sizes[i] *= (1 - ratio);
    if (before) { r.kids.unshift(node); r.sizes.unshift(ratio); } else { r.kids.push(node); r.sizes.push(ratio); }
    return true;
  }
  var kids = before ? [node, l.root] : [l.root, node];
  l.root = model.newSplit(l, dir, kids, before ? [ratio, 1 - ratio] : [1 - ratio, ratio]);
  return true;
};
/* Detach a node from the tree; its share goes to its neighbour (the previous sibling, else the next). */
model.detach = function (l, id) {
  var f = model.find(l, id);
  if (!f) return null;
  if (!f.parent) { l.root = null; return f.node; }
  var p = f.parent, share = p.sizes[f.index];
  p.kids.splice(f.index, 1);
  p.sizes.splice(f.index, 1);
  var heir = f.index > 0 ? f.index - 1 : 0;
  if (p.sizes.length) p.sizes[heir] += share;
  return f.node;
};
model.removePanel = function (l, panelId) {
  var p = model.panel(l, panelId);
  if (!p) return false;
  for (var i = 0; i < p.tabs.length; i++) delete l.tabs[p.tabs[i]];
  model.detach(l, panelId);
  return true;
};
model.movePanel = function (l, panelId, targetId, edge, ratio) {
  if (panelId === targetId) return false;
  var node = model.detach(l, panelId);
  if (!node) return false;
  // no normalize here: it would drop the detached panel's tab records; the commit normalizes afterwards
  if (targetId === '@root') return model.insertAtRoot(l, edge, node, ratio);
  return model.insertBeside(l, targetId, edge, node, ratio == null ? 0.5 : ratio);
};
model.setSizes = function (l, splitId, sizes) {
  var s = model.find(l, splitId);
  if (!s || s.node.t !== 'split' || sizes.length !== s.node.kids.length) return false;
  s.node.sizes = sizes.slice();
  return true;
};

/* ---- normalize and validate ---- */
model.normalize = function (l, opts) {
  opts = opts || {};
  if (!l.view) l.view = { focus: null, maximized: null, mru: [] };
  if (!l.closed) l.closed = [];
  if (!l.tabs) l.tabs = {};
  var seen = {};
  // 1. panels: drop unknown or duplicate tab ids, pinned first, one preview, a valid active tab
  walk(l.root, function (n) {
    if (n.t !== 'panel') return;
    n.tabs = n.tabs.filter(function (id) { if (!l.tabs[id] || seen[id]) return false; seen[id] = true; return true; });
    var pinned = n.tabs.filter(function (id) { return l.tabs[id].pinned; });
    var rest = n.tabs.filter(function (id) { return !l.tabs[id].pinned; });
    n.tabs = pinned.concat(rest);
    var previewSeen = false;
    for (var i = n.tabs.length - 1; i >= 0; i--) {
      var rec = l.tabs[n.tabs[i]];
      if (rec.preview) { if (previewSeen || rec.pinned) rec.preview = false; else previewSeen = true; }
    }
    if (n.tabs.indexOf(n.active) < 0) n.active = n.tabs[0] || null;
    if (!n.tabs.length) n.collapsed = false;
    n.locked = !!n.locked;
    n.collapsed = !!n.collapsed;
  });
  // 2. tab records nobody holds are gone
  for (var id in l.tabs) if (!seen[id]) delete l.tabs[id];
  // 3. empty panels go, unless locked or the last panel (or the caller is mid-move)
  if (!opts.keepEmpty) {
    var all = model.panels(l);
    var empties = all.filter(function (p) { return !p.tabs.length && !p.locked; });
    var keepOne = empties.length === all.length ? empties[0] : null;
    for (var e = 0; e < empties.length; e++) if (empties[e] !== keepOne) model.detach(l, empties[e].id);
  }
  // 4. tidy splits: no single child, no same-direction nesting, positive sizes summing to 1
  function tidy(n, parentDir) {
    if (!n || n.t !== 'split') return n;
    for (var i = 0; i < n.kids.length; i++) n.kids[i] = tidy(n.kids[i], n.dir);
    if (!n.sizes || n.sizes.length !== n.kids.length) n.sizes = n.kids.map(function () { return 1 / n.kids.length; });
    // flatten same-direction kids
    var kids = [], sizes = [];
    for (var j = 0; j < n.kids.length; j++) {
      var k = n.kids[j], s = n.sizes[j];
      if (k && k.t === 'split' && k.dir === n.dir) {
        var sum = k.sizes.reduce(function (a, b) { return a + b; }, 0) || 1;
        for (var q = 0; q < k.kids.length; q++) { kids.push(k.kids[q]); sizes.push(s * k.sizes[q] / sum); }
      } else if (k) { kids.push(k); sizes.push(s); }
    }
    n.kids = kids; n.sizes = sizes;
    if (n.kids.length === 0) return null;
    if (n.kids.length === 1) return n.kids[0];
    var total = 0;
    for (var m = 0; m < n.sizes.length; m++) { if (!(n.sizes[m] > MIN_FRACTION)) n.sizes[m] = MIN_FRACTION; total += n.sizes[m]; }
    for (var z = 0; z < n.sizes.length; z++) n.sizes[z] = n.sizes[z] / total;
    return n;
  }
  l.root = tidy(l.root, null);
  // a lone collapsed panel cannot stay collapsed
  if (l.root && l.root.t === 'panel') l.root.collapsed = false;
  if (l.root && l.root.t === 'split') {
    var open = l.root.kids.filter(function (k) { return !(k.t === 'panel' && k.collapsed); });
    if (!open.length) l.root.kids[0].collapsed = false;
  }
  // 5. view state
  var panelIds = model.panels(l).map(function (p) { return p.id; });
  if (panelIds.indexOf(l.view.focus) < 0) l.view.focus = panelIds[0] || null;
  if (panelIds.indexOf(l.view.maximized) < 0) l.view.maximized = null;
  l.view.mru = (l.view.mru || []).filter(function (t) { return !!l.tabs[t]; }).slice(0, MRU_MAX);
  return l;
};

model.validate = function (l) {
  var problems = [];
  if (!l || l.schema !== SCHEMA) problems.push('schema');
  if (!l.root) { problems.push('no root'); return problems; }
  var ids = {}, tabsSeen = {}, panels = 0;
  walk(l.root, function (n, parent) {
    if (!n.id) problems.push('node without id');
    if (ids[n.id]) problems.push('duplicate id ' + n.id);
    ids[n.id] = true;
    if (n.t === 'split') {
      if (n.dir !== 'row' && n.dir !== 'col') problems.push(n.id + ' bad dir');
      if (n.kids.length < 2) problems.push(n.id + ' has fewer than two kids');
      if (parent && parent.dir === n.dir) problems.push(n.id + ' nests in the same direction');
      if (!n.sizes || n.sizes.length !== n.kids.length) problems.push(n.id + ' sizes do not match kids');
      else {
        var sum = 0;
        for (var i = 0; i < n.sizes.length; i++) {
          if (!(n.sizes[i] > 0) || !isFinite(n.sizes[i])) problems.push(n.id + ' bad size');
          sum += n.sizes[i];
        }
        if (Math.abs(sum - 1) > 1e-6) problems.push(n.id + ' sizes sum to ' + sum);
      }
    } else if (n.t === 'panel') {
      panels += 1;
      for (var t = 0; t < n.tabs.length; t++) {
        var id = n.tabs[t];
        if (tabsSeen[id]) problems.push('tab ' + id + ' in two panels');
        tabsSeen[id] = true;
        if (!l.tabs[id]) problems.push('tab ' + id + ' has no record');
      }
      if (n.tabs.length && n.tabs.indexOf(n.active) < 0) problems.push(n.id + ' active tab missing');
    } else problems.push('unknown node ' + n.t);
  });
  if (!panels) problems.push('no panels');
  for (var k in l.tabs) if (!tabsSeen[k]) problems.push('tab record ' + k + ' unused');
  return problems;
};

/* Plain-language description of a panel's place, for announcements ("left panel", "bottom row") */
model.describe = function (l, panelId) {
  var path = model.ancestors(l, panelId);
  if (!path.length) return 'the only panel';
  var words = [];
  for (var i = 0; i < path.length; i++) {
    var s = path[i].split, n = s.kids.length, ix = path[i].index;
    var pos = n === 2 ? (ix === 0 ? (s.dir === 'row' ? 'left' : 'top') : (s.dir === 'row' ? 'right' : 'bottom'))
      : (ix === 0 ? (s.dir === 'row' ? 'left' : 'top') : ix === n - 1 ? (s.dir === 'row' ? 'right' : 'bottom') : 'middle');
    words.push(pos);
  }
  return words.join(' ') + ' panel';
};
