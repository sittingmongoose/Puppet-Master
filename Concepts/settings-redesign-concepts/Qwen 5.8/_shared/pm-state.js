(function () {
  "use strict";

  var listeners = [];
  var receiptSeq = 0;

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  var D = window.PMDemoData;

  var state = {
    scenario: "default",
    view: { name: "home" },
    settings: {},
    settingIndex: {},
    providers: clone(D.providers),
    catalogs: clone(D.catalogs),
    roles: clone(D.roles),
    notices: clone(D.notices),
    recents: clone(D.recents),
    memory: clone(D.memory),
    mcpServers: clone(D.mcpServers),
    crewTemplates: clone(D.crewTemplates),
    lspServers: clone(D.lspServers),
    terminalProfiles: clone(D.terminalProfiles),
    contextSources: clone(D.contextSources),
    skills: clone(D.skills),
    plugins: clone(D.plugins),
    tools: clone(D.tools),
    commands: clone(D.commands),
    personas: clone(D.personas),
    mediaProviders: clone(D.mediaProviders),
    mediaHistory: clone(D.mediaHistory),
    receipts: [],
    shell: { rail: "closed", assistant: "closed", wtier: "wide" },
    ui: { disclosure: "standard", refreshingCatalog: null, focusTarget: null, spellThreadDisabled: false }
  };

  D.destinations.forEach(function (dest) {
    dest.subcategories.forEach(function (sub) {
      sub.settings.forEach(function (s) {
        state.settings[s.id] = clone(s);
        state.settingIndex[s.id] = { dest: dest.id, sub: sub.id };
      });
    });
  });

  function emit(kind, payload) {
    listeners.forEach(function (fn) {
      try { fn(kind, payload); } catch (e) { if (window.console) console.error("PMState listener error:", e); }
    });
  }

  function receipt(title, detail, kind) {
    receiptSeq += 1;
    var r = { id: "receipt-" + receiptSeq, at: new Date(), title: title, detail: detail || "", kind: kind || "sim" };
    state.receipts.push(r);
    if (state.receipts.length > 30) state.receipts.shift();
    emit("receipt", r);
    return r;
  }

  function getSetting(id) { return state.settings[id] || null; }

  function setSettingValue(id, value) {
    var s = state.settings[id];
    if (!s) return null;
    if (s.source === "managed" || s.source === "unavailable") {
      receipt("Setting is managed", s.reason || s.managedBy || "This value cannot be changed here.", "blocked");
      return s;
    }
    s.value = value;
    s.source = "custom";
    receipt("Saved " + s.label, humanValue(s) + " — applies to future requests in this scope.", "ok");
    emit("setting", { id: id });
    return s;
  }

  function resetSetting(id) {
    var s = state.settings[id];
    if (!s) return null;
    var original = findOriginal(id);
    s.value = clone(original.value);
    s.source = original.source === "custom" ? "default" : original.source;
    if (s.source === "inherited") s.value = clone(original.value);
    receipt("Reset " + s.label, "Back to " + (s.source === "inherited" ? "the inherited value" : "default") + ".", "ok");
    emit("setting", { id: id });
    return s;
  }

  function findOriginal(id) {
    var out = null;
    D.destinations.forEach(function (dest) {
      dest.subcategories.forEach(function (sub) {
        sub.settings.forEach(function (s) { if (s.id === id) out = s; });
      });
    });
    return out;
  }

  function humanValue(s) {
    if (s.type === "toggle") return s.value ? "On" : "Off";
    return String(s.value);
  }

  function providerById(id) {
    for (var i = 0; i < state.providers.length; i++) if (state.providers[i].id === id) return state.providers[i];
    return null;
  }

  function setPreferredAccount(providerId, accountId) {
    var p = providerById(providerId);
    if (!p) return;
    p.preferredAccount = accountId;
    p.accounts.forEach(function (a) { a.preferred = a.id === accountId; });
    var acc = p.accounts.filter(function (a) { return a.id === accountId; })[0];
    receipt("Preferred account changed", p.name + " now prefers " + (acc ? acc.label : accountId) + " for future requests. Running work is not retargeted.", "ok");
    emit("providers", { providerId: providerId });
  }

  function toggleFavorite(providerId, modelId) {
    var p = providerById(providerId);
    if (!p) return;
    p.models.forEach(function (m) { if (m.id === modelId) m.favorite = !m.favorite; });
    emit("providers", { providerId: providerId });
  }

  function setAlias(providerId, modelId, alias) {
    var p = providerById(providerId);
    if (!p) return;
    p.models.forEach(function (m) { if (m.id === modelId) m.alias = alias; });
    receipt("Alias saved", alias ? "Alias set to " + alias + "." : "Alias removed.", "ok");
    emit("providers", { providerId: providerId });
  }

  function accountById(providerId, accountId) {
    var p = providerById(providerId);
    if (!p) return null;
    var out = null;
    p.accounts.forEach(function (a) { if (a.id === accountId) out = a; });
    return out;
  }

  function setAccountNickname(providerId, accountId, nickname) {
    var a = accountById(providerId, accountId);
    if (!a) return;
    a.nickname = nickname;
    receipt(nickname ? "Nickname saved" : "Nickname removed", a.label + (nickname ? " is now nicknamed " + nickname + "." : " no longer has a nickname."), "ok");
    emit("providers", { providerId: providerId });
  }

  function setAccountSticky(providerId, accountId, on) {
    var a = accountById(providerId, accountId);
    if (!a) return;
    a.sticky = on;
    receipt("Sticky sessions " + (on ? "on" : "off"), a.label + (on ? ": future requests prefer staying on this account once they start." : ": future requests may move between eligible accounts."), "ok");
    emit("providers", { providerId: providerId });
  }

  function setAccountEnabled(providerId, accountId, enabled) {
    var p = providerById(providerId);
    var a = accountById(providerId, accountId);
    if (!p || !a) return;
    a.enabled = enabled;
    if (!enabled && a.preferred) {
      a.preferred = false;
      var next = null;
      p.accounts.forEach(function (x) { if (x.enabled && !next) next = x; });
      if (next) {
        next.preferred = true;
        p.preferredAccount = next.id;
        receipt("Account disabled", a.label + " is disabled. Future requests now prefer " + next.label + ". Running work is not retargeted.", "ok");
      } else {
        p.preferredAccount = null;
        receipt("Account disabled", a.label + " is disabled. No enabled account remains for " + p.name + ".", "blocked");
      }
    } else {
      receipt(enabled ? "Account enabled" : "Account disabled", a.label + (enabled ? " is available for future requests again." : " will not be used for future requests."), "ok");
    }
    emit("providers", { providerId: providerId });
  }

  function moveAccountPriority(providerId, accountId, dir) {
    var p = providerById(providerId);
    if (!p) return;
    var list = p.accounts.slice().sort(function (a, b) { return (a.priority || 1) - (b.priority || 1); });
    var idx = -1;
    list.forEach(function (a, i) { if (a.id === accountId) idx = i; });
    var swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= list.length) return;
    var tmp = list[idx].priority;
    list[idx].priority = list[swap].priority;
    list[swap].priority = tmp;
    emit("providers", { providerId: providerId });
  }

  function setSpellThreadDisabled(on) {
    state.ui.spellThreadDisabled = on;
    receipt(on ? "Spellcheck off for this thread" : "Spellcheck on for this thread", on ? "Thread-local override. The project and global defaults are unchanged." : "The thread override was removed.", "ok");
    emit("spellthread", on);
  }

  function toggleHidden(providerId, modelId) {
    var p = providerById(providerId);
    if (!p) return;
    var m = null;
    p.models.forEach(function (x) { if (x.id === modelId) m = x; });
    if (!m) return;
    m.hidden = !m.hidden;
    receipt(m.hidden ? "Model hidden" : "Model shown", m.name + (m.hidden ? " is hidden from menus. It stays configured." : " is visible in menus again."), "ok");
    emit("providers", { providerId: providerId });
  }

  function movePriority(providerId, modelId, dir) {
    var p = providerById(providerId);
    if (!p) return;
    var list = p.models.slice().sort(function (a, b) { return a.priority - b.priority; });
    var idx = -1;
    list.forEach(function (m, i) { if (m.id === modelId) idx = i; });
    var swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= list.length) return;
    var a = list[idx].priority;
    list[idx].priority = list[swap].priority;
    list[swap].priority = a;
    emit("providers", { providerId: providerId });
  }

  function refreshCatalog(catalogId) {
    var c = null;
    state.catalogs.forEach(function (x) { if (x.id === catalogId) c = x; });
    if (!c || state.ui.refreshingCatalog) return;
    state.ui.refreshingCatalog = catalogId;
    c.state = "refreshing";
    c.lastChecked = "Refreshing…";
    emit("catalog", { id: catalogId, state: "refreshing" });
    receipt("Catalog refresh started", c.name + " is refreshing. Last-known-good rows stay active.", "info");
    setTimeout(function () {
      c.state = "idle";
      c.lastChecked = "Just now";
      c.lastActivated = "Just now";
      c.version = "commit " + Math.random().toString(16).slice(2, 8);
      state.ui.refreshingCatalog = null;
      receipt("Catalog refreshed", c.name + " activated a fresh catalog. No material changes.", "ok");
      emit("catalog", { id: catalogId, state: "idle" });
    }, 2200);
  }

  function providerAction(providerId, action) {
    var p = providerById(providerId);
    if (!p) return;
    if (action === "probe") {
      receipt("Readiness probe queued", p.name + ": a safe generation check will run. Simulated in this concept.", "sim");
    } else if (action === "diagnostics") {
      receipt("Diagnostics opened", p.name + ": transport, auth owner, and probe history collected.", "sim");
    } else if (action === "install") {
      receipt("Install started", p.name + " installation is simulated. CLI-owned login becomes available after install.", "sim");
    } else if (action === "reconnect") {
      receipt("Reconnect requested", p.name + ": credential owner re-verified. Simulated in this concept.", "sim");
    } else if (action === "repair") {
      receipt("Repair run", p.name + ": rescan complete, no changes needed. Simulated.", "sim");
    } else if (action === "login") {
      receipt("Native login launched", p.name + " owns this login flow inside its isolated CLI profile. Puppet Master verifies readiness afterwards. Simulated.", "sim");
    } else if (action === "rescan") {
      receipt("Rescan complete", p.name + ": installation verified, no profiles signed in. Simulated.", "sim");
    } else if (action === "update") {
      receipt("Update check complete", p.name + " is already on the newest version. Simulated.", "sim");
    }
    emit("providers", { providerId: providerId });
  }

  function navigate(view) {
    state.view = view;
    emit("navigate", view);
  }

  function applyScenario(name) {
    state.scenario = name;
    state.catalogs = clone(D.catalogs);
    state.providers = clone(D.providers);
    state.notices = clone(D.notices);
    if (name === "calm") state.notices = [];
    if (name === "attention") {
      state.notices = clone(D.notices).filter(function (n) { return n.kind === "attention"; });
    }
    if (name === "refreshing") {
      state.catalogs.forEach(function (c) { if (c.id === "free-coding-models") { c.state = "refreshing"; c.lastChecked = "Refreshing…"; } });
    }
    if (name === "exhausted") {
      var p = providerById("anthropic");
      if (p && p.accounts[0]) p.accounts[0].usage.included = "exhausted";
    }
    emit("scenario", name);
  }

  function subscribe(fn) { listeners.push(fn); }

  window.PMState = {
    state: state,
    emit: emit,
    subscribe: subscribe,
    receipt: receipt,
    getSetting: getSetting,
    setSettingValue: setSettingValue,
    resetSetting: resetSetting,
    humanValue: humanValue,
    providerById: providerById,
    setPreferredAccount: setPreferredAccount,
    accountById: accountById,
    setAccountNickname: setAccountNickname,
    setAccountSticky: setAccountSticky,
    setAccountEnabled: setAccountEnabled,
    moveAccountPriority: moveAccountPriority,
    setSpellThreadDisabled: setSpellThreadDisabled,
    toggleFavorite: toggleFavorite,
    toggleHidden: toggleHidden,
    setAlias: setAlias,
    movePriority: movePriority,
    refreshCatalog: refreshCatalog,
    providerAction: providerAction,
    navigate: navigate,
    applyScenario: applyScenario
  };
})();
