/* T.Grounds: the terminal's backgrounds, round 2 (Jared, 2026-10-14: "significantly more background choices; the ones
   there now are weird and ugly. Do research online at what other terminals do"). The round 2 RESEARCH.md says what
   eleven terminals offer and what this takes from each; in short:
     - derive, don't pick: every design is a recipe of the scheme on screen (its ground, its text and two or three of its
       hues) and the look, so it fits every look, light and dark, and every scheme; no design carries fixed colours
       except a look's own signature (NieR's paper);
     - stay inside the readable band: dark grounds decorate with a few per cent of lightness and colour (people dim
       pictures to 10-30 %), light grounds stay near-white with faint darker line art (coloured text has almost no
       headroom there); and the text's contrast floor is measured against each design's worst pixel (24-renderer.js);
     - keep decoration away from the text: scenes sit in the bottom third, marks in a corner, the top left calmest;
     - static first: moving designs are opt-in, move by transform and opacity only at about 20 fps, and play only while
       the terminal is in use (52-fx.js), never under Reduced Motion or a battery saver;
     - one layer under the text, painted once and cached; nothing fetched, and no backdrop blur (F3-431).

   Categories (the background field keeps its words: gradients are bgGradient ids, everything else a bgImage id):
     tonal    gradients within the scheme's own lightness              wash     soft colour from the scheme's hues
     pattern  sharp line art in CSS or SVG (Size: fine, medium, coarse) scene    painted pictures in the bottom third
     mark     a faint emblem in the corner                             moving   a slow layer (Motion: off, gentle, lively)

   T.Grounds.list()                         -> [{ id, cat, name, legacy, looks }] in the order the screen shows them
   T.Grounds.has(id), .cat(id), .name(id), .forLook(lookKey) -> the look's own short list of ids
   T.Grounds.css(id, th, opts)              -> { css, size?, colors } for tonal, wash, pattern and mark designs
   T.Grounds.paint(id, th, w, h, opts)      -> { url, worst } a scene or a moving layer, painted at about w x h CSS px
   T.Grounds.motion(id)                     -> { layer, anim, ms } for a moving design, else null
   T.Grounds.worst(colors, th)              -> the colour whose contrast with the text is lowest
   T.Grounds.scrim(worst, th)               -> 0..0.9: the least of the scheme's ground laid over a design that keeps the
                                               text at 4.8:1 or more (just above the 4.5:1 floor; the scheme's own
                                               contrast when that is lower): Auto readability */
(function () {
  'use strict';
  var C = T.color;

  /* ---- the scheme's colours ---- */
  function isDark(th) { return C.lum(th.bg) < 0.2; }
  /* lightness moved in OKLab, hue and chroma kept */
  function tone(c, dL) { var lab = C.oklab(c); return C.fromOklab(Math.max(0, Math.min(1, lab[0] + dL)), lab[1], lab[2]); }
  function hues(th) {
    var p = th.palette || [], dark = isDark(th);
    /* a single-colour scheme (phosphor, YoRHa) decorates only in its own colour */
    if (th.mono) { var g = th.roles && th.roles.glow ? C.hex(th.roles.glow) : th.fg; return { a: g, b: g, c: g, d: g, warm: g, hot: g }; }
    var pick = function (i, j) { var x = p[dark ? j : i]; return x !== undefined ? x : th.fg; };
    return { a: pick(4, 12), b: pick(5, 13), c: pick(6, 14), d: pick(2, 10), warm: pick(3, 11), hot: pick(1, 9) };
  }
  /* a wash of a hue over the ground: t on a dark ground, under half of it on a light one */
  function wash(th, c, t) { return C.mix(th.bg, c, isDark(th) ? t * 1.9 : t * 0.6); }
  /* a pool of light in a hue: f of the most colour the text allows. The furthest the ground can go toward the hue and
     still hold the text at 4.8:1 (with a margin for grain and blending), capped so a dark ground never turns more than
     55 % to the hue and a light one 20 % (a one-colour light scheme 8 %: its only hue is the dark text, which would
     stain the paper): the strongest wash that never needs the readability veil */
  var roomCache = new Map();
  function room(th, c) {
    var key = th.bg + '|' + th.fg + '|' + c + (th.mono ? '|m' : ''), hit = roomCache.get(key); if (hit !== undefined) return hit;
    var want = Math.min(C.contrast(th.fg, th.bg), 4.8) + 0.12, cap = isDark(th) ? 0.55 : th.mono ? 0.08 : 0.2, lo = 0, hi = cap;
    if (C.contrast(th.fg, C.mix(th.bg, c, cap)) >= want) lo = cap;
    else for (var i = 0; i < 12; i++) { var m = (lo + hi) / 2; if (C.contrast(th.fg, C.mix(th.bg, c, m)) >= want) lo = m; else hi = m; }
    if (roomCache.size > 400) roomCache.clear();
    roomCache.set(key, lo); return lo;
  }
  /* the hue toward the ground's dark side, as far as the text allows (0 when it allows nothing) */
  function poolRaw(th, c, f) { return C.mix(th.bg, c, room(th, c) * f); }
  /* the hue paler than the ground, from a tint of it to white: the one that stands out most, or null when nothing paler
     shows (near-white paper) */
  function paleOf(th, c, f) {
    var Yb = C.lum(th.bg), best = null, bc = 1;
    [0.22, 0.08, 0].forEach(function (t) {
      var pale = C.mix(0xffffff, c, t); if (C.lum(pale) <= Yb + 0.01) return;
      pale = C.mix(th.bg, pale, Math.min(1, f * 1.25));
      var pc = C.contrast(pale, th.bg); if (pc > bc) { best = pale; bc = pc; }
    });
    return best;
  }
  /* a pool of the hue. Round 3c: on a light scheme that leaves no room at all to darken toward it (Tokyo Night Day's
     4.52:1, Glass light's own), the pool is that hue paler than the ground instead of the ground itself, so a wash shows
     rather than vanishing (lighter only lifts the dark text) */
  function pool(th, c, f) {
    if (isDark(th) || f <= 0 || room(th, c) >= 0.015) return poolRaw(th, c, f);
    return paleOf(th, c, f) || poolRaw(th, c, f);
  }
  /* ink that always shows (round 3b): the hue as far as the text allows; on a light scheme with too little room to darken
     for it to read (Tokyo Night Day's 4.52:1, Glass light's own; NieR's paper, which takes at most 8 % of any hue) the
     same hue paler than the ground, which only lifts the dark text */
  function inkFor(th, c, f, enough) {
    var p = pool(th, c, f);
    if (isDark(th) || C.contrast(p, th.bg) > (enough || 1.12)) return p;
    /* the hue paler than the ground wins when it stands out more (on near-white paper nothing paler shows, and the hue's
       own ink stays) */
    var pale = paleOf(th, c, f);
    return pale && C.contrast(pale, th.bg) > C.contrast(p, th.bg) ? pale : p;
  }
  /* ---- round 3c: a design's lighter-than-ground version (Jared: every option visibly distinct). A light scheme with no
     contrast to spare (Tokyo Night Day's 4.52:1, Glass light's) veils every design darker than its ground back to the
     plain ground, so 35 designs looked the same there. Such a design is drawn mirrored in light instead: each colour
     darker than the ground becomes one lighter than it by the same contrast (capped at white), keeping its hue, so the
     design keeps its shapes and only lifts the dark text. Used when the design would need a veil of 0.4 or more ---- */
  var LIN = [], i0; for (i0 = 0; i0 < 256; i0++) { var v0 = i0 / 255; LIN[i0] = v0 <= 0.04045 ? v0 / 12.92 : Math.pow((v0 + 0.055) / 1.055, 2.4); }
  var SRGB = new Uint8Array(4097); for (i0 = 0; i0 <= 4096; i0++) { var l0 = i0 / 4096; SRGB[i0] = Math.round((l0 <= 0.0031308 ? l0 * 12.92 : 1.055 * Math.pow(l0, 1 / 2.4) - 0.055) * 255); }
  function srgbOf(l) { return SRGB[Math.max(0, Math.min(4096, Math.round(l * 4096)))]; }
  /* the contrast with the ground stretched by gain: there is only 1.3:1 of room up to white on Glass light's ground, so
     each design's own range is stretched to fill exactly that room (its darkest mark becomes white, the rest in
     proportion): a faint design shows, a strong one keeps its shapes instead of clipping to white */
  function reflectGain(ratios, Yb) {
    var rmax = 1; ratios.forEach(function (r) { if (r > rmax) rmax = r; });
    var rw = 1.05 / (Yb + 0.05);
    return rmax > 1.0005 ? Math.max(1, Math.min(14, (rw - 1) / (rmax - 1))) : 1;
  }
  function darkRatio(c, Yb) { var Y = C.lum(c); return Y < Yb ? (Yb + 0.05) / (Y + 0.05) : 1; }
  function reflectRGB(r, g, b, Yb, gain) {
    var R = LIN[r], G = LIN[g], B = LIN[b], Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    if (Y >= Yb) return null;
    var ratio = 1 + ((Yb + 0.05) / (Y + 0.05) - 1) * (gain || 1);
    var Yt = Math.min(1, ratio * (Yb + 0.05) - 0.05), k = (1 - Yt) / (1 - Y);
    return [srgbOf(1 - (1 - R) * k), srgbOf(1 - (1 - G) * k), srgbOf(1 - (1 - B) * k)];
  }
  function reflectColor(c, th, gain) { var o = reflectRGB(C.r(c), C.g(c), C.b(c), C.lum(th.bg), gain); return o ? C.rgb(o[0], o[1], o[2]) : c; }
  function reflectCss(out, th) {
    var Yb = C.lum(th.bg), gain = reflectGain((out.colors || []).filter(function (c) { return typeof c === 'number'; }).map(function (c) { return darkRatio(c, Yb); }), Yb);
    var css = out.css, flip = function (h) { return hex(reflectColor(C.hex('#' + h), th, gain)).slice(1); };
    css = css.replace(/#([0-9a-fA-F]{6})(?![0-9a-fA-F])/g, function (m, h) { return '#' + flip(h); })
      .replace(/%23([0-9a-fA-F]{6})(?![0-9a-fA-F])/g, function (m, h) { return '%23' + flip(h); })
      .replace(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/g, function (m, r, g, b, a) { return rgba(reflectColor(C.rgb(+r, +g, +b), th, gain), +a); });
    return { css: css, colors: (out.colors || []).map(function (c) { return typeof c === 'number' ? reflectColor(c, th, gain) : c; }), reflected: true };
  }
  function reflectPixels(g, W, H, th) {
    var img; try { img = g.getImageData(0, 0, W, H); } catch (e) { return false; }
    var d = img.data, Yb = C.lum(th.bg), gain = reflectGain(sampleCols(g, W, H, th).map(function (c) { return darkRatio(c, Yb); }), Yb);
    for (var i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; var o = reflectRGB(d[i], d[i + 1], d[i + 2], Yb, gain); if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; } }
    g.putImageData(img, 0, 0);
    return true;
  }
  var REFLECT_AT = 0.4;
  /* ---- round 3c: a floor on how faint a design's marks may be. Fine marks (1 px lines, dots, emblems, flakes) read as the
     plain ground when their contrast with it is low, most of all on a near-black or one-colour scheme (Retro dark's
     patterns at 1.2 to 1.4:1). Below the floor a design's departures from the ground are scaled up in linear light (shapes
     and hues kept) until its strongest mark reaches the floor, at most cap times, and never past what the text allows.
     Smooth tonal and wash designs read at low contrast and are left alone, as are the glass designs and Retro's plain
     ones (vis: false) ---- */
  var VIS = { pattern: [1.8, 5], mark: [2.0, 6], retro: [1.5, 5], moving: [1.7, 4], scene: [1.4, 3] };
  function gainRGB(r, g, b, BR, BG, BB, k) { return [srgbOf(BR + (LIN[r] - BR) * k), srgbOf(BG + (LIN[g] - BG) * k), srgbOf(BB + (LIN[b] - BB) * k)]; }
  function gainColor(c, th, k) { var b = th.bg, o = gainRGB(C.r(c), C.g(c), C.b(c), LIN[C.r(b)], LIN[C.g(b)], LIN[C.b(b)], k); return C.rgb(o[0], o[1], o[2]); }
  /* the gain for a set of (composited) colours: the least that lifts the strongest to the floor, no more than the text
     allows or the cap */
  function fitGain(cols, th, floor, cap) {
    cols = cols.filter(function (c) { return typeof c === 'number' && c !== th.bg; });
    if (!cols.length) return 1;
    var vis = function (k) { var m = 1; cols.forEach(function (c) { m = Math.max(m, C.contrast(k === 1 ? c : gainColor(c, th, k), th.bg)); }); return m; };
    if (vis(1) >= floor) return 1;
    var want = Math.min(C.contrast(th.fg, th.bg), 4.8) + 0.12;
    var ok = function (k) { return cols.every(function (c) { var o = C.contrast(th.fg, c); return C.contrast(th.fg, gainColor(c, th, k)) >= Math.min(want, o) - 0.005; }); };
    var lo = 1, hi = cap;
    if (vis(cap) < floor) { lo = cap; } else { for (var i = 0; i < 10; i++) { var m = (lo + hi) / 2; if (vis(m) >= floor) hi = m; else lo = m; } lo = hi; }
    var k = lo;
    if (!ok(k)) { var a = 1, z = k; for (var j = 0; j < 10; j++) { var mm = (a + z) / 2; if (ok(mm)) a = mm; else z = mm; } k = a; }
    return k;
  }
  function mapCss(out, th, fn) {
    var flip = function (h) { return hex(fn(C.hex('#' + h))).slice(1); };
    var css = out.css.replace(/#([0-9a-fA-F]{6})(?![0-9a-fA-F])/g, function (m, h) { return '#' + flip(h); })
      .replace(/%23([0-9a-fA-F]{6})(?![0-9a-fA-F])/g, function (m, h) { return '%23' + flip(h); })
      .replace(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/g, function (m, r, g, b, a) { return rgba(fn(C.rgb(+r, +g, +b)), +a); });
    return Object.assign({}, out, { css: css, colors: (out.colors || []).map(function (c) { return typeof c === 'number' ? fn(c) : c; }) });
  }
  function visOf(d) { return d && d.vis !== false ? VIS[d.cat] : null; }
  function gainPixels(g, W, H, th, k) {
    var img; try { img = g.getImageData(0, 0, W, H); } catch (e) { return false; }
    var d = img.data, b = th.bg, BR = LIN[C.r(b)], BG = LIN[C.g(b)], BB = LIN[C.b(b)];
    for (var i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; var o = gainRGB(d[i], d[i + 1], d[i + 2], BR, BG, BB, k); d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; }
    g.putImageData(img, 0, 0);
    return true;
  }
  /* a light scheme with no contrast to spare (Tokyo Night Day's 4.52:1): the canvas's own rounding (a soft edge's nearly
     transparent black tail, a blurred pixel a unit darker in one channel) would darken the ground by a unit or two and
     cost a veil; there no painted pixel may sit below the ground: an opaque one is drawn in light instead, a faint tail
     is dropped */
  function tight(th) { return !isDark(th) && C.contrast(th.fg, th.bg) < 4.8 + 0.12; }
  function noDarker(g, W, H, th) {
    var img; try { img = g.getImageData(0, 0, W, H); } catch (e) { return false; }
    var d = img.data, b = th.bg, BR = C.r(b), BG = C.g(b), BB = C.b(b), Yb = C.lum(b);
    for (var i = 0; i < d.length; i += 4) {
      var a = d[i + 3]; if (!a) continue;
      var t = a / 255, r = BR + (d[i] - BR) * t, gg = BG + (d[i + 1] - BG) * t, bl = BB + (d[i + 2] - BB) * t;
      var Y = 0.2126 * LIN[Math.round(r)] + 0.7152 * LIN[Math.round(gg)] + 0.0722 * LIN[Math.round(bl)];
      if (Y >= Yb) continue;
      if (a < 250) { d[i + 3] = 0; continue; }
      /* drawn in light; a pixel only a unit or two off (whose lift rounds back) simply becomes the ground */
      var o = reflectRGB(d[i], d[i + 1], d[i + 2], Yb);
      if (o && 0.2126 * LIN[o[0]] + 0.7152 * LIN[o[1]] + 0.0722 * LIN[o[2]] >= Yb) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; } else { d[i] = BR; d[i + 1] = BG; d[i + 2] = BB; }
    }
    g.putImageData(img, 0, 0);
    return true;
  }
  /* composited colours on a coarse grid of a painted layer, for the floor */
  function sampleCols(g, W, H, th) {
    var data; try { data = g.getImageData(0, 0, W, H).data; } catch (e) { return []; }
    var out = [], st = Math.max(3, Math.round(Math.sqrt(W * H / 9000)));
    for (var y = 0; y < H; y += st) for (var x = 0; x < W; x += st) {
      var i = (y * W + x) * 4, a = data[i + 3] / 255; if (!a) continue;
      out.push(a >= 1 ? C.rgb(data[i], data[i + 1], data[i + 2]) : C.mix(th.bg, C.rgb(data[i], data[i + 1], data[i + 2]), a));
    }
    return out;
  }
  /* line art: t of the way to the text colour (light grounds a little less, they show it more; round 3c: 1.5 rather than
     1.1, the faint patterns read as the plain ground on Retro's and NieR's paper) */
  function ink(th, t) { return C.mix(th.bg, th.fg, isDark(th) ? t * 1.7 : t * 1.5); }
  /* a firm mark on a light ground (round 3c): toward the hue as far as the text allows, up to cap (a one-colour paper
     scheme's 8 % made rain, snow and stars vanish) */
  function inkUp(th, c, cap) {
    var want = Math.min(C.contrast(th.fg, th.bg), 4.8) + 0.12, lo = 0, hi = cap;
    if (C.contrast(th.fg, C.mix(th.bg, c, cap)) >= want) return C.mix(th.bg, c, cap);
    for (var i = 0; i < 12; i++) { var m = (lo + hi) / 2; if (C.contrast(th.fg, C.mix(th.bg, c, m)) >= want) lo = m; else hi = m; }
    return lo > 0.005 ? C.mix(th.bg, c, lo) : pool(th, c, 1);
  }
  /* the ground a little lighter (dark) or darker (light) */
  function lift(th, dk, lt) { return tone(th.bg, isDark(th) ? dk * 1.8 : -(lt === undefined ? dk : lt)); }
  var hex = C.toHex;
  function rgba(c, a) { return 'rgb(' + C.r(c) + ' ' + C.g(c) + ' ' + C.b(c) + ' / ' + (Math.round(a * 1000) / 1000) + ')'; }
  function svgUrl(svg) { return 'url("data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27') + '")'; }
  /* a grain tile at about 2.5 %: it breaks the banding of a soft gradient (WezTerm's noise does the same) */
  function grain(th, alpha) {
    var dark = isDark(th), v = dark || th.reflect ? 1 : 0;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5" stitchTiles="stitch"/>' +
      '<feColorMatrix values="0 0 0 0 ' + v + ' 0 0 0 0 ' + v + ' 0 0 0 0 ' + v + ' 0 0 0 ' + (alpha || 0.05) + ' 0"/></filter><rect width="128" height="128" filter="url(#n)"/></svg>';
    return svgUrl(svg) + ' 0 0 / 128px 128px';
  }

  /* ---- the catalog ---- */
  var LIST = [], BY = {}, SUGGEST = {};
  function def(cat, id, name, extra) { var d = Object.assign({ id: id, cat: cat, name: name, looks: [] }, extra || {}); LIST.push(d); BY[id] = d; return d; }

  /* tonal: the scheme's own ground, a few per cent lighter or darker; a grain tile keeps them from banding */
  def('tonal', 'fade', 'Fade', { looks: ['basic'], css: function (th) {
    var top = isDark(th) ? th.bg : tone(th.bg, 0.025), foot = isDark(th) ? tone(th.bg, -0.11) : th.bg;
    return { css: grain(th) + ', linear-gradient(180deg, ' + hex(top) + ' 0%, ' + hex(foot) + ' 100%)', colors: [top, foot] };
  } });
  def('tonal', 'corner', 'Corner light', { looks: ['friendly'], css: function (th, h) {
    var a = pool(th, h.a, 0.55);
    return { css: grain(th) + ', radial-gradient(110% 110% at 15% 0%, ' + hex(a) + ' 0%, ' + hex(th.bg) + ' 60%)', colors: [a, th.bg] };
  } });
  def('tonal', 'horizon', 'Horizon', { css: function (th, h) {
    var foot = wash(th, h.a, 0.07), line = isDark(th) ? lift(th, 0.06) : lift(th, 0.03);
    return { css: grain(th) + ', linear-gradient(180deg, ' + hex(th.bg) + ' 0%, ' + hex(th.bg) + ' 66%, ' + hex(line) + ' 70%, ' + hex(foot) + ' 70.4%, ' + hex(foot) + ' 100%)',
      colors: [th.bg, line, foot] };
  } });
  def('tonal', 'vignette', 'Vignette', { looks: ['basic', 'retro'], css: function (th) {
    /* (drawn in light on a scheme with no contrast to spare, the edge light starts nearer the middle, so it reads) */
    var edge = tone(th.bg, isDark(th) ? -0.15 : -0.04);
    return { css: grain(th) + ', radial-gradient(130% 110% at 50% 42%, ' + hex(th.bg) + ' ' + (th.reflect ? 30 : 55) + '%, ' + hex(edge) + ' 100%)', colors: [th.bg, edge] };
  } });
  def('tonal', 'split', 'Split', { css: function (th) {
    var a = lift(th, 0.03, 0.02), b = tone(th.bg, isDark(th) ? -0.07 : 0.012);
    return { css: grain(th) + ', linear-gradient(118deg, ' + hex(a) + ' 0%, ' + hex(a) + ' 44%, ' + hex(b) + ' 56%, ' + hex(b) + ' 100%)', colors: [a, b] };
  } });
  /* the earlier names (canon F3-642's dusk, dawn, deep and paper; Settings' words) keep their ids, now recipes too */
  def('tonal', 'deep', 'Deep', { legacy: true, css: function (th, h) {
    var hi = pool(th, h.a, 0.55), lo = tone(th.bg, isDark(th) ? -0.13 : -0.03);
    return { css: grain(th) + ', radial-gradient(120% 95% at 18% 0%, ' + hex(hi) + ' 0%, ' + hex(th.bg) + ' 46%, ' + hex(lo) + ' 100%)', colors: [hi, th.bg, lo] };
  } });
  def('tonal', 'paper', 'Warm paper', { legacy: true, looks: ['nier'], css: function (th) {
    /* (round 3c: on a dark ground clearly warm, 18 % of the way to the paper's tan where the text allows, so it is not
       taken for the Paper pattern's fibres) */
    var tan = C.hex('#a8925f'), warm = isDark(th) ? C.mix(th.bg, tan, Math.min(0.18, room(th, tan))) : C.mix(th.bg, C.hex('#efe4c8'), 0.45), foot = tone(warm, isDark(th) ? -0.04 : -0.02);
    return { css: grain(th, 0.06) + ', radial-gradient(130% 120% at 50% 40%, ' + hex(warm) + ' 50%, ' + hex(foot) + ' 100%)', colors: [warm, foot] };
  } });

  /* washes: two or three soft pools of the scheme's hues, as much of each as the text allows */
  def('wash', 'aurora', 'Aurora', { looks: ['glass'], css: function (th, h) {
    var a = pool(th, h.c, 0.95), b = pool(th, h.b, 0.85), c = pool(th, h.a, 0.6);
    return { css: grain(th) + ', radial-gradient(42% 46% at 16% 6%, ' + hex(a) + ' 0%, transparent 74%), radial-gradient(40% 42% at 58% 2%, ' + hex(b) + ' 0%, transparent 74%), ' +
      'radial-gradient(36% 44% at 94% 8%, ' + hex(c) + ' 0%, transparent 72%), ' + hex(th.bg), colors: [a, b, c, th.bg] };
  } });
  def('wash', 'nebula', 'Nebula', { css: function (th, h) {
    var a = pool(th, h.b, 0.95), b = pool(th, h.a, 0.85), c = pool(th, h.c, 0.6);
    return { css: grain(th) + ', radial-gradient(45% 60% at 78% 62%, ' + hex(a) + ' 0%, transparent 72%), radial-gradient(40% 55% at 92% 30%, ' + hex(b) + ' 0%, transparent 70%), ' +
      'radial-gradient(60% 50% at 55% 108%, ' + hex(c) + ' 0%, transparent 70%), ' + hex(th.bg), colors: [a, b, c, th.bg] };
  } });
  def('wash', 'dawn', 'Dawn', { legacy: true, looks: ['friendly'], css: function (th, h) {
    var foot = pool(th, h.warm, 0.9), mid = pool(th, h.hot, 0.45);
    return { css: grain(th) + ', linear-gradient(0deg, ' + hex(foot) + ' 0%, ' + hex(mid) + ' 32%, ' + hex(th.bg) + ' 72%)', colors: [foot, mid, th.bg] };
  } });
  def('wash', 'bloom', 'Ink bloom', { css: function (th, h) {
    var a = pool(th, h.a, 0.95);
    return { css: grain(th) + ', radial-gradient(70% 90% at 4% 104%, ' + hex(a) + ' 0%, transparent 68%), ' + hex(th.bg), colors: [a, th.bg] };
  } });
  def('wash', 'dusk', 'Dusk', { legacy: true, css: function (th, h) {
    var top = pool(th, h.b, 0.9), mid = pool(th, h.a, 0.4), foot = tone(th.bg, isDark(th) ? -0.11 : -0.02);
    return { css: grain(th) + ', linear-gradient(170deg, ' + hex(top) + ' 0%, ' + hex(mid) + ' 40%, ' + hex(foot) + ' 100%)', colors: [top, mid, foot] };
  } });
  /* Glass's prism: a thin spectral rim along the top edge and the light it throws */
  /* round 3: no longer suggested for Glass, whose light is neutral white (Liquid Glass's CONTRACT.md: no colour split) */
  def('wash', 'prism', 'Prism edge', { css: function (th, h) {
    /* the rim's hues as bright as the text allows: the first row may sit on it, and a brighter rim would veil the rest */
    var glow = pool(th, h.a, 0.6), hs = [h.hot, h.warm, h.d, h.c, h.a, h.b].map(function (c) { return pool(th, c, 1); });
    var rim = 'linear-gradient(90deg, ' + hs.map(function (c, i) { return hex(c) + ' ' + Math.round(i * 20) + '%'; }).join(', ') + ') 0 0 / 100% 2px no-repeat';
    return { css: rim + ', radial-gradient(70% 40% at 50% -6%, ' + hex(glow) + ' 0%, transparent 80%), ' + hex(th.bg), colors: [glow, th.bg].concat(hs) };
  } });

  /* patterns: 3 to 6 % line art, sharp at every size; Size scales the tiles */
  var SCALE = { fine: 0.7, medium: 1, coarse: 1.6 };
  function px(n, o) { return Math.round(n * (SCALE[o && o.scale] || 1)); }
  def('pattern', 'dots', 'Dot grid', { looks: ['basic', 'friendly'], css: function (th, h, o) {
    var d = ink(th, 0.1), s = px(20, o);
    /* (round 5, Q15: Coarse's dots are larger, as a coarser screen's are; Medium and Coarse were 4.3 apart in Glass dark) */
    var dr = (th.reflect ? 1.7 : 1.2) * (o && o.scale === 'coarse' ? 1.6 : 1);
    return { css: 'radial-gradient(circle at 50% 50%, ' + hex(d) + ' 0 ' + dr + 'px, transparent ' + (dr + 0.6) + 'px) 0 0 / ' + s + 'px ' + s + 'px, ' + hex(th.bg), colors: [th.bg, d] };
  } });
  def('pattern', 'graph', 'Graph paper', { looks: ['basic'], css: function (th, h, o) {
    var fine = ink(th, 0.04), major = ink(th, 0.07), s = px(16, o), m = s * 5;
    var l = function (c, n) { return 'linear-gradient(' + hex(c) + ' 1px, transparent 1px) 0 0 / ' + n + 'px ' + n + 'px, linear-gradient(90deg, ' + hex(c) + ' 1px, transparent 1px) 0 0 / ' + n + 'px ' + n + 'px'; };
    return { css: l(major, m) + ', ' + l(fine, s) + ', ' + hex(th.bg), colors: [th.bg, fine, major] };
  } });
  def('pattern', 'grid', 'Blueprint', { legacy: true, css: function (th, h, o) {
    var line = wash(th, h.a, isDark(th) ? 0.14 : 0.24), major = wash(th, h.a, isDark(th) ? 0.2 : 0.34), ground = wash(th, h.a, 0.05), s = px(24, o), m = s * 5;
    /* (round 5, Q15: drawn in light on a pale ground, its lines lighter still, they nearly vanished and Fine, Medium and
       Coarse drew alike. There the paper is the light one and the lines are the scheme's own ground, which the text is
       made for, every fifth twice as thick) */
    if (th.reflect) { line = major = th.bg; }
    var l = function (c, n, lw) { return 'linear-gradient(' + hex(c) + ' ' + lw + 'px, transparent ' + lw + 'px) 0 0 / ' + n + 'px ' + n + 'px, linear-gradient(90deg, ' + hex(c) + ' ' + lw + 'px, transparent ' + lw + 'px) 0 0 / ' + n + 'px ' + n + 'px'; };
    return { css: l(major, m, th.reflect ? 2 : 1) + ', ' + l(line, s, 1) + ', ' + hex(ground), colors: [ground, line, major] };
  } });
  def('pattern', 'hatch', 'Diagonal hatch', { css: function (th, h, o) {
    var d = ink(th, 0.05), s = px(9, o);
    return { css: 'repeating-linear-gradient(135deg, ' + hex(d) + ' 0 1px, transparent 1px ' + s + 'px), ' + hex(th.bg), colors: [th.bg, d] };
  } });
  def('pattern', 'checker', 'Pixel checker', { css: function (th, h, o) {
    var d = lift(th, 0.018, 0.012), s = px(8, o);
    return { css: 'repeating-conic-gradient(' + hex(d) + ' 0 25%, transparent 0 50%) 0 0 / ' + (s * 2) + 'px ' + (s * 2) + 'px, ' + hex(th.bg), colors: [th.bg, d] };
  } });
  /* contour lines: fourteen isolines round two peaks in the lower right, densest in that corner */
  def('pattern', 'topo', 'Topography', { css: function (th, h, o) {
    var line = ink(th, 0.065), W = 1600, H = 900, paths = '', k = SCALE[o && o.scale] || 1;
    [[1320, 760, 1, 0.3], [980, 980, 0.8, 2.1]].forEach(function (pk) {
      for (var i = 1; i <= 14; i++) {
        var r = i * 46 * k * pk[2], d = '';
        for (var a = 0; a <= 72; a++) {
          var t = a / 72 * Math.PI * 2, w = 1 + 0.16 * Math.sin(3 * t + pk[3] + i * 0.21) + 0.07 * Math.sin(5 * t - i * 0.37 + pk[3]);
          d += (a ? 'L' : 'M') + (pk[0] + Math.cos(t) * r * 1.5 * w).toFixed(1) + ' ' + (pk[1] + Math.sin(t) * r * w).toFixed(1);
        }
        paths += '<path d="' + d + 'Z"/>';
      }
    });
    /* (round 4, Q15: drawn in light on a pale ground its hairlines matched Dot grid, Starfield and Rain; twice as thick there) */
    /* (round 5, Q15: Coarse's wider contours are drawn half as heavy again, as a larger map's are; Medium and Coarse were
       4.4 apart in Retro dark) */
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMaxYMax slice"><g fill="none" stroke="' + hex(line) + '" stroke-width="' + (th.reflect ? 2 : 1) * (k > 1.2 ? 1.5 : 1) + '" vector-effect="non-scaling-stroke">' + paths + '</g></svg>';
    return { css: svgUrl(svg) + ' right bottom / cover no-repeat, ' + hex(th.bg), colors: [th.bg, line] };
  } });
  /* waves: four ribbons across the bottom third, each 3 % of lightness from the next; Size is the swell, short and low to
     long and high (round 5, Q15: Size was offered here and drew nothing) */
  def('pattern', 'waves', 'Waves', { css: function (th, h, o) {
    var W = 1600, H = 900, bands = '', step = isDark(th) ? 0.022 : -0.012, k = SCALE[o && o.scale] || 1;
    for (var i = 0; i < 4; i++) {
      var y0 = H * (0.66 + i * 0.085), d = 'M0 ' + H;
      for (var x = 0; x <= W; x += 20) d += 'L' + x + ' ' + (y0 + Math.sin(x / ((260 - i * 30) * k) + i * 1.3) * 22 * k + Math.sin(x / (90 * k) + i) * 5).toFixed(1);
      bands += '<path fill="' + hex(tone(wash(th, h.a, 0.03 * (i + 1)), step * (i + 1))) + '" d="' + d + 'L' + W + ' ' + H + 'Z"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice">' + bands + '</svg>';
    return { css: svgUrl(svg) + ' center bottom / cover no-repeat, ' + hex(th.bg), colors: [th.bg, tone(wash(th, h.a, 0.12), step * 4)] };
  } });
  /* halftone: the newspaper screen, dots growing into one corner */
  def('pattern', 'halftone', 'Halftone', { css: function (th, h, o) {
    var d = ink(th, 0.075), W = 1600, H = 900, step = Math.round(14 * (SCALE[o && o.scale] || 1)), dots = '';
    for (var y = step / 2; y < H; y += step) for (var x = step / 2; x < W; x += step) {
      var k = Math.max(0, 1 - Math.hypot(x - W, y - H) / 1000), r = k * k * step * 0.32;
      if (r > 0.3) dots += '<circle cx="' + x + '" cy="' + y + '" r="' + r.toFixed(2) + '"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMaxYMax slice"><g fill="' + hex(d) + '">' + dots + '</g></svg>';
    return { css: svgUrl(svg) + ' right bottom / cover no-repeat, ' + hex(th.bg), colors: [th.bg, d] };
  } });
  /* Retro's scanline field: one dark row in three across the ground, and the tube's own vignette; Size is the pitch, one
     row in two, three or five (two dark), as a finer or coarser tube (round 5, Q15: Size was offered and drew nothing) */
  def('pattern', 'scanfield', 'Scanline field', { looks: ['retro'], css: function (th, h, o) {
    var d = tone(th.bg, isDark(th) ? -0.09 : -0.03), edge = tone(th.bg, isDark(th) ? -0.13 : -0.03);
    /* (a ground too near black for a darker row to show, Retro's phosphor black, has its rows lit instead, as a tube's
       lines are brighter than the gaps between them) */
    if (C.lum(th.bg) < 0.012) d = lift(th, 0.03);
    var pitch = { fine: [1, 2], coarse: [3, 5] }[o && o.scale] || [2, 3];
    return { css: 'repeating-linear-gradient(180deg, transparent 0 ' + pitch[0] + 'px, ' + hex(d) + ' ' + pitch[0] + 'px ' + pitch[1] + 'px), radial-gradient(130% 120% at 50% 45%, ' + hex(th.bg) + ' 55%, ' + hex(edge) + ' 100%)', colors: [th.bg, d, edge] };
  } });
  /* NieR: staff lines (Kijima's "staff lines, bass clefs and the double-bar lines") and sparse squares */
  def('pattern', 'staff', 'Staff lines', { looks: ['nier'], css: function (th, h, o) {
    var d = ink(th, 0.075), s = px(9, o), group = s * 4 + 1, gap = Math.round(group * 1.6), W = 1600, H = 900, lines = '';
    for (var y = gap * 0.6; y + group < H; y += group + gap) {
      for (var k = 0; k < 5; k++) lines += '<rect x="0" y="' + (y + k * s).toFixed(1) + '" width="' + W + '" height="1"/>';
      lines += '<rect x="' + (W - 34) + '" y="' + y.toFixed(1) + '" width="2" height="' + (group - 1) + '"/><rect x="' + (W - 28) + '" y="' + y.toFixed(1) + '" width="5" height="' + (group - 1) + '"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMaxYMid slice"><g fill="' + hex(d) + '">' + lines + '</g></svg>';
    return { css: svgUrl(svg) + ' right center / cover no-repeat, ' + hex(th.bg), colors: [th.bg, d] };
  } });
  def('pattern', 'squares', 'Squares', { looks: ['nier'], css: function (th, h, o) {
    /* (round 3c: more of them, and more filled, so Squares is not taken for Dot grid's even scatter) */
    var d = ink(th, 0.08), W = 1600, H = 900, R = rng(77), out = '', k = SCALE[o && o.scale] || 1;
    for (var i = 0; i < 40; i++) {
      var s = Math.round((18 + R() * 46) * k), x = Math.round(W * (0.35 + R() * 0.65)), y = Math.round(H * (0.15 + R() * 0.85));
      out += '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '"' + (R() < 0.4 ? ' fill="' + hex(d) + '" fill-opacity=".6"' : '') + '/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMaxYMax slice"><g fill="none" stroke="' + hex(d) + '" stroke-width="1" vector-effect="non-scaling-stroke">' + out + '</g></svg>';
    return { css: svgUrl(svg) + ' right bottom / cover no-repeat, ' + hex(th.bg), colors: [th.bg, d] };
  } });
  /* paper (the earlier picture's id): fine fibres on a high-key ground, seeded so it never reads as dirt */
  /* (round 5, Q15: Size was offered here and drew nothing; scaled, a fibre texture still looks the same on a pale paper,
     so Paper takes no Size) */
  def('pattern', 'fibre', 'Paper', { legacy: 'paper', unsized: true, css: function (th) {
    var dark = isDark(th), v = dark ? 1 : 0.2;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.7" numOctaves="3" seed="13" stitchTiles="stitch"/>' +
      '<feColorMatrix values="0 0 0 0 ' + v + ' 0 0 0 0 ' + v + ' 0 0 0 0 ' + v + ' 0 0 0 ' + (dark ? 0.16 : 0.12) + ' 0"/></filter><rect width="220" height="220" filter="url(#f)"/></svg>';
    var g = isDark(th) ? th.bg : C.mix(th.bg, C.hex('#f4ecd8'), 0.35);
    return { css: svgUrl(svg) + ' 0 0 / 220px 220px, ' + grain(th, 0.05) + ', ' + hex(g), colors: [g, lift(th, 0.03)] };
  } });

  /* marks: the look's emblem, bottom right, at about 8 % */
  function markCss(th, path, vb, alpha) {
    var c = ink(th, alpha || 0.09);
    /* (drawn in light on a scheme with no contrast to spare, a heavier line, or the emblem vanishes into the pale ground) */
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '"><g fill="none" stroke="' + hex(c) + '" stroke-width="' + (th.reflect ? 5 : 3) + '" stroke-linecap="round" stroke-linejoin="round">' + path.replace(/currentColor/g, hex(c)) + '</g></svg>';
    return { css: svgUrl(svg) + ' right 4% bottom 8% / auto ' + (th.reflect ? 'min(200px, 56%)' : 'min(150px, 42%)') + ' no-repeat, ' + hex(th.bg), colors: [th.bg, c] };
  }
  def('mark', 'mark-strings', 'Puppet cross', { css: function (th) {
    return markCss(th, '<path d="M20 22h80M60 10v34M34 22v74M86 22v64M60 44v56"/><circle cx="34" cy="100" r="5"/><circle cx="86" cy="90" r="5"/><circle cx="60" cy="104" r="6"/>', '0 0 120 120');
  } });
  def('mark', 'mark-drop', 'Droplet', { css: function (th) {
    return markCss(th, '<path d="M60 12C60 12 26 52 26 74a34 34 0 0 0 68 0C94 52 60 12 60 12z"/><path d="M44 78a16 16 0 0 0 14 14"/>', '0 0 120 120');
  } });
  def('mark', 'mark-cursor', 'Prompt', { looks: ['retro'], css: function (th) {
    return markCss(th, '<path d="M16 34l26 24-26 24"/><rect x="54" y="74" width="40" height="12" fill="currentColor"/>', '0 0 120 120');
  } });
  def('mark', 'mark-glyph', 'Glyph', { looks: ['nier'], css: function (th) {
    return markCss(th, '<circle cx="60" cy="60" r="40"/><path d="M60 26l34 34-34 34-34-34z"/><path d="M8 60h18M94 60h18M60 8v8M60 104v8"/>', '0 0 120 120');
  } });

  /* scenes: painted once at the terminal's own shape, their art in the bottom third, the top left left calm */
  def('scene', 'hills', 'Ridgelines', { legacy: true, looks: ['friendly'] });
  def('scene', 'dunes', 'Dunes');
  def('scene', 'city', 'Night city');
  def('scene', 'stars', 'Starfield', { looks: ['retro'] });
  def('scene', 'synthwave', 'Synthwave');
  def('scene', 'caustics', 'Caustics');
  def('scene', 'bokeh', 'Bokeh');
  def('scene', 'clouds', 'Clouds', { looks: ['friendly'] });
  /* moving: a painted layer bigger than the terminal, moved by transform only, stepped to about 20 fps. Lively is twice
     as fast, and four times for the two slow drifts (round 4, Q15: at twice, Gentle and Lively looked alike for seconds) */
  /* Lively is a livelier motion of its own for the two slow drifts (round 5, Q15: four times as fast still looked like
     Gentle for the first seconds): the aurora dances (its curtains sweep further, lean as they go and pulse brighter and
     fainter, as a real aurora does), the lava boils (it rises faster and its wax stretches and swells as it climbs).
     pulse is the second motion's period, ms */
  def('moving', 'aurora-drift', 'Drifting aurora', { motion: { layer: 'aurora', anim: 'pmt-bg-sway', ms: 45000, lively: 0.25, livelyAnim: 'pmt-bg-dance', pulse: 2400 } });
  /* (round 3b: its few bright stars on the scheme's own sky, no longer over Starfield's, so the two are distinct at rest) */
  /* (round 4: a 2.6 s fade, 1.3 s when Lively; at 6 s a star hardly changed in the time it takes to look) */
  def('moving', 'twinkle', 'Twinkling stars', { motion: { layer: 'stars2', anim: 'pmt-bg-twinkle', ms: 2600 } });
  def('moving', 'rain', 'Rain', { motion: { layer: 'rain', anim: 'pmt-bg-fall', ms: 2400 } });
  def('moving', 'snow', 'Snow', { motion: { layer: 'snow', anim: 'pmt-bg-snow', ms: 30000 } });
  def('moving', 'lava', 'Lava', { motion: { layer: 'lava', anim: 'pmt-bg-rise', ms: 80000, lively: 0.1, livelyAnim: 'pmt-bg-boil', pulse: 1600 } });

  /* ---- painting ---- */
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function fill(g, c) { g.fillStyle = typeof c === 'number' ? hex(c) : c; }
  function sky(g, W, H, th, top, foot) { var s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, hex(top)); s.addColorStop(1, hex(foot)); g.fillStyle = s; g.fillRect(0, 0, W, H); }
  /* a ridge: a soft sum of sines from y0, filled to the bottom */
  function ridge(g, W, H, y0, amp, waves, seed, col) {
    fill(g, col); g.beginPath(); g.moveTo(0, H);
    for (var x = 0; x <= W; x += 6) g.lineTo(x, y0 + Math.sin(x / (W / waves) + seed) * amp + Math.sin(x / (W / (waves * 3.1)) - seed * 1.7) * amp * 0.32);
    g.lineTo(W, H); g.closePath(); g.fill();
  }
  function starsOn(g, W, H, th, density, seed, maxA) {
    /* (drawn in light on a scheme with no contrast to spare, the stars are larger, or they vanish into the pale ground) */
    var R = rng(seed), dark = isDark(th), s = dark ? C.mix(th.bg, th.fg, 0.6) : C.mix(th.bg, th.fg, 0.4), tk = tight(th) ? 2.4 : 1;
    for (var i = 0; i < Math.round(W * H / 2400 * density); i++) {
      var x = R() * W, y = R() * H, big = R() > 0.92, r = (big ? 0.9 + R() * 0.6 : 0.5 + R() * 0.4) * tk;
      g.fillStyle = rgba(s, (big ? 0.35 + R() * 0.4 : 0.08 + R() * 0.22) * (maxA || 1)); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
  }
  var PAINT = {
    hills: function (g, W, H, th, h) {
      sky(g, W, H, th, th.bg, wash(th, h.a, 0.05));
      var dark = isDark(th);
      for (var k = 0; k < 4; k++) ridge(g, W, H, H * (0.66 + k * 0.075), H * (0.035 - k * 0.004), 1.6 + k * 0.7, k * 1.9 + 0.4,
        tone(wash(th, h.a, 0.04 + k * 0.012), dark ? -0.02 * (k + 1) : -0.012 * (k + 1)));
    },
    dunes: function (g, W, H, th, h) {
      sky(g, W, H, th, th.bg, wash(th, h.warm, 0.06));
      var dark = isDark(th);
      for (var k = 0; k < 4; k++) {
        var y0 = H * (0.68 + k * 0.07), base = tone(wash(th, h.warm, 0.06 + k * 0.01), dark ? -0.018 * (k + 1) : -0.01 * (k + 1));
        var gr = g.createLinearGradient(0, y0 - H * 0.04, 0, y0 + H * 0.12); gr.addColorStop(0, hex(tone(base, dark ? 0.025 : 0.01))); gr.addColorStop(1, hex(base));
        g.fillStyle = gr; g.beginPath(); g.moveTo(0, H);
        for (var x = 0; x <= W; x += 6) g.lineTo(x, y0 + Math.sin(x / (W / (1.2 + k * 0.6)) + k * 2.2) * H * 0.03);
        g.lineTo(W, H); g.closePath(); g.fill();
        /* (round 4, Q15: wind ripples down each face, fine wavy lines that follow its curve, so Dunes are sand and not
           Ridgelines' ranges) */
        g.strokeStyle = hex(tone(base, dark ? 0.035 : -0.03)); g.lineWidth = 1;
        for (var j = 1; j <= 4; j++) {
          g.globalAlpha = 0.85 - j * 0.15; g.beginPath();
          for (x = 0; x <= W; x += 3) {
            var yy = y0 + Math.sin(x / (W / (1.2 + k * 0.6)) + k * 2.2) * H * 0.03 + j * H * 0.017 + Math.sin(x / 7 + j * 1.3 + k) * 1.1;
            if (x) g.lineTo(x, yy); else g.moveTo(x, yy);
          }
          g.stroke();
        }
        g.globalAlpha = 1;
      }
    },
    city: function (g, W, H, th, h) {
      sky(g, W, H, th, th.bg, wash(th, h.b, 0.06));
      var R = rng(9), dark = isDark(th), far = tone(th.bg, dark ? -0.02 : -0.02), near = tone(th.bg, dark ? -0.045 : -0.035), lit = wash(th, h.warm, dark ? 0.3 : 0.2);
      [[far, 0.2, 0.62], [near, 0.27, 0.9]].forEach(function (L, n) {
        var x = -10;
        while (x < W) {
          var w = 24 + R() * 70, top = H * (1 - L[1] * (0.35 + R() * 0.65));
          fill(g, L[0]); g.fillRect(x, top, w - 3, H - top);
          if (n === 1) for (var wy = top + 8; wy < H - 6; wy += 11) for (var wx = x + 6; wx < x + w - 10; wx += 9) if (R() < 0.12) { g.fillStyle = rgba(lit, 0.6); g.fillRect(wx, wy, 3, 4); }
          x += w;
        }
      });
    },
    stars: function (g, W, H, th, h) {
      sky(g, W, H, th, th.bg, wash(th, h.a, 0.05));
      starsOn(g, W, H, th, 1, 11);
    },
    synthwave: function (g, W, H, th, h) {
      var hor = H * 0.64, dark = isDark(th);
      sky(g, W, hor, th, th.bg, wash(th, h.b, 0.12));
      var r = Math.min(H * 0.26, W * 0.1), cx = W * 0.72, cy = hor - r * 0.35, sun = g.createLinearGradient(0, cy - r, 0, cy + r);
      sun.addColorStop(0, hex(wash(th, h.warm, dark ? 0.32 : 0.22))); sun.addColorStop(1, hex(wash(th, h.hot, dark ? 0.26 : 0.18)));
      g.save(); g.beginPath(); g.rect(0, 0, W, hor); g.clip();
      g.fillStyle = sun; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
      fill(g, wash(th, h.b, 0.12)); for (var b = 0; b < 5; b++) { var y = cy + r * (0.12 + b * 0.18); g.fillRect(cx - r, y, 2 * r, 1.5 + b * 1.4); }
      g.restore();
      floorGrid(g, W, H, hor, th, h, 0);
    },
    caustics: function (g, W, H, th, h) {
      sky(g, W, H, th, th.bg, wash(th, h.c, 0.07));
      var R = rng(19), light = wash(th, h.c, isDark(th) ? 0.2 : 0.14);
      g.strokeStyle = rgba(light, 0.5); g.lineCap = 'round';
      for (var i = 0; i < 46; i++) {
        var y = H * (0.6 + R() * 0.4), x = R() * W, len = 60 + R() * 160, amp = 6 + R() * 12;
        g.lineWidth = 1 + R() * 2.2; g.globalAlpha = 0.25 + R() * 0.5; g.beginPath();
        for (var s = 0; s <= len; s += 6) g.lineTo(x + s, y + Math.sin(s / 22 + i) * amp);
        g.stroke();
      }
      g.globalAlpha = 1;
    },
    bokeh: function (g, W, H, th, h) {
      fill(g, th.bg); g.fillRect(0, 0, W, H);
      var R = rng(5), cols = [h.a, h.b, h.c, h.warm];
      for (var i = 0; i < 18; i++) {
        var x = W * (0.25 + R() * 0.75), y = H * (0.45 + R() * 0.55), r = (0.04 + R() * 0.08) * Math.max(W, H), c = wash(th, cols[i % 4], 0.16 + R() * 0.06);
        var gr = g.createRadialGradient(x, y, r * 0.6, x, y, r); gr.addColorStop(0, rgba(c, 0.5)); gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    },
    clouds: function (g, W, H, th, h) {
      sky(g, W, H, th, th.bg, wash(th, h.b, 0.05));
      var R = rng(29), dark = isDark(th), puff = dark ? lift(th, 0.03) : tone(th.bg, 0.015), shade = tone(puff, dark ? -0.012 : -0.02);
      for (var i = 0; i < 7; i++) {
        var cx = W * (0.15 + R() * 0.85), cy = H * (0.7 + R() * 0.25), s = H * (0.05 + R() * 0.05);
        [[0, 0, 1.6], [-1.3, 0.25, 1.1], [1.3, 0.3, 1.2], [-0.6, -0.4, 1.0], [0.7, -0.35, 1.1]].forEach(function (b) {
          fill(g, b[1] > 0 ? shade : puff); g.beginPath(); g.arc(cx + b[0] * s, cy + b[1] * s, s * b[2], 0, Math.PI * 2); g.fill();
        });
      }
    },
    /* the moving designs' layers */
    /* ribbons of light across the upper half: wide, soft ellipses, each tilted a little, in the scheme's cool hues */
    aurora: function (g, W, H, th, h) {
      fill(g, th.bg); g.fillRect(0, 0, W, H);
      [[0.18, 0.24, h.c, -0.18, 1], [0.46, 0.16, h.d, 0.08, 0.85], [0.7, 0.28, h.b, -0.12, 0.95], [0.94, 0.14, h.a, 0.16, 0.8]].forEach(function (a) {
        var R = W * 0.3;
        g.save(); g.translate(W * a[0], H * a[1]); g.rotate(a[3]); g.scale(1, Math.max(0.18, H / W * 0.9));
        var gr = g.createRadialGradient(0, 0, 0, 0, 0, R), c = pool(th, a[2], a[4]);
        gr.addColorStop(0, rgba(c, 0.95)); gr.addColorStop(0.45, rgba(c, 0.5)); gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr; g.fillRect(-R, -R, R * 2, R * 2); g.restore();
      });
    },
    /* the stars that twinkle: fewer, larger and brighter than the field under them, each with a soft halo and a cross of
       light, so Twinkling stars is its own design even when it rests (round 3b: its still frame matched Starfield) */
    stars2: function (g, W, H, th) {
      g.clearRect(0, 0, W, H);
      var R = rng(23), s = isDark(th) ? pool(th, th.fg, 1) : inkUp(th, th.fg, 0.4);
      /* (round 3c: each a four-pointed star with long rays and short diagonal ones, so it reads as a star, never as a
         flake of Snow or a dot) */
      for (var i = 0; i < Math.round(W * H / (tight(th) ? 4500 : 7000)); i++) {
        /* (round 5, Q15: on a scheme with no contrast to spare its stars can only be light on a pale pane, and Gentle's and
           Lively's fades looked alike there; they are drawn half as large again) */
        var x = R() * W, y = R() * H, r = (1.2 + R() * 1.2) * (tight(th) ? 1.5 : 1), a = tight(th) ? 1 : 0.55 + R() * 0.4, L = r * (6 + R() * 3);
        var gl = g.createRadialGradient(x, y, 0, x, y, r * 4); gl.addColorStop(0, rgba(s, a * 0.45)); gl.addColorStop(1, rgba(s, 0)); g.fillStyle = gl; g.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
        g.fillStyle = rgba(s, a); g.beginPath(); g.arc(x, y, r * 0.9, 0, Math.PI * 2); g.fill();
        [[1, 0, L], [0, 1, L], [0.7071, 0.7071, L * 0.45], [0.7071, -0.7071, L * 0.45]].forEach(function (q) {
          var rg = g.createLinearGradient(x - q[0] * q[2], y - q[1] * q[2], x + q[0] * q[2], y + q[1] * q[2]);
          rg.addColorStop(0, rgba(s, 0)); rg.addColorStop(0.5, rgba(s, a)); rg.addColorStop(1, rgba(s, 0));
          g.strokeStyle = rg; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x - q[0] * q[2], y - q[1] * q[2]); g.lineTo(x + q[0] * q[2], y + q[1] * q[2]); g.stroke();
        });
      }
    },
    rain: function (g, W, H, th, h) {
      g.clearRect(0, 0, W, H);
      /* (round 3c: on a light ground the streaks take as much of the hue as the text allows and show twice as strongly;
         they were nearly invisible there) */
      var dark = isDark(th), R = rng(31), c = dark ? wash(th, h.c, 0.32) : inkUp(th, h.c, th.mono ? 0.3 : 0.35), a0 = dark ? 0.25 : tight(th) ? 0.7 : 0.35, a1 = dark ? 0.4 : tight(th) ? 0.3 : 0.6;
      /* (and long, slanted streaks: rain, not flakes or dots) */
      /* (round 4, Q15: longer and firmer still on a ground with no contrast to spare, where they came close to Snow) */
      var tk = tight(th);
      g.strokeStyle = hex(c); g.lineWidth = dark ? 1.1 : tk ? 1.6 : 1.3; g.lineCap = 'round';
      for (var i = 0; i < Math.round(W * H / 3200); i++) {
        var x = R() * W, y = R() * H, l = tk ? 26 + R() * 34 : 16 + R() * 26;
        g.globalAlpha = a0 + R() * a1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - l * 0.06, y + l); g.stroke();
      }
      g.globalAlpha = 1; g.lineCap = 'butt';
    },
    snow: function (g, W, H, th) {
      g.clearRect(0, 0, W, H);
      /* (round 3c: on a light ground fewer, bigger, firmer flakes, each with a soft edge, so Snow reads as snow and not
         as Dot grid or Rain) */
      var dark = isDark(th), R = rng(37), c = dark ? C.mix(th.bg, th.fg, 0.55) : inkUp(th, th.fg, 0.32);
      /* (round 3c: in every look soft round flakes of several sizes, so Snow is not Rain's streaks or Twinkling stars' rays) */
      for (var i = 0; i < Math.round(W * H / 7000); i++) {
        var r = 1.4 + R() * 2.4, x = R() * W, y = R() * H, a = dark ? 0.3 + R() * 0.4 : tight(th) ? 1 : 0.45 + R() * 0.45;
        var sg = g.createRadialGradient(x, y, 0, x, y, r * 2.2); sg.addColorStop(0, rgba(c, a * 0.5)); sg.addColorStop(1, rgba(c, 0)); g.fillStyle = sg; g.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
        g.fillStyle = rgba(c, a); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    },
    lava: function (g, W, H, th, h) {
      fill(g, th.bg); g.fillRect(0, 0, W, H);
      var R = rng(41), cols = [h.hot, h.warm, h.b];
      for (var i = 0; i < 12; i++) {
        var x = R() * W, y = H * (0.3 + R() * 0.7), r = (0.08 + R() * 0.1) * Math.max(W, H), c = pool(th, cols[i % 3], 0.95);
        var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(c, 0.85)); gr.addColorStop(0.65, rgba(c, 0.3)); gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    }
  };
  /* a floor grid in perspective from the horizon, rows closer as they recede */
  function floorGrid(g, W, H, hor, th, h, phase) {
    var floor = g.createLinearGradient(0, hor, 0, H); floor.addColorStop(0, hex(wash(th, h.b, 0.08))); floor.addColorStop(1, hex(tone(th.bg, isDark(th) ? -0.1 : -0.02)));
    g.fillStyle = floor; g.fillRect(0, hor, W, H - hor);
    var line = wash(th, h.c, isDark(th) ? 0.24 : 0.2), cx = W * 0.72;
    g.strokeStyle = hex(line); g.lineWidth = 1;
    for (var i = -30; i <= 30; i++) { g.beginPath(); g.moveTo(cx + i * W * 0.012, hor); g.lineTo(cx + i * W * 0.12, H); g.stroke(); }
    for (var j = 0; j < 14; j++) { var t = (j + phase) / 14, y = hor + (H - hor) * t * t; g.globalAlpha = 0.3 + 0.7 * t; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.globalAlpha = 1;
  }

  /* the CSS designs, cached per scheme and size: resolve runs on every change, and an SVG design (contours, halftone)
     takes a while to write */
  var cssCache = new Map();
  function cssFor(id, th, o) {
    var d = BY[id]; if (!d || !d.css || !th) return null;
    o = o || {};
    var key = id + '|' + th.id + '|' + th.bg + '|' + th.fg + '|' + (o.scale || 'medium');
    if (cssCache.has(key)) return cssCache.get(key);
    var out = d.css(th, hues(th), o);
    /* round 3c: veiled on a light ground, it is drawn in light instead (its grain too) */
    if (out && !isDark(th) && scrim(worst(out.colors, th), th) >= REFLECT_AT) out = reflectCss(d.css(Object.assign({}, th, { reflect: true }), hues(th), o), th);
    /* and its fine marks no fainter than the floor */
    var vf = visOf(d);
    if (out && vf) { var k = fitGain(out.colors || [], th, vf[0], vf[1]); if (k > 1.01) out = mapCss(out, th, function (c) { return gainColor(c, th, k); }); }
    cssCache.set(key, out);
    if (cssCache.size > 160) cssCache.delete(cssCache.keys().next().value);
    return out;
  }
  /* ---- painted layers, cached per scheme, size step and blur ---- */
  var cache = new Map(), CACHE_MAX = 40, SOFT = { aurora: 1, lava: 1, bokeh: 1 };
  var canFilter = (function () { try { var g = document.createElement('canvas').getContext('2d'); g.filter = 'blur(2px)'; return g.filter === 'blur(2px)'; } catch (e) { return false; } })();
  function step(n) { return Math.max(160, Math.min(2560, Math.round((n || 960) / 160) * 160)); }
  function paint(id, th, w, h, o) {
    var d = BY[id], name = d && d.motion ? d.motion.layer : PAINT[id] ? id : null;
    if (!name || !PAINT[name] || !th) return null;
    o = o || {};
    /* a design that needs more than the scheme and the size (the lens: the wallpaper behind the terminal; green-bar paper:
       the text's row height) names it in its key */
    var extra = PAINT[name].needs ? PAINT[name].needs(o) : '';
    if (extra === null) return null;
    /* soft layers (washes of light, blurred discs) paint at half size and scale up: the same picture, a quarter of the
       work (on a software renderer a full-size lava took a third of a second) */
    var soft = SOFT[name] ? 0.5 : 1;
    var W = step(w * soft), H = step(h * soft), blur = o.blur || 0;
    var key = name + '|' + th.id + '|' + th.bg + '|' + th.fg + '|' + W + 'x' + H + '|' + blur + '|' + extra;
    if (cache.has(key)) { var hit = cache.get(key); cache.delete(key); cache.set(key, hit); return hit; }
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    /* drawn on the CPU: the layer is read back once for its worst pixel, which from a GPU canvas costs a stall (664 ms
       for Frosted panes on the P1000) */
    var g = cv.getContext('2d', { willReadFrequently: true });
    if (!g) return null;
    try { PAINT[name](g, W, H, th, hues(th), o); } catch (e) { console.error('[pmt] background painting failed', e); return null; }
    if (blur && canFilter) {
      var b = document.createElement('canvas'); b.width = W; b.height = H;
      var bg = b.getContext('2d', { willReadFrequently: true }); bg.filter = 'blur(' + blur + 'px)'; bg.drawImage(cv, -blur * 2, -blur * 2, W + blur * 4, H + blur * 4); cv = b; g = bg;
    }
    var w0 = sampleWorst(g, W, H, th), reflected = false;
    /* round 3c: veiled on a light ground, it is drawn in light instead */
    if (!isDark(th) && w0 !== null && scrim(w0, th) >= REFLECT_AT && reflectPixels(g, W, H, th)) { w0 = sampleWorst(g, W, H, th); reflected = true; }
    /* and its fine marks no fainter than the floor */
    var vf = visOf(d);
    if (vf && w0 !== null) { var kg = fitGain(sampleCols(g, W, H, th), th, vf[0], vf[1]); if (kg > 1.01 && gainPixels(g, W, H, th, kg)) w0 = sampleWorst(g, W, H, th); }
    if (tight(th) && noDarker(g, W, H, th)) w0 = sampleWorst(g, W, H, th);
    var out = { url: cv.toDataURL('image/png'), worst: w0, w: W, h: H, reflected: reflected };
    cache.set(key, out);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
    return out;
  }
  /* the worst pixel for the text, on a coarse grid of the painted layer (transparent pixels are the ground) */
  function sampleWorst(g, W, H, th) {
    var data; try { data = g.getImageData(0, 0, W, H).data; } catch (e) { return null; }
    /* the plain ground counts too: it shows between the design's marks (round 3c) */
    var worstC = th.bg, worstR = C.contrast(th.fg, th.bg), st = Math.max(3, Math.round(Math.sqrt(W * H / 9000)));
    var br = C.r(th.bg), bgg = C.g(th.bg), bb = C.b(th.bg);
    for (var y = 0; y < H; y += st) for (var x = 0; x < W; x += st) {
      var i = (y * W + x) * 4, a = data[i + 3] / 255;
      var c = a >= 1 ? C.rgb(data[i], data[i + 1], data[i + 2]) : C.mix(th.bg, C.rgb(data[i], data[i + 1], data[i + 2]), a);
      /* a unit off the ground is the ground: the canvas's own rounding when it lays the ground's colour over itself (on a
         scheme with no contrast to spare, 4.52:1, that unit read as 4.48 and veiled the whole design) */
      if (Math.abs(C.r(c) - br) <= 1 && Math.abs(C.g(c) - bgg) <= 1 && Math.abs(C.b(c) - bb) <= 1) continue;
      var r = C.contrast(th.fg, c);
      if (r < worstR) { worstR = r; worstC = c; }
    }
    return worstC;
  }
  function worst(colors, th) {
    var w = th.bg, wr = Infinity;
    (colors || []).forEach(function (c) { if (typeof c !== 'number') return; var r = C.contrast(th.fg, c); if (r < wr) { wr = r; w = c; } });
    return w;
  }
  /* "Auto" readability: the least of the scheme's own ground laid over the design that keeps the text at 4.8:1 (a
     margin over the 4.5:1 floor; research: what the floor allows is a ground up to about #3b3b3b under light text).
     The text's own contrast floor then measures every other colour against the same worst pixel (24-renderer.js) */
  function scrim(w, th) {
    if (w === null || w === undefined) return 0.45;
    /* (round 3c: less a hair of rounding: on a scheme with no contrast to spare a pixel a unit off the ground would
       otherwise cost a veil; 4.516:1 at the least on Tokyo Night Day, still over the 4.5 floor) */
    var own = C.contrast(th.fg, th.bg), want = Math.min(own, 4.8) - 0.004;
    if (C.contrast(th.fg, w) >= want) return 0;
    for (var a = 0.05; a < 0.999; a += 0.05) if (C.contrast(th.fg, C.mix(w, th.bg, a)) >= want) return Math.round(a * 100) / 100;
    /* a scheme with no contrast to spare (Tokyo Night Day's 4.52:1) shows its plain ground */
    return 1;
  }

  T.Grounds = {
    CATS: [['tonal', 'Tonal'], ['wash', 'Wash'], ['pattern', 'Pattern'], ['scene', 'Scene'], ['glass', 'Glass'], ['retro', 'Retro'], ['mark', 'Mark'], ['moving', 'Moving']],
    list: function () { return LIST.map(function (d) { return { id: d.id, cat: d.cat, name: d.name, legacy: d.legacy || false, looks: d.looks.slice(), moving: !!d.motion }; }); },
    has: function (id) { return !!BY[id]; },
    cat: function (id) { return BY[id] ? BY[id].cat : null; },
    name: function (id) { return BY[id] ? BY[id].name : null; },
    /* the gradients (bgGradient) and the rest (bgImage) */
    isGradient: function (id) { return !!BY[id] && (BY[id].cat === 'tonal' || BY[id].cat === 'wash'); },
    /* a look's suggestions: its own order when it set one (round 3b: the plain designs first), else every design that
       names it, in catalog order */
    forLook: function (lk) {
      if (SUGGEST[lk]) return SUGGEST[lk].filter(function (id) { return !!BY[id]; });
      return LIST.filter(function (d) { return d.looks.indexOf(lk) >= 0; }).map(function (d) { return d.id; });
    },
    /* the id an earlier word names: the picture 'paper' is the Paper pattern now */
    alias: function (id) { return id === 'paper-pic' ? 'fibre' : id; },
    css: cssFor,
    paint: paint,
    motion: function (id) { var d = BY[id]; return d && d.motion ? d.motion : null; },
    /* a pattern whose Size draws differently (round 5: Paper's does not) */
    sized: function (id) { var d = BY[id]; return !!d && d.cat === 'pattern' && !d.unsized; },
    /* painted at the terminal's own size (scenes, glass, retro art), rather than drawn in CSS */
    painted: function (id) { var d = BY[id]; return !!d && !d.css && !d.motion && !!PAINT[id]; },
    worst: worst,
    scrim: scrim,
    /* for the files that add designs (44-grounds-glass.js, 45-grounds-retro.js): the catalog's own helpers */
    kit: { def: def, suggest: function (lk, ids) { SUGGEST[lk] = ids.slice(); }, PAINT: PAINT, SOFT: SOFT, cache: cache, isDark: isDark, tone: tone, wash: wash, pool: pool, poolRaw: poolRaw, inkFor: inkFor, tight: tight, ink: ink, lift: lift, hex: hex, rgba: rgba, rng: rng, fill: fill, sky: sky, hues: hues, canFilter: canFilter }
  };
})();
