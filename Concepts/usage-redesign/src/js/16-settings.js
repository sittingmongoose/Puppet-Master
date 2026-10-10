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
    /* ---- per-provider auto-switch (item 2): the provider-scope values live in the Settings owner (PM51.providerPolicy,
       the providers manager: p.props[id], scope providers-service). own(providerId, ids) -> the provider's OWN values,
       keyed like ids ({auto: id, ...} -> {auto: value}); a key without an own value is absent (the global applies). */
    providerPolicy: function (providerId, ids) {
      var p = pm51(), out = {}, api = p && p.providerPolicy, own = null;
      try { own = api && typeof api.own === 'function' ? api.own(providerId) : null; } catch (error) { own = null; }
      if (!own) {   /* read-only fallback: the Settings state itself */
        var prov = snapshot().providers.filter(function (x) { return x.id === providerId; })[0];
        own = {}; if (prov && prov.props) Object.keys(prov.props).forEach(function (k) { var v = prov.props[k]; if (v !== null && v !== undefined && v !== '') own[k] = v; });
      }
      Object.keys(ids || {}).forEach(function (k) { if (Object.prototype.hasOwnProperty.call(own, ids[k])) out[k] = own[ids[k]]; });
      return out;
    },
    /* an account's own value (the account scope, e.g. ai.accounts.account-threshold-override); undefined = none */
    accountValue: function (providerId, accountId, id) {
      var prov = snapshot().providers.filter(function (x) { return x.id === providerId; })[0];
      var acc = prov && (prov.accounts || []).filter(function (a) { return a.id === accountId; })[0];
      var v = acc && acc.props ? acc.props[id] : undefined;
      return v === '' || v === null ? undefined : v;
    },
    providerWritable: function () { var p = pm51(); return !!(p && p.providerPolicy && typeof p.providerPolicy.set === 'function'); },
    /* one provider-scope write, as a Settings transaction (canon SSYS-009/018, UCC: cmd.settings.transaction.preview then
       .apply with scope=provider): both go through the page's command seam (a host may cancel either; a cancelled
       dispatch writes nothing), then the Settings owner applies the change (PM51.providerPolicy.set, the same write the
       Settings rows make). value null = the provider follows the shared value again. -> {ok, receipt, preview} */
    setProvider: function (providerId, id, value, source) { return PMU.settings.setProviderMany(providerId, [{ id: id, value: value }], source); },
    /* several provider-scope values in ONE transaction (e.g. "Use the shared settings": every own value cleared at once);
       a cancelled preview or apply writes none of them. -> {ok, reason, receipt, preview} */
    setProviderMany: function (providerId, list, source) {
      var p = pm51(), api = p && p.providerPolicy;
      if (!api || typeof api.set !== 'function') return { ok: false, reason: 'Settings is not available' };
      var changes = (list || []).map(function (x) {
        var before = null; try { before = api.get(providerId, x.id); } catch (error) { before = null; }
        var inherit = x.value === null || x.value === undefined;
        return { setting_id: x.id, scope: 'provider', scope_id: providerId, value: inherit ? null : x.value, inherit: inherit,
          previous: before ? (before.own ? before.value : null) : null, previous_effective: before ? before.value : null, _shared: before ? before.shared : null };
      });
      if (!changes.length) return { ok: false, reason: 'Nothing to change' };
      var wire = changes.map(function (c) { var o = Object.assign({}, c); delete o._shared; return o; });
      var payload = { scope: 'provider', provider_id: providerId, changes: wire, source: source || 'usage.accounts' };
      var preview = command('cmd.settings.transaction.preview', payload, { valid: true, conflicts: [],
        effective_after: changes.length === 1 ? (changes[0].inherit ? changes[0]._shared : changes[0].value) : changes.map(function (c) { return c.inherit ? c._shared : c.value; }) });
      if (preview.dispatch_accepted === false) return { ok: false, reason: 'The change was cancelled', preview: preview, receipt: preview };
      var receipt = command('cmd.settings.transaction.apply', Object.assign({ preview_receipt_id: preview.receipt_id }, payload), { applied: true });
      if (receipt.dispatch_accepted === false) return { ok: false, reason: 'The change was cancelled', preview: preview, receipt: receipt };
      var ok = true;
      changes.forEach(function (c) { try { if (api.set(providerId, c.setting_id, c.inherit ? null : c.value) === false) ok = false; } catch (error) { ok = false; } });
      /* the roster's providers and accounts did not change (the policy is read live from the owner): the snapshot is kept,
         so the click task does not pay for another copy of the Settings state */
      changes.forEach(function (c) { emit('write:' + c.setting_id + '@' + providerId); });
      return { ok: ok, reason: ok ? '' : 'Settings did not take the change', preview: preview, receipt: receipt };
    },
    /* whether Settings draws per-provider auto-switch choices for this provider (two or more accounts, a kind that has
       accounts to switch between); null when the Settings owner cannot say */
    providerMulti: function (providerId) {
      var p = pm51(), api = p && p.providerPolicy;
      try { return api && typeof api.multi === 'function' && api.get(providerId, 'ai.accounts.multi-account-switching') ? !!api.multi(providerId) : null; } catch (error) { return null; }
    },
    useNext: function (providerId, accountId) {
      var k = kimi(); if (!k || typeof k.dispatchAction !== 'function') return false;
      try { k.dispatchAction('pm51-providers-account-next', { provider: providerId, account: accountId }); } catch (error) { return false; }
      invalidate(); emit('next-account');
      return true;
    },
    /* a setting id opens that setting's bloom; a provider id lands on that provider in Providers & Accounts (its own
       pane, no bloom over it), through the Settings owner's navigate and its providers-open action */
    open: function (providerId, settingId) {
      try { if (window.PM_PAGES && typeof window.PM_PAGES.go === 'function') window.PM_PAGES.go('settings'); } catch (error) {}
      var k = kimi();
      if (providerId && !settingId && k && typeof k.navigate === 'function') {
        try {
          var tab = document.getElementById('tab-settings'); if (tab && !document.getElementById('panel-settings').classList.contains('active')) tab.click();
          k.navigate('ai', 'providers');
          if (typeof k.dispatchAction === 'function') k.dispatchAction('pm51-providers-open', { provider: providerId });
          return true;
        } catch (error) { /* fall back to the bloom below */ }
      }
      try { if (typeof window.PM7_SETTINGS_OPEN_BLOOM === 'function') window.PM7_SETTINGS_OPEN_BLOOM('ai', settingId || 'ai.accounts.provider-connections'); } catch (error) {}
      return false;
    },
    invalidate: function (reason) { invalidate(); if (reason) emit(reason); },
    onChange: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }
  };
})();
