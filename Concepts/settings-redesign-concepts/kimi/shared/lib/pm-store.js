/* ============================================================================
   pm-store.js — tiny pub/sub state store (IIFE, no dependencies)
   ----------------------------------------------------------------------------
     PMStore.seed(obj)          register the demo seed (call before init)
     PMStore.init(namespace)    load/persist state under
                                sessionStorage "pm.settings-demo.<namespace>"
     PMStore.get(path, fb)      dot-path read; get() returns the root object
     PMStore.set(path, value)   write, persist, emit "change:<path>" + "change"
     PMStore.patch(obj)         shallow-merge at root, persist, emit "change"
     PMStore.resetDemo()        drop the key, restore the seed, emit "reset"
     PMStore.on(event, cb)      subscribe   PMStore.off(event, cb) unsubscribe
     PMStore.receipt(text, kind) honest simulated-action toast (role=status,
                                ~4s auto-dismiss; kind: info|ok|warn|danger).
                                This is the ONLY way fake actions report —
                                nothing pretends a real operation happened.

   receipt() requires pm-components.css (.pm-toast / .pm-toast-stack).
   Persistence failures (private mode, quota) degrade to in-memory state.
   ========================================================================== */
(function () {
  "use strict";

  var PREFIX = "pm.settings-demo.";
  var seedObj = {};
  var state = {};
  var storeKey = null;
  var listeners = Object.create(null);

  function clone(obj) {
    return obj == null ? obj : JSON.parse(JSON.stringify(obj));
  }

  function storageGet(key) {
    try {
      var raw = window.sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* private mode / quota: in-memory state still works */
    }
  }

  function storageRemove(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (err) {
      /* ignore */
    }
  }

  function emit(event, payload) {
    var list = listeners[event];
    if (!list) return;
    list.slice().forEach(function (cb) {
      try {
        cb(payload);
      } catch (err) {
        window.setTimeout(function () { throw err; }, 0);
      }
    });
  }

  function persist() {
    if (storeKey) storageSet(storeKey, state);
  }

  /* dot-path helpers; path segments that would pollute prototypes are
     refused so set("a.__proto__.x") is a no-op rather than a footgun */
  function parts(path) {
    var segs = String(path).split(".");
    for (var i = 0; i < segs.length; i++) {
      if (segs[i] === "__proto__" || segs[i] === "constructor" || segs[i] === "prototype") return null;
    }
    return segs;
  }

  var PMStore = {
    seed: function (obj) {
      seedObj = clone(obj) || {};
      return PMStore;
    },

    init: function (namespace) {
      storeKey = PREFIX + String(namespace);
      var restored = storageGet(storeKey);
      state = restored && typeof restored === "object" ? restored : clone(seedObj) || {};
      return PMStore;
    },

    get: function (path, fallback) {
      if (path == null || path === "") return state;
      var segs = parts(path);
      if (!segs) return fallback;
      var node = state;
      for (var i = 0; i < segs.length; i++) {
        if (node == null || typeof node !== "object") return fallback;
        node = node[segs[i]];
      }
      return node === undefined ? fallback : node;
    },

    set: function (path, value) {
      var segs = parts(path);
      if (!segs) return PMStore;
      var node = state;
      for (var i = 0; i < segs.length - 1; i++) {
        if (node[segs[i]] == null || typeof node[segs[i]] !== "object") node[segs[i]] = {};
        node = node[segs[i]];
      }
      node[segs[segs.length - 1]] = value;
      persist();
      emit("change:" + segs.join("."), value);
      emit("change", { path: segs.join("."), value: value });
      return PMStore;
    },

    patch: function (obj) {
      if (obj && typeof obj === "object") {
        Object.keys(obj).forEach(function (key) {
          if (key === "__proto__" || key === "constructor" || key === "prototype") return;
          state[key] = obj[key];
        });
        persist();
        emit("change", { path: null, value: obj });
      }
      return PMStore;
    },

    resetDemo: function () {
      if (storeKey) storageRemove(storeKey);
      state = clone(seedObj) || {};
      emit("reset", {});
      emit("change", { path: null, value: state });
      return PMStore;
    },

    on: function (event, cb) {
      (listeners[event] || (listeners[event] = [])).push(cb);
      return PMStore;
    },

    off: function (event, cb) {
      var list = listeners[event];
      if (list) {
        var i = list.indexOf(cb);
        if (i !== -1) list.splice(i, 1);
      }
      return PMStore;
    },

    /* Honest simulated-action receipt: a toast that says what was simulated.
       Never claims a real sign-in, purchase, or write happened. */
    receipt: function (text, kind) {
      kind = /^(info|ok|warn|danger)$/.test(kind) ? kind : "info";

      function show() {
        var stack = document.querySelector(".pm-toast-stack");
        if (!stack) {
          stack = document.createElement("div");
          stack.className = "pm-toast-stack";
          document.body.appendChild(stack);
        }
        var toast = document.createElement("div");
        toast.className = "pm-toast";
        toast.setAttribute("data-kind", kind);
        toast.setAttribute("role", "status");

        var icon = document.createElement("span");
        icon.className = "pm-toast-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML =
          '<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor"' +
          ' stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
          (kind === "ok"
            ? '<circle cx="8" cy="8" r="6.4"/><path d="M5.4 8.2l1.8 1.8 3.4-3.8"/>'
            : kind === "warn" || kind === "danger"
              ? '<path d="M8 1.8 14.6 13.6H1.4z"/><path d="M8 6v3.4"/><path d="M8 11.4v.2"/>'
              : '<circle cx="8" cy="8" r="6.4"/><path d="M8 7.4v3.2"/><path d="M8 4.8v.2"/>') +
          "</svg>";

        var body = document.createElement("span");
        body.textContent = text;

        toast.appendChild(icon);
        toast.appendChild(body);
        stack.appendChild(toast);

        window.setTimeout(function () {
          toast.classList.add("is-leaving");
          window.setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
            if (stack.parentNode && !stack.firstChild) stack.parentNode.removeChild(stack);
          }, 240);
        }, 4000);
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", show, { once: true });
      } else {
        show();
      }
      return PMStore;
    }
  };

  window.PMStore = PMStore;
})();
