/* art.js: the twenty all-look wallpapers (pm7-wallpapers, Opus 5.5, 2026-10-13), drawn on a canvas in Chrome.
 *
 * Loaded into a blank page by tools/walls.mjs, which calls WPK_ART.draw(id, dark) and encodes the canvas. Everything is
 * original and drawn in code from fixed seeds: the same Chrome draws the same pixels. Each family keeps its look's voice:
 *   Basic: calm work-first geometry (drafting, contours, paper), low contrast, interest at the edges;
 *   Friendly: soft rounded forms and pastel light after the DS/3DS/Wii/Wii U menus, Cocoon and iiSU, and the dot
 *     pattern in every one;
 *   Retro: phosphor and printed-manual pixel art, square and stepped, drawn small and scaled up whole pixels;
 *   NieR: ink on parchment (or parchment on ink): rules, brackets, squares and line drawings.
 * The panels cover the middle in the opaque looks, and Glass frosts what is behind its sheets, so each one keeps its
 * detail toward the edges and its centre quiet; Glass bends their crisp edges at every sheet's rim.
 */
(function () {
  'use strict';
  var W = 2560, H = 1440;

  /* ---------- helpers ------------------------------------------------------------------------------------------- */
  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w || W; c.height = h || H; return c; }
  function ctx(c) { return c.getContext('2d', { willReadFrequently: true }); }
  function lin(g, x0, y0, x1, y1, stops) { var gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); return gr; }
  function rad(g, x0, y0, r0, x1, y1, r1, stops) { var gr = g.createRadialGradient(x0, y0, r0, x1, y1, r1); stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); return gr; }
  function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgba(c, a) { var v = typeof c === 'string' ? (c.charAt(0) === '#' ? hex(c) : c.split(',').map(Number)) : c; return 'rgba(' + Math.round(v[0]) + ',' + Math.round(v[1]) + ',' + Math.round(v[2]) + ',' + a + ')'; }
  function mix(a, b, t) { a = typeof a === 'string' ? hex(a) : a; b = typeof b === 'string' ? hex(b) : b; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function ramp(stops, t) {   /* stops: [[t, [r,g,b]], ...] */
    t = Math.max(0, Math.min(1, t));
    for (var i = 1; i < stops.length; i++) if (t <= stops[i][0]) { var a = stops[i - 1], b = stops[i]; return mix(a[1], b[1], (t - a[0]) / (b[0] - a[0] || 1)); }
    return stops[stops.length - 1][1];
  }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function smooth(e0, e1, x) { var t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  /* film grain, so gradients never band in WebP */
  function grain(g, amt, seed) {
    var im = g.getImageData(0, 0, g.canvas.width, g.canvas.height), d = im.data, r = rng(seed || 7);
    for (var i = 0; i < d.length; i += 4) { var n = (r() - 0.5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    g.putImageData(im, 0, 0);
  }
  /* smooth value noise and a few octaves of it */
  function noise2(seed) {
    var r = rng(seed), P = new Float32Array(256 * 256); for (var i = 0; i < P.length; i++) P[i] = r();
    function at(x, y) { return P[((y & 255) << 8) | (x & 255)]; }
    return function (x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      var u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
      var a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), dd = at(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + dd) * u * v;
    };
  }
  function fbm(n, x, y, oct) { var s = 0, a = 0.5, f = 1, t = 0; for (var i = 0; i < (oct || 4); i++) { s += a * n(x * f, y * f); t += a; a *= 0.5; f *= 2.03; } return s / t; }
  function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
  /* the dot pattern Friendly is known for: a grid of round dots in one colour */
  function dots(g, step, r, color, x0, y0, x1, y1, offset) {
    g.fillStyle = color; g.beginPath();
    for (var y = (y0 || 0) + step / 2, row = 0; y < (y1 || H); y += step, row++) {
      for (var x = (x0 || 0) + step / 2 + (offset && row % 2 ? step / 2 : 0); x < (x1 || W); x += step) { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); }
    }
    g.fill();
  }
  /* pixel art: a small canvas painted pixel by pixel, scaled up by whole pixels (nearest neighbour) */
  function Pix(w, h) {
    var c = canvas(w, h), g = ctx(c), im = g.createImageData(w, h), d = im.data;
    var api = {
      w: w, h: h,
      set: function (x, y, col) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= w || y >= h) return; var i = (y * w + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; },
      get: function (x, y) { var i = (y * w + x) * 4; return [d[i], d[i + 1], d[i + 2]]; },
      fill: function (col) { for (var i = 0; i < d.length; i += 4) { d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; } },
      rect: function (x, y, rw, rh, col) { for (var j = 0; j < rh; j++) for (var i = 0; i < rw; i++) api.set(x + i, y + j, col); },
      line: function (x0, y0, x1, y1, col) {
        x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
        var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, e = dx + dy;
        for (;;) { api.set(x0, y0, col); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
      },
      circle: function (cx, cy, r, col, step) {   /* midpoint circle; step > 1 leaves gaps (a dotted circle) */
        var x = r, y = 0, err = 1 - r, k = 0;
        while (x >= y) {
          if (!step || k % step === 0) [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]].forEach(function (p) { api.set(cx + p[0], cy + p[1], col); });
          y++; k++; if (err < 0) err += 2 * y + 1; else { x--; err += 2 * (y - x) + 1; }
        }
      },
      disc: function (cx, cy, r, col) { for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) api.set(cx + x, cy + y, col); },
      out: function () { g.putImageData(im, 0, 0); var big = canvas(W, H), bg = ctx(big); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, W, H); return big; }
    };
    return api;
  }
  var BAYER = [[0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26], [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25], [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21]];
  /* ordered dither of a value 0..1 onto a list of palette levels */
  function dith(levels, t, x, y) { var n = levels.length - 1, v = clamp(t, 0, 1) * n, i = Math.floor(v), f = v - i; if (i >= n) return levels[n]; return f > (BAYER[y & 7][x & 7] + 0.5) / 64 ? levels[i + 1] : levels[i]; }
  /* contour lines of a field by marching squares, into one Path2D per class */
  function contours(field, cols, rows, cell, levels, classOf) {
    var paths = {};
    levels.forEach(function (lv, li) {
      var k = classOf(li), p = paths[k] || (paths[k] = new Path2D());
      for (var j = 0; j < rows - 1; j++) for (var i = 0; i < cols - 1; i++) {
        var a = field[j * cols + i], b = field[j * cols + i + 1], c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i];
        var code = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0);
        if (code === 0 || code === 15) continue;
        var x = i * cell, y = j * cell;
        var T = [x + cell * (lv - a) / (b - a), y], R = [x + cell, y + cell * (lv - b) / (c - b)], B = [x + cell * (lv - d) / (c - d), y + cell], L = [x, y + cell * (lv - a) / (d - a)];
        var segs;
        switch (code) {
          case 1: case 14: segs = [[L, B]]; break; case 2: case 13: segs = [[B, R]]; break; case 3: case 12: segs = [[L, R]]; break;
          case 4: case 11: segs = [[T, R]]; break; case 6: case 9: segs = [[T, B]]; break; case 7: case 8: segs = [[L, T]]; break;
          case 5: segs = (a + b + c + d) / 4 > lv ? [[L, T], [B, R]] : [[L, B], [T, R]]; break;
          case 10: segs = (a + b + c + d) / 4 > lv ? [[T, R], [L, B]] : [[L, T], [B, R]]; break;
        }
        segs.forEach(function (s) { p.moveTo(s[0][0], s[0][1]); p.lineTo(s[1][0], s[1][1]); });
      }
    });
    return paths;
  }

  /* ================================================================================================================
     BASIC: calm, work-first. Low-contrast structure that never competes with dense text.
     ================================================================================================================ */
  function basicInk(dark) { return dark ? { g0: '#0f1318', g1: '#141920', line: [176, 196, 222], acc: [100, 181, 246] } : { g0: '#edf0f3', g1: '#e2e6eb', line: [32, 44, 66], acc: [0, 86, 179] }; }

  /* Blueprint: a drafting sheet. Grid, a protractor, a part with its dimensions and a title block, all at the edges. */
  function blueprint(dark) {
    var c = canvas(), g = ctx(c), ink = dark ? [120, 178, 238] : [0, 86, 179];
    g.fillStyle = lin(g, 0, 0, W, H, dark ? [[0, '#0c121a'], [1, '#101924']] : [[0, '#ecf1f7'], [1, '#dfe7f0']]); g.fillRect(0, 0, W, H);
    g.fillStyle = rad(g, W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.6, dark ? [[0, 'rgba(40,70,110,.18)'], [1, 'rgba(0,0,0,0)']] : [[0, 'rgba(255,255,255,.5)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(0, 0, W, H);
    function grid(step, a) { g.beginPath(); for (var x = 0; x <= W; x += step) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); } for (var y = 0; y <= H; y += step) { g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); } g.strokeStyle = rgba(ink, a); g.lineWidth = 1; g.stroke(); }
    grid(32, dark ? 0.06 : 0.06); grid(160, dark ? 0.13 : 0.12);
    var S = rgba(ink, dark ? 0.8 : 0.6), S2 = rgba(ink, dark ? 0.45 : 0.34);
    g.lineCap = 'round'; g.lineJoin = 'round';
    function arrow(x, y, ang) { g.beginPath(); g.moveTo(x, y); g.lineTo(x - 16 * Math.cos(ang - 0.32), y - 16 * Math.sin(ang - 0.32)); g.lineTo(x - 16 * Math.cos(ang + 0.32), y - 16 * Math.sin(ang + 0.32)); g.closePath(); g.fillStyle = S; g.fill(); }
    function dim(x0, y0, x1, y1) { g.strokeStyle = S; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); var a = Math.atan2(y1 - y0, x1 - x0); arrow(x1, y1, a); arrow(x0, y0, a + Math.PI); }
    /* the protractor, top right */
    var cx = 2190, cy = 300;
    g.strokeStyle = S2; g.lineWidth = 1.2; g.setLineDash([14, 8, 2, 8]);
    g.beginPath(); g.moveTo(1660, cy); g.lineTo(W, cy); g.moveTo(cx, 0); g.lineTo(cx, 820); g.stroke(); g.setLineDash([]);
    g.strokeStyle = S; g.lineWidth = 1.8; [236, 176].forEach(function (r) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); });
    g.lineWidth = 1.2; g.beginPath(); g.arc(cx, cy, 42, 0, Math.PI * 2); g.stroke();
    for (var k = 0; k < 72; k++) { var a = k * Math.PI / 36, L = k % 6 === 0 ? 24 : 11; g.beginPath(); g.moveTo(cx + Math.cos(a) * 236, cy + Math.sin(a) * 236); g.lineTo(cx + Math.cos(a) * (236 + L), cy + Math.sin(a) * (236 + L)); g.lineWidth = k % 6 === 0 ? 1.8 : 1.1; g.stroke(); }
    g.lineWidth = 1.6; g.beginPath(); g.arc(cx, cy, 318, Math.PI * 0.62, Math.PI * 1.08); g.stroke();
    arrow(cx + Math.cos(Math.PI * 1.08) * 318, cy + Math.sin(Math.PI * 1.08) * 318, Math.PI * 1.08 + Math.PI / 2);
    arrow(cx + Math.cos(Math.PI * 0.62) * 318, cy + Math.sin(Math.PI * 0.62) * 318, Math.PI * 0.62 - Math.PI / 2);
    var ra = -Math.PI * 0.2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(ra) * 236, cy + Math.sin(ra) * 236); g.stroke();
    g.fillStyle = S; g.fillRect(cx + Math.cos(ra) * 236 - 5, cy + Math.sin(ra) * 236 - 5, 10, 10);
    /* the part, bottom left, with its dimensions */
    g.strokeStyle = S; g.lineWidth = 2; g.beginPath();
    g.moveTo(240, 1010); g.lineTo(700, 1010); g.arcTo(860, 1010, 860, 1170, 160); g.lineTo(860, 1250); g.lineTo(240, 1250); g.closePath(); g.stroke();
    g.beginPath(); g.arc(470, 1130, 62, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.1; g.strokeStyle = S2; g.setLineDash([14, 8, 2, 8]); g.beginPath(); g.moveTo(370, 1130); g.lineTo(570, 1130); g.moveTo(470, 1040); g.lineTo(470, 1220); g.stroke(); g.setLineDash([]);
    g.strokeStyle = S2; g.lineWidth = 1.1; g.beginPath(); g.moveTo(240, 1262); g.lineTo(240, 1345); g.moveTo(860, 1262); g.lineTo(860, 1345); g.moveTo(228, 1010); g.lineTo(150, 1010); g.moveTo(228, 1250); g.lineTo(150, 1250); g.stroke();
    dim(240, 1330, 860, 1330); dim(166, 1010, 166, 1250);
    g.strokeStyle = S2; g.beginPath(); g.moveTo(520, 1088); g.lineTo(640, 960); g.lineTo(760, 960); g.stroke(); g.beginPath(); g.arc(520, 1088, 4, 0, Math.PI * 2); g.fillStyle = S; g.fill();
    /* the bolt, bottom right */
    var bx = 2250, by = 1070; g.strokeStyle = S; g.lineWidth = 1.8;
    g.beginPath(); g.arc(bx, by, 112, 0, Math.PI * 2); g.stroke();
    g.beginPath(); for (var h = 0; h < 6; h++) { var ha = h * Math.PI / 3 + Math.PI / 6; g[h ? 'lineTo' : 'moveTo'](bx + Math.cos(ha) * 96, by + Math.sin(ha) * 96); } g.closePath(); g.stroke();
    g.beginPath(); g.arc(bx, by, 46, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = S2; g.lineWidth = 1.1; g.setLineDash([14, 8, 2, 8]); g.beginPath(); g.moveTo(bx - 160, by); g.lineTo(bx + 160, by); g.moveTo(bx, by - 160); g.lineTo(bx, by + 150); g.stroke(); g.setLineDash([]);
    /* the title block, in the bottom right corner */
    g.strokeStyle = S; g.lineWidth = 1.6; g.strokeRect(1880.5, 1270.5, 560, 120);
    g.lineWidth = 1.1; g.beginPath(); g.moveTo(1880, 1310.5); g.lineTo(2440, 1310.5); g.moveTo(2080.5, 1270); g.lineTo(2080.5, 1390); g.moveTo(2280.5, 1310); g.lineTo(2280.5, 1390); g.moveTo(2080, 1350.5); g.lineTo(2440, 1350.5); g.stroke();
    g.fillStyle = rgba(ink, dark ? 0.16 : 0.12); [[1896, 1284, 120], [2096, 1324, 90], [2296, 1324, 70], [2096, 1364, 150]].forEach(function (b) { g.fillRect(b[0], b[1], b[2], 8); });
    /* the ruler, along the top */
    g.strokeStyle = S2; g.lineWidth = 1.1; g.beginPath(); g.moveTo(300, 70.5); g.lineTo(1500, 70.5);
    for (var x = 300; x <= 1500; x += 16) { var tl = (x - 300) % 160 === 0 ? 22 : (x - 300) % 80 === 0 ? 14 : 7; g.moveTo(x + 0.5, 70); g.lineTo(x + 0.5, 70 + tl); } g.stroke();
    grain(g, dark ? 5 : 4, 11); return c;
  }

  /* Contour: a topographic survey. Hills sit at the corners; the middle is the flat valley, so it has no lines. */
  function contour(dark) {
    var c = canvas(), g = ctx(c), p = basicInk(dark), n = noise2(31);
    var cell = 5, cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1, F = new Float32Array(cols * rows);
    var hills = [[-120, 1520, 600, 1.05], [2680, -100, 580, 1.0], [2500, 1330, 360, 0.66], [330, 90, 330, 0.6], [1180, 1640, 380, 0.42], [1640, -180, 300, 0.38], [-60, 640, 230, 0.36]];
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      var x = i * cell, y = j * cell, f = 0;
      for (var k = 0; k < hills.length; k++) { var hh = hills[k], dx = x - hh[0], dy = y - hh[1]; f += hh[3] * Math.exp(-(dx * dx + dy * dy) / (2 * hh[2] * hh[2])); }
      /* the wobble of real ground, strongest on the slopes and fading out in the flat middle */
      F[j * cols + i] = f + (fbm(n, x / 380, y / 380, 3) - 0.5) * 0.16 * smooth(0.04, 0.3, f);
    }
    g.fillStyle = lin(g, 0, 0, W, H, [[0, p.g0], [1, p.g1]]); g.fillRect(0, 0, W, H);
    /* the higher ground a shade lighter (dark) or darker (light): a soft relief under the lines */
    var lo = canvas(cols, rows), lg = ctx(lo), im = lg.createImageData(cols, rows), d = im.data, tint = dark ? [150, 175, 205] : [40, 60, 95];
    for (var q = 0; q < F.length; q++) { d[q * 4] = tint[0]; d[q * 4 + 1] = tint[1]; d[q * 4 + 2] = tint[2]; d[q * 4 + 3] = Math.round(clamp(F[q], 0, 1.2) * (dark ? 30 : 16)); }
    lg.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(lo, 0, 0, cols * cell, rows * cell);
    var levels = []; for (var lv = 0.16; lv < 1.5; lv += 0.042) levels.push(lv);
    var P = contours(F, cols, rows, cell, levels, function (li) { return li % 5 === 4 ? 'major' : 'minor'; });
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = rgba(p.line, dark ? 0.24 : 0.16); g.lineWidth = 1.3; g.stroke(P.minor);
    g.strokeStyle = rgba(p.acc, dark ? 0.6 : 0.38); g.lineWidth = 2; g.stroke(P.major);
    /* survey marks on the summits that fall on the sheet: the highest point near each hill */
    var marks = [];
    hills.forEach(function (hh) {
      var best = -1, bx = 0, by = 0;
      for (var j2 = 0; j2 < rows; j2++) for (var i2 = 0; i2 < cols; i2++) {
        var x2 = i2 * cell, y2 = j2 * cell; if (x2 < 90 || y2 < 90 || x2 > W - 90 || y2 > H - 90) continue;
        if (Math.hypot(x2 - hh[0], y2 - hh[1]) > hh[2] * 0.9) continue;
        if (F[j2 * cols + i2] > best) { best = F[j2 * cols + i2]; bx = x2; by = y2; }
      }
      if (best > 0.5 && bx > 100 && by > 100 && bx < W - 100 && by < H - 100 && marks.every(function (m) { return Math.hypot(m[0] - bx, m[1] - by) > 300; })) marks.push([bx, by]);
    });
    marks.forEach(function (s) {
      g.strokeStyle = rgba(p.acc, dark ? 0.6 : 0.5); g.lineWidth = 1.6; g.beginPath(); g.moveTo(s[0] - 14, s[1]); g.lineTo(s[0] + 14, s[1]); g.moveTo(s[0], s[1] - 14); g.lineTo(s[0], s[1] + 14); g.stroke();
      g.beginPath(); g.moveTo(s[0], s[1] - 9); g.lineTo(s[0] + 8, s[1] + 6); g.lineTo(s[0] - 8, s[1] + 6); g.closePath(); g.stroke();
    });
    grain(g, dark ? 5 : 4, 12); return c;
  }

  /* Folds: a big sheet of paper folded and opened flat. Three creases, each facet lit from the top left. */
  function folds(dark) {
    var c = canvas(), g = ctx(c);
    function clip(poly, a, b, cc) {   /* keep the part of poly where a*x + b*y + cc >= 0 */
      var out = []; for (var i = 0; i < poly.length; i++) {
        var P = poly[i], Q = poly[(i + 1) % poly.length], sp = a * P[0] + b * P[1] + cc, sq = a * Q[0] + b * Q[1] + cc;
        if (sp >= 0) out.push(P); if ((sp >= 0) !== (sq >= 0)) { var t = sp / (sp - sq); out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]); }
      } return out;
    }
    function lineThrough(x0, y0, x1, y1) { var a = y1 - y0, b = x0 - x1, n = Math.hypot(a, b); a /= n; b /= n; return [a, b, -(a * x0 + b * y0)]; }
    var creases = [lineThrough(-200, 520, 2760, 1360), lineThrough(1720, -100, 900, 1560), lineThrough(-100, 1180, 980, -120), lineThrough(1900, 1560, 2700, 460)];
    var tilt = [[0.9, -0.5], [-0.6, -0.8], [0.7, 0.6], [-0.8, 0.3]];
    var polys = [{ pts: [[0, 0], [W, 0], [W, H], [0, H]], s: [] }];
    creases.forEach(function (L, ci) {
      var next = []; polys.forEach(function (p) {
        var A = clip(p.pts, L[0], L[1], L[2]), B = clip(p.pts, -L[0], -L[1], -L[2]);
        if (A.length > 2) next.push({ pts: A, s: p.s.concat([1]) }); if (B.length > 2) next.push({ pts: B, s: p.s.concat([-1]) });
      }); polys = next;
    });
    var base = dark ? [21, 24, 29] : [233, 236, 240], light = [0.6, -0.8];
    polys.forEach(function (p) {
      var nx = 0, ny = 0; p.s.forEach(function (sd, i) { nx += sd * tilt[i][0] * 0.25; ny += sd * tilt[i][1] * 0.25; });
      var lit = (nx * light[0] + ny * light[1]) * (dark ? 17 : 11);
      var col = [base[0] + lit, base[1] + lit, base[2] + lit * 1.15];
      var cx = 0, cy = 0; p.pts.forEach(function (q) { cx += q[0]; cy += q[1]; }); cx /= p.pts.length; cy /= p.pts.length;
      g.beginPath(); p.pts.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); g.closePath();
      g.fillStyle = lin(g, cx - 600 * light[0], cy - 600 * light[1], cx + 600 * light[0], cy + 600 * light[1], [[0, rgba(col.map(function (v) { return v + (dark ? 4 : 5); }), 1)], [1, rgba(col.map(function (v) { return v - (dark ? 3 : 4); }), 1)]]);
      g.fill();
    });
    /* each crease: a fine lit edge beside a fine shadow */
    creases.forEach(function (L) {
      var a = L[0], b = L[1], cc = L[2], pts = []; [[0, 0, W, 0], [W, 0, W, H], [W, H, 0, H], [0, H, 0, 0]].forEach(function (e) {
        var sp = a * e[0] + b * e[1] + cc, sq = a * e[2] + b * e[3] + cc; if ((sp >= 0) !== (sq >= 0)) { var t = sp / (sp - sq); pts.push([e[0] + (e[2] - e[0]) * t, e[1] + (e[3] - e[1]) * t]); }
      });
      if (pts.length < 2) return;
      g.lineWidth = 1.4; g.strokeStyle = dark ? 'rgba(255,255,255,.11)' : 'rgba(255,255,255,.85)'; g.beginPath(); g.moveTo(pts[0][0] + a, pts[0][1] + b); g.lineTo(pts[1][0] + a, pts[1][1] + b); g.stroke();
      g.strokeStyle = dark ? 'rgba(0,0,0,.45)' : 'rgba(40,50,70,.12)'; g.beginPath(); g.moveTo(pts[0][0] - a, pts[0][1] - b); g.lineTo(pts[1][0] - a, pts[1][1] - b); g.stroke();
    });
    grain(g, dark ? 5 : 4, 13); return c;
  }

  /* Sheets: paper on a desk. A stack at the bottom left, index cards at the top right, a clip; the desk is clear. */
  function sheets(dark) {
    var c = canvas(), g = ctx(c), p = basicInk(dark);
    g.fillStyle = lin(g, 0, 0, W, H, dark ? [[0, '#121418'], [1, '#0f1114']] : [[0, '#e4e7eb'], [1, '#dadee4']]); g.fillRect(0, 0, W, H);
    g.fillStyle = rad(g, W * 0.52, H * 0.48, 0, W * 0.52, H * 0.48, W * 0.55, dark ? [[0, 'rgba(255,255,255,.025)'], [1, 'rgba(0,0,0,0)']] : [[0, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(0, 0, W, H);
    var paper = dark ? ['#1f2329', '#262a31', '#2e333b'] : ['#eff1f4', '#f6f7f9', '#fcfcfd'];
    function sheet(x, y, w, h, rot, fill, opts) {
      g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180);
      g.shadowColor = dark ? 'rgba(0,0,0,.55)' : 'rgba(30,40,60,.16)'; g.shadowBlur = 54; g.shadowOffsetY = 18;
      g.fillStyle = fill; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
      g.strokeStyle = dark ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.9)'; g.lineWidth = 1.5; g.strokeRect(-w / 2 + 0.75, -h / 2 + 0.75, w - 1.5, h - 1.5);
      if (opts && opts.ruled) {
        g.strokeStyle = rgba(p.line, dark ? 0.08 : 0.08); g.lineWidth = 1.2; g.beginPath();
        for (var ly = -h / 2 + 150; ly < h / 2 - 40; ly += 38) { g.moveTo(-w / 2 + 30, ly); g.lineTo(w / 2 - 30, ly); } g.stroke();
        g.strokeStyle = rgba(p.acc, dark ? 0.42 : 0.38); g.lineWidth = 2; g.beginPath(); g.moveTo(-w / 2 + 120, -h / 2); g.lineTo(-w / 2 + 120, h / 2); g.stroke();
        /* a legal pad's double rule under the header, where it shows */
        g.beginPath(); g.moveTo(-w / 2, -h / 2 + 104); g.lineTo(w / 2, -h / 2 + 104); g.moveTo(-w / 2, -h / 2 + 111); g.lineTo(w / 2, -h / 2 + 111); g.lineWidth = 1.6; g.stroke();
      }
      if (opts && opts.graph) {
        g.strokeStyle = rgba(p.acc, dark ? 0.12 : 0.1); g.lineWidth = 1; g.beginPath();
        for (var gx = -w / 2 + 24; gx < w / 2; gx += 24) { g.moveTo(gx, -h / 2 + 50); g.lineTo(gx, h / 2 - 20); } for (var gy = -h / 2 + 50; gy < h / 2 - 20; gy += 24) { g.moveTo(-w / 2 + 24, gy); g.lineTo(w / 2 - 24, gy); } g.stroke();
        g.fillStyle = rgba(p.acc, dark ? 0.32 : 0.26); g.fillRect(-w / 2 + 24, -h / 2 + 18, 160, 10);
      }
      if (opts && opts.clip) {   /* a paper clip over the top edge */
        g.strokeStyle = dark ? 'rgba(190,200,215,.55)' : 'rgba(120,130,150,.75)'; g.lineWidth = 5; g.lineCap = 'round';
        var cx = opts.clip, cy = -h / 2 - 30; g.beginPath(); g.moveTo(cx, cy + 150); g.lineTo(cx, cy + 20); g.arc(cx + 22, cy + 20, 22, Math.PI, 0); g.lineTo(cx + 44, cy + 170); g.arc(cx + 26, cy + 170, 18, 0, Math.PI); g.lineTo(cx + 8, cy + 60); g.stroke();
      }
      g.restore();
    }
    sheet(260, 1340, 980, 1280, -14, paper[0]); sheet(300, 1290, 980, 1280, -7, paper[1]); sheet(330, 1260, 980, 1280, 2.5, paper[2], { ruled: true, clip: 260 });
    sheet(2330, 120, 760, 470, 11, paper[0]); sheet(2290, 160, 760, 470, 4, paper[1], { graph: true });
    sheet(2470, 1180, 520, 340, -9, paper[1]);
    grain(g, dark ? 4 : 3.5, 14); return c;
  }

  /* Arcs: two families of fine concentric arcs from beyond opposite corners; they thin out before the middle. */
  function arcs(dark) {
    var c = canvas(), g = ctx(c), p = basicInk(dark);
    g.fillStyle = rad(g, W * 0.5, H * 0.46, 0, W * 0.5, H * 0.5, W * 0.62, dark ? [[0, '#16191e'], [1, '#0e1114']] : [[0, '#f2f4f6'], [1, '#e2e6ea']]); g.fillRect(0, 0, W, H);
    var lay = canvas(), lg = ctx(lay);
    function family(cx, cy, r0, r1, step, seed) {
      var r = rng(seed);
      for (var k = 0, rr = r0; rr < r1; rr += step, k++) {
        var accent = k % 7 === 3, dotted = k % 7 === 5;
        lg.setLineDash(dotted ? [2, 12] : []); lg.lineCap = 'round';
        lg.strokeStyle = accent ? rgba(p.acc, dark ? 0.72 : 0.45) : rgba(p.line, (dark ? 0.22 : 0.15) * (0.75 + 0.5 * r()));
        lg.lineWidth = accent ? 2.2 : dotted ? 3 : 1.3;
        lg.beginPath(); lg.arc(cx, cy, rr, 0, Math.PI * 2); lg.stroke();
      }
      lg.setLineDash([]);
    }
    family(-240, 1690, 220, 2100, 40, 3); family(2800, -250, 220, 2100, 40, 5);
    /* fade both families out toward the middle so the panels sit on calm ground */
    lg.globalCompositeOperation = 'destination-out';
    lg.fillStyle = rad(lg, W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, 1150, [[0, 'rgba(0,0,0,1)'], [0.4, 'rgba(0,0,0,.92)'], [0.7, 'rgba(0,0,0,.55)'], [1, 'rgba(0,0,0,0)']]); lg.fillRect(0, 0, W, H);
    g.drawImage(lay, 0, 0);
    /* small markers where the accent arcs meet the edges */
    g.fillStyle = rgba(p.acc, dark ? 0.7 : 0.6); [[60, 1080], [710, 1410], [1840, 30], [2500, 590]].forEach(function (m) { g.fillRect(m[0] - 4, m[1] - 4, 8, 8); });
    grain(g, dark ? 5 : 4, 15); return c;
  }

  /* ================================================================================================================
     FRIENDLY: the DS, 3DS, Wii and Wii U menus, Cocoon and iiSU: rounded, soft, pastel, and always the dots.
     ================================================================================================================ */
  var FR = {
    mint: [95, 208, 176], teal: [43, 179, 163], sky: [90, 185, 224], cyan: [111, 211, 245], lav: [179, 157, 219], violet: [155, 123, 255],
    pink: [240, 160, 200], peach: [255, 181, 154], gold: [255, 211, 107], amber: [255, 159, 67], indigo: [99, 102, 241], cream: [251, 247, 243]
  };
  function frGround(g, dark) {
    g.fillStyle = lin(g, 0, 0, W, H, dark ? [[0, '#221f2a'], [1, '#1b1d29']] : [[0, '#fdf9f5'], [1, '#eef4fa']]); g.fillRect(0, 0, W, H);
    [[300, 180, 1000, FR.mint, 0.2], [2300, 1260, 1100, FR.lav, 0.22], [2260, 140, 800, FR.sky, 0.14], [400, 1300, 800, FR.peach, 0.1]].forEach(function (b) {
      g.fillStyle = rad(g, b[0], b[1], 0, b[0], b[1], b[2], [[0, rgba(b[3], dark ? b[4] * 0.6 : b[4])], [1, rgba(b[3], 0)]]); g.fillRect(0, 0, W, H);
    });
  }

  /* Dot Wave: the 3DS's dot grid with ripples running through it from two corners, as if a drop fell there. Each
     ring of the ripple swells the dots and takes the next pastel; the middle keeps the Friendly ground's quiet dots. */
  function dotwave(dark) {
    var c = canvas(), g = ctx(c); frGround(g, dark);
    if (dark) { g.fillStyle = 'rgba(60,52,84,.35)'; g.fillRect(0, 0, W, H); }
    var step = 34, lam = 250, ringCols = [FR.mint, FR.sky, FR.lav, FR.pink, FR.peach, FR.gold];
    var src = [[-220, H + 160, 2100], [W + 200, -200, 1650]], quiet = dark ? [200, 190, 225] : [122, 109, 140];
    for (var row = 0, y = step / 2; y < H + step; y += step * 0.866, row++) {
      for (var x = (row % 2 ? step / 2 : 0); x < W + step; x += step) {
        var best = 0, col = null;
        src.forEach(function (s) {
          var d = Math.hypot(x - s[0], y - s[1]), env = clamp(1 - d / s[2], 0, 1), w = 0.5 + 0.5 * Math.cos(2 * Math.PI * d / lam);
          var sw = Math.pow(env, 0.7) * Math.pow(w, 0.9);
          if (sw > best) { best = sw; col = ringCols[Math.floor((d + lam / 2) / lam) % ringCols.length]; }
        });
        var r = 2.2 + 9 * best;
        if (best < 0.05) { g.fillStyle = rgba(quiet, dark ? 0.17 : 0.26); r = 2.2; }
        else g.fillStyle = rgba(dark ? mix(col, [255, 255, 255], 0.08) : mix(col, [70, 60, 90], 0.08), dark ? 0.2 + 0.55 * best : 0.28 + 0.6 * best);
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    }
    grain(g, dark ? 3 : 2.5, 21); return c;
  }

  /* Channels: the Wii's channel wall and the Wii U's tiles, two walls of rounded tiles receding to a soft haze, over
     a floor of dots going into the distance. */
  function channels(dark) {
    var c = canvas(), g = ctx(c);
    g.fillStyle = lin(g, 0, 0, 0, H, dark ? [[0, '#1d1b26'], [0.5, '#24212d'], [1, '#1c1a24']] : [[0, '#eef3f8'], [0.5, '#fbf8f4'], [1, '#f1eef6']]); g.fillRect(0, 0, W, H);
    var VX = W / 2, VY = H * 0.47, f = 980;
    function P(x, y, z) { return [VX + f * x / z, VY + f * y / z]; }
    /* the floor and the ceiling: dots on a receding grid */
    [[1.05, dark ? [200, 190, 225] : [122, 109, 140]], [-1.05, dark ? [200, 190, 225] : [122, 109, 140]]].forEach(function (pl) {
      for (var z = 0.5; z < 9; z += 0.16) for (var x = -3.2; x <= 3.2; x += 0.16) {
        var q = P(x, pl[0], z); if (q[0] < -20 || q[0] > W + 20 || q[1] < -20 || q[1] > H + 20) continue;
        var rr = Math.max(0.8, 7.5 / z), a = (dark ? 0.24 : 0.3) * clamp(1.4 - z / 6.5, 0, 1);
        g.fillStyle = rgba(pl[1], a); g.beginPath(); g.arc(q[0], q[1], rr, 0, Math.PI * 2); g.fill();
      }
    });
    var pairs = [[FR.mint, FR.teal], [FR.cyan, FR.violet], [FR.gold, FR.amber], [FR.lav, FR.indigo], [FR.pink, FR.peach], [FR.sky, FR.mint]];
    function tile(side, z0, y0, dz, dy, k) {
      var pts = [], R = 0.07, steps = 6, X = side * 1.15;
      var corners = [[z0 + dz - R, y0 + R, -Math.PI / 2], [z0 + dz - R, y0 + dy - R, 0], [z0 + R, y0 + dy - R, Math.PI / 2], [z0 + R, y0 + R, Math.PI]];
      corners.forEach(function (cn) { for (var s = 0; s <= steps; s++) { var a = cn[2] + s / steps * Math.PI / 2; pts.push(P(X, cn[1] + Math.sin(a) * R, cn[0] + Math.cos(a) * R)); } });
      var top = P(X, y0, z0 + dz / 2), bot = P(X, y0 + dy, z0 + dz / 2), pr = pairs[k % pairs.length];
      function path() { g.beginPath(); pts.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); g.closePath(); }
      var a0 = dark ? 0.92 : 1, c0 = dark ? mix(pr[0], [30, 28, 40], 0.35) : mix(pr[0], [255, 255, 255], 0.45), c1 = dark ? mix(pr[1], [30, 28, 40], 0.3) : mix(pr[1], [255, 255, 255], 0.25);
      path(); g.shadowColor = dark ? 'rgba(0,0,0,.45)' : 'rgba(80,70,110,.16)'; g.shadowBlur = 40 / z0; g.shadowOffsetY = 14 / z0;
      g.fillStyle = lin(g, top[0], top[1], bot[0], bot[1], [[0, rgba(c0, a0)], [1, rgba(c1, a0)]]); g.fill(); g.shadowColor = 'transparent';
      /* the gloss: the upper part a little whiter, the Wii's soft sheen */
      g.save(); path(); g.clip(); var mid = P(X, y0 + dy * 0.46, z0 + dz / 2);
      g.fillStyle = lin(g, top[0], top[1], mid[0], mid[1], [[0, 'rgba(255,255,255,' + (dark ? 0.16 : 0.42) + ')'], [1, 'rgba(255,255,255,0)']]); g.fillRect(0, 0, W, H);
      /* three small dots on each tile, the channel's mark */
      for (var dd = 0; dd < 3; dd++) { var q = P(X, y0 + dy * 0.72, z0 + dz * (0.32 + dd * 0.18)); g.fillStyle = 'rgba(255,255,255,' + (dark ? 0.35 : 0.75) + ')'; g.beginPath(); g.arc(q[0], q[1], 9 / (z0 + dz / 2), 0, Math.PI * 2); g.fill(); }
      g.restore();
      path(); g.strokeStyle = 'rgba(255,255,255,' + (dark ? 0.32 : 0.9) + ')'; g.lineWidth = Math.max(1, 4 / z0); g.stroke();
    }
    /* far tiles first, so nearer ones cover them */
    var cells = []; [-1, 1].forEach(function (side) { for (var col = 0; col < 9; col++) for (var row = 0; row < 3; row++) cells.push([side, 0.62 + col * 0.62, -0.78 + row * 0.53, col * 3 + row + (side > 0 ? 2 : 0)]); });
    cells.sort(function (a, b) { return b[1] - a[1]; }).forEach(function (t) { tile(t[0], t[1], t[2], 0.52, 0.45, t[3]); });
    /* the haze: the distance melts into the ground colour, so the middle stays calm */
    var hz = dark ? [33, 30, 40] : [251, 248, 244];
    g.fillStyle = rad(g, VX, VY, 0, VX, VY, 820, [[0, rgba(hz, 1)], [0.42, rgba(hz, 0.92)], [0.75, rgba(hz, 0.35)], [1, rgba(hz, 0)]]); g.fillRect(0, 0, W, H);
    grain(g, dark ? 4 : 3, 22); return c;
  }

  /* Bubbles: soap bubbles drifting up from the corners, each with a pastel film and a bright rim, over the dots. */
  function bubbles(dark) {
    var c = canvas(), g = ctx(c);
    g.fillStyle = lin(g, 0, 0, W * 0.3, H, dark ? [[0, '#1c1b29'], [1, '#232032']] : [[0, '#eef6fd'], [1, '#f8f2fb']]); g.fillRect(0, 0, W, H);
    [[400, 1200, 900, FR.mint, 0.18], [2200, 260, 900, FR.lav, 0.2]].forEach(function (b) { g.fillStyle = rad(g, b[0], b[1], 0, b[0], b[1], b[2], [[0, rgba(b[3], dark ? b[4] * 0.6 : b[4])], [1, rgba(b[3], 0)]]); g.fillRect(0, 0, W, H); });
    dots(g, 26, 1.7, dark ? 'rgba(200,190,225,.11)' : 'rgba(122,109,140,.15)');
    var list = [[230, 1250, 265, 0], [560, 1340, 150, 1], [110, 960, 112, 2], [440, 1060, 72, 3], [720, 1225, 54, 4], [330, 850, 40, 5], [820, 1370, 34, 1], [610, 960, 26, 2],
      [2330, 200, 245, 3], [2060, 110, 122, 4], [2490, 480, 132, 0], [2150, 400, 60, 1], [1910, 280, 42, 2], [2440, 760, 46, 5], [2520, 1000, 88, 4], [2280, 1230, 64, 3], [1980, 520, 24, 0], [2400, 1340, 30, 1]];
    var tints = [FR.mint, FR.sky, FR.lav, FR.pink, FR.gold, FR.cyan];
    list.forEach(function (b) {
      var x = b[0], y = b[1], r = b[2], t = tints[b[3]];
      g.save();
      if (dark) { g.shadowColor = rgba(t, 0.45); g.shadowBlur = r * 0.35; }
      g.fillStyle = rad(g, x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r, [[0, dark ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.22)'], [0.72, rgba(t, dark ? 0.1 : 0.14)], [0.94, rgba(t, dark ? 0.34 : 0.42)], [1, rgba(t, dark ? 0.55 : 0.6)]]);
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore();
      /* the film: a faint ring of colours around the rim */
      var cg = g.createConicGradient(b[3], x, y); [[0, FR.pink], [0.2, FR.gold], [0.4, FR.mint], [0.6, FR.cyan], [0.8, FR.violet], [1, FR.pink]].forEach(function (s) { cg.addColorStop(s[0], rgba(s[1], dark ? 0.3 : 0.35)); });
      g.strokeStyle = cg; g.lineWidth = Math.max(2, r * 0.07); g.beginPath(); g.arc(x, y, r * 0.95, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = dark ? rgba(mix(t, [255, 255, 255], 0.4), 0.75) : 'rgba(255,255,255,.95)'; g.lineWidth = Math.max(1.5, r * 0.012); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
      /* the window light: a crescent at the top left and a small spot opposite */
      g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,' + (dark ? 0.55 : 0.9) + ')'; g.lineWidth = Math.max(2, r * 0.08);
      g.beginPath(); g.arc(x, y, r * 0.78, Math.PI * 1.08, Math.PI * 1.42); g.stroke();
      g.fillStyle = 'rgba(255,255,255,' + (dark ? 0.45 : 0.85) + ')'; g.beginPath(); g.arc(x + r * 0.52, y + r * 0.5, Math.max(1.5, r * 0.06), 0, Math.PI * 2); g.fill();
    });
    /* sparkles between them */
    var r = rng(9); for (var s = 0; s < 70; s++) {
      var sx = r() < 0.5 ? r() * 900 : W - r() * 900, sy = sx < W / 2 ? H - r() * 700 : r() * 900, sr = 2 + r() * 4;
      g.fillStyle = rgba(tints[s % tints.length], dark ? 0.55 : 0.6); g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
    }
    grain(g, dark ? 4 : 3, 23); return c;
  }

  /* Hills: the Mii plaza's rolling hills, round trees and soft clouds, under a dotted sky (stars at night). */
  function hills(dark) {
    var c = canvas(), g = ctx(c), r = rng(41);
    g.fillStyle = lin(g, 0, 0, 0, H, dark ? [[0, '#151a33'], [0.6, '#2a2442'], [1, '#2f2540']] : [[0, '#cfe9f8'], [0.62, '#f7f3ee'], [1, '#fbf6ef']]); g.fillRect(0, 0, W, H);
    /* the dots of the sky (stars at night), fading toward the horizon */
    for (var row = 0, y = 18; y < H * 0.62; y += 30, row++) for (var x = (row % 2 ? 15 : 0); x < W; x += 30) {
      var fade = 1 - y / (H * 0.62); if (dark && r() < 0.06) { g.fillStyle = 'rgba(255,248,225,' + (0.4 + 0.5 * r()) * fade + ')'; g.beginPath(); g.arc(x, y, 2.2 + r() * 1.6, 0, Math.PI * 2); g.fill(); continue; }
      g.fillStyle = dark ? 'rgba(200,190,235,' + 0.16 * fade + ')' : 'rgba(110,150,190,' + 0.2 * fade + ')'; g.beginPath(); g.arc(x, y, 1.9, 0, Math.PI * 2); g.fill();
    }
    if (dark) {   /* the moon, a crescent */
      var m = canvas(400, 400), mg = ctx(m); mg.fillStyle = '#f3ebd3'; mg.beginPath(); mg.arc(200, 200, 90, 0, Math.PI * 2); mg.fill();
      mg.globalCompositeOperation = 'destination-out'; mg.beginPath(); mg.arc(240, 175, 82, 0, Math.PI * 2); mg.fill();
      g.save(); g.shadowColor = 'rgba(243,235,211,.5)'; g.shadowBlur = 60; g.drawImage(m, 2030, 30); g.restore();
    } else {   /* the sun: a flat disc inside two soft rings, the way a menu would draw it */
      [[200, 0.14], [150, 0.24]].forEach(function (s) { g.fillStyle = 'rgba(255,226,140,' + s[1] + ')'; g.beginPath(); g.arc(2180, 230, s[0], 0, Math.PI * 2); g.fill(); });
      g.fillStyle = lin(g, 0, 140, 0, 320, [[0, '#fff0b8'], [1, '#ffd98a']]); g.beginPath(); g.arc(2180, 230, 100, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(2148, 196, 30, 0, Math.PI * 2); g.fill();
    }
    /* clouds: overlapping rounds, flat on the bottom, a soft shade underneath */
    function cloud(cx, cy, s) {
      var parts = [[-1.1, 0.15, 0.62], [-0.45, -0.25, 0.85], [0.35, -0.4, 1], [1.05, 0, 0.7], [0.1, 0.2, 0.75]];
      g.save(); g.beginPath(); parts.forEach(function (q) { g.moveTo(cx + q[0] * s + q[2] * s, cy + q[1] * s); g.arc(cx + q[0] * s, cy + q[1] * s, q[2] * s, 0, Math.PI * 2); });
      g.rect(cx - 1.8 * s, cy + 0.32 * s, 3.6 * s, 0.6 * s); g.restore();
      g.save(); g.beginPath(); parts.forEach(function (q) { g.moveTo(cx + q[0] * s + q[2] * s, cy + q[1] * s); g.arc(cx + q[0] * s, cy + q[1] * s, q[2] * s, 0, Math.PI * 2); });
      g.clip(); g.fillStyle = dark ? lin(g, 0, cy - s, 0, cy + s, [[0, 'rgba(120,110,170,.38)'], [1, 'rgba(70,64,110,.3)']]) : lin(g, 0, cy - s, 0, cy + s, [[0, '#ffffff'], [1, '#e3edf6']]);
      g.fillRect(cx - 3 * s, cy - 2 * s, 6 * s, 2.32 * s); g.restore();
    }
    cloud(330, 230, 70); cloud(1640, 150, 46); cloud(2420, 520, 52); cloud(740, 420, 34);
    /* four rows of hills, far to near, each dotted, each with a lit crest */
    var layers = dark ? [['#283a52', '#2c4560', 0.58], ['#21434c', '#24505a', 0.66], ['#1d5050', '#215e5c', 0.74], ['#226758', '#277563', 0.84]]
                      : [['#d5efe5', '#c8eadc', 0.58], ['#b0e3cf', '#9fdcc4', 0.66], ['#86d4b6', '#73cba9', 0.74], ['#5fc09e', '#4fb592', 0.84]];
    layers.forEach(function (L, li) {
      var base = H * L[2], amp = H * (0.06 + li * 0.012), ph = li * 1.9;
      function top(x) { return base - amp * (0.55 * Math.sin(x / W * Math.PI * (1.6 + li * 0.35) + ph) + 0.3 * Math.sin(x / W * Math.PI * 4.1 + ph * 2.3) + 0.15 * Math.cos(x / W * Math.PI * 7 + li)); }
      g.beginPath(); g.moveTo(0, H); for (var x = 0; x <= W; x += 8) g.lineTo(x, top(x)); g.lineTo(W, H); g.closePath();
      g.save(); g.fillStyle = lin(g, 0, base - amp, 0, H, [[0, L[0]], [1, L[1]]]); g.fill(); g.clip();
      dots(g, 24 - li * 2, 2 + li * 0.5, dark ? 'rgba(255,255,255,.05)' : 'rgba(40,120,95,.13)', 0, base - amp * 1.4, W, H, true);
      g.restore();
      g.beginPath(); for (var x2 = 0; x2 <= W; x2 += 8) { var yy = top(x2); x2 ? g.lineTo(x2, yy) : g.moveTo(x2, yy); }
      g.strokeStyle = dark ? 'rgba(170,220,215,' + (0.16 + li * 0.05) + ')' : 'rgba(255,255,255,.9)'; g.lineWidth = 3; g.stroke();
      if (li === 1 || li === 2) {   /* round trees, only near the sides */
        [0.04, 0.09, 0.15, 0.82, 0.88, 0.95].forEach(function (fx, ti) {
          if ((li === 1) === (ti % 2 === 0)) return;
          var tx = fx * W, ty = top(tx) + 6, tr = 26 + li * 8;
          g.fillStyle = dark ? '#3b2f3a' : '#b98f6d'; g.fillRect(tx - 4, ty - tr * 0.9, 8, tr * 0.95);
          g.fillStyle = dark ? (li === 1 ? '#2b6a5c' : '#2f7b67') : (li === 1 ? '#7fd1b1' : '#5fc29f'); g.beginPath(); g.arc(tx, ty - tr * 1.35, tr, 0, Math.PI * 2); g.fill();
          g.fillStyle = 'rgba(255,255,255,' + (dark ? 0.12 : 0.4) + ')'; g.beginPath(); g.arc(tx - tr * 0.35, ty - tr * 1.65, tr * 0.32, 0, Math.PI * 2); g.fill();
        });
      }
    });
    grain(g, dark ? 4 : 3, 24); return c;
  }

  /* Soft Stripes: the Wii U's diagonal stripes in iiSU's pastel gradients, each stripe filled with dots; the middle
     washes out to the ground. */
  function stripes(dark) {
    var c = canvas(), g = ctx(c), ang = -0.6, ca = Math.cos(ang), sa = Math.sin(ang), band = 150;
    var bg = dark ? [33, 30, 38] : [251, 247, 243];
    g.fillStyle = rgba(bg, 1); g.fillRect(0, 0, W, H);
    var hues = [[0, FR.mint], [0.25, FR.sky], [0.5, FR.lav], [0.75, FR.pink], [1, FR.peach]];
    g.save(); g.translate(W / 2, H / 2); g.rotate(ang);
    var span = Math.hypot(W, H) / 2 + band;
    for (var k = -Math.ceil(span / band), i = 0; k * band < span; k++, i++) {
      if (k % 2 === 0) continue;
      var y0 = k * band;
      for (var seg = -span; seg < span; seg += 40) {   /* the colour shifts along the stripe */
        var t = (seg + span) / (2 * span), col = ramp(hues, t);
        g.fillStyle = rgba(dark ? mix(col, [33, 30, 38], 0.8) : mix(col, [255, 255, 255], 0.55), 1); g.fillRect(seg, y0, 41, band);
      }
      g.fillStyle = dark ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.9)'; g.fillRect(-span, y0 - 2, 2 * span, 4); g.fillRect(-span, y0 + band - 2, 2 * span, 4);
    }
    g.restore();
    /* dots everywhere, stronger inside the stripes */
    var step = 26; for (var row = 0, y = 13; y < H; y += step, row++) for (var x = (row % 2 ? 13 : 0); x < W; x += step) {
      var v = (-(x - W / 2) * sa + (y - H / 2) * ca), inBand = Math.floor(v / band) % 2 !== 0;
      var col = inBand ? ramp(hues, clamp(((x - W / 2) * ca + (y - H / 2) * sa + span) / (2 * span), 0, 1)) : (dark ? [200, 190, 225] : [122, 109, 140]);
      g.fillStyle = rgba(dark ? mix(col, [255, 255, 255], 0.12) : mix(col, [60, 50, 80], 0.15), inBand ? (dark ? 0.42 : 0.38) : (dark ? 0.13 : 0.2));
      g.beginPath(); g.arc(x, y, inBand ? 2.6 : 1.7, 0, Math.PI * 2); g.fill();
    }
    /* the middle washes out to the ground */
    g.fillStyle = rad(g, W / 2, H / 2, 0, W / 2, H / 2, 1050, [[0, rgba(bg, 0.9)], [0.45, rgba(bg, 0.72)], [1, rgba(bg, 0)]]); g.fillRect(0, 0, W, H);
    grain(g, dark ? 4 : 3, 25); return c;
  }

  /* ================================================================================================================
     RETRO: phosphor (dark) and the printed manual (light). Pixel art drawn small and scaled up by whole pixels; square
     corners and stepped gradients. Two inks per mode, as the look has.
     ================================================================================================================ */
  function rpal(dark) {
    return dark ? { bg: hex('#0c0e0a'), sky: [hex('#0c0e0a'), hex('#0f120c'), hex('#12160e'), hex('#161b11'), hex('#1b2214'), hex('#212a18')], dim: hex('#1f2618'), mid: hex('#3a4a26'), hi: hex('#b8d066'), hi2: hex('#7f9a3c'), warm: hex('#e0a84a'), warm2: hex('#9a6a26'), cool: hex('#9db4d0'), white: hex('#e8efd6') }
                : { bg: hex('#f5f0e8'), sky: [hex('#f5f0e8'), hex('#f2ece2'), hex('#efe8dc'), hex('#ebe3d5'), hex('#e7dece'), hex('#e2d8c6')], dim: hex('#e2d8c6'), mid: hex('#c9bfae'), hi: hex('#0047ab'), hi2: hex('#5b7fc4'), warm: hex('#b4442e'), warm2: hex('#d98c76'), cool: hex('#a9bbdd'), white: hex('#1a1a1a') };
  }

  /* Horizon: a vector-era horizon. A banded sun low on the right, a ridge, and a grid floor running to the horizon. */
  function horizon(dark) {
    var p = rpal(dark), w = 640, h = 360, X = Pix(w, h), r = rng(51), HY = 222;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) X.set(x, y, dith(p.sky, y / HY, x, y));
    if (dark) for (var s = 0; s < 140; s++) { var sx = Math.floor(r() * w), sy = Math.floor(r() * (HY - 70)); X.set(sx, sy, r() < 0.2 ? p.cool : r() < 0.5 ? p.hi2 : p.mid); }
    /* the sun, banded and striped in its lower half */
    var cx = 476, cy = 176, R = 60, sun = dark ? [p.warm2, p.warm, hex('#f2d27a'), p.hi] : [p.cool, p.hi2, p.hi, p.hi];
    for (var y2 = cy - R; y2 <= HY; y2++) for (var x2 = cx - R; x2 <= cx + R; x2++) {
      var dx = x2 - cx, dy = y2 - cy; if (dx * dx + dy * dy > R * R) continue;
      var t = (y2 - (cy - R)) / (2 * R); if (t > 0.5) { var band = (y2 - cy) % 9; if (band < 1 + (y2 - cy) / 12) continue; }
      X.set(x2, y2, dith(sun, 1 - t * 0.9, x2, y2));
    }
    /* a ridge across the horizon, stepped */
    var ridge = []; for (var x3 = 0; x3 < w; x3++) ridge[x3] = 0;
    [[60, 34, 90], [170, 22, 70], [300, 12, 60], [560, 30, 80], [620, 18, 60]].forEach(function (m) { for (var x4 = 0; x4 < w; x4++) ridge[x4] = Math.max(ridge[x4], m[1] - Math.abs(x4 - m[0]) * m[1] / m[2]); });
    for (var x5 = 0; x5 < w; x5++) { var top = HY - Math.round(ridge[x5] / 2) * 2; for (var y5 = top; y5 < HY; y5++) X.set(x5, y5, y5 === top ? p.hi2 : p.dim); }
    /* the floor */
    for (var y6 = HY; y6 < h; y6++) for (var x6 = 0; x6 < w; x6++) X.set(x6, y6, dark ? p.bg : p.sky[1]);
    /* the grid: rails converging on the vanishing point, drawn only where they are at least two pixels apart, and
       cross lines spaced by depth; both brighten toward the viewer */
    for (var k = -26; k <= 26; k++) {
      var x0 = 320 + k * 40, prev = null;
      for (var y8 = HY + 1; y8 < h; y8++) {
        var t8 = (y8 - HY) / (h + 40 - HY), xx = Math.round(320 + (x0 - 320) * t8);
        if (Math.abs(40 * t8) < 6) continue;
        var cl = y8 > HY + 70 ? p.hi2 : p.mid;
        if (prev !== null && Math.abs(xx - prev) > 1) X.line(prev, y8 - 1, xx, y8, cl); else X.set(xx, y8, cl);
        prev = xx;
      }
    }
    for (var i = 6; i < 16; i++) { var yy = HY + Math.round(140 * Math.pow(i / 15, 2.1)); for (var x7 = 0; x7 < w; x7++) X.set(x7, yy, i > 9 ? p.hi : i > 5 ? p.hi2 : p.mid); }
    /* the haze at the horizon, dithered */
    for (var y9 = HY + 1; y9 < HY + 9; y9++) for (var x9 = 0; x9 < w; x9++) if (y9 < HY + 4 || dith([0, 1], 1 - (y9 - HY - 4) / 5, x9, y9)) X.set(x9, y9, dark ? p.sky[5] : p.sky[3]);
    return X.out();
  }

  /* Peaks: ranges of stepped mountains with lit ridges; a pixel moon and stars (dark) or a pale sun (light). */
  function peaks(dark) {
    var p = rpal(dark), w = 512, h = 288, X = Pix(w, h), r = rng(61);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) X.set(x, y, dith(p.sky, y / (h * 0.75), x, y));
    if (dark) {
      for (var s = 0; s < 120; s++) { var sx = Math.floor(r() * w), sy = Math.floor(r() * 150); X.set(sx, sy, r() < 0.3 ? p.white : r() < 0.6 ? p.hi2 : p.mid); }
      X.disc(408, 52, 15, hex('#c9d3b0')); [[402, 46, 3], [413, 58, 2], [410, 44, 1], [400, 58, 2]].forEach(function (cr) { X.disc(cr[0], cr[1], cr[2], hex('#8f9a78')); });
    } else {
      for (var y1 = 30; y1 < 90; y1++) for (var x1 = 60; x1 < 120; x1++) { var dd = Math.hypot(x1 - 90, y1 - 60); if (dd < 18) X.set(x1, y1, p.cool); else if (dd < 26 && dith([0, 1], 1 - (dd - 18) / 8, x1, y1)) X.set(x1, y1, p.cool); }
    }
    /* a range: peaks as straight-sided triangles (the max of them), roughened a little, stepped two pixels at a time */
    function ridge(seed, base, amp, count) {
      var rr = rng(seed), R = new Float32Array(w), n = noise2(seed + 5);
      for (var x2 = 0; x2 < w; x2++) R[x2] = base;
      for (var k = 0; k < count; k++) {
        var px = -30 + rr() * (w + 60), ph = amp * (0.4 + 0.6 * rr()), sl = 0.5 + 0.55 * rr(), asym = 0.75 + 0.5 * rr();
        for (var x3 = 0; x3 < w; x3++) { var dx = x3 - px, v = base - (ph - Math.abs(dx) * sl * (dx < 0 ? asym : 1 / asym)); if (v < R[x3]) R[x3] = v; }
      }
      for (var x4 = 0; x4 < w; x4++) R[x4] = Math.round((R[x4] + (n(x4 / 7, seed) - 0.5) * 5) / 2) * 2;
      return R;
    }
    /* far ranges paler (dark: lifted toward the haze; light: toward the paper), the front one strongest */
    var cols = dark ? [hex('#2c3824'), hex('#222c1a'), hex('#181f12'), hex('#0f140b')] : [hex('#dde2ec'), hex('#bccbe3'), hex('#86a0cf'), hex('#2f5db3')];
    var lit = dark ? [hex('#3d4b30'), hex('#2f3c23'), hex('#232d18'), hex('#182010')] : [hex('#eceff5'), hex('#d4ddee'), hex('#a7bbe0'), hex('#5b7fc4')];
    var snow = dark ? hex('#7a8760') : hex('#f7f3ec');
    [[71, 182, 92, 9], [72, 206, 84, 10], [73, 232, 64, 9], [74, 262, 36, 8]].forEach(function (L, li) {
      var R = ridge(L[0], L[1], L[2], L[3]);
      for (var x5 = 0; x5 < w; x5++) {
        var top = Math.max(0, R[x5]), rising = x5 + 1 < w && R[x5 + 1] < R[x5];   /* a slope that faces the light (left) */
        for (var y5 = top; y5 < h; y5++) X.set(x5, y5, rising && (y5 < top + 3 || (y5 < top + 12 && dith([0, 1], 1 - (y5 - top - 3) / 9, x5, y5))) ? lit[li] : cols[li]);
        if (li < 2 && top < L[1] - L[2] * 0.62) for (var sn = 0; sn < 5 - li * 2; sn++) X.set(x5, top + sn, snow);
      }
    });
    return X.out();
  }

  /* Circuit: a board's traces running in from the edges at right angles and diagonals to pads, vias and two chips; a
     few traces carry signal. The middle of the board is bare. */
  function circuit(dark) {
    var p = rpal(dark), w = 640, h = 360, X = Pix(w, h), r = rng(81), G = 6, gw = Math.floor(w / G), gh = Math.floor(h / G), occ = new Uint8Array(gw * gh);
    X.fill(dark ? hex('#0d100b') : hex('#f3ede2'));
    var grid = dark ? hex('#161c12') : hex('#e6dccb'); for (var y = 3; y < h; y += G) for (var x = 3; x < w; x += G) X.set(x, y, grid);
    function busy(i, j) { if (i < 0 || j < 0 || i >= gw || j >= gh) return true; var dx = (i - gw / 2) / (gw * 0.34), dy = (j - gh / 2) / (gh * 0.36); return dx * dx + dy * dy < 1 || occ[j * gw + i]; }
    var board = dark ? hex('#0d100b') : hex('#f3ede2'), trace = dark ? hex('#2e3923') : hex('#cbbda5'), lit = p.hi, glow = dark ? hex('#2a3518') : hex('#c9d3e6'), pad = dark ? p.warm : hex('#1a1a1a');
    var dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    /* chips first, so traces route around them */
    var chips = [[48, 44, 60, 30], [522, 284, 72, 36], [548, 30, 36, 22], [40, 300, 34, 22]];
    chips.forEach(function (cp) { for (var j0 = Math.floor((cp[1] - 8) / G); j0 <= Math.ceil((cp[1] + cp[3] + 8) / G); j0++) for (var i0 = Math.floor((cp[0] - 8) / G); i0 <= Math.ceil((cp[0] + cp[2] + 8) / G); i0++) if (i0 >= 0 && j0 >= 0 && i0 < gw && j0 < gh) occ[j0 * gw + i0] = 1; });
    function walk(moves, i, j, col) {
      var path = [[i, j]];
      for (var s = 0; s < moves.length; s++) { var ni = i + dirs[moves[s]][0], nj = j + dirs[moves[s]][1]; if (busy(ni, nj)) break; i = ni; j = nj; occ[j * gw + i] = 1; path.push([i, j]); }
      if (path.length < 3) return;
      for (var k = 1; k < path.length; k++) {
        var ax = path[k - 1][0] * G + 3, ay = path[k - 1][1] * G + 3, bx = path[k][0] * G + 3, by = path[k][1] * G + 3;
        if (col === lit) { X.line(ax + 1, ay, bx + 1, by, glow); X.line(ax - 1, ay, bx - 1, by, glow); X.line(ax, ay + 1, bx, by + 1, glow); X.line(ax, ay - 1, bx, by - 1, glow); }
      }
      for (var k2 = 1; k2 < path.length; k2++) X.line(path[k2 - 1][0] * G + 3, path[k2 - 1][1] * G + 3, path[k2][0] * G + 3, path[k2][1] * G + 3, col);
      var e = path[path.length - 1], ex = e[0] * G + 3, ey = e[1] * G + 3;
      if (r() < 0.55) { for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) if (Math.max(Math.abs(a), Math.abs(b)) === 2) X.set(ex + a, ey + b, col === lit ? lit : pad); }
      else { X.rect(ex - 1, ey - 1, 3, 3, col === lit ? lit : pad); X.set(ex, ey, board); }
    }
    /* a run of moves: mostly straight, with 45 degree bends; a bus is two to four traces side by side on the same moves */
    for (var n = 0; n < 240; n++) {
      var side = Math.floor(r() * 4), i, j, d;
      if (side === 0) { i = 0; j = Math.floor(r() * gh); d = 0; } else if (side === 1) { i = gw - 1; j = Math.floor(r() * gh); d = 4; } else if (side === 2) { i = Math.floor(r() * gw); j = 0; d = 2; } else { i = Math.floor(r() * gw); j = gh - 1; d = 6; }
      var len = 5 + Math.floor(r() * 24), moves = [], dd = d;
      for (var m = 0; m < len; m++) { if (m > 2 && r() < 0.18) dd = (d + (dd === d ? (r() < 0.5 ? 1 : 7) : 0)) % 8; moves.push(dd); }
      var lanes = r() < 0.45 ? 2 + Math.floor(r() * 3) : 1, col = r() < 0.13 ? lit : trace, perp = d === 0 || d === 4 ? [0, 1] : [1, 0];
      for (var ln = 0; ln < lanes; ln++) { var li2 = i + perp[0] * ln, lj = j + perp[1] * ln; if (!busy(li2, lj)) { occ[lj * gw + li2] = 1; walk(moves, li2, lj, col); } }
    }
    /* the chips: a dark body (an ink outline on paper), pins on two sides, the pin-one dot, a silkscreen frame */
    chips.forEach(function (cp) {
      var x0 = cp[0], y0 = cp[1], cw = cp[2], ch = cp[3], silk = dark ? hex('#3c4630') : hex('#b9ac94');
      for (var sx = x0 - 6; sx <= x0 + cw + 5; sx++) { X.set(sx, y0 - 6, silk); X.set(sx, y0 + ch + 5, silk); } for (var sy = y0 - 6; sy <= y0 + ch + 5; sy++) { X.set(x0 - 6, sy, silk); X.set(x0 + cw + 5, sy, silk); }
      X.rect(x0, y0, cw, ch, dark ? hex('#171c12') : hex('#e4dac8'));
      for (var ox = x0; ox < x0 + cw; ox++) { X.set(ox, y0, dark ? p.mid : hex('#1a1a1a')); X.set(ox, y0 + ch - 1, dark ? p.mid : hex('#1a1a1a')); } for (var oy = y0; oy < y0 + ch; oy++) { X.set(x0, oy, dark ? p.mid : hex('#1a1a1a')); X.set(x0 + cw - 1, oy, dark ? p.mid : hex('#1a1a1a')); }
      for (var px = x0 + 3; px < x0 + cw - 2; px += 4) { X.rect(px, y0 - 3, 2, 3, dark ? p.warm2 : hex('#8a8173')); X.rect(px, y0 + ch, 2, 3, dark ? p.warm2 : hex('#8a8173')); }
      X.disc(x0 + 5, y0 + 5, 1, dark ? p.hi2 : p.hi);
    });
    return X.out();
  }

  /* Dither: eight-bit space. A banded planet with a ring rises from the bottom right, a small moon at the top left,
     all in ordered dithering: phosphor greens and amber (dark) or blue and red ink on paper, like a riso print. */
  function dither(dark) {
    var w = 640, h = 360, X = Pix(w, h), r = rng(91);
    var sky = dark ? [hex('#0c0e0a'), hex('#12160e'), hex('#1b2214')] : [hex('#f5f0e8'), hex('#ece6dc'), hex('#dfe3ec')];
    var body = dark ? [hex('#0c0e0a'), hex('#1c2416'), hex('#3a4a26'), hex('#7f9a3c'), hex('#b8d066')] : [hex('#f5f0e8'), hex('#c9d3e6'), hex('#7d97c9'), hex('#2f5db3'), hex('#0047ab')];
    var ring = dark ? [hex('#3d2b12'), hex('#9a6a26'), hex('#e0a84a')] : [hex('#f0d8cf'), hex('#d98c76'), hex('#b4442e')];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) X.set(x, y, dith(sky, clamp((x * 0.6 + (h - y) * 1.4) / 700, 0, 1) * 0.999, x, y));
    if (dark) for (var s = 0; s < 90; s++) X.set(Math.floor(r() * w), Math.floor(r() * h * 0.7), r() < 0.3 ? hex('#dfe6cf') : hex('#7c866b'));
    else for (var s2 = 0; s2 < 60; s2++) { var sx = Math.floor(r() * w), sy = Math.floor(r() * h * 0.7); X.set(sx, sy, hex('#7d97c9')); }
    var px = 548, py = 392, PR = 250, L = [-0.62, -0.62, 0.48];
    function ringAt(x, y, front) {
      var dx = (x - px) / 1.0, dy = (y - py + (x - px) * 0.32) / 0.22, d = Math.sqrt(dx * dx + dy * dy);
      if (d < PR * 1.3 || d > PR * 1.72) return null; if (Math.floor((d - PR * 1.3) / 9) % 3 === 2) return null;
      var isFront = (y - py + (x - px) * 0.32) > 0; if (isFront !== front) return null;
      return clamp(1 - (d - PR * 1.3) / (PR * 0.42) * 0.8, 0, 1);
    }
    for (var y2 = 0; y2 < h; y2++) for (var x2 = 0; x2 < w; x2++) { var t = ringAt(x2, y2, false); if (t != null) X.set(x2, y2, dith(ring, t * 0.999, x2, y2)); }
    for (var y3 = 0; y3 < h; y3++) for (var x3 = 0; x3 < w; x3++) {
      var dx = x3 - px, dy = y3 - py, d2 = dx * dx + dy * dy; if (d2 > PR * PR) continue;
      var nz = Math.sqrt(1 - d2 / (PR * PR)), nx = dx / PR, ny = dy / PR, lam = clamp(nx * L[0] + ny * L[1] + nz * L[2], 0, 1);
      var bandv = Math.sin((y3 - py + dx * 0.32) / 15) * 0.08;
      X.set(x3, y3, dith(body, clamp(lam * 0.95 + 0.04 + bandv, 0, 0.999), x3, y3));
    }
    for (var y4 = 0; y4 < h; y4++) for (var x4 = 0; x4 < w; x4++) { var t2 = ringAt(x4, y4, true); if (t2 != null) X.set(x4, y4, dith(ring, t2 * 0.999, x4, y4)); }
    var mx = 112, my = 82, MR = 26; for (var y5 = my - MR; y5 <= my + MR; y5++) for (var x5 = mx - MR; x5 <= mx + MR; x5++) {
      var ddx = x5 - mx, ddy = y5 - my, dd = ddx * ddx + ddy * ddy; if (dd > MR * MR) continue;
      var nz2 = Math.sqrt(1 - dd / (MR * MR)), lam2 = clamp(ddx / MR * L[0] + ddy / MR * L[1] + nz2 * L[2], 0, 1); X.set(x5, y5, dith(body, clamp(lam2 * 0.9 + 0.08, 0, 0.999), x5, y5));
    }
    return X.out();
  }

  /* Stars: a pixel starfield with a dithered nebula and a shooting star (dark), or a printed star chart with its
     circles, a few invented constellations and a compass mark (light). */
  function stars(dark) {
    var w = 640, h = 360, X = Pix(w, h), r = rng(101), n = noise2(103);
    if (dark) {
      var sky = [hex('#0b0d0a'), hex('#0f120d'), hex('#141911')];
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var neb = fbm(n, x / 70, y / 70, 4), band = Math.exp(-Math.pow(((x - 40) * 0.5 - (y - 40)) / 120, 2)) * smooth(0.25, 0.75, Math.hypot(x / w - 0.5, y / h - 0.5) * 2.1);
        X.set(x, y, dith(sky.concat([hex('#1c2416'), hex('#26301c')]), clamp(y / h * 0.35 + band * neb * 1.35, 0, 0.999), x, y));
      }
      var cols = [hex('#7c866b'), hex('#dfe6cf'), hex('#9db4d0'), hex('#e0a84a'), hex('#b8d066')];
      for (var s = 0; s < 420; s++) { var sx = Math.floor(r() * w), sy = Math.floor(r() * h); X.set(sx, sy, cols[Math.floor(r() * r() * cols.length)]); }
      for (var s2 = 0; s2 < 40; s2++) { var cx = Math.floor(r() * w), cy = Math.floor(r() * h); var edge = Math.hypot(cx / w - 0.5, cy / h - 0.5); if (edge < 0.22) continue; X.set(cx, cy, cols[1]); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (q) { X.set(cx + q[0], cy + q[1], cols[0]); }); }
      [[60, 300], [590, 70], [520, 320], [90, 50], [300, 20], [620, 220]].forEach(function (q) { var c0 = r() < 0.5 ? cols[1] : cols[2]; for (var k = -3; k <= 3; k++) { X.set(q[0] + k, q[1], Math.abs(k) > 1 ? cols[0] : c0); X.set(q[0], q[1] + k, Math.abs(k) > 1 ? cols[0] : c0); } X.set(q[0] + 2, q[1] + 2, cols[0]); X.set(q[0] - 2, q[1] - 2, cols[0]); X.set(q[0] + 2, q[1] - 2, cols[0]); X.set(q[0] - 2, q[1] + 2, cols[0]); });
      for (var t = 0; t < 70; t++) { var tx = 560 - t * 2.2, ty = 40 + t * 0.9; if (dith([0, 1], 1 - t / 70, Math.round(tx), Math.round(ty))) X.set(tx, ty, t < 8 ? cols[1] : t < 30 ? cols[4] : cols[0]); }
    } else {
      X.fill(hex('#f5f0e8'));
      var faint = hex('#d6dbe6'), line = hex('#a9bbdd'), ink = hex('#0047ab'), dot = hex('#2f5db3');
      var CX = 520, CY = 300; for (var rr = 40; rr < 520; rr += 48) X.circle(CX, CY, rr, rr % 96 === 88 ? line : faint, rr % 96 === 88 ? 0 : 2);
      for (var a = 0; a < 24; a++) { var an = a * Math.PI / 12; X.line(CX + Math.cos(an) * 40, CY + Math.sin(an) * 40, CX + Math.cos(an) * 700, CY + Math.sin(an) * 700, faint); }
      for (var s3 = 0; s3 < 260; s3++) { var x3 = Math.floor(r() * w), y3 = Math.floor(r() * h); if (Math.hypot(x3 / w - 0.5, y3 / h - 0.5) < 0.18 && r() < 0.8) continue; var sz = r(); if (sz < 0.7) X.set(x3, y3, dot); else if (sz < 0.93) X.disc(x3, y3, 1, ink); else X.disc(x3, y3, 2, ink); }
      [[[40, 40], [70, 62], [104, 54], [130, 80], [118, 112]], [[560, 40], [598, 58], [612, 94], [580, 120]], [[470, 250], [520, 262], [548, 236], [590, 270], [620, 300]], [[50, 250], [84, 280], [70, 320], [120, 300]]].forEach(function (cst) {
        for (var k2 = 1; k2 < cst.length; k2++) X.line(cst[k2 - 1][0], cst[k2 - 1][1], cst[k2][0], cst[k2][1], line);
        cst.forEach(function (q) { X.disc(q[0], q[1], 2, ink); });
      });
      var mx = 590, my = 330; X.line(mx - 12, my, mx + 12, my, ink); X.line(mx, my - 14, mx, my + 10, ink); X.set(mx, my - 15, ink); X.circle(mx, my, 7, line);
    }
    return X.out();
  }

  /* ================================================================================================================
     NIER: ink on parchment (light) or parchment on ink (dark). Rules, brackets, square bullets, hatching and fine line
     drawings, after the NieR Mode the app already paints; no scene of its own, so the eight ink scenes stay NieR's.
     ================================================================================================================ */
  function npal(dark) { return dark ? { g0: '#302e27', g1: '#29271f', ink: [209, 205, 183], red: [196, 106, 82], bg: [47, 45, 38] } : { g0: '#cfcbb4', g1: '#c5c1a9', ink: [33, 31, 27], red: [168, 67, 46], bg: [204, 200, 177] }; }
  function nground(g, dark) {
    var p = npal(dark), n = noise2(dark ? 131 : 137);
    g.fillStyle = lin(g, 0, 0, W, H, [[0, p.g0], [1, p.g1]]); g.fillRect(0, 0, W, H);
    var lo = canvas(320, 180), lg = ctx(lo), im = lg.createImageData(320, 180), d = im.data;
    for (var j = 0; j < 180; j++) for (var i = 0; i < 320; i++) { var v = fbm(n, i / 70, j / 70, 3), k = (j * 320 + i) * 4; d[k] = p.ink[0]; d[k + 1] = p.ink[1]; d[k + 2] = p.ink[2]; d[k + 3] = Math.round(Math.max(0, v - 0.42) * (dark ? 12 : 14)); }
    lg.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(lo, 0, 0, W, H);
    return p;
  }
  function bracket(g, x, y, s, sx, sy, col, lw) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x + sx * s, y); g.lineTo(x, y); g.lineTo(x, y + sy * s); g.stroke(); }

  /* Archive: a page of the YoRHa archive: a hatched header band, a menu list with one entry chosen, a level gauge, a
     data card, ledger rules and corner brackets; nothing in the middle but the rules. */
  function archive(dark) {
    var c = canvas(), g = ctx(c), p = nground(g, dark), I = function (a) { return rgba(p.ink, a); };
    g.strokeStyle = I(dark ? 0.05 : 0.06); g.lineWidth = 1; g.beginPath(); for (var y = 180; y < H - 120; y += 36) { g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); } g.stroke();
    g.save(); g.beginPath(); g.rect(0, 0, W, 92); g.clip(); g.strokeStyle = I(0.16); g.lineWidth = 2; g.beginPath(); for (var x = -100; x < W + 100; x += 11) { g.moveTo(x, 92); g.lineTo(x + 92, 0); } g.stroke(); g.restore();
    g.fillStyle = I(0.55); g.fillRect(0, 96, W, 2.5);
    g.fillStyle = I(0.4); for (var x1 = 6; x1 < W; x1 += 9) g.fillRect(x1, 108, 3, 3);
    for (var e = 0; e < 9; e++) {
      var ey = 250 + e * 92, chosen = e === 3;
      if (chosen) { g.fillStyle = I(0.78); g.fillRect(82, ey - 24, 380, 48); g.fillStyle = rgba(p.bg, 0.95); g.fillRect(100, ey - 7, 14, 14); g.fillRect(132, ey - 3, 120, 6); continue; }
      g.fillStyle = I(0.55); g.fillRect(100, ey - 7, 14, 14);
      g.fillStyle = I(0.22); g.fillRect(132, ey - 3, 60 + (e * 37) % 90, 6);
      g.strokeStyle = I(0.28); g.lineWidth = 1.5; g.beginPath(); g.moveTo(132, ey + 18.5); g.lineTo(462, ey + 18.5); g.stroke();
    }
    g.strokeStyle = I(0.5); g.lineWidth = 2; g.strokeRect(2404, 220, 34, 1000);
    g.fillStyle = I(0.26); for (var t = 0; t < 40; t++) g.fillRect(2410, 236 + t * 24.6, t % 5 === 0 ? 22 : 12, 2);
    g.fillStyle = I(0.6); g.fillRect(2410, 760, 22, 454);
    g.fillStyle = I(0.32); for (var dsh = 0; dsh < 32; dsh++) g.fillRect(2468, 228 + dsh * 31, 16, 3);
    g.strokeStyle = I(0.5); g.lineWidth = 2; g.strokeRect(1880, 1110, 500, 210);
    g.save(); g.beginPath(); g.rect(1880, 1110, 500, 40); g.clip(); g.strokeStyle = I(0.22); g.lineWidth = 2; g.beginPath(); for (var hx = 1860; hx < 2400; hx += 10) { g.moveTo(hx, 1150); g.lineTo(hx + 40, 1110); } g.stroke(); g.restore();
    g.fillStyle = I(0.5); g.fillRect(1880, 1150, 500, 2);
    g.fillStyle = I(0.24); [[1904, 1184, 260], [1904, 1222, 340], [1904, 1260, 180]].forEach(function (b) { g.fillRect(b[0], b[1], b[2], 8); });
    g.fillStyle = rgba(p.red, dark ? 0.8 : 0.75); g.fillRect(2336, 1178, 18, 18);
    for (var gy = 0; gy < 3; gy++) for (var gx = 0; gx < 7; gx++) { var fx = 96 + gx * 30, fy = 1222 + gy * 30; if ((gx * 7 + gy * 3) % 4 === 0) { g.fillStyle = I(0.5); g.fillRect(fx, fy, 18, 18); } else { g.strokeStyle = I(0.35); g.lineWidth = 1.5; g.strokeRect(fx + 0.75, fy + 0.75, 16.5, 16.5); } }
    var B = I(0.55); bracket(g, 40, 140, 48, 1, 1, B, 2.5); bracket(g, W - 40, 140, 48, -1, 1, B, 2.5); bracket(g, 40, H - 40, 48, 1, -1, B, 2.5); bracket(g, W - 40, H - 40, 48, -1, -1, B, 2.5);
    grain(g, dark ? 5 : 4, 41); return c;
  }

  /* Signal: a scanner's rings off to the lower right: solid, segmented and dotted rings, ticks, a sweep and blips,
     crosshairs across the whole sheet, and a small reticle at the top left. */
  function signal(dark) {
    var c = canvas(), g = ctx(c), p = nground(g, dark), I = function (a) { return rgba(p.ink, a); }, cx = 2060, cy = 1010, r = rng(53);
    g.strokeStyle = I(0.16); g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, cy + 0.5); g.lineTo(W, cy + 0.5); g.moveTo(cx + 0.5, 0); g.lineTo(cx + 0.5, H); g.stroke();
    g.setLineDash([3, 9]); g.beginPath(); g.moveTo(0, 300.5); g.lineTo(W, 300.5); g.moveTo(300.5, 0); g.lineTo(300.5, H); g.stroke(); g.setLineDash([]);
    g.fillStyle = I(0.07); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 1300, Math.PI * 1.12, Math.PI * 1.3); g.closePath(); g.fill();
    g.strokeStyle = I(0.5); g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(Math.PI * 1.3) * 1300, cy + Math.sin(Math.PI * 1.3) * 1300); g.stroke();
    [[140, 'solid', 0.5], [220, 'seg', 0.42], [300, 'dot', 0.45], [420, 'solid', 0.4], [560, 'seg', 0.34], [760, 'dot', 0.32], [1000, 'solid', 0.24], [1300, 'seg', 0.2]].forEach(function (R) {
      g.strokeStyle = I(R[2]); g.fillStyle = I(R[2]);
      if (R[1] === 'solid') { g.lineWidth = 1.6; g.beginPath(); g.arc(cx, cy, R[0], 0, Math.PI * 2); g.stroke(); }
      else if (R[1] === 'seg') { g.lineWidth = 3; for (var a = 0; a < 360; a += 24) { g.beginPath(); g.arc(cx, cy, R[0], a * Math.PI / 180, (a + 17) * Math.PI / 180); g.stroke(); } }
      else { for (var a2 = 0; a2 < 360; a2 += 2.5) { var an = a2 * Math.PI / 180; g.fillRect(cx + Math.cos(an) * R[0] - 2, cy + Math.sin(an) * R[0] - 2, 4, 4); } }
    });
    g.strokeStyle = I(0.45); for (var k = 0; k < 72; k++) { var a3 = k * Math.PI / 36, L = k % 6 === 0 ? 30 : 12; g.lineWidth = k % 6 === 0 ? 2.2 : 1.3; g.beginPath(); g.moveTo(cx + Math.cos(a3) * 424, cy + Math.sin(a3) * 424); g.lineTo(cx + Math.cos(a3) * (424 + L), cy + Math.sin(a3) * (424 + L)); g.stroke(); }
    g.lineWidth = 6; g.strokeStyle = I(0.6); g.beginPath(); g.arc(cx, cy, 300, Math.PI * 1.05, Math.PI * 1.3); g.stroke();
    [140, 220, 300, 420, 560, 760, 1000, 1300].forEach(function (R) { [[cx - R, cy], [cx, cy - R]].forEach(function (q) { if (q[0] < 0 || q[1] < 0) return; g.strokeStyle = I(0.5); g.lineWidth = 1.5; g.strokeRect(q[0] - 6, q[1] - 6, 12, 12); }); });
    for (var b = 0; b < 9; b++) { var ba = Math.PI * (1.0 + r() * 0.5), br = 180 + r() * 900; g.fillStyle = I(0.62); g.fillRect(cx + Math.cos(ba) * br - 5, cy + Math.sin(ba) * br - 5, 10, 10); }
    var tx = cx + Math.cos(Math.PI * 1.2) * 640, ty = cy + Math.sin(Math.PI * 1.2) * 640; g.fillStyle = rgba(p.red, 0.85); g.fillRect(tx - 7, ty - 7, 14, 14); g.strokeStyle = rgba(p.red, 0.7); g.lineWidth = 2; g.strokeRect(tx - 18, ty - 18, 36, 36);
    g.strokeStyle = I(0.45); g.lineWidth = 1.6; g.beginPath(); g.arc(300, 300, 64, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(300, 300, 8, 0, Math.PI * 2); g.stroke();
    var B = I(0.55); bracket(g, 210, 210, 30, 1, 1, B, 2.4); bracket(g, 390, 210, 30, -1, 1, B, 2.4); bracket(g, 210, 390, 30, 1, -1, B, 2.4); bracket(g, 390, 390, 30, -1, -1, B, 2.4);
    grain(g, dark ? 5 : 4, 43); return c;
  }

  /* Fragments: the squares something leaves as it comes apart, streaming up from the bottom left and, fewer, down
     from the top right: filled, outlined and dotted, large near their source and small as they drift. */
  function fragments(dark) {
    var c = canvas(), g = ctx(c), p = nground(g, dark), I = function (a) { return rgba(p.ink, a); };
    function stream(ox, oy, dx, dy, L, N, seed) {
      var r = rng(seed), nx = -dy, ny = dx;
      for (var i = 0; i < N; i++) {
        var t = Math.pow(r(), 1.7), spread = 40 + t * 520, along = t * L + (r() - 0.5) * 60, side = (r() + r() + r() - 1.5) * spread;
        var x = ox + dx * along + nx * side, y = oy + dy * along + ny * side, s = Math.round(lerp(40, 4, t) * (0.55 + 0.9 * r())), a = lerp(0.82, 0.16, t) * (0.7 + 0.3 * r()), kind = r();
        if (kind < 0.66) { g.fillStyle = I(a); g.fillRect(Math.round(x), Math.round(y), s, s); }
        else if (kind < 0.94) { g.strokeStyle = I(a * 0.9); g.lineWidth = Math.max(1.2, s * 0.08); g.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, s, s); }
        else { g.fillStyle = rgba(p.red, a); g.fillRect(Math.round(x), Math.round(y), Math.max(4, s * 0.5), Math.max(4, s * 0.5)); }
      }
    }
    stream(-40, H + 40, 0.84, -0.54, 2100, 1100, 61); stream(W + 40, -40, -0.86, 0.5, 1100, 380, 63);
    g.strokeStyle = I(0.4); g.lineWidth = 2; [[120, 1060, 180], [380, 1230, 120], [2280, 120, 150]].forEach(function (q) { g.strokeRect(q[0] + 0.5, q[1] + 0.5, q[2], q[2]); });
    g.strokeStyle = I(0.22); g.lineWidth = 1; g.setLineDash([2, 8]); g.beginPath(); g.moveTo(0, H - 300.5); g.lineTo(W, H - 300.5); g.stroke(); g.setLineDash([]);
    grain(g, dark ? 5 : 4, 45); return c;
  }

  /* Hatch: two wide bands of diagonal hatching across opposite corners, each edged with a rule, a dotted rule and a
     row of square marks; a dotted grid over the rest. */
  function hatch(dark) {
    var c = canvas(), g = ctx(c), p = nground(g, dark), I = function (a) { return rgba(p.ink, a); };
    g.fillStyle = I(dark ? 0.2 : 0.22); for (var y = 24; y < H; y += 48) for (var x = 24; x < W; x += 48) { g.beginPath(); g.arc(x, y, 1.7, 0, Math.PI * 2); g.fill(); }
    function band(s0, s1, dens, alpha) {   /* the band between the lines x + y = s0 and x + y = s1 */
      g.save(); g.beginPath(); g.moveTo(s0, 0); g.lineTo(s1, 0); g.lineTo(s1 - H, H); g.lineTo(s0 - H, H); g.closePath(); g.clip();
      g.fillStyle = rgba(p.bg, 0.7); g.fillRect(0, 0, W, H);
      g.strokeStyle = I(alpha); g.lineWidth = 2; g.beginPath(); for (var x = -H; x < W + H; x += dens) { g.moveTo(x, 0); g.lineTo(x + H, H); } g.stroke(); g.restore();
      [s0, s1].forEach(function (s, i) { g.strokeStyle = I(0.5); g.lineWidth = 2.4; g.beginPath(); g.moveTo(s, 0); g.lineTo(s - H, H); g.stroke(); });
      var o = s0 > W ? -16 : 16 + (s1 - s0); g.strokeStyle = I(0.4); g.lineWidth = 2; g.setLineDash([2, 9]); g.beginPath(); g.moveTo(s0 + o, 0); g.lineTo(s0 + o - H, H); g.stroke(); g.setLineDash([]);
      g.fillStyle = I(0.55); for (var t = 60; t < H; t += 120) { var mx = (s0 > W ? s0 - 34 : s1 + 34) - t, my = t; if (mx > -10 && mx < W + 10) g.fillRect(mx - 6, my - 6, 12, 12); }
    }
    band(260, 760, 15, 0.34); band(3260, 3760, 15, 0.34); band(3060, 3120, 8, 0.42);
    /* a large ink frame at the top right, half off the sheet, with a filled corner */
    g.strokeStyle = I(0.5); g.lineWidth = 2.4; g.strokeRect(2120.5, -120.5, 560, 420); g.fillStyle = I(0.62); g.fillRect(2120, 284, 28, 16);
    g.fillStyle = rgba(p.red, dark ? 0.75 : 0.7); g.fillRect(2190, 1310, 16, 16);
    grain(g, dark ? 5 : 4, 47); return c;
  }

  /* Flora: line drawings of grass, flowers, ferns and a climbing vine along the bottom and the left, seeds drifting
     up and to the right. Shapes are filled with the ground, so nearer stems hide farther ones as in NieR's scenes. */
  function flora(dark) {
    var c = canvas(), g = ctx(c), p = nground(g, dark), I = function (a) { return rgba(p.ink, a); }, r = rng(71), BG = rgba(p.bg, 1);
    g.lineCap = 'round'; g.lineJoin = 'round';
    function blade(x, h, lean, a, lw) { g.strokeStyle = I(a); g.lineWidth = lw; g.beginPath(); g.moveTo(x, H + 8); g.quadraticCurveTo(x + lean * 0.3, H - h * 0.6, x + lean, H - h); g.stroke(); }
    function leaf(x, y, len, ang, a) {
      g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.5, -len * 0.28, len, 0); g.quadraticCurveTo(len * 0.5, len * 0.28, 0, 0); g.closePath();
      g.fillStyle = BG; g.fill(); g.strokeStyle = I(a); g.lineWidth = 1.8; g.stroke(); g.beginPath(); g.moveTo(len * 0.08, 0); g.lineTo(len * 0.86, 0); g.lineWidth = 1.1; g.stroke(); g.restore();
    }
    function flower(x, h, lean, petals, size, a) {
      var tx = x + lean, ty = H - h; g.strokeStyle = I(a); g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, H + 8); g.bezierCurveTo(x, H - h * 0.4, tx - lean * 0.2, ty + h * 0.25, tx, ty); g.stroke();
      leaf(x + lean * 0.12, H - h * 0.28, size * 2.2, -0.5 - r() * 0.4, a); leaf(x + lean * 0.3, H - h * 0.5, size * 1.8, Math.PI + 0.5 + r() * 0.4, a);
      for (var k = 0; k < petals; k++) {
        var an = k / petals * Math.PI * 2 + r() * 0.2; g.save(); g.translate(tx, ty); g.rotate(an);
        g.beginPath(); g.ellipse(size * 0.62, 0, size * 0.62, size * 0.3, 0, 0, Math.PI * 2); g.fillStyle = BG; g.fill(); g.strokeStyle = I(a); g.lineWidth = 1.8; g.stroke(); g.restore();
      }
      g.fillStyle = I(a); g.beginPath(); g.arc(tx, ty, size * 0.22, 0, Math.PI * 2); g.fill();
    }
    function fern(x, y, len, ang, a) {
      g.save(); g.translate(x, y); g.rotate(ang); g.strokeStyle = I(a); g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.5, -len * 0.18, len, -len * 0.05); g.stroke();
      for (var t = 0.08; t < 0.95; t += 0.06) { var px = len * t, py = -len * 0.18 * 4 * t * (1 - t) * 0.9, l = len * 0.16 * (1 - t * 0.7); leaf(px, py, l, -1.0, a * 0.9); leaf(px, py, l, 1.0 + 0.1, a * 0.9); }
      g.restore();
    }
    function where() { var u = r(); return u < 0.5 ? Math.pow(r(), 1.6) * W * 0.42 : W - Math.pow(r(), 1.6) * W * 0.42; }
    for (var i = 0; i < 520; i++) { var x = where(), edge = Math.min(x, W - x) / (W / 2); blade(x, (60 + r() * 220) * (1.25 - edge), (r() - 0.4) * 80, 0.26 + r() * 0.32, 1.3 + r() * 1.5); }
    fern(-20, H - 60, 520, -0.55, 0.48); fern(W + 20, H - 40, 460, Math.PI + 0.6, 0.45); fern(60, H + 10, 360, -1.1, 0.42);
    [[180, 420, 40, 6, 30], [330, 300, -30, 5, 24], [90, 560, 60, 7, 34], [470, 220, 25, 5, 20], [2380, 460, -50, 6, 32], [2230, 320, 30, 5, 24], [2500, 600, -70, 7, 36], [2080, 210, -20, 5, 19], [640, 160, 18, 5, 16], [1930, 150, 14, 5, 15]].forEach(function (f) { flower(f[0], f[1], f[2], f[3], f[4], 0.68); });
    for (var v = 0; v < 2; v++) {
      var vx = v ? 40 : 18, a2 = 0.45; g.strokeStyle = I(a2); g.lineWidth = 2.2; g.beginPath(); g.moveTo(vx, H);
      for (var yy = H; yy > 260 + v * 200; yy -= 6) g.lineTo(vx + 26 * Math.sin(yy / 90 + v * 2), yy); g.stroke();
      for (var yl = H - 120; yl > 300 + v * 200; yl -= 110) { var lx = vx + 26 * Math.sin(yl / 90 + v * 2); leaf(lx, yl, 46, (Math.floor(yl / 110) % 2 ? -0.4 : Math.PI + 0.4), a2);
        g.beginPath(); g.moveTo(lx, yl - 30); for (var s = 0; s < 22; s++) { var aa = s * 0.5, rr2 = 16 - s * 0.7; g.lineTo(lx + 18 + Math.cos(aa) * rr2, yl - 40 + Math.sin(aa) * rr2); } g.lineWidth = 1.4; g.stroke(); }
    }
    for (var sd = 0; sd < 46; sd++) { var sx = W * (0.55 + r() * 0.45), sy = H * (0.08 + r() * 0.6), ang = r() * Math.PI;
      g.save(); g.translate(sx, sy); g.rotate(ang); g.strokeStyle = I(0.32); g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, 0, 7, 3, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(7, 0); g.lineTo(20, 0); g.stroke();
      for (var f2 = -2; f2 <= 2; f2++) { g.beginPath(); g.moveTo(20, 0); g.lineTo(28, f2 * 3.5); g.stroke(); } g.restore(); }
    grain(g, dark ? 5 : 4, 49); return c;
  }

  var ART = { blueprint: blueprint, contour: contour, folds: folds, sheets: sheets, arcs: arcs,
    dotwave: dotwave, channels: channels, bubbles: bubbles, hills: hills, stripes: stripes,
    horizon: horizon, peaks: peaks, circuit: circuit, dither: dither, stars: stars,
    archive: archive, signal: signal, fragments: fragments, hatch: hatch, flora: flora };
  /* how each one is encoded: lossy WebP at the shared 0.84, except pixel art, which is lossless (exact pixels, and far
     smaller than lossy for flat colour) */
  var LOSSLESS = { horizon: 1, peaks: 1, circuit: 1, dither: 1, stars: 1 };
  window.WPK_ART = {
    W: W, H: H, ids: Object.keys(ART), lossless: LOSSLESS,
    draw: function (id, dark) { return ART[id](!!dark); }
  };
})();
