/* Puppet Master terminal: the WebGL effects post-process (T.FXGL), D16.
   T.FXGL.create(canvas, opts?) -> fx | null. null is the no-GPU path: WebGL is missing, the context reports a major
   performance caveat (failIfMajorPerformanceCaveat), or the renderer is a software rasterizer (SwiftShader, llvmpipe).
   The canvas is dedicated to the effects; it is sized in device pixels like the grid canvas it post-processes.

   fx.render(source, params, nowMs, changed?) -> bool
     source   the grid canvas, or an array of same-size layers composited in order before any effect:
              [gridCanvas, { canvas: trailCanvas, blend: 'add' }, ...] ('over' is premultiplied source-over, 'add' is
              additive). null re-renders the last upload (an animation frame with no new content).
     changed  true (default): every layer is re-uploaded; false: none is; [bool, ...]: per layer. The caller knows when
              the grid repainted; animation frames pass false so no texture is uploaded.
   fx.mapPointer(x, y, w, h) -> {x, y} | null   CSS px on the effects canvas -> CSS px in the source, through the same
              curvature and bezel geometry the shader samples with (the last rendered params); null outside the screen.
   fx.unmapPointer(x, y, w, h) -> {x, y} | null  the forward direction (source -> screen), for placing DOM overlays.
   fx.animating(params, nowMs) -> bool   true only while burn-in is still decaying (until its clean frame is drawn),
              degauss runs, or noise or flicker are on.
   fx.burning(params, nowMs) -> bool     the burn-in part of animating(): true while the burn-in still decays, so the
              caller can run those frames at the display rate and ambient-only ones at most AMBIENT_FPS.
   fx.resize(deviceW, deviceH, dpr), fx.dispose(), fx.lost, fx.info { webgl2, renderer, vendor, maxTexture }.
   Context loss: render() returns false while lost; after 'webglcontextrestored' everything is rebuilt and re-uploaded.
   opts: { onLost(), onRestored(), allowSoftware } (allowSoftware is for measuring the software path only).

   Passes, in order: compose (only with several layers) -> burn-in feedback (ping-pong) -> glow (bright pass and 2x2
   downsample to half resolution, separable Gaussian H then V) -> final (curvature and bezel, degauss, burn-in ghost,
   glow (screen blend, so bright text never clips to white), scanlines, vignette, noise, flicker, dim). Colours are
   premultiplied throughout, so translucent (Glass) backgrounds keep their alpha. The shaders are GLSL ES 1.00, so the
   same program runs on WebGL2 and WebGL1. The burn-in decays linearly like cool-retro-term's burnIn (minimum fade
   0.16 s there).
   Round 2 (Jared, 2026-10-14: "not convincing ... too extreme ... look at how emulators do it through their shaders"):
   the screen follows the emulators' tube (the round 2 RESEARCH.md: crt-lottes, crt-geom, crt-royale, crt-easymode,
   cool-retro-term). The warp is Timothy Lottes' p *= (1 + p.y^2 wx, 1 + p.x^2 wy) with coefficients normalised to the
   screen's shape (wx = 2s/A, wy = 2sA for A = W/H), so every edge sags the same fraction s of its own length on any
   terminal, the centre row and column stay pixel-exact and no text leaves the screen; s is the Curvature field x 0.125
   (subtle 0.005 by default). Corners are cgwg's rounded mask on the warped coordinate in device px (10 CSS px, a 1 px
   soft edge), the tube edge darkens 8 % over 4 px as Royale's border does, and the vignette is pow(16uv(1-u)(1-v), e)
   with e = 0.08. Scanlines live in content space, locked to the text rows (a whole number of lines per row, about 3
   device px each) and box-filtered against moire, so they curve with the text; the optional phosphor mask is a
   aperture grille in screen space, three device px to a triad at any device pixel ratio. Scanlines, mask and
   vignette multiply in linear light. The bezel is the view's own CSS frame now (30-looks.css): the shader no longer
   insets the picture for it. (A curved silhouette over flat text, the research's "edges only", would clip the corner
   cells, since this canvas is exactly the text grid; it is not offered, and uFlat stays 0.) */
(function () {
  'use strict';

  var FLICKER_CAP = 0.03;       // peak relative-luminance modulation; WCAG 2.3.1 counts a change of 0.10 as a flash
  var AMBIENT_FPS = 30;         // noise and flicker pick a new value at most this often
  var DEGAUSS_MS = 600;
  var SAG_PER_CURVE = 0.125;    // relative edge sag s per unit of the Curvature field (0.04 -> 0.005, 0.2 -> 0.025)
  var CORNER_CSS = 10;          // the tube's rounded corner, CSS px, whenever Full CRT is on
  var EDGE_DARK = 0.08, EDGE_CSS = 4;   // the tube edge: 8 % darker over 4 CSS px inside the glass
  /* the phosphor mask's depth: each device px column loses this much of one of red, green and blue in turn (an
     aperture grille's stripes), its brightness kept. Round 4 (Q15 #3): drawn at every density, since at 1x a 3 px triad
     is what emulators draw on a 1080p screen; deeper than round 2's 'lite' 0.10, which read as nothing at 2x either */
  var MASK_DEPTH = 0.24;
  var SCAN_REGAIN = 0.5;        // scanlines give back part of the light they take, in linear light
  var SCAN_TARGET_CSS = 3;      // about one scanline per 3 device px (DPR 1) or 2 CSS px (DPR >= 1.5), whole lines per row
  var BURN_GHOST = 0.65;        // afterglow brightness relative to the content that left (cool-retro-term uses 0.65)
  var GLOW_GAIN = 1.6;          // glow strength 1.0 screens 1.6x the blurred bright pass over the image
  var GLOW_TAPS = 7;            // centre + 6 per side

  var DEFAULTS = {
    scanlines: { on: true, strength: 0.30, period: 3 },
    glow: { on: true, strength: 0.45, radius: 2.5 },
    curvature: { on: false, amount: 0.04, flatText: false },
    bezel: { on: false },
    vignette: { on: false, strength: 0.08 },
    mask: { on: false },
    rowPx: 0,
    outside: null,
    burnIn: { on: false, persistMs: 450 },
    noise: { on: false, amount: 0.035 },
    flicker: { on: false, amount: 0.02 },
    degauss: null,
    dim: 0
  };
  var LIMITS = {
    scanStrength: [0, 0.6], scanPeriod: [2, 8], glowStrength: [0, 1.5], glowRadius: [0.5, 8], curvature: [0, 0.3],
    vignette: [0, 0.35], persistMs: [50, 1600], noise: [0, 0.12], flicker: [0, FLICKER_CAP], dim: [0, 0.9]
  };

  function clamp(v, lo, hi) { v = +v; if (!(v === v)) return lo; return v < lo ? lo : v > hi ? hi : v; }
  function num(v, d) { return typeof v === 'number' && v === v ? v : d; }
  function on(o, d) { return o && typeof o.on === 'boolean' ? o.on : d; }

  /* Fill defaults and clamp every number to its range. Pure; the result is a new object. */
  function normalize(p) {
    p = p || {};
    var D = DEFAULTS, L = LIMITS;
    var sc = p.scanlines || {}, gw = p.glow || {}, cv = p.curvature || {}, bz = p.bezel || {}, vg = p.vignette || {};
    var bi = p.burnIn || {}, nz = p.noise || {}, fl = p.flicker || {};
    var dg = p.degauss && typeof p.degauss.startMs === 'number' ? { startMs: p.degauss.startMs } : null;
    return {
      scanlines: { on: on(sc, D.scanlines.on), strength: clamp(num(sc.strength, D.scanlines.strength), L.scanStrength[0], L.scanStrength[1]),
        period: clamp(num(sc.period, D.scanlines.period), L.scanPeriod[0], L.scanPeriod[1]) },
      glow: { on: on(gw, D.glow.on), strength: clamp(num(gw.strength, D.glow.strength), L.glowStrength[0], L.glowStrength[1]),
        radius: clamp(num(gw.radius, D.glow.radius), L.glowRadius[0], L.glowRadius[1]) },
      curvature: { on: on(cv, D.curvature.on), amount: clamp(num(cv.amount, D.curvature.amount), L.curvature[0], L.curvature[1]), flatText: !!cv.flatText },
      bezel: { on: on(bz, D.bezel.on), light: !!bz.light },
      vignette: { on: on(vg, D.vignette.on), strength: clamp(num(vg.strength, D.vignette.strength), L.vignette[0], L.vignette[1]) },
      mask: { on: on(p.mask, D.mask.on) },
      rowPx: num(p.rowPx, 0) > 0 ? p.rowPx : 0,
      outside: Array.isArray(p.outside) && p.outside.length === 3 ? p.outside.slice() : null,
      burnIn: { on: on(bi, D.burnIn.on), persistMs: clamp(num(bi.persistMs, D.burnIn.persistMs), L.persistMs[0], L.persistMs[1]), ink: !!bi.ink },
      noise: { on: on(nz, D.noise.on), amount: clamp(num(nz.amount, D.noise.amount), L.noise[0], L.noise[1]) },
      flicker: { on: on(fl, D.flicker.on), amount: clamp(num(fl.amount, D.flicker.amount), L.flicker[0], L.flicker[1]) },
      degauss: dg,
      dim: clamp(num(p.dim, D.dim), L.dim[0], L.dim[1])
    };
  }

  function preset(name) {
    var p = normalize({});
    if (name === 'off') {
      p.scanlines.on = false; p.glow.on = false;
    } else if (name === 'fullCRT') {
      p.curvature.on = true; p.bezel.on = true; p.vignette.on = true; p.burnIn.on = true; p.noise.on = true;
    }
    return p;   // 'retroDark' is the defaults: static scanlines and glow, nothing that moves
  }

  /* ---- time functions (pure, shared by the shader uniforms and the tests) ---- */
  function hash1(i) {                       // integer -> [0, 1)
    var t = (i | 0) + 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function ambientStep(nowMs) { return Math.floor(nowMs * AMBIENT_FPS / 1000); }
  /* Flicker: a gain on linear light, held for one ambient step, smooth value noise over ~80 ms knots. The gain only
     darkens, from 1 down to 1 - cap, so the relative-luminance change between any two frames is at most
     L * cap <= 0.03 for every pixel (L <= 1). */
  function flickerGain(amount, nowMs) {
    var m = clamp(amount, 0, FLICKER_CAP);
    if (m <= 0) return 1;
    var t = ambientStep(nowMs) * (1000 / AMBIENT_FPS) / 80;
    var i = Math.floor(t), f = t - i; f = f * f * (3 - 2 * f);
    var r = hash1(i) + (hash1(i + 1) - hash1(i)) * f;
    return 1 - m * r;
  }
  function degaussEnvelope(t) { return t < 0 || t >= 1 ? 0 : Math.pow(1 - t, 2.2); }

  /* ---- geometry: output uv (top-down) -> source uv; identical maths to the final shader ----
     The warp is symmetric, so top-down and bottom-up uv give the same map. The bezel is CSS now: nothing is inset. */
  function geometry(p, outW, outH, srcW, srcH, dpr) {
    var crt = !!p.curvature.on, s = crt ? p.curvature.amount * SAG_PER_CURVE : 0, A = outW / Math.max(1, outH);
    return { wx: s > 0 ? 2 * s / A : 0, wy: s > 0 ? 2 * s * A : 0, sag: s, flatText: crt && !!p.curvature.flatText,
      radius: crt ? CORNER_CSS * dpr : 0, edge: crt ? [EDGE_DARK, EDGE_CSS * dpr] : [0, 0], srcW: srcW, srcH: srcH };
  }
  function warp(px, py, g) {
    var x = px * 2 - 1, y = py * 2 - 1;
    return [x * (1 + y * y * g.wx) * 0.5 + 0.5, y * (1 + x * x * g.wy) * 0.5 + 0.5];
  }
  function curved(g) { return g.wx > 0 || g.wy > 0; }
  /* signed distance (source device px) from the rounded screen rectangle; < 0 is inside */
  function screenDist(su, sv, g) {
    var hx = g.srcW / 2, hy = g.srcH / 2, r = g.radius;
    var qx = Math.abs(su * g.srcW - hx) - (hx - r), qy = Math.abs(sv * g.srcH - hy) - (hy - r);
    var ox = Math.max(qx, 0), oy = Math.max(qy, 0);
    return Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - r;
  }
  function mapUV(u, v, g) {
    var c = curved(g) ? warp(u, v, g) : [u, v];
    if (g.radius > 0 && screenDist(c[0], c[1], g) >= 0) return null;
    return g.flatText ? [u, v] : c;
  }
  /* inverse of mapUV (source uv -> output uv), Newton on the warp; null when the source point is not on screen */
  function unmapUV(su, sv, g) {
    if (!curved(g) || g.flatText) {
      var c0 = curved(g) ? warp(su, sv, g) : [su, sv];
      if (g.radius > 0 && screenDist(c0[0], c0[1], g) >= 0) return null;
      return [su, sv];
    }
    if (g.radius > 0 && screenDist(su, sv, g) >= 0) return null;
    var tx = su * 2 - 1, ty = sv * 2 - 1, X = tx, Y = ty;
    for (var i = 0; i < 16; i++) {
      var f1 = X * (1 + g.wx * Y * Y) - tx, f2 = Y * (1 + g.wy * X * X) - ty;
      if (Math.abs(f1) < 1e-13 && Math.abs(f2) < 1e-13) break;
      var j11 = 1 + g.wx * Y * Y, j12 = 2 * g.wx * X * Y, j21 = 2 * g.wy * X * Y, j22 = 1 + g.wy * X * X, det = j11 * j22 - j12 * j21;
      X -= (j22 * f1 - j12 * f2) / det; Y -= (j11 * f2 - j21 * f1) / det;
    }
    return [X * 0.5 + 0.5, Y * 0.5 + 0.5];
  }
  /* the warp's inverse with no mask: the output uv whose warp lands on (su, sv), Newton from the point itself */
  function unwarp(su, sv, g) {
    if (!curved(g)) return [su, sv];
    var tx = su * 2 - 1, ty = sv * 2 - 1, X = tx, Y = ty;
    for (var i = 0; i < 16; i++) {
      var f1 = X * (1 + g.wx * Y * Y) - tx, f2 = Y * (1 + g.wy * X * X) - ty;
      if (Math.abs(f1) < 1e-12 && Math.abs(f2) < 1e-12) break;
      var j11 = 1 + g.wx * Y * Y, j12 = 2 * g.wx * X * Y, j21 = 2 * g.wy * X * Y, j22 = 1 + g.wy * X * X, det = j11 * j22 - j12 * j21;
      X -= (j22 * f1 - j12 * f2) / det; Y -= (j11 * f2 - j21 * f1) / det;
    }
    return [X * 0.5 + 0.5, Y * 0.5 + 0.5];
  }
  /* the tube's visible edge in output uv, clockwise from the top-left corner's end: the rounded screen rectangle carried
     back through the warp, so a bezel (71-bezel.js) meets the glass exactly where the shader's mask does. stepPx is the
     spacing of the straight runs in source device px; each corner takes 10 points */
  function tubeOutline(g, stepPx) {
    var W = g.srcW, H = g.srcH, r = Math.min(g.radius, W / 2, H / 2), st = Math.max(2, stepPx || 12), pts = [];
    var push = function (x, y) { var o = unwarp(x / W, y / H, g); pts.push(o); };
    var run = function (x0, y0, x1, y1) { var n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / st)); for (var i = 0; i < n; i++) push(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
    var arc = function (cx, cy, a0) { if (r <= 0) { push(cx, cy); return; } for (var i = 0; i < 10; i++) { var a = a0 + (Math.PI / 2) * i / 10; push(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } };
    run(r, 0, W - r, 0); arc(W - r, r, -Math.PI / 2);
    run(W, r, W, H - r); arc(W - r, H - r, 0);
    run(W - r, H, r, H); arc(r, H - r, Math.PI / 2);
    run(0, H - r, 0, r); arc(r, r, Math.PI);
    return pts;
  }
  /* scanlines locked to the text rows: a whole number of lines per row, each about 3 device px (2 CSS px at DPR >= 1.5) */
  function scanPeriod(rowPx, dpr) {
    if (!(rowPx > 0)) return SCAN_TARGET_CSS * Math.max(1, dpr);
    var target = Math.max(3, 2 * dpr), n = Math.max(1, Math.round(rowPx / target));
    return rowPx / n;
  }
  /* the glass beyond the tube: the scheme's ground at a quarter of its light (unlit phosphor), straight sRGB 0..1 */
  function outsideColor(p) {
    var o = p.outside; if (!o) return [0, 0, 0];
    var lin = function (c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    var srgb = function (c) { return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; };
    return [srgb(lin(o[0]) * 0.25), srgb(lin(o[1]) * 0.25), srgb(lin(o[2]) * 0.25)];
  }

  /* ---- the animation clock: what animating() needs to know about past renders ---- */
  function Timeline() { this.lastChange = -Infinity; this.burnClean = true; this.degaussDone = null; }
  Timeline.prototype.rendered = function (p, nowMs, changed) {
    if (changed) this.lastChange = nowMs;
    this.burnClean = !p.burnIn.on || nowMs >= this.lastChange + p.burnIn.persistMs;
    if (p.degauss && nowMs >= p.degauss.startMs + DEGAUSS_MS) this.degaussDone = p.degauss.startMs;
  };
  Timeline.prototype.animating = function (p, nowMs) {
    if (p.noise.on && p.noise.amount > 0) return true;
    if (p.flicker.on && p.flicker.amount > 0) return true;
    if (p.degauss && this.degaussDone !== p.degauss.startMs) return true;
    return this.burning(p, nowMs);
  };
  Timeline.prototype.burning = function (p, nowMs) {
    return p.burnIn.on && (!this.burnClean || nowMs < this.lastChange + p.burnIn.persistMs);
  };
  Timeline.prototype.reset = function () { this.lastChange = -Infinity; this.burnClean = true; };

  /* ---- shaders (GLSL ES 1.00) ---- */
  var PREC = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
  var VS = 'attribute vec2 aPos;\nvarying vec2 vUv;\nvoid main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }\n';
  var FS_COPY = PREC + 'varying vec2 vUv;\nuniform sampler2D uTex;\nvoid main() { gl_FragColor = texture2D(uTex, vUv); }\n';
  var FS_BURN = PREC + [
    'varying vec2 vUv;',
    'uniform sampler2D uAcc; uniform sampler2D uPrev; uniform float uDecay; uniform float uAddPrev; uniform float uInk;',
    'void main() {',
    '  vec4 a = max(texture2D(uAcc, vUv) - vec4(uDecay), vec4(0.0));',
    '  vec4 pv = texture2D(uPrev, vUv);',
    /* on a ground lighter than its text the ghost is the text's ink: keep how dark each pixel was (premultiplied) */
    '  if (uInk > 0.5) pv.rgb = pv.a - pv.rgb;',
    '  gl_FragColor = max(a, pv * uAddPrev);',
    '}'].join('\n');
  var FS_DOWN = PREC + [
    'varying vec2 vUv;',
    'uniform sampler2D uSrc; uniform sampler2D uAcc; uniform float uBurnK; uniform vec2 uTexel; uniform float uInk;',
    'vec4 ghost(vec4 c, vec4 g) { if (uInk < 0.5) return max(c, g); vec4 d = max(vec4(c.a - c.rgb, c.a), g); return vec4(d.a - d.rgb, d.a); }',
    'vec4 tap(vec2 p) {',
    '  vec4 c = texture2D(uSrc, p);',
    '  if (uBurnK > 0.0) c = ghost(c, texture2D(uAcc, p) * uBurnK);',
    '  vec3 s = c.rgb / max(c.a, 0.0001);',
    '  float l = dot(s, vec3(0.2126, 0.7152, 0.0722));',
    '  return c * smoothstep(0.12, 0.5, l);',
    '}',
    'void main() {',
    '  vec2 h = 0.5 * uTexel;',
    '  gl_FragColor = 0.25 * (tap(vUv + vec2(-h.x, -h.y)) + tap(vUv + vec2(h.x, -h.y)) + tap(vUv + vec2(-h.x, h.y)) + tap(vUv + h));',
    '}'].join('\n');
  var FS_BLUR = PREC + [
    'varying vec2 vUv;',
    'uniform sampler2D uTex; uniform vec2 uStep; uniform float uW[' + GLOW_TAPS + '];',
    'void main() {',
    '  vec4 acc = texture2D(uTex, vUv) * uW[0];',
    '  for (int i = 1; i < ' + GLOW_TAPS + '; i++) {',
    '    vec2 o = uStep * float(i);',
    '    acc += (texture2D(uTex, vUv + o) + texture2D(uTex, vUv - o)) * uW[i];',
    '  }',
    '  gl_FragColor = acc;',
    '}'].join('\n');
  var FS_FINAL = PREC + [
    'uniform sampler2D uSrc; uniform sampler2D uAcc; uniform sampler2D uGlow;',
    'uniform vec2 uOut; uniform float uDpr;',
    'uniform vec2 uWarp; uniform float uFlat; uniform float uRadius; uniform vec2 uEdge; uniform float uVigExp; uniform float uMask; uniform vec3 uOutside;',
    'uniform vec4 uScan; uniform float uGlowK; uniform float uBurnK; uniform float uInk;',
    'uniform vec2 uNoise; uniform float uGain; uniform vec2 uDeg; uniform float uDim;',
    'vec4 ghost(vec4 c, vec4 g) { if (uInk < 0.5) return max(c, g); vec4 d = max(vec4(c.a - c.rgb, c.a), g); return vec4(d.a - d.rgb, d.a); }',
    /* Lottes' warp with shape-normalised coefficients (round 2): the centre row and column stay where they are */
    'vec2 warp(vec2 p) { vec2 q = p * 2.0 - 1.0; q *= vec2(1.0 + q.y * q.y * uWarp.x, 1.0 + q.x * q.x * uWarp.y); return q * 0.5 + 0.5; }',
    'float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'float lin1(float c) { return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4); }',
    'float srgb1(float c) { return c <= 0.0031308 ? c * 12.92 : 1.055 * pow(c, 1.0 / 2.4) - 0.055; }',
    'vec3 lin3(vec3 c) { return vec3(lin1(c.r), lin1(c.g), lin1(c.b)); }',
    'vec3 srgb3(vec3 c) { return vec3(srgb1(c.r), srgb1(c.g), srgb1(c.b)); }',
    'float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }',
    /* signed distance (device px) from the tube's rounded rectangle, < 0 inside */
    'float sdScreen(vec2 c) { vec2 h = 0.5 * uOut; vec2 q = abs(c * uOut - h) - (h - vec2(uRadius)); return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius; }',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uOut;',
    '  bool curved = uWarp.x + uWarp.y > 0.0;',
    '  vec2 cw = curved ? warp(uv) : uv;',      // the tube's coordinate
    '  vec2 s = uFlat > 0.5 ? uv : cw;',        // where the text is sampled (flat text: unwarped)
    '  vec2 t = s;',
    '  vec4 c;',
    '  float e = uDeg.x;',
    '  if (e > 0.0) {',
    '    float ph = uDeg.y;',
    '    t.x += e * (5.0 * uDpr / uOut.x) * sin(s.y * 21.0 + ph * 38.0);',
    '    t.y += e * (1.5 * uDpr / uOut.y) * sin(s.x * 13.0 - ph * 29.0);',
    '    float a = ph * 23.0;',
    '    vec2 f = e * 3.0 * uDpr * vec2(cos(a), sin(a)) / uOut;',
    '    vec4 cg = texture2D(uSrc, t);',
    '    c = vec4(texture2D(uSrc, t + f).r, cg.g, texture2D(uSrc, t - f).b, cg.a);',
    '    c.rgb = min(c.rgb, vec3(c.a));',
    '  } else {',
    '    c = texture2D(uSrc, t);',
    '  }',
    '  if (uBurnK > 0.0) c = ghost(c, texture2D(uAcc, t) * uBurnK);',
    '  if (uGlowK > 0.0) {',
    '    vec3 g = min(texture2D(uGlow, t).rgb * uGlowK, vec3(1.0));',
    '    c.rgb += g * (1.0 - c.rgb / max(c.a, 0.0001));',
    '    c.a = min(1.0, max(c.a, max(c.r, max(c.g, c.b))));',
    '    c.rgb = min(c.rgb, vec3(c.a));',
    '  }',
    '  if (e > 0.0) {',
    '    float a2 = uDeg.y * 17.0;',
    '    vec3 tint = 0.22 * e * vec3(sin(a2 + s.x * 7.0 + s.y * 3.0), sin(a2 + 2.1 + s.y * 6.0), sin(a2 + 4.2 - s.x * 5.0));',
    '    vec3 tinted = c.rgb * (1.0 + tint);',
    '    c.rgb = clamp(tinted * (luma(c.rgb) / max(luma(tinted), 0.0001)), 0.0, 1.0);',
    '    c.rgb = min(c.rgb, vec3(c.a));',
    '  }',
    /* light the screen in linear light: scanlines (content space, locked to the text rows, box-filtered against moire),
       the phosphor mask (screen space), the vignette and the tube edge (on the tube's coordinate) */
    '  vec3 k = vec3(1.0);',
    '  float regain = 1.0;',
    '  if (uScan.x > 0.0) {',
    '    vec2 q = uv * 2.0 - 1.0;',
    '    float yDev = (1.0 - s.y) * uOut.y - uScan.z;',
    '    float phase = yDev / uScan.y - 0.5;',
    '    float dPhase = (1.0 + q.x * q.x * uWarp.y * (1.0 - uFlat)) / uScan.y;',
    '    float kk = 3.14159265 * dPhase;',
    '    float sinc = kk < 1e-4 ? 1.0 : sin(kk) / kk;',
    '    float dark = 0.5 - 0.5 * cos(6.2831853 * phase) * sinc;',
    '    float st = uScan.x * (1.0 - smoothstep(0.33, 0.5, dPhase));',
    '    k *= 1.0 - st * dark;',
    '    regain *= 1.0 + uScan.w * 0.5 * st;',
    '  }',
    '  if (uMask > 0.0) {',
    '    float m = mod(floor(gl_FragCoord.x), 3.0);',
    '    k *= (vec3(1.0) - uMask * vec3(m < 0.5 ? 1.0 : 0.0, m > 0.5 && m < 1.5 ? 1.0 : 0.0, m > 1.5 ? 1.0 : 0.0)) / (1.0 - uMask / 3.0);',
    '  }',
    '  if (uVigExp > 0.0) {',
    '    float v = clamp(16.0 * cw.x * cw.y * (1.0 - cw.x) * (1.0 - cw.y), 0.0, 1.0);',
    '    k *= pow(v, uVigExp);',
    '  }',
    '  float d = sdScreen(cw);',
    '  if (uEdge.x > 0.0) k *= 1.0 - uEdge.x * (1.0 - smoothstep(0.0, uEdge.y, -d));',
    '  if (k != vec3(1.0) || regain != 1.0) {',
    '    vec3 st3 = c.rgb / max(c.a, 0.0001);',
    '    c.rgb = min(srgb3(lin3(st3) * k * regain), vec3(1.0)) * c.a;',
    '  }',
    '  if (uNoise.x > 0.0) {',
    '    vec2 cell = floor(gl_FragCoord.xy / uDpr);',
    '    float n = hash12(cell + uNoise.y * vec2(7.13, 3.71));',
    '    float gv = uNoise.x * max(0.0, 1.0 - length(uv - 0.5) * 1.3);',
    '    c.rgb += vec3(n * gv) * c.a;',
    /* round 4 (Q15): where the screen is see-through (Friendly's stage, Glass) the grain lies over the ground under it as
       well, light and dark specks in turn so it shows on a pale ground too; it had touched the text alone there. Round 5:
       a half as strong again there, as the stage's soft light swallowed the default grain (Friendly dark, Off beside 0.035:
       4.33 as filmed) */
    '    float tg = (1.0 - c.a) * (n - 0.5) * 3.0 * gv;',
    '    c = tg > 0.0 ? c + vec4(tg) : vec4(c.rgb, c.a - tg);',
    '  }',
    '  if (uGain < 1.0) {',
    '    vec3 st = c.rgb / max(c.a, 0.0001);',
    '    st = vec3(srgb1(lin1(st.r) * uGain), srgb1(lin1(st.g) * uGain), srgb1(lin1(st.b) * uGain));',
    '    c.rgb = st * c.a;',
    '  }',
    '  c.rgb = min(c.rgb * (1.0 - uDim), vec3(c.a));',
    /* the anti-aliased rounded tube (1 device px) over the unlit glass beyond it */
    '  if (uRadius > 0.0 || curved) {',
    '    float inside = clamp(0.5 - d, 0.0, 1.0);',
    '    c = mix(vec4(uOutside * (1.0 - uDim), 1.0), c, inside);',
    '  }',
    '  gl_FragColor = c;',
    '}'].join('\n');

  var SOFTWARE_RE = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i;

  function rendererInfo(gl) {
    var info = { renderer: '', vendor: '' };
    try {
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) { info.renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || ''); info.vendor = String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || ''); }
      if (!info.renderer) info.renderer = String(gl.getParameter(gl.RENDERER) || '');
      if (!info.vendor) info.vendor = String(gl.getParameter(gl.VENDOR) || '');
    } catch (e) { /* keep empty */ }
    return info;
  }

  function create(canvas, opts) {
    opts = opts || {};
    if (!canvas || typeof canvas.getContext !== 'function') return null;
    var attrs = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
      preserveDrawingBuffer: false, powerPreference: 'default', failIfMajorPerformanceCaveat: !opts.allowSoftware };
    var gl = null, v2 = false;
    try { gl = canvas.getContext('webgl2', attrs); v2 = !!gl; } catch (e) { gl = null; }
    if (!gl) {
      try { gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs); } catch (e) { gl = null; }
    }
    if (!gl) return null;
    var info = rendererInfo(gl);
    if (!opts.allowSoftware && SOFTWARE_RE.test(info.renderer)) { release(gl); return null; }
    var fx = new FX(canvas, gl, v2, info, opts);
    if (!fx.ok) { fx.dispose(); return null; }
    return fx;
  }
  function release(gl) { try { var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } catch (e) { /* ignore */ } }

  function FX(canvas, gl, v2, info, opts) {
    var self = this;
    this.canvas = canvas; this.gl = gl; this.opts = opts;
    this.info = { webgl2: v2, renderer: info.renderer, vendor: info.vendor, maxTexture: 0 };
    this.lost = false; this.disposed = false;
    this.dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.timeline = new Timeline();
    this.params = normalize({});
    this.geom = null;
    this._weights = new Float32Array(GLOW_TAPS); this._sigma = -1;
    this._onLost = function (e) {
      e.preventDefault(); self.lost = true;
      if (self.opts.onLost) { try { self.opts.onLost(); } catch (err) { /* caller's problem */ } }
    };
    this._onRestored = function () {
      self.lost = false; self.ok = self._init();
      if (self.opts.onRestored) { try { self.opts.onRestored(); } catch (err) { /* caller's problem */ } }
    };
    canvas.addEventListener('webglcontextlost', this._onLost, false);
    canvas.addEventListener('webglcontextrestored', this._onRestored, false);
    this.ok = this._init();
  }

  FX.prototype._init = function () {
    var gl = this.gl;
    this.layers = [];          // [{ tex, w, h }]
    this.layerSpec = [];       // last [{ canvas, blend }]
    this.targets = {};
    this.srcW = 0; this.srcH = 0;
    this.accValid = false; this.accCarry = 0; this.lastBurnMs = 0;
    this.glowValid = false; this.glowKey = '';
    this.hasSource = false;
    this.timeline.reset();
    try {
      this.info.maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
      this.vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      this.prog = {
        copy: this._program(FS_COPY), burn: this._program(FS_BURN), down: this._program(FS_DOWN),
        blur: this._program(FS_BLUR), final: this._program(FS_FINAL)
      };
      this.black = this._texture(1, 1, new Uint8Array([0, 0, 0, 0]));
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
      return true;
    } catch (e) {
      if (typeof console !== 'undefined') console.error('[pmt] effects renderer failed to start', e);
      return false;
    }
  };

  FX.prototype._program = function (fsSrc) {
    var gl = this.gl;
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error('shader: ' + gl.getShaderInfoLog(s));
      return s;
    }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsSrc));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error('program: ' + gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) || 0;
    for (var i = 0; i < n; i++) {
      var a = gl.getActiveUniform(p, i); if (!a) continue;
      var name = a.name.replace(/\[0\]$/, '');
      u[name] = gl.getUniformLocation(p, a.name);
    }
    return { p: p, u: u };
  };

  FX.prototype._texture = function (w, h, data) {
    var gl = this.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data || null);
    return t;
  };

  FX.prototype._target = function (name, w, h) {
    var t = this.targets[name], gl = this.gl;
    if (t && t.w === w && t.h === h) return t;
    if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); }
    var tex = this._texture(w, h, null), fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    t = this.targets[name] = { tex: tex, fb: fb, w: w, h: h };
    return t;
  };

  FX.prototype._draw = function (prog, target, w, h) {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(prog.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  FX.prototype._bind = function (unit, tex, prog, name) {
    var gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex || this.black);
    if (prog.u[name]) gl.uniform1i(prog.u[name], unit);
  };

  function layerList(source) {
    if (!source) return null;
    var arr = Array.isArray(source) ? source : [source], out = [];
    for (var i = 0; i < arr.length; i++) {
      var e = arr[i]; if (!e) continue;
      if (e.canvas) out.push({ canvas: e.canvas, blend: e.blend === 'add' ? 'add' : 'over', slot: i });
      else out.push({ canvas: e, blend: 'over', slot: i });
    }
    return out;
  }

  FX.prototype.resize = function (w, h, dpr) {
    if (dpr) this.dpr = dpr;
    if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) { this.canvas.width = w; this.canvas.height = h; }
  };

  /* the source (composited layers) as a texture */
  FX.prototype._srcTex = function () {
    if (this.layerSpec.length > 1) return this.targets.src ? this.targets.src.tex : null;
    return this.layers[0] ? this.layers[0].tex : null;
  };

  FX.prototype.render = function (source, params, nowMs, changed) {
    if (this.lost || this.disposed || !this.ok) return false;
    var gl = this.gl;
    if (gl.isContextLost && gl.isContextLost()) return false;
    var p = normalize(params);
    var now = typeof nowMs === 'number' ? nowMs : (typeof performance !== 'undefined' ? performance.now() : Date.now());
    var spec = layerList(source);
    if (!spec) { spec = this.layerSpec; changed = false; }
    if (!spec.length || !spec[0].canvas.width || !spec[0].canvas.height) return false;
    var W = spec[0].canvas.width, H = spec[0].canvas.height;
    if (W > this.info.maxTexture || H > this.info.maxTexture) return false;
    var sizeChanged = W !== this.srcW || H !== this.srcH || spec.length !== this.layerSpec.length;
    if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
    var flags = [], any = false;
    for (var i = 0; i < spec.length; i++) {
      var f = sizeChanged || !this.hasSource || changed === undefined || changed === true ||
        (Array.isArray(changed) && !!changed[spec[i].slot]);
      if (spec[i].canvas.width !== W || spec[i].canvas.height !== H) f = false;   // a layer of the wrong size is skipped
      flags.push(f); any = any || f;
    }
    if (sizeChanged) { this.accValid = false; this.glowValid = false; }

    /* 1. burn-in: the content that is about to be replaced joins the accumulator at full strength; older ghosts fade
          linearly by dt / persistMs, in exact 1/255 steps (the remainder carries to the next frame). */
    var burnOn = p.burnIn.on && this.hasSource && !sizeChanged;
    if (!p.burnIn.on || !!p.burnIn.ink !== this.accInk) { this.accValid = false; this.accInk = !!p.burnIn.ink; }
    if (burnOn) {
      var A = this._target('accA', W, H), B = this._target('accB', W, H);
      if (!this.accValid) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, A.fb); gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        this.accValid = true; this.accCarry = 0; this.lastBurnMs = now;
      }
      var decay = Math.max(0, now - this.lastBurnMs) / p.burnIn.persistMs + this.accCarry;
      var q = decay >= 1 ? 1 : Math.floor(decay * 255) / 255;
      if (q > 0 || any) {
        var pb = this.prog.burn;
        gl.useProgram(pb.p);
        this._bind(0, A.tex, pb, 'uAcc'); this._bind(1, any ? this._srcTex() : null, pb, 'uPrev');
        gl.uniform1f(pb.u.uDecay, q); gl.uniform1f(pb.u.uAddPrev, any ? 1 : 0); gl.uniform1f(pb.u.uInk, p.burnIn.ink ? 1 : 0);
        this._draw(pb, B, W, H);
        this.targets.accA = B; this.targets.accB = A;
        this.accCarry = decay >= 1 ? 0 : decay - q; this.lastBurnMs = now;
      }
    }

    /* 2. upload the changed layers, compose when there are several */
    gl.activeTexture(gl.TEXTURE0);
    for (i = 0; i < spec.length; i++) {
      var L = this.layers[i];
      if (!L) L = this.layers[i] = { tex: this._texture(1, 1, null), w: 1, h: 1 };
      if (!flags[i]) continue;
      gl.bindTexture(gl.TEXTURE_2D, L.tex);
      try {
        if (L.w === W && L.h === H) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, spec[i].canvas);
        else { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spec[i].canvas); L.w = W; L.h = H; }
      } catch (e) { return false; }   // a tainted or detached source: nothing to draw
    }
    for (i = spec.length; i < this.layers.length; i++) gl.deleteTexture(this.layers[i].tex);
    this.layers.length = spec.length;
    this.layerSpec = spec; this.srcW = W; this.srcH = H; this.hasSource = true;
    if (spec.length > 1 && any) {
      var S = this._target('src', W, H), pc = this.prog.copy;
      gl.bindFramebuffer(gl.FRAMEBUFFER, S.fb); gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      for (i = 0; i < spec.length; i++) {
        if (spec[i].blend === 'add') gl.blendFunc(gl.ONE, gl.ONE); else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(pc.p); this._bind(0, this.layers[i].tex, pc, 'uTex');
        this._draw(pc, S, W, H);
      }
      gl.disable(gl.BLEND);
    }
    var src = this._srcTex();

    var burnLive = p.burnIn.on && this.accValid && (now < (any ? now : this.timeline.lastChange) + p.burnIn.persistMs);
    var burnK = burnLive ? BURN_GHOST : 0;

    /* 3. glow: bright pass at half resolution, then a separable Gaussian (sigma = radius css px) */
    var hw = Math.max(1, Math.ceil(W / 2)), hh = Math.max(1, Math.ceil(H / 2));
    if (p.glow.on && p.glow.strength > 0) {
      var sigma = p.glow.radius * this.dpr / 2;
      var key = W + 'x' + H + ':' + sigma.toFixed(3) + (burnK ? ':b' : '');
      if (!this.glowValid || any || burnK || key !== this.glowKey) {
        this._glowWeights(sigma);
        var G1 = this._target('glowA', hw, hh), G2 = this._target('glowB', hw, hh), pd = this.prog.down, pl = this.prog.blur;
        gl.useProgram(pd.p);
        this._bind(0, src, pd, 'uSrc'); this._bind(1, burnK ? this.targets.accA.tex : null, pd, 'uAcc');
        gl.uniform1f(pd.u.uBurnK, burnK); gl.uniform1f(pd.u.uInk, p.burnIn.ink ? 1 : 0); gl.uniform2f(pd.u.uTexel, 1 / W, 1 / H);
        this._draw(pd, G1, hw, hh);
        var stride = Math.max(1, sigma / 2);
        gl.useProgram(pl.p); gl.uniform1fv(pl.u.uW, this._weights);
        this._bind(0, G1.tex, pl, 'uTex'); gl.uniform2f(pl.u.uStep, stride / hw, 0);
        this._draw(pl, G2, hw, hh);
        this._bind(0, G2.tex, pl, 'uTex'); gl.uniform2f(pl.u.uStep, 0, stride / hh);
        this._draw(pl, G1, hw, hh);
        this.glowValid = true; this.glowKey = key;
      }
    } else this.glowValid = false;

    /* 4. final */
    var g = this.geom = geometry(p, W, H, W, H, this.dpr);
    var pf = this.prog.final, u = pf.u;
    gl.useProgram(pf.p);
    this._bind(0, src, pf, 'uSrc');
    this._bind(1, burnK ? this.targets.accA.tex : null, pf, 'uAcc');
    this._bind(2, this.glowValid ? this.targets.glowA.tex : null, pf, 'uGlow');
    gl.uniform2f(u.uOut, W, H); gl.uniform1f(u.uDpr, this.dpr);
    gl.uniform2f(u.uWarp, g.wx, g.wy); gl.uniform1f(u.uFlat, g.flatText ? 1 : 0); gl.uniform1f(u.uRadius, g.radius);
    gl.uniform2f(u.uEdge, g.edge[0], g.edge[1]);
    var oc = outsideColor(p); gl.uniform3f(u.uOutside, oc[0], oc[1], oc[2]);
    /* scanlines: locked to the text rows (rowPx, device px) when the view says how tall a row is */
    gl.uniform4f(u.uScan, p.scanlines.on ? p.scanlines.strength : 0, scanPeriod(p.rowPx, this.dpr), 0, SCAN_REGAIN);
    gl.uniform1f(u.uMask, p.mask.on ? MASK_DEPTH : 0);
    gl.uniform1f(u.uGlowK, this.glowValid ? p.glow.strength * GLOW_GAIN : 0);
    gl.uniform1f(u.uBurnK, burnK); gl.uniform1f(u.uInk, p.burnIn.ink ? 1 : 0);
    gl.uniform1f(u.uVigExp, p.vignette.on ? p.vignette.strength : 0);
    gl.uniform2f(u.uNoise, p.noise.on ? p.noise.amount : 0, ambientStep(now) % 997);
    gl.uniform1f(u.uGain, p.flicker.on ? flickerGain(p.flicker.amount, now) : 1);
    var dt = p.degauss ? (now - p.degauss.startMs) / DEGAUSS_MS : -1;
    gl.uniform2f(u.uDeg, degaussEnvelope(dt), p.degauss ? (now - p.degauss.startMs) / 1000 : 0);
    gl.uniform1f(u.uDim, p.dim);
    this._draw(pf, null, W, H);

    this.params = p;
    this.timeline.rendered(p, now, any);
    return true;
  };

  FX.prototype._glowWeights = function (sigma) {
    if (Math.abs(sigma - this._sigma) < 1e-6) return;
    var stride = Math.max(1, sigma / 2), w = this._weights, sum = 0;
    for (var i = 0; i < GLOW_TAPS; i++) { var x = i * stride; w[i] = Math.exp(-(x * x) / (2 * sigma * sigma)); sum += i ? 2 * w[i] : w[i]; }
    for (i = 0; i < GLOW_TAPS; i++) w[i] /= sum;
    this._sigma = sigma;
  };

  FX.prototype._geom = function () {
    var W = this.srcW || this.canvas.width || 1, H = this.srcH || this.canvas.height || 1;
    return this.geom || geometry(this.params, W, H, W, H, this.dpr);
  };
  FX.prototype.mapPointer = function (x, y, w, h) {
    if (!(w > 0 && h > 0)) return null;
    var s = mapUV(x / w, y / h, this._geom());
    return s ? { x: s[0] * w, y: s[1] * h } : null;
  };
  FX.prototype.unmapPointer = function (x, y, w, h) {
    if (!(w > 0 && h > 0)) return null;
    var o = unmapUV(x / w, y / h, this._geom());
    return o ? { x: o[0] * w, y: o[1] * h } : null;
  };
  FX.prototype.animating = function (params, nowMs) { return this.timeline.animating(normalize(params), nowMs); };
  FX.prototype.burning = function (params, nowMs) { return this.timeline.burning(normalize(params), nowMs); };

  FX.prototype.dispose = function () {
    if (this.disposed) return;
    this.disposed = true;
    this.canvas.removeEventListener('webglcontextlost', this._onLost, false);
    this.canvas.removeEventListener('webglcontextrestored', this._onRestored, false);
    var gl = this.gl;
    if (!this.lost && !(gl.isContextLost && gl.isContextLost())) {
      try {
        var k; for (k in this.targets) { gl.deleteTexture(this.targets[k].tex); gl.deleteFramebuffer(this.targets[k].fb); }
        for (var i = 0; i < this.layers.length; i++) gl.deleteTexture(this.layers[i].tex);
        for (k in this.prog) gl.deleteProgram(this.prog[k].p);
        gl.deleteTexture(this.black); gl.deleteBuffer(this.vbo);
      } catch (e) { /* the context is going anyway */ }
    }
    release(gl);
    this.targets = {}; this.layers = [];
  };

  T.FXGL = {
    create: create,
    defaults: function () { return normalize({}); },
    normalize: normalize,
    preset: preset,
    presets: ['retroDark', 'fullCRT', 'off'],
    flickerGain: flickerGain,
    degaussEnvelope: degaussEnvelope,
    geometry: geometry,
    mapUV: mapUV,
    unmapUV: unmapUV,
    tubeOutline: tubeOutline,
    Timeline: Timeline,
    FLICKER_CAP: FLICKER_CAP,
    AMBIENT_FPS: AMBIENT_FPS,
    DEGAUSS_MS: DEGAUSS_MS,
    CORNER_CSS: CORNER_CSS, SAG_PER_CURVE: SAG_PER_CURVE, scanPeriod: scanPeriod,
    BURN_GHOST: BURN_GHOST,
    GLOW_GAIN: GLOW_GAIN,
    LIMITS: LIMITS
  };
})();
