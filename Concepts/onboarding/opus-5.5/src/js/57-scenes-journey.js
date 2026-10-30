/* The props for the screens the concept did not draw (DL-238): a NAS, a key, an identity card, a pairing code, the
   Recovery Kit, a lock, a copy of a Project's settings, an online service and free models. Each is drawn once with the
   world's pen (56-scenes-flow.js), so it reads as felt, glass, a diagram, pixels or printer's ink, or NieR's line art,
   and says where its strings tie on and how far it reaches down. */
(function () {
  'use strict';
  const O55 = window.O55, PW = O55.pipWorlds, R = O55.pipStage.h.R;
  Object.assign(PW.PROPS, {
    /* a two-bay NAS, its drives' lights blinking in turn */
    nas(p) {
      let s = p.rect(-36, -42, 72, 84, 8, 'body', 'b');
      for (let i = 0; i < 2; i++) {
        const x = -28 + i * 30;
        s += p.rect(x, -32, 26, 58, 4, 'panel', 'b') + p.line(x + 6, -20, x + 20, -20) + p.line(x + 6, -12, x + 20, -12) + p.line(x + 6, -4, x + 16, -4);
        s += `<g class="st-led" style="--dl:${-i * 0.5}s">${p.circle(x + 13, 16, 3.2, 'accent', 'c')}</g>`;
      }
      s += p.rect(-22, 32, 44, 4, 2, 'shade', 'b');
      return { svg: s, ties: [[0, -42]], foot: 42 };
    },
    /* a key: an SSH key, a setup code, an API key or a token */
    key(p) {
      let s = p.circle(-20, 0, 15, 'body', 'e') + p.circle(-20, 0, 5.5, 'light');
      s += p.rect(-7, -4.5, 42, 9, 3, 'body', 'e') + p.rect(18, 4, 6, 10, 2, 'shade', 'e') + p.rect(28, 4, 5, 7, 2, 'shade', 'e');
      return { svg: s, ties: [[-20, -15]], foot: 15 };
    },
    /* an identity card: the device's picture (the identity the window shows beside the words) and its lines */
    idcard(p, o) {
      let s = p.rect(-42, -30, 84, 60, 7, 'body', 'a') + p.rect(-34, -22, 30, 30, 4, 'panel', 'a');
      const seed = String((o && o.seed) || 'pip'), cells = [];
      let h = 7; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
      for (let y = 0; y < 3; y++) for (let x = 0; x < 2; x++) { if ((h >> (y * 2 + x)) & 1 || (x === 1 && y === 1)) { cells.push([x, y]); if (x === 0) cells.push([2, y]); } }
      cells.forEach(([x, y]) => { s += p.rect(-31 + x * 8.4, -19 + y * 8.4, 7, 7, 1.5, 'accent', 'c'); });
      s += p.line(4, -14, 32, -14) + p.line(4, -4, 26, -4) + p.line(4, 6, 30, 6) + p.rect(-34, 16, 68, 6, 2, 'shade', 'a');
      return { svg: s, ties: [[0, -30]], foot: 30 };
    },
    /* a pairing code: the QR the other device reads, its finder corners and modules */
    qr(p) {
      let s = p.rect(-32, -32, 64, 64, 6, 'panel', 'd');
      [[-26, -26], [10, -26], [-26, 10]].forEach(([x, y]) => { s += p.rect(x, y, 16, 16, 2, 'ink') + p.rect(x + 3.5, y + 3.5, 9, 9, 1, 'light') + p.rect(x + 6, y + 6, 4, 4, 1, 'ink'); });
      const mods = [[0, -24], [4, -16], [-6, -6], [2, -4], [8, 0], [14, 4], [20, 0], [0, 6], [-10, 2], [6, 12], [14, 14], [22, 20], [10, 22], [-2, 18]];
      mods.forEach(([x, y]) => { s += p.rect(x, y, 4.4, 4.4, 0.6, 'ink'); });
      return { svg: s, ties: [[0, -32]], foot: 32 };
    },
    /* the Recovery Kit: a folder with a band and a key's emblem, the one way back in */
    kit(p) {
      let s = p.rect(-36, -30, 72, 62, 6, 'body', 'c') + p.path('M-36 -18H36', 'line');
      s += p.rect(-36, -30, 72, 12, 4, 'shade', 'c') + p.circle(0, 8, 11, 'panel', 'c') + p.circle(-3, 8, 4, 'accent', 'e') + p.rect(0, 6, 9, 4, 1.5, 'accent', 'e');
      return { svg: s, ties: [[0, -30]], foot: 32 };
    },
    /* a lock, shut */
    lock(p) {
      let s = `<path d="M-14 -6V-16A14 14 0 0 1 14 -16V-6" ${p.fam === 'basic' ? `fill="none" stroke="${p.w.line}" stroke-width="5"` : `fill="none" stroke="${p.fam === 'glass' ? p.w.ink : p.fam === 'nier' ? p.w.ink : p.fam === 'retro' ? p.w.ink : p.w.ink}" stroke-width="${p.fam === 'nier' ? 3 : 6}" stroke-linecap="${p.fam === 'retro' || p.fam === 'nier' ? 'square' : 'round'}"`}/>`;
      s += p.rect(-24, -8, 48, 40, 7, 'body', 'd') + p.circle(0, 8, 5, 'ink') + p.rect(-2, 10, 4, 10, 1.5, 'ink');
      return { svg: s, ties: [[0, -30]], foot: 32 };
    },
    /* a copy of a Project's settings: two sheets, sliders on the front one */
    settings(p) {
      let s = p.rect(-26, -40, 56, 70, 6, 'shade', 'b') + p.rect(-34, -32, 56, 70, 6, 'body', 'b');
      [[-22, -18, 0.6], [-22, -2, 0.3], [-22, 14, 0.8]].forEach(([x, y, k]) => { s += p.line(x, y, x + 32, y) + p.circle(x + 32 * k, y, 4.5, 'accent', 'e'); });
      return { svg: s, ties: [[-6, -32]], foot: 38 };
    },
    /* an online service (GitHub, GitLab and the rest): a card with a branch graph, three commits and a merge */
    forge(p) {
      let s = p.rect(-40, -34, 80, 68, 8, 'body', 'd') + p.rect(-40, -34, 80, 14, 6, 'shade', 'd');
      s += p.circle(-30, -27, 2.6, 'light') + p.circle(-22, -27, 2.6, 'light');
      s += p.line(-18, -8, -18, 22) + `<path d="M-18 -2C2 -2 2 8 14 8" ${p.fam === 'basic' ? `fill="none" stroke="${p.w.line}" stroke-width="2"` : `fill="none" stroke="${p.w.ink}" stroke-width="2.4" stroke-linecap="round"`}/>`;
      s += p.circle(-18, -8, 5, 'accent', 'b') + p.circle(-18, 22, 5, 'accent', 'b') + p.circle(14, 8, 5, 'accent', 'c');
      return { svg: s, ties: [[0, -34]], foot: 34 };
    },
    /* free models: a tag with a hole, three small orbs on it, and a spark */
    free(p) {
      let s = p.path('M-38 -18H22L40 0L22 18H-38Z', 'body', 'b') + p.circle(26, 0, 4.5, 'light');
      [-24, -10, 4].forEach((x, i) => { s += p.circle(x, 0, 6, 'accent', 'abc'[i]); });
      s += p.sparkle(-34, -26, 7, 'e');
      return { svg: s, ties: [[-8, -18]], foot: 18 };
    }
  });
})();
