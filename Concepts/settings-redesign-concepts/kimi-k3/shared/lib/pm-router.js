/* ============================================================================
   pm-router.js — hash router + history integration (IIFE, no dependencies)
   ----------------------------------------------------------------------------
   Deterministic deep links for the Settings concepts.

     PMRouter.init({ onRoute })
       Binds popstate + hashchange, then fires onRoute(route, initial)
       once for the initial route (initial === true). Later navigations
       fire onRoute(route, false). `route` is always the normalized shape
       below (never null).

     PMRouter.parse(hash?) -> route
       Parses a hash string (defaults to location.hash) into:
         { view: "home"|"category"|"manager",
           category, sub, setting, manager, tab }   (missing keys: null)

     PMRouter.go(target, { replace = false, silent = false })
       target: partial route — {} or { view:"home" } goes Home;
       { category, sub?, setting? } opens a workspace; { manager, tab? }
       opens a manager. Pushes history (or replaces), updates the hash,
       and fires onRoute unless silent. Renderers own scrolling/focus —
       the router never scrolls.

     PMRouter.current() -> the last route handed to onRoute.

   Hash formats (segments are decodeURIComponent'd):
     (empty) | #/                         Home
     #/c/<categoryId>[/<subId>[/<settingId>]]
     #/m/<managerId>[/<subId>[/<tabId>]]  (sub = e.g. provider id)

   Unknown first segments degrade to Home (never a dead view). Ids with
   characters outside [A-Za-z0-9._-] are rejected to Home as well.
   ========================================================================== */
(function () {
  "use strict";

  var SEG = /^[A-Za-z0-9._-]+$/;
  var last = null;
  var handler = function () {};

  function segOk(s) { return typeof s === "string" && SEG.test(s); }

  function empty() {
    return { view: "home", category: null, sub: null, setting: null, manager: null, tab: null };
  }

  function parse(hash) {
    var h = typeof hash === "string" ? hash : window.location.hash;
    h = h.replace(/^#/, "");
    if (!h || h === "/") return empty();
    var parts = h.split("/").filter(function (p) { return p !== ""; }).map(function (p) {
      try { return decodeURIComponent(p); } catch (e) { return ""; }
    });
    var route = empty();
    if (parts[0] === "c" && segOk(parts[1])) {
      route.view = "category";
      route.category = parts[1];
      if (segOk(parts[2])) route.sub = parts[2];
      if (segOk(parts[3])) route.setting = parts[3];
      return route;
    }
    if (parts[0] === "m" && segOk(parts[1])) {
      route.view = "manager";
      route.manager = parts[1];
      /* #/m/<manager>/<tab>            -> tab
         #/m/<manager>/<sub>/<tab>     -> sub + tab (e.g. provider id + tab) */
      if (segOk(parts[2]) && segOk(parts[3])) {
        route.sub = parts[2];
        route.tab = parts[3];
      } else if (segOk(parts[2])) {
        route.tab = parts[2];
      }
      return route;
    }
    return route; /* unknown shape -> Home, never a dead view */
  }

  function toHash(route) {
    if (!route || route.view === "home") return "#/";
    if (route.view === "manager" && segOk(route.manager)) {
      var mh = "#/m/" + route.manager;
      if (segOk(route.sub)) mh += "/" + route.sub;
      if (segOk(route.tab)) mh += "/" + route.tab;
      return mh;
    }
    if (segOk(route.category)) {
      var h = "#/c/" + route.category;
      if (segOk(route.sub)) h += "/" + route.sub;
      if (route.sub && segOk(route.setting)) h += "/" + route.setting;
      return h;
    }
    return "#/";
  }

  function same(a, b) {
    return a && b && a.view === b.view && a.category === b.category &&
      a.sub === b.sub && a.setting === b.setting && a.manager === b.manager && a.tab === b.tab;
  }

  function normalize(target) {
    var t = target || {};
    var route = empty();
    if (t.view === "manager" || t.manager) {
      route.view = "manager";
      route.manager = t.manager || null;
      route.sub = t.sub || null;
      route.tab = t.tab || null;
      return route;
    }
    if (t.view === "category" || t.category) {
      route.view = "category";
      route.category = t.category || null;
      route.sub = t.sub || null;
      route.setting = t.setting || null;
      return route;
    }
    return route;
  }

  function onNav() {
    var route = parse();
    if (same(route, last)) return;
    last = route;
    handler(route, false);
  }

  window.PMRouter = {
    init: function (opts) {
      handler = (opts && typeof opts.onRoute === "function") ? opts.onRoute : function () {};
      window.addEventListener("popstate", onNav);
      window.addEventListener("hashchange", onNav);
      last = parse();
      handler(last, true);
    },
    parse: parse,
    toHash: toHash,
    current: function () { return last || parse(); },
    go: function (target, opts) {
      opts = opts || {};
      var route = normalize(target);
      var hash = toHash(route);
      if (opts.replace) {
        window.history.replaceState(null, "", hash);
      } else {
        window.history.pushState(null, "", hash);
      }
      if (same(route, last)) return;
      last = route;
      if (!opts.silent) handler(route, false);
    }
  };
})();
