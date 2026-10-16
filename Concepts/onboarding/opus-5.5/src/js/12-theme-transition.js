/* A look change answers at once (final motion QA B4, 2026-10-16). Repainting the whole app for a new theme restyles
   every drawn element in one pass (about 250 ms on the P1000, a fraction of that on the M3), and the old menu ran that
   pass, and two or three more forced by the theme's listeners, inside the click: nothing moved for most of a second.
   Now the control pressed shows its new state on the next frame, and the repaint runs in the task after that frame,
   once. A View Transition was tried for a crossfade and dropped: starting one restyles the whole page by itself in
   Chrome (measured 230-300 ms on the P1000 before its callback runs), which doubled the wait.

   window.PM_THEME_TRANSITION(apply)  — apply() writes the theme; picks made before it runs keep only the latest. */
(function () {
  'use strict';
  let job = null;
  function run() {
    const apply = job; job = null;
    if (!apply) return;
    try { apply(); } catch (e) { try { console.error('[PM_THEME_TRANSITION]', e); } catch (_) {} }
  }
  window.PM_THEME_TRANSITION = function themeTransition(apply) {
    const queued = !!job;
    job = apply;
    if (!queued) requestAnimationFrame(() => window.setTimeout(run, 0));
  };
})();
