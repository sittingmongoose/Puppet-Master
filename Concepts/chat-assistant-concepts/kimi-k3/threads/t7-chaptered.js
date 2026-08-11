/* ============================================================================
   Kimi K3 — T7 Chaptered (chat-thread concept).

   The transcript as chapters: the kit groups every CHAPTER_SIZE messages and
   drops a .k3t-chapter divider between chapters; this concept makes those
   dividers prominent sticky banners (so the current chapter's range stays
   pinned as you scroll), promotes the chapter outline chips into a mini
   table-of-contents, and indents messages under their chapter. All transcript
   behavior (hover row, collapse, lens, payloads, live region, scroll engine)
   lives in _thread-kit.js; this module is a thin registration plus
   presentation CSS (t7-chaptered.css).
   ========================================================================== */
(function () {
  'use strict';

  window.K3.registerThread('t7', {
    meta: {
      id: 't7',
      name: 'Chaptered',
      blurb: 'Transcript grouped into chapters: sticky chapter banners, a mini table-of-contents of outline chips, messages indented underneath.'
    },
    mount: function (hostEl, ctx) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-k3-thread', 't7');
      wrap.className = 't7-root';
      hostEl.appendChild(wrap);

      var inst = window.K3ThreadKit.mount(wrap, ctx, {
        groupBy: 'chapter',
        workMode: 'inline',
        measure: 'reading',
        density: 'roomy',
        showStageRail: false,
        extraClass: 't7'
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
