/* ============================================================================
   concept-05.js — A1 Directory / Take 1 (kimi-k3)
   ----------------------------------------------------------------------------
   A crisp, quiet, directory-first Settings system. Home is a spatial
   directory: current-Project identity, one large universal search above the
   content, a single compact attention block, then a dominant two-column
   directory of destination cards. Destinations expand from cards into
   workspaces; deeper navigation moves right-to-left and Back reverses.

   Consumes the shared headless v2 layer only (inventory / registry / store /
   search / copy / objects / menu standard). All visible UI is native to this
   concept. Vanilla ES5-style IIFE; no frameworks.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- boot data ---------------------------------------------------- */
  var CONCEPT_ID = "concept-05-directory-take-1";
  var INV = window.PM_V2_INVENTORY;
  var REG = window.PM_V2_REGISTRY;
  var CORE = window.PM_CORE_DATA;
  var store = window.PM_V2_STORE.for(CONCEPT_ID);
  var OBJECTS = window.PM_V2_OBJECTS.objects();
  var searchIndex = window.PM_V2_SEARCH.buildIndex({
    inventory: INV,
    registry: REG,
    coreData: CORE,
    objects: window.PM_V2_OBJECTS.searchObjects(),
    workflows: window.PM_V2_OBJECTS.workflows(),
    diagnostics: window.PM_V2_OBJECTS.diagnostics(),
    help: window.PM_V2_OBJECTS.help()
  });
  var searchSession = window.PM_V2_SEARCH.createSession(searchIndex, { limit: 12 });

  var rootEl, barEl, backBtn, navEl, mainEl, toastsEl, barSearchWrap, barSearchInput, barSearchDrop;
  var navStack = [{ view: "home" }];
  var copyEngine = null;
  var providerById = {};
  (CORE.providers || []).forEach(function (p) { providerById[p.id] = p; });

  /* ---------- tiny DOM helpers --------------------------------------------- */
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
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  /* ---------- icons (stroke SVG, currentColor) ------------------------------ */
  var ICONS = {
    palette: '<circle cx="12" cy="12" r="8.5"/><circle cx="8.6" cy="9.6" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.4" cy="9.6" r="1.1" fill="currentColor" stroke="none"/><path d="M12 20.5c4.7 0 8.5-3.8 8.5-8.5"/>',
    brain: '<path d="M9.5 4.5A2.8 2.8 0 0 0 6.8 7.3 2.9 2.9 0 0 0 4.5 12a2.9 2.9 0 0 0 2.3 4.7A2.8 2.8 0 0 0 11 19.3V6.2a2.8 2.8 0 0 0-1.5-1.7z"/><path d="M14.5 4.5a2.8 2.8 0 0 1 2.7 2.8A2.9 2.9 0 0 1 19.5 12a2.9 2.9 0 0 1-2.3 4.7 2.8 2.8 0 0 1-4.2 2.6V6.2a2.8 2.8 0 0 1 1.5-1.7z"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>',
    database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    checklist: '<path d="m4 6 1.5 1.5L8 5M11 6h9M4 12l1.5 1.5L8 11M11 12h9M4 18l1.5 1.5L8 17M11 18h9"/>',
    branch: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.2 6.8 15.8 11"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-5 3 3 3-3 3 3"/>',
    globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.3 3.8 5 3.8 8s-1.3 5.7-3.8 8c-2.5-2.3-3.8-5-3.8-8S9.5 6.3 12 4z"/>',
    person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.5 3.8-5 7-5s5.8 1.5 7 5"/>',
    people: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5"/><circle cx="16.5" cy="9.5" r="2.5"/><path d="M15.5 14.7c2.3.2 4 1.6 5 4.3"/>',
    puzzle: '<path d="M10 3.5h4V7h3.5v4H14v3.5h3.5v4H14V15h-4v3.5H6.5V15H10v-3.5H6.5v-4H10z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12z"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>',
    "check-spelling": '<path d="m4 15 4-8 4 8M5.4 12h5.2M13 16l2.5 2.5L20 14"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
    folder: '<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>',
    language: '<path d="M4 6h9M8.5 4v2c0 3-2 5.5-4.5 7M6 9c1 2.5 3 4.5 5.5 5.5M12 20l4-9 4 9M13.5 17h5"/>',
    format: '<path d="M15 4l5 5-8.5 8.5H6.5V12.5z"/><path d="M13 6l5 5"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.6 4.7L4 16.1V20h3.9l4.9-4.9a4 4 0 0 0 4.7-5.6L14 13l-3-3z"/>',
    beaker: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3M7.5 14h9"/>',
    box: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    command: '<path d="M9 9h6v6H9zM9 9H7a2 2 0 1 1 2-2zM15 9h2a2 2 0 1 0-2-2zM15 15h2a2 2 0 1 1-2 2zM9 15H7a2 2 0 1 0 2 2z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    plug: '<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5zM12 16v5"/>',
    mortarboard: '<path d="m2 9 10-5 10 5-10 5zM6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5"/>',
    stethoscope: '<path d="M6 3H5a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1M9 15v2a5 5 0 0 0 10 0v-1"/><circle cx="19" cy="13" r="2.5"/>',
    "hard-drive": '<rect x="3" y="10" width="18" height="8" rx="2"/><path d="M7 14h.01M17 14h.01M5.5 10 7.5 5h9l2 5"/>',
    safe: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="11" r="3.5"/><path d="M12 7.5v1.2M12 13.3v1.2M8.5 11h1.2M14.3 11h1.2M8 21v-2M16 21v-2"/>',
    recycle: '<path d="M4 12a8 8 0 0 1 13.6-5.6M20 12a8 8 0 0 1-13.6 5.6"/><path d="M17.5 3v3.5H14M6.5 21v-3.5H10"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3.5 2"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',
    broom: '<path d="M15 3l6 6M14 5l-7 9-3 7 7-3 9-7z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5M3 17l9 5 9-5"/>',
    "play-circle": '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 6 3.5-6 3.5z"/>',
    steering: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 14.5V21M9.6 10.9 3.4 9M14.4 10.9 20.6 9"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    "chevron-r": '<path d="m9 6 6 6-6 6"/>',
    "chevron-l": '<path d="m15 6-6 6 6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    dots: '<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    home: '<path d="m4 11 8-7 8 7M6 9.5V20h12V9.5"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="5" cy="18" r="1" fill="currentColor" stroke="none"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    warn: '<path d="M12 4 2.5 20h19zM12 10v4M12 17.5h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/>',
    check: '<path d="m5 13 4 4L19 7"/>'
  };
  function icon(name, size) {
    var w = document.createElement("span");
    w.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (size ? ' style="inline-size:' + size + 'px;block-size:' + size + 'px"' : "") +
      ">" + (ICONS[name] || ICONS.gear) + "</svg>";
    return w.firstChild;
  }

  /* ---------- misc helpers --------------------------------------------------- */
  function slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function catById(id) {
    for (var i = 0; i < INV.categories.length; i++) if (INV.categories[i].id === id) return INV.categories[i];
    return null;
  }
  function subgroupById(cat, subId) {
    if (!cat) return null;
    for (var i = 0; i < cat.subgroups.length; i++) if (cat.subgroups[i].id === subId) return cat.subgroups[i];
    return null;
  }
  function domainTitle(id) { var d = REG.domainById(id); return d ? d.title : id; }
  function settingCount(domainId) {
    var c = catById(domainId), n = 0;
    if (c) c.subgroups.forEach(function (s) { n += s.settings.length; });
    return n;
  }
  function fmtVal(v) {
    if (v == null || v === "") return "Not configured";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (Object.prototype.toString.call(v) === "[object Array]") return v.length ? v.join(", ") : "None";
    if (typeof v === "object") { var ks = Object.keys(v); return ks.length ? ks.length + " entries" : "None"; }
    return String(v);
  }
  function ownerById(id) {
    for (var i = 0; i < REG.DEFERRED_OWNERS.length; i++) if (REG.DEFERRED_OWNERS[i].id === id) return REG.DEFERRED_OWNERS[i];
    return null;
  }
  function healthKind(h) {
    if (h === "ready" || h === "ok") return "ok";
    if (h === "degraded" || h === "attention" || h === "warn") return "warn";
    if (h === "down" || h === "error") return "danger";
    return "unknown";
  }
  function scenarioFor(surfaceId) { return store.projection(surfaceId); }
  function scenarioStrip(surfaceId) {
    var p = scenarioFor(surfaceId);
    if (!p || p.state === "ready" || !p.message) return null;
    var s = el("div", "d05-strip");
    s.setAttribute("data-tone", p.state === "offline" || p.state === "managed" || p.state === "unavailable" ? "warn" : "info");
    s.appendChild(icon(p.state === "offline" ? "warn" : "info"));
    s.appendChild(el("span", null, p.message + (p.cached ? " (Showing cached values.)" : "")));
    return s;
  }

  /* ---------- toasts ---------------------------------------------------------- */
  function toast(kind, text) {
    var t = el("div", "d05-toast");
    t.setAttribute("data-kind", kind);
    t.appendChild(icon(kind === "ok" ? "check" : kind === "warn" || kind === "danger" ? "warn" : "info"));
    t.appendChild(el("span", null, text));
    toastsEl.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 4200);
  }

  /* ---------- observable operations -------------------------------------------- */
  function runOp(title, phaseNames, onDone) {
    var op = store.begin({
      kind: "concept-op",
      title: title,
      phases: phaseNames.map(function (n) { return { name: n }; })
    });
    var i = 0;
    (function step() {
      if (i < op.phases.length) {
        store.completePhase(op.id);
        i += 1;
        setTimeout(step, 220);
      } else {
        store.finish(op.id, "done");
        if (onDone) onDone(op);
      }
    })();
    return op;
  }

  /* ---------- navigation -------------------------------------------------------- */
  function currentRoute() { return navStack[navStack.length - 1]; }
  function routeName(r) {
    if (!r) return "Settings";
    switch (r.view) {
      case "home": return "Settings Home";
      case "domain": return domainTitle(r.domain);
      case "section": {
        var sub = subgroupById(catById(r.domain), r.section);
        return sub ? sub.title : domainTitle(r.domain);
      }
      case "manager": {
        var m = REG.managerById(r.manager);
        if (m && r.object) {
          var objs = OBJECTS[m.objectSource] || [];
          for (var i = 0; i < objs.length; i++) if (objs[i].id === r.object) return m.title + " — " + objs[i].label;
        }
        return m ? m.title : "Manager";
      }
      case "owner": { var o = ownerById(r.owner); return o ? o.family : "Owned area"; }
      case "all": return "All Settings";
      case "results": return "Search results";
      case "copy": return "Copy Settings From Another Project";
    }
    return "Settings";
  }
  function navigate(route) {
    navStack.push(route);
    render(route, "deep");
  }
  function goBack() {
    if (navStack.length <= 1) return;
    navStack.pop();
    render(currentRoute(), "back");
    restoreSearchIfSaved();
  }
  function goHome() { navStack = [{ view: "home" }]; render(currentRoute(), "back"); }
  function openDomain(id) { navigate({ view: "domain", domain: id }); }
  function openSection(domain, section, row, locate) {
    var r = { view: "section", domain: domain, section: section };
    if (row) r.row = row;
    if (locate) r.locate = locate;
    navigate(r);
  }
  function openManager(managerId, opts) {
    var m = REG.managerById(managerId);
    if (!m) return;
    var r = { view: "manager", domain: m.domain, manager: managerId };
    if (opts) for (var k in opts) r[k] = opts[k];
    navigate(r);
  }
  function openOwner(id) { navigate({ view: "owner", owner: id, domain: "system" }); }
  function openAll() { navigate({ view: "all", facets: (currentRoute().view === "all" ? currentRoute().facets : null) }); }
  function openCopy() { copyEngine = new window.PM_V2_COPY.CopyEngine(store, INV, REG); navigate({ view: "copy", domain: "system" }); }
  function openResults(query) { navigate({ view: "results", query: query }); }

  /* ---------- chrome ------------------------------------------------------------- */
  function buildChrome() {
    rootEl = document.getElementById("d05-root");
    clear(rootEl);

    barEl = el("div", "d05-bar");
    var navBtn = btn("pm-btn d05-navbtn", "Menu");
    navBtn.setAttribute("data-variant", "quiet");
    navBtn.setAttribute("aria-label", "Open the settings directory");
    navBtn.addEventListener("click", function () { directoryMenu(navBtn); });
    barEl.appendChild(navBtn);

    backBtn = btn("pm-btn d05-backbtn", "Back");
    backBtn.setAttribute("data-variant", "quiet");
    backBtn.hidden = true;
    backBtn.addEventListener("click", goBack);
    barEl.appendChild(backBtn);

    barEl.appendChild(el("span", "d05-bar-title", "Settings"));

    var proj = el("span", "d05-bar-project");
    proj.appendChild(icon("folder"));
    proj.appendChild(el("span", null, store.currentProject().name + " — current project"));
    barEl.appendChild(proj);

    barEl.appendChild(el("span", "d05-bar-spacer"));

    barSearchWrap = el("span", "d05-bar-search");
    barSearchWrap.hidden = true;
    barSearchWrap.appendChild(icon("search"));
    barSearchInput = document.createElement("input");
    barSearchInput.type = "search";
    barSearchInput.placeholder = "Search settings";
    barSearchInput.setAttribute("aria-label", "Search all settings");
    barSearchInput.setAttribute("autocomplete", "off");
    barSearchWrap.appendChild(barSearchInput);
    barSearchDrop = el("div", "d05-results pmv2-scroll");
    barSearchDrop.hidden = true;
    barSearchWrap.appendChild(barSearchDrop);
    barEl.appendChild(barSearchWrap);

    var moreBtn = btn("pm-btn", "");
    moreBtn.setAttribute("data-variant", "quiet");
    moreBtn.setAttribute("aria-label", "More settings actions");
    moreBtn.appendChild(icon("dots"));
    moreBtn.addEventListener("click", function () { overflowMenu(moreBtn); });
    barEl.appendChild(moreBtn);

    var closeBtn = btn("pm-btn", "Close");
    closeBtn.addEventListener("click", closeSettings);
    barEl.appendChild(closeBtn);

    var body = el("div", "d05-body");
    navEl = el("nav", "d05-nav pmv2-scroll");
    navEl.setAttribute("aria-label", "Settings directory");
    buildNav();
    mainEl = el("div", "d05-main pmv2-scroll");
    body.appendChild(navEl);
    body.appendChild(mainEl);

    toastsEl = el("div", "d05-toasts");

    rootEl.appendChild(barEl);
    rootEl.appendChild(body);
    rootEl.appendChild(toastsEl);
  }

  function navItem(label, iconName, route, key) {
    var b = btn("d05-nav-item", "");
    b.appendChild(icon(iconName));
    b.appendChild(el("span", null, label));
    b.setAttribute("data-nav", key);
    b.addEventListener("click", function () {
      if (key === "home") goHome();
      else if (key === "all") openAll();
      else if (key === "copy") openCopy();
      else openDomain(key);
    });
    return b;
  }
  function buildNav() {
    clear(navEl);
    navEl.appendChild(navItem("Home", "home", null, "home"));
    navEl.appendChild(el("div", "d05-nav-sep"));
    navEl.appendChild(el("div", "d05-nav-label", "Directory"));
    REG.DOMAINS.forEach(function (d) {
      var cat = catById(d.id);
      navEl.appendChild(navItem(d.title, cat ? cat.icon : "folder", null, d.id));
    });
    navEl.appendChild(el("div", "d05-nav-sep"));
    navEl.appendChild(el("div", "d05-nav-label", "Utilities"));
    navEl.appendChild(navItem("All Settings", "list", null, "all"));
    navEl.appendChild(navItem("Copy Settings From Another Project", "copy", null, "copy"));
  }

  function syncChrome(route) {
    var depth = navStack.length;
    backBtn.hidden = depth <= 1;
    if (depth > 1) {
      var target = routeName(navStack[depth - 2]);
      backBtn.textContent = "Back to " + target;
      backBtn.setAttribute("title", "Back to " + target);
    }
    barSearchWrap.hidden = route.view === "home";
    var items = navEl.querySelectorAll("[data-nav]");
    for (var i = 0; i < items.length; i++) {
      var key = items[i].getAttribute("data-nav");
      var current =
        (route.view === "home" && key === "home") ||
        (route.view === "all" && key === "all") ||
        (route.view === "copy" && key === "copy") ||
        ((route.view === "domain" || route.view === "section" || route.view === "manager" || route.view === "owner") && key === route.domain);
      if (current) items[i].setAttribute("aria-current", "page");
      else items[i].removeAttribute("aria-current");
    }
    mountSearch(route);
  }

  function overflowMenu(anchor) {
    window.PMV2Menu.open(anchor, [
      { label: "All Settings", hint: "828 rows", action: function () { openAll(); } },
      { label: "Copy Settings From Another Project", action: function () { openCopy(); } },
      { label: "Demo scenarios", action: function () { openDemoDrawer(); } },
      { sep: true },
      { label: "Close Settings", action: closeSettings }
    ], { placement: "bottom-end", ariaLabel: "More settings actions" });
  }
  function directoryMenu(anchor) {
    var items = [{ label: "Home", action: goHome }, { sep: true }];
    REG.DOMAINS.forEach(function (d) {
      items.push({ label: d.title, action: function () { openDomain(d.id); } });
    });
    items.push({ sep: true });
    items.push({ label: "All Settings", action: function () { openAll(); } });
    items.push({ label: "Copy Settings From Another Project", action: function () { openCopy(); } });
    window.PMV2Menu.open(anchor, items, { placement: "bottom-start", ariaLabel: "Settings directory" });
  }
  function closeSettings() {
    goHome();
    toast("info", "Settings closed. The demo stays open so you can keep inspecting it.");
  }

  /* ---------- universal search ------------------------------------------------------ */
  var searchUI = { field: null, drop: null, results: [], selected: -1, open: false, query: "" };
  var TYPE_ORDER = ["setting", "manager", "managed_object", "action", "setup_or_repair_workflow", "diagnostic_or_read_only_status", "unavailable_capability", "intentional_help_result"];
  var TYPE_LABEL = {
    setting: "Setting", manager: "Page", managed_object: "Object", action: "Action",
    setup_or_repair_workflow: "Setup", diagnostic_or_read_only_status: "Status",
    unavailable_capability: "Unavailable", intentional_help_result: "Help"
  };
  var TYPE_GROUP = {
    setting: "Settings", manager: "Pages & managers", managed_object: "Objects", action: "Actions",
    setup_or_repair_workflow: "Setup & repair", diagnostic_or_read_only_status: "Status",
    unavailable_capability: "Unavailable", intentional_help_result: "Help"
  };

  function mountSearch(route) {
    var field, drop;
    if (route.view === "home") {
      field = mainEl.querySelector(".d05-hero-box input");
      drop = mainEl.querySelector(".d05-hero .d05-results");
    } else {
      field = barSearchInput;
      drop = barSearchDrop;
    }
    if (searchUI.field && searchUI.field !== field) searchUI.field.removeAttribute("id");
    if (searchUI.drop && searchUI.drop !== drop) searchUI.drop.removeAttribute("id");
    searchUI.field = field;
    searchUI.drop = drop;
    searchUI.selected = -1;
    if (field) {
      field.id = "pmv2-search";
      if (!field.getAttribute("data-d05-bound")) {
        field.setAttribute("data-d05-bound", "1");
        field.addEventListener("input", onSearchInput);
        field.addEventListener("keydown", onSearchKey);
        field.addEventListener("focus", function () {
          if (searchUI.query && searchUI.results.length) openSearch();
        });
      }
    }
    if (drop) drop.id = "pmv2-results";
  }

  function onSearchInput() {
    var q = searchUI.field.value;
    searchUI.query = q;
    if (!q.trim()) { closeSearch(); return; }
    runSearch(q, null);
  }
  function runSearch(q, preselectId) {
    if (store.activeScenario() === "no-results") {
      searchUI.results = [];
      renderHitsEmpty(q);
      return;
    }
    searchSession.query(q, function (results, meta) {
      if (searchUI.query !== q) return;
      searchUI.results = results;
      searchUI.meta = meta;
      renderHits(q, results, meta, preselectId);
    });
  }
  function markTokens(label, q) {
    var frag = document.createDocumentFragment();
    var tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var rest = label;
    while (rest.length) {
      var best = -1, bestTok = null, i;
      for (i = 0; i < tokens.length; i++) {
        var at = rest.toLowerCase().indexOf(tokens[i]);
        if (at >= 0 && (best < 0 || at < best)) { best = at; bestTok = tokens[i]; }
      }
      if (best < 0) { frag.appendChild(document.createTextNode(rest)); break; }
      if (best > 0) frag.appendChild(document.createTextNode(rest.slice(0, best)));
      var m = el("mark", null, rest.slice(best, best + bestTok.length));
      frag.appendChild(m);
      rest = rest.slice(best + bestTok.length);
    }
    return frag;
  }
  function hitRow(entry, q) {
    var b = btn("d05-hit", "");
    b.setAttribute("role", "option");
    b.setAttribute("data-result-id", entry.immutableResultId);
    b.setAttribute("aria-selected", "false");
    var label = el("span", "d05-hit-label");
    label.appendChild(markTokens(entry.label, q));
    b.appendChild(label);
    b.appendChild(el("span", "d05-hit-kind", TYPE_LABEL[entry.type] || entry.type));
    b.appendChild(el("span", "d05-hit-path", entry.path));
    if (entry.availability) b.appendChild(el("span", "d05-hit-avail", entry.availability));
    b.addEventListener("click", function () { activateResult(entry.immutableResultId); });
    b.addEventListener("mousemove", function () { selectHit(-2, b); });
    return b;
  }
  function renderHits(q, results, meta, preselectId) {
    var drop = searchUI.drop;
    if (!drop) return;
    clear(drop);
    if (!results.length) { renderHitsEmpty(q); return; }
    var byType = {};
    results.forEach(function (e) { (byType[e.type] = byType[e.type] || []).push(e); });
    TYPE_ORDER.forEach(function (t) {
      var list = byType[t];
      if (!list || !list.length) return;
      if (TYPE_ORDER.filter(function (x) { return byType[x]; }).length > 1) {
        drop.appendChild(el("div", "d05-hit-group", TYPE_GROUP[t]));
      }
      list.forEach(function (e) { drop.appendChild(hitRow(e, q)); });
    });
    if (meta && meta.bounded) {
      var all = btn("d05-hit-all", "View all " + meta.total + " results");
      all.addEventListener("click", function () {
        closeSearch();
        openResults(q);
      });
      drop.appendChild(all);
    }
    searchUI.selected = -1;
    if (preselectId) {
      var rows = drop.querySelectorAll("[data-result-id]");
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].getAttribute("data-result-id") === preselectId) { selectHit(i); break; }
      }
    }
    openSearch();
  }
  function renderHitsEmpty(q) {
    var drop = searchUI.drop;
    if (!drop) return;
    clear(drop);
    drop.appendChild(el("div", "d05-hits-empty",
      store.activeScenario() === "no-results"
        ? "No results for “" + q + "”. Check the spelling or try fewer words."
        : "No matches for “" + q + "”."));
    openSearch();
  }
  function openSearch() { if (searchUI.drop) { searchUI.drop.hidden = false; searchUI.open = true; } }
  function closeSearch() {
    if (searchUI.drop) searchUI.drop.hidden = true;
    searchUI.open = false;
    searchUI.selected = -1;
  }
  function hitRows() { return searchUI.drop ? searchUI.drop.querySelectorAll(".d05-hit") : []; }
  function selectHit(idx, node) {
    var rows = hitRows();
    if (!rows.length) return;
    if (idx === -2 && node) {
      for (var i = 0; i < rows.length; i++) if (rows[i] === node) { idx = i; break; }
    }
    idx = ((idx % rows.length) + rows.length) % rows.length;
    for (var j = 0; j < rows.length; j++) rows[j].setAttribute("aria-selected", j === idx ? "true" : "false");
    searchUI.selected = idx;
    if (rows[idx] && rows[idx].scrollIntoView) {
      try { rows[idx].scrollIntoView({ block: "nearest" }); } catch (e) { rows[idx].scrollIntoView(false); }
    }
  }
  function onSearchKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!searchUI.open && searchUI.field.value.trim()) { onSearchInput(); return; }
      selectHit(searchUI.selected + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectHit(searchUI.selected - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      var rows = hitRows();
      var pick = searchUI.selected >= 0 ? searchUI.selected : 0;
      if (rows[pick]) activateResult(rows[pick].getAttribute("data-result-id"));
    } else if (e.key === "Escape") {
      if (searchUI.open) { e.stopPropagation(); closeSearch(); }
    }
  }
  function activateResult(id) {
    var entry = window.PM_V2_SEARCH.resolve(searchIndex, id);
    if (!entry) return;
    store.saveSearchState(searchUI.query, id);
    closeSearch();
    routeEntry(entry);
  }
  function restoreSearchIfSaved() {
    var st = store.searchState();
    if (!st || !st.resultId) return;
    store.saveSearchState("", null);
    if (!searchUI.field) return;
    searchUI.field.value = st.query || "";
    searchUI.query = st.query || "";
    if (st.query) runSearch(st.query, st.resultId);
  }

  /* ---------- search routing (immutable result IDs only) ----------------------------- */
  function routeEntry(entry) {
    var d = entry.destination || {};
    if (entry.type === "action") { runSearchAction(entry); return; }
    var route = null;
    if (d.manager && d.manager.indexOf("owner-") === 0) {
      route = { view: "owner", owner: d.manager.slice(6), domain: "system" };
    } else if (d.manager === "lifecycle" && (d.page === "copy" || d.section === "copy")) {
      openCopy();
      return;
    } else if (d.manager) {
      var m = REG.managerById(d.manager);
      if (m) {
        route = { view: "manager", domain: m.domain, manager: m.id };
        if (d.object) route.object = d.object;
        if (d.section) route.section = d.section;
        else if (d.page) route.page = d.page;
      }
    } else if (d.row || d.section || d.page) {
      var cat = catById(d.domain);
      var sub = subgroupById(cat, d.section || d.page);
      if (sub) {
        route = { view: "section", domain: d.domain, section: sub.id };
        if (d.row) route.row = d.row;
      }
    } else if (d.domain) {
      route = { view: "domain", domain: d.domain };
    }
    if (!route) route = { view: "home" };
    route.locate = d;
    navigate(route);
  }

  var ACTION_TARGET_ALIAS = {
    permissions: { manager: "permissions" }, goal: { manager: "goal" },
    terminal: { manager: "terminal" }, devtools: { manager: "mcp" },
    context: { manager: "memory" }, providers: { manager: "providers" }
  };
  function goCoreTarget(target) {
    if (!target) { goHome(); return; }
    if (target.manager) { openManager(target.manager, target.tab ? { section: target.tab } : null); return; }
    var alias = target.category ? ACTION_TARGET_ALIAS[target.category] : null;
    if (alias) { openManager(alias.manager); return; }
    if (target.category && REG.domainById(target.category)) { openDomain(target.category); return; }
    if (target.setting && INV.settings[target.setting]) {
      var s = INV.settings[target.setting];
      openSection(s.domain, s.subgroup, s.id, { domain: s.domain, section: s.subgroup, row: s.id });
      return;
    }
    goHome();
  }
  function runSearchAction(entry) {
    var label = entry.label;
    if (label === "Copy Settings From Another Project") { openCopy(); return; }
    if (label === "Open Settings Home") { goHome(); return; }
    if (label === "Reset demo data") {
      var o = store.overrides();
      Object.keys(o).forEach(function (k) { store.resetValue(k); });
      toast("ok", "Demo data reset. Every setting is back to its fixture value.");
      goHome();
      return;
    }
    var core = null;
    (CORE.actions || []).forEach(function (a) { if (a.title === label) core = a; });
    if (core && core.target) { goCoreTarget(core.target); return; }
    goHome();
  }

  /* ---------- render dispatch --------------------------------------------------------- */
  function render(route, dir, keepScroll) {
    closeSearch();
    var scrollTop = keepScroll ? mainEl.scrollTop : 0;
    var view = el("div", "d05-view");
    if (dir) view.setAttribute("data-dir", dir);
    buildView(route, view);
    clear(mainEl);
    mainEl.appendChild(view);
    mainEl.scrollTop = scrollTop;
    syncChrome(route);
    if (route.locate) {
      var dest = route.locate;
      route.locate = null;
      locateTarget(dest);
    }
  }
  function buildView(route, view) {
    switch (route.view) {
      case "home": viewHome(route, view); break;
      case "domain": viewDomain(route, view); break;
      case "section": viewSection(route, view); break;
      case "manager": viewManager(route, view); break;
      case "owner": viewOwner(route, view); break;
      case "all": viewAll(route, view); break;
      case "results": viewResults(route, view); break;
      case "copy": viewCopy(route, view); break;
      default: viewHome({ view: "home" }, view);
    }
  }
  function locateTarget(dest) {
    var sel = null;
    if (dest.row) sel = '[data-setting-id="' + dest.row + '"]';
    else if (dest.object) sel = '[data-object-id="' + dest.object + '"]';
    else if (dest.section) sel = '[data-section-id="' + dest.section + '"]';
    else if (dest.manager) sel = '[data-manager-id="' + dest.manager + '"]';
    else if (dest.domain) sel = '[data-domain-id="' + dest.domain + '"]';
    if (!sel) return;
    var node = mainEl.querySelector(sel);
    if (!node) return;
    try { node.scrollIntoView({ block: "center" }); } catch (e) { node.scrollIntoView(false); }
    node.classList.add("pmv2-locate");
    if (node.focus && node.tabIndex >= 0) { try { node.focus({ preventScroll: true }); } catch (e2) { } }
  }

  /* ---------- shared interior pieces ---------------------------------------------------- */
  function pad(view) { var p = el("div", "d05-pad"); view.appendChild(p); return p; }
  function crumbs(items) {
    var c = el("div", "d05-crumbs");
    items.forEach(function (it, i) {
      if (i > 0) c.appendChild(el("span", "d05-crumb-sep", "/"));
      if (it.route) {
        var b = btn("", it.label);
        b.addEventListener("click", function () {
          while (navStack.length > 1 && currentRoute() !== it.route) navStack.pop();
          if (currentRoute() !== it.route) navStack.push(it.route);
          render(currentRoute(), "back");
        });
        c.appendChild(b);
      } else {
        var s = el("span", null, it.label);
        s.setAttribute("aria-current", "page");
        c.appendChild(s);
      }
    });
    return c;
  }
  function heroHead(iconName, title, blurb, metaNodes) {
    var h = el("div", "d05-hero-head");
    var ic = el("span", "d05-hero-icon");
    ic.appendChild(icon(iconName));
    h.appendChild(ic);
    var main = el("div");
    main.appendChild(el("h1", "d05-hero-title", title));
    if (blurb) main.appendChild(el("p", "d05-hero-blurb", blurb));
    h.appendChild(main);
    if (metaNodes && metaNodes.length) {
      var meta = el("span", "d05-hero-meta");
      metaNodes.forEach(function (n) { meta.appendChild(n); });
      h.appendChild(meta);
    }
    return h;
  }
  function badge(kind, attrs, text) {
    var b = el("span", "pm-badge", text);
    b.setAttribute("data-kind", kind);
    for (var k in attrs) b.setAttribute(k, attrs[k]);
    return b;
  }
  function destRow(opts) {
    var b = btn("d05-row-dest", "");
    if (opts.hook) b.setAttribute(opts.hook.name, opts.hook.value);
    var ic = el("span", "d05-card-icon");
    ic.appendChild(icon(opts.icon));
    b.appendChild(ic);
    var main = el("span", "d05-card-main");
    main.appendChild(el("span", "d05-row-dest-title", opts.title));
    if (opts.sub) main.appendChild(el("span", "d05-row-dest-sub", opts.sub));
    b.appendChild(main);
    if (opts.meta) b.appendChild(el("span", "d05-row-dest-meta", opts.meta));
    var chev = el("span", "d05-card-chev");
    chev.appendChild(icon("chevron-r"));
    b.appendChild(chev);
    b.addEventListener("click", opts.go);
    return b;
  }

  /* ---------- setting row grammar (Ordinary setting grammar) ------------------------------ */
  function effectiveState(s) {
    var p = scenarioFor("settings");
    if (p.state === "managed") return "managed";
    if (p.state === "unavailable") return "unavailable";
    if (s.state === "managed" || s.state === "unavailable") return s.state;
    return store.overrideInfo(s.id) ? "custom" : s.state;
  }
  function stateReason(s, state) {
    if (state === "managed") return s.source && s.source !== "Default" ? s.source : "Managed by organization policy. You can view but not change this.";
    if (state === "unavailable") return s.source && s.source !== "Default" ? s.source : "Unavailable for the current configuration.";
    return null;
  }
  function settingRow(s) {
    var state = effectiveState(s);
    var locked = state === "managed" || state === "unavailable";
    var box = el("div", "d05-setrow");
    box.setAttribute("data-setting-id", s.id);

    var row = el("div", "pm-row");
    row.setAttribute("data-state", state);
    row.setAttribute("data-exposure", s.exposure || "standard");

    var main = el("div", "pm-row-main");
    var lab = el("div", "pm-row-label");
    lab.appendChild(el("span", null, s.label));
    if (s.exposure === "advanced") lab.appendChild(badge("exposure", { "data-exposure": "advanced" }, "Advanced"));
    if (s.tier === "advanced" && s.exposure !== "advanced") lab.appendChild(badge("exposure", { "data-exposure": "advanced" }, "Advanced"));
    main.appendChild(lab);
    if (s.desc) main.appendChild(el("div", "pm-row-desc", s.desc));
    row.appendChild(main);

    var ctl = el("div", "pm-row-control");
    ctl.appendChild(controlFor(s, locked));
    row.appendChild(ctl);

    var st = el("div", "pm-row-state");
    st.appendChild(badge("state", { "data-state": state }, state === "custom" ? "Custom" : state === "managed" ? "Managed" : state === "unavailable" ? "Unavailable" : "Default"));
    row.appendChild(st);

    var reason = stateReason(s, state);
    if (reason) row.appendChild(el("div", "pm-row-reason", reason));
    box.appendChild(row);

    var why = el("div", "d05-why");
    var acc = el("details", "pm-accordion");
    var sum = el("summary", null, "Why this value?");
    acc.appendChild(sum);
    var body = el("div", "pm-accordion-body");
    body.appendChild(el("p", null, "Default: " + fmtVal(s["default"]) + ". Recommended: " + fmtVal(s.recommended) + ". Source: " + (s.source || "Default") + "."));
    var info = store.overrideInfo(s.id);
    if (info) body.appendChild(el("p", null, "You changed this on " + info.at.slice(0, 10) + " to " + fmtVal(info.value) + "."));
    if (s.desc && s.desc.length > 120) body.appendChild(el("p", null, s.desc));
    var reset = btn("pm-btn", "Reset to default");
    reset.disabled = !info;
    reset.addEventListener("click", function () {
      store.resetValue(s.id);
      toast("ok", "“" + s.label + "” is back to its default.");
    });
    body.appendChild(reset);
    acc.appendChild(body);
    why.appendChild(acc);
    box.appendChild(why);
    return box;
  }

  function commitValue(s, v) {
    store.setValue(s.id, v);
    var p = scenarioFor("settings");
    if (p.state === "restart-required") toast("warn", "Restart Puppet Master to apply this change.");
    else if (p.state === "offline") toast("info", "Saved. It will apply when the connection returns.");
  }

  function controlFor(s, locked) {
    var val = store.value(s.id, s.value !== undefined ? s.value : s["default"]);
    var t = s.type;
    if (t === "toggle") {
      var sw = btn("pm-switch", "");
      sw.setAttribute("role", "switch");
      sw.setAttribute("aria-checked", val ? "true" : "false");
      sw.setAttribute("aria-label", s.label);
      sw.disabled = locked;
      sw.addEventListener("click", function () {
        var next = sw.getAttribute("aria-checked") !== "true";
        sw.setAttribute("aria-checked", next ? "true" : "false");
        commitValue(s, next);
      });
      return sw;
    }
    if (t === "select") {
      var wrap = el("span", "pm-select");
      var sel = document.createElement("select");
      sel.setAttribute("aria-label", s.label);
      sel.disabled = locked;
      (s.options || []).forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = o; opt.textContent = o;
        if (o === val) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", function () { commitValue(s, sel.value); });
      wrap.appendChild(sel);
      return wrap;
    }
    if (t === "radio") {
      var seg = el("span", "pm-seg");
      seg.setAttribute("role", "radiogroup");
      seg.setAttribute("aria-label", s.label);
      (s.options || []).forEach(function (o) {
        var b = btn("", String(o));
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", o === val ? "true" : "false");
        b.disabled = locked;
        b.addEventListener("click", function () { commitValue(s, o); });
        seg.appendChild(b);
      });
      return seg;
    }
    if (t === "slider") {
      var swp = el("span", "pm-sliderwrap");
      var rng = document.createElement("input");
      rng.type = "range";
      rng.className = "pm-slider";
      var numeric = typeof val === "number" ? val : 0.5;
      var small = numeric <= 1;
      rng.min = "0"; rng.max = small ? "1" : "100"; rng.step = small ? "0.05" : "1";
      rng.value = String(numeric);
      rng.setAttribute("aria-label", s.label);
      rng.disabled = locked;
      var bubble = el("span", "pm-slider-val", String(numeric));
      rng.addEventListener("input", function () { bubble.textContent = rng.value; });
      rng.addEventListener("change", function () { commitValue(s, parseFloat(rng.value)); });
      swp.appendChild(rng);
      swp.appendChild(bubble);
      return swp;
    }
    if (t === "number") {
      var stp = el("span", "pm-stepper");
      var down = btn("", "−");
      var input = document.createElement("input");
      input.type = "number";
      input.value = String(typeof val === "number" ? val : 0);
      input.setAttribute("aria-label", s.label);
      input.disabled = locked;
      down.disabled = locked;
      var up = btn("", "+");
      up.disabled = locked;
      down.addEventListener("click", function () { input.value = String((parseFloat(input.value) || 0) - 1); commitValue(s, parseFloat(input.value)); });
      up.addEventListener("click", function () { input.value = String((parseFloat(input.value) || 0) + 1); commitValue(s, parseFloat(input.value)); });
      input.addEventListener("change", function () { commitValue(s, parseFloat(input.value) || 0); });
      stp.appendChild(down); stp.appendChild(input); stp.appendChild(up);
      return stp;
    }
    if (t === "multiselect") {
      var ms = el("span", "pm-seg");
      ms.setAttribute("aria-label", s.label);
      var cur = Object.prototype.toString.call(val) === "[object Array]" ? val.slice() : [];
      (s.options || []).forEach(function (o) {
        var b = btn("", String(o));
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", cur.indexOf(o) >= 0 ? "true" : "false");
        b.disabled = locked;
        b.addEventListener("click", function () {
          var i = cur.indexOf(o);
          if (i >= 0) cur.splice(i, 1); else cur.push(o);
          b.setAttribute("aria-checked", cur.indexOf(o) >= 0 ? "true" : "false");
          commitValue(s, cur.slice());
        });
        ms.appendChild(b);
      });
      return ms;
    }
    if (t === "list" || t === "keyvalue") {
      var tw = el("span", "pm-text");
      tw.setAttribute("data-empty-hint", "not-configured");
      var ti = document.createElement("input");
      ti.type = "text";
      ti.value = t === "list"
        ? (Object.prototype.toString.call(val) === "[object Array]" ? val.join(", ") : "")
        : (val && typeof val === "object" ? Object.keys(val).map(function (k) { return k + "=" + val[k]; }).join(", ") : "");
      ti.setAttribute("aria-label", s.label + " (comma-separated)");
      ti.disabled = locked;
      ti.addEventListener("change", function () {
        if (t === "list") {
          commitValue(s, ti.value.split(",").map(function (x) { return x.trim(); }).filter(Boolean));
        } else {
          var obj = {};
          ti.value.split(",").forEach(function (pair) {
            var kv = pair.split("=");
            if (kv.length === 2 && kv[0].trim()) obj[kv[0].trim()] = kv[1].trim();
          });
          commitValue(s, obj);
        }
      });
      tw.appendChild(ti);
      return tw;
    }
    if (t === "action") {
      var ab = btn("pm-btn", "Run");
      ab.disabled = locked;
      ab.addEventListener("click", function () {
        runOp(s.label, ["Running"], function () { toast("ok", "“" + s.label + "” finished."); });
      });
      return ab;
    }
    /* text / path and anything else */
    var xw = el("span", "pm-text");
    xw.setAttribute("data-empty-hint", "not-configured");
    var xi = document.createElement("input");
    xi.type = "text";
    xi.value = val == null ? "" : String(val);
    xi.setAttribute("aria-label", s.label);
    xi.disabled = locked;
    xi.addEventListener("change", function () { commitValue(s, xi.value); });
    xw.appendChild(xi);
    return xw;
  }

  function settingRowsFor(subgroup) {
    var frag = document.createDocumentFragment();
    subgroup.settings.forEach(function (sid) {
      var s = INV.settings[sid];
      if (s) frag.appendChild(settingRow(s));
    });
    return frag;
  }

  /* ---------- Home ------------------------------------------------------------------------- */
  function viewHome(route, view) {
    var p = pad(view);
    var proj = store.currentProject();

    var id = el("div", "d05-home-id");
    var pr = el("span", "d05-proj");
    pr.appendChild(icon("folder"));
    pr.appendChild(el("span", null, "Current project: "));
    pr.appendChild(el("strong", null, proj.name));
    id.appendChild(pr);
    id.appendChild(el("span", "pm-faint", proj.path + " · " + proj.settings + " settings · updated " + proj.updated));
    p.appendChild(id);

    /* hero search above all content */
    var hero = el("div", "d05-hero");
    var wrap = el("div", "d05-searchwrap");
    var box = el("div", "d05-hero-box");
    box.appendChild(icon("search"));
    var input = document.createElement("input");
    input.type = "search";
    input.placeholder = "Search all 828 settings, pages, objects, and actions";
    input.setAttribute("aria-label", "Search all settings");
    input.setAttribute("autocomplete", "off");
    box.appendChild(input);
    box.appendChild(el("span", "d05-hero-kbd", "Ctrl K"));
    wrap.appendChild(box);
    var drop = el("div", "d05-results pmv2-scroll");
    drop.hidden = true;
    drop.setAttribute("role", "listbox");
    wrap.appendChild(drop);
    hero.appendChild(wrap);
    p.appendChild(hero);

    /* at most one critical banner */
    var dismissed = store.doc("dismissedNotices", {});
    var critical = null;
    (CORE.notices || []).forEach(function (n) {
      if (!critical && n.kind === "attention" && !dismissed[n.id]) critical = n;
    });
    if (critical) {
      var notice = el("div", "pm-notice");
      notice.setAttribute("data-kind", "attention");
      notice.appendChild(el("span", "pm-notice-chip", "Attention"));
      notice.appendChild(el("span", "pm-notice-head", critical.headline));
      notice.appendChild(el("p", "pm-notice-body", critical.consequence));
      var acts = el("span", "pm-notice-actions");
      var go = btn("pm-btn", critical.actionLabel || "Review");
      go.addEventListener("click", function () { goCoreTarget(critical.target); });
      acts.appendChild(go);
      var dis = btn("pm-btn", critical.secondaryLabel || "Dismiss");
      dis.setAttribute("data-variant", "quiet");
      dis.addEventListener("click", function () {
        var d = store.doc("dismissedNotices", {});
        d[critical.id] = true;
        store.setDoc("dismissedNotices", d);
      });
      acts.appendChild(dis);
      notice.appendChild(acts);
      p.appendChild(notice);
    }

    /* one compact attention block */
    var attn = attentionItems();
    if (attn.length) {
      var ab = el("div", "d05-attn");
      var ah = el("div", "d05-attn-h");
      ah.appendChild(icon("warn"));
      ah.appendChild(el("span", null, "Needs attention"));
      ab.appendChild(ah);
      attn.slice(0, 4).forEach(function (it) {
        var row = el("div", "d05-attn-item");
        var txt = el("p");
        txt.appendChild(el("strong", null, it.title));
        txt.appendChild(document.createTextNode(" — " + it.detail));
        row.appendChild(txt);
        var b = btn("pm-btn", it.action);
        b.addEventListener("click", it.go);
        row.appendChild(b);
        ab.appendChild(row);
      });
      p.appendChild(ab);
    }

    /* the directory — dominant */
    p.appendChild(el("h2", "d05-section-h", "Directory"));
    var dir = el("div", "d05-dir");
    REG.DOMAINS.forEach(function (d) {
      var cat = catById(d.id);
      var managers = REG.managersByDomain(d.id);
      var card = btn("d05-card", "");
      card.setAttribute("data-domain-id", d.id);
      var ic = el("span", "d05-card-icon");
      ic.appendChild(icon(cat ? cat.icon : "folder"));
      card.appendChild(ic);
      var main = el("span", "d05-card-main");
      main.appendChild(el("span", "d05-card-title", d.title));
      main.appendChild(el("span", "d05-card-sub", d.blurb));
      main.appendChild(el("span", "d05-card-meta", settingCount(d.id) + " settings · " + managers.length + (managers.length === 1 ? " manager" : " managers")));
      card.appendChild(main);
      var chev = el("span", "d05-card-chev");
      chev.appendChild(icon("chevron-r"));
      card.appendChild(chev);
      card.addEventListener("click", function () { openDomain(d.id); });
      dir.appendChild(card);
    });
    p.appendChild(dir);

    /* secondary utilities — deliberately smaller */
    var utils = el("div", "d05-utils");
    var u1 = btn("d05-util", "");
    u1.appendChild(icon("list")); u1.appendChild(el("span", null, "All Settings index"));
    u1.addEventListener("click", function () { openAll(); });
    utils.appendChild(u1);
    var u2 = btn("d05-util", "");
    u2.appendChild(icon("copy")); u2.appendChild(el("span", null, "Copy Settings From Another Project"));
    u2.addEventListener("click", function () { openCopy(); });
    utils.appendChild(u2);
    var u3 = btn("d05-util", "");
    u3.appendChild(icon("clock")); u3.appendChild(el("span", null, "Recent destinations"));
    u3.addEventListener("click", function () {
      var items = (CORE.recents || []).map(function (r) {
        return { label: r.label, action: function () { goCoreTarget(r.target); } };
      });
      if (!items.length) items.push({ label: "No recent destinations", disabled: true });
      window.PMV2Menu.open(u3, items, { placement: "bottom-start", ariaLabel: "Recent destinations" });
    });
    utils.appendChild(u3);
    var u4 = btn("d05-util", "");
    u4.appendChild(icon("safe")); u4.appendChild(el("span", null, "Restore points & rollback"));
    u4.addEventListener("click", function () { openManager("lifecycle", { page: "rollback" }); });
    utils.appendChild(u4);
    p.appendChild(utils);
  }

  function attentionItems() {
    var out = [];
    var dismissed = store.doc("dismissedNotices", {});
    (CORE.notices || []).forEach(function (n) {
      if (n.kind === "attention" && !dismissed[n.id] && out.length < 2) {
        out.push({
          title: n.headline, detail: n.consequence, action: n.actionLabel || "Review",
          go: function () { goCoreTarget(n.target); }
        });
      }
    });
    (CORE.providers || []).forEach(function (pr) {
      if (out.length >= 4) return;
      if (pr.installState === "installed-signed-out") {
        out.push({
          title: pr.name + " is installed but signed out",
          detail: "Requests will fail until an account signs in again.",
          action: "Sign in",
          go: function () { openManager("providers", { object: pr.id, section: "credentials" }); }
        });
      } else if (pr.installState === "not-installed") {
        out.push({
          title: pr.name + " is not installed",
          detail: "Set it up from the official source before routing work to it.",
          action: "Set up",
          go: function () { openManager("providers", { object: pr.id, section: "installation" }); }
        });
      } else if (pr.updateState && pr.updateState.state === "update-available") {
        out.push({
          title: pr.name + " update available",
          detail: "Version " + pr.updateState.availableVersion + " is ready. " + (pr.updateState.note || ""),
          action: "Review update",
          go: function () { openManager("providers", { object: pr.id, section: "installation" }); }
        });
      }
    });
    return out;
  }

  /* ---------- Domain page ------------------------------------------------------------------- */
  function viewDomain(route, view) {
    var d = REG.domainById(route.domain);
    var cat = catById(route.domain);
    if (!d || !cat) { viewHome({ view: "home" }, view); return; }
    var p = pad(view);
    view.setAttribute("data-domain-id", d.id);
    p.appendChild(crumbs([{ label: "Settings", route: navStack[0] }, { label: d.title }]));
    p.appendChild(heroHead(cat.icon, d.title, d.blurb, [
      badge("state", { "data-state": "default" }, settingCount(d.id) + " settings"),
      badge("state", { "data-state": "default" }, REG.managersByDomain(d.id).length + " managers")
    ]));
    var strip = scenarioStrip("domain." + d.id);
    if (strip) p.appendChild(strip);

    p.appendChild(el("h2", "d05-section-h", "Pages & managers"));
    var rows = el("div", "d05-rows");
    REG.managersByDomain(d.id).forEach(function (m) {
      rows.appendChild(destRow({
        icon: m.icon, title: m.title, sub: m.summary,
        meta: m.subpages.length + " pages",
        hook: { name: "data-manager-id", value: m.id },
        go: function () { openManager(m.id); }
      }));
    });
    p.appendChild(rows);

    p.appendChild(el("h2", "d05-section-h", "Browse settings"));
    var subs = el("div", "d05-rows");
    cat.subgroups.forEach(function (sub) {
      subs.appendChild(destRow({
        icon: "list", title: sub.title, sub: sub.description,
        meta: sub.settings.length + " settings",
        hook: { name: "data-section-id", value: sub.id },
        go: function () { openSection(d.id, sub.id); }
      }));
    });
    p.appendChild(subs);

    if (d.id === "system") {
      p.appendChild(el("h2", "d05-section-h", "Owned by other teams"));
      var owners = el("div", "d05-rows");
      REG.DEFERRED_OWNERS.forEach(function (o) {
        owners.appendChild(destRow({
          icon: "plug", title: o.family, sub: o.insertion,
          meta: "External owner",
          hook: { name: "data-manager-id", value: "owner-" + o.id },
          go: function () { openOwner(o.id); }
        }));
      });
      p.appendChild(owners);
    }
  }

  /* ---------- Section (subgroup settings form) ------------------------------------------------- */
  function viewSection(route, view) {
    var cat = catById(route.domain);
    var sub = subgroupById(cat, route.section);
    if (!sub) { openDomain(route.domain); return; }
    var p = pad(view);
    view.setAttribute("data-domain-id", route.domain);
    view.setAttribute("data-section-id", sub.id);
    p.appendChild(crumbs([
      { label: "Settings", route: navStack[0] },
      { label: domainTitle(route.domain), route: { view: "domain", domain: route.domain } },
      { label: sub.title }
    ]));
    p.appendChild(heroHead(cat.icon, sub.title, sub.description, [
      badge("state", { "data-state": "default" }, sub.settings.length + " settings")
    ]));
    var strip = scenarioStrip("section." + sub.id);
    if (strip) p.appendChild(strip);
    var form = el("div", "d05-form");
    form.appendChild(settingRowsFor(sub));
    p.appendChild(form);
  }

  /* ---------- Manager pages --------------------------------------------------------------------- */
  function viewManager(route, view) {
    var m = REG.managerById(route.manager);
    if (!m) { goHome(); return; }
    var p = pad(view);
    view.setAttribute("data-manager-id", m.id);
    view.setAttribute("data-domain-id", m.domain);

    var crumbItems = [
      { label: "Settings", route: navStack[0] },
      { label: domainTitle(m.domain), route: { view: "domain", domain: m.domain } },
      { label: m.title }
    ];
    var obj = null;
    if (route.object && m.objectSource) {
      (OBJECTS[m.objectSource] || []).forEach(function (o) { if (o.id === route.object) obj = o; });
      if (obj) crumbItems.push({ label: obj.label });
    }
    p.appendChild(crumbs(crumbItems));
    p.appendChild(heroHead(m.icon, obj ? obj.label : m.title, m.summary, [
      badge("exposure", { "data-exposure": "advanced" }, archetypeLabel(m.archetype))
    ]));
    var strip = scenarioStrip("manager." + m.id);
    if (strip) p.appendChild(strip);

    if (m.id === "providers") { providersManager(m, route, p); return; }
    switch (m.archetype) {
      case "preference-document": preferenceManager(m, route, p); break;
      case "resource-roster": rosterManager(m, route, p); break;
      case "inventory-catalog": catalogManager(m, route, p); break;
      case "health-projection": healthManager(m, route, p); break;
      case "transaction": transactionManager(m, route, p); break;
      default: preferenceManager(m, route, p);
    }
  }
  function archetypeLabel(a) {
    return a === "preference-document" ? "Settings form"
      : a === "resource-roster" ? "List & detail"
      : a === "inventory-catalog" ? "Catalog"
      : a === "health-projection" ? "Health"
      : a === "transaction" ? "Transaction" : "Page";
  }

  function subpageTabs(m, activeSlug, onPick) {
    var tabs = el("div", "pm-tabs");
    tabs.setAttribute("role", "tablist");
    m.subpages.forEach(function (sp) {
      var t = btn("pm-tab", sp);
      t.setAttribute("role", "tab");
      t.setAttribute("aria-selected", slug(sp) === activeSlug ? "true" : "false");
      t.addEventListener("click", function () { onPick(slug(sp)); });
      tabs.appendChild(t);
    });
    return tabs;
  }

  /* preference-document: grouped setting rows distributed across subpages */
  function preferenceManager(m, route, p) {
    var cat = catById(m.domain);
    var active = route.page || route.section && sectionToSubpage(m, route.section) || slug(m.subpages[0]);
    var content = el("div");
    function draw() {
      clear(content);
      content.appendChild(subpageTabs(m, active, function (sl) {
        active = sl;
        route.page = sl;
        draw();
      }));
      var form = el("div", "d05-form");
      var idx = m.subpages.map(function (sp) { return slug(sp); }).indexOf(active);
      cat.subgroups.forEach(function (sub, i) {
        if (i % m.subpages.length !== (idx < 0 ? 0 : idx)) return;
        var group = el("div", "d05-form-group");
        group.setAttribute("data-section-id", sub.id);
        group.appendChild(el("div", "d05-group-h", sub.title));
        group.appendChild(settingRowsFor(sub));
        form.appendChild(group);
      });
      content.appendChild(form);
    }
    draw();
    p.appendChild(content);
    if (route.section) {
      var node = content.querySelector('[data-section-id="' + route.section + '"]');
      if (node && route.locateRow) { /* located by render() */ }
    }
  }
  function sectionToSubpage(m, sectionId) {
    var cat = catById(m.domain);
    if (!cat) return slug(m.subpages[0]);
    for (var i = 0; i < cat.subgroups.length; i++) {
      if (cat.subgroups[i].id === sectionId) return slug(m.subpages[i % m.subpages.length]);
    }
    return slug(m.subpages[0]);
  }

  /* resource-roster: list + integrated detail workspace */
  function rosterManager(m, route, p) {
    var objs = (OBJECTS[m.objectSource] || []).filter(function (o) {
      var removed = store.doc("removed." + m.id, {});
      return !removed[o.id];
    });
    var ws = el("div", "d05-workspace");
    var roster = el("div", "d05-roster");
    var list = el("div", "d05-roster-list pmv2-scroll");
    var selectedId = route.object || (objs[0] && objs[0].id);
    var detail = el("div", "d05-detail");

    function drawDetail() {
      clear(detail);
      var obj = null;
      objs.forEach(function (o) { if (o.id === selectedId) obj = o; });
      if (!obj) {
        detail.appendChild(el("p", "d05-detail-note", "Select an item to see its details."));
        return;
      }
      detail.setAttribute("data-object-id", obj.id);
      var head = el("div", "d05-detail-head");
      head.appendChild(el("h3", "d05-detail-title", obj.label));
      head.appendChild(badge("state", { "data-state": "default" }, obj.typeLabel));
      if (obj.health) head.appendChild(healthBadge(obj.health));
      if (obj.availability) head.appendChild(badge("state", { "data-state": "unavailable" }, obj.availability));
      detail.appendChild(head);
      var section = route.section || obj.section || slug(m.subpages[0]);
      detail.appendChild(subpageTabs(m, section, function (sl) {
        route.section = sl;
        drawDetail();
      }));
      var panel = el("div");
      panel.setAttribute("data-section-id", section);
      genericDetailPanel(m, obj, section, panel);
      detail.appendChild(panel);
    }
    function drawList() {
      clear(list);
      if (!objs.length) {
        var empty = el("div", "pm-empty");
        empty.appendChild(el("div", "pm-empty-title", "Nothing here yet"));
        empty.appendChild(el("div", "pm-empty-guidance", "Items you add will appear in this list."));
        list.appendChild(empty);
        return;
      }
      objs.forEach(function (o) {
        var b = btn("d05-roster-item", "");
        b.setAttribute("data-object-id", o.id);
        b.setAttribute("aria-selected", o.id === selectedId ? "true" : "false");
        b.appendChild(el("span", "d05-roster-name", o.label));
        if (o.health) b.appendChild(healthBadge(o.health));
        else if (o.availability) b.appendChild(badge("state", { "data-state": "unavailable" }, "Attention"));
        b.appendChild(el("span", "d05-roster-sub", o.typeLabel + (o.availability ? " · " + o.availability : "")));
        b.addEventListener("click", function () {
          selectedId = o.id;
          route.object = o.id;
          drawList();
          drawDetail();
        });
        list.appendChild(b);
      });
    }
    drawList();
    drawDetail();
    roster.appendChild(list);
    ws.appendChild(roster);
    ws.appendChild(detail);
    p.appendChild(ws);
  }

  function healthBadge(h) {
    var wrap = el("span", "pm-healthdot");
    wrap.setAttribute("data-state", healthKind(h));
    wrap.appendChild(el("span", "pm-healthdot-dot"));
    wrap.appendChild(el("span", null, h === "ready" ? "Ready" : h === "degraded" ? "Degraded" : h === "attention" ? "Attention" : h));
    return wrap;
  }

  function kv(pairs) {
    var d = el("dl", "d05-kv");
    pairs.forEach(function (pr) {
      d.appendChild(el("dt", null, pr[0]));
      d.appendChild(el("dd", null, pr[1]));
    });
    return d;
  }

  function genericDetailPanel(m, obj, section, panel) {
    var first = slug(m.subpages[0]);
    if (section === first || section === "overview") {
      panel.appendChild(kv([
        ["Type", obj.typeLabel],
        ["Domain", domainTitle(obj.domain)],
        ["Health", obj.health || "Not tracked"],
        ["Availability", obj.availability || "Available"],
        ["Identifier", obj.id]
      ]));
      var acts = el("div", "d05-actions");
      var test = btn("pm-btn", "Test");
      test.addEventListener("click", function () {
        runOp("Test " + obj.label, ["Connecting", "Checking response"], function () {
          toast(obj.health === "degraded" ? "warn" : "ok",
            obj.health === "degraded" ? obj.label + " responded but is degraded." : obj.label + " responded normally.");
        });
      });
      acts.appendChild(test);
      var ren = btn("pm-btn", "Rename");
      ren.setAttribute("data-variant", "quiet");
      ren.addEventListener("click", function () {
        var names = store.doc("renamed." + m.id, {});
        names[obj.id] = obj.label + " (renamed)";
        store.setDoc("renamed." + m.id, names);
        toast("ok", "Rename recorded for this demo project.");
      });
      acts.appendChild(ren);
      var rem = btn("pm-btn", "Remove");
      rem.setAttribute("data-variant", "danger");
      rem.addEventListener("click", function () {
        var removed = store.doc("removed." + m.id, {});
        removed[obj.id] = true;
        store.setDoc("removed." + m.id, removed);
        toast("ok", obj.label + " removed from this project. Re-open the page to restore the demo fixture.");
        render(currentRoute(), null, true);
      });
      acts.appendChild(rem);
      panel.appendChild(acts);
      return;
    }
    /* remaining subpages: real preference rows from this domain, distributed */
    var cat = catById(m.domain);
    var idx = m.subpages.map(function (sp) { return slug(sp); }).indexOf(section);
    var form = el("div", "d05-form");
    var shown = 0;
    cat.subgroups.forEach(function (sub, i) {
      if (i % (m.subpages.length - 1 || 1) !== ((idx - 1 + (m.subpages.length - 1)) % (m.subpages.length - 1 || 1))) return;
      var group = el("div", "d05-form-group");
      group.setAttribute("data-section-id", sub.id);
      group.appendChild(el("div", "d05-group-h", sub.title));
      group.appendChild(settingRowsFor(sub));
      form.appendChild(group);
      shown++;
    });
    if (!shown) panel.appendChild(el("p", "d05-detail-note", "No settings are mapped to this page yet."));
    else panel.appendChild(form);
  }

  /* inventory-catalog: facets + (virtualized) list + detail */
  function catalogManager(m, route, p) {
    var objs = (OBJECTS[m.objectSource] || []).filter(function (o) {
      var removed = store.doc("removed." + m.id, {});
      return !removed[o.id];
    });
    var facet = route.facet || "";
    var types = [];
    objs.forEach(function (o) { if (types.indexOf(o.typeLabel) < 0) types.push(o.typeLabel); });

    var facets = el("div", "d05-facets");
    function facetChip(label, value) {
      var c = btn("d05-facet", label);
      c.setAttribute("aria-pressed", facet === value ? "true" : "false");
      c.addEventListener("click", function () {
        route.facet = value;
        render(currentRoute(), null, true);
      });
      return c;
    }
    facets.appendChild(facetChip("All", ""));
    types.forEach(function (t) { facets.appendChild(facetChip(t, t)); });
    p.appendChild(facets);

    var filtered = facet ? objs.filter(function (o) { return o.typeLabel === facet; }) : objs;
    if (!filtered.length) {
      var empty = el("div", "pm-empty");
      empty.appendChild(el("div", "pm-empty-title", store.activeScenario() === "empty" ? "Nothing here yet" : "No items match this filter"));
      empty.appendChild(el("div", "pm-empty-guidance", "Try a different filter, or add items to this project."));
      p.appendChild(empty);
      return;
    }

    function catRow(o) {
      var b = btn("d05-row-dest", "");
      b.setAttribute("data-object-id", o.id);
      var main = el("span", "d05-card-main");
      main.appendChild(el("span", "d05-row-dest-title", o.label));
      main.appendChild(el("span", "d05-row-dest-sub", o.typeLabel + (o.availability ? " · " + o.availability : "")));
      var ic = el("span", "d05-card-icon");
      ic.appendChild(icon(m.icon));
      b.appendChild(ic);
      b.appendChild(main);
      if (o.health) b.appendChild(healthBadge(o.health));
      else b.appendChild(el("span", "d05-row-dest-meta", o.typeLabel));
      var chev = el("span", "d05-card-chev");
      chev.appendChild(icon("chevron-r"));
      b.appendChild(chev);
      b.addEventListener("click", function () {
        openManager(m.id, { object: o.id, section: o.section || null });
      });
      return b;
    }

    if (filtered.length > 60) {
      p.appendChild(virtualList({
        rows: filtered,
        rowHeight: 62,
        height: 440,
        render: catRow
      }));
    } else {
      var rows = el("div", "d05-rows");
      filtered.forEach(function (o) { rows.appendChild(catRow(o)); });
      p.appendChild(rows);
    }
    /* catalog detail opens as a roster-style manager route (object selected) */
    if (route.object) {
      var detailWrap = el("div");
      rosterDetailInline(m, route, detailWrap);
      p.appendChild(detailWrap);
    }
  }
  function rosterDetailInline(m, route, container) {
    var objs = OBJECTS[m.objectSource] || [];
    var obj = null;
    objs.forEach(function (o) { if (o.id === route.object) obj = o; });
    if (!obj) return;
    var detail = el("div", "d05-detail");
    detail.setAttribute("data-object-id", obj.id);
    detail.style.marginTop = "14px";
    var head = el("div", "d05-detail-head");
    head.appendChild(el("h3", "d05-detail-title", obj.label));
    head.appendChild(badge("state", { "data-state": "default" }, obj.typeLabel));
    detail.appendChild(head);
    var section = route.section || slug(m.subpages[0]);
    detail.appendChild(subpageTabs(m, section, function (sl) {
      route.section = sl;
      render(currentRoute(), null, true);
    }));
    var panel = el("div");
    panel.setAttribute("data-section-id", section);
    genericDetailPanel(m, obj, section, panel);
    detail.appendChild(panel);
    container.appendChild(detail);
  }

  /* health-projection: read-only status panels */
  function healthManager(m, route, p) {
    var active = route.section || route.page || slug(m.subpages[0]);
    var content = el("div");
    function draw() {
      clear(content);
      content.appendChild(subpageTabs(m, active, function (sl) {
        active = sl;
        route.section = sl;
        draw();
      }));
      var panel = el("div");
      panel.setAttribute("data-section-id", active);
      if (m.id === "doctor") doctorPanel(active, panel);
      else if (m.id === "search-index") searchIndexPanel(active, panel);
      else if (m.id === "dry-method") dryPanel(active, panel);
      else panel.appendChild(el("p", "d05-detail-note", "Read-only status for this area."));
      content.appendChild(panel);
    }
    draw();
    p.appendChild(content);
  }
  function healthRow(name, state, note) {
    var row = el("div", "d05-setrow");
    var r = el("div", "pm-row");
    var main = el("div", "pm-row-main");
    var lab = el("div", "pm-row-label");
    lab.appendChild(el("span", null, name));
    main.appendChild(lab);
    if (note) main.appendChild(el("div", "pm-row-desc", note));
    r.appendChild(main);
    var st = el("div", "pm-row-state");
    st.appendChild(healthBadge(state));
    r.appendChild(st);
    row.appendChild(r);
    return row;
  }
  function doctorPanel(active, panel) {
    if (active === "checks") {
      panel.appendChild(healthRow("Node.js runtime", "ready", "v22.18.0 on PATH."));
      panel.appendChild(healthRow("Git availability", "ready", "git 2.51 found; worktree operations available."));
      panel.appendChild(healthRow("Provider CLIs", "attention", "vLLM tenant is not installed; Antigravity is signed out."));
      panel.appendChild(healthRow("Storage headroom", "ready", "41 GB free on the project drive."));
      var acts = el("div", "d05-actions");
      var run = btn("pm-btn", "Run all checks");
      run.addEventListener("click", function () {
        runOp("Doctor checks", ["Runtime", "Providers", "Storage", "Report"], function () {
          toast("ok", "Doctor finished: 3 healthy, 1 needs attention.");
        });
      });
      acts.appendChild(run);
      panel.appendChild(acts);
    } else if (active === "diagnostics") {
      var log = el("div", "d05-log");
      ["06:00 environment scan completed (4 checks)",
        "06:00 provider probe: anthropic ok, openai ok, vllm-tenant missing",
        "06:01 storage scan: 41 GB free, caches within ceiling",
        "09:12 scheduled re-check skipped (settings surface open)"].forEach(function (l) {
          log.appendChild(el("div", null, l));
        });
      panel.appendChild(log);
    } else {
      panel.appendChild(el("p", "d05-detail-note", "Repairs act on the real fixture state and report truthful outcomes."));
      var acts = el("div", "d05-actions");
      var r1 = btn("pm-btn", "Repair provider connections");
      r1.addEventListener("click", function () {
        runOp("Repair provider connections", ["Probe", "Re-authenticate", "Verify"], function () {
          toast("ok", "Provider connections re-verified.");
        });
      });
      acts.appendChild(r1);
      var r2 = btn("pm-btn", "Rebuild search index");
      r2.setAttribute("data-variant", "quiet");
      r2.addEventListener("click", function () {
        runOp("Rebuild search index", ["Scan", "Index", "Verify"], function () {
          toast("ok", "Search index rebuilt.");
        });
      });
      acts.appendChild(r2);
      panel.appendChild(acts);
    }
  }
  function searchIndexPanel(active, panel) {
    if (active === "status") {
      panel.appendChild(kv([
        ["State", "Ready"],
        ["Documents indexed", "12,408"],
        ["Last refresh", "2026-08-18 06:00"],
        ["Freshness", "Fresh — no pending changes"],
        ["Projection", "Read-only"]
      ]));
    } else if (active === "refresh") {
      var cat = catById("web");
      var sub = subgroupById(cat, "index");
      if (sub) {
        var form = el("div", "d05-form");
        form.appendChild(settingRowsFor(sub));
        panel.appendChild(form);
      }
      var acts = el("div", "d05-actions");
      var b = btn("pm-btn", "Refresh now");
      b.addEventListener("click", function () {
        runOp("Refresh project search index", ["Scan changes", "Update index"], function () {
          toast("ok", "Index refreshed. 12,408 documents.");
        });
      });
      acts.appendChild(b);
      panel.appendChild(acts);
    } else {
      panel.appendChild(el("p", "d05-detail-note", "Inclusion rules decide what the project search index reads."));
      var form2 = el("div", "d05-form");
      var cat2 = catById("web");
      var sub2 = cat2 && cat2.subgroups[1];
      if (sub2) form2.appendChild(settingRowsFor(sub2));
      panel.appendChild(form2);
    }
  }
  function dryPanel(active, panel) {
    var owners = [
      ["Settings inventory projection", "Shared headless (pm-v2-inventory)", "Reused — no second owner"],
      ["Universal search index & routing", "Shared headless (pm-v2-search)", "Reused — routes by immutable result ID"],
      ["Project store & scenarios", "Shared headless (pm-v2-store)", "Reused — per-concept namespace"],
      ["Copy Settings engine", "Shared headless (pm-v2-copy)", "Reused — one transaction state machine"],
      ["Directory pages, cards, workspaces", "This concept (concept-05)", "Native presentation only"]
    ];
    if (active === "owners" || active === "shared-components") {
      owners.forEach(function (o) {
        var row = el("div", "d05-setrow");
        var r = el("div", "pm-row");
        var main = el("div", "pm-row-main");
        var lab = el("div", "pm-row-label");
        lab.appendChild(el("span", null, o[0]));
        main.appendChild(lab);
        main.appendChild(el("div", "pm-row-desc", o[1]));
        r.appendChild(main);
        var st = el("div", "pm-row-state");
        st.appendChild(badge("state", { "data-state": "managed" }, o[2]));
        r.appendChild(st);
        row.appendChild(r);
        panel.appendChild(row);
      });
    } else {
      panel.appendChild(kv([
        ["Second owners created", "None"],
        ["Concept presentation", "concept-05 (this folder)"],
        ["Shared semantics", "Inventory, search, store, copy, objects"],
        ["Contract", "candidate-dry-delta.json — second_owner_created false everywhere"]
      ]));
    }
  }

  /* transaction managers */
  function transactionManager(m, route, p) {
    if (m.id === "lifecycle") { lifecycleManager(m, route, p); return; }
    var active = route.section || route.page || slug(m.subpages[0]);
    var content = el("div");
    function draw() {
      clear(content);
      content.appendChild(subpageTabs(m, active, function (sl) {
        active = sl; route.section = sl; draw();
      }));
      var panel = el("div");
      panel.setAttribute("data-section-id", active);
      if (m.id === "backup") backupPanel(active, panel);
      else if (m.id === "cleanup") cleanupPanel(active, panel);
      content.appendChild(panel);
    }
    draw();
    p.appendChild(content);
  }
  function restoreSnapshot(snap) {
    var cur = store.overrides();
    Object.keys(cur).forEach(function (k) { store.resetValue(k); });
    Object.keys(snap || {}).forEach(function (k) {
      store.setValue(k, snap[k].value, { restore: true });
    });
  }
  function backupPanel(active, panel) {
    if (active === "backups") {
      panel.appendChild(el("p", "d05-detail-note", "Backups snapshot this project's settings overrides. Creating one is instant and keeps a receipt."));
      var acts = el("div", "d05-actions");
      var b = btn("pm-btn", "Create backup now");
      b.setAttribute("data-variant", "primary");
      b.addEventListener("click", function () {
        runOp("Create backup", ["Snapshot overrides", "Verify snapshot"], function () {
          var rp = store.createRestorePoint("Manual backup", store.overrides());
          store.addReceipt({ kind: "settings-backup", title: "Manual backup", restorePointId: rp.id });
          toast("ok", "Backup created: " + rp.label + ".");
          render(currentRoute(), null, true);
        });
      });
      acts.appendChild(b);
      panel.appendChild(acts);
    } else if (active === "restore-points") {
      var pts = store.restorePoints();
      if (!pts.length) {
        panel.appendChild(el("p", "d05-detail-note", "No restore points yet. Create a backup first, or run Copy Settings From Another Project."));
        return;
      }
      pts.forEach(function (rp) {
        var row = el("div", "d05-setrow");
        var r = el("div", "pm-row");
        var main = el("div", "pm-row-main");
        var lab = el("div", "pm-row-label");
        lab.appendChild(el("span", null, rp.label));
        main.appendChild(lab);
        main.appendChild(el("div", "pm-row-desc", "Created " + rp.at.slice(0, 16).replace("T", " ") + " · " + Object.keys(rp.snapshot || {}).length + " overrides"));
        r.appendChild(main);
        var ctl = el("div", "pm-row-control");
        var rb = btn("pm-btn", "Restore");
        rb.addEventListener("click", function () {
          runOp("Restore " + rp.label, ["Apply snapshot", "Verify"], function () {
            restoreSnapshot(rp.snapshot);
            toast("ok", "Restored “" + rp.label + "”.");
          });
        });
        ctl.appendChild(rb);
        r.appendChild(ctl);
        row.appendChild(r);
        panel.appendChild(row);
      });
    } else {
      panel.appendChild(el("p", "d05-detail-note", "Verification replays the latest restore point against current values without changing anything."));
      var acts2 = el("div", "d05-actions");
      var v = btn("pm-btn", "Verify latest backup");
      v.addEventListener("click", function () {
        var pts = store.restorePoints();
        if (!pts.length) { toast("warn", "No backups to verify yet."); return; }
        runOp("Verify backup", ["Read snapshot", "Compare"], function () {
          toast("ok", "Latest backup is readable and complete.");
        });
      });
      acts2.appendChild(v);
      panel.appendChild(acts2);
    }
  }
  function cleanupPanel(active, panel) {
    if (active === "rules") {
      var rules = store.doc("cleanup.rules", { caches: true, artifacts: false, sessions: false });
      [["caches", "Clear transient caches", "Safe: rebuilt on demand."],
        ["artifacts", "Remove old runtime artifacts", "Keeps the two most recent runs."],
        ["sessions", "Trim session history", "Keeps the last 30 days."]].forEach(function (r) {
          var row = el("div", "d05-setrow");
          var pr = el("div", "pm-row");
          var main = el("div", "pm-row-main");
          var lab = el("div", "pm-row-label");
          lab.appendChild(el("span", null, r[1]));
          main.appendChild(lab);
          main.appendChild(el("div", "pm-row-desc", r[2]));
          pr.appendChild(main);
          var ctl = el("div", "pm-row-control");
          var sw = btn("pm-switch", "");
          sw.setAttribute("role", "switch");
          sw.setAttribute("aria-checked", rules[r[0]] ? "true" : "false");
          sw.addEventListener("click", function () {
            rules[r[0]] = !rules[r[0]];
            sw.setAttribute("aria-checked", rules[r[0]] ? "true" : "false");
            store.setDoc("cleanup.rules", rules);
          });
          ctl.appendChild(sw);
          pr.appendChild(ctl);
          row.appendChild(pr);
          panel.appendChild(row);
        });
    } else if (active === "dry-run") {
      panel.appendChild(el("p", "d05-detail-note", "A dry run reports what cleanup would reclaim without deleting anything."));
      var acts = el("div", "d05-actions");
      var b = btn("pm-btn", "Run dry run");
      b.addEventListener("click", function () {
        runOp("Cleanup dry run", ["Scan caches", "Scan artifacts", "Report"], function () {
          panel.appendChild(kv([
            ["Reclaimable", "214 MB"],
            ["Artifacts eligible", "38"],
            ["Protected items", "0 — nothing reviewed would be touched"]
          ]));
          toast("ok", "Dry run complete: 214 MB reclaimable.");
        });
      });
      acts.appendChild(b);
      panel.appendChild(acts);
    } else {
      var cur = store.doc("cleanup.schedule", "weekly");
      var wrap = el("span", "pm-select");
      var sel = document.createElement("select");
      sel.setAttribute("aria-label", "Cleanup schedule");
      [["off", "Off"], ["weekly", "Weekly"], ["monthly", "Monthly"]].forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = o[0]; opt.textContent = o[1];
        if (o[0] === cur) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", function () {
        store.setDoc("cleanup.schedule", sel.value);
        toast("ok", "Cleanup schedule set to " + sel.options[sel.selectedIndex].text + ".");
      });
      wrap.appendChild(sel);
      panel.appendChild(el("p", "d05-detail-note", "Scheduled sweeps run the dry-run rules above, then report before deleting."));
      panel.appendChild(wrap);
    }
  }
  function lifecycleManager(m, route, p) {
    /* Copy Settings entry row, then the lifecycle tabs */
    var copyRow = destRow({
      icon: "copy", title: "Copy Settings From Another Project",
      sub: "One-time transaction: preview, restore point, atomic apply, verify, receipt, rollback.",
      meta: "Transaction",
      hook: { name: "data-section-id", value: "copy" },
      go: function () { openCopy(); }
    });
    p.appendChild(copyRow);

    var active = route.section || route.page || "import";
    var content = el("div");
    function draw() {
      clear(content);
      content.appendChild(subpageTabs(m, active, function (sl) {
        active = sl; route.section = sl; draw();
      }));
      var panel = el("div");
      panel.setAttribute("data-section-id", active);
      lifecyclePanel(active, panel);
      content.appendChild(panel);
    }
    draw();
    p.appendChild(content);
  }
  function lifecyclePanel(active, panel) {
    var i;
    if (active === "import") {
      panel.appendChild(el("p", "d05-detail-note", "Import applies a settings file to this project after a preview. Conflicts are listed before anything changes."));
      var conflict = store.activeScenario() === "import-conflict";
      var b = btn("pm-btn", "Preview import of settings-backup.json");
      b.addEventListener("click", function () {
        runOp("Preview import", ["Read file", "Diff against project"], function () {
          panel.appendChild(kv([
            ["Additions", "41"],
            ["Updates", "18"],
            ["Conflicts", conflict ? "6 — the file wins after confirmation" : "0"],
            ["Unchanged", "753"]
          ]));
          var apply = btn("pm-btn", "Apply import");
          apply.setAttribute("data-variant", "primary");
          apply.addEventListener("click", function () {
            runOp("Apply import", ["Restore point", "Apply", "Verify"], function () {
              store.addReceipt({ kind: "settings-import", title: "Imported settings-backup.json", verified: true });
              toast("ok", "Import applied. Receipt written.");
            });
          });
          panel.appendChild(apply);
        });
      });
      panel.appendChild(b);
    } else if (active === "export") {
      panel.appendChild(el("p", "d05-detail-note", "Export writes this project's effective settings to a portable file. Credentials are never exported."));
      var eb = btn("pm-btn", "Export this project's settings");
      eb.addEventListener("click", function () {
        runOp("Export settings", ["Collect effective values", "Write file"], function () {
          var r = store.addReceipt({ kind: "settings-export", title: "Exported project settings", verified: true });
          toast("ok", "Export finished. Receipt " + r.at.slice(0, 10) + " written.");
        });
      });
      panel.appendChild(eb);
    } else if (active === "reset") {
      var n = Object.keys(store.overrides()).length;
      panel.appendChild(el("p", "d05-detail-note",
        n ? "Reset returns " + n + " customized setting" + (n === 1 ? "" : "s") + " to defaults. A restore point is created first."
          : "Nothing is customized right now, so reset would change nothing."));
      var rb = btn("pm-btn", "Reset all settings to defaults");
      rb.setAttribute("data-variant", "danger");
      rb.disabled = !n;
      rb.addEventListener("click", function () {
        runOp("Reset settings", ["Restore point", "Reset", "Verify"], function () {
          store.createRestorePoint("Before reset", store.overrides());
          var cur = store.overrides();
          Object.keys(cur).forEach(function (k) { store.resetValue(k); });
          store.addReceipt({ kind: "settings-reset", title: "Reset to defaults", verified: true });
          toast("ok", "All settings are back to defaults. A restore point was kept.");
          render(currentRoute(), null, true);
        });
      });
      panel.appendChild(rb);
    } else if (active === "migration") {
      var strip = el("div", "d05-strip");
      strip.setAttribute("data-tone", "info");
      strip.appendChild(icon("info"));
      strip.appendChild(el("span", null, "This project is on the current settings schema. No migration is needed."));
      panel.appendChild(strip);
    } else if (active === "help") {
      panel.appendChild(el("p", "d05-detail-note",
        "What Copy Settings From Another Project does: it copies values from a project you pick into this one, exactly once. You review a preview first, a restore point is created, the apply is atomic and verified, and the receipt offers a full rollback. Nothing stays linked afterwards — later changes in the source project never propagate here."));
      var hb = btn("pm-btn", "Open Copy Settings From Another Project");
      hb.setAttribute("data-variant", "primary");
      hb.addEventListener("click", function () { openCopy(); });
      panel.appendChild(hb);
    } else if (active === "rollback") {
      var pts = store.restorePoints();
      panel.appendChild(el("p", "d05-detail-note", "Roll back to a restore point, or inspect the receipts of past transactions."));
      if (!pts.length) panel.appendChild(el("p", "d05-detail-note", "No restore points yet."));
      pts.forEach(function (rp) {
        var row = el("div", "d05-setrow");
        var r = el("div", "pm-row");
        var main = el("div", "pm-row-main");
        var lab = el("div", "pm-row-label");
        lab.appendChild(el("span", null, rp.label));
        main.appendChild(lab);
        main.appendChild(el("div", "pm-row-desc", rp.at.slice(0, 16).replace("T", " ")));
        r.appendChild(main);
        var ctl = el("div", "pm-row-control");
        var b2 = btn("pm-btn", "Roll back");
        b2.addEventListener("click", function () {
          runOp("Roll back to " + rp.label, ["Apply snapshot", "Verify"], function () {
            restoreSnapshot(rp.snapshot);
            store.addReceipt({ kind: "settings-rollback", title: "Rolled back to " + rp.label, verified: true });
            toast("ok", "Rolled back to “" + rp.label + "”.");
          });
        });
        ctl.appendChild(b2);
        r.appendChild(ctl);
        row.appendChild(r);
        panel.appendChild(row);
      });
      var receipts = store.receipts();
      if (receipts.length) {
        panel.appendChild(el("h3", "d05-section-h", "Receipts"));
        receipts.slice(-6).forEach(function (rc) {
          panel.appendChild(el("p", "d05-detail-note", (rc.at || "").slice(0, 16).replace("T", " ") + " — " + rc.title + (rc.verified ? " (verified)" : "")));
        });
      }
    }
  }

  /* ---------- Providers manager (integrated roster/detail workspace) --------------------------- */
  function providersManager(m, route, p) {
    var providers = CORE.providers || [];
    var objs = OBJECTS.providers || [];
    var selectedId = route.object || (providers[0] && providers[0].id);
    var ws = el("div", "d05-workspace");
    var roster = el("div", "d05-roster");
    var list = el("div", "d05-roster-list pmv2-scroll");
    var detail = el("div", "d05-detail");

    function stateBadgeFor(pr) {
      if (pr.installState === "installed-signed-in") return healthBadge("ready");
      if (pr.installState === "installed-signed-out") return badge("state", { "data-state": "managed" }, "Signed out");
      if (pr.installState === "not-installed") return badge("state", { "data-state": "unavailable" }, "Not installed");
      return healthBadge("ready");
    }
    function drawList() {
      clear(list);
      providers.forEach(function (pr) {
        var b = btn("d05-roster-item", "");
        b.setAttribute("data-object-id", pr.id);
        b.setAttribute("aria-selected", pr.id === selectedId ? "true" : "false");
        b.appendChild(el("span", "d05-roster-name", pr.name));
        b.appendChild(stateBadgeFor(pr));
        b.appendChild(el("span", "d05-roster-sub", pr.tagline || ""));
        b.addEventListener("click", function () {
          selectedId = pr.id;
          route.object = pr.id;
          drawList();
          drawDetail();
        });
        list.appendChild(b);
      });
    }
    function drawDetail() {
      clear(detail);
      var pr = providerById[selectedId];
      if (!pr) {
        /* a setup workflow can target a provider this project has not connected yet
           (e.g. Ollama): land truthfully with the official-source setup panel. */
        var label = String(selectedId || "").replace(/(^|-)(\w)/g, function (m, dash, ch) { return (dash ? " " : "") + ch.toUpperCase(); });
        detail.setAttribute("data-object-id", selectedId || "");
        var head0 = el("div", "d05-detail-head");
        head0.appendChild(el("h3", "d05-detail-title", label));
        head0.appendChild(badge("state", { "data-state": "not-configured" }, "Not connected"));
        detail.appendChild(head0);
        detail.appendChild(el("p", "d05-detail-note",
          label + " is not connected to this project yet. Set it up from its official source; it appears in the provider list as soon as it is detected."));
        var box0 = el("div", "d05-installbox");
        box0.appendChild(el("p", null, label + " is acquired only from its official source. Puppet Master never bundles or pre-seeds provider tooling."));
        var setup0 = btn("pm-btn", "Set up " + label + " from the official source");
        setup0.setAttribute("data-variant", "primary");
        setup0.addEventListener("click", function () {
          runOp("Set up " + label, ["Open official source", "Install / connect", "Detect", "Verify"], function () {
            toast("ok", label + " setup finished and verified.");
          });
        });
        box0.appendChild(setup0);
        detail.appendChild(box0);
        return;
      }
      detail.setAttribute("data-object-id", pr.id);
      var head = el("div", "d05-detail-head");
      head.appendChild(el("h3", "d05-detail-title", pr.name));
      head.appendChild(stateBadgeFor(pr));
      if (pr.updateState && pr.updateState.state === "update-available") {
        head.appendChild(badge("state", { "data-state": "custom" }, "Update " + pr.updateState.availableVersion));
      }
      detail.appendChild(head);
      detail.appendChild(el("p", "d05-detail-note", pr.tagline || ""));
      var section = route.section || "overview";
      detail.appendChild(subpageTabs(m, section, function (sl) {
        route.section = sl;
        drawDetail();
      }));
      var panel = el("div");
      panel.setAttribute("data-section-id", section);
      providerPanel(pr, section, panel);
      detail.appendChild(panel);
    }
    drawList();
    drawDetail();
    roster.appendChild(list);
    ws.appendChild(roster);
    ws.appendChild(detail);
    p.appendChild(ws);
  }

  function providerPanel(pr, section, panel) {
    if (section === "overview") {
      panel.appendChild(kv([
        ["Connection", pr.installState === "installed-signed-in" ? "Installed and signed in"
          : pr.installState === "installed-signed-out" ? "Installed, signed out"
          : pr.installState === "not-installed" ? "Not installed" : "Connected directly"],
        ["Sign-in model", authLabel(pr.authModel)],
        ["Accounts", String((pr.accounts || []).length)],
        ["Group", (pr.connectionGroup || "").replace(/-/g, " ") || "Direct"]
      ]));
      if (pr.accountSwitchNote) panel.appendChild(el("p", "d05-detail-note", pr.accountSwitchNote));
      var acts = el("div", "d05-actions");
      var test = btn("pm-btn", "Test connection");
      test.addEventListener("click", function () {
        runOp("Test " + pr.name, ["Resolve endpoint", "Round-trip"], function () {
          toast(pr.installState === "not-installed" ? "warn" : "ok",
            pr.installState === "not-installed" ? pr.name + " is not installed — set it up first." : pr.name + " responded normally.");
        });
      });
      acts.appendChild(test);
      panel.appendChild(acts);
    } else if (section === "models") {
      (pr.models || []).forEach(function (mo) {
        var row = el("div", "d05-setrow");
        var r = el("div", "pm-row");
        var main = el("div", "pm-row-main");
        var lab = el("div", "pm-row-label");
        lab.appendChild(el("span", null, mo.name + (mo.alias ? " (“" + mo.alias + "”)" : "")));
        if (mo.favorite) lab.appendChild(badge("state", { "data-state": "recommended" }, "Favorite"));
        main.appendChild(lab);
        main.appendChild(el("div", "pm-row-desc", "Context " + (mo.contextLimit || 0).toLocaleString() + " tokens" + (mo.hidden ? " · hidden" : "")));
        r.appendChild(main);
        var ctl = el("div", "pm-row-control");
        var defKey = "provider." + pr.id + ".defaultModel";
        var isDef = store.doc(defKey, (pr.models[0] || {}).id) === mo.id;
        var db = btn("pm-btn", isDef ? "Default" : "Set default");
        db.disabled = isDef;
        db.addEventListener("click", function () {
          store.setDoc(defKey, mo.id);
          toast("ok", mo.name + " is now the default for " + pr.name + ".");
          render(currentRoute(), null, true);
        });
        ctl.appendChild(db);
        r.appendChild(ctl);
        row.appendChild(r);
        panel.appendChild(row);
      });
      if (!(pr.models || []).length) panel.appendChild(el("p", "d05-detail-note", "No models are listed until this provider is set up."));
    } else if (section === "credentials") {
      panel.appendChild(el("p", "d05-detail-note", pr.authNote || "Credentials stay with the provider's own sign-in. Puppet Master never displays secret material."));
      (pr.accounts || []).forEach(function (a) {
        var acct = el("div", "d05-acct");
        var top = el("div", "d05-acct-top");
        top.appendChild(el("span", "d05-acct-name", a.label));
        if (a.active) top.appendChild(badge("state", { "data-state": "custom" }, "Active"));
        if (a.sticky) top.appendChild(badge("state", { "data-state": "default" }, "Sticky"));
        top.appendChild(badge("state", { "data-state": "default" }, "Priority " + a.priority));
        acct.appendChild(top);
        acct.appendChild(el("span", "pm-muted", a.identity + " · " + a.authSource));
        acct.appendChild(el("span", "pm-faint pm-mono", "Key ••••••••••••" + (a.profileRoot ? " · " + a.profileRoot : "")));
        var sw = btn("pm-switch", "");
        sw.setAttribute("role", "switch");
        sw.setAttribute("aria-checked", a.enabled ? "true" : "false");
        sw.setAttribute("aria-label", "Enable account " + a.label);
        sw.addEventListener("click", function () {
          a.enabled = !a.enabled;
          sw.setAttribute("aria-checked", a.enabled ? "true" : "false");
          toast("ok", a.label + (a.enabled ? " enabled." : " disabled."));
        });
        acct.appendChild(sw);
        panel.appendChild(acct);
      });
      if (!(pr.accounts || []).length) panel.appendChild(el("p", "d05-detail-note", "No accounts yet. Sign-in happens with the provider's own flow — see Installation."));
      var auth = btn("pm-btn", pr.authModel === "api-token" ? "Add API token" : "Sign in");
      auth.addEventListener("click", function () {
        runOp("Sign in to " + pr.name, ["Open provider sign-in", "Wait for provider", "Verify"], function () {
          toast("ok", pr.name + " sign-in completed by the provider.");
        });
      });
      panel.appendChild(auth);
    } else if (section === "rate-limits") {
      var r = pr.routing || {};
      panel.appendChild(kv([
        ["Routing priority", String(r.priority || 1)],
        ["Use next provider at the limit", r.useNextOnExhaust ? "Yes" : "No"],
        ["Continuation", r.continuation || "Ask before switching"],
        ["Usage pressure", (pr.usageSnapshot && pr.usageSnapshot.pressure) || "Unknown"]
      ]));
    } else if (section === "usage") {
      var u = pr.usageSnapshot || {};
      panel.appendChild(kv([
        ["Included remaining", u.includedRemaining || "Unknown"],
        ["Extra balance", u.extraBalance || "None on file"],
        ["Resets", u.resetsAt || "Unknown"],
        ["Last successful use", u.lastSuccessfulUse || "Never"],
        ["Projection", u.projection || "No projection"],
        ["Freshness", u.sourceFreshness || "Unknown"]
      ]));
      var rb = btn("pm-btn", "Refresh usage");
      rb.addEventListener("click", function () {
        runOp("Refresh usage for " + pr.name, ["Ask provider", "Update snapshot"], function () {
          toast("ok", "Usage snapshot refreshed.");
        });
      });
      panel.appendChild(rb);
    } else if (section === "installation") {
      providerInstallPanel(pr, panel);
    } else if (section === "logs") {
      var log = el("div", "d05-log");
      (pr.diagnostics || []).forEach(function (l) { log.appendChild(el("div", null, l)); });
      if (!(pr.diagnostics || []).length) log.appendChild(el("div", null, "No log lines yet."));
      panel.appendChild(log);
    } else if (section === "help") {
      panel.appendChild(el("p", "d05-detail-note",
        "How provider credentials work: each provider owns its own sign-in. CLI providers keep tokens inside an isolated CLI profile; direct providers keep tokens in the OS credential store. Puppet Master stores only a reference, so settings can be copied between projects without ever moving secret material."));
    } else {
      panel.appendChild(el("p", "d05-detail-note", "Nothing on this page yet."));
    }
  }
  function authLabel(a) {
    return a === "cli-profile-oauth" ? "Provider CLI profile (isolated sign-in)"
      : a === "pm-direct-oauth" ? "Direct sign-in through Puppet Master"
      : a === "api-token" ? "API token"
      : a === "mixed" ? "Mixed (free and keyed routes)"
      : "No sign-in needed";
  }
  function providerInstallPanel(pr, panel) {
    var inst = pr.installations || [];
    if (pr.updateState && pr.updateState.state === "update-available") {
      var up = el("div", "d05-installbox");
      up.appendChild(el("p", null, "Update available: version " + pr.updateState.availableVersion + ". " + (pr.updateState.note || "")));
      var upb = btn("pm-btn", "Update to " + pr.updateState.availableVersion);
      upb.setAttribute("data-variant", "primary");
      upb.addEventListener("click", function () {
        runOp("Update " + pr.name, ["Download from official source", "Verify signature", "Swap binary"], function () {
          toast("ok", pr.name + " updated to " + pr.updateState.availableVersion + ".");
        });
      });
      up.appendChild(upb);
      panel.appendChild(up);
    }
    if (pr.installState === "not-installed" || !inst.length) {
      var box = el("div", "d05-installbox");
      box.appendChild(el("p", null, pr.name + " is acquired only from its official source. Puppet Master never bundles or pre-seeds provider tooling."));
      var cmd = pr.authModel === "api-token"
        ? "1. Create an API token in the provider's own console. 2. Paste it into the credentials page. 3. Test the connection."
        : "Install the official CLI from the provider's own distribution, then return here to detect it.";
      box.appendChild(el("p", "pm-muted", cmd));
      var acts = el("div", "d05-actions");
      var inst2 = btn("pm-btn", pr.authModel === "api-token" ? "Set up " + pr.name : "Install from the official source");
      inst2.setAttribute("data-variant", "primary");
      inst2.addEventListener("click", function () {
        runOp("Set up " + pr.name, ["Open official source", "Install / connect", "Detect", "Verify"], function () {
          toast("ok", pr.name + " setup finished and verified.");
        });
      });
      acts.appendChild(inst2);
      var repair0 = btn("pm-btn", "Repair setup");
      repair0.setAttribute("data-variant", "quiet");
      repair0.addEventListener("click", function () {
        runOp("Repair " + pr.name, ["Diagnose", "Repair", "Verify"], function () {
          toast("ok", pr.name + " repair completed.");
        });
      });
      acts.appendChild(repair0);
      box.appendChild(acts);
      panel.appendChild(box);
      return;
    }
    panel.appendChild(el("p", "d05-detail-note", "Installations found on this machine. The selected one serves requests; shadowed ones stay visible so nothing is silently used."));
    inst.forEach(function (ins) {
      var row = el("div", "d05-setrow");
      var r = el("div", "pm-row");
      var main = el("div", "pm-row-main");
      var lab = el("div", "pm-row-label");
      lab.appendChild(el("span", null, ins.label));
      if (ins.selected) lab.appendChild(badge("state", { "data-state": "custom" }, "Selected"));
      if (ins.shadowed) lab.appendChild(badge("state", { "data-state": "unavailable" }, "Shadowed"));
      lab.appendChild(badge("state", { "data-state": "default" }, ins.confidence + " confidence"));
      main.appendChild(lab);
      main.appendChild(el("div", "pm-row-desc", ins.methodLabel + " · version " + ins.version + " · " + ins.host + " (" + ins.environment + ")"));
      main.appendChild(el("div", "pm-row-src", ins.executable + " · " + ins.packageIdentity));
      r.appendChild(main);
      var ctl = el("div", "pm-row-control");
      if (!ins.selected) {
        var sel = btn("pm-btn", "Use this one");
        sel.addEventListener("click", function () {
          inst.forEach(function (x) { x.selected = false; });
          ins.selected = true; ins.shadowed = false;
          toast("ok", ins.label + " now serves " + pr.name + " requests.");
          render(currentRoute(), null, true);
        });
        ctl.appendChild(sel);
      }
      r.appendChild(ctl);
      row.appendChild(r);
      panel.appendChild(row);
    });
    var acts2 = el("div", "d05-actions");
    var repair = btn("pm-btn", "Repair installation");
    repair.addEventListener("click", function () {
      runOp("Repair " + pr.name, ["Diagnose", "Repair", "Verify"], function () {
        toast("ok", pr.name + " installation verified after repair.");
      });
    });
    acts2.appendChild(repair);
    var reinstall = btn("pm-btn", "Reinstall from the official source");
    reinstall.setAttribute("data-variant", "quiet");
    reinstall.addEventListener("click", function () {
      runOp("Reinstall " + pr.name, ["Open official source", "Install", "Verify"], function () {
        toast("ok", pr.name + " reinstalled from the official source.");
      });
    });
    acts2.appendChild(reinstall);
    panel.appendChild(acts2);
    if (pr.updatePolicy) panel.appendChild(el("p", "d05-detail-note", "Update policy: " + pr.updatePolicy));
  }

  /* ---------- deferred owner shells -------------------------------------------------------------- */
  function viewOwner(route, view) {
    var o = ownerById(route.owner);
    if (!o) { openDomain("system"); return; }
    var p = pad(view);
    view.setAttribute("data-manager-id", "owner-" + o.id);
    view.setAttribute("data-domain-id", "system");
    p.appendChild(crumbs([
      { label: "Settings", route: navStack[0] },
      { label: "System & Advanced", route: { view: "domain", domain: "system" } },
      { label: o.family }
    ]));
    p.appendChild(heroHead("plug", o.family, "A named owner outside Settings owns this area.", null));
    var box = el("div", "d05-owner");
    box.appendChild(kv([
      ["Owner", o.owner],
      ["Insertion destination", o.insertion],
      ["Returns to", o.returnContract]
    ]));
    box.appendChild(el("p", "d05-detail-note",
      "This area is owned by the " + o.owner + "; the demo shows the insertion point only. No backend state is fabricated here."));
    var b = btn("pm-btn", "Back to System & Advanced");
    b.addEventListener("click", goBack);
    box.appendChild(b);
    p.appendChild(box);
  }

  /* ---------- All Settings compendium (faceted, virtualized) --------------------------------------- */
  var ALL_TYPES = ["toggle", "select", "radio", "number", "slider", "text", "path", "list", "multiselect", "keyvalue", "action"];
  function allSettingsRows(facets) {
    var q = (facets.q || "").toLowerCase();
    var out = [];
    INV.categories.forEach(function (cat) {
      if (facets.domain && facets.domain !== cat.id) return;
      cat.subgroups.forEach(function (sub) {
        sub.settings.forEach(function (sid) {
          var s = INV.settings[sid];
          if (!s) return;
          if (facets.state && facets.state !== s.state) return;
          if (facets.exposure && facets.exposure !== s.exposure) return;
          if (facets.type && facets.type !== s.type) return;
          if (q && (s.label + " " + cat.title + " " + sub.title + " " + (s.search || []).join(" ")).toLowerCase().indexOf(q) < 0) return;
          out.push({ s: s, cat: cat, sub: sub });
        });
      });
    });
    return out;
  }
  function viewAll(route, view) {
    var facets = route.facets || { q: "", domain: "", state: "", exposure: "", type: "" };
    route.facets = facets;
    var p = pad(view);
    p.appendChild(crumbs([{ label: "Settings", route: navStack[0] }, { label: "All Settings" }]));
    p.appendChild(heroHead("list", "All Settings", "The complete long-tail index: every one of the 828 settings in this project, faceted and searchable.", null));
    var strip = scenarioStrip("all-settings");
    if (strip) p.appendChild(strip);

    var filter = el("div", "d05-hero-box");
    filter.style.marginBottom = "4px";
    filter.appendChild(icon("search"));
    var fi = document.createElement("input");
    fi.type = "search";
    fi.placeholder = "Filter by name or keyword";
    fi.setAttribute("aria-label", "Filter all settings");
    fi.value = facets.q || "";
    filter.appendChild(fi);
    p.appendChild(filter);

    var facetWrap = el("div");
    function facetRow(label, values, key) {
      var row = el("div", "d05-facets");
      row.appendChild(el("span", "d05-hit-group", label));
      values.forEach(function (v) {
        var c = btn("d05-facet", v[1]);
        c.setAttribute("aria-pressed", (facets[key] || "") === v[0] ? "true" : "false");
        c.addEventListener("click", function () {
          facets[key] = v[0];
          draw();
        });
        row.appendChild(c);
      });
      return row;
    }
    function draw() {
      clear(facetWrap);
      var dv = [["", "All domains"]];
      REG.DOMAINS.forEach(function (d) { dv.push([d.id, d.title]); });
      facetWrap.appendChild(facetRow("Domain", dv, "domain"));
      facetWrap.appendChild(facetRow("State", [["", "All states"], ["default", "Default"], ["custom", "Custom"], ["managed", "Managed"], ["unavailable", "Unavailable"]], "state"));
      facetWrap.appendChild(facetRow("Exposure", [["", "All exposure"], ["standard", "Standard"], ["advanced", "Advanced"]], "exposure"));
      var tv = [["", "All types"]];
      ALL_TYPES.forEach(function (t) { tv.push([t, t.charAt(0).toUpperCase() + t.slice(1)]); });
      facetWrap.appendChild(facetRow("Type", tv, "type"));
      drawList();
    }
    var listWrap = el("div");
    var count = el("p", "pm-faint");
    count.style.margin = "6px 0";
    function drawList() {
      var rows = allSettingsRows(facets);
      clear(listWrap);
      count.textContent = rows.length + " of 828 settings";
      listWrap.appendChild(count);
      if (!rows.length) {
        var empty = el("div", "pm-empty");
        empty.appendChild(el("div", "pm-empty-title", "No settings match these filters"));
        empty.appendChild(el("div", "pm-empty-guidance", "Loosen a facet or clear the filter text."));
        listWrap.appendChild(empty);
        return;
      }
      listWrap.appendChild(virtualList({
        rows: rows,
        rowHeight: 58,
        height: 460,
        render: function (item) {
          var s = item.s;
          var b = btn("d05-vrow", "");
          b.setAttribute("data-setting-id", s.id);
          b.appendChild(el("span", "d05-vrow-label", s.label));
          var meta = el("span", "d05-vrow-meta");
          meta.appendChild(badge("state", { "data-state": s.state }, s.state));
          b.appendChild(meta);
          b.appendChild(el("span", "d05-vrow-path", item.cat.title + " / " + item.sub.title));
          b.addEventListener("click", function () {
            openSection(s.domain, s.subgroup, s.id, { domain: s.domain, section: s.subgroup, row: s.id });
          });
          return b;
        }
      }));
    }
    fi.addEventListener("input", function () {
      facets.q = fi.value;
      drawList();
    });
    p.appendChild(facetWrap);
    p.appendChild(listWrap);
    draw();
  }

  /* ---------- virtualized list ------------------------------------------------------------------------ */
  function virtualList(opts) {
    var rowH = opts.rowHeight || 56;
    var height = opts.height || 440;
    var box = el("div", "d05-vlist pmv2-scroll");
    box.style.blockSize = height + "px";
    var spacer = el("div", "d05-vlist-spacer");
    spacer.style.blockSize = opts.rows.length * rowH + "px";
    box.appendChild(spacer);
    function paint() {
      var st = box.scrollTop;
      var start = Math.max(0, Math.floor(st / rowH) - 4);
      var end = Math.min(opts.rows.length, Math.ceil((st + height) / rowH) + 4);
      clear(spacer);
      for (var i = start; i < end; i++) {
        var node = opts.render(opts.rows[i], i);
        node.style.position = "absolute";
        node.style.insetBlockStart = i * rowH + "px";
        node.style.blockSize = rowH + "px";
        spacer.appendChild(node);
      }
    }
    box.addEventListener("scroll", paint);
    paint();
    return box;
  }

  /* ---------- full search results page ------------------------------------------------------------------- */
  function viewResults(route, view) {
    var p = pad(view);
    p.appendChild(crumbs([{ label: "Settings", route: navStack[0] }, { label: "Search results" }]));
    p.appendChild(heroHead("search", "Results for “" + route.query + "”", "Every match, routed by immutable result ID.", null));
    var holder = el("div");
    p.appendChild(holder);
    var ses = window.PM_V2_SEARCH.createSession(searchIndex, { limit: 200 });
    ses.query(route.query, function (results, meta) {
      clear(holder);
      holder.appendChild(el("p", "pm-faint", meta.total + " results"));
      if (!results.length) {
        holder.appendChild(el("div", "d05-hits-empty", "No matches for “" + route.query + "”."));
        return;
      }
      function resRow(e, inVirtual) {
        var b = btn("d05-vrow", "");
        if (!inVirtual) { b.style.position = "static"; b.style.blockSize = "auto"; }
        b.setAttribute("data-result-id", e.immutableResultId);
        b.appendChild(el("span", "d05-vrow-label", e.label));
        var meta2 = el("span", "d05-vrow-meta");
        meta2.appendChild(el("span", "d05-hit-kind", TYPE_LABEL[e.type] || e.type));
        b.appendChild(meta2);
        b.appendChild(el("span", "d05-vrow-path", e.path + (e.availability ? " · " + e.availability : "")));
        b.addEventListener("click", function () { activateResult(e.immutableResultId); });
        return b;
      }
      if (results.length > 60) {
        holder.appendChild(virtualList({ rows: results, rowHeight: 56, height: 480, render: function (e) { return resRow(e, true); } }));
      } else {
        var rows = el("div", "d05-rows");
        rows.style.marginTop = "8px";
        results.forEach(function (e) { rows.appendChild(resRow(e, false)); });
        holder.appendChild(rows);
      }
    });
  }

  /* ---------- Copy Settings From Another Project (focused centered review flow) ---------------------------- */
  var COPY_STEPS = ["Source", "Categories", "Preview", "Confirm", "Apply", "Receipt"];
  function viewCopy(route, view) {
    if (!copyEngine) copyEngine = new window.PM_V2_COPY.CopyEngine(store, INV, REG);
    var eng = copyEngine;
    var wrap = el("div", "d05-copy-wrap");
    var card = el("div", "d05-copy");
    card.setAttribute("data-section-id", "copy");
    wrap.appendChild(card);
    view.appendChild(wrap);

    card.appendChild(el("h1", "d05-copy-title", "Copy Settings From Another Project"));
    card.appendChild(el("p", "d05-detail-note", "A one-time transaction into " + store.currentProject().name + ". Nothing stays linked afterwards."));

    var steps = el("div", "d05-copy-steps");
    var stateIdx = { source: 0, categories: 1, preview: 2, confirm: 3, applying: 4, receipt: 5, failed: 5, "rolled-back": 5 };
    var cur = stateIdx[eng.state] != null ? stateIdx[eng.state] : 0;
    COPY_STEPS.forEach(function (s, i) {
      var st = el("span", null, (i + 1) + ". " + s);
      st.setAttribute("data-on", i <= cur ? "true" : "false");
      steps.appendChild(st);
      if (i < COPY_STEPS.length - 1) steps.appendChild(el("span", null, "→"));
    });
    card.appendChild(steps);

    if (eng.error) {
      var err = el("div", "d05-strip");
      err.setAttribute("data-tone", "warn");
      err.appendChild(icon("warn"));
      err.appendChild(el("span", null, eng.error));
      card.appendChild(err);
    }

    if (eng.state === "source") copySourceStep(eng, card);
    else if (eng.state === "categories") copyCategoriesStep(eng, card);
    else if (eng.state === "preview") copyPreviewStep(eng, card);
    else if (eng.state === "confirm") copyConfirmStep(eng, card);
    else if (eng.state === "receipt") copyReceiptStep(eng, card, false);
    else if (eng.state === "rolled-back") copyReceiptStep(eng, card, true);
    else if (eng.state === "failed") copyFailedStep(eng, card);
  }
  function copyFoot(card, nodes) {
    var f = el("div", "d05-copy-foot");
    nodes.forEach(function (n) { f.appendChild(n); });
    card.appendChild(f);
  }
  function copySourceStep(eng, card) {
    card.appendChild(el("p", "d05-detail-note", "Choose the project to copy from. The destination is always the current project."));
    eng.sources().forEach(function (pr) {
      var b = btn("d05-copy-src", "");
      b.setAttribute("aria-pressed", eng.sourceId === pr.id ? "true" : "false");
      var main = el("span");
      main.appendChild(el("div", null, pr.name));
      main.appendChild(el("div", "pm-faint", pr.path + " · updated " + pr.updated));
      b.appendChild(main);
      b.appendChild(el("span", "pm-faint", pr.settings + " settings"));
      b.addEventListener("click", function () {
        eng.selectSource(pr.id);
        render(currentRoute(), null, true);
      });
      card.appendChild(b);
    });
    var cancel = btn("pm-btn", "Cancel");
    cancel.addEventListener(goBack);
    copyFoot(card, [cancel]);
  }
  function copyCategoriesStep(eng, card) {
    card.appendChild(el("p", "d05-detail-note", "Pick the broad categories to copy. Credentials are re-pointed, never moved."));
    var chosen = {};
    REG.COPY_CATEGORIES.forEach(function (c) {
      var lab = el("label", "d05-copy-cat");
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.addEventListener("change", function () {
        if (cb.checked) chosen[c.id] = true; else delete chosen[c.id];
      });
      lab.appendChild(cb);
      var txt = el("span");
      txt.appendChild(el("div", null, c.title));
      txt.appendChild(el("div", "pm-faint", c.note));
      lab.appendChild(txt);
      lab.appendChild(el("small", null, c.domains.join(", ")));
      card.appendChild(lab);
    });
    var back = btn("pm-btn", "Back");
    back.addEventListener("click", function () { eng.reset(); render(currentRoute(), null, true); });
    var next = btn("pm-btn", "Preview the copy");
    next.setAttribute("data-variant", "primary");
    next.addEventListener("click", function () {
      var ids = Object.keys(chosen);
      if (eng.setCategories(ids) && eng.buildPreview()) render(currentRoute(), null, true);
      else render(currentRoute(), null, true);
    });
    copyFoot(card, [back, next]);
  }
  function copyPreviewStep(eng, card) {
    var pv = eng.preview;
    var totals = el("div", "d05-copy-totals");
    totals.appendChild(badge("state", { "data-state": "custom" }, pv.totals.add + " to add"));
    totals.appendChild(badge("state", { "data-state": "effective-differs" }, pv.totals.replace + " to replace"));
    totals.appendChild(badge("state", { "data-state": "default" }, pv.totals.unchanged + " unchanged"));
    totals.appendChild(badge("state", { "data-state": "unavailable" }, pv.totals.unavailable + " unavailable"));
    totals.appendChild(badge("state", { "data-state": "effective-differs" }, pv.totals.conflict + " conflicts"));
    card.appendChild(totals);
    card.appendChild(el("div", "d05-copy-note", pv.credentialPolicy));
    card.appendChild(el("div", "d05-copy-note", pv.independence));
    if (pv.capped) card.appendChild(el("div", "d05-copy-note", "Item lists are capped at 60 per group for review; the counts above are exact."));

    [["add", "Additions"], ["replace", "Replacements"], ["conflict", "Conflicts"], ["unavailable", "Unavailable (skipped)"]].forEach(function (g) {
      var items = pv.groups[g[0]];
      if (!items || !items.length) return;
      var grp = el("div", "d05-copy-group");
      grp.appendChild(el("h3", "d05-section-h", g[1] + " (" + pv.totals[g[0]] + ")"));
      items.forEach(function (it) {
        var row = el("div", "d05-copy-item");
        row.appendChild(el("span", null, it.label));
        row.appendChild(el("span", "pm-faint", it.note));
        grp.appendChild(row);
      });
      card.appendChild(grp);
    });

    var back = btn("pm-btn", "Back");
    back.addEventListener("click", function () { eng.state = "categories"; render(currentRoute(), null, true); });
    var go = btn("pm-btn", "Confirm and review");
    go.setAttribute("data-variant", "primary");
    go.addEventListener("click", function () {
      eng.confirm();
      render(currentRoute(), null, true);
    });
    copyFoot(card, [back, go]);
  }
  function copyConfirmStep(eng, card) {
    var pv = eng.preview;
    card.appendChild(el("p", "d05-detail-note",
      "Ready to apply " + (pv.totals.add + pv.totals.replace + pv.totals.conflict) + " changes from " + pv.sourceId +
      " into " + store.currentProject().name + ". A restore point is created first; the apply is atomic and verified, and you can roll back from the receipt."));
    var back = btn("pm-btn", "Back");
    back.addEventListener("click", function () { eng.state = "preview"; render(currentRoute(), null, true); });
    var go = btn("pm-btn", "Create restore point and apply");
    go.setAttribute("data-variant", "primary");
    go.addEventListener("click", function () {
      eng.apply();
      render(currentRoute(), null, true);
    });
    copyFoot(card, [back, go]);
  }
  function copyReceiptStep(eng, card, rolledBack) {
    var r = eng.receipt;
    var strip = el("div", "d05-strip");
    strip.setAttribute("data-tone", rolledBack ? "warn" : "info");
    strip.appendChild(icon(rolledBack ? "warn" : "check"));
    strip.appendChild(el("span", null, rolledBack ? "The copy was rolled back. This project is exactly as it was before." : "Copy applied and verified. The receipt is below."));
    card.appendChild(strip);
    if (r) {
      card.appendChild(kv([
        ["Transaction", r.title],
        ["Source", r.sourceId],
        ["Categories", (r.categories || []).join(", ")],
        ["Restore point", r.restorePointId],
        ["Verified", r.verified ? "Yes" : "No"],
        ["Rolled back", r.rolledBack ? "Yes" : "No"],
        ["Independence", r.independence]
      ]));
    }
    var btns = [];
    if (!rolledBack) {
      var rb = btn("pm-btn", "Roll back this copy");
      rb.setAttribute("data-variant", "danger");
      rb.addEventListener("click", function () {
        eng.rollback();
        toast("ok", "Copy rolled back to the restore point.");
        render(currentRoute(), null, true);
      });
      btns.push(rb);
    }
    var done = btn("pm-btn", "Done");
    done.setAttribute("data-variant", "primary");
    done.addEventListener(goBack);
    btns.push(done);
    copyFoot(card, btns);
  }
  function copyFailedStep(eng, card) {
    var strip = el("div", "d05-strip");
    strip.setAttribute("data-tone", "warn");
    strip.appendChild(icon("warn"));
    strip.appendChild(el("span", null, eng.error || "The copy could not be completed."));
    card.appendChild(strip);
    var btns = [];
    if (eng.restorePoint) {
      var rb = btn("pm-btn", "Roll back to the restore point");
      rb.setAttribute("data-variant", "danger");
      rb.addEventListener("click", function () {
        eng.rollback();
        render(currentRoute(), null, true);
      });
      btns.push(rb);
    }
    var again = btn("pm-btn", "Start over");
    again.addEventListener("click", function () { eng.reset(); render(currentRoute(), null, true); });
    btns.push(again);
    copyFoot(card, btns);
  }

  /* ---------- demo scenario drawer --------------------------------------------------------------------------- */
  var drawerOpen = false;
  function buildDemoDrawer() {
    var list = document.getElementById("d05-demo-list");
    if (!list) return;
    clear(list);
    function addBtn(name, label) {
      var b = btn("d05-demo-btn", "");
      b.appendChild(el("span", null, label));
      var state = el("span", "d05-demo-state");
      b.appendChild(state);
      b.addEventListener("click", function () {
        store.setScenario(name);
        closeDemoDrawer();
        toast("info", name ? "Scenario active: " + name : "Back to default fixtures.");
      });
      b.setAttribute("data-scenario", name || "");
      list.appendChild(b);
    }
    addBtn(null, "Default fixtures");
    store.scenarios().forEach(function (s) { addBtn(s, s.replace(/-/g, " ")); });
    syncDemoDrawer();
  }
  function syncDemoDrawer() {
    var list = document.getElementById("d05-demo-list");
    if (!list) return;
    var active = store.activeScenario() || "";
    var btns = list.querySelectorAll("[data-scenario]");
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute("data-scenario") === active;
      btns[i].setAttribute("aria-pressed", on ? "true" : "false");
      var st = btns[i].querySelector(".d05-demo-state");
      if (st) st.textContent = on ? "On" : "";
    }
  }
  function openDemoDrawer() {
    var scrim = document.getElementById("d05-scrim");
    var drawer = document.getElementById("d05-demo");
    if (!scrim || !drawer) return;
    scrim.hidden = false;
    drawer.hidden = false;
    drawerOpen = true;
    var btnOpen = document.querySelector("[data-demo-open]");
    if (btnOpen) btnOpen.setAttribute("aria-expanded", "true");
  }
  function closeDemoDrawer() {
    var scrim = document.getElementById("d05-scrim");
    var drawer = document.getElementById("d05-demo");
    if (!scrim || !drawer) return;
    scrim.hidden = true;
    drawer.hidden = true;
    drawerOpen = false;
    var btnOpen = document.querySelector("[data-demo-open]");
    if (btnOpen) btnOpen.setAttribute("aria-expanded", "false");
  }

  /* ---------- inbox (title-bar notifications) ------------------------------------------------------------------ */
  function renderInbox() {
    var list = document.querySelector("[data-shell-inbox-list]");
    if (!list) return;
    clear(list);
    (CORE.notices || []).forEach(function (n) {
      var item = el("div", "pm-inbox-item");
      item.setAttribute("data-kind", n.kind);
      item.appendChild(el("span", "pm-inbox-item-head", n.headline));
      var acts = el("span", "pm-inbox-item-actions");
      var b = btn("pm-btn", n.actionLabel || "Open");
      b.addEventListener("click", function () { goCoreTarget(n.target); });
      acts.appendChild(b);
      item.appendChild(acts);
      list.appendChild(item);
    });
    if (window.PMShell && window.PMShell.setInboxCount) window.PMShell.setInboxCount((CORE.notices || []).length);
  }

  /* ---------- global keys + outside clicks --------------------------------------------------------------------- */
  function wireGlobals() {
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (searchUI.field) searchUI.field.focus();
        return;
      }
      if (e.key === "Escape") {
        if (searchUI.open) { closeSearch(); return; }
        if (window.PMV2Menu && window.PMV2Menu.depth() > 0) { window.PMV2Menu.closeAll(); return; }
        if (drawerOpen) { closeDemoDrawer(); return; }
        goBack();
      }
    });
    document.addEventListener("pointerdown", function (e) {
      if (!searchUI.open) return;
      var t = e.target;
      if (searchUI.drop && searchUI.drop.contains(t)) return;
      if (searchUI.field && (t === searchUI.field || searchUI.field.contains(t))) return;
      closeSearch();
    });
    var scrim = document.getElementById("d05-scrim");
    if (scrim) scrim.addEventListener("click", closeDemoDrawer);
    var openBtn = document.querySelector("[data-demo-open]");
    if (openBtn) openBtn.addEventListener("click", function () {
      if (drawerOpen) closeDemoDrawer(); else openDemoDrawer();
    });
  }

  /* ---------- store subscription --------------------------------------------------------------------------------- */
  function wireStore() {
    store.subscribe(function (evt) {
      if (!evt) return;
      if (evt.type === "setting") {
        if (evt.id === "*") { render(currentRoute(), null, true); return; }
        var node = mainEl.querySelector('[data-setting-id="' + evt.id + '"]');
        var s = INV.settings[evt.id];
        if (node && s) {
          var fresh = settingRow(s);
          node.parentNode.replaceChild(fresh, node);
        }
      } else if (evt.type === "setting-reset") {
        var node2 = mainEl.querySelector('[data-setting-id="' + evt.id + '"]');
        var s2 = INV.settings[evt.id];
        if (node2 && s2) node2.parentNode.replaceChild(settingRow(s2), node2);
      } else if (evt.type === "scenario") {
        syncDemoDrawer();
        render(currentRoute(), null, true);
      } else if (evt.type === "doc") {
        if (evt.key === "dismissedNotices") render(currentRoute(), null, true);
      }
    });
  }

  /* ---------- boot ------------------------------------------------------------------------------------------------ */
  function boot() {
    buildChrome();
    buildDemoDrawer();
    renderInbox();
    wireGlobals();
    wireStore();
    if (window.PMShell && window.PMShell.init) window.PMShell.init();
    render(currentRoute(), null);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
