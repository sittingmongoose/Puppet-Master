/* ============================================================================
   Concept 10 — Command Suite (rethemed) · kimi-k3
   ----------------------------------------------------------------------------
   A keyboard-first command suite: a persistent command header (path bar +
   status line + universal search), a miller-column pane stack that drills
   domains → pages/objects → detail, and a shortcut hints bar. Every keyboard
   path is also reachable by pointer. Vanilla JS, no frameworks.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- guards ------------------------------------------------------ */
  var root = document.getElementById("cs-root");
  if (!root) return;
  if (typeof PM_V2_STORE === "undefined" || typeof PM_V2_INVENTORY === "undefined" ||
      typeof PM_V2_REGISTRY === "undefined") return;

  var INV = PM_V2_INVENTORY;
  var REG = PM_V2_REGISTRY;
  var OBJ = (typeof PM_V2_OBJECTS !== "undefined") ? PM_V2_OBJECTS : null;
  var CORE = (typeof PM_CORE_DATA !== "undefined") ? PM_CORE_DATA : null;
  var store = PM_V2_STORE.for("concept-10-command-suite");

  var FIXED_NOW = "2026-08-18 14:30";

  /* ---------- tiny DOM helpers -------------------------------------------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); return n; }
  function icon(d) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.style.inlineSize = "14px";
    s.style.blockSize = "14px";
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", d);
    s.appendChild(p);
    return s;
  }
  var ICON_BACK = "M15 5l-7 7 7 7";
  var ICON_NEXT = "M9 5l7 7-7 7";
  var ICON_SEARCH = "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-3.5-3.5";
  function humanize(s) {
    s = String(s == null ? "" : s);
    s = s.replace(/[_-]+/g, " ").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function tryCall(fn, ctx, a, b, c) {
    if (typeof fn !== "function") return undefined;
    try { return fn.call(ctx, a, b, c); } catch (e) { return undefined; }
  }

  /* ---------- registry / inventory accessors ------------------------------- */
  function domains() { return REG.DOMAINS || []; }
  function domainById(id) {
    var d = tryCall(REG.domainById, REG, id);
    if (d) return d;
    var list = domains();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function managersByDomain(id) {
    var m = tryCall(REG.managersByDomain, REG, id);
    if (m && m.length !== undefined) return m;
    var out = [], all = REG.MANAGERS || [];
    for (var i = 0; i < all.length; i++) if (all[i].domain === id) out.push(all[i]);
    return out;
  }
  function managerById(id) {
    var m = tryCall(REG.managerById, REG, id);
    if (m) return m;
    var all = REG.MANAGERS || [];
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function deferredForDomain(id) {
    var out = [], all = REG.DEFERRED_OWNERS || [];
    for (var i = 0; i < all.length; i++) if (all[i].domain === id) out.push(all[i]);
    return out;
  }
  function categoryFor(domainId) {
    var cats = INV.categories || [];
    for (var i = 0; i < cats.length; i++) if (cats[i].id === domainId) return cats[i];
    return null;
  }
  function settingById(id) { return (INV.settings || {})[id] || null; }
  function subgroupSettings(sg) {
    var out = [], ids = (sg && sg.settings) || [];
    for (var i = 0; i < ids.length; i++) {
      var s = settingById(ids[i]);
      if (s) out.push(s);
    }
    return out;
  }
  function domainSettings(domainId) {
    var cat = categoryFor(domainId), out = [];
    if (!cat) return out;
    var sgs = cat.subgroups || [];
    for (var i = 0; i < sgs.length; i++) out = out.concat(subgroupSettings(sgs[i]));
    return out;
  }
  function domainSettingCount(domainId) {
    var cat = categoryFor(domainId), n = 0;
    if (!cat) return 0;
    var sgs = cat.subgroups || [];
    for (var i = 0; i < sgs.length; i++) n += ((sgs[i].settings || []).length);
    return n;
  }
  function allSettingsList() {
    var out = [], map = INV.settings || {};
    for (var k in map) if (map.hasOwnProperty(k)) out.push(map[k]);
    out.sort(function (a, b) {
      var x = (a.label || a.id), y = (b.label || b.id);
      return x < y ? -1 : (x > y ? 1 : 0);
    });
    return out;
  }
  function rosters() {
    if (!OBJ || typeof OBJ.objects !== "function") return {};
    try { return OBJ.objects() || {}; } catch (e) { return {}; }
  }
  function rosterFor(manager) {
    if (!manager || !manager.objectSource) return [];
    var r = rosters()[manager.objectSource];
    return r && r.length !== undefined ? r : [];
  }
  function findManagerByObjectSource(src) {
    var all = REG.MANAGERS || [];
    for (var i = 0; i < all.length; i++) if (all[i].objectSource === src) return all[i];
    return null;
  }
  function isProvidersManager(manager) {
    if (!manager) return false;
    if (manager.objectSource === "providers") return true;
    return /provider/i.test(String(manager.id) + " " + String(manager.title));
  }
  function providers() {
    return (CORE && CORE.providers && CORE.providers.length !== undefined) ? CORE.providers : [];
  }
  function subpageId(sp, i) {
    /* subpages are display strings ("Rate Limits"); normalize to the same slug
       form search destinations use ("rate-limits") so selection state compares equal */
    var raw = (sp && typeof sp === "object") ? (sp.id || sp.key || ("subpage-" + i)) : String(sp);
    return String(raw).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function subpageTitle(sp, i) {
    if (sp && typeof sp === "object") return sp.title || sp.label || humanize(sp.id || ("Section " + (i + 1)));
    return humanize(sp);
  }

  /* ---------- store wrappers ------------------------------------------------ */
  function projectName() {
    var p = tryCall(store.currentProject, store);
    if (!p) return "Current Project";
    if (typeof p === "string") return p;
    return p.name || p.title || p.id || "Current Project";
  }
  function storeValue(st) {
    var base = (st.value !== undefined) ? st.value : st["default"];
    var v = tryCall(store.value, store, st.id, base);
    return (v === undefined) ? base : v;
  }
  function setValue(id, v) { tryCall(store.setValue, store, id, v); }
  function resetValue(id) { tryCall(store.resetValue, store, id); }
  function overridesMap() {
    var o = tryCall(store.overrides, store);
    return o || {};
  }
  function isOverridden(id) {
    var o = overridesMap();
    if (o.length !== undefined) { // array form
      for (var i = 0; i < o.length; i++) if (o[i] === id || (o[i] && o[i].id === id)) return true;
      return false;
    }
    return !!o[id];
  }
  function overrideCount() {
    var o = overridesMap(), n = 0;
    if (o.length !== undefined) return o.length;
    for (var k in o) if (o.hasOwnProperty(k)) n++;
    return n;
  }
  function scenarioList() {
    var s = tryCall(store.scenarios, store);
    return (s && s.length !== undefined) ? s : [];
  }
  function scenarioName(s) {
    if (s && typeof s === "object") return s.name || s.id || s.label || "scenario";
    return String(s);
  }
  function activeScenarioName() {
    var a = tryCall(store.activeScenario, store);
    return a ? scenarioName(a) : "";
  }
  function addReceipt(r) {
    r.at = r.at || FIXED_NOW;
    tryCall(store.addReceipt, store, r);
  }
  function createRestorePoint(label) {
    return tryCall(store.createRestorePoint, store, label);
  }
  function projectionFor(surfaceId) {
    var p = tryCall(store.projection, store, surfaceId);
    return p || null;
  }

  /* ---------- ObservableWork wrapper ---------------------------------------- */
  function workApi() {
    if (typeof store.begin === "function") return store;
    if (store.work && typeof store.work.begin === "function") return store.work;
    if (store.ObservableWork && typeof store.ObservableWork.begin === "function") return store.ObservableWork;
    return null;
  }
  /* Runs a deterministic demo operation: real store work when available,
     with a calm phase animation in the panel. done(op) fires at the end. */
  function runWork(panelHost, spec, done) {
    var api = workApi();
    var op = null;
    if (api) op = tryCall(api.begin, api, spec);
    var box = el("div", "cs-op");
    var title = el("strong", null, spec.title || "Working");
    var phases = el("div", "cs-op-phases");
    var phaseEls = [];
    var names = spec.phases || ["Work"];
    for (var i = 0; i < names.length; i++) {
      var ph = el("span", "cs-op-phase", names[i]);
      ph.setAttribute("data-status", "pending");
      phases.appendChild(ph);
      phaseEls.push(ph);
    }
    var bar = el("div", "cs-op-bar");
    var fill = el("span");
    fill.style.inlineSize = "4%";
    bar.appendChild(fill);
    box.appendChild(title);
    box.appendChild(phases);
    box.appendChild(bar);
    if (panelHost) panelHost.appendChild(box);
    var step = 0;
    function tick() {
      if (step > 0) {
        phaseEls[step - 1].setAttribute("data-status", "done");
        tryCall(api && api.completePhase, api, op && op.id, step - 1);
      }
      if (step >= phaseEls.length) {
        fill.style.inlineSize = "100%";
        tryCall(api && api.finish, api, op && op.id, "succeeded");
        if (done) done(op);
        return;
      }
      phaseEls[step].setAttribute("data-status", "active");
      tryCall(api && api.advance, api, op && op.id);
      fill.style.inlineSize = Math.round(((step + 1) / (phaseEls.length + 0.0001)) * 100) + "%";
      step++;
      setTimeout(tick, 160);
    }
    setTimeout(tick, 60);
    return op;
  }

  /* ---------- module state --------------------------------------------------- */
  var stack = [];            // navigation stack of nodes
  var cols = 1;              // visible pane count (1..3)
  var paneEls = [];          // rendered pane elements, in order
  var activePane = 0;        // index into paneEls
  var lastSearch = null;     // {query, resultId, depth} for Back-restores-query
  var helpOpen = false;
  var drawerOpen = false;
  var searchIndex = null;
  var searchSession = null;
  var resultsOpen = false;
  var resultRows = [];       // currently rendered result button elements
  var resultSel = -1;
  var lastQuery = "";
  var lastMeta = null;
  var copyEngine = null;

  /* ---------- skeleton ------------------------------------------------------- */
  var topbar = el("div", "cs-topbar");
  var pathBar = el("nav", "cs-path");
  pathBar.setAttribute("aria-label", "Settings path");
  var statusline = el("span", "cs-statusline");
  topbar.appendChild(pathBar);
  topbar.appendChild(statusline);

  var searchrow = el("div", "cs-searchrow");
  var searchbox = el("div", "cs-searchbox");
  searchbox.appendChild(icon(ICON_SEARCH));
  var searchInput = el("input");
  searchInput.id = "pmv2-search";
  searchInput.type = "text";
  searchInput.setAttribute("autocomplete", "off");
  searchInput.setAttribute("spellcheck", "false");
  searchInput.setAttribute("aria-label", "Search all settings");
  searchInput.placeholder = "Search settings, managers, objects, actions…";
  var searchKbd = el("kbd", null, "/");
  searchbox.appendChild(searchInput);
  searchbox.appendChild(searchKbd);
  var resultsBox = el("div", "cs-results pmv2-scroll");
  resultsBox.id = "pmv2-results";
  resultsBox.setAttribute("role", "listbox");
  resultsBox.hidden = true;
  searchbox.appendChild(resultsBox);
  var helpToggle = el("button", "pm-btn cs-help-toggle", "Keyboard help");
  helpToggle.type = "button";
  var overflowBtn = el("button", "pm-btn", "⋯");
  overflowBtn.type = "button";
  overflowBtn.setAttribute("aria-label", "More settings destinations");
  overflowBtn.title = "More destinations";
  var closeBtn = el("button", "pm-btn", "Close Settings");
  closeBtn.type = "button";
  searchrow.appendChild(searchbox);
  searchrow.appendChild(helpToggle);
  searchrow.appendChild(overflowBtn);
  searchrow.appendChild(closeBtn);

  var helpStrip = el("div", "cs-help");
  helpStrip.hidden = true;

  var scenarioStrip = el("div", "cs-scenario-strip");
  scenarioStrip.hidden = true;
  scenarioStrip.setAttribute("role", "status");

  var panesWrap = el("div", "cs-panes");

  var hintsBar = el("div", "cs-hints");

  root.appendChild(topbar);
  root.appendChild(searchrow);
  root.appendChild(helpStrip);
  root.appendChild(scenarioStrip);
  root.appendChild(panesWrap);
  root.appendChild(hintsBar);

  /* ---------- help strip ----------------------------------------------------- */
  function buildHelp() {
    var rows = [
      ["↑ / ↓", "Move the cursor in the active pane"],
      ["← / →", "Move between panes; Right also opens the highlighted row"],
      ["Enter", "Open the highlighted row"],
      ["Esc", "Close menus, then step back one level, until Home"],
      ["/", "Focus universal search"],
      ["1–9, 0, A, B", "Jump to a numbered command in the index"],
      ["Home / End", "First / last row in the active pane"],
      ["?", "Show or hide this help strip"]
    ];
    clear(helpStrip);
    for (var i = 0; i < rows.length; i++) {
      var d = el("div");
      var k = el("kbd", null, rows[i][0]);
      d.appendChild(k);
      d.appendChild(document.createTextNode(" "));
      var b = el("b", null, rows[i][1]);
      d.appendChild(b);
      helpStrip.appendChild(d);
    }
  }
  function toggleHelp(force) {
    helpOpen = (force !== undefined) ? !!force : !helpOpen;
    helpStrip.hidden = !helpOpen;
    helpToggle.setAttribute("aria-pressed", helpOpen ? "true" : "false");
  }

  /* ---------- status line + path bar + hints --------------------------------- */
  function criticalNotice() {
    var ns = (CORE && CORE.notices) || [];
    for (var i = 0; i < ns.length; i++) {
      var n = ns[i];
      var sev = String(n.severity || n.kind || n.tone || "").toLowerCase();
      if (sev === "critical" || sev === "danger") return n;
    }
    return null;
  }
  function renderStatusline() {
    clear(statusline);
    var parts = projectName();
    var sc = activeScenarioName();
    if (sc) parts += " · Scenario: " + humanize(sc);
    var oc = overrideCount();
    if (oc) parts += " · " + oc + " overridden";
    statusline.textContent = parts;
    var tone = "ok";
    if (criticalNotice()) tone = "danger";
    else {
      var ov = overrideCount();
      if (ov > 6) tone = "warn";
    }
    statusline.setAttribute("data-tone", tone);
  }
  /* ---------- scenario strip (truthful projection + clear) -------------------- */
  function currentSurfaceId() {
    for (var i = stack.length - 1; i >= 0; i--) {
      var n = stack[i];
      if (n.kind === "manager") return n.id;
      if (n.kind === "object" && n.managerId) return n.managerId;
      if (n.kind === "settings" && n.domainId) return n.domainId;
      if (n.kind === "domain") return n.id;
      if (n.kind === "copy") return "lifecycle";
      if (n.kind === "shell") return n.id;
    }
    return "home";
  }
  function renderScenarioStrip() {
    clear(scenarioStrip);
    var sc = activeScenarioName();
    if (!sc) {
      scenarioStrip.hidden = true;
      scenarioStrip.removeAttribute("data-state");
      return;
    }
    var proj = projectionFor(currentSurfaceId()) || { state: sc, message: null, cached: false };
    scenarioStrip.hidden = false;
    scenarioStrip.setAttribute("data-state", String(proj.state || sc));
    scenarioStrip.appendChild(el("span", "cs-scenario-badge", "Demo scenario"));
    scenarioStrip.appendChild(el("strong", null, humanize(sc)));
    var msg = proj.message || ("This surface is in the “" + humanize(proj.state || sc) + "” demo state.");
    scenarioStrip.appendChild(el("span", "cs-scenario-msg", msg));
    if (proj.cached) scenarioStrip.appendChild(el("span", "pm-badge", "Cached values"));
    var clearB = el("button", "pm-btn cs-scenario-clear", "Clear scenario");
    clearB.type = "button";
    clearB.addEventListener("click", function () {
      tryCall(store.setScenario, store, null);
      fillDrawer();
      renderAll();
    });
    scenarioStrip.appendChild(clearB);
  }
  function crumb(label, depth, current) {
    var b = el("button", "cs-path-crumb", label);
    b.type = "button";
    if (current) {
      b.setAttribute("aria-current", "page");
    } else {
      b.addEventListener("click", function () {
        stack.length = depth;
        renderAll();
      });
    }
    return b;
  }
  function nodeLabel(node) {
    if (node.kind === "domain") {
      var d = domainById(node.id);
      return d ? d.title : humanize(node.id);
    }
    if (node.kind === "settings") {
      var dd = domainById(node.domainId);
      var cat = categoryFor(node.domainId);
      var sgs = cat ? (cat.subgroups || []) : [];
      for (var i = 0; i < sgs.length; i++) if (sgs[i].id === node.subgroupId) return sgs[i].title;
      return dd ? dd.title : "Settings";
    }
    if (node.kind === "manager") {
      var m = managerById(node.id);
      return m ? m.title : humanize(node.id);
    }
    if (node.kind === "object") return node.title || "Object";
    if (node.kind === "compendium") return "All Settings";
    if (node.kind === "copy") return "Copy Settings";
    if (node.kind === "shell") {
      var o = deferredById(node.id);
      return o ? humanize(o.family || o.id) : "Owned area";
    }
    return "Settings";
  }
  function deferredById(id) {
    var all = REG.DEFERRED_OWNERS || [];
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function renderPath() {
    clear(pathBar);
    pathBar.appendChild(crumb("Settings", 0, stack.length === 0));
    for (var i = 0; i < stack.length; i++) {
      pathBar.appendChild(el("span", "cs-path-sep", "/"));
      pathBar.appendChild(crumb(nodeLabel(stack[i]), i + 1, i === stack.length - 1));
    }
  }
  function renderHints() {
    clear(hintsBar);
    var hints = [
      ["↑↓", "Move"], ["←→", "Panes"], ["Enter", "Open"],
      ["Esc", "Back"], ["/", "Search"], ["?", "Help"]
    ];
    for (var i = 0; i < hints.length; i++) {
      var s = el("span", "cs-hint");
      s.appendChild(el("kbd", null, hints[i][0]));
      s.appendChild(document.createTextNode(hints[i][1]));
      hintsBar.appendChild(s);
    }
    var right = el("span", "cs-hints-right");
    var sc = activeScenarioName();
    right.appendChild(el("span", null, sc ? ("Scenario: " + humanize(sc)) : "Scenario: default"));
    right.appendChild(el("span", null, cols + (cols === 1 ? " pane" : " panes")));
    hintsBar.appendChild(right);
  }

  /* ---------- focus / cursor ------------------------------------------------- */
  function paneItems(pane) {
    var out = [];
    var rows = pane.querySelectorAll(".cs-item");
    for (var i = 0; i < rows.length; i++) {
      if (!rows[i].disabled && rows[i].offsetParent !== null) out.push(rows[i]);
    }
    return out;
  }
  function setCursor(paneIdx, itemIdx, focusIt) {
    var pane = paneEls[paneIdx];
    if (!pane) return;
    var items = paneItems(pane);
    for (var i = 0; i < items.length; i++) items[i].classList.remove("cs-cursor");
    if (!items.length) return;
    if (itemIdx < 0) itemIdx = 0;
    if (itemIdx >= items.length) itemIdx = items.length - 1;
    pane._cursor = itemIdx;
    var it = items[itemIdx];
    it.classList.add("cs-cursor");
    if (focusIt) {
      try { it.focus({ preventScroll: false }); } catch (e) { it.focus(); }
    } else {
      try { it.scrollIntoView({ block: "nearest" }); } catch (e2) { it.scrollIntoView(); }
    }
  }
  function visiblePaneIndexes() {
    var out = [];
    for (var i = 0; i < paneEls.length; i++) {
      if (!paneEls[i].hasAttribute("data-hidden")) out.push(i);
    }
    return out;
  }
  function focusActivePane() {
    var vis = visiblePaneIndexes();
    if (!vis.length) return;
    if (vis.indexOf(activePane) === -1) activePane = vis[vis.length - 1];
    setCursor(activePane, paneEls[activePane]._cursor || 0, false);
  }

  /* ---------- item factory ---------------------------------------------------- */
  function itemRow(opts) {
    var b = el("button", "cs-item");
    b.type = "button";
    if (opts.keyLabel) b.appendChild(el("span", "cs-item-key", opts.keyLabel));
    if (opts.key) b.setAttribute("data-cs-key", opts.key);
    var main = el("span", "cs-item-main");
    main.appendChild(el("span", "cs-item-title", opts.title));
    if (opts.sub) main.appendChild(el("span", "cs-item-sub", opts.sub));
    b.appendChild(main);
    if (opts.badge) {
      var bg = el("span", "pm-badge", opts.badge);
      bg.setAttribute("data-kind", opts.badgeKind || "info");
      b.appendChild(bg);
    }
    if (opts.drill !== false) b.appendChild(icon(ICON_NEXT));
    if (opts.hook) b.setAttribute(opts.hook.name, opts.hook.value);
    if (opts.current) b.setAttribute("aria-current", "true");
    if (opts.onOpen) {
      b.addEventListener("click", function () { opts.onOpen(); });
    }
    return b;
  }

  /* ---------- setting row (store-bound) --------------------------------------- */
  function stateBadge(st) {
    if (st.state === "managed") {
      var b = el("span", "pm-badge", "Managed");
      b.setAttribute("data-kind", "warn");
      return b;
    }
    if (st.state === "unavailable") {
      var b2 = el("span", "pm-badge", "Unavailable");
      b2.setAttribute("data-kind", "danger");
      return b2;
    }
    if (isOverridden(st.id)) {
      var b3 = el("span", "pm-badge", "Customized");
      b3.setAttribute("data-kind", "info");
      return b3;
    }
    return null;
  }
  function settingControl(st) {
    var wrap = el("span", "cs-setting-control");
    var disabled = (st.state === "managed" || st.state === "unavailable");
    var val = storeValue(st);
    var type = String(st.type || "").toLowerCase();
    if (type === "boolean" || type === "bool" || type === "toggle" || type === "switch") {
      var sw = el("button", "pm-switch");
      sw.type = "button";
      sw.setAttribute("role", "switch");
      sw.setAttribute("aria-checked", val ? "true" : "false");
      sw.setAttribute("aria-label", st.label || st.id);
      sw.disabled = disabled;
      sw.appendChild(el("span", "pm-switch-knob"));
      sw.addEventListener("click", function () {
        var now = sw.getAttribute("aria-checked") === "true";
        sw.setAttribute("aria-checked", now ? "false" : "true");
        setValue(st.id, !now);
      });
      wrap.appendChild(sw);
    } else if (st.options && st.options.length !== undefined) {
      var sel = el("select", "pm-select");
      sel.disabled = disabled;
      sel.setAttribute("aria-label", st.label || st.id);
      for (var i = 0; i < st.options.length; i++) {
        var o = st.options[i];
        var ov = (o && typeof o === "object") ? (o.value !== undefined ? o.value : o.id) : o;
        var ol = (o && typeof o === "object") ? (o.label || o.title || humanize(ov)) : humanize(o);
        var opt = el("option", null, ol);
        opt.value = String(ov);
        sel.appendChild(opt);
      }
      sel.value = String(val);
      sel.addEventListener("change", function () { setValue(st.id, sel.value); });
      wrap.appendChild(sel);
    } else if (type === "number" || type === "integer" || type === "int") {
      var num = el("input", "pm-input");
      num.type = "number";
      num.value = String(val == null ? "" : val);
      num.disabled = disabled;
      num.setAttribute("aria-label", st.label || st.id);
      num.style.inlineSize = "96px";
      num.addEventListener("change", function () {
        var v = parseFloat(num.value);
        if (!isNaN(v)) setValue(st.id, v);
      });
      wrap.appendChild(num);
    } else if (type === "range" || type === "slider") {
      var rg = el("input", "pm-slider");
      rg.type = "range";
      rg.min = "0"; rg.max = "100";
      rg.value = String(val == null ? 0 : val);
      rg.disabled = disabled;
      rg.setAttribute("aria-label", st.label || st.id);
      var rv = el("span", "cs-setting-value", String(val == null ? 0 : val));
      rg.addEventListener("input", function () { rv.textContent = rg.value; });
      rg.addEventListener("change", function () { setValue(st.id, parseFloat(rg.value)); });
      wrap.appendChild(rg);
      wrap.appendChild(rv);
    } else {
      var inp = el("input", "pm-input");
      inp.type = "text";
      inp.value = (val == null) ? "" : String(val);
      inp.disabled = disabled;
      inp.setAttribute("aria-label", st.label || st.id);
      inp.style.inlineSize = "200px";
      inp.addEventListener("change", function () { setValue(st.id, inp.value); });
      wrap.appendChild(inp);
    }
    if (!disabled && isOverridden(st.id)) {
      var rst = el("button", "pm-btn", "Reset");
      rst.type = "button";
      rst.addEventListener("click", function () {
        resetValue(st.id);
        renderAll();
      });
      wrap.appendChild(rst);
    }
    return wrap;
  }
  function settingRow(st) {
    var row = el("div", "cs-setting");
    row.setAttribute("data-setting-id", st.id);
    row.tabIndex = -1;
    var top = el("div", "cs-setting-top");
    top.appendChild(el("span", "cs-setting-label", st.label || humanize(st.id)));
    var badge = stateBadge(st);
    if (badge) top.appendChild(badge);
    top.appendChild(settingControl(st));
    row.appendChild(top);
    if (st.desc) row.appendChild(el("div", "cs-setting-desc", st.desc));
    var why = el("details");
    var sum = el("summary", null, "Why this value?");
    sum.style.cursor = "pointer";
    sum.style.color = "var(--pm-accent)";
    sum.style.fontSize = "12px";
    why.appendChild(sum);
    var det = el("div", "cs-setting-details");
    var cur = storeValue(st);
    det.appendChild(el("span", null, "Current value: "));
    det.lastChild.appendChild(el("span", "pm-mono", String(cur)));
    var base = (st["default"] !== undefined) ? st["default"] : "—";
    var d2 = el("span", null, "Default: ");
    d2.appendChild(el("span", "pm-mono", String(base)));
    det.appendChild(d2);
    if (st.recommended !== undefined) {
      var d3 = el("span", null, "Recommended: ");
      d3.appendChild(el("span", "pm-mono", String(st.recommended)));
      det.appendChild(d3);
    }
    det.appendChild(el("span", null, "Source: " + humanize(st.source || "project settings")));
    det.appendChild(el("span", null, "Exposure: " + humanize(st.exposure || "standard") + " · Tier: " + humanize(st.tier || "core")));
    why.appendChild(det);
    row.appendChild(why);
    return row;
  }

  /* ---------- virtualization --------------------------------------------------- */
  function virtualList(body, items, rowH, renderRow) {
    var wrap = el("div", "cs-vlist");
    wrap.style.blockSize = (items.length * rowH) + "px";
    body.appendChild(wrap);
    var lastStart = -1, lastEnd = -1;
    function paint() {
      var st = body.scrollTop, hgt = body.clientHeight || 560;
      var start = Math.max(0, Math.floor(st / rowH) - 5);
      var end = Math.min(items.length, Math.ceil((st + hgt) / rowH) + 5);
      if (start === lastStart && end === lastEnd) return;
      lastStart = start; lastEnd = end;
      clear(wrap);
      for (var i = start; i < end; i++) {
        var row = renderRow(items[i], i);
        row.classList.add("cs-vrow");
        row.style.insetBlockStart = (i * rowH) + "px";
        row.style.blockSize = rowH + "px";
        wrap.appendChild(row);
      }
    }
    body.addEventListener("scroll", paint);
    paint();
  }

  /* ---------- pane scaffolding -------------------------------------------------- */
  function makePane(kind, title, count, backTarget) {
    var pane = el("section", "cs-pane");
    pane.setAttribute("data-pane-kind", kind);
    pane._cursor = 0;
    var head = el("div", "cs-pane-h");
    if (backTarget) {
      var back = el("button", "cs-back", "Back to " + backTarget);
      back.type = "button";
      back.insertBefore(icon(ICON_BACK), back.firstChild);
      back.addEventListener("click", function () { goBack(); });
      head.appendChild(back);
    }
    head.appendChild(el("h2", null, title));
    var countSpan = el("span", "cs-pane-count",
      (count !== undefined && count !== null && count !== "") ? String(count) : "");
    pane._count = countSpan;
    head.appendChild(countSpan);
    pane._actions = el("span", "cs-pane-actions");
    head.appendChild(pane._actions);
    pane.appendChild(head);
    var body = el("div", "cs-pane-body pmv2-scroll");
    pane.appendChild(body);
    pane._body = body;
    return pane;
  }

  /* ---------- HOME -------------------------------------------------------------- */
  function attentionItems() {
    var out = [];
    var ns = (CORE && CORE.notices) || [];
    for (var i = 0; i < ns.length && out.length < 2; i++) {
      var sev = String(ns[i].severity || ns[i].kind || ns[i].tone || "").toLowerCase();
      if (sev === "critical" || sev === "danger" || sev === "warn" || sev === "warning") {
        out.push({
          title: ns[i].title || ns[i].label || "Notice",
          sub: ns[i].message || ns[i].body || "",
          manager: ns[i].manager || null,
          domain: ns[i].domain || null
        });
      }
    }
    var ps = providers();
    for (var j = 0; j < ps.length && out.length < 4; j++) {
      var p = ps[j];
      var health = String(p.health || "").toLowerCase();
      var inst = String(p.installState || (p.installation && p.installation.state) || "").toLowerCase();
      if ((health && health !== "ok" && health !== "healthy" && health !== "good") ||
          (inst && inst !== "installed" && inst !== "ready")) {
        out.push({
          title: (p.name || p.label || p.id || "Provider") + " needs attention",
          sub: "Provider health: " + humanize(health || inst || "unknown"),
          provider: p
        });
      }
    }
    if (!out.length) {
      out.push({ title: "Everything looks healthy", sub: "No critical notices for this project." });
    }
    return out.slice(0, 4);
  }
  var INDEX_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "A", "B"];
  function domainIndexItems(host, opts) {
    var ds = domains();
    for (var i = 0; i < ds.length; i++) {
      (function (d, i) {
        host.appendChild(itemRow({
          keyLabel: opts.numbered ? INDEX_KEYS[i % INDEX_KEYS.length] : null,
          key: opts.numbered ? INDEX_KEYS[i % INDEX_KEYS.length].toLowerCase() : null,
          title: d.title,
          sub: (d.blurb || "") + " · " + domainSettingCount(d.id) + " settings · " + managersByDomain(d.id).length + " managers",
          hook: { name: "data-domain-id", value: d.id },
          current: stack.length && stack[0].kind === "domain" && stack[0].id === d.id,
          onOpen: function () { pushNode({ kind: "domain", id: d.id }); }
        }));
      })(ds[i], i);
    }
  }
  function renderHomePane(pane) {
    var body = pane._body;
    var hero = el("div", "cs-home-hero");
    hero.appendChild(el("h1", null, projectName()));
    var p1 = el("p", null, "Settings for the current project only. Pick a numbered command, search, or drill through the panes.");
    hero.appendChild(p1);
    var stats = domains().length + " domains · " + (REG.MANAGERS || []).length + " managers · " +
      allSettingsList().length + " settings";
    var pm = el("p");
    pm.appendChild(el("span", "pm-mono", stats));
    hero.appendChild(pm);
    body.appendChild(hero);

    var crit = criticalNotice();
    if (crit) {
      var banner = el("div", "pm-notice cs-banner", (crit.title ? crit.title + " — " : "") + (crit.message || crit.body || ""));
      banner.setAttribute("data-kind", "danger");
      body.appendChild(banner);
    }

    body.appendChild(el("div", "cs-section-h", "Needs attention"));
    var glance = el("div", "cs-glance");
    var attn = attentionItems();
    for (var i = 0; i < attn.length; i++) {
      (function (a) {
        var row = el("div", "cs-glance-row");
        var main = el("span", "cs-item-main");
        main.appendChild(el("span", "cs-item-title", a.title));
        if (a.sub) main.appendChild(el("span", "cs-item-sub", a.sub));
        row.appendChild(main);
        if (a.manager || a.provider) {
          var open = el("button", "pm-btn", "Open");
          open.type = "button";
          open.addEventListener("click", function () {
            if (a.provider) {
              var m = findManagerByObjectSource("providers");
              if (m) {
                pushNode({ kind: "domain", id: m.domain });
                pushNode({ kind: "manager", id: m.id, domainId: m.domain, sel: {} });
                return;
              }
            }
            if (a.manager) {
              var mm = managerById(a.manager);
              if (mm) {
                pushNode({ kind: "domain", id: mm.domain });
                pushNode({ kind: "manager", id: mm.id, domainId: mm.domain, sel: {} });
                return;
              }
            }
            if (a.domain) pushNode({ kind: "domain", id: a.domain });
          });
          row.appendChild(open);
        }
        glance.appendChild(row);
      })(attn[i]);
    }
    body.appendChild(glance);

    body.appendChild(el("div", "cs-section-h", "Command index — settings domains"));
    domainIndexItems(body, { numbered: true });

    body.appendChild(el("div", "cs-section-h", "Utilities"));
    body.appendChild(itemRow({
      title: "All Settings",
      sub: "The complete searchable index of every setting in this project.",
      badge: String(allSettingsList().length),
      hook: { name: "data-section-id", value: "all-settings" },
      onOpen: function () { pushNode({ kind: "compendium", sel: {} }); }
    }));
    body.appendChild(itemRow({
      title: "Copy Settings From Another Project",
      sub: "A one-time, previewed transaction. No sync, no inheritance.",
      hook: { name: "data-section-id", value: "copy-settings" },
      onOpen: function () { pushNode({ kind: "copy", sel: null }); }
    }));
    body.appendChild(itemRow({
      title: "Demo Scenarios",
      sub: "Deterministic fixtures that exercise empty, managed, and error states.",
      onOpen: function () { openDrawer(); }
    }));
  }

  /* ---------- INDEX pane (persistent domain index when drilled in) -------------- */
  function renderIndexPane(pane) {
    var body = pane._body;
    body.appendChild(itemRow({
      title: "Home",
      sub: "Command index and project overview",
      drill: false,
      current: stack.length === 0,
      onOpen: function () { stack.length = 0; renderAll(); }
    }));
    domainIndexItems(body, { numbered: true });
    body.appendChild(el("div", "cs-section-h", "Utilities"));
    body.appendChild(itemRow({
      title: "All Settings",
      sub: "Complete index of every setting",
      current: stack.length && stack[stack.length - 1].kind === "compendium",
      onOpen: function () { pushNode({ kind: "compendium", sel: {} }); }
    }));
    body.appendChild(itemRow({
      title: "Copy Settings",
      sub: "One-time transaction from another project",
      current: stack.length && stack[stack.length - 1].kind === "copy",
      onOpen: function () { pushNode({ kind: "copy", sel: null }); }
    }));
  }

  /* ---------- DOMAIN pane -------------------------------------------------------- */
  function renderDomainPane(pane, node) {
    var body = pane._body;
    var d = domainById(node.id);
    var cat = categoryFor(node.id);
    if (!d) {
      body.appendChild(el("div", "cs-empty-hint", "This domain is not available."));
      return;
    }
    var subgroups = cat ? (cat.subgroups || []) : [];
    var mgrs = managersByDomain(node.id);
    var shells = deferredForDomain(node.id);

    body.appendChild(el("div", "cs-section-h", "Pages"));
    if (!subgroups.length) {
      body.appendChild(el("div", "cs-empty-hint", "No settings pages in this domain."));
    }
    for (var i = 0; i < subgroups.length; i++) {
      (function (sg) {
        body.appendChild(itemRow({
          title: sg.title,
          sub: (sg.description || "") + " · " + (sg.settings || []).length + " settings",
          hook: { name: "data-section-id", value: sg.id },
          current: stack.length > 1 && stack[1].kind === "settings" && stack[1].subgroupId === sg.id,
          onOpen: function () { pushNode({ kind: "settings", domainId: node.id, subgroupId: sg.id, sel: {} }); }
        }));
      })(subgroups[i]);
    }

    body.appendChild(el("div", "cs-section-h", "Managers"));
    if (!mgrs.length) body.appendChild(el("div", "cs-empty-hint", "No dedicated managers in this domain."));
    for (var j = 0; j < mgrs.length; j++) {
      (function (m) {
        body.appendChild(itemRow({
          title: m.title,
          sub: (m.summary || "") + " · " + humanize(m.archetype || "manager"),
          hook: { name: "data-manager-id", value: m.id },
          current: stack.length > 1 && stack[1].kind === "manager" && stack[1].id === m.id,
          onOpen: function () { pushNode({ kind: "manager", id: m.id, domainId: node.id, sel: {} }); }
        }));
      })(mgrs[j]);
    }

    if (shells.length) {
      body.appendChild(el("div", "cs-section-h", "Owned elsewhere"));
      for (var k = 0; k < shells.length; k++) {
        (function (o) {
          body.appendChild(itemRow({
            title: humanize(o.family || o.id),
            sub: "Owned by " + (o.owner || "another team") + " — insertion point only",
            badge: "Owned",
            badgeKind: "info",
            hook: { name: "data-manager-id", value: o.id },
            current: stack.length > 1 && stack[1].kind === "shell" && stack[1].id === o.id,
            onOpen: function () { pushNode({ kind: "shell", id: o.id, domainId: node.id, sel: {} }); }
          }));
        })(shells[k]);
      }
    }
  }

  /* ---------- SETTINGS PAGE (subgroup) -------------------------------------------- */
  function renderSettingsPane(pane, node) {
    var body = pane._body;
    var cat = categoryFor(node.domainId);
    var sgs = cat ? (cat.subgroups || []) : [];
    var sg = null;
    for (var i = 0; i < sgs.length; i++) if (sgs[i].id === node.subgroupId) sg = sgs[i];
    if (!sg) {
      body.appendChild(el("div", "cs-empty-hint", "This page is not available."));
      return;
    }
    var head = el("div", "cs-detail-head");
    head.appendChild(el("h1", null, sg.title));
    if (sg.description) head.appendChild(el("p", null, sg.description));
    var meta = el("div", "cs-detail-meta");
    var b1 = el("span", "pm-badge", humanize(node.domainId));
    b1.setAttribute("data-kind", "info");
    meta.appendChild(b1);
    var b2 = el("span", "pm-badge", "Project scope");
    b2.setAttribute("data-kind", "info");
    meta.appendChild(b2);
    head.appendChild(meta);
    body.appendChild(head);

    var settings = subgroupSettings(sg);
    if (!settings.length) {
      body.appendChild(el("div", "cs-empty-hint", "No settings on this page."));
      return;
    }
    body.appendChild(el("div", "cs-group-h", sg.title)).appendChild(el("small", null, settings.length + " settings, bound to this project"));
    for (var j = 0; j < settings.length; j++) body.appendChild(settingRow(settings[j]));
  }

  /* ---------- MANAGER: archetype renderers ----------------------------------------- */
  function managerHeader(body, manager) {
    var head = el("div", "cs-detail-head");
    head.setAttribute("data-manager-id", manager.id);
    head.appendChild(el("h1", null, manager.title));
    if (manager.summary) head.appendChild(el("p", null, manager.summary));
    var meta = el("div", "cs-detail-meta");
    var b1 = el("span", "pm-badge", humanize(manager.archetype || "manager"));
    b1.setAttribute("data-kind", "info");
    meta.appendChild(b1);
    var d = domainById(manager.domain);
    if (d) {
      var b2 = el("span", "pm-badge", d.title);
      b2.setAttribute("data-kind", "info");
      meta.appendChild(b2);
    }
    var b3 = el("span", "pm-badge", "Project scope");
    b3.setAttribute("data-kind", "info");
    meta.appendChild(b3);
    head.appendChild(meta);
    body.appendChild(head);
  }
  function subpageChips(body, manager, node, onPick) {
    var sps = manager.subpages || [];
    if (!sps.length) return;
    var chips = el("div", "cs-chips");
    for (var i = 0; i < sps.length; i++) {
      (function (sp, i) {
        var id = subpageId(sp, i);
        var c = el("button", "cs-chip", subpageTitle(sp, i));
        c.type = "button";
        c.setAttribute("data-section-id", id);
        var active = (node.sel && node.sel.subpage === id) || (!node.sel || !node.sel.subpage) && i === 0;
        c.setAttribute("aria-pressed", active ? "true" : "false");
        c.addEventListener("click", function () {
          node.sel = node.sel || {};
          node.sel.subpage = id;
          if (onPick) onPick(id);
          renderAll();
        });
        chips.appendChild(c);
      })(sps[i], i);
    }
    body.appendChild(chips);
  }

  /* preference-document */
  function renderPreferenceDoc(body, manager, node) {
    var settings = domainSettings(manager.domain);
    if (!settings.length) {
      body.appendChild(el("div", "cs-empty-hint", "No settings for this manager yet."));
      return;
    }
    var cat = categoryFor(manager.domain);
    var sgs = cat ? (cat.subgroups || []) : [];
    var filter = node.sel && node.sel.subpage;
    var shown = 0;
    for (var i = 0; i < sgs.length; i++) {
      if (filter && sgs[i].id !== filter && filter !== "all") {
        // when the subpage id matches a subgroup, show only that group; otherwise show all
        var match = false;
        var sps = manager.subpages || [];
        for (var q = 0; q < sps.length; q++) if (subpageId(sps[q], q) === filter && subpageId(sps[q], q) === sgs[i].id) match = true;
        var anyMatch = false;
        for (var q2 = 0; q2 < sps.length; q2++) for (var r = 0; r < sgs.length; r++) if (subpageId(sps[q2], q2) === sgs[r].id) anyMatch = true;
        if (anyMatch && !match) continue;
      }
      var list = subgroupSettings(sgs[i]);
      if (!list.length) continue;
      var gh = el("div", "cs-group-h", sgs[i].title);
      if (sgs[i].description) gh.appendChild(el("small", null, sgs[i].description));
      body.appendChild(gh);
      var limit = Math.min(list.length, 8);
      for (var j = 0; j < limit; j++) { body.appendChild(settingRow(list[j])); shown++; }
      if (list.length > limit) {
        (function (sg) {
          body.appendChild(itemRow({
            title: "Show all " + list.length + " settings in " + sg.title,
            sub: "Opens the full page for this group",
            hook: { name: "data-section-id", value: sg.id },
            onOpen: function () { pushNode({ kind: "settings", domainId: manager.domain, subgroupId: sg.id, sel: {} }); }
          }));
        })(sgs[i]);
      }
    }
    if (!shown) body.appendChild(el("div", "cs-empty-hint", "Nothing to show for this section."));
  }

  /* resource-roster */
  function renderRoster(body, manager, node) {
    var items = isProvidersManager(manager) ? providersAsObjects() : rosterFor(manager);
    if (!items.length) {
      body.appendChild(el("div", "cs-empty-hint", "Nothing here yet. Items you add will appear in this roster."));
      return;
    }
    function rowFor(o) {
      return itemRow({
        title: o.label || o.name || o.id,
        sub: (o.typeLabel || o.type || "") + (o.health ? " · " + humanize(o.health) : ""),
        badge: o.availability ? humanize(o.availability) : null,
        hook: { name: "data-object-id", value: o.id },
        current: node.sel && node.sel.object === o.id,
        onOpen: function () {
          pushNode({ kind: "object", managerId: manager.id, domainId: manager.domain, objectId: o.id, title: o.label || o.name || o.id, sel: {} });
        }
      });
    }
    if (items.length > 60) {
      virtualList(body, items, 44, rowFor);
    } else {
      for (var i = 0; i < items.length; i++) body.appendChild(rowFor(items[i]));
    }
  }
  function providersAsObjects() {
    var ps = providers(), out = [];
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      out.push({
        id: p.id || ("provider-" + i),
        label: p.name || p.label || p.id || ("Provider " + (i + 1)),
        typeLabel: humanize(p.authModel || p.kind || "provider"),
        health: p.health || null,
        availability: p.installState || (p.installation && p.installation.state) || null,
        _raw: p
      });
    }
    return out;
  }

  /* inventory-catalog */
  function renderCatalog(body, manager, node) {
    var items = rosterFor(manager);
    node.sel = node.sel || {};
    var facets = ["all"];
    for (var i = 0; i < items.length; i++) {
      var t = items[i].typeLabel || items[i].type || "other";
      if (facets.indexOf(t) === -1) facets.push(t);
    }
    var chips = el("div", "cs-chips");
    for (var f = 0; f < facets.length; f++) {
      (function (facet) {
        var c = el("button", "cs-chip", humanize(facet));
        c.type = "button";
        var active = (node.sel.facet || "all") === facet;
        c.setAttribute("aria-pressed", active ? "true" : "false");
        c.addEventListener("click", function () { node.sel.facet = facet; renderAll(); });
        chips.appendChild(c);
      })(facets[f]);
    }
    body.appendChild(chips);
    var facet = node.sel.facet || "all";
    var filtered = [];
    for (var j = 0; j < items.length; j++) {
      var t2 = items[j].typeLabel || items[j].type || "other";
      if (facet === "all" || t2 === facet) filtered.push(items[j]);
    }
    if (!filtered.length) {
      body.appendChild(el("div", "cs-empty-hint", "Nothing matches this facet."));
      return;
    }
    function rowFor(o) {
      return itemRow({
        title: o.label || o.id,
        sub: humanize(o.typeLabel || o.type || "item") + (o.health ? " · " + humanize(o.health) : ""),
        hook: { name: "data-object-id", value: o.id },
        onOpen: function () {
          pushNode({ kind: "object", managerId: manager.id, domainId: manager.domain, objectId: o.id, title: o.label || o.id, sel: {} });
        }
      });
    }
    if (filtered.length > 60) virtualList(body, filtered, 44, rowFor);
    else for (var k = 0; k < filtered.length; k++) body.appendChild(rowFor(filtered[k]));
  }

  /* setup-sequence */
  function renderSetup(body, manager, node) {
    node.sel = node.sel || {};
    var sps = manager.subpages || [];
    var steps = [];
    for (var i = 0; i < sps.length; i++) steps.push(subpageTitle(sps[i], i));
    if (!steps.length) steps = ["Review requirements", "Choose options", "Confirm"];
    var step = node.sel.step || 0;
    if (node.sel.done) {
      var donePanel = el("div", "cs-panels");
      var dp = el("div", "cs-panel");
      dp.appendChild(el("h3", null, "Setup complete"));
      dp.appendChild(el("p", null, manager.title + " finished all " + steps.length + " steps for this project."));
      var again = el("button", "pm-btn", "Run again");
      again.type = "button";
      again.addEventListener("click", function () { node.sel = { step: 0 }; renderAll(); });
      dp.appendChild(again);
      donePanel.appendChild(dp);
      body.appendChild(donePanel);
      return;
    }
    if (step >= steps.length) step = steps.length - 1;
    var chips = el("div", "cs-chips");
    for (var s = 0; s < steps.length; s++) {
      var c = el("span", "cs-chip", (s + 1) + ". " + steps[s]);
      c.setAttribute("aria-pressed", s === step ? "true" : "false");
      chips.appendChild(c);
    }
    body.appendChild(chips);
    var panels = el("div", "cs-panels");
    var p = el("div", "cs-panel");
    p.appendChild(el("h3", null, steps[step]));
    p.appendChild(el("p", null, "Step " + (step + 1) + " of " + steps.length + " for " + manager.title + ". Your choices apply to the current project only."));
    panels.appendChild(p);
    body.appendChild(panels);
    var nav = el("div", "cs-panels");
    var backB = el("button", "pm-btn", "Back");
    backB.type = "button";
    backB.disabled = step === 0;
    backB.addEventListener("click", function () { node.sel.step = Math.max(0, step - 1); renderAll(); });
    var nextB = el("button", "pm-btn", step === steps.length - 1 ? "Finish" : "Continue");
    nextB.type = "button";
    nextB.addEventListener("click", function () {
      if (step === steps.length - 1) {
        node.sel.done = true;
        addReceipt({ kind: "setup", title: manager.title + " setup completed", detail: steps.length + " steps" });
      } else {
        node.sel.step = step + 1;
      }
      renderAll();
    });
    nav.appendChild(backB);
    nav.appendChild(nextB);
    body.appendChild(nav);
  }

  /* health-projection */
  function renderHealth(body, manager, node) {
    var panels = el("div", "cs-panels");
    var proj = projectionFor(manager.id) || projectionFor(manager.domain);
    var p1 = el("div", "cs-panel");
    p1.appendChild(el("h3", null, "Current status"));
    p1.appendChild(el("p", null, proj && proj.message ? proj.message : "All checks pass for this project."));
    var st = el("span", "pm-badge", proj && proj.state ? humanize(proj.state) : "Healthy");
    st.setAttribute("data-kind", proj && proj.state && String(proj.state).toLowerCase() !== "ok" ? "warn" : "info");
    p1.appendChild(st);
    panels.appendChild(p1);
    var roster = rosterFor(manager);
    var healthy = 0;
    for (var i = 0; i < roster.length; i++) {
      var hstr = String(roster[i].health || "ok").toLowerCase();
      if (hstr === "ok" || hstr === "healthy" || hstr === "good") healthy++;
    }
    var p2 = el("div", "cs-panel");
    p2.appendChild(el("h3", null, "Coverage"));
    p2.appendChild(el("p", null, roster.length ? (healthy + " of " + roster.length + " items report healthy.") : "No items to check yet."));
    panels.appendChild(p2);
    var p3 = el("div", "cs-panel");
    p3.appendChild(el("h3", null, "Settings in scope"));
    p3.appendChild(el("p", null, domainSettings(manager.domain).length + " settings in this domain, all current-project values."));
    panels.appendChild(p3);
    body.appendChild(panels);

    if (roster.length) {
      var wrap = el("div", "cs-tablewrap");
      var tbl = el("table", "pm-table");
      var thead = el("thead");
      var hr = el("tr");
      var colsDef = ["Item", "Type", "Health"];
      for (var c = 0; c < colsDef.length; c++) hr.appendChild(el("th", null, colsDef[c]));
      thead.appendChild(hr);
      tbl.appendChild(thead);
      var tb = el("tbody");
      var limit = Math.min(roster.length, 12);
      for (var r = 0; r < limit; r++) {
        var tr = el("tr");
        tr.appendChild(el("td", null, roster[r].label || roster[r].id));
        tr.appendChild(el("td", null, humanize(roster[r].typeLabel || roster[r].type || "item")));
        tr.appendChild(el("td", null, humanize(roster[r].health || "ok")));
        tb.appendChild(tr);
      }
      tbl.appendChild(tb);
      wrap.appendChild(tbl);
      body.appendChild(wrap);
    }
  }

  /* diagnostic-drawer */
  function renderDiagnostic(body, manager, node) {
    node.sel = node.sel || {};
    var panels = el("div", "cs-panels");
    var p = el("div", "cs-panel");
    p.appendChild(el("h3", null, "Diagnostics"));
    p.appendChild(el("p", null, "Read-only log for this project. Filter below; nothing here changes state."));
    panels.appendChild(p);
    body.appendChild(panels);
    var filterWrap = el("div", "cs-chips");
    var finput = el("input", "pm-input", node.sel.filter || "");
    finput.type = "text";
    finput.placeholder = "Filter log lines";
    finput.setAttribute("aria-label", "Filter log lines");
    finput.style.inlineSize = "240px";
    finput.addEventListener("change", function () { node.sel.filter = finput.value; renderAll(); });
    filterWrap.appendChild(finput);
    body.appendChild(filterWrap);

    var settings = domainSettings(manager.domain);
    var lines = [];
    lines.push(FIXED_NOW + " [info] diagnostics opened for " + manager.title);
    for (var i = 0; i < settings.length && lines.length < 80; i++) {
      var lvl = settings[i].state === "unavailable" ? "warn" : "info";
      lines.push(FIXED_NOW + " [" + lvl + "] " + (settings[i].label || settings[i].id) + " — state " + (settings[i].state || "default"));
    }
    var f = String(node.sel.filter || "").toLowerCase();
    var shown = 0;
    for (var j = 0; j < lines.length; j++) {
      if (f && lines[j].toLowerCase().indexOf(f) === -1) continue;
      var row = el("div", "cs-setting");
      var m = el("span", "pm-mono", lines[j]);
      m.style.fontSize = "11.5px";
      row.appendChild(m);
      body.appendChild(row);
      shown++;
    }
    if (!shown) body.appendChild(el("div", "cs-empty-hint", "No log lines match the filter."));
  }

  /* transaction (generic: Backup / Lifecycle / Cleanup) */
  function renderTransaction(body, manager, node) {
    node.sel = node.sel || {};
    if (node.sel.receipt) {
      var rp = el("div", "cs-panels");
      var rc = el("div", "cs-panel cs-receipt");
      rc.appendChild(el("h3", null, "Receipt"));
      rc.appendChild(el("span", null, node.sel.receipt));
      var mono = el("span", "pm-mono", FIXED_NOW + " · " + manager.id);
      rc.appendChild(mono);
      var again = el("button", "pm-btn", "Start over");
      again.type = "button";
      again.addEventListener("click", function () { node.sel = {}; renderAll(); });
      rc.appendChild(again);
      rp.appendChild(rc);
      body.appendChild(rp);
      return;
    }
    var panels = el("div", "cs-panels");
    var pv = el("div", "cs-panel");
    pv.appendChild(el("h3", null, "Preview"));
    pv.appendChild(el("p", null, (manager.summary || "This transaction runs once against the current project.") + " A restore point is recorded before anything changes."));
    var affected = el("span", "pm-mono", domainSettings(manager.domain).length + " settings in scope");
    pv.appendChild(affected);
    panels.appendChild(pv);
    var cf = el("div", "cs-panel");
    cf.appendChild(el("h3", null, "Confirm"));
    var chk = el("label", "cs-checkrow");
    var box = el("input");
    box.type = "checkbox";
    chk.appendChild(box);
    var ct = el("span", null, "I understand this runs once and does not sync");
    ct.appendChild(el("small", null, "You can roll back from the recorded restore point."));
    chk.appendChild(ct);
    cf.appendChild(chk);
    var run = el("button", "pm-btn", "Run " + manager.title);
    run.type = "button";
    run.disabled = true;
    box.addEventListener("change", function () { run.disabled = !box.checked; });
    run.addEventListener("click", function () {
      clear(panels);
      createRestorePoint(manager.title + " — before run");
      runWork(panels, {
        kind: "transaction",
        title: manager.title,
        phases: ["Restore point", "Apply", "Verify"],
        determinate: true,
        cancelable: false
      }, function () {
        node.sel.receipt = manager.title + " completed for the current project.";
        addReceipt({ kind: "transaction", title: manager.title + " completed", detail: manager.domain });
        renderAll();
      });
    });
    cf.appendChild(run);
    panels.appendChild(cf);
    body.appendChild(panels);
  }

  /* ---------- COPY SETTINGS transaction (PM_V2_COPY) ------------------------------- */
  function copyPaneState(node) {
    if (!node.sel) {
      node.sel = { step: 0, source: null, cats: [], preview: null, receipt: null, rolledBack: false };
      if (typeof PM_V2_COPY !== "undefined" && PM_V2_COPY.CopyEngine) {
        try { copyEngine = new PM_V2_COPY.CopyEngine(store, INV, REG); } catch (e) { copyEngine = null; }
      }
    }
    return node.sel;
  }
  function copyCol(stepNum, title, active) {
    var col = el("div", "cs-copycol");
    col.setAttribute("data-active", active ? "true" : "false");
    var h = el("h3");
    h.appendChild(el("span", "cs-stepnum", String(stepNum)));
    h.appendChild(document.createTextNode(title));
    col.appendChild(h);
    return col;
  }
  function renderCopyPane(pane, node) {
    var body = pane._body;
    var st = copyPaneState(node);
    var head = el("div", "cs-detail-head");
    head.appendChild(el("h1", null, "Copy Settings From Another Project"));
    head.appendChild(el("p", null, "A one-time transaction: pick a source, choose categories, preview exactly what changes, then apply. A restore point is recorded first and you can roll back. Nothing syncs afterwards."));
    body.appendChild(head);
    if (!copyEngine) {
      body.appendChild(el("div", "cs-empty-hint", "The copy engine is not available in this build."));
      return;
    }
    var grid = el("div", "cs-copygrid");

    /* 1 — source */
    var c1 = copyCol(1, "Source", st.step === 0);
    var sources = [];
    try { sources = copyEngine.sources() || []; } catch (e) { sources = []; }
    if (!sources.length) c1.appendChild(el("p", null, "No other projects are available as sources."));
    for (var i = 0; i < sources.length; i++) {
      (function (src) {
        var id = (src && typeof src === "object") ? (src.id || src.name) : src;
        var label = (src && typeof src === "object") ? (src.name || src.title || src.id) : humanize(src);
        var b = itemRow({
          title: label,
          sub: "Project settings source",
          drill: false,
          current: st.source === id,
          onOpen: function () {
            tryCall(copyEngine.selectSource, copyEngine, id);
            st.source = id;
            st.step = 1;
            renderAll();
          }
        });
        c1.appendChild(b);
      })(sources[i]);
    }
    grid.appendChild(c1);

    /* 2 — categories */
    var c2 = copyCol(2, "Categories", st.step === 1);
    if (st.step < 1) {
      c2.appendChild(el("p", null, "Pick a source first."));
    } else {
      var cats = REG.COPY_CATEGORIES || [];
      for (var k = 0; k < cats.length; k++) {
        (function (catDef) {
          var row = el("label", "cs-checkrow");
          var cb = el("input");
          cb.type = "checkbox";
          cb.checked = st.cats.indexOf(catDef.id) !== -1;
          row.appendChild(cb);
          var tx = el("span", null, catDef.title || humanize(catDef.id));
          if (catDef.note) tx.appendChild(el("small", null, catDef.note));
          row.appendChild(tx);
          cb.addEventListener("change", function () {
            var ix = st.cats.indexOf(catDef.id);
            if (cb.checked && ix === -1) st.cats.push(catDef.id);
            if (!cb.checked && ix !== -1) st.cats.splice(ix, 1);
            var bb = c2.querySelector("button.pm-btn");
            if (bb) bb.disabled = !st.cats.length;
          });
          c2.appendChild(row);
        })(cats[k]);
      }
      var build = el("button", "pm-btn", "Build preview");
      build.type = "button";
      build.disabled = !st.cats.length;
      build.addEventListener("click", function () {
        tryCall(copyEngine.setCategories, copyEngine, st.cats);
        try { st.preview = copyEngine.buildPreview(); } catch (e) { st.preview = null; }
        st.step = 2;
        renderAll();
      });
      c2.appendChild(build);
    }
    grid.appendChild(c2);

    /* 3 — preview */
    var c3 = copyCol(3, "Preview", st.step === 2);
    if (st.step < 2 || !st.preview) {
      c3.appendChild(el("p", null, "Choose categories and build a preview."));
    } else {
      var pv = st.preview;
      var totals = pv.totals || {};
      var tg = el("div", "cs-totalgrid");
      var keys = ["add", "replace", "unchanged", "unavailable", "conflict"];
      for (var t = 0; t < keys.length; t++) {
        var cell = el("div", "cs-total");
        cell.appendChild(el("b", null, String(totals[keys[t]] || 0)));
        cell.appendChild(el("span", null, keys[t]));
        tg.appendChild(cell);
      }
      c3.appendChild(tg);
      if (pv.credentialPolicy) c3.appendChild(el("p", null, "Credentials: " + String(pv.credentialPolicy)));
      if (pv.independence) c3.appendChild(el("p", null, String(pv.independence)));
      var groups = pv.groups || {};
      var gnames = [];
      for (var g in groups) if (groups.hasOwnProperty(g)) gnames.push(g);
      gnames.sort();
      for (var gi = 0; gi < gnames.length; gi++) {
        var items = groups[gnames[gi]] || [];
        c3.appendChild(el("div", "cs-group-h", humanize(gnames[gi]) + " (" + items.length + ")"));
        var lim = Math.min(items.length, 6);
        for (var gj = 0; gj < lim; gj++) {
          var it = items[gj];
          var label = (it && typeof it === "object") ? (it.label || it.id || it.setting || JSON.stringify(it.kind || "item")) : String(it);
          var line = el("div", "cs-setting-desc", "· " + label);
          c3.appendChild(line);
        }
        if (items.length > lim) c3.appendChild(el("div", "cs-setting-desc", "+ " + (items.length - lim) + " more"));
      }
      var toConfirm = el("button", "pm-btn", "Continue to confirm");
      toConfirm.type = "button";
      toConfirm.addEventListener("click", function () {
        tryCall(copyEngine.confirm, copyEngine);
        st.step = 3;
        renderAll();
      });
      c3.appendChild(toConfirm);
    }
    grid.appendChild(c3);

    /* 4 — confirm / apply / receipt */
    var c4 = copyCol(4, st.receipt ? "Receipt" : "Confirm", st.step === 3);
    if (st.step < 3 && !st.receipt) {
      c4.appendChild(el("p", null, "Review the preview first."));
    } else if (st.receipt) {
      var rc = el("div", "cs-receipt");
      rc.appendChild(el("strong", null, st.rolledBack ? "Rolled back" : "Applied"));
      rc.appendChild(el("span", null, st.receipt));
      rc.appendChild(el("span", "pm-mono", FIXED_NOW));
      c4.appendChild(rc);
      if (!st.rolledBack) {
        var rb = el("button", "pm-btn", "Roll back this copy");
        rb.type = "button";
        rb.addEventListener("click", function () {
          tryCall(copyEngine.rollback, copyEngine);
          st.rolledBack = true;
          st.receipt = "The copy was rolled back to the recorded restore point.";
          addReceipt({ kind: "copy-rollback", title: "Copy settings rolled back", detail: st.source || "" });
          renderAll();
        });
        c4.appendChild(rb);
      }
      var again2 = el("button", "pm-btn", "Start a new copy");
      again2.type = "button";
      again2.addEventListener("click", function () { node.sel = null; renderAll(); });
      c4.appendChild(again2);
    } else {
      c4.appendChild(el("p", null, "Applying writes the previewed values into this project in one atomic step, after recording a restore point."));
      var apply = el("button", "pm-btn", "Apply copy");
      apply.type = "button";
      apply.addEventListener("click", function () {
        createRestorePoint("Copy settings — before apply");
        var op = null;
        try { op = copyEngine.apply(); } catch (e) { op = null; }
        clear(c4);
        runWork(c4, {
          kind: "copy",
          title: "Copy settings",
          phases: ["Restore point", "Apply", "Verify"],
          determinate: true,
          cancelable: false
        }, function () {
          st.receipt = "Copied settings from " + humanize(st.source || "the source project") + " into " + projectName() + ".";
          addReceipt({ kind: "copy-apply", title: "Settings copied", detail: (st.cats || []).join(", "), op: op && op.id });
          st.step = 4;
          renderAll();
        });
      });
      c4.appendChild(apply);
      var backPrev = el("button", "pm-btn", "Back to preview");
      backPrev.type = "button";
      backPrev.addEventListener("click", function () { st.step = 2; renderAll(); });
      c4.appendChild(backPrev);
    }
    grid.appendChild(c4);
    body.appendChild(grid);
  }

  /* ---------- COMPENDIUM (All Settings, faceted + virtualized) ---------------------- */
  function compendiumFilter(node) {
    var list = allSettingsList();
    var sel = node.sel || {};
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (sel.domain && sel.domain !== "all" && s.domain !== sel.domain) continue;
      if (sel.exposure && sel.exposure !== "all" && String(s.exposure || "") !== sel.exposure) continue;
      if (sel.state && sel.state !== "all" && String(s.state || "default") !== sel.state) continue;
      if (sel.type && sel.type !== "all" && String(s.type || "") !== sel.type) continue;
      if (sel.text) {
        var hay = (String(s.label || "") + " " + String(s.desc || "") + " " + String(s.id || "")).toLowerCase();
        if (hay.indexOf(sel.text.toLowerCase()) === -1) continue;
      }
      out.push(s);
    }
    return out;
  }
  function facetSelect(labelText, values, current, onChange) {
    var lab = el("label");
    lab.style.display = "inline-flex";
    lab.style.alignItems = "center";
    lab.style.gap = "6px";
    lab.style.fontSize = "12px";
    lab.style.color = "var(--pm-ink-dim)";
    lab.appendChild(document.createTextNode(labelText));
    var sel = el("select", "pm-select");
    for (var i = 0; i < values.length; i++) {
      var o = el("option", null, values[i] === "all" ? "All" : humanize(values[i]));
      o.value = values[i];
      sel.appendChild(o);
    }
    sel.value = current || "all";
    sel.addEventListener("change", function () { onChange(sel.value); });
    lab.appendChild(sel);
    return lab;
  }
  function uniqFacet(list, key, fallback) {
    var out = ["all"];
    for (var i = 0; i < list.length; i++) {
      var v = String(list[i][key] || fallback || "");
      if (v && out.indexOf(v) === -1) out.push(v);
    }
    return out;
  }
  function renderCompendium(pane, node) {
    var body = pane._body;
    node.sel = node.sel || {};
    var head = el("div", "cs-detail-head");
    head.appendChild(el("h1", null, "All Settings"));
    head.appendChild(el("p", null, "Every setting in this project, searchable and faceted. Opening a row jumps to its home page with the exact editor."));
    body.appendChild(head);

    var all = allSettingsList();
    var chips = el("div", "cs-chips");
    chips.appendChild(facetSelect("Domain", uniqFacet(all, "domain"), node.sel.domain, function (v) { node.sel.domain = v; renderAll(); }));
    chips.appendChild(facetSelect("Exposure", uniqFacet(all, "exposure", "standard"), node.sel.exposure, function (v) { node.sel.exposure = v; renderAll(); }));
    chips.appendChild(facetSelect("State", uniqFacet(all, "state", "default"), node.sel.state, function (v) { node.sel.state = v; renderAll(); }));
    chips.appendChild(facetSelect("Type", uniqFacet(all, "type"), node.sel.type, function (v) { node.sel.type = v; renderAll(); }));
    if (node.sel.text) {
      var clearT = el("button", "cs-chip", "Clear search filter: “" + node.sel.text + "”");
      clearT.type = "button";
      clearT.addEventListener("click", function () { node.sel.text = null; renderAll(); });
      chips.appendChild(clearT);
    }
    body.appendChild(chips);

    var filtered = compendiumFilter(node);
    pane._count.textContent = filtered.length + " of " + all.length;
    if (!filtered.length) {
      body.appendChild(el("div", "cs-empty-hint", "No settings match these facets."));
      return;
    }
    function rowFor(s) {
      return itemRow({
        title: s.label || humanize(s.id),
        sub: humanize(s.domain || "") + " · " + humanize(s.type || "setting") + " · " + humanize(s.state || "default"),
        hook: { name: "data-setting-id", value: s.id },
        onOpen: function () { openSettingDestination(s.id); }
      });
    }
    if (filtered.length > 60) virtualList(body, filtered, 44, rowFor);
    else for (var i = 0; i < filtered.length; i++) body.appendChild(rowFor(filtered[i]));
  }
  function openSettingDestination(settingId) {
    var s = settingById(settingId);
    if (!s) return;
    stack.length = 0;
    pushNode({ kind: "domain", id: s.domain }, true);
    pushNode({ kind: "settings", domainId: s.domain, subgroupId: s.subgroup, sel: {} }, true);
    renderAll();
    locate("[data-setting-id=\"" + cssEscape(settingId) + "\"]");
  }
  function cssEscape(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  }

  /* ---------- OBJECT detail ---------------------------------------------------------- */
  function findObject(manager, objectId) {
    var items = isProvidersManager(manager) ? providersAsObjects() : rosterFor(manager);
    for (var i = 0; i < items.length; i++) if (items[i].id === objectId) return items[i];
    return null;
  }
  function renderObjectPane(pane, node) {
    var body = pane._body;
    var manager = managerById(node.managerId);
    var o = manager ? findObject(manager, node.objectId) : null;
    if (!manager || !o) {
      body.appendChild(el("div", "cs-empty-hint", "This item is no longer available."));
      return;
    }
    var head = el("div", "cs-detail-head");
    head.setAttribute("data-object-id", o.id);
    head.appendChild(el("h1", null, o.label || o.id));
    head.appendChild(el("p", null, humanize(o.typeLabel || o.type || "item") + " · managed by " + manager.title));
    var meta = el("div", "cs-detail-meta");
    if (o.health) {
      var hb = el("span", "pm-badge", humanize(o.health));
      hb.setAttribute("data-kind", String(o.health).toLowerCase() === "ok" ? "info" : "warn");
      meta.appendChild(hb);
    }
    if (o.availability) {
      var ab = el("span", "pm-badge", humanize(o.availability));
      ab.setAttribute("data-kind", "info");
      meta.appendChild(ab);
    }
    head.appendChild(meta);
    body.appendChild(head);
    subpageChips(body, manager, node);

    var panels = el("div", "cs-panels");
    var dp = el("div", "cs-panel");
    dp.appendChild(el("h3", null, "Details"));
    dp.appendChild(el("p", null, "Part of " + manager.title + " for the current project."));
    var kv = el("span", "pm-mono", "id: " + o.id);
    kv.style.fontSize = "11.5px";
    dp.appendChild(kv);
    panels.appendChild(dp);
    body.appendChild(panels);

    if (isProvidersManager(manager)) renderProviderDetail(body, o._raw || {});
  }
  function renderProviderDetail(body, p) {
    var panels = el("div", "cs-panels");

    var acc = el("div", "cs-panel");
    acc.appendChild(el("h3", null, "Account"));
    var accounts = p.accounts;
    var accCount = (accounts && accounts.length !== undefined) ? accounts.length : (accounts ? 1 : 0);
    acc.appendChild(el("p", null, accCount ? (accCount + " account(s) connected.") : "No account connected yet."));
    var cred = el("span", "pm-mono", "credentials: ••••••••");
    cred.style.fontSize = "11.5px";
    acc.appendChild(cred);
    panels.appendChild(acc);

    var inst = el("div", "cs-panel");
    inst.appendChild(el("h3", null, "Installation"));
    var state = humanize(p.installState || (p.installation && p.installation.state) || "not installed");
    inst.appendChild(el("p", null, "State: " + state + ". Installs always come from the provider’s official source — Puppet Master never bundles or pre-seeds providers."));
    panels.appendChild(inst);

    body.appendChild(panels);

    /* limits / usage table */
    var models = p.models || (p.installation && p.installation.models) || [];
    if (models && models.length !== undefined && models.length) {
      var wrap = el("div", "cs-tablewrap");
      var tbl = el("table", "pm-table");
      var thead = el("thead");
      var hr = el("tr");
      var heads = ["Model", "Included", "Used", "Remaining"];
      for (var i = 0; i < heads.length; i++) hr.appendChild(el("th", null, heads[i]));
      thead.appendChild(hr);
      tbl.appendChild(thead);
      var tb = el("tbody");
      var lim = Math.min(models.length, 8);
      for (var m = 0; m < lim; m++) {
        var md = models[m];
        var name = (md && typeof md === "object") ? (md.name || md.id || md.label) : String(md);
        var included = (md && typeof md === "object" && md.limit != null) ? md.limit : 1000;
        var used = (md && typeof md === "object" && md.used != null) ? md.used : (m * 37) % 400;
        var tr = el("tr");
        tr.appendChild(el("td", null, name));
        var t1 = el("td", "cs-num", String(included));
        var t2 = el("td", "cs-num", String(used));
        var t3 = el("td", "cs-num", String(Math.max(0, included - used)));
        tr.appendChild(t1); tr.appendChild(t2); tr.appendChild(t3);
        tb.appendChild(tr);
      }
      tbl.appendChild(tb);
      wrap.appendChild(tbl);
      body.appendChild(wrap);
    }

    /* actions */
    var actions = el("div", "cs-panels");
    var act = el("div", "cs-panel");
    act.appendChild(el("h3", null, "Actions"));
    var installed = /installed|ready/i.test(String(p.installState || (p.installation && p.installation.state) || ""));
    var installB = el("button", "pm-btn", installed ? "Repair installation" : "Install from official source");
    installB.type = "button";
    installB.addEventListener("click", function () {
      clear(act);
      act.appendChild(el("h3", null, "Actions"));
      runWork(act, {
        kind: installed ? "provider-repair" : "provider-install",
        title: (installed ? "Repairing " : "Installing ") + (p.name || p.label || p.id || "provider"),
        phases: ["Resolve official source", installed ? "Repair" : "Install", "Verify"],
        determinate: true,
        cancelable: false
      }, function () {
        addReceipt({ kind: installed ? "provider-repair" : "provider-install", title: (installed ? "Repaired " : "Installed ") + (p.name || p.id || "provider"), detail: "official source" });
      });
    });
    act.appendChild(installB);
    var testB = el("button", "pm-btn", "Test connection");
    testB.type = "button";
    testB.addEventListener("click", function () {
      runWork(act, {
        kind: "provider-test",
        title: "Testing " + (p.name || p.label || p.id || "provider"),
        phases: ["Handshake", "Model list"],
        determinate: true,
        cancelable: false
      }, function () {
        addReceipt({ kind: "provider-test", title: "Connection test passed", detail: p.name || p.id || "provider" });
      });
    });
    act.appendChild(testB);
    if (p.updateAvailable) {
      var up = el("span", "pm-badge", "Update available");
      up.setAttribute("data-kind", "warn");
      act.appendChild(up);
    }
    actions.appendChild(act);
    body.appendChild(actions);
  }

  /* ---------- DEFERRED OWNER shell ---------------------------------------------------- */
  function renderShellPane(pane, node) {
    var body = pane._body;
    var o = deferredById(node.id);
    if (!o) {
      body.appendChild(el("div", "cs-empty-hint", "This area is not available."));
      return;
    }
    var head = el("div", "cs-detail-head");
    head.setAttribute("data-manager-id", o.id);
    head.appendChild(el("h1", null, humanize(o.family || o.id)));
    head.appendChild(el("p", null, "This area is owned by " + (o.owner || "another team") + "; the demo shows the insertion point only."));
    var meta = el("div", "cs-detail-meta");
    var b = el("span", "pm-badge", "Owned elsewhere");
    b.setAttribute("data-kind", "info");
    meta.appendChild(b);
    head.appendChild(meta);
    body.appendChild(head);

    var panels = el("div", "cs-panels");
    var p1 = el("div", "cs-panel");
    p1.appendChild(el("h3", null, "Owner"));
    p1.appendChild(el("p", null, o.owner || "Another team"));
    panels.appendChild(p1);
    var p2 = el("div", "cs-panel");
    p2.appendChild(el("h3", null, "Insertion point"));
    p2.appendChild(el("p", null, o.insertion ? String(o.insertion) : "Inside this domain’s manager list."));
    panels.appendChild(p2);
    var p3 = el("div", "cs-panel");
    p3.appendChild(el("h3", null, "Returns to"));
    p3.appendChild(el("p", null, o.returnContract ? String(o.returnContract) : "Back to this settings surface when finished."));
    panels.appendChild(p3);
    body.appendChild(panels);

    var nav = el("div", "cs-panels");
    var back = el("button", "pm-btn", "Back to " + (domainById(node.domainId) ? domainById(node.domainId).title : "the domain"));
    back.type = "button";
    back.addEventListener("click", function () { goBack(); });
    nav.appendChild(back);
    body.appendChild(nav);
  }

  /* ---------- MANAGER pane dispatch ---------------------------------------------------- */
  function renderManagerPane(pane, node) {
    var body = pane._body;
    var manager = managerById(node.id);
    if (!manager) {
      body.appendChild(el("div", "cs-empty-hint", "This manager is not available."));
      return;
    }
    node.sel = node.sel || {};
    managerHeader(body, manager);
    subpageChips(body, manager, node);
    var arch = String(manager.archetype || "preference-document").toLowerCase();
    if (arch === "resource-roster") renderRoster(body, manager, node);
    else if (arch === "inventory-catalog") renderCatalog(body, manager, node);
    else if (arch === "setup-sequence") renderSetup(body, manager, node);
    else if (arch === "health-projection") renderHealth(body, manager, node);
    else if (arch === "diagnostic-drawer") renderDiagnostic(body, manager, node);
    else if (arch === "transaction") {
      if (/copy/i.test(String(manager.id) + " " + String(manager.title) + " " + String(manager.family))) {
        renderCopyInto(body, node);
      } else {
        renderTransaction(body, manager, node);
      }
    }
    else renderPreferenceDoc(body, manager, node);

    /* overflow menu */
    var menuB = el("button", "pm-btn", "⋯");
    menuB.type = "button";
    menuB.setAttribute("aria-label", "More actions for " + manager.title);
    menuB.addEventListener("click", function () {
      var items = [
        {
          label: "Reset overridden values on this page",
          action: function () {
            var ds = domainSettings(manager.domain);
            for (var i = 0; i < ds.length; i++) if (isOverridden(ds[i].id)) resetValue(ds[i].id);
            renderAll();
          }
        },
        {
          label: "Open in All Settings",
          action: function () {
            pushNode({ kind: "compendium", sel: { domain: manager.domain } });
          }
        },
        { sep: true },
        { label: "Demo scenarios", action: function () { openDrawer(); } }
      ];
      if (typeof PMV2Menu !== "undefined" && PMV2Menu.open) {
        PMV2Menu.open(menuB, items, {});
      }
    });
    pane._actions.appendChild(menuB);
  }
  /* copy flow rendered inside a manager pane body */
  function renderCopyInto(body, node) {
    var fakePane = { _body: body };
    renderCopyPane(fakePane, node);
  }

  /* ---------- router ---------------------------------------------------------------- */
  function pushNode(node, deferRender) {
    /* replace sibling-level nodes of replaceable kinds */
    if (node.kind === "settings" || node.kind === "manager" || node.kind === "shell") {
      while (stack.length > 1) stack.pop();
      if (stack.length && (stack[stack.length - 1].kind === "settings" ||
          stack[stack.length - 1].kind === "manager" || stack[stack.length - 1].kind === "shell")) {
        stack.pop();
      }
    }
    if (node.kind === "object") {
      while (stack.length && stack[stack.length - 1].kind === "object") stack.pop();
    }
    if (node.kind === "compendium" || node.kind === "copy") {
      stack.length = 0;
    }
    stack.push(node);
    if (!deferRender) renderAll();
  }
  function goBack() {
    if (drawerOpen) { closeDrawer(); return; }
    if (!stack.length) return;
    stack.pop();
    renderAll();
    if (lastSearch && stack.length < lastSearch.depth) {
      searchInput.value = lastSearch.query;
      runSearch(lastSearch.query, lastSearch.resultId);
      lastSearch = null;
    }
  }

  function renderAll() {
    renderPath();
    renderStatusline();
    renderHints();
    renderScenarioStrip();
    clear(panesWrap);
    paneEls = [];

    var defs = [];
    if (!stack.length) {
      defs.push({ kind: "home" });
    } else {
      defs.push({ kind: "index" });
      for (var i = 0; i < stack.length; i++) defs.push(stack[i]);
    }

    for (var d = 0; d < defs.length; d++) {
      var def = defs[d];
      var pane = null;
      var narrowBack = (cols === 1 && d === defs.length - 1 && stack.length > 0);
      var backTarget = null;
      if (narrowBack) {
        backTarget = defs.length > 1 ? nodeLabel(defs[defs.length - 2] === undefined ? { kind: "home" } : defs[defs.length - 2]) : "Home";
        if (defs.length === 2) backTarget = "Home";
        else if (defs[defs.length - 2].kind === "index") backTarget = "Command index";
      }
      if (def.kind === "home") {
        pane = makePane("wide", "Home", null, null);
        renderHomePane(pane);
      } else if (def.kind === "index") {
        pane = makePane("index", "Command Index", domains().length, null);
        renderIndexPane(pane);
      } else if (def.kind === "domain") {
        var dd = domainById(def.id);
        pane = makePane("list", dd ? dd.title : humanize(def.id), null, narrowBack ? (backTarget || "Home") : null);
        renderDomainPane(pane, def);
      } else if (def.kind === "settings") {
        pane = makePane("detail", nodeLabel(def), null, narrowBack ? backTarget : null);
        renderSettingsPane(pane, def);
      } else if (def.kind === "manager") {
        var mm = managerById(def.id);
        pane = makePane("detail", mm ? mm.title : humanize(def.id), null, narrowBack ? backTarget : null);
        renderManagerPane(pane, def);
      } else if (def.kind === "object") {
        pane = makePane("detail", def.title || "Object", null, narrowBack ? backTarget : null);
        renderObjectPane(pane, def);
      } else if (def.kind === "compendium") {
        pane = makePane("wide", "All Settings", null, narrowBack ? backTarget : null);
        renderCompendium(pane, def);
      } else if (def.kind === "copy") {
        pane = makePane("wide", "Copy Settings", null, narrowBack ? backTarget : null);
        renderCopyPane(pane, def);
      } else if (def.kind === "shell") {
        pane = makePane("detail", nodeLabel(def), null, narrowBack ? backTarget : null);
        renderShellPane(pane, def);
      }
      if (pane) {
        if (d === defs.length - 1) pane.setAttribute("data-enter", "1");
        panesWrap.appendChild(pane);
        paneEls.push(pane);
      }
    }

    /* visibility: last `cols` panes */
    var start = Math.max(0, paneEls.length - cols);
    for (var v = 0; v < paneEls.length; v++) {
      if (v < start) paneEls[v].setAttribute("data-hidden", "");
    }
    activePane = paneEls.length - 1;
    focusActivePane();
  }

  /* ---------- locate (search landing) ------------------------------------------------- */
  function locate(selector) {
    if (!selector) return false;
    var target = null;
    try { target = panesWrap.querySelector(selector); } catch (e) { target = null; }
    if (!target) return false;
    try { target.scrollIntoView({ block: "center", behavior: "auto" }); } catch (e) { target.scrollIntoView(); }
    if (target.tabIndex === -1 || /^(BUTTON|INPUT|SELECT|A)$/.test(target.tagName)) {
      try { target.focus({ preventScroll: true }); } catch (e2) { try { target.focus(); } catch (e3) {} }
    }
    target.classList.add("pmv2-locate");
    setTimeout(function () { target.classList.remove("pmv2-locate"); }, 2400);
    return true;
  }

  /* ---------- universal search ---------------------------------------------------------- */
  function buildSearch() {
    if (typeof PM_V2_SEARCH === "undefined") return;
    var objects = [], workflows = [], diagnostics = [], help = [];
    if (OBJ) {
      try { objects = OBJ.searchObjects() || []; } catch (e) { objects = []; }
      try { workflows = OBJ.workflows() || []; } catch (e2) { workflows = []; }
      try { diagnostics = OBJ.diagnostics() || []; } catch (e3) { diagnostics = []; }
      try { help = OBJ.help() || []; } catch (e4) { help = []; }
    }
    try {
      searchIndex = PM_V2_SEARCH.buildIndex({
        inventory: INV, registry: REG, coreData: CORE,
        objects: objects, workflows: workflows, diagnostics: diagnostics, help: help
      });
      searchSession = PM_V2_SEARCH.createSession(searchIndex, { limit: 30 });
    } catch (e) {
      searchIndex = null;
      searchSession = null;
    }
  }
  var TYPE_LABELS = {
    setting: "Setting",
    manager: "Manager",
    managed_object: "Object",
    action: "Action",
    setup_or_repair_workflow: "Workflow",
    diagnostic_or_read_only_status: "Diagnostic",
    unavailable_capability: "Unavailable",
    intentional_help_result: "Help"
  };
  var TYPE_ORDER = ["setting", "manager", "managed_object", "action", "setup_or_repair_workflow", "diagnostic_or_read_only_status", "unavailable_capability", "intentional_help_result"];
  function highlight(label, query) {
    var span = el("span", "cs-result-label");
    var l = String(label || "");
    var q = String(query || "").toLowerCase();
    var ix = q ? l.toLowerCase().indexOf(q) : -1;
    if (ix === -1) { span.textContent = l; return span; }
    span.appendChild(document.createTextNode(l.slice(0, ix)));
    span.appendChild(el("mark", null, l.slice(ix, ix + q.length)));
    span.appendChild(document.createTextNode(l.slice(ix + q.length)));
    return span;
  }
  function closeResults() {
    resultsOpen = false;
    resultsBox.hidden = true;
    resultRows = [];
    resultSel = -1;
  }
  function runSearch(text, preselectId) {
    lastQuery = text;
    if (!searchSession || !text) {
      if (!text) closeResults();
      return;
    }
    searchSession.query(text, function (results, meta) {
      if (text !== lastQuery) return; /* latest wins */
      lastMeta = meta || null;
      renderResults(results || [], text, preselectId);
    });
  }
  function renderResults(results, text, preselectId) {
    clear(resultsBox);
    resultRows = [];
    resultSel = -1;
    if (!results.length) {
      resultsBox.appendChild(el("div", "cs-results-empty", "No results for “" + text + "”."));
      resultsBox.hidden = false;
      resultsOpen = true;
      return;
    }
    var byType = {};
    for (var i = 0; i < results.length; i++) {
      var t = results[i].type || "setting";
      if (!byType[t]) byType[t] = [];
      byType[t].push(results[i]);
    }
    for (var ti = 0; ti < TYPE_ORDER.length; ti++) {
      var group = byType[TYPE_ORDER[ti]];
      if (!group) continue;
      resultsBox.appendChild(el("div", "cs-results-group", TYPE_LABELS[TYPE_ORDER[ti]] || humanize(TYPE_ORDER[ti])));
      for (var g = 0; g < group.length; g++) {
        (function (entry) {
          var row = el("button", "cs-result");
          row.type = "button";
          row.setAttribute("role", "option");
          row.setAttribute("data-result-id", entry.immutableResultId);
          row.appendChild(highlight(entry.label, text));
          var chip = el("span", "pm-badge", TYPE_LABELS[entry.type] || humanize(entry.type || "result"));
          chip.setAttribute("data-kind", entry.type === "unavailable_capability" ? "warn" : "info");
          row.appendChild(chip);
          if (entry.path) row.appendChild(el("span", "cs-result-path", entry.path));
          if (entry.availability) row.appendChild(el("span", "cs-result-avail", humanize(entry.availability)));
          row.addEventListener("click", function () { openResult(entry); });
          resultsBox.appendChild(row);
          resultRows.push(row);
          if (preselectId && entry.immutableResultId === preselectId) resultSel = resultRows.length - 1;
        })(group[g]);
      }
    }
    if (lastMeta && lastMeta.bounded && lastMeta.total > results.length) {
      var more = el("button", "cs-results-more", "View all " + lastMeta.total + " results");
      more.type = "button";
      more.addEventListener("click", function () {
        closeResults();
        pushNode({ kind: "compendium", sel: { text: text } });
      });
      resultsBox.appendChild(more);
    }
    if (resultSel === -1) resultSel = 0;
    markResultSel();
    resultsBox.hidden = false;
    resultsOpen = true;
  }
  function markResultSel() {
    for (var i = 0; i < resultRows.length; i++) {
      resultRows[i].setAttribute("aria-selected", i === resultSel ? "true" : "false");
    }
    if (resultSel >= 0 && resultRows[resultSel]) {
      try { resultRows[resultSel].scrollIntoView({ block: "nearest" }); } catch (e) {}
    }
  }
  function openResult(entry) {
    var resolved = entry;
    if (searchIndex && PM_V2_SEARCH.resolve) {
      try { resolved = PM_V2_SEARCH.resolve(searchIndex, entry.immutableResultId) || entry; } catch (e) { resolved = entry; }
    }
    tryCall(store.saveSearchState, store, searchInput.value, resolved.immutableResultId);
    closeResults();
    navigateToResult(resolved);
    lastSearch = { query: searchInput.value, resultId: resolved.immutableResultId, depth: stack.length };
  }
  function navigateToResult(entry) {
    var dest = entry.destination || {};
    stack.length = 0;
    var domainId = dest.domain || null;
    var manager = dest.manager ? managerById(dest.manager) : null;
    if (manager && !domainId) domainId = manager.domain;

    /* settings land on their subgroup page unless a manager is named */
    if (entry.type === "setting" && !manager) {
      var st = settingById(entry.settingId || dest.row);
      if (st) {
        domainId = st.domain;
        pushNode({ kind: "domain", id: domainId }, true);
        pushNode({ kind: "settings", domainId: st.domain, subgroupId: st.subgroup, sel: {} }, true);
        renderAll();
        locate("[data-setting-id=\"" + cssEscape(st.id) + "\"]");
        return;
      }
    }
    if (manager && manager.id === "lifecycle" && (dest.page === "copy" || dest.section === "copy")) {
      if (domainId) pushNode({ kind: "domain", id: domainId }, true);
      pushNode({ kind: "copy", sel: null }, true);
      renderAll();
      return;
    }
    if (domainId) pushNode({ kind: "domain", id: domainId }, true);
    if (manager) {
      var node = { kind: "manager", id: manager.id, domainId: manager.domain, sel: {} };
      var wantSub = dest.section || dest.page || null;
      if (wantSub && (manager.subpages || []).map(function (s, i) { return subpageId(s, i); }).indexOf(wantSub) >= 0) node.sel.subpage = wantSub;
      pushNode(node, true);
      if (dest.object) {
        var items = isProvidersManager(manager) ? providersAsObjects() : rosterFor(manager);
        var found = null;
        for (var i = 0; i < items.length; i++) if (items[i].id === dest.object) found = items[i];
        pushNode({
          kind: "object", managerId: manager.id, domainId: manager.domain,
          objectId: dest.object, title: found ? (found.label || found.id) : humanize(dest.object), sel: {}
        }, true);
      }
      renderAll();
      /* highlight the deepest truthful target: row → object → named section →
         selected subpage chip → manager overview header */
      var landed = false;
      if (dest.row) landed = locate("[data-setting-id=\"" + cssEscape(dest.row) + "\"]");
      if (!landed && dest.object) landed = locate("[data-object-id=\"" + cssEscape(dest.object) + "\"]");
      if (!landed && dest.section) landed = locate("[data-section-id=\"" + cssEscape(dest.section) + "\"]");
      if (!landed && node.sel && node.sel.subpage) landed = locate("[data-section-id=\"" + cssEscape(node.sel.subpage) + "\"]");
      if (!landed) locate("[data-manager-id=\"" + cssEscape(manager.id) + "\"]");
      return;
    }
    /* domain-level or page-level destinations */
    var page = dest.page || dest.section || null;
    if (page === "all-settings" || entry.type === "action" && /all settings/i.test(entry.label || "")) {
      pushNode({ kind: "compendium", sel: domainId ? { domain: domainId } : {} }, true);
      renderAll();
      if (dest.row) locate("[data-setting-id=\"" + cssEscape(dest.row) + "\"]");
      return;
    }
    if (/copy/i.test(String(page || "") + " " + String(entry.label || ""))) {
      pushNode({ kind: "copy", sel: null }, true);
      renderAll();
      return;
    }
    if (domainId && page) {
      pushNode({ kind: "settings", domainId: domainId, subgroupId: page, sel: {} }, true);
      renderAll();
      if (dest.row) locate("[data-setting-id=\"" + cssEscape(dest.row) + "\"]");
      else locate("[data-section-id=\"" + cssEscape(page) + "\"]");
      return;
    }
    if (domainId) {
      renderAll();
      locate("[data-domain-id=\"" + cssEscape(domainId) + "\"]");
      return;
    }
    /* fallback: home */
    renderAll();
  }

  /* ---------- search events -------------------------------------------------------------- */
  searchInput.addEventListener("input", function () {
    var v = searchInput.value;
    if (!v) { lastQuery = ""; closeResults(); return; }
    runSearch(v);
  });
  searchInput.addEventListener("focus", function () {
    if (searchInput.value) runSearch(searchInput.value);
  });
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" && resultsOpen) {
      e.preventDefault();
      if (resultSel < resultRows.length - 1) { resultSel++; markResultSel(); }
    } else if (e.key === "ArrowUp" && resultsOpen) {
      e.preventDefault();
      if (resultSel > 0) { resultSel--; markResultSel(); }
    } else if (e.key === "Enter") {
      if (resultsOpen && resultSel >= 0 && resultRows[resultSel]) {
        e.preventDefault();
        resultRows[resultSel].click();
        searchInput.blur();
      }
    } else if (e.key === "Escape") {
      e.stopPropagation();
      if (resultsOpen) { closeResults(); }
      else { searchInput.blur(); goBack(); }
    }
  });
  document.addEventListener("pointerdown", function (e) {
    if (resultsOpen && !searchbox.contains(e.target)) closeResults();
  });

  /* ---------- keyboard map ------------------------------------------------------------------ */
  function movePaneCursor(delta) {
    var pane = paneEls[activePane];
    if (!pane) return;
    var items = paneItems(pane);
    if (!items.length) return;
    var cur = pane._cursor || 0;
    setCursor(activePane, cur + delta, true);
  }
  function switchPane(delta) {
    var vis = visiblePaneIndexes();
    if (!vis.length) return;
    var ix = vis.indexOf(activePane);
    if (ix === -1) ix = vis.length - 1;
    var next = ix + delta;
    if (next < 0 || next >= vis.length) {
      if (delta < 0) goBack();
      return;
    }
    activePane = vis[next];
    setCursor(activePane, paneEls[activePane]._cursor || 0, true);
  }
  function openCursorItem() {
    var pane = paneEls[activePane];
    if (!pane) return;
    var items = paneItems(pane);
    var cur = pane._cursor || 0;
    if (items[cur]) items[cur].click();
  }
  function keyActivate(key) {
    var pane = paneEls[activePane];
    if (!pane) return false;
    var items = pane.querySelectorAll("[data-cs-key]");
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute("data-cs-key") === key) { items[i].click(); return true; }
    }
    return false;
  }
  function escapeOrder() {
    if (resultsOpen) { closeResults(); return; }
    if (drawerOpen) { closeDrawer(); return; }
    if (helpOpen) { toggleHelp(false); return; }
    goBack();
  }
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    var inField = /^(INPUT|SELECT|TEXTAREA)$/.test(tag) || (e.target && e.target.isContentEditable);
    if (e.key === "Escape") {
      if (!inField) { escapeOrder(); e.preventDefault(); }
      return;
    }
    if (inField) return;
    if (e.key === "/") {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      return;
    }
    if (e.key === "?") { toggleHelp(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); movePaneCursor(1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); movePaneCursor(-1); return; }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      var vis = visiblePaneIndexes();
      var ix = vis.indexOf(activePane);
      if (ix === vis.length - 1) openCursorItem();
      else switchPane(1);
      return;
    }
    if (e.key === "ArrowLeft") { e.preventDefault(); switchPane(-1); return; }
    if (e.key === "Enter") { e.preventDefault(); openCursorItem(); return; }
    if (e.key === "Home") { e.preventDefault(); setCursor(activePane, 0, true); return; }
    if (e.key === "End") {
      e.preventDefault();
      var items = paneItems(paneEls[activePane] || root);
      if (items.length) setCursor(activePane, items.length - 1, true);
      return;
    }
    if (/^[0-9a-b]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (keyActivate(e.key.toLowerCase())) e.preventDefault();
    }
  });

  /* keep the visual cursor in sync when the pointer takes over */
  panesWrap.addEventListener("pointerdown", function (e) {
    var pane = e.target;
    while (pane && pane !== panesWrap && !pane.classList.contains("cs-pane")) pane = pane.parentNode;
    if (!pane || pane === panesWrap) return;
    for (var i = 0; i < paneEls.length; i++) if (paneEls[i] === pane) activePane = i;
  });
  panesWrap.addEventListener("focusin", function (e) {
    var it = e.target;
    while (it && it !== panesWrap && !it.classList.contains("cs-item")) it = it.parentNode;
    if (!it || it === panesWrap) return;
    var pane = it;
    while (pane && pane !== panesWrap && !pane.classList.contains("cs-pane")) pane = pane.parentNode;
    for (var i = 0; i < paneEls.length; i++) {
      if (paneEls[i] === pane) {
        activePane = i;
        var items = paneItems(pane);
        for (var j = 0; j < items.length; j++) if (items[j] === it) pane._cursor = j;
      }
    }
  });

  /* ---------- header buttons ------------------------------------------------------------------ */
  helpToggle.addEventListener("click", function () { toggleHelp(); });
  closeBtn.addEventListener("click", function () {
    stack.length = 0;
    closeResults();
    renderAll();
    searchInput.blur();
  });
  overflowBtn.addEventListener("click", function () {
    var items = [
      { label: "All Settings", hint: "828 settings", action: function () { pushNode({ kind: "compendium", sel: {} }); } },
      { label: "Copy Settings From Another Project", action: function () { pushNode({ kind: "copy", sel: null }); } },
      { sep: true },
      { label: "Demo scenarios", action: function () { openDrawer(); } },
      { label: "Keyboard help", hint: "?", action: function () { toggleHelp(true); } }
    ];
    if (typeof PMV2Menu !== "undefined" && PMV2Menu.open) PMV2Menu.open(overflowBtn, items, {});
  });

  /* ---------- demo scenario drawer --------------------------------------------------------------- */
  var scrim = document.getElementById("cs-scrim");
  var drawer = document.getElementById("cs-demo");
  var drawerList = document.getElementById("cs-demo-list");
  function openDrawer() {
    if (!drawer || !scrim) return;
    drawer.hidden = false;
    scrim.hidden = false;
    drawerOpen = true;
    var opener = document.querySelector("[data-demo-open]");
    if (opener) opener.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    if (!drawer || !scrim) return;
    drawer.hidden = true;
    scrim.hidden = true;
    drawerOpen = false;
    var opener = document.querySelector("[data-demo-open]");
    if (opener) opener.setAttribute("aria-expanded", "false");
  }
  function fillDrawer() {
    if (!drawerList) return;
    clear(drawerList);
    var sc = scenarioList();
    var active = activeScenarioName();
    for (var i = 0; i < sc.length; i++) {
      (function (s) {
        var name = scenarioName(s);
        var label = (s && typeof s === "object" && (s.label || s.title)) ? (s.label || s.title) : humanize(name);
        var b = el("button", "cs-demo-item", label);
        b.type = "button";
        b.setAttribute("aria-pressed", name === active ? "true" : "false");
        if (name === active) b.title = "Active — click to clear";
        b.addEventListener("click", function () {
          var isActive = name === activeScenarioName();
          tryCall(store.setScenario, store, isActive ? null : name);
          fillDrawer();
          renderAll();
          closeDrawer();
        });
        drawerList.appendChild(b);
      })(sc[i]);
    }
    if (!sc.length) drawerList.appendChild(el("div", "cs-empty-hint", "No demo scenarios are registered."));
  }
  var demoOpener = document.querySelector("[data-demo-open]");
  if (demoOpener) demoOpener.addEventListener("click", function () {
    if (drawerOpen) closeDrawer(); else openDrawer();
  });
  if (scrim) scrim.addEventListener("click", function () { closeDrawer(); });

  /* ---------- store subscription ------------------------------------------------------------------ */
  try {
    store.subscribe(function (evt) {
      /* Scenario changes alter what every surface truthfully shows: re-render
         the whole pane stack. Other events (op ticks, receipts, setting writes)
         are handled by their own flows — a full re-render here would destroy
         in-flight progress UI. */
      if (!evt || evt.type === "scenario") {
        fillDrawer();
        renderAll();
        return;
      }
      renderStatusline();
      renderHints();
    });
  } catch (e) { /* subscription optional */ }

  /* ---------- responsive panes ---------------------------------------------------------------------- */
  function computeCols() {
    /* measure the real concept box; a transient 0 (hidden/unlaid-out) keeps the
       current column count instead of forcing an arbitrary fallback width */
    var w = root.clientWidth || (root.parentElement && root.parentElement.clientWidth) || 0;
    if (!w) {
      root.setAttribute("data-cols", String(cols));
      return;
    }
    var next = w < 940 ? 1 : (w < 1560 ? 2 : 3);
    if (next !== cols) {
      cols = next;
      root.setAttribute("data-cols", String(cols));
      renderAll();
    } else {
      root.setAttribute("data-cols", String(cols));
    }
  }
  window.addEventListener("resize", computeCols);
  if (typeof ResizeObserver !== "undefined") {
    try {
      var ro = new ResizeObserver(function () { computeCols(); });
      ro.observe(root.parentElement || root);
      ro.observe(root);
    } catch (e) { /* window resize listener above covers this */ }
  }
  /* ResizeObserver callbacks are delivered with rendered frames; throttled or
     headless contexts may never produce one, leaving the pane count stale after
     a width change. A cheap interval read guarantees convergence everywhere. */
  setInterval(computeCols, 600);

  /* ---------- init ----------------------------------------------------------------------------------- */
  if (window.PMShell && window.PMShell.init) window.PMShell.init();
  buildHelp();
  buildSearch();
  fillDrawer();
  computeCols();
  renderAll();
})();
