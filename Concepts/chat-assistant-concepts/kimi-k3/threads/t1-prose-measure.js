/* ============================================================================
   Kimi K3 — T1 Prose Measure (chat-thread concept).

   Reference thread concept: the conversation is the product. Bubble-free
   prose on a centered 68ch reading measure, role monogram chips in a 40px
   gutter, work records as slim inline entries under their turn. All
   transcript behavior (hover row, collapse, lens, payloads, live region,
   scroll engine) lives in _thread-kit.js; this module is a thin
   registration plus presentation CSS (t1-prose-measure.css).
   ========================================================================== */
(function () {
  'use strict';

  window.K3.registerThread('t1', {
    meta: {
      id: 't1',
      name: 'Prose Measure',
      blurb: 'Bubble-free prose on a centered reading measure; monogram gutter chips; work records as slim inline entries.'
    },
    mount: function (hostEl, ctx) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-k3-thread', 't1');
      wrap.className = 't1-root';
      hostEl.appendChild(wrap);

      var inst = window.K3ThreadKit.mount(wrap, ctx, {
        groupBy: 'none',
        workMode: 'inline',
        measure: 'reading',
        density: 'roomy',
        showStageRail: false,
        extraClass: 't1'
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
