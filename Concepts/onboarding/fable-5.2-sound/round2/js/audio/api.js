/* Pip's sound, round two (Fable 5.2). api.js: window.PipSound, the one door the stage and the window knock on.
   It keeps the calls the Pip concept already makes (play, say, hush, loop, setTheme, toggle, kitOf) and adds what the
   sound menu needs: four songs for each look and which one is chosen, a jukebox that plays any song of any look, a three-way
   mixer that is remembered, where the person is in the flow (progress), and things the stage can watch: beats and
   notes as they are heard, how open Pip's mouth is, the analyser.
   A Session is one look playing on one engine; the page has a live one, and the tools make offline ones to render
   and measure exactly what the page plays.
   One sound per moment: a click that causes several things (a step, a chapter, props landing, Pip's reaction and a
   line) is heard as its most important sound, then Pip; the stage's own noises stay under that and never pile up. */
(function (G) {
  'use strict';
  const PS = G.PS5, clamp = PS.clamp;
  const KITS = PS.KITS;
  function kitOf(t) {
    t = String(t || '');
    if (KITS.indexOf(t) >= 0) return t;
    if (t === 'retro-dark') return 'phosphor';
    if (t === 'retro-light') return 'teletype';
    return { friendly: 'friendly', glass: 'glass', basic: 'basic', nier: 'nier', retro: 'phosphor' }[t.split('-')[0]] || 'friendly';
  }
  const VOCAL = new Set(['wake', 'sleep', 'think', 'happy', 'wink', 'alert', 'cheer', 'crew']);
  const MOTION = new Set(['lower', 'ghost', 'lift', 'swing', 'hop', 'rail']);
  // PMConcept7's rule (O6): hovering, a look tried on and a preview lowered are silent outside NieR. A look that is
  // chosen plays its flourish once ('sig').
  const QUIET_UNLESS_NIER = new Set(['hover', 'ghost', 'tryOn']);
  // the least time between two of the same event (ms)
  const RATE = { tip: 600, hover: 45, key: 40, tap: 30, select: 40, lower: 120, ghost: 80, land: 120, tick: 80, sparkle: 180, rail: 120, decode: 120, score: 150, lock: 120, hop: 140, swing: 200, toggleOn: 40, toggleOff: 40, think: 400, lift: 160, feed: 200 };
  // how much of a sound reaches the room: the quick ones you hear again and again stay dry, so nothing smears
  const DRY = { tip: 0.4, hover: 0.15, tap: 0.2, key: 0.2, tick: 0.35, toggleOn: 0.35, toggleOff: 0.35, select: 0.4, next: 0.45, back: 0.4, slice: 0.3, lock: 0.4, land: 0.2, block: 0.4, warn: 0.3, lower: 0.35, lift: 0.3, hop: 0.3, decode: 0.2, feed: 0.2 };
  // each event's place in the mix (dB), against the music; the stage's own noises sit well under a click's answer
  const LEVEL = { tap: -6, hover: -10, key: -7, select: -2, toggleOn: -4, toggleOff: -5, next: -3, back: -4, open: -2, close: -3, warn: -2, lower: -10, ghost: -12, land: -9, lift: -12, hop: -9, swing: -12, tryOn: -3, sparkle: -8, confetti: 0, chapter: -2, tick: -3, block: -3, power: -4, score: -10, lock: -8, decode: -10, slice: -8, degauss: -6, feed: -8, powerOn: -3, powerOff: -4, rail: -8, tip: -5, cheer: -5, crew: -1, snore: -4, think: -8 };
  const MOODS = { wake: 'happy', sleep: 'sleep', think: 'think', happy: 'happy', wink: 'wink', alert: 'alert', cheer: 'happy', crew: 'happy' };
  /* One sound per moment. An answer to something the person did has a rank; two that start within MOMENT of each
     other are one moment, and the higher rank is the one heard (the lower is faded if it already began). */
  const PRI = { confetti: 9, crew: 9, chapter: 8, open: 8, close: 8, warn: 7, next: 6, back: 6, tryOn: 6, sig: 6, powerOn: 6, powerOff: 6, block: 5, power: 5, tick: 5, select: 5, toggleOn: 5, toggleOff: 5, cheer: 4, tip: 4, rail: 3, tap: 2 };
  // the stage moving (props, strings, a hop): quiet, one at a time, never right on top of an answer
  const FOLEY = new Set(['lower', 'lift', 'land', 'hop', 'swing', 'ghost', 'sparkle', 'degauss', 'slice']);
  const MOMENT = 0.11;

  /* ------------------------------------------------------------------ a session: one look, one engine */
  class Session {
    constructor(E, o) {
      this.E = E; this.kit = o.kit || 'friendly';
      this.pick = Object.assign({}, o.songs || {}); if (o.song) this.pick[this.kit] = o.song;
      this.voices = Object.assign({}, o.voices || {});
      this.chapter = o.chapter || 0; this.index = o.index || 0; this.asleep = !!o.asleep; this.reduced = !!o.reduced;
      this.flags = { work: false, power: false }; this.player = null; this.line = null; this.last = {}; this.at = {}; this.vr = PS.rng(o.seed == null ? 99 : o.seed);
      this.sfxLevel = o.sfxLevel == null ? 1 : o.sfxLevel; this.recent = []; this.lastUi = null; this.voiceUntil = -1; this.vocalUntil = -1;
      this.cacheL = {}; this.guest = o.guest || null;
      E.setRoom(PS.LOOKS[this.kit].room);
    }
    /* the song of a look: the one chosen for it, or the look's own default. The look on show may have a guest instead:
       a song written for another look, which the jukebox has put on ({ kit, id }); it stays on when the look changes. */
    entry(kit) {
      kit = kit || this.kit;
      if (this.guest && kit === this.kit) { const g = PS.songOf(this.guest.kit, this.guest.id); if (g) return g; }
      const list = PS.SONGS[kit], id = this.pick[kit] || PS.DEFAULT_SONG[kit]; return list.find((e) => e.id === id) || list[0];
    }
    /* what a gesture needs to know about a look: its materials, and the key and register of the song it plays in */
    look(kit) {
      kit = kit || this.kit; const en = this.entry(kit), key = kit + ':' + en.kit + ':' + en.id;
      return this.cacheL[key] || (this.cacheL[key] = Object.assign({}, PS.LOOKS[kit], { song: en.song, reg: en.reg, motif: en.motif }));
    }
    intensity() { return this.entry().level({ chapter: this.chapter, index: this.index, asleep: this.asleep }); }
    vox(kit) {
      kit = kit || this.kit;
      const alt = this.voices[kit], V = Object.assign({}, PS.voice.VOX[kit], alt && PS.voice.ALT[kit] && PS.voice.ALT[kit][alt] || {}), T = PS.TRIMS && PS.TRIMS[kit + (alt ? '~' + alt : '')] || PS.TRIMS && PS.TRIMS[kit];
      V.trim = PS.db((T && T.say) || 0); V.trims = T || {}; return V;
    }
    /* the chord of this moment: the music's if it is playing, otherwise the chapter's own in the song's key */
    harmony(t) {
      const song = this.look().song, p = this.player;
      if (p && p.playing && p.hist.length) { const a = p.at(t), tri = a.ch.iv.slice(0, 3).map((i) => (a.ch.root + i + a.tr) % 12); return { pcs: tri, tr: a.tr }; }
      const sc = song.scale, d = (sc[2] === 4 ? [0, 3, 4, 5, 0] : [0, 5, 2, 6, 3])[clamp(this.chapter, 0, 4)];
      return { pcs: [0, 2, 4].map((k) => (song.tonic + sc[(d + k) % 7]) % 12), tr: 0 };
    }
    helper(name, op, t, kit, scale) {
      const E = this.E, L = this.look(kit), P = L.pal, song = this.look().song, H = this.harmony(t), sc = song.scale, reg = L.reg + H.tr, S = this;
      const tk = kit || this.kit, tr = PS.TRIMS && PS.TRIMS[tk] && PS.TRIMS[tk][name] || 0;
      const lvl = PS.db((LEVEL[name] == null ? -4 : LEVEL[name]) + tr) * this.sfxLevel * (scale == null ? 1 : scale) * PS.TRIM.sfx * (0.5 + 0.7 * (op.intensity == null ? 0.7 : clamp(op.intensity, 0, 1)));
      const out = E.chain('sfx', { gain: lvl, pan: op.pan != null ? clamp(op.pan, -1, 1) : (this.vr() - 0.5) * 0.2, send: DRY[name] != null ? DRY[name] : 0.6 });
      const map = L.special ? PS.DRUM_MAPS[L.special] : null, key = tk + ':' + name, prev = this.last[key];
      let v = Math.floor(this.vr() * 4); if (v === prev) v = (v + 1 + Math.floor(this.vr() * 3)) % 4; this.last[key] = v;
      const ch = PS.music.voicing({ pcs: H.pcs, root: H.pcs[0] }, reg).slice(0, 3); while (ch.length < 3) ch.push(ch[ch.length - 1] + 12);
      const pent = sc[2] === 4 ? [0, 2, 4, 7, 9] : [0, 3, 5, 7, 10];
      return {
        E, t, op, out, P, K: L, v, ch, root: reg, tonic: reg, third: sc[2], idx: op.index | 0, count: op.count | 0,
        depth: clamp(op.chapter != null ? op.chapter | 0 : this.chapter, 1, 4), beat: this.player ? this.player.beat : 60 / song.bpm,
        deg: (i) => reg + sc[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7),
        pent: (i) => reg + pent[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5),
        // a string's note: longer strings hang lower and sound lower, on a note of the chord
        strM: (base) => { const want = base - clamp(((op.len == null ? 160 : op.len) - 160) / 380, -0.75, 0.75) * 12; let best = Math.round(want), bd = 99; for (let m = Math.round(want) - 6; m <= Math.round(want) + 6; m++) { if (H.pcs.indexOf(((m % 12) + 12) % 12) < 0) continue; const d = Math.abs(m - want); if (d < bd) { bd = d; best = m; } } return best; },
        rand: () => S.vr(),
        n: (inst, midi, dt, g, o) => { if (L.top) while (midi > L.top) midi -= 12; return PS.inst.note(E, out, inst, midi, t + (dt || 0), Object.assign({ gain: g }, L.ring && !(o && o.cut != null) ? { cut: L.ring, rel: 0.3 } : null, o || {})); },
        d: (dn, dt, g, rate) => PS.inst.drum(E, out, (map && map[dn]) || dn, t + (dt || 0), { gain: g, rate }),
        sw: (o, dt) => PS.inst.swish(E, out, t + (dt || 0), o),
        tone: (o, dt) => PS.inst.tone(E, out, t + (dt || 0), o)
      };
    }
    gesture(name, kit) { const L = PS.LOOKS[kit || this.kit], sp = L.special && PS.sfx.SPECIAL[L.special]; return (sp && sp[name]) || PS.sfx.SET[name] || null; }
    /* how many sounds began in the last half second */
    busy(t) { this.recent = this.recent.filter((x) => t - x < 0.5 && x <= t + 1e-3); return this.recent.length; }
    /* play one event. at: when (offline scripts); returns false if it was dropped */
    play(name, op, at) {
      op = op || {};
      const E = this.E, kit = op.kit ? kitOf(op.kit) : null, K = kit || this.kit;
      const t = at == null ? E.now() + 0.008 : at;
      // the first step into a new chapter is that chapter's sting; the stage's own sting for the same moment is not a second one
      if (name === 'next' && op.chapter != null && (op.chapter | 0) > this.chapter) name = 'chapter';
      if (name === 'back') this.backAt = t;
      if (name === 'chapter') {
        if (this.stingAt != null && t >= this.stingAt - 1e-3 && t - this.stingAt < 2.5) return false;
        if (this.backAt != null && t >= this.backAt - 1e-3 && t - this.backAt < 2.5) return false;
        this.stingAt = t;
      }
      if (op.chapter != null) this.setChapter(op.chapter);
      if (QUIET_UNLESS_NIER.has(name) && K !== 'nier') return false;
      if (this.reduced && MOTION.has(name)) return false;
      const gap = RATE[name], rk = K + name;
      if (gap && this.at[rk] != null && (t - this.at[rk]) * 1000 < gap) return false;
      const speaking = t < this.voiceUntil, U = this.lastUi, near = U && t >= U.t - 1e-3 ? t - U.t : 99;
      let scale = 1;
      if (PRI[name] != null) {
        if (near < MOMENT) {
          if (PRI[name] <= U.pri) return false;
          if (U.out) try { U.out.gain.setTargetAtTime(0, t, 0.012); } catch (e) { /* gone */ }
        }
      } else if (FOLEY.has(name)) {
        if (this.foleyAt != null && t >= this.foleyAt && t - this.foleyAt < 0.24) return false;
        if (near < 0.32 && U.pri >= 5) return false;
        if (this.busy(t) >= 3) return false;
        // while Pip speaks the stage moves without a sound: a prop set down never lands on a word
        if (speaking) return false;
        this.foleyAt = t;
      }
      this.at[rk] = t;
      if (name === 'tryOn' || name === 'sig') { const h = this.helper('tryOn', op, t, kit); h.sw({ d: 0.22, f: 600, f2: 2400, gain: 0.035 }); this.look(kit).sig(h, 0.12); this.lastUi = { t, pri: PRI.sig, out: h.out }; this.recent.push(t); return true; }
      const fn = this.gesture(name, kit);
      // (NieR thinks and wakes in its own menu's sounds, not in the voice)
      if (VOCAL.has(name) && !((name === 'think' || name === 'wake') && fn && PS.LOOKS[K].special === 'nier')) {
        // a wordless sound is Pip's voice: one at a time, and never over a line Pip is saying (the line is the reaction)
        const voiced = !speaking && !(t < this.vocalUntil);
        if (voiced) {
          const V = this.vox(kit), trim = PS.db(V.trims[name] == null ? (V.trims.say || 0) : V.trims[name]);
          if (name === 'crew') { [['crown', -0.4], ['hardhat', 0], ['glasses', 0.4]].forEach(([crew, pan], i) => PS.voice.vocal(E, V, 'crew', { mood: 'happy', crew, pan, at: t + i * 0.12, level: 0.8, trim })); this.vocalUntil = t + 0.9; }
          else { this.vocalH = PS.voice.vocal(E, V, name, { mood: MOODS[name], at: t, music: this.player, pan: op.pan, trim }); this.vocalUntil = t + 0.55; }
        }
        if (name !== 'cheer' && name !== 'crew') return voiced;
      }
      if (!fn) return false;
      const h = this.helper(name, op, t, kit, scale);
      fn(h);
      if (name === 'snore') this.snoreOut = h.out;
      if (PRI[name] != null) this.lastUi = { t, pri: PRI[name], out: h.out };
      this.recent.push(t);
      E.emit('sfx', { name, kit: K }, t);
      return true;
    }
    say(text, o, at) {
      o = o || {};
      const E = this.E, V = this.vox(o.kit ? kitOf(o.kit) : null), tm = PS.voice.timing(V, text, o.mood, o.crew);
      this.hush(at);
      if (!text) return tm;
      let t = at == null ? E.now() + 0.02 : at, lead = 0;
      // a line waits for the click that caused it: the click's answer is heard first and has a breath after it (a
      // chapter's fanfare or the window opening takes longer than a step, a step longer than a tick), then Pip
      const U = this.lastUi, wait = U ? (U.pri >= 8 ? 0.56 : U.pri >= 6 ? 0.32 : 0.2) : 0;
      if (U && t >= U.t - 1e-3 && t - U.t < wait) { lead = U.t + wait - t; t += lead; }
      if (this.vocalH && t < this.vocalUntil) { try { this.vocalH.stop(t); } catch (e) { /* gone */ } this.vocalUntil = t; }
      const r = PS.voice.say(E, V, text, { mood: o.mood, crew: o.crew, music: this.player, pan: o.pan, at: t });
      this.line = r.handle; this.voiceUntil = t + r.ms / 1000;
      // the song steps back under Pip: further for a voice of notes or of a chip, which would otherwise sit in the tune's own place
      E.duck(t, t + r.ms / 1000, V.kind === 'pulse' ? 0.26 : V.kind === 'struck' || V.kind === 'tick' ? 0.34 : 0.55);
      E.emit('say', { ms: r.ms, text }, t);
      if (lead > 0.004) { const shown = r.shown; r.shown = (ms) => shown(ms - lead * 1000); r.ms += Math.round(lead * 1000); }
      return r;
    }
    hush(at) { const t = at == null ? this.E.now() : at; if (this.line) { try { this.line.stop(t); } catch (e) { /* gone */ } this.line = null; } if (this.voiceUntil > t) this.voiceUntil = t; }
    setChapter(ch) { this.chapter = clamp(ch | 0, 0, 4); if (this.player) { this.player.setChapter(this.chapter); this.player.setIntensity(this.intensity()); } }
    progress(s) { if (s.chapter != null) this.chapter = clamp(s.chapter | 0, 0, 4); if (s.index != null) this.index = s.index | 0; if (s.asleep != null) this.asleep = !!s.asleep; if (this.player) { this.player.setChapter(this.chapter); this.player.setIntensity(this.intensity()); } }
    flag(name, on) { this.flags[name] = !!on; if (this.player) this.player.flag(name, on); }
    /* the look's song, made but not started */
    make(script) {
      const song = this.entry().song, P = song.kind === 'orig' ? PS.orig.Player : PS.music.Player;
      const p = new P(this.E, song, { chapter: this.chapter, intensity: this.intensity(), script });
      p.flag('work', this.flags.work); p.flag('power', this.flags.power);
      return p;
    }
    /* put a made song on in place of the one playing: the old one fades under the new one's first notes */
    swap(p, t) { const had = this.player && this.player.playing; if (this.player) this.player.fade(t, had ? 0.2 : 0.05); this.player = p; if (p) p.start(t + (had ? 0.28 : 0)); return p; }
    music(on, at, script) {
      const E = this.E;
      if (!on) { if (this.player) { this.player.fade(at == null ? E.now() : at, 0.14); this.player = null; } return null; }
      if (this.player && this.player.playing && this.player.song === this.entry().song) return this.player;
      if (this.player) this.player.fade(E.now(), 0.14);
      return (this.player = this.make(script));
    }
    setKit(kit) { this.kit = kit; this.E.setRoom(PS.LOOKS[kit].room); }
    setSong(id, kit) { this.pick[kit || this.kit] = id; }
  }

  /* ------------------------------------------------------------------ the live page */
  const S = { theme: 'friendly-dark', kit: 'friendly', muted: false, unlocked: false, reduced: false, sigOnLook: true, jukebox: false, vol: Object.assign({}, PS.MIX), song: {}, juke: null, bag: [], voice: {}, want: { bed: 0, work: 0, power: 0, snore: 0, swing: 0 }, chapter: 0, index: 0, asleep: true };
  let E = null, sess = null, clock = 0, snoreT = 0, swingN = null, making = null, lookT = 0;
  const pending = [], subs = {};
  const fire = (type, data) => (subs[type] || []).forEach((f) => { try { f(data); } catch (e) { PS.errors.push(String((e && e.stack) || e)); } });
  /* what the person set in the sound menu is remembered on this computer: the three levels, sound on or off, the
     song chosen for each look and the jukebox. A page can say no (window.PIP_SOUND_REMEMBER = false: the tools do). */
  const STORE = 'pipSound.r2', remember = () => G.PIP_SOUND_REMEMBER !== false;
  function load() {
    if (!remember()) return;
    try {
      const p = JSON.parse(G.localStorage.getItem(STORE) || 'null'); if (!p) return;
      ['music', 'voice', 'sfx'].forEach((n) => { if (p.vol && typeof p.vol[n] === 'number') S.vol[n] = clamp(p.vol[n], 0, 1.5); });
      if (typeof p.muted === 'boolean') S.muted = p.muted;
      if (typeof p.jukebox === 'boolean') S.jukebox = p.jukebox;
      KITS.forEach((k) => { if (p.song && PS.SONGS[k].some((e) => e.id === p.song[k])) S.song[k] = p.song[k]; });
    } catch (e) { /* private window, or storage switched off: this visit's choices are kept until the page closes */ }
  }
  function save() { if (!remember()) return; try { G.localStorage.setItem(STORE, JSON.stringify({ vol: S.vol, muted: S.muted, jukebox: S.jukebox, song: S.song })); } catch (e) { /* as above */ } }
  if (G.PIP_SOUND_DEFAULTS) Object.assign(S.vol, G.PIP_SOUND_DEFAULTS.vol || {});
  load();
  const songOf = (kit) => S.song[kit] || PS.DEFAULT_SONG[kit];
  // what the jukebox has on, if it is on and has chosen: a song of any look, { kit, id }
  const guest = () => (S.jukebox && S.juke) || null;
  // the song that is on, or would be: the jukebox's, or the one chosen for the look on show
  const current = () => (sess ? sess.entry() : (guest() && PS.songOf(guest().kit, guest().id)) || PS.songOf(S.kit, songOf(S.kit)) || PS.SONGS[S.kit][0]);
  const audible = () => !S.muted && S.unlocked;
  function ensure() {
    if (E) { if (E.ctx.state !== 'running' && E.ctx.state !== 'closed') { try { const p = E.ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* closed */ } } return E; }
    const AC = G.AudioContext || G.webkitAudioContext; if (!AC) return null;
    E = new PS.Engine(new AC({ latencyHint: 'interactive' }), { room: 'felt' });
    Object.keys(S.vol).forEach((n) => E.setVolume(n, S.vol[n]));
    pending.forEach(([t, f]) => E.on(t, f));
    const songs = {}; KITS.forEach((k) => { songs[k] = songOf(k); });
    sess = new Session(E, { kit: S.kit, songs, guest: guest(), voices: S.voice, chapter: S.chapter, index: S.index, asleep: S.asleep, reduced: S.reduced });
    sess.flags.work = S.want.work > 0; sess.flags.power = S.want.power > 0;
    return E;
  }
  /* iPhone and iPad differ from a computer in two ways. The ring/silent switch mutes everything Web Audio plays unless
     the page asks for the "playback" session, or an <audio> element is playing (kept here, silent, for where the
     session cannot be asked for). And a context may only start in touchend, pointerup, mousedown, click or keydown,
     never in touchstart or pointerdown, which is where the first touch arrives. */
  const APPLE_TOUCH = /iP(hone|ad|od)/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let keep = null, wakeAt = 0;
  function silentWav(rate) {   // a quarter second of 8-bit silence at the context's own rate, so nothing is resampled to it
    const n = Math.round(rate / 4), b = new Uint8Array(44 + n).fill(128), v = new DataView(b.buffer), put = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
    put(0, 'RIFF'); v.setUint32(4, 36 + n, true); put(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); put(36, 'data'); v.setUint32(40, n, true);
    let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return 'data:audio/wav;base64,' + btoa(s);
  }
  function keepAwake() {
    try { const a = navigator.audioSession; if (a && a.type !== 'playback') a.type = 'playback'; } catch (e) { /* not offered here */ }
    if (!APPLE_TOUCH) return;
    try {
      const on = S.unlocked && !S.muted && !document.hidden;
      if (!keep) { if (!on) return; keep = new Audio(); keep.setAttribute('x-webkit-airplay', 'deny'); keep.disableRemotePlayback = true; keep.preload = 'auto'; keep.loop = true; keep.src = silentWav((E && E.sr) || 48000); }
      if (!on) { if (!keep.paused) keep.pause(); } else if (keep.paused) { const p = keep.play(); if (p && p.catch) p.catch(() => {}); }
    } catch (e) { /* a frame that may not play media: the session type above is what is left */ }
  }
  function wake(gesture) {
    if (!S.unlocked) return;
    keepAwake();
    if (!E || E.ctx.state === 'running' || E.ctx.state === 'closed') return;
    const ua = navigator.userActivation;
    if (!gesture || (ua && !ua.isActive)) return;
    wakeAt = performance.now();
    try {
      const c = E.ctx, s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, c.sampleRate); s.connect(c.destination); s.start(0);
      const p = c.resume(); if (p && p.then) p.then(() => { wakeAt = 0; }, () => {});
    } catch (e) { /* closed */ }
  }
  // running, or about to be: what is asked for in the tap that starts the context is kept and heard as it starts
  const ready = () => E.ctx.state === 'running' || (wakeAt > 0 && performance.now() - wakeAt < 1200);
  function tick() { if (sess && sess.player && sess.player.playing) sess.player.schedule(E.now() + 0.24); }
  /* Put the look's song on. A song already playing is left alone: a new screen, a new chapter or a part joining never
     starts it again. Another song (a new look, a choice in the menu, the jukebox) is made ready first, then the old
     one fades under the new one's first notes. after: not before this moment (the jukebox, at the end of a round). */
  function startMusic(after) {
    if (!audible() || !(S.want.bed > 0.001) || !ensure()) return;
    const en = sess.entry();
    if (making && making.song === en.song) return;
    if (!making && sess.player && sess.player.playing && sess.player.song === en.song) return;
    const p = making = sess.make();
    // what is playing now first, so the tune starts at once; the parts that join later are made ready behind it
    const now = [], later = [];
    p.notesNeeded().forEach((n) => (n[2] ? now : later).push(n));
    PS.inst.prewarm(E, now.length ? now : later, () => {
      if (making !== p) return; making = null;
      if (!audible() || !(S.want.bed > 0.001)) return;
      // (the jukebox's song stays on through a change of look from its first song on, not only from its first draw)
      if (S.jukebox && !S.juke) sess.guest = S.juke = { kit: en.kit, id: en.id };
      p.onRound = (tEnd) => { if (!S.jukebox || sess.player !== p) return false; jukeNext(tEnd); return true; };
      sess.swap(p, Math.max(E.now() + 0.08, after || 0)); tick();
      fire('music', { on: true, song: en.song.id }); fire('song', { kit: en.kit, id: en.id });
      PS.inst.prewarm(E, later);
    });
    if (!clock) clock = setInterval(tick, 40);
  }
  function stopMusic() { making = null; if (sess) sess.music(false); fire('music', { on: false }); }
  /* The jukebox: when a song has been once round, another comes on, drawn from every song of every look (twenty-four),
     whatever look is on show. Each is heard once before any comes round again, and the original tune, which every
     look has in its own instruments, is never drawn twice running. */
  function jukePick() {
    const cur = current(), same = (e) => e.kit === cur.kit && e.id === cur.id;
    if (!S.bag.some((e) => !same(e))) { S.bag = []; KITS.forEach((k) => PS.SONGS[k].forEach((e) => S.bag.push(e))); }
    let pool = S.bag.filter((e) => !same(e));
    if (cur.id === 'original') { pool = pool.filter((e) => e.id !== 'original'); if (!pool.length) KITS.forEach((k) => PS.SONGS[k].forEach((e) => { if (e.id !== 'original') pool.push(e); })); }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    S.bag = S.bag.filter((e) => e !== pick && !same(e));
    S.juke = { kit: pick.kit, id: pick.id }; if (sess) sess.guest = S.juke;
    fire('jukebox', { on: true, kit: pick.kit, id: pick.id });
    return pick;
  }
  function jukeNext(tEnd) { jukePick(); startMusic(tEnd + 0.5); }
  function snoreLoop() {
    clearTimeout(snoreT); snoreT = 0;
    if (!(S.want.snore > 0.001)) return;
    if (audible() && ensure()) sess.play('snore', {});
    snoreT = setTimeout(snoreLoop, 3800);
  }
  function swingLoop(level) {
    if (!audible() || S.reduced || !ensure()) { if (swingN) swingN.g.gain.setTargetAtTime(0, E.now(), 0.08); return; }
    if (!swingN && level > 0.01) {
      const c = E.ctx, s = c.createBufferSource(); s.buffer = PS.inst.noiseBuf(E, true); s.loop = true;
      const b = c.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = 0.8; const g = c.createGain(); g.gain.value = 0;
      s.connect(b); b.connect(g); g.connect(E.chain('sfx', { gain: 0.04, send: 0.3 })); s.start(); swingN = { b, g };
    }
    if (swingN) { swingN.g.gain.setTargetAtTime(Math.pow(level, 1.6), E.now(), 0.06); swingN.b.frequency.setTargetAtTime(300 + level * 1300, E.now(), 0.08); }
  }
  function refresh() {
    // sound switched on or off, a new look or a new song: bring everything that should be sounding into line
    if (!audible()) { stopMusic(); if (sess) sess.hush(); swingLoop(0); return; }
    if (!ensure()) return;
    sess.setKit(S.kit); sess.reduced = S.reduced; sess.guest = guest(); KITS.forEach((k) => sess.setSong(songOf(k), k));
    sess.progress({ chapter: S.chapter, index: S.index, asleep: S.asleep });
    sess.flag('work', S.want.work > 0); sess.flag('power', S.want.power > 0);
    if (S.want.bed > 0.001) startMusic(); else stopMusic();
    snoreLoop();
  }

  const API = {
    KITS, kitOf,
    get muted() { return S.muted; }, get unlocked() { return S.unlocked; }, get kit() { return S.kit; }, get theme() { return S.theme; },
    get ctx() { return E && E.ctx; }, get engine() { return E; }, get session() { return sess; },
    setTheme(t) {
      const k = kitOf(t), was = S.kit; S.theme = String(t || S.theme); S.kit = k;
      if (k === was) return;
      // a look only looked at for a moment does not change the music: the new look's song comes on once the look has stayed
      clearTimeout(lookT);
      if (audible() && sess) { sess.setKit(k); if (S.sigOnLook) sess.play('sig', { kit: k }); lookT = setTimeout(refresh, 420); } else refresh();
      fire('look', { kit: k });
    },
    setMuted(m) { S.muted = !!m; save(); refresh(); keepAwake(); fire('mute', { muted: S.muted }); try { G.dispatchEvent(new CustomEvent('pipsound')); } catch (e) { /* old browser */ } },
    toggle() { API.setMuted(!S.muted); return S.muted; },
    setReduced(r) { S.reduced = !!r; if (sess) sess.reduced = S.reduced; if (S.reduced) swingLoop(0); },
    volume(name, v) { if (v == null) return S.vol[name]; if (!(name in S.vol)) return 0; S.vol[name] = clamp(+v, 0, 1.5); if (E) E.setVolume(name, S.vol[name]); save(); fire('volume', { name, value: S.vol[name] }); return S.vol[name]; },
    unlock() { if (S.unlocked) return; S.unlocked = true; refresh(); fire('unlock', {}); },
    /* the four songs of a look (this look's if none is named): [{ id, title, family, isDefault, chosen, playing }] */
    songs(kit) { kit = kit ? kitOf(kit) : S.kit; const chosen = S.song[kit] || PS.DEFAULT_SONG[kit], now = sess && sess.player && sess.player.playing ? sess.entry() : null; return PS.SONGS[kit].map((e) => ({ id: e.id, kit, title: e.id === 'original' ? 'Original' : e.title, family: e.family, bpm: e.song.bpm, isDefault: e.id === PS.DEFAULT_SONG[kit], chosen: e.id === chosen, playing: e === now })); },
    /* choose a look's song: it comes on at once if that look is showing (and the jukebox, if it is on, carries on from it) */
    setSong(id, kit) { kit = kit ? kitOf(kit) : S.kit; if (!PS.songOf(kit, id)) return false; S.song[kit] = id; if (kit === S.kit) S.juke = S.jukebox ? { kit, id } : null; save(); if (sess) sess.setSong(id, kit); if (kit === S.kit) refresh(); fire('song', { kit, id }); return true; },
    get jukebox() { return S.jukebox; },
    /* On: the song that is playing is the jukebox's first, and from here the look on show no longer decides the song (a
       change of look leaves the jukebox's song on). Off: the look's own chosen song comes back. */
    setJukebox(on) { const cur = current(); S.jukebox = !!on; S.juke = S.jukebox ? { kit: cur.kit, id: cur.id } : null; S.bag = []; save(); refresh(); fire('jukebox', { on: S.jukebox }); return S.jukebox; },
    /* the next song now, without waiting for the end of the round: the jukebox's next draw, or (jukebox off) the next of the look's four */
    skip() {
      if (!sess || !audible()) return;
      if (S.jukebox) jukePick();
      else { const list = PS.SONGS[S.kit], i = list.findIndex((e) => e.id === songOf(S.kit)), pick = list[(i + 1) % list.length]; S.song[S.kit] = pick.id; save(); sess.setSong(pick.id, S.kit); }
      refresh();
    },
    /* Pip's voice for a look, for comparing: null is the voice the look has, or the name of another take (PS.voice.ALT) */
    voices(kit) { kit = kit ? kitOf(kit) : S.kit; return [{ id: null, name: PS.voice.VOX[kit].name || 'This look’s voice' }].concat(Object.keys(PS.voice.ALT[kit] || {}).map((id) => ({ id, name: PS.voice.ALT[kit][id].name || id }))).map((v) => Object.assign(v, { chosen: (S.voice[kit] || null) === v.id })); },
    setVoice(id, kit) { kit = kit ? kitOf(kit) : S.kit; if (id) S.voice[kit] = id; else delete S.voice[kit]; if (sess) { if (id) sess.voices[kit] = id; else delete sess.voices[kit]; } fire('voice', { kit, id: id || null }); },
    play(name, op) {
      op = op || {};
      if (op.chapter != null) S.chapter = clamp(op.chapter | 0, 0, 4);
      if (!audible() || !ensure()) return false;
      if (!ready()) return false;
      let ok = false;
      try { ok = sess.play(name, op); } catch (e) { PS.errors.push(name + ': ' + String((e && e.stack) || e)); }
      if (API.trace) API.trace.push({ t: +E.now().toFixed(3), kind: 'play', name, op: { chapter: op.chapter, index: op.index, count: op.count, len: op.len }, ok });
      return ok;
    },
    say(text, o) {
      o = o || {};
      const kit = o.kit ? kitOf(o.kit) : S.kit, alt = S.voice[kit], V = Object.assign({}, PS.voice.VOX[kit], alt && PS.voice.ALT[kit] && PS.voice.ALT[kit][alt] || {});
      if (!audible() || !ensure() || !ready()) { if (sess) sess.hush(); return PS.voice.timing(V, text, o.mood, o.crew); }
      if (API.trace && text) API.trace.push({ t: +E.now().toFixed(3), kind: 'say', text: String(text), mood: o.mood || null, ok: true });
      return sess.say(text, o);
    },
    hush() { if (sess) sess.hush(); },
    loop(name, level) {
      if (!(name in S.want)) return;
      level = clamp(+level || 0, 0, 1); S.want[name] = level;
      if (name === 'bed') { if (level > 0.001) startMusic(); else stopMusic(); }
      else if (name === 'work' || name === 'power') { if (sess) sess.flag(name, level > 0.001); }
      // (a snore is two breaths and two soft notes, laid out 2.7 s ahead: when Pip wakes, the one that is sounding is
      // let go too, or its two notes arrive after Pip is already up)
      else if (name === 'snore') { if (level > 0.001 && !snoreT) snoreLoop(); else if (level <= 0.001) { clearTimeout(snoreT); snoreT = 0; if (sess && sess.snoreOut && E) { try { sess.snoreOut.gain.setTargetAtTime(0, E.now(), 0.05); } catch (e) { /* gone */ } sess.snoreOut = null; } } }
      else if (name === 'swing') swingLoop(level);
    },
    /* where the person is: { index (screen in the flow), chapter 0..4, asleep } */
    progress(s) { ['index', 'chapter', 'asleep'].forEach((k) => { if (s[k] != null) S[k] = k === 'asleep' ? !!s[k] : s[k] | 0; }); if (sess) sess.progress(S); if (API.trace && E) API.trace.push({ t: +E.now().toFixed(3), kind: 'progress', index: S.index, chapter: S.chapter, asleep: S.asleep }); fire('progress', Object.assign({}, S)); },
    intensity() { return current().level(S); },
    /* what is playing: the parts of the song and whether each is in */
    parts() {
      const e = current(), song = e.song, I = e.level(S);
      if (!song.tracks) return [{ name: 'tune', role: 'lead', inst: 'original', on: true }, { name: 'bass', role: 'bass', inst: 'original', on: true }];
      return Object.keys(song.tracks).map((n) => { const T = song.tracks[n]; return { name: n, role: T.role || null, inst: T.inst || 'drums', on: T.when ? S.want[T.when] > 0.001 : T.at ? T.at.indexOf(I) >= 0 : I >= (T.from || 0) && I <= (T.to == null ? 99 : T.to) }; });
    },
    on(type, fn) {
      if (/^(beat|note|sfx|say)$/.test(type)) { if (E) return E.on(type, fn); pending.push([type, fn]); return () => {}; }
      (subs[type] = subs[type] || []).push(fn); return () => { const a = subs[type], i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); };
    },
    mouth() { return E ? PS.voice.mouthAt(E.now()) : { open: 0, round: 0 }; },
    transport() { const p = sess && sess.player; if (!p || !p.playing) return { playing: false }; const a = p.at(E.now()), pulse = p.pulse || 1; return { playing: true, bpm: p.bpm, meter: p.beats, pulse, bar: a.bar, beat: a.beat, phase: (a.beat / pulse) % 1, song: p.song.id, level: p.intensity, barT: a.barT, beatDur: p.beat }; },
    analyser() { return E && E.analyser; },
    /* the song that is on (or would be). kit: the look it was written for, which under the jukebox need not be the look on show */
    song() { const e = current(); return { id: e.id, kit: e.kit, title: e.id === 'original' ? 'Original' : e.title, family: e.family, song: e.song, level: e.level }; },
    /* set to [] to keep a record of what the page asks for (the checks replay it offline): { t, kind: 'play' | 'say' | 'progress', ... } */
    trace: null,
    Session, LEVEL, RATE, PRI
  };

  /* ------------------------------------------------------------------ offline: render exactly what the page plays
     spec { kit, song (id; the look's default), voice (another take of Pip's voice), seconds, music (true), chapter, index,
     asleep, limit (false: no limiter, to see what reaches it), script: [{ at, play, op, say, mood, chapter, index, asleep,
     flag: [name, on], song }] } -> Promise<AudioBuffer> */
  API.render = function (spec) {
    const sr = spec.sr || 48000, ctx = new OfflineAudioContext(2, Math.ceil(sr * spec.seconds), sr), kit = kitOf(spec.kit);
    const e = new PS.Engine(ctx, { offline: true, seed: 7, limit: spec.limit }); Object.keys(S.vol).forEach((n) => e.setVolume(n, spec.vol && spec.vol[n] != null ? spec.vol[n] : PS.MIX[n], true));
    const s = new Session(e, { kit, song: spec.song || PS.DEFAULT_SONG[kit], voices: spec.voice ? { [kit]: spec.voice } : {}, chapter: spec.chapter || 0, index: spec.index || 0, asleep: !!spec.asleep, seed: 5 });
    const script = (spec.script || []).slice().sort((a, b) => a.at - b.at);
    let p = null;
    const begin = (at) => { p = s.make(); PS.inst.prewarm(e, p.notesNeeded().map((n) => [n[0], n[1]])); s.swap(p, at); };
    if (spec.music !== false) begin(spec.musicAt || 0.05);
    script.forEach((x) => {
      if (p) p.schedule(x.at);
      if (x.chapter != null || x.index != null || x.asleep != null) s.progress(x);
      if (x.flag) s.flag(x.flag[0], x.flag[1]);
      if (x.song) { s.setSong(x.song, kit); begin(x.at); }
      if (x.play) s.play(x.play, x.op || {}, x.at);
      if (x.say != null) s.say(x.say, { mood: x.mood, crew: x.crew }, x.at);
    });
    if (p) p.schedule(spec.seconds);
    return ctx.startRendering();
  };
  API.wav = function (buf) {
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, data = [];
    for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    const out = new DataView(new ArrayBuffer(44 + n * ch * 2)), W = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
    W(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); W(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
    out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); W(36, 'data'); out.setUint32(40, n * ch * 2, true);
    let o = 44; for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, data[c][i])); out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7FFF, true); o += 2; }
    return new Uint8Array(out.buffer);
  };
  /* loudness of a rendered buffer the way a meter reads it (BS.1770 K-weighting): { momentary (loudest 400 ms), integrated, peak dB, low (how much
     of the loudest tenth of a second lies under 120 Hz, dB against the whole: a thump shows here) } */
  API.loudness = function (buf) {
    const sr = buf.sampleRate, n = buf.length, K1 = [[1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]], K2 = [[1, -2, 1], [1, -1.99004745483398, 0.99007225036621]];
    const biq = (x, b, a) => { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
    const k = [], L = (e) => -0.691 + 10 * Math.log10(Math.max(e, 1e-12)); let peak = 0;
    for (let c = 0; c < buf.numberOfChannels; c++) { const x = buf.getChannelData(c); for (let i = 0; i < n; i++) { const a = Math.abs(x[i]); if (a > peak) peak = a; } k.push(biq(biq(x, K1[0], K1[1]), K2[0], K2[1])); }
    const win = Math.round(sr * 0.4), hop = Math.round(sr * 0.1), z = [];
    for (let i = 0; i + win <= n; i += hop) { let e = 0; for (let c = 0; c < k.length; c++) { const y = k[c]; let s = 0; for (let j = i; j < i + win; j++) s += y[j] * y[j]; e += s / win; } z.push(e); }
    if (!z.length) { let e = 0; for (let c = 0; c < k.length; c++) { const y = k[c]; let s = 0; for (let j = 0; j < n; j++) s += y[j] * y[j]; e += s / Math.max(1, n); } z.push(e); }
    // the low end on its own: a one-pole low-pass at 120 Hz, twice, and the loudest tenth of a second of it
    let lowPk = 0, allPk = 0;
    { const x = buf.getChannelData(0), a = 1 - Math.exp(-2 * Math.PI * 120 / sr), w = Math.round(sr * 0.1); let l1 = 0, l2 = 0, sl = 0, sa = 0; const ql = new Float32Array(w), qa = new Float32Array(w); for (let i = 0; i < n; i++) { l1 += a * (x[i] - l1); l2 += a * (l1 - l2); const j = i % w; sl += l2 * l2 - ql[j]; sa += x[i] * x[i] - qa[j]; ql[j] = l2 * l2; qa[j] = x[i] * x[i]; if (sl > lowPk) lowPk = sl; if (sa > allPk) allPk = sa; } }
    const abs = z.filter((e) => L(e) > -70); if (!abs.length) return { momentary: -99, integrated: -99, peak: -99, low: -99 };
    const rel = L(abs.reduce((a, b) => a + b, 0) / abs.length) - 10, g = abs.filter((e) => L(e) > rel);
    return { momentary: +Math.max(...z.map(L)).toFixed(1), integrated: +L(g.reduce((a, b) => a + b, 0) / g.length).toFixed(1), peak: +(20 * Math.log10(Math.max(peak, 1e-9))).toFixed(1), low: +(10 * Math.log10(Math.max(lowPk, 1e-12) / Math.max(allPk, 1e-12))).toFixed(1) };
  };
  API.wavBase64 = function (buf) { const u = API.wav(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };

  // nothing sounds before the person's first click or key
  const STARTS = { pointerup: 1, touchend: 1, mousedown: 1, click: 1, keydown: 1 };   // where iOS lets a context start
  ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'click', 'keydown'].forEach((ev) => G.addEventListener(ev, (e) => { if (e.isTrusted === false) return; API.unlock(); wake(!!STARTS[ev]); }, { capture: true, passive: true }));

  // what the sound is doing, for a device that stays silent: PipSound.health(), and ?audiodebug=1 writes it on the page
  API.health = function () {
    let peak = 0;
    try { if (E && E.analyser) { const d = new Float32Array(E.analyser.fftSize); E.analyser.getFloatTimeDomainData(d); for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i])); } } catch (e) { /* no analyser */ }
    return { state: E ? E.ctx.state : 'none', rate: E ? E.sr : 0, time: E ? +E.ctx.currentTime.toFixed(1) : 0, peak: +peak.toFixed(3), unlocked: S.unlocked, muted: S.muted, session: (navigator.audioSession && navigator.audioSession.type) || 'none', keep: keep ? (keep.paused ? 'paused' : 'playing') : 'none', errors: PS.errors.slice(-2) };
  };
  if (G.PIP_AUDIO_DEBUG || /[?&#]audiodebug/.test(String(location.href))) {
    let top = 0, last = '';
    G.addEventListener('error', (e) => PS.errors.push('page: ' + e.message + ' @' + String(e.filename || '').split('/').pop() + ':' + e.lineno));
    ['touchend', 'click', 'keydown'].forEach((ev) => G.addEventListener(ev, () => { last = ev + (navigator.userActivation ? ' active=' + navigator.userActivation.isActive : ''); }, true));
    const el = document.createElement('pre'); el.id = 'audioDebug';
    el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;margin:0;padding:6px 8px;font:11px/1.35 ui-monospace,Menlo,monospace;background:rgba(0,0,0,.8);color:#7f7;white-space:pre-wrap;pointer-events:none';
    const show = () => { const h = API.health(); top = Math.max(top, h.peak); el.textContent = 'audio ' + h.state + ' @' + h.rate + ' t=' + h.time + ' peak=' + h.peak + ' max=' + top.toFixed(3) + '\nunlocked=' + h.unlocked + ' muted=' + h.muted + ' session=' + h.session + ' keep=' + h.keep + ' last=' + last + '\n' + h.errors.join(' | ').slice(0, 300); };
    const mount = () => { document.body.appendChild(el); setInterval(show, 250); };
    if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  }
  document.addEventListener('visibilitychange', () => { keepAwake(); if (!sess) return; if (document.hidden) { if (sess.player) { sess.music(false); S.paused = true; } } else if (S.paused) { S.paused = false; startMusic(); } });
  G.PipSound = API;
})(window);
