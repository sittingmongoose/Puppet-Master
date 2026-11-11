/* Pip's sound (Fable 5.2). voice.js: Pip talking.
   The idea is the one PMConcept7 already has and it stays: a line of text becomes babble, one syllable for each
   group of vowels, said at the pace the bubble types it. What is new here:
   - speech has consonants: p t k pop, b d g bump, s and sh hiss, m and n hum through the nose, l r w y glide in,
     and a word's last consonant is heard too; vowel pairs slide (the "ou" in "about", the "ay" in "play");
   - speech has shape: words carry stress, little words are passed over lightly, a phrase falls as it goes, a
     question lifts, and commas and full stops are short breaths that the typing waits for too;
   - Pip's mouth can follow it: every line leaves a timeline of how open the mouth is (mouthAt);
   - a voice can be dressed for a concept: its notes drawn to the music's key, its syllables to the beat, a wooden
     jaw that clacks, a bell that doubles the stressed words.
   Six kinds of voice, one per look, as before: a formant creature (Friendly, Glass), clean chirps (Basic), a chip
   (Retro Dark), struck notes with a key's tick (Retro Light), a Pod's stepped tones (NieR). */
(function (G) {
  'use strict';
  const PS = G.PS5, clamp = PS.clamp, mf = PS.mf;

  /* ------------------------------------------------------------------ tables */
  // vowel formants (Hz) for a small creature; each voice scales them (fs)
  const FORM = {
    a: [800, 1250, 2600, 3500], e: [540, 1850, 2550, 3500], i: [320, 2300, 3000, 3650], o: [520, 900, 2450, 3350], u: [340, 820, 2300, 3300],
    x: [520, 1500, 2500, 3400],                                                    // the lazy vowel of little words
    m: [270, 1050, 2300, 3300], n: [270, 1500, 2500, 3300], l: [360, 1250, 2700, 3400], r: [420, 1300, 1700, 3200], w: [300, 720, 2300, 3200], y: [280, 2250, 3000, 3600]
  };
  const OPEN = { a: 1, o: 0.82, e: 0.62, i: 0.42, u: 0.46, x: 0.5, m: 0.04, n: 0.2 };
  const ROUND = { o: 1, u: 1, w: 1 };
  const MOOD = {
    idle: { st: 0, bounce: 1, rate: 1, bright: 1, breath: 1 }, happy: { st: 3, bounce: 1.35, rate: 1.08, bright: 1.15, breath: 1 },
    think: { st: -2, bounce: 0.6, rate: 0.86, bright: 0.85, hum: true, breath: 1.3 }, alert: { st: 5, bounce: 1.1, rate: 1.2, bright: 1.2, breath: 1 },
    sleep: { st: -6, bounce: 0.35, rate: 0.72, bright: 0.6, breath: 1.8 }, wink: { st: 2, bounce: 1.25, rate: 1.05, bright: 1.1, breath: 1 },
    dots: { st: -1, bounce: 0.8, rate: 0.92, bright: 0.9, breath: 1.2 }, oops: { st: -3, bounce: 0.7, rate: 0.94, bright: 0.85, breath: 1.4 },
    watch: { st: 1, bounce: 1.1, rate: 0.96, bright: 1.05, breath: 1 }, wonder: { st: 4, bounce: 1.2, rate: 1.04, bright: 1.15, breath: 1.2 }
  };
  MOOD.working = MOOD.dots; MOOD.error = MOOD.oops;
  // the crew on Ready: Coordinator (crown) low and grand, Builder (hard hat) gruff, Reviewer (glasses) high and precise
  const CREW = { pip: { mul: 1, rate: 1, grit: 0, fs: 1 }, crown: { mul: 0.72, rate: 0.9, grit: 0.1, fs: 0.9 }, hardhat: { mul: 0.86, rate: 1, grit: 0.22, fs: 0.95 }, glasses: { mul: 1.32, rate: 1.12, grit: 0, fs: 1.1 } };
  const LITTLE = new Set('a an the of to in on at is it and or for we i you your my its be as by with that this can will are was so if me us do'.split(' '));
  const PREFIX = /^(re|be|de|un|pre|ex|con|com|to|a|en|in|dis|mis)(?=[b-df-hj-np-tv-z])/i;
  const VOWEL = /[aeiouyàáâäèéêëìíîïòóôöùúûü]/i;

  /* ------------------------------------------------------------------ reading a line */
  function vowelOf(g) {
    g = g.toLowerCase();
    if (/^(ee|ea|ie|ey)/.test(g)) return ['i'];
    if (/^(oo|ew|ue)/.test(g)) return ['u'];
    if (/^(ai|ay|ei)/.test(g)) return ['e', 'i'];
    if (/^(ou|ow|au)/.test(g)) return ['a', 'u'];
    if (/^(oi|oy)/.test(g)) return ['o', 'i'];
    if (/^(aw|oa)/.test(g)) return ['o'];
    if (/^(ia|io)/.test(g)) return ['i', 'a'];
    const ch = g.normalize('NFD')[0];
    return [{ a: 'a', e: 'e', i: 'i', y: 'i', o: 'o', u: 'u' }[ch] || 'a'];
  }
  // what a cluster of consonants sounds like going into a vowel: [class, letter]
  function onsetOf(cl) {
    cl = cl.toLowerCase().replace(/[^a-z]/g, '');
    if (!cl) return null;
    if (/(sh|ch)$/.test(cl)) return ['S', 'sh'];
    if (/th$/.test(cl)) return ['S', 'f'];
    const ch = cl[cl.length - 1], pre = cl.length > 1 && cl[0] === 's' ? 's' : '';
    if ('ptkcqx'.indexOf(ch) >= 0) return ['P', ch === 'p' ? 'p' : ch === 't' ? 't' : 'k', pre];
    if ('bdg'.indexOf(ch) >= 0) return ['B', ch, pre];
    if ('sz'.indexOf(ch) >= 0) return ['S', ch];
    if ('fv'.indexOf(ch) >= 0) return ['S', 'f'];
    if (ch === 'j') return ['S', 'sh'];
    if (ch === 'h') return ['H', 'h'];
    if ('mn'.indexOf(ch) >= 0) return ['N', ch, pre];
    if ('lrwy'.indexOf(ch) >= 0) return ['L', ch, pre];
    return null;
  }
  function endOf(s) {
    s = String(s).trim();
    if (/(…|\.\.\.)["”’)]*$/.test(s)) return 'trail';
    if (/\?["”’)]*$/.test(s)) return 'ask';
    if (/!["”’)]*$/.test(s)) return 'exclaim';
    if (/[.:]["”’)]*$/.test(s)) return 'stop';
    if (/[,;]["”’)]*$/.test(s)) return 'comma';
    return 'open';
  }
  /* when each letter is typed (seconds): an even pace, with a breath after a comma and a longer one after a sentence */
  function charTimes(s, cps) {
    const n = s.length, T = new Float32Array(n + 1); let t = 0;
    for (let i = 0; i < n; i++) {
      T[i] = t; t += 1 / cps;
      const c = s[i], more = /\S/.test(s.slice(i + 1));
      if (!more) continue;
      if (/[,;:]/.test(c)) t += 0.11;
      else if (c === '—' || c === '–') t += 0.13;
      else if (/[.!?…]/.test(c) && !/[.!?…]/.test(s[i + 1] || '')) t += c === '…' || s[i - 1] === '.' ? 0.3 : 0.24;
    }
    T[n] = t; return T;
  }
  /* the line as syllables: [{ t, d, v:[vowel(s)], on, coda, stress, little, wi, last (of its phrase), end, p, p2, g }] */
  function read(text, V, moodName, cps) {
    const M = MOOD[moodName] || MOOD.idle, s = String(text), T = charTimes(s, cps), out = [], re = /[A-Za-zÀ-ÿ0-9']+/g; let m, wi = 0;
    while ((m = re.exec(s))) {
      const w = m[0], w0 = m.index, groups = [];
      for (let j = 0; j < w.length;) {
        if (VOWEL.test(w[j]) && !(j === 0 && /y/i.test(w[j]) && w.length > 1)) { let k = j; while (k < w.length && VOWEL.test(w[k])) k++; groups.push([j, k]); j = k; } else j++;
      }
      // a silent final e ("time", "name") is no syllable
      if (groups.length > 1) { const [a, b] = groups[groups.length - 1]; if (b === w.length && b - a === 1 && /e/i.test(w[a]) && w.length > 3) groups.pop(); }
      if (!groups.length) { if (/^\d+$/.test(w)) for (let k = 0; k < Math.min(w.length, 4); k++) groups.push([k, k + 1]); else groups.push([0, w.length]); }
      const lw = w.toLowerCase(), little = LITTLE.has(lw), caps = w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w);
      const stressAt = groups.length > 1 && PREFIX.test(lw) ? 1 : 0;
      // the phrase this word ends, if it does: the punctuation right after it
      const rest = s.slice(w0 + w.length), pm = /^["”’)]*([.!?…,;:—]+)/.exec(rest), fin = !!pm || !/\S/.test(rest);
      const mark = pm ? pm[1] : '', endKind = !pm ? 'open' : /…|\.\.\./.test(mark) ? 'trail' : /\?/.test(mark) ? 'ask' : /!/.test(mark) ? 'exclaim' : /[.:]/.test(mark) ? 'stop' : 'comma';
      groups.forEach(([a, b], gi) => {
        const prevEnd = gi === 0 ? 0 : groups[gi - 1][1];
        const i0 = w0 + (gi === 0 ? 0 : Math.floor((prevEnd + a) / 2)), i1 = w0 + (gi === groups.length - 1 ? w.length : Math.floor((b + groups[gi + 1][0]) / 2));
        const digit = /\d/.test(w[a]), lastG = gi === groups.length - 1;
        out.push({
          t: T[i0], d: Math.max(0.03, T[Math.min(s.length, i1)] - T[i0]), v: digit ? ['i'] : vowelOf(w.slice(a, b)), on: onsetOf(w.slice(prevEnd, a)),
          coda: lastG ? onsetOf(w.slice(b)) : null, stress: !little && gi === stressAt, little: little && !fin, caps, wi, lastOfPhrase: fin && lastG,
          end: fin && lastG ? endKind : null
        });
      });
      wi++;
    }
    // the tune of the sentence
    const n = out.length, bounce = (V.bounce || 1) * M.bounce * (V.mono ? 0.15 : 1), k = V.mono ? 0.25 : 1, q = PS.rng(PS.hash(s) + 3);
    let ph0 = 0;
    for (let j = 0; j < n; j++) {
      const y = out[j]; let ph1 = j; while (ph1 < n - 1 && !out[ph1].lastOfPhrase) ph1++;
      if (j > 0 && out[j - 1].lastOfPhrase) ph0 = j;
      const span = Math.max(1, ph1 - ph0), x = (j - ph0) / span, excl = /!/.test(s);
      // a phrase starts a little high and settles; stressed syllables stand up, little words lie down
      let p = M.st + (excl ? 1.5 : 0) + (1.3 - 2.9 * x) * k + (j % 2 ? 0.5 : -0.3) * bounce * 0.55 + (q() * 2 - 1) * bounce * 0.55;
      let g = 1, len = 1;
      if (y.stress) { p += 1.9 * k * (0.7 + 0.3 * bounce); g = 1.1; len = 1.1; }
      if (y.little) { p -= 0.9 * k; g = 0.78; len = 0.88; }
      if (y.caps) { p += 2 * k; g = 1.16; }
      let p2 = p - 0.7 * k;
      if (y.lastOfPhrase) {
        const e = y.end || 'open';
        if (e === 'ask') { p -= 0.5 * k; p2 = p + 5.5 * k; len = 1.15; }
        else if (e === 'exclaim') { p += 2 * k; p2 = p - 2.4 * k; g *= 1.1; }
        else if (e === 'trail') { p2 = p - 4 * k; len = 1.5; g *= 0.8; }
        else if (e === 'stop') { p2 = p - 3.4 * k; len = 1.12; }
        else if (e === 'comma') { p2 = p + 1.6 * k; }
        else p2 = p - 1.6 * k;
      }
      y.p = p; y.p2 = p2; y.g = g; y.len = len; y.first = j === ph0;
      y.leg = !!(out[j + 1] && out[j + 1].wi === y.wi);
    }
    return { syl: out, T, total: T[s.length] };
  }

  /* ------------------------------------------------------------------ the voices */
  const VOX = {
    friendly: { kind: 'formant', src: 'warm', saw: 0.2, q: 6.5, fs: 1.18, lp: 4500, direct: 0.2, vib: [5.6, 14], gain: 0.23, att: 0.012, cons: 0.4, base: 285, bounce: 2.3, cps: 31, breath: 0.035 },
    glass: { kind: 'formant', src: 'pure', oct: 0.28, q: 5, fs: 1.3, lp: 6200, direct: 0.3, vib: [4.6, 11], breath: 0.1, shimmer: 0.045, gain: 0.18, att: 0.018, cons: 0.2, base: 345, bounce: 1.9, cps: 28, legato: 0.2 },
    basic: { kind: 'chirp', gain: 0.26, base: 740, bounce: 1.3, att: 0.004, rel: 0.014, maxSyl: 0.08, cons: 0.1, cps: 35, fifth: 0.1 },
    phosphor: { kind: 'pulse', gain: 0.5, root: 72, quant: [0, 2, 4, 7, 9, 12, 14, 16], maxSyl: 0.04, blip: 3, lp: 3200, cps: 48 },
    teletype: { kind: 'struck', inst: 'celesta', gain: 0.36, root: 74, quant: [0, 2, 4, 5, 7, 9, 11, 12], blip: 3, cps: 44, key: 0.5 },
    nier: { kind: 'chirp', w1: 'triangle', harm: 0.14, lp: 3600, gain: 0.33, base: 560, bounce: 0.4, mono: true, step: true, att: 0.003, rel: 0.012, maxSyl: 0.075, cons: 0.06, cps: 50 }
  };
  const WAVE = new WeakMap();
  // the buzz in the throat: every harmonic, each weaker than the last; "warm" falls off faster than "bright"
  function glottal(c, kind) {
    let m = WAVE.get(c); if (!m) { m = {}; WAVE.set(c, m); }
    if (m[kind]) return m[kind];
    const n = 30, re = new Float32Array(n), im = new Float32Array(n), tilt = { warm: 1.55, pure: 2.2, bright: 1.25, wood: 1.1 }[kind] || 1.5;
    for (let i = 1; i < n; i++) im[i] = Math.pow(i, -tilt) * (kind === 'wood' && i % 2 === 0 ? 0.45 : 1) * (i > 20 ? 0.5 : 1);
    return (m[kind] = c.createPeriodicWave(re, im));
  }
  const BURST = { p: [900, 0.8, 0.5], t: [4200, 1.2, 0.5], k: [2300, 1.4, 0.55], b: [520, 0.8, 0.22], d: [3000, 1, 0.2], g: [1900, 1.2, 0.22] };
  const FRIC = { s: [6200, 1.3, 0.3], z: [5800, 1.2, 0.2], sh: [3300, 1.4, 0.34], f: [5200, 0.5, 0.16], h: [1700, 0.5, 0.22] };
  const LOCUS = { b: 900, d: 1750, g: 2300 };

  let mouthTL = [];
  function mouthAt(t) {
    let open = 0, round = 0;
    for (let i = 0; i < mouthTL.length; i++) {
      const s = mouthTL[i]; if (t < s.t0 - 0.03 || t > s.t1 + 0.09) continue;
      const a = clamp((t - (s.t0 - 0.03)) / 0.05, 0, 1), r = clamp(((s.t1 + 0.09) - t) / 0.11, 0, 1), k = Math.min(a, r);
      if (s.open * k > open) { open = s.open * k; round = s.round; }
    }
    return { open, round };
  }

  /* one line, one graph: pitch, mouth shape and level are moved from syllable to syllable, so neighbours run into each
     other as speech does. o { mood, crew, music (a Player), at (start time), dress: { tune, grid, jaw, plink, plinkInst } } */
  function speak(E, V, script, o) {
    o = o || {};
    const c = E.ctx, M = MOOD[o.mood] || MOOD.idle, C = CREW[o.crew || 'pip'] || CREW.pip, D = Object.assign({}, V.dress || {}, o.dress || {});
    const t0 = o.at == null ? E.now() + 0.02 : o.at, music = o.music && o.music.playing ? o.music : null;
    const out = o.out || E.chain('voice', { gain: o.trim != null ? o.trim : (V.trim || 1), pan: o.pan || 0, send: V.send == null ? 0.22 : V.send });
    const end = script.reduce((m, s) => Math.max(m, s.t + s.d), 0), stopAt = t0 + end + 0.5, live = [];
    const last = new Map();
    const setT = (p, v, t, tc) => { const lt = last.get(p) || 0; t = Math.max(t, lt + 1e-4, t0); last.set(p, t); p.setTargetAtTime(v, t, Math.max(0.0008, tc)); };
    // where a syllable lands and what it sings: free, or drawn to the music's beat and key
    const base = (V.base || 300) * C.mul, baseMidi = 69 + 12 * Math.log2(base / 440);
    const when = (s) => { let t = t0 + s.t; if (music && D.grid) { const g = music.grid(t - music.beat * D.grid * 0.45, D.grid); if (Math.abs(g - t) < music.beat * D.grid * 0.6) t = g; } return t; };
    const tune = (p, t, final) => {
      if (!music || !D.tune) return p;
      const a = music.at(t), sc = (music.song.scale || [0, 2, 4, 5, 7, 9, 11]).map((x) => (x + (music.song.tonic || 0) + a.tr) % 12), pcs = final ? a.ch.pcs.map((x) => (x + a.tr) % 12) : sc;
      const m = baseMidi + p; let best = m, bd = 99;
      for (let k = Math.floor(m) - 3; k <= Math.ceil(m) + 3; k++) { if (pcs.indexOf(((k % 12) + 12) % 12) < 0) continue; const d = Math.abs(k - m); if (d < bd) { bd = d; best = k; } }
      return p + (best - m) * D.tune;
    };
    mouthTL = [];
    const peak = V.gain * (o.level == null ? 1 : o.level) * PS.TRIM.voice;

    if (V.kind === 'struck' || V.kind === 'pulse') {
      const tr = 12 * Math.log2(C.mul), q = V.quant, stops = [];
      script.forEach((s, j) => {
        const ts = when(s), deg = s.deg | 0; let midi = V.root + tr + q[((deg % q.length) + q.length) % q.length] + 12 * Math.floor(deg / q.length);
        if (music && D.tune) { const a = music.at(ts), pcs = (s.fin ? a.ch.pcs : (music.song.scale || [0, 2, 4, 5, 7, 9, 11]).map((x) => (x + (music.song.tonic || 0)) % 12)).map((x) => (x + a.tr) % 12); let best = midi, bd = 99; for (let k = midi - 4; k <= midi + 4; k++) { if (pcs.indexOf(((k % 12) + 12) % 12) < 0) continue; const d = Math.abs(k - midi); if (d < bd) { bd = d; best = k; } } midi = best; }
        const g = peak * (s.g || 1);
        if (V.kind === 'pulse') stops.push(PS.inst.note(E, out, V.wave || 'chip25', midi, ts, { gain: g * 2.2, dur: Math.max(0.025, Math.min(V.maxSyl || 0.04, s.d * 0.8)) }));
        else { stops.push(PS.inst.note(E, out, V.inst, midi, ts, { gain: g, cut: Math.max(0.08, Math.min(0.5, s.d * 2.2)), rel: 0.09 })); if (V.key) stops.push(PS.inst.drum(E, out, V.keyDrum || 'key', ts, { gain: g * V.key * (0.8 + 0.4 * E.rand()), rate: 0.94 + 0.14 * E.rand() })); }
        mouthTL.push({ t0: ts, t1: ts + Math.min(0.09, s.d), open: s.vow ? 0.9 : 0.55, round: 0 });
      });
      return { end: stopAt, stop(t) { stops.forEach((g) => { if (g) try { g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, 0.01); } catch (e) { /* gone */ } }); mouthTL = []; } };
    }

    const env = c.createGain(); env.gain.setValueAtTime(0, t0); env.connect(out);
    const osc = [], fps = [];
    const mk = (type, mul, wave) => { const s = c.createOscillator(); if (wave) s.setPeriodicWave(wave); else s.type = type; s.start(t0); s.stop(stopAt); live.push(s); osc.push(s); fps.push([s.frequency, mul]); return s; };
    let bands = null, fg = null, fbp = null, ag = null, vibG = null;
    if (V.kind === 'formant') {
      const mix = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = V.lp * (M.bright || 1); lp.Q.value = 0.5;
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 150; lp.connect(hp); hp.connect(env);
      mk(null, 1, glottal(c, V.src || 'warm')).connect(mix);
      const saw = (V.saw || 0) + C.grit;
      if (saw > 0) { const g2 = c.createGain(); g2.gain.value = saw * 0.5; mk('sawtooth', 1).connect(g2); g2.connect(mix); }
      if (V.oct) { const g3 = c.createGain(); g3.gain.value = V.oct; mk('sine', 2).connect(g3); g3.connect(mix); }
      // breath: a little air always, more for an h
      const nb = c.createBufferSource(); nb.buffer = PS.inst.noiseBuf(E, false); nb.loop = true; const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 2200; nf.Q.value = 0.4;
      ag = c.createGain(); ag.gain.value = (V.breath || 0.03) * (M.breath || 1); nb.connect(nf); nf.connect(ag); ag.connect(mix); nb.start(t0, E.rand()); nb.stop(stopAt); live.push(nb);
      const fs = V.fs * C.fs;
      bands = [0, 1, 2, 3].map((j) => { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = V.q * [1, 1.3, 1.4, 1.5][j]; b.frequency.value = FORM.a[j] * fs; const g = c.createGain(); g.gain.value = [1, 0.62, 0.3, 0.12][j] * (j ? M.bright || 1 : 1) * 3.2; mix.connect(b); b.connect(g); g.connect(lp); return b; });
      const dg = c.createGain(); dg.gain.value = V.direct || 0.2; mix.connect(dg); dg.connect(lp);
      if (V.shimmer) { const sg = c.createGain(); sg.gain.value = V.shimmer; mk('sine', 4).connect(sg); sg.connect(lp); }
    } else {
      // a clean tone; NieR's adds a quiet third harmonic for a glassy, digital edge; Basic's a breath of a fifth
      const o1 = mk(V.w1 || 'sine', 1);
      if (V.harm) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = V.lp || 4000; o1.connect(f); f.connect(env); const hg = c.createGain(); hg.gain.value = V.harm; mk('sine', 3).connect(hg); hg.connect(env); }
      else o1.connect(env);
      if (V.fifth) { const g5 = c.createGain(); g5.gain.value = V.fifth; mk('sine', 1.5).connect(g5); g5.connect(env); }
    }
    if (V.vib) { const l = c.createOscillator(); vibG = c.createGain(); l.frequency.value = V.vib[0]; vibG.gain.setValueAtTime(0, t0); l.connect(vibG); osc.forEach((s) => vibG.connect(s.detune)); l.start(t0); l.stop(stopAt); live.push(l); }
    // the hiss and pop of consonants, beside the voice (not through the mouth's formants)
    { const ns = c.createBufferSource(); ns.buffer = PS.inst.noiseBuf(E, false); ns.loop = true; fbp = c.createBiquadFilter(); fbp.type = 'bandpass'; fbp.Q.value = 1.2; fbp.frequency.value = 2500;
      fg = c.createGain(); fg.gain.setValueAtTime(0, t0); ns.connect(fbp); fbp.connect(fg); fg.connect(out); ns.start(t0, E.rand()); ns.stop(stopAt); live.push(ns); }
    const cons = (V.cons || 0.3) * peak, fsc = (V.fs || 1) * C.fs, chirp = V.kind === 'chirp';
    const noise = (spec, t, d, k) => { setT(fbp.frequency, spec[0], t - 0.002, 0.001); setT(fbp.Q, spec[1], t - 0.002, 0.001); setT(fg.gain, spec[2] * cons * (k || 1), t, 0.003); setT(fg.gain, 0, t + d, 0.008); };
    const shape = (name, t, tc) => { if (!bands) return; const F = FORM[name] || FORM.a; bands.forEach((b, k2) => setT(b.frequency, F[k2] * fsc, t, tc)); };

    script.forEach((s, j) => {
      const maxSyl = V.maxSyl || 0.2, slotT = when(s), on = s.on, cls = on ? on[0] : null;
      // the consonant takes the front of the slot, the vowel the rest
      const lead = chirp ? 0 : cls === 'S' ? Math.min(0.06, s.d * 0.4) : cls === 'N' || cls === 'L' ? Math.min(0.05, s.d * 0.32) : cls === 'P' ? Math.min(0.03, s.d * 0.25) : cls === 'H' ? Math.min(0.04, s.d * 0.3) : 0;
      const codaD = !chirp && s.coda ? Math.min(0.05, s.d * 0.28) : 0;
      const ts = slotT + lead, d = clamp((s.d - lead - codaD - 0.012) * (s.len || 1), 0.04, Math.max(0.045, maxSyl * (s.len || 1))), te = ts + d;
      const fin = !!s.lastOfPhrase;
      let p0 = s.p, p1 = s.p2;
      if (V.step) { p0 = Math.round(s.p) + (j % 3 === 1 ? 2 : 0); p1 = fin ? Math.round(s.p2) : p0; }
      p0 = tune(p0, ts, false); p1 = tune(p1, te, fin);
      const f0 = base * Math.pow(2, p0 / 12), f1 = base * Math.pow(2, p1 / 12);
      // pitch: a small scoop into the note, then on to where the syllable is going
      fps.forEach(([p, mul]) => { setT(p, f0 * mul * (V.step || chirp ? 1 : 0.985), ts - 0.006, 0.004); setT(p, f0 * mul, ts + 0.004, 0.012); setT(p, f1 * mul, ts + d * 0.32, d * 0.3); });
      if (vibG) { setT(vibG.gain, d > 0.17 ? V.vib[1] : 0, ts + 0.06, 0.05); }
      const lvl = peak * (s.g || 1);
      // consonants going in
      if (!chirp && cls) {
        const L = on[1];
        if (on[2] === 's') noise(FRIC.s, slotT - 0.035, 0.04, 0.8);
        if (cls === 'P') { setT(env.gain, 0, slotT - 0.03, 0.006); noise(BURST[L] || BURST.t, ts - 0.014, 0.014, 1); noise(FRIC.h, ts - 0.002, 0.018, 0.5); }
        else if (cls === 'B') { setT(env.gain, lvl * 0.14, slotT - 0.028, 0.008); noise(BURST[L] || BURST.d, ts - 0.008, 0.01, 1); if (bands) { setT(bands[1].frequency, (LOCUS[L] || 1700) * fsc, ts - 0.02, 0.004); } }
        else if (cls === 'S') { const sp = FRIC[L] || FRIC.s; setT(env.gain, L === 'z' ? lvl * 0.3 : 0, slotT - 0.01, 0.01); noise(sp, slotT, lead + 0.006, 1); }
        else if (cls === 'H') { setT(env.gain, 0, slotT - 0.01, 0.01); if (ag) { setT(ag.gain, (V.breath || 0.03) * 9, slotT, 0.008); setT(ag.gain, (V.breath || 0.03) * (M.breath || 1), ts + 0.01, 0.015); } }
        else if (cls === 'N') { shape(L, slotT - 0.008, 0.01); setT(env.gain, lvl * 0.42, slotT, 0.012); mouthTL.push({ t0: slotT, t1: ts, open: OPEN[L], round: 0 }); }
        else if (cls === 'L') { shape(L, slotT - 0.008, 0.012); setT(env.gain, lvl * 0.6, slotT, 0.014); }
      }
      // the vowel, and where it slides if it is two
      const v0 = s.little && !fin ? 'x' : s.v[0], v1 = s.v[1];
      shape(v0, ts - (cls === 'N' || cls === 'L' ? 0.002 : 0.012), cls === 'L' ? 0.028 : cls === 'B' ? 0.016 : 0.012);
      if (v1) shape(v1, ts + d * 0.42, d * 0.22);
      if (D.jaw) PS.inst.drum(E, out, (D.jawDrums || ['wood', 'tock'])[j % 2], ts, { gain: D.jaw * (s.stress ? 1 : 0.6) * (0.8 + 0.4 * E.rand()), rate: 0.86 + 0.2 * E.rand() });
      if (D.plink && (fin || (s.stress && !D.plinkFin))) PS.inst.note(E, out, D.plinkInst || 'musicbox', Math.round(baseMidi + p0) + 12, ts, { gain: D.plink * (fin ? 1.15 : 0.9) });
      setT(env.gain, lvl * (v0 === 'x' ? 0.86 : 1), ts, cls === 'N' || cls === 'L' ? 0.012 : V.att || 0.01);
      mouthTL.push({ t0: ts, t1: te, open: (OPEN[v0] || 0.7) * (0.75 + 0.25 * (s.g || 1)), round: ROUND[v0] ? 1 : 0 });
      // consonants going out, or straight on into the next syllable of the word
      const nx = script[j + 1], leg = !chirp && !V.mono && s.leg && nx && nx.t - (s.t + s.d) < 0.03 && !s.coda;
      if (s.coda && !chirp) {
        const cc = s.coda[0], L = s.coda[1];
        if (cc === 'S') { setT(env.gain, 0, te - 0.008, 0.01); noise(FRIC[L] || FRIC.s, te, codaD, 0.7); }
        else if (cc === 'P') { setT(env.gain, 0, te - 0.004, 0.004); noise(BURST[L] || BURST.t, te + 0.022, 0.012, 0.45); }
        else if (cc === 'B') setT(env.gain, 0, te - 0.004, 0.006);
        else if (cc === 'N') { shape(L, te - 0.012, 0.012); setT(env.gain, lvl * 0.4, te - 0.004, 0.012); setT(env.gain, 0, te + codaD, 0.014); mouthTL.push({ t0: te, t1: te + codaD, open: OPEN[L], round: 0 }); }
        else if (cc === 'L') { shape(L, te - d * 0.3, d * 0.16); setT(env.gain, 0, te - 0.006, 0.018); }
        else setT(env.gain, 0, te - 0.01, V.rel || 0.014);
      } else setT(env.gain, leg ? lvl * (V.legato != null ? V.legato : 0.45) : 0, te - 0.01, leg ? 0.014 : (V.rel || (fin ? 0.03 : 0.016)));
    });
    return {
      end: stopAt,
      stop(t) {
        try { env.gain.cancelScheduledValues(t); env.gain.setTargetAtTime(0, t, 0.012); } catch (e) { /* already gone */ }
        if (fg) try { fg.gain.cancelScheduledValues(t); fg.gain.setTargetAtTime(0, t, 0.005); } catch (e) { /* already gone */ }
        live.forEach((n) => { try { n.stop(t + 0.1); } catch (e) { /* already stopped */ } });
        mouthTL = mouthTL.filter((m) => m.t0 < t);
      }
    };
  }

  // the beeping voices: a blip every few letters, each on a note of the scale
  function blips(text, V, moodName, cps) {
    const M = MOOD[moodName] || MOOD.idle, s = String(text), T = charTimes(s, cps), out = [], end = endOf(s); let letters = 0;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]; if (!/[A-Za-zÀ-ÿ0-9]/.test(ch)) continue;
      if (letters++ % (V.blip || 2)) continue;
      const vow = VOWEL.test(ch), h = (ch.toLowerCase().charCodeAt(0) * 7 + i) % 4;
      out.push({ t: T[i], d: V.maxSyl || 0.06, deg: vow ? 4 + (h % 3) : h, g: vow ? 1 : 0.85, vow });
    }
    const n = out.length;
    out.forEach((q, j) => {
      q.deg += Math.round(M.st / 2.5);
      if (j >= n - 2 && end === 'ask') q.deg += j === n - 1 ? 3 : 1;
      if (j === n - 1 && end === 'exclaim') q.deg += 2;
      if (j >= n - 2 && (end === 'stop' || end === 'trail')) q.deg -= j === n - 1 ? 2 : 1;
      if (j === n - 1) q.fin = true;
    });
    return { syl: out, T, total: T[s.length] };
  }

  /* ------------------------------------------------------------------ scripted sounds without words */
  const VS = {
    wake: [{ t: 0, d: 0.34, v: ['a'], p: -3, p2: 4, on: ['H', 'h'], g: 0.8, leg: true }, { t: 0.34, d: 0.42, v: ['o'], p: 4, p2: -6, g: 0.75 }, { t: 0.9, d: 0.09, v: ['e'], p: 5, p2: 7, on: ['P', 'p'] }, { t: 1.0, d: 0.13, v: ['i'], p: 9, p2: 11 }],
    sleep: [{ t: 0, d: 0.5, v: ['a'], p: 1, p2: -6, on: ['H', 'h'], g: 0.7, leg: true }, { t: 0.5, d: 0.42, v: ['m'], p: -6, p2: -9, g: 0.55 }],
    think: [{ t: 0, d: 0.18, v: ['m'], p: 0, p2: 2, g: 0.8, leg: true }, { t: 0.18, d: 0.32, v: ['m'], p: 2, p2: -1, g: 0.8 }],
    happy: [{ t: 0, d: 0.09, v: ['e'], p: 3, p2: 5, on: ['L', 'y'], leg: true }, { t: 0.09, d: 0.17, v: ['a'], p: 7, p2: 10 }, { t: 0.33, d: 0.06, v: ['i'], p: 12, p2: 11, on: ['H', 'h'], g: 0.6 }, { t: 0.41, d: 0.06, v: ['i'], p: 10, p2: 9, on: ['H', 'h'], g: 0.55 }, { t: 0.49, d: 0.07, v: ['i'], p: 8, p2: 6, on: ['H', 'h'], g: 0.5 }],
    wink: [{ t: 0, d: 0.07, v: ['e'], p: 6, p2: 7, on: ['H', 'h'], g: 0.8 }, { t: 0.13, d: 0.1, v: ['e'], p: 4, p2: 2, on: ['H', 'h'], g: 0.75 }],
    alert: [{ t: 0, d: 0.17, v: ['o'], p: 5, p2: 10, g: 1 }],
    cheer: [{ t: 0, d: 0.1, v: ['a'], p: 5, p2: 8, on: ['L', 'y'], leg: true }, { t: 0.1, d: 0.26, v: ['e', 'i'], p: 10, p2: 12, g: 1.05 }],
    crew: [{ t: 0, d: 0.14, v: ['u'], p: 0, p2: 1, on: ['H', 'h'] }, { t: 0.17, d: 0.3, v: ['e'], p: 4, p2: 7, on: ['L', 'r'], g: 1.05 }],
    giggle: [0, 1, 2, 3].map((k) => ({ t: k * 0.085, d: 0.06, v: [k % 2 ? 'i' : 'e'], p: 11 - k * 1.6, p2: 10 - k * 1.6, on: ['H', 'h'], g: 0.7 - k * 0.08 })),
    gasp: [{ t: 0, d: 0.2, v: ['o'], p: 2, p2: 9, on: ['H', 'h'], g: 0.9 }],
    hum: [{ t: 0, d: 0.22, v: ['m'], p: 0, p2: 0, g: 0.7, leg: true }, { t: 0.24, d: 0.22, v: ['m'], p: 4, p2: 4, g: 0.7, leg: true }, { t: 0.48, d: 0.36, v: ['m'], p: 7, p2: 5, g: 0.7 }],
    yay: [{ t: 0, d: 0.12, v: ['i'], p: 6, p2: 9, on: ['L', 'y'], leg: true }, { t: 0.12, d: 0.34, v: ['e', 'i'], p: 12, p2: 9, g: 1.1 }]
  };
  function scriptOf(V, name) {
    const s = VS[name]; if (!s) return null;
    if (V.kind === 'pulse' || V.kind === 'struck') {
      const out = [];
      s.forEach((y) => { const k = Math.max(1, Math.round(y.d / 0.06)); for (let i = 0; i < k; i++) { const p = y.p + (y.p2 - y.p) * (k > 1 ? i / (k - 1) : 0); out.push({ t: y.t + (y.d * i) / k, d: (y.d / k) * 0.85, deg: Math.round(p / 2) + 3, g: y.g || 1, vow: true }); } });
      return out;
    }
    if (V.mono) return s.map((y) => Object.assign({}, y, { p: y.p * 0.25, p2: y.p2 * 0.25, d: Math.min(y.d, 0.2) }));
    return s.map((y) => Object.assign({}, y));
  }

  function timing(V, text, mood, crew) {
    const M = MOOD[mood] || MOOD.idle, C = CREW[crew || 'pip'] || CREW.pip, cps = Math.round(V.cps * M.rate * C.rate * 10) / 10, s = String(text || '');
    const T = charTimes(s, cps), ms = s.length ? Math.round(T[s.length] * 1000 + 140) : 0;
    return { cps, ms, T, shown(elapsedMs) { const x = elapsedMs / 1000; let lo = 0, hi = s.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (T[mid] <= x) lo = mid + 1; else hi = mid; } return lo; } };
  }
  function say(E, V, text, o) {
    o = o || {};
    const tm = timing(V, text, o.mood, o.crew);
    const R = V.kind === 'pulse' || V.kind === 'struck' ? blips(text, V, o.mood, tm.cps) : read(text, V, o.mood, tm.cps);
    const h = R.syl.length ? speak(E, V, R.syl, o) : { end: E.now(), stop() {} };
    return Object.assign(tm, { handle: h, syllables: R.syl.length });
  }
  function vocal(E, V, name, o) { const s = scriptOf(V, name); return s ? speak(E, V, s, o || {}) : null; }

  PS.voice = { VOX, MOOD, CREW, VS, FORM, read, blips, timing, say, vocal, speak, mouthAt, charTimes, clearMouth() { mouthTL = []; } };
})(window);
