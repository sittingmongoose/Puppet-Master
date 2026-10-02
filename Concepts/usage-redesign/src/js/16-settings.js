/* The bridge to the Settings owner (owner: engine; ARCHITECTURE.md section 6, DESIGN-SPEC section 10.8). The Accounts
   room reads providers and accounts from the Settings state and writes the auto-switch controls through the Settings
   owner's own host path, never a Usage copy. */
(function () {
  var cache = null, listeners = [];
  function kimi() { return window.PM12_KIMI && typeof window.PM12_KIMI.getState === 'function' ? window.PM12_KIMI : null; }
  function pm51() { return window.PM51 && typeof window.PM51.value === 'function' ? window.PM51 : null; }
  function emit(reason) { listeners.slice().forEach(function (fn) { try { fn(reason); } catch (error) { console.error('[pm-usage] settings listener', error); } }); }
  function invalidate() { cache = null; }
  function snapshot() {
    if (cache) return cache;
    var k = kimi(), s = null;
    try { s = k ? k.getState() : null; } catch (error) { s = null; }
    cache = { providers: (s && Array.isArray(s.providers)) ? s.providers : [], next: (s && s.pm51 && s.pm51.o55NextAccount) || null };
    return cache;
  }

  PMU.settings = {
    GROUPS: [{ id: 'plan', label: 'Subscriptions and plans' }, { id: 'use', label: 'Pay as you go' }, { id: 'own', label: 'Free and your own' }],
    available: function () { return !!(kimi() && pm51()); },
    providers: function () { return snapshot().providers; },
    nextAccount: function () { return snapshot().next; },
    value: function (id) { var p = pm51(); try { return p ? p.value(id) : undefined; } catch (error) { return undefined; } },
    set: function (id, value) {
      var k = kimi(); if (!k || typeof k.setSettingFromHost !== 'function') return false;
      var ok = false;
      try { ok = k.setSettingFromHost(id, value, false) !== false; } catch (error) { ok = false; }
      invalidate(); emit('write:' + id);
      return ok;
    },
    useNext: function (providerId, accountId) {
      var k = kimi(); if (!k || typeof k.dispatchAction !== 'function') return false;
      try { k.dispatchAction('pm51-providers-account-next', { provider: providerId, account: accountId }); } catch (error) { return false; }
      invalidate(); emit('next-account');
      return true;
    },
    open: function (providerId, settingId) {
      try { if (window.PM_PAGES && typeof window.PM_PAGES.go === 'function') window.PM_PAGES.go('settings'); } catch (error) {}
      try { if (typeof window.PM7_SETTINGS_OPEN_BLOOM === 'function') window.PM7_SETTINGS_OPEN_BLOOM('ai', settingId || 'ai.accounts.provider-connections'); } catch (error) {}
    },
    invalidate: function (reason) { invalidate(); if (reason) emit(reason); },
    onChange: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }
  };
})();
