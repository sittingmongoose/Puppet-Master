/* ============================================================================
   Kimi K3 — T2 Spine Timeline (chat-thread concept).

   The transcript as a quiet git-style timeline: a 2px vertical spine runs
   down the left gutter, every message is a node on it (hollow circle for
   the user, filled accent circle for the assistant), and activity stage-rail
   items branch off the spine as milestone ticks. All transcript behavior
   (hover row, collapse, lens, payloads, live region, scroll engine) lives in
   _thread-kit.js; this module is a thin registration plus presentation CSS
   (t2-spine-timeline.css).
   ========================================================================== */
(function () {
  'use strict';

  window.K3.registerThread('t2', {
    meta: {
      id: 't2',
      name: 'Spine Timeline',
      blurb: 'A quiet git-style timeline: every message a node on a left spine, activity stages as milestone ticks.'
    },
    mount: function (hostEl, ctx) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-k3-thread', 't2');
      wrap.className = 't2-root';
      hostEl.appendChild(wrap);

      var inst = window.K3ThreadKit.mount(wrap, ctx, {
        groupBy: 'none',
        workMode: 'inline',
        measure: 'full',
        density: 'roomy',
        showStageRail: true,
        extraClass: 't2'
      });

      return {
        unmount: function () {
          try { inst.unmount(); } catch (e) { /* ignore */ }
          wrap.remove();
        },
        reveal: inst.reveal,
        scrollToLatest: inst.scrollToLatest,
        refresh: inst.refresh
      };
    }
  });
})();
