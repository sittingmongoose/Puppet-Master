/* Pip's sound, round two (Fable 5.2). sfx.js: what a click, a choice and the stage sound like.
   A sound is a gesture played on a palette. The gesture says what happens (two notes rising for a choice, a soft pat
   for something set down); the palette says what it is made of in this look (felt and marimba, glass, a chip, a
   typewriter). There is one set of gestures now, PMConcept7's own, cleaned up: the band hits and the stage machinery
   of round one are gone, and with them the strum on every screen change and the kick under every landing.
   Every pitched gesture takes its notes from the chord the music is on at that moment (h.ch), whichever of the four
   songs is playing, so nothing a person does sounds out of tune with the tune.
   Rules kept here: nothing below a soft pat (no thump on a page change or a landing; the effects are also high-passed
   in the mixer), no run of clicks at an even pace (an even run is a buzz, and reads as the sound breaking up). */
(function (G) {
  'use strict';
  const PS = G.PS5, clamp = PS.clamp;
  const up = (h, inst, notes, gap, g, dt) => notes.forEach((m, i) => h.n(inst, m, (dt || 0) + i * gap, g));
  /* a few mechanical ticks, as a print head or a platen makes them: light, uneven in time, level and pitch, and never
     closer than 28 ms. accel > 0 runs faster towards the end, < 0 slower. Returns when it ends. */
  const pins = (h, n, d, g, accel, dt, drum) => {
    let t = dt || 0; const step = Math.max(0.03, d / n);
    for (let i = 0; i < n; i++) {
      const x = n > 1 ? i / (n - 1) : 0;
      h.d(drum || 'pawl', t, g * (0.55 + 0.45 * h.rand()) * (accel > 0 ? 0.75 + 0.25 * x : accel < 0 ? 1 - 0.25 * x : 1), 0.9 + 0.22 * h.rand());
      t += Math.max(0.028, step * (accel ? 1 + accel * (0.5 - x) : 1) * (0.72 + 0.56 * h.rand()));
    }
    return t;
  };
  const motif = (h, n) => h.K.motif.slice(0, clamp(n, 1, 4)).map((d) => h.deg(d));
  // how long a note of an everyday answer is held before it is damped
  const SHORT = { cut: 0.16, rel: 0.14 }, LONGER = { cut: 0.36, rel: 0.2 };

  const SET = {
    tap: (h) => { const P = h.P; h.d(P.tap, 0, 0.5, [1, 1.12, 1.26, 1.5][h.v]); if (P.tapNote) h.n(P.soft, h.ch[h.v % 3] + 12, 0, 0.14); },
    hover: (h) => h.d('click', 0, 0.2, 1.5),
    /* The everyday answers are short (each note is damped, so none rings on over the music) and each is its own
       gesture, so a choice, a switch and a step are told apart without looking:
       a choice is one small chord struck at once; a switch is a click and one note (high for on, low for off);
       a step forward is a brush of air and a stride up of two notes; a step back is the stride down, no air. */
    select: (h) => { const P = h.P; h.n(P.lead, h.ch[1] + 12, 0, 0.46, LONGER); h.n(P.lead, h.ch[2] + 12, 0.012, 0.5, LONGER); },
    toggleOn: (h) => { h.d('click', 0, 0.3, 1.5); h.n(h.P.soft, h.ch[2] + 12, 0.03, 0.44, SHORT); },
    toggleOff: (h) => { h.d('click', 0, 0.3, 1.05); h.n(h.P.soft, h.ch[0], 0.03, 0.4, SHORT); },
    next: (h) => { h.sw({ d: 0.16, f: 900, f2: 2600, gain: 0.03, a: 0.5 }); h.n(h.P.lead, h.ch[0] + 12, 0.05, 0.42, SHORT); h.n(h.P.lead, h.ch[2] + 12, 0.15, 0.46, LONGER); },
    back: (h) => { h.n(h.P.lead, h.ch[2] + 12, 0, 0.4, SHORT); h.n(h.P.lead, h.ch[0] + 12, 0.1, 0.4, LONGER); },
    // the window opens like a curtain: a long breath of air, and the chord blooms at once, softly (a chapter, below, is a fanfare)
    open: (h) => { h.sw({ d: 0.5, f: 380, f2: 1600, gain: 0.045, a: 0.6 }); [h.ch[0], h.ch[2], h.ch[1] + 12].forEach((m, i) => h.n(h.P.soft, m, 0.3 + i * 0.016, 0.3)); h.n(h.P.bell, h.ch[0] + 24, 0.42, 0.12); },
    close: (h) => { up(h, h.P.soft, [h.ch[2] + 12, h.ch[1] + 12, h.ch[0] + 12, h.ch[0]], 0.075, 0.32); },
    key: (h) => { h.d(h.P.tap, 0, 0.34, 0.92 + 0.03 * (h.idx % 5)); h.n(h.P.soft, h.deg((h.idx % 8) + 7), 0, 0.15); },
    // not allowed: the third falls a small step, a question more than an alarm
    warn: (h) => { const f = 440 * Math.pow(2, (h.root + h.third - 69) / 12); h.tone({ f, f2: f * 0.89, glide: 0.09, d: 0.13, gain: 0.085 }); h.tone({ f: f * 0.79, f2: f * 0.7, glide: 0.1, d: 0.16, gain: 0.085 }, 0.17); },
    // a prop let down on its string: two soft notes falling; lifted away: two rising and a breath
    lower: (h) => { h.n(h.P.string, h.strM(64), 0, 0.24, SHORT); h.n(h.P.string, h.strM(59), 0.07, 0.28, LONGER); },
    ghost: (h) => { h.n(h.P.string, h.strM(67), 0, 0.14); },
    // something set down: a soft pat and the faintest note, never a thud
    land: (h) => { h.d(h.P.pat || 'wood', 0, 0.26, 1.2 + 0.08 * h.v); h.n(h.P.bell, h.ch[h.v % 3] + 24, 0.014, 0.1, { cut: 0.08, rel: 0.08 }); },
    lift: (h) => { h.n(h.P.string, h.strM(59), 0, 0.22, SHORT); h.n(h.P.string, h.strM(64), 0.07, 0.24, SHORT); h.sw({ d: 0.2, f: 700, f2: 1900, gain: 0.02 }, 0.04); },
    hop: (h) => { h.tone({ type: 'triangle', f: 260, f2: 560, glide: 0.11, d: 0.18, gain: 0.09 }); },
    swing: (h) => h.sw({ d: 0.42, f: 400, f2: 1100, gain: 0.035, q: 0.8 }),
    tryOn: (h) => { h.sw({ d: 0.22, f: 600, f2: 2400, gain: 0.035 }); h.K.sig(h, 0.12); },
    sparkle: (h) => { for (let i = 0; i < 3; i++) h.n(h.P.bell, h.ch[(i + h.v) % 3] + 24, i * 0.075 + h.rand() * 0.02, 0.2); },
    confetti: (h) => {
      const P = h.P;
      // a small clean pop to set it off (no hiss), then a little fanfare
      h.tone({ type: 'triangle', f: 340, f2: 1100, glide: 0.05, d: 0.09, gain: 0.11 }); h.d('click', 0.004, 0.24, 1.3);
      // a little fanfare in the look's own material: up the scale, round the chord, and home
      let t = 0.12; [4, 7, 9, 11, 9, 7, 9, 11, 14].forEach((d, i) => { h.n(P.box || P.lead, h.deg(d), t, 0.42); t += i === 3 || i === 7 ? 0.24 : 0.12; });
      up(h, P.lead, [h.deg(0) - 12, h.deg(2) - 12, h.deg(4) - 12, h.deg(7) - 12], 0.03, 0.4, t - 0.36);
      for (let i = 0; i < 5; i++) h.n(P.bell, h.deg([7, 9, 11, 14][i % 4]) + 12, t - 0.2 + i * 0.08, 0.16);
    },
    // a new chapter: a small fanfare. Three quick notes up the chord, then it lands on the next note of the look's own motif (a step higher each chapter), with a bell above
    chapter: (h) => {
      const P = h.P, land = h.deg(h.K.motif[clamp(h.depth, 1, 4) - 1]);
      [h.ch[0], h.ch[1], h.ch[2]].forEach((m, i) => h.n(P.lead, m + (m + 12 <= land ? 12 : 0), i * 0.085, 0.36, SHORT));
      h.n(P.lead, land, 0.3, 0.5); h.n(P.bell, land + 12, 0.31, 0.2);
    },
    tick: (h) => { h.d('click', 0, 0.2); h.n(h.P.lead, h.deg([2, 3, 4, 7][clamp(h.idx, 0, 3)]), 0.03, 0.44, SHORT); if (h.idx >= 3) up(h, h.P.soft, [h.deg(7), h.deg(9), h.deg(11)], 0.05, 0.26, 0.12); },
    block: (h) => { h.d(h.P.pat || 'wood', 0, 0.3, 0.9); h.n(h.P.lead, h.deg([0, 2, 4, 5, 7, 8][clamp(h.idx, 0, 5)]), 0.02, 0.46); if (h.count && h.idx >= h.count - 1) up(h, h.P.lead, [0, 2, 4, 7, 9].map((x) => h.deg(x)), 0.05, 0.4, 0.2); },
    power: (h) => { h.tone({ f: 330, f2: 900, glide: 0.25, d: 0.3, gain: 0.04, a: 0.02 }); h.n(h.P.soft, h.ch[h.idx % 3] + 12, 0.16, 0.4); h.n(h.P.bell, h.ch[(h.idx + 2) % 3] + 24, 0.25, 0.16); },
    score: (h) => h.d('click', 0, 0.2, 1.3), lock: (h) => h.d('click', 0, 0.3, 1.1), decode: (h) => { pins(h, 3, 0.15, 0.14, 0, 0, 'click'); },
    slice: (h) => h.sw({ d: 0.18, f: 1800, f2: 900, gain: 0.025 }), degauss: (h) => h.sw({ d: 0.4, f: 300, f2: 700, gain: 0.03 }), feed: (h) => { pins(h, 3, 0.14, 0.2); },
    powerOn: (h) => { h.sw({ d: 0.6, f: 300, f2: 1500, gain: 0.035 }); up(h, h.P.soft, [h.ch[0], h.ch[1], h.ch[2], h.ch[0] + 12], 0.055, 0.3, 0.25); },
    powerOff: (h) => { up(h, h.P.soft, [h.deg(7), h.deg(4), h.deg(2), h.deg(0)], 0.065, 0.3); },
    rail: (h) => { h.tone({ type: 'triangle', f: 500, f2: 1100, glide: 0.08, d: 0.1, gain: 0.035 }); h.d(h.P.tap, 0.1, 0.22, 1.3); },
    tip: (h) => { h.n(h.P.soft, h.ch[1] + 12, 0, 0.26, SHORT); h.n(h.P.soft, h.ch[2] + 12, 0.09, 0.3, LONGER); },
    cheer: (h) => { up(h, h.P.lead, [h.ch[0], h.ch[1], h.ch[2], h.ch[0] + 12].map((m) => m + (h.v % 2 ? 12 : 0)), 0.05, 0.34, 0.14); h.n(h.P.bell, h.ch[2] + 24, 0.38, 0.14); },
    crew: (h) => { up(h, h.P.box || h.P.lead, [0, 2, 4, 7, 9].map((d) => h.deg(d) + 12), 0.09, 0.32, 0.5); up(h, h.P.lead, [h.deg(0) - 12, h.deg(4) - 12, h.deg(7) - 12], 0, 0.36, 0.95); },
    snore: (h) => { h.sw({ d: 1.25, f: 700, f2: 1100, q: 1.1, gain: 0.035, a: 0.45 }); h.sw({ d: 1.3, f: 520, f2: 340, q: 1, gain: 0.03, a: 0.2 }, 1.45); h.n(h.P.soft, h.ch[2] + 12, 2.5, 0.07); h.n(h.P.soft, h.ch[0] + 12, 2.72, 0.06); }
  };

  /* ------------------------------------------------------------------ what only one look does */
  const SPECIAL = {
    phosphor: {
      // the tube: a relay, the picture's wobble, the dot it collapses to
      degauss: (h) => { h.tone({ type: 'triangle', f: 230, f2: 380, glide: 0.18, d: 0.45, gain: 0.05, lp: 900 }); h.sw({ d: 0.45, f: 500, f2: 1600, gain: 0.03, q: 2 }); h.d('click', 0, 0.36, 0.8); },
      powerOn: (h) => { h.d('click', 0, 0.44, 0.7); h.sw({ d: 0.5, f: 300, f2: 2600, gain: 0.03, q: 1.4, white: true }); up(h, 'chip25', [0, 2, 4, 7, 9].map((x) => h.deg(x)), 0.05, 0.3, 0.22); },
      powerOff: (h) => { h.tone({ type: 'triangle', f: 1400, f2: 200, glide: 0.2, d: 0.26, gain: 0.06, lp: 2400 }); h.d('click', 0.22, 0.36, 0.7); },
      decode: (h) => { pins(h, 4, 0.14, 0.34, 0, 0, 'nztick'); h.n('chip50', h.ch[h.v % 3] + 12, 0.12, 0.16, { dur: 0.03 }); },
      score: (h) => h.n('chip12', h.root + 24, 0, 0.14, { dur: 0.02 }), lock: (h) => { h.n('chip50', h.root + 12, 0, 0.2, { dur: 0.03 }); h.n('chip50', h.root + 19, 0.05, 0.22, { dur: 0.05 }); },
      hop: (h) => h.n('chip50', h.root, 0, 0.26, { dur: 0.1, slide: -7 }),
      lower: (h) => { for (let i = 0; i < 3; i++) h.n('chip50', h.root + 12 - i * 3, i * 0.045, 0.18, { dur: 0.03 }); },
      lift: (h) => { for (let i = 0; i < 3; i++) h.n('chip50', h.root + 3 + i * 3, i * 0.045, 0.18, { dur: 0.03 }); },
      land: (h) => { h.d('nztick', 0, 0.36, 0.8); h.n('chip50', h.root, 0.004, 0.14, { dur: 0.03 }); }
    },
    teletype: {
      /* The printer and the typewriter. Round one ran a ratchet of many metal clicks at an even, fast pace, and that is
         what sounded like the audio breaking up. Now: a few key taps, spaced so each one is heard, low in the mix, and
         the margin bell carries the gesture. */
      feed: (h) => { pins(h, 3, 0.22, 0.16, 0, 0, 'key'); },
      powerOn: (h) => { h.sw({ d: 0.5, f: 420, f2: 1100, q: 2.2, gain: 0.03, a: 0.5 }); const e = pins(h, 3, 0.27, 0.16, 0, 0.3, 'key'); h.n('bell', h.ch[0] + 12, e + 0.05, 0.2); },
      powerOff: (h) => { const e = pins(h, 3, 0.27, 0.14, -0.6, 0, 'key'); h.n('bell', h.ch[2], e + 0.04, 0.16); },
      // the carriage comes home: two keys, then the margin bell's two notes
      next: (h) => { h.d('key', 0, 0.3, 0.9); h.d('key', 0.09, 0.24, 1.03); h.n('bell', h.ch[1] + 12, 0.16, 0.2, SHORT); h.n('bell', h.ch[2] + 12, 0.25, 0.22); },
      decode: (h) => { pins(h, 3, 0.2, 0.14, 0, 0, 'key'); },
      tap: (h) => h.d('key', 0, 0.36, [1, 1.08, 0.95, 1.14][h.v]),
      lower: (h) => { h.sw({ d: 0.16, f: 2200, f2: 1300, gain: 0.02, q: 1.2 }); h.n('celesta', h.strM(62), 0.1, 0.2, SHORT); },
      lift: (h) => { h.sw({ d: 0.16, f: 1300, f2: 2400, gain: 0.02, q: 1.2 }); h.n('celesta', h.strM(66), 0.1, 0.2, SHORT); },
      land: (h) => { h.d('key', 0, 0.22, 0.9); h.n('bell', h.ch[h.v % 3] + 12, 0.014, 0.08, { cut: 0.08, rel: 0.08 }); },
      lock: (h) => { h.d('key', 0, 0.26); h.d('key', 0.08, 0.24, 1.1); }
    },
    nier: {
      // a unit's menu: soft ticks, a slip of the picture, a lock
      hover: (h) => { h.tone({ f: 2640, d: 0.035, gain: 0.14, a: 0.006 }); },
      tap: (h) => { h.tone({ f: [2640, 2349, 2794, 2489][h.v], d: 0.035, gain: 0.14, a: 0.006 }); h.d('click', 0, 0.2, 1.6); },
      slice: (h) => { h.sw({ d: 0.05, f: 2600, q: 4, gain: 0.05, a: 0.1, white: true }); h.sw({ d: 0.04, f: 900, q: 4, gain: 0.04, a: 0.1, white: true }, 0.06); },
      lock: (h) => { h.tone({ f: 1760, d: 0.03, gain: 0.12 }); h.tone({ f: 2349, d: 0.03, gain: 0.12 }, 0.06); h.tone({ f: 2637, d: 0.12, gain: 0.12 }, 0.12); },
      decode: (h) => { let t = 0; for (let i = 0; i < 4; i++) { h.tone({ f: 2000 + h.rand() * 1500, d: 0.015, gain: 0.1, a: 0.003 }, t); t += 0.03 + 0.02 * h.rand(); } },
      ghost: (h) => h.tone({ f: 1760, d: 0.05, gain: 0.07, a: 0.01 }),
      hop: () => {}, swing: () => {},
      think: (h) => { [0, 0.05, 0.1].forEach((d, i) => h.tone({ f: 2093 + i * 330, d: 0.03, gain: 0.12, a: 0.006 }, d)); },
      // a unit coming on line: two soft bells rising, not a run of bleeps
      wake: (h) => { h.n('softbell', h.ch[0] + 12, 0, 0.3); h.n('softbell', h.ch[2] + 12, 0.22, 0.34); }
    }
  };

  PS.sfx = { SET, SPECIAL, util: { up, pins, motif } };
})(window);
