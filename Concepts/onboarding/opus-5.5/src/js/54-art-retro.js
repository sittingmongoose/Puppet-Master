/* Retro — "the arcade". Pixel sprites authored as ASCII maps (crispEdges), a starfield under CRT scanlines, terminal
   type. Motion is stepped: hard cuts, stepped translation and blinking cursors, never scaling (canon PWIZ-022).
   Dark = olive-black phosphor (lime, amber); light = cream 80s machine (cobalt, hot pink) with pixel confetti. */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art, U = O55.util;

  const palette = (mode, tok) => {
    const dark = mode === 'dark';
    return dark ? {
      dark, bg: '#0e100b', panel: '#171a14', ink: '#0a0c08', text: '#dfe6cf', dim: '#3c4533', mid: '#5b6a4c',
      a: tok.lime, b: tok.magenta, c: tok.orange, d: tok.blue, skin: '#f0c9a0', hair: '#6b4a2a', wood: '#b0763c', woodHi: '#d69a57',
      screen: '#1f3a1a', glow: 'rgba(134,196,106,0.18)', line: 'rgba(0,0,0,0.28)', vignette: 'rgba(0,0,0,0.55)',
      hw: '#6f7f5d', hw2: '#46523a', tones: [tok.lime, tok.orange, tok.blue, tok.magenta]
    } : {
      dark, bg: '#f5efe3', panel: '#ede3d0', ink: '#1a1a1a', text: '#1a1a1a', dim: '#cfc3ad', mid: '#9d8f76',
      a: tok.blue, b: tok.magenta, c: tok.orange, d: tok.lime, skin: '#f2c49b', hair: '#4a2c1a', wood: '#b87a3e', woodHi: '#dca062',
      screen: '#cfe0f5', glow: 'rgba(0,71,171,0.10)', line: 'rgba(0,0,0,0.05)', vignette: 'rgba(0,0,0,0)',
      hw: '#cfc3ad', hw2: '#9d8f76', tones: [tok.blue, tok.magenta, tok.orange, tok.lime]
    };
  };
  const sprite = A.sprite;
  const mono = (p, x, y, s, size, color, anchor) => `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" font-family="'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace" font-weight="600" font-size="${size || 9}" fill="${color || p.text}">${U.esc(String(s).toUpperCase())}</text>`;

  const HELPER = {
    stand: ['..kkkkkk..', '.khhhhhhk.', '.khsssshk.', '.kskssksk.', '.kssssssk.', '.kssmmssk.', '..kkkkkk..', '.kaaaaaak.', 'kaaaaaaaak', 'saaaaaaaas', '.kaaaaaak.', '.kbbkkbbk.', '.kbk..kbk.', '.kk....kk.'],
    /* waving: the right arm is raised, a sleeve up beside the head with the hand on top; the body keeps its outline */
    wave: ['..kkkkkk..', '.khhhhhhk.', '.khsssshk.', '.kskssksks', '.kssssssks', '.kssmmsska', '..kkkkkk.a', '.kaaaaaaaa', 'kaaaaaaaak', 'saaaaaaaak', '.kaaaaaak.', '.kbbkkbbk.', '.kbk..kbk.', '.kk....kk.'],
    /* the second frame of the wave: the hand comes down to head height, the sleeve shorter */
    wave2: ['..kkkkkk..', '.khhhhhhk.', '.khsssshk.', '.kskssksk.', '.kssssssk.', '.kssmmssks', '..kkkkkk.s', '.kaaaaaaaa', 'kaaaaaaaak', 'saaaaaaaak', '.kaaaaaak.', '.kbbkkbbk.', '.kbk..kbk.', '.kk....kk.'],
    carry: ['..kkkkkk..', '.khhhhhhk.', '.khsssshk.', '.kskssksk.', '.kssssssk.', '.kssmmssk.', '..kkkkkk..', '.kaaaaaak.', 'kawwwwwwak', 'kswkkkkwsk', '.kwwwwwwk.', '.kbbkkbbk.', '.kbk..kbk.', '.kk....kk.']
  };
  const BAR = ['............kkkk............', '...........k....k...........', '............kkkk............', '.............kk.............',
    'kkkkkkkkkkkkkwwkkkkkkkkkkkkk', 'kyywwwwwwwwwwwwwwwwwwwwwwyyk', 'kkkkkkkkkkkkkwwkkkkkkkkkkkkk', '............kwwk............',
    '............kwwk............', '............kwwk............', '............kyyk............', '............kkkk............'];
  const COMPUTER = ['.kkkkkkkkkkkkkkkk.', '.kddddddddddddddk.', '.kdggggggggggggdk.', '.kdgwwwwwggggggdk.', '.kdggggggggwwwgdk.', '.kdgwwwggggggggdk.', '.kdggggggggggggdk.', '.kddddddddddddddk.', 'kkkkkkkkkkkkkkkkkk', 'kppppppppppppppppk', '.kkkkkkkkkkkkkkkk.'];
  const COMPUTER_OK = ['.kkkkkkkkkkkkkkkk.', '.kddddddddddddddk.', '.kdggggggggggggdk.', '.kdggggggggggwgdk.', '.kdgggggggggwggdk.', '.kdgwggggggwgggdk.', '.kdggwggggwggggdk.', '.kdgggwggwgggggdk.', '.kdggggwwggggggdk.', '.kddddddddddddddk.', 'kkkkkkkkkkkkkkkkkk', 'kppppppppppppppppk', '.kkkkkkkkkkkkkkkk.'];
  const NAS = ['.kkkkkkkkkk.', 'kddddddddddk', 'kdkkkkkkkkdk', 'kdkpppppLkdk', 'kdkkkkkkkkdk', 'kdkpppppLkdk', 'kdkkkkkkkkdk', 'kdkpppppLkdk', 'kdkkkkkkkkdk', 'kdkpppppLkdk', 'kdkkkkkkkkdk', 'kddddddddddk', 'kddddddddddk', '.kkkkkkkkkk.', '.kk......kk.'];
  const KEY = ['.kkk............', 'kyyyk...........', 'ky.ykkkkkkkkkkk.', 'kyyyyyyyyyyyyyyk', 'ky.ykkkkkyykkyk.', 'kyyyk.....kk.kk.', '.kkk............'];
  const LOCK = ['...kkkk...', '..k....k..', '.k......k.', '.k......k.', 'kkkkkkkkkk', 'kooooooook', 'koookkoook', 'koookkoook', 'kooookoook', 'kooooooook', 'kkkkkkkkkk'];
  const LOCK_OPEN = ['...kkkk...', '..k....k..', '.k......k.', '.k........', '.k........', 'kkkkkkkkkk', 'kooooooook', 'koookkoook', 'koookkoook', 'kooookoook', 'kooooooook', 'kkkkkkkkkk'];
  const CLOUD = ['......kkkk........', '....kkwwwwkk......', '...kwwwwwwwwkkk...', '.kkwwwwwwwwwwwwk..', 'kwwwwwwwwwwwwwwwk.', 'kwwwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwwwwk', '.kkkkkkkkkkkkkkkk.'];
  const FOLDER = ['kkkkk.........', 'kyyyykkkkkkkk.', 'kyyyyyyyyyyyyk', 'kkkkkkkkkkkkkk', 'kyyyyyyyyyyyyk', 'kyyyyyyyyyyyyk', 'kyyyyyyyyyyyyk', 'kyyyyyyyyyyyyk', 'kkkkkkkkkkkkkk'];
  const STAR = ['..y..', '.yyy.', 'yyyyy', '.yyy.', '..y..'];
  const ICONS = {
    seed: ['.xx...xx.', 'xxxx.xxxx', '.xxx.xxx.', '...xxx...', '....x....', '....x....', '....x....', '..xxxxx..'],
    folder: ['xxxx.....', 'x..xxxxx.', 'x.......x', 'xxxxxxxxx', 'x.......x', 'x.......x', 'xxxxxxxxx'],
    computer: ['xxxxxxxxx', 'x.......x', 'x.xx....x', 'x....xx.x', 'x.......x', 'xxxxxxxxx', '...x.x...', '.xxxxxxx.'],
    person: ['...xxx...', '..x...x..', '..x...x..', '...xxx...', '.........', '..xxxxx..', '.x.....x.', 'x.......x'],
    cloud: ['...xxx...', '..x...xx.', '.x......x', 'x.......x', 'x.......x', '.xxxxxxx.'],
    vault: ['.xxxxxxx.', 'x.......x', 'x.....x.x', 'x....x..x', 'xx.x....x', '.x.x...x.', '..x...x..', '...xxx...'],
    server: ['xxxxxxxxx', 'x.x.....x', 'xxxxxxxxx', '.........', 'xxxxxxxxx', 'x.x.....x', 'xxxxxxxxx'],
    box: ['....x....', '..xx.xx..', 'xx.....xx', 'x.xx.xx.x', 'x...x...x', 'x...x...x', '.xx.x.xx.', '...xxx...'],
    rewind: ['..xxxxx..', '.x.....x.', 'x...x...x', 'x...x...x', 'x...xxx.x', 'x.......x', '.x.....x.', '..xxxxx..'],
    key: ['.xx......', 'x..x.....', 'x..xxxxxx', '.xx...x.x'],
    globe: ['..xxxxx..', '.x..x..x.', 'x..x.x..x', 'xxxxxxxxx', 'x..x.x..x', '.x..x..x.', '..xxxxx..'],
    power: ['.....xx..', '....xx...', '...xx....', '..xxxxx..', '....xx...', '...xx....', '..xx.....'],
    spark: ['....x....', '....x....', '..x.x.x..', '...xxx...', 'xxxxxxxxx', '...xxx...', '..x.x.x..', '....x....', '....x....'],
    history: ['..xxxxx..', '.x.....x.', 'x...x...x', 'x...xx..x', 'x.......x', 'xx.....x.', 'xxx.xxx..'],
    phone: ['.xxxxx.', '.x...x.', '.x...x.', '.x...x.', '.x...x.', '.x.x.x.', '.xxxxx.'],
    check: ['........x', '.......xx', 'x.....xx.', 'xx...xx..', '.xx.xx...', '..xxx....', '...x.....'],
    link: ['...xxxx..', '..x....x.', '.x..xx..x', 'x..x..x..', '..x..x..x', 'x..xx..x.', '.x....x..', '..xxxx...'],
    lock: ['..xxxxx..', '.x.....x.', '.x.....x.', 'xxxxxxxxx', 'x.......x', 'x...x...x', 'x.......x', 'xxxxxxxxx'],
    stack: ['....x....', '..xx.xx..', 'xx.....xx', '..xx.xx..', 'xx..x..xx', '..xx.xx..', 'xx..x..xx', '..xx.xx..', '....x....'],
    plug: ['.x...x.', '.x...x.', 'xxxxxxx', 'x.....x', '.x...x.', '..xxx..', '...x...']
  };
  const bodyColor = (p, v) => [p.a, p.c, p.d, p.b][(v || 0) % 4];
  const dots = (p, x1, y1, x2, y2, color) => {
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 8));
    let out = '';
    for (let i = 0; i <= n; i++) { const t = i / n; out += `<rect x="${Math.round(x1 + (x2 - x1) * t) - 1.5}" y="${Math.round(y1 + (y2 - y1) * t) - 1.5}" width="3" height="3" fill="${color}"/>`; }
    return `<g shape-rendering="crispEdges">${out}</g>`;
  };

  const props = {
    bar(ctx) {
      const p = ctx.pal;
      return sprite(BAR, { k: p.ink === '#0a0c08' ? '#000' : p.ink, w: p.wood, y: { fill: p.c, cls: 'o55-px-blink' } }, 8);
    },
    helper(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, s = item.s || 1;
      const rows = HELPER[o.pose] || HELPER.stand;
      const str = o.anchor ? (() => { const dx = (o.anchor[0] - item.x) / s, dy = (o.anchor[1] - item.y) / s; return dots(p, 0, -14 * (o.px || 5) - 2, dx, dy, p.text); })() : '';
      const map = { k: p.dark ? '#000' : p.ink, h: p.hair, s: p.skin, m: p.b, a: bodyColor(p, o.variant), b: p.dark ? p.mid : p.mid, w: p.dark ? '#f5ecd8' : '#ffffff' };
      const px = o.px || 5;
      /* tied to the bar and waving: two frames the rig swaps on its stepped clock; a pixel knot where the string meets the head */
      const body = o.rig && o.pose === 'wave' ? `<g class="o55-wf">${sprite(rows, map, px)}</g><g class="o55-wf" style="display:none">${sprite(HELPER.wave2, map, px)}</g>` : sprite(rows, map, px);
      const knot = o.rig ? `<rect x="-2" y="${-14 * px - 3}" width="4" height="4" fill="${p.text}" shape-rendering="crispEdges"/>` : '';
      return `<g>${str}<g transform="translate(0 ${-7 * px})">${body}</g>${knot}</g>`;
    },
    /* the finale's curtain: a wall of pixel blocks that steps away from the middle outward */
    curtain(ctx) {
      const p = ctx.pal; let out = '';
      for (let r = 0; r < 15; r++) for (let c = 0; c < 12; c++) {
        const k = Math.max(Math.abs(c - 5.5), Math.abs(r - 7) * 0.8) | 0;
        out += `<rect x="${-240 + c * 40}" y="${-300 + r * 40}" width="40" height="40" fill="${(r + c) % 2 ? p.mid : p.dim}" class="o55-cur o55-cur-px" style="--k:${k}"/>`;
      }
      return `<g class="o55-cur-all" shape-rendering="crispEdges">${out}</g>`;
    },
    stage(ctx) {
      const p = ctx.pal, w = 380, bw = 20, bh = 10;
      let bricks = '';
      for (let row = 0; row < 3; row++) for (let i = 0; i < w / bw; i++) { const x = -w / 2 + i * bw + (row % 2 ? bw / 2 : 0); if (x + bw > w / 2 + bw / 2) continue; bricks += `<rect x="${x}" y="${-row * bh - bh}" width="${bw - 2}" height="${bh - 2}" fill="${row === 2 ? p.c : p.mid}"/>`; }
      return `<g shape-rendering="crispEdges"><rect x="${-w / 2 - 4}" y="${-3 * bh - 4}" width="${w + 8}" height="${3 * bh + 4}" fill="${p.dark ? '#000' : p.ink}"/>${bricks}<rect x="${-w / 2 - 4}" y="${-3 * bh - 8}" width="${w + 8}" height="4" fill="${p.a}"/></g>`;
    },
    computer(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      const map = { k: p.dark ? '#000' : p.ink, d: p.hw, g: p.screen, w: p.a, p: p.hw2 };
      return `<g><g transform="translate(0 -30)">${sprite(o.screen === 'check' ? COMPUTER_OK : COMPUTER, map, 6)}</g>${o.label ? mono(p, 0, 24, o.label, 8) : ''}</g>`;
    },
    nas(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      const map = { k: p.dark ? '#000' : p.ink, d: p.hw, p: p.hw2, L: { fill: p.a, cls: 'o55-px-blink' } };
      return `<g><g transform="translate(0 -45)">${sprite(NAS, map, 6)}</g>${mono(p, 0, 20, o.label || 'home nas', 8)}</g>`;
    },
    key(ctx) {
      const p = ctx.pal;
      return sprite(KEY, { k: p.dark ? '#000' : p.ink, y: p.c }, 4);
    },
    lock(ctx, item) {
      const p = ctx.pal;
      return sprite((item.opts || {}).open ? LOCK_OPEN : LOCK, { k: p.dark ? '#000' : p.ink, o: (item.opts || {}).open ? p.a : p.b }, 4);
    },
    node(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, col = [p.a, p.c, p.d, p.b][(o.v || 0) % 4];
      const icon = ICONS[o.icon] || ICONS.spark;
      return `<g shape-rendering="crispEdges"><rect x="-26" y="-26" width="52" height="52" fill="${p.dark ? '#000' : p.ink}"/><rect x="-22" y="-22" width="44" height="44" fill="${p.panel}"/>`
        + `<rect x="-22" y="-22" width="44" height="4" fill="${col}"/><g class="o55-gl o55-gl-${ICONS[o.icon] ? o.icon : 'spark'}">${sprite(icon, { x: col }, 4, 0, 3)}</g>`
        + (o.label ? mono(p, 0, 42, o.label, 8) : '') + (o.sub ? mono(p, 0, 53, o.sub, 6.5, p.mid) : '') + '</g>';
    },
    pathline(ctx, item) {
      const p = ctx.pal, pts = (item.opts || {}).pts || [];
      let out = '';
      for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; out += dots(p, x0, y0, (x0 + x1) / 2, y0, p.text) + dots(p, (x0 + x1) / 2, y0, (x0 + x1) / 2, y1, p.text) + dots(p, (x0 + x1) / 2, y1, x1, y1, p.text); }
      return `<g class="o55-px-march">${out}</g>`;
    },
    cloud(ctx) {
      const p = ctx.pal;
      return sprite(CLOUD, { k: p.dark ? '#000' : p.ink, w: p.dark ? '#dfe6cf' : '#ffffff' }, 5);
    },
    folder(ctx, item) {
      const p = ctx.pal;
      return `<g>${sprite(FOLDER, { k: p.dark ? '#000' : p.ink, y: p.c }, 5)}${(item.opts || {}).label ? mono(p, 0, 36, item.opts.label, 7.5) : ''}</g>`;
    },
    spark(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, c = o.tone != null ? A.tone(ctx, o.tone) : p.c;
      return `<g class="o55-px-twinkle">${sprite(STAR, { y: c }, 3)}</g>`;
    },
    rings(ctx) {
      const p = ctx.pal;
      return `<g shape-rendering="crispEdges">${[16, 30, 44].map((r, i) => `<rect x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}" fill="none" stroke="${p.a}" stroke-width="3" stroke-dasharray="6 6" class="o55-ring" style="--ri:${i}"/>`).join('')}</g>`;
    },
    badge(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, text = `${o.accent ? '> ' : ''}${o.label || ''}`, w = Math.max(80, text.length * 6.2 + (o.glyph ? 30 : 18));
      return `<g shape-rendering="crispEdges"><rect x="${-w / 2}" y="-14" width="${w}" height="28" fill="${p.dark ? '#000' : p.ink}"/><rect x="${-w / 2 + 3}" y="-11" width="${w - 6}" height="22" fill="${o.accent ? p.a : p.panel}"/>`
        + (o.glyph && ICONS[o.glyph] ? sprite(ICONS[o.glyph], { x: o.accent ? p.ink : p.text }, 2, -w / 2 + 14, 0) : '')
        + mono(p, o.glyph ? 8 : 0, 3.5, text, 8, o.accent ? (p.dark ? '#000' : p.ink) : p.text) + '</g>';
    },
    identity(ctx, item) {
      const p = ctx.pal, o = item.opts || {};
      return `<g shape-rendering="crispEdges"><rect x="-36" y="-36" width="72" height="72" fill="${p.dark ? '#000' : p.ink}"/><rect x="-32" y="-32" width="64" height="64" fill="${p.panel}"/>`
        + `<g transform="translate(-22 -22)">${A.identitySvg(o.seed || 'nas', 44, 'retro').replace('<svg', '<svg x="0" y="0"')}</g>`
        + (o.words ? mono(p, 0, 52, o.words, 7.5) : '') + '</g>';
    },
    note(ctx, item) {
      const p = ctx.pal, o = item.opts || {}, dx = o.dx == null ? 60 : o.dx, dy = o.dy == null ? -30 : o.dy;
      return `<g>${dots(p, 0, 0, dx, dy, p.mid)}${mono(p, dx + (dx >= 0 ? 5 : -5), dy + 3, '> ' + (o.text || ''), 8, p.a, dx >= 0 ? 'start' : 'end')}</g>`;
    }
  };

  A.defineFamily('retro', {
    palette,
    props,
    /* a marionette string: a dotted pixel line on whole pixels (the rig sets its d on each step). It leaves from a
       stud's centre, 12 px inside the bar's outline, so the dots are phased to start right under the outline. */
    string: (ctx, d) => `<path class="o55-sp" d="${d}" fill="none" stroke="${ctx.pal.text}" stroke-width="3" stroke-dasharray="4 4" stroke-dashoffset="4" shape-rendering="crispEdges"/>`,
    icons: ICONS,
    defs(ctx) {
      const p = ctx.pal;
      return `<pattern id="${ctx.uid}-scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="${p.line}"/></pattern>`
        + `<radialGradient id="${ctx.uid}-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="${p.vignette}"/></radialGradient>`;
    },
    background(ctx) {
      const p = ctx.pal, W = A.W, H = A.H, r = U.rng('retro-stars-' + ctx.mode);
      let px = '';
      if (p.dark) {
        for (let i = 0; i < 58; i++) { const x = Math.floor(r() * (W / 4)) * 4, y = Math.floor(r() * (H * 0.7 / 4)) * 4, big = r() > 0.85; px += `<rect x="${x}" y="${y}" width="${big ? 4 : 2}" height="${big ? 4 : 2}" fill="${r() > 0.7 ? p.c : p.text}" opacity="${big ? 0.9 : 0.55}"${big ? ` class="o55-px-twinkle" style="--si:${i % 5}"` : ''}/>`; }
        px += `<rect x="0" y="${H - 16}" width="${W}" height="16" fill="${p.panel}"/><rect x="0" y="${H - 18}" width="${W}" height="2" fill="${p.dim}"/>`;
      } else {
        const shapes = [(x, y, c) => `<rect x="${x}" y="${y}" width="8" height="8" fill="${c}"/><rect x="${x + 8}" y="${y + 8}" width="8" height="8" fill="${c}"/>`,
          (x, y, c) => `<rect x="${x}" y="${y}" width="16" height="4" fill="${c}"/><rect x="${x + 4}" y="${y + 4}" width="8" height="4" fill="${c}"/>`,
          (x, y, c) => `<rect x="${x}" y="${y}" width="4" height="4" fill="${c}"/><rect x="${x + 8}" y="${y}" width="4" height="4" fill="${c}"/><rect x="${x + 4}" y="${y + 4}" width="4" height="4" fill="${c}"/><rect x="${x + 12}" y="${y + 4}" width="4" height="4" fill="${c}"/>`];
        /* confetti stays near the edges so it never collides with the scene's props */
        for (let i = 0; i < 10; i++) { const edge = i % 4, x = edge === 0 ? 60 + Math.floor(r() * 8) * 4 : edge === 1 ? W - 100 + Math.floor(r() * 8) * 4 : Math.floor(r() * 70) * 4 + 64, y = (i % 2 ? 18 + Math.floor(r() * 10) * 4 : H - 96 - Math.floor(r() * 6) * 4); px += shapes[i % 3](x, y, [p.b, p.a, p.c][i % 3]); }
        let dither = '';
        for (let x = 0; x < W; x += 8) dither += `<rect x="${x}" y="${H - 12}" width="4" height="4" fill="${p.dim}"/><rect x="${x + 4}" y="${H - 8}" width="4" height="4" fill="${p.dim}"/>`;
        px += dither + `<rect x="0" y="${H - 4}" width="${W}" height="4" fill="${p.dim}"/>`;
      }
      return `<rect width="${W}" height="${H}" fill="${p.bg}"/><g shape-rendering="crispEdges">${px}</g>`;
    },
    overlay(ctx) {
      return `<rect width="${A.W}" height="${A.H}" fill="${ctx.url('scan')}" pointer-events="none"/><rect width="${A.W}" height="${A.H}" fill="${ctx.url('vig')}" pointer-events="none"/>`;
    }
  });
})();
