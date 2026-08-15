/* ============================================================================
   resonance.js — Concept 02 "Resonance" (studio console)
   ----------------------------------------------------------------------------
   Control-room composition over the frozen shared layer. Families:
   Notifications & Sounds, Sound Library/Uploads/Packs, Appearance,
   Spellcheck & Dictionaries, Desktop/Tray/Window, Teacher/Help.
   ========================================================================== */
(function () {
  "use strict";

  var DEMO = window.PM_CORE_DATA;
  var RD = window.RES_DATA;
  var V = window.PMViews;
  var esc = V.esc;
  var root = document.getElementById("res-root");
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
    destinations: V.clone(RD.destinations),
    events: V.clone(RD.events),
    sounds: V.clone(RD.sounds),
    lastTestSend: null,
    packResult: null,
    themePreview: null
  });
  PMStore.init("resonance");

  function buildSearchIndex() {
    var demo = Object.assign({}, DEMO, {
      managerMeta: Object.assign({}, DEMO.managerMeta, RD.managerMeta),
      actions: DEMO.actions.concat(RD.actions)
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

  /* ---------- HOME: control-room dashboard ---------- */
  function homeHtml() {
    var notices = noticeList();
    var groups = [["attention", "Needs attention"], ["setup", "Continue setup"], ["recommended", "Recommended"]];
    var noticeHtml = groups.map(function (g, gi) {
      var items = notices.filter(function (n) { return n.kind === g[0]; });
      if (!items.length) return "";
      return '<div class="res-eyebrow">' + esc(g[1]) + "</div>" +
        items.map(function (n, i) {
          return '<div class="res-rise" style="--stagger:' + (gi + i) + '">' + V.noticeHtml(n) + "</div>";
        }).join("");
    }).join("");
    if (!notices.length) {
      noticeHtml = '<div class="res-panel"><p class="res-sub">All clear. Nothing needs attention, no setup is waiting, and there are no recommendations right now.</p></div>';
    }

    var provs = V.providers();
    var ready = provs.filter(function (p) { return V.providerStatus(p).dot === "ok"; }).length;
    var tiles = [
      { icon: "layers", big: ready + " / " + provs.length, title: "Provider families ready", sub: "Anthropic carries an update — Ask first", go: { manager: "providers" } },
      { icon: "bell", big: String(notices.length), title: "Open notices", sub: "Across attention, setup, and recommended", go: { manager: "notifications" } },
      { icon: "palette", big: "Glass Dark", title: "Active theme", sub: "8 themes in the studio", go: { manager: "appearance" } },
      { icon: "terminal", big: "1", title: "Setup in progress", sub: "Work terminal profile", go: { category: "terminal", sub: "term", setting: "terminal.default-profile" } }
    ].map(function (t, i) {
      return '<button type="button" class="res-tile res-rise" style="--stagger:' + i + '" data-tile="' + i + '">' +
        '<span class="res-tile-title">' + V.icon(t.icon) + esc(t.title) + "</span>" +
        '<span class="res-tile-big">' + esc(t.big) + "</span>" +
        '<span class="res-tile-sub">' + esc(t.sub) + "</span></button>";
    }).join("");

    var dests = DEMO.categories.map(function (c, i) {
      return '<button type="button" class="res-tile res-rise" style="--stagger:' + (i % 6) + '" data-cat="' + esc(c.id) + '">' +
        '<span class="res-tile-title">' + V.icon(c.icon) + esc(c.title) + "</span>" +
        '<span class="res-tile-sub">' + esc(c.purpose) + "</span></button>";
    }).join("");

    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" class="res-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";
    }).join("");

    return '<div class="res-home"><div class="res-home-inner">' +
      '<div class="res-bus res-rise"><span class="res-eyebrow">Resonance · Master bus</span>' +
        '<div class="res-bus-row"><span class="res-search"><input type="search" id="res-search" placeholder="Search settings, managers, and actions — try “notifcation”" aria-label="Search settings" autocomplete="off" spellcheck="false">' +
        '<span class="res-hits" id="res-hits" role="listbox" aria-label="Search results" hidden></span></span></div>' +
        '<p class="res-sub">The console reads left to right: status tiles, notices, destinations. Everything routes through the same frozen spine as every kimi-k3 concept.</p></div>' +
      '<div class="res-dash">' + tiles + "</div>" +
      '<section aria-label="Notices" class="res-notices">' + noticeHtml + "</section>" +
      '<section aria-label="Destinations"><div class="res-eyebrow" style="margin-block-end:8px">Destinations</div><div class="res-dash">' + dests + "</div></section>" +
      '<section aria-label="Recent settings work"><div class="res-eyebrow" style="margin-block-end:8px">Recent settings work</div><div class="res-recents">' + recents + "</div></section>" +
      "</div></div>";
  }

  var tileGo = [];
  function renderHome() {
    root.innerHTML = homeHtml();
    tileGo = [
      { manager: "providers" }, { manager: "notifications" }, { manager: "appearance" },
      { category: "terminal", sub: "term", setting: "terminal.default-profile" }
    ];
    V.wireSearch({ input: document.getElementById("res-search"), listEl: document.getElementById("res-hits"), index: searchIndex, onPick: onSearchPick });
    root.querySelectorAll("[data-tile]").forEach(function (b) {
      b.addEventListener("click", function () { navigate(tileGo[parseInt(b.getAttribute("data-tile"), 10)]); });
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

  /* ---------- WORKSPACE: console panels ---------- */
  function navHtml(cat) {
    return DEMO.categories.map(function (c) {
      var current = c.id === cat.id;
      var subs = "";
      if (current) {
        subs = '<span class="res-nav-subs">' + c.subcategories.map(function (s) {
          return '<button type="button" class="res-nav-sub" data-subjump="' + esc(s.id) + '">' + esc(s.title) + "</button>";
        }).join("") + "</span>";
      }
      return '<button type="button" class="res-nav-cat" data-catnav="' + esc(c.id) + '" aria-current="' + current + '">' + V.icon(c.icon) + esc(c.title) + "</button>" + subs;
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
    var squeezeSelect = '<span class="pm-select res-outline-select"><select id="res-cat-select" aria-label="Category">' +
      DEMO.categories.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === cat.id ? " selected" : "") + ">" + esc(c.title) + "</option>"; }).join("") + "</select></span>";
    var sections = cat.subcategories.map(function (sub, i) {
      return '<section class="res-sec res-panel res-rise" style="--stagger:' + i + '" id="sec-' + esc(sub.id) + '" aria-label="' + esc(sub.title) + '">' +
        '<div class="res-panel-h"><h3>' + esc(sub.title) + '</h3><span class="pm-badge" data-kind="scope">' + sub.settings.length + " settings</span></div>" +
        '<p class="res-sub">' + esc(sub.summary) + "</p>" + sectionRows(sub) + "</section>";
    }).join("");

    root.innerHTML = '<div class="res-ws">' +
      '<nav class="res-nav" aria-label="Categories">' + navHtml(cat) + "</nav>" +
      '<div class="res-doc" id="res-doc"><div class="res-doc-inner">' +
        '<header class="res-doc-head">' + squeezeSelect +
          '<span class="res-eyebrow">' + esc(cat.title) + "</span><h1>" + esc(cat.purpose) + "</h1></header>" +
        sections + "</div></div></div>";

    var doc = document.getElementById("res-doc");
    root.querySelectorAll("[data-catnav]").forEach(function (b) {
      b.addEventListener("click", function () { navigate({ category: b.getAttribute("data-catnav") }); });
    });
    var sel = document.getElementById("res-cat-select");
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

  /* ---------- PROVIDERS (console language) ---------- */
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
    var listHtml = groups.filter(function (g) { return byGroup[g] && byGroup[g].length; }).map(function (g) {
      return '<div class="res-eyebrow">' + esc(V.GROUP_LABEL[g]) + "</div>" +
        byGroup[g].map(function (x) {
          var st = V.providerStatus(x);
          return '<button type="button" class="res-tile" data-pid="' + esc(x.id) + '" aria-current="' + (x.id === pid) + '" style="text-align:start">' +
            '<span class="res-tile-title">' + esc(x.name) + "</span>" +
            '<span class="res-tile-sub">' + esc(x.tagline) + "</span>" + V.healthDot(st.dot, st.label) + "</button>";
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
      body = '<div class="res-panel"><div class="res-panel-h"><h3>' + esc(p.name) + "</h3>" + V.healthDot(st.dot, st.label) + "</div>" +
        '<p class="res-sub">' + esc(p.tagline) + "</p>" +
        '<dl class="pm-kv">' +
        "<dt>Connection</dt><dd>" + esc(V.GROUP_LABEL[p.connectionGroup] || p.connectionGroup) + "</dd>" +
        (install ? "<dt>Installation</dt><dd>" + esc(install) + "</dd>" : "") +
        "<dt>Sign-in</dt><dd>" + esc(p.authNote || V.AUTH_MODEL[p.authModel] || "") + "</dd>" +
        (act ? "<dt>Active account</dt><dd>" + esc(act.label) + " · " + esc(act.identity) + "</dd>" : "") +
        "<dt>Plan</dt><dd>" + esc(p.product.plan) + " — " + esc(p.product.billingRoute) + "</dd>" +
        (p.groupingNote ? "<dt>Grouping</dt><dd>" + esc(p.groupingNote) + "</dd>" : "") + "</dl>" +
        (p.lastError ? '<div class="pm-row-reason">' + esc(p.lastError) + "</div>" : "") + "</div>";
      if (p.installState === "installed-signed-out") {
        body += '<div class="res-panel"><div class="res-panel-h"><h4>Sign in required</h4></div>' +
          '<p class="res-sub">This tool owns its own sign-in. Puppet Master launches the native flow and never sees credentials.</p>' +
          '<div><button type="button" class="pm-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in via ' + esc(p.name) + " CLI</button></div></div>";
      }
      if (p.installState === "not-installed" && p.installAction) body += V.installationHtml(p);
    } else if (tab === "accounts") {
      body = (p.accounts || []).map(function (a) { return V.accountRowHtml(p, a); }).join("") ||
        '<div class="pm-empty"><div class="pm-empty-title">No accounts yet</div><div class="pm-empty-guidance">Sign in or connect a credential to add an account.</div></div>';
      body += '<div><button type="button" class="pm-btn" data-variant="quiet" data-pv="reconnect" data-pid="' + esc(p.id) + '">Add another connection…</button></div>';
    } else if (tab === "models") {
      body = (p.models || []).map(function (m) { return V.modelRowHtml(p, m); }).join("") ||
        '<div class="pm-empty"><div class="pm-empty-title">No models listed yet</div><div class="pm-empty-guidance">Install and connect this provider to list its models.</div></div>';
    } else if (tab === "plans") {
      body = V.usageHtml(p) + (p.usageNote ? '<p class="res-sub">' + esc(p.usageNote) + "</p>" : "");
    } else if (tab === "routing") {
      body = V.routingHtml(p) + '<div class="res-panel"><div class="res-panel-h"><h4>Agent roles</h4></div>' + V.rolesHtml(PMStore.get("roles", [])) + "</div>";
    } else if (tab === "install") {
      body = V.installationHtml(p) + V.updatesHtml(p);
    } else if (tab === "advanced") {
      body = V.catalogHtml(p) + V.diagnosticsHtml(p) +
        '<div><button type="button" class="pm-btn" data-variant="quiet" data-pv="refresh" data-pid="' + esc(p.id) + '">Refresh catalog</button></div>';
    }

    root.innerHTML = '<div class="res-mgr"><div class="res-mgr-inner">' +
      '<header class="res-mgr-head"><span class="res-eyebrow">Providers</span><h1>Accounts, connections, models, and installations</h1>' +
      '<p class="res-sub">A provider supplies models, authentication, limits, and capabilities. An installation is a host resource.</p></header>' +
      V.providerEnvBannerHtml() +
      '<div class="res-prov"><div style="display:grid;gap:8px">' + listHtml + "</div>" +
      '<div style="display:grid;gap:12px;align-content:start"><nav class="res-mgr-nav" role="tablist">' + tabs + "</nav>" + body + "</div></div>" +
      "</div></div>";

    root.querySelectorAll("[data-pid].res-tile").forEach(function (b) {
      b.addEventListener("click", function () { PMRouter.go({ manager: "providers", sub: b.getAttribute("data-pid"), tab: "overview" }); });
    });
    root.querySelectorAll("[data-ptab]").forEach(function (b) {
      b.addEventListener("click", function () { PMRouter.go({ manager: "providers", sub: pid, tab: b.getAttribute("data-ptab") }); });
    });
  }

  /* ---------- NOTIFICATIONS & SOUNDS ---------- */
  function destName(id) {
    var d = null;
    PMStore.get("destinations", []).forEach(function (x) { if (x.id === id) d = x; });
    return d ? d.name : id;
  }

  function renderNotifications(route) {
    var tab = route.tab || "destinations";
    var body = "";
    if (tab === "destinations") {
      var last = PMStore.get("lastTestSend", null);
      body = '<div class="res-dest-grid">' + PMStore.get("destinations", []).map(function (d, i) {
        var fields = d.fields.map(function (f) { return "<dt>" + esc(f.k) + "</dt><dd>" + esc(f.v) + "</dd>"; }).join("");
        return '<div class="res-panel res-rise" style="--stagger:' + i + '"><div class="res-panel-h"><h4>' + esc(d.name) + "</h4>" +
          '<span class="pm-badge" data-kind="scope">' + esc(d.kind) + "</span>" +
          '<button type="button" class="pm-switch" role="switch" aria-checked="' + d.enabled + '" data-dest-toggle="' + esc(d.id) + '" aria-label="Enable ' + esc(d.name) + '"></button></div>' +
          '<p class="res-sub">' + esc(d.note) + "</p>" +
          '<dl class="pm-kv" style="font-size:11.5px">' + fields + "</dl>" +
          '<div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="pm-btn" data-variant="quiet" data-test-send="' + esc(d.id) + '">Send test</button></div></div>';
      }).join("") + "</div>" +
      (last ? '<div class="res-panel"><div class="res-panel-h"><h4>Last test send</h4><span class="pm-badge" data-kind="state" data-icon data-state="auto">Receipted</span></div>' +
        '<p class="res-sub">' + esc(last) + "</p></div>" : "");
    } else if (tab === "routing") {
      body = '<div class="res-matrix">' + PMStore.get("events", []).map(function (e) {
        var dests = e.destinations.map(function (d) { return '<span class="pm-badge" data-kind="scope">' + esc(destName(d)) + "</span>"; }).join("");
        return '<div class="res-matrix-row"><div><div class="res-matrix-event">' + esc(e.label) + '</div><div class="res-matrix-meta">' + esc(e.note) + "</div></div>" +
          "<div>" + dests + "</div>" +
          '<span class="pm-badge" data-kind="state" data-icon data-state="' + (e.sound === "none" ? "default" : "auto") + '">' + (e.sound === "none" ? "No sound" : esc(e.sound)) + "</span></div>";
      }).join("") + "</div>" +
      '<div class="res-panel"><p class="res-sub">Sound is never the only indication of failure, blocked work, approval, or completion — every audible event also carries a visual state and an inbox entry.</p></div>';
    } else if (tab === "quiet") {
      body = ["notifications.quiet-hours", "notifications.tray-automation", "notifications.grouping", "notifications.system-tray", "notifications.inapp-inbox"]
        .map(function (sid) { return V.rowHtml(DEMO.settings[sid]); }).join("");
    }
    renderManager({
      id: "notifications", title: "Notifications",
      lede: "Where events go, and when they stay quiet. The title-bar inbox is the only in-app notification surface.",
      tabs: [["destinations", "Destinations"], ["routing", "Event routing"], ["quiet", "Quiet and focus"]],
      tab: tab, body: body
    });
    root.querySelectorAll("[data-dest-toggle]").forEach(function (sw) {
      sw.addEventListener("click", function () {
        var list = PMStore.get("destinations", []).slice();
        list.forEach(function (d) { if (d.id === sw.getAttribute("data-dest-toggle")) d.enabled = sw.getAttribute("aria-checked") !== "true"; });
        PMStore.set("destinations", list);
      });
    });
    root.querySelectorAll("[data-test-send]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-test-send");
        var d = null;
        PMStore.get("destinations", []).forEach(function (x) { if (x.id === id) d = x; });
        if (!d.enabled) { PMStore.receipt(d.name + " is disabled — enable it before test-sending", "warn"); return; }
        b.disabled = true;
        b.textContent = "Sending…";
        window.setTimeout(function () {
          PMStore.set("lastTestSend", d.name + " · masked payload · rate-limited to 1 per 10 s · delivered (simulated) at " + new Date().toLocaleTimeString());
          PMStore.receipt("Test send simulated to " + d.name + " — credentials masked, nothing left this machine", "ok");
        }, 900);
      });
    });
  }

  /* ---------- SOUND LIBRARY ---------- */
  function waveSvg(sound) {
    var bars = sound.bars.map(function (b, i) {
      var h = b * 2;
      return '<rect x="' + (i * 12) + '" y="' + (17 - h / 2) + '" width="7" height="' + h + '" rx="2" fill="currentColor"/>';
    }).join("");
    return '<svg viewBox="0 0 144 34" aria-hidden="true" style="color:var(--pm-info)">' + bars + "</svg>";
  }

  function renderSounds(route) {
    var tab = route.tab || "library";
    var body = "";
    if (tab === "library") {
      body = '<div class="res-panel"><div class="res-panel-h"><h4>Master sound</h4></div>' +
        V.rowHtml(DEMO.settings["notifications.master-sound"]) + V.rowHtml(DEMO.settings["notifications.volume"]) + V.rowHtml(DEMO.settings["notifications.completion-sound"]) + "</div>" +
        '<div class="res-wave-grid">' + PMStore.get("sounds", []).map(function (s, i) {
          return '<div class="res-wave res-rise" style="--stagger:' + i + '" data-sound="' + esc(s.id) + '">' + waveSvg(s) +
            '<div class="res-wave-name">' + esc(s.name) + '<span class="pm-badge" data-kind="scope">' + esc(s.origin) + "</span></div>" +
            '<div class="res-wave-meta">' + esc(s.source) + " · " + esc(s.license) + " · " + esc(s.duration) + " · " + esc(s.hash) + "</div>" +
            '<div class="res-wave-meta">Default mapping: ' + esc(s.defaultMapping) + "</div>" +
            '<div class="res-wave-acts">' +
            '<button type="button" class="pm-btn" data-variant="quiet" data-preview="' + esc(s.id) + '">Preview</button>' +
            (s.origin === "custom"
              ? '<button type="button" class="pm-btn" data-variant="quiet" data-replace="' + esc(s.id) + '">Replace</button><button type="button" class="pm-btn" data-variant="danger" data-delete="' + esc(s.id) + '">Delete</button>'
              : "") +
            "</div></div>";
        }).join("") + "</div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="pm-btn" data-sound-op="upload">Upload a sound…</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-sound-op="export">Export library</button></div>';
    } else if (tab === "mappings") {
      body = '<div class="res-matrix">' + PMStore.get("events", []).map(function (e) {
        var opts = PMStore.get("sounds", []).map(function (s) {
          return '<option value="' + esc(s.id) + '"' + (s.id === e.sound ? " selected" : "") + ">" + esc(s.name) + "</option>";
        }).join("");
        return '<div class="res-matrix-row"><div><div class="res-matrix-event">' + esc(e.label) + '</div><div class="res-matrix-meta">' + esc(e.note) + "</div></div>" +
          '<span class="pm-select"><select data-map="' + esc(e.id) + '" aria-label="Sound for ' + esc(e.label) + '"><option value="none"' + (e.sound === "none" ? " selected" : "") + ">No sound</option>" + opts + "</select></span>" +
          '<span class="pm-badge" data-kind="scope">' + e.destinations.length + " destinations</span></div>";
      }).join("") + "</div>";
    } else if (tab === "packs") {
      var pr = PMStore.get("packResult", null);
      body = '<div class="res-panel"><div class="res-panel-h"><h4>PeonPing / OpenPeon pack import</h4></div>' +
        '<p class="res-sub">Packs pass a format check and a license check. Unverified packs are never bundled — preview only, then discarded.</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="pm-btn" data-pack="valid">Import focus-pack.peonpack</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-pack="wrongFormat">Import retro-sounds.zip</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-pack="unverified">Import midnight.peonpack</button></div></div>' +
        (pr ? '<div class="res-panel"><div class="res-panel-h"><h4>' + esc(pr.file) + "</h4></div><p class=\"res-sub\">" + esc(pr.result) + "</p></div>" : "");
    }
    renderManager({
      id: "sounds", title: "Sound library",
      lede: "Built-in assets carry source, license, version, duration, and hash. Preview is a local WebAudio tone — nothing is fetched.",
      tabs: [["library", "Library"], ["mappings", "Event mappings"], ["packs", "Pack import"]],
      tab: tab, body: body
    });
    root.querySelectorAll("[data-preview]").forEach(function (b) {
      b.addEventListener("click", function () {
        var tile = root.querySelector('.res-wave[data-sound="' + b.getAttribute("data-preview") + '"]');
        if (tile) tile.setAttribute("data-playing", "true");
        try {
          var Ctx = window.AudioContext || window.webkitAudioContext;
          var ctx = new Ctx();
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.frequency.value = 660;
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) { /* audio blocked: visual pulse still shows */ }
        window.setTimeout(function () { if (tile) tile.setAttribute("data-playing", "false"); }, 900);
      });
    });
    root.querySelectorAll("[data-map]").forEach(function (s) {
      s.addEventListener("change", function () {
        var events = PMStore.get("events", []).slice();
        events.forEach(function (e) { if (e.id === s.getAttribute("data-map")) e.sound = s.value; });
        PMStore.set("events", events);
        PMStore.receipt("Mapping saved — the visual state for this event is unchanged", "ok");
      });
    });
    root.querySelectorAll("[data-pack]").forEach(function (b) {
      b.addEventListener("click", function () {
        PMStore.set("packResult", RD.packImportDemo[b.getAttribute("data-pack")]);
      });
    });
    root.querySelectorAll("[data-sound-op]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("data-sound-op") === "upload") {
          var sounds = PMStore.get("sounds", []).slice();
          sounds.push({ id: "uploaded-" + sounds.length, name: "Uploaded Tone " + (sounds.length - 2), origin: "custom", source: "Uploaded just now (simulated)", license: "User supplied", version: "—", duration: "0.9 s", hash: "sha256:demo…" + sounds.length, defaultMapping: "Not mapped", bars: [3, 6, 10, 14, 11, 7, 4, 8, 12, 15, 9, 5] });
          PMStore.set("sounds", sounds);
          PMStore.receipt("Upload simulated — the file picker would run locally; no file was read", "info");
        } else {
          PMStore.receipt("Export simulated — the library manifest would download as JSON", "info");
        }
      });
    });
    root.querySelectorAll("[data-delete]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-delete");
        PMStore.set("sounds", PMStore.get("sounds", []).filter(function (s) { return s.id !== id; }));
        PMStore.receipt("Sound deleted (simulated) — built-in assets cannot be deleted", "warn");
      });
    });
    root.querySelectorAll("[data-replace]").forEach(function (b) {
      b.addEventListener("click", function () { PMStore.receipt("Replace simulated — a new local file would take this slot", "info"); });
    });
  }

  /* ---------- APPEARANCE STUDIO ---------- */
  var THEME_SWATCHES = [
    ["friendly-dark", "#2A2733"], ["friendly-light", "#F4F1FA"],
    ["glass-dark", "#12141F"], ["glass-light", "#EDF0F8"],
    ["retro-dark", "#241C14"], ["retro-light", "#FFFBF2"],
    ["basic-dark", "#1E1E1E"], ["basic-light", "#FFFFFF"]
  ];

  function renderAppearance(route) {
    var tab = route.tab || "themes";
    var body = "";
    if (tab === "themes") {
      var cur = document.documentElement.dataset.theme || "friendly-dark";
      body = '<div class="res-panel"><div class="res-panel-h"><h4>Theme strip</h4><span class="pm-badge" data-kind="scope">Hover previews · click commits</span></div>' +
        '<div class="res-swatches">' + THEME_SWATCHES.map(function (t) {
          return '<button type="button" class="res-swatch" style="background:' + t[1] + '" data-theme-swatch="' + t[0] + '" aria-pressed="' + (t[0] === cur) + '" aria-label="' + esc(t[0]) + '"><span>' + esc(t[0].replace("-", " ")) + "</span></button>";
        }).join("") + "</div>" +
        '<p class="res-sub">Hovering a swatch previews the theme live; it commits only when you click. Escape or moving off restores the committed theme.</p></div>' +
        ["appearance.theme", "appearance.follow-system", "appearance.contrast", "appearance.density", "appearance.text-size", "appearance.ui-scale", "appearance.reduce-motion"]
          .map(function (sid) { return V.rowHtml(DEMO.settings[sid]); }).join("") +
        '<div class="res-panel"><div class="res-panel-h"><h4>' + esc(RD.glassOnlyRow.label) + '</h4><span class="pm-badge" data-kind="state" data-icon data-state="unavailable">Unavailable in this theme</span></div>' +
        '<p class="res-sub">' + esc(RD.glassOnlyRow.reason) + "</p></div>";
    } else if (tab === "custom") {
      body = '<div class="res-panel"><div class="res-panel-h"><h4>Custom TOML theme</h4><span class="pm-badge" data-kind="scope">Base-theme inheritance</span></div>' +
        '<p class="res-sub">A custom theme inherits a base and overrides tables. Schema validation runs before apply; an invalid theme falls back to the base.</p>' +
        '<textarea class="res-toml" id="res-toml" aria-label="Custom theme TOML" spellcheck="false">' + esc(RD.customTheme.validToml) + "</textarea>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="pm-btn" data-variant="primary" data-toml="apply">Validate and apply</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-toml="invalid">Load the invalid demo</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-toml="valid">Load the valid demo</button></div>' +
        '<div class="res-diag" id="res-toml-diag"></div></div>' +
        '<div class="res-panel"><div class="res-panel-h"><h4>Lifecycle</h4></div><dl class="pm-kv">' +
        "<dt>Startup load</dt><dd>Custom themes load after base themes; a broken file never blocks startup</dd>" +
        "<dt>Live reload</dt><dd>Editing the file re-validates and re-applies on save</dd>" +
        "<dt>Create / import / export / open folder</dt><dd>Available from the theme strip menu (simulated receipts)</dd>" +
        "<dt>Restart markers</dt><dd>Font metric changes show a Needs restart badge</dd></dl>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-theme-op="create">Create theme</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-theme-op="import">Import theme…</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-theme-op="export">Export current</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-theme-op="folder">Open themes folder</button></div></div>';
    }
    renderManager({
      id: "appearance", title: "Appearance studio",
      lede: "Beyond the eight shipped themes: live preview, custom TOML with validation and honest fallback, fonts, and scale.",
      tabs: [["themes", "Themes"], ["custom", "Custom TOML"]],
      tab: tab, body: body
    });
    bindAppearance();
  }

  function bindAppearance() {
    var committed = document.documentElement.dataset.theme || "friendly-dark";
    root.querySelectorAll("[data-theme-swatch]").forEach(function (sw) {
      var theme = sw.getAttribute("data-theme-swatch");
      sw.addEventListener("mouseenter", function () { window.PMBridge.applyLocal({ theme: theme }); });
      sw.addEventListener("focus", function () { window.PMBridge.applyLocal({ theme: theme }); });
      sw.addEventListener("mouseleave", function () { window.PMBridge.applyLocal({ theme: committed }); });
      sw.addEventListener("blur", function () { window.PMBridge.applyLocal({ theme: committed }); });
      sw.addEventListener("keydown", function (ev) { if (ev.key === "Escape") window.PMBridge.applyLocal({ theme: committed }); });
      sw.addEventListener("click", function () {
        committed = theme;
        window.PMBridge.applyLocal({ theme: theme });
        root.querySelectorAll("[data-theme-swatch]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === sw)); });
        PMStore.receipt("Theme applied — " + theme + " is now committed", "ok");
      });
    });
    root.querySelectorAll("[data-toml]").forEach(function (b) {
      b.addEventListener("click", function () {
        var op = b.getAttribute("data-toml");
        var area = document.getElementById("res-toml");
        var diag = document.getElementById("res-toml-diag");
        if (op === "invalid") { area.value = RD.customTheme.invalidToml; diag.innerHTML = ""; return; }
        if (op === "valid") { area.value = RD.customTheme.validToml; diag.innerHTML = ""; return; }
        var text = area.value;
        var problems = [];
        if (text.indexOf("[colors]") === -1) problems.push({ line: 1, message: "Missing required [colors] table", severity: "error" });
        var m = /accent\s*=\s*([^"\s][^\n]*)/.exec(text);
        if (m) problems.push({ line: text.slice(0, m.index).split("\n").length, message: "accent must be a quoted string", severity: "error" });
        if (/\[typo\]/.test(text)) problems.push({ line: text.slice(0, text.indexOf("[typo]")).split("\n").length, message: "Unknown table [typo] — did you mean [fonts]?", severity: "error" });
        if (problems.length) {
          diag.innerHTML = problems.map(function (p) {
            return '<div class="res-diag-line" data-sev="error"><span class="pm-mono">line ' + p.line + "</span><span>" + esc(p.message) + "</span></div>";
          }).join("") + '<p class="res-sub">' + esc(RD.customTheme.fallbackNote) + "</p>";
          PMStore.receipt("Validation failed — the base theme stays active; nothing was applied", "danger");
        } else {
          diag.innerHTML = '<div class="res-diag-line"><span>Schema valid — inherits friendly-dark, overrides accent and UI font.</span></div>';
          PMStore.receipt("Custom theme validated and applied (simulated) — registered as “Custom 1”", "ok");
        }
      });
    });
    root.querySelectorAll("[data-theme-op]").forEach(function (b) {
      b.addEventListener("click", function () {
        var msgs = {
          create: "Create simulated — a new TOML skeleton inherits the current base theme",
          import: "Import simulated — the file would be validated before registration",
          export: "Export simulated — the active theme would download as TOML",
          folder: "Open folder simulated — the themes directory would open in the OS shell"
        };
        PMStore.receipt(msgs[b.getAttribute("data-theme-op")], "info");
      });
    });
  }

  /* ---------- SPELLCHECK ---------- */
  function renderSpellcheck(route) {
    var body = '<div class="res-panel"><div class="res-panel-h"><h4>Live demo paragraph</h4><span class="pm-badge" data-kind="scope">Nothing is ever replaced automatically</span></div>' +
      '<div id="res-spell"></div></div>' +
      '<div class="res-panel"><div class="res-panel-h"><h4>Grammar and style (separate, opt-in)</h4><span class="pm-badge" data-kind="state" data-icon data-state="not-configured">Off</span></div>' +
      '<p class="res-sub">Provider-backed grammar help is a separate opt-in feature: it sends prose to the route you choose, counts toward Usage, and shows its privacy, route, and cost disclosure before you turn it on. It is never bundled with spellcheck.</p>' +
      '<div><button type="button" class="pm-btn" data-variant="quiet" data-grammar>Review the disclosure…</button></div></div>' +
      '<div class="res-panel"><div class="res-panel-h"><h4>Overrides</h4></div><dl class="pm-kv">' +
      "<dt>Thread override</dt><dd>None — follows the project</dd>" +
      "<dt>Project override</dt><dd>Project dictionary in use (FileSafe, PeonPing)</dd>" +
      "<dt>Language packs</dt><dd>English (built in) · German pack available</dd></dl></div>";
    renderManager({
      id: "spellcheck", title: "Spellcheck and dictionaries",
      lede: "The packet's normal rows live in the Appearance workspace; this manager owns dictionaries, sources, and the live demo.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
    V.mountSpellcheck(document.getElementById("res-spell"));
    var g = root.querySelector("[data-grammar]");
    if (g) g.addEventListener("click", function () {
      PMStore.receipt("Disclosure simulated — grammar help would list route, cost, and privacy before enabling", "info");
    });
  }

  /* ---------- DESKTOP / TRAY / WINDOW ---------- */
  function renderDesktop(route) {
    var body = RD.desktopGroups.map(function (g, i) {
      return '<div class="res-panel res-rise" style="--stagger:' + i + '"><div class="res-panel-h"><h4>' + esc(g.title) + "</h4></div>" +
        '<dl class="pm-kv">' + g.rows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + "</dl></div>";
    }).join("");
    renderManager({
      id: "desktop", title: "Desktop, tray, and window",
      lede: "Tray behavior, restore policy, and window limits. Editable rows live in the General workspace.",
      tabs: [["overview", "Overview"]], tab: "overview",
      body: body + '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-goto="general.tray-minimize">Edit tray behavior</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-goto="general.launch-destination">Edit launch destination</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-goto="general.unsaved-protection">Edit buffer protection</button></div>'
    });
    root.querySelectorAll("[data-goto]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sid = b.getAttribute("data-goto");
        navigate({ category: "general", sub: sid === "general.launch-destination" ? "desktop" : "desktop", setting: sid });
      });
    });
  }

  /* ---------- TEACHER ---------- */
  function renderTeacher(route) {
    var body = '<div class="res-panel"><div class="res-panel-h"><h4>Teacher</h4></div>' +
      '<p class="res-sub">' + esc(RD.teacher.intro) + "</p>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn" data-variant="primary" data-tour>Start the guided overlay</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-explain>Explain this screen</button></div></div>';
    renderManager({
      id: "teacher", title: "Teacher and help",
      lede: "Help is a Teacher context, not just tooltips: it explains the current screen, offers a guided overlay, and hands you into real actions safely.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
    root.querySelector("[data-tour]").addEventListener("click", function () { startTour(); });
    root.querySelector("[data-explain]").addEventListener("click", function () {
      PMStore.receipt("Teacher: this screen lists your help options — the guided overlay highlights real controls", "info");
    });
  }

  function startTour() {
    navigate({});
    window.setTimeout(function () {
      var steps = RD.teacher.steps;
      var i = 0;
      var ring = document.createElement("div");
      ring.className = "res-coach-ring";
      var card = document.createElement("div");
      card.className = "res-coach";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-label", "Guided overlay");
      document.body.appendChild(ring);
      document.body.appendChild(card);
      function place(step) {
        var targetEl = step.target === "search" ? document.getElementById("res-search")
          : step.target === "notices" ? root.querySelector(".pm-notice")
          : root.querySelector(".res-dash");
        var r = targetEl ? targetEl.getBoundingClientRect() : { left: 40, top: 80, width: 300, height: 60 };
        ring.style.left = (r.left - 6) + "px";
        ring.style.top = (r.top - 6) + "px";
        ring.style.width = (r.width + 12) + "px";
        ring.style.height = (r.height + 12) + "px";
        card.style.left = Math.min(r.left, window.innerWidth - 320) + "px";
        card.style.top = (r.top + r.height + 14) + "px";
        card.innerHTML = "<h4>" + esc(step.title) + "</h4><p>" + esc(step.body) + "</p>" +
          '<div style="display:flex;gap:8px"><button type="button" class="pm-btn" data-tour-next>' + (i === steps.length - 1 ? "Finish" : "Next") + '</button>' +
          '<button type="button" class="pm-btn" data-variant="quiet" data-tour-end>End tour</button></div>';
      }
      function teardown(handoff) {
        ring.remove();
        card.remove();
        if (handoff) {
          PMStore.receipt("Teacher hands off into a real action — quiet hours opens in the workspace", "ok");
          navigate(RD.teacher.handoff.target);
        }
      }
      place(steps[0]);
      card.addEventListener("click", function (ev) {
        if (ev.target.closest("[data-tour-end]")) { teardown(false); return; }
        if (ev.target.closest("[data-tour-next]")) {
          i++;
          if (i >= steps.length) { teardown(true); return; }
          place(steps[i]);
        }
      });
    }, 350);
  }

  /* ---------- manager shell ---------- */
  function renderManager(opts) {
    var tabs = (opts.tabs || []).map(function (t) {
      return '<button type="button" role="tab" aria-selected="' + (t[0] === opts.tab) + '" aria-current="' + (t[0] === opts.tab) + '" data-mtab="' + t[0] + '">' + esc(t[1]) + "</button>";
    }).join("");
    root.innerHTML = '<div class="res-mgr"><div class="res-mgr-inner">' +
      '<header class="res-mgr-head"><span class="res-eyebrow">' + esc(opts.title) + "</span><h1>" + esc(opts.title) + "</h1>" +
      '<p class="res-sub">' + opts.lede + "</p>" +
      (opts.tabs && opts.tabs.length > 1 ? '<nav class="res-mgr-nav" role="tablist">' + tabs + "</nav>" : "") +
      "</header>" + opts.body + "</div></div>";
    root.querySelectorAll("[data-mtab]").forEach(function (b) {
      b.addEventListener("click", function () { PMRouter.go({ manager: opts.id, tab: b.getAttribute("data-mtab") }); });
    });
  }

  /* ---------- router ---------- */
  function render(route, fromNav) {
    if (spy) { spy.detach(); spy = null; }
    currentRoute = route;
    if (route.view === "manager" && PMStore.get("slowHydration", false)) {
      PMStore.set("slowHydration", false);
      var hydMeta = ((RD.managerMeta || DEMO.managerMeta || {})[route.manager]) || { title: "Manager" };
      renderManager({ id: route.manager, title: hydMeta.title, lede: "", tabs: [], tab: "",
        body: V.operationHtml({ id: "hydrate", title: "Hydrating " + hydMeta.title, phase: "Loading domain state", state: "starting", progressKind: "none", source: "simulated", waitReason: "Compact summaries stayed usable — the full manager hydrates on demand, never at Settings open" }) });
      window.setTimeout(function () { render(route, false); }, 900);
      return;
    }
    if (route.view === "manager") {
      if (route.manager === "providers") return renderProviders(route);
      if (route.manager === "notifications") return renderNotifications(route);
      if (route.manager === "sounds") return renderSounds(route);
      if (route.manager === "appearance") return renderAppearance(route);
      if (route.manager === "spellcheck") return renderSpellcheck(route);
      if (route.manager === "desktop") return renderDesktop(route);
      if (route.manager === "teacher") return renderTeacher(route);
      root.innerHTML = '<div class="res-home"><div class="res-home-inner"><div class="pm-empty" style="margin-block-start:60px"><div class="pm-empty-title">This manager belongs to another concept</div><div class="pm-empty-guidance">Resonance demonstrates Notifications, Sounds, Appearance, Spellcheck, Desktop, Teacher, and Providers. The coverage matrix records the rest as shared grammar.</div></div></div></div>';
      return;
    }
    if (route.view === "category") return renderWorkspace(route, fromNav);
    renderHome();
  }

  /* ---------- demo drawer ---------- */
  function buildDemoDrawer() {
    var list = document.getElementById("res-demo-list");
    var concept = RD.demoScenarios.map(function (s) {
      return '<button type="button" class="pm-btn" data-demo="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
    var prov = V.PROVIDER_SCENARIOS.map(function (s) {
      return '<button type="button" class="pm-btn" data-prov-scenario="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
    list.innerHTML = '<div class="res-demo-group">Resonance states</div>' + concept +
      '<div class="res-demo-group">Provider scenarios</div>' + prov;
    list.addEventListener("click", function (ev) {
      var ps = ev.target.closest && ev.target.closest("[data-prov-scenario]");
      if (ps) { V.applyProviderScenario(ps.getAttribute("data-prov-scenario"), function () { render(PMRouter.current(), false); }); return; }
      var b = ev.target.closest && ev.target.closest("[data-demo]");
      if (b) runScenario(b.getAttribute("data-demo"));
    });
  }

  function runScenario(id) {
    if (id === "calm") { PMStore.set("calmDemo", true); PMStore.receipt("Calm state — every notice dismissed; reset to bring them back", "ok"); return; }
    if (id === "slow-hydration") { PMStore.set("slowHydration", true); PMStore.receipt("Scenario applied — the next manager you open hydrates on demand with a truthful loading projection", "info"); return; }
    if (id === "reset") { PMStore.resetDemo(); PMStore.receipt("Demo data reset to its seeded state", "ok"); return; }
    if (id === "test-send") {
      navigate({ manager: "notifications", tab: "destinations" });
      window.setTimeout(function () {
        var b = document.querySelector('[data-test-send="slack"]');
        if (b) b.click();
      }, 350);
      return;
    }
    if (id === "sound-upload") { navigate({ manager: "sounds", tab: "library" }); window.setTimeout(function () { var b = document.querySelector('[data-sound-op="upload"]'); if (b) b.click(); }, 350); return; }
    if (id === "sound-preview") { navigate({ manager: "sounds", tab: "library" }); window.setTimeout(function () { var b = document.querySelector('[data-preview="chime-soft"]'); if (b) b.click(); }, 350); return; }
    if (id === "pack-valid" || id === "pack-wrong" || id === "pack-unverified") {
      navigate({ manager: "sounds", tab: "packs" });
      window.setTimeout(function () {
        var key = id === "pack-valid" ? "valid" : id === "pack-wrong" ? "wrongFormat" : "unverified";
        var b = document.querySelector('[data-pack="' + key + '"]');
        if (b) b.click();
      }, 350);
      return;
    }
    if (id === "theme-hover") {
      navigate({ manager: "appearance", tab: "themes" });
      PMStore.receipt("Hover the swatches to preview; click to commit", "info");
      return;
    }
    if (id === "theme-invalid") {
      navigate({ manager: "appearance", tab: "custom" });
      window.setTimeout(function () {
        var inv = document.querySelector('[data-toml="invalid"]');
        var apply = document.querySelector('[data-toml="apply"]');
        if (inv) inv.click();
        if (apply) apply.click();
      }, 350);
      return;
    }
    if (id === "teacher-tour") { startTour(); return; }
    if (id === "changed-elsewhere") {
      V.setChanged("notifications.volume", "set to 65% in another window at 09:12");
      navigate({ category: "notifications", sub: "sounds", setting: "notifications.volume" });
      PMStore.receipt("Scenario applied — Notification volume shows the changed-elsewhere bar", "info");
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
      root.classList.toggle("res-squeezed", entries[0].contentRect.width <= 900);
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
      drawer: document.getElementById("res-demo"),
      scrim: document.getElementById("res-scrim")
    });
    wireSqueezeFallback();
    renderInbox();
    /* Domain-local refresh (Performance register §7.3 narrow deltas, §20.2):
       repaint only the surface that owns the changed key; every other
       surface renders fresh on entry. */
    var KEY_DOMAIN = Object.assign({}, V.SHARED_KEY_DOMAINS, {
      "dismissedNotices": "notices", "calmDemo": "notices",
      "destinations": "manager:notifications", "events": "manager:notifications",
      "lastTestSend": "manager:notifications", "sounds": "manager:sounds", "packResult": "manager:sounds"
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
