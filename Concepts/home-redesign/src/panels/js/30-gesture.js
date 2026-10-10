/* Gesture kit for the universal panels (D1). Ported from the Usage board engine on origin/concept/usage-pm7-20261009
   (0e13ae4bb1): Concepts/usage-redesign/src/js/40-board.js lines 966-1595 (onPointerDown, beginGesture, loop/frameMove,
   glide/hidePreview, endGesture, settleMove, every cancel path, suppressClick, say). The grid parts (resolver, gravity,
   tracks, auto-scroll) stay in Usage; here the targets are drop zones of the split tree.
   Constants: 4 px start threshold, lift 140 ms (.2,.8,.2,1) with no scale (a scaled layer blurs text), zone
   hysteresis 12 px or a quarter of the zone, 100 ms dwell (skipped on release and under Reduced Motion), landing
   preview glide 160 ms, settle on a critically damped spring, cancel glide 300 ms. One command per changed release;
   nothing for a preview, a no-change drop or a cancel. */

var gesture = PMW.gesture = { active: null };
var MOVE_THRESHOLD = PMW.MOVE_THRESHOLD = 4;
var DWELL = 100;

function suppressClick() {
  var kill = function (e) { e.stopPropagation(); e.preventDefault(); };
  window.addEventListener('click', kill, true);
  setTimeout(function () { window.removeEventListener('click', kill, true); }, 0);
}

/* start(event, spec): spec = { el, threshold, onStart(g) -> false to abort, onFrame(g), probe(g) -> zone|null,
   onZone(g, zone, prev), onDrop(g, zone) -> truthy when it committed, onCancel(g, reason), onEnd(g), cursor } */
gesture.start = function (ev, spec) {
  if (gesture.active || ev.button !== 0) return null;
  var g = {
    spec: spec, el: spec.el, pointerId: ev.pointerId,
    sx: ev.clientX, sy: ev.clientY, px: ev.clientX, py: ev.clientY, dx: 0, dy: 0,
    started: false, done: false, zone: null, cand: null, raf: 0, liftAt: 0, alt: ev.altKey, shift: ev.shiftKey
  };
  var threshold = spec.threshold == null ? MOVE_THRESHOLD : spec.threshold;
  function onMove(e) {
    if (e.pointerId !== g.pointerId) return;
    g.px = e.clientX; g.py = e.clientY; g.alt = e.altKey; g.shift = e.shiftKey;
    if (!g.started && Math.hypot(g.px - g.sx, g.py - g.sy) >= threshold) {
      if (!begin()) return;
    }
    if (g.started) e.preventDefault();
  }
  function onUp(e) {
    if (e.pointerId !== g.pointerId) return;
    g.px = e.clientX; g.py = e.clientY;
    if (!g.started) { detach(); return; }
    frame(true);
    end('drop');
  }
  function onCancel(e) { if (e.pointerId !== g.pointerId) return; if (!g.started) { detach(); return; } end('pointercancel'); }
  function onLost() { if (g.started && !g.done) end('lostpointercapture'); }
  function onBlur() { if (g.started) end('blur'); else detach(); }
  function onKey(e) {
    if (!g.started) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); end('escape'); }
    else if (e.key === 'Alt' || e.key === 'Shift') { g.alt = e.altKey; g.shift = e.shiftKey; }
  }
  function onSelect(e) { if (g.started) e.preventDefault(); }
  function attach() {
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onCancel, true);
    window.addEventListener('blur', onBlur);
    doc.addEventListener('keydown', onKey, true);
    doc.addEventListener('keyup', onKey, true);
    doc.addEventListener('selectstart', onSelect, true);
  }
  function detach() {
    window.removeEventListener('pointermove', onMove, true);
    window.removeEventListener('pointerup', onUp, true);
    window.removeEventListener('pointercancel', onCancel, true);
    window.removeEventListener('blur', onBlur);
    doc.removeEventListener('keydown', onKey, true);
    doc.removeEventListener('keyup', onKey, true);
    doc.removeEventListener('selectstart', onSelect, true);
    if (g.el) {
      g.el.removeEventListener('lostpointercapture', onLost);
      try { if (g.el.hasPointerCapture && g.el.hasPointerCapture(g.pointerId)) g.el.releasePointerCapture(g.pointerId); } catch (_) {}
    }
  }
  function begin() {
    g.started = true;
    if (spec.onStart && spec.onStart(g) === false) { g.started = false; detach(); return false; }
    gesture.active = g;
    g.liftAt = performance.now();
    if (PMW.menu && PMW.menu.close) PMW.menu.close();
    try { var sel = window.getSelection(); if (sel && sel.removeAllRanges) sel.removeAllRanges(); } catch (_) {}
    try { g.el.setPointerCapture(g.pointerId); g.el.addEventListener('lostpointercapture', onLost); } catch (_) {}
    var cl = doc.body.classList;
    if (!cl.contains('pm-resizing')) { cl.add('pm-resizing'); g.ownsResizing = true; }
    cl.add('pmw-dragging');
    if (spec.cursor) doc.body.style.cursor = spec.cursor;
    state.dragging = true;
    loop();
    return true;
  }
  function loop() {
    if (gesture.active !== g || g.done) return;
    try { frame(false); } catch (err) { try { console.error('[pm-home] gesture frame failed', err); } catch (_) {} }
    g.raf = requestAnimationFrame(loop);
  }
  function frame(force) {
    g.dx = g.px - g.sx; g.dy = g.py - g.sy;
    if (spec.onFrame) spec.onFrame(g);
    if (!spec.probe) return;
    var z = spec.probe(g);
    var same = (z && g.zone && z.key === g.zone.key) || (!z && !g.zone);
    if (same) { g.cand = null; return; }
    var now = performance.now();
    if (!g.cand || (g.cand.zone ? g.cand.zone.key : null) !== (z ? z.key : null)) g.cand = { zone: z, at: now };
    if (force || reducedMotion() || now - g.cand.at >= DWELL * motion.speed() || (z && z.instant)) {
      var prev = g.zone;
      g.zone = z;
      g.cand = null;
      if (spec.onZone) spec.onZone(g, z, prev);
    }
  }
  function end(how) {
    if (g.done) return;
    g.done = true;
    cancelAnimationFrame(g.raf);
    if (gesture.active === g) gesture.active = null;
    detach();
    var cl = doc.body.classList;
    cl.remove('pmw-dragging');
    if (spec.cursor) doc.body.style.cursor = '';
    state.dragging = false;
    var committed = false;
    try {
      if (how === 'drop' && g.zone && spec.onDrop) committed = !!spec.onDrop(g, g.zone);
      else if (how === 'drop' && spec.onDrop && spec.dropWithoutZone) committed = !!spec.onDrop(g, null);
    } catch (err) { try { console.error('[pm-home] drop failed', err); } catch (_) {} }
    if (!committed && spec.onCancel) spec.onCancel(g, how);
    if (spec.onEnd) spec.onEnd(g, committed, how);
    if (g.ownsResizing) {
      cl.remove('pm-resizing');
      try { if (typeof window.PM_DRAGEND === 'function') window.PM_DRAGEND(); } catch (_) {}
    }
    render.flushResizes(true);
    suppressClick();
  }
  g.end = end;
  attach();
  return g;
};
gesture.cancel = function () { if (gesture.active) gesture.active.end('cancel'); };

/* ---- the landing preview: one kept element in the overlay that glides between targets ---- */
var previewEl = null, previewLabel = null, previewRect = null, previewAnim = null;
function ensurePreview() {
  if (previewEl) return previewEl;
  previewEl = h('div', { class: 'pmw-landing', 'aria-hidden': 'true', hidden: true }, [previewLabel = h('span', { class: 'pmw-landing-label' })]);
  overlay().appendChild(previewEl);
  return previewEl;
}
var preview = PMW.preview = {};
preview.show = function (rect, label, kind) {
  var el = ensurePreview();
  setText(previewLabel, label || '');
  setAttr(el, 'data-kind', kind || null);
  setAttr(previewLabel, 'hidden', !label);
  var first = el.hidden;
  var from = previewRect;
  if (previewAnim) {
    try {
      var cur = el.getBoundingClientRect();
      from = { x: cur.left, y: cur.top, w: cur.width, h: cur.height };
      previewAnim.cancel();
    } catch (_) {}
    previewAnim = null;
  }
  el.hidden = false;
  el.style.left = rect.x + 'px'; el.style.top = rect.y + 'px'; el.style.width = rect.w + 'px'; el.style.height = rect.h + 'px';
  previewRect = rect;
  if (first) {
    previewAnim = motion.animate(el, [{ opacity: 0 }, { opacity: 1 }], { dur: 140, easing: motion.ease('out') });
    return;
  }
  if (!from) return;
  var sx = from.w / (rect.w || 1), sy = from.h / (rect.h || 1);
  previewAnim = motion.animate(el, [
    { transform: 'translate(' + (from.x - rect.x) + 'px,' + (from.y - rect.y) + 'px) scale(' + sx + ',' + sy + ')' },
    { transform: 'none' }
  ], { dur: 160, easing: motion.ease('out') });
  if (previewAnim) motion.animate(previewLabel, [{ transform: 'scale(' + (1 / sx) + ',' + (1 / sy) + ')' }, { transform: 'none' }], { dur: 160, easing: motion.ease('out') });
};
preview.hide = function () {
  if (!previewEl || previewEl.hidden) return;
  var el = previewEl;
  if (previewAnim) { try { previewAnim.cancel(); } catch (_) {} previewAnim = null; }
  var a = motion.animate(el, [{ opacity: 1 }, { opacity: 0 }], { dur: 140, easing: motion.ease('out') });
  previewRect = null;
  if (a) a.onfinish = function () { el.hidden = true; }; else el.hidden = true;
};
