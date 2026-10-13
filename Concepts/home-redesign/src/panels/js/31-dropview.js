/* The live drop preview (Jared, 2026-10-13: "It should also show the panel layout changes as you are dragging so the
   user sees the effect of what they are doing"). While a tab or a panel is carried, the zone under it is shown as its
   result, not as a highlight:
   - a split or a dock: the panels glide to where the drop would put them and a ghost panel, the carried tab on its
     strip, grows out of the side the new panel takes;
   - joining a panel: that panel lights inside and its strip opens a slot at its end (33-tabdrag.js setGap);
   - a carried panel glides to its new place, leaving a hole where it was;
   - a panel the carry would empty fades back, to show it closes.
   render.paint lays out the preview draft (PMW.hypo with o.preview) and this module places the ghost and the hole in
   the same paint, with the same glide. The draft keeps the place the carried thing leaves, so the zones (measured on
   the committed layout) stay under the panels the user sees; the drop commits the same move, so nothing moves at the
   drop except that place closing, and the ghost hands over to the real panel. Leaving a zone glides back; Escape
   glides everything home.
   Intent: the guide answers the pointer at once, but the layout only changes once the pointer has settled over a zone
   (held 90 ms and slower than 0.2 px/ms over the last 110 ms, which a hand aiming at a place reaches and a hand
   passing over one does not) or has held it 420 ms, so carrying a tab across the centre does not shuffle every panel
   it passes. Reduced Motion: the result appears in place once the zone has held 160 ms and the pointer
   has slowed; nothing glides or grows; the ghost and the veil fade. */

var dropView = PMW.dropView = {};
var dvs = { ghost: null, hole: null, veil: null, glideUntil: 0, sig: null, pending: null, trail: [] };
var RM_HOLD = 160, INTENT_SPEED = 0.2, INTENT_MIN = 90, INTENT_HOLD = 420, TRAIL_MS = 110;

dropView.gliding = function () { return performance.now() < dvs.glideUntil; };
dropView.active = function () { return !!state.dropPreview; };

/* the preview for a zone: { key, layout, ghost, hole, join, leaving } or null (nothing to show) */
function previewFor(g, z) {
  if (!z || z.key === 'strip-self' || !state.layout) return null;
  var o = { preview: true }, layout = null, spec = { key: z.key };
  if (g.panelId) {
    if (z.type === 'merge') { layout = PMW.hypo.mergePanel(g.panelId, z.panelId, o); spec.join = z.panelId; }
    else if (z.type === 'split' || z.type === 'root') { layout = PMW.hypo.movePanel(g.panelId, z.type === 'root' ? '@root' : z.panelId, z.edge, o); spec.hole = true; }
  } else if (g.tid) {
    if (z.type === 'merge') { layout = PMW.hypo.move(g.tid, z.panelId, null, o); spec.join = z.panelId; }
    else if (z.type === 'strip') layout = PMW.hypo.move(g.tid, z.panelId, z.index, o);
    else if (z.type === 'split' || z.type === 'root') {
      var root = z.type === 'root';
      layout = PMW.hypo.split(g.tid, root ? '@root' : z.panelId, z.edge, root ? 0.34 : 0.5, o);
      if (layout && layout.hypoResult && layout.hypoResult.panelId) {
        spec.ghost = { id: layout.hypoResult.panelId, edge: z.edge, target: root ? '@root' : z.panelId, rec: state.layout.tabs[g.tid] };
      }
    }
  }
  if (!layout) return null;
  spec.layout = layout;
  var leaving = {};
  model.panels(state.layout).forEach(function (p) {
    var q = model.panel(layout, p.id);
    if (p.tabs.length && q && !q.tabs.length) leaving[p.id] = true;
  });
  spec.leaving = leaving;
  return spec;
}

/* show(g, zone): the preview follows the gesture's settled zone (after its dwell), once the carry shows intent */
dropView.show = function (g, z) {
  var sig = z && z.key !== 'strip-self' ? z.key : null;
  dvs.g = g;
  if (sig === dvs.sig) return;
  dvs.sig = sig;
  var spec = previewFor(g, z);
  if (!spec && !state.dropPreview) { dvs.pending = null; return; }
  dvs.pending = { spec: spec, at: performance.now() };
  dropView.tick(g);
};
/* every frame of a carry: the pointer's recent speed, and the pending preview applied once it shows intent */
dropView.tick = function (g) {
  var now = performance.now(), tr = dvs.trail;
  tr.push([now, g.px, g.py]);
  while (tr.length > 2 && now - tr[0][0] > TRAIL_MS) tr.shift();
  var pd = dvs.pending;
  if (!pd) return;
  var held = now - pd.at, a = tr[0], dt = now - a[0];
  var speed = dt > 0 ? Math.hypot(g.px - a[1], g.py - a[2]) / dt : 0;
  var settled = speed < INTENT_SPEED && held >= (reducedMotion() ? RM_HOLD : INTENT_MIN);
  if (!settled && held < INTENT_HOLD) return;
  dvs.pending = null;
  apply(pd.spec);
};

function apply(spec) {
  if (!spec && !state.dropPreview) return;
  state.dropPreview = spec;
  var gs = spec && spec.ghost;
  // one ghost per target panel: another side of the same panel morphs it, another panel retires it and grows a new one
  if (dvs.ghost && (!gs || dvs.ghost.target !== gs.target)) { retireGhost(dvs.ghost); dvs.ghost = null; }
  if (gs && !dvs.ghost) dvs.ghost = makeGhost(gs);
  if (dvs.ghost && gs) { dvs.ghost.id = gs.id; dvs.ghost.edge = gs.edge; setAttr(dvs.ghost.el, 'data-edge', gs.edge); }
  if (spec && spec.hole) { if (!dvs.hole) dvs.hole = makeHole(); }
  else if (dvs.hole) { retireHole(); }
  setVeil(spec && spec.join);
  glide();
}
function glide() {
  dvs.glideUntil = performance.now() + dur('med') + 80;
  render.now({ animate: true, preview: true });
}

/* place(shown, animate): from render.paint, with the preview's rects (centre coordinates) */
dropView.place = function (shown, animate) {
  var gh = dvs.ghost;
  if (gh) {
    var r = shown.panels[gh.id];
    if (r) {
      if (!gh.placed) {
        render.placeEl(gh.el, seedRect(r, gh.edgeAtSeed || gh.edge), false);
        gh.placed = true;
        void gh.el.offsetWidth;
        gh.el.classList.add('is-in');
      }
      render.placeEl(gh.el, r, animate);
      gh.rect = r;
    }
  }
  var ho = dvs.hole;
  if (ho) {
    var hr = shown.panels[HOLE_ID];
    if (hr) {
      render.placeEl(ho.el, hr, ho.placed && animate);
      if (!ho.placed) { ho.placed = true; void ho.el.offsetWidth; ho.el.classList.add('is-in'); }
    }
  }
};
/* a zero-thickness sliver on the side the new panel comes from: it grows from there as its neighbour makes room */
function seedRect(r, edge) {
  if (edge === 'left') return { x: r.x, y: r.y, w: 0, h: r.h };
  if (edge === 'right') return { x: r.x + r.w, y: r.y, w: 0, h: r.h };
  if (edge === 'top') return { x: r.x, y: r.y, w: r.w, h: 0 };
  return { x: r.x, y: r.y + r.h, w: r.w, h: 0 };
}

function makeGhost(gs) {
  var rec = gs.rec;
  var name = rec ? PMW.tabLabel(rec) : '';
  var ic = rec ? PMW.tabIcon(rec) : 'file';
  var el = h('div', { class: 'pmw-dv-ghost', 'aria-hidden': 'true', 'data-edge': gs.edge, 'data-root': gs.target === '@root' ? 'true' : null }, [
    h('div', { class: 'pmw-dv-ghost-strip' }, [h('span', { class: 'pmw-dv-ghost-tab' }, [kindIcon(ic), h('span', { class: 'pmw-dv-ghost-name', text: name })])]),
    h('div', { class: 'pmw-dv-ghost-body' }, [h('span', { class: 'pmw-dv-ghost-mark' }, [kindIcon(ic)]), h('i', { class: 'pmw-dv-ghost-sheen' })])
  ]);
  state.centre.appendChild(el);
  return { el: el, id: gs.id, target: gs.target, edge: gs.edge, edgeAtSeed: gs.edge, placed: false, rect: null };
}
/* a ghost the zone left: back into the side it grew from, fading (Reduced Motion: a fade) */
function retireGhost(gh) {
  var el = gh.el;
  el.classList.remove('is-in');
  el.classList.add('is-out');
  if (gh.rect && !reducedMotion()) render.placeEl(el, seedRect(gh.rect, gh.edge), true);
  setTimeout(function () { el.remove(); }, Math.max(dur('med'), 140) + 60);
}
/* at a drop the real panel takes the ghost's place: the ghost fades over it */
function handOffGhost(gh) {
  var el = gh.el;
  el.classList.add('is-handoff');
  el.classList.remove('is-in');
  setTimeout(function () { el.remove(); }, 260);
}
function makeHole() {
  var el = h('div', { class: 'pmw-dv-hole', 'aria-hidden': 'true' });
  state.centre.appendChild(el);
  return { el: el, placed: false };
}
function retireHole() {
  var el = dvs.hole.el;
  dvs.hole = null;
  el.classList.remove('is-in');
  setTimeout(function () { el.remove(); }, 200);
}
function setVeil(panelId) {
  var cur = dvs.veil;
  if (cur && cur.panelId === panelId) return;
  if (cur) {
    var old = cur.el;
    old.classList.remove('is-in');
    setTimeout(function () { old.remove(); }, 200);
    dvs.veil = null;
  }
  var pe = panelId && render.panelEl(panelId);
  if (!pe) return;
  var el = h('div', { class: 'pmw-dv-veil', 'aria-hidden': 'true' }, [h('i', { class: 'pmw-dv-veil-sheen' })]);
  pe.appendChild(el);
  void el.offsetWidth;
  el.classList.add('is-in');
  dvs.veil = { el: el, panelId: panelId };
}

/* clear(o): end the preview. o.animate false: in place; o.handoff: the drop committed (the ghost hands over to the
   real panel); o.paint false: the caller paints next (a drop's commit) */
dropView.clear = function (o) {
  o = o || {};
  dvs.g = null;
  dvs.pending = null;
  dvs.trail = [];
  dvs.sig = null;
  var had = !!state.dropPreview;
  state.dropPreview = null;
  if (dvs.ghost) { if (o.handoff) handOffGhost(dvs.ghost); else retireGhost(dvs.ghost); dvs.ghost = null; }
  if (dvs.hole) retireHole();
  setVeil(null);
  if (!had || o.paint === false) return;
  if (o.animate === false) render.now({ animate: false });
  else glide();
};
/* after a refused drop the panels glide home from the preview they were left in */
dropView.glideHome = function () { glide(); };
/* the layout changed under a preview (an agent opened or closed a tab): show the same zone's result on the new layout,
   or nothing if that zone no longer has one */
bus.on('layout', function () {
  var g = dvs.g;
  if (!state.dropPreview || !g || g.done) return;
  apply(previewFor(g, g.zone));
});
