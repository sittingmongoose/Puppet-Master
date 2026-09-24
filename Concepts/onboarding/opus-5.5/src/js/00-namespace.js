/* O55 — Product Onboarding + Guided Tour for TestOpus5.5PmConcept (Opus 5.5).
   Namespace, copy lookup and shared constants. Every user-facing string lives in src/copy.json. */
(function () {
  'use strict';
  const O55 = window.O55 = window.O55 || {};
  O55.version = '1.0.0';
  O55.copy = window.O55_COPY || {};
  O55.FAMILIES = ['basic', 'friendly', 'glass', 'retro'];
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

  O55.theme = function theme() {
    const raw = document.documentElement.getAttribute('data-theme') || 'basic-dark';
    const [family, mode] = raw.split('-');
    return { family: O55.FAMILIES.includes(family) ? family : 'basic', mode: mode === 'light' ? 'light' : 'dark', slug: raw };
  };
})();
