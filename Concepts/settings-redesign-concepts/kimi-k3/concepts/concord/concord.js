/* ============================================================================
   concord.js — Concept 01 "Concord" (editorial dossier)
   ----------------------------------------------------------------------------
   Composition: front-page Home, workspace = outline + reading document +
   margin inspector, managers as annotated chapters. Depends on the frozen
   shared layer: PMStore, PMSearch, PMSpy, PMRouter, PMViews, PMBridge,
   PMShell. Data: PM_CORE_DATA (core) + CONCORD_DATA (families).
   ========================================================================== */
(function () {
  "use strict";

  var DEMO = window.PM_CORE_DATA;
  var CD = window.CONCORD_DATA;
  var V = window.PMViews;
  var esc = V.esc;
  var root = document.getElementById("ccd-root");
  var spy = null;
  var searchIndex = null;
  var currentRoute = { view: "home", category: null, sub: null, setting: null, manager: null, tab: null };

  /* ---------- boot: seed + init store ---------- */
  PMStore.seed({
    providers: V.clone(DEMO.providers),
    roles: V.clone(DEMO.roles),
    overrides: {},
    errors: {},
    changedElsewhere: {},
    dismissedNotices: [],
    calmDemo: false,
    memory: V.clone(CD.memory),
    personas: V.clone(CD.personas),
    crews: V.clone(CD.crews),
    permissions: V.clone(CD.permissions),
    contextSources: V.clone(CD.contextSources),
    bsd: V.clone(CD.bsd),
    crewRoutePolicies: {},
    eli5: false
  });
  PMStore.init("concord");

  /* ---------- search index: core + Concord managers/actions ---------- */
  function buildSearchIndex() {
    var demo = Object.assign({}, DEMO, {
      managerMeta: Object.assign({}, DEMO.managerMeta, CD.managerMeta),
      actions: DEMO.actions.concat(CD.actions)
    });
    return PMSearch.buildIndex(demo);
  }

  /* ---------- helpers ---------- */
  function catById(id) {
    for (var i = 0; i < DEMO.categories.length; i++) if (DEMO.categories[i].id === id) return DEMO.categories[i];
    return null;
  }

  function navigate(target) {
    PMRouter.go(target || {});
  }

  function noticeList() {
    var dismissed = PMStore.get("dismissedNotices", []);
    if (PMStore.get("calmDemo", false)) return [];
    return DEMO.notices.filter(function (n) { return dismissed.indexOf(n.id) === -1; });
  }

  /* Inbox: the ONLY in-app notification surface. */
  function renderInbox() {
    var list = document.querySelector("[data-shell-inbox-list]");
    if (!list) return;
    var items = noticeList();
    list.innerHTML = items.length
      ? items.map(V.noticeCompactHtml).join("")
      : '<span class="pm-inbox-empty">All clear — nothing needs your attention.</span>';
    PMShell.setInboxCount(items.length);
  }

  /* One delegation handler for notice actions everywhere (Home + inbox). */
  document.addEventListener("click", function (ev) {
    var act = ev.target.closest && ev.target.closest("[data-notice-act]");
    if (act) {
      var n = null;
      DEMO.notices.forEach(function (x) { if (x.id === act.getAttribute("data-notice-act")) n = x; });
      if (n && n.target) navigate(n.target);
      return;
    }
    var dis = ev.target.closest && ev.target.closest("[data-notice-dismiss]");
    if (dis) {
      var id = dis.getAttribute("data-notice-dismiss");
      var dismissed = PMStore.get("dismissedNotices", []).slice();
      if (dismissed.indexOf(id) === -1) dismissed.push(id);
      PMStore.set("dismissedNotices", dismissed);
      PMStore.receipt("Notice dismissed — it stays dismissed for this demo session", "info");
    }
  });

  /* ---------- HOME ---------- */
  function homeHtml() {
    var notices = noticeList();
    var groups = [
      ["attention", "Needs attention"],
      ["setup", "Continue setup"],
      ["recommended", "Recommended"]
    ];
    var noticeHtml = groups.map(function (g) {
      var items = notices.filter(function (n) { return n.kind === g[0]; });
      if (!items.length) return "";
      return '<div class="ccd-notice-group">' + esc(g[1]) + "</div>" +
        '<div class="ccd-notices">' + items.map(V.noticeHtml).join("") + "</div>";
    }).join("");
    if (!notices.length) {
      noticeHtml = '<div class="ccd-calm">All clear. Nothing needs attention, no setup is waiting, and there are no recommendations right now.</div>';
    }

    var dests = DEMO.categories.map(function (c) {
      var health = "";
      if (c.id === "permissions") health = '<span class="pm-healthdot" data-state="warn"><span class="pm-healthdot-dot" aria-hidden="true"></span><span>Setup incomplete</span></span>';
      else if (c.id === "providers") health = '<span class="pm-healthdot" data-state="warn"><span class="pm-healthdot-dot" aria-hidden="true"></span><span>1 update available</span></span>';
      else health = '<span class="pm-healthdot" data-state="ok"><span class="pm-healthdot-dot" aria-hidden="true"></span><span>Healthy</span></span>';
      var mgr = c.manager && CD.managerMeta[c.manager]
        ? ' <span class="pm-badge" data-kind="scope">Includes the ' + esc(CD.managerMeta[c.manager].title) + " manager</span>" : "";
      return '<button type="button" class="ccd-dest" data-cat="' + esc(c.id) + '">' +
        '<span class="ccd-dest-title">' + esc(c.title) + mgr + "</span>" +
        '<span class="ccd-dest-purpose">' + esc(c.purpose) + "</span>" +
        '<span class="ccd-dest-health">' + health + "</span>" +
        '<span class="ccd-dest-arrow">' + V.icon("chevron") + "</span>" +
        "</button>";
    }).join("");

    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" class="ccd-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";
    }).join("");

    return '<div class="ccd-home"><div class="ccd-home-inner ccd-fade">' +
      '<header class="ccd-masthead">' +
        '<span class="ccd-eyebrow">Settings · Concord</span>' +
        '<h1 class="ccd-h1">The front page</h1>' +
        '<p class="ccd-sub">Every destination, one reading surface. Search crosses categories; notices state their status; recents pick up where you left off.</p>' +
      "</header>" +
      '<div class="ccd-search"><input type="search" id="ccd-search" placeholder="Search settings, managers, and actions — try “notifcation”" aria-label="Search settings" autocomplete="off" spellcheck="false">' +
      '<div class="ccd-hits" id="ccd-hits" role="listbox" aria-label="Search results" hidden></div></div>' +
      '<section class="ccd-section" aria-label="Notices">' + noticeHtml + "</section>" +
      '<section class="ccd-section" aria-label="Destinations">' +
        '<div class="ccd-notice-group">Destinations</div>' +
        '<div class="ccd-dests">' + dests + "</div>" +
      "</section>" +
      '<section class="ccd-section" aria-label="Recent settings work">' +
        '<div class="ccd-notice-group">Recent settings work</div>' +
        '<div class="ccd-recents">' + recents + "</div>" +
      "</section>" +
      "</div></div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    var input = document.getElementById("ccd-search");
    var hits = document.getElementById("ccd-hits");
    V.wireSearch({
      input: input, listEl: hits, index: searchIndex,
      onPick: onSearchPick
    });
    root.querySelectorAll("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () { navigate({ category: b.getAttribute("data-cat") }); });
    });
    root.querySelectorAll("[data-recent]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = DEMO.recents[parseInt(b.getAttribute("data-recent"), 10)];
        if (r) navigate(r.target);
      });
    });
  }

  function onSearchPick(result) {
    if (result.kind === "action") {
      if (result.id === "action:reset-demo") { PMStore.resetDemo(); PMStore.receipt("Demo data reset to its seeded state", "ok"); return; }
      if (result.id === "action:open-home") { navigate({}); return; }
    }
    navigate(PMSearch.deepLink(result));
  }

  /* ---------- shared control bindings (bound ONCE at boot; delegation on
     the persistent root covers every later render, incl. manager rows) ---- */
  function settingsHandlers() {
    return {
      getSetting: function (sid) { return DEMO.settings[sid]; },
      onChange: function (sid, value) {
        /* validation demo: Default shell must be an absolute .exe path */
        if (sid === "terminal.shell-path" && typeof value === "string" && value &&
            value !== "auto" && value !== "not-configured" && !/^[A-Za-z]:\\.*\.exe$/i.test(value)) {
          V.setError(sid, "Not a valid shell path — enter an absolute path ending in .exe, or clear the field for Auto.");
          return;
        }
        V.setError(sid, null);
        V.setOverride(sid, value);
      },
      onRun: function (sid) {
        if (sid === "system.test-restore") { PMStore.receipt("Test restore simulated — the snapshot restored cleanly in a scratch area", "ok"); return; }
        if (sid === "system.export-diagnostics") { PMStore.receipt("Diagnostics bundle simulated — nothing was collected or sent", "info"); return; }
        if (sid === "system.feature-flags") { PMStore.receipt("Flag editor simulated — the real editor is a runtime surface", "info"); return; }
        if (sid === "system.factory-reset") { PMStore.receipt("Reset preview simulated — export, snapshot, apply, verify, receipt", "warn"); return; }
        PMStore.receipt("Action simulated — no real operation ran", "info");
      }
    };
  }

  function rerenderCurrent() { render(currentRoute, false); }

  /* ---------- WORKSPACE ---------- */
  function outlineHtml(cat) {
    return DEMO.categories.map(function (c) {
      var current = c.id === cat.id;
      var subs = "";
      if (current) {
        subs = '<span class="ccd-outline-subs">' + c.subcategories.map(function (s) {
          return '<button type="button" class="ccd-outline-sub" data-subjump="' + esc(s.id) + '">' + esc(s.title) + "</button>";
        }).join("") + "</span>";
      }
      return '<button type="button" class="ccd-outline-cat" data-catnav="' + esc(c.id) + '" aria-current="' + current + '">' + esc(c.title) + "</button>" + subs;
    }).join("");
  }

  function sectionRows(sub) {
    var standard = [];
    var advanced = [];
    sub.settings.forEach(function (sid) {
      var s = DEMO.settings[sid];
      if (!s) return;
      if (s.exposure && s.exposure !== "standard" && s.exposure !== "managed") advanced.push(s);
      else standard.push(s);
    });
    var out = standard.map(function (s) { return V.rowHtml(s); }).join("");
    if (advanced.length) {
      out += '<details class="pm-accordion ccd-adv"><summary>Advanced and diagnostic (' + advanced.length + ")</summary>" +
        '<div class="pm-accordion-body">' + advanced.map(function (s) { return V.rowHtml(s); }).join("") + "</div></details>";
    }
    return out;
  }

  function marginSettingHtml(s) {
    if (!s) return '<p class="ccd-margin-empty">Focus a setting row to inspect its source, scope, and effective value here.</p>';
    var r = V.resolveState(s);
    var rows = [
      ["State", V.human(V.STATE_LABEL, r.state)],
      ["Source", r.source],
      ["Exposure", V.human(V.EXPOSURE_LABEL, s.exposure || "standard")],
      ["Scope", (s.scope || ["global"]).map(function (sc) { return V.human(V.SCOPE_LABEL, sc); }).join(", ")]
    ];
    if (s.effectiveValue !== undefined) rows.push(["Effective", V.fmtValue(s, s.effectiveValue) + (s.effectiveReason ? " — " + s.effectiveReason : "")]);
    if (s.restartRequired) rows.push(["Applies", "After restart"]);
    if (s.reconnectRequired) rows.push(["Applies", "After reconnect"]);
    if (s.defaultValue !== undefined) rows.push(["Default", V.fmtValue(s, s.defaultValue)]);
    return '<div class="ccd-margin-card ccd-slide-in"><h4>' + esc(s.label) + "</h4>" +
      '<dl class="pm-kv">' + rows.map(function (kv) { return "<dt>" + esc(kv[0]) + "</dt><dd>" + esc(kv[1]) + "</dd>"; }).join("") + "</dl>" +
      (s.help ? '<p class="ccd-sub">' + esc(s.help) + "</p>" : "") + "</div>";
  }

  function marginDefaultHtml(cat) {
    var counts = {};
    var total = 0;
    cat.subcategories.forEach(function (sub) {
      sub.settings.forEach(function (sid) {
        var s = DEMO.settings[sid];
        if (!s) return;
        total++;
        var st = V.resolveState(s).state;
        counts[st] = (counts[st] || 0) + 1;
      });
    });
    var lines = Object.keys(counts).map(function (k) {
      return "<dt>" + esc(V.human(V.STATE_LABEL, k)) + "</dt><dd>" + counts[k] + "</dd>";
    }).join("");
    return '<div class="ccd-margin-card"><h4>' + esc(cat.title) + " at a glance</h4>" +
      '<dl class="pm-kv"><dt>Settings</dt><dd>' + total + "</dd>" + lines + "</dl></div>";
  }

  function renderWorkspace(route, fromNav) {
    var cat = catById(route.category) || DEMO.categories[0];
    var squeezeSelect = '<select class="pm-select ccd-outline-select" id="ccd-cat-select" aria-label="Category">' +
      DEMO.categories.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === cat.id ? " selected" : "") + ">" + esc(c.title) + "</option>"; }).join("") + "</select>";
    var sections = cat.subcategories.map(function (sub) {
      return '<section class="ccd-sec" id="sec-' + esc(sub.id) + '" aria-label="' + esc(sub.title) + '">' +
        "<h3>" + esc(sub.title) + '</h3><p class="ccd-sec-sum">' + esc(sub.summary) + "</p>" +
        sectionRows(sub) + "</section>";
    }).join("");

    root.innerHTML = '<div class="ccd-ws ccd-fade">' +
      '<nav class="ccd-outline" aria-label="Categories">' + outlineHtml(cat) + "</nav>" +
      '<div class="ccd-doc" id="ccd-doc"><div class="ccd-doc-inner">' +
        '<header class="ccd-doc-head">' + squeezeSelect +
          '<span class="ccd-eyebrow">' + esc(cat.title) + "</span>" +
          '<h1 class="ccd-h1">' + esc(cat.purpose) + "</h1>" +
        "</header>" +
        sections +
      "</div></div>" +
      '<aside class="ccd-margin" id="ccd-margin" aria-label="Inspector">' +
        '<h2 class="ccd-margin-h">Inspector</h2>' +
        '<div id="ccd-margin-body">' + marginDefaultHtml(cat) + "</div>" +
      "</aside>" +
      "</div>";

    var doc = document.getElementById("ccd-doc");
    var marginBody = document.getElementById("ccd-margin-body");

    root.querySelectorAll("[data-catnav]").forEach(function (b) {
      b.addEventListener("click", function () { navigate({ category: b.getAttribute("data-catnav") }); });
    });
    var sel = document.getElementById("ccd-cat-select");
    if (sel) sel.addEventListener("change", function () { navigate({ category: sel.value }); });

    var sectionsEls = cat.subcategories.map(function (s) { return "sec-" + s.id; });
    spy = PMSpy.attach({
      root: doc,
      sections: sectionsEls,
      onActive: function (id) {
        root.querySelectorAll("[data-subjump]").forEach(function (b) {
          b.setAttribute("aria-current", String(b.getAttribute("data-subjump") === id.replace(/^sec-/, "")));
        });
      }
    });
    root.querySelectorAll("[data-subjump]").forEach(function (b) {
      b.addEventListener("click", function () {
        var el = document.getElementById("sec-" + b.getAttribute("data-subjump"));
        if (el) PMSpy.jumpTo(el, { root: doc });
      });
    });

    /* row focus → margin inspector */
    root.querySelectorAll(".pm-row[data-setting]").forEach(function (row) {
      function show() {
        var s = DEMO.settings[row.getAttribute("data-setting")];
        if (s) marginBody.innerHTML = marginSettingHtml(s);
      }
      row.addEventListener("click", show);
      row.addEventListener("focusin", show);
    });

    /* deep link: land on the exact subcategory/setting (navigation only —
       store-change re-renders must not steal scroll or focus) */
    if (fromNav && route.setting) {
      var rowEl = document.getElementById("row-" + route.setting);
      if (rowEl) {
        var s = DEMO.settings[route.setting];
        if (s) marginBody.innerHTML = marginSettingHtml(s);
        window.setTimeout(function () { PMSpy.jumpTo(rowEl, { root: doc }); }, 60);
      }
    } else if (fromNav && route.sub) {
      var secEl = document.getElementById("sec-" + route.sub);
      if (secEl) window.setTimeout(function () { PMSpy.jumpTo(secEl, { root: doc }); }, 60);
    }
  }

  /* ---------- PROVIDER MANAGER (all concepts share this grammar) ---------- */
  var PROVIDER_TABS = [
    ["overview", "Overview"], ["accounts", "Accounts and connections"], ["models", "Models"],
    ["plans", "Plans and limits"], ["routing", "Routing"], ["install", "Installation and updates"], ["advanced", "Advanced and support"]
  ];

  function providerListHtml(selected) {
    var groups = ["installed-tools", "connected-accounts", "api", "server", "free"];
    var byGroup = {};
    V.providers().forEach(function (p) { (byGroup[p.connectionGroup] = byGroup[p.connectionGroup] || []).push(p); });
    return groups.filter(function (g) { return byGroup[g] && byGroup[g].length; }).map(function (g) {
      return '<div class="ccd-notice-group">' + esc(V.GROUP_LABEL[g]) + "</div>" +
        byGroup[g].map(function (p) {
          var st = V.providerStatus(p);
          return '<button type="button" class="ccd-dest" data-pid="' + esc(p.id) + '" aria-current="' + (selected === p.id) + '">' +
            '<span class="ccd-dest-title">' + esc(p.name) + "</span>" +
            '<span class="ccd-dest-purpose">' + esc(p.tagline) + "</span>" +
            '<span class="ccd-dest-health">' + V.healthDot(st.dot, st.label) + "</span>" +
            '<span class="ccd-dest-arrow">' + V.icon("chevron") + "</span></button>";
        }).join("");
    }).join("");
  }

  function providerDetailHtml(p, tab) {
    var tabs = PROVIDER_TABS.map(function (t) {
      return '<button type="button" role="tab" aria-selected="' + (t[0] === tab) + '" aria-current="' + (t[0] === tab) + '" data-ptab="' + t[0] + '">' + t[1] + "</button>";
    }).join("");
    var body = "";
    if (tab === "overview") {
      var st = V.providerStatus(p);
      var act = V.activeAccount(p);
      var install = V.INSTALL_STATE[p.installState];
      body = '<div class="ccd-card"><div class="ccd-card-h"><h4>' + esc(p.name) + "</h4>" + V.healthDot(st.dot, st.label) + "</div>" +
        '<p class="ccd-sub">' + esc(p.tagline) + "</p>" +
        '<dl class="pm-kv">' +
        "<dt>Connection</dt><dd>" + esc(V.GROUP_LABEL[p.connectionGroup] || p.connectionGroup) + "</dd>" +
        (install ? "<dt>Installation</dt><dd>" + esc(install) + "</dd>" : "") +
        "<dt>Sign-in</dt><dd>" + esc(p.authNote || V.AUTH_MODEL[p.authModel] || "") + "</dd>" +
        (act ? "<dt>Active account</dt><dd>" + esc(act.label) + " · " + esc(act.identity) + "</dd>" : "") +
        "<dt>Plan</dt><dd>" + esc(p.product.plan) + " — " + esc(p.product.billingRoute) + "</dd>" +
        (p.groupingNote ? "<dt>Grouping</dt><dd>" + esc(p.groupingNote) + "</dd>" : "") +
        "</dl>" +
        (p.lastError ? '<div class="pm-row-reason">' + esc(p.lastError) + "</div>" : "") + "</div>";
      if (p.installState === "installed-signed-out") {
        body += '<div class="ccd-card"><div class="ccd-card-h"><h4>Sign in required</h4></div>' +
          '<p class="ccd-sub">This tool owns its own sign-in. Puppet Master launches the native flow and never sees credentials.</p>' +
          '<div><button type="button" class="pm-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in via ' + esc(p.name) + " CLI</button></div></div>";
      }
      if (p.installState === "not-installed" && p.installAction) {
        body += V.installationHtml(p);
      }
    } else if (tab === "accounts") {
      body = (p.accounts || []).map(function (a) { return V.accountRowHtml(p, a); }).join("") ||
        '<div class="pm-empty"><div class="pm-empty-title">No accounts yet</div><div class="pm-empty-guidance">Sign in or connect a credential to add an account.</div></div>';
      body += '<div><button type="button" class="pm-btn" data-variant="quiet" data-pv="reconnect" data-pid="' + esc(p.id) + '">Add another connection…</button></div>';
    } else if (tab === "models") {
      body = (p.models || []).map(function (m) { return V.modelRowHtml(p, m); }).join("") ||
        '<div class="pm-empty"><div class="pm-empty-title">No models listed yet</div><div class="pm-empty-guidance">Install and connect this provider to list its models.</div></div>';
    } else if (tab === "plans") {
      body = V.usageHtml(p);
      if (p.usageNote) body += '<p class="ccd-sub">' + esc(p.usageNote) + "</p>";
    } else if (tab === "routing") {
      body = V.routingHtml(p);
      body += '<div class="ccd-card"><div class="ccd-card-h"><h4>Agent roles</h4></div>' +
        '<p class="ccd-sub">Roles consume provider and model candidates; they stay separate from accounts and installations.</p>' +
        V.rolesHtml(PMStore.get("roles", [])) + "</div>";
    } else if (tab === "install") {
      body = V.installationHtml(p) + V.updatesHtml(p);
    } else if (tab === "advanced") {
      body = V.catalogHtml(p) + V.diagnosticsHtml(p) +
        '<div><button type="button" class="pm-btn" data-variant="quiet" data-pv="refresh" data-pid="' + esc(p.id) + '">Refresh catalog</button></div>';
    }
    return '<nav class="ccd-mgr-nav" role="tablist" aria-label="Provider sections">' + tabs + "</nav>" + body;
  }

  function renderProviders(route) {
    var pid = route.sub || null;
    var tab = route.tab || null;
    var list = V.providers();
    if (!pid) pid = list.length ? list[0].id : null;
    var p = V.providerById(pid);
    var ptab = "overview";
    PROVIDER_TABS.forEach(function (t) { if (t[0] === tab) ptab = tab; });

    root.innerHTML = '<div class="ccd-mgr ccd-fade"><div class="ccd-mgr-body"><div class="ccd-mgr-inner">' +
      '<header class="ccd-mgr-head"><span class="ccd-eyebrow">Providers</span>' +
      '<h1 class="ccd-h1">Accounts, connections, models, and installations</h1>' +
      '<p class="ccd-sub">A provider supplies models, authentication, limits, and capabilities. An installation is a host resource — Puppet Master manages its lifecycle only after you install it explicitly.</p></header>' +
      V.providerEnvBannerHtml() +
      '<div class="ccd-providers" style="display:grid;grid-template-columns:minmax(220px,300px) minmax(0,1fr);gap:22px;align-items:start">' +
        '<div>' + providerListHtml(pid) + "</div>" +
        '<div id="ccd-pdetail">' + (p ? providerDetailHtml(p, ptab) : "") + "</div>" +
      "</div>" +
      "</div></div>" +
      '<aside class="ccd-margin" aria-label="Inspector"><h2 class="ccd-margin-h">Inspector</h2>' +
      '<div class="ccd-margin-card"><h4>Reading this manager</h4><dl class="pm-kv">' +
      "<dt>Object model</dt><dd>Provider family → Account → Connection → Product → Models. Installations are host resources.</dd>" +
      "<dt>Update policy</dt><dd>Check Automatic · Install Ask first · Latest compatible · Roll back on failed verification</dd>" +
      "<dt>Receipts</dt><dd>Every simulated action reports itself as simulated.</dd>" +
      "</dl></div></aside></div>";

    root.querySelectorAll("[data-pid].ccd-dest").forEach(function (b) {
      b.addEventListener("click", function () {
        PMRouter.go({ manager: "providers", sub: b.getAttribute("data-pid"), tab: "overview" });
      });
    });
    root.querySelectorAll("[data-ptab]").forEach(function (b) {
      b.addEventListener("click", function () {
        PMRouter.go({ manager: "providers", sub: pid, tab: b.getAttribute("data-ptab") });
      });
    });
  }

  /* ---------- CONTEXT & INSTRUCTIONS ---------- */
  function renderContext(route) {
    var tab = route.tab || "retrieval";
    var sources = PMStore.get("contextSources", []);
    var toggles = sources.map(function (cs) {
      return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">' + esc(cs.label) + "</div>" +
        '<div class="pm-row-desc">' + esc(cs.detail) + "</div></div>" +
        '<div class="pm-row-control"><button type="button" class="pm-switch" role="switch" aria-checked="' + !!cs.enabled + '" data-cs="' + esc(cs.id) + '" aria-label="' + esc(cs.label) + '"></button></div>' +
        '<div class="pm-row-state">' + (cs.included ? '<span class="pm-badge" data-kind="state" data-icon data-state="auto">In the last request · ' + esc(String(cs.tokens)) + " tokens</span>" : '<span class="pm-badge" data-kind="state" data-icon data-state="default">Not in the last request</span>') + "</div></div>";
    }).join("");

    var body = "";
    if (tab === "retrieval") {
      body = toggles;
    } else if (tab === "advanced") {
      body = '<div class="ccd-card"><div class="ccd-card-h"><h4>AGENTS.md precedence chain</h4></div>' +
        '<table class="pm-table"><thead><tr><th>Scope</th><th>Source</th><th>Hash</th><th>Result</th></tr></thead><tbody>' +
        CD.precedenceChain.map(function (c) {
          return "<tr><td>" + esc(c.scope) + '</td><td class="pm-mono">' + esc(c.source) + "</td><td class=\"pm-mono\">" + esc(c.hash) + "</td><td>" + esc(c.result) + "</td></tr>";
        }).join("") + "</tbody></table></div>" +
        '<div class="ccd-card"><div class="ccd-card-h"><h4>Compaction</h4></div><dl class="pm-kv">' +
        "<dt>Strategy</dt><dd>" + esc(CD.compaction.strategy) + "</dd>" +
        "<dt>Cache</dt><dd>" + esc(CD.compaction.cacheCompatibility) + "</dd>" +
        "<dt>Retrieval caps</dt><dd>" + esc(CD.compaction.retrievalCaps) + "</dd></dl></div>";
    } else if (tab === "receipt") {
      body = '<div class="ccd-card"><div class="ccd-card-h"><h4>Context admission receipt</h4><span class="pm-badge" data-kind="scope">' + esc(CD.lastRequest.at) + "</span></div>" +
        '<p class="ccd-sub">What the last provider request actually carried — and what was left out, with the reason.</p>' +
        '<div class="ccd-notice-group">Included</div><ul>' + CD.lastRequest.included.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
        '<div class="ccd-notice-group">Omitted</div><ul>' + CD.lastRequest.omitted.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>";
    }
    renderManagerShell({
      id: "context", title: "Context and Instructions",
      lede: "What enters the model-facing context each turn. Exposing the registry here never injects it into prompts.",
      tabs: [["retrieval", "Retrieval"], ["advanced", "Sources and precedence"], ["receipt", "Admission receipt"]],
      tab: tab, body: body,
      margin: '<div class="ccd-margin-card"><h4>Persona footprint</h4><dl class="pm-kv"><dt>Active persona</dt><dd>Collaborator</dd><dt>Capsule size</dt><dd>210 tokens</dd><dt>Behavior, not authority</dt><dd>No permission changes</dd></dl></div>'
    });
    root.querySelectorAll("[data-cs]").forEach(function (sw) {
      sw.addEventListener("click", function () {
        var list2 = PMStore.get("contextSources", []).slice();
        list2.forEach(function (cs) { if (cs.id === sw.getAttribute("data-cs")) cs.enabled = sw.getAttribute("aria-checked") !== "true"; });
        PMStore.set("contextSources", list2);
        PMStore.receipt("Context source preference saved for this demo session", "ok");
      });
    });
  }

  /* ---------- MEMORY ---------- */
  var memFilter = "all";
  function gistMatches(g) {
    if (memFilter === "verified") return g.status === "verified";
    if (memFilter === "review") return g.status === "awaiting-review";
    if (memFilter === "pinned") return g.pinned;
    return true;
  }

  function renderMemory(route) {
    var tab = route.tab || "ledger";
    var gists = PMStore.get("memory", { gists: [] }).gists.filter(gistMatches);
    var segs = [["all", "All"], ["verified", "Verified"], ["review", "Awaiting review"], ["pinned", "Pinned"]].map(function (f) {
      return '<button type="button" role="radio" aria-checked="' + (memFilter === f[0]) + '" data-memfilter="' + f[0] + '">' + f[1] + "</button>";
    }).join("");
    var rows = gists.map(function (g) {
      var pct = Math.round((g.activation || 0) * 100);
      var statusBadge = g.status === "verified"
        ? '<span class="pm-badge" data-kind="state" data-icon data-state="default">Verified</span>'
        : '<span class="pm-badge" data-kind="state" data-icon data-state="effective-differs">Awaiting review</span>';
      var hidden = g.hidden ? '<span class="pm-badge" data-kind="exposure" data-icon data-exposure="diagnostic">Assistant-only — never used by automated systems</span>' : "";
      var pinned = g.pinned ? '<span class="pm-badge" data-kind="scope">Pinned</span>' : "";
      return '<div class="ccd-ledger-row" data-gist="' + esc(g.id) + '">' +
        '<div class="ccd-ledger-main"><div class="ccd-ledger-title">' + esc(g.text) + "</div>" +
        '<div class="ccd-ledger-sub">' + esc(g.kind) + " · " + esc(g.scope === "assistant-hidden" ? "assistant (hidden)" : g.scope) + " scope · last used " + esc(g.lastAccess) + " · " + esc(g.evidence.join("; ")) + "</div>" +
        '<div class="ccd-ledger-sub">Half-life ' + esc(String(g.halfLifeDays)) + ' days — fading lowers retrieval activation only, never truth or deletion</div></div>' +
        '<div class="ccd-ledger-side">' + statusBadge + pinned + hidden +
        '<span class="ccd-halflife" data-low="' + (pct < 30) + '" title="Retrieval activation ' + pct + '%"><span style="inline-size:' + pct + '%"></span></span>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-gist-act="open" data-gist="' + esc(g.id) + '">Open</button></div></div>';
    }).join("");
    if (!gists.length) {
      rows = '<div class="pm-empty"><div class="pm-empty-title">No memories in this view</div><div class="pm-empty-guidance">Change the filter, or verify awaiting memories to move them here.</div></div>';
    }
    var body = "";
    if (tab === "ledger") {
      body = '<div class="pm-seg" role="radiogroup" aria-label="Memory filter">' + segs + "</div>" +
        '<div class="ccd-ledger">' + rows + "</div>";
    } else if (tab === "maintenance") {
      body = '<div class="ccd-card"><div class="ccd-card-h"><h4>Maintenance</h4></div>' +
        '<p class="ccd-sub">Maintenance operations produce receipts and never change a memory\'s truth value.</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
        '<button type="button" class="pm-btn" data-mem-op="rebuild">Rebuild index</button>' +
        '<button type="button" class="pm-btn" data-mem-op="dedupe">Deduplicate</button>' +
        '<button type="button" class="pm-btn" data-mem-op="summarize">Summarize old memories</button>' +
        '<button type="button" class="pm-btn" data-mem-op="archive">Archive inactive</button>' +
        '<button type="button" class="pm-btn" data-variant="danger" data-mem-op="redact">Redact…</button></div></div>' +
        '<div class="ccd-card"><div class="ccd-card-h"><h4>Capsule preview</h4></div>' +
        '<p class="ccd-sub">The active memory capsule is 612 tokens of the 800-token budget. Preview shows exactly what would enter context.</p>' +
        '<div><button type="button" class="pm-btn" data-variant="quiet" data-mem-op="capsule">Preview the active capsule</button></div></div>';
    }
    renderManagerShell({
      id: "memory", title: "Memory",
      lede: "Evidence-backed Assistant Gists with review, pinning, and honest fading. " + esc(CD.memory.halfLifeNote),
      tabs: [["ledger", "Evidence ledger"], ["maintenance", "Maintenance"]],
      tab: tab, body: body,
      margin: '<div class="ccd-margin-card"><h4>Activation scale</h4><p class="ccd-sub">100% = always retrieved. Under 30% = leaves the active set. Fading is reversible: use a memory and it re-activates.</p></div>'
    });
    root.querySelectorAll("[data-memfilter]").forEach(function (b) {
      b.addEventListener("click", function () { memFilter = b.getAttribute("data-memfilter"); renderMemory(route); });
    });
    root.querySelectorAll("[data-mem-op]").forEach(function (b) {
      b.addEventListener("click", function () {
        var op = b.getAttribute("data-mem-op");
        var msgs = {
          rebuild: "Rebuild simulated — 9 Gists re-indexed, 0 conflicts", dedupe: "Dedupe simulated — no duplicate Gists found",
          summarize: "Summarize simulated — 2 old Gists would compress into one", archive: "Archive simulated — 1 inactive Gist would move to the archive",
          redact: "Redact simulated — a confirmation dialog would list exactly what is removed", capsule: "Capsule preview simulated — 612 tokens across 6 active Gists"
        };
        PMStore.receipt(msgs[op] || "Simulated", op === "redact" ? "warn" : "ok");
      });
    });
    root.querySelectorAll("[data-gist-act='open']").forEach(function (b) {
      b.addEventListener("click", function () { openGist(b.getAttribute("data-gist")); });
    });
  }

  function openGist(id) {
    var g = null;
    PMStore.get("memory", { gists: [] }).gists.forEach(function (x) { if (x.id === id) g = x; });
    if (!g) return;
    var versions = (g.versions || []).map(function (v, i) {
      return '<div class="ccd-ledger-row"><div class="ccd-ledger-main"><div class="ccd-ledger-title">' + esc(v.text) + "</div>" +
        '<div class="ccd-ledger-sub">' + esc(v.at) + " — " + esc(v.note) + "</div></div>" +
        (i > 0 ? '<div class="ccd-ledger-side"><button type="button" class="pm-btn" data-variant="quiet" data-restore="' + i + '">Restore this version</button></div>' : '<div class="ccd-ledger-side"><span class="pm-badge" data-kind="scope">Current</span></div>') +
        "</div>";
    }).join("");
    var dlg = document.createElement("div");
    dlg.className = "pm-dialog";
    dlg.setAttribute("role", "dialog");
    dlg.setAttribute("aria-label", "Memory detail");
    dlg.innerHTML = '<div class="ccd-card" style="max-inline-size:560px;max-block-size:80vh;overflow:auto">' +
      '<div class="ccd-card-h"><h4>' + esc(g.text) + "</h4>" + (g.pinned ? '<span class="pm-badge" data-kind="scope">Pinned</span>' : "") + "</div>" +
      '<dl class="pm-kv"><dt>Status</dt><dd>' + esc(g.status === "verified" ? "Verified" : "Awaiting review") + "</dd>" +
      "<dt>Evidence</dt><dd>" + esc(g.evidence.join("; ")) + "</dd>" +
      "<dt>Half-life</dt><dd>" + esc(String(g.halfLifeDays)) + " days — retrieval activation only</dd></dl>" +
      '<div class="ccd-notice-group">Version history</div>' + versions +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-block-start:10px">' +
      (g.status !== "verified" ? '<button type="button" class="pm-btn" data-variant="primary" data-gist-op="verify">Verify</button>' : "") +
      '<button type="button" class="pm-btn" data-gist-op="pin">' + (g.pinned ? "Unpin" : "Pin") + "</button>" +
      '<button type="button" class="pm-btn" data-gist-op="edit">Edit…</button>' +
      '<button type="button" class="pm-btn" data-variant="danger" data-gist-op="delete">Delete</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-gist-op="close">Close</button></div></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (ev) {
      var op = ev.target.closest && ev.target.closest("[data-gist-op]");
      var rst = ev.target.closest && ev.target.closest("[data-restore]");
      if (rst) {
        PMStore.receipt("Version restore simulated — the earlier wording becomes current", "ok");
        dlg.remove();
        return;
      }
      if (!op) return;
      var action = op.getAttribute("data-gist-op");
      if (action === "close") { dlg.remove(); return; }
      var mem = PMStore.get("memory", { gists: [] });
      mem.gists.forEach(function (x) {
        if (x.id !== id) return;
        if (action === "verify") x.status = "verified";
        if (action === "pin") x.pinned = !x.pinned;
        if (action === "delete") mem.gists = mem.gists.filter(function (y) { return y.id !== id; });
      });
      if (action === "edit") { PMStore.receipt("Edit simulated — the real editor keeps evidence attached", "info"); dlg.remove(); return; }
      PMStore.set("memory", mem);
      PMStore.receipt(action === "verify" ? "Gist verified — it may now influence answers" : action === "pin" ? "Pin state updated" : "Gist deleted (simulated)", "ok");
      dlg.remove();
    });
  }

  /* ---------- PERSONAS ---------- */
  function renderPersonas(route) {
    var personas = PMStore.get("personas", []);
    var cards = personas.map(function (p) {
      return '<button type="button" class="ccd-persona" data-persona="' + esc(p.id) + '">' +
        '<span class="ccd-persona-name">' + esc(p.name) +
        (p.childOnly ? '<span class="pm-badge" data-kind="scope">Child only</span>' : "") +
        (p.defaults.global ? '<span class="pm-badge" data-kind="state" data-icon data-state="auto">Global default</span>' : "") +
        (p.defaults.project ? '<span class="pm-badge" data-kind="state" data-icon data-state="custom">Project default</span>' : "") + "</span>" +
        '<span class="ccd-persona-sum">' + esc(p.roleSummary) + "</span>" +
        '<span class="ccd-persona-capsule">' + esc(p.capsule) + "</span></button>";
    }).join("");
    var body = '<div class="ccd-card"><div class="ccd-card-h"><h4>Persona is behavior, not authority</h4></div>' +
      '<p class="ccd-sub">' + esc(CD.personaAuthorityNote) + "</p></div>" +
      '<div class="ccd-persona-grid">' + cards + "</div>" +
      '<div><button type="button" class="pm-btn" data-persona-import>Import a persona…</button></div>';
    renderManagerShell({
      id: "personas", title: "Personas",
      lede: "Core and custom personas with mission, boundary, capsule, provenance, and eligible skills.",
      tabs: [["gallery", "Gallery"]], tab: "gallery", body: body,
      margin: '<div class="ccd-margin-card"><h4>Mode vs access</h4><p class="ccd-sub">Conversation mode (Ask / Plan / Review) limits effects; the access profile (Ask for approval / Auto accept edits / Auto / Full Access) limits authority. Personas change neither.</p></div>'
    });
    root.querySelectorAll("[data-persona]").forEach(function (b) {
      b.addEventListener("click", function () { openPersona(b.getAttribute("data-persona")); });
    });
    var imp = root.querySelector("[data-persona-import]");
    if (imp) imp.addEventListener("click", openPersonaImport);
  }

  function openPersona(id) {
    var p = null;
    PMStore.get("personas", []).forEach(function (x) { if (x.id === id) p = x; });
    if (!p) return;
    var dlg = document.createElement("div");
    dlg.className = "pm-dialog";
    dlg.setAttribute("role", "dialog");
    dlg.setAttribute("aria-label", "Persona detail");
    dlg.innerHTML = '<div class="ccd-card" style="max-inline-size:560px;max-block-size:80vh;overflow:auto">' +
      '<div class="ccd-card-h"><h4>' + esc(p.name) + "</h4>" + (p.childOnly ? '<span class="pm-badge" data-kind="scope">Child only</span>' : "") + "</div>" +
      '<dl class="pm-kv">' +
      "<dt>Mission</dt><dd>" + esc(p.mission) + "</dd>" +
      "<dt>Boundary</dt><dd>" + esc(p.boundary) + "</dd>" +
      "<dt>Source</dt><dd>" + esc(p.source) + " · v" + esc(p.version) + " · " + esc(p.provenance) + "</dd>" +
      "<dt>Eligible skills</dt><dd>" + (p.eligibleSkills.length ? esc(p.eligibleSkills.join(", ")) : "None — loads skills only when relevant") + "</dd>" +
      "<dt>Defaults</dt><dd>" + (p.defaults.global ? "Global default" : p.defaults.project ? "Project default" : p.defaults.thread ? "Thread default" : "No default") + "</dd>" +
      "<dt>Scope</dt><dd>" + esc(p.currentScope) + "</dd></dl>" +
      '<div class="ccd-notice-group">Model-facing capsule</div>' +
      '<div class="ccd-persona-capsule" style="font-size:12px">' + esc(p.capsule) + "</div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-block-start:10px">' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-pd="set-thread">Use for this thread</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-pd="close">Close</button></div></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest("[data-pd]");
      if (!b) return;
      if (b.getAttribute("data-pd") === "set-thread") PMStore.receipt("Persona applied to this thread (simulated) — behavior only, authority unchanged", "ok");
      dlg.remove();
    });
  }

  function openPersonaImport() {
    var d = CD.personaImportDemo;
    var dlg = document.createElement("div");
    dlg.className = "pm-dialog";
    dlg.setAttribute("role", "dialog");
    dlg.setAttribute("aria-label", "Import persona");
    dlg.innerHTML = '<div class="ccd-card" style="max-inline-size:560px">' +
      '<div class="ccd-card-h"><h4>Import ' + esc(d.fileName) + "</h4></div>" +
      '<div class="ccd-notice-group">Diff</div><ul>' + d.diff.map(function (l) { return '<li class="pm-mono">' + esc(l) + "</li>"; }).join("") + "</ul>" +
      '<dl class="pm-kv"><dt>Trust</dt><dd>' + esc(d.trust) + "</dd>" +
      "<dt>Secret scan</dt><dd>" + esc(d.secretScan) + "</dd>" +
      "<dt>Injection scan</dt><dd>" + esc(d.injectionScan) + "</dd></dl>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-block-start:10px">' +
      '<button type="button" class="pm-btn" data-variant="primary" data-pi="quarantine">Import with quarantined line</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-pi="cancel">Cancel</button></div></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest("[data-pi]");
      if (!b) return;
      if (b.getAttribute("data-pi") === "quarantine") PMStore.receipt("Import simulated — the persona lands untrusted with the suspicious line quarantined", "warn");
      dlg.remove();
    });
  }

  /* ---------- GOAL & AUTOMATION ---------- */
  function renderGoal(route) {
    var rows = CD.goalDefaults.map(function (g) {
      return '<div class="ccd-ledger-row"><div class="ccd-ledger-main"><div class="ccd-ledger-title">' + esc(g.label) + "</div>" +
        '<div class="ccd-ledger-sub">' + esc(g.note) + "</div></div>" +
        '<div class="ccd-ledger-side"><span class="pm-badge" data-kind="scope">' + esc(g.value) + "</span></div></div>";
    }).join("");
    var body = '<div class="ccd-card"><div class="ccd-card-h"><h4>Defaults and ceilings</h4><span class="pm-badge" data-kind="scope">Settings owns defaults — the Orchestrator owns live runs</span></div>' +
      '<div class="ccd-ledger">' + rows + "</div></div>" +
      '<div class="ccd-card"><div class="ccd-card-h"><h4>Edit the defaults</h4></div>' +
      '<p class="ccd-sub">The editable rows live in the Goal and Automation workspace.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-goto="goal.worker-ceiling">Worker ceiling</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-goto="goal.spend-guard">Spend guard</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-goto="goal.verification-reserve">Verification reserve</button></div></div>';
    renderManagerShell({
      id: "goal", title: "Goal and Automation",
      lede: "Ceilings, guards, and route classes for Goal runs. Usage reports capacity; the Orchestrator admits work.",
      tabs: [["defaults", "Defaults and ceilings"]], tab: "defaults", body: body,
      margin: '<div class="ccd-margin-card"><h4>Requested vs effective</h4><p class="ccd-sub">A ceiling is a request. Current capacity admits what it can — the workspace rows show both.</p></div>'
    });
    root.querySelectorAll("[data-goto]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sid = b.getAttribute("data-goto");
        var parts = sid.split(".");
        navigate({ category: "goal", sub: parts[1] === "verification-reserve" ? "verification" : "defaults", setting: sid });
      });
    });
  }

  /* ---------- CREW ---------- */
  function renderCrew(route) {
    var crews = PMStore.get("crews", []);
    var policies = PMStore.get("crewRoutePolicies", {});
    var cards = crews.map(function (c) {
      var pol = policies[c.id] || c.routePolicy;
      var roles = c.roles.map(function (r) {
        return "<tr><td>" + esc(r.role) + "</td><td>" + esc(r.persona) + "</td><td>" + esc(r.capability) + "</td><td>" + esc(r.candidates.join(" · ")) + "</td></tr>";
      }).join("");
      return '<div class="ccd-card"><div class="ccd-card-h"><h4>' + esc(c.name) + "</h4><span class=\"pm-badge\" data-kind=\"scope\">" + esc(c.purpose) + "</span></div>" +
        '<dl class="pm-kv">' +
        "<dt>Members</dt><dd>Requested " + c.membersRequested + " · Effective " + c.membersEffective + " · " + esc(c.waves) + "</dd>" +
        "<dt>Sizing</dt><dd>Min " + c.minMembers + " · Max " + c.maxMembers + " · " + (c.adaptiveSizing ? "Adaptive" : "Fixed") + "</dd>" +
        "<dt>Reserve</dt><dd>" + esc(c.reserve.usage) + " · " + esc(c.reserve.cost) + " · " + esc(c.reserve.time) + "</dd>" +
        "<dt>Write policy</dt><dd>" + esc(c.writePolicy) + "</dd>" +
        "<dt>Board</dt><dd>" + esc(c.boardTopology) + "</dd>" +
        "<dt>Diversity</dt><dd>" + esc(c.diversity) + "</dd>" +
        "<dt>Corroboration</dt><dd>" + esc(c.corroboration) + "</dd>" +
        "<dt>Reducer</dt><dd>" + esc(c.reducer) + "</dd>" +
        "<dt>Failure</dt><dd>" + esc(c.failureStop) + "</dd></dl>" +
        '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">Route policy</div><div class="pm-row-desc">' + esc(c.capacityNote) + "</div></div>" +
        '<div class="pm-row-control"><span class="pm-select"><select data-crewpol="' + esc(c.id) + '" aria-label="Route policy for ' + esc(c.name) + '">' +
        '<option value="adaptive"' + (pol === "adaptive" ? " selected" : "") + ">Adaptive</option>" +
        '<option value="strict"' + (pol === "strict" ? " selected" : "") + ">Strict</option></select></span></div></div>" +
        '<details class="pm-accordion"><summary>Member roles (' + c.roles.length + ")</summary><div class=\"pm-accordion-body\">" +
        '<table class="pm-table"><thead><tr><th>Role</th><th>Persona</th><th>Capability</th><th>Candidates</th></tr></thead><tbody>' + roles + "</tbody></table></div></details></div>";
    }).join("");
    var body = cards +
      '<div><button type="button" class="pm-btn" data-crew-new>New Crew template…</button></div>';
    renderManagerShell({
      id: "crew", title: "Crew",
      lede: "Reusable multi-agent execution templates. A Crew is not a persona, a mode, a provider, a permission grant, or a hidden memory.",
      tabs: [["templates", "Templates"]], tab: "templates", body: cards ? body : '<div class="pm-empty"><div class="pm-empty-title">No Crew templates</div></div>',
      margin: '<div class="ccd-margin-card"><h4>Capacity honesty</h4><p class="ccd-sub">Requested composition is preserved even when capacity admits less — queued waves run the remainder.</p></div>'
    });
    root.querySelectorAll("[data-crewpol]").forEach(function (s) {
      s.addEventListener("change", function () {
        var map = PMStore.get("crewRoutePolicies", {});
        map[s.getAttribute("data-crewpol")] = s.value;
        PMStore.set("crewRoutePolicies", map);
        PMStore.receipt("Crew route policy saved (simulated)", "ok");
      });
    });
    var nb = root.querySelector("[data-crew-new]");
    if (nb) nb.addEventListener("click", function () { PMStore.receipt("Template editor simulated — purpose, roles, candidates, reserves, and failure policy", "info"); });
  }

  /* ---------- PERMISSIONS & FILESAFE ---------- */
  function renderPermissions(route) {
    var tab = route.tab || "rules";
    var perms = PMStore.get("permissions", {});
    var eli5 = PMStore.get("eli5", false);
    var body = "";
    var tabs = [["rules", "Rules"], ["tools", "Per-tool overrides"], ["filesafe", "FileSafe floor"], ["profiles", "Persona profiles"]];
    if (tab === "rules") {
      var rules = (perms.rules || []).map(function (r, i) {
        return '<div class="ccd-rule" draggable="true" data-rule="' + esc(r.id) + '">' +
          '<span class="pm-badge" data-kind="scope">' + (i + 1) + "</span>" +
          '<span class="ccd-rule-pat">' + esc(r.pattern) + "</span>" +
          '<span>' + esc(r.action) + ' <span class="pm-faint">· ' + esc(r.scope) + "</span></span>" +
          '<span class="pm-faint" style="font-size:11px">' + esc(r.note) + "</span></div>";
      }).join("");
      body = '<div class="ccd-card"><div class="ccd-card-h"><h4>Ordered rules</h4><span class="pm-badge" data-kind="scope">Last match wins</span></div>' +
        '<p class="ccd-sub">' + (eli5
          ? "Rules are checked from top to bottom. The last one that matches your file decides what happens — like the last word counts."
          : "Granular rules evaluate in order; the final matching rule is authoritative. Drag to reorder. Wildcards use ** for any path depth.") + "</p>" +
        '<div style="display:grid;gap:6px" id="ccd-rules">' + rules + "</div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-block-start:8px">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-perm="trace">Trace a sample path</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-perm="wildcards">Wildcard help</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-perm="eli5">' + (eli5 ? "Expert wording" : "ELI5 wording") + "</button>" +
        '<button type="button" class="pm-btn" data-variant="quiet" data-perm="presets">Presets…</button></div>' +
        '<div id="ccd-trace"></div></div>';
    } else if (tab === "tools") {
      body = '<div class="ccd-card"><div class="ccd-card-h"><h4>Per-tool overrides</h4></div>' +
        '<table class="pm-table"><thead><tr><th>Tool</th><th>Policy</th><th>Origin</th></tr></thead><tbody>' +
        (perms.perToolOverrides || []).map(function (t) { return "<tr><td>" + esc(t.tool) + "</td><td>" + esc(t.policy) + "</td><td>" + esc(t.origin) + "</td></tr>"; }).join("") +
        "</tbody></table></div>" +
        '<div class="ccd-card"><div class="ccd-card-h"><h4>External directories</h4></div>' +
        '<p class="ccd-sub">Directories outside the workspace that agents may read after approval.</p><ul>' +
        (perms.externalDirs || []).map(function (d) { return '<li class="pm-mono">' + esc(d) + "</li>"; }).join("") + "</ul>" +
        '<div><button type="button" class="pm-btn" data-variant="quiet" data-perm="add-dir">Add a directory…</button></div></div>' +
        '<div class="ccd-card"><div class="ccd-card-h"><h4>Matrices</h4></div><p class="ccd-sub">' + esc(perms.matrices.readOnly) + ". " + esc(perms.matrices.full) + ".</p>" +
        '<div><button type="button" class="pm-btn" data-variant="quiet" data-perm="matrices">Open the full matrix</button></div></div>';
    } else if (tab === "filesafe") {
      var f = perms.filesafeFloor || {};
      body = '<div class="ccd-card"><div class="ccd-card-h"><h4>FileSafe floor</h4>' + V.healthDot("ok", f.health || "Healthy") + "</div>" +
        '<p class="ccd-sub">FileSafe is the non-bypassable floor. This card shows health and the effective boundary — never a way around it.</p>' +
        '<dl class="pm-kv"><dt>Effective boundary</dt><dd>' + esc(f.boundary || "") + "</dd>" +
        "<dt>Protected scopes</dt><dd>" + esc((f.protectedScopes || []).join(", ")) + "</dd>" +
        "<dt>Repair guidance</dt><dd>" + esc(f.repair || "") + "</dd></dl>" +
        '<div><button type="button" class="pm-btn" data-perm="filesafe-setup">Complete the sandbox setup…</button></div></div>';
    } else if (tab === "profiles") {
      body = '<div class="ccd-card"><div class="ccd-card-h"><h4>Per-persona profiles</h4></div>' +
        '<table class="pm-table"><thead><tr><th>Persona</th><th>Permission profile</th></tr></thead><tbody>' +
        (perms.personaProfiles || []).map(function (p) { return "<tr><td>" + esc(p.persona) + "</td><td>" + esc(p.profile) + "</td></tr>"; }).join("") +
        '</tbody></table></div>' +
        '<div class="ccd-card"><div class="ccd-card-h"><h4>Scopes</h4></div><p class="ccd-sub">Rules can attach at ' + esc((perms.scopes || []).join(" · ")) + ". Requested, effective, and origin stay visible per row in the workspace.</p></div>";
    }
    renderManagerShell({
      id: "permissions", title: "Permissions and FileSafe",
      lede: "Approval rules with ordered evaluation, per-tool overrides, and the non-bypassable FileSafe floor.",
      tabs: tabs, tab: tab, body: body,
      margin: '<div class="ccd-margin-card"><h4>Access profiles</h4><p class="ccd-sub">Ask for approval · Auto accept edits · Auto · Full Access. Plan and Review are effect-limited, not tool-free.</p></div>'
    });
    root.querySelectorAll("[data-perm]").forEach(function (b) {
      b.addEventListener("click", function () {
        var op = b.getAttribute("data-perm");
        if (op === "eli5") { PMStore.set("eli5", !PMStore.get("eli5", false)); return; }
        if (op === "trace") {
          var t = perms.sampleTrace;
          document.getElementById("ccd-trace").innerHTML = '<div class="ccd-card" style="margin-block-start:10px"><div class="ccd-card-h"><h4>Trace: ' + esc(t.path) + "</h4></div><div class=\"ccd-trace\">" +
            t.steps.map(function (s) { return '<div class="ccd-trace-step"><span class="pm-mono">' + esc(s.rule) + "</span><span>" + esc(s.result) + "</span></div>"; }).join("") + "</div></div>";
          return;
        }
        var msgs = {
          wildcards: "** matches any path depth; * matches one segment; ? matches one character",
          presets: "Presets simulated — Careful reader, Balanced, Trusted automation",
          "add-dir": "Directory picker simulated — additions always require approval once",
          matrices: "Matrix simulated — 31 tools across 5 scopes, read-only here",
          "filesafe-setup": "Setup simulated — the sandbox extends to build outputs; the floor itself never moves"
        };
        PMStore.receipt(msgs[op] || "Simulated", "info");
      });
    });
    /* drag reorder — stable height, no clipped animation */
    var dragId = null;
    root.querySelectorAll(".ccd-rule").forEach(function (el) {
      el.addEventListener("dragstart", function () { dragId = el.getAttribute("data-rule"); el.classList.add("is-drag"); });
      el.addEventListener("dragend", function () { el.classList.remove("is-drag"); });
      el.addEventListener("dragover", function (ev) { ev.preventDefault(); });
      el.addEventListener("drop", function (ev) {
        ev.preventDefault();
        var target = el.getAttribute("data-rule");
        if (!dragId || dragId === target) return;
        var perms2 = PMStore.get("permissions", {});
        var rules = (perms2.rules || []).slice();
        var from = -1, to = -1;
        rules.forEach(function (r, i) { if (r.id === dragId) from = i; if (r.id === target) to = i; });
        if (from === -1 || to === -1) return;
        var moved = rules.splice(from, 1)[0];
        rules.splice(to, 0, moved);
        perms2.rules = rules;
        PMStore.set("permissions", perms2);
        PMStore.receipt("Rule order updated — last match wins, evaluated top to bottom", "ok");
      });
    });
  }

  /* ---------- BACK SEAT DRIVER ---------- */
  function renderBsd(route) {
    var bsd = PMStore.get("bsd", {});
    var mode = V.getOverride("goal.bsd-mode");
    if (mode === undefined) mode = bsd.mode || "auto";
    var modeSeg = ["off", "auto", "on"].map(function (m) {
      return '<button type="button" role="radio" aria-checked="' + (mode === m) + '" data-bsd-mode="' + m + '">' + m.charAt(0).toUpperCase() + m.slice(1) + "</button>";
    }).join("");
    var truths = (bsd.truths || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    var body = '<div class="ccd-card"><div class="ccd-card-h"><h4>Mode</h4>' + V.healthDot("ok", (bsd.health || {}).state === "ready" ? "Ready" : "Check") + "</div>" +
      '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">Back Seat Driver</div>' +
      '<div class="pm-row-desc">' + esc(bsd.modeNote || "") + "</div></div>" +
      '<div class="pm-row-control"><div class="pm-seg" role="radiogroup" aria-label="Back Seat Driver mode">' + modeSeg + "</div></div></div>" +
      "<ul>" + truths + "</ul></div>" +
      '<div class="ccd-card"><div class="ccd-card-h"><h4>Advanced</h4></div><dl class="pm-kv">' +
      "<dt>Route</dt><dd>" + esc(bsd.route || "") + "</dd>" +
      "<dt>Triggers</dt><dd>" + esc((bsd.triggers || []).join(" · ")) + "</dd>" +
      "<dt>Usage guard</dt><dd>" + esc(bsd.usageGuard || "") + "</dd>" +
      "<dt>Latency budget</dt><dd>" + esc(bsd.latencyBudget || "") + "</dd>" +
      "<dt>Privacy boundary</dt><dd>" + esc(bsd.privacyBoundary || "") + "</dd>" +
      "<dt>Tool access</dt><dd>" + esc(bsd.toolAccess || "") + "</dd>" +
      "<dt>Last review</dt><dd>" + esc((bsd.health || {}).lastReview || "Never") + " — " + esc((bsd.health || {}).note || "") + "</dd></dl>" +
      '<div><button type="button" class="pm-btn" data-bsd-run>Run a review now</button></div></div>';
    renderManagerShell({
      id: "bsd", title: "Back Seat Driver",
      lede: "A read-only second opinion that flags risky turns. It receives bounded deltas, cannot widen authority, and never blocks primary work by failing.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body,
      margin: '<div class="ccd-margin-card"><h4>Overrides</h4><p class="ccd-sub">Chat may override BSD for one turn or the current thread — that control lives in Chat, not here.</p></div>'
    });
    root.querySelectorAll("[data-bsd-mode]").forEach(function (b) {
      b.addEventListener("click", function () {
        V.setOverride("goal.bsd-mode", b.getAttribute("data-bsd-mode"));
        PMStore.receipt("Back Seat Driver mode saved", "ok");
      });
    });
    var run = root.querySelector("[data-bsd-run]");
    if (run) run.addEventListener("click", function () {
      var b = PMStore.get("bsd", {});
      b.health = b.health || {};
      b.health.lastReview = "just now";
      b.health.note = "4 reviews in the last 24 hours, 1 flag raised (resolved)";
      PMStore.set("bsd", b);
      PMStore.receipt("Review simulated — no flags on the current turn", "ok");
    });
  }

  /* ---------- manager shell ---------- */
  function renderManagerShell(opts) {
    var tabs = (opts.tabs || []).map(function (t) {
      return '<button type="button" role="tab" aria-selected="' + (t[0] === opts.tab) + '" aria-current="' + (t[0] === opts.tab) + '" data-mtab="' + t[0] + '">' + esc(t[1]) + "</button>";
    }).join("");
    root.innerHTML = '<div class="ccd-mgr ccd-fade"><div class="ccd-mgr-body"><div class="ccd-mgr-inner">' +
      '<header class="ccd-mgr-head"><span class="ccd-eyebrow">' + esc(opts.title) + "</span>" +
      '<h1 class="ccd-h1">' + esc(opts.title) + "</h1>" +
      '<p class="ccd-sub">' + opts.lede + "</p>" +
      (opts.tabs && opts.tabs.length > 1 ? '<nav class="ccd-mgr-nav" role="tablist">' + tabs + "</nav>" : "") +
      "</header>" +
      '<div class="ccd-mgr-content">' + opts.body + "</div>" +
      "</div></div>" +
      '<aside class="ccd-margin" aria-label="Inspector"><h2 class="ccd-margin-h">Inspector</h2>' + (opts.margin || "") + "</aside></div>";
    root.querySelectorAll("[data-mtab]").forEach(function (b) {
      b.addEventListener("click", function () {
        PMRouter.go({ manager: opts.id, tab: b.getAttribute("data-mtab") });
      });
    });
  }

  /* ---------- router ---------- */
  function render(route, fromNav) {
    if (spy) { spy.detach(); spy = null; }
    currentRoute = route;
    if (route.view === "manager" && PMStore.get("slowHydration", false)) {
      PMStore.set("slowHydration", false);
      var hydMeta = ((CD.managerMeta || DEMO.managerMeta || {})[route.manager]) || { title: "Manager" };
      renderManagerShell({ id: route.manager, title: hydMeta.title, lede: "", tabs: [], tab: "",
        body: V.operationHtml({ id: "hydrate", title: "Hydrating " + hydMeta.title, phase: "Loading domain state", state: "starting", progressKind: "none", source: "simulated", waitReason: "Compact summaries stayed usable — the full manager hydrates on demand, never at Settings open" }) });
      window.setTimeout(function () { render(route, false); }, 900);
      return;
    }
    if (route.view === "manager") {
      if (route.manager === "providers") return renderProviders(route);
      if (route.manager === "context") return renderContext(route);
      if (route.manager === "memory") return renderMemory(route);
      if (route.manager === "personas") return renderPersonas(route);
      if (route.manager === "goal") return renderGoal(route);
      if (route.manager === "crew") return renderCrew(route);
      if (route.manager === "permissions") return renderPermissions(route);
      if (route.manager === "bsd") return renderBsd(route);
      /* a manager this concept does not own: honest handoff */
      root.innerHTML = '<div class="ccd-home"><div class="ccd-home-inner"><div class="pm-empty" style="margin-block-start:60px"><div class="pm-empty-title">This manager belongs to another concept</div><div class="pm-empty-guidance">Concord demonstrates Context, Memory, Personas, Goal, Crew, Permissions, Back Seat Driver, and Providers. The coverage matrix records the rest as shared grammar.</div></div></div></div>';
      return;
    }
    if (route.view === "category") return renderWorkspace(route, fromNav);
    renderHome();
  }

  /* ---------- demo drawer ---------- */
  function buildDemoDrawer() {
    var list = document.getElementById("ccd-demo-list");
    var concept = CD.demoScenarios.map(function (s) {
      return '<button type="button" class="pm-btn" data-demo="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
    var prov = V.PROVIDER_SCENARIOS.map(function (s) {
      return '<button type="button" class="pm-btn" data-prov-scenario="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
    list.innerHTML = '<div class="ccd-demo-group">Concord states</div>' + concept +
      '<div class="ccd-demo-group">Provider scenarios</div>' + prov;
    list.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest("[data-demo]");
      var ps = ev.target.closest && ev.target.closest("[data-prov-scenario]");
      if (ps) { V.applyProviderScenario(ps.getAttribute("data-prov-scenario"), function () { render(PMRouter.current()); }); return; }
      if (!b) return;
      runScenario(b.getAttribute("data-demo"));
    });
  }

  function runScenario(id) {
    if (id === "calm") {
    if (id === "slow-hydration") { PMStore.set("slowHydration", true); PMStore.receipt("Scenario applied — the next manager you open hydrates on demand with a truthful loading projection", "info"); return; }
      PMStore.set("calmDemo", true);
      PMStore.receipt("Calm state — every notice dismissed; reset to bring them back", "ok");
      return;
    }
    if (id === "reset") { PMStore.resetDemo(); PMStore.receipt("Demo data reset to its seeded state", "ok"); return; }
    if (id === "memory-fading") {
      var mem = PMStore.get("memory", { gists: [] });
      mem.gists.forEach(function (g) { if (g.id === "g-105") g.activation = 0.08; });
      PMStore.set("memory", mem);
      navigate({ manager: "memory", tab: "ledger" });
      PMStore.receipt("Scenario applied — “Likes explanations to lead with the tradeoff” fell below the active set (8% activation)", "info");
      return;
    }
    if (id === "memory-restore") {
      navigate({ manager: "memory", tab: "ledger" });
      window.setTimeout(function () { openGist("g-101"); }, 250);
      return;
    }
    if (id === "persona-import") {
      navigate({ manager: "personas", tab: "gallery" });
      window.setTimeout(openPersonaImport, 250);
      return;
    }
    if (id === "validation-error") {
      V.setError("terminal.shell-path", "Not a valid shell path — enter an absolute path ending in .exe, or clear the field for Auto.");
      navigate({ category: "terminal", sub: "shell", setting: "terminal.shell-path" });
      PMStore.receipt("Scenario applied — a validation error is pinned on Default shell", "warn");
      return;
    }
    if (id === "changed-elsewhere") {
      V.setChanged("notifications.volume", "set to 65% in another window at 09:12");
      navigate({ category: "notifications", sub: "sounds", setting: "notifications.volume" });
      PMStore.receipt("Scenario applied — Notification volume shows the changed-elsewhere bar", "info");
      return;
    }
    if (id === "rule-trace") {
      navigate({ manager: "permissions", tab: "rules" });
      window.setTimeout(function () {
        var btn = document.querySelector('[data-perm="trace"]');
        if (btn) btn.click();
      }, 250);
      return;
    }
    if (id === "bsd-review") {
      navigate({ manager: "bsd", tab: "overview" });
      window.setTimeout(function () {
        var btn = document.querySelector("[data-bsd-run]");
        if (btn) btn.click();
      }, 250);
      return;
    }
  }

  /* ---------- squeezed fallback + boot ---------- */
  function wireSqueezeFallback() {
    if (!("ResizeObserver" in window)) return;
    new ResizeObserver(function (entries) {
      var w = entries[0].contentRect.width;
      root.classList.toggle("ccd-narrow", w <= 1280);
      root.classList.toggle("ccd-squeezed", w <= 900);
    }).observe(root);
  }

  document.addEventListener("DOMContentLoaded", function () {
    searchIndex = buildSearchIndex();
    PMShell.init();
    V.bindSettings(root, settingsHandlers());
    V.bindProviders(root, rerenderCurrent);
    V.bindRoles(root);
    buildDemoDrawer();
    V.wireDrawer({
      button: document.querySelector("[data-demo-open]"),
      drawer: document.getElementById("ccd-demo"),
      scrim: document.getElementById("ccd-scrim")
    });
    wireSqueezeFallback();
    renderInbox();
    /* Domain-local refresh (Performance register §7.3 narrow deltas, §20.2):
       repaint only the surface that owns the changed key; every other
       surface renders fresh on entry. */
    var KEY_DOMAIN = Object.assign({}, V.SHARED_KEY_DOMAINS, {
      "dismissedNotices": "notices", "calmDemo": "notices",
      "memory": "manager:memory", "contextSources": "manager:context",
      "crewRoutePolicies": "manager:crew", "permissions": "manager:permissions",
      "eli5": "manager:permissions", "bsd": "manager:bsd"
    });
    PMStore.on("change", function (info) {
      renderInbox();
      var path = info && info.path;
      if (path == null) { render(currentRoute, false); return; }
      var owner = KEY_DOMAIN[path] || KEY_DOMAIN[path.split(".")[0]] || null;
      var current = currentRoute.view === "manager" ? "manager:" + currentRoute.manager
        : currentRoute.view === "category" ? "workspace" : "home";
      if (owner === "notices") { if (current === "home") render(currentRoute, false); return; }
      if (owner != null && owner === current) render(currentRoute, false);
    });
    PMStore.on("reset", function () { render(PMRouter.current(), false); });
    PMRouter.init({ onRoute: function (route) { render(route, true); } });
  });
})();
