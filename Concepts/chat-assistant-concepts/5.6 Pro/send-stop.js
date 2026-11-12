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
 *   data-flowed                                     the cadence has switched once (the next loop starts at once)
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
 * The breathe's cadence changes only at a loop boundary, where the square is at full size, so it never jumps: an
 * animationiteration listener reads how long ago the last word arrived (under 900 ms -> flowing, else waiting).
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
  var flow = 'flowing', flowed = false, lastTok = -1e9;
  var tid0, snap = false, hold = false, lastSs = null, shownQ = 0;

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
    if (s === 'stop' && lastSs !== 'stop') { flow = (now() - lastTok < 900 || streaming(o.tid)) ? 'flowing' : 'waiting'; flowed = false; }
    if (s !== 'stop') flowed = false;
    if (s === 'queue' || s === 'full') { if (q) shownQ = q; }
    lastSs = s;
    var cls = '', t = now();
    if (fx && t >= fx.until) fx = null;
    if (fx && (!fx.only || fx.only.indexOf(s) >= 0)) cls = ' ' + fx.cls;
    if (snap) cls += ' ss-snap';
    if (s === 'stop') cls += ' is-stop';
    var label = LABEL[s];
    return '<button class="send-button sendstop' + cls + '" data-k="send-btn" data-action="' + (s === 'stop' ? 'stop-run' : 'send') + '"' +
      ' data-ss="' + s + '" data-q="' + q + '" data-flow="' + flow + '"' + (flowed && s === 'stop' ? ' data-flowed=""' : '') +
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

  /* The breathe's depth and pace change only at an iteration boundary (the square at full size). */
  document.addEventListener('animationiteration', function (e) {
    if (e.animationName !== 'ss-breathe' && e.animationName !== 'ss-breathe-w') return;
    var b = e.target && e.target.closest ? e.target.closest('.sendstop') : null;
    if (!b || b.getAttribute('data-ss') !== 'stop') return;
    var want = now() - lastTok < 900 ? 'flowing' : 'waiting';
    if (want === flow) return;
    flow = want; flowed = true;
    b.setAttribute('data-flow', want);
    b.setAttribute('data-flowed', '');
  });

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
    /* turn-stream: a word was released into the reply of thread tid */
    token: function (tid) { if (tid === undefined || tid === tid0) lastTok = now(); },
    debug: function () { return { fx: fx && fx.cls, flow: flow, flowed: flowed, snap: snap, hold: hold, lastTokAgo: Math.round(now() - lastTok) }; }
  };
})();
