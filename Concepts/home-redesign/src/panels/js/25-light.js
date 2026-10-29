/* The grab light on every resizer (Jared, 2026-10-13: "The glowing resize line is missing from most places ... That
   effect should also be polished more"; after the first version: "The resize glow look should be polished"). One
   light for the dividers between panels, the chat column's edge (#chatResizer), the rail's edge (#leftPanelResizer)
   and the browser's DevTools split, in five moments that each look draws its own way (css/56-light.css):
   - near: a pointer within reach of a bar raises a faint glint on it at the nearest point (the idle hint);
   - hover: after a beat the light gathers there and follows the pointer along the bar on a spring, stretching as it
     is swept;
   - grab: the light catches, and runs from the grab point out to both ends of the bar;
   - drag: the bar stays lit and answers its own speed (heat, and a wake on the side it is moving away from), and
     strains when the pointer pulls past a limit the bar cannot follow;
   - settle: on release the light drains back along the bar into the point it was let go at, and seats there.
   This module only feeds the CSS. Per bar it writes --gl-at (the light's place along the bar, px from its start,
   sprung), --gl-s and --gl-lag (stretch), --gl-near, --gl-heat, --gl-trail (how far the bar travelled lately, px as a
   plain number, signed toward its wake; --gl-wl and --gl-wr are its two sides), --gl-strain and --gl-push, --gl-g and
   --gl-r (grab and release points), --gl-tip-a and --gl-tip-b (the ends, from that point), --gl-len, --gl-thk and
   --gl-drain; and the classes pmw-gl-on (anything showing), pmw-gl-hover, pmw-gl-held, pmw-gl-moving, pmw-gl-still
   and pmw-settle. A look's motion constants are custom properties read once per engagement: --gl-k and --gl-z (spring
   stiffness and damping ratio; 0 stiffness steps), --gl-snap and --gl-snap-o (a grid the light steps along),
   --gl-trail-step, --gl-settle-ms, and --gl-dots, --gl-echo and --gl-ghost (Friendly's dot lens, the persistence
   copies across the bar, Retro's cell afterglow). The idle hint and the held bar's pointer ride the page's shared
   pointermove dispatcher (PM7_PMOVE, T07): no pointermove listener on document of its own. The grab never depends on
   the bar receiving its own pointerdown (see glGrab). A bar's axis is its aria-orientation (vertical unless it says
   horizontal); a horizontal bar's layer is the vertical one turned, so the CSS is written once, along y. Reduced
   Motion: no spring, stretch, heat, strain, wake or copies; the light sits where the pointer is and only fades. */

var light = PMW.light = {};
var GL_NEAR_PX = 36;      // the idle hint answers a pointer this close to a bar's centre line
var GL_HOVER_MS = 60;     // a pointer that only crosses a bar does not light it
var GL_TRAIL_MS = 70;     // the wake measures how far the bar moved over this long
var GL_STILL_MS = 700;    // a light held still this long may idle (Retro's cursor blinks)
var GL_REST_MS = 1400;    // a pointer resting near a bar this long lets the hint sink to a trace
var GL_DOTS = 15;         // Friendly: the dots shown around the pointer (odd)
var GL_ECHOES = 3;        // persistence copies (Retro phosphor, Friendly bubbles)
var GL_POP = '[role="menu"], [role="dialog"], [role="listbox"], .pmw-pop, .pmw-menu';
/* a pointer on another control is aimed at that control: no idle hint for a bar beside it. A panel's tabs sit within
   reach of the divider above them, so hovering a terminal tab woke Friendly's dot lens on that divider (2026-10-28
   review, astra R8). The bar's own hover is not the idle hint and is unaffected. */
var GL_CTRL = '.pmw-strip, button, a[href], input, select, textarea, [role="tab"], [role="button"]';
/* the class each drag owner puts on its bar while it is dragged: the shell's resizers and the chat column's
   (resizing), the panel dividers (pmw-active), the DevTools split (is-active) */
var GL_ACTIVE = ['resizing', 'pmw-active', 'is-active'];
var glBars = [];
var glLive = [];
var glRaf = 0, glLast = 0;
var glPtr = { x: 0, y: 0, target: null, on: false, dirty: false, buttons: 0, rest: false, restT: 0 };
var glHeld = null;        // the bar being dragged, if any
var glWired = false;
var glRectsAt = 0;

function glAxisV(el) { return el.getAttribute('aria-orientation') !== 'horizontal'; }
function glNum(cs, name, dflt) { var v = parseFloat(cs.getPropertyValue(name)); return isFinite(v) ? v : dflt; }
function glSet(s, name, value) {
  if (s.out[name] === value) return;
  s.out[name] = value;
  s.el.style.setProperty(name, value);
}
function glBusy() {
  var b = doc.body.classList;
  return b.contains('pmw-dragging') || b.contains('pmw-resizing') || b.contains('pm-resizing') || b.contains('pm-ab-dragging');
}

/* the light layer: one set of parts per bar; each look shows the ones it draws */
function glBuild(el) {
  var fx = h('i', { class: 'pmw-gl-fx', 'aria-hidden': 'true' });
  ['hint', 'wake', 'rail', 'pool', 'core', 'mark', 'ring', 'flash'].forEach(function (k) { fx.appendChild(h('i', { class: 'pmw-gl-' + k })); });
  fx.appendChild(h('i', { class: 'pmw-gl-tip', 'data-end': 'a' }));
  fx.appendChild(h('i', { class: 'pmw-gl-tip', 'data-end': 'b' }));
  el.appendChild(fx);
  return fx;
}
/* Friendly's dots and the persistence copies are made the first time a look asks for them */
function glParts(s, cls, n) {
  var have = s.parts[cls];
  if (have) return have;
  have = s.parts[cls] = [];
  var box = h('i', { class: 'pmw-gl-' + cls + 's' });
  for (var i = 0; i < n; i++) { var p = h('i', { class: 'pmw-gl-' + cls }); box.appendChild(p); have.push(p); }
  s.fx.appendChild(box);
  return have;
}

/* measure the bar and read the look's constants: once per engagement, and while held (the bar moves across) */
function glMeasure(s) {
  var r = s.el.getBoundingClientRect();
  s.v = glAxisV(s.el);
  s.rect = r;
  s.len = (s.v ? r.height : r.width) || 0;
  s.thk = (s.v ? r.width : r.height) || 0;
  glSet(s, '--gl-len', s.len.toFixed(1) + 'px');
  glSet(s, '--gl-thk', s.thk.toFixed(1) + 'px');
  return r;
}
function glEngage(s) {
  glMeasure(s);
  var cs = getComputedStyle(s.el);
  s.rm = PMW.reduced();
  s.k = glNum(cs, '--gl-k', 900);
  s.z = glNum(cs, '--gl-z', 1);
  s.snap = glNum(cs, '--gl-snap', 0);
  s.snapO = glNum(cs, '--gl-snap-o', 0);
  s.trailStep = glNum(cs, '--gl-trail-step', 0);
  s.settleMs = glNum(cs, '--gl-settle-ms', 760);
  s.dots = glNum(cs, '--gl-dots', 0) > 0 ? glParts(s, 'dot', GL_DOTS) : null;
  s.echo = glNum(cs, '--gl-echo', 0) > 0 ? glParts(s, 'echo', GL_ECHOES) : null;
  s.ghosts = glNum(cs, '--gl-ghost', 0) > 0 ? glParts(s, 'ghost', 4) : null;
  s.dotSp = glNum(cs, '--gl-dot-sp', 9);
  s.engaged = true;
}
function glSnap(s, t) {
  if (!(s.snap > 0) || s.rm) return t;
  return clamp(s.snapO + Math.round((t - s.snapO) / s.snap) * s.snap, 0, s.len);
}
function glAlong(s, x, y) {
  var r = s.rect;
  var raw = s.v ? y - r.top : x - r.left;
  return clamp(raw, 0, s.len);
}
function glLit(s) {
  if (!s.el.classList.contains('pmw-gl-on')) s.el.classList.add('pmw-gl-on');
  s.quiet = 0;
}
function glWake(s) {
  if (glLive.indexOf(s) < 0) glLive.push(s);
  if (!glRaf) { glLast = performance.now(); glRaf = requestAnimationFrame(glTick); }
}

function glActive(el) {
  for (var i = 0; i < GL_ACTIVE.length; i++) if (el.classList.contains(GL_ACTIVE[i])) return true;
  return false;
}
/* The grab and the release. A drag owner may keep the press from the bar (the chat column takes its resizer's
   pointerdown on window, in the capture phase, and stops it there), so the light never depends on the bar's own
   pointerdown: it is fed by a capture listener on window (stopPropagation there does not stop other listeners on
   window), by the bar's own events, and by the drag owner's active class on the bar (GL_ACTIVE). Each path is
   idempotent; whichever comes first grabs, and whichever comes first releases. */
function glGrab(s, x, y) {
  if (s.held) return;
  var el = s.el;
  clearTimeout(s.hoverT);
  glEngage(s);
  s.px = s.sx = x; s.py = s.sy = y;
  s.tAt = glSnap(s, glAlong(s, x, y));
  if (!s.hover && !s.near) { s.at = s.tAt; s.va = 0; }
  s.held = true; s.moving = false; s.hover = true;
  s.hist = [];
  glHeld = s;
  glSet(s, '--gl-g', s.tAt.toFixed(1) + 'px');
  glSet(s, '--gl-tip-a', (-s.tAt).toFixed(1) + 'px');
  glSet(s, '--gl-tip-b', (s.len - s.tAt).toFixed(1) + 'px');
  clearTimeout(s.settleT);
  el.classList.remove('pmw-settle', 'pmw-gl-still');
  glLit(s);
  el.classList.add('pmw-gl-hover', 'pmw-gl-held');
  glWake(s);
}
/* the pointer while it is over a bar or holding it (the bar's own pointermove, and the shared feed while held) */
function glPointer(s, x, y) {
  s.px = x; s.py = y;
  if (!s.engaged) glEngage(s);
  if (s.held && !s.moving && Math.abs(x - s.sx) + Math.abs(y - s.sy) > 2) {
    s.moving = true;
    s.el.classList.add('pmw-gl-moving');
  }
  var t = glSnap(s, glAlong(s, x, y));
  if (t !== s.tAt) {
    s.tAt = t;
    s.el.classList.remove('pmw-gl-still');
    clearTimeout(s.stillT);
    s.stillT = setTimeout(function () { if (s.hover || s.held) s.el.classList.add('pmw-gl-still'); }, GL_STILL_MS);
  }
  glWake(s);
}
function glRelease(s) {
  if (!s.held) return;
  var el = s.el;
  s.held = false;
  if (glHeld === s) glHeld = null;
  el.classList.remove('pmw-gl-held', 'pmw-gl-moving');
  if (s.moving) light.settle(el, s.at);
  s.moving = false;
  // the bar may have moved out from under the pointer (a limit, a collapse to the strip): only stay lit if it is there
  var r = glMeasure(s);
  var over = s.px >= r.left - 1 && s.px <= r.right + 1 && s.py >= r.top - 1 && s.py <= r.bottom + 1;
  if (!over) { s.hover = false; s.engaged = false; el.classList.remove('pmw-gl-hover'); }
  glWake(s);
}
/* window listeners, once: the press and the end of it, in the capture phase */
function glWire() {
  if (glWired) return;
  glWired = true;
  window.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    var bar = e.target && e.target.closest ? e.target.closest('.pmw-gl') : null;
    if (bar && bar._gl) glGrab(bar._gl, e.clientX, e.clientY);
  }, true);
  function end() { if (glHeld) glRelease(glHeld); }
  window.addEventListener('pointerup', end, true);
  window.addEventListener('pointercancel', end, true);
  window.addEventListener('blur', end);
}

/* bind(el): once per bar; idempotent */
light.bind = function (el) {
  if (!el || el._gl) return;
  var s = el._gl = {
    el: el, fx: null, out: {}, parts: {}, v: true, rect: null, len: 0, thk: 0,
    at: 0, tAt: 0, va: 0, near: 0, nearT: 0, heat: 0, trail: 0, strain: 0, push: 0,
    hover: false, held: false, moving: false, settling: false, engaged: false, quiet: 0,
    hist: [], px: 0, py: 0, sx: 0, sy: 0, hoverT: 0, stillT: 0, settleT: 0, cell: null, ghostI: 0
  };
  el.classList.add('pmw-gl');
  s.fx = glBuild(el);
  glBars.push(s);
  glWire();
  // the drag owner's active class: grabs when it appears (if no press was seen) and releases when it goes
  s.active = glActive(el);
  try {
    new MutationObserver(function () {
      var now = glActive(el);
      if (now === s.active) return;
      s.active = now;
      if (now) glGrab(s, glPtr.on ? glPtr.x : s.px, glPtr.on ? glPtr.y : s.py);
      else glRelease(s);
    }).observe(el, { attributes: true, attributeFilter: ['class'] });
  } catch (_) {}

  el.addEventListener('pointerenter', function (e) {
    if (e.pointerType === 'touch' || (glBusy() && !s.held)) return;
    clearTimeout(s.hoverT);
    glEngage(s);
    s.tAt = glSnap(s, glAlong(s, e.clientX, e.clientY));
    if (!s.near && !s.hover) { s.at = s.tAt; s.va = 0; }
    glLit(s);
    glWake(s);
    s.hoverT = setTimeout(function () {
      if (glBusy() && !s.held) return;
      s.hover = true;
      el.classList.add('pmw-gl-hover');
      glWake(s);
    }, GL_HOVER_MS);
  });
  el.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    glPointer(s, e.clientX, e.clientY);
  });
  el.addEventListener('pointerleave', function () {
    clearTimeout(s.hoverT);
    if (s.held) return;
    s.hover = false;
    s.engaged = false;
    el.classList.remove('pmw-gl-hover', 'pmw-gl-still');
    s.near = 0;
    glWake(s);
  });
  el.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    glGrab(s, e.clientX, e.clientY);
  });
  function release() { glRelease(s); }
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('lostpointercapture', release);
  el.addEventListener('focus', function () {
    if (s.held || s.hover) return;
    glEngage(s);
    s.at = s.tAt = glSnap(s, s.len / 2); s.va = 0;
    glSet(s, '--gl-at', s.at.toFixed(1) + 'px');
    glLit(s);
    glWake(s);
  });
  el.addEventListener('blur', function () { glWake(s); });
};

/* settle(el[, at]): the light drains back along the bar into the point and seats there (restarts if running) */
light.settle = function (el, at) {
  var s = el && el._gl;
  if (!s) return;
  if (!s.engaged || !s.len) glEngage(s);
  var r = at == null ? (s.hover || s.held ? s.at : glSnap(s, s.len / 2)) : at;
  if (at == null && !s.hover) { s.at = s.tAt = r; s.va = 0; glSet(s, '--gl-at', r.toFixed(1) + 'px'); }
  var far = Math.max(r, s.len - r);
  glSet(s, '--gl-r', r.toFixed(1) + 'px');
  glSet(s, '--gl-tip-a', (-r).toFixed(1) + 'px');
  glSet(s, '--gl-tip-b', (s.len - r).toFixed(1) + 'px');
  glSet(s, '--gl-drain', Math.round(clamp(200 + far * 0.28, 260, 520)) + 'ms');
  clearTimeout(s.settleT);
  el.classList.remove('pmw-settle');
  void el.offsetWidth;
  el.classList.add('pmw-settle');
  s.settling = true;
  glLit(s);
  s.settleT = setTimeout(function () { el.classList.remove('pmw-settle'); s.settling = false; glWake(s); }, s.settleMs || 760);
  glWake(s);
};

/* the idle hint: the shared pointermove dispatcher (PM7 T07) feeds it; the nearest bar within reach answers */
function glProbe(e) {
  if (e.pointerType === 'touch') return;
  glPtr.x = e.clientX; glPtr.y = e.clientY; glPtr.target = e.target; glPtr.buttons = e.buttons; glPtr.on = true;
  if (glHeld) glPointer(glHeld, e.clientX, e.clientY);
  glPtr.dirty = true; glPtr.rest = false;
  clearTimeout(glPtr.restT);
  glPtr.restT = setTimeout(function () {
    glPtr.rest = true; glPtr.dirty = true;
    if (!glRaf) { glLast = performance.now(); glRaf = requestAnimationFrame(glTick); }
  }, GL_REST_MS);
  if (!glRaf) { glLast = performance.now(); glRaf = requestAnimationFrame(glTick); }
}
function glNearPass(now) {
  glPtr.dirty = false;
  var allow = glPtr.on && !glPtr.buttons && !glBusy() && !doc.hidden;
  var t = glPtr.target;
  if (allow && t && t.closest && (t.closest(GL_POP) || t.closest(GL_CTRL))) allow = false;
  var fresh = now - glRectsAt > 150;
  if (fresh) glRectsAt = now;
  var best = null, bestD = GL_NEAR_PX;
  for (var i = glBars.length - 1; i >= 0; i--) {
    var s = glBars[i];
    if (!s.el.isConnected) { glBars.splice(i, 1); continue; }
    s.nearT = 0;
    if (!allow || s.hover || s.held) continue;
    if (fresh || !s.nrect) { s.nrect = s.el.getBoundingClientRect(); s.nv = glAxisV(s.el); }
    var r = s.nrect;
    if (!r.width || !r.height) continue;
    var across = s.nv ? Math.abs(glPtr.x - (r.left + r.width / 2)) : Math.abs(glPtr.y - (r.top + r.height / 2));
    var along = s.nv ? glPtr.y : glPtr.x, lo = s.nv ? r.top : r.left, hi = s.nv ? r.bottom : r.right;
    if (across >= bestD || along < lo - 6 || along > hi + 6) continue;
    var parent = s.el.parentElement;
    if (!parent || !t || !parent.contains(t)) continue;
    best = s; bestD = across;
  }
  if (best) {
    var d = 1 - bestD / GL_NEAR_PX;
    best.nearT = d * d * (3 - 2 * d) * (glPtr.rest ? 0.3 : 1);
    if (!best.engaged || fresh) glEngage(best);
    var was = best.near > 0.01;
    best.tAt = glSnap(best, glAlong(best, glPtr.x, glPtr.y));
    if (!was) { best.at = best.tAt; best.va = 0; }
    glLit(best);
    glWake(best);
  }
  for (var j = 0; j < glBars.length; j++) if (glBars[j].near > 0 && glBars[j] !== best) glWake(glBars[j]);
}

function glHist(s, now, c) {
  var hs = s.hist;
  hs.push({ t: now, c: c });
  while (hs.length > 2 && now - hs[1].t > 240) hs.shift();
}
function glPast(s, now, ago) {
  var hs = s.hist, want = now - ago;
  if (!hs.length) return 0;
  for (var i = hs.length - 1; i > 0; i--) {
    if (hs[i - 1].t <= want) {
      var a = hs[i - 1], b = hs[i], f = b.t > a.t ? (want - a.t) / (b.t - a.t) : 1;
      return a.c + (b.c - a.c) * clamp(f, 0, 1);
    }
  }
  return hs[0].c;
}
function glEase(cur, target, dt, tauUp, tauDown) {
  var tau = target > cur ? tauUp : tauDown;
  return cur + (target - cur) * (1 - Math.exp(-dt / tau));
}

function glStep(s, now, dt) {
  var busy = false;
  /* Measure the held bar before any glSet write, and at most every 50 ms: measuring after writes forced a
     full style+layout inside every light tick, and during a resize drag the drag's own writes make every
     tick's measure force another one (seconds of forced layout over one rail drag). The wake's history
     interpolates between samples (glPast) and the strain is eased, so a 20 Hz measure cadence changes
     nothing visible; between measures the last rect stands. */
  var heldRect = null;
  if (s.held && !s.rm) {
    if (!s.rect || !s._measAt || now - s._measAt >= 50) { heldRect = glMeasure(s); s._measAt = now; }
    else heldRect = s.rect;
  }
  // along the bar: a spring (or a step, or straight to the pointer under Reduced Motion)
  if (s.rm || !(s.k > 0)) { s.at = s.tAt; s.va = 0; }
  else {
    var k = s.k, c = 2 * Math.sqrt(k) * s.z, n = Math.max(1, Math.ceil(dt / 0.004)), hh = dt / n;
    for (var i = 0; i < n; i++) { var acc = k * (s.tAt - s.at) - c * s.va; s.va += acc * hh; s.at += s.va * hh; }
    if (Math.abs(s.tAt - s.at) < 0.05 && Math.abs(s.va) < 2) { s.at = s.tAt; s.va = 0; } else busy = true;
  }
  var str = s.rm ? 1 : 1 + Math.min(0.9, Math.abs(s.va) / 1700);
  glSet(s, '--gl-at', s.at.toFixed(1) + 'px');
  glSet(s, '--gl-s', str.toFixed(3));
  glSet(s, '--gl-lag', (s.va > 0 ? -1 : 1) * ((str - 1) / 2).toFixed(3) + '');

  // the idle hint
  s.near = s.rm ? s.nearT : glEase(s.near, s.nearT, dt, 0.07, 0.16);
  if (s.near < 0.004 && s.nearT === 0) s.near = 0; else busy = true;
  // a stepped look (no spring) shows the hint in three steps
  glSet(s, '--gl-near', (s.k > 0 ? s.near : Math.round(s.near * 3) / 3).toFixed(3));

  // across the bar while held: its speed (heat and the wake) and a limit it is held at (strain)
  var trail = 0, strainT = 0, push = 0;
  if (s.held && !s.rm) {
    var r = heldRect || glMeasure(s);
    var cpos = s.v ? r.left + r.width / 2 : r.top + r.height / 2;
    glHist(s, now, cpos);
    var moved = cpos - glPast(s, now, GL_TRAIL_MS);
    trail = (s.v ? -moved : moved);
    var off = (s.v ? s.px : s.py) - cpos;
    if (s.moving && Math.abs(off) > 9) { strainT = clamp((Math.abs(off) - 9) / 90, 0, 1); push = (s.v ? off : -off) > 0 ? 1 : -1; }
    busy = true;
  } else if (s.hist.length && !s.rm) {
    // after release the copies and the wake fall back onto the bar
    var nowC = s.hist[s.hist.length - 1].c;
    glHist(s, now, nowC);
    trail = s.v ? -(nowC - glPast(s, now, GL_TRAIL_MS)) : (nowC - glPast(s, now, GL_TRAIL_MS));
    if (now - s.hist[0].t > 260 && Math.abs(trail) < 0.2) s.hist = []; else busy = true;
  }
  if (s.trailStep > 0) trail = Math.round(trail / s.trailStep) * s.trailStep;
  s.trail = Math.abs(trail - s.trail) < 0.05 ? trail : glEase(s.trail, trail, dt, 0.03, 0.05);
  s.heat = glEase(s.heat, clamp(Math.abs(trail) / 34, 0, 1), dt, 0.04, 0.22);
  s.strain = glEase(s.strain, strainT, dt, 0.06, 0.12);
  if (push) s.push = push;
  if (s.heat < 0.003 && !s.held) s.heat = 0; else busy = true;
  if (s.strain < 0.003 && !strainT) s.strain = 0; else busy = true;
  glSet(s, '--gl-trail', s.trail.toFixed(1));
  glSet(s, '--gl-wl', Math.max(0, -s.trail).toFixed(1));
  glSet(s, '--gl-wr', Math.max(0, s.trail).toFixed(1));
  glSet(s, '--gl-heat', s.heat.toFixed(3));
  glSet(s, '--gl-strain', s.strain.toFixed(3));
  glSet(s, '--gl-push', (s.push * s.strain).toFixed(3));

  if (s.dots) glDots(s);
  if (s.echo) glEchoes(s, now);
  if (s.ghosts) glGhosts(s);

  var lit = s.hover || s.held || s.settling || s.near > 0 || s.el === doc.activeElement;
  if (lit) s.quiet = 0;
  else {
    if (!s.quiet) s.quiet = now;
    if (now - s.quiet > 460) { s.el.classList.remove('pmw-gl-on'); s.engaged = false; }
    else busy = true;
  }
  return busy || s.hover || s.held || s.settling;
}

/* Friendly: a column of dots on the bar's grid that swell where the light is (a lens passing over a dot pattern) */
function glDots(s) {
  var sp = s.dotSp, base = Math.round(s.at / sp), half = (GL_DOTS - 1) / 2, sigma = 20 + 10 * s.heat;
  for (var i = 0; i < GL_DOTS; i++) {
    var y = (base - half + i) * sp;
    var d = (y - s.at) / sigma, m = Math.exp(-d * d);
    var p = s.dots[i];
    var key = y.toFixed(1) + '|' + m.toFixed(3);
    if (p._k === key) continue;
    p._k = key;
    p.style.translate = '-50% ' + (y - 5).toFixed(1) + 'px';
    p.style.setProperty('--m', m.toFixed(3));
    p.style.visibility = y < 2 || y > s.len - 2 ? 'hidden' : '';
  }
}
/* persistence copies across the bar: where it was 45, 90 and 135 ms ago (Retro's phosphor, Friendly's bubbles) */
function glEchoes(s, now) {
  for (var i = 0; i < GL_ECHOES; i++) {
    var p = s.echo[i], off = 0;
    if (s.hist.length > 1 && !s.rm) {
      var cur = s.hist[s.hist.length - 1].c, then = glPast(s, now, 45 * (i + 1));
      off = s.v ? then - cur : cur - then;
    }
    var key = off.toFixed(1);
    if (p._k === key) continue;
    p._k = key;
    p.style.setProperty('--gl-eo', key);
    p.style.setProperty('--gl-ea', clamp(Math.abs(off) / 4, 0, 1).toFixed(2));
  }
}
/* Retro's hover cursor steps cell to cell and leaves the cell it left glowing a moment (phosphor persistence) */
function glGhosts(s) {
  if (s.cell === s.at) return;
  var was = s.cell;
  s.cell = s.at;
  if (was == null || s.rm || !(s.hover || s.near > 0.2)) return;
  var g = s.ghosts[s.ghostI = (s.ghostI + 1) % s.ghosts.length];
  g.style.translate = '-50% calc(' + was.toFixed(1) + 'px - 50%)';
  if (g._a) g._a.cancel();
  try { g._a = g.animate([{ opacity: 0.62 }, { opacity: 0.3, offset: 0.4 }, { opacity: 0 }], { duration: 420, easing: 'steps(6, end)' }); } catch (_) {}
}

function glTick(now) {
  var dt = clamp((now - glLast) / 1000, 0.001, 0.034);
  glLast = now;
  glRaf = 0;
  if (glPtr.dirty) glNearPass(now);
  var keep = [];
  for (var i = 0; i < glLive.length; i++) {
    var s = glLive[i];
    if (!s.el.isConnected) continue;
    if (glStep(s, now, dt)) keep.push(s);
  }
  glLive = keep;
  if (glLive.length || glPtr.dirty) glRaf = requestAnimationFrame(glTick);
}

/* the shell's two resizers, once the page is there; and the idle hint's feed */
light.bindShell = function () {
  ['chatResizer', 'leftPanelResizer'].forEach(function (id) { light.bind(doc.getElementById(id)); });
  if (!light._probe) {
    light._probe = true;
    window.PM7_PMOVE = window.PM7_PMOVE || [];
    window.PM7_PMOVE.push(glProbe);
    doc.addEventListener('pointerout', function (e) {
      if (e.relatedTarget) return;
      glPtr.on = false; glPtr.dirty = true;
      if (!glRaf) { glLast = performance.now(); glRaf = requestAnimationFrame(glTick); }
    });
    window.addEventListener('blur', function () { glPtr.on = false; glPtr.dirty = true; });
  }
};
