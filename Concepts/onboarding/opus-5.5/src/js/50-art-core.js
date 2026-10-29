/* O55.art — the stage's shared parts (DL-238). Pip's stage replaced the per-look puppet scenes: the stage itself is
   O55.pipStage (58-rig.js), its worlds O55.pipWorlds (51-54, pen and props 56-57) and the director O55.pipScenes
   (55-scenes.js). What stays here is what the window draws in its own pane: the live theme tokens, colour helpers,
   the shared 24x24 glyphs and the identity pictures for Servers, devices and keys. O55.art.mount draws a look tile's
   Pip; the troupe's old calls (peek, poke, react, celebrate, createdAct, curtainCall) are answered by Pip's stage.
   Pip is the one kit (PMLogo, the glyph system's head module, DR-076): this file never draws a second Pip. */
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
  /* ---------------------------------------------------------------- Pip's registry (58-rig.js builds the stage)
     O55.pipStage.h: what every part of the stage shares. Time is the motion clock's (the film tools slow it) divided by
     Animation speed (Settings; Cinematic plays slower), so Pip's physics, faces and typing all keep the one pace. */
  const PIP = O55.pipStage = O55.pipStage || { mixins: [] };
  const H = PIP.h = {
    NS: 'http://www.w3.org/2000/svg',
    R: (v) => +(+v).toFixed(2),
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    ease: (k) => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3),
    rot: (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; },
    speed: () => { try { return typeof o55SpeedFactor === 'number' && o55SpeedFactor > 0 ? o55SpeedFactor : 1; } catch (_) { return 1; } }, // eslint-disable-line no-undef
    now: () => O55.motion.now() / 1000,
    el(tag, attrs, parent) { const e = document.createElementNS(H.NS, tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; },
    div(cls, parent, html) { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; if (parent) parent.appendChild(d); return d; },
    /* the one Pip kit (the glyph system's head module): the stage asks for it, it never draws a Pip of its own */
    kit: () => window.PMLogo || null,
    /* the stage's words (copy.d/48-pip.json pip.stage.*) */
    T: (k, v) => O55.t('pip.stage.' + k, v),
    /* the stage's look: the painted family and mode, NieR Mode as its own world */
    theme() { const th = O55.theme(); return (th.nier ? 'nier' : th.family) + '-' + (th.mode === 'light' ? 'light' : 'dark'); },
    /* a Pip part (Settings > Pip parts, general.visual.pip-parts, S9: onboarding and the chat only): the parts registry
       (PM_PIP_PARTS.get) when it is there, on otherwise */
    part(id) { const reg = window.PM_PIP_PARTS; try { if (reg && typeof reg.get === 'function') return reg.get(id) !== false; } catch (_) {} return true; },
    /* a mixin: methods a look's file adds to the stage (54-art-retro.js, 54-art-nier.js, 59-cheer.js) */
    mix(obj) { PIP.mixins.push(obj); if (PIP.Stage) Object.assign(PIP.Stage.prototype, obj); }
  };
  /* The worlds: each look's backdrop, palette and how it moves (51-54), the pen that turns a prop's parts into the
     look's material and the props (56-57). */
  const PW = O55.pipWorlds = O55.pipWorlds || { WORLDS: {}, BACKDROPS: {}, PROPS: {}, HATS: {} };
  PW.mix = function mix(a, b, t) {
    const h = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
    const P = h(a), Q = h(b);
    return '#' + P.map((v, i) => Math.round(v + (Q[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  PW.backdrop = (w, ids, Lay) => (PW.BACKDROPS[w.tube || w.fam] || PW.BACKDROPS[w.fam])(w, ids, Lay);

  /* ---------------------------------------------------------------- the old troupe's calls, answered by Pip
     A look tile (Pick a look, NieR's thumbnail) shows that look's Pip as a still mark; the stage itself is never mounted
     through here (60-ui-core.js renderScene directs it). The troupe's moments become Pip's: a choice made (react, poke),
     a celebration, the Created moment and the curtain call. NieR's thumbnail no longer peeks (there is no troupe in the
     wings): peek answers false, and troupe is null, so its callers skip those beats. */
  A.mount = function mount(host, sceneId, ctx) {
    const K = H.kit(); if (!host) return null;
    ctx = ctx || {};
    const nier = ctx.instance === 'nier', theme = (nier ? 'nier' : ctx.family || 'basic') + '-' + (ctx.mode === 'light' ? 'light' : 'dark');
    const key = theme + '|' + (K ? 'k' : '-');
    if (host.getAttribute('data-o55-pip') === key) return host.firstElementChild;
    host.setAttribute('data-o55-pip', key);
    host.innerHTML = K ? `<span class="o55-tilepip" data-pip-theme="${theme}" aria-hidden="true">${K.svg({ theme, px: 64, form: 'tile', decorative: true })}</span>` : '';
    return host.firstElementChild;
  };
  const stageOf = (host) => (PIP.of ? PIP.of(host) : null);
  A.release = (host) => { const s = stageOf(host); if (s && s.release) s.release(); };
  A.react = (host) => { const s = stageOf(host); if (s && s.picked) s.picked(); };
  A.poke = (host) => { const s = stageOf(host); if (s && s.busy) s.busy(); };
  A.celebrate = (host, o) => { const s = stageOf(host); if (s && s.celebrate) s.celebrate(o || {}); };
  A.createdAct = (host, o) => { const s = stageOf(host); if (s && s.created) s.created(o || {}); };
  A.curtainCall = (host, o) => { const s = stageOf(host); if (s && s.curtainCall) s.curtainCall(o || {}); return !!s; };
  A.peek = () => false;
  A.troupe = null;
  A.arrivedAt = () => 0;

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
