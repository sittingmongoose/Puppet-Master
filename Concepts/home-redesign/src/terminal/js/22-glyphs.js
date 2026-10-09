/* Procedural glyphs: box drawing (U+2500-257F), block elements and shades (U+2580-259F), braille (U+2800-28FF),
   powerline (U+E0B0-E0BF), sextants (U+1FB00-1FB3B). Drawn to the cell's exact device-pixel box, so lines join
   across cells at every size and no patched font is needed. Line weights: light = max(1, round(cellW / 8)) device px,
   heavy = 2 x light, double = two light lines one light apart. */
(function () {
  /* box table: U D L R arm weights per code point from U+2500 (0 none, 1 light, 2 heavy, 3 double);
     letters mark the special forms: a = arc, x = diagonal, and dash counts in DASH below */
  var BOX = ('0011 0022 1100 2200 0011 0022 1100 2200 0011 0022 1100 2200 0101 0102 0201 0202 ' +
    '0110 0120 0210 0220 1001 1002 2001 2002 1010 1020 2010 2020 1101 1102 2101 1201 2201 2102 1202 2202 ' +
    '1110 1120 2110 1210 2210 2120 1220 2220 0111 0121 0112 0122 0211 0221 0212 0222 1011 1021 1012 1022 ' +
    '2011 2021 2012 2022 1111 1121 1112 1122 2111 1211 2211 2121 2112 1221 1212 2122 1222 2221 2212 2222 ' +
    '0011 0022 1100 2200 0033 3300 0103 0301 0303 0130 0310 0330 1003 3001 3003 1030 3010 3030 1103 3301 ' +
    '3303 1130 3310 3330 0133 0311 0333 1033 3011 3033 1133 3311 3333 a a a a x x x 0010 1000 0001 0100 ' +
    '0020 2000 0002 0200 0012 1200 0021 2100').split(' ');
  var DASH = { 0x2504: 3, 0x2505: 3, 0x2506: 3, 0x2507: 3, 0x2508: 4, 0x2509: 4, 0x250a: 4, 0x250b: 4,
    0x254c: 2, 0x254d: 2, 0x254e: 2, 0x254f: 2 };

  function has(cp) {
    return (cp >= 0x2500 && cp <= 0x259f) || (cp >= 0x2800 && cp <= 0x28ff) || (cp >= 0xe0b0 && cp <= 0xe0bf) ||
      (cp >= 0x1fb00 && cp <= 0x1fb3b);
  }

  function rect(c, x, y, w, h) { if (w > 0 && h > 0) c.fillRect(x, y, w, h); }

  function box(c, cp, x, y, w, h) {
    var spec = BOX[cp - 0x2500];
    var lt = Math.max(1, Math.round(w / 8)), hv = lt * 2;
    var cx = x + Math.floor((w - lt) / 2), cy = y + Math.floor((h - lt) / 2); /* top-left of a light line */
    var mx = x + Math.floor(w / 2), my = y + Math.floor(h / 2);
    if (spec === 'a') { arc(c, cp, x, y, w, h, lt); return; }
    if (spec === 'x') { diag(c, cp, x, y, w, h, lt); return; }
    var U = +spec[0], D = +spec[1], L = +spec[2], R = +spec[3];
    var dash = DASH[cp];
    if (dash) { dashed(c, x, y, w, h, U || D ? 'v' : 'h', U === 2 || L === 2 || R === 2 ? hv : lt, dash); return; }
    var gap = lt; /* distance from the centre line to each line of a double pair */
    var anyDoubleV = U === 3 || D === 3, anyDoubleH = L === 3 || R === 3;
    function th(wt) { return wt === 2 ? hv : lt; }
    /* single and heavy arms */
    var vMax = Math.max(U === 3 ? 0 : U, D === 3 ? 0 : D), hMax = Math.max(L === 3 ? 0 : L, R === 3 ? 0 : R);
    function armH(dir, wt) {
      var t = th(wt), ty = my - Math.floor(t / 2);
      var stop; /* inner end of the arm */
      if (anyDoubleV) stop = dir < 0 ? mx - gap - Math.ceil(lt / 2) + lt : mx + gap + Math.ceil(lt / 2) - lt;
      else { var vt = th(vMax || 1); stop = dir < 0 ? mx + Math.ceil(vt / 2) : mx - Math.floor(vt / 2); }
      if (!U && !D) stop = dir < 0 ? mx + Math.ceil(t / 2) : mx - Math.floor(t / 2);
      if (dir < 0) rect(c, x, ty, stop - x, t); else rect(c, stop, ty, x + w - stop, t);
    }
    function armV(dir, wt) {
      var t = th(wt), tx = mx - Math.floor(t / 2);
      var stop;
      if (anyDoubleH) stop = dir < 0 ? my - gap - Math.ceil(lt / 2) + lt : my + gap + Math.ceil(lt / 2) - lt;
      else { var ht = th(hMax || 1); stop = dir < 0 ? my + Math.ceil(ht / 2) : my - Math.floor(ht / 2); }
      if (!L && !R) stop = dir < 0 ? my + Math.ceil(t / 2) : my - Math.floor(t / 2);
      if (dir < 0) rect(c, tx, y, t, stop - y); else rect(c, tx, stop, t, y + h - stop);
    }
    if (L && L !== 3) armH(-1, L);
    if (R && R !== 3) armH(1, R);
    if (U && U !== 3) armV(-1, U);
    if (D && D !== 3) armV(1, D);
    /* double arms: two lines; where each starts depends on the perpendicular arms (see SPEC.md glyph rules) */
    var o = gap + Math.floor(lt / 2); /* offset of each line's centre from the middle */
    function startFor(sideArm, otherArm) {
      /* returns the offset from the centre at which a double line on 'side' begins (negative = before centre) */
      if (sideArm === 3) return o;            /* inner corner meets the inner perpendicular line */
      if (sideArm) return 0;                  /* meets a single or heavy perpendicular line */
      if (otherArm === 3) return -o;          /* outer corner meets the outer perpendicular line */
      if (otherArm) return 0;
      return null;                            /* no perpendicular arm: run through the centre */
    }
    function dblH(dir) {
      [-1, 1].forEach(function (side) {
        var sideArm = side < 0 ? U : D, otherArm = side < 0 ? D : U;
        var s = startFor(sideArm, otherArm);
        var ly = my + side * o - Math.floor(lt / 2);
        var opp = dir < 0 ? R : L;
        var from;
        if (s === null) from = opp ? mx : (dir < 0 ? mx + Math.ceil(lt / 2) : mx - Math.floor(lt / 2));
        else from = dir < 0 ? mx + s + Math.ceil(lt / 2) - (s > 0 ? lt : 0) : mx - s - Math.floor(lt / 2) + (s > 0 ? lt : 0);
        if (s !== null && s < 0) from = dir < 0 ? mx - s + Math.ceil(lt / 2) : mx + s - Math.floor(lt / 2);
        if (dir < 0) rect(c, x, ly, from - x, lt); else rect(c, from, ly, x + w - from, lt);
      });
    }
    function dblV(dir) {
      [-1, 1].forEach(function (side) {
        var sideArm = side < 0 ? L : R, otherArm = side < 0 ? R : L;
        var s = startFor(sideArm, otherArm);
        var lx = mx + side * o - Math.floor(lt / 2);
        var opp = dir < 0 ? D : U;
        var from;
        if (s === null) from = opp ? my : (dir < 0 ? my + Math.ceil(lt / 2) : my - Math.floor(lt / 2));
        else from = dir < 0 ? my + s + Math.ceil(lt / 2) - (s > 0 ? lt : 0) : my - s - Math.floor(lt / 2) + (s > 0 ? lt : 0);
        if (s !== null && s < 0) from = dir < 0 ? my - s + Math.ceil(lt / 2) : my + s - Math.floor(lt / 2);
        if (dir < 0) rect(c, lx, y, lt, from - y); else rect(c, lx, from, lt, y + h - from);
      });
    }
    if (L === 3) dblH(-1);
    if (R === 3) dblH(1);
    if (U === 3) dblV(-1);
    if (D === 3) dblV(1);
  }

  function dashed(c, x, y, w, h, dir, t, n) {
    var mx = x + Math.floor(w / 2) - Math.floor(t / 2), my = y + Math.floor(h / 2) - Math.floor(t / 2);
    var len = dir === 'h' ? w : h, seg = len / n, on = Math.max(1, Math.round(seg * 0.6));
    for (var i = 0; i < n; i++) {
      var s = Math.round(i * seg + (seg - on) / 2);
      if (dir === 'h') rect(c, x + s, my, on, t); else rect(c, mx, y + s, t, on);
    }
  }

  function arc(c, cp, x, y, w, h, lt) {
    var mx = x + Math.floor(w / 2) + (lt % 2 ? 0.5 : 0), my = y + Math.floor(h / 2) + (lt % 2 ? 0.5 : 0);
    var r = Math.min(w, h) / 2;
    c.save();
    c.lineWidth = lt; c.strokeStyle = c.fillStyle; c.lineCap = 'butt';
    c.beginPath();
    if (cp === 0x256d) { c.moveTo(mx, y + h); c.lineTo(mx, my + r); c.arcTo(mx, my, mx + r, my, r); c.lineTo(x + w, my); }
    else if (cp === 0x256e) { c.moveTo(mx, y + h); c.lineTo(mx, my + r); c.arcTo(mx, my, mx - r, my, r); c.lineTo(x, my); }
    else if (cp === 0x256f) { c.moveTo(mx, y); c.lineTo(mx, my - r); c.arcTo(mx, my, mx - r, my, r); c.lineTo(x, my); }
    else { c.moveTo(mx, y); c.lineTo(mx, my - r); c.arcTo(mx, my, mx + r, my, r); c.lineTo(x + w, my); }
    c.stroke();
    c.restore();
  }
  function diag(c, cp, x, y, w, h, lt) {
    c.save(); c.lineWidth = lt; c.strokeStyle = c.fillStyle; c.beginPath();
    c.rect(x, y, w, h); c.clip(); c.beginPath();
    if (cp === 0x2571 || cp === 0x2573) { c.moveTo(x + w, y); c.lineTo(x, y + h); }
    if (cp === 0x2572 || cp === 0x2573) { c.moveTo(x, y); c.lineTo(x + w, y + h); }
    c.stroke(); c.restore();
  }

  function block(c, cp, x, y, w, h) {
    var i = cp - 0x2580;
    if (i === 0) return rect(c, x, y, w, Math.round(h / 2));
    if (i >= 1 && i <= 8) { var hh = Math.round(h * i / 8); return rect(c, x, y + h - hh, w, hh); }
    if (i >= 9 && i <= 15) { var ww = Math.round(w * (16 - i) / 8); return rect(c, x, y, ww, h); }
    if (i === 16) { var hw = Math.round(w / 2); return rect(c, x + hw, y, w - hw, h); }
    if (i >= 17 && i <= 19) {
      var a = c.globalAlpha; c.globalAlpha = a * (i === 17 ? 0.25 : i === 18 ? 0.5 : 0.75); rect(c, x, y, w, h); c.globalAlpha = a; return;
    }
    if (i === 20) return rect(c, x, y, w, Math.max(1, Math.round(h / 8)));
    if (i === 21) { var e = Math.max(1, Math.round(w / 8)); return rect(c, x + w - e, y, e, h); }
    /* quadrants 2596-259F: UL UR LL LR bits */
    var Q = { 22: 4, 23: 8, 24: 1, 25: 1 | 4 | 8, 26: 1 | 8, 27: 1 | 2 | 4, 28: 1 | 2 | 8, 29: 2, 30: 2 | 4, 31: 2 | 4 | 8 }[i];
    if (Q) quads(c, Q, x, y, w, h);
  }
  function quads(c, q, x, y, w, h) {
    var hw = Math.round(w / 2), hh = Math.round(h / 2);
    if (q & 1) rect(c, x, y, hw, hh);
    if (q & 2) rect(c, x + hw, y, w - hw, hh);
    if (q & 4) rect(c, x, y + hh, hw, h - hh);
    if (q & 8) rect(c, x + hw, y + hh, w - hw, h - hh);
  }
  function sextant(c, cp, x, y, w, h) {
    var mask = cp - 0x1fb00 + 1;
    if (mask >= 21) mask++;
    if (mask >= 42) mask++;
    var hw = Math.round(w / 2), r1 = Math.round(h / 3), r2 = Math.round(h * 2 / 3);
    var rows = [[y, r1], [y + r1, r2 - r1], [y + r2, h - r2]];
    for (var r = 0; r < 3; r++) {
      if (mask & (1 << (r * 2))) rect(c, x, rows[r][0], hw, rows[r][1]);
      if (mask & (1 << (r * 2 + 1))) rect(c, x + hw, rows[r][0], w - hw, rows[r][1]);
    }
  }
  function braille(c, cp, x, y, w, h) {
    var bits = cp - 0x2800;
    var dw = Math.max(1, Math.round(w / 4)), gx = w / 2, gy = h / 4;
    var pos = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [0, 3], [1, 3]];
    for (var i = 0; i < 8; i++) {
      if (!(bits & (1 << i))) continue;
      var px = x + Math.round(pos[i][0] * gx + (gx - dw) / 2), py = y + Math.round(pos[i][1] * gy + (gy - dw) / 2);
      rect(c, px, py, dw, dw);
    }
  }
  function powerline(c, cp, x, y, w, h) {
    var lt = Math.max(1, Math.round(w / 8));
    c.save();
    c.beginPath();
    switch (cp) {
      case 0xe0b0: c.moveTo(x, y); c.lineTo(x + w, y + h / 2); c.lineTo(x, y + h); c.closePath(); c.fill(); break;
      case 0xe0b2: c.moveTo(x + w, y); c.lineTo(x, y + h / 2); c.lineTo(x + w, y + h); c.closePath(); c.fill(); break;
      case 0xe0b1: c.lineWidth = lt; c.strokeStyle = c.fillStyle; c.moveTo(x, y); c.lineTo(x + w - lt / 2, y + h / 2); c.lineTo(x, y + h); c.stroke(); break;
      case 0xe0b3: c.lineWidth = lt; c.strokeStyle = c.fillStyle; c.moveTo(x + w, y); c.lineTo(x + lt / 2, y + h / 2); c.lineTo(x + w, y + h); c.stroke(); break;
      case 0xe0b4: c.moveTo(x, y); c.ellipse(x, y + h / 2, w, h / 2, 0, -Math.PI / 2, Math.PI / 2); c.closePath(); c.fill(); break;
      case 0xe0b6: c.moveTo(x + w, y); c.ellipse(x + w, y + h / 2, w, h / 2, 0, Math.PI / 2, Math.PI * 1.5); c.closePath(); c.fill(); break;
      case 0xe0b5: c.lineWidth = lt; c.strokeStyle = c.fillStyle; c.ellipse(x, y + h / 2, w - lt / 2, h / 2 - lt / 2, 0, -Math.PI / 2, Math.PI / 2); c.stroke(); break;
      case 0xe0b7: c.lineWidth = lt; c.strokeStyle = c.fillStyle; c.ellipse(x + w, y + h / 2, w - lt / 2, h / 2 - lt / 2, 0, Math.PI / 2, Math.PI * 1.5); c.stroke(); break;
      case 0xe0b8: c.moveTo(x, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill(); break;
      case 0xe0ba: c.moveTo(x + w, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill(); break;
      case 0xe0bc: c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x, y + h); c.closePath(); c.fill(); break;
      case 0xe0be: c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h); c.closePath(); c.fill(); break;
      case 0xe0b9: case 0xe0bf: c.lineWidth = lt; c.strokeStyle = c.fillStyle; c.moveTo(x, y); c.lineTo(x + w, y + h); c.stroke(); break;
      case 0xe0bb: case 0xe0bd: c.lineWidth = lt; c.strokeStyle = c.fillStyle; c.moveTo(x + w, y); c.lineTo(x, y + h); c.stroke(); break;
    }
    c.restore();
  }

  /* draw cp into the cell box (device px); the caller set fillStyle and clipped if needed */
  function draw(c, cp, x, y, w, h) {
    if (cp >= 0x2500 && cp <= 0x257f) return box(c, cp, x, y, w, h);
    if (cp >= 0x2580 && cp <= 0x259f) return block(c, cp, x, y, w, h);
    if (cp >= 0x2800 && cp <= 0x28ff) return braille(c, cp, x, y, w, h);
    if (cp >= 0xe0b0 && cp <= 0xe0bf) return powerline(c, cp, x, y, w, h);
    if (cp >= 0x1fb00 && cp <= 0x1fb3b) return sextant(c, cp, x, y, w, h);
  }
  /* glyphs that fill or join the cell edge are exempt from the minimum-contrast floor (VS Code rule) */
  function contrastExempt(cp) { return (cp >= 0x2580 && cp <= 0x259f) || (cp >= 0xe0b0 && cp <= 0xe0bf) || (cp >= 0x1fb00 && cp <= 0x1fb3b); }

  T.Glyphs = { has: has, draw: draw, contrastExempt: contrastExempt };
})();
