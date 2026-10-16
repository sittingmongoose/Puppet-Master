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
   it goes to (for the cover's colours). Picks made before it runs keep only the latest. */
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
      if (v.__key !== key) {
        v.__key = key;
        if (c.bg) v.style.setProperty('--pm-veil-bg', c.bg); else v.style.removeProperty('--pm-veil-bg');
        if (c.glow) v.style.setProperty('--pm-veil-glow', c.glow); else v.style.removeProperty('--pm-veil-glow');
      }
    } catch (_) { /* the fallbacks */ }
    v.setAttribute('data-ready', '');
    return v;
  }
  const whenIdle = (fn) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 1500));
  let painting = false;
  const paintSoon = () => {
    if (painting) return;
    painting = true;
    whenIdle(() => { painting = false; if (!document.body) return; if (phase !== 'idle') { paintSoon(); return; } paint('light'); paint('dark'); });
  };
  if (document.readyState === 'complete') paintSoon();
  else window.addEventListener('load', paintSoon, { once: true });
  try { new MutationObserver(paintSoon).observe(html, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] }); } catch (_) { /* none */ }
  const startOnShown = (anims) => { if (window.PM_START_ON_SHOWN) window.PM_START_ON_SHOWN(anims); };
  const stopGlow = () => { glowAnims.forEach((a) => { try { a.cancel(); } catch (_) { /* gone */ } }); glowAnims = []; };

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
    else if (veil && veil !== v) { veil.removeAttribute('data-on'); }
    veil = v;
    v.setAttribute('data-on', '');
    phase = 'covering';
    if (coverAnim) { try { coverAnim.cancel(); } catch (_) { /* gone */ } }
    stopGlow();
    const inMs = still ? 90 : 130;
    coverAnim = v.animate([{ opacity: from }, { opacity: COVER }], {
      duration: inMs, easing: to.retro ? 'steps(3, end)' : 'cubic-bezier(.2, 0, 0, 1)', fill: 'forwards'
    });
    const anims = [];   /* the cover is the answer: it starts at once; the glow waits for a shown frame */
    /* the glow spreads from the control that was pressed and breathes while the new look is drawn (not in Retro's
       flat pixels, nor with less motion) */
    if (!still && !to.retro) {
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
})();
