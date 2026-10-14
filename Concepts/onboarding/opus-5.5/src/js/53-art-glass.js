/* Glass — "the light lab", in the Liquid Glass look's language (2026-10-13). Ball-jointed crystal marionettes with
   light piped through their limbs, on light-filament strings, over a thick glass stage; behind them, layered waves of
   tinted glass like the Glass wallpaper (Ribbons) under a clear sky with a few floating lens droplets. Captions stand on
   a shelf of light with no box; nameplates are cut-glass plates. Gradients only (no blur filters, so it ports to Slint
   and films at full rate). Motion: the waves swell, droplets float, light sweeps, lens focus pulls.
   Dark = a deep night sky; light = a pale dawn. */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art, U = O55.util;

  const palette = (mode, tok) => {
    const dark = mode === 'dark';
    return {
      dark,
      bg: dark ? '#1f1730' : '#ead7ec', bg2: dark ? '#140e22' : '#dcc2e3',
      lav: tok.blue, pink: tok.magenta, mint: tok.lime, amber: tok.orange,
      text: tok.text, textDim: A.rgba(tok.text, 0.78),
      slip: dark ? 'rgba(16,11,30,0.84)' : 'rgba(255,255,255,0.88)', slipEdge: dark ? 'rgba(255,255,255,0.22)' : A.rgba(A.mix(tok.blue, tok.text, 0.4), 0.35),
      g0: dark ? 0.34 : 0.78, g1: dark ? 0.07 : 0.34, g2: dark ? 0.02 : 0.14,
      e0: dark ? 0.85 : 1, e1: dark ? 0.18 : 0.55,
      core: dark ? '#ffffff' : '#fffaff', shade: dark ? 'rgba(10,6,20,0.35)' : 'rgba(90,60,120,0.16)',
      tones: [tok.blue, tok.magenta, tok.lime, tok.orange], aurora: dark ? ['lav', 'pink', 'mint'] : ['lav', 'pink', 'amber']
    };
  };
  const G = (ctx) => `fill="${ctx.url('glass')}" stroke="${ctx.url('edge')}" stroke-width="1.2"`;
  const hl = (d) => `<path d="${d}" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.4" stroke-linecap="round"/>`;
  const glow = (ctx, color, r, x, y) => `<circle cx="${x || 0}" cy="${y || 0}" r="${r}" fill="${ctx.url('glow-' + color)}"/>`;
  /* Every word in the art is etched on a slip of frosted glass that covers its whole box: a near-solid pane (dark in
     Dark, white in Light) with a lit top edge, so a word keeps its contrast whatever passes behind it (a stage edge, a
     glow, a string, a wave). slip(p, x, y, w, size, anchor): the pane for a word of width w set at baseline y. */
  const FONT = 'Inter, system-ui, sans-serif';
  const slip = (p, x, y, w, size, anchor) => {
    const padX = Math.max(3.5, size * 0.42), top = y - size * 1.12, h = size * 1.6, x0 = (anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2) - padX, W = w + padX * 2;
    return `<rect x="${x0.toFixed(2)}" y="${top.toFixed(2)}" width="${W.toFixed(2)}" height="${h.toFixed(2)}" rx="2.4" fill="${p.slip}" stroke="${p.slipEdge}" stroke-width="0.6"/>`
      + `<path d="M${(x0 + 2.4).toFixed(2)} ${(top + 0.7).toFixed(2)} H${(x0 + W - 2.4).toFixed(2)}" stroke="#fff" stroke-width="0.6" stroke-linecap="round" opacity="${p.dark ? 0.35 : 0.95}"/>`;
  };
  const label = (p, x, y, s, size, fill, anchor) => {
    size = size || 8.5; const w = A.textW(s, size, FONT, 600, 0.4);
    return slip(p, x, y, w, size, anchor || 'middle')
      + `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" font-family="${FONT}" font-weight="600" font-size="${size}" letter-spacing="0.4" fill="${fill || p.text}">${U.esc(s)}</text>`;
  };
  const tints = ['lav', 'pink', 'mint', 'amber'];

  /* The crystal marionette: a cut-glass torso with a socket at every corner, and glass rods for limbs that meet at glass
     beads (neck, shoulders, elbows, hands, hips, knees), so every limb starts inside the joint it turns on and nothing
     ever stands apart from the body, whatever the rig does to it. Light from the core runs down each rod in the puppet's
     own tint. Joints, in helper units (feet at 0, the head's top at -68.5, where its string ties):
       neck 0,-45.8; shoulders +-13,-40.5; elbows (by pose); hands (by pose); hips +-5.5,-13 (on the bow's hip line, -12,
       so the pitched torso and the standing legs share them); knees +-6.2,-6.8; ankles +-6.6,-1.6.
     A waving arm is the rig's .o55-arm (pivot: the shoulder) holding an .o55-fore (pivot: the elbow), so the forearm
     bends while the arm swings and both stay on their beads. */
  const rod = (a, b, r) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * r, ny = (dx / L) * r, f = (v) => v.toFixed(2);
    return `M${f(a[0] + nx)} ${f(a[1] + ny)} L${f(b[0] + nx)} ${f(b[1] + ny)} A${r} ${r} 0 0 0 ${f(b[0] - nx)} ${f(b[1] - ny)} L${f(a[0] - nx)} ${f(a[1] - ny)} A${r} ${r} 0 0 0 ${f(a[0] + nx)} ${f(a[1] + ny)}Z`;
  };
  /* a limb part: the glass rod, the light piped through it, and a glint along its lit side */
  const limb = (ctx, a, b, r, tint) => {
    const p = ctx.pal, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ox = (-dy / L) * r * 0.45, oy = (dx / L) * r * 0.45, side = ox + oy < 0 ? 1 : -1;
    return `<path d="${rod(a, b, r)}" fill="${ctx.url('glass')}" stroke="${ctx.url('edge')}" stroke-width="0.9"/>`
      + `<path d="M${a[0].toFixed(2)} ${a[1].toFixed(2)} L${b[0].toFixed(2)} ${b[1].toFixed(2)}" stroke="${p[tint]}" stroke-width="${(r * 0.85).toFixed(2)}" stroke-linecap="round" opacity="${p.dark ? 0.55 : 0.45}"/>`
      + `<path d="M${(a[0] + side * ox).toFixed(2)} ${(a[1] + side * oy).toFixed(2)} L${(b[0] + side * ox).toFixed(2)} ${(b[1] + side * oy).toFixed(2)}" stroke="#fff" stroke-width="0.7" stroke-linecap="round" opacity="0.55"/>`;
  };
  /* a joint: a glass bead with its own small specular, lit in the tint when it carries light */
  const bead = (ctx, [x, y], r, tint) => {
    const p = ctx.pal;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${ctx.url('glass')}" stroke="${ctx.url('edge')}" stroke-width="0.9"/>`
      + (tint ? `<circle cx="${x}" cy="${y}" r="${(r * 0.5).toFixed(2)}" fill="${p[tint]}" opacity="${p.dark ? 0.7 : 0.55}"/>` : '')
      + `<circle cx="${(x - r * 0.38).toFixed(2)}" cy="${(y - r * 0.38).toFixed(2)}" r="${(r * 0.3).toFixed(2)}" fill="#fff" opacity="0.85"/>`;
  };
  /* arms by pose: [shoulder, elbow, hand] for each side; wave keeps the left arm standing (the right is the rig's) */
  const SH = [[-13, -40.5], [13, -40.5]];
  const ARMS = {
    stand: [[[-16.5, -30], [-17, -20]], [[16.5, -30], [17, -20]]],
    bow: [[[-14.5, -30.5], [-12.5, -21]], [[14.5, -30.5], [12.5, -21]]],
    carry: [[[-15, -30], [-6, -27.6]], [[15, -30], [6, -27.6]]],
    point: [[[-16.5, -30], [-17, -20]], [[23.5, -39.6], [33.5, -39]]],
    wave: [[[-16.5, -30], [-17, -20]], null]
  };
  const WAVE = { elbow: [20, -50.5], hand: [23, -61] };
  const TORSO = 'M-7 -46 L7 -46 L13 -41 L11 -25 L7 -13 L-7 -13 L-11 -25 L-13 -41 Z';
  const helper = (ctx, item) => {
    const p = ctx.pal, o = item.opts || {}, s = item.s || 1, tint = tints[(o.variant || 0) % 4], pose = ARMS[o.pose] ? o.pose : 'stand';
    const str = o.anchor ? (() => { const dx = (o.anchor[0] - item.x) / s, dy = (o.anchor[1] - item.y) / s; return `<path d="M0 -68 L${dx.toFixed(1)} ${dy.toFixed(1)}" stroke="${p[tint]}" stroke-width="5" opacity="0.14" stroke-linecap="round"/><path d="M0 -68 L${dx.toFixed(1)} ${dy.toFixed(1)}" stroke="${ctx.url('fil')}" stroke-width="1.3" stroke-linecap="round"/><circle cx="0" cy="-68" r="2.2" fill="${p.core}"/>`; })() : '';
    const arm = (side) => { const a = ARMS[pose][side]; if (!a) return ''; const sh = SH[side]; return limb(ctx, sh, a[0], 2.2, tint) + limb(ctx, a[0], a[1], 2, tint) + bead(ctx, a[0], 2.4) + bead(ctx, a[1], 2.7, tint); };
    const waveArm = pose === 'wave' ? `<g class="o55-arm" data-pivot="${SH[1].join(' ')}">${limb(ctx, SH[1], WAVE.elbow, 2.2, tint)}`
      + `<g class="o55-fore" data-pivot="${WAVE.elbow.join(' ')}">${limb(ctx, WAVE.elbow, WAVE.hand, 2, tint)}${bead(ctx, WAVE.hand, 2.7, tint)}<circle class="o55-hook" data-hook="hand" cx="${WAVE.hand[0]}" cy="${WAVE.hand[1]}" r="0.01" fill="none"/></g>`
      + `${bead(ctx, WAVE.elbow, 2.4)}${bead(ctx, SH[1], 3)}</g>` : '';
    const knot = o.rig ? `${glow(ctx, tint, 7, 0, -68.5)}<circle cx="0" cy="-68.5" r="2.2" fill="${p.core}"/>` : '';
    const orb = pose === 'carry' ? `${glow(ctx, 'amber', 14, 0, -28)}<circle cx="0" cy="-28" r="6" ${G(ctx)}/><circle cx="-2" cy="-30" r="1.6" fill="#fff" opacity="0.9"/><circle cx="0" cy="-28" r="2.4" fill="${p.core}"/>` : '';
    const legs = [-1, 1].map((k) => { const hip = [k * 5.5, -13], knee = [k * 6.2, -6.8], ankle = [k * 6.6, -1.6];
      return limb(ctx, hip, knee, 2.5, tint) + limb(ctx, knee, ankle, 2.2, tint) + `<ellipse cx="${k * 7.8}" cy="-0.9" rx="4.4" ry="1.9" ${G(ctx)}/>` + bead(ctx, knee, 2.4); }).join('')
      + bead(ctx, [-5.5, -13], 3, tint) + bead(ctx, [5.5, -13], 3, tint);
    /* the arms and the body above the hips are .o55-up groups, in the drawing's own paint order, so a bow can pitch the
       upper body toward the audience about the hips (66-family-window.js) while the legs stand on their beads; the neck
       bead is an .o55-nk group (it folds away behind the head as the head comes forward); the sphere of the head and the
       knot on it are .o55-hd groups inside them (the eyes an .o55-fc group in the head), so the bow keeps the head round,
       sends it down and tips the eyes toward the floor */
    return `<g>${str}<ellipse cx="0" cy="1" rx="16" ry="3.5" fill="${p.shade}"/><ellipse cx="0" cy="1.4" rx="11" ry="2" fill="${ctx.url('glow-' + tint)}" opacity="0.8"/>`
      + `<g class="o55-up">${arm(0)}${arm(1)}</g>${legs}`
      + `<g class="o55-up"><path d="${TORSO}" ${G(ctx)} stroke-linejoin="round"/>`
      + `<path d="M-4 -43 L4 -43 L8.5 -39.5 L7 -26 L4.5 -16.5 L-4.5 -16.5 L-7 -26 L-8.5 -39.5 Z" fill="none" stroke="#fff" stroke-width="0.6" stroke-linejoin="round" opacity="${p.dark ? 0.28 : 0.45}"/>`
      + `<path d="M-13 -41 L-4 -43 M13 -41 L4 -43 M-11 -25 L-7 -26 M11 -25 L7 -26 M-7 -13 L-4.5 -16.5 M7 -13 L4.5 -16.5" stroke="#fff" stroke-width="0.5" opacity="${p.dark ? 0.22 : 0.4}"/>`
      + `${glow(ctx, tint, 13, 0, -28)}<circle cx="0" cy="-28" r="3.2" fill="${p.core}" class="o55-core"/>`
      + hl('M-10.5 -38.5 L-4 -42.5') + bead(ctx, SH[0], 3) + (pose === 'wave' ? '' : bead(ctx, SH[1], 3)) + waveArm
      + `<g class="o55-nk">${bead(ctx, [0, -45.8], 2.8)}</g>`
      + `<g class="o55-hd"><circle cx="0" cy="-57" r="11.5" ${G(ctx)}/>${hl('M-7 -62 A8 8 0 0 1 2 -65.5')}<path d="M5.5 -50.5 A8.5 8.5 0 0 0 8.6 -55" fill="none" stroke="#fff" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>`
      + `<g class="o55-fc"><circle cx="-3.6" cy="-57" r="1.5" fill="${p.core}"/><circle cx="3.6" cy="-57" r="1.5" fill="${p.core}"/></g></g>${orb}${knot ? `<g class="o55-hd">${knot}</g>` : ''}</g></g>`;
  };

  /* The light that travels along a filament: a short bright streak carried along the curve by transform keyframes
     sampled from the curve itself (position and heading), so the compositor runs it. A dash offset (the first version)
     is repainted by the main thread every frame, which cost a full layerize pass of this very large page each frame on
     a computer without a GPU. In Slint: point-at() and angle-at() on the Path, driven by animation-tick(). */
  function travelling(pts, color) {
    const seg = [];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2;
      for (let k = i === 1 ? 0 : 1; k <= 24; k++) { const t = k / 24, u = 1 - t;
        seg.push([u * u * u * x0 + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * x1, u * u * u * y0 + 3 * u * u * t * y0 + 3 * u * t * t * y1 + t * t * t * y1]); }
    }
    const acc = [0]; for (let i = 1; i < seg.length; i++) acc.push(acc[i - 1] + Math.hypot(seg[i][0] - seg[i - 1][0], seg[i][1] - seg[i - 1][1]));
    const L = acc[acc.length - 1] || 1, at = (s) => { const d = s * L; let i = 1; while (i < acc.length - 1 && acc[i] < d) i++; const f = (d - acc[i - 1]) / ((acc[i] - acc[i - 1]) || 1); return [seg[i - 1][0] + (seg[i][0] - seg[i - 1][0]) * f, seg[i - 1][1] + (seg[i][1] - seg[i - 1][1]) * f, Math.atan2(seg[i][1] - seg[i - 1][1], seg[i][0] - seg[i - 1][0]) * 180 / Math.PI]; };
    const N = 40, frames = [];
    for (let k = 0; k <= N; k++) {
      const s = 0.02 + 0.96 * (k / N), [x, y, a] = at(s), op = k === 0 || k === N ? 0 : 1;
      frames.push(`${(100 * k / N).toFixed(2)}%{transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${a.toFixed(1)}deg);opacity:${op}}`);
    }
    const name = 'o55-trav-' + U.hash(pts.map((q) => q.join(',')).join(';')).toString(36), h = (0.02 * L).toFixed(1);
    return `<style>@keyframes ${name}{${frames.join('')}}</style>`
      + `<path d="M-${h} 0H${h}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" class="o55-pulse o55-trav" style="animation-name:${name}"/>`;
  }

  const props = {
    bar(ctx) {
      const p = ctx.pal;
      return `<g>${glow(ctx, 'lav', 60, 0, 0)}<rect x="-118" y="-6" width="236" height="12" rx="6" ${G(ctx)}/>${hl('M-108 -3 H96')}`
        + `<rect x="-6" y="-42" width="12" height="80" rx="6" ${G(ctx)}/>${hl('M-3 -34 V20')}<circle cx="0" cy="-50" r="7" fill="none" stroke="${ctx.url('edge')}" stroke-width="2.4"/>`
        + [[-100, 0, 'pink'], [100, 0, 'lav'], [0, 30, 'mint']].map(([x, y, c]) => `${glow(ctx, c, 12, x, y)}<circle cx="${x}" cy="${y}" r="3" fill="${p.core}"/>`).join('') + '</g>';
    },
    helper,
    /* the finale's curtain: two tall panes of frosted glass, each lit along the edge where they meet and crossed by a
       broad reflection, slide apart; light blooms softly out of the seam and fades (a gradient, so it has no hard edge:
       the earlier solid white bar, scaled from its left edge, swept across the stage like a glitch) */
    curtain(ctx) {
      const p = ctx.pal, pane = (flip) => {
        const x0 = flip ? 0 : -240, edge = flip ? 1.2 : -1.2, X = (x) => (flip ? x : -x);
        return `<g class="o55-cur o55-cur-${flip ? 'r' : 'l'}"><rect x="${x0}" y="-300" width="240" height="600" fill="${p.dark ? 'rgba(140,150,215,0.34)' : 'rgba(255,255,255,0.62)'}"/>`
          + `<rect x="${x0}" y="-300" width="240" height="600" fill="${ctx.url('glass')}"/>`
          + `<path d="M${X(46)} -300 L${X(132)} 300" stroke="#fff" stroke-width="26" opacity="${p.dark ? 0.06 : 0.16}"/><path d="M${X(84)} -300 L${X(170)} 300" stroke="#fff" stroke-width="5" opacity="${p.dark ? 0.1 : 0.24}"/>`
          + `<path d="M${edge} -300 V300" stroke="#fff" stroke-width="2.2" opacity="0.75"/><path d="M${X(238.5)} -300 V300" stroke="${ctx.url('edge')}" stroke-width="1.5"/></g>`;
      };
      return `<g class="o55-cur-all">${pane(false)}${pane(true)}<rect class="o55-cur o55-cur-flare" x="-40" y="-300" width="80" height="600" fill="${ctx.url('seam')}"/></g>`;
    },
    /* the stage: a thick disc of glass under the spotlight. Its top face holds the light (the ripples run on it), its
       front edge is a band of glass with a lit rim and a few long reflections, and a faint caustic falls in front */
    stage(ctx) {
      const p = ctx.pal, R = 196, r = 30, T = 11;
      const front = `M${-R} -16 A${R} ${r} 0 0 0 ${R} -16 V${-16 + T} A${R} ${r} 0 0 1 ${-R} ${-16 + T} Z`;
      return `<g><path d="M-44 -330 H44 L170 -18 H-170Z" fill="${ctx.url('beam')}" class="o55-beam"/>`
        + `<ellipse cx="0" cy="${-16 + T + 14}" rx="${R * 0.86}" ry="${r * 0.55}" fill="${ctx.url('glow-lav')}" opacity="0.45"/>`
        + `<path d="${front}" fill="${ctx.url('glass')}" stroke="${ctx.url('edge')}" stroke-width="1"/>`
        + [-120, -46, 58, 132].map((x, i) => `<path d="M${x} ${-16 + r * Math.sqrt(1 - (x / R) ** 2) + 2} v${T - 4}" stroke="#fff" stroke-width="${i % 2 ? 1.6 : 3}" stroke-linecap="round" opacity="${p.dark ? 0.12 : 0.3}"/>`).join('')
        + `<ellipse cx="0" cy="-16" rx="${R}" ry="${r}" fill="${ctx.url('floor')}"/><ellipse cx="0" cy="-16" rx="${R}" ry="${r}" fill="none" stroke="${ctx.url('edge')}" stroke-width="1"/>`
        + `<path d="M${-R + 14} -9 A${R} ${r} 0 0 0 ${R - 14} -9" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity="${p.dark ? 0.35 : 0.65}"/>`
        + [0.72, 0.48, 0.26].map((k, i) => `<ellipse cx="0" cy="-16" rx="${R * k}" ry="${r * k}" fill="none" stroke="${p.core}" stroke-opacity="${0.22 - i * 0.05}" stroke-width="1" class="o55-ripple" style="--ri:${i}"/>`).join('') + '</g>';
    },
    computer(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      const screen = o.screen === 'check' ? `<path d="M-12 -36 l8 8 16 -16" fill="none" stroke="${p.core}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="M-30 -48 H2 M-30 -39 H16 M-30 -30 H-6" stroke="${p.core}" stroke-opacity="0.75" stroke-width="2.2" stroke-linecap="round"/>`;
      return `<g>${glow(ctx, 'lav', 70, 0, -34)}<rect x="-48" y="-68" width="96" height="62" rx="9" ${G(ctx)}/><rect x="-41" y="-61" width="82" height="48" rx="6" fill="${ctx.url('screen')}"/>${screen}`
        + hl('M-40 -64 H10') + `<path d="M-58 -6 H58 L64 4 H-64 Z" ${G(ctx)}/>` + (o.label ? label(p, 0, 22, o.label) : '') + '</g>';
    },
    nas(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      let slabs = '';
      for (let i = 0; i < 4; i++) { const y = -84 + i * 20; slabs += `<rect x="${-34 + i}" y="${y}" width="68" height="16" rx="6" ${G(ctx)}/>${hl(`M${-28 + i} ${y + 3} H${10 + i}`)}${glow(ctx, i === 1 && o.busy ? 'amber' : 'mint', 7, 22, y + 8)}<circle cx="22" cy="${y + 8}" r="2" fill="${p.core}" class="o55-led"/>`; }
      return `<g>${glow(ctx, 'pink', 64, 0, -44)}<ellipse cx="0" cy="2" rx="40" ry="5" fill="${p.shade}"/>${slabs}` + label(p, 0, 20, o.label || 'Home NAS') + '</g>';
    },
    key(ctx) {
      const p = ctx.pal;
      return `<g>${glow(ctx, 'amber', 34, -10, 0)}<circle cx="-24" cy="0" r="12" fill="none" stroke="${ctx.url('edge')}" stroke-width="4"/><circle cx="-24" cy="0" r="12" fill="none" stroke="${p.amber}" stroke-width="1.6" opacity="0.8"/>`
        + `<path d="M-12 -3.5 H26 V3.5 H22 V10 H16 V3.5 H12 V8 H6 V3.5 H-12Z" ${G(ctx)}/>${hl('M-10 -1.5 H22')}<circle cx="-24" cy="0" r="3" fill="${p.core}"/></g>`;
    },
    lock(ctx, item) {
      const p = ctx.pal, open = (item.opts || {}).open;
      const shackle = open ? 'M-11 -8 V-22 A11 11 0 0 1 11 -22 V-28' : 'M-11 -8 V-20 A11 11 0 0 1 11 -20 V-8';
      return `<g>${glow(ctx, open ? 'mint' : 'lav', 34, 0, 4)}<path d="${shackle}" fill="none" stroke="${ctx.url('edge')}" stroke-width="4" stroke-linecap="round"/>`
        + `<rect x="-19" y="-10" width="38" height="30" rx="8" ${G(ctx)}/>${hl('M-13 -6 H6')}<circle cx="0" cy="3" r="3.4" fill="${p.core}" class="o55-core"/><path d="M0 5 V11" stroke="${p.core}" stroke-width="2" stroke-linecap="round"/></g>`;
    },
    node(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, tint = o.color || tints[(o.v || 0) % 4];
      return `<g>${glow(ctx, tint, 46, 0, 0)}<circle r="26" ${G(ctx)}/>${hl('M-17 -14 A21 21 0 0 1 2 -23')}`
        + `<g transform="translate(-12 -12)" style="color:${p.dark ? p.core : '#4f3596'}">${A.glyph(o.icon || 'spark', 'currentColor', 1.8)}</g>`
        + (o.label ? label(p, 0, 44, o.label) : '') + (o.sub ? label(p, 0, 57.5, o.sub, 7, p.textDim) : '') + '</g>';
    },
    pathline(ctx, item) {
      const p = ctx.pal, pts = (item.opts || {}).pts || [];
      if (pts.length < 2) return '';
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const mx = (x0 + x1) / 2; d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`; }
      return `<g><path d="${d}" fill="none" stroke="${p.lav}" stroke-width="7" opacity="0.13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${ctx.url('fil')}" stroke-width="1.6" stroke-linecap="round"/>`
        + travelling(pts, p.core) + '</g>';
    },
    cloud(ctx) {
      const d = 'M-38 16 a16 16 0 0 1 -2 -31 a22 22 0 0 1 40 -9 a18 18 0 0 1 36 12 a14 14 0 0 1 -2 28Z';
      return `<g>${glow(ctx, 'lav', 50, 0, 0)}<path d="${d}" ${G(ctx)}/>${hl('M-30 -8 a16 16 0 0 1 14 -14')}</g>`;
    },
    folder(ctx, item) {
      const p = ctx.pal, d = 'M-32 -20 a5 5 0 0 1 5 -5 h16 l6 6 h32 a5 5 0 0 1 5 5 v30 a5 5 0 0 1 -5 5 h-54 a5 5 0 0 1 -5 -5Z';
      return `<g>${glow(ctx, 'amber', 40, 0, 0)}<path d="${d}" ${G(ctx)}/>${hl('M-26 -16 H-14')}` + ((item.opts || {}).label ? label(p, 0, 34, item.opts.label) : '') + '</g>';
    },
    spark(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, c = ['lav', 'pink', 'mint', 'amber'][((o.tone || 0) % 4 + 4) % 4];
      return `<g>${glow(ctx, c, 16)}<path d="M0 -14 V14 M-14 0 H14" stroke="${p.core}" stroke-width="1" stroke-linecap="round" opacity="0.9"/><path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="${p.core}" stroke-width="0.8" opacity="0.6"/><circle r="2.2" fill="${p.core}"/></g>`;
    },
    rings(ctx) {
      const p = ctx.pal;
      return `<g>${[20, 36, 52].map((r, i) => `<circle r="${r}" fill="none" stroke="${p.lav}" stroke-width="1.6" opacity="${0.6 - i * 0.15}" class="o55-ring" style="--ri:${i}"/>`).join('')}</g>`;
    },
    /* a nameplate (the name sign, the ready sign, a plan's notes): a plate of cut glass, its corners chamfered like the
       troupe's torso, with a bevel cut a little inside the edge, light along its top facet and a thin line of the
       accent along its foot; the word is engraved in it (the last text, where a typed letter's fleck leaves from) */
    badge(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, tw = A.textW(o.label || '', 9, FONT, 600, 0.4), w = Math.max(76, tw + (o.glyph ? 40 : 28)), h = 28, c = 5, x = w / 2, y = h / 2, i = 3.2, ci = c - 1.6;
      const plate = (X, Y, C) => `M${-X + C} ${-Y} H${X - C} L${X} ${-Y + C} V${Y - C} L${X - C} ${Y} H${-X + C} L${-X} ${Y - C} V${-Y + C} Z`;
      const tint = o.accent ? 'lav' : 'mint';
      return `<g>${o.accent ? glow(ctx, 'lav', Math.min(70, w * 0.55), 0, 2) : ''}<path d="${plate(x, y, c)}" ${G(ctx)} stroke-linejoin="round"/>`
        /* the face inside the bevel is frosted near-solid, so the word engraved on it reads whatever glows behind the plate */
        + `<path d="${plate(x - i, y - i, ci)}" fill="${p.slip}" stroke="#fff" stroke-width="0.6" stroke-linejoin="round" stroke-opacity="${p.dark ? 0.3 : 0.5}"/>`
        + `<path d="M${-x + c} ${-y} L${-x + i + ci} ${-y + i} M${x - c} ${-y} L${x - i - ci} ${-y + i} M${-x + c} ${y} L${-x + i + ci} ${y - i} M${x - c} ${y} L${x - i - ci} ${y - i}" stroke="#fff" stroke-width="0.5" opacity="${p.dark ? 0.3 : 0.5}"/>`
        + hl(`M${-x + c + 3} ${-y + 1.6} H${x - c - 12}`)
        + `<rect x="${-x + c + 4}" y="${y - 2.4}" width="${w - 2 * c - 8}" height="0.9" fill="${p[tint]}" opacity="${p.dark ? 0.75 : 0.6}"/>`
        + (o.glyph ? `<g transform="translate(${-x + 10} -9) scale(0.75)" style="color:${p.dark ? p.core : '#4f3596'}">${A.glyph(o.glyph, 'currentColor', 2)}</g>` : '')
        + `<text x="${o.glyph ? 9 : 0}" y="3.4" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="9" letter-spacing="0.4" fill="${p.text}">${U.esc(o.label || '')}</text></g>`;
    },
    identity(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      return `<g>${glow(ctx, 'pink', 56, 0, 0)}<rect x="-36" y="-36" width="72" height="72" rx="14" ${G(ctx)}/>${hl('M-28 -30 H10')}`
        + `<g transform="translate(-22 -22)">${A.identitySvg(o.seed || 'nas', 44, 'glass').replace('<svg', '<svg x="0" y="0"')}</g>`
        + (o.words ? label(p, 0, 52, o.words) : '') + '</g>';
    },
    /* a caption: no box. A filament leaves a glass bead on the thing it names, turns at a small lit square and runs on
       as a shelf of light, fading away, that the words stand on (the shelf is a hairline plate, so its gradient has a
       box to span) */
    note(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, dx = o.dx == null ? 60 : o.dx, dy = o.dy == null ? -30 : o.dy, right = dx >= 0, tw = A.textW(o.text || '', 9, FONT, 600, 0.3), w = tw + 14;
      const sy = dy + 5.5, x0 = right ? dx : dx - w, ink = p.dark ? p.core : A.mix(p.lav, p.text, 0.3); /* white light on a dark sky, the deepened tint on a pale one */
      return `<g><path d="M0 0 L${dx} ${sy}" stroke="${p.lav}" stroke-width="3.6" opacity="0.13" stroke-linecap="round"/><path d="M0 0 L${dx} ${sy}" stroke="${ink}" stroke-width="0.9" opacity="0.85" stroke-linecap="round"/>`
        + `<circle r="2.6" ${G(ctx)}/><circle r="1.2" fill="${ink}"/>`
        /* the words on their frosted slip (it covers the words' whole box), the shelf of light along its foot */
        + slip(p, right ? dx + 4 : dx - 4, dy + 2, tw, 9, right ? 'start' : 'end')
        + `<rect x="${x0}" y="${sy + 0.3}" width="${w}" height="1" fill="${ctx.url(right ? 'shelf' : 'shelfR')}"/>`
        + `<rect x="${dx - 1.8}" y="${sy - 1.8 + 0.8}" width="3.6" height="3.6" fill="${ink}" transform="rotate(45 ${dx} ${sy + 0.8})"/>`
        + `<text x="${right ? dx + 4 : dx - 4}" y="${dy + 2}" text-anchor="${right ? 'start' : 'end'}" font-family="${FONT}" font-weight="600" font-size="9" letter-spacing="0.3" fill="${p.text}">${U.esc(o.text || '')}</text></g>`;
    }
  };

  A.defineFamily('glass', {
    palette,
    props,
    /* a marionette string: a soft glow under a bright filament (the rig sets both d's every frame) */
    string: (ctx, d) => `<path class="o55-sp" d="${d}" fill="none" stroke="${ctx.pal.lav}" stroke-width="5" opacity="0.14" stroke-linecap="round"/><path class="o55-sp" d="${d}" fill="none" stroke="${ctx.url('fil')}" stroke-width="1.3" stroke-linecap="round"/>`,
    hand: { wave: WAVE.hand },
    defs(ctx) {
      const p = ctx.pal, u = ctx.uid;
      const rg = (name, color, a) => `<radialGradient id="${u}-glow-${name}"><stop offset="0" stop-color="${color}" stop-opacity="${a}"/><stop offset="0.45" stop-color="${color}" stop-opacity="${a * 0.35}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
      const glowA = p.dark ? 0.55 : 0.5;
      /* light mode: glass takes a violet tint and violet edges so it reads on pastel; dark mode: clear glass, white edges */
      const tint = p.dark ? '#fff' : p.lav;
      return `<linearGradient id="${u}-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${p.g0}"/><stop offset="0.5" stop-color="${tint}" stop-opacity="${p.dark ? p.g1 : 0.16}"/><stop offset="1" stop-color="${tint}" stop-opacity="${p.dark ? p.g2 : 0.22}"/></linearGradient>`
        /* light mode: the edge runs from a white glint into the tint deepened toward the ink, so glass keeps its outline
           on a pale sky (a pure tint edge washed out there) */
        + `<linearGradient id="${u}-edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${p.e0}"/><stop offset="0.55" stop-color="${p.dark ? '#fff' : A.mix(p.lav, p.text, 0.38)}" stop-opacity="${p.dark ? p.e1 : 0.9}"/><stop offset="1" stop-color="${p.dark ? '#fff' : A.mix(p.pink, p.text, 0.32)}" stop-opacity="${p.dark ? p.e0 * 0.6 : 0.85}"/></linearGradient>`
        + `<linearGradient id="${u}-seam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="${p.dark ? 0.8 : 0.95}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
        + `<linearGradient id="${u}-shelf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.dark ? p.core : A.mix(p.lav, p.text, 0.3)}" stop-opacity="0.95"/><stop offset="0.55" stop-color="${p.lav}" stop-opacity="0.55"/><stop offset="1" stop-color="${p.lav}" stop-opacity="0"/></linearGradient>`
        + `<linearGradient id="${u}-shelfR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${p.dark ? p.core : A.mix(p.lav, p.text, 0.3)}" stop-opacity="0.95"/><stop offset="0.55" stop-color="${p.lav}" stop-opacity="0.55"/><stop offset="1" stop-color="${p.lav}" stop-opacity="0"/></linearGradient>`
        + `<linearGradient id="${u}-fil" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.pink}"/><stop offset="1" stop-color="${p.lav}"/></linearGradient>`
        + `<linearGradient id="${u}-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.lav}" stop-opacity="0.55"/><stop offset="1" stop-color="${p.pink}" stop-opacity="0.35"/></linearGradient>`
        + `<linearGradient id="${u}-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${p.dark ? 0.14 : 0.35}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
        + `<radialGradient id="${u}-floor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${p.lav}" stop-opacity="${p.dark ? 0.32 : 0.3}"/><stop offset="1" stop-color="${p.lav}" stop-opacity="0.02"/></radialGradient>`
        + `<linearGradient id="${u}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.bg2}"/><stop offset="1" stop-color="${p.bg}"/></linearGradient>`
        + `<linearGradient id="${u}-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="${p.dark ? 0.08 : 0.22}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
        + rg('lav', p.lav, glowA) + rg('pink', p.pink, glowA) + rg('mint', p.mint, glowA) + rg('amber', p.amber, glowA)
        /* the waves: opaque, lit at the crest and deepening below it, from the back layer (mostly sky) to the front */
        + ['lav', 'pink', 'mint', 'lav', p.dark ? 'pink' : 'amber'].map((c, i) => {
          const depth = p.dark ? 0.72 - i * 0.07 : 0.62 - i * 0.06, lit = A.mix(p[c], '#ffffff', p.dark ? 0.12 : 0.4), deep = A.mix(p[c], p.dark ? p.bg2 : '#ffffff', p.dark ? 0.15 : 0.55);
          return `<linearGradient id="${u}-wv${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${A.mix(lit, p.bg, depth)}"/><stop offset="0.5" stop-color="${A.mix(deep, p.bg, depth + (p.dark ? 0.12 : 0.05))}"/><stop offset="1" stop-color="${A.mix(deep, p.bg2, depth + (p.dark ? 0.2 : 0.1))}"/></linearGradient>`;
        }).join('')
        /* a droplet: clear at the rim, brighter in the middle (the lens gathers the light behind it) */
        + `<radialGradient id="${u}-lens" cx="0.45" cy="0.42" r="0.6"><stop offset="0" stop-color="#fff" stop-opacity="${p.dark ? 0.22 : 0.55}"/><stop offset="0.7" stop-color="#fff" stop-opacity="${p.dark ? 0.06 : 0.2}"/><stop offset="1" stop-color="${tint}" stop-opacity="${p.dark ? 0.14 : 0.28}"/></radialGradient>`;
    },
    /* the ground: the Glass wallpaper's own language (Liquid Glass, Ribbons). A clear night or dawn sky above, where the
       bar and its strings hang, and below it, rising behind the stage, five layered waves of tinted glass, each lit along
       its crest with a fine rim of light and casting a soft shadow on the layer beneath; the back layers are deeper, the
       front ones brighter. The layers are opaque colour (mixed from the look's tokens with the sky), so they stack as
       crisply as the wallpaper and the words in front of them keep their contrast. They swell very slowly sideways, the
       back ones least; a few clear droplets float in the sky, each a small lens. (The earlier aurora blobs and shards
       read as debris.) */
    background(ctx) {
      const p = ctx.pal, W = A.W, H = A.H, f = (v) => v.toFixed(1);
      const crest = (y, amp, ph) => {
        const xs = [-60, 110, 280, 450, 620], ys = xs.map((x, i) => y + amp * Math.sin(ph + i * 1.35));
        let d = `M${xs[0]} ${f(ys[0])}`;
        for (let i = 1; i < xs.length; i++) { const m = (xs[i - 1] + xs[i]) / 2; d += ` C${m} ${f(ys[i - 1])} ${m} ${f(ys[i])} ${xs[i]} ${f(ys[i])}`; }
        return d;
      };
      const layers = [[352, 16, 0.4], [392, 20, 2.1], [430, 14, 4.2], [470, 18, 1.2], [516, 12, 3.3]];
      const waves = layers.map(([y, amp, ph], i) => {
        const top = crest(y, amp, ph);
        return `<g class="o55-amb o55-amb-swell" style="--ambd:${30000 - i * 3500}ms;--sw:${-(8 + i * 5)}px;--ai:${i}">`
          + `<path d="${crest(y + 5, amp, ph)}" fill="none" stroke="#000" stroke-width="10" opacity="${p.dark ? 0.22 : 0.07}"/>`
          + `<path d="${top} V${H + 60} H-60 Z" fill="${ctx.url('wv' + i)}"/>`
          + `<path d="${top}" fill="none" stroke="#fff" stroke-width="1.1" opacity="${p.dark ? 0.34 : 0.85}"/></g>`;
      }).join('');
      const halo = [[70, 120, 200, p.aurora[0]], [430, 70, 170, p.aurora[1]]].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${ctx.url('glow-' + c)}" opacity="0.5"/>`).join('');
      const drops = [[62, 228, 9], [424, 196, 6], [404, 300, 11], [96, 330, 5]].map(([x, y, r], i) => `<g class="o55-amb o55-amb-float" style="--ambd:${6200 + i * 1300}ms;--ai:${i}">`
        + `<circle cx="${x}" cy="${y}" r="${r}" fill="${ctx.url('lens')}" stroke="${ctx.url('edge')}" stroke-width="0.8"/>`
        + `<path d="M${f(x - r * 0.62)} ${f(y - r * 0.2)} A${f(r * 0.66)} ${f(r * 0.66)} 0 0 1 ${f(x - r * 0.1)} ${f(y - r * 0.64)}" fill="none" stroke="#fff" stroke-width="${Math.max(0.8, r * 0.16).toFixed(2)}" stroke-linecap="round" opacity="0.8"/>`
        + `<circle cx="${f(x + r * 0.42)}" cy="${f(y + r * 0.46)}" r="${(r * 0.14).toFixed(2)}" fill="#fff" opacity="0.45"/></g>`).join('');
      return `<rect width="${W}" height="${H}" fill="${ctx.url('sky')}"/>${halo}${drops}${waves}`;
    },
    overlay(ctx) {
      return `<g class="o55-amb o55-amb-sweep"><rect x="-260" y="-40" width="160" height="${A.H + 80}" fill="${ctx.url('sweep')}" transform="rotate(14)"/></g>`;
    }
  });
})();
