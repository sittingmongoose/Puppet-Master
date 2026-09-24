/* O55.store — durable, secret-free session state. Keys: pm.o55.onboarding.v1 (setup draft(s), screen, completed owner
   work refs), pm.o55.tour.v1 (safe-step checkpoint: ids + completed predicates only), pm.o55.sound (on/off).
   Passwords, tokens, device codes and key material never enter these records. */
(function () {
  'use strict';
  const O55 = window.O55;
  const KEYS = { onboarding: 'pm.o55.onboarding.v1', tour: 'pm.o55.tour.v1', scenario: 'pm.o55.scenario.v1' };
  const FORBIDDEN = /password|secret|token|apiKey|api_key|privateKey|deviceCode|code_value/i;

  function scrub(value, path) {
    if (Array.isArray(value)) return value.map((v, i) => scrub(v, `${path}[${i}]`));
    if (value && typeof value === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(value)) {
        if (FORBIDDEN.test(k)) continue; // defence in depth: protected fields are never persisted
        out[k] = scrub(v, `${path}.${k}`);
      }
      return out;
    }
    return value;
  }

  O55.store = {
    KEYS,
    get(name, fallback) {
      try { const raw = localStorage.getItem(KEYS[name] || name); return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; }
    },
    set(name, value) {
      try { localStorage.setItem(KEYS[name] || name, JSON.stringify(scrub(value, name))); return true; } catch (_) { return false; }
    },
    clear(name) { try { localStorage.removeItem(KEYS[name] || name); } catch (_) {} },
    scrub
  };
})();
