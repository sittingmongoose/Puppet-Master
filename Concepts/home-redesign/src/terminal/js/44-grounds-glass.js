/* Glass grounds (round 3, Jared 2026-10-14: "do the glass themed ones have actual glass ones?"): glass itself, not
   washes of colour. Frosted panes, layered sheets with thick refracting edges, rain on glass (still, and running), a
   lens that magnifies the app's own wallpaper behind the terminal, and etched glass.

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
  function ink(th) {
    var dark = isDark(th), shade = pool(th, C.hex('#1e2d5a'), 1);
    return {
      dark: dark,
      film: dark ? pool(th, 0xffffff, 0.62) : C.mix(th.bg, 0xffffff, 0.55),
      hi: dark ? pool(th, 0xffffff, 1) : 0xffffff,
      lo: dark ? tone(th.bg, -0.07) : pool(th, C.hex('#2e3a55'), 0.85),
      frost: dark ? pool(th, 0xffffff, 1) : 0xffffff,
      shadow: dark ? 'rgba(0,0,0,.38)' : rgba(shade, 0.5),
      dropShade: dark ? 'rgba(0,0,0,.22)' : rgba(shade, 0.35)
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
      var c = tl.getContext('2d'), img = c.createImageData(128, 128), d = img.data, R = rng(91);
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
    gr.addColorStop(0, hex(k.dark ? tone(th.bg, -0.05) : pool(th, C.hex('#2e3a55'), 0.5))); gr.addColorStop(0.55, hex(k.film)); gr.addColorStop(1, hex(k.hi));
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
  /* Running rain: a sparse layer of drops and their trails that slides down over Rain on glass */
  PAINT['glassrun'] = function (g, W, H, th) {
    var k = ink(th);
    g.clearRect(0, 0, W, H);
    var R = rng(53);
    for (var i = 0; i < Math.max(4, Math.round(W / 140)); i++) {
      var x = R() * W, y = R() * H, r = 3 + R() * 3.5, len = H * (0.25 + R() * 0.3);
      g.save(); g.strokeStyle = rgba(k.hi, k.dark ? 0.13 : 0.35); g.lineWidth = r * 0.75; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y);
      for (var t = 1; t <= 10; t++) g.lineTo(x + Math.sin(t * 1.3 + i) * r * 0.4, y - len * t / 10);
      g.stroke(); g.restore();
      drop(g, k, x, y, r, th); if (y - len < 0) drop(g, k, x, y + H, r, th);
    }
  };

  /* ---- the wallpaper behind the terminal, for the lens: the print the app paints (wallpapers.js's contract: the id on
     html[data-lg-wall], its image in --lg-wall-<id>-<mode>), loaded once per print; never body's computed image, which can
     hold the previous print for a moment while a choice is in flight ---- */
  var wall = { key: '', img: null, loading: '' };
  function wallNow() {
    var root = document.documentElement, theme = root.getAttribute('data-theme') || '', glass = /^glass/.test(theme);
    if (root.getAttribute('data-o55-nier') === 'on') return null;
    var id = root.getAttribute('data-lg-wall') || '';
    if (!id || (!glass && !root.hasAttribute('data-lg-wall-any'))) return null;
    var key = id + '-' + (/-light$/.test(theme) ? 'light' : 'dark');
    if (wall.key === key) return wall.img ? wall : null;
    if (wall.loading !== key) {
      wall.loading = key;
      var v = '';
      try { v = getComputedStyle(root).getPropertyValue('--lg-wall-' + key).trim(); } catch (e) {}
      var m = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(v);
      if (!m) { wall.key = key; wall.img = null; return null; }
      var img = new Image();
      img.onload = function () { if (wall.loading !== key) return; wall.key = key; wall.img = img; shownSig = key; window.dispatchEvent(new CustomEvent('pmt-wall')); };
      img.onerror = function () { if (wall.loading === key) { wall.key = key; wall.img = null; } };
      img.src = m[1];
    }
    return null;
  }
  /* a new print, a print that settled, or a look that shows another: load it, and the lenses repaint when it arrives */
  var shownSig = '';
  function wallSig() { var w = wallNow(); return w ? w.key : 'none:' + wall.loading; }
  try {
    new MutationObserver(function () { var s = wallSig(); if (s !== shownSig) { shownSig = s; window.dispatchEvent(new CustomEvent('pmt-wall')); } })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-lg-wall', 'data-lg-wall-hold', 'data-lg-wall-any', 'data-theme', 'data-o55-nier'] });
  } catch (e) {}

  /* Lens: a disc of glass that magnifies what lies behind the terminal (the app's wallpaper; without one, the scheme's own
     light), a neutral hairline rim, a catch light along its top and a shadow under it */
  PAINT['lens'] = function (g, W, H, th, h, o) {
    var k = ink(th), cx = W * 0.74, cy = H * 0.56, R = Math.min(W * 0.2, H * 0.4), wl = wallNow();
    backdrop(g, W, H, th, h, 0.45);
    g.save();
    g.shadowColor = k.shadow; g.shadowBlur = 26; g.shadowOffsetY = 10;
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = hex(th.bg); g.fill();
    g.restore();
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
    var mag = 1.35;
    if (wl && wl.img && o && o.rect && !o.tile) {
      /* the print as the app lays it (centre, cover, fixed to the viewport, the root's client box), the part behind this
         point, magnified */
      var img = wl.img, de = document.documentElement, vw = de.clientWidth || W, vh = de.clientHeight || H, sc = Math.max(vw / img.width, vh / img.height);
      var ox = (vw - img.width * sc) / 2, oy = (vh - img.height * sc) / 2, rect = o.rect;
      var px = rect.x + cx / W * rect.w, py = rect.y + cy / H * rect.h, span = R * 2 / mag * (rect.w / W);
      var sx = (px - span / 2 - ox) / sc, sy = (py - span / 2 - oy) / sc, ss = span / sc;
      g.drawImage(img, sx, sy, ss, ss, cx - R, cy - R, R * 2, R * 2);
    } else {
      /* the scheme's own light, magnified */
      [[0.3, 0.7, h.a], [0.75, 0.35, h.b], [0.55, 0.9, h.c]].forEach(function (p) {
        var gx = cx - R + p[0] * R * 2, gy = cy - R + p[1] * R * 2, gr = g.createRadialGradient(gx, gy, 0, gx, gy, R * 1.1);
        gr.addColorStop(0, hex(pool(th, p[2], 1))); gr.addColorStop(1, rgba(th.bg, 0)); g.fillStyle = gr; g.fillRect(cx - R, cy - R, R * 2, R * 2);
      });
    }
    /* readable through the lens too: as much of the scheme's ground over it as its brightest part needs */
    var probe = g.getImageData(Math.max(0, Math.round(cx - R * 0.8)), Math.max(0, Math.round(cy - R * 0.8)), Math.max(1, Math.round(R * 1.6)), Math.max(1, Math.round(R * 1.6))).data, worst = th.bg, wr = Infinity;
    for (var i = 0; i < probe.length; i += 4 * 37) { var c = C.rgb(probe[i], probe[i + 1], probe[i + 2]), q = C.contrast(th.fg, c); if (q < wr) { wr = q; worst = c; } }
    var veil = G.scrim(worst, th); if (veil > 0) { g.fillStyle = rgba(th.bg, Math.min(1, veil + 0.04)); g.fillRect(cx - R, cy - R, R * 2, R * 2); }
    /* the glass: brighter toward its lower rim (light gathered through the curve), darker along its upper one */
    var body = g.createRadialGradient(cx, cy - R * 0.35, R * 0.2, cx, cy, R);
    body.addColorStop(0, rgba(k.hi, 0)); body.addColorStop(0.8, rgba(k.hi, 0)); body.addColorStop(1, rgba(k.hi, k.dark ? 0.16 : 0.4));
    g.fillStyle = body; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    g.restore();
    g.lineWidth = 1; g.strokeStyle = rgba(k.hi, k.dark ? 0.6 : 0.95); g.beginPath(); g.arc(cx, cy, R - 0.5, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2.2; g.strokeStyle = rgba(k.hi, k.dark ? 0.75 : 1); g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R - 3, Math.PI * 1.15, Math.PI * 1.62); g.stroke();
    g.lineWidth = 1.5; g.strokeStyle = rgba(k.lo, 0.8); g.beginPath(); g.arc(cx, cy, R - 2, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
  };
  PAINT['lens'].needs = function (o) {
    var wl = wallNow();
    if (!wl || !o || o.tile) return o && o.tile ? 'tile' : 'own';
    var r = o.rect || {};
    return wl.key + '@' + Math.round((r.x || 0) / 24) + ',' + Math.round((r.y || 0) / 24) + ',' + (document.documentElement.clientWidth || 0) + 'x' + (document.documentElement.clientHeight || 0);
  };

  /* Etched glass: a frosted panel with a sunburst cut through the frost, each cut catching a thin line of light */
  PAINT['etched'] = function (g, W, H, th, h) {
    var k = ink(th);
    backdrop(g, W, H, th, h, 0.5);
    var x = W * 0.42, y = H * 0.1, w = W * 0.54, hh = H * 0.8, r = Math.min(14, Math.min(W, H) * 0.04);
    var layer = document.createElement('canvas'); layer.width = W; layer.height = H;
    var l = layer.getContext('2d');
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
    g.save(); g.shadowColor = k.shadow; g.shadowBlur = 18; g.shadowOffsetY = 5; g.drawImage(layer, 0, 0); g.restore();
  };

  def('glass', 'frosted', 'Frosted panes', { looks: ['glass'] });
  def('glass', 'sheets', 'Layered sheets', { looks: ['glass'] });
  def('glass', 'raindrops', 'Rain on glass', { looks: ['glass'] });
  def('glass', 'lens', 'Lens', { looks: ['glass'] });
  def('glass', 'etched', 'Etched glass', { looks: ['glass'] });
  def('glass', 'rain-glass', 'Running rain', { motion: { layer: 'glassrun', anim: 'pmt-bg-fall', ms: 16000, under: 'raindrops' } });
})();
