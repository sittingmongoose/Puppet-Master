/* O55.art — scene system. One composition per scene (props, positions, beats) is rendered by four family prop
   libraries into inline SVG. Every placed prop is an outer anchor group (position; CSS transform so beat changes glide)
   around an inner animated group (entrance/ambient keyframes). CSS keyframes never touch the anchor, so positioned
   props never snap to the origin (lesson from TestOpus 2026-09-04). Portable to Slint: vector shapes, transforms,
   opacity and clipping only; no Canvas/WebGL/filters. */
(function () {
  'use strict';
  const O55 = window.O55;
  const U = O55.util;
  /* Portrait canvas: the art pane sits beside the content on wide windows. Keep key content inside x 60..420 (the
     pane crops the sides slightly); narrow windows show each scene's landscape `band` instead. */
  const A = O55.art = { families: {}, scenes: {}, W: 480, H: 600 };

  /* Read live theme tokens so light/dark re-light the same drawings from the app's real palette. They depend only on
     the look that owns the element (html, a look tile's own data-theme, or an element that previews NieR Mode with
     data-o55-nier-preview="dark|light"), on NieR Mode (painted over Basic on html, with its parts) and on the root's
     inline variables, so they are read once per look: a getComputedStyle here forced a style pass of the whole page on
     every scene render. tok.nier: the tokens are NieR's (root-owned while NieR Mode is painted, or a NieR preview);
     tok.nierPreview: 'dark' | 'light' for a preview owner, else null; tok.nierParts: the installed parts' keys, or
     null when not known (a preview while NieR Mode is off: draw as if every part were installed). */
  const tokCache = new Map();
  const PREVIEW = /^(dark|light)$/;
  const ownerOf = (el) => (el.closest && el.closest('[data-theme], [data-o55-nier-preview]')) || document.documentElement;
  function keyOf(owner) {
    const root = document.documentElement;
    const pv = owner !== root ? owner.getAttribute('data-o55-nier-preview') : null, preview = PREVIEW.test(pv || '') ? pv : null;
    const nier = root.hasAttribute('data-o55-nier') ? 'nier:' + (root.getAttribute('data-o55-nier-parts') || '') + '|' : '';
    return (owner === root ? 'r|' : 'o|') + nier + (preview ? 'pv:' + preview + ':' + (owner.getAttribute('data-o55-nier-parts') || '') + '|' : '')
      + owner.getAttribute('data-theme') + '|' + (root.getAttribute('style') || '');
  }
  function entryOf(owner, el) {
    const root = document.documentElement;
    const pv = owner !== root ? owner.getAttribute('data-o55-nier-preview') : null, preview = PREVIEW.test(pv || '') ? pv : null;
    const partsAttr = (owner !== root && owner.getAttribute('data-o55-nier-parts')) || (root.hasAttribute('data-o55-nier') ? root.getAttribute('data-o55-nier-parts') || '' : null);
    const t = readTokens(el);
    t.nier = (root.hasAttribute('data-o55-nier') && owner === root) || !!preview;
    t.nierPreview = preview; t.root = owner === root;
    t.nierParts = t.nier && partsAttr != null ? partsAttr.split(/\s+/).filter(Boolean) : null;
    return t;
  }
  /* A miss inside the window or the tour reads every other look on that surface in the same pass (the look screen's
     tiles, its swatches, a NieR preview): the look screen's tiles each asked in turn, after the one before had mounted
     its scene, and each miss styled and laid out the screen again (12, 29 and 45 ms of style and 34 ms of layout on the
     VM). Two probes stand in for a NieR preview of the current look (data-o55-nier-preview, with and without its basic
     data-theme: the preview scope of design/hero-spec.md 2.2), whose attributes its host writes only after the tiles
     have mounted; they are made before the first read and removed after the last, so the pass is still one. */
  const probe = (scope, theme, preview) => {
    const p = document.createElement('i'); p.hidden = true; p.setAttribute('aria-hidden', 'true');
    if (theme) p.setAttribute('data-theme', theme);
    if (preview) p.setAttribute('data-o55-nier-preview', preview);
    scope.appendChild(p); return p;
  };
  const previewProbes = (scope, m) => [probe(scope, 'basic-' + m, m), probe(scope, null, m)];
  function surfaceOf(owner) {
    const scope = owner.closest && owner.closest('#pm-o55-onboarding, #pm-o55-tour'); if (!scope) return null;
    const list = [];
    scope.querySelectorAll('[data-theme], [data-o55-nier-preview]').forEach((o) => { if (o !== owner && list.length < 24) list.push(o); });
    const probes = previewProbes(scope, O55.theme().mode);
    return { list: list.concat(probes), probes };
  }
  /* The looks a surface will ask for are also read ahead, once per light or dark, NieR state and root variables, after
     the window or the tour first mounts a scene: each family's look tile in the current light or dark and a NieR
     preview of it. The probes are made in an idle moment and read in the next frame's read phase (O55.nierFx.measure),
     where the frame has already styled them, and removed with that phase's writes; the look screen then finds every
     look it draws cached, where its first read styled and laid out the whole new screen inside its build (20 ms of
     style and 53 ms of layout on the VM: the page's size containers make a forced style pass lay out as well). */
  const warmed = new Set();
  function warm(scope) {
    const root = document.documentElement, m = O55.theme().mode, FX = O55.nierFx;
    if (!scope || !(FX && FX.measure)) return;
    const sig = m + '|' + (root.getAttribute('data-o55-nier') || '') + ':' + (root.getAttribute('data-o55-nier-parts') || '') + '|' + (root.getAttribute('style') || '');
    if (warmed.has(sig)) return;
    warmed.add(sig);
    const idle = window.requestIdleCallback ? (f) => window.requestIdleCallback(f, { timeout: 3000 }) : (f) => O55.motion.after(600, f);
    idle(() => {
      if (!scope.isConnected || O55.theme().mode !== m) { warmed.delete(sig); return; }
      const probes = ['basic', 'friendly', 'glass', 'retro'].map((f) => probe(scope, f + '-' + m, null)).concat(previewProbes(scope, m));
      FX.measure(() => {
        if (tokCache.size > 40) tokCache.clear();
        for (const p of probes) { const k = keyOf(p); if (p.isConnected && !tokCache.has(k)) tokCache.set(k, entryOf(p, p)); }
        return () => probes.forEach((p) => p.remove());
      });
    });
  }
  A.tokens = function tokens(el) {
    const root = document.documentElement; el = el || root;
    const owner = ownerOf(el), key = keyOf(owner);
    const hit = tokCache.get(key); if (hit) return Object.assign({}, hit);
    if (tokCache.size > 40) tokCache.clear();
    const surface = owner !== root ? surfaceOf(owner) : null;
    const t = entryOf(owner, el);
    tokCache.set(key, t);
    if (surface) {
      for (const o of surface.list) { const k = keyOf(o); if (!tokCache.has(k)) tokCache.set(k, entryOf(o, o)); }
      surface.probes.forEach((p) => p.remove());
    }
    return Object.assign({}, t);
  };
  function readTokens(el) {
    const cs = getComputedStyle(el);
    const get = (n, fb) => (cs.getPropertyValue(n) || '').trim() || fb;
    return {
      bg: get('--background', '#121212'), surface: get('--surface', '#1e1e1e'), text: get('--text-primary', '#e8e8e8'),
      text2: get('--text-secondary', '#aaa'), muted: get('--text-muted', '#888'), border: get('--border', '#333'),
      blue: get('--accent-blue', '#64b5f6'), magenta: get('--accent-magenta', '#ff69b4'), lime: get('--accent-lime', '#3dd68c'),
      orange: get('--accent-orange', '#ffa347'), warn: get('--accent-warning', '#f5c542'), error: get('--accent-error', '#ef5350'),
      primary: get('--accent-primary', get('--accent-blue', '#64b5f6')),
      /* raised: a raised face (a NieR prop's body); onInk: text and detail drawn on an ink block (NieR Mode's own token,
         the ground elsewhere). Read for every look, used by the 'nier' art family only. */
      raised: get('--surface-elevated', get('--surface', '#1e1e1e')), onInk: get('--o55-nier-on-ink', get('--background', '#121212'))
    };
  }

  /* Colour helpers (tokens are hex in every theme; anything else passes through). */
  A.hex = function hex(c) {
    c = String(c || '').trim();
    if (/^#[0-9a-f]{3}$/i.test(c)) c = '#' + c.slice(1).split('').map((x) => x + x).join('');
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
  };
  A.rgba = function rgba(c, a) { const h = A.hex(c); return h ? `rgba(${h[0]},${h[1]},${h[2]},${a})` : c; };
  A.mix = function mix(c1, c2, t) {
    const a = A.hex(c1), b = A.hex(c2); if (!a || !b) return c1;
    const v = a.map((x, i) => Math.round(x + (b[i] - x) * t));
    return '#' + v.map((x) => x.toString(16).padStart(2, '0')).join('');
  };
  A.defineFamily = function defineFamily(name, def) { A.families[name] = def; };
  /* Semantic tones: scenes ask for tone 0..3; each family maps them onto its own accents. */
  A.tone = function tone(ctx, i) { const t = ctx.pal.tones || [ctx.pal.ink || '#888']; return t[((i || 0) % t.length + t.length) % t.length]; };
  A.defineScene = function defineScene(id, def) { A.scenes[id] = def; };

  /* Retro draws whole pixels: a prop keeps its size in whole steps (1x, 2x), never a fraction and never rotated */
  A.scaleOf = (ctx, item) => (ctx.family === 'retro' ? item.sr || Math.max(1, Math.round(item.s || 1)) : item.s || 1);

  /* A prop's drawn outline, measured once per family, look and variant from the drawing itself (text, glows and
     shadows left out), so a string or a connector can end exactly on it: A.box(ctx, prop, opts) -> [x0, y0, x1, y1]
     in the prop's own units, before its scale. It is worked out from the drawing's markup (A.outline below), with no
     element made and nothing read from the page: a getBBox() here, in the middle of building a new screen, forced the
     style and layout of that whole screen (10-35 ms on the VM) once for every prop not measured before. Markup the
     arithmetic does not cover is still measured in the document, the old way. */
  const boxes = new Map();
  A.box = function box(ctx, prop, opts) {
    const k = ctx.family + '|' + ctx.mode + '|' + prop + '|' + JSON.stringify(opts || {});
    if (boxes.has(k)) return boxes.get(k);
    const fam = A.families[ctx.family] || A.families.basic, draw = fam.props[prop] || (A.common[prop] && ((c, o) => A.common[prop](c, o, fam)));
    let r = [-20, -20, 20, 20];
    if (draw) {
      const markup = `<g>${draw(ctx, { x: 0, y: 0, s: 1, opts: opts || {}, key: 'geo' })}</g>`;
      const b = A.outline(markup);
      if (b !== undefined) { if (b && (b[2] - b[0] || b[3] - b[1])) r = b; }
      else if (document.body) r = measured(markup) || r;
    }
    boxes.set(k, r); return r;
  };
  /* the document's own measure, for markup A.outline gives up on */
  function measured(markup) {
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('style', 'position:fixed;left:-9999px;top:0;width:10px;height:10px;visibility:hidden;pointer-events:none');
    svg.innerHTML = markup;
    svg.querySelectorAll('text, .o55-hook, [fill*="glow"], [class*="shade"], .o55-shadow').forEach((t) => t.remove());
    document.body.appendChild(svg);
    let r = null;
    try { const b = svg.firstElementChild.getBBox(); if (b.width || b.height) r = [b.x, b.y, b.x + b.width, b.y + b.height]; } catch (_) {}
    svg.remove();
    return r;
  }

  /* A.outline(markup) -> [x0, y0, x1, y1] | null | undefined: the geometry box of the markup's first element, read as
     the browser's getBBox() reads it (Blink, measured against it on every prop of every family, look and beat), with
     what A.box leaves out removed first: text, hook points, glows ([fill*="glow"]), shades ([class*="shade"]) and
     .o55-shadow. null: nothing drawn; undefined: markup it does not cover (a <use>, an image, a length in %, a
     transform or a geometry property in a style), which the caller measures in the document instead.
     - a group is the union of its children's boxes, each mapped through that child's transform (its box's corners,
       then their bounds); an empty shape (a rect or circle of size 0, a path with no segments) adds nothing; elements
       shown nowhere (display none, defs, gradients, patterns, clip paths, masks, styles) add nothing;
     - a path's box is its tight box (its points and the extrema of its curves, as Skia's computeTightBounds), its arcs
       built as Skia builds them (arcInto);
     - the result is rounded to single precision, as getBBox() returns it.
     Slint draws the same shapes from the same numbers, so it needs no measuring at all. */
  A.outline = (function () {
    const f32 = Math.fround;
    const TAG = /<(\/?)([A-Za-z][\w:-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>|<!--|<!\[CDATA\[|<\?/g;
    const ATTR = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
    const HIDDEN = /^(defs|clipPath|mask|pattern|linearGradient|radialGradient|marker|symbol|filter|style|title|desc|metadata|stop|script|text)$/;
    const GROUP = /^(g|a|switch)$/;
    const SHAPE = /^(rect|circle|ellipse|line|polyline|polygon|path)$/;
    const NUMRE = /^\s*[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?\s*$/;
    const STYLE_GEO = /(?:^|;)\s*(?:transform|x|y|cx|cy|r|rx|ry|width|height|d)\s*:/i;
    class Unsupported extends Error {}
    const no = () => { throw new Unsupported(); };
    const num = (v, d) => { if (v == null || v === '') return d; if (!NUMRE.test(v)) no(); return f32(+v); };
    const nums = (s) => (String(s || '').match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g) || []).map((x) => f32(+x));
    function parse(markup) {
      const root = { tag: '#root', a: {}, kids: [] }, stack = [root];
      let m; TAG.lastIndex = 0;
      while ((m = TAG.exec(markup))) {
        if (!m[2]) no(); /* a comment, CDATA or a processing instruction */
        const top = stack[stack.length - 1];
        if (m[1]) { if (top.tag !== m[2]) no(); stack.pop(); continue; }
        const a = {}; let am; ATTR.lastIndex = 0;
        while ((am = ATTR.exec(m[3] || ''))) a[am[1]] = am[2] != null ? am[2] : am[3] != null ? am[3] : '';
        const node = { tag: m[2], a, kids: [] };
        top.kids.push(node);
        if (!m[4]) stack.push(node);
      }
      if (stack.length !== 1) no();
      return root.kids[0] || null;
    }
    const cls = (n) => ' ' + (n.a.class || '') + ' ';
    /* left out by A.box, or drawn nowhere */
    function skipped(n) {
      if (HIDDEN.test(n.tag)) return true;
      const c = cls(n);
      if (c.indexOf(' o55-hook ') >= 0 || c.indexOf(' o55-shadow ') >= 0 || (n.a.class || '').indexOf('shade') >= 0) return true;
      if ((n.a.fill || '').indexOf('glow') >= 0) return true;
      if ((n.a.display || '').trim() === 'none') return true;
      const st = n.a.style || '';
      if (st) { if (/(?:^|;)\s*display\s*:\s*none\s*(?:;|$)/i.test(st)) return true; if (STYLE_GEO.test(st)) no(); }
      return false;
    }
    /* 2x3 matrices [a, b, c, d, e, f] */
    const mul = (p, q) => [p[0] * q[0] + p[2] * q[1], p[1] * q[0] + p[3] * q[1], p[0] * q[2] + p[2] * q[3], p[1] * q[2] + p[3] * q[3], p[0] * q[4] + p[2] * q[5] + p[4], p[1] * q[4] + p[3] * q[5] + p[5]];
    const deg = (x) => (x * Math.PI) / 180;
    function transformOf(n) {
      const t = n.a.transform; let M = [1, 0, 0, 1, 0, 0];
      if (t && t.trim()) {
        const re = /\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)\s*,?/gy; let m, at = 0;
        while ((m = re.exec(t))) {
          const v = nums(m[2]); at = re.lastIndex;
          let T;
          if (m[1] === 'matrix') { if (v.length !== 6) no(); T = v; }
          else if (m[1] === 'translate') T = [1, 0, 0, 1, v[0] || 0, v[1] || 0];
          else if (m[1] === 'scale') T = [v[0] == null ? 1 : v[0], 0, 0, v[1] == null ? (v[0] == null ? 1 : v[0]) : v[1], 0, 0];
          else if (m[1] === 'rotate') {
            const r = deg(v[0] || 0), c = Math.cos(r), s = Math.sin(r), R = [c, s, -s, c, 0, 0];
            T = v.length >= 3 ? mul(mul([1, 0, 0, 1, v[1], v[2]], R), [1, 0, 0, 1, -v[1], -v[2]]) : R;
          } else if (m[1] === 'skewX') T = [1, 0, Math.tan(deg(v[0] || 0)), 1, 0, 0];
          else T = [1, Math.tan(deg(v[0] || 0)), 0, 1, 0, 0];
          M = mul(M, T);
        }
        if (at !== t.length && t.slice(at).trim()) no();
      }
      if (n.tag === 'svg') {
        /* a nested viewport: its place, then its viewBox fitted into its size (xMidYMid meet unless it says otherwise) */
        M = mul(M, [1, 0, 0, 1, num(n.a.x, 0), num(n.a.y, 0)]);
        if (n.a.viewBox) {
          const vb = nums(n.a.viewBox), w = num(n.a.width, null), h = num(n.a.height, null);
          if (vb.length !== 4 || w == null || h == null || !(vb[2] > 0 && vb[3] > 0)) no();
          const par = (n.a.preserveAspectRatio || 'xMidYMid meet').trim().split(/\s+/);
          let sx = w / vb[2], sy = h / vb[3], tx = -vb[0] * sx, ty = -vb[1] * sy;
          if (par[0] !== 'none') {
            const s = par[1] === 'slice' ? Math.max(sx, sy) : Math.min(sx, sy), al = par[0];
            sx = sy = s; tx = -vb[0] * s; ty = -vb[1] * s;
            const ax = /xMid/.test(al) ? 0.5 : /xMax/.test(al) ? 1 : 0, ay = /YMid/.test(al) ? 0.5 : /YMax/.test(al) ? 1 : 0;
            tx += (w - vb[2] * s) * ax; ty += (h - vb[3] * s) * ay;
          }
          M = mul(M, [sx, 0, 0, sy, tx, ty]);
        }
      }
      return M;
    }
    function mapBox(M, b) {
      if (M[0] === 1 && M[1] === 0 && M[2] === 0 && M[3] === 1) return [b[0] + M[4], b[1] + M[5], b[2] + M[4], b[3] + M[5]];
      const xs = [], ys = [];
      [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]].forEach(([x, y]) => { xs.push(f32(M[0] * x + M[2] * y + M[4])); ys.push(f32(M[1] * x + M[3] * y + M[5])); });
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    }
    const unite = (u, b) => (!b ? u : !u ? b.slice() : [Math.min(u[0], b[0]), Math.min(u[1], b[1]), Math.max(u[2], b[2]), Math.max(u[3], b[3])]);
    function boxOf(n) {
      if (GROUP.test(n.tag) || n.tag === 'svg') {
        let u = null;
        for (const k of n.kids) { if (skipped(k)) continue; const b = boxOf(k); if (b) u = unite(u, mapBox(transformOf(k), b)); }
        return u;
      }
      if (!SHAPE.test(n.tag)) no();
      const a = n.a;
      if (n.tag === 'rect') {
        const x = num(a.x, 0), y = num(a.y, 0), w = num(a.width, 0), h = num(a.height, 0);
        return w > 0 && h > 0 ? [x, y, f32(x + w), f32(y + h)] : null;
      }
      if (n.tag === 'circle') { const cx = num(a.cx, 0), cy = num(a.cy, 0), r = num(a.r, 0); return r > 0 ? [f32(cx - r), f32(cy - r), f32(cx + r), f32(cy + r)] : null; }
      if (n.tag === 'ellipse') {
        let rx = num(a.rx, null), ry = num(a.ry, null); if (rx == null) rx = ry; if (ry == null) ry = rx;
        const cx = num(a.cx, 0), cy = num(a.cy, 0);
        return rx > 0 && ry > 0 ? [f32(cx - rx), f32(cy - ry), f32(cx + rx), f32(cy + ry)] : null;
      }
      if (n.tag === 'line') { const x1 = num(a.x1, 0), y1 = num(a.y1, 0), x2 = num(a.x2, 0), y2 = num(a.y2, 0); return [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)]; }
      if (n.tag === 'polyline' || n.tag === 'polygon') {
        const p = nums(a.points); if (p.length < 2) return null;
        let b = null; for (let i = 0; i + 1 < p.length; i += 2) b = unite(b, [p[i], p[i + 1], p[i], p[i + 1]]);
        return b;
      }
      return pathBox(a.d || '');
    }
    /* a cubic's or a quadratic's tight extent: its ends and the points where it turns */
    function cubicInto(b, p0, p1, p2, p3) {
      const pts = [p3];
      for (let k = 0; k < 2; k++) {
        const a = -p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k], bb = 2 * (p0[k] - 2 * p1[k] + p2[k]), c = p1[k] - p0[k];
        const ts = [];
        if (Math.abs(a) < 1e-12) { if (Math.abs(bb) > 1e-12) ts.push(-c / bb); }
        else { const disc = bb * bb - 4 * a * c; if (disc >= 0) { const q = Math.sqrt(disc); ts.push((-bb + q) / (2 * a), (-bb - q) / (2 * a)); } }
        for (const t of ts) if (t > 0 && t < 1) { const u = 1 - t; pts.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); }
      }
      return pts.reduce((acc, p) => unite(acc, [p[0], p[1], p[0], p[1]]), b);
    }
    function quadInto(b, p0, p1, p2) {
      const pts = [p2];
      for (let k = 0; k < 2; k++) { const den = p0[k] - 2 * p1[k] + p2[k]; if (Math.abs(den) > 1e-12) { const t = (p0[k] - p1[k]) / den; if (t > 0 && t < 1) { const u = 1 - t; pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]); } } }
      return pts.reduce((acc, p) => unite(acc, [p[0], p[1], p[0], p[1]]), b);
    }
    /* an SVG arc's tight extent: the arc built as Skia's SkPath::arcTo builds it for Blink (its centre, angles and
       conic segments of at most a third of a turn, in single precision: with radii scaled up to just fit, that float
       arithmetic moves the centre by about a hundredth of a unit, which getBBox() shows), then each conic's end and
       extrema as computeTightBounds finds them; false: drawn as a line (a zero radius, or no sweep) */
    function arcInto(state, cur, rx, ry, angle, large, sweep, to) {
      if (!rx || !ry || (to[0] === cur[0] && to[1] === cur[1])) return false;
      const snap = (v) => (Math.abs(v) <= 1 / 4096 ? 0 : v);
      const rotM = (dg) => { const r = f32(dg * f32(Math.PI / 180)), sn = snap(f32(Math.sin(r))), cs = snap(f32(Math.cos(r))); return [cs, -sn, 0, sn, cs, 0]; };
      const cat = (A, B) => [f32(A[0] * B[0] + A[1] * B[3]), f32(A[0] * B[1] + A[1] * B[4]), f32(A[0] * B[2] + A[1] * B[5] + A[2]),
        f32(A[3] * B[0] + A[4] * B[3]), f32(A[3] * B[1] + A[4] * B[4]), f32(A[3] * B[2] + A[4] * B[5] + A[5])];
      const map = (M, p) => [f32(f32(f32(M[0] * p[0]) + f32(M[1] * p[1])) + M[2]), f32(f32(f32(M[3] * p[0]) + f32(M[4] * p[1])) + M[5])];
      rx = f32(Math.abs(rx)); ry = f32(Math.abs(ry));
      const mid = [f32(f32(cur[0] - to[0]) * 0.5), f32(f32(cur[1] - to[1]) * 0.5)], tm = map(rotM(-angle), mid);
      const scale = f32(f32(f32(tm[0] * tm[0]) / f32(rx * rx)) + f32(f32(tm[1] * tm[1]) / f32(ry * ry)));
      if (scale > 1) { const k = f32(Math.sqrt(scale)); rx = f32(rx * k); ry = f32(ry * k); }
      let M = cat([f32(1 / rx), 0, 0, 0, f32(1 / ry), 0], rotM(-angle));
      const u0 = map(M, cur), u1 = map(M, to);
      let dx = f32(u1[0] - u0[0]), dy = f32(u1[1] - u0[1]);
      const dd = f32(f32(dx * dx) + f32(dy * dy));
      let sf = f32(Math.sqrt(Math.max(f32(f32(1 / dd) - 0.25), 0)));
      if (!sweep !== !!large) sf = -sf;
      dx = f32(dx * sf); dy = f32(dy * sf);
      const c = [f32(f32(f32(u0[0] + u1[0]) * 0.5) - dy), f32(f32(f32(u0[1] + u1[1]) * 0.5) + dx)];
      const th1 = f32(Math.atan2(f32(u0[1] - c[1]), f32(u0[0] - c[0]))), th2 = f32(Math.atan2(f32(u1[1] - c[1]), f32(u1[0] - c[0])));
      let arc = f32(th2 - th1);
      const PI = f32(Math.PI);
      if (arc < 0 && sweep) arc = f32(arc + f32(PI * 2)); else if (arc > 0 && !sweep) arc = f32(arc - f32(PI * 2));
      if (Math.abs(arc) < f32(PI / 1e6)) return false;
      M = cat(rotM(angle), [rx, 0, 0, 0, ry, 0]);
      const segs = Math.ceil(Math.abs(f32(arc / f32(f32(2 * PI) / 3)))), width = f32(arc / segs);
      const t = f32(Math.tan(f32(0.5 * width))); if (!isFinite(t)) return true;
      const w = f32(Math.sqrt(f32(0.5 + f32(f32(Math.cos(width)) * 0.5))));
      const whole = (v) => v === Math.floor(v);
      const ints = Math.abs(f32(f32(PI / 2) - Math.abs(width))) <= 1 / 4096 && whole(rx) && whole(ry) && whole(to[0]) && whole(to[1]);
      let from = cur, th = th1, b = state.b;
      for (let i = 0; i < segs; i++) {
        const e = f32(th + width), se = snap(f32(Math.sin(e))), ce = snap(f32(Math.cos(e)));
        const q1 = [f32(ce + c[0]), f32(se + c[1])], q0 = [f32(q1[0] + f32(t * se)), f32(q1[1] - f32(t * ce))];
        let m0 = map(M, q0), m1 = map(M, q1);
        if (ints) { m0 = m0.map(Math.round); m1 = m1.map(Math.round); }
        if (i === segs - 1) m1 = to.slice(); /* setLastPt: the arc ends exactly where it was asked to */
        b = conicInto(b, from, m0, m1, w);
        from = m1; th = e;
      }
      state.b = b;
      return true;
    }
    /* a conic's end and extrema, in single precision as Skia's conic_find_extrema, SkFindUnitQuadRoots and
       SkConic::evalAt compute them, so the box is getBBox()'s to the last bit */
    function unitDivide(nu, de, out) {
      if (nu < 0) { nu = -nu; de = -de; }
      if (de === 0 || nu === 0 || nu >= de) return;
      const r = f32(nu / de); if (r > 0 && r === r) out.push(r);
    }
    function unitRoots(A, B, C) {
      const out = [];
      if (A === 0) { unitDivide(-C, B, out); return out; }
      const dr = B * B - 4 * A * C; if (dr < 0) return out;
      const R = f32(Math.sqrt(dr)); if (!isFinite(R)) return out;
      const Q = B < 0 ? f32(-f32(B - R) / 2) : f32(-f32(B + R) / 2);
      unitDivide(Q, A, out); unitDivide(C, Q, out);
      if (out.length === 2) { if (out[0] > out[1]) out.reverse(); else if (out[0] === out[1]) out.pop(); }
      return out;
    }
    function conicInto(b, p0, p1, p2, w) {
      const pts = [p2], ts = [];
      for (let k = 0; k < 2; k++) {
        const P20 = f32(p2[k] - p0[k]), P10 = f32(p1[k] - p0[k]);
        ts.push(...unitRoots(f32(f32(w * P20) - P20), f32(P20 - f32(f32(2 * w) * P10)), f32(w * P10)));
      }
      for (const t of ts) {
        const ev = (k) => {
          const pw = f32(p1[k] * w), A = f32(f32(p2[k] - f32(2 * pw)) + p0[k]), B = f32(2 * f32(pw - p0[k])), C = p0[k];
          const dB = f32(2 * f32(w - 1)), dA = f32(0 - dB);
          return f32(f32(f32(f32(A * t) + B) * t) + C) / f32(f32(f32(f32(dA * t) + dB) * t) + 1);
        };
        pts.push([f32(ev(0)), f32(ev(1))]);
      }
      return pts.reduce((acc, p) => unite(acc, [p[0], p[1], p[0], p[1]]), b);
    }
    function pathBox(d) {
      const tok = String(d).match(/[MmLlHhVvCcSsQqTtAaZz]|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g);
      if (!tok || !tok.length) return null;
      if (String(d).replace(/[MmLlHhVvCcSsQqTtAaZz]|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|[\s,]/g, '').length) no();
      const st = { b: null };
      let i = 0, cmd = null, cur = [0, 0], start = [0, 0], lastC = null, lastQ = null, any = false;
      const pt = (p) => { st.b = unite(st.b, [p[0], p[1], p[0], p[1]]); };
      const isNum = (k) => k < tok.length && !/^[A-Za-z]$/.test(tok[k]);
      const n = () => { if (!isNum(i)) no(); return f32(+tok[i++]); };
      /* an arc's flags may be packed with the next number ("a5 5 0 016 0"); this tokenizer reads "016" as one number */
      const flag = () => { if (!isNum(i)) no(); const v = tok[i]; if (v === '0' || v === '1') { i++; return +v; } no(); };
      while (i < tok.length) {
        if (/^[A-Za-z]$/.test(tok[i])) cmd = tok[i++];
        else if (!cmd) no();
        const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), o = rel ? cur : [0, 0];
        if (C === 'Z') { cur = start.slice(); lastC = lastQ = null; if (isNum(i)) no(); cmd = null; continue; }
        if (C === 'M') { cur = [f32(o[0] + n()), f32(o[1] + n())]; start = cur.slice(); pt(cur); any = true; cmd = rel ? 'l' : 'L'; lastC = lastQ = null; continue; }
        if (C === 'L') { cur = [f32(o[0] + n()), f32(o[1] + n())]; pt(cur); }
        else if (C === 'H') { cur = [f32(o[0] + n()), cur[1]]; pt(cur); }
        else if (C === 'V') { cur = [cur[0], f32((rel ? cur[1] : 0) + n())]; pt(cur); }
        else if (C === 'C' || C === 'S') {
          const p1 = C === 'C' ? [f32(o[0] + n()), f32(o[1] + n())] : lastC ? [f32(2 * cur[0] - lastC[0]), f32(2 * cur[1] - lastC[1])] : cur.slice();
          const p2 = [f32(o[0] + n()), f32(o[1] + n())], p3 = [f32(o[0] + n()), f32(o[1] + n())];
          st.b = cubicInto(st.b, cur, p1, p2, p3); lastC = p2; lastQ = null; cur = p3; any = true; continue;
        } else if (C === 'Q' || C === 'T') {
          const p1 = C === 'Q' ? [f32(o[0] + n()), f32(o[1] + n())] : lastQ ? [f32(2 * cur[0] - lastQ[0]), f32(2 * cur[1] - lastQ[1])] : cur.slice();
          const p2 = [f32(o[0] + n()), f32(o[1] + n())];
          st.b = quadInto(st.b, cur, p1, p2); lastQ = p1; lastC = null; cur = p2; any = true; continue;
        } else if (C === 'A') {
          const rx = n(), ry = n(), ang = n(), la = flag(), sw = flag(), to = [f32(o[0] + n()), f32(o[1] + n())];
          if (!arcInto(st, cur, rx, ry, ang, la, sw, to)) pt(to);
          cur = to;
        } else no();
        lastC = lastQ = null; any = true;
      }
      return any ? st.b : null;
    }
    return function outline(markup) {
      try {
        const n = parse(String(markup || ''));
        if (!n) return null;
        if (skipped(n)) return null;
        const b = boxOf(n);
        if (!b) return null;
        const x = f32(b[0]), y = f32(b[1]), w = f32(f32(b[2]) - x), h = f32(f32(b[3]) - y);
        return [x, y, x + w, y + h];
      } catch (e) { if (e instanceof Unsupported) return undefined; throw e; }
    };
  })();
  /* the scene point on one side of a placed item: top, bottom, left, right, center, topLeft, topRight, bottomLeft,
     bottomRight; d nudges it (scene units) */
  A.attach = function attach(ctx, item, side, d) {
    const b = A.box(ctx, item.prop, item.opts), s = A.scaleOf(ctx, item), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    const p = { top: [cx, b[1]], bottom: [cx, b[3]], left: [b[0], cy], right: [b[2], cy], topLeft: [b[0], b[1]], topRight: [b[2], b[1]], bottomLeft: [b[0], b[3]], bottomRight: [b[2], b[3]] }[side] || [cx, cy];
    return [item.x + s * p[0] + ((d && d[0]) || 0), item.y + s * p[1] + ((d && d[1]) || 0)];
  };
  /* where the line from an item's centre toward a point leaves its outline (a circle for round props: sparks, rings,
     and a node unless its family says `round: false`, as NieR's square node does) */
  A.edge = function edge(ctx, item, toward) {
    const b = A.box(ctx, item.prop, item.opts), s = A.scaleOf(ctx, item);
    const c = [item.x + s * (b[0] + b[2]) / 2, item.y + s * (b[1] + b[3]) / 2], hw = s * (b[2] - b[0]) / 2, hh = s * (b[3] - b[1]) / 2;
    const dx = toward[0] - c[0], dy = toward[1] - c[1], len = Math.hypot(dx, dy) || 1;
    const round = /^(spark|rings)$/.test(item.prop) || (item.prop === 'node' && (A.families[ctx.family] || {}).round !== false);
    if (round) { const r = Math.min(hw, hh); return [c[0] + (dx / len) * r, c[1] + (dy / len) * r]; }
    const k = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
    return [c[0] + dx * k, c[1] + dy * k];
  };
  /* a connector between two placed items, ending on both outlines */
  A.link = function link(ctx, a, b) {
    const ca = A.attach(ctx, a, 'center'), cb = A.attach(ctx, b, 'center');
    return [A.edge(ctx, a, cb), A.edge(ctx, b, ca)];
  };

  /* place(item) -> anchor + animated inner group */
  function place(item, inner, family) {
    if (family === 'retro') { item = Object.assign({}, item, { r: 0, s: item.sr || Math.max(1, Math.round(item.s || 1)) }); }
    const tf = `translate(${(+item.x || 0).toFixed(1)}px, ${(+item.y || 0).toFixed(1)}px)`
      + (item.s && item.s !== 1 ? ` scale(${item.s})` : '') + (item.r ? ` rotate(${item.r}deg)` : '');
    const anim = item.anim ? ` o55-an o55-an-${item.anim}` : '';
    const amb = item.amb ? ` o55-amb o55-amb-${item.amb}` : '';
    const style = `--d:${Math.round(item.delay || 0)}ms;${item.dur ? `--dur:${item.dur}ms;` : ''}${item.ambd ? `--ambd:${item.ambd}ms;` : ''}${item.fly != null ? `--o55-fly:${(+item.fly).toFixed(2)}px;` : ''}`;
    const op = item.o != null ? ` opacity="${item.o}"` : '';
    return `<g class="o55-it${item.cls ? ' ' + item.cls : ''}" data-key="${U.esc(item.key)}" style="transform:${tf}"${op}>`
      + `<g class="o55-in${anim}" style="${style}"><g class="o55-am${amb}">${inner}</g></g></g>`;
  }

  /* The art family a scene is drawn in. NieR Mode paints the Basic family (O55.theme().family stays 'basic' for the
     window's skin), but its art is the 'nier' family: a scene whose tokens belong to the root while NieR Mode is painted
     (O55.theme().art === 'nier'), or whose owning element previews NieR Mode (data-o55-nier-preview, the look screen's
     NieR thumbnail), is drawn in 'nier' when that family is defined. A family asked for by name other than the painted
     one (a look tile with its own data-theme) keeps its own art; ctx.nier === false opts out. Unknown -> 'basic'. */
  A.artFamily = function artFamily(family, tok, ctx, th) {
    th = th || O55.theme(); family = family || th.family;
    if (A.families.nier && !(ctx && ctx.nier === false) && tok) {
      if (tok.nierPreview) return 'nier';
      if (tok.nier && tok.root && th.art === 'nier' && family === th.family) return 'nier';
    }
    return A.families[family] ? family : 'basic';
  };

  /* render(sceneId, {family, mode, beat, params, tok}) -> svg markup */
  A.render = function render(sceneId, ctx) { return drawScene(sceneId, ctx).svg; };
  function drawScene(sceneId, ctx) {
    ctx = Object.assign({ beat: 'default', params: {} }, ctx || {});
    const th = O55.theme();
    ctx.tok = ctx.tok || A.tokens();
    ctx.family = A.artFamily(ctx.family, ctx.tok, ctx, th); ctx.mode = ctx.mode || ctx.tok.nierPreview || th.mode;
    const fam = A.families[ctx.family];
    const scene = A.scenes[sceneId] || A.scenes.hero;
    /* Stable per scene/family/mode so a beat morph keeps its <defs> ids; two layers of different looks never collide. */
    ctx.uid = 'o55' + U.hash(`${sceneId}|${ctx.family}|${ctx.mode}|${ctx.instance || ''}`).toString(36);
    ctx.url = (name) => `url(#${ctx.uid}-${name})`;
    ctx.pal = fam.palette(ctx.mode, ctx.tok, ctx);
    ctx.fam = fam; ctx.sceneId = sceneId;
    const items = (scene.compose(ctx) || []).filter(Boolean);
    ctx.items = items; /* the whole composition, for a family that spends something once per scene (NieR's ochre) */
    const layers = { back: [], mid: [], front: [] };
    /* Marionette strings. A helper tied to the control bar (opts.tie) does not draw its own string: the scene gets one
       string per tie, in the family's own string style, from the bar's hook to the helper's head (and, for a raised
       hand, from a second hook to that hand). O55.art.rig keeps every string on its two hook points every frame and
       drives the bar and the tied helpers as one linked system, so nothing comes loose while it all moves. */
    const bar = items.find((it) => it.prop === 'bar');
    /* any prop may hang from the bar: opts.tie (one string, to a helper's head or a prop's top) or opts.ties
       ([[barHook, side], ...], several strings to sides of its measured outline) */
    const ties = bar && fam.string ? items.filter((it) => it.opts && (it.opts.tie || it.opts.ties)) : [];
    const hookPts = new Map(); /* item -> [[name, local point, bar hook]] */
    if (ties.length) {
      const m = A.metrics(ctx.family), hooks = Object.assign({}, m.barHooks, (bar.opts || {}).hooks);
      bar.amb = null; bar.opts = Object.assign({}, bar.opts, { hooks });
      ties.forEach((it) => {
        const list = it.opts.ties || [[it.opts.tie, 'top']], b = it.prop === 'helper' ? null : A.box(ctx, it.prop, it.opts);
        hookPts.set(it, list.map(([bh, side], i) => {
          if (!b) return ['head', m.hook, bh];
          /* past the family's rounded corner, so each string ends on the outline, not in the air beside it */
          const cx = (b[0] + b[2]) / 2, ins = m.edgeInset || 6, pts = { top: [cx, b[1]], topLeft: [b[0] + ins, b[1]], topRight: [b[2] - ins, b[1]] };
          return [i ? 'head' + i : 'head', pts[side] || pts.top, bh];
        }));
        it.amb = null; it.opts = Object.assign({}, it.opts, { anchor: null, rig: true });
      });
      const pt = (it, local) => { const s = A.scaleOf(ctx, it); return [it.x + s * local[0], it.y + s * local[1]]; };
      const d = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      /* NieR's strings carry their rest length from the composition (data-rest, scene units: the hook-to-hook distance
         with every prop on its mark), so a scene born slack (asleep, held) draws its sag from the first frame (58-rig.js) */
      const rest = (a, b) => (ctx.family === 'nier' ? ` data-rest="${Math.hypot(b[0] - a[0], b[1] - a[1]).toFixed(1)}"` : '');
      /* NieR's strings carry their prop's entrance delay (--d), so a string can arrive with its unit (the cold open's
         asleep stage decodes each string in with the unit it holds: 30-art.css) */
      const late = (it) => (ctx.family === 'nier' ? ` style="--d:${Math.round(it.delay || 0)}ms"` : '');
      const strings = ties.map((it) => {
        let out = hookPts.get(it).map(([name, local, bh]) => { const a = pt(bar, hooks[bh] || [0, 0]), b = pt(it, local); return `<g class="o55-tie" data-key="tie-${U.esc(it.key)}-${name}" data-from="${U.esc(bar.key)}:${U.esc(bh)}" data-to="${U.esc(it.key)}:${name}"${rest(a, b)}${late(it)}>${fam.string(ctx, d(a, b))}</g>`; }).join('');
        /* a raised hand's string, when the bar has the hook it names (barHooks always has w0 and w2) */
        const hand = it.opts.pose === 'wave' && it.opts.handTie && hooks[it.opts.handTie] && fam.hand && fam.hand.wave;
        if (hand) out += `<g class="o55-tie o55-tie-hand" data-key="tie-${U.esc(it.key)}-hand" data-from="${U.esc(bar.key)}:${U.esc(it.opts.handTie)}" data-to="${U.esc(it.key)}:hand"${late(it)}>${fam.string(ctx, d(pt(bar, hooks[it.opts.handTie]), pt(it, fam.hand.wave)), true)}</g>`;
        return out;
      }).join('');
      layers.mid.push(`<g class="o55-ties" data-key="ties">${strings}</g>`);
    }
    const hook = (name, x, y) => `<circle class="o55-hook" data-hook="${name}" cx="${x}" cy="${y}" r="0.01" fill="none"/>`;
    for (const item of items) {
      const draw = fam.props[item.prop] || (A.common[item.prop] && ((c, o) => A.common[item.prop](c, o, fam)));
      if (!draw) continue;
      let inner = draw(ctx, item);
      /* hook points the rig measures: the bar's string points, a tied helper's head */
      if (ties.length && item === bar) inner = inner.replace(/<\/g>$/, Object.entries(item.opts.hooks).map(([k, [x, y]]) => hook(k, x, y)).join('') + '</g>');
      if (hookPts.has(item)) inner = inner.replace(/<\/g>$/, hookPts.get(item).map(([name, p]) => hook(name, p[0], p[1])).join('') + '</g>');
      (layers[item.layer || 'mid'] || layers.mid).push(place(item, inner, ctx.family));
    }
    const bg = fam.background ? fam.background(ctx) : '';
    const fx = fam.overlay ? fam.overlay(ctx) : '';
    const defs = fam.defs ? fam.defs(ctx) : '';
    const label = scene.label ? O55.t(scene.label) : '';
    /* (a scene may frame NieR's art in its own band, scene.bandNier: the narrow window's 170 px band shows only about
       112 units of it, centred, so NieR's hero pictures centre it on what they show there) */
    const band = ctx.band ? ((ctx.family === 'nier' && scene.bandNier) || scene.band || [0, 170, A.W, 280]) : null;
    const vb = band ? band.join(' ') : `0 0 ${A.W} ${A.H}`;
    /* ctx.sceneCls: a state the composition puts on the whole drawing (NieR's 'o55-nier-asleep', 55-scenes.js) */
    const svg = `<svg class="o55-scene o55-f-${ctx.family} o55-m-${ctx.mode}${ctx.sceneCls ? ' ' + ctx.sceneCls : ''}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice"`
      + ` role="img" aria-label="${U.esc(label)}" data-scene="${U.esc(sceneId)}" data-beat="${U.esc(ctx.beat)}" data-family="${ctx.family}" xmlns="http://www.w3.org/2000/svg">`
      + `<defs>${defs}</defs><g class="o55-bg" data-key="bg">${bg}</g>`
      + `<g class="o55-sl o55-sl-back" data-key="back">${layers.back.join('')}</g>`
      + `<g class="o55-sl o55-sl-mid" data-key="mid">${layers.mid.join('')}</g>`
      + `<g class="o55-sl o55-sl-front" data-key="front">${layers.front.join('')}</g>`
      + `<g class="o55-fx" data-key="fx">${fx}</g></svg>`;
    return { svg, family: ctx.family, parts: ctx.tok.nierParts };
  }

  /* mount(host, sceneId, ctx): first mount plays the entrance; the same scene with a new beat morphs (keyed props
     glide to new positions, new props enter, removed props exit); a different scene cross-transitions with an inert
     outgoing layer so there is never a blank frame. A change of art family to or from NieR's is a new layer too, never
     a morph: one cast replaces another (design/hero-spec.md 2.2; between two families the morph stays, so no family
     pixel changes). Options besides the drawing's (render):
     - ensembleHold: the new layer shows its set while the ensemble waits (.o55-ens-hold: NieR's units hidden at the top
       of their fly-in with their knots in mid-air; a family's bar, strings and helpers unseen at the start of their own
       entrance) until O55.art.troupe.enter lowers it in (59-cheer.js);
     - still: a drawing that never idles (no ambient loop, no rig sway; one-shot answers such as O55.art.peek still
       play): the look screen's NieR thumbnail while NieR Mode is off.
     Every mount and beat change stamps the drawing with the motion clock's time (data-o55-t0), so a performance asked
     for after its scene arrived keeps the scene's own timeline (O55.art.createdAct, curtainCall). */
  A.mount = function mount(host, sceneId, ctx) {
    const current = host.querySelector(':scope > .o55-scene-wrap:not(.o55-out)');
    const out = drawScene(sceneId, ctx), html = out.svg;
    const cast = current && current.getAttribute('data-family') !== out.family && (out.family === 'nier' || current.getAttribute('data-family') === 'nier');
    /* the host, and each scene layer, name the art family they show: 'nier' while NieR Mode is painted, although the
       window's skin stays Basic. The layer's own attribute is what NieR's cross-transition keys on (30-art.css), so a
       host attribute rewritten by its owner between mounts never restarts a running entrance. */
    if (host.getAttribute('data-family') !== out.family) host.setAttribute('data-family', out.family);
    if (current && current.getAttribute('data-scene') === sceneId && !cast) {
      const svg = current.querySelector('svg');
      const tpl = document.createElement('template'); tpl.innerHTML = html;
      const next = tpl.content.firstElementChild;
      /* the rig keeps moving through the re-render: its transforms are put back before the frame is painted, and a
         re-render that moved no prop (the name sign relettered) is re-measured at once instead of held still */
      const was = A.rig ? A.rig.layout(svg) : '', restore = A.rig ? A.rig.hold(svg) : null;
      for (const { name, value } of Array.from(next.attributes)) svg.setAttribute(name, value);
      /* (the morph drops attributes the render does not write: the props it keeps keep when their entrance started,
         and those it adds start theirs now) */
      const borns = [...svg.querySelectorAll('[data-o55-born]')].map((el) => [el, el.getAttribute('data-o55-born')]);
      U.morphFrom(svg, next);
      if (restore) restore();
      borns.forEach(([el, v]) => { if (el.isConnected && !el.hasAttribute('data-o55-born')) el.setAttribute('data-o55-born', v); });
      born(svg);
      if (current.getAttribute('data-family') !== out.family) current.setAttribute('data-family', out.family);
      current.classList.add('o55-beat');
      svg.setAttribute('data-o55-t0', String(Math.round(O55.motion.now())));
      if (A.rig) A.rig.watch(svg, { quick: A.rig.layout(svg) === was });
      return current;
    }
    const wrap = document.createElement('div');
    /* a NieR scene with a curtain (Ready, the pages that end Connect and restore) that replaces a scene on the stage
       closes its curtain over that scene and opens it on its own troupe instead of slicing in over it (30-art.css
       .o55-cc-in): a slice cut the old units at the waist and the curtain's edges never stand on a unit. Not where the
       curtain is not drawn (no Slice open part, a low-resource computer, Reduced Motion). */
    const M = O55.motion, parts = out.parts;
    const cc = !!current && out.family === 'nier' && html.indexOf('o55-cur-all') >= 0 && !M.reduced() && !M.lowResource && (!parts || parts.indexOf('slice') >= 0);
    wrap.className = 'o55-scene-wrap o55-enter' + (cc ? ' o55-cc-in' : '') + (ctx && ctx.ensembleHold ? ' o55-ens-hold' : '') + (ctx && ctx.still ? ' o55-still' : '');
    wrap.setAttribute('data-scene', sceneId); wrap.setAttribute('data-family', out.family);
    if (ctx && ctx.still) wrap.setAttribute('data-o55-ambient', 'off');
    wrap.innerHTML = html;
    wrap.firstElementChild.setAttribute('data-o55-t0', String(Math.round(O55.motion.now())));
    if (current) {
      current.classList.add('o55-out');
      current.setAttribute('aria-hidden', 'true');
      current.setAttribute('inert', '');
      const done = () => current.remove();
      const t = O55.motion.after(900, done);
      current.addEventListener('animationend', (e) => { if (e.target === current) { t.cancel(); done(); } });
    }
    /* held (a screen change): the new scene waits unseen and the old one waits in place, both paused, until
       O55.art.release (.o55-scene-held / .o55-scene-waiting: 30-art.css pauses the parts that move, so the release
       restyles only those) */
    if (ctx && ctx.hold) { wrap.classList.add('o55-scene-held'); if (current) current.classList.add('o55-scene-waiting'); }
    else born(wrap);
    host.appendChild(wrap);
    warm(host.closest && host.closest('#pm-o55-onboarding, #pm-o55-tour'));
    O55.motion.after(40, () => wrap.classList.remove('o55-enter'));
    /* a held ensemble that nobody lowers in (its caller failed or never came) is lowered in by itself */
    if (ctx && ctx.ensembleHold) O55.motion.after(9000, () => { if (wrap.isConnected && wrap.classList.contains('o55-ens-hold') && A.troupe) A.troupe.enter(host); });
    if (A.rig) A.rig.watch(wrap.querySelector('svg'));
    return wrap;
  };
  A.release = function release(host) {
    if (!host) return;
    host.querySelectorAll(':scope > .o55-scene-wrap.o55-scene-held, :scope > .o55-scene-wrap.o55-scene-waiting').forEach((w) => {
      if (w.classList.contains('o55-scene-held')) born(w); /* (a held scene's entrances start now) */
      w.classList.remove('o55-scene-held', 'o55-scene-waiting');
    });
  };
  /* A.arrivedAt(host) -> the motion-clock time the drawing on the host has its actors in place: the end of the last
     entrance of its units and its hung sign, each counted from when it started (data-o55-born: the drawing's mount, its
     release when it was held, or the beat change that added it) and read from its own markup (--d, --dur), nothing
     measured; 0 when none is arriving. A narrator placed before then judged its lane against units still on their way
     down through it (Pod on Creating at 760 px, 66-nier-window.js say). */
  const ACTOR = '.o55-ens-h > .o55-in.o55-an, .o55-it[data-key="sign"] > .o55-in.o55-an', ENTRANCE = { drop: 520, rise: 460, hang: 320 };
  function born(scope) { const t = String(Math.round(O55.motion.now())); scope.querySelectorAll(ACTOR).forEach((el) => { if (!el.hasAttribute('data-o55-born')) el.setAttribute('data-o55-born', t); }); }
  A.arrivedAt = function arrivedAt(host) {
    const wrap = host && host.querySelector(':scope > .o55-scene-wrap:not(.o55-out)');
    if (!wrap) return 0;
    if (wrap.classList.contains('o55-scene-held')) return O55.motion.now() + 400;
    let end = 0;
    wrap.querySelectorAll(ACTOR).forEach((el) => {
      const t0 = +el.getAttribute('data-o55-born'); if (!Number.isFinite(t0) || !t0) return;
      const st = el.getAttribute('style') || '', d = /--d:\s*(-?[\d.]+)ms/.exec(st), du = /--dur:\s*([\d.]+)ms/.exec(st), k = /o55-an-(\w+)/.exec(el.getAttribute('class') || '');
      end = Math.max(end, t0 + (d ? +d[1] : 0) + (du ? +du[1] : ENTRANCE[k && k[1]] || 420));
    });
    return end;
  };

  /* Shared parametric helpers used by several families. */
  A.common = {};
  A.path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  A.curve = (x1, y1, x2, y2, sag) => { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + (sag || 0); return `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`; };

  /* Retro pixel sprites: rows of chars mapped to palette keys; runs merged into rects. */
  A.sprite = function sprite(rows, map, px, ox, oy) {
    px = px || 4; ox = ox || 0; oy = oy || 0;
    const w = Math.max(...rows.map((r) => r.length));
    const x0 = ox - (w * px) / 2, y0 = oy - (rows.length * px) / 2;
    let out = '';
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x]; let run = 1;
        while (x + run < row.length && row[x + run] === ch) run++;
        const entry = map[ch];
        const fill = entry && typeof entry === 'object' ? entry.fill : entry;
        const cls = entry && typeof entry === 'object' && entry.cls ? ` class="${entry.cls}"` : '';
        if (fill) out += `<rect x="${x0 + x * px}" y="${y0 + y * px}" width="${run * px}" height="${px}" fill="${fill}"${cls}/>`;
        x += run;
      }
    });
    return `<g shape-rendering="crispEdges">${out}</g>`;
  };

  /* Shared 24x24 stroke glyphs; each family renders them in its own material (line, paper, light, pixel). */
  A.glyphs = {
    seed: '<path d="M12 21v-9"/><path d="M12 12c0-4.2 3-6.6 7.5-6.6 0 4.2-3 6.6-7.5 6.6z"/><path d="M12 14.5c0-3.2-2.4-5.3-6.3-5.3 0 3.2 2.4 5.3 6.3 5.3z"/><path d="M8 21h8"/>',
    folder: '<path d="M3 7.5a2 2 0 0 1 2-2h4.2l2.1 2.2H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 10h18"/>',
    computer: '<rect x="3.5" y="4.5" width="17" height="11" rx="1.6"/><path d="M1.5 19.5h21"/><path d="M8.5 15.5l-.8 4M15.5 15.5l.8 4"/>',
    person: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.5c1.1-4.1 3.9-6.3 7.2-6.3s6.1 2.2 7.2 6.3"/>',
    cloud: '<path d="M7 18.5a4.2 4.2 0 0 1-.6-8.36A6.2 6.2 0 0 1 18.3 9.3a4.6 4.6 0 0 1-.3 9.2z"/>',
    vault: '<path d="M12 2.8l7.5 3.1v6.2c0 4.7-3.1 7.9-7.5 9.4-4.4-1.5-7.5-4.7-7.5-9.4V5.9z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    server: '<rect x="4" y="3.5" width="16" height="7" rx="1.5"/><rect x="4" y="13.5" width="16" height="7" rx="1.5"/><path d="M8 7h.01M8 17h.01M12 7h5M12 17h5"/>',
    box: '<path d="M3 8l9-5 9 5v8.2l-9 5-9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8.2"/>',
    rewind: '<circle cx="12.5" cy="12.5" r="7.5"/><path d="M12.5 8.5v4.2l2.9 1.8"/><path d="M3 4.5v4h4"/><path d="M3.3 8.3A9.6 9.6 0 0 1 5.6 6"/>',
    key: '<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12H21M17.5 12v3.5M20.5 12v2.5"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5s1.2-6.1 3.8-8.5z"/>',
    spark: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5"/><path d="M12 9.5l1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1z"/>',
    link: '<path d="M10 14a4 4 0 0 1 0-5.7l3-3a4 4 0 0 1 5.7 5.7l-1.4 1.4"/><path d="M14 10a4 4 0 0 1 0 5.7l-3 3a4 4 0 0 1-5.7-5.7l1.4-1.4"/>',
    power: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5v4h4"/><path d="M12 8v4.5l3 2"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    check: '<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    plug: '<path d="M9 3v5M15 3v5"/><path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0z"/><path d="M12 17v4"/>',
    stack: '<path d="M12 3l9 4.5-9 4.5-9-4.5z"/><path d="M3 12l9 4.5 9-4.5"/><path d="M3 16.5L12 21l9-4.5"/>'
  };
  A.glyph = function glyph(name, stroke, width) {
    /* o55-gl-<name>: a scene may give the icon an idle of its own (the beginning on the start scene) */
    const n = A.glyphs[name] ? name : 'spark';
    return `<g class="o55-gl o55-gl-${n}" fill="none" stroke="${stroke || 'currentColor'}" stroke-width="${width || 1.8}" stroke-linecap="round" stroke-linejoin="round">${A.glyphs[n]}</g>`;
  };

  /* Identity picture: a deterministic symmetric 5x5 glyph (identicon-like) from a fingerprint string, drawn in the
     family's style by the caller. Used for Server, NAS and SSH key identities. */
  A.identity = function identity(seed) {
    const r = U.rng(String(seed));
    const cells = [];
    for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) { const on = r() > 0.45; if (on) { cells.push([x, y]); if (x < 2) cells.push([4 - x, y]); } }
    const hue = Math.floor(r() * 360);
    const words = ['amber', 'otter', 'lantern', 'maple', 'harbor', 'violet', 'cedar', 'pebble', 'comet', 'willow', 'ember', 'falcon', 'meadow', 'quartz', 'river', 'saffron'];
    const pick = () => words[Math.floor(r() * words.length)];
    return { cells, hue, words: [pick(), pick(), pick(), pick()] };
  };
  /* NieR Mode draws it in ink, square, with no hue (NieR keeps to ink on parchment): for family 'nier', and for the
     painted family while NieR Mode is painted (the identity chip in the window asks with O55.theme().family). `ink`
     (optional) is the cells' colour; currentColor otherwise. */
  A.identitySvg = function identitySvg(seed, size, family, ink) {
    const id = A.identity(seed), s = size || 44, c = s / 5;
    if (family === 'nier' || (family && family === O55.theme().family && O55.theme().art === 'nier')) {
      const cells = id.cells.map(([x, y]) => `<rect x="${x * c + 1}" y="${y * c + 1}" width="${c - 2}" height="${c - 2}" fill="${ink || 'currentColor'}"/>`).join('');
      const t = Math.max(3, c * 0.6), corner = (x, y, dx, dy) => `M${x + dx * t} ${y}H${x}V${y + dy * t}`;
      const frame = `<path d="${corner(0.5, 0.5, 1, 1)}${corner(s - 0.5, 0.5, -1, 1)}${corner(0.5, s - 0.5, 1, -1)}${corner(s - 0.5, s - 0.5, -1, -1)}" fill="none" stroke="${ink || 'currentColor'}" stroke-opacity="0.6" stroke-linecap="square"/>`;
      return `<svg class="o55-identity o55-identity-nier" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" aria-hidden="true" shape-rendering="crispEdges">${frame}${cells}</svg>`;
    }
    const fill = `hsl(${id.hue} 62% ${family === 'retro' ? 55 : 60}%)`;
    const rx = family === 'friendly' ? c * 0.35 : family === 'glass' ? c * 0.25 : 0;
    const rects = id.cells.map(([x, y]) => `<rect x="${x * c + 0.5}" y="${y * c + 0.5}" width="${c - 1}" height="${c - 1}" rx="${rx}" fill="${fill}"${family === 'glass' ? ' fill-opacity="0.8"' : ''}/>`).join('');
    const frame = family === 'basic' ? `<rect x="0.5" y="0.5" width="${s - 1}" height="${s - 1}" fill="none" stroke="currentColor" stroke-opacity="0.45"/>` : '';
    return `<svg class="o55-identity" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" aria-hidden="true"${family === 'retro' ? ' shape-rendering="crispEdges"' : ''}>${frame}${rects}</svg>`;
  };
})();
