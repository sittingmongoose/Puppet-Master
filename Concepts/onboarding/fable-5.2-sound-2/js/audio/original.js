/* Pip's sound (Fable 5.2). original.js: the six tunes PMConcept7 plays today, kept as they are.
   Ported from the Pip concept's sound.js (its SONG table and the oscillator instruments those tunes use): the same
   notes on the same instruments, the same way of following the journey (each chapter plays the tune from another step
   of the scale, so it moves and stays in key), and every third time round the tune thins to its first beats.
   What is different here: a new chapter takes over on a bar line instead of in the middle of a bar, the level is
   matched to the other songs, and it plays through the same mixer, so the sound menu's sliders and the jukebox treat
   it like any other song. And, refined a little on a listener's notes (each marked below): after Welcome a soft fifth
   answers the bass in every bar; Glass is a little brisker and in a brighter room; Retro Dark's thin round keeps its tune. */
(function (G) {
  'use strict';
  const PS = G.PS5, clamp = PS.clamp, mf = PS.mf;
  const _ = null, PMAX = 7600;                       // partials stay under this: brighter is harsh at these levels
  const fold = (m, top) => { while (m > top) m -= 12; return m; };

  /* ------------------------------------------------------------------ the instruments, as they are in sound.js */
  function env(c, t, peak, a, d, hold) {
    const g = c.createGain(), p = Math.max(2e-4, peak);
    a = Math.max(0.0008, a); d = Math.max(a + 0.004, d);
    g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(p, t + a);
    if (hold && hold > a + 0.002 && hold < d - 0.002) g.gain.setValueAtTime(p, t + hold);
    g.gain.exponentialRampToValueAtTime(1e-4, t + d);
    return g;
  }
  function tone(c, out, t, o) {
    const s = c.createOscillator();
    if (o.wave) s.setPeriodicWave(o.wave); else s.type = o.type || 'sine';
    s.frequency.setValueAtTime(o.f, t);
    if (o.det) s.detune.setValueAtTime(o.det, t);
    let n = s;
    if (o.lp) { const b = c.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = o.lp; b.Q.value = o.q == null ? 0.7 : o.q; n.connect(b); n = b; }
    const g = env(c, t, o.g == null ? 0.2 : o.g, o.a == null ? 0.003 : o.a, o.d, o.hold);
    n.connect(g); g.connect(out); s.start(t); s.stop(t + o.d + 0.05);
  }
  function hiss(E, out, t, o) {
    const c = E.ctx, s = c.createBufferSource(); s.buffer = PS.inst.noiseBuf(E, false); s.loop = true;
    const b = c.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = o.q == null ? 1 : o.q; b.frequency.setValueAtTime(o.f || 2000, t);
    const g = env(c, t, o.g == null ? 0.1 : o.g, 0.002, o.d);
    s.connect(b); b.connect(g); g.connect(out); s.start(t, E.rand() * 1.6); s.stop(t + o.d + 0.05);
  }
  const partials = (c, out, t, f, list, d, g, a) => list.forEach(([r, gg, dd]) => { if (f * r < PMAX) tone(c, out, t, { f: f * r, d: Math.max(0.02, d * dd), g: g * gg, a: a || 0.002 }); });
  const I = {
    kalimba(E, o, t, m, g, d) { const c = E.ctx, f = mf(fold(m, 101)); partials(c, o, t, f, [[1, 1, 1], [5.4, 0.15, 0.12], [11.2, 0.04, 0.04]], d, g, 0.002); tone(c, o, t, { f: f * 1.004, d: d * 0.8, g: g * 0.22 }); },
    musicbox(E, o, t, m, g, d) { const c = E.ctx, f = mf(fold(m, 103)); partials(c, o, t, f, [[1, 1, 1], [3.01, 0.2, 0.3], [6.1, 0.07, 0.1]], d, g, 0.001); hiss(E, o, t, { d: 0.006, f: 4800, q: 2, g: g * 0.25 }); },
    sine(E, o, t, m, g, d, a) { tone(E.ctx, o, t, { f: mf(m), d, g, a }); },
    chip(E, o, t, m, d, g, duty) { tone(E.ctx, o, t, { wave: PS.inst.pulseWave(E.ctx, duty), f: mf(m), d, g, a: 0.0015, lp: 5200, hold: d * 0.7 }); },
    celesta(E, o, t, m, g, d) { const c = E.ctx, f = mf(fold(m, 103)); partials(c, o, t, f, [[1, 1, 1], [4, 0.16, 0.25], [2, 0.12, 0.5]], d, g, 0.001); hiss(E, o, t, { d: 0.004, f: 4000, q: 2, g: g * 0.2 }); },
    pad(E, o, t, ms, d, g, type, lp, a) { const c = E.ctx, lo = c.createBiquadFilter(); lo.type = 'lowpass'; lo.frequency.value = lp; lo.Q.value = 0.5; lo.connect(o); ms.forEach((m, i) => tone(c, lo, t, { f: mf(m), type, d, g: g / Math.sqrt(ms.length), a, hold: d * 0.5, det: i % 2 ? 4 : -4 })); }
  };

  /* ------------------------------------------------------------------ the tunes, as they are in sound.js
     step: seconds for one of a bar's eight steps; mel: scale steps above the chapter's root (eight bars); low: one
     bass note a bar */
  const SONG = {
    // Friendly: a music-box lullaby over a soft kalimba
    friendly: { root: 72, mode: 'major', step: 0.27,
      mel: [[4, _, 2, _, 0, _, 2, _], [4, _, 5, 4, 2, _, _, _], [4, _, 2, _, 0, _, 1, _], [2, _, 1, _, 0, _, _, _], [_, _, 4, _, 2, _, _, _], [7, _, 6, _, 4, _, 5, _], [4, _, 2, _, 4, _, _, _], [2, _, 1, _, 0, _, _, _]],
      low: [0, -3, 0, -3, 0, 0, -3, 0],
      note: (E, o, t, m, down) => I.musicbox(E, o, t, m, down ? 0.05 : 0.042, 1.2), bass: (E, o, t, m, k) => I.kalimba(E, o, t, m, 0.05 * (k || 1), 1.4) },
    // Glass: glass struck in a slow, open arpeggio, a soft low note under each phrase
    // (refined: a little brisker than today's 0.3 s a step, and in a sunlit room instead of a hall)
    glass: { root: 74, mode: 'major', step: 0.265,
      mel: [[0, _, 4, _, 7, _, _, _], [_, _, 9, _, 7, _, 4, _], [2, _, 4, _, 6, _, _, _], [_, _, _, _, 9, _, _, _], [7, _, _, 4, _, _, 2, _], [4, _, _, _, _, _, _, _], [2, _, 4, _, 1, _, _, _], [_, _, 0, _, _, _, _, _]],
      low: [0, _, -2, _, -3, _, -1, _],
      note: (E, o, t, m) => { const c = E.ctx, f = mf(m); tone(c, o, t, { f, d: 1.6, g: 0.03, a: 0.004 }); tone(c, o, t, { f: f * 2.76, d: 0.45, g: 0.005, a: 0.002 }); },
      bass: (E, o, t, m, k) => tone(E.ctx, o, t, { f: mf(m), d: 2.4, g: 0.022 * (k || 1), a: 0.02 }) },
    // Basic: a few clean notes, question and answer, a lot of quiet
    basic: { root: 72, mode: 'major', step: 0.32, oct: 1,
      mel: [[0, _, _, _, 4, _, _, _], [_, _, 2, _, _, _, _, _], [2, _, _, _, 1, _, _, _], [_, _, _, _, 0, _, _, _], [4, _, _, _, 5, _, 4, _], [_, _, 2, _, _, _, _, _], [2, _, _, _, 0, _, _, _], [_, _, _, _, _, _, _, _]],
      low: [0, -2, -3, -1, 0, -2, -3, 0],
      note: (E, o, t, m) => I.sine(E, o, t, m, 0.032, 0.9, 0.006), bass: (E, o, t, m, k) => I.sine(E, o, t, m, 0.022 * (k || 1), 1.6, 0.01) },
    // Retro Dark: the terminal's idle tune, square lead and a triangle bass
    // (refined: when the tune thins it keeps every beat, not one note in four, so the quiet round is still a tune)
    phosphor: { root: 72, mode: 'major', step: 0.2, thin: 2,
      mel: [[0, _, 2, 4, _, 4, 2, _], [1, _, _, _, _, _, _, _], [0, _, 2, 4, _, 7, 6, 4], [2, _, _, _, _, _, _, _], [_, _, _, _, _, _, _, _], [4, _, 5, 6, _, 7, _, _], [6, _, 4, _, 2, _, 1, _], [0, _, _, _, _, _, _, _]],
      low: [0, -3, 0, -2, _, -3, -2, 0],
      note: (E, o, t, m) => I.chip(E, o, t, m, 0.07, 0.03, 0.5), bass: (E, o, t, m, k) => tone(E.ctx, o, t, { type: 'triangle', f: mf(m), d: 0.5, g: 0.04 * (k || 1), a: 0.004, lp: 700 }) },
    // Retro Light: a celesta tune, a clockwork of a song
    teletype: { root: 79, mode: 'major', step: 0.28, oct: -1,
      mel: [[0, _, 4, _, 2, _, 4, _], [5, _, 4, _, 2, _, _, _], [1, _, 3, _, 2, _, 1, _], [0, _, _, _, _, _, _, _], [_, _, 4, _, _, _, 2, _], [4, _, 5, _, 7, _, 5, _], [4, _, 2, _, 3, _, 1, _], [0, _, _, _, _, _, _, _]],
      low: [0, -3, -2, 0, _, 0, -3, 0],
      note: (E, o, t, m) => I.celesta(E, o, t, m, 0.045, 0.9), bass: (E, o, t, m, k) => I.celesta(E, o, t, m, 0.035 * (k || 1), 1.1) },
    // NieR: a slow, wistful line on a soft bell, a pad breathing in at the top of the tune
    nier: { root: 69, mode: 'minor', step: 0.45,
      mel: [[4, _, _, 3, 2, _, _, _], [0, _, _, _, _, _, 2, _], [2, _, _, 3, 4, _, 5, _], [4, _, _, _, _, _, _, _], [_, _, _, _, 0, _, _, _], [7, _, _, 6, 4, _, _, _], [5, _, _, 4, 2, _, 3, _], [2, _, _, _, _, _, _, _]],
      low: [0, _, -2, _, 0, -3, _, -1],
      note: (E, o, t, m) => { const c = E.ctx, f = mf(m); tone(c, o, t, { f, d: 1.7, g: 0.034, a: 0.004 }); tone(c, o, t, { f: f * 2, d: 0.6, g: 0.008, a: 0.003 }); },
      bass: (E, o, t, m, k) => tone(E.ctx, o, t, { f: mf(m + 12), d: 2, g: 0.02 * (k || 1), a: 0.03 }),
      extra: (E, o, t, P, bar, i) => { if (bar === 0 && i === 0) I.pad(E, o, t, P.chord(), 5, 0.02, 'sine', 1600, 1.8); } }
  };
  const SCALE = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
  // the chapters: Welcome I, Computer IV, Project V, AI vi, Ready I an octave up (NieR, in A minor: i, VI, III, VII, iv)
  const ROOTDEG = { major: [0, 3, 4, 5, 7], minor: [0, -2, 2, -1, 3] };
  const CHORDS = { major: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [9, 12, 16], [12, 16, 19]], minor: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5], [5, 8, 12]] };
  const ROOM = { friendly: 'felt', glass: 'sunroom', basic: 'dry', phosphor: 'tube', teletype: 'office', nier: 'ruin' };

  const songs = {};
  Object.keys(SONG).forEach((kit) => {
    const S = SONG[kit];
    songs[kit] = { id: 'orig-' + kit, kind: 'orig', kit, title: 'Original', bpm: Math.round(600 / (2 * S.step)) / 10, meter: 4, tonic: S.root % 12, scale: SCALE[S.mode], room: ROOM[kit], level: 1 };
  });

  /* ------------------------------------------------------------------ playing: the same face as music.js's Player */
  class Player {
    constructor(E, song, opts) {
      opts = opts || {};
      this.E = E; this.song = song; this.S = SONG[song.kit];
      this.beats = 4; this.bpm = song.bpm; this.beat = this.S.step * 2; this.barDur = this.S.step * 8;
      this.chapter = clamp(opts.chapter | 0, 0, 4); this.script = (opts.script || []).slice();
      this.playing = false; this.hist = []; this.barT = 0; this.barN = 0; this.intensity = 0;
      // the tune and its bass in one place in the mix, as the loop it comes from was
      this.out = { all: E.chain('music', { gain: 1.9 * (song.level == null ? 1 : song.level) * PS.db((PS.TRIMS && PS.TRIMS[song.id] && PS.TRIMS[song.id].music) || 0), send: 0.8, room: song.room }) };
    }
    notesNeeded() { return []; }
    start(t0) { this.playing = true; this.barT = t0; this.barN = 0; this.ch = this.chapter; this.hist = []; }
    stop() { this.playing = false; }
    setChapter(ch) { this.chapter = clamp(ch | 0, 0, 4); }
    setIntensity() {} mute() {} flag() {}
    active() { return true; }
    fade(t, tau) { try { this.out.all.gain.setTargetAtTime(0, t, tau || 0.12); } catch (e) { /* gone */ } this.playing = false; }
    deg(i) { const sc = SCALE[this.S.mode]; return this.S.root + sc[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7); }
    chord() { return CHORDS[this.S.mode][this.ch].map((x) => this.S.root + x); }
    at(t) { const pcs = this.chord().map((m) => ((m % 12) + 12) % 12); let h = null; for (let i = this.hist.length - 1; i >= 0; i--) if (this.hist[i].t <= t + 1e-4) { h = this.hist[i]; break; } h = h || { t: this.barT, n: 0 }; return { bar: h.n, beat: (t - h.t) / this.beat, ch: { pcs, root: pcs[0], iv: [0, pcs[1] - pcs[0], pcs[2] - pcs[0]].map((x) => (x + 12) % 12) }, sec: 'A', barT: h.t, tr: 0 }; }
    grid(t, div) { const a = this.at(t), k = Math.ceil((t - a.barT) / (this.beat * div) - 1e-3); return a.barT + k * this.beat * div; }
    schedule(until) {
      const E = this.E, S = this.S, o = this.out.all;
      while (this.playing && this.barT < until) {
        while (this.script.length && this.script[0].at <= this.barT + 1e-6) { const s = this.script.shift(); if (s.chapter != null) this.chapter = clamp(s.chapter | 0, 0, 4); if (s.stop) { this.playing = false; return; } }
        this.ch = this.chapter;                        // a chapter takes over here, on the bar line
        const t0 = this.barT, bar = this.barN % S.mel.length, cyc = Math.floor(this.barN / S.mel.length), root = ROOTDEG[S.mode][this.ch];
        this.hist.push({ t: t0, n: this.barN }); if (this.hist.length > 24) this.hist.shift();
        for (let k = 0; k < 4; k++) E.emit('beat', { bar: this.barN, beat: k, down: k === 0, bpm: this.bpm, dur: this.beat, meter: 4, sec: 'A', level: 1 }, t0 + k * this.beat);
        for (let i = 0; i < 8; i++) {
          const t = t0 + i * S.step, d = S.mel[bar][i], lo = S.low[bar];
          // every third time round, the tune thins to its first beats and the bass: room to breathe
          const thin = cyc % 3 === 2 && i % (S.thin || 4) !== 0;
          if (d != null && !thin) { const m = this.deg(root + d + (S.oct || 0) * 7); S.note(E, o, t, m, i === 0); E.emit('note', { track: 'mel', role: 'lead', midi: m, vel: 1, dur: S.step * 2, inst: 'original' }, t); }
          if (i === 0 && lo != null) S.bass(E, o, t, this.deg(root + lo - 7));
          // refined a little: once the person has left Welcome, a soft fifth answers the bass on the third beat, so the later chapters bloom
          if (i === 4 && lo != null && this.ch >= 1) S.bass(E, o, t, this.deg(root + lo - 7 + 4), 0.5);
          if (S.extra) S.extra(E, o, t, this, bar, i);
        }
        this.barT = t0 + this.barDur; this.barN++;
        // once round the tune: the jukebox may end the song here and let it ring
        if (this.barN % S.mel.length === 0) { this.rounds = (this.rounds || 0) + 1; if (this.onRound && this.onRound(this.barT, this.rounds) === true) { this.playing = false; this.ended = this.barT; return; } }
      }
    }
  }
  PS.orig = { SONG, songs, Player, I };
})(window);
