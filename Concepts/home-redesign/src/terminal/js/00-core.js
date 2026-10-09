/* Puppet Master terminal: core namespace, emitter, colour maths, cell widths, encoders.
   Every other file in js/ is one block that reads and writes T.<Name> (ARCHITECTURE.md section 2). */
var T = {};

(function () {
  T.VERSION = '2026-10-09.1';

  /* ---- emitter ---- */
  function Emitter() { this._ev = Object.create(null); }
  Emitter.prototype.on = function (name, fn) {
    (this._ev[name] || (this._ev[name] = [])).push(fn);
    var self = this;
    return function () { self.off(name, fn); };
  };
  Emitter.prototype.off = function (name, fn) {
    var list = this._ev[name]; if (!list) return;
    var i = list.indexOf(fn); if (i >= 0) list.splice(i, 1);
  };
  Emitter.prototype.emit = function (name, a, b) {
    var list = this._ev[name]; if (!list || !list.length) return;
    list = list.slice();
    for (var i = 0; i < list.length; i++) {
      try { list[i](a, b); } catch (e) { console.error('[pmt] listener for ' + name + ' failed', e); }
    }
  };
  T.Emitter = Emitter;
  T.mixinEmitter = function (obj) {
    obj._ev = Object.create(null);
    obj.on = Emitter.prototype.on; obj.off = Emitter.prototype.off; obj.emit = Emitter.prototype.emit;
    return obj;
  };

  /* ---- small utilities ---- */
  T.util = {
    clamp: function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; },
    now: function () { return (typeof performance !== 'undefined' ? performance.now() : Date.now()); },
    esc: function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    fmtElapsed: function (ms) {
      var s = Math.max(0, Math.floor(ms / 1000));
      var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
      return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (r < 10 ? '0' : '') + r;
    },
    utf8Encode: function (str) {
      if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
      var out = [], i, c;
      for (i = 0; i < str.length; i++) {
        c = str.codePointAt(i); if (c > 0xffff) i++;
        if (c < 0x80) out.push(c);
        else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
        else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
        else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      }
      return new Uint8Array(out);
    },
    utf8Decode: function (bytes) {
      if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      var s = ''; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return s;
    }
  };

  /* base64 for Uint8Array without btoa limits on large inputs */
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var B64REV = new Int16Array(256).fill(-1);
  for (var bi = 0; bi < 64; bi++) B64REV[B64.charCodeAt(bi)] = bi;
  B64REV['-'.charCodeAt(0)] = 62; B64REV['_'.charCodeAt(0)] = 63;
  T.base64 = {
    encode: function (bytes) {
      var out = [], i, n = bytes.length, chunk = [];
      for (i = 0; i + 2 < n; i += 3) {
        var v = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        chunk.push(B64[v >> 18], B64[(v >> 12) & 63], B64[(v >> 6) & 63], B64[v & 63]);
        if (chunk.length > 32768) { out.push(chunk.join('')); chunk = []; }
      }
      if (i < n) {
        var w = bytes[i] << 16 | (i + 1 < n ? bytes[i + 1] << 8 : 0);
        chunk.push(B64[w >> 18], B64[(w >> 12) & 63], i + 1 < n ? B64[(w >> 6) & 63] : '=', '=');
      }
      out.push(chunk.join(''));
      return out.join('');
    },
    /* returns Uint8Array or null when the input holds anything but base64 (whitespace is skipped) */
    decode: function (str) {
      var len = str.length, out = new Uint8Array(Math.floor(len * 3 / 4) + 3), o = 0, acc = 0, bits = 0;
      for (var i = 0; i < len; i++) {
        var c = str.charCodeAt(i);
        if (c === 61) break; /* '=' */
        if (c === 10 || c === 13 || c === 32 || c === 9) continue;
        var v = c < 256 ? B64REV[c] : -1;
        if (v < 0) return null;
        acc = (acc << 6) | v; bits += 6;
        if (bits >= 8) { bits -= 8; out[o++] = (acc >> bits) & 255; }
      }
      return out.subarray(0, o);
    }
  };

  /* ---- colour encoding and maths ---- */
  var C = {};
  C.DEFAULT = 0;
  C.PAL = 0x100;
  C.RGB = 0x1000000;
  C.isPal = function (c) { return c >= 0x100 && c < 0x200; };
  C.isRgb = function (c) { return c >= 0x1000000; };
  C.hex = function (s) {
    if (typeof s === 'number') return s & 0xffffff;
    s = String(s).trim().replace(/^#/, '').replace(/^0x/i, '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    var v = parseInt(s.slice(0, 6), 16);
    return isNaN(v) ? 0 : v;
  };
  C.toHex = function (rgb) { return '#' + (0x1000000 | (rgb & 0xffffff)).toString(16).slice(1); };
  C.rgb = function (r, g, b) { return ((r & 255) << 16) | ((g & 255) << 8) | (b & 255); };
  C.r = function (c) { return (c >> 16) & 255; };
  C.g = function (c) { return (c >> 8) & 255; };
  C.b = function (c) { return c & 255; };
  C.css = function (rgb, a) {
    if (a === undefined || a >= 1) return C.toHex(rgb);
    return 'rgba(' + C.r(rgb) + ',' + C.g(rgb) + ',' + C.b(rgb) + ',' + Math.round(a * 1000) / 1000 + ')';
  };
  function lin(v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function delin(v) { v = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; return Math.round(T.util.clamp(v, 0, 1) * 255); }
  C.lum = function (rgb) { return 0.2126 * lin(C.r(rgb)) + 0.7152 * lin(C.g(rgb)) + 0.0722 * lin(C.b(rgb)); };
  C.contrast = function (a, b) {
    var la = C.lum(a), lb = C.lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };
  C.mix = function (a, b, t) {
    return C.rgb(Math.round(C.r(a) + (C.r(b) - C.r(a)) * t), Math.round(C.g(a) + (C.g(b) - C.g(a)) * t),
      Math.round(C.b(a) + (C.b(b) - C.b(a)) * t));
  };
  C.oklab = function (rgb) {
    var r = lin(C.r(rgb)), g = lin(C.g(rgb)), b = lin(C.b(rgb));
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  };
  C.fromOklab = function (L, a, b) {
    var l = L + 0.3963377774 * a + 0.2158037573 * b, m = L - 0.1055613458 * a - 0.0638541728 * b,
      s = L - 0.0894841775 * a - 1.2914855480 * b;
    l = l * l * l; m = m * m * m; s = s * s * s;
    return C.rgb(delin(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      delin(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      delin(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s));
  };
  /* Minimum-contrast floor: keep hue and chroma, move OKLab lightness away from the background until the WCAG
     ratio holds (the Ghostty / VS Code rule). Returns fg unchanged when it already passes or ratio <= 1. */
  var ensureCache = new Map();
  C.ensure = function (fg, bg, ratio) {
    if (!ratio || ratio <= 1) return fg;
    if (C.contrast(fg, bg) >= ratio) return fg;
    var key = fg * 16777216 + bg + ratio / 100;
    var hit = ensureCache.get(key); if (hit !== undefined) return hit;
    var lab = C.oklab(fg), bgL = C.lum(bg);
    var up = bgL < 0.18; /* dark background: lighten; light background: darken */
    var lo = lab[0], hi = up ? 1 : 0, best = up ? 0xffffff : 0, i;
    for (i = 0; i < 18; i++) {
      var mid = (lo + hi) / 2, cand = C.fromOklab(mid, lab[1], lab[2]);
      if (C.contrast(cand, bg) >= ratio) { best = cand; hi = mid; } else { lo = mid; }
    }
    if (ensureCache.size > 4096) ensureCache.clear();
    ensureCache.set(key, best);
    return best;
  };
  /* xterm 256: 16 from the scheme, a 6x6x6 cube, a 24-step grey ramp */
  C.palette256 = function (ansi16) {
    var p = new Uint32Array(256), i, lv = [0, 95, 135, 175, 215, 255];
    for (i = 0; i < 16; i++) p[i] = C.hex(ansi16[i]);
    for (i = 0; i < 216; i++) p[16 + i] = C.rgb(lv[Math.floor(i / 36)], lv[Math.floor(i / 6) % 6], lv[i % 6]);
    for (i = 0; i < 24; i++) { var v = 8 + i * 10; p[232 + i] = C.rgb(v, v, v); }
    return p;
  };
  T.color = C;

  /* ---- cell widths (wcwidth) ---- */
  var WIDE = [
    [0x1100, 0x115f], [0x231a, 0x231b], [0x2329, 0x232a], [0x23e9, 0x23ec], [0x23f0, 0x23f0], [0x23f3, 0x23f3],
    [0x25fd, 0x25fe], [0x2614, 0x2615], [0x2648, 0x2653], [0x267f, 0x267f], [0x2693, 0x2693], [0x26a1, 0x26a1],
    [0x26aa, 0x26ab], [0x26bd, 0x26be], [0x26c4, 0x26c5], [0x26ce, 0x26ce], [0x26d4, 0x26d4], [0x26ea, 0x26ea],
    [0x26f2, 0x26f3], [0x26f5, 0x26f5], [0x26fa, 0x26fa], [0x26fd, 0x26fd], [0x2705, 0x2705], [0x270a, 0x270b],
    [0x2728, 0x2728], [0x274c, 0x274c], [0x274e, 0x274e], [0x2753, 0x2755], [0x2757, 0x2757], [0x2795, 0x2797],
    [0x27b0, 0x27b0], [0x27bf, 0x27bf], [0x2b1b, 0x2b1c], [0x2b50, 0x2b50], [0x2b55, 0x2b55], [0x2e80, 0x303e],
    [0x3041, 0x33ff], [0x3400, 0x4dbf], [0x4e00, 0x9fff], [0xa000, 0xa4cf], [0xa960, 0xa97f], [0xac00, 0xd7a3],
    [0xf900, 0xfaff], [0xfe10, 0xfe19], [0xfe30, 0xfe6f], [0xff00, 0xff60], [0xffe0, 0xffe6], [0x16fe0, 0x16fe4],
    [0x17000, 0x18aff], [0x1b000, 0x1b2ff], [0x1f004, 0x1f004], [0x1f0cf, 0x1f0cf], [0x1f18e, 0x1f18e],
    [0x1f191, 0x1f19a], [0x1f200, 0x1f202], [0x1f210, 0x1f23b], [0x1f240, 0x1f248], [0x1f250, 0x1f251],
    [0x1f260, 0x1f265], [0x1f300, 0x1f320], [0x1f32d, 0x1f335], [0x1f337, 0x1f37c], [0x1f37e, 0x1f393],
    [0x1f3a0, 0x1f3ca], [0x1f3cf, 0x1f3d3], [0x1f3e0, 0x1f3f0], [0x1f3f4, 0x1f3f4], [0x1f3f8, 0x1f43e],
    [0x1f440, 0x1f440], [0x1f442, 0x1f4fc], [0x1f4ff, 0x1f53d], [0x1f54b, 0x1f54e], [0x1f550, 0x1f567],
    [0x1f57a, 0x1f57a], [0x1f595, 0x1f596], [0x1f5a4, 0x1f5a4], [0x1f5fb, 0x1f64f], [0x1f680, 0x1f6c5],
    [0x1f6cc, 0x1f6cc], [0x1f6d0, 0x1f6d2], [0x1f6d5, 0x1f6d7], [0x1f6dc, 0x1f6df], [0x1f6eb, 0x1f6ec],
    [0x1f6f4, 0x1f6fc], [0x1f7e0, 0x1f7eb], [0x1f7f0, 0x1f7f0], [0x1f90c, 0x1f93a], [0x1f93c, 0x1f945],
    [0x1f947, 0x1f9ff], [0x1fa70, 0x1faff], [0x20000, 0x2fffd], [0x30000, 0x3fffd]
  ];
  var zeroRe = null;
  try { zeroRe = new RegExp('^[\\p{Mn}\\p{Me}\\p{Cf}]$', 'u'); } catch (e) { zeroRe = null; }
  function inTable(cp, tab) {
    var lo = 0, hi = tab.length - 1;
    if (cp < tab[0][0] || cp > tab[hi][1]) return false;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (cp > tab[mid][1]) lo = mid + 1; else if (cp < tab[mid][0]) hi = mid - 1; else return true;
    }
    return false;
  }
  var zwCache = new Map();
  /* 0 for combining / format characters (they join the previous cell), 2 for wide, 1 otherwise */
  T.wcwidth = function (cp) {
    if (cp < 0x300) return cp < 0x20 || (cp >= 0x7f && cp < 0xa0) ? 0 : (cp === 0xad ? 1 : 1);
    if (cp === 0x200d || (cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef)) return 0;
    if (cp >= 0x1f3fb && cp <= 0x1f3ff) return 0; /* skin tone modifiers join */
    if (cp === 0x10eeee) return 1; /* kitty Unicode placeholder */
    var z = zwCache.get(cp);
    if (z === undefined) {
      z = zeroRe ? zeroRe.test(String.fromCodePoint(cp)) : (cp >= 0x300 && cp <= 0x36f);
      if (zwCache.size > 8192) zwCache.clear();
      zwCache.set(cp, z);
    }
    if (z) return 0;
    return inTable(cp, WIDE) ? 2 : 1;
  };

  /* ---- motion and looks ---- */
  T.look = function () {
    var h = document.documentElement;
    var theme = (h.getAttribute('data-theme') || 'basic-dark').split('-');
    var reduced = h.getAttribute('data-motion') === 'reduced' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    return { family: theme[0], mode: theme[1] === 'light' ? 'light' : 'dark',
      nier: h.getAttribute('data-o55-nier') === 'on', reduced: !!reduced };
  };

  /* a program signal (rejects ctx.sleep and friends) */
  function Signal(name) { this.name = name; this.signal = name; this.message = name; }
  Signal.prototype = Object.create(Error.prototype);
  T.Signal = Signal;

  /* stable short id without exposing anything to the UI */
  var seq = 0;
  T.uid = function (prefix) { seq++; return (prefix || 'x') + seq.toString(36) + Math.floor(Math.random() * 1e6).toString(36); };
})();
