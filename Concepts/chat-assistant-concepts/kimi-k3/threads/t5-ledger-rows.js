/* ============================================================================
   Kimi K3 — T5 Ledger Rows (chat-thread concept).

   The transcript as a bookkeeping ledger: dense rows separated by full-bleed
   hairlines, a 64px role-tag gutter ("YOU" / "ASST") at the left, dotted
   leaders running from activity labels to their durations, mono meta at
   half opacity, and work chips ruled like ledger totals. All transcript
   behavior (hover row, collapse, lens, payloads, live region, scroll
   engine) lives in _thread-kit.js; this module is a thin registration plus
   presentation CSS (t5-ledger-rows.css).
   ========================================================================== */
(function () {
  'use strict';

  window.K3.registerThread('t5', {
    meta: {
      id: 't5',
      name: 'Ledger Rows',
      blurb: 'Dense bookkeeping rows: role-tag gutter, hairline separators, dotted leaders, mono meta, work chips as total rows.'
    },
    mount: function (hostEl, ctx) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-k3-thread', 't5');
      wrap.className = 't5-root';
      hostEl.appendChild(wrap);

      var inst = window.K3ThreadKit.mount(wrap, ctx, {
        groupBy: 'none',
        workMode: 'chip',
        measure: 'full',
        density: 'compact',
        showStageRail: false,
        extraClass: 't5'
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
