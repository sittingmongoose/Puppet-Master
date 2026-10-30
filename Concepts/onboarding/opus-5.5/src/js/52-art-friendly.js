/* Friendly's world on Pip's stage (DL-238): a felt diorama. Stitched hills, a glow in the chapter's colour, felt
   clouds swaying on their threads, pastel crumbs drifting, fireflies in the dark and paper butterflies in the light.
   Stars, hearts and a hop are its celebration (59-cheer.js). */
(function () {
  'use strict';
  const O55 = window.O55, PW = O55.pipWorlds, R = O55.pipStage.h.R, mix = PW.mix;
  /* (colours are PMConcept7's own for each theme, sampled from the running page, or a step of one) */
  Object.assign(PW.WORLDS, {
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
    }
  });
  /* drawn larger than the view box, so a stage wider or taller than it never shows an edge */
  PW.BACKDROPS.friendly = function backdrop(w, ids, L) {
    const W = L.w, H = L.h, gy = L.ground, X0 = -W, X1 = 2 * W, Y0 = -H, Y1 = 2 * H;
    let defs = '', s = '';
    const rect = (fill, extra) => `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${fill}"${extra || ''}/>`;
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
  };
})();
