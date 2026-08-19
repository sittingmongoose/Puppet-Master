/* ============================================================================
   Concept 11 — Tabbed Organizer (kimi-k3)
   A top tab bar of the 12 setting domains. Every tab owns a persistent
   "sheet" with its own layer stack; selection and scroll survive tab
   switches because sheets are never detached, only cross-faded.
   Vanilla ES5-style IIFE. No frameworks.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- guards ------------------------------------------------------ */
  var root = document.getElementById("tbo-root");
  if (!root) { return; }
  if (!window.PM_V2_INVENTORY || !window.PM_V2_REGISTRY || !window.PM_V2_STORE ||
      !window.PM_V2_SEARCH || !window.PM_V2_OBJECTS || !window.PM_V2_COPY) {
    root.textContent = "Settings demo data failed to load.";
    return;
  }

  var INV = window.PM_V2_INVENTORY;
  var REG = window.PM_V2_REGISTRY;
  var OBJ = window.PM_V2_OBJECTS;
  var CORE = window.PM_CORE_DATA || {};
  var MENU = window.PMV2Menu || null;

  var store = window.PM_V2_STORE.for("concept-11-tabbed-organizer");
  var searchIndex = window.PM_V2_SEARCH.buildIndex({
    inventory: INV,
    registry: REG,
    coreData: CORE,
    objects: OBJ.searchObjects(),
    workflows: OBJ.workflows(),
    diagnostics: OBJ.diagnostics(),
    help: OBJ.help()
  });
  var searchSession = window.PM_V2_SEARCH.createSession(searchIndex, { limit: 30 });
  var searchAllSession = window.PM_V2_SEARCH.createSession(searchIndex, { limit: 250 });

  /* ---------- tiny helpers ------------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function human(s) {
    s = String(s == null ? "" : s).replace(/[_-]+/g, " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* internal auth-model tokens never render raw; each maps to a human label */
  var AUTH_MODEL_LABELS = {
    "cli-profile-oauth": "Signed in via the provider's own CLI profile",
    "pm-direct-oauth": "Direct sign-in managed by Puppet Master",
    "api-token": "API token",
    "api-key": "API key",
    "none": "No sign-in required",
    "mixed": "Multiple sign-in methods",
    "account": "Account sign-in"
  };
  function authLabel(v) {
    if (!v) { return "Provider"; }
    var key = String(v);
    return AUTH_MODEL_LABELS[key] || human(key);
  }
  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }
  function reducedMotion() {
    return document.documentElement.getAttribute("data-motion") === "reduced";
  }
  function scrollToEl(node, pane) {
    if (!node) { return; }
    try {
      node.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
    } catch (e) {
      node.scrollIntoView();
    }
  }
  function locate(node) {
    if (!node) { return; }
    scrollToEl(node);
    node.classList.add("pmv2-locate");
    if (node.tabIndex < 0 || node.tabIndex == null) { node.tabIndex = -1; }
    try { node.focus({ preventScroll: true }); } catch (e2) { node.focus(); }
    setTimeout(function () { node.classList.remove("pmv2-locate"); }, 2400);
  }

  /* ---------- icons (SVG only, deterministic) ------------------------------ */
  var ICONS = {
    home: '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2-1.5A7 7 0 0 0 19 12z"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 8.5 4.25 4.25 0 0 1 17.5 17H7z"/>',
    palette: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="1.1"/><circle cx="14.5" cy="9" r="1.1"/><circle cx="15.5" cy="14" r="1.1"/>',
    edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    terminal: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m7 9 3 3-3 3m5 0h5"/>',
    agent: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    memory: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM12 2v3m0 14v3M2 12h3m14 0h3"/>',
    sound: '<path d="M4 10v4h3l5 4V6l-5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3z"/><path d="M5 19a3 3 0 0 1 3-3h11"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    box: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.6 4.7L4 16.1V20h3.9l4.9-4.9a4 4 0 0 0 4.7-5.6L14 13l-3-3z"/>',
    pulse: '<path d="M4 12h4l2-6 4 12 2-6h4"/>',
    chevR: '<path d="m9 6 6 6-6 6"/>',
    chevL: '<path d="m15 6-6 6 6 6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/>',
    warn: '<path d="M12 3 2 20h20z"/><path d="M12 10v5m0 2.5v.5"/>'
  };
  function icon(key) {
    var k = String(key || "").toLowerCase();
    var path = ICONS[k];
    if (!path) {
      if (/provider|cloud|model|ai/.test(k)) { path = ICONS.cloud; }
      else if (/theme|appear|color|palette/.test(k)) { path = ICONS.palette; }
      else if (/editor|edit|format/.test(k)) { path = ICONS.edit; }
      else if (/terminal|shell|command/.test(k)) { path = ICONS.terminal; }
      else if (/agent|crew|persona|role/.test(k)) { path = ICONS.agent; }
      else if (/memor|context/.test(k)) { path = ICONS.memory; }
      else if (/sound|audio|notif/.test(k)) { path = ICONS.sound; }
      else if (/spell|dict|book|doc/.test(k)) { path = ICONS.book; }
      else if (/secur|privacy|lock|auth|account/.test(k)) { path = ICONS.lock; }
      else if (/system|advance|diagnos|health/.test(k)) { path = ICONS.pulse; }
      else if (/tool|mcp|plugin|skill/.test(k)) { path = ICONS.wrench; }
      else if (/workflow|automation|lifecycle/.test(k)) { path = ICONS.layers; }
      else if (/copy|backup|transact/.test(k)) { path = ICONS.copy; }
      else { path = ICONS.gear; }
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + path + "</svg>";
  }

  /* ---------- data preparation -------------------------------------------- */
  var domains = REG.DOMAINS.slice();
  var categories = INV.categories.slice();
  var catByDomain = {};   // domainId -> inventory category
  var i, j;
  for (i = 0; i < domains.length; i++) {
    catByDomain[domains[i].id] = null;
    for (j = 0; j < categories.length; j++) {
      if (categories[j].id === domains[i].id) { catByDomain[domains[i].id] = categories[j]; break; }
    }
    if (!catByDomain[domains[i].id] && categories[i]) { catByDomain[domains[i].id] = categories[i]; }
  }
  function settingById(id) { return INV.settings[id] || null; }
  function deferredByDomain(domainId) {
    var out = [];
    (REG.DEFERRED_OWNERS || []).forEach(function (d) {
      if (d.domain === domainId) { out.push(d); }
    });
    return out;
  }
  function projectName() {
    var p = null;
    try { p = store.currentProject(); } catch (e) { p = null; }
    if (p && (p.name || p.title)) { return p.name || p.title; }
    if (typeof p === "string") { return p; }
    return "puppet-master";
  }

  /* ---------- root skeleton ------------------------------------------------ */
  root.innerHTML =
    '<div class="tbo-searchbar">' +
      '<div class="tbo-search-wrap">' +
        icon("search") +
        '<input id="pmv2-search" class="tbo-search-input" type="text" autocomplete="off" ' +
          'placeholder="Search all 828 settings, managers, and objects" aria-label="Search settings" ' +
          'aria-expanded="false" aria-controls="pmv2-results">' +
        '<button type="button" class="tbo-search-clear" aria-label="Clear search" hidden>' + icon("x") + "</button>" +
        '<div id="pmv2-results" class="tbo-results pmv2-scroll" hidden role="listbox" aria-label="Search results"></div>' +
      "</div>" +
      '<span class="tbo-project-chip">' + icon("box") + "Project: <strong>" + esc(projectName()) + "</strong></span>" +
    "</div>" +
    '<div class="tbo-scenario" data-on="false"><span class="pm-badge" data-kind="info">Demo</span>' +
      '<span class="tbo-scenario-text"></span>' +
      '<button type="button" class="pm-btn" data-size="s" data-scenario-clear>Reset scenario</button>' +
    "</div>" +
    '<div class="tbo-tabbar" role="tablist" aria-label="Setting domains">' +
      '<div class="tbo-tabstrip"></div>' +
      '<button type="button" class="tbo-tab-overflow" hidden aria-label="All tabs" aria-haspopup="menu">' +
        icon("dots") + "<span>All tabs</span></button>" +
      '<span class="tbo-tab-indicator"></span>' +
    "</div>" +
    '<div class="tbo-narrowbar">' +
      '<button type="button" class="pm-btn tbo-narrowback" data-size="s">' + icon("chevL") + "<span>Back</span></button>" +
      '<span class="tbo-narrow-title">Settings</span>' +
      '<button type="button" class="pm-btn tbo-narrow-menu" data-size="s" aria-haspopup="menu">' + icon("list") + "<span>Tabs</span></button>" +
    "</div>" +
    '<div class="tbo-sheets"></div>';

  var searchWrap = root.querySelector(".tbo-search-wrap");
  var searchInput = root.querySelector("#pmv2-search");
  var searchClear = root.querySelector(".tbo-search-clear");
  var resultsEl = root.querySelector("#pmv2-results");
  var scenarioBar = root.querySelector(".tbo-scenario");
  var scenarioText = root.querySelector(".tbo-scenario-text");
  var tabstrip = root.querySelector(".tbo-tabstrip");
  var tabIndicator = root.querySelector(".tbo-tab-indicator");
  var overflowBtn = root.querySelector(".tbo-tab-overflow");
  var narrowbar = root.querySelector(".tbo-narrowbar");
  var narrowTitle = root.querySelector(".tbo-narrow-title");
  var narrowBack = root.querySelector(".tbo-narrowback");
  var narrowMenu = root.querySelector(".tbo-narrow-menu");
  var sheetsHost = root.querySelector(".tbo-sheets");

  /* ---------- tabs + sheets ------------------------------------------------ */
  var tabs = [{ id: "home", title: "Home", icon: "home", domain: null }];
  domains.forEach(function (d) {
    tabs.push({ id: d.id, title: d.title, icon: d.icon || d.id, domain: d });
  });

  var sheets = {};       // tabId -> sheet record
  var activeTabId = "home";
  var pendingSearchRestore = null;  // {tabId, depth, query, resultId}

  tabs.forEach(function (t) {
    var count = "";
    if (t.domain) {
      var cat = catByDomain[t.domain.id];
      var n = 0;
      if (cat) {
        cat.subgroups.forEach(function (sg) { n += sg.settings.length; });
      }
      count = '<span class="tbo-tab-count">' + n + "</span>";
    }
    var btn = el('<button type="button" class="tbo-tab" role="tab" aria-selected="false" ' +
      'data-domain-id="' + esc(t.id) + '" title="' + esc(t.title) + '">' +
      icon(t.icon) + "<span>" + esc(t.title) + "</span>" + count + "</button>");
    btn.addEventListener("click", function () { activateTab(t.id); });
    tabstrip.appendChild(btn);
    t.tabEl = btn;
  });

  function getSheet(tabId) {
    if (sheets[tabId]) { return sheets[tabId]; }
    var t = null;
    tabs.forEach(function (x) { if (x.id === tabId) { t = x; } });
    var sheet = {
      id: tabId,
      tab: t,
      el: el('<section class="tbo-sheet" data-domain-id="' + esc(tabId) + '" aria-label="' + esc(t.title) + '">' +
        '<div class="tbo-crumb">' +
          '<button type="button" class="tbo-back" hidden>' + icon("chevL") + "<span></span></button>" +
          '<span class="tbo-crumb-path"></span>' +
          '<button type="button" class="pm-btn tbo-close" data-size="s">Close Settings</button>' +
        "</div>" +
        (t.domain ? '<div class="tbo-subtabs" role="tablist" aria-label="' + esc(t.title) + ' sections"></div>' : "") +
        '<div class="tbo-layers"></div>' +
      "</section>"),
      stack: [],
      subtabsEl: null,
      subIndicator: null,
      activeSubgroup: null
    };
    sheetsHost.appendChild(sheet.el);
    sheet.crumbBack = sheet.el.querySelector(".tbo-back");
    sheet.crumbPath = sheet.el.querySelector(".tbo-crumb-path");
    sheet.layersEl = sheet.el.querySelector(".tbo-layers");
    sheet.crumbBack.addEventListener("click", function () { popLayer(sheet); });
    sheet.el.querySelector(".tbo-close").addEventListener("click", function () {
      activateTab("home");
    });
    sheets[tabId] = sheet;
    if (t.domain) { buildDomainSheet(sheet); } else { buildHomeSheet(sheet); }
    return sheet;
  }

  function activateTab(tabId) {
    var sheet = getSheet(tabId);
    activeTabId = tabId;
    tabs.forEach(function (t) {
      t.tabEl.setAttribute("aria-selected", t.id === tabId ? "true" : "false");
    });
    var k;
    for (k in sheets) {
      if (sheets.hasOwnProperty(k)) {
        sheets[k].el.classList.toggle("is-active", k === tabId);
      }
    }
    positionTabIndicator();
    updateNarrowbar();
    updateOverflow();
  }

  function positionTabIndicator() {
    var t = null;
    tabs.forEach(function (x) { if (x.id === activeTabId) { t = x; } });
    if (!t || !t.tabEl) { return; }
    tabIndicator.style.inlineSize = t.tabEl.offsetWidth + "px";
    tabIndicator.style.transform = "translateX(" + t.tabEl.offsetLeft + "px)";
  }

  function updateOverflow() {
    var over = tabstrip.scrollWidth > tabstrip.clientWidth + 4;
    overflowBtn.hidden = !over;
  }

  function openTabMenu(anchor) {
    if (!MENU) { return; }
    var items = tabs.map(function (t) {
      return {
        label: t.title,
        checked: t.id === activeTabId,
        action: function () { activateTab(t.id); }
      };
    });
    MENU.open(anchor, items, {});
  }
  overflowBtn.addEventListener("click", function () { openTabMenu(overflowBtn); });
  narrowMenu.addEventListener("click", function () { openTabMenu(narrowMenu); });
  narrowBack.addEventListener("click", function () {
    var sheet = getSheet(activeTabId);
    if (sheet.stack.length > 1) { popLayer(sheet); }
    else if (activeTabId !== "home") { activateTab("home"); }
  });

  function updateNarrowbar() {
    var sheet = sheets[activeTabId];
    var title = sheet ? sheetTitle(sheet) : "Settings";
    narrowTitle.textContent = title;
    var deep = sheet && sheet.stack.length > 1;
    narrowBack.style.display = (deep || activeTabId !== "home") ? "inline-flex" : "none";
    narrowBack.querySelector("span").textContent =
      deep ? "Back to " + sheet.stack[sheet.stack.length - 2].title : "Back to Home";
  }

  function sheetTitle(sheet) {
    return sheet.stack.length ? sheet.stack[sheet.stack.length - 1].title : sheet.tab.title;
  }

  /* ---------- layer stack (location preservation) -------------------------- */
  function baseLayer(sheet, title, buildContent) {
    var layer = el('<div class="tbo-layer">' +
      '<div class="tbo-layer-scroll pmv2-scroll" tabindex="-1"></div></div>');
    var rec = { title: title, el: layer, scroll: layer.querySelector(".tbo-layer-scroll") };
    sheet.layersEl.appendChild(layer);
    sheet.stack.push(rec);
    buildContent(rec.scroll, rec);
    updateCrumb(sheet);
    return rec;
  }

  function pushLayer(sheet, title, buildContent) {
    var top = sheet.stack[sheet.stack.length - 1];
    if (top) { top.el.hidden = true; }
    var layer = el('<div class="tbo-layer">' +
      '<div class="tbo-layer-scroll pmv2-scroll" tabindex="-1"></div></div>');
    var rec = { title: title, el: layer, scroll: layer.querySelector(".tbo-layer-scroll") };
    sheet.layersEl.appendChild(layer);
    sheet.stack.push(rec);
    buildContent(rec.scroll, rec);
    updateCrumb(sheet);
    updateNarrowbar();
    return rec;
  }

  function popLayer(sheet) {
    if (sheet.stack.length <= 1) { return; }
    var rec = sheet.stack.pop();
    rec.el.parentNode.removeChild(rec.el);
    var top = sheet.stack[sheet.stack.length - 1];
    top.el.hidden = false;   // scroll + selection preserved: node was never detached
    updateCrumb(sheet);
    updateNarrowbar();
    if (pendingSearchRestore &&
        pendingSearchRestore.tabId === sheet.id &&
        sheet.stack.length < pendingSearchRestore.depth) {
      restoreSearchUI(pendingSearchRestore.query, pendingSearchRestore.resultId);
      pendingSearchRestore = null;
    }
  }

  function popToBase(sheet) {
    while (sheet.stack.length > 1) {
      var rec = sheet.stack.pop();
      rec.el.parentNode.removeChild(rec.el);
    }
    sheet.stack[0].el.hidden = false;
    updateCrumb(sheet);
    updateNarrowbar();
  }

  function updateCrumb(sheet) {
    var depth = sheet.stack.length;
    var top = sheet.stack[depth - 1];
    sheet.crumbBack.hidden = depth <= 1;
    if (depth > 1) {
      sheet.crumbBack.querySelector("span").textContent = "Back to " + sheet.stack[depth - 2].title;
    }
    var parts = ["Settings"];
    if (sheet.tab.domain) { parts.push(sheet.tab.title); }
    if (depth > 1) {
      for (var k = 1; k < depth - 1; k++) { parts.push(sheet.stack[k].title); }
    }
    /* the base layer of a domain tab repeats the tab title — never render the
       same segment twice */
    if (parts.length && parts[parts.length - 1] === top.title) { parts.pop(); }
    var html = "";
    parts.forEach(function (p) {
      html += "<span>" + esc(p) + "</span>" + icon("chevR");
    });
    html += '<span class="tbo-crumb-cur">' + esc(top.title) + "</span>";
    sheet.crumbPath.innerHTML = html;
  }

  /* ---------- setting rows (store-bound) ----------------------------------- */
  function currentValue(setting) {
    var v;
    /* no baseValue: an absent override must read as undefined, never as the
       setting object itself (which stringified to "[object Object]") */
    try { v = store.value(setting.id); } catch (e) { v = undefined; }
    if (v === undefined || v === null) {
      v = setting.value !== undefined ? setting.value : setting["default"];
    }
    return v;
  }

  function controlHtml(setting, val) {
    var dis = setting.state === "managed" || setting.state === "unavailable";
    var disAttr = dis ? " disabled" : "";
    var t = setting.type;
    /* structured values (keyvalue tables, lists) summarize truthfully instead
       of stringifying to "[object Object]" */
    if (val !== null && typeof val === "object") { val = formatVal(val); }
    var opts = setting.options || null;
    if (opts && opts.length) {
      var h = '<span class="pm-select"><select data-ctl="' + esc(setting.id) + '"' + disAttr +
        ' aria-label="' + esc(setting.label) + '">';
      opts.forEach(function (o) {
        var ov = typeof o === "object" ? o.value : o;
        var ol = typeof o === "object" ? (o.label || o.value) : o;
        h += '<option value="' + esc(ov) + '"' + (String(ov) === String(val) ? " selected" : "") + ">" +
          esc(human(ol)) + "</option>";
      });
      return h + "</select></span>";
    }
    if (t === "boolean" || t === "toggle") {
      return '<button type="button" class="pm-switch" role="switch" data-ctl="' + esc(setting.id) + '"' +
        ' aria-checked="' + (val ? "true" : "false") + '" aria-label="' + esc(setting.label) + '"' + disAttr + "></button>";
    }
    if (t === "number" || t === "integer" || t === "stepper") {
      return '<span class="pm-stepper"><button type="button" data-step="-1" data-ctl-step="' + esc(setting.id) + '"' + disAttr +
        ' aria-label="Decrease">&minus;</button>' +
        '<input type="number" data-ctl="' + esc(setting.id) + '" value="' + esc(val == null ? 0 : val) + '"' + disAttr +
        ' aria-label="' + esc(setting.label) + '">' +
        '<button type="button" data-step="1" data-ctl-step="' + esc(setting.id) + '"' + disAttr +
        ' aria-label="Increase">+</button></span>';
    }
    if (t === "range" || t === "slider") {
      return '<input type="range" class="pm-slider" min="0" max="100" data-ctl="' + esc(setting.id) +
        '" value="' + esc(val == null ? 0 : val) + '" aria-label="' + esc(setting.label) + '"' + disAttr + ">";
    }
    return '<span class="pm-text"><input type="text" data-ctl="' + esc(setting.id) + '" value="' +
      esc(val == null ? "" : val) + '" placeholder="Not configured" aria-label="' + esc(setting.label) + '"' + disAttr + "></span>";
  }

  function settingRowHtml(setting) {
    var val = currentValue(setting);
    var st = setting.state || "default";
    var badge = "";
    if (st === "managed") { badge = '<span class="pm-badge" data-kind="managed">Managed</span>'; }
    else if (st === "unavailable") { badge = '<span class="pm-badge" data-kind="muted">Unavailable</span>'; }
    else if (st === "custom") { badge = '<span class="pm-badge" data-kind="accent">Custom</span>'; }
    var reason = "";
    if (st === "managed") {
      reason = '<div class="tbo-row-reason">Managed by your team policy; this control is read-only here.</div>';
    } else if (st === "unavailable") {
      reason = '<div class="tbo-row-reason">Not available in the current scenario.</div>';
    }
    return '<div class="tbo-row" data-state="' + esc(st) + '" data-setting-id="' + esc(setting.id) + '">' +
      '<div class="tbo-row-label">' + esc(setting.label) + badge + "</div>" +
      '<div class="tbo-row-control">' + controlHtml(setting, val) + "</div>" +
      '<div class="tbo-row-desc">' + esc(setting.desc || "") + "</div>" +
      reason +
      '<details class="tbo-row-details"><summary>' + icon("search") + "Why this value?</summary>" +
        '<div class="tbo-row-why">' +
          '<span class="tbo-why-kv">Current: <b>' + esc(formatVal(val)) + "</b></span>" +
          (setting["default"] !== undefined
            ? '<span class="tbo-why-kv">Default: <b>' + esc(formatVal(setting["default"])) + "</b></span>" : "") +
          (setting.recommended !== undefined
            ? '<span class="tbo-why-kv">Recommended: <b>' + esc(formatVal(setting.recommended)) + "</b></span>" : "") +
          '<span class="tbo-why-kv">Source: <b>' + esc(human(setting.source || "project")) + "</b></span>" +
          '<span class="tbo-why-kv">Tier: <b>' + esc(human(setting.tier || "standard")) + "</b></span>" +
          '<span class="tbo-why-kv">Exposure: <b>' + esc(human(setting.exposure || "common")) + "</b></span>" +
          (st === "custom"
            ? '<button type="button" class="pm-btn" data-size="s" data-reset="' + esc(setting.id) + '">Reset to default</button>'
            : "") +
        "</div></details>" +
    "</div>";
  }

  function formatVal(v) {
    if (v === true) { return "On"; }
    if (v === false) { return "Off"; }
    if (v === undefined || v === null || v === "") { return "Not set"; }
    if (typeof v === "object") {
      if (v instanceof Array) { return v.length ? v.length + " item" + (v.length > 1 ? "s" : "") : "None"; }
      if (Object.prototype.hasOwnProperty.call(v, "value") && typeof v.value !== "object") {
        return formatVal(v.value);
      }
      var n = Object.keys(v).length;
      return n ? n + " entr" + (n > 1 ? "ies" : "y") : "None";
    }
    return human(v);
  }

  function bindSettingRows(containerEl) {
    containerEl.addEventListener("click", function (ev) {
      var sw = ev.target.closest ? ev.target.closest(".pm-switch[data-ctl]") : null;
      if (sw && !sw.disabled) {
        var id = sw.getAttribute("data-ctl");
        var next = sw.getAttribute("aria-checked") !== "true";
        try { store.setValue(id, next); } catch (e) { /* demo store */ }
        sw.setAttribute("aria-checked", next ? "true" : "false");
        markCustom(containerEl, id);
        return;
      }
      var st = ev.target.closest ? ev.target.closest("[data-ctl-step]") : null;
      if (st && !st.disabled) {
        var sid = st.getAttribute("data-ctl-step");
        var input = containerEl.querySelector('input[data-ctl="' + sid + '"]');
        if (input) {
          var step = parseInt(st.getAttribute("data-step"), 10);
          var v2 = (parseInt(input.value, 10) || 0) + step;
          input.value = v2;
          try { store.setValue(sid, v2); } catch (e2) { }
          markCustom(containerEl, sid);
        }
        return;
      }
      var rst = ev.target.closest ? ev.target.closest("[data-reset]") : null;
      if (rst) {
        var rid = rst.getAttribute("data-reset");
        try { store.resetValue(rid); } catch (e3) { }
        refreshRow(containerEl, rid);
      }
    });
    containerEl.addEventListener("change", function (ev) {
      var c = ev.target.closest ? ev.target.closest("[data-ctl]") : null;
      if (!c || c.disabled) { return; }
      var id = c.getAttribute("data-ctl");
      var v = c.type === "number" || c.type === "range" ? Number(c.value) : c.value;
      try { store.setValue(id, v); } catch (e) { }
      markCustom(containerEl, id);
    });
  }

  function markCustom(containerEl, id) {
    var row = containerEl.querySelector('[data-setting-id="' + id + '"]');
    if (!row) { return; }
    var label = row.querySelector(".tbo-row-label");
    if (label && !label.querySelector(".pm-badge[data-kind='accent']") && row.getAttribute("data-state") === "default") {
      row.setAttribute("data-state", "custom");
      label.insertAdjacentHTML("beforeend", ' <span class="pm-badge" data-kind="accent">Custom</span>');
    }
  }

  function refreshRow(containerEl, id) {
    var setting = settingById(id);
    var row = containerEl.querySelector('[data-setting-id="' + id + '"]');
    if (!setting || !row) { return; }
    var fresh = el(settingRowHtml(setting));
    row.parentNode.replaceChild(fresh, row);
  }

  function renderSettingGroup(host, title, note, settings) {
    if (!settings.length) { return; }
    var g = el('<div class="tbo-group"><h3 class="tbo-group-h">' + esc(title) + "</h3>" +
      (note ? '<p class="tbo-group-note">' + esc(note) + "</p>" : "") +
      '<div class="tbo-rows"></div></div>');
    var rows = g.querySelector(".tbo-rows");
    var html = "";
    settings.forEach(function (s) { html += settingRowHtml(s); });
    rows.innerHTML = html;
    bindSettingRows(rows);
    host.appendChild(g);
  }

  /* ---------- home sheet ---------------------------------------------------- */
  /* notice targets name owner-side categories; each routes to the real
     destination: its manager inside the manager's own domain tab */
  var NOTICE_TARGET_MANAGERS = {
    permissions: "permissions",
    providers: "providers",
    terminal: "terminal",
    "source-control": "source-control",
    context: "context",
    notifications: "notifications"
  };
  function goNoticeTarget(target) {
    if (!target) { return; }
    var mgrId = target.manager || NOTICE_TARGET_MANAGERS[target.category] || null;
    var mgr = mgrId ? REG.managerById(mgrId) : null;
    if (mgr) {
      var sheet = getSheet(mgr.domain);
      activateTab(mgr.domain);
      openManager(sheet, mgr.id, { locate: true });
      return;
    }
    if (target.setting) {
      var s = settingById(target.setting);
      if (s) { navigateToSetting(s, null); return; }
    }
    if (target.category && catByDomain[target.category]) { activateTab(target.category); }
  }

  function buildHomeSheet(sheet) {
    baseLayer(sheet, "Home", function (host) {
      var dismissed = {};
      try { dismissed = store.doc("dismissedNotices", {}) || {}; } catch (e0) { dismissed = {}; }
      var KIND_ORDER = { attention: 0, setup: 1, recommended: 2 };
      var notices = (CORE.notices || []).filter(function (n) { return n && !dismissed[n.id]; });
      notices.sort(function (a, b) {
        var ka = KIND_ORDER[a.kind] != null ? KIND_ORDER[a.kind] : 3;
        var kb = KIND_ORDER[b.kind] != null ? KIND_ORDER[b.kind] : 3;
        return ka - kb;
      });
      /* at most one banner: the first unresolved attention notice */
      var critical = null;
      var attention = [];
      notices.forEach(function (n) {
        if (!critical && n.kind === "attention") { critical = n; }
        else if (attention.length < 4) { attention.push(n); }
      });

      var html = '<div class="tbo-home-hero"><h1>Settings</h1>' +
        "<p>Every change applies to the current project, <strong>" + esc(projectName()) +
        "</strong>. Each domain tab keeps its place while you work elsewhere.</p></div>";

      if (critical) {
        html += '<div class="pm-notice" data-kind="attention">' +
          '<span class="pm-notice-chip">Attention</span>' +
          '<span class="pm-notice-head">' + esc(critical.headline || critical.title || "Notice") + "</span>" +
          '<p class="pm-notice-body">' + esc(critical.consequence || critical.message || "") + "</p>" +
          '<span class="pm-notice-actions">' +
            '<button type="button" class="pm-btn" data-notice-go="' + esc(critical.id) + '">' +
              esc(critical.actionLabel || "Review") + "</button>" +
            '<button type="button" class="pm-btn" data-variant="quiet" data-notice-dismiss="' + esc(critical.id) + '">' +
              esc(critical.secondaryLabel || "Dismiss") + "</button>" +
          "</span></div>";
      }

      if (attention.length) {
        html += '<h2 class="tbo-section-h">Needs attention<span class="tbo-section-note">' +
          attention.length + " unresolved item" + (attention.length > 1 ? "s" : "") + "</span></h2>" +
          '<div class="tbo-attn-list">';
        attention.forEach(function (n) {
          html += '<button type="button" class="tbo-attn-row" data-notice-go="' + esc(n.id) + '"' +
            ' aria-label="' + esc((n.actionLabel || "Review") + ": " + (n.headline || "Notice")) + '">' +
            '<span class="pm-healthdot" data-state="' + (n.kind === "attention" ? "warn" : "unknown") + '"></span>' +
            '<span class="tbo-attn-main"><span class="tbo-attn-title">' +
            esc(n.headline || n.title || "Notice") + '</span><span class="tbo-attn-sub">' +
            esc(n.consequence || n.message || "") + "</span></span>" +
            '<svg class="tbo-chev" viewBox="0 0 24 24" aria-hidden="true">' + ICONS.chevR + "</svg></button>";
        });
        html += "</div>";
      }

      html += '<h2 class="tbo-section-h">Domains<span class="tbo-section-note">Twelve tabs; each remembers where you left off</span></h2>' +
        '<div class="tbo-domain-grid">';
      domains.forEach(function (d) {
        var cat = catByDomain[d.id];
        var n = 0;
        if (cat) { cat.subgroups.forEach(function (sg) { n += sg.settings.length; }); }
        var mgrs = REG.managersByDomain(d.id).length;
        html += '<button type="button" class="tbo-domain-card" data-domain-id="' + esc(d.id) + '">' +
          icon(d.icon || d.id) +
          '<span class="tbo-domain-title">' + esc(d.title) + "</span>" +
          '<span class="tbo-domain-meta">' + n + " settings &middot; " + mgrs + " managers</span></button>";
      });
      html += "</div>";

      html += '<h2 class="tbo-section-h">Recent changes</h2><div class="tbo-recent">';
      var recents = CORE.recents || [];
      if (!recents.length) {
        html += '<p class="tbo-group-note">No recent changes in this demo scenario.</p>';
      }
      recents.slice(0, 6).forEach(function (r) {
        var label = r.label || r.title || r.setting || r.id || "Change";
        var when = r.when || r.time || r.at || "";
        html += '<button type="button" class="tbo-recent-row"' +
          (r.settingId || r.setting ? ' data-recent-setting="' + esc(r.settingId || r.setting) + '"' : "") + ">" +
          "<span>" + esc(typeof label === "string" ? label : "Change") + "</span>" +
          '<span class="tbo-recent-time">' + esc(when) + "</span></button>";
      });
      html += "</div>";

      html += '<h2 class="tbo-section-h">Utilities</h2><div class="tbo-util-row">' +
        '<button type="button" class="pm-btn" data-util="compendium">' + icon("list") + "All Settings index</button>" +
        '<button type="button" class="pm-btn" data-util="copy">' + icon("copy") + "Copy Settings From Another Project</button>" +
        '<button type="button" class="pm-btn" data-util="scenarios">' + icon("pulse") + "Demo scenarios</button>" +
        "</div>";

      host.innerHTML = html;

      host.querySelectorAll("[data-notice-go]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var nid = btn.getAttribute("data-notice-go");
          var target = null;
          (CORE.notices || []).forEach(function (n) { if (n.id === nid) { target = n.target; } });
          goNoticeTarget(target);
        });
      });
      host.querySelectorAll("[data-notice-dismiss]").forEach(function (btn) {
        btn.addEventListener("click", function (ev) {
          ev.stopPropagation();
          var d = {};
          try { d = store.doc("dismissedNotices", {}) || {}; } catch (e1) { d = {}; }
          d[btn.getAttribute("data-notice-dismiss")] = true;
          try { store.setDoc("dismissedNotices", d); } catch (e2) { }
          var notice = btn.closest ? btn.closest(".pm-notice") : null;
          if (notice && notice.parentNode) { notice.parentNode.removeChild(notice); }
        });
      });

      host.querySelectorAll(".tbo-domain-card").forEach(function (card) {
        card.addEventListener("click", function () {
          activateTab(card.getAttribute("data-domain-id"));
        });
      });
      host.querySelectorAll("[data-recent-setting]").forEach(function (row) {
        row.addEventListener("click", function () {
          var sid = row.getAttribute("data-recent-setting");
          var s = settingById(sid);
          if (s) { navigateToSetting(s, null); }
        });
      });
      host.querySelector('[data-util="compendium"]').addEventListener("click", function () {
        openCompendium(sheet);
      });
      host.querySelector('[data-util="copy"]').addEventListener("click", function () {
        openCopy(sheet);
      });
      host.querySelector('[data-util="scenarios"]').addEventListener("click", function () {
        openScenarioDrawer();
      });
    });
  }

  /* ---------- domain sheet -------------------------------------------------- */
  function buildDomainSheet(sheet) {
    var d = sheet.tab.domain;
    var cat = catByDomain[d.id];
    var subtabsEl = sheet.el.querySelector(".tbo-subtabs");
    sheet.subtabsEl = subtabsEl;

    if (cat && cat.subgroups.length) {
      var html = "";
      cat.subgroups.forEach(function (sg, idx) {
        html += '<button type="button" class="tbo-subtab" role="tab" aria-selected="' + (idx === 0 ? "true" : "false") +
          '" data-section-id="' + esc(sg.id) + '">' + esc(sg.title) +
          '<span class="tbo-tab-count">' + sg.settings.length + "</span></button>";
      });
      html += '<span class="tbo-subtab-indicator"></span>';
      subtabsEl.innerHTML = html;
      sheet.subIndicator = subtabsEl.querySelector(".tbo-subtab-indicator");
      subtabsEl.querySelectorAll(".tbo-subtab").forEach(function (btn) {
        btn.addEventListener("click", function () {
          selectSubgroup(sheet, btn.getAttribute("data-section-id"));
        });
      });
      sheet.activeSubgroup = cat.subgroups[0].id;
    } else {
      subtabsEl.style.display = "none";
    }

    baseLayer(sheet, d.title, function (host) {
      renderDomainBase(sheet, host);
    });
    positionSubIndicator(sheet);
  }

  function renderDomainBase(sheet, host) {
    var d = sheet.tab.domain;
    var cat = catByDomain[d.id];
    host.innerHTML = "";
    var head = el('<div class="tbo-domain-head"><h2>' + esc(d.title) + "</h2><p>" +
      esc(d.blurb || (cat ? cat.description : "")) + "</p></div>");
    host.appendChild(head);

    var body = el('<div class="tbo-domain-body"></div>');
    host.appendChild(body);
    sheet.domainBodyEl = body;
    renderSubgroupSettings(sheet);

    /* related-manager strip */
    var mgrs = REG.managersByDomain(d.id);
    var owners = deferredByDomain(d.id);
    if (mgrs.length || owners.length) {
      var rel = el('<div class="tbo-related">' +
        '<h3 class="tbo-section-h">Managers in ' + esc(d.title) +
        '<span class="tbo-section-note">Open a manager inside this tab; the tab keeps your place</span></h3>' +
        '<div class="tbo-related-strip"></div></div>');
      var strip = rel.querySelector(".tbo-related-strip");
      mgrs.forEach(function (m) {
        var chip = el('<button type="button" class="tbo-related-chip" data-manager-id="' + esc(m.id) + '">' +
          icon(m.icon || m.family) + "<span>" + esc(m.title) + "</span>" +
          '<span class="tbo-related-sub">' + esc(human(m.archetype)) + "</span></button>");
        chip.addEventListener("click", function () { openManager(sheet, m.id); });
        strip.appendChild(chip);
      });
      owners.forEach(function (o) {
        var chip = el('<button type="button" class="tbo-related-chip" data-owner-id="' + esc(o.id) + '">' +
          icon("layers") + "<span>" + esc(human(o.family)) + "</span>" +
          '<span class="tbo-related-sub">Owned by ' + esc(o.owner) + "</span></button>");
        chip.addEventListener("click", function () { openOwnerShell(sheet, o); });
        strip.appendChild(chip);
      });
      host.appendChild(rel);
    }
  }

  function renderSubgroupSettings(sheet) {
    var cat = catByDomain[sheet.tab.domain.id];
    var body = sheet.domainBodyEl;
    if (!body) { return; }
    body.innerHTML = "";
    if (!cat) {
      body.innerHTML = '<p class="tbo-group-note">No inventory groups for this domain in the demo inventory.</p>';
      return;
    }
    var sg = null;
    cat.subgroups.forEach(function (x) { if (x.id === sheet.activeSubgroup) { sg = x; } });
    if (!sg) { sg = cat.subgroups[0]; sheet.activeSubgroup = sg.id; }
    var settings = [];
    sg.settings.forEach(function (id) {
      var s = settingById(id);
      if (s) { settings.push(s); }
    });
    renderSettingGroup(body, sg.title, sg.description, settings);
  }

  function selectSubgroup(sheet, sgId) {
    sheet.activeSubgroup = sgId;
    sheet.subtabsEl.querySelectorAll(".tbo-subtab").forEach(function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-section-id") === sgId ? "true" : "false");
    });
    positionSubIndicator(sheet);
    renderSubgroupSettings(sheet);
    if (sheet.domainBodyEl && sheet.stack[0]) {
      sheet.stack[0].scroll.scrollTop = 0;
    }
  }

  function positionSubIndicator(sheet) {
    if (!sheet.subIndicator || !sheet.subtabsEl) { return; }
    var btn = sheet.subtabsEl.querySelector('[data-section-id="' + sheet.activeSubgroup + '"]');
    if (!btn) { return; }
    sheet.subIndicator.style.inlineSize = btn.offsetWidth + "px";
    sheet.subIndicator.style.transform = "translateX(" + btn.offsetLeft + "px)";
  }

  /* ---------- managers -------------------------------------------------------
     Lazy render: content is built on first open and cached per manager id;
     the sheet layer keeps it alive for the rest of the session. */
  var managerCache = {};  // managerId -> content element

  function openManager(sheet, managerId, opts) {
    opts = opts || {};
    var m = REG.managerById(managerId);
    if (!m) { return null; }
    var rec = pushLayer(sheet, m.title, function (host, layerRec) {
      host.setAttribute("data-manager-id", m.id);
      if (managerCache[m.id]) {
        host.appendChild(managerCache[m.id]);
      } else {
        var content = el('<div class="tbo-mgr"></div>');
        renderManager(content, m, sheet, layerRec);
        managerCache[m.id] = content;
        host.appendChild(content);
      }
    });
    if (opts.subpage && managerCache[m.id] && typeof managerCache[m.id].__setSubpage === "function") {
      managerCache[m.id].__setSubpage(opts.subpage);
    }
    if (opts.objectId) {
      selectObjectInLayer(rec, m, opts.objectId, opts.section, opts.locate !== false);
    } else if (opts.locate) {
      locate(rec.el.querySelector("[data-manager-id]"));
    }
    return rec;
  }

  function mgrHeadHtml(m) {
    return '<div class="tbo-mgr-head"><h2>' + icon(m.icon || m.family) + esc(m.title) + "</h2>" +
      "<p>" + esc(m.summary || "") + " Changes apply to the current project, <strong>" +
      esc(projectName()) + "</strong>.</p></div>";
  }

  function subpageSlug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-"); }

  function mgrSubpages(m) {
    return (m.subpages || []).map(function (s) {
      var title = typeof s === "string" ? s : (s.title || human(s.id));
      return { slug: subpageSlug(title), title: title };
    });
  }

  var managerSubpage = {};  // managerId -> active subpage slug (survives cache reuse)

  function renderManager(content, m, sheet, layerRec) {
    content.innerHTML = mgrHeadHtml(m);
    var pages = mgrSubpages(m);
    var body = el('<div class="tbo-mgr-body"></div>');
    var paintTabs = null;
    if (pages.length) {
      var tabs = el('<div class="tbo-subtabs" role="tablist" aria-label="' + esc(m.title) + ' sections"></div>');
      pages.forEach(function (p) {
        var b = el('<button type="button" class="tbo-subtab" role="tab" data-section-id="' + esc(p.slug) +
          '" aria-selected="false">' + esc(p.title) + "</button>");
        b.addEventListener("click", function () {
          managerSubpage[m.id] = p.slug;
          paintTabs();
          fillBody();
        });
        tabs.appendChild(b);
      });
      var indicator = el('<span class="tbo-subtab-indicator"></span>');
      tabs.appendChild(indicator);
      content.appendChild(tabs);
      paintTabs = function () {
        var active = managerSubpage[m.id] || pages[0].slug;
        tabs.querySelectorAll(".tbo-subtab").forEach(function (b) {
          var on = b.getAttribute("data-section-id") === active;
          b.setAttribute("aria-selected", on ? "true" : "false");
          if (on) {
            indicator.style.inlineSize = b.offsetWidth + "px";
            indicator.style.transform = "translateX(" + b.offsetLeft + "px)";
          }
        });
      };
    }
    content.appendChild(body);
    function fillBody() {
      body.innerHTML = "";
      renderManagerBody(body, m, sheet, layerRec, managerSubpage[m.id] || (pages.length ? pages[0].slug : null));
    }
    /* deep-link entry point: validated against real subpage slugs */
    content.__setSubpage = function (slug) {
      var ok = false;
      pages.forEach(function (p) { if (p.slug === slug) { ok = true; } });
      if (!ok) { return; }
      managerSubpage[m.id] = slug;
      if (paintTabs) { paintTabs(); }
      fillBody();
    };
    if (paintTabs) { paintTabs(); }
    fillBody();
  }

  function renderManagerBody(body, m, sheet, layerRec, subpage) {
    var a = m.archetype;
    if (a === "preference-document") { renderPreferenceMgr(body, m, subpage); }
    else if (a === "resource-roster") { renderRosterMgr(body, m, sheet); }
    else if (a === "inventory-catalog") { renderCatalogMgr(body, m, sheet); }
    else if (a === "setup-sequence") { renderSetupMgr(body, m); }
    else if (a === "health-projection") { renderHealthMgr(body, m); }
    else if (a === "diagnostic-drawer") { renderDiagnosticMgr(body, m); }
    else if (a === "transaction") {
      if (/copy/i.test(m.id + " " + m.title)) { renderCopyMgrLink(body, m, sheet); }
      else { renderTransactionMgr(body, m); }
    }
    else { renderPreferenceMgr(body, m, subpage); }
  }

  /* preference-document: grouped setting rows for the manager's domain */
  function renderPreferenceMgr(body, m, subpage) {
    var cat = catByDomain[m.domain];
    if (!cat) {
      body.innerHTML += '<p class="tbo-group-note">No preference groups mapped to this manager in the demo inventory.</p>';
      return;
    }
    /* a subpage filters groups only when subpage slugs actually name groups */
    var filterable = false;
    if (subpage) {
      mgrSubpages(m).forEach(function (p) {
        cat.subgroups.forEach(function (sg) { if (p.slug === sg.id) { filterable = true; } });
      });
    }
    var host = el("<div></div>");
    cat.subgroups.forEach(function (sg) {
      if (filterable && sg.id !== subpage) { return; }
      var settings = [];
      sg.settings.forEach(function (id) {
        var s = settingById(id);
        if (s) { settings.push(s); }
      });
      renderSettingGroup(host, sg.title, sg.description, settings.slice(0, 8));
    });
    body.appendChild(host);
  }

  /* resource-roster */
  function rosterFor(m) {
    if (m.objectSource && /provider/i.test(m.objectSource)) {
      return (CORE.providers || []).map(function (p) {
        return {
          id: p.id, label: p.name || p.label || p.id,
          typeLabel: p.authModel ? authLabel(p.authModel) : (p.kind || "Provider"),
          health: p.health, raw: p
        };
      });
    }
    var rosters = OBJ.objects();
    var list = (m.objectSource && rosters[m.objectSource]) || [];
    return list;
  }

  function renderRosterMgr(body, m, sheet) {
    var items = rosterFor(m);
    var wrap = el('<div class="tbo-roster"></div>');
    if (!items.length) {
      wrap.innerHTML = '<p class="tbo-group-note">Nothing here yet. Add one to get started.</p>';
    }
    items.forEach(function (o) {
      var health = o.health ? '<span class="pm-healthdot" data-state="' + esc(o.health.state || o.health) + '"></span>' : "";
      var row = el('<button type="button" class="tbo-roster-row" data-object-id="' + esc(o.id) + '">' +
        '<span class="tbo-roster-ic">' + icon(m.icon || m.family) + "</span>" +
        '<span><span class="tbo-roster-title">' + esc(o.label) + health + "</span>" +
        '<span class="tbo-roster-sub">' + esc(o.typeLabel || "") + "</span></span>" +
        "<span></span>" + '<svg class="tbo-chev" viewBox="0 0 24 24" aria-hidden="true">' + ICONS.chevR + "</svg></button>");
      row.addEventListener("click", function () { openObjectDetail(sheet, m, o); });
      wrap.appendChild(row);
    });
    body.appendChild(wrap);
  }

  function subpageList(m, o) {
    var raw = (o && o.raw) || null;
    if (raw && /provider/i.test(m.objectSource || "")) {
      return ["Overview", "Credentials", "Models", "Rate Limits", "Usage", "Advanced"];
    }
    if (m.subpages && m.subpages.length) {
      return m.subpages.map(function (s) { return typeof s === "string" ? human(s) : (s.title || human(s.id)); });
    }
    return ["Overview", "Advanced"];
  }

  function openObjectDetail(sheet, m, o, section) {
    var pages = subpageList(m, o);
    var active = section || pages[0];
    var found = false;
    pages.forEach(function (p) { if (p.toLowerCase() === String(active).toLowerCase()) { active = p; found = true; } });
    if (!found) { active = pages[0]; }

    var rec = pushLayer(sheet, o.label, function (host) {
      host.setAttribute("data-object-id", o.id);
      var html = '<div class="tbo-mgr-head"><h2>' + icon(m.icon || m.family) + esc(o.label) + "</h2>" +
        "<p>" + esc(o.typeLabel || "") + " &middot; managed by " + esc(m.title) + "</p></div>" +
        '<div class="tbo-subtabs" role="tablist" aria-label="Detail sections">';
      pages.forEach(function (p) {
        html += '<button type="button" class="tbo-subtab" role="tab" aria-selected="' +
          (p === active ? "true" : "false") + '" data-section-id="' + esc(p) + '">' + esc(p) + "</button>";
      });
      html += '<span class="tbo-subtab-indicator"></span></div><div class="tbo-detail-body"></div>';
      host.innerHTML = html;
    });

    var body = rec.el.querySelector(".tbo-detail-body");
    var subtabs = rec.el.querySelector(".tbo-subtabs");
    var indicator = subtabs.querySelector(".tbo-subtab-indicator");

    function paint(name) {
      subtabs.querySelectorAll(".tbo-subtab").forEach(function (b) {
        var on = b.getAttribute("data-section-id") === name;
        b.setAttribute("aria-selected", on ? "true" : "false");
        if (on) {
          indicator.style.inlineSize = b.offsetWidth + "px";
          indicator.style.transform = "translateX(" + b.offsetLeft + "px)";
        }
      });
      renderDetailPage(body, m, o, name, sheet);
    }
    subtabs.querySelectorAll(".tbo-subtab").forEach(function (b) {
      b.addEventListener("click", function () { paint(b.getAttribute("data-section-id")); });
    });
    paint(active);
    return rec;
  }

  function kvCard(title, pairs) {
    var h = '<div class="tbo-kv-card"><h4>' + esc(title) + '</h4><dl class="tbo-kv">';
    pairs.forEach(function (p) {
      h += "<dt>" + esc(p[0]) + "</dt><dd>" + p[1] + "</dd>";
    });
    return h + "</dl></div>";
  }

  function renderDetailPage(body, m, o, page, sheet) {
    var p = o.raw || null;
    var name = page.toLowerCase();
    var html = "";
    if (p) {
      var accounts = p.accounts || [];
      var health = p.health ? (typeof p.health === "string" ? p.health : (p.health.state || "ok")) : "unknown";
      if (name === "overview") {
        html = '<div class="tbo-detail-grid">' +
          kvCard("Status", [
            ["Health", '<span class="pm-healthdot" data-state="' + esc(health) + '"></span> ' + esc(human(health))],
            ["Auth model", esc(authLabel(p.authModel || "account"))],
            ["Install state", esc(human(p.installState || "installed"))]
          ]) +
          kvCard("Accounts", accounts.length
            ? accounts.map(function (a) { return ["Account", esc(a.name || a.label || a.id || "Account")]; })
            : [["Account", "Not signed in"]]) +
          "</div>";
      } else if (name === "credentials") {
        html = '<div class="tbo-detail-grid">' +
          kvCard("Credentials", accounts.length
            ? accounts.map(function (a) {
                return [a.name || a.label || "Account",
                  esc(a.keyMasked || a.tokenMasked || a.masked || "•••• •••• ••••")];
              })
            : [["Credentials", "Not configured"]]) +
          "</div>" +
          '<p class="tbo-group-note">Secrets are always masked. Re-authenticate from the provider&rsquo;s own sign-in flow.</p>';
      } else if (name === "models") {
        var models = p.models || [];
        html = models.length
          ? '<div class="tbo-roster">' + models.map(function (md) {
              return '<div class="tbo-roster-row"><span class="tbo-roster-ic">' + icon("cloud") + "</span>" +
                '<span><span class="tbo-roster-title">' + esc(md.name || md.label || md) + "</span>" +
                '<span class="tbo-roster-sub">' + esc(md.tier || md.kind || "") + "</span></span><span></span><span></span></div>";
            }).join("") + "</div>"
          : '<p class="tbo-group-note">Model list loads after the provider is set up.</p>';
      } else if (name === "rate limits") {
        html = '<div class="tbo-detail-grid">' + kvCard("Rate limits", [
          ["Requests / min", esc(p.rateLimit || "60")],
          ["Tokens / min", esc(p.tokenLimit || "90,000")],
          ["Concurrency", esc(p.concurrency || "4")]
        ]) + "</div>";
      } else if (name === "usage") {
        html = '<div class="tbo-detail-grid">' + kvCard("Usage this period", [
          ["Requests", esc(p.usageRequests || "1,240")],
          ["Tokens", esc(p.usageTokens || "812,400")],
          ["Included quota", esc(p.usageQuota || "72%")]
        ]) + "</div>";
      } else {
        /* Advanced / installation */
        var installed = !/not|missing|absent/i.test(String(p.installState || "installed"));
        var update = /update/i.test(String(p.updateState || "")) || p.updateAvailable;
        html = '<div class="tbo-detail-grid">' +
          kvCard("Installation", [
            ["State", esc(human(p.installState || "installed"))],
            ["Source", "Official provider download"],
            ["Version", esc(p.version || "current")]
          ]) + "</div>" +
          '<div class="tbo-copy-actions">' +
          (installed
            ? '<button type="button" class="pm-btn" data-prov="repair">Repair installation</button>'
            : '<button type="button" class="pm-btn" data-kind="primary" data-prov="install">Install / Set Up from official source</button>') +
          (update ? '<span class="pm-badge" data-kind="info">Update available</span>' +
            '<button type="button" class="pm-btn" data-prov="update">Update</button>' : "") +
          "</div>" +
          '<p class="tbo-group-note">Puppet Master never bundles or pre-seeds provider runtimes. ' +
          "Install and repair fetch from the provider&rsquo;s official source only.</p>" +
          '<div class="tbo-op-slot"></div>';
      }
    } else {
      /* generic object from PM_V2_OBJECTS */
      if (name === "overview") {
        html = '<div class="tbo-detail-grid">' + kvCard("About", [
          ["Name", esc(o.label)],
          ["Type", esc(o.typeLabel || "Object")],
          ["Managed by", esc(o.managerTitle || m.title)]
        ]) + "</div>";
      } else {
        html = '<p class="tbo-group-note">No additional detail for this section in the demo.</p>';
      }
    }
    body.innerHTML = html;

    var opBtn = body.querySelector("[data-prov]");
    if (opBtn) {
      opBtn.addEventListener("click", function () {
        runProviderOp(body.querySelector(".tbo-op-slot"), opBtn.getAttribute("data-prov"), o.label);
      });
    }
  }

  function runProviderOp(slot, kind, label) {
    if (!slot) { return; }
    var titles = { install: "Install", repair: "Repair", update: "Update" };
    var op;
    try {
      op = store.begin({
        kind: kind, title: titles[kind] + " " + label,
        phases: ["Download", "Verify", "Configure"], determinate: true, total: 3, cancelable: false
      });
    } catch (e) { op = null; }
    slot.innerHTML = '<div class="tbo-op-card pm-notice" data-kind="info"><span class="pm-notice-title">' +
      esc(titles[kind] + " " + label) + '</span><span class="tbo-op-phase">Starting&hellip;</span></div>';
    var phaseEl = slot.querySelector(".tbo-op-phase");
    var step = 0;
    var phases = ["Downloading from official source", "Verifying signature", "Configuring"];
    function tick() {
      if (step < phases.length) {
        phaseEl.textContent = phases[step] + "\u2026";
        try { if (op) { store.advance(op, step + 1); } } catch (e) { }
        step++;
        setTimeout(tick, 320);
      } else {
        phaseEl.textContent = "Done. " + titles[kind] + " completed for the current project.";
        try { if (op) { store.finish(op, "succeeded"); } } catch (e2) { }
      }
    }
    setTimeout(tick, 320);
  }

  function selectObjectInLayer(rec, m, objectId, section, doLocate) {
    var row = rec.el.querySelector('[data-object-id="' + objectId + '"]');
    var objects = rosterFor(m);
    var target = null;
    objects.forEach(function (o) { if (o.id === objectId) { target = o; } });
    if (target) {
      var det = openObjectDetail(sheetOfLayer(rec), m, target, section);
      if (doLocate) { locate(det.el.querySelector("[data-object-id]")); }
    } else if (row && doLocate) {
      locate(row);
    }
  }
  function sheetOfLayer(rec) {
    var k;
    for (k in sheets) {
      if (sheets.hasOwnProperty(k)) {
        var st = sheets[k].stack;
        for (var x = 0; x < st.length; x++) { if (st[x] === rec) { return sheets[k]; } }
      }
    }
    return sheets[activeTabId];
  }

  /* inventory-catalog: facet chips + virtualized list */
  function renderCatalogMgr(body, m, sheet) {
    var items = rosterFor(m);
    renderFacetedList(body, items, {
      facetKeys: ["typeLabel", "domain"],
      empty: "Catalog is empty in this scenario.",
      onOpen: function (o) { openObjectDetail(sheet, m, o); },
      rowSub: function (o) { return (o.typeLabel || "") + (o.managerTitle ? " · " + o.managerTitle : ""); }
    });
  }

  function renderFacetedList(host, items, cfg) {
    var state = { facets: {}, text: "" };
    var keys = cfg.facetKeys || [];
    var facetHtml = '<div class="tbo-facets">';
    keys.forEach(function (k) {
      var seen = {};
      items.forEach(function (o) {
        var v = o[k];
        if (v && !seen[v]) {
          seen[v] = true;
          facetHtml += '<button type="button" class="tbo-facet" data-fk="' + esc(k) + '" data-fv="' + esc(v) +
            '" aria-pressed="false">' + esc(human(v)) + "</button>";
        }
      });
    });
    facetHtml += "</div>";
    var wrap = el("<div>" + facetHtml +
      '<div class="tbo-comp-filter"><span class="pm-text"><input type="text" placeholder="Filter list" aria-label="Filter list"></span></div>' +
      '<div class="tbo-vlist pmv2-scroll" style="max-block-size:460px"><div class="tbo-vlist-spacer"></div></div>' +
      "</div>");
    host.appendChild(wrap);
    var listEl = wrap.querySelector(".tbo-vlist");
    var spacer = wrap.querySelector(".tbo-vlist-spacer");
    var input = wrap.querySelector("input");

    function filtered() {
      return items.filter(function (o) {
        var ok = true;
        keys.forEach(function (k) {
          if (state.facets[k] && o[k] !== state.facets[k]) { ok = false; }
        });
        if (ok && state.text) {
          ok = (o.label || "").toLowerCase().indexOf(state.text) !== -1;
        }
        return ok;
      });
    }

    var vlist = makeVList(listEl, spacer, 58, function (o) {
      var row = el('<button type="button" class="tbo-vrow" data-object-id="' + esc(o.id) + '">' +
        '<span class="tbo-vrow-label">' + esc(o.label) + "</span>" +
        '<span class="tbo-vrow-tag"><span class="pm-badge" data-kind="muted">' + esc(human(o.typeLabel || "item")) + "</span></span>" +
        '<span class="tbo-vrow-sub">' + esc(cfg.rowSub ? cfg.rowSub(o) : "") + "</span></button>");
      row.addEventListener("click", function () { if (cfg.onOpen) { cfg.onOpen(o); } });
      return row;
    });

    function refresh() { vlist.setItems(filtered()); }
    wrap.querySelectorAll(".tbo-facet").forEach(function (f) {
      f.addEventListener("click", function () {
        var k = f.getAttribute("data-fk");
        var v = f.getAttribute("data-fv");
        var on = f.getAttribute("aria-pressed") === "true";
        wrap.querySelectorAll('.tbo-facet[data-fk="' + k + '"]').forEach(function (x) {
          x.setAttribute("aria-pressed", "false");
        });
        state.facets[k] = on ? null : v;
        f.setAttribute("aria-pressed", on ? "false" : "true");
        refresh();
      });
    });
    input.addEventListener("input", function () {
      state.text = input.value.trim().toLowerCase();
      refresh();
    });
    if (!items.length) {
      spacer.innerHTML = '<div class="tbo-hits-empty">' + esc(cfg.empty || "Nothing to show.") + "</div>";
    }
    refresh();
  }

  /* windowed virtual list (>60 rows stay cheap) */
  function makeVList(listEl, spacer, rowH, renderRow) {
    var items = [];
    var pool = [];
    function render() {
      var h = listEl.clientHeight || 460;
      var start = Math.max(0, Math.floor(listEl.scrollTop / rowH) - 4);
      var count = Math.ceil(h / rowH) + 8;
      var end = Math.min(items.length, start + count);
      spacer.style.blockSize = items.length * rowH + "px";
      spacer.innerHTML = "";
      pool = [];
      for (var k = start; k < end; k++) {
        var row = renderRow(items[k]);
        row.style.blockSize = rowH + "px";
        row.style.transform = "translateY(" + k * rowH + "px)";
        spacer.appendChild(row);
        pool.push(row);
      }
    }
    listEl.addEventListener("scroll", function () {
      if (!reducedMotion()) {
        if (listEl.__vraf) { return; }
        listEl.__vraf = true;
        requestAnimationFrame(function () { listEl.__vraf = false; render(); });
      } else {
        render();
      }
    });
    return {
      setItems: function (next) {
        items = next || [];
        listEl.scrollTop = 0;
        render();
      },
      refresh: render
    };
  }

  /* setup-sequence */
  function renderSetupMgr(body, m) {
    var steps = (m.subpages && m.subpages.length ? m.subpages : ["Prepare", "Configure", "Verify", "Finish"])
      .map(function (s) { return typeof s === "string" ? human(s) : (s.title || human(s.id)); });
    var wrap = el('<div class="tbo-steps"></div>');
    steps.forEach(function (s, idx) {
      var st = idx === 0 ? "active" : "todo";
      var row = el('<div class="tbo-step" data-state="' + st + '">' +
        '<span class="tbo-step-num">' + (idx + 1) + "</span>" +
        '<span class="tbo-step-title">' + esc(s) + "</span>" +
        '<span class="tbo-step-sub">' + (idx === 0 ? "In progress" : "Pending") + "</span>" +
        '<span class="tbo-step-act">' +
        (idx === 0 ? '<button type="button" class="pm-btn" data-size="s">Mark done</button>' : "") +
        "</span></div>");
      wrap.appendChild(row);
    });
    body.appendChild(wrap);
    wrap.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest("button") : null;
      if (!btn) { return; }
      var rows = wrap.querySelectorAll(".tbo-step");
      for (var k = 0; k < rows.length; k++) {
        if (rows[k].getAttribute("data-state") === "active") {
          rows[k].setAttribute("data-state", "done");
          rows[k].querySelector(".tbo-step-sub").textContent = "Done";
          rows[k].querySelector(".tbo-step-act").innerHTML = "";
          if (rows[k + 1]) {
            rows[k + 1].setAttribute("data-state", "active");
            rows[k + 1].querySelector(".tbo-step-sub").textContent = "In progress";
            rows[k + 1].querySelector(".tbo-step-act").innerHTML =
              '<button type="button" class="pm-btn" data-size="s">Mark done</button>';
          }
          break;
        }
      }
    });
  }

  /* health-projection */
  function renderHealthMgr(body, m) {
    var diags = OBJ.diagnostics() || [];
    var wrap = el('<div class="tbo-health-grid"></div>');
    var cards = diags.length ? diags.slice(0, 6) : [
      { label: "Core services", state: "ok" },
      { label: "Provider connections", state: "ok" },
      { label: "Workspace index", state: "ok" }
    ];
    cards.forEach(function (c) {
      var st = c.state || c.health || "ok";
      wrap.appendChild(el(kvCard(c.label || c.title || "Check", [
        ["State", '<span class="pm-healthdot" data-state="' + esc(st) + '"></span> ' + esc(human(st))],
        ["Detail", esc(c.detail || c.message || "Read-only status; no action needed")]
      ])));
    });
    body.appendChild(wrap);
    body.insertAdjacentHTML("beforeend",
      '<p class="tbo-group-note">Health is a read-only projection. Repairs run from the owning manager.</p>');
  }

  /* diagnostic-drawer */
  function renderDiagnosticMgr(body, m) {
    var diags = OBJ.diagnostics() || [];
    var lines = [];
    diags.forEach(function (d) {
      lines.push("[" + (d.state || "info") + "] " + (d.label || d.title || "check") +
        (d.message ? " — " + d.message : ""));
    });
    if (!lines.length) {
      lines = [
        "[info] Settings store opened for current project",
        "[info] Inventory projection loaded: 828 settings",
        "[info] Registry loaded: 39 managers across 12 domains",
        "[ok] No diagnostics require attention"
      ];
    }
    var log = el('<div class="tbo-logs pmv2-scroll" aria-label="Diagnostic log"></div>');
    lines.forEach(function (ln) {
      var div = document.createElement("div");
      div.textContent = ln;
      log.appendChild(div);
    });
    body.appendChild(log);
    var btn = el('<div class="tbo-copy-actions"><button type="button" class="pm-btn" data-size="s">Refresh log</button></div>');
    btn.querySelector("button").addEventListener("click", function () {
      var div = document.createElement("div");
      div.textContent = "[info] Log refreshed at fixed demo time 09:41:07";
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    });
    body.appendChild(btn);
  }

  /* transaction (backup / lifecycle / cleanup): preview -> confirm */
  function renderTransactionMgr(body, m) {
    var wrap = el("<div>" +
      '<div class="tbo-totals">' +
        '<div class="tbo-total" data-kind="add"><b>4</b><span>Items included</span></div>' +
        '<div class="tbo-total" data-kind="replace"><b>1</b><span>Will change</span></div>' +
        '<div class="tbo-total"><b>0</b><span>Unchanged</span></div>' +
      "</div>" +
      '<p class="tbo-group-note">Preview only. Nothing happens until you confirm; a restore point is created first.</p>' +
      '<div class="tbo-copy-actions">' +
        '<button type="button" class="pm-btn" data-kind="primary" data-tx="run">Preview and confirm</button>' +
      "</div>" +
      '<div class="tbo-op-slot"></div></div>');
    body.appendChild(wrap);
    wrap.querySelector('[data-tx="run"]').addEventListener("click", function () {
      runProviderOp(wrap.querySelector(".tbo-op-slot"), "update", m.title);
    });
  }

  function renderCopyMgrLink(body, m, sheet) {
    var wrap = el('<div><p class="tbo-group-note">Copy is a one-time transaction: preview, restore point, ' +
      "atomic apply, verify, receipt, optional rollback.</p>" +
      '<div class="tbo-copy-actions"><button type="button" class="pm-btn" data-kind="primary">Open copy transaction</button></div></div>');
    wrap.querySelector("button").addEventListener("click", function () { openCopy(sheet); });
    body.appendChild(wrap);
  }

  /* ---------- deferred owner shells ----------------------------------------- */
  function openOwnerShell(sheet, owner) {
    pushLayer(sheet, human(owner.family), function (host) {
      host.setAttribute("data-manager-id", owner.id);
      host.innerHTML = '<div class="tbo-owner">' +
        "<h3>" + esc(human(owner.family)) + "</h3>" +
        '<dl class="tbo-kv">' +
          "<dt>Owned by</dt><dd>" + esc(owner.owner) + "</dd>" +
          "<dt>Insertion destination</dt><dd>" + esc(owner.insertion || "This domain") + "</dd>" +
          "<dt>Returns to</dt><dd>" + esc(owner.returnContract || "The screen that opened it") + "</dd>" +
        "</dl>" +
        '<p class="tbo-group-note">This area is owned by ' + esc(owner.owner) +
        "; the demo shows the insertion point only.</p>" +
        "</div>";
    });
  }

  /* ---------- compendium (All Settings) -------------------------------------- */
  var allSettings = null;
  function compendiumItems() {
    if (allSettings) { return allSettings; }
    allSettings = [];
    var id;
    for (id in INV.settings) {
      if (INV.settings.hasOwnProperty(id)) { allSettings.push(INV.settings[id]); }
    }
    allSettings.sort(function (a, b) {
      return String(a.label).toLowerCase() < String(b.label).toLowerCase() ? -1 : 1;
    });
    return allSettings;
  }

  function openCompendium(sheet, focusSettingId) {
    var items = compendiumItems();
    var rec = pushLayer(sheet, "All Settings", function (host) {
      var state = { domain: null, exposure: null, state: null, type: null, text: "" };
      var facets = { domain: {}, exposure: {}, state: {}, type: {} };
      items.forEach(function (s) {
        if (s.domain) { facets.domain[s.domain] = true; }
        if (s.exposure) { facets.exposure[s.exposure] = true; }
        if (s.state) { facets.state[s.state] = true; }
        if (s.type) { facets.type[s.type] = true; }
      });
      var fh = '<div class="tbo-facets">';
      ["domain", "exposure", "state", "type"].forEach(function (k) {
        var vals = [];
        var v;
        for (v in facets[k]) { if (facets[k].hasOwnProperty(v)) { vals.push(v); } }
        vals.sort();
        vals.forEach(function (val) {
          var label = k === "domain" ? (REG.domainById(val) ? REG.domainById(val).title : human(val)) : human(val);
          fh += '<button type="button" class="tbo-facet" data-fk="' + k + '" data-fv="' + esc(val) +
            '" aria-pressed="false">' + esc(label) + "</button>";
        });
      });
      fh += "</div>";
      host.innerHTML =
        '<div class="tbo-mgr-head"><h2>' + icon("list") + "All Settings</h2>" +
        "<p>The complete long-tail index: " + items.length +
        " settings for the current project. Filter by facet or text; the list is virtualized.</p></div>" +
        fh +
        '<div class="tbo-comp-filter"><span class="pm-text"><input type="text" placeholder="Filter by name" aria-label="Filter settings by name"></span>' +
        '<span class="tbo-group-note" data-comp-count></span></div>' +
        '<div class="tbo-vlist pmv2-scroll" style="max-block-size:480px"><div class="tbo-vlist-spacer"></div></div>';

      var listEl = host.querySelector(".tbo-vlist");
      var spacer = host.querySelector(".tbo-vlist-spacer");
      var countEl = host.querySelector("[data-comp-count]");
      var input = host.querySelector("input");

      function filtered() {
        return items.filter(function (s) {
          if (state.domain && s.domain !== state.domain) { return false; }
          if (state.exposure && s.exposure !== state.exposure) { return false; }
          if (state.state && s.state !== state.state) { return false; }
          if (state.type && s.type !== state.type) { return false; }
          if (state.text && String(s.label).toLowerCase().indexOf(state.text) === -1) { return false; }
          return true;
        });
      }

      var vlist = makeVList(listEl, spacer, 58, function (s) {
        var dom = REG.domainById(s.domain);
        var row = el('<button type="button" class="tbo-vrow" data-setting-id="' + esc(s.id) + '">' +
          '<span class="tbo-vrow-label">' + esc(s.label) + "</span>" +
          '<span class="tbo-vrow-tag"><span class="pm-badge" data-kind="' +
            (s.state === "custom" ? "accent" : s.state === "managed" ? "managed" : "muted") + '">' +
            esc(human(s.state || "default")) + "</span></span>" +
          '<span class="tbo-vrow-sub">' + esc((dom ? dom.title : human(s.domain)) + " · " + human(s.exposure || "common")) +
          "</span></button>");
        row.addEventListener("click", function () {
          navigateToSetting(s, null);
        });
        return row;
      });

      function refresh() {
        var f = filtered();
        countEl.textContent = f.length + " of " + items.length + " settings";
        vlist.setItems(f);
      }
      host.querySelectorAll(".tbo-facet").forEach(function (f) {
        f.addEventListener("click", function () {
          var k = f.getAttribute("data-fk");
          var v = f.getAttribute("data-fv");
          var on = f.getAttribute("aria-pressed") === "true";
          host.querySelectorAll('.tbo-facet[data-fk="' + k + '"]').forEach(function (x) {
            x.setAttribute("aria-pressed", "false");
          });
          state[k] = on ? null : v;
          f.setAttribute("aria-pressed", on ? "false" : "true");
          refresh();
        });
      });
      input.addEventListener("input", function () {
        state.text = input.value.trim().toLowerCase();
        refresh();
      });
      refresh();
    });
    if (focusSettingId) {
      setTimeout(function () {
        var row = rec.el.querySelector('[data-setting-id="' + focusSettingId + '"]');
        if (row) { locate(row); }
      }, 60);
    }
    return rec;
  }

  /* ---------- copy transaction (adjacent panes) ------------------------------ */
  function openCopy(sheet) {
    var engine;
    try {
      engine = new window.PM_V2_COPY.CopyEngine(store, INV, REG);
    } catch (e) {
      try { engine = window.PM_V2_COPY.CopyEngine(store, INV, REG); } catch (e2) { engine = null; }
    }
    if (!engine) { return null; }

    var step = "source";
    var selectedCats = [];
    var preview = null;

    var rec = pushLayer(sheet, "Copy Settings", function (host) {
      host.innerHTML =
        '<div class="tbo-mgr-head"><h2>' + icon("copy") + "Copy Settings From Another Project</h2>" +
        "<p>A one-time transaction into the current project, <strong>" + esc(projectName()) +
        "</strong>: preview, restore point, atomic apply, verify, receipt. No sync.</p></div>" +
        '<div class="tbo-copy-steps"></div>' +
        '<div class="tbo-copy-stage"></div>';
    });

    var stage = rec.el.querySelector(".tbo-copy-stage");
    var stepsEl = rec.el.querySelector(".tbo-copy-steps");
    paint();

    function paintSteps() {
      var order = ["source", "categories", "preview", "confirm", "receipt"];
      var labels = ["Source project", "Categories", "Preview", "Confirm", "Receipt"];
      var activeIdx = order.indexOf(step === "failed" ? "confirm" : step);
      var html = "";
      order.forEach(function (s, idx) {
        html += '<span class="tbo-copy-step"' +
          (idx === activeIdx ? ' aria-current="step"' : "") +
          (idx < activeIdx ? ' data-done="true"' : "") + "><b>" +
          (idx < activeIdx ? "✓" : (idx + 1)) + "</b>" + esc(labels[idx]) + "</span>";
        if (idx < order.length - 1) { html += '<span class="tbo-copy-step-sep"></span>'; }
      });
      stepsEl.innerHTML = html;
    }

    function paint() {
      paintSteps();
      if (step === "source" || step === "categories") { paintAdjacent(); }
      else if (step === "preview" || step === "confirm") { paintPreview(); }
      else if (step === "receipt") { paintReceipt(false); }
      else if (step === "failed") { paintReceipt(true); }
    }

    /* adjacent panes: source project next to categories */
    function paintAdjacent() {
      var sources = [];
      try { sources = engine.sources(); } catch (e) { sources = []; }
      var cats = REG.COPY_CATEGORIES || [];
      var html = '<div class="tbo-copy-panes">' +
        '<div class="tbo-copy-pane"><div class="tbo-copy-pane-h">Source project' +
          '<span class="tbo-copy-pane-note">Pick one</span></div>' +
          '<div class="tbo-copy-pane-body pmv2-scroll">';
      sources.forEach(function (s) {
        var sid = s.id || s;
        var name = s.name || s.title || s;
        var on = engine.sourceId === sid || engine.source === sid;
        html += '<button type="button" class="tbo-src-row" data-src="' + esc(sid) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
          '<span class="tbo-src-name">' + esc(name) + "</span>" +
          '<span class="pm-badge" data-kind="muted">' + esc(s.settings != null ? s.settings + " settings" : "project") + "</span>" +
          '<span class="tbo-src-meta">' + esc(s.meta || s.note || "") + "</span></button>";
      });
      html += '</div></div>' +
        '<div class="tbo-copy-pane"><div class="tbo-copy-pane-h">Categories to copy' +
          '<span class="tbo-copy-pane-note">Choose any</span></div>' +
          '<div class="tbo-copy-pane-body pmv2-scroll">';
      cats.forEach(function (c) {
        var on = selectedCats.indexOf(c.id) !== -1;
        html += '<button type="button" class="tbo-cat-row" data-cat="' + esc(c.id) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
          '<span class="tbo-cat-check"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS.check + "</svg></span>" +
          '<span class="tbo-cat-title">' + esc(c.title) + "</span>" +
          '<span class="pm-badge" data-kind="muted">' + (c.domains ? c.domains.length : 0) + " domains</span>" +
          '<span class="tbo-cat-note">' + esc(c.note || "") + "</span></button>";
      });
      html += '</div></div></div>' +
        '<div class="tbo-copy-actions">' +
          '<button type="button" class="pm-btn" data-kind="primary" data-next disabled>Build preview</button>' +
          '<span class="tbo-copy-count" data-count></span>' +
        "</div>" +
        '<div class="tbo-copy-error" data-error></div>';
      stage.innerHTML = html;

      function refreshNext() {
        var hasSource = false;
        try { hasSource = !!(engine.sourceId || engine.source); } catch (e) { }
        var btn = stage.querySelector("[data-next]");
        btn.disabled = !(hasSource && selectedCats.length);
        stage.querySelector("[data-count]").textContent =
          selectedCats.length + " categor" + (selectedCats.length === 1 ? "y" : "ies") + " selected";
      }

      stage.querySelectorAll("[data-src]").forEach(function (b) {
        b.addEventListener("click", function () {
          try { engine.selectSource(b.getAttribute("data-src")); } catch (e) { }
          stage.querySelectorAll("[data-src]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
          step = "categories";
          paintSteps();
          refreshNext();
        });
      });
      stage.querySelectorAll("[data-cat]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-cat");
          var ix = selectedCats.indexOf(id);
          if (ix === -1) { selectedCats.push(id); } else { selectedCats.splice(ix, 1); }
          b.setAttribute("aria-pressed", ix === -1 ? "true" : "false");
          try { engine.setCategories(selectedCats.slice()); } catch (e) { }
          refreshNext();
        });
      });
      stage.querySelector("[data-next]").addEventListener("click", function () {
        try {
          engine.setCategories(selectedCats.slice());
          preview = engine.buildPreview();
          step = "preview";
          paint();
        } catch (e) {
          stage.querySelector("[data-error]").textContent =
            "Preview failed: " + (e && e.message ? e.message : "unknown error");
        }
      });
      refreshNext();
    }

    function paintPreview() {
      var t = preview && preview.totals ? preview.totals : { add: 0, replace: 0, unchanged: 0, unavailable: 0, conflict: 0 };
      var html = '<div class="tbo-totals">' +
        '<div class="tbo-total" data-kind="add"><b>' + t.add + "</b><span>Add</span></div>" +
        '<div class="tbo-total" data-kind="replace"><b>' + t.replace + "</b><span>Replace</span></div>" +
        '<div class="tbo-total"><b>' + t.unchanged + "</b><span>Unchanged</span></div>" +
        '<div class="tbo-total" data-kind="unavailable"><b>' + t.unavailable + "</b><span>Unavailable</span></div>" +
        '<div class="tbo-total" data-kind="conflict"><b>' + t.conflict + "</b><span>Conflicts</span></div>" +
        "</div>";
      if (preview && preview.credentialPolicy) {
        html += '<p class="tbo-group-note">Credential policy: ' + esc(preview.credentialPolicy) + "</p>";
      }
      if (preview && preview.groups) {
        html += '<div class="tbo-table-card"><div class="tbo-copy-pane-body pmv2-scroll" style="max-block-size:300px">';
        var kind;
        for (kind in preview.groups) {
          if (preview.groups.hasOwnProperty(kind) && preview.groups[kind].length) {
            html += '<h4 class="tbo-group-h" style="padding:8px 12px 0">' + esc(human(kind)) + "</h4>";
            preview.groups[kind].slice(0, 12).forEach(function (it) {
              html += '<div class="tbo-recent-row"><span>' + esc(it.label || it.id || "Setting") + "</span>" +
                '<span class="tbo-recent-time">' + esc(human(kind)) + "</span></div>";
            });
            if (preview.groups[kind].length > 12) {
              html += '<div class="tbo-group-note" style="padding:0 12px 8px">and ' +
                (preview.groups[kind].length - 12) + " more&hellip;</div>";
            }
          }
        }
        html += "</div></div>";
      }
      html += '<div class="tbo-copy-actions">' +
        '<button type="button" class="pm-btn" data-back>Back to categories</button>' +
        '<button type="button" class="pm-btn" data-kind="primary" data-apply>Create restore point and apply</button>' +
        "</div>" +
        '<div class="tbo-op-slot"></div>' +
        '<div class="tbo-copy-error" data-error></div>';
      stage.innerHTML = html;
      if (step === "preview") { step = "confirm"; paintSteps(); }
      stage.querySelector("[data-back]").addEventListener("click", function () {
        step = "categories";
        paint();
      });
      stage.querySelector("[data-apply]").addEventListener("click", function () {
        var btn = stage.querySelector("[data-apply]");
        btn.disabled = true;
        btn.textContent = "Applying\u2026";
        var op = null;
        try { op = engine.apply(); } catch (e) { op = null; }
        var slot = stage.querySelector(".tbo-op-slot");
        slot.innerHTML = '<div class="tbo-op-card pm-notice" data-kind="info">' +
          '<span class="pm-notice-title">Applying copied settings</span>' +
          '<span class="tbo-op-phase">Creating restore point\u2026</span></div>';
        var phaseEl = slot.querySelector(".tbo-op-phase");
        var phases = ["Creating restore point", "Applying atomically", "Verifying", "Writing receipt"];
        var k = 0;
        function tick() {
          if (k < phases.length) {
            phaseEl.textContent = phases[k] + "\u2026";
            k++;
            setTimeout(tick, 300);
          } else {
            var st = "receipt";
            try {
              var recs = store.receipts();
              if (!recs || !recs.length) { st = "receipt"; }
            } catch (e) { }
            step = st;
            paint();
          }
        }
        setTimeout(tick, 300);
      });
    }

    function paintReceipt(failed) {
      var receipts = [];
      try { receipts = store.receipts() || []; } catch (e) { }
      var last = receipts.length ? receipts[receipts.length - 1] : null;
      var t = preview && preview.totals ? preview.totals : null;
      var html;
      if (failed) {
        html = '<div class="tbo-receipt" style="border-color:color-mix(in srgb, var(--pm-danger) 45%, var(--pm-line))">' +
          "<h3>" + icon("warn") + "Copy failed safely</h3>" +
          "<p>Nothing was applied. The restore point is untouched.</p></div>";
      } else {
        html = '<div class="tbo-receipt"><h3>' + icon("check") + "Copy complete</h3>" +
          "<p>" + (t
            ? t.add + " added, " + t.replace + " replaced, " + t.unchanged + " unchanged, " +
              t.unavailable + " unavailable, " + t.conflict + " conflicts."
            : "Settings copied into the current project.") + "</p>" +
          (last && last.id ? "<p>Receipt " + esc(last.id) + (last.label ? " — " + esc(last.label) : "") + "</p>" : "") +
          '<div class="tbo-copy-actions">' +
            '<button type="button" class="pm-btn" data-rollback>Rollback to restore point</button>' +
            '<button type="button" class="pm-btn" data-done>Done</button>' +
          "</div></div>";
      }
      stage.innerHTML = html;
      var rb = stage.querySelector("[data-rollback]");
      if (rb) {
        rb.addEventListener("click", function () {
          try { engine.rollback(); } catch (e) { }
          rb.disabled = true;
          rb.textContent = "Rolled back";
        });
      }
      var dn = stage.querySelector("[data-done]");
      if (dn) {
        dn.addEventListener("click", function () { popLayer(sheet); });
      }
    }

    return rec;
  }

  /* ---------- universal search ------------------------------------------------ */
  var searchOpen = false;
  var lastResults = [];
  var activeHit = -1;
  var lastQuery = "";

  function mark(text, q) {
    var t = esc(text);
    if (!q) { return t; }
    var ix = String(text).toLowerCase().indexOf(q.toLowerCase());
    if (ix === -1) { return t; }
    return esc(String(text).slice(0, ix)) + "<mark>" +
      esc(String(text).slice(ix, ix + q.length)) + "</mark>" +
      esc(String(text).slice(ix + q.length));
  }

  var TYPE_LABELS = {
    setting: "Setting",
    manager: "Manager",
    managed_object: "Object",
    action: "Action",
    setup_or_repair_workflow: "Workflow",
    diagnostic_or_read_only_status: "Status",
    unavailable_capability: "Unavailable",
    intentional_help_result: "Help"
  };

  function renderResults(results, meta, showAll) {
    lastResults = results || [];
    activeHit = results && results.length ? 0 : -1;
    var html = "";
    if (!lastResults.length) {
      html = '<div class="tbo-hits-empty">No matches for &ldquo;' + esc(meta.query || lastQuery) +
        "&rdquo;. Try a setting name, a manager, or a provider.</div>";
    } else {
      var groups = {};
      var order = [];
      lastResults.forEach(function (r) {
        var t = r.type || "setting";
        if (!groups[t]) { groups[t] = []; order.push(t); }
        groups[t].push(r);
      });
      order.forEach(function (t) {
        html += '<div class="tbo-hits-group"><div class="tbo-hits-group-h">' + esc(TYPE_LABELS[t] || human(t)) + "</div>";
        groups[t].forEach(function (r) {
          var idx = lastResults.indexOf(r);
          html += '<button type="button" class="tbo-hit" role="option" data-result-id="' + esc(r.immutableResultId) +
            '" data-idx="' + idx + '" aria-selected="' + (idx === activeHit ? "true" : "false") +
            '"' + (idx === activeHit ? ' data-active="true"' : "") + ">" +
            '<span class="tbo-hit-label">' + mark(r.label, meta.query || lastQuery) + "</span>" +
            '<span class="tbo-hit-kind">' + esc(TYPE_LABELS[t] || human(t)) + "</span>" +
            '<span class="tbo-hit-path">' + esc(r.path || "") + "</span>" +
            (r.availability ? '<span class="tbo-hit-avail">' + esc(r.availability) + "</span>" : "") +
            "</button>";
        });
        html += "</div>";
      });
      if (meta.bounded && !showAll) {
        html += '<button type="button" class="tbo-hits-more" data-show-all>View all ' + meta.total + " results</button>";
      }
    }
    html += '<div class="tbo-hits-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span>' +
      "<span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>";
    resultsEl.innerHTML = html;

    resultsEl.querySelectorAll(".tbo-hit").forEach(function (hit) {
      hit.addEventListener("click", function () {
        chooseResult(hit.getAttribute("data-result-id"));
      });
      hit.addEventListener("mousemove", function () {
        setActiveHit(parseInt(hit.getAttribute("data-idx"), 10));
      });
    });
    var more = resultsEl.querySelector("[data-show-all]");
    if (more) {
      more.addEventListener("click", function () {
        searchAllSession.query(lastQuery, function (rs, mt) {
          renderResults(rs, { query: lastQuery, total: mt.total, bounded: false }, true);
        });
      });
    }
  }

  function setActiveHit(idx) {
    if (!lastResults.length) { return; }
    activeHit = (idx + lastResults.length) % lastResults.length;
    resultsEl.querySelectorAll(".tbo-hit").forEach(function (hit) {
      var on = parseInt(hit.getAttribute("data-idx"), 10) === activeHit;
      hit.setAttribute("aria-selected", on ? "true" : "false");
      if (on) { hit.setAttribute("data-active", "true"); scrollToEl(hit); }
      else { hit.removeAttribute("data-active"); }
    });
  }

  function openSearch() {
    searchOpen = true;
    resultsEl.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }
  function closeSearch() {
    searchOpen = false;
    resultsEl.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
  }

  searchInput.addEventListener("input", function () {
    var q = searchInput.value;
    lastQuery = q;
    searchClear.hidden = !q;
    if (!q.trim()) { closeSearch(); return; }
    searchSession.query(q, function (results, meta) {
      if (searchInput.value !== q) { return; }   /* latest-request-wins guard */
      renderResults(results, meta || { query: q, total: results.length, bounded: false });
      openSearch();
    });
  });
  searchInput.addEventListener("focus", function () {
    if (searchInput.value.trim() && lastResults.length) { openSearch(); }
  });
  searchInput.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowDown" && searchOpen) { ev.preventDefault(); setActiveHit(activeHit + 1); }
    else if (ev.key === "ArrowUp" && searchOpen) { ev.preventDefault(); setActiveHit(activeHit - 1); }
    else if (ev.key === "Enter" && searchOpen && activeHit >= 0 && lastResults[activeHit]) {
      ev.preventDefault();
      chooseResult(lastResults[activeHit].immutableResultId);
    } else if (ev.key === "Escape" && searchOpen) {
      ev.stopPropagation();
      closeSearch();
    }
  });
  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    lastQuery = "";
    searchClear.hidden = true;
    closeSearch();
    searchInput.focus();
  });
  document.addEventListener("pointerdown", function (ev) {
    if (searchOpen && !searchWrap.contains(ev.target)) { closeSearch(); }
  });

  function restoreSearchUI(query, resultId) {
    searchInput.value = query;
    lastQuery = query;
    searchClear.hidden = !query;
    searchSession.query(query, function (results, meta) {
      renderResults(results, meta || { query: query, total: results.length, bounded: false });
      openSearch();
      lastResults.forEach(function (r, idx) {
        if (r.immutableResultId === resultId) { setActiveHit(idx); }
      });
    });
  }

  function chooseResult(immutableResultId) {
    var entry;
    try { entry = window.PM_V2_SEARCH.resolve(searchIndex, immutableResultId); } catch (e) { entry = null; }
    if (!entry) { return; }
    closeSearch();
    try { store.saveSearchState(lastQuery, immutableResultId); } catch (e) { }
    navigateToEntry(entry);
    try { searchInput.blur(); } catch (e) { }
  }

  /* ---------- deep-link navigation ------------------------------------------ */
  function navigateToEntry(entry) {
    var dest = entry.destination || {};
    var domainId = dest.domain || (entry.settingId && settingById(entry.settingId)
      ? settingById(entry.settingId).domain : null);
    var tabId = domainId && catByDomain[domainId] !== undefined ? domainId : null;
    if (!tabId) {
      /* help / action results without a domain land on Home */
      tabId = "home";
    }
    var sheet = getSheet(tabId);
    activateTab(tabId);
    popToBase(sheet);

    var depthBefore = sheet.stack.length;

    var rowId = dest.row || entry.settingId || null;
    var rowSetting = rowId ? settingById(rowId) : null;

    var managerId = dest.manager || null;
    if (!managerId && dest.page) {
      /* Resolve page -> manager only when it would not strand a base-page
         setting row: a real row in a domain subgroup (e.g. extensions
         subgroup "commands") wins over the same-named manager. */
      var rowOnBasePage = false;
      if (rowSetting && rowSetting.domain === tabId && catByDomain[tabId]) {
        catByDomain[tabId].subgroups.forEach(function (sg) {
          if (sg.id === dest.page && sg.settings.indexOf(rowSetting.id) !== -1) { rowOnBasePage = true; }
        });
      }
      if (!rowOnBasePage) {
        try {
          var maybe = REG.managerById(dest.page);
          if (maybe) { managerId = maybe.id; }
        } catch (e) { }
      }
    }

    var located = null;

    if (managerId) {
      var mrec = openManager(sheet, managerId, {
        objectId: dest.object || null,
        section: dest.section || null,
        subpage: dest.section || dest.page || null,
        locate: !dest.object
      });
      if (!dest.object && mrec) {
        located = mrec.el.querySelector("[data-manager-id]");
      }
    } else if (dest.section && sheet.subtabsEl) {
      selectSubgroup(sheet, dest.section);
    }

    if (!managerId && rowId) {
      if (rowSetting) { ensureSubgroupFor(sheet, rowSetting); }
      located = sheet.el.querySelector('[data-setting-id="' + rowId + '"]');
    } else if (managerId && rowId) {
      var topRowLayer = sheet.stack[sheet.stack.length - 1];
      located = topRowLayer.el.querySelector('[data-setting-id="' + rowId + '"]');
    }
    if (!located && dest.object) {
      /* scope to the ACTIVE (top) layer: the roster row in the hidden parent
         layer must never steal highlight/focus from the object detail */
      var topObjLayer = sheet.stack[sheet.stack.length - 1];
      located = topObjLayer.el.querySelector('[data-object-id="' + dest.object + '"]');
    }
    if (located) { locate(located); }

    pendingSearchRestore = {
      tabId: tabId,
      depth: sheet.stack.length,
      query: lastQuery,
      resultId: entry.immutableResultId
    };
  }

  function ensureSubgroupFor(sheet, setting) {
    if (!sheet.subtabsEl || !sheet.tab.domain) { return; }
    var cat = catByDomain[sheet.tab.domain.id];
    if (!cat) { return; }
    for (var k = 0; k < cat.subgroups.length; k++) {
      if (cat.subgroups[k].settings.indexOf(setting.id) !== -1) {
        if (sheet.activeSubgroup !== cat.subgroups[k].id) {
          selectSubgroup(sheet, cat.subgroups[k].id);
        }
        return;
      }
    }
  }

  function navigateToSetting(setting, viaEntry) {
    var tabId = setting.domain;
    if (!catByDomain.hasOwnProperty(tabId)) {
      var d0 = domains[0];
      tabId = d0.id;
    }
    var sheet = getSheet(tabId);
    activateTab(tabId);
    popToBase(sheet);
    ensureSubgroupFor(sheet, setting);
    var row = sheet.el.querySelector('[data-setting-id="' + setting.id + '"]');
    if (row) { locate(row); }
  }

  /* ---------- scenario drawer + banner --------------------------------------- */
  var scrim = document.getElementById("tbo-scrim");
  var drawer = document.getElementById("tbo-demo");
  var drawerList = document.getElementById("tbo-demo-list");

  function openScenarioDrawer() {
    drawer.hidden = false;
    scrim.hidden = false;
    var opener = document.querySelector("[data-demo-open]");
    if (opener) { opener.setAttribute("aria-expanded", "true"); }
  }
  function closeScenarioDrawer() {
    drawer.hidden = true;
    scrim.hidden = true;
    var opener = document.querySelector("[data-demo-open]");
    if (opener) { opener.setAttribute("aria-expanded", "false"); }
  }

  (function buildDrawer() {
    var scenarios = [];
    try { scenarios = store.scenarios() || []; } catch (e) { scenarios = []; }
    if (!scenarios.length) { scenarios = ["default", "fresh-project", "managed-team", "offline"]; }
    var html = "";
    scenarios.forEach(function (s) {
      var name = typeof s === "string" ? s : (s.id || s.name || s.label);
      var label = typeof s === "string" ? human(s) : (s.label || s.title || human(name));
      var desc = typeof s === "object" ? (s.desc || s.description || "") : "";
      html += '<button type="button" class="pm-btn tbo-demo-choice" data-scenario="' + esc(name) + '" ' +
        'style="justify-content:flex-start">' + esc(label) +
        (desc ? ' <span class="tbo-related-sub">&mdash; ' + esc(desc) + "</span>" : "") + "</button>";
    });
    drawerList.innerHTML = html;
    drawerList.querySelectorAll("[data-scenario]").forEach(function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-scenario");
        var cur = null;
        try { cur = store.activeScenario(); } catch (e) { }
        try { store.setScenario(cur === name ? null : name); } catch (e) { }
        closeScenarioDrawer();
      });
    });
    var opener = document.querySelector("[data-demo-open]");
    if (opener) { opener.addEventListener("click", function () {
      if (drawer.hidden) { openScenarioDrawer(); } else { closeScenarioDrawer(); }
    }); }
    scrim.addEventListener("click", closeScenarioDrawer);
  })();

  function refreshScenarioBanner() {
    var active = null;
    try { active = store.activeScenario(); } catch (e) { active = null; }
    if (active) {
      var proj = null;
      try { proj = store.projection("settings"); } catch (e2) { proj = null; }
      scenarioBar.setAttribute("data-on", "true");
      scenarioText.textContent = "Scenario active: " +
        human(typeof active === "string" ? active : (active.label || active.id || active.name)) + ". " +
        (proj && proj.message ? proj.message : "Fixtures may override some values.");
    } else {
      scenarioBar.setAttribute("data-on", "false");
      scenarioText.textContent = "";
    }
  }
  scenarioBar.querySelector("[data-scenario-clear]").addEventListener("click", function () {
    try { store.setScenario(null); } catch (e) { }
    refreshScenarioBanner();
  });
  try {
    store.subscribe(function () { refreshScenarioBanner(); });
  } catch (e) { }
  refreshScenarioBanner();

  /* ---------- global keys / resize ------------------------------------------- */
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") { return; }
    if (searchOpen) { closeSearch(); return; }
    if (!drawer.hidden) { closeScenarioDrawer(); return; }
    var sheet = sheets[activeTabId];
    if (sheet && sheet.stack.length > 1) { popLayer(sheet); return; }
    if (activeTabId !== "home") { activateTab("home"); }
  });
  window.addEventListener("resize", function () {
    positionTabIndicator();
    updateOverflow();
    var k;
    for (k in sheets) {
      if (sheets.hasOwnProperty(k)) { positionSubIndicator(sheets[k]); }
    }
  });
  /* shell width presets resize the frame without a window resize: observe it */
  if (window.ResizeObserver) {
    var frameRO = new ResizeObserver(function () {
      positionTabIndicator();
      updateOverflow();
      updateNarrowbar();
      var k;
      for (k in sheets) {
        if (sheets.hasOwnProperty(k)) { positionSubIndicator(sheets[k]); }
      }
    });
    frameRO.observe(root);
  }

  /* ---------- init ------------------------------------------------------------ */
  if (window.PMShell && window.PMShell.init) { window.PMShell.init(); }
  activateTab("home");
  setTimeout(function () { positionTabIndicator(); updateOverflow(); positionSubIndicator(getSheet(activeTabId)); }, 50);
})();
