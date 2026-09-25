/* Glass — "the light lab". Layered translucent panes, light-filament strings, crystal helpers with inner light,
   a reflective stage under drifting aurora. Gradients only (no blur filters, so it ports to Slint and films at full
   rate). Motion: depth parallax, light sweeps, lens focus pulls, slow float.
   Dark = violet aurora night; light = dawn pastel prism. */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art, U = O55.util;

  const palette = (mode, tok) => {
    const dark = mode === 'dark';
    return {
      dark,
      bg: dark ? '#1f1730' : '#ead7ec', bg2: dark ? '#140e22' : '#dcc2e3',
      lav: tok.blue, pink: tok.magenta, mint: tok.lime, amber: tok.orange,
      text: tok.text, textDim: A.rgba(tok.text, 0.7),
      g0: dark ? 0.34 : 0.78, g1: dark ? 0.07 : 0.34, g2: dark ? 0.02 : 0.14,
      e0: dark ? 0.85 : 1, e1: dark ? 0.18 : 0.55,
      core: dark ? '#ffffff' : '#fffaff', shade: dark ? 'rgba(10,6,20,0.35)' : 'rgba(90,60,120,0.16)',
      tones: [tok.blue, tok.magenta, tok.lime, tok.orange], aurora: dark ? ['lav', 'pink', 'mint'] : ['lav', 'pink', 'amber']
    };
  };
  const G = (ctx) => `fill="${ctx.url('glass')}" stroke="${ctx.url('edge')}" stroke-width="1.2"`;
  const hl = (d) => `<path d="${d}" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.4" stroke-linecap="round"/>`;
  const glow = (ctx, color, r, x, y) => `<circle cx="${x || 0}" cy="${y || 0}" r="${r}" fill="${ctx.url('glow-' + color)}"/>`;
  const label = (p, x, y, s, size) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-weight="600" font-size="${size || 8.5}" letter-spacing="0.4" fill="${p.text}">${U.esc(s)}</text>`;
  const tints = ['lav', 'pink', 'mint', 'amber'];

  const helper = (ctx, item) => {
    const p = ctx.pal, o = item.opts || {}, s = item.s || 1, tint = tints[(o.variant || 0) % 4];
    const str = o.anchor ? (() => { const dx = (o.anchor[0] - item.x) / s, dy = (o.anchor[1] - item.y) / s; return `<path d="M0 -68 L${dx.toFixed(1)} ${dy.toFixed(1)}" stroke="${p[tint]}" stroke-width="5" opacity="0.14" stroke-linecap="round"/><path d="M0 -68 L${dx.toFixed(1)} ${dy.toFixed(1)}" stroke="${ctx.url('fil')}" stroke-width="1.3" stroke-linecap="round"/><circle cx="0" cy="-68" r="2.2" fill="${p.core}"/>`; })() : '';
    const pose = o.pose || 'stand';
    const armR = { wave: '', point: 'M13 -40 L26 -39 L36 -38', carry: 'M13 -40 L9 -30 L3 -27' }[pose] || 'M13 -40 L18 -28 L19 -18';
    /* a waving arm is its own group (the rig lifts it); tied to the bar, a bright knot where the string meets the head */
    const waveArm = pose === 'wave' ? `<g class="o55-arm" data-pivot="13 -40"><path d="M13 -40 L22 -54 L25 -64" fill="none" stroke="${ctx.url('edge')}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`
      + `<path d="M13 -40 L22 -54 L25 -64" fill="none" stroke="${p[tint]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/><circle cx="25" cy="-64" r="2" fill="${p.core}"/><circle class="o55-hook" data-hook="hand" cx="25" cy="-64" r="0.01" fill="none"/></g>` : '';
    const knot = o.rig ? `${glow(ctx, tint, 7, 0, -68.5)}<circle cx="0" cy="-68.5" r="2.2" fill="${p.core}"/>` : '';
    const armL = pose === 'carry' ? 'M-13 -40 L-9 -30 L-3 -27' : 'M-13 -40 L-18 -28 L-19 -18';
    const orb = pose === 'carry' ? `${glow(ctx, 'amber', 14, 0, -28)}<circle cx="0" cy="-28" r="6" ${G(ctx)}/><circle cx="0" cy="-28" r="2.4" fill="${p.core}"/>` : '';
    return `<g>${str}<ellipse cx="0" cy="1" rx="16" ry="3.5" fill="${p.shade}"/>`
      + `<path d="${armL}${armR ? ' M' + armR.slice(1) : ''}" fill="none" stroke="${ctx.url('edge')}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`
      + `<path d="${armL}${armR ? ' M' + armR.slice(1) : ''}" fill="none" stroke="${p[tint]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>` + waveArm
      + `<path d="M-7 -12 L-8 0 M7 -12 L8 0" stroke="${ctx.url('edge')}" stroke-width="4.5" stroke-linecap="round"/>`
      + `<path d="M0 -46 L15 -38 L12 -14 L0 -8 L-12 -14 L-15 -38 Z" ${G(ctx)}/>${glow(ctx, tint, 13, 0, -27)}<circle cx="0" cy="-27" r="3.2" fill="${p.core}" class="o55-core"/>`
      + hl('M-11 -37 L-3 -41') + `<circle cx="0" cy="-57" r="11.5" ${G(ctx)}/>${hl('M-7 -62 A8 8 0 0 1 2 -65.5')}`
      + `<circle cx="-3.6" cy="-57" r="1.4" fill="${p.core}"/><circle cx="3.6" cy="-57" r="1.4" fill="${p.core}"/>${orb}${knot}</g>`;
  };

  const props = {
    bar(ctx) {
      const p = ctx.pal;
      return `<g>${glow(ctx, 'lav', 60, 0, 0)}<rect x="-118" y="-6" width="236" height="12" rx="6" ${G(ctx)}/>${hl('M-108 -3 H96')}`
        + `<rect x="-6" y="-42" width="12" height="80" rx="6" ${G(ctx)}/>${hl('M-3 -34 V20')}<circle cx="0" cy="-50" r="7" fill="none" stroke="${ctx.url('edge')}" stroke-width="2.4"/>`
        + [[-100, 0, 'pink'], [100, 0, 'lav'], [0, 30, 'mint']].map(([x, y, c]) => `${glow(ctx, c, 12, x, y)}<circle cx="${x}" cy="${y}" r="3" fill="${p.core}"/>`).join('') + '</g>';
    },
    helper,
    stage(ctx) {
      const p = ctx.pal;
      return `<g><path d="M-44 -330 H44 L170 -18 H-170Z" fill="${ctx.url('beam')}" class="o55-beam"/>`
        + `<ellipse cx="0" cy="-16" rx="196" ry="30" fill="${ctx.url('floor')}"/><ellipse cx="0" cy="-16" rx="196" ry="30" fill="none" stroke="${ctx.url('edge')}" stroke-width="1"/>`
        + [0.72, 0.48, 0.26].map((k, i) => `<ellipse cx="0" cy="-16" rx="${196 * k}" ry="${30 * k}" fill="none" stroke="${p.core}" stroke-opacity="${0.22 - i * 0.05}" stroke-width="1" class="o55-ripple" style="--ri:${i}"/>`).join('') + '</g>';
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
        + (o.label ? label(p, 0, 44, o.label) : '') + (o.sub ? `<text x="0" y="56" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="7" fill="${p.textDim}">${U.esc(o.sub)}</text>` : '') + '</g>';
    },
    pathline(ctx, item) {
      const p = ctx.pal, pts = (item.opts || {}).pts || [];
      if (pts.length < 2) return '';
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const mx = (x0 + x1) / 2; d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`; }
      return `<g><path d="${d}" fill="none" stroke="${p.lav}" stroke-width="7" opacity="0.13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${ctx.url('fil')}" stroke-width="1.6" stroke-linecap="round"/>`
        + `<path d="${d}" fill="none" stroke="${p.core}" stroke-width="2.6" stroke-linecap="round" pathLength="1" stroke-dasharray="0.04 0.96" class="o55-pulse"/></g>`;
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
    badge(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, w = Math.max(72, (o.label || '').length * 6 + (o.glyph ? 34 : 20));
      return `<g><rect x="${-w / 2}" y="-15" width="${w}" height="30" rx="15" ${G(ctx)}/>` + hl(`M${-w / 2 + 10} -11 H${w / 2 - 20}`)
        + (o.glyph ? `<g transform="translate(${-w / 2 + 9} -9) scale(0.75)" style="color:${p.core}">${A.glyph(o.glyph, 'currentColor', 2)}</g>` : '')
        + label(p, o.glyph ? 9 : 0, 3.5, o.label || '') + '</g>';
    },
    identity(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      return `<g>${glow(ctx, 'pink', 56, 0, 0)}<rect x="-36" y="-36" width="72" height="72" rx="14" ${G(ctx)}/>${hl('M-28 -30 H10')}`
        + `<g transform="translate(-22 -22)">${A.identitySvg(o.seed || 'nas', 44, 'glass').replace('<svg', '<svg x="0" y="0"')}</g>`
        + (o.words ? label(p, 0, 52, o.words) : '') + '</g>';
    },
    note(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, dx = o.dx == null ? 60 : o.dx, dy = o.dy == null ? -30 : o.dy, w = (o.text || '').length * 5.3 + 20, x = dx >= 0 ? dx : dx - w;
      return `<g><path d="M0 0 L${dx >= 0 ? x : x + w} ${dy}" stroke="${ctx.url('fil')}" stroke-width="1.1"/><circle r="2.6" fill="${p.core}"/>`
        + `<rect x="${x}" y="${dy - 10}" width="${w}" height="20" rx="10" ${G(ctx)}/>` + label(p, x + w / 2, dy + 3.2, o.text || '', 8) + '</g>';
    }
  };

  A.defineFamily('glass', {
    palette,
    props,
    /* a marionette string: a soft glow under a bright filament (the rig sets both d's every frame) */
    string: (ctx, d) => `<path class="o55-sp" d="${d}" fill="none" stroke="${ctx.pal.lav}" stroke-width="5" opacity="0.14" stroke-linecap="round"/><path class="o55-sp" d="${d}" fill="none" stroke="${ctx.url('fil')}" stroke-width="1.3" stroke-linecap="round"/>`,
    hand: { wave: [25, -64] },
    defs(ctx) {
      const p = ctx.pal, u = ctx.uid;
      const rg = (name, color, a) => `<radialGradient id="${u}-glow-${name}"><stop offset="0" stop-color="${color}" stop-opacity="${a}"/><stop offset="0.45" stop-color="${color}" stop-opacity="${a * 0.35}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
      const glowA = p.dark ? 0.55 : 0.5;
      /* light mode: glass takes a violet tint and violet edges so it reads on pastel; dark mode: clear glass, white edges */
      const tint = p.dark ? '#fff' : p.lav;
      return `<linearGradient id="${u}-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${p.g0}"/><stop offset="0.5" stop-color="${tint}" stop-opacity="${p.dark ? p.g1 : 0.16}"/><stop offset="1" stop-color="${tint}" stop-opacity="${p.dark ? p.g2 : 0.22}"/></linearGradient>`
        + `<linearGradient id="${u}-edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${p.e0}"/><stop offset="0.55" stop-color="${p.dark ? '#fff' : p.lav}" stop-opacity="${p.dark ? p.e1 : 0.75}"/><stop offset="1" stop-color="${p.dark ? '#fff' : p.pink}" stop-opacity="${p.dark ? p.e0 * 0.6 : 0.7}"/></linearGradient>`
        + `<linearGradient id="${u}-fil" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.pink}"/><stop offset="1" stop-color="${p.lav}"/></linearGradient>`
        + `<linearGradient id="${u}-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.lav}" stop-opacity="0.55"/><stop offset="1" stop-color="${p.pink}" stop-opacity="0.35"/></linearGradient>`
        + `<linearGradient id="${u}-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${p.dark ? 0.14 : 0.35}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
        + `<radialGradient id="${u}-floor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${p.lav}" stop-opacity="${p.dark ? 0.32 : 0.3}"/><stop offset="1" stop-color="${p.lav}" stop-opacity="0.02"/></radialGradient>`
        + `<linearGradient id="${u}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.bg2}"/><stop offset="1" stop-color="${p.bg}"/></linearGradient>`
        + `<linearGradient id="${u}-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="${p.dark ? 0.08 : 0.22}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
        + rg('lav', p.lav, glowA) + rg('pink', p.pink, glowA) + rg('mint', p.mint, glowA) + rg('amber', p.amber, glowA);
    },
    background(ctx) {
      const p = ctx.pal, W = A.W, H = A.H;
      const blobs = [[70, 110, 210, p.aurora[0]], [420, 80, 190, p.aurora[1]], [260, 520, 250, p.aurora[2]]].map(([x, y, r, c], i) => `<g class="o55-amb o55-amb-drift" style="--ambd:${16000 + i * 4000}ms;--ai:${i}"><circle cx="${x}" cy="${y}" r="${r}" fill="${ctx.url('glow-' + c)}" opacity="0.8"/></g>`).join('');
      const r = U.rng('glass-shards');
      let shards = '';
      for (let i = 0; i < 7; i++) {
        const x = 30 + r() * (W - 60), y = 30 + r() * (H * 0.62), s = 6 + r() * 12, a = r() * 180;
        shards += `<g class="o55-amb o55-amb-float" style="--ambd:${5000 + r() * 4000}ms;--ai:${i}"><path transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${a.toFixed(0)})" d="M0 ${-s} L${s * 0.7} 0 L0 ${s} L${-s * 0.5} ${s * 0.2}Z" fill="${ctx.url('glass')}" stroke="${ctx.url('edge')}" stroke-width="0.8" opacity="0.75"/></g>`;
      }
      return `<rect width="${W}" height="${H}" fill="${ctx.url('sky')}"/>${blobs}${shards}`;
    },
    overlay(ctx) {
      return `<g class="o55-amb o55-amb-sweep"><rect x="-260" y="-40" width="160" height="${A.H + 80}" fill="${ctx.url('sweep')}" transform="rotate(14)"/></g>`;
    }
  });
})();
