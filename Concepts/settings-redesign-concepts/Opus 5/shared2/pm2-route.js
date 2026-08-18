/* Opus 5 — hash routing and destination objects for concepts 05-11.
 *
 * Grammar (every segment encodeURIComponent-encoded):
 *
 *   #/home
 *   #/q/<query>[/<resultId>]
 *   #/d/<domainId>[/<pageId>[/<sectionId>[/<settingId>]]]
 *   #/m/<managerId>[/<objectId>[/<sectionKey>[/<rowId>]]]
 *   #/copy[/<step>]
 *   #/all[/<facetQuery>]
 *
 * with an optional "?s=<stateFixtureId>" tail on any of them.
 *
 * Hash-based on purpose. These pages are opened from disk (file://), from a
 * server, and inside a preview frame; pushState would need a real base path in
 * all three and cannot work in the first, so the route lives in the fragment and
 * Back is a native history step. That also means the browser's Back button and
 * an in-app Back button are the same action rather than two systems that drift.
 *
 * Two failures that look alike are kept apart, because the packet asks for two
 * different answers:
 *
 *   MALFORMED  - not a Settings link at all: a stray segment, an unknown head,
 *                a broken percent escape. This goes Home.
 *   ABSENT     - a well-formed link naming something this Project does not have.
 *                This is NOT malformed; `resolve()` returns the reason and the
 *                link so a concept can render an honest inline notice instead of
 *                guessing at a near-miss destination.
 *
 * Nothing here throws on bad input, and nothing here draws anything.
 */
(function () {
  "use strict";

  var M = window.PM2Model || null;

  /* ------------------------------------------------------------- primitives */

  /* A decode failure is a broken link, not a literal string. Returning the raw
   * text would turn "%zz" into a plausible-looking id and send a concept hunting
   * for a page that can never exist; BAD makes the whole hash malformed, which
   * is the documented behaviour. */
  var BAD = {};

  function dec(s) {
    if (s == null || s === "") return null;
    if (/%(?![0-9a-fA-F]{2})/.test(s)) return BAD;
    try { return decodeURIComponent(s); } catch (e) { return BAD; }
  }

  function enc(s) { return encodeURIComponent(String(s)); }

  function blank(kind) {
    return {
      kind: kind || "home",
      domainId: null, pageId: null, sectionId: null, settingId: null,
      managerId: null, objectId: null, sectionKey: null, rowId: null,
      query: null, resultId: null,
      step: null, facet: null,
      state: null,
      /* The contract's route shape names this `demo`; the grammar's tail is
       * `?s=`. They are one value, exposed under both names so neither the
       * written contract nor the written grammar has to be paraphrased. */
      demo: null,
      malformed: false,
      raw: ""
    };
  }

  /* Exact arities. "#/d/a/b/c/d/e" is not a domain route with a stray segment,
   * it is malformed, and the difference is the whole point: a malformed link
   * goes Home, while a well-formed link naming something absent gets an inline
   * notice that quotes it. Blurring the two makes bad links look like missing
   * content, which is the failure the packet calls out. */
  var ARITY = { home: [1, 1], q: [2, 3], d: [2, 5], m: [2, 5], copy: [1, 2], all: [1, 2] };

  var KIND_OF_HEAD = { home: "home", q: "query", d: "domain", m: "manager", copy: "copy", all: "all" };

  function malformed(raw, state) {
    var r = blank("home");
    r.malformed = true;
    r.raw = String(raw == null ? "" : raw);
    r.state = state || null;
    r.demo = r.state;
    return r;
  }

  function parse(hash) {
    var input = hash == null ? (window.location ? window.location.hash : "") : hash;
    var raw = String(input == null ? "" : input);
    var original = raw;
    if (raw.charAt(0) === "#") raw = raw.slice(1);

    var state = null;
    var qAt = raw.indexOf("?");
    if (qAt >= 0) {
      var tail = raw.slice(qAt + 1);
      raw = raw.slice(0, qAt);
      var pairs = tail.split("&");
      for (var t = 0; t < pairs.length; t++) {
        var pair = pairs[t];
        if (pair === "") continue;
        var eq = pair.indexOf("=");
        var key = eq < 0 ? pair : pair.slice(0, eq);
        var val = eq < 0 ? "" : pair.slice(eq + 1);
        if (key === "s" || key === "demo") {
          var decoded = dec(val);
          if (decoded === BAD) return malformed(original, null);
          state = decoded;
        }
        /* An unrecognised tail key is ignored rather than fatal: an analytics or
         * preview parameter appended by a host must not break navigation. */
      }
    }

    if (raw.charAt(0) === "/") raw = raw.slice(1);
    if (!raw) {
      var home = blank("home");
      home.raw = original;
      home.state = state;
      home.demo = state;
      return home;
    }

    var parts = raw.split("/");
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === "") return malformed(original, state);   /* "//" or a trailing slash */
    }

    var head = parts[0];
    var arity = ARITY[head];
    if (!arity || parts.length < arity[0] || parts.length > arity[1]) return malformed(original, state);

    var seg = [];
    for (var j = 1; j < parts.length; j++) {
      var v = dec(parts[j]);
      if (v === BAD) return malformed(original, state);
      seg.push(v);
    }

    var route = blank(KIND_OF_HEAD[head]);
    if (head === "q") {
      route.query = seg[0] == null ? "" : seg[0];
      route.resultId = seg[1] == null ? null : seg[1];
    } else if (head === "d") {
      route.domainId = seg[0];
      route.pageId = seg[1] == null ? null : seg[1];
      route.sectionId = seg[2] == null ? null : seg[2];
      route.settingId = seg[3] == null ? null : seg[3];
    } else if (head === "m") {
      route.managerId = seg[0];
      route.objectId = seg[1] == null ? null : seg[1];
      route.sectionKey = seg[2] == null ? null : seg[2];
      route.rowId = seg[3] == null ? null : seg[3];
      /* The manager grammar does not carry a domain, but every concept has to
       * light the right domain before it opens the manager. Filling it from the
       * model here keeps that lookup out of seven concepts; href() ignores it,
       * so the route still round-trips exactly. */
      if (M && M.familyOf) {
        var fam = M.familyOf(route.managerId);
        if (fam) route.domainId = fam.domainId || null;
      }
    } else if (head === "copy") {
      route.step = seg[0] == null ? null : seg[0];
    } else if (head === "all") {
      route.facet = seg[0] == null ? null : seg[0];
    }

    route.state = state;
    route.demo = state;
    route.raw = original;
    return route;
  }

  function isMalformed(hash) { return parse(hash).malformed === true; }

  /* ------------------------------------------------------------- normalising */

  /* Accepts a route, an index destination, or a whole search result. A concept
   * routes with `PM2Route.go(PM2Index.byId(id).destination)`; passing the result
   * itself is the same intent, so it is accepted rather than punished. */
  function normalise(input) {
    if (!input) return blank("home");
    var d = input;
    if (!d.kind && d.destination) d = d.destination;

    var out = blank(d.kind || null);
    out.domainId = d.domainId || null;
    out.pageId = d.pageId || null;
    out.sectionId = d.sectionId || null;
    out.settingId = d.settingId || null;
    out.managerId = d.managerId || null;
    out.objectId = d.objectId || null;
    out.sectionKey = d.sectionKey || null;
    out.rowId = d.rowId || null;
    out.query = d.query == null ? null : String(d.query);
    out.resultId = d.resultId || null;
    out.step = d.step || null;
    out.facet = d.facet || null;
    out.state = d.state || d.demo || null;
    out.demo = out.state;

    /* A destination object carries no kind, so it is inferred from what it
     * actually names. Managers win over the domain field: an index destination
     * for a manager carries its domain too, and a reader asking for the manager
     * means the manager. */
    if (!d.kind) {
      if (out.managerId) out.kind = "manager";
      else if (out.settingId || out.sectionId || out.pageId || out.domainId) out.kind = "domain";
      else if (out.query != null) out.kind = "query";
      else if (out.step) out.kind = "copy";
      else if (out.facet) out.kind = "all";
      else out.kind = "home";
    }

    /* Fill the parents a nested link needs. A concept that only knows the
     * setting id still produces a complete, replayable link. */
    if (out.kind === "domain" && M) {
      if (out.settingId && (!out.sectionId || !out.pageId || !out.domainId)) {
        var s = M.setting ? M.setting(out.settingId) : null;
        if (s) {
          out.sectionId = out.sectionId || s.sectionId || null;
          out.pageId = out.pageId || s.pageId || null;
          out.domainId = out.domainId || s.domainId || null;
        }
      }
      if (out.sectionId && (!out.pageId || !out.domainId)) {
        var sec = M.section ? M.section(out.sectionId) : null;
        if (sec) {
          out.pageId = out.pageId || sec.pageId || null;
          out.domainId = out.domainId || sec.domainId || null;
        }
      }
      if (out.pageId && !out.domainId) {
        var page = M.page ? M.page(out.pageId) : null;
        if (page) out.domainId = page.domainId || null;
      }
    }

    if (out.kind === "manager" && !out.domainId && M && M.familyOf) {
      var f = M.familyOf(out.managerId);
      if (f) out.domainId = f.domainId || null;
    }

    return out;
  }

  function href(dest) {
    var r = normalise(dest);
    var path;

    if (r.kind === "query" && r.query) {
      path = "#/q/" + enc(r.query);
      if (r.resultId) path += "/" + enc(r.resultId);
    } else if (r.kind === "domain" && r.domainId) {
      path = "#/d/" + enc(r.domainId);
      if (r.pageId) {
        path += "/" + enc(r.pageId);
        if (r.sectionId) {
          path += "/" + enc(r.sectionId);
          if (r.settingId) path += "/" + enc(r.settingId);
        }
      }
    } else if (r.kind === "manager" && r.managerId) {
      path = "#/m/" + enc(r.managerId);
      if (r.objectId) {
        path += "/" + enc(r.objectId);
        if (r.sectionKey) {
          path += "/" + enc(r.sectionKey);
          if (r.rowId) path += "/" + enc(r.rowId);
        }
      }
    } else if (r.kind === "copy") {
      path = "#/copy";
      if (r.step) path += "/" + enc(r.step);
    } else if (r.kind === "all") {
      path = "#/all";
      if (r.facet) path += "/" + enc(r.facet);
    } else {
      /* Includes an empty query: "#/q/" would be a malformed link, and an empty
       * search field is Home. */
      path = "#/home";
    }

    if (r.state) path += "?s=" + enc(r.state);
    return path;
  }

  function same(a, b) {
    if (!a || !b) return a === b;
    return a.kind === b.kind && a.domainId === b.domainId && a.pageId === b.pageId &&
      a.sectionId === b.sectionId && a.settingId === b.settingId &&
      a.managerId === b.managerId && a.objectId === b.objectId &&
      a.sectionKey === b.sectionKey && a.rowId === b.rowId &&
      a.query === b.query && a.resultId === b.resultId &&
      a.step === b.step && a.facet === b.facet && a.state === b.state;
  }

  /* ---------------------------------------------------------------- resolve */

  /* Honest inline notices need two things a concept cannot invent: which part of
   * the link is absent, and the link itself to quote. `code` is for branching,
   * `reason` is a sentence a reader can act on. */
  function fail(code, reason, dest) {
    return { ok: false, code: code, reason: reason, quoted: href(dest), dest: dest };
  }

  function resolve(dest) {
    var r = normalise(dest);

    if (r.malformed) {
      return fail("malformed", "That link is not a Settings location.", blank("home"));
    }

    if (r.kind === "home" || r.kind === "copy" || r.kind === "all") {
      return { ok: true, dest: r, quoted: href(r) };
    }

    if (r.kind === "query") {
      if (r.resultId && window.PM2Index && typeof window.PM2Index.byId === "function") {
        if (!window.PM2Index.byId(r.resultId)) {
          return fail("unknown-result",
            "That search result is no longer in Settings. The search text was kept.", r);
        }
      }
      return { ok: true, dest: r, quoted: href(r) };
    }

    if (!M) return { ok: true, dest: r, quoted: href(r) };

    if (r.kind === "domain") {
      var domain = M.domain ? M.domain(r.domainId) : null;
      if (!domain) return fail("unknown-domain", "That link points at a Settings area this Project does not have.", r);

      if (r.pageId) {
        var page = M.page ? M.page(r.pageId) : null;
        if (!page) return fail("unknown-page", "That link points at a Settings page this Project does not have.", r);
        if (page.domainId !== r.domainId) {
          return fail("page-elsewhere", "That page exists, but not in the area the link names.", r);
        }
      }
      if (r.sectionId) {
        var section = M.section ? M.section(r.sectionId) : null;
        if (!section) return fail("unknown-section", "That link points at a group of settings this Project does not have.", r);
        if (r.pageId && section.pageId !== r.pageId) {
          return fail("section-elsewhere", "That group exists, but not on the page the link names.", r);
        }
      }
      if (r.settingId) {
        var setting = M.setting ? M.setting(r.settingId) : null;
        if (!setting) return fail("unknown-setting", "That link points at a setting this Project does not have.", r);
        if (r.sectionId && setting.sectionId !== r.sectionId) {
          return fail("setting-elsewhere", "That setting exists, but not in the group the link names.", r);
        }
      }
      return { ok: true, dest: r, quoted: href(r) };
    }

    if (r.kind === "manager") {
      var family = M.familyOf ? M.familyOf(r.managerId) : null;
      if (!family) return fail("unknown-manager", "That link points at a manager this Project does not have.", r);

      /* Objects are verified through the index when it is loaded. Without it
       * there is no evidence either way, and "cannot check" must not be reported
       * as "does not exist" - hydrating the manager to find out is exactly what
       * the packet forbids. */
      if (r.objectId && window.PM2Index && typeof window.PM2Index.objectExists === "function") {
        if (!window.PM2Index.objectExists(r.managerId, r.objectId)) {
          return fail("unknown-object", "That manager does not contain the item this link names.", r);
        }
        if (r.rowId && !window.PM2Index.objectExists(r.managerId, r.rowId)) {
          return fail("unknown-row", "That item does not contain the row this link names.", r);
        }
      }
      return { ok: true, dest: r, quoted: href(r) };
    }

    return { ok: true, dest: r, quoted: href(r) };
  }

  /* ------------------------------------------------------- history and echo */

  var listeners = [];
  var suppress = 0;
  var expected = null;

  function notify(route, info) {
    var snapshot = listeners.slice();
    for (var i = 0; i < snapshot.length; i++) {
      try { snapshot[i](route, info); } catch (e) {
        /* One broken subscriber must not stop the others from rendering. */
      }
    }
  }

  /* Every write notifies subscribers exactly once, synchronously, and swallows
   * the hashchange the write causes. Firing on both would make every navigation
   * render twice - once optimistically and once from the echo - which is how
   * scroll position and focus get lost between the two passes. */
  function write(route, replaceIt, info) {
    var next = href(route);
    var applied = parse(next);
    applied.state = route.state || applied.state;
    applied.demo = applied.state;

    var loc = window.location;
    var currentHash = loc ? (loc.hash || "") : "";

    if (currentHash !== next) {
      suppress += 1;
      expected = next;
      try {
        if (replaceIt && loc && typeof loc.replace === "function") {
          var full = String(loc.href || "");
          var cut = full.indexOf("#");
          loc.replace((cut < 0 ? full : full.slice(0, cut)) + next);
        } else if (loc) {
          loc.hash = next;
        }
      } catch (e) {
        /* Some embeddings refuse location writes. The caller has already been
         * told which route to draw, so the screen stays correct without it. */
      }
      /* Belt and braces: if the write produced no event at all, the suppression
       * must not survive to swallow the reader's next navigation. */
      if (window.setTimeout) {
        window.setTimeout(function () {
          if (suppress > 0 && expected === next) { suppress -= 1; expected = null; }
        }, 0);
      }
    }

    notify(applied, info);
    return applied;
  }

  function go(dest, opts) {
    var o = opts || {};
    return write(normalise(dest), o.replace === true, { source: o.replace === true ? "replace" : "go", echo: false });
  }

  function replace(dest) {
    return write(normalise(dest), true, { source: "replace", echo: false });
  }

  /* Native history, so the browser Back button and an in-app Back button are the
   * same step rather than two stacks that disagree. */
  function back() {
    try {
      if (window.history && typeof window.history.back === "function") { window.history.back(); return true; }
    } catch (e) {}
    return false;
  }

  function current() { return parse(); }

  function state() { return current().state; }

  function withState(dest, id) {
    var r = normalise(dest);
    r.state = id || null;
    r.demo = r.state;
    return r;
  }

  function onChange(fn) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function () {
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] === fn) { listeners.splice(i, 1); return; }
      }
    };
  }

  function onHashChange() {
    var raw = window.location ? (window.location.hash || "") : "";
    if (suppress > 0 && raw === expected) { suppress -= 1; expected = null; return; }

    var route = parse(raw);
    if (route.malformed) {
      /* A malformed link goes Home, and it is corrected in place: leaving the
       * broken text in the address bar would put a link in the reader's history
       * that can only ever fail again. The state fixture, if it survived
       * decoding, is kept so the demo does not silently reset. */
      var home = blank("home");
      home.state = route.state;
      home.demo = route.state;
      write(home, true, { source: "malformed", echo: false, malformed: true, raw: raw });
      return;
    }
    notify(route, { source: "history", echo: false });
  }

  if (window.addEventListener) window.addEventListener("hashchange", onHashChange);

  window.PM2Route = {
    current: current,
    parse: parse,
    href: href,
    go: go,
    replace: replace,
    back: back,
    onChange: onChange,
    isMalformed: isMalformed,
    resolve: resolve,

    state: state,
    withState: withState,

    normalise: normalise,
    same: same,
    empty: function () { return blank("home"); },
    KINDS: ["home", "query", "domain", "manager", "copy", "all"]
  };
})();
