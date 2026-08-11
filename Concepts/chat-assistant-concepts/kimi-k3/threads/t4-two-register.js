/* ============================================================================
   Kimi K3 — T4 Two Register (chat-thread concept).

   Two asymmetric registers in one transcript: user messages are compact
   quote blocks docked to the right edge, assistant messages are
   containerless full-measure prose flush left, and work payload cards drop
   out of the prose column entirely to span the full width as neutral
   bands. All transcript behavior (hover row, collapse, lens, payloads,
   live region, scroll engine) lives in _thread-kit.js; this module is a
   thin registration plus presentation CSS (t4-two-register.css).
   ========================================================================== */
(function () {
  'use strict';

  window.K3.registerThread('t4', {
    meta: {
      id: 't4',
      name: 'Two Register',
      blurb: 'Asymmetric registers: user quotes dock right, assistant prose runs full measure, work bands span the width.'
    },
    mount: function (hostEl, ctx) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-k3-thread', 't4');
      wrap.className = 't4-root';
      hostEl.appendChild(wrap);

      var inst = window.K3ThreadKit.mount(wrap, ctx, {
        groupBy: 'none',
        workMode: 'inline',
        measure: 'reading',
        density: 'roomy',
        showStageRail: false,
        extraClass: 't4'
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
