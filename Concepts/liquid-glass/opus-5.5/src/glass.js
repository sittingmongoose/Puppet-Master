/* Liquid Glass v3: the glass engine and its motion (pm7-liquid-glass, Opus 5.5; v2 2026-10-11, v3 2026-10-13).
 *
 * v1 was rejected ("it does not at all read as glass"): tinted fills over one blurred wallpaper. v2 is optical: sheets
 * carry baked optics (a frost of the real wallpaper and a refracted rim ring computed from a convex squircle bevel and
 * Snell's law, n = 1.5), menus blur live, and lenses refract live through an SVG feDisplacementMap. Over that sit a
 * specular rim, lit from the top left with a fainter return at the bottom right, and a shine layer that brightens the
 * rim nearest the pointer.
 * v3 (Jared, 2026-10-13: "reads a little glitchy and chromatic aberration rather than magnification/lenses
 * effect/reflections"; diagnosed from 60 fps GPU films): lenses no longer split colour or magnify through the map; the
 * labels under a lens magnify themselves as vector text, keyframed from the lens's path; the lens leaves on the press
 * instead of after the app's click work; targets are measured without transforms; the hover bead only flows between
 * neighbours; strip items lose the white press bloom.
 * Motion runs on damped springs:
 *   - lenses glide (barely overshooting), stretch with their speed, wobble once as they land, and can be scrubbed;
 *   - menus morph out of the control that opened them;
 *   - glass materializes by ramping its refraction rather than fading;
 *   - presses flex the glass.
 * The CPU path (no GPU) draws the same shapes and rims as frosted glass without refraction.
 * Switches on <html>: data-lg="on" (Glass always uses Liquid Glass), data-lg-tier gpu|cpu, data-lg-wall <id>.
 * URL: ?lgtier=cpu ?lgwall=. The retired ?lg=off flag is ignored. Test hook: window.PM_LG.
 */
(function () {
  'use strict';
  if (window.PM_LG) return;
  var root = document.documentElement, q = new URLSearchParams(location.search);
  var SVGNS = 'http://www.w3.org/2000/svg';
  root.setAttribute('data-lg', 'on');
  /* the wallpaper is applied by applyWall() (below) from the saved choice or ?lgwall= */

  function isGlass() { return root.getAttribute('data-lg') === 'on' && /^glass/.test(root.getAttribute('data-theme') || ''); }
  /* the switcher in another look (Jared #22, 2026-10-15): Glass's tabs, segments and list selections are one component
     (the strips below and their lenses), drawn from --pm-switch-* tokens (glass.css section 12). A look that sets
     --pm-switch: lens adopts it; its strips and lenses then run here, without Glass's sheets, frost or refraction.
     Read when the look changes (one style read), and mirrored on <html data-pm-switch> for the CSS.
     Q16 (2026-10-15), three more tokens, read in the same style read and never in Glass:
     - --pm-switch-layer: under draws each lens inside its strip, over the track and under the labels, so a look whose
       chosen item is an opaque chip with its label inverted (Retro's reverse video, NieR's ink bar) can adopt the
       component; mirrored on <html data-pm-switch-layer>.
     - --pm-switch-swell (0..1): how much of Glass's label swell the look keeps (the chosen label's resting size and its
       size under a moving lens). Unset is 1.
     - --pm-switch-liquid (0..1): how much of the drop's stretch, lift and landing wobble the look keeps. Unset is 1. */
  /* - --pm-switch-motion (glide | step | cut): how the chip moves to a new choice. glide (unset) is the spring above;
       step is two hard jumps on a 33 ms tick (the tab half way, then its own), with no easing; cut puts it there at
       once. Retro steps
       and NieR Mode cuts (Jared 2026-10-16; F3-438: joined highlights step in Retro and NieR; F3-621). */
  var switchLook = false, switchUnder = false, switchSwell = 1, switchLiquid = 1, switchMotion = 'glide';
  function tokenNumber(v, dflt) { var n = parseFloat(v); return isFinite(n) ? Math.max(0, Math.min(1, n)) : dflt; }
  function readSwitch() {
    var on = false, under = false, swell = 1, liquid = 1, motion = 'glide';
    if (!isGlass()) {
      try {
        var cs = getComputedStyle(root); on = cs.getPropertyValue('--pm-switch').trim() === 'lens';
        if (on) {
          under = cs.getPropertyValue('--pm-switch-layer').trim() === 'under';
          swell = tokenNumber(cs.getPropertyValue('--pm-switch-swell'), 1); liquid = tokenNumber(cs.getPropertyValue('--pm-switch-liquid'), 1);
          motion = cs.getPropertyValue('--pm-switch-motion').trim(); if (motion !== 'step' && motion !== 'cut') motion = 'glide';
        }
      } catch (e) {}
    }
    switchMotion = motion;
    var relayer = under !== switchUnder;
    switchLook = on; switchUnder = under; switchSwell = swell; switchLiquid = liquid;
    if (on) { if (root.getAttribute('data-pm-switch') !== 'lens') root.setAttribute('data-pm-switch', 'lens'); }
    else if (root.hasAttribute('data-pm-switch')) root.removeAttribute('data-pm-switch');
    if (under) { if (root.getAttribute('data-pm-switch-layer') !== 'under') root.setAttribute('data-pm-switch-layer', 'under'); }
    else if (root.hasAttribute('data-pm-switch-layer')) root.removeAttribute('data-pm-switch-layer');
    /* every lens lives in the layer of the mode it was made in: a change of mode makes them again in the other */
    if (relayer && typeof relayerLenses === 'function') relayerLenses();
  }
  function switchOn() { return isGlass() || switchLook; }
  function gpu() { return root.getAttribute('data-lg-tier') !== 'cpu'; }
  function reduced() { return root.getAttribute('data-motion') === 'reduced' || root.getAttribute('data-reduced-motion') === '1' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function el(tag, attrs) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); return e; }
  function visible(e) { if (!e || !e.isConnected) return false; var r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden'; }
  /* Usage's room change (<html data-pmu-moment>, its 15-film.js) builds the new room in 8 ms slices, one a frame, for
     about a second. Glass used to read the board after every slice, which forced the half-built room's style and
     layout again each time (review r3 R2, 2026-10-15: eight clicks a third of a second apart cost 2.9 s more main thread
     than Basic, and the board fell up to a second behind the clicks). While a moment runs, nothing in the board area is
     synced. A new card is marked as a card where it is inserted (a write, styled in the same pass as the insertion),
     sizeWatch mounts it from its callback (after layout, so every read is free), its rim bakes in idle time, and the
     board is checked once when the moment ends. */
  var BOARD_AREA = '#panel-usage .pmu-scroll', BOARD_CARD = '#panel-usage .pmu-board > .pmu-card', boardStale = false;
  function boardMoment() { return root.hasAttribute('data-pmu-moment') && isGlass(); }

  (function tier() {
    var forced = q.get('lgtier'); if (forced === 'cpu' || forced === 'gpu') { root.setAttribute('data-lg-tier', forced); return; }
    try {
      var g = document.createElement('canvas').getContext('webgl'), x = g && g.getExtension('WEBGL_debug_renderer_info');
      var r = x ? String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)) : '';
      root.setAttribute('data-lg-tier', !g || /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r) ? 'cpu' : 'gpu');
    } catch (e) { root.setAttribute('data-lg-tier', 'cpu'); }
  })();

  /* ---- optics: maps ------------------------------------------------------------------------------------------------
     For a rounded rectangle W x H with corner radius R: the signed distance d to its edge (inside positive) and the
     outward normal n. Inside the bevel (d < B) the surface rises along a convex squircle, h(t) = (1 - (1 - t)^4)^(1/4),
     t = d / B. A ray straight down through a surface tilted by a = atan(h' * T / B) refracts to b = asin(sin a / 1.5) and
     lands T * tan(a - b) further in: the pixel there samples the background that far toward the centre. A lens adds
     magnification across its whole face, sampling at c + (p - c) / m. Encoded for feDisplacementMap: R = x, G = y,
     128 = no shift, scale = twice the largest shift. The specular map is the rim lit by L = (-0.55, -0.83), a sharp
     line in the outer 1.5 px and a soft glow across the bevel, plus a fainter exit light on the far side. The rim map
     (alpha only) is where the pointer's shine may show. */
  var mapCache = new Map(), mapBytes = 0, MAP_BYTES = 64 * 1024 * 1024, MAP_COUNT = 80;
  function cachedMap(key) {
    var rec = mapCache.get(key); if (!rec) return null;
    mapCache.delete(key); mapCache.set(key, rec); return rec.value;
  }
  function keepMap(key, value) {
    var bytes = 0;
    ['disp', 'spec', 'rim'].forEach(function (name) { if (value[name]) bytes += value[name].length * 2; });
    if (value.maps) value.maps.forEach(function (url) { bytes += url.length * 2; });
    if (value.raw) Object.keys(value.raw).forEach(function (name) { bytes += value.raw[name].byteLength || 0; });
    if (bytes > MAP_BYTES) return value;
    while (mapCache.size && (mapBytes + bytes > MAP_BYTES || mapCache.size >= MAP_COUNT)) {
      var oldest = mapCache.keys().next().value; mapBytes -= mapCache.get(oldest).bytes; mapCache.delete(oldest);
    }
    mapCache.set(key, { value: value, bytes: bytes }); mapBytes += bytes; return value;
  }
  function sdf(px, py, hx, hy, R, out) {
    var qx = Math.abs(px) - hx, qy = Math.abs(py) - hy, d, nx, ny;
    if (qx > 0 && qy > 0) { var l = Math.hypot(qx, qy); d = R - l; nx = Math.sign(px) * qx / l; ny = Math.sign(py) * qy / l; }
    else if (qx > qy) { d = R - qx; nx = Math.sign(px) || 1; ny = 0; } else { d = R - qy; nx = 0; ny = Math.sign(py) || 1; }
    out = out || [0, 0, 0]; out[0] = d; out[1] = nx; out[2] = ny; return out;
  }
  function profile(t) { return Math.pow(1 - Math.pow(1 - t, 4), 0.25); }
  /* the maps of one rounded rectangle as plain numbers, with no DOM: buildMaps below encodes them for the page, and the
     rim bake worker runs this same function from its source text (bakeWorker) */
  function mapsCore(W, H, R, B, T, mag, lightK, ring) {
    var n = W * H, dx = new Float32Array(n), dy = new Float32Array(n), sp = new Float32Array(n), edge = new Float32Array(n), active = [];
    var hx = W / 2 - R, hy = H / 2 - R, cx = W / 2, cy = H / 2, L0 = -0.55, L1 = -0.83, max = 0;
    var scratch = [0, 0, 0], bends = new Map(), lights = new Map();
    /* only the bevel band can hold a value: a pixel more than max(B, R) + 1.5 px inside both straight edges is at least
       B deep in the shape, where (at mag 1) there is no bend, no light and no edge, so its maps stay zero and that face is
       skipped. Walking every pixel of a panel's map took most of a 467 ms bake frame on the P1000 (2026-10-16). */
    var M = Math.ceil(Math.max(B, R)) + 2, band = mag <= 1 && W - M > M;
    for (var y = 0; y < H; y++) for (var x = 0, mid = band && y >= M && y < H - M; x < W; x++) {
      if (mid && x === M) x = W - M;
      var i = y * W + x, px = x + 0.5 - cx, py = y + 0.5 - cy, s = sdf(px, py, hx, hy, R, scratch), d = s[0];
      if (d <= 0) continue;
      /* only the outer few pixels stay sharp: text near an edge must sit on frost, never on raw refracted lines */
      var sharp = Math.min(ring[0], B * 0.3), soft = Math.min(ring[1], B * 0.8), u = Math.min(1, Math.max(0, (d - sharp) / (soft - sharp)));
      edge[i] = 1 - u * u * (3 - 2 * u);
      if (edge[i] >= 0.004) active.push(i);
      var vx = 0, vy = 0;
      if (mag > 1) { vx = -px * (1 - 1 / mag); vy = -py * (1 - 1 / mag); }
      if (d < B) {
        var bend = bends.get(d);
        if (!bend) {
          var t = d / B, e = 0.002, slope = (profile(Math.min(1, t + e)) - profile(Math.max(0, t - e))) / (2 * e) * (T / B);
          var a = Math.atan(slope), b = Math.asin(Math.sin(a) / 1.5), m = T * Math.tan(a - b);
          /* keep the bend physical for any size: content is pulled in from at most half a bevel deeper than the rim
             band, and never from past the centre (a small lens would otherwise mirror its label) */
          m = Math.max(0, Math.min(m, 1.55 * B - d, (mag > 1 ? 0.45 : 0.78) * (Math.min(W, H) / 2 - d)));
          bend = [m, Math.exp(-d / 1.25), Math.exp(-d / Math.min(6, B * 0.22)) * 0.10]; bends.set(d, bend);
        }
        vx -= s[1] * bend[0]; vy -= s[2] * bend[0];
        var face = s[1] * L0 + s[2] * L1, lighting = lights.get(face);
        if (lighting === undefined) { lighting = Math.pow(Math.max(0, face), 1.4) + Math.pow(Math.max(0, -face), 2.0) * 0.62; lights.set(face, lighting); }
        var line = bend[1], glow = bend[2];
        sp[i] = Math.min(1, lighting * (line + glow) * lightK + line * 0.10);
      }
      dx[i] = vx; dy[i] = vy; var mm = Math.max(Math.abs(vx), Math.abs(vy)); if (mm > max) max = mm;
    }
    return { n: n, dx: dx, dy: dy, sp: sp, edge: edge, active: active, max: max };
  }
  /* the rim bake reads the maps at the active pixels only, so only those are kept (raw.dx[j] is pixel raw.active[j]): a
     panel's maps are a few hundred KB instead of 16 bytes a pixel, and the cache keeps every sheet size on screen */
  function compactMaps(core) {
    var A = new Uint32Array(core.active), dx = new Float32Array(A.length), dy = new Float32Array(A.length), edge = new Float32Array(A.length);
    for (var j = 0; j < A.length; j++) { dx[j] = core.dx[A[j]]; dy[j] = core.dy[A[j]]; edge[j] = core.edge[A[j]]; }
    return { dx: dx, dy: dy, edge: edge, active: A };
  }
  /* the specular map's pixels: white, its light in the alpha */
  function specPixels(D, sp, n) { for (var i = 0; i < n; i++) { var o = i * 4; D[o] = D[o + 1] = D[o + 2] = 255; D[o + 3] = Math.round(sp[i] * 255); } }
  function buildMaps(W, H, R, B, T, mag, lightK, ring, specOnly) {
    ring = ring || [3, 8];
    var key = [W, H, R, B, T, mag, lightK, ring, !!specOnly].join('|'), hit = cachedMap(key);
    if (hit) return hit;
    var core = mapsCore(W, H, R, B, T, mag, lightK, ring), n = core.n, dx = core.dx, dy = core.dy, max = core.max;
    /* the maps are encoded on a CPU canvas: on a GPU canvas toDataURL read back synchronously behind the page's own raster
       (Jared #12: 363 ms of toDataURL in one Glass entry on a P1000) */
    var canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d', { willReadFrequently: true }), pixels = ctx.createImageData(W, H);
    function img(fill) { fill(pixels.data); ctx.putImageData(pixels, 0, 0); return canvas.toDataURL('image/png'); }
    var k = max || 1;
    var res = {
      scale: max * 2, max: max, raw: compactMaps(core),
      disp: specOnly ? null : img(function (D) { for (var i = 0; i < n; i++) { var o = i * 4; D[o] = 128 + Math.round(dx[i] / k * 127); D[o + 1] = 128 + Math.round(dy[i] / k * 127); D[o + 2] = 128; D[o + 3] = 255; } }),
      spec: img(function (D) { specPixels(D, core.sp, n); }),
    };
    return keepMap(key, res);
  }

  /* ---- optics: filters ------------------------------------------------------------------------------------------ */
  var defs = null, fid = 0, filterByKey = new Map();
  function ensureDefs() {
    if (defs && defs.isConnected) return defs;
    var svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; svg.id = 'lg-optics';
    defs = document.createElementNS(SVGNS, 'defs'); svg.appendChild(defs); document.body.appendChild(svg); return defs;
  }
  /* ---- the lens -----------------------------------------------------------------------------------------------------
     Live refraction is kept for lenses only (the chosen tab, the hover bead, a switch's knob while held): small, and
     floating over labels that change under them. Chrome re-runs an SVG backdrop filter every frame, so the sheets bake
     theirs instead (below).
     Jared, 2026-10-13: the lens read as chromatic aberration and glitch, not as magnification and reflection. Seen in
     60 fps films: a red/blue split, letters torn where the bevel crossed them, and labels magnified by the displacement
     map, which Chrome samples nearest-neighbour, so magnified text came out blocky. So the lens is now three plain
     things:
       - its bevel bends what is under it by at most 1.4 px, one map for all channels (no colour split),
         softened by a sub-pixel blur inside the rim only, so a passing letter bends smoothly instead of tearing;
       - the magnification is done by the labels themselves, scaled as vector text about the lens's centre (see travel),
         so magnified text stays crisp;
       - the light is a crisp rim line lit from the top left with a fainter return at the bottom right, a soft Fresnel
         band, and a caustic: light focused through the drop onto its inner bottom edge.
     mag > 1 is kept for the switch knob, which lenses a plain track and no text. */
  function buildLensMaps(W, H, R, B, T, mag, lightK) {
    var key = ['lens2', W, H, R, B, T, mag, lightK].join('|'), hit = cachedMap(key);
    if (hit) return hit;
    var n = W * H, dx = new Float32Array(n), dy = new Float32Array(n);
    var rimA = new Float32Array(n), sp = new Float32Array(n), hx = W / 2 - R, hy = H / 2 - R, cx = W / 2, cy = H / 2, L0 = -0.55, L1 = -0.83, max = 0;
    var cap = Math.min(1.4, B * 0.45);
    var scratch = [0, 0, 0], bends = new Map(), lights = new Map();
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var i = y * W + x, px = x + 0.5 - cx, py = y + 0.5 - cy, s0 = sdf(px, py, hx, hy, R, scratch), d = s0[0];
      if (d <= 0) continue;
      var vx = mag > 1 ? -px * (1 - 1 / mag) : 0, vy = mag > 1 ? -py * (1 - 1 / mag) : 0;
      if (d < B) {
        var bend = bends.get(d);
        if (!bend) {
          var t = d / B, e = 0.002, slope = (profile(Math.min(1, t + e)) - profile(Math.max(0, t - e))) / (2 * e) * (T / B);
          var a = Math.atan(slope), b = Math.asin(Math.sin(a) / 1.5), m = Math.max(0, Math.min(T * Math.tan(a - b), cap, 0.3 * (Math.min(W, H) / 2 - d)));
          bend = [m, Math.exp(-d / 0.85), Math.exp(-d / Math.max(1.5, B * 0.55)) * 0.12]; bends.set(d, bend);
        }
        vx -= s0[1] * bend[0]; vy -= s0[2] * bend[0];
        var face = s0[1] * L0 + s0[2] * L1, lighting = lights.get(face);
        if (lighting === undefined) { lighting = Math.pow(Math.max(0, face), 1.25) + Math.pow(Math.max(0, -face), 1.7) * 0.55; lights.set(face, lighting); }
        var line = bend[1], glow = bend[2];
        sp[i] = lighting * (line * 0.9 + glow) * lightK + line * 0.08;
      }
      /* the caustic: a soft bright band just inside the lower rim */
      if (s0[2] > 0.2) sp[i] += 0.16 * lightK * s0[2] * Math.exp(-Math.pow(d - Math.min(3, B * 0.7), 2) / 2.2);
      sp[i] = Math.min(1, sp[i]);
      var u = Math.min(1, Math.max(0, (d - 0.5) / Math.max(1.5, B))); rimA[i] = 1 - u * u * (3 - 2 * u);
      dx[i] = vx; dy[i] = vy; var mm = Math.max(Math.abs(vx), Math.abs(vy)); if (mm > max) max = mm;
    }
    var canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    /* a CPU canvas, as in buildMaps */
    var ctx = canvas.getContext('2d', { willReadFrequently: true }), pixels = ctx.createImageData(W, H);
    function img(fill) { fill(pixels.data); ctx.putImageData(pixels, 0, 0); return canvas.toDataURL('image/png'); }
    var k = max || 1;
    var res = {
      scale: max * 2,
      map: img(function (D) { for (var i = 0; i < n; i++) { var o = i * 4; D[o] = 128 + Math.round(dx[i] / k * 127); D[o + 1] = 128 + Math.round(dy[i] / k * 127); D[o + 2] = 128; D[o + 3] = 255; } }),
      rim: img(function (D) { for (var i = 0; i < n; i++) { var o = i * 4; D[o] = D[o + 1] = D[o + 2] = 255; D[o + 3] = Math.round(rimA[i] * 255); } }),
      spec: img(function (D) { for (var i = 0; i < n; i++) { var o = i * 4; D[o] = D[o + 1] = D[o + 2] = 255; D[o + 3] = Math.round(sp[i] * 255); } }),
    };
    return keepMap(key, res);
  }
  /* one filter per lens size and kind, keyed by what built it (never by an image's length) */
  function lensFilter(W, H, m, rimBlur, id, key) {
    key = id || key;
    if (filterByKey.has(key)) {
      var cached = filterByKey.get(key);
      if (!cached.el.isConnected) ensureDefs().appendChild(cached.el);
      filterByKey.delete(key); filterByKey.set(key, cached); return cached;
    }
    var f = document.createElementNS(SVGNS, 'filter'); id = id || ('lgf' + (fid++));
    f.setAttribute('id', id); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', W); f.setAttribute('height', H);
    f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('primitiveUnits', 'userSpaceOnUse'); f.setAttribute('color-interpolation-filters', 'sRGB');
    var h = '<feImage href="' + m.map + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none" result="M"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="M" scale="' + m.scale.toFixed(2) + '" xChannelSelector="R" yChannelSelector="G" result="D"/>';
    if (rimBlur > 0) {
      h += '<feGaussianBlur in="D" stdDeviation="' + rimBlur + '" result="Db"/>' +
        '<feImage href="' + m.rim + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none" result="E"/>' +
        '<feComposite in="Db" in2="E" operator="in" result="X"/><feComposite in="D" in2="E" operator="out" result="Y"/>' +
        '<feComposite in="X" in2="Y" operator="arithmetic" k2="1" k3="1"/>';
    }
    f.innerHTML = h;
    ensureDefs().appendChild(f);
    var rec = { id: id, el: f, scale: m.scale };
    filterByKey.set(key, rec);
    return rec;
  }
  /* the filter for a lens kind at a size: built once, shared by every lens of that kind and size */
  function lensFilterFor(kind, W, H, R) {
    var k = KINDS[kind], B = Math.max(2, Math.min(k.bezel, Math.min(W, H) / 2 - 1)), T = Math.min(k.thick, B * 2.4);
    var m = buildLensMaps(W, H, Math.round(R), Math.round(B), Math.round(T), k.mag, k.light);
    return { m: m, f: lensFilter(W, H, m, k.rimBlur, null, [kind, W, H, Math.round(R)].join('|')) };
  }
  /* Active filters stay alive; an inactive pool keeps the filters of every item size of the strips (prepared before
     the lens needs them, see syncStrip), so a move never waits for a new map to decode. */
  function pruneLensFilters() {
    var used = new Set(), idle = [];
    glassSet.forEach(function (e) { if (e.isConnected && e.__lgF) used.add(e.__lgF); });
    filterByKey.forEach(function (f, key) { if (f.id !== 'lg-knob' && !used.has(f)) idle.push(key); });
    for (var i = 0; i < idle.length - 48; i++) { var key = idle[i], f = filterByKey.get(key); f.el.remove(); filterByKey.delete(key); }
  }

  /* ---- glass kinds -------------------------------------------------------------------------------------------------
     bezel and thickness in px; blur before the refraction; ca = chromatic split at the rim; mag = lens magnification;
     light = specular strength. Panels and cards are frosted so text on them reads; controls are clearer; lenses are clear
     and magnify. */
  var KINDS = {
    panel:   { bezel: 32, thick: 80, frost: 'heavy', sat: 1.65, ca: 0.05, mag: 1,    light: 1.05, bake: true, ring: [3, 8] },
    card:    { bezel: 28, thick: 70, frost: 'heavy', sat: 1.65, ca: 0.05, mag: 1,    light: 1.0,  bake: true, ring: [2, 5] },
    bar:     { bezel: 14, thick: 34, frost: 'light', sat: 1.6,  ca: 0.04, mag: 1,    light: 0.95, bake: true, ring: [2, 5] },
    /* lenses: no colour split and no magnifying map (the labels magnify themselves); magRest is the chosen label's
       size under the lens at rest, magLift its size while the lens is lifted and moving */
    lens:    { bezel: 4,  thick: 10, sat: 1.1,  mag: 1, light: 1.15, rimBlur: 0.6, lens: true, magRest: 1.04, magLift: 1.13 },
    lensRow: { bezel: 5,  thick: 11, sat: 1.1,  mag: 1, light: 1.05, rimBlur: 0.6, lens: true, magRest: 1,    magLift: 1.03 },
    lensIcon:{ bezel: 5,  thick: 12, sat: 1.12, mag: 1, light: 1.15, rimBlur: 0.6, lens: true, magRest: 1.08, magLift: 1.2 },
    bead:    { bezel: 5,  thick: 12, sat: 1.1,  mag: 1, light: 1.05, rimBlur: 0.6, lens: true },
    menu:    { bezel: 18, thick: 56, blur: 30, sat: 1.5, ca: 0,    mag: 1,    light: 0.95, css: true },
  };
  var glassSet = new Set();
  /* Index DOM ancestry, without measuring overflow: a captured scroll identifies exactly the sheets and strips it
     can move. Reindex on refresh as app code may reparent a still-connected surface. */
  var scrollSheets = new Map(), scrollStrips = new Map(), sheetAncestors = new Map(), stripAncestors = new Map();
  function forgetAncestors(e, index, reverse) {
    var old = reverse.get(e); if (!old) return;
    old.forEach(function (a) { var set = index.get(a); if (set) { set.delete(e); if (!set.size) index.delete(a); } }); reverse.delete(e);
  }
  function indexAncestors(e, index, reverse) {
    var ancestors = [], old = reverse.get(e);
    for (var a = e.parentElement; a; a = a.parentElement) ancestors.push(a);
    if (old && old.length === ancestors.length && old.every(function (a, i) { return a === ancestors[i]; })) return;
    forgetAncestors(e, index, reverse); reverse.set(e, ancestors);
    ancestors.forEach(function (a) { var set = index.get(a); if (!set) index.set(a, set = new Set()); set.add(e); });
  }
  /* every glass element's optics are sized to it: when the board or a panel resizes one, it is measured again */
  var sizeWatch = window.ResizeObserver ? new ResizeObserver(function (entries) {
    if (!isGlass()) return;
    var targets = new Map(); entries.forEach(function (en) {
      var e = en.target, k = e.getAttribute('data-lg-kind');
      if (!k || !e.isConnected) return;
      targets.set(e, k);
      /* Size changes can move siblings without resizing them. Their positions belong to the same settle scope. */
      var box = en.borderBoxSize && en.borderBoxSize[0];
      if (KINDS[k] && KINDS[k].bake && e.__lgSize && (!box || e.__lgSize !== Math.round(box.inlineSize) + 'x' + Math.round(box.blockSize))) { dirtyScope(e.parentElement); lazySync(false); }
    });
    mountMeasured(targets);
  }) : null;
  function radiusOf(e, W, H) { var r = parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0; return Math.max(0, Math.min(r, W / 2 - 0.5, H / 2 - 0.5)); }
  /* ---- baked optics -------------------------------------------------------------------------------------------------
     A sheet floats over the wallpaper only, and the wallpaper is a known still image. So its optics are computed from
     that image instead of from a live backdrop:
       - the frosted core: one shared copy of the wallpaper, blurred and saturated at the window's size, painted as a
         fixed background so it lines up with the wallpaper behind it;
       - the rim: the wallpaper under the sheet's bevel, refracted through the same squircle and Snell map as a lens,
         sharp, with a slight red-blue split; a ring image, transparent inside.
     Both are redrawn only when the sheet moves or resizes, or the look or wallpaper changes. They cost nothing per frame
     and draw the same with or without a GPU. */
  var wallUrl = '', wallSources = new Map(), wallSourceUrls = new Map(), wallSourceKey = null, wallSourceUrl = '', wallSourceId = 0;
  /* encoded frost pairs are kept, least recently used first out, within FROST_BYTES only: a pair is 40-430 KB at
     1920 x 1080, so every choice the Settings gallery shows fits, and the gallery warms them while the page is idle (B3,
     2026-10-16). Each kept pair is decoded once it is made (decodeFrost), so a commit swaps images already decoded: with
     encoded data alone, the sheets showed the old frost for about 85 ms after the commit while the new one decoded. */
  var frosts = {}, frostKey = '', frostWallUrl = '', frostCache = new Map(), frostBytes = 0, frostJobs = new Map(), FROST_BYTES = 32 * 1024 * 1024;
  function decodeFrost(rec) {
    rec.imgs = [];
    rec.decoded = Promise.all(Object.keys(rec.urls).map(function (n) {
      var im = new Image(); im.decoding = 'async'; im.src = rec.urls[n]; rec.imgs.push(im);
      return im.decode ? im.decode().catch(function () {}) : Promise.resolve();
    }));
    return rec.decoded;
  }
  function whenDecoded(rec, fn) { if (!rec || !rec.urls) { fn(); return; } (rec.decoded || decodeFrost(rec)).then(fn, fn); }
  /* decoded pairs cost about 1.8 MB each at 1080p (7.4 MB at 4K). The pair on the sheets and the prints the gallery
     retains (below) keep theirs. Of the rest, the FROST_DECODED most recent and every pair prepared or committed in the
     last FROST_RECENT ms keep theirs too (B3: a pick decoded again cost 62 ms on Nas1), within FROST_DECODED_BYTES, the
     least recently used let go first (landing review GF-1). The others decode again when they are used (GL-4); a timer
     lets the recent ones go once they are no longer recent. */
  var FROST_DECODED = 8, FROST_RECENT = 60000, FROST_DECODED_BYTES = 64 * 1024 * 1024, trimT = 0;
  function frostUsed(rec) { rec.used = performance.now(); }
  /* the prints the Settings gallery shows or is about to (PM_LG.retainVisible(urls), Settings' contract, B3): their pairs
     keep their decoded images while they are in that set, whatever their age; a print that leaves the set starts the
     60 s release from then. A retained pair that has lost its decoded images decodes again in idle time (off the main
     thread); nothing is baked or decoded in the call itself. At most RETAIN_MAX prints. */
  var retained = new Set(), RETAIN_MAX = 64, RETAIN_BYTES = 128 * 1024 * 1024, retainIdle = 0, vpKey = '';
  /* the retained prints' pairs for the current window size, within RETAIN_BYTES of decoded images, the most recently
     used first (landing review GR-1); a retained print past that budget, or a pair made for another window size,
     follows the tail's rules. The pair on the sheets is kept apart from both. */
  function retainedPairs() {
    var list = [], out = new Set(), sum = 0;
    retained.forEach(function (u) { var r = frostCache.get(u + ':' + vpKey); if (r && r.urls !== frosts) list.push(r); });
    list.sort(function (a, b) { return (b.used || 0) - (a.used || 0); });
    list.forEach(function (r) { if ((sum += r.dbytes || 0) <= RETAIN_BYTES) out.add(r); });
    return out;
  }
  function retainVisible(urls) {
    var next = new Set(), now = performance.now();
    (Array.isArray(urls) ? urls : []).forEach(function (u) { if (typeof u === 'string' && u && next.size < RETAIN_MAX) next.add(u); });
    frostCache.forEach(function (r) { if (retained.has(r.wall) && !next.has(r.wall)) r.used = now; });
    retained = next;
    frostLog('retain', '', null, { n: retained.size });
    trimDecoded();
    if (!retainIdle && retained.size && window.requestIdleCallback) retainIdle = requestIdleCallback(function () {
      retainIdle = 0;
      retainedPairs().forEach(function (r) { if (!r.decoded) decodeFrost(r); });
    }, { timeout: 2000 });
  }
  /* what each prepare and commit found (B3 attribution for films): a performance mark 'pm-lg-wall:<n>' per event, detail
     { what, wall, ms }, and the last 64 in PM_LG.frostLog(). what: kept (the pair was cached, decoded), kept-decode (cached,
     decoded again), joined (its bake was already running), baked (made now), refused (canRun said no), failed, evicted,
     printed (the print was decoded and the caller told before its frost is made: opts.printed, fade-first), commit (the
     pair was there), commit-miss or retain (detail n: how many prints the gallery keeps decoded). wall names the print by
     its id and mode where Glass knows it. */
  var frostLogBuf = [], markN = 0;
  function wallName(url) {
    var name = ''; wallSourceUrls.forEach(function (u, k) { if (u === url) name = k; });
    return name || (url ? 'url#' + url.length + ':' + url.slice(-16) : '');
  }
  function frostLog(what, url, t0, extra) {
    var d = { what: what, wall: wallName(url), ms: t0 == null ? 0 : Math.round(performance.now() - t0), t: Math.round(performance.now()) };
    if (extra) for (var k in extra) d[k] = extra[k];
    frostLogBuf.push(d); if (frostLogBuf.length > 64) frostLogBuf.shift();
    /* one mark per event, 'pm-lg-wall:<n>', and only the last 64 stay in the page's timeline (landing review GF-3) */
    try { markN++; performance.mark('pm-lg-wall:' + markN, { detail: d }); if (markN > 64) performance.clearMarks('pm-lg-wall:' + (markN - 64)); } catch (e) {}
  }
  function trimDecoded() {
    var keys = Array.from(frostCache.keys()), now = performance.now(), next = 0, tail = [], sum = 0, kept = retainedPairs();
    clearTimeout(trimT); trimT = 0;
    keys.forEach(function (k, i) {
      var r = frostCache.get(k);
      if (!r.decoded || r.urls === frosts || kept.has(r) || (xf && r.urls === xf.frosts)) return;
      var left = (r.used || 0) + FROST_RECENT - now;
      if (i < keys.length - FROST_DECODED && left <= 0) { r.imgs = null; r.decoded = null; return; }
      if (left > 0) next = next ? Math.min(next, left) : left;
      tail.push(r);
    });
    tail.sort(function (a, b) { return (b.used || 0) - (a.used || 0); });
    tail.forEach(function (r) { sum += r.dbytes || 0; if (sum > FROST_DECODED_BYTES) { r.imgs = null; r.decoded = null; } });
    if (next) trimT = setTimeout(trimDecoded, next + 50);
  }
  var bakeQ = new Map(), bakeT = 0, bakeFrame = 0, bakeIdle = 0, bakeFlight = null, bakeEpoch = 0, bakeAvg = 8;
  function currentWallUrl(refresh) {
    /* The body's selected image is deliberately not on html. Resolve an immutable catalog source once per id/mode,
       using the gallery's prepared cache when present. Empty misses are retried because a lab host can add its sheet
       after startup. No computed-style read or large URL serialization occurs on a prepared wallpaper commit. */
    var id = root.getAttribute('data-lg-wall') || 'ribbons';
    var mode = /-light$/.test(root.getAttribute('data-theme') || '') ? 'light' : 'dark', key = id + '-' + mode;
    if (!refresh && key === wallSourceKey && wallSourceUrl) return wallSourceUrl;
    var u = !refresh && wallSourceUrls.get(key);
    if (!u && window.PM_WALLPAPERS && PM_WALLPAPERS.sourceUrl) u = PM_WALLPAPERS.sourceUrl(id, mode);
    if (!u) {
      var v = getComputedStyle(root).getPropertyValue('--lg-wall-' + key) || '', m = v.match(/url\(["']?(.*?)["']?\)\s*$/);
      u = m ? m[1] : '';
    }
    if (u) wallSourceUrls.set(key, u);
    if (u !== wallSourceUrl) { wallSourceUrl = u; wallSourceId++; }
    wallSourceKey = key; return u;
  }
  function withWall(cb, sourceUrl) {
    var u = sourceUrl || currentWallUrl(); if (!u) { cb(null); return; }
    var rec = wallSources.get(u);
    if (rec) {
      wallSources.delete(u); wallSources.set(u, rec);
      if (rec.ready) { wallUrl = u; cb(rec.im); } else rec.waiters.push(cb);
      return;
    }
    var im = new Image(); im.decoding = 'async'; im.__lgWallUrl = u;
    rec = { im: im, ready: false, waiters: [cb] }; wallSources.set(u, rec);
    function finish(ok) {
      im.onload = im.onerror = null; rec.ready = ok;
      if (!ok) wallSources.delete(u);
      else {
        if (u === currentWallUrl()) wallUrl = u;
        /* Two decoded stills are enough for returning to the previous look; pending loads stay single-flight. */
        /* the print on screen stays among them (landing review GL-4) */
        var ready = Array.from(wallSources.keys()).filter(function (key) { return wallSources.get(key).ready && key !== wallSourceUrl; });
        while (ready.length > (wallSources.has(wallSourceUrl) ? 1 : 2)) wallSources.delete(ready.shift());
      }
      var waiters = rec.waiters; rec.waiters = []; waiters.forEach(function (done) { done(ok ? im : null); });
    }
    /* decoded off the main thread before anything draws it (the first drawImage of an undecoded 2560 px print decoded it
       in the frost's task) */
    im.onload = function () {
      var ok = im.naturalWidth > 0 && im.naturalHeight > 0;
      if (ok && typeof im.decode === 'function') im.decode().then(function () { finish(true); }, function () { finish(true); }); else finish(ok);
    };
    im.onerror = function () { finish(false); }; im.src = u;
  }
  /* where an element sits when nothing is moving it: its layout position from the offset chain, which ignores
     transforms (a board sliding in, a card leaning toward the pointer, a lifted card). The frost and the rim are
     sampled from the wallpaper at that position, so a sheet carries its own glass with it while it moves and nothing
     re-anchors or pops when it lands. */
  function layoutPos(e, cache) {
    function offsets(n) {
      var v = cache && cache.get(n); if (v) return v;
      v = { left: n.offsetLeft, top: n.offsetTop, parent: n.offsetParent, x: n.scrollLeft, y: n.scrollTop, cl: n.clientLeft, ct: n.clientTop };
      if (cache) cache.set(n, v); return v;
    }
    var x = 0, y = 0, n = e;
    while (n && n !== document.body && n !== document.documentElement) {
      var o = offsets(n); x += o.left; y += o.top;
      var p = o.parent;
      for (var a = n.parentElement; a && a !== p; a = a.parentElement) { var ao = offsets(a); x -= ao.x; y -= ao.y; }
      if (!p) break;
      var po = offsets(p); x += po.cl - po.x; y += po.ct - po.y;
      n = p;
    }
    return { x: x, y: y };
  }
  function anchor(e, lp) {
    lp = lp || layoutPos(e); var fx = Math.round(-lp.x) + 'px', fy = Math.round(-lp.y) + 'px';
    if (e.__lgFx !== fx) { e.__lgFx = fx; e.style.setProperty('--lg-fx', fx); }
    if (e.__lgFy !== fy) { e.__lgFy = fy; e.style.setProperty('--lg-fy', fy); }
    return lp;
  }
  function viewportVars() { vpKey = innerWidth + 'x' + innerHeight; root.style.setProperty('--lg-vw', innerWidth + 'px'); root.style.setProperty('--lg-vh', innerHeight + 'px'); }
  function cover(im) { var vw = innerWidth, vh = innerHeight, sc = Math.max(vw / im.naturalWidth, vh / im.naturalHeight); return { s: sc, ox: (vw - im.naturalWidth * sc) / 2, oy: (vh - im.naturalHeight * sc) / 2, vw: vw, vh: vh }; }
  var FROST = { heavy: { blur: 26, sat: 1.65 }, light: { blur: 14, sat: 1.6 } }, FROST_SCALE = 1 / 3;
  var wallpaperPaintStyle = null;
  function wallpaperPaintRule(index) {
    if (!wallpaperPaintStyle || !wallpaperPaintStyle.isConnected) {
      wallpaperPaintStyle = document.createElement('style'); wallpaperPaintStyle.id = 'lg-frost';
      wallpaperPaintStyle.textContent = 'html[data-lg="on"] :is([data-lg-kind], #pm-o55-onboarding .o55-scrim) {}\nhtml[data-lg="on"] body {}\nhtml[data-lg="on"] [data-lg-xf]::after {}';
      document.head.appendChild(wallpaperPaintStyle);
    }
    return wallpaperPaintStyle.sheet.cssRules[index].style;
  }
  function dropFrost(rec) { rec.imgs = null; rec.decoded = null; Object.keys(rec.urls).forEach(function (name) { URL.revokeObjectURL(rec.urls[name]); }); }
  function applyFrost(rec) {
    if (frostKey === rec.key) return;
    frosts = rec.urls; frostKey = rec.key; frostWallUrl = rec.wall;
    /* Even a non-inherited custom property on html's inline style invalidates the whole app in Chromium. A rule
       scoped to the actual painters changes the same pixels in this commit without restyling their contents. */
    var paint = wallpaperPaintRule(0);
    Object.keys(frosts).forEach(function (name) { paint.setProperty('--lg-frost-' + name, 'url(' + JSON.stringify(frosts[name]) + ')'); });
    releaseWallHold();
  }
  /* A wallpaper or mode change shows the new print at once, but the sheets' frost is encoded from it a few hundred ms
     later (17-30 frames in pm7-wallpapers' RTX 3090 film), so the glass showed the old picture over the new one. The
     page keeps painting the old print until the new frost is in, then both change in the same task. */
  var wallHoldT = 0;
  function holdWall(url) {
    if (!url) return;
    wallpaperPaintRule(1).setProperty('--lg-wall-hold', 'url(' + JSON.stringify(url) + ')'); root.setAttribute('data-lg-wall-hold', '');
    clearTimeout(wallHoldT); wallHoldT = setTimeout(releaseWallHold, 2000);
  }
  function releaseWallHold() {
    clearTimeout(wallHoldT); wallHoldT = 0;
    if (root.hasAttribute('data-lg-wall-hold')) { root.removeAttribute('data-lg-wall-hold'); wallpaperPaintRule(1).removeProperty('--lg-wall-hold'); }
  }
  /* ---- the frost crossfade (pm7-frost-crossfade, Jared 2026-10-16, F3-653) ------------------------------------------
     A wallpaper change fades the body's print over 240 ms (the wallpapers package) and commits the new frost as the fade
     starts, so the sheets switched to the new frost at once while the picture around them was still fading. Now every
     shown sheet crossfades with the print. The sheet takes the new frost in the same task as before (applyFrost), and its
     ::after (glass.css section 3) paints the sheet's outgoing background over it, under its content: the outgoing frost,
     the sheet's outgoing rim, and the same tint, light and rim lines. The overlay fades from 1 to 0 on the compositor. Its
     animation starts in the same task as the print's fade and takes that fade's duration and easing, so the two share a
     start frame and a curve: each sheet is (1 - t) old + t new while the print is.
     Transient: it exists from commitWallpaper(id, url, viewport, fade) to the end of that fade. The next commit, a
     cancelled print fade, a look, tier or motion change, a resize or leaving Glass drop it at once, as the print layers
     drop theirs. Nothing is read: each sheet's size, place, scroll offset and whether it can hold the overlay were read
     when it was mounted. The outgoing frost pair and rims are kept from eviction and revocation until the overlay goes. */
  var xf = null, xfSerial = 0;
  function xfShown(e, vw, vh) {
    if (!e.isConnected || !e.__lgXfOk || !/^(panel|card|bar)$/.test(e.getAttribute('data-lg-kind') || '')) return false;
    var z = String(e.__lgSize || '').split('x'), W = +z[0] || 0, H = +z[1] || 0, x = -parseFloat(e.__lgFx), y = -parseFloat(e.__lgFy);
    return W > 0 && H > 0 && isFinite(x) && isFinite(y) && x < vw && y < vh && x + W > 0 && y + H > 0;
  }
  function startFrostFade(prev, fade, viewport) {
    var t = null; try { t = fade.effect.getTiming(); } catch (err) {}
    var ms = t && typeof t.duration === 'number' ? t.duration : 0;
    if (!(ms > 0) || !prev || !prev.heavy || !prev.light || !isGlass() || !gpu() || reduced()) return;
    var list = [];
    glassSet.forEach(function (e) { if (xfShown(e, viewport.width, viewport.height)) list.push(e); });
    if (!list.length) return;
    var gen = ++xfSerial, x = xf = { gen: gen, frosts: prev, sheets: list, t: 0 }, paint = wallpaperPaintRule(2);
    paint.setProperty('--lg-xf-heavy', 'url(' + JSON.stringify(prev.heavy) + ')'); paint.setProperty('--lg-xf-light', 'url(' + JSON.stringify(prev.light) + ')');
    paint.setProperty('--lg-xf-ms', ms + 'ms'); paint.setProperty('--lg-xf-ease', t.easing || 'linear');
    list.forEach(function (e) {
      e.__lgXfRing = e.__lgRing || null;
      if (e.__lgXfRing) e.style.setProperty('--lg-xf-ring', 'url(' + e.__lgXfRing + ')');
      if (e.__lgScroller && (e.__lgSx || e.__lgSy)) { e.style.setProperty('--lg-xf-x', (e.__lgSx || 0) + 'px'); e.style.setProperty('--lg-xf-y', (e.__lgSy || 0) + 'px'); }
      e.setAttribute('data-lg-xf', gen % 2 ? 'a' : 'b');
    });
    function done() { endFrostFade(gen); }
    if (fade.finished && typeof fade.finished.then === 'function') fade.finished.then(done, done);
    /* a print fade that never settles */
    x.t = setTimeout(done, ms + (t.delay || 0) + 1000);
  }
  function endFrostFade(gen) {
    var x = xf; if (!x || (gen != null && gen !== x.gen)) return;
    xf = null; clearTimeout(x.t);
    x.sheets.forEach(function (e) {
      if (e.hasAttribute('data-lg-xf')) e.removeAttribute('data-lg-xf');
      ['--lg-xf-ring', '--lg-xf-x', '--lg-xf-y'].forEach(function (name) { e.style.removeProperty(name); });
      var u = e.__lgXfRing; e.__lgXfRing = null;
      if (u && u !== e.__lgRing && !ringUrls.has(u) && !ringShown(u)) URL.revokeObjectURL(u);
    });
    var paint = wallpaperPaintRule(2);
    ['--lg-xf-heavy', '--lg-xf-light', '--lg-xf-ms', '--lg-xf-ease'].forEach(function (name) { paint.removeProperty(name); });
    /* the outgoing pair goes now if it is neither shown nor kept */
    var kept = x.frosts === frosts || Array.from(frostCache.values()).some(function (r) { return r.urls === x.frosts; });
    if (!kept) Object.keys(x.frosts).forEach(function (n) { URL.revokeObjectURL(x.frosts[n]); });
  }
  /* a canvas as a PNG blob, now. canvas.toBlob encodes in the main thread's idle time, so while a Glass entry or a room
     change kept it busy a frost or a ring came back up to a second later (P1000 trace: the frosts drawn at +1.2 s, their
     blobs at +2.4 s). A frost at a third of the window encodes in about 13 ms, a 400 x 813 ring in 5 (P1000). */
  function pngNow(cv) {
    try {
      var d = cv.toDataURL('image/png'), bin = atob(d.slice(d.indexOf(',') + 1)), n = bin.length, a = new Uint8Array(n);
      for (var i = 0; i < n; i++) a[i] = bin.charCodeAt(i);
      return new Blob([a], { type: 'image/png' });
    } catch (e) { return null; }
  }
  /* stepped (optional, a gallery preparation with the page's warm queue): given the job once it is made, with job.rest, its
     parts still to run (the print scaled once, then each frost level), which the caller runs in steps; job.rush() runs
     what is left at once, job.drop() gives the job up (its waiters are told false). Any other request for the same print
     runs the rest at once and then takes the prepared pair as a kept one, so a pick never waits on the queue */
  function makeFrosts(im, done, prepare, stepped) {
    var c = cover(im), u = im.__lgWallUrl || wallUrl, key = u + ':' + c.vw + 'x' + c.vh, epoch = bakeEpoch;
    if (!isGlass() || (!prepare && currentWallUrl() !== u)) { done(false); return; }
    if (frostKey === key) { done(true); return; }
    var cached = frostCache.get(key);
    if (cached) {
      frostCache.delete(key); frostCache.set(key, cached); frostUsed(cached);
      whenDecoded(cached, function () { if (!prepare && frostCache.get(key) === cached && currentWallUrl() === u) applyFrost(cached); done(true); });
      return;
    }
    var job = frostJobs.get(key);
    if (job && job.rest && !stepped) { job.rush(); makeFrosts(im, done, prepare); return; }
    if (job && job.epoch === epoch) { job.waiters.push(done); return; }
    var names = Object.keys(FROST);
    job = { key: key, epoch: epoch, pending: names.length, blobs: {}, waiters: [done] }; frostJobs.set(key, job);
    function finish(name, blob) {
      job.blobs[name] = blob;
      if (--job.pending) return;
      if (frostJobs.get(key) === job) frostJobs.delete(key);
      var valid = epoch === bakeEpoch && isGlass() && (prepare || currentWallUrl() === u) && innerWidth === c.vw && innerHeight === c.vh;
      valid = valid && names.every(function (n) { return !!job.blobs[n]; });
      if (valid) {
        var rec = { key: key, wall: u, urls: {}, bytes: 0, used: performance.now(),
          dbytes: names.length * 4 * Math.ceil(c.vw * FROST_SCALE) * Math.ceil(c.vh * FROST_SCALE) };
        names.forEach(function (n) { rec.urls[n] = URL.createObjectURL(job.blobs[n]); rec.bytes += job.blobs[n].size; });
        decodeFrost(rec);
        /* Apply both frost levels together. An older encoder can never replace half of the current wallpaper. */
        var previous = frosts, previousUncached = !Array.from(frostCache.values()).some(function (r) { return r.urls === previous; });
        if (!prepare) applyFrost(rec);
        while (frostCache.size && frostBytes + rec.bytes > FROST_BYTES) {
          /* Preparation may evict another cached print, never the frost still visible on the sheets (nor the outgoing
             frost a crossfade still shows) */
          var oldest = Array.from(frostCache.keys()).find(function (k) { var u = frostCache.get(k).urls; return u !== frosts && !(xf && u === xf.frosts); });
          if (oldest == null) break;
          var old = frostCache.get(oldest);
          frostBytes -= old.bytes; frostCache.delete(oldest); dropFrost(old); frostLog('evicted', old.wall);
        }
        if (frostBytes + rec.bytes <= FROST_BYTES) { frostCache.set(key, rec); frostBytes += rec.bytes; trimDecoded(); }
        else if (prepare) { dropFrost(rec); valid = false; }
        /* An unusually large active pair is kept only while displayed, rather than exceeding the cache budget. */
        if (!prepare && previous !== rec.urls && previousUncached && !(xf && previous === xf.frosts)) {
          Object.keys(previous).forEach(function (n) { URL.revokeObjectURL(previous[n]); });
        }
      }
      /* preparation resolves once the new pair is decoded, so the caller's commit swaps decoded images */
      var waiters = job.waiters; job.waiters = [];
      var tell = function () { waiters.forEach(function (cb) { cb(valid); }); };
      if (valid && prepare && frostCache.get(key) === rec) whenDecoded(rec, tell); else tell();
    }
    /* each frost is drawn at FROST_SCALE of the window and stretched back by its background-size (glass.css: / --lg-vw
       --lg-vh): a 26 px or 14 px blur holds no detail that a third of the pixels cannot carry, and the blur and the encode
       cost about a ninth. Both canvases are CPU canvases: on a GPU canvas toBlob read the frost back synchronously and
       waited for the page's own raster first (Jared #12: 812 ms of toBlob on a P1000, on every Glass entry and every
       wallpaper change) */
    var k = FROST_SCALE;
    /* the print is scaled once, to the largest scale the draws below use (the margin copy's, 1.12 x the cover scale at
       FROST_SCALE), and every draw of every level takes it from that copy: scaling the 2560 px print four times cost about
       110 ms of the main thread a print, about 40 ms now, so a pick the gallery had not reached commits sooner and the
       gallery warms more prints in the same time (B3, F5). The frost differs by at most 4/255 (mean under 0.5/255) under
       its blur. */
    var ms = c.s * k * 1.12, mid = document.createElement('canvas');
    var parts = [function () {
      mid.width = Math.ceil(im.naturalWidth * ms); mid.height = Math.ceil(im.naturalHeight * ms);
      mid.getContext('2d', { willReadFrequently: true }).drawImage(im, 0, 0, mid.width, mid.height);
    }].concat(names.map(function (name) { return function () { level(name); }; }));
    if (!stepped) { parts.forEach(function (p) { p(); }); return; }
    job.rest = parts;
    job.rush = function () { var r = job.rest; job.rest = null; if (job.stop) job.stop(); while (r && r.length) r.shift()(); };
    job.drop = function () {
      if (!job.rest) return;
      job.rest = null; if (job.stop) job.stop();
      if (frostJobs.get(key) === job) frostJobs.delete(key);
      var waiters = job.waiters; job.waiters = []; waiters.forEach(function (cb) { cb(false); });
    };
    stepped(job);
    function level(name) {
      var F = FROST[name], pad = F.blur * 3, W = c.vw + pad * 2, H = c.vh + pad * 2;
      var src = document.createElement('canvas'); src.width = Math.ceil(W * k); src.height = Math.ceil(H * k); var g = src.getContext('2d', { willReadFrequently: true });
      g.scale(k, k);
      /* fill the margin with a slightly larger copy, so the blur has real colour to pull from at the window's edges */
      g.save(); g.translate(W / 2, H / 2); g.scale(1.12, 1.12); g.translate(-W / 2, -H / 2); g.drawImage(mid, c.ox + pad, c.oy + pad, im.naturalWidth * c.s, im.naturalHeight * c.s); g.restore();
      g.drawImage(mid, c.ox + pad, c.oy + pad, im.naturalWidth * c.s, im.naturalHeight * c.s);
      var out = document.createElement('canvas'); out.width = Math.round(c.vw * k); out.height = Math.round(c.vh * k); var o = out.getContext('2d', { willReadFrequently: true });
      o.filter = 'blur(' + (F.blur * k).toFixed(2) + 'px) saturate(' + F.sat + ')'; o.drawImage(src, -pad * k, -pad * k); o.filter = 'none';
      finish(name, pngNow(out));
    }
  }
  /* a gallery preparation's frost through the page's warm queue (IDLE-WARM-RULE.md: wallpaper bakes are cpu steps; F6):
     each step runs the next part of the bake in idle time, and more parts while its deadline has room for one at the
     time the last took, so a step taken in a short idle slot overruns the page's frame by one part (about 13 ms on a
     P1000), never by a whole print. A step the queue judges late is handled (the part ran; running it again gains
     nothing); one it drops (its session stop) gives the bake up, and the gallery tries that print again later. canRun is
     asked before each part, as before the bake */
  var frostPartMs = 8;
  function frostSteps(W, url, canRun) {
    return function (job) {
      var id = 0, label = String(url).split('/').pop().slice(-40);
      function run(d) {
        id = 0;
        if (!job.rest) return null;
        if (canRun && !canRun()) { job.drop(); return null; }
        do {
          var t0 = performance.now();
          job.rest.shift()();
          frostPartMs = frostPartMs * 0.7 + (performance.now() - t0) * 0.3;
        } while (job.rest && job.rest.length && d && typeof d.timeRemaining === 'function' && d.timeRemaining() > frostPartMs + 2);
        if (job.rest && job.rest.length) add(); else job.rest = null;
        return null;
      }
      function add() {
        id = W.add({ owner: 'glass', name: 'frost:' + label, cpu: true, run: run,
          onLate: function (info) { if (info && info.dropped) job.drop(); return true; } });
      }
      job.stop = function () { if (id) W.cancel(id); id = 0; };
      add();
    };
  }
  function currentBake(job, im) {
    return job && job.epoch === bakeEpoch && isGlass() && job.e.isConnected && job.e.__lgBake === job && job.e.__lgSig === job.sig &&
      job.e.getAttribute('data-lg-kind') === job.kind && job.wall === wallSourceId && job.theme === root.getAttribute('data-theme') &&
      job.vw === innerWidth && job.vh === innerHeight && (!im || im.__lgWallUrl === currentWallUrl());
  }
  /* rings kept by signature (Jared #3, 2026-10-14: Usage room changes lagged in Glass). A Usage room builds new cards on
     every visit, and each new card baked its ring again: 12 to 16 bakes of 20 to 40 ms each, inside the room change. A ring
     depends only on what its signature holds (size, place, radius, kind, wallpaper, viewport, look), so a card that comes
     back to the same place takes the ring it had, in the same frame, with no bake. The cache owns the rings' URLs; an
     element only points at one, and a URL is revoked when it has left the cache and no sheet shows it. */
  var ringCache = new Map(), ringUrls = new Set(), RING_COUNT = 128;
  function ringShown(url, except) {
    var on = false; glassSet.forEach(function (x) { if (x !== except && x.__lgRing === url) on = true; });
    /* an outgoing rim a frost crossfade still shows, its own sheet's included */
    if (xf) xf.sheets.forEach(function (x) { if (x.__lgXfRing === url) on = true; });
    return on;
  }
  function releaseRing(e) {
    var url = e.__lgRing; e.__lgRing = null;
    if (url && !ringUrls.has(url) && !ringShown(url, e)) URL.revokeObjectURL(url);
  }
  function keepRing(sig, url, spec) {
    ringCache.delete(sig); ringCache.set(sig, { url: url, spec: spec }); ringUrls.add(url);
    while (ringCache.size > RING_COUNT) {
      var old = ringCache.keys().next().value, rec = ringCache.get(old);
      ringCache.delete(old); ringUrls.delete(rec.url); if (!ringShown(rec.url)) URL.revokeObjectURL(rec.url);
    }
  }
  function useRing(e, rec) {
    if (e.__lgBake) { bakeQ.delete(e); e.__lgBake = null; }
    if (e.__lgRing !== rec.url) { releaseRing(e); e.__lgRing = rec.url; }
    e.__lgSpec = rec.spec; e.style.setProperty('--lg-spec', 'url(' + rec.spec + ')'); e.style.setProperty('--lg-ring', 'url(' + rec.url + ')');
  }
  /* a rim's pixels: each active pixel of the bevel takes the wallpaper under it (S, SW x SH, with a margin of p px) at
     its bent place, with red and blue split by ca. Plain numbers, shared with the bake worker. */
  function sampleRing(S, SW, SH, raw, W, p, ca, O) {
    function at(x, y, ch) {   /* bilinear sample of one channel */
      x = Math.max(0, Math.min(SW - 1.001, x)); y = Math.max(0, Math.min(SH - 1.001, y));
      var x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i00 = (y0 * SW + x0) * 4 + ch, i10 = i00 + 4, i01 = i00 + SW * 4, i11 = i01 + 4;
      return (S[i00] * (1 - fx) + S[i10] * fx) * (1 - fy) + (S[i01] * (1 - fx) + S[i11] * fx) * fy;
    }
    for (var j = 0; j < raw.active.length; j++) {
      var i = raw.active[j], x = i % W, y = (i / W) | 0, a = raw.edge[j];
      var vx = raw.dx[j], vy = raw.dy[j], bx = x + p + 0.5, by = y + p + 0.5, o = i * 4;
      O[o] = at(bx + vx * (1 - ca), by + vy * (1 - ca), 0); O[o + 1] = at(bx + vx, by + vy, 1); O[o + 2] = at(bx + vx * (1 + ca), by + vy * (1 + ca), 2); O[o + 3] = a * 255;
    }
  }
  /* what a rim bake needs to know of its sheet, read where layout is clean (a bake step runs after layout) */
  function bakeGeometry(e, kind) {
    var k = KINDS[kind], W = Math.round(e.offsetWidth), H = Math.round(e.offsetHeight);
    if (W < 4 || H < 4) return null;
    var lp = anchor(e), R = radiusOf(e, W, H), B = Math.max(2, Math.min(k.bezel, Math.min(W, H) / 2 - 1)), T = Math.min(k.thick, B * 2.4);
    var G = { k: k, W: W, H: H, left: lp.x, top: lp.y, R: Math.round(R), B: Math.round(B), T: Math.round(T) };
    G.key = [W, H, G.R, G.B, G.T, 1, k.light, k.ring, true].join('|');
    return G;
  }
  function sameGeometry(e, G, cache) {
    var lp = layoutPos(e, cache);
    return Math.round(e.offsetWidth) === G.W && Math.round(e.offsetHeight) === G.H && Math.round(lp.x) === Math.round(G.left) && Math.round(lp.y) === Math.round(G.top);
  }
  /* the page's own rim bake: the fallback when the bake worker cannot run (no Worker, OffscreenCanvas or canvas filter) */
  function bakeRing(e, kind, im, job) {
    if (!currentBake(job, im)) return;
    var G = bakeGeometry(e, kind); if (!G) return;
    var k = G.k, W = G.W, H = G.H, r = { left: G.left, top: G.top };
    var m = buildMaps(W, H, G.R, G.B, G.T, 1, k.light, k.ring, true), c = cover(im);
    var p = Math.ceil(m.max) + 3, SW = W + 2 * p, SH = H + 2 * p;
    /* read back on the CPU: a GPU canvas paid a readback in getImageData and again in toBlob (about 20 ms a card) */
    var sc = document.createElement('canvas'); sc.width = SW; sc.height = SH; var g = sc.getContext('2d', { willReadFrequently: true });
    g.filter = 'saturate(' + k.sat + ')';
    g.setTransform(c.s, 0, 0, c.s, c.ox - (r.left - p), c.oy - (r.top - p)); g.drawImage(im, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0);
    var S = g.getImageData(0, 0, SW, SH).data, out = new ImageData(W, H);
    sampleRing(S, SW, SH, m.raw, W, p, k.ca || 0, out.data);
    var oc = document.createElement('canvas'); oc.width = W; oc.height = H; oc.getContext('2d', { willReadFrequently: true }).putImageData(out, 0, 0);
    e.style.setProperty('--lg-spec', 'url(' + m.spec + ')');
    (function (b) {
      if (!b) { e.__lgSig = null; return; }
      if (!sameGeometry(e, G)) { e.__lgSig = null; mount(e, kind); return; }
      var url = URL.createObjectURL(b); keepRing(job.sig, url, m.spec);
      if (e.__lgRing !== url) { releaseRing(e); e.__lgRing = url; }
      e.style.setProperty('--lg-ring', 'url(' + url + ')');
    })(pngNow(oc));
  }

  /* ---- the bake worker ------------------------------------------------------------------------------------------------
     A rim bake builds its sheet's maps, samples the wallpaper under its bevel and encodes two PNGs, all in proportion to
     the sheet's area: on the P1000 a 646 x 2946 Settings card took 257 ms and a chapter change baked 27 of them in a row
     (1.2 s, 2026-10-16), so a bake held its frame however the steps were cut. So the bake runs in a worker. The page reads
     each sheet's size, place and corner after layout, posts them, and applies the finished rim after a later layout; the
     worker runs this file's own mapsCore, compactMaps, specPixels and sampleRing (their source text) on OffscreenCanvas,
     which draws the same pixels as a page canvas (the saturate filter included). The wallpaper goes over once per print,
     as an ImageBitmap. Without a Worker, OffscreenCanvas or a canvas filter there, the page bakes as before (bakeRing). */
  function bakeWorkerMain() {
    var walls = new Map(), maps = new Map(), queue = [], busy = false, epoch = 0;
    var probe = typeof OffscreenCanvas === 'function' && new OffscreenCanvas(1, 1).getContext('2d');
    if (!probe || !('filter' in probe) || typeof probe.getImageData !== 'function') { postMessage({ type: 'unsupported' }); return; }
    function mapsFor(j) {
      var rec = maps.get(j.key);
      if (rec) { maps.delete(j.key); maps.set(j.key, rec); return Promise.resolve(rec); }
      var core = mapsCore(j.W, j.H, j.R, j.B, j.T, 1, j.light, j.ring);
      var cv = new OffscreenCanvas(j.W, j.H), cx = cv.getContext('2d', { willReadFrequently: true }), px = cx.createImageData(j.W, j.H);
      specPixels(px.data, core.sp, core.n); cx.putImageData(px, 0, 0);
      return cv.convertToBlob({ type: 'image/png' }).then(function (spec) {
        rec = { max: core.max, raw: compactMaps(core), spec: spec }; maps.set(j.key, rec);
        while (maps.size > 64) maps.delete(maps.keys().next().value);
        return rec;
      });
    }
    function bake(j) {
      var bm = walls.get(j.wall); if (!bm) return Promise.resolve({ id: j.id, error: 'wall' });
      return mapsFor(j).then(function (rec) {
        var p = Math.ceil(rec.max) + 3, SW = j.W + 2 * p, SH = j.H + 2 * p, c = j.c;
        var sc = new OffscreenCanvas(SW, SH), g = sc.getContext('2d', { willReadFrequently: true });
        g.filter = 'saturate(' + j.sat + ')';
        g.setTransform(c.s, 0, 0, c.s, c.ox - (j.left - p), c.oy - (j.top - p)); g.drawImage(bm, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0);
        var S = g.getImageData(0, 0, SW, SH).data, out = new ImageData(j.W, j.H);
        sampleRing(S, SW, SH, rec.raw, j.W, p, j.ca, out.data);
        var oc = new OffscreenCanvas(j.W, j.H); oc.getContext('2d', { willReadFrequently: true }).putImageData(out, 0, 0);
        return oc.convertToBlob({ type: 'image/png' }).then(function (ring) { return { id: j.id, key: j.key, ring: ring, spec: j.needSpec ? rec.spec : null }; });
      });
    }
    function pump() {
      if (busy) return;
      while (queue.length && queue[0].epoch < epoch) queue.shift();
      if (!queue.length) return;
      busy = true; var j = queue.shift();
      bake(j).then(function (r) { postMessage(r); }, function (err) { postMessage({ id: j.id, error: String((err && err.message) || err) }); })
        .then(function () { busy = false; pump(); });
    }
    onmessage = function (ev) {
      var m = ev.data;
      if (m.type === 'wall') walls.set(m.id, m.bm);
      else if (m.type === 'unwall') { var old = walls.get(m.id); if (old) { old.close(); walls.delete(m.id); } }
      else if (m.type === 'epoch') { epoch = m.epoch; pump(); }
      else if (m.type === 'prio') { var first = queue.filter(function (j) { return m.ids.indexOf(j.id) >= 0; }); queue = first.concat(queue.filter(function (j) { return m.ids.indexOf(j.id) < 0; })); }
      else { if (m.urgent) queue.unshift(m); else queue.push(m); pump(); }
    };
  }
  var bakeW = null, bakeWOn = 0, bakeWJobs = new Map(), bakeWIds = 0, bakeWWalls = new Map(), bakeWWallId = 0, bakeWReady = [], bakeWErrors = 0;
  var specUrls = new Map(), SPEC_COUNT = 192;
  function bakeWorker() {
    if (bakeWOn) return bakeWOn > 0 ? bakeW : null;
    bakeWOn = -1;
    try {
      if (!window.Worker || !window.OffscreenCanvas || !window.createImageBitmap) return null;
      var src = [sdf, profile, mapsCore, compactMaps, specPixels, sampleRing].map(function (f) { return 'var ' + f.name + ' = ' + f.toString() + ';\n'; }).join('') +
        '(' + bakeWorkerMain.toString() + ')();\n';
      var wUrl = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      bakeW = new Worker(wUrl); setTimeout(function () { URL.revokeObjectURL(wUrl); }, 5000);
      bakeW.onmessage = bakeWMessage; bakeW.onerror = function () { bakeWFail(); };
      bakeWOn = 1; return bakeW;
    } catch (e) { bakeW = null; return null; }
  }
  /* the worker cannot bake here: every sheet it held is baked by the page instead */
  function bakeWFail() {
    if (bakeWOn < 0 && !bakeW) return;
    bakeWOn = -1; try { if (bakeW) bakeW.terminate(); } catch (e) {} bakeW = null;
    bakeWJobs.forEach(function (job) { if (job.e.__lgBake === job) job.e.__lgSig = null; }); bakeWJobs.clear(); bakeWWalls.clear();
    dirtyAll = true; queueSync();
  }
  /* the wallpaper's print goes to the worker once, as an ImageBitmap (the last two are kept there) */
  function bakeWWall(im, done) {
    var u = im.__lgWallUrl, id = bakeWWalls.get(u);
    if (id) { bakeWWalls.delete(u); bakeWWalls.set(u, id); done(id); return; }
    createImageBitmap(im).then(function (bm) {
      if (!bakeW) { bm.close(); done(0); return; }
      id = ++bakeWWallId; bakeW.postMessage({ type: 'wall', id: id, bm: bm }, [bm]); bakeWWalls.set(u, id);
      while (bakeWWalls.size > 2) { var oldest = bakeWWalls.keys().next().value; bakeW.postMessage({ type: 'unwall', id: bakeWWalls.get(oldest) }); bakeWWalls.delete(oldest); }
      done(id);
    }, function () { done(0); });
  }
  function postBake(job, im, wall) {
    if (!currentBake(job, im)) return;
    var G = bakeGeometry(job.e, job.kind); if (!G) return;
    job.geo = G; job.id = ++bakeWIds; bakeWJobs.set(job.id, job);
    bakeW.postMessage({ id: job.id, epoch: bakeEpoch, wall: wall, key: G.key, W: G.W, H: G.H, R: G.R, B: G.B, T: G.T, light: G.k.light, ring: G.k.ring,
      sat: G.k.sat, ca: G.k.ca || 0, left: G.left, top: G.top, c: cover(im), needSpec: !specUrls.has(G.key), urgent: !!job.urgent });
  }
  function keepSpec(key, url) {
    specUrls.delete(key); specUrls.set(key, url);
    if (specUrls.size <= SPEC_COUNT) return;
    /* the oldest light no cached or shown rim uses is let go */
    var used = new Set(); ringCache.forEach(function (rec) { used.add(rec.spec); }); glassSet.forEach(function (x) { if (x.__lgSpec) used.add(x.__lgSpec); });
    for (var it = specUrls.keys(), k = it.next(); !k.done && specUrls.size > SPEC_COUNT; k = it.next()) {
      var u = specUrls.get(k.value); if (!used.has(u)) { specUrls.delete(k.value); URL.revokeObjectURL(u); }
    }
  }
  function bakeWMessage(ev) {
    var m = ev.data;
    if (m.type === 'unsupported') { bakeWFail(); return; }
    /* a bake the worker keeps failing goes back to the page (a print it no longer holds is only a stale job) */
    if (m.error && m.error !== 'wall' && ++bakeWErrors > 3) { bakeWFail(); return; }
    var job = bakeWJobs.get(m.id); bakeWJobs.delete(m.id);
    if (m.spec && !specUrls.has(m.key)) keepSpec(m.key, URL.createObjectURL(m.spec));
    if (!job) return;
    if (!m.ring) { if (job.e.__lgBake === job) { job.e.__lgSig = null; dirtyScope(job.e.parentElement || job.e); lazySync(false); } return; }
    bakeWReady.push({ job: job, ring: m.ring });
    if (bakeWReady.length === 1 && !afterLayout(applyBakes)) applyBakes();
  }
  /* finished rims are applied after a layout, where checking that the sheet has not moved since is free */
  function applyBakes() {
    var list = bakeWReady, offsets = new Map(); bakeWReady = [];
    /* every finished rim's sheet is checked before any rim is shown: showing one restyled its sheet, and the next sheet's
       check paid a style pass of its own (B6 packet 1's rule; a rim moves nothing) */
    list.forEach(function (x) { var job = x.job; x.state = !currentBake(job, null) ? 0 : specUrls.get(job.geo.key) && sameGeometry(job.e, job.geo, offsets) ? 1 : 2; });
    list.forEach(function (x) {
      var job = x.job, e = job.e, G = job.geo, spec = specUrls.get(G.key);
      if (!x.state) return;
      if (x.state === 2) { e.__lgSig = null; mount(e, job.kind); return; }
      e.__lgSpec = spec; e.style.setProperty('--lg-spec', 'url(' + spec + ')');
      var url = URL.createObjectURL(x.ring); keepRing(job.sig, url, spec);
      if (e.__lgRing !== url) { releaseRing(e); e.__lgRing = url; }
      e.style.setProperty('--lg-ring', 'url(' + url + ')');
    });
  }
  function scheduleBakes() { if (!bakeT && !bakeFlight && bakeQ.size && isGlass()) bakeT = setTimeout(flushBakes, 60); }
  function flushBakes() {
    bakeT = 0; if (!isGlass() || !bakeQ.size || bakeFlight) return;
    var flight = { epoch: bakeEpoch }; bakeFlight = flight;
    function finish(failed) {
      if (bakeFlight !== flight) return;
      bakeFlight = null;
      if (failed) { bakeQ.forEach(function (job) { if (job.e.__lgBake === job) job.e.__lgSig = null; }); bakeQ.clear(); }
      scheduleBakes();
    }
    withWall(function (im) {
      if (bakeFlight !== flight) return;
      if (!im || flight.epoch !== bakeEpoch || !isGlass()) { finish(true); return; }
      if (im.__lgWallUrl !== currentWallUrl()) { finish(false); return; }
      bakeQ.forEach(function (job, e) { if (!currentBake(job, im)) bakeQ.delete(e); });
      if (!bakeQ.size) { finish(false); return; }
      flight.vw = innerWidth; flight.vh = innerHeight;
      makeFrosts(im, function (ok) {
        if (bakeFlight !== flight) return;
        if (!ok) { finish(im.__lgWallUrl === currentWallUrl() && innerWidth === flight.vw && innerHeight === flight.vh); return; }
        /* the largest sheets first (the chrome: title bar, side columns, status bar): theirs is the rim a late bake shows */
        var list = Array.from(bakeQ.values()), next = 0; bakeQ.clear();
        /* the size each sheet was mounted at (no layout read: in a room change's timer task the board may be mid-build) */
        list.forEach(function (j) { var z = String(j.e.__lgSize || '0x0').split('x'); j.area = (+z[0] || 0) * (+z[1] || 0); });
        list.sort(function (a, b) { return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || b.area - a.area; });
        /* in a frame, 12 ms at a time; during a Usage room change, in the main thread's idle time only, so a rim never
           lengthens a frame of the room's build or forces its layout (idle time follows a drawn frame) */
        function step(deadline) {
          bakeFrame = 0; bakeIdle = 0;
          if (bakeFlight !== flight || flight.epoch !== bakeEpoch || !isGlass()) { finish(false); return; }
          var t0 = performance.now(), ran = 0;
          while (next < list.length) {
            /* in a frame, 12 ms; in idle time, a bake starts only if the idle period has room for one (a bake is 5-15 ms:
               the idle callbacks ran to 27 ms, into the next frame) unless the idle wait timed out */
            var left = deadline ? deadline.timeRemaining() : 12 - (performance.now() - t0);
            if (deadline ? !deadline.didTimeout && left < bakeAvg + 1 : ran && left <= 0) break;
            if (deadline && deadline.didTimeout && ran) break;
            var job = list[next++];
            if (currentBake(job, im)) {
              var b0 = performance.now();
              if (wall && bakeW) postBake(job, im, wall); else bakeRing(job.e, job.kind, im, job);
              bakeAvg = bakeAvg * 0.7 + (performance.now() - b0) * 0.3; ran++;
            }
          }
          if (next < list.length) nextStep(); else finish(false);
        }
        /* a step runs after its frame's layout (afterLayout), where a bake's reads of the sheet's size, place and corner are
           free. Run from the timer or a frame callback, the first read forced the page's pending style and layout inside
           the bake: an app's open or a chapter change paid it there (the editor customizer's open, 2026-10-16: a 223 ms
           flush, then frames of 194 and 82 ms). The next step is observed from a frame callback, so it lands after that
           frame's layout and never inside this observer's own delivery. */
        function nextStep() {
          if (boardMoment() && window.requestIdleCallback) bakeIdle = requestIdleCallback(step, { timeout: 700 });
          else bakeFrame = requestAnimationFrame(function () { bakeFrame = 0; if (!afterLayout(function () { step(null); })) step(null); });
        }
        function start() { if (boardMoment()) nextStep(); else if (!afterLayout(function () { step(null); })) step(null); }
        var wall = 0;
        if (bakeWorker()) bakeWWall(im, function (id) { if (bakeFlight !== flight) return; wall = id; start(); }); else start();
      });
    });
  }
  function queueBake(e, kind) {
    var job = { e: e, kind: kind, sig: e.__lgSig, epoch: bakeEpoch, wall: wallSourceId, theme: root.getAttribute('data-theme'), vw: innerWidth, vh: innerHeight };
    if (soonIn && performance.now() < soonUntil && soonIn.contains(e)) job.urgent = true;
    e.__lgBake = job; bakeQ.set(e, job); scheduleBakes();
  }

  /* mount or refresh one glass element; sheets bake, menus blur live (fast CSS blur), lenses refract live */
  function mount(e, kind, measured) {
    var k = KINDS[kind] || KINDS.panel, r = measured ? measured.rect : e.getBoundingClientRect();
    var W = measured ? measured.W : Math.round(e.offsetWidth || r.width), H = measured ? measured.H : Math.round(e.offsetHeight || r.height);
    if (W < 4 || H < 4) return null;
    /* marked by our own attribute only: app code owns its elements' class lists (the Usage menus rewrite theirs, and a
       class added here started an endless observer ping-pong that froze the page) */
    if (e.getAttribute('data-lg-kind') !== kind) e.setAttribute('data-lg-kind', kind);
    if (!glassSet.has(e)) { glassSet.add(e); if (sizeWatch) sizeWatch.observe(e); }
    e.__lgSize = W + 'x' + H;
    var R = measured ? measured.R : radiusOf(e, W, H);
    if (k.bake) {
      indexAncestors(e, scrollSheets, sheetAncestors);
      var lp = anchor(e, measured && measured.lp);
      currentWallUrl();
      var sig = W + 'x' + H + '@' + Math.round(lp.x) + ',' + Math.round(lp.y) + ':' + R.toFixed(1) + ':' + kind + ':' + wallSourceId + ':' + innerWidth + 'x' + innerHeight + ':' + root.getAttribute('data-theme');
      if (e.__lgSig !== sig) {
        e.__lgSig = sig;
        var kept = ringCache.get(sig);
        if (kept) { ringCache.delete(sig); ringCache.set(sig, kept); useRing(e, kept); } else queueBake(e, kind);
      }
      return null;
    }
    var B = Math.max(2, Math.min(k.bezel, Math.min(W, H) / 2 - 1)), T = Math.min(k.thick, B * 2.4);
    var sig2 = W + 'x' + H + ':' + R.toFixed(1) + ':' + kind + ':' + gpu();
    if (e.__lgSig === sig2) return e.__lgF;
    var lf = k.lens ? lensFilterFor(kind, W, H, R) : null;
    /* only the light map is drawn (a menu blurs in CSS): its displacement map was encoded for nothing, on every new size */
    var nine = !lf && lightSlices(W, H, Math.round(R), Math.round(B), Math.round(T), k);
    if (nine) {
      if (e.__lgSpec9 !== nine) { e.__lgSpec9 = nine; e.style.setProperty('--lg-spec9', nine); }
      e.style.removeProperty('--lg-spec');
    } else {
      var m = lf ? lf.m : buildMaps(W, H, Math.round(R), Math.round(B), Math.round(T), k.mag, k.light, null, true);
      e.style.setProperty('--lg-spec', 'url(' + m.spec + ')');
      if (e.__lgSpec9) { e.__lgSpec9 = null; e.style.removeProperty('--lg-spec9'); }
    }
    e.__lgSig = sig2; e.__lgF = null;
    var bf = null;
    if (gpu() && k.css) bf = 'blur(' + k.blur + 'px) saturate(' + k.sat + ')';
    else if (gpu() && k.lens) { var f = lf.f; e.__lgF = f; bf = 'url(#' + f.id + ') saturate(' + k.sat + ')'; }
    if (bf) { e.style.setProperty('backdrop-filter', bf, 'important'); e.style.setProperty('-webkit-backdrop-filter', bf, 'important'); }
    else { e.style.removeProperty('backdrop-filter'); e.style.removeProperty('-webkit-backdrop-filter'); }
    return e.__lgF;
  }
  /* B6 packets 3/4 (2026-10-16): a menu's light map was drawn for its size, so a sheet whose size changed (the editor's
     Customize screen, parked at Settings' 920 px and shown at 593 beside the editor) drew a new one in that ResizeObserver
     callback: 47.7 ms of the main thread on a P1000 (buildMaps), then an 11 ms restyle for the new map's long data: URL.
     The map has nine parts: outside its four M x M corners (M = the bevel or the corner, whichever is larger, plus 2, as
     mapsCore's band) a pixel's light depends only on its distance from the nearest edge. So the map of any size at least
     2M + 1 each way is the same four corners and four edge profiles, laid out as background layers (glass.css
     --lg-spec9): drawn once per corner, bevel and light from a (2M + 1)-square map by the same mapsCore, about a
     millisecond, and the same pixels as the full map. A menu that changes size keeps them; nothing is redrawn or restyled.
     A menu smaller than that takes the full map, as before. */
  var lightCache = new Map(), LIGHT_RING = [3, 8];
  function lightSlices(W, H, R, B, T, k) {
    var M = Math.ceil(Math.max(B, R)) + 2, S = 2 * M + 1;
    if (k.mag !== 1 || W < S || H < S) return null;
    var key = [R, B, T, k.light].join('|'), hit = lightCache.get(key);
    if (hit) return hit;
    var core = mapsCore(S, S, R, B, T, 1, k.light, LIGHT_RING), sp = core.sp;
    function png(x0, y0, w, h) {
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      var ctx = cv.getContext('2d', { willReadFrequently: true }), px = ctx.createImageData(w, h), D = px.data;
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var o = (y * w + x) * 4; D[o] = D[o + 1] = D[o + 2] = 255; D[o + 3] = Math.round(sp[(y0 + y) * S + x0 + x] * 255); }
      ctx.putImageData(px, 0, 0); return 'url(' + cv.toDataURL('image/png') + ')';
    }
    var m = M + 'px', inner = 'calc(100% - ' + (2 * M) + 'px)';
    var nine = [png(0, 0, M, M) + ' 0 0 / ' + m + ' ' + m, png(M + 1, 0, M, M) + ' 100% 0 / ' + m + ' ' + m,
      png(0, M + 1, M, M) + ' 0 100% / ' + m + ' ' + m, png(M + 1, M + 1, M, M) + ' 100% 100% / ' + m + ' ' + m,
      png(M, 0, 1, M) + ' ' + m + ' 0 / ' + inner + ' ' + m, png(M, M + 1, 1, M) + ' ' + m + ' 100% / ' + inner + ' ' + m,
      png(0, M, M, 1) + ' 0 ' + m + ' / ' + m + ' ' + inner, png(M + 1, M, M, 1) + ' 100% ' + m + ' / ' + m + ' ' + inner].map(function (l) { return l + ' no-repeat'; }).join(', ');
    if (lightCache.size >= 32) lightCache.delete(lightCache.keys().next().value);
    lightCache.set(key, nine); return nine;
  }
  /* Read every candidate before committing its optics. New kind attributes are a single preliminary style change:
     dimensions retain the mount's original pre-kind measurement, radius/position use the resulting Glass style.
     Connected, already-mounted sheets need only one geometry and computed-radius snapshot. */
  /* inside a closed <details> (and not in its summary), so not drawn: asked of the DOM alone, as reading such a sheet's
     box makes the browser style and lay out the closed content (Settings, 2026-10-16: 479 and 287 elements in a chapter
     change). Those sheets are mounted when the main thread is idle instead (mountHidden), so they are glass already
     when their <details> opens, as before; opening one syncs in that frame (the observer watches 'open'). */
  function inClosedDetails(e) {
    for (var n = e.parentElement; n; n = n.parentElement) {
      if (n.tagName === 'SUMMARY' && n.parentElement && n.parentElement.tagName === 'DETAILS') { n = n.parentElement; continue; }
      if (n.tagName === 'DETAILS' && !n.open) return true;
    }
    return false;
  }
  var hiddenQ = new Map(), hiddenT = 0;
  function mountHidden() {
    hiddenT = 0; if (!isGlass()) { hiddenQ.clear(); return; }
    var targets = new Map(); hiddenQ.forEach(function (kind, e) { if (e.isConnected && inClosedDetails(e)) targets.set(e, kind); }); hiddenQ.clear();
    /* marked first, so the size read is the sheet's glass size (marking drops its 1 px border) and the rim baked now is
       the one it shows when its <details> opens */
    targets.forEach(function (kind, e) { if (e.getAttribute('data-lg-kind') !== kind) e.setAttribute('data-lg-kind', kind); });
    if (targets.size) mountMeasured(targets, false);
  }
  /* a <details> has opened: the rims of its sheets still being baked go first, and so do those queued in the next second
     (a sheet that was not mounted yet, the idle pass not having run) */
  var soonIn = null, soonUntil = 0;
  function bakeSoon(d) {
    soonIn = d; soonUntil = performance.now() + 1000;
    var ids = [];
    glassSet.forEach(function (e) {
      var j = e.__lgBake; if (!j || !d.contains(e)) return;
      if (j.id && bakeW && bakeWJobs.get(j.id) === j) ids.push(j.id); else j.urgent = true;
    });
    if (ids.length) bakeW.postMessage({ type: 'prio', ids: ids });
  }
  function mountMeasured(targets, requireVisible) {
    var measured = new Map(), offsets = new Map();
    targets.forEach(function (kind, e) {
      if (!e.isConnected) return;
      if (requireVisible && inClosedDetails(e)) {
        hiddenQ.set(e, kind);
        if (!hiddenT) hiddenT = window.requestIdleCallback ? requestIdleCallback(mountHidden, { timeout: 1500 }) : setTimeout(mountHidden, 400);
        return;
      }
      var r = e.getBoundingClientRect(), W = Math.round(e.offsetWidth || r.width), H = Math.round(e.offsetHeight || r.height);
      if (W < 4 || H < 4 || (requireVisible && (r.width <= 1 || r.height <= 1))) return;
      var cs = getComputedStyle(e), shown = cs.visibility !== 'hidden';
      if (requireVisible && !shown) return;
      measured.set(e, { rect: r, W: W, H: H, radius: parseFloat(cs.borderTopLeftRadius) || 0, kind: kind, fresh: e.getAttribute('data-lg-kind') !== kind });
    });
    measured.forEach(function (m, e) { if (m.fresh) e.setAttribute('data-lg-kind', m.kind); });
    measured.forEach(function (m, e) {
      var bake = KINDS[m.kind] && KINDS[m.kind].bake, cs = (m.fresh || bake) && getComputedStyle(e);
      if (m.fresh) m.radius = parseFloat(cs.borderTopLeftRadius) || 0;
      m.R = Math.max(0, Math.min(m.radius, m.W / 2 - 0.5, m.H / 2 - 0.5));
      if (bake) {
        m.lp = layoutPos(e, offsets);
        /* what the frost crossfade needs, read here with the rest (startFrostFade reads nothing): whether the sheet can hold
           its overlay (a positioned, isolated box: glass.css makes a static sheet relative unless the app sets its position),
           and, for a sheet that clips or scrolls its own content, the scroll offset the overlay must follow */
        e.__lgXfOk = cs.position !== 'static' && cs.isolation === 'isolate';
        e.__lgScroller = cs.overflowX !== 'visible' && cs.overflowX !== 'clip' || cs.overflowY !== 'visible' && cs.overflowY !== 'clip';
        if (e.__lgScroller) { var so = offsets.get(e); e.__lgSx = so ? so.x : 0; e.__lgSy = so ? so.y : 0; }
      }
    });
    measured.forEach(function (m, e) { mount(e, m.kind, m); });
  }
  function unmount(e) {
    forgetAncestors(e, scrollSheets, sheetAncestors);
    bakeQ.delete(e); e.__lgBake = null; e.__lgSig = null; e.__lgF = null;
    if (!bakeQ.size && !bakeFlight && bakeT) { clearTimeout(bakeT); bakeT = 0; }
    releaseRing(e);
    ['backdrop-filter', '-webkit-backdrop-filter', '--lg-ring', '--lg-spec', '--lg-spec9'].forEach(function (name) { e.style.removeProperty(name); }); e.__lgSpec9 = null;
    if (sizeWatch) sizeWatch.unobserve(e); glassSet.delete(e);
  }
  function unmountAll(keepLenses) {
    if (!keepLenses && typeof suspendLensMotion === 'function') suspendLensMotion();
    endFrostFade();
    bakeEpoch++; bakeFlight = null; bakeQ.clear(); bakeWReady = [];
    if (bakeW) bakeW.postMessage({ type: 'epoch', epoch: bakeEpoch });
    if (bakeT) { clearTimeout(bakeT); bakeT = 0; }
    if (bakeFrame) { cancelAnimationFrame(bakeFrame); bakeFrame = 0; }
    if (bakeIdle) { cancelIdleCallback(bakeIdle); bakeIdle = 0; }
    /* Keep connected sheets' finished images, as before: returning to Glass paints immediately while a changed
       sheet is rebaked. Removed surfaces release their images through unmount; shared frost remains bounded. */
    glassSet.forEach(function (e) {
      if (!e.isConnected) { unmount(e); return; }
      e.__lgBake = null; e.__lgSig = null; e.__lgF = null;
      e.style.removeProperty('backdrop-filter'); e.style.removeProperty('-webkit-backdrop-filter');
    });
    frostJobs.clear();
    if (typeof pruneLensFilters === 'function') pruneLensFilters();
  }
  /* scrolling moves sheets over the wallpaper. Re-anchoring each sheet's frost from here trails the browser's own
     (threaded) scrolling by one to three frames, and the frost visibly swam under the cards (Jared #13, 2026-10-14:
     "the card edges seem to rerender"). So while its scroller moves, a sheet whose ancestors carry no transform pins
     its frost to the viewport with background-attachment: fixed (data-lg-fixed, glass.css), which the browser keeps in
     step with the content itself; when the scroll settles its frost is anchored where it stopped and the pin lifts, the
     same pixels either way. A transformed ancestor makes a fixed background element-relative, so those sheets keep the
     anchored frost. Rims re-bake once it stops, as before. */
  function fixedSafe(e) {
    for (var n = e; n && n !== document.documentElement; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (cs.transform !== 'none' || cs.translate !== 'none' || cs.scale !== 'none' || cs.rotate !== 'none' || cs.perspective !== 'none' ||
          cs.filter !== 'none' || (cs.backdropFilter && cs.backdropFilter !== 'none' && n !== e) || /transform|filter/.test(cs.willChange)) return false;
    }
    return true;
  }
  function unpin(e) { if (e.hasAttribute('data-lg-fixed')) { anchor(e); e.removeAttribute('data-lg-fixed'); } e.__lgPinTried = false; }
  var scrollQ = false, scrollBoxes = new Set(), settleSheets = new Set(), settleStrips = new Set();
  /* an entrance (a CSS animation or transition) that ends on an element holding a lensed strip: its strips are measured
     again at rest, so a lens placed mid-entrance never stays where the entrance began */
  function endedAround(ev) {
    if (!switchOn() || !lenses.size) return;
    var t = ev.target; if (!t || t.nodeType !== 1 || t.closest(GENERATED)) return;
    var hit = false; lenses.forEach(function (L) { if (!hit && t.contains(L.strip)) hit = true; });
    if (hit) { dirtyScope(t); queueSync(); }
  }
  document.addEventListener('animationend', endedAround, true);
  document.addEventListener('transitionend', endedAround, true);
  document.addEventListener('scroll', function (ev) {
    if (!switchOn()) return;
    var box = ev.target && ev.target.nodeType === 1 ? ev.target : document.documentElement;
    scrollBoxes.add(box);
    if (!scrollQ) { scrollQ = true; requestAnimationFrame(function () {
      scrollQ = false; var boxes = Array.from(scrollBoxes); scrollBoxes.clear();
      if (!switchOn()) return;
      /* under a look's cover nothing that scrolled is measured: its strips and its sheets wait for the lift (deferStrip,
         deferSheet; pm7-f5-nier, Reduce Animations NieR on: an anchoring scroll at the cover's frame forced 22 + 41 ms
         of style and 10 ms of layout here, under the opaque cover, just before the reveal) */
      if (pageCovered()) {
        boxes.forEach(function (b) {
          var ss = scrollSheets.get(b), ls = scrollStrips.get(b);
          if (ss && isGlass()) ss.forEach(function (e) { if (e.isConnected) deferSheet(e); });
          if (ls) ls.forEach(function (s) { if (s.isConnected) deferStrip(s); });
        });
        return;
      }
      var glass = isGlass();
      var sheets = new Set(), strips = new Set(), positions = new Map(), offsets = new Map();
      /* a room change scrolls Usage's board to its top while the old room leaves in place: neither is anchored before the
         change ends (boardMoment) */
      var area = boardMoment() ? document.querySelector(BOARD_AREA) : null;
      boxes.forEach(function (b) {
        var ss = scrollSheets.get(b), ls = scrollStrips.get(b);
        /* a sheet that scrolls its own content: where its frost crossfade's overlay must sit (startFrostFade) */
        if (b.__lgScroller && glass && glassSet.has(b)) { b.__lgSx = b.scrollLeft; b.__lgSy = b.scrollTop; }
        if (ss && glass) ss.forEach(function (e) { if (!e.isConnected) return; if (area && area.contains(e)) { boardStale = true; return; } sheets.add(e); settleSheets.add(e); });
        if (ls) ls.forEach(function (s) { if (s.isConnected) { strips.add(s); settleStrips.add(s); } });
      });
      sheets.forEach(function (e) {
        if (e.hasAttribute('data-lg-fixed')) return;
        if (!e.__lgPinTried) { e.__lgPinTried = true; if (fixedSafe(e)) { e.setAttribute('data-lg-fixed', ''); return; } }
        positions.set(e, layoutPos(e, offsets));
      });
      positions.forEach(function (lp, e) { anchor(e, lp); });
      var moving = []; cvSeen = new Map();
      try {
        strips.forEach(function (s) { var L = lenses.get(s); if (L && !L.dragging) { if (cvSkipped(s)) { cvSkip(s); return; } L.snap = true; moving.push([L.cfg, s]); } });
        syncStrips(moving);
      } finally { cvSeen = null; }
    }); }
    /* the settle (un-pin, re-bake rims, re-sync strips) runs once the scroll has been still for 160 ms; it used to run
       140 ms after the scroll began, so a long scroll re-baked every moving card's rims several times on the way */
    clearTimeout(scrollSettleT); scrollSettleT = setTimeout(function () { scrollSettleT = 0; queueSync(); }, 160);
  }, true);
  var scrollSettleT = 0;
  /* a wheel arrives before the scroll it causes: pin that scroller's sheets now, so even its first step moves in step */
  document.addEventListener('wheel', function (ev) {
    if (!isGlass()) return;
    for (var n = ev.target && ev.target.nodeType === 1 ? ev.target : null; n; n = n.parentElement) {
      var ss = scrollSheets.get(n);
      if (ss) ss.forEach(function (e) { if (e.isConnected && !e.hasAttribute('data-lg-fixed') && !e.__lgPinTried) { e.__lgPinTried = true; if (fixedSafe(e)) e.setAttribute('data-lg-fixed', ''); settleSheets.add(e); } });
    }
  }, { passive: true, capture: true });

  /* ---- springs ------------------------------------------------------------------------------------------------------
     A damped spring from 0 to 1 sampled at 60 fps until it rests: the same curve every motion uses, so everything moves
     like one material. Returns [{t, x, v}] with t in ms. */
  var springCache = new Map();
  function spring(stiff, damp, mass, v0) {
    var key = [stiff, damp, mass || 1, v0 || 0].join('|');
    if (springCache.has(key)) return springCache.get(key);
    var x = 0, v = v0 || 0, dt = 1 / 120, out = [{ t: 0, x: 0, v: v }], t = 0;
    for (var i = 0; i < 1200; i++) {
      var a = (-stiff * (x - 1) - damp * v) / (mass || 1); v += a * dt; x += v * dt; t += dt;
      if (i % 2 === 1) out.push({ t: t * 1000, x: x, v: v });
      if (Math.abs(x - 1) < 0.0006 && Math.abs(v) < 0.004 && t > 0.1) break;
    }
    out[out.length - 1].x = 1;
    if (springCache.size >= 16) springCache.delete(springCache.keys().next().value);
    springCache.set(key, out); return out;
  }
  var LIQUID = [230, 19, 1];   /* a lively spring: one clear overshoot, a small second one (menus) */
  var SOFT = [170, 22, 1];
  var GLIDE = [260, 27, 1];    /* the lens's path: it barely overshoots, so a long jump never sails past its tab */

  /* ---- lenses: the chosen item sits under a clear lens that moves like a drop and magnifies what it passes ---------
     Seen frame by frame at 60 fps on the RTX 3090 (2026-10-13), the old lens waited for the app: a page or panel
     switch keeps the main thread busy for 300 to 700 ms after the click, and the lens's animation, created in that
     window, only began when it ended, then caught up in a jump. Now the lens leaves on the press (pointerdown),
     about a tenth of a second before the click starts that work. Targets are measured where they are laid out,
     ignoring transforms, so a press flex or the rail's bump can no longer give the lens a wrong size that it then
     corrects with a twitch. */
  var STRIPS = [
    { sel: 'nav.page-tabs', items: '.page-tab', scrub: true, kind: 'lens' },
    { sel: '#pmuRange', items: ':scope > button', scrub: true, kind: 'lens' },
    { sel: '#pmuNav', items: '.pmu-navbtn', vertical: true, kind: 'lensRow' },
    { sel: '#sidePanelSlot .pm-segtab', items: '.pm-segtab-item', many: true, scrub: true, kind: 'lens' },
    { sel: '#activityBar', items: '.icon[data-target]', vertical: true, kind: 'lensIcon', pick: railIcon,
      box: function (i) { return i.querySelector('.symbol') || i; }, label: function (i) { return i.querySelector('.symbol'); } },
    /* press: false - a progress rail, not a choice: its steps have no click, so the lens moves only when the step does */
    { sel: '#pm-o55-onboarding .o55-raillist', items: '.o55-railitem', kind: 'lens', active: '[data-state="current"]', pad: 6, magRest: 1, magLift: 1, press: false,
      box: function (i) { var u = unionRect([i.querySelector('.o55-railnode'), i.querySelector('.o55-raillabel')]); return u || i; } },
    { sel: '#pm-o55-onboarding .o55-seg', items: 'button', many: true, kind: 'lens', active: '.o55-on', magRest: 1, mark: true },
    /* 2026-10-13: every Glass tab indicator (Jared): the Orchestrator's views, and the terminal Customize screen's
       choices (pm7-terminal-customizer). In-flow indicators that slide with their own content (the home panels'
       plate, every other .pmw-ink-row) take the lens's material in glass.css instead, so they stay right through
       scrolling, reordering and closing. mark: the strip carries data-lg-lensed, so its own fill steps aside. */
    { sel: '.orch-tabs', items: '.orch-tab', kind: 'lens' },
    { sel: '.pmt-cz .pmw-ink-row', items: '.pmw-ink-opt', many: true, kind: 'lens', active: ':is([aria-selected="true"], [aria-checked="true"])', magRest: 1, mark: true },
    /* 2026-10-14: the Planning Wizard's work-type choice (pm7-wizard-orch); its own .sel fill steps aside under data-lg-lensed */
    { sel: '#panel-wizard .pm6-wiz-intent-row', items: '.pm6-wiz-intent-chip', kind: 'lens', active: '.sel', magRest: 1, mark: true },
    /* Jared #14 (2026-10-14): the theme menu's Light / Dark / Auto, drawn inside the menu (LENS_HOSTS) */
    { sel: '#themeMenu .pm6-tt-modes', items: '.pm6-tt-mode', kind: 'lens', active: '[aria-checked="true"]', magRest: 1, mark: true },
    /* Jared #22 (2026-10-15): Settings' selectors are the same switcher. The left bar (Settings Home and the chapters),
       the chapter's section tabs, the page index beside them and each manager's tabs carry the lens; their own fills,
       bars, dots, underlines and inks step aside (glass.css section 6). Segmented choices and the service lists live in
       content that scrolls under Settings' sticky bars, so they take the lens's material in place instead. */
    { sel: '#pm-settings-root .rail-scroll', items: ':is(.side-link[data-action="home"], .domain-link)', vertical: true, kind: 'lensRow', mark: true },
    { sel: '#pm-settings-root nav.workspace-tabs', items: '.workspace-tab', many: true, kind: 'lens', active: '.is-current', magRest: 1, mark: true },
    /* the index's own rows: a manager's pages, or a page's sections where it has no manager (their current row follows
       the scroll); the sections under an open page are words only */
    { sel: '#pm-settings-root nav.page-index-card', items: '.pm51-index-group > .index-link', many: true, vertical: true, kind: 'lensRow', active: '.is-active', mark: true },
    { sel: '#pm-settings-root nav.manager-tabs', items: '.manager-tab', many: true, kind: 'lens', active: '[aria-selected="true"]', magRest: 1, mark: true },
    /* 2026-10-16 (after Q16): Settings' segmented choices. They live in content that scrolls under Settings' sticky bars,
       so in every look their chip is the control's own under-layer (under: the lens inside the control, under its
       labels), which scrolls with it and stays under the bars; it wears the material the chosen segment wore in place */
    { sel: '#pm-settings-root .segmented', items: ':scope > button', many: true, kind: 'lens', active: ':is([aria-checked="true"], [aria-pressed="true"])', pad: 0, magRest: 1, mark: true, under: true },
  ];
  function railIcon(strip) {
    var sp = document.getElementById('sidePanelSlot'); if (!sp || !visible(sp)) return null;
    var v = sp.querySelector(':scope > .side-panel-view.active');
    var icon = v && strip.querySelector('.icon[data-target="' + v.id + '"]');
    strip.querySelectorAll('.icon[data-lg-current]').forEach(function (i) { if (i !== icon) i.removeAttribute('data-lg-current'); });
    if (icon && !icon.hasAttribute('data-lg-current')) icon.setAttribute('data-lg-current', ''); return icon;
  }
  /* Every lens lives in one layer above the strips and the title bar (#lg-lenses), not inside them: from outside it sees
     the sheet, the wallpaper and the label together, and no sheet can cover it. */
  /* one layer per host surface: the app shell, or a window that floats above it (onboarding's window, a dialog in
     #pmw-overlay such as the Customize screens, or any element its owner marks data-lg-lens-host), so a lens is never
     covered by the surface its strip lives in. #pmw-overlay sits above the app shell, so a lens in #lg-lenses was
     drawn under those dialogs and never seen (2026-10-14). */
  /* a page is a host too (Jared #21, 2026-10-15): a strip inside a page (Usage's rail and range, Home's panel tabs,
     Settings') has its lens in the page's own layer, so the lens rides the page's entrance with its tabs instead of being
     measured mid-slide in the app-wide layer and then sliding the last 50 px into place */
  var LENS_HOSTS = '#pm-o55-onboarding .o55-win, #pmw-overlay .pmt-cz-dialog, #pmw-overlay [role="dialog"], #themeMenu, [data-lg-lens-host], .primary-content > .page';
  var lenses = new Map(), layer = null, localLayers = new WeakMap();
  /* strips whose lens is always their own under-layer, whatever the look's layer mode (STRIPS' under) */
  var ownUnder = new WeakSet();
  function lensLayer(strip) {
    if (strip && (switchUnder || ownUnder.has(strip))) return underLayer(strip);
    var host = strip && strip.closest && strip.closest(LENS_HOSTS);
    if (host) {
      var own = localLayers.get(host);
      if (own && own.isConnected && own.parentElement === host) return own;
      own = host.querySelector(':scope > .lg-lenses-local');
      if (!own) { own = el('div', { class: 'lg-lenses-local', 'aria-hidden': 'true' }); host.appendChild(own); }
      localLayers.set(host, own); return own;
    }
    if (layer && layer.isConnected) return layer;
    layer = el('div', { id: 'lg-lenses', 'aria-hidden': 'true' });
    (document.querySelector('.app-shell') || document.body).appendChild(layer); return layer;
  }
  /* the layer lensLayer(strip) gives a new lens of this strip, without making it: el is that layer if it exists (else
     null), parent the element it is (or will be) the child of; app: the app-wide layer */
  function layerOf(strip, cfg) {
    var ownU = !!cfg.under || ownUnder.has(strip);
    if (switchUnder || ownU) { var u = strip.__lgUnder; return { el: u && u.parentElement === strip ? u : null, parent: strip, app: false, ownUnder: ownU }; }
    var host = strip.closest && strip.closest(LENS_HOSTS);
    if (host) {
      var own = localLayers.get(host);
      if (!(own && own.isConnected && own.parentElement === host)) own = host.querySelector(':scope > .lg-lenses-local');
      return { el: own || null, parent: host, app: false, ownUnder: false };
    }
    var on = layer && layer.isConnected ? layer : null;
    return { el: on, parent: on ? on.parentElement : null, app: true, ownUnder: false };
  }
  /* --pm-switch-layer: under. The strip's own layer, added once as the strip's last child (no :first-child or :nth-child
     rule of its items changes; an item's :last-child does, so strips use :last-of-type, which the layer's own tag never
     takes; a custom tag matches no item selector) and positioned over the strip's padding box, so its
     lens paints over the strip's track and under its items (z-index 1). A static strip is made relative while it holds
     the layer. The layer goes when its lens does (the strip is redrawn or the look leaves this mode). */
  function underLayer(strip) {
    var own = strip.__lgUnder;
    if (own && own.parentElement === strip) return own;
    /* data-o55-foreign: Settings' in-place patch (kit.d/28-in-place.js) keeps it through a re-render of the strip */
    own = el('lg-under', { class: 'lg-lenses-under', 'aria-hidden': 'true', 'data-o55-foreign': '' });
    if (preread(strip) ? preread(strip).isStatic : getComputedStyle(strip).position === 'static') { strip.style.position = 'relative'; strip.__lgPos = true; }
    strip.appendChild(own); strip.__lgUnder = own; return own;
  }
  function dropUnderLayer(strip, own) {
    if (own && own.parentElement) own.remove();
    if (strip.__lgUnder === own) strip.__lgUnder = null;
    if (strip.__lgPos && !strip.__lgUnder) { strip.style.removeProperty('position'); strip.__lgPos = false; }
  }
  /* the lens is 2 px larger than the item on every side, so the label never reaches into its bevel at rest */
  function unionRect(list) {
    var r = null; list.forEach(function (e) { if (!e) return; var b = boxRect(e); if (b.width < 1) return;
      r = r ? { left: Math.min(r.left, b.left), top: Math.min(r.top, b.top), right: Math.max(r.right, b.left + b.width), bottom: Math.max(r.bottom, b.top + b.height) } : { left: b.left, top: b.top, right: b.left + b.width, bottom: b.top + b.height }; });
    if (r) { r.width = r.right - r.left; r.height = r.bottom - r.top; } return r;
  }
  /* where an element is laid out on screen, without its own transform or those of its transformed ancestors (the
     first untransformed ancestor's real box anchors it, so scrolling and ordinary layout still count) */
  /* within one sync the app's transforms do not change (Glass writes none), so each ancestor is asked once (movedIn, set for
     the length of syncPending: boxRect asked every strip's offset parents again, B6) */
  var movedIn = null;
  function moved(n) {
    if (movedIn && movedIn.has(n)) return movedIn.get(n);
    var cs = getComputedStyle(n), m = cs.transform !== 'none' || cs.scale !== 'none' || cs.translate !== 'none' || cs.rotate !== 'none';
    if (movedIn) movedIn.set(n, m);
    return m;
  }
  function boxRect(e) {
    var w = e.offsetWidth, h = e.offsetHeight;
    if (w == null || !e.offsetParent || (!w && !h)) return e.getBoundingClientRect();
    var x = 0, y = 0, n = e;
    for (;;) {
      var p = n.offsetParent; x += n.offsetLeft; y += n.offsetTop;
      for (var a = n.parentElement; a && a !== p; a = a.parentElement) { x -= a.scrollLeft; y -= a.scrollTop; }
      if (!p || p === document.body) return { left: x - scrollX, top: y - scrollY, width: w, height: h };
      if (!moved(p)) { var pr = p.getBoundingClientRect(); return { left: pr.left + p.clientLeft - p.scrollLeft + x, top: pr.top + p.clientTop - p.scrollTop + y, width: w, height: h }; }
      x += p.clientLeft - p.scrollLeft; y += p.clientTop - p.scrollTop; n = p;
    }
  }
  /* an element's place in its host's own layout (the offset chain up to the host, less what scrolls between): a host's
     transform (a page's entrance, a menu growing from its button) moves the element and the host's lens layer alike,
     so a lens placed in these units stays on its item through the whole entrance. null when the chain does not reach
     the host. */
  function hostRect(e, host) {
    if (!e.offsetParent) return null;
    var x = 0, y = 0, n = e;
    while (n && n !== host) {
      var p = n.offsetParent; if (!p) return null;
      x += n.offsetLeft; y += n.offsetTop;
      for (var a = n.parentElement; a && a !== p; a = a.parentElement) { x -= a.scrollLeft; y -= a.scrollTop; }
      if (p !== host) { if (!host.contains(p)) return null; x += p.clientLeft - p.scrollLeft; y += p.clientTop - p.scrollTop; }
      n = p;
    }
    return n === host ? { left: x, top: y, width: e.offsetWidth, height: e.offsetHeight } : null;
  }
  /* lay (optional, the read phase of a sync: layerOf): the layer the lens is or will be in, which is not made here; when
     its box would be needed and it does not exist yet, rectIn returns null and the write measures it */
  function rectIn(strip, t, pad, lay) {
    var L = lay ? lay.el : lensLayer(strip), parent = lay ? lay.parent : L.parentElement, app = lay ? lay.app : L === layer;
    pad = pad || 0;
    /* a chip that is always under its labels (ownUnder) replaces the fill the chosen item wore in place, so at rest it has
       to sit on that fill's exact box: the offset chain rounds to whole pixels and left a one-pixel seam at each edge.
       The item's own box, fractions kept, in the strip's padding box (an untransformed item; a transformed one is
       placed by the offset chain as before) */
    if ((lay ? lay.ownUnder : ownUnder.has(strip)) && t.getBoundingClientRect && parent === strip) {
      var ts = getComputedStyle(t);
      if (ts.transform === 'none' && ts.scale === 'none' && ts.translate === 'none') {
        var tr = t.getBoundingClientRect(), sr = strip.getBoundingClientRect(), k = stripScale(strip, sr);
        return { x: (tr.left - sr.left) / k - strip.clientLeft - pad, y: (tr.top - sr.top) / k - strip.clientTop - pad, w: tr.width / k + 2 * pad, h: tr.height / k + 2 * pad };
      }
    }
    if (t.getBoundingClientRect && !app && parent) {
      var h = hostRect(t, parent);
      if (h) return { x: h.left - pad, y: h.top - pad, w: h.width + 2 * pad, h: h.height + 2 * pad };
    }
    if (!L) return null;
    if (lay) lay.usedEl = true;
    var r = t.getBoundingClientRect ? boxRect(t) : t, lr = L.getBoundingClientRect();
    return { x: r.left - lr.left - pad, y: r.top - lr.top - pad, w: r.width + 2 * pad, h: r.height + 2 * pad };
  }
  function lensFor(strip, cfg) {
    var L = lenses.get(strip);
    if (L && L.lens.isConnected) { indexAncestors(strip, scrollStrips, stripAncestors); return L; }
    if (L) disposeLens(L, true);
    indexAncestors(strip, scrollStrips, stripAncestors);
    var parked = unparkLens(strip);
    if (parked) { parked.cfg = cfg; lenses.set(strip, parked); if (cfg.mark && !strip.hasAttribute('data-lg-lensed')) strip.setAttribute('data-lg-lensed', ''); return parked; }
    if (cfg.under) ownUnder.add(strip);
    /* a control the app drew again from scratch (a Settings manager redraws its body on a change) takes the chip of the one
       it replaced: same strip kind, same label and choices, gone within the last 1.2 s. Its chip starts where the old one
       was drawn, so it moves on to the new choice instead of appearing there */
    var heir = cfg.under ? inheritLens(strip, cfg) : null;
    var lens = el('i', { class: 'lg-lens', 'aria-hidden': 'true', 'data-lg-lens': cfg.kind }), own = lensLayer(strip);
    own.appendChild(lens);
    L = { strip: strip, lens: lens, layer: own, under: own.classList.contains('lg-lenses-under'), rect: null, anim: null, glintAnim: null, magAnims: null, scrubCleanup: null, cfg: cfg, warm: '', scroller: preread(strip) ? preread(strip).scroller : scrollerOf(strip) }; lenses.set(strip, L); strip.__lgPre = null;
    /* an under-layer lens lost with its layer while its strip stays (the app redrew the strip's rows: Settings' left bar
       on a chapter change) comes back where the old chip was drawn, so it glides on to the new choice instead of
       appearing there */
    if (heir) { var hs = lens.style; hs.left = heir.x + 'px'; hs.top = heir.y + 'px'; hs.width = heir.w + 'px'; hs.height = heir.h + 'px'; L.rect = heir; L.tgt = null; }
    var last = L.under && strip.__lgLast;
    if (last) {
      strip.__lgLast = null;
      if (performance.now() - last.t < 1200) {
        var s = lens.style; s.left = last.rect.x + 'px'; s.top = last.rect.y + 'px'; s.width = last.rect.w + 'px'; s.height = last.rect.h + 'px';
        L.rect = last.rect; L.tgt = null; L.pending = last.pending;   /* no target yet: the next sync travels from here */
      } else if (last.pending) pressMark(last.pending, false);
    }
    if (cfg.mark && !strip.hasAttribute('data-lg-lensed')) strip.setAttribute('data-lg-lensed', '');
    return L;
  }
  function stripKey(strip, cfg) {
    var b = strip.querySelectorAll(cfg.items), a = b.length ? b[0].getAttribute('data-action') || '' : '';
    return cfg.sel + '|' + (strip.getAttribute('aria-label') || '') + '|' + a + '|' + b.length + '|' + Array.prototype.map.call(b, function (x) { return x.getAttribute('data-value') || x.textContent.trim(); }).join('/');
  }
  /* the scale a transform puts on a strip (a page's entrance); offsetWidth is whole pixels, so a width that differs by less
     than one is the rounding, not a scale (dividing by it put a chip a fifth of a pixel off its segment) */
  function stripScale(strip, sr) { var w = strip.offsetWidth; return w && Math.abs(sr.width - w) >= 1 ? sr.width / w : 1; }
  /* chips of controls the app took away right after a choice on them (pruneLenses), for the control drawn in their place */
  var heirs = [];
  function inheritLens(strip, cfg) {
    var key = stripKey(strip, cfg), now = performance.now(), out = null;
    heirs = heirs.filter(function (h) { return now - h.t < 1200; });
    for (var i = 0; i < heirs.length && !out; i++) {
      if (heirs[i].key !== key) continue;
      var h = heirs.splice(i, 1)[0], sr = strip.getBoundingClientRect(), k = stripScale(strip, sr);
      out = { x: (h.x - sr.left) / k - strip.clientLeft, y: (h.y - sr.top) / k - strip.clientTop, w: h.w, h: h.h };
    }
    return out;
  }
  /* a choice made on a control whose chip is its own (ownUnder): where the control is on screen now, before the app's
     handler can take it away (a click from the pointer or the keyboard, in the capture phase) */
  document.addEventListener('click', function (e) {
    var hit = e.target && e.target.closest ? stripAt(e.target) : null; if (!hit || !hit.cfg.under) return;
    var L = lenses.get(hit.strip); if (!L || !L.rect) return;
    var sr = hit.strip.getBoundingClientRect(), k = stripScale(hit.strip, sr);
    L.choseAt = performance.now(); L.choseBox = { left: sr.left + hit.strip.clientLeft * k, top: sr.top + hit.strip.clientTop * k, k: k, key: stripKey(hit.strip, hit.cfg) };
  }, true);
  /* the nearest ancestor that scrolls this strip: its lens follows it at once while it scrolls, and steps out of
     sight when its target leaves the visible part (the lens layer is not clipped by the strip's container) */
  var preSerial = 0;
  function prereadStrip(s) { s.__lgPre = { n: preSerial, scroller: scrollerOf(s), isStatic: getComputedStyle(s).position === 'static' }; }
  function preread(s) { return s.__lgPre && s.__lgPre.n === preSerial ? s.__lgPre : null; }
  function scrollerOf(e) {
    for (var a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      var cs = getComputedStyle(a);
      if (/(auto|scroll|hidden)/.test(cs.overflowX + cs.overflowY) && (a.scrollWidth > a.clientWidth + 1 || a.scrollHeight > a.clientHeight + 1)) return a;
    }
    return null;
  }
  function setLensBox(L, R) {
    var s = L.lens.style, A = L.rect;
    if (!A || A.x !== R.x) s.left = R.x + 'px'; if (!A || A.y !== R.y) s.top = R.y + 'px';
    if (!A || A.w !== R.w) s.width = R.w + 'px'; if (!A || A.h !== R.h) s.height = R.h + 'px'; L.rect = R;
    /* the refracting optics are Glass's; an adopting look draws the lens from its tokens, and a lens that is always under
       its labels (ownUnder) wears the in-place material with no live filter: under the labels it would only bend the
       track, at the price of a render pass per control */
    if (isGlass() && !ownUnder.has(L.strip)) { if (lensMounts) lensMounts.set(L.lens, L.cfg.kind); else mount(L.lens, L.cfg.kind); }
  }
  /* every item size of a strip gets its lens filter while nothing moves, so a move never waits for a map to decode. It is
     asked for in idle time (prewarmSoon): run inside the sync, it measured every item of every strip again and built maps
     in the frame of the change that brought them (4 ms of the editor's Customize open, Nas1, B6). The lens's own size is
     built when the lens is shown, as before. */
  var prewarmQ = new Map(), prewarmIdle = 0;
  function prewarmSoon(L, cfg, strip) {
    if (!gpu() || !isGlass()) return;
    prewarmQ.set(strip, [L, cfg]);
    if (prewarmIdle) return;
    var run = function () {
      prewarmIdle = 0; var q = Array.from(prewarmQ); prewarmQ.clear();
      q.forEach(function (e) { var L = e[1][0]; if (L.lens.isConnected && lenses.get(e[0]) === L) prewarm(L, e[1][1], e[0]); });
    };
    prewarmIdle = window.requestIdleCallback ? requestIdleCallback(run, { timeout: 500 }) : setTimeout(run, 100);
  }
  function prewarm(L, cfg, strip) {
    if (!gpu() || !isGlass() || cfg.under) return;
    var pad = cfg.pad == null ? 2 : cfg.pad, sizes = [];
    strip.querySelectorAll(cfg.items).forEach(function (it) {
      if (!visible(it)) return; var b = cfg.box ? cfg.box(it) : it; if (!b) return; var r = b.getBoundingClientRect ? boxRect(b) : b;
      var s = Math.round(r.width + 2 * pad) + 'x' + Math.round(r.height + 2 * pad); if (sizes.indexOf(s) < 0) sizes.push(s);
    });
    var key = sizes.join(','); if (L.warm === key) return; L.warm = key;
    sizes.forEach(function (s) { var wh = s.split('x').map(Number); if (wh[0] >= 4 && wh[1] >= 4) lensFilterFor(cfg.kind, wh[0], wh[1], radiusOf(L.lens, wh[0], wh[1])); });
  }
  function stopMagnify(L) { if (L.magAnims) { var a = L.magAnims; L.magAnims = null; a.forEach(function (an) { an.cancel(); }); } }
  /* a lens first shown while its item is still entering (Usage's rail rows slide 12 px in, a menu's rows fade in) moves
     with the item: the running transform and opacity animations of the item and of its ancestors up to the lens's host
     are mirrored onto the lens on the same clock, so the item never slides into a lens already in place (Jared #21) */
  var RIDE_MOVE = ['transform', 'translate', 'scale', 'rotate'];
  function ride(L, target) { rideApply(L, rideRead(L, target)); }
  /* what a ride mirrors, read (the animations, their keyframes and clocks) before anything is written, so a sync that shows
     many new lenses reads them all in one style pass (B6 packet 1); rideApply writes the mirrors */
  function rideRead(L, target) {
    var stop = L.layer.parentElement, out = [];
    function mirror(a, kfs, t, props, composite) {
      var kf = [], any = false;
      kfs.forEach(function (k) {
        var o = { offset: k.computedOffset, easing: k.easing || 'linear' };
        props.forEach(function (p) { if (k[p] != null && k[p] !== '') { o[p] = k[p]; any = true; } });
        kf.push(o);
      });
      if (!any || kf.length < 2) return;
      out.push({ kf: kf, opts: { duration: t.duration, delay: t.delay, easing: t.easing, fill: 'backwards', iterations: 1, composite: composite }, startTime: a.startTime, currentTime: a.currentTime });
    }
    for (var n = target; n && n !== stop && n !== document.documentElement; n = n.parentElement) {
      n.getAnimations().forEach(function (a) {
        if (!a.effect || (a.playState !== 'running' && a.playState !== 'pending')) return;
        var kfs = a.effect.getKeyframes(), t = a.effect.getTiming();
        mirror(a, kfs, t, RIDE_MOVE, 'add'); mirror(a, kfs, t, ['opacity'], 'replace');
      });
    }
    return out;
  }
  function rideApply(L, specs) {
    stopRide(L);
    var out = [];
    specs.forEach(function (sp) {
      var m;
      try { m = L.lens.animate(sp.kf, sp.opts); } catch (e) { return; }
      if (sp.startTime != null) m.startTime = sp.startTime; else if (sp.currentTime != null) m.currentTime = sp.currentTime;
      out.push(m);
    });
    L.ride = out.length ? out : null;
  }
  /* a lens first shown in a page or window is measured while that page is still coming in, and content above a strip can
     still grow by a layout animation (a Settings manager page eases its height as its tab changes, moving every strip
     below it; no mutation or event says so). It is measured once more when entrances are over, and follows if its
     item moved (a lens in Settings rested 8 px under its tab otherwise). */
  /* the lenses whose checks fall before the same frame's layout are measured together there (B6 packet 1: a sheet that
     shows many new lenses checks them all about 480 ms later, and one by one each paid a style and layout pass) */
  var settleDue = [];
  function settleCheck(L) {
    clearTimeout(L.settleT);
    /* measured after that frame's layout, not in the timer (where it forced what the page had pending) */
    L.settleT = setTimeout(function () {
      L.settleT = 0;
      settleDue.push(L);
      if (settleDue.length === 1 && !afterLayout(settleNow)) settleNow();
    }, 480);
  }
  function settleNow() {
    var due = settleDue, list = []; settleDue = []; cvSeen = new Map();
    try {
      due.forEach(function (L) {
        if (lenses.get(L.strip) !== L || !L.strip.isConnected || L.dragging || L.pending || !switchOn()) return;
        if (cvSkipped(L.strip)) cvSkip(L.strip); else list.push([L.cfg, L.strip]);
      });
      syncStrips(list);
    } finally { cvSeen = null; }
  }
  function stopRide(L) { if (L.ride) { var r = L.ride; L.ride = null; r.forEach(function (m) { m.cancel(); }); } }
  function stopLensTravel(L) {
    stopMagnify(L); stopRide(L); stopHop(L);
    if (L.glintAnim) { var g = L.glintAnim; L.glintAnim = null; g.cancel(); }
    if (L.anim) { var an = L.anim; L.anim = null; an.onfinish = null; an.cancel(); } L.reducedAnim = false;
  }
  function removeLensElement(e) {
    if (typeof unmount === 'function') unmount(e);
    else { glassSet.delete(e); if (sizeWatch) sizeWatch.unobserve(e); e.__lgF = null; e.__lgSig = null; }
    e.remove();
  }
  function disposeLens(L, keepMark) {
    var carried = false;
    if (L.under && L.rect && L.strip.isConnected && !L.lens.isConnected) {
      carried = true;
      var carry = L.strip.__lgLast = { rect: visualRect(L) || L.rect, pending: L.pending, t: performance.now() }, cs = L.strip, mark = !!(L.cfg && L.cfg.mark);
      /* a carry nobody takes up in time lets its press marks go (Glass owner's review), and its strip's mark if no lens of
         the strip's is live (GD-2) */
      if (carry.pending || mark) setTimeout(function () {
        if (cs.__lgLast !== carry) return;
        cs.__lgLast = null;
        if (carry.pending) pressMark(carry.pending, false);
        if (mark && !lenses.has(cs) && cs.hasAttribute('data-lg-lensed')) cs.removeAttribute('data-lg-lensed');
      }, 1300);
    }
    else if (L.pending) pressMark(L.pending, false);
    L.pending = null;
    forgetAncestors(L.strip, scrollStrips, stripAncestors);
    stopLensTravel(L); if (L.scrubCleanup) L.scrubCleanup();
    removeLensElement(L.lens); L.rect = null;
    if (L.layer && L.layer.classList.contains('lg-lenses-local') && !L.layer.children.length) {
      if (L.layer.parentElement) localLayers.delete(L.layer.parentElement); L.layer.remove();
    }
    if (L.under && !L.layer.children.length) dropUnderLayer(L.strip, L.layer);
    /* a marked strip's own fill steps aside only under its chip (data-lg-lensed): a strip left without a lens takes it back
       (landing review GD-2). A lens made again at once (lensFor) or carried on after the app redrew the strip keeps it,
       and so does a parked lens's strip while another lens of its is live. */
    if (!keepMark && !carried && L.cfg && L.cfg.mark && L.strip.isConnected && (!lenses.has(L.strip) || lenses.get(L.strip) === L) &&
        L.strip.hasAttribute('data-lg-lensed')) L.strip.removeAttribute('data-lg-lensed');
  }
  /* the switcher's layer mode changed (a look with --pm-switch-layer: under came or went): every strip's lens moves to the
     layer of the new mode on the next sync. The other mode's lenses are parked, hidden where they are (visibility, so they
     keep their boxes), not taken out: removing 40 lenses and their local layers relaid out the pages that hold them inside
     Glass's after-layout sync (NieR Mode on: 378 ms of layout on Nas1, 521 ms on the P1000, 2026-10-16). A parked lens is
     shown again when its mode comes back, so a NieR or Retro toggle inserts and removes nothing once both modes have run. */
  var parkedLenses = { over: new Map(), under: new Map() };
  function parkLens(L) {
    if (L.pending) pressMark(L.pending, false);
    L.pending = null;
    forgetAncestors(L.strip, scrollStrips, stripAncestors);
    stopLensTravel(L); if (L.scrubCleanup) L.scrubCleanup();
    L.rect = null; L.tgt = null; L.lens.style.visibility = 'hidden';
    /* the strip was made relative only to hold its under-layer, which the other mode does not draw */
    if (L.under && L.strip.__lgPos) L.strip.style.removeProperty('position');
    parkedLenses[L.under ? 'under' : 'over'].set(L.strip, L);
  }
  function unparkLens(strip) {
    var park = parkedLenses[switchUnder ? 'under' : 'over'], P = park.get(strip);
    if (!P) return null;
    park.delete(strip);
    var home = P.lens.isConnected && P.layer.isConnected && (P.under ? P.layer.parentElement === strip : P.layer === lensLayer(strip));
    if (!home) { disposeLens(P, true); return null; }
    if (P.under && strip.__lgPos) strip.style.position = 'relative';
    P.lens.style.removeProperty('visibility'); P.warm = '';
    return P;
  }
  function relayerLenses() {
    /* a strip whose lens is always under (ownUnder) keeps it: its layer does not change with the look's mode */
    lenses.forEach(function (L, strip) { if (ownUnder.has(strip) && L.strip.isConnected && L.lens.isConnected) return; if (L.strip.isConnected && L.lens.isConnected) parkLens(L); else disposeLens(L); lenses.delete(strip); });
    if (typeof hiddenLenses !== 'undefined') hiddenLenses.clear();
  }
  function pruneLenses() {
    lenses.forEach(function (L, strip) {
      if (strip.isConnected && L.lens.isConnected) return;
      /* the control went with a choice just made on it: its chip passes to the control drawn in its place (inheritLens) */
      if (!strip.isConnected && L.choseBox && performance.now() - L.choseAt < 1200 && L.rect) {
        var r = visualRect(L) || L.rect, b = L.choseBox;
        heirs.push({ key: b.key, t: L.choseAt, x: b.left + r.x * b.k, y: b.top + r.y * b.k, w: r.w, h: r.h });
      }
      disposeLens(L); lenses.delete(strip);
    });
    [parkedLenses.over, parkedLenses.under].forEach(function (park) {
      park.forEach(function (L, strip) { if (!strip.isConnected || !L.lens.isConnected) { disposeLens(L); park.delete(strip); } });
    });
    if (bead && (!bead.isConnected || (beadOn && !beadOn.isConnected))) { resetBead(); removeLensElement(bead); bead = null; }
    menuMotions.forEach(function (M, menu) {
      if (!menu.isConnected || (menu.id === 'lg-demo-pop' && !menu.hasAttribute('data-open'))) resetMenuMorph(menu);
      else M.animations.forEach(function (target, an) { if (!target.isConnected) { an.cancel(); M.animations.delete(an); } });
    });
    pruneLensFilters();
  }
  function suspendLensMotion() {
    lenses.forEach(function (L) { if (L.pending) pressMark(L.pending, false); L.pending = null; stopLensTravel(L); if (L.scrubCleanup) L.scrubCleanup(); });
    if (isGlass() && beadOn && beadOn.isConnected) { clearTimeout(beadHide); beadHide = 0; stopBeadAnimation(); } else resetBead();
    menuMotions.forEach(function (M, menu) { resetMenuMorph(menu); });
  }
  /* the lens where it is drawn right now (mid-flight included), so a new move starts from there and never jumps. Read
     from the travel's own path and the wall clock, never from the DOM: inside a long task (a page switch) the
     document's animation clock stays at the frame before it, and the DOM reports the lens where it was hundreds of
     milliseconds ago (seen in the films as a jump back along its path). */
  function visualRect(L) {
    var T = L.path; if (!L.anim || !T || !L.rect) return L.rect;
    var t = performance.now() - T.t0; if (t >= T.dur) return L.rect;
    for (var i = 1; i < T.rects.length; i++) if (T.rects[i].t >= t) return T.rects[i];
    return L.rect;
  }
  /* ---- magnification: the labels a lens passes over swell as vector text, about the lens's centre, so they stay
     crisp. Each label's scale and shift are keyframed from the lens's own path, so they ride the same clock as the
     lens and need nothing from the main thread while they play. */
  function labelsOf(cfg, strip, vertical) {
    return Array.prototype.slice.call(strip.querySelectorAll(cfg.items)).filter(visible).map(function (it) {
      var e = cfg.label ? cfg.label(it) : it; if (!e) return null;
      var r = boxRect(e); return { el: e, c: vertical ? r.top + r.height / 2 : r.left + r.width / 2, half: (vertical ? r.height : r.width) / 2 };
    }).filter(Boolean);
  }
  function magsOf(cfg) {
    var k = KINDS[cfg.kind] || {}, rest = cfg.magRest != null ? cfg.magRest : k.magRest || 1, lift = cfg.magLift != null ? cfg.magLift : k.magLift || 1;
    if (switchSwell !== 1) { rest = 1 + (rest - 1) * switchSwell; lift = 1 + (lift - 1) * switchSwell; }   /* --pm-switch-swell (never in Glass) */
    return { rest: rest, lift: lift };
  }
  /* how much of a label the lens covers: 1 while the label's centre is well inside it, easing to 0 as it leaves */
  function coverage(c, half, lab) {
    var d = Math.abs(lab.c - c), a = half - lab.half * 0.55, b = half + lab.half * 0.35;
    if (d <= a) return 1; if (d >= b) return 0; var u = (d - a) / (b - a); return 1 - u * u * (3 - 2 * u);
  }
  function magnified(lab, c, half, lift, mags) {
    var k = coverage(c, half, lab), m = 1 + k * (mags.rest - 1 + lift * (mags.lift - mags.rest));
    return { k: k, m: m, d: Math.max(-4, Math.min(4, (lab.c - c) * (m - 1))) };
  }
  function magnifyAlong(L, track, dur, o) {
    stopMagnify(L);
    if (!o || !o.labels || !o.labels.length || (o.mags.rest === 1 && o.mags.lift === 1)) return;
    var anims = [];
    o.labels.forEach(function (lab) {
      var touched = false, fr = track.map(function (s) {
        var g = magnified(lab, s.c, s.half, s.lift, o.mags); if (g.k > 0.001) touched = true;
        return { offset: s.t / dur, scale: g.m.toFixed(4), translate: o.vertical ? '0px ' + g.d.toFixed(2) + 'px' : g.d.toFixed(2) + 'px 0px' };
      });
      if (touched) anims.push(lab.el.animate(fr, { duration: dur, easing: 'linear' }));
    });
    L.magAnims = anims;
  }
  /* travel from A to B: the drop lifts (grows a little, and the labels under it swell more), stretches along its path
     with its speed and thins across it, lands at most 3 px past its target, and wobbles once as it settles. Its glint
     slides back against the motion, like light caught on a moving drop. */
  function travel(L, A, B, vertical, o) {
    stopLensTravel(L);
    setLensBox(L, B);
    var S = spring.apply(null, GLIDE), dur = S[S.length - 1].t, frames = [], glint = [], track = [];
    var dist = vertical ? (B.y + B.h / 2) - (A.y + A.h / 2) : (B.x + B.w / 2) - (A.x + A.w / 2), ad = Math.abs(dist), dir = dist < 0 ? -1 : 1;
    var sw = A.w / B.w, shh = A.h / B.h, land = -1, lr = L.layer.getBoundingClientRect(), liq = switchLiquid;   /* --pm-switch-liquid (never in Glass) */
    var cB = vertical ? lr.top + B.y + B.h / 2 : lr.left + B.x + B.w / 2, rects = [];
    for (var i = 0; i < S.length; i++) {
      var t = S[i].t, p = S[i].x, v = S[i].v, over = (p - 1) * ad;
      if (over > 0) p = 1 + 3 * Math.tanh(over / 3) / Math.max(1, ad);
      if (land < 0 && p >= 0.985) land = t;
      var off = (1 - p) * -dist, lift = Math.max(0, Math.sin(Math.PI * Math.min(1, t / (dur * 0.62))));
      var sp = Math.min(1, Math.abs(v) * ad / 2400), along = 1 + Math.min(0.24, sp * 0.3) * liq, across = 1 - (along - 1) * 0.4;
      var wob = land < 0 ? 0 : liq * 0.05 * Math.min(1, ad / 120) * Math.exp(-(t - land) / 110) * Math.sin(2 * Math.PI * (t - land) / 190);
      var q = Math.min(1, Math.max(0, p)), grow = 1 + 0.07 * lift * liq, w = (sw + (1 - sw) * q) * grow, h = (shh + (1 - shh) * q) * grow;
      var sx = vertical ? w * across * (1 - wob * 0.6) : w * along * (1 + wob), sy = vertical ? h * along * (1 + wob) : h * across * (1 - wob * 0.6);
      var at = t / dur;
      frames.push({ offset: at, transform: (vertical ? 'translate3d(0,' + off.toFixed(2) + 'px,0)' : 'translate3d(' + off.toFixed(2) + 'px,0,0)') + ' scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')' });
      var gl = (-dir * Math.min(6, Math.abs(v) * ad / 900)).toFixed(2);
      glint.push({ offset: at, transform: vertical ? 'translate3d(0,' + gl + 'px,0)' : 'translate3d(' + gl + 'px,0,0)', opacity: (0.6 + 0.4 * lift).toFixed(3) });
      track.push({ t: t, c: cB + off, half: (vertical ? B.h * sy : B.w * sx) / 2, lift: lift });
      var rw = B.w * sx, rh = B.h * sy;
      rects.push({ t: t, x: B.x + B.w / 2 - rw / 2 + (vertical ? 0 : off), y: B.y + B.h / 2 - rh / 2 + (vertical ? off : 0), w: rw, h: rh });
    }
    var an = L.lens.animate(frames, { duration: dur, easing: 'linear' }); L.anim = an; L.path = { t0: performance.now(), dur: dur, rects: rects };
    try { L.glintAnim = L.lens.animate(glint, { duration: dur, easing: 'linear', pseudoElement: '::after' }); } catch (e) { L.glintAnim = null; }
    magnifyAlong(L, track, dur, o);
    an.onfinish = function () { if (L.anim === an) L.anim = null; ownRest(L); };
  }
  /* A strip that is still arriving (its rows sliding in, its bar fading in: Usage's first arrival, a page's entrance)
     shows its lens as it lands, never ahead of it over a blank bar (Jared #2, 2026-10-14). The arrival is whatever
     opacity or transform animation is still running on the target or any of its ancestors; the lens fades in over the
     last 160 ms of the longest one. */
  var ARRIVAL_PROPS = /^(opacity|transform|translate|scale)$/;
  function arrivalLeft(el) {
    var left = 0;
    for (var e = el; e && e !== document.documentElement; e = e.parentElement) {
      if (!e.getAnimations) break;
      var list = e.getAnimations();
      for (var i = 0; i < list.length; i++) {
        var a = list[i]; if (a.playState !== 'running' && a.playState !== 'pending') continue;
        var fx = a.effect; if (!fx || !fx.getComputedTiming) continue;
        var moving = a.transitionProperty ? ARRIVAL_PROPS.test(a.transitionProperty) : (fx.getKeyframes ? fx.getKeyframes().some(function (k) { return k.opacity != null || k.transform != null || k.translate != null || k.scale != null; }) : false);
        if (!moving) continue;
        var t = fx.getComputedTiming(), rate = Math.abs(a.playbackRate || 1);
        if (t.endTime === Infinity || t.localTime == null) continue;
        left = Math.max(left, (t.endTime - t.localTime) / rate);
      }
    }
    return left;
  }
  function arrive(L, target) { arriveIn(L, arrivalLeft(target)); }
  function arriveIn(L, left) {
    if (left < 40) return;
    try { L.lens.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: Math.max(0, left - 160), fill: 'backwards', easing: 'ease-out' }); } catch (e) {}
  }
  /* a lens hidden because its strip or item stopped showing comes back when they show again (Jared #23: "the page
     selector starts out being there but goes away eventually"). A strip can be hidden and shown in ways no observed
     mutation reports: an inline style, inert, an attribute on <html> such as the onboarding window's data-o55-open. Such
     lenses are checked every 400 ms, and only while there are any. */
  var hiddenLenses = new Map(), showT = 0;
  function awaitShow(L, cfg) {
    if (!L.strip.isConnected) { hiddenLenses.delete(L); return; }
    hiddenLenses.set(L, cfg);
    if (!showT) showT = setTimeout(checkShown, 400);
  }
  /* onLayout(fn): fn runs once after the frame's own style and layout, before paint, so every read in it is free (Q16).
     It is afterLayout(fn): one probe and one ResizeObserver for all of Glass. Work that a timer would otherwise run in the
     middle of an app's rebuild waits there instead: */
  function onLayout(fn) { if (!afterLayout(fn)) fn(); }
  /* - the hidden-lens check, whose tick landing on a Settings chapter change forced the half-built page through 242 ms
       of layout in Basic Dark */
  function checkShown() {
    showT = 0;
    if (!switchOn()) { hiddenLenses.clear(); return; }
    onLayout(checkShownNow);
  }
  function checkShownNow() {
    if (showT) return;
    if (!switchOn()) { hiddenLenses.clear(); return; }
    /* every hidden lens is looked at before any shown one is synced, and those are synced together (B6 packet 1) */
    var shown = []; cvSeen = new Map();
    try {
      hiddenLenses.forEach(function (cfg, L) {
        if (!L.strip.isConnected || (cfg.kind === 'lensIcon' && !isGlass())) { hiddenLenses.delete(L); return; }
        if (stripParked(L.strip)) return;
        if (cvSkipped(L.strip)) { hiddenLenses.delete(L); cvSkip(L.strip); return; }
        if (!visible(L.strip)) return;
        var t = cfg.pick ? cfg.pick(L.strip) : L.strip.querySelector(cfg.items + (cfg.active || '.active'));
        if (t && visible(t)) { hiddenLenses.delete(L); shown.push([cfg, L.strip]); }
      });
      syncStrips(shown);
    } finally { cvSeen = null; }
    if (hiddenLenses.size) showT = setTimeout(checkShown, 400);
  }
  /* A strip whose chip is its own (ownUnder, Settings' segmented choices) shows that chip only while it moves: at rest the
     chosen segment wears the material in place, exactly as it did before the chip existed, so nothing at rest changes
     (a resting segment's printed shadow, a divider, a font load or a resize all stay the segment's own). From the press,
     or the app's change, until the chip rests on the segment the app has chosen, the strip carries data-lg-moving: the
     chip shows and the chosen segments' own fills step aside (glass.css), so one fill is on screen in every frame */
  function ownRest(L) {
    var strip = L.strip; if (!ownUnder.has(strip)) return;
    var chosen = strip.querySelector(L.cfg.items + (L.cfg.active || '.active'));
    /* a lens placed without a target (a snap, a restored box) is at rest; one with a target is moving until that
       target is the segment the app chose */
    var moving = !!(L.pending || L.anim || L.hopFrames || (L.rect && chosen && L.tgt && L.tgt !== chosen));
    if (moving !== strip.hasAttribute('data-lg-moving')) { if (moving) strip.setAttribute('data-lg-moving', ''); else strip.removeAttribute('data-lg-moving'); }
  }
  function syncStrip(cfg, strip, m) {
    syncStripNow(cfg, strip, m);
    if (cfg.under) { var L = lenses.get(strip); if (L) ownRest(L); }
  }
  /* B6 packet 1 (2026-10-16): a sync of many strips read each one after the previous one's lens writes (a new lens, its
     strip's mark, its box, its optics), so every strip paid a style and a layout pass of its own: 23 style + 22 layout
     passes, 48 ms of the editor's Customize open on a P1000 (17 + 16 on the 3090, each forced by the next strip's
     visible()). syncStrips reads every strip first (readStrip: its target, whether it and its target are drawn, its
     scroller's clip, its lens's box), then writes them all (syncStripNow with what was read), as mountMeasured does for
     sheets; the new lenses' optics and their entrance mirrors are read and written together after that. Exact: a lens,
     its layer and its strip's mark move no strip. What the read could not know is read at the write, as before: a lens
     a write brings back from the park or the carry, a target the write's press logic changes, a layer not made yet whose
     own box the lens is placed in. */
  var lensMounts = null, lensRides = null;
  function syncStrips(list) {
    if (!list.length) return;
    var reads = list.map(function (t) { return readStrip(t[0], t[1]); });
    var mounts = lensMounts = new Map(), rides = lensRides = [];
    try { list.forEach(function (t, i) { syncStrip(t[0], t[1], reads[i]); }); }
    finally { lensMounts = null; lensRides = null; }
    if (mounts.size) mountMeasured(mounts, false);
    if (!rides.length) return;
    rides.forEach(function (r) { if (r.L.lens.isConnected) { r.specs = rideRead(r.L, r.target); r.left = r.arrive ? arrivalLeft(r.target) : 0; } });
    rides.forEach(function (r) { if (r.specs) { if (r.arrive) arriveIn(r.L, r.left); rideApply(r.L, r.specs); } });
  }
  function readStrip(cfg, strip) {
    cvWait.delete(strip);
    var L = lenses.get(strip); if (L && !L.lens.isConnected) L = null;
    var P = L && L.pending, target = cfg.pick ? cfg.pick(strip) : strip.querySelector(cfg.items + (cfg.active || '.active'));
    if (P && P.el.isConnected && target === P.from && !P.away && !(P.up && performance.now() - P.up > 2500)) target = P.el;
    var m = { target: target, shown: !!target && visible(target) && visible(strip) };
    if (!m.shown) return m;
    var parked = !L && parkedLenses[switchUnder ? 'under' : 'over'].get(strip), pre = preread(strip);
    m.scroller = L ? L.scroller : parked ? parked.scroller : pre ? pre.scroller : undefined;
    if (m.scroller && m.scroller.isConnected) {
      var sr = m.scroller.getBoundingClientRect(), tr = boxRect(cfg.box ? (cfg.box(target).getBoundingClientRect ? cfg.box(target) : target) : target);
      m.out = tr.left < sr.left - 1 || tr.left + tr.width > sr.right + 1 || tr.top < sr.top - 1 || tr.top + tr.height > sr.bottom + 1;
      if (m.out) return m;
    }
    /* a parked lens's strip is made relative again only when it is brought back: its box is read then */
    if (parked) return m;
    var lay = layerOf(strip, cfg);
    m.R = rectIn(strip, cfg.box ? cfg.box(target) : target, cfg.pad == null ? 2 : cfg.pad, lay);
    m.lay = lay;
    return m;
  }
  function syncStripNow(cfg, strip, m) {
    if (!m && cvSkipped(strip)) { cvSkip(strip); return; }
    var L = lensFor(strip, cfg), P0 = L.pending;
    var target = cfg.pick ? cfg.pick(strip) : strip.querySelector(cfg.items + (cfg.active || '.active'));
    if (L.pending) {
      /* pressed, not yet chosen by the app: hold the lens there until the app makes any choice. This app switches on
         the release, after up to a few hundred ms of work, and its click comes later still; a release elsewhere
         abandons the press. */
      var now = performance.now(), P = L.pending;
      if (!P.el.isConnected || target !== P.from || P.away || (P.up && now - P.up > 2500)) { pressMark(P, false); L.pending = null; }
      else target = P.el;
    }
    if (L.pending && !L.pending.el.isConnected) { pressMark(L.pending, false); L.pending = null; }
    if (P0 && P0 !== L.pending) pressMark(P0, false);
    var pre = m && m.target === target ? m : null;
    if (!target || !(pre ? pre.shown : visible(target) && visible(strip))) { stopLensTravel(L); if (L.scrubCleanup) L.scrubCleanup(); if (L.lens.style.opacity !== '0') L.lens.style.opacity = '0'; L.rect = null; awaitShow(L, cfg); return; }
    hiddenLenses.delete(L);
    if (L.scroller && L.scroller.isConnected) {
      var out;
      if (pre && pre.scroller === L.scroller && pre.out !== undefined) out = pre.out;
      else {
        var sr = L.scroller.getBoundingClientRect(), tr = boxRect(cfg.box ? (cfg.box(target).getBoundingClientRect ? cfg.box(target) : target) : target);
        out = tr.left < sr.left - 1 || tr.left + tr.width > sr.right + 1 || tr.top < sr.top - 1 || tr.top + tr.height > sr.bottom + 1;
      }
      if (out) { stopLensTravel(L); if (L.lens.style.opacity !== '0') L.lens.style.opacity = '0'; L.rect = null; return; }
    }
    if (L.lens.style.opacity) L.lens.style.opacity = '';
    prewarmSoon(L, cfg, strip);
    var lay = pre && pre.R && pre.lay, R = lay && L.layer.parentElement === lay.parent && (!lay.usedEl || L.layer === lay.el) ? pre.R : null;
    if (!R) R = rectIn(strip, cfg.box ? cfg.box(target) : target, cfg.pad == null ? 2 : cfg.pad);
    var A = L.rect;
    if (L.dragging) return;
    if (L.snap) { L.snap = false; stopLensTravel(L); setLensBox(L, R); return; }
    var quiet = reduced();
    var still = A && (quiet ? A.x === R.x && A.y === R.y && A.w === R.w && A.h === R.h : Math.abs(A.x - R.x) < 0.5 && Math.abs(A.y - R.y) < 0.5 && Math.abs(A.w - R.w) < 0.5 && Math.abs(A.h - R.h) < 0.5);
    if ((quiet && !L.reducedAnim) || !switchOn()) stopLensTravel(L);
    /* a step's blocks wait for the app to choose their tab; the chip is already at rest on it underneath */
    if (L.hopFrames && L.hopTarget === target) { hopSettle(L); return; }
    if (still) return;
    if (!A || quiet || !switchOn()) {
      stopLensTravel(L);
      if (A && quiet) { var an = L.lens.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 140 }); L.anim = an; L.reducedAnim = true; an.onfinish = function () { if (L.anim === an) { L.anim = null; L.reducedAnim = false; } ownRest(L); }; }
      setLensBox(L, R); L.tgt = target;
      /* a lens in the app-wide layer waits for its strip's entrance; one in its host's own layer (a page, a menu, a
         dialog) is part of that entrance already */
      if (!A && !quiet && switchOn()) {
        if (lensRides) { stopRide(L); lensRides.push({ L: L, target: target, arrive: L.layer === layer }); }
        else { if (L.layer === layer) arrive(L, target); ride(L, target); }
        settleCheck(L);
      }
      return;
    }
    /* the destination moved by a pixel or two (the chosen label turned bold): a move in flight carries on, re-based;
       a lens at rest just takes the new box. Neither starts a new move (it would lift and swell for nothing). */
    if (Math.max(Math.abs(A.x - R.x), Math.abs(A.y - R.y), Math.abs(A.w - R.w), Math.abs(A.h - R.h)) < 4) {
      if (!(L.anim && L.path && performance.now() - L.path.t0 < L.path.dur)) stopLensTravel(L);
      setLensBox(L, R); L.tgt = target; return;
    }
    /* the lens travels only when the chosen item changes. The same item seen somewhere else (its page or menu settled,
       the strip scrolled or reflowed) is followed at once (Jared #21: a lens measured mid-entrance slid 50 px into
       place after the page had landed) */
    if (L.tgt === target && !L.dragging) { if (L.hopFrames) { hopSettle(L); return; } stopLensTravel(L); setLensBox(L, R); return; }
    L.tgt = target;
    var from = visualRect(L) || A, vertical = !!cfg.vertical || Math.abs(from.y - R.y) > Math.abs(from.x - R.x);
    if (switchMotion !== 'glide' && !isGlass()) { hop(L, from, R, strip, cfg, target, vertical); return; }
    travel(L, from, R, vertical, { labels: labelsOf(cfg, strip, vertical), mags: magsOf(cfg), vertical: vertical });
  }
  /* Retro's step and NieR's cut. A step is two hard jumps, 33 ms apart: to the tab half way (when there is one), then to
     its own; a tab next door is one jump, at once. Every frame of it runs on the compositor, so it keeps its time however
     long the app's click holds the page (Q16 delta review R1: a main-thread step froze on the half-way tab for 12-29
     frames while the page switched). Each stop is a block of the chip's material ABOVE the labels, holding an inverted
     copy of its tab's label (the item cloned, its look copied, in the chip's ink), clipped to the block; the blocks show
     and hide by step-timed opacity. The real labels stay in their resting ink underneath, the tab headed for held there
     ('off') until the app has chosen it; then the blocks go and the chip under the labels, with the chosen label's own
     ink, looks the same (F3-621: only the tab under the ink looks chosen). */
  var HOP_MS = 33;
  function hopStops(A, B, strip, cfg, target, vertical) {
    var c = function (r) { return vertical ? r.y + r.h / 2 : r.x + r.w / 2; }, a = c(A), b = c(B), lo = Math.min(a, b), hi = Math.max(a, b), pad = cfg.pad == null ? 2 : cfg.pad;
    var mids = Array.prototype.slice.call(strip.querySelectorAll(cfg.items)).filter(function (it) { return it !== target && visible(it); })
      .map(function (it) { return { it: it, r: rectIn(strip, cfg.box ? cfg.box(it) : it, pad) }; })
      .filter(function (s) { var m = c(s.r); return m > lo + 1 && m < hi - 1; })
      .sort(function (p, q) { return Math.abs(c(p.r) - a) - Math.abs(c(q.r) - a); });
    if (mids.length > 1) mids = [mids[Math.floor((mids.length - 1) / 2)]];
    return mids.concat([{ it: target, r: B }]);
  }
  var hopOwned = new WeakMap();   /* an item whose ink a hop holds: a press settling under it leaves the hop's mark */
  function hopMark(L, el, v) {
    if (!el || !el.isConnected) return;
    if (v) { if (el.getAttribute('data-lg-press') !== v) el.setAttribute('data-lg-press', v); L.hopMarks.set(el, v); hopOwned.set(el, v); }
    else { if (L.hopMarks.get(el) === el.getAttribute('data-lg-press')) el.removeAttribute('data-lg-press'); L.hopMarks.delete(el); hopOwned.delete(el); }
  }
  /* the layer above a strip's labels that holds a step's blocks while it runs */
  function overLayer(strip) {
    var own = strip.__lgOver;
    if (own && own.parentElement === strip) return own;
    own = el('lg-over', { class: 'lg-hops', 'aria-hidden': 'true', 'data-o55-foreign': '' });
    if (getComputedStyle(strip).position === 'static') { strip.style.position = 'relative'; strip.__lgPosOver = true; }
    strip.appendChild(own); strip.__lgOver = own; return own;
  }
  /* a label's inverted copy: the item cloned without its classes, ids or roles (no script finds it as a tab), its own box
     and text styles copied inline, in the chosen weight; glass.css inks it and everything in it in the chip's ink */
  var TWIN_PROPS = ['font-family', 'font-size', 'font-style', 'font-stretch', 'font-variant-numeric', 'font-feature-settings', 'letter-spacing', 'word-spacing', 'line-height',
    'text-transform', 'text-align', 'text-indent', 'white-space', 'display', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'gap',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style', 'box-sizing', 'overflow', 'text-overflow'];
  function twinOf(item, box, weight) {
    var c = item.cloneNode(true), cs = getComputedStyle(item), css = [];
    TWIN_PROPS.forEach(function (p) { css.push(p + ':' + cs.getPropertyValue(p)); });
    [c].concat(Array.prototype.slice.call(c.querySelectorAll('[id], [tabindex], [role], [aria-selected], [aria-current], [aria-checked], [aria-pressed], [data-lg-press]'))).forEach(function (n) {
      ['id', 'tabindex', 'role', 'aria-selected', 'aria-current', 'aria-checked', 'aria-pressed', 'aria-controls', 'aria-label', 'data-lg-press'].forEach(function (a) { n.removeAttribute(a); });
    });
    c.setAttribute('class', 'lg-twin'); c.setAttribute('aria-hidden', 'true'); c.setAttribute('inert', '');
    c.style.cssText = css.join(';') + ';font-weight:' + weight + ';position:absolute;margin:0;left:' + box.x + 'px;top:' + box.y + 'px;width:' + box.w + 'px;height:' + box.h + 'px';
    return c;
  }
  function endHop(L) {
    if (L.hopT) { clearTimeout(L.hopT); L.hopT = 0; }
    if (L.hopSafety) { clearTimeout(L.hopSafety); L.hopSafety = 0; }
    if (L.hopFrames) { L.hopFrames.forEach(function (F) { F.getAnimations().forEach(function (a) { a.cancel(); }); F.remove(); }); L.hopFrames = null; }
    /* the chip under the labels shows the moment the blocks go */
    if (L.hopHide) { var hh = L.hopHide; L.hopHide = null; if (L.anim === hh) L.anim = null; hh.cancel(); }
    var over = L.strip && L.strip.__lgOver; if (over && !over.children.length) { over.remove(); L.strip.__lgOver = null; if (L.strip.__lgPosOver && !L.strip.__lgUnder) { L.strip.style.removeProperty('position'); } L.strip.__lgPosOver = false; }
    if (L.hopMarks) { L.hopMarks.forEach(function (v, el) { hopOwned.delete(el); if (el.getAttribute('data-lg-press') === v) el.removeAttribute('data-lg-press'); }); L.hopMarks.clear(); }
    var P = L.hopPress; L.hopPress = null; L.hopTarget = null;
    if (P && L.pending === P && P.el.isConnected && !hopOwned.has(P.el)) P.el.setAttribute('data-lg-press', 'on');
    ownRest(L);
  }
  function stopHop(L) { endHop(L); }
  /* the blocks go once the app has chosen the tab they show (and not before the landing): the chip under the labels and
     the chosen label's own ink then look the same */
  function hopSettle(L) {
    var T = L.hopTarget; if (!T || !L.hopFrames) return;
    if (!T.isConnected) { endHop(L); return; }
    var cfg = L.cfg; if (!T.matches(cfg.active || '.active')) return;
    var wait = L.hopEnd - performance.now();
    if (wait > 0) { if (!L.hopT) L.hopT = setTimeout(function () { L.hopT = 0; hopSettle(L); }, wait + 1); return; }
    endHop(L);
  }
  function hop(L, A, B, strip, cfg, target, vertical) {
    stopLensTravel(L);
    if (switchMotion === 'cut' || !A) { setLensBox(L, B); return; }
    var stops = hopStops(A, B, strip, cfg, target, vertical);
    if (stops.length < 2 || !L.under) { setLensBox(L, B); return; }
    var now = strip.querySelector(cfg.items + (cfg.active || '.active')), weight = getComputedStyle(now || target).fontWeight;
    var over = overLayer(strip), pad = cfg.pad == null ? 2 : cfg.pad, frames = stops.map(function (s) {
      var F = el('i', { class: 'lg-lens lg-hop', 'aria-hidden': 'true' }), st = F.style, ir = rectIn(strip, s.it, 0);
      st.left = s.r.x + 'px'; st.top = s.r.y + 'px'; st.width = s.r.w + 'px'; st.height = s.r.h + 'px';
      F.appendChild(twinOf(s.it, { x: ir.x - s.r.x, y: ir.y - s.r.y, w: ir.w, h: ir.h }, weight)); over.appendChild(F); return F;
    });
    frames[0].animate([{ opacity: 1 }, { opacity: 0 }], { duration: HOP_MS, easing: 'step-end', fill: 'forwards' });
    frames[1].animate([{ opacity: 0 }, { opacity: 1 }], { duration: HOP_MS, easing: 'step-end', fill: 'forwards' });
    setLensBox(L, B); L.path = null;
    /* the chip under the labels stays hidden for the whole step (the blocks cover its tab from the landing on), so no
       frame can show both: animations on the new blocks may start a frame after one on the chip */
    L.anim = L.hopHide = L.lens.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 600000 });
    if (!L.hopMarks) L.hopMarks = new Map();
    L.hopFrames = frames; L.hopTarget = target; L.hopEnd = performance.now() + HOP_MS;
    var P = L.pending && L.pending.el === target ? L.pending : null; if (P) L.hopPress = P;
    hopMark(L, target, 'off');
    L.hopT = setTimeout(function () { L.hopT = 0; hopSettle(L); }, HOP_MS + 1);
    L.hopSafety = setTimeout(function () { L.hopSafety = 0; if (L.hopFrames) { endHop(L); queueSync(L.strip); } }, 3000);
  }
  /* the press: the lens leaves for the pressed item at once; the app's choice (or its absence) settles it. Only for
     items the app can choose: a disabled or inert item, or a strip that takes no press (a progress rail), keeps the lens
     where it is (it used to sit on the pressed step for the 2.5 s hold, then slide back). */
  /* while a press moves the chip ahead of the app's choice, the pressed item reads as chosen and the one it leaves as not
     (data-lg-press on / off, glass.css section 12), so neither label sits in its old colour on the wrong ground: under an
     opaque chip (--pm-switch-layer: under) the chosen label is inverted, and on a tinted one the label it left kept its
     chosen ink after the chip had gone (Friendly's mint words, Q16 review). Every look that adopts the switcher; never
     Glass, whose clear lens needs no second ink */
  function pressMark(P, on) {
    if (!P || (on && !switchLook)) return;
    [[P.el, 'on'], [P.from, 'off']].forEach(function (x) {
      var e = x[0]; if (!e) return;
      if (on) { if (!hopOwned.has(e) && e.getAttribute('data-lg-press') !== x[1]) e.setAttribute('data-lg-press', x[1]); }
      else if (hopOwned.has(e)) e.setAttribute('data-lg-press', hopOwned.get(e));
      else if (e.hasAttribute('data-lg-press')) e.removeAttribute('data-lg-press');
    });
  }
  function choosable(item, cfg) {
    return cfg.press !== false && !item.disabled && item.getAttribute('aria-disabled') !== 'true' && !item.closest('[inert]');
  }
  function stripAt(target) {
    for (var i = 0; i < STRIPS.length; i++) {
      var cfg = STRIPS[i], strip = target.closest && target.closest(cfg.sel); if (!strip) continue;
      /* the strip's own items, searched from the strip: an item selector written from the strip (':scope > button', Usage's
         range) never matches through closest(), where :scope is the item itself, so a press there never moved the chip */
      var item = null, list = strip.querySelectorAll(cfg.items);
      for (var j = 0; j < list.length && !item; j++) if (list[j].contains(target)) item = list[j];
      if (!item) return null;
      return { cfg: cfg, strip: strip, item: item };
    }
    return null;
  }
  document.addEventListener('pointerdown', function (e) {
    if (!switchOn() || e.button !== 0 || reduced()) return;
    var hit = stripAt(e.target); if (!hit || !choosable(hit.item, hit.cfg)) return;
    var L = lenses.get(hit.strip); if (!L || !L.rect || L.dragging) return;
    var cur = hit.cfg.pick ? hit.cfg.pick(hit.strip) : hit.strip.querySelector(hit.cfg.items + (hit.cfg.active || '.active'));
    if (hit.item === cur) return;
    if (L.pending) pressMark(L.pending, false);
    L.pending = { el: hit.item, from: cur, up: 0, away: false }; pressMark(L.pending, true);
    syncStrip(hit.cfg, hit.strip);
  }, true);
  document.addEventListener('pointerup', function (e) {
    lenses.forEach(function (L) {
      var P = L.pending; if (!P || P.up) return;
      P.up = performance.now(); P.away = !(e.target && P.el.contains(e.target));
      if (P.away) queueSync(L.strip); else setTimeout(function () { queueSync(L.strip); }, 2550);
    });
  }, true);
  document.addEventListener('pointercancel', function () { lenses.forEach(function (L) { if (L.pending) { pressMark(L.pending, false); L.pending = null; queueSync(L.strip); } }); }, true);
  /* scrubbing: press on a tab strip and slide; the lens lifts and follows the pointer like a drop of water, magnifying
     each tab it passes, and drops into the nearest tab on release (which then becomes the chosen one) */
  function scrubbing(e) {
    if (!switchOn() || e.button !== 0 || reduced() || switchUnder) return;
    for (var i = 0; i < STRIPS.length; i++) {
      var cfg = STRIPS[i]; if (!cfg.scrub || cfg.press === false) continue;
      var strip = e.target.closest && e.target.closest(cfg.sel); if (!strip) continue;
      var L = lenses.get(strip); if (!L || !L.rect) return;
      if (L.scrubCleanup) L.scrubCleanup();
      var sx = e.clientX, moved2 = false, items = Array.prototype.slice.call(strip.querySelectorAll(cfg.items)).filter(function (it) { return visible(it) && choosable(it, cfg); }), labs = null, mags = magsOf(cfg);
      var onMove = function (ev) {
        if (!strip.isConnected || !L.lens.isConnected || !switchOn() || reduced()) { cleanup(); return; }
        var dx = ev.clientX - sx;
        if (!moved2 && Math.abs(dx) < 6) return;
        if (!moved2) { moved2 = true; L.dragging = true; L.pending = null; stopLensTravel(L); L.lens.setAttribute('data-lg-lifted', ''); labs = labelsOf(cfg, strip, false); try { getSelection().removeAllRanges(); } catch (e2) {} }
        var sr = strip.getBoundingClientRect(), lr = L.layer.getBoundingClientRect(), x = ev.clientX - sr.left - L.rect.w / 2;
        var lo = 0, hi = strip.clientWidth - L.rect.w; if (x < lo) x = lo - Math.sqrt(lo - x) * 2; if (x > hi) x = hi + Math.sqrt(x - hi) * 2;
        L.lens.style.transform = 'translate3d(' + (sr.left - lr.left + x - L.rect.x).toFixed(1) + 'px,0,0) scale(' + (1 + 0.1 * switchLiquid).toFixed(3) + ',' + (1 + 0.12 * switchLiquid).toFixed(3) + ')';
        var c = sr.left + x + L.rect.w / 2, half = L.rect.w * 1.1 / 2;
        labs.forEach(function (lab) { var g = magnified(lab, c, half, 1, mags); lab.el.style.scale = g.m.toFixed(4); lab.el.style.translate = g.d.toFixed(2) + 'px 0px'; });
        ev.preventDefault();
      };
      var removeListeners = function () {
        document.removeEventListener('pointermove', onMove, true); document.removeEventListener('pointerup', onUp, true); document.removeEventListener('pointercancel', onUp, true);
        if (L.scrubCleanup === cleanup) L.scrubCleanup = null;
      };
      var cleanup = function () {
        removeListeners(); L.lens.style.transform = ''; L.lens.removeAttribute('data-lg-lifted'); L.dragging = false;
        if (labs) labs.forEach(function (lab) { lab.el.style.removeProperty('scale'); lab.el.style.removeProperty('translate'); });
      };
      var onUp = function (ev) {
        removeListeners();
        if (!moved2) return;
        if (ev.type === 'pointercancel' || !strip.isConnected || !L.lens.isConnected || !switchOn() || reduced()) { cleanup(); return; }
        var best = null, bd = 1e9;
        items.forEach(function (it) { var r = boxRect(it), d = Math.abs(r.left + r.width / 2 - ev.clientX); if (d < bd) { bd = d; best = it; } });
        var cur = L.lens.getBoundingClientRect(), lr2 = L.layer.getBoundingClientRect(), from = { x: cur.left - lr2.left + (cur.width - L.rect.w) / 2, y: L.rect.y, w: L.rect.w, h: L.rect.h };
        cleanup();
        if (best && !best.classList.contains('active')) { L.rect = from; L.pending = { el: best, from: strip.querySelector(cfg.items + (cfg.active || '.active')), up: performance.now(), away: false }; best.click(); syncStrip(cfg, strip); }
        else travel(L, from, L.rect, false, { labels: labelsOf(cfg, strip, false), mags: mags, vertical: false });
        var swallow = function (ce) { ce.stopPropagation(); ce.preventDefault(); document.removeEventListener('click', swallow, true); };
        document.addEventListener('click', swallow, true); setTimeout(function () { document.removeEventListener('click', swallow, true); }, 0);
      };
      L.scrubCleanup = cleanup; document.addEventListener('pointermove', onMove, true); document.addEventListener('pointerup', onUp, true); document.addEventListener('pointercancel', onUp, true);
      return;
    }
  }
  document.addEventListener('pointerdown', scrubbing, true);

  /* ---- the surfaces: which elements are glass, and of which kind ------------------------------------------------ */
  var SURFACES = [
    ['.title-bar', 'bar'], ['.left-panel', 'panel'], ['#chatPanel', 'panel'], ['#panel-usage .pmu-rail', 'panel'],
    ['#panel-usage .pmu-stagehead', 'bar'], ['#panel-usage .pmu-board > .pmu-card', 'card'],
    ['#pm7GlobalStatusBar', 'bar'], ['.pmu-pop.open', 'menu'], ['.pmr-menu-list', 'menu'], ['#lg-demo-pop[data-open]', 'menu'],
    /* Settings: its domain rail and section index are sheets, every section is a card (glass.css names the same sheets
       in its Settings "inside a sheet" rules: keep the two lists in step) */
    ['#pm-settings-root aside.domain-rail', 'panel'], ['#pm-settings-root .document-layout > :is(nav, aside):not(.document-main)', 'panel'],
    ['#pm-settings-root section.settings-section', 'card'],
    /* a chapter's header (its name and line) is a bar, and Settings Home's intro a panel over its two cards: on the bare
       wallpaper their lines read 1.9-2.9:1 over Prism or Pool */
    ['#pm-settings-root header.workspace-separator', 'bar'],
    ['#pm-settings-root .home-page > section.home-hero', 'panel'], ['#pm-settings-root .home-page .home-panel', 'card'],
    /* onboarding: the window is a sheet over a frosted veil of the wallpaper; the tour floats over the live app, so its
       callout and bar blur what is behind them */
    ['#pm-o55-onboarding .o55-win', 'panel'], ['.o55t-callout', 'menu'], ['.o55t-bar', 'menu'],
  ];
  function scopedNodes(selector, scopes) {
    if (!scopes) return Array.prototype.slice.call(document.querySelectorAll(selector));
    var found = new Set(); scopes.forEach(function (s) {
      if (!s.isConnected) return;
      if (s.matches(selector)) found.add(s);
      s.querySelectorAll(selector).forEach(function (e) { found.add(e); });
      for (var p = s.parentElement; p; p = p.parentElement) if (p.matches(selector)) found.add(p);
    }); return Array.from(found);
  }
  function segTracks(scopes) {   /* the rail's tab strips get a track element to be the glass (the strip itself is a full-width plate) */
    scopedNodes('#sidePanelSlot .pm-segtab', scopes).forEach(function (s) {
      if (!s.querySelector(':scope > .pm-segtab-track')) { var t = el('i', { class: 'pm-segtab-track', 'aria-hidden': 'true' }); s.insertBefore(t, s.firstChild); }
    });
  }
  /* other owners opt their own surfaces in: data-lg-surface="menu" (a floating sheet that blurs what is behind it:
     toasts, popovers), "card", "bar" or "panel" (baked sheets over the wallpaper). The attribute is theirs to set and
     remove; glass.js only mounts what carries it, so no owner's selectors live in this file. */
  var OPT_IN = { menu: 1, card: 1, bar: 1, panel: 1 };
  var SURFACE_SELECTOR = SURFACES.map(function (p) { return p[0]; }).concat('[data-lg-surface]').join(', ');
  function syncSurfaces(scopes, extra) {
    segTracks(scopes);
    var found = scopedNodes(SURFACE_SELECTOR, scopes), targets = new Map();
    /* Retain the owner's mount order (also the materialize stagger order) while discovering each subtree once. */
    SURFACES.forEach(function (p) { found.forEach(function (e) { if (e.matches(p[0])) targets.set(e, p[1]); }); });
    found.forEach(function (e) { var k = e.getAttribute('data-lg-surface'); if (OPT_IN[k]) { e.__lgOpt = true; targets.set(e, k); } });
    if (extra) extra.forEach(function (e) { var k = e.getAttribute('data-lg-kind'); if (KINDS[k] && KINDS[k].bake && !targets.has(e)) targets.set(e, k); });
    /* a Usage room change's board is sizeWatch's alone until the change ends (boardMoment, above) */
    if (boardMoment()) targets.forEach(function (k, e) { if (e.closest(BOARD_AREA)) { targets.delete(e); boardStale = true; } });
    mountMeasured(targets, true);
  }

  /* ---- light: the pointer's shine on the rims, and the press ------------------------------------------------------- */
  var ptr = null, ptrQ = false, ptrLate = false, lit = null, shine = null;
  function shineEl() {
    if (shine && shine.isConnected) return shine;
    shine = el('div', { id: 'lg-shine', 'aria-hidden': 'true' }); shine.appendChild(el('i')); document.body.appendChild(shine); return shine;
  }
  function onPtr() {
    ptrQ = false; if (!ptr || !isGlass()) return;
    var g = ptr.t && ptr.t.closest ? ptr.t.closest('[data-lg-kind]') : null, sh = shineEl();
    if (document.querySelector('#panel-usage .pmu-card:is([data-lifted],[data-settling])')) { sh.classList.remove('on'); return; }
    /* a new sheet under the pointer is measured once; during a Usage room change that read forced the half-built room's
       layout, so the light keeps its sheet until the change ends (boardMoment) */
    if (g !== lit && boardMoment()) { ptrLate = true; return; }
    if (g !== lit) {
      if (lit) { lit.removeAttribute('data-lg-lit'); lit.style.removeProperty('--lg-px'); lit.style.removeProperty('--lg-py'); }
      lit = g;
      if (g) {   /* clip the light to this sheet's shape, once per sheet */
        g.setAttribute('data-lg-lit', ''); var r = g.getBoundingClientRect(), cs = getComputedStyle(g);
        sh.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;border-radius:' + cs.borderRadius;
        sh.__r = r; sh.classList.add('on');
      } else sh.classList.remove('on');
    }
    if (g && sh.__r) {
      var lx = (ptr.x - sh.__r.left).toFixed(0) + 'px', ly = (ptr.y - sh.__r.top).toFixed(0) + 'px';
      sh.firstChild.style.transform = 'translate3d(' + lx + ',' + ly + ',0)';
      /* Glass Light's light is a layer of the lit sheet's own background, under its words (glass.css --lg-glow) */
      if (root.getAttribute('data-theme') === 'glass-light' && root.getAttribute('data-lg-tier') === 'gpu') { g.style.setProperty('--lg-px', lx); g.style.setProperty('--lg-py', ly); }
    }
  }
  document.addEventListener('pointermove', function (e) { ptr = { x: e.clientX, y: e.clientY, t: e.target }; if (!ptrQ) { ptrQ = true; requestAnimationFrame(onPtr); } }, { passive: true });
  /* the press: buttons flex and a small light blooms under the finger. Strip items and rail icons get neither: their
     lens is the answer to a press (the white bloom read as a flash in the films). */
  document.addEventListener('pointerdown', function (e) {
    if (!isGlass() || e.button !== 0) return;
    var g = e.target.closest && e.target.closest('.pmu-ctlbtn, .pmu-iconbtn, .o55-btn, .o55-card, .o55-tile, .o55t-btn, .o55t-barbtn');
    if (!g || reduced() || stripAt(e.target)) return;
    var r = g.getBoundingClientRect(), glow = el('i', { class: 'lg-press', 'aria-hidden': 'true' });
    glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px';
    document.body.appendChild(glow);
    var S = spring(380, 18, 1), fr = S.map(function (s) { return { offset: s.t / S[S.length - 1].t, transform: 'scale(' + (1 + 0.025 * Math.sin(Math.min(1, s.t / 120) * Math.PI) + 0.012 * (1 - s.x) * Math.sin(s.t / 22)).toFixed(4) + ')' }; });
    g.animate(fr, { duration: S[S.length - 1].t, easing: 'linear', composite: 'add' });
    var size = Math.min(Math.max(r.width, r.height), 56) / 36;
    glow.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0.5 }, { transform: 'translate(-50%,-50%) scale(' + size.toFixed(2) + ')', opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = function () { glow.remove(); };
  }, true);

  /* ---- the bead: a drop of glass that lifts under the icon button the pointer is on and flows to the next one, so the
     icon swells inside it (the self-reflection Jared liked on the lenses, now on the rail's and toolbars' buttons) ---- */
  var BEADS = '#sidePanelSlot :is(.pm-minibtn, .fm-tbtn, #fmRootBtn, .sh-bhead-acts button), #activityBar .icon:not([data-lg-current]), #activityBarToggle, .pmu-iconbtn, #pm-home-more-btn, #themeSelect, #projectMenuBtn, .pmu-livechev, #pmnStack[data-state="empty"]';
  /* the part of a bead target the bead hugs: a rail icon's glyph box, the notification slot's bell (pm7-notifications) */
  var BEAD_BOX = ':scope > .symbol, .pmn-bell';
  /* The bead flows only between neighbours (buttons of one toolbar, icons of the rail) and at most 110 px; anything
     further fades out and lifts in at the new place. In the films a quick pointer crossing the side panel sent it flying
     across the panel and diving past the rail's edge on the old spring's overshoot. */
  var bead = null, beadOn = null, beadAt = null, beadRect = null, beadAnim = null, beadHide = 0;
  function stopBeadAnimation() { if (beadAnim) { var an = beadAnim; beadAnim = null; an.onfinish = null; an.cancel(); } }
  function resetBead() { clearTimeout(beadHide); beadHide = 0; stopBeadAnimation(); if (bead) bead.classList.remove('on'); beadRect = null; beadOn = null; beadAt = null; }
  function beadEl() { if (bead && bead.isConnected) return bead; if (bead) { resetBead(); removeLensElement(bead); } bead = el('i', { class: 'lg-lens lg-bead', 'aria-hidden': 'true', 'data-lg-lens': 'bead' }); lensLayer().appendChild(bead); return bead; }
  function beadTo(t) {
    clearTimeout(beadHide); beadHide = 0;
    var b = beadEl(), lr = lensLayer().getBoundingClientRect(), r = boxRect(t.querySelector(BEAD_BOX) || t); beadOn = t;
    var R = { x: r.left - lr.left - 2, y: r.top - lr.top - 2, w: r.width + 4, h: r.height + 4 }, A = beadRect;
    var near = A && beadAt && beadAt.isConnected && beadAt.parentElement === t.parentElement && Math.hypot(A.x - R.x, A.y - R.y) < 110;
    var s = b.style; s.left = R.x + 'px'; s.top = R.y + 'px'; s.width = R.w + 'px'; s.height = R.h + 'px'; mount(b, 'bead');
    stopBeadAnimation();
    if (reduced()) { b.classList.add('on'); beadRect = R; beadAt = t; return; }
    if (near && b.classList.contains('on')) {
      var S = spring.apply(null, GLIDE), dx = A.x - R.x, dy = A.y - R.y, dist = Math.hypot(dx, dy), fr = [], vert = Math.abs(dy) > Math.abs(dx);
      for (var i = 0; i < S.length; i++) { var p = S[i].x, over = (p - 1) * dist; if (over > 0) p = 1 + 2 * Math.tanh(over / 2) / Math.max(1, dist);
        var sp = Math.min(1, Math.abs(S[i].v) * dist / 2400);
        fr.push({ offset: S[i].t / S[S.length - 1].t, transform: 'translate3d(' + (dx * (1 - p)).toFixed(2) + 'px,' + (dy * (1 - p)).toFixed(2) + 'px,0) scale(' + (vert ? 1 - sp * 0.1 : 1 + sp * 0.25).toFixed(3) + ',' + (vert ? 1 + sp * 0.25 : 1 - sp * 0.1).toFixed(3) + ')' }); }
      beadAnim = b.animate(fr, { duration: S[S.length - 1].t, easing: 'linear' });
    } else {
      b.classList.add('on');
      beadAnim = b.animate([{ transform: 'scale(.82)', opacity: 0 }, { transform: 'scale(1.02)', opacity: 1, offset: 0.65 }, { transform: 'scale(1)', opacity: 1 }], { duration: 240, easing: 'cubic-bezier(.3,1.1,.5,1)' });
    }
    var an = beadAnim; an.onfinish = function () { if (beadAnim === an) beadAnim = null; };
    beadRect = R; beadAt = t;
  }
  function beadFade(ms) {
    if (!bead || !bead.isConnected || !isGlass()) { resetBead(); return; }
    if (!bead.classList.contains('on')) return;
    stopBeadAnimation(); var b = bead;
    var an = b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: 'ease-out' }); beadAnim = an;
    an.onfinish = function () { if (beadAnim === an && bead === b) { beadAnim = null; b.classList.remove('on'); beadRect = null; beadAt = null; } };
  }
  function beadOff() {
    clearTimeout(beadHide);
    beadHide = setTimeout(function () { beadHide = 0; beadFade(180); }, 120);
  }
  document.addEventListener('pointerover', function (e) {
    if (!isGlass() || e.pointerType === 'touch') return;
    var t = e.target.closest && e.target.closest(BEADS);
    if (t === beadOn) return;
    beadOn = t;
    if (t && visible(t)) beadTo(t); else beadOff();
  }, true);
  /* a press dissolves the bead at once: the lens (or the button's own flex) takes over */
  document.addEventListener('pointerdown', function (e) {
    clearTimeout(beadHide); beadHide = 0;
    /* the press sends a lens to the item the bead is on: the lens picks the bead up (two boxes overlapped for ~50 ms
       in the films while the bead faded under the arriving lens) */
    var hit = isGlass() && e.button === 0 ? stripAt(e.target) : null;
    if (hit && beadAt && hit.item.contains(beadAt)) { stopBeadAnimation(); if (bead) bead.classList.remove('on'); beadRect = null; beadAt = null; }
    else if (beadOn || beadAt) beadFade(90);
    beadOn = null;
  }, true);

  /* ---- the switch's knob turns to liquid glass while it is held: it swells, goes clear and lenses the track under
     it, then lands as a solid knob on the other side (iOS 27's switch); the slide itself is slower and springier ---- */
  var SWITCHES = '#panel-usage .pmu-toggle, #panel-usage .pmu-wswitch-track, [role="switch"].pm-switch';
  document.addEventListener('pointerdown', function (e) {
    if (!isGlass() || e.button !== 0) return;
    var sw = e.target.closest && e.target.closest('#panel-usage .pmu-toggle, #panel-usage .pmu-wswitch, #pm-o55-onboarding .o55-toggle');
    if (!sw) return;
    var host = sw.classList.contains('pmu-wswitch') ? sw.querySelector('.pmu-wswitch-track') : sw.classList.contains('o55-toggle') ? sw.querySelector('.o55-switch') : sw;
    if (!host) return;
    host.setAttribute('data-lg-held', '');
    var up = function () { document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', up, true); setTimeout(function () { host.removeAttribute('data-lg-held'); }, 160); };
    document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
  }, true);

  /* ---- morph: a menu pours out of its control ------------------------------------------------------------------ */
  var lastPress = null, menuMotions = new Map();
  document.addEventListener('pointerdown', function (e) { lastPress = e.target.closest && e.target.closest('button, [role="button"], .pm6-tb-menu-trigger, .pmu-ctlbtn'); }, true);
  function resetMenuMorph(menu) {
    var M = menuMotions.get(menu);
    if (M) {
      if (M.frame) cancelAnimationFrame(M.frame);
      if (M.held) menu.style.opacity = '';
      M.animations.forEach(function (target, an) { an.onfinish = null; an.oncancel = null; an.cancel(); }); M.animations.clear(); menuMotions.delete(menu);
    }
    menu.__lgMorphed = false;
  }
  function menuAnimation(menu, target, frames, options) {
    var M = menuMotions.get(menu), an = target.animate(frames, options); M.animations.set(an, target);
    var done = function () { M.animations.delete(an); if (!M.frame && !M.animations.size && menuMotions.get(menu) === M) menuMotions.delete(menu); };
    an.onfinish = done; an.oncancel = done; return an;
  }
  function morph(menu, anchor) {
    if (!isGlass() || !visible(menu) || menu.__lgMorphed) return;
    resetMenuMorph(menu); menu.__lgMorphed = true;
    var M = { frame: 0, held: false, animations: new Map() }; menuMotions.set(menu, M);
    if (reduced()) { menuAnimation(menu, menu, [{ opacity: 0 }, { opacity: 1 }], { duration: 140 }); return; }
    /* the menu's own opening animation starts a moment after ours and would win: run ours on the next frame, after
       cancelling it, holding the first keyframe so the menu never flashes at full size */
    menu.style.opacity = '0'; M.held = true;
    M.frame = requestAnimationFrame(function () {
      M.frame = 0; menu.style.opacity = ''; M.held = false;
      if (!isGlass() || !visible(menu) || menuMotions.get(menu) !== M) { resetMenuMorph(menu); return; }
      if (reduced()) { menuAnimation(menu, menu, [{ opacity: 0 }, { opacity: 1 }], { duration: 140 }); return; }
      morphNow(menu, anchor);
    });
  }
  function morphNow(menu, anchor) {
    menu.getAnimations().forEach(function (an) { an.cancel(); });
    var m = menu.getBoundingClientRect(), a = anchor && anchor.isConnected ? anchor.getBoundingClientRect() : { left: m.left, top: m.top, width: 40, height: 30 };
    var S = spring.apply(null, LIQUID), frames = [];
    var sx0 = a.width / m.width, sy0 = a.height / m.height, tx0 = a.left - m.left, ty0 = a.top - m.top;
    for (var i = 0; i < S.length; i++) {
      var p = S[i].x, sx = sx0 + (1 - sx0) * p, sy = sy0 + (1 - sy0) * p;
      frames.push({ offset: S[i].t / S[S.length - 1].t, transform: 'translate3d(' + (tx0 * (1 - p)).toFixed(1) + 'px,' + (ty0 * (1 - p)).toFixed(1) + 'px,0) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')' });
    }
    menu.style.transformOrigin = '0 0';
    menuAnimation(menu, menu, frames, { duration: S[S.length - 1].t, easing: 'linear', fill: 'backwards' });
    menuAnimation(menu, menu, [{ opacity: 0.2 }, { opacity: 1, offset: 0.25 }, { opacity: 1 }], { duration: S[S.length - 1].t, easing: 'linear' });
    /* each child fades in, 10 ms apart; the lens layer is not one of them: each lens takes its own row's entrance (ride),
       so it never arrives after its tabs (Jared #21) */
    Array.prototype.slice.call(menu.children, 0, 30).filter(function (k) { return !k.classList.contains('lg-lenses-local'); }).forEach(function (k, i) { menuAnimation(menu, k, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 110 + i * 10, easing: 'ease-out', fill: 'backwards' }); });
    lenses.forEach(function (L) { if (L.tgt && L.rect && L.layer !== layer && menu.contains(L.layer)) ride(L, L.tgt); });
  }
  function lensesUnder(menus) {
    lenses.forEach(function (L) {
      if (!L.rect || L.under) return;   /* a lens under its labels is under every menu already */
      if (!menus.length) { if (L.lens.classList.contains('lg-under')) L.lens.classList.remove('lg-under'); return; }
      /* a lens drawn inside a menu (the theme menu's Light / Dark / Auto) is on that menu, not under it */
      var r = L.lens.getBoundingClientRect(), hit = menus.some(function (o) { var m = o.r; return !o.el.contains(L.lens) && r.right > m.left && r.left < m.right && r.bottom > m.top && r.top < m.bottom; });
      if (L.lens.classList.contains('lg-under') !== hit) L.lens.classList.toggle('lg-under', hit);
    });
  }
  var MENU_SELECTOR = '.pmu-pop, .pmr-menu-list, #lg-demo-pop, .pm6-tb-menu, #themeMenu, .pmn-panel', knownMenus = new Set();
  function scanMenus(scopes) {
    scopedNodes(MENU_SELECTOR, scopes).forEach(function (m) { knownMenus.add(m); });
    var open = [], theme = [], pops = [], lists = [];
    knownMenus.forEach(function (m) {
      if (!m.isConnected) { knownMenus.delete(m); return; }
      var shown = null;
      function isShown() { if (shown === null) shown = visible(m); return shown; }
      if (m.matches('.pmu-pop.open, .pmr-menu-list, #lg-demo-pop[data-open], .pm6-tb-menu.is-open') && isShown()) open.push({ el: m, r: m.getBoundingClientRect() });
      if (m.id === 'themeMenu') theme.push(m);
      if (m.matches('.pmu-pop')) pops.push(m);
      if (m.matches('.pmr-menu-list')) lists.push(m);
    });
    if (bead && bead.classList.contains('lg-under') !== (open.length > 0)) bead.classList.toggle('lg-under', open.length > 0);
    /* an open title-bar menu hides the hover tag (glass.css). It was html:has(.pm6-tb-menu.is-open): a :has() on the root is
       matched again on every insertion in the page, 40 ms of style in one Usage room change on a P1000 */
    var tbOpen = open.some(function (o) { return o.el.classList.contains('pm6-tb-menu'); });
    if (root.hasAttribute('data-lg-tbmenu') !== tbOpen) root.toggleAttribute('data-lg-tbmenu', tbOpen);
    theme.forEach(function (m) { if (m.classList.contains('is-open') && visible(m)) { mount(m, 'menu'); morph(m, document.getElementById('themeSelect')); } else resetMenuMorph(m); });
    lensesUnder(open);
    pops.forEach(function (m) { if (m.classList.contains('open')) { mount(m, 'menu'); morph(m, document.querySelector('.pmu-menu-anchor-open') || lastPress); } else resetMenuMorph(m); });
    lists.forEach(function (m) { if (visible(m)) { mount(m, 'menu'); morph(m, lastPress); } else resetMenuMorph(m); });
  }

  /* ---- materialize: glass arrives by ramping its refraction and its frost, not by fading ---------------------------- */
  /* glass condenses into place when Glass is switched on (never on a page or tab change: Jared, 2026-10-11, the Usage
     page was too busy) */
  function materialize(list) {
    if (reduced()) return;
    list.forEach(function (e, i) { if (e.isConnected && /panel|card|bar/.test(e.getAttribute('data-lg-kind') || '')) e.animate([{ '--lg-mat': 0 }, { '--lg-mat': 1 }], { duration: 620, delay: i * 22, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }); });
  }

  /* ---- sync -------------------------------------------------------------------------------------------------------- */
  var syncQ = 0, lazyT = 0, pageT = 0, hotReset = 0, hotDone = false, dirtyAll = false, dirtyRoots = new Set();
  function dirtyScope(e) {
    if (!e || e.nodeType !== 1) return;
    if (e === document.body || e === root) { dirtyAll = true; return; }
    /* A changed section can move the following sections, even without resizing them. Read their common layout
       owner, not the rest of the app. Rail selection also drives the lens in the adjacent activity bar. */
    var sheet = e.closest('[data-lg-kind="panel"], [data-lg-kind="card"], [data-lg-kind="bar"]');
    var s = sheet && sheet !== e && !sheet.matches('.title-bar, .left-panel, #chatPanel, #pm7GlobalStatusBar') ? sheet : e;
    if (!s) s = e;
    var covered = false;
    dirtyRoots.forEach(function (p) { if (p.contains(s)) covered = true; else if (s.contains(p)) dirtyRoots.delete(p); });
    if (!covered) dirtyRoots.add(s);
    if (e.closest('#sidePanelSlot')) { var rail = document.getElementById('activityBar'); if (rail) dirtyRoots.add(rail); }
  }
  function pruneGlass() {
    glassSet.forEach(function (e) {
      if (e.isConnected && e.__lgOpt && !OPT_IN[e.getAttribute('data-lg-surface')]) { e.__lgOpt = false; unmount(e); e.removeAttribute('data-lg-kind'); return; }
      if (e.isConnected) return;
      if (typeof unmount === 'function') unmount(e);
      else { if (sizeWatch) sizeWatch.unobserve(e); glassSet.delete(e); }
    });
    if (typeof pruneLenses === 'function') pruneLenses();
  }
  function syncAll() { dirtyAll = true; syncPending(); }
  /* a look or NieR Mode changed: its switcher tokens are read by the next sync, after the frame's own layout. Read from the
     root observer, getComputedStyle(<html>) forced the whole page through the new look's style while the app was still
     writing it, and the sync then forced it again (NieR Mode on under Reduce Motion: 760 + 741 ms on the P1000,
     pm7-motion-settings 2026-10-16) */
  var switchStale = false;
  function syncPending() {
    movedIn = new Map(); cvSeen = new Map();
    try { syncPendingNow(); } finally { movedIn = null; cvSeen = null; }
  }
  function syncPendingNow() {
    if (switchStale) { switchStale = false; readSwitch(); }
    /* an immediate hot/API sync covers queued work; keep no second callback that can remount it next frame */
    if (syncQ) { cancelAnimationFrame(syncQ); syncQ = 0; }
    if (lazyT) { clearTimeout(lazyT); lazyT = 0; }
    /* while a scroll is still moving, its sheets wait for the settle (they stay pinned and keep their rims) */
    var scrolling = !!scrollSettleT, scopes = dirtyAll ? null : Array.from(dirtyRoots), sheets = scrolling ? new Set() : settleSheets, strips = settleStrips;
    dirtyAll = false; dirtyRoots.clear(); if (!scrolling) settleSheets = new Set(); settleStrips = new Set();
    if (scopes && !scopes.length && !sheets.size && !strips.size) return;
    pruneGlass();
    sheets.forEach(unpin);   /* the scroll has settled: anchored frost again, at the very spot it is pinned */
    if (root.hasAttribute('data-lg-demo-host') && document.getElementById('lg-demo-btn')) demo();
    applyWall();
    if (!isGlass()) { unmountAll(switchLook); if (!switchLook) return; }
    else syncSurfaces(scopes, sheets);
    var covered = pageCovered(), todo = [];
    STRIPS.forEach(function (cfg) {
      var found = cfg.many ? scopedNodes(cfg.sel, scopes) : [document.querySelector(cfg.sel)].filter(function (s) {
        return s && (!scopes || scopes.some(function (p) { return p.contains(s) || s.contains(p); }));
      });
      strips.forEach(function (s) { if (s.matches(cfg.sel) && found.indexOf(s) < 0) found.push(s); });
      /* the activity bar's icon lens is Glass's own rail design; an adopting look keeps its own lit icon there */
      if (cfg.kind === 'lensIcon' && !isGlass()) { found.forEach(function (s) { var L = lenses.get(s); if (L) { disposeLens(L); lenses.delete(s); } }); return; }
      found.forEach(function (s) {
        if (stripParked(s)) { var P = lenses.get(s); if (P && P.rect) { stopLensTravel(P); P.lens.style.opacity = '0'; P.rect = null; } return; }
        /* under a look's cover, a strip whose lens is not on screen yet waits for the lift; a shown lens follows now */
        if (covered && !(lenses.get(s) && lenses.get(s).rect) && !s.closest('#pm-o55-onboarding')) { deferStrip(s); return; }
        if (cvSkipped(s)) { cvSkip(s); return; }
        todo.push([cfg, s]);
      });
    });
    /* a strip that gets a new lens has its scroller and its position read here, every one before any lens is made: made
       one by one, each new under-layer changed the page before the next strip's reads (the first NieR Mode on, at the calm
       cover's lift: about 35 forced style and layout passes, 48 ms on Nas1, F2) */
    var park = parkedLenses[switchUnder ? 'under' : 'over']; preSerial++;
    cvWait.forEach(function (x) { if (!x.isConnected) cvWait.delete(x); });
    todo.forEach(function (t) { var s = t[1], L = lenses.get(s); if ((!L || !L.lens.isConnected) && !park.has(s)) prereadStrip(s); });
    syncStrips(todo);
    if (isGlass()) scanMenus(scopes);
  }
  /* strips Glass leaves alone for now (pm7-motion-editor, 2026-10-16: during Settings' calm cover, 47 style reads hit the
     editor's parked Customize screen within 2.8 s). A strip inside a parked or hidden subtree (the prepared Customize
     screen, a [hidden] window) is not measured, and a lens it showed is put out; it is synced when that subtree shows,
     which the root observer reports. An inert subtree is not skipped: the page behind a dialog stays on screen.
     While a look's cover hides the page (window.PM_LOOK_COVERED(): a look change until its cover starts to lift, the NieR
     reboot plate, the calm cover; or the boot cover), a strip whose lens is not on screen waits, and every waiting strip
     is synced in the frame the cover starts to lift, so the chips are there for the whole reveal (landing review GL-2).
     Other busy spells (a page slide, a Usage room change, the open onboarding window) defer nothing, and a strip inside
     the onboarding window never waits (GL-1). Nothing here is read from style or layout. */
  var STRIP_PARKED = '.pmed-prepared, [hidden]', busyStrips = new Set(), busySheets = new Set(), busyWait = false;
  function stripParked(s) { try { return !!s.closest(STRIP_PARKED); } catch (e) { return false; } }
  /* B6 packet 1, the Basic path (2026-10-16): a strip inside a content-visibility: auto section the browser is skipping
     (the editor's Customize groups out of view) is not drawn, and any read of it (its scroller walk, its box, even
     checkVisibility) made the browser style and lay out that whole section first: one forced pass per section, 4 or 5 in
     each sync of the Customize open (the P1000's 320/100/173/94/105-element restyles, about 15-19 ms a sync, twice per
     open). Such a strip is not read at all: a lens it shows steps out, as a scrolled-away one does, and it is synced when
     its section becomes relevant (contentvisibilityautostatechange, skipped false). Nothing inside a skipped section is
     asked: its section is found by walking the strip's ancestors from the top down and stopping at the first
     content-visibility: auto one, whose own style and box sit outside what it skips. A section is taken as skipped until
     its event says it is relevant (a section starts out skipped; each change of that fires the event), unless its box is
     on screen, so a section in view is synced at once, as before. Off where the event does not exist. */
  var CV_ON = typeof window.ContentVisibilityAutoStateChangeEvent === 'function', cvRelevant = new WeakSet(), cvWait = new Set(), cvSeen = null;
  /* a strip inside a closed <details> (not its summary) is not drawn either: the browser locks that content the same way,
     and is asked nothing about it; opening the <details> syncs its strips (the page observer watches 'open') */
  function cvSkipped(s) {
    if (inClosedDetails(s)) return true;
    if (!CV_ON) return false;
    var up = [];
    for (var a = s.parentElement; a && a !== document.documentElement; a = a.parentElement) up.push(a);
    for (var i = up.length - 1; i >= 0; i--) {
      var c = up[i], cv = cvSeen && cvSeen.get(c);
      if (cv === undefined) { cv = getComputedStyle(c).contentVisibility; if (cvSeen) cvSeen.set(c, cv); }
      if (cv === 'visible' || (cv === 'auto' && cvRelevant.has(c))) continue;
      /* a section that is neither relevant yet nor out of view, or a hidden one, is left to the strip's own reads, as before:
         nothing below it is asked here */
      if (cv !== 'auto') return false;
      var r = c.getBoundingClientRect();
      return !(r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth);
    }
    return false;
  }
  function cvSkip(s) {
    var L = lenses.get(s);
    if (L && L.lens.isConnected && L.rect) { stopLensTravel(L); if (L.lens.style.opacity !== '0') L.lens.style.opacity = '0'; L.rect = null; }
    cvWait.add(s);
  }
  if (CV_ON) document.addEventListener('contentvisibilityautostatechange', function (e) {
    var t = e.target; if (!t || t.nodeType !== 1) return;
    if (e.skipped) { cvRelevant.delete(t); return; }
    cvRelevant.add(t);
    if (!cvWait.size) return;
    var any = false;
    cvWait.forEach(function (x) { if (!x.isConnected) cvWait.delete(x); else if (t.contains(x)) { cvWait.delete(x); settleStrips.add(x); any = true; } });
    if (any && switchOn()) queueSync();
  }, true);
  function pageBusy() { try { return typeof window.PM_BUSY === 'function' && !!window.PM_BUSY(); } catch (e) { return false; } }
  /* the covers are read from their own markers, not from PM_BUSY(), which names only the first of several reasons (an open
     onboarding window or a page change is named before the boot; landing review GD-1) */
  /* the tour's boot cover is a child of <body> (85-tour-nier.js coverBoot): its children are looked at, not the document (a
     live getElementsByClassName's length walked the whole document again after every change: 4 ms of each sync while
     the editor's Customize screen opened, Nas1, B6) */
  function tourCovered() {
    for (var c = document.body && document.body.lastElementChild; c; c = c.previousElementSibling) if (c.classList.contains('o55t-bootcover')) return true;
    return false;
  }
  function pageCovered() {
    try {
      if (root.hasAttribute('data-o55-boot-wait') || document.getElementById('o55nw-boot') || tourCovered()) return true;
      if (typeof window.PM_LOOK_COVERED === 'function') return !!window.PM_LOOK_COVERED();
      var t = window.PM_THEME_TRANSITION;
      return !!(document.getElementById('o55np-reboot') || document.getElementById('o55np-calm') || (t && typeof t.busy === 'function' && t.busy()));
    } catch (e) { return false; }
  }
  function deferStrip(s) { busyStrips.add(s); waitUncovered(); }
  /* a sheet that scrolled under a cover: measured with the rest once the cover lifts (review GF5-1) */
  function deferSheet(e) { busySheets.add(e); waitUncovered(); }
  function waitUncovered() {
    if (busyWait) return;
    busyWait = true;
    (function uncovered() {
      if (pageCovered()) { requestAnimationFrame(uncovered); return; }
      busyWait = false;
      busyStrips.forEach(function (x) { if (x.isConnected) settleStrips.add(x); }); busyStrips.clear();
      busySheets.forEach(function (x) { if (x.isConnected) settleSheets.add(x); }); busySheets.clear();
      queueSync();
    })();
  }
  function queueSync(scope) {
    if (scope && scope.nodeType === 1) dirtyScope(scope);
    if (afterLayout()) return;
    if (!syncQ) syncQ = requestAnimationFrame(function () { syncQ = 0; syncPending(); });
  }
  /* A sync waits for the frame's own layout: a ResizeObserver's first report of a fresh observation comes after layout
     and before paint, where every read is free and what the sync writes is still drawn in that frame. Synced in the
     click task or a frame callback, its first read forced the page's pending style and layout: a Usage room's (up to
     137 ms, and then a second layout: one 312 ms task in r64's trace), and a Settings chapter's (about 300 ms on the
     P1000, 2026-10-16). Only an opening menu syncs at once (hotSync). afterLayout(fn) runs fn there too (a rim bake's
     step). A request made inside that delivery waits for the next frame's layout, as a fresh observation made there
     would be skipped and reported as a ResizeObserver loop error. */
  var postEl = null, postRO = null, postQ = false, postOn = false, postFns = [], postRunning = false;
  function afterLayout(fn) {
    if (!window.ResizeObserver || !document.body) return false;
    if (fn) postFns.push(fn); else postQ = true;
    if (postOn) return true;
    if (!postRO) postRO = new ResizeObserver(function () {
      if (!postOn) return;
      postOn = false; postRO.unobserve(postEl); postRunning = true;
      try {
        /* the queue is taken before the sync: a callback the sync itself queues waits for the next delivery instead of
           reading what the sync has just written (landing review GL-5) */
        var fns = postFns; postFns = [];
        if (postQ) {
          postQ = false;
          if (syncQ) { cancelAnimationFrame(syncQ); syncQ = 0; }
          syncPending();
        }
        fns.forEach(function (f) { f(); });
      } finally { postRunning = false; }
    });
    if (!postEl || !postEl.isConnected) {
      postEl = el('i', { id: 'lg-post', 'aria-hidden': 'true' });
      postEl.style.cssText = 'position:fixed;left:-8px;top:-8px;width:2px;height:2px;pointer-events:none;visibility:hidden';
      document.body.appendChild(postEl);
    }
    postOn = true;
    if (postRunning) requestAnimationFrame(function () { if (postOn) postRO.observe(postEl); });
    else postRO.observe(postEl);
    return true;
  }
  /* One immediate input sync per actual frame; later genuine changes share the next before-paint pass. A newly
     opened menu still gets its held first keyframe immediately, and pointerdown lens travel stays synchronous. */
  function hotSync() {
    if (hotDone) { scanMenus(dirtyAll ? null : Array.from(dirtyRoots)); queueSync(); return; }
    hotDone = true;
    if (!hotReset) hotReset = requestAnimationFrame(function () { hotReset = 0; hotDone = false; });
    syncPending();
  }
  function lazySync(scope) {
    if (scope !== false) { if (scope && scope.nodeType === 1) dirtyScope(scope); else dirtyAll = true; }
    if (!lazyT) lazyT = setTimeout(function () { lazyT = 0; queueSync(); }, 140);
  }
  var HOT = '[data-lg-surface], .page-tab, #pmuRange > button, .pmu-navbtn, .pm-segtab-item, #activityBar .icon, .side-panel-view, .pmu-pop, .pmr-menu-list, .pmr-menu-group, .pm6-tb-menu, .o55-railitem, .o55-seg button, #pm-settings-root .segmented > button, .o55-win, .o55t-callout, .o55t-bar';
  var GENERATED = '#lg-optics, #lg-lenses, .lg-lenses-local, .lg-lenses-under, .lg-hops, #lg-shine, .lg-press, .pm-segtab-track, #lg-post, #lg-shown, lg-warm';
  /* menus that pour out of their control (morph) or hide the hover tag sync inside the click's task, so the spring's
     first frame is the menu's first frame. Any other floating sheet ([data-lg-surface], the onboarding window, the tour)
     is mounted after the frame's own layout, still before that frame is painted, instead of forcing the app's style for
     the whole new sheet inside the click (the editor's Customize screen: 28-38 ms forced on a P1000, 2026-10-16) */
  var MENU_HOT = '.pmu-pop, .pmr-menu-list, .pm6-tb-menu, #themeMenu';
  function generatedMutation(rec) {
    var t = rec.target;
    if (t.nodeType === 1 && t.closest(GENERATED)) return true;
    if (rec.type !== 'childList') return false;
    /* app replacement can remove a persistent output layer; let that schedule its reconstruction */
    for (var i = 0; i < rec.removedNodes.length; i++) {
      var n = rec.removedNodes[i]; if (n.nodeType !== 1 || !n.matches('#lg-shine, .lg-press, .lg-hops, lg-warm')) return false;
    }
    var nodes = Array.prototype.slice.call(rec.addedNodes).concat(Array.prototype.slice.call(rec.removedNodes));
    return nodes.length > 0 && nodes.every(function (n) { return n.nodeType === 1 && n.matches(GENERATED); });
  }
  var lastPage = null, lastTheme = root.getAttribute('data-theme'), lastLg = root.getAttribute('data-lg');
  var lastTier = root.getAttribute('data-lg-tier'), lastWall = root.getAttribute('data-lg-wall'), lastMotion = root.getAttribute('data-motion');
  var lastO55 = root.hasAttribute('data-o55-open'), lastNier = root.getAttribute('data-o55-nier');
  /* a card inserted into the board during a room change: marked now, mounted by sizeWatch after the next layout */
  function premark(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.nodeType !== 1 || !n.isConnected || !n.matches(BOARD_CARD)) continue;
      if (n.getAttribute('data-lg-kind') !== 'card') n.setAttribute('data-lg-kind', 'card');
      /* observed afresh, so its first callback reports it even when it kept its size (a shared card moved in from the old
         board, which needs anchoring at its new place) */
      if (sizeWatch) { sizeWatch.unobserve(n); sizeWatch.observe(n); }
    }
  }
  var mo = new MutationObserver(function (recs) {
    var hot = false, menuHot = false, relevant = false, area = boardMoment() ? document.querySelector(BOARD_AREA) : null;
    for (var i = 0; i < recs.length; i++) {
      /* an app redrew a strip and dropped its under-layer with the chip in it: the chip comes back in this frame, not after
         the lazy sync (an opaque chip gone for 140 ms left its inverted label on bare ground) */
      if (recs[i].type === 'childList' && recs[i].removedNodes.length) for (var u = 0; u < recs[i].removedNodes.length; u++) { var rn = recs[i].removedNodes[u]; if (rn.nodeType === 1 && rn.matches('.lg-lenses-under')) hot = true; }
      /* optics, lenses and light are outputs of sync, never inputs that should schedule it again */
      if (generatedMutation(recs[i])) continue;
      if (recs[i].type === 'attributes' && recs[i].oldValue === recs[i].target.getAttribute(recs[i].attributeName)) continue;
      if (area && area.contains(recs[i].target)) { boardStale = true; if (recs[i].type === 'childList') premark(recs[i].addedNodes); continue; }
      relevant = true;
      var t = recs[i].target; if (t.nodeType !== 1) continue;
      dirtyScope(recs[i].type === 'attributes' ? t.parentElement || t : t);
      /* a <details> opening shows sheets that were not drawn: they are mounted in this frame (inClosedDetails) */
      if (recs[i].attributeName === 'open' && t.tagName === 'DETAILS') { hot = true; dirtyScope(t); if (t.open) bakeSoon(t); }
      if (t.matches(HOT)) { hot = true; if (t.matches(MENU_HOT)) menuHot = true; }
      else for (var j = 0; j < recs[i].addedNodes.length; j++) { var nd = recs[i].addedNodes[j]; if (nd.nodeType === 1 && (nd.matches(HOT) || nd.matches('.pmu-card') || (nd.querySelector && nd.querySelector('.pmr-menu-list, .pmu-card, #pm-settings-root .segmented')))) { hot = true; if (area && (nd.matches(MENU_HOT) || (nd.querySelector && nd.querySelector('.pmr-menu-list')))) menuHot = true; break; } }
    }
    if (!relevant) return;
    var page = document.querySelector('.page-tabs .page-tab.active'); page = page && page.id;
    var changed = Array.from(dirtyRoots), full = dirtyAll;
    /* a change syncs after the frame's own layout (afterLayout), where every read is free, instead of forcing the app's
       half-built page through style and layout inside its click; a menu that morphs opening in Glass still gets its first
       keyframe at once (MENU_HOT). A look that adopts the switcher has no glass to keep in step: its strips sync after
       the frame's own layout too (Q16). A press still moves the lens at once (pointerdown). */
    if (area && !menuHot) afterLayout();
    else if (hot && switchOn()) { if ((menuHot && isGlass()) || !afterLayout()) hotSync(); }
    else lazySync(false);
    if (page !== lastPage) {
      var first = lastPage === null; lastPage = page;
      if (pageT) { clearTimeout(pageT); pageT = 0; }
      if (!first) pageT = setTimeout(function () {
        pageT = 0; if (full) dirtyAll = true; else changed.forEach(dirtyScope); queueSync();
      }, 30);
    }
  });
  new MutationObserver(function () {
    /* a Usage room change has ended: its board is checked once (boardMoment) */
    if (!root.hasAttribute('data-pmu-moment')) {
      if (boardStale) { boardStale = false; var area = document.querySelector(BOARD_AREA); if (area) { dirtyScope(area); lazySync(false); } }
      if (ptrLate) { ptrLate = false; if (!ptrQ) { ptrQ = true; requestAnimationFrame(onPtr); } }
    }
    var th = root.getAttribute('data-theme'), lg = root.getAttribute('data-lg');
    var tier = root.getAttribute('data-lg-tier'), wall = root.getAttribute('data-lg-wall'), motion = root.getAttribute('data-motion');
    /* the onboarding window opening or closing hides or shows the app's strips: every lens is checked again */
    var o55 = root.hasAttribute('data-o55-open');
    if (o55 !== lastO55) { lastO55 = o55; dirtyAll = true; queueSync(); }
    /* NieR Mode paints over a Basic look without changing data-theme: a look's switcher tokens may differ with it on
       (Q16), so they are read again and every strip synced, by the next sync after the frame's own layout (switchStale) */
    var nier = root.getAttribute('data-o55-nier');
    if (nier !== lastNier) { lastNier = nier; switchStale = true; lenses.forEach(function (L) { L.rect = null; }); dirtyAll = true; queueSync(); }
    if (th === lastTheme && lg === lastLg && tier === lastTier && wall === lastWall && motion === lastMotion) return;
    /* a look, tier or motion change ends a frost crossfade at once (the wallpapers package drops its print fade too) */
    if (xf && (th !== lastTheme || lg !== lastLg || tier !== lastTier || (motion !== lastMotion && reduced()))) endFrostFade();
    /* the print is about to change under glass that stays glass: hold the one the current frost was made from */
    var wasGlass = lastLg === 'on' && /^glass/.test(lastTheme || '');
    if (wasGlass && isGlass() && wall !== lastWall && th === lastTheme && wallSourceUrl) {
      var previousWall = wallSourceUrl, nextWall = currentWallUrl();
      /* This observer handles wallpaper identity, while resize owns viewport changes. No layout read may split
         the prepared attribute/frost transaction after the caller's writes. */
      if (frostWallUrl !== nextWall) holdWall(previousWall);
    } else if (!isGlass()) releaseWallHold();
    if (motion !== lastMotion && reduced() && typeof suspendLensMotion === 'function') suspendLensMotion();
    lastTier = tier; lastWall = wall; lastMotion = motion;
    if (th !== lastTheme || lg !== lastLg) {
      switchStale = true;
      /* the hover bead is Glass's alone: a look that leaves Glass drops it (a look that adopts the switcher paints every
         .lg-lens as its chip, so a bead left behind stood on the title bar as a block until a reload; Q16 review F1) */
      if (!isGlass() && bead) { resetBead(); removeLensElement(bead); bead = null; }
      var enter = isGlass() && (!/^glass/.test(lastTheme || '') || lastLg !== 'on');
      lastTheme = th; lastLg = lg; lenses.forEach(function (L) { L.rect = null; });
      glassSet.forEach(function (e) { e.__lgSig = null; });
      /* after the new look's own style and layout, not forcing them here (then the entrance, on the sheets just mounted).
         Its wallpaper is chosen now, so the look's first style pass already has it. */
      applyWall(); dirtyAll = true;
      if (!afterLayout(function () { if (enter && isGlass()) materialize(Array.from(glassSet)); })) { readSwitch(); switchStale = false; syncAll(); if (enter) materialize(Array.from(glassSet)); }
      else afterLayout();
      lastWall = root.getAttribute('data-lg-wall');
    } else { dirtyAll = true; queueSync(); }
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-lg', 'data-lg-tier', 'data-lg-wall', 'data-motion', 'data-o55-open', 'data-pmu-moment', 'data-o55-nier'] });
  applyWall();
  window.addEventListener('blur', function () { root.setAttribute('data-lg-inactive', ''); });
  window.addEventListener('focus', function () { root.removeAttribute('data-lg-inactive'); });

  function knobFilter() {   /* one shared lens for every switch knob (18 px) */
    if (document.getElementById('lg-knob')) return;
    var m = buildLensMaps(18, 18, 9, 7, 15, 1.16, 1.2); lensFilter(18, 18, m, 0.6, 'lg-knob');
  }
  function start() {
    ensureDefs(); viewportVars(); knobFilter(); readSwitch();
    window.addEventListener('resize', viewportVars);
    /* the frost is drawn for one viewport: a resize mid-crossfade ends it */
    window.addEventListener('resize', function () { endFrostFade(); });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['class', 'hidden', 'data-open', 'data-lg-surface', 'open'] });
    if (window.ResizeObserver) { var ro = new ResizeObserver(function (entries) { entries.forEach(function (en) { dirtyScope(en.target); }); lazySync(false); }); ['.app-shell', '.left-panel', '#sidePanelSlot', '#chatPanel', '#pmuBoard', '#pmuApp'].forEach(function (s) { var e = document.querySelector(s); if (e) ro.observe(e); }); }
    window.addEventListener('resize', lazySync);
    demo();
    syncAll(); setTimeout(syncAll, 500); setTimeout(syncAll, 1500);
    if (isGlass()) setTimeout(function () { syncAll(); materialize(Array.from(glassSet)); }, 700);
    /* the shader warm-up starts once the page has loaded and settled (with the page's warm queue, the queue waits for an
       idle moment itself) */
    var warmLater = function () { setTimeout(function () { if (window.requestIdleCallback && !warmQueue()) requestIdleCallback(warmUp, { timeout: 4000 }); else warmUp(); }, 3000); };
    if (document.readyState === 'complete') warmLater(); else addEventListener('load', warmLater, { once: true });
  }

  /* ---- shader warm-up (motion pass B1, 2026-10-16) ---------------------------------------------------------------------
     On the P1000 a page or Settings chapter change held for 130-230 ms while the GPU compiled, the first time in the
     session, the shader program for each new kind of drawing: a rounded box with a given shadow, ring, border, clip or
     image. A second visit held none. After start-up, in idle time, each kind of box the app draws (WARM_CATALOG,
     generated by tools/warm_catalog.py from a harvest of every page, Settings chapter and menu in every look and NieR Mode,
     of every Usage room and board state in the eight looks, of the frost crossfade's overlays in Glass, and of Settings'
     segmented chips moving)
     is drawn once as it is and once inside a faded, scaled wrapper (a page entrance), and each kind of SVG icon on the
     page at two sizes. Each is one frame in a 48 px box in the bottom-right corner at opacity 0.004 on a layer of its
     own: drawn, so its program is compiled, but under 1/255 over 48 px for that frame, so nothing shows. The box lives
     in a closed shadow root, so no page observer sees its changes. The warm-up waits while window.PM_BUSY() reports a
     cover or a transition (until 'pm-idle'), for 600 ms after any input, and while the page is hidden. With the page's
     idle-warm queue (window.PM_WARM, IDLE-WARM-RULE.md, F6) every kind goes through that queue instead (warmSteps). */
  /* WARM-CATALOG:START (generated by tools/warm_catalog.py; do not edit by hand) */
  var WARM_CATALOG = [["border-bottom-width:1px;border-top-style:none;border-right-style:none;border-bottom-style:solid;border-left-style:none;background-color:rgb(128,128,128);border-color:rgb(128,128,128)",400,40,0,[],12],["background-color:rgb(128,128,128);border-radius:4px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",80,20,0,[],13],["color:rgb(128,128,128);border-radius:4px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0)",57,29,1,[],4],["border-radius:4px",35,32,0,[["0px 0px 0px 0px",36,420,""]],1],["background-color:rgba(128,128,128,0.5);background-image:radial-gradient(135% 150% at 6% -30%, rgba(128,128,128,0.5), rgba(128,128,128,0) 56%), radial-gradient(120% 150% at 100% 0%, rgba(128,128,128,0.5), rgba(128,128,128,0) 52%), none;background-size:auto, auto, auto;background-position:0% 0%, 0% 0%, 0% 0%;background-repeat:repeat, repeat, repeat;backdrop-filter:blur(14px) saturate(1.4)",240,50,0,[],3],["background-color:rgba(128,128,128,0.5);backdrop-filter:blur(14px) saturate(1.4)",240,40,0,[],3],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 1px inset;background-color:rgba(128,128,128,0.5);border-radius:8px",240,40,0,[],4],["background-color:rgba(128,128,128,0.5);border-radius:4px",201,25,0,[["0px 0px 0px 0px",204,25,""],["0px 0px 0px 0px",215,75,""],["0px 0px 0px 0px",226,125,""]],2],["background-image:radial-gradient(closest-side, rgb(128,128,128), rgba(128,128,128,0));opacity:0.082;border-radius:50%",12,12,0,[],7],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0) 0px -1px 1px 0px inset, rgba(128,128,128,0) 0px 0px 0px 0.5px, rgba(128,128,128,0) 0px 0px 0px 0px;background-image:radial-gradient(70% 100% at 30% 0%, rgba(128,128,128,0), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), linear-gradient(rgba(128,128,128,0), rgba(128,128,128,0));background-size:calc(100% - 4px) 38%, auto, auto;background-position:2px 1px, 0% 0%, 0% 0%;background-repeat:no-repeat, repeat, repeat;border-radius:6px",80,32,0,[["8px 8px 8px 8px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],5,[1,"*"]],["border-bottom-width:1px;border-top-style:none;border-right-style:none;border-bottom-style:solid;border-left-style:none;border-color:rgb(128,128,128)",400,30,0,[["0px 0px 0px 0px",420,420,""],["8px 8px 8px 8px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 1px 2px 0px, rgba(128,128,128,0.5) 0px 26px 50px -26px;background-color:rgb(128,128,128);background-image:linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 46%);border-radius:12px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0.5)",240,172,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["8px 8px 8px 8px",420,420,""]],15,[5,"*"]],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 1px inset, rgba(128,128,128,0.5) 0px 0px 6px 0px inset;opacity:0;border-radius:12px",240,172,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["8px 8px 8px 8px",420,420,""]],1],["background-image:radial-gradient(70% 120% at 32% 0%, rgb(128,128,128) 0px, rgba(128,128,128,0.5) 46%, rgba(128,128,128,0) 78%);opacity:0.9;border-radius:12px",240,172,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["8px 8px 8px 8px",420,420,""]],7],["border-top-width:1px;border-top-style:dashed;border-right-style:none;border-bottom-style:none;border-left-style:none;border-color:rgb(128,128,128)",96,27,0,[["0px 0px 0px 0px",238,140,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],5],["box-shadow:rgb(128,128,128) 0px 0px 0px 2px;background-color:rgb(128,128,128);border-radius:50%",9,9,0,[["0px 0px 0px 0px",420,298,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],5],["border-top-width:1px;border-top-style:dashed;border-right-style:none;border-bottom-style:none;border-left-style:none;opacity:0.85;border-color:rgb(128,128,128)",400,1,0,[["0px 0px 0px 0px",420,298,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["background-image:radial-gradient(circle, rgba(128,128,128,0.5) 0px, rgba(128,128,128,0.5) 42%, rgba(128,128,128,0) 70%);border-radius:50%",20,20,0,[["0px 0px 0px 0px",420,298,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["box-shadow:rgba(128,128,128,0.5) 0px 1px 2px 0px inset;background-color:rgb(128,128,128);border-radius:3px",400,10,0,[["0px 0px 0px 0px",420,298,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["background-color:rgb(128,128,128);background-image:repeating-linear-gradient(135deg, rgb(128,128,128) 0px, rgb(128,128,128) 2px, rgba(128,128,128,0) 2px, rgba(128,128,128,0) 5px);opacity:0.82",361,10,0,[["3px 3px 3px 3px",420,10,""],["0px 0px 0px 0px",420,298,""],["0px 0px 0px 0px",420,420,""]],3],["box-shadow:rgb(128,128,128) 0px -1px 0px 0px;border-bottom-width:1px;border-top-style:none;border-right-style:none;border-bottom-style:solid;border-left-style:none;border-top-color:rgb(128,128,128);border-right-color:rgb(128,128,128);border-bottom-color:rgba(128,128,128,0);border-left-color:rgb(128,128,128);border-radius:8px",400,60,0,[["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["background-color:rgba(128,128,128,0.5);backdrop-filter:blur(11px) saturate(1.4)",400,30,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["8px 8px 8px 8px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) -10px 0px 26px 0px;border-left-width:1px;border-top-style:none;border-right-style:none;border-bottom-style:none;border-left-style:solid;background-color:rgb(128,128,128);border-color:rgb(128,128,128)",400,400,0,[],1],["box-shadow:rgba(128,128,128,0.5) 0px -1px 0px 0px;border-top-width:1px;border-top-style:solid;border-right-style:none;border-bottom-style:none;border-left-style:none;background-color:rgb(128,128,128);border-color:rgb(128,128,128)",400,25,0,[],5],["box-shadow:rgba(128,128,128,0.5) 0px 0px 5px 0px;background-color:rgb(128,128,128);border-radius:50%",6,6,0,[["0px 0px 0px 0px",58,24,""],["0px 0px 0px 0px",420,25,""]],3],["box-shadow:rgba(128,128,128,0.5) 0px 6px 16px 0px;background-color:rgb(128,128,128);border-radius:6px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",135,43,0,[],1,[1,"*"]],["background-image:radial-gradient(80% 62% at 38% -6%, rgba(128,128,128,0.5), rgba(128,128,128,0) 72%), radial-gradient(52% 44% at 96% 104%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%);background-size:auto, auto;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat",400,400,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 1px 2px 0px, rgba(128,128,128,0.5) 0px 26px 50px -26px;background-color:rgb(128,128,128);background-image:radial-gradient(70% 90% at 18% -10%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 46%);background-size:auto, auto;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat;border-radius:12px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0.5)",400,292,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["background-image:linear-gradient(rgb(128,128,128) 18%, oklab(0.869054 -0.0273459 -0.0580429) 96%);background-size:100% 48px;background-position:0px 0px;background-repeat:repeat-y",88,48,0,[["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],3],["box-shadow:rgba(128,128,128,0.5) 0px 0px 8px 0px;background-image:linear-gradient(90deg, rgb(128,128,128), rgba(128,128,128,0));opacity:0.9;border-radius:1px",88,48,0,[["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],3],["box-shadow:rgba(128,128,128,0.5) 0px 1px 2px 0px inset;border-top-left-radius:7px;border-top-right-radius:7px;border-bottom-right-radius:2px;border-bottom-left-radius:2px;background-color:rgb(128,128,128);background-image:linear-gradient(to top, rgba(128,128,128,0) calc(25% - 1px), rgb(128,128,128) calc(25% - 1px), rgb(128,128,128) 25%, rgba(128,128,128,0) 25%, rgba(128,128,128,0) calc(50% - 1px), rgb(128,128,128) calc(50% - 1px), rgb(128,128,128) 50%, rgba(128,128,128,0) 50%, rgba(128,128,128,0) calc(75% - 1px), rgb(128,128,128) calc(75% - 1px), rgb(128,128,128) 75%, rgba(128,128,128,0) 75%)",21,84,0,[["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["border-top-left-radius:7px;border-top-right-radius:7px;background-image:linear-gradient(to top, rgba(128,128,128,0.5) 0px, rgba(128,128,128,0.5) 62%, oklch(0.805562 0.157615 167.474) 96%, rgb(128,128,128) 100%), linear-gradient(90deg, rgba(128,128,128,0.5), rgba(128,128,128,0) 42%, rgba(128,128,128,0) 70%, rgba(128,128,128,0.5));background-size:auto, auto;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat",21,84,0,[["0px 0px 0px 0px",21,84,""],["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""]],1,[1,"*"]],["box-shadow:rgba(128,128,128,0.5) 0px 0px 12px 3px;background-color:rgb(128,128,128);border-radius:2px",21,84,0,[["0px 0px 0px 0px",21,84,""],["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""]],7,[4,"box-shadow"]],["border-top-left-radius:7px;border-top-right-radius:7px;background-image:repeating-linear-gradient(-45deg, rgba(128,128,128,0.5) 0px, rgba(128,128,128,0.5) 3px, rgba(128,128,128,0) 3px, rgba(128,128,128,0) 6px)",21,84,0,[["0px 0px 0px 0px",21,84,""],["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""]],15],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0) 0px -1px 1px 0px inset, rgba(128,128,128,0) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 1px 2px 0px;background-image:none, linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:100% 100%, auto;background-position:0px 0px, 0% 0%;background-repeat:no-repeat, repeat;border-radius:6px",44,34,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 12px 32px 0px;background-color:rgb(128,128,128);border-radius:15px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",400,54,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],2],["background-color:rgba(128,128,128,0.5);border-radius:10px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0.5)",32,32,0,[["14px 14px 14px 14px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],5],["background-color:rgb(128,128,128);border-radius:50%",14,14,0,[["14px 14px 14px 14px",348,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["box-shadow:rgb(128,128,128) 0px 0px 0px 2px, rgb(128,128,128) 0px 0px 0px 4px, rgba(128,128,128,0.5) 0px 0px 0px 1px inset;background-image:linear-gradient(135deg, rgb(128,128,128) 0px, rgb(128,128,128) 50%, rgb(128,128,128) 50%, rgb(128,128,128) 100%);border-radius:50%",24,24,0,[["0px 0px 0px 0px",420,76,""],["0px 0px 0px 0px",420,371,""],["10px 10px 10px 10px",420,420,""]],7,[1,"box-shadow"]],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset;background-color:rgb(128,128,128);background-image:linear-gradient(rgb(128,128,128), rgb(128,128,128)), none;background-size:1.5px 8px, auto;background-position:8.5px 50%, 0% 0%;background-repeat:no-repeat, repeat",40,22,0,[["0px 0px 0px 0px",420,76,""],["0px 0px 0px 0px",420,371,""],["10px 10px 10px 10px",420,420,""]],5,[5,"*"]],["box-shadow:rgba(128,128,128,0.5) 0px 1px 2px 0px, rgba(128,128,128,0.5) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px -1px 0px 0px inset;background-color:rgb(128,128,128);background-image:linear-gradient(90deg, rgba(128,128,128,0) 5.5px, rgba(128,128,128,0.5) 5.5px, rgba(128,128,128,0.5) 6.5px, rgba(128,128,128,0) 6.5px, rgba(128,128,128,0) 9.5px, rgba(128,128,128,0.5) 9.5px, rgba(128,128,128,0.5) 10.5px, rgba(128,128,128,0) 10.5px);background-size:16px 7px;background-position:0px 50%;background-repeat:no-repeat;border-radius:2px",40,22,0,[["0px 0px 0px 0px",420,76,""],["0px 0px 0px 0px",420,371,""],["10px 10px 10px 10px",420,420,""]],1],["background-color:rgb(128,128,128);border-radius:1px",293,5,0,[["1px 1px 1px 1px",375,5,""],["0px 0px 0px 0px",411,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 6px 16px 0px, rgba(128,128,128,0.5) 0px 1px 0px 0px inset;background-image:linear-gradient(135deg, rgb(128,128,128), rgb(128,128,128));border-radius:8px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",93,32,0,[["0px 0px 0px 0px",420,420,""],["10px 10px 10px 10px",420,420,""],["0px 0px 0px 0px",420,420,""]],7,[5,"*"]],["background-image:linear-gradient(105deg, rgba(128,128,128,0) 32%, rgba(128,128,128,0.5) 50%, rgba(128,128,128,0) 68%)",93,32,0,[["0px 0px 0px 0px",420,420,""],["10px 10px 10px 10px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["border-radius:10px;border-width:1px;border-style:dashed;border-color:rgb(128,128,128)",400,48,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["10px 10px 10px 10px",420,420,""]],13],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset;background-color:rgb(128,128,128);border-radius:8px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",69,28,0,[["10px 10px 10px 10px",420,158,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["border-radius:10px;border-width:1px;border-style:dashed;border-color:rgb(128,128,128)",400,48,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 1px 2px 0px;background-image:linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), linear-gradient(rgba(128,128,128,0), rgba(128,128,128,0));background-size:auto, auto;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat;border-radius:6px",208,32,0,[],1],["background-color:rgb(128,128,128);border-width:1px;border-style:solid;border-color:rgb(128,128,128)",32,14,0,[],5],["background-image:linear-gradient(90deg, rgb(128,128,128), rgba(128,128,128,0));opacity:0.9;border-radius:1px",88,48,0,[["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["box-shadow:color(srgb -0.0436279 0.605576 0.443329 / 0.55) 0px 1px 3px 0px;background-color:rgb(128,128,128);border-radius:2px",21,84,0,[["0px 0px 0px 0px",21,84,""],["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""]],3,[1,"*"]],["box-shadow:rgba(128,128,128,0.5) 0px 2px 6px 0px, rgba(128,128,128,0.5) 0px 10px 24px 0px;background-color:rgba(128,128,128,0.5);border-radius:14px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0.5)",400,40,0,[],1],["backdrop-filter:blur(14px);border-radius:14px",400,40,0,[],3],["box-shadow:rgba(128,128,128,0.5) 0px 2px 0px 0px, rgba(128,128,128,0.5) 0px 4px 10px -3px;background-color:rgb(128,128,128);background-image:linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 46%), none;background-size:auto, auto;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat;border-radius:10px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",234,28,0,[],7],["box-shadow:rgb(128,128,128) 0px 0px 0px 2px, rgba(128,128,128,0.5) 0px 3px 8px -1px;background-image:linear-gradient(rgb(128,128,128), rgb(128,128,128));text-shadow:rgba(128,128,128,0.5) 0px 1px 0px;border-radius:7px",18,18,0,[],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 22px 0px;outline-width:2px;outline-style:solid;outline-color:rgb(128,128,128);outline-offset:2px;background-color:rgba(128,128,128,0.5);border-radius:999px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0.5)",32,32,0,[],1],["background-image:radial-gradient(rgba(128,128,128,0.5) 1.3px, rgba(128,128,128,0) 1.8px), radial-gradient(60% 46% at 12% 0%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%), radial-gradient(52% 40% at 96% 100%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%);background-size:18px 18px, auto, auto;background-position:0px 0px, 0% 0%, 0% 0%;background-repeat:repeat, repeat, repeat",240,400,0,[],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0) 0px -1px 1px 0px inset, rgba(128,128,128,0) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 0px 14px 0px;background-image:radial-gradient(70% 100% at 30% 0%, rgba(128,128,128,0), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:calc(100% - 4px) 38%, auto, auto;background-position:2px 1px, 0% 0%, 0% 0%;background-repeat:no-repeat, repeat, repeat;border-radius:10px",86,32,0,[["16px 16px 16px 16px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["background-color:rgba(128,128,128,0.5)",1,14,0,[["16px 16px 16px 16px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["background-image:radial-gradient(120% 70% at 50% -8%, rgba(128,128,128,0.5), rgba(128,128,128,0) 62%), linear-gradient(rgb(128,128,128) 0%, rgb(128,128,128) 100%);background-size:auto, auto;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat",400,331,0,[["0px 0px 0px 0px",420,331,""],["0px 0px 0px 0px",420,361,""],["16px 16px 16px 16px",420,396,""]],1],["background-image:var(--lg-warm-img);background-size:140px 140px;mix-blend-mode:screen;opacity:0.05",400,331,0,[["0px 0px 0px 0px",420,331,""],["0px 0px 0px 0px",420,361,""],["16px 16px 16px 16px",420,396,""]],5],["box-shadow:rgba(128,128,128,0.5) 0px 16px 20px -16px inset, rgba(128,128,128,0.5) 0px -12px 16px -16px inset",400,331,0,[["0px 0px 0px 0px",420,331,""],["0px 0px 0px 0px",420,361,""],["16px 16px 16px 16px",420,396,""]],1],["box-shadow:rgba(128,128,128,0.5) -10px 0px 26px 0px;border-left-width:1px;border-top-style:none;border-right-style:none;border-bottom-style:none;border-left-style:solid;border-top-color:rgb(128,128,128);border-right-color:rgb(128,128,128);border-bottom-color:rgb(128,128,128);border-left-color:rgba(128,128,128,0.5);background-color:rgb(128,128,128);border-radius:20px",400,400,0,[],7],["background-image:radial-gradient(rgba(128,128,128,0.5) 1.3px, rgba(128,128,128,0) 1.8px), radial-gradient(60% 46% at 12% 0%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%), radial-gradient(52% 40% at 96% 100%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%);background-size:18px 18px, auto, auto;background-position:0px 0px, 0% 0%, 0% 0%;background-repeat:repeat, repeat, repeat",400,400,0,[["0px 0px 0px 0px",420,420,""],["20px 20px 20px 20px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 5px 0px;background-color:rgb(128,128,128);border-radius:50%",6,6,0,[["14px 14px 14px 14px",62,24,""],["0px 0px 0px 0px",420,25,""]],9],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0) 0px -1px 1px 0px inset, rgba(128,128,128,0) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 0px 14px 0px, rgba(128,128,128,0.5) 0px 2px 6px -2px;background-image:radial-gradient(70% 100% at 30% 0%, rgba(128,128,128,0), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:calc(100% - 4px) 38%, auto, auto;background-position:2px 1px, 0% 0%, 0% 0%;background-repeat:no-repeat, repeat, repeat;border-radius:10px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0)",183,50,0,[["0px 0px 0px 0px",207,420,""],["10px 10px 10px 10px",420,420,""],["0px 0px 0px 0px",420,420,""]],3],["background-image:var(--lg-warm-img);background-size:140px 140px;mix-blend-mode:multiply;opacity:0.045",400,331,0,[["0px 0px 0px 0px",420,331,""],["0px 0px 0px 0px",420,361,""],["16px 16px 16px 16px",420,396,""]],5],["text-shadow:rgba(128,128,128,0.5) 0px 0px 6px;color:rgb(128,128,128)",155,28,1,[["0px 0px 0px 0px",155,28,""]],2],["box-shadow:rgba(128,128,128,0) 0px 0px 0px 1px inset, rgba(128,128,128,0) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 0px 7px 0px;background-color:rgb(128,128,128)",28,28,0,[["0px 0px 0px 0px",36,420,""]],2],["background-image:repeating-linear-gradient(rgba(128,128,128,0.5) 0px, rgba(128,128,128,0.5) 0.952381px, rgba(128,128,128,0.5) 0.952381px, rgba(128,128,128,0.5) 1.90476px, rgba(128,128,128,0.5) 1.90476px, rgba(128,128,128,0.5) 2.85714px);background-position:0px 0px",400,334,0,[["0px 0px 0px 0px",420,334,""],["0px 0px 0px 0px",420,364,""],["0px 0px 0px 0px",420,399,""]],7],["background-color:rgb(128,128,128);background-image:linear-gradient(to top, rgba(128,128,128,0) calc(25% - 1px), rgb(128,128,128) calc(25% - 1px), rgb(128,128,128) 25%, rgba(128,128,128,0) 25%, rgba(128,128,128,0) calc(50% - 1px), rgb(128,128,128) calc(50% - 1px), rgb(128,128,128) 50%, rgba(128,128,128,0) 50%, rgba(128,128,128,0) calc(75% - 1px), rgb(128,128,128) calc(75% - 1px), rgb(128,128,128) 75%, rgba(128,128,128,0) 75%)",20,82,0,[["0px 0px 0px 0px",420,236,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgb(128,128,128) 2px 2px 0px 0px;opacity:0.55;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0)",28,28,0,[["0px 0px 0px 0px",420,75,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgb(128,128,128) 0px 0px 0px 2px, rgb(128,128,128) 0px 0px 0px 4px, rgba(128,128,128,0.5) 0px 0px 0px 1px inset;background-image:linear-gradient(135deg, rgb(128,128,128) 0px, rgb(128,128,128) 50%, rgb(128,128,128) 50%, rgb(128,128,128) 100%)",24,24,0,[["0px 0px 0px 0px",420,76,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],6],["box-shadow:rgb(128,128,128) 0px 0px 0px 1.5px",13,13,0,[["0px 0px 0px 0px",207,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgb(128,128,128) 2px 2px 0px 0px;border-width:1px;border-style:dashed;border-color:rgb(128,128,128)",400,48,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 16px 34px -18px, rgba(128,128,128,0.5) 0px 1px 4px 0px;background-image:none, none, linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 30px), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), none, var(--lg-warm-img);background-size:100% 100%, 100% 100%, auto, auto, 100% 100%, 1920px 1080px;background-position:0px 0px, 0px 0px, 0% 0%, 0% 0%, 0px 0px, -7px -7px;background-repeat:no-repeat, no-repeat, repeat, repeat, no-repeat, no-repeat;border-radius:14px",400,42,0,[["0px 0px 0px 0px",420,420,""]],7,[4,"box-shadow"]],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 30px 60px -30px, rgba(128,128,128,0.5) 0px 2px 10px 0px;background-image:none, none, linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 30px), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), none, var(--lg-warm-img);background-size:100% 100%, 100% 100%, auto, auto, 100% 100%, 1920px 1080px;background-position:0px 0px, 0px 0px, 0% 0%, 0% 0%, 0px 0px, -7px -55px;background-repeat:no-repeat, no-repeat, repeat, repeat, no-repeat, no-repeat;border-radius:18px",292,400,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 3px 10px -4px, rgba(128,128,128,0.5) 0px 1px 2px 0px;background-image:radial-gradient(70% 100% at 30% 0%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:calc(100% - 4px) 38%, auto, auto;background-position:2px 1px, 0% 0%, 0% 0%;background-repeat:no-repeat, repeat, repeat;border-radius:6px",29,29,0,[["22px 22px 22px 22px",44,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],15,[2,"*"]],["opacity:0.45;border-radius:6px",30,30,0,[["22px 22px 22px 22px",44,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],2],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 1px inset;background-color:rgba(128,128,128,0.5);border-radius:13px",238,40,0,[["16px 16px 16px 16px",238,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],5],["background-image:radial-gradient(closest-side, rgb(128,128,128), rgba(128,128,128,0));opacity:0.082;border-radius:50%",12,12,0,[["16px 16px 16px 16px",238,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],15],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 30px 60px -30px, rgba(128,128,128,0.5) 0px 2px 10px 0px;background-image:var(--lg-warm-img), none, linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 30px), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), var(--lg-warm-img), var(--lg-warm-img);background-size:100% 100%, 100% 100%, auto, auto, 100% 100%, 1920px 1080px;background-position:0px 0px, 0px 0px, 0% 0%, 0% 0%, 0px 0px, -1313px -55px;background-repeat:no-repeat, no-repeat, repeat, repeat, no-repeat, no-repeat;border-radius:18px",400,400,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],2],["background-color:rgba(128,128,128,0.5);border-radius:11px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0.5)",400,96,0,[["0px 0px 0px 0px",420,420,""],["18px 18px 18px 18px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 0px 5px 0px;background-color:rgb(128,128,128);border-radius:50%",6,6,0,[["0px 0px 0px 0px",58,25,""],["10px 10px 10px 10px",420,25,""],["0px 0px 0px 0px",420,420,""]],6],["background-color:rgba(128,128,128,0.5)",41,25,0,[["10px 10px 10px 10px",420,25,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 3px 10px -4px, rgba(128,128,128,0.5) 0px 1px 2px 0px;background-image:var(--lg-warm-img), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:100% 100%, auto;background-position:0px 0px, 0% 0%;background-repeat:no-repeat, repeat;backdrop-filter:url(\"#lgf1\") saturate(1.1);border-radius:6px",60,32,0,[["0px 0px 0px 0px",420,420,""]],1],["background-image:radial-gradient(70% 100% at 30% 0%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%);mix-blend-mode:plus-lighter;opacity:0.6;border-radius:6px",60,32,0,[["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 30px 60px -20px, rgba(128,128,128,0.5) 0px 4px 14px 0px;background-image:var(--lg-warm-img), var(--lg-warm-img), var(--lg-warm-img), var(--lg-warm-img), var(--lg-warm-img), var(--lg-warm-img), var(--lg-warm-img), var(--lg-warm-img), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:20px 20px, 20px 20px, 20px 20px, 20px 20px, calc(100% - 40px) 20px, calc(100% - 40px) 20px, 20px calc(100% - 40px), 20px calc(100% - 40px), auto;background-position:0px 0px, 100% 0px, 0px 100%, 100% 100%, 20px 0px, 20px 100%, 0px 20px, 100% 20px, 0% 0%;background-repeat:no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, repeat;backdrop-filter:blur(30px) saturate(1.5);border-radius:16px",400,400,0,[],1],["background-image:radial-gradient(closest-side, rgba(128,128,128,0.5), rgba(128,128,128,0));border-radius:50%",192,192,0,[["10px 10px 10px 10px",420,25,""]],15],["background-image:radial-gradient(60% 60%, rgba(128,128,128,0.5), rgba(128,128,128,0.5) 55%, rgba(128,128,128,0) 100%);opacity:0.760588;border-radius:7px",32,14,0,[["0px 0px 0px 0px",20,86,""],["0px 0px 0px 0px",420,240,""],["0px 0px 0px 0px",420,420,""]],7],["background-color:rgba(128,128,128,0.5);border-radius:50%",128,28,0,[["18px 18px 18px 18px",148,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgb(128,128,128) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 3px 8px 0px;background-image:linear-gradient(90deg, rgba(128,128,128,0) 5.5px, rgba(128,128,128,0.5) 5.5px, rgba(128,128,128,0.5) 6.5px, rgba(128,128,128,0) 6.5px, rgba(128,128,128,0) 9.5px, rgba(128,128,128,0.5) 9.5px, rgba(128,128,128,0.5) 10.5px, rgba(128,128,128,0) 10.5px), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:16px 7px, 100% 100%;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat;border-radius:3px",40,22,0,[["0px 0px 0px 0px",420,76,""],["0px 0px 0px 0px",420,420,""],["16px 16px 16px 16px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 2px, rgb(128,128,128) 0px 0px 0px 4px, rgba(128,128,128,0.5) 0px 0px 0px 1px inset;background-image:linear-gradient(135deg, rgb(128,128,128) 0px, rgb(128,128,128) 50%, rgba(128,128,128,0.5) 50%, rgba(128,128,128,0.5) 100%);border-radius:50%",24,24,0,[["0px 0px 0px 0px",420,76,""],["0px 0px 0px 0px",420,420,""],["16px 16px 16px 16px",420,420,""]],7],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 6px 16px -10px;background-color:rgba(128,128,128,0.5);border-radius:8px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0)",93,32,0,[["0px 0px 0px 0px",420,420,""],["10px 10px 10px 10px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["background-color:rgba(128,128,128,0.5);border-radius:10px;border-width:1px;border-style:dashed;border-color:rgba(128,128,128,0.5)",396,48,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["10px 10px 10px 10px",420,420,""]],1],["background-color:rgb(128,128,128);border-radius:50%;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0.5)",14,14,0,[["0px 0px 0px 0px",420,420,""]],8],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 16px 34px -18px, rgba(128,128,128,0.5) 0px 1px 4px 0px;background-image:var(--lg-warm-img), radial-gradient(110.4px at 1910px 21px, rgba(128,128,128,0.5), rgba(128,128,128,0.5) 38%, rgba(128,128,128,0.5) 72%, rgba(128,128,128,0) 100%), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 30px), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), var(--lg-warm-img), var(--lg-warm-img);background-size:100% 100%, 100% 100%, auto, auto, 100% 100%, 1920px 1080px;background-position:0px 0px, 0px 0px, 0% 0%, 0% 0%, 0px 0px, 0px -1054px;background-repeat:no-repeat, no-repeat, repeat, repeat, no-repeat, no-repeat;border-radius:10px",400,25,0,[["0px 0px 0px 0px",420,420,""]],7],["background-image:radial-gradient(70% 100% at 30% 0%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%);opacity:0.6;border-radius:6px",60,32,0,[["0px 0px 0px 0px",420,420,""]],2],["background-image:repeating-linear-gradient(135deg, rgb(128,128,128) 0px, rgb(128,128,128) 1.5px, rgba(128,128,128,0) 1.5px, rgba(128,128,128,0) 4.5px);opacity:0.7",361,10,0,[["0px 0px 0px 0px",420,10,""],["0px 0px 0px 0px",420,292,""],["0px 0px 0px 0px",420,420,""]],7],["background-image:linear-gradient(rgba(128,128,128,0), rgba(128,128,128,0.5) 90%, rgba(128,128,128,0.5) 98.2%, rgba(128,128,128,0))",400,56,0,[],2],["background-image:linear-gradient(rgb(128,128,128), rgb(128,128,128)), linear-gradient(rgb(128,128,128), rgb(128,128,128)), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), var(--lg-warm-img);background-size:5px 5px, 5px 5px, calc(100% - 16px) 1px, 126px 5px;background-position:2px 100%, calc(100% - 2px) 100%, 50% calc(100% - 2px), calc(100% - 12px) calc(100% - 5px);background-repeat:no-repeat, no-repeat, no-repeat, no-repeat",171,38,0,[["0px 0px 0px 0px",188,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 10px 24px -18px;background-color:rgb(128,128,128);border-width:1px;border-style:solid;border-color:rgb(128,128,128)",400,44,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],3],["backdrop-filter:blur(2.4px)",389,30,0,[["0px 0px 0px 0px",399,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],2],["box-shadow:rgb(128,128,128) -3px 0px 0px 0px inset, rgba(128,128,128,0.5) 6px 0px 10px -4px;background-image:linear-gradient(90deg, rgba(128,128,128,0.5), oklch(0.805562 0.157615 167.474));border-radius:3px",54,6,0,[["0px 0px 0px 0px",330,298,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset;background-image:linear-gradient(90deg, rgba(128,128,128,0.5) 0px, rgba(128,128,128,0.5) 55%, oklch(0.705724 0.154701 242.707) 100%);border-radius:3px",40,6,0,[["3px 3px 3px 3px",40,6,"inset(-12px -14px -12px 0px round 3px)"],["0px 0px 0px 0px",399,208,""],["0px 0px 0px 0px",420,420,""]],3,[1,"box-shadow"]],["box-shadow:rgba(128,128,128,0.5) 0px 0px 10px 3px;border-top-right-radius:3px;border-bottom-right-radius:3px;background-color:rgb(128,128,128)",40,6,0,[["3px 3px 3px 3px",40,6,"inset(-12px -14px -12px 0px round 3px)"],["0px 0px 0px 0px",399,208,""],["0px 0px 0px 0px",420,420,""]],5,[5,"*"]],["box-shadow:rgba(128,128,128,0.5) 0px 1px 2px 0px;background-color:rgb(128,128,128);border-radius:50%",30,18,0,[["0px 0px 0px 0px",399,208,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgb(128,128,128) 0px 0px 0px 1.5px;opacity:0.121752;border-radius:50%",22,22,0,[["0px 0px 0px 0px",188,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["background-color:rgb(128,128,128);background-image:repeating-linear-gradient(135deg, rgb(128,128,128) 0px, rgb(128,128,128) 2px, rgba(128,128,128,0) 2px, rgba(128,128,128,0) 5px);opacity:0.82",41,39,0,[["3px 3px 1px 1px",41,39,""],["0px 0px 0px 0px",420,148,""],["0px 0px 0px 0px",420,420,""]],1],["background-color:rgb(128,128,128);background-image:linear-gradient(rgba(128,128,128,0), rgba(128,128,128,0.5))",41,40,0,[["3px 3px 1px 1px",41,40,""],["0px 0px 0px 0px",420,148,""],["0px 0px 0px 0px",420,420,""]],3],["box-shadow:rgba(128,128,128,0.5) 0px -2px 8px 0px;border-top-left-radius:3px;border-top-right-radius:3px;background-color:rgb(128,128,128)",41,3,0,[["0px 0px 0px 0px",420,148,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],3],["border-bottom-left-radius:3px;border-bottom-width:1px;border-left-width:1px;border-top-style:none;border-right-style:none;border-bottom-style:solid;border-left-style:solid;border-color:rgb(128,128,128)",8,9,0,[["0px 0px 0px 0px",138,18,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],3],["background-color:rgb(128,128,128);border-radius:50%;border-width:1px;border-style:dashed;border-color:rgb(128,128,128)",11,11,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset;background-image:linear-gradient(90deg, rgba(128,128,128,0.5) 0px, rgba(128,128,128,0.5) 55%, rgb(128,128,128) 100%);border-radius:4px",277,8,0,[["4px 4px 4px 4px",277,8,"inset(-12px -14px -12px 0px round 4px)"],["0px 0px 0px 0px",420,388,""],["0px 0px 0px 0px",420,420,""]],14],["box-shadow:rgba(128,128,128,0.5) 0px 1px 2px 0px inset;border-radius:4px;border-width:1px;border-style:dashed;border-color:rgb(128,128,128)",277,8,0,[["0px 0px 0px 0px",420,388,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset;background-image:linear-gradient(90deg, rgba(128,128,128,0.5) 0px, rgba(128,128,128,0.5) 55%, oklch(0.705724 0.154701 242.707) 100%);opacity:0.45;border-radius:4px",278,8,0,[["4px 4px 4px 4px",278,8,"inset(-12px -14px -12px 0px round 4px)"],["0px 0px 0px 0px",420,388,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgb(128,128,128) -3px 0px 0px 0px inset, rgba(128,128,128,0.5) 6px 0px 10px -4px;background-image:linear-gradient(90deg, rgba(128,128,128,0.5), oklch(0.659566 0.182283 266.05));border-radius:4px",302,8,0,[["4px 4px 4px 4px",302,8,"inset(-12px -14px -12px 0px round 4px)"],["0px 0px 0px 0px",420,328,""],["0px 0px 0px 0px",420,420,""]],1],["background-color:rgb(128,128,128)",302,8,0,[["4px 4px 4px 4px",302,8,"inset(-12px -14px -12px 0px round 4px)"],["0px 0px 0px 0px",420,328,""],["0px 0px 0px 0px",420,420,""]],8],["box-shadow:rgb(128,128,128) -3px 0px 0px 0px inset, rgba(128,128,128,0.5) 6px 0px 10px -4px;background-image:linear-gradient(90deg, rgba(128,128,128,0.5), rgb(128,128,128));border-radius:4px",302,8,0,[["4px 4px 4px 4px",302,8,"inset(-12px -14px -12px 0px round 4px)"],["0px 0px 0px 0px",420,328,""],["0px 0px 0px 0px",420,420,""]],15],["opacity:0.56;color:rgb(128,128,128);border-radius:8px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0.5)",45,28,1,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgb(128,128,128) 0px 0px 0px 1.5px, rgba(128,128,128,0.5) 0px 0px 14px -2px;background-image:radial-gradient(circle at 35% 30%, rgb(128,128,128), rgb(128,128,128) 70%);border-radius:50%",14,14,0,[["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["border-radius:50%;border-width:1px;border-style:dashed;border-color:rgb(128,128,128)",14,14,0,[["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 1.5px, rgba(128,128,128,0.5) 0px 0px 22px 0px;border-radius:12px",290,140,0,[["10px 10px 10px 10px",330,160,""],["0px 0px 0px 0px",346,267,""],["13px 13px 13px 13px",360,352,""]],6],["background-image:radial-gradient(70% 120% at 32% 0%, rgb(128,128,128) 0px, rgba(128,128,128,0.5) 46%, rgba(128,128,128,0) 78%);opacity:0.9;border-radius:12px",290,140,0,[["10px 10px 10px 10px",330,160,""],["0px 0px 0px 0px",346,267,""],["13px 13px 13px 13px",360,352,""]],1],["background-image:linear-gradient(rgb(128,128,128) 18%, rgb(128,128,128) 96%);background-size:100% 48px;background-position:0px 0px;background-repeat:repeat-y",42,23,0,[["0px 0px 0px 0px",289,114,""],["10px 10px 10px 10px",330,160,""],["0px 0px 0px 0px",346,267,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 8px 0px;background-image:linear-gradient(90deg, rgb(128,128,128), rgba(128,128,128,0));opacity:0.9;border-radius:1px",42,23,0,[["0px 0px 0px 0px",289,114,""],["10px 10px 10px 10px",330,160,""],["0px 0px 0px 0px",346,267,""]],3],["background-color:rgba(128,128,128,0.5);border-radius:12px;border-width:1px;border-style:dashed;border-color:rgba(128,128,128,0.5)",400,292,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 1px 2px 0px inset, color(srgb -0.218442 0.82202 0.824965 / 0.55) 0px 0px 0px 1px;border-top-left-radius:7px;border-top-right-radius:7px;border-bottom-right-radius:2px;border-bottom-left-radius:2px;background-color:rgb(128,128,128);background-image:linear-gradient(to top, rgba(128,128,128,0) calc(25% - 1px), rgb(128,128,128) calc(25% - 1px), rgb(128,128,128) 25%, rgba(128,128,128,0) 25%, rgba(128,128,128,0) calc(50% - 1px), rgb(128,128,128) calc(50% - 1px), rgb(128,128,128) 50%, rgba(128,128,128,0) 50%, rgba(128,128,128,0) calc(75% - 1px), rgb(128,128,128) calc(75% - 1px), rgb(128,128,128) 75%, rgba(128,128,128,0) 75%)",21,84,0,[["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],5],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 1px 2px 0px, rgba(128,128,128,0.5) 0px 18px 36px -20px;background-color:rgb(128,128,128);background-image:radial-gradient(70% 90% at 18% -10%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0), rgba(128,128,128,0) 46%);background-size:auto, auto;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat;opacity:0.999429;border-radius:12px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",400,292,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],3],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 14px 32px -12px, rgba(128,128,128,0.5) 0px 0px 0px 1px;opacity:0;border-radius:12px",400,292,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgba(128,128,128,0.5) 0px 18px 50px 0px, rgba(128,128,128,0.5) 0px 4px 14px 0px;background-color:rgb(128,128,128);border-radius:12px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0.5)",400,400,0,[],1],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 1px 2px 0px, rgba(128,128,128,0.5) 0px 18px 36px -20px;background-color:rgb(128,128,128);background-image:radial-gradient(70% 90% at 18% -10%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0), rgba(128,128,128,0) 46%);background-size:auto, auto;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat;border-radius:12px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",400,292,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],9],["background-image:radial-gradient(50% 50% at 70% 50%, rgb(128,128,128), rgba(128,128,128,0.5) 45%, rgba(128,128,128,0) 100%);opacity:0.0833008;border-radius:6px",34,12,0,[["0px 0px 0px 0px",420,238,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgb(128,128,128) -3px 0px 0px 0px inset, rgba(128,128,128,0.5) 3px 0px 5px -3px;background-image:linear-gradient(90deg, rgba(128,128,128,0.5), oklch(0.643752 0.141037 269.34));border-radius:4px",302,8,0,[["4px 4px 4px 4px",302,8,"inset(-12px -14px -12px 0px round 4px)"],["0px 0px 0px 0px",420,328,""],["0px 0px 0px 0px",420,420,""]],4],["background-image:linear-gradient(90deg, rgba(128,128,128,0), rgba(128,128,128,0.5) 35%, rgba(128,128,128,0.5) 50%, rgba(128,128,128,0.5) 65%, rgba(128,128,128,0));opacity:0.316474",104,179,0,[["0px 0px 0px 0px",128,128,""],["0px 0px 0px 0px",399,320,""],["0px 0px 0px 0px",420,420,""]],5],["box-shadow:rgba(128,128,128,0.5) 0px 18px 50px 0px, rgba(128,128,128,0.5) 0px 4px 14px 0px;background-color:rgb(128,128,128);opacity:0.650634;border-radius:13px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",323,156,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 1px 2px 0px, rgba(128,128,128,0.5) 0px 18px 36px -20px;background-color:rgb(128,128,128);background-image:linear-gradient(rgba(128,128,128,0), rgba(128,128,128,0) 46%);border-radius:12px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",290,140,0,[["10px 10px 10px 10px",330,160,""],["0px 0px 0px 0px",346,267,""],["13px 13px 13px 13px",360,352,""]],4],["background-image:linear-gradient(oklab(0.237762 -0.00300783 -0.0127588) 18%, rgb(128,128,128) 96%);background-size:100% 48px;background-position:0px 0px;background-repeat:repeat-y",42,23,0,[["0px 0px 0px 0px",289,114,""],["10px 10px 10px 10px",330,160,""],["0px 0px 0px 0px",346,267,""]],1],["background-image:linear-gradient(90deg, rgb(128,128,128), rgba(128,128,128,0));opacity:0.9;border-radius:1px",42,23,0,[["0px 0px 0px 0px",289,114,""],["10px 10px 10px 10px",330,160,""],["0px 0px 0px 0px",346,267,""]],1],["background-image:radial-gradient(70% 130% at 0% 50%, rgba(128,128,128,0.5), rgba(128,128,128,0) 68%);opacity:0.994069",400,72,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["background-color:rgba(128,128,128,0.5);border-radius:10px",201,25,0,[["0px 0px 0px 0px",204,25,""],["0px 0px 0px 0px",215,75,""],["0px 0px 0px 0px",226,125,""]],8],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 1px 2px 0px, rgba(128,128,128,0.5) 0px 26px 50px -26px;background-color:rgb(128,128,128);background-image:radial-gradient(70% 90% at 18% -10%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 46%);background-size:auto, auto;background-position:0% 0%, 0% 0%;background-repeat:repeat, repeat;border-radius:16px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",400,292,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],4],["background-color:rgb(128,128,128);background-image:repeating-linear-gradient(135deg, rgb(128,128,128) 0px, rgb(128,128,128) 2px, rgba(128,128,128,0) 2px, rgba(128,128,128,0) 5px);opacity:0.82",44,39,0,[["6px 6px 3px 3px",44,39,""],["0px 0px 0px 0px",420,148,""],["0px 0px 0px 0px",420,420,""]],4],["background-color:rgb(128,128,128);background-image:linear-gradient(rgba(128,128,128,0), rgba(128,128,128,0.5))",44,40,0,[["6px 6px 3px 3px",44,40,""],["0px 0px 0px 0px",420,148,""],["0px 0px 0px 0px",420,420,""]],4,[4,"background-image"]],["border-top-width:1px;border-top-style:solid;border-right-style:none;border-bottom-style:none;border-left-style:none;border-radius:14px;border-color:rgb(128,128,128)",400,36,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["border-top-left-radius:3px;border-top-width:1px;border-left-width:1px;border-top-style:solid;border-right-style:none;border-bottom-style:none;border-left-style:solid;background-color:rgb(128,128,128);border-color:rgb(128,128,128)",344,62,0,[],3],["border-top-left-radius:10px;border-top-right-radius:10px;border-bottom-right-radius:3px;border-bottom-left-radius:3px;background-image:linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5))",34,34,0,[],3],["background-color:rgb(128,128,128);border-radius:10px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",283,33,0,[["16px 16px 16px 16px",348,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],10],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 2px, rgba(128,128,128,0.5) 0px 0px 18px 0px;border-radius:14px",239,31,0,[["16px 16px 16px 16px",348,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 1.5px, rgba(128,128,128,0.5) 0px 0px 22px 0px;border-radius:16px",285,140,0,[["12px 12px 12px 12px",330,160,""],["0px 0px 0px 0px",346,267,""],["16px 16px 16px 16px",360,352,""]],5],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 1px 2px 0px, rgba(128,128,128,0.5) 0px 26px 50px -26px;background-color:rgb(128,128,128);background-image:linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 46%);border-radius:16px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",285,140,0,[["12px 12px 12px 12px",330,160,""],["0px 0px 0px 0px",346,267,""],["16px 16px 16px 16px",360,352,""]],5],["background-color:rgba(128,128,128,0.5);border-radius:7px",24,24,0,[["16px 16px 16px 16px",380,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) -10px 0px 26px 0px;border-left-width:1px;border-top-style:none;border-right-style:none;border-bottom-style:none;border-left-style:solid;background-color:rgb(128,128,128);border-radius:20px;border-color:rgb(128,128,128)",400,400,0,[],2],["box-shadow:rgb(128,128,128) -3px 0px 0px 0px inset, rgba(128,128,128,0.5) 3px 0px 5px -3px;background-image:linear-gradient(90deg, rgba(128,128,128,0.5), oklch(0.680615 0.137874 280.63));border-radius:4px",285,8,0,[["4px 4px 4px 4px",286,8,"inset(-12px -14px -12px 0px round 4px)"],["0px 0px 0px 0px",420,328,""],["0px 0px 0px 0px",420,420,""]],9],["box-shadow:rgb(128,128,128) 0px 0px 8px 2px, rgba(128,128,128,0.5) 0px 0px 18px 4px;background-color:rgb(128,128,128);opacity:0.0841207;border-radius:3px",125,3,0,[],2],["background-color:rgba(128,128,128,0.5)",47,25,0,[["10px 10px 10px 10px",420,25,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 1px 2px 0px inset;background-color:rgba(128,128,128,0.5);border-radius:3px",226,10,0,[["0px 0px 0px 0px",254,150,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgb(128,128,128) 0px 0px 0px 1.5px;opacity:0.5;border-radius:50%",7,7,0,[["18px 18px 18px 18px",188,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgb(128,128,128) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 2px 5px 0px, rgba(128,128,128,0.5) 0px 0px 0px 0.5px;background-image:radial-gradient(120% 90% at 35% 22%, rgb(128,128,128), rgb(128,128,128) 55%, rgb(128,128,128));border-radius:50%",38,22,0,[["0px 0px 0px 0px",385,210,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7,[1,"*"]],["border-top-left-radius:3px;border-top-right-radius:3px;border-bottom-right-radius:1px;border-bottom-left-radius:1px",43,39,0,[["0px 0px 0px 0px",420,150,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["background-color:rgb(128,128,128);background-image:linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0) 60%)",43,40,0,[["3px 3px 1px 1px",43,40,""],["0px 0px 0px 0px",420,150,""],["0px 0px 0px 0px",420,420,""]],3],["border-bottom-left-radius:3px;border-bottom-width:1px;border-left-width:1px;border-top-style:none;border-right-style:none;border-bottom-style:solid;border-left-style:solid;border-top-color:rgb(128,128,128);border-right-color:rgb(128,128,128);border-bottom-color:rgba(128,128,128,0.5);border-left-color:rgba(128,128,128,0.5)",8,9,0,[["0px 0px 0px 0px",138,18,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],3],["box-shadow:rgba(128,128,128,0.5) 0px 1px 2px 0px inset;border-radius:1px;border-width:1px;border-style:dashed;border-color:rgba(128,128,128,0.5)",263,8,0,[["0px 0px 0px 0px",420,390,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset;background-color:rgba(128,128,128,0.5);border-radius:9px",30,30,0,[["16px 16px 16px 16px",340,58,""],["0px 0px 0px 0px",420,420,""]],11],["background-image:linear-gradient(90deg, rgba(128,128,128,0.5), rgb(128,128,128));opacity:0.45",325,2,0,[["16px 16px 16px 16px",340,58,""],["0px 0px 0px 0px",420,420,""]],7],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px 4px 12px -4px;background-color:rgba(128,128,128,0.5);color:rgb(128,128,128);border-radius:6px",88,26,1,[["16px 16px 16px 16px",344,149,""],["0px 0px 0px 0px",420,420,""]],4],["box-shadow:rgb(128,128,128) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 2px 5px 0px, rgba(128,128,128,0.5) 0px 0px 0px 0.5px;background-image:radial-gradient(120% 90% at 35% 22%, rgb(128,128,128), rgb(128,128,128) 55%, rgb(128,128,128));border-radius:50%",18,18,0,[["0px 0px 0px 0px",420,360,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 30px 60px -20px, rgba(128,128,128,0.5) 0px 4px 14px 0px;background-image:var(--lg-warm-img), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:100% 100%, auto;background-position:0px 0px, 0% 0%;background-repeat:no-repeat, repeat;backdrop-filter:blur(30px) saturate(1.5);opacity:0.2;border-radius:16px",160,30,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 1.5px inset, rgba(128,128,128,0.5) 0px 0px 0px 3px;background-color:rgba(128,128,128,0.5);border-radius:6px",278,32,0,[["16px 16px 16px 16px",340,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],8],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 30px 60px -20px, rgba(128,128,128,0.5) 0px 4px 14px 0px;background-image:var(--lg-warm-img), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:100% 100%, auto;background-position:0px 0px, 0% 0%;background-repeat:no-repeat, repeat;backdrop-filter:blur(30px) saturate(1.5);opacity:0.2;border-radius:16px",24,24,0,[["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],3],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 3px 8px -3px;background-image:var(--lg-warm-img), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:100% 100%, auto;background-position:0px 0px, 0% 0%;background-repeat:no-repeat, repeat;backdrop-filter:url(\"#lgf10\") saturate(1.1);border-radius:6px",28,28,0,[["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset, rgba(128,128,128,0.5) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 5px 14px -6px, rgba(128,128,128,0.5) 0px 1px 2px 0px;background-image:radial-gradient(70% 100% at 30% 0%, rgba(128,128,128,0.5), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5));background-size:calc(100% - 4px) 38%, auto, auto;background-position:2px 1px, 0% 0%, 0% 0%;background-repeat:no-repeat, repeat, repeat;border-radius:6px",29,29,0,[["22px 22px 22px 22px",44,420,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],2],["box-shadow:rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0.5) 0px -1px 1px 0px inset;background-color:rgba(128,128,128,0.5);border-radius:9px",30,30,0,[["16px 16px 16px 16px",342,148,""],["0px 0px 0px 0px",420,420,""]],1,[1,"box-shadow"]],["background-image:linear-gradient(90deg, rgba(128,128,128,0.5), rgb(128,128,128));opacity:0.9",331,2,0,[["16px 16px 16px 16px",342,148,""],["0px 0px 0px 0px",420,420,""]],5],["box-shadow:rgba(128,128,128,0.5) 0px 1px 2px 0px inset, color(srgb -0.238296 0.555163 0.61694 / 0.55) 0px 0px 0px 1px;background-color:rgba(128,128,128,0.5);background-image:linear-gradient(to top, rgba(128,128,128,0) calc(25% - 1px), rgba(128,128,128,0.5) calc(25% - 1px), rgba(128,128,128,0.5) 25%, rgba(128,128,128,0) 25%, rgba(128,128,128,0) calc(50% - 1px), rgba(128,128,128,0.5) calc(50% - 1px), rgba(128,128,128,0.5) 50%, rgba(128,128,128,0) 50%, rgba(128,128,128,0) calc(75% - 1px), rgba(128,128,128,0.5) calc(75% - 1px), rgba(128,128,128,0.5) 75%, rgba(128,128,128,0) 75%);border-radius:1px",20,86,0,[["0px 0px 0px 0px",420,240,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],7],["border-top-width:2px;border-top-style:dashed;border-right-style:none;border-bottom-style:none;border-left-style:none;border-top-color:rgba(128,128,128,0.5);border-right-color:rgb(128,128,128);border-bottom-color:rgb(128,128,128);border-left-color:rgb(128,128,128);filter:drop-shadow(rgba(128,128,128,0.5) 0px 0px 3px)",32,2,0,[["0px 0px 0px 0px",420,236,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["background-color:rgba(128,128,128,0.5);border-radius:2px",20,82,0,[["0px 0px 0px 0px",20,82,""],["0px 0px 0px 0px",420,236,""],["0px 0px 0px 0px",420,420,""]],4],["border-top-width:2px;border-top-style:dashed;border-right-style:none;border-bottom-style:none;border-left-style:none;border-top-color:rgba(128,128,128,0.5);border-right-color:rgb(128,128,128);border-bottom-color:rgb(128,128,128);border-left-color:rgb(128,128,128);filter:drop-shadow(rgba(128,128,128,0.5) 0px 0px 4px)",400,2,0,[["0px 0px 0px 0px",420,236,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgb(128,128,128) -2px 0px 0px 0px inset;background-image:repeating-linear-gradient(90deg, oklch(0.815272 0.132807 122.208) 0px, oklch(0.815272 0.132807 122.208) 5px, rgba(128,128,128,0) 5px, rgba(128,128,128,0) 6px)",45,6,0,[["0px 0px 0px 0px",45,6,""],["0px 0px 0px 0px",325,296,""],["0px 0px 0px 0px",420,420,""]],7],["box-shadow:rgb(128,128,128) 0px 0px 0px 1.5px;background-color:rgb(128,128,128)",2,16,0,[["0px 0px 0px 0px",392,206,""],["0px 0px 0px 0px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["background-image:repeating-linear-gradient(90deg, oklch(0.770591 0.0715429 198.957) 0px, oklch(0.770591 0.0715429 198.957) 5px, rgba(128,128,128,0) 5px, rgba(128,128,128,0) 6px);opacity:0.45",272,8,0,[["0px 0px 0px 0px",272,8,""],["0px 0px 0px 0px",420,386,""],["0px 0px 0px 0px",420,420,""]],3],["background-image:linear-gradient(90deg, rgba(128,128,128,0.5), oklch(0.764405 0.0546015 237.67))",291,8,0,[["0px 0px 0px 0px",291,8,""],["0px 0px 0px 0px",420,326,""],["0px 0px 0px 0px",420,420,""]],7],["background-color:color(srgb -0.228442 0.394162 0.49292 / 0.7);border-radius:2px",20,82,0,[["0px 0px 0px 0px",20,82,""],["0px 0px 0px 0px",420,236,""],["0px 0px 0px 0px",420,420,""]],7],["background-image:radial-gradient(60% 60%, rgba(128,128,128,0.5), color(srgb -0.20943 0.403845 0.45088 / 0.45) 55%, rgba(128,128,128,0) 100%);opacity:0.00408309",32,14,0,[["0px 0px 0px 0px",20,82,""],["0px 0px 0px 0px",420,236,""],["0px 0px 0px 0px",420,420,""]],7],["box-shadow:color(srgb -0.223937 0.397867 0.478733 / 0.7) 0px 0px 8px 1px;background-color:rgb(128,128,128)",40,6,0,[["0px 0px 0px 0px",40,6,""],["0px 0px 0px 0px",392,206,""],["0px 0px 0px 0px",420,420,""]],3],["box-shadow:rgba(128,128,128,0.5) 3px 3px 0px 0px;background-color:rgb(128,128,128);filter:brightness(1.3);border-width:2px;border-style:solid;border-color:rgb(128,128,128)",344,62,0,[],5],["box-shadow:rgba(128,128,128,0.5) 0px 0px 0px 0.5px inset, rgba(128,128,128,0.5) 0px 1px 0px 0px inset, rgba(128,128,128,0) 0px -1px 1px 0px inset, rgba(128,128,128,0) 0px 0px 0px 0.5px, rgba(128,128,128,0.5) 0px 1px 2px 0px;background-image:radial-gradient(70% 100% at 30% 0%, rgba(128,128,128,0), rgba(128,128,128,0) 70%), linear-gradient(rgba(128,128,128,0.5), rgba(128,128,128,0.5)), linear-gradient(rgba(128,128,128,0), rgba(128,128,128,0));background-size:calc(100% - 4px) 38%, auto, auto;background-position:2px 1px, 0% 0%, 0% 0%;background-repeat:no-repeat, repeat, repeat;border-radius:6px;border-width:1px;border-style:solid;border-color:rgba(128,128,128,0)",193,66,0,[["0px 0px 0px 0px",207,420,""],["10px 10px 10px 10px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgba(128,128,128,0.5) 0px 6px 16px 0px, rgba(128,128,128,0.5) 0px 1px 0px 0px inset;background-image:linear-gradient(135deg, rgb(128,128,128), rgb(128,128,128));border-radius:8px;border-width:1px;border-style:solid;border-color:rgb(128,128,128)",120,32,0,[["0px 0px 0px 0px",420,420,""],["10px 10px 10px 10px",420,420,""],["0px 0px 0px 0px",420,420,""]],1],["box-shadow:rgb(128,128,128) 0px 0px 10px 0px;background-color:rgb(128,128,128);border-radius:50%",10,10,0,[["0px 0px 0px 0px",184,420,""],["18px 18px 18px 18px",184,420,""],["0px 0px 0px 0px",420,420,""]],4]];
  /* WARM-CATALOG:END */
  var warmStarted = false;
  /* the page's idle-warm queue, when the page has one (shell's 11-motion-start.js) */
  function warmQueue() { var W = window.PM_WARM; return W && typeof W.add === 'function' && typeof W.state === 'function' ? W : null; }
  function warmUp() {
    var W = warmQueue();
    if (warmStarted || !document.body || !window.requestAnimationFrame || !gpu() || (W && W.state().off)) return;
    warmStarted = true;
    var host = el('lg-warm', { 'aria-hidden': 'true' }), lastInput = 0, queue = [];
    host.style.cssText = 'position:fixed;right:0;bottom:0;width:48px;height:48px;overflow:hidden;opacity:0.004;pointer-events:none;' +
      'z-index:2147483646;contain:strict;will-change:opacity;';
    var shadow = host.attachShadow ? host.attachShadow({ mode: 'closed' }) : host;
    var box = document.createElement('div'); box.style.cssText = 'position:absolute;left:0;top:0;width:48px;height:48px;overflow:hidden;';
    shadow.appendChild(box);
    try {
      var c = document.createElement('canvas'); c.width = c.height = 2; var x = c.getContext('2d');
      x.fillStyle = '#4a6fa5'; x.fillRect(0, 0, 2, 2); x.fillStyle = '#a5784a'; x.fillRect(1, 0, 1, 1);
      box.style.setProperty('--lg-warm-img', 'url(' + c.toDataURL('image/png') + ')');
    } catch (e) {}
    var INPUT = ['pointerdown', 'pointermove', 'keydown', 'wheel'], onInput = function () { lastInput = performance.now(); };
    if (!W) INPUT.forEach(function (t) { addEventListener(t, onInput, { capture: true, passive: true }); });
    /* a kind drawn through one of Glass's SVG filters (url(#lgfN)) finds the filter only in its own tree, so the closed
       root gets a copy of each one the catalog names (landing review GC-2). Any of Glass's lens filters serves where that
       id is not built yet: the GPU programs follow the filter's steps, not its maps or size. */
    var defs = null, copied = {};
    function filtersFor(css) {
      (css.match(/url\("?#lgf\d+"?\)/g) || []).forEach(function (u) {
        var id = u.replace(/^url\("?#|"?\)$/g, '');
        if (copied[id]) return;
        var src = document.getElementById(id);
        if (!src || src.localName !== 'filter') src = document.querySelector('filter[id^="lgf"]');
        if (!src) return;
        if (!defs) {
          var svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
          svg.style.cssText = 'position:absolute;width:0;height:0;'; defs = document.createElementNS(SVGNS, 'defs');
          svg.appendChild(defs); shadow.appendChild(svg);
        }
        var k = src.cloneNode(true); k.setAttribute('id', id); defs.appendChild(k); copied[id] = 1;
      });
    }
    function build(e, faded) {
      filtersFor(e[0]);
      var d = document.createElement('div');
      d.style.cssText = 'position:absolute;left:4px;top:4px;box-sizing:border-box;width:' + e[1] + 'px;height:' + e[2] + 'px;' + e[0];
      if (e[3]) d.textContent = 'Aa';
      var top = d;
      (e[4] || []).forEach(function (k) {
        var w = document.createElement('div');
        w.style.cssText = 'position:absolute;left:2px;top:2px;overflow:hidden;box-sizing:border-box;border-radius:' + k[0] + ';width:' + k[1] + 'px;height:' + k[2] + 'px;' + (k[3] ? 'clip-path:' + k[3] + ';' : '');
        w.appendChild(top); top = w;
      });
      if (faded) {
        var f = document.createElement('div');
        f.style.cssText = 'position:absolute;left:0;top:0;width:48px;height:48px;opacity:0.9;transform:scale(0.97);transform-origin:0 0;';
        f.appendChild(top); top = f;
      }
      return top;
    }
    /* each queued draw is named for the warm log (tag); one that reads the page's layout or styles is marked reads: with
       the page's queue it runs in idle time, not in a frame (warmSteps). A catalog entry's sixth field, when present, says
       which of the four passes draw it (1 plain, 2 faded, 4 crowded, 8 crowded and faded). Its seventh, when present,
       splits it in the passes it names, so a kind whose draw links several programs links about one a step: [bits,
       property...] draws it first without those properties, then whole (on the P1000 two FillRRectOp links in one draw
       held the GPU 104-126 ms; one is 45-65 ms); [bits, '*'] draws it in stages, each adding the next declaration or
       the next box-shadow layer, then whole (the first kind with a given set of shadows linked five FillRectOp variants
       at once, 110 ms) */
    function named(make, tag, reads) { make.tag = tag; if (reads) make.reads = true; return make; }
    /* a catalog cut to the draws that link a program (warmSteps): every draw links one or more */
    var cut = WARM_CATALOG.some(function (e) { return e[5] != null; });
    function without(e, props) {
      return [e[0].split(';').filter(function (d) { return props.indexOf(d.split(':')[0]) < 0; }).join(';')].concat(e.slice(1, 5));
    }
    /* the kind's declarations one more at a time, its box-shadow last and one layer at a time (so every stage has the
       kind's own corners and fill under its shadows); the whole kind is the last step, not one of these */
    function stages(e) {
      var ds = e[0].split(';').filter(Boolean), shadow = ds.filter(function (d) { return d.indexOf('box-shadow:') === 0; })[0], out = [], cur = [];
      ds.forEach(function (d) { if (d !== shadow) { cur.push(d); out.push(cur.slice()); } });
      if (shadow) {
        var layers = shadow.slice(11).split(/,(?![^(]*\))/);
        layers.forEach(function (l, n) { out.push(cur.concat(['box-shadow:' + layers.slice(0, n + 1).join(',')])); });
      }
      out.pop();
      return out.map(function (d) { return [d.join(';')].concat(e.slice(1, 5)); });
    }
    function parts(e) { return e[6][1] === '*' ? stages(e) : [without(e, e[6].slice(1))]; }
    function pass(bit, tag, make) {
      WARM_CATALOG.forEach(function (e, i) {
        if (e[5] != null && !(e[5] & bit)) return;
        if (e[6] && e[6][0] & bit) parts(e).forEach(function (part, n) { queue.push(named(function () { return make(part); }, tag + ':' + i + String.fromCharCode(97 + n))); });
        queue.push(named(function () { return make(e); }, tag + ':' + i));
      });
    }
    pass(1, 'plain', function (e) { return build(e, false); });
    /* the page's charts (Usage's sparklines, trends and gauges), right after the first pass: Skia draws a path through its
       path atlas or tessellates it by the path's size and style, so each kind of chart is drawn once at its own size (the
       warm F3.1 Usage entry on the P1000 still linked 6 DrawAtlasPathOp programs among 23). The copy carries the styles the
       page's CSS gives each shape, and the gradients they name, since neither reaches into the closed root. */
    queue.push(named(function () {
      /* only charts are queued (the page has 1,600 svgs, nearly all icons): each one's box is read here, in one pass */
      Array.prototype.slice.call(document.querySelectorAll('svg')).filter(function (svg) {
        if (!svg.querySelector('path, polyline, polygon')) return false;
        var r = svg.getBoundingClientRect(); return r.width >= 40 || r.height >= 40;
      }).reverse().forEach(addChart);
      return null;
    }, 'charts', true));
    pass(2, 'faded', function (e) { return build(e, true); });
    /* again with a crowd of complex paths beside it: a tile holding several is rastered multisampled, which uses its own
       programs (a Settings page's icons put its boxes in such tiles) */
    var crowd = null;
    function crowdUp() {
      if (crowd) return;
      crowd = document.createElement('div'); crowd.style.cssText = 'position:absolute;left:0;top:0;width:48px;height:48px;';
      /* ten filled L-shaped outlines drawn from a 100-unit viewBox. Chrome rasters a layer multisampled from 6 slow paths,
         and counts a filled concave path as slow only from 64 units across (a stroked one always). The crowd was the
         page's own stroked icons until F6: in a multisampled tile their round-capped strokes linked two StrokeTessellateOp
         programs of 112-137 ms each on the P1000, more than a warm step may hold (IDLE-WARM-RULE v3.5 item 2: not warmed;
         a page's own icon pays it at its first use, as before), and filled at 24 units they no longer made the tile
         multisampled */
      for (var i = 0; i < 10; i++) {
        var k = document.createElementNS(SVGNS, 'svg'); k.setAttribute('viewBox', '0 0 100 100'); k.setAttribute('width', 16); k.setAttribute('height', 16);
        k.style.cssText = 'position:absolute;left:' + ((i % 5) * 9) + 'px;top:' + (Math.floor(i / 5) * 9 + 28) + 'px;width:16px;height:16px;';
        var pa = document.createElementNS(SVGNS, 'path'); pa.setAttribute('d', 'M0 0H100V' + (24 + i * 4) + 'H' + (24 + i * 3) + 'V100H0Z'); pa.setAttribute('fill', 'currentColor');
        k.appendChild(pa); crowd.appendChild(k);
      }
    }
    function crowded(e, faded) {
      crowdUp();
      var g = document.createElement('div'); g.style.cssText = 'position:absolute;left:0;top:0;width:48px;height:48px;';
      g.appendChild(crowd.cloneNode(true)); g.appendChild(build(e, false));
      if (faded) { var f = document.createElement('div'); f.style.cssText = 'position:absolute;left:0;top:0;width:48px;height:48px;opacity:0.9;transform:scale(0.97);transform-origin:0 0;'; f.appendChild(g); g = f; }
      return g;
    }
    /* the crowd is built before the first crowded kind, outside a frame */
    queue.push(named(function () { crowdUp(); return null; }, 'crowd', true));
    pass(4, 'crowd', function (e) { return crowded(e, false); });
    pass(8, 'crowd-faded', function (e) { return crowded(e, true); });
    var seenChart = {}, SHAPES = 'path, polyline, polygon, line, circle, rect, ellipse',
      PAINT = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-opacity', 'opacity', 'filter', 'vector-effect'];
    function addChart(svg) {
      if (!svg.querySelector('path, polyline, polygon')) return;
      /* to the front of the queue (the scan walks the page's svgs last to first, so they keep their order) */
      queue.unshift(named(function () {
        if (!svg.isConnected) return null;
        var r = svg.getBoundingClientRect(); if (r.width < 40 && r.height < 40) return null;   /* an icon: the icon pass */
        var src = Array.prototype.slice.call(svg.querySelectorAll(SHAPES));
        var paint = src.map(function (sh) { var c = getComputedStyle(sh); return PAINT.map(function (k) { return c.getPropertyValue(k); }); });
        var kinds = paint.map(function (st, i) {
          return [src[i].tagName, st[0] === 'none' ? '' : /url/.test(st[0]) ? 'g' : 'f', st[3] === 'none' ? '' : (/url/.test(st[3]) ? 'G' : 's') + Math.round(parseFloat(st[4]) * 2) + st[5] + st[6],
            st[7] === 'none' ? '' : 'd', st[10] === 'none' ? '' : 'b', +st[9] < 1 ? 'o' : ''].join('');
        }).filter(function (x, i, a) { return a.indexOf(x) === i; }).sort();
        var key = Math.min(8, Math.round(r.width / 60)) + 'x' + Math.min(8, Math.round(r.height / 30)) + '|' + kinds.join(',');
        if (seenChart[key]) return null; seenChart[key] = 1;
        var k = svg.cloneNode(true); k.removeAttribute('id');
        Array.prototype.slice.call(k.querySelectorAll(SHAPES)).forEach(function (sh, i) { var st = paint[i]; if (st) PAINT.forEach(function (prop, j) { sh.style.setProperty(prop, st[j]); }); });
        var ids = {}, defs = null;
        paint.forEach(function (st) { [st[0], st[3]].forEach(function (v) { var m = /url\("?#([^")]+)"?\)/.exec(v || ''); if (m) ids[m[1]] = 1; }); });
        Object.keys(ids).forEach(function (id) {
          if (k.querySelector('[id="' + id + '"]')) return;
          var g = document.getElementById(id); if (!g) return;
          if (!defs) { defs = document.createElementNS(SVGNS, 'defs'); k.insertBefore(defs, k.firstChild); }
          defs.appendChild(g.cloneNode(true));
        });
        k.setAttribute('width', r.width); k.setAttribute('height', r.height);
        k.style.cssText = 'position:absolute;left:0;top:0;width:' + r.width + 'px;height:' + r.height + 'px;overflow:hidden;color:' + getComputedStyle(svg).color + ';';
        return k;
      }, 'chart', true));
    }
    var seen = {};
    queue.push(named(function () { Array.prototype.slice.call(document.querySelectorAll('svg')).forEach(addIcon); return null; }, 'icons', true));
    function addIcon(svg) {
      var sh = svg.querySelector('path, circle, rect, line, polyline, polygon, ellipse'); if (!sh) return;
      queue.push(named(function () {
        if (!svg.isConnected) return null;
        var c = getComputedStyle(sh), key = [c.stroke !== 'none' ? 's' + Math.round(parseFloat(c.strokeWidth) * 2) + c.strokeLinecap + c.strokeLinejoin : '', c.fill !== 'none' ? 'f' : '', sh.tagName].join('/');
        if (seen[key]) return null; seen[key] = 1;
        var g = document.createElement('div'); g.style.cssText = 'position:absolute;left:0;top:0;color:' + getComputedStyle(svg).color + ';';
        [16, 24].forEach(function (s, i) {
          var k = svg.cloneNode(true); k.removeAttribute('id'); k.setAttribute('width', s); k.setAttribute('height', s);
          k.style.cssText = 'position:absolute;left:' + (4 + i * 20) + 'px;top:4px;width:' + s + 'px;height:' + s + 'px;';
          g.appendChild(k);
        });
        return g;
      }, 'icon', true));
    }
    function done() { INPUT.forEach(function (t) { removeEventListener(t, onInput, { capture: true, passive: true }); }); host.remove(); }
    function later(fn) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 1000 }); else setTimeout(fn, 50); }
    /* one kind per frame, swapped in idle time: a kind put in during one idle period is painted in the next frame, and in
       the idle period after that frame the next kind takes its place in the same task, so each frame paints one new kind
       (it took two frames plus an idle wait before: 1012 kinds ran about 2 minutes on a P1000). Each swap is its own idle
       callback, so other idle-time work queued meanwhile runs between them (the wallpaper gallery's warming admits jobs
       from 2 ms of idle, Settings F3). F3 also let a frame with under 10 ms of idle go by without a swap; in Glass the
       warm-up's own frames leave less than that, so it fell to a kind every 250 ms and did not finish in 240 s on the
       P1000 (Glass Light, F3 9480d3f327). That rule is gone. */
    var shown = null, framed = false;
    function step(deadline) {
      if (!host.isConnected) { done(); return; }
      if (document.hidden) { document.addEventListener('visibilitychange', resume, { once: true }); return; }
      if (shown && !framed) { later(step); return; }
      if (pageBusy()) { addEventListener('pm-idle', resume, { once: true }); return; }
      var quiet = performance.now() - lastInput;
      if (quiet < 600) { setTimeout(resume, 600 - quiet); return; }
      if (shown) { shown.remove(); shown = null; }
      /* kinds already drawn and shapes no longer there give no node: the next is tried at once, until the idle time left
         is short (review GW-1), then the rest waits for the next idle callback */
      var make, node = null;
      while (!node && (make = queue.shift())) {
        node = make();
        if (!node && deadline && deadline.timeRemaining && !deadline.didTimeout && deadline.timeRemaining() < 3) { later(step); return; }
      }
      if (!node) { done(); return; }
      box.appendChild(shown = node); framed = false;
      requestAnimationFrame(function () { framed = true; });
      /* a cut catalog's draws each link a program, 15-140 ms of the GPU after the frame on a P1000: the next waits 300 ms,
         so their links never land together */
      if (cut) setTimeout(resume, 300); else later(step);
    }
    function resume() { later(step); }
    if (W) { warmSteps(W); return; }
    document.body.appendChild(host);
    later(step);
    /* with the page's idle-warm queue (window.PM_WARM, shell's 11-motion-start.js, IDLE-WARM-RULE.md; F6): the queue says
       when, judges each step by the frames presented after it, and takes turns between its owners (terminal, Usage,
       Glass). Each kind is drawn at the start of a frame (a small DOM build, well under 2 ms) and taken out in the first
       frame after it. A catalog cut to the draws that link a program (a sixth field on its entries: tools/warm_catalog.py
       --passes) has no draw that is free: on the P1000 each links one to five programs, 15-140 ms of the GPU's main
       thread after its frame, so one a frame would stack them; each draw is then a GPU step, which the queue watches for
       300 ms before the next. A full catalog's draws (about one in eight linking anything) are light steps, one a frame
       while the page is still. A draw that reads
       the page (the scans of its svgs, each chart's and icon's styles) is a cpu step instead: it runs in idle time, reads
       until its deadline is near, and the kinds it finds are drawn next, in order. Glass keeps one step in the queue at a
       time, adding the next as each runs, so its order is its own queue's. A late step is handled: its kind has been
       drawn, so its programs are linked, and drawing it again would link nothing. The warm-up ends after its last kind,
       when the queue drops Glass's step (its session stop, or warming found to be off), or on 'pm-warm-done' with no Glass
       step left; that event may come more than once, and ending twice does nothing. */
    function warmSteps(W) {
      var ended = false;
      function end() {
        if (ended) return;
        ended = true; removeEventListener('pm-warm-done', idleAll); host.remove();
      }
      function idleAll() { var s = W.state('glass'); if (!s.queued && !s.running) end(); }
      function late(info) { if (info && info.dropped) end(); return true; }
      function next() {
        if (ended) return;
        if (!queue.length) { end(); return; }
        var reads = !!queue[0].reads;
        /* later: 1 (IDLE-WARM-RULE v3.8): lg-warm runs when no step of a lower level is queued, so terminal's first-use
           preparation goes first and Usage's raster pass (later: 2) after it */
        W.add({ owner: 'glass', name: 'lg-warm:' + (queue[0].tag || 'kind'), light: !reads && !cut, cpu: reads, later: 1, run: reads ? read : draw, onLate: late });
      }
      /* a light step, at the start of a frame */
      function draw() {
        if (ended) return null;
        if (!host.isConnected) document.body.appendChild(host);
        var node = null, t0 = performance.now();
        while (!node && queue.length && !queue[0].reads) {
          node = queue.shift()();
          if (!node && performance.now() - t0 > 1) break;
        }
        if (node) box.appendChild(node);
        var last = !queue.length;
        if (!last) next();
        return function () { if (node) node.remove(); if (last) end(); };
      }
      /* a cpu step, in idle time, given its deadline: at least one read, then more for 2 ms, or for as long as the deadline
         has room (Home's short slots leave 0-2 ms, where one icon's read a step would take the icons' 1,600 a step each;
         review GW-1) */
      function read(d) {
        if (ended) return null;
        var found = [], t0 = performance.now();
        do {
          var make = queue.shift(), node = make();
          if (node) found.push(named(shows(node), make.tag + '-draw'));
        } while (queue.length && queue[0].reads && (performance.now() - t0 < 2 || (d && typeof d.timeRemaining === 'function' && d.timeRemaining() > 2)));
        for (var i = found.length - 1; i >= 0; i--) queue.unshift(found[i]);
        next();
        return null;
      }
      function shows(node) { return function () { return node; }; }
      addEventListener('pm-warm-done', idleAll);
      next();
    }
  }

  /* ---- wallpapers: any wallpaper for any look (Jared, 2026-10-11) ---------------------------------------------------
     The choice, the catalog and the Settings gallery belong to the wallpapers package (Concepts/wallpapers/opus-5.5:
     window.PM_WALLPAPERS_CATALOG and window.PM_WALLPAPERS). This file follows the same rule for <html data-lg-wall> so
     the two writers always agree, and reads each look's default from the catalog (default_for); without the package
     (a Glass-only build) Glass shows Ribbons. The choice is 'look' (each look's own) or a wallpaper id, used by every
     look; its dark or light print follows the look's mode. */
  function catalogWalls() {
    var C = window.PM_WALLPAPERS_CATALOG, out = [];
    if (C && C.families) C.families.forEach(function (f) { (f.wallpapers || []).forEach(function (w) { out.push({ id: w.id, name: w.name, family: f.label || f.family, default_for: w.default_for || null }); }); });
    return out;
  }
  function lookDefault(fam) {
    var ws = catalogWalls(); if (!ws.length) return fam === 'glass' ? 'ribbons' : '';
    for (var i = 0; i < ws.length; i++) if (ws[i].default_for === fam) return ws[i].id;
    return '';
  }
  function wallChoice() {
    var tome = window.PM7_SETTINGS_TOME, current = tome && tome.wallpaperSnapshot && tome.wallpaperSnapshot();
    return current && current.snapshot && current.snapshot.settings && current.snapshot.settings['general.visual.wallpaper'] || 'look';
  }
  function applyWall() {
    var c = q.get('lgwall') || (window.PM_WALLPAPERS && window.PM_WALLPAPERS.paintChoice ? window.PM_WALLPAPERS.paintChoice() : wallChoice()), fam = (root.getAttribute('data-theme') || '').split('-')[0], ws = catalogWalls();
    if (c !== 'look' && ws.length && !ws.some(function (w) { return w.id === c; })) c = 'look';   /* a stale id: the package resets it */
    var id = c === 'look' ? lookDefault(fam) : c;
    if (id) { if (root.getAttribute('data-lg-wall') !== id) root.setAttribute('data-lg-wall', id); }
    else if (root.hasAttribute('data-lg-wall')) root.removeAttribute('data-lg-wall');
    /* a non-Glass look shows a chosen wallpaper around and between its opaque panels */
    if (id && fam !== 'glass') { if (!root.hasAttribute('data-lg-wall-any')) root.setAttribute('data-lg-wall-any', ''); }
    else if (root.hasAttribute('data-lg-wall-any')) root.removeAttribute('data-lg-wall-any');
  }
  /* choosing goes through the package when it is there, so its gallery and its hold stay in step */
  function setWall(c) {
    if (window.PM_WALLPAPERS && typeof window.PM_WALLPAPERS.choose === 'function') { return window.PM_WALLPAPERS.choose(c); }
    var tome = window.PM7_SETTINGS_TOME, current = tome && tome.wallpaperSnapshot && tome.wallpaperSnapshot();
    if (!current || !current.project_id || !tome.writeWallpaper) return false;
    var result = tome.writeWallpaper({ project_id: current.project_id, value: c, retire_legacy: true });
    if (!result || !result.ok) return false;
    applyWall(); return true;
  }

  /* ---- the concept's own control (status bar) -------------------------------------------------------------------- */
  /* A page that hosts its own demo controls (pm7-demo-studio) sets html[data-lg-demo-host] and drives Glass through
     window.PM_LG (set, wall, walls); the concept's own status-bar button then stays away. */
  function demo() {
    if (root.hasAttribute('data-lg-demo-host')) { var old = document.getElementById('lg-demo-btn'); if (old) old.remove(); return; }
    var bar = document.getElementById('pm7GlobalStatusBar'); if (!bar || document.getElementById('lg-demo-btn')) return;
    var groups = bar.querySelectorAll('.pm7-statusbar-group'), host = groups[groups.length - 1] || bar;
    var btn = el('button', { id: 'lg-demo-btn', class: 'pm7-statusitem', type: 'button', title: 'Liquid Glass concept' }); btn.textContent = 'Liquid Glass';
    host.insertBefore(btn, host.firstChild);
    var pop = el('div', { id: 'lg-demo-pop', role: 'dialog', 'aria-label': 'Liquid Glass concept' });
    function row(name, attr, opts) {
      var r = el('div', { class: 'lg-row' }), l = el('span'); l.textContent = name; r.appendChild(l);
      var s = el('div', { class: 'lg-seg' });
      opts.forEach(function (o) { var b = el('button', { type: 'button', 'data-v': o[0] }); b.textContent = o[1]; b.onclick = function () { o[2](); render(); }; s.appendChild(b); });
      r.appendChild(s); r.__attr = attr; return r;
    }
    function set(a, v) { return function () { if (v == null) root.removeAttribute(a); else root.setAttribute(a, v); }; }
    function look(v) { return function () { try { window.PM12_KIMI.setSettingFromHost('general.visual.theme', v); } catch (e) { root.setAttribute('data-theme', v.toLowerCase().replace(' ', '-')); } }; }
    var rows = [
      row('Look', 'data-theme', [['glass-dark', 'Dark', look('Glass Dark')], ['glass-light', 'Light', look('Glass Light')]]),
      row('Path', 'data-lg-tier', [['gpu', 'GPU', set('data-lg-tier', 'gpu')], ['cpu', 'CPU', set('data-lg-tier', 'cpu')]]),
      row('Motion', 'data-motion', [['', 'Full', set('data-motion', null)], ['reduced', 'Reduced', set('data-motion', 'reduced')]]),
    ];
    var h = el('h3'); h.textContent = 'Liquid Glass concept'; pop.appendChild(h);
    rows.forEach(function (r) { pop.appendChild(r); });
    document.body.appendChild(pop);
    function render() { rows.forEach(function (r) { var cur = root.getAttribute(r.__attr) || ''; r.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === cur)); }); }); }
    btn.onclick = function (e) { e.stopPropagation(); if (pop.hasAttribute('data-open')) pop.removeAttribute('data-open'); else { render(); pop.setAttribute('data-open', ''); mount(pop, 'menu'); pop.__lgMorphed = false; morph(pop, btn); } };
    document.addEventListener('pointerdown', function (e) { if (pop.hasAttribute('data-open') && !pop.contains(e.target) && e.target !== btn) pop.removeAttribute('data-open'); }, true);
  }

  /* Public: set({'data-lg': 'on', 'data-lg-tier': 'gpu'|'cpu', 'data-motion': 'reduced'|null}); wall(id|'look')
     chooses a wallpaper for every look; walls() lists them. Retired data-lg off/null requests normalize to on; surfaces: data-lg-surface on any element (see syncSurfaces). */
  window.PM_LG = { version: 'v3-2026-10-13', sync: syncAll, materialize: function () { materialize(Array.from(glassSet)); }, kinds: KINDS, count: function () { return glassSet.size; },
    set: function (o) { for (var k in o) { if (k === 'data-lg') root.setAttribute(k, 'on'); else if (o[k] == null) root.removeAttribute(k); else root.setAttribute(k, o[k]); } syncAll(); },
    /* Decode and bake through the same bounded caches as visible sheets. Preparation changes no visible pixels. */
    /* opts.canRun (optional): asked again once the print is decoded, before its frost is encoded; false resolves false
       and the caller tries again later (the gallery warms nearby prints only while the page is idle; Settings, B3) */
    /* opts.idle (optional): a preparation the caller makes only because the page is idle (the gallery's background warming,
       not a hover, press or pick). With the page's warm queue its frost is made in that queue's cpu steps (frostSteps);
       any other request for that print runs the rest at once */
    /* opts.printed (optional): called once, when the print is decoded but its frost still has to be made, so the caller
       can start showing the print before the frost is ready (B3 fade-first, F6, Jared 2026-10-16). Glass then makes that
       frost after the next presented frame, so the caller's first frame of its fade is not held by the bake (about 40 ms
       of the main thread a print on a P1000) and the fade runs on the compositor meanwhile. Never called for a pair that
       is still kept, nor when Glass is off: those resolve as soon as they would have. */
    prepareWallpaper: function (url, opts) { return new Promise(function (resolve) {
      var canRun = opts && typeof opts.canRun === 'function' ? opts.canRun : null;
      var printed = opts && typeof opts.printed === 'function' ? opts.printed : null;
      /* a print whose frost pair is still kept is ready to commit without decoding the print again (raw prints are kept
         for 2, frost pairs within FROST_BYTES); it resolves once that pair's images are decoded; its rims rebake after
         the commit, as for any print */
      var keptKey = url + ':' + innerWidth + 'x' + innerHeight, kept = isGlass() && frostCache.get(keptKey), t0 = performance.now();
      if (kept) {
        var was = !!kept.decoded;
        frostCache.delete(keptKey); frostCache.set(keptKey, kept); frostUsed(kept); trimDecoded();
        whenDecoded(kept, function () { frostLog(was ? 'kept' : 'kept-decode', url, t0); resolve(true); }); return;
      }
      withWall(function (im) {
        if (!im) { frostLog('failed', url, t0); resolve(false); return; }
        if (canRun && !canRun()) { frostLog('refused', url, t0); resolve(false); return; }
        var printMs = Math.round(performance.now() - t0), k = url + ':' + innerWidth + 'x' + innerHeight;
        var how = frostCache.has(k) ? 'kept' : frostJobs.has(k) ? 'joined' : 'baked';
        if (!isGlass()) { resolve(true); return; }
        var W = opts && opts.idle && !printed && warmQueue(), stepped = W && !W.state().off ? frostSteps(W, url, canRun) : null;
        var bake = function () { makeFrosts(im, function (ok) { frostLog(ok ? how : 'failed', url, t0, { printMs: printMs, gallery: !!canRun, early: !!printed, queued: !!stepped }); resolve(ok); }, true, stepped); };
        if (!printed || how === 'kept') { bake(); return; }
        frostLog('printed', url, t0, { printMs: printMs });
        try { printed(); } catch (err) {}
        /* after the frame that starts the caller's fade: a timeout set in a frame's rAF runs once that frame is done */
        if (document.hidden) bake(); else requestAnimationFrame(function () { setTimeout(bake, 0); });
      }, url);
    }); },
    /* fade (optional): the body print's Animation, made in the same task just before this commit. With it, every shown
       sheet crossfades its frost in step with that fade (startFrostFade); without it (a look change, Reduce Animations,
       the CPU path, any other caller) the frost changes at once. A crossfade still running ends here first, at once, as
       the caller has just ended its own print fade. */
    commitWallpaper: function (id, url, viewport, fade) {
      endFrostFade();
      if (!isGlass() || root.getAttribute('data-lg-wall') !== id) return false;
      /* The caller sampled the viewport before its attribute writes. Even innerWidth after those writes can force
         style/layout (83 ms on M3) before the frost variables join the same commit. */
      viewport = viewport || { width: innerWidth, height: innerHeight };
      var rec = frostCache.get(url + ':' + viewport.width + 'x' + viewport.height);
      frostLog(rec ? 'commit' : 'commit-miss', url, null, rec ? { decoded: !!rec.decoded } : null);
      if (!rec) return false;
      frostUsed(rec);
      /* The prepared URL is exactly the image selected by this attribute commit. Reading computed style between
         that write and the frost writes forced a full extra restyle (166 ms on M3). Keep the existing source cache
         current without flushing layout; the next genuinely different theme/attribute key still resolves normally. */
      if (wallSourceUrl !== url) { wallSourceUrl = url; wallSourceId++; }
      wallSourceKey = id + '-' + (/-light$/.test(root.getAttribute('data-theme') || '') ? 'light' : 'dark');
      wallSourceUrls.set(wallSourceKey, url);
      var outgoing = frosts, was = frostKey;
      applyFrost(rec);
      if (fade && was && was !== frostKey) startFrostFade(outgoing, fade, viewport);
      return true;
    },
    frostLog: function () { return frostLogBuf.slice(); },
    /* urls: the print URLs (the strings given to prepareWallpaper, current mode) the gallery shows or is about to; [] when
       it closes. Only retention changes: see retainVisible */
    retainVisible: function (urls) { retainVisible(urls); },
    wall: function (id) { setWall(id || 'look'); }, walls: function () { return catalogWalls().map(function (w) { return { id: w.id, name: w.name, family: w.family }; }); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
