/* O55 — Product Onboarding + Guided Tour for TestOpus5.5PmConcept (Opus 5.5).
   Namespace, copy lookup and shared constants. Every user-facing string lives in src/copy.json. */
(function () {
  'use strict';
  const O55 = window.O55 = window.O55 || {};
  O55.version = '1.0.0';
  O55.copy = window.O55_COPY || {};
  O55.FAMILIES = ['basic', 'friendly', 'glass', 'retro'];   /* the painted families (art, sound and skin voices) */
  O55.LOOKS = ['basic', 'friendly', 'glass', 'retro', 'nier'];   /* the five themes a person picks (Q22: NieR is the fifth) */
  O55.MODES = ['dark', 'light'];

  /* t('screens.welcome.title', {name}) — dotted lookup with {var} substitution. Missing keys return the key so gaps
     are visible in screenshots instead of silently blank. */
  O55.t = function t(key, vars) {
    let node = O55.copy;
    for (const part of String(key).split('.')) { if (node == null) break; node = node[part]; }
    let text = typeof node === 'string' ? node : key;
    if (vars) text = text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] == null ? m : String(vars[k])));
    return text;
  };
  O55.tx = function tx(key) { let node = O55.copy; for (const part of String(key).split('.')) { if (node == null) return null; node = node[part]; } return node; };

  /* The look on screen. NieR, the fifth theme (Q22), paints over Basic's tokens (src/settings/kit.d/18-nier.js): `family`
     is the painted family (basic under NieR; art, sounds and the window's skin follow `art`), `chosen` the theme the
     person picked ('nier' while NieR is painted; drafts, the look pickers and saves use it). */
  O55.theme = function theme() {
    const root = document.documentElement, raw = root.getAttribute('data-theme') || 'basic-dark';
    const [family, mode] = raw.split('-');
    const painted = O55.FAMILIES.includes(family) ? family : 'basic';
    const chosen = root.getAttribute('data-o55-nier') === 'on' ? 'nier' : painted;
    /* nier: NieR Mode is painted (live, or the onboarding preview); art: the art, sound and skin voice to use, which is
       'nier' while NieR Mode is painted and the painted family otherwise. `family` stays 'basic' under NieR. */
    const nier = root.getAttribute('data-o55-nier') === 'on';
    return { family: painted, chosen, mode: mode === 'light' ? 'light' : 'dark', slug: raw, nier, art: nier ? 'nier' : painted };
  };
})();
