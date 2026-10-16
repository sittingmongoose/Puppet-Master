/* A look change crosses through its new background (final motion QA B4, 2026-10-16; part 2 P2-01).
   Repainting the whole app for a new theme restyles every drawn element in one pass: 133-433 ms on the M3, 0.8-2.5 s
   on the P1000 (where the compositor then rasters the new page for up to 1.7 s more), and nothing on screen moved
   while it ran: the app froze, then cut to the new look through a frame where the editor and terminal were still in
   the old one. The control pressed still shows its new state on the next frame. From that frame a cover in the new
   look's own background washes over the app, with a soft glow of its accent spreading from the theme control; the
   theme is written as the cover comes in, its first frame drawn under the full cover, and the cover lifts once
   frames come on time again, with the colour transitions the new look started finished under it, so the new look is
   shown whole (about half a second in all on the M3). The cover and its glow run on the compositor, so they keep
   moving while the main thread restyles. The cover is opaque: the page beneath it is then not rastered while it is
   covered, which halved the time the P1000's GPU spent rastering the new page with nothing drawn (400 to 200 ms in a
   trace). That raster, after the restyle, still holds every frame there, the cover's included, for a few hundred ms.
   A View Transition (snapshot crossfade, then a circular reveal from the control) was tried first and dropped:
   starting one restyles the whole page by itself in Chrome (230-300 ms on the P1000 before its callback runs).

   window.PM_THEME_TRANSITION(apply, hint)  — apply() writes the theme; hint { mode } or { family } names the look
   it goes to (for the cover's colours). Picks made before it runs keep only the latest.
   window.PM_LOOK_COVERED()  — true while the page is hidden by a look's cover: this one until it starts to lift, the
   NieR reboot plate (settings/kit.d/19-nier-parts.js) until its reveal, or the Reduce Animations calm cover
   (#o55np-calm). PM_THEME_TRANSITION.busy() is true until the lift has ended (for PM_BUSY, js/11-motion-start.js). */
(function () {
  'use strict';
  const html = document.documentElement;
  const COVER = 1;
  let job = null, phase = 'idle', veil = null, probe = null, coverAnim = null, glowAnims = [], ticket = 0;
  const veils = {};   /* one cover per mode, painted ahead in the current family's colours for that mode */

  const reduced = () => {
    try { if (window.O55 && O55.motion && typeof O55.motion.reduced === 'function') return !!O55.motion.reduced(); } catch (_) { /* below */ }
    return html.getAttribute('data-reduced-motion') === '1' || html.getAttribute('data-motion') === 'reduced' ||
      !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  const nierOn = () => html.hasAttribute('data-o55-nier') && html.getAttribute('data-o55-nier') !== 'off';

  /* the look a pick goes to, and its colours read from a hidden one-element probe (only the probe is styled) */
  function lookAfter(hint) {
    const cur = (html.getAttribute('data-theme') || 'basic-dark').split('-');
    let fam = cur[0] || 'basic', mode = cur[1] || 'dark', nier = nierOn();
    const m = hint && hint.mode && String(hint.mode).toLowerCase();
    if (m === 'light' || m === 'dark') mode = m;
    else if (m === 'auto') mode = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const f = hint && hint.family && String(hint.family).toLowerCase();
    if (f === 'nier') { fam = 'basic'; nier = true; } else if (f) { fam = f; nier = false; }
    return { theme: fam + '-' + mode, nier, retro: fam === 'retro', mode };
  }
  function coloursOf(to) {
    try {
      if (!probe || !probe.isConnected) {
        probe = document.createElement('i');
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden;contain:strict;pointer-events:none';
        document.body.appendChild(probe);
      }
      probe.setAttribute('data-theme', to.theme);
      probe.toggleAttribute('data-o55-nier', to.nier);
      const cs = getComputedStyle(probe);
      return { bg: cs.getPropertyValue('--background').trim(), glow: cs.getPropertyValue('--accent-blue').trim() };
    } catch (_) { return {}; }
  }
  function veilFor(mode) {
    let v = veils[mode];
    if (v && v.isConnected) return v;
    v = veils[mode] = document.createElement('div');
    v.className = 'pm-look-veil';
    v.setAttribute('aria-hidden', 'true');
    v.setAttribute('data-mode', mode);
    v.appendChild(document.createElement('i'));
    const parts = v.appendChild(document.createElement('b'));   /* the cover's motion (css/21-look-veil.css) */
    for (let k = 0; k < 3; k++) parts.appendChild(document.createElement('i'));
    document.body.appendChild(v);
    return v;
  }
  /* Both covers are built once the page is idle, painted in the light and dark colours of the family on screen, and
     kept laid out at opacity 0 (will-change keeps their layers and raster). A pick then only starts compositor
     moves: made, or painted in its colours, at the pick, a cover's new paint had to be rastered before the
     compositor would start its fade, in the very frames that should show it (it came in at +190-200 ms on the P1000,
     in three jumps). A family pick crosses through the cover of the family it leaves, in the new mode's tone; the
     lift then dissolves into the new family. They are painted again, at idle, after every look change. */
  function paint(mode) {
    const v = veilFor(mode);
    try {
      const c = coloursOf(lookAfter({ mode })), key = (c.bg || '') + '|' + (c.glow || '');
      /* the motion speaks the language of the look on screen, as the cover wears its colours */
      const fx = nierOn() ? 'nier' : ((html.getAttribute('data-theme') || 'basic').split('-')[0] || 'basic');
      if (v.__key !== key + '|' + fx) {
        v.__key = key + '|' + fx;
        if (c.bg) v.style.setProperty('--pm-veil-bg', c.bg); else v.style.removeProperty('--pm-veil-bg');
        if (c.glow) v.style.setProperty('--pm-veil-glow', c.glow); else v.style.removeProperty('--pm-veil-glow');
        v.setAttribute('data-fx', FX[fx] ? fx : 'basic');
      }
    } catch (_) { /* the fallbacks */ }
    v.setAttribute('data-ready', '');
    return v;
  }
  /* Painted ahead is not rastered ahead: a cover at opacity 0 is never drawn, so its motion parts were rastered on
     the first pick's own frame (the click's next paint 136-216 ms on the P1000 against 72-96 ms for the pick back,
     B4 films of d87b67ef49). After each paint the cover is drawn for a few frames at opacity 0.004, its parts shown
     where the compositor will move them, so their tiles exist before any pick. 0.004 of a colour moves no pixel by
     more than one level; lower rounds to nothing drawn on the P1000 (0.001 there drew nothing, Glass lane B1 trace). */
  function warm(v) {
    if (!v || v.__warm === v.__key || phase !== 'idle' || document.hidden || typeof v.animate !== 'function') return;
    v.__warm = v.__key;
    v.setAttribute('data-warm', '');
    let a = null;
    try { a = v.animate([{ opacity: 0.004 }, { opacity: 0.004 }], { duration: 160 }); } catch (_) { a = null; }
    const done = () => v.removeAttribute('data-warm');
    if (a) a.finished.then(done, done); else done();
  }
  const whenIdle = (fn) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 1500));
  let painting = false;
  const paintSoon = () => {
    if (painting) return;
    painting = true;
    whenIdle(() => { painting = false; if (!document.body) return; if (phase !== 'idle') { paintSoon(); return; } warm(paint('light')); warm(paint('dark')); });
  };
  if (document.readyState === 'complete') paintSoon();
  else window.addEventListener('load', paintSoon, { once: true });
  try { new MutationObserver(paintSoon).observe(html, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] }); } catch (_) { /* none */ }
  const startOnShown = (anims) => { if (window.PM_START_ON_SHOWN) window.PM_START_ON_SHOWN(anims); };
  const stopGlow = () => { glowAnims.forEach((a) => { try { a.cancel(); } catch (_) { /* gone */ } }); glowAnims = []; };

  /* The cover's motion (css/21-look-veil.css says what each look does). Every part loops on the compositor
     (transform, opacity) from the cover's first frame until it has gone, so the cover never stands as a blank colour
     while the main thread restyles; started together and never held, since a loop has no first frame to lose. With
     Reduce Animations nothing travels: a texture or the glow only breathes, slowly. */
  const loop = (el, frames, o) => el.animate(frames, Object.assign({ iterations: Infinity, fill: 'both' }, o));
  const sweep = (el, deg, ms, delay, peak) => loop(el, [
    { transform: `translateX(0) rotate(${deg}deg)`, opacity: 0 },
    { opacity: peak, offset: 0.2 }, { opacity: peak, offset: 0.8 },
    { transform: `translateX(calc(100vw + 72vmax)) rotate(${deg}deg)`, opacity: 0 }
  ], { duration: ms, delay, easing: 'cubic-bezier(.45, 0, .3, 1)' });
  const fadeIn = (el, to, ms, easing) => el.animate([{ opacity: 0 }, { opacity: to }], { duration: ms, easing: easing || 'ease-out', fill: 'forwards' });
  const drift = (el, a, b, ms, lag) => loop(el, [{ transform: a }, { transform: b }], { duration: ms, delay: -lag, direction: 'alternate', easing: 'ease-in-out' });
  const breatheCalm = (el, lo, hi, ms, easing) => loop(el, [{ opacity: lo }, { opacity: hi }], { duration: ms, direction: 'alternate', easing: easing || 'ease-in-out' });
  const FX = {
    basic: (p, calm) => calm ? [] : [sweep(p[0], 18, 1400, 0, 1), sweep(p[1], 18, 1400, 560, 0.55)],
    friendly: (p, calm) => calm ? [] : [
      fadeIn(p[0], 1, 260), drift(p[0], 'translate(-6vmax, 4vmax) scale(.9)', 'translate(6vmax, -5vmax) scale(1.12)', 1600, 0),
      fadeIn(p[1], 1, 320), drift(p[1], 'translate(5vmax, -3vmax) scale(1.08)', 'translate(-7vmax, 5vmax) scale(.9)', 2000, 700),
      fadeIn(p[2], 1, 380), drift(p[2], 'translate(-4vmax, -2vmax) scale(.94)', 'translate(5vmax, 4vmax) scale(1.1)', 2400, 1300)
    ],
    retro: (p, calm) => calm ? [breatheCalm(p[0], 0.45, 1, 1200, 'steps(2, jump-none)')] : [
      fadeIn(p[0], 1, 120, 'steps(2, end)'),
      loop(p[0], [{ transform: 'translateY(0)' }, { transform: 'translateY(4px)' }], { duration: 240, easing: 'steps(2, end)', composite: 'replace' }),
      loop(p[1], [{ transform: 'translateY(-16vh)', opacity: 1 }, { transform: 'translateY(100vh)', opacity: 1 }], { duration: 1200, easing: 'steps(12, end)' })
    ],
    glass: (p, calm) => calm ? [] : [
      fadeIn(p[0], 1, 300), drift(p[0], 'translate(-8vmax, 5vmax) rotate(-8deg)', 'translate(9vmax, -6vmax) rotate(10deg)', 2400, 0),
      fadeIn(p[1], 1, 360), drift(p[1], 'translate(8vmax, -4vmax) rotate(6deg)', 'translate(-9vmax, 6vmax) rotate(-9deg)', 2800, 900),
      sweep(p[2], 24, 1700, 240, 0.9)
    ],
    nier: (p, calm) => calm ? [breatheCalm(p[1], 0.35, 0.7, 1800)] : [
      loop(p[0], [{ transform: 'translateY(-22vh)', opacity: 1 }, { transform: 'translateY(100vh)', opacity: 1 }], { duration: 1500, easing: 'linear' }),
      fadeIn(p[1], 0.75, 200, 'steps(3, end)'),
      loop(p[1], [{ transform: 'translate(0, 0)' }, { transform: 'translate(24px, 24px)' }], { duration: 3000, easing: 'linear' }),
      loop(p[2], [{ opacity: 1, easing: 'step-end' }, { opacity: 0, offset: 0.5, easing: 'step-end' }, { opacity: 1 }], { duration: 640 })
    ]
  };
  function startMotion(v, calm) {
    if (v.__motion && v.__motionCalm === calm) return;   /* a pick while it lifts: the parts go on where they are */
    stopMotion(v);
    const parts = v.querySelector(':scope > b');
    const make = FX[v.getAttribute('data-fx')] || FX.basic;
    try { v.__motion = parts ? make([...parts.children], calm) : []; } catch (_) { v.__motion = []; }
    v.__motionCalm = calm;
  }
  function stopMotion(v) {
    if (!v || !v.__motion) return;
    v.__motion.forEach((a) => { try { a.cancel(); } catch (_) { /* gone */ } });
    v.__motion = null;
  }

  function runJob() {
    const apply = job; job = null;
    if (!apply) return;
    try { apply(); } catch (e) { try { console.error('[PM_THEME_TRANSITION]', e); } catch (_) { /* none */ } }
  }

  /* The colour transitions the new look starts (hundreds of elements easing from the old colours: the editor and
     terminal still dark in the frame part 2 caught) are finished at once under the cover: unseen there, they would
     restyle their elements on every frame of it and show the old look when it lifts. */
  function finishColourTransitions() {
    try {
      document.getAnimations().forEach((a) => {
        if (a.transitionProperty && a.playState === 'running' && /color|background|border|shadow|fill|stroke|outline/.test(a.transitionProperty)) a.finish();
      });
    } catch (_) { /* decoration only */ }
  }
  /* The new look is drawn: three frames after the repaint (its first paint, the observers that follow a look in the
     next frame), the last two on time; on a computer whose frames never come on time, 1.2 s after the repaint. */
  function whenDrawn(t, done) {
    let last = null, onTime = 0, count = 0, began = performance.now();
    const frame = (now) => {
      if (t !== ticket) return;
      if (job) { runJob(); last = null; onTime = 0; count = 0; began = performance.now(); }   /* a later pick, also under the cover */
      finishColourTransitions();
      count++;
      if (last != null) onTime = now - last <= 40 ? onTime + 1 : 0;
      last = now;
      if (count >= 3 && (onTime >= 2 || performance.now() - began >= 1200)) { done(); return; }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  function lift(t, to) {
    if (t !== ticket) return;
    phase = 'lifting';
    const still = reduced();
    const out = veil.animate([{ opacity: COVER }, { opacity: 0 }], {
      duration: still ? 140 : 240, easing: to.retro ? 'steps(3, end)' : 'cubic-bezier(.3, 0, .2, 1)', fill: 'forwards'
    });
    if (coverAnim) { try { coverAnim.cancel(); } catch (_) { /* gone */ } }
    coverAnim = out;
    startOnShown([out]);
    out.finished.then(() => {
      if (t !== ticket) return;
      phase = 'idle';
      veil.removeAttribute('data-on');   /* it stays ready (laid out, opacity 0) for the next pick */
      stopMotion(veil);
      paintSoon();
      stopGlow();
      try { out.cancel(); } catch (_) { /* gone */ }
      coverAnim = null;
    }, () => null);
  }

  function cover(hint) {
    const t = ++ticket, to = lookAfter(hint), still = reduced();
    const v = veils[to.mode] && veils[to.mode].__key ? veils[to.mode] : paint(to.mode);   /* painted ahead: no paint now */
    let from = 0;
    if (phase === 'lifting' && veil === v) { try { from = parseFloat(getComputedStyle(v).opacity) || 0; } catch (_) { from = 0; } }
    else if (veil && veil !== v) { veil.removeAttribute('data-on'); stopMotion(veil); }
    veil = v;
    v.removeAttribute('data-warm');
    v.getAnimations().forEach((a) => { if (a !== coverAnim) { try { a.cancel(); } catch (_) { /* gone */ } } });   /* a warm still running */
    v.setAttribute('data-on', '');
    phase = 'covering';
    if (typeof window.PM_BUSY === 'function') window.PM_BUSY();   /* its 'pm-idle' once the lift has ended */
    if (coverAnim) { try { coverAnim.cancel(); } catch (_) { /* gone */ } }
    stopGlow();
    const inMs = still ? 90 : 130;
    coverAnim = v.animate([{ opacity: from }, { opacity: COVER }], {
      duration: inMs, easing: to.retro ? 'steps(3, end)' : 'cubic-bezier(.2, 0, 0, 1)', fill: 'forwards'
    });
    startMotion(v, still);
    const anims = [];   /* the cover is the answer: it starts at once; the glow waits for a shown frame */
    /* the glow spreads from the control that was pressed and breathes while the new look is drawn (not in Retro's
       flat pixels or NieR's ink; with less motion it only breathes where it rests) */
    const fx = v.getAttribute('data-fx'), glows = fx !== 'retro' && fx !== 'nier' && !to.retro;
    if (still && glows) {
      const g = v.firstElementChild;
      glowAnims = [g.animate([{ opacity: 0.35 }, { opacity: 0.8 }], { duration: 1600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', fill: 'both' })];
    }
    if (!still && glows) {
      const g = v.firstElementChild, src = document.getElementById('themeSelect');
      let x = window.innerWidth - 120, y = 18;
      try { if (src) { const r = src.getBoundingClientRect(); if (r.width) { x = r.left + r.width / 2; y = r.top + r.height / 2; } } } catch (_) { /* default */ }
      const dx = x - window.innerWidth / 2, dy = y - window.innerHeight / 2;
      const spread = g.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(.25)`, opacity: 0 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 }
      ], { duration: 900, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'forwards' });
      const breathe = g.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: 'translate(0, 0) scale(1.18)', opacity: .7 }
      ], { duration: 1300, delay: 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      glowAnims = [spread, breathe];
      anims.push(spread, breathe);
    }
    startOnShown(anims);
    /* The theme is written once the cover has been shown most of its way in (it is over 0.9 by then): the compositor
       carries it the rest of the way while the main thread restyles, so the new look's first frame is drawn under the
       full cover and a fast computer does not wait out the whole fade first. Retro's steps wait for the last one. */
    const covering = coverAnim, at = to.retro ? inMs : inMs * 0.62;
    const ready = () => {
      if (t !== ticket || coverAnim !== covering) return;
      let ct = 0;
      try { ct = covering.playState === 'finished' ? inMs : Number(covering.currentTime) || 0; } catch (_) { ct = inMs; }
      if (ct < at) { requestAnimationFrame(ready); return; }
      phase = 'covered';
      setTimeout(() => {
        if (t !== ticket) return;
        runJob();
        whenDrawn(t, () => lift(t, to));
      }, 0);
    };
    requestAnimationFrame(ready);
  }

  window.PM_THEME_TRANSITION = function themeTransition(apply, hint) {
    job = apply;
    if (document.hidden || !document.body) { requestAnimationFrame(() => window.setTimeout(runJob, 0)); return; }
    if (phase === 'covering' || phase === 'covered') return;   /* the latest pick applies under the cover */
    cover(hint);
  };
  /* What only the covered page shows can wait for the cover to go (the hover material's tokens and moves,
     js/18-hover.js): read under it, in an animation frame, it was the first reader of the look's whole-page restyle.
     The plate leaves the pointer to the page at its reveal, the moment the page shows again. */
  window.PM_LOOK_COVERED = function lookCovered() {
    if (phase === 'covering' || phase === 'covered') return true;
    const plate = document.getElementById('o55np-reboot');
    return !!(plate && plate.style.pointerEvents !== 'none') || !!document.getElementById('o55np-calm');
  };
  window.PM_THEME_TRANSITION.busy = () => phase !== 'idle';
})();
