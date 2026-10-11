/* Puppet Master terminal: the cursor trail (T.FXTrail), D16 and research item 23 (kitty cursor_trail semantics).
   T.FXTrail.create(overlayCanvas) -> trail
     trail.jump(fromRect, toRect, color, style, nowMs) -> bool   call on EVERY cursor move; rects are the cursor's cell
              in CSS px ({x, y, w, h}). It fires only when the move is more than 2 cells on either axis and the cursor
              had rested at least 60 ms before it (kitty: cursor_trail, cursor_trail_start_threshold). Returns true when
              a trail started. color: '#rrggbb', '#rgb', 'rgb(r, g, b)' or a 0xRRGGBB number.
     trail.frame(nowMs) -> bool   draws the current frame; true while a trail is still moving, false once it has
              finished and its pixels are cleared (then the caller may stop its frame loop).
     trail.changed -> bool        true when the last frame() drew or cleared pixels: pass it as the trail layer's
              `changed` flag to T.FXGL.render, so an idle trail is not re-uploaded (and does not keep burn-in awake).
     trail.clear()                drops the trail and clears what it drew.
     trail.blend -> 'add' | 'over'  how to composite the overlay: glow and phosphor are light, so they add (the WebGL
              path passes { canvas, blend: 'add' } to T.FXGL; the CSS path uses mix-blend-mode: screen in dark looks).
   Styles (per look): 'soft' Friendly, a short soft smear, 120 ms; 'glow' Glass, a luminous smear, 160 ms; 'phosphor'
   Retro, a smear whose light decays linearly like burn-in, 200 ms; 'trace' NieR, a thin straight ink line, 140 ms, no
   glow; 'off' Basic. The caller turns the trail off under Reduced Motion (style 'off' or simply no jump() calls).
   Shape: the four corners of the cursor cell travel from the old cell to the new one; the corners that lead the
   motion arrive in 12 % of the duration (so the smear is attached to the cursor from the first frame or two), the
   trailing ones take all of it (kitty: fast and slow decay), so the quad between them stretches back along the path
   and collapses onto the new cell. */
(function () {
  'use strict';

  var THRESHOLD_CELLS = 2;    // fire only on moves of MORE than this many cells (either axis)
  var REST_MS = 60;           // the cursor must have stayed put at least this long before the move
  var LEAD = 0.12;            // leading corners finish in this fraction of the duration (one or two frames)
  var STYLES = {
    soft: { ms: 120, blend: 'over' },
    glow: { ms: 160, blend: 'add' },
    phosphor: { ms: 200, blend: 'add' },
    trace: { ms: 140, blend: 'over' },
    off: null
  };

  function parseColor(c) {
    if (typeof c === 'number') return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    var s = String(c || '').trim(), m;
    if ((m = /^#([0-9a-f]{3})$/i.exec(s))) return [17 * parseInt(m[1][0], 16), 17 * parseInt(m[1][1], 16), 17 * parseInt(m[1][2], 16)];
    if ((m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s))) { var n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    if ((m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s))) return [+m[1] | 0, +m[2] | 0, +m[3] | 0];
    return [200, 200, 200];
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a < 0 ? 0 : a > 1 ? 1 : +a.toFixed(4)) + ')'; }
  function easeOut(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; var u = 1 - t; return 1 - u * u * u; }
  function corners(r) { return [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]; }

  /* the trigger rule, pure (tests and the policy module use it too) */
  function shouldFire(fromRect, toRect, restedMs) {
    if (!fromRect || !toRect) return false;
    var cw = toRect.w > 0 ? toRect.w : 1, ch = toRect.h > 0 ? toRect.h : 1;
    var dx = Math.abs(toRect.x - fromRect.x) / cw, dy = Math.abs(toRect.y - fromRect.y) / ch;
    return (dx > THRESHOLD_CELLS + 1e-6 || dy > THRESHOLD_CELLS + 1e-6) && restedMs >= REST_MS;
  }

  /* per-corner durations: 1 for the most trailing corner, LEAD for the most leading one */
  function cornerDurations(fromRect, toRect, ms) {
    var dx = (toRect.x + toRect.w / 2) - (fromRect.x + fromRect.w / 2), dy = (toRect.y + toRect.h / 2) - (fromRect.y + fromRect.h / 2);
    var len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len;
    var sx = [-1, 1, 1, -1], sy = [-1, -1, 1, 1], dots = [], lo = Infinity, hi = -Infinity, i;
    for (i = 0; i < 4; i++) { dots[i] = sx[i] * ux + sy[i] * uy; lo = Math.min(lo, dots[i]); hi = Math.max(hi, dots[i]); }
    var out = [];
    for (i = 0; i < 4; i++) { var k = hi - lo > 1e-6 ? (dots[i] - lo) / (hi - lo) : 1; out.push(ms * (1 - (1 - LEAD) * k)); }
    return out;
  }

  function hull(pts) {                       // monotone chain; pts are [x, y]
    var p = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lower = [], upper = [], i;
    for (i = 0; i < p.length; i++) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p[i]) <= 0) lower.pop(); lower.push(p[i]); }
    for (i = p.length - 1; i >= 0; i--) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p[i]) <= 0) upper.pop(); upper.push(p[i]); }
    upper.pop(); lower.pop();
    return lower.concat(upper);
  }

  function Trail(canvas) {
    this.canvas = canvas;
    this.ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    this.active = null;
    this.lastMove = -Infinity;
    this.dirty = null;                       // device-px box drawn last frame
    this.blend = 'over';
    this.changed = false;
  }

  Trail.prototype._scale = function () {
    var c = this.canvas;
    if (c && c.clientWidth > 0 && c.width > 0) return c.width / c.clientWidth;
    return (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  };

  Trail.prototype.jump = function (fromRect, toRect, color, style, nowMs) {
    var rested = nowMs - this.lastMove;
    this.lastMove = nowMs;
    var spec = STYLES[style];
    if (!spec || !this.ctx || !shouldFire(fromRect, toRect, rested)) return false;
    this.active = { from: corners(fromRect), to: corners(toRect), dur: cornerDurations(fromRect, toRect, spec.ms),
      ms: spec.ms, start: nowMs, style: style, rgb: parseColor(color),
      cell: { w: toRect.w, h: toRect.h } };
    this.blend = spec.blend;
    if (this.canvas && this.canvas.setAttribute) this.canvas.setAttribute('data-pmt-trail', style);
    return true;
  };

  Trail.prototype._clearDirty = function () {
    if (this.dirty && this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(this.dirty[0], this.dirty[1], this.dirty[2], this.dirty[3]);
    }
    this.dirty = null;
  };

  Trail.prototype.clear = function () {
    if (this.dirty) this.changed = true;
    this._clearDirty();
    this.active = null;
    if (this.canvas && this.canvas.removeAttribute) this.canvas.removeAttribute('data-pmt-trail');
  };

  /* current corner positions (CSS px) and progress, or null when finished */
  Trail.prototype.state = function (nowMs) {
    var a = this.active; if (!a) return null;
    var t = nowMs - a.start;
    if (t >= a.ms || t < 0) return null;
    var pts = [];
    for (var i = 0; i < 4; i++) {
      var e = easeOut(t / a.dur[i]);
      pts.push([a.from[i][0] + (a.to[i][0] - a.from[i][0]) * e, a.from[i][1] + (a.to[i][1] - a.from[i][1]) * e]);
    }
    return { pts: pts, p: t / a.ms };
  };

  Trail.prototype.frame = function (nowMs) {
    this.changed = !!this.dirty;
    this._clearDirty();
    var a = this.active;
    if (!a || !this.ctx) return false;
    var st = this.state(nowMs);
    if (!st) { this.clear(); return false; }
    this.changed = true;
    var ctx = this.ctx, k = this._scale(), p = st.p, c = a.rgb;
    var pad = 0, i;
    ctx.save();
    ctx.setTransform(k, 0, 0, k, 0, 0);
    var tail = [(a.from[0][0] + a.from[2][0]) / 2, (a.from[0][1] + a.from[2][1]) / 2];
    var head = [(a.to[0][0] + a.to[2][0]) / 2, (a.to[0][1] + a.to[2][1]) / 2];
    if (a.style === 'trace') {
      /* NieR: a thin straight ink line between the trailing and the leading edge of the travelling cell; crisp, no glow */
      var lead = easeOut((nowMs - a.start) / (a.ms * LEAD)), back = easeOut((nowMs - a.start) / a.ms);
      var hx = tail[0] + (head[0] - tail[0]) * lead, hy = tail[1] + (head[1] - tail[1]) * lead;
      var tx = tail[0] + (head[0] - tail[0]) * back, ty = tail[1] + (head[1] - tail[1]) * back;
      var lw = Math.max(1, Math.round(k)) / k;                       // one device-px multiple, at least 1 px
      var snap = function (v) { return (Math.round(v * k - 0.5) + 0.5) / k; };
      if (Math.abs(hy - ty) < 0.01) { hy = ty = snap(ty); }        // horizontal and vertical lines land on pixel centres
      if (Math.abs(hx - tx) < 0.01) { hx = tx = snap(tx); }
      ctx.strokeStyle = rgba(c, 0.9 * (1 - p * p));
      ctx.lineWidth = lw; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      pad = 2;
    } else {
      var poly = hull(st.pts);
      var g = ctx.createLinearGradient(tail[0], tail[1], head[0], head[1]);
      var peak, shadow;
      if (a.style === 'soft') { peak = 0.42 * Math.pow(1 - p, 1.5); shadow = 6; }
      else if (a.style === 'glow') { peak = 0.62 * Math.pow(1 - p, 1.2); shadow = 12; }
      else { peak = 0.8 * (1 - p); shadow = 3; }                     // phosphor: linear decay, like burn-in
      g.addColorStop(0, rgba(c, 0));
      g.addColorStop(a.style === 'phosphor' ? 0.25 : 0.4, rgba(c, peak * 0.35));
      g.addColorStop(1, rgba(c, peak));
      if (a.style !== 'soft') ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.shadowColor = rgba(c, a.style === 'soft' ? peak * 0.6 : peak);
      ctx.shadowBlur = shadow * k;                                   // shadowBlur ignores the transform
      ctx.beginPath(); ctx.moveTo(poly[0][0], poly[0][1]);
      for (i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
      ctx.closePath(); ctx.fill();
      pad = shadow * 2 + 2;
    }
    ctx.restore();
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (i = 0; i < 4; i++) {
      x0 = Math.min(x0, a.from[i][0], st.pts[i][0], a.to[i][0]); y0 = Math.min(y0, a.from[i][1], st.pts[i][1], a.to[i][1]);
      x1 = Math.max(x1, a.from[i][0], st.pts[i][0], a.to[i][0]); y1 = Math.max(y1, a.from[i][1], st.pts[i][1], a.to[i][1]);
    }
    var bx = Math.floor((x0 - pad) * k), by = Math.floor((y0 - pad) * k);
    this.dirty = [bx, by, Math.ceil((x1 + pad) * k) - bx, Math.ceil((y1 + pad) * k) - by];
    return true;
  };

  T.FXTrail = {
    create: function (canvas) { return new Trail(canvas); },
    shouldFire: shouldFire,
    cornerDurations: cornerDurations,
    parseColor: parseColor,
    STYLES: STYLES,
    THRESHOLD_CELLS: THRESHOLD_CELLS,
    REST_MS: REST_MS,
    LEAD: LEAD
  };
})();
