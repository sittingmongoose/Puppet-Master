/* A look change crosses through its new background (final motion QA B4, 2026-10-16; part 2 P2-01).
   Repainting the whole app for a new theme restyles every drawn element in one pass: 133-433 ms on the M3, 0.8-2.5 s
   on the P1000 (where the compositor then rasters the new page for up to 1.7 s more), and nothing on screen moved
   while it ran: the app froze, then cut to the new look through a frame where the editor and terminal were still in
   the old one. The control pressed still shows its new state on the next frame. From that frame a cover in the new
   look's own background washes over the app, with a soft glow of its accent spreading from the theme control; the
   theme is written under the opaque cover, and the cover lifts once frames come on time again and the colour
   transitions the new look started have finished, so the new look is shown whole. The cover and its glow run on the
   compositor, so they keep moving while the main thread restyles. The cover stops just short of opaque: content
   beneath an opaque layer is not rastered, and would then be drawn as it rasters while the cover lifts.
   A View Transition (snapshot crossfade, then a circular reveal from the control) was tried first and dropped:
   starting one restyles the whole page by itself in Chrome (230-300 ms on the P1000 before its callback runs).

   window.PM_THEME_TRANSITION(apply, hint)  — apply() writes the theme; hint { mode } or { family } names the look
   it goes to (for the cover's colours). Picks made before it runs keep only the latest. */
(function () {
  'use strict';
  const html = document.documentElement;
  const COVER = 0.995;
  let job = null, phase = 'idle', veil = null, probe = null, coverAnim = null, glowAnims = [], ticket = 0;

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
  function ensureVeil() {
    if (veil && veil.isConnected) return veil;
    veil = document.createElement('div');
    veil.id = 'pm-look-veil';
    veil.setAttribute('aria-hidden', 'true');
    veil.appendChild(document.createElement('i'));
    document.body.appendChild(veil);
    return veil;
  }
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
      duration: still ? 140 : 300, easing: to.retro ? 'steps(3, end)' : 'cubic-bezier(.3, 0, .2, 1)', fill: 'forwards'
    });
    if (coverAnim) { try { coverAnim.cancel(); } catch (_) { /* gone */ } }
    coverAnim = out;
    startOnShown([out]);
    out.finished.then(() => {
      if (t !== ticket) return;
      phase = 'idle';
      veil.removeAttribute('data-on');
      stopGlow();
      try { out.cancel(); } catch (_) { /* gone */ }
      coverAnim = null;
    }, () => null);
  }

  function cover(hint) {
    const t = ++ticket, to = lookAfter(hint), c = coloursOf(to), still = reduced();
    const v = ensureVeil();
    let from = 0;
    if (phase === 'lifting') { try { from = parseFloat(getComputedStyle(v).opacity) || 0; } catch (_) { from = 0; } }
    if (c.bg) v.style.setProperty('--pm-veil-bg', c.bg); else v.style.removeProperty('--pm-veil-bg');
    if (c.glow) v.style.setProperty('--pm-veil-glow', c.glow); else v.style.removeProperty('--pm-veil-glow');
    v.setAttribute('data-mode', to.mode);
    v.setAttribute('data-on', '');
    phase = 'covering';
    if (coverAnim) { try { coverAnim.cancel(); } catch (_) { /* gone */ } }
    stopGlow();
    coverAnim = v.animate([{ opacity: from }, { opacity: COVER }], {
      duration: still ? 90 : 150, easing: to.retro ? 'steps(3, end)' : 'cubic-bezier(.2, 0, 0, 1)', fill: 'forwards'
    });
    const anims = [coverAnim];
    /* the glow spreads from the control that was pressed and breathes while the new look is drawn (not in Retro's
       flat pixels, nor with less motion) */
    if (!still && !to.retro) {
      const g = v.firstElementChild, src = document.getElementById('themeSelect');
      let x = window.innerWidth - 120, y = 18;
      try { if (src) { const r = src.getBoundingClientRect(); if (r.width) { x = r.left + r.width / 2; y = r.top + r.height / 2; } } } catch (_) { /* default */ }
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const spread = g.animate([
        { transform: `translate(${x}px, ${y}px) scale(.25)`, opacity: 0 },
        { transform: `translate(${cx}px, ${cy}px) scale(1)`, opacity: 1 }
      ], { duration: 900, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'forwards' });
      const breathe = g.animate([
        { transform: `translate(${cx}px, ${cy}px) scale(1)`, opacity: 1 },
        { transform: `translate(${cx}px, ${cy}px) scale(1.18)`, opacity: .7 }
      ], { duration: 1300, delay: 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      glowAnims = [spread, breathe];
      anims.push(spread, breathe);
    }
    startOnShown(anims);
    const covering = coverAnim;
    covering.finished.then(() => {
      if (t !== ticket || coverAnim !== covering) return;
      phase = 'covered';
      setTimeout(() => {
        if (t !== ticket) return;
        runJob();
        whenDrawn(t, () => lift(t, to));
      }, 0);
    }, () => null);
  }

  window.PM_THEME_TRANSITION = function themeTransition(apply, hint) {
    job = apply;
    if (document.hidden || !document.body) { requestAnimationFrame(() => window.setTimeout(runJob, 0)); return; }
    if (phase === 'covering' || phase === 'covered') return;   /* the latest pick applies under the cover */
    cover(hint);
  };
})();
