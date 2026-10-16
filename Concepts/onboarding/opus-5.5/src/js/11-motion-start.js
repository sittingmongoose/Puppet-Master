/* Moves begun in a long frame play on the frames that are shown (final motion QA, 2026-10-16). A click's first frame
   can take a third of a second or more (the arriving page or panel is styled and laid out, a first visit builds its
   content), and so can the frame after it (its first paint, Glass's first blur). The time a frame draws at is the one
   from before its work, so a move started in it was over before it was seen: the page exit vanished in one frame, the
   onboarding window's exit was lost, the rail's held panel went before the new one dealt in.
   PM_START_ON_SHOWN(anims) puts the moves back to their start at every frame that follows a long one (more than 40 ms
   after the previous), so they begin from the first frame after which frames come on time; at most `frames` frames
   (8). `anims` is an array of Animations or a function returning one (read again each frame). */
(function () {
  'use strict';
  window.PM_START_ON_SHOWN = function startOnShown(anims, o) {
    const max = (o && o.frames) || 8, list = () => { try { return (typeof anims === 'function' ? anims() : anims) || []; } catch (_) { return []; } };
    let last = null, n = 0;
    const tick = () => {
      const now = document.timeline.currentTime;
      if (now == null) return;
      const gap = last == null ? Infinity : now - last;
      last = now;
      if (gap <= 40) return; /* the frame before this one was on time: the moves run from their last start */
      list().forEach((a) => { try { if (a && a.playState !== 'idle') a.startTime = now; } catch (_) { /* gone */ } });
      if (++n < max) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
})();
