/* Glass's world on Pip's stage (DL-238): PMConcept7's Ribbons wallpaper under a glass floor, with Pip's reflection
   in it (58-rig.js), caustics moving, bubbles rising and ripples where a prop lands. Glints and rising bubbles are its
   celebration, and a light sweep marks a chapter change (59-cheer.js, 30-art.css). */
(function () {
  'use strict';
  const O55 = window.O55, PW = O55.pipWorlds, R = O55.pipStage.h.R, mix = PW.mix;
  /* (colours are PMConcept7's own for each theme, sampled from the running page, or a step of one) */
  Object.assign(PW.WORLDS, {
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
    }
  });
  /* drawn larger than the view box, so a stage wider or taller than it never shows an edge */
  PW.BACKDROPS.glass = function backdrop(w, ids, L) {
    const W = L.w, H = L.h, gy = L.ground, X0 = -W, X1 = 2 * W, Y0 = -H, Y1 = 2 * H;
    let defs = '', s = '';
    const rect = (fill, extra) => `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${fill}"${extra || ''}/>`;
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
  };
})();
