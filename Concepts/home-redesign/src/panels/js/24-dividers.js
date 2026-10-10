/* Dividers (sashes): a drag trades space between the two neighbours only, 1:1 with the pointer; a panel dragged below
   half its minimum snaps to its tab strip (D2) and drags back out the same way. The drag never writes the layout: it
   paints its preview through render's size overlay (state.sizePreview), so a commit, a kind's update or a save made
   during the drag lands on the real layout and the preview is never persisted. Release commits one command against
   the layout as it is then; Escape, a lost pointer or the split changing under the drag restores the start. Keyboard:
   arrows 8 px, Shift 48 px, Home/End to a neighbour's minimum, Enter evens the pair. Double click evens the pair. */

var KEY_STEP = 8, KEY_STEP_BIG = 48;
var dividers = PMW.dividers = {};

/* The pair at a divider, measured on the layout as painted: ids rather than nodes (a commit during a drag swaps
   every node), every kid's pixels (so non-neighbours keep theirs), the pair's minimums and collapse flags. */
function pairInfo(l, d) {
  var f = model.find(l, d.split);
  if (!f || f.node.t !== 'split') return null;
  var s = f.node, i = d.index;
  var rects = render.rects();
  if (!rects) return null;
  var axis = s.dir === 'row' ? 'w' : 'h';
  function px(node) {
    if (node.t === 'panel') { var r = rects.panels[node.id]; return r ? r[axis] : 0; }
    var r2 = rects.splits[node.id]; return r2 ? r2[axis] : 0;
  }
  var A = s.kids[i], B = s.kids[i + 1];
  if (!A || !B) return null;
  return {
    splitId: s.id, i: i, axis: axis, dir: s.dir,
    kids: s.kids.map(function (k) { return k.id; }),
    px: s.kids.map(px),
    aId: A.id, bId: B.id,
    a: px(A), b: px(B),
    minA: geom.min(l, Object.assign({}, A, { collapsed: false }), axis, s.dir),
    minB: geom.min(l, Object.assign({}, B, { collapsed: false }), axis, s.dir),
    collapsedA: A.t === 'panel' && !!A.collapsed, collapsedB: B.t === 'panel' && !!B.collapsed,
    canCollapseA: A.t === 'panel', canCollapseB: B.t === 'panel'
  };
}
/* the split this pair was measured on, in layout l, while it still has exactly the same kids */
function liveSplit(l, info) {
  var f = l && model.find(l, info.splitId);
  if (!f || f.node.t !== 'split' || f.node.kids.length !== info.kids.length) return null;
  for (var k = 0; k < info.kids.length; k++) if (f.node.kids[k].id !== info.kids[k]) return null;
  return f.node;
}

/* Given the pair and a requested size for A (px), decide sizes and collapse flags. */
function solve(info, wantA) {
  var total = info.a + info.b;
  var res = { a: wantA, b: total - wantA, collapseA: false, collapseB: false };
  var halfA = info.minA / 2, halfB = info.minB / 2;
  if (info.canCollapseA && wantA < halfA) { res.collapseA = true; res.a = STRIP_H; res.b = total - STRIP_H; }
  else if (wantA < info.minA) { res.a = info.minA; res.b = total - info.minA; }
  if (!res.collapseA) {
    if (info.canCollapseB && res.b < halfB) { res.collapseB = true; res.b = STRIP_H; res.a = total - STRIP_H; }
    else if (res.b < info.minB) { res.b = info.minB; res.a = total - info.minB; }
  }
  if (res.a < 0 || res.b < 0) return null;
  return res;
}

/* Apply a solved pair to a split node s (the live split in a commit draft, or a scratch copy for the preview).
   geom.distribute takes collapsed kids out of the pool and clamps kids to their minimums, so rescaling only the
   pair's fractions moves the panels beyond it. Instead every flex kid's fraction is rebuilt from the pixels it shows
   (A and B take the solved pixels, the others keep theirs), so distribute gives back exactly those pixels. A
   collapsed kid keeps its old fraction as the size it returns to; distribute ignores it while it is collapsed. */
function applyPair(s, info, res) {
  var i = info.i;
  var A = s.kids[i], B = s.kids[i + 1];
  if (A.t === 'panel') A.collapsed = res.collapseA;
  if (B.t === 'panel') B.collapsed = res.collapseB;
  var px = info.px.slice();
  px[i] = res.a; px[i + 1] = res.b;
  var fixedShare = 0, flexPx = 0, ok = true;
  for (var k = 0; k < s.kids.length; k++) {
    var kid = s.kids[k];
    if (kid.t === 'panel' && kid.collapsed) fixedShare += s.sizes[k];
    else { flexPx += px[k]; if (!(px[k] > 0)) ok = false; }
  }
  if (ok && flexPx > 0 && fixedShare < 1) {
    for (var j = 0; j < s.kids.length; j++) {
      if (!(s.kids[j].t === 'panel' && s.kids[j].collapsed)) s.sizes[j] = (1 - fixedShare) * px[j] / flexPx;
    }
  } else if (!res.collapseA && !res.collapseB) {
    // no usable pixels for the other kids (not painted): trade within the pair only
    var f = s.sizes[i] + s.sizes[i + 1], sum = res.a + res.b || 1;
    s.sizes[i] = f * res.a / sum;
    s.sizes[i + 1] = f * res.b / sum;
  }
  return { sizes: s.sizes.slice(), collapseA: res.collapseA, collapseB: res.collapseB };
}

/* the preview overlay for a solved pair, built on a scratch copy of the live split (the live split is not touched) */
function previewOf(s, info, res) {
  var scratch = { sizes: s.sizes.slice(), kids: s.kids.map(function (k) { return { t: k.t, id: k.id, collapsed: !!k.collapsed }; }) };
  applyPair(scratch, info, res);
  var collapsed = {};
  collapsed[info.aId] = scratch.kids[info.i].collapsed;
  collapsed[info.bId] = scratch.kids[info.i + 1].collapsed;
  return { splitId: info.splitId, kids: info.kids.slice(), sizes: scratch.sizes, collapsed: collapsed };
}

/* One command against the layout as it is now; the split must still have the kids it was measured with. */
function commitPair(info, res, kind) {
  var collapsing = (res.collapseA !== info.collapsedA) || (res.collapseB !== info.collapsedB);
  var id = collapsing ? CMD.collapse : CMD.resize;
  var out = commit(id, { splitId: info.splitId, index: info.i }, function (d) {
    var s = liveSplit(d, info);
    if (!s) return { ok: false, reason: 'layout_changed' };
    applyPair(s, info, res);
    return {};
  }, { animate: kind === 'key' });
  if (out.ok && !out.noChange && collapsing) {
    var whoId = res.collapseA !== info.collapsedA ? info.aId : info.bId;
    var nowCollapsed = whoId === info.aId ? res.collapseA : res.collapseB;
    var wp = model.panel(state.layout, whoId);
    announce(PMW.tabLabel((wp && wp.active && state.layout.tabs[wp.active]) || null) + (nowCollapsed ? ' panel collapsed to its tabs' : ' panel expanded'));
  }
  return out;
}

dividers.bind = function (el) {
  el.addEventListener('pointerdown', function (ev) {
    if (ev.button !== 0) return;
    var d = el._pmwDivider;
    if (!d || d.virtual) return;
    ev.preventDefault();
    var info = pairInfo(state.layout, d);
    if (!info) return;
    var start = info.axis === 'w' ? ev.clientX : ev.clientY;
    var startA = info.collapsedA ? STRIP_H : info.a;
    var work = Object.assign({}, info, { a: info.collapsedA ? STRIP_H : info.a, b: info.collapsedB ? STRIP_H : info.b });
    var last = null, moved = false, ended = false;
    try { el.setPointerCapture(ev.pointerId); } catch (_) {}
    el.classList.add('pmw-active');
    doc.body.classList.add('pm-resizing', 'pmw-resizing');
    state.resizing = true;
    function move(e) {
      var pos = info.axis === 'w' ? e.clientX : e.clientY;
      var delta = pos - start;
      if (!moved && Math.abs(delta) < 1) return;
      var live = liveSplit(state.layout, info);
      if (!live) { end(e, true); return; }     // the split changed under the drag (an agent split or closed a panel)
      moved = true;
      var res = solve(work, startA + delta);
      if (!res) return;
      last = res;
      state.sizePreview = previewOf(live, info, res);
      render.now({ animate: false });
    }
    function end(e, cancel) {
      if (ended) return;
      ended = true;
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancelFn);
      el.removeEventListener('lostpointercapture', cancelFn);
      doc.removeEventListener('keydown', esc, true);
      el.classList.remove('pmw-active');
      doc.body.classList.remove('pm-resizing', 'pmw-resizing');
      var previewed = !!state.sizePreview;
      state.sizePreview = null;
      state.resizing = false;
      if (cancel || !moved || !last) {
        if (previewed) render.now({ animate: !!cancel });
        render.flushResizes(true);
        return;
      }
      var out = commitPair(info, last, 'drag');
      // anything but an applied change: paint the model again now, so the panels, the divider values and
      // render.rects() (the next keyboard step reads it) leave the dragged geometry (CONTRACT 8: a failed commit rolls back)
      if (!out.ok || out.noChange) render.now({ animate: !out.ok });
      render.flushResizes(true);
    }
    function up(e) { end(e, false); }
    function cancelFn(e) { if (el.classList.contains('pmw-active')) end(e, true); }
    function esc(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); end(e, true); } }
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancelFn);
    el.addEventListener('lostpointercapture', cancelFn);
    doc.addEventListener('keydown', esc, true);
  });
  el.addEventListener('dblclick', function () {
    var d = el._pmwDivider;
    if (!d || d.virtual) return;
    var info = pairInfo(state.layout, d);
    if (!info) return;
    var half = (info.a + info.b) / 2;
    var res = solve(Object.assign({}, info, { canCollapseA: false, canCollapseB: false }), half);
    if (res && commitPair(info, res, 'key').ok) announce('Panels evened');
  });
  el.addEventListener('keydown', function (e) {
    var d = el._pmwDivider;
    if (!d || d.virtual) return;
    var info = pairInfo(state.layout, d);
    if (!info) return;
    var back = d.dir === 'row' ? 'ArrowLeft' : 'ArrowUp', fwd = d.dir === 'row' ? 'ArrowRight' : 'ArrowDown';
    // a key that points into a collapsed panel has nowhere to go: without this it would clamp out to the panel's
    // minimum and expand it against the key's direction
    if ((info.collapsedA && (e.key === back || e.key === 'Home')) || (info.collapsedB && (e.key === fwd || e.key === 'End'))) {
      e.preventDefault();
      return;
    }
    var step = e.shiftKey ? KEY_STEP_BIG : KEY_STEP;
    var a = info.collapsedA ? STRIP_H : info.a;
    var want = null;
    if (e.key === back) want = a - step;
    else if (e.key === fwd) want = a + step;
    else if (e.key === 'Home') want = info.minA;
    else if (e.key === 'End') want = info.a + info.b - info.minB;
    else if (e.key === 'Enter') want = (info.a + info.b) / 2;
    if (want == null) return;
    e.preventDefault();
    var res = solve(Object.assign({}, info, { canCollapseA: false, canCollapseB: false, a: a, b: info.collapsedB ? STRIP_H : info.b }), want);
    if (!res) return;
    commitPair(info, res, 'key');
    nextFrame(function () { var again = qs('.pmw-divider[data-key="' + d.split + ':' + d.index + '"]'); if (again) again.focus(); });
  });
};
