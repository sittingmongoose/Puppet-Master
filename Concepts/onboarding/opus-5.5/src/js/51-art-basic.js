/* Basic's world on Pip's stage (DL-238): a dot grid, a ruled floor and one accent; the stage itself draws a
   protractor under the hand that reads Pip's swing in degrees, a plumb line from Pip and a marker riding the ruler
   (58-rig.js render). A check badge on the prop's corner is its celebration (59-cheer.js badge). */
(function () {
  'use strict';
  const O55 = window.O55, PW = O55.pipWorlds, R = O55.pipStage.h.R, mix = PW.mix;
  /* (colours are PMConcept7's own for each theme, sampled from the running page, or a step of one) */
  Object.assign(PW.WORLDS, {
    'basic-dark': {
      fam: 'basic', scheme: 'dark', bg: '#161616', surface: '#2A2A2A', line: '#E8E8E8', ink: '#E8E8E8', text: '#E8E8E8', accent: '#64B5F6', muted: '#6B7280', dot: 'rgba(255,255,255,.07)',
      hues: { a: '#64B5F6', b: '#64B5F6', c: '#64B5F6', d: '#64B5F6', e: '#64B5F6' }, chapter: {}
    },
    'basic-light': {
      fam: 'basic', scheme: 'light', bg: '#EAECEF', surface: '#FFFFFF', line: '#2B2B2B', ink: '#1A1A1A', text: '#1A1A1A', accent: '#0056B3', muted: '#8A929C', dot: 'rgba(0,0,0,.08)',
      hues: { a: '#0056B3', b: '#0056B3', c: '#0056B3', d: '#0056B3', e: '#0056B3' }, chapter: {}
    }
  });
  /* drawn larger than the view box, so a stage wider or taller than it never shows an edge */
  PW.BACKDROPS.basic = function backdrop(w, ids, L) {
    const W = L.w, H = L.h, gy = L.ground, X0 = -W, X1 = 2 * W, Y0 = -H, Y1 = 2 * H;
    let defs = '', s = '';
    const rect = (fill, extra) => `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${fill}"${extra || ''}/>`;
    defs += `<pattern id="${ids}dot" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.1" fill="${w.dot}"/></pattern>`;
    s += rect(w.bg) + rect(`url(#${ids}dot)`);
    // (the stage draws a protractor under the hand that measures Pip's swing)
    s += `<path d="M${X0} ${gy}H${X1}" stroke="${w.line}" stroke-opacity=".5" stroke-width="1.5"/>`;
    for (let x = 0; x <= W; x += 40) s += `<path d="M${x} ${gy}v6" stroke="${w.line}" stroke-opacity=".3" stroke-width="1"/>`;
    return { defs, back: s };
  };
})();
