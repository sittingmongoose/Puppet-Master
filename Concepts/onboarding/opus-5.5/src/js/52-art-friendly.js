/* Friendly — "the paper puppet theatre". Rounded cut-paper shapes with flat offset shadows, felt helper puppets with
   faces, a scalloped valance and drapes. Motion: springy overshoot, squash and stretch, bobbing idles.
   Dark = a cosy plum-night stage under paper stars; light = a sunny paper stage. */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art, U = O55.util;

  const palette = (mode, tok) => {
    const dark = mode === 'dark';
    return {
      dark,
      wall: dark ? '#2b2436' : '#fdf3e8', wall2: dark ? '#221c2b' : '#f8e7d6', dots: dark ? 'rgba(255,255,255,0.035)' : 'rgba(150,120,201,0.07)',
      floor: dark ? '#6b4637' : '#e7ba8d', floorHi: dark ? '#7d5443' : '#f0c9a0', plank: dark ? 'rgba(0,0,0,0.22)' : 'rgba(150,90,40,0.18)',
      wood: dark ? '#b8805a' : '#d59a68', woodHi: dark ? '#d29b72' : '#eab98a',
      peach: tok.orange, mint: tok.lime, sky: tok.blue, lilac: tok.magenta, sun: dark ? '#f7cf6a' : '#f3b93f',
      cream: dark ? '#f5ead9' : '#ffffff', paper: dark ? '#efe2cf' : '#fffaf3',
      ink: dark ? '#1c1624' : '#4a4550', shadow: dark ? 'rgba(0,0,0,0.34)' : 'rgba(74,69,80,0.15)',
      cheek: dark ? '#ff9db0' : '#ff8fa3', skin: ['#f5cfb4', '#e3aa86', '#b57a55'], hair: ['#6b4a8a', '#3b2a22', '#c0674a'],
      curtain: dark ? '#8a3f6d' : '#e8889f', curtainHi: dark ? '#a4538a' : '#f3a9ba', curtainDk: dark ? '#652d50' : '#cf6c86',
      glow: dark ? 'rgba(255,213,150,0.26)' : 'rgba(255,232,180,0.6)', text: tok.text, textDim: A.rgba(tok.text, 0.65),
      label: dark ? '#f5ead9' : '#4a4550', tones: [tok.orange, tok.lime, tok.blue, tok.magenta]
    };
  };
  const OL = (p, w) => `stroke="${p.ink}" stroke-width="${w || 2}" stroke-linejoin="round" stroke-linecap="round"`;
  /* flat paper shadow: same shape offset down-right */
  const sh = (p, shape) => `<g transform="translate(3 4)" fill="${p.shadow}" stroke="none">${shape}</g>`;
  const label = (p, x, y, s, color) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Poppins, Nunito, system-ui, sans-serif" font-weight="600" font-size="9" fill="${color || p.ink}">${U.esc(s)}</text>`;
  const variants = (p) => [p.peach, p.mint, p.sky, p.lilac];

  const helper = (ctx, item) => {
    const p = ctx.pal, o = item.opts || {}, s = item.s || 1, v = o.variant || 0, pose = o.pose || 'stand';
    const body = variants(p)[v % 4], skin = p.skin[v % 3], hair = p.hair[v % 3];
    const str = o.anchor ? (() => { const dx = (o.anchor[0] - item.x) / s, dy = (o.anchor[1] - item.y) / s; return `<path d="M0 -67 Q${(dx * 0.5 + 3).toFixed(1)} ${(dy * 0.5).toFixed(1)} ${dx.toFixed(1)} ${dy.toFixed(1)}" fill="none" stroke="${p.paper}" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>`; })() : '';
    const arm = (side, a) => { const x = side * 15; const dir = a; return `<g transform="translate(${x} -40) rotate(${dir})"><rect x="-3.5" y="-2" width="7" height="20" rx="3.5" fill="${body}" ${OL(p, 1.8)}/><circle cx="0" cy="19" r="4.2" fill="${skin}" ${OL(p, 1.6)}/></g>`; };
    const angles = { stand: [14, -14], wave: [14, -150], carry: [-38, 38], bow: [4, -4], point: [14, -95] }[pose] || [14, -14];
    const sheet = pose === 'carry' ? `<g transform="translate(0 -26) rotate(-4)"><rect x="-10" y="-8" width="20" height="16" rx="2" fill="${p.paper}" ${OL(p, 1.6)}/><path d="M-6 -3H6M-6 1H3" stroke="${p.lilac}" stroke-width="1.6" stroke-linecap="round"/></g>` : '';
    const figure = `<ellipse cx="-6" cy="-1" rx="6" ry="3.2" fill="${p.ink}"/><ellipse cx="6" cy="-1" rx="6" ry="3.2" fill="${p.ink}"/>`
      + `<path d="M-15 -42 Q-19 -24 -18 -8 Q0 -2 18 -8 Q19 -24 15 -42 Q0 -48 -15 -42Z" fill="${body}" ${OL(p)}/>`
      + `<path d="M-13 -24 Q0 -20 13 -24" fill="none" stroke="${p.ink}" stroke-width="1.4" stroke-linecap="round" opacity="0.35"/>`
      + arm(-1, angles[0]) + arm(1, angles[1])
      + `<path d="M-7 -44 Q0 -39 7 -44" fill="${p.cream}" ${OL(p, 1.6)}/>`
      + `<circle cx="0" cy="-56" r="13" fill="${skin}" ${OL(p)}/>`
      + `<path d="M-11 -62 Q-8 -73 1 -71 Q10 -74 11 -62 Q6 -67 0 -65 Q-6 -67 -11 -62Z" fill="${hair}" ${OL(p, 1.6)}/>`
      + `<ellipse cx="-4.6" cy="-56.5" rx="1.7" ry="2.2" fill="${p.ink}"/><ellipse cx="4.6" cy="-56.5" rx="1.7" ry="2.2" fill="${p.ink}"/>`
      + `<ellipse cx="-8.3" cy="-51.5" rx="2.6" ry="1.6" fill="${p.cheek}" opacity="0.7"/><ellipse cx="8.3" cy="-51.5" rx="2.6" ry="1.6" fill="${p.cheek}" opacity="0.7"/>`
      + `<path d="M-3.4 -50.5 Q0 -47.5 3.4 -50.5" fill="none" stroke="${p.ink}" stroke-width="1.6" stroke-linecap="round"/>` + sheet;
    return `<g>${str}${sh(p, `<path d="M-15 -42 Q-19 -24 -18 -8 Q0 -2 18 -8 Q19 -24 15 -42 Q0 -48 -15 -42Z"/><circle cx="0" cy="-56" r="13"/>`)}${figure}</g>`;
  };

  const scallops = (p, w, y, r, fill) => {
    let d = `M${-w / 2} ${y}`; const n = Math.round(w / (r * 2));
    const step = w / n;
    for (let i = 0; i < n; i++) d += ` a${step / 2} ${r} 0 0 0 ${step} 0`;
    d += ` V${y - 40} H${-w / 2} Z`;
    return `<path d="${d}" fill="${fill}" ${OL(p, 1.8)}/>`;
  };

  const props = {
    bar(ctx) {
      const p = ctx.pal;
      const shape = `<rect x="-116" y="-8" width="232" height="16" rx="8"/><rect x="-8" y="-42" width="16" height="80" rx="8"/>`;
      return `<g>${sh(p, shape)}<rect x="-116" y="-8" width="232" height="16" rx="8" fill="${p.wood}" ${OL(p)}/><rect x="-106" y="-5" width="212" height="4" rx="2" fill="${p.woodHi}" opacity="0.8"/>`
        + `<rect x="-8" y="-42" width="16" height="80" rx="8" fill="${p.wood}" ${OL(p)}/><rect x="-5" y="-36" width="4" height="66" rx="2" fill="${p.woodHi}" opacity="0.8"/>`
        + `<circle cx="0" cy="-50" r="7" fill="none" ${OL(p, 2.4)}/>`
        + [[-100, 0], [100, 0], [0, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${p.sun}" ${OL(p, 1.6)}/>`).join('') + '</g>';
    },
    helper,
    stage(ctx) {
      const p = ctx.pal, w = 200;
      let planks = '';
      for (let i = -5; i <= 5; i++) planks += `M${i * 36} -44 L${i * 40} -6`;
      const lights = [-150, -90, -30, 30, 90, 150].map((x) => `<ellipse cx="${x}" cy="4" rx="9" ry="4" fill="${p.sun}" ${OL(p, 1.4)}/>`).join('');
      return `<g><ellipse cx="0" cy="-26" rx="150" ry="24" fill="${p.glow}"/>${sh(p, `<path d="M${-w} 0 L${-w + 20} -46 H${w - 20} L${w} 0Z"/>`)}`
        + `<path d="M${-w} 0 L${-w + 20} -46 H${w - 20} L${w} 0Z" fill="${p.floor}" ${OL(p)}/><path d="${planks}" stroke="${p.plank}" stroke-width="1.4"/>`
        + `<path d="M${-w + 20} -46 H${w - 20}" stroke="${p.floorHi}" stroke-width="3" opacity="0.7"/>`
        + `<rect x="${-w - 6}" y="-4" width="${w * 2 + 12}" height="18" rx="6" fill="${p.wood}" ${OL(p)}/>${lights}</g>`;
    },
    computer(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      const face = o.screen === 'check' ? `<path d="M-12 -34 l8 8 16 -16" fill="none" stroke="${p.mint}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<circle cx="-8" cy="-38" r="2.4" fill="${p.ink}"/><circle cx="8" cy="-38" r="2.4" fill="${p.ink}"/><path d="M-6 -30 Q0 -25 6 -30" fill="none" stroke="${p.ink}" stroke-width="2" stroke-linecap="round"/>`;
      const shape = `<rect x="-48" y="-68" width="96" height="62" rx="12"/><path d="M-60 -6 H60 Q62 6 50 8 H-50 Q-62 6 -60 -6Z"/>`;
      return `<g>${sh(p, shape)}<rect x="-48" y="-68" width="96" height="62" rx="12" fill="${p.cream}" ${OL(p)}/><rect x="-40" y="-60" width="80" height="46" rx="8" fill="${p.sky}" opacity="0.9"/>${face}`
        + `<path d="M-60 -6 H60 Q62 6 50 8 H-50 Q-62 6 -60 -6Z" fill="${p.lilac}" ${OL(p)}/><rect x="-12" y="-3" width="24" height="5" rx="2.5" fill="${p.cream}" opacity="0.8"/>`
        + (o.label ? label(p, 0, 28, o.label, p.label) : '') + '</g>';
    },
    nas(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      let drawers = '';
      for (let i = 0; i < 4; i++) { const y = -80 + i * 18; drawers += `<rect x="-26" y="${y}" width="52" height="14" rx="5" fill="${p.paper}" ${OL(p, 1.6)}/><rect x="-8" y="${y + 5}" width="16" height="4" rx="2" fill="${p.ink}" opacity="0.7"/><circle cx="18" cy="${y + 7}" r="2.4" class="o55-led" fill="${i === 1 && o.busy ? p.sun : p.mint}"/>`; }
      const shape = `<rect x="-34" y="-90" width="68" height="90" rx="14"/>`;
      return `<g>${sh(p, shape)}<rect x="-34" y="-90" width="68" height="90" rx="14" fill="${p.lilac}" ${OL(p)}/>${drawers}`
        + `<rect x="-26" y="-4" width="10" height="8" rx="3" fill="${p.ink}"/><rect x="16" y="-4" width="10" height="8" rx="3" fill="${p.ink}"/>`
        + label(p, 0, 22, o.label || 'Home NAS', p.label) + '</g>';
    },
    key(ctx) {
      const p = ctx.pal;
      const shape = `<circle cx="-24" cy="0" r="13"/><path d="M-12 -4 H26 V4 H22 V11 H16 V4 H12 V9 H6 V4 H-12Z"/>`;
      return `<g>${sh(p, shape)}<circle cx="-24" cy="0" r="13" fill="${p.sun}" ${OL(p)}/>`
        + `<path d="M-24 4 C-30 -2 -28 -7 -24 -4 C-20 -7 -18 -2 -24 4Z" fill="${p.peach}" ${OL(p, 1.4)}/>`
        + `<path d="M-12 -4 H26 V4 H22 V11 H16 V4 H12 V9 H6 V4 H-12Z" fill="${p.sun}" ${OL(p)}/></g>`;
    },
    lock(ctx, item) {
      const p = ctx.pal, open = (item.opts || {}).open;
      const shackle = open ? 'M-11 -8 V-22 A11 11 0 0 1 11 -22 V-28' : 'M-11 -8 V-20 A11 11 0 0 1 11 -20 V-8';
      return `<g><path d="${shackle}" fill="none" ${OL(p, 5)}/><path d="${shackle}" fill="none" stroke="${p.woodHi}" stroke-width="2" stroke-linecap="round"/>`
        + sh(p, `<rect x="-19" y="-10" width="38" height="30" rx="8"/>`) + `<rect x="-19" y="-10" width="38" height="30" rx="8" fill="${p.peach}" ${OL(p)}/>`
        + `<path d="M0 8 C-6 2 -4 -3 0 0 C4 -3 6 2 0 8Z" fill="${p.ink}"/></g>`;
    },
    node(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, col = o.color ? p[o.color] : variants(p)[(o.v || 0) % 4];
      let d = ''; const n = 12;
      for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, r = i % 2 ? 28 : 31; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }
      return `<g>${sh(p, `<path d="${d}Z"/>`)}<path d="${d}Z" fill="${col}" ${OL(p)}/><circle r="20" fill="${p.paper}" ${OL(p, 1.6)}/>`
        + `<g transform="translate(-12 -12)" style="color:${p.ink}">${A.glyph(o.icon || 'spark', 'currentColor', 2)}</g>`
        + (o.label ? `<g transform="translate(0 47)">${sh(p, `<rect x="${-o.label.length * 3 - 8}" y="-10" width="${o.label.length * 6 + 16}" height="18" rx="9"/>`)}<rect x="${-o.label.length * 3 - 8}" y="-10" width="${o.label.length * 6 + 16}" height="18" rx="9" fill="${p.paper}" ${OL(p, 1.6)}/>${label(p, 0, 3, o.label)}</g>` : '') + '</g>';
    },
    pathline(ctx, item) {
      const p = ctx.pal, pts = (item.opts || {}).pts || [];
      if (pts.length < 2) return '';
      let dots = '';
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / 13));
        for (let k = 1; k < n; k++) { const t = k / n, mx = (x0 + x1) / 2; const x = (1 - t) ** 3 * x0 + 3 * (1 - t) ** 2 * t * mx + 3 * (1 - t) * t * t * mx + t ** 3 * x1; const y = (1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * y0 + 3 * (1 - t) * t * t * y1 + t ** 3 * y1; dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${p.ink}" opacity="0.55" class="o55-dot" style="--k:${i * 10 + k}"/>`; }
      }
      return `<g>${dots}</g>`;
    },
    cloud(ctx) {
      const p = ctx.pal, d = 'M-38 16 a16 16 0 0 1 -2 -31 a22 22 0 0 1 40 -9 a18 18 0 0 1 36 12 a14 14 0 0 1 -2 28Z';
      return `<g>${sh(p, `<path d="${d}"/>`)}<path d="${d}" fill="${p.cream}" ${OL(p)}/></g>`;
    },
    folder(ctx, item) {
      const p = ctx.pal, d = 'M-32 -20 a5 5 0 0 1 5 -5 h16 l6 6 h32 a5 5 0 0 1 5 5 v30 a5 5 0 0 1 -5 5 h-54 a5 5 0 0 1 -5 -5Z';
      return `<g>${sh(p, `<path d="${d}"/>`)}<path d="${d}" fill="${p.sun}" ${OL(p)}/><path d="M-32 -10 H32" stroke="${p.ink}" stroke-width="1.6" opacity="0.4"/>`
        + ((item.opts || {}).label ? label(p, 0, 36, item.opts.label, p.label) : '') + '</g>';
    },
    spark(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, c = o.tone != null ? A.tone(ctx, o.tone) : p.sun;
      return `<path d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z" fill="${c}" ${OL(p, 1.6)}/>`;
    },
    rings(ctx) {
      const p = ctx.pal;
      return `<g>${[20, 36, 52].map((r, i) => `<path d="M${-r * 0.8} ${-r * 0.6} A${r} ${r} 0 0 1 ${r * 0.8} ${-r * 0.6}" fill="none" stroke="${p.lilac}" stroke-width="3" stroke-linecap="round" class="o55-ring" style="--ri:${i}"/>`).join('')}</g>`;
    },
    badge(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, w = Math.max(70, (o.label || '').length * 6.4 + (o.glyph ? 34 : 20));
      return `<g>${sh(p, `<rect x="${-w / 2}" y="-15" width="${w}" height="30" rx="15"/>`)}<rect x="${-w / 2}" y="-15" width="${w}" height="30" rx="15" fill="${o.accent ? p.sun : p.paper}" ${OL(p, 1.8)}/>`
        + (o.glyph ? `<g transform="translate(${-w / 2 + 8} -9) scale(0.75)" style="color:${p.ink}">${A.glyph(o.glyph, 'currentColor', 2.2)}</g>` : '')
        + label(p, o.glyph ? 9 : 0, 3.5, o.label || '') + '</g>';
    },
    identity(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      return `<g>${sh(p, '<rect x="-36" y="-36" width="72" height="72" rx="16"/>')}<rect x="-36" y="-36" width="72" height="72" rx="16" fill="${p.paper}" ${OL(p)}/>`
        + `<g transform="translate(-22 -22)">${A.identitySvg(o.seed || 'nas', 44, 'friendly').replace('<svg', '<svg x="0" y="0"')}</g>`
        + (o.words ? label(p, 0, 52, o.words, p.ink) : '') + '</g>';
    },
    note(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, dx = o.dx == null ? 60 : o.dx, dy = o.dy == null ? -30 : o.dy, w = (o.text || '').length * 5.6 + 18, x = dx >= 0 ? dx : dx - w;
      return `<g><path d="M0 0 Q${(dx * 0.5).toFixed(1)} ${(dy * 0.15).toFixed(1)} ${dx >= 0 ? x : x + w} ${dy}" fill="none" stroke="${p.label}" stroke-width="1.4" stroke-dasharray="2 3" stroke-linecap="round"/>`
        + sh(p, `<rect x="${x}" y="${dy - 10}" width="${w}" height="20" rx="10"/>`) + `<rect x="${x}" y="${dy - 10}" width="${w}" height="20" rx="10" fill="${p.paper}" ${OL(p, 1.6)}/>` + label(p, x + w / 2, dy + 3.5, o.text || '') + '</g>';
    }
  };

  A.defineFamily('friendly', {
    palette,
    props,
    defs(ctx) {
      const p = ctx.pal;
      return `<linearGradient id="${ctx.uid}-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.wall}"/><stop offset="1" stop-color="${p.wall2}"/></linearGradient>`
        + `<pattern id="${ctx.uid}-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.6" fill="${p.dots}"/><circle cx="13" cy="13" r="1.6" fill="${p.dots}"/></pattern>`
        + `<radialGradient id="${ctx.uid}-lamp" cx="0.5" cy="0" r="0.8"><stop offset="0" stop-color="${p.glow}"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>`;
    },
    background(ctx) {
      const p = ctx.pal, W = A.W, H = A.H, frame = ctx.frame !== false;
      const sky = p.dark
        ? `<g class="o55-amb o55-amb-twinkle-all"><path d="M142 92 a20 20 0 1 0 22 26 a15 15 0 1 1 -22 -26Z" fill="${p.sun}" ${OL(p, 1.6)}/>`
          + [[212, 80], [340, 104], [370, 176], [150, 196], [286, 70], [236, 150], [322, 238]].map(([x, y], i) => `<path transform="translate(${x} ${y}) scale(${i % 2 ? 0.55 : 0.8})" d="M0 -8 L2.4 -2.4 L8 0 L2.4 2.4 L0 8 L-2.4 2.4 L-8 0 L-2.4 -2.4Z" fill="${p.sun}" opacity="0.9" class="o55-star" style="--si:${i}"/>`).join('') + '</g>'
        : `<g><circle cx="352" cy="104" r="26" fill="${p.sun}" ${OL(p, 1.8)}/>` + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path transform="translate(352 104) rotate(${a})" d="M0 -34 V-42" stroke="${p.ink}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`).join('')
          + `<path d="M140 122 a12 12 0 0 1 2 -23 a16 16 0 0 1 29 -5 a12 12 0 0 1 21 11 a10 10 0 0 1 -2 17Z" fill="${p.paper}" ${OL(p, 1.6)}/></g>`;
      const drape = (flip) => {
        const X = (x) => (flip ? W - x : x);
        return `<path d="M${X(0)} 0 H${X(104)} C${X(86)} 120 ${X(108)} 250 ${X(80)} ${H * 0.62} C${X(72)} ${H * 0.72} ${X(92)} ${H * 0.86} ${X(84)} ${H} H${X(0)}Z" fill="${p.curtain}" ${OL(p)}/>`
          + `<path d="M${X(66)} 0 C${X(56)} 150 ${X(78)} 300 ${X(62)} ${H}" stroke="${p.curtainHi}" stroke-width="6" fill="none" opacity="0.8"/>`
          + `<path d="M${X(86)} 20 C${X(74)} 160 ${X(94)} 320 ${X(76)} ${H}" stroke="${p.curtainDk}" stroke-width="4" fill="none" opacity="0.75"/>`
          + `<path d="M${X(80)} ${H * 0.62} q${flip ? 16 : -16} 10 ${flip ? 30 : -30} 4" fill="none" stroke="${p.sun}" stroke-width="4" stroke-linecap="round"/>`;
      };
      const drapes = frame ? drape(false) + drape(true)
        + `<g transform="translate(${W / 2} 30)">${scallops(p, W + 20, 0, 13, p.curtain)}</g>`
        + [112, 176, 240, 304, 368].map((x) => `<path d="M${x} 30 v12" stroke="${p.sun}" stroke-width="2.4"/><circle cx="${x}" cy="46" r="4" fill="${p.sun}" ${OL(p, 1.4)}/>`).join('') : '';
      return `<rect width="${W}" height="${H}" fill="${ctx.url('wall')}"/><rect width="${W}" height="${H}" fill="${ctx.url('dots')}"/>${sky}`
        + `<rect width="${W}" height="${H}" fill="${ctx.url('lamp')}"/>${drapes}`;
    },
    overlay() { return ''; }
  });
})();
