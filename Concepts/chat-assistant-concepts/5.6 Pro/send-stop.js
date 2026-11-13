/* send-stop.js — the composer's Send / Stop control, "solid-living" (step SS, 2026-10-02; Jared's pick of three).
 * OWNER: Send/Stop (step SS). The styles are send-stop.css. app.js asks for the markup (sendButtonHtml) and tells this
 * module about the clicks and keystrokes that change the control (handleSend, the stop-run click, the composer's
 * input); turn-stream.js reports each word it releases (token), which sets the breathe's cadence.
 *
 * The chip stays solid (accent for Send and Queue, danger for Stop); the craft is in the glyph. ONE button, patched in
 * place by pmPatch (never replaced): its inner markup is identical in every state, so only the button's attributes and
 * the count change, every node survives, and every change between states is a CSS transition (the plane morphs into
 * the square point by point, the red floods out from the centre).
 *   data-ss     idle | ready | stop | queue | full   (busy && empty -> stop; busy && 2 waiting -> full; busy -> queue;
 *                                                     text -> ready; else idle)
 *   data-q      0 | 1 | 2                           messages already waiting in the follow-up queue
 *   data-flow   flowing | waiting                   Stop only: words arriving, or the model thinking / a tool running
 *   data-launch send | queue                        with ss-launch: what the click did
 *   data-hold                                       a pointer that just sent is still on the chip (NieR's rust hover
 *                                                   waits until it leaves and comes back)
 * One-shots ride in the markup (fx below), because pmSyncAttrs strips a class that script added:
 *   ss-launch (900 ms)  Send or Queue click: the plane lifts off, a fresh one slides in (and becomes Stop)
 *   ss-halt   (600 ms)  the Stop click: the square clunks before it opens back into the plane ("stopped"; a run that
 *                       ends any other way, a turn, a goal or a plan build, is "finished" and morphs back without it)
 *   ss-ignite (500 ms)  idle -> ready on the first character typed
 *   ss-sputter(300 ms)  a click with nothing to send, or with the queue full: the glyph flickers and does not light
 *   ss-fail   (760 ms)  a refused send (a pre-send validator held it): one shake and a danger flash, then rest;
 *   ss-fail-static      under reduced motion, a danger ring for 1.4 s instead
 *   ss-snap             a thread switch: the control jumps to the new thread's state (two frames, then dropped);
 *                       a one-shot still pending from the thread left behind is dropped with it
 * The breathe's pace (Jared's choice PERF-STOP2 = A, 2026-11-13): one pulse, faster while words arrive (a word in the
 * last 900 ms -> flowing) and slower while the run waits. It changes the moment the wanted cadence changes, keeping its
 * place in the loop, so the square speeds up or slows down without a jump. It used to change only at a loop's end,
 * learnt from an animationiteration listener on the document: one such listener makes Chrome wake the main thread at
 * every loop end of every CSS animation on the page for the rest of its life (Windows, 120 Hz, at rest: about 35 main
 * frames a second with it, 12 without, every look). See pace() below.
 * Glyph geometry (chip pixels, viewBox 0 0 24 24): the registry's `send` drawing scaled .58 about the centre for the
 * plane, .5 for the queue's two planes; every shape that morphs is M + 4x(L Q) + Z so CSS `d` interpolates point by
 * point (the same strings are in send-stop.css, which drives the morph; these d attributes are the static fallback).
 */
(function () {
  'use strict';
  var G = {
    PLANE: 'M5.6 10.86 L17.2 6.8 Q17.2 6.8 17.2 6.8 L13.14 18.4 Q13.14 18.4 13.14 18.4 L10.82 13.18 Q10.82 13.18 10.82 13.18 L5.6 10.86 Q5.6 10.86 5.6 10.86 Z',
    FOLD_P: 'M17.2 6.8 L14.01 9.99 L10.82 13.18',
    QBACK: 'M14.5 9.5 L11 19.5 L9 15 L4.5 13 Z',
    QBACK_FOLD: 'M14.5 9.5 L9 15',
    TRAIL: 'M4.61 11.85 L1.92 14.54 M12.15 19.39 L10.03 21.51'
  };
  var LABEL = {
    idle: 'Send message', ready: 'Send message', stop: 'Stop the current run',
    queue: 'Queue this message (sends when the run finishes)', full: 'Queue full: two messages are waiting'
  };
  var FX_MS = { 'ss-launch': 900, 'ss-halt': 600, 'ss-ignite': 500, 'ss-sputter': 300, 'ss-fail': 760, 'ss-fail-static': 1400 };
  var SEL = '.composer-infield .sendstop';

  function now() { return window.PM56_CLOCK ? window.PM56_CLOCK.now() : performance.now(); }
  function reduced() {
    return document.documentElement.getAttribute('data-motion') === 'reduced' ||
      !!(document.body && document.body.classList.contains('pm56-reduced')) ||
      !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function live() { return document.querySelector(SEL); }

  var fx = null, fxT = 0;          // the one-shot riding in the markup: {cls, until, only, launch}
  var flow = 'flowing', lastTok = -1e9;
  var tid0, snap = false, hold = false, lastSs = null, shownQ = 0;
  /* the pace (below): send-stop.css's two loop lengths and its --ss-ld at Animation speed 1, the loops' names, how
     recent a word must be for "flowing"; the quiet timer, the <head> observer and the speed the loops were last seen at */
  var BEAT = { flowing: 2200, waiting: 3200 }, LEAD = 800, LOOPS = ['ss-breathe', 'ss-glow', 'ss-glow-l'], QUIET = 900;
  var quietH = null, watch = null, speed = 0, olds = null;

  function stateOf(o) {
    var text = String(o.text || '').trim();
    if (o.busy && !text) return 'stop';
    if (o.busy) return (o.qlen || 0) >= 2 ? 'full' : 'queue';
    return text ? 'ready' : 'idle';
  }
  function streaming(tid) {
    var S = window.PM56_STREAM;
    try { return !!(S && S.active && S.active().some(function (a) { return a.tid === tid; })); } catch (e) { return false; }
  }

  /* The button for the app's state {busy, text, qlen, tid}; hover(key, text) is app.js hoverAttrs (tip + aria-label). */
  function html(o, hover) {
    var s = stateOf(o), q = o.qlen || 0;
    /* a thread switch: the new thread's state as a jump, and a one-shot still pending (a launch, halt or ignite armed
       on the thread we left) is dropped, so it never replays on a chip where nothing happened */
    if (o.tid !== tid0) { if (tid0 !== undefined) { armSnap(); fx = null; clearTimeout(fxT); } tid0 = o.tid; }
    /* Stop starts: the cadence it starts in (the loops come with the markup, at that cadence's length); the pace is
       watched only while Stop shows (paceOn), and nothing is left armed once it has gone (paceOff) */
    if (s === 'stop' && lastSs !== 'stop') { flow = (now() - lastTok < QUIET || streaming(o.tid)) ? 'flowing' : 'waiting'; paceOn(); }
    else if (s === 'stop') paceKeep();   // a chip that went missing for a moment switched both off (quiet, the observer)
    if (s !== 'stop') paceOff();
    if (s === 'queue' || s === 'full') { if (q) shownQ = q; }
    lastSs = s;
    var cls = '', t = now();
    if (fx && t >= fx.until) fx = null;
    if (fx && (!fx.only || fx.only.indexOf(s) >= 0)) cls = ' ' + fx.cls;
    if (snap) cls += ' ss-snap';
    if (s === 'stop') cls += ' is-stop';
    var label = LABEL[s];
    return '<button class="send-button sendstop' + cls + '" data-k="send-btn" data-action="' + (s === 'stop' ? 'stop-run' : 'send') + '"' +
      ' data-ss="' + s + '" data-q="' + q + '" data-flow="' + flow + '"' +
      (fx && fx.launch && cls.indexOf('ss-launch') >= 0 ? ' data-launch="' + fx.launch + '"' : '') +
      (hold ? ' data-hold=""' : '') + (s === 'full' ? ' aria-disabled="true"' : '') +
      (hover ? hover('send-btn', label) : ' aria-label="' + label + '"') + '>' +
      '<span class="ss-bl"></span><span class="ss-face"><span class="ss-flood"></span><svg class="nx nx-self ss-g" viewBox="0 0 24 24" aria-hidden="true"><g class="ss-all">' +
      '<g class="ss-back"><path d="' + G.QBACK + '"/><path d="' + G.QBACK_FOLD + '"/></g>' +
      '<g class="ss-ghost"><path class="ss-trail" d="' + G.TRAIL + '"/><path class="ss-gb" d="' + G.PLANE + '"/><path class="ss-gf" d="' + G.FOLD_P + '"/></g>' +
      '<g class="ss-main"><g class="ss-hov"><g class="ss-breath">' +
      '<path class="ss-knock" d="' + G.PLANE + '"/><path class="nx-h" d="' + G.PLANE + '"/><path class="ss-body" d="' + G.PLANE + '"/><path class="ss-fold" d="' + G.FOLD_P + '"/>' +
      '</g></g></g></g></svg></span><span class="ss-count" aria-hidden="true">' + (shownQ || q) + '</span></button>';
  }

  /* Arm a one-shot for the next patch. A one-shot already on the live chip is taken off and style is flushed first,
     so the same one twice in a row replays. When it expires the class is taken off the chip directly (fx is gone, so
     the next patch agrees), so nothing waits for a render. */
  function fire(cls, only, launch) {
    if (reduced() && cls !== 'ss-fail-static') { fx = null; return; }
    var b = live();
    if (b && b.classList.contains(cls)) { b.classList.remove(cls); void b.offsetWidth; }
    var ms = FX_MS[cls];
    fx = { cls: cls, until: now() + ms, only: only || null, launch: launch || null };
    clearTimeout(fxT);
    var mine = fx;
    fxT = setTimeout(function () {
      if (fx !== mine) return;
      fx = null;
      var c = live(); if (c) { c.classList.remove(cls); if (mine.launch) c.removeAttribute('data-launch'); }
    }, window.PM56_CLOCK ? window.PM56_CLOCK.ms(ms + 30) : ms + 30);
  }

  /* A thread switch shows the new thread's state as a jump: ss-snap (no transitions, no animations) rides in the
     markup for two frames (composer-state settles a restored draft one frame after the switch), then style is flushed
     with it on and it comes off the live chip. */
  function armSnap() {
    if (snap) return;
    snap = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        snap = false;
        var b = live(); if (!b) return;
        void b.offsetWidth;
        b.classList.remove('ss-snap');
      });
    });
  }

  /* ------------------------------------------------------------------ the pace (PERF-STOP2 = A)
     One loop on the glyph (ss-breathe) and one on the danger backlight (ss-glow; ss-glow-l on light themes), and
     send-stop.css gives both their length from data-flow: 2200 ms flowing, 3200 ms waiting, each times Settings'
     Animation speed. So every loop the browser makes afresh starts at the right pace with no script: Stop shown again,
     a re-render that rebuilds the chip, a thread switch's snap, Reduced Motion turned off, NieR Mode turned off (it
     hides the backlight), a light/dark change (it swaps the backlight's keyframes, as before). Script acts only where a
     RUNNING loop is retimed, and puts it back at the same point of its loop, in the same task, so no frame shows it
     anywhere else:
       - the cadence changes (pace): a word while waiting turns it to flowing at once (token); 900 ms without a word
         while flowing turns it to waiting (quiet: a timer on the last word's age, armed only while words reach a Stop
         chip, never a guess at where a loop is);
       - Settings' Animation speed rewrites the loops' length and delay (the #o55-look-scale sheet in <head>): retime,
         from an observer of <head> that is connected only while Stop shows.
     A loop the onboarding window holds (animation-play-state) is re-placed the same way and carries on from there when
     it is let go. No listener for any animation event, nothing per frame, nothing armed once Stop has gone (paceOff).
     Why not Animation.updatePlaybackRate: a rate lives in one Animation object, so every loop the browser rebuilds
     would come back at rate 1, and nothing tells the page that it did without the kind of listener this replaces. */
  function stopChip() { var b = live(); return b && b.getAttribute('data-ss') === 'stop' ? b : null; }
  /* the chip's loops; Element.getAnimations brings style up to date first, so a length CSS has just changed is in
     their timing */
  function loops(b) {
    try { return b.getAnimations({ subtree: true }).filter(function (a) { return LOOPS.indexOf(a.animationName) >= 0; }); } catch (e) { return []; }
  }
  function seen(runs) {
    var d = runs.length ? +runs[0].effect.getTiming().duration : 0;
    if (d > 0) speed = d / BEAT[flow];
  }
  /* Where the square actually is. Chrome hands a retimed loop to the compositor only with the next frame, and until
     then the compositor keeps moving the square on the OLD timing by its own clock, also through a long task: Settings'
     save is one (about 260 ms on the Windows PC, the speed sheet written at its end), and a loop re-placed by the last
     frame's time then showed a jump of 0.07 of a loop when the frame came (film, 2026-11-13). So each loop's old timing
     is taken before the first retime since the last frame (olds), the loop is put where that timing has it NOW on the
     wall clock, and once more at the next frame, just before that frame hands it over. A held loop (the onboarding
     window) does not move, so its place is its current time on the old timing. */
  function wall() {
    var p = performance.now(), t = document.timeline ? document.timeline.currentTime : null;
    return t == null || Math.abs(p - t) < 2000 ? p : t;   // a film tool's slowed timeline: its own clock
  }
  function timingOf(a) { var t = a.effect.getTiming(); return { a: a, s: a.startTime, c: a.currentTime, h: a.playState === 'paused', d: +t.duration, l: +t.delay || 0 }; }
  function remember(runs, taken) {
    if (!olds) {
      olds = [];
      requestAnimationFrame(function () { var b = stopChip(); if (b && olds) place(loops(b), true); olds = null; });
    }
    runs.forEach(function (a) { if (!olds.some(function (o) { return o.a === a; })) olds.push(taken(a)); });
  }
  function place(runs, framed) {
    var w = wall();
    runs.forEach(function (a) {
      var o = (olds || []).filter(function (x) { return x.a === a; })[0];
      if (!o) return;
      var t = a.effect.getTiming(), d = +t.duration, l = +t.delay || 0;
      var held = a.playState === 'paused' || o.s == null;
      if (!(d > 0) || !(o.d > 0)) return;
      if (Math.abs(d - o.d) < 0.5 && Math.abs(l - o.l) < 0.5) {   // back to the timing it had (two changes in one frame)
        if (held) { if (o.c != null && a.currentTime !== o.c) a.currentTime = o.c; } else if (a.startTime !== o.s) a.startTime = o.s;
        return;
      }
      if (held && framed) return;                          // nothing moved since it was placed
      var c = held ? (o.h ? o.c : a.currentTime) : (w - o.s) * (a.playbackRate || 1);
      if (c == null) return;
      var n = c < o.l ? (o.l > 0 ? c * l / o.l : c) : l + (c - o.l) * d / o.d;
      if (held) a.currentTime = n; else a.startTime = w - n / (a.playbackRate || 1);
    });
  }
  /* The cadence changes now: data-flow gives each loop the other length, and each is put at the same point of it. */
  function pace(b, to) {
    remember(loops(b), timingOf);
    flow = to;
    b.setAttribute('data-flow', to);
    var runs = loops(b);
    place(runs, false);
    seen(runs);
  }
  /* Settings' Animation speed has rewritten the loops' length and delay (FO-153 scales the delay too): each loop goes
     back to where it was. What it had is the cadence's length and --ss-ld at the speed the loops were last seen at;
     the start time is the sheet's to leave alone. */
  function retime(b) {
    var runs = loops(b);
    if (!speed) { seen(runs); return; }
    var d0 = BEAT[flow] * speed, l0 = LEAD * speed;
    var moved = runs.filter(function (a) { var t = a.effect.getTiming(); return Math.abs(+t.duration - d0) >= 0.5 || Math.abs((+t.delay || 0) - l0) >= 0.5; });
    if (moved.length) {
      remember(moved, function (a) { return { a: a, s: a.startTime, c: a.currentTime, h: a.playState === 'paused', d: d0, l: l0 }; });
      place(moved, false);
    }
    seen(runs);
  }
  function sheetNode(n) { return !!n && (n.nodeName === 'STYLE' || n.nodeName === 'LINK' || (n.nodeType === 3 && !!n.parentNode && n.parentNode.nodeName === 'STYLE')); }
  function sheetChange(r) {
    return sheetNode(r.target) || Array.prototype.some.call(r.addedNodes || [], sheetNode) || Array.prototype.some.call(r.removedNodes || [], sheetNode);
  }
  function watchOn() {
    if (watch || typeof MutationObserver !== 'function' || !document.head) return;
    watch = new MutationObserver(function (recs) {
      var b = stopChip();
      if (!b) { paceOff(); return; }
      if (recs.some(sheetChange)) retime(b);
    });
    watch.observe(document.head, { childList: true, subtree: true, characterData: true });
  }
  function armQuiet() {
    if (quietH) return;
    var C = window.PM56_CLOCK, left = Math.max(0, QUIET - (now() - lastTok)) + 1;
    quietH = C && C.after ? C.after(left, quiet) : setTimeout(quiet, left);
  }
  function quiet() {
    quietH = null;
    var b = stopChip();
    if (!b) { paceOff(); return; }
    if (flow !== 'flowing') return;
    if (now() - lastTok < QUIET) { armQuiet(); return; }
    pace(b, 'waiting');
  }
  /* Stop has started: watch for Settings' speed, start the quiet timer if words are arriving, and once the new loops
     exist (the markup is patched in after html() returns) note the speed they run at */
  function paceOn() {
    paceKeep();
    requestAnimationFrame(function () { var b = stopChip(); if (b) seen(loops(b)); });
  }
  function paceKeep() {
    watchOn();
    if (flow === 'flowing') armQuiet();
  }
  function paceOff() {
    if (quietH) { var C = window.PM56_CLOCK; if (typeof quietH === 'object' && C && C.cancel) C.cancel(quietH); else clearTimeout(quietH); quietH = null; }
    if (watch) { watch.disconnect(); watch = null; }
  }

  /* A pointer that sends stays over the chip as it turns into Stop; NieR's rust hover waits until that pointer has
     left once (a keyboard send leaves it armed, so the next pointer over Stop shows it at once). */
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.sendstop') : null;
    if (!b || e.detail < 1 || b.getAttribute('data-action') !== 'send') return;
    hold = true;
  }, true);
  document.addEventListener('pointerleave', function (e) {
    if (!hold || !e.target || !e.target.classList || !e.target.classList.contains('sendstop')) return;
    hold = false;
    e.target.removeAttribute('data-hold');
  }, true);

  window.PM56_SENDSTOP = {
    html: html,
    state: stateOf,
    /* call right BEFORE the render a Send or Queue click causes */
    launch: function (kind) { fire('ss-launch', null, kind === 'queue' ? 'queue' : 'send'); },
    /* call right before the render the Stop click causes (the "stopped" one-shot; nothing else sets it) */
    halt: function () { fire('ss-halt'); },
    ignite: function () { fire('ss-ignite', ['ready']); },
    sputter: function () { fire('ss-sputter', ['idle', 'full']); },
    fail: function () { fire(reduced() ? 'ss-fail-static' : 'ss-fail'); },
    /* turn-stream: a word was released into the reply of thread tid; on a Stop chip that was waiting the pace turns to
       flowing at once */
    token: function (tid) {
      if (tid !== undefined && tid !== tid0) return;
      lastTok = now();
      var b = stopChip();
      if (!b) return;
      if (flow !== 'flowing') pace(b, 'flowing');
      watchOn(); armQuiet();
    },
    debug: function () { return { fx: fx && fx.cls, flow: flow, snap: snap, hold: hold, lastTokAgo: Math.round(now() - lastTok), quiet: !!quietH, watching: !!watch, speed: speed }; }
  };
})();
