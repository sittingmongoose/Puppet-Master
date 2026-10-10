/* Geometry: pixel rects for every visible panel and divider, from the tree's proportions and the panels' minimums.
   Proportions survive the rail and chat changing width; minimums win over proportions; a collapsed panel keeps only
   its strip along its parent's direction. Narrow mode (D4 step 3) and maximize are render modes over the same tree:
   the tree itself never changes for them. */

var GAP = PMW.GAP = 6;            // space between panels; the divider's line sits in its centre
var DIVIDER_HIT = PMW.DIVIDER_HIT = 8;
var STRIP_H = PMW.STRIP_H = 35;   // tab strip height, and a collapsed panel's thickness
var NARROW_STACK_MIN_H = 160;     // in narrow mode, stacked panels stay only while each is at least this tall

var geom = PMW.geom = {};

function isCollapsedAlong(node, dir) { return node.t === 'panel' && node.collapsed && !!dir; }

geom.min = function (layout, node, axis, parentDir) {
  if (node.t === 'panel') {
    var m = PMW.panelMin(layout, node);
    if (node.collapsed && parentDir) {
      var along = parentDir === 'row' ? 'w' : 'h';
      if (axis === along) return STRIP_H;
    }
    return axis === 'w' ? m.w : m.h;
  }
  var alongAxis = node.dir === 'row' ? 'w' : 'h';
  var vals = node.kids.map(function (k) { return geom.min(layout, k, axis, node.dir); });
  if (axis === alongAxis) return vals.reduce(function (a, b) { return a + b; }, 0) + GAP * (node.kids.length - 1);
  return Math.max.apply(null, vals);
};

/* Distribute `avail` px along a split by its sizes, honouring minimums and collapsed kids. */
geom.distribute = function (layout, split, avail) {
  var n = split.kids.length, axis = split.dir === 'row' ? 'w' : 'h';
  var out = new Array(n), fixed = new Array(n), mins = new Array(n);
  var flexTotal = 0, room = avail - GAP * (n - 1);
  for (var i = 0; i < n; i++) {
    var k = split.kids[i];
    mins[i] = geom.min(layout, k, axis, split.dir);
    if (isCollapsedAlong(k, split.dir)) { fixed[i] = true; out[i] = STRIP_H; room -= STRIP_H; }
    else { fixed[i] = false; flexTotal += split.sizes[i]; }
  }
  var pool = [];
  for (var j = 0; j < n; j++) if (!fixed[j]) pool.push(j);
  var guard = 0;
  while (pool.length && guard++ < 20) {
    var sum = 0;
    for (var q = 0; q < pool.length; q++) sum += split.sizes[pool[q]];
    var clampedAny = false, next = [];
    for (var r = 0; r < pool.length; r++) {
      var ix = pool[r];
      var want = room * (split.sizes[ix] / (sum || 1));
      if (want < mins[ix]) { out[ix] = mins[ix]; room -= mins[ix]; clampedAny = true; }
      else next.push(ix);
    }
    if (!clampedAny) {
      for (var s = 0; s < pool.length; s++) out[pool[s]] = room * (split.sizes[pool[s]] / (sum || 1));
      break;
    }
    pool = next;
    if (room < 0) room = 0;
  }
  // integer pixels; the last flexible kid takes the rounding remainder
  var total = 0;
  for (var z = 0; z < n; z++) { out[z] = Math.max(0, Math.round(out[z])); total += out[z]; }
  var diff = (avail - GAP * (n - 1)) - total;
  for (var y = n - 1; y >= 0 && diff !== 0; y--) if (!fixed[y]) { out[y] = Math.max(0, out[y] + diff); diff = 0; }
  return out;
};

/* Lay the tree out into rect. Returns { panels: {id: rect}, dividers: [..], splits: {id: rect}, hidden: {id: true} } */
geom.layout = function (layout, rect, opts) {
  opts = opts || {};
  var res = { panels: {}, dividers: [], splits: {}, hidden: {}, mode: 'tree' };
  var root = layout.root;
  if (!root) return res;
  var allPanels = model.panels(layout);
  if (opts.maximized && model.panel(layout, opts.maximized)) {
    res.mode = 'maximized';
    for (var i = 0; i < allPanels.length; i++) {
      if (allPanels[i].id === opts.maximized) res.panels[allPanels[i].id] = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
      else res.hidden[allPanels[i].id] = true;
    }
    return res;
  }
  if (opts.narrow) {
    root = geom.narrowTree(layout, opts.narrowFocus || layout.view.focus, rect);
    res.mode = 'narrow';
    var shown = {};
    walk(root, function (n) { if (n.t === 'panel') shown[n.id] = true; });
    for (var j = 0; j < allPanels.length; j++) if (!shown[allPanels[j].id]) res.hidden[allPanels[j].id] = true;
  }
  (function place(node, r, parentDir) {
    if (node.t === 'panel') { res.panels[node.id] = r; return; }
    res.splits[node.id] = r;
    var row = node.dir === 'row';
    var sizes = geom.distribute(layout, node, row ? r.w : r.h);
    var at = row ? r.x : r.y;
    for (var i = 0; i < node.kids.length; i++) {
      var len = sizes[i];
      var kr = row ? { x: at, y: r.y, w: len, h: r.h } : { x: r.x, y: at, w: r.w, h: len };
      place(node.kids[i], kr, node.dir);
      at += len;
      if (i < node.kids.length - 1) {
        var d = row
          ? { x: at + (GAP - DIVIDER_HIT) / 2, y: r.y, w: DIVIDER_HIT, h: r.h }
          : { x: r.x, y: at + (GAP - DIVIDER_HIT) / 2, w: r.w, h: DIVIDER_HIT };
        res.dividers.push({ split: node.id, index: i, dir: node.dir, rect: d, virtual: !!node.virtual });
        at += GAP;
      }
    }
  })(root, { x: rect.x, y: rect.y, w: rect.w, h: rect.h }, null);
  return res;
};

/* Narrow mode: one panel column. Row splits show only the kid on the focused path; column splits keep their kids while
   each can stay NARROW_STACK_MIN_H tall, else only the focused kid. The real tree is untouched (it is cached by being
   the model itself). */
geom.narrowTree = function (layout, focusId, rect) {
  var path = model.ancestors(layout, focusId);
  var onPath = {};
  for (var i = 0; i < path.length; i++) onPath[path[i].split.id] = path[i].index;
  function pick(node, height) {
    if (node.t === 'panel') return node;
    var ix = onPath[node.id] != null ? onPath[node.id] : 0;
    if (node.dir === 'row') return pick(node.kids[ix], height);
    var each = (height - GAP * (node.kids.length - 1)) / node.kids.length;
    if (each < NARROW_STACK_MIN_H) return pick(node.kids[ix], height);
    var kids = node.kids.map(function (k) { return pick(k, each); });
    return { t: 'split', id: node.id, dir: 'col', kids: kids, sizes: node.sizes.slice(), virtual: true };
  }
  return pick(layout.root, rect.h);
};

/* Would splitting this panel on this edge leave both halves at least their minimum? (D1: only offer splits that fit) */
geom.splitFits = function (layout, panelId, edge, rects, incomingMin) {
  var r = rects.panels[panelId];
  var p = model.panel(layout, panelId);
  if (!r || !p) return false;
  var m = PMW.panelMin(layout, p);
  var inc = incomingMin || PMW.PANEL_MIN;
  if (edge === 'left' || edge === 'right') return (r.w - GAP) / 2 >= Math.max(m.w, inc.w) - 0.5;
  return (r.h - GAP) / 2 >= Math.max(m.h, inc.h) - 0.5;
};
geom.rootFits = function (layout, edge, centreRect, incomingMin) {
  var inc = incomingMin || PMW.PANEL_MIN;
  var axis = edge === 'left' || edge === 'right' ? 'w' : 'h';
  var need = geom.min(layout, layout.root, axis, null) + GAP + inc[axis];
  return need <= centreRect[axis] + 0.5;
};
