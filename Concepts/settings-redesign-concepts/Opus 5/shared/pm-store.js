/* Opus 5 — minimal observable store shared by all four concepts.
 *
 * No framework. Semantic state lives here, never in the DOM: concepts read from
 * the store and render, which is the property that makes the design portable to
 * Slint (where a property/model graph drives the view and there is no DOM to
 * measure). Nothing in this file inspects layout.
 *
 * Persistence is deliberately narrow. Only the keys a reviewer expects to
 * survive a reload are written (values they changed, manager edits, dismissed
 * notices, the demo state, the route and the shell presentation choices); live
 * operation state — in-flight refreshes, open popovers, receipts — is not,
 * because restoring a half-finished operation would be a lie about what the app
 * did while it was closed.
 */
(function () {
  "use strict";

  function createStore(initial) {
    var state = initial;
    var listeners = [];
    var depth = 0;

    function get() { return state; }

    function set(patch) {
      var next = typeof patch === "function" ? patch(state) : patch;
      if (next === state || next == null) return state;
      state = Object.assign({}, state, next);
      emit();
      return state;
    }

    function emit() {
      depth += 1;
      var mine = depth;
      for (var i = 0; i < listeners.length; i++) {
        // A listener that dispatches again wins; older passes bail out.
        if (depth !== mine) return;
        try { listeners[i](state); } catch (err) { reportListenerError(err); }
      }
    }

    function subscribe(fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      };
    }

    /* select(fn, cb) only fires cb when the projection actually changes. */
    function select(projector, cb) {
      var last = projector(state);
      return subscribe(function (s) {
        var now = projector(s);
        if (now !== last) { last = now; cb(now, s); }
      });
    }

    return { get: get, set: set, subscribe: subscribe, select: select };
  }

  function reportListenerError(err) {
    if (window.console && window.console.error) window.console.error("[Opus 5 concept] listener failed", err);
  }

  /* ---------------------------------------------------------------- helpers */

  /* Deep clone of the frozen demo dataset so a concept can mutate its own copy. */
  function cloneData(value) {
    if (Array.isArray(value)) return value.map(cloneData);
    if (value && typeof value === "object") {
      var out = {};
      for (var k in value) if (Object.prototype.hasOwnProperty.call(value, k)) out[k] = cloneData(value[k]);
      return out;
    }
    return value;
  }

  function indexBy(list, key) {
    var out = Object.create(null);
    (list || []).forEach(function (item) { out[item[key]] = item; });
    return out;
  }

  /* ------------------------------------------------------------ persistence */

  var PERSIST_VERSION = 2;
  var THROTTLE_MS = 250;

  function keyFor(namespace) {
    return "pm-opus5:" + namespace + ":v" + PERSIST_VERSION;
  }

  /* Every localStorage call is guarded. Private mode, a full quota, a
   * file:// origin with storage disabled and an embedded third-party frame all
   * throw here, and none of them are a reason for Settings to stop working —
   * the concept simply becomes in-memory for that session. */
  function readRaw(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function writeRaw(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  function removeRaw(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* nothing to do */ }
  }

  function restore(namespace, keys) {
    var key = keyFor(namespace);
    var raw = readRaw(key);
    if (!raw) return {};
    var parsed;
    try { parsed = JSON.parse(raw); } catch (e) { removeRaw(key); return {}; }
    if (!parsed || parsed.v !== PERSIST_VERSION || !parsed.data || typeof parsed.data !== "object") {
      removeRaw(key);
      return {};
    }
    if (!keys || !keys.length) return parsed.data;
    var out = {};
    keys.forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(parsed.data, k)) out[k] = parsed.data[k];
    });
    return out;
  }

  /* persist() subscribes to the store and mirrors the named keys. Throttled:
   * dragging a slider or typing in a search field must not write on every
   * keystroke, and the trailing write guarantees the last value still lands. */
  function persist(namespace, store, keys) {
    var key = keyFor(namespace);
    var timer = 0;
    var pending = false;
    var detached = false;

    function snapshot() {
      var s = store.get();
      var data = {};
      keys.forEach(function (k) {
        if (s[k] !== undefined) data[k] = s[k];
      });
      return data;
    }

    function flush() {
      timer = 0;
      pending = false;
      if (detached) return;
      var payload;
      try {
        payload = JSON.stringify({ v: PERSIST_VERSION, at: new Date().toISOString(), data: snapshot() });
      } catch (e) {
        return;   // a value that cannot be serialised is simply not persisted
      }
      writeRaw(key, payload);
    }

    var unsubscribe = store.subscribe(function () {
      if (detached || pending) return;
      pending = true;
      timer = window.setTimeout(flush, THROTTLE_MS);
    });

    /* A reload during the throttle window would otherwise lose the last edit. */
    function onHide() { if (pending) { window.clearTimeout(timer); flush(); } }
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);

    return function detach() {
      detached = true;
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
      unsubscribe();
    };
  }

  function clearPersisted(namespace) {
    removeRaw(keyFor(namespace));
  }

  window.PMStore = {
    createStore: createStore,
    cloneData: cloneData,
    indexBy: indexBy,
    persist: persist,
    restore: restore,
    clearPersisted: clearPersisted,
    PERSIST_VERSION: PERSIST_VERSION,
    PERSIST_KEYS: ["values", "managerEdits", "dismissedNotices", "demoState", "route",
      "theme", "widthChoice", "railOpen", "panelOpen", "reducedMotion"]
  };
})();
