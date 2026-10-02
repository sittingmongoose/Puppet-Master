/* chat-sound.js -- Chat WOW (2026-09-26). Synthesised sound for the live chat.
 *
 * One kit per motion voice (basic | friendly | glass | retro; light and dark share
 * a kit, as they share a voice). No audio files: tones, FM and filtered noise with
 * envelopes, built on any BaseAudioContext so an OfflineAudioContext renders the
 * exact same sounds for checking (PM56_SOUND.renderWav).
 *
 * Events, each paired with a visual beat -- sound never carries information alone:
 *   send      the text leaving the composer          (turn-stream.js flight)
 *   first     the first word of a reply              (turn-stream.js)
 *   work      a working card is born                 (turn-stage.js birth)
 *   tick      a subject finished                     (observed here; throttled)
 *   fail      a subject failed                       (observed here)
 *   needs     the run waits for the reader           (turn-stream.js director)
 *   answer    the answer starts, the card folds      (turn-stream.js)
 *   complete  a reply finished                       (turn-stream.js)
 *   stop      a reply was stopped                    (turn-stream.js)
 *
 * On by default, one click to mute (the speaker in the chat header), remembered.
 * Audio starts on the first real gesture (browsers block autoplay); autostarting
 * demos stay silent until then. At most one event per 120ms; bursts of finished
 * subjects collapse to one tick. Reduced motion does not mute sound.
 * Production maps these events onto Notifications & Sounds.
 */
(function () {
  'use strict';
  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;
  var KEY = 'pm56.chatSound';
  var S = { muted: false, ctx: null, master: null, last: 0, lastTick: 0, ticks: [], log: [] };
  try { S.muted = localStorage.getItem(KEY) === 'off'; } catch (e) { }

  /* ---- primitives ------------------------------------------------------- */
  var note = function (n) { return 440 * Math.pow(2, (n - 69) / 12); };
  var seed = 11;
  function rng() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function noiseBuffer(ctx, sec) {
    var len = Math.max(1, Math.ceil(ctx.sampleRate * sec)), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = rng() * 2 - 1;
    return buf;
  }
  function env(ctx, t0, peak, a, dur) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + Math.max(0.001, a));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    return g;
  }
  function tone(ctx, out, t0, o) {
    var osc = ctx.createOscillator();
    if (o.wave) osc.setPeriodicWave(o.wave(ctx)); else osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.glide || o.dur));
    var g = env(ctx, t0, o.gain == null ? 0.05 : o.gain, o.a == null ? 0.004 : o.a, o.dur || 0.2);
    var node = osc;
    if (o.lp) { var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; osc.connect(f); node = f; }
    node.connect(g); g.connect(out); if (o.send) g.connect(o.send);
    osc.start(t0); osc.stop(t0 + (o.dur || 0.2) + 0.05);
  }
  function fm(ctx, out, t0, o) {
    var car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain();
    car.frequency.setValueAtTime(o.f, t0); mod.frequency.setValueAtTime(o.f * o.ratio, t0);
    mg.gain.setValueAtTime(o.f * o.index, t0);
    mg.gain.exponentialRampToValueAtTime(Math.max(1, o.f * o.index * 0.02), t0 + o.dur * 0.6);
    mod.connect(mg); mg.connect(car.frequency);
    var g = env(ctx, t0, o.gain == null ? 0.04 : o.gain, o.a == null ? 0.002 : o.a, o.dur);
    car.connect(g); g.connect(out); if (o.send) g.connect(o.send);
    car.start(t0); mod.start(t0); car.stop(t0 + o.dur + 0.05); mod.stop(t0 + o.dur + 0.05);
  }
  function noise(ctx, out, t0, o) {
    var src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, o.dur + 0.05);
    var f = ctx.createBiquadFilter(); f.type = o.filter || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.f || 2000, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur);
    var g = env(ctx, t0, o.gain == null ? 0.03 : o.gain, o.a == null ? 0.002 : o.a, o.dur);
    src.connect(f); f.connect(g); g.connect(out); if (o.send) g.connect(o.send);
    src.start(t0); src.stop(t0 + o.dur + 0.05);
  }
  var reverbs = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function reverb(ctx, out) {
    if (reverbs && reverbs.has(ctx)) return reverbs.get(ctx);
    var conv = ctx.createConvolver(), len = Math.ceil(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (rng() * 2 - 1) * Math.pow(1 - i / len, 3.4); }
    conv.buffer = ir; var wet = ctx.createGain(); wet.gain.value = 0.28; conv.connect(wet); wet.connect(out);
    if (reverbs) reverbs.set(ctx, conv);
    return conv;
  }
  function marimba(ctx, out, t0, midi, g) {
    var f = note(midi); g = g == null ? 0.1 : g;
    tone(ctx, out, t0, { f: f, dur: 0.5, gain: g, a: 0.002 });
    tone(ctx, out, t0, { f: f * 3.93, dur: 0.09, gain: g * 0.3, a: 0.001 });
    noise(ctx, out, t0, { dur: 0.016, f: 3500, q: 0.8, gain: g * 0.22 });
  }
  var pulse25 = function (ctx) { var n = 24, re = new Float32Array(n), im = new Float32Array(n); for (var k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25); return ctx.createPeriodicWave(re, im); };
  function chip(ctx, out, t0, midi, dur, g, to) { tone(ctx, out, t0, { f: note(midi), f2: to ? note(to) : null, glide: dur, dur: dur, gain: g == null ? 0.035 : g, wave: pulse25, a: 0.001, lp: 5200 }); }

  /* ---- kits --------------------------------------------------------------- */
  var KITS = {
    basic: {
      send: function (c, o, t) { noise(c, o, t, { dur: 0.2, f: 900, f2: 3800, q: 1.3, gain: 0.022 }); tone(c, o, t + 0.02, { f: 660, f2: 990, glide: 0.14, dur: 0.2, gain: 0.03 }); },
      first: function (c, o, t) { tone(c, o, t, { f: 1318, dur: 0.09, gain: 0.014, a: 0.012 }); },
      work: function (c, o, t) { tone(c, o, t, { f: note(67), dur: 0.7, gain: 0.028, a: 0.05 }); tone(c, o, t + 0.04, { f: note(74), dur: 0.7, gain: 0.022, a: 0.06 }); noise(c, o, t, { dur: 0.35, filter: 'lowpass', f: 500, f2: 1400, gain: 0.012 }); },
      tick: function (c, o, t) { tone(c, o, t, { f: 1760, dur: 0.028, gain: 0.016 }); },
      fail: function (c, o, t) { tone(c, o, t, { f: 196, type: 'triangle', dur: 0.16, gain: 0.05 }); noise(c, o, t, { dur: 0.03, f: 420, q: 1.2, gain: 0.03 }); },
      needs: function (c, o, t) { tone(c, o, t, { f: note(81), dur: 0.16, gain: 0.034 }); tone(c, o, t + 0.13, { f: note(86), dur: 0.24, gain: 0.03 }); },
      answer: function (c, o, t) { tone(c, o, t, { f: note(72), f2: note(79), glide: 0.24, dur: 0.32, gain: 0.024, a: 0.02 }); },
      complete: function (c, o, t) { tone(c, o, t, { f: note(79), dur: 0.34, gain: 0.03 }); tone(c, o, t + 0.09, { f: note(84), dur: 0.46, gain: 0.028 }); },
      stop: function (c, o, t) { noise(c, o, t, { dur: 0.02, f: 1500, q: 2, gain: 0.03 }); tone(c, o, t, { f: 330, dur: 0.06, gain: 0.024 }); }
    },
    friendly: {
      send: function (c, o, t) { noise(c, o, t, { dur: 0.16, filter: 'lowpass', f: 700, f2: 2600, gain: 0.02 }); marimba(c, o, t + 0.06, 76, 0.07); },
      first: function (c, o, t) { marimba(c, o, t, 88, 0.035); },
      work: function (c, o, t) { [67, 71, 74].forEach(function (m, i) { marimba(c, o, t + i * 0.06, m, 0.06); }); },
      tick: function (c, o, t) { marimba(c, o, t, 91, 0.028); },
      fail: function (c, o, t) { marimba(c, o, t, 57, 0.08); marimba(c, o, t + 0.1, 55, 0.07); },
      needs: function (c, o, t) { marimba(c, o, t, 79, 0.08); marimba(c, o, t + 0.12, 84, 0.08); },
      answer: function (c, o, t) { tone(c, o, t, { f: 520, f2: 880, glide: 0.1, dur: 0.14, gain: 0.03 }); marimba(c, o, t + 0.12, 79, 0.06); },
      complete: function (c, o, t) { marimba(c, o, t, 79, 0.07); marimba(c, o, t + 0.09, 84, 0.07); },
      stop: function (c, o, t) { noise(c, o, t, { dur: 0.03, filter: 'lowpass', f: 900, gain: 0.03 }); marimba(c, o, t, 60, 0.04); }
    },
    glass: {
      send: function (c, o, t) { noise(c, o, t, { dur: 0.3, f: 900, f2: 4800, q: 1.3, gain: 0.02, send: reverb(c, o) }); },
      first: function (c, o, t) { fm(c, o, t, { f: note(96), ratio: 3.1, index: 0.8, dur: 0.12, gain: 0.012 }); },
      work: function (c, o, t) { fm(c, o, t, { f: note(79), ratio: 1.4, index: 2.4, dur: 1.1, gain: 0.03, send: reverb(c, o) }); fm(c, o, t + 0.06, { f: note(86), ratio: 1.4, index: 2, dur: 1, gain: 0.022, send: reverb(c, o) }); },
      tick: function (c, o, t) { fm(c, o, t, { f: note(100), ratio: 3.5, index: 1, dur: 0.1, gain: 0.012 }); },
      fail: function (c, o, t) { fm(c, o, t, { f: 220, ratio: 1.01, index: 1.2, dur: 0.34, gain: 0.045 }); },
      needs: function (c, o, t) { fm(c, o, t, { f: note(88), ratio: 1.4, index: 2.6, dur: 0.6, gain: 0.03, send: reverb(c, o) }); fm(c, o, t + 0.14, { f: note(93), ratio: 1.4, index: 2.6, dur: 0.7, gain: 0.028, send: reverb(c, o) }); },
      answer: function (c, o, t) { noise(c, o, t, { dur: 0.36, f: 1200, f2: 5200, q: 1.2, gain: 0.016, send: reverb(c, o) }); fm(c, o, t + 0.16, { f: note(88), ratio: 1.4, index: 2, dur: 0.8, gain: 0.022, send: reverb(c, o) }); },
      complete: function (c, o, t) { [88, 95].forEach(function (m, i) { fm(c, o, t + i * 0.07, { f: note(m), ratio: 1.4, index: 2.4, dur: 1, gain: 0.026, send: reverb(c, o) }); }); },
      stop: function (c, o, t) { fm(c, o, t, { f: 1320, ratio: 2.76, index: 1.2, dur: 0.2, gain: 0.022 }); }
    },
    retro: {
      send: function (c, o, t) { chip(c, o, t, 72, 0.08, 0.03, 84); },
      first: function (c, o, t) { chip(c, o, t, 96, 0.02, 0.016); },
      work: function (c, o, t) { [67, 71, 74, 79].forEach(function (m, i) { chip(c, o, t + i * 0.04, m, 0.045, 0.03); }); },
      tick: function (c, o, t) { chip(c, o, t, 91, 0.018, 0.016); },
      fail: function (c, o, t) { chip(c, o, t, 57, 0.16, 0.04, 45); },
      needs: function (c, o, t) { chip(c, o, t, 81, 0.07, 0.035); chip(c, o, t + 0.11, 88, 0.1, 0.035); },
      answer: function (c, o, t) { chip(c, o, t, 72, 0.12, 0.028, 79); },
      complete: function (c, o, t) { chip(c, o, t, 79, 0.06, 0.032); chip(c, o, t + 0.06, 84, 0.16, 0.032); },
      stop: function (c, o, t) { chip(c, o, t, 64, 0.05, 0.028); }
    }
  };
  var EVENTS = Object.keys(KITS.basic);

  function family() {
    var tr = document.querySelector('.transcript');
    var v = tr && tr.getAttribute('data-voice');
    return KITS[v] ? v : 'basic';
  }
  function chain(ctx) {
    var master = ctx.createGain(); master.gain.value = 0.9;
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.003; comp.release.value = 0.2;
    master.connect(comp); comp.connect(ctx.destination);
    return master;
  }
  function ensure() {
    if (S.ctx) { if (S.ctx.state === 'suspended') S.ctx.resume().catch(function () { }); return S.ctx; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { S.ctx = new AC(); S.master = chain(S.ctx); return S.ctx; } catch (e) { return null; }
  }
  /* audio exists only after a real gesture. Creating the AudioContext costs
     ~65ms on the review VM, so the gesture only arms it and the context is made
     in the next task: the press that sends a message never carries that cost
     (the page keeps sticky activation, so the later start is still allowed). */
  var armed = false, pending = false;
  ['pointerdown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (!e.isTrusted) return;
      armed = true;
      if (S.muted) return;
      if (S.ctx) ensure();
      else if (!pending) { pending = true; setTimeout(function () { pending = false; if (!S.muted) ensure(); }, 0); }
    }, true);
  });

  /* Level trims (dB), measured: the kits were synthesized by ear and came out
     up to 16 dB apart (Friendly loudest, Glass's send nearly silent). Each
     event is trimmed to a tier by its gated RMS: needs you -34, the turn's
     beats (send, work, fail, answer, complete) -37, stop -40, the quiet ones
     (first word, tick) -44; Retro's click-short first word and tick by peak.
     No event peaks above -20 dBFS after its trim. */
  var TRIM = {
    basic: { send: 5.3, first: 6.9, work: 1.7, tick: 11.5, fail: 6.6, needs: 6.9, answer: 7.3, complete: 3.1, stop: 9.3 },
    friendly: { send: -3.5, first: -2.6, work: -5.0, tick: -0.9, fail: -5.0, needs: -2.3, answer: -2.3, complete: -4.4, stop: 0.4 },
    glass: { send: 24.7, first: 9.1, work: 2.0, tick: 9.5, fail: 3.5, needs: 5.3, answer: 5.0, complete: 1.9, stop: 7.3 },
    retro: { send: 16.3, first: 10.5, work: 10.8, tick: 10.0, fail: 12.6, needs: 12.5, answer: 15.6, complete: 10.2, stop: 16.0 }
  };
  function trimmed(ctx, dest, fam, ev) {
    var db = (TRIM[fam] && TRIM[fam][ev]) || 0;
    if (!db) return dest;
    var g = ctx.createGain(); g.gain.value = Math.pow(10, db / 20); g.connect(dest);
    if (ctx.state !== undefined && !(ctx instanceof (window.OfflineAudioContext || Object))) setTimeout(function () { try { g.disconnect(); } catch (e) { } }, 4000);
    return g;
  }

  function play(ev) {
    S.log.push({ ev: ev, at: Math.round(performance.now()), muted: S.muted, armed: armed, family: family() });
    if (S.log.length > 200) S.log.shift();
    if (S.muted || !armed) return false;
    var kit = KITS[family()], fn = kit && kit[ev];
    if (!fn) return false;
    var now = performance.now();
    if (ev === 'tick') {
      /* a burst of finished subjects is one tick, never a rattle */
      S.ticks = S.ticks.filter(function (t) { return now - t < 400; }); S.ticks.push(now);
      if (S.ticks.length > 2 || now - S.lastTick < 250) return false;
      S.lastTick = now;
    }
    if (now - S.last < 120) return false;
    S.last = now;
    var ctx = ensure(); if (!ctx) return false;
    try { fn(ctx, trimmed(ctx, S.master, family(), ev), ctx.currentTime + 0.01); } catch (e) { return false; }
    return true;
  }

  /* offline render for checks: WAV (16-bit PCM) as base64 plus the peak */
  function renderWav(fam, ev) {
    var kit = KITS[fam], fn = kit && kit[ev];
    if (!fn || typeof OfflineAudioContext === 'undefined') return Promise.resolve(null);
    var sr = 44100, ctx = new OfflineAudioContext(1, sr * 2, sr);
    var out = chain(ctx);
    fn(ctx, trimmed(ctx, out, fam, ev), 0.02);
    return ctx.startRendering().then(function (buf) {
      var d = buf.getChannelData(0), peak = 0, end = 0;
      for (var i = 0; i < d.length; i++) { var a = Math.abs(d[i]); if (a > peak) peak = a; if (a > 0.0005) end = i; }
      var n = Math.min(d.length, end + sr * 0.05), bytes = new Uint8Array(44 + n * 2), dv = new DataView(bytes.buffer);
      var w = function (o, s) { for (var k = 0; k < s.length; k++) bytes[o + k] = s.charCodeAt(k); };
      w(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
      dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 2, true);
      for (var j = 0; j < n; j++) dv.setInt16(44 + j * 2, Math.max(-1, Math.min(1, d[j])) * 32767, true);
      var bin = ''; for (var b = 0; b < bytes.length; b += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(b, b + 8192));
      return { base64: btoa(bin), peak: peak, peakDb: 20 * Math.log10(Math.max(1e-9, peak)), seconds: n / sr };
    });
  }

  /* ---- observed beats: finished and failed subjects on live cards ------------- */
  var seen = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function observe() {
    var root = document.getElementById('pmRoot');
    if (!root || !seen) { setTimeout(observe, 200); return; }
    var pend = false;
    new MutationObserver(function () {
      if (pend) return; pend = true;
      requestAnimationFrame(function () {
        pend = false;
        document.querySelectorAll('.transcript-inner .working-card:not(.is-done)').forEach(function (card) {
          var done = card.querySelectorAll('.orbit-node.done, .rail8-item.done').length;
          var failed = card.querySelectorAll('.orbit-node.failed, .rail8-item.failed').length;
          var prev = seen.get(card);
          seen.set(card, { done: done, failed: failed });
          if (!prev) return;                      /* first sight: a baseline, not an event */
          if (failed > prev.failed) play('fail');
          else if (done > prev.done) play('tick');
        });
      });
    }).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe); else setTimeout(observe, 0);

  /* ---- the header control ---------------------------------------------------- */
  /* The speaker is the neon registry's speaker / speaker-off (neon-icons.js, window.PM56_NEON: one drawing per
     concept, at the family stroke), read at call time. SPK is only the fallback for a page where neon-icons.js
     failed to load. */
  var SPK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/>';
  function speakerGlyph(on) {
    var N = window.PM56_NEON;
    if (N && typeof N.icon === 'function') return N.icon(on ? 'speaker' : 'speaker-off', 14);
    return SPK + (on ? '<path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>' : '<path d="m16 9 5 6M21 9l-5 6"/>') + '</svg>';
  }
  EXT.slot('headerExtras', function (ctx) {
    var on = !S.muted;
    var glyph = speakerGlyph(on);
    var tip = on ? 'Sound on · click to mute' : 'Sound off · click to turn on';
    return '<button class="icon-button tx-sound-btn' + (on ? '' : ' is-muted') + '" data-k="tx-sound" data-action="chat-sound-toggle" aria-pressed="' + (on ? 'true' : 'false') + '"'
      + ' data-hover-key="tx-sound" data-hover-tip="' + tip + '" aria-label="' + tip + '">' + glyph + '</button>';
  });
  EXT.action('chat-sound-toggle', function (ctx) {
    S.muted = !S.muted;
    try { localStorage.setItem(KEY, S.muted ? 'off' : 'on'); } catch (e) { }
    if (!S.muted) { armed = true; ensure(); play('complete'); }
    ctx.renderApp();
    return true;
  });

  window.PM56_SOUND = {
    play: play,
    renderWav: renderWav,
    EVENTS: EVENTS.slice(),
    FAMILIES: Object.keys(KITS),
    get muted() { return S.muted; },
    setMuted: function (m) { S.muted = !!m; try { localStorage.setItem(KEY, S.muted ? 'off' : 'on'); } catch (e) { } },
    log: S.log
  };
})();
