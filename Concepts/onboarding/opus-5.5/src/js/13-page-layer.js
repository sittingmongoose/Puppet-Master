/* The page in front becomes a compositor layer of its own when the pointer reaches the title bar or the keyboard a
   page tab, so the click's answer (the leaving page's fade to 0.86, tools/shell_motion.py ANSWER_FIRST) runs on a
   layer that is already rastered. Made at the click, that layer had to be rastered first: on the P1000 the click's
   frame came 280 ms late and the fade was never seen, and a page changing under it (the Wizard's stages) was drawn
   empty while it rastered again (round 4 films). The layer is kept only while the title bar is pointed at or a page
   tab focused, and a little after: a layer is a stacking context, and the pages hold modals and toasts meant to sit
   above the whole app, so a page showing one of those is not promoted. It is dropped when the page leaves (its exit's
   cleanup) and when the pointer moves on. Promoted or not, every look draws the same pixels (Nas1 screenshots, five
   looks by four pages). */
(function () {
  'use strict';
  const OVER = '#pm6-proj-sheet, #projectSettingsModal, #pm6WizDocOverlay, #pm6OrchSpModal, [aria-modal="true"]';
  let dropTimer = 0;
  const pageInFront = () => document.querySelector('.primary-content > .page.active');
  /* the title bar is crossed on the way to any page tab: promoting there gives the raster a little more time */
  const tabOf = (n) => (n && n.nodeType === 1 && n.closest ? n.closest('.page-tab[data-page], .title-bar') : null);
  function overlayShown(page) {
    for (const el of page.querySelectorAll(OVER)) if (el.getClientRects().length) return true;
    const toasts = page.querySelector('.toast-stack');
    return !!(toasts && toasts.childElementCount && toasts.getClientRects().length);
  }
  function promote() {
    clearTimeout(dropTimer);
    const page = pageInFront();
    if (!page || page.classList.contains('pm-page-layer') || page.classList.contains('pm8-page-in') || overlayShown(page)) return;
    page.classList.add('pm-page-layer');
  }
  function drop() {
    document.querySelectorAll('.primary-content > .page.pm-page-layer').forEach((p) => {
      if (!p.classList.contains('pm8-page-out')) p.classList.remove('pm-page-layer');
    });
  }
  const dropSoon = () => { clearTimeout(dropTimer); dropTimer = setTimeout(drop, 900); };
  document.addEventListener('pointerover', (e) => { if (tabOf(e.target)) promote(); }, true);
  document.addEventListener('pointerout', (e) => { if (tabOf(e.target) && !tabOf(e.relatedTarget)) dropSoon(); }, true);
  document.addEventListener('focusin', (e) => { if (tabOf(e.target)) promote(); }, true);
  document.addEventListener('focusout', (e) => { if (tabOf(e.target) && !tabOf(e.relatedTarget)) dropSoon(); }, true);
  window.PM_PAGE_LAYER = { promote, drop };
})();
