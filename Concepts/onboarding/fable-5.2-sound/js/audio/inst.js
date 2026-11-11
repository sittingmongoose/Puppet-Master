/* Pip's sound (Fable 5.2). inst.js: the instruments.
   Struck and plucked things are computed once per pitch into a buffer and then played like a recording: bars and
   tines as sums of decaying partials at the ratios real ones ring at (a marimba bar, a music-box tooth, a glass),
   strings as a tuned Karplus-Strong loop with a body, pianos as stretched harmonics under a hammer. Drums and the
   clockwork are short buffers made the same way. Nothing here is held: every note is struck and dies away. */
(function (G) {
  'use strict';
  const PS = G.PS5, clamp = PS.clamp, mf = PS.mf, TAU = Math.PI * 2;

  /* ------------------------------------------------------------------ small DSP on arrays */
  function biquad(y, sr, type, f, Q, gainDb) {
    const w = TAU * clamp(f, 10, sr * 0.45) / sr, cs = Math.cos(w), sn = Math.sin(w), al = sn / (2 * (Q || 0.707));
    let b0, b1, b2, a0, a1, a2;
    if (type === 'lp') { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; a0 = 1 + al; a1 = -2 * cs; a2 = 1 - al; }
    else if (type === 'hp') { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; a0 = 1 + al; a1 = -2 * cs; a2 = 1 - al; }
    else if (type === 'bp') { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * cs; a2 = 1 - al; }
    else { const A = Math.pow(10, (gainDb || 0) / 40); b0 = 1 + al * A; b1 = -2 * cs; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * cs; a2 = 1 - al / A; }
    b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < y.length; i++) { const x = y[i], o = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = o; y[i] = o; }
    return y;
  }
  function finish(y, sr, peak, fadeMs, attMs) {
    let pk = 1e-9; for (let i = 0; i < y.length; i++) { const a = Math.abs(y[i]); if (a > pk) pk = a; }
    const k = (peak == null ? 0.85 : peak) / pk, fade = Math.min(y.length, Math.round(sr * (fadeMs || 30) / 1000)), att = Math.round(sr * (attMs || 0) / 1000);
    for (let i = 0; i < y.length; i++) y[i] *= k;
    for (let i = 0; i < att && i < y.length; i++) y[i] *= 0.5 - 0.5 * Math.cos(Math.PI * i / att);
    for (let i = 0; i < fade; i++) y[y.length - 1 - i] *= i / fade;
    return y;
  }
  // a burst of noise, band-limited, dying away: the mallet, the pick, the hammer's felt
  function addNoise(y, sr, q, o) {
    const n = Math.min(y.length, Math.round(sr * (o.d || 0.02) * 6)), tau = (o.d || 0.02) * sr / 3, t = new Float32Array(n);
    for (let i = 0; i < n; i++) t[i] = (q() * 2 - 1) * Math.exp(-i / tau);
    if (o.lp) biquad(t, sr, 'lp', o.lp, 0.7); if (o.hp) biquad(t, sr, 'hp', o.hp, 0.7); if (o.bp) biquad(t, sr, 'bp', o.bp, o.q || 1.2);
    const at = Math.max(1, Math.round(sr * (o.a || 0.0004)));
    for (let i = 0; i < n; i++) y[i] += t[i] * o.g * Math.min(1, i / at);
  }
  // a decaying sine by recurrence (no sin() per sample): amp, Hz, T60 seconds
  function ring(y, sr, f, amp, t60, phase, from) {
    if (f >= sr * 0.46 || t60 <= 0 || amp === 0) return;
    const w = TAU * f / sr, r = Math.exp(-6.91 / (t60 * sr)), c = 2 * r * Math.cos(w), r2 = r * r, ph = phase || 0, i0 = from || 0;
    let s2 = amp * Math.sin(ph - 2 * w) / r2, s1 = amp * Math.sin(ph - w) / r;
    for (let i = i0; i < y.length; i++) { const s = c * s1 - r2 * s2; y[i] += s; s2 = s1; s1 = s; }
  }

  /* ------------------------------------------------------------------ bars, tines, glasses, bells */
  function modal(sr, f, d, q) {
    const reg = Math.pow((d.fref || 523) / f, d.slope == null ? 0.55 : d.slope), T = clamp(d.t60 * reg, d.tmin || 0.12, d.tmax || 4.5);
    const y = new Float32Array(Math.ceil(sr * Math.min(d.max || 4, T * 1.08 + 0.08)));
    const top = d.fmax || 9000;
    d.partials.forEach(([r, a, k, det]) => {
      const fr = f * r; if (fr > top) return;
      ring(y, sr, fr * (1 + (det || 0)), a, T * k, 0);
    });
    if (d.noise) addNoise(y, sr, q, Object.assign({}, d.noise, { lp: d.noise.lp ? Math.min(d.noise.lp, 14000) : 0, bp: d.noise.bpf ? clamp(f * d.noise.bpf, 300, 9000) : d.noise.bp }));
    if (d.thump) ring(y, sr, d.thump[0], d.thump[1], d.thump[2], 0);
    if (d.body) d.body.forEach(([bf, bq, bg]) => biquad(y, sr, 'pk', bf, bq, bg));
    if (d.lp) biquad(y, sr, 'lp', d.lp, 0.6);
    return finish(y, sr, d.peak, 30, d.att);
  }

  /* ------------------------------------------------------------------ plucked strings (Karplus-Strong, tuned) */
  function pluckedRaw(sr, f, d, q) {
    const reg = Math.pow((d.fref || 261) / f, d.slope == null ? 0.5 : d.slope), T = clamp(d.t60 * reg, d.tmin || 0.15, d.tmax || 4);
    const len = Math.ceil(sr * Math.min(d.max || 4, T * 1.05 + 0.1)), y = new Float32Array(len);
    const S = clamp(d.damp == null ? 0.35 : d.damp, 0.02, 0.5), period = sr / f;
    let N = Math.floor(period - S - 0.15), eta = period - S - N;
    if (N < 2) { N = 2; eta = 0.5; }
    const C = (1 - eta) / (1 + eta), line = new Float32Array(N);
    // what the finger leaves in the string: a shaped burst, darker for flesh, brighter for a nail or a quill
    const hard = clamp(d.hard == null ? 0.5 : d.hard, 0.02, 1), pos = Math.max(1, Math.round(N * (d.pos || 0.22)));
    let lp = 0, mean = 0;
    for (let i = 0; i < N; i++) { lp += ((q() * 2 - 1) - lp) * (0.08 + hard * 0.9); line[i] = lp; }
    if (d.comb !== false) for (let i = N - 1; i >= pos; i--) line[i] -= line[i - pos] * 0.9;
    for (let i = 0; i < N; i++) mean += line[i] / N;
    for (let i = 0; i < N; i++) line[i] -= mean;
    // the loop loses a little every trip; highs lose more (S)
    const rho = Math.pow(10, -3 / (T * f));
    let idx = 0, prev = 0, apIn = 0, apOut = 0;
    for (let n = 0; n < len; n++) {
      const cur = line[idx]; y[n] = cur;
      const l = (1 - S) * cur + S * prev; prev = cur;
      const a = C * l + apIn - C * apOut; apIn = l; apOut = a;
      line[idx] = rho * a; idx++; if (idx >= N) idx = 0;
    }
    return y;
  }
  function plucked(sr, f, d, q) {
    const y = pluckedRaw(sr, f, d, q);
    if (d.oct) { const o = pluckedRaw(sr, f * 2, Object.assign({}, d, { t60: d.t60 * 0.7 }), q); for (let i = 0; i < o.length && i < y.length; i++) y[i] += o[i] * d.oct; }
    if (d.second) { const o = pluckedRaw(sr, f * Math.pow(2, d.second / 1200), d, q); for (let i = 0; i < o.length && i < y.length; i++) y[i] += o[i] * 0.7; }
    if (d.noise) addNoise(y, sr, q, d.noise);
    if (d.thump) ring(y, sr, d.thump[0], d.thump[1], d.thump[2], 0);
    if (d.body) d.body.forEach(([bf, bq, bg]) => biquad(y, sr, 'pk', bf, bq, bg));
    if (d.hp) biquad(y, sr, 'hp', d.hp, 0.7);
    if (d.lp) biquad(y, sr, 'lp', Math.min(sr * 0.45, d.lpk ? Math.max(d.lp, f * d.lpk) : d.lp), 0.6);
    return finish(y, sr, d.peak, 30, d.att || 0.4);
  }

  /* ------------------------------------------------------------------ pianos: stretched harmonics under a hammer */
  function piano(sr, f, d, q) {
    const reg = Math.pow(261.6 / f, 0.62), T = clamp((d.t60 || 3) * reg, 0.35, 5), len = Math.ceil(sr * Math.min(d.max || 3.6, T * 0.9 + 0.2)), y = new Float32Array(len);
    const B = (d.B || 0.00032) * Math.pow(f / 261.6, 1.5), p = d.p || 1.9, n = Math.min(d.n || 18, Math.floor((d.fmax || 8500) / f));
    for (let k = 1; k <= Math.max(1, n); k++) {
      const fk = k * f * Math.sqrt(1 + B * k * k), comb = Math.pow(Math.abs(Math.sin(k * Math.PI * (d.hpos || 0.125))), 0.6) + 0.12;
      const a = comb / Math.pow(k, p), tk = T / (1 + (d.q || 0.42) * (k - 1));
      // the quick first drop and the long after-ring of a real string
      ring(y, sr, fk, a * 0.62, tk * 0.32, 0); ring(y, sr, fk * (1 + (d.det || 0.0006)), a * 0.38, tk, 0.4);
    }
    if (d.noise) addNoise(y, sr, q, d.noise);
    if (d.thump) ring(y, sr, d.thump[0], d.thump[1], d.thump[2], 0);
    if (d.body) d.body.forEach(([bf, bq, bg]) => biquad(y, sr, 'pk', bf, bq, bg));
    if (d.lp) biquad(y, sr, 'lp', d.lp, 0.6);
    return finish(y, sr, d.peak, 40, d.att || 0.6);
  }

  /* ------------------------------------------------------------------ an electric piano: a tine and its bark (FM) */
  function epiano(sr, f, d) {
    const reg = Math.pow(261.6 / f, 0.5), T = clamp((d.t60 || 2.4) * reg, 0.5, 4), len = Math.ceil(sr * Math.min(3.4, T + 0.15)), y = new Float32Array(len);
    const w = TAU * f / sr, I0 = (d.index || 1.5) * clamp(Math.pow(261.6 / f, 0.35), 0.5, 1.6), ti = (d.bark || 0.12) * sr, ta = T * sr / 6.91;
    const tineF = Math.min(f * (d.tine || 14), sr * 0.4), wt = TAU * tineF / sr, tt = 0.035 * sr, tg = d.tineG == null ? 0.05 : d.tineG;
    for (let i = 0; i < len; i++) {
      const I = I0 * (0.16 + 0.84 * Math.exp(-i / ti));
      y[i] = Math.sin(w * i + I * Math.sin(w * i)) * Math.exp(-i / ta) + tg * Math.sin(wt * i) * Math.exp(-i / tt);
    }
    if (d.lp) biquad(y, sr, 'lp', d.lp, 0.6);
    return finish(y, sr, d.peak, 40, 1.2);
  }

  /* ------------------------------------------------------------------ a water drop: a sine that rises as it rings */
  function drop(sr, f, d) {
    const len = Math.ceil(sr * 0.26), y = new Float32Array(len); let ph = 0;
    for (let i = 0; i < len; i++) { const t = i / sr, fr = f * (1 + 0.55 * (1 - Math.exp(-t / 0.035))); ph += TAU * fr / sr; y[i] = Math.sin(ph) * Math.exp(-t / 0.05) * Math.min(1, t / 0.004); }
    return finish(y, sr, 0.8, 20, 0);
  }

  /* ------------------------------------------------------------------ the instrument table
     partials: [ratio, level, share of the note's ring time] */
  const DEF = {
    // soft yarn mallets on rosewood over tubes
    marimba: { kind: modal, t60: 1.15, fref: 262, slope: 0.6, tmin: 0.25, tmax: 2.2, partials: [[1, 1, 1], [3.98, 0.2, 0.2], [9.9, 0.045, 0.07]], noise: { g: 0.5, d: 0.006, lp: 1800 }, thump: [150, 0.1, 0.03], peak: 0.85 },
    xylo: { kind: modal, t60: 0.42, fref: 523, slope: 0.4, tmin: 0.12, partials: [[1, 1, 1], [3, 0.3, 0.4], [6.1, 0.12, 0.2]], noise: { g: 0.7, d: 0.003, bp: 3200, q: 1 }, peak: 0.8 },
    vibes: { kind: modal, t60: 3.0, fref: 349, slope: 0.4, tmax: 4, partials: [[1, 1, 1], [4, 0.14, 0.36], [10, 0.03, 0.12]], noise: { g: 0.22, d: 0.005, lp: 1500 }, att: 1, peak: 0.8 },
    glock: { kind: modal, t60: 2.0, fref: 1047, slope: 0.5, tmin: 0.5, tmax: 3, fmax: 11000, partials: [[1, 1, 1], [2.756, 0.3, 0.5], [5.404, 0.16, 0.28], [8.933, 0.06, 0.14]], noise: { g: 0.25, d: 0.0025, bp: 5200, q: 1.4 }, peak: 0.75 },
    celesta: { kind: modal, t60: 1.5, fref: 523, slope: 0.5, tmin: 0.35, partials: [[1, 1, 1], [2, 0.11, 0.6], [4.02, 0.2, 0.34], [6.3, 0.05, 0.18]], noise: { g: 0.28, d: 0.004, lp: 2600 }, body: [[420, 1.4, 2.5]], peak: 0.8 },
    // a steel comb plucked by a pinned cylinder, in a small wooden box
    musicbox: { kind: modal, t60: 1.9, fref: 784, slope: 0.62, tmin: 0.45, tmax: 3.2, fmax: 10500, partials: [[1, 1, 1], [2.0, 0.07, 0.55], [6.27, 0.12, 0.17], [3.01, 0.05, 0.3]], noise: { g: 0.3, d: 0.0018, bp: 4600, q: 1.6 }, body: [[640, 1.2, 3], [1500, 1.5, 1.5]], peak: 0.8 },
    // a thumb piano: a tine over a gourd
    kalimba: { kind: modal, t60: 1.3, fref: 392, slope: 0.5, tmin: 0.35, partials: [[1, 1, 1], [2, 0.09, 0.5], [5.42, 0.16, 0.13], [11.2, 0.03, 0.05]], noise: { g: 0.42, d: 0.004, bpf: 3.2, q: 0.9 }, thump: [190, 0.12, 0.035], body: [[340, 1.1, 3]], peak: 0.82 },
    toypiano: { kind: modal, t60: 0.85, fref: 523, slope: 0.45, tmin: 0.25, partials: [[1, 1, 1], [2.02, 0.26, 0.6], [3.05, 0.14, 0.4], [5.4, 0.2, 0.24], [8.3, 0.07, 0.12]], noise: { g: 0.5, d: 0.004, bp: 1500, q: 0.8 }, peak: 0.8 },
    // a wine glass flicked with a fingernail
    glass: { kind: modal, t60: 2.4, fref: 880, slope: 0.5, tmin: 0.6, tmax: 3.4, fmax: 9500, partials: [[1, 1, 1], [2.32, 0.24, 0.5], [4.25, 0.09, 0.28], [6.63, 0.03, 0.14]], noise: { g: 0.1, d: 0.002, bp: 3800, q: 1.2 }, att: 1.5, peak: 0.78 },
    crystal: { kind: modal, t60: 1.5, fref: 1047, slope: 0.5, tmin: 0.4, fmax: 10000, partials: [[1, 1, 1], [2.32, 0.3, 0.42], [3.9, 0.12, 0.25]], noise: { g: 0.2, d: 0.0015, bp: 5200, q: 1.5 }, att: 0.6, peak: 0.75 },
    bell: { kind: modal, t60: 2.6, fref: 880, slope: 0.4, tmax: 3.6, fmax: 9000, partials: [[0.5, 0.2, 1], [1, 1, 0.9], [1.19, 0.22, 0.5], [1.5, 0.16, 0.6], [2, 0.3, 0.45], [2.51, 0.1, 0.3], [3.01, 0.07, 0.2]], noise: { g: 0.25, d: 0.003, bp: 3600, q: 1 }, peak: 0.78 },
    softbell: { kind: modal, t60: 2.2, fref: 660, slope: 0.45, tmax: 3.2, partials: [[1, 1, 1], [2, 0.16, 0.55], [3, 0.04, 0.3], [4.2, 0.03, 0.2]], att: 2.5, peak: 0.8 },
    // Basic's clean tone: nearly a sine, with a soft start so it never clicks
    sine: { kind: modal, t60: 1.7, fref: 523, slope: 0.35, tmin: 0.5, partials: [[1, 1, 1], [2, 0.05, 0.5]], att: 5, peak: 0.8 },
    softbass: { kind: modal, t60: 0.9, fref: 87, slope: 0.3, tmin: 0.4, tmax: 1.4, partials: [[1, 1, 1], [2, 0.22, 0.6], [3, 0.06, 0.35]], noise: { g: 0.12, d: 0.006, lp: 700 }, att: 3, peak: 0.85 },
    woodbass: { kind: modal, t60: 0.7, fref: 110, slope: 0.4, tmin: 0.3, tmax: 1.2, partials: [[1, 1, 1], [3.98, 0.1, 0.2], [2, 0.12, 0.5]], noise: { g: 0.14, d: 0.006, lp: 900 }, peak: 0.85 },
    // strings
    harp: { kind: plucked, t60: 2.6, fref: 262, slope: 0.55, tmax: 3.6, damp: 0.3, hard: 0.22, pos: 0.36, body: [[240, 1, 2]], lp: 5200, peak: 0.8 },
    nylon: { kind: plucked, t60: 1.7, fref: 196, slope: 0.5, damp: 0.34, hard: 0.42, pos: 0.2, body: [[110, 1.4, 3], [220, 1.6, 3], [420, 2, 1.5]], lp: 6000, peak: 0.8 },
    uke: { kind: plucked, t60: 0.95, fref: 392, slope: 0.45, tmin: 0.3, damp: 0.38, hard: 0.5, pos: 0.24, body: [[330, 1.6, 4], [620, 2, 2.5], [1100, 2, 1]], hp: 180, lp: 6500, peak: 0.8 },
    pizz: { kind: plucked, t60: 0.5, fref: 294, slope: 0.4, tmin: 0.2, tmax: 0.9, damp: 0.46, hard: 0.36, pos: 0.16, body: [[280, 2.2, 5], [460, 2.4, 4], [2700, 2, 2]], noise: { g: 0.12, d: 0.004, bp: 2200, q: 0.8 }, lp: 4800, peak: 0.82 },
    upright: { kind: plucked, t60: 1.3, fref: 73, slope: 0.3, tmin: 0.5, tmax: 1.7, damp: 0.42, hard: 0.3, pos: 0.2, thump: [70, 0.2, 0.05], body: [[105, 1.5, 3], [210, 1.6, 2]], lp: 2400, lpk: 9, peak: 0.85 },
    harpsi: { kind: plucked, t60: 1.5, fref: 262, slope: 0.5, damp: 0.1, hard: 1, pos: 0.09, oct: 0.3, noise: { g: 0.12, d: 0.003, bp: 3000, q: 0.8 }, hp: 140, lp: 7500, peak: 0.78 },
    // pianos
    piano: { kind: piano, t60: 3.2, p: 1.75, n: 20, noise: { g: 0.05, d: 0.008, lp: 1400 }, thump: [110, 0.02, 0.04], lp: 7000, peak: 0.82 },
    felt: { kind: piano, t60: 2.6, p: 2.5, n: 9, hpos: 0.17, noise: { g: 0.14, d: 0.012, lp: 620 }, thump: [95, 0.04, 0.05], lp: 2600, peak: 0.82 },
    tack: { kind: piano, t60: 1.9, p: 1.35, n: 22, det: 0.0021, B: 0.0005, noise: { g: 0.16, d: 0.004, bp: 2600, q: 0.8 }, lp: 8000, peak: 0.8 },
    epiano: { kind: epiano, t60: 2.4, index: 1.5, bark: 0.11, lp: 4800, peak: 0.82 },
    softkeys: { kind: epiano, t60: 2.0, index: 0.7, bark: 0.2, tineG: 0.02, lp: 3000, peak: 0.82 },
    drop: { kind: drop }
  };
  // notes that are stopped when their time is up (the rest ring on like a struck bar)
  const DAMPED = { piano: 0.18, felt: 0.22, tack: 0.12, epiano: 0.16, softkeys: 0.2, harpsi: 0.07, upright: 0.14, softbass: 0.1, woodbass: 0.1, nylon: 0.2, uke: 0.14 };

  function noteBuffer(E, name, midi) {
    const key = name + ':' + midi; let b = E.cache.get(key);
    if (b) return b;
    const d = DEF[name]; if (!d) return null;
    const q = PS.rng(PS.hash(key)), y = d.kind(E.sr, mf(midi), d, q);
    b = E.ctx.createBuffer(1, y.length, E.sr); b.getChannelData(0).set(y);
    E.cache.set(key, b);
    return b;
  }
  /* play one note of a tuned instrument. o { gain, dur (seconds held), detune (cents) } */
  function note(E, out, name, midi, t, o) {
    o = o || {};
    if (SYNTH[name]) return SYNTH[name](E, out, midi, t, o);
    const b = noteBuffer(E, name, Math.round(midi)); if (!b) return null;
    const frac = midi - Math.round(midi) + (o.detune || 0) / 100, rel = DAMPED[name];
    return E.sample(b, out, t, { gain: o.gain, rate: frac ? Math.pow(2, frac / 12) : 1, dur: rel != null && o.dur != null ? Math.max(0.05, o.dur) : (o.cut != null ? o.cut : null), rel: rel || o.rel || 0.1 });
  }
  /* render what a song will need a little at a time, so the first bar never stutters */
  function prewarm(E, list, done) {
    const todo = list.filter(([n, m]) => DEF[n] && !E.cache.has(n + ':' + m));
    if (E.offline) { todo.forEach(([n, m]) => noteBuffer(E, n, m)); if (done) done(); return; }
    let i = 0;
    const step = () => {
      const t0 = performance.now();
      while (i < todo.length && performance.now() - t0 < 7) { noteBuffer(E, todo[i][0], todo[i][1]); i++; }
      if (i < todo.length) setTimeout(step, 4); else if (done) done();
    };
    step();
  }

  /* ------------------------------------------------------------------ live voices: the chip, a whistle of air */
  const WAVES = new WeakMap();
  function pulseWave(c, duty) {
    let m = WAVES.get(c); if (!m) { m = {}; WAVES.set(c, m); }
    if (m[duty]) return m[duty];
    const n = 36, re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 1; i < n; i++) im[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty) * (i > 22 ? 0.45 : 1);
    return (m[duty] = c.createPeriodicWave(re, im));
  }
  function chipVoice(duty, lp, defDur) {
    return function (E, out, midi, t, o) {
      const c = E.ctx, s = c.createOscillator(), g = c.createGain(), d = Math.max(0.03, o.dur == null ? defDur : o.dur), lvl = (o.gain == null ? 1 : o.gain) * 0.62;
      if (duty === 'tri') s.type = 'triangle'; else s.setPeriodicWave(pulseWave(c, duty));
      s.frequency.setValueAtTime(mf(midi + (o.detune || 0) / 100), t);
      if (o.slide) { s.frequency.setValueAtTime(mf(midi + o.slide), t); s.frequency.exponentialRampToValueAtTime(mf(midi), t + 0.05); }
      // a held chip note fades a little, the way a tracker's volume column does
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 0.004);
      g.gain.setTargetAtTime(lvl * (duty === 'tri' ? 0.85 : 0.55), t + 0.01, Math.max(0.03, d * 0.4));
      g.gain.setTargetAtTime(0, t + d, 0.012);
      if (o.vib && d > 0.22) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(o.vib === true ? 9 : o.vib, t + Math.min(0.25, d * 0.6)); l.connect(lg); lg.connect(s.detune); l.start(t); l.stop(t + d + 0.1); }
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = 0.5;
      s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + d + 0.1);
      return g;
    };
  }
  const SYNTH = {
    chip50: chipVoice(0.5, 4200, 0.18), chip25: chipVoice(0.25, 5200, 0.16), chip12: chipVoice(0.125, 5600, 0.14), chiptri: chipVoice('tri', 2600, 0.24)
  };

  /* ------------------------------------------------------------------ drums and clockwork (one buffer each) */
  const DRUM = {
    // a felt beater on a small drum: round, never a boom
    kick(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.3)); let ph = 0; for (let i = 0; i < y.length; i++) { const t = i / sr, f = 70 + 70 * Math.exp(-t / 0.026); ph += TAU * f / sr; y[i] = Math.sin(ph) * Math.exp(-t / 0.065); } addNoise(y, sr, q, { g: 0.25, d: 0.004, lp: 1600 }); return finish(y, sr, 0.85, 20, 0.5); },
    tom(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.3)); let ph = 0; for (let i = 0; i < y.length; i++) { const t = i / sr, f = 120 + 60 * Math.exp(-t / 0.03); ph += TAU * f / sr; y[i] = Math.sin(ph) * Math.exp(-t / 0.07); } addNoise(y, sr, q, { g: 0.2, d: 0.006, lp: 2000 }); return finish(y, sr, 0.8, 20, 0.5); },
    snare(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.22)); ring(y, sr, 196, 0.5, 0.09, 0); ring(y, sr, 331, 0.25, 0.06, 0); addNoise(y, sr, q, { g: 0.9, d: 0.035, bp: 2400, q: 0.6 }); return finish(y, sr, 0.8, 20, 0.3); },
    brush(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.2)), n = y.length; for (let i = 0; i < n; i++) { const t = i / n; y[i] = (q() * 2 - 1) * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.25)), 1.5) * (1 - t); } biquad(y, sr, 'bp', 3200, 0.5); biquad(y, sr, 'hp', 900, 0.7); return finish(y, sr, 0.6, 20, 0); },
    rim(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.09)); ring(y, sr, 1720, 0.6, 0.03, 0); ring(y, sr, 430, 0.4, 0.035, 0); addNoise(y, sr, q, { g: 0.6, d: 0.002, bp: 2600, q: 1 }); return finish(y, sr, 0.75, 10, 0.2); },
    hat(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.07)); addNoise(y, sr, q, { g: 1, d: 0.012, hp: 6500 }); biquad(y, sr, 'pk', 9000, 1.2, 4); biquad(y, sr, 'lp', 13000, 0.6); return finish(y, sr, 0.5, 10, 0.2); },
    ohat(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.3)); addNoise(y, sr, q, { g: 1, d: 0.07, hp: 6000 }); biquad(y, sr, 'pk', 8500, 1.2, 4); biquad(y, sr, 'lp', 12500, 0.6); return finish(y, sr, 0.45, 30, 0.3); },
    shaker(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.09)), n = y.length; for (let i = 0; i < n; i++) { const t = i / n; y[i] = (q() * 2 - 1) * Math.pow(Math.sin(Math.PI * Math.min(1, t * 2.2) * 0.5), 2) * Math.exp(-t * 5); } biquad(y, sr, 'bp', 5600, 0.9); biquad(y, sr, 'hp', 2500, 0.7); return finish(y, sr, 0.5, 10, 0); },
    clap(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.2)); [0, 0.011, 0.021].forEach((d, k) => { const o = Math.round(d * sr), tau = (k === 2 ? 0.035 : 0.006) * sr; for (let i = 0; i + o < y.length && i < tau * 7; i++) y[i + o] += (q() * 2 - 1) * Math.exp(-i / tau) * (k === 2 ? 1 : 0.8); }); biquad(y, sr, 'bp', 1400, 0.7); biquad(y, sr, 'hp', 500, 0.7); return finish(y, sr, 0.75, 20, 0); },
    snap(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.08)); addNoise(y, sr, q, { g: 1, d: 0.004, bp: 2300, q: 1.6 }); ring(y, sr, 2100, 0.25, 0.02, 0); return finish(y, sr, 0.7, 10, 0); },
    wood(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.12)); ring(y, sr, 1180, 1, 0.07, 0); ring(y, sr, 1180 * 2.7, 0.3, 0.03, 0); addNoise(y, sr, q, { g: 0.4, d: 0.002, bp: 2400, q: 1 }); return finish(y, sr, 0.75, 10, 0.2); },
    woodlo(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.14)); ring(y, sr, 760, 1, 0.08, 0); ring(y, sr, 760 * 2.7, 0.28, 0.035, 0); addNoise(y, sr, q, { g: 0.35, d: 0.002, bp: 1800, q: 1 }); return finish(y, sr, 0.75, 10, 0.2); },
    // a clock's escapement: tick the higher, tock the lower
    tick(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.05)); ring(y, sr, 2850, 0.7, 0.018, 0); ring(y, sr, 4600, 0.4, 0.012, 0); addNoise(y, sr, q, { g: 0.5, d: 0.0015, bp: 3800, q: 1.2 }); return finish(y, sr, 0.6, 8, 0.1); },
    tock(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.06)); ring(y, sr, 1900, 0.7, 0.022, 0); ring(y, sr, 3050, 0.35, 0.014, 0); addNoise(y, sr, q, { g: 0.5, d: 0.0018, bp: 2600, q: 1.2 }); return finish(y, sr, 0.6, 8, 0.1); },
    click(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.03)); addNoise(y, sr, q, { g: 1, d: 0.0012, bp: 3000, q: 1.2 }); ring(y, sr, 1800, 0.3, 0.008, 0); return finish(y, sr, 0.6, 6, 0); },
    tamb(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.22)); [5200, 6700, 7900, 9300].forEach((f, k) => ring(y, sr, f, 0.2, 0.09 - k * 0.012, k)); addNoise(y, sr, q, { g: 0.8, d: 0.03, hp: 5000 }); return finish(y, sr, 0.5, 20, 0.3); },
    ting(sr, q) { const y = new Float32Array(Math.ceil(sr * 1.3)); [[4186, 1, 1.1], [4186 * 2.76, 0.25, 0.5], [4186 * 1.52, 0.2, 0.7]].forEach(([f, a, t]) => ring(y, sr, f, a, t, 0)); return finish(y, sr, 0.5, 40, 0.3); },
    // a typewriter: the type bar's snap, the body's knock, the platen's thud
    key(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.09)); addNoise(y, sr, q, { g: 0.7, d: 0.0016, bp: 3400, q: 1.1 }); const k = new Float32Array(y.length); addNoise(k, sr, q, { g: 1, d: 0.008, bp: 1250, q: 4 }); for (let i = 0; i < y.length; i++) y[i] += k[i] * 0.9; ring(y, sr, 235, 0.14, 0.03, 0); return finish(y, sr, 0.7, 10, 0); },
    space(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.11)); addNoise(y, sr, q, { g: 0.8, d: 0.01, bp: 700, q: 1.5 }); ring(y, sr, 170, 0.35, 0.04, 0); addNoise(y, sr, q, { g: 0.2, d: 0.002, bp: 2400, q: 1 }); return finish(y, sr, 0.7, 10, 0); },
    pawl(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.035)); addNoise(y, sr, q, { g: 1, d: 0.0014, bp: 3300, q: 2 }); ring(y, sr, 900, 0.3, 0.01, 0); return finish(y, sr, 0.5, 6, 0); },
    knock(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.16)); ring(y, sr, 210, 1, 0.07, 0); ring(y, sr, 520, 0.4, 0.04, 0); addNoise(y, sr, q, { g: 0.5, d: 0.004, lp: 1500 }); return finish(y, sr, 0.8, 15, 0.3); },
    felt(sr, q) { const y = new Float32Array(Math.ceil(sr * 0.2)); let ph = 0; for (let i = 0; i < y.length; i++) { const t = i / sr, f = 96 + 70 * Math.exp(-t / 0.03); ph += TAU * f / sr; y[i] = Math.sin(ph) * Math.exp(-t / 0.05); } addNoise(y, sr, q, { g: 0.45, d: 0.012, lp: 620 }); return finish(y, sr, 0.7, 20, 1); }
  };
  function drumBuffer(E, name) {
    const key = 'drum:' + name; let b = E.cache.get(key); if (b) return b;
    const fn = DRUM[name]; if (!fn) return null;
    const y = fn(E.sr, PS.rng(PS.hash(key)));
    b = E.ctx.createBuffer(1, y.length, E.sr); b.getChannelData(0).set(y); E.cache.set(key, b);
    return b;
  }
  function drum(E, out, name, t, o) {
    o = o || {};
    if (name.slice(0, 2) === 'nz') return chipNoise(E, out, name, t, o);
    const b = drumBuffer(E, name); if (!b) return null;
    return E.sample(b, out, t, { gain: o.gain, rate: o.rate || 1 });
  }
  /* the chip's noise channel: stepped noise at three rates for a hat, a snare, a kick */
  function chipNoise(E, out, name, t, o) {
    const c = E.ctx, key = 'nzbuf'; let b = E.cache.get(key);
    if (!b) { const n = E.sr, q = PS.rng(4242); b = c.createBuffer(1, n, E.sr); const d = b.getChannelData(0); let v = 0; for (let i = 0; i < n; i++) { if (i % 6 === 0) v = q() > 0.5 ? 0.6 : -0.6; d[i] = v; } E.cache.set(key, b); }
    const P = { nzhat: [1, 0.035, 7000, 0.45], nzsnare: [0.5, 0.11, 3200, 0.75], nzkick: [0.09, 0.1, 900, 1.2], nztick: [1.6, 0.018, 9000, 0.34] }[name] || [1, 0.04, 6000, 0.4];
    const s = c.createBufferSource(); s.buffer = b; s.loop = true; s.playbackRate.setValueAtTime(P[0], t);
    if (name === 'nzkick') s.playbackRate.exponentialRampToValueAtTime(0.03, t + 0.09);
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = P[2];
    const g = c.createGain(), lvl = (o.gain == null ? 1 : o.gain) * P[3];
    g.gain.setValueAtTime(lvl, t); g.gain.exponentialRampToValueAtTime(0.0008, t + P[1]);
    s.connect(f); f.connect(g); g.connect(out); s.start(t, (E.rand() * 0.8)); s.stop(t + P[1] + 0.03);
    return g;
  }

  /* ------------------------------------------------------------------ air and cloth: moving bands of soft noise */
  function noiseBuf(E, pink) {
    const key = pink ? 'pink' : 'white'; let b = E.cache.get(key); if (b) return b;
    const n = E.sr * 2, q = PS.rng(pink ? 23 : 11); b = E.ctx.createBuffer(1, n, E.sr); const d = b.getChannelData(0);
    if (!pink) for (let i = 0; i < n; i++) d[i] = q() * 2 - 1;
    else { let b0 = 0, b1 = 0, b2 = 0, pk = 1e-6; for (let i = 0; i < n; i++) { const w = q() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = b0 + b1 + b2 + w * 0.1848; pk = Math.max(pk, Math.abs(d[i])); } for (let i = 0; i < n; i++) d[i] /= pk; }
    E.cache.set(key, b); return b;
  }
  /* o { d, f, f2, q, gain, a (attack share 0..1), type } */
  function swish(E, out, t, o) {
    const c = E.ctx, s = c.createBufferSource(); s.buffer = noiseBuf(E, o.white ? false : true); s.loop = true;
    const b = c.createBiquadFilter(); b.type = o.type || 'bandpass'; b.Q.value = o.q == null ? 0.9 : o.q; b.frequency.setValueAtTime(o.f || 1200, t);
    if (o.f2) b.frequency.exponentialRampToValueAtTime(o.f2, t + o.d);
    const g = c.createGain(), a = Math.max(0.004, o.d * (o.a == null ? 0.4 : o.a)), lvl = o.gain == null ? 0.1 : o.gain;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(lvl, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
    s.connect(b); b.connect(g); g.connect(out); s.start(t, E.rand() * 1.5); s.stop(t + o.d + 0.05);
    return g;
  }
  /* a short clean tone: o { f, f2, d, gain, a, type } (blips, chirps, a slide) */
  function tone(E, out, t, o) {
    const c = E.ctx, s = c.createOscillator(), g = c.createGain(), lvl = o.gain == null ? 0.2 : o.gain, a = Math.max(0.0015, o.a == null ? 0.004 : o.a);
    s.type = o.type || 'sine'; s.frequency.setValueAtTime(o.f, t);
    if (o.f2) s.frequency.exponentialRampToValueAtTime(o.f2, t + (o.glide || o.d));
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(lvl, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
    let n = s;
    if (o.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; s.connect(f); n = f; }
    n.connect(g); g.connect(out); s.start(t); s.stop(t + o.d + 0.05);
    return g;
  }

  PS.inst = { DEF, DRUM, DAMPED, SYNTH, note, noteBuffer, prewarm, drum, drumBuffer, swish, tone, pulseWave, noiseBuf, dsp: { biquad, ring, addNoise, finish } };
})(window);
