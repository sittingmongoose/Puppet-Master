/* ============================================================================
   concept-09.js — Concept 09 "Chapter Tabs" (kimi-k3)
   ----------------------------------------------------------------------------
   Persistent vertical chapter tabs on the Settings edge, layered page depth
   (subtle stacked surfaces + directional motion), a broad central reading
   canvas, manager-local tabs, list/detail manager composition, and a
   stepwise Copy Settings flow. All theming via var(--pm-*) tokens in CSS.
   Vanilla ES5-style IIFE. No frameworks. Deterministic (no Math.random).
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- guards ------------------------------------------------------ */
  var root = document.getElementById("ct-root");
  if (!root) return;
  if (typeof PM_V2_INVENTORY === "undefined" || typeof PM_V2_REGISTRY === "undefined" ||
      typeof PM_V2_STORE === "undefined" || typeof PM_V2_SEARCH === "undefined") {
    root.innerHTML = '<div class="ct-page-scroll"><p class="ct-note" data-tone="warn">Settings data failed to load. The shared v2 modules must load before this script.</p></div>';
    return;
  }

  var INV = PM_V2_INVENTORY;
  var REG = PM_V2_REGISTRY;
  var OBJ = (typeof PM_V2_OBJECTS !== "undefined") ? PM_V2_OBJECTS : null;
  var CORE = (typeof PM_CORE_DATA !== "undefined") ? PM_CORE_DATA : {};
  var store = PM_V2_STORE.for("concept-09");

  var searchIndex = PM_V2_SEARCH.buildIndex({
    inventory: INV,
    registry: REG,
    coreData: CORE,
    objects: OBJ ? OBJ.searchObjects() : [],
    workflows: OBJ ? OBJ.workflows() : [],
    diagnostics: OBJ ? OBJ.diagnostics() : [],
    help: OBJ ? OBJ.help() : []
  });
  var searchSession = PM_V2_SEARCH.createSession(searchIndex, { limit: 30 });

  var copyEngine = null;
  if (typeof PM_V2_COPY !== "undefined" && PM_V2_COPY.CopyEngine) {
    try { copyEngine = new PM_V2_COPY.CopyEngine(store, INV, REG); } catch (e) { copyEngine = null; }
  }

  /* ---------- tiny helpers ------------------------------------------------ */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function human(s) {
    return String(s == null ? "" : s).replace(/[_-]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function reducedMotion() {
    return document.documentElement.getAttribute("data-motion") === "reduced";
  }

  /* SVG icon dictionary (24x24 stroke paths, no emoji anywhere). */
  var ICONS = {
    home: '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
    back: '<path d="m14 6-6 6 6 6"/>',
    chev: '<path d="m10 6 6 6-6 6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12z"/>',
    chat: '<path d="M5 5h14v11H9l-4 3z"/>',
    plug: '<path d="M9 7V3m6 4V3M7 7h10v4a5 5 0 0 1-10 0zM12 16v5"/>',
    code: '<path d="m8 8-4 4 4 4m8-8 4 4-4 4"/>',
    agent: '<circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    tool: '<path d="M14.5 6.5a4 4 0 0 0-5.6 4.7L4 16.1V20h3.9l4.9-4.9a4 4 0 0 0 4.7-5.6L14 13l-3-3z"/>',
    memory: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    sound: '<path d="M5 10v4h3l4 4V6l-4 4z"/><path d="M15 9a4 4 0 0 1 0 6"/>',
    folder: '<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
    cpu: '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M6 2v3m12-2v3M6 19v3m12-3v3M2 6h3m14 0h3M2 18h3m14 0h3"/>',
    sliders: '<path d="M5 8h9m3 0h2M5 16h3m3 0h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z"/>',
    palette: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="1.3"/><circle cx="14" cy="9" r="1.3"/><circle cx="15.5" cy="13.5" r="1.3"/><path d="M12 20c-1 0-1.5-.8-1.5-1.5 0-1.4 1.6-1.6 2.7-2.4 1.4-1 .8-2.6-.7-2.1"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    warn: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4m0 3v.5"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.6 4.7L4 16.1V20h3.9l4.9-4.9a4 4 0 0 0 4.7-5.6L14 13l-3-3z"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 3v4h-4"/>',
    terminal: '<path d="m5 7 5 5-5 5M12 17h7"/>',
    dot: '<circle cx="12" cy="12" r="4"/>',
    more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
    external: '<path d="M14 4h6v6M20 4 11 13M9 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-4"/>'
  };
  function icon(name, cls) {
    var p = ICONS[name] || ICONS.gear;
    return '<svg class="' + (cls || "") + '" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }
  function domainIcon(domainId, title) {
    var k = (String(domainId) + " " + String(title || "")).toLowerCase();
    if (/chat|conversation|prompt/.test(k)) return "chat";
    if (/provider|model|account|route/.test(k)) return "plug";
    if (/editor|code|completion/.test(k)) return "code";
    if (/agent|persona|crew|assistant/.test(k)) return "agent";
    if (/tool|command|skill|plugin|mcp/.test(k)) return "tool";
    if (/memor|context|knowledge/.test(k)) return "memory";
    if (/sound|media|voice|audio/.test(k)) return "sound";
    if (/file|workspace|project|artifact/.test(k)) return "folder";
    if (/secur|privacy|permission/.test(k)) return "shield";
    if (/appearance|theme|display|ui/.test(k)) return "palette";
    if (/system|advanced|diagnos|health|backup|lifecycle/.test(k)) return "cpu";
    return "sliders";
  }

  /* ---------- fixture access (defensive) ---------------------------------- */
  function currentProject() {
    try {
      var p = store.currentProject();
      if (p && (p.name || p.label)) return p;
    } catch (e) { /* fall through */ }
    return { name: "puppet-master", id: "current" };
  }
  function domains() { return REG.DOMAINS || []; }
  function domainById(id) {
    try { return REG.domainById(id); } catch (e) { /* fall through */ }
    var ds = domains();
    for (var i = 0; i < ds.length; i++) if (ds[i].id === id) return ds[i];
    return null;
  }
  function managerById(id) {
    try { return REG.managerById(id); } catch (e) { /* fall through */ }
    var ms = REG.MANAGERS || [];
    for (var i = 0; i < ms.length; i++) if (ms[i].id === id) return ms[i];
    return null;
  }
  function managersByDomain(did) {
    try { return REG.managersByDomain(did) || []; } catch (e) { /* fall through */ }
    var out = [], ms = REG.MANAGERS || [];
    for (var i = 0; i < ms.length; i++) if (ms[i].domain === did) out.push(ms[i]);
    return out;
  }
  function categoryForDomain(did) {
    var cats = INV.categories || [];
    for (var i = 0; i < cats.length; i++) if (cats[i].id === did) return cats[i];
    return null;
  }
  function settingById(id) { return INV.settings ? INV.settings[id] : null; }
  function allSettingIds() {
    var ids = [];
    if (INV.settings) for (var k in INV.settings) if (Object.prototype.hasOwnProperty.call(INV.settings, k)) ids.push(k);
    return ids;
  }
  function subgroupsForDomain(did) {
    var cat = categoryForDomain(did);
    if (cat && cat.subgroups && cat.subgroups.length) {
      return cat.subgroups.map(function (sg) {
        var rows = [];
        (sg.settings || []).forEach(function (sid) {
          var s = settingById(sid);
          if (s) rows.push(s);
        });
        return { id: sg.id, title: sg.title || human(sg.id), description: sg.description || "", settings: rows };
      });
    }
    /* fallback: group flat settings by subgroup key */
    var bySub = {};
    allSettingIds().forEach(function (sid) {
      var s = settingById(sid);
      if (s && s.domain === did) {
        var key = s.subgroup || "general";
        if (!bySub[key]) bySub[key] = { id: key, title: human(key), description: "", settings: [] };
        bySub[key].settings.push(s);
      }
    });
    var out = [];
    for (var k in bySub) if (Object.prototype.hasOwnProperty.call(bySub, k)) out.push(bySub[k]);
    return out;
  }
  function domainSettingCount(did) {
    var n = 0;
    subgroupsForDomain(did).forEach(function (sg) { n += sg.settings.length; });
    return n;
  }
  function storeValue(s) {
    try { return store.value(s.id, s.default); } catch (e) { return s.value != null ? s.value : s.default; }
  }
  function isOverridden(id) {
    try {
      var ov = store.overrides();
      return !!(ov && (ov[id] != null));
    } catch (e) { return false; }
  }
  function effectiveState(s) {
    if (s.state === "managed" || s.state === "unavailable") return s.state;
    return isOverridden(s.id) ? "custom" : (s.state || "default");
  }
  function settingValueOrDefault(s, v) {
    return v === undefined ? s.default : v;
  }

  /* ---------- toasts ------------------------------------------------------ */
  var toastsEl = null;
  function toast(msg) {
    if (!toastsEl) return;
    var t = el("div", "pm-notice", '<div class="pm-notice-head">' + esc(msg) + "</div>");
    t.setAttribute("data-kind", "info");
    t.setAttribute("role", "status");
    toastsEl.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3200);
  }

  /* ---------- ObservableWork helpers -------------------------------------- */
  function opSnapshot(opId) {
    try { return store.operation(opId); } catch (e) { return null; }
  }
  function normalizeOp(op) {
    var o = { title: "Operation", phases: [], completed: 0, total: 0, terminal: null, determinate: false };
    if (!op) return o;
    o.title = op.title || op.label || o.title;
    o.terminal = op.terminal || (op.state === "succeeded" || op.state === "failed" || op.state === "cancelled" ? op.state : null);
    if (op.state === "done" || op.state === "complete") o.terminal = "succeeded";
    var phs = op.phases || [];
    o.phases = phs.map(function (p, i) {
      if (typeof p === "string") return { label: human(p), status: (op.phaseIndex != null && i < op.phaseIndex) ? "done" : (op.phase && (op.phase === p || op.phase === human(p)) ? "active" : "pending") };
      return { label: p.label || p.title || human(p.id || ("Phase " + (i + 1))), status: p.status || (p.done ? "done" : "pending") };
    });
    if (typeof op.completed === "number") o.completed = op.completed;
    if (typeof op.total === "number") o.total = op.total;
    o.determinate = op.determinate || op.progressKind === "determinate" || o.total > 0;
    if (!o.phases.length && op.phase) o.phases = [{ label: human(op.phase), status: o.terminal ? "done" : "active" }];
    return o;
  }
  function opPanelHtml(opId) {
    var o = normalizeOp(opSnapshot(opId));
    var pct = o.determinate && o.total > 0 ? Math.min(100, Math.round((o.completed / o.total) * 100)) : (o.terminal ? 100 : 35);
    var html = '<div class="ct-op" data-op-panel="' + esc(opId) + '">' +
      '<div class="ct-op-title">' + esc(o.title) + (o.terminal ? ' <span class="pm-badge" data-kind="state" data-icon data-state="' + (o.terminal === "succeeded" ? "auto" : "default") + '">' + esc(human(o.terminal)) + "</span>" : "") + "</div>";
    if (o.phases.length) {
      html += '<div class="ct-op-phases">';
      o.phases.forEach(function (p) {
        html += '<span class="ct-op-phase" data-status="' + esc(p.status) + '">' +
          (p.status === "done" ? icon("check") : icon("dot")) + esc(p.label) + "</span>";
      });
      html += "</div>";
    }
    html += '<div class="ct-op-meter"><span style="inline-size:' + pct + '%"></span></div>';
    if (!o.terminal) {
      html += '<div class="ct-actions-row"><button type="button" class="pm-btn" data-variant="quiet" data-ct="op-cancel" data-arg="' + esc(opId) + '">Cancel</button></div>';
    }
    return html + "</div>";
  }
  function refreshOpPanels() {
    var panels = root.querySelectorAll("[data-op-panel]");
    for (var i = 0; i < panels.length; i++) {
      var opId = panels[i].getAttribute("data-op-panel");
      var fresh = el("div", null, opPanelHtml(opId)).firstChild;
      panels[i].parentNode.replaceChild(fresh, panels[i]);
    }
  }
  /* Run a deterministic demo operation through the store's ObservableWork. */
  function runDemoOp(spec, done) {
    var opId = null;
    try {
      opId = store.begin({
        kind: spec.kind || "demo",
        title: spec.title,
        phases: spec.phases || ["Preparing", "Applying", "Verifying"],
        determinate: true,
        total: (spec.phases || [1, 2, 3]).length,
        cancelable: spec.cancelable !== false
      });
      if (opId && opId.id) opId = opId.id;
    } catch (e) { opId = null; }
    if (!opId) {
      toast(spec.title + " — demo operation unavailable in this build.");
      if (done) done(null);
      return null;
    }
    var steps = (spec.phases || ["Preparing", "Applying", "Verifying"]).length;
    var i = 0;
    function tick() {
      if (cancelledOps[opId]) return;
      try {
        if (i < steps) {
          if (store.advance) store.advance(opId, i + 1);
          if (i > 0 && store.completePhase) store.completePhase(opId);
          i++;
          timerMap[opId] = setTimeout(tick, 340);
        } else {
          if (store.completePhase) { try { store.completePhase(opId); } catch (e2) { /* done */ } }
          if (store.finish) store.finish(opId, "succeeded", "Completed");
          if (done) done(opId);
        }
      } catch (e3) { if (done) done(opId); }
    }
    timerMap[opId] = setTimeout(tick, 340);
    return opId;
  }
  var timerMap = {};
  var cancelledOps = {};
  function cancelOp(opId) {
    cancelledOps[opId] = true;
    if (timerMap[opId]) { clearTimeout(timerMap[opId]); delete timerMap[opId]; }
    try { if (store.finish) store.finish(opId, "cancelled", "Cancelled by user"); } catch (e) { /* ignore */ }
    refreshOpPanels();
    toast("Operation cancelled.");
  }

  /* ---------- navigation state -------------------------------------------- */
  var route = { view: "home" };
  var stack = [];
  var expandedSubgroups = {};
  var seqState = {};      /* setup-sequence: managerId -> step index */
  var rosterSel = {};     /* resource-roster: managerId -> object id */
  var mgrSubpage = {};    /* managerId -> subpage id */
  var pendingRestoreSearch = false;
  var compendiumState = { domain: null, exposure: null, state: null, type: null, text: "" };
  var copyState = { step: 1, sourceId: null, cats: [], preview: null, opId: null, applied: false };

  function routeDepth(r) {
    if (r.view === "home") return 0;
    if (r.view === "manager" || r.view === "shell") return 2;
    return 1;
  }
  function routeDomain(r) {
    if (r.view === "domain" || r.view === "manager" || r.view === "shell") return r.domain;
    return null;
  }

  function navigate(r, opts) {
    opts = opts || {};
    if (!opts.replace) stack.push(route);
    route = r;
    renderAll(opts.dir || "deep");
  }
  function backTargetName() {
    if (!stack.length) return "Home";
    var prev = stack[stack.length - 1];
    return routeName(prev);
  }
  function routeName(r) {
    if (r.view === "home") return "Home";
    if (r.view === "compendium") return "All Settings";
    if (r.view === "copy") return "Copy Settings";
    if (r.view === "domain") { var d = domainById(r.domain); return d ? d.title : "Chapter"; }
    if (r.view === "manager") { var m = managerById(r.manager); return m ? m.title : "Manager"; }
    if (r.view === "shell") { var o = ownerById(r.owner); return o ? human(o.family) : "Owned area"; }
    return "Settings";
  }
  function goBack() {
    if (stack.length) {
      route = stack.pop();
      renderAll("back");
      if (pendingRestoreSearch) {
        pendingRestoreSearch = false;
        restoreSearchFromStore();
      }
    }
  }
  function ownerById(id) {
    var os = REG.DEFERRED_OWNERS || [];
    for (var i = 0; i < os.length; i++) if (os[i].id === id) return os[i];
    return null;
  }

  /* ---------- chrome render (header + edge, persistent) -------------------- */
  var headEl, crumbsEl, edgeEl, canvasEl, stackEl, pageEl, scrollEl;
  var headerInput, headerDrop, homeInput = null, homeDrop = null;

  function buildChrome() {
    root.innerHTML = "";
    root.appendChild(headEl = el("header", "ct-head"));
    var nav = el("div", "ct-head-nav");
    nav.innerHTML =
      '<button type="button" class="ct-iconbtn ct-chapters-btn" data-ct="chapters" aria-label="Open chapters menu" title="Chapters">' + icon("menu") + "</button>" +
      '<button type="button" class="ct-iconbtn" data-ct="back" aria-label="Back" title="Back">' + icon("back") + "</button>";
    headEl.appendChild(nav);
    headEl.appendChild(crumbsEl = el("nav", "ct-crumbs", ""));
    crumbsEl.setAttribute("aria-label", "Breadcrumb");

    var sw = el("div", "ct-head-search");
    sw.innerHTML = icon("search") +
      '<input id="pmv2-search" class="ct-search-input" type="text" autocomplete="off" spellcheck="false" placeholder="Search settings, managers, objects…" aria-label="Search settings" aria-expanded="false" aria-controls="pmv2-results">' +
      '<button type="button" class="ct-search-clear" data-ct="search-clear" aria-label="Clear search" hidden>' + icon("close") + "</button>" +
      '<div id="pmv2-results" class="ct-results pmv2-scroll" hidden role="listbox" aria-label="Search results"></div>';
    headEl.appendChild(sw);
    headerInput = sw.querySelector("#pmv2-search");
    headerDrop = sw.querySelector("#pmv2-results");

    headEl.appendChild(el("span", "ct-project-chip", icon("folder") + "<span>" + esc(currentProject().name || "puppet-master") + "</span>"));

    var closeBtn = el("button", "ct-iconbtn", icon("close") + "<span>Close Settings</span>");
    closeBtn.type = "button";
    closeBtn.setAttribute("data-wide", "");
    closeBtn.setAttribute("data-ct", "close-settings");
    headEl.appendChild(closeBtn);

    var body = el("div", "ct-body");
    body.appendChild(edgeEl = el("nav", "ct-edge pmv2-scroll", ""));
    edgeEl.setAttribute("aria-label", "Chapters");
    body.appendChild(canvasEl = el("div", "ct-canvas"));
    canvasEl.appendChild(stackEl = el("div", "ct-stack"));
    stackEl.appendChild(pageEl = el("div", "ct-page"));
    pageEl.appendChild(scrollEl = el("div", "ct-page-scroll pmv2-scroll"));
    root.appendChild(body);
    root.appendChild(toastsEl = el("div", "ct-toasts"));
    buildEdge();
    wireSearchBox(headerInput, headerDrop);
  }

  function buildEdge() {
    var html = '<button type="button" class="ct-edge-tab" data-ct="nav-home" role="tab" aria-selected="false">' +
      icon("home") + '<span class="ct-edge-tab-label">Home</span></button>' +
      '<span class="ct-edge-sep"></span>';
    domains().forEach(function (d) {
      html += '<button type="button" class="ct-edge-tab" data-ct="nav-domain" data-arg="' + esc(d.id) + '" data-domain-id="' + esc(d.id) + '" role="tab" aria-selected="false" title="' + esc(d.title) + '">' +
        icon(domainIcon(d.id, d.title)) + '<span class="ct-edge-tab-label">' + esc(d.title) + "</span></button>";
    });
    html += '<span class="ct-edge-sep"></span>' +
      '<button type="button" class="ct-edge-tab" data-ct="nav-compendium" data-util role="tab" aria-selected="false">' + icon("list") + '<span class="ct-edge-tab-label">All Settings</span></button>' +
      '<button type="button" class="ct-edge-tab" data-ct="nav-copy" data-util role="tab" aria-selected="false">' + icon("copy") + '<span class="ct-edge-tab-label">Copy Settings</span></button>';
    edgeEl.innerHTML = html;
  }

  function updateChrome() {
    /* edge selection */
    var curDomain = routeDomain(route);
    var tabs = edgeEl.querySelectorAll(".ct-edge-tab");
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i], act = t.getAttribute("data-ct"), arg = t.getAttribute("data-arg");
      var sel = false;
      if (act === "nav-home") sel = route.view === "home";
      else if (act === "nav-domain") sel = curDomain === arg;
      else if (act === "nav-compendium") sel = route.view === "compendium";
      else if (act === "nav-copy") sel = route.view === "copy";
      t.setAttribute("aria-selected", sel ? "true" : "false");
    }
    /* back button */
    var backBtn = headEl.querySelector('[data-ct="back"]');
    backBtn.disabled = !stack.length;
    backBtn.setAttribute("aria-label", "Back to " + backTargetName());
    backBtn.title = "Back to " + backTargetName();
    /* breadcrumbs */
    var parts = [{ label: "Settings", r: { view: "home" } }];
    if (curDomain) { var d = domainById(curDomain); parts.push({ label: d ? d.title : curDomain, r: { view: "domain", domain: curDomain } }); }
    if (route.view === "manager") {
      var m = managerById(route.manager);
      parts.push({ label: m ? m.title : route.manager, r: null });
      if (route.object) parts.push({ label: objectLabel(route.manager, route.object), r: null });
    } else if (route.view === "shell") {
      var o = ownerById(route.owner);
      parts.push({ label: o ? human(o.family) : "Owned area", r: null });
    } else if (route.view === "compendium") {
      parts.push({ label: "All Settings", r: null });
    } else if (route.view === "copy") {
      parts.push({ label: "Copy Settings", r: null });
    } else if (route.view === "domain") {
      parts[parts.length - 1].r = null;
    }
    var ch = "";
    parts.forEach(function (p, idx) {
      if (idx) ch += icon("chev");
      if (p.r && idx < parts.length - 1) {
        ch += '<button type="button" data-ct="crumb" data-arg="' + idx + '">' + esc(p.label) + "</button>";
      } else {
        ch += '<span class="ct-crumb-here">' + esc(p.label) + "</span>";
      }
    });
    crumbsEl.innerHTML = ch;
    crumbsEl._parts = parts;
    /* stack depth drives the layered surfaces */
    stackEl.setAttribute("data-depth", String(Math.min(3, routeDepth(route))));
  }

  function objectLabel(managerId, objectId) {
    var objs = rosterFor(managerId);
    for (var i = 0; i < objs.length; i++) if (objs[i].id === objectId) return objs[i].label;
    return objectId;
  }

  /* ---------- page render dispatch ---------------------------------------- */
  function renderAll(dir) {
    closeSearchDrops();
    closePushMenu();
    clearLocate();
    scrollEl._repaintComp = null;
    scrollEl.style.padding = "";
    scrollEl.style.display = "";
    scrollEl.style.flexDirection = "";
    scrollEl.style.overflow = "";
    updateChrome();
    scrollEl.scrollTop = 0;
    pageEl.setAttribute("data-enter", dir === "back" ? "back" : "deep");
    setTimeout(function () { pageEl.removeAttribute("data-enter"); }, 320);
    if (route.view === "home") renderHome();
    else if (route.view === "domain") renderDomain(route.domain);
    else if (route.view === "manager") renderManager(route.manager, route);
    else if (route.view === "shell") renderShell(route.owner);
    else if (route.view === "compendium") renderCompendium();
    else if (route.view === "copy") renderCopy();
    syncScenarioStrip();
    if (route._locate) {
      var target = route._locate;
      delete route._locate;
      setTimeout(function () { locateNow(target); }, 60);
    }
  }

  /* ---------- Home ---------------------------------------------------------- */
  function renderHome() {
    var p = currentProject();
    var notices = (CORE.notices || []);
    var critical = null, attn = [];
    notices.forEach(function (n) {
      var kind = n.kind || "";
      if (kind === "critical" && !critical) critical = n;
      else if ((kind === "attention" || kind === "setup" || kind === "critical") && attn.length < 4) attn.push(n);
    });
    if (!critical && attn.length) { critical = attn.shift(); }

    var html = '<div class="ct-home-hero">' +
      "<h1>Settings</h1>" +
      "<p>Project <b>" + esc(p.name || "puppet-master") + "</b> — every setting here applies to the current project. Pick a chapter tab on the edge, or search across everything.</p>" +
      "</div>";

    html += '<div class="ct-home-search">' + icon("search") +
      '<input class="ct-search-input" type="text" autocomplete="off" spellcheck="false" placeholder="Search all settings, managers, and objects…" aria-label="Search settings from Home">' +
      '<div class="ct-results pmv2-scroll" hidden role="listbox" aria-label="Search results"></div></div>';

    if (critical) {
      html += '<div class="ct-home-banner"><div class="pm-notice" data-kind="' + esc(critical.kind || "attention") + '">' +
        '<span class="pm-notice-chip">' + (critical.kind === "critical" ? "Critical" : "Needs attention") + "</span>" +
        '<div class="pm-notice-head">' + esc(critical.headline || critical.title || "Attention needed") + "</div>" +
        '<div class="pm-notice-body">' + esc(critical.consequence || critical.body || "") + "</div>" +
        '<div class="pm-notice-actions"><button type="button" class="pm-btn" data-variant="primary" data-ct="notice-act" data-arg="' + esc(critical.id || "") + '">' + esc(critical.actionLabel || "Review") + "</button></div>" +
        "</div></div>";
    }

    if (attn.length) {
      html += '<div class="ct-home-attn"><h2 class="ct-section-h">Needs attention</h2><div class="ct-attn-list">';
      attn.slice(0, 4).forEach(function (n) {
        html += '<button type="button" class="ct-attn-row" data-ct="notice-act" data-arg="' + esc(n.id || "") + '">' +
          icon("warn") + '<span class="ct-attn-row-text"><b style="font-weight:650">' + esc(n.headline || n.title || "Item") + "</b> — " + esc(n.consequence || n.body || "") + "</span></button>";
      });
      html += "</div></div>";
    }

    html += '<h2 class="ct-section-h">Chapters</h2><div class="ct-home-grid">';
    domains().forEach(function (d) {
      var mgrs = managersByDomain(d.id);
      html += '<button type="button" class="ct-dest" data-ct="nav-domain" data-arg="' + esc(d.id) + '" data-domain-id="' + esc(d.id) + '">' +
        icon(domainIcon(d.id, d.title)) +
        '<span class="ct-dest-title">' + esc(d.title) + "</span>" +
        '<span class="ct-dest-blurb">' + esc(d.blurb || "") + "</span>" +
        '<span class="ct-dest-meta">' + mgrs.length + " managers · " + domainSettingCount(d.id) + " settings</span></button>";
    });
    html += "</div>";

    html += '<h2 class="ct-section-h">Utilities</h2><div class="ct-home-utils">';
    html += '<div class="ct-util"><h3>Recent</h3>';
    var recents = (CORE.recents || []).slice(0, 5);
    if (recents.length) {
      recents.forEach(function (r, i) {
        html += '<button type="button" class="ct-util-row" data-ct="recent" data-arg="' + i + '">' + icon("clock") + "<span>" + esc(r.label || r.title || r.name || ("Recent item " + (i + 1))) + "</span></button>";
      });
    } else {
      html += '<p class="ct-note">Nothing opened yet in this session.</p>';
    }
    html += "</div>";
    html += '<div class="ct-util"><h3>Index &amp; transfer</h3>' +
      '<button type="button" class="ct-util-row" data-ct="nav-compendium">' + icon("list") + "<span>All Settings — the complete 828-row index</span></button>" +
      '<button type="button" class="ct-util-row" data-ct="nav-copy">' + icon("copy") + "<span>Copy Settings from another project</span></button>" +
      "</div>";
    html += "</div>";

    scrollEl.innerHTML = html;
    homeInput = scrollEl.querySelector(".ct-home-search input");
    homeDrop = scrollEl.querySelector(".ct-home-search .ct-results");
    wireSearchBox(homeInput, homeDrop);
  }

  /* ---------- chapter (domain) page ---------------------------------------- */
  function renderDomain(did) {
    var d = domainById(did) || { id: did, title: human(did), blurb: "" };
    var mgrs = managersByDomain(did);
    var subs = subgroupsForDomain(did);
    var owners = (REG.DEFERRED_OWNERS || []).filter(function (o) { return o.domain === did; });

    var html = '<div data-domain-id="' + esc(did) + '">' +
      '<div class="ct-pagehead"><h1>' + esc(d.title) + "</h1><p>" + esc(d.blurb || "") + "</p></div>";

    if (mgrs.length) {
      html += '<h2 class="ct-section-h">Managers</h2><div class="ct-mgr-cards">';
      mgrs.forEach(function (m) {
        html += '<button type="button" class="ct-mgr-card" data-ct="nav-manager" data-arg="' + esc(m.id) + '" data-manager-id="' + esc(m.id) + '">' +
          icon(domainIcon(m.id, m.title)) +
          '<span class="ct-mgr-card-title">' + esc(m.title) + "</span>" +
          icon("chev", "ct-chev") +
          '<span class="ct-mgr-card-sum">' + esc(m.summary || "") + "</span></button>";
      });
      html += "</div>";
    }

    html += '<h2 class="ct-section-h">Settings in this chapter</h2><div class="ct-domain-cols">';
    if (route && route.view === "domain" && route.domain === did && route.section && route._locate && route._locate.settingId) {
      expandedSubgroups[route.section] = true;
    }
    subs.forEach(function (sg) {
      var expanded = !!expandedSubgroups[sg.id];
      var rows = expanded ? sg.settings : sg.settings.slice(0, 12);
      html += '<section class="ct-subgroup" data-section-id="' + esc(sg.id) + '">' +
        '<div class="ct-subgroup-head"><h2>' + esc(sg.title) + "</h2><span>" + sg.settings.length + " settings</span>" +
        (sg.description ? "<p>" + esc(sg.description) + "</p>" : "") + "</div>" +
        '<div class="ct-rows">';
      rows.forEach(function (s) { html += settingRowHtml(s); });
      html += "</div>";
      if (sg.settings.length > 12) {
        html += '<div class="ct-actions-row" style="margin-block-start:8px"><button type="button" class="pm-btn" data-variant="quiet" data-ct="sg-toggle" data-arg="' + esc(sg.id) + '">' +
          (expanded ? "Show fewer" : "Show all " + sg.settings.length) + "</button></div>";
      }
      html += "</section>";
    });
    html += "</div>";

    if (owners.length) {
      html += '<h2 class="ct-section-h">Owned by other surfaces</h2><div class="ct-mgr-cards">';
      owners.forEach(function (o) {
        html += '<button type="button" class="ct-mgr-card" data-ct="nav-shell" data-arg="' + esc(o.id) + '">' +
          icon("external") +
          '<span class="ct-mgr-card-title">' + esc(human(o.family)) + "</span>" +
          icon("chev", "ct-chev") +
          '<span class="ct-mgr-card-sum">Owned by ' + esc(o.owner) + ". This demo shows the insertion point.</span></button>";
      });
      html += "</div>";
    }
    html += "</div>";
    scrollEl.innerHTML = html;
  }

  /* ---------- setting rows --------------------------------------------------- */
  var STATE_LABELS = { default: "Default", custom: "Custom", managed: "Managed", unavailable: "Unavailable" };
  function settingRowHtml(s) {
    var st = effectiveState(s);
    var disabled = st === "managed" || st === "unavailable";
    var v = settingValueOrDefault(s, storeValue(s));
    var html = '<div class="ct-row" data-setting-id="' + esc(s.id) + '" data-state="' + esc(st) + '">' +
      '<div class="ct-row-main"><div class="ct-row-label">' + esc(s.label || human(s.id)) +
      ' <span class="pm-badge" data-kind="state" data-icon data-state="' + (st === "custom" ? "effective-differs" : (st === "default" ? "default" : st)) + '">' + esc(STATE_LABELS[st] || human(st)) + "</span>" +
      (s.exposure && s.exposure !== "standard" ? ' <span class="pm-badge" data-kind="exposure" data-icon data-exposure="' + esc(s.exposure) + '">' + esc(human(s.exposure)) + "</span>" : "") +
      "</div>" +
      (s.desc ? '<div class="ct-row-desc">' + esc(s.desc) + "</div>" : "") +
      "</div>" +
      '<div class="ct-row-ctl">' + controlHtml(s, v, disabled) +
      (st === "custom" && !disabled ? '<button type="button" class="pm-btn" data-variant="quiet" data-ct="reset-setting" data-arg="' + esc(s.id) + '">Reset</button>' : "") +
      "</div>" +
      '<details class="ct-row-details"><summary>Why this value?</summary><div class="ct-row-evidence">' +
      '<p class="ct-note">Default: <b>' + esc(formatVal(s.default)) + "</b>" +
      (s.recommended !== undefined ? " · Recommended: <b>" + esc(formatVal(s.recommended)) + "</b>" : "") +
      (s.tier ? " · Tier: " + esc(human(s.tier)) : "") +
      (s.source ? " · Source: " + esc(human(s.source)) : "") + "</p>" +
      (st === "managed" ? '<p class="ct-note" data-tone="warn">This value is managed for the current project and cannot be changed here.</p>' : "") +
      (st === "unavailable" ? '<p class="ct-note" data-tone="warn">Not available with the current project configuration.</p>' : "") +
      "</div></details></div>";
    return html;
  }
  function formatVal(v) {
    if (v === true) return "On";
    if (v === false) return "Off";
    if (v == null || v === "") return "Not set";
    return String(v);
  }
  function controlHtml(s, v, disabled) {
    var dis = disabled ? " disabled" : "";
    var type = s.type || "text";
    var opts = (s.options || []).map(function (o) {
      return (o && typeof o === "object") ? { value: o.value, label: o.label || human(o.value) } : { value: o, label: human(o) };
    });
    if (type === "toggle" || type === "boolean" || typeof v === "boolean") {
      return '<button type="button" class="pm-switch" role="switch" aria-checked="' + (v === true) + '" data-sid="' + esc(s.id) + '" aria-label="' + esc(s.label) + '"' + dis + "></button>";
    }
    if ((type === "select" || type === "enum") && opts.length) {
      return '<span class="pm-select"><select data-sid="' + esc(s.id) + '" aria-label="' + esc(s.label) + '"' + dis + ">" +
        opts.map(function (o) {
          return '<option value="' + esc(o.value) + '"' + (String(o.value) === String(v) ? " selected" : "") + ">" + esc(o.label) + "</option>";
        }).join("") + "</select></span>";
    }
    if (type === "segmented" && opts.length) {
      return '<span class="pm-seg" role="radiogroup" aria-label="' + esc(s.label) + '" data-sid="' + esc(s.id) + '">' +
        opts.map(function (o) {
          return '<button type="button" role="radio" aria-checked="' + (String(o.value) === String(v)) + '" data-value="' + esc(o.value) + '"' + dis + ">" + esc(o.label) + "</button>";
        }).join("") + "</span>";
    }
    if (type === "slider") {
      return '<span class="pm-sliderwrap"><input type="range" class="pm-slider" data-sid="' + esc(s.id) + '" min="' + (s.min || 0) + '" max="' + (s.max == null ? 100 : s.max) + '" step="' + (s.step || 1) + '" value="' + esc(v) + '" aria-label="' + esc(s.label) + '"' + dis + '><output class="pm-slider-val">' + esc(v) + (s.unit ? " " + esc(s.unit) : "") + "</output></span>";
    }
    if (type === "number" || typeof v === "number") {
      return '<span class="pm-stepper" data-sid="' + esc(s.id) + '"><button type="button" data-step="-1" aria-label="Decrease"' + dis + ">−</button>" +
        '<input type="number" value="' + esc(v) + '" min="' + (s.min || 0) + '" max="' + (s.max == null ? 999 : s.max) + '" aria-label="' + esc(s.label) + '"' + dis + ">" +
        '<button type="button" data-step="1" aria-label="Increase"' + dis + ">+</button></span>";
    }
    return '<input class="pm-input" type="text" data-sid="' + esc(s.id) + '" value="' + esc(v == null ? "" : v) + '" aria-label="' + esc(s.label) + '"' + dis + ">";
  }

  /* ---------- roster access -------------------------------------------------- */
  var rosterCache = null;
  function rosters() {
    if (!rosterCache) {
      try { rosterCache = (OBJ && OBJ.objects()) || {}; } catch (e) { rosterCache = {}; }
    }
    return rosterCache;
  }
  function rosterFor(managerId) {
    var m = managerById(managerId);
    if (!m) return [];
    if (m.objectSource === "providers" && CORE.providers) {
      return CORE.providers.map(function (p) {
        return {
          id: p.id, label: p.name || p.label || p.id,
          typeLabel: "Provider",
          sub: (p.accounts && p.accounts.length ? p.accounts.length + " account" + (p.accounts.length === 1 ? "" : "s") : "No accounts") +
            (p.installState ? " · " + human(p.installState) : ""),
          health: p.health || null, raw: p
        };
      });
    }
    var rs = rosters();
    var key = m.objectSource;
    var list = key && rs[key] ? rs[key] : null;
    if (!list) {
      /* fallback: first roster whose entries point at this manager */
      for (var k in rs) {
        if (!Object.prototype.hasOwnProperty.call(rs, k)) continue;
        var arr = rs[k] || [];
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].manager === managerId) { list = arr; break; }
        }
        if (list) break;
      }
    }
    return (list || []).map(function (o) {
      return {
        id: o.id, label: o.label || o.name || o.id,
        typeLabel: o.typeLabel || human(o.type || "item"),
        sub: o.sub || o.typeLabel || "",
        health: o.health || null, availability: o.availability || null,
        section: o.section || null, raw: o
      };
    });
  }

  /* ---------- manager pages --------------------------------------------------- */
  function managerSubpages(m) {
    return (m.subpages || []).map(function (sp, i) {
      if (typeof sp === "string") return { id: sp, title: human(sp) };
      return { id: sp.id || sp.key || ("sub-" + i), title: sp.title || sp.label || human(sp.id || ("Page " + (i + 1))) };
    });
  }
  function currentSubpage(m) {
    var subs = managerSubpages(m);
    var sel = mgrSubpage[m.id];
    if (sel && subs.some(function (s) { return s.id === sel; })) return sel;
    return "overview";
  }
  function localTabsHtml(m) {
    var removed = {};
    var subs = managerSubpages(m).filter(function (sp) {
      var drop = sp.id === "overview" || String(sp.title).toLowerCase() === "overview";
      if (drop) removed[sp.id] = true;
      return !drop;
    });
    if (!subs.length) return "";
    var cur = currentSubpage(m);
    if (removed[cur]) cur = "overview";
    var html = '<div class="ct-localtabs pmv2-scroll" role="tablist" aria-label="' + esc(m.title) + ' sections">';
    html += '<button type="button" class="ct-localtab" role="tab" data-ct="localtab" data-arg="overview" data-section-id="overview" aria-selected="' + (cur === "overview") + '">Overview</button>';
    subs.forEach(function (sp) {
      html += '<button type="button" class="ct-localtab" role="tab" data-ct="localtab" data-arg="' + esc(sp.id) + '" data-section-id="' + esc(sp.id) + '" aria-selected="' + (cur === sp.id) + '">' + esc(sp.title) + "</button>";
    });
    return html + "</div>";
  }

  /* Settings grouped for preference-document managers: deterministic slice of
     the domain's subgroups so each manager owns a stable document. */
  function prefGroupsFor(m) {
    var subs = subgroupsForDomain(m.domain);
    if (!subs.length) return [];
    var mgrs = managersByDomain(m.domain);
    var mi = 0;
    for (var i = 0; i < mgrs.length; i++) if (mgrs[i].id === m.id) { mi = i; break; }
    var per = Math.max(1, Math.ceil(subs.length / Math.max(1, mgrs.length)));
    var start = (mi * per) % subs.length;
    var picked = [];
    for (var j = 0; j < subs.length && picked.length < Math.max(2, per); j++) {
      picked.push(subs[(start + j) % subs.length]);
    }
    return picked.map(function (sg) {
      return { id: sg.id, title: sg.title, settings: sg.settings.slice(0, 8) };
    }).filter(function (g) { return g.settings.length; });
  }

  function managerHeadHtml(m, backLabel) {
    return '<div style="padding:14px 22px 12px;border-block-end:1px solid var(--pm-line)">' +
      '<div class="ct-pagehead-row">' +
      '<div class="ct-pagehead"><h1 style="font-size:18px">' + esc(m.title) + "</h1><p>" + esc(m.summary || "") + "</p></div>" +
      '<div style="display:flex;gap:8px;align-items:center">' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-ct="back">' + icon("back") + " Back to " + esc(backLabel) + "</button>" +
      '<button type="button" class="ct-iconbtn" data-ct="mgr-overflow" data-arg="' + esc(m.id) + '" aria-label="More actions for ' + esc(m.title) + '" title="More actions">' + icon("more") + "</button>" +
      "</div></div></div>";
  }

  function renderManager(managerId, rt) {
    var m = managerById(managerId);
    if (!m) { navigate({ view: "home" }, { replace: true }); return; }
    var arch = m.archetype || "preference-document";
    var backLabel = (domainById(m.domain) || {}).title || "chapter";
    var html = '<div data-manager-id="' + esc(m.id) + '" data-domain-id="' + esc(m.domain) + '" style="display:flex;flex-direction:column;min-block-size:0;flex:1 1 auto">';
    html += managerHeadHtml(m, backLabel);
    html += localTabsHtml(m);
    html += '<div id="ct-mgr-body" style="flex:1 1 auto;min-block-size:0;display:flex;flex-direction:column"></div></div>';
    scrollEl.innerHTML = html;
    scrollEl.style.padding = "0";
    scrollEl.style.display = "flex";
    scrollEl.style.flexDirection = "column";
    scrollEl.style.overflow = "hidden";
    var body = scrollEl.querySelector("#ct-mgr-body");
    if (arch === "resource-roster") renderRoster(body, m, rt);
    else if (arch === "inventory-catalog") renderCatalog(body, m);
    else if (arch === "setup-sequence") renderSequence(body, m);
    else if (arch === "health-projection") renderHealth(body, m);
    else if (arch === "diagnostic-drawer") renderDiagnostic(body, m);
    else if (arch === "transaction") renderTransaction(body, m);
    else renderPreferenceDoc(body, m);
  }

  function mgrScroll(inner) {
    return '<div class="ct-mgr-detail-scroll pmv2-scroll" style="padding:18px 22px 26px">' + inner + "</div>";
  }

  /* --- archetype: preference-document --- */
  function renderPreferenceDoc(body, m) {
    var groups = prefGroupsFor(m);
    var sub = currentSubpage(m);
    if (sub !== "overview" && groups.length > 1) {
      /* subpage tabs focus the document on a deterministic subset */
      var idx = Math.abs(hashCode(sub)) % groups.length;
      groups = [groups[idx]];
    }
    var html = '<h2 class="ct-section-h" style="margin-block-start:0">' + esc(m.title) + " — current project</h2>";
    if (!groups.length) {
      html += '<p class="ct-note">No editable settings are projected into this manager for the current project.</p>';
    }
    groups.forEach(function (g) {
      html += '<section data-section-id="' + esc(g.id) + '"><h3 class="ct-section-h">' + esc(g.title) + "</h3>" +
        '<div class="ct-rows">';
      g.settings.forEach(function (s) { html += settingRowHtml(s); });
      html += "</div></section>";
    });
    body.innerHTML = mgrScroll(html);
  }

  function hashCode(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return h;
  }

  /* --- archetype: resource-roster (list / detail) --- */
  function renderRoster(body, m, rt) {
    var objs = rosterFor(m.id);
    var sel = rosterSel[m.id];
    if (rt && rt.object) sel = rt.object;
    if (!sel && objs.length) sel = objs[0].id;
    rosterSel[m.id] = sel;

    var isProviders = m.objectSource === "providers";
    var frame = document.querySelector(".pmx-frame");
    var squeezed = frame && frame.classList.contains("pmx-squeezed");
    var pane = squeezed ? (rt && rt.object ? "detail" : "list") : (objs.length ? "detail" : "list");
    var html = '<div class="ct-mgr" data-pane="' + pane + '" style="overflow:hidden">';
    html += '<div class="ct-mgr-list pmv2-scroll"><div class="ct-mgr-list-h"><span>' + esc(isProviders ? "Providers" : "Items") + "</span><span>" + objs.length + "</span></div>";
    if (!objs.length) {
      html += '<p class="ct-note" style="padding:8px">Nothing is registered here yet for the current project.</p>';
    }
    objs.forEach(function (o) {
      html += '<button type="button" class="ct-obj" data-ct="obj-select" data-arg="' + esc(o.id) + '" data-object-id="' + esc(o.id) + '" aria-selected="' + (o.id === sel) + '">' +
        icon(isProviders ? "plug" : "dot") +
        '<span class="ct-obj-main"><span class="ct-obj-label">' + esc(o.label) + "</span>" +
        '<span class="ct-obj-sub">' + esc(o.sub || o.typeLabel) + "</span></span>" +
        (o.health ? '<span class="ct-dot" data-health="' + esc(healthKey(o.health)) + '" title="' + esc(human(o.health)) + '"></span>' : "") +
        "</button>";
    });
    html += '</div><div class="ct-mgr-detail">';
    html += '<div style="padding:10px 14px 0"><button type="button" class="ct-iconbtn ct-mgr-back" data-wide data-ct="mgr-list-back">' + icon("back") + "<span>All " + esc(isProviders ? "providers" : "items") + "</span></button></div>";
    html += '<div class="ct-mgr-detail-scroll pmv2-scroll" id="ct-obj-detail"></div></div></div>';
    body.innerHTML = html;
    if (sel) renderObjectDetail(m, sel);
  }
  function healthKey(h) {
    h = String(h || "").toLowerCase();
    if (/ready|ok|healthy|active|good/.test(h)) return "ready";
    if (/degrad|fail|error|broken/.test(h)) return "degraded";
    if (/atten|warn|update|repair|unknown-invoke|invocation/.test(h)) return "attention";
    return "unknown";
  }
  function selectRosterObject(m, objId, rerender) {
    rosterSel[m.id] = objId;
    var mgr = root.querySelector(".ct-mgr");
    if (mgr) mgr.setAttribute("data-pane", "detail");
    var btns = root.querySelectorAll('.ct-obj[data-object-id]');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute("aria-selected", btns[i].getAttribute("data-object-id") === objId ? "true" : "false");
    renderObjectDetail(m, objId);
  }
  function renderObjectDetail(m, objId) {
    var host = root.querySelector("#ct-obj-detail");
    if (!host) return;
    var objs = rosterFor(m.id);
    var o = null;
    for (var i = 0; i < objs.length; i++) if (objs[i].id === objId) o = objs[i];
    if (!o) { host.innerHTML = '<p class="ct-note">Select an item on the left.</p>'; return; }
    var sub = currentSubpage(m);
    if (m.objectSource === "providers") host.innerHTML = providerDetailHtml(o, sub);
    else host.innerHTML = genericObjectHtml(m, o, sub);
  }
  function genericObjectHtml(m, o, sub) {
    var html = '<div data-object-id="' + esc(o.id) + '">' +
      '<div class="ct-pagehead"><h1 style="font-size:17px">' + esc(o.label) + "</h1>" +
      "<p>" + esc(o.typeLabel) + (o.sub ? " · " + esc(o.sub) : "") + "</p></div>";
    if (o.availability) html += '<p class="ct-note" data-tone="warn">' + esc(human(o.availability)) + "</p>";
    html += '<div class="ct-rows"><div class="ct-row"><div class="ct-row-main">' +
      '<div class="ct-row-label">Section</div><div class="ct-row-desc">' + esc(sub === "overview" ? "Overview" : human(sub)) + " of this item, as shown inside " + esc(m.title) + ".</div></div>" +
      '<div class="ct-row-ctl"><button type="button" class="pm-btn" data-variant="quiet" data-ct="obj-overflow" data-arg="' + esc(o.id) + '">Actions</button></div></div></div>';
    html += '<p class="ct-note" style="margin-block-start:12px">Changes made here apply to the current project only.</p></div>';
    return html;
  }
  function providerDetailHtml(o, sub) {
    var p = o.raw || {};
    var html = '<div data-object-id="' + esc(o.id) + '">' +
      '<div class="ct-pagehead"><h1 style="font-size:17px">' + esc(o.label) + "</h1>" +
      "<p>" + esc(p.authModel ? human(p.authModel) + " sign-in" : "Provider") + (p.health ? " · " + human(p.health) : "") + "</p></div>";

    if (sub === "overview" || /account|credential/i.test(sub)) {
      html += '<h3 class="ct-section-h">Accounts &amp; credentials</h3><div class="ct-rows">';
      var accounts = p.accounts || [];
      if (!accounts.length) html += '<div class="ct-row"><div class="ct-row-main"><div class="ct-row-label">No accounts connected</div><div class="ct-row-desc">Connect an account to use this provider in the current project.</div></div></div>';
      accounts.forEach(function (a) {
        var masked = a.credential ? "••••••••" + String(a.credential.last4 || a.credential.tail || "") : "••••••••";
        html += '<div class="ct-row"><div class="ct-row-main"><div class="ct-row-label">' + esc(a.label || a.name || a.id || "Account") +
          (a.health ? ' <span class="pm-badge" data-kind="state" data-icon data-state="' + (/ok|ready/.test(String(a.health)) ? "auto" : "effective-differs") + '">' + esc(human(a.health)) + "</span>" : "") +
          '</div><div class="ct-row-desc">Credential ' + esc(masked) + " — stored by the OS keychain, never shown in full.</div></div>" +
          '<div class="ct-row-ctl"><button type="button" class="pm-btn" data-variant="quiet" data-ct="prov-test" data-arg="' + esc(o.id) + '">Test</button>' +
          '<button type="button" class="pm-btn" data-variant="quiet" data-ct="prov-repair" data-arg="' + esc(o.id) + '">Repair</button></div></div>';
      });
      html += "</div>";
    }
    if (sub === "overview" || /model/i.test(sub)) {
      var models = p.models || p.modelList || [];
      html += '<h3 class="ct-section-h">Models</h3>';
      if (models.length) {
        html += '<div class="ct-rows">';
        models.slice(0, 8).forEach(function (md) {
          html += '<div class="ct-row"><div class="ct-row-main"><div class="ct-row-label">' + esc(md.name || md.label || md) + "</div>" +
            '<div class="ct-row-desc">' + esc(md.note || md.context ? ("Context " + (md.context || "—")) : "Available for routing in this project.") + "</div></div></div>";
        });
        html += "</div>";
      } else {
        html += '<p class="ct-note">The model catalog refreshes after the provider is installed and signed in.</p>';
      }
    }
    if (sub === "overview" || /install|setup/i.test(sub)) {
      html += '<h3 class="ct-section-h">Installation</h3>';
      var insts = p.installations || [];
      if (!insts.length) insts = [{ label: "Official CLI", methodLabel: "Official source", host: "This machine", environment: "User", version: p.version || "latest" }];
      insts.forEach(function (inst) {
        var st = p.installState || inst.state || "not-installed";
        html += '<div class="ct-install"><div class="ct-install-head">' + icon("terminal") + "<b>" + esc(inst.label || "Installation") + "</b>" +
          '<span class="pm-badge" data-kind="state" data-icon data-state="' + (/ready|installed/.test(String(st)) ? "auto" : (/update/.test(String(st)) ? "effective-differs" : "not-configured")) + '">' + esc(human(st)) + "</span>" +
          (inst.version ? '<span class="pm-badge" data-kind="scope">' + esc(inst.version) + "</span>" : "") + "</div>" +
          '<p class="ct-note">' + esc(inst.methodLabel || "Official source") + (inst.host ? " · " + esc(inst.host) : "") + (inst.environment ? " · " + esc(inst.environment) : "") +
          ". Installs always come from the vendor's official source — Puppet Master never bundles or pre-seeds a provider.</p>" +
          (inst.command ? '<div class="ct-install-cmd">' + esc(inst.command) + "</div>" : "") +
          '<div class="ct-actions-row">' +
          (/ready|installed/.test(String(st))
            ? '<button type="button" class="pm-btn" data-variant="quiet" data-ct="prov-update" data-arg="' + esc(o.id) + '">' + icon("refresh") + " Check for updates</button>" +
              '<button type="button" class="pm-btn" data-variant="quiet" data-ct="prov-repair" data-arg="' + esc(o.id) + '">' + icon("wrench") + " Repair</button>"
            : '<button type="button" class="pm-btn" data-variant="primary" data-ct="prov-install" data-arg="' + esc(o.id) + '">' + icon("external") + " Install / Set Up from official source</button>") +
          "</div>" +
          '<div data-op-slot="' + esc(o.id) + '"></div></div>';
      });
    }
    html += "</div>";
    return html;
  }

  /* --- archetype: inventory-catalog (faceted + virtualized) --- */
  var catalogFacet = {};
  function renderCatalog(body, m) {
    var objs = rosterFor(m.id);
    var items = objs.length ? objs.map(function (o) {
      return { id: o.id, label: o.label, sub: o.sub || o.typeLabel, group: o.typeLabel, raw: o };
    }) : prefGroupsCatalogFallback(m);
    var fkey = "cat:" + m.id;
    if (!catalogFacet[fkey]) catalogFacet[fkey] = { group: null, text: "" };
    var facets = catalogFacet[fkey];

    var groups = [];
    items.forEach(function (it) { if (groups.indexOf(it.group) < 0) groups.push(it.group); });

    var html = '<div class="ct-mgr-detail-scroll pmv2-scroll" style="padding:18px 22px 26px;display:flex;flex-direction:column;min-block-size:0">';
    html += '<div class="ct-facets"><span>Filter</span>';
    groups.forEach(function (g) {
      html += '<button type="button" class="ct-facet" data-ct="catalog-facet" data-arg="' + esc(g) + '" aria-pressed="' + (facets.group === g) + '">' + esc(g) + "</button>";
    });
    if (facets.group) html += '<button type="button" class="ct-facet" data-ct="catalog-clear">Clear</button>';
    html += '<input class="ct-search-input" style="max-inline-size:220px;margin-inline-start:auto" type="text" placeholder="Filter by name…" data-catalog-filter aria-label="Filter by name" value="' + esc(facets.text) + '"></div>';
    html += '<div id="ct-catalog-list" style="flex:1 1 auto;min-block-size:0"></div></div>';
    body.innerHTML = html;

    var filtered = function () {
      return items.filter(function (it) {
        if (facets.group && it.group !== facets.group) return false;
        if (facets.text && it.label.toLowerCase().indexOf(facets.text.toLowerCase()) < 0) return false;
        return true;
      });
    };
    var listHost = body.querySelector("#ct-catalog-list");
    var paint = function () {
      var rows = filtered();
      makeVList(listHost, rows.length, 57, function (i) {
        var it = rows[i];
        var r = el("div", "ct-vrow");
        r.setAttribute("data-object-id", it.id);
        r.setAttribute("data-ct", "catalog-open");
        r.setAttribute("data-arg", it.id);
        r.setAttribute("role", "button");
        r.tabIndex = -1;
        r.innerHTML = '<span class="ct-vrow-label">' + esc(it.label) + "</span>" +
          '<span class="ct-vrow-meta"><span class="pm-badge" data-kind="scope">' + esc(it.group) + "</span></span>" +
          '<span class="ct-vrow-sub">' + esc(it.sub || "") + "</span>";
        return r;
      });
    };
    paint();
    body._repaintCatalog = paint;
    var filterInput = body.querySelector("[data-catalog-filter]");
    filterInput.addEventListener("input", function () {
      facets.text = filterInput.value;
      paint();
    });
  }
  function prefGroupsCatalogFallback(m) {
    /* catalog with no roster: list the domain's settings as catalog entries */
    var out = [];
    subgroupsForDomain(m.domain).forEach(function (sg) {
      sg.settings.forEach(function (s) {
        out.push({ id: s.id, label: s.label || human(s.id), sub: sg.title, group: sg.title, settingId: s.id });
      });
    });
    return out;
  }

  /* --- archetype: setup-sequence --- */
  function renderSequence(body, m) {
    var subs = managerSubpages(m);
    var steps = subs.length ? subs.map(function (s) { return s.title; }) : ["Prepare", "Configure", "Verify"];
    var cur = seqState[m.id] || 0;
    var html = '<div class="ct-mgr-detail-scroll pmv2-scroll" style="padding:18px 22px 26px">' +
      stepsHtml(steps, cur) +
      '<div class="ct-rows" style="max-inline-size:680px"><div class="ct-row"><div class="ct-row-main">' +
      '<div class="ct-row-label">Step ' + (cur + 1) + ": " + esc(steps[cur]) + "</div>" +
      '<div class="ct-row-desc">This walkthrough configures ' + esc(m.title) + " for the current project. Your progress is kept if you leave and come back.</div></div></div></div>" +
      '<div class="ct-actions-row">' +
      (cur > 0 ? '<button type="button" class="pm-btn" data-variant="quiet" data-ct="seq-back" data-arg="' + esc(m.id) + '">Back a step</button>' : "") +
      (cur < steps.length - 1
        ? '<button type="button" class="pm-btn" data-variant="primary" data-ct="seq-next" data-arg="' + esc(m.id) + '">Continue</button>'
        : '<button type="button" class="pm-btn" data-variant="primary" data-ct="seq-finish" data-arg="' + esc(m.id) + '">Finish setup</button>') +
      "</div></div>";
    body.innerHTML = html;
  }
  function stepsHtml(labels, cur) {
    var html = '<div class="ct-steps">';
    labels.forEach(function (lb, i) {
      var st = i < cur ? "done" : (i === cur ? "current" : "todo");
      html += '<div class="ct-step" data-state="' + st + '"><span class="ct-step-dot">' + (i < cur ? "✓" : String(i + 1)) + '</span><span class="ct-step-label">' + esc(lb) + "</span></div>";
    });
    return html + "</div>";
  }

  /* --- archetype: health-projection --- */
  function renderHealth(body, m) {
    var surfaces = managerSubpages(m);
    var panels = [];
    var base = { id: "overall", title: "Overall" };
    [base].concat(surfaces).forEach(function (sp) {
      var proj = null;
      try { proj = store.projection(m.id + "." + sp.id); } catch (e) { proj = null; }
      panels.push({ title: sp.title, proj: proj });
    });
    var html = '<div class="ct-mgr-detail-scroll pmv2-scroll" style="padding:18px 22px 26px">' +
      '<p class="ct-note">Read-only status for the current project. Fix actions live with the owning manager.</p>' +
      '<div class="ct-health-grid" style="margin-block-start:10px">';
    panels.forEach(function (pn) {
      var state = pn.proj && pn.proj.state ? String(pn.proj.state) : "unknown";
      var msg = pn.proj && pn.proj.message ? pn.proj.message : "No signal yet in this demo state.";
      var cached = pn.proj && pn.proj.cached;
      html += '<div class="ct-health"><h3><span class="ct-dot" data-health="' + esc(healthKey(state)) + '"></span>' + esc(pn.title) + "</h3>" +
        "<p>" + esc(human(state)) + " — " + esc(msg) + (cached ? " Showing the last known good reading." : "") + "</p></div>";
    });
    html += "</div>";
    var objs = rosterFor(m.id);
    if (objs.length) {
      html += '<h3 class="ct-section-h">Tracked items</h3><div class="ct-rows">';
      objs.slice(0, 10).forEach(function (o) {
        html += '<div class="ct-row" data-object-id="' + esc(o.id) + '"><div class="ct-row-main"><div class="ct-row-label">' + esc(o.label) + "</div>" +
          '<div class="ct-row-desc">' + esc(o.sub || o.typeLabel) + "</div></div>" +
          '<div class="ct-row-ctl"><span class="ct-dot" data-health="' + esc(healthKey(o.health)) + '"></span><span class="ct-note">' + esc(human(o.health || "unknown")) + "</span></div></div>";
      });
      html += "</div>";
    }
    body.innerHTML = html + "</div>";
  }

  /* --- archetype: diagnostic-drawer --- */
  function renderDiagnostic(body, m) {
    var proj = null;
    try { proj = store.projection(m.id); } catch (e) { proj = null; }
    var html = '<div class="ct-mgr-detail-scroll pmv2-scroll" style="padding:18px 22px 26px">' +
      '<p class="ct-note">Diagnostics are read-only. Open the log drawer for the captured event stream.</p>' +
      '<div class="ct-health-grid" style="margin-block:10px"><div class="ct-health"><h3><span class="ct-dot" data-health="' + esc(healthKey(proj && proj.state)) + '"></span>Current reading</h3><p>' +
      esc(proj && proj.message ? proj.message : "No incidents recorded for the current project.") + "</p></div></div>" +
      '<div class="ct-actions-row"><button type="button" class="pm-btn" data-variant="primary" data-ct="open-logs" data-arg="' + esc(m.id) + '">' + icon("terminal") + " Open log drawer</button>" +
      '<button type="button" class="pm-btn" data-variant="quiet" data-ct="diag-refresh" data-arg="' + esc(m.id) + '">' + icon("refresh") + " Re-run checks</button></div>" +
      '<div data-op-slot="diag"></div></div>';
    body.innerHTML = html;
  }
  function logLinesFor(m) {
    var seed = Math.abs(hashCode(m.id));
    var levels = ["info", "info", "info", "warn", "info", "error", "info"];
    var events = ["Snapshot collected", "Configuration read", "Watcher heartbeat", "Slow response observed", "Cache reused", "Check failed once, retry queued", "Report sealed"];
    var out = [];
    for (var i = 0; i < 26; i++) {
      var lv = levels[(seed + i) % levels.length];
      var ev = events[(seed + i * 3) % events.length];
      var ts = "2026-08-18 09:" + String(10 + ((seed + i) % 49)).padStart(2, "0") + ":" + String((seed * 7 + i * 11) % 60).padStart(2, "0");
      out.push({ ts: ts, level: lv, text: ev });
    }
    return out;
  }
  var logDrawerEl = null;
  function openLogDrawer(m) {
    if (!logDrawerEl) {
      logDrawerEl = el("aside", "pm-drawer");
      logDrawerEl.setAttribute("data-side", "right");
      logDrawerEl.setAttribute("aria-label", "Diagnostic log");
      document.body.appendChild(logDrawerEl);
    }
    var lines = logLinesFor(m);
    var html = '<div class="ct-demo-head"><h2>' + esc(m.title) + " — log</h2><p>Captured for the current project. Read-only; newest last.</p></div>" +
      '<div style="padding:0 16px 16px"><div class="ct-logs pmv2-scroll">';
    lines.forEach(function (ln) {
      html += "<div" + (ln.level !== "info" ? ' data-level="' + ln.level + '"' : "") + ">" + esc(ln.ts + "  " + ln.level.toUpperCase().padEnd(5, " ") + "  " + ln.text) + "</div>";
    });
    html += '</div><div class="ct-actions-row"><button type="button" class="pm-btn" data-variant="quiet" data-ct="close-logs">Close</button></div></div>';
    logDrawerEl.innerHTML = html;
    logDrawerEl.hidden = false;
    scrimEl.hidden = false;
  }

  /* --- archetype: transaction (preview / confirm) --- */
  var txnState = {};
  function renderTransaction(body, m) {
    var st = txnState[m.id] || (txnState[m.id] = { phase: "preview", opId: null, done: false });
    var items = managerSubpages(m);
    if (!items.length) items = [{ id: "scope", title: "Current project data" }];
    var html = '<div class="ct-mgr-detail-scroll pmv2-scroll" style="padding:18px 22px 26px">';
    if (st.phase === "preview") {
      html += '<h2 class="ct-section-h" style="margin-block-start:0">Preview — nothing has run yet</h2>' +
        '<div class="ct-rows" style="max-inline-size:680px">';
      items.forEach(function (sp, i) {
        html += '<div class="ct-row"><div class="ct-row-main"><div class="ct-row-label">' + esc(sp.title) + "</div>" +
          '<div class="ct-row-desc">' + (3 + ((Math.abs(hashCode(m.id + sp.id)) + i) % 9)) + " entries would be processed for the current project.</div></div>" +
          '<div class="ct-row-ctl"><span class="pm-badge" data-kind="state" data-icon data-state="default">Pending</span></div></div>';
      });
      html += '</div><p class="ct-note" style="margin-block-start:10px">A restore point is created before anything changes, and the run is atomic — it either completes fully or leaves everything untouched.</p>' +
        '<div class="ct-actions-row"><button type="button" class="pm-btn" data-variant="primary" data-ct="txn-confirm" data-arg="' + esc(m.id) + '">Confirm and run</button></div>';
    } else if (st.phase === "running") {
      html += '<h2 class="ct-section-h" style="margin-block-start:0">Running</h2><div data-op-slot="txn">' + (st.opId ? opPanelHtml(st.opId) : "") + "</div>";
    } else {
      html += '<div class="ct-receipt"><h3>' + icon("check") + " Completed</h3>" +
        '<p class="ct-note">' + esc(m.title) + " finished for the current project. A restore point was taken first; you can undo from Backup &amp; restore.</p></div>" +
        '<div class="ct-actions-row"><button type="button" class="pm-btn" data-variant="quiet" data-ct="txn-reset" data-arg="' + esc(m.id) + '">Run again</button></div>';
    }
    body.innerHTML = html + "</div>";
  }

  /* ---------- deferred-owner shells ------------------------------------------ */
  function renderShell(ownerId) {
    var o = ownerById(ownerId);
    if (!o) { navigate({ view: "home" }, { replace: true }); return; }
    var d = domainById(o.domain);
    var html = '<div data-manager-id="' + esc(o.id) + '" data-domain-id="' + esc(o.domain || "") + '">' +
      '<div class="ct-pagehead-row"><div class="ct-pagehead"><h1>' + esc(human(o.family)) + "</h1>" +
      "<p>A settings surface that belongs to another part of Puppet Master.</p></div>" +
      '<button type="button" class="pm-btn" data-variant="quiet" data-ct="back">' + icon("back") + " Back to " + esc(d ? d.title : "chapter") + "</button></div>" +
      '<div class="ct-owner">' +
      '<h3 class="ct-section-h" style="margin-block-start:0">Owner</h3>' +
      '<p class="ct-note"><b>' + esc(o.owner) + "</b> owns this area.</p>" +
      '<h3 class="ct-section-h">Insertion point</h3>' +
      '<p class="ct-note">' + esc(o.insertion || "Inside this chapter.") + "</p>" +
      '<h3 class="ct-section-h">Returns to</h3>' +
      '<p class="ct-note">' + esc(o.returnContract || "The owning surface.") + "</p>" +
      '<p class="ct-note" data-tone="warn" style="margin-block-start:10px">This area is owned by ' + esc(o.owner) + "; the demo shows the insertion point only. No controls here change real state.</p>" +
      "</div></div>";
    scrollEl.innerHTML = html;
  }

  /* ---------- All Settings compendium ---------------------------------------- */
  function renderCompendium() {
    var ids = allSettingIds();
    var f = compendiumState;
    var doms = domains();
    var exposures = [], states = [], types = [];
    ids.forEach(function (id) {
      var s = settingById(id);
      if (!s) return;
      if (s.exposure && exposures.indexOf(s.exposure) < 0) exposures.push(s.exposure);
      var st = s.state || "default";
      if (states.indexOf(st) < 0) states.push(st);
      var ty = s.type || "text";
      if (types.indexOf(ty) < 0) types.push(ty);
    });
    function chips(group, values, labelFn) {
      var html = "";
      values.forEach(function (v) {
        html += '<button type="button" class="ct-facet" data-ct="facet" data-arg="' + esc(group + "|" + v) + '" aria-pressed="' + (f[group] === v) + '">' + esc(labelFn ? labelFn(v) : human(v)) + "</button>";
      });
      return html;
    }
    var html = '<div class="ct-pagehead"><h1>All Settings</h1><p>The complete index — ' + ids.length + " settings projected into the current project. Filter by facet or text; open a row to jump to its chapter.</p></div>" +
      '<div class="ct-compendium"><div>' +
      '<div class="ct-facets"><span>Chapter</span>' + chips("domain", doms.map(function (d) { return d.id; }), function (v) { var d = domainById(v); return d ? d.title : v; }) + "</div>" +
      '<div class="ct-facets"><span>Exposure</span>' + chips("exposure", exposures) + "</div>" +
      '<div class="ct-facets"><span>State</span>' + chips("state", states, function (v) { return STATE_LABELS[v] || human(v); }) + "</div>" +
      '<div class="ct-facets"><span>Type</span>' + chips("type", types) + "</div>" +
      "</div><div>" +
      '<div class="ct-facets"><input class="ct-search-input" style="max-inline-size:280px" type="text" placeholder="Filter by name or description…" data-comp-filter aria-label="Filter settings by text" value="' + esc(f.text) + '">' +
      '<button type="button" class="ct-facet" data-ct="facet-clear">Clear all filters</button><span id="ct-comp-count" style="font-size:11.5px;color:var(--pm-ink-faint)"></span></div>' +
      '<div id="ct-comp-list" class="ct-vlist-tall" style="block-size:min(58vh,560px)"></div>' +
      "</div></div>";
    scrollEl.innerHTML = html;

    var filtered = function () {
      var out = [];
      ids.forEach(function (id) {
        var s = settingById(id);
        if (!s) return;
        if (f.domain && s.domain !== f.domain) return;
        if (f.exposure && s.exposure !== f.exposure) return;
        if (f.state && (s.state || "default") !== f.state) return;
        if (f.type && (s.type || "text") !== f.type) return;
        if (f.text) {
          var hay = ((s.label || "") + " " + (s.desc || "") + " " + id).toLowerCase();
          if (hay.indexOf(f.text.toLowerCase()) < 0) return;
        }
        out.push(s);
      });
      return out;
    };
    var listHost = scrollEl.querySelector("#ct-comp-list");
    var countEl = scrollEl.querySelector("#ct-comp-count");
    var paint = function () {
      var rows = filtered();
      countEl.textContent = rows.length + " of " + ids.length + " settings";
      makeVList(listHost, rows.length, 57, function (i) {
        var s = rows[i];
        var d = domainById(s.domain);
        var r = el("div", "ct-vrow");
        r.setAttribute("data-setting-id", s.id);
        r.setAttribute("data-ct", "comp-open");
        r.setAttribute("data-arg", s.id);
        r.setAttribute("role", "button");
        r.tabIndex = -1;
        r.innerHTML = '<span class="ct-vrow-label">' + esc(s.label || human(s.id)) + "</span>" +
          '<span class="ct-vrow-meta"><span class="pm-badge" data-kind="state" data-icon data-state="' + (effectiveState(s) === "default" ? "default" : "effective-differs") + '">' + esc(STATE_LABELS[effectiveState(s)] || "Default") + "</span></span>" +
          '<span class="ct-vrow-sub">' + esc((d ? d.title : s.domain) + " · " + human(s.subgroup || "")) + "</span>";
        return r;
      });
    };
    paint();
    scrollEl._repaintComp = paint;
    var fi = scrollEl.querySelector("[data-comp-filter]");
    fi.addEventListener("input", function () { compendiumState.text = fi.value; paint(); });
  }

  /* ---------- virtualized list ----------------------------------------------- */
  function makeVList(mount, count, rowH, renderRow) {
    mount.innerHTML = "";
    mount.classList.add("ct-vlist");
    mount.classList.add("pmv2-scroll");
    var spacer = el("div");
    spacer.style.position = "relative";
    spacer.style.blockSize = (count * rowH) + "px";
    mount.appendChild(spacer);
    var WIN = 30;
    function paint() {
      var st = mount.scrollTop;
      var start = Math.max(0, Math.floor(st / rowH) - 6);
      var end = Math.min(count, start + WIN + 12);
      spacer.innerHTML = "";
      for (var i = start; i < end; i++) {
        var rowEl = renderRow(i);
        rowEl.style.position = "absolute";
        rowEl.style.insetBlockStart = (i * rowH) + "px";
        rowEl.style.insetInline = "0";
        rowEl.style.blockSize = rowH + "px";
        rowEl.style.boxSizing = "border-box";
        rowEl.style.overflow = "hidden";
        spacer.appendChild(rowEl);
      }
    }
    mount.addEventListener("scroll", paint);
    paint();
  }

  /* ---------- Copy Settings (stepwise transaction) ---------------------------- */
  var COPY_STEPS = ["Select Source", "Select Categories", "Review & Confirm", "Complete"];
  function renderCopy() {
    if (!copyEngine) {
      scrollEl.innerHTML = '<div class="ct-pagehead"><h1>Copy Settings</h1><p>The copy engine is unavailable in this build.</p></div>';
      return;
    }
    var html = '<div class="ct-pagehead-row"><div class="ct-pagehead"><h1>Copy Settings</h1>' +
      "<p>A one-time copy into the current project — preview first, a restore point is taken, the apply is atomic, and you get a receipt. Nothing syncs afterwards.</p></div>" +
      '<button type="button" class="pm-btn" data-variant="quiet" data-ct="back">' + icon("back") + " Back to " + esc(backTargetName()) + "</button></div>";
    html += stepsHtml(COPY_STEPS, copyState.step - 1);

    if (copyState.step === 1) {
      var sources = [];
      try { sources = copyEngine.sources() || []; } catch (e) { sources = []; }
      html += '<h2 class="ct-section-h">1 — Select the source project</h2><div class="ct-src-list">';
      if (!sources.length) html += '<p class="ct-note">No other projects are visible to this demo profile.</p>';
      sources.forEach(function (src) {
        var id = src.id || src.name || src.label;
        var name = src.name || src.label || id;
        var meta = src.path || src.meta || src.host || "";
        var count = (typeof src.settingCount === "number" ? src.settingCount : (typeof src.count === "number" ? src.count : (src.settings != null ? src.settings : null)));
        html += '<button type="button" class="ct-src" role="radio" data-ct="copy-src" data-arg="' + esc(id) + '" aria-checked="' + (copyState.sourceId === id) + '">' +
          '<span class="ct-src-radio"></span><span class="ct-src-name">' + esc(name) + "</span>" +
          '<span class="ct-src-count">' + (count != null ? esc(count) + " settings" : "") + "</span>" +
          '<span class="ct-src-meta">' + esc(meta) + "</span></button>";
      });
      html += '</div><div class="ct-actions-row"><button type="button" class="pm-btn" data-variant="primary" data-ct="copy-to-cats"' + (copyState.sourceId ? "" : " disabled") + ">Continue</button></div>";
    } else if (copyState.step === 2) {
      var cats = REG.COPY_CATEGORIES || [];
      html += '<h2 class="ct-section-h">2 — Select what to copy</h2><div class="ct-cat-grid">';
      cats.forEach(function (c) {
        var on = copyState.cats.indexOf(c.id) >= 0;
        html += '<button type="button" class="ct-cat" role="checkbox" data-ct="copy-cat" data-arg="' + esc(c.id) + '" aria-checked="' + on + '">' +
          '<span class="ct-cat-check">' + icon("check") + "</span>" +
          '<span><span class="ct-cat-name">' + esc(c.title || human(c.id)) + "</span>" +
          '<span class="ct-cat-note">' + esc(c.note || "") + "</span></span></button>";
      });
      html += '</div><div class="ct-actions-row">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-ct="copy-to-source">Back</button>' +
        '<button type="button" class="pm-btn" data-variant="primary" data-ct="copy-to-review"' + (copyState.cats.length ? "" : " disabled") + ">Review the copy</button></div>";
    } else if (copyState.step === 3) {
      var pv = copyState.preview;
      if (!pv) {
        try {
          copyEngine.setCategories(copyState.cats.slice());
          pv = copyState.preview = copyEngine.buildPreview();
        } catch (e) { pv = null; }
      }
      html += '<h2 class="ct-section-h">3 — Review &amp; confirm</h2>';
      if (!pv) {
        html += '<p class="ct-note" data-tone="warn">The preview could not be built. Go back and pick a source and at least one category.</p>';
      } else {
        var t = pv.totals || {};
        html += '<div class="ct-copy-totals">' +
          totalCard("add", t.add) + totalCard("replace", t.replace) + totalCard("unchanged", t.unchanged) +
          totalCard("unavailable", t.unavailable) + totalCard("conflict", t.conflict) + "</div>";
        if (pv.credentialPolicy) html += '<p class="ct-note">' + icon("shield") + " " + esc(pv.credentialPolicy) + "</p>";
        if (pv.independence) html += '<p class="ct-note">' + esc(pv.independence) + "</p>";
        var groups = pv.groups || {};
        var kinds = ["add", "replace", "conflict", "unavailable"];
        kinds.forEach(function (kind) {
          var items = groups[kind] || [];
          if (!items.length) return;
          html += '<h3 class="ct-section-h">' + esc(human(kind)) + " (" + items.length + (pv.capped ? "+" : "") + ")</h3><div class='ct-rows'>";
          items.slice(0, 60).forEach(function (it) {
            html += '<div class="ct-row"><div class="ct-row-main"><div class="ct-row-label">' + esc(it.label || it.id || it) + "</div>" +
              (it.path ? '<div class="ct-row-desc">' + esc(it.path) + "</div>" : "") + "</div></div>";
          });
          html += "</div>";
        });
      }
      html += '<div class="ct-actions-row">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-ct="copy-to-cats-back">Back</button>' +
        '<button type="button" class="pm-btn" data-variant="primary" data-ct="copy-apply"' + (copyState.preview ? "" : " disabled") + ">Confirm and apply</button></div>" +
        '<div data-op-slot="copy">' + (copyState.opId ? opPanelHtml(copyState.opId) : "") + "</div>";
    } else {
      var receipts = [];
      try { receipts = store.receipts() || []; } catch (e) { receipts = []; }
      var r = receipts.length ? receipts[receipts.length - 1] : null;
      var rps = [];
      try { rps = store.restorePoints() || []; } catch (e2) { rps = []; }
      var rp = rps.length ? rps[rps.length - 1] : null;
      html += '<h2 class="ct-section-h">4 — Complete</h2>' +
        '<div class="ct-receipt"><h3>' + icon("check") + " Copy complete</h3>" +
        '<p class="ct-note">' + esc(r && (r.summary || r.title) ? (r.summary || r.title) : "Settings were copied into the current project as a single atomic apply.") + "</p>" +
        (rp ? '<p class="ct-note">Restore point: <b>' + esc(rp.label || rp.id || "Pre-copy snapshot") + "</b></p>" : "") +
        '<div class="ct-actions-row" style="margin-block-start:10px">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-ct="copy-rollback">Roll back this copy</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-ct="copy-restart">Start another copy</button>' +
        "</div></div>" +
        '<div data-op-slot="copy-rb">' + (copyState.rbOpId ? opPanelHtml(copyState.rbOpId) : "") + "</div>";
    }
    scrollEl.innerHTML = html;
  }
  function totalCard(kind, n) {
    return '<div class="ct-total" data-kind="' + kind + '"><b>' + (typeof n === "number" ? n : 0) + "</b><span>" + esc(human(kind)) + "</span></div>";
  }
  function copyGo(step) {
    copyState.step = step;
    renderCopy();
  }

  /* ---------- search ---------------------------------------------------------- */
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
  var activeSearch = null;
  function wireSearchBox(input, drop) {
    if (!input || !drop || input._ctWired) return;
    input._ctWired = true;
    var clearBtn = input.parentNode.querySelector(".ct-search-clear");
    input.addEventListener("input", function () {
      if (clearBtn) clearBtn.hidden = !input.value;
      runSearch(input, drop);
    });
    input.addEventListener("focus", function () {
      if (input.value) runSearch(input, drop);
    });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        moveResultActive(drop, ev.key === "ArrowDown" ? 1 : -1);
      } else if (ev.key === "Enter") {
        var cur = drop.querySelector('.ct-result[data-active="true"]') || drop.querySelector(".ct-result");
        if (cur) { ev.preventDefault(); chooseResult(cur.getAttribute("data-result-id"), input.value); }
      }
    });
  }
  function runSearch(input, drop) {
    var q = input.value;
    if (!q || !q.trim()) { drop.hidden = true; drop.innerHTML = ""; input.setAttribute("aria-expanded", "false"); return; }
    activeSearch = { input: input, drop: drop };
    searchSession.query(q, function (results, meta) {
      if (!activeSearch || activeSearch.input !== input) return;
      renderResults(drop, results || [], meta || {}, q);
      drop.hidden = false;
      input.setAttribute("aria-expanded", "true");
    });
  }
  function renderResults(drop, results, meta, q) {
    var html = "";
    if (!results.length) {
      html = '<div class="ct-results-empty">No results for “' + esc(q) + "”. Try a different phrase — the index covers every setting, manager, and object.</div>";
    } else {
      var lastType = null;
      results.forEach(function (r) {
        if (r.type !== lastType) {
          lastType = r.type;
          html += '<div class="ct-results-group">' + esc(TYPE_LABELS[r.type] || human(r.type || "Result")) + "</div>";
        }
        html += '<button type="button" class="ct-result" role="option" data-result-id="' + esc(r.immutableResultId) + '" data-ct="result" data-active="false">' +
          '<span class="ct-result-label">' + markTerms(r.label || "", q) + "</span>" +
          '<span class="ct-result-type">' + esc(TYPE_LABELS[r.type] || human(r.type || "")) + "</span>" +
          '<span class="ct-result-path">' + esc(r.path || "") + "</span>" +
          (r.availability ? '<span class="ct-result-avail">' + esc(human(r.availability)) + "</span>" : "<span></span>") +
          "</button>";
      });
      if (meta.bounded && meta.total > results.length) {
        html += '<button type="button" class="ct-results-all" data-ct="search-all" data-arg="' + esc(q) + '">View all ' + meta.total + " results in All Settings</button>";
      }
    }
    drop.innerHTML = html;
  }
  function markTerms(label, q) {
    var out = esc(label);
    q.trim().split(/\s+/).forEach(function (term) {
      if (term.length < 2) return;
      var re = new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }
  function moveResultActive(drop, dir) {
    var rows = drop.querySelectorAll(".ct-result");
    if (!rows.length) return;
    var idx = -1;
    for (var i = 0; i < rows.length; i++) if (rows[i].getAttribute("data-active") === "true") { idx = i; break; }
    idx = idx + dir;
    if (idx < 0) idx = rows.length - 1;
    if (idx >= rows.length) idx = 0;
    for (var j = 0; j < rows.length; j++) rows[j].setAttribute("data-active", j === idx ? "true" : "false");
    rows[idx].scrollIntoView({ block: "nearest" });
  }
  function closeSearchDrops() {
    [headerDrop, homeDrop].forEach(function (d) {
      if (d && !d.hidden) { d.hidden = true; d.innerHTML = ""; }
    });
    if (headerInput) headerInput.setAttribute("aria-expanded", "false");
    activeSearch = null;
  }
  function anySearchOpen() {
    return (headerDrop && !headerDrop.hidden) || (homeDrop && !homeDrop.hidden);
  }

  function chooseResult(resultId, query) {
    var entry = null;
    try { entry = PM_V2_SEARCH.resolve(searchIndex, resultId); } catch (e) { entry = null; }
    if (!entry) { toast("That result is no longer available."); return; }
    closeSearchDrops();
    try { store.saveSearchState(query, resultId); } catch (e) { /* non-fatal */ }
    pendingRestoreSearch = true;
    navigateToEntry(entry);
  }
  function restoreSearchFromStore() {
    var st = null;
    try { st = store.searchState(); } catch (e) { st = null; }
    if (!st || !st.query) return;
    headerInput.value = st.query;
    var clearBtn = headerInput.parentNode.querySelector(".ct-search-clear");
    if (clearBtn) clearBtn.hidden = false;
    runSearch(headerInput, headerDrop);
    setTimeout(function () {
      var row = headerDrop.querySelector('[data-result-id="' + (st.resultId || st.id || "") + '"]');
      if (row) { row.setAttribute("data-active", "true"); row.scrollIntoView({ block: "nearest" }); }
    }, 80);
  }

  function navigateToEntry(entry) {
    var dest = entry.destination || {};
    var r = { view: "home" };
    if (dest.manager === "lifecycle" && (dest.page === "copy" || dest.section === "copy")) {
      r = { view: "copy" };
    } else if (dest.manager && managerById(dest.manager)) {
      var m = managerById(dest.manager);
      r = { view: "manager", manager: m.id, domain: m.domain, object: dest.object || null };
      var want = dest.section || dest.page || null;
      if (want) {
        var subHit = null;
        managerSubpages(m).forEach(function (s) {
          if (subHit) return;
          var slug = s.id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          var tslug = s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          if (s.id === want || slug === want || tslug === want) subHit = s.id;
        });
        if (subHit) mgrSubpage[m.id] = subHit;
      }
    } else if (dest.domain && domainById(dest.domain)) {
      r = { view: "domain", domain: dest.domain, section: dest.section || dest.page || null };
    } else if (entry.type === "manager") {
      var mm = managerById(entry.settingId || dest.page);
      if (mm) r = { view: "manager", manager: mm.id, domain: mm.domain };
    }
    var locate = {};
    if (dest.row) locate.settingId = dest.row;
    else if (entry.settingId) locate.settingId = entry.settingId;
    if (dest.object) locate.objectId = dest.object;
    if (dest.manager) locate.managerId = dest.manager;
    if (dest.section) locate.sectionId = dest.section;
    if (dest.domain) locate.domainId = dest.domain;
    r._locate = locate;
    navigate(r);
  }

  var locateEl = null;
  function clearLocate() {
    if (locateEl) { locateEl.classList.remove("pmv2-locate"); locateEl = null; }
  }
  function locateNow(spec) {
    var sel = null;
    if (spec.settingId) sel = '[data-setting-id="' + cssEsc(spec.settingId) + '"]';
    if (!sel || !root.querySelector(sel)) {
      if (spec.objectId && root.querySelector('[data-object-id="' + cssEsc(spec.objectId) + '"]')) sel = '[data-object-id="' + cssEsc(spec.objectId) + '"]';
    }
    if ((!sel || !root.querySelector(sel)) && spec.sectionId && root.querySelector('[data-section-id="' + cssEsc(spec.sectionId) + '"]')) sel = '[data-section-id="' + cssEsc(spec.sectionId) + '"]';
    if ((!sel || !root.querySelector(sel)) && spec.managerId && root.querySelector('[data-manager-id="' + cssEsc(spec.managerId) + '"]')) sel = '[data-manager-id="' + cssEsc(spec.managerId) + '"]';
    if ((!sel || !root.querySelector(sel)) && spec.domainId && root.querySelector('[data-domain-id="' + cssEsc(spec.domainId) + '"]')) sel = '[data-domain-id="' + cssEsc(spec.domainId) + '"]';
    if (!sel) return;
    var node = root.querySelector(sel);
    if (!node) return;
    clearLocate();
    locateEl = node;
    node.classList.add("pmv2-locate");
    if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "-1");
    try { node.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" }); } catch (e) { node.scrollIntoView(); }
    try { node.focus({ preventScroll: true }); } catch (e2) { /* focus best-effort */ }
  }
  function cssEsc(s) {
    return String(s).replace(/["\\]/g, "\\$&");
  }

  /* ---------- push menu (narrow chapter navigation) --------------------------- */
  var pushScrim = null, pushMenu = null;
  function openPushMenu() {
    closePushMenu();
    pushScrim = el("button", "ct-push-scrim");
    pushScrim.type = "button";
    pushScrim.setAttribute("aria-label", "Close chapters menu");
    pushScrim.addEventListener("click", closePushMenu);
    pushMenu = el("div", "ct-pushmenu pmv2-scroll");
    var cur = routeDomain(route);
    var html = '<div class="ct-pushmenu-h"><b>Chapters</b>' +
      '<button type="button" class="ct-iconbtn" data-ct="push-close" aria-label="Close chapters menu">' + icon("close") + "</button></div>";
    html += pushTabHtml("nav-home", null, "home", "Home", route.view === "home");
    html += '<div class="ct-push-sep"></div>';
    domains().forEach(function (d) {
      html += pushTabHtml("nav-domain", d.id, domainIcon(d.id, d.title), d.title, cur === d.id);
    });
    html += '<div class="ct-push-sep"></div>';
    html += pushTabHtml("nav-compendium", null, "list", "All Settings", route.view === "compendium");
    html += pushTabHtml("nav-copy", null, "copy", "Copy Settings", route.view === "copy");
    pushMenu.innerHTML = html;
    root.appendChild(pushScrim);
    root.appendChild(pushMenu);
  }
  function pushTabHtml(act, arg, ic, label, sel) {
    return '<button type="button" class="ct-push-tab" data-ct="' + act + '"' + (arg ? ' data-arg="' + esc(arg) + '"' : "") + ' aria-selected="' + !!sel + '">' +
      icon(ic) + "<span>" + esc(label) + "</span></button>";
  }
  function closePushMenu() {
    if (pushMenu && pushMenu.parentNode) pushMenu.parentNode.removeChild(pushMenu);
    if (pushScrim && pushScrim.parentNode) pushScrim.parentNode.removeChild(pushScrim);
    pushMenu = pushScrim = null;
  }

  /* ---------- demo-scenario drawer -------------------------------------------- */
  var scrimEl = document.getElementById("ct-scrim");
  var demoEl = document.getElementById("ct-demo");
  var demoListEl = document.getElementById("ct-demo-list");
  var demoBuilt = false;
  function syncDemoStates() {
    if (!demoListEl) return;
    var cur = null;
    try { cur = store.activeScenario(); } catch (e) { cur = null; }
    var all = demoListEl.querySelectorAll(".ct-scenario");
    for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-pressed", all[i].getAttribute("data-scenario") === cur ? "true" : "false");
  }
  function openDemo() {
    syncDemoStates();
    if (!demoBuilt && demoListEl) {
      demoBuilt = true;
      var scenarios = [];
      try { scenarios = store.scenarios() || []; } catch (e) { scenarios = []; }
      var active = null;
      try { active = store.activeScenario(); } catch (e2) { active = null; }
      demoListEl.innerHTML = "";
      scenarios.forEach(function (sc) {
        var name = typeof sc === "string" ? sc : (sc.name || sc.id);
        var label = typeof sc === "string" ? human(sc) : (sc.label || sc.title || human(name));
        var b = el("button", "ct-scenario", icon("dot") + "<span>" + esc(label) + "</span>");
        b.type = "button";
        b.setAttribute("data-scenario", name);
        b.setAttribute("aria-pressed", active === name ? "true" : "false");
        b.addEventListener("click", function () {
          var cur = null;
          try { cur = store.activeScenario(); } catch (e3) { cur = null; }
          try { store.setScenario(cur === name ? null : name); } catch (e4) { /* keep demo honest */ }
          var after = null;
          try { after = store.activeScenario(); } catch (e5) { after = null; }
          var all = demoListEl.querySelectorAll(".ct-scenario");
          for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-pressed", all[i].getAttribute("data-scenario") === after ? "true" : "false");
          toast("Scenario applied: " + label);
          renderAll("back");
        });
        demoListEl.appendChild(b);
      });
      if (!scenarios.length) demoListEl.innerHTML = '<p class="ct-note" style="padding:8px">No scenarios are registered in this build.</p>';
    }
    if (scrimEl) scrimEl.hidden = false;
    if (demoEl) demoEl.hidden = false;
    var btn = document.querySelector("[data-demo-open]");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }
  function closeDrawers() {
    var any = false;
    if (demoEl && !demoEl.hidden) { demoEl.hidden = true; any = true; }
    if (logDrawerEl && !logDrawerEl.hidden) { logDrawerEl.hidden = true; any = true; }
    if (scrimEl && !scrimEl.hidden) scrimEl.hidden = true;
    var btn = document.querySelector("[data-demo-open]");
    if (btn) btn.setAttribute("aria-expanded", "false");
    return any;
  }
  var demoOpenBtn = document.querySelector("[data-demo-open]");
  if (demoOpenBtn) {
    demoOpenBtn.addEventListener("click", function () {
      if (demoEl && !demoEl.hidden) closeDrawers(); else openDemo();
    });
  }
  if (scrimEl) scrimEl.addEventListener("click", closeDrawers);

  /* ---------- overflow menus (PMV2Menu) ---------------------------------------- */
  function openManagerOverflow(anchor, m) {
    if (typeof PMV2Menu === "undefined") { toast("Menus unavailable in this build."); return; }
    var groups = prefGroupsFor(m);
    var ids = [];
    groups.forEach(function (g) { g.settings.forEach(function (s) { ids.push(s.id); }); });
    PMV2Menu.open(anchor, [
      { label: "Reset this page to defaults", hint: ids.length + " settings", disabled: !ids.length, action: function () {
          ids.forEach(function (id) { try { store.resetValue(id); } catch (e) { /* per-setting */ } });
          toast("Page reset to defaults.");
          renderAll("back");
        } },
      { label: "Open this chapter in All Settings", action: function () {
          compendiumState.domain = m.domain;
          navigate({ view: "compendium" });
        } },
      { sep: true },
      { label: "Copy settings from another project…", action: function () { navigate({ view: "copy" }); } }
    ]);
  }
  function openObjectOverflow(anchor, objId) {
    if (typeof PMV2Menu === "undefined") return;
    PMV2Menu.open(anchor, [
      { label: "Rename…", action: function () { toast("Renaming is disabled in this concept preview."); } },
      { label: "Duplicate", action: function () { toast("Duplication is disabled in this concept preview."); } },
      { sep: true },
      { label: "Remove from project", danger: true, action: function () { toast("Removal is disabled in this concept preview."); } }
    ]);
  }

  /* ---------- delegation -------------------------------------------------------- */
  root.addEventListener("click", function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-ct]") : null;

    /* setting controls first (they may sit inside rows with no data-ct) */
    var sw = ev.target && ev.target.closest ? ev.target.closest(".pm-switch[data-sid]") : null;
    if (sw && !sw.disabled) {
      var sid = sw.getAttribute("data-sid");
      var next = sw.getAttribute("aria-checked") !== "true";
      try { store.setValue(sid, next); } catch (e) { return; }
      sw.setAttribute("aria-checked", String(next));
      refreshRowState(sid);
      return;
    }
    var radio = ev.target && ev.target.closest ? ev.target.closest('.pm-seg [role="radio"]') : null;
    if (radio && !radio.disabled) {
      var seg = radio.closest(".pm-seg[data-sid]");
      if (seg) {
        var sid2 = seg.getAttribute("data-sid");
        var val = radio.getAttribute("data-value");
        try { store.setValue(sid2, coerceVal(sid2, val)); } catch (e2) { return; }
        var rs = seg.querySelectorAll('[role="radio"]');
        for (var i = 0; i < rs.length; i++) rs[i].setAttribute("aria-checked", rs[i] === radio ? "true" : "false");
        refreshRowState(sid2);
      }
      return;
    }
    var stepBtn = ev.target && ev.target.closest ? ev.target.closest(".pm-stepper button[data-step]") : null;
    if (stepBtn && !stepBtn.disabled) {
      var wrap = stepBtn.closest(".pm-stepper[data-sid]");
      var input = wrap.querySelector("input");
      var cur = parseFloat(input.value) || 0;
      var nx = cur + parseFloat(stepBtn.getAttribute("data-step"));
      if (input.min !== "" && nx < parseFloat(input.min)) nx = parseFloat(input.min);
      if (input.max !== "" && nx > parseFloat(input.max)) nx = parseFloat(input.max);
      input.value = nx;
      var sid3 = wrap.getAttribute("data-sid");
      try { store.setValue(sid3, nx); } catch (e3) { return; }
      refreshRowState(sid3);
      return;
    }
    if (!t) return;
    var act = t.getAttribute("data-ct");
    var arg = t.getAttribute("data-arg");

    switch (act) {
      case "nav-home": navigate({ view: "home" }); break;
      case "nav-domain": navigate({ view: "domain", domain: arg }); break;
      case "nav-compendium": navigate({ view: "compendium" }); break;
      case "nav-copy": navigate({ view: "copy" }); break;
      case "nav-manager": {
        var m = managerById(arg);
        if (m) navigate({ view: "manager", manager: m.id, domain: m.domain });
        break;
      }
      case "nav-shell": {
        var o = ownerById(arg);
        if (o) navigate({ view: "shell", owner: o.id, domain: o.domain });
        break;
      }
      case "back": goBack(); break;
      case "close-settings":
        stack = [];
        navigate({ view: "home" }, { replace: true, dir: "back" });
        toast("Settings closed — returned Home (concept preview).");
        break;
      case "chapters": openPushMenu(); break;
      case "push-close": closePushMenu(); break;
      case "crumb": {
        var parts = crumbsEl._parts || [];
        var idx = parseInt(arg, 10);
        if (parts[idx] && parts[idx].r) navigate(parts[idx].r, { dir: "back" });
        break;
      }
      case "search-clear":
        if (headerInput) { headerInput.value = ""; t.hidden = true; runSearch(headerInput, headerDrop); headerInput.focus(); }
        break;
      case "result": chooseResult(t.getAttribute("data-result-id") || arg, activeSearch && activeSearch.input ? activeSearch.input.value : headerInput.value); break;
      case "search-all":
        compendiumState.text = arg || "";
        compendiumState.domain = compendiumState.exposure = compendiumState.state = compendiumState.type = null;
        closeSearchDrops();
        navigate({ view: "compendium" });
        break;
      case "notice-act": {
        var n = null;
        (CORE.notices || []).forEach(function (x) { if (String(x.id) === String(arg)) n = x; });
        var handled = false;
        if (n && n.manager && managerById(n.manager)) {
          var mn = managerById(n.manager);
          navigate({ view: "manager", manager: mn.id, domain: mn.domain });
          handled = true;
        } else if (n && n.domain && domainById(n.domain)) {
          navigate({ view: "domain", domain: n.domain });
          handled = true;
        }
        if (!handled) { compendiumState.state = "custom"; navigate({ view: "compendium" }); }
        break;
      }
      case "recent": {
        var r = (CORE.recents || [])[parseInt(arg, 10)];
        if (r && r.manager && managerById(r.manager)) {
          var rm = managerById(r.manager);
          navigate({ view: "manager", manager: rm.id, domain: rm.domain });
        } else if (r && r.settingId && settingById(r.settingId)) {
          var s = settingById(r.settingId);
          var rr = { view: "domain", domain: s.domain, _locate: { settingId: s.id, domainId: s.domain } };
          navigate(rr);
        } else {
          toast("That recent item is not available in this demo state.");
        }
        break;
      }
      case "sg-toggle":
        expandedSubgroups[arg] = !expandedSubgroups[arg];
        renderAll("back");
        break;
      case "reset-setting":
        try { store.resetValue(arg); } catch (e4) { break; }
        refreshRowState(arg);
        toast("Reset to default.");
        break;
      case "localtab":
        if (route.view === "manager") {
          mgrSubpage[route.manager] = arg;
          renderAll("deep");
        }
        break;
      case "obj-select":
        if (route.view === "manager") {
          var mm2 = managerById(route.manager);
          if (mm2) selectRosterObject(mm2, arg, true);
        }
        break;
      case "mgr-list-back": {
        var mgr = root.querySelector(".ct-mgr");
        if (mgr) mgr.setAttribute("data-pane", "list");
        break;
      }
      case "mgr-overflow": {
        var mo = managerById(arg);
        if (mo) openManagerOverflow(t, mo);
        break;
      }
      case "obj-overflow": openObjectOverflow(t, arg); break;
      case "catalog-facet": {
        var f = catalogFacet["cat:" + route.manager];
        if (f) { f.group = f.group === arg ? null : arg; renderAll("deep"); }
        break;
      }
      case "catalog-clear": {
        var f2 = catalogFacet["cat:" + route.manager];
        if (f2) { f2.group = null; f2.text = ""; renderAll("deep"); }
        break;
      }
      case "catalog-open": {
        var mm3 = managerById(route.manager);
        if (mm3 && mm3.objectSource) {
          rosterSel[mm3.id] = arg;
          /* catalogs with a roster open the object inside its roster manager if one exists */
          toast("Opened “" + objectLabel(mm3.id, arg) + "” in this catalog.");
        } else if (settingById(arg)) {
          var cs = settingById(arg);
          navigate({ view: "domain", domain: cs.domain, _locate: { settingId: cs.id, domainId: cs.domain } });
        }
        break;
      }
      case "facet": {
        var pair = String(arg).split("|");
        var g = pair[0], v = pair.slice(1).join("|");
        compendiumState[g] = compendiumState[g] === v ? null : v;
        renderAll("back");
        break;
      }
      case "facet-clear":
        compendiumState.domain = compendiumState.exposure = compendiumState.state = compendiumState.type = null;
        compendiumState.text = "";
        renderAll("back");
        break;
      case "comp-open": {
        var os = settingById(arg);
        if (os) navigate({ view: "domain", domain: os.domain, _locate: { settingId: os.id, domainId: os.domain } });
        break;
      }
      case "seq-next": seqState[arg] = (seqState[arg] || 0) + 1; renderAll("deep"); break;
      case "seq-back": seqState[arg] = Math.max(0, (seqState[arg] || 0) - 1); renderAll("back"); break;
      case "seq-finish":
        seqState[arg] = 0;
        toast("Setup finished for the current project.");
        renderAll("back");
        break;
      case "open-logs": {
        var dm = managerById(arg);
        if (dm) openLogDrawer(dm);
        break;
      }
      case "close-logs": closeDrawers(); break;
      case "diag-refresh": {
        var slot = root.querySelector('[data-op-slot="diag"]');
        var opId = runDemoOp({ kind: "diagnostic", title: "Re-running checks", phases: ["Collecting", "Analyzing", "Reporting"] }, function () {
          refreshOpPanels();
        });
        if (opId && slot) slot.innerHTML = opPanelHtml(opId);
        break;
      }
      case "txn-confirm": {
        var tm = managerById(arg);
        var st = txnState[arg] || (txnState[arg] = {});
        st.phase = "running";
        renderAll("deep");
        st.opId = runDemoOp({ kind: "transaction", title: tm ? tm.title : "Transaction", phases: ["Restore point", "Applying", "Verifying"] }, function () {
          st.phase = "done";
          st.done = true;
          renderAll("deep");
        });
        var slot2 = root.querySelector('[data-op-slot="txn"]');
        if (st.opId && slot2) slot2.innerHTML = opPanelHtml(st.opId);
        break;
      }
      case "txn-reset":
        txnState[arg] = { phase: "preview", opId: null, done: false };
        renderAll("back");
        break;
      case "prov-install": case "prov-update": case "prov-repair": case "prov-test": {
        var verbs = { "prov-install": "Installing from official source", "prov-update": "Checking for updates", "prov-repair": "Running repair", "prov-test": "Testing connection" };
        var slot3 = root.querySelector('[data-op-slot="' + arg + '"]') || root.querySelector("#ct-obj-detail");
        var pid = runDemoOp({ kind: "provider", title: verbs[act] + " — " + objectLabel(route.manager, arg), phases: ["Contacting official source", "Applying", "Verifying"] }, function () {
          toast(verbs[act] + " finished.");
          refreshOpPanels();
        });
        if (pid && slot3) {
          var host = el("div");
          host.innerHTML = opPanelHtml(pid);
          slot3.appendChild(host.firstChild);
        }
        break;
      }
      case "op-cancel": cancelOp(arg); break;
      case "copy-src":
        copyState.sourceId = arg;
        copyState.preview = null;
        try { copyEngine.selectSource(arg); } catch (e5) { /* engine tracks its own state */ }
        renderCopy();
        break;
      case "copy-to-cats": copyGo(2); break;
      case "copy-to-source": copyGo(1); break;
      case "copy-cat": {
        var ix = copyState.cats.indexOf(arg);
        if (ix >= 0) copyState.cats.splice(ix, 1); else copyState.cats.push(arg);
        copyState.preview = null;
        try { copyEngine.setCategories(copyState.cats.slice()); } catch (e6) { /* ignore */ }
        renderCopy();
        break;
      }
      case "copy-to-cats-back": copyGo(2); break;
      case "copy-to-review": copyState.preview = null; copyGo(3); break;
      case "copy-apply": {
        try { copyEngine.confirm(); } catch (e7) { /* state machine tolerant */ }
        var appliedOp = null;
        try { appliedOp = copyEngine.apply(); } catch (e8) { appliedOp = null; }
        var opIdC = appliedOp && (appliedOp.id || appliedOp);
        if (typeof opIdC !== "string") opIdC = null;
        if (!opIdC) {
          opIdC = runDemoOp({ kind: "copy", title: "Copying settings into the current project", phases: ["Restore point", "Applying", "Verifying", "Receipt"] }, function () {
            copyState.step = 4;
            copyState.applied = true;
            renderCopy();
          });
        } else {
          waitForOp(opIdC, function () {
            copyState.step = 4;
            copyState.applied = true;
            renderCopy();
          });
        }
        copyState.opId = opIdC;
        renderCopy();
        break;
      }
      case "copy-rollback": {
        var rb = null;
        try { rb = copyEngine.rollback(); } catch (e9) { rb = null; }
        var rbId = rb && (rb.id || rb);
        if (typeof rbId !== "string") {
          rbId = runDemoOp({ kind: "copy-rollback", title: "Rolling back the copy", phases: ["Loading restore point", "Reverting", "Verifying"] }, function () {
            copyState.step = 1; copyState.preview = null; copyState.opId = null; copyState.rbOpId = null;
            toast("Copy rolled back.");
            renderCopy();
          });
        } else {
          waitForOp(rbId, function () {
            copyState.step = 1; copyState.preview = null; copyState.opId = null; copyState.rbOpId = null;
            toast("Copy rolled back.");
            renderCopy();
          });
        }
        copyState.rbOpId = rbId;
        renderCopy();
        break;
      }
      case "copy-restart":
        copyState = { step: 1, sourceId: null, cats: [], preview: null, opId: null, applied: false };
        renderCopy();
        break;
    }
  });

  function waitForOp(opId, done) {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      var o = normalizeOp(opSnapshot(opId));
      refreshOpPanels();
      if (o.terminal || tries > 40) { clearInterval(iv); done(); }
    }, 350);
  }

  /* select / slider / text / number input changes */
  root.addEventListener("change", function (ev) {
    var t = ev.target;
    if (!t || !t.matches) return;
    if (t.matches("select[data-sid]")) {
      var sid = t.getAttribute("data-sid");
      try { store.setValue(sid, coerceVal(sid, t.value)); } catch (e) { return; }
      refreshRowState(sid);
    } else if (t.matches(".pm-slider[data-sid]")) {
      var sid2 = t.getAttribute("data-sid");
      try { store.setValue(sid2, parseFloat(t.value)); } catch (e2) { return; }
      refreshRowState(sid2);
    } else if (t.matches(".pm-stepper input")) {
      var wrap = t.closest(".pm-stepper[data-sid]");
      if (wrap) {
        var sid3 = wrap.getAttribute("data-sid");
        try { store.setValue(sid3, parseFloat(t.value) || 0); } catch (e3) { return; }
        refreshRowState(sid3);
      }
    } else if (t.matches(".pm-input[data-sid]")) {
      var sid4 = t.getAttribute("data-sid");
      try { store.setValue(sid4, t.value); } catch (e4) { return; }
      refreshRowState(sid4);
    }
  });
  root.addEventListener("input", function (ev) {
    var t = ev.target;
    if (t && t.matches && t.matches(".pm-slider[data-sid]")) {
      var out = t.parentNode.querySelector(".pm-slider-val");
      if (out) out.textContent = t.value;
    }
  });
  function coerceVal(sid, raw) {
    var s = settingById(sid);
    if (s && s.options) {
      for (var i = 0; i < s.options.length; i++) {
        var o = s.options[i];
        var v = (o && typeof o === "object") ? o.value : o;
        if (String(v) === String(raw)) return v;
      }
    }
    if (s && typeof s.default === "number") { var n = parseFloat(raw); return isNaN(n) ? raw : n; }
    if (raw === "true") return true;
    if (raw === "false") return false;
    return raw;
  }
  function refreshRowState(sid) {
    var row = root.querySelector('[data-setting-id="' + cssEsc(sid) + '"]');
    if (!row) return;
    var s = settingById(sid);
    if (!s) return;
    var fresh = el("div", null, settingRowHtml(s)).firstChild;
    row.parentNode.replaceChild(fresh, row);
    if (scrollEl._repaintComp) scrollEl._repaintComp();
  }

  /* click-away closes the search dropdowns */
  document.addEventListener("click", function (ev) {
    if (!anySearchOpen()) return;
    var inHead = headerDrop && (headerDrop.contains(ev.target) || headerInput.contains(ev.target));
    var inHome = homeDrop && (homeDrop.contains(ev.target) || (homeInput && homeInput.contains(ev.target)));
    if (!inHead && !inHome) closeSearchDrops();
  });

  /* Escape order: dropdowns/menus → drawers → one level out → stop at Home */
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    if (anySearchOpen()) { closeSearchDrops(); return; }
    if (pushMenu) { closePushMenu(); return; }
    if (closeDrawers()) return;
    if (stack.length) { goBack(); }
  });


  /* ---------- truthful scenario strip ---------------------------------------
     Renders the active demo scenario's honest projection at the top of the
     canvas; refreshed on every render and on store changes. ---------------- */
  function syncScenarioStrip() {
    if (!scrollEl) return;
    var old = scrollEl.querySelector(".ct-scenario-strip");
    if (old) old.parentNode.removeChild(old);
    var name = null;
    try { name = store.activeScenario(); } catch (e) { name = null; }
    if (!name) return;
    var pr = {};
    try { pr = store.projection("canvas") || {}; } catch (e2) { pr = {}; }
    var bar = el("div", "ct-scenario-strip");
    bar.setAttribute("role", "status");
    var msg = "Demo scenario: " + human(name) + (pr.message ? " — " + pr.message : "");
    if (pr.cached) msg += " Cached values remain visible while refreshing.";
    bar.appendChild(el("span", null, msg));
    var off = el("button", "pm-btn", "Clear");
    off.type = "button";
    off.addEventListener("click", function () {
      try { store.setScenario(null); } catch (e3) { /* noop */ }
      renderAll("back");
    });
    bar.appendChild(off);
    scrollEl.insertBefore(bar, scrollEl.firstChild);
  }

  /* store subscription: keep op panels and scenario-driven projections fresh */
  try {
    store.subscribe(function () {
      if (root.querySelector("[data-op-panel]")) refreshOpPanels();
      syncScenarioStrip();
    });
  } catch (e) { /* subscription optional */ }

  /* ---------- init ------------------------------------------------------------ */
  if (window.PMShell && window.PMShell.init) window.PMShell.init();
  buildChrome();
  renderAll("deep");
})();
