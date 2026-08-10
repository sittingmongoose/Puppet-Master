/* ============================================================================
   Kimi K3 — T3 Turn Units (chat-thread concept).

   The transcript as a stack of self-contained unit cards: each prompt and
   the work it launched render inside one bordered turn card with a proper
   unit header, bubble-free messages inside, and 14px of air between units.
   All transcript behavior (hover row, collapse, lens, payloads, live
   region, scroll engine) lives in _thread-kit.js; this module is a thin
   registration plus presentation CSS (t3-turn-units.css).
   ========================================================================== */
(function () {
  'use strict';

  window.K3.registerThread('t3', {
    meta: {
      id: 't3',
      name: 'Turn Units',
      blurb: 'Each prompt/answer pair as one bordered unit card with a unit header; bubble-free prose inside.'
    },
    mount: function (hostEl, ctx) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-k3-thread', 't3');
      wrap.className = 't3-root';
      hostEl.appendChild(wrap);

      var inst = window.K3ThreadKit.mount(wrap, ctx, {
        groupBy: 'turn',
        workMode: 'inline',
        measure: 'reading',
        density: 'roomy',
        showStageRail: false,
        extraClass: 't3'
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
