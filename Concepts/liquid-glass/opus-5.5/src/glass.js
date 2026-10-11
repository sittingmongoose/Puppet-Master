/* Liquid Glass v2: the glass engine and its motion (pm7-liquid-glass, Opus 5.5, 2026-10-11).
 *
 * v1 was rejected ("it does not at all read as glass"): tinted fills over one blurred wallpaper. v2 is optical. Every
 * glass element refracts what is really behind it through its own backdrop filter:
 *   blur(b) url(#refraction) saturate(s)
 * The refraction is an SVG feDisplacementMap whose map is computed per element size from a convex squircle bevel and
 * Snell's law (n = 1.5): the background bends at the rim, and a lens also magnifies at its centre. Small controls and
 * lenses split red, green and blue a little at the rim (chromatic fringing). Over that sit a specular rim, lit from the
 * top left with a fainter return at the bottom right, and a shine layer that brightens the rim nearest the pointer.
 * Motion runs on a damped spring:
 *   - lenses stretch with their speed and wobble when they land, and can be scrubbed;
 *   - menus morph out of the control that opened them;
 *   - glass materializes by ramping its refraction rather than fading;
 *   - presses flex the glass.
 * The CPU path (no GPU) draws the same shapes and rims as frosted glass without refraction.
 * Switches on <html>: data-lg on|off, data-lg-tier gpu|cpu, data-lg-wall ribbons|prism|orbs.
 * URL: ?lg=off ?lgtier=cpu ?lgwall=. Test hook: window.PM_LG.
 */
(function () {
  'use strict';
  if (window.PM_LG) return;
  var root = document.documentElement, q = new URLSearchParams(location.search);
  var SVGNS = 'http://www.w3.org/2000/svg';
  root.setAttribute('data-lg', q.get('lg') === 'off' ? 'off' : 'on');
  if (q.get('lgwall')) root.setAttribute('data-lg-wall', q.get('lgwall'));
  if (!root.getAttribute('data-lg-wall')) root.setAttribute('data-lg-wall', 'ribbons');

  function isGlass() { return root.getAttribute('data-lg') === 'on' && /^glass/.test(root.getAttribute('data-theme') || ''); }
  function gpu() { return root.getAttribute('data-lg-tier') !== 'cpu'; }
  function reduced() { return root.getAttribute('data-motion') === 'reduced' || root.getAttribute('data-reduced-motion') === '1' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function el(tag, attrs) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); return e; }
  function visible(e) { if (!e || !e.isConnected) return false; var r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden'; }

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
  var mapCache = new Map();
  function sdf(px, py, hx, hy, R) {
    var qx = Math.abs(px) - hx, qy = Math.abs(py) - hy, d, nx, ny;
    if (qx > 0 && qy > 0) { var l = Math.hypot(qx, qy); d = R - l; nx = Math.sign(px) * qx / l; ny = Math.sign(py) * qy / l; }
    else if (qx > qy) { d = R - qx; nx = Math.sign(px) || 1; ny = 0; } else { d = R - qy; nx = 0; ny = Math.sign(py) || 1; }
    return [d, nx, ny];
  }
  function profile(t) { return Math.pow(1 - Math.pow(1 - t, 4), 0.25); }
  function buildMaps(W, H, R, B, T, mag, lightK) {
    var key = [W, H, R, B, T, mag, lightK].join('|');
    if (mapCache.has(key)) return mapCache.get(key);
    var n = W * H, dx = new Float32Array(n), dy = new Float32Array(n), sp = new Float32Array(n), rim = new Float32Array(n), edge = new Float32Array(n);
    var hx = W / 2 - R, hy = H / 2 - R, cx = W / 2, cy = H / 2, L0 = -0.55, L1 = -0.83, max = 0;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var i = y * W + x, px = x + 0.5 - cx, py = y + 0.5 - cy, s = sdf(px, py, hx, hy, R), d = s[0];
      if (d <= 0) { edge[i] = 1; continue; }
      var u = Math.min(1, Math.max(0, (d - B * 0.30) / (B * 0.62))); edge[i] = 1 - u * u * (3 - 2 * u);
      var vx = 0, vy = 0;
      if (mag > 1) { vx = -px * (1 - 1 / mag); vy = -py * (1 - 1 / mag); }
      if (d < B) {
        var t = d / B, e = 0.002, slope = (profile(Math.min(1, t + e)) - profile(Math.max(0, t - e))) / (2 * e) * (T / B);
        var a = Math.atan(slope), b = Math.asin(Math.sin(a) / 1.5), m = T * Math.tan(a - b);
        /* keep the bend physical for any size: content is pulled in from at most half a bevel deeper than the rim
           band, and never from past the centre (a small lens would otherwise mirror its label) */
        m = Math.max(0, Math.min(m, 1.55 * B - d, (mag > 1 ? 0.45 : 0.78) * (Math.min(W, H) / 2 - d)));
        vx -= s[1] * m; vy -= s[2] * m;
        var face = s[1] * L0 + s[2] * L1, lit = Math.pow(Math.max(0, face), 1.4), back = Math.pow(Math.max(0, -face), 2.2) * 0.42;
        var line = Math.exp(-d / 1.25), glow = Math.exp(-d / (B * 0.38)) * 0.32;
        sp[i] = Math.min(1, (lit + back) * (line + glow) * lightK + line * 0.10);
        rim[i] = Math.min(1, Math.exp(-d / 2.2) + Math.exp(-d / (B * 0.5)) * 0.35);
      }
      dx[i] = vx; dy[i] = vy; var mm = Math.max(Math.abs(vx), Math.abs(vy)); if (mm > max) max = mm;
    }
    function img(fill) { var c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d'), im = g.createImageData(W, H); fill(im.data); g.putImageData(im, 0, 0); return c.toDataURL('image/png'); }
    var k = max || 1;
    var res = {
      scale: max * 2,
      disp: img(function (D) { for (var i = 0; i < n; i++) { var o = i * 4; D[o] = 128 + Math.round(dx[i] / k * 127); D[o + 1] = 128 + Math.round(dy[i] / k * 127); D[o + 2] = 128; D[o + 3] = 255; } }),
      spec: img(function (D) { for (var i = 0; i < n; i++) { var o = i * 4; D[o] = D[o + 1] = D[o + 2] = 255; D[o + 3] = Math.round(sp[i] * 255); } }),
      rim: img(function (D) { for (var i = 0; i < n; i++) { var o = i * 4; D[o] = D[o + 1] = D[o + 2] = 255; D[o + 3] = Math.round(rim[i] * 255); } }),
      edge: img(function (D) { for (var i = 0; i < n; i++) { var o = i * 4; D[o] = D[o + 1] = D[o + 2] = 255; D[o + 3] = Math.round(edge[i] * 255); } }),
    };
    if (mapCache.size > 160) mapCache.delete(mapCache.keys().next().value);
    mapCache.set(key, res);
    return res;
  }

  /* ---- optics: filters ------------------------------------------------------------------------------------------ */
  var defs = null, fid = 0, filterByKey = new Map();
  function ensureDefs() {
    if (defs && defs.isConnected) return defs;
    var svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; svg.id = 'lg-optics';
    defs = document.createElementNS(SVGNS, 'defs'); svg.appendChild(defs); document.body.appendChild(svg); return defs;
  }
  /* The rim stays sharp and the core is frosted, as in real glass: the backdrop is refracted unblurred, then blurred,
     and the two are blended through the edge mask, so the wallpaper's crisp lines visibly bend along the rim while the
     middle stays calm for text. Small controls and lenses are clear (no frost) and split colour slightly at the rim. */
  function filterFor(W, H, m, ca, blur) {
    var key = m.disp.length + ':' + W + 'x' + H + ':' + m.scale.toFixed(1) + ':' + ca + ':' + blur;
    if (filterByKey.has(key)) return filterByKey.get(key);
    var id = 'lgf' + (fid++), f = document.createElementNS(SVGNS, 'filter');
    f.setAttribute('id', id); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', W); f.setAttribute('height', H);
    f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('primitiveUnits', 'userSpaceOnUse'); f.setAttribute('color-interpolation-filters', 'sRGB');
    var s = m.scale.toFixed(1);
    var html = '<feImage href="' + m.disp + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none" result="map"/>';
    if (ca > 0) {
      var rs = (m.scale * (1 - ca)).toFixed(1), bs = (m.scale * (1 + ca)).toFixed(1);
      html += '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + rs + '" xChannelSelector="R" yChannelSelector="G" result="dr"/>' +
        '<feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + s + '" xChannelSelector="R" yChannelSelector="G" result="dg"/>' +
        '<feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + bs + '" xChannelSelector="R" yChannelSelector="G" result="db"/>' +
        '<feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>' +
        '<feComposite in="r" in2="g" operator="arithmetic" k2="1" k3="1" result="rg"/>' +
        '<feComposite in="rg" in2="b" operator="arithmetic" k2="1" k3="1" result="D"/>';
    } else {
      html += '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + s + '" xChannelSelector="R" yChannelSelector="G" result="D"/>';
    }
    if (blur > 0) {
      html += '<feGaussianBlur in="D" stdDeviation="' + blur + '" result="Bl"/>' +
        '<feImage href="' + m.edge + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none" result="E"/>' +
        '<feComposite in="D" in2="E" operator="in" result="Dr"/>' +
        '<feComposite in="Bl" in2="E" operator="out" result="Bc"/>' +
        '<feComposite in="Dr" in2="Bc" operator="arithmetic" k2="1" k3="1"/>';
    }
    f.innerHTML = html;
    ensureDefs().appendChild(f);
    var rec = { id: id, el: f, scale: m.scale };
    filterByKey.set(key, rec);
    return rec;
  }

  /* ---- glass kinds -------------------------------------------------------------------------------------------------
     bezel and thickness in px; blur before the refraction; ca = chromatic split at the rim; mag = lens magnification;
     light = specular strength. Panels and cards are frosted so text on them reads; controls are clearer; lenses are clear
     and magnify. */
  var KINDS = {
    panel:   { bezel: 26, thick: 74, blur: 22, sat: 1.7, ca: 0,    mag: 1,    light: 1.0 },
    card:    { bezel: 20, thick: 60, blur: 26, sat: 1.6, ca: 0,    mag: 1,    light: 0.9 },
    control: { bezel: 13, thick: 40, blur: 5,  sat: 1.8, ca: 0.07, mag: 1,    light: 1.1 },
    track:   { bezel: 12, thick: 34, blur: 7,  sat: 1.7, ca: 0.05, mag: 1,    light: 1.0 },
    lens:    { bezel: 4,  thick: 10, blur: 0,  sat: 1.5, ca: 0.10, mag: 1.10, light: 1.35 },
    sel:     { bezel: 6,  thick: 12, blur: 0,  sat: 1,   ca: 0,    mag: 1,    light: 1.1, flat: true },
    menu:    { bezel: 18, thick: 56, blur: 30, sat: 1.5, ca: 0,    mag: 1,    light: 0.95 },
    bar:     { bezel: 10, thick: 28, blur: 16, sat: 1.6, ca: 0,    mag: 1,    light: 0.8 },
  };
  var glassSet = new Set();
  function radiusOf(e, W, H) { var r = parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0; return Math.max(0, Math.min(r, W / 2 - 0.5, H / 2 - 0.5)); }
  /* mount or refresh one glass element at its current size; returns the filter record (null on the CPU path) */
  function mount(e, kind) {
    var k = KINDS[kind] || KINDS.panel, r = e.getBoundingClientRect();
    var W = Math.round(e.offsetWidth || r.width), H = Math.round(e.offsetHeight || r.height);
    if (W < 4 || H < 4) return null;
    var R = radiusOf(e, W, H), B = Math.max(2, Math.min(k.bezel, Math.min(W, H) / 2 - 1)), T = Math.min(k.thick, B * 2.4);
    var sig = W + 'x' + H + ':' + R.toFixed(1) + ':' + kind;
    e.classList.add('lg-g'); e.setAttribute('data-lg-kind', kind); glassSet.add(e);
    if (e.__lgSig === sig && (gpu() ? e.__lgF : true)) return e.__lgF;
    var m = buildMaps(W, H, Math.round(R), Math.round(B), Math.round(T), k.mag, k.light);
    /* the rim is a background layer of the glass itself (never a child: hosts like the title bar measure their
       children to fit), drawn over the tint and under the content */
    e.style.setProperty('--lg-spec', 'url(' + m.spec + ')');
    e.__lgSig = sig;
    if (!gpu() || k.flat) { e.style.removeProperty('backdrop-filter'); e.style.removeProperty('-webkit-backdrop-filter'); e.__lgF = null; return null; }
    var f = filterFor(W, H, m, k.ca, k.blur);
    var bf = 'url(#' + f.id + ') saturate(' + k.sat + ')';
    e.style.setProperty('backdrop-filter', bf, 'important'); e.style.setProperty('-webkit-backdrop-filter', bf, 'important');
    e.__lgF = f;
    return f;
  }
  function unmountAll() {
    glassSet.forEach(function (e) { e.style.removeProperty('backdrop-filter'); e.style.removeProperty('-webkit-backdrop-filter'); e.__lgSig = null; });
  }

  /* ---- springs ------------------------------------------------------------------------------------------------------
     A damped spring from 0 to 1 sampled at 60 fps until it rests: the same curve every motion uses, so everything moves
     like one material. Returns [{t, x, v}] with t in ms. */
  function spring(stiff, damp, mass, v0) {
    var x = 0, v = v0 || 0, dt = 1 / 120, out = [{ t: 0, x: 0, v: v }], t = 0;
    for (var i = 0; i < 1200; i++) {
      var a = (-stiff * (x - 1) - damp * v) / (mass || 1); v += a * dt; x += v * dt; t += dt;
      if (i % 2 === 1) out.push({ t: t * 1000, x: x, v: v });
      if (Math.abs(x - 1) < 0.0006 && Math.abs(v) < 0.004 && t > 0.1) break;
    }
    out[out.length - 1].x = 1; return out;
  }
  var LIQUID = [230, 19, 1];   /* a lively spring: one clear overshoot, a small second one */
  var SOFT = [170, 22, 1];

  /* ---- lenses: the chosen item sits under a clear magnifying lens that moves like a drop -------------------------- */
  var STRIPS = [
    { sel: 'nav.page-tabs', items: '.page-tab', scrub: true },
    { sel: '#pmuRange', items: ':scope > button', scrub: true },
    { sel: '#pmuNav', items: '.pmu-navbtn', vertical: true, solo: true },
    { sel: '#sidePanelSlot .pm-segtab', items: '.pm-segtab-item', many: true, scrub: true },
    { sel: '#activityBar', items: '.icon[data-target]', vertical: true, solo: true, pick: railIcon, box: function (i) { return i.querySelector('.symbol') || i; } },
  ];
  function railIcon(strip) {
    var sp = document.getElementById('sidePanelSlot'); if (!sp || !visible(sp)) return null;
    var v = sp.querySelector(':scope > .side-panel-view.active');
    var icon = v && strip.querySelector('.icon[data-target="' + v.id + '"]');
    strip.querySelectorAll('.icon[data-lg-current]').forEach(function (i) { if (i !== icon) i.removeAttribute('data-lg-current'); });
    if (icon) icon.setAttribute('data-lg-current', ''); return icon;
  }
  /* A lens that refracts lives in its own layer above the strips (#lg-lenses), not inside them: Chrome hides a glass
     element's backdrop from its children, so a lens nested in a glass bar could see only the bar's labels over black.
     From outside it sees the bar, the wallpaper and the label together, and magnifies them as one. A standalone choice
     (activity bar, Usage navigation) is an accent fill with a lit rim, kept inside its list. */
  var lenses = new Map(), layer = null;
  function lensLayer() {
    if (layer && layer.isConnected) return layer;
    layer = el('div', { id: 'lg-lenses', 'aria-hidden': 'true' });
    (document.querySelector('.app-shell') || document.body).appendChild(layer); return layer;
  }
  function rectIn(strip, t, cfg) {
    var r = t.getBoundingClientRect();
    if (!cfg.solo) { var lr = lensLayer().getBoundingClientRect(); return { x: r.left - lr.left, y: r.top - lr.top, w: r.width, h: r.height }; }
    var sr = strip.getBoundingClientRect();
    return { x: r.left - sr.left - strip.clientLeft + strip.scrollLeft, y: r.top - sr.top - strip.clientTop + strip.scrollTop, w: r.width, h: r.height };
  }
  function lensFor(strip, cfg) {
    var L = lenses.get(strip);
    if (L && L.lens.isConnected) return L;
    var lens = el('i', { class: 'lg-lens', 'aria-hidden': 'true' });
    if (cfg.solo) { lens.setAttribute('data-lg-solo', ''); if (getComputedStyle(strip).position === 'static') strip.style.position = 'relative'; strip.appendChild(lens); }
    else lensLayer().appendChild(lens);
    L = { lens: lens, rect: null, anim: null, cfg: cfg }; lenses.set(strip, L); return L;
  }
  function setLensBox(L, R) {
    var s = L.lens.style; s.left = R.x + 'px'; s.top = R.y + 'px'; s.width = R.w + 'px'; s.height = R.h + 'px'; L.rect = R;
    mount(L.lens, L.cfg.solo ? 'sel' : 'lens');
  }
  /* travel from A to B: the drop lifts (grows a little and magnifies more), stretches along its path with its speed,
     thins across it, overshoots and wobbles once, all from one spring */
  function travel(L, A, B, vertical) {
    if (L.anim) L.anim.cancel();
    setLensBox(L, B);
    var S = spring.apply(null, LIQUID), dist = vertical ? B.y - A.y : B.x - A.x, frames = [];
    var sw = A.w / B.w, shh = A.h / B.h;
    for (var i = 0; i < S.length; i++) {
      var p = S[i].x, v = S[i].v, sp = Math.min(1, Math.abs(v) * Math.abs(dist) / 2600);
      var off = (1 - p) * -dist, lift = 1 + 0.10 * Math.sin(Math.min(1, S[i].t / 260) * Math.PI);
      var w = (sw + (1 - sw) * Math.min(1, p)) * lift, h = (shh + (1 - shh) * Math.min(1, p)) * lift;
      var along = 1 + sp * 0.55, across = 1 - sp * 0.22;
      var sx = (vertical ? w * across : w * along), sy = (vertical ? h * along : h * across);
      frames.push({ offset: S[i].t / S[S.length - 1].t, transform: (vertical ? 'translate3d(0,' : 'translate3d(') + off.toFixed(2) + (vertical ? 'px,0)' : 'px,0,0)') + ' scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')' });
    }
    L.anim = L.lens.animate(frames, { duration: S[S.length - 1].t, easing: 'linear' });
    var f = L.lens.__lgF, base = f && f.scale;
    if (f) { var t0 = performance.now(), dur = S[S.length - 1].t; (function tick() { var k = Math.min(1, (performance.now() - t0) / dur), boost = 1 + 0.6 * Math.sin(k * Math.PI); var dm = f.el.querySelectorAll('feDisplacementMap'); dm.forEach(function (n, j) { n.setAttribute('scale', (base * boost * (dm.length === 3 ? [0.9, 1, 1.1][j] : 1)).toFixed(1)); }); if (k < 1 && L.anim) requestAnimationFrame(tick); })(); }
    L.anim.onfinish = function () { L.anim = null; };
  }
  function syncStrip(cfg, strip) {
    var L = lensFor(strip, cfg);
    var target = cfg.pick ? cfg.pick(strip) : strip.querySelector(cfg.items + '.active');
    if (!target || !visible(target) || !visible(strip)) { L.lens.style.opacity = '0'; L.rect = null; return; }
    L.lens.style.opacity = '';
    var R = rectIn(strip, cfg.box ? cfg.box(target) : target, cfg), A = L.rect;
    if (L.dragging) return;
    if (!A || reduced() || !isGlass()) { if (A && reduced()) L.lens.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 140 }); setLensBox(L, R); return; }
    if (Math.abs(A.x - R.x) < 0.5 && Math.abs(A.y - R.y) < 0.5 && Math.abs(A.w - R.w) < 0.5 && Math.abs(A.h - R.h) < 0.5) return;
    travel(L, A, R, !!cfg.vertical || Math.abs(A.y - R.y) > Math.abs(A.x - R.x));
  }
  /* scrubbing: press on a tab strip and slide; the lens lifts and follows the pointer like a drop of water, magnifying
     each tab it passes, and drops into the nearest tab on release (which then becomes the chosen one) */
  function scrubbing(e) {
    if (!isGlass() || e.button !== 0 || reduced()) return;
    for (var i = 0; i < STRIPS.length; i++) {
      var cfg = STRIPS[i]; if (!cfg.scrub) continue;
      var strip = e.target.closest && e.target.closest(cfg.sel); if (!strip) continue;
      var L = lenses.get(strip); if (!L || !L.rect) return;
      var sx = e.clientX, moved = false, items = Array.prototype.slice.call(strip.querySelectorAll(cfg.items)).filter(visible);
      var onMove = function (ev) {
        var dx = ev.clientX - sx;
        if (!moved && Math.abs(dx) < 6) return;
        if (!moved) { moved = true; L.dragging = true; if (L.anim) L.anim.cancel(); L.lens.setAttribute('data-lg-lifted', ''); }
        var sr = strip.getBoundingClientRect(), lr = lensLayer().getBoundingClientRect(), x = ev.clientX - sr.left - L.rect.w / 2;
        var lo = 0, hi = strip.clientWidth - L.rect.w; if (x < lo) x = lo - Math.sqrt(lo - x) * 2; if (x > hi) x = hi + Math.sqrt(x - hi) * 2;
        L.lens.style.transform = 'translate3d(' + (sr.left - lr.left + x - L.rect.x).toFixed(1) + 'px,0,0) scale(1.14,1.16)';
        ev.preventDefault();
      };
      var onUp = function (ev) {
        document.removeEventListener('pointermove', onMove, true); document.removeEventListener('pointerup', onUp, true);
        if (!moved) return;
        var sr = strip.getBoundingClientRect(), best = null, bd = 1e9;
        items.forEach(function (it) { var r = it.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - ev.clientX); if (d < bd) { bd = d; best = it; } });
        var cur = L.lens.getBoundingClientRect(), lr2 = lensLayer().getBoundingClientRect(), from = { x: cur.left - lr2.left + (cur.width - L.rect.w) / 2, y: L.rect.y, w: L.rect.w, h: L.rect.h };
        L.lens.style.transform = ''; L.lens.removeAttribute('data-lg-lifted'); L.dragging = false;
        if (best && !best.classList.contains('active')) { L.rect = from; best.click(); } else { travel(L, from, L.rect, false); }
        var swallow = function (ce) { ce.stopPropagation(); ce.preventDefault(); document.removeEventListener('click', swallow, true); };
        document.addEventListener('click', swallow, true); setTimeout(function () { document.removeEventListener('click', swallow, true); }, 0);
      };
      document.addEventListener('pointermove', onMove, true); document.addEventListener('pointerup', onUp, true);
      return;
    }
  }
  document.addEventListener('pointerdown', scrubbing, true);

  /* ---- the surfaces: which elements are glass, and of which kind ------------------------------------------------ */
  var SURFACES = [
    ['.title-bar', 'bar'], ['.left-panel', 'panel'], ['#chatPanel', 'panel'], ['#panel-usage .pmu-rail', 'panel'],
    ['#panel-usage .pmu-stagehead', 'bar'], ['#panel-usage .pmu-board > .pmu-card', 'card'],
    ['#pm7GlobalStatusBar', 'bar'], ['.pmu-pop.open', 'menu'], ['.pmr-menu-list', 'menu'], ['#lg-demo-pop[data-open]', 'menu'],
  ];
  function segTracks() {   /* the rail's tab strips get a track element to be the glass (the strip itself is a full-width plate) */
    document.querySelectorAll('#sidePanelSlot .pm-segtab').forEach(function (s) {
      if (!s.querySelector(':scope > .pm-segtab-track')) { var t = el('i', { class: 'pm-segtab-track', 'aria-hidden': 'true' }); s.insertBefore(t, s.firstChild); }
    });
  }
  function syncSurfaces() {
    segTracks();
    SURFACES.forEach(function (p) { document.querySelectorAll(p[0]).forEach(function (e) { if (visible(e)) mount(e, p[1]); }); });
  }

  /* ---- light: the pointer's shine on the rims, and the press ------------------------------------------------------- */
  var ptr = null, ptrQ = false, lit = null;
  function onPtr() {
    ptrQ = false; if (!ptr || !isGlass()) return;
    var g = ptr.t && ptr.t.closest ? ptr.t.closest('.lg-g') : null;
    if (g !== lit) { if (lit) lit.removeAttribute('data-lg-lit'); lit = g; if (g) g.setAttribute('data-lg-lit', ''); }
    if (document.querySelector('#panel-usage .pmu-card:is([data-lifted],[data-settling])')) return;
    glassSet.forEach(function (e) {
      if (!e.isConnected) { glassSet.delete(e); return; }
      var r = e.getBoundingClientRect();
      if (ptr.x < r.left - 160 || ptr.x > r.right + 160 || ptr.y < r.top - 160 || ptr.y > r.bottom + 160) { if (e.__lgNear) { e.__lgNear = false; e.style.setProperty('--lg-shine', '0'); } return; }
      e.__lgNear = true;
      e.style.setProperty('--lg-mx', (ptr.x - r.left).toFixed(0) + 'px'); e.style.setProperty('--lg-my', (ptr.y - r.top).toFixed(0) + 'px'); e.style.setProperty('--lg-shine', '1');
    });
  }
  document.addEventListener('pointermove', function (e) { ptr = { x: e.clientX, y: e.clientY, t: e.target }; if (!ptrQ) { ptrQ = true; requestAnimationFrame(onPtr); } }, { passive: true });
  document.addEventListener('pointerdown', function (e) {
    if (!isGlass() || e.button !== 0) return;
    var g = e.target.closest && e.target.closest('.lg-g[data-lg-kind="control"], .lg-g[data-lg-kind="track"], .page-tab, #pmuRange > button, .pmu-navbtn, #activityBar .icon, .pm-segtab-item');
    if (!g || reduced()) return;
    var r = g.getBoundingClientRect(), glow = el('i', { class: 'lg-press', 'aria-hidden': 'true' });
    glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px';
    document.body.appendChild(glow);
    var S = spring(380, 14, 1), fr = S.map(function (s) { return { offset: s.t / S[S.length - 1].t, transform: 'scale(' + (1 + 0.035 * Math.sin(Math.min(1, s.t / 120) * Math.PI) + 0.02 * (1 - s.x) * Math.sin(s.t / 22)).toFixed(4) + ')' }; });
    g.animate(fr, { duration: S[S.length - 1].t, easing: 'linear', composite: 'add' });
    glow.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0.95 }, { transform: 'translate(-50%,-50%) scale(' + (Math.max(r.width, r.height) / 18).toFixed(1) + ')', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = function () { glow.remove(); };
  }, true);

  /* ---- morph: a menu pours out of its control ------------------------------------------------------------------ */
  var lastPress = null;
  document.addEventListener('pointerdown', function (e) { lastPress = e.target.closest && e.target.closest('button, [role="button"], .pm6-tb-menu-trigger, .pmu-ctlbtn'); }, true);
  function morph(menu, anchor) {
    if (!isGlass() || !visible(menu) || menu.__lgMorphed) return;
    menu.__lgMorphed = true;
    if (reduced()) { menu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140 }); return; }
    var m = menu.getBoundingClientRect(), a = anchor && anchor.isConnected ? anchor.getBoundingClientRect() : { left: m.left, top: m.top, width: 40, height: 30 };
    var S = spring.apply(null, LIQUID), frames = [];
    var sx0 = a.width / m.width, sy0 = a.height / m.height, tx0 = a.left - m.left, ty0 = a.top - m.top;
    for (var i = 0; i < S.length; i++) {
      var p = S[i].x, sx = sx0 + (1 - sx0) * p, sy = sy0 + (1 - sy0) * p;
      frames.push({ offset: S[i].t / S[S.length - 1].t, transform: 'translate3d(' + (tx0 * (1 - p)).toFixed(1) + 'px,' + (ty0 * (1 - p)).toFixed(1) + 'px,0) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')' });
    }
    menu.style.transformOrigin = '0 0';
    menu.animate(frames, { duration: S[S.length - 1].t, easing: 'linear' });
    Array.prototype.slice.call(menu.children, 0, 30).forEach(function (k, i) { k.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 110 + i * 10, easing: 'ease-out', fill: 'backwards' }); });
  }
  function lensesUnder(menus) {
    lenses.forEach(function (L) {
      if (L.cfg.solo || !L.rect) return;
      var r = L.lens.getBoundingClientRect(), hit = menus.some(function (m) { return r.right > m.left && r.left < m.right && r.bottom > m.top && r.top < m.bottom; });
      L.lens.classList.toggle('lg-under', hit);
    });
  }
  function scanMenus() {
    var open = Array.prototype.slice.call(document.querySelectorAll('.pmu-pop.open, .pmr-menu-list, #lg-demo-pop[data-open]')).filter(visible).map(function (m) { return m.getBoundingClientRect(); });
    lensesUnder(open);
    document.querySelectorAll('.pmu-pop').forEach(function (m) { if (m.classList.contains('open')) { mount(m, 'menu'); morph(m, document.querySelector('.pmu-menu-anchor-open') || lastPress); } else m.__lgMorphed = false; });
    document.querySelectorAll('.pmr-menu-list').forEach(function (m) { if (visible(m)) { mount(m, 'menu'); morph(m, lastPress); } else m.__lgMorphed = false; });
  }

  /* ---- materialize: glass arrives by ramping its refraction and its frost, not by fading ---------------------------- */
  function materialize(list) {
    if (!gpu() || reduced()) return;
    var t0 = performance.now(), recs = [];
    list.forEach(function (e, i) { var f = e.__lgF; if (f) recs.push({ f: f, e: e, delay: i * 28 }); });
    (function tick() {
      var now = performance.now(), live = false;
      recs.forEach(function (r) {
        var k = Math.max(0, Math.min(1, (now - t0 - r.delay) / 520)), e2 = 1 - Math.pow(1 - k, 3);
        r.f.el.querySelectorAll('feDisplacementMap').forEach(function (n, j, all) { n.setAttribute('scale', (r.f.scale * (1.8 - 0.8 * e2) * e2 * (all.length === 3 ? [0.9, 1, 1.1][j] : 1)).toFixed(1)); });
        if (k < 1) live = true;
      });
      if (live) requestAnimationFrame(tick);
    })();
  }

  /* ---- sync -------------------------------------------------------------------------------------------------------- */
  var syncQ = false, lazyT = 0;
  function syncAll() {
    syncQ = false;
    if (!isGlass()) { unmountAll(); return; }
    syncSurfaces();
    STRIPS.forEach(function (cfg) { (cfg.many ? document.querySelectorAll(cfg.sel) : [document.querySelector(cfg.sel)]).forEach(function (s) { if (s) syncStrip(cfg, s); }); });
    scanMenus();
  }
  function queueSync() { if (!syncQ) { syncQ = true; requestAnimationFrame(syncAll); } }
  function lazySync() { if (!lazyT) lazyT = setTimeout(function () { lazyT = 0; queueSync(); }, 140); }
  var HOT = '.page-tab, #pmuRange > button, .pmu-navbtn, .pm-segtab-item, #activityBar .icon, .side-panel-view, .pmu-pop, .pmr-menu-list, .pmr-menu-group';
  var lastPage = null, lastTheme = root.getAttribute('data-theme'), lastLg = root.getAttribute('data-lg');
  var mo = new MutationObserver(function (recs) {
    var hot = false;
    for (var i = 0; i < recs.length && !hot; i++) {
      var t = recs[i].target; if (t.nodeType !== 1) continue;
      if (t.matches(HOT)) hot = true;
      else for (var j = 0; j < recs[i].addedNodes.length; j++) { var nd = recs[i].addedNodes[j]; if (nd.nodeType === 1 && (nd.matches(HOT) || nd.matches('.pmu-card') || (nd.querySelector && nd.querySelector('.pmr-menu-list, .pmu-card')))) { hot = true; break; } }
    }
    var page = document.querySelector('.page-tabs .page-tab.active'); page = page && page.id;
    if (hot && isGlass()) syncAll(); else lazySync();
    if (page !== lastPage) { var first = lastPage === null; lastPage = page; if (!first) setTimeout(function () { syncAll(); materialize(Array.prototype.slice.call(document.querySelectorAll('#panel-usage .pmu-card.lg-g, #panel-usage .pmu-rail.lg-g'))); }, 30); }
  });
  new MutationObserver(function () {
    var th = root.getAttribute('data-theme'), lg = root.getAttribute('data-lg');
    if (th !== lastTheme || lg !== lastLg) {
      var enter = isGlass() && (!/^glass/.test(lastTheme || '') || lastLg !== 'on');
      lastTheme = th; lastLg = lg; lenses.forEach(function (L) { L.rect = null; });
      glassSet.forEach(function (e) { e.__lgSig = null; });
      syncAll(); if (enter) materialize(Array.from(glassSet));
    } else queueSync();
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-lg', 'data-lg-tier', 'data-lg-wall', 'data-motion'] });
  window.addEventListener('blur', function () { root.setAttribute('data-lg-inactive', ''); });
  window.addEventListener('focus', function () { root.removeAttribute('data-lg-inactive'); });

  function start() {
    ensureDefs();
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden', 'data-open'] });
    if (window.ResizeObserver) { var ro = new ResizeObserver(lazySync); ['.app-shell', '.left-panel', '#sidePanelSlot', '#chatPanel', '#pmuBoard', '#pmuApp'].forEach(function (s) { var e = document.querySelector(s); if (e) ro.observe(e); }); }
    window.addEventListener('resize', lazySync);
    demo();
    syncAll(); setTimeout(syncAll, 500); setTimeout(syncAll, 1500);
    if (isGlass()) setTimeout(function () { syncAll(); materialize(Array.from(glassSet)); }, 700);
    firstVisit();
  }
  function firstVisit() {
    var KEY = 'pm-lg2-concept-seen';
    try { if (localStorage.getItem(KEY) || q.get('lgkeep') === '1') return; localStorage.setItem(KEY, '1'); } catch (e) { return; }
    var n = 0; (function go() { if (window.PM12_KIMI && window.PM_PAGES) { if (!/^glass/.test(root.getAttribute('data-theme') || '')) window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Glass Dark'); window.PM_PAGES.go('usage'); } else if (++n < 60) setTimeout(go, 250); })();
  }

  /* ---- the concept's own control (status bar) -------------------------------------------------------------------- */
  function demo() {
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
      row('Wallpaper', 'data-lg-wall', [['ribbons', 'Ribbons', set('data-lg-wall', 'ribbons')], ['prism', 'Prism', set('data-lg-wall', 'prism')], ['orbs', 'Orbs', set('data-lg-wall', 'orbs')]]),
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

  window.PM_LG = { version: 'v2-2026-10-11', sync: syncAll, materialize: function () { materialize(Array.from(glassSet)); }, kinds: KINDS, count: function () { return glassSet.size; },
    set: function (o) { for (var k in o) { if (o[k] == null) root.removeAttribute(k); else root.setAttribute(k, o[k]); } syncAll(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
