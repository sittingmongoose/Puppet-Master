/* Pip's stage: the five worlds and the prop library (Opus 5.5 concept).
   A world is a backdrop, a palette and a "pen": the pen turns a prop's roles (body, shade, panel,
   accent, screen, ink, light, line) into that world's material, so every prop is drawn once and
   reads as felt in Friendly, glass in Glass, a clean diagram in Basic, pixels in Retro and ink line
   art in NieR. */
(function (G) {
  'use strict';
  const R = (v) => +(+v).toFixed(2);

  // Colours are PMConcept7's own for each theme (sampled from the running page), or a step of one.
  const WORLDS = {
    'friendly-dark': {
      fam: 'friendly', scheme: 'dark', sky: ['#2F2A3A', '#211E26'], dots: 'rgba(190,180,210,.08)', hill: ['#2B2733', '#35303F', '#3D3749'],
      stitch: 'rgba(255,255,255,.16)', ink: '#2A2433', text: '#F0EDF4', line: '#F0EDF4', shadow: 'rgba(0,0,0,.38)',
      hues: { a: '#6FC6E8', b: '#6FDABC', c: '#FFAD93', d: '#C3B1E4', e: '#FFD97F' },
      chapter: { welcome: '#C3B1E4', computer: '#6FC6E8', project: '#6FDABC', ai: '#FFD97F', ready: '#FFAD93' }
    },
    'friendly-light': {
      fam: 'friendly', scheme: 'light', sky: ['#FFFBF7', '#F6EEF3'], dots: 'rgba(122,109,140,.11)', hill: ['#F3ECF4', '#ECE2EE', '#E4D8E8'],
      stitch: 'rgba(122,109,140,.28)', ink: '#3B3442', text: '#4A4550', line: '#4A4550', shadow: 'rgba(122,109,140,.24)',
      hues: { a: '#5AB9E0', b: '#5FD0B0', c: '#FF9E80', d: '#B39DDB', e: '#FFD166' },
      chapter: { welcome: '#B39DDB', computer: '#5AB9E0', project: '#5FD0B0', ai: '#FFD166', ready: '#FF9E80' }
    },
    'glass-dark': {
      fam: 'glass', scheme: 'dark', ink: '#F6F8FC', text: '#F6F8FC', line: '#F6F8FC', shadow: 'rgba(0,2,12,.55)',
      fill: ['rgba(255,255,255,.30)', 'rgba(255,255,255,.07)'], rim: 'rgba(255,255,255,.9)', rimLow: 'rgba(255,255,255,.25)', edge: 'rgba(0,4,20,.5)',
      screen: 'rgba(4,8,22,.78)', floor: ['rgba(255,255,255,.16)', 'rgba(255,255,255,.02)'],
      hues: { a: '#74B9FF', b: '#5BE38F', c: '#FF86C2', d: '#97A6FF', e: '#FFB15C' },
      chapter: { welcome: '#97A6FF', computer: '#74B9FF', project: '#5BE38F', ai: '#FFB15C', ready: '#FF86C2' }
    },
    'glass-light': {
      fam: 'glass', scheme: 'light', ink: '#0C0F15', text: '#0C0F15', line: '#262C38', shadow: 'rgba(30,45,90,.28)',
      fill: ['rgba(255,255,255,.78)', 'rgba(255,255,255,.34)'], rim: 'rgba(255,255,255,1)', rimLow: 'rgba(255,255,255,.6)', edge: 'rgba(30,45,90,.28)',
      screen: 'rgba(210,228,255,.9)', floor: ['rgba(255,255,255,.7)', 'rgba(255,255,255,.12)'],
      hues: { a: '#2F80E2', b: '#14A35C', c: '#D63C8E', d: '#5B6BE8', e: '#E08A1E' },
      chapter: { welcome: '#5B6BE8', computer: '#2F80E2', project: '#14A35C', ai: '#E08A1E', ready: '#D63C8E' }
    },
    'basic-dark': {
      fam: 'basic', scheme: 'dark', bg: '#161616', surface: '#2A2A2A', line: '#E8E8E8', ink: '#E8E8E8', text: '#E8E8E8', accent: '#64B5F6', muted: '#6B7280', dot: 'rgba(255,255,255,.07)',
      hues: { a: '#64B5F6', b: '#64B5F6', c: '#64B5F6', d: '#64B5F6', e: '#64B5F6' }, chapter: {}
    },
    'basic-light': {
      fam: 'basic', scheme: 'light', bg: '#EAECEF', surface: '#FFFFFF', line: '#2B2B2B', ink: '#1A1A1A', text: '#1A1A1A', accent: '#0056B3', muted: '#8A929C', dot: 'rgba(0,0,0,.08)',
      hues: { a: '#0056B3', b: '#0056B3', c: '#0056B3', d: '#0056B3', e: '#0056B3' }, chapter: {}
    },
    // Retro Dark is PMConcept7's green-phosphor terminal (PM Phosphor Green): the stage is the tube
    'retro-dark': {
      fam: 'retro', scheme: 'dark', tube: 'phosphor', bg: '#071109', ink: '#77EA83', text: '#77EA83', line: '#77EA83',
      dim: '#1D4424', mid: '#3DCC56', bright: '#D3FFB0', glow: '#12FB56', fill: '#0B2411', fill2: '#14391B', screen: '#03140A',
      hues: { a: '#77EA83', b: '#87F2C4', c: '#C4EC35', d: '#D3FFB0', e: '#3DCC56' }, chapter: {}
    },
    // Retro Light is "the same machine's printout": PM Paper Teletype ink on green-bar paper
    'retro-light': {
      fam: 'retro', scheme: 'light', tube: 'teletype', bg: '#F4ECDD', paper: '#F4ECDD', ink: '#231E19', text: '#231E19', line: '#231E19',
      bar: '#E2E8D3', hole: '#E6DCCB', rule: '#B9B2A4', red: '#A13126', blue: '#2D4D8B', green: '#346B37', amber: '#815B16',
      hues: { a: '#2D4D8B', b: '#346B37', c: '#A13126', d: '#815B16', e: '#783B82' }, chapter: {}
    },
    'nier-light': {
      fam: 'nier', scheme: 'light', paper: '#CCC8B1', paper2: '#C3BFA7', ink: '#211F1B', text: '#211F1B', line: '#211F1B', grid: 'rgba(33,31,27,.07)', red: '#A94A38',
      hues: { a: '#211F1B', b: '#211F1B', c: '#211F1B', d: '#211F1B', e: '#211F1B' }, chapter: {}
    },
    'nier-dark': {
      fam: 'nier', scheme: 'dark', paper: '#2F2D26', paper2: '#36342C', ink: '#D1CDB7', text: '#D1CDB7', line: '#D1CDB7', grid: 'rgba(209,205,183,.06)', red: '#C96B57',
      hues: { a: '#D1CDB7', b: '#D1CDB7', c: '#D1CDB7', d: '#D1CDB7', e: '#D1CDB7' }, chapter: {}
    }
  };

  function mix(a, b, t) {
    const h = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
    const A = h(a), B = h(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }

  /* --------------------------------------------------------------- backdrops */
  // Drawn larger than the view box so a stage that is wider or taller than it never shows an edge.
  function backdrop(w, ids, L) {
    const W = L.w, H = L.h, gy = L.ground, X0 = -W, X1 = 2 * W, Y0 = -H, Y1 = 2 * H;
    let defs = '', s = '';
    const rect = (fill, extra) => `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${fill}"${extra || ''}/>`;
    if (w.fam === 'friendly') {
      defs += `<linearGradient id="${ids}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.sky[0]}"/><stop offset="1" stop-color="${w.sky[1]}"/></linearGradient>`;
      defs += `<pattern id="${ids}dot" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="1.4" fill="${w.dots}"/></pattern>`;
      defs += `<radialGradient id="${ids}glow" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--st-tint)" stop-opacity=".34"/><stop offset=".55" style="stop-color:var(--st-tint)" stop-opacity=".1"/><stop offset="1" style="stop-color:var(--st-tint)" stop-opacity="0"/></radialGradient>`;
      s += rect(`url(#${ids}sky)`) + rect(`url(#${ids}dot)`);
      s += `<g class="st-glow" transform="translate(${L.ctl[0]} ${L.ctl[1] + L.rope * .9}) scale(${R(L.w * .55)})"><circle r="1" fill="url(#${ids}glow)"/></g>`;
      // felt hills, stitched along their tops
      const hill = (y, amp, ph, fill) => {
        let d = `M${X0} ${Y1}V${y}`;
        for (let x = X0; x <= X1; x += 40) d += `L${x} ${R(y + Math.sin((x + ph) / 70) * amp)}`;
        return `<path d="${d}V${Y1}Z" fill="${fill}"/><path d="${d.split('V')[0]}${d.slice(d.indexOf('L'))}" fill="none" stroke="${w.stitch}" stroke-width="1.6" stroke-dasharray="5 6" transform="translate(0 7)"/>`;
      };
      s += hill(gy - 26, 9, 30, w.hill[0]) + hill(gy - 6, 6, 160, w.hill[1]) + hill(gy + 18, 4, 90, w.hill[2]);
      // felt clouds hung from the flies on their own threads, swaying the way the props do
      [[W * .2, 64, .9, 0], [W * .83, 118, .7, 1.7]].forEach(([x, y, k, dl], i) => {
        const cl = `<path d="M-30 8C-44 8 -44 -10 -28 -9C-28 -24 -6 -28 0 -16C6 -26 30 -22 28 -6C42 -6 42 8 30 8Z" fill="${w.scheme === 'dark' ? '#4A4458' : '#FFFFFF'}" stroke="${w.stitch}" stroke-width="1.4" stroke-dasharray="3 4"/>`;
        s += `<g class="st-cloud" style="transform-origin:${R(x)}px -40px;--d:${R(7 + i * 2.6)}s;--dl:${-dl}s"><path d="M${R(x)} -40V${R(y - 22 * k)}" stroke="${w.stitch}" stroke-width="1.2"/><g transform="translate(${R(x)} ${y}) scale(${k})">${cl}</g></g>`;
      });
      if (w.scheme === 'dark') {
        for (let i = 0; i < 9; i++) s += `<circle class="st-fly" style="--d:${R(5 + (i % 4) * 1.3)}s;--dl:${R(-i * 1.1)}s" cx="${R((i * 83 + 40) % W)}" cy="${R(gy - 40 - (i * 47) % 160)}" r="2" fill="#FFE9A8"/>`;
      } else {
        [[W * .72, gy - 150, 0], [W * .3, gy - 210, 2.2]].forEach(([x, y, dl], i) => {
          const wing = (sx) => `<path class="st-wing ${sx < 0 ? 'l' : 'r'}" d="M0 0C${sx * 9} -9 ${sx * 13} -3 ${sx * 9} 3C${sx * 6} 6 ${sx * 2} 4 0 0Z" fill="${i ? w.hues.d : w.hues.c}"/>`;
          s += `<g class="st-fly st-butterfly" style="--d:${9 + i * 3}s;--dl:${-dl}s"><g transform="translate(${R(x)} ${R(y)})">${wing(-1)}${wing(1)}<path d="M0 -3V4" stroke="${w.ink}" stroke-width="1.4" stroke-linecap="round"/></g></g>`;
        });
      }
      // pastel crumbs drifting in the air
      const c = Object.values(w.hues);
      for (let i = 0; i < 16; i++) {
        const x = R((i * 97.3) % W), y = R((i * 53.7) % (gy - 60) + 10), r = 2 + (i % 3);
        s += `<circle class="st-drift" style="--d:${R(6 + (i % 5))}s;--dl:${R(-i * .7)}s" cx="${x}" cy="${y}" r="${r}" fill="${c[i % c.length]}" opacity=".5"/>`;
      }
      return { defs, back: s };
    }
    if (w.fam === 'glass') {
      // the wallpaper is an HTML layer under the stage; the SVG adds the glass floor and light
      defs += `<radialGradient id="${ids}floor" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="${w.floor[0]}"/><stop offset="1" stop-color="${w.floor[1]}"/></radialGradient>`;
      defs += `<linearGradient id="${ids}rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.rim}"/><stop offset=".5" stop-color="${w.rim}" stop-opacity=".1"/><stop offset="1" stop-color="${w.rim}" stop-opacity=".45"/></linearGradient>`;
      defs += `<radialGradient id="${ids}glow" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:var(--st-tint)" stop-opacity=".42"/><stop offset="1" style="stop-color:var(--st-tint)" stop-opacity="0"/></radialGradient>`;
      s += `<g class="st-glow" transform="translate(${L.ctl[0]} ${L.ctl[1] + L.rope * .95}) scale(${R(L.w * .5)})"><circle r="1" fill="url(#${ids}glow)"/></g>`;
      for (let i = 0; i < 12; i++) {
        const r = 2.5 + (i % 4) * 1.8, x = R((i * 67 + 24) % W);
        s += `<g class="st-bubble" style="--d:${R(9 + (i % 5) * 2.2)}s;--dl:${R(-i * 1.7)}s"><circle cx="${x}" cy="${gy - 8}" r="${R(r)}" fill="#fff" fill-opacity=".06" stroke="#fff" stroke-opacity="${w.scheme === 'dark' ? .55 : .9}" stroke-width=".9"/><circle cx="${R(x - r * .35)}" cy="${R(gy - 8 - r * .35)}" r="${R(r * .28)}" fill="#fff" fill-opacity=".85"/></g>`;
      }
      const fx = W / 2, rx = W * .62, ry = Math.max(18, W * .09);
      s += `<ellipse cx="${fx}" cy="${gy}" rx="${R(rx)}" ry="${R(ry)}" fill="url(#${ids}floor)" stroke="url(#${ids}rim)" stroke-width="1.4"/>`;
      s += `<ellipse cx="${fx}" cy="${gy}" rx="${R(rx * .72)}" ry="${R(ry * .62)}" fill="none" stroke="${w.rimLow}" stroke-width="1"/>`;
      s += `<ellipse cx="${fx}" cy="${gy}" rx="${R(rx * .42)}" ry="${R(ry * .34)}" fill="none" stroke="${w.rimLow}" stroke-width=".8" opacity=".7"/>`;
      return { defs, back: s };
    }
    if (w.fam === 'basic') {
      defs += `<pattern id="${ids}dot" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.1" fill="${w.dot}"/></pattern>`;
      s += rect(w.bg) + rect(`url(#${ids}dot)`);
      const ocx = L.ctl[0], ocy = R(L.ctl[1] + L.rope * .8), orr = R(L.rope * .82);
      s += `<circle cx="${ocx}" cy="${ocy}" r="${orr}" fill="none" stroke="${w.line}" stroke-opacity=".08" stroke-width="1"/>`;
      s += `<g class="st-orbit" style="transform-origin:${ocx}px ${ocy}px"><circle cx="${ocx}" cy="${R(ocy - orr)}" r="3" fill="${w.accent}"/><path d="M${R(ocx - 30)} ${R(ocy - orr)}A${orr} ${orr} 0 0 1 ${ocx} ${R(ocy - orr)}" fill="none" stroke="${w.accent}" stroke-opacity=".35" stroke-width="1.2"/></g>`;
      s += `<path d="M${X0} ${gy}H${X1}" stroke="${w.line}" stroke-opacity=".5" stroke-width="1.5"/>`;
      for (let x = 0; x <= W; x += 40) s += `<path d="M${x} ${gy}v6" stroke="${w.line}" stroke-opacity=".3" stroke-width="1"/>`;
      return { defs, back: s };
    }
    if (w.fam === 'retro' && w.tube === 'phosphor') {
      // a phosphor graticule (PMConcept7's terminal ground "Phosphor grid"), its centre axes ticked, and a
      // vector-terrain floor whose rows the stage scrolls toward you
      s += rect(w.bg);
      const cols = 10, rows = 8, mx = 18, my = 22, gw = W - mx * 2, gh = gy - 30 - my;
      let g = '', a = '', t = '';
      for (let i = 0; i <= cols; i++) { const x = R(mx + gw * i / cols); (i === cols / 2 ? (a += `M${x} ${my}V${R(my + gh)}`) : (g += `M${x} ${my}V${R(my + gh)}`)); }
      for (let j = 0; j <= rows; j++) { const y = R(my + gh * j / rows); (j === rows / 2 ? (a += `M${mx} ${y}H${R(mx + gw)}`) : (g += `M${mx} ${y}H${R(mx + gw)}`)); }
      for (let k = 0; k <= cols * 5; k++) { const x = R(mx + gw * k / (cols * 5)), cy = R(my + gh / 2); t += `M${x} ${cy - 3}V${cy + 3}`; }
      s += `<path d="${g}" stroke="${w.ink}" stroke-opacity=".09" stroke-width="1" fill="none"/><path d="${a}" stroke="${w.ink}" stroke-opacity=".16" stroke-width="1" fill="none"/><path d="${t}" stroke="${w.ink}" stroke-opacity=".2" stroke-width="1" fill="none"/>`;
      // the sun on the horizon, striped the way a vector display draws one
      const sx = W * .74, sr = Math.min(64, W * .16);
      defs += `<clipPath id="${ids}sun"><rect x="${R(sx - sr - 2)}" y="${R(gy - sr - 2)}" width="${R(sr * 2 + 4)}" height="${R(sr + 2)}"/></clipPath>`;
      let stripes = '';
      for (let i = 0; i < 7; i++) stripes += `<rect x="${R(sx - sr)}" y="${R(gy - sr * (i + 1) / 7 + 1)}" width="${R(sr * 2)}" height="${R(Math.max(1, 3.2 - i * .35))}" fill="${w.ink}"/>`;
      s += `<g clip-path="url(#${ids}sun)" opacity=".22"><circle cx="${R(sx)}" cy="${gy}" r="${R(sr)}" fill="none" stroke="${w.ink}" stroke-width="1.4"/>${stripes}</g>`;
      // the terrain: rays to the vanishing point here, the moving rows in the stage (gTerrain)
      const vx = W / 2, vy = gy - 4;
      let rays = `M${X0} ${gy}H${X1}`;
      for (let i = -14; i <= 14; i++) rays += `M${R(vx + i * 6)} ${gy}L${R(vx + i * W * .22)} ${R(H + 40)}`;
      s += `<path d="${rays}" stroke="${w.ink}" stroke-opacity=".34" stroke-width="1.1" fill="none"/>`;
      s += `<rect x="${X0}" y="${R(vy - 1)}" width="${X1 - X0}" height="3" fill="${w.ink}" opacity=".12"/>`;
      return { defs, back: s, terrain: { vx, vy: gy, H: H + 40 } };
    }
    if (w.fam === 'retro') {
      // Paper Teletype: green-bar continuous paper with tractor-feed margins; the paper group feeds
      // upward on a chapter change (the stage moves .st-paper)
      s += rect(w.paper);
      const band = 36, mL = 26, mR = W - 26;
      let bars = '', holes = '';
      for (let y = -band * 4; y < H + band * 30; y += band * 2) bars += `<rect x="${mL}" y="${y}" width="${mR - mL}" height="${band}" fill="${w.bar}"/>`;
      for (let y = -band * 4; y < H + band * 30; y += 18) holes += `<circle cx="13" cy="${y}" r="4.2" fill="${w.hole}" stroke="${w.rule}" stroke-width=".8"/><circle cx="${W - 13}" cy="${y}" r="4.2" fill="${w.hole}" stroke="${w.rule}" stroke-width=".8"/>`;
      const perf = `<path d="M${mL} ${-H}V${H + band * 30}M${mR} ${-H}V${H + band * 30}" stroke="${w.rule}" stroke-width="1" stroke-dasharray="2 4"/>`;
      // the page break: a perforation across the paper every so often
      let tears = '';
      for (let y = band * 12; y < H + band * 30; y += band * 12) tears += `<path d="M0 ${y}H${W}" stroke="${w.rule}" stroke-width="1" stroke-dasharray="1 3"/>`;
      s += `<g class="st-paper" data-band="${band * 2}">${bars}${tears}${holes}${perf}</g>`;
      // a printed axis for the floor, the way a plotter rules its baseline
      let ticks = '';
      for (let x = mL + 10; x <= mR - 10; x += 12) ticks += `M${x} ${gy}v${(x - mL - 10) % 60 === 0 ? 7 : 3.5}`;
      s += `<path d="M${mL + 6} ${gy}H${mR - 6}${ticks}" stroke="${w.ink}" stroke-width="1.2" fill="none"/>`;
      return { defs, back: s };
    }
    // NieR: parchment, graph paper, faint contour lines and a ruled horizon ending in squares
    defs += `<pattern id="${ids}grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${w.grid}" stroke-width="1"/></pattern>`;
    s += rect(w.paper) + rect(`url(#${ids}grid)`);
    for (let i = 0; i < 5; i++) s += `<ellipse cx="${R(W * .78)}" cy="${R(H * .22)}" rx="${60 + i * 34}" ry="${36 + i * 22}" fill="none" stroke="${w.ink}" stroke-opacity=".07" stroke-width="1"/>`;
    // a scanner ring turning slowly round Pip, ticked like a YoRHa map
    const rcx = L.ctl[0], rcy = R(L.ctl[1] + L.rope * .82), rr = R(Math.min(W * .4, L.rope * 1.05));
    let rt = '';
    for (let i = 0; i < 72; i++) { const a = i * Math.PI / 36, l = i % 6 === 0 ? 9 : 4; rt += `M${R(rcx + Math.cos(a) * rr)} ${R(rcy + Math.sin(a) * rr)}L${R(rcx + Math.cos(a) * (rr - l))} ${R(rcy + Math.sin(a) * (rr - l))}`; }
    s += `<g class="st-radar" style="transform-origin:${rcx}px ${rcy}px"><circle cx="${rcx}" cy="${rcy}" r="${rr}" fill="none" stroke="${w.ink}" stroke-opacity=".16" stroke-width="1" stroke-dasharray="2 5"/><path d="${rt}" stroke="${w.ink}" stroke-opacity=".22" stroke-width="1"/><rect x="${R(rcx - 3)}" y="${R(rcy - rr - 3)}" width="6" height="6" fill="${w.ink}" opacity=".5" transform="rotate(45 ${rcx} ${R(rcy - rr)})"/></g>`;
    s += `<circle cx="${rcx}" cy="${rcy}" r="${R(rr * .62)}" fill="none" stroke="${w.ink}" stroke-opacity=".07" stroke-width="1"/>`;
    // motes rising through the air, the way dust hangs in every NieR menu
    for (let i = 0; i < 16; i++) { const z = 1.6 + (i % 3) * 1.1; s += `<rect class="st-mote" style="--d:${R(11 + (i % 6) * 2.3)}s;--dl:${R(-i * 1.9)}s" x="${R((i * 89 + 30) % (W - 40) + 20)}" y="${R(gy - 10)}" width="${R(z)}" height="${R(z)}" fill="${w.ink}" opacity=".4"/>`; }
    // the unit's designation, set small and sideways down the left ruler
    s += `<text transform="translate(22 ${R(gy - 24)}) rotate(-90)" font-family="'PM NieR Mono', ui-monospace, monospace" font-size="7.5" letter-spacing="2.2" fill="${w.ink}" opacity=".45">YoRHa // PIP P-01 // GUIDE SUPPORT UNIT</text>`;
    // a data column at the right edge, scrolling
    let col = '';
    for (let i = 0; i < 40; i++) col += `<text x="${W - 12}" y="${i * 14}" text-anchor="end">${((i * 2654435761) >>> 0).toString(16).slice(0, 4).toUpperCase()} ${(i * 37 % 256).toString(2).padStart(8, '0')}</text>`;
    defs += `<clipPath id="${ids}dc"><rect x="${W - 90}" y="40" width="80" height="${R(gy - 80)}"/></clipPath>`;
    s += `<g clip-path="url(#${ids}dc)" opacity=".2" fill="${w.ink}" font-family="'PM NieR Mono', ui-monospace, monospace" font-size="7.5" letter-spacing=".08em"><g class="st-data">${col}${col.replace(/y="(\d+)"/g, (m, y) => `y="${+y + 560}"`)}</g></g>`;
    s += `<path d="M14 ${gy}H${W - 14}" stroke="${w.ink}" stroke-width="1"/><rect x="10" y="${gy - 4}" width="8" height="8" fill="${w.ink}"/><rect x="${W - 18}" y="${gy - 4}" width="8" height="8" fill="${w.ink}"/>`;
    for (let x = 30; x < W - 20; x += 20) s += `<path d="M${x} ${gy}v${x % 100 === 30 ? 7 : 4}" stroke="${w.ink}" stroke-opacity=".6" stroke-width="1"/>`;
    for (let y = 30; y < gy - 10; y += 20) s += `<path d="M6 ${y}h${y % 100 === 30 ? 8 : 4}" stroke="${w.ink}" stroke-opacity=".45" stroke-width="1"/>`;
    return { defs, back: s };
  }

  /* --------------------------------------------------------------- the pen */
  // role → material. hue picks one of the world's five colours (a-e).
  function pen(w, ids) {
    const fam = w.fam;
    let defs = '';
    const used = {};
    const glassBody = (hue) => {
      const id = `${ids}gb${hue}`;
      if (!used[id]) {
        used[id] = 1;
        defs += `<linearGradient id="${id}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${w.scheme === 'dark' ? .34 : .85}"/><stop offset=".55" stop-color="${w.hues[hue]}" stop-opacity="${w.scheme === 'dark' ? .26 : .3}"/><stop offset="1" stop-color="${w.hues[hue]}" stop-opacity="${w.scheme === 'dark' ? .42 : .48}"/></linearGradient>`;
      }
      return `url(#${id})`;
    };
    const rim = () => {
      const id = `${ids}grim`;
      if (!used[id]) { used[id] = 1; defs += `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.rim}"/><stop offset=".55" stop-color="${w.rim}" stop-opacity=".18"/><stop offset="1" stop-color="${w.rim}" stop-opacity=".5"/></linearGradient>`; }
      return `url(#${id})`;
    };
    // a printer's halftone: dots of the hue on the paper, denser for shade
    const halftone = (hue, r) => {
      const id = `${ids}ht${hue}${String(r).replace('.', '')}`;
      if (!used[id]) { used[id] = 1; defs += `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="${w.paper}"/><circle cx="2" cy="2" r="${r}" fill="${w.hues[hue] || w.ink}" fill-opacity=".8"/></pattern>`; }
      return `url(#${id})`;
    };
    function style(role, hue) {
      hue = hue || 'a';
      const H = w.hues[hue];
      if (fam === 'friendly') {
        const dark = w.scheme === 'dark';
        return {
          body: `fill="${H}"`, shade: `fill="${mix(H, w.ink, .26)}"`, panel: `fill="${mix(H, '#ffffff', dark ? .5 : .62)}"`, accent: `fill="${w.hues[{ a: 'c', b: 'd', c: 'a', d: 'e', e: 'b' }[hue]]}"`,
          screen: `fill="${mix(w.ink, H, .14)}"`, ink: `fill="${w.ink}"`, light: `fill="#ffffff" fill-opacity=".9"`,
          line: `fill="none" stroke="${w.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`
        }[role];
      }
      if (fam === 'glass') {
        return {
          body: `fill="${glassBody(hue)}" stroke="${rim()}" stroke-width="1.4"`, shade: `fill="${H}" fill-opacity=".45" stroke="${rim()}" stroke-width="1"`,
          panel: `fill="#ffffff" fill-opacity="${w.scheme === 'dark' ? .16 : .55}" stroke="${w.rimLow}" stroke-width=".9"`, accent: `fill="${H}"`,
          screen: `fill="${w.screen}" stroke="${w.rimLow}" stroke-width=".8"`, ink: `fill="${w.ink}"`, light: `fill="#ffffff" fill-opacity=".92"`,
          line: `fill="none" stroke="${w.ink}" stroke-opacity=".85" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
        }[role];
      }
      if (fam === 'basic') {
        return {
          body: `fill="${w.surface}" stroke="${w.line}" stroke-width="2"`, shade: `fill="${mix(w.surface, w.line, .12)}" stroke="${w.line}" stroke-width="2"`,
          panel: `fill="${mix(w.surface, w.line, .06)}" stroke="${w.line}" stroke-width="1.5"`, accent: `fill="${w.accent}"`,
          screen: `fill="${mix(w.surface, w.accent, w.scheme === 'dark' ? .22 : .1)}" stroke="${w.line}" stroke-width="1.5"`, ink: `fill="${w.line}"`, light: `fill="${w.surface}"`,
          line: `fill="none" stroke="${w.line}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
        }[role];
      }
      if (fam === 'retro' && w.tube === 'phosphor') {
        // a green monochrome monitor: dark fills, lit edges, the brightest phosphor for highlights
        return {
          body: `fill="${hue === 'n' ? w.fill : mix(w.bg, H, .2)}" stroke="${H}" stroke-width="2.4"`, shade: `fill="${w.fill2}" stroke="${w.mid}" stroke-width="2"`,
          panel: `fill="${w.bg}" stroke="${w.mid}" stroke-width="1.6"`, accent: `fill="${H}"`, screen: `fill="${w.screen}" stroke="${w.mid}" stroke-width="1.6"`,
          ink: `fill="${w.ink}"`, light: `fill="${w.bright}"`, line: `fill="none" stroke="${w.ink}" stroke-width="2.4" stroke-linecap="square"`
        }[role];
      }
      if (fam === 'retro') {
        // a two-colour ribbon on paper: ink line art, halftone fills, the red and blue for accents
        return {
          body: `fill="${halftone(hue, 1.15)}" stroke="${w.ink}" stroke-width="2.2"`, shade: `fill="${halftone(hue, 1.7)}" stroke="${w.ink}" stroke-width="2"`,
          panel: `fill="${w.paper}" stroke="${w.ink}" stroke-width="1.6"`, accent: `fill="${H}"`, screen: `fill="${w.ink}" stroke="${w.ink}" stroke-width="1.6"`,
          ink: `fill="${w.ink}"`, light: `fill="${w.paper}"`, line: `fill="none" stroke="${w.ink}" stroke-width="2.2" stroke-linecap="square"`
        }[role];
      }
      return {
        body: `fill="${w.paper}" stroke="${w.ink}" stroke-width="1.6"`, shade: `fill="${w.paper2}" stroke="${w.ink}" stroke-width="1.2"`,
        panel: `fill="${w.paper2}" stroke="${w.ink}" stroke-width="1"`, accent: `fill="${w.ink}"`, screen: `fill="${w.ink}"`,
        ink: `fill="${w.ink}"`, light: `fill="${w.paper}"`, line: `fill="none" stroke="${w.ink}" stroke-width="1.4" stroke-linecap="square"`
      }[role];
    }
    const P = {
      fam, w,
      rect: (x, y, ww, hh, r, role, hue) => `<rect x="${R(x)}" y="${R(y)}" width="${R(ww)}" height="${R(hh)}" rx="${fam === 'retro' || fam === 'nier' ? Math.min(r, 2) : r}" ${style(role, hue)}/>`,
      circle: (x, y, r, role, hue) => `<circle cx="${R(x)}" cy="${R(y)}" r="${R(r)}" ${style(role, hue)}/>`,
      path: (d, role, hue) => `<path d="${d}" ${style(role, hue)}/>`,
      line: (x1, y1, x2, y2, role) => `<path d="M${R(x1)} ${R(y1)}L${R(x2)} ${R(y2)}" ${style(role || 'line')}/>`,
      text: (x, y, t, size, role, extra) => `<text x="${R(x)}" y="${R(y)}" font-size="${size}" text-anchor="middle" dominant-baseline="central" ${style(role || 'ink')} font-family="${fam === 'retro' ? (w.tube === 'phosphor' ? "'VT323', 'IBM Plex Mono', ui-monospace, monospace" : "'IBM Plex Mono', ui-monospace, monospace") : fam === 'nier' ? "'PM NieR Sans','Inter',system-ui,sans-serif" : fam === 'glass' || fam === 'basic' ? "'Inter',system-ui,sans-serif" : "'Poppins',system-ui,sans-serif"}" font-weight="${fam === 'nier' ? 500 : 700}"${extra || ''}>${String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`,
      // a floor shadow under a prop (Friendly and Glass only)
      shadow: () => '',
      sparkle: (x, y, r, hue) => fam === 'nier' ? `<rect x="${R(x - r * .45)}" y="${R(y - r * .45)}" width="${R(r * .9)}" height="${R(r * .9)}" transform="rotate(45 ${R(x)} ${R(y)})" fill="${w.ink}"/>`
        : `<path d="M${R(x)} ${R(y - r)}Q${R(x + r * .16)} ${R(y - r * .16)} ${R(x + r)} ${R(y)}Q${R(x + r * .16)} ${R(y + r * .16)} ${R(x)} ${R(y + r)}Q${R(x - r * .16)} ${R(y + r * .16)} ${R(x - r)} ${R(y)}Q${R(x - r * .16)} ${R(y - r * .16)} ${R(x)} ${R(y - r)}Z" fill="${fam === 'basic' ? w.accent : w.hues[hue || 'e']}"/>`,
      defs: () => defs
    };
    return P;
  }

  /* ------------------------------------------------------------ the props */
  // Each prop draws in its own box centred on (0,0) and says where its strings tie on (`ties`) and
  // how far its bottom reaches (`foot`). Parameters change a prop in place (a sign's words, ticks).
  const PROPS = {
    laptop(p) {
      let s = p.shadow(30, 44);
      s += p.rect(-40, -44, 80, 54, 8, 'body', 'a') + p.rect(-33, -37, 66, 40, 4, 'screen');
      // a tiny Pip face on the screen
      s += p.circle(-8, -20, 3, 'light') + p.circle(8, -20, 3, 'light') + `<path d="M-6 -12Q0 -7 6 -12" ${p.fam === 'friendly' ? 'stroke="#fff" stroke-opacity=".9"' : `stroke="${p.fam === 'nier' ? p.w.paper : p.fam === 'retro' ? (p.w.tube === 'phosphor' ? p.w.bright : p.w.paper) : '#fff'}"`} stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      s += p.path('M-50 10H50L44 22H-44Z', 'shade', 'a') + p.rect(-9, 12, 18, 4, 2, 'panel', 'a');
      return { svg: s, ties: [[0, -44]], foot: 24 };
    },
    phone(p) {
      let s = p.shadow(34, 20);
      s += p.rect(-18, -34, 36, 66, 8, 'body', 'b') + p.rect(-13, -27, 26, 48, 4, 'screen') + p.circle(0, 25, 2.6, 'light');
      s += p.circle(-5, -6, 2.4, 'light') + p.circle(5, -6, 2.4, 'light');
      return { svg: s, ties: [[0, -34]], foot: 32 };
    },
    server(p) {
      let s = p.shadow(50, 34);
      s += p.rect(-32, -50, 64, 100, 8, 'body', 'd');
      for (let i = 0; i < 3; i++) {
        const y = -40 + i * 28;
        s += p.rect(-24, y, 48, 20, 4, 'panel', 'd') + `<g class="st-led" style="--dl:${-i * .4}s">${p.circle(14, y + 10, 3.2, 'accent', 'b')}</g>` + p.line(-16, y + 10, 4, y + 10, 'line');
      }
      return { svg: s, ties: [[0, -50]], foot: 50 };
    },
    page(p) {
      let s = p.shadow(44, 30);
      s += p.path('M-30 -42H14L32 -24V42H-30Z', 'body', 'b') + p.path('M14 -42V-24H32Z', 'shade', 'b');
      s += p.line(-18, -18, 6, -18) + p.line(-18, -4, 18, -4) + p.line(-18, 10, 12, 10);
      s += p.sparkle(26, 30, 11, 'e');
      return { svg: s, ties: [[-8, -42]], foot: 44 };
    },
    folder(p) {
      let s = p.shadow(36, 44);
      s += p.path('M-46 -28H-14L-6 -20H46V34H-46Z', 'shade', 'e');
      s += p.rect(-30, -34, 54, 40, 3, 'light') + p.line(-22, -24, 12, -24) + p.line(-22, -14, 4, -14);
      s += p.path('M-46 -10H46V34H-46Z', 'body', 'e');
      return { svg: s, ties: [[-30, -28], [30, -20]], foot: 36 };
    },
    restore(p) {
      let s = p.shadow(40, 38);
      s += p.rect(-38, -16, 76, 54, 8, 'body', 'd') + p.rect(-42, -26, 84, 16, 5, 'shade', 'd');
      s += p.circle(0, 12, 15, 'panel', 'd');
      s += `<path d="M-8 4A10 10 0 1 1 -9 16" ${p.fam === 'friendly' ? `stroke="${p.w.ink}"` : `stroke="${p.w.ink}"`} stroke-width="${p.fam === 'retro' ? 2.4 : 2.6}" fill="none" stroke-linecap="round"/>` + p.path('M-12 -1L-7 6L-14 7Z', 'ink');
      return { svg: s, ties: [[-30, -26], [30, -26]], foot: 40 };
    },
    sign(p, o) {
      const name = (o && o.text) || '';
      const shown = name.length > 22 ? name.slice(0, 21) + '…' : name;
      const size = shown.length > 15 ? 13 : shown.length > 10 ? 16 : 19;
      let s = p.shadow(36, 52);
      s += p.rect(-66, -28, 132, 58, 10, 'body', 'e') + p.rect(-58, -20, 116, 42, 6, 'panel', 'e');
      s += p.circle(-52, -22, 2.6, 'shade', 'e') + p.circle(52, -22, 2.6, 'shade', 'e');
      const vt = p.fam === 'retro' && p.w.tube === 'phosphor';
      s += shown ? p.text(0, 1, vt ? shown.toUpperCase() : shown, vt ? size * 1.35 : size, 'ink') : `<g class="st-caret">${p.rect(-1.5, -10, 3, 22, 1, 'ink')}</g>`;
      return { svg: s, ties: [[-52, -28], [52, -28]], foot: 30 };
    },
    vault(p) {
      let s = p.shadow(44, 40);
      s += p.rect(-40, -40, 80, 80, 10, 'body', 'b') + p.rect(-32, -32, 64, 64, 6, 'panel', 'b');
      s += p.circle(0, 0, 18, 'shade', 'b') + p.circle(0, 0, 6, 'ink');
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; s += p.line(Math.cos(a) * 9, Math.sin(a) * 9, Math.cos(a) * 15, Math.sin(a) * 15); }
      s += p.rect(26, -20, 6, 14, 2, 'ink') + p.rect(26, 6, 6, 14, 2, 'ink');
      return { svg: s, ties: [[0, -40]], foot: 44 };
    },
    cloud(p) {
      let s = '';
      s += p.path('M-40 18C-58 18 -58 -8 -38 -8C-40 -30 -6 -38 4 -18C14 -34 44 -26 38 -4C58 -4 56 18 40 18Z', 'body', 'a');
      s += `<path d="M0 10V-12M-9 -3L0 -12L9 -3" ${p.fam === 'nier' ? `stroke="${p.w.ink}"` : `stroke="${p.fam === 'basic' ? p.w.accent : p.w.ink}"`} stroke-width="${p.fam === 'retro' ? 2.4 : 3}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      return { svg: s, ties: [[0, -30]], foot: 18 };
    },
    backup(p) {
      let s = p.shadow(30, 36);
      s += p.rect(-36, -24, 72, 50, 10, 'body', 'c') + p.rect(-26, -14, 40, 8, 3, 'panel', 'c') + p.circle(22, -10, 4, 'accent', 'b');
      s += p.line(-26, 10, 26, 10) + p.line(-26, 2, 6, 2);
      return { svg: s, ties: [[0, -24]], foot: 28 };
    },
    house(p) {
      let s = p.shadow(40, 44);
      s += p.rect(-34, -6, 68, 46, 4, 'body', 'c') + p.path('M-44 -2L0 -40L44 -2Z', 'shade', 'c');
      s += p.rect(-10, 14, 20, 26, 3, 'ink') + p.rect(14, 2, 14, 12, 2, 'light') + p.rect(-28, 2, 14, 12, 2, 'light');
      return { svg: s, ties: [[0, -40]], foot: 40 };
    },
    globe(p) {
      let s = p.shadow(44, 30);
      s += p.circle(0, 0, 38, 'body', 'a');
      s += `<g ${p.fam === 'nier' ? '' : 'opacity=".9"'}>` + `<ellipse cx="0" cy="0" rx="16" ry="38" fill="none" ${p.fam === 'basic' || p.fam === 'nier' ? `stroke="${p.w.line}"` : `stroke="${p.w.ink}" stroke-opacity=".55"`} stroke-width="${p.fam === 'retro' ? 2.4 : 2}"/>`;
      s += `<path d="M-38 0H38M-33 -18H33M-33 18H33" ${p.fam === 'basic' || p.fam === 'nier' ? `stroke="${p.w.line}"` : `stroke="${p.w.ink}" stroke-opacity=".55"`} stroke-width="${p.fam === 'retro' ? 2.4 : 2}" fill="none"/></g>`;
      s += p.circle(14, -14, 6, 'accent', 'c');
      return { svg: s, ties: [[0, -38]], foot: 40 };
    },
    clipboard(p, o) {
      const ticks = (o && o.ticks) || 0, rows = (o && o.rows) || 4;
      let s = p.shadow(52, 40);
      s += p.rect(-38, -46, 76, 96, 8, 'body', 'e') + p.rect(-30, -34, 60, 78, 4, 'light');
      s += p.rect(-16, -52, 32, 14, 4, 'shade', 'e');
      for (let i = 0; i < rows; i++) {
        const y = -22 + i * 17;
        s += p.rect(-24, y - 5, 10, 10, 2, 'panel', 'e') + p.line(-8, y, 20, y);
        if (i < ticks) s += `<path d="M-22 ${y}L-19 ${y + 3}L-13 ${y - 4}" stroke="${p.fam === 'basic' ? p.w.accent : p.fam === 'nier' ? p.w.ink : p.w.hues.b}" stroke-width="${p.fam === 'retro' ? 2.4 : 2.8}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      return { svg: s, ties: [[0, -52]], foot: 52 };
    },
    block(p, o) {
      const hue = (o && o.hue) || 'a', icon = (o && o.icon) || 'dot';
      let s = p.rect(-26, -22, 52, 44, 8, 'body', hue);
      const ic = {
        folder: p.path('M-12 -6H-3L0 -3H12V9H-12Z', 'ink'),
        history: `<circle cx="0" cy="2" r="9" fill="none" stroke="${p.w.ink}" stroke-width="${p.fam === 'retro' ? 2.4 : 2.6}"/>` + p.line(0, 2, 0, -3) + p.line(0, 2, 4, 4),
        cloud: p.path('M-10 8C-17 8 -17 -1 -10 -1C-10 -9 1 -10 3 -4C7 -9 15 -6 13 1C18 1 18 8 13 8Z', 'ink'),
        check: `<path d="M-9 1L-3 7L10 -6" stroke="${p.w.ink}" stroke-width="${p.fam === 'retro' ? 3 : 3.4}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
        globe: `<circle cx="0" cy="0" r="9" fill="none" stroke="${p.w.ink}" stroke-width="2.4"/>` + p.line(-9, 0, 9, 0) + `<ellipse cx="0" cy="0" rx="4" ry="9" fill="none" stroke="${p.w.ink}" stroke-width="2"/>`,
        dot: p.circle(0, 0, 4, 'ink')
      }[icon] || '';
      return { svg: s + ic, ties: [[0, -22]], foot: 22 };
    },
    orb(p, o) {
      const lit = o && o.lit, label = (o && o.label) || '', hue = (o && o.hue) || 'e';
      let s = '';
      if (lit && (p.fam === 'friendly' || p.fam === 'glass')) s += `<circle r="30" fill="${p.w.hues[hue]}" opacity=".22"/>`;
      s += p.circle(0, 0, 22, lit ? 'body' : 'panel', hue);
      if (lit) s += p.circle(0, 0, 13, 'accent', hue);
      s += p.text(0, 1, label, 15, lit ? (p.fam === 'nier' ? 'light' : 'ink') : 'ink', lit ? '' : ' opacity=".55"');
      s += p.rect(-6, -30, 12, 8, 2, 'shade', hue);
      return { svg: s, ties: [[0, -30]], foot: 22 };
    },
    gift(p) {
      let s = p.shadow(36, 36);
      s += p.rect(-34, -12, 68, 48, 6, 'body', 'c') + p.rect(-38, -24, 76, 16, 4, 'shade', 'c');
      s += p.rect(-6, -24, 12, 60, 2, 'accent', 'c');
      s += p.path('M0 -24C-12 -42 -28 -30 -14 -24ZM0 -24C12 -42 28 -30 14 -24Z', 'accent', 'c');
      return { svg: s, ties: [[-26, -24], [26, -24]], foot: 36 };
    },
    palette(p) {
      let s = p.shadow(30, 44);
      s += p.path('M0 -34C30 -34 46 -14 42 4C38 22 20 18 14 26C8 34 -8 34 -24 28C-46 18 -44 -34 0 -34Z', 'body', 'e');
      s += p.circle(-20, -12, 7, 'accent', 'a') + p.circle(0, -20, 7, 'accent', 'b') + p.circle(20, -12, 7, 'accent', 'c') + p.circle(-24, 10, 7, 'accent', 'd');
      s += p.circle(10, 8, 6, 'shade', 'e');
      return { svg: s, ties: [[0, -34]], foot: 30 };
    }
  };

  // headwear for the crew at the curtain call: Coordinator's crown, Builder's hard hat, Reviewer's glasses
  const HATS = {
    crown: (p) => p.path('M-14 0L-16 -16L-7 -8L0 -20L7 -8L16 -16L14 0Z', 'accent', 'e') + p.circle(0, -20, 2.6, 'light'),
    hardhat: (p) => p.path('M-17 0C-17 -14 17 -14 17 0Z', 'accent', 'e') + p.rect(-20, -2, 40, 5, 2, 'shade', 'e') + p.rect(-2, -14, 4, 10, 1, 'light'),
    glasses: (p) => `<g fill="none" stroke="${p.fam === 'nier' ? p.w.ink : p.w.fam === 'basic' ? p.w.line : p.w.ink}" stroke-width="2.2"><circle cx="-7" cy="0" r="5.4"/><circle cx="7" cy="0" r="5.4"/><path d="M-1.6 0H1.6"/></g>`
  };

  // the crew: little Pips on their own controls, each in its role's headwear
  PROPS.crew = function (p, o) {
    const theme = p.theme || 'friendly-dark', hat = (o && o.hat) || 'crown';
    const mark = G.PMLogo.svg({ theme, px: 64, tier: 'full', decorative: true }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    // the glyph's head top sits at y 31.5; the hat rides on it
    const s = `<g transform="translate(-32 -40)">${mark}</g><g transform="translate(${hat === 'glasses' ? 0 : 0} ${hat === 'glasses' ? 3.5 : -9})">${HATS[hat](p)}</g>`;
    return { svg: s, ties: [[0, -25.5]], foot: 20 };
  };
  G.PipWorlds = { WORLDS, backdrop, pen, PROPS, HATS, mix };
})(window);
