/* O55.sound — synthesised UI sound, one kit per theme family (dark and light share a kit). No audio files.
   Browser concept only: production maps these events onto Notifications & Sounds (rodio). Sound never carries
   information alone; every event pairs with a visual. Mute is always one click away and persists.
   Test hooks: O55.sound.log (trace), O55.sound.tap (AnalyserNode), O55.sound.renderWav(family, event). */
(function () {
  'use strict';
  const O55 = window.O55;
  const S = O55.sound = { log: [], muted: false, ctx: null, master: null, tap: null };
  const KEY = 'pm.o55.sound';
  try { S.muted = localStorage.getItem(KEY) === 'off'; } catch (_) {}

  /* ---- synth primitives (work on any BaseAudioContext, so offline renders use the same code) ---- */
  const note = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz
  let noiseSeed = 7;
  function noiseBuffer(ctx, seconds) {
    const len = Math.max(1, Math.ceil(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    const r = O55.util.rng(noiseSeed++);
    for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
    return buf;
  }
  function envGain(ctx, t0, peak, attack, dur, curve) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + Math.max(0.001, attack));
    if (curve === 'hold') g.gain.setValueAtTime(Math.max(0.0002, peak), t0 + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    return g;
  }
  function tone(ctx, out, t0, o) {
    const osc = ctx.createOscillator();
    if (o.wave) osc.setPeriodicWave(o.wave(ctx)); else osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.glide || o.dur));
    if (o.detune) osc.detune.setValueAtTime(o.detune, t0);
    const g = envGain(ctx, t0, o.gain == null ? 0.18 : o.gain, o.a == null ? 0.004 : o.a, o.dur || 0.2, o.curve);
    let node = osc;
    if (o.lp || o.hp) { const f = ctx.createBiquadFilter(); f.type = o.lp ? 'lowpass' : 'highpass'; f.frequency.setValueAtTime(o.lp || o.hp, t0); f.Q.value = o.q || 0.7; osc.connect(f); node = f; }
    node.connect(g); g.connect(out);
    osc.start(t0); osc.stop(t0 + (o.dur || 0.2) + 0.05);
  }
  function fm(ctx, out, t0, o) {
    const car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain();
    car.frequency.setValueAtTime(o.f, t0); mod.frequency.setValueAtTime(o.f * o.ratio, t0);
    mg.gain.setValueAtTime(o.f * o.index, t0);
    mg.gain.exponentialRampToValueAtTime(Math.max(1, o.f * o.index * 0.02), t0 + o.dur * (o.indexDecay || 0.6));
    mod.connect(mg); mg.connect(car.frequency);
    const g = envGain(ctx, t0, o.gain == null ? 0.12 : o.gain, o.a == null ? 0.002 : o.a, o.dur);
    car.connect(g); g.connect(out);
    if (o.send) g.connect(o.send);
    car.start(t0); mod.start(t0); car.stop(t0 + o.dur + 0.05); mod.stop(t0 + o.dur + 0.05);
  }
  function noise(ctx, out, t0, o) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, o.dur + 0.05);
    const f = ctx.createBiquadFilter(); f.type = o.filter || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.f || 2000, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur);
    const g = envGain(ctx, t0, o.gain == null ? 0.08 : o.gain, o.a == null ? 0.002 : o.a, o.dur);
    src.connect(f); f.connect(g); g.connect(out);
    if (o.send) g.connect(o.send);
    src.start(t0); src.stop(t0 + o.dur + 0.05);
  }
  const pulse25 = (ctx) => { const n = 32, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25); return ctx.createPeriodicWave(re, im); };
  const reverbs = new WeakMap();
  function reverb(ctx, out) {
    if (reverbs.has(ctx)) return reverbs.get(ctx);
    const conv = ctx.createConvolver(), len = Math.ceil(ctx.sampleRate * 2.2), ir = ctx.createBuffer(2, len, ctx.sampleRate), r = O55.util.rng(42);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    conv.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.32; conv.connect(wet); wet.connect(out);
    reverbs.set(ctx, conv); return conv;
  }
  function marimba(ctx, out, t0, midi, gain) {
    const f = note(midi), g = gain == null ? 0.2 : gain;
    tone(ctx, out, t0, { f, dur: 0.55, gain: g, a: 0.002 });
    tone(ctx, out, t0, { f: f * 3.93, dur: 0.1, gain: g * 0.32, a: 0.001 });
    tone(ctx, out, t0, { f: f * 9.8, dur: 0.035, gain: g * 0.1, a: 0.001 });
    noise(ctx, out, t0, { dur: 0.018, f: 3500, q: 0.8, gain: g * 0.25 });
  }
  function kalimba(ctx, out, t0, midi, gain) {
    const f = note(midi), g = gain == null ? 0.12 : gain;
    tone(ctx, out, t0, { f, dur: 0.9, gain: g, a: 0.002 });
    tone(ctx, out, t0, { f: f * 5.4, dur: 0.12, gain: g * 0.18, a: 0.001 });
  }
  function chip(ctx, out, t0, midi, dur, gain, glideTo) {
    tone(ctx, out, t0, { f: note(midi), f2: glideTo ? note(glideTo) : null, glide: dur, dur, gain: gain == null ? 0.07 : gain, wave: pulse25, a: 0.001, lp: 6000 });
  }

  /* ---- kits: event -> (ctx, out, t0, v) where v is the ±2% pitch variation factor ---- */
  const KITS = {
    basic: {
      tap: (c, o, t, v) => { noise(c, o, t, { dur: 0.012, f: 3200 * v, q: 3, gain: 0.07 }); tone(c, o, t, { f: 1320 * v, dur: 0.045, gain: 0.05 }); },
      select: (c, o, t, v) => { tone(c, o, t, { f: 880 * v, dur: 0.11, gain: 0.07 }); tone(c, o, t + 0.045, { f: 1320 * v, dur: 0.13, gain: 0.06 }); },
      next: (c, o, t, v) => { noise(c, o, t, { dur: 0.06, f: 4600, q: 1.6, gain: 0.03 }); tone(c, o, t + 0.01, { f: 659 * v, dur: 0.12, gain: 0.06 }); tone(c, o, t + 0.06, { f: 988 * v, dur: 0.16, gain: 0.055 }); },
      back: (c, o, t, v) => { tone(c, o, t, { f: 988 * v, dur: 0.1, gain: 0.05 }); tone(c, o, t + 0.05, { f: 659 * v, dur: 0.14, gain: 0.05 }); },
      toggleOn: (c, o, t, v) => tone(c, o, t, { f: 1100 * v, dur: 0.06, gain: 0.06 }),
      toggleOff: (c, o, t, v) => tone(c, o, t, { f: 740 * v, dur: 0.06, gain: 0.05 }),
      success: (c, o, t) => { [84, 88, 91].forEach((m, i) => { tone(c, o, t + i * 0.055, { f: note(m), dur: 0.35, gain: 0.05 }); tone(c, o, t + i * 0.055, { f: note(m), type: 'triangle', dur: 0.25, gain: 0.025 }); }); },
      error: (c, o, t) => { tone(c, o, t, { f: 330, type: 'triangle', dur: 0.12, gain: 0.07 }); tone(c, o, t + 0.09, { f: 247, type: 'triangle', dur: 0.2, gain: 0.06 }); },
      commit: (c, o, t) => { [72, 76, 79, 84].forEach((m, i) => { tone(c, o, t + i * 0.07, { f: note(m), dur: 1.1, gain: 0.05, a: 0.02 }); tone(c, o, t + i * 0.07, { f: note(m), detune: 7, dur: 1.1, gain: 0.03, a: 0.02 }); }); },
      open: (c, o, t) => tone(c, o, t, { f: 440, f2: 880, glide: 0.16, dur: 0.2, gain: 0.04 }),
      close: (c, o, t) => tone(c, o, t, { f: 880, f2: 440, glide: 0.14, dur: 0.18, gain: 0.035 }),
      pickup: (c, o, t, v) => tone(c, o, t, { f: 520 * v, f2: 780 * v, glide: 0.08, dur: 0.1, gain: 0.05 }),
      drop: (c, o, t, v) => { tone(c, o, t, { f: 780 * v, f2: 520 * v, glide: 0.07, dur: 0.1, gain: 0.05 }); noise(c, o, t + 0.05, { dur: 0.015, f: 2500, gain: 0.05 }); },
      spot: (c, o, t, v) => noise(c, o, t, { dur: 0.12, f: 3200, f2: 5600, q: 1.8, gain: 0.022 }),
      step: (c, o, t) => { tone(c, o, t, { f: note(88), dur: 0.12, gain: 0.05 }); tone(c, o, t + 0.07, { f: note(95), dur: 0.2, gain: 0.045 }); },
      finish: (c, o, t) => { [72, 79, 84, 88].forEach((m, i) => tone(c, o, t + i * 0.09, { f: note(m), dur: 0.8, gain: 0.05, a: 0.01 })); }
    },
    friendly: {
      tap: (c, o, t, v) => { tone(c, o, t, { f: 1760 * v, dur: 0.03, gain: 0.07 }); noise(c, o, t, { dur: 0.02, f: 2200, q: 2, gain: 0.05 }); },
      select: (c, o, t, v) => marimba(c, o, t, 79 + (v > 1 ? 0 : 0), 0.16),
      next: (c, o, t) => { noise(c, o, t, { dur: 0.16, filter: 'lowpass', f: 2400, f2: 500, gain: 0.03 }); [72, 76, 79].forEach((m, i) => marimba(c, o, t + 0.02 + i * 0.06, m, 0.11)); },
      back: (c, o, t) => { [79, 76].forEach((m, i) => marimba(c, o, t + i * 0.07, m, 0.1)); },
      toggleOn: (c, o, t) => tone(c, o, t, { f: 600, f2: 980, glide: 0.06, dur: 0.09, gain: 0.08 }),
      toggleOff: (c, o, t) => tone(c, o, t, { f: 900, f2: 560, glide: 0.06, dur: 0.09, gain: 0.07 }),
      success: (c, o, t) => { [72, 76, 79, 84].forEach((m, i) => marimba(c, o, t + i * 0.07, m, 0.12)); kalimba(c, o, t + 0.3, 91, 0.07); },
      error: (c, o, t) => { marimba(c, o, t, 62, 0.13); marimba(c, o, t + 0.11, 60, 0.12); },
      commit: (c, o, t) => { [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => marimba(c, o, t + i * 0.055, m, 0.1)); [88, 91, 96].forEach((m, i) => kalimba(c, o, t + 0.45 + i * 0.08, m, 0.06)); },
      open: (c, o, t) => { noise(c, o, t, { dur: 0.2, filter: 'lowpass', f: 600, f2: 2600, gain: 0.03 }); marimba(c, o, t + 0.08, 84, 0.08); },
      close: (c, o, t) => { noise(c, o, t, { dur: 0.18, filter: 'lowpass', f: 2600, f2: 600, gain: 0.03 }); },
      pickup: (c, o, t) => tone(c, o, t, { f: 520, f2: 860, glide: 0.07, dur: 0.1, gain: 0.08 }),
      drop: (c, o, t) => { tone(c, o, t, { f: 860, f2: 420, glide: 0.08, dur: 0.11, gain: 0.08 }); marimba(c, o, t + 0.06, 67, 0.08); },
      spot: (c, o, t) => kalimba(c, o, t, 93, 0.035),
      step: (c, o, t) => { marimba(c, o, t, 84, 0.1); marimba(c, o, t + 0.08, 88, 0.09); },
      finish: (c, o, t) => { [72, 76, 79, 84, 88].forEach((m, i) => marimba(c, o, t + i * 0.08, m, 0.1)); }
    },
    glass: {
      tap: (c, o, t, v) => fm(c, o, t, { f: 2400 * v, ratio: 3.5, index: 1.5, dur: 0.16, gain: 0.035 }),
      select: (c, o, t, v) => fm(c, o, t, { f: note(88) * v, ratio: 1.4, index: 3, dur: 0.9, gain: 0.05, send: reverb(c, o) }),
      next: (c, o, t) => { noise(c, o, t, { dur: 0.28, f: 900, f2: 4200, q: 1.4, gain: 0.03, send: reverb(c, o) }); fm(c, o, t + 0.12, { f: note(93), ratio: 1.4, index: 2.4, dur: 0.8, gain: 0.04, send: reverb(c, o) }); },
      back: (c, o, t) => { noise(c, o, t, { dur: 0.24, f: 4200, f2: 900, q: 1.4, gain: 0.028, send: reverb(c, o) }); fm(c, o, t + 0.1, { f: note(88), ratio: 1.4, index: 2.4, dur: 0.7, gain: 0.035, send: reverb(c, o) }); },
      toggleOn: (c, o, t) => fm(c, o, t, { f: 1760, ratio: 2.76, index: 1.8, dur: 0.35, gain: 0.04, send: reverb(c, o) }),
      toggleOff: (c, o, t) => fm(c, o, t, { f: 1320, ratio: 2.76, index: 1.2, dur: 0.3, gain: 0.03 }),
      success: (c, o, t) => { [88, 95, 100].forEach((m, i) => fm(c, o, t + i * 0.045, { f: note(m), ratio: 1.4, index: 2.6, dur: 1.2, gain: 0.035, send: reverb(c, o) })); },
      error: (c, o, t) => fm(c, o, t, { f: 220, ratio: 1.01, index: 1.2, dur: 0.35, gain: 0.06 }),
      commit: (c, o, t) => { noise(c, o, t, { dur: 0.6, f: 600, f2: 6000, q: 1.2, gain: 0.03, send: reverb(c, o) }); [81, 85, 88, 93].forEach((m, i) => fm(c, o, t + 0.25 + i * 0.07, { f: note(m), ratio: 1.4, index: 3, dur: 1.8, gain: 0.04, send: reverb(c, o) })); },
      open: (c, o, t) => noise(c, o, t, { dur: 0.3, f: 700, f2: 3000, q: 1.2, gain: 0.025, send: reverb(c, o) }),
      close: (c, o, t) => noise(c, o, t, { dur: 0.25, f: 3000, f2: 700, q: 1.2, gain: 0.022, send: reverb(c, o) }),
      pickup: (c, o, t) => fm(c, o, t, { f: 1320, ratio: 2.1, index: 1.5, dur: 0.3, gain: 0.035 }),
      drop: (c, o, t) => fm(c, o, t, { f: 990, ratio: 1.4, index: 2.2, dur: 0.7, gain: 0.04, send: reverb(c, o) }),
      spot: (c, o, t) => noise(c, o, t, { dur: 0.22, f: 2500, f2: 5000, q: 2, gain: 0.015, send: reverb(c, o) }),
      step: (c, o, t) => { fm(c, o, t, { f: note(95), ratio: 1.4, index: 2, dur: 0.6, gain: 0.035, send: reverb(c, o) }); },
      finish: (c, o, t) => { [81, 88, 93, 100].forEach((m, i) => fm(c, o, t + i * 0.08, { f: note(m), ratio: 1.4, index: 2.6, dur: 1.4, gain: 0.035, send: reverb(c, o) })); }
    },
    retro: {
      tap: (c, o, t) => chip(c, o, t, 81, 0.03, 0.05),
      select: (c, o, t) => { chip(c, o, t, 88, 0.045, 0.05); chip(c, o, t + 0.045, 93, 0.07, 0.05); },
      next: (c, o, t) => { [72, 76, 79].forEach((m, i) => chip(c, o, t + i * 0.04, m, 0.045, 0.05)); },
      back: (c, o, t) => { [79, 76, 72].forEach((m, i) => chip(c, o, t + i * 0.04, m, 0.045, 0.045)); },
      toggleOn: (c, o, t) => tone(c, o, t, { f: 440, type: 'triangle', dur: 0.05, gain: 0.08 }),
      toggleOff: (c, o, t) => tone(c, o, t, { f: 330, type: 'triangle', dur: 0.05, gain: 0.07 }),
      success: (c, o, t) => { chip(c, o, t, 83, 0.06, 0.05); chip(c, o, t + 0.06, 88, 0.26, 0.05); },
      error: (c, o, t) => chip(c, o, t, 57, 0.18, 0.06, 45),
      commit: (c, o, t) => { [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => chip(c, o, t + i * 0.05, m, 0.05, 0.045)); tone(c, o, t, { f: note(48), type: 'triangle', dur: 0.4, gain: 0.09 }); chip(c, o, t + 0.38, 88, 0.3, 0.04); },
      open: (c, o, t) => chip(c, o, t, 64, 0.12, 0.04, 76),
      close: (c, o, t) => chip(c, o, t, 76, 0.1, 0.035, 64),
      pickup: (c, o, t) => chip(c, o, t, 72, 0.05, 0.05, 79),
      drop: (c, o, t) => { chip(c, o, t, 79, 0.05, 0.05, 72); tone(c, o, t + 0.05, { f: note(48), type: 'triangle', dur: 0.08, gain: 0.08 }); },
      spot: (c, o, t) => chip(c, o, t, 96, 0.025, 0.02),
      step: (c, o, t) => { chip(c, o, t, 84, 0.05, 0.045); chip(c, o, t + 0.05, 91, 0.1, 0.045); },
      finish: (c, o, t) => { [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => chip(c, o, t + i * 0.045, m, 0.05, 0.04)); }
    }
  };
  S.KITS = KITS;
  S.EVENTS = Object.keys(KITS.basic);

  /* ---- live context: created on the first user gesture (browsers block autoplay) ---- */
  function ensureContext() {
    if (S.ctx) { if (S.ctx.state === 'suspended') S.ctx.resume().catch(() => {}); return S.ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      const ctx = new AC();
      const master = ctx.createGain(); master.gain.value = 0.9;
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.003; comp.release.value = 0.2;
      const tap = ctx.createAnalyser(); tap.fftSize = 2048;
      master.connect(comp); comp.connect(ctx.destination); comp.connect(tap);
      S.ctx = ctx; S.master = master; S.tap = tap;
      return ctx;
    } catch (_) { return null; }
  }
  S.unlock = function unlock() { const c = ensureContext(); return !!c; };
  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, () => { if (document.documentElement.hasAttribute('data-o55-open') || document.documentElement.hasAttribute('data-o55-tour')) ensureContext(); }, true));

  S.play = function play(event, opts) {
    const family = (opts && opts.family) || O55.theme().family;
    const entry = { t: Math.round(performance.now()), event, family, muted: S.muted };
    S.log.push(entry); if (S.log.length > 400) S.log.shift();
    if (S.muted || (O55.motion && O55.motion.lowResource && event === 'spot')) return false;
    const kit = KITS[family] || KITS.basic, fn = kit[event];
    if (!fn) return false;
    const ctx = ensureContext(); if (!ctx || ctx.state === 'closed') return false;
    const t0 = ctx.currentTime + 0.004, v = 1 + (Math.random() - 0.5) * 0.04;
    try { fn(ctx, S.master, t0, v); entry.played = true; } catch (err) { entry.error = String(err && err.message || err); }
    return true;
  };

  S.setMuted = function setMuted(muted, source) {
    S.muted = !!muted;
    try { localStorage.setItem(KEY, S.muted ? 'off' : 'on'); } catch (_) {}
    try { window.PM12_KIMI && window.PM12_KIMI.setSettingFromHost && window.PM12_KIMI.setSettingFromHost('general.interaction.sound-effects', !S.muted, false, false); } catch (_) {}
    document.documentElement.toggleAttribute('data-o55-muted', S.muted);
    window.dispatchEvent(new CustomEvent('o55:sound', { detail: { muted: S.muted, source: source || 'ui' } }));
    if (!S.muted) S.play('toggleOn');
  };
  S.toggle = function toggle(source) { S.setMuted(!S.muted, source); };
  S.buttonHtml = function buttonHtml(cls) {
    const on = !S.muted;
    const label = on ? O55.t('chrome.soundOn') : O55.t('chrome.soundOff');
    const wave = on ? '<path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.4 5.6a9 9 0 0 1 0 12.8"/>' : '<path d="M16 9l5 6"/><path d="M21 9l-5 6"/>';
    return `<button type="button" class="o55-sound ${cls || ''}" data-o55-do="sound" data-pm-hover-exempt="true" aria-pressed="${on}" aria-label="${O55.util.esc(label)}" title="${O55.util.esc(label)}">`
      + `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>${wave}</svg></button>`;
  };

  /* ---- offline render (sound board + spectrograms; independent of --mute-audio) ---- */
  S.renderWav = async function renderWav(family, event, seconds) {
    const kit = KITS[family] || KITS.basic, fn = kit[event]; if (!fn) return null;
    const rate = 44100, dur = seconds || 2.4;
    const ctx = new OfflineAudioContext(1, Math.ceil(rate * dur), rate);
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    fn(ctx, master, 0.01, 1);
    const buf = await ctx.startRendering(), data = buf.getChannelData(0);
    let peak = 0; for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
    const bytes = new DataView(new ArrayBuffer(44 + data.length * 2));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); bytes.setUint32(4, 36 + data.length * 2, true); w(8, 'WAVE'); w(12, 'fmt '); bytes.setUint32(16, 16, true);
    bytes.setUint16(20, 1, true); bytes.setUint16(22, 1, true); bytes.setUint32(24, rate, true); bytes.setUint32(28, rate * 2, true);
    bytes.setUint16(32, 2, true); bytes.setUint16(34, 16, true); w(36, 'data'); bytes.setUint32(40, data.length * 2, true);
    for (let i = 0; i < data.length; i++) bytes.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 0x7fff, true);
    let bin = ''; const u8 = new Uint8Array(bytes.buffer); for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return { base64: btoa(bin), peak: +peak.toFixed(4), seconds: dur };
  };
})();
