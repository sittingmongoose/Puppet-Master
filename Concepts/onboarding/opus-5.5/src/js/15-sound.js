/* O55.sound — synthesised UI sound for the onboarding window and the Guided Tour. No audio files and no samples: every
   sound is built here from oscillators, filters and noise (original synthesis; nothing is taken from a game).
   Browser concept only: production maps these events onto Notifications & Sounds (rodio). Sound never carries
   information alone; every event pairs with a visual, and mute is always one click away.

   Kits. One per theme family (dark and light share a kit): Basic precise sines and clicks, Friendly marimba and kalimba,
   Glass FM bells in a small room, Retro chip pulses. And 'nier' while NieR Mode paints (O55.theme().art === 'nier')
   with its Menu sounds part installed (PM_NIER.has('sounds')): soft digital menu ticks, a clean two-tone confirm, a
   muted cancel, a low filtered buzz for refusals, Pod chirps (tiny formant bleeps), data chatter, a reboot hum, calm
   quest stings and a quiet "aah" choir with bells, all in a key of its own (A, Aeolian and Dorian colours). With the
   part off NieR Mode plays the painted Basic kit. opts.family (or opts.kit) picks a kit outright (a look tile plays
   the family it offers).

   Project binding (F3-520, SSYS-039). With a verified current Project the control mirrors that Project's
   general.interaction.sound-effects (factory default on, DL-107): writes go through the Settings owner, and a refused
   or unavailable write changes nothing (fail closed, never a local guess). Without a Project (onboarding before the
   commit) the control starts at that factory default and is a session-only preview: it writes and stores nothing, and
   the Project's own value wins at the commit and at every rebind. No sound plays before the person's first gesture.

   Variation without noise. Each frequent event (tap, select, next, back, move, toggles, step, callout, checkpoint,
   type, pod, decode, hover) is a pool of related variants drawn by a shuffle that never repeats the last one. Pitches
   follow the journey: each chapter has its chord (Welcome I, Computer IV, Project V, AI vi, Ready I up an octave; the
   tour IV, ii and V per chapter, resolving to I at the finish; NieR its own modal chords), forward steps climb the
   chord with progress inside a chapter, a sound sits left or right toward the click, and opts.intensity (0..1, 0.6
   when absent) scales level and brightness. Several events in the same moment (one task, or within MERGE_MS) play the
   most important one (PRIO), except pairs designed to layer (layers()); very frequent events are rate limited (RATE).
   Levels are matched across kits by TRIM, measured by tools/sound_render.mjs and written by tools/sound_catalog.py.

   A score and a stage (the hero pass). Each look has a four-note motif (MOTIF) that its chapter stings build one note
   per chapter (opts.depth, 0..4: Computer 1, Project 2, AI 3, Ready 4 with the look's colour; the tour again from 1)
   and that resolves at Ready; a chapter is stung once per run (Back then forward plays a plain 'next'). The stage has
   foley in each look's material: 'string' (strings going taut, the name sign's letters, Show Me's string), 'land' (a
   puppet or prop set down) and 'bow'; each takes its helper's chord tone from opts.voice (0 root, 1 third, 2 fifth)
   and its place from opts.pan, sits under anything as texture, and is skipped under Reduced Motion (it describes
   motion that is not shown). 'wake' is the NieR world opening (the choir that left nierOn), 'save' the Project saved.
   Before a resolution (Ready's sting, a finish) rest(150) leaves 150 ms of silence.

   API
     play(event, opts) -> bool     queued to sound (false: muted, silent, rate limited, before a gesture, no audio).
                                   opts { family?, kit?, voice? 0..2, intensity?, pan? -1..1, chapter?, step?, depth? 0..4,
                                   priority?, variant? }. An event a kit lacks follows FALLBACK; 'hover' is silent outside
                                   NieR. A 'found' or 'success' asked for less than 500 ms after a 'quest' or 'chapter'
                                   plays 500 ms after it; a 'celebrate' within 1.2 s of a 'commit' or 'finish' (1.6 s
                                   of a depth-4 chapter sting) plays as their layer, sparkles only.
     setContext({ chapter?, step?, progress?, run?, sting? })   the music's place in the journey (onboarding go(), tour
                                   goStep()). run (any id) starts a run with no chapter stung; sting: false says the
                                   caller plays this chapter's sting itself (no automatic conversion). A move into the
                                   other journey (setup or tour) starts a run too.
     context() -> { chapter, step, n, progress, depth, run }   depth: the motif notes the current chapter's sting plays.
     rest(ms = 150) -> bool        for ms, events under PRIO 75 are dropped and every sound playing fades out in 20 ms.
     synth(fn, opts) -> bool       fn(ctx, out, t0) through this context, master, mute and gesture rule (the NieR menu
                                   blips, kit.d/19-nier-parts.js); opts { force?, name?, priority? }.
     suppress(ms) / suppressed()   holds the NieR document-wide menu blips (a tour-driven synthetic click).
     CATALOG                       [{ id, name, title, about, style, kit, event, variant, variants, duration, featured,
                                   source }]: every take a real moment plays (title: the name without its look; about:
                                   the moment, one plain sentence, copy soundLibrary.moments.<event>). Takes no moment
                                   reaches are not listed (RETIRED).
     renderBuffer(kit, event, variant, opts) -> Promise<AudioBuffer>   offline, independent of mute.
     renderWav(kit, event, seconds?, variant?) -> Promise<{ base64, peak, peakDb, rmsDb, seconds }>
     preview(id, { volume? }) -> Promise<{ ok, id, duration }>   one CATALOG entry now (an explicit gesture: not muted).
     stopPreview(), bars(id, n) -> Promise<number[]>, entry(id)
     KITS, EVENTS, KIT_NAMES (= FAMILIES), variants(kit, event), resolve(kit, event), kitFor(event, opts)
     pip                           Pip's voice, kits and music (PM7 build, lane found): say(text, o), hush(), vocal(name, o),
                                   registerKit / play, registerMusic / music / stopMusic, hold(name, on), chatMute; see
                                   "Pip's voice" below. say = pip.say.
     Test hooks: log (trace, 400), tap (AnalyserNode), ctx, master, binding(), refresh(source), unlock(). */
(function () {
  'use strict';
  const O55 = window.O55;
  const S = O55.sound = { log: [], muted: true, ctx: null, master: null, tap: null };

  /* ---- Project-owned binding: the control mirrors the current Project's Settings row
     general.interaction.sound-effects (owned by Settings; the inventory's canonical row, default on since DL-107).
     With a verified current Project the control reads that Project's value through the Settings owner's
     project snapshot and routes writes through the owner's dispatch result; a rejected or otherwise
     unavailable write leaves the control at its last owner-verified state (fail closed), never a local guess.
     Without a Project (onboarding preview) the control is session-only: it starts at the factory default, writes
     nothing, stores nothing, and is discarded when a Project binds — the Project's own value always wins, at commit
     and at every rebind. ---- */
  const SETTING_ID = 'general.interaction.sound-effects';
  /* the inventory's factory default, read from the embedded reference (Plans/settings_inventory.json: true) */
  function factoryDefault() {
    try {
      const rows = window.PM12_REFERENCE && window.PM12_REFERENCE.byCat && window.PM12_REFERENCE.byCat.general && window.PM12_REFERENCE.byCat.general.settings;
      const row = Array.isArray(rows) ? rows.find((r) => r && r.id === SETTING_ID) : null;
      if (row && typeof row.default === 'boolean') return row.default;
    } catch (_) {}
    return true;
  }
  S.muted = !factoryDefault();
  let bound = null; /* { project_id, enabled } from the owner snapshot or conservative off fallback, or null while unbound */
  const tome = () => (window.PM7_SETTINGS_TOME && typeof window.PM7_SETTINGS_TOME.project === 'function') ? window.PM7_SETTINGS_TOME : null;
  function currentProject() {
    const t = tome();
    if (!t) return null;
    try { const p = t.project(); return p && p.id ? p : null; } catch (_) { return null; }
  }
  const PENDING = {};
  function projectEnabled(p) {
    const t = tome();
    if (!t || typeof t.projectSnapshot !== 'function') return false;
    try {
      const snap = t.projectSnapshot(p.id);
      if (!snap || typeof snap.then === 'function') return PENDING; /* unreadable (not loaded, or not saved yet) */
      const set = snap.settings || {};
      /* a readable snapshot that never stored the row has the row's factory default */
      return Object.prototype.hasOwnProperty.call(set, SETTING_ID) ? set[SETTING_ID] === true : factoryDefault();
    } catch (_) { return false; }
  }
  /* the wave paths of buttonHtml's icon, so an in-place rebind renders exactly what buttonHtml would */
  const WAVE = { on: ['M15.5 8.5a5 5 0 0 1 0 7', 'M18.4 5.6a9 9 0 0 1 0 12.8'], off: ['M16 9l5 6', 'M21 9l-5 6'] };
  /* the neon set's speaker and speaker-off (pm7-glyphs D44): two drawings, so a rebind swaps the whole svg; '' without
     PMG (the old icon and its wave swap then stay exactly as they were). U.nx returns the browser's serialised form. */
  const neonSvg = (on) => O55.util.nx(on ? 'speaker' : 'speaker-off', 18, 'control');
  function syncButtons() {
    document.querySelectorAll('button.o55-sound').forEach((b) => {
      const on = !S.muted, label = on ? O55.t('chrome.soundOn') : O55.t('chrome.soundOff');
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', label); b.setAttribute('title', label + (b.getAttribute('data-o55-hint') ? '\n' + b.getAttribute('data-o55-hint') : ''));
      const svg = b.querySelector('svg');
      if (svg && svg.classList.contains('nx')) { const nx = neonSvg(on); if (nx && svg.outerHTML !== nx) svg.outerHTML = nx; return; }
      const paths = b.querySelectorAll('svg path');
      for (let i = 0; i < 2 && i + 1 < paths.length; i++) paths[i + 1].setAttribute('d', WAVE[on ? 'on' : 'off'][i]);
    });
  }
  function announce(detail) {
    document.documentElement.toggleAttribute('data-o55-muted', S.muted);
    syncButtons();
    window.dispatchEvent(new CustomEvent('o55:sound', detail));
  }
  /* re-read the current Project's value (or the unbound default) and reflect it; plays nothing, writes nothing.
     A read holds for the rest of the run of script it was made in (until the next microtask checkpoint): a screen
     change asks several times in one run (the sound button's render, its 'next', a cue), and each read copies the
     Project's whole Settings snapshot through the owner (about 1 ms on the VM). Writes, toggles, the Settings page's
     own clicks and a Project switch always read again. */
  let refreshedAt = -1e9, held = false;
  const FRESH = new Set(['write', 'toggle', 'settings', 'project', 'project-switched', 'load', 'dom']);
  S.refresh = function refresh(source) {
    if (held && !FRESH.has(source)) return S.binding();
    held = true; queueMicrotask(() => { held = false; });
    refreshedAt = performance.now();
    const p = currentProject();
    if (!p) {
      const had = !!bound; bound = null;
      /* a binding fell away (Project closed): back to the factory default — never the previous Project's value.
         Staying unbound keeps a preview the person chose earlier in this session. */
      const want = !factoryDefault();
      if (had && S.muted !== want) { S.muted = want; announce({ detail: { muted: want, source: source || 'bind', binding: null } }); }
      return S.binding();
    }
    let enabled = projectEnabled(p);
    if (enabled === PENDING) {
      /* A Project whose settings cannot be read yet. The one this onboarding run has just made (selected as Creating
         publishes it, with the window open; its settings are saved by its first write, O55.shell.commitLook) keeps the
         sound the person is hearing until they are readable, and that write reads again. Any other unreadable Project
         is silent (fail closed). (A mute flipped on for that moment cut a block's touchdown on Creating: final check
         F1-2.) */
      const cm = O55.S && O55.S.open && O55.S.sess && O55.S.sess.commit;
      const made = cm ? [cm.projectId, cm.pendingProjectId, cm.fixtureProjectId].filter(Boolean) : [];
      if (made.indexOf(p.id) >= 0 && (!bound || bound.project_id !== p.id)) return S.binding();
      enabled = false;
    }
    const changed = !bound || bound.project_id !== p.id || bound.enabled !== enabled;
    bound = { project_id: p.id, enabled };
    if (changed && S.muted !== !enabled) { S.muted = !enabled; announce({ detail: { muted: S.muted, source: source || 'bind', binding: S.binding() } }); }
    return S.binding();
  };
  S.binding = function binding() { return bound ? Object.assign({}, bound) : null; };

  /* ---- synth primitives (any BaseAudioContext, so offline renders use the same code). Randomness goes through R,
     which play() and the renders point at a seeded generator, so a render of a sound is always the same. ---- */
  const note = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz
  let R = Math.random;
  /* Shared PCM is independent of context and play state. Bound every retained take, noise, room and string
     buffer together to 20 MiB; a miss always uses the original synthesis. Active Web Audio nodes own their
     playing buffers separately. No rounding of musical pitch or change to the per-play random stream. */
  const BUFFER_BYTES = 20 * 1024 * 1024, buffers = new Map();
  let bufferBytes = 0;
  function bufferOf(key) {
    const b = buffers.get(key);
    if (b) { buffers.delete(key); buffers.set(key, b); }
    return b || null;
  }
  function keepBuffer(key, b) {
    const bytes = b.length * b.numberOfChannels * 4;
    if (bytes > BUFFER_BYTES) return b;
    if (buffers.has(key)) { const old = buffers.get(key); bufferBytes -= old.length * old.numberOfChannels * 4; buffers.delete(key); }
    while (bufferBytes + bytes > BUFFER_BYTES) {
      const first = buffers.keys().next().value, old = buffers.get(first);
      bufferBytes -= old.length * old.numberOfChannels * 4; buffers.delete(first);
    }
    buffers.set(key, b); bufferBytes += bytes;
    return b;
  }
  function noiseBuf(ctx) {
    const key = 'noise:' + ctx.sampleRate;
    let b = bufferOf(key);
    if (b) return b;
    const len = Math.ceil(ctx.sampleRate * 2.4), r = O55.util.rng(7);
    b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
    keepBuffer(key, b);
    return b;
  }
  function envGain(ctx, t0, peak, attack, dur, curve) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + Math.max(0.001, attack));
    if (curve === 'hold') g.gain.setValueAtTime(Math.max(0.0002, peak), t0 + Math.max(attack + 0.001, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    return g;
  }
  const waves = new WeakMap();
  function pulseWave(ctx, duty) {
    let m = waves.get(ctx); if (!m) { m = {}; waves.set(ctx, m); }
    if (m[duty]) return m[duty];
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    return (m[duty] = ctx.createPeriodicWave(re, im));
  }
  const pulse25 = (ctx) => pulseWave(ctx, 0.25), pulse12 = (ctx) => pulseWave(ctx, 0.125), square = (ctx) => pulseWave(ctx, 0.5);
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
    if (o.send) g.connect(o.send);
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
    const src = ctx.createBufferSource(), buf = noiseBuf(ctx); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = o.filter || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.f || 2000, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur);
    const g = envGain(ctx, t0, o.gain == null ? 0.08 : o.gain, o.a == null ? 0.002 : o.a, o.dur, o.curve);
    src.connect(f); f.connect(g); g.connect(out);
    if (o.send) g.connect(o.send);
    const span = Math.max(0, buf.duration - o.dur - 0.1);
    src.start(t0, R() * span, o.dur + 0.05);
  }
  /* a play's chain after its level: lp (Hz) darker when quiet, shelf (dB) brighter when emphatic, pan (-1..1) toward
     the click. Built from `from`; returns the last node (to connect onward) and the nodes it made */
  function shape(ctx, spec, from) {
    const nodes = []; let head = from;
    const add = (n) => { head.connect(n); head = n; nodes.push(n); };
    if (spec.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = spec.lp; f.Q.value = 0.5; add(f); }
    if (spec.shelf) { const f = ctx.createBiquadFilter(); f.type = 'highshelf'; f.frequency.value = 3500; f.gain.value = spec.shelf; add(f); }
    if (spec.pan != null && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = spec.pan; add(p); }
    return { head, nodes };
  }
  /* the Glass room: one convolver per context whose wet return goes to that context's master (registered by the
     live context and by each render), and a send per play so a cut-off sound takes its tail with it. The send copies
     its play's chain (chainOf, set by voice(); else the out node's level, as in a render or a preview): trim,
     intensity and jitter scale the room with the sound, and a quiet sound's room is as dark and as far left or right
     as the sound, so the dry-to-room balance is the same at every level */
  const reverbs = new WeakMap(), roomOut = new WeakMap(), sendOf = new WeakMap(), chainOf = new WeakMap();
  function roomBuffer(ctx) {
    const key = 'room:' + ctx.sampleRate, cached = bufferOf(key);
    if (cached) return cached;
    const len = Math.ceil(ctx.sampleRate * 2.2), ir = ctx.createBuffer(2, len, ctx.sampleRate), r = O55.util.rng(42);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    return keepBuffer(key, ir);
  }
  function room(ctx, out) {
    let conv = reverbs.get(ctx);
    if (!conv) {
      conv = ctx.createConvolver();
      conv.buffer = roomBuffer(ctx); const wet = ctx.createGain(); wet.gain.value = 0.32; conv.connect(wet); wet.connect(roomOut.get(ctx) || out);
      reverbs.set(ctx, conv);
    }
    return conv;
  }
  function reverb(ctx, out) {
    let send = sendOf.get(out);
    if (send) return send;
    const conv = room(ctx, out);
    let spec = chainOf.get(out);
    if (!spec) { spec = { level: out.gain ? out.gain.value : 1 }; chainOf.set(out, spec); }
    send = ctx.createGain(); send.gain.value = spec.level;
    const sh = shape(ctx, spec, send); sh.head.connect(conv);
    spec.sendNodes = [send].concat(sh.nodes);
    sendOf.set(out, send);
    return send;
  }
  /* partials stay under 7 kHz: UI sounds live in about 300 Hz - 6 kHz, a partial past that is harsh, and one past
     half the sample rate is no sound at all (the browser warns and clamps it) */
  const PARTIAL_MAX = 7000;
  function marimba(ctx, out, t0, midi, gain) {
    const f = note(midi), g = gain == null ? 0.2 : gain;
    tone(ctx, out, t0, { f, dur: 0.55, gain: g, a: 0.002 });
    if (f * 3.93 < PARTIAL_MAX) tone(ctx, out, t0, { f: f * 3.93, dur: 0.1, gain: g * 0.32, a: 0.001 });
    if (f * 9.8 < PARTIAL_MAX) tone(ctx, out, t0, { f: f * 9.8, dur: 0.035, gain: g * 0.1, a: 0.001 });
    noise(ctx, out, t0, { dur: 0.018, f: 3500, q: 0.8, gain: g * 0.25 });
  }
  function kalimba(ctx, out, t0, midi, gain, dur) {
    const f = note(midi), g = gain == null ? 0.12 : gain;
    tone(ctx, out, t0, { f, dur: dur || 0.9, gain: g, a: 0.002 });
    if (f * 5.4 < PARTIAL_MAX) tone(ctx, out, t0, { f: f * 5.4, dur: 0.12, gain: g * 0.18, a: 0.001 });
  }
  function chip(ctx, out, t0, midi, dur, gain, glideTo, wave) {
    tone(ctx, out, t0, { f: note(midi), f2: glideTo ? note(glideTo) : null, glide: dur, dur, gain: gain == null ? 0.07 : gain, wave: wave || pulse25, a: 0.001, lp: 6000 });
  }
  /* a chip note whose pitch moves in held steps (fs, one every `step` s), as an 8-bit channel would */
  function chipSteps(ctx, out, t0, fs, step, gain, wave) {
    const osc = ctx.createOscillator(); osc.setPeriodicWave((wave || pulse12)(ctx));
    fs.forEach((f, i) => osc.frequency.setValueAtTime(f, t0 + i * step));
    const dur = fs.length * step + 0.02, f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 6000; f.Q.value = 0.7;
    const g = envGain(ctx, t0, gain, 0.001, dur, 'hold');
    osc.connect(f); f.connect(g); g.connect(out); osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  /* a plucked string (Karplus-Strong): a delay line one period long holds the string's shape (pulled aside at a point
     near one end, a triangle, with a little low-passed noise for the fibre) and loses a little on every pass through a
     low-pass, so it rings at the note and darkens as it dies. The loss per pass allows for the low-pass's own loss at
     the note, so every note rings `ring` seconds (to -60 dB) at any pitch; the low-pass rises with the pitch, so a
     high note keeps some overtones; the line is read between samples and the low-pass's own delay taken out, so the
     note is in tune (within about 6 cents). Rendered once per sample rate, note and colour into a buffer and played like a
     sample: any pitch, and nothing left ringing in a feedback loop when the play is torn down. */
  function ksBuffer(ctx, f, ring, bright) {
    const key = f.toFixed(2) + ':' + ring + ':' + bright;
    const cacheKey = 'string:' + ctx.sampleRate + ':' + key;
    let b = bufferOf(cacheKey); if (b) return b;
    const sr = ctx.sampleRate, len = Math.ceil(sr * (ring + 0.04));
    const a = Math.exp(-2 * Math.PI * Math.min(sr * 0.4, Math.max(900 + bright * 3000, f * (2.5 + bright * 5))) / sr);
    const w0 = 2 * Math.PI * f / sr, atF = (1 - a) / Math.hypot(1 - a * Math.cos(w0), a * Math.sin(w0));
    const D = Math.max(2, sr / f - a / (1 - a)), loss = Math.min(0.9995, Math.pow(0.001, 1 / (ring * f)) / atF);
    const M = Math.ceil(D) + 2, line = new Float32Array(M), P0 = Math.round(D), P = Math.max(1, Math.round(P0 * 0.22));
    const r = O55.util.rng('ks:' + key), ae = Math.exp(-2 * Math.PI * 2000 / sr);
    let ex = 0, mean = 0;
    for (let i = 0; i < P0; i++) { ex = (1 - ae) * (r() * 2 - 1) + ae * ex; line[i] = (i < P ? i / P : (P0 - i) / (P0 - P)) + ex * 0.6; mean += line[i] / P0; }
    for (let i = 0; i < P0; i++) line[i] -= mean; /* no offset: a pluck, not a push */
    b = ctx.createBuffer(1, len, sr); const y = b.getChannelData(0);
    let w = P0 % M, lp = 0, peak = 1e-6;
    for (let n = 0; n < len; n++) {
      let rp = w - D; while (rp < 0) rp += M;
      const i0 = Math.floor(rp), fr = rp - i0, x = line[i0 % M] * (1 - fr) + line[(i0 + 1) % M] * fr;
      lp = (1 - a) * x + a * lp; line[w] = lp * loss; y[n] = x; w = (w + 1) % M;
      if (Math.abs(x) > peak) peak = Math.abs(x);
    }
    const fade = Math.round(sr * 0.03); /* the end leaves on a short fade, never a click */
    for (let n = 0; n < len; n++) y[n] *= 0.8 / peak * (n > len - fade ? (len - n) / fade : 1);
    return keepBuffer(cacheKey, b);
  }
  function pluck(ctx, out, t0, f, o) {
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = ksBuffer(ctx, f, o.ring || 0.3, o.bright == null ? 0.5 : o.bright);
    g.gain.value = o.gain == null ? 0.1 : o.gain; src.connect(g); g.connect(out);
    if (o.send) g.connect(o.send);
    src.start(t0);
  }
  /* a bell: the fundamental and two inharmonic partials, the high ones only while they stay under PARTIAL_MAX */
  function bell(ctx, out, t0, f, dur, gain, send) {
    tone(ctx, out, t0, { f, dur, gain, a: 0.002, send });
    if (f * 2.76 < PARTIAL_MAX) tone(ctx, out, t0, { f: f * 2.76, dur: dur * 0.32, gain: gain * 0.26, a: 0.001 });
    if (f * 5.4 < PARTIAL_MAX) tone(ctx, out, t0, { f: f * 5.4, dur: dur * 0.1, gain: gain * 0.08, a: 0.001 });
  }
  /* a low-pass on the way out, for muted and chip-like sounds */
  function lpOut(ctx, out, hz) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = hz; f.Q.value = 0.6; f.connect(out); return f; }
  /* NieR: the Menu sounds blip (kit.d/19-nier-parts.js), the same envelope: a 4 ms rise and an exponential fall */
  function nb(ctx, out, t0, f, dur, gain, type, f2) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + 0.03);
  }
  const nchk = (ctx, out, t0, gain) => noise(ctx, out, t0, { dur: 0.005, f: 4800, q: 2.5, gain: gain == null ? 0.03 : gain, a: 0.0008 });
  /* NieR: the reboot hum — a saw an octave on its way up (or down) behind a resonant low-pass that opens with it;
     `swell` (s) is how long it takes to reach full level (a short rise by default, a slow swell for nierOn) */
  function hum(ctx, out, t0, up, dur, gain, hp, swell) {
    dur = dur || 0.62;
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    if (hp) { const h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp; h.Q.value = 0.6; h.connect(out); out = h; }
    o.type = 'sawtooth'; o.frequency.setValueAtTime(up ? 98 : 196, t0); o.frequency.exponentialRampToValueAtTime(up ? 196 : 98, t0 + dur * 0.89);
    f.type = 'lowpass'; f.Q.value = 7; f.frequency.setValueAtTime(up ? 260 : 3400, t0); f.frequency.exponentialRampToValueAtTime(up ? 3400 : 260, t0 + dur * 0.8);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain || 0.05, t0 + (swell || 0.04)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(f); f.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + 0.04);
  }
  /* NieR: a low filtered buzz (refusals): a saw through a band-pass, trembling a little (am Hz); its fundamental is
     cut, so what is heard is the buzz's 300 Hz - 1.7 kHz body */
  function buzz(ctx, out, t0, o) {
    const osc = ctx.createOscillator(); osc.type = o.type || 'sawtooth';
    osc.frequency.setValueAtTime(o.f, t0); if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = o.bp || 850; bp.Q.value = o.q || 1.1;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp || 1700; lp.Q.value = 0.5;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 220; hp.Q.value = 0.6;
    const am = ctx.createGain(); am.gain.value = 1;
    const env = envGain(ctx, t0, o.gain == null ? 0.08 : o.gain, o.a == null ? 0.005 : o.a, o.dur, 'hold');
    osc.connect(bp); bp.connect(lp); lp.connect(hp); hp.connect(am); am.connect(env); env.connect(out);
    if (o.am !== 0) { const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = o.am || 32; am.gain.value = 0.65; lg.gain.value = 0.35; lfo.connect(lg); lg.connect(am.gain); lfo.start(t0); lfo.stop(t0 + o.dur + 0.05); }
    osc.start(t0); osc.stop(t0 + o.dur + 0.05);
  }
  /* NieR: vowel formants (Hz, level) for the Pod's bleeps and the choir */
  const VOWELS = { ah: [[730, 1], [1090, 0.5], [2440, 0.2]], oh: [[570, 1], [840, 0.45], [2410, 0.14]], oo: [[300, 1], [870, 0.3], [2240, 0.08]], ee: [[270, 0.8], [2290, 0.5], [3010, 0.28]], eh: [[530, 1], [1840, 0.45], [2480, 0.2]] };
  function formantBank(ctx, input, vowel, dest) {
    (VOWELS[vowel] || VOWELS.ah).forEach(([fr, lv]) => {
      const bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = fr / (70 + fr * 0.04); g.gain.value = lv;
      input.connect(bp); bp.connect(g); g.connect(dest);
    });
  }
  /* a formant bleep: a saw with a small pitch bend, shaped into a vowel */
  function formant(ctx, out, t0, o) {
    const osc = ctx.createOscillator(); osc.type = o.type || 'sawtooth';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.glide || o.dur));
    const env = envGain(ctx, t0, o.gain == null ? 0.3 : o.gain, o.a == null ? 0.006 : o.a, o.dur, o.curve);
    formantBank(ctx, osc, o.vowel, env); env.connect(out);
    osc.start(t0); osc.stop(t0 + o.dur + 0.05);
  }
  /* the choir: per note two detuned saws with a slow vibrato that grows in, through one vowel; soft and airy */
  function choir(ctx, out, t0, o) {
    const dur = o.dur || 1.6;
    const lp = ctx.createBiquadFilter(), hp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3400; lp.Q.value = 0.5; hp.type = 'highpass'; hp.frequency.value = 150; hp.Q.value = 0.6;
    lp.connect(hp); hp.connect(out); out = lp;
    o.notes.forEach((m, i) => {
      const f = note(m), env = ctx.createGain(), hold = t0 + dur * 0.45, peak = (o.gain == null ? 0.05 : o.gain) / Math.sqrt(o.notes.length);
      env.gain.setValueAtTime(0.0001, t0); env.gain.exponentialRampToValueAtTime(peak, t0 + (o.a || 0.22)); env.gain.setValueAtTime(peak, Math.max(t0 + (o.a || 0.22) + 0.01, hold)); env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      const mix = ctx.createGain(); mix.gain.value = 1;
      [-7, 6].forEach((cents, j) => {
        const osc = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(f, t0); osc.detune.setValueAtTime(cents, t0);
        lfo.frequency.value = 4.6 + i * 0.37 + j * 0.23; lg.gain.setValueAtTime(0, t0); lg.gain.linearRampToValueAtTime(f * 0.0045, t0 + Math.min(0.6, dur * 0.4));
        lfo.connect(lg); lg.connect(osc.frequency); osc.connect(mix);
        osc.start(t0); lfo.start(t0); osc.stop(t0 + dur + 0.05); lfo.stop(t0 + dur + 0.05);
      });
      formantBank(ctx, mix, o.vowel || 'ah', env); env.connect(out);
    });
    /* breath: a little air in the two upper formants */
    noise(ctx, out, t0, { dur, f: 1150, q: 3, gain: (o.gain == null ? 0.05 : o.gain) * 0.05, a: o.a || 0.22, curve: 'hold' });
  }
  /* a soft keys pad (quest stings, chapter beds): triangle with a quiet sine an octave up, under a warm low-pass */
  function pad(ctx, out, t0, notes, dur, gain) {
    const lo = lpOut(ctx, out, 2400);
    notes.forEach((m) => { const f = note(m); tone(ctx, lo, t0, { f, type: 'triangle', dur, gain, a: 0.03 }); tone(ctx, lo, t0, { f: f * 2, dur: dur * 0.7, gain: gain * 0.25, a: 0.02 }); });
  }
  /* a note of a celebration placed somewhere across the stereo field */
  function panned(c, o) { if (!c.createStereoPanner) return o; const p = c.createStereoPanner(); p.pan.value = (R() - 0.5) * 1.4; p.connect(o); return p; }
  const sparkle = (c, o, t, dur, n, fn) => { for (let i = 0; i < n; i++) { const at = t + Math.pow(i / n, 0.8) * dur + R() * 0.03; fn(at, i); } };
  /* the look's motif to the sting's depth: note i at t + i * gap; fn(at, i, last) plays one (the last is held) */
  function motifRun(k, t, gap, fn) { for (let i = 0; i < k.depth; i++) fn(t + i * gap, i, i === k.depth - 1); }
  /* a sting's level by its depth (dB): one trim serves every depth, so a sting whose shorter forms measure hotter than
     its full one (Retro's arpeggio and NieR's choir thin the full form's average) is brought level here. Only for
     recipes without a room send (a send is keyed by the play's own output) */
  const STING_DB = { retro: [-1.6, -1.4, -1.1, -0.9, 0], nier: [0.6, 0.7, 1.1, 0.9, 0] };
  function stingOut(c, o, k) { const d = STING_DB[k.kit]; if (!d || !d[k.depth]) return o; const g = c.createGain(); g.gain.value = Math.pow(10, d[k.depth] / 20); g.connect(o); return g; }

  /* ---- music: the journey has a key. Each chapter plays on its own chord, so choices vary but always fit; moving
     forward climbs the chord with progress inside the chapter (k.n) and Back descends; choices rotate through the
     chord (k.rot); each helper has its own cheer voice (k.voice); celebrations crackle like the confetti; typing ticks
     quietly in the family's material. k = { m(i, octave) chord note (folded under G#7), n, step, rot, idx, voice,
     intensity, layer, r }. ---- */
  const CHORDS = { welcome: [0, 4, 7], computer: [5, 9, 12], project: [7, 11, 14], ai: [9, 12, 16], ready: [12, 16, 19], tour: [0, 4, 7],
    'tour-ask': [5, 9, 12], 'tour-workspace': [2, 5, 9], 'tour-plan': [7, 11, 14] };
  /* NieR: A, with Aeolian and Dorian colours; every chapter a seventh chord of the mode (Am7, Fmaj7, Cmaj7, Em7, D6 —
     the Dorian lift at Ready), the tour Am7, Fmaj7 then G6, which the finish's choir resolves to A minor */
  const NIER_CHORDS = { welcome: [0, 3, 7, 10], computer: [8, 12, 15, 19], project: [3, 7, 10, 14], ai: [7, 10, 14, 17], ready: [5, 9, 12, 14],
    tour: [0, 3, 7, 10], 'tour-ask': [0, 3, 7, 10], 'tour-workspace': [8, 12, 15, 19], 'tour-plan': [10, 14, 17, 19] };
  const ROOT = { basic: 72, friendly: 67, glass: 72, retro: 72, nier: 69 };
  /* each look's four-note motif (semitones over its root), built one note per chapter and resolved at Ready: Basic
     E G B D over C (an upper structure: sine and click), Friendly G A B D (pentatonic, marimba), Glass C G D A (fifths,
     FM bells), Retro C E G C (a chip arpeggio), NieR A C E G (Am7). Each reads as colour over every chapter's chord. */
  const MOTIF = { basic: [4, 7, 11, 14], friendly: [12, 14, 16, 19], glass: [0, 7, 14, 21], retro: [0, 4, 7, 12], nier: [12, 15, 19, 22] };
  /* a chapter's place in its journey, which is how many motif notes its sting plays (the tour starts over at 1) */
  const ORD = { welcome: 0, computer: 1, project: 2, ai: 3, ready: 4, tour: 0, 'tour-ask': 0, 'tour-workspace': 1, 'tour-plan': 2 };
  const journeyOf = (ch) => (/^tour/.test(ch || '') ? 'tour' : 'setup');
  /* the default intensity of a sting by its depth: the arc rises 0.45, 0.55, 0.65 to 0.85 at the resolution */
  const ARC = [0.4, 0.45, 0.55, 0.65, 0.85];
  const music = { chapter: 'welcome', step: 0, base: 0, progress: 0, x: 0.5, rot: {}, changedAt: -1e9, prev: null, run: null, journey: 'setup', stung: new Set() };
  function newRun(id, ch) { music.run = id === undefined ? null : id; music.stung = new Set(); music.journey = journeyOf(ch || music.chapter); }
  S.setContext = function setContext(o) {
    o = o || {};
    let ch = o.chapter;
    /* the tour's chord follows its chapter even when a caller only says 'tour' */
    if (ch === 'tour') { try { const s = O55.tour && O55.tour.st && O55.tour.st.step; if (s && s.chapter && CHORDS['tour-' + s.chapter]) ch = 'tour-' + s.chapter; } catch (_) {} }
    if (o.step != null) music.step = o.step;
    if (o.progress != null) music.progress = Math.max(0, Math.min(1, o.progress));
    /* a run: no chapter stung yet. The caller's id (the onboarding session), or crossing into the other journey */
    if (o.run !== undefined && o.run !== music.run) newRun(o.run, ch);
    else if (ch && journeyOf(ch) !== music.journey) newRun(music.run, ch);
    if (ch && ch !== music.chapter) { music.prev = music.chapter; music.chapter = ch; music.base = music.step; music.changedAt = performance.now(); music.announced = false; }
    /* the caller plays this chapter's sting itself (the NieR act card): it counts as stung, nothing converts */
    if (o.sting === false && music.chapter) music.stung.add(music.chapter);
    queueNext();
  };
  /* how many motif notes chapter ch's sting plays: its place in the journey, or (for a chapter with no place) how many
     chapters this run has stung, the journey's first chapter not counted; at most 4 */
  function depthOf(ch) {
    if (ORD[ch] === 0) return 0;
    let n = 0; music.stung.forEach((c) => { if (ORD[c] !== 0) n++; });
    return Math.min(4, Math.max(ORD[ch] || 0, n));
  }
  /* the first forward move into a chapter this run has not stung (a screen of the next chapter, the tour's next part)
     is a chapter sting, unless the window has only just opened; Back then forward plays a plain move */
  function chapterSting(event, now, o) {
    if (music.announced || !music.prev || music.stung.has(music.chapter) || now - music.changedAt > 1500 || now - (lastAt.open || -1e9) < 800) return event;
    /* in the window under NieR with its quests part, the chapter's card plays the sting ('quest'); no second one here */
    if (questsOwnSting(o)) return event;
    if (event === 'next' || (/^tour-/.test(music.chapter) && (event === 'step' || event === 'spot' || event === 'callout'))) return 'chapter';
    return event;
  }
  function questsOwnSting(o) {
    if (!document.documentElement.hasAttribute('data-o55-open') || kitFor('next', o) !== 'nier') return false;
    const p = nierParts();
    if (p) return p.includes('quests');
    try { return !!(window.PM_NIER && window.PM_NIER.has && window.PM_NIER.has('quests')); } catch (_) { return false; }
  }
  S.context = () => ({ chapter: music.chapter, step: music.step, n: Math.max(0, music.step - music.base), progress: music.progress, depth: depthOf(music.chapter), run: music.run });
  /* the name sign's climb: the step walks up 8 chord tones and back down again (0..7..1), so a long name never jumps */
  const climb = (s) => { const p = ((s | 0) % 14 + 14) % 14; return p > 7 ? 14 - p : p; };
  function mk(kit, ev, o, pure, variant, rng) {
    o = o || {};
    const table = kit === 'nier' ? NIER_CHORDS : CHORDS, chName = o.chapter || (pure ? 'welcome' : music.chapter);
    const ch = table[chName] || table.welcome, len = ch.length, root = ROOT[kit] || 72, mo = MOTIF[kit] || MOTIF.basic;
    const key = kit + ':' + ev, rot = pure ? (variant || 0) : (music.rot[key] = (music.rot[key] || 0) + 1);
    const n = o.step != null ? Math.max(0, o.step | 0) : (pure ? 0 : Math.max(0, music.step - music.base));
    const fold = (x) => { while (x > 104) x -= 12; return x; };
    return {
      kit, rot, n, step: o.step != null ? o.step : (pure ? 0 : music.step), idx: o.step != null ? Math.max(0, o.step | 0) : rot,
      voice: Math.max(0, o.voice | 0), variant: variant || 0, layer: !!o.layer, r: rng,
      /* a library preview hears the whole motif (depth 4); live, the chapter's place in the journey */
      depth: o.depth != null ? Math.max(0, Math.min(4, o.depth | 0)) : (pure ? 4 : depthOf(chName)),
      climb: o.step != null ? climb(o.step) : 0,
      intensity: Math.max(0, Math.min(1, o.intensity == null ? 0.6 : +o.intensity || 0)),
      m: (i, oct) => fold(root + ch[((i % len) + len) % len] + 12 * (Math.floor(i / len) + (oct || 0))),
      /* motif note i (0..3) of this look, an octave up or down by oct */
      motif: (i, oct) => fold(root + mo[Math.max(0, Math.min(3, i))] + 12 * (oct || 0))
    };
  }

  /* ---- kits: event -> fn or [fn, ...] (a pool); fn(ctx, out, t0, v, k), v the ±2% pitch variation factor.
     Variant 1 of each pool is the sound this kit always made. ---- */
  const KITS = {
    basic: {
      tap: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, f: 3200 * v, q: 3, gain: 0.07 }); tone(c, o, t, { f: note(k.m(k.rot % 3, 2)), dur: 0.045, gain: 0.045 }); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.008, f: 4400 * v, q: 4, gain: 0.06 }); tone(c, o, t, { f: note(k.m(k.rot % 3 + 1, 2)) * v, dur: 0.036, gain: 0.04, type: 'triangle' }); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.01, f: 3600 * v, q: 3, gain: 0.055 }); tone(c, o, t, { f: note(k.m(0, 2)) * v, dur: 0.026, gain: 0.03 }); tone(c, o, t + 0.03, { f: note(k.m(1, 2)) * v, dur: 0.04, gain: 0.036 }); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.014, f: 2600 * v, q: 2.4, gain: 0.06 }); tone(c, o, t, { f: note(k.m(2, 1)) * v, f2: note(k.m(2, 1)) * v * 1.025, dur: 0.05, gain: 0.042 }); }
      ],
      select: [
        (c, o, t, v, k) => { const r = k.rot % 3; tone(c, o, t, { f: note(k.m(r, 1)) * v, dur: 0.11, gain: 0.07 }); tone(c, o, t + 0.045, { f: note(k.m(r + 1, 1)) * v, dur: 0.14, gain: 0.06 }); },
        (c, o, t, v, k) => { const r = k.rot % 3; tone(c, o, t, { f: note(k.m(r, 1)) * v, dur: 0.09, gain: 0.06 }); tone(c, o, t + 0.05, { f: note(k.m(r + 3, 1)) * v, dur: 0.17, gain: 0.05 }); tone(c, o, t + 0.05, { f: note(k.m(r + 3, 1)) * v, type: 'triangle', dur: 0.12, gain: 0.02 }); },
        (c, o, t, v, k) => { const r = k.rot % 3; [0, 1, 2].forEach((i) => tone(c, o, t + i * 0.032, { f: note(k.m(r + i, 1)) * v, dur: 0.08 + i * 0.03, gain: 0.05 })); },
        (c, o, t, v, k) => { const r = k.rot % 3; noise(c, o, t, { dur: 0.01, f: 3800, q: 3, gain: 0.04 }); tone(c, o, t, { f: note(k.m(r, 1)) * v, dur: 0.2, gain: 0.055 }); tone(c, o, t + 0.012, { f: note(k.m(r + 2, 1)) * v, dur: 0.18, gain: 0.04 }); }
      ],
      next: [
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.06, f: 4600, q: 1.6, gain: 0.03 }); [0, 1, 2].forEach((i) => tone(c, o, t + 0.01 + i * 0.05, { f: note(k.m(b + i, 1)) * v, dur: 0.12 + i * 0.03, gain: 0.055 })); },
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.05, f: 4200, q: 1.6, gain: 0.03 }); tone(c, o, t + 0.01, { f: note(k.m(b, 1)) * v, dur: 0.1, gain: 0.055 }); tone(c, o, t + 0.07, { f: note(k.m(b + 2, 1)) * v, dur: 0.22, gain: 0.055 }); },
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.05, f: 5000, q: 1.6, gain: 0.026 }); [0, 1, 2, 3].forEach((i) => tone(c, o, t + 0.01 + i * 0.036, { f: note(k.m(b + i, 1)) * v, dur: i === 3 ? 0.2 : 0.08, gain: 0.048 })); }
      ],
      back: [
        (c, o, t, v, k) => { const b = k.n % 4; [2, 1].forEach((i, j) => tone(c, o, t + j * 0.05, { f: note(k.m(b + i, 1)) * v, dur: 0.13, gain: 0.05 })); },
        (c, o, t, v, k) => { const b = k.n % 4; tone(c, o, t, { f: note(k.m(b + 2, 1)) * v, f2: note(k.m(b, 1)) * v, glide: 0.1, dur: 0.15, gain: 0.05 }); noise(c, o, t + 0.1, { dur: 0.01, f: 3000, q: 3, gain: 0.03 }); },
        (c, o, t, v, k) => { const b = k.n % 4; [2, 1, 0].forEach((i, j) => tone(c, o, t + j * 0.04, { f: note(k.m(b + i, 1)) * v, dur: 0.1, gain: 0.042 })); }
      ],
      toggleOn: [
        (c, o, t, v) => tone(c, o, t, { f: 1100 * v, dur: 0.06, gain: 0.06 }),
        (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(0, 1)) * v, dur: 0.04, gain: 0.05 }); tone(c, o, t + 0.03, { f: note(k.m(1, 1)) * v, dur: 0.06, gain: 0.05 }); },
        (c, o, t, v) => { noise(c, o, t, { dur: 0.008, f: 4000, q: 3, gain: 0.04 }); tone(c, o, t, { f: 1046 * v, f2: 1318 * v, glide: 0.04, dur: 0.07, gain: 0.055 }); }
      ],
      toggleOff: [
        (c, o, t, v) => tone(c, o, t, { f: 740 * v, dur: 0.06, gain: 0.05 }),
        (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(1, 1)) * v, dur: 0.04, gain: 0.045 }); tone(c, o, t + 0.03, { f: note(k.m(0, 1)) * v, dur: 0.06, gain: 0.045 }); },
        (c, o, t, v) => { noise(c, o, t, { dur: 0.008, f: 3000, q: 3, gain: 0.035 }); tone(c, o, t, { f: 880 * v, f2: 740 * v, glide: 0.04, dur: 0.07, gain: 0.05 }); }
      ],
      success: (c, o, t) => { [84, 88, 91].forEach((m, i) => { tone(c, o, t + i * 0.055, { f: note(m), dur: 0.35, gain: 0.05 }); tone(c, o, t + i * 0.055, { f: note(m), type: 'triangle', dur: 0.25, gain: 0.025 }); }); },
      error: (c, o, t) => { tone(c, o, t, { f: 330, type: 'triangle', dur: 0.12, gain: 0.07 }); tone(c, o, t + 0.09, { f: 247, type: 'triangle', dur: 0.2, gain: 0.06 }); },
      commit: (c, o, t) => { [72, 76, 79, 84].forEach((m, i) => { tone(c, o, t + i * 0.07, { f: note(m), dur: 1.1, gain: 0.05, a: 0.02 }); tone(c, o, t + i * 0.07, { f: note(m), detune: 7, dur: 1.1, gain: 0.03, a: 0.02 }); }); },
      open: (c, o, t) => tone(c, o, t, { f: 440, f2: 880, glide: 0.16, dur: 0.2, gain: 0.04 }),
      close: (c, o, t) => tone(c, o, t, { f: 880, f2: 440, glide: 0.14, dur: 0.18, gain: 0.035 }),
      pickup: (c, o, t, v) => tone(c, o, t, { f: 520 * v, f2: 780 * v, glide: 0.08, dur: 0.1, gain: 0.05 }),
      drop: (c, o, t, v) => { tone(c, o, t, { f: 780 * v, f2: 520 * v, glide: 0.07, dur: 0.1, gain: 0.05 }); noise(c, o, t + 0.05, { dur: 0.015, f: 2500, gain: 0.05 }); },
      spot: (c, o, t) => noise(c, o, t, { dur: 0.12, f: 3200, f2: 5600, q: 1.8, gain: 0.022 }),
      step: [
        (c, o, t, v, k) => { const j = k.n % 3; tone(c, o, t, { f: note(k.m(2 + j, 1)), dur: 0.12, gain: 0.05 }); tone(c, o, t + 0.07, { f: note(k.m(4 + j, 1)), dur: 0.22, gain: 0.045 }); },
        (c, o, t, v, k) => { const j = k.n % 3, f = note(k.m(3 + j, 1)); tone(c, o, t, { f, dur: 0.36, gain: 0.05 }); tone(c, o, t, { f: f * 2.76, dur: 0.06, gain: 0.008 }); tone(c, o, t, { f, type: 'triangle', dur: 0.2, gain: 0.018 }); },
        (c, o, t, v, k) => { const j = k.n % 3; [0, 1, 2].forEach((i) => tone(c, o, t + i * 0.045, { f: note(k.m(2 + j + i, 1)), dur: 0.1 + i * 0.05, gain: 0.045 })); }
      ],
      finish: (c, o, t) => { [72, 79, 84, 88].forEach((m, i) => tone(c, o, t + i * 0.09, { f: note(m), dur: 0.8, gain: 0.05, a: 0.01 })); },
      cheer: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.01, f: 5200, q: 4, gain: 0.05 }); tone(c, o, t + 0.01, { f: note(k.m(3 + k.voice, 1)), dur: 0.16, gain: 0.05 }); tone(c, o, t + 0.07, { f: note(k.m(5 + k.voice, 1)), dur: 0.22, gain: 0.04, type: 'triangle' }); },
      celebrate: (c, o, t, v, k) => {
        if (!k.layer) { noise(c, o, t, { dur: 0.5, f: 2400, f2: 7000, q: 0.9, gain: 0.02 }); [0, 1, 2, 3].forEach((i) => tone(c, o, t + i * 0.06, { f: note(k.m(i, 1)), dur: 0.5, gain: 0.045, type: i % 2 ? 'triangle' : 'sine' })); }
        sparkle(c, o, t + (k.layer ? 0.1 : 0.2), 1.1, 14, (at, i) => tone(c, panned(c, o), at, { f: note(k.m(3 + (i * 2) % 7, 2)), dur: 0.09, gain: 0.05 }));
      },
      type: [
        (c, o, t) => noise(c, o, t, { dur: 0.018 + R() * 0.02, f: 3600 + R() * 1800, q: 2.4, gain: 0.02 }),
        (c, o, t) => noise(c, o, t, { dur: 0.012 + R() * 0.012, f: 2600 + R() * 900, q: 3, gain: 0.022 }),
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, f: 4400 + R() * 900, q: 3, gain: 0.0127 }); tone(c, o, t, { f: note(k.m(Math.floor(R() * 3), 2)), dur: 0.018, gain: 0.0063 }); }
      ],
      /* the chapter's chord, then the motif to the sting's depth in sine and click (the last note held); at the
         resolution the chord's soft pad holds underneath */
      chapter: (c, o, t, v, k) => {
        const d = k.depth;
        noise(c, o, t, { dur: 0.07, f: 4600, q: 1.6, gain: 0.03 });
        tone(c, o, t, { f: note(k.m(0, -2)), dur: d ? 0.9 : 0.7, gain: 0.03, a: 0.02 });
        [0, 1, 2].forEach((i) => tone(c, o, t + 0.01 + i * 0.045, { f: note(k.m(i, -1)), dur: d ? 0.16 : 0.5, gain: d ? 0.05 : 0.036 }));
        if (!d) tone(c, o, t + 0.15, { f: note(k.m(3, -1)), dur: 0.45, gain: 0.03 });
        motifRun(k, t + 0.17, 0.12, (at, i, last) => { const f = note(k.motif(i, 0)); noise(c, o, at, { dur: 0.005, f: 5200, q: 3, gain: 0.024 }); tone(c, o, at, { f, dur: last ? 0.6 : 0.16, gain: 0.052 }); if (last) tone(c, o, at, { f: f * 2, dur: 0.22, gain: 0.006 }); });
        if (d >= 4) [0, 1, 2].forEach((i) => { const f = note(k.m(i, -1)); tone(c, o, t + 0.12, { f, dur: 1.3, gain: 0.012, a: 0.14 }); tone(c, o, t + 0.12, { f: f * 1.003, dur: 1.3, gain: 0.009, a: 0.16 }); });
      },
      /* stage foley. string: a taut steel wire, the chord tone of its helper (or the name sign's next tone up) bent
         down 2% with its 2.76x partial */
      string: [
        (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, -1)); noise(c, o, t, { dur: 0.004, f: 5200, q: 3, gain: 0.018 }); tone(c, o, t, { f, f2: f * 0.98, glide: 0.14, dur: 0.14, gain: 0.045 }); tone(c, o, t, { f: f * 2.76, f2: f * 2.72, glide: 0.06, dur: 0.06, gain: 0.011 }); },
        (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, -1)); tone(c, o, t, { f, f2: f * 0.985, glide: 0.16, dur: 0.17, gain: 0.046 }); tone(c, o, t, { f: f * 2, dur: 0.05, gain: 0.009 }); tone(c, o, t, { f: f * 2.76, dur: 0.035, gain: 0.011 }); },
        (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, -1)); noise(c, o, t, { dur: 0.006, f: 4200, q: 3, gain: 0.027 }); tone(c, o, t, { f: f * 1.004, f2: f * 0.975, glide: 0.12, dur: 0.13, gain: 0.056, type: 'triangle' }); tone(c, o, t, { f: f * 2.76, dur: 0.045, gain: 0.009 }); }
      ],
      /* land: a felt tap, a low-passed knock with a soft thump on the helper's chord tone */
      land: [
        (c, o, t, v, k) => { const f = note(k.m(k.voice, -2)); noise(c, o, t, { dur: 0.025, filter: 'lowpass', f: 500, gain: 0.12 }); tone(c, o, t, { f: f * 1.4, f2: f, glide: 0.03, dur: 0.09, gain: 0.07 }); },
        (c, o, t, v, k) => { const f = note(k.m(k.voice, -2)); noise(c, o, t, { dur: 0.03, filter: 'lowpass', f: 650, gain: 0.1 }); tone(c, o, t, { f: f * 1.2, f2: f, glide: 0.02, dur: 0.08, gain: 0.06 }); tone(c, o, t + 0.004, { f: f * 2, dur: 0.03, gain: 0.012 }); }
      ],
      /* bow: a falling sine pair that comes to rest on the helper's chord tone (three bows spell the chord) */
      bow: [
        (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(k.voice + 1, -1)), dur: 0.1, gain: 0.05 }); tone(c, o, t + 0.075, { f: note(k.m(k.voice, -1)), dur: 0.26, gain: 0.05 }); },
        (c, o, t, v, k) => { const f1 = note(k.m(k.voice + 1, -1)), f0 = note(k.m(k.voice, -1)); tone(c, o, t, { f: f1, f2: f0, glide: 0.09, dur: 0.13, gain: 0.058 }); tone(c, o, t + 0.1, { f: f0, dur: 0.22, gain: 0.05, type: 'triangle' }); }
      ],
      /* save: the stamp (a click on a low thump), then root, fifth and a ringing octave */
      save: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.005, f: 3200, q: 3, gain: 0.05 }); tone(c, o, t, { f: 170, f2: 120, glide: 0.06, dur: 0.08, gain: 0.07 }); tone(c, o, t + 0.05, { f: note(k.m(0, 0)), dur: 0.14, gain: 0.05 }); tone(c, o, t + 0.12, { f: note(k.m(2, 0)), dur: 0.2, gain: 0.05 }); const f = note(k.m(3, 0)); tone(c, o, t + 0.19, { f, dur: 0.6, gain: 0.05 }); tone(c, o, t + 0.19, { f: f * 2.76 < PARTIAL_MAX ? f * 2.76 : f * 2, dur: 0.12, gain: 0.008 }); },
      reveal: (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(0, 0)), f2: note(k.m(0, 1)), glide: 0.22, dur: 0.28, gain: 0.032 }); [2, 3, 4].forEach((i, j) => tone(c, o, t + 0.14 + j * 0.05, { f: note(k.m(i, 1)), dur: 0.22, gain: 0.04 })); },
      sheet: (c, o, t) => { tone(c, o, t, { f: 620, f2: 930, glide: 0.08, dur: 0.12, gain: 0.04 }); noise(c, o, t + 0.08, { dur: 0.01, f: 3600, q: 3, gain: 0.03 }); },
      unsheet: (c, o, t) => tone(c, o, t, { f: 930, f2: 620, glide: 0.08, dur: 0.11, gain: 0.035 }),
      phase: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.006, f: 5000, q: 3, gain: 0.025 }); tone(c, o, t, { f: note(k.m(k.idx % 4, 2)), dur: 0.03, gain: 0.032 }); },
      found: (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(0, 1)), dur: 0.22, gain: 0.045 }); tone(c, o, t + 0.06, { f: note(k.m(2, 1)), dur: 0.3, gain: 0.04 }); },
      warn: (c, o, t) => { tone(c, o, t, { f: 330, type: 'triangle', dur: 0.13, gain: 0.07 }); tone(c, o, t, { f: 660, dur: 0.05, gain: 0.015 }); },
      copy: (c, o, t, v) => { noise(c, o, t, { dur: 0.006, f: 5000, q: 3, gain: 0.02 }); tone(c, o, t, { f: 2093 * v, dur: 0.025, gain: 0.04 }); tone(c, o, t + 0.04, { f: 2637 * v, dur: 0.035, gain: 0.04 }); },
      move: [
        (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(k.idx % 3, 2)), dur: 0.025, gain: 0.019 }); noise(c, o, t, { dur: 0.04, f: 4800, q: 2, gain: 0.0085 }); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.07, f: 3000, f2: 5200, q: 2.2, gain: 0.072 }); tone(c, o, t + 0.04, { f: note(k.m(k.idx % 3 + 2, 2)), dur: 0.02, gain: 0.017 }); },
        (c, o, t, v, k) => tone(c, o, t, { f: note(k.m(k.idx % 3 + 1, 2)), type: 'triangle', dur: 0.03, gain: 0.021 })
      ],
      callout: [
        (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(0, 1)), f2: note(k.m(1, 1)), glide: 0.06, dur: 0.12, gain: 0.04 }); noise(c, o, t, { dur: 0.01, f: 4200, q: 3, gain: 0.025 }); },
        (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(2, 1)), dur: 0.1, gain: 0.04 }); tone(c, o, t + 0.055, { f: note(k.m(4, 1)), dur: 0.16, gain: 0.035 }); },
        (c, o, t, v, k) => { const f = note(k.m(1, 2)); noise(c, o, t, { dur: 0.01, f: 3600, q: 3, gain: 0.03 }); tone(c, o, t + 0.01, { f, dur: 0.26, gain: 0.03 }); tone(c, o, t + 0.01, { f: f * 2.76 < 7000 ? f * 2.76 : f * 1.5, dur: 0.05, gain: 0.006 }); }
      ],
      checkpoint: [
        (c, o, t, v, k) => { const j = k.n % 3; tone(c, o, t, { f: note(k.m(j, 1)), dur: 0.08, gain: 0.055 }); tone(c, o, t + 0.06, { f: note(k.m(j + 2, 1)), dur: 0.32, gain: 0.05 }); tone(c, o, t + 0.06, { f: note(k.m(j + 2, 1)), type: 'triangle', dur: 0.18, gain: 0.02 }); },
        (c, o, t, v, k) => { const j = k.n % 3; [0, 1, 3].forEach((i, x) => tone(c, o, t + x * 0.045, { f: note(k.m(j + i, 1)), dur: x === 2 ? 0.3 : 0.08, gain: 0.05 })); },
        (c, o, t, v, k) => { const j = k.n % 3; noise(c, o, t, { dur: 0.012, f: 4000, q: 3, gain: 0.03 }); tone(c, o, t, { f: note(k.m(j + 1, 1)), dur: 0.34, gain: 0.045 }); tone(c, o, t + 0.015, { f: note(k.m(j + 3, 1)), dur: 0.34, gain: 0.035 }); }
      ],
      /* Show Me's travel and landing: three takes each, turning through the chord */
      pointer: [
        (c, o, t, v, k) => { const r = k.rot % 3; tone(c, o, t, { f: note(k.m(r, 0)), f2: note(k.m(r + 2, 0)), glide: 0.22, dur: 0.28, gain: 0.026, a: 0.05 }); noise(c, o, t, { dur: 0.22, f: 1800, f2: 3600, q: 1.4, gain: 0.008, a: 0.06 }); },
        (c, o, t, v, k) => { const r = k.rot % 3; tone(c, o, t, { f: note(k.m(r, 0)), f2: note(k.m(r + 1, 0)), glide: 0.16, dur: 0.22, gain: 0.028, a: 0.04 }); noise(c, o, t, { dur: 0.18, f: 2200, f2: 4200, q: 1.6, gain: 0.007, a: 0.05 }); },
        (c, o, t, v, k) => { const r = k.rot % 3; tone(c, o, t, { f: note(k.m(r + 1, 0)), f2: note(k.m(r + 3, 0)), glide: 0.24, dur: 0.3, gain: 0.03, a: 0.06, type: 'triangle' }); noise(c, o, t, { dur: 0.24, f: 1600, f2: 3000, q: 1.2, gain: 0.011, a: 0.07 }); }
      ],
      arrive: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, f: 3200, q: 3, gain: 0.05 }); tone(c, o, t, { f: note(k.m(k.rot % 3, 1)) * v, dur: 0.08, gain: 0.05 }); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.01, f: 3800, q: 3, gain: 0.045 }); tone(c, o, t, { f: note(k.m(k.rot % 3, 1)) * v, dur: 0.04, gain: 0.042 }); tone(c, o, t + 0.035, { f: note(k.m(k.rot % 3 + 1, 1)) * v, dur: 0.07, gain: 0.042 }); },
        (c, o, t, v, k) => { const f = note(k.m(k.rot % 3 + 2, 1)) * v; noise(c, o, t, { dur: 0.014, f: 2800, q: 2.6, gain: 0.037 }); tone(c, o, t, { f, dur: 0.1, gain: 0.034 }); tone(c, o, t, { f: f * 2.76 < PARTIAL_MAX ? f * 2.76 : f * 1.5, dur: 0.03, gain: 0.006 }); }
      ],
      missing: (c, o, t) => { tone(c, o, t, { f: 330, type: 'triangle', dur: 0.12, gain: 0.06 }); tone(c, o, t + 0.13, { f: 440, f2: 523, glide: 0.12, dur: 0.16, gain: 0.04 }); },
      interrupt: (c, o, t) => { tone(c, o, t, { f: 660, f2: 440, glide: 0.07, dur: 0.1, gain: 0.04 }); noise(c, o, t + 0.07, { dur: 0.01, f: 2400, q: 3, gain: 0.03 }); }
    },
    friendly: {
      tap: [
        (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(k.rot % 3, 2)) * v, dur: 0.03, gain: 0.06 }); noise(c, o, t, { dur: 0.02, f: 2200, q: 2, gain: 0.05 }); },
        (c, o, t, v, k) => kalimba(c, o, t, k.m(k.rot % 3, 2), 0.042, 0.22),
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.025, filter: 'lowpass', f: 1100, gain: 0.07 }); marimba(c, o, t, k.m(k.rot % 3, 2), 0.035); },
        (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(k.rot % 3, 2)) * v, dur: 0.025, gain: 0.045 }); tone(c, o, t + 0.035, { f: note(k.m(k.rot % 3 + 1, 2)) * v, dur: 0.03, gain: 0.05 }); noise(c, o, t, { dur: 0.015, f: 2000, q: 2, gain: 0.04 }); }
      ],
      select: [
        (c, o, t, v, k) => { const r = k.rot % 3; marimba(c, o, t, k.m(r, 1), 0.15); if (k.rot % 2) kalimba(c, o, t + 0.06, k.m(r + 2, 2), 0.05); },
        (c, o, t, v, k) => { const r = k.rot % 3; marimba(c, o, t, k.m(r, 1), 0.12); marimba(c, o, t + 0.012, k.m(r + 2, 1), 0.08); },
        (c, o, t, v, k) => { const r = k.rot % 3; kalimba(c, o, t, k.m(r, 2), 0.07, 0.4); kalimba(c, o, t + 0.06, k.m(r + 1, 2), 0.07, 0.5); },
        (c, o, t, v, k) => { const r = k.rot % 3; [0.11, 0.075, 0.05].forEach((g, i) => marimba(c, o, t + i * 0.034, k.m(r, 1), g)); }
      ],
      next: [
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.16, filter: 'lowpass', f: 2400, f2: 500, gain: 0.03 }); [0, 1, 2].forEach((i) => marimba(c, o, t + 0.02 + i * 0.06, k.m(b + i, 1), 0.11)); },
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.14, filter: 'lowpass', f: 2200, f2: 500, gain: 0.028 }); [0, 1, 2, 3].forEach((i) => marimba(c, o, t + 0.02 + i * 0.045, k.m(b + i, 1), 0.095)); },
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.12, filter: 'lowpass', f: 2400, f2: 600, gain: 0.026 }); marimba(c, o, t + 0.02, k.m(b, 1), 0.11); kalimba(c, o, t + 0.09, k.m(b + 2, 2), 0.07, 0.5); }
      ],
      back: [
        (c, o, t, v, k) => { const b = k.n % 4; [2, 0].forEach((i, j) => marimba(c, o, t + j * 0.07, k.m(b + i, 1), 0.1)); },
        (c, o, t, v, k) => { const b = k.n % 4; [2, 1, 0].forEach((i, j) => marimba(c, o, t + j * 0.06, k.m(b + i, 1), 0.08)); },
        (c, o, t, v, k) => { const b = k.n % 4; kalimba(c, o, t, k.m(b + 1, 2), 0.07, 0.35); kalimba(c, o, t + 0.07, k.m(b, 2), 0.07, 0.45); }
      ],
      toggleOn: [
        (c, o, t) => tone(c, o, t, { f: 600, f2: 980, glide: 0.06, dur: 0.09, gain: 0.08 }),
        (c, o, t, v, k) => { marimba(c, o, t, k.m(0, 2), 0.05); marimba(c, o, t + 0.04, k.m(1, 2), 0.05); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.02, filter: 'lowpass', f: 1200, gain: 0.05 }); kalimba(c, o, t, k.m(2, 2), 0.06, 0.3); }
      ],
      toggleOff: [
        (c, o, t) => tone(c, o, t, { f: 900, f2: 560, glide: 0.06, dur: 0.09, gain: 0.07 }),
        (c, o, t, v, k) => { marimba(c, o, t, k.m(1, 2), 0.045); marimba(c, o, t + 0.04, k.m(0, 2), 0.045); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.02, filter: 'lowpass', f: 900, gain: 0.05 }); tone(c, o, t, { f: note(k.m(0, 1)), dur: 0.12, gain: 0.07 }); }
      ],
      success: (c, o, t) => { [72, 76, 79, 84].forEach((m, i) => marimba(c, o, t + i * 0.07, m, 0.12)); kalimba(c, o, t + 0.3, 91, 0.07); },
      error: (c, o, t) => { marimba(c, o, t, 62, 0.13); marimba(c, o, t + 0.11, 60, 0.12); },
      commit: (c, o, t) => { [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => marimba(c, o, t + i * 0.055, m, 0.1)); [88, 91, 96].forEach((m, i) => kalimba(c, o, t + 0.45 + i * 0.08, m, 0.06)); },
      open: (c, o, t) => { noise(c, o, t, { dur: 0.2, filter: 'lowpass', f: 600, f2: 2600, gain: 0.03 }); marimba(c, o, t + 0.08, 84, 0.08); },
      close: (c, o, t) => { noise(c, o, t, { dur: 0.18, filter: 'lowpass', f: 2600, f2: 600, gain: 0.03 }); marimba(c, o, t + 0.07, 67, 0.06); },
      pickup: (c, o, t) => tone(c, o, t, { f: 520, f2: 860, glide: 0.07, dur: 0.1, gain: 0.08 }),
      drop: (c, o, t) => { tone(c, o, t, { f: 860, f2: 420, glide: 0.08, dur: 0.11, gain: 0.08 }); marimba(c, o, t + 0.06, 67, 0.08); },
      spot: (c, o, t) => kalimba(c, o, t, 93, 0.035),
      step: [
        (c, o, t, v, k) => { const j = k.n % 3; marimba(c, o, t, k.m(2 + j, 1), 0.1); marimba(c, o, t + 0.08, k.m(4 + j, 1), 0.09); },
        (c, o, t, v, k) => { const j = k.n % 3; kalimba(c, o, t, k.m(2 + j, 2), 0.07, 0.4); kalimba(c, o, t + 0.08, k.m(3 + j, 2), 0.07, 0.5); },
        (c, o, t, v, k) => { const j = k.n % 3; marimba(c, o, t, k.m(3 + j, 1), 0.1); kalimba(c, o, t + 0.05, k.m(5 + j, 2), 0.05, 0.6); }
      ],
      finish: (c, o, t) => { [72, 76, 79, 84, 88].forEach((m, i) => marimba(c, o, t + i * 0.08, m, 0.1)); },
      /* each helper on its own chord tone (h0 root, h1 third, h2 fifth), so three cheers spell the chord */
      cheer: (c, o, t, v, k) => { kalimba(c, o, t, k.m(k.voice, 1), 0.07); kalimba(c, o, t + 0.07, k.m(k.voice + 2, 1), 0.08); noise(c, o, t, { dur: 0.03, filter: 'lowpass', f: 900, gain: 0.04 }); },
      celebrate: (c, o, t, v, k) => {
        if (!k.layer) [0, 1, 2, 3, 4, 5].forEach((i) => marimba(c, o, t + i * 0.05, k.m(i, 1), 0.09));
        sparkle(c, o, t + (k.layer ? 0.1 : 0.3), 1.2, 12, (at, i) => { const p = panned(c, o); if (i % 3) kalimba(c, p, at, k.m(3 + (i % 4), 2), 0.04); else noise(c, p, at, { dur: 0.05, filter: 'highpass', f: 3000, gain: 0.03 }); });
      },
      type: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.02, f: 1500 + R() * 900, q: 1.6, gain: 0.022 }); if (R() < 0.3) marimba(c, o, t, k.m(Math.floor(R() * 3), 2), 0.018); },
        (c, o, t) => noise(c, o, t, { dur: 0.018, filter: 'lowpass', f: 1200 + R() * 400, gain: 0.08 }),
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.016, f: 1900 + R() * 600, q: 2, gain: 0.075 }); if (R() < 0.25) kalimba(c, o, t, k.m(Math.floor(R() * 3), 2), 0.026, 0.2); }
      ],
      /* a paper swish and the chord on marimba, then the motif; at the resolution the paper chime (a rustle and two
         high kalimba tines) */
      chapter: (c, o, t, v, k) => {
        const d = k.depth;
        noise(c, o, t, { dur: 0.24, filter: 'lowpass', f: 2400, f2: 500, gain: 0.034 });
        [0, 1, 2].forEach((i) => marimba(c, o, t + 0.02 + i * 0.055, k.m(i, -1), 0.095));
        if (!d) kalimba(c, o, t + 0.2, k.m(2, 1), 0.06, 0.7);
        motifRun(k, t + 0.2, 0.13, (at, i, last) => { marimba(c, o, at, k.motif(i, 0), 0.105); if (last) kalimba(c, o, at + 0.01, k.motif(i, 1), 0.035, 0.7); });
        if (d >= 4) { const at = t + 0.69; noise(c, o, at, { dur: 0.14, filter: 'highpass', f: 3000, gain: 0.014 }); kalimba(c, o, at + 0.02, k.motif(3, 1), 0.045, 0.9); kalimba(c, o, at + 0.1, k.motif(1, 1), 0.035, 0.8); }
      },
      /* string: a twine pluck (a real plucked-string model, warm and short) */
      string: [
        (c, o, t, v, k) => pluck(c, o, t, note(k.m(k.voice + k.climb, -1)), { ring: 0.3, bright: 0.45, gain: 0.11 }),
        (c, o, t, v, k) => { pluck(c, o, t, note(k.m(k.voice + k.climb, -1)), { ring: 0.24, bright: 0.6, gain: 0.1 }); noise(c, o, t, { dur: 0.012, filter: 'highpass', f: 2500, gain: 0.012 }); },
        (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, -1)); pluck(c, o, t, f, { ring: 0.34, bright: 0.4, gain: 0.113 }); pluck(c, o, t + 0.006, f / 2, { ring: 0.28, bright: 0.3, gain: 0.063 }); }
      ],
      /* land: a wooden clack (two band-passed clicks) on a low marimba note */
      land: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, f: 900, q: 6, gain: 0.14 }); noise(c, o, t + 0.006, { dur: 0.01, f: 1500, q: 7, gain: 0.1 }); marimba(c, o, t, k.m(k.voice, -1), 0.06); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.014, f: 780, q: 5, gain: 0.13 }); noise(c, o, t + 0.008, { dur: 0.01, f: 1300, q: 6, gain: 0.08 }); marimba(c, o, t + 0.002, k.m(k.voice, -2), 0.07); }
      ],
      /* bow: a falling kalimba pair onto the helper's chord tone */
      bow: [
        (c, o, t, v, k) => { kalimba(c, o, t, k.m(k.voice + 1, 0), 0.06, 0.3); kalimba(c, o, t + 0.08, k.m(k.voice, 0), 0.065, 0.55); },
        (c, o, t, v, k) => { marimba(c, o, t, k.m(k.voice + 1, 0), 0.07); kalimba(c, o, t + 0.09, k.m(k.voice, 0), 0.06, 0.5); }
      ],
      /* save: a wooden stamp, then root, fifth and octave rising on marimba, and a tine that rings on */
      save: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.016, f: 1000, q: 5, gain: 0.1 }); marimba(c, o, t, k.m(0, -1), 0.08); [0, 2, 3].forEach((i, j) => marimba(c, o, t + 0.09 + j * 0.07, k.m(i, 1), 0.1)); kalimba(c, o, t + 0.32, k.m(4, 1), 0.06, 0.9); kalimba(c, o, t + 0.4, k.m(2, 2), 0.035, 0.7); },
      reveal: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.25, filter: 'lowpass', f: 600, f2: 2600, gain: 0.03 }); [0, 1, 2].forEach((i) => kalimba(c, o, t + 0.1 + i * 0.07, k.m(i, 2), 0.055, 0.5)); },
      sheet: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.12, filter: 'lowpass', f: 500, f2: 2200, gain: 0.03 }); marimba(c, o, t + 0.06, k.m(2, 1), 0.07); },
      unsheet: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.12, filter: 'lowpass', f: 2200, f2: 500, gain: 0.03 }); marimba(c, o, t + 0.02, k.m(0, 1), 0.05); },
      phase: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.015, f: 1500, q: 2, gain: 0.04 }); marimba(c, o, t, k.m(k.idx % 3, 2), 0.03); },
      found: (c, o, t, v, k) => { kalimba(c, o, t, k.m(0, 2), 0.07, 0.4); kalimba(c, o, t + 0.07, k.m(2, 2), 0.07, 0.5); },
      warn: (c, o, t) => { marimba(c, o, t, 62, 0.12); noise(c, o, t, { dur: 0.03, filter: 'lowpass', f: 700, gain: 0.04 }); },
      copy: (c, o, t, v, k) => { kalimba(c, o, t, k.m(1, 2), 0.055, 0.15); kalimba(c, o, t + 0.05, k.m(2, 2), 0.055, 0.2); },
      move: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.03, f: 1200, q: 1.5, gain: 0.02 }); kalimba(c, o, t, k.m(k.idx % 3, 2), 0.015, 0.15); },
        (c, o, t, v, k) => marimba(c, o, t, k.m(k.idx % 3, 2), 0.013),
        (c, o, t) => noise(c, o, t, { dur: 0.03, filter: 'lowpass', f: 1800, gain: 0.063 })
      ],
      callout: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.08, filter: 'lowpass', f: 900, f2: 2000, gain: 0.025 }); kalimba(c, o, t + 0.03, k.m(1, 2), 0.05, 0.45); },
        (c, o, t, v, k) => { marimba(c, o, t, k.m(2, 1), 0.07); kalimba(c, o, t + 0.06, k.m(4, 2), 0.04, 0.5); },
        (c, o, t, v, k) => { kalimba(c, o, t, k.m(0, 2), 0.05, 0.3); kalimba(c, o, t + 0.05, k.m(1, 2), 0.05, 0.45); }
      ],
      checkpoint: [
        (c, o, t, v, k) => { const j = k.n % 3; marimba(c, o, t, k.m(j, 1), 0.1); marimba(c, o, t + 0.07, k.m(j + 2, 1), 0.1); kalimba(c, o, t + 0.15, k.m(j + 4, 2), 0.05, 0.6); },
        (c, o, t, v, k) => { const j = k.n % 3; [0, 1, 2].forEach((i) => marimba(c, o, t + i * 0.05, k.m(j + i, 1), 0.09)); },
        (c, o, t, v, k) => { const j = k.n % 3; [0, 1, 2].forEach((i) => kalimba(c, o, t + i * 0.06, k.m(j + i, 2), 0.06, 0.5)); }
      ],
      pointer: [
        (c, o, t, v, k) => { const f = note(k.m(k.rot % 3, 0)); tone(c, o, t, { f, f2: f * 1.5, glide: 0.24, dur: 0.3, gain: 0.025, a: 0.05 }); noise(c, o, t, { dur: 0.22, filter: 'lowpass', f: 700, f2: 1500, gain: 0.012, a: 0.06 }); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.24, filter: 'lowpass', f: 600, f2: 1800, gain: 0.014, a: 0.06 }); kalimba(c, o, t + 0.16, k.m(k.rot % 3, 1), 0.026, 0.3); },
        (c, o, t, v, k) => { const f = note(k.m(k.rot % 3 + 1, 0)); tone(c, o, t, { f, f2: f * 1.335, glide: 0.2, dur: 0.26, gain: 0.028, a: 0.05, type: 'triangle' }); noise(c, o, t, { dur: 0.2, filter: 'lowpass', f: 800, f2: 1400, gain: 0.013, a: 0.05 }); }
      ],
      arrive: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.02, filter: 'lowpass', f: 1000, gain: 0.05 }); marimba(c, o, t, k.m(k.rot % 3, 1), 0.08); },
        (c, o, t, v, k) => { kalimba(c, o, t, k.m(k.rot % 3, 1), 0.08, 0.3); noise(c, o, t, { dur: 0.015, filter: 'lowpass', f: 1300, gain: 0.053 }); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, f: 1100, q: 5, gain: 0.08 }); marimba(c, o, t + 0.004, k.m(k.rot % 3 + 1, 1), 0.07); }
      ],
      missing: (c, o, t) => { marimba(c, o, t, 60, 0.1); tone(c, o, t + 0.12, { f: 520, f2: 660, glide: 0.12, dur: 0.16, gain: 0.035 }); },
      interrupt: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.04, filter: 'lowpass', f: 1000, f2: 400, gain: 0.04 }); tone(c, o, t, { f: note(k.m(0, 1)), dur: 0.08, gain: 0.05 }); }
    },
    glass: {
      tap: [
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.rot % 3, 2)) * v, ratio: 3.5, index: 1.5, dur: 0.16, gain: 0.035 }),
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.rot % 3 + 1, 2)) * v, ratio: 2.76, index: 1.2, dur: 0.12, gain: 0.032 }),
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(2, 2)) * v, ratio: 3.1, index: 0.9, dur: 0.2, gain: 0.026, send: reverb(c, o) }),
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.rot % 3, 2)) * v, ratio: 1.4, index: 1.8, dur: 0.14, gain: 0.032 })
      ],
      select: [
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.rot % 3, 1)) * v, ratio: 1.38 + R() * 0.05, index: 3, dur: 0.9, gain: 0.05, send: reverb(c, o) }),
        (c, o, t, v, k) => { const r = k.rot % 3; fm(c, o, t, { f: note(k.m(r, 1)) * v, ratio: 1.4, index: 2.6, dur: 0.8, gain: 0.038, send: reverb(c, o) }); fm(c, o, t + 0.012, { f: note(k.m(r + 2, 1)) * v, ratio: 1.4, index: 2.2, dur: 0.7, gain: 0.026, send: reverb(c, o) }); },
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.rot % 3 + 1, 1)) * v, ratio: 3.5, index: 2, dur: 0.7, gain: 0.045, send: reverb(c, o) }),
        (c, o, t, v, k) => { const r = k.rot % 3; fm(c, o, t, { f: note(k.m(r, 1)) * v, ratio: 1.4, index: 2.4, dur: 0.5, gain: 0.035 }); fm(c, o, t + 0.06, { f: note(k.m(r + 1, 1)) * v, ratio: 1.4, index: 2.4, dur: 0.8, gain: 0.035, send: reverb(c, o) }); }
      ],
      next: [
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.28, f: 900, f2: 4200, q: 1.4, gain: 0.03, send: reverb(c, o) }); [0, 1].forEach((i) => fm(c, o, t + 0.1 + i * 0.07, { f: note(k.m(b + i + 1, 1)), ratio: 1.4, index: 2.4, dur: 0.8, gain: 0.035, send: reverb(c, o) })); },
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.24, f: 900, f2: 4600, q: 1.4, gain: 0.028, send: reverb(c, o) }); [0, 1, 2].forEach((i) => fm(c, o, t + 0.08 + i * 0.05, { f: note(k.m(b + i, 1)), ratio: 1.4, index: 2.2, dur: 0.6, gain: 0.03, send: reverb(c, o) })); },
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.22, f: 1100, f2: 4200, q: 1.4, gain: 0.026, send: reverb(c, o) }); fm(c, o, t + 0.1, { f: note(k.m(b + 1, 1)), ratio: 1.4, index: 2.4, dur: 0.6, gain: 0.035, send: reverb(c, o) }); fm(c, o, t + 0.2, { f: note(k.m(b + 4, 1)), ratio: 1.4, index: 2, dur: 0.8, gain: 0.028, send: reverb(c, o) }); }
      ],
      back: [
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.24, f: 4200, f2: 900, q: 1.4, gain: 0.028, send: reverb(c, o) }); fm(c, o, t + 0.1, { f: note(k.m(b, 1)), ratio: 1.4, index: 2.4, dur: 0.7, gain: 0.035, send: reverb(c, o) }); },
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.2, f: 4000, f2: 1000, q: 1.4, gain: 0.026, send: reverb(c, o) }); fm(c, o, t + 0.06, { f: note(k.m(b + 2, 1)), ratio: 1.4, index: 2.2, dur: 0.4, gain: 0.03 }); fm(c, o, t + 0.13, { f: note(k.m(b, 1)), ratio: 1.4, index: 2.2, dur: 0.7, gain: 0.032, send: reverb(c, o) }); },
        (c, o, t, v, k) => { const b = k.n % 4; noise(c, o, t, { dur: 0.16, f: 3600, f2: 1100, q: 1.4, gain: 0.024 }); fm(c, o, t + 0.05, { f: note(k.m(b + 1, 0)), ratio: 1.4, index: 2, dur: 0.6, gain: 0.04, send: reverb(c, o) }); }
      ],
      toggleOn: [
        (c, o, t) => fm(c, o, t, { f: 1760, ratio: 2.76, index: 1.8, dur: 0.35, gain: 0.04, send: reverb(c, o) }),
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(1, 2)), ratio: 1.4, index: 2, dur: 0.3, gain: 0.035, send: reverb(c, o) }),
        (c, o, t) => { noise(c, o, t, { dur: 0.08, f: 4000, q: 6, gain: 0.03 }); fm(c, o, t, { f: 1568, ratio: 3.5, index: 1.2, dur: 0.25, gain: 0.03 }); }
      ],
      toggleOff: [
        (c, o, t) => fm(c, o, t, { f: 1320, ratio: 2.76, index: 1.2, dur: 0.3, gain: 0.03 }),
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(0, 1)), ratio: 2.76, index: 1, dur: 0.25, gain: 0.03 }),
        (c, o, t) => { noise(c, o, t, { dur: 0.08, f: 2500, q: 6, gain: 0.028 }); fm(c, o, t, { f: 1046, ratio: 3.5, index: 1, dur: 0.22, gain: 0.026 }); }
      ],
      success: (c, o, t) => { [88, 95, 100].forEach((m, i) => fm(c, o, t + i * 0.045, { f: note(m), ratio: 1.4, index: 2.6, dur: 1.2, gain: 0.035, send: reverb(c, o) })); },
      error: (c, o, t) => fm(c, o, t, { f: 220, ratio: 1.01, index: 1.2, dur: 0.35, gain: 0.06 }),
      commit: (c, o, t) => { noise(c, o, t, { dur: 0.6, f: 600, f2: 6000, q: 1.2, gain: 0.03, send: reverb(c, o) }); [81, 85, 88, 93].forEach((m, i) => fm(c, o, t + 0.25 + i * 0.07, { f: note(m), ratio: 1.4, index: 3, dur: 1.8, gain: 0.04, send: reverb(c, o) })); },
      open: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.3, f: 700, f2: 3000, q: 1.2, gain: 0.03, send: reverb(c, o) }); fm(c, o, t + 0.12, { f: note(k.m(0, 1)), ratio: 1.4, index: 2, dur: 0.9, gain: 0.026, send: reverb(c, o) }); fm(c, o, t + 0.2, { f: note(k.m(2, 1)), ratio: 1.4, index: 1.8, dur: 0.9, gain: 0.022, send: reverb(c, o) }); },
      close: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.25, f: 3000, f2: 700, q: 1.2, gain: 0.028, send: reverb(c, o) }); fm(c, o, t + 0.08, { f: note(k.m(0, 0)), ratio: 1.4, index: 1.8, dur: 0.6, gain: 0.026, send: reverb(c, o) }); },
      pickup: (c, o, t) => fm(c, o, t, { f: 1320, ratio: 2.1, index: 1.5, dur: 0.3, gain: 0.035 }),
      drop: (c, o, t) => fm(c, o, t, { f: 990, ratio: 1.4, index: 2.2, dur: 0.7, gain: 0.04, send: reverb(c, o) }),
      spot: (c, o, t) => noise(c, o, t, { dur: 0.22, f: 2500, f2: 5000, q: 2, gain: 0.015, send: reverb(c, o) }),
      step: [
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(4 + k.n % 3, 1)), ratio: 1.4, index: 2, dur: 0.6, gain: 0.035, send: reverb(c, o) }),
        (c, o, t, v, k) => { const j = k.n % 3; fm(c, o, t, { f: note(k.m(2 + j, 1)), ratio: 1.4, index: 2, dur: 0.4, gain: 0.03 }); fm(c, o, t + 0.07, { f: note(k.m(4 + j, 1)), ratio: 1.4, index: 2, dur: 0.6, gain: 0.03, send: reverb(c, o) }); },
        (c, o, t, v, k) => { const j = k.n % 3; noise(c, o, t, { dur: 0.16, f: 2400, f2: 4800, q: 2, gain: 0.012, send: reverb(c, o) }); fm(c, o, t + 0.04, { f: note(k.m(3 + j, 1)), ratio: 3.5, index: 1.6, dur: 0.6, gain: 0.032, send: reverb(c, o) }); }
      ],
      finish: (c, o, t) => { [81, 88, 93, 100].forEach((m, i) => fm(c, o, t + i * 0.08, { f: note(m), ratio: 1.4, index: 2.6, dur: 1.4, gain: 0.035, send: reverb(c, o) })); },
      cheer: (c, o, t, v, k) => { const f = note(k.m(3 + k.voice, 1)); fm(c, o, t, { f, ratio: 1.4, index: 2.2, dur: 0.7, gain: 0.03, send: reverb(c, o) }); fm(c, o, t + 0.05, { f: f * 1.5, ratio: 2.76, index: 1.4, dur: 0.6, gain: 0.02, send: reverb(c, o) }); },
      celebrate: (c, o, t, v, k) => {
        if (!k.layer) noise(c, o, t, { dur: 0.8, f: 800, f2: 7000, q: 1.1, gain: 0.025, send: reverb(c, o) });
        sparkle(c, o, t + 0.1, 1.5, k.layer ? 8 : 12, (at, i) => fm(c, panned(c, o), at, { f: note(k.m(3 + (i * 2) % 8, 1)), ratio: 1.4, index: 2.6, dur: 1.1, gain: 0.025, send: reverb(c, o) }));
      },
      type: [
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(Math.floor(R() * 3), 3)), ratio: 3.1, index: 0.8, dur: 0.05, gain: 0.012 }),
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(Math.floor(R() * 3), 2)), ratio: 2, index: 0.6, dur: 0.04, gain: 0.012 }),
        (c, o, t) => noise(c, o, t, { dur: 0.015, f: 5200 + R() * 800, q: 4, gain: 0.055 })
      ],
      /* an airy rise and the chord on FM bells, then the motif in fifths; at the resolution a long bell tail rings out
         through the room */
      chapter: (c, o, t, v, k) => {
        const d = k.depth, rv = reverb(c, o);
        noise(c, o, t, { dur: 0.4, f: 900, f2: 5000, q: 1.3, gain: 0.028, send: rv });
        [0, 1, 2].forEach((i) => fm(c, o, t + 0.1 + i * 0.06, { f: note(k.m(i, -1)), ratio: 1.4, index: 2.2, dur: d ? 0.9 : 1.2, gain: 0.027, send: rv }));
        if (!d) fm(c, o, t + 0.3, { f: note(k.m(3, -1)), ratio: 1.4, index: 2.4, dur: 1.1, gain: 0.03, send: rv });
        motifRun(k, t + 0.24, 0.14, (at, i, last) => fm(c, o, at, { f: note(k.motif(i, 0)), ratio: 1.4, index: 2.6, dur: last ? 1.3 : 0.7, gain: 0.03, send: rv }));
        if (d >= 4) { const at = t + 0.74; bell(c, o, at, note(k.motif(3, 0)), 2.4, 0.016, rv); fm(c, o, at + 0.05, { f: note(k.motif(1, 1)), ratio: 3.5, index: 0.8, dur: 1.4, gain: 0.008, send: rv }); }
      },
      /* string: a glass-harmonica tick (FM, ratio 3.5) with a little room */
      string: [
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.voice + k.climb, 0)), ratio: 3.5, index: 1.2, dur: 0.22, gain: 0.03, send: reverb(c, o) }),
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.voice + k.climb, 0)), ratio: 2.76, index: 0.9, dur: 0.18, gain: 0.032, send: reverb(c, o) }),
        (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, 0)); fm(c, o, t, { f, ratio: 3.5, index: 1, dur: 0.24, gain: 0.026, send: reverb(c, o) }); tone(c, o, t, { f: f * 2 < PARTIAL_MAX ? f * 2 : f, dur: 0.06, gain: 0.006 }); }
      ],
      /* land: a crystal tink with its 3.1x partial, on a soft low contact */
      land: [
        (c, o, t, v, k) => { const f = note(k.m(k.voice, 1)); noise(c, o, t, { dur: 0.02, filter: 'lowpass', f: 400, gain: 0.06 }); tone(c, o, t, { f, dur: 0.2, gain: 0.03, send: reverb(c, o) }); if (f * 3.1 < PARTIAL_MAX) tone(c, o, t, { f: f * 3.1, dur: 0.06, gain: 0.01 }); },
        (c, o, t, v, k) => { const f = note(k.m(k.voice, 2)); noise(c, o, t, { dur: 0.018, filter: 'lowpass', f: 500, gain: 0.05 }); tone(c, o, t, { f, dur: 0.16, gain: 0.026, send: reverb(c, o) }); tone(c, o, t + 0.003, { f: f / 2, dur: 0.08, gain: 0.01 }); }
      ],
      /* bow: a falling bell pair with its tail in the room */
      bow: [
        (c, o, t, v, k) => { const rv = reverb(c, o); bell(c, o, t, note(k.m(k.voice + 1, 0)), 0.5, 0.03, rv); bell(c, o, t + 0.09, note(k.m(k.voice, 0)), 0.9, 0.032, rv); },
        (c, o, t, v, k) => { fm(c, o, t, { f: note(k.m(k.voice + 1, 0)), ratio: 1.4, index: 1.8, dur: 0.4, gain: 0.028 }); fm(c, o, t + 0.1, { f: note(k.m(k.voice, 0)), ratio: 1.4, index: 2, dur: 0.8, gain: 0.03, send: reverb(c, o) }); }
      ],
      /* save: a glass seal (a short rise into the room), root and fifth bells and a high tink */
      save: (c, o, t, v, k) => { const rv = reverb(c, o); noise(c, o, t, { dur: 0.18, f: 1200, f2: 4800, q: 1.6, gain: 0.02, send: rv }); fm(c, o, t + 0.08, { f: note(k.m(0, 0)), ratio: 1.4, index: 2.4, dur: 0.9, gain: 0.032, send: rv }); fm(c, o, t + 0.15, { f: note(k.m(2, 0)), ratio: 1.4, index: 2.2, dur: 1, gain: 0.03, send: rv }); fm(c, o, t + 0.24, { f: note(k.m(3, 1)), ratio: 3.5, index: 0.9, dur: 0.6, gain: 0.014, send: rv }); },
      reveal: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.5, f: 700, f2: 5000, q: 1.2, gain: 0.026, send: reverb(c, o) }); [2, 3, 4].forEach((i, j) => fm(c, o, t + 0.2 + j * 0.08, { f: note(k.m(i, 1)), ratio: 3.5, index: 1.4, dur: 0.6, gain: 0.025, send: reverb(c, o) })); },
      sheet: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.18, f: 1200, f2: 3600, q: 1.4, gain: 0.022, send: reverb(c, o) }); fm(c, o, t + 0.08, { f: note(k.m(2, 1)), ratio: 1.4, index: 2, dur: 0.4, gain: 0.025 }); },
      unsheet: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.16, f: 3600, f2: 1200, q: 1.4, gain: 0.024, send: reverb(c, o) }); fm(c, o, t + 0.05, { f: note(k.m(0, 1)), ratio: 1.4, index: 1.6, dur: 0.35, gain: 0.02 }); },
      phase: (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.idx % 3, 2)), ratio: 3.5, index: 0.8, dur: 0.08, gain: 0.022 }),
      found: (c, o, t, v, k) => { fm(c, o, t, { f: note(k.m(0, 1)), ratio: 1.4, index: 2.4, dur: 0.9, gain: 0.03, send: reverb(c, o) }); fm(c, o, t + 0.07, { f: note(k.m(2, 1)), ratio: 1.4, index: 2.4, dur: 0.9, gain: 0.03, send: reverb(c, o) }); },
      warn: (c, o, t) => fm(c, o, t, { f: 247, ratio: 1.01, index: 1, dur: 0.25, gain: 0.05 }),
      copy: (c, o, t, v, k) => { fm(c, o, t, { f: note(k.m(1, 2)), ratio: 3.5, index: 1, dur: 0.06, gain: 0.025 }); fm(c, o, t + 0.05, { f: note(k.m(2, 2)), ratio: 3.5, index: 1, dur: 0.08, gain: 0.025 }); },
      move: [
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.idx % 3, 2)), ratio: 3.1, index: 0.7, dur: 0.08, gain: 0.0126 }),
        (c, o, t) => noise(c, o, t, { dur: 0.08, f: 3000, f2: 4500, q: 2, gain: 0.057, send: reverb(c, o) }),
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.idx % 3 + 1, 2)), ratio: 2.76, index: 0.6, dur: 0.06, gain: 0.014 })
      ],
      callout: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.2, f: 1200, f2: 3600, q: 1.4, gain: 0.018, send: reverb(c, o) }); fm(c, o, t + 0.08, { f: note(k.m(1, 1)), ratio: 1.4, index: 2, dur: 0.5, gain: 0.028, send: reverb(c, o) }); },
        (c, o, t, v, k) => { fm(c, o, t, { f: note(k.m(2, 1)), ratio: 1.4, index: 2, dur: 0.4, gain: 0.026 }); fm(c, o, t + 0.06, { f: note(k.m(4, 1)), ratio: 1.4, index: 2, dur: 0.5, gain: 0.024, send: reverb(c, o) }); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.14, f: 3000, f2: 5000, q: 2, gain: 0.012, send: reverb(c, o) }); fm(c, o, t + 0.05, { f: note(k.m(1, 2)), ratio: 3.5, index: 1.2, dur: 0.45, gain: 0.024, send: reverb(c, o) }); }
      ],
      checkpoint: [
        (c, o, t, v, k) => { const j = k.n % 3; fm(c, o, t, { f: note(k.m(j, 1)), ratio: 1.4, index: 2.4, dur: 0.6, gain: 0.032 }); fm(c, o, t + 0.07, { f: note(k.m(j + 2, 1)), ratio: 1.4, index: 2.4, dur: 0.9, gain: 0.032, send: reverb(c, o) }); },
        (c, o, t, v, k) => { const j = k.n % 3; [0, 1, 2].forEach((i) => fm(c, o, t + i * 0.05, { f: note(k.m(j + i, 1)), ratio: 1.4, index: 2.2, dur: 0.7, gain: 0.028, send: reverb(c, o) })); },
        (c, o, t, v, k) => { const j = k.n % 3; noise(c, o, t, { dur: 0.2, f: 1800, f2: 4400, q: 1.6, gain: 0.014, send: reverb(c, o) }); fm(c, o, t + 0.06, { f: note(k.m(j + 3, 1)), ratio: 1.4, index: 2.6, dur: 0.9, gain: 0.032, send: reverb(c, o) }); }
      ],
      pointer: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.3, f: 600, f2: 2400, q: 1.2, gain: 0.012, a: 0.06, send: reverb(c, o) }); fm(c, o, t + 0.12, { f: note(k.m(k.rot % 3, 1)), ratio: 1.4, index: 1.4, dur: 0.4, gain: 0.014 }); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.26, f: 800, f2: 3000, q: 1.4, gain: 0.011, a: 0.05, send: reverb(c, o) }); fm(c, o, t + 0.1, { f: note(k.m(k.rot % 3 + 1, 1)), ratio: 3.5, index: 0.9, dur: 0.35, gain: 0.012, send: reverb(c, o) }); },
        (c, o, t, v, k) => { fm(c, o, t, { f: note(k.m(k.rot % 3, 0)), ratio: 2.76, index: 0.8, dur: 0.3, gain: 0.011 }); fm(c, o, t + 0.09, { f: note(k.m(k.rot % 3 + 2, 0)), ratio: 1.4, index: 1.2, dur: 0.4, gain: 0.012, send: reverb(c, o) }); noise(c, o, t, { dur: 0.22, f: 1000, f2: 2600, q: 1.2, gain: 0.008, a: 0.05 }); }
      ],
      arrive: [
        (c, o, t, v, k) => fm(c, o, t, { f: note(k.m(k.rot % 3, 1)), ratio: 1.4, index: 2, dur: 0.5, gain: 0.032, send: reverb(c, o) }),
        (c, o, t, v, k) => { fm(c, o, t, { f: note(k.m(k.rot % 3, 2)), ratio: 3.5, index: 1, dur: 0.25, gain: 0.022 }); fm(c, o, t + 0.02, { f: note(k.m(k.rot % 3, 1)), ratio: 1.4, index: 1.6, dur: 0.4, gain: 0.02, send: reverb(c, o) }); },
        (c, o, t, v, k) => { const f = note(k.m(k.rot % 3 + 1, 1)); tone(c, o, t, { f, dur: 0.3, gain: 0.028, send: reverb(c, o) }); tone(c, o, t, { f: f * 3.1 < PARTIAL_MAX ? f * 3.1 : f * 2, dur: 0.08, gain: 0.008 }); }
      ],
      missing: (c, o, t, v, k) => { fm(c, o, t, { f: 220, ratio: 1.01, index: 1.2, dur: 0.25, gain: 0.05 }); fm(c, o, t + 0.15, { f: note(k.m(1, 1)), ratio: 1.4, index: 1.6, dur: 0.4, gain: 0.02, send: reverb(c, o) }); },
      interrupt: (c, o, t) => { fm(c, o, t, { f: 1320, ratio: 2.76, index: 1.2, dur: 0.18, gain: 0.025 }); noise(c, o, t, { dur: 0.14, f: 3000, f2: 900, q: 1.4, gain: 0.018 }); }
    },
    retro: {
      tap: [
        (c, o, t, v, k) => chip(c, o, t, k.m(k.rot % 3, 1), 0.03, 0.05),
        (c, o, t, v, k) => chip(c, o, t, k.m(k.rot % 3 + 1, 1), 0.025, 0.045, null, pulse12),
        (c, o, t, v, k) => chip(c, o, t, k.m(k.rot % 3, 1), 0.035, 0.045, k.m(k.rot % 3, 1) + 2),
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, filter: 'highpass', f: 6000, gain: 0.02 }); chip(c, o, t, k.m(k.rot % 3, 2), 0.018, 0.02); }
      ],
      select: [
        (c, o, t, v, k) => { const r = k.rot % 3; chip(c, o, t, k.m(r, 1), 0.045, 0.05); chip(c, o, t + 0.045, k.m(r + 2, 1), 0.07, 0.05); },
        (c, o, t, v, k) => { const r = k.rot % 3; [0, 1, 2].forEach((i) => chip(c, o, t + i * 0.03, k.m(r + i, 1), i === 2 ? 0.06 : 0.03, 0.045)); },
        (c, o, t, v, k) => { const r = k.rot % 3; chip(c, o, t, k.m(r, 1), 0.04, 0.04, null, pulse12); chip(c, o, t + 0.04, k.m(r + 3, 1), 0.08, 0.04, null, pulse12); },
        (c, o, t, v, k) => { const r = k.rot % 3; chip(c, o, t, k.m(r, 1), 0.07, 0.05, k.m(r + 1, 1)); }
      ],
      next: [
        (c, o, t, v, k) => { const b = k.n % 4; [0, 1, 2].forEach((i) => chip(c, o, t + i * 0.04, k.m(b + i, 0), 0.045, 0.05)); },
        (c, o, t, v, k) => { const b = k.n % 4; [0, 1, 2, 3].forEach((i) => chip(c, o, t + i * 0.03, k.m(b + i, 0), i === 3 ? 0.07 : 0.03, 0.045)); },
        (c, o, t, v, k) => { const b = k.n % 4; chip(c, o, t, k.m(b, 0), 0.06, 0.05, k.m(b + 2, 0)); chip(c, o, t + 0.07, k.m(b + 3, 0), 0.08, 0.05); }
      ],
      back: [
        (c, o, t, v, k) => { const b = k.n % 4; [2, 1, 0].forEach((i, j) => chip(c, o, t + j * 0.04, k.m(b + i, 0), 0.045, 0.045)); },
        (c, o, t, v, k) => { const b = k.n % 4; chip(c, o, t, k.m(b + 2, 0), 0.09, 0.045, k.m(b, 0)); },
        (c, o, t, v, k) => { const b = k.n % 4; chip(c, o, t, k.m(b + 1, 0), 0.04, 0.04, null, pulse12); chip(c, o, t + 0.045, k.m(b, 0), 0.07, 0.04, null, pulse12); }
      ],
      toggleOn: [
        (c, o, t) => tone(c, o, t, { f: 440, type: 'triangle', dur: 0.05, gain: 0.08 }),
        (c, o, t, v, k) => { chip(c, o, t, k.m(0, 1), 0.03, 0.08); chip(c, o, t + 0.03, k.m(1, 1), 0.04, 0.08); },
        (c, o, t, v, k) => chip(c, o, t, k.m(2, 1), 0.04, 0.085, null, pulse12)
      ],
      toggleOff: [
        (c, o, t) => tone(c, o, t, { f: 330, type: 'triangle', dur: 0.05, gain: 0.07 }),
        (c, o, t, v, k) => { chip(c, o, t, k.m(1, 1), 0.03, 0.08); chip(c, o, t + 0.03, k.m(0, 1), 0.04, 0.08); },
        (c, o, t, v, k) => chip(c, o, t, k.m(0, 0), 0.04, 0.085, null, pulse12)
      ],
      success: (c, o, t) => { chip(c, o, t, 83, 0.06, 0.05); chip(c, o, t + 0.06, 88, 0.26, 0.05); },
      error: (c, o, t) => chip(c, o, t, 57, 0.18, 0.06, 45),
      commit: (c, o, t) => { [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => chip(c, o, t + i * 0.05, m, 0.05, 0.045)); tone(c, o, t, { f: note(48), type: 'triangle', dur: 0.4, gain: 0.09 }); chip(c, o, t + 0.38, 88, 0.3, 0.04); },
      open: (c, o, t) => chip(c, o, t, 64, 0.12, 0.04, 76),
      close: (c, o, t) => chip(c, o, t, 76, 0.1, 0.035, 64),
      pickup: (c, o, t) => chip(c, o, t, 72, 0.05, 0.05, 79),
      drop: (c, o, t) => { chip(c, o, t, 79, 0.05, 0.05, 72); tone(c, o, t + 0.05, { f: note(48), type: 'triangle', dur: 0.08, gain: 0.08 }); },
      spot: (c, o, t) => chip(c, o, t, 96, 0.025, 0.02),
      step: [
        (c, o, t, v, k) => { const j = k.n % 3; chip(c, o, t, k.m(2 + j, 1), 0.05, 0.045); chip(c, o, t + 0.05, k.m(4 + j, 1), 0.1, 0.045); },
        (c, o, t, v, k) => { const j = k.n % 3; chip(c, o, t, k.m(1 + j, 1), 0.04, 0.045); chip(c, o, t + 0.04, k.m(3 + j, 1), 0.14, 0.045); },
        (c, o, t, v, k) => { const j = k.n % 3; [0, 1, 2].forEach((i) => chip(c, o, t + i * 0.03, k.m(2 + j + i, 1), 0.03, 0.063, null, pulse12)); }
      ],
      finish: (c, o, t) => { [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => chip(c, o, t + i * 0.045, m, 0.05, 0.04)); },
      cheer: (c, o, t, v, k) => { chip(c, o, t, k.m(3 + k.voice, 1), 0.05, 0.045); chip(c, o, t + 0.05, k.m(5 + k.voice, 1), 0.11, 0.045); },
      celebrate: (c, o, t, v, k) => {
        if (!k.layer) { [0, 1, 2, 3, 4, 5, 6].forEach((i) => chip(c, o, t + i * 0.045, k.m(i, 0), 0.05, 0.045)); tone(c, o, t, { f: note(k.m(0, -2)), type: 'triangle', dur: 0.5, gain: 0.09 }); }
        sparkle(c, o, t + (k.layer ? 0.1 : 0.35), 1, 10, (at, i) => { const p = panned(c, o); if (i % 2) chip(c, p, at, k.m(4 + (i % 3), 1), 0.03, 0.03); else noise(c, p, at, { dur: 0.04, filter: 'highpass', f: 5000, gain: 0.03 }); });
      },
      type: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, filter: 'highpass', f: 4000, gain: 0.0225 }); chip(c, o, t, k.m(Math.floor(R() * 3), 2), 0.018, 0.015); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.01, filter: 'highpass', f: 5000, gain: 0.026 }); chip(c, o, t, k.m(Math.floor(R() * 3), 1), 0.014, 0.018, null, pulse12); },
        (c, o, t, v, k) => chip(c, o, t, k.m(Math.floor(R() * 3), 2), 0.012, 0.05)
      ],
      /* a triangle bass and the chord in chips, then the motif; at the resolution a level-clear arpeggio runs up */
      chapter: (c, o, t, v, k) => {
        const d = k.depth; o = stingOut(c, o, k);
        tone(c, o, t, { f: note(k.m(0, -2)), type: 'triangle', dur: 0.4, gain: 0.08 });
        [0, 1, 2].forEach((i) => chip(c, o, t + i * 0.045, k.m(i, -1), 0.04, 0.045));
        if (!d) chip(c, o, t + 0.16, k.m(3, -1), 0.2, 0.03);
        motifRun(k, t + 0.16, 0.09, (at, i, last) => chip(c, o, at, k.motif(i, 0), last ? 0.22 : 0.07, 0.05));
        if (d >= 4) { const at = t + 0.67; for (let i = 0; i < 8; i++) chip(c, o, at + i * 0.028, k.m(i, -1), 0.026, 0.042, null, pulse12); chip(c, o, at + 0.224, k.m(0, 1), 0.18, 0.046); tone(c, o, at, { f: note(k.m(0, -2)), type: 'triangle', dur: 0.3, gain: 0.06 }); }
      },
      /* string: a 12.5% pulse boing that drops an octave in held steps */
      string: [
        (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, 0)); chipSteps(c, o, t, [0, 1, 2, 3, 4].map((i) => f * Math.pow(2, -i / 4)), 0.016, 0.05, pulse12); },
        (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, 0)); chipSteps(c, o, t, [f, f * 0.75, f * 0.5], 0.022, 0.048, pulse25); },
        (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, 0)); chipSteps(c, o, t, [f * 0.5, f, f * 0.84, f * 0.71, f * 0.5], 0.015, 0.045, pulse12); }
      ],
      /* land: a noise-channel thud, two held noise frames on a square note */
      land: [
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.02, filter: 'lowpass', f: 1400, gain: 0.08 }); noise(c, o, t + 0.02, { dur: 0.02, filter: 'lowpass', f: 600, gain: 0.07 }); chip(c, o, t, k.m(k.voice, -2), 0.04, 0.06, null, square); },
        (c, o, t, v, k) => { const f = note(k.m(k.voice, -2)); tone(c, o, t, { f: f * 1.3, f2: f, glide: 0.03, dur: 0.06, type: 'triangle', gain: 0.034 }); noise(c, o, t, { dur: 0.02, filter: 'lowpass', f: 1100, gain: 0.024 }); }
      ],
      /* bow: a falling chip pair onto the helper's chord tone */
      bow: [
        (c, o, t, v, k) => { chip(c, o, t, k.m(k.voice + 1, 0), 0.05, 0.07); chip(c, o, t + 0.06, k.m(k.voice, 0), 0.12, 0.07); },
        (c, o, t, v, k) => { chip(c, o, t, k.m(k.voice + 1, 0), 0.04, 0.042, null, pulse12); chip(c, o, t + 0.05, k.m(k.voice, 0), 0.12, 0.042, null, pulse12); tone(c, o, t + 0.05, { f: note(k.m(k.voice, -2)), type: 'triangle', dur: 0.1, gain: 0.05 }); }
      ],
      /* save: the save-point jingle: a stamp (thump and a noise frame), a quick run up the chord and a held octave */
      save: (c, o, t, v, k) => { tone(c, o, t, { f: note(k.m(0, -2)), type: 'triangle', dur: 0.08, gain: 0.08 }); noise(c, o, t, { dur: 0.02, filter: 'highpass', f: 4000, gain: 0.02 }); [0, 1, 2].forEach((i) => chip(c, o, t + 0.06 + i * 0.035, k.m(i, 0), 0.03, 0.045, null, pulse12)); chip(c, o, t + 0.165, k.m(3, 0), 0.24, 0.045); },
      reveal: (c, o, t, v, k) => { chip(c, o, t, k.m(0, 0), 0.2, 0.035, k.m(0, 1)); [2, 3, 4].forEach((i, j) => chip(c, o, t + 0.2 + j * 0.04, k.m(i, 1), 0.03, 0.03)); },
      sheet: (c, o, t, v, k) => chip(c, o, t, k.m(0, 0), 0.08, 0.04, k.m(2, 0)),
      unsheet: (c, o, t, v, k) => chip(c, o, t, k.m(2, 0), 0.08, 0.035, k.m(0, 0)),
      phase: (c, o, t, v, k) => chip(c, o, t, k.m(k.idx % 3, 1), 0.02, 0.035),
      found: (c, o, t, v, k) => { chip(c, o, t, k.m(0, 1), 0.04, 0.045); chip(c, o, t + 0.04, k.m(2, 1), 0.1, 0.045); },
      warn: (c, o, t) => chip(c, o, t, 57, 0.12, 0.05, 50),
      copy: (c, o, t, v, k) => { chip(c, o, t, k.m(1, 1), 0.02, 0.04); chip(c, o, t + 0.04, k.m(1, 1), 0.025, 0.04); },
      move: [
        (c, o, t, v, k) => chip(c, o, t, k.m(k.idx % 3, 2), 0.012, 0.035, null, pulse12),
        (c, o, t) => noise(c, o, t, { dur: 0.008, filter: 'highpass', f: 5000, gain: 0.013 }),
        (c, o, t, v, k) => chip(c, o, t, k.m(k.idx % 3 + 1, 1), 0.012, 0.03)
      ],
      callout: [
        (c, o, t, v, k) => { chip(c, o, t, k.m(0, 1), 0.05, 0.04, k.m(1, 1)); noise(c, o, t, { dur: 0.01, filter: 'highpass', f: 5000, gain: 0.02 }); },
        (c, o, t, v, k) => { chip(c, o, t, k.m(1, 1), 0.025, 0.053); chip(c, o, t + 0.04, k.m(2, 1), 0.04, 0.053); },
        (c, o, t, v, k) => { [0, 1, 2].forEach((i) => chip(c, o, t + i * 0.022, k.m(i, 1), 0.02, 0.066, null, pulse12)); }
      ],
      checkpoint: [
        (c, o, t, v, k) => { const j = k.n % 3; chip(c, o, t, k.m(j + 1, 1), 0.04, 0.045); chip(c, o, t + 0.04, k.m(j + 3, 1), 0.16, 0.045); },
        (c, o, t, v, k) => { const j = k.n % 3; [0, 1, 2].forEach((i) => chip(c, o, t + i * 0.04, k.m(j + i, 1), i === 2 ? 0.12 : 0.04, 0.045)); },
        (c, o, t, v, k) => { const j = k.n % 3; chip(c, o, t, k.m(j, 1), 0.05, 0.045); chip(c, o, t + 0.05, k.m(j + 2, 1), 0.1, 0.04); tone(c, o, t, { f: note(k.m(0, -1)), type: 'triangle', dur: 0.12, gain: 0.035 }); }
      ],
      pointer: [
        (c, o, t, v, k) => chip(c, o, t, k.m(k.rot % 3, 0), 0.2, 0.025, k.m(k.rot % 3 + 2, 0)),
        (c, o, t, v, k) => chipSteps(c, o, t, [0, 1, 2].map((i) => note(k.m(k.rot % 3 + i, 0))), 0.05, 0.0113, pulse25),
        (c, o, t, v, k) => chip(c, o, t, k.m(k.rot % 3 + 1, 0), 0.18, 0.0215, k.m(k.rot % 3 + 3, 0), pulse12)
      ],
      arrive: [
        (c, o, t, v, k) => { chip(c, o, t, k.m(k.rot % 3, 1), 0.04, 0.045); tone(c, o, t, { f: note(48), type: 'triangle', dur: 0.06, gain: 0.07 }); },
        (c, o, t, v, k) => { chip(c, o, t, k.m(k.rot % 3, 1), 0.025, 0.1, null, pulse12); chip(c, o, t + 0.03, k.m(k.rot % 3 + 1, 1), 0.04, 0.1, null, pulse12); },
        (c, o, t, v, k) => { noise(c, o, t, { dur: 0.012, filter: 'highpass', f: 5000, gain: 0.025 }); chip(c, o, t, k.m(k.rot % 3 + 2, 1), 0.05, 0.045); tone(c, o, t, { f: note(k.m(0, -2)), type: 'triangle', dur: 0.05, gain: 0.06 }); }
      ],
      missing: (c, o, t, v, k) => { chip(c, o, t, 57, 0.08, 0.05); chip(c, o, t + 0.1, k.m(1, 0), 0.1, 0.04, k.m(2, 0)); },
      interrupt: (c, o, t, v, k) => chip(c, o, t, k.m(2, 0), 0.06, 0.04, k.m(0, 0))
    }
  };

  /* ---- the NieR kit. Menu ticks are short sines on the mode's notes (2640 Hz is the Menu sounds tick), choices are
     triangle two-tones, refusals a low buzz, the Pod speaks in tiny vowel bleeps that bend, data chatters in fast quiet
     ticks, and the big moments are a soft choir with bells. Variant 1 of tap, select, back and pod is the matching
     Menu sounds blip of kit.d/19-nier-parts.js (same notes and envelope), so the app and its setup sound alike. ---- */
  const TICK = [2640, 2960, 2349, 2093]; /* E7 (the menu tick), F#7, D7, C7: notes of A Dorian */
  const podF = (m) => { let x = m; while (x > 79) x -= 12; return note(x); }; /* the Pod's voice stays under G5 */
  function podSay(c, o, t, syl, gain) {
    syl.forEach(([dt, f, bend, dur, vowel]) => {
      const f2 = f * Math.pow(2, bend / 12);
      formant(c, o, t + dt, { f, f2, glide: dur, dur, gain, vowel, a: 0.006 });
      tone(c, o, t + dt, { f: f * 2, f2: f2 * 2, glide: dur, dur: dur * 0.8, gain: gain * 0.07, a: 0.004 });
    });
  }
  function chatter(c, o, t, n, gap, g) {
    for (let i = 0; i < n; i++) {
      const at = t + i * gap + R() * gap * 0.3, lv = g * (1 - i / (n + 3));
      if (R() < 0.35) noise(c, o, at, { dur: 0.005, f: 3600 + R() * 2000, q: 3, gain: lv * 1.6, a: 0.0006 });
      else nb(c, o, at, TICK[Math.floor(R() * 4)] * (0.98 + R() * 0.04), 0.008 + R() * 0.004, lv);
    }
  }
  const POD = 0.32; /* the Pod's bleep level */
  /* the glitch's tear: five square buzz bursts of random pitch and colour, and a hiss */
  function tear(c, o, t, g) { [0, 1, 2, 3, 4].forEach((i) => buzz(c, o, t + i * 0.028 + R() * 0.006, { f: 98 + R() * 220, dur: 0.016, gain: g, bp: 900 + R() * 1400, lp: 2600, am: 0, type: 'square', a: 0.002 })); noise(c, o, t + 0.02, { dur: 0.06, filter: 'highpass', f: 3200, gain: g * 0.31 }); }
  /* a log line's stamp ("OK"): a key strike, a low thunk and the menu tick */
  function nstamp(c, o, t, g) { nchk(c, o, t, 0.03 * g); nb(c, o, t, 660, 0.035, 0.05 * g, 'triangle'); nb(c, o, t + 0.012, 2640, 0.012, 0.016 * g); }
  /* the visors' ticks as the units power down one by one, falling */
  const VISOR = [2640, 2349, 2093];
  /* the plate's six growth steps climb A Dorian to the A above (C7 D7 E7 F#7 G7 A7) */
  const GROW = [2093, 2349, 2640, 2960, 3136, 3520];
  /* the NieR quest's ending: the motif to its depth (the last note a bell), or one high bell with none */
  function questTop(c, o, t, k, top) {
    if (!k.depth) { bell(c, o, t, note(top), 0.9, 0.019); return; }
    motifRun(k, t, 0.11, (at, i, last) => { const f = note(k.motif(i, 0)); if (last) bell(c, o, at, f, 0.9, 0.021); else nb(c, o, at, f, 0.08, 0.03, 'triangle'); });
  }
  KITS.nier = {
    hover: [
      (c, o, t) => nb(c, o, t, 2640, 0.026, 0.025),
      (c, o, t) => nb(c, o, t, 2960, 0.02, 0.026),
      (c, o, t) => nb(c, o, t, 2349, 0.024, 0.031, 'triangle')
    ],
    tap: [
      (c, o, t) => nb(c, o, t, 2640, 0.026, 0.045),
      (c, o, t, v) => { nchk(c, o, t, 0.03); nb(c, o, t, 2960 * v, 0.022, 0.04); },
      (c, o, t, v) => { nchk(c, o, t, 0.028); nb(c, o, t, 2349 * v, 0.03, 0.045, 'triangle'); },
      (c, o, t, v, k) => { nb(c, o, t, note(k.m(k.rot % 4, 2)) * v, 0.024, 0.04); nb(c, o, t + 0.016, 2640 * v, 0.014, 0.018); }
    ],
    select: [
      (c, o, t) => { nb(c, o, t, 1480, 0.05, 0.065, 'triangle'); nb(c, o, t + 0.038, 2220, 0.07, 0.05); },
      (c, o, t, v, k) => { const f = note(k.m(k.rot % 4, 1)) * v; nb(c, o, t, f, 0.05, 0.065, 'triangle'); nb(c, o, t + 0.038, f * 1.5, 0.07, 0.05); },
      (c, o, t, v, k) => { const r = k.rot % 4; nb(c, o, t, note(k.m(r, 1)) * v, 0.04, 0.08, 'triangle'); nb(c, o, t + 0.032, note(k.m(r + 1, 1)) * v, 0.05, 0.066, 'triangle'); nb(c, o, t + 0.07, 2640, 0.018, 0.026); },
      (c, o, t, v, k) => { const r = k.rot % 4; nb(c, o, t, note(k.m(r + 2, 1)) * v, 0.05, 0.055, 'triangle'); nb(c, o, t + 0.042, note(k.m(r, 2)) * v, 0.08, 0.04); }
    ],
    next: [
      (c, o, t, v, k) => { const f = note(k.m(k.n % 4, 1)) * v; nb(c, o, t, f, 0.08, 0.07, 'triangle'); nb(c, o, t + 0.07, f * 1.5, 0.17, 0.07, 'triangle'); },
      (c, o, t, v, k) => { const f = note(k.m(k.n % 4, 1)) * v; nb(c, o, t, 2640, 0.016, 0.022); nb(c, o, t + 0.02, f, 0.07, 0.065, 'triangle'); nb(c, o, t + 0.08, f * 4 / 3, 0.18, 0.065, 'triangle'); },
      (c, o, t, v, k) => { const b = k.n % 4; nb(c, o, t, note(k.m(b, 1)) * v, 0.06, 0.06, 'triangle'); nb(c, o, t + 0.055, note(k.m(b + 2, 1)) * v, 0.07, 0.06, 'triangle'); nb(c, o, t + 0.11, note(k.m(b + 4, 1)) * v, 0.2, 0.045); }
    ],
    back: [
      (c, o, t, v) => { const lo = lpOut(c, o, 2400); nb(c, lo, t, 1318 * v, 0.07, 0.065, 'triangle'); nb(c, lo, t + 0.06, 880 * v, 0.16, 0.065, 'triangle'); },
      (c, o, t, v, k) => { const lo = lpOut(c, o, 2000), b = k.n % 4; nb(c, lo, t, note(k.m(b + 2, 1)) * v, 0.07, 0.065, 'triangle'); nb(c, lo, t + 0.06, note(k.m(b, 1)) * v, 0.16, 0.065, 'triangle'); },
      (c, o, t, v, k) => { const lo = lpOut(c, o, 1800), f = note(k.m(k.n % 4 + 1, 1)) * v; nb(c, lo, t, f, 0.13, 0.07, 'triangle', f * 0.84); nb(c, o, t + 0.12, 1318, 0.012, 0.014); }
    ],
    toggleOn: [
      (c, o, t, v, k) => { const lo = lpOut(c, o, 2600); nb(c, lo, t, note(k.m(0, 1)) * v, 0.03, 0.05, 'square'); nb(c, lo, t + 0.035, note(k.m(2, 1)) * v, 0.05, 0.05, 'square'); },
      (c, o, t, v, k) => { [0, 1, 2].forEach((i) => nb(c, o, t + i * 0.026, note(k.m(i, 1)) * v, 0.03, 0.08, 'triangle')); },
      (c, o, t, v, k) => { const lo = lpOut(c, o, 2400); nb(c, o, t, 2640, 0.014, 0.02); nb(c, lo, t + 0.02, note(k.m(1, 1)) * v, 0.03, 0.05, 'square'); nb(c, lo, t + 0.05, note(k.m(3, 1)) * v, 0.05, 0.045, 'square'); }
    ],
    toggleOff: [
      (c, o, t, v, k) => { const lo = lpOut(c, o, 2200); nb(c, lo, t, note(k.m(2, 1)) * v, 0.03, 0.045, 'square'); nb(c, lo, t + 0.035, note(k.m(0, 1)) * v, 0.05, 0.045, 'square'); },
      (c, o, t, v, k) => { [2, 1, 0].forEach((i, j) => nb(c, o, t + j * 0.026, note(k.m(i, 1)) * v, 0.03, 0.045, 'triangle')); },
      (c, o, t, v, k) => { const lo = lpOut(c, o, 2000); nb(c, lo, t, note(k.m(3, 1)) * v, 0.03, 0.045, 'square'); nb(c, lo, t + 0.03, note(k.m(1, 1)) * v, 0.05, 0.04, 'square'); nb(c, o, t + 0.08, 2093, 0.012, 0.014); }
    ],
    success: (c, o, t, v, k) => { [0, 1, 2].forEach((i) => nb(c, o, t + i * 0.06, note(k.m(i, 1)), 0.07, 0.055, 'triangle')); bell(c, o, t + 0.18, note(k.m(3, 1)), 0.7, 0.035); tone(c, o, t + 0.18, { f: note(k.m(0, 2)), dur: 0.6, gain: 0.012, a: 0.03 }); },
    found: (c, o, t, v, k) => { nb(c, o, t, note(k.m(1, 1)), 0.06, 0.05, 'triangle'); nb(c, o, t + 0.06, note(k.m(2, 1)), 0.08, 0.05, 'triangle'); bell(c, o, t + 0.12, note(k.m(3, 1)), 0.4, 0.02); },
    error: (c, o, t) => { buzz(c, o, t, { f: 110, dur: 0.12, gain: 0.09, bp: 820 }); buzz(c, o, t + 0.16, { f: 110, f2: 98, dur: 0.18, gain: 0.08, bp: 700 }); nb(c, o, t, 523, 0.09, 0.03, 'triangle'); nb(c, o, t + 0.16, 392, 0.2, 0.03, 'triangle'); },
    warn: (c, o, t) => { buzz(c, o, t, { f: 123, dur: 0.11, gain: 0.075, bp: 900 }); nb(c, o, t, 523, 0.08, 0.03, 'triangle'); },
    /* the tour lost sight of its target: the screen's tear (the glitch), then Pod 042's querying rise */
    missing: (c, o, t, v, k) => { tear(c, o, t, 0.06); const f = note(k.m(1, 0)); nb(c, o, t + 0.18, f, 0.16, 0.05, 'triangle', f * 1.19); },
    glitch: (c, o, t) => { tear(c, o, t, 0.07); nb(c, o, t + 0.16, 330, 0.09, 0.05, 'triangle'); },
    interrupt: (c, o, t, v, k) => { const lo = lpOut(c, o, 1600); nb(c, lo, t, note(k.m(2, 1)), 0.05, 0.055, 'triangle'); nb(c, lo, t + 0.045, note(k.m(0, 1)), 0.09, 0.055, 'triangle'); },
    commit: (c, o, t, v, k) => {
      const lo = lpOut(c, o, 3200);
      [0, 1, 2, 3, 4, 5].forEach((i) => nb(c, lo, t + i * 0.034, note(k.m(i, 1)), 0.05, 0.03, 'square'));
      noise(c, o, t, { dur: 0.24, f: 2000, f2: 5200, q: 1.6, gain: 0.012 });
      choir(c, o, t + 0.16, { notes: [57, 64, 69, 71], dur: 1.5, gain: 0.05, a: 0.16, vowel: 'ah' });
      bell(c, o, t + 0.3, note(84), 0.9, 0.022); bell(c, o, t + 0.44, note(88), 0.8, 0.016);
    },
    save: (c, o, t, v, k) => {
      [0, 1, 2, 3, 4].forEach((i) => nb(c, o, t + i * 0.032, note(k.m(i, 1)), 0.035, 0.035 + i * 0.004));
      noise(c, o, t, { dur: 0.22, f: 1800, f2: 4200, q: 1.2, gain: 0.012 });
      const f = note(k.m(2, 2)); tone(c, o, t + 0.16, { f, dur: 0.75, gain: 0.016, a: 0.04 }); tone(c, o, t + 0.16, { f: f * 1.003, dur: 0.75, gain: 0.013, a: 0.04 }); tone(c, o, t + 0.16, { f: f / 2, dur: 0.6, gain: 0.012, a: 0.05 });
    },
    reboot: (c, o, t) => {
      hum(c, o, t, true, 0.62, 0.07, 190);
      [0.06, 0.17, 0.26, 0.33, 0.39, 0.44, 0.48].forEach((dt, i) => { nchk(c, o, t + dt, 0.018 + i * 0.004); nb(c, o, t + dt, 2640, 0.01, 0.012 + i * 0.002); });
      nb(c, o, t + 0.5, 1760, 0.12, 0.045); nb(c, o, t + 0.56, 2640, 0.1, 0.018);
    },
    /* NieR Mode switching on, scored to the cover (H1): the hum swells from nothing and has faded by 1.15 s; six ticks
       climb with the plate's growth steps (90..390 ms); the check list's four stamps (600, 750, 900, 1050 ms) and the
       "log complete" blip (1080 ms). No choir: the world's arrival is 'wake', played at the reveal. */
    nierOn: (c, o, t) => {
      hum(c, o, t, true, 1.15, 0.07, 190, 0.42);
      GROW.forEach((f, i) => { const at = t + 0.09 + i * 0.06; nchk(c, o, at, 0.014 + i * 0.003); nb(c, o, at, f, 0.012, 0.012 + i * 0.0025); });
      [0.6, 0.75, 0.9, 1.05].forEach((dt) => nstamp(c, o, t + dt, 1));
      nb(c, o, t + 1.08, 1760, 0.12, 0.045); nb(c, o, t + 1.14, 2640, 0.08, 0.014);
    },
    /* switching off: the hum falls; the visors tick out one by one (0, 90, 180 ms); the two log stamps (700, 850 ms) */
    nierOff: (c, o, t) => {
      hum(c, o, t, false, 0.62, 0.07, 190);
      VISOR.forEach((f, i) => { nchk(c, o, t + i * 0.09, 0.024 - i * 0.003); nb(c, o, t + i * 0.09, f, 0.014, 0.024 - i * 0.004); });
      nb(c, o, t + 0.46, 440, 0.14, 0.04, 'triangle');
      [0.7, 0.85].forEach((dt) => nstamp(c, o, t + dt, 0.9));
    },
    /* the NieR world opens (H1's reveal, as the slats tear away): four slat ticks under the A minor "aah" choir, and one
       bell */
    wake: (c, o, t) => {
      [2960, 2640, 2349, 2093].forEach((f, i) => { nchk(c, o, t + i * 0.06, 0.012); nb(c, o, t + i * 0.06, f, 0.01, 0.012); });
      choir(c, o, t, { notes: [57, 64, 69], dur: 1.6, gain: 0.05, a: 0.22, vowel: 'ah' });
      bell(c, o, t + 0.26, note(88), 1.1, 0.022);
    },
    /* stage foley. string: a servo tick, rising a fourth in 50 ms, on its helper's chord tone (an octave lower when it
       climbs with the name sign) */
    string: [
      (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, k.climb ? 0 : 1)); tone(c, o, t, { f, f2: f * 4 / 3, glide: 0.05, dur: 0.055, gain: 0.05, a: 0.002 }); nchk(c, o, t, 0.03); },
      (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, k.climb ? 0 : 1)); nchk(c, o, t, 0.03); tone(c, o, t, { f, f2: f * 4 / 3, glide: 0.04, dur: 0.045, gain: 0.056, type: 'triangle', a: 0.002 }); nchk(c, o, t + 0.018, 0.019); },
      (c, o, t, v, k) => { const f = note(k.m(k.voice + k.climb, k.climb ? 0 : 1)); tone(c, o, t, { f, f2: f * 4 / 3, glide: 0.05, dur: 0.06, gain: 0.046, a: 0.002 }); tone(c, o, t, { f: f * 1.5, f2: f * 2, glide: 0.05, dur: 0.04, gain: 0.012, a: 0.002 }); nchk(c, o, t + 0.004, 0.028); }
    ],
    /* land: a servo thunk on the helper's chord tone (A3, C4, E4 at Welcome), the second take settling in two steps */
    land: [
      (c, o, t, v, k) => { const f = note(k.m(k.voice, -1)); nb(c, o, t, f * 1.12, 0.075, 0.07, 'triangle', f); nchk(c, o, t, 0.03); noise(c, o, t, { dur: 0.03, filter: 'lowpass', f: 700, gain: 0.05 }); },
      (c, o, t, v, k) => { const f = note(k.m(k.voice, -1)); nb(c, o, t, f * 1.12, 0.06, 0.073, 'triangle', f); nchk(c, o, t, 0.029); nb(c, o, t + 0.07, f, 0.05, 0.034, 'triangle'); nb(c, o, t + 0.016, 2640, 0.01, 0.013); }
    ],
    /* bow: a low triangle pair through 1.6 kHz falling onto the helper's chord tone, with a servo's sigh */
    bow: [
      (c, o, t, v, k) => { const lo = lpOut(c, o, 1600); nb(c, lo, t, note(k.m(k.voice + 1, 0)), 0.08, 0.06, 'triangle'); nb(c, lo, t + 0.075, note(k.m(k.voice, 0)), 0.2, 0.06, 'triangle'); tone(c, o, t + 0.02, { f: 1600, f2: 1150, glide: 0.16, dur: 0.18, gain: 0.006, a: 0.03 }); },
      (c, o, t, v, k) => { const lo = lpOut(c, o, 1500), f1 = note(k.m(k.voice + 1, 0)), f0 = note(k.m(k.voice, 0)); nb(c, lo, t, f1, 0.16, 0.06, 'triangle', f0); nb(c, lo, t + 0.15, f0, 0.12, 0.035, 'triangle'); noise(c, o, t, { dur: 0.16, f: 1400, f2: 900, q: 2, gain: 0.008, a: 0.03 }); }
    ],
    /* while Pod 042 demonstrates (the tour's Show Me), its travel and its hand-back speak 8-bit: a square climbing the
       chord in six held steps, and a falling three-step with a low drop */
    showPointer: (c, o, t, v, k) => { const lo = lpOut(c, o, 3000); chipSteps(c, lo, t, [0, 1, 2, 3, 4, 5].map((i) => note(k.m(i, 0))), 0.03, 0.03, square); nchk(c, o, t, 0.02); nchk(c, o, t + 0.18, 0.016); },
    showInterrupt: (c, o, t, v, k) => { const lo = lpOut(c, o, 2600); chipSteps(c, lo, t, [3, 2, 0].map((i) => note(k.m(i, 0))), 0.035, 0.034, square); nb(c, o, t + 0.1, note(k.m(0, -1)), 0.08, 0.05, 'triangle'); nchk(c, o, t, 0.022); },
    open: (c, o, t, v, k) => { const lo = lpOut(c, o, 2800); [0, 1, 2].forEach((i) => nb(c, lo, t + i * 0.04, note(k.m(i, 1)), 0.05, 0.04, 'square')); noise(c, o, t, { dur: 0.16, f: 1600, f2: 4200, q: 1.6, gain: 0.014 }); hum(c, o, t, true, 0.3, 0.035, 190); },
    close: (c, o, t, v, k) => { const lo = lpOut(c, o, 2400); [2, 1, 0].forEach((i, j) => nb(c, lo, t + j * 0.04, note(k.m(i, 1)), 0.05, 0.035, 'square')); noise(c, o, t, { dur: 0.14, f: 4200, f2: 1600, q: 1.6, gain: 0.012 }); },
    sheet: (c, o, t, v, k) => { nb(c, o, t, 2640, 0.012, 0.018); const lo = lpOut(c, o, 2600); nb(c, lo, t + 0.02, note(k.m(1, 1)), 0.04, 0.04, 'square'); nb(c, lo, t + 0.055, note(k.m(3, 1)), 0.06, 0.035, 'square'); },
    unsheet: (c, o, t, v, k) => { const lo = lpOut(c, o, 2200); nb(c, lo, t, note(k.m(3, 1)), 0.04, 0.035, 'square'); nb(c, lo, t + 0.035, note(k.m(1, 1)), 0.06, 0.035, 'square'); },
    reveal: (c, o, t, v, k) => { noise(c, o, t, { dur: 0.32, f: 1400, f2: 5000, q: 2.4, gain: 0.016 }); [0, 1, 2, 3].forEach((i) => nb(c, o, t + 0.05 + i * 0.05, note(k.m(i, 2)), 0.02, 0.022)); bell(c, o, t + 0.26, note(k.m(0, 1)), 0.6, 0.025); },
    pickup: (c, o, t, v, k) => { nb(c, o, t, note(k.m(0, 1)) * v, 0.07, 0.055, 'triangle', note(k.m(1, 1)) * v); nchk(c, o, t, 0.03); },
    drop: (c, o, t, v, k) => { nb(c, o, t, note(k.m(1, 1)) * v, 0.07, 0.05, 'triangle', note(k.m(0, 1)) * v); nb(c, o, t + 0.06, 330, 0.07, 0.06, 'triangle'); nchk(c, o, t + 0.06, 0.025); },
    spot: (c, o, t) => { noise(c, o, t, { dur: 0.14, f: 1200, f2: 4800, q: 3, gain: 0.018 }); nb(c, o, t + 0.1, 1975, 0.06, 0.025); },
    move: [
      (c, o, t) => { nb(c, o, t, 2640, 0.018, 0.0196); noise(c, o, t, { dur: 0.04, f: 3000, f2: 4600, q: 2.5, gain: 0.0053 }); },
      (c, o, t) => { nb(c, o, t, 2349, 0.018, 0.02); noise(c, o, t, { dur: 0.04, f: 2600, f2: 4000, q: 2.5, gain: 0.006 }); },
      (c, o, t) => { nb(c, o, t, 2960, 0.012, 0.02); nb(c, o, t + 0.022, 2640, 0.012, 0.0164); }
    ],
    callout: [
      (c, o, t, v, k) => { [0, 1, 2].forEach((i) => nb(c, o, t + i * 0.024, note(k.m(i, 2)), 0.014, 0.018)); const lo = lpOut(c, o, 2400); nb(c, lo, t + 0.075, note(k.m(0, 1)), 0.07, 0.045, 'square'); },
      (c, o, t, v, k) => { nb(c, o, t, 2640, 0.014, 0.02); nb(c, o, t + 0.03, 2960, 0.014, 0.018); nb(c, o, t + 0.06, note(k.m(2, 1)), 0.1, 0.05, 'triangle'); },
      (c, o, t, v, k) => { noise(c, o, t, { dur: 0.08, f: 1800, f2: 4200, q: 3, gain: 0.012 }); nb(c, o, t + 0.06, note(k.m(1, 1)), 0.08, 0.05, 'triangle'); nb(c, o, t + 0.1, note(k.m(3, 1)), 0.06, 0.02); }
    ],
    step: [
      (c, o, t, v, k) => { const j = k.n % 4; nb(c, o, t, note(k.m(j, 1)), 0.05, 0.045); nb(c, o, t + 0.07, note(k.m(j + 1, 1)), 0.08, 0.04); },
      (c, o, t, v, k) => { const j = k.n % 4; nb(c, o, t, note(k.m(j + 1, 1)), 0.04, 0.045, 'triangle'); nb(c, o, t + 0.06, note(k.m(j + 3, 1)), 0.09, 0.045, 'triangle'); },
      (c, o, t, v, k) => { const j = k.n % 4; [0, 1, 2].forEach((i) => nb(c, o, t + i * 0.05, note(k.m(j + i, 1)), 0.04 + i * 0.02, 0.035)); }
    ],
    checkpoint: [
      (c, o, t, v, k) => { const j = k.n % 4; nb(c, o, t, 2640, 0.014, 0.02); nb(c, o, t + 0.02, note(k.m(j, 1)), 0.07, 0.055, 'triangle'); nb(c, o, t + 0.08, note(k.m(j + 2, 1)), 0.14, 0.055, 'triangle'); bell(c, o, t + 0.12, note(k.m(j + 1, 2)), 0.45, 0.015); },
      (c, o, t, v, k) => { const j = k.n % 4; [0, 1, 2].forEach((i) => nb(c, o, t + i * 0.045, note(k.m(j + i, 1)), 0.06, 0.05, 'triangle')); bell(c, o, t + 0.135, note(k.m(j + 3, 1)), 0.5, 0.02); },
      (c, o, t, v, k) => { const j = k.n % 4, f = note(k.m(j + 1, 1)); nb(c, o, t, f, 0.06, 0.05, 'triangle'); nb(c, o, t + 0.06, f * 1.5, 0.14, 0.05, 'triangle'); tone(c, o, t + 0.06, { f: f * 2, dur: 0.4, gain: 0.01, a: 0.02 }); }
    ],
    finish: (c, o, t) => {
      choir(c, o, t, { notes: [55, 62, 67, 71], dur: 0.95, gain: 0.04, a: 0.18, vowel: 'oh' });
      choir(c, o, t + 0.55, { notes: [57, 64, 69, 72], dur: 1.9, gain: 0.05, a: 0.3, vowel: 'ah' });
      bell(c, panned(c, o), t + 0.7, note(81), 1, 0.02); bell(c, panned(c, o), t + 0.95, note(88), 1, 0.016); bell(c, panned(c, o), t + 1.2, note(83), 1, 0.014);
    },
    celebrate: (c, o, t, v, k) => {
      if (!k.layer) choir(c, o, t, { notes: [57, 64, 69, 71, 76], dur: 1.6, gain: 0.045, a: 0.22, vowel: 'ah' });
      sparkle(c, o, t + (k.layer ? 0.05 : 0.25), 1.2, k.layer ? 7 : 9, (at, i) => bell(c, panned(c, o), at, note(k.m(4 + (i * 3) % 6, 0)), 0.7, 0.016));
    },
    /* a unit's cheer is its visor's blip: two square tones a fifth apart through a 2.2 kHz low-pass on its chord tone,
       with a servo tick (Pod 042 is the only voice that speaks in vowels) */
    cheer: (c, o, t, v, k) => { const lo = lpOut(c, o, 2200), f = note(k.m(k.voice, 1)); nb(c, lo, t, f, 0.04, 0.05, 'square'); nb(c, lo, t + 0.045, f * 1.5, 0.07, 0.045, 'square'); nb(c, o, t, 2640, 0.012, 0.016); nchk(c, o, t + 0.045, 0.02); },
    pod: [
      (c, o, t) => { podSay(c, o, t, [[0, 440, 1, 0.05, 'eh'], [0.06, 587, 2, 0.05, 'ee'], [0.12, 494, -1, 0.08, 'ah']], POD); nb(c, o, t, 1760, 0.05, 0.01); nb(c, o, t + 0.06, 2350, 0.05, 0.009); nb(c, o, t + 0.12, 1975, 0.09, 0.009); },
      (c, o, t, v, k) => { const f = podF(k.m(1, 0)); podSay(c, o, t, [[0, f, 0, 0.05, 'oh'], [0.065, f * 1.12, 3, 0.09, 'ee']], POD * 0.7); },
      (c, o, t, v, k) => { const f = podF(k.m(2, 0)); podSay(c, o, t, [[0, f, 0.5, 0.04, 'oh'], [0.055, f, -1, 0.06, 'oh']], POD); },
      (c, o, t, v, k) => { podSay(c, o, t, [0, 1, 2, 3].map((i) => [i * 0.045, podF(k.m((i * 2 + k.rot) % 4, 0)), (R() - 0.5) * 3, 0.035, ['eh', 'ee', 'ah', 'oh'][(i + k.rot) % 4]]), POD * 0.9); },
      (c, o, t, v, k) => { const f = podF(k.m(3, 0)); podSay(c, o, t, [[0, f, -2, 0.09, 'oo']], POD * 1.9); }
    ],
    type: [
      (c, o, t) => nb(c, o, t, 2640 * (0.98 + R() * 0.04), 0.01, 0.018),
      (c, o, t) => noise(c, o, t, { dur: 0.006, filter: 'highpass', f: 3800, gain: 0.022, a: 0.0006 }),
      (c, o, t) => nb(c, o, t, TICK[Math.floor(R() * 4)], 0.009, 0.017)
    ],
    decode: [
      (c, o, t) => { chatter(c, o, t, 8, 0.022, 0.02); nb(c, o, t + 0.2, 1760, 0.02, 0.018); },
      (c, o, t) => { chatter(c, o, t, 6, 0.028, 0.02); nb(c, o, t + 0.18, 2640, 0.016, 0.018); },
      (c, o, t) => chatter(c, o, t, 10, 0.018, 0.025),
      (c, o, t) => { chatter(c, o, t, 5, 0.034, 0.0175); nb(c, o, t + 0.19, 2093, 0.02, 0.0143); }
    ],
    phase: (c, o, t, v, k) => nb(c, o, t, note(k.m(k.idx % 4, 2)), 0.02, 0.028),
    copy: (c, o, t) => { nb(c, o, t, 2640, 0.016, 0.026); nb(c, o, t + 0.035, 2960, 0.02, 0.024); const lo = lpOut(c, o, 2600); nb(c, lo, t + 0.06, 1318, 0.04, 0.035, 'square'); },
    /* the Pod's travel and its landing: three takes each, turning through the chord (the landing's tick from TICK) */
    pointer: [
      (c, o, t, v, k) => { const f = note(k.m(k.rot % 4, 1)); tone(c, o, t, { f, f2: f * 1.5, glide: 0.16, dur: 0.2, gain: 0.022, a: 0.03 }); noise(c, o, t, { dur: 0.16, f: 1800, f2: 3600, q: 2.4, gain: 0.006, a: 0.04 }); },
      (c, o, t, v, k) => { const r = k.rot % 4; [0, 1, 2].forEach((i) => nb(c, o, t + i * 0.045, note(k.m(r + i, 1)), 0.03, 0.022 + i * 0.003)); noise(c, o, t, { dur: 0.14, f: 2000, f2: 3800, q: 2.4, gain: 0.005, a: 0.03 }); },
      (c, o, t, v, k) => { const f = note(k.m(k.rot % 4 + 1, 1)); tone(c, o, t, { f, f2: f * 4 / 3, glide: 0.12, dur: 0.16, gain: 0.022, a: 0.02, type: 'triangle' }); nchk(c, o, t + 0.13, 0.016); }
    ],
    arrive: [
      (c, o, t, v, k) => { const tk = TICK[k.rot % 4]; nb(c, o, t, tk, 0.012, 0.03); nb(c, o, t + 0.03, tk, 0.014, 0.024); nb(c, o, t + 0.03, note(k.m(k.rot % 4, -1)), 0.06, 0.055, 'triangle'); },
      (c, o, t, v, k) => { nchk(c, o, t, 0.039); nb(c, o, t, TICK[(k.rot + 1) % 4], 0.016, 0.034); nb(c, o, t + 0.02, note(k.m(k.rot % 4, 0)), 0.05, 0.058, 'triangle'); },
      (c, o, t, v, k) => { [0, 1, 2].forEach((i) => nb(c, o, t + i * 0.022, TICK[(k.rot + i) % 4], 0.01, (0.024 - i * 0.004) * 1.41)); nb(c, o, t + 0.05, note(k.m(k.rot % 4, -1)), 0.07, 0.07, 'triangle'); }
    ],
    /* "objective updated": a soft pad leans into the chapter's chord (its own chord, from NIER_CHORDS), and the motif to
       the sting's depth rings out above it */
    quest: [
      (c, o, t, v, k) => { pad(c, o, t, [k.m(1, -1), k.m(2, -1), k.m(3, -1)], 0.5, 0.03); pad(c, o, t + 0.3, [k.m(0, -1), k.m(1, -1), k.m(2, -1), k.m(3, -1)], 1.1, 0.024); questTop(c, o, t + 0.34, k, k.m(2, 1)); },
      (c, o, t, v, k) => { pad(c, o, t, [k.m(0, -1), k.m(2, -1), k.m(0, 0)], 0.5, 0.03); pad(c, o, t + 0.3, [k.m(0, -1), k.m(1, -1), k.m(2, -1), k.m(1, 0)], 1.1, 0.026); questTop(c, o, t + 0.34, k, k.m(0, 1)); },
      (c, o, t, v, k) => { pad(c, o, t, [k.m(1, -1), k.m(3, -1), k.m(4, -1)], 0.5, 0.03); pad(c, o, t + 0.3, [k.m(0, -1), k.m(2, -1), k.m(3, -1), k.m(4, -1)], 1.1, 0.025); questTop(c, o, t + 0.34, k, k.m(1, 1)); }
    ],
    /* a tick, the chord's two-tone and a pad, then the motif (the last note a bell); at the resolution a soft "oo"
       choir holds the chord */
    chapter: (c, o, t, v, k) => {
      const d = k.depth, f = note(k.m(0, 0)); o = stingOut(c, o, k);
      nb(c, o, t, 2640, 0.014, 0.022); nb(c, o, t + 0.02, f, 0.08, 0.06, 'triangle'); nb(c, o, t + 0.09, f * 1.5, 0.2, 0.06, 'triangle');
      pad(c, o, t + 0.02, [k.m(0, -1), k.m(1, -1), k.m(2, -1)], d ? 0.9 : 0.7, 0.016);
      motifRun(k, t + 0.2, 0.12, (at, i, last) => { const m = note(k.motif(i, 0)); nb(c, o, at, 2640, 0.008, 0.01); if (last) bell(c, o, at, m, 0.8, 0.026); else nb(c, o, at, m, 0.1, 0.05, 'triangle'); });
      if (d >= 4) choir(c, o, t + 0.18, { notes: [k.m(0, -1), k.m(1, -1), k.m(2, -1)], dur: 1.5, gain: 0.034, a: 0.25, vowel: 'oo' });
    }
  };

  /* ---- events, fallbacks, priorities ---- */
  const EVENTS = ['tap', 'select', 'next', 'back', 'toggleOn', 'toggleOff', 'success', 'error', 'commit', 'open', 'close', 'pickup', 'drop', 'spot',
    'step', 'finish', 'cheer', 'celebrate', 'type', 'chapter', 'reveal', 'sheet', 'unsheet', 'phase', 'found', 'warn', 'copy', 'move', 'callout',
    'pointer', 'arrive', 'checkpoint', 'missing', 'interrupt', 'pod', 'reboot', 'decode', 'glitch', 'save', 'quest', 'nierOn', 'nierOff', 'hover',
    'wake', 'string', 'land', 'bow', 'showPointer', 'showInterrupt'];
  /* an event a kit lacks plays its fallback (CONTRACT "O55.sound"); hover is silent outside NieR */
  const FALLBACK = { chapter: 'next', reveal: 'open', sheet: 'open', unsheet: 'close', phase: 'tap', found: 'success', warn: 'error', copy: 'tap',
    move: 'tap', callout: 'spot', pointer: 'pickup', arrive: 'drop', checkpoint: 'step', missing: 'error', interrupt: 'back', pod: 'tap',
    reboot: 'open', decode: 'type', glitch: 'error', save: 'success', quest: 'step', nierOn: 'open', nierOff: 'close', hover: null,
    wake: 'reveal', string: 'tap', land: 'drop', bow: 'back', showPointer: 'pointer', showInterrupt: 'interrupt' };
  /* several events at once: the most important one plays */
  const PRIO = { commit: 100, celebrate: 95, finish: 94, nierOn: 93, nierOff: 93, wake: 93, reboot: 92, success: 90, save: 89, found: 86, error: 85, missing: 85,
    glitch: 84, warn: 82, quest: 80, chapter: 75, open: 72, close: 71, reveal: 70, next: 65, back: 65, checkpoint: 62, step: 60, callout: 58,
    sheet: 56, unsheet: 55, interrupt: 54, showInterrupt: 54, pickup: 52, drop: 52, cheer: 50, pod: 48, bow: 46, select: 45, toggleOn: 44, toggleOff: 44,
    phase: 40, spot: 38, pointer: 36, showPointer: 36, arrive: 35, copy: 34, tap: 30, string: 22, land: 21, move: 20, decode: 15, type: 10, hover: 5 };
  /* texture and stage foley sit under anything, never in its place: decode chatter, ticks, typing, the cursor, and a
     string, a landing or a bow (they describe the stage while something else speaks; their own rate limits keep them
     apart). Designed pairs: a celebration's sparkles over the big chord it belongs to (played as sparkles only), and
     the Pod speaking just after a tip, a quest card, a chapter or a step */
  const UNDER = new Set(['decode', 'type', 'move', 'hover', 'string', 'land', 'bow']);
  function layers(main, other) {
    if (UNDER.has(other)) return other !== main;
    if (other === 'celebrate') return main === 'commit' || main === 'finish' || main === 'save';
    if (other === 'pod') return main === 'callout' || main === 'quest' || main === 'chapter' || main === 'step';
    return false;
  }
  const MERGE_MS = 70;
  /* a celebration this soon (story time, ms) after the big chord it follows is that chord's sparkles: 1.2 s after a
     commit or a finish, 1.6 s after a resolution (a sting at depth 4: Ready's motif, complete). After a 'save'
     it plays in full: the Project made is the run's one full celebration (save, then the confetti's hooray) */
  const LAYER_AFTER = { commit: 1200, finish: 1200, resolve: 1600 };
  /* the least time between two of the same event (ms). type 120 (one typing tick per 120 ms, as the chat's cues);
     phase 70, so rows that step in 80 to 120 ms apart each tick; checkpoint 250 */
  const RATE = { type: 120, hover: 45, move: 110, decode: 90, phase: 70, spot: 110, tap: 30, select: 30, pod: 150, copy: 100, pointer: 150, arrive: 60,
    checkpoint: 250, wake: 800, string: 60, land: 90, bow: 90, showPointer: 150 };
  /* at most three landings in any 400 ms (a troupe lowered in at once is three, never a clatter) */
  const LAND_MAX = 3, LAND_SPAN = 400;
  /* texture: quiet, frequent, rate limited on its own (and never counted as a burst) */
  const TEXTURE = new Set(['type', 'move', 'hover', 'decode', 'string', 'land']);
  const BURST_FREE = new Set([...TEXTURE, 'bow', 'phase']);
  /* the stage's foley: skipped under Reduced Motion, where the motion it describes is not shown */
  const FOLEY = new Set(['string', 'land', 'bow']);
  /* events played from the stage: without a pan they sit where their helper stands (h0 left, h1 middle, h2 right) */
  const STAGE = new Set(['cheer', 'string', 'land', 'bow']);
  const STAGE_PAN = [-0.35, 0, 0.35];
  /* texture that waits while the computer is struggling */
  const LOWRES_SKIP = new Set(['spot', 'move', 'hover', 'decode', 'string', 'land']);
  /* events that read the Project binding at most every 250 ms (they can fire many times a second) */
  const LAZY_REFRESH = new Set(['type', 'hover', 'move', 'decode', 'phase', 'string', 'land']);
  /* takes no moment plays leave the library (they stay in the kits as fallbacks of the chain): 'spot' (every look has a
     'callout', so it is never reached); 'step' except in Basic (Basic's plays as the NieR goal card's sound when NieR is
     painted without its Menu sounds; no other look is reached); 'glitch' (no moment plays it: NieR's tear sounds in
     'missing', the tour's lost target) */
  const RETIRED = { spot: null, step: ['friendly', 'glass', 'retro', 'nier'], glitch: null };
  const retired = (kit, ev) => Object.prototype.hasOwnProperty.call(RETIRED, ev) && (RETIRED[ev] === null || RETIRED[ev].includes(kit));

  const KIT_NAMES = ['basic', 'friendly', 'glass', 'retro', 'nier'];
  const poolOf = (kit, ev) => { const x = KITS[kit] && KITS[kit][ev]; return !x ? [] : Array.isArray(x) ? x : [x]; };
  function resolve(kit, ev) {
    const K = KITS[kit] || KITS.basic;
    let e = ev;
    for (let hops = 0; e && !K[e] && hops < 4; hops++) { if (!Object.prototype.hasOwnProperty.call(FALLBACK, e)) return null; e = FALLBACK[e]; }
    return e && K[e] ? e : null;
  }
  /* the NieR voice: the painted parts (an onboarding preview paints them too), else the engine's answer */
  function nierParts() {
    const a = document.documentElement.getAttribute('data-o55-nier-parts');
    if (a != null) return a.split(/\s+/);
    return null;
  }
  function nierSounds() {
    const p = nierParts();
    if (p) return p.includes('sounds');
    try { return !!(window.PM_NIER && window.PM_NIER.has && window.PM_NIER.has('sounds')); } catch (_) { return false; }
  }
  /* turning NieR Mode on or off sounds in NieR's own voice whenever its Menu sounds part is installed */
  function nierSoundsInstalled() {
    const N = window.PM_NIER;
    try {
      const pv = N && N.previewing && N.previewing();
      if (pv && Array.isArray(pv.parts)) return pv.parts.includes('sounds');
      if (N && N.parts) return N.parts().includes('sounds');
    } catch (_) {}
    const p = nierParts(); return !!(p && p.includes('sounds'));
  }
  const NIER_ALWAYS = new Set(['nierOn', 'nierOff', 'reboot']);
  function kitFor(event, opts) {
    const o = opts || {};
    if (o.kit && KITS[o.kit]) return o.kit;
    if (o.family && KITS[o.family]) return o.family;
    const th = O55.theme();
    if (th.art === 'nier' && nierSounds()) return 'nier';
    if (NIER_ALWAYS.has(event) && nierSoundsInstalled()) return 'nier';
    return KITS[th.family] ? th.family : 'basic';
  }

  /* a shuffle bag per kit and event: every variant once, in a seeded order, never the same one twice running */
  const bags = {};
  function pick(kit, ev, n) {
    if (n <= 1) return 0;
    const key = kit + ':' + ev;
    const b = bags[key] || (bags[key] = { r: O55.util.rng('snd:' + key), q: [], last: -1 });
    if (!b.q.length) {
      const q = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(b.r() * (i + 1)); const x = q[i]; q[i] = q[j]; q[j] = x; }
      if (q[0] === b.last) q.push(q.shift());
      b.q = q;
    }
    const v = b.q.shift(); b.last = v; return v;
  }
  function run(fn, c, o, t, v, k) { const prev = R; R = k.r; try { fn(c, o, t, v, k); } finally { R = prev; } }

  /* ---- generated by tools/sound_catalog.py from a tools/sound_render.mjs run (do not edit by hand):
     TRIM, dB per kit and event, brings every event to its loudness tier across the kits; DUR, seconds of audible sound
     per kit, event and variant (for the library). ---- */
  const TRIM = /* TRIM:begin */{"basic":{"tap":-2.0,"select":-3.0,"next":-1.0,"toggleOff":1.5,"success":-3.0,"error":3.5,"commit":-2.0,"open":3.0,"close":3.5,"pickup":1.5,"drop":2.0,"spot":10.0,"step":-2.5,"finish":1.0,"cheer":-1.0,"celebrate":2.5,"type":7.0,"chapter":1.5,"reveal":-0.5,"sheet":4.0,"unsheet":3.5,"found":3.0,"copy":-2.0,"move":-2.0,"callout":1.5,"pointer":-1.0,"arrive":-2.5,"checkpoint":-2.0,"missing":5.0,"interrupt":4.0,"save":2.5,"string":-4.5,"land":-10.5,"bow":-2.5},"friendly":{"tap":-3.5,"select":-8.5,"next":-9.5,"back":-7.0,"toggleOn":-3.5,"toggleOff":-2.5,"success":-7.0,"error":-6.0,"commit":-4.5,"open":-4.5,"close":-0.5,"pickup":-2.5,"drop":-4.0,"spot":-5.0,"step":-7.5,"finish":-4.5,"cheer":-6.0,"celebrate":-2.0,"type":-3.0,"chapter":-5.5,"reveal":-5.0,"sheet":-3.5,"unsheet":0.5,"phase":-0.5,"found":-3.5,"warn":-7.0,"copy":-7.0,"move":-0.5,"callout":-3.0,"arrive":-7.5,"checkpoint":-7.5,"missing":-3.0,"interrupt":1.0,"save":-6.0,"string":-7.5,"land":-11.5,"bow":-6.5},"glass":{"tap":-2.0,"select":-1.0,"back":2.5,"toggleOn":1.0,"toggleOff":4.5,"success":-1.0,"error":2.0,"open":3.5,"close":7.0,"pickup":2.5,"drop":1.5,"spot":13.5,"step":1.0,"finish":1.5,"cheer":0.5,"celebrate":5.5,"type":0.5,"chapter":2.5,"reveal":1.0,"sheet":5.0,"unsheet":8.0,"phase":1.5,"found":3.5,"warn":1.0,"move":-0.5,"callout":3.0,"pointer":5.0,"arrive":-0.5,"checkpoint":1.0,"missing":5.5,"interrupt":5.0,"save":3.5,"string":-1.0,"land":-6.5,"bow":0.5},"retro":{"tap":4.5,"select":7.0,"next":7.5,"back":8.5,"toggleOn":2.0,"toggleOff":3.0,"success":8.5,"error":8.5,"commit":4.5,"open":10.0,"close":10.5,"pickup":9.0,"drop":2.0,"spot":8.0,"step":6.0,"finish":13.5,"cheer":5.5,"celebrate":4.0,"type":-2.5,"chapter":4.0,"reveal":10.5,"sheet":9.5,"unsheet":10.0,"phase":6.5,"found":9.5,"warn":8.0,"copy":6.0,"move":2.5,"callout":6.0,"pointer":7.0,"arrive":-2.5,"checkpoint":6.0,"missing":11.5,"interrupt":9.0,"save":6.5,"string":-5.0,"land":-2.5,"bow":0.5},"nier":{"tap":-1.5,"select":-1.0,"back":-1.0,"toggleOn":-0.5,"toggleOff":2.0,"success":3.5,"error":5.0,"commit":7.0,"open":1.0,"close":2.5,"pickup":2.5,"drop":2.5,"step":3.0,"finish":7.0,"cheer":-0.5,"celebrate":7.0,"type":-1.0,"chapter":4.0,"reveal":6.5,"sheet":2.0,"unsheet":2.0,"phase":3.5,"found":7.0,"warn":4.0,"move":-1.0,"callout":3.5,"pointer":1.0,"arrive":-1.0,"checkpoint":4.0,"missing":4.0,"interrupt":1.0,"pod":-1.0,"reboot":5.5,"decode":2.0,"glitch":4.0,"save":6.5,"quest":4.0,"nierOn":2.5,"nierOff":2.0,"hover":-4.5,"wake":8.0,"string":-4.5,"land":-9.5,"bow":-1.5,"showPointer":-2.0,"showInterrupt":3.5}}/* TRIM:end */;
  const DUR = /* DUR:begin */{"basic":{"tap":[0.04,0.03,0.07,0.04],"select":[0.15,0.18,0.17,0.16],"next":[0.25,0.24,0.27],"back":[0.16,0.12,0.16],"toggleOn":[0.05,0.08,0.06],"toggleOff":[0.05,0.08,0.06],"success":0.39,"error":0.26,"commit":1.2,"open":0.16,"close":0.15,"pickup":0.08,"drop":0.09,"spot":0.1,"step":[0.23,0.26,0.24],"finish":0.94,"cheer":0.23,"celebrate":1.32,"type":[0.03,0.02,0.02],"chapter":1.38,"reveal":0.42,"sheet":0.1,"unsheet":0.09,"phase":0.03,"found":0.3,"warn":0.1,"copy":0.07,"move":[0.03,0.06,0.03],"callout":[0.1,0.18,0.21],"pointer":[0.22,0.17,0.23],"arrive":[0.06,0.09,0.08],"checkpoint":[0.3,0.31,0.29],"missing":0.27,"interrupt":0.09,"save":0.67,"string":[0.1,0.12,0.09],"land":[0.06,0.05],"bow":[0.26,0.26]},"friendly":{"tap":[0.03,0.15,0.37,0.06],"select":[0.36,0.41,0.38,0.43],"next":[0.51,0.54,0.42],"back":[0.46,0.52,0.36],"toggleOn":[0.07,0.46,0.21],"toggleOff":[0.07,0.47,0.09],"success":0.87,"error":0.49,"commit":1.3,"open":0.46,"close":0.48,"pickup":0.08,"drop":0.45,"spot":0.57,"step":[0.46,0.4,0.45],"finish":0.73,"cheer":0.73,"celebrate":2.08,"type":[0.35,0.02,0.02],"chapter":1.39,"reveal":0.6,"sheet":0.45,"unsheet":0.44,"phase":0.4,"found":0.43,"warn":0.37,"copy":0.18,"move":[0.11,0.37,0.02],"callout":[0.35,0.45,0.36],"pointer":[0.24,0.38,0.21],"arrive":[0.35,0.2,0.35],"checkpoint":[0.55,0.49,0.47],"missing":0.4,"interrupt":0.07,"save":0.96,"string":[0.16,0.13,0.18],"land":[0.3,0.31],"bow":[0.44,0.45]},"glass":{"tap":[0.12,0.09,0.71,0.1],"select":[1.23,1.22,1.17,1.11],"next":[1.43,1.34,1.47],"back":[1.3,1.2,1.25],"toggleOn":[1.07,0.97,0.19],"toggleOff":[0.25,0.21,0.18],"success":1.52,"error":0.28,"commit":2.25,"open":1.44,"close":1.2,"pickup":0.24,"drop":1.19,"spot":0.61,"step":[1.11,1.09,1.16],"finish":1.78,"cheer":1.24,"celebrate":3.02,"type":[0.04,0.03,0.02],"chapter":2.76,"reveal":1.48,"sheet":0.45,"unsheet":0.68,"phase":0.07,"found":1.37,"warn":0.2,"copy":0.12,"move":[0.06,0.17,0.05],"callout":[1.05,1.08,1.01],"pointer":[0.46,0.84,0.76],"arrive":[0.96,0.68,0.61],"checkpoint":[1.23,1.32,1.29],"missing":1.06,"interrupt":0.15,"save":1.55,"string":[0.56,0.56,0.54],"land":[0.27,0.27],"bow":[1.16,1.1]},"retro":{"tap":[0.03,0.03,0.03,0.02],"select":[0.11,0.12,0.1,0.06],"next":[0.12,0.15,0.14],"back":[0.13,0.08,0.11],"toggleOn":[0.05,0.07,0.04],"toggleOff":[0.05,0.07,0.04],"success":0.28,"error":0.16,"commit":0.61,"open":0.11,"close":0.1,"pickup":0.05,"drop":0.12,"spot":0.03,"step":[0.13,0.16,0.09],"finish":0.33,"cheer":0.14,"celebrate":1.32,"type":[0.02,0.02,0.02],"chapter":1.04,"reveal":0.31,"sheet":0.08,"unsheet":0.08,"phase":0.02,"found":0.13,"warn":0.11,"copy":0.07,"move":[0.02,0.02,0.02],"callout":[0.05,0.08,0.07],"pointer":[0.17,0.16,0.15],"arrive":[0.05,0.06,0.04],"checkpoint":[0.17,0.18,0.14],"missing":0.2,"interrupt":0.06,"save":0.36,"string":[0.09,0.08,0.09],"land":[0.04,0.05],"bow":[0.16,0.15]},"nier":{"tap":[0.03,0.02,0.03,0.03],"select":[0.1,0.1,0.09,0.11],"next":[0.2,0.22,0.26],"back":[0.18,0.18,0.14],"toggleOn":[0.08,0.08,0.1],"toggleOff":[0.08,0.08,0.1],"success":0.78,"error":0.33,"commit":1.48,"open":0.28,"close":0.13,"pickup":0.06,"drop":0.12,"spot":0.15,"step":[0.14,0.14,0.17],"finish":2.33,"cheer":0.1,"celebrate":1.96,"type":[0.02,0.02,0.02],"chapter":1.53,"reveal":0.77,"sheet":0.11,"unsheet":0.09,"phase":0.02,"found":0.47,"warn":0.1,"copy":0.1,"move":[0.02,0.02,0.04],"callout":[0.14,0.15,0.16],"pointer":[0.16,0.12,0.14],"arrive":[0.08,0.06,0.11],"checkpoint":[0.47,0.53,0.37],"missing":0.32,"interrupt":0.12,"pod":[0.19,0.12,0.1,0.16,0.06],"reboot":0.66,"decode":[0.22,0.2,0.18,0.21],"glitch":0.24,"save":0.83,"quest":[1.46,1.46,1.46],"nierOn":1.21,"nierOff":0.89,"hover":[0.02,0.02,0.02],"wake":1.47,"string":[0.04,0.04,0.05],"land":[0.05,0.1],"bow":[0.23,0.24],"showPointer":0.19,"showInterrupt":0.17}}/* DUR:end */;
  const dB = (x) => Math.pow(10, (x || 0) / 20);
  const trimOf = (kit, ev) => (TRIM[kit] && TRIM[kit][ev]) || 0;
  const durOf = (kit, ev, v) => { const d = DUR[kit] && DUR[kit][ev]; return d ? (Array.isArray(d) ? d[Math.min(v || 0, d.length - 1)] : d) : 0.5; };
  const tailOf = (kit, ev) => { const d = DUR[kit] && DUR[kit][ev]; return Math.max(0.3, Array.isArray(d) ? Math.max(...d) : d || 1); };

  S.KITS = KITS;
  S.EVENTS = EVENTS.slice();
  S.KIT_NAMES = KIT_NAMES.slice();
  S.FAMILIES = KIT_NAMES.slice();
  S.FALLBACK = Object.assign({}, FALLBACK);
  S.PRIO = Object.assign({}, PRIO);
  S.variants = (kit, ev) => poolOf(kit, ev).length;
  S.resolve = (kit, ev) => resolve(kit, ev);
  S.kitFor = (event, opts) => kitFor(event, opts);

  /* where the last click was, for left-right placement of what it plays; and whether the person has acted yet */
  let gestured = false;
  document.addEventListener('pointerdown', (e) => { music.x = Math.max(0, Math.min(1, e.clientX / Math.max(1, innerWidth))); if (e.isTrusted) gestured = true; }, true);
  document.addEventListener('keydown', (e) => { if (e.isTrusted) gestured = true; }, true);
  const hasGesture = () => gestured || !!(navigator.userActivation && navigator.userActivation.hasBeenActive);

  /* ---- live context: created on the first user gesture (browsers block autoplay) ---- */
  function buildMaster(ctx) {
    const master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.003; comp.release.value = 0.2;
    master.connect(comp); comp.connect(ctx.destination);
    roomOut.set(ctx, master);
    return { master, comp };
  }
  /* The one context and its master chain. Opening the device holds the main thread (about 60 ms on the M3 for the
     first context; soundClick 61.8 ms of a 104 ms NieR Settings entry, Settings lane trace), so it is made once the
     page is idle after load (makeAhead, below): made before any gesture it starts suspended, as autoplay rules allow,
     and the first press or key resumes it. Nothing plays before that first gesture: ensureContext() still answers
     null until then, so no sound is queued on the suspended context. */
  function makeContext() {
    if (S.ctx) return S.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      const ctx = new AC();
      const { master, comp } = buildMaster(ctx);
      const tap = ctx.createAnalyser(); tap.fftSize = 2048; comp.connect(tap);
      S.ctx = ctx; S.master = master; S.tap = tap;
      warmLook();
      return ctx;
    } catch (_) { return null; }
  }
  function ensureContext() {
    if (!hasGesture()) return null;
    if (!S.ctx && !makeContext()) return null;
    if (S.ctx.state === 'suspended') S.ctx.resume().catch(() => {});
    return S.ctx;
  }
  S.unlock = function unlock() { const c = ensureContext(); return !!c; };
  /* When the context was not made ahead (sound off at load, the page hidden), it is warmed with its takes in idle time
     after the first gesture, so a later sound's flush (a usage warning) does not also open the audio device.
     Onboarding keeps its immediate unlock.
     Opening the device holds the main thread (about 160 ms on the M3, for the first context only), and the first idle
     gap after a click falls in the middle of whatever that click animates: the warm waits for a quiet moment instead,
     1.2 s after the last input with no page change, window, tour or Usage moment running. */
  let warmingContext = false, lastInput = 0;
  const QUIET_MS = 1200;
  const busy = () => {
    const h = document.documentElement;
    return h.hasAttribute('data-pm-page-transition') || h.hasAttribute('data-o55-open') || h.hasAttribute('data-o55-tour')
      || h.hasAttribute('data-pmu-moment') || document.visibilityState !== 'visible';
  };
  function warmWhenQuiet() {
    if (S.ctx) { warmingContext = false; return; }
    const wait = lastInput + QUIET_MS - performance.now();
    if (wait > 0 || busy()) { window.setTimeout(warmWhenQuiet, Math.max(wait, 300)); return; }
    idle(() => {
      if (S.ctx) { warmingContext = false; return; }
      if (performance.now() - lastInput < QUIET_MS || busy()) { warmWhenQuiet(); return; }
      warmingContext = false; ensureContext();
    });
  }
  /* made ahead: once the page is idle after load (and again after the sound is turned on), with sound on and the page
     shown; the first trusted press or key anywhere resumes it, before that gesture's click handlers ask to play */
  function makeAhead() {
    if (S.ctx || S.muted || document.visibilityState !== 'visible') return;
    makeContext();
  }
  const aheadSoon = () => (window.requestIdleCallback ? window.requestIdleCallback(makeAhead, { timeout: 4000 }) : window.setTimeout(makeAhead, 1500));
  if (document.readyState === 'complete') aheadSoon(); else window.addEventListener('load', aheadSoon, { once: true });
  window.addEventListener('o55:sound', (e) => { if (e && e.detail && e.detail.muted === false) aheadSoon(); });
  document.addEventListener('visibilitychange', () => { if (!S.ctx && document.visibilityState === 'visible') aheadSoon(); });
  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, (e) => {
    if (e.isTrusted && S.ctx && S.ctx.state === 'suspended' && !S.muted) S.ctx.resume().catch(() => {});
  }, true));
  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, (e) => {
    if (!e.isTrusted) return;
    lastInput = performance.now();
    if (document.documentElement.hasAttribute('data-o55-open') || document.documentElement.hasAttribute('data-o55-tour')) ensureContext();
    else if (!S.ctx && !warmingContext) {
      warmingContext = true;
      warmWhenQuiet();
    }
  }, true));

  /* ---- playing: queue, merge, voice ---- */
  let queue = [], flushing = false, recent = null, playSeed = 1;
  const lastAt = {}, lastVoice = {}, starts = [], playedAt = {}, landAt = [], active = [];
  /* story time (the motion clock, which slow-motion filming stretches) for what is choreographed: a rest, a deferral, a
     celebration's layer window. Merges and rate limits stay in real time: they are about sounds overlapping. */
  const mNow = () => (O55.motion && typeof O55.motion.now === 'function' ? O55.motion.now() : performance.now());
  const later = (ms, fn) => (O55.motion && typeof O55.motion.after === 'function' ? O55.motion.after(ms, fn) : window.setTimeout(fn, ms));
  const reducedMotion = () => { try { return !!(O55.motion && O55.motion.reduced && O55.motion.reduced()); } catch (_) { return false; } };
  let restUntil = -1e9, restAt = -1e9, stingAt = -1e9;
  /* the last sound played at PRIO 75 or more (story time): a deferred sound that comes back after one at least as
     important has played gives way to it (that moment already has its signature) */
  let big = { m: -1e9, prio: 0, event: null };
  function logEntry(o) { S.log.push(o); if (S.log.length > 400) S.log.shift(); return o; }
  function drop(item, why, by) { item.entry.dropped = why; if (by) item.entry.by = by; }
  /* one playing sound fades out over s seconds (it gives way, or a rest begins) */
  function fade(h, s) {
    if (!h || !S.ctx) return;
    const t = S.ctx.currentTime;
    [h.gain, h.send].forEach((n) => { if (!n) return; try { n.gain.cancelScheduledValues(t); n.gain.setValueAtTime(n.gain.value, t); n.gain.linearRampToValueAtTime(0, t + s); } catch (_) {} });
  }
  /* ---- pre-rendered takes. A recipe that comes out the same on every play (nothing of the music's place, the step,
     the helper's voice, the depth, the layer, the intensity or the pitch drift in it; its only randomness where its
     noise clicks start in the noise buffer) is rendered once per sample rate, offline, in quiet moments after the first
     gesture, and played as one buffer through the play's own chain (level, lp, shelf, pan): NieR's world opening
     (wake), its switching on and off (nierOn, nierOff) and the reboot hum. Basic and Glass's fixed warning chimes
     use the same cache, prepared first so a shell notification only schedules playback. Built live each NieR take
     was 60 to 75 nodes and 5 to 12 ms of main thread, wake on the very frame the world is revealed
     (design/hero-spec.md H1). A take is kept only
     when two renders made at two different places of the journey agree (sameTake); until it is ready, or where it was
     not kept, the recipe plays live as before. prepare(rate) -> Promise (the live context asks for its own rate;
     a test may ask for another); takeReady(kit, event, variant, rate). */
  const TAKES = [['basic', 'warn'], ['glass', 'warn'], ['nier', 'wake'], ['nier', 'nierOn'], ['nier', 'nierOff'], ['nier', 'reboot']];
  const warmKeys = new WeakMap(); /* preparation promise -> required PCM keys; eviction makes a later prepare rebuild */
  const nextBanks = new Map();
  const preparing = new Map(); /* sample rate -> Map(kit -> Promise), at most two rates and five kits */
  const PLACES = [{ o: {}, v: 1 }, { o: { chapter: 'ai', step: 5, voice: 2, depth: 1, intensity: 1, layer: true }, v: 1.02 }];
  function renderTake(rate, kit, ev, vi, place) {
    const fn = poolOf(kit, ev)[vi]; if (!fn || typeof OfflineAudioContext === 'undefined') return Promise.resolve(null);
    /* Keep the live 4 ms offset within the render quantum: starting on a quantum boundary changes the attack
       in Chrome. Trim whole samples only; the warning buffer keeps any fractional-sample onset within it. */
    const lead = ev === 'warn' ? rate * 0.004 : 0, cut = Math.floor(lead);
    const off = new OfflineAudioContext(2, cut + Math.ceil(rate * (tailOf(kit, ev) + 0.3)), rate);
    const out = off.createGain(); out.connect(off.destination);
    run(fn, off, out, lead / rate, place.v, mk(kit, ev, place.o, true, vi, O55.util.rng('take:' + kit + ':' + ev + ':' + vi)));
    return off.startRendering().then((buf) => {
      if (!lead) return buf;
      const take = new AudioBuffer({ length: buf.length - cut, numberOfChannels: buf.numberOfChannels, sampleRate: rate });
      for (let ch = 0; ch < buf.numberOfChannels; ch++) take.copyToChannel(buf.getChannelData(ch).subarray(cut), ch);
      return take;
    });
  }
  /* two renders agree when they differ nowhere by more than -80 dB (an offline render is not bit-exact from one
     context to the next: the same graph twice differs by up to 6e-7); a recipe that follows the chord, the step, the
     voice, the drift or the intensity differs at full level */
  function sameTake(a, b) {
    if (!a || !b || a.length !== b.length || a.numberOfChannels !== b.numberOfChannels) return false;
    for (let c = 0; c < a.numberOfChannels; c++) { const x = a.getChannelData(c), y = b.getChannelData(c); for (let i = 0; i < x.length; i++) if (Math.abs(x[i] - y[i]) > 1e-4) return false; }
    return true;
  }
  /* a take is kept mono, as the live recipe is (its oscillators are, until the play's own panner): rendered into two
     channels, a recipe with a pan of its own inside comes out with two different channels and is not kept */
  function monoOf(b) {
    if (b.__mono !== undefined) return b.__mono;
    let mono = null;
    const x = b.getChannelData(0), y = b.numberOfChannels > 1 ? b.getChannelData(1) : x;
    let same = true; for (let i = 0; i < x.length; i++) if (Math.abs(x[i] - y[i]) > 1e-6) { same = false; break; }
    if (same) { mono = new AudioBuffer({ length: b.length, numberOfChannels: 1, sampleRate: b.sampleRate }); mono.copyToChannel(x, 0); }
    b.__mono = mono; return mono;
  }
  // the page's one admission for idle work (PM_BUSY.idle): never inside a held drag (F3-3)
  const idle = (fn) => {
    const B = window.PM_BUSY;
    if (B && typeof B.idle === 'function') return B.idle(fn, 4000);
    return window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 4000 }) : later(200, fn);
  };
  /* The dynamic recipes cannot be frozen as whole takes: callout follows its chapter; other sounds follow
     pitch drift, shuffle rotation, helper voice and random noise offsets. Prepare their exact expensive PCM
     ingredients instead, then schedule the original nodes through the original dry and room chains. */
  function resourceJobs(ctx, kit) {
    const jobs = [() => noiseBuf(ctx)]; jobs.pcmKeys = ['noise:' + ctx.sampleRate];
    if (kit === 'glass') { jobs.pcmKeys.push('room:' + ctx.sampleRate); jobs.push(() => roomBuffer(ctx), () => { if (ctx === S.ctx) room(ctx, S.master); }); }
    if (kit === 'retro' || kit === 'nier') jobs.push(() => { pulse25(ctx); pulse12(ctx); square(ctx); });
    if (kit !== 'friendly') return jobs;
    /* All three helpers, the eight string climb positions, every chapter, all Friendly string variants.
       Unusual explicit voice values still take the unchanged live fallback on a cache miss. */
    const strings = new Map();
    Object.keys(CHORDS).forEach((chapter) => {
      for (let voice = 0; voice < 3; voice++) for (let step = 0; step < 8; step++) {
        const k = mk('friendly', 'string', { chapter, voice, step }, true, 0, null);
        const f = note(k.m(k.voice + k.climb, -1));
        [[f, 0.3, 0.45], [f, 0.24, 0.6], [f, 0.34, 0.4], [f / 2, 0.28, 0.3]].forEach((args) => {
          strings.set(args.join(':'), args);
        });
      }
    });
    strings.forEach((args) => { jobs.pcmKeys.push('string:' + ctx.sampleRate + ':' + args[0].toFixed(2) + ':' + args[1] + ':' + args[2]); jobs.push(() => ksBuffer(ctx, ...args)); });
    return jobs;
  }
  S.prepare = function prepare(rate, kit) {
    rate = Math.round(+rate || 0);
    /* Two outstanding/completed rate preparations at most, and bounded OfflineAudioContext allocations.
       Other rates retain live synthesis. Superseded idle jobs stop without repopulating an evicted rate. */
    if (rate < 8000 || rate > 96000 || typeof OfflineAudioContext === 'undefined') return Promise.resolve(false);
    kit = KITS[kit] ? kit : kitFor('tap', {});
    if (!preparing.has(rate)) {
      if (preparing.size >= 2) {
        const old = preparing.keys().next().value; preparing.delete(old);
        for (const key of nextBanks.keys()) if (key.startsWith(old + ':')) nextBanks.delete(key);
      }
      preparing.set(rate, new Map());
    }
    const pending = preparing.get(rate);
    if (pending.has(kit)) {
      const prior = pending.get(kit);
      return prior.then((ok) => {
        if (!ok) return false;
        if ((warmKeys.get(prior) || []).some((key) => !buffers.has(key))) {
          pending.delete(kit); return S.prepare(rate, kit);
        }
        return finishWarm(rate, kit);
      });
    }
    const current = () => preparing.get(rate) === pending && pending.get(kit) === p;
    const ctx = S.ctx && S.ctx.sampleRate === rate ? S.ctx : new OfflineAudioContext(1, 1, rate);
    const jobs = [], keys = [];
    TAKES.filter(([family]) => family === kit).forEach(([kit, ev]) => { for (let vi = 0; vi < poolOf(kit, ev).length; vi++) { keys.push('take:' + rate + ':' + kit + ':' + ev + ':' + vi); jobs.push(() =>
      Promise.all(PLACES.map((pl) => renderTake(rate, kit, ev, vi, pl).catch(() => null)))
        .then(([a, b]) => { if (!current()) return; const mono = a && sameTake(a, b) && monoOf(a);
          if (mono) keepBuffer('take:' + rate + ':' + kit + ':' + ev + ':' + vi, mono); })); }
    });
    /* Preserve the active look's existing take priority before its shared ingredients. */
    const resources = resourceJobs(ctx, kit); jobs.push(...resources); keys.push(...resources.pcmKeys);
    /* One resource per idle callback, including each pluck, so warmup itself never builds a whole bank in a frame. */
    const p = jobs.reduce((chain, job) => chain.then(() => new Promise((res) => {
      if (!current()) { res(); return; }
      idle(() => { if (!current()) { res(); return; } Promise.resolve().then(job).catch(() => {}).then(res); });
    })), Promise.resolve()).then(current);
    pending.set(kit, p); warmKeys.set(p, keys);
    return p.then((ok) => ok ? finishWarm(rate, kit) : false);
  };
  /* A look switch schedules preparation after the gesture, outside that switch's task. Release inactive
     look PCM and invalidate its outstanding jobs; playing Web Audio nodes keep their own tails intact. */
  let warmingLook = null, lookIdle = false;
  function warmLook() {
    if (!S.ctx) return;
    const kit = kitFor('tap', {});
    if (warmingLook !== kit) {
      warmingLook = kit; preparing.clear(); nextBanks.clear();
      for (const [key, b] of buffers) {
        const kind = key.split(':')[0];
        if ((kind === 'string' && kit !== 'friendly') || (kind === 'room' && kit !== 'glass') ||
            ((kind === 'take' || kind === 'next') && key.split(':')[2] !== kit)) {
          buffers.delete(key); bufferBytes -= b.length * b.numberOfChannels * 4;
        }
      }
    }
    S.prepare(S.ctx.sampleRate, kit);
  }
  new MutationObserver(() => {
    if (!S.ctx || lookIdle) return;
    lookIdle = true; idle(() => { lookIdle = false; warmLook(); });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-o55-nier-parts'] });
  /* Exact next-play takes for callouts and the large fixed stings. These recipes ignore musical rotation,
     step, helper, intensity and pitch drift; callout alone follows the chapter. Their random noise offsets
     still use the actual next play seed, after the two live-chain draws. Never substitute a different seed.
     Glass keeps dry PCM and pre-convolution room-feed PCM separate: both retain the live shaping chain. */
  const NEXT_EVENTS = new Set(['callout', 'commit', 'finish', 'success', 'error']);
  const nextKey = (rate, kit, ev, vi, chapter, seed) =>
    'next:' + rate + ':' + kit + ':' + seed + ':' + (ev === 'callout' ? chapter : 'fixed') + ':' + ev + ':' + vi;
  function renderNext(rate, kit, ev, vi, chapter, seed) {
    const cut = Math.floor(rate * 0.004), length = Math.ceil(rate * (tailOf(kit, ev) + 0.6));
    const off = new OfflineAudioContext(2, cut + length, rate), merge = off.createChannelMerger(2);
    merge.connect(off.destination);
    const out = off.createGain(), wet = off.createGain();
    [out, wet].forEach((g) => { g.channelCount = 1; g.channelCountMode = 'explicit'; });
    out.connect(merge, 0, 0); wet.connect(merge, 0, 1);
    /* Substitute the room's input, so this render contains the send before convolution, without its tail. */
    reverbs.set(off, wet);
    const r = O55.util.rng(0x5eed + seed * 7919); r(); const v = 1 + (r() - 0.5) * 0.04;
    run(poolOf(kit, ev)[vi], off, out, 0.004, v, mk(kit, ev, { chapter }, true, vi, r));
    return off.startRendering().then((b) => [0, 1].map((ch) => {
      const data = b.getChannelData(ch).subarray(cut);
      const n = ch === 1 && !data.some((x) => x !== 0) ? 1 : length;
      const pcm = new AudioBuffer({ length: n, numberOfChannels: 1, sampleRate: rate });
      if (n > 1) pcm.copyToChannel(data, 0);
      return pcm;
    }));
  }
  function prepareNext(rate, kit, chapter = music.chapter) {
    if (kit === 'nier' || rate < 8000 || rate > 96000 || typeof OfflineAudioContext === 'undefined') return Promise.resolve(true);
    const seed = playSeed, id = rate + ':' + kit, old = nextBanks.get(id), jobs = [];
    NEXT_EVENTS.forEach((ev) => poolOf(kit, ev).forEach((_, vi) => jobs.push({ ev, vi, key: nextKey(rate, kit, ev, vi, chapter, seed) })));
    if (old && old.seed === seed && old.chapter === chapter &&
        (!old.done || jobs.every(({key}) => buffers.has(key + ':dry') && buffers.has(key + ':wet')))) return old.promise;
    const wanted = new Set(jobs.flatMap(({key}) => [key + ':dry', key + ':wet']));
    for (const [key, b] of buffers) if (key.startsWith('next:' + rate + ':' + kit + ':') && !wanted.has(key)) {
      buffers.delete(key); bufferBytes -= b.length * b.numberOfChannels * 4;
    }
    const bank = { seed, chapter, done: false };
    nextBanks.set(id, bank);
    const current = () => nextBanks.get(id) === bank && playSeed === seed;
    bank.promise = jobs.reduce((p, { ev, vi, key }) => p.then(() => new Promise((res) => {
      if (!current()) { res(); return; }
      idle(() => { if (!current()) { res(); return; }
        renderNext(rate, kit, ev, vi, chapter, seed).then(([dry, wet]) => {
          if (current()) { keepBuffer(key + ':dry', dry); keepBuffer(key + ':wet', wet); }
        }).catch(() => {}).then(res);
      });
    })), Promise.resolve()).then(() => { bank.done = true; return current(); });
    return bank.promise;
  }
  /* Rehearse the first callback on a silent one-sample offline destination, once per live context/look.
     This pays the browser's first-use callback/node setup in idle time too. The queue, musical place and
     bookkeeping are restored synchronously; no log entry or source reaches the live master. NieR is untouched. */
  const primed = new WeakMap();
  function finishWarm(rate, kit) {
    return prepareNext(rate, kit).then((ok) => {
      if (typeof OfflineAudioContext === 'undefined') return ok;
      const ctx = S.ctx;
      if (!ok || !ctx || ctx.sampleRate !== rate || kit === 'nier' || ctx instanceof OfflineAudioContext ||
          (primed.get(ctx) && primed.get(ctx).has(kit))) return ok;
      return new Promise((res) => idle(() => { primePlayback(rate, kit); res(ok); }));
    });
  }
  function primePlayback(rate, kit) {
    if (typeof OfflineAudioContext === 'undefined') return;
    const ctx = S.ctx;
    if (!ctx || ctx.sampleRate !== rate || ctx instanceof OfflineAudioContext || kit !== kitFor('tap', {})) return;
    let done = primed.get(ctx); if (!done) { done = new Set(); primed.set(ctx, done); }
    if (done.has(kit)) return;
    const saved = { ctx, master: S.master, queue, flushing, recent, big, playSeed, rot: music.rot,
      starts: starts.slice(), active: active.slice(), played: Object.assign({}, playedAt) };
    try {
      const off = new OfflineAudioContext(2, 1, rate);
      S.ctx = off; S.master = buildMaster(off).master;
      music.rot = Object.assign({}, music.rot); starts.length = 0; active.length = 0; recent = null;
      queue = [{ kit, ev: 'callout', event: 'callout', opts: { variant: 0, intensity: 0.55, pan: 0 },
        entry: {}, prio: PRIO.callout, at: performance.now() }];
      flushing = true; flush(); off.startRendering().catch(() => {}); done.add(kit);
    } catch (_) { /* Preparation never prevents the original live fallback. */ }
    finally {
      S.ctx = saved.ctx; S.master = saved.master; queue = saved.queue; flushing = saved.flushing;
      recent = saved.recent; big = saved.big; playSeed = saved.playSeed; music.rot = saved.rot;
      starts.length = 0; starts.push(...saved.starts); active.length = 0; active.push(...saved.active);
      Object.keys(playedAt).forEach((key) => delete playedAt[key]); Object.assign(playedAt, saved.played);
    }
  }
  let nextIdle = false;
  function queueNext() {
    if (!S.ctx || !hasGesture() || nextIdle || (typeof OfflineAudioContext !== 'undefined' && S.ctx instanceof OfflineAudioContext)) return;
    nextIdle = true; idle(() => { nextIdle = false; prepareNext(S.ctx.sampleRate, kitFor('tap', {})); });
  }
  const takeOf = (rate, kit, ev, vi) => bufferOf('take:' + Math.round(rate) + ':' + kit + ':' + ev + ':' + vi);
  S.takeReady = (kit, ev, vi, rate) => {
    rate = rate || (S.ctx && S.ctx.sampleRate) || 0;
    const key = nextKey(rate, kit, ev, vi || 0, music.chapter, playSeed);
    return !!takeOf(rate, kit, ev, vi || 0) || (kit !== 'nier' && NEXT_EVENTS.has(ev) && buffers.has(key + ':dry') && buffers.has(key + ':wet'));
  };

  /* one sound: its chain (level and trim, darker when quiet, placed toward the click or where its helper stands) and
     the kit's recipe (or its pre-rendered take) */
  function voice(item) {
    const ctx = ensureContext();
    if (!ctx || ctx.state === 'closed') { drop(item, 'no-audio'); return null; }
    const { kit, ev, opts, entry } = item, fns = poolOf(kit, ev);
    const vi = opts.variant != null ? Math.max(0, Math.min(fns.length - 1, opts.variant | 0)) : pick(kit, ev, fns.length);
    const seed = playSeed;
    const k = mk(kit, ev, Object.assign({}, opts, { layer: item.layer }), false, vi, O55.util.rng(0x5eed + (playSeed++) * 7919));
    const inten = k.intensity;
    const pan = opts.pan != null && Number.isFinite(+opts.pan) ? +opts.pan
      : STAGE.has(item.event) && opts.voice != null ? STAGE_PAN[Math.max(0, opts.voice | 0) % 3] : (music.x - 0.5) * 0.9;
    /* the play's chain, which a Glass room send copies (reverb, chainOf) */
    const spec = {
      level: dB(trimOf(kit, ev) + (item.layer && ev === 'decode' ? -2 : 0)) * (0.9 + k.r() * 0.2) * (0.72 + inten * 0.47),
      lp: inten < 0.45 ? 2600 * Math.pow(2, inten * 7) : 0,
      shelf: inten > 0.8 ? (inten - 0.8) * 20 : 0,
      pan: Math.max(-1, Math.min(1, pan))
    };
    if (STAGE.has(item.event)) entry.pan = +spec.pan.toFixed(2); /* where on the stage it sounded */
    const g = ctx.createGain(); g.gain.value = spec.level; chainOf.set(g, spec);
    const sh = shape(ctx, spec, g); sh.head.connect(S.master);
    const nodes = [g].concat(sh.nodes);
    const t0 = ctx.currentTime + 0.004 + (item.layer && ev === 'pod' ? 0.09 : 0), v = 1 + (k.r() - 0.5) * 0.04;
    const take = takeOf(ctx.sampleRate, kit, ev, vi);
    const key = kit !== 'nier' && NEXT_EVENTS.has(ev) ? nextKey(ctx.sampleRate, kit, ev, vi, opts.chapter || music.chapter, seed) : null;
    const dry = key && bufferOf(key + ':dry'), wet = key && bufferOf(key + ':wet');
    try {
      if (dry && wet) {
        const start = Math.floor(t0 * ctx.sampleRate + 1e-6) / ctx.sampleRate;
        const src = ctx.createBufferSource(); src.buffer = dry; src.connect(g); src.start(start); nodes.push(src);
        if (wet.length > 1) { const roomSrc = ctx.createBufferSource(); roomSrc.buffer = wet;
          roomSrc.connect(reverb(ctx, g)); roomSrc.start(start); nodes.push(roomSrc); }
        entry.take = true; entry.prepared = true;
      }
      else if (take) {
        const src = ctx.createBufferSource(); src.buffer = take; src.connect(g);
        /* A warning take already contains the 4 ms offset's fractional sample; do not interpolate it twice. */
        src.start(ev === 'warn' ? Math.floor(t0 * ctx.sampleRate + 1e-6) / ctx.sampleRate : t0);
        nodes.push(src); entry.take = true;
      }
      else run(fns[vi], ctx, g, t0, v, k);
      entry.played = true; entry.variant = vi; if (item.layer) entry.layer = true;
      if (entry.voice != null) lastVoice[item.event] = entry.voice; /* the chord-note checks read the last voice that played */
    } catch (err) { entry.error = String(err && err.message || err); }
    const send = sendOf.get(g); if (spec.sendNodes) nodes.push(...spec.sendNodes);
    window.setTimeout(() => { nodes.forEach((n) => { try { n.disconnect(); } catch (_) {} }); }, Math.round((tailOf(kit, ev) + 2.6) * 1000));
    if (!BURST_FREE.has(item.event)) { starts.push(item.at); if (starts.length > 12) starts.shift(); }
    /* what is sounding, so a rest can fade it */
    const h = { gain: g, send, until: t0 + tailOf(kit, ev) + 0.5 };
    for (let i = active.length - 1; i >= 0; i--) if (active[i].until < ctx.currentTime) active.splice(i, 1);
    active.push(h);
    queueNext();
    return h;
  }
  /* several asked for in one moment: the most important plays. The moment is when each was asked for (a long render
     between the ask and the flush must not let a lesser sound stack on top) */
  /* the same event asked again inside the merge window is one sound twice — except when the repeat is the music:
     a stage chord tone whose helper's voice differs from the last one that played (the wake chord's three strings,
     the landings, the bows, the goodbye chord's three cheers; the same voice keeps its own RATE), and the rail walk's
     tick on every step (H3; its walk flag asks past the merge here and past RATE below, so the walk ticks step by
     step instead of every other step; final review minor 2 and minor 7). b is the note already accepted (win or
     recent), a the candidate; its entry carries what it played with. */
  function musicalRepeat(a, b) {
    if (!a || !b || a.event !== b.event) return false;
    if (a.opts.walk) return !!(b.entry && b.entry.walk);
    return !!(chordNote(a.event, a.opts) && b.entry && b.entry.voice != null && (a.opts.voice | 0) !== b.entry.voice);
  }
  /* a chord note: a stage tone whose voice differs from the last voice of its event that actually played. It is the
     chord's next note, not a repeat, so it asks past the same-event merge and past RATE too (a busy frame once
     dropped `string v2` to RATE.string 35 ms after v1); the same voice is a repeat and keeps both limits. */
  function chordNote(event, o) {
    return !!(STAGE.has(event) && o.voice != null && lastVoice[event] != null && (o.voice | 0) !== lastVoice[event]);
  }
  function flush() {
    flushing = false;
    const batch = queue; queue = [];
    if (!batch.length) return;
    batch.sort((a, b) => b.prio - a.prio);
    const win = batch[0], now = win.at, m = mNow();
    /* a celebration right after the big chord it belongs to plays as that chord's sparkles */
    if (win.event === 'celebrate') {
      const of = Object.keys(LAYER_AFTER).find((e) => playedAt[e] != null && m - playedAt[e] < LAYER_AFTER[e]);
      if (of) { win.layer = true; win.entry.layerOf = of; }
    }
    if (recent && now - recent.t < MERGE_MS && !musicalRepeat(win, recent)) {
      if (win.prio <= recent.prio) {
        if (layers(recent.event, win.event)) win.layer = true;
        else { batch.forEach((it) => drop(it, 'merged', recent.event)); return; }
      } else if (!layers(win.event, recent.event)) { fade(recent.handle, 0.03); if (recent.entry) recent.entry.cut = win.event; }
    }
    /* a burst (six sounds in half a second) keeps only what matters; texture, foley and ticks have their own limits */
    if (win.prio < 60 && !BURST_FREE.has(win.event) && starts.length >= 6 && now - starts[starts.length - 6] < 500) { batch.forEach((it) => drop(it, 'busy')); return; }
    const h = voice(win);
    if (h) {
      playedAt[win.event] = m; if ((win.event === 'chapter' || win.event === 'quest') && win.opts.depth >= 4) playedAt.resolve = m;
      if (win.prio >= 75 && !win.layer) big = { m, prio: win.prio, event: win.event };
    }
    if (h && !win.layer) recent = { t: now, prio: win.prio, event: win.event, handle: h, entry: win.entry };
    for (let i = 1; i < batch.length; i++) {
      const it = batch[i];
      if (!win.layer && layers(win.event, it.event)) { it.layer = true; voice(it); }
      else if (musicalRepeat(it, win)) voice(it);
      else drop(it, 'merged', win.event);
    }
  }

  const tour = () => { try { return O55.tour && O55.tour.st ? O55.tour : null; } catch (_) { return null; } };
  const creating = () => { try { return !!(O55.S && O55.S.open && O55.S.sess && O55.S.sess.screen === 'creating'); } catch (_) { return false; } };
  S.play = function play(asked, opts) { return request(asked, opts || {}, null); };
  /* late: { event, entry } when a deferred sound comes back to play (its gates are checked again, its entry reused) */
  function request(asked, o, late) {
    const now = performance.now(), m = mNow();
    if (!LAZY_REFRESH.has(asked) || now - refreshedAt > 250) S.refresh('play');
    let event = late ? late.event : chapterSting(asked, now, o);
    /* the Project saved: the onboarding plays its made moment as a 'commit' on the Creating screen (the Create press
       commits from Review, a retry plays nothing at its press), so a commit there is the save */
    if (!late && event === 'commit' && creating()) event = 'save';
    const converted = !late && event === 'chapter' && asked !== 'chapter';
    /* Pod 042's demonstration in NieR (the tour's Show Me): its travel and its hand-back take their 8-bit voice (the
       tour plays 'interrupt' only when a demonstration hands control back) */
    if (!late && (event === 'pointer' || event === 'interrupt') && kitFor(event, o) === 'nier') {
      const T = tour();
      if (event === 'pointer' && T && T.st.show) event = 'showPointer';
      else if (event === 'interrupt' && T && T.running) event = 'showInterrupt';
    }
    /* a sting: its chapter counts as stung this run (it never stings again), with the motif to its depth and the
       intensity arc unless the caller sets them */
    const sting = event === 'chapter' || event === 'quest';
    let po = o;
    if (sting && !late) {
      const ch = o.chapter || music.chapter;
      music.stung.add(ch); if (ch === music.chapter) music.announced = true;
      const depth = o.depth != null ? Math.max(0, Math.min(4, o.depth | 0)) : depthOf(ch);
      po = Object.assign({}, o, { depth, intensity: o.intensity != null ? o.intensity : ARC[depth] });
    }
    const kit = kitFor(event, po), ev = resolve(kit, event);
    const entry = late ? late.entry : logEntry({ t: Math.round(now), event, kit, family: kit, muted: S.muted });
    if (!late) {
      if (event !== asked) entry.asked = asked;
      if (ev && ev !== event) entry.resolved = ev;
      if (sting) entry.depth = po.depth;
      if (o.voice != null) entry.voice = o.voice | 0;
      if (o.walk) entry.walk = true;
      if (o.pan != null && Number.isFinite(+o.pan)) entry.pan = +(+o.pan).toFixed(2);
      if (o.step != null) entry.step = o.step | 0;
    } else { entry.kit = entry.family = kit; if (ev && ev !== event) entry.resolved = ev; }
    if (S.muted) { entry.muted = true; return false; }
    if (!ev) { entry.dropped = Object.prototype.hasOwnProperty.call(FALLBACK, event) || EVENTS.includes(event) ? 'silent' : 'unknown'; return false; }
    const lowres = !!(O55.motion && O55.motion.lowResource);
    if (lowres && LOWRES_SKIP.has(event)) { entry.dropped = 'lowres'; return false; }
    /* foley describes motion; under Reduced Motion that motion is not shown, so neither is its sound */
    if (FOLEY.has(event) && reducedMotion()) { entry.dropped = 'reduced'; return false; }
    if (!hasGesture()) { entry.dropped = 'gesture'; return false; }
    const prio = o.priority != null ? +o.priority : (PRIO[event] || 30);
    if (m < restUntil && prio < 75) { entry.dropped = 'rest'; return false; }
    /* the Project's save is that moment's sting: a goal card's 'quest' right after it says the same thing again */
    if (event === 'quest' && playedAt.save != null && m - playedAt.save < 1000) { entry.dropped = 'merged'; entry.by = 'save'; return false; }
    if (late && late.since != null && big.m >= late.since && big.prio >= prio && big.event !== event) { entry.dropped = 'merged'; entry.by = big.event; return false; }
    const rate = RATE[event];
    /* the rail walk's tick rides on every step (60 ms), under RATE.move (110 ms): a walk tick asks past the rate
       (its walk flag also lets the next tick through the same-event merge, see musicalRepeat in flush). A chord note
       (a stage tone with a new voice, chordNote above) asks past the rate too: the same voice keeps its RATE. */
    if (rate && !o.walk && !chordNote(event, o) && now - (lastAt[event] || -1e9) < rate * (lowres ? 1.8 : 1)) { entry.dropped = 'rate'; return false; }
    if (event === 'land') {
      while (landAt.length && now - landAt[0] > LAND_SPAN) landAt.shift();
      if (landAt.length >= LAND_MAX) { entry.dropped = 'rate'; return false; }
      landAt.push(now);
    }
    if (!late) {
      /* a resolution waits behind 150 ms of silence: the sting into the journey's last chapter (Ready) when it comes by
         itself, and a finish whose caller has not just rested */
      if ((converted && ORD[music.chapter] === 4) || (event === 'finish' && m - restAt > 600)) { S.rest(150); return defer(150, entry, event, po); }
      /* a 'found' or 'success' that would land on a sting waits for it: it plays 500 ms after the sting */
      if ((event === 'found' || event === 'success') && m - stingAt < 500) return defer(stingAt + 500 - m, entry, event, po);
    }
    lastAt[event] = now;
    if (sting) stingAt = m;
    queue.push({ kit, ev, event, opts: po, entry, prio, at: now });
    if (!flushing) { flushing = true; queueMicrotask(flush); }
    return true;
  }
  function defer(ms, entry, event, opts) {
    entry.deferred = Math.max(0, Math.round(ms));
    const since = mNow();
    later(ms, () => request(event, opts, { event, entry, since }));
    return true;
  }
  /* 150 ms (by default) of silence before a resolution: events under PRIO 75 are dropped meanwhile, and everything
     sounding fades out in 20 ms */
  S.rest = function rest(ms) {
    const span = Math.max(0, ms == null ? 150 : +ms || 0), m = mNow();
    restUntil = Math.max(restUntil, m + span); restAt = m;
    queue.forEach((it) => { if (it.prio < 75) drop(it, 'rest'); });
    queue = queue.filter((it) => it.prio >= 75);
    active.forEach((h) => fade(h, 0.02)); active.length = 0;
    logEntry({ t: Math.round(performance.now()), event: 'rest', ms: span, kit: null, family: null, muted: S.muted, rest: true });
    return true;
  };

  /* ---- one audio path for other synths (NieR Menu sounds): this context, master, mute and gesture rule ---- */
  let suppressUntil = 0;
  S.suppress = function suppress(ms) { suppressUntil = Math.max(suppressUntil, performance.now() + Math.max(0, ms == null ? 250 : +ms || 0)); return suppressUntil; };
  S.suppressed = () => performance.now() < suppressUntil;
  S.synth = function synth(fn, opts) {
    const o = opts || {};
    if (typeof fn !== 'function') return false;
    const now = performance.now();
    if (now - refreshedAt > 250) S.refresh('synth');
    if (S.muted || (!o.force && S.suppressed()) || !hasGesture()) return false;
    const prio = o.priority != null ? +o.priority : 40;
    if (!o.force && mNow() < restUntil && prio < 75) return false;
    if (!o.force && recent && now - recent.t < MERGE_MS && recent.prio >= prio) return false;
    const ctx = ensureContext(); if (!ctx || ctx.state === 'closed') return false;
    const g = ctx.createGain(); g.gain.value = 1; g.connect(S.master);
    try { fn(ctx, g, ctx.currentTime + 0.004); } catch (_) { try { g.disconnect(); } catch (e) {} return false; }
    logEntry({ t: Math.round(now), event: 'synth', name: o.name || null, kit: 'synth', muted: false, played: true });
    const h = { gain: g, until: ctx.currentTime + 1.5 }; active.push(h);
    if (!recent || now - recent.t >= MERGE_MS || prio > recent.prio) recent = { t: now, prio, event: o.name || 'synth', handle: h, entry: null };
    window.setTimeout(() => { try { g.disconnect(); } catch (_) {} }, 3500);
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
  /* a keyboard toggle keeps its focus: when the host redraws the control (the tour bar rebuilds its markup), the
     surface's new sound button takes focus back, so a second Space or Enter still reaches it (F3-520) */
  S.toggle = function toggle(source) {
    S.refresh('toggle');
    const a = document.activeElement;
    const host = a && a.matches && a.matches('button.o55-sound') ? (a.closest('#pm-o55-onboarding, #pm-o55-tour') || document) : null;
    const done = S.setMuted(!S.muted, source);
    if (host) queueMicrotask(() => {
      if (a.isConnected && document.activeElement === a) return;
      const now = document.activeElement;
      if (now && now !== document.body && now !== document.documentElement) return; /* focus went somewhere on purpose */
      const b = (host.isConnected ? host : document).querySelector('button.o55-sound');
      if (b) try { b.focus({ preventScroll: true }); } catch (_) {}
    });
    return done;
  };
  /* the markup is written the way the browser serialises it (paths closed with </path>), so a host that compares its
     slot's innerHTML with this string finds it unchanged after syncButtons() and leaves the focused button in place */
  /* (hint: a line more for its hover tag, the onboarding window's tip for the button, which has no room for a ?) */
  S.buttonHtml = function buttonHtml(cls, hint) {
    S.refresh('render');
    const on = !S.muted;
    const label = on ? O55.t('chrome.soundOn') : O55.t('chrome.soundOff');
    const path = (d) => `<path d="${d}"></path>`;
    const wave = WAVE[on ? 'on' : 'off'].map(path).join('');
    return `<button type="button" class="o55-sound ${cls || ''}" data-o55-do="sound" data-pm-hover-exempt="true" aria-pressed="${on}" aria-label="${O55.util.esc(label)}" title="${O55.util.esc(label + (hint ? '\n' + hint : ''))}"${hint ? ` data-o55-hint="${O55.util.esc(hint)}"` : ''}>`
      + (neonSvg(on) || `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path('M4 9.5h3.5L12 5.5v13l-4.5-4H4z')}${wave}</svg>`) + '</button>';
  };

  /* ---- the library: every sound a moment plays, by plain name, with the moment it plays at; renders and previews
     (independent of mute) ---- */
  const kebab = (s) => s.replace(/[A-Z]/g, (ch) => '-' + ch.toLowerCase());
  function buildCatalog() {
    const L = (kit) => O55.t('soundLibrary.looks.' + kit), E = (ev) => O55.t('soundLibrary.events.' + ev), out = [];
    KIT_NAMES.forEach((kit) => EVENTS.forEach((ev) => {
      if (retired(kit, ev)) return;
      const n = poolOf(kit, ev).length;
      for (let v = 0; v < n; v++) {
        out.push(Object.freeze({
          id: 'o55-' + kit + '-' + kebab(ev) + (n > 1 ? '-' + (v + 1) : ''),
          name: n > 1 ? O55.t('soundLibrary.entryNumbered', { look: L(kit), name: E(ev), n: v + 1 }) : O55.t('soundLibrary.entry', { look: L(kit), name: E(ev) }),
          title: n > 1 ? O55.t('soundLibrary.titleNumbered', { name: E(ev), n: v + 1 }) : E(ev),
          about: O55.t('soundLibrary.moments.' + ev),
          style: kit === 'nier' ? O55.t('soundLibrary.styleNier') : O55.t('soundLibrary.styleSetup', { look: L(kit) }),
          kit, event: ev, variant: v, variants: n, duration: +durOf(kit, ev, v).toFixed(2), featured: v === 0, source: O55.t('soundLibrary.source')
        }));
      }
    }));
    return Object.freeze(out);
  }
  S.CATALOG = buildCatalog();
  const BY_ID = new Map(S.CATALOG.map((e) => [e.id, e]));
  S.entry = (id) => BY_ID.get(id) || null;

  /* an offline render through the same master chain as the live sound (trim applied; no pan, no level jitter). The
     compressor holds a fresh context down for its first tens of milliseconds, so the sound starts after a settled
     lead-in that the result then leaves out. */
  const LEAD = 0.3;
  S.renderBuffer = async function renderBuffer(kit, event, variant, opts) {
    const o = opts || {};
    if (!KITS[kit] || typeof OfflineAudioContext === 'undefined') return null;
    const ev = resolve(kit, event); if (!ev) return null;
    const fns = poolOf(kit, ev), vi = Math.max(0, Math.min(fns.length - 1, (variant || 0) | 0));
    const rate = 44100, secs = o.seconds || Math.min(4.5, tailOf(kit, ev) + (kit === 'glass' ? 2.4 : 0.6));
    const ctx = new OfflineAudioContext(2, Math.ceil(rate * (secs + LEAD)), rate);
    const { master } = buildMaster(ctx);
    const g = ctx.createGain(); g.gain.value = dB(o.trim === false ? 0 : trimOf(kit, ev)); g.connect(master);
    const k = mk(kit, ev, o, true, vi, O55.util.rng('render:' + kit + ':' + ev + ':' + vi));
    run(fns[vi], ctx, g, LEAD, 1, k);
    const buf = await ctx.startRendering();
    /* from 5 ms before the sound; without o.seconds, trailing silence trimmed (under -66 dB) with 40 ms of air */
    const from = Math.round(rate * (LEAD - 0.005));
    let end = buf.length - 1;
    if (!o.seconds) {
      end = from;
      for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); for (let i = d.length - 1; i > end; i--) if (Math.abs(d[i]) > 0.0005) { end = i; break; } }
      end = Math.min(buf.length - 1, end + Math.round(rate * 0.04));
    }
    const len = Math.max(1, end - from + 1);
    const outBuf = new AudioBuffer({ length: len, numberOfChannels: buf.numberOfChannels, sampleRate: rate });
    for (let ch = 0; ch < buf.numberOfChannels; ch++) outBuf.copyToChannel(buf.getChannelData(ch).subarray(from, from + len), ch);
    return outBuf;
  };
  function mono(buf) {
    const n = buf.length, m = new Float32Array(n), chs = buf.numberOfChannels;
    for (let ch = 0; ch < chs; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < n; i++) m[i] += d[i] / chs; }
    return m;
  }
  /* WAV (16-bit mono) of one render, with its peak and loudness (RMS over the 10 ms windows within 20 dB of the loudest) */
  S.renderWav = async function renderWav(kit, event, seconds, variant) {
    const buf = await S.renderBuffer(kit, event, variant, seconds ? { seconds } : null);
    if (!buf) return null;
    const data = mono(buf), rate = buf.sampleRate;
    let peak = 0; for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
    const W = Math.round(rate * 0.01), wins = [];
    for (let i = 0; i + W <= data.length; i += W) { let p = 0; for (let j = i; j < i + W; j++) p += data[j] * data[j]; wins.push(p / W); }
    const top = wins.length ? Math.max(...wins) : 0, act = wins.filter((p) => p > top / 100);
    const rms = act.length ? Math.sqrt(act.reduce((a, b) => a + b, 0) / act.length) : 0;
    const bytes = new DataView(new ArrayBuffer(44 + data.length * 2));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); bytes.setUint32(4, 36 + data.length * 2, true); w(8, 'WAVE'); w(12, 'fmt '); bytes.setUint32(16, 16, true);
    bytes.setUint16(20, 1, true); bytes.setUint16(22, 1, true); bytes.setUint32(24, rate, true); bytes.setUint32(28, rate * 2, true);
    bytes.setUint16(32, 2, true); bytes.setUint16(34, 16, true); w(36, 'data'); bytes.setUint32(40, data.length * 2, true);
    for (let i = 0; i < data.length; i++) bytes.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 0x7fff, true);
    let bin = ''; const u8 = new Uint8Array(bytes.buffer); for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    const db = (x) => +(20 * Math.log10(Math.max(1e-9, x))).toFixed(1);
    return { base64: btoa(bin), peak: +peak.toFixed(4), peakDb: db(peak), rmsDb: db(rms), seconds: +(data.length / rate).toFixed(3) };
  };
  /* a waveform for a library card: n bar heights (0..1) from the render */
  S.bars = async function bars(id, n) {
    const e = BY_ID.get(id); if (!e) return null;
    const buf = await S.renderBuffer(e.kit, e.event, e.variant); if (!buf) return null;
    const d = mono(buf), count = n || 18, size = Math.max(1, Math.floor(d.length / count)), out = [];
    for (let b = 0; b < count; b++) { let p = 0; for (let i = b * size; i < Math.min(d.length, (b + 1) * size); i++) p = Math.max(p, Math.abs(d[i])); out.push(p); }
    const top = Math.max(1e-6, ...out);
    return out.map((p) => +(Math.sqrt(p / top)).toFixed(3));
  };
  /* the library's Preview button: plays one entry now, through this context and master, never muted (the press is the
     explicit gesture); one preview at a time */
  let previewing = null;
  S.stopPreview = function stopPreview() {
    if (!previewing) return false;
    const p = previewing; previewing = null;
    /* the dry sound and its room send both fade (the room's tail already sounding rings out) */
    const send = sendOf.get(p.gain);
    [p.gain, send].forEach((n) => { if (!n) return; try { const t = S.ctx.currentTime; n.gain.cancelScheduledValues(t); n.gain.setValueAtTime(n.gain.value, t); n.gain.linearRampToValueAtTime(0, t + 0.04); } catch (_) {} });
    window.setTimeout(() => { try { p.gain.disconnect(); } catch (_) {} }, 120);
    return true;
  };
  S.preview = async function preview(id, opts) {
    const e = BY_ID.get(id), o = opts || {};
    if (!e) return { ok: false, id, code: 'unknown_sound' };
    const ctx = ensureContext();
    if (!ctx) return { ok: false, id, code: 'audio_unavailable' };
    if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (_) {} }
    if (ctx.state !== 'running') return { ok: false, id, code: 'audio_not_running' };
    S.stopPreview();
    const g = ctx.createGain(); g.gain.value = dB(trimOf(e.kit, e.event)) * Math.max(0, Math.min(1, (o.volume == null ? 100 : +o.volume) / 100)); g.connect(S.master);
    const k = mk(e.kit, e.event, {}, true, e.variant, O55.util.rng('render:' + e.kit + ':' + e.event + ':' + e.variant));
    try { run(poolOf(e.kit, e.event)[e.variant], ctx, g, ctx.currentTime + 0.02, 1, k); } catch (err) { return { ok: false, id, code: 'audio_start_failed', message: String(err && err.message || err) }; }
    const mine = previewing = { id, gain: g }, spec = chainOf.get(g);
    window.setTimeout(() => { if (previewing === mine) previewing = null; [g].concat((spec && spec.sendNodes) || []).forEach((n) => { try { n.disconnect(); } catch (_) {} }); }, Math.round((e.duration + 2.6) * 1000));
    logEntry({ t: Math.round(performance.now()), event: e.event, kit: e.kit, family: e.kit, muted: S.muted, played: true, variant: e.variant, preview: id });
    return { ok: true, id, duration: e.duration };
  };

  /* ---- Pip's voice (PM7 build, lane found, 2026-10-29; HANDOFF conflict 8, O4, O5, S3, S4, SND1) ----
     One say() voice per look, through this one player: under general.interaction.sound-effects (S.muted, the master
     switch) and its first-gesture rule, and under Pip's parts (PM_PIP_PARTS): a setup line sounds only with the
     setup-voice part on, an in-app chirp only with app-voice (off by default), setup music only with setup-music. No
     storage of its own: no localStorage key, no second switch. Reduced Motion never mutes (O5).
     Ported from the approved Pip concept (Concepts/onboarding/opus-5.5-pip/sound.js, "Pip's voice"): live synthesis
     (O4). A line becomes babble in its look's voice (one syllable per vowel group, onsets from the consonants, a contour
     from the punctuation and the mood), timed to the typing, so the stage types the line at the pace it is said.
     Voices: friendly (soft formant), glass (airy formant with breath), basic (a clean chirp), phosphor (Retro Dark's
     chip pulse), teletype (Retro Light's struck keys), nier (a Pod's stepped chirp). Levels are the concept's measured
     'say' and vocal trims; lane onb's sound tools re-measure them in this player and Jared listens once (SND1).

     API: O55.sound.pip (O55.sound.say is pip.say)
       say(text, { mood?, look? | voice?, where? 'setup' (default) | 'app', crew? 'pip' | 'crown' | 'hardhat' |
           'glasses', pan? -1..1 }) -> { ms, cps, played }   the timing always; sound only when allowed. A new line
           cuts the last one.
       hush()                     stops the line now
       timing(text, o)            -> { ms, cps }, never sounds
       vocal(name, o) -> bool     a scripted non-verbal sound: wake, sleep, think, happy, wink, alert, cheer, crew
       voiceOf(look?)             -> the voice id for a look (default: the painted one, PMLogo.look())
       allowed(where?)            -> may Pip sound there now (switch, gesture, part, holds)
       hold(name, on) / held()    a named extra mute for Pip's voice, kits and music
       registerKit(id, { events: { name: fn(ctx, out, t0, opts) }, trim?: { name: dB } }) -> bool   lane onb's kits
           (id: a voice id, or any id passed as opts.kit)
       play(event, { kit?, look?, pan?, intensity?, priority?, motion? }) -> bool   a registered kit's event through
           synth() (mute, gesture, rest and merge rules); motion: true drops it under Reduced Motion (foley that only
           describes motion)
       registerMusic(id, { start(ctx, out, t0, opts) -> { stop(t, fade) } }) -> bool   setup music and loops
       music(id, opts) -> bool    one at a time, with the setup-music part on and sound allowed; it stops when sound
                                  goes off, the part goes off, a hold starts, or stopMusic(fade = .4)
       kits(), musics()           registered ids
       chatMute                   the chat's mute while hosted (5.6 Pro/chat-sound.js muted / setMuted): { muted (getter),
                                  setMuted(m) -> bool (writes the Project's row through setMuted above), onChange(cb) -> off } */
  S.pip = (function pipVoice() {
    const W = window;
    /* ---- small synth helpers of the concept's own (kept apart from the kits' primitives above) */
    function rng(seed) {
      let a = seed >>> 0;
      return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    }
    const VR = Math.random;
    const jit = (a) => (VR() * 2 - 1) * a;
    const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const db = (d) => Math.pow(10, d / 20);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const RES = new WeakMap();
    const res = (c) => { let r = RES.get(c); if (!r) { r = { waves: {} }; RES.set(c, r); } return r; };
    function noiseBuf(c) {
      const r = res(c); if (r.noise) return r.noise;
      const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0), q = rng(11);
      for (let i = 0; i < len; i++) d[i] = q() * 2 - 1;
      return (r.noise = b);
    }
    function pulseWave(c, duty) {
      const r = res(c), k = String(duty); if (r.waves[k]) return r.waves[k];
      const n = 40, re = new Float32Array(n), im = new Float32Array(n);
      for (let i = 1; i < n; i++) im[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty) * (i > 24 ? 0.5 : 1);
      return (r.waves[k] = c.createPeriodicWave(re, im));
    }
    function filt(c, from, type, f, q) { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q == null ? 0.7 : q; from.connect(b); return b; }
    function envG(c, t, peak, a, d) {
      const g = c.createGain(), p = Math.max(2e-4, peak);
      a = Math.max(0.0008, a); d = Math.max(a + 0.004, d);
      g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(p, t + a); g.gain.exponentialRampToValueAtTime(1e-4, t + d);
      return g;
    }
    function hiss(c, out, t, o) {
      const s = c.createBufferSource(); s.buffer = noiseBuf(c); s.loop = true;
      const b = c.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = o.q == null ? 1 : o.q; b.frequency.setValueAtTime(o.f || 2000, t);
      const g = envG(c, t, o.g == null ? 0.1 : o.g, 0.002, o.d);
      s.connect(b); b.connect(g); g.connect(out);
      s.start(t, VR()); s.stop(t + o.d + 0.05);
      return s;
    }

    /* ---- the voices (concept tables, unchanged) */
    const FORM = { a: [800, 1250, 2600], e: [500, 1850, 2550], i: [320, 2300, 3000], o: [520, 880, 2450], u: [340, 800, 2300], m: [260, 1050, 2300] };
    const ONSET = { p: [2300, 0.55, 0.012], s: [5200, 0.32, 0.05], h: [1500, 0.25, 0.045], n: null, l: null };
    const MOOD = {
      idle: { st: 0, bounce: 1, rate: 1, bright: 1 }, happy: { st: 3, bounce: 1.35, rate: 1.08, bright: 1.15 },
      think: { st: -2, bounce: 0.6, rate: 0.86, bright: 0.85, hum: true }, alert: { st: 5, bounce: 1.1, rate: 1.2, bright: 1.2 },
      sleep: { st: -6, bounce: 0.35, rate: 0.72, bright: 0.6 }, wink: { st: 2, bounce: 1.25, rate: 1.05, bright: 1.1 },
      dots: { st: -1, bounce: 0.8, rate: 0.92, bright: 0.9 }, oops: { st: -3, bounce: 0.7, rate: 0.94, bright: 0.85 },
      watch: { st: 1, bounce: 1.1, rate: 0.96, bright: 1.05 }, wonder: { st: 4, bounce: 1.2, rate: 1.04, bright: 1.15 }
    };
    MOOD.working = MOOD.dots; MOOD.error = MOOD.oops;
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
    const VOICES = Object.keys(VOX);
    /* the concept's measured trims (tools/sound_levels.mjs) for the line and the vocal sounds, dB */
    const TRIM = {
      friendly: { say: -5, wake: -4, sleep: 2.5, think: -12, happy: -5, wink: -3, alert: -8.5, cheer: -3, crew: -5.5 },
      glass: { say: -13, wake: -9, sleep: -3, think: -14, happy: -11.5, wink: -10, alert: -16.5, cheer: -8.5, crew: -12 },
      basic: { say: -7, wake: -7.5, sleep: -5.5, think: -4.5, happy: -8, wink: -7.5, alert: -9.5, cheer: -6.5, crew: -6.5 },
      phosphor: { say: 2, wake: 3, sleep: 4.5, think: 2.5, happy: 2, wink: 1.5, alert: 0.5, cheer: 4, crew: 6 },
      teletype: { say: 1.5, wake: 2, sleep: 3.5, think: 1.5, happy: 1, wink: 1.5, alert: 1.5, cheer: 4.5, crew: 3.5 },
      nier: { say: -3.5, wake: -4, sleep: -2.5, think: 17.5, happy: -4.5, wink: -4, alert: -5.5, cheer: 14.5, crew: -7 }
    };
    const LEVEL = 0.7;   // the concept's master makeup (1 / 1.42), so a trim means what it meant there
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
          out.push({ i0, i1, v: digit ? 'i' : vowelOf(w.slice(a, b)), on: onsetOf(w.slice(prevEnd, a)), stress: gi === 0 && groups.length > 1, wi });
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
        out.push({ t: i / cps, d: V.maxSyl, deg: vow ? 4 + (h % 3) : h, p: 0, p2: 0, g: vow ? 1 : 0.85 });
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

    /* one graph per line, its pitch, formants and level moved syllable by syllable. Returns { stop(t), end } */
    function voice(c, out, t0, script, vk, opt) {
      const V = VOX[vk], C = CREW[(opt && opt.crew) || 'pip'] || CREW.pip, mood = MOOD[(opt && opt.mood) || 'idle'] || MOOD.idle;
      if (V.kind === 'tick') return tickVoice(c, out, t0, script, V, C);
      const last = new Map();
      const setT = (p, v, t, tc) => { const lt = last.get(p) || 0; t = Math.max(t, lt + 1e-4); last.set(p, t); p.setTargetAtTime(v, t, Math.max(0.0008, tc)); };
      const end = script.reduce((mx, s) => Math.max(mx, s.t + s.d), 0), stopAt = t0 + end + 0.4;
      const oscs = [], fps = [], pitched = [];
      const env = c.createGain(); env.gain.setValueAtTime(0, t0); env.connect(out);
      const mk = (type, mul, wave) => { const o = c.createOscillator(); if (wave) o.setPeriodicWave(wave); else o.type = type; o.start(t0); o.stop(stopAt); oscs.push(o); pitched.push(o); fps.push([o.frequency, mul]); return o; };
      let bands = null, ng = null, nbp = null;
      const base = (V.base || 300) * C.mul;
      if (V.kind === 'formant') {
        const mix = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = V.lp * (mood.bright || 1); lp.Q.value = 0.5; lp.connect(env);
        mk(V.w1, 1).connect(mix);
        const saw = (V.saw || 0) + C.grit;
        if (saw > 0) { const g2 = c.createGain(); g2.gain.value = saw; mk('sawtooth', 1).connect(g2); g2.connect(mix); }
        if (V.oct) { const g3 = c.createGain(); g3.gain.value = V.oct; mk('sine', 2).connect(g3); g3.connect(mix); }
        if (V.breath) { const nb = c.createBufferSource(); nb.buffer = noiseBuf(c); nb.loop = true; const bg = c.createGain(); bg.gain.value = V.breath; nb.connect(bg); bg.connect(mix); nb.start(t0, VR()); nb.stop(stopAt); oscs.push(nb); }
        bands = [0, 1, 2].map((j) => { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = V.q * (j ? 1.3 : 1); b.frequency.value = FORM.a[j] * V.fs; const g = c.createGain(); g.gain.value = [1, 0.62, 0.28][j] * (j ? mood.bright || 1 : 1) * 3.2; mix.connect(b); b.connect(g); g.connect(lp); return b; });
        const dg = c.createGain(); dg.gain.value = V.direct || 0.2; mix.connect(dg); dg.connect(lp);
        if (V.shimmer) { const sg = c.createGain(); sg.gain.value = V.shimmer; mk('sine', 4).connect(sg); sg.connect(lp); }
      } else if (V.kind === 'chirp') {
        // a clean tone; NieR's adds a quiet third harmonic for a glassy, digital edge
        const o1 = mk(V.w1 || 'sine', 1);
        if (V.harm) { filt(c, o1, 'lowpass', V.lp || 4000, 0.5).connect(env); const hg = c.createGain(); hg.gain.value = V.harm; mk('sine', 3).connect(hg); hg.connect(env); } else o1.connect(env);
      } else {
        filt(c, mk(null, 1, pulseWave(c, V.duty)), 'lowpass', V.lp, 0.6).connect(env);
      }
      if (V.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = V.vib[0]; lg.gain.value = V.vib[1]; l.connect(lg); pitched.forEach((o) => lg.connect(o.detune)); l.start(t0); l.stop(stopAt); oscs.push(l); }
      if (V.kind === 'formant' || V.kind === 'chirp') {
        const ns = c.createBufferSource(); ns.buffer = noiseBuf(c); ns.loop = true; nbp = c.createBiquadFilter(); nbp.type = 'bandpass'; nbp.Q.value = 1.2; nbp.frequency.value = 2500;
        ng = c.createGain(); ng.gain.setValueAtTime(0, t0); ns.connect(nbp); nbp.connect(ng); ng.connect(out); ns.start(t0, VR()); ns.stop(stopAt); oscs.push(ns);
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
          try { env.gain.cancelScheduledValues(t); env.gain.setTargetAtTime(0, t, 0.01); } catch (_) { /* already gone */ }
          if (ng) try { ng.gain.cancelScheduledValues(t); ng.gain.setTargetAtTime(0, t, 0.005); } catch (_) { /* already gone */ }
          oscs.forEach((o) => { try { o.stop(t + 0.08); } catch (_) { /* already stopped */ } });
        }
      };
    }
    /* Retro Light's voice: each blip a struck note (and a faint twelfth) with the light tick of a key; one note at a time */
    function tickVoice(c, out, t0, script, V, C) {
      const tr = 12 * Math.log2(C.mul), q = V.quant, srcs = [], env = c.createGain(); env.gain.setValueAtTime(0, t0); env.connect(out);
      const end = script.reduce((mx, s) => Math.max(mx, s.t + s.d * 2.2), 0), stopAt = t0 + end + 0.3;
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
      return { end: stopAt, stop(t) { env.gain.cancelScheduledValues(t); env.gain.setTargetAtTime(0, t, 0.005); srcs.forEach(([ts, o]) => { try { o.stop(ts > t ? t : t + 0.05); } catch (_) { /* gone */ } }); } };
    }
    function scriptFor(vk, name) {
      const V = VOX[vk], s = VS[name];
      if (V.kind === 'pulse' || V.kind === 'tick') return blipsFromScript(s, V);
      if (V.mono) return s.map((q) => Object.assign({}, q, { p: q.p * 0.25, p2: q.p2 * 0.25, d: Math.min(q.d, 0.2) }));
      return s;
    }

    /* ---- gates */
    const holds = new Set();
    const parts = () => W.PM_PIP_PARTS;
    function part(id, fallback) { const P = parts(); try { return P && typeof P.get === 'function' ? P.get(id) : fallback; } catch (_) { return fallback; } }
    function soundOn() {
      if (performance.now() - refreshedAt > 250) S.refresh('synth');
      return !S.muted && !holds.size && hasGesture();
    }
    const partFor = (where) => (where === 'app' ? 'app-voice' : 'setup-voice');
    const allowed = (where) => soundOn() && part(partFor(where), where === 'app' ? false : true);
    function voiceOf(look) {
      let lk = look;
      if (!lk) { try { lk = W.PMLogo ? W.PMLogo.look() : ''; } catch (_) { lk = ''; } }
      lk = String(lk || '');
      if (VOX[lk]) return lk;
      if (lk === 'retro-dark') return 'phosphor';
      if (lk === 'retro-light') return 'teletype';
      return { friendly: 'friendly', glass: 'glass', basic: 'basic', nier: 'nier', retro: 'phosphor' }[lk.split('-')[0]] || 'basic';
    }
    /* one chain per sound: trim and pan into the master, gone when the sound is */
    function chain(c, vk, name, o, life) {
      const g = c.createGain();
      g.gain.value = db((TRIM[vk] && TRIM[vk][name]) || 0) * LEVEL;
      let head = g;
      if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = o.pan != null ? clamp(+o.pan || 0, -1, 1) : jit(0.12); g.connect(p); head = p; }
      head.connect(S.master);
      W.setTimeout(() => { try { head.disconnect(); } catch (_) {} try { g.disconnect(); } catch (_) {} }, Math.round(life * 1000) + 600);
      return g;
    }

    /* ---- the line */
    let line = null;
    function hush() { if (line && S.ctx) { try { line.stop(S.ctx.currentTime); } catch (_) {} } line = null; }
    function timing(text, o, vk) {
      const V = VOX[vk || (o && o.voice && VOX[o.voice] ? o.voice : voiceOf(o && o.look))];
      const M = MOOD[(o && o.mood) || 'idle'] || MOOD.idle, C = CREW[(o && o.crew) || 'pip'] || CREW.pip;
      const cps = Math.round(V.cps * M.rate * C.rate * 10) / 10, n = String(text || '').length;
      return { cps, ms: n ? Math.round((n / cps) * 1000 + 140) : 0 };
    }
    function speak(build, vk, name, o) {
      const ctx = ensureContext();
      if (!ctx || ctx.state === 'closed' || mNow() < restUntil) return false;
      const script = build();
      if (!script || !script.length) return false;
      const t0 = ctx.currentTime + 0.006, end = script.reduce((mx, s) => Math.max(mx, s.t + s.d * 2.2), 0) + 0.5;
      line = voice(ctx, chain(ctx, vk, name, o, end), t0, script, vk, o);
      line.part = partFor(o.where);   // the part this line sounds under: it stops when that part goes off
      logEntry({ t: Math.round(performance.now()), event: 'pip:' + name, kit: vk, muted: false, played: true });
      return true;
    }
    function say(text, opts) {
      const o = opts || {}, vk = o.voice && VOX[o.voice] ? o.voice : voiceOf(o.look), t = timing(text, o, vk);
      // a line that may not sound leaves the one speaking alone (an app chirp with app-voice off never cuts setup)
      if (!text || !allowed(o.where)) return Object.assign(t, { played: false });
      hush();
      const V = VOX[vk];
      const played = speak(() => (V.kind === 'pulse' || V.kind === 'tick' ? blipScript(text, V, o.mood, t.cps) : textScript(text, V, o.mood, t.cps)), vk, 'say', o);
      return Object.assign(t, { played });
    }
    function vocal(name, opts) {
      const o = opts || {}, vk = o.voice && VOX[o.voice] ? o.voice : voiceOf(o.look);
      if (!VS[name] || !allowed(o.where)) return false;
      hush();
      return speak(() => scriptFor(vk, name), vk, name, o);
    }

    /* ---- lane onb's kits and music */
    const KITS2 = Object.create(null), MUSIC = Object.create(null);
    function registerKit(id, def) {
      if (!id || !def || !def.events || typeof def.events !== 'object') return false;
      KITS2[String(id)] = def; return true;
    }
    function play(event, opts) {
      const o = opts || {};
      if (o.kit != null && !KITS2[o.kit]) return false;   // a kit asked for by name and not registered plays nothing
      const kid = o.kit != null ? String(o.kit) : voiceOf(o.look), k = KITS2[kid], fn = k && k.events[event];
      if (typeof fn !== 'function' || holds.size) return false;
      if (o.motion && reducedMotion()) return false;
      const trim = k.trim && k.trim[event] != null ? +k.trim[event] : 0, int = o.intensity == null ? 1 : clamp(+o.intensity, 0, 1);
      return S.synth((ctx, out, t0) => {
        let head = ctx.createGain(); head.gain.value = db(trim) * int; head.connect(out);
        if (ctx.createStereoPanner && o.pan != null) { const p = ctx.createStereoPanner(); p.pan.value = clamp(+o.pan || 0, -1, 1); p.connect(head); head = p; }
        fn(ctx, head, t0, o);
      }, { name: 'pip:' + event, priority: o.priority });
    }
    let tune = null;
    function registerMusic(id, def) { if (!id || !def || typeof def.start !== 'function') return false; MUSIC[String(id)] = def; return true; }
    const musicOk = () => soundOn() && part('setup-music', true);
    function stopMusic(fade) {
      const m = tune; tune = null;
      if (!m || !S.ctx) return;
      const f = fade == null ? 0.4 : Math.max(0, +fade || 0), t = S.ctx.currentTime;
      try { if (m.h && typeof m.h.stop === 'function') m.h.stop(t, f); } catch (_) {}
      try { m.g.gain.cancelScheduledValues(t); m.g.gain.setTargetAtTime(0, t, Math.max(0.01, f / 3)); } catch (_) {}
      W.setTimeout(() => { try { m.g.disconnect(); } catch (_) {} }, Math.round(f * 1000) + 800);
    }
    function music(id, opts) {
      const def = MUSIC[id];
      if (!def) return false;
      if (tune && tune.id === id) return true;
      stopMusic(0.3);
      if (!musicOk()) return false;
      const ctx = ensureContext(); if (!ctx || ctx.state === 'closed') return false;
      const g = ctx.createGain(); g.gain.value = 1; g.connect(S.master);
      let h = null;
      try { h = def.start(ctx, g, ctx.currentTime + 0.01, opts || {}); } catch (_) { try { g.disconnect(); } catch (e) {} return false; }
      tune = { id, g, h };
      return true;
    }
    /* sound off, a hold, or the part going off: the line and the music stop */
    function follow() {
      if (S.muted || holds.size) { hush(); stopMusic(0.2); return; }
      if (tune && !part('setup-music', true)) stopMusic(0.4);
      if (line && !part(line.part, line.part !== 'app-voice')) hush();
    }
    W.addEventListener('o55:sound', follow);
    W.addEventListener('pm7.pip-parts.changed', follow);
    function hold(name, on) { const n = String(name || 'hold'); if (on === false) holds.delete(n); else holds.add(n); follow(); return holds.size > 0; }

    const chatMute = Object.freeze({
      get muted() { if (performance.now() - refreshedAt > 250) S.refresh('synth'); return !!S.muted; },
      setMuted(m) { return S.setMuted(!!m, 'chat'); },
      onChange(cb) {
        if (typeof cb !== 'function') return () => {};
        const h = (e) => { try { cb(!!(e && e.detail ? e.detail.muted : S.muted)); } catch (_) { /* a listener's error is its own */ } };
        W.addEventListener('o55:sound', h);
        return () => W.removeEventListener('o55:sound', h);
      }
    });

    return Object.freeze({
      VOICES, say, hush, timing: (text, o) => timing(text, o), vocal, voiceOf, allowed, hold, held: () => [...holds],
      registerKit, play, registerMusic, music, stopMusic, kits: () => Object.keys(KITS2), musics: () => Object.keys(MUSIC),
      playing: () => ({ line: !!line, music: tune ? tune.id : null }), chatMute
    });
  })();
  S.say = S.pip.say;

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
    const queueRefresh = () => { if (watchTimer) return; watchTimer = setTimeout(() => { watchTimer = 0; try { S.refresh('project'); } catch (_) {} }, 40); };
    const label = document.getElementById('projectMenuLabel'), menu = document.getElementById('projectMenu');
    if (label) new MutationObserver(queueRefresh).observe(label, { childList: true, characterData: true, subtree: true });
    if (menu) new MutationObserver(queueRefresh).observe(menu, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }
  (function bootBinding() {
    try { S.refresh('load'); } catch (_) {}
    const late = () => { try { S.refresh('dom'); } catch (_) {} try { installBindingWatch(); } catch (_) {} };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', late, { once: true });
    else late();
  })();
})();
