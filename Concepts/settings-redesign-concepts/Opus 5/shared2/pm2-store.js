/* Opus 5 — per-concept state and persistence for concepts 05-11.
 *
 * Seven concepts run from the same folder and, in the Hub gallery, sometimes from
 * the same browser profile. Each therefore gets its own namespace: what a reader
 * changed in the Compendium must not silently appear in the Command workspace, and
 * neither may disturb the keys concepts 01-04 already own under `pm-*`.
 *
 * Semantic state lives here, never in the DOM. That is the property that makes the
 * design portable to Slint, where a property graph drives the view and there is no
 * DOM to read state back out of. Nothing in this file measures layout.
 *
 * Persistence is deliberately narrow: values a reader changed, manager edits,
 * dismissed notices, copy receipts, the active state fixture and the last route.
 * In-flight operations are NOT persisted — restoring a half-finished install would
 * be a lie about what the app did while it was closed.
 */
(function () {
  "use strict";

  var VERSION = 2;
  var WRITE_DELAY = 220;

  function clone(value) {
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(clone);
    var out = {};
    for (var k in value) if (Object.prototype.hasOwnProperty.call(value, k)) out[k] = clone(value[k]);
    return out;
  }

  /* Only these survive a reload. Everything else is session state by design. */
  var PERSISTED = ["values", "managerEdits", "dismissed", "receipts", "stateFixture",
    "route", "exposure", "recent", "copyHistory"];

  function emptyState() {
    return {
      /* settingId -> value, for rows this Project has changed since load */
      values: {},
      /* "<managerId>:<itemId>:<key>" -> value */
      managerEdits: {},
      /* noticeId -> true */
      dismissed: {},
      /* copy receipts, newest first */
      receipts: [],
      copyHistory: [],
      /* the deterministic demo fixture currently selected */
      stateFixture: null,
      /* last route, so a reload lands where the reader was */
      route: null,
      /* how far down the exposure ladder the reader has opened things */
      exposure: "standard",
      /* recently visited destinations, newest first, bounded */
      recent: [],

      /* --- session only, never written --- */
      operations: {},
      hydrated: {},
      search: { query: "", resultId: null, open: false },
      notice: null
    };
  }

  function createStore(conceptId) {
    var key = "pm2:" + conceptId + ":v" + VERSION;
    var state = emptyState();
    var listeners = [];
    var depth = 0;
    var timer = 0;

    function reportListenerError(err) {
      if (window.console && window.console.error) window.console.error("PM2Store listener", err);
    }

    function get() { return state; }

    function set(patch) {
      var next = typeof patch === "function" ? patch(state) : patch;
      if (next === state || next == null) return state;
      var merged = {};
      for (var a in state) if (Object.prototype.hasOwnProperty.call(state, a)) merged[a] = state[a];
      for (var b in next) if (Object.prototype.hasOwnProperty.call(next, b)) merged[b] = next[b];
      state = merged;
      schedule();
      emit();
      return state;
    }

    /* A listener that dispatches again wins; older passes bail out rather than
     * finishing against state that is already stale. */
    function emit() {
      depth += 1;
      var mine = depth;
      for (var i = 0; i < listeners.length; i++) {
        if (depth !== mine) return;
        try { listeners[i](state); } catch (err) { reportListenerError(err); }
      }
    }

    function subscribe(fn) {
      if (typeof fn !== "function") return function () {};
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      };
    }

    /* ------------------------------------------------------------ persistence */

    function snapshot() {
      var out = { v: VERSION };
      for (var i = 0; i < PERSISTED.length; i++) {
        var k = PERSISTED[i];
        out[k] = clone(state[k]);
      }
      return out;
    }

    function write() {
      timer = 0;
      try {
        window.localStorage.setItem(key, JSON.stringify(snapshot()));
      } catch (err) {
        /* A full or blocked storage is not a reason to break the page. The reader
         * keeps their session; it simply will not survive a reload. */
      }
    }

    function schedule() {
      if (timer) return;
      timer = window.setTimeout(write, WRITE_DELAY);
    }

    function load() {
      var raw = null;
      try { raw = window.localStorage.getItem(key); } catch (err) { return; }
      if (!raw) return;
      var parsed = null;
      try { parsed = JSON.parse(raw); } catch (err) { return; }
      if (!parsed || parsed.v !== VERSION) return;
      for (var i = 0; i < PERSISTED.length; i++) {
        var k = PERSISTED[i];
        if (parsed[k] !== undefined && parsed[k] !== null) state[k] = parsed[k];
      }
    }

    function reset() {
      state = emptyState();
      try { window.localStorage.removeItem(key); } catch (err) {}
      emit();
      return state;
    }

    /* ------------------------------------------------------------- shortcuts */

    /* The reader's value for a row, falling back to the inventory's own state.
     * One function so seven concepts cannot disagree about what a row shows. */
    function valueOf(settingId) {
      if (Object.prototype.hasOwnProperty.call(state.values, settingId)) return state.values[settingId];
      var rec = window.PM2Model && window.PM2Model.setting(settingId);
      return rec ? rec.state.value : undefined;
    }

    function changed(settingId) {
      var rec = window.PM2Model && window.PM2Model.setting(settingId);
      if (!rec) return false;
      if (Object.prototype.hasOwnProperty.call(state.values, settingId)) {
        return !same(state.values[settingId], rec.state.defaultValue);
      }
      return rec.state.source === "custom" && rec.state.isDefault === false;
    }

    function same(a, b) {
      if (a === b) return true;
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++) if (!same(a[i], b[i])) return false;
        return true;
      }
      return false;
    }

    function setValue(settingId, value) {
      var values = clone(state.values);
      values[settingId] = value;
      set({ values: values });
    }

    function clearValue(settingId) {
      if (!Object.prototype.hasOwnProperty.call(state.values, settingId)) return;
      var values = clone(state.values);
      delete values[settingId];
      set({ values: values });
    }

    function editKey(managerId, itemId, field) {
      return managerId + ":" + itemId + ":" + field;
    }

    function edit(managerId, itemId, field, fallback) {
      var k = editKey(managerId, itemId, field);
      return Object.prototype.hasOwnProperty.call(state.managerEdits, k) ? state.managerEdits[k] : fallback;
    }

    function setEdit(managerId, itemId, field, value) {
      var edits = clone(state.managerEdits);
      edits[editKey(managerId, itemId, field)] = value;
      set({ managerEdits: edits });
    }

    /* Bounded: a visit list that grows without limit is a memory leak with a nice
     * name, and nobody reads the two-hundredth entry. */
    function remember(entry) {
      if (!entry || !entry.id) return;
      var next = [entry].concat(state.recent.filter(function (r) { return r.id !== entry.id; }));
      if (next.length > 12) next = next.slice(0, 12);
      set({ recent: next });
    }

    function dismiss(noticeId) {
      var d = clone(state.dismissed);
      d[noticeId] = true;
      set({ dismissed: d });
    }

    function changedCount() {
      var seen = {};
      var n = 0;
      var settings = (window.PM2Model && window.PM2Model.settings) || [];
      for (var i = 0; i < settings.length; i++) {
        var rec = settings[i];
        if (changed(rec.id)) { seen[rec.id] = true; n += 1; }
      }
      return n;
    }

    load();

    var api = {
      conceptId: conceptId,
      get: get,
      set: set,
      subscribe: subscribe,
      reset: reset,
      flush: function () { if (timer) { window.clearTimeout(timer); write(); } },

      valueOf: valueOf,
      setValue: setValue,
      clearValue: clearValue,
      changed: changed,
      changedCount: changedCount,

      edit: edit,
      setEdit: setEdit,

      remember: remember,
      dismiss: dismiss,
      isDismissed: function (id) { return !!state.dismissed[id]; }
    };

    /* Write once more on the way out so a change made in the last quarter second
     * is not lost to the debounce. */
    function onHide() { api.flush(); }
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);

    return api;
  }

  window.PM2Store = { create: createStore, VERSION: VERSION };
})();
