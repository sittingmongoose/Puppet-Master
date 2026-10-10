/* Puppet Master terminal: sixel codec (T.Sixel).
   decode(params, data, limits): DCS q payload -> RGBA, bounded and linear, never throws, never echoes input.
   encode(rgba, w, h, opts): RGBA -> complete DCS q sequence (median cut, optional ordered dither, repeat runs),
   used by the simulated img2sixel and chafa. */
(function () {
  'use strict';

  var LIMITS = Object.freeze({
    maxWidth: 10000,          // px
    maxHeight: 10000,         // px
    maxPixels: 16777216,      // 4096 x 4096
    maxRegisters: 1024,       // colour registers per image (private per image)
    maxBytes: 16777216        // 16 MiB of sixel data after 'q'
  });

  var NUM_CAP = 1000000000;   // digits keep being consumed past this, the value stops growing

  /* VT340 default colour map (VT330/VT340 Programmer Reference Manual; the same table xterm and libsixel use), RGB in percent. */
  var VT340 = [
    [0, 0, 0], [20, 20, 80], [80, 13, 13], [20, 80, 20], [80, 20, 80], [20, 80, 80], [80, 80, 20], [53, 53, 53],
    [26, 26, 26], [33, 33, 60], [60, 26, 26], [33, 60, 33], [60, 33, 60], [33, 60, 60], [60, 60, 33], [80, 80, 80]
  ];

  var LE = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

  /* Pack an opaque pixel for a Uint32Array view over RGBA bytes. Alpha 255 keeps every set pixel non-zero,
     so 0 marks "never written". */
  function pack(r, g, b) {
    return LE ? (((255 << 24) | (b << 16) | (g << 8) | r) >>> 0) : (((r << 24) | (g << 16) | (b << 8) | 255) >>> 0);
  }
  function pct(v) { v = v > 100 ? 100 : v; return Math.round(v * 255 / 100); }

  /* DEC HLS: hue 0 is blue, 120 red, 240 green; lightness and saturation 0-100. */
  function hls(h, l, s) {
    h = ((h % 360) + 240) % 360;
    l = (l > 100 ? 100 : l) / 100;
    s = (s > 100 ? 100 : s) / 100;
    if (s === 0) { var g0 = Math.round(l * 255); return pack(g0, g0, g0); }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    var hk = h / 360;
    function ch(t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return pack(Math.round(ch(hk + 1 / 3) * 255), Math.round(ch(hk) * 255), Math.round(ch(hk - 1 / 3) * 255));
  }

  function lim(given, key, hardMax) {
    var v = given && typeof given[key] === 'number' && isFinite(given[key]) && given[key] >= 1 ? Math.floor(given[key]) : LIMITS[key];
    return v > hardMax ? hardMax : v;
  }
  function limitsOf(given) {
    return {
      maxWidth: lim(given, 'maxWidth', 1 << 20),
      maxHeight: lim(given, 'maxHeight', 1 << 20),
      maxPixels: lim(given, 'maxPixels', 1 << 28),
      maxRegisters: lim(given, 'maxRegisters', 65536),
      maxBytes: lim(given, 'maxBytes', 1 << 30)
    };
  }

  function fail(code) { return { ok: false, code: code }; }

  function paramAt(params, i) {
    if (!params || typeof params.length !== 'number' || params.length <= i) return 0;
    var v = Number(params[i]);
    return isFinite(v) ? Math.floor(v) : 0;
  }

  /* ---------------------------------------------------------------- decode */

  /* Pixels live in one Uint32Array per six-row band (0 = never written), each with its own row stride, so growing
     downwards never copies and a wide band does not widen the others; a band grows sideways by doubling.
     Cost is O(input + output pixels), and output pixels are bounded by maxPixels. */
  function decodeInner(params, data, limits) {
    if (typeof data !== 'string') return fail('EINVAL');
    var L = limitsOf(limits);
    if (data.length > L.maxBytes) return fail('EFBIG');
    var transparent = paramAt(params, 1) === 1;

    var nreg = L.maxRegisters;
    var pal = new Uint32Array(nreg);
    var black = pack(0, 0, 0);
    for (var r = 0; r < nreg; r++) pal[r] = r < 16 ? pack(pct(VT340[r][0]), pct(VT340[r][1]), pct(VT340[r][2])) : black;

    var maxBands = ((L.maxHeight / 6) | 0) + 2;
    var bands = new Array(maxBands).fill(null), bandW = new Int32Array(maxBands);
    var band = null, stride = 0;           // the current band and its row stride
    var extW = 0, extH = 0, setW = 0;  // extent: any sixel char widens, only set bits deepen; setW: set bits only
    var rasterW = 0, rasterH = 0, pan = 1, pad = 1, rasterOpen = true;
    var x = 0, y = 0, bi = 0, col = pal[0];
    var n = data.length, i = 0, c, d, k;
    var vals = [0, 0, 0, 0, 0];

    function growBand(need) {
      var old = bands[bi], oc = old ? old.length / 6 : 0;
      var nw = Math.max(need, Math.min(Math.max(oc * 2, rasterW, 64), L.maxWidth));
      var nb = new Uint32Array(nw * 6), cw = bandW[bi];
      if (old) for (var rr = 0; rr < 6; rr++) nb.set(old.subarray(rr * oc, rr * oc + cw), rr * nw);
      bands[bi] = band = nb; stride = nw;
    }

    while (i < n) {
      c = data.charCodeAt(i);
      var rep = 0;
      if (c === 33) { // '!' repeat introducer
        i++;
        while (i < n && (d = data.charCodeAt(i) - 48) >= 0 && d <= 9) { rep = rep < NUM_CAP ? Math.min(rep * 10 + d, NUM_CAP) : NUM_CAP; i++; }
        if (i >= n) break;
        c = data.charCodeAt(i);
        if (c < 63 || c > 126) continue;   // a repeat without a sixel is dropped; the char is reprocessed
      }
      if (c >= 63 && c <= 126) { // sixel data
        if (rep === 0) rep = 1;
        i++;
        rasterOpen = false;
        var bits = c - 63;
        var nx = x + rep;
        if (nx > L.maxWidth) return fail('EFBIG');
        if (nx > extW) extW = nx;
        if (bits) {
          var bottom = y + 32 - Math.clz32(bits);   // highest set row + 1
          if (bottom > L.maxHeight) return fail('EFBIG');
          if (nx > setW || bottom > extH) {
            if (Math.max(nx, setW, rasterW) * Math.max(bottom, extH, rasterH) > L.maxPixels) return fail('EFBIG');
            if (bottom > extH) extH = bottom;
            if (nx > setW) setW = nx;
          }
          if (nx > stride) growBand(nx);
          if (nx > bandW[bi]) bandW[bi] = nx;
          if (rep === 1) {
            if (bits & 1) band[x] = col;
            if (bits & 2) band[x + stride] = col;
            if (bits & 4) band[x + 2 * stride] = col;
            if (bits & 8) band[x + 3 * stride] = col;
            if (bits & 16) band[x + 4 * stride] = col;
            if (bits & 32) band[x + 5 * stride] = col;
          } else {
            for (k = 0; k < 6; k++) if (bits & (1 << k)) band.fill(col, x + k * stride, nx + k * stride);
          }
        }
        x = nx;
        continue;
      }
      if (c === 35 || c === 34) { // '#' colour, '"' raster attributes: up to 5 numeric params
        i++;
        vals[0] = vals[1] = vals[2] = vals[3] = vals[4] = 0; k = 0;
        for (;;) {
          while (i < n && (d = data.charCodeAt(i) - 48) >= 0 && d <= 9) {
            if (k < 5 && vals[k] < NUM_CAP) vals[k] = Math.min(vals[k] * 10 + d, NUM_CAP);
            i++;
          }
          if (i < n && data.charCodeAt(i) === 59) { k++; i++; continue; }
          break;
        }
        if (c === 35) {
          var reg = vals[0] % nreg;
          if (k >= 1) {
            if (vals[1] === 1) pal[reg] = hls(vals[2], vals[3], vals[4]);
            else if (vals[1] === 2) pal[reg] = pack(pct(vals[2]), pct(vals[3]), pct(vals[4]));
          }
          col = pal[reg];
        } else if (rasterOpen) {
          // raster attributes count only before the first sixel; later ones are consumed and ignored
          pan = vals[0] || 1; pad = vals[1] || 1;
          if (k >= 3 && vals[2] > 0 && vals[3] > 0) {
            if (vals[2] > L.maxWidth || vals[3] > L.maxHeight || vals[2] * vals[3] > L.maxPixels) return fail('EFBIG');
            rasterW = vals[2]; rasterH = vals[3];
          }
        }
        continue;
      }
      if (c === 36) { x = 0; i++; continue; }                                         // '$' graphics CR
      if (c === 45) { x = 0; i++; if (y < L.maxHeight) { y += 6; bi++; band = bands[bi]; stride = band ? band.length / 6 : 0; } continue; }  // '-' graphics new line
      i++;                                                                              // anything else: ignored
    }

    var W = Math.max(rasterW, extW), H = Math.max(rasterH, extH);
    if (!W || !H) return fail('EINVAL');
    if (W > L.maxWidth || H > L.maxHeight || W * H > L.maxPixels) return fail('EFBIG');
    var out = new Uint32Array(W * H), bg = pal[0];
    for (var by = 0, b2 = 0; by < H; by += 6, b2++) {
      var rows = Math.min(6, H - by), src = bands[b2], bw = src ? bandW[b2] : 0, ss = src ? src.length / 6 : 0;
      for (var ry = 0; ry < rows; ry++) {
        var ro = (by + ry) * W;
        if (src) out.set(src.subarray(ry * ss, ry * ss + bw), ro);
        if (!transparent) {
          // unset pixels take register 0 as it stands at the end of the image
          for (var rx = ro, re = ro + bw; rx < re; rx++) if (out[rx] === 0) out[rx] = bg;
          if (bw < W) out.fill(bg, ro + bw, ro + W);
        }
      }
    }
    return {
      ok: true, width: W, height: H,
      rgba: new Uint8ClampedArray(out.buffer, 0, W * H * 4),
      transparentBg: transparent,
      aspect: [pan, pad],                    // parsed, not applied: pixels are square
      rasterWidth: rasterW, rasterHeight: rasterH,
      lastBandY: Math.min(y, H)              // top pixel row of the final sixel band, for text-cursor placement
    };
  }

  function decode(params, data, limits) {
    try { return decodeInner(params, data, limits); }
    catch (e) { return fail(e && e.name === 'RangeError' ? 'ENOMEM' : 'EINVAL'); }
  }

  /* ---------------------------------------------------------------- encode */

  /* 8x8 Bayer matrix by the recursive definition, normalised to -0.5..0.5. */
  var BAYER8 = (function () {
    var base = [0, 2, 3, 1], n = 2, mat = base.slice();
    while (n < 8) {
      var nn = n * 2, next = new Array(nn * nn);
      for (var yy = 0; yy < nn; yy++) for (var xx = 0; xx < nn; xx++) {
        next[yy * nn + xx] = 4 * mat[(yy % n) * n + (xx % n)] + base[(yy >= n ? 2 : 0) + (xx >= n ? 1 : 0)];
      }
      mat = next; n = nn;
    }
    var m = new Float32Array(64);
    for (var t = 0; t < 64; t++) m[t] = (mat[t] + 0.5) / 64 - 0.5;
    return m;
  })();

  /* Median cut over the non-empty bins of a 5-bit-per-channel histogram. The box with the largest
     count x volume is split on its longest axis at the weighted median, by bucket counts (no sorting). */
  function medianCut(arr, hist, sumR, sumG, sumB, maxColors) {
    var tmp = new Int32Array(arr.length), buckets = new Float64Array(32);
    var boxes = [{ lo: 0, hi: arr.length }];
    function stats(box) {
      var r0 = 31, r1 = 0, g0 = 31, g1 = 0, b0 = 31, b1 = 0, cnt = 0;
      for (var j = box.lo; j < box.hi; j++) {
        var kk = arr[j], rr = kk >> 10, gg = (kk >> 5) & 31, bb = kk & 31;
        if (rr < r0) r0 = rr; if (rr > r1) r1 = rr;
        if (gg < g0) g0 = gg; if (gg > g1) g1 = gg;
        if (bb < b0) b0 = bb; if (bb > b1) b1 = bb;
        cnt += hist[kk];
      }
      var dr = r1 - r0, dg = g1 - g0, db = b1 - b0;
      box.count = cnt;
      box.axis = dg >= dr && dg >= db ? 1 : dr >= db ? 0 : 2;
      box.vmin = box.axis === 0 ? r0 : box.axis === 1 ? g0 : b0;
      box.vmax = box.axis === 0 ? r1 : box.axis === 1 ? g1 : b1;
      box.score = box.vmax > box.vmin ? cnt * (dr + 1) * (dg + 1) * (db + 1) : -1;
    }
    stats(boxes[0]);
    while (boxes.length < maxColors) {
      var best = -1, bs = 0;
      for (var q = 0; q < boxes.length; q++) if (boxes[q].score > bs) { bs = boxes[q].score; best = q; }
      if (best < 0) break;
      var box = boxes[best], shift = box.axis === 0 ? 10 : box.axis === 1 ? 5 : 0, j2;
      buckets.fill(0);
      for (j2 = box.lo; j2 < box.hi; j2++) buckets[(arr[j2] >> shift) & 31] += hist[arr[j2]];
      var half = box.count / 2, acc = 0, m = box.vmin;
      for (var v = box.vmin; v < box.vmax; v++) { acc += buckets[v]; m = v; if (acc >= half) break; }
      var a = box.lo, t = 0;
      for (j2 = box.lo; j2 < box.hi; j2++) {
        var key = arr[j2];
        if (((key >> shift) & 31) <= m) arr[a++] = key; else tmp[t++] = key;
      }
      arr.set(tmp.subarray(0, t), a);
      var nb = { lo: a, hi: box.hi };
      box.hi = a;
      stats(box); stats(nb);
      boxes.push(nb);
    }
    var pal = [];
    for (var z = 0; z < boxes.length; z++) {
      var bx = boxes[z], sr = 0, sg = 0, sb = 0, ct = 0;
      for (var j3 = bx.lo; j3 < bx.hi; j3++) { var k3 = arr[j3]; sr += sumR[k3]; sg += sumG[k3]; sb += sumB[k3]; ct += hist[k3]; }
      if (ct) pal.push([sr / ct, sg / ct, sb / ct]);
    }
    return pal;
  }

  /* Nearest palette entry by squared RGB distance, searching outward from the green-sorted position. */
  function Nearest(pal) {
    var n = pal.length, order = [];
    for (var i = 0; i < n; i++) order.push(i);
    order.sort(function (x1, x2) { return pal[x1][1] - pal[x2][1]; });
    this.n = n;
    this.R = new Float64Array(n); this.G = new Float64Array(n); this.B = new Float64Array(n); this.I = new Int32Array(n);
    for (var k = 0; k < n; k++) { var o = order[k]; this.R[k] = pal[o][0]; this.G[k] = pal[o][1]; this.B[k] = pal[o][2]; this.I[k] = o; }
  }
  Nearest.prototype.find = function (r, g, b) {
    var R = this.R, G = this.G, B = this.B, n = this.n, lo = 0, hi = n;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (G[mid] < g) lo = mid + 1; else hi = mid; }
    var best = Infinity, bi = 0, up = lo, dn = lo - 1, d, e, f, dd;
    while (up < n || dn >= 0) {
      if (up < n) {
        e = G[up] - g;
        if (e * e >= best) up = n;
        else { d = R[up] - r; f = B[up] - b; dd = d * d + e * e + f * f; if (dd < best) { best = dd; bi = up; } up++; }
      }
      if (dn >= 0) {
        e = G[dn] - g;
        if (e * e >= best) dn = -1;
        else { d = R[dn] - r; f = B[dn] - b; dd = d * d + e * e + f * f; if (dd < best) { best = dd; bi = dn; } dn--; }
      }
    }
    return this.I[bi];
  };

  /* A few Lloyd (k-means) passes over the histogram bins, weighted by count, to settle the median-cut palette. */
  function refine(keys, hist, sumR, sumG, sumB, pal, passes) {
    var n = pal.length, aR = new Float64Array(n), aG = new Float64Array(n), aB = new Float64Array(n), aC = new Float64Array(n);
    for (var it = 0; it < passes; it++) {
      var near = new Nearest(pal);
      aR.fill(0); aG.fill(0); aB.fill(0); aC.fill(0);
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j], c = hist[k], q = near.find(sumR[k] / c, sumG[k] / c, sumB[k] / c);
        aR[q] += sumR[k]; aG[q] += sumG[k]; aB[q] += sumB[k]; aC[q] += c;
      }
      for (var p = 0; p < n; p++) if (aC[p]) pal[p] = [aR[p] / aC[p], aG[p] / aC[p], aB[p] / aC[p]];
    }
    return pal;
  }

  var REFINE_PASSES = 3;

  function rle(ch, count) {
    if (count <= 0) return '';
    if (count > 3) return '!' + count + ch;
    return count === 1 ? ch : count === 2 ? ch + ch : ch + ch + ch;
  }

  function encode(rgba, width, height, opts) {
    opts = opts || {};
    var w = width | 0, h = height | 0;
    if (w <= 0 || h <= 0 || !rgba || rgba.length < w * h * 4) return '';
    var maxColors = opts.colors == null ? 256 : Math.max(1, Math.min(256, opts.colors | 0 || 256));
    var transparent = !!opts.transparent;
    var dither = opts.dither === true || opts.dither === 'ordered';
    var total = w * h;

    // 1. effective colours (alpha composited over black unless transparent)
    var px = new Int32Array(total);       // 0xRRGGBB, or -1 for transparent
    for (var p = 0, o = 0; p < total; p++, o += 4) {
      var a = rgba[o + 3];
      if (transparent && a < 128) { px[p] = -1; continue; }
      var rr = rgba[o], gg = rgba[o + 1], bb = rgba[o + 2];
      if (!transparent && a < 255) { rr = (rr * a + 127) / 255 | 0; gg = (gg * a + 127) / 255 | 0; bb = (bb * a + 127) / 255 | 0; }
      px[p] = (rr << 16) | (gg << 8) | bb;
    }

    // 2. exact palette when the image has few colours
    var palette = null, idx = new Uint16Array(total), exact = new Map();
    for (var p2 = 0; p2 < total; p2++) {
      var v = px[p2]; if (v < 0) continue;
      if (!exact.has(v)) { if (exact.size >= maxColors) { exact = null; break; } exact.set(v, exact.size); }
    }
    if (exact) {
      palette = [];
      exact.forEach(function (ix, key) { palette[ix] = [key >> 16, (key >> 8) & 255, key & 255]; });
      for (var p3 = 0; p3 < total; p3++) idx[p3] = px[p3] < 0 ? 0xFFFF : exact.get(px[p3]);
    } else {
      // 3. median cut over a 5-bit histogram, Lloyd refinement, nearest-colour mapping cached per bin
      var hist = new Uint32Array(32768), sR = new Float64Array(32768), sG = new Float64Array(32768), sB = new Float64Array(32768);
      for (var p4 = 0; p4 < total; p4++) {
        var v2 = px[p4]; if (v2 < 0) continue;
        var r8 = v2 >> 16, g8 = (v2 >> 8) & 255, b8 = v2 & 255;
        var key = ((r8 >> 3) << 10) | ((g8 >> 3) << 5) | (b8 >> 3);
        hist[key]++; sR[key] += r8; sG[key] += g8; sB[key] += b8;
      }
      var nkeys = 0;
      for (var bk = 0; bk < 32768; bk++) if (hist[bk]) nkeys++;
      var keys = new Int32Array(nkeys);
      for (var bk2 = 0, kn = 0; bk2 < 32768; bk2++) if (hist[bk2]) keys[kn++] = bk2;
      palette = refine(keys, hist, sR, sG, sB, medianCut(keys.slice(), hist, sR, sG, sB, maxColors), REFINE_PASSES);
      for (var q = 0; q < palette.length; q++) palette[q] = [Math.round(palette[q][0]), Math.round(palette[q][1]), Math.round(palette[q][2])];
      var near = new Nearest(palette);
      var cache = new Int16Array(32768).fill(-1);
      var spread = dither ? Math.min(64, 0.8 * 255 / Math.cbrt(palette.length)) : 0;  // about one palette step
      for (var yy = 0, p5 = 0; yy < h; yy++) {
        for (var xx = 0; xx < w; xx++, p5++) {
          var v3 = px[p5]; if (v3 < 0) { idx[p5] = 0xFFFF; continue; }
          var r = v3 >> 16, g = (v3 >> 8) & 255, b = v3 & 255;
          if (dither) {
            var t = BAYER8[((yy & 7) << 3) | (xx & 7)] * spread;
            r = r + t; g = g + t; b = b + t;
            r = r < 0 ? 0 : r > 255 ? 255 : r | 0; g = g < 0 ? 0 : g > 255 ? 255 : g | 0; b = b < 0 ? 0 : b > 255 ? 255 : b | 0;
          }
          var k2 = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
          var m = cache[k2];
          if (m < 0) {
            // a bin seen in the histogram maps by its mean colour, a dithered-into bin by its centre
            m = hist[k2] ? near.find(sR[k2] / hist[k2], sG[k2] / hist[k2], sB[k2] / hist[k2])
                         : near.find((k2 >> 10 << 3) + 4, ((k2 >> 5) & 31) * 8 + 4, (k2 & 31) * 8 + 4);
            cache[k2] = m;
          }
          idx[p5] = m;
        }
      }
    }

    // 4. header, palette (RGB 0-100), bands
    var out = '\x1bP0;' + (transparent ? 1 : 0) + ';0q"1;1;' + w + ';' + h;
    var ncol = palette.length;
    for (var c = 0; c < ncol; c++) {
      out += '#' + c + ';2;' + Math.round(palette[c][0] * 100 / 255) + ';' + Math.round(palette[c][1] * 100 / 255) + ';' + Math.round(palette[c][2] * 100 / 255);
    }
    var bits = new Uint8Array(ncol * w), minX = new Int32Array(ncol).fill(w), maxX = new Int32Array(ncol).fill(-1);
    var used = [];
    for (var y0 = 0; y0 < h; y0 += 6) {
      var rows = Math.min(6, h - y0);
      used.length = 0;
      for (var k = 0; k < rows; k++) {
        var bit = 1 << k, off = (y0 + k) * w;
        for (var x = 0; x < w; x++) {
          var ci = idx[off + x];
          if (ci === 0xFFFF) continue;
          if (maxX[ci] < 0) used.push(ci);
          bits[ci * w + x] |= bit;
          if (x < minX[ci]) minX[ci] = x;
          if (x > maxX[ci]) maxX[ci] = x;
        }
      }
      used.sort(function (u1, u2) { return u1 - u2; });
      var band = '';
      for (var u = 0; u < used.length; u++) {
        var cc = used[u], base = cc * w, x0 = minX[cc], x1 = maxX[cc];
        var s = (u ? '$#' : '#') + cc + rle('?', x0);
        var run = bits[base + x0], cnt = 1;
        for (var xx2 = x0 + 1; xx2 <= x1; xx2++) {
          var bv = bits[base + xx2];
          if (bv === run) { cnt++; continue; }
          s += rle(String.fromCharCode(run + 63), cnt);
          run = bv; cnt = 1;
        }
        s += rle(String.fromCharCode(run + 63), cnt);
        band += s;
        bits.fill(0, base + x0, base + x1 + 1);
        minX[cc] = w; maxX[cc] = -1;
      }
      out += band;
      if (y0 + 6 < h) out += '-';
    }
    return out + '\x1b\\';
  }

  T.Sixel = {
    decode: decode,
    encode: encode,
    LIMITS: LIMITS,
    VT340_PALETTE: VT340
  };
})();
