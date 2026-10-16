/* Moves begun in a long frame play on the frames that are shown (final motion QA, 2026-10-16). A click's first frame
   can take a third of a second or more (the arriving page or panel is styled and laid out, a first visit builds its
   content), and so can the frame after it (its first paint, Glass's first blur). A move started in such a frame was
   over, or most of the way through, by the time it was first drawn: the timeline that frame runs on is from before its
   work, and a move run by the compositor takes its start from that time too. The page exit vanished in one frame, the
   onboarding window's exit was lost (and came back for one frame when restarted later), the rail's held panel went
   before the new one dealt in.
   PM_START_ON_SHOWN(anims) holds the moves at their start, paused, from the next frame on, for as long as the frame
   before was a long one (more than 40 ms after the one before it), then plays them from their start: they begin once
   frames come on time (two in a row after a long one), at most `frames` (6) frames later (a page that never draws
   on time, such as software rendering, still moves after that). `anims` is an array of Animations or a function
   returning one (read again each frame). `o.release`, if given, runs once in the frame the moves start, just before they play:
   a page change hands the click's fade over to its exit there (tools/shell_motion.py, ANSWER_FIRST). */
(function () {
  'use strict';
  /* PM_AFTER_LAYOUT(fn): fn runs in the coming frame after its style and layout, before its paint (a ResizeObserver
     delivery), so what it reads is already computed. One observer, made as this script loads, serves every caller:
     ResizeObservers are told in the order they were made, and one made at the moment it was needed was told after the
     page's older observers, some of which write in that same delivery (the Liquid Glass root observer), so the read
     paid a whole-page restyle anyway (Home's notice placement 215 ms, the theme's resize kick 389 ms on the P1000,
     Settings lane trace). Callers queued meanwhile run once, in the order they asked. */
  const afterQ = [];
  let afterRo = null, observing = false, flushing = false, flushedAt = null;
  const watch = () => { if (!observing && afterQ.length) { observing = true; afterRo.observe(document.documentElement); } };
  const flushAfter = () => {
    if (afterRo && observing) { afterRo.unobserve(document.documentElement); observing = false; }
    const q = afterQ.splice(0);
    flushing = true;
    flushedAt = document.timeline.currentTime;
    for (const fn of q) { try { fn(); } catch (e) { try { console.error('[PM_AFTER_LAYOUT]', e); } catch (_) { /* none */ } } }
    flushing = false;
    /* asked again from inside this delivery: the next frame's (observing again here would be a loop the browser
       reports as undelivered notifications) */
    if (afterQ.length && afterRo) requestAnimationFrame(watch);
  };
  try { afterRo = typeof ResizeObserver === 'function' ? new ResizeObserver(flushAfter) : null; } catch (_) { afterRo = null; }
  window.PM_AFTER_LAYOUT = function afterLayout(fn) {
    if (afterQ.indexOf(fn) < 0) afterQ.push(fn);
    if (!afterRo) { requestAnimationFrame(() => setTimeout(flushAfter, 0)); return; }
    if (flushing) return;
    /* asked after this frame's delivery already ran (another observer's delivery, later in the same frame): observing
       the root now would be one the browser cannot deliver this frame and reports as a loop. The next frame's
       animation frame callbacks observe it instead; a task between frames lands in that same next frame anyway. */
    if (flushedAt != null && flushedAt === document.timeline.currentTime) { requestAnimationFrame(watch); return; }
    watch();
  };
  window.PM_START_ON_SHOWN = function startOnShown(anims, o) {
    const max = (o && o.frames) || 6, held = new Set(), before = o && typeof o.release === 'function' ? o.release : null;
    const list = () => { try { return (typeof anims === 'function' ? anims() : anims) || []; } catch (_) { return []; } };
    const hold = () => list().forEach((a) => {
      try { if (a && a.playState !== 'idle' && !held.has(a)) { a.pause(); a.currentTime = 0; held.add(a); } } catch (_) { /* gone */ }
    });
    const release = () => {
      if (before) { try { before(); } catch (_) { /* decoration only */ } }
      held.forEach((a) => { try { if (a.playState === 'paused') a.play(); } catch (_) { /* gone */ } });
    };
    /* the frame the moves were begun after: a first frame on time (the task that began them was short) leaves them as
       they are, with no pause and restart, so a fast computer sees nothing of this */
    /* After a long frame the moves wait for two frames on time in a row: the long frame's new content is rastered by
       the GPU after it, and while it rasters (a whole new page: 150-400 ms on the P1000) the compositor draws
       nothing, so a move begun on the first frame back was still shown in two or three steps (the onboarding window's
       exit at Enter, round 3). The frames themselves stop while that raster runs, so the second on-time frame comes
       after it. */
    let last = document.timeline.currentTime, n = 0, onTime = 0, long = false;
    const tick = () => {
      const now = document.timeline.currentTime;
      if (now == null) { release(); return; }
      /* a frame is long when it began late, or when its own style and layout have already run long (this check runs
         after them): the Wizard built under the onboarding window is styled inside the frame that begins right after
         Enter, so the frames began on time while that one ran 300 ms, and the window's exit, started from that
         frame's time, was over by its first draw */
      const gap = last == null ? Infinity : now - last, late = performance.now() - now;
      last = now;
      if (gap <= 40 && late <= 40) { onTime++; if (!long || onTime >= 2) { release(); return; } }
      else { long = true; onTime = 0; }
      if (++n >= max) { release(); return; }
      hold();
      next();
    };
    /* Each check runs in its frame after layout (PM_AFTER_LAYOUT, before paint), so reading
       the moves (getAnimations for CSS animations) finds style already computed: from an animation frame callback it
       forced that frame's style early (49.7 ms on the P1000 for the customizer's six panels, editor lane). What the
       check changes is drawn in the same frame. */
    const next = () => requestAnimationFrame(() => window.PM_AFTER_LAYOUT(tick));
    next();
  };

  /* PM_BUSY(): one answer for work parked until the app is still (the editor's and terminal's background refreshes,
     their measurement and token reads), so every caller waits for the same things. It returns what is up, as a short
     name (truthy), or '' (falsy) when nothing is:
       'page'        a page change (html[data-pm-page-transition])
       'usage'       a Usage moment (html[data-pmu-moment])
       'onboarding'  the onboarding window (html[data-o55-open])
       'boot'        the boot covers: html[data-o55-boot-wait], NieR's boot log (#o55nw-boot), the tour's (.o55t-bootcover)
       'reboot'      the NieR reboot plate (#o55np-reboot), until it is removed
       'calm'        the Reduce Animations NieR cover (#o55np-calm), through its fade
       'theme'       the look cover (js/12-theme-transition.js), until its lift has ended
       'nier'        a NieR switch asked and not yet painted (PM_NIER.wanted() differs from on())
     A hidden tab is not busy by itself (callers keep their own document.hidden check). It reads attributes and ids only,
     never style or layout, so it costs nothing in any frame. 'pm-idle' is sent on window in the first frame after a
     busy spell ends: every spell this script sees begin (one of those markers appearing) or that a call finds. */
  const busyRoot = document.documentElement;
  const BUSY_ATTRS = [['data-pm-page-transition', 'page'], ['data-pmu-moment', 'usage'], ['data-o55-open', 'onboarding'], ['data-o55-boot-wait', 'boot']];
  const BUSY_IDS = [['o55np-reboot', 'reboot'], ['o55np-calm', 'calm'], ['o55nw-boot', 'boot']];
  /* the tour's boot cover is always a child of the body (85-tour-nier.js coverBoot): its ~30 children are looked at,
     never a live collection, whose length walks the whole document again after any DOM change (4.3 ms a call on
     Nas1 during an editor open, Glass lane) */
  const tourCovered = () => { for (let c = document.body && document.body.lastElementChild; c; c = c.previousElementSibling) if (c.classList.contains('o55t-bootcover')) return true; return false; };
  let busyFrame = 0, busyTimer = 0;
  const busyNow = () => {
    for (const [a, why] of BUSY_ATTRS) if (busyRoot.hasAttribute(a)) return why;
    for (const [id, why] of BUSY_IDS) if (document.getElementById(id)) return why;
    if (tourCovered()) return 'boot';
    try { const t = window.PM_THEME_TRANSITION; if (t && typeof t.busy === 'function' && t.busy()) return 'theme'; } catch (_) { /* none */ }
    try { const n = window.PM_NIER; if (n && typeof n.wanted === 'function' && typeof n.on === 'function' && !!n.wanted() !== !!n.on()) return 'nier'; } catch (_) { /* none */ }
    return '';
  };
  /* A spell's end is seen where it happens (an attribute or a cover going, the theme cover's lift ending, a NieR switch
     painting: busyEnded, from the observer below and from 12-theme-transition.js), and checked in that frame; a slow
     check (250 ms) catches anything else. A spell can last the whole onboarding session, and a frame callback for
     each of its frames kept a main frame per vsync for nothing (landing review SH-8). */
  let busySpell = false;
  const busyCheck = () => {
    busyFrame = 0;
    if (!busySpell) return;
    if (busyNow()) { clearTimeout(busyTimer); busyTimer = setTimeout(() => { busyTimer = 0; if (!busyFrame) busyFrame = requestAnimationFrame(busyCheck); }, 250); return; }
    busySpell = false; clearTimeout(busyTimer); busyTimer = 0;
    try { window.dispatchEvent(new Event('pm-idle')); } catch (_) { /* none */ }
  };
  const busyArm = () => { if (!busySpell) { busySpell = true; if (!busyFrame) busyFrame = requestAnimationFrame(busyCheck); } };
  const busyEnded = () => { if (busySpell && !busyFrame) busyFrame = requestAnimationFrame(busyCheck); };
  window.PM_BUSY = function busy() { const why = busyNow(); if (why) busyArm(); return why; };
  window.PM_BUSY.ended = busyEnded;
  /* a spell begins or ends: an attribute on html (NieR's own for a switch that paints), a cover added to or taken
     from the body */
  try {
    const seen = new MutationObserver(() => { if (busySpell) busyEnded(); else if (busyNow()) busyArm(); });
    seen.observe(busyRoot, { attributes: true, attributeFilter: BUSY_ATTRS.map((a) => a[0]).concat(['data-o55-nier']) });
    const watchBody = () => { if (document.body) seen.observe(document.body, { childList: true }); };
    if (document.body) watchBody(); else document.addEventListener('DOMContentLoaded', watchBody, { once: true });
  } catch (_) { /* calls still arm it */ }
})();
