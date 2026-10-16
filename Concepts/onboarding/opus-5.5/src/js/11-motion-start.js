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
  let afterRo = null, observing = false, flushing = false;
  const watch = () => { if (!observing && afterQ.length) { observing = true; afterRo.observe(document.documentElement); } };
  const flushAfter = () => {
    if (afterRo && observing) { afterRo.unobserve(document.documentElement); observing = false; }
    const q = afterQ.splice(0);
    flushing = true;
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
    if (!flushing) watch();
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
})();
