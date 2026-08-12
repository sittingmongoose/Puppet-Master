/* ============================================================================
   foundry.js — Concept 03 "Foundry" (engineering bench)
   ----------------------------------------------------------------------------
   Dense bench composition over the frozen shared layer. Families:
   File Manager/Editor, Terminal, LSP, Formatters, Commands & Shortcuts,
   MCP/Skills/Plugins/Tools catalog, Testing & Debug.
   Shared binders (bindSettings/bindProviders/bindRoles) attach ONCE at boot.
   ========================================================================== */
(function () {
  "use strict";

  var DEMO = window.PM_CORE_DATA;
  var FD = window.FDY_DATA;
  var V = window.PMViews;
  var esc = V.esc;
  var root = document.getElementById("fdy-root");
  var spy = null;
  var searchIndex = null;
  var currentRoute = { view: "home", category: null, sub: null, setting: null, manager: null, tab: null };

  PMStore.seed({
    providers: V.clone(DEMO.providers),
    roles: V.clone(DEMO.roles),
    overrides: {},
    errors: {},
    changedElsewhere: {},
    dismissedNotices: [],
    calmDemo: false,
    terminalProfiles: V.clone(FD.terminalProfiles),
    ansiPalette: V.clone(FD.ansiPalette),
    lspServers: V.clone(FD.lspServers),
    formatters: V.clone(FD.formatters),
    customCommands: V.clone(FD.customCommands),
    shortcuts: V.clone(FD.shortcuts),
    mcp: V.clone(FD.mcp),
    skills: V.clone(FD.skills),
    plugins: V.clone(FD.plugins),
    tools: V.clone(FD.tools),
    testingMatrix: {},
    forgeConnected: false
  });
  PMStore.init("foundry");

  function buildSearchIndex() {
    var demo = Object.assign({}, DEMO, {
      managerMeta: Object.assign({}, DEMO.managerMeta, FD.managerMeta),
      actions: DEMO.actions.concat(FD.actions)
    });
    return PMSearch.buildIndex(demo);
  }

  function catById(id) {
    for (var i = 0; i < DEMO.categories.length; i++) if (DEMO.categories[i].id === id) return DEMO.categories[i];
    return null;
  }

  function navigate(target) { PMRouter.go(target || {}); }

  function noticeList() {
    var dismissed = PMStore.get("dismissedNotices", []);
    if (PMStore.get("calmDemo", false)) return [];
    return DEMO.notices.filter(function (n) { return dismissed.indexOf(n.id) === -1; });
  }

  function renderInbox() {
    var list = document.querySelector("[data-shell-inbox-list]");
    if (!list) return;
    var items = noticeList();
    list.innerHTML = items.length
      ? items.map(V.noticeCompactHtml).join("")
      : '<span class="pm-inbox-empty">All clear — nothing needs your attention.</span>';
    PMShell.setInboxCount(items.length);
  }

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

  /* ---------- shared control bindings (bound ONCE at boot) ---------- */
  function settingsHandlers() {
    return {
      getSetting: function (sid) { return DEMO.settings[sid]; },
      onChange: function (sid, value) {
        if (sid === "terminal.shell-path" && typeof value === "string" && value &&
            value !== "auto" && value !== "not-configured" && !/^[A-Za-z]:\\.*\.exe$/i.test(value)) {
          V.setError(sid, "Not a valid shell path — enter an absolute path ending in .exe, or clear the field for Auto.");
          return;
        }
        V.setError(sid, null);
        V.setOverride(sid, value);
      },
      onRun: function (sid) {
        var msgs = {
          "system.test-restore": "Test restore simulated — the snapshot restored cleanly in a scratch area",
          "system.export-diagnostics": "Diagnostics bundle simulated — nothing was collected or sent",
          "system.feature-flags": "Flag editor simulated — the real editor is a runtime surface",
          "system.factory-reset": "Reset preview simulated — export, snapshot, apply, verify, receipt"
        };
        PMStore.receipt(msgs[sid] || "Action simulated — no real operation ran", sid === "system.factory-reset" ? "warn" : "info");
      }
    };
  }

  function rerenderCurrent() { render(currentRoute, false); }

  /* ---------- HOME: bench board ---------- */
  function homeHtml() {
    var notices = noticeList();
    var groups = [["attention", "Needs attention"], ["setup", "Continue setup"], ["recommended", "Recommended"]];
    var noticeHtml = groups.map(function (g) {
      var items = notices.filter(function (n) { return n.kind === g[0]; });
      if (!items.length) return "";
      return '<div class="fdy-eyebrow">' + esc(g[1]) + "</div>" + items.map(V.noticeHtml).join("");
    }).join("");
    if (!notices.length) {
      noticeHtml = '<div class="fdy-card" style="cursor:default"><p class="fdy-sub">All clear. Nothing needs attention, no setup is waiting, and there are no recommendations right now.</p></div>';
    }
    var dests = DEMO.categories.map(function (c) {
      return '<button type="button" class="fdy-card" data-cat="' + esc(c.id) + '">' +
        '<span class="fdy-card-t">' + V.icon(c.icon) + esc(c.title) + "</span>" +
        '<span class="fdy-card-s">' + esc(c.purpose) + "</span></button>";
    }).join("");
    var mgrs = Object.keys(FD.managerMeta).map(function (mid) {
      var m = FD.managerMeta[mid];
      return '<button type="button" class="fdy-card" data-mgr="' + esc(mid) + '">' +
        '<span class="fdy-card-t">' + V.icon(m.icon) + esc(m.title) + "</span>" +
        '<span class="fdy-card-s">' + esc(m.purpose) + "</span></button>";
    }).join("");
    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" class="fdy-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";
    }).join("");
    return '<div class="fdy-home"><div class="fdy-home-inner fdy-in">' +
      '<div class="fdy-searchbar"><span class="fdy-eyebrow">Foundry · Bench</span>' +
        '<span class="fdy-search"><input type="search" id="fdy-search" placeholder="Search settings, managers, and actions — try “notifcation”" aria-label="Search settings" autocomplete="off" spellcheck="false">' +
        '<span class="fdy-hits" id="fdy-hits" role="listbox" aria-label="Search results" hidden></span></span></div>' +
      '<section class="fdy-notices" aria-label="Notices">' + noticeHtml + "</section>" +
      '<section aria-label="Managers"><div class="fdy-eyebrow" style="margin-block-end:6px">Bench managers</div><div class="fdy-board">' + mgrs + "</div></section>" +
      '<section aria-label="Destinations"><div class="fdy-eyebrow" style="margin-block-end:6px">Workspace destinations</div><div class="fdy-board">' + dests + "</div></section>" +
      '<section aria-label="Recent settings work"><div class="fdy-eyebrow" style="margin-block-end:6px">Recent settings work</div><div class="fdy-recents">' + recents + "</div></section>" +
      "</div></div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    V.wireSearch({ input: document.getElementById("fdy-search"), listEl: document.getElementById("fdy-hits"), index: searchIndex, onPick: onSearchPick });
    root.querySelectorAll("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () { navigate({ category: b.getAttribute("data-cat") }); });
    });
    root.querySelectorAll("[data-mgr]").forEach(function (b) {
      b.addEventListener("click", function () { navigate({ manager: b.getAttribute("data-mgr") }); });
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

  /* ---------- WORKSPACE ---------- */
  function navHtml(cat) {
    return DEMO.categories.map(function (c) {
      var current = c.id === cat.id;
      var subs = "";
      if (current) {
        subs = '<span class="fdy-nav-subs">' + c.subcategories.map(function (s) {
          return '<button type="button" class="fdy-nav-sub" data-subjump="' + esc(s.id) + '">' + esc(s.title) + "</button>";
        }).join("") + "</span>";
      }
      return '<button type="button" class="fdy-nav-cat" data-catnav="' + esc(c.id) + '" aria-current="' + current + '">' + V.icon(c.icon) + esc(c.title) + "</button>" + subs;
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
      out += '<details class="pm-accordion"><summary>Advanced and diagnostic (' + advanced.length + ")</summary>" +
        '<div class="pm-accordion-body">' + advanced.map(function (s) { return V.rowHtml(s); }).join("") + "</div></details>";
    }
    return out;
  }

  function renderWorkspace(route, fromNav) {
    var cat = catById(route.category) || DEMO.categories[0];
    var squeezeSelect = '<span class="pm-select fdy-outline-select"><select id="fdy-cat-select" aria-label="Category">' +
      DEMO.categories.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === cat.id ? " selected" : "") + ">" + esc(c.title) + "</option>"; }).join("") + "</select></span>";
    var sections = cat.subcategories.map(function (sub) {
      return '<section class="fdy-sec" id="sec-' + esc(sub.id) + '" aria-label="' + esc(sub.title) + '">' +
        "<h3>" + esc(sub.title) + '</h3><p class="fdy-sec-sum">' + esc(sub.summary) + "</p>" + sectionRows(sub) + "</section>";
    }).join("");

    root.innerHTML = '<div class="fdy-ws fdy-in">' +
      '<nav class="fdy-nav" aria-label="Categories">' + navHtml(cat) + "</nav>" +
      '<div class="fdy-doc" id="fdy-doc"><div class="fdy-doc-inner">' +
        '<header class="fdy-doc-head">' + squeezeSelect +
          '<span class="fdy-eyebrow">' + esc(cat.title) + "</span><h1>" + esc(cat.purpose) + "</h1></header>" +
        sections + "</div></div></div>";

    var doc = document.getElementById("fdy-doc");
    root.querySelectorAll("[data-catnav]").forEach(function (b) {
      b.addEventListener("click", function () { navigate({ category: b.getAttribute("data-catnav") }); });
    });
    var sel = document.getElementById("fdy-cat-select");
    if (sel) sel.addEventListener("change", function () { navigate({ category: sel.value }); });

    spy = PMSpy.attach({
      root: doc,
      sections: cat.subcategories.map(function (s) { return "sec-" + s.id; }),
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

    if (fromNav && route.setting) {
      var rowEl = document.getElementById("row-" + route.setting);
      if (rowEl) window.setTimeout(function () { PMSpy.jumpTo(rowEl, { root: doc }); }, 60);
    } else if (fromNav && route.sub) {
      var secEl = document.getElementById("sec-" + route.sub);
      if (secEl) window.setTimeout(function () { PMSpy.jumpTo(secEl, { root: doc }); }, 60);
    }
  }

  /* ---------- manager shell with bench grammar ---------- */
  function mgrShell(opts) {
    var tabs = (opts.tabs || []).map(function (t) {
      return '<button type="button" role="tab" aria-selected="' + (t[0] === opts.tab) + '" aria-current="' + (t[0] === opts.tab) + '" data-mtab="' + t[0] + '">' + esc(t[1]) + "</button>";
    }).join("");
    root.innerHTML = '<div class="fdy-mgr"><div class="fdy-mgr-inner fdy-in">' +
      '<header class="fdy-mgr-head"><span class="fdy-eyebrow">' + esc(opts.title) + "</span><h1>" + esc(opts.title) + "</h1>" +
      '<p class="fdy-sub">' + opts.lede + "</p></header>" +
      (opts.toolbar !== false
        ? '<div class="fdy-toolbar"><span class="fdy-search" style="position:relative"><input type="search" placeholder="Filter ' + esc(opts.title) + '…" aria-label="Filter" data-mgr-filter>' +
          '</span><button type="button" class="pm-btn" data-mgr-add>' + esc(opts.addLabel || "Add…") + "</button></div>" +
          '<div class="fdy-health-strip">' + (opts.health || "All resources nominal") + "</div>"
        : "") +
      (opts.tabs && opts.tabs.length > 1 ? '<nav class="fdy-mgr-nav" role="tablist">' + tabs + "</nav>" : "") +
      opts.body + "</div></div>";
    root.querySelectorAll("[data-mtab]").forEach(function (b) {
      b.addEventListener("click", function () { PMRouter.go({ manager: opts.id, tab: b.getAttribute("data-mtab") }); });
    });
    var add = root.querySelector("[data-mgr-add]");
    if (add && opts.onAdd) add.addEventListener("click", opts.onAdd);
    else if (add) add.addEventListener("click", function () { PMStore.receipt("Add simulated — the create flow would open here", "info"); });
    var filter = root.querySelector("[data-mgr-filter]");
    if (filter) filter.addEventListener("input", function () {
      var q = filter.value.trim().toLowerCase();
      root.querySelectorAll(".fdy-table tbody tr[data-name]").forEach(function (tr) {
        tr.hidden = q !== "" && tr.getAttribute("data-name").toLowerCase().indexOf(q) === -1;
      });
    });
  }

  function openDrawer(title, bodyHtml) {
    closeDrawer();
    var d = document.createElement("div");
    d.className = "fdy-drawer";
    d.id = "fdy-drawer";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", title);
    d.innerHTML = '<button type="button" class="pm-btn fdy-drawer-close" data-variant="quiet" data-drawer-close>Close</button><h3>' + esc(title) + "</h3>" + bodyHtml;
    root.appendChild(d);
    d.querySelector("[data-drawer-close]").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", drawerEscape);
  }

  function closeDrawer() {
    var d = document.getElementById("fdy-drawer");
    if (d) d.remove();
    document.removeEventListener("keydown", drawerEscape);
  }

  function drawerEscape(ev) { if (ev.key === "Escape") closeDrawer(); }

  /* ---------- PROVIDERS ---------- */
  var PROVIDER_TABS = [
    ["overview", "Overview"], ["accounts", "Accounts"], ["models", "Models"],
    ["plans", "Plans and limits"], ["routing", "Routing"], ["install", "Installation and updates"], ["advanced", "Advanced"]
  ];

  function renderProviders(route) {
    var pid = route.sub || null;
    var tab = route.tab || "overview";
    var list = V.providers();
    if (!pid || !V.providerById(pid)) pid = list.length ? list[0].id : null;
    var p = V.providerById(pid);
    var groups = ["installed-tools", "connected-accounts", "api", "server", "free"];
    var byGroup = {};
    list.forEach(function (x) { (byGroup[x.connectionGroup] = byGroup[x.connectionGroup] || []).push(x); });
    var rows = groups.filter(function (g) { return byGroup[g] && byGroup[g].length; }).map(function (g) {
      return '<tr class="fdy-domain-row"><td colspan="3" class="fdy-domain">' + esc(V.GROUP_LABEL[g]) + "</td></tr>" +
        byGroup[g].map(function (x) {
          var st = V.providerStatus(x);
          return '<tr data-name="' + esc(x.name) + '" data-pid="' + esc(x.id) + '" aria-selected="' + (x.id === pid) + '">' +
            "<td>" + esc(x.name) + '</td><td class="pm-mono">' + esc(x.tagline) + "</td><td>" + V.healthDot(st.dot, st.label) + "</td></tr>";
        }).join("");
    }).join("");

    var tabs = PROVIDER_TABS.map(function (t) {
      return '<button type="button" role="tab" aria-selected="' + (t[0] === tab) + '" aria-current="' + (t[0] === tab) + '" data-ptab="' + t[0] + '">' + t[1] + "</button>";
    }).join("");
    var body = "";
    if (tab === "overview") {
      var st = V.providerStatus(p);
      var act = V.activeAccount(p);
      var install = V.INSTALL_STATE[p.installState];
      body = '<div class="fdy-card" style="cursor:default"><div class="fdy-card-t">' + esc(p.name) + " " + V.healthDot(st.dot, st.label) + "</div>" +
        '<dl class="pm-kv">' +
        "<dt>Connection</dt><dd>" + esc(V.GROUP_LABEL[p.connectionGroup] || p.connectionGroup) + "</dd>" +
        (install ? "<dt>Installation</dt><dd>" + esc(install) + "</dd>" : "") +
        "<dt>Sign-in</dt><dd>" + esc(p.authNote || V.AUTH_MODEL[p.authModel] || "") + "</dd>" +
        (act ? "<dt>Active account</dt><dd>" + esc(act.label) + " · " + esc(act.identity) + "</dd>" : "") +
        "<dt>Plan</dt><dd>" + esc(p.product.plan) + " — " + esc(p.product.billingRoute) + "</dd>" +
        (p.groupingNote ? "<dt>Grouping</dt><dd>" + esc(p.groupingNote) + "</dd>" : "") + "</dl>" +
        (p.lastError ? '<div class="pm-row-reason">' + esc(p.lastError) + "</div>" : "") + "</div>";
      if (p.installState === "installed-signed-out") {
        body += '<div class="fdy-card" style="cursor:default"><div class="fdy-card-t">Sign in required</div>' +
          '<p class="fdy-sub">This tool owns its own sign-in. Puppet Master launches the native flow and never sees credentials.</p>' +
          '<div><button type="button" class="pm-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in via ' + esc(p.name) + " CLI</button></div></div>";
      }
      if (p.installState === "not-installed" && p.installAction) body += V.installationHtml(p);
    } else if (tab === "accounts") {
      body = (p.accounts || []).map(function (a) { return V.accountRowHtml(p, a); }).join("") ||
        '<div class="pm-empty"><div class="pm-empty-title">No accounts yet</div><div class="pm-empty-guidance">Sign in or connect a credential to add an account.</div></div>';
      body += '<div><button type="button" class="pm-btn" data-variant="quiet" data-pv="reconnect" data-pid="' + esc(p.id) + '">Add another connection…</button></div>';
    } else if (tab === "models") {
      body = (p.models || []).map(function (m) { return V.modelRowHtml(p, m); }).join("") ||
        '<div class="pm-empty"><div class="pm-empty-title">No models listed yet</div></div>';
    } else if (tab === "plans") {
      body = V.usageHtml(p) + (p.usageNote ? '<p class="fdy-sub">' + esc(p.usageNote) + "</p>" : "");
    } else if (tab === "routing") {
      body = V.routingHtml(p) + '<div class="fdy-card" style="cursor:default"><div class="fdy-card-t">Agent roles</div>' + V.rolesHtml(PMStore.get("roles", [])) + "</div>";
    } else if (tab === "install") {
      body = V.installationHtml(p) + V.updatesHtml(p);
    } else if (tab === "advanced") {
      body = V.catalogHtml(p) + V.diagnosticsHtml(p) +
        '<div><button type="button" class="pm-btn" data-variant="quiet" data-pv="refresh" data-pid="' + esc(p.id) + '">Refresh catalog</button></div>';
    }

    root.innerHTML = '<div class="fdy-mgr"><div class="fdy-mgr-inner fdy-in">' +
      '<header class="fdy-mgr-head"><span class="fdy-eyebrow">Providers</span><h1>Accounts, connections, models, and installations</h1>' +
      '<p class="fdy-sub">A provider supplies models, authentication, limits, and capabilities. An installation is a host resource.</p></header>' +
      '<div class="fdy-prov"><div class="fdy-table-wrap"><table class="fdy-table"><thead><tr><th>Family</th><th>Tagline</th><th>Health</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<div style="display:grid;gap:10px;align-content:start"><nav class="fdy-mgr-nav" role="tablist">' + tabs + "</nav>" + body + "</div></div>" +
      "</div></div>";

    root.querySelectorAll("[data-pid]").forEach(function (tr) {
      tr.addEventListener("click", function () { PMRouter.go({ manager: "providers", sub: tr.getAttribute("data-pid"), tab: "overview" }); });
    });
    root.querySelectorAll("[data-ptab]").forEach(function (b) {
      b.addEventListener("click", function () { PMRouter.go({ manager: "providers", sub: pid, tab: b.getAttribute("data-ptab") }); });
    });
  }

  /* ---------- FILE MANAGER / EDITOR ---------- */
  function renderFiles(route) {
    var body = '<div class="fdy-table-wrap"><table class="fdy-table"><thead><tr><th>Behavior</th><th>Value</th><th>State</th></tr></thead><tbody>' +
      FD.fileRows.map(function (r) {
        return '<tr data-name="' + esc(r.label) + '"><td>' + esc(r.label) + '</td><td class="pm-mono">' + esc(r.value) + "</td><td>" + esc(r.state) + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="fdy-card" style="cursor:default"><div class="fdy-card-t">Transient and unavailable states</div>' +
      '<p class="fdy-sub">A network mount that drops shows “Unavailable — the share stopped responding” with a retry, never an empty tree. Recovery restores unsaved buffers after a crash.</p>' +
      '<div style="display:flex;gap:8px"><button type="button" class="pm-btn" data-variant="quiet" data-files="retry">Retry a dropped mount</button></div></div>';
    mgrShell({
      id: "files", title: "File Manager and Editor",
      lede: "Tree behavior, drag/drop, thresholds, tabs, splits, changed-on-disk, and recovery.",
      addLabel: "New tree rule…", health: "9 behaviors healthy · 1 mount unavailable (retry available)",
      tabs: [["behaviors", "Behaviors"]], tab: "behaviors", body: body
    });
    var b = root.querySelector("[data-files]");
    if (b) b.addEventListener("click", function () { PMStore.receipt("Retry simulated — the mount would re-probe and report its state", "info"); });
  }

  /* ---------- TERMINAL ---------- */
  function ansiPreviewHtml(palette) {
    var c = {};
    palette.forEach(function (p, i) { c[i] = p[1]; });
    return '<div class="fdy-term-preview" aria-label="Terminal preview">' +
      '<span style="color:' + c[10] + '">puppet-master</span> <span style="color:' + c[14] + '">%</span> npm test\n' +
      '<span style="color:' + c[12] + '">&gt; puppet-master@ test</span>\n' +
      '<span style="color:' + c[2] + '">PASS</span> <span style="color:' + c[7] + '">tests/store.test.js</span>\n' +
      '<span style="color:' + c[1] + '">FAIL</span> <span style="color:' + c[7] + '">tests/router.test.js</span>\n' +
      '<span style="color:' + c[3] + '">  Expected:</span> <span style="color:' + c[10] + '">200</span> <span style="color:' + c[3] + '">Received:</span> <span style="color:' + c[9] + '">404</span>\n' +
      '<span style="color:' + c[6] + '">Tests: 41 passed, 1 failed, 42 total</span></div>';
  }

  function renderTerminal(route) {
    var tab = route.tab || "profiles";
    var profiles = PMStore.get("terminalProfiles", []);
    var palette = PMStore.get("ansiPalette", []);
    var active = PMStore.get("terminal.activeTab", profiles[0] ? profiles[0].id : null);
    var p = null;
    profiles.forEach(function (x) { if (x.id === active) p = x; });
    var body = "";
    if (tab === "profiles") {
      var list = profiles.map(function (pr) {
        return '<tr data-name="' + esc(pr.name) + '" data-profile="' + esc(pr.id) + '" aria-selected="' + (p && pr.id === p.id) + '">' +
          "<td>" + esc(pr.name) + (pr.complete ? "" : ' <span class="pm-badge" data-kind="state" data-icon data-state="effective-differs">Setup incomplete</span>') + "</td>" +
          '<td class="pm-mono">' + esc(pr.shell) + "</td><td>" + esc(pr.cwd) + "</td></tr>";
      }).join("");
      var detail = p ? '<dl class="pm-kv">' +
        "<dt>Shell</dt><dd class=\"pm-mono\">" + esc(p.shell) + "</dd>" +
        "<dt>Environment</dt><dd>" + esc(p.env) + "</dd>" +
        "<dt>Font</dt><dd>" + esc(p.font) + "</dd>" +
        "<dt>Rendering</dt><dd>" + esc(p.rendering) + "</dd>" +
        "<dt>Cursor</dt><dd>" + esc(p.cursor) + "</dd>" +
        "<dt>Selection</dt><dd>" + esc(p.selection) + "</dd>" +
        "<dt>Copy/paste</dt><dd>" + esc(p.copyPaste) + "</dd>" +
        "<dt>Working directory</dt><dd class=\"pm-mono\">" + esc(p.cwd) + "</dd>" +
        "<dt>Transcript</dt><dd>" + esc(p.transcript) + "</dd>" +
        "<dt>Performance</dt><dd>" + esc(p.performance) + "</dd>" +
        "<dt>Opacity</dt><dd>" + p.opacity + "% — readability floor 70%</dd></dl>" : "";
      body = '<div class="fdy-table-wrap"><table class="fdy-table"><thead><tr><th>Profile</th><th>Shell</th><th>CWD</th></tr></thead><tbody>' + list + "</tbody></table></div>" +
        '<div class="fdy-card" style="cursor:default"><div class="fdy-card-t">Profile editor — ' + esc(p ? p.name : "") + "</div>" + detail + "</div>";
    } else if (tab === "palette") {
      body = '<div class="fdy-card" style="cursor:default"><div class="fdy-card-t">ANSI palette — 16 wells</div>' +
        '<p class="fdy-sub">Click a well to retune the color; the preview updates live. Contrast warnings appear when text falls below the readability floor.</p>' +
        '<div class="fdy-wells">' + palette.map(function (c, i) {
          return '<span class="fdy-well"><button type="button" style="background:' + esc(c[1]) + '" data-well="' + i + '" aria-label="' + esc(c[0]) + " " + esc(c[1]) + '"></button>' + esc(c[0]) + "</span>";
        }).join("") + "</div></div>" +
        ansiPreviewHtml(palette);
    }
    mgrShell({
      id: "terminal", title: "Terminal",
      lede: "Profiles, rendering, palette, and transcripts. The preview renders real palette values.",
      addLabel: "New profile…", health: "2 profiles · 1 setup incomplete",
      tabs: [["profiles", "Profiles"], ["palette", "ANSI palette and preview"]],
      tab: tab, body: body
    });
    root.querySelectorAll("[data-profile]").forEach(function (tr) {
      tr.addEventListener("click", function () { PMStore.set("terminal.activeTab", tr.getAttribute("data-profile")); });
    });
    root.querySelectorAll("[data-well]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-well"), 10);
        var input = document.createElement("input");
        input.type = "color";
        input.value = palette[i][1];
        input.addEventListener("input", function () {
          var next = PMStore.get("ansiPalette", []).slice();
          next[i] = [next[i][0], input.value];
          PMStore.set("ansiPalette", next);
        });
        input.click();
      });
    });
  }

  /* ---------- LSP ---------- */
  function renderLsp(route) {
    var servers = PMStore.get("lspServers", []);
    var rows = servers.map(function (s) {
      var h = V.HEALTH[s.health] || { label: s.health, dot: "unknown" };
      return '<tr data-name="' + esc(s.name) + '" data-lsp="' + esc(s.id) + '">' +
        "<td>" + esc(s.name) + (s.custom ? ' <span class="pm-badge" data-kind="scope">Custom</span>' : "") + "</td>" +
        "<td>" + esc(s.language) + "</td>" +
        '<td class="pm-mono">' + esc(s.provenance) + "</td>" +
        "<td>" + V.healthDot(h.dot, h.label) + "</td></tr>";
    }).join("");
    var body = '<div class="fdy-table-wrap"><table class="fdy-table"><thead><tr><th>Server</th><th>Language</th><th>Provenance</th><th>Health</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<p class="fdy-sub">Click a row for command, environment, attachment, limits, logs, and verification.</p>';
    mgrShell({
      id: "lsp", title: "Language servers",
      lede: "Registry, requested/effective attachment, host/environment, and verification.",
      addLabel: "Add custom server…", health: "2 ready · 1 degraded (remote) · 1 unresolved binary",
      tabs: [["registry", "Registry"]], tab: "registry", body: body,
      onAdd: function () { PMStore.receipt("Custom server form simulated — command, env, init, config, host", "info"); }
    });
    root.querySelectorAll("[data-lsp]").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var s = null;
        PMStore.get("lspServers", []).forEach(function (x) { if (x.id === tr.getAttribute("data-lsp")) s = x; });
        if (!s) return;
        openDrawer(s.name, '<dl class="pm-kv">' +
          "<dt>Catalog / provenance</dt><dd>" + esc(s.source) + " · " + esc(s.provenance) + "</dd>" +
          "<dt>Command</dt><dd class=\"pm-mono\">" + esc(s.command) + "</dd>" +
          "<dt>Environment</dt><dd>" + esc(s.env) + "</dd>" +
          "<dt>Init / config</dt><dd>" + esc(s.init) + " · " + esc(s.config) + "</dd>" +
          "<dt>Requested</dt><dd>" + esc(s.requested) + "</dd>" +
          "<dt>Effective</dt><dd>" + esc(s.effective) + "</dd>" +
          "<dt>Host / environment</dt><dd>" + esc(s.host) + "</dd>" +
          "<dt>Limits</dt><dd>" + esc(s.limits) + "</dd>" +
          "<dt>Logs</dt><dd>" + esc(s.logs) + "</dd>" +
          "<dt>Verification</dt><dd>" + esc(s.verification) + "</dd></dl>" +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button type="button" class="pm-btn" data-variant="quiet" data-lsp-op="restart">Restart server</button>' +
          '<button type="button" class="pm-btn" data-variant="quiet" data-lsp-op="logs">Open logs</button></div>');
        var drawer = document.getElementById("fdy-drawer");
        drawer.querySelector('[data-lsp-op="restart"]').addEventListener("click", function () {
          PMStore.receipt("Restart simulated — the server would re-handshake and re-attach", "info");
        });
        drawer.querySelector('[data-lsp-op="logs"]').addEventListener("click", function () {
          PMStore.receipt("Logs simulated — the log surface would open in the bottom panel", "info");
        });
      });
    });
  }

  /* ---------- FORMATTERS ---------- */
  function renderFormatters(route) {
    var fmts = PMStore.get("formatters", []);
    var rows = fmts.map(function (f) {
      var stateBadge = f.state === "detected" ? '<span class="pm-badge" data-kind="state" data-icon data-state="default">Detected</span>'
        : f.state === "not found" ? '<span class="pm-badge" data-kind="state" data-icon data-state="unavailable">Not found</span>'
        : '<span class="pm-badge" data-kind="state" data-icon data-state="not-configured">Disabled</span>';
      return '<tr data-name="' + esc(f.name) + '" data-fmt="' + esc(f.id) + '">' +
        "<td>" + esc(f.name) + "</td><td>" + esc(f.kind) + "</td>" +
        '<td class="pm-mono">' + esc(f.command) + "</td><td>" + esc(f.extensions) + "</td><td>" + esc(f.scope) + "</td><td>" + stateBadge + "</td></tr>";
    }).join("");
    var body = V.rowHtml(DEMO.settings["devtools.format-on-save"]) +
      '<div class="fdy-table-wrap"><table class="fdy-table"><thead><tr><th>Formatter</th><th>Kind</th><th>Command</th><th>Extensions</th><th>Scope</th><th>State</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-fmt-op="test">Test the active formatter</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-fmt-op="reset">Reset to built-ins</button></div>';
    mgrShell({
      id: "formatters", title: "Formatters",
      lede: "Built-in and custom registry with detected / not found / disabled states and a receipted test action.",
      addLabel: "Add formatter…", health: "2 detected · 1 not found · 1 disabled",
      tabs: [["registry", "Registry"]], tab: "registry", body: body,
      onAdd: function () { PMStore.receipt("Add formatter simulated — command, env, extensions, scope", "info"); }
    });
    root.querySelector('[data-fmt-op="test"]').addEventListener("click", function () {
      PMStore.receipt("Formatter test simulated — Prettier formatted a scratch buffer in 42 ms; receipt recorded", "ok");
    });
    root.querySelector('[data-fmt-op="reset"]').addEventListener("click", function () {
      PMStore.set("formatters", V.clone(FD.formatters));
      PMStore.receipt("Registry reset to built-ins (simulated)", "ok");
    });
    root.querySelectorAll("[data-fmt]").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var f = null;
        PMStore.get("formatters", []).forEach(function (x) { if (x.id === tr.getAttribute("data-fmt")) f = x; });
        if (!f) return;
        openDrawer(f.name, '<dl class="pm-kv">' +
          "<dt>State</dt><dd>" + esc(f.state) + (f.note ? " — " + esc(f.note) : "") + "</dd>" +
          "<dt>Command</dt><dd class=\"pm-mono\">" + esc(f.command) + "</dd>" +
          "<dt>Environment</dt><dd>" + esc(f.env) + "</dd>" +
          "<dt>Extensions</dt><dd>" + esc(f.extensions) + "</dd>" +
          "<dt>Scope</dt><dd>" + esc(f.scope) + "</dd></dl>" +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button type="button" class="pm-btn" data-variant="quiet" data-fmt-drawer="remove">Remove</button></div>');
        document.getElementById("fdy-drawer").querySelector("[data-fmt-drawer]").addEventListener("click", function () {
          PMStore.receipt("Remove simulated — the registry entry would leave with a receipt", "warn");
          closeDrawer();
        });
      });
    });
  }

  /* ---------- COMMANDS & SHORTCUTS ---------- */
  function renderCommands(route) {
    var tab = route.tab || "custom";
    var body = "";
    if (tab === "custom") {
      var rows = PMStore.get("customCommands", []).map(function (c) {
        var safety = c.safety === "pass"
          ? '<span class="pm-badge" data-kind="state" data-icon data-state="default">Shell-safe</span>'
          : '<span class="pm-badge" data-kind="state" data-icon data-state="effective-differs">Validation: ' + esc(c.safetyNote) + "</span>";
        return '<tr data-name="' + esc(c.name) + '" data-cmd="' + esc(c.id) + '">' +
          "<td>" + esc(c.name) + "</td><td>" + esc(c.scope) + '</td><td class="pm-mono">' + esc(c.shell) + "</td><td>" + safety + "</td></tr>";
      }).join("");
      body = '<div class="fdy-table-wrap"><table class="fdy-table"><thead><tr><th>Command</th><th>Scope</th><th>Shell</th><th>Safety</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
        '<p class="fdy-sub">Click a row to edit or dry-run. A dry run resolves parameters and shows the exact command — it never sends work to an agent.</p>';
    } else if (tab === "shortcuts") {
      var srows = PMStore.get("shortcuts", []).map(function (s) {
        return '<tr data-name="' + esc(s.name) + '" data-shortcut="' + esc(s.id) + '" data-conflict="' + s.conflict + '">' +
          "<td>" + esc(s.name) + (s.custom ? ' <span class="pm-badge" data-kind="scope">Custom</span>' : "") + "</td>" +
          '<td class="pm-mono">' + esc(s.shortcut) + "</td>" +
          "<td>" + (s.conflict ? '<span class="pm-badge" data-kind="state" data-icon data-state="effective-differs">Conflict</span>' : "—") + "</td>" +
          '<td><button type="button" class="pm-btn" data-variant="quiet" data-remap="' + esc(s.id) + '">Remap</button></td></tr>';
      }).join("");
      body = '<div class="fdy-table-wrap"><table class="fdy-table"><thead><tr><th>Command</th><th>Binding</th><th>State</th><th></th></tr></thead><tbody>' + srows + "</tbody></table></div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-sh-op="reset">Reset all</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-sh-op="import">Import…</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-sh-op="export">Export</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-sh-op="cheatsheet">Cheat sheet</button></div>';
    }
    mgrShell({
      id: "commands", title: "Commands and shortcuts",
      lede: "Custom commands with parameters and shell-safety validation; shortcuts with conflicts, remap, and a recorder.",
      addLabel: "New command…", health: "3 custom commands · 1 shortcut conflict",
      tabs: [["custom", "Custom commands"], ["shortcuts", "Shortcuts"]],
      tab: tab, body: body,
      onAdd: function () { PMStore.receipt("Command editor simulated — name, scope, shell, parameters, includes", "info"); }
    });
    root.querySelectorAll("[data-cmd]").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var c = null;
        PMStore.get("customCommands", []).forEach(function (x) { if (x.id === tr.getAttribute("data-cmd")) c = x; });
        if (!c) return;
        openDrawer(c.name, '<dl class="pm-kv">' +
          "<dt>Scope</dt><dd>" + esc(c.scope) + "</dd>" +
          "<dt>Shell</dt><dd class=\"pm-mono\">" + esc(c.shell) + "</dd>" +
          "<dt>Parameters</dt><dd>" + esc(c.parameters) + "</dd>" +
          "<dt>Includes</dt><dd>" + esc(c.includes) + "</dd>" +
          "<dt>Safety</dt><dd>" + (c.safety === "pass" ? "Passes shell-safety validation" : esc(c.safetyNote)) + "</dd></dl>" +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button type="button" class="pm-btn" data-variant="primary" data-cmd-op="dry">Dry-run preview</button>' +
          (c.safety !== "pass" ? '<button type="button" class="pm-btn" data-variant="quiet" data-cmd-op="fix">Apply the suggested fix</button>' : "") +
          '<button type="button" class="pm-btn" data-variant="danger" data-cmd-op="delete">Delete</button></div>' +
          '<div id="fdy-dry"></div>');
        var drawer = document.getElementById("fdy-drawer");
        drawer.querySelector('[data-cmd-op="dry"]').addEventListener("click", function () {
          document.getElementById("fdy-dry").innerHTML =
            '<div class="fdy-card" style="cursor:default"><div class="fdy-card-t">Dry run</div>' +
            '<p class="fdy-sub">Resolved command (parameters substituted, includes applied):</p>' +
            '<p class="pm-mono" style="font-size:12px">' + esc(c.shell.replace("$ENV", "staging")) + "</p>" +
            '<p class="fdy-sub">A dry run never sends work to an agent — it only resolves and displays.</p></div>';
        });
        var fix = drawer.querySelector('[data-cmd-op="fix"]');
        if (fix) fix.addEventListener("click", function () {
          var cmds = PMStore.get("customCommands", []).slice();
          cmds.forEach(function (x) {
            if (x.id === c.id) {
              x.safety = "pass";
              if (x.shell.indexOf("$ENV") !== -1) x.shell = x.shell.replace("$ENV", '"$ENV"');
              if (x.shell.indexOf("%LOG%") !== -1) x.shell = "Get-Content -Wait $env:PM_LOG";
            }
          });
          PMStore.set("customCommands", cmds);
          PMStore.receipt("Safety fix applied — validation now passes", "ok");
          closeDrawer();
        });
        drawer.querySelector('[data-cmd-op="delete"]').addEventListener("click", function () {
          PMStore.set("customCommands", PMStore.get("customCommands", []).filter(function (x) { return x.id !== c.id; }));
          PMStore.receipt("Custom command deleted (simulated)", "warn");
          closeDrawer();
        });
      });
    });
    root.querySelectorAll("[data-remap]").forEach(function (b) {
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        openRecorder(b.getAttribute("data-remap"));
      });
    });
    root.querySelectorAll("[data-sh-op]").forEach(function (b) {
      b.addEventListener("click", function () {
        var op = b.getAttribute("data-sh-op");
        if (op === "reset") {
          var ss = PMStore.get("shortcuts", []).slice();
          ss.forEach(function (s) { if (s.id === "goal-check") { s.shortcut = "Ctrl+Shift+G"; s.conflict = false; } if (s.id === "open-goals") { s.shortcut = "Ctrl+Alt+G"; } });
          PMStore.set("shortcuts", ss);
          PMStore.receipt("Shortcuts reset — the Ctrl+Shift+P conflict resolves to the default palette", "ok");
          return;
        }
        var msgs = { import: "Import simulated — bindings would validate before applying", export: "Export simulated — the keymap would download as JSON", cheatsheet: "Cheat sheet simulated — a printable reference would open" };
        PMStore.receipt(msgs[op], "info");
      });
    });
  }

  function openRecorder(shortcutId) {
    var s = null;
    PMStore.get("shortcuts", []).forEach(function (x) { if (x.id === shortcutId) s = x; });
    if (!s) return;
    openDrawer("Remap: " + s.name, '<p class="fdy-sub">Press the new chord. Captured from real keydown events; Escape cancels.</p>' +
      '<div class="fdy-card" style="cursor:default"><div class="fdy-card-t" id="fdy-chord" style="font-family:var(--pm-font-mono)">Waiting for keys…</div></div>' +
      '<div style="display:flex;gap:8px"><button type="button" class="pm-btn" data-variant="primary" data-chord-confirm disabled>Confirm</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-chord-cancel>Cancel</button></div>');
    var chord = null;
    function fmt(ev) {
      var parts = [];
      if (ev.ctrlKey) parts.push("Ctrl");
      if (ev.altKey) parts.push("Alt");
      if (ev.shiftKey) parts.push("Shift");
      if (ev.metaKey) parts.push("Meta");
      var key = ev.key.length === 1 ? ev.key.toUpperCase() : ev.key;
      if (["Control", "Alt", "Shift", "Meta"].indexOf(key) === -1) parts.push(key);
      return parts.join("+");
    }
    function onKey(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.key === "Escape") { cleanup(); closeDrawer(); return; }
      var c = fmt(ev);
      if (["Ctrl", "Alt", "Shift", "Meta", "Ctrl+Shift", "Ctrl+Alt", "Alt+Shift", "Ctrl+Alt+Shift"].indexOf(c) !== -1) return;
      chord = c;
      var label = document.getElementById("fdy-chord");
      if (label) label.textContent = c;
      var confirm = document.querySelector("[data-chord-confirm]");
      if (confirm) confirm.disabled = false;
    }
    function cleanup() { document.removeEventListener("keydown", onKey, true); }
    document.addEventListener("keydown", onKey, true);
    document.querySelector("[data-chord-confirm]").addEventListener("click", function () {
      if (!chord) return;
      var ss = PMStore.get("shortcuts", []).slice();
      var conflict = false;
      ss.forEach(function (x) { if (x.id !== shortcutId && x.shortcut === chord) conflict = true; });
      ss.forEach(function (x) { if (x.id === shortcutId) { x.shortcut = chord; x.conflict = conflict; } });
      PMStore.set("shortcuts", ss);
      PMStore.receipt(conflict ? "Binding saved — it conflicts with an existing command" : "Binding saved", conflict ? "warn" : "ok");
      cleanup();
      closeDrawer();
    });
    document.querySelector("[data-chord-cancel]").addEventListener("click", function () { cleanup(); closeDrawer(); });
  }

  /* ---------- CATALOG (MCP / Skills / Plugins / Tools) ---------- */
  function renderCatalog(route) {
    var tab = route.tab || "mcp";
    var domains = {
      mcp: { title: "MCP servers", items: PMStore.get("mcp", []) },
      skills: { title: "Skills", items: PMStore.get("skills", []) },
      plugins: { title: "Plugins", items: PMStore.get("plugins", []) },
      tools: { title: "Tools", items: PMStore.get("tools", []) }
    };
    var d = domains[tab] || domains.mcp;
    var rows = d.items.map(function (it) {
      var stateBits = [];
      if (it.installed) stateBits.push("installed");
      if (it.enabled || it.projectEnabled) stateBits.push("enabled");
      if (it.available || it.availableThisTurn) stateBits.push("available");
      if (it.selected) stateBits.push("selected");
      if (it.invoked) stateBits.push("invoked");
      var h = V.HEALTH[it.health] || (it.available === false && it.availableThisTurn === undefined ? { label: "Unavailable", dot: "unknown" } : { label: "Ready", dot: "ok" });
      var stateLabel = it.available === false && tab === "mcp" ? "Unavailable" : (stateBits.join(" · ") || "Not installed");
      return '<tr data-name="' + esc(it.name) + '" data-item="' + esc(it.id) + '">' +
        "<td>" + esc(it.name) + "</td>" +
        "<td>" + esc(it.trust || it.owner || "") + "</td>" +
        "<td>" + esc(it.risk || it.compatibility || "") + "</td>" +
        '<td class="pm-mono">' + esc(stateLabel) + "</td></tr>";
    }).join("");
    var body = '<div class="fdy-table-wrap"><table class="fdy-table"><thead><tr><th>Name</th><th>Trust / owner</th><th>Risk / compatibility</th><th>States</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<p class="fdy-sub">One catalog, four distinct domains — the tabs are headers, not filters. Click a row for domain detail.</p>';
    mgrShell({
      id: "catalog", title: "MCP, Skills, Plugins, and Tools",
      lede: "Catalog, provenance, trust, enablement, effective availability, and policy per domain.",
      addLabel: "Add server or package…", health: "4 MCP · 4 skills · 2 plugins · 8 tools — 1 MCP disabled by project",
      tabs: [["mcp", "MCP"], ["skills", "Skills"], ["plugins", "Plugins"], ["tools", "Tools"]],
      tab: tab, body: body,
      onAdd: function () { PMStore.receipt("Add simulated — catalog entry with provenance and trust review", "info"); }
    });
    root.querySelectorAll("[data-item]").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var item = null;
        d.items.forEach(function (x) { if (x.id === tr.getAttribute("data-item")) item = x; });
        if (!item) return;
        var detail = "<dt>Trust</dt><dd>" + esc(item.trust || item.owner || "") + "</dd>";
        if (tab === "mcp") {
          detail = "<dt>Transport</dt><dd>" + esc(item.transport) + " · protocol requested " + esc(item.protocol.requested) + ", negotiated " + esc(item.protocol.negotiated) + "</dd>" +
            "<dt>Auth</dt><dd>" + esc(item.auth) + "</dd>" +
            "<dt>Catalog</dt><dd>" + esc(item.catalog) + "</dd>" +
            "<dt>Resources</dt><dd>" + esc(item.resources) + "</dd>" +
            "<dt>Logs</dt><dd>" + esc(item.logs) + "</dd>" +
            (item.unavailableReason ? "<dt>Unavailable</dt><dd>" + esc(item.unavailableReason) + "</dd>" : "") + detail;
        } else if (tab === "skills") {
          detail = "<dt>Source</dt><dd>" + esc(item.source) + " · v" + esc(item.version) + "</dd>" +
            "<dt>Update</dt><dd>" + esc(item.update) + "</dd>" + detail;
        } else if (tab === "plugins") {
          detail = "<dt>Channel</dt><dd>" + esc(item.channel) + " · v" + esc(item.version) + "</dd>" +
            "<dt>Compatibility</dt><dd>" + esc(item.compatibility) + "</dd>" +
            (item.note ? "<dt>Note</dt><dd>" + esc(item.note) + "</dd>" : "") + detail;
        } else {
          detail = "<dt>Owner</dt><dd>" + esc(item.owner) + "</dd>" +
            "<dt>Approval policy</dt><dd>" + esc(item.approvalPolicy) + "</dd>" + detail;
        }
        openDrawer(item.name, '<dl class="pm-kv">' + detail + "</dl>" +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          (tab === "mcp" ? '<button type="button" class="pm-btn" data-variant="quiet" data-cat-op="restart">Restart server</button>' : "") +
          '<button type="button" class="pm-btn" data-variant="quiet" data-cat-op="toggle">Toggle project enablement</button>' +
          (item.update && item.update.indexOf("available") !== -1 ? '<button type="button" class="pm-btn" data-variant="quiet" data-cat-op="update">Update</button>' : "") +
          "</div>");
        var drawer = document.getElementById("fdy-drawer");
        var rst = drawer.querySelector('[data-cat-op="restart"]');
        if (rst) rst.addEventListener("click", function () { PMStore.receipt("Restart simulated — the server would re-handshake and re-list its tools", "info"); });
        var upd = drawer.querySelector('[data-cat-op="update"]');
        if (upd) upd.addEventListener("click", function () { PMStore.receipt("Update simulated — trusted updates follow the skills auto-update row", "info"); });
        drawer.querySelector('[data-cat-op="toggle"]').addEventListener("click", function () {
          PMStore.receipt("Project enablement toggled (simulated) — effective availability updates next turn", "ok");
          closeDrawer();
        });
      });
    });
  }

  /* ---------- TESTING & DEBUG ---------- */
  function renderTesting(route) {
    var matrix = PMStore.get("testingMatrix", {});
    function cell(cap, scope) {
      var key = cap + "|" + scope;
      var managed = cap === "DAP debugger" && scope === "Project";
      var v = matrix[key] || (managed ? "On" : "Auto");
      if (managed) {
        return '<span class="pm-badge" data-kind="state" data-icon data-state="managed">Managed — On by policy</span>';
      }
      return '<span class="pm-seg" role="radiogroup" aria-label="' + esc(cap) + " " + scope + '">' +
        ["Auto", "On", "Off"].map(function (o) {
          return '<button type="button" role="radio" aria-checked="' + (v === o) + '" data-tcell="' + esc(key) + '" data-value="' + o + '">' + o + "</button>";
        }).join("") + "</span>";
    }
    var rows = FD.testingCapabilities.map(function (cap) {
      return "<tr data-name=\"" + esc(cap) + "\"><td>" + esc(cap) + "</td><td>" + cell(cap, "Global") + "</td><td>" + cell(cap, "Project") + "</td></tr>";
    }).join("");
    var body = '<div class="fdy-table-wrap"><table class="fdy-table"><thead><tr><th>Capability</th><th>Global</th><th>Project</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<p class="fdy-sub">' + esc(FD.testingMatrixNote) + "</p>";
    mgrShell({
      id: "testing", title: "Testing and Debug",
      lede: "Global and Project capability policy. Auto follows detection; managed cells show the managing policy.",
      toolbar: false,
      tabs: [["matrix", "Capability matrix"]], tab: "matrix", body: body
    });
    root.querySelectorAll("[data-tcell]").forEach(function (b) {
      b.addEventListener("click", function () {
        var m = PMStore.get("testingMatrix", {});
        m[b.getAttribute("data-tcell")] = b.getAttribute("data-value");
        PMStore.set("testingMatrix", m);
      });
    });
  }

  /* ---------- router ---------- */
  function render(route, fromNav) {
    if (spy) { spy.detach(); spy = null; }
    closeDrawer();
    currentRoute = route;
    if (route.view === "manager") {
      if (route.manager === "providers") return renderProviders(route);
      if (route.manager === "files") return renderFiles(route);
      if (route.manager === "terminal") return renderTerminal(route);
      if (route.manager === "lsp") return renderLsp(route);
      if (route.manager === "formatters") return renderFormatters(route);
      if (route.manager === "commands") return renderCommands(route);
      if (route.manager === "catalog") return renderCatalog(route);
      if (route.manager === "testing") return renderTesting(route);
      root.innerHTML = '<div class="fdy-home"><div class="fdy-home-inner"><div class="pm-empty" style="margin-block-start:60px"><div class="pm-empty-title">This manager belongs to another concept</div><div class="pm-empty-guidance">Foundry demonstrates Files, Terminal, LSP, Formatters, Commands, the MCP/Skills/Plugins/Tools catalog, Testing, and Providers. The coverage matrix records the rest as shared grammar.</div></div></div></div>';
      return;
    }
    if (route.view === "category") return renderWorkspace(route, fromNav);
    renderHome();
  }

  /* ---------- demo drawer ---------- */
  function buildDemoDrawer() {
    var list = document.getElementById("fdy-demo-list");
    var concept = FD.demoScenarios.map(function (s) {
      return '<button type="button" class="pm-btn" data-demo="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
    var prov = V.PROVIDER_SCENARIOS.map(function (s) {
      return '<button type="button" class="pm-btn" data-prov-scenario="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
    list.innerHTML = '<div class="fdy-demo-group">Foundry states</div>' + concept +
      '<div class="fdy-demo-group">Provider scenarios</div>' + prov;
    list.addEventListener("click", function (ev) {
      var ps = ev.target.closest && ev.target.closest("[data-prov-scenario]");
      if (ps) { V.applyProviderScenario(ps.getAttribute("data-prov-scenario"), function () { render(PMRouter.current(), false); }); return; }
      var b = ev.target.closest && ev.target.closest("[data-demo]");
      if (b) runScenario(b.getAttribute("data-demo"));
    });
  }

  function runScenario(id) {
    if (id === "calm") { PMStore.set("calmDemo", true); PMStore.receipt("Calm state — every notice dismissed; reset to bring them back", "ok"); return; }
    if (id === "reset") { PMStore.resetDemo(); PMStore.receipt("Demo data reset to its seeded state", "ok"); return; }
    if (id === "formatter-not-found") { navigate({ manager: "formatters", tab: "registry" }); PMStore.receipt("Black shows Not found with the install guidance", "info"); return; }
    if (id === "lsp-degraded") {
      navigate({ manager: "lsp", tab: "registry" });
      window.setTimeout(function () {
        var tr = document.querySelector('[data-lsp="python"]');
        if (tr) tr.click();
      }, 350);
      return;
    }
    if (id === "shortcut-conflict") { navigate({ manager: "commands", tab: "shortcuts" }); return; }
    if (id === "dry-run") {
      navigate({ manager: "commands", tab: "custom" });
      window.setTimeout(function () {
        var tr = document.querySelector('[data-cmd="cc-build"]');
        if (tr) tr.click();
        window.setTimeout(function () {
          var dry = document.querySelector('[data-cmd-op="dry"]');
          if (dry) dry.click();
        }, 300);
      }, 350);
      return;
    }
    if (id === "mcp-restart") {
      navigate({ manager: "catalog", tab: "mcp" });
      window.setTimeout(function () {
        var tr = document.querySelector('[data-item="github"]');
        if (tr) tr.click();
      }, 350);
      return;
    }
    if (id === "testing-managed") { navigate({ manager: "testing", tab: "matrix" }); PMStore.receipt("The DAP debugger Project cell is managed — On by policy", "info"); return; }
    if (id === "palette-edit") { navigate({ manager: "terminal", tab: "palette" }); PMStore.receipt("Click any well to retune; the preview updates live", "info"); return; }
    if (id === "recorder") {
      navigate({ manager: "commands", tab: "shortcuts" });
      window.setTimeout(function () {
        var b = document.querySelector('[data-remap="toggle-terminal"]');
        if (b) b.click();
      }, 350);
      return;
    }
    if (id === "changed-elsewhere") {
      V.setChanged("terminal.scrollback", "set to 20,000 in another window at 09:47");
      navigate({ category: "terminal", sub: "term", setting: "terminal.scrollback" });
      PMStore.receipt("Scenario applied — Terminal scrollback shows the changed-elsewhere bar", "info");
      return;
    }
    if (id === "validation-error") {
      V.setError("terminal.shell-path", "Not a valid shell path — enter an absolute path ending in .exe, or clear the field for Auto.");
      navigate({ category: "terminal", sub: "shell", setting: "terminal.shell-path" });
      PMStore.receipt("Scenario applied — a validation error is pinned on Default shell", "warn");
      return;
    }
  }

  /* ---------- squeezed fallback + boot ---------- */
  function wireSqueezeFallback() {
    if (!("ResizeObserver" in window)) return;
    new ResizeObserver(function (entries) {
      root.classList.toggle("fdy-squeezed", entries[0].contentRect.width <= 900);
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
      drawer: document.getElementById("fdy-demo"),
      scrim: document.getElementById("fdy-scrim")
    });
    wireSqueezeFallback();
    renderInbox();
    PMStore.on("change", function () { renderInbox(); render(currentRoute, false); });
    PMStore.on("reset", function () { render(PMRouter.current(), false); });
    PMRouter.init({ onRoute: function (route) { render(route, true); } });
  });
})();
