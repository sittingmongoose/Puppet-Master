/* Dragging tabs and panels (D1). One gesture (PMW.gesture) with two modes:
   - in the strip: the reorder Jared approved (PMConcept7's edReorder*): activate on grab at 4 px, 1:1 transform-only
     follow, cached transform-free midpoints, 250 ms neighbour FLIP on (.22,1,.36,1), a 0.35 rubber band at the strip
     ends, Retro's 8 px cells, the plate under the carried tab in the same frame, a 160 ms (.17,.84,.29,.99) settle the
     plate rides, one cmd.panel_tab.move on release.
   - torn off (the pointer leaves the strip band by 14 px): a floating chip follows the pointer and the landing preview
     shows the result: another strip (insert), a panel body's edge (split, only where both halves fit), a body's centre
     (merge), the centre's outer edge (a new full-height or full-width panel), "+N" (to the end).
   Full cancel (Escape, pointercancel, lost capture, blur, a release over the chat or the rail) restores the order and
   the active tab and dispatches nothing. Every outcome also has a menu path (the tab menu) and a keyboard path
   (Ctrl+Shift+PgUp/PgDn, Ctrl+Alt+arrows). */

var tabDrag = PMW.tabDrag = {};
var TEAR_BAND = 14, ROOT_BAND = 12, FLIP_MS = 250, SETTLE_MS = 160;
var SETTLE_EASE = 'cubic-bezier(.17,.84,.29,.99)', FLIP_EASE = 'cubic-bezier(.22,1,.36,1)';

function retroOn() { var lk = look(); return lk.family === 'retro' && !lk.nier; }

tabDrag.begin = function (ev, tabEl, s) {
  var tid = tabEl._pmwId;
  if (!model.panel(state.layout, s.panelId)) return;
  var host = s.list.closest('.pmw-strip');
  gesture.start(ev, {
    // the pointer is captured on the strip, which never moves: the reorder re-slots the carried tab in the DOM, and an
    // element that leaves the DOM loses capture (Chrome then fires lostpointercapture, which would cancel the drag)
    el: host,
    cursor: 'grabbing',
    onStart: function (g) {
      var l = state.layout, p = model.panel(l, s.panelId);     // the layout as it is at the 4 px threshold
      if (!p || p.tabs.indexOf(tid) < 0 || !tabEl.isConnected) return false;
      g.tid = tid; g.s = s; g.host = host; g.tab = tabEl;
      g.origin = { panelId: p.id, index: p.tabs.indexOf(tid), active: p.active, pinned: !!l.tabs[tid].pinned };
      g.rec = l.tabs[tid];
      g.kindMin = (kindDef(g.rec.kind) || {}).min || PANEL_MIN;
      // freeze the fitter at the current widths and the current "+N" set (no reflow under the silhouette)
      var frozen = {};
      Object.keys(s.tabEls).forEach(function (k) { frozen[k] = s.tabEls[k].hidden ? -1 : s.tabEls[k].offsetWidth; });
      s.frozen = frozen;
      s.dragging = true;
      s.dragOwner = g;
      host.classList.add('is-dragging');
      tabEl.classList.add('pmw-dragging');
      grabActivate(g);
      g.mode = 'strip';
      cacheSlots(g);
      g.retro = retroOn() && !reducedMotion();
      if (g.retro) tabEl.classList.add('pmw-rfx-drag');
      shape.snap(host);
      return true;
    },
    onFrame: function (g) {
      // the carried tab closed or moved away under the drag (an agent, the chat): end it, nothing to put back
      var at = model.panelOf(state.layout, g.tid);
      if (!at || at.id !== g.origin.panelId || !g.tab.isConnected) { g.end('gone'); return; }
      var hr = host.getBoundingClientRect();
      var inBand = g.py >= hr.top - TEAR_BAND && g.py <= hr.bottom + TEAR_BAND && g.px >= hr.left - 40 && g.px <= hr.right + 40;
      if (g.mode === 'strip' && !inBand && canTear(g)) tearOff(g);
      else if (g.mode === 'torn' && inBand) rejoin(g);
      if (g.mode === 'strip') followInStrip(g);
      else followChip(g);
    },
    probe: function (g) { return g.mode === 'strip' ? { key: 'strip-self', instant: true } : probeZones(g); },
    onZone: function (g, z) { showZone(g, z); },
    onDrop: function (g, z) { return drop(g, z); },
    onCancel: function (g, how) { cancel(g, how); },
    onEnd: function (g) { clearGap(g, false); preview.hide(); }
  });
};

function canTear(g) { return true; }

/* Activate on grab: the same view action as PMW.activateTab (the active tab, the attention mark cleared, the MRU, a
   quiet save, the 'activate' event), minus expanding a collapsed panel, which would move the strip under the pointer.
   The paint it schedules leaves the carried tab where the drag has it (32-strip.js placeTab). A cancel puts the
   previous tab back the same way (restore). */
function grabActivate(g) {
  var l = state.layout, p = model.panel(l, g.origin.panelId), rec = l.tabs[g.tid];
  if (!p || !rec) return;
  g.activated = p.active !== g.tid;
  if (!g.activated && !rec.attention) return;
  viewAction(UI.activate, function (lay) {
    var pp = model.panel(lay, p.id), r = lay.tabs[g.tid];
    pp.active = g.tid;
    lay.view.focus = pp.id;
    if (r.attention) r.attention = false;
    if (typeof touchMru === 'function') touchMru(lay, g.tid);
  }, { animate: false });
  strip.render(render.panelEl(p.id), p, l, {});      // the plate moves under the carried tab in this frame
  bus.emit('activate', { tabId: g.tid, panelId: p.id, kind: rec.kind, reason: 'drag' });
}

/* ---- in-strip reorder ---- */
/* transform-free left of a tab in viewport px: its layout offset inside its (never transformed) offset parent. A
   neighbour in the middle of its FLIP, or the carried tab itself, is measured where it sits, not where it is drawn. */
function layoutX(el) {
  var op = el.offsetParent;
  if (!op) return el.getBoundingClientRect().left;
  return op.getBoundingClientRect().left + op.clientLeft + el.offsetLeft;
}
function cacheSlots(g) {
  // the carried tab's own group only (its container: pinned tabs reorder among pinned tabs), visible tabs only
  var kids = g.tab.parentNode ? g.tab.parentNode.children : [];
  g.mids = [];
  for (var i = 0; i < kids.length; i++) {
    var t = kids[i];
    if (t === g.tab || t.hidden || !t._pmwId) continue;
    g.mids.push({ el: t, mid: layoutX(t) + t.offsetWidth / 2 });
  }
  g.slotLeft = layoutX(g.tab);
  g.slotW = g.tab.offsetWidth;
  if (g.grabX == null) g.grabX = g.sx - g.tab.getBoundingClientRect().left;   // set once, at the grab (no transform yet)
}
function nextVisibleTab(el) {
  var n = el.nextElementSibling;
  while (n && (n.hidden || !n._pmwId)) n = n.nextElementSibling;
  return n;
}
function followInStrip(g) {
  var hr = g.host.getBoundingClientRect();
  var center = g.px - g.grabX + g.slotW / 2;
  var before = null;
  for (var i = 0; i < g.mids.length; i++) if (center < g.mids[i].mid) { before = g.mids[i].el; break; }
  if (nextVisibleTab(g.tab) !== before) reslot(g, before);
  var tx = g.px - g.grabX - g.slotLeft;
  var txMin = hr.left - g.slotLeft, txMax = hr.right - g.slotW - g.slotLeft;
  if (tx < txMin) tx = txMin + (tx - txMin) * 0.35;
  if (tx > txMax) tx = txMax + (tx - txMax) * 0.35;
  if (g.retro) tx = Math.round(tx / 8) * 8;
  g.lastTx = tx;
  g.tab.style.transform = 'translateX(' + tx.toFixed(1) + 'px)';
  shape.snap(g.host);
}
/* move the carried tab's slot before `before` (null: right after the last visible tab of its group, so tabs behind
   "+N" keep their places), and FLIP the neighbours from where they were drawn */
function reslot(g, before) {
  var container = g.tab.parentNode;
  var others = Array.prototype.filter.call(container.children, function (t) { return t !== g.tab && !t.hidden; });
  var was = others.map(function (t) { return t.getBoundingClientRect().left; });
  if (before) container.insertBefore(g.tab, before);
  else {
    var lastVis = g.mids.length ? g.mids[g.mids.length - 1].el : null;
    container.insertBefore(g.tab, lastVis ? lastVis.nextSibling : null);
  }
  var motionOK = !reducedMotion();
  others.forEach(function (t, i) {
    t.style.transition = 'none';
    t.style.transform = '';
    var dx = was[i] - t.getBoundingClientRect().left;
    if (motionOK && Math.abs(dx) >= 1) {
      t.style.transform = 'translateX(' + dx + 'px)';
      void t.offsetWidth;
      t.style.transition = 'transform ' + FLIP_MS + 'ms ' + FLIP_EASE;
      t.style.transform = '';
    }
  });
  cacheSlots(g);      // layout positions: the carried tab's new slot and the neighbours' resting midpoints
}

/* ---- torn off: a chip and drop zones ---- */
function tearOff(g) {
  g.mode = 'torn';
  var r = g.tab.getBoundingClientRect();
  var chip = g.tab.cloneNode(true);
  chip.removeAttribute('id');
  chip.classList.add('pmw-chip');
  chip.classList.remove('pmw-dragging', 'pmw-rfx-drag');
  chip.setAttribute('aria-hidden', 'true');
  chip.style.transform = '';
  // an icon or pinned tab shows its name on the chip too: the chip takes the width it needs (up to a full tab's)
  var wasIcon = /^(icon|pinned)$/.test(chip.getAttribute('data-size') || '');
  if (wasIcon) { chip.setAttribute('data-size', 'full'); chip.style.padding = '0 12px 0 10px'; }
  var lab = chip.querySelector('.pmw-tlabel');
  if (wasIcon && lab) lab.textContent = tabLabel(g.rec);
  chip.style.width = r.width + 'px';
  chip.style.left = r.left + 'px';
  chip.style.top = r.top + 'px';
  overlay().appendChild(chip);
  if (wasIcon) { chip.style.width = ''; chip.style.width = Math.max(r.width, Math.min(TAB.max, Math.ceil(chip.getBoundingClientRect().width))) + 'px'; }
  g.chip = chip;
  g.chipOffX = g.px - r.left; g.chipOffY = g.py - r.top;
  g.chipW = parseFloat(chip.style.width) || r.width;
  g.tab.style.transform = '';
  g.tab.classList.add('pmw-torn');      // keeps its slot but paints nothing: the strip shows where it came from
  g.liftAt = performance.now();
  shape.snap(g.host);
  announce('Moving ' + tabLabel(g.rec) + '. Drop it on a tab strip, the edge of a panel to split, or a panel to join it. Escape puts it back.');
}
function rejoin(g) {
  g.mode = 'strip';
  if (g.chip) { g.chip.remove(); g.chip = null; }
  g.tab.classList.remove('pmw-torn');
  g.zone = null;
  preview.hide();
  cacheSlots(g);      // the slot it kept while torn; followInStrip then draws it under the pointer again
}
function followChip(g) {
  if (!g.chip) return;
  var k = reducedMotion() ? 1 : motion.curve('cubic-bezier(.2,.8,.2,1)')(Math.min(1, (performance.now() - g.liftAt) / 140));
  var x = g.px - g.chipOffX, y = g.py - g.chipOffY - 4 * k;
  g.chip.style.transform = 'translate3d(' + (x - parseFloat(g.chip.style.left)).toFixed(1) + 'px,' + (y - parseFloat(g.chip.style.top)).toFixed(1) + 'px,0)';
  setAttr(g.chip, 'data-alt', g.alt);
}

function bodyRect(panelEl) {
  var r = panelEl.getBoundingClientRect();
  var strip = panelEl.querySelector('.pmw-strip');
  var sh = strip ? strip.offsetHeight : STRIP_H;
  return { x: r.left, y: r.top + sh, w: r.width, h: r.height - sh, top: r.top, full: { x: r.left, y: r.top, w: r.width, h: r.height } };
}
function inRect(x, y, r, pad) { pad = pad || 0; return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad; }

/* the drop zones under the pointer: { key, type, panelId, edge, index, rect, label } */
function probeZones(g) {
  var l = state.layout, c = state.centre.getBoundingClientRect();
  var cr = { x: c.left, y: c.top, w: c.width, h: c.height };
  var x = g.px, y = g.py;
  var narrow = PMW.narrow && PMW.narrow.singleColumn();
  var inCentre = inRect(x, y, cr, 0);
  // the centre's outer edge: a new panel along the whole side. Checked before the hysteresis below, so the outer 12 px
  // band takes over from any zone the pointer arrives from
  if (inCentre && !narrow) {
    var edges = [['left', x - cr.x], ['right', cr.x + cr.w - x], ['top', y - cr.y], ['bottom', cr.y + cr.h - y]];
    for (var e = 0; e < edges.length; e++) {
      if (edges[e][1] <= ROOT_BAND && geom.rootFits(l, edges[e][0], render.centreRect(), g.kindMin)) {
        var ed = edges[e][0];
        return { key: 'root-' + ed, type: 'root', edge: ed, rect: rootRect(cr, ed), hit: edgeBand(cr, ed, ROOT_BAND), label: rootLabel(ed) };
      }
    }
  }
  // keep the current zone while the pointer is still within 12 px of it (hysteresis); a merge zone's hit leaves out the
  // edge bands that offer a split, so carrying a tab from a panel's middle toward its edge turns the preview into
  // the split 12 px into the band, whatever the path
  if (g.zone && g.zone.hit && inRect(x, y, g.zone.hit, 12) && g.zone.type !== 'strip') return g.zone;
  if (!inCentre) return null;                                     // over the chat, the rail: no drop
  var panels = model.panels(l);
  for (var i = 0; i < panels.length; i++) {
    var p = panels[i];
    var el = render.panelEl(p.id);
    if (!el || el.hidden) continue;
    var full = el.getBoundingClientRect();
    if (!inRect(x, y, { x: full.left, y: full.top, w: full.width, h: full.height }, 0)) continue;
    var stripEl = el.querySelector('.pmw-strip');
    var sr = stripEl.getBoundingClientRect();
    var own = p.id === g.origin.panelId;
    // a strip: insert at an index ("+N" appends)
    if (y <= sr.bottom + 4) {
      var st = stripEl._pmw;
      var moreR = st.more.hidden ? null : st.more.getBoundingClientRect();
      if (moreR && x >= moreR.left - 4 && x <= moreR.right + 4) {
        return { key: 'more-' + p.id, type: 'strip', panelId: p.id, index: p.tabs.length, rect: { x: moreR.left, y: sr.top + 3, w: moreR.width, h: sr.height - 3 }, hit: { x: moreR.left, y: sr.top, w: moreR.width, h: sr.height }, label: 'To the end' };
      }
      if (own) return null;     // the origin strip is handled in strip mode
      var ins = insertionIn(st, p, x);
      return { key: 'strip-' + p.id + '-' + ins.index, type: 'strip', panelId: p.id, index: ins.index, gap: true,
        rect: { x: ins.x, y: sr.top + 3, w: g.chipW, h: sr.height - 3 }, hit: null, label: '' };
    }
    if (p.collapsed) return { key: 'merge-' + p.id, type: 'merge', panelId: p.id, rect: rectOf(stripEl), hit: rectOf(stripEl), label: 'Join this panel' };
    var b = bodyRect(el);
    var band = function (len) { return clamp(len * 0.15, 32, 72); };
    var dl = x - b.x, dr = b.x + b.w - x, dt = y - b.y, db = b.y + b.h - y;
    var rects = render.rects();
    var cands = [];
    if (!narrow) {
      if (dl <= band(b.w)) cands.push(['left', dl]);
      if (dr <= band(b.w)) cands.push(['right', dr]);
      if (dt <= band(b.h)) cands.push(['top', dt]);
      if (db <= band(b.h)) cands.push(['bottom', db]);
    }
    cands.sort(function (a, c2) { return a[1] - c2[1]; });
    var soleTab = own && p.tabs.length === 1;
    for (var k = 0; k < cands.length; k++) {
      var edge = cands[k][0];
      if (soleTab) break;
      if (!geom.splitFits(l, p.id, edge, rects, g.kindMin)) continue;
      return { key: 'split-' + p.id + '-' + edge, type: 'split', panelId: p.id, edge: edge, rect: halfRect(b.full, edge), hit: edgeHit(b, edge, band), label: splitLabel(edge) };
    }
    if (own) return null;    // merging into its own panel changes nothing
    var fitsEdge = function (ed) { return !narrow && geom.splitFits(l, p.id, ed, rects, g.kindMin); };
    var il = fitsEdge('left') ? band(b.w) : 0, ir = fitsEdge('right') ? band(b.w) : 0;
    var it = fitsEdge('top') ? band(b.h) : 0, ib = fitsEdge('bottom') ? band(b.h) : 0;
    var mhit = { x: b.x + il, y: b.y + it, w: Math.max(0, b.w - il - ir), h: Math.max(0, b.h - it - ib) };
    return { key: 'merge-' + p.id, type: 'merge', panelId: p.id, rect: { x: b.x, y: b.y, w: b.w, h: b.h }, hit: mhit, label: 'Join this panel' };
  }
  return null;
}
/* where a torn tab would go in another strip: measured at the tabs' resting places (layoutX), never where the gap the
   strip opens for it (setGap) draws them, so the index does not chase the slide */
function insertionIn(st, p, x) {
  var tabs = p.tabs.filter(function (t) { return st.hidden.indexOf(t) < 0; });
  for (var i = 0; i < tabs.length; i++) {
    var el = st.tabEls[tabs[i]], left = layoutX(el);
    if (x < left + el.offsetWidth / 2) return { index: p.tabs.indexOf(tabs[i]), x: left };
  }
  if (!tabs.length) return { index: p.tabs.length, x: st.list.getBoundingClientRect().left + 4 };
  var last = st.tabEls[tabs[tabs.length - 1]];
  return { index: p.tabs.length, x: layoutX(last) + last.offsetWidth + stripGap(st) };
}
function stripGap(st) { return parseFloat(getComputedStyle(st.tabsEl).columnGap) || 0; }
/* the strip a torn tab hovers opens a gap at the insert index: the tabs from there slide right by the chip's width (the
   250 ms neighbour slide; instant under Reduced Motion), so the slot is drawn in the gap and covers no label */
function setGap(g, z) {
  var st = z && z.gap ? strip.stateOf(z.panelId) : null;
  if (g.gap && g.gap.st !== st) clearGap(g, true);
  if (!st) return;
  var p = model.panel(state.layout, z.panelId);
  if (!p) return;
  var shift = g.chipW + stripGap(st);
  var ease = reducedMotion() ? 'none' : 'transform ' + FLIP_MS + 'ms ' + FLIP_EASE;
  // the tabs from the index on, and "+N" and "+" after them, so the slot never sits under a control either
  var els = p.tabs.map(function (t, i) { return [st.tabEls[t], i >= z.index]; }).concat([[st.more, true], [st.plus, true]]);
  els.forEach(function (pair) {
    var el = pair[0];
    if (!el) return;
    var tf = pair[1] ? 'translateX(' + shift + 'px)' : '';
    if (el.style.transform === tf) return;
    el.style.transition = ease;
    el.style.transform = tf;
  });
  g.gap = { st: st };
}
function clearGap(g, animate) {
  if (!g.gap) return;
  var st = g.gap.st;
  g.gap = null;
  var ease = animate && !reducedMotion() ? 'transform ' + FLIP_MS + 'ms ' + FLIP_EASE : 'none';
  Object.keys(st.tabEls).map(function (t) { return st.tabEls[t]; }).concat([st.more, st.plus]).forEach(function (el) {
    if (!el.style.transform) return;
    el.style.transition = ease;
    el.style.transform = '';
    if (ease === 'none') el.style.transition = '';
    else setTimeout(function () { if (!el.style.transform) el.style.transition = ''; }, FLIP_MS + 40);
  });
}
function halfRect(r, edge) {
  var hw = (r.w - GAP) / 2, hh = (r.h - GAP) / 2;
  if (edge === 'left') return { x: r.x, y: r.y, w: hw, h: r.h };
  if (edge === 'right') return { x: r.x + r.w - hw, y: r.y, w: hw, h: r.h };
  if (edge === 'top') return { x: r.x, y: r.y, w: r.w, h: hh };
  return { x: r.x, y: r.y + r.h - hh, w: r.w, h: hh };
}
function edgeHit(b, edge, band) {
  if (edge === 'left') return { x: b.x, y: b.y, w: band(b.w), h: b.h };
  if (edge === 'right') return { x: b.x + b.w - band(b.w), y: b.y, w: band(b.w), h: b.h };
  if (edge === 'top') return { x: b.x, y: b.y, w: b.w, h: band(b.h) };
  return { x: b.x, y: b.y + b.h - band(b.h), w: b.w, h: band(b.h) };
}
function edgeBand(r, edge, w) {
  if (edge === 'left') return { x: r.x, y: r.y, w: w, h: r.h };
  if (edge === 'right') return { x: r.x + r.w - w, y: r.y, w: w, h: r.h };
  if (edge === 'top') return { x: r.x, y: r.y, w: r.w, h: w };
  return { x: r.x, y: r.y + r.h - w, w: r.w, h: w };
}
function rootRect(r, edge) {
  var f = 0.34;
  if (edge === 'left') return { x: r.x, y: r.y, w: r.w * f, h: r.h };
  if (edge === 'right') return { x: r.x + r.w * (1 - f), y: r.y, w: r.w * f, h: r.h };
  if (edge === 'top') return { x: r.x, y: r.y, w: r.w, h: r.h * f };
  return { x: r.x, y: r.y + r.h * (1 - f), w: r.w, h: r.h * f };
}
function splitLabel(edge) { return { left: 'Split left', right: 'Split right', top: 'Split up', bottom: 'Split down' }[edge]; }
function rootLabel(edge) { return { left: 'New panel along the left', right: 'New panel along the right', top: 'New row across the top', bottom: 'New row across the bottom' }[edge]; }

function showZone(g, z) {
  setGap(g, z && z.key !== 'strip-self' ? z : null);
  if (!z || z.type === undefined || z.key === 'strip-self') {
    preview.hide();
    if (g.chip) setAttr(g.chip, 'data-nodrop', g.mode === 'torn' && !z);
    return;
  }
  if (g.chip) setAttr(g.chip, 'data-nodrop', null);
  preview.show(z.rect, z.label, z.type);
}

/* ---- release ---- */
/* the model index the carried tab's DOM slot stands for: before the tab that follows it (hidden ones included, so
   tabs behind "+N" keep their places), else at the end of its group; an index in the list without the tab, as
   PMW.moveTab reads it */
function dropIndex(g, p) {
  var list = p.tabs.filter(function (t) { return t !== g.tid; });
  var next = g.tab.nextElementSibling;
  while (next && !next._pmwId) next = next.nextElementSibling;
  var i = next ? list.indexOf(next._pmwId) : -1;
  if (i >= 0) return i;
  i = g.origin.pinned ? 0 : list.length;
  for (var k = 0; k < list.length; k++) if (!!state.layout.tabs[list[k]].pinned === g.origin.pinned) i = k + 1;
  return i;
}
function drop(g, z) {
  var s = g.s;
  if (g.mode === 'strip') {
    // the order the DOM shows now is the order to commit, read against the model as it is when the settle ends
    settleInStrip(g, function () {
      var p = model.panel(state.layout, s.panelId);
      var cur = p ? p.tabs.indexOf(g.tid) : -1;
      var index = cur >= 0 ? dropIndex(g, p) : cur;
      finishStrip(g);
      if (cur >= 0 && index !== cur) {
        // a refused move puts the DOM back in model order (CONTRACT 8: a failed commit rolls back)
        if (!PMW.moveTab(g.tid, s.panelId, index, { animate: false })) restore(g, { keepActive: true });
      } else render.schedule({ animate: false });
    });
    return true;
  }
  if (!z) return false;
  var chipRect = g.chip ? g.chip.getBoundingClientRect() : null;
  clearGap(g, false);
  finishStrip(g);
  // the source panel goes back to the tab it showed before the grab; model.moveTab would otherwise show the carried
  // tab's neighbour there
  var src = model.panel(state.layout, g.origin.panelId);
  if (g.activated && src && src.active === g.tid && src.tabs.indexOf(g.origin.active) >= 0) src.active = g.origin.active;
  var ok;
  if (z.type === 'strip') ok = PMW.moveTab(g.tid, z.panelId, z.index);
  else if (z.type === 'merge') ok = PMW.moveTab(g.tid, z.panelId, null);
  else if (z.type === 'split') ok = !!PMW.moveTabToSplit(g.tid, z.panelId, z.edge);
  else if (z.type === 'root') ok = !!PMW.moveTabToSplit(g.tid, '@root', z.edge, { ratio: 0.34 });
  if (!ok) { restore(g); if (g.chip) { g.chip.remove(); g.chip = null; } return true; }
  // what listeners heard at the grab is no longer true: the source shows its previous tab, the carried tab is the
  // active tab of the panel it landed in
  var srcNow = model.panel(state.layout, g.origin.panelId), landedP = model.panelOf(state.layout, g.tid);
  if (g.activated && srcNow && srcNow.active && srcNow !== landedP) bus.emit('activate', { tabId: srcNow.active, panelId: srcNow.id, kind: state.layout.tabs[srcNow.active].kind, reason: 'drag' });
  if (landedP && landedP.id !== g.origin.panelId) bus.emit('activate', { tabId: g.tid, panelId: landedP.id, kind: g.rec.kind, reason: 'drag' });
  render.now({ animate: true });
  var landed = strip.tabEl(g.tid);
  if (landed && chipRect && !reducedMotion()) {
    var lr = landed.getBoundingClientRect();
    var st = motion.settle();
    motion.animate(landed, [{ transform: 'translate(' + (chipRect.left - lr.left) + 'px,' + (chipRect.top - lr.top) + 'px)' }, { transform: 'none' }], { dur: st.dur, easing: st.easing });
    var host2 = landed.closest('.pmw-strip');
    if (host2) rideShape(host2, st.dur);
  }
  if (g.chip) { g.chip.remove(); g.chip = null; }
  nextFrame(function () { var t = strip.tabEl(g.tid); if (t) t.focus({ preventScroll: true }); });
  return true;
}
function rideShape(host, ms) {
  var until = performance.now() + ms + 30;
  (function ride() { shape.snap(host); if (performance.now() < until) requestAnimationFrame(ride); })();
}
function settleInStrip(g, done) {
  var tab = g.tab;
  // settle from where the tab is drawn now to its slot
  var drawn = tab.getBoundingClientRect().left;
  tab.style.transform = '';
  var delta = drawn - tab.getBoundingClientRect().left;
  var finished = false;
  function finish(te) {
    if (te && te.propertyName && te.propertyName !== 'transform') return;
    if (finished) return;
    finished = true;
    tab.removeEventListener('transitionend', finish);
    tab.style.transition = ''; tab.style.transform = '';
    done();
  }
  if (!reducedMotion() && Math.abs(delta) >= 1) {
    tab.style.transition = 'none';
    tab.style.transform = 'translateX(' + delta + 'px)';
    void tab.offsetWidth;
    tab.style.transition = 'transform ' + SETTLE_MS + 'ms ' + SETTLE_EASE;
    tab.style.transform = 'translateX(0px)';
    tab.addEventListener('transitionend', finish);
    setTimeout(finish, SETTLE_MS + 100);
    rideShape(g.host, SETTLE_MS);
  } else finish();
  if (g.retro) { tab.classList.add('pmw-rfx-drop'); setTimeout(function () { tab.classList.remove('pmw-rfx-drop'); }, 320); }
}
function finishStrip(g) {
  var s = g.s;
  if (s.dragOwner !== g) {
    // a settle that ends after the next drag in this strip has begun cleans only its own tab, and only if the new
    // drag is not carrying that same tab
    if (!s.dragOwner || s.dragOwner.tab !== g.tab) { g.tab.classList.remove('pmw-dragging', 'pmw-torn', 'pmw-rfx-drag'); g.tab.style.transition = ''; g.tab.style.transform = ''; }
    return;
  }
  s.dragOwner = null;
  s.dragging = false;
  s.frozen = null;
  g.host.classList.remove('is-dragging');
  g.tab.classList.remove('pmw-dragging', 'pmw-torn', 'pmw-rfx-drag');
  Array.prototype.forEach.call(s.list.querySelectorAll('.pmw-tab'), function (t) { t.style.transition = ''; t.style.transform = ''; });
}
function restore(g, o) {
  // put the DOM back in model order and the active tab back (the grab's activation is undone as a view action too,
  // so the save and the 'activate' listeners follow it)
  var l = state.layout, p = model.panel(l, g.origin.panelId);
  if (p) {
    var back = g.origin.active;
    if (g.activated && !(o && o.keepActive) && back && p.tabs.indexOf(back) >= 0) {
      viewAction(UI.activate, function (lay) { model.panel(lay, p.id).active = back; }, { animate: false });
      bus.emit('activate', { tabId: back, panelId: p.id, kind: l.tabs[back].kind, reason: 'drag-cancel' });
    }
    var el = render.panelEl(p.id);
    var st = el && el.querySelector('.pmw-strip')._pmw;
    if (st) {
      p.tabs.forEach(function (t) {
        var te = st.tabEls[t];
        var cont = state.layout.tabs[t].pinned ? st.pins : st.tabsEl;
        if (te) cont.appendChild(te);
      });
    }
  }
  render.now({ animate: false });
}
function cancel(g, how) {
  clearGap(g, true);
  var tabRect = g.tab.getBoundingClientRect();
  var chip = g.chip;
  finishStrip(g);
  restore(g);
  if (chip) {
    var home = strip.tabEl(g.tid);
    var hr = home ? home.getBoundingClientRect() : tabRect;
    var cr = chip.getBoundingClientRect();
    var cn = motion.cancel();
    var a = motion.animate(chip, [{ transform: chip.style.transform }, { transform: 'translate3d(' + (hr.left - parseFloat(chip.style.left)) + 'px,' + (hr.top - parseFloat(chip.style.top)) + 'px,0)' }], { dur: cn.dur, easing: cn.easing, fill: 'forwards' });
    if (a) a.onfinish = function () { chip.remove(); }; else chip.remove();
    void cr;
  }
  if (how !== 'drop' && how !== 'gone') announce(tabLabel(g.rec) + ' is back where it was');
}

/* ---- dragging a whole panel by its corner grip ---- */
var panelDrag = PMW.panelDrag = {};
panelDrag.begin = function (ev, panelId, gripEl) {
  ev.preventDefault();
  var l = state.layout;
  if (model.panels(l).length < 2) return;
  gesture.start(ev, {
    el: gripEl, cursor: 'grabbing',
    onStart: function (g) {
      g.panelId = panelId;
      g.origin = { panelId: panelId };
      var p = model.panel(state.layout, panelId);
      g.kindMin = PMW.panelMin(state.layout, p);
      g.panelEl = render.panelEl(panelId);
      g.panelEl.classList.add('pmw-panel-lifted');
      var rec = p.active && state.layout.tabs[p.active];
      g.chip = h('div', { class: 'pmw-chip pmw-chip-panel', 'aria-hidden': 'true' }, [icon('panel', { size: 14 }), h('span', { text: (rec ? tabLabel(rec) : 'Empty') + (p.tabs.length > 1 ? ' and ' + (p.tabs.length - 1) + ' more' : '') })]);
      g.chip.style.left = (g.px + 12) + 'px'; g.chip.style.top = (g.py + 10) + 'px';
      overlay().appendChild(g.chip);
      announce('Moving the ' + model.describe(state.layout, panelId) + '. Drop it beside another panel or on a panel to join its tabs. Escape puts it back.');
      return true;
    },
    onFrame: function (g) {
      g.chip.style.transform = 'translate3d(' + (g.px - g.sx).toFixed(1) + 'px,' + (g.py - g.sy).toFixed(1) + 'px,0)';
    },
    probe: function (g) {
      var z = probePanelZones(g);
      return z;
    },
    onZone: function (g, z) { if (z) preview.show(z.rect, z.label, z.type); else preview.hide(); setAttr(g.chip, 'data-nodrop', !z); },
    onDrop: function (g, z) {
      if (!z) return false;
      if (z.type === 'merge') return PMW.mergePanel(g.panelId, z.panelId);
      if (z.type === 'root') return PMW.movePanel(g.panelId, '@root', z.edge);
      return PMW.movePanel(g.panelId, z.panelId, z.edge);
    },
    onCancel: function (g, how) { if (how !== 'drop') announce('The panel is back where it was'); },
    onEnd: function (g) { preview.hide(); if (g.chip) g.chip.remove(); if (g.panelEl) g.panelEl.classList.remove('pmw-panel-lifted'); }
  });
};
function probePanelZones(g) {
  // the same zones a torn tab sees, minus strips; never the panel itself
  var fake = { px: g.px, py: g.py, zone: g.zone, origin: { panelId: g.panelId }, kindMin: g.kindMin, chipW: 120 };
  var z = probeZones(fake);
  if (!z) return null;
  if (z.panelId === g.panelId) return null;
  if (z.type === 'strip') return { key: 'merge-' + z.panelId, type: 'merge', panelId: z.panelId, rect: rectOf(render.panelEl(z.panelId)), hit: rectOf(render.panelEl(z.panelId)), label: 'Join this panel' };
  return z;
}
/* the grip's keyboard path: Enter opens the Move panel menu (every drag outcome has a menu and keyboard path) */
panelDrag.keyboard = function (panelId, gripEl) {
  if (model.panels(state.layout).length < 2) { announce('This is the only panel'); return; }
  menu.open(gripEl, menus.moveTargets(panelId));
};
