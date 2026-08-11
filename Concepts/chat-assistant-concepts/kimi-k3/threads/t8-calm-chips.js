/* ============================================================================
   Kimi K3 — T8 Calm Chips (chat-thread concept).

   The most conversation-first treatment: unbordered, spacious turns (18px of
   air, transparent backgrounds, no card chrome) so the prose breathes; work
   records collapse to quiet low-contrast chips (workMode:'chip') that recede
   until opened; the prose itself is the largest in the set. All transcript
   behavior (hover row, collapse, lens, payloads, live region, scroll engine)
   lives in _thread-kit.js; this module is a thin registration plus
   presentation CSS (t8-calm-chips.css).
   ========================================================================== */
(function () {
  'use strict';

  window.K3.registerThread('t8', {
    meta: {
      id: 't8',
      name: 'Calm Chips',
      blurb: 'Most conversation-first: unbordered spacious turns, the largest prose, and work records as quiet low-contrast chips.'
    },
    mount: function (hostEl, ctx) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-k3-thread', 't8');
      wrap.className = 't8-root';
      hostEl.appendChild(wrap);

      var inst = window.K3ThreadKit.mount(wrap, ctx, {
        groupBy: 'turn',
        workMode: 'chip',
        measure: 'reading',
        density: 'roomy',
        showStageRail: false,
        extraClass: 't8'
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
