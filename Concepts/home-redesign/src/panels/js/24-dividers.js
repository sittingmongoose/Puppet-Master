/* Dividers (sashes): a drag trades space between the two neighbours only, 1:1 with the pointer; a panel dragged below
   half its minimum snaps to its tab strip (D2) and drags back out the same way. The drag previews on the live layout
   and commits one command on release; Escape or a lost pointer restores the start. Keyboard: arrows 8 px, Shift 48 px,
   Home/End to a neighbour's minimum, Enter evens the pair. Double click evens the pair. */

var KEY_STEP = 8, KEY_STEP_BIG = 48;
var dividers = PMW.dividers = {};

function pairInfo(l, d) {
  var f = model.find(l, d.split);
  if (!f || f.node.t !== 'split') return null;
  var s = f.node, i = d.index;
  var rects = render.rects();
  var axis = s.dir === 'row' ? 'w' : 'h';
  function px(node) {
    if (node.t === 'panel') { var r = rects.panels[node.id]; return r ? r[axis] : 0; }
    var r2 = rects.splits[node.id]; return r2 ? r2[axis] : 0;
  }
  var A = s.kids[i], B = s.kids[i + 1];
  return {
    split: s, i: i, axis: axis, A: A, B: B,
    a: px(A), b: px(B),
    minA: geom.min(l, Object.assign({}, A, { collapsed: false }), axis, s.dir),
    minB: geom.min(l, Object.assign({}, B, { collapsed: false }), axis, s.dir),
    collapsedA: A.t === 'panel' && A.collapsed, collapsedB: B.t === 'panel' && B.collapsed,
    canCollapseA: A.t === 'panel', canCollapseB: B.t === 'panel'
  };
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

function applyPair(l, info, res) {
  var s = model.find(l, info.split.id).node;
  var i = info.i;
  var A = s.kids[i], B = s.kids[i + 1];
  if (A.t === 'panel') A.collapsed = res.collapseA;
  if (B.t === 'panel') B.collapsed = res.collapseB;
  var f = s.sizes[i] + s.sizes[i + 1];
  if (!res.collapseA && !res.collapseB) {
    var sum = res.a + res.b || 1;
    s.sizes[i] = f * res.a / sum;
    s.sizes[i + 1] = f * res.b / sum;
  }
  // a collapsed kid keeps its fraction as the size it returns to
  return { sizes: s.sizes.slice(), collapseA: res.collapseA, collapseB: res.collapseB };
}

function commitPair(orig, info, res, kind) {
  state.layout = orig;
  var collapsing = (res.collapseA !== info.collapsedA) || (res.collapseB !== info.collapsedB);
  var id = collapsing ? CMD.collapse : CMD.resize;
  var out = commit(id, { splitId: info.split.id, index: info.i }, function (d) { applyPair(d, info, res); return {}; }, { animate: kind === 'key' });
  if (out.ok && collapsing) {
    var who = res.collapseA !== info.collapsedA ? info.A : info.B;
    var nowCollapsed = who === info.A ? res.collapseA : res.collapseB;
    announce(PMW.tabLabel(state.layout.tabs[(model.panel(state.layout, who.id) || {}).active] || null) + (nowCollapsed ? ' panel collapsed to its tabs' : ' panel expanded'));
  }
  return out;
}

dividers.bind = function (el) {
  el.addEventListener('pointerdown', function (ev) {
    if (ev.button !== 0) return;
    var d = el._pmwDivider;
    if (!d || d.virtual) return;
    ev.preventDefault();
    var orig = model.clone(state.layout);
    var info = pairInfo(state.layout, d);
    if (!info) return;
    var start = info.axis === 'w' ? ev.clientX : ev.clientY;
    var startA = info.collapsedA ? STRIP_H : info.a;
    var last = null, moved = false;
    try { el.setPointerCapture(ev.pointerId); } catch (_) {}
    el.classList.add('pmw-active');
    doc.body.classList.add('pm-resizing', 'pmw-resizing');
    state.resizing = true;
    function move(e) {
      var pos = info.axis === 'w' ? e.clientX : e.clientY;
      var delta = pos - start;
      if (!moved && Math.abs(delta) < 1) return;
      moved = true;
      var work = Object.assign({}, info, { a: info.collapsedA ? STRIP_H : info.a, b: info.collapsedB ? STRIP_H : info.b });
      var res = solve(work, startA + delta);
      if (!res) return;
      last = res;
      state.layout = model.clone(orig);
      applyPair(state.layout, info, res);
      render.now({ animate: false });
    }
    function end(e, cancel) {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancelFn);
      el.removeEventListener('lostpointercapture', cancelFn);
      doc.removeEventListener('keydown', esc, true);
      el.classList.remove('pmw-active');
      doc.body.classList.remove('pm-resizing', 'pmw-resizing');
      state.resizing = false;
      if (cancel || !moved || !last) {
        state.layout = orig;
        render.now({ animate: !!(cancel && moved) });
        render.flushResizes(true);
        return;
      }
      commitPair(orig, info, last, 'drag');
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
    if (res) { commitPair(model.clone(state.layout), info, res, 'key'); announce('Panels evened'); }
  });
  el.addEventListener('keydown', function (e) {
    var d = el._pmwDivider;
    if (!d || d.virtual) return;
    var info = pairInfo(state.layout, d);
    if (!info) return;
    var back = d.dir === 'row' ? 'ArrowLeft' : 'ArrowUp', fwd = d.dir === 'row' ? 'ArrowRight' : 'ArrowDown';
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
    if (info.collapsedA && res.a > STRIP_H) res.collapseA = false;
    commitPair(model.clone(state.layout), info, res, 'key');
    nextFrame(function () { var again = qs('.pmw-divider[data-key="' + d.split + ':' + d.index + '"]'); if (again) again.focus(); });
  });
};
