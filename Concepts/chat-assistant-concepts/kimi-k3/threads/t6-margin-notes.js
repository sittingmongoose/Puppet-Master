/* ============================================================================
   Kimi K3 — T6 Margin Notes (chat-thread concept).

   Prose with a marginalia column: on wide enough containers the message
   hover/metadata row is parked in a ~150px right margin (meta always
   visible, action buttons revealed on hover), and on narrow containers the
   hover row returns to normal inline flow beneath the prose. All transcript
   behavior (hover row, collapse, lens, payloads, live region, scroll engine)
   lives in _thread-kit.js; this module is a thin registration plus
   presentation CSS (t6-margin-notes.css).
   ========================================================================== */
(function () {
  'use strict';

  window.K3.registerThread('t6', {
    meta: {
      id: 't6',
      name: 'Margin Notes',
      blurb: 'Reading-measure prose whose hover/meta row parks in a right margin on wide containers, returns to inline flow when narrow.'
    },
    mount: function (hostEl, ctx) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-k3-thread', 't6');
      wrap.className = 't6-root';
      hostEl.appendChild(wrap);

      var inst = window.K3ThreadKit.mount(wrap, ctx, {
        groupBy: 'none',
        workMode: 'inline',
        measure: 'reading',
        density: 'roomy',
        showStageRail: false,
        extraClass: 't6'
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
