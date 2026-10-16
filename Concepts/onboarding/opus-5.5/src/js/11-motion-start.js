/* Moves begun in a long frame play on the frames that are shown (final motion QA, 2026-10-16). A click's first frame
   can take a third of a second or more (the arriving page or panel is styled and laid out, a first visit builds its
   content), and so can the frame after it (its first paint, Glass's first blur). A move started in such a frame was
   over, or most of the way through, by the time it was first drawn: the timeline that frame runs on is from before its
   work, and a move run by the compositor takes its start from that time too. The page exit vanished in one frame, the
   onboarding window's exit was lost (and came back for one frame when restarted later), the rail's held panel went
   before the new one dealt in.
   PM_START_ON_SHOWN(anims) holds the moves at their start, paused, from the next frame on, for as long as the frame
   before was a long one (more than 40 ms after the one before it), then plays them from their start: they begin once
   frames come on time, at most `frames` (3) frames later (a page that never draws on time, such as
   software rendering, still moves after that). `anims` is an array of Animations or a function returning
   one (read again each frame). */
(function () {
  'use strict';
  window.PM_START_ON_SHOWN = function startOnShown(anims, o) {
    const max = (o && o.frames) || 3, held = new Set();
    const list = () => { try { return (typeof anims === 'function' ? anims() : anims) || []; } catch (_) { return []; } };
    const hold = () => list().forEach((a) => {
      try { if (a && a.playState !== 'idle' && !held.has(a)) { a.pause(); a.currentTime = 0; held.add(a); } } catch (_) { /* gone */ }
    });
    const release = () => held.forEach((a) => { try { if (a.playState === 'paused') a.play(); } catch (_) { /* gone */ } });
    let last = null, n = 0;
    const tick = () => {
      const now = document.timeline.currentTime;
      if (now == null) { release(); return; }
      const gap = last == null ? Infinity : now - last;
      last = now;
      if (gap <= 40 || ++n >= max) { release(); return; } /* the frame before this one was on time: play from the start */
      hold();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
})();
