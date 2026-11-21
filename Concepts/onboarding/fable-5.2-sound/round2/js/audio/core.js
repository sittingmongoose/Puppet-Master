/* Pip's sound, three concepts (Fable 5.2). core.js: the engine every concept plays through.
   Everything is synthesised: no audio files and no samples. An Engine wraps one audio context (live or offline) with
   three buses (music, effects, Pip's voice), a room per look, a soft limiter and an analyser for the stage's
   visualisers. Events the stage wants to see (a beat, a note, a new layer) are queued with their audio time and
   handed out when that moment is heard, so pictures and sound stay together. */
(function (G) {
  'use strict';
  const PS = G.PS5 = G.PS5 || {};
  const clamp = PS.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  PS.errors = [];   // faults caught where sound must go on regardless (a listener, a gesture); the checks read them
  PS.mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
  PS.db = (d) => Math.pow(10, d / 20);
  // where the three levels start (what the sound menu's sliders show at first): the mix was balanced here
  PS.MIX = { music: 0.85, voice: 1, sfx: 1 };
  PS.rng = function (seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  PS.hash = (s) => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  /* ------------------------------------------------------------------ rooms
     An impulse response built in code: a few early reflections, then a dense tail whose highs die first. Left and
     right are different noise, so a tail never wobbles in the middle of the head. */
  function makeIR(ctx, r) {
    const sr = ctx.sampleRate, len = Math.ceil(sr * (r.rt * 1.15 + (r.pre || 0) + 0.05)), b = ctx.createBuffer(2, len, sr);
    const pre = Math.round((r.pre || 0) * sr), bright = r.bright == null ? 0.5 : r.bright, hp = r.hp || 220;
    let energy = 0;
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch), q = PS.rng(9001 + ch * 77 + Math.round(r.rt * 100));
      const fall = Math.exp(-6.91 / (r.rt * sr));
      let env = 1, lp = 0, lp2 = 0, hx = 0, hy = 0;
      const hpA = 1 / (1 + (2 * Math.PI * hp) / sr);
      for (let i = pre; i < len; i++) {
        const tt = (i - pre) / sr;
        // the tail darkens as it goes: the low-pass closes from bright to about a third of it
        const k = clamp((0.06 + bright * 0.72) * (0.38 + 0.62 * Math.exp(-tt / (r.rt * 0.45))), 0.02, 0.95);
        const x = (q() + q() + q() - 1.5) * 1.15;
        lp += (x - lp) * k; lp2 += (lp - lp2) * Math.min(0.95, k * 1.6);
        hy = hpA * (hy + lp2 - hx); hx = lp2;
        d[i] = hy * env * Math.min(1, tt / (r.build || 0.012));
        env *= fall;
      }
      // early reflections: the stage's walls, a different pattern each side
      const ER = r.er || 0;
      if (ER) {
        const taps = [[0.0043, 0.62], [0.0091, 0.5], [0.0137, 0.42], [0.0199, 0.34], [0.0271, 0.27], [0.0353, 0.2], [0.0467, 0.15], [0.0589, 0.1]];
        taps.forEach(([s, g], j) => {
          const i = pre + Math.round((s * (r.size || 1) * (ch ? 1.07 : 0.95)) * sr);
          if (i < len - 2) { const sgn = (j + ch) % 2 ? -1 : 1; d[i] += g * ER * sgn * 2.2; d[i + 1] += g * ER * sgn * 1.1; }
        });
      }
      for (let i = 0; i < len; i++) energy += d[i] * d[i];
    }
    const k = 1 / Math.sqrt(energy / 2 || 1);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] *= k; }
    return b;
  }
  PS.ROOMS = {
    // name: { rt seconds, pre delay, bright 0..1, er early-reflection level, wet }
    dry: { rt: 0.28, pre: 0.002, bright: 0.45, er: 0.5, wet: 0.1 },
    felt: { rt: 0.75, pre: 0.006, bright: 0.3, er: 0.7, wet: 0.2 },
    studio: { rt: 0.42, pre: 0.004, bright: 0.5, er: 0.6, wet: 0.14 },
    glass: { rt: 2.3, pre: 0.022, bright: 0.72, er: 0.35, wet: 0.3, hp: 320 },
    tube: { rt: 0.33, pre: 0.001, bright: 0.28, er: 0.9, size: 0.5, wet: 0.16 },
    office: { rt: 0.55, pre: 0.005, bright: 0.38, er: 0.8, wet: 0.16 },
    ruin: { rt: 2.7, pre: 0.03, bright: 0.42, er: 0.3, wet: 0.27, hp: 280 },
    club: { rt: 0.6, pre: 0.008, bright: 0.48, er: 0.75, wet: 0.17 },
    lounge: { rt: 0.85, pre: 0.01, bright: 0.4, er: 0.65, wet: 0.2 },
    theatre: { rt: 1.25, pre: 0.016, bright: 0.44, er: 0.95, size: 1.5, wet: 0.24 },
    crystal: { rt: 2.0, pre: 0.02, bright: 0.66, er: 0.5, size: 1.3, wet: 0.28, hp: 300 },
    opera: { rt: 2.4, pre: 0.028, bright: 0.4, er: 0.6, size: 1.8, wet: 0.27, hp: 260 },
    // where Pip and the window's own sounds are in the two big rooms: close by, so a voice is never far away.
    // The tunes keep their halls (a song names its own room).
    sunroom: { rt: 1.15, pre: 0.012, bright: 0.74, er: 0.55, wet: 0.2, hp: 320 },
    glassNear: { rt: 0.95, pre: 0.005, bright: 0.7, er: 0.6, wet: 0.15, hp: 320 },
    ruinNear: { rt: 1.15, pre: 0.008, bright: 0.42, er: 0.5, wet: 0.15, hp: 280 }
  };

  /* ------------------------------------------------------------------ the engine */
  class Engine {
    constructor(ctx, opts) {
      opts = opts || {};
      this.ctx = ctx; this.offline = !!opts.offline; this.sr = ctx.sampleRate;
      this.rand = PS.rng(opts.seed == null ? 20261110 : opts.seed);
      this.cache = new Map();          // rendered instrument notes
      this.rooms = {};                 // name -> { input }
      this.listeners = {}; this.queue = [];
      const c = ctx;
      // master: a high-pass for any offset, a limiter that only catches peaks, the level
      this.master = c.createGain(); this.master.gain.value = opts.level == null ? 0.9 : opts.level;
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 32; hp.Q.value = 0.7;
      const lim = c.createDynamicsCompressor(); lim.threshold.value = -9; lim.knee.value = 6; lim.ratio.value = 12; lim.attack.value = 0.003; lim.release.value = 0.16;
      this.pre = c.createGain(); this.pre.gain.value = 1;
      // (limit: false leaves the limiter out, so a render shows what would have reached it)
      this.pre.connect(hp); if (opts.limit === false) hp.connect(this.master); else { hp.connect(lim); lim.connect(this.master); }
      this.master.connect(opts.dest || c.destination);
      if (!this.offline && c.createAnalyser) { this.analyser = c.createAnalyser(); this.analyser.fftSize = 1024; this.analyser.smoothingTimeConstant = 0.72; this.master.connect(this.analyser); }
      this.bus = {}; this.vol = Object.assign({}, PS.MIX); this.sends = {};
      ['music', 'sfx', 'voice'].forEach((n) => {
        const g = c.createGain(), duck = c.createGain(); g.connect(duck); duck.connect(this.pre);
        this.bus[n] = g; this.bus[n + 'Duck'] = duck;
      });
      // rooms: one convolver per look in use, fed by sends; its return joins the mix before the limiter
      this.roomBus = c.createGain(); this.roomBus.connect(this.pre);
      this.roomName = null; this.setRoom(opts.room || 'felt');
    }
    now() { return this.ctx.currentTime; }
    /* A level turns down the whole of what it names: the sound itself and what the room gives back of it. (Until
       21 Nov 2026 the sends left before the level and the room's return joined after it, so a slider took the sound
       away and left its echo: Jared, "they just make things sound more far away, not lower volume".) now: set at once,
       for a render. */
    setVolume(name, v, now) {
      v = this.vol[name] = clamp(+v || 0, 0, 1.5);
      const set = (g, x) => { if (now) g.gain.value = x; else g.gain.setTargetAtTime(x, this.now(), 0.03); };
      set(this.bus[name], v); Object.keys(this.sends).forEach((k) => { if (k.split('>')[0] === name) set(this.sends[k], v / PS.MIX[name]); });
    }
    /* where a bus's sounds enter a room: one door for each bus and room, which follows the bus's level. The song was
       balanced against its room with the music at its starting level, so there the door stands fully open. */
    sendIn(busName, roomName) {
      if (!PS.ROOMS[roomName]) roomName = 'felt';
      const key = busName + '>' + roomName;
      if (!this.sends[key]) { const g = this.ctx.createGain(); g.gain.value = this.vol[busName] / PS.MIX[busName]; g.connect(this.roomIn(roomName)); this.sends[key] = g; }
      return this.sends[key];
    }
    /* the room every send goes to. A new look swaps it; tails of the old room finish on their own. */
    setRoom(name) {
      if (!PS.ROOMS[name]) name = 'felt';
      if (name === this.roomName) return;
      this.roomName = name; this.room = this.roomIn(name);
    }
    /* a room by name, built the first time something is sent to it (a song plays in its own) */
    roomIn(name) {
      if (!PS.ROOMS[name]) name = 'felt';
      if (!this.rooms[name]) {
        const c = this.ctx, r = PS.ROOMS[name], input = c.createGain(), conv = c.createConvolver(), wet = c.createGain();
        conv.normalize = false; wet.gain.value = r.wet * 2.4;
        input.connect(conv); conv.connect(wet); wet.connect(this.roomBus);
        const build = () => { conv.buffer = makeIR(c, r); };
        if (this.offline) build(); else setTimeout(build, 0);
        this.rooms[name] = { input };
      }
      return this.rooms[name].input;
    }
    /* pull the music down a little while Pip talks, so the words stay clear */
    /* (Tried and dropped, 20 Nov 2026: a low-pass drawn across the song while Retro Dark's chip voice speaks. The
       song's room return passes neither this duck nor such a filter and carries the song's edge, so it took 4 dB
       off above 2.5 kHz for a quarter of a second at best; a blind listener preferred the plain, deeper step back.) */
    duck(t0, t1, amount) {
      const g = this.bus.musicDuck.gain, a = amount == null ? 0.62 : amount;
      try { g.cancelScheduledValues(t0); } catch (e) { /* fine */ }
      g.setTargetAtTime(a, t0, 0.06); g.setTargetAtTime(1, Math.max(t0 + 0.05, t1), 0.28);
    }
    /* one sound into a bus: its level, its place and how much of it reaches the room. Returns the node to play into. */
    chain(busName, o) {
      o = o || {};
      const c = this.ctx, g = c.createGain(); g.gain.value = o.gain == null ? 1 : o.gain;
      let head = g;
      // the window's own sounds carry nothing low: a click or a prop set down is never a thump, in the room either
      if (busName === 'sfx') { [0.54, 1.3].forEach((q) => { const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 165; hp.Q.value = q; head.connect(hp); head = hp; }); }
      if (o.pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); head.connect(p); head = p; }
      if (!this.bus[busName]) busName = 'sfx';
      head.connect(this.bus[busName]);
      const send = o.send == null ? 0.5 : o.send;
      if (send > 0.001) { const s = c.createGain(); s.gain.value = send; head.connect(s); s.connect(this.sendIn(busName, o.room || this.roomName)); }
      return g;
    }
    /* a rendered note: o { gain, rate, dur (held for; then damped over rel), rel, offset } */
    sample(buf, out, t, o) {
      o = o || {};
      const c = this.ctx, s = c.createBufferSource(); s.buffer = buf;
      if (o.rate && o.rate !== 1) s.playbackRate.value = o.rate;
      const g = c.createGain(), lvl = o.gain == null ? 1 : o.gain;
      g.gain.setValueAtTime(lvl, t);
      let end = t + buf.duration / (o.rate || 1);
      if (o.dur != null && t + o.dur < end - 0.02) {
        const rel = o.rel == null ? 0.12 : o.rel;
        g.gain.setValueAtTime(lvl, t + o.dur); g.gain.setTargetAtTime(0, t + o.dur, rel / 3);
        end = t + o.dur + rel * 2.2;
      }
      s.connect(g); g.connect(out); s.start(t, o.offset || 0); s.stop(end + 0.02);
      return g;
    }
    /* events for the stage, delivered when they are heard */
    on(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); return () => { const a = this.listeners[type] || []; const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); }; }
    emit(type, data, t) {
      if (this.offline) return;
      t = t == null ? 0 : t; this.queue.push([t, type, data]);
      if (!this.pumpId || t < this.pumpNext - 0.004) this.pump();
    }
    /* Due events go out on a timer set for the next one. A frame is never asked for just to look at the clock: on a
       page that is costly to draw (PMConcept7 is), a requestAnimationFrame loop alone keeps it drawing. */
    pump() {
      const run = () => {
        this.pumpId = 0;
        const now = this.ctx.currentTime + 0.012, q = this.queue, keep = []; let next = Infinity;
        for (let i = 0; i < q.length; i++) {
          const e = q[i];
          if (e[0] <= now) { const L = this.listeners[e[1]]; if (L) for (let j = 0; j < L.length; j++) { try { L[j](e[2], e[0]); } catch (err) { PS.errors.push(String((err && err.stack) || err)); } } }
          else { keep.push(e); if (e[0] < next) next = e[0]; }
        }
        this.queue = keep;
        if (keep.length) arm(next);
      };
      const arm = (next) => { clearTimeout(this.pumpId); this.pumpNext = next; this.pumpId = setTimeout(run, Math.max(4, (next - this.ctx.currentTime - 0.006) * 1000)); };
      let next = Infinity; for (let i = 0; i < this.queue.length; i++) if (this.queue[i][0] < next) next = this.queue[i][0];
      if (this.queue.length) arm(next);
    }
  }
  PS.Engine = Engine;
  PS.makeIR = makeIR;
})(window);
