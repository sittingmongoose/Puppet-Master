/* Basic — "the drafting table". Precise 1.5 px line art on a drafting grid: construction circles, dimension lines,
   registration marks and a title block. Motion: lines draw themselves on (pathLength=1 dash), measured slides.
   Light and dark share every drawing; only the paper and ink change. */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art, U = O55.util;

  const palette = (mode, tok) => {
    const dark = mode === 'dark';
    const ink = tok.blue;
    return {
      dark,
      paper: dark ? A.mix(tok.bg, '#0c2238', 0.42) : A.mix(tok.bg, '#dde7f2', 0.55),
      ink, ink2: A.rgba(ink, dark ? 0.5 : 0.55), faint: A.rgba(ink, dark ? 0.16 : 0.2),
      grid: A.rgba(ink, dark ? 0.06 : 0.08), gridMajor: A.rgba(ink, dark ? 0.12 : 0.15),
      fill: A.rgba(ink, dark ? 0.07 : 0.06), fill2: A.rgba(ink, dark ? 0.14 : 0.12),
      accent: tok.orange, accentFill: A.rgba(tok.orange, 0.14), text: tok.text, dim: A.rgba(tok.text, 0.6),
      tones: [ink, tok.orange, ink, tok.orange]
    };
  };
  /* stroke helpers: every visible line draws on */
  const S = (p, w, color) => `fill="none" stroke="${color || p.ink}" stroke-width="${w || 1.5}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="o55-draw"`;
  const SD = (p, w, color) => `fill="none" stroke="${color || p.ink}" stroke-width="${w || 1.5}" stroke-linecap="round" stroke-linejoin="round" class="o55-fadeline"`;
  const F = (p, fill, w, color) => `fill="${fill}" stroke="${color || p.ink}" stroke-width="${w || 1.5}" stroke-linejoin="round" pathLength="1" class="o55-draw"`;
  const txt = (p, x, y, s, size, anchor, color, extra) => `<text x="${x}" y="${y}" font-size="${size || 7}" letter-spacing="1.1" font-family="Inter, system-ui, sans-serif" font-weight="600" text-anchor="${anchor || 'middle'}" fill="${color || p.ink2}"${extra || ''}>${U.esc(String(s).toUpperCase())}</text>`;
  /* dimension line with end ticks and a centred label */
  const dim = (p, x1, y1, x2, y2, label) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, horiz = Math.abs(y2 - y1) < Math.abs(x2 - x1);
    const tick = (x, y) => (horiz ? `M${x} ${y - 4}V${y + 4}` : `M${x - 4} ${y}H${x + 4}`);
    return `<g class="o55-dim"><path d="M${x1} ${y1}L${x2} ${y2}${tick(x1, y1)}${tick(x2, y2)}" ${S(p, 0.75, p.ink2)}/>`
      + (label ? `<rect x="${mx - label.length * 2.6 - 4}" y="${my - 5}" width="${label.length * 5.2 + 8}" height="10" fill="${p.paper}"/>` + txt(p, mx, my + 2.5, label, 6.5) : '') + '</g>';
  };
  const cross = (p, x, y, r) => `<path d="M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}" ${S(p, 0.7, p.ink2)}/>`;

  const helper = (ctx, item) => {
    const p = ctx.pal, o = item.opts || {}, s = item.s || 1, pose = o.pose || 'stand';
    const arms = {
      stand: 'M-12 -40 L-17 -29 L-18 -19 M12 -40 L17 -29 L18 -19',
      wave: 'M-12 -40 L-17 -29 L-18 -19',
      carry: 'M-12 -40 L-10 -30 L-3 -27 M12 -40 L10 -30 L3 -27',
      bow: 'M-12 -40 L-14 -30 L-12 -21 M12 -40 L14 -30 L12 -21',
      point: 'M-12 -40 L-17 -29 L-18 -19 M12 -40 L23 -37 L33 -36'
    }[pose] || '';
    const joints = [[-12, -40], [12, -40], [-8, -18], [8, -18], [-6, -9], [6, -9]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="${p.paper}" stroke="${p.ink}" stroke-width="1"/>`).join('');
    const str = o.anchor ? (() => { const dx = (o.anchor[0] - item.x) / s, dy = (o.anchor[1] - item.y) / s; return `<path d="M0 -64 L${dx.toFixed(1)} ${dy.toFixed(1)}" ${S(p, 0.8, p.ink2)}/><circle cx="0" cy="-64" r="1.6" fill="${p.ink}"/>`; })() : '';
    /* tied to the bar: a knot where the string meets the head; a waving arm is its own group (the rig lifts it) */
    const knot = o.rig ? `<circle cx="0" cy="-63" r="1.7" fill="${p.ink}"/>` : '';
    const waveArm = pose === 'wave' ? `<g class="o55-arm" data-pivot="12 -40"><path d="M12 -40 L20 -50 L24 -61" ${S(p, 1.4)}/><circle cx="24" cy="-61" r="1.9" fill="${p.paper}" stroke="${p.ink}" stroke-width="1"/><circle class="o55-hook" data-hook="hand" cx="24" cy="-61" r="0.01" fill="none"/></g>` : '';
    const carry = pose === 'carry' ? `<rect x="-9" y="-34" width="18" height="12" rx="1" ${F(p, p.accentFill, 1.2, p.accent)}/><path d="M-5 -30H5M-5 -26.5H2" ${S(p, 0.8, p.accent)}/>` : '';
    return `<g>${str}<circle cx="0" cy="-54" r="9" ${F(p, p.fill, 1.5)}/><path d="M-9 -54H9M0 -63V-45" ${S(p, 0.5, p.faint)}/>`
      + `<path d="M0 -45V-41" ${S(p)}/><path d="M-12 -41 L12 -41 L8 -18 L-8 -18 Z" ${F(p, p.fill, 1.5)}/>`
      + `<path d="${arms}" ${S(p, 1.4)}/><path d="M-8 -18 L-6 -9 L-7 0 M8 -18 L6 -9 L7 0" ${S(p, 1.4)}/>`
      + `<path d="M-11 0H-3M3 0H11" ${S(p, 1.4)}/>${joints}${waveArm}${carry}${knot}</g>`;
  };

  const props = {
    bar(ctx) {
      const p = ctx.pal;
      return `<g><circle cx="0" cy="0" r="58" ${SD(p, 0.6, p.faint)} stroke-dasharray="3 4"/>`
        + `<rect x="-112" y="-5" width="224" height="10" rx="3" ${F(p, p.fill2)}/><rect x="-5" y="-40" width="10" height="74" rx="3" ${F(p, p.fill2)}/>`
        + `<circle cx="0" cy="-48" r="6.5" ${S(p)}/><path d="M-104 0H-96M96 0H104" ${S(p, 0.6, p.ink2)}/>`
        + [[-100, 0], [100, 0], [0, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${p.ink}"/>`).join('')
        + dim(p, -112, -64, 112, -64, 'control · 224') + cross(p, 0, 0, 6) + '</g>';
    },
    helper,
    stage(ctx) {
      const p = ctx.pal, w = 170, back = 120, h = 48;
      let lines = '';
      for (let i = -4; i <= 4; i++) lines += `M${(i * w) / 4} 0L${(i * back) / 4} ${-h}`;
      for (let j = 1; j < 4; j++) { const t = j / 4, y = -h * t, hw = w + (back - w) * t; lines += `M${-hw} ${y}H${hw}`; }
      return `<g><path d="M${-w} 0L${-back} ${-h}H${back}L${w} 0Z" ${F(p, p.fill, 1.5)}/><path d="${lines}" ${S(p, 0.6, p.faint)}/>`
        + `<path d="M${-w - 8} 0H${w + 8}" ${S(p, 2)}/>` + dim(p, -w, 16, w, 16, 'stage') + '</g>';
    },
    computer(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      const screen = o.screen === 'check' ? `<path d="M-12 -30l8 8 16-16" ${S(p, 2, p.accent)}/>` : `<path d="M-28 -42H4M-28 -34H18M-28 -26H-6" ${S(p, 1, p.ink2)}/>`;
      return `<g><rect x="-44" y="-62" width="88" height="56" rx="4" ${F(p, p.fill)}/><rect x="-38" y="-56" width="76" height="44" rx="2" ${S(p, 0.8, p.ink2)}/>${screen}`
        + `<path d="M-54 -6H54L60 4H-60Z" ${F(p, p.fill2)}/><path d="M-10 -1H10" ${S(p, 0.8)}/>` + dim(p, -60, 16, 60, 16, o.label || 'this computer') + '</g>';
    },
    nas(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      let bays = '';
      for (let i = 0; i < 4; i++) { const y = -76 + i * 17; bays += `<rect x="-24" y="${y}" width="48" height="12" rx="1.5" ${S(p, 1)}/><path d="M-18 ${y + 6}H4" ${S(p, 0.6, p.ink2)}/><circle cx="16" cy="${y + 6}" r="2" class="o55-led" fill="${i === 1 && o.busy ? p.accent : p.ink}"/>`; }
      return `<g><rect x="-32" y="-84" width="64" height="84" rx="3" ${F(p, p.fill)}/>${bays}`
        + `<path d="M-26 0V4M26 0V4" ${S(p, 1.5)}/>` + txt(p, 0, 14, o.label || 'home nas', 6.5) + '</g>';
    },
    key(ctx, item) {
      const p = ctx.pal, c = (item.opts || {}).accent ? p.accent : p.ink;
      return `<g><circle cx="-24" cy="0" r="11" ${F(p, (item.opts || {}).accent ? p.accentFill : p.fill, 1.6, c)}/><circle cx="-24" cy="0" r="4" ${S(p, 1.2, c)}/>`
        + `<path d="M-13 -3H26V3H22V9H17V3H13V7H9V3H-13Z" ${F(p, (item.opts || {}).accent ? p.accentFill : p.fill, 1.4, c)}/></g>`;
    },
    lock(ctx, item) {
      const p = ctx.pal, open = (item.opts || {}).open;
      return `<g><path d="${open ? 'M-10 -8V-22a10 10 0 0 1 20 0V-26' : 'M-10 -8V-20a10 10 0 0 1 20 0V-8'}" ${S(p, 2)}/>`
        + `<rect x="-17" y="-9" width="34" height="27" rx="3" ${F(p, p.fill2, 1.6)}/><circle cx="0" cy="2" r="3" fill="${p.ink}"/><path d="M0 4V10" ${S(p, 1.6)}/></g>`;
    },
    node(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      const ticks = [0, 90, 180, 270].map((a) => { const r = (a * Math.PI) / 180; return `M${(Math.cos(r) * 30).toFixed(1)} ${(Math.sin(r) * 30).toFixed(1)}L${(Math.cos(r) * 35).toFixed(1)} ${(Math.sin(r) * 35).toFixed(1)}`; }).join('');
      const on = o.state === 'on' || o.accent;
      return `<g><circle r="26" ${F(p, on ? p.accentFill : p.fill, 1.5, on ? p.accent : p.ink)}/><path d="${ticks}" ${S(p, 0.8, p.ink2)}/>`
        + `<g transform="translate(-12 -12)" class="o55-draw-g" style="color:${on ? p.accent : p.ink}">${A.glyph(o.icon || 'spark', 'currentColor', 1.6)}</g>`
        + (o.label ? txt(p, 0, 46, o.label, 7, 'middle', p.ink) : '') + (o.sub ? txt(p, 0, 57, o.sub, 5.8, 'middle', p.ink2) : '') + '</g>';
    },
    pathline(ctx, item) {
      const p = ctx.pal, pts = (item.opts || {}).pts || [];
      if (pts.length < 2) return '';
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const mx = (x0 + x1) / 2; d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`; }
      const heads = pts.slice(1).map(([x, y], i) => { const [px, py] = pts[i]; const mx = (px + x) / 2, my = (py + y) / 2; return `<path d="M${mx - 4} ${my - 4}L${mx + 1} ${my}L${mx - 4} ${my + 4}" ${S(p, 1.2)}/>`; }).join('');
      return `<g><path d="${d}" ${SD(p, 1.2)} stroke-dasharray="4 3"/>${heads}</g>`;
    },
    cloud(ctx) {
      const p = ctx.pal;
      return `<g><path d="M-34 14a18 18 0 0 1-2-35.8A26 26 0 0 1 16-26a20 20 0 0 1 18 40Z" ${F(p, p.fill)}/><path d="M-20 4H20M-12 -6H12" ${S(p, 0.7, p.ink2)}/></g>`;
    },
    folder(ctx, item) {
      const p = ctx.pal;
      return `<g><path d="M-30 -18a3 3 0 0 1 3-3h16l5 5h33a3 3 0 0 1 3 3v31a3 3 0 0 1-3 3h-54a3 3 0 0 1-3-3Z" ${F(p, p.fill)}/><path d="M-30 -9H30" ${S(p, 0.8, p.ink2)}/>`
        + ((item.opts || {}).label ? txt(p, 0, 34, item.opts.label, 6.5) : '') + '</g>';
    },
    spark(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, c = o.tone != null ? A.tone(ctx, o.tone) : o.accent ? p.accent : p.ink2;
      return `<g><path d="M0 -9V-3M0 3V9M-9 0H-3M3 0H9" ${S(p, 1, c)}/><circle r="1.6" fill="${c}"/></g>`;
    },
    rings(ctx) {
      const p = ctx.pal;
      return `<g>${[18, 34, 50].map((r, i) => `<circle r="${r}" ${S(p, 0.8, p.ink2)} class="o55-draw o55-ring" style="--ri:${i}"/>`).join('')}</g>`;
    },
    badge(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      return `<g><rect x="-44" y="-15" width="88" height="30" rx="3" fill="${p.paper}" stroke="${o.accent ? p.accent : p.ink}" stroke-width="1.2"/>`
        + (o.glyph ? `<g transform="translate(-38 -9) scale(0.75)" style="color:${o.accent ? p.accent : p.ink}">${A.glyph(o.glyph)}</g>` : '')
        + txt(p, o.glyph ? 6 : 0, 3, o.label || '', 6.8, 'middle', o.accent ? p.accent : p.ink) + '</g>';
    },
    identity(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      return `<g><rect x="-32" y="-32" width="64" height="64" rx="2" fill="${p.paper}" stroke="${p.ink}" stroke-width="1.2"/>`
        + `<g transform="translate(-22 -22)" style="color:${p.ink}">${A.identitySvg(o.seed || 'nas', 44, 'basic').replace('<svg', '<svg x="0" y="0"')}</g>`
        + (o.words ? txt(p, 0, 46, o.words, 6.2, 'middle', p.ink) : '') + '</g>';
    },
    note(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, dx = o.dx == null ? 60 : o.dx, dy = o.dy == null ? -30 : o.dy;
      return `<g><circle r="2.3" fill="${p.accent}"/><path d="M0 0 L${(dx * 0.55).toFixed(1)} ${dy} L${dx} ${dy}" ${S(p, 0.8, p.ink2)}/>`
        + txt(p, dx + (dx >= 0 ? 6 : -6), dy + 2.5, o.text || '', 7, dx >= 0 ? 'start' : 'end', p.ink) + '</g>';
    },
    dimv(ctx, item) { const o = item.opts || {}; return dim(ctx.pal, 0, 0, 0, o.h || 200, o.label || ''); }
  };

  A.defineFamily('basic', {
    palette,
    props,
    /* a marionette string: a fine ink line (the rig sets its d every frame) */
    string: (ctx, d) => `<path class="o55-sp" d="${d}" fill="none" stroke="${ctx.pal.ink2}" stroke-width="0.8" stroke-linecap="round"/>`,
    hand: { wave: [24, -61] },
    defs(ctx) {
      const p = ctx.pal;
      return `<pattern id="${ctx.uid}-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${p.grid}" stroke-width="0.6"/></pattern>`
        + `<pattern id="${ctx.uid}-gridM" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="${p.gridMajor}" stroke-width="0.9"/></pattern>`;
    },
    background(ctx) {
      const p = ctx.pal, W = A.W, H = A.H;
      const reg = [[64, 24], [W - 64, 24], [64, H - 24], [W - 64, H - 24]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="${p.ink2}" stroke-width="0.7"/><path d="M${x - 9} ${y}H${x + 9}M${x} ${y - 9}V${y + 9}" stroke="${p.ink2}" stroke-width="0.7"/>`).join('');
      const sheet = (ctx.sceneLabel || ctx.sceneId || '').replace(/-/g, ' ');
      return `<rect width="${W}" height="${H}" fill="${p.paper}"/><rect width="${W}" height="${H}" fill="${ctx.url('grid')}"/><rect width="${W}" height="${H}" fill="${ctx.url('gridM')}"/>`
        + reg + `<g transform="translate(${W - 178} ${H - 46})"><rect width="124" height="28" fill="${p.paper}" stroke="${p.ink2}" stroke-width="0.8"/><path d="M0 12H124M78 12V28" stroke="${p.faint}" stroke-width="0.8"/>`
        + txt(p, 6, 9, 'puppet master', 6, 'start') + txt(p, 6, 23, sheet, 5.6, 'start') + txt(p, 84, 23, 'sheet 1:1', 5.6, 'start') + '</g>';
    },
    overlay() { return ''; }
  });
})();
