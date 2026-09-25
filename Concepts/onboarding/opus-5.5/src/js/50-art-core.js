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

  /* Read live theme tokens so light/dark re-light the same drawings from the app's real palette. */
  A.tokens = function tokens(el) {
    const cs = getComputedStyle(el || document.documentElement);
    const get = (n, fb) => (cs.getPropertyValue(n) || '').trim() || fb;
    return {
      bg: get('--background', '#121212'), surface: get('--surface', '#1e1e1e'), text: get('--text-primary', '#e8e8e8'),
      text2: get('--text-secondary', '#aaa'), muted: get('--text-muted', '#888'), border: get('--border', '#333'),
      blue: get('--accent-blue', '#64b5f6'), magenta: get('--accent-magenta', '#ff69b4'), lime: get('--accent-lime', '#3dd68c'),
      orange: get('--accent-orange', '#ffa347'), warn: get('--accent-warning', '#f5c542'), error: get('--accent-error', '#ef5350'),
      primary: get('--accent-primary', get('--accent-blue', '#64b5f6'))
    };
  };

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
     in the prop's own units, before its scale. */
  const boxes = new Map();
  A.box = function box(ctx, prop, opts) {
    const k = ctx.family + '|' + ctx.mode + '|' + prop + '|' + JSON.stringify(opts || {});
    if (boxes.has(k)) return boxes.get(k);
    const fam = A.families[ctx.family] || A.families.basic, draw = fam.props[prop] || (A.common[prop] && ((c, o) => A.common[prop](c, o, fam)));
    let r = [-20, -20, 20, 20];
    if (draw && document.body) {
      const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('style', 'position:fixed;left:-9999px;top:0;width:10px;height:10px;visibility:hidden;pointer-events:none');
      svg.innerHTML = `<g>${draw(ctx, { x: 0, y: 0, s: 1, opts: opts || {}, key: 'geo' })}</g>`;
      svg.querySelectorAll('text, .o55-hook, [fill*="glow"], [class*="shade"], .o55-shadow').forEach((t) => t.remove());
      document.body.appendChild(svg);
      try { const b = svg.firstElementChild.getBBox(); if (b.width || b.height) r = [b.x, b.y, b.x + b.width, b.y + b.height]; } catch (_) {}
      svg.remove();
    }
    boxes.set(k, r); return r;
  };
  /* the scene point on one side of a placed item: top, bottom, left, right, center, topLeft, topRight, bottomLeft,
     bottomRight; d nudges it (scene units) */
  A.attach = function attach(ctx, item, side, d) {
    const b = A.box(ctx, item.prop, item.opts), s = A.scaleOf(ctx, item), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    const p = { top: [cx, b[1]], bottom: [cx, b[3]], left: [b[0], cy], right: [b[2], cy], topLeft: [b[0], b[1]], topRight: [b[2], b[1]], bottomLeft: [b[0], b[3]], bottomRight: [b[2], b[3]] }[side] || [cx, cy];
    return [item.x + s * p[0] + ((d && d[0]) || 0), item.y + s * p[1] + ((d && d[1]) || 0)];
  };
  /* where the line from an item's centre toward a point leaves its outline (a circle for round props) */
  A.edge = function edge(ctx, item, toward) {
    const b = A.box(ctx, item.prop, item.opts), s = A.scaleOf(ctx, item);
    const c = [item.x + s * (b[0] + b[2]) / 2, item.y + s * (b[1] + b[3]) / 2], hw = s * (b[2] - b[0]) / 2, hh = s * (b[3] - b[1]) / 2;
    const dx = toward[0] - c[0], dy = toward[1] - c[1], len = Math.hypot(dx, dy) || 1;
    if (/^(node|spark|rings)$/.test(item.prop)) { const r = Math.min(hw, hh); return [c[0] + (dx / len) * r, c[1] + (dy / len) * r]; }
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
    const style = `--d:${Math.round(item.delay || 0)}ms;${item.dur ? `--dur:${item.dur}ms;` : ''}${item.ambd ? `--ambd:${item.ambd}ms;` : ''}`;
    const op = item.o != null ? ` opacity="${item.o}"` : '';
    return `<g class="o55-it${item.cls ? ' ' + item.cls : ''}" data-key="${U.esc(item.key)}" style="transform:${tf}"${op}>`
      + `<g class="o55-in${anim}" style="${style}"><g class="o55-am${amb}">${inner}</g></g></g>`;
  }

  /* render(sceneId, {family, mode, beat, params}) -> svg markup */
  A.render = function render(sceneId, ctx) {
    ctx = Object.assign({ beat: 'default', params: {} }, ctx || {});
    const th = O55.theme();
    ctx.family = ctx.family || th.family; ctx.mode = ctx.mode || th.mode;
    const fam = A.families[ctx.family] || A.families.basic;
    const scene = A.scenes[sceneId] || A.scenes.hero;
    ctx.tok = ctx.tok || A.tokens();
    /* Stable per scene/family/mode so a beat morph keeps its <defs> ids; two layers of different looks never collide. */
    ctx.uid = 'o55' + U.hash(`${sceneId}|${ctx.family}|${ctx.mode}|${ctx.instance || ''}`).toString(36);
    ctx.url = (name) => `url(#${ctx.uid}-${name})`;
    ctx.pal = fam.palette(ctx.mode, ctx.tok, ctx);
    ctx.fam = fam; ctx.sceneId = sceneId;
    const items = (scene.compose(ctx) || []).filter(Boolean);
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
          const cx = (b[0] + b[2]) / 2, pts = { top: [cx, b[1]], topLeft: [b[0] + 6, b[1]], topRight: [b[2] - 6, b[1]] };
          return [i ? 'head' + i : 'head', pts[side] || pts.top, bh];
        }));
        it.amb = null; it.opts = Object.assign({}, it.opts, { anchor: null, rig: true });
      });
      const pt = (it, local) => { const s = A.scaleOf(ctx, it); return [it.x + s * local[0], it.y + s * local[1]]; };
      const d = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      const strings = ties.map((it) => {
        let out = hookPts.get(it).map(([name, local, bh]) => `<g class="o55-tie" data-key="tie-${U.esc(it.key)}-${name}" data-from="${U.esc(bar.key)}:${U.esc(bh)}" data-to="${U.esc(it.key)}:${name}">${fam.string(ctx, d(pt(bar, hooks[bh] || [0, 0]), pt(it, local)))}</g>`).join('');
        const hand = it.opts.pose === 'wave' && it.opts.handTie && fam.hand && fam.hand.wave;
        if (hand) out += `<g class="o55-tie o55-tie-hand" data-key="tie-${U.esc(it.key)}-hand" data-from="${U.esc(bar.key)}:${U.esc(it.opts.handTie)}" data-to="${U.esc(it.key)}:hand">${fam.string(ctx, d(pt(bar, hooks[it.opts.handTie] || from), pt(it, fam.hand.wave)), true)}</g>`;
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
    const band = ctx.band ? (scene.band || [0, 170, A.W, 280]) : null;
    const vb = band ? band.join(' ') : `0 0 ${A.W} ${A.H}`;
    return `<svg class="o55-scene o55-f-${ctx.family} o55-m-${ctx.mode}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice"`
      + ` role="img" aria-label="${U.esc(label)}" data-scene="${U.esc(sceneId)}" data-beat="${U.esc(ctx.beat)}" data-family="${ctx.family}" xmlns="http://www.w3.org/2000/svg">`
      + `<defs>${defs}</defs><g class="o55-bg" data-key="bg">${bg}</g>`
      + `<g class="o55-sl o55-sl-back" data-key="back">${layers.back.join('')}</g>`
      + `<g class="o55-sl o55-sl-mid" data-key="mid">${layers.mid.join('')}</g>`
      + `<g class="o55-sl o55-sl-front" data-key="front">${layers.front.join('')}</g>`
      + `<g class="o55-fx" data-key="fx">${fx}</g></svg>`;
  };

  /* mount(host, sceneId, ctx): first mount plays the entrance; the same scene with a new beat morphs (keyed props
     glide to new positions, new props enter, removed props exit); a different scene cross-transitions with an inert
     outgoing layer so there is never a blank frame. */
  A.mount = function mount(host, sceneId, ctx) {
    const current = host.querySelector(':scope > .o55-scene-wrap:not(.o55-out)');
    const html = A.render(sceneId, ctx);
    if (current && current.getAttribute('data-scene') === sceneId) {
      const svg = current.querySelector('svg');
      const tpl = document.createElement('template'); tpl.innerHTML = html;
      const next = tpl.content.firstElementChild;
      for (const { name, value } of Array.from(next.attributes)) svg.setAttribute(name, value);
      U.morphFrom(svg, next);
      current.classList.add('o55-beat');
      if (A.rig) A.rig.watch(svg);
      return current;
    }
    const wrap = document.createElement('div');
    wrap.className = 'o55-scene-wrap o55-enter';
    wrap.setAttribute('data-scene', sceneId);
    wrap.innerHTML = html;
    if (current) {
      current.classList.add('o55-out');
      current.setAttribute('aria-hidden', 'true');
      current.setAttribute('inert', '');
      const done = () => current.remove();
      const t = O55.motion.after(900, done);
      current.addEventListener('animationend', (e) => { if (e.target === current) { t.cancel(); done(); } });
    }
    host.appendChild(wrap);
    O55.motion.after(40, () => wrap.classList.remove('o55-enter'));
    if (A.rig) A.rig.watch(wrap.querySelector('svg'));
    return wrap;
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
    return `<g fill="none" stroke="${stroke || 'currentColor'}" stroke-width="${width || 1.8}" stroke-linecap="round" stroke-linejoin="round">${A.glyphs[name] || A.glyphs.spark}</g>`;
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
  A.identitySvg = function identitySvg(seed, size, family) {
    const id = A.identity(seed), s = size || 44, c = s / 5;
    const fill = `hsl(${id.hue} 62% ${family === 'retro' ? 55 : 60}%)`;
    const rx = family === 'friendly' ? c * 0.35 : family === 'glass' ? c * 0.25 : 0;
    const rects = id.cells.map(([x, y]) => `<rect x="${x * c + 0.5}" y="${y * c + 0.5}" width="${c - 1}" height="${c - 1}" rx="${rx}" fill="${fill}"${family === 'glass' ? ' fill-opacity="0.8"' : ''}/>`).join('');
    const frame = family === 'basic' ? `<rect x="0.5" y="0.5" width="${s - 1}" height="${s - 1}" fill="none" stroke="currentColor" stroke-opacity="0.45"/>` : '';
    return `<svg class="o55-identity" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" aria-hidden="true"${family === 'retro' ? ' shape-rendering="crispEdges"' : ''}>${frame}${rects}</svg>`;
  };
})();
