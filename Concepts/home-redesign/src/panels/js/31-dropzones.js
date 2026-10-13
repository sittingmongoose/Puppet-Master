/* Drop zones and drop guides for a carried tab or panel (D1; Jared's review of 2026-10-13: the drag "really didn't want
   me dragging and dropping above, below, or to the side of other panels ... typically wanted me to merge"). Splitting
   is the default and joining is deliberate:
   - a panel's body is cut by its diagonals into four split regions: the pointer is always in the split for the side it
     is nearest, measured as a share of the body's width or height, so each side owns a quarter of the body;
   - joining a panel as a tab takes the Join target at the body's centre (the guide's middle tile plus 8 px of slack)
     or the panel's tab strip, where the strip opens a slot at the index;
   - the centre's outer edge (an 18 px band, or the dock target in the middle of each side) makes a new full-length
     panel, offered while there are two panels or more; along the top, where the tab strips are, only the dock target
     does, and it sits just below the strips so a strip's first slots stay strip slots;
   - a side whose result would leave a panel below its minimum is not offered (the room rule: PMW.hypo and
     geom.resultFits, the same rule the drop commits under) and its region goes to the nearest side that fits; with no
     side left the whole body joins (another panel) or offers nothing (the tab's own panel).
   Zones are measured on the committed layout (render.rects(), which never holds the live preview's rects), never on
   what is painted, so a preview that moves the panels never moves the zones under the pointer. Hysteresis: a side
   holds until another is nearer by 5 % of the body; the Join target holds 12 px past its slack; a dock 12 px past its
   band. The guide floats over the target panel's committed body: four side tiles around the Join tile, the zone's
   name under them. */

var dropZones = PMW.dropZones = {};
var DOCK_BAND = 18, JOIN_SLACK = 8, HOLD_PX = 12, HOLD_SHARE = 0.05;
var SIDES = ['left', 'right', 'top', 'bottom'];

/* the committed rects in viewport px: { centre, panels: { id: rect }, hidden } (null when Home is not laid out) */
function baseRects() {
  var c = state.centre, rects = render.rects();
  if (!c || !rects) return null;
  var cb = c.getBoundingClientRect();
  var ox = cb.left + c.clientLeft, oy = cb.top + c.clientTop;
  var out = { ox: ox, oy: oy, centre: { x: ox + CENTRE_PAD, y: oy + CENTRE_PAD, w: Math.max(0, c.clientWidth - 2 * CENTRE_PAD), h: Math.max(0, c.clientHeight - 2 * CENTRE_PAD) }, panels: {}, hidden: rects.hidden || {}, mode: rects.mode };
  for (var id in rects.panels) { var r = rects.panels[id]; out.panels[id] = { x: ox + r.x, y: oy + r.y, w: r.w, h: r.h }; }
  return out;
}
dropZones.base = baseRects;
function inBox(x, y, r, pad) { pad = pad || 0; return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad; }
function stripHeight(panelEl) { var s = panelEl && panelEl.querySelector('.pmw-strip'); return s ? s.offsetHeight : STRIP_H; }

/* the guide's tile size for a body: full (40 px tiles), compact (30 px) or the Join tile alone */
function guideSize(b) {
  var m = Math.min(b.w, b.h);
  if (m >= 210) return { mode: 'full', tile: 40, gap: 6 };
  if (m >= 140) return { mode: 'compact', tile: 30, gap: 4 };
  return { mode: 'join', tile: 30, gap: 4 };
}
dropZones.guideSize = guideSize;

/* what a drop would leave, per carried thing and target (cached for the drag: the layout does not change under it,
   and when it does the revision in the key moves on) */
function hypoFor(g, kind, panelId, edge) {
  var l = state.layout, box = PMW.layoutBox();
  var key = [l.revision, box ? box.w + 'x' + box.h : '-', kind, panelId, edge || ''].join('|');
  g.hypoCache = g.hypoCache || {};
  if (Object.prototype.hasOwnProperty.call(g.hypoCache, key)) return g.hypoCache[key];
  var hy = null;
  if (g.panelId) {
    if (kind === 'merge') hy = PMW.hypo.mergePanel(g.panelId, panelId);
    else if (kind === 'root') hy = PMW.hypo.movePanel(g.panelId, '@root', edge);
    else if (kind === 'split') hy = PMW.hypo.movePanel(g.panelId, panelId, edge);
  } else {
    if (kind === 'merge') hy = PMW.hypo.move(g.tid, panelId, null);
    else if (kind === 'root') hy = PMW.hypo.split(g.tid, '@root', edge, 0.34);
    else if (kind === 'split') hy = PMW.hypo.split(g.tid, panelId, edge, 0.5);
  }
  var fits = !!hy && (kind === 'merge' || PMW.roomFits(hy));
  var res = { hypo: fits ? hy : null, fits: fits };
  g.hypoCache[key] = res;
  return res;
}
dropZones.hypoFor = hypoFor;

function rootRect(r, edge) {
  var f = 0.34;
  if (edge === 'left') return { x: r.x, y: r.y, w: r.w * f, h: r.h };
  if (edge === 'right') return { x: r.x + r.w * (1 - f), y: r.y, w: r.w * f, h: r.h };
  if (edge === 'top') return { x: r.x, y: r.y, w: r.w, h: r.h * f };
  return { x: r.x, y: r.y + r.h * (1 - f), w: r.w, h: r.h * f };
}
function halfRect(r, edge) {
  var hw = (r.w - GAP) / 2, hh = (r.h - GAP) / 2;
  if (edge === 'left') return { x: r.x, y: r.y, w: hw, h: r.h };
  if (edge === 'right') return { x: r.x + r.w - hw, y: r.y, w: hw, h: r.h };
  if (edge === 'top') return { x: r.x, y: r.y, w: r.w, h: hh };
  return { x: r.x, y: r.y + r.h - hh, w: r.w, h: hh };
}
/* where a dock target sits: in the middle of a side of the centre, 10 px in (the top one below the strips) */
function dockPoint(cr, edge) {
  if (edge === 'left') return { x: cr.x + 10 + 16, y: cr.y + cr.h / 2 };
  if (edge === 'right') return { x: cr.x + cr.w - 10 - 16, y: cr.y + cr.h / 2 };
  if (edge === 'top') return { x: cr.x + cr.w / 2, y: cr.y + STRIP_H + 10 + 16 };
  return { x: cr.x + cr.w / 2, y: cr.y + cr.h - 10 - 16 };
}
var DOCK_BANDS = { left: DOCK_BAND, right: DOCK_BAND, top: 0, bottom: DOCK_BAND };
dropZones.dockPoint = dockPoint;
var SPLIT_LABEL = { left: 'Split left', right: 'Split right', top: 'Split up', bottom: 'Split down' };
var ROOT_LABEL = { left: 'New panel along the left', right: 'New panel along the right', top: 'New row across the top', bottom: 'New row across the bottom' };
dropZones.SPLIT_LABEL = SPLIT_LABEL;

/* docks are offered while there are two panels or more (with one, a side of that panel is the same place) */
dropZones.docksOn = function (g) {
  var narrow = PMW.narrow && PMW.narrow.singleColumn();
  return !narrow && model.panels(state.layout).length > 1;
};
dropZones.rootFits = function (g, edge) { return hypoFor(g, 'root', '@root', edge).fits; };

/* probe(g, o) -> zone | null. g: the gesture (px, py, zone, tid or panelId, origin, chipW); o.strips: tab strips are
   targets (a carried tab); a carried panel joins a panel through its strip as through its centre.
   zone = { key, type: 'strip'|'merge'|'split'|'root', panelId, edge, index, rect, label, gap, guide } */
dropZones.probe = function (g, o) {
  o = o || {};
  var l = state.layout, base = baseRects();
  if (!l || !base) return null;
  var x = g.px, y = g.py, cr = base.centre, cur = g.zone;
  var narrow = PMW.narrow && PMW.narrow.singleColumn();
  var moving = g.panelId || null;
  var originId = moving || (g.origin && g.origin.panelId);
  if (!inBox(x, y, cr, 0)) return null;                                  // over the chat, the rail: no drop
  // 1. the centre's outer edge: a dock (its band, or its target in the middle of the side)
  if (dropZones.docksOn(g)) {
    for (var e = 0; e < SIDES.length; e++) {
      var ed = SIDES[e];
      var holding = cur && cur.type === 'root' && cur.edge === ed;
      var d = ed === 'left' ? x - cr.x : ed === 'right' ? cr.x + cr.w - x : ed === 'top' ? y - cr.y : cr.y + cr.h - y;
      var dp = dockPoint(cr, ed);
      var onTarget = Math.abs(x - dp.x) <= 22 + (holding ? HOLD_PX : 0) && Math.abs(y - dp.y) <= 22 + (holding ? HOLD_PX : 0);
      var band = DOCK_BANDS[ed];
      if (((band && d <= band + (holding ? HOLD_PX : 0)) || onTarget) && dropZones.rootFits(g, ed)) {
        return { key: 'root-' + ed, type: 'root', edge: ed, rect: rootRect(cr, ed), label: ROOT_LABEL[ed] };
      }
    }
  }
  // 2. the panel under the pointer, by its committed rect
  var panels = model.panels(l);
  for (var i = 0; i < panels.length; i++) {
    var p = panels[i], r = base.panels[p.id];
    if (!r || base.hidden[p.id] || !inBox(x, y, r, 0)) continue;
    var el = render.panelEl(p.id);
    var own = p.id === originId;
    var sh = stripHeight(el);
    // a tab strip: insert at an index (a carried tab), or join (a carried panel)
    if (!p.collapsed && y <= r.y + sh + 4) {
      if (moving) return own ? null : joinZone(p, r, sh, 'Join as tabs');
      var st = el && el.querySelector('.pmw-strip')._pmw;
      if (!st) return null;
      // the strip is drawn where the preview put its panel: read its tabs there, at the pointer's place in the panel
      var drawn = el.getBoundingClientRect();
      var px = x - r.x + drawn.left;
      var moreR = st.more.hidden ? null : st.more.getBoundingClientRect();
      if (moreR && px >= moreR.left - 4 && px <= moreR.right + 4) {
        return { key: 'more-' + p.id, type: 'strip', panelId: p.id, index: p.tabs.length, rect: { x: moreR.left, y: drawn.top + 3, w: moreR.width, h: sh - 3 }, label: 'To the end' };
      }
      if (own) return null;     // the origin strip is handled in strip mode
      var ins = PMW.tabDrag.insertionIn(st, p, px);
      return { key: 'strip-' + p.id + '-' + ins.index, type: 'strip', panelId: p.id, index: ins.index, gap: true,
        rect: { x: ins.x, y: drawn.top + 3, w: g.chipW || 120, h: sh - 3 }, label: '' };
    }
    if (p.collapsed) return own ? null : joinZone(p, r, sh, moving ? 'Join as tabs' : 'Join as a tab', true);
    var b = { x: r.x, y: r.y + sh, w: r.w, h: r.h - sh };
    var gs = guideSize(b);
    var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    var soleTab = !moving && own && p.tabs.length === 1;
    var fits = {};
    SIDES.forEach(function (s2) { fits[s2] = !narrow && !soleTab && !(moving && own) && hypoFor(g, 'split', p.id, s2).fits; });
    var canJoin = !own;
    var guide = { panelId: p.id, body: b, size: gs, fits: fits, join: canJoin, active: null };
    // the Join target
    if (canJoin) {
      var holdJoin = cur && cur.type === 'merge' && cur.panelId === p.id && !cur.whole;
      var reach = gs.tile / 2 + JOIN_SLACK + (holdJoin ? HOLD_PX : 0);
      if (Math.abs(x - cx) <= reach && Math.abs(y - cy) <= reach) {
        guide.active = 'merge';
        return { key: 'merge-' + p.id, type: 'merge', panelId: p.id, rect: { x: b.x, y: b.y, w: b.w, h: b.h }, label: moving ? 'Join as tabs' : 'Join as a tab', guide: guide };
      }
    }
    // the nearest side that fits (a share of the body), held against small moves
    var best = null, bestN = Infinity;
    for (var k = 0; k < SIDES.length; k++) {
      var s3 = SIDES[k];
      if (!fits[s3]) continue;
      var dist = s3 === 'left' ? x - b.x : s3 === 'right' ? b.x + b.w - x : s3 === 'top' ? y - b.y : b.y + b.h - y;
      var n = Math.max(0, dist) / (s3 === 'left' || s3 === 'right' ? b.w : b.h);
      if (cur && cur.type === 'split' && cur.panelId === p.id && cur.edge === s3) n -= HOLD_SHARE;
      if (n < bestN) { bestN = n; best = s3; }
    }
    if (best) {
      guide.active = best;
      return { key: 'split-' + p.id + '-' + best, type: 'split', panelId: p.id, edge: best, rect: halfRect(r, best), label: SPLIT_LABEL[best], guide: guide };
    }
    if (!canJoin) return null;
    guide.active = 'merge';
    return { key: 'merge-' + p.id, type: 'merge', panelId: p.id, whole: true, rect: { x: b.x, y: b.y, w: b.w, h: b.h }, label: moving ? 'Join as tabs' : 'Join as a tab', guide: guide };
  }
  return null;
};
function joinZone(p, r, sh, label, collapsed) {
  return { key: 'merge-' + p.id, type: 'merge', panelId: p.id, whole: true, viaStrip: true,
    rect: collapsed ? { x: r.x, y: r.y, w: r.w, h: r.h } : { x: r.x, y: r.y, w: r.w, h: r.h }, label: label };
}

/* ---- the drop guide: tiles around the Join target, the dock targets, the zone's name ---- */
var dropGuide = PMW.dropGuide = {};
var guideEl = null, guideTiles = {}, guideCap = null, dockEls = null, guideFor = null, guideFade = null;
function ensureGuide() {
  if (guideEl) return guideEl;
  guideEl = h('div', { class: 'pmw-guide', 'aria-hidden': 'true', hidden: true });
  ['top', 'left', 'merge', 'right', 'bottom'].forEach(function (k) {
    var t = h('i', { class: 'pmw-guide-tile', 'data-edge': k }, [h('b', { class: 'pmw-guide-map' })]);
    guideTiles[k] = t;
    guideEl.appendChild(t);
  });
  guideCap = h('span', { class: 'pmw-guide-cap' });
  guideEl.appendChild(guideCap);
  overlay().appendChild(guideEl);
  dockEls = {};
  SIDES.forEach(function (e) {
    var d = h('i', { class: 'pmw-dock', 'data-edge': e, 'aria-hidden': 'true', hidden: true }, [h('b', { class: 'pmw-guide-map' })]);
    dockEls[e] = d;
    overlay().appendChild(d);
  });
  return guideEl;
}
/* the docks come up with the carry (a torn tab, a lifted panel) */
dropGuide.begin = function (g) {
  ensureGuide();
  var base = baseRects();
  var on = !!base && dropZones.docksOn(g);
  SIDES.forEach(function (e) {
    var d = dockEls[e];
    if (!on) { d.hidden = true; return; }
    var p = dockPoint(base.centre, e);
    d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
    setAttr(d, 'data-off', !dropZones.rootFits(g, e));
    setAttr(d, 'data-on', null);
    if (d._pmwFade) { try { d._pmwFade.cancel(); } catch (_) {} d._pmwFade = null; }   // a fade-out still running
    if (d.hidden) { d.hidden = false; motion.animate(d, [{ opacity: 0 }, { opacity: 1 }], { dur: 160, easing: motion.ease('out') }); }
  });
};
dropGuide.update = function (g, z) {
  ensureGuide();
  var sig = z ? z.key : '';
  if (guideEl._pmwSig === sig) return;
  guideEl._pmwSig = sig;
  SIDES.forEach(function (e) { setAttr(dockEls[e], 'data-on', !!z && z.type === 'root' && z.edge === e); });
  var gd = z && z.guide;
  if (!gd) {
    hideGuide();
    if (z && z.type === 'root') showCaptionAtDock(z);
    return;
  }
  var b = gd.body, s = gd.size;
  var ext = s.tile * 3 + s.gap * 2;
  var x = Math.round(b.x + b.w / 2 - ext / 2), y = Math.round(b.y + b.h / 2 - ext / 2);
  var el = guideEl, first = el.hidden || guideFade;
  if (guideFade) { try { guideFade.cancel(); } catch (_) {} guideFade = null; }
  el.style.setProperty('--pmw-guide-tile', s.tile + 'px');
  el.style.setProperty('--pmw-guide-gap', s.gap + 'px');
  setAttr(el, 'data-size', s.mode);
  setAttr(el, 'data-dock-cap', null);
  SIDES.forEach(function (e) {
    setAttr(guideTiles[e], 'data-off', !gd.fits[e]);
    setAttr(guideTiles[e], 'data-on', gd.active === e);
  });
  setAttr(guideTiles.merge, 'data-off', !gd.join);
  setAttr(guideTiles.merge, 'data-on', gd.active === 'merge');
  setText(guideCap, z.label || '');
  var moved = guideFor !== gd.panelId;
  guideFor = gd.panelId;
  el.hidden = false;
  // placed with the translate property, so the entrance's scale (transform) grows about the guide's own centre
  if (first || reducedMotion()) {
    el.style.transition = 'none';
    el.style.translate = x + 'px ' + y + 'px';
    void el.offsetWidth;
    el.style.transition = '';
    if (first) motion.animate(el, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { dur: 170, easing: motion.ease('out') });
  } else if (moved) {
    el.style.translate = x + 'px ' + y + 'px';     // glides (CSS) to the next panel's centre
  }
};
function showCaptionAtDock(z) {
  // the root zone names itself beside its dock (the guide's caption, moved there; the tiles hidden)
  var base = baseRects();
  if (!base) return;
  var p = dockPoint(base.centre, z.edge);
  var el = guideEl;
  if (guideFade) { try { guideFade.cancel(); } catch (_) {} guideFade = null; }
  setAttr(el, 'data-dock-cap', z.edge);
  setText(guideCap, z.label || '');
  el.style.setProperty('--pmw-guide-tile', '32px');
  el.style.setProperty('--pmw-guide-gap', '0px');
  el.style.transition = 'none';
  el.style.translate = Math.round(p.x - 48) + 'px ' + Math.round(p.y - 48) + 'px';
  void el.offsetWidth;
  el.style.transition = '';
  guideFor = null;
  if (el.hidden) { el.hidden = false; motion.animate(el, [{ opacity: 0 }, { opacity: 1 }], { dur: 140, easing: motion.ease('out') }); }
}
function hideGuide() {
  if (guideEl) guideEl._pmwSig = null;
  if (!guideEl || guideEl.hidden || guideFade) return;
  guideFor = null;
  var el = guideEl;
  var a = motion.animate(el, [{ opacity: 1 }, { opacity: 0 }], { dur: 120, easing: motion.ease('out') });
  if (!a) { el.hidden = true; return; }
  guideFade = a;
  a.onfinish = function () { if (guideFade !== a) return; guideFade = null; el.hidden = true; };
}
dropGuide.hide = function () {
  hideGuide();
  if (dockEls) SIDES.forEach(function (e) { setAttr(dockEls[e], 'data-on', null); });
};
dropGuide.end = function () {
  if (!guideEl) return;
  hideGuide();
  SIDES.forEach(function (e) {
    var d = dockEls[e];
    if (d.hidden) return;
    if (d._pmwFade) return;
    var a = motion.animate(d, [{ opacity: 1 }, { opacity: 0 }], { dur: 120, easing: motion.ease('out'), fill: 'forwards' });
    d._pmwFade = a;
    if (a) a.onfinish = function () { if (d._pmwFade !== a) return; d._pmwFade = null; d.hidden = true; try { a.cancel(); } catch (_) {} };
    else d.hidden = true;
    setAttr(d, 'data-on', null);
  });
};
