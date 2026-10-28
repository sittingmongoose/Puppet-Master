/* Puppet Master logo system (Opus 5.5 concept), v0.2.
   One generator for every asset: static marks (glyph, app tile, tray template), three size tiers,
   Pip's moods, and the animated loaders. Motion is a small rig: the control rocks, Pip hangs from
   it, and each string is recomputed from its stick anchor to its eyelet on every sampled frame, so
   strings never come loose. Returns SVG strings and touches no DOM, so the gallery, the download
   buttons and any later export script share one source. */
(function (G) {
  'use strict';

  /* ---------------------------------------------------------------- themes */
  // Values are PMConcept7's computed tokens for each theme (sampled from the running page), or a
  // step of one. Glass follows the Liquid Glass look PMConcept7 ships now (neutral glass, blue
  // accent, ribbon wallpaper), not the older violet stage.
  const THEMES = {
    'friendly-dark': {
      label: 'Friendly Dark', family: 'friendly', scheme: 'dark',
      bg: '#211E26', bar: 'rgba(40,36,48,.82)', text: '#F0EDF4', muted: '#8A8494', line: 'rgba(240,237,244,.10)', accent: '#6FC6E8',
      ctl: '#C3B1E4', pin: '#9C87C8', str: '#9A93A6', head: ['#86D3F0', '#5BB6DD'], eye: '#272230', cheek: '#FFB4A6', shine: true, sheen: .32,
      letter: '#F0EDF4',
      tile: { kind: 'soft', stops: ['#3B3647', '#24212B'], glow: 'rgba(111,198,232,.22)', edge: 'rgba(255,255,255,.09)' },
      font: "'Poppins', system-ui, sans-serif", weight: 700, track: '0'
    },
    'friendly-light': {
      label: 'Friendly Light', family: 'friendly', scheme: 'light',
      bg: '#FBF7F3', bar: 'rgba(255,255,255,.88)', text: '#4A4550', muted: '#9A93A0', line: '#E4DCEA', accent: '#3F9CC7',
      ctl: '#9678C9', pin: '#7A5DB0', str: '#ADA5B6', head: ['#5BB4DC', '#3893BF'], eye: '#2F2A36', cheek: '#FFA68C', shine: true, sheen: .3,
      letter: '#4A4550',
      tile: { kind: 'soft', stops: ['#FFFFFF', '#F1EAF4'], glow: 'rgba(90,185,224,.20)', edge: 'rgba(122,109,140,.16)' },
      font: "'Poppins', system-ui, sans-serif", weight: 700, track: '0'
    },
    'glass-dark': {
      label: 'Glass Dark', family: 'glass', scheme: 'dark',
      bg: '#04060D', bar: 'rgba(7,10,22,.62)', text: '#F6F8FC', muted: '#BAC2D0', line: 'rgba(255,255,255,.16)', accent: '#74B9FF',
      ctl: '#F6F8FC', pin: '#74B9FF', str: 'rgba(246,248,252,.55)', head: '#86C1FF', eye: '#071026', cheek: '#FF86C2', shine: true,
      glass: { tint: ['#D2E8FF', '#8DC5FF', '#5FA8F5'], alpha: .8, frost: 'rgba(255,255,255,.10)', rimTop: 'rgba(255,255,255,.95)', rimBot: 'rgba(255,255,255,.38)', edge: 'rgba(4,10,30,.55)', drop: 'rgba(0,2,12,.55)', rod: '#EEF2F8' },
      letter: '#F6F8FC',
      tile: { kind: 'liquid', wall: 'dark', veil: 'rgba(4,6,13,.34)', edgeTop: 'rgba(255,255,255,.34)', edgeBot: 'rgba(0,0,0,.28)' },
      font: "'Inter', system-ui, sans-serif", weight: 650, track: '-.01em'
    },
    'glass-light': {
      label: 'Glass Light', family: 'glass', scheme: 'light',
      bg: '#EEF1F6', bar: 'rgba(255,255,255,.58)', text: '#0C0F15', muted: '#424A59', line: 'rgba(12,15,21,.14)', accent: '#005FCC',
      ctl: '#262E3E', pin: '#005FCC', str: 'rgba(12,15,21,.42)', head: '#4E9BF2', eye: '#0C0F15', cheek: '#FF86C2', shine: true,
      glass: { tint: ['#B9DAFF', '#5EA6F6', '#2F80E2'], alpha: .88, frost: 'rgba(255,255,255,.18)', rimTop: 'rgba(255,255,255,.98)', rimBot: 'rgba(255,255,255,.6)', edge: 'rgba(30,45,90,.30)', drop: 'rgba(30,45,90,.30)', rod: '#2A3242' },
      letter: '#0C0F15',
      tile: { kind: 'liquid', wall: 'light', veil: 'rgba(255,255,255,.22)', edgeTop: 'rgba(255,255,255,.95)', edgeBot: 'rgba(30,45,90,.16)' },
      font: "'Inter', system-ui, sans-serif", weight: 650, track: '-.01em'
    },
    'basic-dark': {
      label: 'Basic Dark', family: 'basic', scheme: 'dark',
      bg: '#121212', bar: '#1E1E1E', text: '#E8E8E8', muted: '#6B7280', line: '#424242', accent: '#64B5F6',
      ctl: '#E8E8E8', pin: '#9E9E9E', str: '#7A8290', head: '#64B5F6', eye: '#121212', cheek: null,
      letter: '#E8E8E8',
      tile: { kind: 'flat', stops: ['#2D2D2D', '#2D2D2D'], edge: 'rgba(255,255,255,.08)' },
      font: "'Inter', system-ui, sans-serif", weight: 700, track: '.3px'
    },
    'basic-light': {
      label: 'Basic Light', family: 'basic', scheme: 'light',
      bg: '#EAECEF', bar: '#EAECEF', text: '#1A1A1A', muted: '#5C6470', line: '#C4C4C4', accent: '#0056B3',
      ctl: '#2B2B2B', pin: '#5C6470', str: '#8A929C', head: '#0056B3', eye: '#FFFFFF', cheek: null,
      letter: '#1A1A1A',
      tile: { kind: 'flat', stops: ['#FFFFFF', '#FFFFFF'], edge: '#C9CDD3' },
      font: "'Inter', system-ui, sans-serif", weight: 700, track: '.3px'
    },
    'retro-dark': {
      label: 'Retro Dark', family: 'retro', scheme: 'dark', pixel: true,
      bg: '#10120E', bar: '#171A14', text: '#DFE6CF', muted: '#7C866B', line: '#4A533A', accent: '#86C46A',
      ctl: '#DFE6CF', str: '#8F9A7C', head: '#86C46A', cheek: '#E9853F', eye: '#10120E',
      letter: '#86C46A',
      tile: { kind: 'retro', stops: ['#1E2219', '#1E2219'], edge: '#4A533A', shadow: 'rgba(224,224,224,.55)' },
      font: "'IBM Plex Mono', ui-monospace, monospace", weight: 700, track: '0'
    },
    'retro-light': {
      label: 'Retro Light', family: 'retro', scheme: 'light', pixel: true,
      bg: '#F5F0E8', bar: '#F5F0E8', text: '#1A1A1A', muted: '#524F49', line: '#4A463F', accent: '#2F7A3D',
      ctl: '#1A1A1A', str: '#6A665E', head: '#2F7A3D', cheek: '#FF1493', eye: '#F5F0E8',
      letter: '#2F7A3D',
      tile: { kind: 'retro', stops: ['#FAF7F2', '#FAF7F2'], edge: '#1A1A1A', shadow: '#1A1A1A' },
      font: "'IBM Plex Mono', ui-monospace, monospace", weight: 700, track: '0'
    },
    'nier-light': {
      label: 'NieR Light', family: 'nier', scheme: 'light', nier: true, noMotion: true, flatCtl: true,
      bg: '#CCC8B1', bar: '#C6C2AB', text: '#211F1B', muted: '#4D4B40', line: '#A29E89', accent: '#211F1B',
      ink: '#211F1B', paper: '#D1CDB7', red: '#A94A38', ctl: '#211F1B', str: '#211F1B', head: '#211F1B', letter: '#211F1B', cheek: null,
      tile: { kind: 'nier', stops: ['#D1CDB7', '#C6C2AB'], edge: '#211F1B', grid: 'rgba(33,31,27,.07)' },
      font: "'PM NieR Sans', 'Inter', system-ui, sans-serif", weight: 700, track: '.3px'
    },
    'nier-dark': {
      label: 'NieR Dark', family: 'nier', scheme: 'dark', nier: true, noMotion: true, flatCtl: true,
      bg: '#2F2D26', bar: '#36342C', text: '#D1CDB7', muted: '#9D9986', line: '#4F4D45', accent: '#D1CDB7',
      ink: '#D1CDB7', paper: '#36342C', red: '#C96B57', ctl: '#D1CDB7', str: '#D1CDB7', head: '#D1CDB7', letter: '#D1CDB7', cheek: null,
      tile: { kind: 'nier', stops: ['#36342C', '#2B2922'], edge: '#D1CDB7', grid: 'rgba(209,205,183,.06)' },
      font: "'PM NieR Sans', 'Inter', system-ui, sans-serif", weight: 700, track: '.3px'
    }
  };
  const THEME_ORDER = ['friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'basic-dark', 'basic-light', 'retro-dark', 'retro-light', 'nier-light', 'nier-dark'];

  // Each family moves the way its theme already moves in PMConcept7.
  const MOTION = {
    friendly: { dur: 1.8, amp: 1, wave: 'spring', label: 'spring' },
    glass: { dur: 2.6, amp: .85, wave: 'glide', label: 'glide' },
    basic: { dur: 1.7, amp: .7, wave: 'sine', label: 'ease' },
    retro: { dur: 1.2, amp: 1, wave: 'frames', label: '8 frames' }
  };

  /* --------------------------------------------------------------- helpers */
  const R = (v) => +(+v).toFixed(2);
  const D2R = Math.PI / 180;
  let seq = 0;
  const nextId = () => 'pm' + (++seq).toString(36);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const line = (a, b, w, c, cap, extra) => `<line x1="${R(a[0])}" y1="${R(a[1])}" x2="${R(b[0])}" y2="${R(b[1])}" stroke="${c}" stroke-width="${R(w)}" stroke-linecap="${cap || 'round'}"${extra || ''}/>`;
  function mix(a, b, t) {
    const h = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
    const A = h(a), B = h(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  const solid = (v) => Array.isArray(v) ? mix(v[0], v[v.length - 1], .5) : v;
  function grad(id, stops, x1, y1, x2, y2) {
    const n = stops.length - 1;
    return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${R(x1)}" y1="${R(y1)}" x2="${R(x2)}" y2="${R(y2)}">${stops.map((c, i) => `<stop offset="${R(i / n)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  }
  const rot = (p, c, deg) => { const a = deg * D2R, s = Math.sin(a), k = Math.cos(a); const x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * k - y * s, c[1] + x * s + y * k]; };

  /* -------------------------------------------------------------- geometry */
  // full: every detail. small: heavier strokes for 19-40 device px (title bar at 1x).
  const GEO = {
    full: { P: [32, 14.5], half: 22, ang: 20, w: 6, tip: 5, head: { x0: 14, x1: 50, y0: 31.5, y1: 59.5, r: 11, nub: 5 }, eyeletX: [19.5, 44.5], ring: 1.5, ringW: 1.15, strW: 1.5,
      eye: { dx: 6, y: 44, r: 3.6 }, mouth: { w: 7, y: 51.1, d: 3.4, sw: 2.6 }, detail: true },
    small: { P: [32, 14.5], half: 23, ang: 20, w: 7.5, tip: 5, head: { x0: 12, x1: 52, y0: 30.5, y1: 61, r: 11, nub: 4.2 }, eyeletX: [19, 45], ring: 0, ringW: 0, strW: 3,
      eye: { dx: 7, y: 44.5, r: 4.4 }, mouth: { w: 9, y: 53, d: 3.8, sw: 3.6 }, detail: false }
  };
  function sticks(g) {
    const [cx, cy] = g.P, dx = g.half * Math.cos(g.ang * D2R), dy = g.half * Math.sin(g.ang * D2R);
    // s1: the back stick, upper-left to lower-right. s2: the front stick, lower-left to upper-right.
    return { s1: [[cx - dx, cy - dy], [cx + dx, cy + dy]], s2: [[cx - dx, cy + dy], [cx + dx, cy - dy]] };
  }
  // string anchors sit a little in from the two lower tips: left on the front stick, right on the back one
  function anchors(g) {
    const { s1, s2 } = sticks(g), c = Math.cos(g.ang * D2R), s = Math.sin(g.ang * D2R);
    return [[s2[0][0] + g.tip * c, s2[0][1] - g.tip * s], [s1[1][0] - g.tip * c, s1[1][1] - g.tip * s]];
  }
  // Where a string meets the bar. Each stick gets hardware on its underside: the left string hangs
  // from the front stick, the right one from the back stick, both a little in from the lower tips.
  // n is the stick's downward normal, so hardware always sits under the bar, never across it.
  function barAttach(g) {
    const { s1, s2 } = sticks(g), A = anchors(g), sa = Math.sin(g.ang * D2R), ca = Math.cos(g.ang * D2R);
    const n = [[sa, ca], [-sa, ca]];
    return A.map((a, i) => ({ a, n: n[i], stick: i === 0 ? s2 : s1, front: i === 0 }));
  }
  function headTopY(h, x) {
    const { x0, x1, y0, r } = h;
    if (x < x0 + r) { const d = x0 + r - x; return y0 + r - Math.sqrt(Math.max(0, r * r - d * d)); }
    if (x > x1 - r) { const d = x - (x1 - r); return y0 + r - Math.sqrt(Math.max(0, r * r - d * d)); }
    return y0;
  }
  // where each string ends on Pip, at rest: the top of its eyelet ring (or just inside the head)
  function eyelets(g) {
    // a screw eye on Pip's head: the ring's lower half tucks into the head
    return g.eyeletX.map((x) => {
      const top = headTopY(g.head, x);
      return g.ring ? { x, base: top, ring: [x, top - g.ring * .45], end: [x, top - g.ring * 1.45] } : { x, base: top, ring: null, end: [x, top + 1.2] };
    });
  }
  // The two points a string runs between, for a pose. With rings at both ends the string leaves
  // each ring on the side facing the other ring, the way a real string pulls on a screw eye.
  function stringEnds(g, style, ctlAt, place) {
    const bars = barAttach(g), eyes = eyelets(g);
    return bars.map((b, i) => {
      const e = eyes[i];
      if (style === 'eye' && g.ring) {
        const rc = [b.a[0] + b.n[0] * (g.w / 2 + g.ring * .45), b.a[1] + b.n[1] * (g.w / 2 + g.ring * .45)];
        const C = ctlAt(rc), H = place(e.ring), vx = H[0] - C[0], vy = H[1] - C[1], l = Math.hypot(vx, vy) || 1;
        return { T: [C[0] + vx / l * g.ring, C[1] + vy / l * g.ring], E: [H[0] - vx / l * g.ring, H[1] - vy / l * g.ring], ringC: rc };
      }
      // threaded through the bar: the string starts at the stick's centre line, hidden under it
      return { T: ctlAt(b.a), E: place(e.end), ringC: null };
    });
  }
  function headPath(h) {
    const { x0, x1, y0, y1, r, nub } = h, ym = (y0 + y1) / 2, k = nub * 1.15;
    return `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${R(ym - k)}Q${x1} ${ym} ${x1 + nub} ${ym}Q${x1} ${ym} ${x1} ${R(ym + k)}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${R(ym + k)}Q${x0} ${ym} ${x0 - nub} ${ym}Q${x0} ${ym} ${x0} ${R(ym - k)}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
  }
  // NieR: a machined head, chamfered corners and angled brace points
  function headPathNier(h, inset) {
    const i = inset || 0, x0 = h.x0 + i, x1 = h.x1 - i, y0 = h.y0 + i, y1 = h.y1 - i, c = 4.2 - i * .4, ym = (h.y0 + h.y1) / 2, nub = Math.max(0, h.nub - i * .9), k = h.nub * 1.1 - i * .2;
    return `M${R(x0 + c)} ${R(y0)}H${R(x1 - c)}L${R(x1)} ${R(y0 + c)}V${R(ym - k)}L${R(x1 + nub)} ${R(ym)}L${R(x1)} ${R(ym + k)}V${R(y1 - c)}L${R(x1 - c)} ${R(y1)}H${R(x0 + c)}L${R(x0)} ${R(y1 - c)}V${R(ym + k)}L${R(x0 - nub)} ${R(ym)}L${R(x0)} ${R(ym - k)}V${R(y0 + c)}Z`;
  }

  /* ------------------------------------------------------------- the face */
  // Shapes in "ink": fills and strokes in one colour. Tray templates punch them out instead.
  function faceShapes(g, mood, ink, opts) {
    const cx = 32, { dx, y, r } = g.eye, m = g.mouth, L = cx - dx, Rx = cx + dx;
    const st = (d, w) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${R(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const dot = (x, yy, rr) => `<circle cx="${R(x)}" cy="${R(yy)}" r="${R(rr)}" fill="${ink}"/>`;
    const shine = (x, yy, rr) => opts.shine ? `<circle cx="${R(x + rr * .36)}" cy="${R(yy - rr * .38)}" r="${R(rr * .32)}" fill="#fff"/>` : '';
    const c = opts.cls || {};
    const eyes = (inner) => `<g class="${c.eyes || ''}"><g class="${c.blink || ''}">${inner}</g></g>`;
    const smile = st(`M${R(cx - m.w / 2)} ${m.y}Q${cx} ${R(m.y + m.d)} ${R(cx + m.w / 2)} ${m.y}`, m.sw);
    switch (mood) {
      case 'happy': {
        const arc = (x) => `M${R(x - r)} ${R(y + r * .5)}Q${x} ${R(y - r * 1.25)} ${R(x + r)} ${R(y + r * .5)}`;
        return eyes(st(arc(L) + arc(Rx), r * .78)) +
          `<path d="M${R(cx - m.w * .62)} ${R(m.y - .6)}Q${cx} ${R(m.y + m.d * 2.1)} ${R(cx + m.w * .62)} ${R(m.y - .6)}Z" fill="${ink}" stroke="${ink}" stroke-width="${R(m.sw * .6)}" stroke-linejoin="round"/>`;
      }
      case 'alert':
        return eyes(dot(L, y - .5, r * 1.22) + dot(Rx, y - .5, r * 1.22) + shine(L, y - .5, r * 1.22) + shine(Rx, y - .5, r * 1.22)) + `<ellipse cx="${cx}" cy="${R(m.y + 1.2)}" rx="${R(m.w * .22)}" ry="${R(m.w * .27)}" fill="${ink}"/>`;
      case 'error': {
        const x = (xx) => `M${R(xx - r)} ${R(y - r)}L${R(xx + r)} ${R(y + r)}M${R(xx + r)} ${R(y - r)}L${R(xx - r)} ${R(y + r)}`;
        return eyes(st(x(L) + x(Rx), r * .66)) + st(`M${R(cx - m.w / 2)} ${R(m.y + 1.6)}Q${R(cx - m.w / 4)} ${R(m.y)} ${cx} ${R(m.y + 1.6)}T${R(cx + m.w / 2)} ${R(m.y + 1.6)}`, m.sw * .85);
      }
      case 'wonder': {
        // curious about something new (a choice being looked at): bright eyes glancing up to one side, that side's brow
        // lifted, a small smile turned the same way. Where 'think' is busy working something out, this one is delighted to wonder
        const ex = r * .42, ey = -r * .5, er = r * 1.05, gx = Rx + ex;
        const brow = st(`M${R(gx - r * 1.15)} ${R(y - r * 1.95)}Q${R(gx - r * .1)} ${R(y - r * 2.8)} ${R(gx + r * 1.1)} ${R(y - r * 2.2)}`, r * .48);
        return `<g class="${c.eyes || ''}"><g class="${c.blink || ''}">${dot(L + ex, y + ey, er) + dot(gx, y + ey, er) + shine(L + ex, y + ey, er) + shine(gx, y + ey, er)}</g>${brow}</g>`
          + st(`M${R(cx - m.w * .26)} ${R(m.y)}Q${R(cx + m.w * .08)} ${R(m.y + m.d * 1.1)} ${R(cx + m.w * .42)} ${R(m.y)}`, m.sw * .9);
      }
      case 'oops': {
        // something went wrong (a sign-in that failed, a key that was refused): worried brows, a wobbly mouth and a
        // bead of sweat; sympathetic, not broken (that is 'error')
        const brow = (xx, s) => `M${R(xx - s * r * 1.15)} ${R(y - r * 1.5)}L${R(xx + s * r * .95)} ${R(y - r * 2.25)}`;
        const qx = Rx + r * 2.35, qy = y - r * 1.55;
        const drop = g.detail ? `<path d="M${R(qx)} ${R(qy - 2.7)}C${R(qx + 2)} ${R(qy - .2)} ${R(qx + 2)} ${R(qy + 2)} ${R(qx)} ${R(qy + 2)}C${R(qx - 2)} ${R(qy + 2)} ${R(qx - 2)} ${R(qy - .2)} ${R(qx)} ${R(qy - 2.7)}Z" fill="#fff" fill-opacity=".92" stroke="${ink}" stroke-width=".55"/>` : '';
        return `<g class="${c.eyes || ''}"><g class="${c.blink || ''}">${dot(L, y + .4, r * .9) + dot(Rx, y + .4, r * .9) + shine(L, y + .4, r * .9) + shine(Rx, y + .4, r * .9)}</g>${st(brow(L, 1) + brow(Rx, -1), r * .5)}</g>`
          + st(`M${R(cx - m.w * .45)} ${R(m.y + 1)}Q${R(cx - m.w * .22)} ${R(m.y - .7)} ${cx} ${R(m.y + 1)}T${R(cx + m.w * .45)} ${R(m.y + 1)}`, m.sw * .85) + drop;
      }
      case 'sleep': {
        const cl = (xx) => `M${R(xx - r)} ${R(y)}Q${xx} ${R(y + r * 1.15)} ${R(xx + r)} ${R(y)}`;
        return eyes(st(cl(L) + cl(Rx), r * .7)) + `<ellipse cx="${cx}" cy="${R(m.y + 1.4)}" rx="${R(m.w * .14)}" ry="${R(m.w * .18)}" fill="${ink}"/>`;
      }
      case 'think':
        return eyes(dot(L + r * .35, y - r * .45, r) + dot(Rx + r * .35, y - r * .45, r) + shine(L + r * .35, y - r * .45, r) + shine(Rx + r * .35, y - r * .45, r)) + st(`M${R(cx - m.w * .2)} ${R(m.y + 1.2)}H${R(cx + m.w * .45)}`, m.sw * .9);
      case 'dots': {
        const dr = r * .8, gap = r * 2.35;
        return [-1, 0, 1].map((i) => `<g class="${(c.dot || '') + (i + 2)}">${dot(cx + i * gap, y + 2.5, dr)}</g>`).join('');
      }
      case 'wink': {
        const arc = `M${R(Rx - r)} ${R(y + r * .2)}Q${Rx} ${R(y - r * 1.05)} ${R(Rx + r)} ${R(y + r * .2)}`;
        return eyes(dot(L, y, r) + shine(L, y, r) + st(arc, r * .78)) + st(`M${R(cx - m.w / 2)} ${m.y}Q${R(cx + m.w * .1)} ${R(m.y + m.d * 1.15)} ${R(cx + m.w / 2 + .6)} ${R(m.y - .8)}`, m.sw);
      }
      case 'blank': return '';
      default:
        return eyes(dot(L, y, r) + dot(Rx, y, r) + shine(L, y, r) + shine(Rx, y, r)) + smile;
    }
  }

  /* ---------------------------------------------------- Pip, vector themes */
  const solidStr = (th) => th.str.indexOf('rgba') === 0 ? (th.scheme === 'dark' ? '#B9C2D2' : '#5B6476') : th.str;
  function controlSvg(g, th, cls, opts) {
    const { s1, s2 } = sticks(g), cap = 'round';
    const tray = opts.tray, glass = !tray && th.glass;
    const col = tray ? opts.ink : glass ? th.glass.rod : th.ctl;
    // the back stick is shaded with a solid colour, never transparency, so nothing shows through it
    const back = tray || th.flatCtl || !g.detail ? col : mix(col, th.bg, .42);
    const style = opts.attach || 'eye', strc = tray ? opts.ink : solidStr(th);
    let under = '';
    if (g.detail && !tray) {
      stringEnds(g, style, (q) => q, (q) => q).forEach((e) => {
        // a screw eye on the bar's underside, its top tucked under the stick, matching the one on Pip
        if (e.ringC) under += `<circle cx="${R(e.ringC[0])}" cy="${R(e.ringC[1])}" r="${g.ring}" fill="none" stroke="${strc}" stroke-width="${g.ringW}"/>`;
      });
    }
    let s = under + line(s1[0], s1[1], g.w, back, cap) + line(s2[0], s2[1], g.w, col, cap);
    if (glass && g.detail) {
      // glass rods: a fine specular line along the upper edge of each stick
      const sa = Math.sin(g.ang * D2R), ca = Math.cos(g.ang * D2R), k = g.w * .24;
      const up1 = [sa * k, -ca * k], up2 = [-sa * k, -ca * k];
      const hl = th.scheme === 'dark' ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.75)';
      const h1 = shorten(s1.map((q) => [q[0] + up1[0], q[1] + up1[1]]), 2.4), h2 = shorten(s2.map((q) => [q[0] + up2[0], q[1] + up2[1]]), 2.4);
      s += line(h1[0], h1[1], .9, hl, 'round', ' opacity=".55"') + line(h2[0], h2[1], .9, hl, 'round');
    }
    if (g.detail && !tray) s += `<circle cx="${g.P[0]}" cy="${g.P[1]}" r="1.55" fill="${th.pin || th.str}"/>`;
    return `<g class="${cls.ctl || ''}">${s}</g>`;
  }
  function shorten(seg, k) {
    const [a, b] = seg, l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l;
    return [[a[0] + ux * k, a[1] + uy * k], [b[0] - ux * k, b[1] - uy * k]];
  }

  function pipHead(g, th, mood, ids, cls, opts) {
    const h = g.head, d = headPath(h), tray = opts.tray;
    let defs = '', s = '';
    if (tray) {
      // one ink with the face punched out: a valid macOS template image
      defs += `<mask id="${ids.face}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="80" height="80"><rect x="-8" y="-8" width="80" height="80" fill="#fff"/><g class="${cls.face || ''}">${faceShapes(g, mood, '#000', { cls })}</g></mask>`;
      s += `<path d="${d}" fill="${opts.ink}" mask="url(#${ids.face})"/>`;
      return { defs, body: s };
    }
    if (th.glass) {
      const gl = th.glass, { x0, x1, y0, y1 } = h, cxh = (x0 + x1) / 2;
      defs += grad(ids.grad, gl.tint, x0, y0, x1 - 4, y1);
      defs += `<clipPath id="${ids.clip}"><path d="${d}"/></clipPath>`;
      defs += `<linearGradient id="${ids.rim}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}"><stop offset="0" stop-color="${gl.rimTop}"/><stop offset=".3" stop-color="${gl.rimTop}" stop-opacity="0"/><stop offset=".72" stop-color="${gl.rimBot}" stop-opacity="0"/><stop offset="1" stop-color="${gl.rimBot}"/></linearGradient>`;
      defs += `<radialGradient id="${ids.glow}" cx="${cxh}" cy="${y1 + 2}" r="${R((x1 - x0) * .55)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="${th.scheme === 'dark' ? .55 : .7}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
      defs += `<radialGradient id="${ids.spec}" cx="${x0 + 9}" cy="${y0 + 6}" r="13" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".55" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
      if (g.detail) defs += `<filter id="${ids.drop}" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.6" flood-color="${gl.drop}"/></filter>`;
      let refr = '';
      if (opts.backdrop && g.detail) {
        // on the app tile the wallpaper is known: show it through the glass, magnified and frosted
        const bd = opts.backdrop, k = 64 / bd.size, rb = ribbonsSvg(bd.wall, ids.grad + 'w');
        defs += rb.defs + `<filter id="${ids.grad}f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.1"/></filter>`;
        const cy = (y0 + y1) / 2;
        refr = `<g clip-path="url(#${ids.clip})"><g filter="url(#${ids.grad}f)" transform="translate(${cxh} ${cy}) scale(1.16) translate(${-cxh} ${-cy}) scale(${R(k)}) translate(${-bd.x} ${-bd.y})">${rb.body}</g></g>`;
      }
      s += `<g${g.detail ? ` filter="url(#${ids.drop})"` : ''}>${refr}<path d="${d}" fill="url(#${ids.grad})" fill-opacity="${refr ? gl.alpha * .62 : g.detail ? gl.alpha : 1}"/>`;
      s += `<path d="${d}" fill="${gl.frost}"/>`;
      if (g.detail) {
        s += `<g clip-path="url(#${ids.clip})"><rect x="${x0 - 6}" y="${y0}" width="${x1 - x0 + 12}" height="${y1 - y0}" fill="url(#${ids.glow})"/>`;
        s += `<ellipse cx="${x0 + 9}" cy="${y0 + 6}" rx="13" ry="9" fill="url(#${ids.spec})"/>`;
        s += `<path d="${d}" fill="none" stroke="url(#${ids.rim})" stroke-width="2.6"/></g>`;
      }
      if (!g.detail) {
        defs += `<clipPath id="${ids.clip}"><path d="${d}"/></clipPath>`;
        s += `<path d="${d}" fill="none" stroke="url(#${ids.rim})" stroke-width="4" clip-path="url(#${ids.clip})"/>`;
      }
      s += `<path d="${d}" fill="none" stroke="${gl.edge}" stroke-width="${g.detail ? .6 : 1}"/></g>`;
    } else {
      const fill = Array.isArray(th.head) ? (defs += grad(ids.grad, th.head, 0, h.y0, 0, h.y1), `url(#${ids.grad})`) : th.head;
      s += `<path d="${d}" fill="${fill}"/>`;
      if (th.sheen && g.detail) {
        // a soft vinyl-toy highlight in one corner (never a band across the top)
        defs += `<radialGradient id="${ids.spec}" cx="${h.x0 + 8}" cy="${h.y0 + 6}" r="10" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="${th.sheen}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
        defs += `<clipPath id="${ids.clip}"><path d="${d}"/></clipPath>`;
        s += `<ellipse cx="${h.x0 + 8}" cy="${h.y0 + 6}" rx="11" ry="8" fill="url(#${ids.spec})" clip-path="url(#${ids.clip})"/>`;
      }
    }
    if (g.detail && th.cheek && mood !== 'error' && mood !== 'dots') {
      const cy = g.eye.y + 6.2, op = th.glass ? .75 : .95;
      s += `<ellipse cx="${32 - g.eye.dx - 4.2}" cy="${cy}" rx="3.1" ry="1.9" fill="${th.cheek}" opacity="${op}"/><ellipse cx="${32 + g.eye.dx + 4.2}" cy="${cy}" rx="3.1" ry="1.9" fill="${th.cheek}" opacity="${op}"/>`;
    }
    s += `<g class="${cls.face || ''}">${faceShapes(g, mood, th.eye, { cls, shine: g.detail && th.shine })}</g>`;
    return { defs, body: s };
  }

  function eyeletRings(g, th, opts) {
    if (!g.ring || opts.tray) return '';
    const col = solidStr(th);
    return eyelets(g).map((e) => `<circle cx="${R(e.ring[0])}" cy="${R(e.ring[1])}" r="${g.ring}" fill="none" stroke="${col}" stroke-width="${g.ringW}"/>`).join('');
  }

  /* --------------------------------------------------------- Pip, NieR */
  // YoRHa Pip: hairline line art like PMConcept7's own NieR Pod, a black visor with a HUD for eyes,
  // square nodes where lines end, and the diamond at the crossing.
  function nierHud(cy, mood, paper, red, cls) {
    // idle shows nothing: a plain blindfold. Every other state lights up on the band like a HUD.
    const cx = 32, dx = 6.5;
    const rect = (x, yy, w, h, c) => `<rect x="${R(x)}" y="${R(yy)}" width="${R(w)}" height="${R(h)}" fill="${c || paper}"/>`;
    const st = (d, w, c) => `<path d="${d}" fill="none" stroke="${c || paper}" stroke-width="${R(w)}" stroke-linecap="square" stroke-linejoin="miter"/>`;
    const both = (f) => f(cx - dx) + f(cx + dx);
    switch (mood) {
      case 'happy': return both((x) => st(`M${x - 2.6} ${cy + 1.3}L${x} ${cy - 1.3}L${x + 2.6} ${cy + 1.3}`, 1.3));
      case 'alert': return both((x) => rect(x - 1.7, cy - 1.7, 3.4, 3.4));
      case 'error': return both((x) => st(`M${x - 2} ${cy - 1.9}L${x + 2} ${cy + 1.9}M${x + 2} ${cy - 1.9}L${x - 2} ${cy + 1.9}`, 1.2, red));
      case 'sleep': return both((x) => rect(x - 2.6, cy + .9, 5.2, 1));
      // wondering: both eyes glance up to one side
      case 'wonder': return both((x) => rect(x + .4, cy - 2.4, 2.8, 2.8));
      // worried: each eye's top edge rises toward the middle
      case 'oops': return both((x) => { const s = x < cx ? 1 : -1; return `<path d="M${R(x - 1.5 * s)} ${R(cy - .3)}L${R(x + 1.5 * s)} ${R(cy - 2)}L${R(x + 1.5 * s)} ${R(cy + 2.1)}L${R(x - 1.5 * s)} ${R(cy + 2.1)}Z" fill="${paper}"/>`; });
      case 'think': case 'dots': return [-1, 0, 1].map((i) => `<g class="${(cls.dot || '') + (i + 2)}">${rect(cx + i * 4.4 - 1.2, cy - 1.2, 2.4, 2.4)}</g>`).join('');
      default: return '';
    }
  }
  function pipNier(g, th, mood, cls, ids, opts) {
    const ink = opts.tray ? opts.ink : th.ink, paper = opts.tray ? '#000' : th.paper, small = !g.detail;
    const { s1, s2 } = sticks(g), A = anchors(g), h = g.head;
    const E = g.eyeletX.map((x) => ({ x, base: h.y0, end: [x, h.y0 + 1.5] }));
    const sq = (p, n, c) => `<rect x="${R(p[0] - n / 2)}" y="${R(p[1] - n / 2)}" width="${R(n)}" height="${R(n)}" fill="${c || ink}"/>`;
    const sw = small ? 3.6 : 2.4;
    // the control: two flat bars, the front one cut out of the back one, square nodes, a diamond pin
    let ctl = line(s1[0], s1[1], sw, ink, 'butt');
    if (!opts.tray) ctl += line(shorten(s2, 1)[0], shorten(s2, 1)[1], sw + 2.2, th.bg, 'butt');
    ctl += line(s2[0], s2[1], sw, ink, 'butt');
    if (!small) {
      [s1[0], s1[1], s2[0], s2[1]].forEach((p) => { ctl += sq(p, 3.4); });
      ctl += `<path d="M${g.P[0]} ${g.P[1] - 3.6}L${g.P[0] + 3.6} ${g.P[1]}L${g.P[0]} ${g.P[1] + 3.6}L${g.P[0] - 3.6} ${g.P[1]}Z" fill="${ink}"${opts.tray ? '' : ` stroke="${th.bg}" stroke-width="1.1"`}/>`;
    }
    // nodes hang from the bar's underside, the way every NieR line ends in a square
    const nodes = barAttach(g).map((b) => [b.a[0] + b.n[0] * (sw / 2 + .95), b.a[1] + b.n[1] * (sw / 2 + .95)]);
    if (!small) nodes.forEach((q) => { ctl += sq(q, 2.4); });
    const strings = nodes.map((q, i) => line(small ? A[i] : q, small ? E[i].end : [E[i].x, E[i].base], small ? 2.6 : 1, ink, 'butt')).join('');
    // the head: hairline line art like PMConcept7's Pod, with an inner frame line
    const d = headPathNier(h);
    let headS = opts.tray ? `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${small ? 4 : 2.2}" stroke-linejoin="miter"/>`
      : `<path d="${d}" fill="${paper}" stroke="${ink}" stroke-width="${small ? 2.6 : 1.5}" stroke-linejoin="miter"/>`;
    if (!small && !opts.tray) headS += `<path d="${headPathNier(h, 2.6)}" fill="none" stroke="${ink}" stroke-opacity=".38" stroke-width=".5"/>`;
    if (!small) E.forEach((e) => { headS += sq([e.x, e.base], 2.6); });
    // the YoRHa blindfold: one band wrapped edge to edge, above the brace points
    const vy = small ? 42 : 40.6, vh = small ? 8 : 6.6, vx0 = h.x0 + (small ? 4.2 : .75), vx1 = h.x1 - (small ? 4.2 : .75);
    let visor = `<rect x="${R(vx0)}" y="${R(vy - vh / 2)}" width="${R(vx1 - vx0)}" height="${R(vh)}" fill="${ink}"/>`;
    if (!small) {
      // the blindfold's knot is behind the head; its two tails fly out past the right ear
      const tx = h.x1 + .4, ty = vy - vh / 2 + .6;
      visor += `<path d="M${R(tx - 1)} ${R(ty)}L${R(tx + 7.8)} ${R(ty + 3.6)}L${R(tx + 8.6)} ${R(ty + 5.6)}L${R(tx - 1)} ${R(ty + 2.6)}Z" fill="${ink}"/>`;
      visor += `<path d="M${R(tx - 1)} ${R(ty + 2.9)}L${R(tx + 6.2)} ${R(ty + 9.4)}L${R(tx + 6.4)} ${R(ty + 11.4)}L${R(tx - 1)} ${R(ty + 5.4)}Z" fill="${ink}"/>`;
    }
    if (mood === 'error' && !small) {
      // a slice glitch: the band torn and shifted, the way NieR tears a screen
      visor = `<rect x="${R(vx0)}" y="${R(vy - vh / 2)}" width="${R(vx1 - vx0)}" height="${R(vh * .55)}" fill="${ink}"/><rect x="${R(vx0 + 2.4)}" y="${R(vy - vh / 2 + vh * .55 + .9)}" width="${R(vx1 - vx0 - 2.4)}" height="${R(vh * .45 - .9)}" fill="${ink}"/>`;
    }
    let hud = `<g class="${cls.face || ''}">${nierHud(vy, mood, opts.tray ? '#000' : th.paper, opts.tray ? '#000' : th.red, cls)}</g>`;
    if (opts.tray) {
      const mid = ids.face + 'v';
      visor = `<mask id="${mid}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="80" height="80"><rect x="-8" y="-8" width="80" height="80" fill="#fff"/>${nierHud(vy, mood, '#000', '#000', cls)}</mask><g mask="url(#${mid})">${visor}</g>`;
      hud = '';
    }
    const my = small ? 52.5 : 51, mw = small ? 8 : 6, mt = small ? 2.8 : 1.5;
    const mouth = mood === 'alert' ? `<rect x="30.4" y="${R(my - 1)}" width="3.2" height="3.2" fill="${ink}"/>`
      : mood === 'happy' ? `<path d="M${R(32 - mw / 2 - .6)} ${R(my - .4)}L${R(32 - mw / 4)} ${R(my + 1.6)}H${R(32 + mw / 4)}L${R(32 + mw / 2 + .6)} ${R(my - .4)}" fill="none" stroke="${ink}" stroke-width="${mt}"/>`
      : mood === 'wonder' ? `<path d="M${R(32 - mw * .3)} ${R(my - .2)}L${R(32 - mw * .05)} ${R(my + 1.2)}H${R(32 + mw * .3)}L${R(32 + mw * .55)} ${R(my - .6)}" fill="none" stroke="${ink}" stroke-width="${mt}"/>`
      : mood === 'oops' ? `<path d="M${R(32 - mw / 2)} ${R(my + .8)}Q${R(32 - mw / 4)} ${R(my - .7)} 32 ${R(my + .8)}T${R(32 + mw / 2)} ${R(my + .8)}" fill="none" stroke="${ink}" stroke-width="${mt}"/>`
      : mood === 'error' || mood === 'sleep' ? `<rect x="${R(32 - mw * .35)}" y="${R(my)}" width="${R(mw * .7)}" height="${mt}" fill="${ink}"/>`
      : `<rect x="${R(32 - mw / 2)}" y="${R(my)}" width="${R(mw)}" height="${mt}" fill="${ink}"/>`;
    const head = `<g class="${cls.pup || ''}">${headS}${visor}${hud}${mouth}</g>`;
    // parts, for places that hang the head at their own distance (the onboarding stage)
    if (opts.parts) return { ctl, headInner: headS + visor + hud + mouth, barNodes: nodes, headNodes: E.map((e) => [e.x, e.base]) };
    return { defs: '', body: strings + head + `<g class="${cls.ctl || ''}">${ctl}</g>` };
  }

  /* ------------------------------------------------------ vector: monogram */
  const MONO_GEO = {
    full: { P: [32, 13.5], half: 23, ang: 18, w: 6, strW: 1.6, ring: 1.4, ringW: 1.1, lw: 7, yT: 32.5, yB: 59, p: 9.5, m0: 34.5, m1: 55, detail: true },
    small: { P: [32, 13.5], half: 24, ang: 18, w: 7.5, strW: 3.2, ring: 0, ringW: 0, lw: 9, yT: 32, yB: 60, p: 9, m0: 35, m1: 56, detail: false }
  };
  // The monogram's strings: P hangs from one, M from two. Each hangs from a screw eye under the
  // lower stick and ends in the top of its letter; like Pip's, they are solved for every frame.
  function monoStrings(g) {
    const { s1, s2 } = sticks(g), xs = [g.p, g.m0, g.m1], ca = Math.cos(g.ang * D2R);
    const yOn = (seg, x) => seg[0][1] + (seg[1][1] - seg[0][1]) * (x - seg[0][0]) / (seg[1][0] - seg[0][0]);
    return xs.map((x, i) => {
      const yc = Math.max(yOn(s1, x), yOn(s2, x)), edge = yc + g.w / 2 / ca;
      return { x, letter: i === 0 ? 0 : 1, ringC: [x, edge + (g.ring ? g.ring * .45 : -1.2)], end: [x, g.yT] };
    });
  }
  function monoEnds(g, cRot, dys) {
    return monoStrings(g).map((st) => {
      const C = rot(st.ringC, g.P, cRot), L = [st.end[0], st.end[1] + dys[st.letter]];
      if (!g.ring) return { T: C, E: L };
      const vx = L[0] - C[0], vy = L[1] - C[1], l = Math.hypot(vx, vy) || 1;
      return { T: [C[0] + vx / l * g.ring, C[1] + vy / l * g.ring], E: L };
    });
  }
  function monoVector(th, tier, cls, opts, p, anim) {
    const g = MONO_GEO[tier === 'small' ? 'small' : 'full'];
    const tray = opts.tray, ink = tray ? opts.ink : null;
    const ctlCol = ink || (th.glass ? th.glass.rod : th.ctl), strCol = ink || th.str, letCol = ink || th.letter;
    const { s1, s2 } = sticks(g), cap = th.nier ? 'butt' : 'round';
    const back = tray || th.flatCtl || !g.detail ? ctlCol : mix(ctlCol, th.bg, .42);
    const rings = g.ring && !tray ? monoStrings(g).map((st) => th.nier
      ? `<rect x="${R(st.ringC[0] - 1.2)}" y="${R(st.ringC[1] - 1.2)}" width="2.4" height="2.4" fill="${th.ink}"/>`
      : `<circle cx="${R(st.ringC[0])}" cy="${R(st.ringC[1])}" r="${g.ring}" fill="none" stroke="${solidStr(th)}" stroke-width="${g.ringW}"/>`).join('') : '';
    const ctl = `<g class="${cls.ctl || ''}">${rings}${line(s1[0], s1[1], g.w, back, cap)}${line(s2[0], s2[1], g.w, ctlCol, cap)}</g>`;
    const { yT, yB, m0, m1, lw } = g, px0 = g.p, bw = 17.5, bh = 17;
    const P = `M${px0} ${yB}V${yT}H${px0 + 7.5}C${px0 + bw - 2} ${yT} ${px0 + bw} ${yT + 4} ${px0 + bw} ${R(yT + bh / 2)}C${px0 + bw} ${yT + bh - 4} ${px0 + bw - 2} ${yT + bh} ${px0 + 7.5} ${yT + bh}H${px0}`;
    const M = `M${m0} ${yB}V${yT}L${(m0 + m1) / 2} ${yT + 16}L${m1} ${yT}V${yB}`;
    const letter = (d) => `<path d="${d}" fill="none" stroke="${letCol}" stroke-width="${lw}" stroke-linecap="${th.nier ? 'square' : 'round'}" stroke-linejoin="${th.nier ? 'miter' : 'round'}"/>`;
    const ends = monoEnds(g, 0, [0, 0]);
    const strings = anim
      ? ends.map((e, i) => { const vx = e.E[0] - e.T[0], vy = e.E[1] - e.T[1]; return `<line class="${p}-str ${p}-s${i}" x1="0" y1="0" x2="0" y2="1" stroke="${strCol}" stroke-width="${g.strW}" transform="translate(${R(e.T[0])} ${R(e.T[1])}) rotate(${R(Math.atan2(-vx, vy) / D2R)}) scale(1 ${R(Math.hypot(vx, vy))})"/>`; }).join('')
      : ends.map((e) => line(e.T, e.E, g.strW, strCol, 'butt')).join('');
    return { defs: '', body: `${strings}<g class="${cls.l1 || ''}">${letter(P)}</g><g class="${cls.l2 || ''}">${letter(M)}</g>${ctl}` };
  }
  function monoRigCss(p, th, tier) {
    const g = MONO_GEO[tier === 'small' ? 'small' : 'full'], fam = MOTION[th.family] || MOTION.basic, d = fam.dur, a = fam.amp, N = 30;
    const step = (u) => { u = ((u % 1) + 1) % 1; return u < .5 ? Math.sin(2 * Math.PI * u) : 0; };
    const k = { c: [], l1: [], l2: [], s: [[], [], []] };
    for (let i = 0; i <= N; i++) {
      const u = i / N, pc = R(u * 100) + '%', cRot = 6 * a * Math.sin(2 * Math.PI * u), dys = [-5 * a * step(u), -5 * a * step(u - .5)];
      k.c.push(`${pc}{transform:rotate(${R(cRot)}deg)}`);
      k.l1.push(`${pc}{transform:translate(0px,${R(dys[0])}px)}`); k.l2.push(`${pc}{transform:translate(0px,${R(dys[1])}px)}`);
      monoEnds(g, cRot, dys).forEach((e, j) => { const vx = e.E[0] - e.T[0], vy = e.E[1] - e.T[1]; k.s[j].push(`${pc}{transform:translate(${R(e.T[0])}px,${R(e.T[1])}px) rotate(${R(Math.atan2(-vx, vy) / D2R)}deg) scale(1,${R(Math.hypot(vx, vy))})}`); });
    }
    let css = `.${p}-ctl{transform-box:view-box;transform-origin:${g.P[0]}px ${g.P[1]}px;animation:${p}-c ${d}s linear infinite}.${p}-str{transform-box:view-box;transform-origin:0 0}`;
    css += `.${p}-l1{animation:${p}-a ${d}s linear infinite}.${p}-l2{animation:${p}-b ${d}s linear infinite}`;
    css += `@keyframes ${p}-c{${k.c.join('')}}@keyframes ${p}-a{${k.l1.join('')}}@keyframes ${p}-b{${k.l2.join('')}}`;
    k.s.forEach((frames, j) => { css += `.${p}-s${j}{animation:${p}-s${j} ${d}s linear infinite}@keyframes ${p}-s${j}{${frames.join('')}}`; });
    return css;
  }

  /* ------------------------------------------------------------ pixel art */
  // Sprites on 16, 24 and 32 grids: crisp tray and favicon sizes, and Retro's look at every size.
  // Sticks and heads are drawn from rules, faces are stamped as [x, y, w, h] holes, and the strings
  // are pixel lines from the stick to the head, redrawn for every animation frame.
  function stairSticks(G, x0, x1, ytop, step, thick) {
    const g = Array.from({ length: G }, () => Array(G).fill('.'));
    const n = Math.ceil((x1 - x0 + 1) / step);
    const rowAt = (x) => ytop + (n - 1 - Math.floor((x - x0) / step));
    for (let x = x0; x <= x1; x++) for (let t = 0; t < thick; t++) { const xb = G - 1 - x; if (g[rowAt(x) + t][xb] === '.') g[rowAt(x) + t][xb] = 'b'; }
    for (let x = x0; x <= x1; x++) for (let t = 0; t < thick; t++) g[rowAt(x) + t][x] = 'c';
    return g.map((r) => r.join(''));
  }
  function roundHead(G, x0, x1, y0, y1, r, nubRows) {
    const rows = [];
    for (let y = 0; y < G; y++) {
      let row = '';
      for (let x = 0; x < G; x++) {
        const px = x + .5, py = y + .5;
        let h = false;
        if (px >= x0 && px <= x1 && py >= y0 && py <= y1) {
          const qx = Math.min(px - x0, x1 - px), qy = Math.min(py - y0, y1 - py);
          h = !(qx < r && qy < r && Math.hypot(r - qx, r - qy) > r + .15);
        }
        if (nubRows.indexOf(y) >= 0 && (x === Math.floor(x0) - 1 || x === Math.floor(x1))) h = true;
        row += h ? 'h' : '.';
      }
      rows.push(row);
    }
    return rows;
  }
  const SPRITES = {
    16: {
      sticks: ['................', '..cccccccccccc..', '..cccccccccccc..'].concat(Array(13).fill('................')),
      head: Array(5).fill('................').concat(['...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '.hhhhhhhhhhhhhh.',
        '.hhhhhhhhhhhhhh.', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '...hhhhhhhhhh...', '................']),
      anchor: [4, 3], eyelet: [4, 4],
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
      sticks: stairSticks(24, 2, 21, 1, 4, 2),
      head: roundHead(24, 4, 20, 10.5, 22.5, 4, [16, 17]),
      anchor: [4, 7], eyelet: [7, 9],
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
      sticks: stairSticks(32, 3, 28, 2, 4, 2),
      head: roundHead(32, 6, 26, 14.5, 30.5, 5.5, [21, 22, 23]),
      anchor: [5, 10], eyelet: [10, 13],
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
  // NieR at tray size: hairline head, visor band, nodes at the bar ends
  const NIER16 = {
    base: [
      '................',
      '................',
      '.nn..........nn.',
      '.nnccccccccccnn.',
      '....s......s....',
      '....s......s....',
      '...hhhhhhhhhh...',
      '..h..........h..',
      '..h.vvvvvvvv.h..',
      '.hhvvvvvvvvvvhh.',
      '.hh.vvvvvvvv.hh.',
      '..h..........h..',
      '..h....mm....h..',
      '..h..........h..',
      '...hhhhhhhhhh...',
      '................'
    ],
    // rows 8-10 are the blindfold (solid when idle, like the large mark), 11-13 the mouth area
    moods: {
      happy: { 8: '..h.vv.vv.vv.h..', 9: '.hhvv.vvvv.vvhh.', 12: '..h...m..m...h..', 13: '..h....mm....h..' },
      alert: { 8: '..h.v..vv..v.h..', 9: '.hhvv..vv..vvhh.', 12: '..h....mm....h..', 13: '..h....mm....h..' },
      error: { 8: '..h.v.vvvv.v.h..', 9: '.hhvvv.vv.vvvhh.', 10: '.hh.v.vvvv.v.hh.', 12: '..h...mmmm...h..' },
      sleep: { 9: '.hhvvvvvvvvvvhh.', 10: '.hh.v..vv..v.hh.', 12: '..h...mmmm...h..' },
      think: { 9: '.hhvv.v.v.v.vhh.', 12: '..h....mmm...h..' }
    }
  };
  function nier16(mood) {
    const rows = NIER16.base.slice(), o = NIER16.moods[mood] || {};
    Object.keys(o).forEach((k) => { rows[+k] = o[k]; });
    return rows;
  }
  function bresenham(a, b) {
    const pts = []; let [x0, y0] = a; const [x1, y1] = b;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
    for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
    return pts;
  }
  function spriteRows(G, mood, f0) {
    const { dx = 0, eyeDx = 0, dy = 0, lift = -1 } = f0 || {};
    const S = SPRITES[G];
    const g = Array.from({ length: G }, () => Array(G).fill('.'));
    const put = (x, y, ch) => { if (x >= 0 && x < G && y >= 0 && y < G) g[y][x] = ch; };
    S.sticks.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') put(x, y, ch); }));
    S.head.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'h') put(x + dx, y + dy, 'h'); }));
    // strings: from just under each stick to just above the head, wherever the head has swung to
    [[S.anchor, S.eyelet], [[G - 1 - S.anchor[0], S.anchor[1]], [G - 1 - S.eyelet[0], S.eyelet[1]]]].forEach(([a, e]) => {
      bresenham(a, [e[0] + dx, e[1] + dy]).forEach(([x, y]) => { if (g[y] && g[y][x] === '.') put(x, y, 's'); });
    });
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
  function spriteGrid(dev) {
    if (dev >= 64) return 32;
    let best = 16, cover = 0;
    [16, 24, 32].forEach((Gs) => { const k = Math.floor(dev / Gs); if (k >= 1 && Gs * k >= cover) { best = Gs; cover = Gs * k; } });
    return best;
  }
  const MONO_PX = [
    '................', '.cccccccccccccc.', '.cccccccccccccc.', '..s.....s....s..', '..s.....s....s..',
    '.hhhhh..hh...hh.', '.hh..hh.hhh.hhh.', '.hh..hh.hhhhhhh.', '.hh..hh.hh.h.hh.', '.hhhhh..hh...hh.',
    '.hh.....hh...hh.', '.hh.....hh...hh.', '.hh.....hh...hh.', '.hh.....hh...hh.', '.hh.....hh...hh.', '................'
  ];
  function pixelRects(rows, colors) {
    let s = '';
    const Gs = rows.length;
    rows.forEach((row, y) => {
      let x = 0;
      while (x < Gs) {
        const ch = row[x];
        if (ch === '.' || ch === 'e' || !colors[ch]) { x++; continue; }
        let w = 1;
        while (x + w < Gs && row[x + w] === ch) w++;
        s += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${colors[ch]}"/>`;
        x += w;
      }
    });
    return s;
  }

  /* ------------------------------------------------------------- the rig */
  // Motion as sampled poses. Each pose: control angle and lift, Pip's angle, lift and squash, and
  // where the eyes look. Strings are solved from those poses, so they stay tied at both ends.
  function wave(kind, u) {
    const s = Math.sin(2 * Math.PI * u);
    if (kind === 'spring') return Math.sin(2 * Math.PI * u + .32 * Math.sin(2 * Math.PI * u)) * 1.02;
    if (kind === 'glide') return s * (1 - .08 * Math.cos(4 * Math.PI * u));
    return s;
  }
  function pose(kind, fam, u) {
    const a = fam.amp, w = fam.wave;
    if (kind === 'think') {
      const bob = .5 - .5 * Math.cos(4 * Math.PI * u);
      return { cRot: 2.6 * a * Math.sin(2 * Math.PI * u), cDy: -.6 * bob, pRot: 1.6 * a * Math.sin(2 * Math.PI * u - .5), pDy: -1.7 * a * bob, sx: 1, sy: 1, eye: 0 };
    }
    if (kind === 'hop') {
      const air = (v) => { v = ((v % 1) + 1) % 1; return v < .62 ? Math.sin(Math.PI * v / .62) : 0; };
      const land = (v) => { v = ((v % 1) + 1) % 1; return v >= .62 && v < .8 ? Math.sin(Math.PI * (v - .62) / .18) : 0; };
      const take = u < .14 ? Math.sin(Math.PI * u / .14) : 0, sq = land(u);
      return { cRot: 0, cDy: -3.2 * a * air(u + .05), pRot: 0, pDy: -6 * a * air(u), sx: 1 + .08 * sq - .03 * take, sy: 1 - .11 * sq + .05 * take, eye: 0 };
    }
    const lag = w === 'glide' ? .13 : .1;
    return { cRot: 7 * a * wave(w, u), cDy: 0, pRot: 10 * a * wave(w, u - lag), pDy: 0, sx: 1, sy: 1, eye: 1.8 * a * wave(w, u - lag - .04) };
  }
  function transformsAt(g, ps, attach) {
    const P = g.P, h = g.head, H = [(h.x0 + h.x1) / 2, h.y1];
    const hx = H[0] - P[0], hy = H[1] - P[1];
    const place = (pt) => {
      // pup: translate(0,dy) rotate(r) about P, then squash about the head's base
      const q = [H[0] + (pt[0] - H[0]) * ps.sx, H[1] + (pt[1] - H[1]) * ps.sy];
      const r = rot(q, P, ps.pRot);
      return [r[0], r[1] + ps.pDy];
    };
    const ctlAt = (pt) => { const r = rot(pt, P, ps.cRot); return [r[0], r[1] + ps.cDy]; };
    const strs = stringEnds(g, attach || 'eye', ctlAt, place).map((e) => {
      const A = e.T, vx = e.E[0] - A[0], vy = e.E[1] - A[1];
      return { A, ang: Math.atan2(-vx, vy) / D2R, len: Math.hypot(vx, vy) };
    });
    return {
      ctl: `translate(0px,${R(ps.cDy)}px) rotate(${R(ps.cRot)}deg)`,
      pup: `translate(0px,${R(ps.pDy)}px) rotate(${R(ps.pRot)}deg) translate(${R(hx)}px,${R(hy)}px) scale(${R(ps.sx)},${R(ps.sy)}) translate(${R(-hx)}px,${R(-hy)}px)`,
      eye: `translate(${R(ps.eye)}px,0px)`,
      strs: strs.map((s) => `translate(${R(s.A[0])}px,${R(s.A[1])}px) rotate(${R(s.ang)}deg) scale(1,${R(s.len)})`),
      raw: strs
    };
  }
  function rigCss(p, kind, th, g, attach) {
    const fam = MOTION[th.family] || MOTION.basic, N = kind === 'hop' ? 36 : 30;
    const dur = kind === 'hop' ? R(fam.dur * .78) : kind === 'think' ? R(fam.dur * 1.15) : fam.dur;
    const k = { ctl: [], pup: [], eye: [], s0: [], s1: [] };
    for (let i = 0; i <= N; i++) {
      const u = i / N, t = transformsAt(g, pose(kind, fam, u), attach), pc = R(u * 100) + '%';
      k.ctl.push(`${pc}{transform:${t.ctl}}`); k.pup.push(`${pc}{transform:${t.pup}}`); k.eye.push(`${pc}{transform:${t.eye}}`);
      k.s0.push(`${pc}{transform:${t.strs[0]}}`); k.s1.push(`${pc}{transform:${t.strs[1]}}`);
    }
    const P = g.P;
    let css = `.${p}-ctl,.${p}-pup{transform-box:view-box;transform-origin:${P[0]}px ${P[1]}px}.${p}-str{transform-box:view-box;transform-origin:0 0}`;
    css += `.${p}-ctl{animation:${p}-c ${dur}s linear infinite}.${p}-pup{animation:${p}-p ${dur}s linear infinite}.${p}-s0{animation:${p}-s0 ${dur}s linear infinite}.${p}-s1{animation:${p}-s1 ${dur}s linear infinite}`;
    css += `@keyframes ${p}-c{${k.ctl.join('')}}@keyframes ${p}-p{${k.pup.join('')}}@keyframes ${p}-s0{${k.s0.join('')}}@keyframes ${p}-s1{${k.s1.join('')}}`;
    if (kind === 'swing') {
      css += `.${p}-eyes{animation:${p}-e ${dur}s linear infinite}@keyframes ${p}-e{${k.eye.join('')}}`;
      css += `.${p}-blink{transform-box:fill-box;transform-origin:center;animation:${p}-b ${R(dur * 2)}s linear infinite}@keyframes ${p}-b{0%,70%,77%,100%{transform:scaleY(1)}73.5%{transform:scaleY(.1)}}`;
    }
    if (kind === 'think') {
      [1, 2, 3].forEach((i) => { css += `.${p}-dot${i}{animation:${p}-hop ${R(dur * .7)}s cubic-bezier(.45,0,.3,1) infinite;animation-delay:${R((i - 1) * dur * .7 / 6)}s}`; });
      css += `@keyframes ${p}-hop{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4.2px)}}`;
    }
    return { css, dur };
  }

  /* ------------------------------------------------------- reduced motion */
  function reducedCss(p, th, px, mark) {
    const d = (MOTION[th.family] || MOTION.basic).dur;
    const keys = `@keyframes ${p}-breath{0%,100%{opacity:1}50%{opacity:.42}}@keyframes ${p}-rblink{0%,42%,58%,100%{opacity:1}50%{opacity:.15}}`;
    const rules = (pre) => px
      ? `${pre}.${p}-px,${pre}.${p}-fr0{opacity:1;animation:${p}-breath ${R(d * 1.3)}s ease-in-out infinite!important}`
      : mark === 'pip'
        ? `${pre}.${p}-ctl{animation:${p}-breath ${R(d * 1.3)}s ease-in-out infinite!important}${pre}.${p}-blink{animation:${p}-rblink ${R(d * 2.6)}s ease-in-out infinite!important}`
        : `${pre}.${p}-l1{animation:${p}-breath ${R(d * 1.3)}s ease-in-out infinite!important}${pre}.${p}-l2{animation:${p}-breath ${R(d * 1.3)}s ease-in-out infinite!important;animation-delay:${R(-d * .65)}s!important}`;
    return { keys, rules };
  }

  /* ------------------------------------------------------------- tiering */
  // micro: hand-placed pixels for 18 device px and below; small: heavier vector up to 40; full above
  function pickTier(o, th) {
    const dev = (o.px || 24) * (o.dpr || 1) * (o.form === 'tile' ? .68 : 1);
    o._dev = dev;
    if (o.tier && o.tier !== 'auto') return o.tier;
    if (th.pixel) return dev <= 18 ? 'micro' : 'pixel';
    return dev <= 18 ? 'micro' : dev <= 40 ? 'small' : 'full';
  }

  /* ------------------------------------------------------------- the mark */
  function markBody(o, th, tier) {
    const p = o.prefix;
    const anim = !!o.motion && !th.noMotion;
    const tray = o.form === 'tray';
    const ink = tray ? o.ink || '#000' : null;
    const live = anim && !o.reduced;
    const cls = anim ? { ctl: `${p}-ctl`, pup: `${p}-pup`, face: `${p}-face`, eyes: `${p}-eyes`, blink: `${p}-blink`, dot: `${p}-dot`, l1: `${p}-l1`, l2: `${p}-l2` } : {};
    const ids = { face: p + 'f', grad: p + 'h', clip: p + 'c', rim: p + 'r', glow: p + 'g', spec: p + 's', drop: p + 'd' };
    const mood = live && o.mark === 'pip' && o.motion === 'think' ? 'dots' : (o.mood || 'idle');

    if (tier === 'micro' || tier === 'pixel') {
      const ctl = solid(ink || th.ctl);
      const back = ink || th.flatCtl || !th.pixel ? ctl : mix(ctl, th.tile.stops[0], .42);
      const colors = { c: ctl, b: back, s: solid(ink || th.str), h: solid(ink || (o.mark === 'mono' ? th.letter : th.head)), k: ink ? null : th.cheek, n: ctl, v: solid(ink || th.ink || th.ctl), m: solid(ink || th.ink || th.ctl) };
      if (o.mark === 'mono') return { vb: 16, defs: '', crisp: true, body: pixelRects(MONO_PX, colors) };
      if (th.nier) {
        const c = colors.c, col = { n: c, c, s: c, h: c, v: c, m: c };
        return { vb: 16, defs: '', crisp: true, body: pixelRects(nier16(mood === 'dots' ? 'think' : mood), col) };
      }
      const Gs = tier === 'micro' ? 16 : spriteGrid(o._dev);
      if (live) {
        // Retro's snap motion: eight flipped frames (four for think and hop); strings redrawn each frame
        const n = Gs >= 24 ? 2 : 1;
        const plan = o.motion === 'think' ? [{ lift: 0 }, { lift: 1 }, { lift: 2 }, {}]
          : o.motion === 'hop' ? [{}, { dy: -Math.ceil(n / 2) }, { dy: -n - 1 }, { dy: -Math.ceil(n / 2) }]
          : [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const s = Math.sin(2 * Math.PI * i / 8); const dx = Math.round(s * n + (s > 0 ? .001 : -.001) * 0); return { dx, eyeDx: Math.sign(dx) }; });
        const fm = o.motion === 'think' ? 'dots' : mood;
        const body = plan.map((f, i) => `<g class="${p}-fr ${p}-fr${i}">${pixelRects(spriteRows(Gs, fm, f), colors)}</g>`).join('');
        return { vb: Gs, defs: '', crisp: true, body, frames: plan.length };
      }
      const still = pixelRects(spriteRows(Gs, mood === 'dots' ? 'think' : mood), colors);
      return { vb: Gs, defs: '', crisp: true, body: anim ? `<g class="${p}-px">${still}</g>` : still };
    }

    const g = GEO[tier === 'small' ? 'small' : 'full'];
    if (o.mark === 'mono') { const r = monoVector(th, tier, cls, { tray, ink }, p, anim); return { vb: 64, defs: r.defs, body: r.body }; }
    if (th.nier) { const r = pipNier(g, th, mood === 'dots' ? 'think' : mood, cls, ids, { tray, ink }); return { vb: 64, defs: r.defs, body: r.body }; }

    // strings: solved at rest for still marks; when animated they carry their own transforms
    const attach = tray ? 'thread' : (o.attach || 'eye');
    const strCol = ink || th.str;
    let strings;
    if (anim) {
      const t = transformsAt(g, { cRot: 0, cDy: 0, pRot: 0, pDy: 0, sx: 1, sy: 1, eye: 0 }, attach);
      strings = t.raw.map((s, i) => `<line class="${p}-str ${p}-s${i}" x1="0" y1="0" x2="0" y2="1" stroke="${strCol}" stroke-width="${g.strW}" transform="translate(${R(s.A[0])} ${R(s.A[1])}) rotate(${R(s.ang)}) scale(1 ${R(s.len)})"/>`).join('');
    } else strings = stringEnds(g, attach, (q) => q, (q) => q).map((e) => line(e.T, e.E, g.strW, strCol, 'butt')).join('');
    const hd = pipHead(g, th, mood, ids, cls, { tray, ink, backdrop: o._backdrop });
    const pup = `<g class="${cls.pup || ''}">${eyeletRings(g, th, { tray })}${hd.body}</g>`;
    const ctl = controlSvg(g, th, cls, { tray, ink, attach });
    return { vb: 64, defs: hd.defs, body: strings + pup + ctl };
  }

  /* --------------------------------------------------------------- tiles */
  // PMConcept7's Glass wallpaper, redrawn as vector ribbons so the tile stays sharp at any size
  const RIBBONS = {
    dark: { sky: ['#03050B', '#0A1024'], bands: [
      ['#2448C9', '#13256E', 'M-2 20C14 14 28 25 44 21S60 12 66 14V70H-2Z'],
      ['#7B45E6', '#3B1B8E', 'M-2 27C12 25 26 30 40 27S58 18 66 20V70H-2Z'],
      ['#1BC2B4', '#0E7178', 'M-2 32C16 30 30 31 44 29S60 26 66 27V70H-2Z'],
      ['#EC4E9B', '#8A1E58', 'M-2 37C14 36 30 33 46 34S60 39 66 40V70H-2Z'],
      ['#4F7FEA', '#172F80', 'M-2 42C10 40 22 38 34 40S56 49 66 48V70H-2Z'],
      ['#9157E2', '#2A1366', 'M-2 49C14 47 28 50 42 53S58 55 66 53V70H-2Z'],
      ['#2E5FE4', '#0F2063', 'M-2 56C16 55 30 57 46 59S60 58 66 57V70H-2Z']
    ], rim: 'rgba(225,230,255,.55)' },
    light: { sky: ['#F4F4F6', '#E8EAF0'], bands: [
      ['#A2C2F8', '#86AAF2', 'M-2 20C14 14 28 25 44 21S60 12 66 14V70H-2Z'],
      ['#BFA6F7', '#A88EF2', 'M-2 27C12 25 26 30 40 27S58 18 66 20V70H-2Z'],
      ['#61D6C3', '#33B8A4', 'M-2 32C16 30 30 31 44 29S60 26 66 27V70H-2Z'],
      ['#F582B8', '#F7BDD7', 'M-2 37C14 36 30 33 46 34S60 39 66 40V70H-2Z'],
      ['#F5B566', '#F8E0C2', 'M-2 42C10 40 22 38 34 40S56 49 66 48V70H-2Z'],
      ['#8DB0F6', '#CCDBFA', 'M-2 49C14 47 28 50 42 53S58 55 66 53V70H-2Z'],
      ['#B79EF5', '#9C84EE', 'M-2 56C16 55 30 57 46 59S60 58 66 57V70H-2Z']
    ], rim: 'rgba(255,255,255,.9)' }
  };
  function ribbonsSvg(kind, idp) {
    const w = RIBBONS[kind];
    let defs = grad(idp + 'k', w.sky, 0, 0, 0, 30), s = `<rect x="-2" y="-2" width="68" height="68" fill="url(#${idp}k)"/>`;
    w.bands.forEach((b, i) => {
      defs += `<linearGradient id="${idp}b${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b[0]}"/><stop offset="1" stop-color="${b[1]}"/></linearGradient>`;
      s += `<path d="${b[2]}" fill="url(#${idp}b${i})"/><path d="${b[2].split('V70')[0]}" fill="none" stroke="${w.rim}" stroke-width=".35"/>`;
    });
    return { defs, body: s };
  }
  function tileFrame(th, ids, inner, innerVb, crisp) {
    const t = th.tile;
    let defs = '', s = '';
    if (t.kind === 'retro') {
      defs += grad(ids.tile, t.stops, 0, 0, 64, 64);
      s += `<rect x="4" y="4" width="60" height="60" fill="${t.shadow}"/>`;
      s += `<rect x="1" y="1" width="58" height="58" fill="url(#${ids.tile})" stroke="${t.edge}" stroke-width="2"/>`;
      s += `<svg x="8.5" y="7.5" width="43" height="43" viewBox="0 0 ${innerVb} ${innerVb}"${crisp ? ' shape-rendering="crispEdges"' : ''}>${inner}</svg>`;
      return { defs, body: s };
    }
    if (t.kind === 'nier') {
      // parchment, graph grid, target brackets, a hairline rule ending in squares, a unit code
      defs += grad(ids.tile, t.stops, 0, 0, 0, 64);
      s += `<rect width="64" height="64" fill="url(#${ids.tile})"/>`;
      let grid = '';
      for (let i = 4; i < 64; i += 4) grid += `M${i} 0V64M0 ${i}H64`;
      s += `<path d="${grid}" stroke="${t.grid}" stroke-width=".3"/>`;
      s += `<rect x="5.5" y="5.5" width="53" height="53" fill="none" stroke="${t.edge}" stroke-opacity=".4" stroke-width=".5"/>`;
      const tick = (x, y, dx, dy) => `<path d="M${x} ${y + dy * 5}V${y}H${x + dx * 5}" fill="none" stroke="${t.edge}" stroke-width="1.2"/>`;
      s += tick(3, 3, 1, 1) + tick(61, 3, -1, 1) + tick(3, 61, 1, -1) + tick(61, 61, -1, -1);
      s += `<path d="M10 53.5H54" stroke="${t.edge}" stroke-width=".5"/><rect x="9" y="52.5" width="2" height="2" fill="${t.edge}"/><rect x="53" y="52.5" width="2" height="2" fill="${t.edge}"/>`;
      s += `<text x="54" y="10.4" text-anchor="end" font-family="'PM NieR Mono','JetBrains Mono',ui-monospace,monospace" font-size="3.1" letter-spacing=".3" fill="${t.edge}">P-01</text>`;
      s += `<svg x="12" y="9" width="40" height="40" viewBox="0 0 ${innerVb} ${innerVb}"${crisp ? ' shape-rendering="crispEdges"' : ''}>${inner}</svg>`;
      return { defs, body: s };
    }
    if (t.kind === 'liquid') {
      // Liquid Glass: crisp ribbon wallpaper, a light veil, and a rim lit from above
      const rb = ribbonsSvg(t.wall, ids.tile);
      defs += rb.defs + `<clipPath id="${ids.clip}"><rect width="64" height="64" rx="14.4"/></clipPath>`;
      defs += `<radialGradient id="${ids.glow}" cx="32" cy="38" r="30" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.veil}"/><stop offset="1" stop-color="${t.veil}" stop-opacity="0"/></radialGradient>`;
      defs += `<linearGradient id="${ids.rim}" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.edgeTop}"/><stop offset=".4" stop-color="${t.edgeTop}" stop-opacity="0"/><stop offset=".8" stop-color="${t.edgeBot}" stop-opacity="0"/><stop offset="1" stop-color="${t.edgeBot}"/></linearGradient>`;
      s += `<g clip-path="url(#${ids.clip})">${rb.body}<rect width="64" height="64" fill="url(#${ids.glow})"/></g>`;
      s += `<rect x=".6" y=".6" width="62.8" height="62.8" rx="13.9" fill="none" stroke="url(#${ids.rim})" stroke-width="1.2"/>`;
      s += `<svg x="7" y="6.5" width="50" height="50" viewBox="0 0 ${innerVb} ${innerVb}">${inner}</svg>`;
      return { defs, body: s };
    }
    defs += grad(ids.tile, t.stops, 0, 0, 64, 64);
    const rx = t.kind === 'flat' ? 12.5 : 14.4;
    s += `<rect width="64" height="64" rx="${rx}" fill="url(#${ids.tile})"/>`;
    if (t.glow) {
      defs += `<radialGradient id="${ids.glow}" cx="32" cy="40" r="26" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.glow}"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></radialGradient>`;
      s += `<rect width="64" height="64" rx="${rx}" fill="url(#${ids.glow})"/>`;
    }
    if (t.edge) s += `<rect x=".5" y=".5" width="63" height="63" rx="${rx - .4}" fill="none" stroke="${t.edge}" stroke-width="1"/>`;
    const pad = crisp ? 9.5 : 7.5;
    s += `<svg x="${pad}" y="${pad - .5}" width="${64 - pad * 2}" height="${64 - pad * 2}" viewBox="0 0 ${innerVb} ${innerVb}"${crisp ? ' shape-rendering="crispEdges"' : ''}>${inner}</svg>`;
    return { defs, body: s };
  }

  /* --------------------------------------------------------------- output */
  function svg(opts) {
    const o = Object.assign({ mark: 'pip', theme: 'friendly-dark', form: 'glyph', px: 64, dpr: 1, mood: 'idle', motion: null, reduced: false }, opts || {});
    const th = THEMES[o.theme] || THEMES['friendly-dark'];
    o.prefix = o.prefix || nextId();
    const tier = pickTier(o, th);
    if (o.form === 'tile' && th.tile.kind === 'liquid') o._backdrop = { wall: th.tile.wall, x: 7, y: 6.5, size: 50 };
    const m = markBody(o, th, tier);
    const p = o.prefix;
    const anim = !!o.motion && !th.noMotion;
    const px = !!m.crisp;
    let css = '';
    if (anim) {
      const red = reducedCss(p, th, px, o.mark);
      if (o.reduced) css = red.keys + red.rules(`.${p} `);
      else {
        if (px) {
          const n = m.frames || 4, d = (MOTION[th.family] || MOTION.basic).dur * (n === 8 ? 1 : .85);
          css += `.${p}-fr{opacity:0}.${p}-fr0{opacity:1}.${p}-fr{animation:${p}-flip ${R(d)}s steps(1,end) infinite}@keyframes ${p}-flip{0%{opacity:1}${R(100 / n)}%,100%{opacity:0}}`;
          for (let i = 0; i < n; i++) css += `.${p}-fr${i}{animation-delay:${R(-d + i * d / n)}s}`;
        } else if (o.mark === 'mono') {
          css += monoRigCss(p, th, tier);
        } else {
          css += rigCss(p, o.motion, th, GEO[tier === 'small' ? 'small' : 'full'], o.form === 'tray' ? 'thread' : (o.attach || 'eye')).css;
        }
        // standalone files follow the OS setting; inlined in PMConcept7 they follow its switch too
        css += red.keys + `@media (prefers-reduced-motion:reduce){.${p} *{animation:none!important}${red.rules(`.${p} `)}}`;
        css += `:root[data-motion="reduced"] .${p} *,:root[data-reduced-motion="1"] .${p} *{animation:none!important}`;
        css += red.rules(`:root[data-motion="reduced"] .${p} `) + red.rules(`:root[data-reduced-motion="1"] .${p} `);
      }
    }
    const style = css ? `<style>${css}</style>` : '';
    const label = o.title || (anim ? 'Puppet Master is working' : 'Puppet Master');
    const role = o.decorative && !anim ? 'aria-hidden="true"' : 'role="img" aria-label="' + esc(label) + '"';
    const size = `width="${o.px}" height="${o.px}"`;
    if (o.form === 'tile') {
      const ids = { tile: p + 't', glow: p + 'w', rim: p + 'q', clip: p + 'k' };
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

  // The drawing kit, for places that animate Pip themselves (the onboarding stage): the same
  // geometry, faces, control and string solver the marks use, so there is one Pip everywhere.
  const kit = { GEO, R, mix, solid, solidStr, grad, sticks, anchors, barAttach, eyelets, stringEnds, headPath, headPathNier,
    faceShapes, controlSvg, pipHead, eyeletRings, nierHud, pipNier, ribbonsSvg, RIBBONS, pose, wave, transformsAt };
  G.PMLogo = { svg, THEMES, THEME_ORDER, MOTION, pickTier, kit, version: '0.3' };
})(typeof window !== 'undefined' ? window : globalThis);
