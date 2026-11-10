/* Pip's sound (Fable 5.2). sfx.js: what a click, a choice and the stage sound like.
   A sound is a gesture played on a palette. The gesture says what happens (two notes rising for a choice, a thud
   and a note for something set down); the palette says what it is made of in this look (felt and marimba, glass,
   a chip, a typewriter). Three sets of gestures, one per concept:
     g1  Encore: PMConcept7's own gestures, cleaned up, in better instruments
     g2  House Band: every action is a hit from the band, placed on the beat
     g3  Marionette Theatre: stage machinery and clockwork: pulleys, ratchets, pizzicato, a bell
   Every pitched gesture takes its notes from the chord the music is on at that moment (h.ch), so nothing a person
   does ever sounds out of tune with the tune. */
(function (G) {
  'use strict';
  const PS = G.PS5, clamp = PS.clamp;
  const up = (h, inst, notes, gap, g, dt) => notes.forEach((m, i) => h.n(inst, m, (dt || 0) + i * gap, g));
  // a run of ratchet clicks that speeds up (or slows down)
  const ratchet = (h, n, d, g, accel, dt, drum) => { let t = dt || 0; for (let i = 0; i < n; i++) { h.d(drum || 'pawl', t, g * (0.7 + 0.3 * (accel > 0 ? i / n : 1 - i / n)), 0.9 + 0.25 * (accel > 0 ? i / n : 1 - i / n)); t += (d / n) * (accel ? 1 + accel * (0.5 - i / n) : 1); } return t; };
  const squeak = (h, dt, f, g) => h.tone({ f, f2: f * (1.08 + 0.1 * h.rand()), d: 0.05, gain: g == null ? 0.03 : g, a: 0.008 }, dt);
  // a few hands clapping: a tiny audience
  const applause = (h, dur, g) => { const n = Math.round(dur * 26); for (let i = 0; i < n; i++) { const x = h.rand(), t = x * dur, env = Math.sin(Math.PI * Math.min(1, x * 1.15)) ; h.d('clap', t, g * (0.35 + 0.65 * h.rand()) * (0.3 + 0.7 * env), 0.82 + 0.5 * h.rand()); } };
  const scaleRun = (h, inst, from, n, gap, g, dt) => { for (let i = 0; i < n; i++) h.n(inst, h.deg(from + i), (dt || 0) + i * gap, g * (0.75 + 0.25 * i / n)); };
  const motif = (h, n) => h.K.motif.slice(0, clamp(n, 1, 4)).map((d) => h.deg(d));

  /* ------------------------------------------------------------------ g1: Encore */
  const g1 = {
    tap: (h) => { const P = h.P; h.d(P.tap, 0, 0.5, [1, 1.12, 1.26, 1.5][h.v]); if (P.tapNote) h.n(P.soft, h.ch[h.v % 3] + 12, 0, 0.14); },
    hover: (h) => h.d('click', 0, 0.2, 1.5),
    select: (h) => { const P = h.P; h.n(P.lead, h.ch[1] + 12, 0, 0.5); h.n(P.lead, h.ch[2] + 12, 0.065, 0.56); },
    toggleOn: (h) => { const P = h.P; h.n(P.soft, h.ch[0] + 12, 0, 0.4); h.n(P.soft, h.ch[2] + 12, 0.055, 0.46); },
    toggleOff: (h) => { const P = h.P; h.n(P.soft, h.ch[2] + 12, 0, 0.36); h.n(P.soft, h.ch[0] + 12, 0.055, 0.36); h.d('felt', 0.06, 0.18); },
    next: (h) => { up(h, h.P.lead, [h.ch[0] + 12, h.ch[1] + 12, h.ch[2] + 12], 0.055, 0.42); h.sw({ d: 0.22, f: 700, f2: 2200, gain: 0.03 }); },
    back: (h) => { h.n(h.P.lead, h.ch[2] + 12, 0, 0.4); h.n(h.P.lead, h.ch[0] + 12, 0.065, 0.4); },
    open: (h) => { h.sw({ d: 0.4, f: 400, f2: 1500, gain: 0.045 }); up(h, h.P.soft, [h.ch[0], h.ch[1], h.ch[2], h.ch[0] + 12, h.ch[1] + 12], 0.065, 0.32, 0.05); },
    close: (h) => { up(h, h.P.soft, [h.ch[2] + 12, h.ch[1] + 12, h.ch[0] + 12, h.ch[0]], 0.07, 0.32); h.d('felt', 0.3, 0.3); },
    key: (h) => { h.d(h.P.tap, 0, 0.36, 0.92 + 0.03 * (h.idx % 5)); h.n(h.P.soft, h.deg((h.idx % 8) + 7), 0, 0.15); },
    warn: (h) => { h.n(h.P.lead, h.root + h.third, 0, 0.5); h.n(h.P.lead, h.root + 1, 0.15, 0.5); },
    lower: (h) => { h.n(h.P.string, h.strM(55), 0, 0.42); h.sw({ d: 0.12, f: 950, f2: 720, q: 6, gain: 0.02, a: 0.25 }, 0.02); },
    ghost: (h) => { h.n(h.P.string, h.strM(67), 0, 0.14); },
    land: (h) => { h.d('felt', 0, 0.5, 0.9 + 0.08 * h.v); h.d(h.P.thud, 0.004, 0.22, 0.85 + 0.1 * h.v); },
    lift: (h) => { h.sw({ d: 0.3, f: 500, f2: 1600, gain: 0.045 }); h.n(h.P.string, h.strM(64), 0.05, 0.16); },
    hop: (h) => { h.tone({ type: 'triangle', f: 210, f2: 520, glide: 0.12, d: 0.2, gain: 0.12 }); h.d('felt', 0, 0.16); },
    swing: (h) => h.sw({ d: 0.42, f: 400, f2: 1100, gain: 0.04, q: 0.8 }),
    tryOn: (h) => { h.sw({ d: 0.22, f: 600, f2: 2400, gain: 0.04 }); h.K.sig(h, 0.12); },
    sparkle: (h) => { for (let i = 0; i < 5; i++) h.n(h.P.bell, h.ch[(i + h.v) % 3] + 24, i * 0.06 + h.rand() * 0.03, 0.2); },
    confetti: (h) => {
      const P = h.P; h.d('felt', 0, 0.5); h.sw({ d: 0.09, f: 1600, gain: 0.1, q: 0.5 });
      // a little fanfare in the look's own material: up the scale, round the chord, and home
      let t = 0.12; [4, 7, 9, 11, 9, 7, 9, 11, 14].forEach((d, i) => { h.n(P.box || P.lead, h.deg(d), t, 0.42); t += i === 3 || i === 7 ? 0.24 : 0.12; });
      up(h, P.lead, [h.deg(0) - 12, h.deg(2) - 12, h.deg(4) - 12, h.deg(7) - 12], 0.03, 0.4, t - 0.36);
      for (let i = 0; i < 6; i++) h.n(P.bell, h.deg([7, 9, 11, 14][i % 4]) + 12, t - 0.2 + i * 0.07, 0.16);
    },
    chapter: (h) => {
      const P = h.P, m = motif(h, h.depth); m.forEach((x, i) => { const last = i === m.length - 1; h.n(P.lead, x, i * 0.13, 0.46); h.n(P.soft, x, i * 0.13, 0.22); if (last && h.depth >= 4) up(h, P.soft, [h.deg(0), h.deg(2), h.deg(4), h.deg(7)], 0.03, 0.3, i * 0.13 + 0.18); });
    },
    tick: (h) => { h.d('click', 0, 0.3); h.d('click', 0.05, 0.24, 1.2); h.n(h.P.lead, h.deg([2, 3, 4, 7][clamp(h.idx, 0, 3)]), 0.04, 0.46); if (h.idx >= 3) up(h, h.P.soft, [h.deg(7), h.deg(9), h.deg(11)], 0.04, 0.26, 0.1); },
    block: (h) => { h.d('knock', 0, 0.4); h.d('felt', 0, 0.4); h.n(h.P.lead, h.deg([0, 2, 4, 5, 7, 8][clamp(h.idx, 0, 5)]), 0.02, 0.46); if (h.count && h.idx >= h.count - 1) up(h, h.P.lead, [0, 2, 4, 7, 9].map((x) => h.deg(x)), 0.045, 0.4, 0.18); },
    power: (h) => { h.tone({ f: 300, f2: 900, glide: 0.25, d: 0.3, gain: 0.045, a: 0.02 }); h.n(h.P.soft, h.ch[h.idx % 3] + 12, 0.16, 0.4); h.n(h.P.bell, h.ch[(h.idx + 2) % 3] + 24, 0.24, 0.16); },
    score: (h) => h.d('click', 0, 0.2, 1.3), lock: (h) => h.d('click', 0, 0.3, 1.1), decode: (h) => { for (let i = 0; i < 3; i++) h.d('click', i * 0.05, 0.14, 1.2 + i * 0.12); },
    slice: (h) => h.sw({ d: 0.18, f: 1800, f2: 900, gain: 0.025 }), degauss: (h) => h.sw({ d: 0.4, f: 300, f2: 700, gain: 0.03 }), feed: (h) => { for (let i = 0; i < 3; i++) h.d('pawl', i * 0.04, 0.2); },
    powerOn: (h) => { h.sw({ d: 0.6, f: 300, f2: 1500, gain: 0.04 }); up(h, h.P.soft, [h.ch[0], h.ch[1], h.ch[2], h.ch[0] + 12], 0.05, 0.3, 0.25); },
    powerOff: (h) => { up(h, h.P.soft, [h.deg(7), h.deg(4), h.deg(2), h.deg(0)], 0.06, 0.3); h.d('felt', 0.25, 0.26); },
    rail: (h) => { h.tone({ type: 'triangle', f: 500, f2: 1100, glide: 0.08, d: 0.1, gain: 0.04 }); h.d(h.P.tap, 0.1, 0.24, 1.3); },
    tip: (h) => { h.n(h.P.soft, h.ch[1] + 12, 0, 0.26); h.n(h.P.soft, h.ch[2] + 12, 0.09, 0.3); },
    cheer: (h) => { up(h, h.P.lead, [h.ch[0], h.ch[1], h.ch[2], h.ch[0] + 12].map((m) => m + (h.v % 2 ? 12 : 0)), 0.045, 0.36, 0.14); for (let i = 0; i < 3; i++) h.n(h.P.bell, h.ch[i] + 24, 0.35 + i * 0.07, 0.14); },
    crew: (h) => { up(h, h.P.box || h.P.lead, [0, 2, 4, 7, 9].map((d) => h.deg(d) + 12), 0.09, 0.32, 0.5); up(h, h.P.lead, [h.deg(0) - 12, h.deg(4) - 12, h.deg(7) - 12], 0, 0.36, 0.95); },
    snore: (h) => { h.sw({ d: 1.25, f: 700, f2: 1100, q: 1.1, gain: 0.035, a: 0.45 }); h.sw({ d: 1.3, f: 520, f2: 340, q: 1, gain: 0.03, a: 0.2 }, 1.45); h.n(h.P.soft, h.ch[2] + 12, 2.5, 0.07); h.n(h.P.soft, h.ch[0] + 12, 2.72, 0.06); }
  };

  /* ------------------------------------------------------------------ g2: House Band */
  const strum = (h, inst, g, dt, upstroke) => { const c = [h.ch[0], h.ch[1], h.ch[2], h.ch[0] + 12]; (upstroke ? c.reverse() : c).forEach((m, i) => h.n(inst, m, (dt || 0) + i * 0.013, g * (i === 3 ? 1.1 : 1))); };
  const g2 = Object.assign({}, g1, {
    tap: (h) => h.d(h.P.tap, 0, 0.42, [1, 1.1, 0.94, 1.18][h.v]),
    select: (h) => { strum(h, h.P.lead, 0.4, 0, true); h.d(h.P.snap || 'snap', 0, 0.4); },
    toggleOn: (h) => { h.d('snap', 0, 0.4); h.n(h.P.low, h.ch[0] - 12, 0, 0.5, { dur: 0.16 }); h.n(h.P.low, h.ch[0] - 5, 0.09, 0.5, { dur: 0.25 }); },
    toggleOff: (h) => { h.d('rim', 0, 0.36); h.n(h.P.low, h.ch[0] - 5, 0, 0.46, { dur: 0.16 }); h.n(h.P.low, h.ch[0] - 12, 0.09, 0.46, { dur: 0.25 }); },
    // a little pick-up from the drummer, and the band lands on the chord
    next: (h) => { const b = h.beat / 2; h.d(h.P.tom || 'tom', 0, 0.36, 1.25); h.d(h.P.tom || 'tom', b / 2, 0.42, 1.05); h.d(h.P.hit || 'snare', b, 0.36); strum(h, h.P.lead, 0.36, b); h.n(h.P.low, h.ch[0] - 12, b, 0.5, { dur: 0.3 }); },
    back: (h) => { const b = h.beat / 2; h.d(h.P.tom || 'tom', 0, 0.34, 1.05); h.d(h.P.tom || 'tom', b / 2, 0.36, 1.25); h.n(h.P.low, h.ch[0] - 5, b, 0.44, { dur: 0.14 }); h.n(h.P.low, h.ch[0] - 12, b * 1.5, 0.44, { dur: 0.3 }); },
    // the count-in: sticks, then everyone
    open: (h) => { const b = h.beat / 2; for (let i = 0; i < 4; i++) h.d(h.P.stick || 'rim', i * b, 0.34 + 0.05 * i, i === 3 ? 1.12 : 1); strum(h, h.P.lead, 0.4, 4 * b); h.n(h.P.low, h.ch[0] - 12, 4 * b, 0.5, { dur: 0.4 }); h.n(h.P.bell, h.ch[2] + 24, 4 * b + 0.05, 0.2); },
    close: (h) => { const b = h.beat / 2; [7, 5, 4, 2, 0].forEach((d, i) => h.n(h.P.low, h.deg(d) - 24, i * b * 0.5, 0.46, { dur: 0.14 })); strum(h, h.P.lead, 0.3, 2.5 * b); h.d(h.P.hit || 'snare', 2.5 * b, 0.3); },
    key: (h) => { h.d(h.P.tap, 0, 0.3, 0.95 + 0.04 * (h.idx % 4)); h.n(h.P.soft, h.pent(h.idx % 10), 0, 0.2, { dur: 0.12 }); },
    warn: (h) => { h.d('woodlo', 0, 0.44); h.n(h.P.low, h.root - 12 + 3, 0, 0.5, { dur: 0.18 }); h.n(h.P.low, h.root - 12, 0.16, 0.5, { dur: 0.4 }); h.d('woodlo', 0.16, 0.36, 0.8); },
    lower: (h) => { h.tone({ type: 'triangle', f: 330, f2: 196, glide: 0.2, d: 0.24, gain: 0.07 }); h.d('shaker', 0, 0.3); h.d('shaker', 0.1, 0.22); },
    land: (h) => { h.d(h.P.kick || 'kick', 0, 0.5); h.n(h.P.low, h.ch[0] - 12, 0.005, 0.4, { dur: 0.22 }); },
    lift: (h) => { h.tone({ type: 'triangle', f: 196, f2: 392, glide: 0.2, d: 0.24, gain: 0.06 }); h.d('shaker', 0.02, 0.26); },
    sparkle: (h) => { for (let i = 0; i < 4; i++) h.n(h.P.bell, h.pent(5 + i + h.v) + 12, i * 0.07, 0.22); },
    // a fill, and the band moves on together
    chapter: (h) => { const b = h.beat / 4; [1.3, 1.15, 1, 0.86].forEach((r, i) => h.d(h.P.tom || 'tom', i * b, 0.34 + i * 0.04, r)); h.d(h.P.hit || 'snare', 4 * b, 0.4); strum(h, h.P.lead, 0.4, 4 * b); h.n(h.P.low, h.ch[0] - 12, 4 * b, 0.5, { dur: 0.4 }); motif(h, h.depth).forEach((m, i) => h.n(h.P.bell, m + 12, 4 * b + 0.1 + i * 0.11, 0.24)); },
    tick: (h) => { h.d('rim', 0, 0.4); h.n(h.P.bell, h.ch[h.idx % 3] + 12 + (h.idx >= 3 ? 12 : 0), 0.02, 0.3); if (h.idx >= 3) strum(h, h.P.lead, 0.32, 0.12, true); },
    // each block is one more note of a big chord; the last one strums it all
    block: (h) => { h.d(h.P.kick || 'kick', 0, 0.5); h.d('clap', 0, 0.26); const st = [0, 4, 7, 9, 11, 13, 15]; h.n(h.P.lead, h.deg(st[clamp(h.idx, 0, 6)]) - 12, 0.01, 0.46); if (h.count && h.idx >= h.count - 1) { st.slice(0, 6).forEach((x, i) => h.n(h.P.lead, h.deg(x) - 12, 0.2 + i * 0.03, 0.34)); h.n(h.P.bell, h.deg(14), 0.4, 0.24); } },
    power: (h) => { h.d('rim', 0, 0.3); h.tone({ f: 220, f2: 880, glide: 0.16, d: 0.2, gain: 0.04 }); h.n(h.P.soft, h.ch[h.idx % 3] + 12, 0.14, 0.42, { dur: 0.5 }); h.n(h.P.bell, h.ch[(h.idx + 1) % 3] + 24, 0.2, 0.18); },
    rail: (h) => { h.n(h.P.low, h.ch[0] - 12, 0, 0.36, { dur: 0.1 }); h.d('hat', 0.07, 0.3); },
    tip: (h) => { h.n(h.P.bell, h.ch[1] + 12, 0, 0.28); h.n(h.P.bell, h.ch[2] + 12, h.beat / 4, 0.32); },
    confetti: (h) => {
      const b = h.beat / 2, P = h.P; for (let i = 0; i < 6; i++) h.d(h.P.hit || 'snare', i * b / 3, 0.2 + i * 0.05);
      // the tag ending every band knows: one, four, five, and home
      [[0, 2, 4], [3, 5, 7], [4, 6, 8], [0, 2, 4, 7]].forEach((c, i) => { const t = 2 * b + i * b; c.forEach((x, j) => h.n(P.lead, h.deg(x), t + j * 0.012, 0.36)); h.n(P.low, h.deg(c[0]) - 24, t, 0.5, { dur: i === 3 ? 0.9 : 0.2 }); h.d(i === 3 ? (h.P.crash || 'ohat') : (h.P.kick || 'kick'), t, 0.4); });
      for (let i = 0; i < 6; i++) h.n(P.bell, h.pent(5 + i) + 12, 5 * b + 0.06 + i * 0.06, 0.2);
    },
    cheer: (h) => { strum(h, h.P.lead, 0.32, 0.14, true); h.d('clap', 0.14, 0.3); for (let i = 0; i < 3; i++) h.n(h.P.bell, h.ch[i] + 24, 0.3 + i * 0.07, 0.14); },
    crew: (h) => { const b = h.beat / 2; strum(h, h.P.lead, 0.36, 0.5); strum(h, h.P.lead, 0.36, 0.5 + b, true); strum(h, h.P.lead, 0.42, 0.5 + 2 * b); h.d('clap', 0.5 + 2 * b, 0.36); applause(h, 1.6, 0.16); }
  });

  /* ------------------------------------------------------------------ g3: Marionette Theatre */
  const gliss = (h, inst, g, dt, n) => { for (let i = 0; i < (n || 10); i++) h.n(inst, h.deg(i - 3), (dt || 0) + i * 0.032, g * (0.6 + 0.4 * i / (n || 10))); };
  const g3 = Object.assign({}, g1, {
    tap: (h) => h.d(h.v % 2 ? 'tock' : 'tick', 0, 0.46, [1, 1.06, 0.94, 1.12][h.v]),
    select: (h) => { h.n(h.P.soft, h.ch[1], 0, 0.5); h.n(h.P.bell, h.ch[2] + 12, 0.07, 0.36); },
    toggleOn: (h) => { h.d('pawl', 0, 0.4); h.d('pawl', 0.045, 0.5, 1.2); h.n(h.P.soft, h.ch[0], 0.03, 0.44); h.n(h.P.soft, h.ch[2], 0.1, 0.48); },
    toggleOff: (h) => { h.d('pawl', 0, 0.5, 1.2); h.d('pawl', 0.045, 0.4); h.n(h.P.soft, h.ch[2], 0.03, 0.4); h.n(h.P.soft, h.ch[0], 0.1, 0.4); h.d('knock', 0.12, 0.2); },
    // a scene change: the rope runs through its pulley, cloth moves, and three notes step up
    next: (h) => { ratchet(h, 6, 0.22, 0.34, 0.9); h.sw({ d: 0.34, f: 500, f2: 1700, gain: 0.05, q: 0.7 }); up(h, h.P.lead, [h.ch[0] + 12, h.ch[1] + 12, h.ch[2] + 12], 0.07, 0.4, 0.12); },
    back: (h) => { ratchet(h, 5, 0.22, 0.3, -0.9); h.sw({ d: 0.3, f: 1500, f2: 500, gain: 0.045, q: 0.7 }); h.n(h.P.lead, h.ch[2] + 12, 0.1, 0.38); h.n(h.P.lead, h.ch[0] + 12, 0.18, 0.38); },
    // wound up with its key, the curtain parts, and the harp runs up
    open: (h) => { const e = ratchet(h, 11, 0.62, 0.36, 1.1); for (let i = 0; i < 4; i++) squeak(h, i * 0.15, 900 + i * 130, 0.018); h.sw({ d: 0.7, f: 420, f2: 1300, gain: 0.06, q: 0.6, a: 0.5 }, e - 0.1); gliss(h, h.P.gliss || h.P.soft, 0.3, e, 11); h.n(h.P.bell, h.deg(7) + 12, e + 0.36, 0.3); },
    // the spring runs down: the last notes come slower and slower, and the curtain falls
    close: (h) => { const m = motif(h, 4).reverse(); let t = 0; m.forEach((x, i) => { h.n(h.P.box || h.P.lead, x, t, 0.4 - i * 0.05, { detune: -i * 9 }); t += 0.2 + i * 0.13; }); h.sw({ d: 0.6, f: 1300, f2: 380, gain: 0.05, q: 0.6, a: 0.15 }, 0.3); h.d('knock', t + 0.1, 0.3); },
    // each letter plucks the next tooth of the comb, so typing a name plays a tune
    key: (h) => { const walk = [0, 2, 4, 2, 4, 7, 4, 2, 4, 7, 9, 7, 4, 7, 9, 11]; h.n(h.P.box || h.P.lead, h.deg(walk[h.idx % walk.length]) + 12, 0, 0.3); h.d('tick', 0, 0.18, 1.2); },
    warn: (h) => { h.d('knock', 0, 0.46); h.d('knock', 0.15, 0.4, 0.92); h.n(h.P.soft, h.root - 12 + 8, 0, 0.5); h.n(h.P.soft, h.root - 12 + 7, 0.15, 0.5); },
    lower: (h) => { squeak(h, 0, 1500, 0.026); squeak(h, 0.09, 1750, 0.022); ratchet(h, 4, 0.2, 0.22, 0); h.n(h.P.soft, h.strM(50), 0.02, 0.26); },
    land: (h) => { h.d('knock', 0, 0.46, 0.94 + 0.08 * h.v); h.n(h.P.soft, h.ch[0] - 12, 0.005, 0.36); },
    lift: (h) => { squeak(h, 0, 1750, 0.024); squeak(h, 0.08, 2000, 0.02); ratchet(h, 4, 0.18, 0.2, 0.6); },
    hop: (h) => { h.d('tock', 0, 0.36); h.tone({ type: 'triangle', f: 230, f2: 560, glide: 0.12, d: 0.2, gain: 0.1 }); },
    swing: (h) => h.sw({ d: 0.46, f: 380, f2: 950, gain: 0.04, q: 0.7 }),
    sparkle: (h) => { for (let i = 0; i < 6; i++) h.n(h.P.bell, h.deg(11 - i) + 12, i * 0.045, 0.2 - i * 0.012); },
    // a new act: the bell, the cloth, the harp, and the theme's next note
    chapter: (h) => { h.d('ting', 0, 0.4); h.sw({ d: 0.5, f: 500, f2: 1500, gain: 0.05, q: 0.6 }, 0.02); gliss(h, h.P.gliss || h.P.soft, 0.24, 0.08, 8); motif(h, h.depth).forEach((m, i) => { h.n(h.P.lead, m, 0.4 + i * 0.16, 0.46); if (i === h.depth - 1) h.n(h.P.bell, m + 12, 0.4 + i * 0.16, 0.24); }); },
    tick: (h) => { h.d('tick', 0, 0.4); h.d('tock', 0.06, 0.3); h.n(h.P.box || h.P.lead, h.deg([2, 3, 4, 7][clamp(h.idx, 0, 3)]), 0.05, 0.44); if (h.idx >= 3) { h.d('ting', 0.14, 0.3); gliss(h, h.P.gliss || h.P.soft, 0.2, 0.14, 6); } },
    // the stagehand's hammer, one knock a block; the last brings the harp
    block: (h) => { h.d('knock', 0, 0.5); h.d('knock', 0.09, 0.26, 1.15); h.n(h.P.soft, h.deg([0, 2, 4, 5, 7, 8][clamp(h.idx, 0, 5)]) - 12, 0.02, 0.5); if (h.count && h.idx >= h.count - 1) { gliss(h, h.P.gliss || h.P.soft, 0.3, 0.2, 12); h.n(h.P.bell, h.deg(7) + 12, 0.6, 0.3); h.d('ting', 0.6, 0.3); } },
    // a footlight comes on
    power: (h) => { h.d('click', 0, 0.44); h.d('pawl', 0.03, 0.3); h.n(h.P.lead, h.ch[h.idx % 3] + 12, 0.08, 0.42); h.d('ting', 0.1, 0.16 + 0.04 * (h.idx % 3), 0.9 + 0.1 * (h.idx % 3)); },
    rail: (h) => { h.sw({ d: 0.12, f: 900, f2: 1800, gain: 0.03 }); h.d('tick', 0.1, 0.3, 1.2); },
    tip: (h) => { h.d('ting', 0, 0.16); h.n(h.P.lead, h.ch[1] + 12, 0.02, 0.26); h.n(h.P.lead, h.ch[2] + 12, 0.12, 0.3); },
    confetti: (h) => {
      const P = h.P; h.d('knock', 0, 0.4); gliss(h, P.gliss || P.soft, 0.3, 0, 12);
      // the last cadence: five, then home, with the bells and a small audience
      [4, 6, 8].forEach((x, i) => h.n(P.lead, h.deg(x), 0.42 + i * 0.012, 0.4)); h.n(P.soft, h.deg(4) - 12, 0.42, 0.5);
      [0, 2, 4, 7, 9].forEach((x, i) => h.n(P.lead, h.deg(x), 0.84 + i * 0.03, 0.42)); h.n(P.soft, h.deg(0) - 12, 0.84, 0.56); h.d('ting', 0.84, 0.4);
      for (let i = 0; i < 8; i++) h.n(P.bell, h.deg(14 - i) + 12, 0.9 + i * 0.05, 0.2 - i * 0.012);
      applause(h, 2.2, 0.2);
    },
    cheer: (h) => { h.n(h.P.soft, h.ch[0], 0.14, 0.4); h.n(h.P.soft, h.ch[2], 0.2, 0.42); h.n(h.P.bell, h.ch[0] + 24, 0.26, 0.26); h.d('ting', 0.26, 0.14); },
    crew: (h) => { gliss(h, h.P.gliss || h.P.soft, 0.26, 0.5, 9); [0, 2, 4, 7].forEach((x, i) => h.n(h.P.lead, h.deg(x), 0.86 + i * 0.03, 0.4)); applause(h, 1.8, 0.2); },
    snore: (h) => { h.sw({ d: 1.25, f: 700, f2: 1100, q: 1.1, gain: 0.035, a: 0.45 }); h.sw({ d: 1.3, f: 520, f2: 340, q: 1, gain: 0.03, a: 0.2 }, 1.45); h.d('tick', 2.5, 0.1); h.d('tock', 3.1, 0.08); }
  });

  /* ------------------------------------------------------------------ what only one look does */
  const SPECIAL = {
    phosphor: {
      // the tube: a relay, the picture's wobble, the dot it collapses to
      degauss: (h) => { h.tone({ type: 'triangle', f: 90, f2: 240, glide: 0.18, d: 0.5, gain: 0.07, lp: 900 }); h.sw({ d: 0.45, f: 500, f2: 1600, gain: 0.03, q: 2 }); h.d('click', 0, 0.4, 0.7); },
      powerOn: (h) => { h.d('click', 0, 0.5, 0.6); h.sw({ d: 0.5, f: 300, f2: 2600, gain: 0.035, q: 1.4, white: true }); up(h, 'chip25', [0, 2, 4, 7, 9].map((x) => h.deg(x)), 0.045, 0.3, 0.22); },
      powerOff: (h) => { h.tone({ type: 'triangle', f: 1400, f2: 120, glide: 0.2, d: 0.26, gain: 0.07, lp: 2400 }); h.d('click', 0.22, 0.4, 0.6); },
      decode: (h) => { for (let i = 0; i < 5; i++) h.d('nztick', i * 0.03, 0.4, 1); h.n('chip50', h.ch[h.v % 3] + 12, 0.1, 0.16, { dur: 0.03 }); },
      score: (h) => h.n('chip12', h.root + 24, 0, 0.14, { dur: 0.02 }), lock: (h) => { h.n('chip50', h.root + 12, 0, 0.2, { dur: 0.03 }); h.n('chip50', h.root + 19, 0.05, 0.22, { dur: 0.05 }); },
      hop: (h) => h.n('chip50', h.root, 0, 0.3, { dur: 0.12, slide: -7 }),
      lower: (h) => { for (let i = 0; i < 4; i++) h.n('chip50', h.root + 12 - i * 3, i * 0.04, 0.2, { dur: 0.03 }); },
      lift: (h) => { for (let i = 0; i < 4; i++) h.n('chip50', h.root + 3 + i * 3, i * 0.04, 0.2, { dur: 0.03 }); },
      land: (h) => { h.d('nzkick', 0, 0.5); h.n('chiptri', h.root - 24, 0, 0.4, { dur: 0.08 }); }
    },
    teletype: {
      // the printer: the platen's ratchet, the carriage's zip, the margin bell
      feed: (h) => { ratchet(h, 5, 0.16, 0.34, 0); h.sw({ d: 0.2, f: 2400, gain: 0.012, q: 0.7 }); h.d('space', 0.18, 0.3); },
      powerOn: (h) => { h.sw({ d: 0.5, f: 420, f2: 1100, q: 2.2, gain: 0.04, a: 0.5 }); ratchet(h, 6, 0.3, 0.3, 0, 0.3); h.d('space', 0.62, 0.4); h.d('key', 0.7, 0.4); },
      powerOff: (h) => { h.sw({ d: 0.3, f: 1300, f2: 3200, q: 1.6, gain: 0.05 }); ratchet(h, 7, 0.28, 0.22, 0); h.d('key', 0.3, 0.36, 0.8); },
      next: (h) => { h.sw({ d: 0.2, f: 1300, f2: 3200, q: 1.6, gain: 0.05 }); ratchet(h, 5, 0.2, 0.2, 0, 0, 'pawl'); h.d('key', 0.2, 0.4, 0.82); h.n('bell', h.ch[2] + 12, 0.22, 0.2); },
      decode: (h) => { for (let i = 0; i < 4; i++) h.d('key', i * 0.045 + h.rand() * 0.01, 0.22, 1.1 + 0.2 * h.rand()); },
      tap: (h) => h.d('key', 0, 0.44, [1, 1.08, 0.95, 1.14][h.v]),
      land: (h) => { h.d('space', 0, 0.5); h.d('key', 0.004, 0.2, 0.8); },
      lock: (h) => { h.d('key', 0, 0.3); h.d('key', 0.06, 0.3, 1.1); }
    },
    nier: {
      // a unit's menu: soft ticks, a slip of the picture, a lock
      hover: (h) => { h.tone({ f: 2640, d: 0.035, gain: 0.14, a: 0.006 }); },
      tap: (h) => { h.tone({ f: [2640, 2349, 2794, 2489][h.v], d: 0.035, gain: 0.14, a: 0.006 }); h.d('click', 0, 0.2, 1.6); },
      slice: (h) => { h.sw({ d: 0.05, f: 2600, q: 4, gain: 0.05, a: 0.1, white: true }); h.sw({ d: 0.04, f: 900, q: 4, gain: 0.04, a: 0.1, white: true }, 0.06); },
      lock: (h) => { h.tone({ f: 1760, d: 0.03, gain: 0.12 }); h.tone({ f: 2349, d: 0.03, gain: 0.12 }, 0.06); h.tone({ f: 2637, d: 0.12, gain: 0.12 }, 0.12); },
      decode: (h) => { for (let i = 0; i < 4; i++) h.tone({ f: 2000 + h.rand() * 1500, d: 0.015, gain: 0.1, a: 0.003 }, i * 0.035); },
      ghost: (h) => h.tone({ f: 1760, d: 0.05, gain: 0.07, a: 0.01 }),
      hop: () => {}, swing: () => {},
      think: (h) => { [0, 0.045, 0.09].forEach((d, i) => h.tone({ f: 2093 + i * 330, d: 0.03, gain: 0.12, a: 0.006 }, d)); }
    }
  };

  PS.sfx = { g1, g2, g3, SPECIAL, util: { up, ratchet, squeak, applause, scaleRun, motif, strum, gliss } };
})(window);
