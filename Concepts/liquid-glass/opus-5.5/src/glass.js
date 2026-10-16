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
 * Switches on <html>: data-lg on|off, data-lg-tier gpu|cpu, data-lg-wall <id>.
 * URL: ?lg=off ?lgtier=cpu ?lgwall=. Test hook: window.PM_LG.
 */
(function () {
  'use strict';
  if (window.PM_LG) return;
  var root = document.documentElement, q = new URLSearchParams(location.search);
  var SVGNS = 'http://www.w3.org/2000/svg';
  root.setAttribute('data-lg', q.get('lg') === 'off' ? 'off' : 'on');
  /* the wallpaper is applied by applyWall() (below) from the saved choice or ?lgwall= */

  function isGlass() { return root.getAttribute('data-lg') === 'on' && /^glass/.test(root.getAttribute('data-theme') || ''); }
  /* the switcher in another look (Jared #22, 2026-10-15): Glass's tabs, segments and list selections are one component
     (the strips below and their lenses), drawn from --pm-switch-* tokens (glass.css section 12). A look that sets
     --pm-switch: lens adopts it; its strips and lenses then run here, without Glass's sheets, frost or refraction.
     Read when the look changes (one style read), and mirrored on <html data-pm-switch> for the CSS. */
  var switchLook = false;
  function readSwitch() {
    var on = false;
    if (!isGlass()) { try { on = getComputedStyle(root).getPropertyValue('--pm-switch').trim() === 'lens'; } catch (e) {} }
    switchLook = on;
    if (on) { if (root.getAttribute('data-pm-switch') !== 'lens') root.setAttribute('data-pm-switch', 'lens'); }
    else if (root.hasAttribute('data-pm-switch')) root.removeAttribute('data-pm-switch');
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
  var wallUrl = '', wallSources = new Map(), wallSourceKey = null, wallSourceUrl = '', wallSourceId = 0;
  var frosts = {}, frostKey = '', frostCache = new Map(), frostBytes = 0, frostJobs = new Map(), FROST_BYTES = 32 * 1024 * 1024;
  var bakeQ = new Map(), bakeT = 0, bakeFrame = 0, bakeIdle = 0, bakeFlight = null, bakeEpoch = 0, bakeAvg = 8;
  function currentWallUrl(refresh) {
    /* The source's wallpaper variables are selected only by these attributes. Keep the large data URL out of each
       surface signature and resolve the computed variable once per choice: reading it serialises a print of several MB
       (100-165 ms on a P1000 or an M3, 2026-10-16). An empty read is read again, as a host may add the sheet later. */
    var key = [root.getAttribute('data-theme'), root.getAttribute('data-lg-wall'), root.style.getPropertyValue('--lg-wall')].join('|');
    if (!refresh && key === wallSourceKey && wallSourceUrl) return wallSourceUrl;
    var v = getComputedStyle(root).getPropertyValue('--lg-wall') || ''; var m = v.match(/url\(["']?(.*?)["']?\)\s*$/);
    var u = m ? m[1] : '';
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
        var ready = Array.from(wallSources.keys()).filter(function (key) { return wallSources.get(key).ready; });
        while (ready.length > 2) wallSources.delete(ready.shift());
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
  function viewportVars() { root.style.setProperty('--lg-vw', innerWidth + 'px'); root.style.setProperty('--lg-vh', innerHeight + 'px'); }
  function cover(im) { var vw = innerWidth, vh = innerHeight, sc = Math.max(vw / im.naturalWidth, vh / im.naturalHeight); return { s: sc, ox: (vw - im.naturalWidth * sc) / 2, oy: (vh - im.naturalHeight * sc) / 2, vw: vw, vh: vh }; }
  var FROST = { heavy: { blur: 26, sat: 1.65 }, light: { blur: 14, sat: 1.6 } }, FROST_SCALE = 1 / 3;
  function dropFrost(rec) { Object.keys(rec.urls).forEach(function (name) { URL.revokeObjectURL(rec.urls[name]); }); }
  function applyFrost(rec) {
    if (frostKey === rec.key) return;
    frosts = rec.urls; frostKey = rec.key;
    Object.keys(frosts).forEach(function (name) { root.style.setProperty('--lg-frost-' + name, 'url(' + frosts[name] + ')'); });
    releaseWallHold();
  }
  /* A wallpaper or mode change shows the new print at once, but the sheets' frost is encoded from it a few hundred ms
     later (17-30 frames in pm7-wallpapers' RTX 3090 film), so the glass showed the old picture over the new one. The
     page keeps painting the old print until the new frost is in, then both change in the same task. */
  var wallHoldT = 0;
  function holdWall(url) {
    if (!url) return;
    root.style.setProperty('--lg-wall-hold', 'url("' + url + '")'); root.setAttribute('data-lg-wall-hold', '');
    clearTimeout(wallHoldT); wallHoldT = setTimeout(releaseWallHold, 2000);
  }
  function releaseWallHold() {
    clearTimeout(wallHoldT); wallHoldT = 0;
    if (root.hasAttribute('data-lg-wall-hold')) { root.removeAttribute('data-lg-wall-hold'); root.style.removeProperty('--lg-wall-hold'); }
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
  function makeFrosts(im, done) {
    var c = cover(im), u = im.__lgWallUrl || wallUrl, key = u + ':' + c.vw + 'x' + c.vh, epoch = bakeEpoch;
    if (!isGlass() || currentWallUrl() !== u) { done(false); return; }
    if (frostKey === key) { done(true); return; }
    var cached = frostCache.get(key);
    if (cached) { frostCache.delete(key); frostCache.set(key, cached); applyFrost(cached); done(true); return; }
    var job = frostJobs.get(key);
    if (job && job.epoch === epoch) { job.waiters.push(done); return; }
    var names = Object.keys(FROST);
    job = { key: key, epoch: epoch, pending: names.length, blobs: {}, waiters: [done] }; frostJobs.set(key, job);
    function finish(name, blob) {
      job.blobs[name] = blob;
      if (--job.pending) return;
      if (frostJobs.get(key) === job) frostJobs.delete(key);
      var valid = epoch === bakeEpoch && isGlass() && currentWallUrl() === u && innerWidth === c.vw && innerHeight === c.vh;
      valid = valid && names.every(function (n) { return !!job.blobs[n]; });
      if (valid) {
        var rec = { key: key, urls: {}, bytes: 0 };
        names.forEach(function (n) { rec.urls[n] = URL.createObjectURL(job.blobs[n]); rec.bytes += job.blobs[n].size; });
        /* Apply both frost levels together. An older encoder can never replace half of the current wallpaper. */
        var previous = frosts, previousUncached = !Array.from(frostCache.values()).some(function (r) { return r.urls === previous; });
        applyFrost(rec);
        while (frostCache.size && (frostCache.size >= 2 || frostBytes + rec.bytes > FROST_BYTES)) {
          var oldest = frostCache.keys().next().value, old = frostCache.get(oldest);
          frostBytes -= old.bytes; frostCache.delete(oldest); dropFrost(old);
        }
        if (rec.bytes <= FROST_BYTES) { frostCache.set(key, rec); frostBytes += rec.bytes; }
        /* An unusually large active pair is kept only while displayed, rather than exceeding the cache budget. */
        if (previous !== rec.urls && previousUncached) {
          Object.keys(previous).forEach(function (n) { URL.revokeObjectURL(previous[n]); });
        }
      }
      var waiters = job.waiters; job.waiters = []; waiters.forEach(function (cb) { cb(valid); });
    }
    /* each frost is drawn at FROST_SCALE of the window and stretched back by its background-size (glass.css: / --lg-vw
       --lg-vh): a 26 px or 14 px blur holds no detail that a third of the pixels cannot carry, and the blur and the encode
       cost about a ninth. Both canvases are CPU canvases: on a GPU canvas toBlob read the frost back synchronously and
       waited for the page's own raster first (Jared #12: 812 ms of toBlob on a P1000, on every Glass entry and every
       wallpaper change) */
    var k = FROST_SCALE;
    names.forEach(function (name) {
      var F = FROST[name], pad = F.blur * 3, W = c.vw + pad * 2, H = c.vh + pad * 2;
      var src = document.createElement('canvas'); src.width = Math.ceil(W * k); src.height = Math.ceil(H * k); var g = src.getContext('2d', { willReadFrequently: true });
      g.scale(k, k);
      /* fill the margin with a slightly larger copy, so the blur has real colour to pull from at the window's edges */
      g.save(); g.translate(W / 2, H / 2); g.scale(1.12, 1.12); g.translate(-W / 2, -H / 2); g.drawImage(im, c.ox + pad, c.oy + pad, im.naturalWidth * c.s, im.naturalHeight * c.s); g.restore();
      g.drawImage(im, c.ox + pad, c.oy + pad, im.naturalWidth * c.s, im.naturalHeight * c.s);
      var out = document.createElement('canvas'); out.width = Math.round(c.vw * k); out.height = Math.round(c.vh * k); var o = out.getContext('2d', { willReadFrequently: true });
      o.filter = 'blur(' + (F.blur * k).toFixed(2) + 'px) saturate(' + F.sat + ')'; o.drawImage(src, -pad * k, -pad * k); o.filter = 'none';
      finish(name, pngNow(out));
    });
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
  function ringShown(url, except) { var on = false; glassSet.forEach(function (x) { if (x !== except && x.__lgRing === url) on = true; }); return on; }
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
  function sameGeometry(e, G) {
    var lp = layoutPos(e);
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
      else { queue.push(m); pump(); }
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
      bakeW = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
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
      sat: G.k.sat, ca: G.k.ca || 0, left: G.left, top: G.top, c: cover(im), needSpec: !specUrls.has(G.key) });
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
    var list = bakeWReady; bakeWReady = [];
    list.forEach(function (x) {
      var job = x.job, e = job.e, G = job.geo, spec = specUrls.get(G.key);
      if (!currentBake(job, null)) return;
      if (!spec || !sameGeometry(e, G)) { e.__lgSig = null; mount(e, job.kind); return; }
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
        list.sort(function (a, b) { return b.area - a.area; });
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
    var m = lf ? lf.m : buildMaps(W, H, Math.round(R), Math.round(B), Math.round(T), k.mag, k.light, null, true);
    e.style.setProperty('--lg-spec', 'url(' + m.spec + ')');
    e.__lgSig = sig2; e.__lgF = null;
    var bf = null;
    if (gpu() && k.css) bf = 'blur(' + k.blur + 'px) saturate(' + k.sat + ')';
    else if (gpu() && k.lens) { var f = lf.f; e.__lgF = f; bf = 'url(#' + f.id + ') saturate(' + k.sat + ')'; }
    if (bf) { e.style.setProperty('backdrop-filter', bf, 'important'); e.style.setProperty('-webkit-backdrop-filter', bf, 'important'); }
    else { e.style.removeProperty('backdrop-filter'); e.style.removeProperty('-webkit-backdrop-filter'); }
    return e.__lgF;
  }
  /* Read every candidate before committing its optics. New kind attributes are a single preliminary style change:
     dimensions retain the mount's original pre-kind measurement, radius/position use the resulting Glass style.
     Connected, already-mounted sheets need only one geometry and computed-radius snapshot. */
  function mountMeasured(targets, requireVisible) {
    var measured = new Map(), offsets = new Map();
    targets.forEach(function (kind, e) {
      if (!e.isConnected) return;
      var r = e.getBoundingClientRect(), W = Math.round(e.offsetWidth || r.width), H = Math.round(e.offsetHeight || r.height);
      if (W < 4 || H < 4 || (requireVisible && (r.width <= 1 || r.height <= 1))) return;
      var cs = getComputedStyle(e), shown = cs.visibility !== 'hidden';
      if (requireVisible && !shown) return;
      measured.set(e, { rect: r, W: W, H: H, radius: parseFloat(cs.borderTopLeftRadius) || 0, kind: kind, fresh: e.getAttribute('data-lg-kind') !== kind });
    });
    measured.forEach(function (m, e) { if (m.fresh) e.setAttribute('data-lg-kind', m.kind); });
    measured.forEach(function (m, e) {
      if (m.fresh) m.radius = parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0;
      m.R = Math.max(0, Math.min(m.radius, m.W / 2 - 0.5, m.H / 2 - 0.5));
      if (KINDS[m.kind] && KINDS[m.kind].bake) m.lp = layoutPos(e, offsets);
    });
    measured.forEach(function (m, e) { mount(e, m.kind, m); });
  }
  function unmount(e) {
    forgetAncestors(e, scrollSheets, sheetAncestors);
    bakeQ.delete(e); e.__lgBake = null; e.__lgSig = null; e.__lgF = null;
    if (!bakeQ.size && !bakeFlight && bakeT) { clearTimeout(bakeT); bakeT = 0; }
    releaseRing(e);
    ['backdrop-filter', '-webkit-backdrop-filter', '--lg-ring', '--lg-spec'].forEach(function (name) { e.style.removeProperty(name); });
    if (sizeWatch) sizeWatch.unobserve(e); glassSet.delete(e);
  }
  function unmountAll(keepLenses) {
    if (!keepLenses && typeof suspendLensMotion === 'function') suspendLensMotion();
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
      var glass = isGlass();
      var sheets = new Set(), strips = new Set(), positions = new Map(), offsets = new Map();
      /* a room change scrolls Usage's board to its top while the old room leaves in place: neither is anchored before the
         change ends (boardMoment) */
      var area = boardMoment() ? document.querySelector(BOARD_AREA) : null;
      boxes.forEach(function (b) {
        var ss = scrollSheets.get(b), ls = scrollStrips.get(b);
        if (ss && glass) ss.forEach(function (e) { if (!e.isConnected) return; if (area && area.contains(e)) { boardStale = true; return; } sheets.add(e); settleSheets.add(e); });
        if (ls) ls.forEach(function (s) { if (s.isConnected) { strips.add(s); settleStrips.add(s); } });
      });
      sheets.forEach(function (e) {
        if (e.hasAttribute('data-lg-fixed')) return;
        if (!e.__lgPinTried) { e.__lgPinTried = true; if (fixedSafe(e)) { e.setAttribute('data-lg-fixed', ''); return; } }
        positions.set(e, layoutPos(e, offsets));
      });
      positions.forEach(function (lp, e) { anchor(e, lp); });
      strips.forEach(function (s) { var L = lenses.get(s); if (L && !L.dragging) { L.snap = true; syncStrip(L.cfg, s); } });
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
    { sel: '#pm-o55-onboarding .o55-seg', items: 'button', many: true, kind: 'lens', active: '.o55-on', magRest: 1 },
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
  function lensLayer(strip) {
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
  /* the lens is 2 px larger than the item on every side, so the label never reaches into its bevel at rest */
  function unionRect(list) {
    var r = null; list.forEach(function (e) { if (!e) return; var b = boxRect(e); if (b.width < 1) return;
      r = r ? { left: Math.min(r.left, b.left), top: Math.min(r.top, b.top), right: Math.max(r.right, b.left + b.width), bottom: Math.max(r.bottom, b.top + b.height) } : { left: b.left, top: b.top, right: b.left + b.width, bottom: b.top + b.height }; });
    if (r) { r.width = r.right - r.left; r.height = r.bottom - r.top; } return r;
  }
  /* where an element is laid out on screen, without its own transform or those of its transformed ancestors (the
     first untransformed ancestor's real box anchors it, so scrolling and ordinary layout still count) */
  function moved(n) { var cs = getComputedStyle(n); return cs.transform !== 'none' || cs.scale !== 'none' || cs.translate !== 'none' || cs.rotate !== 'none'; }
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
  function rectIn(strip, t, pad) {
    var L = lensLayer(strip); pad = pad || 0;
    if (t.getBoundingClientRect && L !== layer && L.parentElement) {
      var h = hostRect(t, L.parentElement);
      if (h) return { x: h.left - pad, y: h.top - pad, w: h.width + 2 * pad, h: h.height + 2 * pad };
    }
    var r = t.getBoundingClientRect ? boxRect(t) : t, lr = L.getBoundingClientRect();
    return { x: r.left - lr.left - pad, y: r.top - lr.top - pad, w: r.width + 2 * pad, h: r.height + 2 * pad };
  }
  function lensFor(strip, cfg) {
    var L = lenses.get(strip);
    if (L && L.lens.isConnected) { indexAncestors(strip, scrollStrips, stripAncestors); return L; }
    if (L) disposeLens(L);
    indexAncestors(strip, scrollStrips, stripAncestors);
    var lens = el('i', { class: 'lg-lens', 'aria-hidden': 'true', 'data-lg-lens': cfg.kind }), own = lensLayer(strip);
    own.appendChild(lens);
    L = { strip: strip, lens: lens, layer: own, rect: null, anim: null, glintAnim: null, magAnims: null, scrubCleanup: null, cfg: cfg, warm: '', scroller: scrollerOf(strip) }; lenses.set(strip, L);
    if (cfg.mark && !strip.hasAttribute('data-lg-lensed')) strip.setAttribute('data-lg-lensed', '');
    return L;
  }
  /* the nearest ancestor that scrolls this strip: its lens follows it at once while it scrolls, and steps out of
     sight when its target leaves the visible part (the lens layer is not clipped by the strip's container) */
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
    if (isGlass()) mount(L.lens, L.cfg.kind);   /* the refracting optics are Glass's; an adopting look draws the lens from its tokens */
  }
  /* every item size of a strip gets its lens filter while nothing moves, so a move never waits for a map to decode */
  function prewarm(L, cfg, strip) {
    if (!gpu() || !isGlass()) return;
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
  function ride(L, target) {
    stopRide(L);
    var stop = L.layer.parentElement, out = [];
    function mirror(a, props, composite) {
      var kf = [], any = false;
      a.effect.getKeyframes().forEach(function (k) {
        var o = { offset: k.computedOffset, easing: k.easing || 'linear' };
        props.forEach(function (p) { if (k[p] != null && k[p] !== '') { o[p] = k[p]; any = true; } });
        kf.push(o);
      });
      if (!any || kf.length < 2) return;
      var t = a.effect.getTiming(), m;
      try { m = L.lens.animate(kf, { duration: t.duration, delay: t.delay, easing: t.easing, fill: 'backwards', iterations: 1, composite: composite }); } catch (e) { return; }
      if (a.startTime != null) m.startTime = a.startTime; else if (a.currentTime != null) m.currentTime = a.currentTime;
      out.push(m);
    }
    for (var n = target; n && n !== stop && n !== document.documentElement; n = n.parentElement) {
      n.getAnimations().forEach(function (a) {
        if (!a.effect || (a.playState !== 'running' && a.playState !== 'pending')) return;
        mirror(a, RIDE_MOVE, 'add'); mirror(a, ['opacity'], 'replace');
      });
    }
    L.ride = out.length ? out : null;
  }
  /* a lens first shown in a page or window is measured while that page is still coming in, and content above a strip can
     still grow by a layout animation (a Settings manager page eases its height as its tab changes, moving every strip
     below it; no mutation or event says so). It is measured once more when entrances are over, and follows if its
     item moved (a lens in Settings rested 8 px under its tab otherwise). */
  function settleCheck(L) {
    clearTimeout(L.settleT);
    L.settleT = setTimeout(function () { L.settleT = 0; if (lenses.get(L.strip) === L && L.strip.isConnected && !L.dragging && !L.pending && switchOn()) syncStrip(L.cfg, L.strip); }, 480);
  }
  function stopRide(L) { if (L.ride) { var r = L.ride; L.ride = null; r.forEach(function (m) { m.cancel(); }); } }
  function stopLensTravel(L) {
    stopMagnify(L); stopRide(L);
    if (L.glintAnim) { var g = L.glintAnim; L.glintAnim = null; g.cancel(); }
    if (L.anim) { var an = L.anim; L.anim = null; an.onfinish = null; an.cancel(); } L.reducedAnim = false;
  }
  function removeLensElement(e) {
    if (typeof unmount === 'function') unmount(e);
    else { glassSet.delete(e); if (sizeWatch) sizeWatch.unobserve(e); e.__lgF = null; e.__lgSig = null; }
    e.remove();
  }
  function disposeLens(L) {
    forgetAncestors(L.strip, scrollStrips, stripAncestors);
    stopLensTravel(L); if (L.scrubCleanup) L.scrubCleanup();
    removeLensElement(L.lens); L.rect = null;
    if (L.layer && L.layer.classList.contains('lg-lenses-local') && !L.layer.children.length) {
      if (L.layer.parentElement) localLayers.delete(L.layer.parentElement); L.layer.remove();
    }
  }
  function pruneLenses() {
    lenses.forEach(function (L, strip) { if (!strip.isConnected || !L.lens.isConnected) { disposeLens(L); lenses.delete(strip); } });
    if (bead && (!bead.isConnected || (beadOn && !beadOn.isConnected))) { resetBead(); removeLensElement(bead); bead = null; }
    menuMotions.forEach(function (M, menu) {
      if (!menu.isConnected || (menu.id === 'lg-demo-pop' && !menu.hasAttribute('data-open'))) resetMenuMorph(menu);
      else M.animations.forEach(function (target, an) { if (!target.isConnected) { an.cancel(); M.animations.delete(an); } });
    });
    pruneLensFilters();
  }
  function suspendLensMotion() {
    lenses.forEach(function (L) { stopLensTravel(L); L.pending = null; if (L.scrubCleanup) L.scrubCleanup(); });
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
  function magsOf(cfg) { var k = KINDS[cfg.kind] || {}; return { rest: cfg.magRest != null ? cfg.magRest : k.magRest || 1, lift: cfg.magLift != null ? cfg.magLift : k.magLift || 1 }; }
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
    var sw = A.w / B.w, shh = A.h / B.h, land = -1, lr = L.layer.getBoundingClientRect();
    var cB = vertical ? lr.top + B.y + B.h / 2 : lr.left + B.x + B.w / 2, rects = [];
    for (var i = 0; i < S.length; i++) {
      var t = S[i].t, p = S[i].x, v = S[i].v, over = (p - 1) * ad;
      if (over > 0) p = 1 + 3 * Math.tanh(over / 3) / Math.max(1, ad);
      if (land < 0 && p >= 0.985) land = t;
      var off = (1 - p) * -dist, lift = Math.max(0, Math.sin(Math.PI * Math.min(1, t / (dur * 0.62))));
      var sp = Math.min(1, Math.abs(v) * ad / 2400), along = 1 + Math.min(0.24, sp * 0.3), across = 1 - (along - 1) * 0.4;
      var wob = land < 0 ? 0 : 0.05 * Math.min(1, ad / 120) * Math.exp(-(t - land) / 110) * Math.sin(2 * Math.PI * (t - land) / 190);
      var q = Math.min(1, Math.max(0, p)), grow = 1 + 0.07 * lift, w = (sw + (1 - sw) * q) * grow, h = (shh + (1 - shh) * q) * grow;
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
    an.onfinish = function () { if (L.anim === an) L.anim = null; };
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
  function arrive(L, target) {
    var left = arrivalLeft(target); if (left < 40) return;
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
  function checkShown() {
    showT = 0;
    if (!switchOn()) { hiddenLenses.clear(); return; }
    hiddenLenses.forEach(function (cfg, L) {
      if (!L.strip.isConnected || (cfg.kind === 'lensIcon' && !isGlass())) { hiddenLenses.delete(L); return; }
      if (!visible(L.strip)) return;
      var t = cfg.pick ? cfg.pick(L.strip) : L.strip.querySelector(cfg.items + (cfg.active || '.active'));
      if (t && visible(t)) { hiddenLenses.delete(L); syncStrip(cfg, L.strip); }
    });
    if (hiddenLenses.size) showT = setTimeout(checkShown, 400);
  }
  function syncStrip(cfg, strip) {
    var L = lensFor(strip, cfg);
    var target = cfg.pick ? cfg.pick(strip) : strip.querySelector(cfg.items + (cfg.active || '.active'));
    if (L.pending) {
      /* pressed, not yet chosen by the app: hold the lens there until the app makes any choice. This app switches on
         the release, after up to a few hundred ms of work, and its click comes later still; a release elsewhere
         abandons the press. */
      var now = performance.now(), P = L.pending;
      if (!P.el.isConnected || target !== P.from || P.away || (P.up && now - P.up > 2500)) L.pending = null;
      else target = P.el;
    }
    if (!target || !visible(target) || !visible(strip)) { stopLensTravel(L); if (L.scrubCleanup) L.scrubCleanup(); if (L.lens.style.opacity !== '0') L.lens.style.opacity = '0'; L.rect = null; awaitShow(L, cfg); return; }
    hiddenLenses.delete(L);
    if (L.scroller && L.scroller.isConnected) {
      var sr = L.scroller.getBoundingClientRect(), tr = boxRect(cfg.box ? (cfg.box(target).getBoundingClientRect ? cfg.box(target) : target) : target);
      if (tr.left < sr.left - 1 || tr.left + tr.width > sr.right + 1 || tr.top < sr.top - 1 || tr.top + tr.height > sr.bottom + 1) {
        stopLensTravel(L); if (L.lens.style.opacity !== '0') L.lens.style.opacity = '0'; L.rect = null; return;
      }
    }
    if (L.lens.style.opacity) L.lens.style.opacity = '';
    prewarm(L, cfg, strip);
    var R = rectIn(strip, cfg.box ? cfg.box(target) : target, cfg.pad == null ? 2 : cfg.pad), A = L.rect;
    if (L.dragging) return;
    if (L.snap) { L.snap = false; stopLensTravel(L); setLensBox(L, R); return; }
    var quiet = reduced();
    var still = A && (quiet ? A.x === R.x && A.y === R.y && A.w === R.w && A.h === R.h : Math.abs(A.x - R.x) < 0.5 && Math.abs(A.y - R.y) < 0.5 && Math.abs(A.w - R.w) < 0.5 && Math.abs(A.h - R.h) < 0.5);
    if ((quiet && !L.reducedAnim) || !switchOn()) stopLensTravel(L);
    if (still) return;
    if (!A || quiet || !switchOn()) {
      stopLensTravel(L);
      if (A && quiet) { var an = L.lens.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 140 }); L.anim = an; L.reducedAnim = true; an.onfinish = function () { if (L.anim === an) { L.anim = null; L.reducedAnim = false; } }; }
      setLensBox(L, R); L.tgt = target;
      /* a lens in the app-wide layer waits for its strip's entrance; one in its host's own layer (a page, a menu, a
         dialog) is part of that entrance already */
      if (!A && !quiet && switchOn()) { if (L.layer === layer) arrive(L, target); ride(L, target); settleCheck(L); }
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
    if (L.tgt === target && !L.dragging) { stopLensTravel(L); setLensBox(L, R); return; }
    L.tgt = target;
    var from = visualRect(L) || A, vertical = !!cfg.vertical || Math.abs(from.y - R.y) > Math.abs(from.x - R.x);
    travel(L, from, R, vertical, { labels: labelsOf(cfg, strip, vertical), mags: magsOf(cfg), vertical: vertical });
  }
  /* the press: the lens leaves for the pressed item at once; the app's choice (or its absence) settles it. Only for
     items the app can choose: a disabled or inert item, or a strip that takes no press (a progress rail), keeps the lens
     where it is (it used to sit on the pressed step for the 2.5 s hold, then slide back). */
  function choosable(item, cfg) {
    return cfg.press !== false && !item.disabled && item.getAttribute('aria-disabled') !== 'true' && !item.closest('[inert]');
  }
  function stripAt(target) {
    for (var i = 0; i < STRIPS.length; i++) {
      var cfg = STRIPS[i], strip = target.closest && target.closest(cfg.sel); if (!strip) continue;
      var item = target.closest(cfg.items); if (!item || !strip.contains(item)) return null;
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
    L.pending = { el: hit.item, from: cur, up: 0, away: false };
    syncStrip(hit.cfg, hit.strip);
  }, true);
  document.addEventListener('pointerup', function (e) {
    lenses.forEach(function (L) {
      var P = L.pending; if (!P || P.up) return;
      P.up = performance.now(); P.away = !(e.target && P.el.contains(e.target));
      if (P.away) queueSync(L.strip); else setTimeout(function () { queueSync(L.strip); }, 2550);
    });
  }, true);
  document.addEventListener('pointercancel', function () { lenses.forEach(function (L) { if (L.pending) { L.pending = null; queueSync(L.strip); } }); }, true);
  /* scrubbing: press on a tab strip and slide; the lens lifts and follows the pointer like a drop of water, magnifying
     each tab it passes, and drops into the nearest tab on release (which then becomes the chosen one) */
  function scrubbing(e) {
    if (!switchOn() || e.button !== 0 || reduced()) return;
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
        L.lens.style.transform = 'translate3d(' + (sr.left - lr.left + x - L.rect.x).toFixed(1) + 'px,0,0) scale(1.1,1.12)';
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
    /* Settings: its domain rail and section index are sheets, every section is a card */
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
      if (!L.rect) return;
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
  function syncPending() {
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
    STRIPS.forEach(function (cfg) {
      var found = cfg.many ? scopedNodes(cfg.sel, scopes) : [document.querySelector(cfg.sel)].filter(function (s) {
        return s && (!scopes || scopes.some(function (p) { return p.contains(s) || s.contains(p); }));
      });
      strips.forEach(function (s) { if (s.matches(cfg.sel) && found.indexOf(s) < 0) found.push(s); });
      /* the activity bar's icon lens is Glass's own rail design; an adopting look keeps its own lit icon there */
      if (cfg.kind === 'lensIcon' && !isGlass()) { found.forEach(function (s) { var L = lenses.get(s); if (L) { disposeLens(L); lenses.delete(s); } }); return; }
      found.forEach(function (s) { syncStrip(cfg, s); });
    });
    if (isGlass()) scanMenus(scopes);
  }
  function queueSync(scope) {
    if (scope && scope.nodeType === 1) dirtyScope(scope);
    if (boardMoment() && afterLayout()) return;
    if (!syncQ) syncQ = requestAnimationFrame(function () { syncQ = 0; syncPending(); });
  }
  /* During a Usage room change, a sync waits for the frame's own layout: a ResizeObserver's first report of a fresh
     observation comes after layout, where every read is free. Synced in the click task or a frame callback, it forced
     the room's layout (up to 137 ms) and Usage's next callbacks dirtied it again, so the frame laid out a second time
     (125 ms more: one 312 ms task in r64's trace). afterLayout(fn) runs fn there too (a rim bake's step). */
  var postEl = null, postRO = null, postQ = false, postOn = false, postFns = [];
  function afterLayout(fn) {
    if (!window.ResizeObserver || !document.body) return false;
    if (fn) postFns.push(fn); else postQ = true;
    if (postOn) return true;
    if (!postRO) postRO = new ResizeObserver(function () {
      if (!postOn) return;
      postOn = false; postRO.unobserve(postEl);
      if (postQ) {
        postQ = false;
        if (syncQ) { cancelAnimationFrame(syncQ); syncQ = 0; }
        syncPending();
      }
      var fns = postFns; postFns = []; fns.forEach(function (f) { f(); });
    });
    if (!postEl || !postEl.isConnected) {
      postEl = el('i', { id: 'lg-post', 'aria-hidden': 'true' });
      postEl.style.cssText = 'position:fixed;left:-8px;top:-8px;width:2px;height:2px;pointer-events:none;visibility:hidden';
      document.body.appendChild(postEl);
    }
    postOn = true; postRO.observe(postEl);
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
  var HOT = '[data-lg-surface], .page-tab, #pmuRange > button, .pmu-navbtn, .pm-segtab-item, #activityBar .icon, .side-panel-view, .pmu-pop, .pmr-menu-list, .pmr-menu-group, .pm6-tb-menu, .o55-railitem, .o55-seg button, .o55-win, .o55t-callout, .o55t-bar';
  var GENERATED = '#lg-optics, #lg-lenses, .lg-lenses-local, #lg-shine, .lg-press, .pm-segtab-track, #lg-post';
  var MENU_HOT = '[data-lg-surface], .pmu-pop, .pmr-menu-list, .pm6-tb-menu, .o55-win, .o55t-callout, .o55t-bar';
  function generatedMutation(rec) {
    var t = rec.target;
    if (t.nodeType === 1 && t.closest(GENERATED)) return true;
    if (rec.type !== 'childList') return false;
    /* app replacement can remove a persistent output layer; let that schedule its reconstruction */
    for (var i = 0; i < rec.removedNodes.length; i++) {
      var n = rec.removedNodes[i]; if (n.nodeType !== 1 || !n.matches('#lg-shine, .lg-press')) return false;
    }
    var nodes = Array.prototype.slice.call(rec.addedNodes).concat(Array.prototype.slice.call(rec.removedNodes));
    return nodes.length > 0 && nodes.every(function (n) { return n.nodeType === 1 && n.matches(GENERATED); });
  }
  var lastPage = null, lastTheme = root.getAttribute('data-theme'), lastLg = root.getAttribute('data-lg');
  var lastTier = root.getAttribute('data-lg-tier'), lastWall = root.getAttribute('data-lg-wall'), lastMotion = root.getAttribute('data-motion');
  var lastO55 = root.hasAttribute('data-o55-open');
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
      /* optics, lenses and light are outputs of sync, never inputs that should schedule it again */
      if (generatedMutation(recs[i])) continue;
      if (recs[i].type === 'attributes' && recs[i].oldValue === recs[i].target.getAttribute(recs[i].attributeName)) continue;
      if (area && area.contains(recs[i].target)) { boardStale = true; if (recs[i].type === 'childList') premark(recs[i].addedNodes); continue; }
      relevant = true;
      var t = recs[i].target; if (t.nodeType !== 1) continue;
      dirtyScope(recs[i].type === 'attributes' ? t.parentElement || t : t);
      if (t.matches(HOT)) { hot = true; if (area && t.matches(MENU_HOT)) menuHot = true; }
      else for (var j = 0; j < recs[i].addedNodes.length; j++) { var nd = recs[i].addedNodes[j]; if (nd.nodeType === 1 && (nd.matches(HOT) || nd.matches('.pmu-card') || (nd.querySelector && nd.querySelector('.pmr-menu-list, .pmu-card')))) { hot = true; if (area && (nd.matches(MENU_HOT) || (nd.querySelector && nd.querySelector('.pmr-menu-list')))) menuHot = true; break; } }
    }
    if (!relevant) return;
    var page = document.querySelector('.page-tabs .page-tab.active'); page = page && page.id;
    var changed = Array.from(dirtyRoots), full = dirtyAll;
    /* a Usage room change syncs after layout (afterLayout); a menu opening still gets its first keyframe at once */
    if (area && !menuHot) afterLayout();
    else if (hot && switchOn()) hotSync(); else lazySync(false);
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
    if (th === lastTheme && lg === lastLg && tier === lastTier && wall === lastWall && motion === lastMotion) return;
    /* the print is about to change under glass that stays glass: hold the one the current frost was made from */
    var wasGlass = lastLg === 'on' && /^glass/.test(lastTheme || '');
    if (wasGlass && isGlass() && wall !== lastWall && th === lastTheme && wallSourceUrl) holdWall(wallSourceUrl);
    else if (!isGlass()) releaseWallHold();
    if (motion !== lastMotion && reduced() && typeof suspendLensMotion === 'function') suspendLensMotion();
    lastTier = tier; lastWall = wall; lastMotion = motion;
    if (th !== lastTheme || lg !== lastLg) {
      readSwitch();
      var enter = isGlass() && (!/^glass/.test(lastTheme || '') || lastLg !== 'on');
      lastTheme = th; lastLg = lg; lenses.forEach(function (L) { L.rect = null; });
      glassSet.forEach(function (e) { e.__lgSig = null; });
      syncAll(); lastWall = root.getAttribute('data-lg-wall');
      if (enter) materialize(Array.from(glassSet));
    } else { dirtyAll = true; queueSync(); }
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-lg', 'data-lg-tier', 'data-lg-wall', 'data-motion', 'data-o55-open', 'data-pmu-moment'] });
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
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['class', 'hidden', 'data-open', 'data-lg-surface'] });
    if (window.ResizeObserver) { var ro = new ResizeObserver(function (entries) { entries.forEach(function (en) { dirtyScope(en.target); }); lazySync(false); }); ['.app-shell', '.left-panel', '#sidePanelSlot', '#chatPanel', '#pmuBoard', '#pmuApp'].forEach(function (s) { var e = document.querySelector(s); if (e) ro.observe(e); }); }
    window.addEventListener('resize', lazySync);
    demo();
    syncAll(); setTimeout(syncAll, 500); setTimeout(syncAll, 1500);
    if (isGlass()) setTimeout(function () { syncAll(); materialize(Array.from(glassSet)); }, 700);
  }

  /* ---- wallpapers: any wallpaper for any look (Jared, 2026-10-11) ---------------------------------------------------
     The choice, the catalog and the Settings gallery belong to the wallpapers package (Concepts/wallpapers/opus-5.5:
     window.PM_WALLPAPERS_CATALOG and window.PM_WALLPAPERS). This file follows the same rule for <html data-lg-wall> so
     the two writers always agree, and reads each look's default from the catalog (default_for); without the package
     (a Glass-only build) Glass shows Ribbons. The choice is 'look' (each look's own) or a wallpaper id, used by every
     look; its dark or light print follows the look's mode. */
  var WALL_KEY = 'pm-lg-wallpaper';
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
  function wallChoice() { try { return localStorage.getItem(WALL_KEY) || 'look'; } catch (e) { return 'look'; } }
  function applyWall() {
    var c = q.get('lgwall') || wallChoice(), fam = (root.getAttribute('data-theme') || '').split('-')[0], ws = catalogWalls();
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
    if (window.PM_WALLPAPERS && typeof window.PM_WALLPAPERS.choose === 'function') { window.PM_WALLPAPERS.choose(c); applyWall(); return; }
    try { localStorage.setItem(WALL_KEY, c); } catch (e) {} applyWall();
  }

  /* ---- the concept's own control (status bar) -------------------------------------------------------------------- */
  /* A page that hosts its own demo controls (pm7-demo-studio) sets html[data-lg-demo-host] and drives Glass through
     window.PM_LG (set, wall, walls); the concept's own status-bar button then stays away. */
  function demo() {
    if (root.hasAttribute('data-lg-demo-host')) { var old = document.getElementById('lg-demo-btn'); if (old) old.remove(); return; }
    var bar = document.getElementById('pm7GlobalStatusBar'); if (!bar || document.getElementById('lg-demo-btn')) return;
    var groups = bar.querySelectorAll('.pm7-statusbar-group'), host = groups[groups.length - 1] || bar;
    var btn = el('button', { id: 'lg-demo-btn', class: 'pm7-statusitem', type: 'button', title: 'Liquid Glass concept (Alt+Shift+L: on or off)' }); btn.textContent = 'Liquid Glass';
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
      row('Liquid Glass', 'data-lg', [['on', 'On', set('data-lg', 'on')], ['off', 'Today', set('data-lg', 'off')]]),
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
    document.addEventListener('keydown', function (e) { if (e.altKey && e.shiftKey && (e.code === 'KeyL')) { root.setAttribute('data-lg', root.getAttribute('data-lg') === 'on' ? 'off' : 'on'); render(); e.preventDefault(); } });
  }

  /* Public: set({'data-lg': 'on'|'off', 'data-lg-tier': 'gpu'|'cpu', 'data-motion': 'reduced'|null}); wall(id|'look')
     chooses a wallpaper for every look; walls() lists them; surfaces: data-lg-surface on any element (see syncSurfaces). */
  window.PM_LG = { version: 'v3-2026-10-13', sync: syncAll, materialize: function () { materialize(Array.from(glassSet)); }, kinds: KINDS, count: function () { return glassSet.size; },
    set: function (o) { for (var k in o) { if (o[k] == null) root.removeAttribute(k); else root.setAttribute(k, o[k]); } syncAll(); },
    wall: function (id) { setWall(id || 'look'); }, walls: function () { return catalogWalls().map(function (w) { return { id: w.id, name: w.name, family: w.family }; }); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
