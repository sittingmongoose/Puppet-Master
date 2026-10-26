/* Puppet Master logo system (Opus 5.5 concept).
   One generator for every asset: static marks (glyph, app tile, tray template), the three
   size tiers, Pip's moods, and the animated loaders. It returns SVG strings and touches no
   DOM, so the gallery, the download buttons and any later export script share one source. */
(function (G) {
  'use strict';

  /* ---------------------------------------------------------------- themes */
  // Colours come from PMConcept7's own tokens (accent, text, muted, surface) so the mark
  // sits inside each theme rather than on top of it.
  const THEMES = {
    'friendly-dark': {
      label: 'Friendly Dark', family: 'friendly', scheme: 'dark',
      bg: '#211E26', bar: '#2A2731', text: '#F0EDF4', muted: '#8A8494', line: 'rgba(240,237,244,.10)', accent: '#6FC6E8',
      ctl: '#C3B1E4', str: '#8A8494', head: '#6FC6E8', cheek: '#FFB4A6', letter: '#F0EDF4',
      tile: { kind: 'soft', stops: ['#3B3647', '#24212B'], glow: 'rgba(111,198,232,.22)', edge: 'rgba(255,255,255,.09)' },
      font: "'Poppins', system-ui, sans-serif", weight: 600, track: '0'
    },
    'friendly-light': {
      label: 'Friendly Light', family: 'friendly', scheme: 'light',
      bg: '#FBF7F3', bar: '#FFFFFF', text: '#4A4550', muted: '#9A93A0', line: '#E4DCEA', accent: '#3F9CC7',
      ctl: '#9678C9', str: '#B3ABBC', head: '#3F9CC7', cheek: '#FFA68C', letter: '#4A4550',
      tile: { kind: 'soft', stops: ['#FFFFFF', '#F1EAF4'], glow: 'rgba(90,185,224,.20)', edge: 'rgba(122,109,140,.16)' },
      font: "'Poppins', system-ui, sans-serif", weight: 600, track: '0'
    },
    'glass-dark': {
      label: 'Glass Dark', family: 'glass', scheme: 'dark',
      bg: '#241B36', bar: 'rgba(46,34,72,.62)', text: '#EDE7F8', muted: 'rgba(237,231,248,.55)', line: 'rgba(255,255,255,.14)', accent: '#B79CFF',
      ctl: '#F1EBFF', str: 'rgba(237,231,248,.50)', head: ['#DCCBFF', '#9C7FF2'], cheek: '#F7A1CC', letter: '#EDE7F8', gloss: true,
      tile: { kind: 'glass', stops: ['#5D4794', '#2A2046'], glow: 'rgba(229,139,200,.28)', edge: 'rgba(255,255,255,.42)' },
      font: "'Inter', system-ui, sans-serif", weight: 680, track: '-.02em'
    },
    'glass-light': {
      label: 'Glass Light', family: 'glass', scheme: 'light',
      bg: '#E4CDE4', bar: 'rgba(246,240,255,.62)', text: '#453A5C', muted: 'rgba(69,58,92,.55)', line: 'rgba(69,58,92,.16)', accent: '#8B6ED9',
      ctl: '#B65FA9', str: 'rgba(69,58,92,.34)', head: ['#AE93F4', '#7556D3'], cheek: '#F7A1CC', letter: '#453A5C', gloss: true,
      tile: { kind: 'glass', stops: ['#FFFFFF', '#E6D3F0'], glow: 'rgba(139,110,217,.22)', edge: 'rgba(255,255,255,.95)' },
      font: "'Inter', system-ui, sans-serif", weight: 680, track: '-.02em'
    },
    'basic-dark': {
      label: 'Basic Dark', family: 'basic', scheme: 'dark',
      bg: '#121212', bar: '#1E1E1E', text: '#E8E8E8', muted: '#6B7280', line: '#424242', accent: '#64B5F6',
      ctl: '#E8E8E8', str: '#7A8290', head: '#64B5F6', cheek: null, letter: '#E8E8E8',
      tile: { kind: 'flat', stops: ['#2D2D2D', '#2D2D2D'], edge: 'rgba(255,255,255,.08)' },
      font: "'Inter', system-ui, sans-serif", weight: 700, track: '.01em'
    },
    'basic-light': {
      label: 'Basic Light', family: 'basic', scheme: 'light',
      bg: '#EAECEF', bar: '#EAECEF', text: '#1A1A1A', muted: '#5C6470', line: '#C4C4C4', accent: '#0056B3',
      ctl: '#2B2B2B', str: '#8A929C', head: '#0056B3', cheek: null, letter: '#1A1A1A',
      tile: { kind: 'flat', stops: ['#FFFFFF', '#FFFFFF'], edge: '#C9CDD3' },
      font: "'Inter', system-ui, sans-serif", weight: 700, track: '.01em'
    },
    'retro-dark': {
      label: 'Retro Dark', family: 'retro', scheme: 'dark', pixel: true,
      bg: '#10120E', bar: '#171A14', text: '#DFE6CF', muted: '#7C866B', line: '#4A533A', accent: '#86C46A',
      ctl: '#DFE6CF', str: '#7C866B', head: '#86C46A', cheek: '#E9853F', letter: '#86C46A',
      tile: { kind: 'retro', stops: ['#1E2219', '#1E2219'], edge: '#4A533A', shadow: 'rgba(224,224,224,.55)' },
      font: "'IBM Plex Mono', ui-monospace, monospace", weight: 700, track: '0'
    },
    'retro-light': {
      label: 'Retro Light', family: 'retro', scheme: 'light', pixel: true,
      bg: '#F5F0E8', bar: '#F5F0E8', text: '#1A1A1A', muted: '#524F49', line: '#4A463F', accent: '#0047AB',
      ctl: '#1A1A1A', str: '#6A665E', head: '#0047AB', cheek: '#FF1493', letter: '#0047AB',
      tile: { kind: 'retro', stops: ['#FAF7F2', '#FAF7F2'], edge: '#1A1A1A', shadow: '#1A1A1A' },
      font: "'IBM Plex Mono', ui-monospace, monospace", weight: 700, track: '0'
    },
    'nier-light': {
      label: 'NieR Light', family: 'nier', scheme: 'light', square: true, noMotion: true, flatCtl: true,
      bg: '#CCC8B1', bar: '#C6C2AB', text: '#211F1B', muted: '#4F4C43', line: '#A29E89', accent: '#211F1B',
      ctl: '#211F1B', str: 'rgba(33,31,27,.62)', head: '#211F1B', cheek: null, letter: '#211F1B',
      tile: { kind: 'nier', stops: ['#D1CDB7', '#C6C2AB'], edge: '#211F1B' },
      font: "'PM NieR Sans', 'Inter', system-ui, sans-serif", weight: 500, track: '.14em', upper: true
    },
    'nier-dark': {
      label: 'NieR Dark', family: 'nier', scheme: 'dark', square: true, noMotion: true, flatCtl: true,
      bg: '#2F2D26', bar: '#36342C', text: '#D1CDB7', muted: '#A29E89', line: '#4F4D45', accent: '#D1CDB7',
      ctl: '#D1CDB7', str: 'rgba(209,205,183,.6)', head: '#D1CDB7', cheek: null, letter: '#D1CDB7',
      tile: { kind: 'nier', stops: ['#36342C', '#2B2922'], edge: '#D1CDB7' },
      font: "'PM NieR Sans', 'Inter', system-ui, sans-serif", weight: 500, track: '.14em', upper: true
    }
  };
  const THEME_ORDER = ['friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'basic-dark', 'basic-light', 'retro-dark', 'retro-light', 'nier-light', 'nier-dark'];

  // Each family moves the way its theme already moves in PMConcept7 (--ease-default / --motion-med).
  const MOTION = {
    friendly: { dur: 1.7, ease: 'cubic-bezier(.45,0,.25,1.25)', amp: 1 },
    glass: { dur: 2.4, ease: 'cubic-bezier(.37,0,.63,1)', amp: .85 },
    basic: { dur: 1.6, ease: 'ease-in-out', amp: .7 },
    retro: { dur: 1.2, ease: 'steps(1,end)', amp: 1 }
  };

  /* --------------------------------------------------------------- helpers */
  const R = (v) => +(+v).toFixed(2);
  const D2R = Math.PI / 180;
  let seq = 0;
  const nextId = () => 'pm' + (++seq).toString(36);
  function stick(cx, cy, len, deg) {
    const dx = len / 2 * Math.cos(deg * D2R), dy = len / 2 * Math.sin(deg * D2R);
    return [cx - dx, cy - dy, cx + dx, cy + dy];
  }
  const line = (s, w, c, cap) => `<line x1="${R(s[0])}" y1="${R(s[1])}" x2="${R(s[2])}" y2="${R(s[3])}" stroke="${c}" stroke-width="${R(w)}" stroke-linecap="${cap || 'round'}"/>`;
  function mix(a, b, t) {
    const h = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
    const A = h(a), B = h(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  function paint(id, spec, x1, y1, x2, y2) {
    // A colour or a two-stop gradient; returns [defs, fill].
    if (!Array.isArray(spec)) return ['', spec];
    const g = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${spec[0]}"/><stop offset="1" stop-color="${spec[1]}"/></linearGradient>`;
    return [g, `url(#${id})`];
  }

  /* ------------------------------------------------------------ tier logic */
  // micro: hand-placed pixels for 20 device px and below (tray, favicons, inline spinners)
  // small: the vector drawing with heavier strokes and fewer details (title bar at 1x)
  // full:  every detail (app icon, splash, title bar at 2x)
  function pickTier(o, th) {
    const dev = (o.px || 24) * (o.dpr || 1) * (o.form === 'tile' ? .68 : 1);
    o._dev = dev;
    if (o.tier && o.tier !== 'auto') return o.tier;
    if (th.pixel) return dev <= 18 ? 'micro' : 'pixel';
    return dev <= 18 ? 'micro' : dev <= 40 ? 'small' : 'full';
  }

  /* ------------------------------------------------------------ pixel art */
  // Pip as sprites on 16, 24 and 32 px grids: crisp tray and favicon sizes, and the native look
  // of the Retro themes at every size. Layers: sticks (c front, b back), strings, head (h), and
  // face stamps punched out of the head as [x, y, w, h] holes. Right eyes mirror the left ones.
  const SPRITES = {
    16: {
      sticks: [
        '................',
        '..cccccccccccc..',
        '..cccccccccccc..',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
      ],
      head: [
        '................',
        '................',
        '................',
        '................',
        '................',
        '...hhhhhhhhhh...',
        '..hhhhhhhhhhhh..',
        '..hhhhhhhhhhhh..',
        '..hhhhhhhhhhhh..',
        '.hhhhhhhhhhhhhh.',
        '.hhhhhhhhhhhhhh.',
        '..hhhhhhhhhhhh..',
        '..hhhhhhhhhhhh..',
        '..hhhhhhhhhhhh..',
        '...hhhhhhhhhh...',
        '................'
      ],
      strings: { cols: [4, 11], from: 3, to: 5 },
      faces: {
        idle: { eye: [[5, 7, 2, 3]], mouth: [[6, 11, 1, 1], [9, 11, 1, 1], [7, 12, 2, 1]] },
        happy: { eye: [[5, 8, 1, 1], [4, 9, 1, 1], [6, 9, 1, 1]], mouth: [[5, 11, 1, 1], [10, 11, 1, 1], [6, 12, 4, 1]] },
        alert: { eye: [[4, 7, 3, 3]], mouth: [[7, 11, 2, 2]] },
        error: { eye: [[4, 7, 1, 1], [6, 7, 1, 1], [5, 8, 1, 1], [4, 9, 1, 1], [6, 9, 1, 1]], mouth: [[6, 11, 4, 1]] },
        sleep: { eye: [[4, 9, 3, 1]], mouth: [[7, 11, 2, 1]] },
        think: { eye: [[6, 7, 2, 2]], eyeR: [[10, 7, 2, 2]], mouth: [[7, 11, 4, 1]] },
        dots: { mouth: [[4, 9, 2, 2], [7, 9, 2, 2], [10, 9, 2, 2]] }
      },
      cheeks: null
    },
    24: {
      sticks: [
        '........................',
        '..bb................cc..',
        '..bbbbb..........ccccc..',
        '....bbbbbb....cccccc....',
        '.......bbbbcccccc.......',
        '........ccccccbb........',
        '.....cccccc..bbbbbb.....',
        '..cccccc........bbbbbb..',
        '..ccc..............bbb..',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................'
      ],
      head: [
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '........................',
        '.......hhhhhhhhhh.......',
        '.....hhhhhhhhhhhhhh.....',
        '....hhhhhhhhhhhhhhhh....',
        '....hhhhhhhhhhhhhhhh....',
        '....hhhhhhhhhhhhhhhh....',
        '....hhhhhhhhhhhhhhhh....',
        '...hhhhhhhhhhhhhhhhhh...',
        '...hhhhhhhhhhhhhhhhhh...',
        '....hhhhhhhhhhhhhhhh....',
        '....hhhhhhhhhhhhhhhh....',
        '....hhhhhhhhhhhhhhhh....',
        '.....hhhhhhhhhhhhhh.....',
        '.......hhhhhhhhhh.......',
        '........................'
      ],
      strings: { cols: [7, 16], from: 7, to: 10 },
      faces: {
        idle: { eye: [[8, 14, 2, 3]], mouth: [[9, 18, 1, 1], [14, 18, 1, 1], [10, 19, 4, 1]] },
        happy: { eye: [[8, 14, 2, 1], [7, 15, 1, 1], [10, 15, 1, 1]], mouth: [[9, 18, 6, 1], [10, 19, 4, 1]] },
        alert: { eye: [[7, 13, 3, 3]], mouth: [[11, 18, 2, 2]] },
        error: { eye: [[7, 14, 1, 1], [9, 14, 1, 1], [8, 15, 1, 1], [7, 16, 1, 1], [9, 16, 1, 1]], mouth: [[10, 19, 4, 1]] },
        sleep: { eye: [[7, 16, 3, 1]], mouth: [[11, 19, 2, 1]] },
        think: { eye: [[9, 13, 2, 2]], eyeR: [[15, 13, 2, 2]], mouth: [[11, 19, 4, 1]] },
        dots: { mouth: [[7, 16, 2, 2], [11, 16, 2, 2], [15, 16, 2, 2]] }
      },
      cheeks: [[6, 18, 2, 1], [16, 18, 2, 1]]
    },
    32: {
      sticks: [
        '................................',
        '...bb......................cc...',
        '...bbbbb................ccccc...',
        '...bbbbbbbb..........cccccccc...',
        '.....bbbbbbbbb....ccccccccc.....',
        '........bbbbbbbccccccccc........',
        '...........bccccccccc...........',
        '.........cccccccccbbbbb.........',
        '......ccccccccc..bbbbbbbbb......',
        '...ccccccccc........bbbbbbbbb...',
        '...cccccc..............bbbbbb...',
        '...ccc....................bbb...',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................'
      ],
      head: [
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '..........hhhhhhhhhhhh..........',
        '........hhhhhhhhhhhhhhhh........',
        '.......hhhhhhhhhhhhhhhhhh.......',
        '......hhhhhhhhhhhhhhhhhhhh......',
        '......hhhhhhhhhhhhhhhhhhhh......',
        '......hhhhhhhhhhhhhhhhhhhh......',
        '......hhhhhhhhhhhhhhhhhhhh......',
        '.....hhhhhhhhhhhhhhhhhhhhhh.....',
        '.....hhhhhhhhhhhhhhhhhhhhhh.....',
        '.....hhhhhhhhhhhhhhhhhhhhhh.....',
        '......hhhhhhhhhhhhhhhhhhhh......',
        '......hhhhhhhhhhhhhhhhhhhh......',
        '......hhhhhhhhhhhhhhhhhhhh......',
        '......hhhhhhhhhhhhhhhhhhhh......',
        '.......hhhhhhhhhhhhhhhhhh.......',
        '........hhhhhhhhhhhhhhhh........',
        '..........hhhhhhhhhhhh..........',
        '................................'
      ],
      strings: { cols: [10, 21], from: 9, to: 14 },
      faces: {
        idle: { eye: [[10, 19, 3, 4]], mouth: [[12, 25, 1, 1], [19, 25, 1, 1], [13, 26, 6, 1]] },
        happy: { eye: [[11, 19, 1, 1], [10, 20, 1, 1], [12, 20, 1, 1], [9, 21, 1, 1], [13, 21, 1, 1]], mouth: [[12, 24, 8, 1], [13, 25, 6, 1], [14, 26, 4, 1]] },
        alert: { eye: [[9, 18, 4, 4]], mouth: [[15, 24, 2, 3]] },
        error: { eye: [[9, 19, 1, 1], [12, 19, 1, 1], [10, 20, 2, 2], [9, 22, 1, 1], [12, 22, 1, 1]], mouth: [[13, 26, 6, 1]] },
        sleep: { eye: [[9, 21, 4, 1]], mouth: [[15, 25, 2, 1]] },
        think: { eye: [[11, 18, 3, 3]], eyeR: [[20, 18, 3, 3]], mouth: [[15, 25, 5, 1]] },
        dots: { mouth: [[8, 21, 4, 4], [14, 21, 4, 4], [20, 21, 4, 4]] }
      },
      cheeks: [[8, 24, 3, 1], [21, 24, 3, 1]]
    }
  };

  // compose one frame: dx sways the puppet, eyeDx makes the eyes glance with it
  function spriteRows(G, mood, f0) {
    const { dx = 0, eyeDx = 0, dy = 0, lift = -1 } = f0 || {};
    const S = SPRITES[G];
    const g = Array.from({ length: G }, () => Array(G).fill('.'));
    const put = (x, y, ch) => { if (x >= 0 && x < G && y >= 0 && y < G) g[y][x] = ch; };
    S.sticks.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') put(x, y, ch); }));
    const mid = Math.ceil((S.strings.from + S.strings.to) / 2);
    for (let y = S.strings.from; y < S.strings.to; y++) {
      const off = y >= mid ? dx : 0;
      S.strings.cols.forEach((x) => { if (g[y][x + off] === '.') put(x + off, y, 's'); });
    }
    S.head.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'h') put(x + dx, y + dy, 'h'); }));
    const f = S.faces[mood] || S.faces.idle;
    const hole = (r, ox, mirror, oy) => {
      const x0 = mirror ? G - r[0] - r[2] : r[0];
      for (let y = r[1]; y < r[1] + r[3]; y++) for (let x = x0; x < x0 + r[2]; x++) put(x + ox, y + dy + (oy || 0), 'e');
    };
    if (S.cheeks && mood !== 'error' && mood !== 'dots') S.cheeks.forEach((r) => { for (let x = r[0]; x < r[0] + r[2]; x++) put(x + dx, r[1] + dy, 'k'); });
    (f.eye || []).forEach((r) => hole(r, dx + eyeDx, false));
    if (f.eyeR) f.eyeR.forEach((r) => hole(r, dx + eyeDx, false)); else (f.eye || []).forEach((r) => hole(r, dx + eyeDx, true));
    (f.mouth || []).forEach((r, i) => hole(r, dx, false, i === lift ? -Math.max(1, Math.round(G / 16)) : 0));
    return g.map((r) => r.join(''));
  }
  // pick the grid that fills the most whole device pixels; big sizes just scale the 32 grid
  function spriteGrid(dev) {
    if (dev >= 64) return 32;
    let best = 16, cover = 0;
    [16, 24, 32].forEach((G) => { const k = Math.floor(dev / G); if (k >= 1 && G * k >= cover) { best = G; cover = G * k; } });
    return best;
  }

  const MONO_PX = [
    '................',
    '.cccccccccccccc.',
    '.cccccccccccccc.',
    '..s.....s....s..',
    '..s.....s....s..',
    '.hhhhh..hh...hh.',
    '.hh..hh.hhh.hhh.',
    '.hh..hh.hhhhhhh.',
    '.hh..hh.hh.h.hh.',
    '.hhhhh..hh...hh.',
    '.hh.....hh...hh.',
    '.hh.....hh...hh.',
    '.hh.....hh...hh.',
    '.hh.....hh...hh.',
    '.hh.....hh...hh.',
    '................'
  ];

  function pixelRects(rows, colors) {
    // merge horizontal runs per colour; holes ('e') stay transparent
    let s = '';
    const G = rows.length;
    rows.forEach((row, y) => {
      let x = 0;
      while (x < G) {
        const ch = row[x];
        if (ch === '.' || ch === 'e' || !colors[ch]) { x++; continue; }
        let w = 1;
        while (x + w < G && row[x + w] === ch) w++;
        s += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${colors[ch]}"/>`;
        x += w;
      }
    });
    return s;
  }

  // The control: two sticks, the back one in shade so the cross reads as a real hand-held
  // marionette control (flat themes, NieR and tray templates keep both sticks at full ink).
  function controlSvg(s1, s2, c, th, cap, cls) {
    const shade = th.flatCtl ? 1 : (c.shade || 1);
    const back = shade < 1 ? line(s1, c.w, th.ctl, cap).replace('/>', ` opacity="${shade}"/>`) : line(s1, c.w, th.ctl, cap);
    return `<g class="${cls.ctl || ''}">${back}${line(s2, c.w, th.ctl, cap)}</g>`;
  }

  /* ---------------------------------------------------------- vector: Pip */
  const PIP_GEO = {
    full: { ctl: { cx: 32, cy: 14.5, len: 44, ang: 20, w: 6, shade: .6 }, strX: [22, 42], strW: 2.4,
      head: { x0: 14, x1: 50, y0: 31.5, y1: 59.5, r: 11, nub: 5 }, eye: { dx: 6, y: 44, r: 3.6 }, mouth: { w: 7, y: 51.1, d: 3.4, sw: 2.6 }, cheeks: true },
    small: { ctl: { cx: 32, cy: 14.5, len: 46, ang: 20, w: 7.5, shade: 1 }, strX: [21.5, 42.5], strW: 3.4,
      head: { x0: 12, x1: 52, y0: 30.5, y1: 61, r: 11, nub: 4.2 }, eye: { dx: 7, y: 44.5, r: 4.4 }, mouth: { w: 9, y: 53, d: 3.8, sw: 3.6 }, cheeks: false }
  };
  function headPath(h) {
    const { x0, x1, y0, y1, r, nub } = h, ym = (y0 + y1) / 2, k = nub * 1.15;
    return `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${R(ym - k)}Q${x1} ${ym} ${x1 + nub} ${ym}Q${x1} ${ym} ${x1} ${R(ym + k)}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${R(ym + k)}Q${x0} ${ym} ${x0 - nub} ${ym}Q${x0} ${ym} ${x0} ${R(ym - k)}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
  }
  function headPathSquare(h) {
    // NieR: a squarer, machined head; brace points stay
    const { x0, x1, y0, y1, nub } = h, ym = (y0 + y1) / 2, r = 3, k = nub * 1.1;
    return `M${x0 + r} ${y0}H${x1 - r}L${x1} ${y0 + r}V${R(ym - k)}L${x1 + nub} ${ym}L${x1} ${R(ym + k)}V${y1 - r}L${x1 - r} ${y1}H${x0 + r}L${x0} ${y1 - r}V${R(ym + k)}L${x0 - nub} ${ym}L${x0} ${R(ym - k)}V${y0 + r}Z`;
  }
  // face holes, drawn black inside a mask; `sq` gives NieR its square eyes
  function faceHoles(g, mood, sq, cls) {
    const cx = 32, { dx, y, r } = g.eye, m = g.mouth;
    const L = cx - dx, Rr = cx + dx;
    const eye = (x, yy, rr) => sq ? `<rect x="${R(x - rr * .9)}" y="${R(yy - rr * .9)}" width="${R(rr * 1.8)}" height="${R(rr * 1.8)}"/>` : `<circle cx="${R(x)}" cy="${R(yy)}" r="${R(rr)}"/>`;
    const st = (d, w) => `<path d="${d}" fill="none" stroke="#000" stroke-width="${R(w)}" stroke-linecap="${sq ? 'square' : 'round'}" stroke-linejoin="round"/>`;
    const smile = sq
      ? st(`M${R(cx - m.w / 2)} ${m.y}L${R(cx - m.w / 4)} ${R(m.y + m.d * .8)}H${R(cx + m.w / 4)}L${R(cx + m.w / 2)} ${m.y}`, m.sw * .85)
      : st(`M${R(cx - m.w / 2)} ${m.y}Q${cx} ${R(m.y + m.d)} ${R(cx + m.w / 2)} ${m.y}`, m.sw);
    const c = cls || {};
    const eyesG = (inner) => `<g class="${c.eyes || ''}"><g class="${c.blink || ''}">${inner}</g></g>`;
    switch (mood) {
      case 'happy': {
        const arc = (x) => `M${R(x - r)} ${R(y + r * .5)}Q${x} ${R(y - r * 1.25)} ${R(x + r)} ${R(y + r * .5)}`;
        return eyesG(st(arc(L) + arc(Rr), r * .78)) +
          `<path d="M${R(cx - m.w * .62)} ${R(m.y - .6)}Q${cx} ${R(m.y + m.d * 2.1)} ${R(cx + m.w * .62)} ${R(m.y - .6)}Z" stroke="#000" stroke-width="${R(m.sw * .6)}" stroke-linejoin="round"/>`;
      }
      case 'alert':
        return eyesG(eye(L, y - .5, r * 1.22) + eye(Rr, y - .5, r * 1.22)) + (sq ? `<rect x="${R(cx - 1.8)}" y="${R(m.y)}" width="3.6" height="3.6"/>` : `<ellipse cx="${cx}" cy="${R(m.y + 1.2)}" rx="${R(m.w * .22)}" ry="${R(m.w * .27)}"/>`);
      case 'error': {
        const x = (xx) => `M${R(xx - r)} ${R(y - r)}L${R(xx + r)} ${R(y + r)}M${R(xx + r)} ${R(y - r)}L${R(xx - r)} ${R(y + r)}`;
        return eyesG(st(x(L) + x(Rr), r * .66)) + st(`M${R(cx - m.w / 2)} ${R(m.y + 1.6)}Q${R(cx - m.w / 4)} ${R(m.y)} ${cx} ${R(m.y + 1.6)}T${R(cx + m.w / 2)} ${R(m.y + 1.6)}`, m.sw * .85);
      }
      case 'sleep': {
        const cl = (xx) => `M${R(xx - r)} ${R(y)}Q${xx} ${R(y + r * 1.15)} ${R(xx + r)} ${R(y)}`;
        return eyesG(st(cl(L) + cl(Rr), r * .7)) + `<ellipse cx="${cx}" cy="${R(m.y + 1.4)}" rx="${R(m.w * .14)}" ry="${R(m.w * .18)}"/>`;
      }
      case 'think':
        return eyesG(eye(L + r * .35, y - r * .45, r) + eye(Rr + r * .35, y - r * .45, r)) + st(`M${R(cx - m.w * .2)} ${R(m.y + 1.2)}H${R(cx + m.w * .45)}`, m.sw * .9);
      case 'dots': {
        // the "thinking" loader: three dots where the face is
        const dr = r * .8, gap = r * 2.35;
        return [-1, 0, 1].map((i) => `<g class="${(c.dot || '') + (i + 1)}">${sq ? `<rect x="${R(cx + i * gap - dr)}" y="${R(y + 2.5 - dr)}" width="${R(dr * 2)}" height="${R(dr * 2)}"/>` : `<circle cx="${R(cx + i * gap)}" cy="${R(y + 2.5)}" r="${R(dr)}"/>`}</g>`).join('');
      }
      case 'blank':
        return '';
      default:
        return eyesG(eye(L, y, r) + eye(Rr, y, r)) + smile;
    }
  }

  function pipVector(th, tier, mood, cls, ids) {
    const g = PIP_GEO[tier === 'small' ? 'small' : 'full'];
    const sq = !!th.square;
    const c = g.ctl;
    const s1 = stick(c.cx, c.cy, c.len, c.ang), s2 = stick(c.cx, c.cy, c.len, -c.ang);
    const capS = sq ? 'square' : 'round';
    let defs = '';
    const ctl = controlSvg(s1, s2, c, th, capS, cls);
    const h = g.head;
    const strings = g.strX.map((x) => line([x, c.cy, x, h.y0 + 3], g.strW, th.str, 'butt')).join('');
    const [hg, hfill] = paint(ids.grad, th.head, 0, h.y0, 0, h.y1);
    defs += hg;
    defs += `<mask id="${ids.face}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="80" height="80"><rect x="-8" y="-8" width="80" height="80" fill="#fff"/><g class="${cls.face || ''}">${faceHoles(g, mood, sq, cls)}</g></mask>`;
    let headInner = `<path d="${sq ? headPathSquare(h) : headPath(h)}" fill="${hfill}"/>`;
    if (th.gloss && tier !== 'small') {
      headInner += `<path d="M${h.x0 + 5} ${h.y0 + 9}Q${h.x0 + 6} ${h.y0 + 3} ${h.x0 + 13} ${h.y0 + 2.6}H${h.x1 - 12}Q${h.x1 - 7} ${h.y0 + 2.6} ${h.x1 - 5.5} ${h.y0 + 6}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>`;
    }
    if (g.cheeks && th.cheek && !sq && mood !== 'error' && mood !== 'dots') {
      const cy = g.eye.y + 6.2;
      headInner += `<ellipse cx="${32 - g.eye.dx - 4.2}" cy="${cy}" rx="3.1" ry="1.9" fill="${th.cheek}" opacity=".95"/><ellipse cx="${32 + g.eye.dx + 4.2}" cy="${cy}" rx="3.1" ry="1.9" fill="${th.cheek}" opacity=".95"/>`;
    }
    const head = `<g class="${cls.head || ''}" mask="url(#${ids.face})">${headInner}</g>`;
    return { defs, body: `<g class="${cls.pup || ''}">${strings}${head}</g>${ctl}` };
  }

  /* ------------------------------------------------------ vector: monogram */
  const MONO_GEO = {
    full: { ctl: { cx: 32, cy: 13.5, len: 46, ang: 18, w: 6, shade: .6 }, strW: 2.4, lw: 7, yT: 32.5, yB: 59, p: 9.5, m0: 34.5, m1: 55 },
    small: { ctl: { cx: 32, cy: 13.5, len: 48, ang: 18, w: 7.5, shade: 1 }, strW: 3.4, lw: 9, yT: 32, yB: 60, p: 9, m0: 35, m1: 56 }
  };
  function monoVector(th, tier, cls, ids) {
    const g = MONO_GEO[tier === 'small' ? 'small' : 'full'];
    const c = g.ctl, sq = !!th.square, cap = sq ? 'square' : 'round';
    const s1 = stick(c.cx, c.cy, c.len, c.ang), s2 = stick(c.cx, c.cy, c.len, -c.ang);
    const defs = '';
    const ctl = controlSvg(s1, s2, c, th, cap, cls);
    const { yT, yB, p, m0, m1, lw } = g, bw = 17.5, bh = 17;
    const P = `M${p} ${yB}V${yT}H${p + 7.5}C${p + bw - 2} ${yT} ${p + bw} ${yT + 4} ${p + bw} ${R(yT + bh / 2)}C${p + bw} ${yT + bh - 4} ${p + bw - 2} ${yT + bh} ${p + 7.5} ${yT + bh}H${p}`;
    const M = `M${m0} ${yB}V${yT}L${(m0 + m1) / 2} ${yT + 16}L${m1} ${yT}V${yB}`;
    const st = (x, cl) => `<g class="${cl || ''}">${line([x, c.cy, x, yT], g.strW, th.str, 'butt')}</g>`;
    const letter = (d) => `<path d="${d}" fill="none" stroke="${th.letter}" stroke-width="${lw}" stroke-linecap="${cap}" stroke-linejoin="${sq ? 'miter' : 'round'}"/>`;
    const body = `<g class="${cls.l1 || ''}">${st(p)}${letter(P)}</g><g class="${cls.l2 || ''}">${st(m0)}${st(m1)}${letter(M)}</g>${ctl}`;
    return { defs, body };
  }

  /* ------------------------------------------------------------ animation */
  // Every loader keeps the static pose as its base markup, so a renderer that ignores CSS
  // (Slint, a tray image) still shows the finished mark.
  function loaderCss(p, kind, th, tier, reduced, mark) {
    const fam = MOTION[th.family] || MOTION.basic;
    const d = fam.dur, e = fam.ease, a = fam.amp;
    const px = tier === 'micro' || tier === 'pixel';
    const vb = (x, y) => `transform-box:view-box;transform-origin:${x}px ${y}px;`;
    const fb = 'transform-box:fill-box;transform-origin:center;';
    const geo = (mark === 'mono' ? MONO_GEO : PIP_GEO)[tier === 'small' ? 'small' : 'full'];
    const cy = geo.ctl.cy;
    // Reduced motion keeps a signal without movement: the control breathes and Pip blinks.
    const breath = `${p}-breath ${R(d * 1.3)}s ease-in-out infinite`;
    const redKeys = `@keyframes ${p}-breath{0%,100%{opacity:1}50%{opacity:.42}}@keyframes ${p}-rblink{0%,42%,58%,100%{opacity:1}50%{opacity:.2}}`;
    const redRules = (pre) => px
      ? `${pre}.${p}-px,${pre}.${p}-fr1{opacity:1;animation:${p}-breath ${R(d * 1.3)}s ease-in-out infinite!important}`
      : mark === 'pip'
        ? `${pre}.${p}-ctl{animation:${breath}!important}${pre}.${p}-blink{animation:${p}-rblink ${R(d * 2.6)}s ease-in-out infinite!important}`
        : `${pre}.${p}-l1{animation:${breath}!important}${pre}.${p}-l2{animation:${breath}!important;animation-delay:${R(-d * .65)}s!important}`;
    if (reduced) return redKeys + redRules(`.${p} `);
    let css = '';
    if (px) {
      // four flipped frames, the way Retro's own snap motion works; frame 1 is the rest pose
      css += `.${p}-fr{opacity:0}.${p}-fr1{opacity:1}.${p}-fr{animation:${p}-flip ${d}s steps(1,end) infinite}@keyframes ${p}-flip{0%{opacity:1}25%,100%{opacity:0}}`;
      [0, 1, 2, 3].forEach((i) => { css += `.${p}-fr${i}{animation-delay:${R(-d + i * d / 4)}s}`; });
    } else if (mark === 'pip' && kind === 'swing') {
      css += `.${p}-ctl{${vb(32, cy)}animation:${p}-rock ${d}s ${e} infinite}`;
      css += `.${p}-pup{${vb(32, cy)}animation:${p}-swing ${d}s ${e} infinite;animation-delay:${R(-d * .12)}s}`;
      css += `.${p}-eyes{animation:${p}-look ${d}s ${e} infinite;animation-delay:${R(-d * .2)}s}`;
      css += `.${p}-blink{${fb}animation:${p}-blink ${d * 2}s linear infinite}`;
      css += `@keyframes ${p}-rock{0%,100%{transform:rotate(${R(-7 * a)}deg)}50%{transform:rotate(${R(7 * a)}deg)}}`;
      css += `@keyframes ${p}-swing{0%,100%{transform:rotate(${R(-10 * a)}deg)}50%{transform:rotate(${R(10 * a)}deg)}}`;
      css += `@keyframes ${p}-look{0%,100%{transform:translateX(${R(-1.8 * a)}px)}50%{transform:translateX(${R(1.8 * a)}px)}}`;
      css += `@keyframes ${p}-blink{0%,70%,78%,100%{transform:scaleY(1)}74%{transform:scaleY(.12)}}`;
    } else if (mark === 'pip' && kind === 'think') {
      css += `.${p}-pup{animation:${p}-bob ${d}s ${e} infinite}`;
      css += `.${p}-ctl{${vb(32, cy)}animation:${p}-tilt ${d * 2}s ${e} infinite}`;
      [1, 2, 3].forEach((i) => { css += `.${p}-dot${i}{animation:${p}-hop ${R(d * .8)}s ${e} infinite;animation-delay:${R((i - 1) * d * .8 / 6)}s}`; });
      css += `@keyframes ${p}-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(${R(-1.6 * a)}px)}}`;
      css += `@keyframes ${p}-tilt{0%,100%{transform:rotate(${R(-3 * a)}deg)}50%{transform:rotate(${R(3 * a)}deg)}}`;
      css += `@keyframes ${p}-hop{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(${R(-4.2 * a)}px)}}`;
    } else if (mark === 'pip' && kind === 'hop') {
      css += `.${p}-ctl{${vb(32, cy)}animation:${p}-lift ${R(d * .75)}s ${e} infinite}`;
      css += `.${p}-pup{animation:${p}-lift ${R(d * .75)}s ${e} infinite;animation-delay:${R(-d * .06)}s}`;
      css += `.${p}-head{transform-box:fill-box;transform-origin:50% 100%;animation:${p}-squash ${R(d * .75)}s ${e} infinite;animation-delay:${R(-d * .06)}s}`;
      css += `@keyframes ${p}-lift{0%,100%{transform:translateY(0)}45%{transform:translateY(${R(-5 * a)}px)}}`;
      css += `@keyframes ${p}-squash{0%,100%{transform:scale(1.06,.92)}20%{transform:scale(1,1)}45%{transform:scale(.96,1.05)}80%{transform:scale(1,1)}}`;
    } else if (mark === 'mono') {
      css += `.${p}-ctl{${vb(32, cy)}animation:${p}-rock ${d}s ${e} infinite}`;
      css += `.${p}-l1{animation:${p}-step ${d}s ${e} infinite}.${p}-l2{animation:${p}-step ${d}s ${e} infinite;animation-delay:${R(-d / 2)}s}`;
      css += `@keyframes ${p}-rock{0%,100%{transform:rotate(${R(-6 * a)}deg)}50%{transform:rotate(${R(6 * a)}deg)}}`;
      css += `@keyframes ${p}-step{0%,100%{transform:translateY(0)}25%{transform:translateY(${R(-5 * a)}px)}50%{transform:translateY(0)}}`;
    }
    // Standalone files follow the OS setting; inlined in PMConcept7 they also follow its own switch.
    css += redKeys;
    css += `@media (prefers-reduced-motion:reduce){.${p} *{animation:none!important}${redRules(`.${p} `)}}`;
    css += `:root[data-motion="reduced"] .${p} *,:root[data-reduced-motion="1"] .${p} *{animation:none!important}`;
    css += redRules(`:root[data-motion="reduced"] .${p} `) + redRules(`:root[data-reduced-motion="1"] .${p} `);
    return css;
  }

  /* ------------------------------------------------------------- the mark */
  function markBody(o, th, tier) {
    const p = o.prefix;
    const anim = !!o.motion && !th.noMotion;
    const cls = anim ? { ctl: `${p}-ctl`, pup: `${p}-pup`, head: `${p}-head`, face: `${p}-face`, eyes: `${p}-eyes`, blink: `${p}-blink`, dot: `${p}-dot`, l1: `${p}-l1`, l2: `${p}-l2` } : {};
    const ids = { gap: p + 'g', face: p + 'f', grad: p + 'h' };
    const mood = anim && o.mark === 'pip' && o.motion === 'think' && !o.reduced ? 'dots' : (o.mood || 'idle');
    const ink = o.form === 'tray' ? o.ink || '#000' : null;
    const tth = ink ? Object.assign({}, th, { ctl: ink, str: ink, head: ink, letter: ink, cheek: null, gloss: false, flatCtl: true }) : th;

    if (tier === 'micro' || tier === 'pixel') {
      // pixel sprite: crisp at 16 px, and the native look of the Retro themes at any size
      const solid = (v) => Array.isArray(v) ? mix(v[0], v[1], .5) : v;
      const ctl = solid(tth.ctl);
      const back = tth.flatCtl || !th.pixel || !/^#/.test(ctl) ? ctl : mix(ctl, th.tile.stops[0], .42);
      const colors = { c: ctl, b: back, s: solid(tth.str), h: solid(o.mark === 'mono' ? tth.letter : tth.head), k: tth.cheek };
      if (o.mark === 'mono') {
        return { vb: 16, defs: '', crisp: true, body: pixelRects(MONO_PX, colors) };
      }
      const G = tier === 'micro' ? 16 : spriteGrid(o._dev);
      if (anim && !o.reduced && o.motion) {
        // four flipped frames, the way Retro's own snap motion works
        const n = Math.max(1, Math.round(G / 16));
        const plan = o.motion === 'think' ? [{ lift: 0 }, { lift: 1 }, { lift: 2 }, {}]
          : o.motion === 'hop' ? [{}, { dy: -n }, { dy: -2 * n }, { dy: -n }]
          : [{ dx: -n, eyeDx: -1 }, {}, { dx: n, eyeDx: 1 }, {}];
        const fm = o.motion === 'think' ? 'dots' : mood;
        const body = plan.map((f, i) => `<g class="${p}-fr ${p}-fr${i}">${pixelRects(spriteRows(G, fm, f), colors)}</g>`).join('');
        return { vb: G, defs: '', crisp: true, body, frames: true };
      }
      const still = pixelRects(spriteRows(G, mood === 'dots' ? 'think' : mood), colors);
      return { vb: G, defs: '', crisp: true, body: anim ? `<g class="${p}-px">${still}</g>` : still };
    }
    const r = o.mark === 'mono' ? monoVector(tth, tier, cls, ids) : pipVector(tth, tier, mood, cls, ids);
    return { vb: 64, defs: r.defs, body: r.body, crisp: false };
  }

  function tileFrame(th, ids, inner, innerVb, crisp) {
    const t = th.tile;
    let defs = '', s = '';
    const [gdef, gfill] = paint(ids.tile, t.stops, 0, 0, 64, 64);
    defs += gdef;
    if (t.kind === 'retro') {
      s += `<rect x="4" y="4" width="60" height="60" fill="${t.shadow}"/>`;
      s += `<rect x="1" y="1" width="58" height="58" fill="${gfill}" stroke="${t.edge}" stroke-width="2"/>`;
      s += `<svg x="9" y="8" width="42" height="42" viewBox="0 0 ${innerVb} ${innerVb}"${crisp ? ' shape-rendering="crispEdges"' : ''}>${inner}</svg>`;
      return { defs, body: s };
    }
    if (t.kind === 'nier') {
      s += `<rect width="64" height="64" fill="${gfill}"/>`;
      s += `<rect x="4.5" y="4.5" width="55" height="55" fill="none" stroke="${t.edge}" stroke-opacity=".55" stroke-width=".8"/>`;
      const tick = (x, y, dx, dy) => `<path d="M${x} ${y + dy * 6}V${y}H${x + dx * 6}" fill="none" stroke="${t.edge}" stroke-width="1.6"/>`;
      s += tick(2.5, 2.5, 1, 1) + tick(61.5, 2.5, -1, 1) + tick(2.5, 61.5, 1, -1) + tick(61.5, 61.5, -1, -1);
      s += `<rect x="29" y="56.5" width="6" height="1.6" fill="${t.edge}"/>`;
      s += `<svg x="10" y="9" width="44" height="44" viewBox="0 0 ${innerVb} ${innerVb}">${inner}</svg>`;
      return { defs, body: s };
    }
    const rx = t.kind === 'flat' ? 12.5 : 14.4;
    s += `<rect width="64" height="64" rx="${rx}" fill="${gfill}"/>`;
    if (t.glow) {
      defs += `<radialGradient id="${ids.glow}" cx="32" cy="40" r="26" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.glow}"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></radialGradient>`;
      s += `<rect width="64" height="64" rx="${rx}" fill="url(#${ids.glow})"/>`;
    }
    if (t.kind === 'glass') {
      defs += `<linearGradient id="${ids.rim}" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.edge}"/><stop offset=".45" stop-color="${t.edge}" stop-opacity=".12"/><stop offset="1" stop-color="${t.edge}" stop-opacity=".35"/></linearGradient>`;
      s += `<path d="M2 20C2 8 8 2 20 2H44C56 2 62 8 62 20V24C46 30 18 30 2 24Z" fill="#fff" opacity="${th.scheme === 'dark' ? .07 : .35}"/>`;
      s += `<rect x=".75" y=".75" width="62.5" height="62.5" rx="${rx - .6}" fill="none" stroke="url(#${ids.rim})" stroke-width="1.5"/>`;
    } else if (t.edge) {
      s += `<rect x=".5" y=".5" width="63" height="63" rx="${rx - .4}" fill="none" stroke="${t.edge}" stroke-width="1"/>`;
    }
    const pad = crisp ? 9.5 : 7.5;
    s += `<svg x="${pad}" y="${pad - .5}" width="${64 - pad * 2}" height="${64 - pad * 2}" viewBox="0 0 ${innerVb} ${innerVb}"${crisp ? ' shape-rendering="crispEdges"' : ''}>${inner}</svg>`;
    return { defs, body: s };
  }

  function svg(opts) {
    const o = Object.assign({ mark: 'pip', theme: 'friendly-dark', form: 'glyph', px: 64, dpr: 1, mood: 'idle', motion: null, reduced: false }, opts || {});
    const th = THEMES[o.theme] || THEMES['friendly-dark'];
    o.prefix = o.prefix || nextId();
    const tier = pickTier(o, th);
    const m = markBody(o, th, tier);
    const p = o.prefix;
    const anim = !!o.motion && !th.noMotion;
    const css = anim ? loaderCss(p, o.motion, th, tier, o.reduced, o.mark) : '';
    const style = css ? `<style>${css}</style>` : '';
    const label = o.title || (anim ? 'Puppet Master is working' : 'Puppet Master');
    const role = anim ? 'role="img" aria-label="' + esc(label) + '"' : (o.decorative ? 'aria-hidden="true"' : 'role="img" aria-label="' + esc(label) + '"');
    const size = `width="${o.px}" height="${o.px}"`;
    if (o.form === 'tile') {
      const ids = { tile: p + 't', glow: p + 'w', rim: p + 'r' };
      const inner = (m.defs ? `<defs>${m.defs}</defs>` : '') + m.body;
      const fr = tileFrame(th, ids, inner, m.vb, m.crisp);
      return `<svg xmlns="http://www.w3.org/2000/svg" class="${p}" ${size} viewBox="0 0 64 64" ${role}>${style}<defs>${fr.defs}</defs>${fr.body}</svg>`;
    }
    // sprites land on whole device pixels: pad the view box instead of scaling by a fraction
    let vbox = `0 0 ${m.vb} ${m.vb}`;
    if (m.crisp) {
      const D = Math.round(o._dev), k = Math.floor(D / m.vb);
      if (k >= 1 && D < 64 && D % m.vb) { const V = R(D / k), pad = R((V - m.vb) / 2); vbox = `${-pad} ${-pad} ${V} ${V}`; }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" class="${p}" ${size} viewBox="${vbox}"${m.crisp ? ' shape-rendering="crispEdges"' : ''} ${role}>${style}${m.defs ? `<defs>${m.defs}</defs>` : ''}${m.body}</svg>`;
  }

  G.PMLogo = { svg, THEMES, THEME_ORDER, MOTION, pickTier, version: '0.1' };
})(typeof window !== 'undefined' ? window : globalThis);
