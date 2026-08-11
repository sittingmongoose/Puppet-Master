/* state.js — shared state, theme reducer, search, scrollspy/jump core, manager shell helpers.
   Shared by all four GLM-5.2 concepts. Semantic state is kept separate from DOM geometry
   (no DOM measurement as the source of semantic state — Slint-portable per packet 05). */
(function () {
  "use strict";
  window.PM = window.PM || {};

  /* ---------- ROOT + STATE ---------- */
  var root = document.documentElement;

  PM.state = {
    theme: "friendly-dark",
    reducedMotion: false,
    density: "comfortable",
    rail: "open",
    chat: "closed",
    view: "home",          // home | workspace | manager
    activeCat: null,
    activeSub: null,
    activeManager: null,
    query: "",
    settingValues: {},     // B7 settings persistence (id → {value, state})
    exposure: "standard"   // A2 exposure disclosure level
  };

  PM.applyTheme = function (theme) {
    PM.state.theme = theme;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = /-dark$/.test(theme) ? "dark" : "light";
    PM.broadcast();
  };
  PM.applyReducedMotion = function (on) {
    PM.state.reducedMotion = !!on;
    root.setAttribute("data-reduced-motion", on ? "1" : "0");
    PM.broadcast();
  };
  PM.applyDensity = function (d) {
    PM.state.density = d;
    root.setAttribute("data-density", d);
    PM.broadcast();
  };
  PM.setShell = function (part, val) {
    PM.state[part] = val;
    var shell = document.querySelector(".pm-shell");
    if (shell) shell.setAttribute("data-" + part, val);
    // toggle buttons reflect state
    var btn = document.querySelector('[data-shell-toggle="' + part + '"]');
    if (btn) btn.setAttribute("aria-pressed", String(val === "open"));
    PM.broadcast();
  };

  /* broadcast a pm-concept-state so any sibling UI (and the Hub bridge) stays in sync */
  PM.broadcast = function () {
    var st = { theme: PM.state.theme, reducedMotion: PM.state.reducedMotion,
               testWidth: PM._testWidth, widthRole: "page" };
    window.postMessage({ source: "pm-concept-hub", type: "pm-concept-state", state: st }, "*");
  };

  /* ---------- NAVIGATION (per concept: jump + scrollspy) ---------- */
  /* Concepts provide PM.onNav(catId, subId, opts) to perform their own jump. */
  PM.goHome = function () { PM.state.view = "home"; PM.state.activeCat = null; PM.state.activeSub = null; PM.state.activeManager = null; PM.render && PM.render(); };
  PM.openCategory = function (catId, subId) {
    PM.state.view = "workspace";
    PM.state.activeCat = catId;
    PM.state.activeSub = subId || (PM.catById(catId).sub[0] && PM.catById(catId).sub[0].id);
    var sub = PM.subById[catId + "." + PM.state.activeSub];
    if (sub && sub.manager) { PM.state.view = "manager"; PM.state.activeManager = sub.manager; }
    PM.render && PM.render();
    // focus after layout settles
    setTimeout(function () { PM.focusSub(PM.state.activeSub, { flash: true }); }, 30);
  };
  PM.openSub = function (subId, opts) {
    var key = PM.state.activeCat + "." + subId;
    var sub = PM.subById[key];
    if (sub && sub.manager && opts && opts.manager !== false) {
      PM.state.view = "manager"; PM.state.activeManager = sub.manager;
      PM.state.activeSub = subId;
      PM.render && PM.render();
      setTimeout(function () { PM.focusSub(subId, { flash: true }); }, 30);
      return;
    }
    PM.state.activeSub = subId;
    PM.state.view = "workspace";
    PM.render && PM.render();
    setTimeout(function () { PM.focusSub(subId, { flash: true, jump: true }); }, 30);
  };
  PM.openManager = function (managerId) {
    var m = PM.managers[managerId];
    if (!m) return;
    PM.state.activeManager = managerId;
    PM.state.activeCat = m.managerCat;
    // pick first sub that references this manager
    var cat = PM.catById(m.managerCat);
    cat.sub.forEach(function (s) { if (s.manager === managerId) PM.state.activeSub = s.id; });
    PM.state.view = "manager";
    PM.render && PM.render();
  };

  /* jump to a subcategory element + brief non-flashing focus (C1: uses smoothJump helper) */
  PM.focusSub = function (subId, opts) {
    opts = opts || {};
    var el = document.querySelector('[data-sub-section="' + subId + '"]');
    if (!el) return;
    var scroller = PM.scroller();
    if (scroller && opts.jump) {
      var top = el.offsetTop - (PM.jumpOffset ? PM.jumpOffset() : 16);
      if (PM.motion) PM.motion.smoothJump(scroller, top);
      else if (PM.state.reducedMotion) scroller.scrollTop = top;
      else scroller.scrollTo({ top: top, behavior: "smooth" });
    }
    // brief non-flashing focus flash (softened to 2-ring settle via C1)
    if (opts.flash) {
      el.querySelectorAll && el.querySelectorAll(".focus-flash").forEach(function (n) { n.classList.remove("focus-flash"); });
      void el.offsetWidth;
      el.classList.add("focus-flash");
    }
  };
  PM.scroller = function () { return document.querySelector("[data-scroller]"); };

  /* ---------- SCROLLSPY (passive, no oscillation; B6 short-content fallback) ---------- */
  /* Uses IntersectionObserver with a rootMargin that favors the top.
     Concepts call PM.initScrollspy() once their workspace is in the DOM.
     B6: if the scroller can't scroll (content shorter than viewport), fall back to
     picking the section whose center is closest to the viewport center, so the
     active sub still advances on short categories. */
  PM.initScrollspy = function () {
    var scroller = PM.scroller();
    if (!scroller) return;
    var sections = Array.prototype.slice.call(scroller.querySelectorAll("[data-sub-section]"));
    if (!sections.length) return;
    if (PM._spyObs) { try { PM._spyObs.disconnect(); } catch (e) {} }
    if (PM._spyScroll) { try { scroller.removeEventListener("scroll", PM._spyScroll); } catch (e) {} }

    function computeActive() {
      var rootTop = scroller.getBoundingClientRect().top;
      var scrollable = scroller.scrollHeight - scroller.clientHeight > 8;
      var best = null, bestDist = Infinity;
      if (scrollable) {
        // normal case: last section whose top crossed the activation line
        sections.forEach(function (s) {
          var r = s.getBoundingClientRect();
          var dist = Math.abs(r.top - rootTop - 80);
          if (r.top - rootTop <= 120 && dist < bestDist) { bestDist = dist; best = s.getAttribute("data-sub-section"); }
        });
      } else {
        // B6 fallback: section whose center is nearest the viewport center
        var vpCenter = rootTop + scroller.clientHeight / 2;
        sections.forEach(function (s) {
          var r = s.getBoundingClientRect();
          var center = r.top + r.height / 2;
          var dist = Math.abs(center - vpCenter);
          if (dist < bestDist) { bestDist = dist; best = s.getAttribute("data-sub-section"); }
        });
      }
      if (!best && sections[0]) best = sections[0].getAttribute("data-sub-section");
      if (best && best !== PM.state.activeSub) {
        PM.state.activeSub = best;
        PM.onScrollspy && PM.onScrollspy(best);
      }
    }
    var io = new IntersectionObserver(function () { computeActive(); },
      { root: scroller, rootMargin: "-80px 0px -55% 0px", threshold: [0, 0.1, 0.5, 1] });
    sections.forEach(function (s) { io.observe(s); });
    // B6: also recompute on scroll for short-content + general robustness
    PM._spyScroll = function () { computeActive(); };
    scroller.addEventListener("scroll", PM._spyScroll, { passive: true });
    computeActive();
    PM._spyObs = io;
  };

  /* ---------- SEARCH (fuzzy discovery across categories/settings/managers) ---------- */
  PM.runSearch = function (q) {
    PM.state.query = q;
    if (!q || !q.trim()) return [];
    q = q.trim().toLowerCase();
    var out = [];
    // settings rows
    Object.keys(PM.settingsBySub).forEach(function (key) {
      PM.settingsBySub[key].forEach(function (r) {
        if (r.label.toLowerCase().indexOf(q) > -1 || (r.expl && r.expl.toLowerCase().indexOf(q) > -1)) {
          var parts = key.split(".");
          out.push({ kind: "setting", cat: parts[0], sub: parts[1], label: r.label, expl: r.expl, state: r.state });
        }
      });
    });
    // categories + subcategories
    PM.categories.forEach(function (c) {
      if (c.title.toLowerCase().indexOf(q) > -1 || c.id.indexOf(q) > -1)
        out.push({ kind: "category", cat: c.id, sub: c.sub[0] && c.sub[0].id, label: c.title, expl: c.purpose });
      c.sub.forEach(function (s) {
        if (s.title.toLowerCase().indexOf(q) > -1)
          out.push({ kind: "subcategory", cat: c.id, sub: s.id, label: s.title, expl: c.purpose });
      });
    });
    // managers
    Object.keys(PM.managers).forEach(function (mid) {
      var m = PM.managers[mid];
      if (m.title.toLowerCase().indexOf(q) > -1)
        out.push({ kind: "manager", manager: mid, label: m.title, expl: "Open the " + m.title + " manager." });
    });
    // destinations
    PM.destinations.forEach(function (d) {
      if (d.title.toLowerCase().indexOf(q) > -1 || d.purpose.toLowerCase().indexOf(q) > -1)
        out.push({ kind: "destination", cat: d.target.split(".")[0], sub: d.target.split(".")[1], label: d.title, expl: d.purpose });
    });
    return out.slice(0, 24);
  };

  /* ---------- HELPERS ---------- */
  PM.catById = function (id) { return PM_DEMO.catById[id]; };
  PM.subById = function (id) { return PM_DEMO.subById[id]; };
  PM.categories = PM_DEMO.categories;
  PM.managers = PM_DEMO.managers;
  PM.destinations = PM_DEMO.destinations;
  PM.settingsBySub = PM_DEMO.settingsBySub;

  PM.el = function (tag, cls, attrs, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) {
      if (k === "dataset") for (var d in attrs.dataset) e.dataset[d] = attrs.dataset[d];
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  };
  PM.svg = function (name, size) {
    var s = size || 18;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (PM_ICONS[name] || "") + '</svg>';
  };

  /* ---------- EXPOSURE/STATE LABELS (humanized, no raw enums) ---------- */
  PM.stateLabel = function (st) {
    return ({
      default:"Default", recommended:"Recommended", inherited:"Inherited", auto:"Auto",
      "not-configured":"Not configured", managed:"Managed", custom:"Custom",
      unavailable:"Unavailable", effective:"Effective differs"
    })[st] || st;
  };
  PM.exposureLabel = function (ex) {
    return ({
      standard:"Standard", advanced:"Advanced", expert:"Expert", managed:"Managed",
      diagnostic:"Diagnostic", unavailable:"Unavailable"
    })[ex] || ex;
  };
  PM.kindChip = function (kind) {
    return ({
      bad:"bad", warn:"warn", ok:"ok", info:"info"
    })[kind] || "neutral";
  };

  /* ---------- INIT FROM HUB BRIDGE + LOCAL PREFS ---------- */
  PM.init = function () {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem("pm-glm-settings") || "{}"); } catch (e ) {}
    var s = Object.assign({}, PM_DEMO.initialState, saved);
    PM.applyTheme(s.theme);
    PM.applyReducedMotion(s.reducedMotion);
    PM.applyDensity(s.density);
    // shell state applied after render by each concept; store intent
    PM.state.rail = s.rail; PM.state.chat = s.chat;
    // listen to the bridge for test-width (ConceptHub page role)
    window.addEventListener("message", function (event) {
      var m = event.data;
      if (!m || m.source !== "pm-concept-hub" || m.type !== "pm-concept-state") return;
      if (m.state && typeof m.state.testWidth === "number") {
        PM._testWidth = m.state.testWidth;
      }
    });
    // keyboard: ⌘K / Ctrl+K focuses search
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        var s = document.querySelector('[data-search-input]');
        if (s) { s.focus(); s.select && s.select(); }
      }
      if (e.key === "Escape") {
        var pop = document.querySelector("[data-popover]");
        if (pop) { pop.remove(); }
      }
    });
  };
  PM.persist = function () {
    try { localStorage.setItem("pm-glm-settings", JSON.stringify({
      theme: PM.state.theme, reducedMotion: PM.state.reducedMotion,
      density: PM.state.density, rail: PM.state.rail, chat: PM.state.chat
    })); } catch (e ) {}
  };
})();
