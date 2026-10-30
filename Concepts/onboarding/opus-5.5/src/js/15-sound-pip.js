/* O55.pipVoice — Pip's sound (DL-238, F3-663; O3, O4, O5, O6): the six kits (Friendly, Glass, Basic, Retro Dark's
   phosphor, Retro Light's teletype, NieR), Pip's voice and each look's composed eight-bar music, synthesised with Web
   Audio as the concept made them (Concepts/onboarding/opus-5.5-pip/sound.js, approved round 10: live synthesis, its
   recipe kept as this source, O4). They play through the one player (O55.sound, 15-sound.js): its context, its master
   and its switch, general.interaction.sound-effects (DR-043; the window's speaker toggles it). Nothing plays before the
   first gesture, and nothing while it is off. Voice and music are Pip parts (S3, S4: setup-voice, setup-music), not
   sound keys. Reduced Motion never mutes (O5). Hovering, a look tile tried on and a preview lowered are silent outside
   NieR Mode (O6, F3-599 L42769). The chapter's sting is the window's own (O55.sound); Pip's music moves into the
   chapter's key (I, IV, V, vi, then I an octave up) and a chapter change adds a note of its motif until Ready resolves
   it. Banned, each a fixed complaint: held tones and drones, near-unison beating, gated buzz, NieR's moaning select
   and its deep thump after a page change (tools/sound_texture.mjs measures them).
   The stage asks: play(event, opts) -> bool, say(text, { mood, kit }) -> { ms, cps } (timing even when silent),
   hush(), loop(name, level 0..1), kitOf(theme). Tools: render(kit, kind, name, opts, o) -> Promise<AudioBuffer>,
   stats(buffer), wav(buffer). */
(function () {
  'use strict';
  const G = window, O55 = window.O55;
  'use strict';

  /* ---------------------------------------------------------------- catalogue */
  const KITS = ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'];
  const UI = ['tap', 'hover', 'select', 'toggleOn', 'toggleOff', 'next', 'back', 'open', 'close', 'key', 'warn'];
  const STAGE = ['lower', 'ghost', 'land', 'lift', 'hop', 'swing', 'tryOn', 'sparkle', 'confetti', 'chapter', 'tick', 'block',
    'power', 'score', 'lock', 'decode', 'slice', 'degauss', 'feed', 'powerOn', 'powerOff', 'rail', 'tip'];
  const VOCAL = ['wake', 'sleep', 'think', 'happy', 'wink', 'alert', 'cheer', 'crew'];
  const EVENTS = UI.concat(STAGE, VOCAL);
  const LOOPS = ['snore', 'work', 'power', 'swing', 'bed'];
  const MOTION = new Set(['lower', 'ghost', 'lift', 'swing', 'hop', 'rail']);
  const VOICED = new Set(['say', 'wake', 'sleep', 'think', 'happy', 'wink', 'alert']);
  // the quick ones you hear again and again get little room, so their tails never pile up and navigation never smears
  const DRY = { tip: 0.4, hover: 0.15, tap: 0.2, key: 0.15, tick: 0.35, toggleOn: 0.35, toggleOff: 0.35, select: 0.4, next: 0.45, back: 0.4, slice: 0.3, lock: 0.4 };
  // the least time between two of the same event (ms); more often than this is dropped
  const RATE = { tip: 600, hover: 45, key: 40, tap: 30, select: 40, lower: 60, ghost: 80, land: 50, tick: 80, sparkle: 90, rail: 120, decode: 90, score: 150, lock: 120, hop: 90, swing: 140, toggleOn: 40, toggleOff: 40 };
  // target loudness (dBFS RMS over the sound's active part) that tools/sound_levels.mjs trims every take to
  const TARGET = {
    tap: -34, hover: -37, select: -32, toggleOn: -34, toggleOff: -34, next: -32, back: -33, open: -29, close: -30, key: -35, warn: -30,
    lower: -31, ghost: -35, land: -30, lift: -32, hop: -30, swing: -34, tryOn: -27, sparkle: -30, confetti: -20, chapter: -27, tick: -27, block: -26,
    power: -24, score: -31, lock: -28, decode: -32, slice: -30, degauss: -27, feed: -29, powerOn: -27, powerOff: -29, rail: -33, tip: -33,
    wake: -26, sleep: -28, think: -27, happy: -26, wink: -27, alert: -26, cheer: -22, crew: -20, say: -26,
    // loops are measured over their whole length (rests included), the way they are heard
    'loop:snore': -44, 'loop:work': -42, 'loop:power': -45, 'loop:swing': -41, 'loop:bed': -43
  };
  // a kit's own exceptions to the targets (dB): NieR is the quiet one, its confirm a whisper next to its menu
  const OFFSET = { nier: { cheer: -5, crew: -5, hover: -3, slice: -3 }, glass: { confetti: -5 } };
  // events a kit plays only as a faint courtesy (another look's speciality): trimmed 7 dB under their target
  const SUBTLE = {
    friendly: ['score', 'lock', 'decode', 'slice', 'degauss', 'feed'],
    glass: ['score', 'decode', 'slice', 'degauss', 'feed'],
    basic: ['score', 'decode', 'slice', 'degauss', 'feed', 'swing', 'ghost'],
    phosphor: ['feed', 'slice'],
    teletype: ['degauss', 'slice', 'decode'],
    nier: ['score', 'feed', 'degauss', 'hop', 'swing']
  };
  /* per-kit level trims in dB, measured: tools/sound_render.mjs then tools/sound_catalog.py SOUND_DIR --pip --write */
  const TRIM = /* TRIM:begin */{"friendly":{"tap":2.5,"hover":2.5,"select":-4,"toggleOn":1,"toggleOff":3.5,"next":-3.5,"back":-2,"open":-0.5,"close":-2.5,"key":4,"warn":0.5,"lower":5.5,"ghost":10.5,"land":11,"lift":13.5,"hop":12,"swing":24,"tryOn":-0.5,"sparkle":2.5,"confetti":8,"chapter":-1,"tick":3.5,"block":2.5,"power":5,"score":6,"lock":5.5,"decode":9,"slice":23.5,"degauss":28.5,"feed":10.5,"powerOn":2,"powerOff":0.5,"rail":14,"tip":-0.5,"wake":-4,"sleep":2.5,"think":-12,"happy":-5,"wink":-3,"alert":-8.5,"cheer":-3,"crew":-5.5,"say":-5,"loop:snore":10,"loop:work":8,"loop:power":-6.5,"loop:swing":-11.5,"loop:bed":-5.5},"glass":{"tap":4.5,"hover":4.5,"select":2.5,"toggleOn":1.5,"toggleOff":0.5,"next":2.5,"back":5,"open":5,"close":5,"key":5,"warn":11,"lower":12.5,"ghost":8,"land":11.5,"lift":16,"hop":14,"swing":28,"tryOn":5.5,"sparkle":12,"confetti":6,"chapter":6,"tick":12.5,"block":12.5,"power":8,"score":10.5,"lock":7.5,"decode":11.5,"slice":24.5,"degauss":30,"feed":13,"powerOn":8.5,"powerOff":11,"rail":15,"tip":5,"wake":-9,"sleep":-3,"think":-14,"happy":-11.5,"wink":-10,"alert":-16.5,"cheer":-8.5,"crew":-12,"say":-13,"loop:snore":10,"loop:work":8.5,"loop:power":0,"loop:swing":-12.5,"loop:bed":-0.5},"basic":{"tap":20,"hover":18.5,"select":5.5,"toggleOn":5.5,"toggleOff":5.5,"next":6,"back":4.5,"open":8.5,"close":7.5,"key":21.5,"warn":9.5,"lower":13.5,"ghost":19,"land":11,"lift":12.5,"hop":14.5,"swing":24.5,"tryOn":8.5,"sparkle":12,"confetti":15,"chapter":8.5,"tick":10.5,"block":11.5,"power":13,"score":18.5,"lock":15.5,"decode":16.5,"slice":18,"degauss":26,"feed":22,"powerOn":14,"powerOff":12.5,"rail":14,"tip":5,"wake":-7.5,"sleep":-5.5,"think":-4.5,"happy":-8,"wink":-7.5,"alert":-9.5,"cheer":-6.5,"crew":-6.5,"say":-7,"loop:snore":24,"loop:work":23,"loop:power":4.5,"loop:swing":-18.5,"loop:bed":3},"phosphor":{"tap":8,"hover":13.5,"select":5.5,"toggleOn":5.5,"toggleOff":5,"next":8.5,"back":7.5,"open":11.5,"close":9,"key":12.5,"warn":16,"lower":17,"ghost":1.5,"land":11,"lift":9.5,"hop":9,"swing":17,"tryOn":11,"sparkle":19,"confetti":15,"chapter":11.5,"tick":11,"block":14.5,"power":16.5,"score":12.5,"lock":13.5,"decode":19,"slice":10,"degauss":11.5,"feed":29.5,"powerOn":15.5,"powerOff":8,"rail":11,"tip":8,"wake":3,"sleep":4.5,"think":2.5,"happy":2,"wink":1.5,"alert":0.5,"cheer":4,"crew":6,"say":2,"loop:snore":11.5,"loop:work":17,"loop:power":6.5,"loop:swing":-17,"loop:bed":7.5},"teletype":{"tap":20.5,"hover":28,"select":5.5,"toggleOn":18.5,"toggleOff":19.5,"next":22.5,"back":20,"open":26.5,"close":25,"key":21,"warn":-0.5,"lower":19,"ghost":26,"land":17.5,"lift":22.5,"hop":23.5,"swing":28,"tryOn":3.5,"sparkle":7,"confetti":8.5,"chapter":4.5,"tick":8.5,"block":9.5,"power":10,"score":24,"lock":27.5,"decode":18.5,"slice":18.5,"degauss":28.5,"feed":22.5,"powerOn":26.5,"powerOff":25,"rail":23.5,"tip":2.5,"wake":2,"sleep":3.5,"think":1.5,"happy":1,"wink":1.5,"alert":1.5,"cheer":4.5,"crew":3.5,"say":1.5,"loop:snore":8,"loop:work":22,"loop:power":-2,"loop:swing":-11.5,"loop:bed":-2},"nier":{"tap":9.5,"hover":7,"select":4.5,"toggleOn":10,"toggleOff":11,"next":9,"back":10,"open":17.5,"close":19,"key":18,"warn":15,"lower":20.5,"ghost":19.5,"land":19,"lift":18,"hop":15,"swing":27,"tryOn":12,"sparkle":19.5,"confetti":11.5,"chapter":5.5,"tick":14,"block":16.5,"power":13.5,"score":16,"lock":13,"decode":22.5,"slice":21.5,"degauss":21,"feed":16.5,"powerOn":13,"powerOff":19.5,"rail":17,"tip":7.5,"wake":-4,"sleep":-2.5,"think":17.5,"happy":-4.5,"wink":-4,"alert":-5.5,"cheer":14.5,"crew":-7,"say":-3.5,"loop:snore":12,"loop:work":14,"loop:power":4,"loop:swing":-19.5,"loop:bed":-1.5}}/* TRIM:end */;
  // the master chain's gain below its compressor's threshold, measured by the same tool, taken back out at the end
  const MAKEUP = /* MAKEUP:begin */1.42/* MAKEUP:end */;

  function kitOf(t) {
    t = String(t || '');
    if (KITS.indexOf(t) >= 0) return t;
    if (t === 'retro-dark') return 'phosphor';
    if (t === 'retro-light') return 'teletype';
    const f = t.split('-')[0];
    return { friendly: 'friendly', glass: 'glass', basic: 'basic', nier: 'nier', retro: 'phosphor' }[f] || 'friendly';
  }

  /* ---------------------------------------------------------------- randomness */
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  let R = Math.random;
  const jit = (a) => (R() * 2 - 1) * a;
  const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const db = (d) => Math.pow(10, d / 20);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PMAX = 7600; // partials stay under this: brighter is harsh at UI levels
  const fold = (m, top) => { while (m > top) m -= 12; return m; }; // a bell note this high would only shrill: an octave down

  /* ---------------------------------------------------------------- per-context resources */
  const RES = new WeakMap();
  function res(c) { let r = RES.get(c); if (!r) { r = { waves: {}, ks: new Map(), rooms: {} }; RES.set(c, r); } return r; }
  function noiseBuf(c) {
    const r = res(c); if (r.noise) return r.noise;
    const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0), q = rng(11);
    for (let i = 0; i < len; i++) d[i] = q() * 2 - 1;
    return (r.noise = b);
  }
  function pinkBuf(c) {
    const r = res(c); if (r.pink) return r.pink;
    const len = c.sampleRate * 3, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0), q = rng(23);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, pk = 1e-6;
    for (let i = 0; i < len; i++) {
      const w = q() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362; b6 = w * 0.115926; pk = Math.max(pk, Math.abs(d[i]));
    }
    for (let i = 0; i < len; i++) d[i] /= pk;
    return (r.pink = b);
  }
  function pulse(c, duty) {
    const r = res(c), k = String(duty); if (r.waves[k]) return r.waves[k];
    const n = 40, re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 1; i < n; i++) im[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty) * (i > 24 ? 0.5 : 1);
    return (r.waves[k] = c.createPeriodicWave(re, im));
  }

  /* ---------------------------------------------------------------- primitives */
  function env(c, t, peak, a, d, hold) {
    const g = c.createGain(), p = Math.max(2e-4, peak);
    a = Math.max(0.0008, a); d = Math.max(a + 0.004, d);
    g.gain.setValueAtTime(1e-4, t);
    g.gain.exponentialRampToValueAtTime(p, t + a);
    if (hold && hold > a + 0.002 && hold < d - 0.002) g.gain.setValueAtTime(p, t + hold);
    g.gain.exponentialRampToValueAtTime(1e-4, t + d);
    return g;
  }
  function filt(c, from, type, f, q) { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q == null ? 0.7 : q; from.connect(b); return b; }
  // one oscillator note: o { f, f2, glide, lin, type, wave, d, g, a, hold, lp, hp, bp, q, det, vib:[hz, cents] }
  function tone(c, out, t, o) {
    const s = c.createOscillator();
    if (o.wave) s.setPeriodicWave(o.wave); else s.type = o.type || 'sine';
    s.frequency.setValueAtTime(o.f, t);
    if (o.f2) { const te = t + (o.glide || o.d); if (o.lin) s.frequency.linearRampToValueAtTime(o.f2, te); else s.frequency.exponentialRampToValueAtTime(o.f2, te); }
    if (o.det) s.detune.setValueAtTime(o.det, t);
    let n = s;
    if (o.lp) n = filt(c, n, 'lowpass', o.lp, o.q);
    if (o.hp) n = filt(c, n, 'highpass', o.hp, 0.7);
    if (o.bp) n = filt(c, n, 'bandpass', o.bp, o.q || 1);
    const g = env(c, t, o.g == null ? 0.2 : o.g, o.a == null ? 0.003 : o.a, o.d, o.hold);
    n.connect(g); g.connect(out);
    if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; l.connect(lg); lg.connect(s.detune); l.start(t); l.stop(t + o.d + 0.05); }
    s.start(t); s.stop(t + o.d + 0.05);
    return s;
  }
  // filtered noise: o { d, f, f2, glide, q, type, g, a, hold, pink, white }
  function hiss(c, out, t, o) {
    const s = c.createBufferSource(); s.buffer = o.pink ? pinkBuf(c) : noiseBuf(c); s.loop = true;
    let n = s;
    if (o.type !== 'none') {
      const b = c.createBiquadFilter(); b.type = o.type || 'bandpass'; b.Q.value = o.q == null ? 1 : o.q; b.frequency.setValueAtTime(o.f || 2000, t);
      if (o.f2) b.frequency.exponentialRampToValueAtTime(o.f2, t + (o.glide || o.d));
      s.connect(b); n = b;
    }
    const g = env(c, t, o.g == null ? 0.1 : o.g, o.a == null ? 0.002 : o.a, o.d, o.hold);
    n.connect(g); g.connect(out);
    s.start(t, R() * 1.6); s.stop(t + o.d + 0.05);
    return s;
  }
  function fmb(c, out, t, o) {
    const car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain();
    car.frequency.value = o.f; mod.frequency.value = Math.min(o.f * o.ratio, c.sampleRate * 0.45);
    mg.gain.setValueAtTime(o.f * o.index, t);
    mg.gain.exponentialRampToValueAtTime(Math.max(0.5, o.f * o.index * 0.03), t + o.d * (o.idec || 0.5));
    mod.connect(mg); mg.connect(car.frequency);
    const g = env(c, t, o.g, o.a || 0.002, o.d); car.connect(g); g.connect(out);
    car.start(t); mod.start(t); car.stop(t + o.d + 0.05); mod.stop(t + o.d + 0.05);
  }
  function partials(c, out, t, f, list, d, g, a) {
    list.forEach(([r, gg, dd]) => { if (f * r < PMAX) tone(c, out, t, { f: f * r, d: Math.max(0.02, d * dd), g: g * gg, a: a || 0.002 }); });
  }
  /* a plucked string (Karplus-Strong): a delay line one period long, averaged and damped on every pass, rendered into a
     buffer once per context, pitch and colour, then played like a sample */
  function ksBuf(c, f, ring, bright) {
    const key = Math.round(f * 4) + ':' + ring + ':' + bright, r = res(c);
    if (r.ks.has(key)) return r.ks.get(key);
    const sr = c.sampleRate, N = Math.max(2, Math.round(sr / f)), len = Math.ceil(sr * (ring + 0.03));
    const b = c.createBuffer(1, len, sr), y = b.getChannelData(0), line = new Float32Array(N), q = rng(N * 31 + 7);
    let lp = 0, mean = 0; const k = 0.25 + bright * 0.7, P = Math.max(1, Math.round(N * 0.2));
    for (let i = 0; i < N; i++) { lp += ((q() * 2 - 1) - lp) * k; line[i] = (i < P ? i / P : (N - i) / (N - P)) * 0.7 + lp * 0.6; mean += line[i] / N; }
    for (let i = 0; i < N; i++) line[i] -= mean;
    const loss = Math.pow(0.001, 1 / (ring * f)), w = 1 - bright * 0.65;
    let idx = 0, pk = 1e-6;
    for (let n = 0; n < len; n++) {
      const cur = line[idx], nx = line[(idx + 1) % N];
      y[n] = cur; line[idx] = loss * (cur * (1 - w) + 0.5 * (cur + nx) * w); idx = (idx + 1) % N;
      if (Math.abs(cur) > pk) pk = Math.abs(cur);
    }
    const fade = Math.round(sr * 0.025);
    for (let n = 0; n < len; n++) y[n] *= (0.8 / pk) * (n > len - fade ? (len - n) / fade : 1);
    r.ks.set(key, b);
    return b;
  }
  function pluck(c, out, t, f, o) {
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = ksBuf(c, f, o.ring || 0.4, o.bright == null ? 0.5 : o.bright);
    g.gain.value = o.g == null ? 0.2 : o.g; s.connect(g); g.connect(out); s.start(t);
  }

  /* ---------------------------------------------------------------- instruments */
  const I = {
    marimba(c, o, t, m, g, d) { const f = mf(fold(m, 96)); g = g == null ? 0.2 : g; d = d || 0.6; partials(c, o, t, f, [[1, 1, 1], [3.93, 0.26, 0.18], [9.8, 0.05, 0.06]], d, g, 0.002); hiss(c, o, t, { d: 0.014, f: Math.min(4000, f * 4), q: 0.8, g: g * 0.14 }); },
    kalimba(c, o, t, m, g, d) { const f = mf(fold(m, 101)); g = g == null ? 0.14 : g; d = d || 1.1; partials(c, o, t, f, [[1, 1, 1], [5.4, 0.15, 0.12], [11.2, 0.04, 0.04]], d, g, 0.002); tone(c, o, t, { f: f * 1.004, d: d * 0.8, g: g * 0.22 }); },
    glock(c, o, t, m, g, d) { const f = mf(fold(m, 105)); partials(c, o, t, f, [[1, 1, 1], [2.76, 0.28, 0.35], [5.4, 0.1, 0.12]], d || 0.9, g == null ? 0.08 : g, 0.001); },
    musicbox(c, o, t, m, g, d) { const f = mf(fold(m, 103)); g = g == null ? 0.09 : g; partials(c, o, t, f, [[1, 1, 1], [3.01, 0.2, 0.3], [6.1, 0.07, 0.1]], d || 1.2, g, 0.001); hiss(c, o, t, { d: 0.006, f: 4800, q: 2, g: g * 0.25 }); },
    wood(c, o, t, f, g) { g = g == null ? 0.12 : g; tone(c, o, t, { f, d: 0.07, g, a: 0.001, type: 'triangle' }); if (f * 2.47 < PMAX) tone(c, o, t, { f: f * 2.47, d: 0.028, g: g * 0.3, a: 0.001 }); hiss(c, o, t, { d: 0.01, f: Math.min(5000, f * 3), q: 3, g: g * 0.45 }); },
    felt(c, o, t, g, f) { g = g == null ? 0.25 : g; f = f || 110; tone(c, o, t, { f: f * 1.6, f2: f * 0.7, d: 0.14, g, a: 0.004, lp: 700 }); hiss(c, o, t, { d: 0.06, f: 520, q: 0.7, type: 'lowpass', g: g * 0.3 }); },
    creak(c, o, t, g) { hiss(c, o, t, { d: 0.13, f: 950, f2: 720, q: 7, g: g == null ? 0.03 : g, a: 0.03 }); },
    glassBell(c, o, t, m, g, d) { const f = mf(fold(m, 100)); g = g == null ? 0.1 : g; d = d || 1.6; fmb(c, o, t, { f, ratio: 3.5, index: 0.8, d: d * 0.7, g: g * 0.55 }); tone(c, o, t, { f: f * 1.0015, d, g: g * 0.6 }); if (f * 2.32 < PMAX) tone(c, o, t, { f: f * 2.32, d: d * 0.35, g: g * 0.16 }); },
    wineGlass(c, o, t, m, g, d) { const f = mf(fold(m, 102)); g = g == null ? 0.08 : g; d = d || 1.4; tone(c, o, t, { f, d, g, a: 0.05, hold: d * 0.3 }); tone(c, o, t, { f: f * 1.001, d, g: g * 0.3, a: 0.07 }); if (f * 2.32 < PMAX) tone(c, o, t, { f: f * 2.32, d: d * 0.6, g: g * 0.1, a: 0.04 }); },
    tink(c, o, t, m, g) { const f = mf(fold(m, 106)); g = g == null ? 0.06 : g; tone(c, o, t, { f, d: 0.11, g, a: 0.001 }); if (f * 2.32 < PMAX) tone(c, o, t, { f: f * 2.32, d: 0.05, g: g * 0.3, a: 0.001 }); },
    bloop(c, o, t, f, g, up) { tone(c, o, t, { f, f2: up === false ? f * 0.45 : f * 2.6, glide: 0.07, d: 0.12, g: g == null ? 0.15 : g, a: 0.003 }); },
    sine(c, o, t, m, g, d, a) { tone(c, o, t, { f: mf(m), d: d || 0.25, g: g == null ? 0.12 : g, a: a || 0.005 }); },
    click(c, o, t, g, f) { g = g == null ? 0.08 : g; f = f || 3000; hiss(c, o, t, { d: 0.006, f, q: 1.2, g }); tone(c, o, t, { f: f * 0.6, d: 0.018, g: g * 0.4, a: 0.0008 }); },
    chip(c, o, t, m, d, g, duty, m2) { tone(c, o, t, { wave: pulse(c, duty || 0.25), f: mf(m), f2: m2 != null ? mf(m2) : null, d: d || 0.08, g: g == null ? 0.08 : g, a: 0.0015, lp: 5200, hold: (d || 0.08) * 0.7 }); },
    tri(c, o, t, m, d, g, m2) { tone(c, o, t, { type: 'triangle', f: mf(m), f2: m2 != null ? mf(m2) : null, d: d || 0.1, g: g == null ? 0.12 : g, a: 0.001, hold: (d || 0.1) * 0.7 }); },
    crunch(c, o, t, d, g, f) { hiss(c, o, t, { d: d || 0.06, f: f || 1800, q: 0.6, type: 'lowpass', g: g == null ? 0.1 : g, a: 0.001 }); },
    // a typewriter key: the type bar's snap, the body's short wooden knock, a soft thud into the platen
    clack(c, o, t, g, p) { g = g == null ? 0.14 : g; p = p || 1; hiss(c, o, t, { d: 0.008, f: 3400 * p, q: 1.1, g: g * 0.6, a: 0.0022 }); hiss(c, o, t + 0.001, { d: 0.028, f: 1250 * p, q: 5, g: g * 0.9 }); tone(c, o, t + 0.002, { f: 230 * p, f2: 160 * p, d: 0.03, g: g * 0.16, a: 0.001 }); },
    ratchet(c, o, t, n, step, g, p) { g = g == null ? 0.08 : g; p = p || 1; for (let i = 0; i < n; i++) { const tt = t + i * step * (1 + jit(0.08)); hiss(c, o, tt, { d: 0.007, f: 3300 * p, q: 2, g: g * (1 - (i / n) * 0.3) }); tone(c, o, tt, { f: 880 * p, d: 0.012, g: g * 0.25, a: 0.0005 }); } },
    ding(c, o, t, g, m) { const f = mf(m || 93); partials(c, o, t, f, [[1, 1, 1], [1.0015, 0.2, 0.9], [2.76, 0.32, 0.4], [5.4, 0.12, 0.15]], 1.5, g == null ? 0.1 : g, 0.001); hiss(c, o, t, { d: 0.005, f: 4200, q: 2, g: (g || 0.1) * 0.4 }); },
    celesta(c, o, t, m, g, d) { const f = mf(fold(m, 103)); g = g == null ? 0.09 : g; partials(c, o, t, f, [[1, 1, 1], [4, 0.16, 0.25], [2, 0.12, 0.5]], d || 0.7, g, 0.001); hiss(c, o, t, { d: 0.004, f: 4000, q: 2, g: g * 0.2 }); },
    // the print head running along a line: light, uneven pin ticks (never a gated tone: that reads as distortion)
    pins(c, o, t, n, g, p) {
      g = g == null ? 0.05 : g; p = p || 1; let tt = t;
      for (let i = 0; i < n; i++) { const k = 0.75 + R() * 0.5; hiss(c, o, tt, { d: 0.004, f: (2900 + R() * 900) * p, q: 2.6, g: g * k }); tone(c, o, tt, { f: (1500 + R() * 300) * p, d: 0.007, g: g * 0.18 * k, a: 0.0006 }); tt += 0.016 + R() * 0.014; }
      return tt - t;
    },
    // a small motor spinning up (or down): a band of air rising in pitch with a soft fundamental, no buzz
    motor(c, o, t, d, up, g) {
      g = g == null ? 0.05 : g;
      hiss(c, o, t, { d, f: up ? 420 : 1100, f2: up ? 1100 : 380, q: 2.4, g, a: up ? d * 0.5 : 0.02, hold: up ? d * 0.7 : 0, pink: true });
      tone(c, o, t, { f: up ? 140 : 320, f2: up ? 320 : 120, d, g: g * 0.35, a: up ? d * 0.45 : 0.02 });
    },
    // NieR's soft menu tick
    ntick(c, o, t, f, g, d) { g = g == null ? 0.06 : g; tone(c, o, t, { f: f || 2640, d: d || 0.035, g, a: 0.006 }); hiss(c, o, t, { d: 0.004, f: 5000, q: 2.5, g: g * 0.3, a: 0.0006 }); },
    hum(c, o, t, f1, f2, d, g, lp1, lp2) {
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.9; lp.frequency.setValueAtTime(lp1 || 400, t); lp.frequency.exponentialRampToValueAtTime(lp2 || 2600, t + d * 0.8);
      const e = env(c, t, g == null ? 0.05 : g, Math.min(0.12, d * 0.3), d); lp.connect(e); e.connect(o);
      [[1, 'triangle', 1], [2, 'sine', 0.45]].forEach(([m, type, gg]) => { const s = c.createOscillator(), sg = c.createGain(); s.type = type; s.frequency.setValueAtTime(f1 * m, t); s.frequency.exponentialRampToValueAtTime(f2 * m, t + d * 0.9); sg.gain.value = gg; s.connect(sg); sg.connect(lp); s.start(t); s.stop(t + d + 0.05); });
    },
    // a digital glitch grain: a short band of noise with a pitched edge, never a tremolo
    glitch(c, o, t, f, d, g) { g = g == null ? 0.04 : g; hiss(c, o, t, { d, f, q: 4, g, hold: d * 0.7, a: 0.0008 }); tone(c, o, t, { type: 'square', f: f * 0.25, d: d * 0.8, g: g * 0.18, a: 0.0008, lp: 2400, hold: d * 0.6 }); },
    whoosh(c, o, t, d, f1, f2, g, q) { hiss(c, o, t, { d, f: f1, f2, q: q || 0.9, g: g == null ? 0.06 : g, a: d * 0.42, pink: true }); },
    pad(c, o, t, ms, d, g, type, lp, a) {
      const lo = c.createBiquadFilter(); lo.type = 'lowpass'; lo.frequency.value = lp || 2400; lo.Q.value = 0.5; lo.connect(o);
      ms.forEach((m, i) => { const f = mf(m); tone(c, lo, t, { f, type: type || 'triangle', d, g: g / Math.sqrt(ms.length), a: a || 0.06, hold: d * 0.5, det: i % 2 ? 4 : -4 }); });
    },
  };

  /* ---------------------------------------------------------------- music */
  const SCALE = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
  // the chapter chords: Welcome I, Computer IV, Project V, AI vi, Ready I an octave up (NieR, in A minor: i, VI, III, VII, iv)
  const CHORDS = {
    major: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [9, 12, 16], [12, 16, 19]],
    minor: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5], [5, 8, 12]]
  };

  /* ---------------------------------------------------------------- Pip's voice */
  // vowel formants (Hz) for a small creature: scaled by each voice's fs
  const FORM = { a: [800, 1250, 2600], e: [500, 1850, 2550], i: [320, 2300, 3000], o: [520, 880, 2450], u: [340, 800, 2300], m: [260, 1050, 2300] };
  // consonant onsets: noise centre (Hz), level, length (s)
  const ONSET = { p: [2300, 0.55, 0.012], s: [5200, 0.32, 0.05], h: [1500, 0.25, 0.045], n: null, l: null };
  const MOOD = {
    idle: { st: 0, bounce: 1, rate: 1, bright: 1 },
    happy: { st: 3, bounce: 1.35, rate: 1.08, bright: 1.15 },
    think: { st: -2, bounce: 0.6, rate: 0.86, bright: 0.85, hum: true },
    alert: { st: 5, bounce: 1.1, rate: 1.2, bright: 1.2 },
    sleep: { st: -6, bounce: 0.35, rate: 0.72, bright: 0.6 },
    wink: { st: 2, bounce: 1.25, rate: 1.05, bright: 1.1 },
    dots: { st: -1, bounce: 0.8, rate: 0.92, bright: 0.9 },
    oops: { st: -3, bounce: 0.7, rate: 0.94, bright: 0.85 },
    watch: { st: 1, bounce: 1.1, rate: 0.96, bright: 1.05 },
    wonder: { st: 4, bounce: 1.2, rate: 1.04, bright: 1.15 }
  };
  // the crew: Coordinator (crown) low and grand, Builder (hard hat) gruff, Reviewer (glasses) high and precise
  const CREW = { pip: { mul: 1, rate: 1, grit: 0, fs: 1 }, crown: { mul: 0.72, rate: 0.9, grit: 0.12, fs: 0.9 }, hardhat: { mul: 0.86, rate: 1, grit: 0.3, fs: 0.95 }, glasses: { mul: 1.32, rate: 1.12, grit: 0, fs: 1.1 } };
  const VOX = {
    friendly: { kind: 'formant', w1: 'triangle', saw: 0.28, q: 7, fs: 1.18, lp: 4300, direct: 0.25, vib: [5.8, 16], gain: 0.55, att: 0.01, cons: 0.35, base: 285, bounce: 2.4, cps: 32 },
    glass: { kind: 'formant', w1: 'sine', saw: 0.1, oct: 0.32, q: 5, fs: 1.3, lp: 6000, direct: 0.35, vib: [4.6, 12], breath: 0.11, shimmer: 0.05, gain: 0.55, att: 0.016, cons: 0.16, base: 345, bounce: 1.9, cps: 29, legato: 0.15 },
    basic: { kind: 'chirp', gain: 0.32, base: 740, bounce: 1.3, att: 0.004, rel: 0.012, maxSyl: 0.075, cons: 0.1, cps: 36 },
    phosphor: { kind: 'pulse', duty: 0.375, gain: 0.22, root: 72, quant: [0, 2, 4, 7, 9, 12, 14, 16], maxSyl: 0.036, blip: 3, lp: 3000, cps: 50 },
    teletype: { kind: 'tick', gain: 0.2, root: 74, quant: [0, 2, 4, 5, 7, 9, 11, 12], maxSyl: 0.06, blip: 3, cps: 46 },
    nier: { kind: 'chirp', w1: 'triangle', harm: 0.16, lp: 3600, gain: 0.3, base: 560, bounce: 0.4, mono: true, step: true, att: 0.003, rel: 0.01, maxSyl: 0.07, cons: 0.06, cps: 52 }
  };
  /* (a line Pip says is O55.sound.pip's: its voice core turns the words into syllables; the kits keep the scripted
     one-shots below, and the crew's three voices on Ready) */
  // a scripted non-verbal sound (yawn, giggle, "hmm") for the beeping voices: blips that walk the contour
  function blipsFromScript(script, V) {
    const out = [];
    script.forEach((s) => {
      const k = Math.max(1, Math.round(s.d / 0.055));
      for (let i = 0; i < k; i++) {
        const p = s.p + (s.p2 - s.p) * (k > 1 ? i / (k - 1) : 0);
        out.push({ t: s.t + (s.d * i) / k, d: Math.min(V.maxSyl, (s.d / k) * 0.85), deg: Math.round(p / 2) + 3, p: 0, p2: 0, g: s.g || 1 });
      }
    });
    return out;
  }
  const VS = {
    wake: [{ t: 0, d: 0.34, v: 'a', p: -3, p2: 4, on: 'h', g: 0.8, leg: true }, { t: 0.34, d: 0.42, v: 'o', p: 4, p2: -6, g: 0.75 }, { t: 0.9, d: 0.08, v: 'e', p: 5, p2: 7, on: 'p' }, { t: 1.0, d: 0.12, v: 'i', p: 9, p2: 11 }],
    sleep: [{ t: 0, d: 0.5, v: 'a', p: 1, p2: -6, on: 'h', g: 0.7, leg: true }, { t: 0.5, d: 0.42, v: 'm', p: -6, p2: -9, g: 0.55 }],
    think: [{ t: 0, d: 0.18, v: 'm', p: 0, p2: 2, g: 0.8, leg: true }, { t: 0.18, d: 0.32, v: 'm', p: 2, p2: -1, g: 0.8 }],
    happy: [{ t: 0, d: 0.09, v: 'e', p: 3, p2: 5, on: 'l', leg: true }, { t: 0.09, d: 0.17, v: 'a', p: 7, p2: 10 }, { t: 0.33, d: 0.06, v: 'i', p: 12, p2: 11, on: 'h', g: 0.6 }, { t: 0.41, d: 0.06, v: 'i', p: 10, p2: 9, on: 'h', g: 0.55 }, { t: 0.49, d: 0.07, v: 'i', p: 8, p2: 6, on: 'h', g: 0.5 }],
    wink: [{ t: 0, d: 0.07, v: 'e', p: 6, p2: 7, on: 'h', g: 0.8 }, { t: 0.13, d: 0.1, v: 'e', p: 4, p2: 2, on: 'h', g: 0.75 }],
    alert: [{ t: 0, d: 0.17, v: 'o', p: 5, p2: 10, g: 1 }],
    cheer: [{ t: 0, d: 0.1, v: 'a', p: 5, p2: 8, on: 'l', leg: true }, { t: 0.1, d: 0.24, v: 'a', p: 10, p2: 12, g: 1.05 }],
    crew: [{ t: 0, d: 0.14, v: 'u', p: 0, p2: 1, on: 'h' }, { t: 0.17, d: 0.3, v: 'e', p: 4, p2: 7, on: 'l', g: 1.05 }]
  };

  /* the voice: one graph per line, its pitch, formants and level moved syllable by syllable (so neighbouring sounds run
     into each other as speech does). Returns { stop(t), end } */
  function voice(c, out, t0, script, kitName, opt) {
    const V = VOX[kitName], C = CREW[(opt && opt.voice) || 'pip'] || CREW.pip, mood = MOOD[(opt && opt.mood) || 'idle'] || MOOD.idle;
    if (V.kind === 'tick') return tickVoice(c, out, t0, script, V, C);
    const last = new Map();
    const setT = (p, v, t, tc) => { const lt = last.get(p) || 0; t = Math.max(t, lt + 1e-4); last.set(p, t); p.setTargetAtTime(v, t, Math.max(0.0008, tc)); };
    const end = script.reduce((m, s) => Math.max(m, s.t + s.d), 0), stopAt = t0 + end + 0.4;
    const oscs = [], fps = [], pitched = [];
    const env = c.createGain(); env.gain.setValueAtTime(0, t0);
    let into = env;
    env.connect(out);
    const mk = (type, mul, wave) => { const o = c.createOscillator(); if (wave) o.setPeriodicWave(wave); else o.type = type; o.start(t0); o.stop(stopAt); oscs.push(o); pitched.push(o); fps.push([o.frequency, mul]); return o; };
    let bands = null, ng = null, nbp = null;
    const base = (V.base || 300) * C.mul;
    if (V.kind === 'formant') {
      const mix = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = V.lp * (mood.bright || 1); lp.Q.value = 0.5; lp.connect(into);
      mk(V.w1, 1).connect(mix);
      const saw = (V.saw || 0) + C.grit;
      if (saw > 0) { const g2 = c.createGain(); g2.gain.value = saw; mk('sawtooth', 1).connect(g2); g2.connect(mix); }
      if (V.oct) { const g3 = c.createGain(); g3.gain.value = V.oct; mk('sine', 2).connect(g3); g3.connect(mix); }
      if (V.breath) { const nb = c.createBufferSource(); nb.buffer = noiseBuf(c); nb.loop = true; const bg = c.createGain(); bg.gain.value = V.breath; nb.connect(bg); bg.connect(mix); nb.start(t0, R()); nb.stop(stopAt); oscs.push(nb); }
      bands = [0, 1, 2].map((j) => { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = V.q * (j ? 1.3 : 1); b.frequency.value = FORM.a[j] * V.fs; const g = c.createGain(); g.gain.value = [1, 0.62, 0.28][j] * (j ? mood.bright || 1 : 1) * 3.2; mix.connect(b); b.connect(g); g.connect(lp); return b; });
      const dg = c.createGain(); dg.gain.value = V.direct || 0.2; mix.connect(dg); dg.connect(lp);
      if (V.shimmer) { const sg = c.createGain(); sg.gain.value = V.shimmer; mk('sine', 4).connect(sg); sg.connect(lp); }
    } else if (V.kind === 'chirp') {
      // a clean tone; NieR's adds a quiet third harmonic for a glassy, digital edge
      const o1 = mk(V.w1 || 'sine', 1);
      if (V.harm) { filt(c, o1, 'lowpass', V.lp || 4000, 0.5).connect(into); const hg = c.createGain(); hg.gain.value = V.harm; mk('sine', 3).connect(hg); hg.connect(into); } else o1.connect(into);
    } else {
      const lp = filt(c, mk(null, 1, pulse(c, V.duty)), 'lowpass', V.lp, 0.6); lp.connect(into);
    }
    if (V.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = V.vib[0]; lg.gain.value = V.vib[1]; l.connect(lg); pitched.forEach((o) => lg.connect(o.detune)); l.start(t0); l.stop(stopAt); oscs.push(l); }
    if (V.kind === 'formant' || V.kind === 'chirp') {
      const ns = c.createBufferSource(); ns.buffer = noiseBuf(c); ns.loop = true; nbp = c.createBiquadFilter(); nbp.type = 'bandpass'; nbp.Q.value = 1.2; nbp.frequency.value = 2500;
      ng = c.createGain(); ng.gain.setValueAtTime(0, t0); ns.connect(nbp); nbp.connect(ng); ng.connect(out); ns.start(t0, R()); ns.stop(stopAt); oscs.push(ns);
    }
    const peak = V.gain;
    if (V.kind === 'pulse') {
      const tr = 12 * Math.log2(C.mul);
      script.forEach((s) => {
        const ts = t0 + s.t, te = ts + s.d, q = V.quant, deg = s.deg | 0;
        const midi = V.root + tr + q[((deg % q.length) + q.length) % q.length] + 12 * Math.floor(deg / q.length);
        fps.forEach(([p, mul]) => setT(p, mf(midi) * mul, ts - 0.001, 0.0008));
        setT(env.gain, peak * (s.g || 1), ts, 0.0015);
        setT(env.gain, 0, te - 0.004, 0.004);
      });
    } else {
      script.forEach((s, j) => {
        // a Pod speaks in steps: each syllable on one note, a small lift on every third, the ending's contour kept
        const p0 = V.step ? Math.round(s.p) + (j % 3 === 1 ? 2 : 0) : s.p, p1 = V.step ? (j === script.length - 1 ? Math.round(s.p2) : p0) : s.p2;
        const ts = t0 + s.t, te = ts + s.d, f0 = base * Math.pow(2, p0 / 12), f1 = base * Math.pow(2, p1 / 12);
        fps.forEach(([p, mul]) => { setT(p, f0 * mul, ts - 0.004, 0.004); setT(p, f1 * mul, ts + s.d * 0.3, s.d * 0.35); });
        if (bands) { const F = FORM[s.v] || FORM.a; bands.forEach((b, k) => setT(b.frequency, F[k] * V.fs * C.fs, ts - 0.01, 0.012)); }
        const lvl = peak * (s.g || 1) * (s.v === 'm' ? 0.7 : 1);
        setT(env.gain, lvl, ts, s.on === 'n' ? 0.02 : V.att || 0.01);
        const nx = script[j + 1], leg = V.kind !== 'chirp' && !V.mono && s.leg && nx && nx.t - (s.t + s.d) < 0.03;
        setT(env.gain, leg ? lvl * (V.legato != null ? V.legato : 0.4) : 0, te - 0.01, V.rel || 0.014);
        const O = s.on && ONSET[s.on];
        if (O && ng) {
          setT(nbp.frequency, O[0], ts - 0.022, 0.001);
          setT(ng.gain, O[1] * (V.cons || 0.3) * peak, ts - 0.02, 0.002);
          setT(ng.gain, 0, ts - 0.02 + O[2], 0.008);
        }
      });
    }
    return {
      end: stopAt,
      stop(t) {
        try { env.gain.cancelScheduledValues(t); env.gain.setTargetAtTime(0, t, 0.01); } catch (e) { /* already gone */ }
        if (ng) try { ng.gain.cancelScheduledValues(t); ng.gain.setTargetAtTime(0, t, 0.005); } catch (e) { /* already gone */ }
        oscs.forEach((o) => { try { o.stop(t + 0.08); } catch (e) { /* already stopped */ } });
      }
    };
  }
  /* Retro Light's voice: each blip a struck note (and a faint twelfth) with the light tick of a key. One voice at a time:
     each note is damped as the next is struck, since two neighbouring notes ringing together beat, and read as rough. */
  function tickVoice(c, out, t0, script, V, C) {
    const tr = 12 * Math.log2(C.mul), q = V.quant, srcs = [], env = c.createGain(); env.gain.setValueAtTime(0, t0); env.connect(out);
    const end = script.reduce((m, s) => Math.max(m, s.t + s.d * 2.2), 0), stopAt = t0 + end + 0.3;
    const osc = [[1, 1], [3, 0.08]].map(([mul, g]) => { const o = c.createOscillator(), og = c.createGain(); og.gain.value = g; o.connect(og); og.connect(env); o.start(t0); o.stop(stopAt); srcs.push([t0, o]); return [o, mul]; });
    script.forEach((s, j) => {
      const deg = s.deg | 0, midi = V.root + tr + q[((deg % q.length) + q.length) % q.length] + 12 * Math.floor(deg / q.length);
      const f = mf(midi), ts = t0 + s.t, g = V.gain * (s.g || 1), nx = script[j + 1], cut = nx ? t0 + nx.t - 0.003 : ts + s.d * 2.2;
      env.gain.setTargetAtTime(0, Math.max(t0, ts - 0.003), 0.0008);
      osc.forEach(([o, mul]) => o.frequency.setValueAtTime(f * mul, ts));
      env.gain.setTargetAtTime(g, ts, 0.0012);
      env.gain.setTargetAtTime(0, ts + 0.006, Math.min(0.03, Math.max(0.006, (cut - ts) * 0.35)));
      srcs.push([ts, hiss(c, out, ts, { d: 0.003, f: 3600, q: 2.5, g: g * 0.3 })]);
    });
    return { end: stopAt, stop(t) { env.gain.cancelScheduledValues(t); env.gain.setTargetAtTime(0, t, 0.005); srcs.forEach(([ts, o]) => { try { o.stop(ts > t ? t : t + 0.05); } catch (e) { /* gone */ } }); } };
  }
  function scriptFor(kitName, name) {
    const V = VOX[kitName], s = VS[name];
    if (V.kind === 'pulse' || V.kind === 'tick') return blipsFromScript(s, V);
    if (V.mono) return s.map((q) => Object.assign({}, q, { p: q.p * 0.25, p2: q.p2 * 0.25, d: Math.min(q.d, 0.2) }));
    return s;
  }
  function vocal(c, o, t, kitName, name, op) { return voice(c, o, t, scriptFor(kitName, name), kitName, op || {}); }

  /* ---------------------------------------------------------------- the kits */
  // a kit's signature flourish: what Pip trying on that look sounds like
  const SIG = {
    friendly: (c, o, t, k) => { const ch = k.chord(); ch.concat(ch[0] + 12).forEach((m, i) => I.kalimba(c, o, t + i * 0.06, m + 12, 0.1, 0.8)); },
    glass: (c, o, t, k) => { const ch = k.chord(); [ch[0] + 24, ch[2] + 12, ch[1] + 24].forEach((m, i) => I.glassBell(c, o, t + i * 0.07, m, 0.07, 1.1)); I.bloop(c, o, t + 0.05, 500, 0.06); },
    basic: (c, o, t) => { I.sine(c, o, t, 84, 0.08, 0.14); I.sine(c, o, t + 0.07, 91, 0.08, 0.22); },
    phosphor: (c, o, t) => { [72, 76, 79, 84, 88].forEach((m, i) => I.chip(c, o, t + i * 0.035, m, 0.04, 0.07, 0.25)); },
    teletype: (c, o, t) => { I.clack(c, o, t, 0.12); I.clack(c, o, t + 0.06, 0.1, 1.08); I.ding(c, o, t + 0.13, 0.09); },
    nier: (c, o, t) => { I.ntick(c, o, t, 2640, 0.05); I.sine(c, o, t + 0.04, 88, 0.07, 0.08); I.sine(c, o, t + 0.1, 93, 0.07, 0.25); }
  };
  const motifRun = (k, t, gap, fn) => { const n = clamp(k.ch, 1, 4); for (let i = 0; i < n; i++) fn(t + i * gap, k.root + k.K.motif[i], i, i === n - 1); return n; };

  const KIT = {};
  KIT.friendly = {
    root: 72, mode: 'major', motif: [12, 14, 16, 19], room: { len: 1.2, rt: 0.9, bright: 0.35, wet: 0.14 },
    ev: {
      tap: (c, o, t, op, k) => I.wood(c, o, t, [1046, 1175, 1318, 1568][k.v % 4], 0.1),
      hover: (c, o, t, op, k) => I.kalimba(c, o, t, k.chord()[k.v % 3] + 12, 0.04, 0.4),
      select: (c, o, t, op, k) => { const ch = k.chord(); I.marimba(c, o, t, ch[1] + 12, 0.15, 0.4); I.marimba(c, o, t + 0.06, ch[2] + 12, 0.13, 0.5); },
      toggleOn: (c, o, t) => { I.wood(c, o, t, 880, 0.1); I.wood(c, o, t + 0.05, 1318, 0.1); },
      toggleOff: (c, o, t) => { I.wood(c, o, t, 1318, 0.08); I.wood(c, o, t + 0.05, 880, 0.08); I.felt(c, o, t + 0.05, 0.05); },
      next: (c, o, t, op, k) => { const ch = k.chord(); [ch[0], ch[1], ch[2]].forEach((m, i) => I.marimba(c, o, t + i * 0.055, m + 12, 0.12, 0.45)); },
      back: (c, o, t, op, k) => { const ch = k.chord(); I.marimba(c, o, t, ch[2] + 12, 0.11, 0.4); I.marimba(c, o, t + 0.06, ch[0], 0.11, 0.5); },
      open: (c, o, t, op, k) => { const ch = k.chord(); [ch[0], ch[1], ch[2], ch[0] + 12, ch[1] + 12].forEach((m, i) => I.kalimba(c, o, t + i * 0.065, m, 0.09, 0.9)); I.whoosh(c, o, t, 0.35, 400, 1400, 0.04); },
      close: (c, o, t, op, k) => { const ch = k.chord(); [ch[2] + 12, ch[1] + 12, ch[0] + 12, ch[0]].forEach((m, i) => I.kalimba(c, o, t + i * 0.07, m, 0.09, 0.7)); I.felt(c, o, t + 0.3, 0.12); },
      key: (c, o, t, op, k) => { I.wood(c, o, t, mf(k.deg((k.idx % 8) + 7) + 12) * (1 + jit(0.004)), 0.07); },
      warn: (c, o, t, op, k) => { I.marimba(c, o, t, k.root + 4, 0.14, 0.4); I.marimba(c, o, t + 0.14, k.root + 1, 0.14, 0.55); },
      lower: (c, o, t, op, k) => { pluck(c, o, t, k.strF(196), { ring: 0.6, bright: 0.45, g: 0.22 }); I.creak(c, o, t + 0.02, 0.025); },
      ghost: (c, o, t, op, k) => { pluck(c, o, t, k.strF(392), { ring: 0.4, bright: 0.3, g: 0.07 }); I.whoosh(c, o, t, 0.35, 1200, 700, 0.025); },
      land: (c, o, t, op, k) => { I.felt(c, o, t, 0.22, 95 + (k.v % 3) * 12); I.wood(c, o, t + 0.005, 330 + k.v * 40, 0.05); },
      lift: (c, o, t, op, k) => { I.whoosh(c, o, t, 0.3, 500, 1600, 0.05); pluck(c, o, t + 0.05, k.strF(330), { ring: 0.3, bright: 0.5, g: 0.08 }); },
      hop: (c, o, t) => { tone(c, o, t, { type: 'triangle', f: 210, f2: 520, glide: 0.12, d: 0.2, g: 0.13, a: 0.004, vib: [14, 45] }); I.felt(c, o, t, 0.08); },
      swing: (c, o, t) => I.whoosh(c, o, t, 0.42, 400, 1100, 0.05, 0.8),
      tryOn: (c, o, t, op, k) => { I.whoosh(c, o, t, 0.22, 600, 2400, 0.05); SIG.friendly(c, o, t + 0.12, k); },
      sparkle: (c, o, t, op, k) => { const ch = k.chord(); for (let i = 0; i < 5; i++) I.glock(c, o, t + i * 0.06 + R() * 0.03, ch[(i + k.v) % 3] + 24, 0.05, 0.6); },
      confetti: (c, o, t, op, k) => {
        hiss(c, o, t, { d: 0.09, f: 1600, q: 0.5, g: 0.22 }); I.felt(c, o, t, 0.18);
        const tune = [[67, 0.12], [72, 0.12], [76, 0.12], [79, 0.24], [77, 0.12], [76, 0.12], [74, 0.12], [72, 0.12], [76, 0.12], [79, 0.12], [84, 0.5]];
        let tt = t + 0.12; tune.forEach(([m, d]) => { I.musicbox(c, o, tt, m + 12, 0.1, 1.1); tt += d; });
        [60, 64, 67, 72].forEach((m, i) => I.marimba(c, o, tt - 0.5 + i * 0.03, m, 0.13, 0.9));
        for (let i = 0; i < 6; i++) I.glock(c, o, tt - 0.3 + i * 0.07, [84, 88, 91, 96][i % 4] + 12, 0.04, 0.6);
      },
      chapter: (c, o, t, op, k) => {
        const n = motifRun(k, t, 0.13, (at, m, i, last) => { I.marimba(c, o, at, m, 0.14, last ? 0.9 : 0.5); I.kalimba(c, o, at, m, 0.07, last ? 1.3 : 0.6); });
        if (k.ch >= 4) k.chord(4).concat(k.root + 24).forEach((m, i) => I.kalimba(c, o, t + n * 0.13 + 0.05 + i * 0.03, m, 0.08, 1.4));
      },
      tick: (c, o, t, op, k) => { hiss(c, o, t, { d: 0.04, f: 3600, q: 1.5, g: 0.05 }); hiss(c, o, t + 0.05, { d: 0.05, f: 3200, q: 1.5, g: 0.04 }); const s = [4, 5, 7, 12][clamp(k.idx, 0, 3)]; I.marimba(c, o, t + 0.04, k.root + s, 0.15, 0.6); if (k.idx >= 3) [0, 4, 7].forEach((m, i) => I.kalimba(c, o, t + 0.1 + i * 0.04, k.root + 12 + m, 0.07, 1.2)); },
      block: (c, o, t, op, k) => { I.wood(c, o, t, 220, 0.12); I.felt(c, o, t, 0.2); const s = [0, 4, 7, 9, 12, 14][clamp(k.idx, 0, 5)]; I.marimba(c, o, t + 0.02, k.root + s, 0.14, 0.6); if (k.count && k.idx >= k.count - 1) [0, 4, 7, 12, 16].forEach((m, i) => I.marimba(c, o, t + 0.18 + i * 0.045, k.root + m, 0.12, 0.8)); },
      power: (c, o, t, op, k) => { tone(c, o, t, { f: 300, f2: 900, glide: 0.25, d: 0.3, g: 0.06, a: 0.02 }); const ch = k.chord(); I.kalimba(c, o, t + 0.16, ch[k.idx % 3] + 12, 0.11, 1); I.glock(c, o, t + 0.24, ch[(k.idx + 2) % 3] + 24, 0.04, 0.7); },
      score: (c, o, t) => I.wood(c, o, t, 2000, 0.04),
      lock: (c, o, t) => I.wood(c, o, t, 1500, 0.06),
      decode: (c, o, t) => { for (let i = 0; i < 3; i++) I.wood(c, o, t + i * 0.05, 1800 + i * 200, 0.025); },
      slice: (c, o, t) => I.whoosh(c, o, t, 0.18, 1800, 900, 0.03),
      degauss: (c, o, t) => I.whoosh(c, o, t, 0.4, 300, 700, 0.04),
      feed: (c, o, t) => { for (let i = 0; i < 3; i++) I.wood(c, o, t + i * 0.04, 900, 0.03); },
      powerOn: (c, o, t, op, k) => { I.whoosh(c, o, t, 0.6, 300, 1500, 0.05); k.chord(0).concat(k.root + 12).forEach((m, i) => I.kalimba(c, o, t + 0.25 + i * 0.05, m, 0.08, 1.3)); },
      powerOff: (c, o, t, op, k) => { [k.root + 12, k.root + 7, k.root + 4, k.root].forEach((m, i) => I.kalimba(c, o, t + i * 0.06, m, 0.08, 0.7)); I.felt(c, o, t + 0.25, 0.1); },
      rail: (c, o, t) => { tone(c, o, t, { type: 'triangle', f: 500, f2: 1100, glide: 0.08, d: 0.1, g: 0.05, a: 0.004 }); I.wood(c, o, t + 0.1, 1318, 0.04); },
      cheer: (c, o, t, op, k) => { vocal(c, o, t, 'friendly', 'cheer', { mood: 'happy' }); const ch = k.chord(); [ch[0], ch[1], ch[2], ch[0] + 12].forEach((m, i) => I.marimba(c, o, t + 0.14 + i * 0.045, m + (k.v % 2 ? 12 : 0), 0.11, 0.7)); for (let i = 0; i < 3; i++) I.glock(c, o, t + 0.35 + i * 0.07, ch[i] + 24, 0.035, 0.6); },
      crew: (c, o, t, op, k) => { crewVoices(c, o, t, 'friendly'); [72, 76, 79, 84, 88].forEach((m, i) => I.musicbox(c, o, t + 0.5 + i * 0.09, m + 12, 0.08, 1)); [60, 67, 72].forEach((m) => I.marimba(c, o, t + 0.95, m, 0.12, 1)); }
    },
    accent: { happy: (c, o, t) => I.glock(c, o, t + 0.25, 96, 0.03, 0.5), alert: (c, o, t) => I.wood(c, o, t, 1568, 0.05) }
  };
  KIT.glass = {
    root: 74, mode: 'major', motif: [0, 7, 14, 21], room: { len: 3, rt: 2.6, bright: 0.65, pre: 0.015, wet: 0.32, hp: 300 },
    ev: {
      tap: (c, o, t, op, k) => I.tink(c, o, t, [98, 100, 102, 105][k.v % 4], 0.05),
      hover: (c, o, t, op, k) => I.tink(c, o, t, k.chord()[k.v % 3] + 24, 0.035),
      select: (c, o, t, op, k) => { const ch = k.chord(); I.glassBell(c, o, t, ch[0] + 12, 0.07, 1); I.glassBell(c, o, t + 0.05, ch[2] + 12, 0.06, 1); },
      toggleOn: (c, o, t) => I.bloop(c, o, t, 520, 0.12),
      toggleOff: (c, o, t) => I.bloop(c, o, t, 900, 0.1, false),
      next: (c, o, t, op, k) => { I.whoosh(c, o, t, 0.35, 700, 2400, 0.03); const ch = k.chord(); ch.forEach((m, i) => I.glassBell(c, o, t + 0.04 + i * 0.06, m + 12, 0.05, 1)); },
      back: (c, o, t, op, k) => { I.whoosh(c, o, t, 0.3, 2000, 600, 0.03); const ch = k.chord(); I.glassBell(c, o, t + 0.03, ch[2] + 12, 0.05, 0.9); I.glassBell(c, o, t + 0.09, ch[0] + 12, 0.05, 1); },
      open: (c, o, t, op, k) => { const ch = k.chord(); I.pad(c, o, t, ch.map((m) => m + 12), 1.1, 0.04, 'sine', 5000, 0.35); [ch[0], ch[1], ch[2], ch[0] + 12].forEach((m, i) => I.glassBell(c, o, t + 0.15 + i * 0.07, m + 12, 0.05, 1.2)); },
      close: (c, o, t, op, k) => { const ch = k.chord(); [ch[0] + 24, ch[2] + 12, ch[1] + 12, ch[0] + 12].forEach((m, i) => I.glassBell(c, o, t + i * 0.07, m, 0.05, 1)); I.whoosh(c, o, t, 0.4, 2400, 500, 0.03); },
      key: (c, o, t, op, k) => I.tink(c, o, t, k.deg(k.idx % 7) + 24, 0.04),
      warn: (c, o, t, op, k) => { I.glassBell(c, o, t, k.root + 12, 0.05, 0.6); I.glassBell(c, o, t + 0.02, k.root + 18, 0.04, 0.6); },
      lower: (c, o, t, op, k) => { const f = k.strF(587); tone(c, o, t, { f, d: 0.75, g: 0.05, a: 0.01 }); tone(c, o, t, { f: f * 2.32, d: 0.3, g: 0.015, a: 0.005 }); I.whoosh(c, o, t, 0.25, 1500, 900, 0.015); },
      ghost: (c, o, t, op, k) => { I.wineGlass(c, o, t, 98 + (k.v % 3) * 2, 0.02, 0.7); I.whoosh(c, o, t, 0.4, 2000, 1100, 0.012); },
      land: (c, o, t, op, k) => { I.tink(c, o, t, 91 + (k.v % 3), 0.07); tone(c, o, t, { f: mf(91 + (k.v % 3)) * 2.76, d: 0.08, g: 0.02 }); I.bloop(c, o, t + 0.01, 220, 0.07); },
      lift: (c, o, t) => { I.whoosh(c, o, t, 0.32, 600, 2400, 0.03); I.bloop(c, o, t + 0.12, 420, 0.06); },
      hop: (c, o, t) => { I.bloop(c, o, t, 260, 0.14); I.bloop(c, o, t + 0.07, 1100, 0.04); },
      swing: (c, o, t) => I.whoosh(c, o, t, 0.45, 500, 1300, 0.04, 0.7),
      tryOn: (c, o, t, op, k) => { I.whoosh(c, o, t, 0.25, 700, 3000, 0.035); SIG.glass(c, o, t + 0.12, k); },
      sparkle: (c, o, t, op, k) => { const ch = k.chord(); for (let i = 0; i < 6; i++) I.glassBell(c, o, t + i * 0.05 + R() * 0.03, ch[(i + k.v) % 3] + 24, 0.025, 0.5); for (let i = 0; i < 3; i++) I.bloop(c, o, t + 0.05 + i * 0.09, 900 + R() * 600, 0.03); },
      confetti: (c, o, t, op, k) => {
        const ch = k.chord(4); I.pad(c, o, t, ch, 1.8, 0.05, 'sine', 4000, 0.35);
        for (let i = 0; i < 6; i++) I.glassBell(c, o, t + 0.2 + i * 0.09, ch[i % 3] + 12 * Math.floor(i / 3), i < 3 ? 0.06 : 0.045, 1);
        for (let i = 0; i < 3; i++) I.bloop(c, o, t + 0.4 + i * 0.16, 700 + R() * 700, 0.03);
        I.glassBell(c, o, t + 0.8, k.root + 24, 0.03, 1.2);
      },
      chapter: (c, o, t, op, k) => { const n = motifRun(k, t, 0.16, (at, m, i, last) => I.glassBell(c, o, at, m + 12, 0.08, last ? 2 : 1.2)); I.pad(c, o, t, k.chord().map((m) => m), 0.6 + n * 0.25, 0.03, 'sine', 4000, 0.2); },
      tick: (c, o, t, op, k) => { const s = [4, 7, 11, 12][clamp(k.idx, 0, 3)]; I.tink(c, o, t, k.root + s + 12, 0.06); I.glassBell(c, o, t + 0.01, k.root + s + 12, 0.05, 0.9); if (k.idx >= 3) k.chord(4).forEach((m, i) => I.glassBell(c, o, t + 0.12 + i * 0.05, m + 12, 0.04, 1.4)); },
      block: (c, o, t, op, k) => { I.tink(c, o, t, 86, 0.06); I.bloop(c, o, t, 200, 0.08); const s = [0, 4, 7, 9, 12, 14][clamp(k.idx, 0, 5)]; I.glassBell(c, o, t + 0.02, k.root + s + 12, 0.07, 1.2); if (k.count && k.idx >= k.count - 1) { I.pad(c, o, t + 0.15, k.chord(4).map((m) => m + 12), 1.4, 0.04, 'sine', 5000, 0.2); [0, 7, 12, 19, 24].forEach((m, i) => I.glassBell(c, o, t + 0.2 + i * 0.06, k.root + m + 12, 0.04, 1.4)); } },
      power: (c, o, t, op, k) => { I.whoosh(c, o, t, 0.5, 400, 3000, 0.03); const ch = k.chord(); I.glassBell(c, o, t + 0.3, ch[k.idx % 3] + 12, 0.08, 1.5); I.wineGlass(c, o, t + 0.3, ch[k.idx % 3] + 24, 0.03, 1.2); },
      score: (c, o, t) => I.tink(c, o, t, 103, 0.03),
      lock: (c, o, t) => I.glassBell(c, o, t, 98, 0.05, 0.5),
      decode: (c, o, t) => { for (let i = 0; i < 3; i++) I.tink(c, o, t + i * 0.05, 100 + i * 2, 0.02); },
      slice: (c, o, t) => I.whoosh(c, o, t, 0.2, 2400, 1200, 0.025),
      degauss: (c, o, t) => I.whoosh(c, o, t, 0.5, 300, 900, 0.03),
      feed: (c, o, t) => { for (let i = 0; i < 3; i++) I.tink(c, o, t + i * 0.05, 96, 0.02); },
      powerOn: (c, o, t, op, k) => { I.whoosh(c, o, t, 0.7, 300, 2600, 0.04); k.chord(0).forEach((m, i) => I.wineGlass(c, o, t + 0.3 + i * 0.06, m + 12, 0.035, 1.6)); },
      powerOff: (c, o, t, op, k) => { k.chord(0).reverse().forEach((m, i) => I.glassBell(c, o, t + i * 0.06, m + 12, 0.04, 0.8)); I.whoosh(c, o, t, 0.5, 2400, 300, 0.03); },
      rail: (c, o, t) => { tone(c, o, t, { f: 900, f2: 1500, glide: 0.1, d: 0.15, g: 0.03, a: 0.01 }); I.tink(c, o, t + 0.12, 100, 0.025); },
      cheer: (c, o, t, op, k) => { vocal(c, o, t, 'glass', 'cheer', { mood: 'happy' }); const ch = k.chord(); [ch[0], ch[1], ch[2], ch[0] + 12].forEach((m, i) => I.glassBell(c, o, t + 0.14 + i * 0.05, m + 12 + (k.v % 2 ? 12 : 0), 0.05, 1.1)); I.bloop(c, o, t + 0.3, 1200, 0.03); },
      crew: (c, o, t, op, k) => { crewVoices(c, o, t, 'glass'); const ch = k.chord(4); I.pad(c, o, t + 0.4, ch.map((m) => m + 12), 1.6, 0.04, 'sine', 5000, 0.2); ch.concat(ch[0] + 12).forEach((m, i) => I.glassBell(c, o, t + 0.5 + i * 0.07, m + 12, 0.05, 1.4)); }
    },
    accent: { happy: (c, o, t) => I.bloop(c, o, t + 0.2, 1100, 0.03) }
  };
  KIT.basic = {
    root: 72, mode: 'major', motif: [4, 7, 11, 14], room: { len: 0.5, rt: 0.35, bright: 0.5, wet: 0.05 },
    ev: {
      tap: (c, o, t, op, k) => I.click(c, o, t, 0.05, 2200 + (k.v % 3) * 200),
      hover: (c, o, t) => tone(c, o, t, { f: 1800, d: 0.03, g: 0.012, a: 0.003 }),
      select: (c, o, t) => { I.sine(c, o, t, 84, 0.06, 0.09); I.sine(c, o, t + 0.07, 91, 0.06, 0.14); },
      toggleOn: (c, o, t) => { I.sine(c, o, t, 84, 0.05, 0.06); I.sine(c, o, t + 0.05, 88, 0.05, 0.08); },
      toggleOff: (c, o, t) => { I.sine(c, o, t, 88, 0.05, 0.06); I.sine(c, o, t + 0.05, 84, 0.05, 0.08); },
      next: (c, o, t) => tone(c, o, t, { f: 880, f2: 1320, glide: 0.06, d: 0.11, g: 0.06, a: 0.005 }),
      back: (c, o, t) => tone(c, o, t, { f: 1320, f2: 880, glide: 0.06, d: 0.11, g: 0.06, a: 0.005 }),
      open: (c, o, t) => { I.sine(c, o, t, 79, 0.05, 0.4, 0.02); I.sine(c, o, t + 0.06, 84, 0.05, 0.45, 0.02); },
      close: (c, o, t) => { I.sine(c, o, t, 84, 0.05, 0.35, 0.02); I.sine(c, o, t + 0.06, 79, 0.05, 0.4, 0.02); },
      key: (c, o, t, op, k) => { I.click(c, o, t, 0.035, 2000 + (k.idx % 5) * 120); },
      warn: (c, o, t) => { I.sine(c, o, t, 76, 0.06, 0.12); I.sine(c, o, t + 0.13, 75, 0.06, 0.16); },
      lower: (c, o, t, op, k) => { I.click(c, o, t, 0.04, 1600); tone(c, o, t, { f: k.strF(500), f2: k.strF(500) * 0.84, d: 0.12, g: 0.04 }); },
      ghost: (c, o, t) => I.click(c, o, t, 0.02, 2400),
      land: (c, o, t, op, k) => { tone(c, o, t, { f: 640 + (k.v % 3) * 40, f2: 520, d: 0.05, g: 0.08, a: 0.001 }); I.click(c, o, t, 0.03, 1800); },
      lift: (c, o, t) => tone(c, o, t, { f: 500, f2: 900, glide: 0.1, d: 0.12, g: 0.04 }),
      hop: (c, o, t) => tone(c, o, t, { f: 600, f2: 800, d: 0.08, g: 0.04 }),
      swing: (c, o, t) => I.whoosh(c, o, t, 0.35, 700, 1000, 0.02),
      tryOn: (c, o, t, op, k) => { I.click(c, o, t, 0.04, 2400); SIG.basic(c, o, t + 0.06, k); },
      sparkle: (c, o, t) => { I.sine(c, o, t, 96, 0.03, 0.15); I.sine(c, o, t + 0.06, 100, 0.03, 0.18); },
      confetti: (c, o, t) => { [72, 76, 79, 84, 88].forEach((m, i) => I.sine(c, o, t + i * 0.09, m, 0.06, 0.5, 0.01)); I.sine(c, o, t + 0.5, 84, 0.05, 1.1, 0.02); I.sine(c, o, t + 0.5, 91, 0.05, 1.1, 0.02); I.sine(c, o, t + 0.5, 96, 0.03, 1.1, 0.02); },
      chapter: (c, o, t, op, k) => { const n = motifRun(k, t, 0.14, (at, m, i, last) => I.sine(c, o, at, m + 12, 0.07, last ? 0.6 : 0.2, 0.008)); if (k.ch >= 4) [72, 76, 79, 84].forEach((m) => I.sine(c, o, t + n * 0.14, m, 0.04, 1, 0.02)); },
      tick: (c, o, t, op, k) => { I.click(c, o, t, 0.03, 2600); const s = [4, 7, 11, 12][clamp(k.idx, 0, 3)]; I.sine(c, o, t + 0.01, k.root + s + 12, 0.06, k.idx >= 3 ? 0.5 : 0.18); if (k.idx >= 3) I.sine(c, o, t + 0.08, k.root + 19, 0.05, 0.5); },
      block: (c, o, t, op, k) => { tone(c, o, t, { f: 600, f2: 480, d: 0.05, g: 0.07, a: 0.001 }); const s = [0, 4, 7, 9, 12, 14][clamp(k.idx, 0, 5)]; I.sine(c, o, t + 0.02, k.root + s + 12, 0.06, 0.2); if (k.count && k.idx >= k.count - 1) { I.sine(c, o, t + 0.15, 84, 0.05, 0.8, 0.01); I.sine(c, o, t + 0.15, 91, 0.05, 0.8, 0.01); } },
      power: (c, o, t, op, k) => { tone(c, o, t, { f: 400, f2: 800, glide: 0.15, d: 0.2, g: 0.04 }); I.sine(c, o, t + 0.14, k.chord()[k.idx % 3] + 12, 0.06, 0.4); },
      score: (c, o, t) => I.click(c, o, t, 0.03, 2800),
      lock: (c, o, t) => { I.click(c, o, t, 0.04, 2400); I.sine(c, o, t + 0.01, 93, 0.03, 0.08); },
      decode: (c, o, t) => { for (let i = 0; i < 3; i++) I.click(c, o, t + i * 0.04, 0.02, 2400 + i * 300); },
      slice: (c, o, t) => { I.click(c, o, t, 0.03, 2000); I.click(c, o, t + 0.03, 0.03, 1600); },
      degauss: (c, o, t) => I.click(c, o, t, 0.03, 1200),
      feed: (c, o, t) => I.click(c, o, t, 0.03, 1800),
      powerOn: (c, o, t) => { I.sine(c, o, t, 72, 0.04, 0.6, 0.05); I.sine(c, o, t + 0.08, 79, 0.04, 0.6, 0.05); },
      powerOff: (c, o, t) => { I.sine(c, o, t, 79, 0.04, 0.4, 0.02); I.sine(c, o, t + 0.08, 72, 0.04, 0.5, 0.02); },
      rail: (c, o, t) => tone(c, o, t, { f: 700, f2: 900, d: 0.07, g: 0.03 }),
      cheer: (c, o, t) => { vocal(c, o, t, 'basic', 'cheer', { mood: 'happy' }); I.sine(c, o, t + 0.12, 84, 0.06, 0.14); I.sine(c, o, t + 0.2, 91, 0.06, 0.35); },
      crew: (c, o, t) => { crewVoices(c, o, t, 'basic'); [72, 76, 79, 84].forEach((m, i) => I.sine(c, o, t + 0.5 + i * 0.06, m, 0.05, 1, 0.01)); }
    },
    accent: {}
  };
  KIT.phosphor = {
    root: 72, mode: 'major', motif: [0, 4, 7, 12], room: { len: 0.3, rt: 0.18, bright: 0.5, wet: 0.04 },
    ev: {
      tap: (c, o, t, op, k) => { I.chip(c, o, t, [96, 95, 98][k.v % 3], 0.025, 0.05, 0.5); hiss(c, o, t, { d: 0.004, f: 2000, q: 3, g: 0.04 }); },
      hover: (c, o, t, op, k) => tone(c, o, t, { wave: pulse(c, 0.25), f: mf(96 + (k.v % 2) * 3), d: 0.018, g: 0.025, a: 0.001, lp: 4500, hold: 0.012 }),
      select: (c, o, t) => { I.chip(c, o, t, 84, 0.045, 0.06); I.chip(c, o, t + 0.05, 91, 0.06, 0.06); },
      toggleOn: (c, o, t) => I.chip(c, o, t, 76, 0.07, 0.05, 0.5, 88),
      toggleOff: (c, o, t) => I.chip(c, o, t, 88, 0.07, 0.05, 0.5, 76),
      next: (c, o, t) => { [72, 76, 79, 84].forEach((m, i) => I.chip(c, o, t + i * 0.035, m, 0.04, 0.05)); },
      back: (c, o, t) => { I.chip(c, o, t, 79, 0.04, 0.05); I.chip(c, o, t + 0.04, 72, 0.05, 0.05); },
      open: (c, o, t) => { hiss(c, o, t, { d: 0.005, f: 1800, q: 3, g: 0.08 }); tone(c, o, t, { f: 110, f2: 55, d: 0.16, g: 0.16, a: 0.002 }); hiss(c, o, t + 0.01, { d: 0.2, f: 2600, f2: 1500, q: 0.5, g: 0.025 }); [72, 79, 84].forEach((m, i) => I.chip(c, o, t + 0.12 + i * 0.04, m, 0.05, 0.05, 0.5)); },
      close: (c, o, t) => crtOff(c, o, t, 0.8),
      key: (c, o, t, op, k) => { I.chip(c, o, t, 91 + [0, 2, 4, 7, 9][k.idx % 5], 0.02, 0.03, 0.5); hiss(c, o, t, { d: 0.003, f: 2600, q: 3, g: 0.03 }); },
      warn: (c, o, t) => { I.chip(c, o, t, 45, 0.09, 0.07, 0.5); I.chip(c, o, t + 0.12, 45, 0.13, 0.07, 0.5); },
      lower: (c, o, t, op, k) => { const f = k.strF(392); tone(c, o, t, { wave: pulse(c, 0.25), f, f2: f * 0.5, glide: 0.08, d: 0.1, g: 0.06, a: 0.001, lp: 5000 }); hiss(c, o, t, { d: 0.006, f: 3000, q: 2, g: 0.03 }); },
      ghost: (c, o, t) => I.tri(c, o, t, 84, 0.06, 0.04, 79),
      land: (c, o, t) => { tone(c, o, t, { type: 'triangle', f: 320, f2: 70, glide: 0.08, d: 0.1, g: 0.14, a: 0.001 }); I.crunch(c, o, t, 0.05, 0.06, 1200); },
      lift: (c, o, t) => I.chip(c, o, t, 60, 0.12, 0.05, 0.25, 84),
      hop: (c, o, t) => I.chip(c, o, t, 67, 0.14, 0.06, 0.5, 86),
      swing: (c, o, t) => hiss(c, o, t, { d: 0.14, f: 2600, f2: 900, q: 0.9, g: 0.04, a: 0.03 }),
      tryOn: (c, o, t, op, k) => { tone(c, o, t, { wave: pulse(c, 0.25), f: mf(84), f2: mf(96), glide: 0.12, d: 0.12, g: 0.04, vib: [18, 60] }); SIG.phosphor(c, o, t + 0.12, k); },
      sparkle: (c, o, t, op, k) => { [0, 4, 7, 12, 16, 19].forEach((m, i) => I.chip(c, o, t + i * 0.03, k.root + 24 + m, 0.03, 0.03, 0.125)); },
      confetti: (c, o, t, op, k) => {
        const lead = [[79, 0.09], [84, 0.09], [88, 0.09], [91, 0.18], [88, 0.09], [91, 0.4]], bass = [[48, 0.18], [55, 0.18], [60, 0.5]];
        let tt = t; lead.forEach(([m, d]) => { I.chip(c, o, tt, m, d * 0.9, 0.06, 0.25); tt += d; });
        tt = t; bass.forEach(([m, d]) => { I.tri(c, o, tt, m, d * 0.95, 0.12); tt += d; });
        [0, 0.18, 0.36, 0.54].forEach((d) => I.crunch(c, o, t + d, 0.04, 0.06, 4000));
        [0, 4, 7, 12, 16, 19, 24].forEach((m, i) => I.chip(c, o, t + 0.95 + i * 0.03, k.root + 12 + m, 0.03, 0.03, 0.125));
      },
      chapter: (c, o, t, op, k) => { const n = motifRun(k, t, 0.08, (at, m, i, last) => { I.chip(c, o, at, m + 12, last ? 0.18 : 0.07, 0.06, 0.25); I.chip(c, o, at + 0.04, m + 12, last ? 0.12 : 0.05, 0.02, 0.25); }); if (k.ch >= 4) [60, 64, 67, 72].forEach((m, i) => I.tri(c, o, t + n * 0.08 + i * 0.02, m, 0.4, 0.06)); },
      tick: (c, o, t, op, k) => { const up = clamp(k.idx, 0, 3) * 2; I.chip(c, o, t, 83 + up, 0.05, 0.05, 0.5); I.chip(c, o, t + 0.05, 88 + up, k.idx >= 3 ? 0.25 : 0.12, 0.05, 0.5); if (k.idx >= 3) I.chip(c, o, t + 0.12, 95, 0.2, 0.04, 0.25); },
      block: (c, o, t, op, k) => { tone(c, o, t, { type: 'triangle', f: 260, f2: 60, glide: 0.08, d: 0.1, g: 0.13, a: 0.001 }); I.crunch(c, o, t, 0.04, 0.05, 1500); const s = [0, 4, 7, 9, 12, 14][clamp(k.idx, 0, 5)]; I.chip(c, o, t + 0.03, k.root + s, 0.08, 0.05); if (k.count && k.idx >= k.count - 1) [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => I.chip(c, o, t + 0.15 + i * 0.04, m, 0.06, 0.04)); },
      power: (c, o, t, op, k) => { const a = k.root - 12 + (k.idx % 4) * 2; for (let i = 0; i < 12; i++) I.chip(c, o, t + i * 0.025, a + i * 2, 0.03, 0.04, 0.25); I.tri(c, o, t, 48 + (k.idx % 4) * 2, 0.3, 0.08); },
      score: (c, o, t) => { for (let i = 0; i < 6; i++) I.chip(c, o, t + i * 0.06, 96 + (i % 2) * 3, 0.02, 0.03, 0.5); },
      lock: (c, o, t) => { I.chip(c, o, t, 96, 0.03, 0.04); I.chip(c, o, t + 0.03, 103, 0.05, 0.04); },
      decode: (c, o, t) => { for (let i = 0; i < 8; i++) I.chip(c, o, t + i * 0.025, 90 + Math.floor(R() * 14), 0.02, 0.02, 0.125); },
      slice: (c, o, t) => { I.crunch(c, o, t, 0.06, 0.06, 3000); I.chip(c, o, t + 0.02, 40, 0.05, 0.04, 0.5, 70); },
      // the degauss coil: a deep "thoom" that wobbles as the field swings out (sines only, so it stays round)
      degauss: (c, o, t) => {
        tone(c, o, t, { f: 110, f2: 60, d: 0.7, g: 0.08, a: 0.005 });
        const e = env(c, t, 0.05, 0.01, 0.9), am = c.createGain(); am.gain.value = 0.6; am.connect(e); e.connect(o);
        [[120, 1], [240, 0.4]].forEach(([f, gg]) => { const s = c.createOscillator(), sg = c.createGain(); s.frequency.value = f; sg.gain.value = gg; s.connect(sg); sg.connect(am); s.start(t); s.stop(t + 1); });
        const l = c.createOscillator(), lg = c.createGain(); l.frequency.setValueAtTime(9, t); l.frequency.exponentialRampToValueAtTime(3, t + 0.9); lg.gain.value = 0.35; l.connect(lg); lg.connect(am.gain); l.start(t); l.stop(t + 1);
        tone(c, o, t + 0.02, { f: 1250, d: 0.6, g: 0.012, a: 0.01, vib: [7, 50] });
        [[360, 0.08], [540, 0.04]].forEach(([f, gg]) => tone(c, o, t, { f, f2: f * 0.8, d: 0.75, g: gg, a: 0.01, vib: [6, 40] }));
      },
      feed: (c, o, t) => hiss(c, o, t, { d: 0.004, f: 1800, q: 3, g: 0.05 }),
      powerOn: (c, o, t) => crtOn(c, o, t),
      powerOff: (c, o, t) => crtOff(c, o, t, 1),
      rail: (c, o, t) => I.chip(c, o, t, 79, 0.06, 0.03, 0.25, 86),
      cheer: (c, o, t, op, k) => { vocal(c, o, t, 'phosphor', 'cheer', { mood: 'happy' }); [72, 76, 79, 84, 88].forEach((m, i) => I.chip(c, o, t + 0.12 + i * 0.03, m + (k.v % 2 ? 12 : 0), 0.04, 0.05, 0.25)); I.crunch(c, o, t + 0.12, 0.04, 0.05, 4000); },
      crew: (c, o, t, op, k) => { crewVoices(c, o, t, 'phosphor'); KIT.phosphor.ev.confetti(c, o, t + 0.45, op, k); }
    },
    accent: {}
  };
  // the tube switching on: a relay, a thump, a burst of static settling, the tube warming up in a soft swell
  function crtOn(c, o, t) {
    I.clack(c, o, t, 0.08, 1.3);
    tone(c, o, t + 0.02, { f: 90, f2: 48, d: 0.24, g: 0.07, a: 0.003 });
    hiss(c, o, t + 0.03, { d: 0.32, f: 2600, f2: 1400, q: 0.5, g: 0.04, a: 0.004 });
    for (let i = 0; i < 6; i++) hiss(c, o, t + 0.05 + R() * 0.3, { d: 0.004, f: 3000, q: 2, g: 0.035 });
    tone(c, o, t + 0.12, { type: 'triangle', f: 120, f2: 180, d: 0.9, g: 0.03, a: 0.35, lp: 700 });
    tone(c, o, t + 0.02, { f: 420, f2: 260, d: 0.22, g: 0.09, a: 0.003 }); tone(c, o, t + 0.12, { f: 880, f2: 990, d: 0.7, g: 0.012, a: 0.25 });
  }
  function crtOff(c, o, t, k) {
    tone(c, o, t, { f: 1200, f2: 60, glide: 0.35, d: 0.4, g: 0.06 * k, a: 0.002 });
    hiss(c, o, t, { d: 0.005, f: 1800, q: 3, g: 0.06 * k });
    hiss(c, o, t + 0.05, { d: 0.4, f: 3000, type: 'highpass', g: 0.02 * k, a: 0.01 });
  }
  /* Retro Light, the Paper Teletype: everything is the machine and its paper. Keys snap, the platen ratchets, the
     carriage returns with a zip, the margin bell rings, a small motor spins up; the music is a celesta. Nothing here
     is a gated tone or a low sawtooth: on paper those read as a speaker breaking up. */
  KIT.teletype = {
    root: 79, mode: 'major', motif: [0, 2, 4, 7], room: { len: 0.45, rt: 0.3, bright: 0.6, er: true, wet: 0.08 },
    ev: {
      tap: (c, o, t, op, k) => I.clack(c, o, t, 0.12, 0.95 + (k.v % 3) * 0.05),
      hover: (c, o, t, op, k) => { hiss(c, o, t, { d: 0.004, f: 3200 + (k.v % 3) * 300, q: 2.5, g: 0.022 }); tone(c, o, t, { f: 1400, d: 0.01, g: 0.006, a: 0.0006 }); },
      select: (c, o, t, op, k) => { I.clack(c, o, t, 0.12); I.celesta(c, o, t + 0.03, k.chord()[2] + 12, 0.05, 0.6); },
      toggleOn: (c, o, t) => { I.clack(c, o, t, 0.1, 0.9); I.clack(c, o, t + 0.045, 0.08, 1.15); },
      toggleOff: (c, o, t) => { I.clack(c, o, t, 0.08, 1.1); I.clack(c, o, t + 0.045, 0.1, 0.8); },
      next: (c, o, t) => { cr(c, o, t, 0.16); I.ratchet(c, o, t + 0.17, 2, 0.03, 0.05); },
      back: (c, o, t) => { I.ratchet(c, o, t, 2, 0.035, 0.06, 0.85); I.clack(c, o, t + 0.08, 0.08, 0.85); },
      open: (c, o, t) => { I.motor(c, o, t, 0.42, true, 0.04); I.ratchet(c, o, t + 0.3, 3, 0.035, 0.045); I.clack(c, o, t + 0.44, 0.06, 0.8); },
      close: (c, o, t) => { I.motor(c, o, t, 0.4, false, 0.035); I.clack(c, o, t + 0.02, 0.09, 0.8); },
      key: (c, o, t, op, k) => I.clack(c, o, t, 0.1, 0.92 + ((k.idx * 7 + k.v) % 5) * 0.04),
      warn: (c, o, t) => I.ding(c, o, t, 0.1, 93),
      lower: (c, o, t, op, k) => { I.ratchet(c, o, t, 3 + Math.round(clamp(k.len || 150, 0, 400) / 120), 0.028, 0.05); tone(c, o, t, { f: 150, f2: 100, d: 0.05, g: 0.06, a: 0.001 }); },
      ghost: (c, o, t) => { I.ratchet(c, o, t, 1, 0.03, 0.035); hiss(c, o, t, { d: 0.18, f: 2600, q: 0.8, g: 0.008, a: 0.06 }); },
      land: (c, o, t, op, k) => { tone(c, o, t, { f: 130 + (k.v % 3) * 10, f2: 85, d: 0.07, g: 0.12, a: 0.001 }); I.clack(c, o, t, 0.07, 0.7); },
      lift: (c, o, t) => I.ratchet(c, o, t, 4, 0.022, 0.045, 1.2),
      hop: (c, o, t) => { hiss(c, o, t, { d: 0.03, f: 2200, f2: 3800, q: 2, g: 0.04 }); I.click(c, o, t, 0.04, 2600); },
      swing: (c, o, t) => hiss(c, o, t, { d: 0.25, f: 1500, f2: 3000, q: 0.9, g: 0.025, a: 0.08, pink: true }),
      tryOn: (c, o, t, op, k) => { hiss(c, o, t, { d: 0.1, f: 2500, q: 0.8, g: 0.04, a: 0.02, pink: true }); hiss(c, o, t + 0.09, { d: 0.08, f: 3500, q: 0.8, g: 0.03, a: 0.02, pink: true }); SIG.teletype(c, o, t + 0.12, k); },
      sparkle: (c, o, t, op, k) => { const ch = k.chord(); for (let i = 0; i < 4; i++) I.celesta(c, o, t + i * 0.06 + R() * 0.02, ch[(i + k.v) % 3] + 12, 0.035, 0.5); },
      confetti: (c, o, t, op, k) => {
        for (let i = 0; i < 8; i++) I.clack(c, o, t + i * 0.05 + R() * 0.012, 0.08, 0.9 + R() * 0.2);
        cr(c, o, t + 0.42, 0.16); I.ding(c, o, t + 0.6, 0.1, 93);
        [[79, 0.1], [81, 0.1], [83, 0.1], [86, 0.2], [91, 0.5]].reduce((tt, [m, d]) => { I.celesta(c, o, tt, m, 0.09, 0.9); return tt + d; }, t + 0.72);
        tear(c, o, t + 1.45, 0.38);
      },
      chapter: (c, o, t, op, k) => { feed(c, o, t); const n = motifRun(k, t + 0.25, 0.12, (at, m, i, last) => I.celesta(c, o, at, m + 12, 0.09, last ? 1 : 0.5)); if (k.ch >= 4) I.ding(c, o, t + 0.25 + n * 0.12, 0.08, 93); },
      tick: (c, o, t, op, k) => { I.clack(c, o, t, 0.11); I.clack(c, o, t + 0.045, 0.07, 1.1); const s = [0, 2, 4, 7][clamp(k.idx, 0, 3)]; I.celesta(c, o, t + 0.02, k.root + s, 0.08, 0.6); if (k.idx >= 3) { cr(c, o, t + 0.12, 0.14); I.ding(c, o, t + 0.27, 0.08, 93); } },
      block: (c, o, t, op, k) => { I.clack(c, o, t, 0.13, 0.7); tone(c, o, t, { f: 120, f2: 80, d: 0.06, g: 0.1, a: 0.001 }); const s = [0, 2, 4, 5, 7, 9][clamp(k.idx, 0, 5)]; I.celesta(c, o, t + 0.02, k.root + s, 0.08, 0.6); if (k.count && k.idx >= k.count - 1) { cr(c, o, t + 0.12, 0.14); I.ding(c, o, t + 0.28, 0.09, 93); } },
      power: (c, o, t, op, k) => { I.motor(c, o, t, 0.4, true, 0.035); I.celesta(c, o, t + 0.3, k.chord()[k.idx % 3] + 12, 0.08, 0.8); },
      score: (c, o, t) => { for (let i = 0; i < 4; i++) I.clack(c, o, t + i * 0.05, 0.06, 1.1); },
      lock: (c, o, t) => I.clack(c, o, t, 0.1, 1.05),
      // a line printed: the head runs its length in light ticks
      decode: (c, o, t, op) => I.pins(c, o, t, clamp(Math.round((op.len || 12) / 2), 4, 14), 0.045),
      slice: (c, o, t) => tear(c, o, t, 0.14),
      degauss: (c, o, t) => I.motor(c, o, t, 0.25, true, 0.02),
      feed: (c, o, t) => feed(c, o, t),
      powerOn: (c, o, t) => { I.motor(c, o, t, 0.6, true, 0.045); feed(c, o, t + 0.45); I.clack(c, o, t + 0.95, 0.055, 0.75); },
      powerOff: (c, o, t) => { feed(c, o, t); tear(c, o, t + 0.22, 0.3); I.motor(c, o, t + 0.1, 0.5, false, 0.03); },
      rail: (c, o, t) => { hiss(c, o, t, { d: 0.12, f: 1300, f2: 2600, q: 2, g: 0.025, a: 0.02 }); I.ratchet(c, o, t + 0.04, 2, 0.04, 0.04); },
      cheer: (c, o, t, op, k) => { vocal(c, o, t, 'teletype', 'cheer', { mood: 'happy' }); const ch = k.chord(); ch.forEach((m, i) => I.celesta(c, o, t + 0.14 + i * 0.045, m + 12, 0.07, 0.8)); I.ding(c, o, t + 0.32, 0.06, 93 + (k.v % 2) * 2); },
      crew: (c, o, t, op, k) => { crewVoices(c, o, t, 'teletype'); [[79, 0.1], [83, 0.1], [86, 0.1], [91, 0.5]].reduce((tt, [m, d]) => { I.celesta(c, o, tt, m, 0.09, 0.9); return tt + d; }, t + 0.5); I.ding(c, o, t + 0.85, 0.09, 93); }
    },
    accent: { alert: (c, o, t) => I.ding(c, o, t + 0.05, 0.05, 98) }
  };
  // the platen turning a line or two: its ratchet, the paper sliding over the bail, the bail settling
  function feed(c, o, t) { I.ratchet(c, o, t, 5, 0.032, 0.06); hiss(c, o, t, { d: 0.2, f: 2400, q: 0.7, g: 0.012, a: 0.05, pink: true }); tone(c, o, t + 0.18, { f: 210, f2: 150, d: 0.04, g: 0.06, a: 0.001 }); }
  // the carriage return: the carriage zips back along its rail and stops against the margin
  function cr(c, o, t, d) { hiss(c, o, t, { d, f: 1300, f2: 3200, q: 1.6, g: 0.075, a: d * 0.35, pink: true }); I.ratchet(c, o, t, Math.max(2, Math.round(d / 0.038)), 0.038, 0.018, 1.25); I.clack(c, o, t + d, 0.07, 0.75); }
  // paper torn off against the bar: fibres giving way unevenly (irregular grains, never a tremolo)
  function tear(c, o, t, d) {
    const n = Math.round(d / 0.007);
    for (let i = 0; i < n; i++) { const tt = t + (i / n) * d + R() * 0.004, k = 0.5 + R() * 0.5; hiss(c, o, tt, { d: 0.004 + R() * 0.006, f: 2200 + R() * 2200, q: 1.2, g: 0.05 * k * (0.6 + 0.4 * Math.sin((i / n) * Math.PI)) }); }
    hiss(c, o, t, { d, f: 3000, q: 0.6, g: 0.012, a: d * 0.2, pink: true });
  }
  KIT.nier = {
    root: 69, mode: 'minor', motif: [12, 15, 19, 22], room: { len: 1.6, rt: 1.2, bright: 0.3, pre: 0.03, wet: 0.24 },
    ev: {
      tap: (c, o, t) => I.ntick(c, o, t, 2640, 0.05),
      hover: (c, o, t, op, k) => I.ntick(c, o, t, [2640, 2349, 2794][k.v % 3], 0.035, 0.03),
      select: (c, o, t) => { I.sine(c, o, t, 88, 0.06, 0.12, 0.004); I.sine(c, o, t + 0.06, 93, 0.06, 0.9, 0.004); I.ntick(c, o, t, 2640, 0.03); },
      toggleOn: (c, o, t) => { I.ntick(c, o, t, 2093, 0.04); I.ntick(c, o, t + 0.04, 2640, 0.04); },
      toggleOff: (c, o, t) => { I.ntick(c, o, t, 2640, 0.03); tone(c, o, t + 0.04, { f: 1760, d: 0.04, g: 0.03, a: 0.004, lp: 1800 }); },
      next: (c, o, t) => { I.sine(c, o, t, 88, 0.05, 0.06, 0.004); I.sine(c, o, t + 0.05, 93, 0.05, 0.16, 0.004); I.whoosh(c, o, t, 0.25, 800, 2000, 0.02); },
      back: (c, o, t) => { tone(c, o, t, { f: 880, d: 0.06, g: 0.05, a: 0.004, lp: 1800 }); tone(c, o, t + 0.06, { f: 659, d: 0.12, g: 0.05, a: 0.004, lp: 1800 }); },
      open: (c, o, t) => { I.hum(c, o, t, 196, 392, 0.5, 0.03); for (let i = 0; i < 4; i++) I.ntick(c, o, t + 0.1 + i * 0.03, 2093 + i * 180, 0.03); },
      close: (c, o, t) => { I.hum(c, o, t, 392, 196, 0.45, 0.028, 2600, 400); I.ntick(c, o, t, 2349, 0.03); },
      key: (c, o, t, op, k) => I.ntick(c, o, t, 3000 + (k.v % 3) * 200, 0.02, 0.02),
      // denied: two low, clean steps down and a tick (NieR's own refusal is quiet, not a buzzer)
      warn: (c, o, t) => { I.ntick(c, o, t, 1760, 0.035); tone(c, o, t + 0.01, { f: 440, d: 0.09, g: 0.07, a: 0.004, lp: 1200 }); tone(c, o, t + 0.1, { f: 330, d: 0.16, g: 0.07, a: 0.004, lp: 1200 }); },
      lower: (c, o, t) => { tone(c, o, t, { f: 4200, d: 0.02, g: 0.02, a: 0.001 }); tone(c, o, t, { f: 2100, d: 0.04, g: 0.02, a: 0.001 }); tone(c, o, t + 0.02, { f: 1760, f2: 1318, d: 0.05, g: 0.02 }); },
      ghost: (c, o, t) => { hiss(c, o, t, { d: 0.3, f: 3000, q: 2, g: 0.01, a: 0.1 }); I.ntick(c, o, t + 0.1, 2349, 0.02); },
      land: (c, o, t) => { I.ntick(c, o, t, 1760, 0.03); tone(c, o, t + 0.005, { f: 880, f2: 700, d: 0.05, g: 0.03, a: 0.002 }); },
      lift: (c, o, t) => { I.ntick(c, o, t, 1760, 0.03); I.ntick(c, o, t + 0.04, 2349, 0.03); I.whoosh(c, o, t, 0.25, 900, 2400, 0.012); },
      hop: (c, o, t) => { I.ntick(c, o, t, 2093, 0.025); I.ntick(c, o, t + 0.03, 2640, 0.02); },
      swing: (c, o, t) => hiss(c, o, t, { d: 0.5, f: 900, q: 0.6, type: 'lowpass', g: 0.015, a: 0.2, pink: true }),
      tryOn: (c, o, t, op, k) => { for (let i = 0; i < 6; i++) I.ntick(c, o, t + i * 0.022, 2000 + R() * 2000, 0.015, 0.02); SIG.nier(c, o, t + 0.14, k); },
      sparkle: (c, o, t) => { for (let i = 0; i < 4; i++) I.ntick(c, o, t + i * 0.05 + R() * 0.02, 2400 + R() * 1400, 0.025, 0.04); },
      confetti: (c, o, t, op, k) => { I.pad(c, o, t, [69, 72, 76, 79], 2.8, 0.05, 'sine', 2400, 0.7); [81, 88, 93].forEach((m, i) => I.glock(c, o, t + 0.3 + i * 0.4, m, 0.05, 2)); tone(c, o, t, { f: 110, d: 2.4, g: 0.04, a: 0.6, hold: 1.2 }); },
      chapter: (c, o, t, op, k) => {
        for (let i = 0; i < 4; i++) I.ntick(c, o, t + i * 0.03, 2093 + i * 180, 0.03);
        I.pad(c, o, t + 0.1, k.chord(), 1.4, 0.035, 'sine', 1800, 0.3);
        const n = motifRun(k, t + 0.15, 0.2, (at, m, i, last) => I.glock(c, o, at, m, 0.05, last ? 2 : 1.2));
        if (k.ch >= 4) I.pad(c, o, t + 0.15 + n * 0.2, k.chord(4), 2, 0.04, 'sine', 2400, 0.6);
      },
      tick: (c, o, t, op, k) => { I.ntick(c, o, t, 2640, 0.04); const s = [0, 2, 3, 7][clamp(k.idx, 0, 3)]; I.sine(c, o, t + 0.01, k.root + 12 + s, 0.05, 0.25, 0.004); if (k.idx >= 3) { I.sine(c, o, t + 0.1, 88, 0.05, 0.07, 0.004); I.sine(c, o, t + 0.16, 93, 0.05, 0.3, 0.004); } },
      block: (c, o, t, op, k) => { tone(c, o, t, { f: 660, f2: 520, d: 0.05, g: 0.04, a: 0.002 }); I.ntick(c, o, t, 1760, 0.03); const s = [0, 2, 3, 5, 7, 9][clamp(k.idx, 0, 5)]; I.sine(c, o, t + 0.02, k.root + 12 + s, 0.05, 0.3, 0.004); if (k.count && k.idx >= k.count - 1) KIT.nier.ev.chapter(c, o, t + 0.15, op, Object.assign({}, k, { ch: 2 })); },
      power: (c, o, t, op, k) => { for (let i = 0; i < 6; i++) I.ntick(c, o, t + i * 0.025, 2200 + R() * 1600, 0.02, 0.02); I.hum(c, o, t + 0.05, 196, 392, 0.5, 0.025); I.glock(c, o, t + 0.3, k.chord()[k.idx % 3] + 12, 0.05, 1.5); },
      score: (c, o, t) => I.ntick(c, o, t, 2640, 0.02),
      lock: (c, o, t) => { [0, 0.07, 0.11].forEach((d, i) => I.ntick(c, o, t + d, 2093 + i * 270, 0.04)); I.sine(c, o, t + 0.15, 88, 0.05, 0.06, 0.004); I.sine(c, o, t + 0.21, 93, 0.05, 0.22, 0.004); },
      decode: (c, o, t) => { for (let i = 0; i < 14; i++) I.ntick(c, o, t + i * 0.02 + R() * 0.008, 2000 + R() * 2200, 0.015, 0.012); },
      slice: (c, o, t) => { for (let i = 0; i < 4; i++) I.glitch(c, o, t + i * 0.05 + R() * 0.01, 1400 + R() * 2600, 0.012 + R() * 0.012, 0.035); hiss(c, o, t + 0.01, { d: 0.16, f: 2400, q: 0.8, g: 0.008, a: 0.02 }); },
      degauss: (c, o, t) => { I.hum(c, o, t, 220, 165, 0.4, 0.025, 900, 400); },
      feed: (c, o, t) => { for (let i = 0; i < 3; i++) I.ntick(c, o, t + i * 0.04, 2349, 0.02); },
      powerOn: (c, o, t) => { I.hum(c, o, t, 196, 392, 0.8, 0.035); I.pad(c, o, t + 0.1, [69, 76], 1.3, 0.025, 'sine', 2400, 0.4); for (let i = 0; i < 5; i++) I.ntick(c, o, t + 0.5 + i * 0.03, 2093 + i * 160, 0.03); },
      powerOff: (c, o, t) => { I.hum(c, o, t, 392, 196, 0.5, 0.03, 2600, 400); I.ntick(c, o, t, 2349, 0.03); },
      rail: (c, o, t) => { I.ntick(c, o, t, 2349, 0.03); I.ntick(c, o, t + 0.06, 2640, 0.025); },
      cheer: (c, o, t, op, k) => { [0, 0.035, 0.07].forEach((d, i) => I.ntick(c, o, t + d, 2349 + i * 300, 0.03)); I.glock(c, o, t + 0.16, k.chord()[k.v % 3] + 24, 0.03, 0.9); },
      crew: (c, o, t, op, k) => { crewVoices(c, o, t, 'nier'); I.pad(c, o, t + 0.35, [72, 76, 81], 1.5, 0.035, 'triangle', 1800, 0.4); I.glock(c, o, t + 0.6, 93, 0.05, 1.8); }
    },
    accent: { alert: (c, o, t) => I.ntick(c, o, t, 2794, 0.04) }
  };
  function crewVoices(c, o, t, kitName) {
    const pan = (p) => { if (!c.createStereoPanner) return o; const s = c.createStereoPanner(); s.pan.value = p; s.connect(o); return s; };
    [['crown', -0.45, 0, 0], ['hardhat', 0, 0.05, 2], ['glasses', 0.45, 0.1, -1]].forEach(([v, p, d, st]) => {
      const sc = scriptFor(kitName, 'crew').map((q) => Object.assign({}, q, q.deg != null ? { deg: q.deg + Math.round(st / 2) } : { p: q.p + st, p2: q.p2 + st }));
      voice(c, pan(p), t + d, sc, kitName, { voice: v, mood: 'happy' });
    });
  }
  // the vocal one-shots are the same everywhere: the kit's voice, and its accent where it has one
  KITS.forEach((kn) => {
    ['wake', 'sleep', 'think', 'happy', 'wink', 'alert'].forEach((name) => {
      KIT[kn].ev[name] = (c, o, t, op) => { vocal(c, o, t, kn, name, { voice: op.voice, mood: MOOD[name] ? name : 'idle' }); const a = KIT[kn].accent && KIT[kn].accent[name]; if (a) a(c, o, t); };
    });
  });
  // Pip has a tip: a small rising two-note "idea", each look in its own material
  const TIP = {
    friendly: (c, o, t, op, k) => { const ch = k.chord(); I.kalimba(c, o, t, ch[1] + 12, 0.06, 0.6); I.kalimba(c, o, t + 0.09, ch[2] + 12, 0.07, 0.8); },
    glass: (c, o, t, op, k) => { const ch = k.chord(); I.tink(c, o, t, ch[1] + 12, 0.05); I.tink(c, o, t + 0.08, ch[2] + 12, 0.06); },
    basic: (c, o, t, op, k) => { const ch = k.chord(); I.sine(c, o, t, ch[1] + 12, 0.05, 0.25, 0.004); I.sine(c, o, t + 0.09, ch[2] + 12, 0.05, 0.4, 0.004); },
    phosphor: (c, o, t, op, k) => { const ch = k.chord(); [ch[0], ch[1], ch[2]].forEach((m, i) => I.chip(c, o, t + i * 0.05, m + 12, 0.05, 0.035, 0.5)); },
    teletype: (c, o, t, op, k) => { I.clack(c, o, t, 0.07, 1.1); I.celesta(c, o, t + 0.04, k.chord()[2] + 12, 0.06, 0.6); },
    nier: (c, o, t, op, k) => { I.ntick(c, o, t, 2349, 0.03); I.sine(c, o, t + 0.05, k.chord()[0] + 24, 0.045, 0.12, 0.003); I.sine(c, o, t + 0.11, k.chord()[2] + 24, 0.045, 0.3, 0.003); }
  };
  KITS.forEach((kn) => { KIT[kn].ev.tip = TIP[kn]; });
  // except a Pod thinking: the unit analysing, three dry ticks climbing (a "hmm" in NieR's flat voice read as a moan)
  KIT.nier.ev.think = (c, o, t) => { [0, 0.045, 0.09].forEach((d, i) => I.ntick(c, o, t + d, 2093 + i * 330, 0.03, 0.03)); };

  /* ---------------------------------------------------------------- loops */
  // { period(k) -> s, step(c, out, t, k, n) } for cycles; { make(c, out, t, k) -> { set(level, t), stop(t) } } for continuous
  const LOOPDEF = {
    snore: {
      period: () => 3.8,
      step(c, o, t, k) {
        const kn = k.kit;
        if (kn === 'phosphor') { hiss(c, o, t, { d: 1.2, f: 900, q: 1, g: 0.03, a: 0.5, pink: true }); [84, 81, 77].forEach((m, i) => I.chip(c, o, t + 1.6 + i * 0.28, m, 0.08, 0.025, 0.25)); return; }
        if (kn === 'teletype') { hiss(c, o, t, { d: 1.2, f: 700, f2: 1000, q: 1, g: 0.035, a: 0.5, pink: true }); hiss(c, o, t + 1.4, { d: 1.2, f: 520, f2: 360, q: 1, g: 0.03, a: 0.25, pink: true }); [91, 88, 84].forEach((m, i) => I.celesta(c, o, t + 2.7 + i * 0.22, m, 0.018, 0.5)); return; }
        // a unit on standby: a slow breath of air and a soft pulse, like its light (a low held tone here read as a hum)
        if (kn === 'nier') { hiss(c, o, t, { d: 1.6, f: 900, f2: 1300, q: 1.2, g: 0.025, a: 0.6, pink: true }); tone(c, o, t + 0.3, { f: 880, d: 1.2, g: 0.008, a: 0.5 }); I.ntick(c, o, t + 1.9, 1760, 0.012); return; }
        const br = kn === 'basic' ? 0.5 : 1;
        hiss(c, o, t, { d: 1.25, f: 700, f2: 1100, q: 1.1, g: 0.045 * br, a: 0.55, pink: true });
        hiss(c, o, t + 1.45, { d: 1.3, f: 520, f2: 340, q: 1, g: 0.04 * br, a: 0.25, pink: true });
        if (kn !== 'basic') tone(c, o, t + 1.45, { type: 'triangle', f: 150, f2: 118, d: 1.3, g: 0.025, a: 0.3, lp: 520 });
        if (kn === 'friendly') tone(c, o, t + 2.4, { f: 1400, f2: 1050, d: 0.4, g: 0.006, a: 0.12 });
        if (kn === 'glass') I.bloop(c, o, t + 2.6, 900, 0.015);
      }
    },
    work: {
      period: () => 0.75,
      step(c, o, t, k, n) {
        const kn = k.kit, alt = n % 2;
        if (kn === 'friendly') { I.wood(c, o, t, alt ? 550 : 660, 0.07); I.creak(c, o, t + 0.03, 0.015); }
        else if (kn === 'glass') { I.tink(c, o, t, alt ? 93 : 98, 0.03); hiss(c, o, t, { d: 0.2, f: 1600, q: 1, g: 0.006, a: 0.06, pink: true }); }
        else if (kn === 'basic') I.click(c, o, t, 0.04, alt ? 1800 : 2200);
        else if (kn === 'phosphor') { for (let i = 0; i < 3; i++) hiss(c, o, t + i * 0.03, { d: 0.006, f: 1500 + R() * 1000, q: 2, g: 0.05 }); I.chip(c, o, t + 0.1, alt ? 79 : 84, 0.03, 0.02, 0.5); }
        else if (kn === 'teletype') { I.pins(c, o, t, 6, 0.04, alt ? 0.9 : 1); if (!alt) I.ratchet(c, o, t + 0.24, 1, 0.03, 0.035); }
        else for (let i = 0; i < 4; i++) I.ntick(c, o, t + i * 0.035, 2000 + R() * 1500, 0.02, 0.015);
      }
    },
    // power running down Pip's strings: a soft arpeggio climbing the chord, round and round (its level is the volume)
    power: {
      steady: true,
      period: (k) => ({ basic: 0.5, nier: 0.42 }[k.kit] || 0.34),
      step(c, o, t, k, n) {
        // sixteen steps, the notes of the chord in a kit's own order (-1 a rest), so it breathes and never ticks like a clock
        const P = { friendly: [0, 1, 2, -1, 3, 2, -1, -1, 0, 2, 1, -1, 3, -1, -1, -1], glass: [3, -1, 2, -1, 1, -1, -1, 0, -1, 2, -1, -1, 3, -1, -1, -1],
          basic: [0, -1, 2, -1, -1, -1, 1, -1, 0, -1, -1, 3, -1, -1, -1, -1], phosphor: [0, 2, 1, 3, -1, -1, 0, 2, 1, 3, -1, 2, -1, -1, -1, -1],
          teletype: [0, -1, 1, 2, -1, -1, 3, -1, 0, -1, 2, -1, -1, -1, -1, -1], nier: [0, -1, -1, 2, -1, 1, -1, -1, 3, -1, -1, -1, 2, -1, -1, -1] }[k.kit];
        const i = P[n % 16]; if (i < 0) return;
        const ch = k.chord(), m = [ch[0], ch[1], ch[2], ch[0] + 12][i] + 12, kn = k.kit;
        if (kn === 'friendly') I.kalimba(c, o, t, m, 0.05, 0.6);
        else if (kn === 'glass') I.glassBell(c, o, t, m, 0.035, 0.7);
        else if (kn === 'basic') I.sine(c, o, t, m, 0.035, 0.35);
        else if (kn === 'phosphor') I.chip(c, o, t, m, 0.05, 0.03, 0.5);
        else if (kn === 'teletype') I.celesta(c, o, t, m, 0.04, 0.5);
        else { I.ntick(c, o, t, 2093 + (n % 4) * 260, 0.018); I.sine(c, o, t + 0.01, m, 0.03, 0.3, 0.004); }
      }
    },
    swing: {
      motion: true,
      make(c, o, t, k) {
        const s = c.createBufferSource(); s.buffer = k.kit === 'phosphor' ? noiseBuf(c) : pinkBuf(c); s.loop = true;
        const b = c.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = 0.8; b.frequency.value = 400; s.connect(b);
        const lp = filt(c, b, 'lowpass', k.kit === 'phosphor' ? 3000 : 2200, 0.5); lp.connect(o); s.start(t, R());
        return { set(level, tt) { b.frequency.setTargetAtTime(300 + level * 1300, tt, 0.08); }, stop(tt) { try { s.stop(tt); } catch (e) { /* stopped */ } } };
      }
    },
    /* each look's quiet music while the window is open: a short tune of its own in steady time, phrases with rests
       between them, played in the chapter's key (it moves to the chapter's chord by scale steps, so it stays in key and
       follows the story). Every note is struck and dies away: nothing is held, so nothing hums. */
    bed: {
      steady: true,
      period: (k) => SONG[k.kit].step,
      step(c, o, t, k, n) {
        const S = SONG[k.kit], bar = Math.floor(n / 8) % S.mel.length, i = n % 8, cyc = Math.floor(n / (8 * S.mel.length));
        const root = ROOTDEG[k.K.mode][k.ch], d = S.mel[bar][i], lo = S.low[bar];
        // every third time round, the tune thins to its first beats and the bass: room to breathe
        const thin = cyc % 3 === 2 && i % 4 !== 0;
        if (d != null && !thin) S.note(c, o, t, k.deg(root + d + (S.oct || 0) * 7), i === 0);
        if (i === 0 && lo != null) S.bass(c, o, t, k.deg(root + lo - 7));
        if (S.extra) S.extra(c, o, t, k, n, bar, i);
      }
    }
  };
  // the chapter chords' roots, as scale steps (so the tunes move to them and stay in key)
  const ROOTDEG = { major: [0, 3, 4, 5, 7], minor: [0, -2, 2, -1, 3] };
  // the tunes: eight bars of eight steps, scale steps above the chord's root (null a rest), a bass note per bar
  const _ = null;
  const SONG = {
    // Friendly: a music-box lullaby over a soft kalimba
    friendly: { step: 0.27,
      mel: [[4, _, 2, _, 0, _, 2, _], [4, _, 5, 4, 2, _, _, _], [4, _, 2, _, 0, _, 1, _], [2, _, 1, _, 0, _, _, _], [_, _, 4, _, 2, _, _, _], [7, _, 6, _, 4, _, 5, _], [4, _, 2, _, 4, _, _, _], [2, _, 1, _, 0, _, _, _]],
      low: [0, -3, 0, -3, 0, 0, -3, 0],
      note: (c, o, t, m, down) => I.musicbox(c, o, t, m, down ? 0.05 : 0.042, 1.2), bass: (c, o, t, m) => I.kalimba(c, o, t, m, 0.05, 1.4) },
    // Glass: glass struck in a slow, open arpeggio, a soft low note under each phrase
    glass: { step: 0.3,
      mel: [[0, _, 4, _, 7, _, _, _], [_, _, 9, _, 7, _, 4, _], [2, _, 4, _, 6, _, _, _], [_, _, _, _, 9, _, _, _], [7, _, _, 4, _, _, 2, _], [4, _, _, _, _, _, _, _], [2, _, 4, _, 1, _, _, _], [_, _, 0, _, _, _, _, _]],
      low: [0, _, -2, _, -3, _, -1, _],
      note: (c, o, t, m) => { const f = mf(m); tone(c, o, t, { f, d: 1.6, g: 0.03, a: 0.004 }); tone(c, o, t, { f: f * 2.76, d: 0.45, g: 0.005, a: 0.002 }); },
      bass: (c, o, t, m) => tone(c, o, t, { f: mf(m), d: 2.4, g: 0.022, a: 0.02 }) },
    // Basic: a few clean notes, question and answer, a lot of quiet
    basic: { step: 0.32,
      mel: [[0, _, _, _, 4, _, _, _], [_, _, 2, _, _, _, _, _], [2, _, _, _, 1, _, _, _], [_, _, _, _, 0, _, _, _], [4, _, _, _, 5, _, 4, _], [_, _, 2, _, _, _, _, _], [2, _, _, _, 0, _, _, _], [_, _, _, _, _, _, _, _]],
      low: [0, -2, -3, -1, 0, -2, -3, 0], oct: 1,
      note: (c, o, t, m) => I.sine(c, o, t, m, 0.032, 0.9, 0.006), bass: (c, o, t, m) => I.sine(c, o, t, m, 0.022, 1.6, 0.01) },
    // Retro Dark: the terminal's idle tune, square lead and a triangle bass
    phosphor: { step: 0.2,
      mel: [[0, _, 2, 4, _, 4, 2, _], [1, _, _, _, _, _, _, _], [0, _, 2, 4, _, 7, 6, 4], [2, _, _, _, _, _, _, _], [_, _, _, _, _, _, _, _], [4, _, 5, 6, _, 7, _, _], [6, _, 4, _, 2, _, 1, _], [0, _, _, _, _, _, _, _]],
      low: [0, -3, 0, -2, _, -3, -2, 0],
      note: (c, o, t, m) => I.chip(c, o, t, m, 0.07, 0.03, 0.5), bass: (c, o, t, m) => tone(c, o, t, { type: 'triangle', f: mf(m), d: 0.5, g: 0.04, a: 0.004, lp: 700 }) },
    // Retro Light: a celesta tune, a clockwork of a song
    teletype: { step: 0.28,
      mel: [[0, _, 4, _, 2, _, 4, _], [5, _, 4, _, 2, _, _, _], [1, _, 3, _, 2, _, 1, _], [0, _, _, _, _, _, _, _], [_, _, 4, _, _, _, 2, _], [4, _, 5, _, 7, _, 5, _], [4, _, 2, _, 3, _, 1, _], [0, _, _, _, _, _, _, _]],
      low: [0, -3, -2, 0, _, 0, -3, 0], oct: -1,
      note: (c, o, t, m) => I.celesta(c, o, t, m, 0.045, 0.9), bass: (c, o, t, m) => I.celesta(c, o, t, m, 0.035, 1.1) },
    // NieR: a slow, wistful line on a soft bell, a pad breathing in at the top of the tune
    nier: { step: 0.45,
      mel: [[4, _, _, 3, 2, _, _, _], [0, _, _, _, _, _, 2, _], [2, _, _, 3, 4, _, 5, _], [4, _, _, _, _, _, _, _], [_, _, _, _, 0, _, _, _], [7, _, _, 6, 4, _, _, _], [5, _, _, 4, 2, _, 3, _], [2, _, _, _, _, _, _, _]],
      low: [0, _, -2, _, 0, -3, _, -1],
      note: (c, o, t, m) => { const f = mf(m); tone(c, o, t, { f, d: 1.7, g: 0.034, a: 0.004 }); tone(c, o, t, { f: f * 2, d: 0.6, g: 0.008, a: 0.003 }); },
      bass: (c, o, t, m) => tone(c, o, t, { f: mf(m + 12), d: 2, g: 0.02, a: 0.03 }),
      extra: (c, o, t, k, n, bar, i) => { if (bar === 0 && i === 0) I.pad(c, o, t, k.chord(), 5, 0.02, 'sine', 1600, 1.8); } }
  };

  // the continuous loops are built hot; this brings them near their place before the trims
  const LOOP_BASE = { snore: 1, work: 1, power: 1, swing: 0.3, bed: 1 };

  /* ---------------------------------------------------------------- the engine */
  const ROOMS = new WeakMap();
  // the room's impulse response, a little at a time: a live context builds it between frames (the first
  // sound of a look plays dry and the room joins it a moment later), an offline render builds it at once
  function* roomSteps(c, kitName) {
    const Rm = KIT[kitName].room, sr = c.sampleRate, len = Math.ceil(sr * Rm.len), b = c.createBuffer(2, len, sr), q = rng(77 + kitName.length);
    const pre = Math.round((Rm.pre || 0) * sr), dec = 6.9 / Rm.rt, kk = 0.12 + Rm.bright * 0.8, fall = Math.exp(-dec / sr);
    let e = 0;
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch); let lp = 0, env = 1;
      // coloured noise under an exponential decay, high-passed (about 220 Hz) so the room never booms
      const hpA = 1 / (1 + (2 * Math.PI * (Rm.hp || 220)) / sr); let hpY = 0, hpX = 0;
      for (let i = pre; i < len; i++) {
        const x = q() * 2 - 1; lp += (x - lp) * kk; hpY = hpA * (hpY + lp - hpX); hpX = lp; const tt = (i - pre) / sr;
        d[i] = hpY * env * Math.min(1, tt / 0.004); env *= fall;
        if ((i & 16383) === 0) yield;
      }
      if (Rm.er) [[0.007, 0.5], [0.013, 0.35], [0.019, 0.25], [0.027, 0.16]].forEach(([s, g], j) => { const i = pre + Math.round(s * sr); if (i < len) d[i] += g * ((j + ch) % 2 ? -1 : 1) * 3; });
      for (let i = 0; i < len; i++) e += d[i] * d[i];
      yield;
    }
    const k = 1 / Math.sqrt(e / 2 || 1);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] *= k; yield; }
    return b;
  }
  function roomOf(c, kitName, bus) {
    let m = ROOMS.get(c); if (!m) { m = {}; ROOMS.set(c, m); }
    if (m[kitName]) return m[kitName];
    const input = c.createGain();
    m[kitName] = input;
    const wire = (b) => {
      const conv = c.createConvolver(); conv.normalize = false; conv.buffer = b;
      const wet = c.createGain(); wet.gain.value = KIT[kitName].room.wet * 2.2; input.connect(conv); conv.connect(wet); wet.connect(bus);
    };
    const it = roomSteps(c, kitName);
    if (typeof OfflineAudioContext !== 'undefined' && c instanceof OfflineAudioContext) { let r; while (!(r = it.next()).done); wire(r.value); return input; }
    const step = () => {
      const t0 = performance.now(); let r;
      while (!(r = it.next()).done) if (performance.now() - t0 > 5) break;
      if (r.done) wire(r.value); else setTimeout(step, 0);
    };
    setTimeout(step, 0);
    return input;
  }
  // the master: a high-pass for any offset, a compressor that only catches peaks (a soft limiter), the level, out
  function graph(c, raw, out) {
    const r = res(c), key = raw ? 'rawg' : 'g'; if (r[key]) return r[key];
    const bus = c.createGain(), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 26; hp.Q.value = 0.7; bus.connect(hp);
    const master = c.createGain(); master.gain.value = 1;
    if (raw) { hp.connect(master); }
    else {
      const comp = c.createDynamicsCompressor(); comp.threshold.value = -7; comp.knee.value = 4; comp.ratio.value = 10; comp.attack.value = 0.003; comp.release.value = 0.15;
      const pre = c.createGain(); pre.gain.value = 1; hp.connect(pre); pre.connect(comp); comp.connect(master); master.gain.value = 1 / MAKEUP;
    }
    /* (live, Pip's master feeds the one player's master, so its level and switch hold; offline, the destination) */
    master.connect(out || c.destination);
    return (r[key] = { bus, master });
  }
  function trimOf(kitName, name) { const T = TRIM[kitName]; return T && T[name] != null ? T[name] : 0; }
  // a voice's chain: its level (trim and intensity), its place, its room send
  function chain(c, g, kitName, name, op, raw) {
    const vg = c.createGain(), int = op.intensity == null ? 0.7 : clamp(op.intensity, 0, 1);
    vg.gain.value = (raw ? 1 : db(trimOf(kitName, name))) * (0.38 + int * 0.885);
    let head = vg;
    const pan = op.pan != null ? clamp(op.pan, -1, 1) : jit(0.12);
    if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; vg.connect(p); head = p; }
    head.connect(g.bus);
    // Pip's voice sits closer than the music: less of it reaches the room, so the words stay clear in Glass's and NieR's halls
    const send = c.createGain(); send.gain.value = VOICED.has(name) ? ({ glass: 0.3, nier: 0.16 }[kitName] || 0.35) : DRY[name] != null ? DRY[name] : 1; head.connect(send); send.connect(roomOf(c, kitName, g.bus));
    return vg;
  }
  function newState(seed) { return { last: {}, at: {}, chapter: 0, ch0: 0, hist: [], r: seed != null ? rng(seed) : Math.random }; }
  // the chapter (for the chord) at a moment: the loops are scheduled ahead, and a render knows when each chapter came
  function setCh(st, ch, t) { st.chapter = clamp(ch | 0, 0, 4); st.hist.push([t, st.chapter]); if (st.hist.length > 24) st.ch0 = st.hist.shift()[1]; }
  function chAt(st, t) { let ch = st.ch0; for (const [tt, c] of st.hist) { if (tt <= t + 1e-6) ch = c; else break; } return ch; }
  function helper(kitName, op, st, v) {
    const K = KIT[kitName], ch = clamp(op.chapter != null ? op.chapter | 0 : st.chapter, 0, 4);
    return {
      kit: kitName, K, ch, root: K.root, v, idx: op.index | 0, count: op.count | 0, len: op.len,
      chord: (cc) => CHORDS[K.mode][cc == null ? ch : cc].map((x) => K.root + x),
      deg: (i) => K.root + SCALE[K.mode][((i % 7) + 7) % 7] + 12 * Math.floor(i / 7),
      // a string's note: longer strings hang lower and sound lower (len 0..400 px around a centre)
      strF: (f) => clamp(f * Math.pow(2, -((op.len == null ? 160 : op.len) - 160) / 380), f * 0.45, f * 2.2)
    };
  }
  // choose a variant that is not the last one
  function variant(st, kitName, name) {
    const key = kitName + ':' + name, n = 4, prev = st.last[key];
    let v = Math.floor(st.r() * n); if (v === prev) v = (v + 1 + Math.floor(st.r() * (n - 1))) % n;
    st.last[key] = v; return v;
  }
  // play one event on a context at t; returns false if it was dropped
  function dispatch(c, g, st, kitName, name, op, t, raw) {
    const K = KIT[kitName], fn = K && K.ev[name];
    if (!fn) return false;
    const gap = RATE[name];
    if (gap && st.at[kitName + name] != null && (t - st.at[kitName + name]) * 1000 < gap) return false;
    st.at[kitName + name] = t;
    if (op.chapter != null) setCh(st, op.chapter, t);
    const prevR = R; R = st.r;
    try { fn(c, chain(c, g, kitName, name, op, raw), t, op, helper(kitName, op, st, variant(st, kitName, name))); }
    finally { R = prevR; }
    return true;
  }
  /* a line's pace, for the typing it goes with, when O55.sound is not on the page (the voice is then silent) */
  function sayTiming(kitName, text, op) {
    const V = VOX[kitName], M = MOOD[(op && op.mood) || 'idle'] || MOOD.idle, C = CREW[(op && op.voice) || 'pip'] || CREW.pip;
    const cps = Math.round(V.cps * M.rate * C.rate * 10) / 10, n = String(text || '').length;
    return { cps, ms: n ? Math.round((n / cps) * 1000 + 140) : 0 };
  }

  /* loops: one instance per name in the live kit; levels are remembered from before the first gesture */
  function loopInst(c, g, kitName, name, t, st, notrim) {
    const D = LOOPDEF[name], o = c.createGain(); o.gain.setValueAtTime(0, t);
    const lvl = c.createGain(); lvl.gain.value = (LOOP_BASE[name] || 1) * (notrim ? 1 : db(trimOf(kitName, 'loop:' + name))); o.connect(lvl);
    lvl.connect(g.bus); const send = c.createGain(); send.gain.value = 0.8; lvl.connect(send); send.connect(roomOf(c, kitName, g.bus));
    const k = helper(kitName, {}, st, 0);
    const parts = D.make ? D.make(c, o, t, k) : null;
    const inst = {
      name, kit: kitName, o, level: 0, next: t + 0.05, n: 0, k, segs: [],
      set(level, tt) { inst.level = level; inst.segs.push([tt, level]); const v = name === 'swing' ? Math.pow(level, 1.6) : level; o.gain.setTargetAtTime(v, tt, name === 'swing' ? 0.06 : 0.15); if (parts) parts.set(level, tt); },
      levelAt(tt) { let l = 0; for (const [a, v] of inst.segs) { if (a <= tt) l = v; else break; } return l; },
      pump(until, gate) {
        if (!D.step) return;
        const prevR = R; R = st.r;
        try {
          while (inst.next < until) { if (!gate || inst.levelAt(inst.next) > 0.001) D.step(c, o, inst.next, helper(kitName, { chapter: chAt(st, inst.next) }, st, 0), inst.n++); inst.next += D.period(k) * (D.steady ? 1 : 1 + jit(0.08)); }
        } finally { R = prevR; }
      },
      stop(tt) { o.gain.cancelScheduledValues(tt); o.gain.setTargetAtTime(0, tt, 0.12); if (parts) parts.stop(tt + 1.2); inst.dead = true; }
    };
    return inst;
  }
  /* ---------------------------------------------------------------- offline rendering */
  function wav(buf) {
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, data = [];
    for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    const bytes = new Uint8Array(44 + n * ch * 2), dv = new DataView(bytes.buffer);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) bytes[o + i] = s.charCodeAt(i); };
    str(0, 'RIFF'); dv.setUint32(4, 36 + n * ch * 2, true); str(8, 'WAVE'); str(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
    dv.setUint16(22, ch, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true);
    str(36, 'data'); dv.setUint32(40, n * ch * 2, true);
    let o = 44;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, data[c][i] || 0)); dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  // one take for the level tool and the sound board's checks
  async function renderOne(kitName, kind, name, opts, o) {
    o = o || {};
    // takes start at 0.6 s: a compressor needs about half a second after its context starts before its make-up settles
    const sr = 48000, t0 = 0.6, dur = t0 + (o.seconds || (kind === 'loop' ? 8 : name === 'confetti' || name === 'crew' || name === 'chapter' ? 4 : 3));
    const c = new OfflineAudioContext(2, Math.ceil(sr * dur), sr), g = graph(c, !!o.raw), st = newState(o.seed || 99);
    const op = Object.assign({ chapter: 2, index: 1, count: 3, len: 160 }, opts || {});
    if (kind === 'play') dispatch(c, g, st, kitName, name, op, t0, !!o.notrim);
    else { const L = loopInst(c, g, kitName, name, t0, st, !!o.notrim); L.set(op.level == null ? 1 : op.level, t0); L.pump(dur, true); }
    return c.startRendering();
  }
  // the master chain's gain below its compressor's threshold (the compressor's own make-up), for MAKEUP
  async function chainGain() {
    const sr = 48000, c = new OfflineAudioContext(1, sr, sr), g = graph(c);
    g.master.gain.value = 1;
    const s = c.createOscillator(), a = c.createGain(); s.frequency.value = 440; a.gain.value = 0.02; s.connect(a); a.connect(g.bus); s.start(0);
    const buf = await c.startRendering(), d = buf.getChannelData(0);
    let e = 0; for (let i = sr / 2; i < sr; i++) e += d[i] * d[i];
    return Math.sqrt(e / (sr / 2)) / (0.02 / Math.SQRT2);
  }
  /* loudness as the ear hears it at a quiet listening level: A-weighted (at 48 kHz), so a low thump or a warm voice is
     not counted louder than it sounds, nor a sound that lives below what laptop speakers play */
  const AW = { b: [0.234301792299513, -0.468603584599026, -0.234301792299513, 0.937207169198054, -0.234301792299515, -0.468603584599025, 0.234301792299513],
    a: [1, -4.113043408775871, 6.553121752655047, -4.990849294163381, 1.785737302937573, -0.246190595319487, 0.011224250033231] };
  function stats(buf, o) {
    const n = buf.length, sr = buf.sampleRate, L = buf.getChannelData(0), Rr = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L;
    const xa = new Float64Array(7), ya = new Float64Array(7);
    let peak = 0, nan = 0, sum = 0, last = 0, zacc = 0, zn = 0;
    const W = Math.round(sr * 0.01), wins = [];
    let acc = 0, k = 0;
    // a high-pass at 10 kHz (biquad, Q .707) to see how much of the sound is up there
    const w0 = (2 * Math.PI * 10000) / sr, al = Math.sin(w0) / (2 * 0.707), cw = Math.cos(w0), a0 = 1 + al;
    const b0 = (1 + cw) / 2 / a0, b1 = -(1 + cw) / a0, b2 = (1 + cw) / 2 / a0, a1 = (-2 * cw) / a0, a2 = (1 - al) / a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0, hf = 0, tot = 0;
    for (let i = 0; i < n; i++) {
      const a = L[i], b = Rr[i];
      if (!(a === a) || !(b === b)) { nan++; continue; }
      const p = Math.max(Math.abs(a), Math.abs(b)); if (p > peak) peak = p;
      if (p > 0.001) last = i;
      const m = (a + b) / 2; sum += m;
      // the A-weighted mid signal, for loudness (direct form, the filter's own state)
      for (let j = 6; j > 0; j--) { xa[j] = xa[j - 1]; ya[j] = ya[j - 1]; }
      xa[0] = m; let wv = 0; for (let j = 0; j < 7; j++) wv += AW.b[j] * xa[j]; for (let j = 1; j < 7; j++) wv -= AW.a[j] * ya[j]; ya[0] = wv;
      acc += sr === 48000 ? wv * wv : (a * a + b * b) / 2; k++; zacc += (a * a + b * b) / 2; zn++;
      if (k === W) { wins.push(acc / W); acc = 0; k = 0; }
      const y = b0 * m + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = m; y2 = y1; y1 = y; hf += y * y; tot += m * m;
    }
    const top = wins.reduce((q, v) => Math.max(q, v), 0), act = o && o.whole ? wins.slice(Math.round(0.6 / 0.01)) : wins.filter((v) => v >= top * 0.01);
    // loudness integrates over at least 50 ms (the ear sums short sounds), so a 5 ms click reads as quiet as it sounds
    const rms = act.length ? Math.sqrt(act.reduce((q, v) => q + v, 0) / Math.max(act.length, 5)) : 0;
    const dbf = (v) => (v > 0 ? Math.round(20 * Math.log10(v) * 10) / 10 : -200);
    return { peakDb: dbf(peak), rmsDb: dbf(rms), rmsZ: dbf(Math.sqrt(zacc / Math.max(1, zn))), dur: Math.round(((last + 1) / sr) * 100) / 100, nan, dc: Math.round((sum / n) * 1e5) / 1e5, hfDb: tot > 0 ? Math.round(10 * Math.log10(hf / tot + 1e-12) * 10) / 10 : -200 };
  }


  /* ---------------------------------------------------------------- the player
     In PMConcept7 Pip's sound is the one player's (found's O55.sound.pip, 15-sound.js): the voice is its say() and
     vocal(), each look's kit is registered with registerKit() under the kit's own id (friendly, glass, basic, phosphor,
     teletype, nier: voiceOf(look)), and the music with registerMusic(); its switch, first-gesture rule, holds and the
     parts setup-voice and setup-music gate them all. Without the one player (a page that has not loaded 15-sound.js)
     the kits fall back to a bus on a context of their own. The listening page (tools/sound_board.py --pip-page) carries
     the one player. */
  const part = (id) => (O55.pipStage && O55.pipStage.h ? O55.pipStage.h.part(id) : true);
  const SND = () => O55.sound || null;
  const API = () => { const S = SND(); return S && S.pip && typeof S.pip.registerKit === 'function' ? S.pip : null; };
  const P = { g: null, ctx: null, st: newState(), kit: 'basic', look: 'basic-dark', loops: {}, want: {}, pumpT: 0, muted: null, tune: null };
  const nier = () => document.documentElement.getAttribute('data-o55-nier') === 'on';
  const QUIET_UNLESS_NIER = new Set(['hover', 'ghost', 'tryOn']);
  /* the window's own clicks, moves and chapter sting are O55.sound's; Pip only keeps the music's chord in step */
  const WINDOW_OWNS = new Set(['chapter', 'open', 'close', 'next', 'back', 'tap', 'select', 'toggleOn', 'toggleOff', 'warn']);
  const VOCALS = new Set(VOCAL);
  /* the rooms' wet tails ride a bus of their own on the one player's master, so a tail outlives the short chain the
     player gives each sound */
  const TAILS = new WeakMap();
  function tails(c) { let b = TAILS.get(c); if (!b) { const S = SND(); b = c.createGain(); b.connect((S && S.master) || c.destination); TAILS.set(c, b); } return b; }
  /* one event of a kit, into the chain the player made for it (its trim and pan are the player's) */
  function into(c, out, kitName, name, op, t) {
    const K = KIT[kitName], fn = K && K.ev[name];
    if (!fn) return false;
    const prevR = R; R = P.st.r;
    try {
      const vg = c.createGain(); vg.gain.value = 0.38 + (op.intensity == null ? 0.7 : clamp(op.intensity, 0, 1)) * 0.885; vg.connect(out);
      const send = c.createGain(); send.gain.value = DRY[name] != null ? DRY[name] : 1; vg.connect(send); send.connect(roomOf(c, kitName, tails(c)));
      fn(c, vg, t, op, helper(kitName, op, P.st, variant(P.st, kitName, name)));
    } finally { R = prevR; }
    return true;
  }
  /* the music and the stage's beds (snore, work, power, swing) as one tune: the player plays one at a time */
  function tune(kitName) {
    return {
      start(c, out, t0) {
        const g = { bus: out }, insts = {}, h = { kit: kitName };
        const inst = (name) => insts[name] || (insts[name] = loopInst(c, g, kitName, name, t0, P.st));
        h.level = (name, level) => { const L = insts[name] || (level > 0.001 ? inst(name) : null); if (L) L.set(level, c.currentTime); };
        h.level('bed', P.want.bed == null ? 1 : P.want.bed);
        Object.keys(P.want).forEach((n) => { if (n !== 'bed' && P.want[n] > 0.001) h.level(n, P.want[n]); });
        const pump = () => { const t = c.currentTime; Object.keys(insts).forEach((n) => { const L = insts[n]; if (L.next < t) L.next = t + 0.02; if (L.level > 0.001) L.pump(t + 0.5, false); }); };
        const id = setInterval(pump, 120); pump();
        h.stop = (t, fade) => { clearInterval(id); Object.keys(insts).forEach((n) => { try { insts[n].stop(t); } catch (_) {} }); if (P.tune === h) P.tune = null; };
        P.tune = h;
        return h;
      }
    };
  }
  let registered = false;
  function register() {
    const pip = API(); if (!pip || registered) return !!pip;
    KITS.forEach((kn) => {
      const events = {};
      Object.keys(KIT[kn].ev).forEach((name) => { if (!WINDOW_OWNS.has(name)) events[name] = (ctx, out, t0, opts) => into(ctx, out, kn, name, opts || {}, t0); });
      pip.registerKit(kn, { events, trim: Object.assign({}, TRIM[kn] || {}) });
      pip.registerMusic('pip-' + kn, tune(kn));
    });
    registered = true;
    return true;
  }
  /* (the board's stand-in: the context and master it made) */
  function attach() {
    const S = SND(); if (!S || S.muted) return false;
    if (!S.ctx && S.unlock) S.unlock();
    const c = S.ctx; if (!c || c.state !== 'running' || !S.master) return false;
    if (P.ctx !== c) { P.ctx = c; P.g = graph(c, false, S.master); P.loops = {}; }
    return true;
  }
  const tnow = () => (P.ctx ? P.ctx.currentTime + 0.006 : 0);
  function play(name, opts) {
    const op = Object.assign({}, opts || {}), kn = op.kit ? kitOf(op.kit) : P.kit;
    if (op.chapter != null) setCh(P.st, op.chapter, SND() && SND().ctx ? SND().ctx.currentTime : 0);
    if (EVENTS.indexOf(name) < 0 || WINDOW_OWNS.has(name)) return false;
    if (QUIET_UNLESS_NIER.has(name) && !nier()) return false;
    const pip = API();
    if (pip && register()) {
      if (VOCALS.has(name) && !/^(cheer|crew)$/.test(name)) return pip.vocal(name, { look: P.look, pan: op.pan });
      return pip.play(name, Object.assign(op, { kit: kn, priority: op.priority == null ? 35 : op.priority }));
    }
    if (!attach()) return false;
    return dispatch(P.ctx, P.g, P.st, kn, name, op, tnow(), false);
  }
  /* Pip's lines are spoken by the one voice core, O55.sound.pip (lane found): its gates (sound effects, the first
     gesture, the parts setup-voice and app-voice, holds, the chat's mute) and its timing { ms, cps }, which the
     bubble's typing follows. Without it a line is only timed. */
  function say(text, opts) {
    const op = opts || {}, pip = API();
    if (pip) return pip.say(text, { mood: op.mood, look: P.look, where: 'setup', pan: op.pan });
    return sayTiming(op.kit ? kitOf(op.kit) : P.kit, text, op);
  }
  function hush() { const pip = API(); if (pip) pip.hush(); }
  function loop(name, level) {
    if (LOOPS.indexOf(name) < 0) return;
    level = clamp(+level || 0, 0, 1);
    if (name === 'bed' && !part('setup-music')) level = 0;
    P.want[name] = level;
    const pip = API();
    if (pip && register()) {
      if (name === 'bed') { if (level > 0.001) pip.music('pip-' + P.kit); else pip.stopMusic(0.6); return; }
      if (P.tune) P.tune.level(name, level);
      return;
    }
    applyLoop(name, level);
    pumpOn();
  }
  function applyLoop(name, level) {
    if (!attach()) return;
    let inst = P.loops[name];
    if (!inst && level > 0.001) { inst = P.loops[name] = loopInst(P.ctx, P.g, P.kit, name, P.ctx.currentTime, P.st); inst.next = P.ctx.currentTime + 0.05; }
    if (inst && Math.abs(inst.level - level) > 0.004) inst.set(level, P.ctx.currentTime);
  }
  function pumpOn() { if (!P.pumpT) P.pumpT = setInterval(pump, 120); }
  function pump() {
    const S = SND(), off = !S || S.muted;
    if (off !== P.muted) {
      P.muted = off;
      if (off) { hush(); Object.keys(P.loops).forEach((n) => { try { P.loops[n].stop(P.ctx.currentTime); } catch (_) {} delete P.loops[n]; }); }
    }
    if (!off && attach()) Object.keys(P.want).forEach((n) => { if (P.want[n] > 0.001 && !P.loops[n]) applyLoop(n, P.want[n]); });
    const t = P.ctx ? P.ctx.currentTime : 0;
    Object.keys(P.loops).forEach((name) => {
      const inst = P.loops[name];
      if (inst.level <= 0.001) { inst.idle = (inst.idle || 0) + 1; if (inst.idle > 25) { inst.stop(t); delete P.loops[name]; } return; }
      inst.idle = 0;
      if (inst.next < t) inst.next = t + 0.02;
      inst.pump(t + 0.5, false);
    });
    if (!Object.keys(P.loops).length && !Object.values(P.want).some((v) => v > 0.001)) { clearInterval(P.pumpT); P.pumpT = 0; }
  }
  /* a new look: its kit, its voice, and its music in place of the last one's */
  function setTheme(t) {
    P.look = String(t || P.look);
    const kn = kitOf(t); if (kn === P.kit) return;
    P.kit = kn;
    const pip = API();
    if (pip && register()) { if (P.want.bed > 0.001) pip.music('pip-' + kn); return; }
    if (P.ctx) { const t0 = tnow(); Object.keys(P.loops).forEach((n) => { P.loops[n].stop(t0); delete P.loops[n]; }); }
    Object.keys(P.want).forEach((n) => applyLoop(n, P.want[n]));
  }
  register();
  /* the music asked for before the first click or key (the window opens on its own) starts with that gesture */
  const wake = () => { const pip = API(); if (!pip || !(P.want.bed > 0.001) || !part('setup-music')) return; const pl = pip.playing(); if (!pl || pl.music !== 'pip-' + P.kit) pip.music('pip-' + P.kit); };
  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, () => setTimeout(wake, 0), { capture: true, passive: true }));
  O55.pipVoice = {
    EVENTS, KITS, LOOPS, TARGET, SUBTLE, OFFSET, TRIM, kitOf,
    play, say, hush, loop, setTheme,
    sayTiming: (text, opts) => { const pip = API(); return pip ? pip.timing(text, { mood: opts && opts.mood, look: P.look }) : sayTiming((opts && opts.kit) ? kitOf(opts.kit) : P.kit, text, opts || {}); },
    render: renderOne, stats, wav, chainGain, MAKEUP
  };
})();
