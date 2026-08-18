/* pm-routes.js — HEADLESS routing + navigation stack for concepts 05–11 (2026-08-18 bakeoff).
   Routes are immutable data: domain/page/manager/object/section/row/tab/mode. Hash form:
     #/d/<domain>/p/<page>/m/<manager>/o/<object>/s/<section>/r/<row>/t/<tab>/x/<mode>?q=<query>&res=<rid>
   Back restores the query and selected result (search contract). Explicit state machine
   helpers support Slint portability (no DOM-magic routing). */
(function () {
  "use strict";
  var PM2 = window.PM2;
  var R = PM2.routes = {};

  var KEYS = { d: "domain", p: "page", m: "manager", o: "object", s: "section", r: "row", t: "tab", x: "mode" };
  R.str = function (route) {
    route = route || {};
    var out = "#";
    ["d", "p", "m", "o", "s", "r", "t", "x"].forEach(function (k) {
      var v = route[KEYS[k]];
      if (v !== undefined && v !== null && v !== "") out += "/" + k + "/" + encodeURIComponent(v);
    });
    var q = [];
    if (route.query) q.push("q=" + encodeURIComponent(route.query));
    if (route.resultId) q.push("res=" + encodeURIComponent(route.resultId));
    return out + (q.length ? "?" + q.join("&") : "");
  };
  R.parse = function (hash) {
    var route = {};
    var h = (hash || "").replace(/^#/, "");
    var qs = h.split("?");
    if (qs[1]) qs[1].split("&").forEach(function (kv) {
      var p = kv.split("=");
      if (p[0] === "q") route.query = decodeURIComponent(p[1] || "");
      if (p[0] === "res") route.resultId = decodeURIComponent(p[1] || "");
    });
    var parts = qs[0].split("/").filter(Boolean);
    for (var i = 0; i + 1 < parts.length; i += 2) {
      var k = KEYS[parts[i]];
      if (k) route[k] = decodeURIComponent(parts[i + 1]);
    }
    return route;
  };
  R.crumb = function (route) {
    route = route || {};
    var out = [];
    if (route.domain) out.push(PM2.categoryTitle(route.domain));
    var m = route.manager ? PM2.mgrById[route.manager] : null;
    if (route.page && !m) out.push(PM2.subgroupTitle(route.domain, route.page));
    if (m) out.push(m.title);
    if (route.object && m) {
      var rec = (m.records || []).filter(function (r) { return r.id === route.object; })[0];
      if (rec) out.push(rec.label);
    }
    if (route.row) { var s = PM2.inventory.byId[route.row]; if (s) out.push(s.label); }
    return out;
  };

  /* ---------- navigation stack (per concept instance) ---------- */
  function Nav(initial) {
    this.stack = [initial || { domain: null }];
    this.listeners = [];
  }
  Nav.prototype.top = function () { return this.stack[this.stack.length - 1]; };
  Nav.prototype.go = function (route, opts) {
    route = Object.assign({}, this.top(), route, opts && opts.replace ? {} : {});
    if (opts && opts.replace) this.stack[this.stack.length - 1] = route;
    else this.stack.push(route);
    this.emit(route, this.stack.length - 1);
    return route;
  };
  Nav.prototype.back = function () {
    if (this.stack.length <= 1) { this.emit(this.top(), 0); return this.top(); }
    var r = this.stack.pop();
    this.emit(this.top(), this.stack.length - 1, { returnedFrom: r });
    return this.top();
  };
  Nav.prototype.canBack = function () { return this.stack.length > 1; };
  Nav.prototype.reset = function (route) {
    this.stack = [route || { domain: null }];
    this.emit(this.top(), 0);
    return this.top();
  };
  Nav.prototype.emit = function (route, depth, extra) {
    var self = this;
    if (this._raf) return; /* coalesce */
    this._raf = 1;
    var done = false;
    var run = function () {
      if (done) return; done = true;
      self._raf = null;
      self.listeners.forEach(function (l) { l(self.top(), depth, extra); });
    };
    if (window.requestAnimationFrame) { try { window.requestAnimationFrame(run); } catch (e) { run(); } }
    setTimeout(run, 34); /* fallback: rAF never fires in hidden/throttled pages */
  };
  Nav.prototype.on = function (l) { this.listeners.push(l); return this; };
  R.Nav = Nav;

  /* Route resolution: a search destination resolves to a concrete navigation plan the
     concept executes natively (load domain → open manager → select object → section →
     scroll row → focus → calm highlight). Plan is data; execution is concept-native. */
  R.planFor = function (dest) {
    dest = dest || {};
    var plan = { steps: [], route: Object.assign({}, dest), focus: null, highlight: null };
    if (dest.domain !== undefined && dest.domain !== null) plan.steps.push({ do: "load-domain", domain: dest.domain });
    if (dest.page) plan.steps.push({ do: "load-page", page: dest.page });
    if (dest.manager) plan.steps.push({ do: "open-manager", manager: dest.manager });
    if (dest.object) plan.steps.push({ do: "select-object", object: dest.object });
    if (dest.section) plan.steps.push({ do: "select-section", section: dest.section });
    if (dest.row) plan.steps.push({ do: "scroll-row", row: dest.row });
    if (dest.tab) plan.steps.push({ do: "select-tab", tab: dest.tab });
    plan.focus = dest.row || dest.object || dest.manager || dest.page || dest.domain;
    plan.highlight = dest.row || dest.object || null;
    return plan;
  };
})();
