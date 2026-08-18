/* ============================================================================
   pm-v2-store.js — headless project store for kimi-k3 concepts 05–11
   ----------------------------------------------------------------------------
   - Current-Project identity (context only, never a scope selector).
   - Per-project override persistence (localStorage, namespaced per concept so
     concepts stay independent; the mechanism is shared, the data is not).
   - Deterministic demo scenario fixtures (loading / empty / error / offline /
     managed / unavailable / restart / reconnect / changed-elsewhere /
     import-conflict / rollback / provider-cli states).
   - Restore points + receipts (used by Copy, Import, Reset, Cleanup).
   - ObservableWork simulator: truthful operation states; determinate progress
     only with a real denominator; every operation reaches a truthful
     terminal / degraded / retryable / cancelable / recovery-required state.
   No DOM. Concepts subscribe and render their own projections.
   ========================================================================== */
(function () {
  "use strict";

  var PROJECTS = [
    { id: "proj-puppet-master", name: "Puppet Master", path: "P:/", current: true,  updated: "2026-08-18 09:41", settings: 812 },
    { id: "proj-atlas-agency",  name: "Atlas Agency",  path: "C:/work/atlas",       current: false, updated: "2026-08-15 17:02", settings: 764 },
    { id: "proj-nova-platform", name: "Nova Platform", path: "C:/work/nova",        current: false, updated: "2026-08-12 11:26", settings: 701 },
    { id: "proj-starlight",     name: "Starlight",     path: "C:/work/starlight",   current: false, updated: "2026-07-30 08:14", settings: 655 },
    { id: "proj-zephyr",        name: "Zephyr",        path: "D:/oss/zephyr",       current: false, updated: "2026-07-21 19:55", settings: 588 }
  ];

  function nowIso() { return new Date().toISOString(); }

  function Store(conceptId) {
    this.conceptId = conceptId;
    this.ns = "pmv2." + conceptId + ".";
    this.listeners = [];
    this.operations = {};
    this.opSeq = 0;
    this.scenario = null; // active deterministic fixture name
    this.memory = {};     // in-memory fallback when localStorage is blocked
  }

  /* ---------- persistence (localStorage with in-memory fallback) --------- */
  Store.prototype._get = function (k) {
    try { var v = window.localStorage.getItem(this.ns + k); return v == null ? null : JSON.parse(v); }
    catch (e) { return this.memory[k] == null ? null : this.memory[k]; }
  };
  Store.prototype._set = function (k, v) {
    try { window.localStorage.setItem(this.ns + k, JSON.stringify(v)); }
    catch (e) { this.memory[k] = v; }
  };
  Store.prototype._del = function (k) {
    try { window.localStorage.removeItem(this.ns + k); } catch (e) { /* noop */ }
    delete this.memory[k];
  };

  Store.prototype.currentProject = function () { return PROJECTS[0]; };
  Store.prototype.otherProjects = function () { return PROJECTS.slice(1); };

  /* ---------- setting overrides (current Project only) -------------------- */
  Store.prototype.overrides = function () { return this._get("overrides") || {}; };
  Store.prototype.value = function (settingId, baseValue) {
    var o = this.overrides();
    return Object.prototype.hasOwnProperty.call(o, settingId) ? o[settingId].value : baseValue;
  };
  Store.prototype.overrideInfo = function (settingId) { return this.overrides()[settingId] || null; };
  Store.prototype.setValue = function (settingId, value, meta) {
    var o = this.overrides();
    o[settingId] = { value: value, at: nowIso(), by: "you", meta: meta || null };
    this._set("overrides", o);
    this._emit({ type: "setting", id: settingId, value: value });
  };
  Store.prototype.resetValue = function (settingId) {
    var o = this.overrides();
    if (Object.prototype.hasOwnProperty.call(o, settingId)) {
      delete o[settingId];
      this._set("overrides", o);
      this._emit({ type: "setting-reset", id: settingId });
    }
  };

  /* ---------- generic per-concept documents (roster edits etc.) ----------- */
  Store.prototype.doc = function (key, fallback) {
    var v = this._get("doc." + key);
    return v == null ? fallback : v;
  };
  Store.prototype.setDoc = function (key, value) {
    this._set("doc." + key, value);
    this._emit({ type: "doc", key: key });
  };

  /* ---------- restore points + receipts ----------------------------------- */
  Store.prototype.restorePoints = function () { return this._get("restorePoints") || []; };
  Store.prototype.createRestorePoint = function (label, snapshot) {
    var pts = this.restorePoints();
    var rp = { id: "rp-" + (pts.length + 1) + "-" + Date.now().toString(36), label: label, at: nowIso(), snapshot: snapshot };
    pts.push(rp);
    this._set("restorePoints", pts);
    return rp;
  };
  Store.prototype.receipts = function () { return this._get("receipts") || []; };
  Store.prototype.addReceipt = function (receipt) {
    var r = this.receipts();
    receipt.at = receipt.at || nowIso();
    r.push(receipt);
    this._set("receipts", r);
    this._emit({ type: "receipt", receipt: receipt });
    return receipt;
  };

  /* ---------- search/back session state ------------------------------------ */
  Store.prototype.searchState = function () { return this._get("searchState") || { query: "", resultId: null }; };
  Store.prototype.saveSearchState = function (query, resultId) {
    this._set("searchState", { query: query || "", resultId: resultId || null });
  };

  /* ---------- deterministic demo scenarios --------------------------------- */
  var SCENARIOS = [
    "loading-cached", "empty", "no-results", "typo-fuzzy", "validation-error",
    "offline", "managed", "unavailable", "restart-required", "reconnect-required",
    "changed-elsewhere", "import-conflict", "rollback-complete",
    "provider-ready-usage-unavailable", "multi-installation-shadowed",
    "unknown-install-owner", "provider-update-available", "verification-failed-rollback-ok"
  ];
  Store.prototype.scenarios = function () { return SCENARIOS.slice(); };
  Store.prototype.setScenario = function (name) {
    this.scenario = SCENARIOS.indexOf(name) >= 0 ? name : null;
    this._emit({ type: "scenario", name: this.scenario });
  };
  Store.prototype.activeScenario = function () { return this.scenario; };
  /** Truthful projection of a scenario for a surface: {state, message, cached} */
  Store.prototype.projection = function (surfaceId) {
    var s = this.scenario;
    if (!s) return { state: "ready", message: null, cached: false };
    switch (s) {
      case "loading-cached": return { state: "loading", message: "Refreshing… showing last known values.", cached: true };
      case "empty": return { state: "empty", message: "Nothing here yet.", cached: false };
      case "offline": return { state: "offline", message: "You are offline. Changes will apply when the connection returns.", cached: true };
      case "validation-error": return { state: "error", message: "That value is not valid. Check the format and try again.", cached: false };
      case "managed": return { state: "managed", message: "Managed by organization policy. You can view but not change this.", cached: false };
      case "unavailable": return { state: "unavailable", message: "Unavailable for the current configuration.", cached: false };
      case "restart-required": return { state: "restart-required", message: "Restart Puppet Master to apply this change.", cached: false };
      case "reconnect-required": return { state: "reconnect-required", message: "Reconnect the provider to apply this change.", cached: false };
      case "changed-elsewhere": return { state: "changed-elsewhere", message: "This setting changed in another window. Showing the latest value.", cached: true };
      default: return { state: s, message: null, cached: false };
    }
  };

  /* ---------- ObservableWork simulator ------------------------------------- */
  /*
    begin({kind, title, phases:[{name, weight?}], determinate?, total?}) -> op
    Ops advance only via advance()/fail()/cancel(); every op ends in a truthful
    terminal: done | degraded | failed | canceled | recovery-required.
    Determinate progress exists only when total is a real denominator.
  */
  Store.prototype.begin = function (spec) {
    var id = "op-" + (++this.opSeq) + "-" + Date.now().toString(36);
    var op = {
      id: id, kind: spec.kind || "operation", title: spec.title || "Operation",
      phases: (spec.phases || [{ name: "Working" }]).map(function (p, i) {
        return { name: p.name, weight: p.weight || 1, status: i === 0 ? "active" : "pending" };
      }),
      phaseIndex: 0,
      determinate: !!spec.determinate && typeof spec.total === "number" && spec.total > 0,
      total: spec.total || 0, done: 0,
      state: "running", reason: null, cancelable: spec.cancelable !== false,
      startedAt: nowIso(), endedAt: null, error: null
    };
    this.operations[id] = op;
    this._emit({ type: "op", op: op });
    return op;
  };
  Store.prototype.advance = function (id, units) {
    var op = this.operations[id];
    if (!op || op.state !== "running") return op;
    if (op.determinate) op.done = Math.min(op.total, op.done + (units || 1));
    var cur = op.phases[op.phaseIndex];
    if (cur && (!op.determinate || op.done >= op.total)) {
      // phase completion is explicit for indeterminate work
    }
    this._emit({ type: "op", op: op });
    return op;
  };
  Store.prototype.completePhase = function (id) {
    var op = this.operations[id];
    if (!op || op.state !== "running") return op;
    op.phases[op.phaseIndex].status = "done";
    if (op.phaseIndex < op.phases.length - 1) {
      op.phaseIndex += 1;
      op.phases[op.phaseIndex].status = "active";
    }
    this._emit({ type: "op", op: op });
    return op;
  };
  Store.prototype.finish = function (id, terminal, reason) {
    var op = this.operations[id];
    if (!op) return null;
    var ok = { done: 1, degraded: 1, failed: 1, canceled: 1, "recovery-required": 1 };
    op.state = ok[terminal] ? terminal : "done";
    op.reason = reason || null;
    op.endedAt = nowIso();
    if (op.state === "failed" && !op.reason) op.reason = "The operation failed.";
    op.phases.forEach(function (p) { if (p.status === "active") p.status = op.state === "done" ? "done" : "stopped"; });
    this._emit({ type: "op", op: op });
    return op;
  };
  Store.prototype.operation = function (id) { return this.operations[id] || null; };

  /* ---------- subscription -------------------------------------------------- */
  Store.prototype.subscribe = function (fn) {
    this.listeners.push(fn);
    var self = this;
    return function () {
      var i = self.listeners.indexOf(fn);
      if (i >= 0) self.listeners.splice(i, 1);
    };
  };
  Store.prototype._emit = function (evt) {
    this.listeners.slice().forEach(function (fn) {
      try { fn(evt); } catch (e) { /* listener faults must not break the store */ }
    });
  };

  var stores = {};
  window.PM_V2_STORE = {
    PROJECTS: PROJECTS,
    for: function (conceptId) {
      if (!stores[conceptId]) stores[conceptId] = new Store(conceptId);
      return stores[conceptId];
    }
  };
})();
