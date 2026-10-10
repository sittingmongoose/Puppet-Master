/* The fused active-tab silhouette (EDSHAPE, D5), one plate per strip. Ported from PMConcept7's EDSHAPE module
   (pm6-js-dashboard, window.PM6_EDTAB_SHAPE): the same contact model, the same path builder (the "arc" profile, verbatim
   from edShapePath), the same critically damped spring (STIFF 520, DAMP 46) now integrated with real dt and two
   substeps (PM6_LIQUID_INK's integrator), the same Glass liquid stretch. Two new profiles share its signature: Retro's
   "stepped" corners quantised to 2 px, and NieR's "chamfer" (45 degree cuts, a straight foot).
   Rules kept from Jared's waves (PMConcept7-NOTES revs 13-21): the tab and the canvas are one surface (the plate
   overlaps the body by 1 px); the silhouette is the only active marker; contact is measured per side against layout
   geometry (symmetric); a selection change always springs, a layout snap never kills an in-flight spring whose target
   did not move; during a drag the plate follows 1:1 in the same frame; Retro and NieR snap; under Reduced Motion
   everything snaps. Contact here is measured to the neighbour's content (its box inset by CONTACT_INSET), so the
   shoulders show between tabs separated by the strip's gap (the agreed mock); MORPH stays 20 px. */

var shape = PMW.shape = {};
var MORPH = 20, STIFF = 520, DAMP = 46, CONTACT_INSET = 8;
var LIQUID_V_REF = 280, LIQUID_DIST_REF = 70, LIQUID_STRETCH_MAX = 0.20, LIQUID_JIGGLE_MS = 300, LIQUID_JIGGLE_AMP = 0.08,
  LIQUID_BLEND_MS = 70, LIQUID_MIN_TRAVEL = 28;
var K = 0.5523;

function smoothstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function n2(v) { return Math.round(v * 100) / 100; }

/* per-look geometry from CSS tokens on the strip (read on sync, never per frame) */
function geoOf(host, s) {
  if (s.geo) return s.geo;
  var cs = getComputedStyle(host);
  var plate = s.plate;
  var g = {
    crownR: parseFloat(cs.getPropertyValue('--pmw-tab-crown')) || 13,
    shMax: parseFloat(cs.getPropertyValue('--pmw-tab-shoulder')) || 14,
    flare: parseFloat(cs.getPropertyValue('--pmw-tab-flare')) || 22,
    h: plate.offsetHeight || 33,
    profile: (cs.getPropertyValue('--pmw-tab-profile') || 'arc').trim() || 'arc'
  };
  s.geo = g;
  return g;
}

/* the arc profile: edShapePath, verbatim */
function arcPath(g, w, lp, rp, distort) {
  var T = g.flare;
  var H = g.h;
  var crown = Math.min(g.crownR, w / 2);
  var stretch = distort && distort.stretch ? distort.stretch : 0;
  var lead = distort && distort.lead ? distort.lead : 0;
  var crownPulse = distort && distort.crownPulse ? distort.crownPulse : 0;
  if (crownPulse) {
    crown = Math.max(2, crown * (1 + crownPulse));
    H = Math.max(crown + 4, H * (1 - Math.abs(crownPulse) * 0.55));
  }
  var maxFl = Math.min(g.shMax, T, H - crown - 1);
  var flL = maxFl * lp, flR = maxFl * rp;
  if (stretch > 0.001 && lead) {
    if (lead > 0) { flR = Math.min(maxFl * 1.55, flR * (1 + stretch * 2.6)); flL = flL * (1 - stretch * 0.55); }
    else { flL = Math.min(maxFl * 1.55, flL * (1 + stretch * 2.6)); flR = flR * (1 - stretch * 0.55); }
  }
  var L = T, R = T + w;
  var kL = K + 0.25 * lp, kR = K + 0.25 * rp;
  var p = 'M ' + n2(L - flL) + ' ' + n2(H);
  if (flL >= 0.1) p += ' C ' + n2(L - flL + K * flL) + ' ' + n2(H) + ' ' + n2(L) + ' ' + n2(H - flL + K * flL) + ' ' + n2(L) + ' ' + n2(H - flL);
  p += ' L ' + n2(L) + ' ' + n2(crown);
  p += ' C ' + n2(L) + ' ' + n2(crown - kL * crown) + ' ' + n2(L + crown - kL * crown) + ' 0 ' + n2(L + crown) + ' 0';
  p += ' L ' + n2(R - crown) + ' 0';
  p += ' C ' + n2(R - crown + kR * crown) + ' 0 ' + n2(R) + ' ' + n2(crown - kR * crown) + ' ' + n2(R) + ' ' + n2(crown);
  p += ' L ' + n2(R) + ' ' + n2(H - flR);
  if (flR >= 0.1) p += ' C ' + n2(R) + ' ' + n2(H - flR + K * flR) + ' ' + n2(R + flR - K * flR) + ' ' + n2(H) + ' ' + n2(R + flR) + ' ' + n2(H);
  return p + ' Z';
}

/* Retro: the same topology with 2 px stair corners (three steps per corner) and stepped flares */
function q2(v) { return Math.round(v / 2) * 2; }
function steppedPath(g, w, lp, rp) {
  var T = g.flare, H = g.h, L = T, R = T + w;
  var c = q2(Math.min(g.crownR, w / 2));
  var maxFl = Math.min(g.shMax, T, H - c - 1);
  var fL = q2(maxFl * lp), fR = q2(maxFl * rp);
  var a = q2(c / 3) || 2, b = q2(c * 2 / 3) || 2;
  var p = 'M ' + (L - fL) + ' ' + H;
  if (fL >= 2) { var hl = q2(fL / 2); p += ' L ' + (L - hl) + ' ' + H + ' L ' + (L - hl) + ' ' + (H - hl) + ' L ' + L + ' ' + (H - hl) + ' L ' + L + ' ' + (H - fL); }
  p += ' L ' + L + ' ' + c + ' L ' + (L + a) + ' ' + c + ' L ' + (L + a) + ' ' + b + ' L ' + (L + b) + ' ' + b + ' L ' + (L + b) + ' ' + a + ' L ' + (L + c) + ' ' + a + ' L ' + (L + c) + ' 0';
  p += ' L ' + (R - c) + ' 0 L ' + (R - c) + ' ' + a + ' L ' + (R - b) + ' ' + a + ' L ' + (R - b) + ' ' + b + ' L ' + (R - a) + ' ' + b + ' L ' + (R - a) + ' ' + c + ' L ' + R + ' ' + c;
  p += ' L ' + R + ' ' + (H - fR);
  if (fR >= 2) { var hr = q2(fR / 2); p += ' L ' + R + ' ' + (H - hr) + ' L ' + (R + hr) + ' ' + (H - hr) + ' L ' + (R + hr) + ' ' + H + ' L ' + (R + fR) + ' ' + H; }
  return p + ' Z';
}
/* NieR: an ink block with 45 degree cuts at the top corners and a straight foot (no flare) */
function chamferPath(g, w) {
  var T = g.flare, H = g.h, L = T, R = T + w, c = Math.min(g.crownR, w / 4);
  return 'M ' + L + ' ' + H + ' L ' + L + ' ' + n2(c) + ' L ' + n2(L + c) + ' 0 L ' + n2(R - c) + ' 0 L ' + R + ' ' + n2(c) + ' L ' + R + ' ' + H + ' Z';
}
function pathFor(g, w, lp, rp, distort) {
  if (g.profile === 'stepped') return steppedPath(g, w, lp, rp);
  if (g.profile === 'chamfer') return chamferPath(g, w);
  return arcPath(g, w, lp, rp, distort);
}
shape.pathFor = pathFor;

/* the contact model: the painted active tab vs. its neighbours' layout edges, inset to their content */
function target(host, s) {
  var p = model.panel(state.layout, s.panelId);
  if (!p || !p.active) return null;
  var active = s.tabEls[p.active];
  if (!active || active.hidden || !active.offsetWidth) return null;
  var hr = host.getBoundingClientRect();
  var ar = active.getBoundingClientRect();
  if (!ar.width) return null;
  var boxRight = host.clientWidth;
  var prevEdge = -1e4, nextEdge = 1e4;
  var seen = false;
  var tabs = s.list.querySelectorAll('.pmw-tab');
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    if (t === active) { seen = true; continue; }
    if (t.hidden || !t.offsetWidth) continue;
    var left = layoutLeft(t, host), right = left + t.offsetWidth;
    if (!seen) prevEdge = Math.max(prevEdge, right - CONTACT_INSET);
    else { nextEdge = Math.min(nextEdge, left + CONTACT_INSET); break; }
  }
  // strip edges and the controls after the last tab count as contact too (their own content edge)
  if (prevEdge < -1e3) prevEdge = 0;
  if (nextEdge > 1e3) {
    var ctl = s.more.hidden ? s.plus : s.more;
    nextEdge = ctl && ctl.offsetWidth ? layoutLeft(ctl, host) + CONTACT_INSET : boxRight;
  }
  return { x: ar.left - hr.left, w: ar.width, prevEdge: prevEdge, nextEdge: nextEdge, boxRight: boxRight };
}
/* transform-free left of an element inside the strip host */
function layoutLeft(el, host) {
  var x = 0, e = el;
  while (e && e !== host) { x += e.offsetLeft; e = e.offsetParent; if (e === host) break; }
  return x;
}

function paint(host, s, x, w, track, distort) {
  if (!(w > 0)) return;
  var g = geoOf(host, s);
  var lp = clamp(Math.max(0, x - track.prevEdge) / MORPH, 0, 1);
  var rp = clamp(Math.max(0, track.nextEdge - (x + w)) / MORPH, 0, 1);
  var paintW = w, paintX = x;
  if (distort && distort.stretch > 0.001) {
    var inflate = w * distort.stretch * 0.7;
    paintW = w + inflate;
    paintX = distort.lead > 0 ? x - inflate * 0.15 : distort.lead < 0 ? x - inflate * 0.85 : x - inflate * 0.5;
  }
  var el = s.plate;
  el.style.left = (paintX - g.flare).toFixed(2) + 'px';
  el.style.width = (paintW + 2 * g.flare).toFixed(2) + 'px';
  el.style.clipPath = 'path("' + pathFor(g, paintW, lp, rp, distort) + '")';
  el.style.setProperty('--pmw-plate-x', paintX.toFixed(1) + 'px');
  if (distort && (distort.scaleX || distort.scaleY)) {
    el.style.transformOrigin = (distort.lead > 0 ? '12%' : distort.lead < 0 ? '88%' : '50%') + ' 100%';
    el.style.transform = 'scale(' + (distort.scaleX || 1).toFixed(4) + ',' + (distort.scaleY || 1).toFixed(4) + ')';
  } else if (el.style.transform) el.style.transform = '';
  el.hidden = false;
}

function liquidDistort(s, mode) {
  var dist = Math.abs(s.tx - s.x);
  var lead = s.vx > 0.5 ? 1 : s.vx < -0.5 ? -1 : 0;
  if (mode === 'fly') {
    var st = Math.max(smoothstep(Math.min(1, Math.abs(s.vx) / LIQUID_V_REF)) * LIQUID_STRETCH_MAX,
      smoothstep(Math.min(1, dist / LIQUID_DIST_REF)) * LIQUID_STRETCH_MAX * 0.85);
    s.lastStretch = st;
    return { stretch: st, lead: lead, scaleX: 1 + st * 0.55, scaleY: 1 - st * 0.28, crownPulse: st * 0.06 };
  }
  var u = 1 - s.jiggleT / LIQUID_JIGGLE_MS;
  var pulse = LIQUID_JIGGLE_AMP * Math.exp(-3.6 * u) * Math.sin(2 * Math.PI * u);
  var jig = { crownPulse: pulse, scaleX: 1 + pulse * 0.7, scaleY: 1 - pulse * 0.85, lead: 0, stretch: 0 };
  if (mode === 'blend') {
    var k = smoothstep(1 - s.blendT / LIQUID_BLEND_MS);
    var st2 = (s.lastStretch || 0) * (1 - k);
    return { stretch: st2, lead: lead, scaleX: 1 + st2 * 0.55 + (jig.scaleX - 1) * k, scaleY: 1 - st2 * 0.28 + (jig.scaleY - 1) * k, crownPulse: st2 * 0.06 + pulse * k };
  }
  return jig;
}

function stOf(host) {
  var s = host._pmw;
  if (!s.sh) s.sh = { x: null, w: null, vx: 0, vw: 0, tx: 0, tw: 0, raf: 0, last: 0, track: null, lastActive: undefined,
    jiggleT: 0, blendT: 0, hopArmed: false, travelAccum: 0, origin: null, lastStretch: 0 };
  return s.sh;
}
function glassLiquid() { var lk = look(); return lk.family === 'glass' && !lk.nier && !reducedMotion(); }
function snapsLook() { var lk = look(); return lk.family === 'retro' || lk.nier; }

function step(host, now) {
  var s = host._pmw, sh = stOf(host);
  sh.raf = 0;
  if (!host.isConnected) return;
  var dtTotal = sh.last ? Math.min((now - sh.last) / 1000, 1 / 30) : 1 / 60;
  sh.last = now;
  var dragging = !!s.dragging;
  if (dragging) { sh.jiggleT = 0; sh.blendT = 0; sh.hopArmed = false; sh.travelAccum = 0; sh.lastStretch = 0; }
  for (var sub = 0; sub < 2; sub++) {
    var dt = dtTotal / 2;
    var ax = -STIFF * (sh.x - sh.tx) - DAMP * sh.vx;
    var aw = -STIFF * (sh.w - sh.tw) - DAMP * sh.vw;
    sh.vx += ax * dt; sh.x += sh.vx * dt;
    sh.vw += aw * dt; sh.w += sh.vw * dt;
  }
  var liquid = glassLiquid() && !dragging;
  if (liquid) {
    var origin = sh.origin != null ? sh.origin : sh.x;
    sh.travelAccum = Math.max(sh.travelAccum || 0, Math.abs(sh.tx - origin));
    if (sh.travelAccum >= LIQUID_MIN_TRAVEL) sh.hopArmed = true;
  }
  var nearRest = Math.abs(sh.x - sh.tx) < 2.5 && Math.abs(sh.vx) < 40 && Math.abs(sh.w - sh.tw) < 2.5 && Math.abs(sh.vw) < 40;
  var done = Math.abs(sh.x - sh.tx) < 0.3 && Math.abs(sh.vx) < 2 && Math.abs(sh.w - sh.tw) < 0.3 && Math.abs(sh.vw) < 2;
  if (done) { sh.x = sh.tx; sh.w = sh.tw; sh.vx = 0; sh.vw = 0; }
  var ms = dtTotal * 1000;
  if (liquid && nearRest && sh.jiggleT <= 0 && sh.blendT <= 0 && sh.hopArmed) { sh.blendT = LIQUID_BLEND_MS; sh.jiggleT = LIQUID_JIGGLE_MS; sh.hopArmed = false; }
  if (sh.blendT > 0) sh.blendT = Math.max(0, sh.blendT - ms);
  if (sh.jiggleT > 0) { sh.jiggleT = Math.max(0, sh.jiggleT - ms); if (sh.jiggleT <= 0) sh.lastStretch = 0; }
  var distort = null;
  if (liquid) {
    if (sh.blendT > 0) distort = liquidDistort(sh, 'blend');
    else if (!done && !nearRest) distort = liquidDistort(sh, 'fly');
    else if (sh.jiggleT > 0) distort = liquidDistort(sh, 'jiggle');
    else if (!done) distort = liquidDistort(sh, 'fly');
  }
  paint(host, s, sh.x, sh.w, sh.track, distort);
  if (!done || sh.jiggleT > 0 || sh.blendT > 0) sh.raf = requestAnimationFrame(function (t) { step(host, t); });
}

/* sync(host, panel, layout, { reason }): reason 'select' springs; 'drag' and 'layout' snap */
shape.sync = function (host, p, l, opts) {
  var s = host._pmw;
  if (!s) return;
  if (opts && opts.reasonGeo) s.geo = null;
  var t = target(host, s);
  if (!t) { s.plate.hidden = true; return; }
  var sh = stOf(host);
  var key = p.active;
  var selectionChanged = sh.lastActive !== undefined && sh.lastActive !== key;
  sh.lastActive = key;
  var animate = selectionChanged || (opts && opts.reason === 'select');
  if (s.dragging) animate = false;
  if (snapsLook() || reducedMotion()) animate = false;
  var track = { prevEdge: t.prevEdge, nextEdge: t.nextEdge };
  var inFlight = !!sh.raf;
  var prevTx = sh.tx, prevTw = sh.tw;
  sh.tx = t.x; sh.tw = t.w; sh.track = track;
  if (!animate || sh.x === null) {
    if (inFlight && !reducedMotion() && sh.x !== null && !s.dragging && Math.abs(prevTx - t.x) < 0.5 && Math.abs(prevTw - t.w) < 0.5) return;
    if (sh.raf) { cancelAnimationFrame(sh.raf); sh.raf = 0; }
    sh.x = t.x; sh.w = t.w; sh.vx = 0; sh.vw = 0; sh.jiggleT = 0; sh.blendT = 0; sh.lastStretch = 0;
    paint(host, s, sh.x, sh.w, track, null);
    return;
  }
  if (selectionChanged || sh.origin == null) { sh.origin = sh.x; sh.travelAccum = 0; sh.hopArmed = false; sh.blendT = 0; sh.jiggleT = 0; }
  if (!sh.raf) { sh.last = 0; sh.raf = requestAnimationFrame(function (now) { step(host, now); }); }
};
/* a frame-exact snap (drag follow, settle ride) */
shape.snap = function (host) {
  var s = host._pmw;
  var p = s && model.panel(state.layout, s.panelId);
  if (p) shape.sync(host, p, state.layout, { reason: 'drag' });
};
bus.on('look', function () {
  qsa('.pmw-strip').forEach(function (host) { if (host._pmw) { host._pmw.geo = null; if (host._pmw.sh) host._pmw.sh.lastActive = undefined; } });
  render.schedule({ animate: false });
});
