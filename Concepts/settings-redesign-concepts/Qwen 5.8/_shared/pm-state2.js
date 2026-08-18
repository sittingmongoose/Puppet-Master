/* PMState2 — headless store for concepts 05–11. Data/semantics only; no rendering.
 * Persistent demo state per concept, receipts, restore points, deterministic
 * scenarios, and a truthful ObservableWork simulator (decision register §11). */
(function () {
  "use strict";

  var D = window.PMInventoryData;
  var conceptId = null;
  var storeKey = null;
  var listeners = [];
  var persistTimer = null;
  var opSeq = 0;
  var receiptSeq = 0;

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  var state = null;

  function freshState() {
    var settings = {};
    D.settings.forEach(function (s) {
      settings[s.id] = { id: s.id, value: (s.default !== undefined ? s.default : (s.type === "toggle" ? false : "")), source: "default" };
    });
    return {
      v: 2,
      concept: conceptId,
      settings: settings,
      scenario: "default",
      receipts: [],
      restorePoints: [],
      recent: [],
      dismissed: [],
      copiedFrom: null,
      ops: {}
    };
  }

  function emit(kind, payload) {
    schedulePersist();
    listeners.forEach(function (fn) {
      try { fn(kind, payload); } catch (e) { if (window.console) console.error("PMState2 listener error:", e); }
    });
  }
  function subscribe(fn) { listeners.push(fn); return function () { var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; }

  function schedulePersist() {
    if (persistTimer) return;
    persistTimer = setTimeout(function () {
      persistTimer = null;
      try { window.localStorage.setItem(storeKey, JSON.stringify(serialize())); } catch (e) {}
    }, 250);
  }
  function serialize() {
    var s = clone(state);
    s.ops = {};
    return s;
  }
  function hydrate() {
    var raw = null;
    try { raw = window.localStorage.getItem(storeKey); } catch (e) { raw = null; }
    if (!raw) return false;
    try {
      var s = JSON.parse(raw);
      if (s && s.v === 2) {
        var fresh = freshState();
        // merge so new inventory rows always exist
        Object.keys(fresh.settings).forEach(function (id) { if (s.settings && s.settings[id]) fresh.settings[id] = s.settings[id]; });
        s.settings = fresh.settings;
        s.ops = {};
        state = s;
        return true;
      }
    } catch (e) {}
    return false;
  }

  function init(id) {
    conceptId = id;
    storeKey = "pm.settings-demo2." + id;
    if (!hydrate()) state = freshState();
    applyScenario(state.scenario || "default", true);
  }

  function resetDemo() {
    try { window.localStorage.removeItem(storeKey); } catch (e) {}
    window.location.reload();
  }

  // --- settings ---------------------------------------------------------------
  function getSetting(id) { return state.settings[id] || null; }
  function inventory(id) { return D.byId(id); }
  function setSetting(id, value) {
    var st = state.settings[id];
    var inv = D.byId(id);
    if (!st || !inv) return null;
    if (st.source === "managed" || st.source === "unavailable") {
      receipt("Change blocked", humanLabel(inv) + " is " + st.source + ". The value is controlled outside this Project.", "warn");
      return null;
    }
    st.value = value;
    st.source = "custom";
    touchRecent({ kind: "setting", id: id, label: humanLabel(inv) });
    receipt("Setting changed", humanLabel(inv) + " → " + humanValue(st, inv) + " (this Project only).", "ok");
    emit("setting", { id: id });
    return st;
  }
  function resetSetting(id) {
    var st = state.settings[id];
    var inv = D.byId(id);
    if (!st || !inv) return null;
    st.value = (inv.default !== undefined ? inv.default : (inv.type === "toggle" ? false : ""));
    st.source = "default";
    receipt("Setting reset", humanLabel(inv) + " returned to its default for this Project.", "info");
    emit("setting", { id: id });
    return st;
  }
  function humanValue(st, inv) {
    if (!inv) return String(st && st.value);
    if (inv.type === "toggle") return st.value ? "On" : "Off";
    return String(st.value);
  }
  function humanLabel(inv) { return inv ? inv.label : ""; }

  function touchRecent(item) {
    item.at = Date.now();
    state.recent = [item].concat(state.recent.filter(function (r) { return !(r.kind === item.kind && r.id === item.id); })).slice(0, 8);
  }

  // --- receipts ----------------------------------------------------------------
  function receipt(title, detail, kind) {
    receiptSeq += 1;
    var r = { id: "rc2-" + receiptSeq, at: new Date().toISOString(), title: title, detail: detail || "", kind: kind || "sim" };
    state.receipts.push(r);
    if (state.receipts.length > 60) state.receipts.shift();
    emit("receipt", r);
    return r;
  }

  // --- restore points / rollback -------------------------------------------------
  function createRestorePoint(label) {
    var rp = { id: "rp2-" + (state.restorePoints.length + 1) + "-" + Date.now(), at: new Date().toISOString(), label: label, snapshot: clone(state.settings) };
    state.restorePoints.push(rp);
    if (state.restorePoints.length > 6) state.restorePoints.shift();
    return rp;
  }
  function rollbackTo(rpId) {
    var rp = null;
    state.restorePoints.forEach(function (r) { if (r.id === rpId) rp = r; });
    if (!rp) return false;
    state.settings = clone(rp.snapshot);
    receipt("Rollback complete", "Restored " + rp.label + ". This Project's settings returned to their prior values.", "ok");
    emit("rollback", { id: rpId });
    return true;
  }

  // --- ObservableWork simulator (truthful phases; determinate only with a real denominator)
  function beginOp(o) {
    opSeq += 1;
    var op = {
      operation_id: "op2-" + opSeq,
      owner_domain: o.owner || "settings",
      title: o.title,
      state: "starting",
      human_phase: o.phase || "Starting",
      progress_kind: o.determinate ? "determinate" : "unknown",
      completed: 0,
      total: o.determinate ? (o.total || 0) : null,
      wait_reason: o.wait || null,
      can_cancel: o.canCancel !== false,
      can_retry: !!o.retry,
      progress_source: o.determinate ? "measured" : "derived",
      started: Date.now()
    };
    state.ops[op.operation_id] = op;
    emit("op", op);
    return op;
  }
  function advanceOp(op, patch) {
    Object.keys(patch || {}).forEach(function (k) { op[k] = patch[k]; });
    emit("op", op);
  }
  function finishOp(op, terminalState, note) {
    op.state = terminalState || "completed";
    if (note) op.human_phase = note;
    emit("op", op);
    return op;
  }

  // --- deterministic scenarios -----------------------------------------------------
  var SCENARIOS = ["default", "attention", "calm", "refreshing", "exhausted", "update-available", "rollback",
    "import-conflict", "lkg-active", "low-resource", "poor-network", "offline", "managed", "restart-required",
    "reconnect-required", "changed-elsewhere", "validation-failure", "unavailable"];

  function applyScenario(name, silent) {
    if (SCENARIOS.indexOf(name) < 0) name = "default";
    state.scenario = name;
    // reset transient sources
    Object.keys(state.settings).forEach(function (id) {
      var st = state.settings[id];
      if (st.source === "managed" || st.source === "unavailable" || st.source === "restart" || st.source === "reconnect" || st.source === "changed-elsewhere") {
        st.source = st.source === "custom" ? "custom" : "default";
      }
    });
    function mark(id, source) { var st = state.settings[id]; if (st) st.source = source; }
    if (name === "managed") { mark("general.visual.theme", "managed"); mark("safety.rules.permission-preset", "managed"); }
    if (name === "unavailable") { mark("web.search.provider", "unavailable"); }
    if (name === "restart-required") { mark("general.startup.behavior", "restart"); }
    if (name === "reconnect-required") { mark("ai.accounts.provider-connections", "reconnect"); }
    if (name === "changed-elsewhere") { mark("appearance.theme.family", "changed-elsewhere"); }
    if (!silent) emit("scenario", name);
    else schedulePersist();
    return name;
  }

  function notices() {
    var n = [];
    var sc = state.scenario;
    if (sc === "calm") return n;
    if (sc === "default" || sc === "attention") {
      n.push({ id: "n-auth", kind: "attention", title: "Anthropic CLI needs sign-in", reason: "The selected account is found but not authenticated.", action: "Continue setup", dest: { kind: "manager", manager: "providers", object: "anthropic" } });
      n.push({ id: "n-rate", kind: "attention", title: "OpenAI rate limit near cap", reason: "Tokens used reached 87% of the monthly limit.", action: "View limits", dest: { kind: "manager", manager: "providers", object: "openai", section: "limits" } });
    }
    if (sc === "attention") {
      n.push({ id: "n-backup", kind: "attention", title: "Settings backup is 14 days old", reason: "The last verified backup predates recent changes.", action: "Back up now", dest: { kind: "manager", manager: "backup" } });
    }
    if (sc === "update-available") n.push({ id: "n-upd", kind: "setup", title: "Provider update available", reason: "OpenAI CLI has a newer compatible version. Install policy: ask first.", action: "Review update", dest: { kind: "manager", manager: "providers", object: "openai", section: "install" } });
    if (sc === "rollback") n.push({ id: "n-rb", kind: "ok", title: "Update rolled back", reason: "Verification failed after updating; the previous generation was restored.", action: "View receipt", dest: { kind: "manager", manager: "providers", object: "openai", section: "install" } });
    if (sc === "offline") n.push({ id: "n-off", kind: "warn", title: "Working offline", reason: "Catalogs and usage show last-known values; changes still apply locally.", action: null, dest: null });
    if (sc === "import-conflict") n.push({ id: "n-imp", kind: "warn", title: "Import needs review", reason: "3 incoming values conflict with this Project's current settings.", action: "Review conflicts", dest: { kind: "route", hash: "#/lifecycle" } });
    return n.slice(0, 4);
  }

  window.PMState2 = {
    init: init,
    get state() { return state; },
    subscribe: subscribe,
    emit: emit,
    getSetting: getSetting,
    inventory: inventory,
    setSetting: setSetting,
    resetSetting: resetSetting,
    humanValue: humanValue,
    humanLabel: humanLabel,
    receipt: receipt,
    createRestorePoint: createRestorePoint,
    rollbackTo: rollbackTo,
    beginOp: beginOp,
    advanceOp: advanceOp,
    finishOp: finishOp,
    applyScenario: applyScenario,
    scenarios: SCENARIOS,
    notices: notices,
    resetDemo: resetDemo,
    touchRecent: touchRecent
  };
})();
