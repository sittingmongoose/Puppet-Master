/* neon-icons.js — the neon glyph family: one registry, one renderer, one status set.
 * OWNER: Neon icons, step 2 Foundation (2026-10-02). Surfaces wire this in; they never draw their own glyphs.
 *
 * LOAD ORDER (build.py): the FIRST entry of MODULES, so window.PM56_NEON exists before every module and before
 * app.js. app.js icon() delegates here; module-shell.js pmxGlyph()/pmxKindMark()/CHEVRON reach it lazily at their
 * first call (never at load: tests/shell-selfcheck.cjs and tests/b16 eval module-shell.js with no PM56_NEON).
 *
 * WHAT IT OWNS AND WHY
 * - One drawing per concept (plan §2). The app table (former app.js PATHS), the 14 names both tables drew, the
 *   bespoke drawings (threadops, attachments, chat-sound) and the new glyphs (plan, shield, bug, hourglass, clock,
 *   the status marks) live here. module-shell.js stays the drawing owner of PMX_GLYPHS (DR-044): it registers them
 *   at its first glyph call, and registerMany() never replaces a drawing this file defines. Where this file draws a
 *   PMX name (the kind marks, eye family, lock, ...), the geometry is PMX's, copied verbatim and only split into
 *   parts; if module-shell changes one of those drawings, mirror it here (see RECONCILED and the per-glyph notes).
 * - The neon anatomy (plan §1). Every glyph renders as
 *     1. the merged core halo, one <path class="nx-h"> whose single d holds every static part's geometry
 *        (rect/circle/ellipse/line converted), so halos never stack;
 *     2. the static tubes (.nx-c), each keeping its original element (check keeps d="m5 12 4 4L19 6", copy keeps
 *        <rect x="8" y="8" ...>: transcript-verify pins both);
 *     3. each moving part as <g class="nx-p nx-p<i>" style="--ax:..;--ay:..;--ar:..;--ao:..;--ad:.."> holding its
 *        own halo copy and its tube(s).
 *   The halo is the core band only: the neon tube's bloom. The soft tail of the glow is a radial backlight on the
 *   HTML host (status wrapper, activity bar item), because stepped stroke bands drew a glyph-shaped plate (G1).
 * - Acts. A part carries its displaced pose (--ax/--ay translate, --ar rotate, --ao opacity, --cr circle radius,
 *   all in user units / degrees), a stagger (--ad, ms) and, for draw-ons, a clip (--ac start inset, --ae end
 *   inset, user units on the view box). neon-icons.css moves the part by animating one registered number, --nx-t
 *   (0 = rest, 1 = pose), so loop keyframes are literal and the rest pose is the finished, lit pose.
 *   One-shot kind per part: arrive (default, pose -> rest), bounce (nx-pb: rest -> pose -> rest), reveal (nx-pc:
 *   clip from --ac to --ae). nx-pn parts sit out loops. The glyph's loop shape is its act (root class nx-a-<act>).
 * - The size gate (plan §1), by the size argument: below 12 no part moves (all parts render static); 12-14 a
 *   travel part needs >= 1.5 rendered px of travel and a reveal part (clip or opacity only) >= 1.5 px of length,
 *   otherwise it renders static; 15 and up everything moves. Context CSS corrects a context that renders an icon
 *   below its size argument by stopping .nx-p there.
 * - status(s,size,cls): the 13 status marks of plan §3 in a wrapper span (.nx-st .nx-st-<s>, data-k="st:<s>",
 *   aria-hidden) that carries the list rhythm; .nx-st-base is the static lit layer, .nx-st-move the moving part.
 *
 * OUTPUT CONTRACT: <svg class="nx nx-r-<role> nx-a-<act> [nx-z1|nx-z0] <cls>" data-nx="<canonical name>" width height
 * viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
 * stroke-linejoin="round" aria-hidden="true">. Deterministic for (name, size, cls): no ids, no <use>, no random or
 * counter values, so pmPatch's isEqualNode path holds. Roles: the default comes from the definition; a cls token
 * nx-r-status|concept|control|brand overrides it, and nx-self passes through (excluded from generic hover).
 * An unknown name draws `info` (today's behaviour) and is appended to PM56_NEON.misses silently: a console
 * warning would fail history-verify and transcript-verify.
 */
(function () {
  'use strict';
  if (window.PM56_NEON) return;
  try {

    /* ------------------------------------------------------------------ helpers */
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function fmt(n) { var v = Math.round(n * 1000) / 1000; return String(Object.is(v, -0) ? 0 : v); }
    function num(v, d) { var n = Number(v); return isFinite(n) && n > 0 ? n : d; }

    /* element constructors (24-unit grid). x: {c: extra class, dash: stroke-dasharray, f: filled} */
    function el(tag, attrs, x) { var o = { tag: tag, attrs: attrs }; if (x) { if (x.c) o.cls = x.c; if (x.dash) o.dash = x.dash; if (x.f) o.f = 1; } return o; }
    function P(d, x) { return el('path', { d: d }, x); }
    function C(cx, cy, r, x) { return el('circle', { cx: cx, cy: cy, r: r }, x); }
    function R(x0, y0, w, h, rx, x) { var a = { x: x0, y: y0, width: w, height: h }; if (rx) a.rx = rx; return el('rect', a, x); }
    function L(x1, y1, x2, y2, x) { return el('line', { x1: x1, y1: y1, x2: x2, y2: y2 }, x); }
    /* a moving part: one element or several that move together, plus its pose */
    function M(els, m) { return { els: Array.isArray(els) ? els : [els], m: m || {} }; }
    /* a glyph definition: parts (elements or moving parts), act (loop shape), role, origin (default pivot) */
    function G(parts, act, role, o) {
      var d = { parts: parts.map(function (p) { return p.els ? p : { els: [p], m: null }; }), act: act || 'none', role: role || 'concept' };
      if (o) { if (o.origin) d.origin = o.origin; if (o.fill) d.fill = 1; }
      return d;
    }

    /* A path's leading moveto is absolute even when written `m`, and the pairs after it are relative linetos.
       Concatenated after another path it would turn relative, so it is rewritten `M x y l ...`. */
    function absHead(d) {
      d = String(d);
      var h = /^\s*m/.exec(d); if (!h) return d;
      var rest = d.slice(h[0].length), xy = [], re = /^[\s,]*(-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?)/i, x;
      for (var i = 0; i < 2; i++) { x = re.exec(rest); if (!x) return d; xy.push(x[1]); rest = rest.slice(x[0].length); }
      return 'M' + xy[0] + ' ' + xy[1] + (/^[\s,]*[-+.\d]/.test(rest) ? 'l' : '') + rest;
    }
    /* shape -> path data, for the merged halo */
    function pathOf(e) {
      var a = e.attrs, n = function (k) { return Number(a[k]) || 0; };
      if (e.tag === 'path') return absHead(a.d);
      if (e.tag === 'line') return 'M' + fmt(n('x1')) + ' ' + fmt(n('y1')) + 'L' + fmt(n('x2')) + ' ' + fmt(n('y2'));
      if (e.tag === 'circle' || e.tag === 'ellipse') {
        var rx = e.tag === 'circle' ? n('r') : n('rx'), ry = e.tag === 'circle' ? n('r') : n('ry'), cx = n('cx'), cy = n('cy');
        return 'M' + fmt(cx - rx) + ' ' + fmt(cy) + 'a' + fmt(rx) + ' ' + fmt(ry) + ' 0 1 0 ' + fmt(2 * rx) + ' 0a' + fmt(rx) + ' ' + fmt(ry) + ' 0 1 0 ' + fmt(-2 * rx) + ' 0';
      }
      if (e.tag === 'rect') {
        var x = n('x'), y = n('y'), w = n('width'), h = n('height'), r = Math.min(n('rx') || n('ry'), w / 2, h / 2);
        if (!r) return 'M' + fmt(x) + ' ' + fmt(y) + 'h' + fmt(w) + 'v' + fmt(h) + 'h' + fmt(-w) + 'z';
        return 'M' + fmt(x + r) + ' ' + fmt(y) + 'h' + fmt(w - 2 * r) + 'a' + fmt(r) + ' ' + fmt(r) + ' 0 0 1 ' + fmt(r) + ' ' + fmt(r) +
          'v' + fmt(h - 2 * r) + 'a' + fmt(r) + ' ' + fmt(r) + ' 0 0 1 ' + fmt(-r) + ' ' + fmt(r) + 'h' + fmt(-(w - 2 * r)) +
          'a' + fmt(r) + ' ' + fmt(r) + ' 0 0 1 ' + fmt(-r) + ' ' + fmt(-r) + 'v' + fmt(-(h - 2 * r)) + 'a' + fmt(r) + ' ' + fmt(r) + ' 0 0 1 ' + fmt(r) + ' ' + fmt(-r) + 'z';
      }
      return '';
    }
    /* rough bounding box of an element in user units (gate maths only) */
    function boxOf(e) {
      var a = e.attrs, n = function (k) { return Number(a[k]) || 0; };
      if (e.tag === 'circle') return [n('cx') - n('r'), n('cy') - n('r'), n('cx') + n('r'), n('cy') + n('r')];
      if (e.tag === 'ellipse') return [n('cx') - n('rx'), n('cy') - n('ry'), n('cx') + n('rx'), n('cy') + n('ry')];
      if (e.tag === 'rect') return [n('x'), n('y'), n('x') + n('width'), n('y') + n('height')];
      if (e.tag === 'line') return [Math.min(n('x1'), n('x2')), Math.min(n('y1'), n('y2')), Math.max(n('x1'), n('x2')), Math.max(n('y1'), n('y2'))];
      /* path: walk the numbers pairwise (absolute and relative mixed); a generous box is enough for the gate */
      var d = String(a.d), cmds = d.match(/[a-zA-Z][^a-zA-Z]*/g) || [], cx = 0, cy = 0, sx = 0, sy = 0, b = [1e9, 1e9, -1e9, -1e9];
      var add = function (x, y) { if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; };
      cmds.forEach(function (c) {
        var k = c[0], v = (c.slice(1).match(/-?(?:\d*\.\d+|\d+)(?:e-?\d+)?/g) || []).map(Number), rel = k === k.toLowerCase(), K = k.toUpperCase(), i;
        if (K === 'Z') { cx = sx; cy = sy; return; }
        if (K === 'H') { for (i = 0; i < v.length; i++) { cx = rel ? cx + v[i] : v[i]; add(cx, cy); } return; }
        if (K === 'V') { for (i = 0; i < v.length; i++) { cy = rel ? cy + v[i] : v[i]; add(cx, cy); } return; }
        var step = K === 'A' ? 7 : K === 'C' ? 6 : (K === 'S' || K === 'Q') ? 4 : 2;
        for (i = 0; i + step <= v.length; i += step) {
          var ex = v[i + step - 2], ey = v[i + step - 1];
          if (K === 'C' || K === 'S' || K === 'Q') for (var j = 0; j < step - 2; j += 2) add(rel ? cx + v[i + j] : v[i + j], rel ? cy + v[i + j + 1] : v[i + j + 1]);
          cx = rel ? cx + ex : ex; cy = rel ? cy + ey : ey; add(cx, cy);
          if (K === 'M' && i === 0) { sx = cx; sy = cy; }
          if (K === 'A') { var r = Math.max(v[i], v[i + 1]); add(cx - r, cy - r); add(cx + r, cy + r); }
        }
      });
      return b[0] > b[2] ? [0, 0, 0, 0] : b;
    }

    /* parse a markup string (module-shell PMX_GLYPHS, or any register(name, '<path .../>') call) into elements */
    function parse(str) {
      var out = [], re = /<(path|circle|rect|ellipse|line)\b([^>]*?)\/?>/g, m;
      while ((m = re.exec(String(str)))) {
        var attrs = {}, x = {}, ar = /([\w:-]+)="([^"]*)"/g, a;
        while ((a = ar.exec(m[2]))) {
          if (a[1] === 'class') x.c = a[2];
          else if (a[1] === 'stroke-dasharray') x.dash = a[2];
          else attrs[a[1]] = a[2];
        }
        out.push(el(m[1], attrs, x));
      }
      return out;
    }

    /* ======================================================================
       THE GLYPHS. Part poses: ax/ay translate and cr circle radius (user units), ar rotate (deg, + = clockwise),
       ao opacity at the pose, ad stagger (ms), ac/ae clip insets on the view box (user units, top right bottom
       left), o pivot [x,y] or 'c' (fill-box centre), b bounce one-shot, n sits out loops.
       Acts (loop shapes, neon-icons.css nx-L-*): strike, seq, fill, wave, swap, spin, hop, drop, ratchet, blink.
       ====================================================================== */
    var BUBBLE = 'M4.5 5.5h15A1.5 1.5 0 0 1 21 7v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17h-1A1.5 1.5 0 0 1 3 15.5V7a1.5 1.5 0 0 1 1.5-1.5z';
    var EYE = 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z';
    var BACK_ARC = 'M3 12a9 9 0 1 0 3-6.7L3 8';
    var CREW = ['M3 5c5 0 8 3 12 7', 'M3 12h12', 'M3 19c5 0 8-3 12-7'];
    var X_IN = function (d1, d2, s) { return [M(P(d1), { ax: -3 * s, ao: .3 }), M(P(d2), { ax: 3 * s, ao: .3, ad: 70 })]; };

    var GLYPHS = {
      /* ---- the activity domains (the bar is the reference surface) ---- */
      /* the arrow strikes two units in: it stops at the outer ring and never hides inside the rings */
      goal: G([C(12, 12, 8), C(12, 12, 3), M(P('M20 4 15 9'), { ax: -2, ay: 2, b: 1 })], 'strike'),
      todo: G([P('M9 6h11M9 12h11M9 18h11'),
        /* the ticks pop up 2.6 units in turn and hold (loop); they draw in from 40 % (one-shot) */
        M(P('m3 6 1 1 2-2'), { ay: -2.6, ac: '0 22 0 2', ae: '0 16.6 0 2' }),
        M(P('M3 12l1 1 2-2'), { ay: -2.6, ac: '0 22 0 2', ae: '0 16.6 0 2', ad: 140 }),
        M(P('M3 18l1 1 2-2'), { ay: -2.6, ac: '0 22 0 2', ae: '0 16.6 0 2', ad: 280 })], 'fill'),
      users: G([M([P('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'), C(9, 7, 4)], { ay: -3, b: 1 }),
        M([P('M22 21v-2a4 4 0 0 0-3-3.87'), P('M16 3.13a4 4 0 0 1 0 7.75')], { ay: -3, b: 1, ad: 160 })], 'seq'),
      changes: G([M([P('M4 7h14'), P('m15 4 3 3-3 3')], { ax: 3, b: 1 }),
        M([P('M20 17H6'), P('m9 14-3 3 3 3')], { ax: -3, b: 1, ad: 60 })], 'swap'),
      page: G([P('M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'), P('M15 3v4h4'),
        /* the lines slide in from the left, .6 -> 1 (loop); they write in from 40 % (one-shot) */
        M(P('M8 12h8'), { ax: -2.6, ao: .6, ac: '0 17 0 7', ae: '0 7 0 7' }),
        M(P('M8 16h5'), { ax: -2.6, ao: .6, ac: '0 17 0 7', ae: '0 10 0 7', ad: 170 })], 'fill'),

      /* ---- kind marks: PMX geometry (module-shell.js PMX_GLYPHS), split into parts ---- */
      /* the strands stay; the node pops in along them */
      'kind-crew': G([P(CREW[0]), P(CREW[1]), P(CREW[2]), M(C(18.5, 12, 2.6), { ax: -2.6, ao: .6 })], 'seq'),
      /* crew + a cleaner bolt, clear of the node (redrawn here: the registry's drawing wins over module-shell's) */
      'kind-crew-auto': G([P(CREW[0]), P(CREW[1]), P(CREW[2]), C(18.5, 12, 2.6), M(P('M21.2 1l-2.4 3.6h3l-2.4 3.6'), { ay: 2, ao: .6, b: 1 })], 'seq'),
      /* the stem stays; the two branches spark outward in turn */
      'kind-brainstorm': G([P('M12 3v9'), P('M12 12v9'), M(P('M4 4c4 0 6 4 8 8'), { ax: 2, ay: 2, ao: .6, ac: '12 12 12 12', ad: 0 }),
        M(P('M20 4c-4 0-6 4-8 8'), { ax: -2, ay: 2, ao: .6, ac: '12 12 12 12', ad: 140 })], 'seq'),
      'kind-review': G([P('M5 3h9l4 4v6'), P('M5 3v17h6'), M([C(16, 16, 3.6), P('m18.6 18.6 2.6 2.6')], { ax: -5, ay: -5, b: 1 })], 'wave'),
      'kind-chat_room': G([C(12, 13, 5), M([C(12, 4.5, 1.9), C(4.5, 15, 1.3), C(19.5, 15, 1.3), C(12, 21, 1.3)], { ar: 90, o: [12, 13], b: 1 })], 'wave'),
      /* the outline stays; the pupil looks */
      eye: G([P(EYE), M(C(12, 12, 3), { ax: 3, b: 1 })], 'wave'),
      'kind-bsd-auto': G([P(EYE), P('M4 11.2h16'), M(P('M9 11.8a3 3 0 0 0 6 0'), { ax: 3, b: 1 })], 'wave'),
      'kind-bsd-off': G([P('M3 10.5c2.5 3.6 5.5 5.3 9 5.3s6.5-1.7 9-5.3'),
        M(P('m6.2 14.2-1.6 2.4'), { ao: .2, ad: 0, b: 1 }), M(P('M12 15.9v2.9'), { ao: .2, ad: 90, b: 1 }), M(P('M17.8 14.2l1.6 2.4'), { ao: .2, ad: 180, b: 1 })], 'seq'),
      /* the five clock faces differ at 14 px: clock (plain), history (back arc), schedule (a stopwatch crown),
         build-at (a clock on a stand), scheduled (a list with a clock badge) */
      'kind-schedule': G([C(12, 13.5, 7), P('M10 2.5h4M12 2.5v4'), M(P('M12 10v3.5l2.4 1.5'), { ar: -90, o: [12, 13.5] })], 'wave'),
      'kind-build-at': G([C(12, 9.5, 6), P('M5 20.5h14M8.5 16v4.5M15.5 16v4.5'), M(P('M12 6.8v2.7l1.8 1.2'), { ar: -90, o: [12, 9.5] })], 'wave'),
      'kind-scheduled': G([C(7.5, 7.5, 4.5), P('M14.5 5.5h6M14.5 9.5h6'), M(P('M7.5 5.6v1.9l1.3.8'), { ar: -90, o: [7.5, 7.5] }),
        M(P('M3.5 15h17'), { ao: .6, ac: '0 21 0 2.6', ae: '0 2.6 0 2.6', ad: 120 }), M(P('M3.5 19.5h11'), { ao: .6, ac: '0 21 0 2.6', ae: '0 8.6 0 2.6', ad: 220 })], 'wave'),
      'kind-memory': G([P('M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z'), P('M9.5 3.5v17'),
        M(P('M13 3.5v6.2l1.8-1.3 1.8 1.3V3.5'), { ay: -3, ao: .4 })], 'drop'),
      'kind-teach': G([R(4.5, 9, 15, 11.5, 2), P('M8.5 9V6.8a3.5 3.5 0 0 1 7 0V9'),
        M(P('M8 13.5h8'), { ao: .6, ac: '0 17 0 7', ae: '0 7 0 7' }), M(P('M8 16.8h5'), { ao: .6, ac: '0 17 0 7', ae: '0 10 0 7', ad: 150 })], 'fill'),
      'kind-revert': G([P('M9 4h6.5L19 7.5V20H9'), M([P('M13 12H7.5a3.5 3.5 0 0 0 0 7H9'), P('m10 9-3 3 3 3')], { ax: 3, ao: .5 })], 'strike'),
      'kind-eli5': G([P(BUBBLE), M(P('M8 11.2h6'), { ao: .55, ac: '0 17 0 7', ae: '0 9 0 7' })], 'seq'),
      'kind-defaults': G([P(BUBBLE), P('M9.2 11.2h5.6'), M(P('M12 8.4v5.6'), { ao: .55, ac: '11.2 0 12.8 0', ae: '7.4 0 9 0' })], 'seq'),

      /* ---- working steps (Orbit) ---- */
      sparkles: G([M(P('m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2Z'), { ao: .5, b: 1 }),
        M(P('m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z'), { ao: .5, b: 1, ad: 170 }),
        M(P('m5 14 .8 1.7L8 16.5l-2.2.8L5 19l-.8-1.7L2 16.5l2.2-.8Z'), { ao: .5, b: 1, ad: 340 })], 'seq'),
      /* brain, simplified for 14 px: two bumpy halves, a seam, one fold per lobe (the folds slide in) */
      brain: G([P('M12 5.5c-.8-1.6-3.6-2-4.8-.3-1.7-.2-3 1.4-2.6 3-1.6.6-2.3 2.6-1.3 4-.9 1.5-.1 3.6 1.7 3.8.6 1.5 2.4 2.3 4 1.7.9.8 2.2.8 3 .1'),
        P('M12 5.5c.8-1.6 3.6-2 4.8-.3 1.7-.2 3 1.4 2.6 3 1.6.6 2.3 2.6 1.3 4 .9 1.5.1 3.6-1.7 3.8-.6 1.5-2.4 2.3-4 1.7-.9.8-2.2.8-3 .1'), P('M12 5.5v12.3'),
        M(P('M6.6 11h3'), { ax: -2.6, ao: .6, ac: '0 18.3 0 5.7', ae: '0 13.5 0 5.7' }), M(P('M14.4 13h3'), { ax: 2.6, ao: .6, ac: '0 10.5 0 13.5', ae: '0 5.7 0 13.5', ad: 150 })], 'seq'),
      'folder-search': G([P('M3 5h6l2 2h10v12H3z'), M([C(12, 13, 3), P('m14.5 15.5 2 2')], { cr: 1.6 })], 'spin'),
      search: G([M([C(11, 11, 7), P('m20 20-4-4')], { ar: -14, o: [20, 20], b: 1 })], 'wave'),
      download: G([P('M5 20h14'), M([P('M12 4v11'), P('M7 10.5l5 5 5-5')], { ay: -4, ao: .45 })], 'drop'),
      upload: G([P('M4 21h16'), M([P('M12 20V8'), P('M7 13l5-5 5 5')], { ay: 3, ao: .45 })], 'drop'),
      globe: G([C(12, 12, 9), P('M3 12h18'), M([P('M12 3a15 15 0 0 1 0 18'), P('M12 3a15 15 0 0 0 0 18')], { ar: 28, o: [12, 12], b: 1 })], 'wave'),
      terminal: G([M(P('m4 7 5 5-5 5'), { ax: -2.6, ao: .6 }), M(P('M11 17h9'), { ax: 2.6, ao: .6, ad: 160, b: 1 })], 'seq'),
      'file-edit': G([P('M6 3h8l4 4v5'), P('M6 3v18h5'), M(P('m14 20 6-6 2 2-6 6h-2z'), { ax: -3, ay: 1, b: 1 })], 'wave'),
      'monitor-play': G([R(2, 3, 20, 14, 2), P('M8 21h8M12 17v4'), M(P('M10 7l5 3-5 3Z'), { ax: -2.6, ao: .6 })], 'fill'),
      flask: G([P('M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3'), P('M8 14h8'), M(C(13, 17.3, .9), { ay: 3, ao: .35 })], 'wave'),
      'check-circle': G([M(C(12, 12, 9), { ao: .5 }), M(P('m8 12 3 3 5-6'), { ao: .55, ac: '0 17 0 7', ae: '0 7 0 7', ad: 150 })], 'seq'),
      chart: G([P('M22 20H2'),
        M(P('M4 20V10'), { ay: 2.6, ao: .6, ac: '21 0 3 0', ae: '9 0 3 0' }), M(P('M10 20V4'), { ay: 2.6, ao: .6, ac: '21 0 3 0', ae: '3 0 3 0', ad: 120 }),
        M(P('M16 20v-7'), { ay: 2.6, ao: .6, ac: '21 0 3 0', ae: '12 0 3 0', ad: 240 })], 'seq'),
      plug: G([M([P('M9 7V2M15 7V2'), P('M6 7h12v4a6 6 0 0 1-12 0Z'), P('M12 17v5')], { ay: 3, b: 1 })], 'wave'),
      /* a magic wand, not a pencil: a thin straight rod (no nib) with a four-point star at its tip and sparkles
         set apart around it; the rod flicks 8 degrees about the handle end and the sparkles pop in turn */
      wand: G([M([P('M4 20 13.4 10.6'), P('M16 3.8l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z')], { ar: -8, o: [4, 20], b: 1 }),
        M(P('M21 1.5v3M19.5 3h3'), { ay: 2, ao: .6, ad: 120 }), M(P('M21.5 12v3M20 13.5h3'), { ay: 2, ao: .6, ad: 240 }), M(P('M9.5 2v3M8 3.5h3'), { ay: 2, ao: .6, ad: 360 })], 'seq'),
      history: G([P(BACK_ARC), P('M3 3v5h5'), M(P('M12 7v5l3 2'), { ar: 70, o: [12, 12] })], 'wave'),

      /* ---- controls (unlit at rest; act once on ignite) ---- */
      close: G(X_IN('m6 6 12 12', 'M18 6 6 18', 1), 'strike', 'control'),
      more: G([M(C(5, 12, 1), { ao: .15 }), M(C(12, 12, 1), { ao: .15, ad: 90 }), M(C(19, 12, 1), { ao: .15, ad: 180 })], 'seq', 'control'),
      'chevron-right': G([M(P('m9 6 6 6-6 6'), { ax: 3, b: 1 })], 'strike', 'control'),
      'chevron-left': G([M(P('m15 6-6 6 6 6'), { ax: -3, b: 1 })], 'strike', 'control'),
      'chevron-down': G([M(P('m6 9 6 6 6-6'), { ay: 3, b: 1 })], 'strike', 'control'),
      'chevron-up': G([M(P('m6 15 6-6 6 6'), { ay: -3, b: 1 })], 'strike', 'control'),
      copy: G([R(8, 8, 12, 12, 2), M(P('M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2'), { ax: -3, ay: -3, b: 1 })], 'swap', 'control'),
      send: G([M([P('m22 2-7 20-4-9-9-4Z'), P('M22 2 11 13')], { ax: 3, ay: -3, b: 1 })], 'strike', 'control'),
      attach: G([M(P('m21 11-8.5 8.5a6 6 0 0 1-8.5-8.5L13 2a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8L15 5.8'), { ar: -14, o: [12, 12], b: 1 })], 'wave', 'control'),
      plus: G([P('M5 12h14'), M(P('M12 5v14'), { ao: .5, ac: '12 0 12 0', ae: '4 0 4 0' })], 'seq', 'control'),
      minus: G([M(P('M5 12h14'), { ao: .5, ac: '0 12 0 12', ae: '0 4 0 4' })], 'seq', 'control'),
      refresh: G([M(P('M20 11a8 8 0 1 0-2 5.3M20 4v7h-7'), { ar: -360, o: [12, 12] })], 'spin', 'control'),
      reset: G([M([P(BACK_ARC), P('M3 3v5h5')], { ar: 360, o: [12, 12] })], 'spin', 'control'),
      settings: G([M([P('M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z'), P('M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1.03H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1.03-1.55V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9c.2.6.8 1 1.55 1H21v4h-.08c-.75 0-1.35.4-1.52 1Z')], { ar: -45, o: [12, 12] })], 'wave', 'control'),
      'eye-off': G([P('M10.6 5.6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.8 3.6M6.4 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3'), P('M9.9 9.9a3 3 0 0 0 4.2 4.2'),
        M(P('M3 3l18 18'), { ao: .5, ac: '3 21 21 3', ae: '2 2 2 2' })], 'seq', 'control'),
      clock: G([C(12, 12, 8.5), M(P('M12 7.5V12l3 2'), { ar: -90, o: [12, 12] })], 'wave'),
      pin: G([M([P('M12 17v5'), P('M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z')], { ay: -3 })], 'drop', 'control'),
      unpin: G([P('M12 17v5'), P('M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12'), P('M15 9.34V6h1a2 2 0 0 0 0-4H7.89'),
        M(P('M2 2l20 20'), { ao: .5, ac: '2 22 22 2', ae: '1 1 1 1' })], 'seq', 'control'),
      archive: G([P('M4.5 7v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7'), P('M9.5 11h5'), M(R(3, 3, 18, 4, 1.5), { ay: -3, b: 1 })], 'strike', 'control'),
      edit: G([M(P('M12 20h9'), { ao: .5, ac: '0 13 0 11', ae: '0 2 0 11' }), M(P('M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z'), { ar: -10, o: [4, 19], b: 1, ad: 60 })], 'wave', 'control'),
      trash: G([P('M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5'), M(P('M4.5 7h15M9.5 7V4.5h5V7'), { ar: -14, o: [4.5, 7], b: 1 })], 'strike', 'control'),
      filter: G([P('M4 4h16l-6 7v6l-4 2v-8Z'), M(P('M12 21.6h.01'), { ay: -3, ao: 0 })], 'drop', 'control'),
      lock: G([R(5, 11, 14, 9, 2), M(P('M8 11V8a4 4 0 0 1 8 0v3'), { ay: -3 })], 'drop'),
      play: G([M(P('M8 5.5v13l10.5-6.5z'), { ax: 2, b: 1 })], 'strike', 'control'),
      pause: G([M(P('M9 6v12'), { ay: -2, b: 1 }), M(P('M15 6v12'), { ay: -2, b: 1, ad: 80 })], 'seq', 'control'),
      step: G([M(P('m7 5 9 7-9 7z'), { ax: 2, b: 1 }), P('M18 5v14')], 'strike', 'control'),
      stop: G([M(R(7.5, 7.5, 9, 9, 1.75, { f: 1 }), { ay: 2, b: 1 })], 'strike', 'control'),
      speaker: G([P('M11 5 6 9H3v6h3l5 4z'), M(P('M15.5 8.5a5 5 0 0 1 0 7'), { ao: .2, b: 1 }), M(P('M18.5 5.5a9 9 0 0 1 0 13'), { ao: .2, b: 1, ad: 110 })], 'seq', 'control'),
      'speaker-off': G([P('M11 5 6 9H3v6h3l5 4z')].concat(X_IN('m16 9 5 6', 'M21 9l-5 6', .5)), 'strike', 'control'),
      'arrow-right': G([M([P('M4.5 12h15'), P('M13.5 6l6 6-6 6')], { ax: 3, b: 1 })], 'strike', 'control'),
      reply: G([M([P('M6 4.5V11a4 4 0 0 0 4 4h9.5'), P('m15.5 11 4 4-4 4')], { ax: 3, b: 1 })], 'strike', 'control'),
      open: G([P('M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'), M([P('M14 4h6v6'), P('M20 4l-8 8')], { ax: 3, ay: -3, b: 1 })], 'strike', 'control'),
      swap: G([M(P('M4 8h13l-3-3'), { ax: 3, b: 1 }), M(P('M20 16H7l3 3'), { ax: -3, b: 1, ad: 60 })], 'swap', 'control'),
      link: G([M(P('M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.2 1.2'), { ax: 3, ay: -3, ao: .5 }), M(P('M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.2-1.2'), { ax: -3, ay: 3, ao: .5 })], 'swap', 'control'),
      outbox: G([P('M3 14v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5'), P('M7 14h3l1 2h2l1-2h3'), M([P('M12 3v8'), P('M8.5 7.5 12 11l3.5-3.5')], { ay: -3, ao: .45 })], 'drop', 'control'),
      collapse: G([M(P('m8 3 4 4 4-4'), { ay: -3, b: 1 }), M(P('M8 21l4-4 4 4'), { ay: 3, b: 1 })], 'swap', 'control'),
      expand: G([M(P('M8 3H3v5'), { ax: -2, ay: -2, b: 1 }), M(P('M16 3h5v5'), { ax: 2, ay: -2, b: 1 }), M(P('M8 21H3v-5'), { ax: -2, ay: 2, b: 1 }), M(P('M16 21h5v-5'), { ax: 2, ay: 2, b: 1 })], 'swap', 'control'),
      sliders: G([P('M4 6h5M13 6h7M4 12h10M18 12h2M4 18h2M10 18h10'),
        M(P('M9 3v6'), { ax: 3, b: 1 }), M(P('M14 9v6'), { ax: -3, b: 1, ad: 80 }), M(P('M6 15v6'), { ax: 3, b: 1, ad: 160 })], 'swap', 'control'),

      /* ---- concepts and the rest of the app table ---- */
      user: G([M([C(12, 8, 4), P('M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6')], { ay: -3, b: 1 })], 'seq'),
      /* the shared bubble, opened at the tail so the tail can wag */
      chat: G([P('M10 17h9.5a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5h-15A1.5 1.5 0 0 0 3 7v8.5A1.5 1.5 0 0 0 4.5 17h1'),
        M(P('M5.5 17v3.5L10 17'), { ar: -18, o: [7.75, 17], b: 1 })], 'wave'),
      info: G([C(12, 12, 9), M(P('M12 11v5M12 8h.01'), { ao: .25, b: 1 })], 'seq'),
      check: G([M(P('m5 12 4 4L19 6'), { ao: .6, ac: '0 20 0 4', ae: '0 4 0 4' })], 'seq'),
      branch: G([P('M6 3v12a4 4 0 0 0 4 4h8'), C(6, 3, 2), C(18, 19, 2), P('M6 9h7a4 4 0 0 0 4-4V3'), M(C(17, 3, 2), { ao: .2, b: 1 })], 'seq', 'control'),
      lightning: G([M(P('M13 2 4 14h7l-1 8 10-13h-7Z'), { ay: 2.6, b: 1 })], 'strike'),
      star: G([M(P('m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17l-6.3 3.5L7 13.7 2 8.9 9 8Z'), { ar: 18, o: [12, 11.5], b: 1 })], 'wave'),
      image: G([R(3, 3, 18, 18, 2), P('m21 15-5-5L5 21'), M(C(8.5, 8.5, 1.5), { ao: .2, b: 1 })], 'seq'),
      code: G([M(P('m8 8-4 4 4 4'), { ax: -3, b: 1 }), M(P('M16 8l4 4-4 4'), { ax: 3, b: 1 }), P('M13.5 5.5l-3 13')], 'swap'),
      warning: G([P('M12 4.2 21 19.5H3z'), M(P('M12 10v4.2M12 17.1v.1'), { ao: .25, b: 1 })], 'seq'),
      /* the context lens: a ring and two lines (three read as a blob at 14 px); the lines draw in */
      lens: G([C(12, 12, 7), M(L(8.5, 10, 15.5, 10), { ao: .6, ac: '0 16.4 0 7.6', ae: '0 7.6 0 7.6' }), M(L(8.5, 14, 15.5, 14), { ao: .6, ac: '0 16.4 0 7.6', ae: '0 7.6 0 7.6', ad: 120 })], 'seq'),
      /* folder: the tab lifts */
      folder: G([P('M3 8v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8'), M(P('M11 6 9 4H5a2 2 0 0 0-2 2v2'), { ar: -12, o: [3, 8], b: 1 })], 'strike'),
      clipboard: G([R(6, 4, 12, 17, 2), P('M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1'),
        M(P('M9 11h6'), { ao: .5, ac: '0 16 0 8', ae: '0 8 0 8' }), M(P('M9 15h6'), { ao: .5, ac: '0 16 0 8', ae: '0 8 0 8', ad: 130 })], 'fill'),
      camera: G([P('M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z'), M(C(12, 14, 3.5), { ao: .3, b: 1 })], 'seq'),
      /* plan: a folded map (three panels), not a page; the folds draw down in turn (a route drawn across the
         panels read as clutter at 14 px, so the map stays bare) */
      plan: G([P('M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z'),
        M(P('M9 4v13.5'), { ao: .5, ac: '3 0 21 0', ae: '3 0 2 0' }), M(P('M15 6.5V20'), { ao: .5, ac: '3 0 21 0', ae: '3 0 2 0', ad: 130 })], 'seq'),
      shield: G([M(P('M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z'), { ay: -2.6, b: 1 })], 'strike'),
      /* bug, simplified for 14 px: body, four legs, antennae that twitch */
      bug: G([P('M8 10a4 4 0 0 1 8 0v4a4 4 0 0 1-8 0z'), P('M8 11.5H4.5M16 11.5h3.5M8.3 15.5 5 17.5M15.7 15.5l3.3 2'),
        M(P('M10 6.6 8.6 4.6M14 6.6l1.4-2'), { ay: 2, ao: .6, b: 1 })], 'seq'),
      hourglass: G([M([P('M6.5 3h11M6.5 21h11'), P('M8 3v2.5c0 2.4 4 4 4 6.5s-4 4.1-4 6.5V21M16 3v2.5c0 2.4-4 4-4 6.5s4 4.1 4 6.5V21')], { ar: 16, o: [12, 12], b: 1 })], 'wave'),
      calendar: G([R(4, 5.5, 16, 14.5, 2), P('M4 10h16'), M(P('M8.5 3.5v4M15.5 3.5v4'), { ay: -2, ao: .4, b: 1 })], 'seq'),
      table: G([R(3.5, 5, 17, 14, 2), P('M3.5 10h17'), M(P('M3.5 14.5h17'), { ao: .5, ac: '0 21 0 3', ae: '0 3 0 3' }), P('M10 10v9')], 'seq'),
      bookmark: G([M(P('M7 4h10v16l-5-4-5 4z'), { ay: -3 })], 'drop'),
      notebook: G([P('M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z'), P('M9.5 3.5v17'),
        M(P('M12.5 8h3.5'), { ao: .5, ac: '0 12 0 11.5', ae: '0 7 0 11.5' }), M(P('M12.5 11.5h3.5'), { ao: .5, ac: '0 12 0 11.5', ae: '0 7 0 11.5', ad: 130 })], 'fill'),
      /* open strokes (solid blobs read as two dots at 14 px); the marks nudge in turn */
      quote: G([M(P('M10 7c-2.5.6-4 2.6-4 5.5V17h4v-4.2H6.2'), { ax: -2, b: 1 }), M(P('M18 7c-2.5.6-4 2.6-4 5.5V17h4v-4.2h-3.8'), { ax: -2, b: 1, ad: 110 })], 'seq'),
      hand: G([M(P('M8 12.5V6.8a1.5 1.5 0 0 1 3 0V11M11 10.6V5.2a1.5 1.5 0 0 1 3 0v5.4M14 10.6V6.8a1.5 1.5 0 0 1 3 0V14c0 4-2.5 6.5-6 6.5-2.6 0-4.3-1.3-5.5-3.5L4 13.6a1.4 1.4 0 0 1 2.3-1.5L8 14.2'), { ar: -12, o: [11, 20], b: 1 })], 'wave'),
      'slash-circle': G([C(12, 12, 8.5), M(P('m6 6 12 12'), { ao: .5, ac: '6 18 18 6', ae: '5 5 5 5' })], 'seq'),
      ring: G([C(12, 12, 7)], 'none'),
      'ring-dashed': G([C(12, 12, 7, { dash: '2.5 3' })], 'none'),
      arc: G([C(12, 12, 7, { c: 'pmx-g-faint' }), M(P('M12 5a7 7 0 0 1 7 7', { c: 'pmx-g-accent' }), { ar: -90, o: [12, 12] })], 'spin'),
      'ring-dot': G([C(12, 12, 7), M(C(12, 12, 3, { c: 'pmx-g-dot' }), { ao: .3, b: 1 })], 'seq'),
      'pin-lock': G([M([P('M9 3.5h6l-.8 5 3 3.2H6.8l3-3.2z'), P('M12 11.7V20.5')], { ay: -3 })], 'drop'),
      sealed: G([R(3.5, 6, 17, 12, 2), M(P('m3.5 7.5 8.5 6 8.5-6'), { ay: -2.6, b: 1 })], 'strike'),
      'spark-off': G([P('M12 3v4M12 17v4M3 12h4M17 12h4'), M(P('m4.5 4.5 15 15'), { ao: .5, ac: '4.5 19.5 19.5 4.5', ae: '3.5 3.5 3.5 3.5' })], 'seq'),
      'play-ring': G([C(12, 12, 8.5), M(P('M10.3 8.8v6.4l5-3.2z'), { ao: .3, b: 1 })], 'seq'),

      /* ---- the status marks (plan §3); status() wraps them, icon('st-<s>') draws them bare ---- */
      /* working: a ring at .65 and a bright satellite (r2.4, its own halo) orbiting OUTSIDE it (radius 9.5), so it
         reads on the accent-tinted selected row and never looks like mixed's half disc */
      'st-working': G([C(12, 12, 7.5, { c: 'nx-dim' }), M(C(12, 2.5, 2.4, { f: 1 }), { ar: 360, o: [12, 12] })], 'spin', 'status'),
      /* reviewing: the lens sweeps half as far and rests (it must stay below needs-you) */
      'st-reviewing': G([P('M5 3h9l4 4v6'), P('M5 3v17h6'), M([C(16, 16, 3.6), P('m18.6 18.6 2.6 2.6')], { ax: -2.5, ay: -2.5, b: 1 })], 'calm', 'status'),
      'st-waiting': G([P('M5 3h14a2.5 2.5 0 0 1 2.5 2.5v10.5a2.5 2.5 0 0 1-2.5 2.5h-6.5L8 21.8v-3.3H5A2.5 2.5 0 0 1 2.5 16V5.5A2.5 2.5 0 0 1 5 3z'),
        M([P('M9.4 8.6a2.6 2.6 0 1 1 3.9 2.25c-.85.45-1.3 1.05-1.3 1.9v.1'), P('M12 15.6h.01')], { ay: -3.4 })], 'hop', 'status'),
      'st-waiting-dep': G([M([P('M6.5 3h11M6.5 21h11'), P('M8 3v2.5c0 2.4 4 4 4 6.5s-4 4.1-4 6.5V21M16 3v2.5c0 2.4-4 4-4 6.5s4 4.1 4 6.5V21')], { ar: 16, o: [12, 12], b: 1 })], 'tip', 'status'),
      'st-idle': G([C(12, 12, 4.5)], 'none', 'status'),
      'st-complete': G([M(P('m5 12.5 4.5 4.5L19 7.5'), { ac: '0 20 0 4', ae: '0 4 0 4' })], 'none', 'status'),
      'st-blocked': G([R(5, 11, 14, 9, 2), M(P('M8 11V8a4 4 0 0 1 8 0v3'), { ay: -3 })], 'none', 'status'),
      'st-failed': G([P('M12 4.2 21 19.5H3z'), P('M12 10v4.2M12 17.1v.1')], 'none', 'status'),
      'st-paused': G([P('M9 6.5v11M15 6.5v11')], 'none', 'status'),
      'st-recovering': G([M([P('M18.34 9.04A7 7 0 0 0 5.66 9.04'), P('M8.02 7.94 5.66 9.04 4.99 6.53'), P('M5.66 14.96A7 7 0 0 0 18.34 14.96'), P('M15.98 16.06 18.34 14.96 19.01 17.47')], { ar: -180, o: [12, 12] })], 'tick2', 'status'),
      /* pending: six long dashes (4 on, 3.85 off) that do not break into specks on light themes */
      'st-pending': G([C(12, 12, 7.5, { dash: '4 3.85' })], 'none', 'status'),
      'st-skipped': G([C(12, 12, 7.5), P('m6.7 6.7 10.6 10.6')], 'none', 'status'),
      /* mixed: a half-filled disc (left half filled, right half outline), nothing like a spinner */
      'st-mixed': G([P('M12 4.5a7.5 7.5 0 0 0 0 15z', { f: 1 }), P('M12 4.5a7.5 7.5 0 0 1 0 15')], 'none', 'status')
    };
    Object.keys(GLYPHS).forEach(function (k) { GLYPHS[k].own = 1; });

    /* ======================================================================
       RECONCILED: the 14 names app.js PATHS and module-shell PMX_GLYPHS both drew (INVENTORY §3), one drawing each.
         name          kept   why
         check         app    transcript-verify pins d="m5 12 4 4L19 6"
         check-circle  app    r9 ring + the larger tick reads at 12-14 px (Orbit step); PMX r8.5 tick was smaller
         code          pmx    the brackets carry the identity; PMX's are larger (8-16) with a shorter slash
         copy          app    front rect pinned (x8 y8); app back sheet rounds at r2 like the front
         download      pmx    tray at 20, arrow 4-15: room for the halo inside the view box
         edit          app    pen + underline: the underline is the stroke the act writes
         eye           pmx    the eye family (eye-off, eye-lid, eye-closed, the BSD kinds) is PMX geometry
         file-edit     pmx    open page + pen: cleaner silhouette than the app's full page with a pen inside
         lock          pmx    14x9 body: padlock proportion; the shackle is the moving part (blocked, teach)
         more          app    r1 dots read better at 12-13 px than r.9
         pause         pmx    6-18 bars balance the 5.5-18.5 play triangle
         play          pmx    optically centred (8-18.5)
         search        app    r7 lens meets its handle at the rim; PMX r6.5 left a gap
         user          pmx    the smooth shoulders match role-you and read at small sizes
       Other drawings chosen once: warning = PMX warn (margins); eye-off = PMX (the app eyeoff differs); page =
       one page with two text lines for document/file/artifact/passage (app artifact's fold ran past its edge);
       changes = the app arrows with shafts that reach their heads; chat/eli5/defaults share the PMX bubble;
       the back arc (reset/restore/rewind/undo) = the app arc; trash = PMX (threadops' copy retired);
       chevrons = PMX (the app's chevron/down/up/left were the same shapes); clock = PMX clock (app-wide).
       New: plan (a folded map), shield, bug, hourglass, speaker/speaker-off (chat-sound SPK at the
       family stroke), the 13 status marks. module-shell CHEVRON is chevron-down.
       ====================================================================== */
    var ALIAS = {
      document: 'page', file: 'page', artifact: 'page', passage: 'page',
      warn: 'warning', eyeoff: 'eye-off', chevron: 'chevron-right', down: 'chevron-down', up: 'chevron-up', left: 'chevron-left',
      restore: 'reset', rewind: 'reset', undo: 'reset', fork: 'branch', not: 'slash-circle',
      'kind-bsd': 'eye', 'kind-bsd-on': 'eye', 'eye-lid': 'kind-bsd-auto', 'eye-closed': 'kind-bsd-off', 'clock-bar': 'kind-build-at',
      done: 'check', complete: 'check', completed: 'check', tick: 'check',
      /* one drawing per concept: the plain ring and the ring with a dot */
      effort: 'ring', 'role-circle': 'ring', 'role-lead': 'ring-dot'
    };

    /* ======================================================================
       STATUS (plan §3): canonical status -> mark, tone and list motion, with every alias the surfaces use.
       ====================================================================== */
    var STATUS = {
      working: { glyph: 'st-working', tone: 'working', motion: 'satellite orbit outside the ring, 9 s, its core halo only', aliases: ['running', 'in_progress', 'doing', 'live', 'active', 'loading', 'starting'] },
      reviewing: { glyph: 'st-reviewing', tone: 'working', motion: 'lens sweeps 2.5 units and rests; no backlight', aliases: ['verifying', 'review'] },
      waiting: { glyph: 'st-waiting', tone: 'attention', motion: 'full steady halo, backlight breathes .6-1, "?" hops 3.4 units (two beats every 2.4 s)', aliases: ['needs', 'needs_you', 'needs-you', 'yourmove', 'input', 'decide'] },
      'waiting-dep': { glyph: 'st-waiting-dep', tone: 'attention', motion: 'tips once, holds 60 % of 3.6 s', aliases: ['waiting_dep', 'dependency', 'blocked_on', 'held'] },
      idle: { glyph: 'st-idle', tone: 'idle', motion: 'none', aliases: ['ready'] },
      complete: { glyph: 'st-complete', tone: 'done', motion: 'clip-draws once', aliases: ['done', 'completed', 'sent', 'verified', 'restored'] },
      blocked: { glyph: 'st-blocked', tone: 'blocked', motion: 'shackle drops, then ab-alert', aliases: ['stalled', 'locked'] },
      failed: { glyph: 'st-failed', tone: 'blocked', motion: 'irregular stutter', aliases: ['error', 'invalidated', 'refused'] },
      paused: { glyph: 'st-paused', tone: 'paused', motion: 'none', aliases: ['stopped', 'hold'] },
      recovering: { glyph: 'st-recovering', tone: 'attention', motion: 'counter-clockwise ratchet, one 90-degree tick every 2.4 s', aliases: ['retrying', 'replanned', 'backing-off', 'backing_off', 'fallback'] },
      pending: { glyph: 'st-pending', tone: 'idle', motion: 'none', aliases: ['queued', 'next', 'scheduled', 'unverified'] },
      skipped: { glyph: 'st-skipped', tone: 'paused', motion: 'none', aliases: ['cancelled', 'canceled', 'expired', 'stale'] },
      mixed: { glyph: 'st-mixed', tone: 'changed', motion: 'none', aliases: ['partial'] }
    };
    var STATUS_OF = Object.create(null);
    Object.keys(STATUS).forEach(function (s) { STATUS_OF[s] = s; STATUS[s].aliases.forEach(function (a) { STATUS_OF[a] = s; }); });

    var ROLES = ['status', 'concept', 'control', 'brand'];
    var TONES = ['blocked', 'attention', 'working', 'changed', 'done', 'idle', 'paused'];
    var misses = [];
    var cache = Object.create(null), cacheN = 0;

    function canon(name) { var n = String(name == null ? '' : name); return ALIAS[n] && GLYPHS[ALIAS[n]] ? ALIAS[n] : n; }
    function has(name) { return !!GLYPHS[canon(name)]; }
    function miss(name) { var n = String(name); if (misses.indexOf(n) < 0) misses.push(n); }

    /* normalise a registered definition: a markup string (all parts static) or an object in the shape G() builds */
    function normal(def) {
      if (typeof def === 'string') return G(parse(def), 'none', 'concept');
      if (!def || !def.parts) return null;
      var d = G(def.parts.map(function (p) {
        if (p && p.els) return M(p.els.map(function (e) { return typeof e === 'string' ? parse(e)[0] : e; }).filter(Boolean), p.m || p.move || {});
        if (p && p.tag) return p.move ? M(p, p) : p;
        return null;
      }).filter(Boolean), def.act, def.role, def);
      return d;
    }
    function register(name, def) {
      var d = normal(def); if (!name || !d) return false;
      GLYPHS[String(name)] = d; cache = Object.create(null); cacheN = 0;
      if (d.parts.some(function (p) { return p.m; })) addActs(actsCss(String(name), d));
      return true;
    }
    /* registerMany(map): module-shell hands PMX_GLYPHS over at its first glyph call. A drawing this file owns
       (reconciled, or split into parts for an act) is never replaced; {force:true} replaces it anyway. */
    function registerMany(map, opts) {
      var n = 0, force = !!(opts && opts.force);
      Object.keys(map || {}).forEach(function (k) {
        if (!force && (GLYPHS[k] && GLYPHS[k].own || (ALIAS[k] && GLYPHS[ALIAS[k]]))) return;
        if (register(k, map[k])) n++;
      });
      return n;
    }

    /* ---------------------------------------------------------------- render */
    function attrs(e) {
      var s = '', a = e.attrs;
      Object.keys(a).forEach(function (k) { s += ' ' + k + '="' + esc(a[k]) + '"'; });
      if (e.dash) s += ' stroke-dasharray="' + esc(e.dash) + '"';
      return s;
    }
    function tube(e, filled) {
      var c = 'nx-c' + (e.f || filled ? ' nx-f' : '') + (e.cls ? ' ' + e.cls : '');
      return '<' + e.tag + ' class="' + c + '"' + attrs(e) + '/>';
    }
    /* One halo layer for a list of elements: merged into one d, except an element carrying a transform attribute
       (role-orbit's ellipse), which keeps its own halo element so its geometry stays exact. */
    function halo(els, cls) {
      var ds = [], solo = '';
      els.forEach(function (e) {
        if (e.attrs.transform) solo += '<' + e.tag + ' class="' + cls + '"' + attrs({ attrs: e.attrs }) + '/>';
        else ds.push(pathOf(e));
      });
      return (ds.length ? '<path class="' + cls + '" d="' + esc(ds.join('')) + '"/>' : '') + solo;
    }
    /* the size gate for one moving part at `size` px (plan §1) */
    function moves(p, size, origin) {
      if (size < 12) return false;
      if (size >= 15) return true;
      var m = p.m, k = size / 24, b = [1e9, 1e9, -1e9, -1e9];
      p.els.forEach(function (e) { var q = boxOf(e); b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])]; });
      var travel = Math.max(Math.abs(m.ax || 0), Math.abs(m.ay || 0), 2 * Math.abs(m.cr || 0));
      if (m.ar) {
        var o = Array.isArray(m.o) ? m.o : origin || [12, 12], far = 0;
        [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].forEach(function (c) { far = Math.max(far, Math.hypot(c[0] - o[0], c[1] - o[1])); });
        travel = Math.max(travel, far * Math.min(Math.PI, Math.abs(m.ar) * Math.PI / 180));
      }
      if (travel * k >= 1.5) return true;
      /* a reveal act (clip, or opacity only) needs the part itself, as painted (stroke included), to be at least
         1.5 px long */
      var reveal = m.ac || (m.ao != null && m.ao < 1 && !travel);
      return !!reveal && (Math.max(b[2] - b[0], b[3] - b[1]) + 1.8) * k >= 1.5;
    }
    /* ---------------------------------------------------------------- acts: literal keyframes per part
       Every moving part gets literal keyframes, generated here once from its pose (no var() inside any keyframe,
       so nothing var()-dependent is ever left attached): <name>-<j>L its loop (the glyph's act shape, opacity
       floored at .6) and one one-shot, <name>-<j>A arrive (pose -> rest), B bounce (rest -> pose -> rest) or
       C reveal (clip from --ac to --ae on the view box, both endpoints stated). They animate transform and opacity
       only, which Chromium composites even on an SVG child (a registered custom property would not be). The part
       names its own keyframes in its style (--kl, --k1); neon-icons.css and the contexts supply the timing. */
    var SHAPES = {
      strike: [[0, 0], [14, 1], [40, 0], [100, 0]], seq: [[0, 0], [16, 1], [34, 0], [100, 0]],
      fill: [[0, 0], [10, 1], [30, 1], [44, 0], [100, 0]], wave: [[0, 0], [50, 1], [100, 0]],
      swap: [[0, 0], [25, 1], [50, 1], [75, 0], [100, 0]], spin: [[0, 0], [100, 1]],
      hop: [[0, 0], [8, 1], [16, 0], [24, 1], [32, 0], [100, 0]], drop: [[0, 0], [40, 1], [52, 0], [100, 0]],
      ratchet: [[0, 0], [10, .25], [25, .25], [35, .5], [50, .5], [60, .75], [75, .75], [85, 1], [100, 1]],
      blink: [[0, 0], [40, 0], [50, 1], [90, 1], [100, 0]],
      /* G1 priority shapes: a held rest (reviewing), one tip then a 60 % hold (waiting-dep), two quick 90-degree
         ticks per 4.8 s cycle of a 180-degree-symmetric drawing (recovering: a ratchet clicks, it does not glide) */
      calm: [[0, 0], [22, 1], [38, 1], [60, 0], [100, 0]], tip: [[0, 0], [20, 1], [40, 0], [100, 0]],
      tick2: [[0, 0], [2, .5], [50, .5], [52, 1], [100, 1]]
    };
    function kfName(name, j, k) { return 'nx-' + String(name).replace(/[^\w-]/g, '_') + '-' + j + k; }
    function poseCss(m, t, floor) {
      var x = (m.ax || 0) * t, y = (m.ay || 0) * t, r = (m.ar || 0) * t;
      if (m.cr) { x += m.cr * (Math.cos(t * 2 * Math.PI) - 1); y += m.cr * Math.sin(t * 2 * Math.PI); }
      /* only the channels the part uses, the same function list in every frame (so it interpolates and composites) */
      var fn = [];
      if (m.ax || m.ay || m.cr) fn.push('translate(' + fmt(x) + 'px,' + fmt(y) + 'px)');
      if (m.ar) fn.push('rotate(' + fmt(r) + 'deg)');
      var out = fn.length ? ['transform:' + fn.join(' ')] : [];
      if (m.ao != null && m.ao < 1) out.push('opacity:' + fmt(1 - (1 - Math.max(m.ao, floor)) * t));
      return out.join(';');
    }
    /* a circling part needs its path sampled (8 stops per segment, linear between them) */
    function stops(m, list) {
      if (!m.cr) return list;
      var out = [];
      for (var i = 0; i < list.length - 1; i++) for (var q = 0; q < 8; q++) out.push([list[i][0] + (list[i + 1][0] - list[i][0]) * q / 8, list[i][1] + (list[i + 1][1] - list[i][1]) * q / 8]);
      out.push(list[list.length - 1]);
      return out;
    }
    function frames(list, m, floor) {
      var lin = m.cr ? ';animation-timing-function:linear' : '';
      return list.map(function (st) { return fmt(st[0]) + '%{' + poseCss(m, st[1], floor) + lin + '}'; }).join('');
    }
    function insets(v) { return String(v || '0').split(/\s+/).map(function (x) { return fmt(+x) + 'px'; }).join(' '); }
    function startInset(ac, ae) {
      var a = String(ac).split(/\s+/).map(Number), e = String(ae || '0').split(/\s+/).map(Number);
      while (e.length < 4) e.push(e[e.length > 1 ? e.length - 2 : 0] || 0);
      return a.map(function (v, i) { return fmt(e[i] + (v - e[i]) * .6) + 'px'; }).join(' ');
    }
    function actsCss(name, d) {
      /* one-shots never dim a glyph (G1): the opacity floor is .85; loops keep .6 */
      var css = '', j = 0, shape = SHAPES[d.act], f1 = .85;
      d.parts.forEach(function (p) {
        if (!p.m) return;
        var m = p.m;
        if (shape && !m.n) css += '@keyframes ' + kfName(name, j, 'L') + '{' + frames(stops(m, shape), m, .6) + '}';
        /* a draw-on starts at least 40 % drawn (G1: a clip from nothing blanks the glyph) */
        if (m.ac) css += '@keyframes ' + kfName(name, j, 'C') + '{from{clip-path:inset(' + startInset(m.ac, m.ae) + ') view-box}to{clip-path:inset(' + insets(m.ae) + ') view-box}}';
        else if (m.b) css += '@keyframes ' + kfName(name, j, 'B') + '{' + frames(stops(m, [[0, 0], [42, 1], [100, 0]]), m, f1) + '}';
        else css += '@keyframes ' + kfName(name, j, 'A') + '{' + frames(stops(m, [[0, 1], [100, 0]]), m, f1) + '}';
        j++;
      });
      return css;
    }
    var actSheet = null;
    function addActs(css) {
      if (!css) return;
      try {
        if (!actSheet) { actSheet = document.createElement('style'); actSheet.id = 'nx-acts'; (document.head || document.documentElement).appendChild(actSheet); }
        actSheet.textContent += css;
      } catch (e) { }
    }
    function partStyle(name, j, m, origin) {
      var s = [];
      ['ax', 'ay', 'ar', 'ao', 'ad', 'cr'].forEach(function (k) { if (m[k] != null && m[k] !== 0) s.push('--' + k + ':' + fmt(m[k])); });
      var o = Array.isArray(m.o) ? m.o : (m.o === 'c' ? null : origin);
      if (o && (m.ar || m.cr)) s.push('--o:' + fmt(o[0]) + 'px ' + fmt(o[1]) + 'px');
      s.push('--k1:' + kfName(name, j, m.ac ? 'C' : m.b ? 'B' : 'A'));
      if (!m.n) s.push('--kl:' + kfName(name, j, 'L'));
      return s.join(';');
    }
    /* The glyphs the activity bar lights through its tone: their moving parts always carry their own halo copy, so
       the glow moves with the tube in the bar's loops. Status marks do the same; any glyph can ask with nx-lit. */
    var LIT = { goal: 1, todo: 1, users: 1, changes: 1, page: 1, 'kind-crew': 1, 'kind-brainstorm': 1, 'kind-review': 1, 'kind-chat_room': 1 };
    function travels(m) { return !!(m.ax || m.ay || m.ar || m.cr); }
    function render(name, size, cls, statusWrap) {
      var key = name + '|' + size + '|' + cls + '|' + (statusWrap ? 1 : 0);
      if (cache[key]) return cache[key];
      var n = canon(name), d = GLYPHS[n];
      if (!d) { miss(name); n = 'info'; d = GLYPHS.info; }
      var toks = String(cls || '').split(/\s+/).filter(Boolean), role = d.role, litTok = false;
      toks = toks.filter(function (t) { var m = /^nx-r-(status|concept|control|brand)$/.exec(t); if (m) { role = m[1]; return false; } if (t === 'nx-lit') litTok = true; return true; });
      var lit = role === 'status' || !!LIT[n] || litTok;
      /* Halo layout: one core band (.nx-h), the neon itself, hugging the tube. The soft tail is NOT drawn in the svg
         (stepped stroke bands read as a glyph-shaped plate): it is a radial backlight on the HTML host (the status
         wrapper, the activity bar item; neon-icons.css and activity-bar.css). The core of the static parts is one
         merged path. A moving part carries its own core copy, so the glow moves with its tube, where the halo is the
         point: lit glyphs (status, the bar's domains, nx-lit), parts that draw in by clip (the clip must hide the glow
         with the stroke) and concept parts that travel. A control's other parts (its halo shows on hover only) and a
         concept part that only fades keep their core in the merged path, and a one-element part is then the bare tube
         itself: one element instead of three (`more` alone appears dozens of times in a thread list). */
      var stat = [], core = [], tubes = '', moving = '', i = 0, live = [];
      var j = 0;
      d.parts.forEach(function (p) {
        var jj = p.m ? j++ : -1;
        if (!p.m || !moves(p, size, d.origin)) { p.els.forEach(function (e) { stat.push(e); core.push(e); tubes += tube(e, d.fill); }); return; }
        live.push({ p: p, j: jj });
      });
      var whole = !stat.length && live.length === 1;
      live.forEach(function (it) {
        var p = it.p, m = p.m, st = partStyle(n, it.j, m, d.origin);
        var pcls = 'nx-p nx-p' + i + (m.n ? ' nx-pn' : '') + (m.o === 'c' ? ' nx-pf' : '') + (statusWrap ? ' nx-st-move' : '');
        if (!whole && !m.ac && (role === 'control' || (!lit && !travels(m)))) {
          core = core.concat(p.els);
          if (p.els.length === 1) {
            var e1 = p.els[0], c1 = 'nx-c ' + pcls + (e1.f || d.fill ? ' nx-f' : '') + (e1.cls ? ' ' + e1.cls : '');
            moving += '<' + e1.tag + ' class="' + c1 + '"' + attrs(e1) + ' style="' + st + '"/>';
          } else moving += '<g class="' + pcls + '" style="' + st + '">' + p.els.map(function (e) { return tube(e, d.fill); }).join('') + '</g>';
        } else {
          moving += '<g class="' + pcls + '" style="' + st + '">' + halo(p.els, 'nx-h') + p.els.map(function (e) { return tube(e, d.fill); }).join('') + '</g>';
        }
        i++;
      });
      var base = (core.length ? halo(core, 'nx-h') : '') + tubes;
      if (statusWrap) base = '<g class="nx-st-base">' + base + '</g>';
      var z = size < 12 ? ' nx-z0' : size < 15 ? ' nx-z1' : '';
      var tone = statusWrap ? ' nx-t-' + statusWrap.tone : '';
      var c = 'nx nx-r-' + role + ' nx-a-' + d.act + z + tone + (toks.length ? ' ' + toks.join(' ') : '');
      /* --nx-u0 (user units per screen px at this size) sizes the halo copies inside moving parts, which cannot use
         non-scaling-stroke: Chromium will not composite a transform over non-scaling strokes. A context that renders
         the icon at another size sets --nx-u in its CSS, which wins over this default (the bar: 24/14). */
      var u = live.length ? ' style="--nx-u0:' + fmt(24 / size) + '"' : '';
      var out = '<svg class="' + esc(c) + '" data-nx="' + esc(n) + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + u + '>' + base + moving + '</svg>';
      if (cacheN > 4000) { cache = Object.create(null); cacheN = 0; }
      cache[key] = out; cacheN++;
      return out;
    }

    function icon(name, size, cls) { return render(String(name == null ? '' : name), num(size, 15), cls == null ? '' : String(cls), null); }
    /* status(s, size, cls): the status mark in its rhythm wrapper. data-k keys it inside its keyed host, so a status
       change remounts it and replays the one-shot (complete's draw, blocked's shackle drop). */
    function status(s, size, cls) {
      var k = STATUS_OF[String(s == null ? '' : s)];
      if (!k) { miss('status:' + s); k = 'idle'; }
      var S = STATUS[k];
      return '<span class="nx-st nx-st-' + k + ' nx-tn-' + S.tone + (cls ? ' ' + esc(cls) : '') + '" data-k="st:' + k + '" aria-hidden="true">' + render(S.glyph, num(size, 15), '', S) + '</span>';
    }
    function list() {
      var back = Object.create(null);
      Object.keys(ALIAS).forEach(function (a) { (back[ALIAS[a]] = back[ALIAS[a]] || []).push(a); });
      return Object.keys(GLYPHS).sort().map(function (k) {
        var d = GLYPHS[k];
        return { name: k, role: d.role, act: d.act, moving: d.parts.filter(function (p) { return p.m; }).length, aliases: back[k] || [], own: !!d.own, status: /^st-/.test(k) };
      });
    }

    addActs(Object.keys(GLYPHS).map(function (k) { return actsCss(k, GLYPHS[k]); }).join(''));

    window.PM56_NEON = {
      version: 1,
      icon: icon,
      status: status,
      has: has,
      register: register,
      registerMany: registerMany,
      alias: canon,
      misses: misses,
      ROLES: ROLES,
      TONES: TONES,
      STATUS: STATUS,
      list: list
    };
  } catch (err) {
    /* never take the page down: app.js and module-shell.js keep their own fallbacks when PM56_NEON is missing */
    try { window.PM56_NEON_ERROR = String(err && err.message || err); } catch (e) { }
  }
})();
