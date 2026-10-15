/* The "Concept demo" item: outside the onboarding window and never part of the product. It opens the Demo Studio
   (91-demo-studio.js, 92-demo-studio-ui.js), which gathers every demo control of the page: situations, Run onboarding,
   the Guided Tour, the story's clock, the workspace, Usage's demo readings, sample notices, looks, resets and the
   page's review switches. #o55-demo stays a child of <body> (the onboarding window marks every other body child inert
   and keeps this one usable), and its first child is the toggle button, which the Home layer docks into a slot at the
   status bar's left end (Concepts/home-redesign/src/panels/js/50-pageshell.js). The Studio's sheet is its second
   child. */
(function () {
  'use strict';
  const O55 = window.O55;
  function mount() {
    if (document.getElementById('o55-demo')) return;
    const el = document.createElement('div'); el.id = 'o55-demo'; el.className = 'o55-demo pmds'; el.setAttribute('data-pm-hover-exempt', 'true');
    const entry = document.createElement('button');
    entry.type = 'button'; entry.className = 'pmds-entry'; entry.setAttribute('data-demo', 'toggle');
    entry.setAttribute('aria-expanded', 'false'); entry.setAttribute('aria-haspopup', 'dialog'); entry.setAttribute('aria-controls', 'pmds-sheet');
    entry.setAttribute('data-pm-hover-label', O55.t('studio.entryHint'));
    el.appendChild(entry);
    document.body.appendChild(el);
    O55.studio.mount(el, entry);
  }
  O55.demo = { mount, open: (s) => O55.studio.open(s), close: () => O55.studio.close() };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
