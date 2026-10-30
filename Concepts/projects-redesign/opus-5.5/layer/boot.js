/* Projects concepts (Opus 5.5): boot. Loaded last, after the core, the flow and the three concepts. It shows the Projects
   page, mounts the default concept (A) and tells index.html the layer is ready; index.html then sends its config. */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.booted) return;
  function boot(n) {
    if (!(W.PMG && W.PM_PAGES && W.document.getElementById('panel-projects'))) { if (n < 100) setTimeout(() => boot(n + 1), 100); return; }
    PJX.booted = true;
    W.document.documentElement.setAttribute('data-pjx-layer', 'on');
    try { if (W.PM_PAGES.current !== 'projects') W.PM_PAGES.go('projects'); } catch (e) { /* the page switcher may still be starting */ }
    PJX.mount(PJX.S.opt);
    // the look can change from PMConcept7's own theme menu too: concepts that draw marks redraw them
    new MutationObserver(() => PJX.rerender()).observe(W.document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] });
    PJX.report('ready');
  }
  boot(0);
})(window);
