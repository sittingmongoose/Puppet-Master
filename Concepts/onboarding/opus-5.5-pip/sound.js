/* Pip's sound (Opus 5.5 concept): everything Pip and its stage sound like, in every look.
   Web Audio synthesis only: no audio files, no samples, nothing taken from a game. Six kits, one per look's material:
     friendly  felt, wood and warmth: marimba, kalimba, glockenspiel, woodblocks, felt thumps, nylon plucks, a music box
     glass     Liquid Glass: FM glass bells, wine-glass tones, water bloops, airy whooshes, shimmer, a long room
     basic     calm and precise: clean sines, soft clicks, two-tone confirms, almost no room
     phosphor  Retro Dark, the green-phosphor terminal: chip pulses, terminal beeps, the CRT's power-on and degauss
     teletype  Retro Light, the same machine's printout: key clacks, the platen ratchet, the margin bell, a print head
     nier      YoRHa: soft high menu ticks, two-tone confirms, data chatter, glitch tears, a drone, a distant choir
   Pip speaks: say(text) turns the words of a line into babble in the kit's voice (one syllable per vowel group, onsets
   from the consonants, vowels from the letters, a contour from the punctuation and the mood), timed to the typing.

   No sound before the person's first gesture; sound is on by default and one toggle away (remembered on this computer).
   Reduced motion drops the foley that only describes motion (lower, ghost, lift, swing, hop, rail, the swing loop).
   Every sound is a function fn(ctx, out, t0, opts, k) on any BaseAudioContext, so renderTimeline() renders a logged
   session offline through the same code (the walkthrough video's soundtrack).

   API
     setTheme(themeId | kit)  setMuted(bool)  toggle() -> muted  muted (getter)  setReduced(bool)  unlock()
     play(event, { pan, index, count, len, intensity, kit, chapter }) -> bool
     say(text, { mood, kit, voice, pan }) -> { ms, cps }   (timing even when muted or locked)   hush()
     loop('snore' | 'work' | 'power' | 'swing' | 'bed', level 0..1)
     recording = true (clears and fills log)   log   renderTimeline(entries, seconds) -> Promise<base64 WAV>
     EVENTS  KITS  LOOPS  kitOf(themeId)
   Test hooks: _render(kit, kind, name, opts, { raw, seconds, text }) -> Promise<AudioBuffer>, _stats(buffer), TARGET,
   SUBTLE, TRIM (written by tools/sound_levels.mjs --write). */
(function (G) {
  'use strict';

  /* ---------------------------------------------------------------- catalogue */
  const KITS = ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'];
  const UI = ['tap', 'hover', 'select', 'toggleOn', 'toggleOff', 'next', 'back', 'open', 'close', 'key', 'warn'];
  const STAGE = ['lower', 'ghost', 'land', 'lift', 'hop', 'swing', 'tryOn', 'sparkle', 'confetti', 'chapter', 'tick', 'block',
    'power', 'score', 'lock', 'decode', 'slice', 'degauss', 'feed', 'powerOn', 'powerOff', 'rail'];
  const VOCAL = ['wake', 'sleep', 'think', 'happy', 'wink', 'alert', 'cheer', 'crew'];
  const EVENTS = UI.concat(STAGE, VOCAL);
  const LOOPS = ['snore', 'work', 'power', 'swing', 'bed'];
  const MOTION = new Set(['lower', 'ghost', 'lift', 'swing', 'hop', 'rail']);
  const VOICED = new Set(['say', 'wake', 'sleep', 'think', 'happy', 'wink', 'alert']);
  // the least time between two of the same event (ms); more often than this is dropped
  const RATE = { hover: 45, key: 40, tap: 30, select: 40, lower: 60, ghost: 80, land: 50, tick: 80, sparkle: 90, rail: 120, decode: 90, score: 150, lock: 120, hop: 90, swing: 140, toggleOn: 40, toggleOff: 40 };
  // target loudness (dBFS RMS over the sound's active part) that tools/sound_levels.mjs trims every take to
  const TARGET = {
    tap: -34, hover: -37, select: -32, toggleOn: -34, toggleOff: -34, next: -32, back: -33, open: -29, close: -30, key: -35, warn: -30,
    lower: -31, ghost: -35, land: -30, lift: -32, hop: -30, swing: -34, tryOn: -27, sparkle: -30, confetti: -20, chapter: -23, tick: -27, block: -26,
    power: -24, score: -31, lock: -28, decode: -32, slice: -30, degauss: -27, feed: -29, powerOn: -27, powerOff: -29, rail: -33,
    wake: -26, sleep: -28, think: -27, happy: -26, wink: -27, alert: -26, cheer: -22, crew: -20, say: -26,
    'loop:snore': -42, 'loop:work': -40, 'loop:power': -40, 'loop:swing': -40, 'loop:bed': -47
  };
  // events a kit plays only as a faint courtesy (another look's speciality): trimmed 7 dB under their target
  const SUBTLE = {
    friendly: ['score', 'lock', 'decode', 'slice', 'degauss', 'feed'],
    glass: ['score', 'decode', 'slice', 'degauss', 'feed'],
    basic: ['score', 'decode', 'slice', 'degauss', 'feed', 'swing', 'ghost'],
    phosphor: ['feed', 'slice'],
    teletype: ['degauss', 'slice', 'decode'],
    nier: ['score', 'feed', 'degauss', 'hop', 'swing']
  };
  /* per-kit level trims in dB, measured: tools/sound_levels.mjs --write */
  const TRIM = /* TRIM:begin */{"friendly":{"tap":5.5,"hover":4.5,"select":-3,"toggleOn":5.5,"toggleOff":5.5,"next":-2.5,"back":-1,"open":-1,"close":-1.5,"key":6.5,"warn":-1.5,"lower":1.5,"ghost":7.5,"land":-2,"lift":11,"hop":4,"swing":21.5,"tryOn":0.5,"sparkle":3.5,"confetti":7,"chapter":2.5,"tick":2.5,"block":0,"power":6,"score":9,"lock":7.5,"decode":10.5,"slice":26,"degauss":24,"feed":10.5,"powerOn":0,"powerOff":-1.5,"rail":12.5,"wake":-8,"sleep":-4,"think":-19,"happy":-8.5,"wink":-7.5,"alert":-12,"cheer":-6.5,"crew":-11.5,"say":-11.5,"loop:snore":2,"loop:work":-1,"loop:power":-5.5,"loop:swing":-10.5,"loop:bed":9},"glass":{"tap":12.5,"hover":13.5,"select":4.5,"toggleOn":5,"toggleOff":6,"next":3,"back":6.5,"open":4.5,"close":4.5,"key":12,"warn":9.5,"lower":10,"ghost":8.5,"land":11.5,"lift":12.5,"hop":7.5,"swing":26.5,"tryOn":5.5,"sparkle":12.5,"confetti":8.5,"chapter":9,"tick":14.5,"block":12.5,"power":8,"score":12,"lock":13.5,"decode":12,"slice":30,"degauss":29,"feed":15,"powerOn":5.5,"powerOff":10,"rail":15.5,"wake":-12,"sleep":-8.5,"think":-19,"happy":-12.5,"wink":-12,"alert":-17,"cheer":-10.5,"crew":-16.5,"say":-17.5,"loop:snore":3,"loop:work":6.5,"loop:power":-3.5,"loop:swing":-12,"loop:bed":8},"basic":{"tap":20.5,"hover":19,"select":6.5,"toggleOn":6.5,"toggleOff":6.5,"next":6.5,"back":6,"open":8.5,"close":7.5,"key":22,"warn":8,"lower":10.5,"ghost":19.5,"land":9,"lift":9.5,"hop":12.5,"swing":23.5,"tryOn":9,"sparkle":13.5,"confetti":15,"chapter":13.5,"tick":12,"block":12,"power":14,"score":19.5,"lock":17,"decode":19,"slice":18,"degauss":24.5,"feed":22,"powerOn":12,"powerOff":11,"rail":13,"wake":-8,"sleep":-7,"think":-5.5,"happy":-8,"wink":-7.5,"alert":-9.5,"cheer":-6,"crew":-7.5,"say":-8,"loop:snore":19,"loop:work":8.5,"loop:power":-4,"loop:swing":-17,"loop:bed":17.5},"phosphor":{"tap":9,"hover":14.5,"select":6,"toggleOn":5.5,"toggleOff":5.5,"next":7.5,"back":7,"open":1.5,"close":9.5,"key":13,"warn":6,"lower":15,"ghost":1.5,"land":4,"lift":8,"hop":7.5,"swing":18.5,"tryOn":10.5,"sparkle":18,"confetti":7.5,"chapter":16,"tick":11.5,"block":9.5,"power":7,"score":13.5,"lock":14,"decode":18.5,"slice":5.5,"degauss":-3.5,"feed":30,"powerOn":-4,"powerOff":8.5,"rail":11.5,"wake":3,"sleep":3.5,"think":2.5,"happy":2.5,"wink":2.5,"alert":1.5,"cheer":5.5,"crew":4,"say":2.5,"loop:snore":4,"loop:work":8,"loop:power":1,"loop:swing":-15,"loop:bed":-5},"teletype":{"tap":5,"hover":29.5,"select":5.5,"toggleOn":5,"toggleOff":4.5,"next":11,"back":9.5,"open":8.5,"close":8.5,"key":5.5,"warn":0,"lower":7,"ghost":25,"land":-1,"lift":23.5,"hop":22,"swing":26.5,"tryOn":4,"sparkle":7.5,"confetti":9.5,"chapter":9.5,"tick":7.5,"block":5.5,"power":11.5,"score":11,"lock":12,"decode":2.5,"slice":6,"degauss":9,"feed":8,"powerOn":4.5,"powerOff":9.5,"rail":24,"wake":0,"sleep":1.5,"think":-0.5,"happy":-1,"wink":-1,"alert":1,"cheer":3.5,"crew":2,"say":0,"loop:snore":10,"loop:work":0,"loop:power":0,"loop:swing":-10,"loop:bed":-3},"nier":{"tap":16.5,"hover":17,"select":9.5,"toggleOn":16.5,"toggleOff":17.5,"next":11.5,"back":11.5,"open":17,"close":18.5,"key":25,"warn":19.5,"lower":23,"ghost":23,"land":14.5,"lift":21,"hop":17.5,"swing":21,"tryOn":12.5,"sparkle":22.5,"confetti":10,"chapter":9,"tick":16,"block":14.5,"power":13,"score":20,"lock":14.5,"decode":25.5,"slice":24,"degauss":15.5,"feed":19,"powerOn":14.5,"powerOff":18,"rail":20.5,"wake":-1.5,"sleep":-0.5,"think":0,"happy":-0.5,"wink":-1,"alert":-3.5,"cheer":3,"crew":-5,"say":-1,"loop:snore":-5.5,"loop:work":15.5,"loop:power":0,"loop:swing":-19.5,"loop:bed":-3}}/* TRIM:end */;
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
    wineGlass(c, o, t, m, g, d) { const f = mf(fold(m, 102)); g = g == null ? 0.08 : g; d = d || 1.4; tone(c, o, t, { f, d, g, a: 0.05, hold: d * 0.3 }); tone(c, o, t, { f: f * 1.0035, d, g: g * 0.6, a: 0.07 }); if (f * 2.32 < PMAX) tone(c, o, t, { f: f * 2.32, d: d * 0.6, g: g * 0.1, a: 0.04 }); },
    tink(c, o, t, m, g) { const f = mf(fold(m, 106)); g = g == null ? 0.06 : g; tone(c, o, t, { f, d: 0.11, g, a: 0.001 }); if (f * 2.32 < PMAX) tone(c, o, t, { f: f * 2.32, d: 0.05, g: g * 0.3, a: 0.001 }); },
    bloop(c, o, t, f, g, up) { tone(c, o, t, { f, f2: up === false ? f * 0.45 : f * 2.6, glide: 0.07, d: 0.12, g: g == null ? 0.15 : g, a: 0.003 }); },
    sine(c, o, t, m, g, d, a) { tone(c, o, t, { f: mf(m), d: d || 0.25, g: g == null ? 0.12 : g, a: a || 0.005 }); },
    click(c, o, t, g, f) { g = g == null ? 0.08 : g; f = f || 3000; hiss(c, o, t, { d: 0.006, f, q: 1.2, g }); tone(c, o, t, { f: f * 0.6, d: 0.018, g: g * 0.4, a: 0.0008 }); },
    chip(c, o, t, m, d, g, duty, m2) { tone(c, o, t, { wave: pulse(c, duty || 0.25), f: mf(m), f2: m2 != null ? mf(m2) : null, d: d || 0.08, g: g == null ? 0.08 : g, a: 0.001, lp: 7000, hold: (d || 0.08) * 0.75 }); },
    tri(c, o, t, m, d, g, m2) { tone(c, o, t, { type: 'triangle', f: mf(m), f2: m2 != null ? mf(m2) : null, d: d || 0.1, g: g == null ? 0.12 : g, a: 0.001, hold: (d || 0.1) * 0.7 }); },
    crunch(c, o, t, d, g, f) { hiss(c, o, t, { d: d || 0.06, f: f || 1800, q: 0.6, type: 'lowpass', g: g == null ? 0.1 : g, a: 0.001 }); },
    clack(c, o, t, g, p) { g = g == null ? 0.14 : g; p = p || 1; hiss(c, o, t, { d: 0.012, f: 2600 * p, q: 1.4, g }); hiss(c, o, t, { d: 0.004, f: 5000, q: 2, g: g * 0.35 }); tone(c, o, t, { f: 175 * p, f2: 90 * p, d: 0.04, g: g * 0.7, a: 0.0008 }); tone(c, o, t + 0.003, { f: 3150 * p, d: 0.022, g: g * 0.12, a: 0.0005 }); },
    ratchet(c, o, t, n, step, g, p) { g = g == null ? 0.08 : g; p = p || 1; for (let i = 0; i < n; i++) { const tt = t + i * step * (1 + jit(0.08)); hiss(c, o, tt, { d: 0.007, f: 3300 * p, q: 2, g: g * (1 - (i / n) * 0.3) }); tone(c, o, tt, { f: 880 * p, d: 0.012, g: g * 0.25, a: 0.0005 }); } },
    ding(c, o, t, g, m) { const f = mf(m || 93); partials(c, o, t, f, [[1, 1, 1], [1.006, 0.5, 0.9], [2.76, 0.32, 0.4], [5.4, 0.12, 0.15]], 1.5, g == null ? 0.1 : g, 0.001); hiss(c, o, t, { d: 0.005, f: 4200, q: 2, g: (g || 0.1) * 0.4 }); },
    celesta(c, o, t, m, g, d) { const f = mf(fold(m, 103)); g = g == null ? 0.09 : g; partials(c, o, t, f, [[1, 1, 1], [4, 0.16, 0.25], [2, 0.12, 0.5]], d || 0.7, g, 0.001); hiss(c, o, t, { d: 0.004, f: 4000, q: 2, g: g * 0.2 }); },
    // a dot-matrix print-head burst: a square at the pin rate, gated by a slower square, through the head's band
    printBuzz(c, o, t, d, f, g) {
      const s = c.createOscillator(); s.type = 'square'; s.frequency.value = f || 700;
      const bp = filt(c, s, 'bandpass', 2300, 1.4), hp = filt(c, bp, 'highpass', 500, 0.7);
      const am = c.createGain(); am.gain.value = 0.5; hp.connect(am);
      const l = c.createOscillator(); l.type = 'square'; l.frequency.value = 95 + R() * 20; const lg = c.createGain(); lg.gain.value = 0.5; l.connect(lg); lg.connect(am.gain);
      const e = env(c, t, g == null ? 0.12 : g, 0.002, d, d * 0.85); am.connect(e); e.connect(o);
      s.start(t); l.start(t); s.stop(t + d + 0.05); l.stop(t + d + 0.05);
      hiss(c, o, t, { d, f: 3000, q: 1, g: (g || 0.12) * 0.15, hold: d * 0.8 });
    },
    ntick(c, o, t, f, g, d) { g = g == null ? 0.06 : g; tone(c, o, t, { f: f || 2640, d: d || 0.035, g, a: 0.004 }); hiss(c, o, t, { d: 0.004, f: 5000, q: 2.5, g: g * 0.3, a: 0.0006 }); },
    hum(c, o, t, f1, f2, d, g, lp1, lp2) {
      const s = c.createOscillator(); s.type = 'sawtooth'; s.frequency.setValueAtTime(f1, t); s.frequency.exponentialRampToValueAtTime(f2, t + d * 0.9);
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 5; lp.frequency.setValueAtTime(lp1 || 260, t); lp.frequency.exponentialRampToValueAtTime(lp2 || 2600, t + d * 0.8);
      const e = env(c, t, g == null ? 0.05 : g, 0.04, d); s.connect(lp); lp.connect(e); e.connect(o); s.start(t); s.stop(t + d + 0.05);
    },
    buzz(c, o, t, f, d, g, bp) {
      const s = c.createOscillator(); s.type = 'sawtooth'; s.frequency.value = f;
      const b = filt(c, s, 'bandpass', bp || 850, 1.1), l = filt(c, b, 'lowpass', 1800, 0.5), h = filt(c, l, 'highpass', 220, 0.6);
      const am = c.createGain(); am.gain.value = 0.65; h.connect(am);
      const lf = c.createOscillator(), lg = c.createGain(); lf.frequency.value = 31; lg.gain.value = 0.35; lf.connect(lg); lg.connect(am.gain);
      const e = env(c, t, g == null ? 0.08 : g, 0.005, d, d * 0.7); am.connect(e); e.connect(o);
      s.start(t); lf.start(t); s.stop(t + d + 0.05); lf.stop(t + d + 0.05);
    },
    whoosh(c, o, t, d, f1, f2, g, q) { hiss(c, o, t, { d, f: f1, f2, q: q || 0.9, g: g == null ? 0.06 : g, a: d * 0.42, pink: true }); },
    pad(c, o, t, ms, d, g, type, lp, a) {
      const lo = c.createBiquadFilter(); lo.type = 'lowpass'; lo.frequency.value = lp || 2400; lo.Q.value = 0.5; lo.connect(o);
      ms.forEach((m, i) => { const f = mf(m); tone(c, lo, t, { f, type: type || 'triangle', d, g: g / Math.sqrt(ms.length), a: a || 0.06, hold: d * 0.5, det: i % 2 ? 4 : -4 }); });
    },
    choir(c, o, t, ms, d, g, vowel) {
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.Q.value = 0.5; const hp = filt(c, lp, 'highpass', 150, 0.6); hp.connect(o);
      const F = FORM[vowel || 'a'];
      ms.forEach((m, i) => {
        const f = mf(m), peak = (g || 0.05) / Math.sqrt(ms.length), e = c.createGain();
        e.gain.setValueAtTime(1e-4, t); e.gain.exponentialRampToValueAtTime(peak, t + d * 0.3); e.gain.setValueAtTime(peak, t + d * 0.55); e.gain.exponentialRampToValueAtTime(1e-4, t + d);
        const mix = c.createGain();
        [-7, 6].forEach((cents, j) => {
          const s = c.createOscillator(), l = c.createOscillator(), lg = c.createGain();
          s.type = 'sawtooth'; s.frequency.value = f; s.detune.value = cents; l.frequency.value = 4.7 + i * 0.31 + j * 0.2; lg.gain.value = 9;
          l.connect(lg); lg.connect(s.detune); s.connect(mix); s.start(t); l.start(t); s.stop(t + d + 0.05); l.stop(t + d + 0.05);
        });
        F.forEach((fr, j) => { const b = c.createBiquadFilter(), bg = c.createGain(); b.type = 'bandpass'; b.frequency.value = fr; b.Q.value = fr / (80 + fr * 0.05); bg.gain.value = [1, 0.5, 0.18][j]; mix.connect(b); b.connect(bg); bg.connect(e); });
        e.connect(lp);
      });
      hiss(c, lp, t, { d, f: 1200, q: 3, g: (g || 0.05) * 0.06, a: d * 0.3, hold: d * 0.5 });
    }
  };

  /* ---------------------------------------------------------------- music */
  const SCALE = { major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10] };
  // the chapter chords: Welcome I, Computer IV, Project V, AI vi, Ready I an octave up (NieR: i, VI, III, VII, IV)
  const CHORDS = {
    major: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [9, 12, 16], [12, 16, 19]],
    dorian: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5], [5, 9, 12]]
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
    dots: { st: -1, bounce: 0.8, rate: 0.92, bright: 0.9 }
  };
  // the crew: Coordinator (crown) low and grand, Builder (hard hat) gruff, Reviewer (glasses) high and precise
  const CREW = { pip: { mul: 1, rate: 1, grit: 0, fs: 1 }, crown: { mul: 0.72, rate: 0.9, grit: 0.12, fs: 0.9 }, hardhat: { mul: 0.86, rate: 1, grit: 0.3, fs: 0.95 }, glasses: { mul: 1.32, rate: 1.12, grit: 0, fs: 1.1 } };
  const VOX = {
    friendly: { kind: 'formant', w1: 'triangle', saw: 0.28, q: 7, fs: 1.18, lp: 4300, direct: 0.25, vib: [5.8, 16], gain: 0.55, att: 0.01, cons: 0.35, base: 285, bounce: 2.4, cps: 32 },
    glass: { kind: 'formant', w1: 'sine', saw: 0.1, oct: 0.32, q: 5, fs: 1.3, lp: 6000, direct: 0.35, vib: [4.6, 12], breath: 0.22, shimmer: 0.05, gain: 0.55, att: 0.016, cons: 0.25, base: 345, bounce: 1.9, cps: 29 },
    basic: { kind: 'chirp', gain: 0.32, base: 740, bounce: 1.3, att: 0.004, rel: 0.012, maxSyl: 0.075, cons: 0.1, cps: 36 },
    phosphor: { kind: 'pulse', duty: 0.25, gain: 0.24, root: 72, quant: [0, 2, 4, 7, 9, 12, 14, 16], maxSyl: 0.03, blip: 2, lp: 6500, cps: 50 },
    teletype: { kind: 'buzz', gain: 0.42, root: 74, quant: [0, 2, 4, 5, 7, 9, 11, 12], maxSyl: 0.034, blip: 2, cps: 46 },
    nier: { kind: 'formant', w1: 'sawtooth', saw: 0, q: 10, fs: 1.0, lp: 3200, direct: 0.08, vib: null, gain: 0.5, att: 0.004, rel: 0.006, cons: 0.2, base: 205, bounce: 0.25, mono: true, ring: 32, maxSyl: 0.075, cps: 52 }
  };
  const VOWEL_RE = /[aeiouyàáâäèéêëìíîïòóôöùúûü]/i;
  function vowelOf(g) {
    g = g.toLowerCase();
    if (/^(ee|ea|ie|ey)/.test(g)) return 'i';
    if (/^(oo|ew)/.test(g)) return 'u';
    if (/^(ai|ay|ei)/.test(g)) return 'e';
    if (/^(ou|au|aw|oa)/.test(g)) return 'o';
    const ch = g.normalize('NFD')[0];
    return { a: 'a', e: 'e', i: 'i', y: 'i', o: 'o', u: 'u' }[ch] || 'a';
  }
  function onsetOf(cl) {
    cl = cl.toLowerCase();
    if (!cl) return null;
    if (/(sh|ch|th)$/.test(cl)) return 's';
    const ch = cl[cl.length - 1];
    if ('pbtdkgcq'.indexOf(ch) >= 0) return 'p';
    if ('szfvxj'.indexOf(ch) >= 0) return 's';
    if (ch === 'h') return 'h';
    if ('mn'.indexOf(ch) >= 0) return 'n';
    return 'l';
  }
  function endOf(text) {
    const s = String(text).trim();
    if (/(…|\.\.\.)["”’)]*$/.test(s)) return 'trail';
    if (/\?["”’)]*$/.test(s)) return 'ask';
    if (/!["”’)]*$/.test(s)) return 'exclaim';
    if (/\.["”’)]*$/.test(s)) return 'stop';
    return 'open';
  }
  // the line's syllables, each at the moment its letters are typed: [{ t, d, v, p, p2, on, g, leg }]
  function textScript(text, V, mood, cps) {
    const M = MOOD[mood] || MOOD.idle, s = String(text), out = [], words = [];
    const re = /[A-Za-zÀ-ÿ0-9']+/g; let m;
    while ((m = re.exec(s))) words.push([m[0], m.index]);
    words.forEach(([w, w0], wi) => {
      const groups = [];
      for (let j = 0; j < w.length;) {
        if (VOWEL_RE.test(w[j]) && !(j === 0 && /y/i.test(w[j]) && w.length > 1)) { let k = j; while (k < w.length && VOWEL_RE.test(w[k])) k++; groups.push([j, k]); j = k; } else j++;
      }
      // a silent final e ("time", "name") is no syllable
      if (groups.length > 1) { const [a, b] = groups[groups.length - 1]; if (b === w.length && b - a === 1 && /e/i.test(w[a]) && w.length > 3) groups.pop(); }
      if (!groups.length) { if (/^\d+$/.test(w)) for (let k = 0; k < Math.min(w.length, 4); k++) groups.push([k, k + 1]); else groups.push([0, w.length]); }
      groups.forEach(([a, b], gi) => {
        const prevEnd = gi === 0 ? 0 : groups[gi - 1][1];
        const i0 = w0 + (gi === 0 ? 0 : Math.floor((prevEnd + a) / 2));
        const i1 = w0 + (gi === groups.length - 1 ? w.length : Math.floor((b + groups[gi + 1][0]) / 2));
        const digit = /\d/.test(w[a]);
        out.push({ i0, i1, v: digit ? 'i' : vowelOf(w.slice(a, b)), on: onsetOf(w.slice(prevEnd, a)), stress: gi === 0 && groups.length > 1, wi, last: gi === groups.length - 1, lastWord: wi === words.length - 1 });
      });
    });
    const n = out.length, end = endOf(s), excl = /!/.test(s), maxSyl = V.maxSyl || 0.16;
    const bounce = (V.bounce || 1) * M.bounce * (V.mono ? 0.15 : 1);
    return out.map((q, j) => {
      const t = q.i0 / cps, room = (q.i1 - q.i0) / cps;
      let d = clamp(room - 0.012, 0.045, maxSyl);
      let p = M.st + (excl ? 1.5 : 0) - 2.2 * (n > 1 ? j / (n - 1) : 0) * (V.mono ? 0.25 : 1);
      p += (j % 2 ? 0.8 : -0.4) * bounce * 0.6 + jit(bounce * 0.7);
      if (q.stress) p += 1.4 * (V.mono ? 0.2 : 1);
      let p2 = p - 0.6, g = q.stress ? 1.08 : 1;
      if (j === n - 1) {
        const k = V.mono ? 0.25 : 1;
        if (end === 'ask') p2 = p + 5 * k;
        else if (end === 'exclaim') { p += 1.5 * k; p2 = p - 2 * k; g = 1.1; }
        else if (end === 'trail') { p2 = p - 4 * k; d = Math.min(maxSyl * 1.6, d * 1.5); g = 0.8; }
        else if (end === 'stop') p2 = p - 3 * k;
        else p2 = p - 1.5 * k;
      }
      if (j === 0 && M.hum && !V.mono) q.on = 'n';
      const next = out[j + 1], leg = !!(next && next.wi === q.wi);
      return { t, d, v: q.v, p, p2, on: q.on, g, leg };
    });
  }
  // the beeping voices (phosphor, teletype): a blip every few letters, each on a note of the scale
  function blipScript(text, V, mood, cps) {
    const M = MOOD[mood] || MOOD.idle, s = String(text), out = [], end = endOf(s);
    let letters = 0;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (!/[A-Za-zÀ-ÿ0-9]/.test(ch)) continue;
      if (letters++ % (V.blip || 2)) continue;
      const vow = VOWEL_RE.test(ch), h = (ch.toLowerCase().charCodeAt(0) * 7 + i) % 4;
      const deg = vow ? 4 + (h % 3) : h;
      out.push({ t: i / cps, d: V.maxSyl, deg, p: 0, p2: 0, g: vow ? 1 : 0.85 });
    }
    const n = out.length;
    out.forEach((q, j) => {
      q.deg += Math.round(M.st / 2.5);
      if (j >= n - 2 && end === 'ask') q.deg += j === n - 1 ? 3 : 1;
      if (j === n - 1 && end === 'exclaim') q.deg += 2;
      if (j >= n - 2 && (end === 'stop' || end === 'trail')) q.deg -= j === n - 1 ? 2 : 1;
      if (end === 'trail' && j === n - 1) q.d *= 2;
    });
    return out;
  }
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
    const last = new Map();
    const setT = (p, v, t, tc) => { const lt = last.get(p) || 0; t = Math.max(t, lt + 1e-4); last.set(p, t); p.setTargetAtTime(v, t, Math.max(0.0008, tc)); };
    const end = script.reduce((m, s) => Math.max(m, s.t + s.d), 0), stopAt = t0 + end + 0.4;
    const oscs = [], fps = [], pitched = [];
    const env = c.createGain(); env.gain.setValueAtTime(0, t0);
    let into = env;
    if (V.ring) { const rg = c.createGain(); rg.gain.value = 0.7; const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = V.ring; lg.gain.value = 0.3; l.connect(lg); lg.connect(rg.gain); l.start(t0); l.stop(stopAt); oscs.push(l); env.connect(rg); rg.connect(out); } else env.connect(out);
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
      mk('sine', 1).connect(into);
    } else if (V.kind === 'pulse') {
      const lp = filt(c, mk(null, 1, pulse(c, V.duty)), 'lowpass', V.lp, 0.6); lp.connect(into);
    } else {
      // teletype: a pin-rate square gated by a slower square through the print head's band
      const s = mk('square', 1), bp = filt(c, s, 'bandpass', 2300, 1.4), hp = filt(c, bp, 'highpass', 450, 0.7);
      const am = c.createGain(); am.gain.value = 0.55; hp.connect(am); am.connect(into);
      const l = c.createOscillator(); l.type = 'square'; l.frequency.value = 92; const lg = c.createGain(); lg.gain.value = 0.45; l.connect(lg); lg.connect(am.gain); l.start(t0); l.stop(stopAt); oscs.push(l);
    }
    if (V.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = V.vib[0]; lg.gain.value = V.vib[1]; l.connect(lg); pitched.forEach((o) => lg.connect(o.detune)); l.start(t0); l.stop(stopAt); oscs.push(l); }
    if (V.kind === 'formant' || V.kind === 'chirp') {
      const ns = c.createBufferSource(); ns.buffer = noiseBuf(c); ns.loop = true; nbp = c.createBiquadFilter(); nbp.type = 'bandpass'; nbp.Q.value = 1.2; nbp.frequency.value = 2500;
      ng = c.createGain(); ng.gain.setValueAtTime(0, t0); ns.connect(nbp); nbp.connect(ng); ng.connect(out); ns.start(t0, R()); ns.stop(stopAt); oscs.push(ns);
    }
    const peak = V.gain;
    if (V.kind === 'pulse' || V.kind === 'buzz') {
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
        const ts = t0 + s.t, te = ts + s.d, f0 = base * Math.pow(2, s.p / 12), f1 = base * Math.pow(2, s.p2 / 12);
        fps.forEach(([p, mul]) => { setT(p, f0 * mul, ts - 0.004, 0.004); setT(p, f1 * mul, ts + s.d * 0.3, s.d * 0.35); });
        if (bands) { const F = FORM[s.v] || FORM.a; bands.forEach((b, k) => setT(b.frequency, F[k] * V.fs * C.fs, ts - 0.01, 0.012)); }
        const lvl = peak * (s.g || 1) * (s.v === 'm' ? 0.7 : 1);
        setT(env.gain, lvl, ts, s.on === 'n' ? 0.02 : V.att || 0.01);
        const nx = script[j + 1], leg = V.kind !== 'chirp' && !V.mono && s.leg && nx && nx.t - (s.t + s.d) < 0.03;
        setT(env.gain, leg ? lvl * 0.4 : 0, te - 0.01, V.rel || 0.014);
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
  function scriptFor(kitName, name) {
    const V = VOX[kitName], s = VS[name];
    if (V.kind === 'pulse' || V.kind === 'buzz') return blipsFromScript(s, V);
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
      hover: (c, o, t, op, k) => I.wineGlass(c, o, t, k.chord()[k.v % 3] + 24, 0.02, 0.3),
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
        const ch = k.chord(4); I.pad(c, o, t, ch.concat(ch.map((m) => m + 12)), 2.4, 0.06, 'sine', 6000, 0.4);
        for (let i = 0; i < 9; i++) I.glassBell(c, o, t + 0.2 + i * 0.075, ch[i % 3] + 12 * Math.floor(i / 3), 0.06, 1.3);
        for (let i = 0; i < 5; i++) I.bloop(c, o, t + 0.4 + i * 0.12, 700 + R() * 900, 0.035);
        I.glassBell(c, o, t + 0.95, k.root + 36, 0.05, 1.8);
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
      open: (c, o, t) => { hiss(c, o, t, { d: 0.005, f: 1800, q: 3, g: 0.08 }); tone(c, o, t, { f: 62, f2: 40, d: 0.16, g: 0.2, a: 0.002 }); hiss(c, o, t + 0.01, { d: 0.22, f: 3000, type: 'highpass', g: 0.03 }); [72, 79, 84].forEach((m, i) => I.chip(c, o, t + 0.12 + i * 0.04, m, 0.05, 0.05)); },
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
      degauss: (c, o, t) => {
        tone(c, o, t, { f: 55, f2: 38, d: 0.7, g: 0.24, a: 0.005 });
        const s = c.createOscillator(); s.type = 'sawtooth'; s.frequency.value = 60; const lp = filt(c, s, 'lowpass', 320, 0.8);
        const am = c.createGain(); am.gain.value = 0.6; lp.connect(am); const l = c.createOscillator(), lg = c.createGain(); l.frequency.setValueAtTime(11, t); l.frequency.exponentialRampToValueAtTime(3, t + 0.9); lg.gain.value = 0.4; l.connect(lg); lg.connect(am.gain);
        const e = env(c, t, 0.06, 0.01, 0.95); am.connect(e); e.connect(o); s.start(t); l.start(t); s.stop(t + 1); l.stop(t + 1);
        tone(c, o, t + 0.02, { f: 1250, d: 0.8, g: 0.018, a: 0.01, vib: [7, 70] });
        hiss(c, o, t + 0.2, { d: 0.6, f: 3500, type: 'highpass', g: 0.012, a: 0.1 });
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
  // the tube switching on: a relay, a thump, static, a faint rising whine that fades, the hum coming up
  function crtOn(c, o, t) {
    I.clack(c, o, t, 0.08, 1.3);
    tone(c, o, t + 0.02, { f: 48, f2: 30, d: 0.28, g: 0.3, a: 0.003 });
    hiss(c, o, t + 0.03, { d: 0.35, f: 2600, type: 'highpass', g: 0.05, a: 0.004 });
    for (let i = 0; i < 6; i++) hiss(c, o, t + 0.05 + R() * 0.3, { d: 0.004, f: 3000, q: 2, g: 0.04 });
    tone(c, o, t + 0.1, { f: 7600, f2: 8300, lin: true, glide: 1.2, d: 1.6, g: 0.005, a: 0.35 });
    tone(c, o, t + 0.05, { type: 'sawtooth', f: 60, d: 1.1, g: 0.03, a: 0.3, lp: 250 });
  }
  function crtOff(c, o, t, k) {
    tone(c, o, t, { f: 1200, f2: 60, glide: 0.35, d: 0.4, g: 0.06 * k, a: 0.002 });
    hiss(c, o, t, { d: 0.005, f: 1800, q: 3, g: 0.06 * k });
    hiss(c, o, t + 0.05, { d: 0.4, f: 3000, type: 'highpass', g: 0.02 * k, a: 0.01 });
  }
  KIT.teletype = {
    root: 79, mode: 'major', motif: [0, 2, 4, 7], room: { len: 0.45, rt: 0.3, bright: 0.75, er: true, wet: 0.1 },
    ev: {
      tap: (c, o, t, op, k) => I.clack(c, o, t, 0.12, 0.95 + (k.v % 3) * 0.05),
      hover: (c, o, t) => { hiss(c, o, t, { d: 0.003, f: 2800, q: 3, g: 0.02 }); tone(c, o, t, { f: 1200, d: 0.008, g: 0.006, a: 0.0005 }); },
      select: (c, o, t, op, k) => { I.clack(c, o, t, 0.12); I.celesta(c, o, t + 0.02, k.chord()[2] + 12, 0.045, 0.5); },
      toggleOn: (c, o, t) => { I.clack(c, o, t, 0.1, 0.9); I.clack(c, o, t + 0.03, 0.08, 1.15); },
      toggleOff: (c, o, t) => { I.clack(c, o, t, 0.08, 1.1); I.clack(c, o, t + 0.03, 0.1, 0.8); },
      next: (c, o, t) => { hiss(c, o, t, { d: 0.14, f: 1800, f2: 3500, q: 3, g: 0.05, a: 0.02 }); I.ratchet(c, o, t + 0.02, 3, 0.02, 0.05); I.clack(c, o, t + 0.15, 0.1, 0.9); },
      back: (c, o, t) => { I.ratchet(c, o, t, 2, 0.035, 0.07, 0.85); I.clack(c, o, t + 0.07, 0.08, 0.85); },
      open: (c, o, t) => { tone(c, o, t, { type: 'sawtooth', f: 30, f2: 55, glide: 0.4, d: 0.5, g: 0.07, a: 0.15, lp: 320 }); I.clack(c, o, t + 0.42, 0.12, 0.75); },
      close: (c, o, t) => { tone(c, o, t, { type: 'sawtooth', f: 55, f2: 28, glide: 0.45, d: 0.5, g: 0.06, a: 0.02, lp: 320 }); I.clack(c, o, t + 0.05, 0.1, 0.8); },
      key: (c, o, t, op, k) => I.clack(c, o, t, 0.1, 0.92 + ((k.idx * 7 + k.v) % 5) * 0.04),
      warn: (c, o, t) => I.ding(c, o, t, 0.1, 93),
      lower: (c, o, t, op, k) => { I.ratchet(c, o, t, 3 + Math.round(clamp(k.len || 150, 0, 400) / 120), 0.028, 0.05); tone(c, o, t, { f: 140, f2: 90, d: 0.06, g: 0.08, a: 0.001 }); },
      ghost: (c, o, t) => { I.ratchet(c, o, t, 1, 0.03, 0.04); hiss(c, o, t, { d: 0.2, f: 2500, q: 0.7, g: 0.012, a: 0.06 }); },
      land: (c, o, t, op, k) => { tone(c, o, t, { f: 120 + (k.v % 3) * 10, f2: 70, d: 0.08, g: 0.16, a: 0.001 }); I.clack(c, o, t, 0.08, 0.7); },
      lift: (c, o, t) => I.ratchet(c, o, t, 4, 0.022, 0.05, 1.2),
      hop: (c, o, t) => { hiss(c, o, t, { d: 0.03, f: 2000, f2: 4000, q: 2, g: 0.06 }); I.click(c, o, t, 0.05, 2600); },
      swing: (c, o, t) => hiss(c, o, t, { d: 0.25, f: 1500, f2: 3000, q: 0.9, g: 0.03, a: 0.08, pink: true }),
      tryOn: (c, o, t, op, k) => { hiss(c, o, t, { d: 0.1, f: 2500, q: 0.8, g: 0.05, a: 0.02, pink: true }); hiss(c, o, t + 0.09, { d: 0.08, f: 3500, q: 0.8, g: 0.04, a: 0.02, pink: true }); SIG.teletype(c, o, t + 0.12, k); },
      sparkle: (c, o, t, op, k) => { const ch = k.chord(); for (let i = 0; i < 4; i++) I.celesta(c, o, t + i * 0.06 + R() * 0.02, ch[(i + k.v) % 3] + 12, 0.035, 0.5); },
      confetti: (c, o, t, op, k) => {
        for (let i = 0; i < 10; i++) I.clack(c, o, t + i * 0.045, 0.09, 0.9 + R() * 0.2);
        hiss(c, o, t + 0.47, { d: 0.18, f: 1800, f2: 3800, q: 3, g: 0.05, a: 0.03 }); I.ding(c, o, t + 0.64, 0.1, 93);
        [[79, 0.1], [81, 0.1], [83, 0.1], [86, 0.2], [91, 0.5]].reduce((tt, [m, d]) => { I.celesta(c, o, tt, m, 0.09, 0.9); return tt + d; }, t + 0.75);
        tear(c, o, t + 1.4, 0.4);
      },
      chapter: (c, o, t, op, k) => { feed(c, o, t); const n = motifRun(k, t + 0.25, 0.12, (at, m, i, last) => I.celesta(c, o, at, m + 12, 0.09, last ? 1 : 0.5)); if (k.ch >= 4) I.ding(c, o, t + 0.25 + n * 0.12, 0.08, 93); },
      tick: (c, o, t, op, k) => { I.clack(c, o, t, 0.12); I.clack(c, o, t + 0.04, 0.08, 1.1); const s = [0, 2, 4, 7][clamp(k.idx, 0, 3)]; I.celesta(c, o, t + 0.02, k.root + s, 0.08, 0.6); if (k.idx >= 3) { hiss(c, o, t + 0.12, { d: 0.14, f: 1800, f2: 3500, q: 3, g: 0.04, a: 0.02 }); I.ding(c, o, t + 0.27, 0.08, 93); } },
      block: (c, o, t, op, k) => { I.clack(c, o, t, 0.14, 0.7); tone(c, o, t, { f: 110, f2: 70, d: 0.07, g: 0.12, a: 0.001 }); const s = [0, 2, 4, 5, 7, 9][clamp(k.idx, 0, 5)]; I.celesta(c, o, t + 0.02, k.root + s, 0.08, 0.6); if (k.count && k.idx >= k.count - 1) { hiss(c, o, t + 0.12, { d: 0.14, f: 1800, f2: 3500, q: 3, g: 0.04, a: 0.02 }); I.ding(c, o, t + 0.28, 0.09, 93); } },
      power: (c, o, t, op, k) => { tone(c, o, t, { type: 'sawtooth', f: 40, f2: 90, glide: 0.4, d: 0.5, g: 0.06, a: 0.1, lp: 600 }); I.celesta(c, o, t + 0.3, k.chord()[k.idx % 3] + 12, 0.08, 0.8); },
      score: (c, o, t) => { for (let i = 0; i < 4; i++) I.clack(c, o, t + i * 0.05, 0.06, 1.1); },
      lock: (c, o, t) => I.clack(c, o, t, 0.1, 1.05),
      decode: (c, o, t) => I.printBuzz(c, o, t, 0.12, 700, 0.06),
      slice: (c, o, t) => tear(c, o, t, 0.12),
      degauss: (c, o, t) => tone(c, o, t, { type: 'sawtooth', f: 40, f2: 60, d: 0.3, g: 0.04, a: 0.05, lp: 300 }),
      feed: (c, o, t) => feed(c, o, t),
      powerOn: (c, o, t) => { tone(c, o, t, { type: 'sawtooth', f: 25, f2: 60, glide: 0.8, d: 1.2, g: 0.07, a: 0.3, hold: 0.9, lp: 400 }); hiss(c, o, t, { d: 1.1, f: 400, f2: 900, q: 0.8, g: 0.015, a: 0.4, pink: true }); I.clack(c, o, t + 0.9, 0.12, 0.75); tone(c, o, t + 0.9, { f: 120, f2: 70, d: 0.08, g: 0.1 }); },
      powerOff: (c, o, t) => { tone(c, o, t, { type: 'sawtooth', f: 60, f2: 25, glide: 0.6, d: 0.7, g: 0.06, a: 0.02, lp: 400 }); I.clack(c, o, t + 0.05, 0.1, 0.75); },
      rail: (c, o, t) => { hiss(c, o, t, { d: 0.12, f: 1200, f2: 2400, q: 2, g: 0.03, a: 0.02 }); I.ratchet(c, o, t + 0.04, 2, 0.04, 0.04); },
      cheer: (c, o, t, op, k) => { vocal(c, o, t, 'teletype', 'cheer', { mood: 'happy' }); const ch = k.chord(); ch.forEach((m, i) => I.celesta(c, o, t + 0.14 + i * 0.04, m + 12, 0.07, 0.8)); I.ding(c, o, t + 0.3, 0.06, 93 + (k.v % 2) * 2); },
      crew: (c, o, t, op, k) => { crewVoices(c, o, t, 'teletype'); [[79, 0.1], [83, 0.1], [86, 0.1], [91, 0.5]].reduce((tt, [m, d]) => { I.celesta(c, o, tt, m, 0.09, 0.9); return tt + d; }, t + 0.5); I.ding(c, o, t + 0.85, 0.09, 93); }
    },
    accent: { alert: (c, o, t) => I.ding(c, o, t + 0.05, 0.05, 98) }
  };
  function feed(c, o, t) { I.ratchet(c, o, t, 6, 0.03, 0.07); hiss(c, o, t, { d: 0.22, f: 2200, q: 0.7, g: 0.02, a: 0.05 }); tone(c, o, t + 0.2, { f: 90, d: 0.05, g: 0.1, a: 0.001 }); }
  function tear(c, o, t, d) {
    const s = c.createBufferSource(); s.buffer = noiseBuf(c); s.loop = true; const b = filt(c, s, 'bandpass', 2500, 0.9);
    const am = c.createGain(); am.gain.value = 0.5; b.connect(am); const l = c.createOscillator(), lg = c.createGain(); l.type = 'square'; l.frequency.value = 55 + R() * 20; lg.gain.value = 0.5; l.connect(lg); lg.connect(am.gain);
    const e = env(c, t, 0.08, 0.01, d, d * 0.6); am.connect(e); e.connect(o); s.start(t, R()); l.start(t); s.stop(t + d + 0.05); l.stop(t + d + 0.05);
  }
  KIT.nier = {
    root: 69, mode: 'dorian', motif: [12, 15, 19, 22], room: { len: 3.4, rt: 3, bright: 0.3, pre: 0.03, wet: 0.28 },
    ev: {
      tap: (c, o, t) => I.ntick(c, o, t, 2640, 0.05),
      hover: (c, o, t, op, k) => I.ntick(c, o, t, [2640, 2349, 2794][k.v % 3], 0.035, 0.03),
      select: (c, o, t) => { I.sine(c, o, t, 88, 0.06, 0.07, 0.004); I.sine(c, o, t + 0.06, 93, 0.06, 0.2, 0.004); I.ntick(c, o, t, 2640, 0.03); },
      toggleOn: (c, o, t) => { I.ntick(c, o, t, 2093, 0.04); I.ntick(c, o, t + 0.04, 2640, 0.04); },
      toggleOff: (c, o, t) => { I.ntick(c, o, t, 2640, 0.03); tone(c, o, t + 0.04, { f: 1760, d: 0.04, g: 0.03, a: 0.004, lp: 1800 }); },
      next: (c, o, t) => { I.sine(c, o, t, 88, 0.05, 0.06, 0.004); I.sine(c, o, t + 0.05, 93, 0.05, 0.16, 0.004); I.whoosh(c, o, t, 0.25, 800, 2000, 0.02); },
      back: (c, o, t) => { tone(c, o, t, { f: 880, d: 0.06, g: 0.05, a: 0.004, lp: 1800 }); tone(c, o, t + 0.06, { f: 659, d: 0.12, g: 0.05, a: 0.004, lp: 1800 }); },
      open: (c, o, t) => { I.hum(c, o, t, 98, 196, 0.5, 0.035); for (let i = 0; i < 4; i++) I.ntick(c, o, t + 0.1 + i * 0.03, 2093 + i * 180, 0.03); },
      close: (c, o, t) => { I.hum(c, o, t, 196, 98, 0.45, 0.03, 2600, 260); I.ntick(c, o, t, 2349, 0.03); },
      key: (c, o, t, op, k) => I.ntick(c, o, t, 3000 + (k.v % 3) * 200, 0.02, 0.02),
      warn: (c, o, t) => I.buzz(c, o, t, 110, 0.22, 0.06),
      lower: (c, o, t) => { tone(c, o, t, { f: 4200, d: 0.02, g: 0.02, a: 0.001 }); tone(c, o, t, { f: 2100, d: 0.04, g: 0.02, a: 0.001 }); tone(c, o, t + 0.02, { f: 1760, f2: 1318, d: 0.05, g: 0.02 }); },
      ghost: (c, o, t) => { hiss(c, o, t, { d: 0.3, f: 3000, q: 2, g: 0.01, a: 0.1 }); I.ntick(c, o, t + 0.1, 2349, 0.02); },
      land: (c, o, t) => { tone(c, o, t, { f: 220, f2: 160, d: 0.05, g: 0.08, a: 0.001 }); I.ntick(c, o, t, 1760, 0.03); },
      lift: (c, o, t) => { I.ntick(c, o, t, 1760, 0.03); I.ntick(c, o, t + 0.04, 2349, 0.03); I.whoosh(c, o, t, 0.25, 900, 2400, 0.012); },
      hop: (c, o, t) => { I.ntick(c, o, t, 2093, 0.025); I.ntick(c, o, t + 0.03, 2640, 0.02); },
      swing: (c, o, t) => hiss(c, o, t, { d: 0.5, f: 900, q: 0.6, type: 'lowpass', g: 0.015, a: 0.2, pink: true }),
      tryOn: (c, o, t, op, k) => { for (let i = 0; i < 6; i++) I.ntick(c, o, t + i * 0.022, 2000 + R() * 2000, 0.015, 0.02); SIG.nier(c, o, t + 0.14, k); },
      sparkle: (c, o, t) => { for (let i = 0; i < 4; i++) I.ntick(c, o, t + i * 0.05 + R() * 0.02, 2400 + R() * 1400, 0.025, 0.04); },
      confetti: (c, o, t, op, k) => { I.choir(c, o, t, [57, 60, 64, 67], 2.8, 0.07, 'a'); [81, 88, 93].forEach((m, i) => I.glock(c, o, t + 0.3 + i * 0.4, m, 0.05, 2)); tone(c, o, t, { f: 55, d: 2.4, g: 0.05, a: 0.6, hold: 1.2 }); },
      chapter: (c, o, t, op, k) => {
        for (let i = 0; i < 4; i++) I.ntick(c, o, t + i * 0.03, 2093 + i * 180, 0.03);
        I.pad(c, o, t + 0.1, k.chord().map((m) => m - 12), 1.6, 0.05, 'triangle', 1400, 0.3);
        const n = motifRun(k, t + 0.15, 0.2, (at, m, i, last) => I.glock(c, o, at, m, 0.05, last ? 2 : 1.2));
        if (k.ch >= 4) I.choir(c, o, t + 0.15 + n * 0.2, k.chord(4).map((m) => m - 12), 2, 0.05, 'a');
      },
      tick: (c, o, t, op, k) => { I.ntick(c, o, t, 2640, 0.04); const s = [0, 2, 3, 7][clamp(k.idx, 0, 3)]; I.sine(c, o, t + 0.01, k.root + 12 + s, 0.05, 0.25, 0.004); if (k.idx >= 3) { I.sine(c, o, t + 0.1, 88, 0.05, 0.07, 0.004); I.sine(c, o, t + 0.16, 93, 0.05, 0.3, 0.004); } },
      block: (c, o, t, op, k) => { tone(c, o, t, { f: 200, f2: 140, d: 0.06, g: 0.09, a: 0.001 }); I.ntick(c, o, t, 1760, 0.03); const s = [0, 2, 3, 5, 7, 9][clamp(k.idx, 0, 5)]; I.sine(c, o, t + 0.02, k.root + 12 + s, 0.05, 0.3, 0.004); if (k.count && k.idx >= k.count - 1) KIT.nier.ev.chapter(c, o, t + 0.15, op, Object.assign({}, k, { ch: 2 })); },
      power: (c, o, t, op, k) => { for (let i = 0; i < 6; i++) I.ntick(c, o, t + i * 0.025, 2200 + R() * 1600, 0.02, 0.02); I.hum(c, o, t + 0.05, 98, 196, 0.5, 0.03); I.glock(c, o, t + 0.3, k.chord()[k.idx % 3] + 12, 0.05, 1.5); },
      score: (c, o, t) => I.ntick(c, o, t, 2640, 0.02),
      lock: (c, o, t) => { [0, 0.07, 0.11].forEach((d, i) => I.ntick(c, o, t + d, 2093 + i * 270, 0.04)); I.sine(c, o, t + 0.15, 88, 0.05, 0.06, 0.004); I.sine(c, o, t + 0.21, 93, 0.05, 0.22, 0.004); },
      decode: (c, o, t) => { for (let i = 0; i < 14; i++) I.ntick(c, o, t + i * 0.02 + R() * 0.008, 2000 + R() * 2200, 0.015, 0.012); },
      slice: (c, o, t) => { for (let i = 0; i < 5; i++) I.buzz(c, o, t + i * 0.03 + R() * 0.006, 98 + R() * 220, 0.026, 0.035, 900 + R() * 1400); hiss(c, o, t + 0.01, { d: 0.16, f: 2400, q: 0.8, g: 0.012, a: 0.02 }); },
      degauss: (c, o, t) => { I.hum(c, o, t, 110, 82, 0.4, 0.03, 900, 300); },
      feed: (c, o, t) => { for (let i = 0; i < 3; i++) I.ntick(c, o, t + i * 0.04, 2349, 0.02); },
      powerOn: (c, o, t) => { I.hum(c, o, t, 98, 196, 0.8, 0.04); I.choir(c, o, t + 0.1, [57, 64], 1.3, 0.03, 'u'); for (let i = 0; i < 5; i++) I.ntick(c, o, t + 0.5 + i * 0.03, 2093 + i * 160, 0.03); },
      powerOff: (c, o, t) => { I.hum(c, o, t, 196, 98, 0.5, 0.035, 2600, 260); I.ntick(c, o, t, 2349, 0.03); },
      rail: (c, o, t) => { I.ntick(c, o, t, 2349, 0.03); I.ntick(c, o, t + 0.06, 2640, 0.025); },
      cheer: (c, o, t, op, k) => { vocal(c, o, t, 'nier', 'cheer', {}); I.sine(c, o, t + 0.15, 88, 0.05, 0.07, 0.004); I.sine(c, o, t + 0.21, 93, 0.05, 0.25, 0.004); I.glock(c, o, t + 0.3, k.chord()[k.v % 3] + 12, 0.04, 1.4); },
      crew: (c, o, t, op, k) => { crewVoices(c, o, t, 'nier'); I.choir(c, o, t + 0.35, [57, 64, 69, 72], 2.2, 0.06, 'a'); I.glock(c, o, t + 0.6, 93, 0.05, 1.8); }
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

  /* ---------------------------------------------------------------- loops */
  // { period(k) -> s, step(c, out, t, k, n) } for cycles; { make(c, out, t, k) -> { set(level, t), stop(t) } } for continuous
  const LOOPDEF = {
    snore: {
      period: () => 3.8,
      step(c, o, t, k) {
        const kn = k.kit;
        if (kn === 'phosphor') { hiss(c, o, t, { d: 1.2, f: 900, q: 1, g: 0.03, a: 0.5, pink: true }); [84, 81, 77].forEach((m, i) => I.chip(c, o, t + 1.6 + i * 0.28, m, 0.08, 0.025, 0.25)); return; }
        if (kn === 'teletype') { hiss(c, o, t, { d: 1.1, f: 800, q: 1, g: 0.03, a: 0.5, pink: true }); for (let i = 0; i < 3; i++) I.printBuzz(c, o, t + 1.6 + i * 0.3, 0.07, 520 - i * 60, 0.025); return; }
        if (kn === 'nier') { tone(c, o, t, { f: 110, d: 1.8, g: 0.04, a: 0.7 }); tone(c, o, t, { f: 165, d: 1.6, g: 0.015, a: 0.7 }); I.ntick(c, o, t + 0.9, 1760, 0.015); return; }
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
        else if (kn === 'teletype') { I.printBuzz(c, o, t, 0.16, alt ? 640 : 760, 0.05); if (!alt) I.ratchet(c, o, t + 0.2, 1, 0.03, 0.04); }
        else for (let i = 0; i < 4; i++) I.ntick(c, o, t + i * 0.035, 2000 + R() * 1500, 0.02, 0.015);
      }
    },
    power: {
      make(c, o, t, k) {
        const kn = k.kit, parts = [], lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; lp.Q.value = 0.5; lp.connect(o);
        const add = (type, f, g, det) => { const s = c.createOscillator(); s.type = type; s.frequency.value = f; if (det) s.detune.value = det; const gg = c.createGain(); gg.gain.value = g; s.connect(gg); gg.connect(lp); s.start(t); parts.push(s); return s; };
        const r = mf(k.root - 24);
        if (kn === 'friendly') { add('sine', r, 0.5); add('sine', r * 1.5, 0.3); add('triangle', r * 2, 0.15, 5); }
        else if (kn === 'glass') { add('sine', r * 4, 0.3); add('sine', r * 4 * 1.003, 0.3); add('sine', r * 6, 0.18, 3); add('sine', r * 8, 0.1, -4); lp.frequency.value = 5000; }
        else if (kn === 'basic') { add('sine', r, 0.5); add('sine', r * 1.5, 0.25); }
        else if (kn === 'phosphor') { add('sawtooth', 60, 0.4); add('sine', 120, 0.25); add('sine', 2600, 0.01); }
        else if (kn === 'teletype') { add('sawtooth', 50, 0.5); add('sine', 100, 0.2); }
        else { add('sawtooth', 55, 0.35); add('sawtooth', 82.4, 0.25, 4); add('sine', 220, 0.12); }
        const base = kn === 'glass' ? 2500 : 300;
        return { set(level, tt) { lp.frequency.setTargetAtTime(base + level * (kn === 'glass' ? 3000 : 1200), tt, 0.3); }, stop(tt) { parts.forEach((s) => { try { s.stop(tt); } catch (e) { /* stopped */ } }); } };
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
    bed: {
      period: (k) => ({ friendly: 11, glass: 13, basic: 30, phosphor: 0.7, teletype: 8, nier: 15 }[k.kit] || 10),
      step(c, o, t, k) {
        const kn = k.kit;
        if (kn === 'friendly') I.kalimba(c, o, t, [96, 100, 103, 108][Math.floor(R() * 4)], 0.012, 1.2);
        else if (kn === 'glass') I.wineGlass(c, o, t, [98, 105, 110][Math.floor(R() * 3)], 0.006, 2);
        else if (kn === 'phosphor') { if (R() < 0.6) hiss(c, o, t + R() * 0.5, { d: 0.003, f: 2500 + R() * 2000, q: 2, g: 0.012 }); }
        else if (kn === 'teletype') I.click(c, o, t, 0.02, 1500);
        else if (kn === 'nier') I.glock(c, o, t, [81, 88, 93][Math.floor(R() * 3)], 0.008, 2.5);
      },
      make(c, o, t, k) {
        const kn = k.kit, parts = [];
        const add = (type, f, g, lpf) => { const s = c.createOscillator(); s.type = type; s.frequency.value = f; const n = lpf ? filt(c, s, 'lowpass', lpf, 0.6) : s; const gg = c.createGain(); gg.gain.value = g; n.connect(gg); gg.connect(o); s.start(t); parts.push(s); return gg; };
        const nz = (pink, type, f, g) => { const s = c.createBufferSource(); s.buffer = pink ? pinkBuf(c) : noiseBuf(c); s.loop = true; const b = filt(c, s, type, f, 0.7), gg = c.createGain(); gg.gain.value = g; b.connect(gg); gg.connect(o); s.start(t, R() * 2); parts.push(s); return b; };
        if (kn === 'friendly') nz(true, 'lowpass', 350, 0.3);
        else if (kn === 'glass') { add('sine', mf(98), 0.05); add('sine', mf(98) * 1.004, 0.05); add('sine', mf(105), 0.03); nz(false, 'highpass', 3000, 0.02); }
        else if (kn === 'basic') nz(true, 'lowpass', 200, 0.12);
        else if (kn === 'phosphor') { add('sawtooth', 60, 0.5, 180); add('sine', 120, 0.2); nz(false, 'highpass', 4000, 0.02); }
        else if (kn === 'teletype') { add('sawtooth', 50, 0.4, 220); nz(true, 'lowpass', 600, 0.12); }
        else {
          add('sawtooth', 55, 0.3, 400); add('sawtooth', 82.4, 0.2, 400);
          const b = nz(true, 'bandpass', 400, 0.3); const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 0.07; lg.gain.value = 180; l.connect(lg); lg.connect(b.frequency); l.start(t); parts.push(l);
        }
        return { set() {}, stop(tt) { parts.forEach((s) => { try { s.stop(tt); } catch (e) { /* stopped */ } }); } };
      }
    }
  };

  // the continuous loops are built hot; this brings them near their place before the trims
  const LOOP_BASE = { snore: 1, work: 1, power: 0.04, swing: 0.3, bed: 0.03 };

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
  function graph(c, raw) {
    const r = res(c), key = raw ? 'rawg' : 'g'; if (r[key]) return r[key];
    const bus = c.createGain(), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 26; hp.Q.value = 0.7; bus.connect(hp);
    const master = c.createGain(); master.gain.value = 1;
    if (raw) { hp.connect(master); }
    else {
      const comp = c.createDynamicsCompressor(); comp.threshold.value = -7; comp.knee.value = 4; comp.ratio.value = 10; comp.attack.value = 0.003; comp.release.value = 0.15;
      const pre = c.createGain(); pre.gain.value = 1; hp.connect(pre); pre.connect(comp); comp.connect(master); master.gain.value = 1 / MAKEUP;
    }
    master.connect(c.destination);
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
    const send = c.createGain(); send.gain.value = VOICED.has(name) ? ({ glass: 0.3, nier: 0.16 }[kitName] || 0.35) : 1; head.connect(send); send.connect(roomOf(c, kitName, g.bus));
    return vg;
  }
  function newState(seed) { return { last: {}, at: {}, chapter: 0, r: seed != null ? rng(seed) : Math.random }; }
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
    if (op.chapter != null) st.chapter = clamp(op.chapter | 0, 0, 4);
    const prevR = R; R = st.r;
    try { fn(c, chain(c, g, kitName, name, op, raw), t, op, helper(kitName, op, st, variant(st, kitName, name))); }
    finally { R = prevR; }
    return true;
  }
  function sayOn(c, g, st, kitName, text, op, t, raw) {
    const V = VOX[kitName], timing = sayTiming(kitName, text, op);
    const prevR = R; R = st.r;
    try {
      const script = V.kind === 'pulse' || V.kind === 'buzz' ? blipScript(text, V, op.mood, timing.cps) : textScript(text, V, op.mood, timing.cps);
      if (!script.length) return null;
      return voice(c, chain(c, g, kitName, 'say', op, raw), t, script, kitName, op);
    } finally { R = prevR; }
  }
  function sayTiming(kitName, text, op) {
    const V = VOX[kitName], M = MOOD[(op && op.mood) || 'idle'] || MOOD.idle, C = CREW[(op && op.voice) || 'pip'] || CREW.pip;
    const cps = Math.round(V.cps * M.rate * C.rate * 10) / 10, n = String(text || '').length;
    return { cps, ms: n ? Math.round((n / cps) * 1000 + 140) : 0 };
  }

  /* ---------------------------------------------------------------- live state */
  const S = {
    ctx: null, g: null, st: newState(), muted: false, reduced: false, kit: 'friendly', theme: 'friendly-dark', unlocked: false,
    recording: false, log: [], loops: {}, want: {}, sayH: null, pumpT: 0, lastLog: {}
  };
  try { const m = localStorage.getItem('pip-sound:muted'); if (m === '1') S.muted = true; } catch (e) { /* no storage */ }
  const now = () => (S.ctx ? S.ctx.currentTime + 0.006 : 0);
  function rec(kind, name, text, opts) {
    if (!S.recording) return;
    S.log.push({ t: performance.now(), kind, name, text: text == null ? undefined : String(text), opts: opts ? Object.assign({}, opts) : {}, theme: S.theme, reduced: S.reduced });
  }
  const live = () => S.ctx && S.unlocked && !S.muted && S.ctx.state === 'running';

  function unlock() {
    const AC = G.AudioContext || G.webkitAudioContext;
    if (!AC) return false;
    if (!S.ctx) {
      try { S.ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { return false; }
      S.g = graph(S.ctx);
      S.g.master.gain.value = S.muted ? 0 : 1 / MAKEUP;
    }
    if (S.ctx.state !== 'running') S.ctx.resume().then(() => { S.unlocked = true; startLoops(); }, () => {});
    else if (!S.unlocked) { S.unlocked = true; startLoops(); }
    return true;
  }
  ['pointerdown', 'keydown', 'touchstart', 'mousedown'].forEach((ev) => G.addEventListener(ev, () => { if (!S.unlocked) unlock(); }, { capture: true, passive: true }));

  function setTheme(t) {
    const kn = kitOf(t);
    S.theme = KITS.indexOf(t) >= 0 ? { friendly: 'friendly-dark', glass: 'glass-dark', basic: 'basic-dark', phosphor: 'retro-dark', teletype: 'retro-light', nier: 'nier-dark' }[t] : String(t);
    if (kn === S.kit) return;
    S.kit = kn;
    // the loops cross into the new kit: the old ones fade out, the new ones come up at the same levels
    if (S.ctx) { const t0 = now(); Object.keys(S.loops).forEach((name) => { S.loops[name].stop(t0); delete S.loops[name]; }); startLoops(); }
  }
  function setMuted(m) {
    m = !!m; if (m === S.muted) return S.muted;
    S.muted = m;
    try { localStorage.setItem('pip-sound:muted', m ? '1' : '0'); } catch (e) { /* no storage */ }
    if (S.ctx && S.g) { const t = S.ctx.currentTime; S.g.master.gain.cancelScheduledValues(t); S.g.master.gain.setTargetAtTime(m ? 0 : 1 / MAKEUP, t, 0.05); }
    if (m) hush();
    G.dispatchEvent(new CustomEvent('pipsound', { detail: { muted: m } }));
    return S.muted;
  }
  function play(name, opts) {
    const op = opts || {}, kn = op.kit ? kitOf(op.kit) : S.kit;
    if (EVENTS.indexOf(name) < 0) return false;
    if (S.reduced && MOTION.has(name)) return false;
    rec('play', name, null, op);
    if (op.chapter != null) S.st.chapter = clamp(op.chapter | 0, 0, 4);
    if (!live()) return false;
    return dispatch(S.ctx, S.g, S.st, kn, name, op, now(), false);
  }
  function say(text, opts) {
    const op = opts || {}, kn = op.kit ? kitOf(op.kit) : S.kit, timing = sayTiming(kn, text, op);
    rec('say', 'say', text, op);
    if (S.sayH && S.ctx) { S.sayH.stop(S.ctx.currentTime); S.sayH = null; }
    if (!text || !live()) return timing;
    S.sayH = sayOn(S.ctx, S.g, S.st, kn, text, op, now(), false);
    return timing;
  }
  function hush() { if (S.sayH && S.ctx) { S.sayH.stop(S.ctx.currentTime); S.sayH = null; } }

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
          while (inst.next < until) { if (!gate || inst.levelAt(inst.next) > 0.001) D.step(c, o, inst.next, k, inst.n++); inst.next += D.period(k) * (1 + jit(0.08)); }
        } finally { R = prevR; }
      },
      stop(tt) { o.gain.cancelScheduledValues(tt); o.gain.setTargetAtTime(0, tt, 0.12); if (parts) parts.stop(tt + 1.2); inst.dead = true; }
    };
    return inst;
  }
  function startLoops() {
    if (!S.ctx || !S.unlocked) return;
    Object.keys(S.want).forEach((name) => { if (S.want[name] > 0.001) applyLoop(name, S.want[name]); });
    if (!S.pumpT) S.pumpT = setInterval(pump, 120);
  }
  function applyLoop(name, level) {
    if (!S.ctx || !S.unlocked) return;
    let inst = S.loops[name];
    if (!inst && level > 0.001) { inst = S.loops[name] = loopInst(S.ctx, S.g, S.kit, name, S.ctx.currentTime, S.st); inst.next = S.ctx.currentTime + 0.05; }
    if (inst && Math.abs(inst.level - level) > 0.004) inst.set(level, S.ctx.currentTime);
  }
  function pump() {
    if (!S.ctx) return;
    const t = S.ctx.currentTime;
    Object.keys(S.loops).forEach((name) => {
      const inst = S.loops[name];
      if (inst.level <= 0.001) { inst.idle = (inst.idle || 0) + 1; if (inst.idle > 25) { inst.stop(t); delete S.loops[name]; } return; }
      inst.idle = 0;
      if (inst.next < t) inst.next = t + 0.02;
      inst.pump(t + 0.5, false);
    });
  }
  function loop(name, level) {
    if (LOOPS.indexOf(name) < 0) return;
    level = clamp(+level || 0, 0, 1);
    if (S.reduced && LOOPDEF[name].motion) level = 0;
    const prev = S.want[name] || 0;
    S.want[name] = level;
    if (S.recording) {
      const L = S.lastLog[name] || { t: 0, v: -1 }, tn = performance.now();
      if (Math.abs(level - L.v) > 0.03 || ((level === 0) !== (L.v === 0)) || (tn - L.t > 150 && Math.abs(level - L.v) > 0.004)) { rec('loop', name, null, { level }); S.lastLog[name] = { t: tn, v: level }; }
    }
    if (Math.abs(prev - level) < 0.002 && S.loops[name]) return;
    applyLoop(name, level);
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
  // a logged session, rendered offline through the same code: [{ t (s from 0), kind, name, text, opts, theme, reduced }]
  async function renderTimeline(entries, seconds) {
    const sr = 48000, dur = Math.max(0.5, +seconds || 1), c = new OfflineAudioContext(2, Math.ceil(sr * dur), sr), g = graph(c), st = newState(4242);
    const list = (entries || []).slice().sort((a, b) => a.t - b.t);
    const loops = {}, want = {};
    let kit = kitOf((list[0] && list[0].theme) || S.theme), sayH = null;
    const inst = (name, kn) => { const key = name + ':' + kn; if (!loops[key]) { loops[key] = loopInst(c, g, kn, name, 0, st); } return loops[key]; };
    list.forEach((e) => {
      const t = Math.max(0, +e.t || 0); if (t >= dur) return;
      const op = e.opts || {}, ek = e.theme ? kitOf(e.theme) : kit;
      if (ek !== kit) {
        Object.keys(loops).forEach((key) => { const L = loops[key]; if (L.kit === kit && L.level > 0) L.set(0, t); });
        kit = ek;
        Object.keys(want).forEach((name) => { if (want[name] > 0) inst(name, kit).set(want[name], t); });
      }
      const kn = op.kit ? kitOf(op.kit) : kit;
      if (e.kind === 'play') { if (!(e.reduced && MOTION.has(e.name))) dispatch(c, g, st, kn, e.name, op, t, false); }
      else if (e.kind === 'say') { if (sayH) sayH.stop(t); sayH = e.text ? sayOn(c, g, st, kn, e.text, op, t, false) : null; }
      else if (e.kind === 'loop' && LOOPS.indexOf(e.name) >= 0) {
        let lv = clamp(+op.level || 0, 0, 1); if (e.reduced && LOOPDEF[e.name].motion) lv = 0;
        want[e.name] = lv;
        if (lv > 0 || loops[e.name + ':' + kit]) inst(e.name, kit).set(lv, t);
      }
    });
    Object.keys(loops).forEach((key) => loops[key].pump(dur, true));
    const buf = await c.startRendering();
    return wav(buf);
  }
  // one take for the level tool and the sound board's checks
  async function renderOne(kitName, kind, name, opts, o) {
    o = o || {};
    // takes start at 0.6 s: a compressor needs about half a second after its context starts before its make-up settles
    const sr = 48000, t0 = 0.6, dur = t0 + (o.seconds || (kind === 'loop' ? 8 : name === 'confetti' || name === 'crew' || name === 'chapter' ? 4 : 3));
    const c = new OfflineAudioContext(2, Math.ceil(sr * dur), sr), g = graph(c, !!o.raw), st = newState(o.seed || 99);
    const op = Object.assign({ chapter: 2, index: 1, count: 3, len: 160 }, opts || {});
    if (kind === 'play') dispatch(c, g, st, kitName, name, op, t0, !!o.notrim);
    else if (kind === 'say') sayOn(c, g, st, kitName, o.text || "Oh! Hi. I'm Pip. Shall we set things up?", op, t0, !!o.notrim);
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
  function stats(buf) {
    const n = buf.length, sr = buf.sampleRate, L = buf.getChannelData(0), Rr = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L;
    let peak = 0, nan = 0, sum = 0, last = 0;
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
      acc += (a * a + b * b) / 2; k++;
      if (k === W) { wins.push(acc / W); acc = 0; k = 0; }
      const y = b0 * m + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = m; y2 = y1; y1 = y; hf += y * y; tot += m * m;
    }
    const top = wins.reduce((q, v) => Math.max(q, v), 0), act = wins.filter((v) => v >= top * 0.01);
    // loudness integrates over at least 50 ms (the ear sums short sounds), so a 5 ms click reads as quiet as it sounds
    const rms = act.length ? Math.sqrt(act.reduce((q, v) => q + v, 0) / Math.max(act.length, 5)) : 0;
    const dbf = (v) => (v > 0 ? Math.round(20 * Math.log10(v) * 10) / 10 : -200);
    return { peakDb: dbf(peak), rmsDb: dbf(rms), dur: Math.round(((last + 1) / sr) * 100) / 100, nan, dc: Math.round((sum / n) * 1e5) / 1e5, hfDb: tot > 0 ? Math.round(10 * Math.log10(hf / tot + 1e-12) * 10) / 10 : -200 };
  }

  G.PipSound = {
    EVENTS, KITS, LOOPS, kitOf, TARGET, SUBTLE, TRIM,
    get muted() { return S.muted; },
    get kit() { return S.kit; },
    get unlocked() { return S.unlocked; },
    get recording() { return S.recording; },
    set recording(v) { v = !!v; if (v && !S.recording) { S.log = []; S.lastLog = {}; } S.recording = v; },
    get log() { return S.log; },
    setTheme, setMuted, toggle: () => setMuted(!S.muted), setReduced: (r) => { S.reduced = !!r; if (S.reduced) applyLoop('swing', 0); }, unlock,
    play, say, hush, loop, renderTimeline, sayTiming: (text, opts) => sayTiming((opts && opts.kit) ? kitOf(opts.kit) : S.kit, text, opts || {}),
    _render: renderOne, _stats: stats, _wav: wav, _chainGain: chainGain, _MAKEUP: MAKEUP
  };
})(window);
