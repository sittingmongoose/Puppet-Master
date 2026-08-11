/* Opus 5 — minimal observable store shared by all four concepts.
 *
 * No framework. Semantic state lives here, never in the DOM: concepts read from
 * the store and render, which is the property that makes the design portable to
 * Slint (where a property/model graph drives the view and there is no DOM to
 * measure). Nothing in this file inspects layout.
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

  window.PMStore = {
    createStore: createStore,
    cloneData: cloneData,
    indexBy: indexBy
  };
})();
