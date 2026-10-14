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
   name under them, or wherever beside them keeps it clear of what is carried (the caption rule, below). */

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
      // "+N" is measured where it rests, as the insert slots are (33-tabdrag.js insertionIn): the gap an end slot opens
      // slides "+N" right by a chip's width, and read where it was drawn it ran from the pointer (landing of 2026-10-14,
      // Glass dark, a crowded strip: 128 px); on "+N" the gap closes and it slides back under the pointer
      var moreR = null;
      if (!st.more.hidden) { var mx = PMW.tabDrag.layoutX(st.more), mw = st.more.offsetWidth; moreR = { left: mx, right: mx + mw, width: mw }; }
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
  overlay().appendChild(guideEl);
  dockEls = {};
  SIDES.forEach(function (e) {
    var d = h('i', { class: 'pmw-dock', 'data-edge': e, 'aria-hidden': 'true', hidden: true }, [h('b', { class: 'pmw-guide-map' })]);
    dockEls[e] = d;
    overlay().appendChild(d);
  });
  // the zone's name is a layer of its own, over the carried chip, so it can keep clear of what is carried (below)
  guideCap = h('span', { class: 'pmw-guide-cap', 'aria-hidden': 'true', hidden: true });
  overlay().appendChild(guideCap);
  return guideEl;
}
/* the docks come up with the carry (a torn tab, a lifted panel) */
dropGuide.begin = function (g) {
  ensureGuide();
  var base = baseRects();
  var on = !!base && dropZones.docksOn(g);
  cap.docks = []; cap.trail = []; cap.vel = null; cap.rx = null;
  SIDES.forEach(function (e) {
    var d = dockEls[e];
    if (!on) { d.hidden = true; return; }
    var p = dockPoint(base.centre, e);
    cap.docks.push({ edge: e, x: p.x - 16, y: p.y - 16, w: 32, h: 32 });
    d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
    setAttr(d, 'data-off', !dropZones.rootFits(g, e));
    setAttr(d, 'data-on', null);
    if (d._pmwFade) { try { d._pmwFade.cancel(); } catch (_) {} d._pmwFade = null; }   // a fade-out still running
    if (d.hidden) { d.hidden = false; motion.animate(d, [{ opacity: 0 }, { opacity: 1 }], { dur: 160, easing: motion.ease('out') }); }
  });
};
/* every frame of a carry: the zone's guide and name when the zone changes, and the name kept clear of the carry */
dropGuide.update = function (g, z) {
  ensureGuide();
  var sig = z ? z.key : '';
  if (guideEl._pmwSig !== sig) {
    guideEl._pmwSig = sig;
    SIDES.forEach(function (e) { setAttr(dockEls[e], 'data-on', !!z && z.type === 'root' && z.edge === e); });
    var tiles = null;
    if (z && z.guide) tiles = showTiles(z.guide);
    else hideTiles();
    capTarget(g, z, tiles);
  }
  capPlace(g);
};
/* the guide's tiles over the target panel's body; returns how it moved there and the box its name sits by */
function showTiles(gd) {
  var b = gd.body, s = gd.size;
  var ext = s.tile * 3 + s.gap * 2;
  var x = Math.round(b.x + b.w / 2 - ext / 2), y = Math.round(b.y + b.h / 2 - ext / 2);
  var el = guideEl, first = el.hidden || guideFade, how = 'held';
  if (guideFade) { try { guideFade.cancel(); } catch (_) {} guideFade = null; }
  el.style.setProperty('--pmw-guide-tile', s.tile + 'px');
  el.style.setProperty('--pmw-guide-gap', s.gap + 'px');
  setAttr(el, 'data-size', s.mode);
  SIDES.forEach(function (e) {
    setAttr(guideTiles[e], 'data-off', !gd.fits[e]);
    setAttr(guideTiles[e], 'data-on', gd.active === e);
  });
  setAttr(guideTiles.merge, 'data-off', !gd.join);
  setAttr(guideTiles.merge, 'data-on', gd.active === 'merge');
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
    how = 'snap';
  } else if (moved) {
    el.style.translate = x + 'px ' + y + 'px';     // glides (CSS) to the next panel's centre
    how = 'glide';
  }
  var t = s.tile, gp = s.gap;
  return { how: how, rect: s.mode === 'join' ? { x: x + t + gp, y: y + t + gp, w: t, h: t } : { x: x, y: y, w: ext, h: ext } };
}
function hideTiles() {
  if (!guideEl || guideEl.hidden || guideFade) return;
  guideFor = null;
  var el = guideEl;
  var a = motion.animate(el, [{ opacity: 1 }, { opacity: 0 }], { dur: 120, easing: motion.ease('out') });
  if (!a) { el.hidden = true; return; }
  guideFade = a;
  a.onfinish = function () { if (guideFade !== a) return; guideFade = null; el.hidden = true; };
}
dropGuide.hide = function () {
  if (guideEl) guideEl._pmwSig = null;
  hideTiles();
  capHide();
  if (dockEls) SIDES.forEach(function (e) { setAttr(dockEls[e], 'data-on', null); });
};
dropGuide.end = function () {
  if (!guideEl) return;
  guideEl._pmwSig = null;
  hideTiles();
  capHide();
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

/* ---- the zone's name, never under what is carried (landing round 2, 2026-10-14: in Basic dark the bottom dock's
   "New row across the bottom" lay under the carried tab, at rest, on two routes). The chip rides where the tab tore
   off, often above the pointer, which is exactly where that name sat. The rule, at every zone that names itself (a
   panel's guide, a dock, "+N", a strip a carried panel joins through):
   - the name has places round its anchor, in order: a guide below, above, right, left of its tiles; a dock on the
     panel area's side of it, then beside it along the edge, either way; a strip below, left, right, above;
   - it takes the first place clear of the carry (the chip and the pointer) by 12 px, and by 4 px of the other docks
     and of where the live preview draws the new panel's tab and mark (from the zone, so the name never has to move
     when the preview applies);
   - it moves only when it must or when the hand rests: the place it holds keeps it while 4 px stay clear of the carry,
     however the hand moves; when the carry reaches it, it goes at once to the first clear place the carry is not
     heading for (the chip's path for the next 140 px, or 450 ms at its speed), so it steps out behind the hand
     rather than in front of it;
     once the hand has rested 200 ms, it settles into the first place that has stayed clear 160 ms;
   - the docks and the preview give way first: with no place clear of everything, it keeps or takes one clear of the
     carry; when every clear place lies in the chip's path, or none is clear (a cramped panel area), it stands just
     past the chip on its own side and rides along with it; it is drawn above the chip in any case, so a passing
     overlap never hides its words;
   - it steps aside with a short glide in the look's own motion and a slight duck (Retro and NieR stepped, no duck);
     Reduced Motion: it fades out and in again at its new place, nothing travels. Panel to panel it rides with the
     guide's glide; anything else comes in where it lands.
   The carry's boxes come from the gesture (no layout read per frame); the name's own size is read once per words and
   look. */
var CAP_GAP = 10, CAP_STAY = 4, CAP_ENTER = 12, CAP_BACK_MS = 160, CAP_REST_MS = 200, CAP_SWAP_MS = 400;
var CAP_AHEAD = [[40, 150], [90, 300], [140, 450]];   // the carry's path: px along its heading, or ms at its speed if further
var CAP_SIDES = {
  guide: ['below', 'above', 'right', 'left'],
  strip: ['below', 'left', 'right', 'above'],
  dock: { bottom: ['above', 'left', 'right'], top: ['below', 'left', 'right'], left: ['right', 'above', 'below'], right: ['left', 'above', 'below'] }
};
var cap = { anchor: null, label: '', side: null, x: null, y: null, shown: false, enter: false, glide: false, backSince: 0,
  fade: null, swap: null, pend: null, swapTimer: 0, snapRaf: 0, sizes: {}, docks: [], soft: [], bounds: null, speed: 1,
  rx: null, ry: null, movedAt: 0, trail: [], vel: null };
dropGuide.caption = function () { return { anchor: cap.anchor && cap.anchor.key, side: cap.side, x: cap.x, y: cap.y, shown: cap.shown }; };

/* what the name sits by for a zone, and its places; null: the zone has no name */
function capAnchor(z, tiles) {
  var base = baseRects();
  if (!base) return null;
  var cr = base.centre;
  cap.bounds = { x: cr.x + 4, y: cr.y + 4, w: cr.w - 8, h: cr.h - 8 };
  if (tiles) return { kind: 'guide', key: 'guide-' + z.guide.panelId + '-' + z.guide.size.mode, rect: tiles.rect, sides: CAP_SIDES.guide };
  if (z.type === 'root') {
    var p = dockPoint(cr, z.edge);
    return { kind: 'dock', key: 'dock-' + z.edge, edge: z.edge, rect: { x: p.x - 16, y: p.y - 16, w: 32, h: 32 }, sides: CAP_SIDES.dock[z.edge] };
  }
  if (z.type === 'strip' && z.rect) return { kind: 'strip', key: z.key, rect: z.rect, sides: CAP_SIDES.strip };
  if (z.type === 'merge' && z.viaStrip) {
    var r = base.panels[z.panelId], pp = model.panel(state.layout, z.panelId);
    if (!r) return null;
    var sh = pp && pp.collapsed ? r.h : Math.min(r.h, stripHeight(render.panelEl(z.panelId)));
    return { kind: 'strip', key: 'join-' + z.panelId, rect: { x: r.x, y: r.y, w: r.w, h: sh }, sides: CAP_SIDES.guide };
  }
  return null;
}
/* where the live preview will draw the new panel a carried tab makes (31-dropview.js, 55-drop.css): its tab at the
   foot of its strip, 8 px in, and its 58 px mark in the middle of its body. The zone's rect is the side the new panel
   takes, near enough before the preview applies (the room rule may shift it a little; the margin covers that) */
function ghostKeep(g, z) {
  if (!g || !g.tid || (z.type !== 'split' && z.type !== 'root') || !z.rect) return [];
  var r = z.rect, tabH = g.chipH || 31, bodyY = r.y + STRIP_H, bodyH = Math.max(0, r.h - STRIP_H);
  return [{ x: r.x + r.w / 2 - 29, y: bodyY + bodyH / 2 - 29, w: 58, h: 58 },
    { x: r.x + 8, y: r.y + STRIP_H - tabH, w: Math.max(0, Math.min(r.w - 16, g.chipW || 120)), h: tabH }];
}
function capTarget(g, z, tiles) {
  var a = z && z.label ? capAnchor(z, tiles) : null;
  if (!a) { capHide(); return; }
  var prev = cap.anchor;
  cap.anchor = a;
  cap.soft = ghostKeep(g, z);
  for (var i = 0; i < cap.docks.length; i++) if (!(a.kind === 'dock' && cap.docks[i].edge === a.edge)) cap.soft.push(cap.docks[i]);
  if (!prev) cap.speed = motion.speed();
  if (!prev || prev.key !== a.key) {
    cap.side = null;
    cap.backSince = 0;
    cap.glide = !!prev && cap.shown && prev.kind === 'guide' && a.kind === 'guide' && !!tiles && tiles.how === 'glide';
    cap.enter = !cap.glide;
  }
  if (cap.label !== z.label) { cap.label = z.label; setText(guideCap, z.label); }
}
function capShow() {
  if (cap.fade) { try { cap.fade.cancel(); } catch (_) {} cap.fade = null; }
  guideCap.hidden = false;
  cap.shown = true;
  cap.enter = true;
}
function capHide() {
  cap.anchor = null; cap.side = null; cap.backSince = 0; cap.pend = null; cap.glide = false;
  if (!gesture.active) { cap.trail = []; cap.vel = null; cap.rx = null; }
  if (!guideCap) return;
  if (cap.swap) { try { cap.swap.cancel(); } catch (_) {} cap.swap = null; }
  if (!cap.shown) return;
  cap.shown = false;
  var el = guideCap;
  var a = motion.animate(el, [{ opacity: 1 }, { opacity: 0 }], { dur: 120, easing: motion.ease('out') });
  if (!a) { el.hidden = true; return; }
  cap.fade = a;
  a.onfinish = function () { if (cap.fade !== a) return; cap.fade = null; el.hidden = true; };
}
/* the name's size, read once per words and look (it has to be showing to be measured) */
function capSize() {
  var key = cap.label + '|' + (root.getAttribute('data-theme') || '') + '|' + (root.getAttribute('data-o55-nier') || '');
  var s = cap.sizes[key];
  if (s) return s;
  if (guideCap.hidden) return null;
  s = { w: guideCap.offsetWidth, h: guideCap.offsetHeight };
  if (!s.w || !s.h) return null;
  cap.sizes[key] = s;
  return s;
}
/* the carry, which the name always keeps clear of: the pointer (the grabbing hand round its hot spot) and the chip */
function capCarry(g) {
  var out = [{ x: g.px - 12, y: g.py - 12, w: 24, h: 26 }];
  if (g.chipBox) out.push(g.chipBox);
  return out;
}
function capHit(c, keep, m) {
  for (var i = 0; i < keep.length; i++) {
    var k = keep[i];
    if (c.x < k.x + k.w + m && c.x + c.w > k.x - m && c.y < k.y + k.h + m && c.y + c.h > k.y - m) return k;
  }
  return null;
}
function capInside(c, b) { return !b || (c.x >= b.x - 0.5 && c.y >= b.y - 0.5 && c.x + c.w <= b.x + b.w + 0.5 && c.y + c.h <= b.y + b.h + 0.5); }
/* a place on one side of the anchor; it slides along that side to stay in the panel area, and is out if it cannot */
function capSideRect(r, side, size, b) {
  var w = size.w, hh = size.h, x, y;
  if (side === 'below') { x = r.x + r.w / 2 - w / 2; y = r.y + r.h + CAP_GAP; }
  else if (side === 'above') { x = r.x + r.w / 2 - w / 2; y = r.y - CAP_GAP - hh; }
  else if (side === 'right') { x = r.x + r.w + CAP_GAP; y = r.y + r.h / 2 - hh / 2; }
  else { x = r.x - CAP_GAP - w; y = r.y + r.h / 2 - hh / 2; }
  if (b) {
    if (side === 'below' || side === 'above') x = clamp(x, b.x, Math.max(b.x, b.x + b.w - w));
    else y = clamp(y, b.y, Math.max(b.y, b.y + b.h - hh));
  }
  var c = { side: side, x: Math.round(x), y: Math.round(y), w: w, h: hh };
  return capInside(c, b) ? c : null;
}
function capSolve(a, size, carry, soft) {
  var cands = [], cur = null, i, c;
  for (i = 0; i < a.sides.length; i++) {
    c = capSideRect(a.rect, a.sides[i], size, cap.bounds);
    if (!c) continue;
    cands.push(c);
    if (c.side === cap.side) cur = c;
  }
  if (!cands.length) { cap.backSince = 0; return capSideRect(a.rect, a.sides[0], size, null); }
  // a place just past the chip is held like any other, following the chip along its own side
  if (!cur && /-past$/.test(cap.side || '')) cur = capPastOn(cands, cap.side.replace(/-past$/, ''), carry);
  var full = function (q, m) { return !capHit(q, carry, m) && !capHit(q, soft, CAP_STAY); };
  var bare = function (q, m) { return !capHit(q, carry, m); };
  if (cur && full(cur, CAP_STAY)) return capSettle(cands, cur, full);
  cap.backSince = 0;
  // the carry reached it (or nothing is held yet): a clear place the carry is not heading for; else keep a place that
  // is clear of the carry and only near a dock or the preview; else just past the chip, following it; else anything clear
  return capFirst(cands, cur, full, carry, true) || (cur && bare(cur, CAP_STAY) ? cur : null) || capFirst(cands, cur, bare, carry, true)
    || capPast(cands, carry) || capFirst(cands, cur, full, carry, false) || capFirst(cands, cur, bare, carry, false)
    || capAny(cands, cur, bare) || cur || cands[0];
}
/* held while it stays clear; a better place only once the hand rests and that place has stayed clear a moment */
function capSettle(cands, cur, clear) {
  var ci = cands.indexOf(cur), now = performance.now();
  for (var i = 0; i < (ci < 0 ? cands.length : ci); i++) {
    if (!clear(cands[i], CAP_ENTER)) continue;
    if (!cap.backSince) cap.backSince = now;
    if (now - cap.backSince >= CAP_BACK_MS * cap.speed && now - cap.movedAt >= CAP_REST_MS * cap.speed) { cap.backSince = 0; return cands[i]; }
    return cur;
  }
  cap.backSince = 0;
  return cur;
}
function capFirst(cands, cur, clear, carry, ahead) {
  for (var i = 0; i < cands.length; i++) if (cands[i] !== cur && clear(cands[i], CAP_ENTER) && !(ahead && capDoomed(cands[i], carry))) return cands[i];
  return null;
}
function capAny(cands, cur, clear) {
  for (var i = 0; i < cands.length; i++) if (cands[i] !== cur && clear(cands[i], CAP_STAY)) return cands[i];
  return null;
}
/* where the carry is heading: its boxes moved along the pointer's recent velocity, a little ahead */
function capDoomed(q, carry) {
  var v = cap.vel;
  if (!v) return false;
  var sp = Math.hypot(v.x, v.y);
  for (var j = 0; j < CAP_AHEAD.length; j++) {
    var d = Math.max(CAP_AHEAD[j][0], sp * CAP_AHEAD[j][1]), dx = v.x / sp * d, dy = v.y / sp * d;
    for (var i = 0; i < carry.length; i++) {
      var k = carry[i];
      if (capHit(q, [{ x: k.x + dx, y: k.y + dy, w: k.w, h: k.h }], CAP_STAY)) return true;
    }
  }
  return false;
}
/* just past the carry on one side, if that stays in the panel area */
function capPastOn(cands, side, carry) {
  for (var i = 0; i < cands.length; i++) {
    if (cands[i].side !== side) continue;
    var c = { side: side + '-past', x: cands[i].x, y: cands[i].y, w: cands[i].w, h: cands[i].h };
    for (var n = 0, k; n < 4 && (k = capHit(c, carry, CAP_ENTER)); n++) {
      if (side === 'above') c.y = Math.round(k.y - CAP_ENTER - c.h);
      else if (side === 'below') c.y = Math.round(k.y + k.h + CAP_ENTER);
      else if (side === 'left') c.x = Math.round(k.x - CAP_ENTER - c.w);
      else c.x = Math.round(k.x + k.w + CAP_ENTER);
    }
    return capInside(c, cap.bounds) && !capHit(c, carry, CAP_STAY) ? c : null;
  }
  return null;
}
/* nothing clear: just past the carry on a side, the first that stays in the panel area */
function capPast(cands, carry) {
  for (var i = 0; i < cands.length; i++) { var c = capPastOn(cands, cands[i].side, carry); if (c) return c; }
  return null;
}
/* the hand's recent velocity (px/ms over the last 120 ms) and when it last moved */
function capTrack(g) {
  var now = performance.now(), tr = cap.trail;
  if (cap.rx == null || Math.abs(g.px - cap.rx) + Math.abs(g.py - cap.ry) > 4) { cap.rx = g.px; cap.ry = g.py; cap.movedAt = now; }
  tr.push([now, g.px, g.py]);
  while (tr.length > 2 && now - tr[0][0] > 120) tr.shift();
  var a = tr[0], dt = now - a[0];
  var vx = dt > 0 ? (g.px - a[1]) / dt : 0, vy = dt > 0 ? (g.py - a[2]) / dt : 0;
  cap.vel = Math.hypot(vx, vy) > 0.03 ? { x: vx, y: vy } : null;
}
function capPlace(g) {
  capTrack(g);
  var a = cap.anchor;
  if (!a) return;
  if (!cap.shown) capShow();
  var size = capSize();
  if (!size) return;
  var c = capSolve(a, size, capCarry(g), cap.soft);
  if (c) capMove(c);
}
function capSet(c) { cap.x = c.x; cap.y = c.y; guideCap.style.translate = c.x + 'px ' + c.y + 'px'; }
/* placed with no transition (cleared on the next frame, after this one's style has been taken) */
function capSnap(c) {
  var el = guideCap;
  el.style.transition = 'none';
  capSet(c);
  if (cap.snapRaf) cancelAnimationFrame(cap.snapRaf);
  cap.snapRaf = requestAnimationFrame(function () { cap.snapRaf = 0; el.style.transition = ''; });
}
function capMove(c) {
  var el = guideCap, prevSide = cap.side;
  if (cap.enter) {
    cap.enter = false; cap.glide = false; cap.pend = null; cap.side = c.side;
    if (cap.swap) { try { cap.swap.cancel(); } catch (_) {} cap.swap = null; }
    capSnap(c);
    motion.animate(el, [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { dur: 150, easing: motion.ease('out') });
    return;
  }
  if (cap.pend) { cap.pend = c; cap.side = c.side; return; }      // fading out under Reduced Motion: comes in there
  cap.side = c.side;
  if (c.x === cap.x && c.y === cap.y) return;
  if (cap.glide) { cap.glide = false; capSet(c); return; }        // with the guide, on the name's own transition
  if (prevSide && prevSide !== c.side) { capSwap(c); return; }
  if (/-past$/.test(c.side) && !reducedMotion()) { capSet(c); return; }   // following the chip past it
  capSnap(c);                                                     // new words, re-centred where they were
}
/* stepping aside: a short glide with a slight duck; Reduced Motion: out where it was, in where it goes */
function capSwap(c) {
  var el = guideCap;
  if (cap.swap) { try { cap.swap.cancel(); } catch (_) {} cap.swap = null; }
  if (reducedMotion()) {
    if (!el.animate) { capSnap(c); return; }
    cap.pend = c;
    var out = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, easing: 'linear', fill: 'forwards' });
    cap.swap = out;
    out.onfinish = function () {
      if (cap.swap !== out || !cap.pend) return;
      capSnap(cap.pend);
      cap.pend = null;
      var inn = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 130, easing: 'linear' });
      try { out.cancel(); } catch (_) {}
      cap.swap = inn;
      inn.onfinish = function () { if (cap.swap === inn) cap.swap = null; };
    };
    return;
  }
  setAttr(el, 'data-swap', true);
  capSet(c);
  clearTimeout(cap.swapTimer);
  cap.swapTimer = setTimeout(function () { setAttr(el, 'data-swap', null); }, CAP_SWAP_MS);
  var fam = motion.family();
  if (fam !== 'retro' && fam !== 'nier') {
    cap.swap = motion.animate(el, [{ opacity: 1, transform: 'none' }, { opacity: .82, transform: 'scale(.96)', offset: .4 }, { opacity: 1, transform: 'none' }], { dur: 260, easing: 'ease-in-out' });
  }
}
