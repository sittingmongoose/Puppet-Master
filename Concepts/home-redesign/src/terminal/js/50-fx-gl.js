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
   same program runs on WebGL2 and WebGL1. The
   effect formulas are PM-authored; the curvature is the classic barrel map p + c(1 + d)d with d = k|c|^2, the same
   family cool-retro-term uses, and the burn-in decays linearly like its burnIn (minimum fade 0.16 s there). */
(function () {
  'use strict';

  var FLICKER_CAP = 0.03;       // peak relative-luminance modulation; WCAG 2.3.1 counts a change of 0.10 as a flash
  var AMBIENT_FPS = 30;         // noise and flicker pick a new value at most this often
  var DEGAUSS_MS = 600;
  var BEZEL_CSS = 14;           // bezel thickness, CSS px
  var SCREEN_RADIUS_CSS = 9;    // rounded screen corner (source CSS px) whenever curvature or the bezel is on
  var BURN_GHOST = 0.65;        // afterglow brightness relative to the content that left (cool-retro-term uses 0.65)
  var GLOW_GAIN = 1.6;          // glow strength 1.0 screens 1.6x the blurred bright pass over the image
  var SCAN_BOOST = 0.25;        // scanlines give back a quarter of the average light they take
  var GLOW_TAPS = 7;            // centre + 6 per side

  var DEFAULTS = {
    scanlines: { on: true, strength: 0.30, period: 3 },
    glow: { on: true, strength: 0.45, radius: 2.5 },
    curvature: { on: false, amount: 0.08 },
    bezel: { on: false },
    vignette: { on: false, strength: 0.25 },
    burnIn: { on: false, persistMs: 450 },
    noise: { on: false, amount: 0.035 },
    flicker: { on: false, amount: 0.02 },
    degauss: null,
    dim: 0
  };
  var LIMITS = {
    scanStrength: [0, 0.6], scanPeriod: [2, 8], glowStrength: [0, 1.5], glowRadius: [0.5, 8], curvature: [0, 0.3],
    vignette: [0, 0.6], persistMs: [50, 1600], noise: [0, 0.12], flicker: [0, FLICKER_CAP], dim: [0, 0.9]
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
      curvature: { on: on(cv, D.curvature.on), amount: clamp(num(cv.amount, D.curvature.amount), L.curvature[0], L.curvature[1]) },
      bezel: { on: on(bz, D.bezel.on), light: !!bz.light },
      vignette: { on: on(vg, D.vignette.on), strength: clamp(num(vg.strength, D.vignette.strength), L.vignette[0], L.vignette[1]) },
      burnIn: { on: on(bi, D.burnIn.on), persistMs: clamp(num(bi.persistMs, D.burnIn.persistMs), L.persistMs[0], L.persistMs[1]) },
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

  /* ---- geometry: output uv (top-down) -> source uv; identical maths to the final shader ---- */
  function geometry(p, outW, outH, srcW, srcH, dpr) {
    var curv = p.curvature.on ? p.curvature.amount : 0;
    var bpx = p.bezel.on ? Math.round(BEZEL_CSS * dpr) : 0;
    return { curv: curv, ix: bpx / outW, iy: bpx / outH, radius: (curv > 0 || p.bezel.on) ? SCREEN_RADIUS_CSS * dpr : 0,
      srcW: srcW, srcH: srcH, bezelPx: bpx };
  }
  function warp(px, py, k) {
    var cx = px - 0.5, cy = py - 0.5;
    var d = (cx * cx + cy * cy) * k, f = (1 + d) * d;
    return [px + cx * f, py + cy * f];
  }
  /* signed distance (source device px) from the rounded screen rectangle; < 0 is inside */
  function screenDist(su, sv, g) {
    var hx = g.srcW / 2, hy = g.srcH / 2, r = g.radius;
    var qx = Math.abs(su * g.srcW - hx) - (hx - r), qy = Math.abs(sv * g.srcH - hy) - (hy - r);
    var ox = Math.max(qx, 0), oy = Math.max(qy, 0);
    return Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - r;
  }
  function mapUV(u, v, g) {
    var px = (u - g.ix) / (1 - 2 * g.ix), py = (v - g.iy) / (1 - 2 * g.iy);
    var s = g.curv > 0 ? warp(px, py, g.curv) : [px, py];
    if (screenDist(s[0], s[1], g) >= 0) return null;
    return s;
  }
  /* inverse of mapUV (source uv -> output uv), Newton on the warp; null when the source point is not on screen */
  function unmapUV(su, sv, g) {
    if (screenDist(su, sv, g) >= 0) return null;
    var px = su, py = sv, k = g.curv;
    if (k > 0) {
      for (var i = 0; i < 12; i++) {
        var cx = px - 0.5, cy = py - 0.5, d = (cx * cx + cy * cy) * k, f = (1 + d) * d;
        var fx = px + cx * f - su, fy = py + cy * f - sv;
        if (Math.abs(fx) < 1e-12 && Math.abs(fy) < 1e-12) break;
        var a = 1 + f, b = 2 * k * (1 + 2 * d);          // J = a I + b c c^T
        var j11 = a + b * cx * cx, j12 = b * cx * cy, j22 = a + b * cy * cy, det = j11 * j22 - j12 * j12;
        px -= (j22 * fx - j12 * fy) / det; py -= (j11 * fy - j12 * fx) / det;
      }
    }
    return [px * (1 - 2 * g.ix) + g.ix, py * (1 - 2 * g.iy) + g.iy];
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
    'uniform sampler2D uAcc; uniform sampler2D uPrev; uniform float uDecay; uniform float uAddPrev;',
    'void main() {',
    '  vec4 a = max(texture2D(uAcc, vUv) - vec4(uDecay), vec4(0.0));',
    '  gl_FragColor = max(a, texture2D(uPrev, vUv) * uAddPrev);',
    '}'].join('\n');
  var FS_DOWN = PREC + [
    'varying vec2 vUv;',
    'uniform sampler2D uSrc; uniform sampler2D uAcc; uniform float uBurnK; uniform vec2 uTexel;',
    'vec4 tap(vec2 p) {',
    '  vec4 c = texture2D(uSrc, p);',
    '  if (uBurnK > 0.0) c = max(c, texture2D(uAcc, p) * uBurnK);',
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
    'uniform vec2 uOut; uniform vec2 uSrcPx; uniform float uDpr;',
    'uniform float uCurv; uniform vec2 uInset; uniform float uRadius; uniform float uBezel; uniform float uBezelPx; uniform float uBezelLight;',
    'uniform vec2 uScan; uniform float uGlowK; uniform float uBurnK; uniform float uVig;',
    'uniform vec2 uNoise; uniform float uGain; uniform vec2 uDeg; uniform float uDim;',
    'vec2 warp(vec2 p) { vec2 c = p - 0.5; float d = dot(c, c) * uCurv; return p + c * (1.0 + d) * d; }',
    'float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'float lin1(float c) { return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4); }',
    'float srgb1(float c) { return c <= 0.0031308 ? c * 12.92 : 1.055 * pow(c, 1.0 / 2.4) - 0.055; }',
    'float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }',
    /* The case: moulded plastic (charcoal, or warm beige on a light scheme). The inner 45 % of the bezel is a chamfer
       sloping down to the tube, lit from above: its lower lip catches the light, its upper lip falls into shadow. The
       outer edge is rounded over, the plastic has a fine static grain, the screen's own light falls on the chamfer,
       and the glass sits in a thin contact shadow. Nothing here moves. */
    'vec3 bezel(vec2 uv, vec2 s, float dist) {',
    '  float k = clamp(dist / max(uBezelPx, 1.0), 0.0, 1.0);',
    '  vec3 base = mix(vec3(0.118, 0.113, 0.104), vec3(0.792, 0.760, 0.690), uBezelLight);',
    '  vec3 col = base * (0.90 + 0.16 * uv.y);',
    '  vec2 n = normalize((s - 0.5) * uSrcPx + vec2(0.0001));',
    '  float ch = 1.0 - smoothstep(0.0, 0.45, k);',
    '  float lit = dot(-n, normalize(vec2(-0.3, 1.0)));',
    '  col *= 1.0 + ch * lit * mix(1.10, 0.30, uBezelLight);',
    '  col += ch * max(lit, 0.0) * mix(0.050, 0.045, uBezelLight);',
    '  vec2 e = min(uv, 1.0 - uv) * uOut / uDpr;',
    '  float over = 1.0 - smoothstep(0.0, 3.5, min(e.x, e.y));',
    '  col += over * (uv.y > 0.5 ? mix(0.05, 0.08, uBezelLight) : -mix(0.02, 0.10, uBezelLight));',
    '  col *= 0.982 + 0.036 * hash12(floor(gl_FragCoord.xy / uDpr));',
    '  vec2 r = s;',
    '  r = mix(r, -r, step(r, vec2(0.0)));',
    '  r = mix(r, 2.0 - r, step(vec2(1.0), r));',
    '  vec3 refl = texture2D(uSrc, r).rgb * 0.10;',
    '  if (uGlowK > 0.0) refl += texture2D(uGlow, r).rgb * 0.9;',
    '  col += refl * ch * ch * mix(0.65, 0.18, uBezelLight);',
    '  col *= 1.0 - mix(0.65, 0.35, uBezelLight) * (1.0 - smoothstep(0.0, 3.0 * uDpr, dist));',
    '  return col;',
    '}',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uOut;',
    '  vec2 p = (uv - uInset) / (1.0 - 2.0 * uInset);',
    '  vec2 s = uCurv > 0.0 ? warp(p) : p;',
    '  vec2 hs = 0.5 * uSrcPx;',
    '  vec2 q = abs(s * uSrcPx - hs) - (hs - vec2(uRadius));',
    '  float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;',
    '  float inside = clamp(0.5 - dist, 0.0, 1.0);',
    '  vec2 t = s;',
    '  vec4 c;',
    '  float e = uDeg.x;',
    '  if (e > 0.0) {',
    '    float ph = uDeg.y;',
    '    t.x += e * (5.0 * uDpr / uSrcPx.x) * sin(s.y * 21.0 + ph * 38.0);',
    '    t.y += e * (1.5 * uDpr / uSrcPx.y) * sin(s.x * 13.0 - ph * 29.0);',
    '    float a = ph * 23.0;',
    '    vec2 f = e * 3.0 * uDpr * vec2(cos(a), sin(a)) / uSrcPx;',
    '    vec4 cg = texture2D(uSrc, t);',
    '    c = vec4(texture2D(uSrc, t + f).r, cg.g, texture2D(uSrc, t - f).b, cg.a);',
    '    c.rgb = min(c.rgb, vec3(c.a));',
    '  } else {',
    '    c = texture2D(uSrc, t);',
    '  }',
    '  if (uBurnK > 0.0) c = max(c, texture2D(uAcc, t) * uBurnK);',
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
    '  if (uScan.x > 0.0) {',
    // flat, the phase follows the source rows (a degauss wobbles them with the picture). With curvature or the bezel it
    // follows the output rows from the screen's top edge: the inset and the warp scale a 3 px source period to about
    // 2.8 output px, which beats with the pixel grid (doubled lines, banding along the curve)
    '    float row = (uCurv > 0.0 || uBezel > 0.0) ? uOut.y - gl_FragCoord.y - uBezelPx : (1.0 - t.y) * uSrcPx.y;',
    '    float sl = 0.5 - 0.5 * cos(6.2831853 * row / uScan.y);',
    '    c.rgb *= (1.0 - uScan.x * sl) * (1.0 + ' + (SCAN_BOOST * 0.5).toFixed(4) + ' * uScan.x);',
    '  }',
    '  if (uVig > 0.0) {',
    '    float v = clamp(16.0 * s.x * s.y * (1.0 - s.x) * (1.0 - s.y), 0.0, 1.0);',
    '    c.rgb *= 1.0 - uVig * (1.0 - pow(v, 0.35));',
    '  }',
    '  if (uNoise.x > 0.0) {',
    '    vec2 cell = floor(gl_FragCoord.xy / uDpr);',
    '    float n = hash12(cell + uNoise.y * vec2(7.13, 3.71));',
    '    c.rgb += vec3(n * uNoise.x * max(0.0, 1.0 - length(uv - 0.5) * 1.3)) * c.a;',
    '  }',
    '  if (uGain < 1.0) {',
    '    vec3 st = c.rgb / max(c.a, 0.0001);',
    '    st = vec3(srgb1(lin1(st.r) * uGain), srgb1(lin1(st.g) * uGain), srgb1(lin1(st.b) * uGain));',
    '    c.rgb = st * c.a;',
    '  }',
    /* the tube's glass, under the case: it darkens into the case at its edge (depth), and a broad soft highlight
       from the same light as the case sits up and to the left, with a faint glare along the top. Static. */
    '  if (uBezel > 0.0) {',
    '    float depth = smoothstep(0.0, 4.0 * uDpr, -dist);',
    '    c.rgb *= mix(0.80, 0.90, uBezelLight) + mix(0.20, 0.10, uBezelLight) * depth;',
    '    vec2 hp = (s - vec2(0.24, 0.80)) * vec2(1.0, 1.7);',
    '    float spec = exp(-dot(hp, hp) * 6.0) * mix(0.11, 0.05, uBezelLight);',
    '    float arc = s.y - 0.95 + 0.30 * (s.x - 0.5) * (s.x - 0.5);',
    '    spec += (1.0 - smoothstep(0.0, 0.035, abs(arc))) * smoothstep(0.08, 0.35, s.x) * (1.0 - smoothstep(0.65, 0.92, s.x)) * mix(0.06, 0.025, uBezelLight);',
    '    c.rgb += spec * (vec3(c.a) - c.rgb) + spec * (1.0 - c.a);',
    '    c.a = max(c.a, spec);',
    '  }',
    '  c.rgb = min(c.rgb * (1.0 - uDim), vec3(c.a));',
    '  vec4 outside = vec4(0.0, 0.0, 0.0, 1.0);',
    '  if (uBezel > 0.0) outside = vec4(bezel(uv, s, dist) * (1.0 - uDim), 1.0);',
    '  gl_FragColor = mix(outside, c, inside);',
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
    if (!p.burnIn.on) this.accValid = false;
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
        gl.uniform1f(pb.u.uDecay, q); gl.uniform1f(pb.u.uAddPrev, any ? 1 : 0);
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
        gl.uniform1f(pd.u.uBurnK, burnK); gl.uniform2f(pd.u.uTexel, 1 / W, 1 / H);
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
    gl.uniform2f(u.uOut, W, H); gl.uniform2f(u.uSrcPx, W, H); gl.uniform1f(u.uDpr, this.dpr);
    gl.uniform1f(u.uCurv, g.curv); gl.uniform2f(u.uInset, g.ix, g.iy); gl.uniform1f(u.uRadius, g.radius);
    gl.uniform1f(u.uBezel, p.bezel.on ? 1 : 0); gl.uniform1f(u.uBezelPx, g.bezelPx); gl.uniform1f(u.uBezelLight, p.bezel.light ? 1 : 0);
    gl.uniform2f(u.uScan, p.scanlines.on ? p.scanlines.strength : 0, p.scanlines.period);
    gl.uniform1f(u.uGlowK, this.glowValid ? p.glow.strength * GLOW_GAIN : 0);
    gl.uniform1f(u.uBurnK, burnK);
    gl.uniform1f(u.uVig, p.vignette.on ? p.vignette.strength : 0);
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
    Timeline: Timeline,
    FLICKER_CAP: FLICKER_CAP,
    AMBIENT_FPS: AMBIENT_FPS,
    DEGAUSS_MS: DEGAUSS_MS,
    BEZEL_CSS: BEZEL_CSS,
    SCREEN_RADIUS_CSS: SCREEN_RADIUS_CSS,
    BURN_GHOST: BURN_GHOST,
    GLOW_GAIN: GLOW_GAIN,
    LIMITS: LIMITS
  };
})();
