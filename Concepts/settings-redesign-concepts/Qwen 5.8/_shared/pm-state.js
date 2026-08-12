(function () {
  "use strict";

  var listeners = [];
  var receiptSeq = 0;

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  var D = window.PMDemoData;

  // --- Persistence ----------------------------------------------------------
  var conceptId = document.documentElement.getAttribute("data-concept-id") || "concept";
  var storeKey = "pm.settings-demo." + conceptId;
  var persistTimer = null;

  // Demo collections that persist and mutate via actions.
  var seed = {
    notificationDestinations: D.notificationDestinations,
    eventRouting: D.eventRouting,
    soundLibrary: D.soundLibrary,
    soundPacks: D.soundPacks,
    quietHours: D.quietHours,
    customThemes: D.customThemes,
    permissionRules: D.permissionRules,
    perToolOverrides: D.perToolOverrides,
    fileSafe: D.fileSafe,
    formatterTable: D.formatterTable,
    commandsCatalog: D.commandsCatalog,
    shortcutBindings: D.shortcutBindings,
    testingMatrix: D.testingMatrix,
    storageHealth: D.storageHealth,
    backupRuns: D.backupRuns,
    historyRows: D.historyRows,
    artifactRows: D.artifactRows,
    searchIndexCfg: D.searchIndexCfg,
    personalDict: [],
    projectDict: [],
    dismissedNotices: []
  };


  var state = {
    conceptId: conceptId,
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
    collections: clone(seed),
    receipts: [],
    shell: { rail: "closed", assistant: "closed", wtier: "wide" },
    ui: { disclosure: "standard", refreshingCatalog: null, focusTarget: null, spellThreadDisabled: false, lastDestinationTest: 0, preImportSnapshot: null }
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
    schedulePersist();
    listeners.forEach(function (fn) {
      try { fn(kind, payload); } catch (e) { if (window.console) console.error("PMState listener error:", e); }
    });
  }

  // Explicit init: concept pages MUST call PMState.init("<concept-id>") before
  // their first render so persistence hydrates from the concept-specific key.
  function init(id) {
    if (id) {
      conceptId = id;
      storeKey = "pm.settings-demo." + id;
      // Reset persistable state from seeds first so switching concepts cannot
      // leak another concept's in-memory mutations (hydrate returns false on an
      // empty key and would otherwise leave stale state behind).
      state.scenario = "default";
      state.ui.disclosure = "standard";
      state.ui.refreshingCatalog = null;
      state.ui.focusTarget = null;
      state.ui.preImportSnapshot = null;
      state.settings = {};
      state.settingIndex = {};
      state.providers = clone(D.providers);
      state.catalogs = clone(D.catalogs);
      state.notices = clone(D.notices);
      state.memory = clone(D.memory);
      state.mcpServers = clone(D.mcpServers);
      state.crewTemplates = clone(D.crewTemplates);
      state.collections = clone(seed);
      D.destinations.forEach(function (dest) {
        dest.subcategories.forEach(function (sub) {
          sub.settings.forEach(function (s) {
            state.settings[s.id] = clone(s);
            state.settingIndex[s.id] = { dest: dest.id, sub: sub.id };
          });
        });
      });
      hydrate();
    }
    state.conceptId = conceptId;
    emit("init", { conceptId: conceptId });
    return conceptId;
  }

  // --- Persistence implementation -------------------------------------------
  function serialize() {
    var providers = clone(state.providers).map(function (p) {
      // Transient runtime flags are not persisted.
      delete p._phase;
      return p;
    });
    return JSON.stringify({
      v: 2,
      scenario: state.scenario,
      ui: { disclosure: state.ui.disclosure },
      settings: state.settings,
      providers: providers,
      catalogs: state.catalogs,
      notices: state.notices,
      memory: state.memory,
      mcpServers: state.mcpServers,
      crewTemplates: state.crewTemplates,
      collections: state.collections,
      dismissedNotices: state.collections.dismissedNotices
    });
  }

  function schedulePersist() {
    if (persistTimer) return;
    persistTimer = setTimeout(function () {
      persistTimer = null;
      try { window.localStorage.setItem(storeKey, serialize()); } catch (e) { /* storage full/blocked — demo continues */ }
    }, 300);
  }

  function hydrate() {
    var raw = null;
    try { raw = window.localStorage.getItem(storeKey); } catch (e) { raw = null; }
    if (!raw) return false;
    try {
      var saved = JSON.parse(raw);
      if (!saved || saved.v !== 2) return false;
      if (saved.settings) state.settings = saved.settings;
      if (saved.providers) state.providers = saved.providers;
      if (saved.catalogs) state.catalogs = saved.catalogs;
      if (saved.notices) state.notices = saved.notices;
      if (saved.memory) state.memory = saved.memory;
      if (saved.mcpServers) state.mcpServers = saved.mcpServers;
      if (saved.crewTemplates) state.crewTemplates = saved.crewTemplates;
      if (saved.collections) {
        var merged = clone(seed);
        Object.keys(saved.collections).forEach(function (k) { merged[k] = saved.collections[k]; });
        state.collections = merged;
      }
      if (saved.scenario) state.scenario = saved.scenario;
      if (saved.ui && saved.ui.disclosure) state.ui.disclosure = saved.ui.disclosure;
      return true;
    } catch (e) { return false; }
  }
  hydrate();

  function resetDemo() {
    try { window.localStorage.removeItem(storeKey); } catch (e) {}
    window.location.reload();
  }

  // --- Receipts --------------------------------------------------------------
  function receipt(title, detail, kind) {
    receiptSeq += 1;
    var r = { id: "receipt-" + receiptSeq, at: new Date(), title: title, detail: detail || "", kind: kind || "sim" };
    state.receipts.push(r);
    if (state.receipts.length > 30) state.receipts.shift();
    emit("receipt", r);
    return r;
  }

  // --- Settings ---------------------------------------------------------------
  function getSetting(id) { return state.settings[id] || null; }

  function humanValue(s) {
    if (s.type === "toggle") return s.value ? "On" : "Off";
    return String(s.value);
  }

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

  function findOriginal(id) {
    var out = null;
    D.destinations.forEach(function (dest) {
      dest.subcategories.forEach(function (sub) {
        sub.settings.forEach(function (s) { if (s.id === id) out = s; });
      });
    });
    return out;
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

  function dismissNotice(id) {
    if (state.collections.dismissedNotices.indexOf(id) < 0) state.collections.dismissedNotices.push(id);
    receipt("Notice dismissed", "It will not return unless its condition changes. Simulated in this concept.", "info");
    emit("notices", { id: id });
  }

  // --- Providers ---------------------------------------------------------------
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

  function selectInstallation(providerId, installationId) {
    var p = providerById(providerId);
    if (!p) return;
    var chosen = null;
    (p.installations || []).forEach(function (i) {
      i.selected = i.id === installationId;
      if (i.selected) chosen = i;
    });
    if (!chosen) return;
    receipt("Installation selected", p.name + " now uses " + chosen.label + ". Shadowed copies remain visible but unused.", "ok");
    emit("providers", { providerId: providerId });
  }

  function installProvider(providerId) {
    var p = providerById(providerId);
    if (!p || !p.install) return;
    p._phase = "installing";
    p.stateLabel = "Installing from official source…";
    emit("providers", { providerId: providerId });
    receipt("Install started", p.name + " installs from the official source onto the selected Host/Environment. Never bundled, never pre-seeded. Simulated in this concept.", "sim");
    setTimeout(function () {
      p._phase = null;
      p.state = "installed";
      p.stateLabel = "Installed — sign in to verify";
      p.installations = p.installations || [];
      p.installations.push({ id: providerId + "-fresh", label: p.name + " (fresh install)", kind: "cli", command: p.name.toLowerCase().split(" ")[0], resolved: "Installed just now", method: "Official installer", owner: "Official installer", confidence: "Proven", selected: true, state: "ready", host: "Home TrueNAS — Windows", env: "Windows native", evidence: "Fresh install receipt" });
      receipt("Install finished", p.name + " is installed. CLI-owned login becomes available now. Simulated.", "sim");
      emit("providers", { providerId: providerId });
    }, 1800);
  }

  function checkUpdate(providerId) {
    var p = providerById(providerId);
    if (!p) return;
    receipt("Update check", p.name + ": " + (p.updateState === "update-available" ? "an update is available." : "already on the newest version.") + " Simulated.", "sim");
    emit("providers", { providerId: providerId });
  }

  function applyUpdate(providerId, opts) {
    var p = providerById(providerId);
    if (!p) return;
    var fail = opts && opts.fail;
    p._phase = "updating";
    p.updateState = "updating";
    emit("providers", { providerId: providerId });
    receipt("Update started", p.name + " is updating. Phases: Updating → Verifying → Ready. Simulated.", "info");
    setTimeout(function () {
      p._phase = "verifying";
      p.updateState = "verifying";
      emit("providers", { providerId: providerId });
      setTimeout(function () {
        p._phase = null;
        if (fail) {
          p.updateState = "rolled-back";
          receipt("Verification failed — rolled back", p.name + " failed launch health verification and was rolled back to the previous version. The selected installation was not changed. Simulated.", "blocked");
        } else {
          p.updateState = "ready";
          receipt("Update verified", p.name + " passed verification: path, launch health, identity, catalog, and adapter handshake. Simulated.", "ok");
        }
        emit("providers", { providerId: providerId });
      }, 1400);
    }, 1200);
  }

  function repairInstallation(providerId) {
    var p = providerById(providerId);
    if (!p) return;
    receipt("Repair run", p.name + ": rescan complete — wrappers, symlinks, and shims traced; no changes needed. Simulated.", "sim");
    emit("providers", { providerId: providerId });
  }

  function providerAction(providerId, action) {
    var p = providerById(providerId);
    if (!p) return;
    if (action === "probe") {
      receipt("Readiness probe queued", p.name + ": a safe generation check will run. Simulated in this concept.", "sim");
    } else if (action === "diagnostics") {
      receipt("Diagnostics opened", p.name + ": transport, auth owner, and probe history collected.", "sim");
    } else if (action === "reconnect") {
      receipt("Reconnect requested", p.name + ": credential owner re-verified. Simulated in this concept.", "sim");
    } else if (action === "login") {
      receipt("Native login launched", p.name + " owns this login flow inside its isolated CLI profile. Puppet Master verifies readiness afterwards. Simulated.", "sim");
    } else if (action === "rescan") {
      receipt("Rescan complete", p.name + ": installation verified, no profiles signed in. Simulated.", "sim");
    }
    emit("providers", { providerId: providerId });
  }

  // --- Spellcheck dictionaries -------------------------------------------------
  function setSpellThreadDisabled(on) {
    state.ui.spellThreadDisabled = on;
    receipt(on ? "Spellcheck off for this thread" : "Spellcheck on for this thread", on ? "Thread-local override. The project and global defaults are unchanged." : "The thread override was removed.", "ok");
    emit("spellthread", on);
  }

  function addToDictionary(kind, word) {
    var list = kind === "personal" ? state.collections.personalDict : state.collections.projectDict;
    if (list.indexOf(word) < 0) list.push(word);
    receipt("Added to " + kind + " dictionary", word + " will not be underlined again.", "ok");
    emit("dict", { kind: kind, word: word });
  }

  function removeFromDictionary(kind, word) {
    var list = kind === "personal" ? state.collections.personalDict : state.collections.projectDict;
    var i = list.indexOf(word);
    if (i >= 0) list.splice(i, 1);
    receipt("Removed from " + kind + " dictionary", word + " may be underlined again.", "ok");
    emit("dict", { kind: kind, word: word });
  }

  // --- Notifications & Sounds ----------------------------------------------------
  function collectionList(name) { return state.collections[name]; }

  function addDestination(dest) {
    dest.id = "dest-custom-" + Date.now().toString(36);
    dest.builtin = false;
    dest.state = dest.state || "connected";
    state.collections.notificationDestinations.push(dest);
    receipt("Destination added", dest.name + " can receive routed events now. Simulated delivery.", "ok");
    emit("collections", { name: "notificationDestinations" });
    return dest;
  }

  function updateDestination(id, patch) {
    var d = null;
    state.collections.notificationDestinations.forEach(function (x) { if (x.id === id) d = x; });
    if (!d) return;
    Object.keys(patch || {}).forEach(function (k) { d[k] = patch[k]; });
    receipt("Destination updated", d.name + " saved.", "ok");
    emit("collections", { name: "notificationDestinations" });
  }

  function deleteDestination(id) {
    var list = state.collections.notificationDestinations;
    var d = null;
    list.forEach(function (x) { if (x.id === id) d = x; });
    state.collections.notificationDestinations = list.filter(function (x) { return x.id !== id; });
    receipt("Destination removed", (d ? d.name : "Destination") + " no longer receives events. Simulated.", "ok");
    emit("collections", { name: "notificationDestinations" });
  }

  function toggleDestination(id, on) {
    var d = null;
    state.collections.notificationDestinations.forEach(function (x) { if (x.id === id) d = x; });
    if (!d) return;
    d.enabled = !!on;
    receipt(d.enabled ? "Destination enabled" : "Destination disabled", d.name + (d.enabled ? " receives routed events again." : " stops receiving events."), "ok");
    emit("collections", { name: "notificationDestinations" });
  }

  function testDestination(id) {
    var now = Date.now();
    var d = null;
    state.collections.notificationDestinations.forEach(function (x) { if (x.id === id) d = x; });
    if (!d) return;
    if (now - state.ui.lastDestinationTest < 10000) {
      receipt("Rate limited", "Test-send is explicit, masked, and rate-limited. Try again shortly. Simulated.", "blocked");
      emit("collections", { name: "notificationDestinations" });
      return;
    }
    state.ui.lastDestinationTest = now;
    if (d.state === "rate-limited") {
      receipt("Test-send throttled", d.name + " accepted the request but throttled it. Masked target shown in logs. Simulated.", "blocked");
    } else if (d.state === "needs-auth") {
      receipt("Test-send failed", d.name + " needs a reconnect before it can deliver. Simulated.", "blocked");
    } else {
      receipt("Test message sent", d.name + " delivered a masked test event. Success predicate matched. Simulated.", "ok");
    }
    emit("collections", { name: "notificationDestinations" });
  }

  function fakeHash(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return h.toString(16).slice(0, 4) + "…" + (h % 4096).toString(16);
  }

  function uploadSound(name) {
    var up = { id: "up-" + Date.now().toString(36), name: name || "uploaded-sound.wav", uploaded: "Just now", duration: (0.4 + ((name || "").length % 8) / 10).toFixed(1) + " s", hash: fakeHash(name || "uploaded"), mappedTo: "Unassigned" };
    state.collections.soundLibrary.uploads.push(up);
    receipt("Sound uploaded", up.name + " — hash " + up.hash + ", duration " + up.duration + ". Local only until mapped. Simulated.", "ok");
    emit("collections", { name: "soundLibrary" });
    return up;
  }

  function previewSound(id) {
    // Local-only preview: a short WebAudio beep. Never leaves the device.
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.frequency.value = 660;
      gain.gain.value = 0.05;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
      osc.onended = function () { ctx.close(); };
    } catch (e) { /* audio blocked — receipt still records the preview */ }
    receipt("Preview played", "Local-only preview. Test-send is separate, explicit, and rate-limited.", "info");
    emit("collections", { name: "soundLibrary" });
  }

  function deleteSound(id) {
    var lib = state.collections.soundLibrary;
    lib.uploads = lib.uploads.filter(function (u) { return u.id !== id; });
    receipt("Uploaded sound deleted", "The mapping reverted to the built-in default. Simulated.", "ok");
    emit("collections", { name: "soundLibrary" });
  }

  function importPack(packId) {
    var pack = null;
    state.collections.soundPacks.forEach(function (x) { if (x.id === packId) pack = x; });
    if (!pack) return;
    if (pack.state === "format-invalid") {
      receipt("Pack rejected", pack.name + ": manifest format unsupported. No sounds were registered.", "blocked");
    } else if (pack.state === "license-check-failed") {
      receipt("License check failed", pack.name + " stays disabled until its license can be verified. PM never bundles unverified packs.", "blocked");
    } else {
      pack.imported = true;
      receipt("Pack imported", pack.name + ": format and license verified, " + pack.sounds + " sounds registered.", "ok");
    }
    emit("collections", { name: "soundPacks" });
  }

  // --- Permissions ---------------------------------------------------------------
  function addPermissionRule(match, effect, note) {
    var list = state.collections.permissionRules;
    var order = list.length ? Math.max.apply(null, list.map(function (r) { return r.order; })) + 1 : 1;
    list.push({ id: "rule-" + Date.now().toString(36), order: order, match: match || "**", effect: effect || "Ask for approval", note: note || "Custom rule", origin: "Custom" });
    receipt("Rule added", "New rule appended at position " + order + ". Last match wins.", "ok");
    emit("collections", { name: "permissionRules" });
  }

  function updatePermissionRule(id, patch) {
    var r = null;
    state.collections.permissionRules.forEach(function (x) { if (x.id === id) r = x; });
    if (!r) return;
    Object.keys(patch || {}).forEach(function (k) { r[k] = patch[k]; });
    receipt("Rule updated", r.match + " now " + r.effect + ".", "ok");
    emit("collections", { name: "permissionRules" });
  }

  function deletePermissionRule(id) {
    state.collections.permissionRules = state.collections.permissionRules.filter(function (r) { return r.id !== id; });
    receipt("Rule removed", "Remaining rules re-evaluate top to bottom.", "ok");
    emit("collections", { name: "permissionRules" });
  }

  function reorderPermissionRule(id, dir) {
    var list = state.collections.permissionRules.slice().sort(function (a, b) { return a.order - b.order; });
    var idx = -1;
    list.forEach(function (r, i) { if (r.id === id) idx = i; });
    var swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= list.length) return;
    var tmp = list[idx].order;
    list[idx].order = list[swap].order;
    list[swap].order = tmp;
    list.sort(function (a, b) { return a.order - b.order; }).forEach(function (r, i) { r.order = i + 1; });
    state.collections.permissionRules = list;
    receipt("Rules reordered", "Order changed — last match wins, so outcomes may change.", "info");
    emit("collections", { name: "permissionRules" });
  }

  function testPermissionTrace(path) {
    var list = state.collections.permissionRules.slice().sort(function (a, b) { return a.order - b.order; });
    var matched = null;
    var steps = [];
    list.forEach(function (r) {
      var pat = r.match.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "§§").replace(/\*/g, "[^/]*").replace(/§§/g, ".*");
      var hit = new RegExp("^" + pat + "$").test(path);
      steps.push({ rule: r, hit: hit });
      if (hit) matched = r;
    });
    var verdict = matched ? matched.effect : "Allow (global default)";
    receipt("Trace: " + path, (matched ? "Last matching rule #" + matched.order + " (" + matched.match + ") → " + matched.effect : "No rule matched — global default applies.") + " Simulated.", matched && matched.effect === "Deny" ? "blocked" : "info");
    emit("collections", { name: "permissionRules", trace: { path: path, steps: steps, verdict: verdict } });
    return { path: path, steps: steps, verdict: verdict };
  }

  // --- Code families ---------------------------------------------------------------
  function runFormatterTest(id) {
    var f = null;
    state.collections.formatterTable.forEach(function (x) { if (x.id === id) f = x; });
    if (!f) return;
    if (f.state === "not-found") {
      receipt("Formatter test failed", f.name + " was not found on this machine. Install it to enable formatting. Simulated.", "blocked");
    } else if (f.state === "disabled") {
      receipt("Formatter test skipped", f.name + " is disabled for this project. Enable it to test. Simulated.", "blocked");
    } else {
      receipt("Formatter test passed", f.name + " formatted a sample file cleanly in 0.3 s. Simulated.", "ok");
    }
    emit("collections", { name: "formatterTable" });
  }

  function dryRunCommand(id) {
    var c = null;
    state.collections.commandsCatalog.forEach(function (x) { if (x.id === id) c = x; });
    if (!c) return;
    receipt("Dry run: " + c.name, "Previewed the exact shell line with parameters filled in. Dry run never sends work to an agent. Simulated.", "info");
    emit("collections", { name: "commandsCatalog" });
  }

  function resolveShortcutConflict(id, newBinding) {
    var b = null;
    state.collections.shortcutBindings.forEach(function (x) { if (x.id === id) b = x; });
    if (!b) return;
    b.binding = newBinding || "Command Alt " + b.command.split(" ")[0];
    b.state = "ok";
    delete b.conflictsWith;
    state.collections.shortcutBindings.forEach(function (x) {
      if (x.conflictsWith === id) { delete x.conflictsWith; if (x.state === "conflict") x.state = "ok"; }
    });
    receipt("Conflict resolved", b.command + " now uses " + b.binding + ". The other command keeps its binding.", "ok");
    emit("collections", { name: "shortcutBindings" });
  }

  // --- System families ---------------------------------------------------------------
  function backupNow(kind) {
    var run = null;
    state.collections.backupRuns.forEach(function (x) { if (x.id === (kind || "bk-settings")) run = x; });
    if (run) { run.last = "Just now"; run.verified = true; }
    receipt("Backup finished", (run ? run.kind : "Settings backup") + " completed and verified. Receipt recorded. Simulated.", "ok");
    emit("collections", { name: "backupRuns" });
  }

  function restorePoint(label) {
    receipt("Restore point created", (label || "Manual restore point") + " — the next risky change is reversible. Simulated.", "ok");
    emit("collections", { name: "backupRuns" });
  }

  function testRestore() {
    receipt("Test restore passed", "The newest Settings backup restored cleanly into a scratch space. Simulated.", "ok");
    emit("collections", { name: "backupRuns" });
  }

  function importPreview() {
    var fx = D.settingsExportFixture;
    receipt("Import preview ready", fx.conflicts.length + " conflicts and " + fx.legacy.length + " legacy keys found. Nothing has been applied yet. Simulated.", "info");
    emit("lifecycle", { stage: "preview", fixture: fx });
    return fx;
  }

  function importApply(resolutions) {
    state.ui.preImportSnapshot = clone(state.settings);
    var fx = D.settingsExportFixture;
    fx.legacy.forEach(function (l) {
      if (l.action === "Migrate") {
        var target = state.settings["permissions.access.mode"];
        if (target && target.source !== "managed") { /* migration demo: value stays, provenance recorded */ }
      }
    });
    var applied = 0;
    var byKey = {};
    (resolutions || []).forEach(function (r) { byKey[r.key] = r.resolution; });
    fx.conflicts.forEach(function (c) {
      var s = state.settings[c.key];
      var resolution = byKey[c.key] || c.resolution;
      if (s && resolution === "Take incoming") { s.value = c.incoming; s.source = "custom"; applied++; }
    });
    receipt("Import applied", applied + " incoming values taken, " + (fx.conflicts.length - applied) + " kept current, legacy keys migrated. Rollback available. Simulated.", "ok");
    emit("lifecycle", { stage: "applied" });
  }

  function importRollback() {
    if (!state.ui.preImportSnapshot) {
      receipt("Nothing to roll back", "No import was applied in this session yet.", "blocked");
      return;
    }
    state.settings = state.ui.preImportSnapshot;
    state.ui.preImportSnapshot = null;
    receipt("Rolled back to pre-import snapshot", "Every setting restored to its pre-import value. Simulated.", "ok");
    emit("lifecycle", { stage: "rolled-back" });
  }

  function exportSettings() {
    receipt("Settings exported", "Portable file written with source disclosure and scope markers. Simulated.", "ok");
    emit("lifecycle", { stage: "exported" });
  }

  function resetAll(stage) {
    if (stage === "preview") {
      receipt("Reset preview", "Everything returns to defaults. Custom values, nicknames, and demo collections are cleared. Cannot be undone after apply.", "info");
      emit("lifecycle", { stage: "reset-preview" });
      return;
    }
    try { window.localStorage.removeItem(storeKey); } catch (e) {}
    D.destinations.forEach(function (dest) {
      dest.subcategories.forEach(function (sub) {
        sub.settings.forEach(function (s) { state.settings[s.id] = clone(s); });
      });
    });
    state.collections = clone(seed);
    receipt("All settings reset", "Every setting is back at its default.", "ok");
    emit("lifecycle", { stage: "reset" });
  }

  function copySettingsFrom(sourceProject) {
    restorePoint("Pre-copy restore point");
    receipt("Copy Settings From…", "One-time transactional copy from " + (sourceProject || "ConceptHub") + ": previewed, restore point created, applied atomically, verified, receipted. The destination is independent now. Simulated.", "ok");
    emit("lifecycle", { stage: "copied" });
  }
  function rebuildIndex() {
    var cfg = state.collections.searchIndexCfg;
    cfg.rebuild.state = "running";
    cfg.rebuild.progress = "0%";
    emit("collections", { name: "searchIndexCfg" });
    receipt("Index rebuild started", "Phases: Scan → Chunk → Embed → Commit. Editing stays responsive. Simulated.", "info");
    var pct = 0;
    var tick = setInterval(function () {
      pct += 25;
      cfg.rebuild.progress = Math.min(pct, 100) + "%";
      if (pct >= 100) {
        clearInterval(tick);
        cfg.rebuild.state = "idle";
        cfg.rebuild.lastFull = "Just now";
        receipt("Index rebuilt", "Project search index committed. Disk use recalculated. Simulated.", "ok");
      }
      emit("collections", { name: "searchIndexCfg" });
    }, 500);
  }

  function cleanupDryRun() {
    receipt("Cleanup dry run", state.collections && D.cleanupDryRun.length + " items previewed. Worktree-safe: active worktrees are protected. Nothing was deleted. Simulated.", "info");
    emit("lifecycle", { stage: "cleanup-preview", rows: D.cleanupDryRun });
  }

  function cleanupApply(ids) {
    var safe = (ids || []).length;
    receipt("Cleanup applied", safe + " safe items removed; protected and review-required items were skipped. Simulated.", "ok");
    emit("lifecycle", { stage: "cleanup-applied" });
  }

  function teacherExplain(id) {
    var m = null;
    (D.teacherMoments || []).forEach(function (t) { if (t.id === id) m = t; });
    if (!m) return;
    receipt("Teacher: " + m.title, m.body, "info");
    emit("teacher", { id: id });
  }

  // --- Navigation & scenarios --------------------------------------------------------
  function navigate(view) {
    state.view = view;
    emit("navigate", view);
  }

  function applyScenario(name) {
    state.scenario = name;
    state.catalogs = clone(D.catalogs);
    state.providers = clone(D.providers);
    state.notices = clone(D.notices);
    state.collections.dismissedNotices = [];
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
    if (name === "update-available") {
      var o = providerById("openai");
      if (o) o.updateState = "update-available";
    }
    if (name === "rollback") {
      var cx = providerById("codex-cli");
      if (cx) cx.updateState = "rolled-back";
    }
    if (name === "import-conflict") {
      state.ui.preImportSnapshot = clone(state.settings);
    }
    if (name === "lkg-active") {
      state.catalogs.forEach(function (c) { c.lastKnownGood = true; c.state = "lkg"; });
    }
    emit("scenario", name);
  }

  function subscribe(fn) { listeners.push(fn); }

  window.PMState = {
    state: state,
    emit: emit,
    subscribe: subscribe,
    receipt: receipt,
    resetDemo: resetDemo,
    init: init,
    getSetting: getSetting,
    setSettingValue: setSettingValue,
    resetSetting: resetSetting,
    humanValue: humanValue,
    dismissNotice: dismissNotice,
    providerById: providerById,
    setPreferredAccount: setPreferredAccount,
    accountById: accountById,
    setAccountNickname: setAccountNickname,
    setAccountSticky: setAccountSticky,
    setAccountEnabled: setAccountEnabled,
    moveAccountPriority: moveAccountPriority,
    toggleFavorite: toggleFavorite,
    toggleHidden: toggleHidden,
    setAlias: setAlias,
    movePriority: movePriority,
    refreshCatalog: refreshCatalog,
    selectInstallation: selectInstallation,
    installProvider: installProvider,
    checkUpdate: checkUpdate,
    applyUpdate: applyUpdate,
    repairInstallation: repairInstallation,
    providerAction: providerAction,
    setSpellThreadDisabled: setSpellThreadDisabled,
    addToDictionary: addToDictionary,
    removeFromDictionary: removeFromDictionary,
    collectionList: collectionList,
    addDestination: addDestination,
    updateDestination: updateDestination,
    deleteDestination: deleteDestination,
    toggleDestination: toggleDestination,
    testDestination: testDestination,
    uploadSound: uploadSound,
    previewSound: previewSound,
    deleteSound: deleteSound,
    importPack: importPack,
    addPermissionRule: addPermissionRule,
    updatePermissionRule: updatePermissionRule,
    deletePermissionRule: deletePermissionRule,
    reorderPermissionRule: reorderPermissionRule,
    testPermissionTrace: testPermissionTrace,
    runFormatterTest: runFormatterTest,
    dryRunCommand: dryRunCommand,
    resolveShortcutConflict: resolveShortcutConflict,
    backupNow: backupNow,
    restorePoint: restorePoint,
    testRestore: testRestore,
    importPreview: importPreview,
    importApply: importApply,
    importRollback: importRollback,
    exportSettings: exportSettings,
    resetAll: resetAll,
    copySettingsFrom: copySettingsFrom,
    rebuildIndex: rebuildIndex,
    cleanupDryRun: cleanupDryRun,
    cleanupApply: cleanupApply,
    teacherExplain: teacherExplain,
    navigate: navigate,
    applyScenario: applyScenario
  };
})();
