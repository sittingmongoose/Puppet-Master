/* Glass grounds (round 3, Jared 2026-10-14: "do the glass themed ones have actual glass ones?"): glass itself, not
   washes of colour. Frosted panes, layered sheets with thick refracting edges, rain on glass (still, and running), a
   lens that magnifies what lies under it, and etched glass; and (round 3b) four plain sheets with nothing drawn on them:
   clear, frosted, tinted and reeded glass.

   The light is Liquid Glass's (pm7-liquid-glass's CONTRACT.md): neutral white catch lights and hairlines, never split
   into colours, a lens bending little. Every pane, edge and drop is drawn in this scheme's colours and goes at most as far
   from its ground as keeps the text readable (43-grounds.js's pool), so the worst pixel needs no veil, and the same design
   works in every look: under Glass the ground is laid at Glass's own opacity over the app, so the app shows through the
   panes; under Basic, Friendly, Retro or NieR the terminal is opaque and the panes are glass laid on the scheme's ground.
   Painted once per size step, cached; nothing here animates except Running rain's layer, which only moves by
   transform. */
(function () {
  'use strict';
  var G = T.Grounds; if (!G || !G.kit) return;
  var K = G.kit, C = T.color, def = K.def, PAINT = K.PAINT, hex = K.hex, rgba = K.rgba, rng = K.rng, pool = K.pool, tone = K.tone, isDark = K.isDark;

  /* glass light in this scheme. On a dark ground: white light, as bright as the light text allows, and shadow, which only
     deepens the ground. On a light ground the reverse: white panes and rims, which only lift it (dark text then reads
     better still), while the shaded edges and shadows go only as far as the text allows, so on a scheme with no contrast
     to spare (Tokyo Night Day's 4.52:1) glass is drawn in white light alone */
  /* how far toward c the ground can go with the text still at 4.8:1 (or the scheme's own), with no cap: for grain, which
     is fine enough that the washes' 20 % cap on a light ground would make it invisible */
  function far(th, c) {
    var want = Math.min(C.contrast(th.fg, th.bg), 4.8) + 0.12, lo = 0, hi = 1;
    if (C.contrast(th.fg, C.mix(th.bg, c, 1)) >= want) return 1;
    for (var i = 0; i < 14; i++) { var m = (lo + hi) / 2; if (C.contrast(th.fg, C.mix(th.bg, c, m)) >= want) lo = m; else hi = m; }
    return lo;
  }
  function ink(th) {
    var dark = isDark(th), shade = K.poolRaw(th, C.hex('#1e2d5a'), 1);
    /* no room to darken (the shade is the ground itself): no shadows at all, which a GPU canvas would draw a unit or two
       under the ground */
    var room = dark || C.contrast(shade, th.bg) > 1.04;
    /* on a near-white ground white light does not show (round 3b: Basic light's plain glass read as no glass at all): there
       glass is drawn as it looks on white paper, in a cool grey-blue, as far as the text allows */
    var paper = !dark && C.contrast(0xffffff, th.bg) < 1.25;
    var tintTo = function (hex6, f) { var c = C.hex(hex6); return C.mix(th.bg, c, far(th, c) * f); };
    return {
      dark: dark,
      film: dark ? pool(th, 0xffffff, 0.62) : paper ? tintTo('#c4cfe0', 0.45) : C.mix(th.bg, 0xffffff, 0.55),
      hi: dark ? pool(th, 0xffffff, 1) : paper ? tintTo('#8c9fbd', 0.5) : 0xffffff,
      lo: dark ? tone(th.bg, -0.07) : K.poolRaw(th, C.hex('#2e3a55'), 0.85),
      frost: dark ? pool(th, 0xffffff, 1) : paper ? tintTo('#7f93b3', 0.6) : 0xffffff,
      shadow: dark ? 'rgba(0,0,0,.38)' : room ? rgba(shade, 0.5) : 'rgba(0,0,0,0)',
      dropShade: dark ? 'rgba(0,0,0,.22)' : room ? rgba(shade, 0.35) : 'rgba(0,0,0,0)'
    };
  }
  function rr(g, x, y, w, h, r) {
    g.beginPath(); r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  /* frost: a fine speckle of light, in the brightest colour the text allows (white on a light ground), one tile per colour */
  var frostTiles = {};
  function frost(g, w, h, k, alpha) {
    var key = String(k.frost), tl = frostTiles[key];
    if (!tl) {
      tl = frostTiles[key] = document.createElement('canvas'); tl.width = tl.height = 128;
      var c = tl.getContext('2d', { willReadFrequently: true }), img = c.createImageData(128, 128), d = img.data, R = rng(91);
      for (var i = 0; i < d.length; i += 4) { d[i] = C.r(k.frost); d[i + 1] = C.g(k.frost); d[i + 2] = C.b(k.frost); d[i + 3] = Math.round(R() * R() * 120); }
      c.putImageData(img, 0, 0);
    }
    g.save(); g.globalAlpha = alpha; g.fillStyle = g.createPattern(tl, 'repeat'); g.fillRect(0, 0, w, h); g.restore();
  }
  /* the scheme's hues, quietly, behind the glass: something for it to frost, bend and catch */
  function backdrop(g, W, H, th, h, f) {
    g.fillStyle = hex(th.bg); g.fillRect(0, 0, W, H);
    [[0.82, 0.78, h.a, 0.6], [0.55, 1.05, h.b, 0.5], [0.98, 0.2, h.c, 0.4]].forEach(function (p) {
      var gr = g.createRadialGradient(W * p[0], H * p[1], 0, W * p[0], H * p[1], Math.max(W, H) * p[3]);
      gr.addColorStop(0, hex(pool(th, p[2], f))); gr.addColorStop(1, rgba(th.bg, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    });
  }
  /* a pane of glass: its shadow, its film, frost, a sheen, a lit top edge and a shaded lower one */
  function pane(g, k, x, y, w, h, r, opts) {
    opts = opts || {};
    g.save();
    g.shadowColor = k.shadow; g.shadowBlur = opts.shadow === undefined ? 22 : opts.shadow; g.shadowOffsetY = 6;
    rr(g, x, y, w, h, r); g.fillStyle = rgba(k.film, opts.film === undefined ? 0.62 : opts.film); g.fill();
    g.shadowColor = 'transparent';
    g.save(); rr(g, x, y, w, h, r); g.clip();
    if (opts.frost) frost(g, x + w + 4, y + h + 4, k, opts.frost);
    var sh = g.createLinearGradient(x, y, x + w * 0.55, y + h); sh.addColorStop(0, rgba(k.hi, k.dark ? 0.32 : 0.55)); sh.addColorStop(0.45, rgba(k.hi, 0)); g.fillStyle = sh; g.fillRect(x, y, w, h);
    g.restore();
    /* edges: the whole rim in hairline, the top lit, the bottom shaded (a pane has a thickness) */
    rr(g, x + 0.5, y + 0.5, w - 1, h - 1, r); g.lineWidth = 1; g.strokeStyle = rgba(k.hi, k.dark ? 0.55 : 0.9); g.stroke();
    g.save(); g.beginPath(); g.rect(x - 2, y + h * 0.55, w + 4, h); g.clip();
    rr(g, x + 0.5, y + 0.5, w - 1, h - 1, r); g.lineWidth = 1.5; g.strokeStyle = rgba(k.lo, 0.9); g.stroke(); g.restore();
    if (opts.thick) { rr(g, x + opts.thick, y + opts.thick, w - opts.thick * 2, h - opts.thick * 2, Math.max(0, r - opts.thick)); g.lineWidth = 1; g.strokeStyle = rgba(k.hi, k.dark ? 0.22 : 0.5); g.stroke(); }
    g.restore();
  }

  /* Frosted panes: three sheets of frosted glass floating over the right of the terminal, the top left left calm */
  PAINT['frosted'] = function (g, W, H, th, h) {
    var k = ink(th), s = Math.min(W, H);
    backdrop(g, W, H, th, h, 0.7);
    [[0.5, 0.14, 0.44, 0.58, -0.035], [0.66, 0.42, 0.3, 0.5, 0.03], [0.36, 0.56, 0.3, 0.36, -0.015]].forEach(function (p) {
      var w = W * p[2], hh = H * p[3], x = W * p[0], y = H * p[1];
      g.save(); g.translate(x + w / 2, y + hh / 2); g.rotate(p[4]); g.translate(-(x + w / 2), -(y + hh / 2));
      pane(g, k, x, y, w, hh, Math.min(18, s * 0.05), { frost: k.dark ? 0.55 : 0.4, film: 0.55 });
      g.restore();
    });
  };
  /* Layered sheets: tilted sheets stacked out of the lower right, each with the bright double line of a thick edge */
  PAINT['sheets'] = function (g, W, H, th, h) {
    var k = ink(th), s = Math.min(W, H);
    backdrop(g, W, H, th, h, 0.55);
    for (var i = 0; i < 4; i++) {
      var w = W * (0.5 - i * 0.06), hh = H * (0.66 - i * 0.07), x = W * (0.46 + i * 0.09), y = H * (0.3 + i * 0.12);
      g.save(); g.translate(x + w / 2, y + hh / 2); g.rotate(-0.16 + i * 0.03); g.translate(-(x + w / 2), -(y + hh / 2));
      pane(g, k, x, y, w, hh, Math.min(16, s * 0.045), { film: 0.34, thick: 4, shadow: 14 });
      g.restore();
    }
  };
  /* Rain on glass: drops that hold the light the other way up (dark above, bright below, as a lens does), a glint on
     each, and the trails left where some ran */
  function drop(g, k, x, y, r, th) {
    g.save();
    g.fillStyle = k.dropShade; g.beginPath(); g.ellipse(x, y + r * 0.28, r * 1.02, r * 0.95, 0, 0, Math.PI * 2); g.fill();
    var gr = g.createLinearGradient(x, y - r, x, y + r);
    gr.addColorStop(0, hex(k.dark ? tone(th.bg, -0.05) : K.poolRaw(th, C.hex('#2e3a55'), 0.5))); gr.addColorStop(0.55, hex(k.film)); gr.addColorStop(1, hex(k.hi));
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * 0.94, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = Math.max(0.6, r * 0.08); g.strokeStyle = rgba(k.hi, k.dark ? 0.35 : 0.8); g.stroke();
    if (r > 1.6) { g.fillStyle = hex(k.hi); g.beginPath(); g.ellipse(x - r * 0.34, y - r * 0.38, r * 0.2, r * 0.14, -0.5, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function drops(g, W, H, th, k, seed, density, wrap) {
    var R = rng(seed), n = Math.round(W * H / density);
    for (var i = 0; i < n; i++) {
      var u = R(), r = u < 0.7 ? 1 + R() * 2 : u < 0.94 ? 3 + R() * 4.5 : 7.5 + R() * 5.5, x = R() * W, y = R() * H;
      if (r > 6 && R() < 0.7) {
        /* a trail above the bigger drops, where they ran */
        g.save(); g.strokeStyle = rgba(k.hi, k.dark ? 0.12 : 0.35); g.lineWidth = r * 0.7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y);
        for (var t = 1; t <= 6; t++) g.lineTo(x + Math.sin(t * 1.7 + x) * r * 0.35, y - t * r * 2.2);
        g.stroke(); g.restore();
      }
      drop(g, k, x, y, r, th);
      if (wrap && y + r > H) drop(g, k, x, y - H, r, th);
      if (wrap && y - r < 0) drop(g, k, x, y + H, r, th);
    }
  }
  PAINT['raindrops'] = function (g, W, H, th, h) {
    var k = ink(th);
    backdrop(g, W, H, th, h, 0.6);
    /* condensation: a faint mist over the glass that the drops have cleared round themselves */
    g.fillStyle = rgba(k.film, k.dark ? 0.18 : 0.22); g.fillRect(0, 0, W, H);
    drops(g, W, H, th, k, 37, 1700, false);
  };
  /* Running rain's pane (round 3b: its own, so it is a design of its own even at rest): fogged over, the fog thicker toward
     the bottom where the water gathers, with a few drops still on it */
  PAINT['fogged'] = function (g, W, H, th, h) {
    var k = ink(th);
    backdrop(g, W, H, th, h, 0.45);
    var fog = g.createLinearGradient(0, 0, 0, H); fog.addColorStop(0, rgba(k.film, k.dark ? 0.22 : 0.3)); fog.addColorStop(1, rgba(k.film, k.dark ? 0.55 : 0.7));
    g.fillStyle = fog; g.fillRect(0, 0, W, H);
    frost(g, W, H, k, k.dark ? 0.35 : 0.3);
    drops(g, W, H, th, k, 53, 6000, false);
  };
  /* Running rain: a sparse layer of drops and their trails that slides down over a fogged pane */
  PAINT['glassrun'] = function (g, W, H, th) {
    var k = ink(th);
    g.clearRect(0, 0, W, H);
    var R = rng(53);
    /* (round 3b: more runs, longer and brighter, so Running rain is its own design even when it rests) */
    for (var i = 0; i < Math.max(8, Math.round(W / 55)); i++) {
      var x = R() * W, y = R() * H, r = 3 + R() * 3.5, len = H * (0.35 + R() * 0.45);
      var run = function (dx) { g.beginPath(); g.moveTo(x + dx, y); for (var t = 1; t <= 10; t++) g.lineTo(x + dx + Math.sin(t * 1.3 + i) * r * 0.4, y - len * t / 10); };
      g.save(); g.lineCap = 'round';
      /* (round 5, Q15: on a pale pane a run of white light barely showed, so Gentle and Lively looked alike. There a run
         clears the fog as it goes: the pane shows through it in the scheme's own ground, never darker than the text
         allows, with the light caught along its edge) */
      if (!k.dark) { g.strokeStyle = rgba(th.bg, 0.9); g.lineWidth = r * 0.9; run(0); g.stroke(); g.strokeStyle = rgba(k.hi, 0.85); g.lineWidth = Math.max(1, r * 0.22); run(r * 0.3); g.stroke(); }
      else { g.strokeStyle = rgba(k.hi, 0.2); g.lineWidth = r * 0.75; run(0); g.stroke(); }
      g.restore();
      drop(g, k, x, y, r, th); if (y - len < 0) drop(g, k, x, y + H, r, th);
    }
  };

  /* ---- the wallpaper behind the terminal, for the lens: the print the app paints (wallpapers.js's contract: the id on
     html[data-lg-wall], its image in --lg-wall-<id>-<mode>), loaded once per print; never body's computed image, which can
     hold the previous print for a moment while a choice is in flight.
     Where it comes from: the app's cache first (PM_WALLPAPERS.sourceUrl(id, mode): the URL, undefined while not cached,
     null for no image), which reads no style. Only when that does not know ('' is taken as not known too, and so is a
     host without it) is the print's custom property read, and only by a lens that is drawing, never by the watch on the
     root: that read is a whole-app style recalc (about 98 ms on every wallpaper pick, pm7-motion-settings' trace) ---- */
  var wall = { key: '', img: null, loading: '' };
  /* the print a lens would show now, from the root's attributes alone: '<id>-<light|dark>', or '' for none */
  function wallKey() {
    var root = document.documentElement, theme = root.getAttribute('data-theme') || '';
    if (root.getAttribute('data-o55-nier') === 'on') return '';
    var id = root.getAttribute('data-lg-wall') || '';
    if (!id || (!/^glass/.test(theme) && !root.hasAttribute('data-lg-wall-any'))) return '';
    return id + '-' + (/-light$/.test(theme) ? 'light' : 'dark');
  }
  function wallCached(key) {
    var W = window.PM_WALLPAPERS, i = key.lastIndexOf('-'), u;
    if (W && typeof W.sourceUrl === 'function') { try { u = W.sourceUrl(key.slice(0, i), key.slice(i + 1)); } catch (e) { u = undefined; } }
    return u === null || (typeof u === 'string' && u) ? u : undefined;
  }
  function wallLoad(key, url) {
    wall.loading = key;
    if (!url) { wall.key = key; wall.img = null; return; }
    var img = new Image();
    img.onload = function () { if (wall.loading !== key) return; wall.key = key; wall.img = img; shownSig = key; window.dispatchEvent(new CustomEvent('pmt-wall')); };
    img.onerror = function () { if (wall.loading === key) { wall.key = key; wall.img = null; } };
    img.src = url;
  }
  /* for a lens that is drawing: the print, once loaded (null until then, and for none) */
  function wallNow() {
    var key = wallKey();
    if (!key) return null;
    if (wall.key === key) return wall.img ? wall : null;
    if (wall.loading !== key) {
      var url = wallCached(key);
      if (url === undefined) {
        var v = '';
        try { v = getComputedStyle(document.documentElement).getPropertyValue('--lg-wall-' + key).trim(); } catch (e) {}
        var m = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(v);
        url = m ? m[1] : null;
      }
      wallLoad(key, url);
    }
    return null;
  }
  /* a new print, a print that settled, or a look that shows another: the lenses repaint (and read the print as they
     draw). A print the cache already knows starts loading here, so a lens that appears later has it; nothing here reads
     style */
  var shownSig = '';
  try {
    new MutationObserver(function () {
      var key = wallKey();
      if (key && wall.key !== key && wall.loading !== key) { var url = wallCached(key); if (url !== undefined) wallLoad(key, url); }
      if (key !== shownSig) { shownSig = key; window.dispatchEvent(new CustomEvent('pmt-wall')); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lg-wall', 'data-lg-wall-hold', 'data-lg-wall-any', 'data-theme', 'data-o55-nier'] });
  } catch (e) {}

  /* the band the text allows, as relative luminance: on a dark ground [a little under it, the brightest the text allows];
     on a light ground [the darkest the text allows, white] */
  var lin = function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  var srgb = function (v) { v = Math.max(0, Math.min(1, v)); return Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255); };
  function toneInto(g, x0, y0, x1, y1, th) {
    var w = x1 - x0, h = y1 - y0; if (w < 2 || h < 2) return;
    var img = g.getImageData(x0, y0, w, h), d = img.data, dark = isDark(th), Yb = C.lum(th.bg);
    /* a hair inside the band's edges: a pixel that keeps its hue at exactly the ground's light can round a unit darker */
    var lo = dark ? Yb * 0.55 : Math.max(Yb, C.lum(K.poolRaw(th, 0x000000, 0.96))) + 0.008, hi = dark ? C.lum(pool(th, 0xffffff, 0.96)) * 0.97 : 1;
    var Ymin = Infinity, Ymax = -Infinity, i, Y;
    for (i = 0; i < d.length; i += 4) { Y = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]); if (Y < Ymin) Ymin = Y; if (Y > Ymax) Ymax = Y; }
    if (Ymin >= lo && Ymax <= hi) return;
    var span = Math.max(1e-6, Ymax - Ymin);
    for (i = 0; i < d.length; i += 4) {
      var r = lin(d[i]), gg = lin(d[i + 1]), b = lin(d[i + 2]); Y = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
      var Yt = lo + (Y - Ymin) / span * (hi - lo);
      if (dark) { var k = Y > 1e-6 ? Yt / Y : 0; if (Y <= 1e-6) { r = gg = b = Yt; } else { r *= k; gg *= k; b *= k; } }
      /* a light ground lifts toward white by the same share, so a clipped channel never darkens a pixel */
      else { var k2 = Y < 1 - 1e-6 ? (1 - Yt) / (1 - Y) : 0; r = 1 - (1 - r) * k2; gg = 1 - (1 - gg) * k2; b = 1 - (1 - b) * k2; }
      d[i] = srgb(r); d[i + 1] = srgb(gg); d[i + 2] = srgb(b);
    }
    g.putImageData(img, x0, y0);
  }

  /* Lens (round 3b, Jared: "The Lens one needs a rework"; round 3's read as a dark ball where no wallpaper shows): a clear
     magnifier lying on the terminal. Under it there is always something to magnify: a faint graph-paper grid in the
     scheme's ink, or, where the app shows a wallpaper, that wallpaper. Through the glass the lines grow and bend toward the
     rim as a real lens bends them, and the disc stays as light as the ground round it (glass gathers light). Around it: a
     bevelled rim lit above and to the left, a soft window highlight, and on the ground below its shadow, with the bright
     ring of light the lens focuses there. Neutral white light only (Liquid Glass's contract) */
  var LENS_M = 1.8, LENS_RIM = 1.14;
  function gridOn(g, W, H, th) {
    /* the scheme's ink where the text still reads over it; otherwise (no room to darken) the same hue paler than the ground */
    var cell = 22, room = C.contrast(th.fg, K.ink(th, 0.085)) >= Math.min(C.contrast(th.fg, th.bg), 4.8) - 0.01;
    var minor = room ? K.ink(th, 0.045) : K.inkFor(th, th.fg, 0.5), major = room ? K.ink(th, 0.085) : K.inkFor(th, th.fg, 0.95);
    g.lineWidth = 1;
    for (var pass = 0; pass < 2; pass++) {
      g.strokeStyle = hex(pass ? major : minor); g.beginPath();
      for (var x = 0, i = 0; x <= W; x += cell, i++) if ((i % 5 === 0) === !!pass) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, H); }
      for (var y = 0, j = 0; y <= H; y += cell, j++) if ((j % 5 === 0) === !!pass) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(W, Math.round(y) + 0.5); }
      g.stroke();
    }
  }
  /* the disc at (cx, cy), radius R, drawn from src (lens centre at sx, sy in it): magnified LENS_M times at the middle, the
     magnification giving way toward the rim, where it reaches LENS_RIM times the radius (the bend that says "lens") */
  function refract(g, W, H, src, sx, sy, cx, cy, R) {
    var x0 = Math.max(0, Math.floor(cx - R) - 1), y0 = Math.max(0, Math.floor(cy - R) - 1), x1 = Math.min(W, Math.ceil(cx + R) + 1), y1 = Math.min(H, Math.ceil(cy + R) + 1);
    var w = x1 - x0, h = y1 - y0; if (w < 2 || h < 2) return;
    var sw = src.width, sh = src.height, sd = src.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, sw, sh).data;
    var out = g.getImageData(x0, y0, w, h), od = out.data, bend = LENS_M * LENS_RIM - 1;
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      var dx = (x0 + i + 0.5 - cx) / R, dy = (y0 + j + 0.5 - cy) / R, r2 = dx * dx + dy * dy;
      if (r2 >= 1) continue;
      var sc = (1 + bend * r2 * r2) / LENS_M, px = sx + dx * sc * R - 0.5, py = sy + dy * sc * R - 0.5;
      var ix = Math.max(0, Math.min(sw - 2, Math.floor(px))), iy = Math.max(0, Math.min(sh - 2, Math.floor(py))), fx = Math.max(0, Math.min(1, px - ix)), fy = Math.max(0, Math.min(1, py - iy));
      var a = (iy * sw + ix) * 4, b = a + 4, c = a + sw * 4, d = c + 4, o = (j * w + i) * 4;
      /* the last pixel of the rim blends with the ground under it, so the disc's edge is smooth */
      var edge = Math.max(0, Math.min(1, (1 - Math.sqrt(r2)) * R));
      for (var k = 0; k < 3; k++) {
        var v = (sd[a + k] * (1 - fx) + sd[b + k] * fx) * (1 - fy) + (sd[c + k] * (1 - fx) + sd[d + k] * fx) * fy;
        od[o + k] = Math.round(od[o + k] * (1 - edge) + v * edge);
      }
    }
    g.putImageData(out, x0, y0);
  }
  PAINT['lens'] = function (g, W, H, th, h, o) {
    var k = ink(th), dark = k.dark, cx = W * 0.72, cy = H * 0.5, R = Math.min(W * 0.19, H * 0.38), wl = wallNow();
    /* the ground: the scheme's own, a quiet pool of its hue, and the grid */
    g.fillStyle = hex(th.bg); g.fillRect(0, 0, W, H);
    var gr0 = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6); gr0.addColorStop(0, hex(K.inkFor(th, h.a, 0.35))); gr0.addColorStop(1, rgba(th.bg, 0)); g.fillStyle = gr0; g.fillRect(0, 0, W, H);
    gridOn(g, W, H, th);
    /* what the lens sees: the ground as it is, or the app's wallpaper behind this spot (as the app lays it: centre, cover,
       fixed to the viewport, the root's client box), its light squeezed into the band the text allows */
    var src = document.createElement('canvas'), sx = cx, sy = cy;
    if (wl && wl.img && o && o.rect && !o.tile) {
      var S = Math.ceil(R * 2 * LENS_RIM) + 6, img = wl.img, de = document.documentElement, vw = de.clientWidth || W, vh = de.clientHeight || H, scl = Math.max(vw / img.width, vh / img.height);
      var ox = (vw - img.width * scl) / 2, oy = (vh - img.height * scl) / 2, rect = o.rect, per = rect.w / W;
      var px = rect.x + cx * per, py = rect.y + cy / H * rect.h;
      src.width = src.height = S; sx = sy = S / 2;
      var sc2 = src.getContext('2d', { willReadFrequently: true });
      sc2.fillStyle = hex(th.bg); sc2.fillRect(0, 0, S, S);
      sc2.drawImage(img, (px - S / 2 * per - ox) / scl, (py - S / 2 * per - oy) / scl, S * per / scl, S * per / scl, 0, 0, S, S);
      toneInto(sc2, 0, 0, S, S, th);
    } else {
      src.width = W; src.height = H; src.getContext('2d', { willReadFrequently: true }).drawImage(g.canvas, 0, 0);
    }
    /* the shadow on the ground below and to the right, and in it the ring of light the lens focuses */
    var off = R * 0.16, offY = R * 0.26;
    if (k.shadow !== 'rgba(0,0,0,0)') {
      g.save(); if (K.canFilter) g.filter = 'blur(' + Math.round(R * 0.09) + 'px)';
      g.fillStyle = dark ? 'rgba(0,0,0,.34)' : k.shadow; g.beginPath(); g.ellipse(cx + off, cy + offY, R * 1.02, R * 0.98, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    g.save(); if (K.canFilter) g.filter = 'blur(' + Math.max(1, Math.round(R * 0.03)) + 'px)';
    g.strokeStyle = rgba(k.hi, dark ? 0.5 : 0.95); g.lineWidth = Math.max(2, R * 0.06); g.lineCap = 'round';
    g.beginPath(); g.ellipse(cx + off, cy + offY, R * 0.96, R * 0.92, 0, Math.PI * 0.05, Math.PI * 0.62); g.stroke(); g.restore();
    /* the glass itself */
    refract(g, W, H, src, sx, sy, cx, cy, R);
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
    /* light gathered through the curve: a little brighter toward the lower rim, and the thick edge brighter still */
    var lit = g.createRadialGradient(cx + R * 0.1, cy + R * 0.35, 0, cx + R * 0.1, cy + R * 0.35, R);
    lit.addColorStop(0, rgba(k.hi, dark ? 0.1 : 0.35)); lit.addColorStop(1, rgba(k.hi, 0)); g.fillStyle = lit; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    var rim = g.createRadialGradient(cx, cy, R * 0.82, cx, cy, R);
    rim.addColorStop(0, rgba(k.hi, 0)); rim.addColorStop(1, rgba(k.hi, dark ? 0.22 : 0.65)); g.fillStyle = rim; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    /* a window's reflection up and to the left, and a small one low on the right */
    [[-0.38, -0.44, 0.34, 0.13, -0.6, dark ? 0.42 : 0.95], [0.46, 0.5, 0.1, 0.05, -0.6, dark ? 0.22 : 0.7]].forEach(function (q) {
      g.save(); g.translate(cx + q[0] * R, cy + q[1] * R); g.rotate(q[4]); g.scale(q[2] * R, q[3] * R);
      var hg = g.createRadialGradient(0, 0, 0, 0, 0, 1); hg.addColorStop(0, rgba(k.hi, q[5])); hg.addColorStop(1, rgba(k.hi, 0));
      g.fillStyle = hg; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore();
    });
    g.restore();
    /* the bevelled rim: a hairline all round, lit along the upper left, shaded along the lower right */
    g.lineWidth = 1; g.strokeStyle = rgba(k.hi, dark ? 0.55 : 0.95); g.beginPath(); g.arc(cx, cy, R - 0.5, 0, Math.PI * 2); g.stroke();
    g.lineCap = 'round'; g.lineWidth = 2.4; g.strokeStyle = rgba(k.hi, dark ? 0.8 : 1); g.beginPath(); g.arc(cx, cy, R - 2.2, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
    if (dark || k.shadow !== 'rgba(0,0,0,0)') { g.lineWidth = 1.6; g.strokeStyle = rgba(k.lo, 0.85); g.beginPath(); g.arc(cx, cy, R - 2, Math.PI * 0.1, Math.PI * 0.8); g.stroke(); }
  };
  PAINT['lens'].needs = function (o) {
    var wl = wallNow();
    if (!wl || !o || o.tile) return o && o.tile ? 'tile' : 'own';
    var r = o.rect || {};
    return wl.key + '@' + Math.round((r.x || 0) / 24) + ',' + Math.round((r.y || 0) / 24) + ',' + (document.documentElement.clientWidth || 0) + 'x' + (document.documentElement.clientHeight || 0);
  };

  /* ---- plain glass (round 3b, Jared: "a few plain glass ones. Like frosted, see-through, but no graphics"): a whole
     sheet of glass over the terminal and nothing drawn on it, only how the glass itself takes the light ---- */
  /* a sheet's four edges: lit along the top and left, shaded along the bottom and right, and a bevel of light inside the top */
  function sheetEdges(g, W, H, k) {
    var dark = k.dark, bev = g.createLinearGradient(0, 0, 0, 6);
    bev.addColorStop(0, rgba(k.hi, dark ? 0.3 : 0.9)); bev.addColorStop(1, rgba(k.hi, 0)); g.fillStyle = bev; g.fillRect(0, 0, W, 6);
    g.fillStyle = rgba(k.hi, dark ? 0.55 : 1); g.fillRect(0, 0, W, 1); g.fillRect(0, 0, 1, H);
    var shade = dark ? 'rgba(0,0,0,.35)' : k.shadow !== 'rgba(0,0,0,0)' ? rgba(k.lo, 0.7) : null;
    if (shade) { g.fillStyle = shade; g.fillRect(0, H - 1, W, 1); g.fillRect(W - 1, 0, 1, H); }
  }
  function topSheen(g, W, H, k, a) { var t = g.createLinearGradient(0, 0, 0, H * 0.42); t.addColorStop(0, rgba(k.hi, a)); t.addColorStop(1, rgba(k.hi, 0)); g.fillStyle = t; g.fillRect(0, 0, W, H); }
  /* light that is safe on a light ground: anything lighter than it (the dark text reads better still); on a dark one, the
     brightest the light text allows */
  function lighter(th, c, f) { return isDark(th) || C.lum(c) < C.lum(th.bg) ? pool(th, c, f) : C.mix(th.bg, c, f); }

  /* Clear glass: see-through. The ground as it is, the light the sheet catches along its top, and two reflection bands
     across its upper right, the mark of a clean pane */
  PAINT['clear-glass'] = function (g, W, H, th) {
    var k = ink(th), dark = k.dark;
    g.fillStyle = hex(th.bg); g.fillRect(0, 0, W, H);
    topSheen(g, W, H, k, dark ? 0.2 : 0.7);
    g.save(); g.translate(W * 0.6, -H * 0.3); g.rotate(0.6);
    [[0, W * 0.13, dark ? 0.2 : 0.75], [W * 0.18, W * 0.04, dark ? 0.28 : 0.9], [W * 0.26, W * 0.012, dark ? 0.3 : 0.95]].forEach(function (b) {
      var gr = g.createLinearGradient(b[0], 0, b[0] + b[1], 0);
      gr.addColorStop(0, rgba(k.hi, 0)); gr.addColorStop(0.5, rgba(k.hi, b[2])); gr.addColorStop(1, rgba(k.hi, 0));
      g.fillStyle = gr; g.fillRect(b[0], 0, b[1], H * 4);
    });
    g.restore();
    sheetEdges(g, W, H, k);
  };
  /* Frosted glass: the whole sheet frosted. The frost scatters light, so the ground lifts toward white everywhere (more at
     the top, where the light comes in), under a fine speckle and a coarser one */
  PAINT['frost'] = function (g, W, H, th) {
    var k = ink(th), dark = k.dark;
    var gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, hex(C.mix(th.bg, k.film, dark ? 0.5 : 0.75))); gr.addColorStop(1, hex(C.mix(th.bg, k.film, dark ? 0.3 : 0.5)));
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    frost(g, W, H, k, dark ? 0.9 : 0.8);
    g.save(); g.scale(2, 2); frost(g, W / 2, H / 2, k, dark ? 0.45 : 0.4); g.restore();
    sheetEdges(g, W, H, k);
  };
  /* Tinted glass: a sheet with colour in it. On a dark ground, smoked: deeper and greyer, with one broad gloss; on a light
     one, a cool clear blue, lighter than the ground */
  PAINT['tinted'] = function (g, W, H, th) {
    var k = ink(th), dark = k.dark;
    /* a ground already near black cannot be smoked deeper: there the smoke is a grey lighter than it */
    var tint = !dark ? lighter(th, C.hex('#e9f1ff'), 0.85) : C.lum(th.bg) < 0.012 ? pool(th, C.hex('#3a3c42'), 0.75) : C.mix(th.bg, C.hex('#101113'), 0.5);
    var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, hex(dark ? C.mix(tint, k.hi, 0.06) : tint)); gr.addColorStop(1, hex(dark ? C.mix(tint, 0x000000, 0.25) : lighter(th, C.hex('#dfeaff'), 0.85)));
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    /* one broad gloss from the upper left, as tinted glass shows */
    var gl = g.createLinearGradient(0, 0, W * 0.55, H * 1.2);
    gl.addColorStop(0, rgba(k.hi, dark ? 0.12 : 0.6)); gl.addColorStop(0.42, rgba(k.hi, dark ? 0.04 : 0.2)); gl.addColorStop(0.43, rgba(k.hi, 0)); gl.addColorStop(1, rgba(k.hi, 0));
    g.fillStyle = gl; g.fillRect(0, 0, W, H);
    sheetEdges(g, W, H, k);
  };
  /* Reeded glass: fluted glass, a rib every 12 px, each lit on its left and shaded on its right, the text sitting on it as
     on a reeded partition */
  var reedTiles = {};
  PAINT['reeded'] = function (g, W, H, th) {
    var k = ink(th), dark = k.dark, P = 12, key = th.bg + '|' + k.hi + '|' + k.shadow, t = reedTiles[key];
    g.fillStyle = hex(th.bg); g.fillRect(0, 0, W, H);
    if (!t) {
      t = reedTiles[key] = document.createElement('canvas'); t.width = P; t.height = 2;
      var c = t.getContext('2d', { willReadFrequently: true }), gr = c.createLinearGradient(0, 0, P, 0), shade = dark ? 'rgba(0,0,0,.22)' : k.shadow !== 'rgba(0,0,0,0)' ? rgba(k.lo, 0.5) : rgba(k.hi, 0);
      gr.addColorStop(0, rgba(k.hi, dark ? 0.38 : 0.9)); gr.addColorStop(0.3, rgba(k.hi, dark ? 0.08 : 0.25)); gr.addColorStop(0.62, rgba(k.hi, 0)); gr.addColorStop(0.9, shade); gr.addColorStop(1, rgba(k.hi, dark ? 0.06 : 0.3));
      c.fillStyle = gr; c.fillRect(0, 0, P, 2);
    }
    g.fillStyle = g.createPattern(t, 'repeat'); g.fillRect(0, 0, W, H);
    topSheen(g, W, H, k, dark ? 0.08 : 0.35);
    sheetEdges(g, W, H, k);
  };

  /* Etched glass: a frosted panel with a sunburst cut through the frost, each cut catching a thin line of light */
  PAINT['etched'] = function (g, W, H, th, h) {
    var k = ink(th);
    backdrop(g, W, H, th, h, 0.5);
    var x = W * 0.42, y = H * 0.1, w = W * 0.54, hh = H * 0.8, r = Math.min(14, Math.min(W, H) * 0.04);
    var layer = document.createElement('canvas'); layer.width = W; layer.height = H;
    var l = layer.getContext('2d', { willReadFrequently: true });
    rr(l, x, y, w, hh, r); l.fillStyle = rgba(k.film, 0.7); l.fill();
    l.save(); rr(l, x, y, w, hh, r); l.clip(); frost(l, W, H, k, k.dark ? 0.7 : 0.5); l.restore();
    /* the cuts: rays from the panel's lower corner and arcs round it, and a border line inset from the edge */
    var ox = x + w, oy = y + hh, cuts = new Path2D();
    for (var a = 0; a <= 12; a++) { var t = Math.PI + (Math.PI / 2) * a / 12; cuts.moveTo(ox + Math.cos(t) * hh * 0.18, oy + Math.sin(t) * hh * 0.18); cuts.lineTo(ox + Math.cos(t) * hh * 1.6, oy + Math.sin(t) * hh * 1.6); }
    [0.32, 0.5, 0.72, 0.98].forEach(function (q) { cuts.moveTo(ox - hh * q, oy); cuts.arc(ox, oy, hh * q, Math.PI, Math.PI * 1.5); });
    var inset = 12; cuts.moveTo(x + inset + r, y + inset); cuts.rect(x + inset, y + inset, w - inset * 2, hh - inset * 2);
    l.save(); rr(l, x, y, w, hh, r); l.clip();
    l.globalCompositeOperation = 'destination-out'; l.lineWidth = 2.4; l.strokeStyle = '#000'; l.stroke(cuts);
    l.globalCompositeOperation = 'source-over'; l.translate(0.8, 0.8); l.lineWidth = 0.8; l.strokeStyle = rgba(k.hi, k.dark ? 0.4 : 0.9); l.stroke(cuts);
    l.restore();
    rr(l, x + 0.5, y + 0.5, w - 1, hh - 1, r); l.lineWidth = 1; l.strokeStyle = rgba(k.hi, k.dark ? 0.5 : 0.9); l.stroke();
    /* the panel's shadow from its outline alone (a shadow cast by the whole layer cost half a second), then the panel */
    /* (the outline drawn off the canvas, its shadow thrown back into place, so only the shadow lands) */
    var off = W + 200;
    g.save(); g.shadowColor = k.shadow; g.shadowBlur = 18; g.shadowOffsetX = off; g.shadowOffsetY = 5; rr(g, x - off, y, w, hh, r); g.fillStyle = '#000'; g.fill(); g.restore();
    g.drawImage(layer, 0, 0);
  };

  /* the plain ones first (round 3b), then the drawn ones; Glass suggests the plain ones, rain and the lens */
  def('glass', 'clear-glass', 'Clear glass', { looks: ['glass'] });
  def('glass', 'frost', 'Frosted glass', { looks: ['glass'] });
  def('glass', 'tinted', 'Tinted glass', { looks: ['glass'] });
  def('glass', 'reeded', 'Reeded glass', { looks: ['glass'] });
  def('glass', 'frosted', 'Frosted panes', { looks: ['glass'] });
  def('glass', 'sheets', 'Layered sheets', { looks: ['glass'] });
  def('glass', 'raindrops', 'Rain on glass', { looks: ['glass'] });
  def('glass', 'lens', 'Lens', { looks: ['glass'] });
  def('glass', 'etched', 'Etched glass', { looks: ['glass'] });
  /* (round 5, Q15: Lively four times as fast, not twice: on a pale pane twice as fast read as Gentle) */
  def('glass', 'rain-glass', 'Running rain', { motion: { layer: 'glassrun', anim: 'pmt-bg-fall', ms: 16000, lively: 0.25, under: 'fogged' } });
  K.suggest('glass', ['clear-glass', 'frost', 'tinted', 'raindrops', 'lens']);
})();
