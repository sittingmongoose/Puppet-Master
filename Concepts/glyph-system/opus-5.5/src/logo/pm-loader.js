/* src/logo/pm-loader.js: the system loader (W5, DR-077, F3-662), window.PM_PIP_LOADER. OWNER: pm7-found (PM7 build,
 * 2026-10-29). Jared: "A system wide loading indicator ... used universally like the menu drop down animations."
 *
 * One owner, one class contract, attribute opt-in, the way the hover engine (DR-072, data-pmh) and the menu sprout
 * (PM6_SPROUT) work: a surface writes a loader and this file draws, arms, pauses and re-looks every one of them.
 *
 *   <span class="pml-ld" data-pip-loader="swing|think|hop" data-pip-px="16"></span>
 *     The opt-in. The owner fills it with Pip (PMLogo.mark), so a host may write it empty; PM_PIP_LOADER.html() writes
 *     it already drawn (the still pose shows from the first frame the host paints). Sized 1em by default and set on the
 *     text baseline; --pml-size (or the size option) fixes another size. data-pip-px is the size the host expects in
 *     CSS px, which picks the drawing's tier (micro <= 18, small <= 40, full) and, below 12 px, keeps it still (F3-584);
 *     write it with --pml-size. Without it the owner measures the loader when it arms and uses that size.
 *   The motion is chosen by context and is never a setting (L5, SSYS-055): think for the chat's thinking placeholder,
 *   hop for a short wait that ends in success, swing for every other wait.
 *
 * Arming. A loader is found when it is first styled: its unarmed state runs a 1 ms no-op animation (pml-arm) and one
 * document listener for animationstart arms it, so the owner needs no DOM observer and costs nothing while no loader
 * is shown. An unarmed loader is invisible for its first frame or two; armed, it fades in already in the shared
 * clock's phase (PMLogo.clock), so every loader on screen swings together and none starts with a jump.
 *
 * data-pml-run on the loader (written only here):
 *   on     moving, in phase                     off    held at the still pose: offscreen, the tab hidden, or the
 *   still  never moves: below 12 px                      person away (window not focused for 60 s)
 *   wait   still until a busy spell ends (PM_BUSY: a page change, the look cover, a NieR switch); the onboarding
 *          window's own loaders and Demo Studio's are not held by the window being open
 * Drags hold every loader where it is (body.pm-resizing and the other drag classes set --pml-ps: paused, and the clock
 * stands still with them), and the onboarding window holds the app beneath it (10-window.css).
 *
 * Reduced Motion (L3, X2): the control breathes in opacity and Pip blinks; nothing travels. NieR (L7): Pip never
 * animates in NieR. With its Diamond loaders part the loader is NieR's hollow diamond (styles.d/14-nier-parts.css);
 * with the part off it is today's fallback, the plain ink ring (pm-loader.css); under Reduced Motion both hold still
 * and the ring breathes. Animation speed scales every period (kit.d/17-look.js). Loop ranking (F3-658, X2): a loader is a wait
 * signal below needs-you: it is never put in a list row or tab for an item's state (that is st-working, L1).
 *
 * API: html(o) -> markup; mount(root?) arms loaders now; busy(host, on, o) marks a host busy with a loader;
 *      hold(on) / held(): Demo Studio's lab hold (waits that end through busy() keep their loader until hold(false));
 *      refresh() redraws and re-phases every loader; motion(name) -> the context's motion; clock = PMLogo.clock;
 *      stats() -> counts for tests. */
(function () {
  'use strict';
  const W = window, D = document, L = W.PMLogo;
  if (!L || W.PM_PIP_LOADER) return;

  const MOTIONS = L.MOTIONS;
  const live = new Set();          // loaders armed or held by this owner
  const waiting = new Set();       // loaders held until a busy spell ends
  let away = false, awayTimer = 0, io = null, sweepAt = 0;
  const AWAY_MS = 60000;

  const motionOf = (el) => { const m = el.getAttribute('data-pip-loader'); return MOTIONS.indexOf(m) >= 0 ? m : 'swing'; };
  const pxOf = (el) => { const n = +el.getAttribute('data-pip-px'); return n > 0 ? n : 16; };
  const reduced = () => D.documentElement.getAttribute('data-motion') === 'reduced' || (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* NieR (L7): Pip never animates in NieR, so a NieR loader is not Pip. It is one empty part that NieR's styles draw:
     the Diamond loaders part's hollow diamond (styles.d/14-nier-parts.css), or with that part off today's fallback,
     the plain ink ring every spinner showed in NieR before (pm-loader.css). */
  const NIER = '<span class="pml-nier" aria-hidden="true"></span>';
  const NIER_MS = Object.freeze({ diamond: 2800, ring: 800, breath: 2400 });   // pm-loader.css, 14-nier-parts.css
  const isNier = (look) => L.family(look) === 'nier';
  function draw(el) {
    const look = L.look();
    el.innerHTML = isNier(look) ? NIER : L.mark({ px: pxOf(el), motion: motionOf(el), mood: motionOf(el) === 'think' ? 'working' : 'idle', look, decorative: true });
    el.setAttribute('data-pml-look', look);
  }
  const drawn = (el) => el.getAttribute('data-pml-look') === L.look() && el.firstElementChild && el.firstElementChild.classList.contains(isNier(L.look()) ? 'pml-nier' : 'pml');

  /* the periods and phases one loader needs, from the shared clock and Animation speed */
  function phase(el) {
    const look = L.look(), family = L.family(look), motion = motionOf(el), px = pxOf(el), k = L.clock.speed();
    el.style.setProperty('--pml-k', String(k));
    const ms = (v) => Math.round(v) + 'ms', c = L.clock;
    if (family === 'nier') {
      // NieR's part keeps its own periods (the diamond's 2.8 s turn, the ring's 0.8 s, the 2.4 s breath), scaled by
      // --pml-k, and joins the shared clock's phase like every other loader
      el.style.setProperty('--pml-ndelay', ms(c.delay(NIER_MS.diamond * k)));
      el.style.setProperty('--pml-sdelay', ms(c.delay(NIER_MS.ring * k)));
      el.style.setProperty('--pml-nbdelay', ms(c.delay(NIER_MS.breath * k)));
      return;
    }
    const P = L.period({ family, motion, px }) * k, base = (L.MOTION[family] || L.MOTION.basic).dur * 1000 * k;
    const rP = base * 1.3, bP = base * 2.6, kP = P * 2;
    el.style.setProperty('--pml-dur', ms(P)); el.style.setProperty('--pml-delay', ms(c.delay(P)));
    el.style.setProperty('--pml-rdur', ms(rP)); el.style.setProperty('--pml-rdelay', ms(c.delay(rP)));
    el.style.setProperty('--pml-bdur', ms(bP)); el.style.setProperty('--pml-bdelay', ms(c.delay(bP)));
    el.style.setProperty('--pml-kdelay', ms(c.delay(kP)));
  }
  function busyNow(el) {
    let why = '';
    try { why = typeof W.PM_BUSY === 'function' ? W.PM_BUSY() : ''; } catch (_) { why = ''; }
    // the onboarding window holds the app beneath it, not its own loaders nor Demo Studio's (#o55-demo, the one body
    // child the window leaves usable, drawn above it)
    if (why === 'onboarding' && el.closest('#pm-o55-onboarding, #o55-demo')) return '';
    return why;
  }
  function set(el, run) { if (el.getAttribute('data-pml-run') !== run) el.setAttribute('data-pml-run', run); }
  function stillFor(el) { return pxOf(el) < 12; }
  /* one frame on: the frame whose style starts the animations is the frame whose time the phase was taken from */
  const pending = new Set();
  let raf = 0;
  function flush() {
    raf = 0;
    pending.forEach((el) => {
      if (!el.isConnected) return;
      if (stillFor(el)) { set(el, 'still'); return; }
      phase(el); set(el, 'on');
      /* the fade-in is the first arrival's only: once it has had its time (data-pml-in), coming back on (offscreen, a
         hidden tab, a busy spell or an ancestor's freeze lifting) never fades from nothing again, which flashed the
         still pose out for a frame */
      if (!el.hasAttribute('data-pml-in') && !el.__pmlIn) el.__pmlIn = setTimeout(() => { el.__pmlIn = 0; el.setAttribute('data-pml-in', ''); }, 400);
    });
    pending.clear();
  }
  function start(el) { pending.add(el); if (!raf) raf = requestAnimationFrame(flush); }

  function arm(el) {
    if (!el || !el.isConnected || el.nodeType !== 1 || !el.hasAttribute('data-pip-loader')) return;
    el.classList.add('pml-ld');
    // no data-pip-px from the host: the drawing's tier (and the below-12 px still rule) follow the size it renders at
    if (!(+el.getAttribute('data-pip-px') > 0)) { const w = Math.round(el.getBoundingClientRect().width); if (w > 0) el.setAttribute('data-pip-px', String(w)); }
    if (!el.hasAttribute('aria-hidden')) el.setAttribute('aria-hidden', 'true');
    if (!drawn(el)) draw(el);
    sweep();
    if (stillFor(el)) { set(el, 'still'); live.add(el); return; }
    if (busyNow(el)) { set(el, 'wait'); waiting.add(el); return; }
    live.add(el);
    if (!io && W.IntersectionObserver) io = new IntersectionObserver(seen, { rootMargin: '64px' });
    if (io) io.observe(el);
    if (D.visibilityState === 'hidden' || away) { set(el, 'off'); return; }
    start(el);
  }
  function seen(entries) {
    entries.forEach((e) => {
      const el = e.target;
      if (!el.isConnected) { io.unobserve(el); live.delete(el); el.__pmlVis = false; return; }
      el.__pmlVis = e.isIntersecting;
      if (!e.isIntersecting) { pending.delete(el); if (el.getAttribute('data-pml-run') === 'on') set(el, 'off'); }
      else if (el.getAttribute('data-pml-run') !== 'on' && D.visibilityState !== 'hidden' && !away) start(el);
    });
  }
  function sweep() {
    const now = performance.now();
    if (now - sweepAt < 2000) return;
    sweepAt = now;
    live.forEach((el) => { if (!el.isConnected) { live.delete(el); if (io) io.unobserve(el); } });
    waiting.forEach((el) => { if (!el.isConnected) waiting.delete(el); });
  }
  function holdAll() { live.forEach((el) => { pending.delete(el); if (el.getAttribute('data-pml-run') === 'on') set(el, 'off'); }); }
  function resumeAll() {
    if (D.visibilityState === 'hidden' || away) return;
    live.forEach((el) => { if (el.isConnected && el.getAttribute('data-pml-run') === 'off' && el.__pmlVis !== false) start(el); });
  }

  /* the opt-in, found when it is first styled (pm-loader.css runs pml-arm on an unarmed loader) */
  D.addEventListener('animationstart', (e) => { if (e.animationName === 'pml-arm') arm(e.target); }, true);
  D.addEventListener('visibilitychange', () => { if (D.visibilityState === 'hidden') holdAll(); else resumeAll(); });
  /* away: the window has not had the focus for a minute; any return wakes the loaders in phase */
  W.addEventListener('blur', () => { clearTimeout(awayTimer); awayTimer = setTimeout(() => { if (!D.hasFocus()) { away = true; holdAll(); } }, AWAY_MS); });
  const back = () => { clearTimeout(awayTimer); if (away) { away = false; resumeAll(); } };
  W.addEventListener('focus', back);
  ['pointerdown', 'keydown'].forEach((t) => D.addEventListener(t, back, { capture: true, passive: true }));
  /* a busy spell ended (11-motion-start.js sends pm-idle in its first still frame) */
  W.addEventListener('pm-idle', () => {
    const list = [...waiting]; waiting.clear();
    list.forEach((el) => { if (el.isConnected) { el.removeAttribute('data-pml-run'); arm(el); } });
  });
  /* a new look: every loader is drawn again in it and joins the phase. So does a change that swaps a running
     loader's animation for another: NieR's parts (the diamond or the ring), Reduced Motion (the app's or the OS's). */
  L.onLook(() => refresh());
  let swapT = 0;
  const swapped = () => { if (!live.size && !waiting.size) return; cancelAnimationFrame(swapT); swapT = requestAnimationFrame(() => refresh()); };
  new MutationObserver(swapped).observe(D.documentElement, { attributes: true, attributeFilter: ['data-o55-nier-parts', 'data-motion'] });
  try { W.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', swapped); } catch (_) { /* old engines */ }
  /* Animation speed: a change in Settings (PM51.watch), and otherwise at the next arm, after a drag, a return to the
     window or the tab, and the end of a busy spell; every loader is phased again at the new period */
  let lastSpeed = L.clock.speed();
  const speedCheck = () => { if (L.clock.speed() !== lastSpeed) refresh(); };
  if (typeof W.PM_ON_DRAGEND === 'function') W.PM_ON_DRAGEND(speedCheck);
  W.addEventListener('focus', speedCheck);
  D.addEventListener('visibilitychange', speedCheck);
  W.addEventListener('pm-idle', speedCheck);
  // a change in Settings (PM51 loads after this head script)
  W.addEventListener('load', () => { try { if (W.PM51 && typeof W.PM51.watch === 'function') W.PM51.watch('general.visual.animation-speed', () => setTimeout(speedCheck, 0)); } catch (_) { /* no Settings */ } }, { once: true });

  /* A redraw (a new look, a new Animation speed) swaps the drawing in place: no fade-in (data-pml-redraw), so a loader
     never blinks out; it joins the shared clock's phase at once. */
  function refresh() {
    lastSpeed = L.clock.speed();
    [...live, ...waiting].forEach((el) => {
      if (!el.isConnected) return;
      el.setAttribute('data-pml-redraw', '');
      draw(el);
      if (stillFor(el)) { set(el, 'still'); return; }
      if (el.getAttribute('data-pml-run') === 'on') start(el);
    });
  }
  function mount(root) {
    const r = root || D;
    const list = r.matches && r.matches('[data-pip-loader]') ? [r] : [];
    (r.querySelectorAll ? [...list, ...r.querySelectorAll('[data-pip-loader]')] : list).forEach((el) => { if (!el.hasAttribute('data-pml-run')) arm(el); });
  }
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  /* o: { motion = 'swing', px = 16 (the size the host expects), size? (a CSS length; default 1em), className? } */
  function html(o) {
    o = o || {};
    const motion = MOTIONS.indexOf(o.motion) >= 0 ? o.motion : 'swing', px = +o.px > 0 ? +o.px : 16, look = L.look();
    const size = o.size ? ` style="--pml-size:${esc(o.size)}"` : '';
    return `<span class="pml-ld${o.className ? ' ' + esc(o.className) : ''}" data-pip-loader="${motion}" data-pip-px="${px}" data-pml-look="${look}" aria-hidden="true"${size}>` +
      (isNier(look) ? NIER : L.mark({ px, motion, mood: motion === 'think' ? 'working' : 'idle', look, decorative: true })) + '</span>';
  }
  /* A host waiting: aria-busy on the host and a loader in it (first, or o.slot: 'end' or an element). The host's own
     words say what it waits for; o.status adds role="status" for a wait with no words of its own. */
  /* Hold (Demo Studio's lab switch, for inspection): while held, a wait that ends through busy() leaves its loader up;
     hold(false) ends those waits. Nothing else changes: a held loader still pauses offscreen and in drags, follows
     Reduced Motion and NieR's routing. */
  let holding = false;
  const deferred = new Set();
  function hold(on) {
    holding = !!on;
    if (!holding) { const list = [...deferred]; deferred.clear(); list.forEach((h) => { if (h.isConnected) busy(h, false); }); }
    return holding;
  }
  function busy(host, on, o) {
    if (!host) return false;
    o = o || {};
    const mine = host.__pmlBusy && host.__pmlBusy.isConnected ? host.__pmlBusy : host.querySelector('.pml-ld[data-pml-busy]');
    if (on) deferred.delete(host);
    if (!on && holding && mine) { deferred.add(host); return true; }
    if (!on) {
      host.removeAttribute('aria-busy');
      if (host.getAttribute('data-pml-status') === 'on') { host.removeAttribute('role'); host.removeAttribute('data-pml-status'); }
      if (mine) mine.remove();
      host.__pmlBusy = null;
      return true;
    }
    host.setAttribute('aria-busy', 'true');
    if (o.status && !host.hasAttribute('role')) { host.setAttribute('role', 'status'); host.setAttribute('data-pml-status', 'on'); }
    if (mine) return true;
    const t = D.createElement('template');
    t.innerHTML = html(o);
    const el = t.content.firstElementChild;
    el.setAttribute('data-pml-busy', '1');
    host.__pmlBusy = el;   // found again on clear, even in an outside slot
    const slot = o.slot && o.slot.nodeType === 1 ? o.slot : null;
    if (slot) slot.appendChild(el); else if (o.slot === 'end') host.appendChild(el); else host.insertBefore(el, host.firstChild);
    return true;
  }
  /* the context's motion (L5): 'think' for the thinking placeholder, 'hop' for a short wait that ends in success */
  const motion = (context) => (context === 'thinking' ? 'think' : context === 'short' ? 'hop' : 'swing');

  W.PM_PIP_LOADER = Object.freeze({
    version: 1, html, mount, busy, refresh, motion, hold, held: () => holding, clock: L.clock, MOTIONS,
    stats: () => ({ live: live.size, waiting: waiting.size, running: [...live].filter((el) => el.getAttribute('data-pml-run') === 'on').length, away })
  });
})();
