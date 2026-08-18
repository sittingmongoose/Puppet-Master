/* ============================================================================
   concept-06.js — Directory / Take 2 (kimi-k3 concept 06)
   ----------------------------------------------------------------------------
   Editorial, list-led Settings. A narrow stable domain rail; a single-column
   reading measure of large destination rows; a compact anchored universal
   search dropdown with full paths; restrained detail sheets; a quiet modal
   copy dialog. Motion: deeper surfaces rise into place, Back sinks (CSS).
   All behavior routes through the verified headless v2 modules:
   PM_V2_INVENTORY / REGISTRY / STORE / SEARCH / COPY / OBJECTS + PM_CORE_DATA.
   Vanilla ES5 IIFE. No frameworks, no DOM-only magic for core state: the nav
   stack + store documents are the state machine; rendering is a projection.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------- guards ------------------------------------------------- */
  var rootEl = document.getElementById("dt2-root");
  if (!rootEl) return;
  if (!window.PM_V2_INVENTORY || !window.PM_V2_REGISTRY || !window.PM_V2_STORE ||
      !window.PM_V2_SEARCH || !window.PM_V2_OBJECTS || !window.PM_V2_COPY ||
      !window.PM_CORE_DATA) return;

  var INV = window.PM_V2_INVENTORY;
  var REG = window.PM_V2_REGISTRY;
  var CORE = window.PM_CORE_DATA;
  var store = window.PM_V2_STORE.for("concept-06");
  var ROSTERS = window.PM_V2_OBJECTS.objects();
  var index = window.PM_V2_SEARCH.buildIndex({
    inventory: INV,
    registry: REG,
    coreData: CORE,
    objects: window.PM_V2_OBJECTS.searchObjects(),
    workflows: window.PM_V2_OBJECTS.workflows(),
    diagnostics: window.PM_V2_OBJECTS.diagnostics(),
    help: window.PM_V2_OBJECTS.help()
  });

  /* ---------------- tiny DOM + text helpers -------------------------------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function cap(w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : w; }
  function humanize(s) {
    return String(s == null ? "" : s).split(/[-_]/g).map(cap).join(" ");
  }
  function slugify(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function tokens(s) {
    var raw = String(s == null ? "" : s).toLowerCase().split(/[^a-z0-9]+/g), out = [];
    for (var i = 0; i < raw.length; i++) if (raw[i]) out.push(raw[i]);
    return out;
  }
  function formatVal(v) {
    if (v == null) return "Not set";
    if (typeof v === "boolean") return v ? "On" : "Off";
    if (Object.prototype.toString.call(v) === "[object Array]") {
      return v.length ? v.length + (v.length === 1 ? " item" : " items") + " — " + v.slice(0, 4).join(", ") + (v.length > 4 ? "…" : "") : "Empty list";
    }
    if (typeof v === "object") {
      var n = Object.keys(v).length;
      return n + (n === 1 ? " entry" : " entries");
    }
    return String(v);
  }
  function badge(kind, attrName, attrVal, text) {
    var b = el("span", "pm-badge", text);
    if (kind) b.setAttribute("data-kind", kind);
    if (attrName) b.setAttribute("data-" + attrName, attrVal);
    return b;
  }

  /* ---------------- icons (SVG only; stroke grammar from the shell) -------- */
  var ICONS = {
    home: '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    palette: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="1.1"/><circle cx="14.5" cy="9" r="1.1"/><circle cx="15" cy="14" r="1.1"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 3 5 3 3 0 0 0 5 2V6a3 3 0 0 0-3-2z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-3 5 3 3 0 0 1-5 2"/>',
    shield: '<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
    database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    checklist: '<path d="m4 6 1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9"/>',
    branch: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.2 6.8 15.8 11"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m4 17 5-5 4 4 3-3 4 4"/>',
    globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.3 4 5 4 8s-1.5 5.7-4 8c-2.5-2.3-4-5-4-8s1.5-5.7 4-8z"/>',
    person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-3.5 3.5-5 7-5s6 1.5 7 5"/>',
    people: '<circle cx="8" cy="9" r="3"/><path d="M2.5 19c.8-3 2.8-4.5 5.5-4.5S12.7 16 13.5 19"/><circle cx="16.5" cy="8" r="2.5"/><path d="M15 14.7c2.8.1 4.8 1.6 5.5 4.3"/>',
    puzzle: '<path d="M8 4h8v4h4v8h-4v4H8v-4H4V8h4z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12z"/>',
    steering: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 14.5V20M4.5 10h5M14.5 10h5"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    speaker: '<path d="M4 10v4h3l5 4V6l-5 4z"/><path d="M15 9a4 4 0 0 1 0 6"/>',
    "check-spelling": '<path d="m4 15 3-8 3 8M5 12.5h4M13 15l2 2 4-5"/>',
    monitor: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M9 21h6M12 17v4"/>',
    folder: '<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
    terminal: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>',
    language: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a12 12 0 0 1 0 16 12 12 0 0 1 0-16z"/>',
    format: '<path d="M5 6h14M7 6v3M17 6v3M12 6v12M10 18h4"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.6 4.7L4 16.1V20h3.9l4.9-4.9a4 4 0 0 0 4.7-5.6L14 13l-3-3z"/>',
    beaker: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 14h9"/>',
    box: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    command: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m8 10 2.5 2L8 14M12.5 14H16"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    plug: '<path d="M9 3v4M15 3v4M6 7h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6z"/><path d="M12 16v5"/>',
    mortarboard: '<path d="m2 9 10-4 10 4-10 4z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5"/>',
    stethoscope: '<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 12v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="10" r="2"/>',
    "hard-drive": '<rect x="3" y="13" width="18" height="6" rx="2"/><path d="M6 16h.01M10 16h.01M3 13l2.5-5h13L21 13"/>',
    safe: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5V10M12 14v1.5M8.5 12H10M14 12h1.5"/>',
    recycle: '<path d="m7 7-3 5 3 1M17 7l3 5-3 1M8 20h8M12 4v3"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    archive: '<rect x="4" y="4" width="16" height="5"/><path d="M5 9v11h14V9M10 13h4"/>',
    broom: '<path d="M14 3l4 4M13 5l-6 9c-2 .5-3.5 2-4 4l-1 3 3-1c2-.5 3.5-2 4-4l6-9"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    "play-circle": '<circle cx="12" cy="12" r="8"/><path d="m10 8 5 4-5 4z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    caret: '<path d="m9 6 6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    dots: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    index: '<path d="M5 5h14M5 12h14M5 19h14"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'
  };
  function svgEl(name) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = ICONS[name] || '<circle cx="12" cy="12" r="8"/>';
    return s;
  }
  function caretEl() { var c = el("span", "dt2-caret"); c.appendChild(svgEl("caret")); return c; }

  /* ---------------- inventory projections ---------------------------------- */
  var CATS = {};
  INV.categories.forEach(function (c) { CATS[c.id] = c; });
  function catTitle(id) { return CATS[id] ? CATS[id].title : humanize(id); }
  function subgroupOf(domain, subId) {
    var cat = CATS[domain]; if (!cat) return null;
    for (var i = 0; i < cat.subgroups.length; i++) if (cat.subgroups[i].id === subId) return cat.subgroups[i];
    return null;
  }
  function domainSettingCount(domain) {
    var cat = CATS[domain], n = 0;
    if (cat) cat.subgroups.forEach(function (s) { n += s.settings.length; });
    return n;
  }
  /* Deterministically assign a domain's inventory subgroups to a manager's
     subpages: token overlap first, then balance leftovers to the emptiest
     page. Stable across renders — no second convention beside the inventory. */
  var managerGroupsCache = {};
  function managerGroups(m) {
    if (managerGroupsCache[m.id]) return managerGroupsCache[m.id];
    var pages = (m.subpages || []).map(function (t) { return { slug: slugify(t), title: t, subs: [] }; });
    var cat = CATS[m.domain];
    var subs = cat ? cat.subgroups.slice() : [];
    if (!pages.length) return [];
    var assigned = {};
    subs.forEach(function (sub) {
      var st = tokens(sub.id + " " + sub.title), best = -1, bestScore = 0;
      pages.forEach(function (p, i) {
        var pt = tokens(p.title), score = 0;
        pt.forEach(function (t) { if (st.indexOf(t) >= 0) score += 1; });
        st.forEach(function (t) { if (pt.indexOf(t) >= 0 && t.length > 3) score += 1; });
        if (score > bestScore) { bestScore = score; best = i; }
      });
      if (best >= 0) { pages[best].subs.push(sub); assigned[sub.id] = true; }
    });
    subs.forEach(function (sub) {
      if (assigned[sub.id]) return;
      var min = 0;
      pages.forEach(function (p, i) { if (p.subs.length < pages[min].subs.length) min = i; });
      pages[min].subs.push(sub);
    });
    managerGroupsCache[m.id] = pages;
    return pages;
  }
  function providerFixture(id) {
    var list = CORE.providers || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* ---------------- navigation state machine --------------------------------
     The stack is the state. Locations:
       {name:"home"} | {name:"domain",domain} | {name:"section",domain,section,row?}
       {name:"manager",domain,manager,page?,object?,section?}
       {name:"owner",ownerId} | {name:"all"}                                   */
  var nav = [{ name: "home" }];
  var pendingSearch = null;     // restored after Back from a search landing
  var pendingLocate = null;     // destination to scroll/focus after render
  var currentRevealAll = null;  // section views register a reveal callback
  var suppress = false;         // mute subscribe re-render during batched writes
  var compState = { q: "", domain: "", exposure: "", state: "", type: "" };
  var catalogState = {};        // per-manager facet selection
  var sectionExpanded = {};     // per-subgroup "show all" toggle

  function current() { return nav[nav.length - 1]; }
  function homeLoc() { return { name: "home" }; }
  function ownerById(id) {
    for (var i = 0; i < REG.DEFERRED_OWNERS.length; i++) if (REG.DEFERRED_OWNERS[i].id === id) return REG.DEFERRED_OWNERS[i];
    return null;
  }
  function locTitle(loc) {
    if (loc.name === "home") return "Home";
    if (loc.name === "domain") return catTitle(loc.domain);
    if (loc.name === "section") {
      var sub = subgroupOf(loc.domain, loc.section);
      return sub ? sub.title : humanize(loc.section);
    }
    if (loc.name === "manager") {
      var m = REG.managerById(loc.manager);
      return m ? m.title : humanize(loc.manager);
    }
    if (loc.name === "owner") {
      var o = ownerById(loc.ownerId);
      return o ? o.family : humanize(loc.ownerId);
    }
    if (loc.name === "all") return "All Settings";
    return "Settings";
  }
  function go(loc) {
    nav.push(loc);
    render("deeper");
  }
  function back() {
    if (nav.length <= 1) return;
    nav.pop();
    var ss = store.searchState();
    pendingSearch = ss && ss.query ? { query: ss.query, resultId: ss.resultId } : null;
    render("back");
    restoreSearchIfNeeded();
  }
  function closeSettings() {
    nav = [homeLoc()];
    render("back");
  }
  /* Search routing: immutableResultId -> resolve -> destination -> stack. */
  function stackFor(dest) {
    var st = [homeLoc()];
    if (dest.domain && CATS[dest.domain]) st.push({ name: "domain", domain: dest.domain });
    if (dest.manager) {
      if (dest.manager.indexOf("owner-") === 0) {
        if (st.length === 1) st.push({ name: "domain", domain: "system" });
        st.push({ name: "owner", ownerId: dest.manager.slice(6) });
      } else if (REG.managerById(dest.manager)) {
        if (st.length === 1) st.push({ name: "domain", domain: dest.domain || REG.managerById(dest.manager).domain });
        st.push({
          name: "manager", domain: dest.domain, manager: dest.manager,
          page: dest.page || null, object: dest.object || null, section: dest.section || null
        });
      }
    } else if (dest.section || dest.row || dest.page) {
      var subId = dest.section || dest.page;
      if (dest.domain && subgroupOf(dest.domain, subId)) {
        st.push({ name: "section", domain: dest.domain, section: subId, row: dest.row || null });
      }
    }
    return st;
  }
  function navigateTo(dest) {
    if (!dest || (!dest.domain && !dest.manager)) { closeSettings(); return; }
    nav = stackFor(dest);
    pendingLocate = dest;
    render("deeper");
    locatePending();
  }
  function locatePending() {
    if (!pendingLocate) return;
    var dest = pendingLocate;
    pendingLocate = null;
    var target = null;
    if (dest.row) target = els.body.querySelector('[data-setting-id="' + dest.row + '"]');
    if (!target && dest.row && currentRevealAll) {
      currentRevealAll();
      target = els.body.querySelector('[data-setting-id="' + dest.row + '"]');
    }
    if (!target && dest.object) target = els.body.querySelector('[data-object-id="' + dest.object + '"]');
    if (!target && dest.section) target = els.body.querySelector('[data-section-id="' + dest.section + '"]');
    if (!target && dest.manager) target = els.body.querySelector('[data-manager-id="' + dest.manager + '"]');
    if (!target && dest.domain) target = els.body.querySelector('.dt2-view[data-domain-id="' + dest.domain + '"]');
    if (!target) return;
    try { target.scrollIntoView({ block: "center" }); } catch (e) { target.scrollIntoView(); }
    if (!target.getAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    try { target.focus({ preventScroll: true }); } catch (e2) { try { target.focus(); } catch (e3) { /* noop */ } }
    target.classList.add("pmv2-locate"); // calm settle animation + persistent outline
  }

  /* ---------------- shell mount -------------------------------------------- */
  var els = {};
  var searches = [];
  function buildShell() {
    rootEl.innerHTML = "";
    var project = store.currentProject();

    var rail = el("nav", "dt2-rail");
    rail.setAttribute("aria-label", "Settings directory");
    var brand = el("div", "dt2-rail-brand");
    brand.appendChild(el("strong", null, "Settings"));
    brand.appendChild(el("span", null, project.name + " — this project only"));
    rail.appendChild(brand);
    els.railList = el("div", "dt2-rail-list pmv2-scroll");
    rail.appendChild(els.railList);

    var scrim = el("button", "dt2-rail-scrim");
    scrim.type = "button";
    scrim.setAttribute("aria-label", "Close navigation");
    scrim.addEventListener("click", function () { rootEl.setAttribute("data-rail-open", "false"); });

    var main = el("div", "dt2-main");
    var head = el("div", "dt2-head");
    var burger = el("button", "dt2-hamburger");
    burger.type = "button";
    burger.setAttribute("aria-label", "Open the settings directory");
    burger.appendChild(svgEl("menu"));
    burger.addEventListener("click", function () {
      rootEl.setAttribute("data-rail-open", rootEl.getAttribute("data-rail-open") === "true" ? "false" : "true");
    });
    head.appendChild(burger);
    els.crumb = el("div", "dt2-crumb");
    head.appendChild(els.crumb);
    var headSearchMount = el("div", "dt2-search");
    head.appendChild(headSearchMount);
    els.headerSearch = makeSearch(headSearchMount, {
      placeholder: "Search settings…",
      home: false
    });
    main.appendChild(head);
    els.body = el("div", "dt2-body pmv2-scroll");
    main.appendChild(els.body);

    rootEl.appendChild(rail);
    rootEl.appendChild(scrim);
    rootEl.appendChild(main);
    renderRail();
  }
  function renderRail() {
    var list = els.railList;
    list.innerHTML = "";
    var loc = current();
    function item(iconName, label, isCurrent, fn, attrs) {
      var b = el("button", "dt2-rail-item");
      b.type = "button";
      b.appendChild(svgEl(iconName));
      b.appendChild(el("span", null, label));
      if (isCurrent) b.setAttribute("aria-current", "true");
      if (attrs) for (var k in attrs) b.setAttribute(k, attrs[k]);
      b.addEventListener("click", function () {
        fn();
        rootEl.setAttribute("data-rail-open", "false");
      });
      list.appendChild(b);
      return b;
    }
    item("home", "Home", loc.name === "home", function () { nav = [homeLoc()]; render("back"); });
    list.appendChild(el("div", "dt2-rail-sect", "Directory"));
    INV.categories.forEach(function (c) {
      item(c.icon, c.title, loc.domain === c.id && loc.name !== "all", function () {
        nav = [homeLoc(), { name: "domain", domain: c.id }];
        render(loc.name === "home" ? "deeper" : "same");
      }, { "data-domain-id": c.id });
    });
    list.appendChild(el("div", "dt2-rail-sect", "Utilities"));
    item("index", "All Settings index", loc.name === "all", function () {
      nav = [homeLoc(), { name: "all" }];
      render("deeper");
    }, { "data-util": "true" });
    item("copy", "Copy settings from another project", false, function () { openCopy(); }, { "data-util": "true" });
  }
  function renderCrumb() {
    var c = els.crumb;
    c.innerHTML = "";
    var rootBtn = el("button", null, "Settings");
    rootBtn.type = "button";
    rootBtn.addEventListener("click", closeSettings);
    c.appendChild(rootBtn);
    nav.forEach(function (loc, i) {
      if (loc.name === "home") return;
      c.appendChild(el("span", "dt2-crumb-sep", "/"));
      if (i === nav.length - 1) {
        var cur = el("span", null, locTitle(loc));
        cur.setAttribute("aria-current", "page");
        c.appendChild(cur);
      } else {
        (function (idx) {
          var b = el("button", null, locTitle(loc));
          b.type = "button";
          b.addEventListener("click", function () {
            nav = nav.slice(0, idx + 1);
            render("back");
          });
          c.appendChild(b);
        })(i);
      }
    });
  }

  /* ---------------- universal search ---------------------------------------- */
  var TYPE_LABELS = {
    setting: "Setting", manager: "Page", managed_object: "Object", action: "Action",
    setup_or_repair_workflow: "Workflow", diagnostic_or_read_only_status: "Status",
    unavailable_capability: "Unavailable", intentional_help_result: "Help"
  };
  function markLabel(span, label, q) {
    span.textContent = "";
    if (!q) { span.textContent = label; return; }
    var i = label.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) { span.textContent = label; return; }
    span.appendChild(document.createTextNode(label.slice(0, i)));
    span.appendChild(el("mark", null, label.slice(i, i + q.length)));
    span.appendChild(document.createTextNode(label.slice(i + q.length)));
  }
  function makeSearch(mount, opts) {
    opts = opts || {};
    var session = window.PM_V2_SEARCH.createSession(index, { limit: 30 });
    var box = el("div", "dt2-search-box");
    box.appendChild(svgEl("search"));
    var input = el("input");
    input.type = "text";
    input.placeholder = opts.placeholder || "Search settings…";
    input.setAttribute("aria-label", "Search settings");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    if (opts.inputId) input.id = opts.inputId;
    var clear = el("button", "dt2-search-clear");
    clear.type = "button";
    clear.setAttribute("aria-label", "Clear search");
    clear.appendChild(svgEl("x"));
    clear.hidden = true;
    box.appendChild(input);
    box.appendChild(clear);
    var results = el("div", "dt2-results pmv2-scroll");
    results.hidden = true;
    results.setAttribute("role", "listbox");
    results.setAttribute("aria-label", "Search results");
    if (opts.resultsId) results.id = opts.resultsId;
    mount.appendChild(box);
    mount.appendChild(results);

    var api = {
      mount: mount, input: input, results: results,
      open: false, rows: [], active: -1, lastQuery: "", home: !!opts.home
    };
    searches.push(api);

    function close() {
      api.open = false;
      results.hidden = true;
      api.active = -1;
    }
    function setActive(i) {
      var rows = results.querySelectorAll(".dt2-result");
      for (var k = 0; k < rows.length; k++) rows[k].setAttribute("data-active", k === i ? "true" : "false");
      api.active = i;
      if (rows[i]) rows[i].scrollIntoView({ block: "nearest" });
    }
    function renderResults(list, meta) {
      results.innerHTML = "";
      api.rows = list || [];
      api.active = -1;
      var head = el("div", "dt2-results-head");
      var q = meta && meta.query != null ? meta.query : api.lastQuery;
      head.appendChild(el("span", null, (meta ? meta.total : api.rows.length) + (meta && meta.total === 1 ? " result" : " results") + (q ? " for \u201C" + q + "\u201D" : "")));
      var clr = el("button", null, "Clear");
      clr.type = "button";
      clr.addEventListener("click", function () { input.value = ""; api.lastQuery = ""; close(); input.focus(); });
      head.appendChild(clr);
      results.appendChild(head);
      if (!api.rows.length) {
        results.appendChild(el("div", "dt2-results-empty", q ? "No results for \u201C" + q + "\u201D. Check the spelling or try a broader term." : "Type to search."));
        results.hidden = false;
        api.open = true;
        return;
      }
      api.rows.forEach(function (r, i) {
        var b = el("button", "dt2-result");
        b.type = "button";
        b.setAttribute("role", "option");
        b.setAttribute("data-result-id", r.immutableResultId);
        if (r.availability) b.setAttribute("data-unavailable", "true");
        var label = el("span", "dt2-result-label");
        markLabel(label, r.label, q);
        b.appendChild(label);
        b.appendChild(el("span", "dt2-result-type", TYPE_LABELS[r.type] || humanize(r.type)));
        b.appendChild(el("span", "dt2-result-path", r.path));
        if (r.availability) b.appendChild(el("span", "dt2-result-avail", r.availability));
        b.addEventListener("click", function () { choose(r); });
        b.addEventListener("mousemove", function () { if (api.active !== i) setActive(i); });
        results.appendChild(b);
      });
      if (meta && meta.bounded) {
        var more = el("button", "dt2-results-more", "View all " + meta.total + " results");
        more.type = "button";
        more.addEventListener("click", function () {
          compState.q = q;
          closeAllSearches();
          nav = [homeLoc(), { name: "all" }];
          render("deeper");
        });
        results.appendChild(more);
      }
      results.hidden = false;
      api.open = true;
    }
    function runQuery(q, after) {
      api.lastQuery = q;
      if (!q) { close(); if (after) after(); return; }
      session.query(q, function (list, meta) { renderResults(list, meta); if (after) after(); });
    }
    function choose(r) {
      var entry = window.PM_V2_SEARCH.resolve(index, r.immutableResultId);
      if (!entry) return;
      store.saveSearchState(api.lastQuery, entry.immutableResultId);
      closeAllSearches();
      navigateTo(entry.destination);
    }
    input.addEventListener("input", function () {
      clear.hidden = !input.value;
      runQuery(input.value.replace(/^\s+|\s+$/g, ""));
    });
    input.addEventListener("focus", function () {
      if (input.value) runQuery(input.value.replace(/^\s+|\s+$/g, ""));
    });
    input.addEventListener("keydown", function (e) {
      if (!api.open) return;
      var n = api.rows.length;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(Math.min(n - 1, api.active + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(0, api.active - 1)); }
      else if (e.key === "Enter") {
        e.preventDefault();
        var r = api.rows[api.active >= 0 ? api.active : 0];
        if (r) choose(r);
      }
    });
    clear.addEventListener("click", function () {
      input.value = "";
      clear.hidden = true;
      api.lastQuery = "";
      close();
      input.focus();
    });
    api.close = close;
    api.restore = function (q, resultId) {
      input.value = q;
      clear.hidden = !q;
      runQuery(q, function () {
        if (!resultId) return;
        var rows = results.querySelectorAll(".dt2-result");
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].getAttribute("data-result-id") === resultId) { setActive(i); break; }
        }
      });
    };
    return api;
  }
  function closeAllSearches() {
    searches.forEach(function (s) { s.close(); });
  }
  function restoreSearchIfNeeded() {
    if (!pendingSearch) return;
    var ps = pendingSearch;
    pendingSearch = null;
    var api = current().name === "home" && els.homeSearch ? els.homeSearch : els.headerSearch;
    if (api) api.restore(ps.query, ps.resultId);
  }
  document.addEventListener("mousedown", function (e) {
    var inside = false;
    searches.forEach(function (s) { if (s.mount.contains(e.target)) inside = true; });
    if (!inside) closeAllSearches();
  });

  /* ---------------- shared page furniture ----------------------------------- */
  function backBtn(label) {
    var b = el("button", "dt2-back");
    b.type = "button";
    b.appendChild(svgEl("back"));
    b.appendChild(el("span", null, "Back to " + label));
    b.addEventListener("click", back);
    return b;
  }
  function pageHead(mount, title, blurb, metaBadges, menuItems) {
    var head = el("div", "dt2-pagehead");
    head.appendChild(el("h1", "dt2-title", title));
    if (blurb) head.appendChild(el("p", null, blurb));
    if ((metaBadges && metaBadges.length) || menuItems) {
      var meta = el("div", "dt2-pagehead-meta");
      (metaBadges || []).forEach(function (b) { meta.appendChild(b); });
      if (menuItems && window.PMV2Menu) meta.appendChild(overflowBtn(menuItems));
      head.appendChild(meta);
    }
    mount.appendChild(head);
    return head;
  }
  function overflowBtn(items) {
    var b = el("button", "pm-btn");
    b.type = "button";
    b.setAttribute("aria-label", "More actions");
    b.setAttribute("title", "More actions");
    b.appendChild(svgEl("dots"));
    b.addEventListener("click", function () { window.PMV2Menu.open(b, items); });
    return b;
  }
  function stripEl(surfaceId) {
    var p = store.projection(surfaceId);
    if (!p || p.state === "ready") return null;
    var d = el("div", "dt2-strip");
    d.setAttribute("data-scenario-state", p.state);
    d.appendChild(badge(null, null, null, humanize(p.state)));
    d.appendChild(el("span", null, p.message || humanize(p.state)));
    if (p.cached) d.appendChild(el("span", "dt2-roster-sub", "Showing cached values."));
    return d;
  }
  function closeRailOnNarrow() { rootEl.setAttribute("data-rail-open", "false"); }

  /* ---------------- setting rows (ordinary setting grammar) ------------------ */
  function stateOf(sid) {
    var s = INV.settings[sid];
    if (!s) return "default";
    if (s.state === "managed" || s.state === "unavailable") return s.state;
    if (store.overrideInfo(sid)) return "custom";
    return s.state || "default";
  }
  function valueOf(sid) {
    var s = INV.settings[sid];
    var base = s.value !== undefined ? s.value : s.default;
    return store.value(sid, base);
  }
  function runInlineAction(btn, s) {
    btn.disabled = true;
    btn.textContent = "Running…";
    var op = store.begin({ kind: "setting-action", title: s.label, phases: [{ name: "Running" }], cancelable: false });
    setTimeout(function () {
      store.completePhase(op.id);
      store.finish(op.id, "done");
      btn.disabled = false;
      btn.textContent = "Run again";
    }, 450);
  }
  function segControl(options, currentVal, onPick, label) {
    var seg = el("div", "pm-seg");
    seg.setAttribute("role", "radiogroup");
    seg.setAttribute("aria-label", label);
    options.forEach(function (o) {
      var b = el("button", null, String(o));
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(o) === currentVal ? "true" : "false");
      b.addEventListener("click", function () { onPick(o); });
      seg.appendChild(b);
    });
    return seg;
  }
  function buildControl(ctl, s, sid) {
    var v = valueOf(sid);
    var t = s.type;
    if (t === "toggle") {
      var sw = el("button", "pm-switch");
      sw.type = "button";
      sw.setAttribute("role", "switch");
      sw.setAttribute("aria-checked", v ? "true" : "false");
      sw.setAttribute("aria-label", s.label);
      sw.addEventListener("click", function () { store.setValue(sid, !valueOf(sid)); });
      ctl.appendChild(sw);
    } else if (t === "select" && s.options && s.options.length) {
      if (s.options.length <= 3) {
        ctl.appendChild(segControl(s.options, String(v), function (pick) { store.setValue(sid, pick); }, s.label));
      } else {
        var wrap = el("span", "pm-select");
        var sel = el("select");
        sel.setAttribute("aria-label", s.label);
        s.options.forEach(function (o) {
          var opt = el("option", null, String(o));
          opt.value = String(o);
          if (String(o) === String(v)) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener("change", function () { store.setValue(sid, sel.value); });
        wrap.appendChild(sel);
        ctl.appendChild(wrap);
      }
    } else if (t === "radio" && s.options && s.options.length) {
      ctl.appendChild(segControl(s.options, String(v), function (pick) { store.setValue(sid, pick); }, s.label));
    } else if (t === "multiselect" && s.options && s.options.length) {
      var arr = Object.prototype.toString.call(v) === "[object Array]" ? v.slice() : [];
      var seg = el("div", "pm-seg");
      seg.setAttribute("role", "group");
      seg.setAttribute("aria-label", s.label);
      s.options.forEach(function (o) {
        var b = el("button", null, humanize(o));
        b.type = "button";
        b.setAttribute("role", "checkbox");
        b.setAttribute("aria-checked", arr.indexOf(o) >= 0 ? "true" : "false");
        b.addEventListener("click", function () {
          var cur = valueOf(sid);
          cur = Object.prototype.toString.call(cur) === "[object Array]" ? cur.slice() : [];
          var i = cur.indexOf(o);
          if (i >= 0) cur.splice(i, 1); else cur.push(o);
          store.setValue(sid, cur);
        });
        seg.appendChild(b);
      });
      ctl.appendChild(seg);
    } else if (t === "slider") {
      var num = Number(v);
      if (isNaN(num)) num = Number(s.default) || 0;
      var min = s.min != null ? s.min : 0;
      var max = s.max != null ? s.max : (Math.abs(num) <= 1 ? 1 : (Math.abs(num) <= 100 ? 100 : Math.ceil(Math.abs(num) * 2)));
      var step = s.step != null ? s.step : (max <= 1 ? 0.05 : 1);
      var swrap = el("span", "pm-sliderwrap");
      var range = el("input", "pm-slider");
      range.type = "range";
      range.min = String(min); range.max = String(max); range.step = String(step);
      range.value = String(num);
      range.setAttribute("aria-label", s.label);
      var bubble = el("span", "pm-slider-val", String(num));
      range.addEventListener("input", function () { bubble.textContent = range.value; });
      range.addEventListener("change", function () { store.setValue(sid, Number(range.value)); });
      swrap.appendChild(range);
      swrap.appendChild(bubble);
      ctl.appendChild(swrap);
    } else if (t === "number") {
      var input = el("input", "dt2-input");
      input.type = "number";
      input.value = v == null ? "" : String(v);
      input.setAttribute("aria-label", s.label);
      input.addEventListener("change", function () {
        var n = Number(input.value);
        store.setValue(sid, isNaN(n) ? input.value : n);
      });
      ctl.appendChild(input);
    } else if (t === "action") {
      var run = el("button", "pm-btn", "Run");
      run.type = "button";
      run.addEventListener("click", function () { runInlineAction(run, s); });
      ctl.appendChild(run);
    } else if (t === "list" || t === "keyvalue") {
      var chips = el("span", "dt2-chipset");
      chips.appendChild(badge(null, null, null, formatVal(v)));
      ctl.appendChild(chips);
    } else {
      var ti = el("input", "dt2-input");
      ti.type = "text";
      ti.value = v == null ? "" : String(v);
      ti.setAttribute("aria-label", s.label);
      ti.addEventListener("change", function () { store.setValue(sid, ti.value); });
      ctl.appendChild(ti);
    }
    if (store.overrideInfo(sid)) {
      var reset = el("button", "dt2-reset", "Reset");
      reset.type = "button";
      reset.title = "Reset to the default value";
      reset.addEventListener("click", function () { store.resetValue(sid); });
      ctl.appendChild(reset);
    }
  }
  function buildDetail(box, s, sid) {
    var dl = el("dl");
    var rows = [
      ["Current value", formatVal(valueOf(sid))],
      ["Default", formatVal(s.default)]
    ];
    if (s.recommended !== undefined) rows.push(["Recommended", formatVal(s.recommended)]);
    rows.push(["Source", s.source || "Default"]);
    rows.push(["Tier", humanize(s.tier || "simple")]);
    rows.push(["Exposure", humanize(s.exposure || "standard")]);
    rows.push(["State", humanize(stateOf(sid))]);
    rows.push(["Identifier", sid]);
    rows.forEach(function (r) {
      dl.appendChild(el("dt", null, r[0]));
      dl.appendChild(el("dd", null, r[1]));
    });
    box.appendChild(dl);
    if (s.effect && s.effect.note) box.appendChild(el("p", null, s.effect.note));
  }
  function settingRow(sid) {
    var s = INV.settings[sid];
    if (!s) return null;
    var state = stateOf(sid);
    var row = el("div", "dt2-row");
    row.setAttribute("data-setting-id", sid);
    row.setAttribute("data-state", state);
    var label = el("div", "dt2-row-label");
    label.appendChild(document.createTextNode(s.label));
    if (state !== "default") label.appendChild(badge("state", "state", state, humanize(state)));
    if (s.exposure === "expert" || s.exposure === "managed") label.appendChild(badge("exposure", "exposure", s.exposure, humanize(s.exposure)));
    row.appendChild(label);
    row.appendChild(el("div", "dt2-row-desc", s.desc || ""));
    var ctl = el("div", "dt2-row-control");
    buildControl(ctl, s, sid);
    row.appendChild(ctl);
    var why = el("button", "dt2-row-why", "Why this value?");
    why.type = "button";
    var detail = el("div", "dt2-row-detail");
    detail.hidden = true;
    buildDetail(detail, s, sid);
    why.addEventListener("click", function () {
      detail.hidden = !detail.hidden;
      why.textContent = detail.hidden ? "Why this value?" : "Hide details";
    });
    row.appendChild(why);
    row.appendChild(detail);
    return row;
  }
  /* Grouped rows, 4–8 per group; big subgroups are progressively disclosed. */
  function settingGroups(mount, sids, opts) {
    opts = opts || {};
    var CHUNK = 8, FIRST = 40;
    var expanded = opts.expanded || sids.length <= FIRST;
    var shown = expanded ? sids : sids.slice(0, FIRST);
    var i, g, gi = 0;
    for (i = 0; i < shown.length; i += CHUNK) {
      var slice = shown.slice(i, i + CHUNK);
      g = el("div", "dt2-group");
      if (shown.length > CHUNK) {
        g.appendChild(el("h3", "dt2-group-h", (opts.title || "Settings") + " — " + (i + 1) + "–" + (i + slice.length)));
      } else if (opts.title) {
        g.appendChild(el("h3", "dt2-group-h", opts.title));
      }
      if (gi === 0 && opts.desc) g.appendChild(el("p", "dt2-group-d", opts.desc));
      slice.forEach(function (sid) {
        var r = settingRow(sid);
        if (r) g.appendChild(r);
      });
      mount.appendChild(g);
      gi += 1;
    }
    if (!expanded) {
      var more = el("button", "pm-btn", "Show all " + sids.length + " settings");
      more.type = "button";
      more.setAttribute("data-variant", "quiet");
      more.addEventListener("click", function () {
        sectionExpanded[opts.key] = true;
        rerender();
      });
      mount.appendChild(more);
      currentRevealAll = function () {
        sectionExpanded[opts.key] = true;
        rerender();
      };
    }
  }

  /* ---------------- Home (editorial, list-led) ------------------------------- */
  function renderHome(mount) {
    var project = store.currentProject();
    var stag = el("div", "dt2-stagger");
    mount.appendChild(stag);

    stag.appendChild(el("p", "dt2-kicker", "Settings"));
    stag.appendChild(el("h1", "dt2-title", "Set up " + project.name + " the way you work"));
    stag.appendChild(el("p", "dt2-lede",
      "Every control below applies to this project only. Browse the directory, or search across " +
      INV.meta.settingsCount + " settings, " + REG.MANAGERS.length + " managers, objects, and workflows."));
    var proj = el("div", "dt2-project");
    proj.appendChild(el("span", null, "Current project"));
    proj.appendChild(el("strong", null, project.name));
    proj.appendChild(el("span", null, project.path + " · updated " + project.updated));
    stag.appendChild(proj);

    var homeSearchMount = el("div", "dt2-home-search");
    els.homeSearch = makeSearch(homeSearchMount, {
      placeholder: "Search settings, pages, objects, workflows…",
      inputId: "pmv2-search",
      resultsId: "pmv2-results",
      home: true
    });
    stag.appendChild(homeSearchMount);

    /* ≤1 critical banner: first attention notice, dismissible. */
    var notices = (CORE.notices || []).filter(function (n) {
      return !store.doc("dt2-dismissed." + n.id, false);
    });
    var critical = null;
    for (var i = 0; i < notices.length; i++) if (notices[i].kind === "attention") { critical = notices[i]; break; }
    if (critical) {
      stag.appendChild(noticeEl(critical, true));
    }
    /* Needs attention: 2–4 items, compact rows routing to their setting. */
    var attn = el("section", "dt2-attn");
    attn.appendChild(el("h2", null, "Needs attention"));
    var items = notices.filter(function (n) { return n !== critical; }).slice(0, 4);
    if (!items.length) {
      attn.appendChild(el("div", "dt2-attn-empty", "Nothing needs attention right now."));
    }
    items.forEach(function (n) {
      attn.appendChild(attnRow(n));
    });
    stag.appendChild(attn);

    /* The dominant composition: the 12-domain directory as large rows. */
    var dests = el("section", "dt2-dests");
    dests.appendChild(el("h2", "dt2-h", "The directory"));
    INV.categories.forEach(function (c) {
      var row = el("button", "dt2-dest-row");
      row.type = "button";
      row.setAttribute("data-domain-id", c.id);
      var ic = el("span", "dt2-dest-icon");
      ic.appendChild(svgEl(c.icon));
      row.appendChild(ic);
      var mid = el("span");
      mid.appendChild(el("span", "dt2-dest-name", c.title));
      mid.appendChild(el("span", "dt2-dest-desc", (REG.domainById(c.id) || {}).blurb || c.description || ""));
      row.appendChild(mid);
      var meta = el("span", "dt2-dest-meta");
      var mgrCount = REG.managersByDomain(c.id).length + (c.id === "system" ? REG.DEFERRED_OWNERS.length : 0);
      meta.appendChild(el("span", null, domainSettingCount(c.id) + " settings"));
      meta.appendChild(badge(null, null, null, mgrCount + (mgrCount === 1 ? " manager" : " managers")));
      meta.appendChild(caretEl());
      row.appendChild(meta);
      row.addEventListener("click", function () {
        nav = [homeLoc(), { name: "domain", domain: c.id }];
        render("deeper");
        closeRailOnNarrow();
      });
      dests.appendChild(row);
    });
    stag.appendChild(dests);

    /* Secondary utilities — smaller, quieter. */
    var utils = el("div", "dt2-utils");
    utils.appendChild(utilRow("index", "All Settings index", "The complete searchable long tail — all " + INV.meta.settingsCount + " settings, faceted.", function () {
      nav = [homeLoc(), { name: "all" }];
      render("deeper");
    }));
    utils.appendChild(utilRow("copy", "Copy settings from another project", "A one-time, verified copy with a restore point and a receipt. Nothing stays linked.", function () {
      openCopy();
    }));
    var recents = (CORE.recents || []).slice(0, 4);
    if (recents.length) {
      utils.appendChild(el("h2", "dt2-h", "Recently touched"));
      var chips = el("div", "dt2-recents");
      recents.forEach(function (r) {
        var chip = el("button", "pm-badge", r.label);
        chip.type = "button";
        chip.addEventListener("click", function () { routeTarget(r.target); });
        chips.appendChild(chip);
      });
      utils.appendChild(chips);
    }
    stag.appendChild(utils);
  }
  function utilRow(iconName, label, sub, fn) {
    var b = el("button", "dt2-util-row");
    b.type = "button";
    b.appendChild(svgEl(iconName));
    var mid = el("span");
    mid.appendChild(el("span", null, label));
    mid.appendChild(el("span", "dt2-attn-sub", " " + sub));
    b.appendChild(mid);
    b.appendChild(caretEl());
    b.addEventListener("click", fn);
    return b;
  }
  function routeTarget(t) {
    if (!t) return;
    if (t.tab && t.manager) {
      var m = REG.managerById(t.manager);
      if (m) {
        nav = [homeLoc(), { name: "domain", domain: m.domain }, {
          name: "manager", domain: m.domain, manager: m.id, page: slugify(t.tab), object: null, section: null
        }];
        render("deeper");
        return;
      }
    }
    navigateTo({
      domain: t.category || null,
      page: t.sub || null,
      section: t.sub || null,
      row: t.setting || null,
      manager: t.manager || null
    });
  }
  function attnRow(n) {
    var b = el("button", "dt2-attn-row");
    b.type = "button";
    var dot = el("span", "dt2-attn-dot");
    dot.setAttribute("data-kind", n.kind);
    b.appendChild(dot);
    b.appendChild(el("span", "dt2-attn-label", n.headline));
    b.appendChild(el("span", "dt2-attn-sub", n.actionLabel || ""));
    b.appendChild(caretEl());
    b.addEventListener("click", function () { routeTarget(n.target); });
    return b;
  }
  function noticeEl(n, banner) {
    var box = el("div", "pm-notice" + (banner ? " dt2-banner" : ""));
    box.setAttribute("data-kind", n.kind);
    box.setAttribute("role", "status");
    box.appendChild(el("span", "pm-notice-chip", humanize(n.kind)));
    box.appendChild(el("span", "pm-notice-head", n.headline));
    box.appendChild(el("span", "pm-notice-body", n.consequence || ""));
    var actions = el("span", "pm-notice-actions");
    if (n.actionLabel) {
      var act = el("button", "pm-btn", n.actionLabel);
      act.type = "button";
      act.setAttribute("data-variant", "quiet");
      act.addEventListener("click", function () { routeTarget(n.target); });
      actions.appendChild(act);
    }
    var dismiss = el("button", "pm-btn", n.secondaryLabel || "Dismiss");
    dismiss.type = "button";
    dismiss.setAttribute("data-variant", "quiet");
    dismiss.addEventListener("click", function () { store.setDoc("dt2-dismissed." + n.id, true); });
    actions.appendChild(dismiss);
    box.appendChild(actions);
    return box;
  }

  /* ---------------- domain page ---------------------------------------------- */
  function domainMenuItems(domainId) {
    return [
      {
        label: "Open in All Settings index",
        action: function () {
          compState.domain = domainId;
          nav = [homeLoc(), { name: "all" }];
          render("deeper");
        }
      },
      { label: "Copy settings from another project…", action: function () { openCopy(); } },
      { sep: true },
      { label: "Close Settings", action: closeSettings }
    ];
  }
  function renderDomain(mount, loc) {
    var d = REG.domainById(loc.domain);
    var cat = CATS[loc.domain];
    mount.setAttribute("data-domain-id", loc.domain);
    mount.appendChild(backBtn("Home"));
    pageHead(mount, d ? d.title : catTitle(loc.domain), d ? d.blurb : "", [
      badge(null, null, null, domainSettingCount(loc.domain) + " settings"),
      badge(null, null, null, REG.managersByDomain(loc.domain).length + " managers")
    ], domainMenuItems(loc.domain));
    var strip = stripEl(loc.domain);
    if (strip) mount.appendChild(strip);

    var managers = REG.managersByDomain(loc.domain);
    if (managers.length) {
      var sect = el("section", "dt2-dests");
      sect.appendChild(el("h2", "dt2-h", "Pages"));
      managers.forEach(function (m) {
        var row = el("button", "dt2-dest-row");
        row.type = "button";
        row.setAttribute("data-manager-id", m.id);
        var ic = el("span", "dt2-dest-icon");
        ic.appendChild(svgEl(m.icon));
        row.appendChild(ic);
        var mid = el("span");
        mid.appendChild(el("span", "dt2-dest-name", m.title));
        mid.appendChild(el("span", "dt2-dest-desc", m.summary));
        row.appendChild(mid);
        var meta = el("span", "dt2-dest-meta");
        meta.appendChild(badge(null, null, null, humanize(m.archetype)));
        meta.appendChild(caretEl());
        row.appendChild(meta);
        row.addEventListener("click", function () {
          go({ name: "manager", domain: m.domain, manager: m.id, page: null, object: null, section: null });
        });
        sect.appendChild(row);
      });
      mount.appendChild(sect);
    }

    if (cat && cat.subgroups.length) {
      var subs = el("section", "dt2-dests");
      subs.appendChild(el("h2", "dt2-h", "Browse settings"));
      cat.subgroups.forEach(function (sub) {
        var row = el("button", "dt2-dest-row");
        row.type = "button";
        row.setAttribute("data-section-id", sub.id);
        var ic = el("span", "dt2-dest-icon");
        ic.appendChild(svgEl("index"));
        row.appendChild(ic);
        var mid = el("span");
        mid.appendChild(el("span", "dt2-dest-name", sub.title));
        mid.appendChild(el("span", "dt2-dest-desc", sub.description || ""));
        row.appendChild(mid);
        var meta = el("span", "dt2-dest-meta");
        meta.appendChild(el("span", null, sub.settings.length + " settings"));
        meta.appendChild(caretEl());
        row.appendChild(meta);
        row.addEventListener("click", function () {
          go({ name: "section", domain: loc.domain, section: sub.id, row: null });
        });
        subs.appendChild(row);
      });
      mount.appendChild(subs);
    }

    if (loc.domain === "system") {
      var own = el("section", "dt2-dests");
      own.appendChild(el("h2", "dt2-h", "Owned elsewhere — insertion points"));
      REG.DEFERRED_OWNERS.forEach(function (o) {
        var row = el("button", "dt2-dest-row");
        row.type = "button";
        row.setAttribute("data-manager-id", "owner-" + o.id);
        var ic = el("span", "dt2-dest-icon");
        ic.appendChild(svgEl("plug"));
        row.appendChild(ic);
        var mid = el("span");
        mid.appendChild(el("span", "dt2-dest-name", o.family));
        mid.appendChild(el("span", "dt2-dest-desc", o.insertion + ". Owned by the " + o.owner + "."));
        row.appendChild(mid);
        var meta = el("span", "dt2-dest-meta");
        meta.appendChild(badge(null, null, null, "Deferred"));
        meta.appendChild(caretEl());
        row.appendChild(meta);
        row.addEventListener("click", function () {
          go({ name: "owner", ownerId: o.id });
        });
        own.appendChild(row);
      });
      mount.appendChild(own);
    }
  }

  /* ---------------- section (subgroup) page ----------------------------------- */
  function renderSection(mount, loc) {
    var sub = subgroupOf(loc.domain, loc.section);
    mount.setAttribute("data-section-id", loc.section);
    mount.setAttribute("data-domain-id", loc.domain);
    mount.appendChild(backBtn(catTitle(loc.domain)));
    pageHead(mount, sub ? sub.title : humanize(loc.section), sub ? sub.description : "", [
      badge(null, null, null, (sub ? sub.settings.length : 0) + " settings"),
      badge(null, null, null, catTitle(loc.domain))
    ], domainMenuItems(loc.domain));
    var strip = stripEl(loc.domain + "." + loc.section);
    if (strip) mount.appendChild(strip);
    if (!sub) {
      mount.appendChild(el("div", "dt2-attn-empty", "This section is not part of the inventory projection."));
      return;
    }
    settingGroups(mount, sub.settings.slice(), {
      title: sub.title,
      desc: sub.description,
      key: loc.domain + "/" + loc.section,
      expanded: !!sectionExpanded[loc.domain + "/" + loc.section]
    });
  }

  /* ---------------- manager pages (lazy: rendered only on first open) --------- */
  function renderManager(mount, loc) {
    var m = REG.managerById(loc.manager);
    if (!m) {
      mount.appendChild(backBtn(catTitle(loc.domain || "system")));
      mount.appendChild(el("div", "dt2-attn-empty", "Unknown manager."));
      return;
    }
    mount.setAttribute("data-manager-id", m.id);
    mount.setAttribute("data-domain-id", m.domain);
    mount.appendChild(backBtn(catTitle(m.domain)));
    var menuItems = [
      { label: "Open this domain in All Settings", action: function () {
          compState.domain = m.domain;
          nav = [homeLoc(), { name: "all" }];
          render("deeper");
        } }
    ];
    if (m.archetype === "preference-document") {
      menuItems.push({ label: "Reset this domain's overrides", danger: true, action: function () { resetDomainOverrides(m.domain); } });
    }
    menuItems.push({ label: "Copy settings from another project…", action: function () { openCopy(); } });
    menuItems.push({ sep: true });
    menuItems.push({ label: "Close Settings", action: closeSettings });
    pageHead(mount, m.title, m.summary, [
      badge(null, null, null, m.family),
      badge(null, null, null, humanize(m.archetype))
    ], menuItems);
    var strip = stripEl(m.id);
    if (strip) mount.appendChild(strip);

    if (loc.section === "help") {
      var helpPanel = el("div", "dt2-owner-note");
      helpPanel.appendChild(el("strong", null, "About " + m.title + ". "));
      helpPanel.appendChild(document.createTextNode(
        "This is the manager's help destination: search lands here for intentional help results. " + m.summary));
      mount.appendChild(helpPanel);
    }

    switch (m.archetype) {
      case "preference-document": renderPrefDoc(mount, m, loc); break;
      case "resource-roster": renderRoster(mount, m, loc); break;
      case "inventory-catalog": renderCatalog(mount, m, loc); break;
      case "setup-sequence": renderStepper(mount, m, m.subpages || []); break;
      case "health-projection": renderHealth(mount, m, loc); break;
      case "diagnostic-drawer": renderLogs(mount, logLines(m)); break;
      case "transaction": renderTransaction(mount, m, loc); break;
      default: renderPrefDoc(mount, m, loc);
    }
  }
  function resetDomainOverrides(domain) {
    var o = store.overrides();
    var ids = Object.keys(o).filter(function (id) {
      return INV.settings[id] && INV.settings[id].domain === domain;
    });
    if (!ids.length) return;
    suppress = true;
    ids.forEach(function (id) { store.resetValue(id); });
    suppress = false;
    rerender();
  }
  function subtabs(pages, activeSlug, onPick) {
    var tabs = el("div", "dt2-subtabs");
    tabs.setAttribute("role", "tablist");
    pages.forEach(function (p) {
      var b = el("button", "dt2-subtab", p.title);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", p.slug === activeSlug ? "true" : "false");
      b.setAttribute("data-section-id", p.slug);
      b.addEventListener("click", function () { onPick(p.slug); });
      tabs.appendChild(b);
    });
    return tabs;
  }
  /* preference-document: grouped rows from the inventory, bound to the store. */
  function renderPrefDoc(mount, m, loc) {
    var pages = managerGroups(m);
    if (!pages.length) {
      mount.appendChild(el("div", "dt2-attn-empty", "No settings project into this manager for the current project."));
      return;
    }
    var active = loc.page && pages.some(function (p) { return p.slug === loc.page; }) ? loc.page : pages[0].slug;
    mount.appendChild(subtabs(pages, active, function (slug) {
      loc.page = slug;
      rerender();
    }));
    var page = null;
    pages.forEach(function (p) { if (p.slug === active) page = p; });
    page.subs.forEach(function (sub) {
      var g = el("div", "dt2-group");
      g.setAttribute("data-section-id", sub.id);
      g.appendChild(el("h3", "dt2-group-h", sub.title));
      if (sub.description) g.appendChild(el("p", "dt2-group-d", sub.description));
      sub.settings.slice(0, 8).forEach(function (sid) {
        var r = settingRow(sid);
        if (r) g.appendChild(r);
      });
      if (sub.settings.length > 8) {
        var more = el("button", "dt2-row-why", "View all " + sub.settings.length + " settings in " + sub.title + " →");
        more.type = "button";
        more.addEventListener("click", function () {
          go({ name: "section", domain: m.domain, section: sub.id, row: null });
        });
        g.appendChild(more);
      }
      mount.appendChild(g);
    });
  }

  /* resource-roster: object list + restrained detail sheet with subpages. */
  function renderRoster(mount, m, loc) {
    var items = (ROSTERS[m.objectSource] || []).slice();
    if (!items.length) {
      mount.appendChild(el("div", "dt2-attn-empty", "Nothing here yet for the current project."));
      return;
    }
    function openObj(o) {
      loc.object = o.id;
      rerender();
    }
    if (items.length > 60) {
      renderVList(mount, items, 48, function (o) {
        return vrowFor(o, openObj);
      });
    } else {
      var list = el("div", "dt2-roster");
      items.forEach(function (o) {
        var row = el("button", "dt2-roster-row");
        row.type = "button";
        row.setAttribute("data-object-id", o.id);
        if (loc.object === o.id) row.setAttribute("aria-current", "true");
        var nameWrap = el("span");
        nameWrap.appendChild(el("span", "dt2-roster-name", o.label));
        row.appendChild(nameWrap);
        row.appendChild(el("span", "dt2-roster-sub", o.typeLabel));
        var note = o.availability || (o.health ? humanize(o.health) : "");
        row.appendChild(el("span", "dt2-roster-note", note));
        row.appendChild(caretEl());
        row.addEventListener("click", function () { openObj(o); });
        list.appendChild(row);
      });
      mount.appendChild(list);
    }
    if (loc.object) {
      var obj = null;
      items.forEach(function (o) { if (o.id === loc.object) obj = o; });
      if (obj) renderSheet(mount, m, obj, loc);
    }
  }
  function vrowFor(o, onOpen) {
    var row = el("button", "dt2-vrow");
    row.type = "button";
    row.setAttribute("data-object-id", o.id);
    row.appendChild(el("span", "dt2-vrow-name", o.label));
    row.appendChild(el("span", "dt2-vrow-sub", o.typeLabel + (o.health ? " · " + humanize(o.health) : "")));
    row.appendChild(el("span", "dt2-vrow-tag", o.availability || ""));
    row.addEventListener("click", function () { onOpen(o); });
    return row;
  }
  function renderSheet(mount, m, obj, loc) {
    var sheet = el("section", "dt2-sheet");
    sheet.setAttribute("data-object-id", obj.id);
    var head = el("div", "dt2-sheet-head");
    var titleWrap = el("div");
    titleWrap.appendChild(el("h2", "dt2-title", obj.label));
    titleWrap.appendChild(el("div", "dt2-roster-sub", obj.typeLabel + " — " + m.title));
    head.appendChild(titleWrap);
    var close = el("button", "pm-btn dt2-sheet-close", "Close");
    close.type = "button";
    close.setAttribute("data-variant", "quiet");
    close.addEventListener("click", function () {
      loc.object = null;
      rerender();
    });
    head.appendChild(close);
    sheet.appendChild(head);

    var pages = (m.subpages || []).map(function (t) { return { slug: slugify(t), title: t }; });
    if (!pages.length) pages = [{ slug: "overview", title: "Overview" }];
    var hint = loc.page || (loc.section && pages.some(function (p) { return p.slug === loc.section; }) ? loc.section : null);
    var active = hint && pages.some(function (p) { return p.slug === hint; }) ? hint : pages[0].slug;
    sheet.appendChild(subtabs(pages, active, function (slug) {
      loc.page = slug;
      rerender();
    }));
    var body = el("div", "dt2-sheet-body");
    if (m.id === "providers") renderProviderSheet(body, obj, active);
    else renderGenericSheet(body, m, obj, active);
    sheet.appendChild(body);
    mount.appendChild(sheet);
  }
  function facts(pairs) {
    var dl = el("dl", "dt2-facts");
    pairs.forEach(function (p) {
      if (p[1] == null || p[1] === "") return;
      dl.appendChild(el("dt", null, p[0]));
      dl.appendChild(el("dd", null, String(p[1])));
    });
    return dl;
  }
  function renderGenericSheet(body, m, obj, active) {
    var pages = managerGroups(m);
    var page = null;
    pages.forEach(function (p) { if (p.slug === active) page = p; });
    if (!page || !page.subs.length) {
      body.appendChild(facts([
        ["Type", obj.typeLabel],
        ["Health", obj.health ? humanize(obj.health) : null],
        ["Availability", obj.availability || null],
        ["Manager", obj.managerTitle || m.title]
      ]));
      body.appendChild(el("p", "dt2-row-desc", "No project settings project into this subpage in the demo."));
      return;
    }
    var count = 0;
    page.subs.forEach(function (sub) {
      sub.settings.slice(0, 4).forEach(function (sid) {
        if (count >= 6) return;
        var r = settingRow(sid);
        if (r) { body.appendChild(r); count += 1; }
      });
    });
    if (!count) {
      body.appendChild(facts([
        ["Type", obj.typeLabel],
        ["Health", obj.health ? humanize(obj.health) : null],
        ["Availability", obj.availability || null]
      ]));
    }
  }
  /* Providers detail: accounts, models, masked credentials, installation with
     explicit official-source setup, repair/update states, logs. No bundling. */
  function renderProviderSheet(body, obj, active) {
    var p = providerFixture(obj.id) || {};
    var installState = p.installState || "not-applicable";
    if (active === "overview") {
      body.appendChild(facts([
        ["Plan", p.product && p.product.plan],
        ["Billing route", p.product && p.product.billingRoute],
        ["Sign-in model", humanize(p.authModel || "none")],
        ["Install state", humanize(installState)],
        ["Routing priority", p.routing && p.routing.priority != null ? "Priority " + p.routing.priority : null],
        ["Accounts", (p.accounts || []).length],
        ["Models", (p.models || []).length]
      ]));
      if (p.authNote) body.appendChild(el("p", "dt2-row-desc", p.authNote));
      if (p.accountSwitchNote) body.appendChild(el("p", "dt2-row-desc", p.accountSwitchNote));
      if (p.groupingNote) body.appendChild(el("p", "dt2-row-desc", p.groupingNote));
    } else if (active === "models") {
      var models = p.models || [];
      if (!models.length) {
        body.appendChild(el("div", "dt2-attn-empty", installState === "not-installed"
          ? "Models appear after the provider is installed and signed in."
          : "This provider reports no model catalog in the demo."));
      }
      models.slice(0, 12).forEach(function (md) {
        var row = el("div", "dt2-row");
        row.appendChild(el("div", "dt2-row-label", md.label || md.name || md.id || "Model"));
        row.appendChild(el("div", "dt2-row-desc", md.desc || md.note || ""));
        var ctl = el("div", "dt2-row-control");
        if (md.context || md.contextWindow) ctl.appendChild(badge(null, null, null, String(md.context || md.contextWindow)));
        row.appendChild(ctl);
        body.appendChild(row);
      });
    } else if (active === "credentials") {
      body.appendChild(el("div", "dt2-copy-note", "Credential references are shown, never raw secrets. " +
        (p.authModel === "cli-profile-oauth"
          ? "Sign-in is owned by the provider's CLI inside an isolated profile; Puppet Master never sees your credentials."
          : "Secrets live in the Puppet Master credential vault and are never rendered.")));
      var accounts = p.accounts || [];
      if (!accounts.length) body.appendChild(el("div", "dt2-attn-empty", "No accounts are connected yet."));
      accounts.forEach(function (a) {
        var row = el("div", "dt2-row");
        row.appendChild(el("div", "dt2-row-label", a.label || a.id || "Account"));
        row.appendChild(el("div", "dt2-row-desc",
          (a.identity || "Unknown identity") + " — " + (a.authSource || "unknown source")));
        var ctl = el("div", "dt2-row-control");
        ctl.appendChild(badge(null, null, null, "Reference only"));
        row.appendChild(ctl);
        body.appendChild(row);
      });
    } else if (active === "rate-limits") {
      body.appendChild(facts([
        ["When limits are reached", p.routing ? (p.routing.continuation || "Ask before switching") : null],
        ["Fall through to next account", p.routing ? (p.routing.useNextOnExhaust ? "Yes" : "No") : null],
        ["Routing priority", p.routing && p.routing.priority != null ? "Priority " + p.routing.priority : null]
      ]));
      body.appendChild(el("p", "dt2-row-desc", "Rate-limit behavior is a routing preference; the provider owns the actual limits."));
    } else if (active === "usage") {
      var strip = stripEl("providers.usage");
      if (strip) body.appendChild(strip);
      body.appendChild(el("p", "dt2-row-desc",
        "Usage appears here when the provider reports it. Puppet Master never estimates spend."));
    } else if (active === "installation") {
      var installs = p.installations || [];
      if (installState === "not-installed" || !installs.length) {
        var call = el("div", "dt2-install");
        call.appendChild(el("h4", null, "Install from the official source"));
        call.appendChild(el("p", null,
          "Puppet Master never bundles or pre-seeds provider tooling. Install the official " +
          obj.label + " command-line tool yourself, then return here — Puppet Master detects it and offers sign-in."));
        call.appendChild(el("code", null, "See the official " + obj.label + " installation instructions"));
        var actions = el("div", "dt2-actions");
        var setup = el("button", "pm-btn", "Set up " + obj.label);
        setup.type = "button";
        setup.setAttribute("data-variant", "primary");
        setup.addEventListener("click", function () {
          runPanelOp(call, {
            kind: "provider-setup",
            title: "Set up " + obj.label,
            phases: ["Check for the official CLI", "Open the provider's own sign-in", "Verify connection"]
          }, function () { /* truthful demo op; nothing is installed for the user */ });
        });
        actions.appendChild(setup);
        var recheck = el("button", "pm-btn", "Re-check for an installation");
        recheck.type = "button";
        recheck.addEventListener("click", function () {
          runPanelOp(call, {
            kind: "provider-detect",
            title: "Re-check for " + obj.label,
            phases: ["Scan known install locations", "Report what was found"]
          }, null);
        });
        actions.appendChild(recheck);
        call.appendChild(actions);
        body.appendChild(call);
      }
      installs.forEach(function (inst) {
        var row = el("div", "dt2-row");
        row.appendChild(el("div", "dt2-row-label", inst.label || inst.id || "Installation"));
        row.appendChild(el("div", "dt2-row-desc",
          (inst.methodLabel || humanize(inst.method || "unknown")) +
          (inst.executable ? " — " + inst.executable : "") +
          (inst.version ? " — version " + inst.version : "")));
        var ctl = el("div", "dt2-row-control");
        if (inst.updateAvailable) ctl.appendChild(badge("state", "state", "effective-differs", "Update available"));
        else ctl.appendChild(badge("state", "state", "default", "Detected"));
        var repair = el("button", "dt2-reset", "Repair");
        repair.type = "button";
        repair.addEventListener("click", function () {
          runPanelOp(body, {
            kind: "provider-repair",
            title: "Repair " + (inst.label || "installation"),
            phases: ["Verify the executable", "Re-link the installation", "Re-check sign-in"]
          }, null);
        });
        ctl.appendChild(repair);
        row.appendChild(ctl);
        body.appendChild(row);
      });
    } else if (active === "logs") {
      renderLogs(body, [
        "2026-08-18T09:41:02Z [info] providers: fixture roster loaded (17 providers)",
        "2026-08-18T09:41:02Z [info] " + obj.id + ": state " + installState,
        "2026-08-18T09:41:03Z [info] " + obj.id + ": accounts " + (p.accounts || []).length + ", models " + (p.models || []).length,
        "2026-08-18T09:41:03Z [info] " + obj.id + ": no credential material read — references only"
      ]);
    } else {
      body.appendChild(facts([
        ["Type", obj.typeLabel],
        ["Health", obj.health ? humanize(obj.health) : null],
        ["Availability", obj.availability || null]
      ]));
    }
  }
  function renderLogs(mount, lines) {
    var box = el("div", "dt2-logs pmv2-scroll");
    box.setAttribute("role", "log");
    lines.forEach(function (l) { box.appendChild(el("div", null, l)); });
    mount.appendChild(box);
  }
  function logLines(m) {
    var items = ROSTERS[m.objectSource] || [];
    var lines = [
      "2026-08-18T09:41:02Z [info] " + m.id + ": manager opened (" + humanize(m.archetype) + ")",
      "2026-08-18T09:41:02Z [info] " + m.id + ": " + items.length + " objects in roster",
      "2026-08-18T09:41:03Z [info] " + m.id + ": projection state " + store.projection(m.id).state
    ];
    items.slice(0, 8).forEach(function (o, i) {
      lines.push("2026-08-18T09:41:0" + (4 + i) + "Z [info] " + m.id + ": " + o.id + " — " + (o.health || "ready"));
    });
    return lines;
  }

  /* inventory-catalog: facet chips + windowed virtual list. */
  function renderCatalog(mount, m, loc) {
    var items = (ROSTERS[m.objectSource] || []).slice();
    var st = catalogState[m.id] || (catalogState[m.id] = { type: "", health: "" });
    var types = [], healths = [];
    items.forEach(function (o) {
      if (types.indexOf(o.typeLabel) < 0) types.push(o.typeLabel);
      var h = o.health || "";
      if (h && healths.indexOf(h) < 0) healths.push(h);
    });
    var facets = el("div", "dt2-facets");
    function facetGroup(label, values, currentVal, onPick) {
      var g = el("span", "dt2-facet-group");
      g.appendChild(el("span", null, label));
      var seg = el("div", "pm-seg");
      seg.setAttribute("role", "radiogroup");
      seg.setAttribute("aria-label", label);
      ["All"].concat(values).forEach(function (v) {
        var val = v === "All" ? "" : v;
        var b = el("button", null, v === "All" ? "All" : humanize(v));
        b.type = "button";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", currentVal === val ? "true" : "false");
        b.addEventListener("click", function () { onPick(val); });
        seg.appendChild(b);
      });
      g.appendChild(seg);
      return g;
    }
    facets.appendChild(facetGroup("Type", types, st.type, function (v) { st.type = v; rerender(); }));
    if (healths.length) facets.appendChild(facetGroup("Health", healths, st.health, function (v) { st.health = v; rerender(); }));
    mount.appendChild(facets);

    var filtered = items.filter(function (o) {
      if (st.type && o.typeLabel !== st.type) return false;
      if (st.health && (o.health || "") !== st.health) return false;
      return true;
    });
    mount.appendChild(el("div", "dt2-cat-count",
      filtered.length + " of " + items.length + " " + (m.objectSource ? humanize(m.objectSource) : "items")));
    if (!filtered.length) {
      mount.appendChild(el("div", "dt2-attn-empty", "No items match the selected facets."));
      return;
    }
    renderVList(mount, filtered, 46, function (o) {
      return vrowFor(o, function (obj) {
        loc.object = obj.id;
        rerender();
      });
    });
    if (loc.object) {
      var obj = null;
      items.forEach(function (o) { if (o.id === loc.object) obj = o; });
      if (obj) renderSheet(mount, m, obj, loc);
    }
  }
  /* Windowed virtual list (~viewport + overscan), fixed row height. */
  function renderVList(mount, items, rowH, rowFn) {
    var port = el("div", "dt2-vport pmv2-scroll");
    var list = el("div", "dt2-vlist");
    list.style.blockSize = (items.length * rowH) + "px";
    port.appendChild(list);
    mount.appendChild(port);
    var scheduled = false;
    function draw() {
      scheduled = false;
      var st = port.scrollTop;
      var h = port.clientHeight || 480;
      var start = Math.max(0, Math.floor(st / rowH) - 6);
      var end = Math.min(items.length, Math.ceil((st + h) / rowH) + 6);
      list.innerHTML = "";
      for (var i = start; i < end; i++) {
        var r = rowFn(items[i], i);
        r.style.position = "absolute";
        r.style.insetBlockStart = (i * rowH) + "px";
        r.style.blockSize = rowH + "px";
        list.appendChild(r);
      }
    }
    port.addEventListener("scroll", function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(draw);
    });
    draw();
  }

  /* setup-sequence: explicit stepper flow, state in a store document. */
  function renderStepper(mount, m, steps) {
    var docKey = "dt2-steps." + m.id;
    var st = store.doc(docKey, { step: 0, done: [] });
    if (!steps.length) steps = ["Prepare", "Apply", "Verify"];
    var bar = el("div", "dt2-steps");
    steps.forEach(function (name, i) {
      var s = el("div", "dt2-step", name);
      s.setAttribute("data-state", i < st.step ? "done" : (i === st.step ? "active" : ""));
      bar.appendChild(s);
    });
    mount.appendChild(bar);
    var panel = el("div", "dt2-op");
    panel.appendChild(el("div", "dt2-op-title", st.step < steps.length ? steps[st.step] : "Complete"));
    panel.appendChild(el("p", "dt2-row-desc",
      st.step >= steps.length
        ? "Every step is complete. Nothing else is pending."
        : "Step " + (st.step + 1) + " of " + steps.length + ". Work through the steps in order; each one is verified before the next begins."));
    var actions = el("div", "dt2-actions");
    if (st.step > 0 && st.step <= steps.length) {
      var prev = el("button", "pm-btn", "Previous step");
      prev.type = "button";
      prev.addEventListener("click", function () {
        st.step -= 1;
        store.setDoc(docKey, st);
      });
      actions.appendChild(prev);
    }
    if (st.step < steps.length) {
      var next = el("button", "pm-btn", st.step === steps.length - 1 ? "Finish" : "Continue");
      next.type = "button";
      next.setAttribute("data-variant", "primary");
      next.addEventListener("click", function () {
        st.step += 1;
        store.setDoc(docKey, st);
      });
      actions.appendChild(next);
    } else {
      var again = el("button", "pm-btn", "Start over");
      again.type = "button";
      again.addEventListener("click", function () {
        store.setDoc(docKey, { step: 0, done: [] });
      });
      actions.appendChild(again);
    }
    panel.appendChild(actions);
    mount.appendChild(panel);
  }

  /* health-projection: read-only status panels; Doctor also demonstrates the
     setup-sequence grammar (Repairs) and diagnostic-drawer grammar (Diagnostics). */
  function renderHealth(mount, m, loc) {
    var pages = (m.subpages || []).map(function (t) { return { slug: slugify(t), title: t }; });
    if (!pages.length) pages = [{ slug: "status", title: "Status" }];
    var active = loc.page && pages.some(function (p) { return p.slug === loc.page; }) ? loc.page : pages[0].slug;
    if (pages.length > 1) {
      mount.appendChild(subtabs(pages, active, function (slug) {
        loc.page = slug;
        rerender();
      }));
    }
    if (m.id === "doctor" && active === "repairs") {
      renderStepper(mount, { id: "doctor-repairs" }, ["Run checks", "Apply repairs", "Verify health"]);
      return;
    }
    if (m.id === "doctor" && active === "diagnostics") {
      renderLogs(mount, logLines(m).concat([
        "2026-08-18T09:42:10Z [info] doctor: 4 checks scheduled",
        "2026-08-18T09:42:11Z [info] doctor: nothing repaired this session"
      ]));
      return;
    }
    var panels = el("div", "dt2-panels");
    healthPanels(m).forEach(function (p) {
      var panel = el("div", "dt2-panel");
      var h = el("h3");
      h.appendChild(badge("state", "state", p.state, humanize(p.state)));
      h.appendChild(el("span", null, p.title));
      panel.appendChild(h);
      panel.appendChild(el("p", null, p.body));
      panels.appendChild(panel);
    });
    mount.appendChild(panels);
  }
  function healthPanels(m) {
    var proj = store.projection(m.id);
    var projState = proj.state === "ready" ? "default" : "managed";
    var provReady = (CORE.providers || []).filter(function (p) { return p.installState === "installed-signed-in"; }).length;
    if (m.id === "doctor") {
      return [
        { state: provReady ? "default" : "unavailable", title: "Provider connections",
          body: provReady + " of " + (CORE.providers || []).length + " providers are installed and signed in. Others are optional routes." },
        { state: "default", title: "Language servers",
          body: (ROSTERS.lspServers || []).length + " servers configured; degraded servers offer a repair from their detail sheet." },
        { state: projState, title: "Environment",
          body: proj.state === "ready" ? "Node, Git, and the workspace are reachable. No repair is pending." : (proj.message || humanize(proj.state)) }
      ];
    }
    if (m.id === "dry-method") {
      return [
        { state: "default", title: "Core surfaces",
          body: REG.CORE_FAMILIES.map(function (f) { return f.family; }).join(" · ") + "." },
        { state: "default", title: "Shared headless modules",
          body: "Inventory, registry, store, search, copy, and objects projections are shared read-only modules; this concept renders its own UI." },
        { state: "managed", title: "Ownership",
          body: REG.DEFERRED_OWNERS.length + " areas are owned by named owner modules and render as insertion-point shells only." }
      ];
    }
    if (m.id === "search-index") {
      return [
        { state: "default", title: "Index status",
          body: "The project search index is current. " + INV.meta.settingsCount + " settings and all manager destinations are searchable." },
        { state: projState, title: "Refresh",
          body: proj.state === "ready" ? "Refresh runs on file save and on demand. Nothing is queued." : (proj.message || humanize(proj.state)) },
        { state: "default", title: "Inclusions",
          body: "Source files, documentation, and settings metadata are included; build output and vendored dependencies are excluded." }
      ];
    }
    return [
      { state: projState, title: m.title,
        body: proj.state === "ready" ? "All checks pass for the current project." : (proj.message || humanize(proj.state)) }
    ];
  }

  /* transaction: preview -> confirm -> apply (ObservableWork) -> receipt, with
     rollback through restore points. Backup, Lifecycle, Cleanup. */
  function renderTransaction(mount, m, loc) {
    var pages = (m.subpages || []).map(function (t) { return { slug: slugify(t), title: t }; });
    var active = loc.page && pages.some(function (p) { return p.slug === loc.page; }) ? loc.page : (pages[0] ? pages[0].slug : null);
    if (pages.length > 1) {
      mount.appendChild(subtabs(pages, active, function (slug) {
        loc.page = slug;
        rerender();
      }));
    }
    if (m.id === "backup") renderBackup(mount, active);
    else if (m.id === "lifecycle") renderLifecycle(mount, active);
    else if (m.id === "cleanup") renderCleanup(mount, active);
    else renderBackup(mount, active);
  }
  function runPanelOp(mount, spec, onDone) {
    var op = store.begin({
      kind: spec.kind,
      title: spec.title,
      phases: spec.phases.map(function (n) { return { name: n }; }),
      determinate: !!spec.total,
      total: spec.total || 0,
      cancelable: spec.cancelable !== false
    });
    var panel = el("div", "dt2-op");
    panel.setAttribute("data-op-id", op.id);
    panel.appendChild(el("div", "dt2-op-title", spec.title));
    var phaseEls = spec.phases.map(function (n) {
      var p = el("div", "dt2-op-phase", n);
      panel.appendChild(p);
      return p;
    });
    var barWrap = el("div", "dt2-op-bar");
    var bar = el("span");
    bar.style.inlineSize = "0%";
    barWrap.appendChild(bar);
    panel.appendChild(barWrap);
    var actions = el("div", "dt2-actions");
    panel.appendChild(actions);
    mount.appendChild(panel);
    var idx = 0, stopped = false;
    var cancel = el("button", "pm-btn", "Cancel");
    cancel.type = "button";
    cancel.setAttribute("data-variant", "quiet");
    cancel.addEventListener("click", function () {
      stopped = true;
      store.finish(op.id, "canceled");
      draw();
    });
    if (spec.cancelable !== false) actions.appendChild(cancel);
    function draw() {
      phaseEls.forEach(function (p, i) {
        p.setAttribute("data-state", i < idx ? "done" : (i === idx && !stopped ? "active" : ""));
      });
      bar.style.inlineSize = Math.round((idx / spec.phases.length) * 100) + "%";
      if (stopped && !panel.querySelector(".dt2-op-note")) {
        var n = el("p", "dt2-row-desc dt2-op-note", "Canceled. Nothing was applied.");
        panel.appendChild(n);
      }
    }
    draw();
    function step() {
      if (stopped) return;
      if (spec.work) spec.work(idx, op);
      store.completePhase(op.id);
      if (op.determinate) store.advance(op.id, Math.max(1, Math.ceil(op.total / spec.phases.length)));
      idx += 1;
      draw();
      if (idx < spec.phases.length) {
        setTimeout(step, 200);
      } else {
        store.finish(op.id, "done");
        cancel.disabled = true;
        if (onDone) onDone(op);
      }
    }
    setTimeout(step, 220);
    return op;
  }
  function applySnapshot(snap) {
    suppress = true;
    var cur = store.overrides();
    Object.keys(cur).forEach(function (id) {
      if (!snap || !Object.prototype.hasOwnProperty.call(snap, id)) store.resetValue(id);
    });
    if (snap) {
      Object.keys(snap).forEach(function (id) {
        store.setValue(id, snap[id].value, { rollback: true });
      });
    }
    suppress = false;
    rerender();
  }
  function receiptEl(title, lines, actions) {
    var r = el("div", "dt2-receipt");
    r.appendChild(el("h3", null, title));
    (lines || []).forEach(function (l) { if (l) r.appendChild(el("p", null, l)); });
    if (actions && actions.length) {
      var row = el("div", "dt2-actions");
      actions.forEach(function (a) { row.appendChild(a); });
      r.appendChild(row);
    }
    return r;
  }
  function renderBackup(mount, active) {
    var pts = store.restorePoints();
    if (active === "restore-points") {
      if (!pts.length) {
        mount.appendChild(el("div", "dt2-attn-empty", "No restore points yet. Create a backup first."));
        return;
      }
      pts.slice().reverse().forEach(function (rp) {
        var rollback = el("button", "pm-btn", "Roll back to this point");
        rollback.type = "button";
        rollback.addEventListener("click", function () {
          applySnapshot(rp.snapshot || {});
          store.addReceipt({ kind: "backup-rollback", title: "Rolled back to " + rp.label, restorePointId: rp.id, verified: true });
        });
        mount.appendChild(receiptEl(rp.label, [
          "Created " + rp.at + " · " + Object.keys(rp.snapshot || {}).length + " overridden settings captured."
        ], [rollback]));
      });
      return;
    }
    if (active === "verify") {
      mount.appendChild(receiptEl("Verification", [
        "The most recent restore point was written by this concept and re-read for verification.",
        pts.length ? pts[pts.length - 1].label + " · verified." : "Nothing to verify yet."
      ]));
      return;
    }
    /* Backups: preview -> confirm -> apply -> receipt. */
    var overCount = Object.keys(store.overrides()).length;
    var createBtn = el("button", "pm-btn", "Create restore point");
    createBtn.type = "button";
    createBtn.setAttribute("data-variant", "primary");
    createBtn.addEventListener("click", function () {
      createBtn.disabled = true;
      var rp = null;
      runPanelOp(mount, {
        kind: "backup",
        title: "Create restore point",
        phases: ["Snapshot overrides", "Verify snapshot", "Write receipt"],
        work: function (i) {
          if (i === 0) rp = store.createRestorePoint("Manual backup", store.overrides());
          if (i === 2 && rp) store.addReceipt({ kind: "backup", title: "Backup created", restorePointId: rp.id, verified: true });
        }
      }, function () { createBtn.disabled = false; });
    });
    mount.appendChild(receiptEl("Create a backup", [
      "A restore point captures this project's " + overCount + " overridden setting" + (overCount === 1 ? "" : "s") +
      " so any later change can be rolled back atomically.",
      pts.length + " restore point" + (pts.length === 1 ? "" : "s") + " already exist."
    ], [createBtn]));
  }
  function renderLifecycle(mount, active) {
    var receipts = store.receipts();
    if (active === "export") {
      var over = store.overrides();
      mount.appendChild(el("p", "dt2-row-desc",
        "The exact override document for this project. Export is a read — nothing changes."));
      var box = el("div", "dt2-logs pmv2-scroll");
      box.appendChild(el("pre", null, JSON.stringify(over, null, 2)));
      mount.appendChild(box);
      var rec = el("button", "pm-btn", "Record an export receipt");
      rec.type = "button";
      rec.addEventListener("click", function () {
        store.addReceipt({ kind: "settings-export", title: "Exported " + Object.keys(over).length + " overrides", verified: true });
        rec.disabled = true;
        rec.textContent = "Receipt recorded";
      });
      mount.appendChild(rec);
      return;
    }
    if (active === "import") {
      mount.appendChild(receiptEl("Import", [
        "Drop a previously exported settings file onto the Puppet Master window to import it. This demo does not read files, so no import control is offered here.",
        "Import is a transaction in the real product: preview, restore point, atomic apply, verify, receipt."
      ]));
      return;
    }
    if (active === "reset") {
      var n = Object.keys(store.overrides()).length;
      var danger = el("button", "pm-btn", "Reset all " + n + " overrides");
      danger.type = "button";
      danger.setAttribute("data-variant", "danger");
      danger.disabled = !n;
      danger.addEventListener("click", function () {
        danger.disabled = true;
        var rp = store.createRestorePoint("Before reset", store.overrides());
        runPanelOp(mount, {
          kind: "settings-reset",
          title: "Reset this project's overrides",
          phases: ["Create restore point", "Clear overrides", "Verify", "Write receipt"],
          work: function (i) {
            if (i === 1) applySnapshot({});
            if (i === 3) store.addReceipt({ kind: "settings-reset", title: "Reset all overrides", restorePointId: rp.id, verified: true });
          }
        }, null);
      });
      mount.appendChild(receiptEl("Reset", [
        n + " setting" + (n === 1 ? "" : "s") + " currently differ from defaults. Reset creates a restore point first — nothing is unrecoverable."
      ], [danger]));
      return;
    }
    if (active === "migration") {
      mount.appendChild(receiptEl("Migration", [
        "No migration is pending for this project. Migrations run when the inventory schema changes; this project is already current."
      ]));
      return;
    }
    if (active === "rollback") {
      var pts = store.restorePoints();
      if (!pts.length) {
        mount.appendChild(el("div", "dt2-attn-empty", "No restore points to roll back to."));
      }
      pts.slice().reverse().forEach(function (rp) {
        var btn = el("button", "pm-btn", "Roll back");
        btn.type = "button";
        btn.addEventListener("click", function () {
          applySnapshot(rp.snapshot || {});
          store.addReceipt({ kind: "settings-rollback", title: "Rolled back to " + rp.label, restorePointId: rp.id, verified: true });
        });
        mount.appendChild(receiptEl(rp.label, ["Created " + rp.at], [btn]));
      });
      if (receipts.length) {
        mount.appendChild(el("h2", "dt2-h", "Receipts"));
        receipts.slice().reverse().slice(0, 8).forEach(function (r) {
          mount.appendChild(receiptEl(r.title || humanize(r.kind || "receipt"), [
            (r.at || "") + (r.verified ? " · verified" : "") + (r.rolledBack ? " · rolled back" : "")
          ]));
        });
      }
      return;
    }
    mount.appendChild(receiptEl("Settings lifecycle", [
      "Import, export, reset, migration, and rollback are one-time transactions. Pick a subpage above."
    ]));
  }
  function renderCleanup(mount, active) {
    if (active === "dry-run") {
      var artifacts = (ROSTERS.artifacts || []).length;
      var goBtn = el("button", "pm-btn", "Run a dry run");
      goBtn.type = "button";
      goBtn.setAttribute("data-variant", "primary");
      goBtn.addEventListener("click", function () {
        goBtn.disabled = true;
        runPanelOp(mount, {
          kind: "cleanup-dry-run",
          title: "Cleanup dry run",
          phases: ["Scan workspace outputs", "Match cleanup rules", "Report candidates"],
          work: function (i) {
            if (i === 2) store.addReceipt({
              kind: "cleanup-dry-run",
              title: "Dry run: " + artifacts + " artifacts reviewed, 0 deleted (dry run)",
              verified: true
            });
          }
        }, function () { goBtn.disabled = false; });
      });
      mount.appendChild(receiptEl("Dry run", [
        "A dry run never deletes anything. It reports what the rules would remove.",
        artifacts + " runtime artifacts are currently tracked."
      ], [goBtn]));
      return;
    }
    if (active === "schedule") {
      var cur = store.doc("dt2-cleanup-schedule", "manual");
      mount.appendChild(el("p", "dt2-row-desc", "Scheduled sweeps run the same rules as a dry run, then apply them with a restore point."));
      var wrap = el("div", "dt2-row");
      wrap.appendChild(el("div", "dt2-row-label", "Sweep schedule"));
      wrap.appendChild(el("div", "dt2-row-desc", "How often Puppet Master sweeps this project's outputs."));
      var ctl = el("div", "dt2-row-control");
      ctl.appendChild(segControl(["manual", "daily", "weekly"], cur, function (pick) {
        store.setDoc("dt2-cleanup-schedule", pick);
      }, "Sweep schedule"));
      wrap.appendChild(ctl);
      mount.appendChild(wrap);
      return;
    }
    /* Rules: real inventory rows from the system domain. */
    var cat = CATS.system;
    if (cat) {
      var shown = 0;
      cat.subgroups.forEach(function (sub) {
        if (shown >= 6) return;
        if (!/(storage|cleanup|history|artifact|retention)/.test((sub.id + " " + sub.title).toLowerCase())) return;
        var g = el("div", "dt2-group");
        g.appendChild(el("h3", "dt2-group-h", sub.title));
        sub.settings.slice(0, 3).forEach(function (sid) {
          if (shown >= 6) return;
          var r = settingRow(sid);
          if (r) { g.appendChild(r); shown += 1; }
        });
        if (g.childNodes.length > 1) mount.appendChild(g);
      });
      if (!shown) mount.appendChild(el("div", "dt2-attn-empty", "Cleanup rules project into Storage & Retention settings."));
    }
  }

  /* ---------------- deferred owner shell -------------------------------------- */
  function renderOwner(mount, loc) {
    var o = ownerById(loc.ownerId);
    mount.setAttribute("data-manager-id", "owner-" + loc.ownerId);
    mount.setAttribute("data-domain-id", "system");
    mount.appendChild(backBtn("System & Advanced"));
    pageHead(mount, o ? o.family : humanize(loc.ownerId),
      "A named owner module owns this area. Settings keeps a reachable insertion point and a truthful shell.",
      [badge(null, null, null, "Deferred — named owner")]);
    var note = el("div", "dt2-owner-note");
    if (o) {
      note.appendChild(facts([
        ["Owner", o.owner],
        ["Insertion destination", o.insertion],
        ["Returns to", o.returnContract]
      ]));
      note.appendChild(document.createTextNode(
        "This area is owned by the " + o.owner + "; the demo shows the insertion point only. " +
        "No backend state is fabricated here — when the owner module ships, it mounts at this destination and the flow returns to its named location."));
    }
    mount.appendChild(note);
  }

  /* ---------------- All Settings compendium ------------------------------------ */
  var allSettingsCache = null;
  function allSettings() {
    if (allSettingsCache) return allSettingsCache;
    var out = [];
    INV.categories.forEach(function (c) {
      c.subgroups.forEach(function (sub) {
        sub.settings.forEach(function (sid) {
          var s = INV.settings[sid];
          if (s) out.push({ id: sid, s: s, catTitle: c.title, subTitle: sub.title });
        });
      });
    });
    allSettingsCache = out;
    return out;
  }
  function renderAll(mount) {
    mount.appendChild(backBtn("Home"));
    pageHead(mount, "All Settings",
      "The complete long tail: every one of the " + INV.meta.settingsCount + " settings in this project, faceted and virtualized.",
      [badge(null, null, null, INV.meta.settingsCount + " settings")]);
    var strip = stripEl("all-settings");
    if (strip) mount.appendChild(strip);

    var types = [], exposures = [], states = [];
    allSettings().forEach(function (r) {
      if (types.indexOf(r.s.type) < 0) types.push(r.s.type);
      if (exposures.indexOf(r.s.exposure) < 0) exposures.push(r.s.exposure);
      var st = stateOf(r.id);
      if (states.indexOf(st) < 0) states.push(st);
    });
    var bar = el("div", "dt2-toolbar");
    var filter = el("input", "dt2-input");
    filter.type = "text";
    filter.placeholder = "Filter by name or description…";
    filter.setAttribute("aria-label", "Filter settings");
    filter.value = compState.q;
    filter.addEventListener("change", function () { compState.q = filter.value; rerender(); });
    filter.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { compState.q = filter.value; rerender(); }
    });
    bar.appendChild(filter);
    function facetSelect(label, values, cur, onPick) {
      var wrap = el("span", "pm-select");
      var sel = el("select");
      sel.setAttribute("aria-label", label);
      var all = el("option", null, label + ": All");
      all.value = "";
      sel.appendChild(all);
      values.forEach(function (v) {
        var o = el("option", null, humanize(v));
        o.value = v;
        sel.appendChild(o);
      });
      sel.value = cur;
      sel.addEventListener("change", function () { onPick(sel.value); rerender(); });
      wrap.appendChild(sel);
      return wrap;
    }
    bar.appendChild(facetSelect("Domain", INV.categories.map(function (c) { return c.id; }), compState.domain, function (v) { compState.domain = v; }));
    bar.appendChild(facetSelect("Exposure", exposures, compState.exposure, function (v) { compState.exposure = v; }));
    bar.appendChild(facetSelect("State", states, compState.state, function (v) { compState.state = v; }));
    bar.appendChild(facetSelect("Type", types, compState.type, function (v) { compState.type = v; }));
    mount.appendChild(bar);

    var q = compState.q.toLowerCase();
    var filtered = allSettings().filter(function (r) {
      if (compState.domain && r.s.domain !== compState.domain) return false;
      if (compState.exposure && r.s.exposure !== compState.exposure) return false;
      if (compState.type && r.s.type !== compState.type) return false;
      if (compState.state && stateOf(r.id) !== compState.state) return false;
      if (q && (r.s.label + " " + (r.s.desc || "") + " " + r.id).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    mount.appendChild(el("div", "dt2-cat-count", filtered.length + " of " + INV.meta.settingsCount + " settings"));
    if (!filtered.length) {
      mount.appendChild(el("div", "dt2-attn-empty", "No settings match these facets."));
      return;
    }
    renderVList(mount, filtered, 46, function (r) {
      var row = el("button", "dt2-vrow");
      row.type = "button";
      row.setAttribute("data-setting-id", r.id);
      row.setAttribute("data-domain-id", r.s.domain);
      row.appendChild(el("span", "dt2-vrow-name", r.s.label));
      row.appendChild(el("span", "dt2-vrow-sub", r.catTitle + " / " + r.subTitle));
      var st = stateOf(r.id);
      row.appendChild(el("span", "dt2-vrow-tag", st === "default" ? humanize(r.s.type) : humanize(st)));
      row.addEventListener("click", function () {
        pendingLocate = { domain: r.s.domain, section: r.s.subgroup, row: r.id };
        nav = [homeLoc(), { name: "domain", domain: r.s.domain },
          { name: "section", domain: r.s.domain, section: r.s.subgroup, row: r.id }];
        render("deeper");
        locatePending();
      });
      return row;
    });
  }

  /* ---------------- Copy Settings dialog (quiet, modal) ------------------------- */
  var copy = null; // {engine, wrap, lastOp}
  function openCopy() {
    if (copy) return;
    var engine = new window.PM_V2_COPY.CopyEngine(store, INV, REG);
    var wrap = el("div", "dt2-dialog-wrap");
    wrap.addEventListener("mousedown", function (e) {
      if (e.target === wrap && engine.state !== "applying") closeCopy();
    });
    copy = { engine: engine, wrap: wrap, lastOp: null };
    document.body.appendChild(wrap);
    renderCopy();
  }
  function closeCopy() {
    if (!copy) return;
    if (copy.wrap.parentNode) copy.wrap.parentNode.removeChild(copy.wrap);
    copy = null;
  }
  function renderCopy() {
    if (!copy) return;
    var engine = copy.engine;
    var wrap = copy.wrap;
    wrap.innerHTML = "";
    var dlg = el("div", "dt2-dialog");
    dlg.setAttribute("role", "dialog");
    dlg.setAttribute("aria-modal", "true");
    dlg.setAttribute("aria-label", "Copy settings from another project");
    wrap.appendChild(dlg);

    var STEPS = ["Source", "Categories", "Preview", "Confirm", "Apply", "Receipt"];
    var stateStep = { source: 0, categories: 1, preview: 2, confirm: 3, applying: 4, receipt: 5, failed: 5, "rolled-back": 5 };
    var head = el("div", "dt2-dialog-head");
    head.appendChild(el("h2", null, "Copy settings from another project"));
    head.appendChild(el("p", null,
      "A one-time transaction: preview, restore point, atomic apply, verify, receipt. Nothing stays linked — no sync, no inheritance."));
    dlg.appendChild(head);
    var steps = el("div", "dt2-steps");
    steps.style.padding = "12px 22px 0";
    var cur = stateStep[engine.state] != null ? stateStep[engine.state] : 0;
    STEPS.forEach(function (name, i) {
      var s = el("div", "dt2-step", name);
      s.setAttribute("data-state", i < cur ? "done" : (i === cur ? "active" : ""));
      steps.appendChild(s);
    });
    dlg.appendChild(steps);
    var body = el("div", "dt2-dialog-body pmv2-scroll");
    dlg.appendChild(body);
    var foot = el("div", "dt2-dialog-foot");
    dlg.appendChild(foot);

    function quietBtn(label, fn, variant) {
      var b = el("button", "pm-btn", label);
      b.type = "button";
      if (variant) b.setAttribute("data-variant", variant);
      b.addEventListener("click", fn);
      return b;
    }
    function errNote() {
      if (!engine.error) return null;
      return el("div", "dt2-copy-note", engine.error);
    }

    if (engine.state === "source") {
      body.appendChild(el("p", "dt2-row-desc", "Choose the project to copy from. Only its overrides are read."));
      engine.sources().forEach(function (p) {
        var row = el("label", "dt2-copy-cat");
        var input = el("input");
        input.type = "radio";
        input.name = "dt2-copy-source";
        input.checked = engine.sourceId === p.id;
        input.addEventListener("change", function () { engine.sourceId = p.id; renderCopy(); });
        row.appendChild(input);
        var mid = el("span");
        mid.appendChild(el("span", "dt2-copy-cat-name", p.name));
        mid.appendChild(el("span", "dt2-copy-cat-note", " " + p.path + " · " + p.settings + " settings · updated " + p.updated));
        row.appendChild(mid);
        row.appendChild(caretEl());
        body.appendChild(row);
      });
      var en = errNote(); if (en) body.appendChild(en);
      foot.appendChild(quietBtn("Cancel", closeCopy, "quiet"));
      foot.appendChild(quietBtn("Continue", function () {
        if (engine.sourceId) { engine.selectSource(engine.sourceId); renderCopy(); }
        else { engine.error = "Choose a source project to continue."; renderCopy(); }
      }, "primary"));
    } else if (engine.state === "categories") {
      body.appendChild(el("p", "dt2-row-desc", "Pick the broad categories to copy. Credentials are re-pointed, never raw secrets."));
      var picked = {};
      engine.categoryIds.forEach(function (id) { picked[id] = true; });
      REG.COPY_CATEGORIES.forEach(function (c) {
        var row = el("label", "dt2-copy-cat");
        var input = el("input");
        input.type = "checkbox";
        input.checked = !!picked[c.id];
        input.addEventListener("change", function () {
          if (input.checked) picked[c.id] = true; else delete picked[c.id];
          engine.categoryIds = Object.keys(picked);
        });
        row.appendChild(input);
        var mid = el("span");
        mid.appendChild(el("span", "dt2-copy-cat-name", c.title));
        mid.appendChild(el("span", "dt2-copy-cat-note", " " + c.note));
        row.appendChild(mid);
        body.appendChild(row);
      });
      var en2 = errNote(); if (en2) body.appendChild(en2);
      foot.appendChild(quietBtn("Back", function () { engine.reset(); renderCopy(); }, "quiet"));
      foot.appendChild(quietBtn("Build preview", function () {
        if (engine.setCategories(engine.categoryIds)) engine.buildPreview();
        renderCopy();
      }, "primary"));
    } else if (engine.state === "preview") {
      var pv = engine.preview;
      var totals = el("div", "dt2-copy-totals");
      [["add", "Add"], ["replace", "Replace"], ["unchanged", "Unchanged"], ["unavailable", "Unavailable"], ["conflict", "Conflicts"]].forEach(function (t) {
        totals.appendChild(badge(null, null, null, t[1] + " " + (pv.totals[t[0]] || 0)));
      });
      body.appendChild(totals);
      body.appendChild(el("div", "dt2-copy-note", pv.credentialPolicy));
      body.appendChild(el("div", "dt2-copy-note", pv.independence));
      if (pv.capped) body.appendChild(el("div", "dt2-copy-note", "Item drill-down is capped at " + pv.itemCap + " per group; the counts above are exact."));
      ["add", "replace", "conflict", "unavailable"].forEach(function (kind) {
        var items = pv.groups[kind] || [];
        if (!items.length) return;
        body.appendChild(el("h3", "dt2-copy-group-h", humanize(kind) + " (" + pv.totals[kind] + ")"));
        items.forEach(function (it) {
          var row = el("div", "dt2-copy-item");
          row.appendChild(el("span", "dt2-copy-item-name", it.label));
          row.appendChild(el("span", "dt2-copy-item-note", it.note || ""));
          body.appendChild(row);
        });
      });
      foot.appendChild(quietBtn("Back", function () { engine.state = "categories"; renderCopy(); }, "quiet"));
      foot.appendChild(quietBtn("Continue to confirmation", function () { engine.confirm(); renderCopy(); }, "primary"));
    } else if (engine.state === "confirm") {
      body.appendChild(el("div", "dt2-copy-note",
        "Apply " + (engine.preview.totals.add + engine.preview.totals.replace + engine.preview.totals.conflict) +
        " changes from " + engine.preview.sourceId + " to " + store.currentProject().name +
        "? A restore point is created first; verification runs after the atomic apply; a receipt is written. You can roll back afterwards."));
      foot.appendChild(quietBtn("Back", function () { engine.state = "preview"; renderCopy(); }, "quiet"));
      foot.appendChild(quietBtn("Confirm and apply", function () {
        copy.lastOp = engine.apply(); // confirm -> applying -> receipt|failed (synchronous, truthful phases)
        renderCopy();
      }, "primary"));
    } else if (engine.state === "applying") {
      var op = copy.lastOp;
      var panel = el("div", "dt2-op");
      panel.appendChild(el("div", "dt2-op-title", op ? op.title : "Applying…"));
      (op ? op.phases : []).forEach(function (p) {
        var row = el("div", "dt2-op-phase", p.name);
        row.setAttribute("data-state", p.status === "done" ? "done" : p.status);
        panel.appendChild(row);
      });
      var bw = el("div", "dt2-op-bar");
      var fill = el("span");
      fill.style.inlineSize = "100%";
      bw.appendChild(fill);
      panel.appendChild(bw);
      body.appendChild(panel);
      foot.appendChild(quietBtn("View receipt", renderCopy, "primary"));
    } else if (engine.state === "receipt") {
      var r = engine.receipt;
      body.appendChild(receiptEl(r ? r.title : "Copy complete", [
        r ? "Restore point " + r.restorePointId + " · verified." : "",
        r ? r.totals.add + " added, " + r.totals.replace + " replaced, " + r.totals.conflict + " conflicts resolved, " + r.totals.unavailable + " skipped." : "",
        "One-time copy. Source and destination are independent; no sync or inheritance was created."
      ]));
      foot.appendChild(quietBtn("Roll back", function () { engine.rollback(); renderCopy(); }, "quiet"));
      foot.appendChild(quietBtn("Done", closeCopy, "primary"));
    } else if (engine.state === "failed") {
      body.appendChild(el("div", "dt2-copy-note", engine.error || "The copy failed."));
      if (engine.restorePoint) {
        foot.appendChild(quietBtn("Roll back to the restore point", function () { engine.rollback(); renderCopy(); }, "primary"));
      }
      foot.appendChild(quietBtn("Close", closeCopy, "quiet"));
    } else if (engine.state === "rolled-back") {
      body.appendChild(receiptEl("Rolled back", [
        "The restore point snapshot was applied atomically. A rollback receipt was written."
      ]));
      foot.appendChild(quietBtn("Done", closeCopy, "primary"));
    }
    var focusable = dlg.querySelector("button, input, select");
    if (focusable) { try { focusable.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
  }

  /* ---------------- demo scenario drawer ---------------------------------------- */
  var demo = {};
  function buildDemo() {
    demo.drawer = document.getElementById("dt2-demo");
    demo.scrim = document.getElementById("dt2-scrim");
    demo.list = document.getElementById("dt2-demo-list");
    demo.openBtn = document.querySelector("[data-demo-open]");
    if (!demo.drawer || !demo.list) return;
    demo.list.classList.add("pmv2-scroll");
    function fill() {
      demo.list.innerHTML = "";
      var active = store.activeScenario();
      var normal = el("button", "dt2-demo-btn", "Normal state");
      normal.type = "button";
      normal.setAttribute("aria-pressed", active ? "false" : "true");
      normal.addEventListener("click", function () { store.setScenario("__none__"); });
      demo.list.appendChild(normal);
      store.scenarios().forEach(function (name) {
        var b = el("button", "dt2-demo-btn", humanize(name));
        b.type = "button";
        b.setAttribute("aria-pressed", active === name ? "true" : "false");
        b.addEventListener("click", function () { store.setScenario(name); });
        demo.list.appendChild(b);
      });
    }
    demo.fill = fill;
    demo.isOpen = false;
    demo.setOpen = function (open) {
      demo.isOpen = open;
      demo.drawer.hidden = !open;
      if (demo.scrim) demo.scrim.hidden = !open;
      if (demo.openBtn) demo.openBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) fill();
    };
    if (demo.openBtn) demo.openBtn.addEventListener("click", function () { demo.setOpen(!demo.isOpen); });
    if (demo.scrim) demo.scrim.addEventListener("click", function () { demo.setOpen(false); });
    fill();
  }

  /* ---------------- render dispatch ---------------------------------------------- */
  function render(dir) {
    currentRevealAll = null;
    renderRail();
    renderCrumb();
    var body = els.body;
    body.innerHTML = "";
    var view = el("div", "dt2-view");
    view.setAttribute("data-dir", dir || "deeper");
    var measure = el("div", "dt2-measure");
    view.appendChild(measure);
    body.appendChild(view);
    var loc = current();
    els.homeSearch = null;
    if (loc.name === "home") renderHome(measure);
    else if (loc.name === "domain") renderDomain(measure, loc);
    else if (loc.name === "section") renderSection(measure, loc);
    else if (loc.name === "manager") renderManager(measure, loc);
    else if (loc.name === "owner") renderOwner(measure, loc);
    else if (loc.name === "all") renderAll(measure);
    else renderHome(measure);
    if (dir !== "same") body.scrollTop = 0;
    syncHash();
  }
  function rerender() {
    var st = els.body.scrollTop;
    render("same");
    els.body.scrollTop = st;
  }

  /* ---------------- hash sync (deep links) ---------------------------------------- */
  var lastHash = null;
  function hashFor(loc) {
    if (loc.name === "home") return "#/";
    if (loc.name === "domain") return "#/" + loc.domain;
    if (loc.name === "section") return "#/" + loc.domain + "/s/" + loc.section;
    if (loc.name === "manager") return "#/" + loc.domain + "/" + loc.manager + (loc.page ? "/" + loc.page : "");
    if (loc.name === "owner") return "#/system/owner-" + loc.ownerId;
    if (loc.name === "all") return "#/all";
    return "#/";
  }
  function syncHash() {
    var h = hashFor(current());
    lastHash = h;
    if (window.location.hash !== h) {
      try { window.location.hash = h; } catch (e) { /* noop */ }
    }
  }
  function parseHash() {
    var h = window.location.hash || "#/";
    var parts = h.replace(/^#\/?/, "").split("/").filter(function (p) { return p !== ""; });
    var st = [homeLoc()];
    if (!parts.length) return st;
    if (parts[0] === "all") { st.push({ name: "all" }); return st; }
    var domain = CATS[parts[0]] ? parts[0] : null;
    if (!domain) return st;
    st.push({ name: "domain", domain: domain });
    if (parts[1] === "s" && parts[2] && subgroupOf(domain, parts[2])) {
      st.push({ name: "section", domain: domain, section: parts[2], row: null });
    } else if (parts[1] && parts[1].indexOf("owner-") === 0 && ownerById(parts[1].slice(6))) {
      st.push({ name: "owner", ownerId: parts[1].slice(6) });
    } else if (parts[1] && REG.managerById(parts[1])) {
      st.push({
        name: "manager", domain: domain, manager: parts[1],
        page: parts[2] || null, object: null, section: null
      });
    }
    return st;
  }
  window.addEventListener("hashchange", function () {
    if (window.location.hash === lastHash) return;
    nav = parseHash();
    render("back");
  });

  /* ---------------- global keys: Escape order -------------------------------------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (document.querySelector(".pm-menu")) return; // PMV2Menu owns its own Escape
    var anySearch = false;
    searches.forEach(function (s) { if (s.open) anySearch = true; });
    if (anySearch) { closeAllSearches(); return; }
    if (copy) { closeCopy(); return; }
    if (demo.isOpen) { demo.setOpen(false); return; }
    if (rootEl.getAttribute("data-rail-open") === "true") {
      rootEl.setAttribute("data-rail-open", "false");
      return;
    }
    var loc = current();
    if (loc && loc.object) { loc.object = null; rerender(); return; }
    if (nav.length > 1) back();
  });

  /* ---------------- store subscription: projections re-render truthfully ------------ */
  store.subscribe(function (evt) {
    if (suppress) return;
    if (evt.type === "scenario") {
      if (demo.fill) demo.fill();
      rerender();
    } else if (evt.type === "setting" || evt.type === "setting-reset" || evt.type === "doc" || evt.type === "receipt") {
      rerender();
    }
  });

  /* ---------------- boot ------------------------------------------------------------ */
  buildShell();
  buildDemo();
  nav = parseHash();
  render("deeper");
})();
