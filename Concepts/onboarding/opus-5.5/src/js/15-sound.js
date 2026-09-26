/* O55.sound — synthesised UI sound, one kit per theme family (dark and light share a kit). No audio files.
   Browser concept only: production maps these events onto Notifications & Sounds (rodio). Sound never carries
   information alone; every event pairs with a visual. Mute is always one click away; with a current Project it
   persists through Settings (general.interaction.sound-effects, off by default), and without one it is a
   session-only preview that never persists.
   Test hooks: O55.sound.log (trace), O55.sound.tap (AnalyserNode), O55.sound.renderWav(family, event),
   O55.sound.binding() / O55.sound.refresh(source) (Project binding). */
(function () {
  'use strict';
  const O55 = window.O55;
  /* the control starts at the canonical default: the Settings row is off unless a Project turns it on */
  const S = O55.sound = { log: [], muted: true, ctx: null, master: null, tap: null };

  /* ---- Project-owned binding: the control mirrors the current Project's Settings row
     general.interaction.sound-effects (owned by Settings; the inventory's canonical row, default off).
     With a verified current Project the control reads that Project's value through the Settings owner's
     project snapshot and routes writes through the owner's dispatch result; a rejected or otherwise
     unavailable write leaves the control at its last owner-verified state (fail closed), never a local guess.
     Without a Project (onboarding preview) the control is session-only: it writes nothing, stores nothing, and
     is discarded when a Project binds — the Project's own value always wins, at commit and at every rebind. ---- */
  const SETTING_ID = 'general.interaction.sound-effects';
  let bound = null; /* { project_id, enabled } from the owner snapshot or conservative off fallback, or null while unbound */
  const tome = () => (window.PM7_SETTINGS_TOME && typeof window.PM7_SETTINGS_TOME.project === 'function') ? window.PM7_SETTINGS_TOME : null;
  function currentProject() {
    const t = tome();
    if (!t) return null;
    try { const p = t.project(); return p && p.id ? p : null; } catch (_) { return null; }
  }
  function projectEnabled(p) {
    const t = tome();
    if (!t || typeof t.projectSnapshot !== 'function') return false;
    try {
      const snap = t.projectSnapshot(p.id);
      if (!snap || typeof snap.then === 'function') return false; /* async/unavailable read: the default (off) */
      return !!(snap.settings && snap.settings[SETTING_ID] === true);
    } catch (_) { return false; }
  }
  /* the wave paths of buttonHtml's icon, so an in-place rebind renders exactly what buttonHtml would */
  const WAVE = { on: ['M15.5 8.5a5 5 0 0 1 0 7', 'M18.4 5.6a9 9 0 0 1 0 12.8'], off: ['M16 9l5 6', 'M21 9l-5 6'] };
  function syncButtons() {
    document.querySelectorAll('button.o55-sound').forEach((b) => {
      const on = !S.muted, label = on ? O55.t('chrome.soundOn') : O55.t('chrome.soundOff');
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', label); b.setAttribute('title', label);
      const paths = b.querySelectorAll('svg path');
      for (let i = 0; i < 2 && i + 1 < paths.length; i++) paths[i + 1].setAttribute('d', WAVE[on ? 'on' : 'off'][i]);
    });
  }
  function announce(detail) {
    document.documentElement.toggleAttribute('data-o55-muted', S.muted);
    syncButtons();
    window.dispatchEvent(new CustomEvent('o55:sound', detail));
  }
  /* re-read the current Project's value (or the unbound default) and reflect it; plays nothing, writes nothing */
  S.refresh = function refresh(source) {
    const p = currentProject();
    if (!p) {
      const had = !!bound; bound = null;
      /* a binding fell away (Project closed): back to the canonical default — never the previous Project's value.
         Staying unbound keeps a preview the person chose earlier in this session. */
      if (had && S.muted !== true) { S.muted = true; announce({ detail: { muted: true, source: source || 'bind', binding: null } }); }
      return S.binding();
    }
    const enabled = projectEnabled(p);
    const changed = !bound || bound.project_id !== p.id || bound.enabled !== enabled;
    bound = { project_id: p.id, enabled };
    if (changed && S.muted !== !enabled) { S.muted = !enabled; announce({ detail: { muted: S.muted, source: source || 'bind', binding: S.binding() } }); }
    return S.binding();
  };
  S.binding = function binding() { return bound ? Object.assign({}, bound) : null; };

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
  /* ---- music: the journey has a key. Each chapter plays on its own chord (Welcome I, Computer IV, Project V, AI vi,
     Ready I an octave up), so choices vary but always fit; moving forward climbs with progress and Back descends;
     choices rotate through the chord; each helper has its own cheer voice; celebrations crackle like the confetti;
     typing ticks quietly in the family's material. k = { m(i, octave) chord note, step, voice, rot }. ---- */
  const CHORDS = { welcome: [0, 4, 7], computer: [5, 9, 12], project: [7, 11, 14], ai: [9, 12, 16], ready: [12, 16, 19], tour: [0, 4, 7] };
  const music = { chapter: 'welcome', step: 0, x: 0.5, rot: {} };
  S.setContext = (o) => { Object.assign(music, o || {}); };
  function mk(root, event, o) {
    const ch = CHORDS[music.chapter] || CHORDS.welcome, rot = (music.rot[event] = (music.rot[event] || 0) + 1);
    return { step: music.step, voice: (o && o.voice) || 0, rot, m: (i, oct) => root + ch[((i % 3) + 3) % 3] + 12 * (Math.floor(i / 3) + (oct || 0)) };
  }
  const sparkle = (c, o, t, dur, n, fn) => { for (let i = 0; i < n; i++) { const at = t + Math.pow(i / n, 0.8) * dur + Math.random() * 0.03; fn(at, i); } };
  const MUSIC = {
    basic: {
      tap: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, f: 3200 * v, q: 3, gain: 0.07 }); tone(c, o, t, { f: note(k.m(k.rot % 3, 2)), dur: 0.045, gain: 0.045 }); },
      select: (c, o, t, v, k) => { const r = k.rot % 3; tone(c, o, t, { f: note(k.m(r, 1)) * v, dur: 0.11, gain: 0.07 }); tone(c, o, t + 0.045, { f: note(k.m(r + 1, 1)) * v, dur: 0.14, gain: 0.06 }); },
      next: (c, o, t, v, k) => { const b = k.step % 4; noise(c, o, t, { dur: 0.06, f: 4600, q: 1.6, gain: 0.03 }); [0, 1, 2].forEach((i) => tone(c, o, t + 0.01 + i * 0.05, { f: note(k.m(b + i, 1)) * v, dur: 0.12 + i * 0.03, gain: 0.055 })); },
      back: (c, o, t, v, k) => { const b = k.step % 4; [2, 1].forEach((i, j) => tone(c, o, t + j * 0.05, { f: note(k.m(b + i, 1)) * v, dur: 0.13, gain: 0.05 })); },
      step: (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(2, 1)), dur: 0.12, gain: 0.05 }); tone(c, o, t + 0.07, { f: note(k.m(4, 1)), dur: 0.22, gain: 0.045 }); },
      cheer: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.01, f: 5200, q: 4, gain: 0.05 }); tone(c, o, t + 0.01, { f: note(k.m(3 + k.voice, 1)), dur: 0.16, gain: 0.05 }); tone(c, o, t + 0.07, { f: note(k.m(5 + k.voice, 1)), dur: 0.22, gain: 0.04, type: 'triangle' }); },
      celebrate: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.5, f: 2400, f2: 7000, q: 0.9, gain: 0.02 }); [0, 1, 2, 3].forEach((i) => tone(c, o, t + i * 0.06, { f: note(k.m(i, 1)), dur: 0.5, gain: 0.045, type: i % 2 ? 'triangle' : 'sine' }));
        sparkle(c, o, t + 0.2, 1.1, 14, (at, i) => tone(c, panned(c, o), at, { f: note(k.m(3 + (i * 2) % 7, 2)), dur: 0.09, gain: 0.05 })); },
      type: (c, o, t) => noise(c, o, t, { dur: 0.018 + Math.random() * 0.02, f: 3600 + Math.random() * 1800, q: 2.4, gain: 0.02 })
    },
    friendly: {
      tap: (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(k.rot % 3, 2)) * v, dur: 0.03, gain: 0.06 }); noise(c, o, t, { dur: 0.02, f: 2200, q: 2, gain: 0.05 }); },
      select: (c, o, t, v, k) => { const r = k.rot % 3; marimba(c, o, t, k.m(r, 1), 0.15); if (k.rot % 2) kalimba(c, o, t + 0.06, k.m(r + 2, 2), 0.05); },
      next: (c, o, t, v, k) => { const b = k.step % 4; noise(c, o, t, { dur: 0.16, filter: 'lowpass', f: 2400, f2: 500, gain: 0.03 }); [0, 1, 2].forEach((i) => marimba(c, o, t + 0.02 + i * 0.06, k.m(b + i, 1), 0.11)); },
      back: (c, o, t, v, k) => { const b = k.step % 4; [2, 0].forEach((i, j) => marimba(c, o, t + j * 0.07, k.m(b + i, 1), 0.1)); },
      step: (c, o, t, v, k) => { marimba(c, o, t, k.m(2, 1), 0.1); marimba(c, o, t + 0.08, k.m(4, 1), 0.09); },
      cheer: (c, o, t, v, k) => { const b = k.voice * 2; kalimba(c, o, t, k.m(b, 2), 0.07); kalimba(c, o, t + 0.07, k.m(b + 2, 2), 0.08); noise(c, o, t, { dur: 0.03, filter: 'lowpass', f: 900, gain: 0.04 }); },
      celebrate: (c, o, t, v, k) => { [0, 1, 2, 3, 4, 5].forEach((i) => marimba(c, o, t + i * 0.05, k.m(i, 1), 0.09)); sparkle(c, o, t + 0.3, 1.2, 12, (at, i) => { const p = panned(c, o); if (i % 3) kalimba(c, p, at, k.m(3 + (i % 4), 2), 0.04); else noise(c, p, at, { dur: 0.05, filter: 'highpass', f: 3000, gain: 0.03 }); }); },
      type: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.02, f: 1500 + Math.random() * 900, q: 1.6, gain: 0.03 }); if (Math.random() < 0.3) marimba(c, o, t, k.m(Math.floor(Math.random() * 3), 2), 0.025); }
    },
    glass: {
      tap: (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.rot % 3, 2)) * v, ratio: 3.5, index: 1.5, dur: 0.16, gain: 0.035 }),
      select: (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.rot % 3, 1)) * v, ratio: 1.38 + Math.random() * 0.05, index: 3, dur: 0.9, gain: 0.05, send: reverb(c, o) }),
      next: (c, o, t, v, k) => { const b = k.step % 4; noise(c, o, t, { dur: 0.28, f: 900, f2: 4200, q: 1.4, gain: 0.03, send: reverb(c, o) }); [0, 1].forEach((i) => fm(c, o, t + 0.1 + i * 0.07, { f: note(k.m(b + i + 1, 1)), ratio: 1.4, index: 2.4, dur: 0.8, gain: 0.035, send: reverb(c, o) })); },
      back: (c, o, t, v, k) => { const b = k.step % 4; noise(c, o, t, { dur: 0.24, f: 4200, f2: 900, q: 1.4, gain: 0.028, send: reverb(c, o) }); fm(c, o, t + 0.1, { f: note(k.m(b, 1)), ratio: 1.4, index: 2.4, dur: 0.7, gain: 0.035, send: reverb(c, o) }); },
      step: (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(4, 1)), ratio: 1.4, index: 2, dur: 0.6, gain: 0.035, send: reverb(c, o) }),
      cheer: (c, o, t, v, k) => { const f = note(k.m(3 + k.voice, 1)); fm(c, o, t, { f, ratio: 1.4, index: 2.2, dur: 0.7, gain: 0.03, send: reverb(c, o) }); fm(c, o, t + 0.05, { f: f * 1.5, ratio: 2.76, index: 1.4, dur: 0.6, gain: 0.02, send: reverb(c, o) }); },
      celebrate: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.8, f: 800, f2: 7000, q: 1.1, gain: 0.025, send: reverb(c, o) }); sparkle(c, o, t + 0.1, 1.5, 12, (at, i) => fm(c, panned(c, o), at, { f: note(k.m(3 + (i * 2) % 8, 1)), ratio: 1.4, index: 2.6, dur: 1.1, gain: 0.025, send: reverb(c, o) })); },
      type: (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(Math.floor(Math.random() * 3), 3)), ratio: 3.1, index: 0.8, dur: 0.05, gain: 0.012 })
    },
    retro: {
      tap: (c, o, t, v, k) => chip(c, o, t, k.m(k.rot % 3, 1), 0.03, 0.05),
      select: (c, o, t, v, k) => { const r = k.rot % 3; chip(c, o, t, k.m(r, 1), 0.045, 0.05); chip(c, o, t + 0.045, k.m(r + 2, 1), 0.07, 0.05); },
      next: (c, o, t, v, k) => { const b = k.step % 4; [0, 1, 2].forEach((i) => chip(c, o, t + i * 0.04, k.m(b + i, 0), 0.045, 0.05)); },
      back: (c, o, t, v, k) => { const b = k.step % 4; [2, 1, 0].forEach((i, j) => chip(c, o, t + j * 0.04, k.m(b + i, 0), 0.045, 0.045)); },
      step: (c, o, t, v, k) => { chip(c, o, t, k.m(2, 1), 0.05, 0.045); chip(c, o, t + 0.05, k.m(4, 1), 0.1, 0.045); },
      cheer: (c, o, t, v, k) => { chip(c, o, t, k.m(3 + k.voice, 1), 0.05, 0.045); chip(c, o, t + 0.05, k.m(5 + k.voice, 1), 0.11, 0.045); },
      celebrate: (c, o, t, v, k) => { [0, 1, 2, 3, 4, 5, 6].forEach((i) => chip(c, o, t + i * 0.045, k.m(i, 0), 0.05, 0.045)); tone(c, o, t, { f: note(k.m(0, -2)), type: 'triangle', dur: 0.5, gain: 0.09 });
        sparkle(c, o, t + 0.35, 1, 10, (at, i) => { const p = panned(c, o); if (i % 2) chip(c, p, at, k.m(4 + (i % 3), 1), 0.03, 0.03); else noise(c, p, at, { dur: 0.04, filter: 'highpass', f: 5000, gain: 0.03 }); }); },
      type: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, filter: 'highpass', f: 4000, gain: 0.03 }); chip(c, o, t, k.m(Math.floor(Math.random() * 3), 2), 0.018, 0.02); }
    }
  };
  /* a note of a celebration placed somewhere across the stereo field */
  function panned(c, o) { if (!c.createStereoPanner) return o; const p = c.createStereoPanner(); p.pan.value = (Math.random() - 0.5) * 1.4; p.connect(o); return p; }
  const ROOT = { basic: 72, friendly: 67, glass: 72, retro: 72 };
  Object.keys(MUSIC).forEach((f) => Object.assign(KITS[f], MUSIC[f]));
  S.KITS = KITS;
  S.EVENTS = Object.keys(KITS.basic);
  /* where the last click was, for left-right placement of what it plays */
  document.addEventListener('pointerdown', (e) => { music.x = Math.max(0, Math.min(1, e.clientX / Math.max(1, innerWidth))); }, true);

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
    S.refresh('play'); /* Project/Settings changes must gate this sound synchronously. */
    const family = (opts && opts.family) || O55.theme().family;
    const entry = { t: Math.round(performance.now()), event, family, muted: S.muted };
    S.log.push(entry); if (S.log.length > 400) S.log.shift();
    if (S.muted || (O55.motion && O55.motion.lowResource && event === 'spot')) return false;
    const kit = KITS[family] || KITS.basic, fn = kit[event];
    if (!fn) return false;
    const ctx = ensureContext(); if (!ctx || ctx.state === 'closed') return false;
    const t0 = ctx.currentTime + 0.004, v = 1 + (Math.random() - 0.5) * 0.04;
    /* each sound: a little louder or softer than the last, and placed toward where the click was */
    let out = ctx.createGain(); out.gain.value = 0.86 + Math.random() * 0.26;
    let tail = out;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = (music.x - 0.5) * 0.9; out.connect(p); tail = p; }
    tail.connect(S.master);
    try { fn(ctx, out, t0, v, mk(ROOT[family] || 72, event, opts)); entry.played = true; } catch (err) { entry.error = String(err && err.message || err); }
    return true;
  };

  S.setMuted = function setMuted(muted, source) {
    S.refresh('write');
    const want = !muted; /* the Settings value the control is asking for */
    const src = source || 'ui';
    const p = currentProject();
    if (p) {
      const kimi = window.PM12_KIMI, write = kimi && typeof kimi.setSettingFromHost === 'function';
      if (!write) {
        /* the Project binding exists but the Settings dispatch is not reachable: refuse and stay at the
           owner-verified value — a bound Project's row is never changed by a local guess */
        S.play('error');
        announce({ detail: { muted: S.muted, source: src, binding: S.binding(), outcome: 'unavailable' } });
        return false;
      }
      const at = p.id;
      let ok = false;
      try { ok = kimi.setSettingFromHost(SETTING_ID, want, false, false) === true; } catch (_) { ok = false; }
      /* the Project changed reentrantly during the synchronous owner write: the result belongs to the previous Project —
         discard it and rebind to the current one */
      const now = currentProject();
      if (!now || now.id !== at) { S.refresh('project-switched'); return false; }
      if (!ok) {
        /* fail closed: an owner rejection, or an async receipt the owner contract refuses, changes nothing */
        S.play('error');
        announce({ detail: { muted: S.muted, source: src, binding: S.binding(), outcome: 'rejected' } });
        return false;
      }
      bound = { project_id: at, enabled: want };
    }
    /* unbound (or freshly accepted): apply. Unbound is a session-only preview — memory for this page only. */
    S.muted = !want;
    announce({ detail: { muted: S.muted, source: src, binding: S.binding(), outcome: p ? 'accepted' : 'preview' } });
    if (!S.muted) S.play('toggleOn');
    return true;
  };
  S.toggle = function toggle(source) { S.refresh('toggle'); return S.setMuted(!S.muted, source); };
  S.buttonHtml = function buttonHtml(cls) {
    S.refresh('render');
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
    fn(ctx, master, 0.01, 1, mk(ROOT[family] || 72, event));
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

  /* ---- boot binding: read once at load, again when the shell finishes mounting, then follow Project switches
     on the same surfaces the Settings owner watches for its own reload (label text, menu selection) ---- */
  let watchTimer = 0;
  /* Settings row handlers settle in the same event turn; refresh after their commit.
     Playback/render/toggle also re-read, covering programmatic owner changes. */
  ['click', 'change'].forEach((type) => document.addEventListener(type, (event) => {
    if (event.target && event.target.closest && event.target.closest('#pm-settings-root')) {
      Promise.resolve().then(() => S.refresh('settings'));
    }
  }));
  function installBindingWatch() {
    const queue = () => { if (watchTimer) return; watchTimer = setTimeout(() => { watchTimer = 0; try { S.refresh('project'); } catch (_) {} }, 40); };
    const label = document.getElementById('projectMenuLabel'), menu = document.getElementById('projectMenu');
    if (label) new MutationObserver(queue).observe(label, { childList: true, characterData: true, subtree: true });
    if (menu) new MutationObserver(queue).observe(menu, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }
  (function bootBinding() {
    try { S.refresh('load'); } catch (_) {}
    const late = () => { try { S.refresh('dom'); } catch (_) {} try { installBindingWatch(); } catch (_) {} };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', late, { once: true });
    else late();
  })();
})();
