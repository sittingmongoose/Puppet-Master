/* ============================================================================
   Concept 07 — Compendium Workspace (kimi-k3)
   Home (search + browse-by-area + recent changes) plus a first-class,
   faceted, virtualized ALL SETTINGS compendium of the full 828-row
   inventory. Domain pages combine overview + key settings + related
   managers. Managers render as integrated list/detail workspaces.
   Motion metaphor: panel cross-fade; facet drawer slides (narrow);
   detail panes push. Vanilla ES5 IIFE; no frameworks; no emoji.
   ========================================================================== */
(function () {
  "use strict";

  if (!window.PM_V2_INVENTORY || !window.PM_V2_REGISTRY || !window.PM_V2_STORE ||
      !window.PM_V2_SEARCH || !window.PM_V2_OBJECTS || !window.PM_CORE_DATA) {
    return;
  }

  var INV = window.PM_V2_INVENTORY;
  var REG = window.PM_V2_REGISTRY;
  var CORE = window.PM_CORE_DATA;
  var OBJS = window.PM_V2_OBJECTS;
  var store = window.PM_V2_STORE.for("concept-07");

  var searchIndex = null;
  try {
    searchIndex = window.PM_V2_SEARCH.buildIndex({
      inventory: INV,
      registry: REG,
      coreData: CORE,
      objects: OBJS.searchObjects ? OBJS.searchObjects() : [],
      workflows: OBJS.workflows ? OBJS.workflows() : [],
      diagnostics: OBJS.diagnostics ? OBJS.diagnostics() : [],
      help: OBJS.help ? OBJS.help() : []
    });
  } catch (e) { searchIndex = null; }

  var searchSession = searchIndex ? window.PM_V2_SEARCH.createSession(searchIndex, { limit: 12 }) : null;
  var searchSessionAll = null; // lazily built with a higher cap for "view all"

  var copyEngine = null;
  try {
    if (window.PM_V2_COPY && window.PM_V2_COPY.CopyEngine) {
      copyEngine = new window.PM_V2_COPY.CopyEngine(store, INV, REG);
    }
  } catch (e) { copyEngine = null; }

  /* ---------- inventory flattening ---------------------------------------- */
  var SET_LIST = [];
  var SET_BY_ID = {};
  (function () {
    Object.keys(INV.settings).forEach(function (id) {
      var s = INV.settings[id];
      SET_BY_ID[id] = s;
      SET_LIST.push(s);
    });
    SET_LIST.sort(function (a, b) {
      var d = String(a.domain).localeCompare(String(b.domain));
      if (d) return d;
      return String(a.label).localeCompare(String(b.label));
    });
  })();

  var SUBGROUP_TITLES = {};
  var CATEGORY_BY_ID = {};
  (function () {
    (INV.categories || []).forEach(function (c) {
      CATEGORY_BY_ID[c.id] = c;
      (c.subgroups || []).forEach(function (g) { SUBGROUP_TITLES[g.id] = g.title; });
    });
  })();

  var DOMAIN_LIST = (REG.DOMAINS || []).slice();
  var DOMAIN_BY_ID = {};
  DOMAIN_LIST.forEach(function (d) { DOMAIN_BY_ID[d.id] = d; });

  var MANAGER_BY_ID = {};
  (REG.MANAGERS || []).forEach(function (m) { MANAGER_BY_ID[m.id] = m; });

  var OBJECT_ROSTERS = {};
  try { OBJECT_ROSTERS = OBJS.objects() || {}; } catch (e) { OBJECT_ROSTERS = {}; }

  /* distinct facet values observed in the real inventory */
  function distinct(field) {
    var seen = {}, out = [];
    SET_LIST.forEach(function (s) {
      var v = s[field];
      if (v == null || v === "") return;
      v = String(v);
      if (!seen[v]) { seen[v] = true; out.push(v); }
    });
    out.sort();
    return out;
  }
  var EXPOSURES = distinct("exposure");
  var STATES = ["default", "custom", "managed", "unavailable"];
  var TYPES = distinct("type");

  /* ---------- small helpers ------------------------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function btn(cls, text) {
    var b = el("button", cls, text);
    b.type = "button";
    return b;
  }
  function humanize(id) {
    return String(id == null ? "" : id).replace(/[-_.\/]+/g, " ").replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }
  function fmtValue(v) {
    if (v == null) return "—";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (typeof v === "object") { try { return JSON.stringify(v); } catch (e) { return String(v); } }
    return String(v);
  }
  function subgroupTitle(id) {
    return SUBGROUP_TITLES[id] || humanize(String(id || "").split(".").pop());
  }
  function settingPath(s) {
    var d = DOMAIN_BY_ID[s.domain];
    return (d ? d.title : humanize(s.domain)) + " › " + subgroupTitle(s.subgroup);
  }
  function domainSettings(domainId) {
    return SET_LIST.filter(function (s) { return s.domain === domainId; });
  }
  function effectiveValue(s) {
    return store.value(s.id, s.value != null ? s.value : s.default);
  }
  function effectiveState(s) {
    if (s.state === "managed" || s.state === "unavailable") return s.state;
    return store.overrideInfo(s.id) ? "custom" : (s.state || "default");
  }

  /* ---------- SVG icons (stroke, currentColor; registry icon names) -------- */
  var ICON_PATHS = {
    brain: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M7 7l10 10M17 7 7 17"/>',
    database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 19c1.2-3 3.6-4.5 6.5-4.5s5.3 1.5 6.5 4.5M16 5a3.5 3.5 0 0 1 0 6.5M17.5 14.8c2 .5 3.5 1.9 4.2 4.2"/>',
    checklist: '<path d="m4 6 1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9"/>',
    steering: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 4v5.5M5 14l4.5-1M19 14l-4.5-1"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    palette: '<circle cx="12" cy="12" r="8.5"/><circle cx="8.5" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/><path d="M12 20.5c-1.5-2 .5-3.5 2-4s3.5-.5 4.5-2"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    "check-spelling": '<path d="M4 15 9 5l5 10M5.8 11.5h6.4M14 19l2.5 2.5L21 17"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
    folder: '<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>',
    language: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5z"/>',
    format: '<path d="M5 5h14M5 10h9M5 15h14M5 20h9"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.6 4.7L4 16.1V20h3.9l4.9-4.9a4 4 0 0 0 4.7-5.6L14 13l-3-3z"/>',
    beaker: '<path d="M9 3h6M10 3v5.5L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8.5V3"/><path d="M7 14h10"/>',
    box: '<path d="M4 6.5 12 2l8 4.5v9L12 20l-8-4.5z"/><path d="m4 6.5 8 4.5 8-4.5M12 11v9"/>',
    command: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/>',
    puzzle: '<path d="M9 4h6v4a2 2 0 1 0 0 4h0v4h-4a2 2 0 1 1 0-4H9V8H5v4a2 2 0 1 1 0 4v0h4z"/>',
    plug: '<path d="M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0z"/><path d="M12 17v4"/>',
    mortarboard: '<path d="m2 9 10-4 10 4-10 4z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5"/>',
    stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
    "hard-drive": '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 14h.01M11 14h.01M3 12h18"/>',
    safe: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 9v3l2 2"/>',
    recycle: '<path d="M4 10a8 8 0 0 1 14-4l2 2M20 4v4h-4M20 14a8 8 0 0 1-14 4l-2-2M4 20v-4h4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4"/>',
    broom: '<path d="M14 3l7 7M13 11l-6.5 6.5M4 21c3 0 5.5-.8 7.5-2.5L9 12c-2.5 2-4.5 5-5 9z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5M3 18l9 5 9-5"/>',
    branch: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 8.5v7M18 10.5c0 4-4 4.5-8 5"/>',
    "play-circle": '<circle cx="12" cy="12" r="8.5"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
    home: '<path d="m4 11 8-7 8 7v8a2 2 0 0 1-2 2h-4v-6h-4v6H6a2 2 0 0 1-2-2z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h14"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    alert: '<path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>',
    clockback: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2M4 5v4h4"/>'
  };
  function icon(name, size) {
    var svg = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"' +
      (size ? ' style="inline-size:' + size + 'px;block-size:' + size + 'px"' : "") + ">" +
      (ICON_PATHS[name] || ICON_PATHS.box) + "</svg>";
    var span = document.createElement("span");
    span.innerHTML = svg;
    return span.firstChild;
  }
  /* icon set into a small raised tile with hairline + token depth */
  function iconTile(name, size) {
    var t = el("span", "cdw-tile");
    t.appendChild(icon(name, size || 18));
    return t;
  }
  /* count chip: tabular numerals + quiet label */
  function countChip(n, label, zero) {
    var c = el("span", "cdw-chip");
    if (zero) c.setAttribute("data-zero", "true");
    c.appendChild(el("b", null, String(n)));
    c.appendChild(document.createTextNode(label));
    return c;
  }

  /* ---------- toasts -------------------------------------------------------- */
  var toastHost = null;
  function toast(text) {
    if (!toastHost) return;
    var t = el("div", "cdw-toast", text);
    t.setAttribute("role", "status");
    toastHost.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3600);
  }

  /* ---------- locate / highlight ------------------------------------------- */
  function locateSoon(selector, scope) {
    setTimeout(function () {
      var node = (scope || document).querySelector(selector);
      if (!node) return;
      try { node.scrollIntoView({ block: "center" }); } catch (e) { node.scrollIntoView(); }
      try { node.focus({ preventScroll: true }); } catch (e) { /* noop */ }
      node.classList.add("pmv2-locate");
      setTimeout(function () { node.classList.remove("pmv2-locate"); }, 2400);
    }, 40);
  }

  /* ---------- routes -------------------------------------------------------- */
  var route = { view: "home" };
  var backStack = []; // [{route, label}]
  var managerCache = {}; // managerId -> {subpage, objectId} remembered per visit
  var compState = { domain: null, exposure: null, state: null, type: null, filter: "", selected: null };
  var copyState = { categories: [] };

  function routeLabel(r) {
    if (!r) return "Settings Home";
    if (r.view === "home") return "Settings Home";
    if (r.view === "compendium") return "All Settings";
    if (r.view === "copy") return "Copy Settings";
    if (r.view === "domain") return DOMAIN_BY_ID[r.domainId] ? DOMAIN_BY_ID[r.domainId].title : "Area";
    if (r.view === "manager") return MANAGER_BY_ID[r.managerId] ? MANAGER_BY_ID[r.managerId].title : "Manager";
    if (r.view === "deferred") return r.title || "Owned elsewhere";
    return "Settings";
  }

  function go(r, opts) {
    opts = opts || {};
    if (!opts.noPush) backStack.push({ route: route, label: routeLabel(route) });
    route = r;
    renderAll(opts);
  }

  function goBack() {
    var prev = backStack.pop();
    if (!prev) { renderAll({ back: true }); return; }
    route = prev.route;
    renderAll({ back: true });
    maybeRestoreSearch();
  }

  /* ---------- chrome -------------------------------------------------------- */
  var rootEl, backBtn, backLabel, crumbsEl, searchInput, resultsEl, navEl, mainEl,
      contextEl, arriveEl, menuBtn, navToggle;

  function buildChrome() {
    rootEl = document.getElementById("cdw-root");
    if (!rootEl) return false;
    rootEl.innerHTML = "";

    var head = el("header", "cdw-head");
    navToggle = btn("pm-btn cdw-navtoggle");
    navToggle.appendChild(icon("filter"));
    navToggle.setAttribute("aria-label", "Browse settings areas");
    navToggle.title = "Browse";
    navToggle.addEventListener("click", function () {
      if (navEl.hasAttribute("hidden")) navEl.removeAttribute("hidden");
      else navEl.setAttribute("hidden", "");
    });
    head.appendChild(navToggle);

    backBtn = btn("cdw-back");
    backBtn.appendChild(icon("back"));
    backLabel = el("span", null, "Back");
    backBtn.appendChild(backLabel);
    backBtn.setAttribute("hidden", "");
    backBtn.addEventListener("click", goBack);
    head.appendChild(backBtn);

    crumbsEl = el("nav", "cdw-crumbs");
    crumbsEl.setAttribute("aria-label", "Breadcrumb");
    head.appendChild(crumbsEl);

    var searchwrap = el("div", "cdw-searchwrap");
    var sbox = el("div", "cdw-search");
    sbox.appendChild(icon("search"));
    searchInput = document.createElement("input");
    searchInput.id = "pmv2-search";
    searchInput.type = "search";
    searchInput.placeholder = "Search all 828 settings, managers, objects…";
    searchInput.setAttribute("aria-label", "Search settings");
    searchInput.setAttribute("autocomplete", "off");
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.setAttribute("aria-controls", "pmv2-results");
    sbox.appendChild(searchInput);
    var kbd = el("kbd", null, "/");
    sbox.appendChild(kbd);
    searchwrap.appendChild(sbox);
    resultsEl = el("div", "cdw-results pmv2-scroll");
    resultsEl.id = "pmv2-results";
    resultsEl.setAttribute("role", "listbox");
    resultsEl.setAttribute("hidden", "");
    searchwrap.appendChild(resultsEl);
    head.appendChild(searchwrap);

    menuBtn = btn("pm-btn cdw-close");
    menuBtn.appendChild(icon("dots"));
    menuBtn.setAttribute("aria-label", "Settings menu");
    menuBtn.title = "More actions";
    menuBtn.addEventListener("click", openOverflowMenu);
    head.appendChild(menuBtn);

    var closeBtn = btn("pm-btn cdw-close", "Close");
    closeBtn.addEventListener("click", function () {
      toast("Demo: Settings stays mounted here; in the app this closes the Settings surface.");
    });
    head.appendChild(closeBtn);

    rootEl.appendChild(head);

    arriveEl = el("div", "cdw-arrive");
    arriveEl.setAttribute("hidden", "");
    rootEl.appendChild(arriveEl);

    var body = el("div", "cdw-body");
    navEl = el("nav", "cdw-nav pmv2-scroll");
    navEl.setAttribute("aria-label", "Settings areas");
    body.appendChild(navEl);
    mainEl = el("div", "cdw-main pmv2-scroll");
    body.appendChild(mainEl);
    contextEl = el("aside", "cdw-context pmv2-scroll");
    contextEl.setAttribute("aria-label", "Context");
    body.appendChild(contextEl);
    rootEl.appendChild(body);

    toastHost = el("div", "cdw-toasts");
    rootEl.appendChild(toastHost);
    return true;
  }

  function openOverflowMenu() {
    if (!window.PMV2Menu || !window.PMV2Menu.open) return;
    var rp = store.restorePoints().length;
    var rc = store.receipts().length;
    window.PMV2Menu.open(menuBtn, [
      { label: "Settings Home", action: function () { go({ view: "home" }); } },
      { label: "All Settings Compendium", hint: "828 rows", action: function () { go({ view: "compendium" }); } },
      { label: "Copy Settings From Another Project…", action: function () { go({ view: "copy" }); } },
      { sep: true },
      { label: "Restore points", hint: String(rp), disabled: rp === 0,
        action: function () { go({ view: "manager", managerId: "backup" }); } },
      { label: "Receipts", hint: String(rc), disabled: rc === 0,
        action: function () { go({ view: "manager", managerId: "lifecycle" }); } },
      { sep: true },
      { label: "Close Settings", action: function () {
        toast("Demo: Settings stays mounted here; in the app this closes the Settings surface.");
      } }
    ]);
  }

  function renderChrome() {
    var hasBack = backStack.length > 0;
    if (hasBack) {
      backBtn.removeAttribute("hidden");
      backLabel.textContent = "Back to " + backStack[backStack.length - 1].label;
    } else {
      backBtn.setAttribute("hidden", "");
    }
    crumbsEl.innerHTML = "";
    var parts = [{ label: "Settings", r: { view: "home" } }];
    if (route.view === "compendium") parts.push({ label: "All Settings", here: true });
    else if (route.view === "copy") parts.push({ label: "Copy Settings", here: true });
    else if (route.view === "domain") {
      parts.push({ label: routeLabel(route), here: true });
    } else if (route.view === "manager") {
      var m = MANAGER_BY_ID[route.managerId];
      if (m) {
        parts.push({ label: DOMAIN_BY_ID[m.domain] ? DOMAIN_BY_ID[m.domain].title : m.domain,
                     r: { view: "domain", domainId: m.domain } });
        parts.push({ label: m.title, here: true });
      }
    } else if (route.view === "deferred") {
      parts.push({ label: "System & Advanced", r: { view: "domain", domainId: "system" } });
      parts.push({ label: routeLabel(route), here: true });
    } else {
      parts[0].here = true;
    }
    parts.forEach(function (p, i) {
      if (i > 0) crumbsEl.appendChild(el("span", "cdw-crumb-sep", "›"));
      if (p.here || !p.r) {
        var h = el("span", "cdw-crumb-here", p.label);
        crumbsEl.appendChild(h);
      } else {
        var b = btn(null, p.label);
        b.addEventListener("click", function () { go(p.r); });
        crumbsEl.appendChild(b);
      }
    });
    crumbsEl.setAttribute("data-domain-id",
      route.view === "domain" ? route.domainId :
      route.view === "manager" && MANAGER_BY_ID[route.managerId] ? MANAGER_BY_ID[route.managerId].domain : "");
  }

  function renderNav() {
    navEl.innerHTML = "";
    function navItem(label, iconName, count, active, fn, hook) {
      var b = btn("cdw-nav-item");
      b.appendChild(icon(iconName));
      b.appendChild(el("span", null, label));
      if (count != null) b.appendChild(el("span", "cdw-nav-count", String(count)));
      if (active) b.setAttribute("aria-current", "true");
      if (hook) b.setAttribute(hook.k, hook.v);
      b.addEventListener("click", function () {
        fn();
        if (window.matchMedia && navEl.hasAttribute("hidden") === false) { /* keep open on wide */ }
      });
      navEl.appendChild(b);
      return b;
    }
    navItem("Home", "home", null, route.view === "home", function () { go({ view: "home" }); });
    navItem("All Settings", "book", SET_LIST.length, route.view === "compendium",
      function () { go({ view: "compendium" }); });
    navEl.appendChild(el("div", "cdw-nav-h", "Browse by area"));
    DOMAIN_LIST.forEach(function (d) {
      var n = domainSettings(d.id).length;
      var active = route.view === "domain" && route.domainId === d.id;
      if (route.view === "manager" && MANAGER_BY_ID[route.managerId] &&
          MANAGER_BY_ID[route.managerId].domain === d.id) active = true;
      navItem(d.title, domainIcon(d.id), n, active,
        function () { go({ view: "domain", domainId: d.id }); },
        { k: "data-domain-id", v: d.id });
    });
    var foot = el("div", "cdw-nav-foot");
    var proj = store.currentProject();
    foot.appendChild(el("div", null, "Project: " + (proj ? proj.name : "—")));
    var copyBtn = btn("cdw-nav-item", null);
    copyBtn.style.marginTop = "6px";
    copyBtn.appendChild(icon("copy"));
    copyBtn.appendChild(el("span", null, "Copy Settings From Another Project"));
    if (route.view === "copy") copyBtn.setAttribute("aria-current", "true");
    copyBtn.addEventListener("click", function () { go({ view: "copy" }); });
    foot.appendChild(copyBtn);
    navEl.appendChild(foot);
  }

  var DOMAIN_ICONS = {
    general: "palette", ai: "brain", safety: "shield", code: "terminal",
    memory: "database", planning: "checklist", branching: "branch", media: "image",
    web: "globe", personas: "person", extensions: "puzzle", system: "monitor"
  };
  function domainIcon(id) { return DOMAIN_ICONS[id] || "box"; }

  /* ---------- arrival strip (exact search landing) -------------------------- */
  function showArrival(entry) {
    arriveEl.innerHTML = "";
    arriveEl.appendChild(icon("search"));
    arriveEl.appendChild(el("span", null, "You arrived at "));
    arriveEl.appendChild(el("strong", null, entry.label));
    arriveEl.appendChild(el("span", null, " from search"));
    if (entry.path) arriveEl.appendChild(el("span", "cdw-arrive-path", " · " + entry.path));
    var dis = btn("pm-btn", "Dismiss");
    dis.setAttribute("data-variant", "quiet");
    dis.addEventListener("click", function () { arriveEl.setAttribute("hidden", ""); });
    arriveEl.appendChild(dis);
    arriveEl.removeAttribute("hidden");
  }
  function hideArrival() { arriveEl.setAttribute("hidden", ""); }

  /* ---------- universal search ---------------------------------------------- */
  var lastQuery = "";
  var lastResults = [];
  var lastMeta = null;
  var activeHit = -1;
  var showAllResults = false;

  var TYPE_ORDER = [
    "setting", "manager", "managed_object", "action", "setup_or_repair_workflow",
    "diagnostic_or_read_only_status", "unavailable_capability", "intentional_help_result"
  ];
  var TYPE_LABELS = {
    setting: "Settings",
    manager: "Managers",
    managed_object: "Managed objects",
    action: "Actions",
    setup_or_repair_workflow: "Setup & repair",
    diagnostic_or_read_only_status: "Diagnostics & status",
    unavailable_capability: "Unavailable",
    intentional_help_result: "Help"
  };
  function typeLabel(t) { return TYPE_LABELS[t] || humanize(t); }

  function markText(label, query) {
    var frag = document.createDocumentFragment();
    var q = String(query || "").trim();
    if (!q) { frag.appendChild(document.createTextNode(label)); return frag; }
    var lower = label.toLowerCase();
    var ql = q.toLowerCase();
    var i = lower.indexOf(ql);
    if (i < 0) {
      // try word-by-word
      var words = ql.split(/\s+/).filter(Boolean);
      var pos = 0, cut = null;
      for (var w = 0; w < words.length; w++) {
        var j = lower.indexOf(words[w], pos);
        if (j >= 0) { cut = [j, words[w].length]; break; }
      }
      if (!cut) { frag.appendChild(document.createTextNode(label)); return frag; }
      i = cut[0]; q = label.substr(i, cut[1]);
    }
    if (i > 0) frag.appendChild(document.createTextNode(label.slice(0, i)));
    var mk = el("mark", null, label.substr(i, q.length));
    frag.appendChild(mk);
    frag.appendChild(document.createTextNode(label.slice(i + q.length)));
    return frag;
  }

  function closeDropdown() {
    resultsEl.setAttribute("hidden", "");
    resultsEl.innerHTML = "";
    searchInput.setAttribute("aria-expanded", "false");
    activeHit = -1;
  }

  function renderResults(results, meta, query, selectId) {
    lastResults = results || [];
    lastMeta = meta || null;
    resultsEl.innerHTML = "";
    if (!query) { closeDropdown(); return; }
    if (!lastResults.length) {
      var empty = el("div", "cdw-hit-group", "No matches for “" + query + "”. Try a different term.");
      resultsEl.appendChild(empty);
    } else {
      var byType = {};
      lastResults.forEach(function (r) {
        if (!byType[r.type]) byType[r.type] = [];
        byType[r.type].push(r);
      });
      var keys = Object.keys(byType).sort(function (a, b) {
        var ia = TYPE_ORDER.indexOf(a), ib = TYPE_ORDER.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      keys.forEach(function (t) {
        resultsEl.appendChild(el("div", "cdw-hit-group", typeLabel(t)));
        byType[t].forEach(function (r) {
          var row = btn("cdw-hit");
          row.setAttribute("role", "option");
          row.setAttribute("data-result-id", r.immutableResultId);
          if (selectId && r.immutableResultId === selectId) row.classList.add("is-active");
          var lab = el("div", "cdw-hit-label");
          lab.appendChild(markText(r.label, query));
          row.appendChild(lab);
          row.appendChild(el("div", "cdw-hit-path", r.path || ""));
          var chip = el("span", "pm-badge cdw-hit-kind", typeLabel(r.type));
          row.appendChild(chip);
          if (r.availability) {
            row.appendChild(el("div", "cdw-hit-avail",
              typeof r.availability === "string" ? r.availability : "Currently unavailable"));
          }
          row.addEventListener("click", function () { selectResult(r.immutableResultId); });
          resultsEl.appendChild(row);
        });
      });
      if (meta && meta.bounded && meta.total > lastResults.length) {
        var more = btn("cdw-hit-more", "View all " + meta.total + " results");
        more.addEventListener("click", function () {
          showAllResults = true;
          runSearch(lastQuery);
        });
        resultsEl.appendChild(more);
      }
    }
    resultsEl.removeAttribute("hidden");
    searchInput.setAttribute("aria-expanded", "true");
    activeHit = -1;
  }

  function runSearch(q, selectId) {
    lastQuery = q;
    if (!searchSession || !q || !q.trim()) { closeDropdown(); return; }
    var sess = searchSession;
    if (showAllResults) {
      if (!searchSessionAll) {
        searchSessionAll = window.PM_V2_SEARCH.createSession(searchIndex, { limit: 60 });
      }
      sess = searchSessionAll;
    }
    sess.query(q, function (results, meta) {
      if (q !== lastQuery) return; // stale
      renderResults(results, meta, q, selectId);
    });
  }

  function selectResult(immutableId) {
    var entry = null;
    try { entry = window.PM_V2_SEARCH.resolve(searchIndex, immutableId); } catch (e) { entry = null; }
    if (!entry) { toast("That result could not be resolved."); return; }
    store.saveSearchState(lastQuery, immutableId);
    closeDropdown();
    showArrival(entry);
    routeToEntry(entry);
  }

  function routeToEntry(entry) {
    var d = entry.destination || {};
    var rowId = d.row || entry.settingId || null;
    if (d.manager && MANAGER_BY_ID[d.manager]) {
      var mr = { view: "manager", managerId: d.manager,
                 objectId: d.object || null, section: d.section || d.page || null,
                 row: rowId };
      go(mr, { label: routeLabel(route) });
      if (rowId) locateSoon('[data-setting-id="' + cssEscape(rowId) + '"]', mainEl);
      else if (d.object) locateSoon('[data-object-id="' + cssEscape(d.object) + '"]', mainEl);
      return;
    }
    if (d.domain && DOMAIN_BY_ID[d.domain]) {
      go({ view: "domain", domainId: d.domain, section: d.section || null, row: rowId });
      if (rowId) locateSoon('[data-setting-id="' + cssEscape(rowId) + '"]', mainEl);
      return;
    }
    if (rowId && SET_BY_ID[rowId]) {
      var s = SET_BY_ID[rowId];
      compState.selected = rowId;
      go({ view: "compendium", row: rowId });
      locateSoon('[data-setting-id="' + cssEscape(rowId) + '"]', mainEl);
      return;
    }
    go({ view: "home" });
  }

  function cssEscape(s) {
    return String(s).replace(/(["\\])/g, "\\$1");
  }

  /* Back from an exact search landing restores the query dropdown. */
  function maybeRestoreSearch() {
    var st = store.searchState();
    if (!st || !st.query) return;
    store.saveSearchState("", null);
    searchInput.value = st.query;
    showAllResults = false;
    runSearch(st.query, st.resultId);
    try { searchInput.focus(); } catch (e) { /* noop */ }
  }

  function wireSearch() {
    searchInput.addEventListener("input", function () {
      showAllResults = false;
      runSearch(searchInput.value);
    });
    searchInput.addEventListener("focus", function () {
      if (searchInput.value.trim()) runSearch(searchInput.value);
    });
    searchInput.addEventListener("keydown", function (ev) {
      var hits = $all(".cdw-hit", resultsEl);
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        if (!hits.length) return;
        ev.preventDefault();
        activeHit += ev.key === "ArrowDown" ? 1 : -1;
        if (activeHit < 0) activeHit = 0;
        if (activeHit >= hits.length) activeHit = hits.length - 1;
        hits.forEach(function (h, i) {
          h.classList.toggle("is-active", i === activeHit);
          if (i === activeHit) {
            try { h.scrollIntoView({ block: "nearest" }); } catch (e) { /* noop */ }
          }
        });
      } else if (ev.key === "Enter") {
        if (activeHit >= 0 && hits[activeHit]) {
          ev.preventDefault();
          selectResult(hits[activeHit].getAttribute("data-result-id"));
        } else if (hits.length) {
          ev.preventDefault();
          selectResult(hits[0].getAttribute("data-result-id"));
        }
      } else if (ev.key === "Escape") {
        if (!resultsEl.hasAttribute("hidden")) {
          ev.stopPropagation();
          closeDropdown();
        }
      }
    });
    document.addEventListener("click", function (ev) {
      if (!resultsEl.hasAttribute("hidden") &&
          !resultsEl.contains(ev.target) && ev.target !== searchInput &&
          !searchInput.parentNode.contains(ev.target)) {
        closeDropdown();
      }
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "/" && document.activeElement !== searchInput &&
          !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || "")) {
        ev.preventDefault();
        try { searchInput.focus(); searchInput.select(); } catch (e) { /* noop */ }
      }
    });
  }

  /* ---------- setting row + controls ---------------------------------------- */
  function stateBadge(stateVal) {
    var b = el("span", "pm-badge", stateVal === "custom" ? "Customized" :
      stateVal.charAt(0).toUpperCase() + stateVal.slice(1));
    b.setAttribute("data-kind", "state");
    b.setAttribute("data-state", stateVal);
    return b;
  }

  function settingControl(s, disabled) {
    var wrap = el("span", "pm-row-control");
    var val = effectiveValue(s);
    var type = s.type || (typeof s.default);
    var opts = s.options;
    function commit(v) { store.setValue(s.id, v); }
    if (type === "boolean" || typeof val === "boolean") {
      var sw = btn("pm-switch");
      sw.setAttribute("role", "switch");
      sw.setAttribute("aria-checked", val ? "true" : "false");
      sw.setAttribute("aria-label", s.label);
      if (disabled) sw.disabled = true;
      sw.addEventListener("click", function () { commit(!(effectiveValue(s) === true)); });
      wrap.appendChild(sw);
    } else if (opts && opts.length) {
      var selwrap = el("span", "pm-select");
      var sel = document.createElement("select");
      sel.setAttribute("aria-label", s.label);
      opts.forEach(function (o) {
        var opt = document.createElement("option");
        var ov = (o && typeof o === "object") ? (o.value != null ? o.value : o.id) : o;
        var ol = (o && typeof o === "object") ? (o.label || humanize(ov)) : humanize(o);
        opt.value = String(ov);
        opt.textContent = ol;
        if (String(ov) === String(val)) opt.selected = true;
        sel.appendChild(opt);
      });
      if (disabled) sel.disabled = true;
      sel.addEventListener("change", function () { commit(sel.value); });
      selwrap.appendChild(sel);
      wrap.appendChild(selwrap);
    } else if (type === "number" || typeof val === "number") {
      var st = el("span", "pm-stepper");
      var minus = btn(null, "−");
      minus.setAttribute("aria-label", "Decrease " + s.label);
      var inp = document.createElement("input");
      inp.type = "number";
      inp.value = String(val);
      inp.setAttribute("aria-label", s.label);
      var plus = btn(null, "+");
      plus.setAttribute("aria-label", "Increase " + s.label);
      if (disabled) { minus.disabled = true; plus.disabled = true; inp.disabled = true; }
      minus.addEventListener("click", function () { commit((Number(inp.value) || 0) - 1); });
      plus.addEventListener("click", function () { commit((Number(inp.value) || 0) + 1); });
      inp.addEventListener("change", function () { commit(Number(inp.value) || 0); });
      st.appendChild(minus); st.appendChild(inp); st.appendChild(plus);
      wrap.appendChild(st);
    } else if (type === "action") {
      var act = btn("pm-btn", "Run");
      if (disabled) act.disabled = true;
      act.addEventListener("click", function () {
        var op = store.begin({ kind: "setting-action", title: s.label,
          phases: [{ name: "Run" }], determinate: false });
        store.completePhase(op.id);
        store.finish(op.id, "done");
        toast("“" + s.label + "” completed.");
      });
      wrap.appendChild(act);
    } else {
      var t = document.createElement("input");
      t.type = "text";
      t.className = "pm-input";
      t.value = val == null ? "" : String(val);
      t.setAttribute("aria-label", s.label);
      if (disabled) t.disabled = true;
      t.addEventListener("change", function () { commit(t.value); });
      wrap.appendChild(t);
    }
    return wrap;
  }

  function settingRow(s, opts) {
    opts = opts || {};
    var st = effectiveState(s);
    var disabled = st === "managed" || st === "unavailable";
    var row = el("div", "pm-row");
    row.setAttribute("data-state", st);
    row.setAttribute("data-exposure", s.exposure || "standard");
    row.setAttribute("data-setting-id", s.id);
    row.tabIndex = -1;
    var main = el("div", "pm-row-main");
    var lab = el("div", "pm-row-label");
    lab.appendChild(el("span", null, s.label));
    lab.appendChild(stateBadge(st));
    if (s.exposure && s.exposure !== "standard") {
      var eb = el("span", "pm-badge", humanize(s.exposure));
      eb.setAttribute("data-kind", "exposure");
      eb.setAttribute("data-exposure", s.exposure);
      lab.appendChild(eb);
    }
    main.appendChild(lab);
    if (s.desc) main.appendChild(el("div", "pm-row-desc", s.desc));
    row.appendChild(main);
    row.appendChild(settingControl(s, disabled));
    if (disabled) {
      var reason = el("div", "pm-row-reason",
        st === "managed" ? "Managed by organization policy. You can view but not change this."
                         : "Unavailable for the current configuration.");
      row.appendChild(reason);
    } else if (store.overrideInfo(s.id)) {
      var src = el("div", "pm-row-src");
      var info = store.overrideInfo(s.id);
      src.textContent = "Customized for this project · default is " +
        fmtValue(s.value != null ? s.value : s.default) +
        (info && info.by ? " · set by " + String(info.by).replace(/^copy:.*/, "a project copy") : "");
      row.appendChild(src);
      var reset = btn("pm-btn", "Reset");
      reset.setAttribute("data-variant", "quiet");
      reset.addEventListener("click", function () {
        store.resetValue(s.id);
        toast("“" + s.label + "” reset to its default.");
      });
      row.appendChild(reset);
    }
    return row;
  }

  /* Details / “Why this value?” disclosure */
  function whyDetails(s) {
    var det = el("details", "pm-accordion");
    var sum = el("summary", null, "Why this value?");
    det.appendChild(sum);
    var body = el("div", "pm-row-desc");
    var bits = [];
    bits.push("Default: " + fmtValue(s.default != null ? s.default : s.value));
    if (s.recommended != null && s.recommended !== s.default) {
      bits.push("Recommended: " + fmtValue(s.recommended));
    }
    bits.push("Source: " + (s.source || "Default"));
    bits.push("Tier: " + (s.tier || "standard") + " · Exposure: " + (s.exposure || "standard"));
    body.textContent = bits.join("  ·  ");
    det.appendChild(body);
    return det;
  }

  /* ---------- Home ----------------------------------------------------------- */
  function renderHome() {
    var pane = el("section", "cdw-pane");
    pane.setAttribute("data-view", "home");

    var proj = store.currentProject() || { name: "Puppet Master", path: "P:/" };
    var hero = el("div", "cdw-home-hero");
    hero.appendChild(el("h1", null, "Settings — " + proj.name));
    hero.appendChild(el("p", null,
      "Every change here applies to the current project (" + proj.path + "). " +
      "Search the full compendium, or browse by area."));
    pane.appendChild(hero);

    var bigSearch = el("div", "cdw-home-search");
    bigSearch.appendChild(icon("search"));
    bigSearch.appendChild(el("span", null, "Search all " + SET_LIST.length + " settings, managers, and objects…"));
    bigSearch.appendChild(el("kbd", null, "/"));
    bigSearch.addEventListener("click", function () {
      try { searchInput.focus(); } catch (e) { /* noop */ }
    });
    pane.appendChild(bigSearch);

    var notices = (CORE.notices || []);
    var critical = notices.filter(function (n) { return n.kind === "attention"; });
    var bannerId = null;
    if (critical.length) {
      var n0 = critical[0];
      bannerId = n0.id;
      var notice = el("div", "pm-notice cdw-banner");
      notice.setAttribute("data-kind", "attention");
      var chip = el("span", "pm-notice-chip", "Needs attention");
      var head = el("span", "pm-notice-head", n0.headline);
      var body = el("div", "pm-notice-body", n0.consequence || "");
      var acts = el("span", "pm-notice-actions");
      var ab = btn("pm-btn", n0.actionLabel || "Review");
      ab.addEventListener("click", function () { routeNotice(n0); });
      acts.appendChild(ab);
      notice.appendChild(chip); notice.appendChild(head);
      notice.appendChild(body); notice.appendChild(acts);
      pane.appendChild(notice);
    }

    /* the banner item never repeats in this list (dedupe by notice id) */
    var attnList = notices.filter(function (n) { return n.id !== bannerId; })
      .slice(0, bannerId ? 3 : 4);
    if (attnList.length) {
      pane.appendChild(sectionHead("Needs attention", plural(attnList.length, "item")));
      var attn = el("div", "cdw-attn");
      attnList.forEach(function (n) {
        var r = btn("cdw-attn-row");
        r.appendChild(icon("alert"));
        var mm = el("span", "cdw-attn-main");
        mm.appendChild(el("span", "cdw-attn-title", n.headline));
        if (n.consequence) mm.appendChild(el("span", "cdw-attn-detail", n.consequence));
        r.appendChild(mm);
        r.appendChild(el("span", "cdw-attn-go", n.actionLabel || "Open"));
        r.addEventListener("click", function () { routeNotice(n); });
        attn.appendChild(r);
      });
      pane.appendChild(attn);
    }

    /* Dominant destination: the compendium (live counts from the store) */
    var ovrCount = store.overrides ? Object.keys(store.overrides()).length : 0;
    var comp = btn("cdw-comp-card");
    comp.appendChild(iconTile("book", 20));
    var cm = el("span", "cdw-area-main");
    cm.appendChild(el("span", "cdw-area-title", "All Settings Compendium"));
    cm.appendChild(el("span", "cdw-area-blurb",
      "The complete long-tail index: every one of the " + SET_LIST.length +
      " settings in this project, faceted by area, exposure, state, and type."));
    var counts = el("span", "cdw-comp-counts");
    counts.appendChild(countChip(SET_LIST.length, "settings", false));
    counts.appendChild(countChip(DOMAIN_LIST.length, "areas", false));
    counts.appendChild(countChip(ovrCount, "customized", ovrCount === 0));
    cm.appendChild(counts);
    comp.appendChild(cm);
    var compGo = el("span", "cdw-comp-go");
    compGo.appendChild(icon("chevron"));
    comp.appendChild(compGo);
    comp.addEventListener("click", function () { go({ view: "compendium" }); });
    pane.appendChild(comp);

    pane.appendChild(sectionHead("Browse by area", plural(DOMAIN_LIST.length, "area")));
    var areas = el("div", "cdw-areas");
    DOMAIN_LIST.forEach(function (d) {
      var a = btn("cdw-area");
      a.setAttribute("data-domain-id", d.id);
      a.appendChild(iconTile(domainIcon(d.id), 16));
      var mm = el("span", "cdw-area-main");
      mm.appendChild(el("span", "cdw-area-title", d.title));
      mm.appendChild(el("span", "cdw-area-blurb", d.blurb || ""));
      var mgrs = REG.managersByDomain ? REG.managersByDomain(d.id) : [];
      mm.appendChild(el("span", "cdw-area-meta",
        plural(domainSettings(d.id).length, "setting") + " · " + plural(mgrs.length, "manager")));
      a.appendChild(mm);
      a.addEventListener("click", function () { go({ view: "domain", domainId: d.id }); });
      areas.appendChild(a);
    });
    pane.appendChild(areas);

    /* Recent changes (from real overrides) + recent visits (fixtures) */
    var ovr = store.overrides();
    var changed = Object.keys(ovr).map(function (id) {
      return { id: id, at: ovr[id].at };
    }).filter(function (x) { return SET_BY_ID[x.id]; })
      .sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); })
      .slice(0, 5);
    var recents = (CORE.recents || []).slice(0, 4);
    if (changed.length || recents.length) {
      pane.appendChild(sectionHead("Recent", changed.length ? "latest changes first" : "recently visited"));
      var rec = el("div", "cdw-recents");
      changed.forEach(function (c) {
        var s = SET_BY_ID[c.id];
        var b = btn("cdw-recent");
        b.appendChild(icon("clockback"));
        b.appendChild(el("span", null, s.label));
        b.appendChild(el("small", null, "Changed · " + settingPath(s)));
        b.addEventListener("click", function () {
          compState.selected = s.id;
          go({ view: "compendium", row: s.id });
          locateSoon('[data-setting-id="' + cssEscape(s.id) + '"]', mainEl);
        });
        rec.appendChild(b);
      });
      recents.forEach(function (r) {
        var b = btn("cdw-recent");
        b.appendChild(icon("clock"));
        b.appendChild(el("span", null, r.label));
        b.appendChild(el("small", null, "Visited"));
        b.addEventListener("click", function () { routeRecent(r); });
        rec.appendChild(b);
      });
      pane.appendChild(rec);
    }
    return pane;
  }

  function routeNotice(n) {
    var map = {
      "notice-filesafe-incomplete": { view: "manager", managerId: "permissions" },
      "notice-no-verifier": { view: "manager", managerId: "model-defaults" },
      "notice-terminal-setup": { view: "manager", managerId: "terminal" },
      "notice-forge-setup": { view: "manager", managerId: "source-control" },
      "notice-compaction-safeguard": { view: "manager", managerId: "context" },
      "notice-quiet-hours": { view: "manager", managerId: "notifications" }
    };
    var r = map[n.id];
    if (r) go(r);
    else go({ view: "home" });
  }

  function routeRecent(r) {
    var t = r.target || {};
    if (t.manager && MANAGER_BY_ID[t.manager]) {
      go({ view: "manager", managerId: t.manager, section: t.tab || null });
      return;
    }
    if (t.setting && SET_BY_ID[t.setting]) {
      var s = SET_BY_ID[t.setting];
      go({ view: "domain", domainId: s.domain, section: t.sub || s.subgroup, row: s.id });
      locateSoon('[data-setting-id="' + cssEscape(s.id) + '"]', mainEl);
      return;
    }
    go({ view: "home" });
  }

  function sectionHead(title, sub) {
    var h = el("h2", "cdw-section-h", title);
    if (sub) h.appendChild(el("small", null, sub));
    return h;
  }

  /* ---------- Domain pages ---------------------------------------------------- */
  var expandedSubgroups = {}; // "domainId:subgroupId" -> true

  function renderDomain(domainId, opts) {
    opts = opts || {};
    var d = DOMAIN_BY_ID[domainId];
    var pane = el("section", "cdw-pane");
    pane.setAttribute("data-domain-id", domainId);
    if (!d) { pane.appendChild(el("p", null, "Unknown area.")); return pane; }

    var sets = domainSettings(domainId);
    var customized = sets.filter(function (s) { return !!store.overrideInfo(s.id); }).length;
    var mgrs = REG.managersByDomain ? REG.managersByDomain(domainId) : [];

    var head = el("div", "cdw-dom-head");
    var h1 = el("h1");
    h1.appendChild(icon(domainIcon(domainId)));
    h1.appendChild(document.createTextNode(d.title));
    head.appendChild(h1);
    head.appendChild(el("p", null, d.blurb || ""));
    var stats = el("div", "cdw-dom-stats");
    stats.appendChild(stat(sets.length, "Settings"));
    stats.appendChild(stat(customized, "Customized"));
    stats.appendChild(stat(mgrs.length, "Managers"));
    head.appendChild(stats);
    pane.appendChild(head);

    /* key settings by subgroup (expandable) */
    var bySub = {};
    sets.forEach(function (s) {
      var k = s.subgroup || "other";
      if (!bySub[k]) bySub[k] = [];
      bySub[k].push(s);
    });
    var subIds = Object.keys(bySub);
    if (subIds.length) {
      pane.appendChild(sectionHead("Settings in this area", plural(sets.length, "setting")));
      var list = el("div", "cdw-subgroups");
      subIds.forEach(function (subId) {
        var rows = bySub[subId];
        var key = domainId + ":" + subId;
        var open = expandedSubgroups[key] || (opts.section && opts.section === subId);
        if (opts.section && opts.section === subId) expandedSubgroups[key] = true;
        var b = btn("cdw-subgroup");
        b.setAttribute("data-section-id", subId);
        b.setAttribute("aria-expanded", open ? "true" : "false");
        var mm = el("span", "cdw-subgroup-main");
        mm.appendChild(el("span", "cdw-subgroup-title", subgroupTitle(subId)));
        mm.appendChild(el("span", "cdw-subgroup-desc", plural(rows.length, "setting")));
        b.appendChild(mm);
        b.appendChild(el("span", "cdw-subgroup-n", String(rows.length)));
        b.appendChild(icon("chevron"));
        list.appendChild(b);
        var group = el("div", "cdw-sgroup");
        group.setAttribute("data-section-id", subId + ":rows");
        if (!open) group.setAttribute("hidden", "");
        else {
          group.appendChild(el("div", "cdw-sgroup-h", subgroupTitle(subId)));
          var cap = 8;
          if (opts.row && rows.some(function (s) { return s.id === opts.row; })) cap = rows.length;
          rows.slice(0, cap).forEach(function (s) {
            group.appendChild(settingRow(s));
            group.appendChild(whyDetails(s));
          });
          if (rows.length > cap) {
            var more = btn("pm-btn cdw-facets-clear", "Open all " + rows.length + " in the Compendium");
            more.addEventListener("click", function () {
              compState.domain = domainId;
              go({ view: "compendium" });
            });
            group.appendChild(more);
          }
        }
        b.addEventListener("click", function () {
          expandedSubgroups[key] = !expandedSubgroups[key];
          renderAll({ keepScroll: true });
        });
        list.appendChild(group);
      });
      pane.appendChild(list);
    }

    /* related managers */
    if (mgrs.length) {
      pane.appendChild(sectionHead("Managers in this area", plural(mgrs.length, "manager")));
      var grid = el("div", "cdw-mgrid");
      mgrs.forEach(function (m) { grid.appendChild(managerCard(m)); });
      pane.appendChild(grid);
    }

    /* deferred-owner shells live under System & Advanced */
    if (domainId === "system" && REG.DEFERRED_OWNERS && REG.DEFERRED_OWNERS.length) {
      pane.appendChild(sectionHead("Owned elsewhere", "insertion points shown for orientation"));
      var dgrid = el("div", "cdw-mgrid");
      REG.DEFERRED_OWNERS.forEach(function (def) {
        var c = btn("cdw-mgr");
        var top = el("span", "cdw-mgr-top");
        top.appendChild(icon("box"));
        top.appendChild(el("span", "cdw-mgr-title", humanize(def.family)));
        top.appendChild(el("span", "cdw-mgr-arch", "Deferred"));
        c.appendChild(top);
        c.appendChild(el("span", "cdw-mgr-sum", "Owned by " + def.owner + ". Opens its insertion point."));
        c.addEventListener("click", function () {
          go({ view: "deferred", deferredId: def.id, title: humanize(def.family) });
        });
        dgrid.appendChild(c);
      });
      pane.appendChild(dgrid);
    }
    return pane;
  }

  function stat(n, label) {
    var s = el("span", "cdw-stat");
    s.appendChild(el("b", null, String(n)));
    s.appendChild(el("span", null, label));
    return s;
  }

  function managerCard(m) {
    var c = btn("cdw-mgr");
    c.setAttribute("data-manager-id", m.id);
    var top = el("span", "cdw-mgr-top");
    top.appendChild(iconTile(m.icon || "box", 15));
    top.appendChild(el("span", "cdw-mgr-title", m.title));
    top.appendChild(el("span", "cdw-mgr-arch", humanize(m.archetype)));
    c.appendChild(top);
    c.appendChild(el("span", "cdw-mgr-sum", m.summary || ""));
    if (m.subpages && m.subpages.length) {
      var subs = el("span", "cdw-mgr-subs");
      m.subpages.slice(0, 4).forEach(function (p) { subs.appendChild(el("span", null, p)); });
      if (m.subpages.length > 4) subs.appendChild(el("span", null, "+" + (m.subpages.length - 4)));
      c.appendChild(subs);
    }
    c.addEventListener("click", function () { go({ view: "manager", managerId: m.id }); });
    return c;
  }

  /* ---------- deferred owner shell ------------------------------------------- */
  function renderDeferred(defId) {
    var def = null;
    (REG.DEFERRED_OWNERS || []).forEach(function (x) { if (x.id === defId) def = x; });
    var pane = el("section", "cdw-pane");
    if (!def) { pane.appendChild(el("p", null, "Unknown area.")); return pane; }
    pane.appendChild(sectionHead(humanize(def.family), "owned elsewhere"));
    var box = el("div", "cdw-deferred");
    box.appendChild(el("strong", null, humanize(def.family)));
    box.appendChild(el("div", null, "Owner: " + def.owner));
    box.appendChild(el("div", null, "Insertion point: " + def.insertion));
    box.appendChild(el("div", null, "Returns to: " + def.returnContract));
    var note = el("p", "pm-muted");
    note.textContent = "This area is owned by " + def.owner +
      "; the demo shows the insertion point only. No state is fabricated here.";
    box.appendChild(note);
    pane.appendChild(box);
    return pane;
  }

  /* ---------- generic virtualized list ---------------------------------------
     items: [{kind:"head"|"row", h:<px>, ...}]; only a ~row window is mounted. */
  function vlist(container, items, renderItem) {
    container.innerHTML = "";
    container.classList.add("cdw-vlist");
    var inner = el("div", "cdw-vlist-inner");
    var offsets = new Array(items.length);
    var y = 0, i;
    for (i = 0; i < items.length; i++) { offsets[i] = y; y += items[i].h; }
    inner.style.height = y + "px";
    container.appendChild(inner);

    var mounted = {}; // index -> node
    function renderWindow() {
      var top = container.scrollTop;
      var h = container.clientHeight || 480;
      var lo = top - 200, hi = top + h + 200;
      var want = {};
      for (var k = 0; k < items.length; k++) {
        var iy = offsets[k], ih = items[k].h;
        if (iy + ih >= lo && iy <= hi) want[k] = true;
        if (iy > hi) break;
      }
      Object.keys(mounted).forEach(function (idx) {
        if (!want[idx]) {
          var n = mounted[idx];
          if (n.parentNode) n.parentNode.removeChild(n);
          delete mounted[idx];
        }
      });
      Object.keys(want).forEach(function (idx) {
        if (mounted[idx]) return;
        var node = renderItem(items[idx], Number(idx));
        node.style.top = offsets[idx] + "px";
        node.style.height = items[idx].h + "px";
        inner.appendChild(node);
        mounted[idx] = node;
      });
    }
    container.addEventListener("scroll", function () {
      if (container._cdwRaf) return;
      container._cdwRaf = true;
      (window.requestAnimationFrame || function (f) { setTimeout(f, 16); })(function () {
        container._cdwRaf = false;
        renderWindow();
      });
    });
    renderWindow();
    return { rerender: renderWindow, items: items };
  }

  /* ---------- Compendium (faceted, virtualized, all 828 rows) ---------------- */
  var COMP_ROW_H = 48;
  var COMP_HEAD_H = 26;

  function compFiltered(ignoreFacet) {
    var q = compState.filter.trim().toLowerCase();
    return SET_LIST.filter(function (s) {
      if (ignoreFacet !== "domain" && compState.domain && s.domain !== compState.domain) return false;
      if (ignoreFacet !== "exposure" && compState.exposure && String(s.exposure) !== compState.exposure) return false;
      if (ignoreFacet !== "state" && compState.state && effectiveState(s) !== compState.state) return false;
      if (ignoreFacet !== "type" && compState.type && String(s.type) !== compState.type) return false;
      if (q) {
        var hay = (s.label + " " + (s.desc || "") + " " + s.id + " " + (s.search || []).join(" ")).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function facetGroup(title, values, currentVal, countFor, onPick) {
    var g = el("div", "cdw-facet-group");
    g.appendChild(el("div", "cdw-facet-h", title));
    values.forEach(function (v) {
      var b = btn("cdw-facet");
      b.setAttribute("aria-pressed", currentVal === v.value ? "true" : "false");
      b.appendChild(el("span", null, v.label));
      b.appendChild(el("span", "cdw-facet-n", String(countFor(v.value))));
      b.addEventListener("click", function () { onPick(currentVal === v.value ? null : v.value); });
      g.appendChild(b);
    });
    return g;
  }

  function buildFacetPanel(onChange) {
    var host = el("div");
    host.style.display = "contents";
    var domainVals = DOMAIN_LIST.map(function (d) { return { value: d.id, label: d.title }; });
    host.appendChild(facetGroup("Area", domainVals, compState.domain,
      function (v) { return compFiltered("domain").filter(function (s) { return s.domain === v; }).length; },
      function (v) { compState.domain = v; onChange(); }));
    host.appendChild(facetGroup("Exposure", EXPOSURES.map(function (v) { return { value: v, label: humanize(v) }; }),
      compState.exposure,
      function (v) { return compFiltered("exposure").filter(function (s) { return String(s.exposure) === v; }).length; },
      function (v) { compState.exposure = v; onChange(); }));
    host.appendChild(facetGroup("State", STATES.map(function (v) { return { value: v, label: humanize(v) }; }),
      compState.state,
      function (v) { return compFiltered("state").filter(function (s) { return effectiveState(s) === v; }).length; },
      function (v) { compState.state = v; onChange(); }));
    host.appendChild(facetGroup("Type", TYPES.map(function (v) { return { value: v, label: humanize(v) }; }),
      compState.type,
      function (v) { return compFiltered("type").filter(function (s) { return String(s.type) === v; }).length; },
      function (v) { compState.type = v; onChange(); }));
    var clear = btn("pm-btn cdw-facets-clear", "Clear all facets");
    clear.addEventListener("click", function () {
      compState.domain = compState.exposure = compState.state = compState.type = null;
      compState.filter = "";
      onChange();
    });
    host.appendChild(clear);
    return host;
  }

  function renderCompendium() {
    var wrap = el("div", "cdw-comp");
    wrap.setAttribute("data-view", "compendium");

    /* facet column (wide) */
    var facets = el("aside", "cdw-facets pmv2-scroll");
    facets.setAttribute("aria-label", "Compendium facets");
    facets.appendChild(buildFacetPanel(function () { renderAll({ keepScroll: false }); }));
    wrap.appendChild(facets);

    /* main column */
    var main = el("div", "cdw-comp-main");
    var bar = el("div", "cdw-comp-bar");
    var ftoggle = btn("pm-btn cdw-facet-toggle");
    ftoggle.appendChild(icon("filter"));
    ftoggle.appendChild(document.createTextNode(" Facets"));
    ftoggle.addEventListener("click", openFacetDrawer);
    bar.appendChild(ftoggle);
    var rows = compFiltered();
    var title = el("h2", "cdw-comp-title", "All Settings");
    title.appendChild(el("small", null,
      plural(rows.length, "setting") + (rows.length !== SET_LIST.length ? " of " + SET_LIST.length : "")));
    bar.appendChild(title);
    var fwrap = el("span", "cdw-comp-filter");
    fwrap.appendChild(icon("search"));
    var fin = document.createElement("input");
    fin.type = "search";
    fin.placeholder = "Filter within results…";
    fin.value = compState.filter;
    fin.setAttribute("aria-label", "Filter compendium");
    fin.addEventListener("input", function () {
      compState.filter = fin.value;
      renderAll({ keepScroll: false, keepFocus: "comp-filter" });
    });
    fwrap.appendChild(fin);
    bar.appendChild(fwrap);
    var chips = el("span", "cdw-comp-chips");
    [["domain", compState.domain && DOMAIN_BY_ID[compState.domain] ? DOMAIN_BY_ID[compState.domain].title : compState.domain],
     ["exposure", compState.exposure], ["state", compState.state], ["type", compState.type]]
      .forEach(function (pair) {
        if (!pair[1]) return;
        var c = btn("pm-badge", humanize(pair[1]) + " ×");
        c.setAttribute("data-kind", "state");
        c.setAttribute("data-state", "custom");
        c.title = "Remove facet";
        c.addEventListener("click", function () { compState[pair[0]] = null; renderAll({}); });
        chips.appendChild(c);
      });
    bar.appendChild(chips);
    main.appendChild(bar);

    /* grouped virtualized rows */
    var listHost = el("div");
    listHost.style.display = "contents";
    main.appendChild(listHost);

    var detailHost = el("div"); // inline detail (narrow/medium)
    detailHost.style.display = "contents";
    main.appendChild(detailHost);

    /* third detail column (>=1700px) */
    wrap.appendChild(main);
    var detailCol = el("aside", "cdw-comp-detail-col pmv2-scroll");
    detailCol.setAttribute("aria-label", "Setting detail");
    wrap.appendChild(detailCol);

    function renderDetailInto(hostEl, inline) {
      hostEl.innerHTML = "";
      var s = compState.selected && SET_BY_ID[compState.selected];
      if (!s) {
        if (!inline) hostEl.appendChild(el("p", "pm-muted", "Select a row to inspect and change it."));
        return;
      }
      var d = el("div", inline ? "cdw-detail is-inline" : "cdw-detail");
      d.style.margin = inline ? "" : "0";
      var hh = el("div", "cdw-detail-h");
      var hm = el("div");
      hm.appendChild(el("h3", null, s.label));
      hm.appendChild(el("p", null, settingPath(s) + " · " + (s.desc || "")));
      hh.appendChild(hm);
      var x = btn("pm-btn", "Close");
      x.addEventListener("click", function () { compState.selected = null; renderAll({ keepScroll: true }); });
      hh.appendChild(x);
      d.appendChild(hh);
      d.appendChild(settingRow(s));
      d.appendChild(whyDetails(s));
      hostEl.appendChild(d);
    }
    renderDetailInto(detailHost, true);
    renderDetailInto(detailCol, false);

    /* build items with group headers */
    var items = [];
    var lastDomain = null;
    rows.forEach(function (s) {
      if (s.domain !== lastDomain) {
        lastDomain = s.domain;
        var inGroup = rows.filter(function (x) { return x.domain === lastDomain; }).length;
        items.push({ kind: "head", h: COMP_HEAD_H,
          title: DOMAIN_BY_ID[s.domain] ? DOMAIN_BY_ID[s.domain].title : humanize(s.domain),
          count: inGroup });
      }
      items.push({ kind: "row", h: COMP_ROW_H, setting: s });
    });

    var listContainer = el("div", "cdw-vlist pmv2-scroll");
    listContainer.setAttribute("aria-label", "All settings");
    listHost.appendChild(listContainer);
    if (!items.length) {
      listContainer.appendChild(el("p", "pm-muted",
        "No settings match these facets. Clear a facet or the filter to see more."));
      listContainer.style.padding = "16px";
    } else {
      vlist(listContainer, items, function (item) {
        if (item.kind === "head") {
          var h = el("div", "cdw-vhead");
          h.appendChild(el("span", null, item.title));
          h.appendChild(el("span", "cdw-vhead-n", plural(item.count, "setting")));
          return h;
        }
        var s = item.setting;
        var r = btn("cdw-vrow");
        r.setAttribute("data-setting-id", s.id);
        r.setAttribute("data-domain-id", s.domain);
        if (compState.selected === s.id) r.classList.add("is-selected");
        var mm = el("span", "cdw-vrow-main");
        mm.appendChild(el("span", "cdw-vrow-label", s.label));
        mm.appendChild(el("span", "cdw-vrow-path", settingPath(s)));
        r.appendChild(mm);
        r.appendChild(el("span", "cdw-vrow-val", fmtValue(effectiveValue(s))));
        var meta = el("span", "cdw-vrow-meta");
        meta.appendChild(stateBadge(effectiveState(s)));
        r.appendChild(meta);
        r.addEventListener("click", function () {
          compState.selected = s.id;
          renderAll({ keepScroll: true });
        });
        return r;
      });
    }
    return wrap;
  }

  /* narrow: facets become a sliding drawer */
  var facetDrawer = null, facetScrim = null;
  function openFacetDrawer() {
    closeFacetDrawer();
    facetScrim = el("div", "cdw-facet-scrim");
    facetScrim.addEventListener("click", closeFacetDrawer);
    facetDrawer = el("div", "cdw-facet-drawer pmv2-scroll");
    facetDrawer.setAttribute("role", "dialog");
    facetDrawer.setAttribute("aria-label", "Compendium facets");
    facetDrawer.appendChild(buildFacetPanel(function () {
      closeFacetDrawer();
      renderAll({});
    }));
    rootEl.appendChild(facetScrim);
    rootEl.appendChild(facetDrawer);
  }
  function closeFacetDrawer() {
    if (facetScrim && facetScrim.parentNode) facetScrim.parentNode.removeChild(facetScrim);
    if (facetDrawer && facetDrawer.parentNode) facetDrawer.parentNode.removeChild(facetDrawer);
    facetScrim = facetDrawer = null;
  }

  /* ---------- managers (integrated list/detail workspaces) ------------------ */
  function renderManager(managerId, opts) {
    opts = opts || {};
    var m = MANAGER_BY_ID[managerId];
    var pane = el("section", "cdw-pane cdw-pane-wide");
    if (!m) { pane.appendChild(el("p", null, "Unknown manager.")); return pane; }
    pane.setAttribute("data-manager-id", m.id);

    var st = managerCache[m.id] || (managerCache[m.id] = { subpage: 0, objectId: null, showAll: {} });
    if (opts.objectId) st.objectId = opts.objectId;
    if (opts.section) {
      var si = (m.subpages || []).findIndex(function (p) {
        return p.toLowerCase() === String(opts.section).toLowerCase() ||
               p.toLowerCase().indexOf(String(opts.section).toLowerCase()) >= 0;
      });
      if (si >= 0) st.subpage = si;
    }

    var wrap = el("div", "cdw-mwrap");
    var head = el("div", "cdw-mhead");
    var h1 = el("h1");
    h1.appendChild(icon(m.icon || "box"));
    h1.appendChild(document.createTextNode(m.title));
    var fam = el("span", "pm-badge", m.family);
    fam.setAttribute("data-kind", "state");
    fam.setAttribute("data-state", "default");
    h1.appendChild(fam);
    var arch = el("span", "pm-badge", humanize(m.archetype));
    arch.setAttribute("data-kind", "exposure");
    arch.setAttribute("data-exposure", "advanced");
    h1.appendChild(arch);
    head.appendChild(h1);
    head.appendChild(el("p", null, (m.summary || "") + " Applies to the current project."));
    wrap.appendChild(head);

    /* subpage tabs */
    if (m.subpages && m.subpages.length) {
      var tabs = el("div", "cdw-mtabs");
      tabs.setAttribute("role", "tablist");
      m.subpages.forEach(function (p, i) {
        var t = btn("cdw-mtab", p);
        t.setAttribute("role", "tab");
        t.setAttribute("aria-selected", i === st.subpage ? "true" : "false");
        t.setAttribute("data-section-id", m.id + ":" + p.toLowerCase().replace(/\s+/g, "-"));
        t.addEventListener("click", function () {
          st.subpage = i;
          renderAll({ keepScroll: true });
        });
        tabs.appendChild(t);
      });
      wrap.appendChild(tabs);
    }

    var body = el("div");
    var activeSub = (m.subpages || [])[st.subpage] || null;
    if (m.archetype === "resource-roster") renderRoster(body, m, st, opts);
    else if (m.archetype === "inventory-catalog") renderCatalog(body, m, st);
    else if (m.archetype === "setup-sequence") renderSetupSequence(body, m, st);
    else if (m.archetype === "health-projection") renderHealth(body, m);
    else if (m.archetype === "diagnostic-drawer") renderDiagnostic(body, m);
    else if (m.archetype === "transaction") renderTransaction(body, m);
    else renderPreferenceDoc(body, m, activeSub, opts.row);
    wrap.appendChild(body);
    pane.appendChild(wrap);
    return pane;
  }

  /* -- preference-document: grouped setting rows -- */
  function renderPreferenceDoc(host, m, activeSub, focusRow) {
    var sets = domainSettings(m.domain);
    if (activeSub && m.subpages && m.subpages[0] !== activeSub) {
      var tokens = activeSub.toLowerCase().split(/[^a-z]+/).filter(function (t) { return t.length > 2; });
      var filtered = sets.filter(function (s) {
        var hay = (String(s.subgroup) + " " + s.label + " " + (s.desc || "")).toLowerCase();
        return tokens.some(function (t) { return hay.indexOf(t) >= 0; });
      });
      if (filtered.length) sets = filtered;
      else {
        host.appendChild(el("p", "pm-muted",
          "This subpage has no dedicated rows in the demo projection. The Overview tab lists every setting for " +
          m.title + "."));
        return;
      }
    }
    var bySub = {};
    sets.forEach(function (s) {
      var k = s.subgroup || "other";
      if (!bySub[k]) bySub[k] = [];
      bySub[k].push(s);
    });
    var subs = Object.keys(bySub);
    if (!subs.length) {
      host.appendChild(el("p", "pm-muted", "No settings in this domain yet."));
      return;
    }
    var st = managerCache[m.id];
    subs.forEach(function (subId) {
      var rows = bySub[subId];
      var g = el("div", "cdw-sgroup");
      g.setAttribute("data-section-id", subId);
      g.appendChild(el("div", "cdw-sgroup-h", subgroupTitle(subId) + " · " + plural(rows.length, "setting")));
      var showAll = st.showAll[subId] || (focusRow && rows.some(function (s) { return s.id === focusRow; }));
      rows.slice(0, showAll ? rows.length : 8).forEach(function (s) {
        g.appendChild(settingRow(s));
        g.appendChild(whyDetails(s));
      });
      if (!showAll && rows.length > 8) {
        var more = btn("pm-btn", "Show all " + rows.length + " rows");
        more.setAttribute("data-variant", "quiet");
        more.addEventListener("click", function () {
          st.showAll[subId] = true;
          renderAll({ keepScroll: true });
        });
        g.appendChild(more);
      }
      host.appendChild(g);
    });
  }

  /* -- resource-roster: object list + readable detail -- */
  function renderRoster(host, m, st, opts) {
    var roster = (m.objectSource && OBJECT_ROSTERS[m.objectSource]) || [];
    if (m.id === "providers" && CORE.providers && CORE.providers.length) {
      roster = OBJECT_ROSTERS.providers && OBJECT_ROSTERS.providers.length ? OBJECT_ROSTERS.providers : roster;
    }
    var split = el("div", "cdw-msplit");
    var listCol = el("div", "cdw-mlist");
    if (!roster.length) {
      listCol.appendChild(el("p", "pm-muted", "Nothing here yet. Items you add will appear in this roster."));
    }
    roster.forEach(function (o) {
      var b = btn("cdw-mobj");
      b.setAttribute("data-object-id", o.id);
      if (st.objectId === o.id) b.setAttribute("aria-current", "true");
      var mm = el("span", "cdw-mobj-main");
      mm.appendChild(el("span", "cdw-mobj-label", o.label));
      var sub = [o.typeLabel, o.health && o.health.status ? humanize(o.health.status) :
                 (typeof o.health === "string" ? humanize(o.health) : null),
                 o.availability && o.availability !== "available" ? humanize(o.availability) : null]
        .filter(Boolean).join(" · ");
      mm.appendChild(el("span", "cdw-mobj-sub", sub || m.title));
      b.appendChild(mm);
      b.addEventListener("click", function () {
        st.objectId = o.id;
        renderAll({ keepScroll: true });
      });
      listCol.appendChild(b);
    });
    split.appendChild(listCol);

    var detail = el("div", "cdw-mdetail");
    var sel = null;
    roster.forEach(function (o) { if (o.id === st.objectId) sel = o; });
    if (!sel && roster.length) { sel = roster[0]; st.objectId = sel.id; }
    if (sel) {
      var card = el("div", "cdw-detail");
      card.style.margin = "0";
      card.setAttribute("data-object-id", sel.id);
      card.tabIndex = -1;
      var hh = el("div", "cdw-detail-h");
      var hm = el("div");
      hm.appendChild(el("h3", null, sel.label));
      hm.appendChild(el("p", null, (sel.typeLabel || "Managed object") + " · " + m.title));
      hh.appendChild(hm);
      card.appendChild(hh);
      var metaList = el("div", "cdw-dom-stats");
      metaList.appendChild(stat(sel.typeLabel || "—", "Type"));
      metaList.appendChild(stat(sel.health && sel.health.status ? humanize(sel.health.status) :
        (typeof sel.health === "string" ? humanize(sel.health) : "Ready"), "Health"));
      metaList.appendChild(stat(sel.availability ? humanize(sel.availability) : "Available", "Availability"));
      card.appendChild(metaList);
      if (sel.section) card.appendChild(el("p", "pm-muted", "Section: " + humanize(sel.section)));
      detail.appendChild(card);

      if (m.id === "providers") renderProviderExtras(detail, sel);
    } else {
      detail.appendChild(el("p", "pm-muted", "Select an item to see its details."));
    }
    split.appendChild(detail);
    host.appendChild(split);
  }

  function renderProviderExtras(detail, sel) {
    var p = null;
    (CORE.providers || []).forEach(function (x) {
      if (x.id === sel.id || x.name === sel.label || x.label === sel.label) p = x;
    });
    var box = el("div", "cdw-detail");
    box.style.margin = "0";
    box.appendChild(el("h3", null, "Account & installation"));
    var accounts = p && p.accounts ? p.accounts.length : null;
    var models = p && p.models ? p.models.length : null;
    var statsRow = el("div", "cdw-dom-stats");
    statsRow.appendChild(stat(accounts == null ? "—" : accounts, "Accounts"));
    statsRow.appendChild(stat(models == null ? "—" : models, "Models"));
    statsRow.appendChild(stat(p && p.installState ? humanize(p.installState) : "Unknown", "Install state"));
    box.appendChild(statsRow);
    var cred = el("p", "pm-muted",
      "Credentials are stored in the OS keychain and shown masked. Raw secret material is never rendered here.");
    box.appendChild(cred);
    var actions = el("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.flexWrap = "wrap";

    var install = btn("pm-btn", "Install from the official source");
    install.setAttribute("data-variant", "primary");
    install.addEventListener("click", function () {
      var op = store.begin({ kind: "provider-install",
        title: "Install " + sel.label + " from its official source",
        phases: [{ name: "Download from official source" }, { name: "Verify signature" }, { name: "Register installation" }],
        determinate: false });
      store.completePhase(op.id); store.completePhase(op.id); store.completePhase(op.id);
      store.finish(op.id, "done");
      store.addReceipt({ kind: "provider-install", title: "Installed " + sel.label + " (official source)" });
      toast(sel.label + " installed from its official source.");
    });
    var repair = btn("pm-btn", "Repair installation");
    repair.addEventListener("click", function () {
      var op = store.begin({ kind: "provider-repair", title: "Repair " + sel.label,
        phases: [{ name: "Diagnose" }, { name: "Repair" }], determinate: false });
      store.completePhase(op.id); store.completePhase(op.id);
      store.finish(op.id, "done");
      toast(sel.label + " repair finished.");
    });
    var update = btn("pm-btn", "Check for updates");
    update.addEventListener("click", function () {
      var op = store.begin({ kind: "provider-update-check", title: "Check " + sel.label + " for updates",
        phases: [{ name: "Check" }], determinate: false });
      store.completePhase(op.id);
      store.finish(op.id, "done");
      toast("Update check completed for " + sel.label + ".");
    });
    actions.appendChild(install); actions.appendChild(repair); actions.appendChild(update);
    box.appendChild(actions);
    var note = el("p", "pm-muted");
    note.textContent = "Installations come only from the provider's official source; nothing is bundled or pre-seeded.";
    box.appendChild(note);
    detail.appendChild(box);
  }

  /* -- inventory-catalog: virtualized objects + facet chips -- */
  var catalogFacet = {}; // managerId -> typeLabel|null
  function renderCatalog(host, m, st) {
    var roster = ((m.objectSource && OBJECT_ROSTERS[m.objectSource]) || []).slice();
    var types = [], seen = {};
    roster.forEach(function (o) {
      var t = o.typeLabel || "Other";
      if (!seen[t]) { seen[t] = true; types.push(t); }
    });
    types.sort();
    var active = catalogFacet[m.id] || null;
    var chips = el("div", "cdw-comp-chips");
    chips.style.marginBottom = "10px";
    types.forEach(function (t) {
      var c = btn("cdw-facet", t);
      c.setAttribute("aria-pressed", active === t ? "true" : "false");
      c.addEventListener("click", function () {
        catalogFacet[m.id] = active === t ? null : t;
        renderAll({ keepScroll: true });
      });
      chips.appendChild(c);
    });
    host.appendChild(chips);
    var rows = active ? roster.filter(function (o) { return (o.typeLabel || "Other") === active; }) : roster;
    host.appendChild(el("p", "pm-muted",
      plural(rows.length, "item") + (active ? " · filtered by " + humanize(active) : "")));
    if (rows.length > 60) {
      var holder = el("div");
      holder.style.blockSize = "420px";
      holder.style.display = "flex";
      holder.style.flexDirection = "column";
      var lc = el("div", "cdw-vlist pmv2-scroll");
      lc.style.border = "1px solid var(--pm-line)";
      lc.style.borderRadius = "var(--pm-radius-m)";
      holder.appendChild(lc);
      host.appendChild(holder);
      var items = rows.map(function (o) { return { kind: "row", h: 44, obj: o }; });
      vlist(lc, items, function (item) {
        var o = item.obj;
        var r = btn("cdw-vrow");
        r.setAttribute("data-object-id", o.id);
        var mm = el("span", "cdw-vrow-main");
        mm.appendChild(el("span", "cdw-vrow-label", o.label));
        mm.appendChild(el("span", "cdw-vrow-path", (o.typeLabel || "") + " · " + (o.managerTitle || m.title)));
        r.appendChild(mm);
        var meta = el("span", "cdw-vrow-meta");
        if (o.availability) meta.appendChild(el("span", "pm-badge", humanize(o.availability)));
        r.appendChild(meta);
        r.addEventListener("click", function () {
          toast(o.label + " — managed in " + (o.managerTitle || m.title) + ".");
        });
        return r;
      });
    } else {
      var list = el("div", "cdw-mlist");
      rows.forEach(function (o) {
        var b = btn("cdw-mobj");
        b.setAttribute("data-object-id", o.id);
        var mm = el("span", "cdw-mobj-main");
        mm.appendChild(el("span", "cdw-mobj-label", o.label));
        mm.appendChild(el("span", "cdw-mobj-sub", o.typeLabel || m.title));
        b.appendChild(mm);
        b.addEventListener("click", function () {
          toast(o.label + " — managed in " + (o.managerTitle || m.title) + ".");
        });
        list.appendChild(b);
      });
      host.appendChild(list);
    }
  }

  /* -- setup-sequence: stepper over the manager's subpages -- */
  function renderSetupSequence(host, m, st) {
    var steps = (m.subpages && m.subpages.length ? m.subpages : ["Prepare", "Configure", "Verify"]);
    var idx = Math.min(st.subpage || 0, steps.length - 1);
    var bar = el("div", "cdw-copy-steps");
    steps.forEach(function (p, i) {
      var s = el("span", "cdw-copy-step" + (i === idx ? " is-here" : i < idx ? " is-done" : ""));
      s.appendChild(el("b", null, i < idx ? "✓" : String(i + 1)));
      s.appendChild(document.createTextNode(p));
      bar.appendChild(s);
      if (i < steps.length - 1) bar.appendChild(el("span", "cdw-copy-sep", "→"));
    });
    host.appendChild(bar);
    var card = el("div", "cdw-detail");
    card.style.margin = "0";
    card.appendChild(el("h3", null, "Step " + (idx + 1) + ": " + steps[idx]));
    card.appendChild(el("p", null,
      "Work through this step, then continue. The sequence saves to the current project as you go."));
    var sets = domainSettings(m.domain).slice(idx * 2, idx * 2 + 2);
    sets.forEach(function (s) { card.appendChild(settingRow(s)); });
    var nav = el("div");
    nav.style.display = "flex";
    nav.style.gap = "8px";
    var prev = btn("pm-btn", "Previous step");
    prev.disabled = idx === 0;
    prev.addEventListener("click", function () { st.subpage = idx - 1; renderAll({ keepScroll: true }); });
    var next = btn("pm-btn", idx === steps.length - 1 ? "Finish" : "Next step");
    next.setAttribute("data-variant", "primary");
    next.addEventListener("click", function () {
      if (idx === steps.length - 1) {
        var op = store.begin({ kind: "setup-sequence", title: m.title + " setup",
          phases: steps.map(function (p) { return { name: p }; }), determinate: false });
        steps.forEach(function () { store.completePhase(op.id); });
        store.finish(op.id, "done");
        toast(m.title + " setup completed.");
      } else {
        st.subpage = idx + 1;
        renderAll({ keepScroll: true });
      }
    });
    nav.appendChild(prev); nav.appendChild(next);
    card.appendChild(nav);
    host.appendChild(card);
  }

  /* -- health-projection: read-only status panels -- */
  function renderHealth(host, m) {
    var proj = store.projection("manager." + m.id);
    if (proj && proj.message) {
      var n = el("div", "pm-notice");
      n.setAttribute("data-kind", proj.state === "error" ? "attention" : "setup");
      n.appendChild(el("span", "pm-notice-chip", humanize(proj.state)));
      n.appendChild(el("span", "pm-notice-head", humanize(proj.state)));
      n.appendChild(el("div", "pm-notice-body", proj.message + (proj.cached ? " Showing cached values." : "")));
      host.appendChild(n);
    }
    var panels = el("div", "cdw-mgrid");
    (m.subpages || ["Status"]).forEach(function (p, i) {
      var c = el("div", "cdw-stat");
      c.style.minInlineSize = "180px";
      c.appendChild(el("b", null, proj && proj.state !== "ready" ? humanize(proj.state) : "Healthy"));
      c.appendChild(el("span", null, p + " — read-only projection"));
      panels.appendChild(c);
    });
    host.appendChild(panels);
    host.appendChild(el("p", "pm-muted",
      "Health surfaces are read-only. Repairs, where available, start from the Doctor manager or a setup workflow."));
  }

  /* -- diagnostic-drawer: log viewer in a right-side drawer -- */
  var logDrawer = null, logScrim = null;
  function renderDiagnostic(host, m) {
    host.appendChild(el("p", "pm-muted",
      "Diagnostics open in a drawer so the manager underneath stays in place."));
    var open = btn("pm-btn", "Open log viewer");
    open.setAttribute("data-variant", "primary");
    open.addEventListener("click", function () { openLogDrawer(m); });
    host.appendChild(open);
  }
  function openLogDrawer(m) {
    closeLogDrawer();
    logScrim = el("div", "cdw-facet-scrim");
    logScrim.addEventListener("click", closeLogDrawer);
    logDrawer = el("div", "cdw-facet-drawer pmv2-scroll");
    logDrawer.style.insetInlineStart = "auto";
    logDrawer.style.insetInlineEnd = "0";
    logDrawer.style.borderInlineEnd = "0";
    logDrawer.style.borderInlineStart = "1px solid var(--pm-line)";
    logDrawer.setAttribute("role", "dialog");
    logDrawer.setAttribute("aria-label", m.title + " logs");
    var hh = el("div", "pm-drawer-h");
    hh.appendChild(el("span", null, m.title + " — logs"));
    var x = btn("pm-btn", "Close");
    x.addEventListener("click", closeLogDrawer);
    hh.appendChild(x);
    logDrawer.appendChild(hh);
    var lines = [];
    store.receipts().slice(-8).forEach(function (r) {
      lines.push((r.at || "") + "  receipt  " + (r.title || r.kind));
    });
    lines.push("2026-08-18T09:41:00Z  info  " + m.title + " projection loaded for the current project");
    lines.push("2026-08-18T09:41:01Z  info  health checks scheduled; nothing requires action");
    var proj = store.projection("manager." + m.id);
    if (proj && proj.message) lines.push("2026-08-18T09:41:02Z  " + proj.state + "  " + proj.message);
    var pre = el("pre", "pm-muted");
    pre.style.fontFamily = "var(--pm-font-mono)";
    pre.style.fontSize = "11px";
    pre.style.whiteSpace = "pre-wrap";
    pre.textContent = lines.join("\n");
    logDrawer.appendChild(pre);
    rootEl.appendChild(logScrim);
    rootEl.appendChild(logDrawer);
  }
  function closeLogDrawer() {
    if (logScrim && logScrim.parentNode) logScrim.parentNode.removeChild(logScrim);
    if (logDrawer && logDrawer.parentNode) logDrawer.parentNode.removeChild(logDrawer);
    logScrim = logDrawer = null;
  }

  /* -- transaction: preview → confirm → receipt -- */
  var txnState = {}; // managerId -> {phase:"idle"|"confirm"|"done", detail}
  function renderTransaction(host, m) {
    var st = txnState[m.id] || (txnState[m.id] = { phase: "idle" });
    if (m.id === "backup") return renderBackup(host, m, st);
    if (m.id === "lifecycle") return renderLifecycle(host, m, st);
    if (m.id === "cleanup") return renderCleanup(host, m, st);
    /* generic transaction */
    host.appendChild(el("p", "pm-muted", m.summary || "This manager performs a previewed, confirmable transaction."));
    var b = btn("pm-btn", "Start " + m.title);
    b.setAttribute("data-variant", "primary");
    b.addEventListener("click", function () {
      var op = store.begin({ kind: "transaction", title: m.title,
        phases: [{ name: "Preview" }, { name: "Confirm" }, { name: "Apply" }], determinate: false });
      store.completePhase(op.id); store.completePhase(op.id); store.completePhase(op.id);
      store.finish(op.id, "done");
      store.addReceipt({ kind: "transaction", title: m.title + " completed" });
      toast(m.title + " completed.");
    });
    host.appendChild(b);
  }

  function renderBackup(host, m, st) {
    var pts = store.restorePoints();
    host.appendChild(sectionHead("Restore points", plural(pts.length, "point")));
    if (st.phase === "confirm") {
      var card = el("div", "cdw-detail");
      card.style.margin = "0";
      card.appendChild(el("h3", null, "Create a restore point now?"));
      card.appendChild(el("p", null,
        "Captures the current project overrides (" + Object.keys(store.overrides()).length +
        " customized values). Nothing is overwritten."));
      var row = el("div");
      row.style.display = "flex"; row.style.gap = "8px";
      var yes = btn("pm-btn", "Create restore point");
      yes.setAttribute("data-variant", "primary");
      yes.addEventListener("click", function () {
        var op = store.begin({ kind: "backup", title: "Create restore point",
          phases: [{ name: "Snapshot overrides" }, { name: "Verify" }], determinate: false });
        store.createRestorePoint("Manual restore point", store.overrides());
        store.completePhase(op.id); store.completePhase(op.id);
        store.finish(op.id, "done");
        store.addReceipt({ kind: "backup", title: "Restore point created" });
        st.phase = "idle";
        toast("Restore point created.");
        renderAll({ keepScroll: true });
      });
      var no = btn("pm-btn", "Cancel");
      no.addEventListener("click", function () { st.phase = "idle"; renderAll({ keepScroll: true }); });
      row.appendChild(yes); row.appendChild(no);
      card.appendChild(row);
      host.appendChild(card);
    } else {
      var b = btn("pm-btn", "Create restore point…");
      b.setAttribute("data-variant", "primary");
      b.addEventListener("click", function () { st.phase = "confirm"; renderAll({ keepScroll: true }); });
      host.appendChild(b);
    }
    var list = el("div", "cdw-mlist");
    if (!pts.length) list.appendChild(el("p", "pm-muted", "No restore points yet."));
    pts.slice().reverse().forEach(function (p) {
      var r = el("div", "cdw-mobj");
      var mm = el("span", "cdw-mobj-main");
      mm.appendChild(el("span", "cdw-mobj-label", p.label));
      mm.appendChild(el("span", "cdw-mobj-sub", (p.at || "") + " · " + Object.keys(p.snapshot || {}).length + " values"));
      r.appendChild(mm);
      list.appendChild(r);
    });
    host.appendChild(list);
  }

  function renderLifecycle(host, m, st) {
    host.appendChild(sectionHead("Export", "current project overrides"));
    var exp = btn("pm-btn", "Export overrides as JSON");
    exp.addEventListener("click", function () {
      var data = JSON.stringify({ project: store.currentProject().id, overrides: store.overrides() }, null, 2);
      try {
        var blob = new Blob([data], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "puppet-master-settings-export.json";
        a.click();
      } catch (e) { toast("Export prepared (" + data.length + " bytes)."); }
      store.addReceipt({ kind: "export", title: "Exported settings overrides" });
    });
    host.appendChild(exp);

    host.appendChild(sectionHead("Reset", "returns every setting to default"));
    if (st.phase === "confirm") {
      var card = el("div", "cdw-detail");
      card.style.margin = "0";
      card.appendChild(el("h3", null, "Reset all customized values?"));
      card.appendChild(el("p", null,
        "This clears " + plural(Object.keys(store.overrides()).length, "customized value") +
        " in the current project. A restore point is created first."));
      var row = el("div");
      row.style.display = "flex"; row.style.gap = "8px";
      var yes = btn("pm-btn", "Create restore point and reset");
      yes.setAttribute("data-variant", "danger");
      yes.addEventListener("click", function () {
        var op = store.begin({ kind: "reset", title: "Reset settings",
          phases: [{ name: "Create restore point" }, { name: "Clear overrides" }, { name: "Verify" }],
          determinate: false });
        store.createRestorePoint("Before reset", store.overrides());
        store.completePhase(op.id);
        Object.keys(store.overrides()).forEach(function (id) { store.resetValue(id); });
        store.completePhase(op.id); store.completePhase(op.id);
        store.finish(op.id, "done");
        store.addReceipt({ kind: "reset", title: "Reset all settings to defaults" });
        st.phase = "idle";
        toast("All settings reset to defaults.");
        renderAll({ keepScroll: true });
      });
      var no = btn("pm-btn", "Cancel");
      no.addEventListener("click", function () { st.phase = "idle"; renderAll({ keepScroll: true }); });
      row.appendChild(yes); row.appendChild(no);
      card.appendChild(row);
      host.appendChild(card);
    } else {
      var rs = btn("pm-btn", "Reset all settings…");
      rs.setAttribute("data-variant", "danger");
      rs.addEventListener("click", function () { st.phase = "confirm"; renderAll({ keepScroll: true }); });
      host.appendChild(rs);
    }

    var receipts = store.receipts();
    host.appendChild(sectionHead("Receipts", plural(receipts.length, "receipt")));
    var list = el("div", "cdw-mlist");
    if (!receipts.length) list.appendChild(el("p", "pm-muted", "No transactions yet."));
    receipts.slice().reverse().slice(0, 10).forEach(function (r) {
      var row2 = el("div", "cdw-mobj");
      var mm = el("span", "cdw-mobj-main");
      mm.appendChild(el("span", "cdw-mobj-label", r.title || r.kind));
      mm.appendChild(el("span", "cdw-mobj-sub", (r.at || "") + (r.rolledBack ? " · rolled back" : "")));
      row2.appendChild(mm);
      list.appendChild(row2);
    });
    host.appendChild(list);
  }

  function renderCleanup(host, m, st) {
    var artifacts = OBJECT_ROSTERS.artifacts || [];
    host.appendChild(sectionHead("Dry run", "no files are touched"));
    if (st.phase === "confirm") {
      var card = el("div", "cdw-detail");
      card.style.margin = "0";
      card.appendChild(el("h3", null, "Run cleanup?"));
      card.appendChild(el("p", null,
        "The dry run found " + plural(st.detail || artifacts.length, "candidate item") +
        ". Cleanup removes only generated outputs listed above."));
      var row = el("div");
      row.style.display = "flex"; row.style.gap = "8px";
      var yes = btn("pm-btn", "Run cleanup");
      yes.setAttribute("data-variant", "primary");
      yes.addEventListener("click", function () {
        var op = store.begin({ kind: "cleanup", title: "Workspace cleanup",
          phases: [{ name: "Remove generated outputs" }, { name: "Verify" }], determinate: false });
        store.completePhase(op.id); store.completePhase(op.id);
        store.finish(op.id, "done");
        store.addReceipt({ kind: "cleanup", title: "Workspace cleanup completed", count: st.detail || 0 });
        st.phase = "idle";
        toast("Cleanup completed.");
        renderAll({ keepScroll: true });
      });
      var no = btn("pm-btn", "Cancel");
      no.addEventListener("click", function () { st.phase = "idle"; renderAll({ keepScroll: true }); });
      row.appendChild(yes); row.appendChild(no);
      card.appendChild(row);
      host.appendChild(card);
    } else {
      var dry = btn("pm-btn", st.phase === "done" ? "Dry run again" : "Start dry run");
      dry.setAttribute("data-variant", "primary");
      dry.addEventListener("click", function () {
        var op = store.begin({ kind: "cleanup-dry-run", title: "Cleanup dry run",
          phases: [{ name: "Scan outputs" }, { name: "Classify" }], determinate: false });
        store.completePhase(op.id); store.completePhase(op.id);
        store.finish(op.id, "done");
        st.phase = "confirm";
        st.detail = artifacts.length;
        renderAll({ keepScroll: true });
      });
      host.appendChild(dry);
    }
    var list = el("div", "cdw-mlist");
    artifacts.slice(0, 8).forEach(function (o) {
      var r = el("div", "cdw-mobj");
      var mm = el("span", "cdw-mobj-main");
      mm.appendChild(el("span", "cdw-mobj-label", o.label));
      mm.appendChild(el("span", "cdw-mobj-sub", o.typeLabel || "Generated output"));
      r.appendChild(mm);
      list.appendChild(r);
    });
    if (artifacts.length) host.appendChild(list);
    else host.appendChild(el("p", "pm-muted", "No generated outputs found."));
  }

  
  /* ---------- context column (visible >= 1700px) -------------------------- */
  function renderContext() {
    if (!contextEl) return;
    contextEl.innerHTML = "";
    var proj = store.currentProject() || { name: "Puppet Master", path: "P:/" };
    var card = el("div", "cdw-deferred");
    card.appendChild(el("strong", null, proj.name));
    card.appendChild(el("p", "pm-muted", "Current project. Every editable setting on this page applies to this project only."));
    contextEl.appendChild(card);

    var here = el("div", "cdw-deferred");
    here.appendChild(el("strong", null, "You are here"));
    here.appendChild(el("p", "pm-muted", "Settings / " + routeLabel(route)));
    var sc = store.activeScenario && store.activeScenario();
    if (sc) {
      var pr = store.projection("context");
      var line = el("p", "pm-muted", "Demo scenario: " + humanize(sc) + (pr && pr.message ? " — " + pr.message : ""));
      here.appendChild(line);
    }
    contextEl.appendChild(here);
  }

  /* ---------- truthful scenario strip ------------------------------------- */
  function scenarioStrip() {
    var name = store.activeScenario && store.activeScenario();
    if (!name) return null;
    var pr = store.projection("main") || { state: name, message: null, cached: false };
    var bar = el("div", "cdw-arrive");
    bar.removeAttribute("hidden");
    bar.appendChild(icon("alert"));
    var txt = "Demo scenario — " + humanize(name) + (pr.message ? ". " + pr.message : "");
    if (pr.cached) txt += " Cached values remain visible while refreshing.";
    bar.appendChild(el("span", null, txt));
    return bar;
  }

  /* ---------- central dispatch (completes the router) ---------------------- */
  function renderAll(opts) {
    opts = opts || {};
    renderChrome();
    renderNav();
    mainEl.innerHTML = "";
    var node = null;
    if (route.view === "domain") node = renderDomain(route.domainId, route);
    else if (route.view === "manager") node = renderManager(route.managerId, route);
    else if (route.view === "deferred") node = renderDeferred(route.defId || route.deferredId);
    else if (route.view === "compendium") node = renderCompendium();
    else if (route.view === "copy") node = renderCopyView();
    else node = renderHome();
    if (node) mainEl.appendChild(node);
    var strip = scenarioStrip();
    if (strip) mainEl.insertBefore(strip, mainEl.firstChild);
    renderContext();
    if (!opts.keepScroll) { try { mainEl.scrollTop = 0; } catch (e) { /* noop */ } }
  }

  /* ---------- Copy Settings From Another Project (one-time transaction) ---- */
  var COPY_STEPS = [
    ["source", "Select source"], ["categories", "Select categories"],
    ["preview", "Review & confirm"], ["receipt", "Complete"]
  ];

  function copyStepsEl(here) {
    var ol = el("ol", "cdw-copy-steps");
    var hereIdx = -1;
    COPY_STEPS.forEach(function (s, i) { if (s[0] === here) hereIdx = i; });
    COPY_STEPS.forEach(function (s, i) {
      if (i > 0) { var sep = el("li", "cdw-copy-sep", "›"); sep.setAttribute("aria-hidden", "true"); ol.appendChild(sep); }
      var li = el("li", "cdw-copy-step" + (i === hereIdx ? " is-here" : (i < hereIdx ? " is-done" : "")));
      li.appendChild(el("b", null, String(i + 1)));
      li.appendChild(el("span", null, s[1]));
      ol.appendChild(li);
    });
    return ol;
  }

  function renderCopyView() {
    var pane = el("section", "cdw-pane cdw-pane-wide");
    pane.setAttribute("data-view", "copy");
    var wrap = el("div", "cdw-copy");
    pane.appendChild(sectionHead("Copy Settings From Another Project", "one-time transaction"));
    wrap.appendChild(el("p", "pm-muted",
      "Copies values into this project once, behind a restore point. Nothing stays linked: later changes in the source project never propagate here."));
    if (!copyEngine) { wrap.appendChild(el("p", null, "Copy is unavailable in this demo build.")); pane.appendChild(wrap); return pane; }

    var st = copyState;
    var step = st.step || "source";
    wrap.appendChild(copyStepsEl(step === "rolled-back" ? "receipt" : step));

    if (step === "source") {
      wrap.appendChild(el("h3", null, "Choose the source project"));
      var list = el("div", "cdw-mlist");
      copyEngine.sources().forEach(function (pr) {
        var b = btn("cdw-mobj");
        b.style.textAlign = "start";
        var mm = el("span", "cdw-mobj-main");
        mm.appendChild(el("span", "cdw-mobj-label", pr.name));
        mm.appendChild(el("span", "cdw-mobj-sub", pr.path + " · " + plural(pr.settings, "setting") + " · updated " + pr.updated));
        b.appendChild(mm);
        b.addEventListener("click", function () {
          if (copyEngine.selectSource(pr.id)) { st.sourceId = pr.id; st.step = "categories"; renderAll({}); }
        });
        list.appendChild(b);
      });
      wrap.appendChild(list);
    } else if (step === "categories") {
      wrap.appendChild(el("h3", null, "Choose what to copy"));
      var cats = el("div", "cdw-mlist");
      REG.COPY_CATEGORIES.forEach(function (c) {
        var row = el("label", "cdw-mobj");
        row.style.display = "flex"; row.style.gap = "10px"; row.style.alignItems = "flex-start";
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = st.categories.indexOf(c.id) >= 0;
        cb.addEventListener("change", function () {
          var i = st.categories.indexOf(c.id);
          if (cb.checked && i < 0) st.categories.push(c.id);
          if (!cb.checked && i >= 0) st.categories.splice(i, 1);
        });
        var mm = el("span", "cdw-mobj-main");
        mm.appendChild(el("span", "cdw-mobj-label", c.title));
        mm.appendChild(el("span", "cdw-mobj-sub", c.note));
        row.appendChild(cb); row.appendChild(mm);
        cats.appendChild(row);
      });
      wrap.appendChild(cats);
      var nav = el("div", null);
      nav.style.display = "flex"; nav.style.gap = "8px"; nav.style.marginTop = "10px";
      var back = btn("pm-btn", "Back");
      back.addEventListener("click", function () { st.step = "source"; renderAll({ keepScroll: true }); });
      var next = btn("pm-btn", "Preview copy");
      next.setAttribute("data-variant", "primary");
      next.addEventListener("click", function () {
        if (!copyEngine.setCategories(st.categories)) { toast(copyEngine.error || "Select at least one category."); return; }
        if (copyEngine.buildPreview()) { st.step = "preview"; renderAll({}); }
      });
      nav.appendChild(back); nav.appendChild(next);
      wrap.appendChild(nav);
    } else if (step === "preview") {
      var pv = copyEngine.preview;
      if (!pv) { st.step = "categories"; renderAll({}); return pane; }
      var totals = el("div", "cdw-copy-totals");
      [["add", "Additions"], ["replace", "Replacements"], ["unchanged", "Unchanged"], ["unavailable", "Unavailable"], ["conflict", "Conflicts"]].forEach(function (k) {
        var t = el("div", "cdw-copy-total");
        t.setAttribute("data-kind", k[0]);
        t.appendChild(el("b", null, String(pv.totals[k[0]] || 0)));
        t.appendChild(el("span", null, k[1]));
        totals.appendChild(t);
      });
      wrap.appendChild(totals);

      [["add", "Additions"], ["replace", "Replacements"], ["conflict", "Conflicts — source wins after confirmation"], ["unchanged", "Unchanged"], ["unavailable", "Unavailable — skipped"]].forEach(function (k) {
        var items = (pv.groups && pv.groups[k[0]]) || [];
        if (!items.length) return;
        var diff = el("div", "cdw-diff");
        var h = el("div", "cdw-diff-h", k[1]);
        var total = pv.totals[k[0]] || 0;
        h.appendChild(el("span", "cdw-diff-n", total > items.length ? "showing " + items.length + " of " + total : plural(items.length, "row")));
        diff.appendChild(h);
        items.forEach(function (it) {
          var r = el("div", "cdw-diff-row");
          var lab = el("span", "cdw-diff-label");
          lab.appendChild(el("b", null, it.label));
          lab.appendChild(el("small", null, it.note || it.id));
          r.appendChild(lab);
          if (k[0] === "unchanged" || k[0] === "unavailable") {
            r.appendChild(el("span", "cdw-diff-same", fmtValue(it.incoming)));
          } else {
            r.appendChild(el("span", "cdw-diff-val", it.current == null ? "—" : fmtValue(it.current)));
            r.appendChild(el("span", "cdw-diff-arrow", "→"));
            var nv = el("span", "cdw-diff-val is-new", fmtValue(it.incoming));
            r.appendChild(nv);
          }
          diff.appendChild(r);
        });
        wrap.appendChild(diff);
      });

      var cred = el("p", "pm-muted", pv.credentialPolicy);
      wrap.appendChild(cred);
      wrap.appendChild(el("p", "pm-muted", pv.independence));

      var nav2 = el("div", null);
      nav2.style.display = "flex"; nav2.style.gap = "8px"; nav2.style.marginTop = "10px";
      var back2 = btn("pm-btn", "Back");
      back2.addEventListener("click", function () { st.step = "categories"; renderAll({ keepScroll: true }); });
      var apply = btn("pm-btn", "Copy settings");
      apply.setAttribute("data-variant", "primary");
      apply.addEventListener("click", function () {
        copyEngine.confirm();
        var op = copyEngine.apply();
        st.op = op;
        st.step = copyEngine.state === "receipt" ? "receipt" : (copyEngine.state === "failed" ? "preview" : "receipt");
        if (copyEngine.state === "failed") toast(copyEngine.error || "Copy failed safely; nothing was applied.");
        renderAll({});
      });
      nav2.appendChild(back2); nav2.appendChild(apply);
      wrap.appendChild(nav2);
    } else { /* receipt / rolled-back */
      var rc = copyEngine.receipt;
      if (rc) {
        var box = el("div", "cdw-deferred");
        box.appendChild(el("strong", null, (st.step === "rolled-back" || rc.rolledBack) ? "Copy rolled back" : "Copy complete"));
        box.appendChild(el("p", "pm-muted",
          rc.title + " — " + (rc.totals ? (rc.totals.add + rc.totals.replace) + " values applied" : "") +
          ". Restore point " + rc.restorePointId + (rc.verified ? ". Destination verified." : ".")));
        box.appendChild(el("p", "pm-muted", rc.independence || "Source and destination are independent."));
        wrap.appendChild(box);
        if (!(st.step === "rolled-back" || rc.rolledBack)) {
          var rb = btn("pm-btn", "Roll back this copy");
          rb.addEventListener("click", function () {
            if (copyEngine.rollback()) { st.step = "rolled-back"; toast("Rolled back to the restore point."); renderAll({ keepScroll: true }); }
          });
          wrap.appendChild(rb);
        }
      }
      var again = btn("pm-btn", "Start another copy");
      again.addEventListener("click", function () { copyEngine.reset(); copyState = { categories: [] }; renderAll({}); });
      wrap.appendChild(again);
    }

    pane.appendChild(wrap);
    return pane;
  }

  /* ---------- demo scenario drawer ------------------------------------------ */
  var scenarioDrawerWired = false;
  function wireScenarioDrawer() {
    if (scenarioDrawerWired) return;
    scenarioDrawerWired = true;
    var scrim = document.getElementById("cdw-scrim");
    var drawer = document.getElementById("cdw-demo");
    var list = document.getElementById("cdw-demo-list");
    var closeBtn = document.getElementById("cdw-demo-close");
    var clearBtn = document.getElementById("cdw-demo-clear");
    var opener = document.querySelector("[data-demo-open]");
    if (!drawer || !list) return;
    function openDrawer() {
      renderScenarioList();
      if (scrim) scrim.hidden = false;
      drawer.hidden = false;
      if (opener) opener.setAttribute("aria-expanded", "true");
    }
    function closeDrawer() {
      if (scrim) scrim.hidden = true;
      drawer.hidden = true;
      if (opener) opener.setAttribute("aria-expanded", "false");
    }
    function renderScenarioList() {
      list.innerHTML = "";
      var cur = store.activeScenario && store.activeScenario();
      store.scenarios().forEach(function (name) {
        var b = btn("pm-btn", humanize(name));
        b.style.justifyContent = "flex-start";
        b.style.textAlign = "start";
        if (cur === name) b.setAttribute("data-variant", "primary");
        b.addEventListener("click", function () {
          store.setScenario(name);
          closeDrawer();
          toast("Scenario: " + humanize(name));
          renderAll({ keepScroll: true });
        });
        list.appendChild(b);
      });
    }
    if (opener) opener.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (scrim) scrim.addEventListener("click", closeDrawer);
    if (clearBtn) clearBtn.addEventListener("click", function () {
      store.setScenario(null);
      closeDrawer();
      renderAll({ keepScroll: true });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") return;
      if (!drawer.hidden) { ev.stopPropagation(); closeDrawer(); return; }
      if (facetDrawer) { ev.stopPropagation(); closeFacetDrawer(); return; }
      if (resultsEl && !resultsEl.hasAttribute("hidden")) return; // dropdown handles its own Escape
      if (backStack.length) { goBack(); }
    });
  }

  /* ---------- boot ----------------------------------------------------------- */
  function boot() {
  if (window.PMShell && window.PMShell.init) window.PMShell.init();
    if (!buildChrome()) return;
    wireSearch();
    wireScenarioDrawer();
    try {
      if (rootEl && rootEl.clientWidth && rootEl.clientWidth <= 940 && navEl) navEl.setAttribute("hidden", "");
    } catch (e) { /* noop */ }
    renderAll({});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /*__CDW_APPEND__*/
})();
