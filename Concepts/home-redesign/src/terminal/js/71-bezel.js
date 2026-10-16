/* The bezel (round 3, Jared 2026-10-14: "The bezels are still really ugly. Is that really what other terminal programs
   use?"). No mainstream terminal draws one; the retro emulators do, and the good ones (RetroArch's Mega Bezel and
   koko-aio, cool-retro-term's frame) draw a monitor housing. This one is built from their parts (research/round3.md):
   - a flat outer frame, a touch lighter along its top, its outer edge darkened;
   - inside it a sloped face in four parts that meet in crisp diagonal creases at the corners, each lit by where it faces
     (the light comes from above: the top face, turned down, is darkest; the bottom face, turned up, is brightest; Mega
     Bezel's 0.5 / 1 / 2);
   - at the glass a thin bright lip that never goes fully dark, and inside it a 1-2 px unlit ring, the case's shadow
     falling a few pixels onto the glass under the top lip;
   - the material's grain (plastic speckle, brushed metal, frost), 2-4 %;
   - and the screen's light on all of it: the picture mirrored about each edge of the glass onto the face beside it,
     folded so a narrow face still shows whole rows (Mega Bezel folds at 1:1 on a far wider face), sharp at the lip and
     blurrier and fainter outward ((1 - sqrt(d/D))^2), a diffused copy under it, and a soft glow of the screen's colour
     over face and frame (cool-retro-term tints its frame with the text colour). It follows the live terminal at most 15
     times a second while output changes, and costs nothing while the terminal is still.
   The inner edge is the tube's own: with Full CRT on, the shader's rounded screen carried back through its warp
   (FXGL.tubeOutline), so the face meets the glass exactly where the picture ends, curved edges and corners included.
   One canvas over the screen's edge, under the sticky header and the overlays; the housing is painted once per size,
   material and tube shape, and only the four strips the case covers are redrawn when the reflection changes, in the
   canvas itself (no blend layer that the compositor would redo on every repaint of the text).
   Materials: Platinum and Putty (beige plastic: IBM, Apple), Graphite (grey plastic: DEC), Black gloss (Sony PVM),
   Brushed aluminium and Gunmetal, Glass (a clear case lit in Liquid Glass's public tokens, neutral white light only, no
   colour split: its CONTRACT.md), and the scheme's accent in plastic. NieR Mode's own case (Follow look) is its flat ink
   frame: no glow, no blur, square; a material chosen in NieR is that material's housing, as in any look (round 4, Q15
   #1: the nine choices drew the one ink frame). Reflection is four levels, Off, Low, Medium and High, each material
   starting at its own (Q15 #2: 21 steps of 5 % were too fine to tell apart, and the face saturated above 80 %). */
(function () {
  'use strict';
  var C = T.color;
  var MAX_FPS = 15;

  /* the case colour, its own Reflection level (on a dark screen and on a light one), roughness (the reflection's blur,
     CSS px), grain; a dark case's face is lifted above its frame so its lighting reads */
  var MATERIALS = {
    platinum: { base: '#cbc4b2', own: ['low', 'low'], blur: 2.4, grain: 'plastic', faceLift: 1.0, light: true },
    putty: { base: '#b9b09c', own: ['low', 'low'], blur: 2.8, grain: 'plastic', faceLift: 1.0, light: true },
    charcoal: { base: '#2c2d31', own: ['medium', 'medium'], blur: 1.8, grain: 'plastic', faceLift: 1.7 },
    black: { base: '#141416', own: ['medium', 'medium'], blur: 1.2, grain: 'gloss', faceLift: 2.1 },
    aluminium: { base: '#a2a6ad', own: ['low', 'medium'], blur: 1.6, grain: 'brushed', faceLift: 1.0, light: true },
    gunmetal: { base: '#3a3d43', own: ['medium', 'medium'], blur: 1.4, grain: 'brushed', faceLift: 1.5 },
    glass: { base: null, own: ['medium', 'medium'], blur: 1.0, grain: 'frost', faceLift: 1.0 },
    accent: { base: null, own: ['low', 'low'], blur: 2.0, grain: 'plastic', faceLift: 1.2 }
  };
  /* the four Reflection levels as the share of the screen's light the face gives back. A light screen lights its case
     far more than a dark one does, so its steps are smaller; each step measured apart from its neighbours in every
     look (round 4). Medium on a dark screen is round 3's black gloss and graphite; Low on a light one its putty */
  var LEVELS = ['off', 'low', 'medium', 'high'];
  var STRENGTH = { dark: [0, 0.3, 0.6, 1.3], light: [0, 0.2, 0.42, 0.8] };
  /* clear glass gives back more, level by level: its film shows the page behind it, so the same light reads fainter
     there (round 5, Q15: Low beside Off on Retro's paper, 3.81, and Low beside Medium in NieR dark, 4.28) */
  var GLASS = { dark: [0, 1.2, 1.45, 1.3], light: [0, 2.0, 2.2, 2.0] };
  /* a near-black screen (Retro's phosphor ground) has little light to give a dark case, so its steps are lifted up to
     a third, and read as far apart as on a grey one (round 5, Q15: Graphite and Gunmetal's Low and Medium, 4.2) */
  function dimScreen(bg) { return 1 + 0.3 * Math.max(0, Math.min(1, (0.016 - C.lum(bg)) / 0.012)); }
  function levelOf(r, mat, light) {
    if (typeof r === 'number' && isFinite(r)) {
      /* a level stored as a number (round 3's slider): the nearest */
      var t = STRENGTH[light ? 'light' : 'dark'], best = 0;
      for (var i = 1; i < t.length; i++) if (Math.abs(t[i] - r) < Math.abs(t[best] - r)) best = i;
      return LEVELS[best];
    }
    if (LEVELS.indexOf(r) >= 0) return r;
    var M = MATERIALS[mat];
    return M ? M.own[light ? 1 : 0] : 'off';
  }
  /* the look's own case: graphite or brushed aluminium in Basic, graphite or putty in Friendly, glass in Glass, black gloss
     or platinum in Retro (the two classic terminals), ink in NieR */
  function lookMaterial(look, light) {
    if (look === 'glass') return 'glass';
    if (look === 'retro') return light ? 'platinum' : 'black';
    if (look === 'friendly') return light ? 'putty' : 'charcoal';
    return light ? 'aluminium' : 'charcoal';
  }
  /* light from above and a little left: the sloped face's four parts (Mega Bezel's 0.5 / 1 / 2) and the flat frame */
  var FACE = { top: 0.5, left: 1.0, right: 0.8, bottom: 2.0 };
  var FRAME = { top: 1.08, left: 1.0, right: 0.95, bottom: 0.9 };
  var SIDES = ['top', 'right', 'bottom', 'left'];

  var lin = function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  var srgb = function (v) { v = Math.max(0, Math.min(1, v)); return Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255); };
  /* light on a surface: its colour times k in linear light; a light case answers less, so it never washes to white */
  function lit(c, k, light) { var kk = light ? 1 + (k - 1) * 0.4 : k; return C.rgb(srgb(lin(C.r(c)) * kk), srgb(lin(C.g(c)) * kk), srgb(lin(C.b(c)) * kk)); }
  function hex(c) { return C.toHex(c); }
  function rgba(c, a) { return 'rgba(' + C.r(c) + ',' + C.g(c) + ',' + C.b(c) + ',' + a + ')'; }
  function cssVar(name) { try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); } catch (e) { return ''; } }

  /* grain tiles, made once */
  var tiles = {};
  function tile(kind) {
    if (tiles[kind]) return tiles[kind];
    var cv = document.createElement('canvas'), n = kind === 'brushed' ? 256 : 96;
    cv.width = n; cv.height = kind === 'brushed' ? 32 : n;
    var g = cv.getContext('2d'), seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    if (kind === 'brushed') {
      for (var y = 0; y < cv.height; y++) for (var k = 0; k < 6; k++) {
        var x = rnd() * n, l = 20 + rnd() * 120, v = rnd() < 0.5 ? 255 : 0;
        g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',' + (0.03 + rnd() * 0.06) + ')'; g.fillRect(x, y, l, 1); g.fillRect(x - n, y, l, 1);
      }
    } else {
      var img = g.createImageData(n, n), d = img.data;
      for (var i = 0; i < d.length; i += 4) { var w = rnd() < 0.5 ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = w; d[i + 3] = Math.round(rnd() * (kind === 'frost' ? 12 : 20)); }
      g.putImageData(img, 0, 0);
    }
    tiles[kind] = cv;
    return cv;
  }

  function roundRect(x, y, w, h, r) {
    var p = new Path2D(); r = Math.max(0, Math.min(r, w / 2, h / 2));
    p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.arcTo(x + w, y, x + w, y + r, r); p.lineTo(x + w, y + h - r);
    p.arcTo(x + w, y + h, x + w - r, y + h, r); p.lineTo(x + r, y + h); p.arcTo(x, y + h, x, y + h - r, r);
    p.lineTo(x, y + r); p.arcTo(x, y, x + r, y, r); p.closePath();
    return p;
  }
  function polyPath(pts) { var p = new Path2D(); pts.forEach(function (q, i) { if (i) p.lineTo(q[0], q[1]); else p.moveTo(q[0], q[1]); }); p.closePath(); return p; }
  /* the opening as points (CSS px, screen coordinates): the tube's curved edge, or a rounded rectangle */
  function rectPts(x, y, w, h, r) {
    var pts = [], arc = function (cx, cy, a0) { for (var i = 0; i <= 8; i++) { var a = a0 + (Math.PI / 2) * i / 8; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    if (r <= 0) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI);
    return pts;
  }
  /* the four parts of a ring between an outer box and an inner box, split at the diagonals through their corners */
  function parts(o, i) {
    return {
      top: [[o[0], o[1]], [o[2], o[1]], [i[2], i[1]], [i[0], i[1]]],
      right: [[o[2], o[1]], [o[2], o[3]], [i[2], i[3]], [i[2], i[1]]],
      bottom: [[o[2], o[3]], [o[0], o[3]], [i[0], i[3]], [i[2], i[3]]],
      left: [[o[0], o[3]], [o[0], o[1]], [i[0], i[1]], [i[0], i[3]]]
    };
  }

  function Bezel(view) {
    this.view = view;
    var el = this.el = document.createElement('div');
    el.className = 'pmt-bezel'; el.hidden = true; el.setAttribute('aria-hidden', 'true');
    this.housing = document.createElement('canvas'); this.housing.className = 'pmt-bezel-housing';
    el.appendChild(this.housing);
    this.spec = { style: 'off' }; this.geoKey = ''; this.dirty = false; this.timer = 0; this.last = 0; this.paintTimer = 0;
  }
  Bezel.prototype.on = function () { return this.spec.style !== 'off'; };
  /* the resolved bezel (42-appearance.js): style, width, gap, material, reflection; and the look's theme */
  Bezel.prototype.configure = function (bz, ap) {
    var th = ap.theme || {}, light = th.appearance === 'light' || C.lum(th.bg) > 0.4, look = (ap.effects && ap.effects.look) || 'basic';
    var chosen = bz.color && bz.color !== 'follow' && MATERIALS[bz.color] ? bz.color : null;
    var mat = bz.style === 'off' ? null : chosen || (look === 'nier' ? 'ink' : lookMaterial(look, light));
    var level = mat === 'ink' ? 'off' : levelOf(bz.reflect, mat, light);
    /* a case paler than a dark screen shows the mirror as a gloss (_reflect): decided by how light its face is drawn, so
       the accent plastic, a mid tone in most schemes, takes it too (round 5, Q15: its four levels drew alike in Retro dark,
       2.87, as light added to a mid tone barely shows) */
    var M0 = MATERIALS[mat], face0 = !M0 || mat === 'glass' ? null : lit(mat === 'accent' ? C.mix(th.palette ? th.palette[4] : th.fg, 0x5c5c5c, 0.45) : C.hex(M0.base), M0.faceLift, !!M0.light);
    var gloss = !light && face0 !== null && C.lum(face0) >= 0.12, li = LEVELS.indexOf(level), side = light ? 'light' : 'dark';
    this.spec = { style: bz.style || 'off', width: bz.width || 0, gap: bz.gap || 0, material: mat, reflect: level, gloss: gloss,
      strength: STRENGTH[side][li] * (mat === 'glass' ? GLASS[side][li] : 1) * (light || gloss ? 1 : dimScreen(th.bg)),
      light: light, bg: th.bg, fg: th.fg, accent: th.palette ? th.palette[4] : th.fg, glow: !!(ap.effects && ap.effects.glow && ap.effects.glow.on), look: look };
    this.el.hidden = !this.on();
    this.view.root.setAttribute('data-pmt-bezel', this.spec.style);
    this.geoKey = '';
    if (!this.on()) this._release();
  };
  /* the geometry from the view's layout: screen size, the grid's rectangle; painted just after the layout's frame */
  Bezel.prototype.layout = function (w, h, gx, gy, gw, gh, dpr) {
    if (!this.on()) return;
    this.g = { w: w, h: h, gx: gx, gy: gy, gw: gw, gh: gh, dpr: dpr };
    var self = this;
    clearTimeout(this.paintTimer);
    this.paintTimer = setTimeout(function () { self.paintTimer = 0; self._paint(); }, 30);
  };
  Bezel.prototype.frame = function () {
    if (!this.on() || !this.geo || !this.spec.strength) return;   /* Reflection Off: the case never changes */
    /* only when the screen's picture changed (the renderer counts the frames it actually paints) */
    var st = this.view.renderer && this.view.renderer.stats, n = st ? st.frames : -1;
    if (n === this.seenFrames && !this.dirty) return;
    this.seenFrames = n;
    this.dirty = true;
    if (this.timer) return;
    var self = this, wait = Math.max(0, 1000 / MAX_FPS - (T.util.now() - this.last));
    this.timer = setTimeout(function () { self.timer = 0; if (self.dirty) self._reflect(); }, wait);
  };
  Bezel.prototype._release = function () {
    clearTimeout(this.timer); clearTimeout(this.paintTimer); this.timer = this.paintTimer = 0;
    this.housing.width = this.housing.height = 0;
    this.cache = this.masks = this.snap = this.reflectCv = this.tmpCv = null; this.geo = null;
  };
  Bezel.prototype.dispose = function () { this._release(); this.el.remove(); };

  /* the tube's edge in screen CSS px: Full CRT's curved glass, the CPU fallback's rounded glass, or the case's own opening */
  Bezel.prototype._opening = function () {
    var v = this.view, g = this.g, s = this.spec, fx = v.fx, crt = fx && fx.cfg && fx.cfg.crt;
    if (crt && T.FXGL && fx.active && fx.cfg.curvature && fx.cfg.curvature.on) {
      var p = fx.params ? fx.params(T.util.now()) : null, dpr = g.dpr, W = Math.round(g.gw * dpr), H = Math.round(g.gh * dpr);
      if (p && W > 0 && H > 0) {
        var geo = T.FXGL.geometry(p, W, H, W, H, dpr);
        return { pts: T.FXGL.tubeOutline(geo, 10 * dpr).map(function (q) { return [g.gx + q[0] * g.gw, g.gy + q[1] * g.gh]; }), tube: true };
      }
    }
    if (crt) return { pts: rectPts(g.gx, g.gy, g.gw, g.gh, T.FXGL ? T.FXGL.CORNER_CSS : 10), tube: true };
    var r = s.material === 'ink' ? 0 : s.style === 'rim' ? 4 : 7;
    return { pts: rectPts(s.width, s.width, g.w - s.width * 2, g.h - s.width * 2, r), tube: false };
  };

  Bezel.prototype._paint = function () {
    if (!this.on() || !this.g) return;
    var g = this.g, s = this.spec, dpr = g.dpr, W = Math.max(1, Math.round(g.w * dpr)), H = Math.max(1, Math.round(g.h * dpr));
    var op = this._opening();
    var key = [W, H, dpr, s.style, s.width, s.material, s.light, s.bg, s.accent, op.pts.length, op.pts[0].join(','), op.pts[Math.floor(op.pts.length / 3)].join(',')].join('|');
    if (key === this.geoKey && this.cache) { this._reflect(true); return; }
    this.geoKey = key;
    var bb = op.pts.reduce(function (b, q) { return [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[0]), Math.max(b[3], q[1])]; }, [Infinity, Infinity, -Infinity, -Infinity]);
    /* the flat frame takes 40 % of a monitor case's width (all of a slim one); the sloped face the rest, out to the glass */
    var fw = s.material === 'ink' ? s.width : s.style === 'case' ? Math.max(3, Math.round(s.width * 0.4)) : Math.max(2, s.width - 2);
    var outerR = s.material === 'ink' ? 0 : Math.min(16, (s.style === 'rim' ? 4 : 7) + s.width), innerR = s.material === 'ink' ? 0 : Math.max(2, outerR - fw);
    var frameIn = [fw, fw, g.w - fw, g.h - fw];
    /* the strips the case covers: out to how far the curved corners reach into the opening's box, and the shadow beyond */
    var depth = op.pts.reduce(function (d, q) { return Math.max(d, Math.min(q[0] - bb[0], bb[2] - q[0], q[1] - bb[1], bb[3] - q[1])); }, 0) + 10;
    var t = Math.min(g.h, bb[1] + depth), b = Math.max(0, bb[3] - depth), l = Math.min(g.w, bb[0] + depth), r = Math.max(0, bb[2] - depth);
    var strips = [[0, 0, g.w, t], [0, b, g.w, g.h - b], [0, t, l, b - t], [r, t, g.w - r, b - t]].filter(function (q) { return q[2] > 0 && q[3] > 0; })
      .map(function (q) { var x0 = Math.floor(q[0] * dpr), y0 = Math.floor(q[1] * dpr); return [x0, y0, Math.min(W, Math.ceil((q[0] + q[2]) * dpr)) - x0, Math.min(H, Math.ceil((q[1] + q[3]) * dpr)) - y0]; });
    var outer = roundRect(0, 0, g.w, g.h, outerR), inner = roundRect(frameIn[0], frameIn[1], frameIn[2] - frameIn[0], frameIn[3] - frameIn[1], innerR), opening = polyPath(op.pts);
    /* how wide the face is at its narrowest (the middle of an edge): the reflection's reach is measured against it */
    var faceMin = Math.max(2, Math.min(bb[1] - fw, bb[0] - fw, g.h - fw - bb[3], g.w - fw - bb[2]));
    this.geo = { W: W, H: H, op: op, bb: bb, strips: strips, fw: fw, frameIn: frameIn, faceMin: faceMin, outer: outer, inner: inner, opening: opening,
      faceParts: parts(frameIn, bb), frameParts: parts([0, 0, g.w, g.h], frameIn) };
    var cv = this.cache || (this.cache = document.createElement('canvas'));
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._housing(ctx, g, s, this.geo);
    this.housing.width = W; this.housing.height = H;
    this._masks(g, s, this.geo);
    this._reflect(true);
  };

  Bezel.prototype._housing = function (ctx, g, s, geo) {
    var mat = s.material, ink = mat === 'ink', glass = mat === 'glass', M = MATERIALS[mat] || MATERIALS.charcoal, light = !!M.light;
    var base = ink ? C.mix(s.bg, s.fg, 0.24) : mat === 'accent' ? C.mix(s.accent, 0x5c5c5c, 0.45) : glass ? (s.light ? 0xffffff : 0xdfe6f2) : C.hex(M.base);
    var face = glass || ink ? base : lit(base, M.faceLift, light);
    var ring = new Path2D(); ring.addPath(geo.outer); ring.addPath(geo.opening);
    var frameRing = new Path2D(); frameRing.addPath(geo.outer); frameRing.addPath(geo.inner);
    var faceRing = new Path2D(); faceRing.addPath(geo.inner); faceRing.addPath(geo.opening);
    /* glass: a clear film of the same light; on a light screen its faces take a faint cool shade by side, so the creases
       still read (Liquid Glass's shaded edge colour) */
    var ga = s.light ? 0.4 : 0.1, col = function (c, k, a) {
      if (!glass) return hex(lit(c, k, light));
      if (s.light) return k >= 1 ? rgba(0xffffff, Math.min(0.85, 0.35 * k)) : rgba(C.hex('#1e2d5a'), 0.16 * (1 - k) + 0.04);
      return rgba(lit(c, k, true), a === undefined ? ga : a);
    };
    ctx.clearRect(0, 0, g.w, g.h);
    ctx.save(); ctx.clip(ring, 'evenodd');
    if (ink) {
      ctx.fillStyle = hex(base); ctx.fillRect(0, 0, g.w, g.h);
      ctx.restore();
      ctx.lineWidth = 1; ctx.strokeStyle = hex(C.mix(s.bg, s.fg, 0.4)); ctx.stroke(geo.opening); ctx.stroke(geo.outer);
      return;
    }
    /* the flat frame: each side a shade of the same light, a touch lighter along the top */
    ctx.save(); ctx.clip(frameRing, 'evenodd');
    SIDES.forEach(function (side) { ctx.save(); ctx.clip(polyPath(geo.frameParts[side])); ctx.fillStyle = col(base, FRAME[side]); ctx.fillRect(0, 0, g.w, g.h); ctx.restore(); });
    ctx.restore();
    /* the sloped face: four parts meeting in crisp creases, each lit by where it faces, a little darker toward the glass */
    ctx.save(); ctx.clip(faceRing, 'evenodd');
    var fb = geo.frameIn, bb = geo.bb;
    SIDES.forEach(function (side) {
      ctx.save(); ctx.clip(polyPath(geo.faceParts[side]));
      var k = FACE[side], gr = side === 'top' ? ctx.createLinearGradient(0, fb[1], 0, bb[1]) : side === 'bottom' ? ctx.createLinearGradient(0, fb[3], 0, bb[3])
        : side === 'left' ? ctx.createLinearGradient(fb[0], 0, bb[0], 0) : ctx.createLinearGradient(fb[2], 0, bb[2], 0);
      gr.addColorStop(0, col(face, k * 1.08)); gr.addColorStop(1, col(face, k * 0.9));
      ctx.fillStyle = gr; ctx.fillRect(0, 0, g.w, g.h);
      ctx.restore();
    });
    /* the creases: a hairline of light along each diagonal where two parts of the face meet */
    ctx.lineWidth = 1; ctx.strokeStyle = glass ? 'rgba(255,255,255,' + (s.light ? 0.5 : 0.16) + ')' : rgba(lit(face, 2.2, light), 0.35);
    [[fb[0], fb[1], bb[0], bb[1]], [fb[2], fb[1], bb[2], bb[1]], [fb[2], fb[3], bb[2], bb[3]], [fb[0], fb[3], bb[0], bb[3]]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); ctx.stroke(); });
    ctx.restore();
    /* the grain: speckle in plastic, streaks along each side in metal, frost in glass */
    var tl = tile(M.grain === 'brushed' ? 'brushed' : M.grain === 'frost' ? 'frost' : 'plastic');
    ctx.globalCompositeOperation = glass ? 'source-over' : 'overlay'; ctx.globalAlpha = M.grain === 'gloss' ? 0.45 : glass ? 0.6 : 1;
    if (M.grain === 'brushed') {
      ['top', 'bottom'].forEach(function (side) { ctx.save(); ctx.clip(polyPath(geo.frameParts[side])); ctx.fillStyle = ctx.createPattern(tl, 'repeat'); ctx.fillRect(0, 0, g.w, g.h); ctx.restore(); });
      ['left', 'right'].forEach(function (side) {
        ctx.save(); ctx.clip(polyPath(geo.frameParts[side])); ctx.translate(g.w / 2, g.h / 2); ctx.rotate(Math.PI / 2); ctx.translate(-g.h / 2, -g.w / 2);
        ctx.fillStyle = ctx.createPattern(tl, 'repeat'); ctx.fillRect(0, 0, g.h, g.w); ctx.restore();
      });
    } else { ctx.fillStyle = ctx.createPattern(tl, 'repeat'); ctx.fillRect(0, 0, g.w, g.h); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    /* where frame turns into face: a lit edge on the lower half, a shaded one on the upper */
    ctx.lineWidth = 1;
    ctx.save(); ctx.beginPath(); ctx.rect(0, g.h / 2, g.w, g.h); ctx.clip(); ctx.strokeStyle = glass ? 'rgba(255,255,255,.3)' : rgba(lit(base, 2.4, light), 0.6); ctx.stroke(geo.inner); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, g.w, g.h / 2); ctx.clip(); ctx.strokeStyle = glass ? 'rgba(0,0,0,.18)' : rgba(lit(base, 0.4, light), 0.8); ctx.stroke(geo.inner); ctx.restore();
    /* the outer edge: darkened, with a hairline of light along its top and left */
    ctx.lineWidth = 2; ctx.strokeStyle = glass ? (cssVar('--lg-edge-bot') || 'rgba(0,0,0,.28)') : rgba(lit(base, 0.45, light), 0.9); ctx.stroke(geo.outer);
    ctx.save(); ctx.clip(polyPath([[0, 0], [g.w, 0], [0, g.h]])); ctx.lineWidth = 1;
    ctx.strokeStyle = glass ? (cssVar('--lg-edge-top') || 'rgba(255,255,255,.3)') : rgba(lit(base, 2.2, light), 0.55);
    ctx.stroke(roundRect(1.5, 1.5, g.w - 3, g.h - 3, Math.max(0, (Math.min(16, (s.style === 'rim' ? 4 : 7) + s.width)) - 1.5))); ctx.restore();
    ctx.restore();
    /* at the glass: a thin bright lip that never goes fully dark, then a near-black unlit ring; the case's shadow under
       the top lip falls a few pixels onto the glass */
    ctx.save(); ctx.lineJoin = 'round';
    ctx.save(); ctx.clip(ring, 'evenodd'); ctx.lineWidth = 4.4;
    ctx.strokeStyle = glass ? (cssVar('--lg-lens-hair') || 'rgba(255,255,255,' + (s.light ? 0.9 : 0.5) + ')') : hex(lit(face, light ? 1.35 : 3.2, light));
    ctx.stroke(geo.opening); ctx.restore();
    ctx.lineWidth = 2.4; ctx.strokeStyle = glass ? 'rgba(0,0,0,.3)' : 'rgba(0,0,0,.82)'; ctx.stroke(geo.opening);
    if (glass) { ctx.save(); ctx.clip(polyPath([[0, 0], [g.w, 0], [bb[2], bb[1] + 6], [bb[0], bb[1] + 6]])); ctx.lineWidth = 2; ctx.strokeStyle = cssVar('--lg-lens-glint') || 'rgba(255,255,255,.55)'; ctx.stroke(geo.opening); ctx.restore(); }
    ctx.clip(geo.opening);
    ctx.shadowColor = 'rgba(0,0,0,' + (glass ? 0.22 : s.light ? 0.3 : 0.55) + ')'; ctx.shadowBlur = (s.style === 'case' ? 8 : 4) * g.dpr; ctx.shadowOffsetY = 2 * g.dpr;
    var around = new Path2D(); around.rect(-40, -40, g.w + 80, g.h + 80); around.addPath(geo.opening);
    ctx.fillStyle = '#000'; ctx.fill(around, 'evenodd');
    ctx.restore();
  };

  /* where the screen's light falls, at 0.4 of CSS size: the direct reflection and its diffused copy on the face, faded by
     Mega Bezel's (1 - sqrt(d/D))^2 from the glass outward and toward the corners; and the glow over face and frame */
  var RS = 0.4;
  Bezel.prototype._masks = function (g, s, geo) {
    if (s.material === 'ink') { this.masks = null; return; }
    var w = Math.max(1, Math.round(g.w * RS)), h = Math.max(1, Math.round(g.h * RS));
    var faceRing = new Path2D(); faceRing.addPath(geo.inner); faceRing.addPath(geo.opening);
    var ring = new Path2D(); ring.addPath(geo.outer); ring.addPath(geo.opening);
    var bb = geo.bb;
    var make = function (region, reach, peak, corners) {
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      var c = cv.getContext('2d'); c.setTransform(RS, 0, 0, RS, 0, 0); c.clip(region, 'evenodd'); c.lineJoin = 'round'; c.strokeStyle = '#fff';
      /* bands from the far edge inward, each adding just enough that the band ends at the curve's value */
      var N = 10, prev = 0;
      for (var i = N; i >= 1; i--) {
        var d = reach * i / N, a = peak * Math.pow(1 - Math.sqrt(Math.min(1, (d - reach / N) / reach)), 2);
        var inc = prev >= 1 ? 0 : Math.max(0, 1 - (1 - a) / (1 - prev));
        c.globalAlpha = inc; c.lineWidth = d * 2; c.stroke(geo.opening); prev = Math.max(prev, a);
      }
      c.globalAlpha = 1; c.setTransform(1, 0, 0, 1, 0, 0);
      if (corners) {
        c.globalCompositeOperation = 'destination-out';
        [[bb[0], bb[1]], [bb[2], bb[1]], [bb[2], bb[3]], [bb[0], bb[3]]].forEach(function (q) {
          var rr = Math.min(g.w, g.h) * 0.12 * RS, gr = c.createRadialGradient(q[0] * RS, q[1] * RS, 0, q[0] * RS, q[1] * RS, rr);
          gr.addColorStop(0, 'rgba(0,0,0,.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
        });
      }
      return cv;
    };
    var reach = Math.max(8, geo.faceMin * 1.5);
    this.masks = {
      direct: make(faceRing, reach, 1, true),
      diffused: make(faceRing, reach * 2, 0.9, true),
      glow: make(ring, Math.max(reach * 2.5, s.width + 30), 0.75, false)
    };
  };

  /* the screen, small: its ground and its text (the effects pass reads the same canvas) */
  Bezel.prototype._snapshot = function () {
    var v = this.view, src = v.canvas, g = this.g;
    if (!src.width || !src.height) return null;
    var sw = 200, sh = Math.max(24, Math.round(sw * g.gh / Math.max(1, g.gw)));
    var cv = this.snap || (this.snap = document.createElement('canvas'));
    if (cv.width !== sw || cv.height !== sh) { cv.width = sw; cv.height = sh; }
    var c = cv.getContext('2d');
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.fillStyle = hex(this.spec.bg); c.fillRect(0, 0, sw, sh);
    try { c.drawImage(src, 0, 0, sw, sh); } catch (e) { return null; }
    if (this.spec.glow) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.35; c.drawImage(cv, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; }
    return cv;
  };

  Bezel.prototype._reflect = function (force) {
    this.dirty = false; this.last = T.util.now();
    var geo = this.geo, s = this.spec;
    if (!geo || !this.cache) return;
    if (!this.view.visible && !force) { this.dirty = true; return; }
    var out = this.housing, oc = out.getContext('2d');
    if (out.width !== geo.W || out.height !== geo.H) { out.width = geo.W; out.height = geo.H; }
    var M = MATERIALS[s.material], strength = s.strength || 0;
    var R = M && strength > 0 && this.masks ? this._light(strength) : null;
    /* the four strips: the housing, then the screen's light on it as light (screen blend; Glass in light mode lays it on
       plainly, as Liquid Glass's glint does there). A pale case (platinum, putty, aluminium) over a dark screen shows the
       mirror as a gloss, the dark picture laid over its face, since a dark screen adds almost no light to a pale one
       (round 4, Q15: its levels drew alike there) */
    var glassLight = s.material === 'glass' && s.light, gloss = !!(M && s.gloss);
    geo.strips.forEach(function (q) {
      oc.clearRect(q[0], q[1], q[2], q[3]);
      oc.drawImage(this.cache, q[0], q[1], q[2], q[3], q[0], q[1], q[2], q[3]);
      if (R) {
        oc.save(); oc.beginPath(); oc.rect(q[0], q[1], q[2], q[3]); oc.clip();
        oc.globalCompositeOperation = glassLight || gloss ? 'source-over' : 'screen'; oc.globalAlpha = glassLight ? GLASS_LIGHT : gloss ? 0.85 : 1;
        oc.drawImage(R, 0, 0, geo.W, geo.H);
        oc.restore();
      }
    }, this);
  };
  /* each face shows the picture mirrored about the glass edge beside it and folded (a narrow face still shows whole rows),
     sharp, then diffused; the glow is the picture unfolded and very soft, over the whole case */
  var FOLD = 2.6;
  /* clear glass on a light screen lays the reflection on plainly (Liquid Glass's glint does so there); round 3's 0.6 made
     its Medium hard to tell from Off (Q15), so it is laid on whole */
  var GLASS_LIGHT = 1;
  Bezel.prototype._light = function (strength) {
    var snap = this._snapshot(); if (!snap) return null;
    var geo = this.geo, g = this.g, s = this.spec, M = MATERIALS[s.material], bb = geo.bb, m = this.masks;
    var w = m.direct.width, h = m.direct.height;
    var R = this.reflectCv || (this.reflectCv = document.createElement('canvas')), T2 = this.tmpCv || (this.tmpCv = document.createElement('canvas'));
    [R, T2].forEach(function (c) { if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } });
    var rc = R.getContext('2d'), tc = T2.getContext('2d');
    rc.clearRect(0, 0, w, h);
    /* the mirror about each edge, folded by f: a point d inside the glass lands d/f outside it */
    var mirror = function (side, f) {
      var e = side === 'top' ? bb[1] : side === 'bottom' ? bb[3] : side === 'left' ? bb[0] : bb[2];
      return side === 'top' || side === 'bottom' ? [RS, 0, 0, -RS / f, 0, RS * (e + e / f)] : [-RS / f, 0, 0, RS, RS * (e + e / f), 0];
    };
    var areas = { face: geo.faceParts, all: parts([0, 0, g.w, g.h], bb) };
    var pass = function (blur, mask, alpha, f, area) {
      tc.save(); tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = 'source-over'; tc.globalAlpha = 1; tc.clearRect(0, 0, w, h);
      tc.filter = blur > 0 ? 'blur(' + (blur * RS).toFixed(2) + 'px)' : 'none';
      SIDES.forEach(function (side) {
        tc.save(); tc.setTransform(RS, 0, 0, RS, 0, 0); tc.clip(polyPath(areas[area][side]));
        var t = mirror(side, f); tc.setTransform(t[0], t[1], t[2], t[3], t[4], t[5]);
        tc.drawImage(snap, g.gx, g.gy, g.gw, g.gh);
        tc.restore();
      });
      tc.filter = 'none';
      tc.globalCompositeOperation = 'destination-in'; tc.drawImage(mask, 0, 0);
      tc.restore();
      /* added as light; past full strength (High) the same pass is added again, so the face keeps brightening instead of
         stopping at one copy */
      rc.globalCompositeOperation = 'lighter';
      for (var a = alpha; a > 0.004; a -= 1) { rc.globalAlpha = Math.min(1, a); rc.drawImage(T2, 0, 0); }
      rc.globalAlpha = 1; rc.globalCompositeOperation = 'source-over';
    };
    pass(M.blur, m.direct, strength * 1.25, FOLD, 'face');
    pass(M.blur * 4 + 3, m.diffused, strength * 0.55, FOLD, 'face');
    pass(16, m.glow, strength * (s.glow ? 0.75 : 0.45), 1, 'all');
    return R;
  };

  /* A case style's first showing compiled the GPU programs it draws with (the shadow-blurred rounded frames, the
     strokes, the reflection's blurs) in the frames after the click (part2's F3.1 trace on the P1000: Monitor linked 14
     programs, 445 ms, and no new frame came for 567 ms). warm(view): each style is drawn once, at that terminal's size
     and with its own settings, on a stand-in view in an unseen layer inside the viewport, one style per painted frame,
     then all of it is removed. Liquid Glass's lg-warm recipe: an ancestor at opacity 0.004 (at 0.001 the alpha rounds
     to nothing and nothing compiles), only on the GPU tier, never in a hidden tab, while the page is busy (it goes on at
     'pm-idle') or within 600 ms of any input */
  var warmedBezel = {}, lastInput = 0, inputWatch = false;
  function gpuTier() {
    var tier = document.documentElement.getAttribute('data-lg-tier');
    if (tier) return tier === 'gpu';
    return !!(T.FXGL && T.FXGL.probe && T.FXGL.probe());
  }
  Bezel.warm = function (view) {
    if (!view || !view.root || !view.root.isConnected || !T.Appearance || !gpuTier()) return;
    if (!inputWatch) {
      inputWatch = true;
      ['pointerdown', 'keydown', 'wheel'].forEach(function (t) { window.addEventListener(t, function () { lastInput = T.util.now(); }, { capture: true, passive: true }); });
    }
    var A = T.Appearance, todo = ['rim', 'case'].map(function (style) {
      var ap = A.peek({ api: view.api, tabAppearance: Object.assign({}, view.tabAppearance || {}, { bezel: style }), previewAppearance: null, state: {} });
      return ap && ap.bezel && ap.bezel.style === style ? ap : null;
    }).filter(function (ap) {
      var b = ap.bezel, key = [b.style, b.width, b.color, b.reflect, ap.theme && ap.theme.appearance, ap.effects && ap.effects.look].join('|');
      if (warmedBezel[key]) return false;
      warmedBezel[key] = 1; return true;
    });
    if (!todo.length) return;
    var host = null, bz = null;
    function done() { if (bz) bz.dispose(); if (host) host.remove(); host = bz = null; }
    function ready() {
      if (document.hidden) return false;
      try { if (typeof window.PM_BUSY === 'function' && window.PM_BUSY()) return false; } catch (e) {}
      return T.util.now() - lastInput >= 600;
    }
    function step() {
      if (!view.root.isConnected) { done(); return; }
      if (!ready()) { setTimeout(function () { idle(step); }, 400); return; }
      /* and only after two frames that came on time, as the Customize screen's raster warm waits (review RW-4) */
      requestAnimationFrame(function (t1) { requestAnimationFrame(function (t2) {
        if (!view.root.isConnected) { done(); return; }
        if (t2 - t1 > 25 || !ready()) { setTimeout(function () { idle(step); }, 400); return; }
        draw();
      }); });
    }
    function draw() {
      var ap = todo.shift(), b = ap.bezel, w = Math.max(80, view.screen ? view.screen.clientWidth : 0), h = Math.max(60, view.screen ? view.screen.clientHeight : 0);
      var dpr = (view.metrics && view.metrics.dpr) || window.devicePixelRatio || 1, inset = (b.width || 0) + (b.gap || 0);
      if (!host) {
        host = document.createElement('div');
        host.setAttribute('aria-hidden', 'true'); host.inert = true;
        host.style.cssText = 'position:fixed;left:0;top:0;width:' + w + 'px;height:' + h + 'px;opacity:.004;will-change:opacity;pointer-events:none;z-index:2147483000;contain:strict';
        document.body.appendChild(host);
        bz = new Bezel({ root: document.createElement('div'), canvas: view.canvas, visible: true, fx: null, renderer: null });
        bz.el.style.cssText = 'position:absolute;inset:0';
        bz.housing.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block';
        host.appendChild(bz.el);
      }
      bz.configure(b, ap);
      bz.g = { w: w, h: h, gx: inset, gy: inset, gw: Math.max(20, w - inset * 2), gh: Math.max(20, h - inset * 2), dpr: dpr };
      try { bz._paint(); } catch (e) { done(); return; }
      /* kept for one painted frame, then the next style at the next idle moment */
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (todo.length) idle(step); else done(); }); });
    }
    function idle(fn) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 4000 }); else setTimeout(fn, 200); }
    idle(step);
  };
  T.Bezel = Bezel;
  T.Bezel.MATERIALS = Object.keys(MATERIALS);
  T.Bezel.lookMaterial = lookMaterial;
  /* a material's own Reflection level (Follow look gives the look's own case; NieR's ink frame reflects nothing) */
  T.Bezel.LEVELS = LEVELS;
  T.Bezel.ownLevel = function (id, look, light) {
    var m = !id || id === 'follow' ? (look === 'nier' ? null : lookMaterial(look, light)) : id;
    return m && MATERIALS[m] ? MATERIALS[m].own[light ? 1 : 0] : null;
  };
  T.Bezel.levelOf = function (r, id, look, light) { var m = !id || id === 'follow' ? (look === 'nier' ? null : lookMaterial(look, light)) : id; return m ? levelOf(r, m, light) : null; };
})();
