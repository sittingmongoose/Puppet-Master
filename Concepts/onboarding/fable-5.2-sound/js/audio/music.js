/* Pip's sound (Fable 5.2). music.js: how a tune is written down and how it is played.
   A song is text. A bar is whatever sits between two | marks, and its tokens share the bar equally: "e5 g5 e5 c5" is
   four quarter notes in 4/4, eight tokens are eighths, [a b] splits one slot in two, - holds the note before it and
   _ is a rest. Chords are written as symbols, one or more to a bar, and the accompaniment is patterns played over
   them (r the root, f the fifth, 1 2 3 the notes of the chord from the bottom, x the whole chord), so a part
   follows the harmony by itself. A Player walks a song bar by bar on the audio clock: the chapter picks the section,
   the intensity picks which parts play, and both change on a bar line. */
(function (G) {
  'use strict';
  const PS = G.PS5, clamp = PS.clamp;
  const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  // the three buses' places against each other (measured: tools/measure.mjs)
  PS.TRIM = { music: 0.2, sfx: 0.34, voice: 0.3 };

  /* ------------------------------------------------------------------ reading */
  function noteNum(s) {
    const m = /^([a-g])([#b]?)(-?\d)$/.exec(s); if (!m) return null;
    return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  const QUAL = {
    '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], dim: [0, 3, 6], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10],
    sus4: [0, 5, 7], sus2: [0, 2, 7], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9], add9: [0, 4, 7, 14], 9: [0, 4, 7, 10, 14], m9: [0, 3, 7, 10, 14], maj9: [0, 4, 7, 11, 14],
    aug: [0, 4, 8], '7sus4': [0, 5, 7, 10], 69: [0, 4, 7, 9, 14], madd9: [0, 3, 7, 14], 5: [0, 7]
  };
  function chord(sym) {
    const m = /^([A-G])([#b]?)([^/]*)(?:\/([A-G])([#b]?))?$/.exec(sym); if (!m || !QUAL[m[3]]) throw new Error('chord? ' + sym);
    const root = (PC[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? 11 : 0)) % 12;
    const bass = m[4] ? (PC[m[4].toLowerCase()] + (m[5] === '#' ? 1 : m[5] === 'b' ? 11 : 0)) % 12 : root;
    return { sym, root, bass, iv: QUAL[m[3]], pcs: QUAL[m[3]].map((i) => (root + i) % 12), q: m[3] };
  }
  // "a [b c] -" -> nested arrays of tokens, one array per bar
  function bars(str) {
    return String(str).split('|').map((b) => b.trim()).filter((b) => b.length).map((b) => {
      const out = [], stack = [out];
      b.replace(/\[|\]|[^\s\[\]]+/g, (tok) => {
        if (tok === '[') { const g = []; stack[stack.length - 1].push(g); stack.push(g); }
        else if (tok === ']') stack.pop();
        else stack[stack.length - 1].push(tok);
        return tok;
      });
      return out;
    });
  }
  // one bar's tokens -> [{ pos, dur, tok }] in beats ("-" lengthens what came before, also across a bar line)
  function flatten(bar, beats, at, out, last) {
    const step = beats / bar.length;
    bar.forEach((tok, i) => {
      const pos = at + i * step;
      if (Array.isArray(tok)) { last = flatten(tok, step, pos, out, last); return; }
      if (tok === '-') { if (last) last.dur += step; return; }
      if (tok === '_') { last = null; return; }
      last = { pos, dur: step, tok }; out.push(last);
    });
    return last;
  }
  function events(str, beats) {
    const out = []; let last = null;
    bars(str).forEach((b, i) => { last = flatten(b, beats, i * beats, out, last); });
    return { ev: out, bars: bars(str).length };
  }
  function flags(tok) {
    let vel = 1, stac = false, ring = false, t = tok;
    for (;;) {
      const c = t[t.length - 1];
      if (c === '!') vel *= 1.28; else if (c === '?') vel *= 0.62; else if (c === '.') stac = true; else if (c === '~') ring = true; else break;
      t = t.slice(0, -1);
    }
    return { t, vel, stac, ring };
  }

  /* ------------------------------------------------------------------ harmony helpers */
  // every chord note once, inside one octave window from lo: neighbouring chords then move by small steps
  function voicing(ch, lo, n) {
    let v = ch.pcs.map((pc) => { let m = lo + ((pc - lo) % 12 + 12) % 12; return m; }).sort((a, b) => a - b);
    if (n && v.length > n) v = v.filter((m, i) => !(v.length - i > n && (m - ch.root) % 12 === 7 % 12)).slice(0, n);
    return v;
  }
  function bassNote(ch, lo, tok, next) {
    const put = (pc) => lo + ((pc - lo) % 12 + 12) % 12, r = put(ch.bass);
    if (tok === 'r') return r;
    if (tok === 'o') return r + 12;
    if (tok === 'f') { const f = put((ch.root + (ch.iv.indexOf(6) >= 0 ? 6 : ch.iv.indexOf(8) >= 0 ? 8 : 7)) % 12); return f < r ? f + 12 : f; }
    if (tok === 'F') { const f = put((ch.root + 7) % 12), dn = f > r ? f - 12 : f; return dn < lo - 3 ? dn + 12 : dn; }
    if (tok === 't') { const t = put((ch.root + ch.iv[1]) % 12); return t < r ? t + 12 : t; }
    if (tok === 's') { const s = put((ch.root + (ch.iv[3] != null && ch.iv[3] < 12 ? ch.iv[3] : 9)) % 12); return s < r ? s + 12 : s; }
    if (tok === 'a') { const n = next ? put(next.bass) : r; return n - 1; }
    if (tok === 'A') { const n = next ? put(next.bass) : r; return n + 2; }
    return r;
  }

  /* ------------------------------------------------------------------ compiling a song */
  const ACC = { 3: [1, 0.82, 0.86], 4: [1, 0.84, 0.93, 0.84], 6: [1, 0.74, 0.78, 0.92, 0.74, 0.78], 2: [1, 0.86] };
  const DRUMS = { k: 'kick', s: 'snare', b: 'brush', r: 'rim', h: 'hat', o: 'ohat', m: 'shaker', c: 'clap', n: 'snap', w: 'wood', W: 'woodlo', t: 'tick', T: 'tock', i: 'click', j: 'tamb', g: 'ting', y: 'key', Y: 'space', z: 'pawl', K: 'knock', u: 'tom', e: 'felt', H: 'nzhat', S: 'nzsnare', B: 'nzkick', q: 'nztick' };
  function compile(song) {
    const beats = song.meter || 4, C = { song, beats, sections: {}, need: new Set(), needBy: {} };
    Object.keys(song.sections).forEach((name) => {
      const sec = song.sections[name], cb = bars(sec.chords), n = cb.length, S = { name, bars: n, chords: [], tracks: {} };
      cb.forEach((b, i) => { const step = beats / b.length; b.forEach((sym, j) => { if (sym !== '-') S.chords.push({ pos: i * beats + j * step, ch: chord(sym) }); }); });
      const chordAt = (pos) => { let c = S.chords[0].ch; for (const e of S.chords) { if (e.pos <= pos + 1e-6) c = e.ch; else break; } return c; };
      const nextChord = (pos) => { for (const e of S.chords) if (e.pos > pos + 1e-6) return e.ch; return S.chords[0].ch; };
      S.chordAt = chordAt;
      Object.keys(song.tracks).forEach((tn) => {
        const T = song.tracks[tn], kind = T.kind || 'mel', own = sec[T.src || tn], src = own != null ? own : (kind === 'mel' ? null : (sec.pats && sec.pats[tn]) || T.pat);
        if (src == null || src === '') return;
        const variants = (Array.isArray(src) ? src : [src]).map((str) => {
          let E = events(str, beats), ev = E.ev;
          // a pattern shorter than the section repeats to fill it
          if (kind !== 'mel' && E.bars < n) { const rep = []; for (let k = 0; k * E.bars < n; k++) ev.forEach((e) => { const pos = e.pos + k * E.bars * beats; if (pos < n * beats - 1e-6) rep.push({ pos, dur: e.dur, tok: e.tok }); }); ev = rep; }
          if (kind === 'mel' && E.bars !== n) throw new Error(`${song.id} ${name}.${tn}: ${E.bars} bars, the section has ${n}`);
          return ev.map((e) => {
            const f = flags(e.tok), ch = chordAt(e.pos); let notes = [];
            if (kind === 'drum') { notes = f.t.split('+').map((d) => { if (!DRUMS[d]) throw new Error(`${song.id}: drum? ${d}`); return DRUMS[d]; }); }
            else if (kind === 'mel') { notes = f.t.split('+').map((x) => { const m = noteNum(x); if (m == null) throw new Error(`${song.id} ${name}.${tn}: note? ${x}`); return m + (T.oct || 0) * 12; }); }
            else if (kind === 'bass') notes = [bassNote(ch, T.lo || 36, f.t, nextChord(e.pos))];
            else {
              const v = voicing(ch, T.lo || 60, T.voices);
              f.t.split('+').forEach((x) => {
                if (x === 'x') { v.forEach((m) => notes.push(m)); return; }
                const m = /^(\d)([',]*)$/.exec(x); if (!m) throw new Error(`${song.id} ${tn}: pattern? ${x}`);
                const i = +m[1] - 1, up = (m[2].match(/'/g) || []).length - (m[2].match(/,/g) || []).length;
                notes.push(v[i % v.length] + 12 * Math.floor(i / v.length) + 12 * up);
              });
            }
            if (kind !== 'drum' && T.inst) notes.forEach((m) => { const k = T.inst + ':' + Math.round(m + (song.transpose || 0)); C.need.add(k); (C.needBy[tn] = C.needBy[tn] || new Set()).add(k); });
            return { pos: e.pos, dur: e.dur, notes, vel: f.vel, stac: f.stac, ring: f.ring, strum: kind === 'pat' && notes.length > 2 };
          });
        });
        S.tracks[tn] = variants;
      });
      C.sections[name] = S;
    });
    return C;
  }

  /* ------------------------------------------------------------------ playing */
  class Player {
    constructor(E, song, opts) {
      opts = opts || {};
      this.E = E; this.song = song; this.C = song._c || (song._c = compile(song));
      this.beats = this.C.beats; this.bpm = song.bpm; this.beat = 60 / song.bpm; this.barDur = this.beats * this.beat;
      this.chapter = opts.chapter || 0; this.intensity = opts.intensity == null ? 0 : opts.intensity;
      this.rand = PS.rng(PS.hash(song.id) + 7); this.playing = false; this.script = (opts.script || []).slice();
      this.pass = {}; this.formAt = 0; this.sec = null; this.bar = 0; this.barT = 0; this.barN = 0; this.hist = []; this.mutes = {}; this.flags = {};
      this.out = {};
      Object.keys(song.tracks).forEach((tn) => { const T = song.tracks[tn]; this.out[tn] = E.chain('music', { gain: (T.gain == null ? 0.3 : T.gain) * (song.level == null ? 1 : song.level) * PS.db((PS.TRIMS && PS.TRIMS[song.id] && PS.TRIMS[song.id].music) || 0) * PS.TRIM.music, pan: T.pan || 0, send: T.send == null ? 0.4 : T.send }); });
      this.pulse = song.pulse || (this.beats === 6 ? 3 : 1);
    }
    /* [instrument, note, wanted now]: what the parts playing at this moment need comes first */
    notesNeeded() { const out = [], seen = new Set(); Object.keys(this.C.needBy).sort((a, b) => this.active(b) - this.active(a)).forEach((tn) => { const on = this.active(tn); this.C.needBy[tn].forEach((k) => { if (seen.has(k)) return; seen.add(k); const i = k.lastIndexOf(':'); out.push([k.slice(0, i), +k.slice(i + 1), on]); }); }); return out; }
    form() { const f = this.song.form, list = Array.isArray(f[0]) ? f[Math.min(this.chapter, f.length - 1)] : f; return typeof list === 'string' ? [list] : list; }
    start(t0) {
      this.playing = true; this.barT = t0; this.barN = 0; this.formAt = 0; this.formKey = this.chapter; this.pending = null;
      this.sec = this.C.sections[this.form()[0]]; this.bar = 0; this.pass = {}; this.hist = [];
    }
    stop() { this.playing = false; }
    setChapter(ch) { this.chapter = clamp(ch | 0, 0, 9); }
    setIntensity(n) { this.intensity = n; }
    mute(tn, on) { this.mutes[tn] = !!on; }
    flag(name, on) { this.flags[name] = !!on; }
    fade(t, tau) { Object.values(this.out).forEach((g) => { try { g.gain.setTargetAtTime(0, t, tau || 0.12); } catch (e) { /* gone */ } }); this.playing = false; }
    /* where the music is at a moment: for effects that want to land on the beat and in the chord */
    at(t) {
      let h = null; for (let i = this.hist.length - 1; i >= 0; i--) { if (this.hist[i].t <= t + 1e-4) { h = this.hist[i]; break; } }
      if (!h) h = this.hist[0] || { t: this.barT, sec: this.sec || this.C.sections[this.form()[0]], bar: 0, n: 0 };
      const b = (t - h.t) / this.beat, pos = h.bar * this.beats + clamp(b, 0, this.beats);
      return { bar: h.n, beat: b, ch: h.sec.chordAt(pos), sec: h.sec.name, barT: h.t, tr: this.song.transpose || 0 };
    }
    /* the next grid line at or after t: div in beats (0.5 an eighth) */
    grid(t, div) { const a = this.at(t), k = Math.ceil((t - a.barT) / (this.beat * div) - 1e-3); return a.barT + k * this.beat * div; }
    active(tn) {
      const T = this.song.tracks[tn]; if (this.mutes[tn]) return false;
      if (T.when) return !!this.flags[T.when];
      const I = this.intensity;
      if (T.at) return T.at.indexOf(I) >= 0;
      return I >= (T.from || 0) && I <= (T.to == null ? 99 : T.to);
    }
    schedule(until) {
      const E = this.E, song = this.song;
      while (this.playing && this.barT < until) {
        // a scripted change (offline renders) or a new chapter takes effect on this bar line
        while (this.script.length && this.script[0].at <= this.barT + 1e-6) { const s = this.script.shift(); if (s.chapter != null) this.chapter = s.chapter; if (s.intensity != null) this.intensity = s.intensity; if (s.stop) { this.playing = false; return; } }
        if (this.formKey !== this.chapter && this.bar % (song.switchEvery || 1) === 0) { this.formKey = this.chapter; this.formAt = 0; this.sec = this.C.sections[this.form()[0]]; this.bar = 0; }
        const S = this.sec, t0 = this.barT, pos0 = this.bar * this.beats, pass = this.pass[S.name] || 0, tr = song.transpose || 0;
        this.hist.push({ t: t0, sec: S, bar: this.bar, n: this.barN }); if (this.hist.length > 24) this.hist.shift();
        const lvl = this.intensity;
        for (let k = 0; k < this.beats; k++) {
          if (k % this.pulse === 0) E.emit('beat', { bar: this.barN, beat: k, down: k === 0, bpm: this.bpm, dur: this.beat * this.pulse, meter: this.beats, sec: S.name, level: lvl }, t0 + k * this.beat);
        }
        Object.keys(S.tracks).forEach((tn) => {
          if (!this.active(tn)) return;
          const T = song.tracks[tn], vars = S.tracks[tn], kind = T.kind || 'mel';
          // a melody rests now and then, so a tune heard for minutes still breathes
          if (T.rest && pass % T.rest[0] === T.rest[1]) return;
          if (T.passes && T.passes.indexOf(pass % T.passes[0]) < 1) return;
          const ev = vars[pass % vars.length], out = this.out[tn], hum = T.hum == null ? 0.006 : T.hum, sw = T.swing == null ? (song.swing || 0) : T.swing;
          for (let i = 0; i < ev.length; i++) {
            const e = ev[i]; if (e.pos < pos0 - 1e-6 || e.pos >= pos0 + this.beats - 1e-6) continue;
            let b = e.pos - pos0;
            if (sw) { const fl = Math.floor(b), fr = b - fl; b = fl + (fr < 0.5 ? fr * (0.5 + sw) / 0.5 : 0.5 + sw + (fr - 0.5) * (0.5 - sw) / 0.5); }
            const acc = (ACC[this.beats] || ACC[4])[Math.floor(b + 1e-6) % this.beats] || 0.85, onBeat = Math.abs(b - Math.round(b)) < 0.02;
            const vel = e.vel * (onBeat ? acc : 0.8 + 0.06 * this.rand()) * (0.94 + 0.12 * this.rand()) * (T.vel || 1);
            const t = t0 + b * this.beat + (this.rand() - 0.5) * 2 * hum, dur = e.dur * this.beat * (e.stac ? 0.45 : (T.gate || 0.96));
            if (kind === 'drum') { e.notes.forEach((d) => PS.inst.drum(E, out, d, Math.max(t0, t), { gain: vel })); if (T.role) E.emit('note', { track: tn, role: T.role, drum: e.notes[0], vel }, t); continue; }
            const strum = e.strum ? (T.strum == null ? 0.014 : T.strum) : 0;
            e.notes.forEach((m, j) => {
              PS.inst.note(E, out, T.inst, m + tr, Math.max(t0, t) + j * strum, { gain: vel * (e.notes.length > 2 ? 0.72 : 1), dur: e.ring ? null : dur, detune: T.detune ? (this.rand() - 0.5) * 2 * T.detune : 0, vib: T.vib, slide: T.slide && this.rand() < T.slide ? -2 : 0 });
            });
            if (T.role) E.emit('note', { track: tn, role: T.role, midi: e.notes[e.notes.length - 1] + tr, vel, dur, inst: T.inst }, t);
          }
        });
        // on to the next bar; at a section's end, the next one in the chapter's form
        this.barT = t0 + this.barDur; this.barN++; this.bar++;
        if (this.bar >= S.bars) { this.pass[S.name] = pass + 1; const f = this.form(); this.formAt = (this.formAt + 1) % f.length; this.sec = this.C.sections[f[this.formAt]]; this.bar = 0; }
      }
    }
  }

  /* ------------------------------------------------------------------ checking a song on paper
     Every melody note against the chord under it: fine if it is in the chord, a colour note if it is in the scale and
     not a clash, flagged if it sits a semitone above a chord note on a strong beat or leaves the scale. */
  function lint(song) {
    const C = compile(song), out = [], beats = C.beats, key = song.scale || [0, 2, 4, 5, 7, 9, 11], tonic = song.tonic || 0;
    const inScale = (m) => key.indexOf(((m - tonic) % 12 + 12) % 12) >= 0;
    Object.values(C.sections).forEach((S) => {
      Object.keys(S.tracks).forEach((tn) => {
        const T = song.tracks[tn]; if ((T.kind || 'mel') !== 'mel') return;
        S.tracks[tn].forEach((ev, vi) => {
          let prev = null;
          ev.forEach((e) => {
            const ch = S.chordAt(e.pos), strong = Math.abs(e.pos - Math.round(e.pos)) < 0.01 && e.dur >= 0.99;
            e.notes.forEach((m) => {
              const pc = ((m % 12) + 12) % 12, isTone = ch.pcs.indexOf(pc) >= 0, clash = ch.pcs.some((c) => (pc - c + 12) % 12 === 1);
              const where = `${song.id} ${S.name}.${tn}${vi ? '#' + vi : ''} bar ${Math.floor(e.pos / beats) + 1} beat ${(e.pos % beats + 1).toFixed(2)} (${ch.sym})`;
              if (!inScale(m) && !isTone) out.push(`out of scale: ${where} note ${m}`);
              else if (!isTone && clash && e.dur >= 0.99) out.push(`clash (semitone over a chord note, held): ${where} note ${m}`);
              else if (!isTone && strong && e.dur >= 2 && ((pc - ch.root + 12) % 12 === 5) && ch.iv.indexOf(4) >= 0) out.push(`fourth held over a major chord: ${where}`);
              if (prev != null && Math.abs(m - prev) > 12) out.push(`leap over an octave: ${where} ${prev}->${m}`);
            });
            prev = e.notes[e.notes.length - 1];
          });
        });
      });
    });
    return out;
  }

  PS.music = { noteNum, chord, bars, events, compile, voicing, bassNote, Player, lint, DRUMS };
})(window);
