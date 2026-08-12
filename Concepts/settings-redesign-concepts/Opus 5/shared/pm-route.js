/* Opus 5 — hash routing for deep links, back and forward.
 *
 * Hash-based on purpose. These pages are opened three ways: from disk
 * (file://), from the ConceptHub server at /concepts/<encoded-path>, and inside
 * the Hub's iframe. history.pushState would need a real base path in all three
 * and breaks in the first, so the route lives in the fragment and back/forward
 * are native hashchange events.
 *
 * Grammar (every segment encodeURIComponent-encoded):
 *   #/home
 *   #/search/<query>
 *   #/c/<categoryId>
 *   #/c/<categoryId>/<subcategoryId>
 *   #/c/<categoryId>/<subcategoryId>/<settingId>
 *   #/m/<managerId>
 *   #/m/<managerId>/<sectionId>
 *   #/m/<managerId>/<sectionId>/<itemId>
 * with an optional "?demo=<demoStateId>" tail on any of them.
 *
 * Route = { kind, query, categoryId, subcategoryId, settingId,
 *           managerId, sectionId, itemId, demo }   unused fields null.
 *
 * Nothing here throws. A malformed hash resolves to EMPTY; a well-formed hash
 * naming something a concept does not contain is a DIFFERENT case, and it is
 * the concept's job to say so inline rather than this file's to guess.
 */
(function () {
  "use strict";

  var EMPTY = { kind: "home", query: null, categoryId: null, subcategoryId: null,
    settingId: null, managerId: null, sectionId: null, itemId: null, demo: null };

  function blank(kind) {
    return { kind: kind || "home", query: null, categoryId: null, subcategoryId: null,
      settingId: null, managerId: null, sectionId: null, itemId: null, demo: null };
  }

  /* A decode failure is a malformed link, not a literal string. Returning the
   * raw text would turn "%zz" into a plausible-looking id and send the concept
   * hunting for a category it can never find; BAD makes the whole hash resolve
   * to EMPTY instead, which is the documented behaviour. */
  var BAD = {};

  function dec(s) {
    if (s == null || s === "") return null;
    try {
      var out = decodeURIComponent(s);
      /* decodeURIComponent accepts a bare "%" in some engines; reject anything
       * that still looks like a broken escape. */
      if (/%(?![0-9a-fA-F]{2})/.test(s)) return BAD;
      return out;
    } catch (e) { return BAD; }
  }

  function enc(s) {
    return encodeURIComponent(String(s));
  }

  /* Exact arities. "#/c/a/b/c/d" is not a category route with a stray segment,
   * it is malformed, and the difference matters: a malformed hash goes Home,
   * while a well-formed hash naming something this concept does not contain
   * gets the inline "that link points at something..." notice. Blurring the two
   * would make bad links silently look like missing content. */
  var ARITY = { home: [1, 1], search: [2, 2], c: [2, 4], m: [2, 4] };

  function parse(hash) {
    var raw = hash == null ? window.location.hash : hash;
    raw = String(raw || "");
    if (raw.charAt(0) === "#") raw = raw.slice(1);
    if (!raw) return blank("home");

    var demo = null;
    var q = raw.indexOf("?");
    if (q >= 0) {
      var tail = raw.slice(q + 1);
      raw = raw.slice(0, q);
      var tailBad = false;
      tail.split("&").forEach(function (pair) {
        if (pair === "") return;
        var eq = pair.indexOf("=");
        var key = eq < 0 ? pair : pair.slice(0, eq);
        var val = eq < 0 ? "" : pair.slice(eq + 1);
        if (key === "demo") {
          var d = dec(val);
          if (d === BAD) tailBad = true; else demo = d;
        }
      });
      if (tailBad) return blank("home");
    }

    if (raw.charAt(0) === "/") raw = raw.slice(1);
    if (!raw) { var h = blank("home"); h.demo = demo; return h; }

    var parts = raw.split("/");
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === "") return blank("home");   // "//", or a trailing slash
    }

    var head = parts[0];
    var arity = ARITY[head];
    if (!arity || parts.length < arity[0] || parts.length > arity[1]) return blank("home");

    var decoded = [];
    for (var j = 1; j < parts.length; j++) {
      var v = dec(parts[j]);
      if (v === BAD) return blank("home");
      decoded.push(v);
    }

    var route;
    if (head === "home") {
      route = blank("home");
    } else if (head === "search") {
      route = blank("search");
      route.query = decoded[0] == null ? "" : decoded[0];
    } else if (head === "c") {
      route = blank("category");
      route.categoryId = decoded[0];
      route.subcategoryId = decoded[1] != null ? decoded[1] : null;
      route.settingId = decoded[2] != null ? decoded[2] : null;
    } else {
      route = blank("manager");
      route.managerId = decoded[0];
      route.sectionId = decoded[1] != null ? decoded[1] : null;
      route.itemId = decoded[2] != null ? decoded[2] : null;
    }

    route.demo = demo;
    return route;
  }

  function format(route) {
    var r = route || EMPTY;
    var path;
    if (r.kind === "search") {
      path = "#/search/" + enc(r.query == null ? "" : r.query);
    } else if (r.kind === "category" && r.categoryId) {
      path = "#/c/" + enc(r.categoryId);
      if (r.subcategoryId) path += "/" + enc(r.subcategoryId);
      if (r.subcategoryId && r.settingId) path += "/" + enc(r.settingId);
    } else if (r.kind === "manager" && r.managerId) {
      path = "#/m/" + enc(r.managerId);
      if (r.sectionId) path += "/" + enc(r.sectionId);
      if (r.sectionId && r.itemId) path += "/" + enc(r.itemId);
    } else {
      path = "#/home";
    }
    if (r.demo) path += "?demo=" + enc(r.demo);
    return path;
  }

  /* write() is the only thing that touches history. replace === true is for
   * corrections that must not create a back step (restoring a persisted route
   * on load, normalising an alias); everything the user chose pushes. */
  var suppress = 0;

  function write(route, replace) {
    var next = format(route);
    var current = window.location.hash || "";
    if (current === next) return;
    suppress += 1;
    try {
      if (replace) {
        var href = window.location.href;
        var cut = href.indexOf("#");
        window.location.replace((cut < 0 ? href : href.slice(0, cut)) + next);
      } else {
        window.location.hash = next;
      }
    } catch (e) {
      /* Some embeddings refuse location writes; the caller has already applied
       * the route to its own store, so the screen stays correct without it. */
    }
    window.setTimeout(function () { if (suppress > 0) suppress -= 1; }, 0);
  }

  function onChange(fn) {
    function handler() { fn(parse(), suppress > 0); }
    window.addEventListener("hashchange", handler);
    return function () { window.removeEventListener("hashchange", handler); };
  }

  function same(a, b) {
    if (!a || !b) return a === b;
    return a.kind === b.kind && a.query === b.query && a.categoryId === b.categoryId &&
      a.subcategoryId === b.subcategoryId && a.settingId === b.settingId &&
      a.managerId === b.managerId && a.sectionId === b.sectionId &&
      a.itemId === b.itemId && a.demo === b.demo;
  }

  window.PMRoute = {
    parse: parse,
    format: format,
    write: write,
    onChange: onChange,
    same: same,
    EMPTY: EMPTY
  };
})();
