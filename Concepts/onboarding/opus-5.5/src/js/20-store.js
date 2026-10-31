/* O55.store — durable, secret-free session state. Keys: pm.o55.onboarding.v1 (setup draft(s), screen, completed owner
   work refs), pm.o55.tour.v1 (safe-step checkpoint: ids + completed predicates only; the tour's restoration basis, layout and
   Chat identities without the composer's text, is its own record pm.o55.tour-basis.v1, see 80-tour-core.js). Sound is deliberately not
   stored here: the sound control mirrors the current Project's Settings row general.interaction.sound-effects
   (default on), and with no Project it is a session-only preview that persists nothing.
   Passwords, tokens, device codes and key material never enter these records. */
(function () {
  'use strict';
  const O55 = window.O55;
  const KEYS = { onboarding: 'pm.o55.onboarding.v1', tour: 'pm.o55.tour.v1', scenario: 'pm.o55.scenario.v1' };
  const FORBIDDEN = /password|passphrase|secret|token|apiKey|api_key|privateKey|private_key|deviceCode|device_code|code_value/i;
  /* The guard reads field names, not the ids a map is keyed by: a field is a plain identifier (password, apiKey,
     secretTyped), while ids carry a hyphen, colon or bar (the provider qwen-token, the operation key:qwen-token:1, a
     forge instance github|hosted|). A provider called "…-token" is not a token, and dropping it lost that account's
     non-secret state on every save (provider-login audit P17); the fields inside it are still read. */
  const FIELD = /^[A-Za-z_$][\w$]*$/;
  /* a pairing code typed on Connect or for a NAS that runs Puppet Master: older sessions kept it as plain `code`
     (SCR-02); the key is too common to forbid everywhere, so it is dropped at those two places */
  const FORBIDDEN_AT = /^onboarding\.(connect|nas)\.code$/;

  function scrub(value, path) {
    if (Array.isArray(value)) return value.map((v, i) => scrub(v, `${path}[${i}]`));
    if (value && typeof value === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(value)) {
        if ((FIELD.test(k) && FORBIDDEN.test(k)) || FORBIDDEN_AT.test(`${path}.${k}`)) continue; // defence in depth: protected fields are never persisted
        out[k] = scrub(v, `${path}.${k}`);
      }
      return out;
    }
    return value;
  }

  /* A page with no storage at all (a sandboxed preview: an opaque origin, where touching localStorage throws; T3's file
     preview is one) keeps these records in memory for the visit, so a situation chosen in Demo Studio, a run's progress
     and the tour's checkpoint hold until the page closes instead of falling back to a fresh computer (Jared's QA round 2,
     Q18/Q19 sweep). A page with storage behaves as before. */
  const LS = (() => { try { const ls = window.localStorage; ls.getItem(KEYS.onboarding); return ls; } catch (_) { return null; } })();
  const memory = LS ? null : new Map();
  const keyOf = (name) => KEYS[name] || name;
  O55.store = {
    KEYS,
    persistent: !!LS,
    get(name, fallback) {
      try { const raw = memory ? memory.get(keyOf(name)) : LS.getItem(keyOf(name)); return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; }
    },
    set(name, value) {
      try {
        const raw = JSON.stringify(scrub(value, name));
        if (memory) memory.set(keyOf(name), raw); else LS.setItem(keyOf(name), raw);
        return true;
      } catch (_) { return false; }
    },
    clear(name) { if (memory) { memory.delete(keyOf(name)); return; } try { LS.removeItem(keyOf(name)); } catch (_) {} },
    scrub
  };
})();
