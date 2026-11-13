/* Pip's sound (Fable 5.2). api.js: window.PipSound, the one door the stage and the window knock on.
   It keeps the calls the Pip concept already makes (play, say, hush, loop, setTheme, toggle, kitOf) and adds what the
   three concepts need: which concept is playing (c1 Encore, c2 House Band, c3 Marionette Theatre, or 'orig', the
   sound PMConcept7 has today, for comparison), a three-way mixer, where the person is in the flow (progress), and
   things the stage can watch: beats and notes as they are heard, how open Pip's mouth is, the analyser.
   A Session is one concept and look playing on one engine; the page has a live one, and the tools make offline ones
   to render and measure exactly what the page plays. */
(function (G) {
  'use strict';
  const PS = G.PS5, clamp = PS.clamp;
  const KITS = ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'];
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
  const RATE = { tip: 600, hover: 45, key: 40, tap: 30, select: 40, lower: 60, ghost: 80, land: 50, tick: 80, sparkle: 90, rail: 120, decode: 90, score: 150, lock: 120, hop: 90, swing: 140, toggleOn: 40, toggleOff: 40, think: 400 };
  // how much of a sound reaches the room: the quick ones you hear again and again stay dry, so nothing smears
  const DRY = { tip: 0.4, hover: 0.15, tap: 0.2, key: 0.2, tick: 0.35, toggleOn: 0.35, toggleOff: 0.35, select: 0.4, next: 0.45, back: 0.4, slice: 0.3, lock: 0.4, land: 0.3, block: 0.4, warn: 0.3 };
  // each event's place in the mix (dB), against the music
  const LEVEL = { tap: -6, hover: -10, key: -7, select: -2, toggleOn: -4, toggleOff: -5, next: -3, back: -4, open: -1, close: -2, warn: -1, lower: -6, ghost: -12, land: -4, lift: -8, hop: -5, swing: -10, tryOn: -3, sparkle: -5, confetti: 1, chapter: -1, tick: -3, block: -2, power: -3, score: -10, lock: -8, decode: -9, slice: -8, degauss: -5, feed: -6, powerOn: -3, powerOff: -4, rail: -8, tip: -5, cheer: -4, crew: -1, snore: -4, think: -8 };
  const MOODS = { wake: 'happy', sleep: 'sleep', think: 'think', happy: 'happy', wink: 'wink', alert: 'alert', cheer: 'happy', crew: 'happy' };

  /* ------------------------------------------------------------------ a session: one concept, one look, one engine */
  class Session {
    constructor(E, o) {
      this.E = E; this.concept = o.concept || 'c1'; this.kit = o.kit || 'friendly';
      this.chapter = o.chapter || 0; this.index = o.index || 0; this.asleep = !!o.asleep; this.reduced = !!o.reduced;
      this.flags = { work: false, power: false }; this.player = null; this.line = null; this.last = {}; this.at = {}; this.vr = PS.rng(o.seed == null ? 99 : o.seed);
      this.sfxLevel = o.sfxLevel == null ? 1 : o.sfxLevel;
      E.setRoom(this.look().room);
    }
    C() { return PS.concepts[this.concept]; }
    look(kit) { return this.C().looks[kit || this.kit]; }
    intensity() { return this.C().intensity({ chapter: this.chapter, index: this.index, asleep: this.asleep }); }
    vox(kit) { const L = this.look(kit), V = Object.assign({}, PS.voice.VOX[kit || this.kit], L.voxKind || {}, L.vox || {}), T = PS.TRIMS && PS.TRIMS[this.concept + '-' + (kit || this.kit)]; V.dress = L.dress || null; V.trim = PS.db((T && T.say) || 0); V.trims = T || {}; return V; }
    /* the chord of this moment: the music's if it is playing, otherwise the chapter's own in the look's key */
    harmony(t) {
      const song = this.look().song, p = this.player;
      if (p && p.playing && p.hist.length) { const a = p.at(t), tri = a.ch.iv.slice(0, 3).map((i) => (a.ch.root + i + a.tr) % 12); return { pcs: tri, tr: a.tr }; }
      const sc = song.scale, d = (sc[2] === 4 ? [0, 3, 4, 5, 0] : [0, 5, 2, 6, 3])[clamp(this.chapter, 0, 4)];
      return { pcs: [0, 2, 4].map((k) => (song.tonic + sc[(d + k) % 7]) % 12), tr: 0 };
    }
    helper(name, op, t, kit) {
      const E = this.E, L = this.look(kit), P = L.pal, song = this.look().song, H = this.harmony(t), sc = song.scale, reg = L.reg + H.tr, S = this;
      const tk = this.concept + '-' + (kit || this.kit), tr = PS.TRIMS && PS.TRIMS[tk] && PS.TRIMS[tk][name] || 0;
      const lvl = PS.db((LEVEL[name] == null ? -4 : LEVEL[name]) + tr) * this.sfxLevel * PS.TRIM.sfx * (0.5 + 0.7 * (op.intensity == null ? 0.7 : clamp(op.intensity, 0, 1)));
      const out = E.chain('sfx', { gain: lvl, pan: op.pan != null ? clamp(op.pan, -1, 1) : (this.vr() - 0.5) * 0.2, send: DRY[name] != null ? DRY[name] : 0.6 });
      const map = L.special ? PS.DRUM_MAPS[L.special] : null, key = (kit || this.kit) + ':' + name, prev = this.last[key];
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
        n: (inst, midi, dt, g, o) => PS.inst.note(E, out, inst, midi, t + (dt || 0), Object.assign({ gain: g }, o || {})),
        d: (dn, dt, g, rate) => PS.inst.drum(E, out, (map && map[dn]) || dn, t + (dt || 0), { gain: g, rate }),
        sw: (o, dt) => PS.inst.swish(E, out, t + (dt || 0), o),
        tone: (o, dt) => PS.inst.tone(E, out, t + (dt || 0), o)
      };
    }
    gesture(name, kit) {
      const L = this.look(kit), sp = L.special && PS.sfx.SPECIAL[L.special];
      // the House Band's and the Theatre's own versions come before a look's speciality, except for what only that look has
      const G1 = PS.sfx.g1, mine = PS.sfx[this.C().gest];
      if (sp && sp[name] && (mine[name] === G1[name] || this.C().gest === 'g1' || L.special === 'nier' && /hover|tap|slice|lock|decode|ghost|think/.test(name))) return sp[name];
      return mine[name] || null;
    }
    /* play one event. at: when (offline scripts); returns false if it was dropped */
    play(name, op, at) {
      op = op || {};
      const E = this.E, kit = op.kit ? kitOf(op.kit) : null;
      if (op.chapter != null) this.setChapter(op.chapter);
      if (QUIET_UNLESS_NIER.has(name) && (kit || this.kit) !== 'nier') return false;
      if (this.reduced && MOTION.has(name)) return false;
      let t = at == null ? E.now() + 0.008 : at;
      const gap = RATE[name], rk = (kit || this.kit) + name;
      if (gap && this.at[rk] != null && (t - this.at[rk]) * 1000 < gap) return false;
      this.at[rk] = t;
      // House Band: land on the next grid line when it is close
      const Q = this.C().quant, p = this.player;
      if (Q && Q[name] && p && p.playing && p.hist.length) { const g = p.grid(t, Q[name]); if (g - t <= (this.C().quantMax || 0.12)) t = g; }
      if (name === 'tryOn' || name === 'sig') { const h = this.helper('tryOn', op, t, kit); h.sw({ d: 0.22, f: 600, f2: 2400, gain: 0.04 }); this.look(kit).sig(h, 0.12); return true; }
      const fn = this.gesture(name, kit);
      if (VOCAL.has(name) && !(name === 'think' && fn && this.look(kit).special === 'nier')) {
        // a wordless sound has its own measured place in the mix, apart from a spoken line's
        const V = this.vox(kit), trim = PS.db(V.trims[name] == null ? (V.trims.say || 0) : V.trims[name]);
        if (name === 'crew') { [['crown', -0.4], ['hardhat', 0], ['glasses', 0.4]].forEach(([crew, pan], i) => PS.voice.vocal(E, V, 'crew', { mood: 'happy', crew, pan, at: t + i * 0.12, level: 0.8, trim })); }
        else PS.voice.vocal(E, V, name, { mood: MOODS[name], at: t, music: p, pan: op.pan, trim });
        if (name !== 'cheer' && name !== 'crew') return true;
      }
      if (!fn) return false;
      fn(this.helper(name, op, t, kit));
      E.emit('sfx', { name, kit: kit || this.kit }, t);
      return true;
    }
    say(text, o, at) {
      o = o || {};
      const E = this.E, V = this.vox(o.kit ? kitOf(o.kit) : null), tm = PS.voice.timing(V, text, o.mood, o.crew);
      this.hush(at);
      if (!text) return tm;
      const t = at == null ? E.now() + 0.02 : at;
      const r = PS.voice.say(E, V, text, { mood: o.mood, crew: o.crew, music: this.player, pan: o.pan, at: t });
      this.line = r.handle; E.duck(t, t + r.ms / 1000, 0.6);
      E.emit('say', { ms: r.ms, text }, t);
      return r;
    }
    hush(at) { if (this.line) { try { this.line.stop(at == null ? this.E.now() : at); } catch (e) { /* gone */ } this.line = null; } }
    setChapter(ch) { this.chapter = clamp(ch | 0, 0, 4); if (this.player) { this.player.setChapter(this.chapter); this.player.setIntensity(this.intensity()); } }
    progress(s) { if (s.chapter != null) this.chapter = clamp(s.chapter | 0, 0, 4); if (s.index != null) this.index = s.index | 0; if (s.asleep != null) this.asleep = !!s.asleep; if (this.player) { this.player.setChapter(this.chapter); this.player.setIntensity(this.intensity()); } }
    flag(name, on) { this.flags[name] = !!on; if (this.player) this.player.flag(name, on); }
    music(on, at, script) {
      const E = this.E;
      if (!on) { if (this.player) { this.player.fade(at == null ? E.now() : at, 0.1); this.player = null; } return null; }
      const L = this.look(); if (this.player && this.player.playing && this.player.song === L.song) return this.player;
      if (this.player) this.player.fade(E.now(), 0.08);
      const p = this.player = new PS.music.Player(E, L.song, { chapter: this.chapter, intensity: this.intensity(), script });
      p.flag('work', this.flags.work); p.flag('power', this.flags.power);
      return p;
    }
    setKit(kit) { this.kit = kit; this.E.setRoom(this.look().room); }
  }

  /* ------------------------------------------------------------------ the live page */
  const S = { concept: 'c1', theme: 'friendly-dark', kit: 'friendly', muted: false, unlocked: false, reduced: false, sigOnLook: true, vol: { music: 0.85, voice: 1, sfx: 1 }, want: { bed: 0, work: 0, power: 0, snore: 0, swing: 0 }, chapter: 0, index: 0, asleep: true };
  let E = null, sess = null, clock = 0, snoreT = 0, swingN = null, ORIG = null, origLoading = false;
  const pending = [], subs = {};
  if (G.PIP_CONCEPT && PS.concepts[G.PIP_CONCEPT]) S.concept = G.PIP_CONCEPT;
  try { const q = new URLSearchParams(location.search), c = q.get('sound'); if (c && (PS.concepts[c] || c === 'orig')) S.concept = c; } catch (e) { /* file:// */ }
  const fire = (type, data) => (subs[type] || []).forEach((f) => { try { f(data); } catch (e) { PS.errors.push(String((e && e.stack) || e)); } });
  const audible = () => !S.muted && S.unlocked && S.concept !== 'orig';
  function ensure() {
    if (E) { if (E.ctx.state !== 'running' && E.ctx.state !== 'closed') { try { const p = E.ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* closed */ } } return E; }
    const AC = G.AudioContext || G.webkitAudioContext; if (!AC) return null;
    E = new PS.Engine(new AC({ latencyHint: 'interactive' }), { room: 'felt' });
    Object.keys(S.vol).forEach((n) => E.setVolume(n, S.vol[n]));
    pending.forEach(([t, f]) => E.on(t, f));
    sess = new Session(E, { concept: S.concept === 'orig' ? 'c1' : S.concept, kit: S.kit, chapter: S.chapter, index: S.index, asleep: S.asleep, reduced: S.reduced });
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
  function startMusic() {
    if (!audible() || !(S.want.bed > 0.001) || !ensure()) return;
    const L = sess.look(); if (sess.player && sess.player.playing && sess.player.song === L.song) return;
    const p = sess.music(true); p.playing = false;
    // what is playing now first, so the tune starts at once; the parts that join later are made ready behind it
    const now = [], later = [];
    p.notesNeeded().forEach((n) => (n[2] ? now : later).push(n));
    PS.inst.prewarm(E, now.length ? now : later, () => { if (sess.player !== p) return; p.start(E.now() + 0.1); tick(); fire('music', { on: true, song: L.song.id }); PS.inst.prewarm(E, later); });
    if (!clock) clock = setInterval(tick, 40);
  }
  function stopMusic() { if (sess) sess.music(false); fire('music', { on: false }); }
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
      s.connect(b); b.connect(g); g.connect(E.chain('sfx', { gain: 0.05, send: 0.3 })); s.start(); swingN = { b, g };
    }
    if (swingN) { swingN.g.gain.setTargetAtTime(Math.pow(level, 1.6), E.now(), 0.06); swingN.b.frequency.setTargetAtTime(300 + level * 1300, E.now(), 0.08); }
  }
  function refresh() {
    // sound switched on or off, a new look or a new concept: bring everything that should be sounding into line
    if (S.concept === 'orig') { stopMusic(); if (sess) sess.hush(); origSync(); return; }
    origQuiet();
    if (!audible()) { stopMusic(); if (sess) sess.hush(); swingLoop(0); return; }
    if (!ensure()) return;
    sess.concept = S.concept; sess.setKit(S.kit); sess.reduced = S.reduced;
    sess.progress({ chapter: S.chapter, index: S.index, asleep: S.asleep });
    sess.flag('work', S.want.work > 0); sess.flag('power', S.want.power > 0);
    if (S.want.bed > 0.001) startMusic(); else stopMusic();
    snoreLoop();
  }
  /* PMConcept7's sound today (the Pip concept's sound.js), fetched only when asked for, and never written to: its own
     page keeps its own sound setting */
  function withOrig(fn) {
    if (ORIG) { fn(ORIG); return; }
    if (origLoading) return; origLoading = true;
    const mine = G.PipSound, s = document.createElement('script'); s.src = (G.PIP_ORIG_SRC || '../opus-5.5-pip/sound.js');
    s.onload = () => { ORIG = G.PipSound; G.PipSound = mine; G.PipSoundOriginal = ORIG; origLoading = false; try { ORIG.unlock(); } catch (e) { /* needs a gesture */ } fn(ORIG); };
    s.onerror = () => { origLoading = false; fire('orig', { ok: false }); };
    document.head.appendChild(s);
  }
  function origMute(m) { const set = Storage.prototype.setItem; Storage.prototype.setItem = function (k) { if (k === 'pip-sound:muted') return; return set.apply(this, arguments); }; try { ORIG.setMuted(m); } catch (e) { /* fine */ } finally { Storage.prototype.setItem = set; } }
  function origSync() { withOrig((O) => { if (S.concept !== 'orig') return; origMute(S.muted); try { O.setReduced(S.reduced); O.setTheme(S.theme); Object.keys(S.want).forEach((n) => O.loop(n, S.muted ? 0 : S.want[n])); } catch (e) { /* fine */ } fire('orig', { ok: true }); }); }
  function origQuiet() { if (!ORIG) return; try { ['bed', 'work', 'power', 'snore', 'swing'].forEach((n) => ORIG.loop(n, 0)); ORIG.hush(); } catch (e) { /* fine */ } }

  const API = {
    KITS, CONCEPTS: () => Object.values(PS.concepts).map((c) => ({ id: c.id, name: c.name, title: c.title, blurb: c.blurb })).concat([{ id: 'orig', name: 'Today', title: 'PMConcept7 today', blurb: 'The sound PMConcept7 has now, for comparison.' }]),
    kitOf,
    get muted() { return S.muted; }, get unlocked() { return S.unlocked; }, get concept() { return S.concept; }, get kit() { return S.kit; }, get theme() { return S.theme; },
    get ctx() { return E && E.ctx; }, get engine() { return E; }, get session() { return sess; },
    setConcept(id) { if (!(PS.concepts[id] || id === 'orig') || id === S.concept) return; S.concept = id; if (sess) sess.last = {}; refresh(); fire('concept', { id }); },
    setTheme(t) { const k = kitOf(t), was = S.kit; S.theme = String(t || S.theme); S.kit = k; if (S.concept === 'orig') { origSync(); return; } if (k !== was) { refresh(); if (audible() && sess && S.sigOnLook) sess.play('sig', { kit: k }); } },
    setMuted(m) { S.muted = !!m; refresh(); keepAwake(); fire('mute', { muted: S.muted }); try { G.dispatchEvent(new CustomEvent('pipsound')); } catch (e) { /* old browser */ } },
    toggle() { API.setMuted(!S.muted); return S.muted; },
    setReduced(r) { S.reduced = !!r; if (sess) sess.reduced = S.reduced; if (S.reduced) swingLoop(0); if (S.concept === 'orig' && ORIG) try { ORIG.setReduced(S.reduced); } catch (e) { /* fine */ } },
    volume(name, v) { if (v == null) return S.vol[name]; S.vol[name] = clamp(+v, 0, 1.5); if (E) E.setVolume(name, S.vol[name]); return S.vol[name]; },
    unlock() { if (S.unlocked) return; S.unlocked = true; refresh(); fire('unlock', {}); },
    play(name, op) {
      op = op || {};
      if (op.chapter != null) S.chapter = clamp(op.chapter | 0, 0, 4);
      if (S.concept === 'orig') { if (ORIG && !S.muted) try { return ORIG.play(name, op); } catch (e) { return false; } return false; }
      if (!audible() || !ensure()) return false;
      if (!ready()) return false;
      try { return sess.play(name, op); } catch (e) { PS.errors.push(name + ': ' + String((e && e.stack) || e)); return false; }
    },
    say(text, o) {
      o = o || {};
      if (S.concept === 'orig') { if (ORIG) try { return S.muted ? ORIG.sayTiming(text, o) : ORIG.say(text, o); } catch (e) { /* fall through */ } return { ms: String(text || '').length * 32, cps: 31 }; }
      const kit = o.kit ? kitOf(o.kit) : S.kit, C = PS.concepts[S.concept], L = C.looks[kit], V = Object.assign({}, PS.voice.VOX[kit], L.voxKind || {}, L.vox || {});
      if (!audible() || !ensure() || !ready()) { if (sess) sess.hush(); return PS.voice.timing(V, text, o.mood, o.crew); }
      return sess.say(text, o);
    },
    hush() { if (S.concept === 'orig' && ORIG) { try { ORIG.hush(); } catch (e) { /* fine */ } return; } if (sess) sess.hush(); },
    loop(name, level) {
      if (!(name in S.want)) return;
      level = clamp(+level || 0, 0, 1); S.want[name] = level;
      if (S.concept === 'orig') { if (ORIG && !S.muted) try { ORIG.loop(name, level); } catch (e) { /* fine */ } return; }
      if (name === 'bed') { if (level > 0.001) startMusic(); else stopMusic(); }
      else if (name === 'work' || name === 'power') { if (sess) sess.flag(name, level > 0.001); }
      else if (name === 'snore') { if (level > 0.001 && !snoreT) snoreLoop(); else if (level <= 0.001) { clearTimeout(snoreT); snoreT = 0; } }
      else if (name === 'swing') swingLoop(level);
    },
    /* where the person is: { index (screen in the flow), chapter 0..4, asleep } */
    progress(s) { ['index', 'chapter', 'asleep'].forEach((k) => { if (s[k] != null) S[k] = k === 'asleep' ? !!s[k] : s[k] | 0; }); if (sess && S.concept !== 'orig') sess.progress(S); fire('progress', Object.assign({}, S)); },
    intensity() { const C = PS.concepts[S.concept]; return C ? C.intensity(S) : 0; },
    /* what is playing: the parts of the song and whether each is in */
    parts() { const C = PS.concepts[S.concept]; if (!C) return []; const song = C.looks[S.kit].song, I = C.intensity(S); return Object.keys(song.tracks).map((n) => { const T = song.tracks[n]; return { name: n, role: T.role || null, inst: T.inst || 'drums', on: T.when ? S.want[T.when] > 0.001 : T.at ? T.at.indexOf(I) >= 0 : I >= (T.from || 0) && I <= (T.to == null ? 99 : T.to) }; }); },
    on(type, fn) {
      if (/^(beat|note|sfx|say)$/.test(type)) { if (E) return E.on(type, fn); pending.push([type, fn]); return () => {}; }
      (subs[type] = subs[type] || []).push(fn); return () => { const a = subs[type], i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); };
    },
    mouth() { return E && S.concept !== 'orig' ? PS.voice.mouthAt(E.now()) : { open: 0, round: 0 }; },
    transport() { const p = sess && sess.player; if (!p || !p.playing || !p.hist.length || S.concept === 'orig') return { playing: false }; const a = p.at(E.now()); return { playing: true, bpm: p.bpm, meter: p.beats, pulse: p.pulse, bar: a.bar, beat: a.beat, phase: (a.beat / p.pulse) % 1, song: p.song.id, level: p.intensity }; },
    analyser() { return E && E.analyser; },
    song() { const C = PS.concepts[S.concept]; return C ? C.looks[S.kit].song : null; },
    Session, LEVEL, RATE
  };

  /* ------------------------------------------------------------------ offline: render exactly what the page plays
     spec { concept, kit, seconds, music (true), chapter, index, asleep, script: [{ at, play, op, say, mood, chapter, index,
     asleep, flag: [name, on] }] } -> Promise<AudioBuffer> */
  API.render = function (spec) {
    const sr = spec.sr || 48000, ctx = new OfflineAudioContext(2, Math.ceil(sr * spec.seconds), sr);
    const e = new PS.Engine(ctx, { offline: true, seed: 7 }); Object.keys(S.vol).forEach((n) => { e.bus[n].gain.value = spec.vol && spec.vol[n] != null ? spec.vol[n] : S.vol[n]; });
    const s = new Session(e, { concept: spec.concept, kit: kitOf(spec.kit), chapter: spec.chapter || 0, index: spec.index || 0, asleep: !!spec.asleep, seed: 5 });
    const script = (spec.script || []).slice().sort((a, b) => a.at - b.at);
    let p = null;
    if (spec.music !== false) { p = s.music(true); PS.inst.prewarm(e, p.notesNeeded().map((n) => [n[0], n[1]])); p.start(spec.musicAt || 0.05); }
    script.forEach((x) => {
      if (p) p.schedule(x.at);
      if (x.chapter != null || x.index != null || x.asleep != null) s.progress(x);
      if (x.flag) s.flag(x.flag[0], x.flag[1]);
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
  /* loudness of a rendered buffer the way a meter reads it (BS.1770 K-weighting): { momentary (loudest 400 ms), integrated, peak dB } */
  API.loudness = function (buf) {
    const sr = buf.sampleRate, n = buf.length, K1 = [[1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]], K2 = [[1, -2, 1], [1, -1.99004745483398, 0.99007225036621]];
    const biq = (x, b, a) => { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
    const k = [], L = (e) => -0.691 + 10 * Math.log10(Math.max(e, 1e-12)); let peak = 0;
    for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < n; i++) if (Math.abs(d[i]) > peak) peak = Math.abs(d[i]); k.push(biq(biq(d, K1[0], K1[1]), K2[0], K2[1])); }
    const blk = Math.round(0.4 * sr), hop = Math.round(0.1 * sr), z = [];
    for (let s = 0; s + blk <= n; s += hop) { let e = 0; for (const c of k) { let q = 0; for (let i = s; i < s + blk; i++) q += c[i] * c[i]; e += q / blk; } z.push(e); }
    const abs = z.filter((e) => L(e) > -70); if (!abs.length) return { momentary: -99, integrated: -99, peak: -99 };
    const rel = L(abs.reduce((a, b) => a + b, 0) / abs.length) - 10, g = abs.filter((e) => L(e) > rel);
    return { momentary: +Math.max(...z.map(L)).toFixed(1), integrated: +L(g.reduce((a, b) => a + b, 0) / g.length).toFixed(1), peak: +(20 * Math.log10(Math.max(peak, 1e-9))).toFixed(1) };
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
