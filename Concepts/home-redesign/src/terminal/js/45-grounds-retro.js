/* Retro grounds (round 3, Jared 2026-10-14: "add a few more for retro"; research: Ghostty and kitty shader packs,
   Windows Terminal's retro shaders, cool-retro-term's profiles, the BBS scene): a phosphor graticule, a CRT test
   pattern, BBS block art, a vector wireframe terrain, green-bar printer paper, the ghost of a boot screen burned into
   the tube, and two that move: an oscilloscope trace over the graticule and glyph rain; and (round 3b) four plain ones:
   phosphor glow, tube glass, an aperture grille and static.

   Drawn in the scheme's phosphor (its green, or a one-colour scheme's own glow) and its palette, each line and block at
   most as bright as keeps the text readable (43-grounds.js's pool), so the art reads in every look, light or dark:
   under Retro it glows on the tube, under Basic or Glass it is line art in the scheme's colours. Green-bar paper is
   pure CSS keyed to the text's own row height, so its bands fall exactly on the rows. Moving layers move by transform
   only, at about 20 fps, and only while the terminal is in use (52-fx.js). */
(function () {
  'use strict';
  var G = T.Grounds; if (!G || !G.kit) return;
  var K = G.kit, C = T.color, def = K.def, PAINT = K.PAINT, hex = K.hex, rgba = K.rgba, rng = K.rng, pool = K.pool, tone = K.tone, isDark = K.isDark, lift = K.lift;

  function phos(th, h) { return h.d; }
  /* a line of light: a soft halo under a crisp core, both in the brightest colour the text allows */
  function glowLine(g, path, col, w, halo) {
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    if (halo && K.canFilter) { g.filter = 'blur(' + halo + 'px)'; g.globalAlpha = 0.55; g.lineWidth = w * 3; g.strokeStyle = hex(col); g.stroke(path); g.filter = 'none'; }
    g.globalAlpha = 1; g.lineWidth = w; g.strokeStyle = hex(col); g.stroke(path);
    g.restore();
  }
  function ground(g, W, H, th) { g.fillStyle = hex(th.bg); g.fillRect(0, 0, W, H); }

  /* Phosphor grid: an oscilloscope's graticule, ten by eight, its centre axes ticked */
  PAINT['phosphor-grid'] = function (g, W, H, th, h) {
    ground(g, W, H, th);
    var c = phos(th, h), major = pool(th, c, 0.42), axis = pool(th, c, 0.75), tick = pool(th, c, 0.9);
    var cols = 10, rows = 8, mx = W * 0.04, my = H * 0.06, gw = W - mx * 2, gh = H - my * 2, p = new Path2D(), a = new Path2D(), t = new Path2D();
    for (var i = 0; i <= cols; i++) { var x = Math.round(mx + gw * i / cols) + 0.5; (i === cols / 2 ? a : p).moveTo(x, my); (i === cols / 2 ? a : p).lineTo(x, my + gh); }
    for (var j = 0; j <= rows; j++) { var y = Math.round(my + gh * j / rows) + 0.5; (j === rows / 2 ? a : p).moveTo(mx, y); (j === rows / 2 ? a : p).lineTo(mx + gw, y); }
    for (var k = 0; k <= cols * 5; k++) { var tx = Math.round(mx + gw * k / (cols * 5)) + 0.5, cy = Math.round(my + gh / 2); t.moveTo(tx, cy - 3); t.lineTo(tx, cy + 4); }
    for (var q = 0; q <= rows * 5; q++) { var ty = Math.round(my + gh * q / (rows * 5)) + 0.5, cx = Math.round(mx + gw / 2); t.moveTo(cx - 3, ty); t.lineTo(cx + 4, ty); }
    glowLine(g, p, major, 1, 1.4); glowLine(g, a, axis, 1, 1.6); glowLine(g, t, tick, 1, 0);
  };

  /* Test pattern: the circle, the cross-hatch, the colour bars and the grey steps of a broadcast test card, faint */
  PAINT['test-card'] = function (g, W, H, th, h) {
    ground(g, W, H, th);
    var cx = W / 2, cy = H / 2, R = H * 0.44, cell = Math.round(H / 9), line = pool(th, th.fg, 0.3), p = new Path2D();
    for (var x = cx % cell; x < W; x += cell) { p.moveTo(Math.round(x) + 0.5, 0); p.lineTo(Math.round(x) + 0.5, H); }
    for (var y = cy % cell; y < H; y += cell) { p.moveTo(0, Math.round(y) + 0.5); p.lineTo(W, Math.round(y) + 0.5); }
    g.lineWidth = 1; g.strokeStyle = hex(line); g.stroke(p);
    /* castellations round the edge */
    g.fillStyle = hex(pool(th, th.fg, 0.22));
    for (var e = 0; e < W; e += cell * 2) { g.fillRect(e, 0, cell, cell * 0.35); g.fillRect(e + cell, H - cell * 0.35, cell, cell * 0.35); }
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
    g.fillStyle = hex(th.bg); g.fillRect(cx - R, cy - R, R * 2, R * 2);
    /* colour bars across the upper half, grey steps below, from the scheme's own palette */
    var pal = th.palette || [], bars = [7, 3, 6, 2, 5, 1, 4, 0].map(function (i) { return pal[i] !== undefined ? pal[i] : th.fg; }), bw = R * 2 / bars.length;
    bars.forEach(function (c, i) { g.fillStyle = hex(pool(th, c, 0.7)); g.fillRect(cx - R + i * bw, cy - R * 0.62, bw + 0.5, R * 0.46); });
    for (var s = 0; s < 6; s++) { g.fillStyle = hex(pool(th, th.fg, s / 5 * 0.85)); g.fillRect(cx - R + s * R / 3, cy + R * 0.1, R / 3 + 0.5, R * 0.3); }
    g.restore();
    g.lineWidth = 2; g.strokeStyle = hex(pool(th, th.fg, 0.55)); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(cx - R * 0.2, cy); g.lineTo(cx + R * 0.2, cy); g.moveTo(cx, cy - R * 0.2); g.lineTo(cx, cy + R * 0.2); g.lineWidth = 1.5; g.stroke();
    g.beginPath(); g.arc(cx, cy, R * 0.08, 0, Math.PI * 2); g.stroke();
  };

  /* ANSI art: a sunset over mountains and a sea, in text cells of dithered blocks (the BBS scene's 25, 50 and 75 % shade
     blocks), framed in a double line; the cells are the terminal's own size */
  var DITHER = [[0, 2], [3, 1]];
  PAINT['ansi'] = function (g, W, H, th, h, o) {
    ground(g, W, H, th);
    var ch = Math.max(10, Math.round((o && o.rowPx) || 17)), cw = Math.max(5, Math.round(ch * 0.55)), px = Math.max(1, Math.round(ch / 9));
    var x0 = Math.round(W * 0.45 / cw) * cw, y0 = Math.round(H * 0.3 / ch) * ch, cols = Math.floor((W - x0 - cw) / cw), rows = Math.floor((H - y0 - ch) / ch);
    if (cols < 8 || rows < 4) return;
    var dark = isDark(th), skyT = pool(th, h.b, 0.55), skyM = pool(th, h.hot, 0.8), horiz = pool(th, h.warm, 0.95), sun = pool(th, h.warm, 1);
    var mtn = dark ? tone(th.bg, -0.03) : pool(th, h.a, 0.5), mtn2 = pool(th, h.a, dark ? 0.35 : 0.7), sea = pool(th, h.c, 0.5), seaHi = pool(th, h.warm, 0.7);
    var dots = function (d) { var pth = new Path2D(); for (var yy = 0; yy < ch; yy += px * 2) for (var xx = 0; xx < cw; xx += px * 2) for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) if ((DITHER[a][b] + 0.5) / 4 < d) pth.rect(xx + b * px, yy + a * px, px, px); return pth; };
    var shades = [dots(0.25), dots(0.5), dots(0.75)];
    var cell = function (cx, cy, back, front, d) {
      g.fillStyle = hex(back); g.fillRect(x0 + cx * cw, y0 + cy * ch, cw, ch);
      if (d <= 0) return;
      g.fillStyle = hex(front);
      if (d >= 1) { g.fillRect(x0 + cx * cw, y0 + cy * ch, cw, ch); return; }
      g.save(); g.translate(x0 + cx * cw, y0 + cy * ch); g.fill(shades[Math.min(2, Math.max(0, Math.round(d * 4) - 1))]); g.restore();
    };
    var horizonV = 0.58, sx = 0.66, sy = 0.5, sr = 0.2, aspect = cols * cw / (rows * ch);
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var u = (c + 0.5) / cols, v = (r + 0.5) / rows;
      var ridge = horizonV - 0.1 - 0.12 * Math.abs(Math.sin(u * 7.3 + 1.2)) - 0.06 * Math.sin(u * 17.1), ridge2 = horizonV - 0.03 - 0.06 * Math.abs(Math.sin(u * 11 + 0.4));
      var du = (u - sx) * aspect, dv = v - sy, inSun = du * du + dv * dv < sr * sr && !(v > sy && Math.floor(v * rows) % 2 === 1);
      if (v < horizonV) {
        if (v > ridge2) cell(c, r, mtn, mtn2, 0.25);
        else if (v > ridge) cell(c, r, mtn2, mtn, 0.5);
        else if (inSun) cell(c, r, horiz, sun, 1);
        else { var t = v / ridge; cell(c, r, t < 0.5 ? skyT : skyM, t < 0.5 ? skyM : horiz, t < 0.5 ? t * 2 * 0.75 : (t - 0.5) * 2 * 0.75); }
      } else {
        var glint = Math.abs(u - sx) < 0.09 * (1 - (v - horizonV)) && (r + c) % 3 !== 0;
        cell(c, r, sea, glint ? seaHi : th.bg, glint ? 0.5 : 0.25);
      }
    }
    /* the double-line frame round the art */
    var fr = pool(th, h.c, 0.85), fx = x0 - cw / 2, fy = y0 - ch / 2, fw = cols * cw + cw, fh = rows * ch + ch;
    g.strokeStyle = hex(fr); g.lineWidth = Math.max(1, px);
    g.strokeRect(Math.round(fx) + 0.5, Math.round(fy) + 0.5, Math.round(fw), Math.round(fh));
    g.strokeRect(Math.round(fx + px * 3) + 0.5, Math.round(fy + px * 3) + 0.5, Math.round(fw - px * 6), Math.round(fh - px * 6));
  };
  PAINT['ansi'].needs = function (o) { return String(Math.round((o && o.rowPx) || 17)); };

  /* Vector terrain: a wireframe landscape in perspective, the kind a vector monitor drew, fading into the distance */
  PAINT['wireframe'] = function (g, W, H, th, h) {
    ground(g, W, H, th);
    var c = phos(th, h), hor = H * 0.46, fov = H * 0.9, camH = 1.25, Z0 = 1.2, Z1 = 14, nz = 22, nx = 36;
    var height = function (x, z) { return 0.9 * Math.exp(-Math.pow((x - 2.4) / 1.6, 2) - Math.pow((z - 9) / 3, 2)) * 2.2 + 0.55 * Math.exp(-Math.pow((x + 3) / 1.3, 2) - Math.pow((z - 11) / 2.6, 2)) * 2 + 0.12 * Math.sin(x * 1.7 + z * 0.8); };
    var proj = function (x, z) { var y = height(x, z); return [W * 0.62 + x / z * fov, hor + (camH - y) / z * fov]; };
    for (var i = 0; i <= nz; i++) {
      var z = Z0 + (Z1 - Z0) * Math.pow(i / nz, 1.6), p = new Path2D(), fade = 1 - i / nz * 0.75;
      for (var j = 0; j <= nx; j++) { var x = -9 + 18 * j / nx, q = proj(x, z); if (j) p.lineTo(q[0], q[1]); else p.moveTo(q[0], q[1]); }
      glowLine(g, p, pool(th, c, 0.85 * fade), 1, i < 6 ? 1.2 : 0);
    }
    for (var jj = 0; jj <= nx; jj++) {
      var xx = -9 + 18 * jj / nx, pp = new Path2D();
      for (var ii = 0; ii <= nz; ii++) { var zz = Z0 + (Z1 - Z0) * Math.pow(ii / nz, 1.6), qq = proj(xx, zz); if (ii) pp.lineTo(qq[0], qq[1]); else pp.moveTo(qq[0], qq[1]); }
      glowLine(g, pp, pool(th, c, 0.5), 1, 0);
    }
    /* a vector sun on the horizon */
    var sun = new Path2D(); sun.arc(W * 0.62, hor - H * 0.02, H * 0.12, Math.PI, 0); glowLine(g, sun, pool(th, h.warm, 0.8), 1.2, 1.4);
  };

  /* Green-bar paper: the line printer's fan-fold stock, three rows tinted and three plain, sprocket holes down both
     edges; the bands fall on the terminal's own rows (--pmt-cell-h, from where the grid starts) */
  def('retro', 'greenbar', 'Green-bar paper', { looks: ['retro'], css: function (th, h) {
    var dark = isDark(th), band = pool(th, h.d, dark ? 0.32 : 0.55), strip = dark ? lift(th, 0.03) : pool(th, C.hex('#b7b2a4'), 0.5);
    var hole = dark ? tone(th.bg, -0.07) : pool(th, C.hex('#6d6a62'), 0.7), perf = pool(th, th.fg, 0.35);
    var rows = 'var(--pmt-cell-h, 17px)', top = 'var(--pmt-grid-y, var(--pmt-pad-y, 0px))';
    var css = 'radial-gradient(circle at 11px 12px, ' + hex(hole) + ' 0 4px, transparent 4.6px) 0 0 / 22px 24px repeat-y, ' +
      'radial-gradient(circle at 11px 12px, ' + hex(hole) + ' 0 4px, transparent 4.6px) right 0 top 0 / 22px 24px repeat-y, ' +
      'repeating-linear-gradient(180deg, ' + hex(perf) + ' 0 3px, transparent 3px 7px) 23px 0 / 1px 100% no-repeat, ' +
      'repeating-linear-gradient(180deg, ' + hex(perf) + ' 0 3px, transparent 3px 7px) right 23px top 0 / 1px 100% no-repeat, ' +
      'linear-gradient(90deg, ' + hex(strip) + ' 0 22px, transparent 22px calc(100% - 22px), ' + hex(strip) + ' calc(100% - 22px)), ' +
      'repeating-linear-gradient(180deg, transparent 0 calc(' + rows + ' * 3), ' + hex(band) + ' calc(' + rows + ' * 3) calc(' + rows + ' * 6)) 0 ' + top + ' / 100% calc(' + rows + ' * 6), ' + hex(th.bg);
    return { css: css, colors: [th.bg, band, strip, hole, perf] };
  } });

  /* Boot ghost: a boot screen burned into the phosphor, long gone and still faintly there */
  var BOOT = ['PUPPET MASTER BIOS v2.11', '(C) 1987-2026 Puppet Master Systems', '', 'Main Processor : PM-386 33 MHz', 'Memory Test    : 640K OK',
    'Extended Memory: 15360K OK', '', 'Detecting Primary Master ... PM-DISK 40MB', 'Detecting Primary Slave  ... None', '', 'Booting from Hard Disk...'];
  PAINT['boot-ghost'] = function (g, W, H, th, h, o) {
    ground(g, W, H, th);
    var c = K.tight(th) ? pool(th, phos(th, h), 0.8) : pool(th, phos(th, h), 0.3), size = Math.max(10, Math.round(((o && o.rowPx) || 17) * 0.82)), x = Math.round(W * 0.5), y = Math.round(H * 0.16);
    /* (round 3c: on a scheme with no contrast to spare the ghost is drawn crisp and whole, or it vanishes into the pale
       ground) */
    var tk = K.tight(th);
    g.font = (tk ? '700 ' : '500 ') + size + 'px "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace'; g.textBaseline = 'top';
    var draw = function (dx, dy, a) { g.globalAlpha = a; g.fillStyle = hex(c); BOOT.forEach(function (l, i) { g.fillText(l, x + dx, y + dy + i * size * 1.35); }); };
    if (K.canFilter && !tk) g.filter = 'blur(0.7px)';
    draw(0, 0, tk ? 1 : 0.75); draw(1.5, 0, tk ? 0.6 : 0.3);
    /* the logo block in the corner, as bright as the text was */
    g.globalAlpha = 0.8; g.fillStyle = hex(pool(th, phos(th, h), 0.4));
    var bx = Math.round(W * 0.84), by = y, s = size * 0.7, logo = ['1110111', '1010101', '1110101', '1000101', '1000101'];
    logo.forEach(function (row, i) { for (var k = 0; k < row.length; k++) if (row[k] === '1') g.fillRect(bx + k * s, by + i * s * 1.2, s - 1, s * 1.2 - 1); });
    g.filter = 'none'; g.globalAlpha = 1;
  };
  PAINT['boot-ghost'].needs = PAINT['ansi'].needs;

  /* Oscilloscope: the trace layer, a modulated wave that repeats exactly across the layer's width, so the pan loops */
  PAINT['scopetrace'] = function (g, W, H, th, h) {
    g.clearRect(0, 0, W, H);
    var c = pool(th, phos(th, h), 1), p = new Path2D(), cy = H * 0.5, A = H * 0.2;
    for (var x = 0; x <= W; x += 2) { var t = x / W * Math.PI * 2, y = cy - A * Math.sin(t * 3) * (0.75 + 0.25 * Math.cos(t * 2)) - A * 0.18 * Math.sin(t * 13); if (x) p.lineTo(x, y); else p.moveTo(x, y); }
    glowLine(g, p, c, 1.6, 3);
  };
  /* Glyph rain: columns of characters falling, each stream bright at its head and fading behind; it repeats down the
     layer's height, so the fall loops */
  PAINT['glyphs'] = function (g, W, H, th, h, o) {
    g.clearRect(0, 0, W, H);
    var c = pool(th, phos(th, h), 1), size = Math.max(10, Math.round(((o && o.rowPx) || 17) * 0.8)), R = rng(61), chars = '01<>=+*#%$&/\\|ABCDEF7924';
    g.font = '500 ' + size + 'px "JetBrains Mono", ui-monospace, monospace'; g.textBaseline = 'top'; g.fillStyle = hex(c);
    for (var x = Math.round(size * 0.3); x < W; x += Math.round(size * 1.15)) {
      if (R() < 0.45) continue;
      var head = R() * H, len = 6 + Math.floor(R() * 14);
      for (var i = 0; i < len; i++) {
        var y = head - i * size * 1.1; y = ((y % H) + H) % H;
        g.globalAlpha = i === 0 ? 0.95 : Math.max(0.06, 0.7 * (1 - i / len));
        g.fillText(chars[Math.floor(R() * chars.length)], x, y);
      }
    }
    g.globalAlpha = 1;
  };
  PAINT['glyphs'].needs = PAINT['ansi'].needs;

  /* ---- plainer Retro (round 3b, Jared: "the retro wallpapers need some plainer ones"): nothing drawn, only the tube ---- */
  function hiOf(th) { return isDark(th) ? pool(th, 0xffffff, 1) : 0xffffff; }
  function edgeOf(th, f) { return isDark(th) ? tone(th.bg, -0.09 * f) : K.poolRaw(th, 0x000000, 0.7 * f); }
  /* Phosphor glow: a lit tube, its phosphor glowing softly from the middle out, its edge falling away into the dark */
  PAINT['phosphor-glow'] = function (g, W, H, th, h) {
    ground(g, W, H, th);
    /* an ellipse the terminal's own shape, its light falling off smoothly (no knee for the eye to read as an edge) */
    var c = phos(th, h), cx = W * 0.5, cy = H * 0.45, dk = edgeOf(th, 1), top = K.inkFor(th, c, isDark(th) ? 0.62 : 0.85);
    g.save(); g.translate(cx, cy); g.scale(W * 0.62, H * 0.75);
    var gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function (t) { var e = Math.pow(1 - t, 2) * (1 + 2 * t); gr.addColorStop(t, rgba(top, e)); });
    g.fillStyle = gr; g.fillRect(-1.2, -1.2, 2.4, 2.4);
    var v = g.createRadialGradient(0, 0, 0.55, 0, 0, 1.25);
    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) { v.addColorStop(t, rgba(dk, 0.95 * t * t * (3 - 2 * t))); });
    g.fillStyle = v; g.fillRect(-2, -2, 4, 4);
    g.restore();
  };
  /* Tube glass: the screen's curved glass, unlit. Its face darkens toward the rounded corners of the tube, and a window's
     light lies on it up and to the left, a fainter one low on the right */
  PAINT['tube'] = function (g, W, H, th) {
    ground(g, W, H, th);
    /* a ground already near black cannot darken toward the corners: there the face itself catches a little grey light
       from the room, so the corners read darker by contrast */
    if (C.lum(th.bg) < 0.02) {
      g.save(); g.translate(W / 2, H * 0.48); g.scale(W * 0.55, H * 0.62);
      var face = g.createRadialGradient(0, 0, 0, 0, 0, 1), lift = pool(th, 0xffffff, 0.3);
      [0, 0.3, 0.6, 0.85, 1].forEach(function (t) { face.addColorStop(t, rgba(lift, 1 - t * t * (3 - 2 * t))); });
      g.fillStyle = face; g.fillRect(-1, -1, 2, 2); g.restore();
    }
    /* the darkening is all soft edge, so it is painted at a quarter of the size and laid on scaled up (a full-size blur cost
       437 ms on the P1000) */
    var dk = edgeOf(th, 1.4), hi = hiOf(th), q = 4, lw = Math.max(8, Math.round(W / q)), lh = Math.max(8, Math.round(H / q));
    var layer = document.createElement('canvas'); layer.width = lw; layer.height = lh;
    var l = layer.getContext('2d', { willReadFrequently: true });
    l.fillStyle = hex(dk); l.fillRect(0, 0, lw, lh);
    l.globalCompositeOperation = 'destination-out'; if (K.canFilter) l.filter = 'blur(' + Math.max(1, Math.round(Math.min(lw, lh) * 0.09)) + 'px)';
    var ix = lw * 0.07, iy = lh * 0.12, r = Math.min(lw, lh) * 0.22;
    l.beginPath(); l.moveTo(ix + r, iy); l.arcTo(lw - ix, iy, lw - ix, lh - iy, r); l.arcTo(lw - ix, lh - iy, ix, lh - iy, r); l.arcTo(ix, lh - iy, ix, iy, r); l.arcTo(ix, iy, lw - ix, iy, r); l.closePath();
    l.fillStyle = '#000'; l.fill();
    g.save(); g.imageSmoothingQuality = 'high'; g.drawImage(layer, 0, 0, W, H); g.restore();
    [[0.22, 0.24, 0.17, 0.11, -0.28, isDark(th) ? 0.3 : 0.75], [0.84, 0.8, 0.07, 0.05, -0.28, isDark(th) ? 0.16 : 0.45]].forEach(function (q) {
      g.save(); g.translate(W * q[0], H * q[1]); g.rotate(q[4]); g.scale(W * q[2], H * q[3]);
      var hg = g.createRadialGradient(0, 0, 0, 0, 0, 1); hg.addColorStop(0, rgba(hi, q[5])); hg.addColorStop(1, rgba(hi, 0));
      g.fillStyle = hg; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore();
    });
  };
  /* Aperture grille: a Trinitron's phosphor stripes seen close, red, green and blue a pixel each, and the two thin damper
     wires that cross every such screen a third and two thirds of the way down */
  var grilleTiles = {};
  PAINT['grille'] = function (g, W, H, th, h) {
    ground(g, W, H, th);
    var pal = th.palette || [], mono = !!th.mono;
    var lf = isDark(th) ? 1 : 1.7;
    var cols = mono ? [0.35, 0.7, 0.5].map(function (f) { return K.inkFor(th, phos(th, h), Math.min(1, f * lf)); })
      : [pal[9] !== undefined ? pal[9] : h.hot, pal[10] !== undefined ? pal[10] : h.d, pal[12] !== undefined ? pal[12] : h.a].map(function (c) { return K.inkFor(th, c, Math.min(1, 0.42 * lf)); });
    var key = cols.join(','), t = grilleTiles[key];
    if (!t) { t = grilleTiles[key] = document.createElement('canvas'); t.width = 3; t.height = 1; var c = t.getContext('2d', { willReadFrequently: true }); cols.forEach(function (col, i) { c.fillStyle = hex(col); c.fillRect(i, 0, 1, 1); }); }
    g.fillStyle = g.createPattern(t, 'repeat'); g.fillRect(0, 0, W, H);
    g.fillStyle = hex(edgeOf(th, 1.2)); g.fillRect(0, Math.round(H / 3), W, 1); g.fillRect(0, Math.round(H * 2 / 3), W, 1);
  };
  /* Static: an empty channel, faint. Snow of 2 px grains in the phosphor's colour, and here and there a line where the
     picture tore */
  var staticTiles = {};
  PAINT['static'] = function (g, W, H, th, h) {
    ground(g, W, H, th);
    /* (grain needs more than a line to show: on a light ground it goes paler than the paper unless the ink is clearly there) */
    var c = K.inkFor(th, phos(th, h), 0.9, 1.3), key = th.bg + '|' + c, t = staticTiles[key], amp = isDark(th) ? 0.7 : 1;
    if (!t) {
      var N = 240; t = staticTiles[key] = document.createElement('canvas'); t.width = t.height = N;
      var x = t.getContext('2d', { willReadFrequently: true }), R = rng(71);
      for (var y = 0; y < N; y += 2) {
        var torn = R() < 0.04;
        /* (a light ground shows grain less: there more of the grains are mid-tone) */
        for (var xx = 0; xx < N; xx += 2) { var v = R(); v = torn ? 0.3 + v * 0.45 : amp < 1 ? v * v * amp : Math.pow(v, 1.25); x.fillStyle = hex(C.mix(th.bg, c, v)); x.fillRect(xx, y, 2, 2); }
      }
    }
    g.fillStyle = g.createPattern(t, 'repeat'); g.fillRect(0, 0, W, H);
  };
  def('retro', 'phosphor-glow', 'Phosphor glow', { looks: ['retro'], vis: false });
  def('retro', 'tube', 'Tube glass', { looks: ['retro'], vis: false });
  def('retro', 'grille', 'Aperture grille', { looks: ['retro'], vis: false });
  def('retro', 'static', 'Static', { vis: false });
  def('retro', 'phosphor-grid', 'Phosphor grid', { looks: ['retro'] });
  def('retro', 'test-card', 'Test pattern');
  def('retro', 'ansi', 'ANSI art', { looks: ['retro'] });
  def('retro', 'wireframe', 'Vector terrain');
  def('retro', 'boot-ghost', 'Boot ghost');
  def('retro', 'scope', 'Oscilloscope', { motion: { layer: 'scopetrace', anim: 'pmt-bg-pan', ms: 5000, under: 'phosphor-grid' } });
  def('retro', 'glyph-rain', 'Glyph rain', { motion: { layer: 'glyphs', anim: 'pmt-bg-fall', ms: 9000 } });
  /* Retro suggests the plain ones first (round 3b), then its scanlines and paper */
  K.suggest('retro', ['phosphor-glow', 'tube', 'grille', 'scanfield', 'greenbar']);
})();
