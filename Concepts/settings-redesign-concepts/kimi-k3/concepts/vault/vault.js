/* ============================================================================
   vault.js — Concept 04 "Vault" (ledger & timeline)
   ----------------------------------------------------------------------------
   Ledger composition over the frozen shared layer. Families: Storage &
   Retention, Backup & Restore, Settings Lifecycle, History & Sessions,
   Runtime Artifacts, Source Control/Worktrees, GitHub Actions, Containers
   & Registries, Web/Search/Fetch, Project Search Index, Workspace Cleanup,
   Future Server Module Shell. Shared binders attach ONCE at boot.
   ========================================================================== */
(function () {
  "use strict";

  var DEMO = window.PM_CORE_DATA;
  var VD = window.VLT_DATA;
  var V = window.PMViews;
  var esc = V.esc;
  var root = document.getElementById("vlt-root");
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
    lifecycle: { step: 0, mode: null, cancelled: false, applied: false, rolledBack: false },
    forgeConnected: false,
    indexRebuild: null,
    cleanupDone: false,
    backups: V.clone(VD.backups),
    sessions: V.clone(VD.sessions),
    artifacts: V.clone(VD.artifacts)
  });
  PMStore.init("vault");

  function buildSearchIndex() {
    var demo = Object.assign({}, DEMO, {
      managerMeta: Object.assign({}, DEMO.managerMeta, VD.managerMeta),
      actions: DEMO.actions.concat(VD.actions)
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

  /* ---------- HOME ---------- */
  function homeHtml() {
    var notices = noticeList();
    var groups = [["attention", "Needs attention"], ["setup", "Continue setup"], ["recommended", "Recommended"]];
    var noticeHtml = groups.map(function (g) {
      var items = notices.filter(function (n) { return n.kind === g[0]; });
      if (!items.length) return "";
      return '<div class="vlt-eyebrow">' + esc(g[1]) + "</div>" + items.map(V.noticeHtml).join("");
    }).join("");
    if (!notices.length) {
      noticeHtml = '<div class="vlt-card"><p class="vlt-sub">All clear. Nothing needs attention, no setup is waiting, and there are no recommendations right now.</p></div>';
    }
    var mgrDests = Object.keys(VD.managerMeta).map(function (mid) {
      var m = VD.managerMeta[mid];
      return '<button type="button" class="vlt-dest" data-mgr="' + esc(mid) + '">' +
        '<span class="vlt-dest-t">' + esc(m.title) + "</span>" +
        '<span class="vlt-dest-p">' + esc(m.purpose) + "</span>" +
        '<span class="vlt-dest-h">' + (mid === "servers" ? "Deferred modules" : "Manager") + "</span>" +
        '<span class="vlt-dest-a">' + V.icon("chevron") + "</span></button>";
    }).join("");
    var catDests = DEMO.categories.map(function (c) {
      return '<button type="button" class="vlt-dest" data-cat="' + esc(c.id) + '">' +
        '<span class="vlt-dest-t">' + esc(c.title) + "</span>" +
        '<span class="vlt-dest-p">' + esc(c.purpose) + "</span>" +
        '<span class="vlt-dest-h">Workspace</span>' +
        '<span class="vlt-dest-a">' + V.icon("chevron") + "</span></button>";
    }).join("");
    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" class="vlt-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";
    }).join("");
    return '<div class="vlt-home"><div class="vlt-home-inner vlt-step-in">' +
      '<div class="vlt-searchwrap"><span class="vlt-eyebrow">Vault · Ledger</span>' +
        '<span class="vlt-search"><input type="search" id="vlt-search" placeholder="Search settings, managers, and actions — try “notifcation”" aria-label="Search settings" autocomplete="off" spellcheck="false">' +
        '<span class="vlt-hits" id="vlt-hits" role="listbox" aria-label="Search results" hidden></span></span></div>' +
      '<section class="vlt-notices" aria-label="Notices">' + noticeHtml + "</section>" +
      '<section aria-label="Ledger managers"><div class="vlt-eyebrow" style="margin-block-end:6px">Ledger managers</div><div class="vlt-ledger-dests">' + mgrDests + "</div></section>" +
      '<section aria-label="Workspace destinations"><div class="vlt-eyebrow" style="margin-block-end:6px">Workspace destinations</div><div class="vlt-ledger-dests">' + catDests + "</div></section>" +
      '<section aria-label="Recent settings work"><div class="vlt-eyebrow" style="margin-block-end:6px">Recent settings work</div><div class="vlt-recents">' + recents + "</div></section>" +
      "</div></div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    V.wireSearch({ input: document.getElementById("vlt-search"), listEl: document.getElementById("vlt-hits"), index: searchIndex, onPick: onSearchPick });
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
        subs = '<span class="vlt-nav-subs">' + c.subcategories.map(function (s) {
          return '<button type="button" class="vlt-nav-sub" data-subjump="' + esc(s.id) + '">' + esc(s.title) + "</button>";
        }).join("") + "</span>";
      }
      return '<button type="button" class="vlt-nav-cat" data-catnav="' + esc(c.id) + '" aria-current="' + current + '">' + V.icon(c.icon) + esc(c.title) + "</button>" + subs;
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
    var squeezeSelect = '<span class="pm-select vlt-outline-select"><select id="vlt-cat-select" aria-label="Category">' +
      DEMO.categories.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === cat.id ? " selected" : "") + ">" + esc(c.title) + "</option>"; }).join("") + "</select></span>";
    var sections = cat.subcategories.map(function (sub) {
      return '<section class="vlt-sec" id="sec-' + esc(sub.id) + '" aria-label="' + esc(sub.title) + '">' +
        "<h3>" + esc(sub.title) + '</h3><p class="vlt-sec-sum">' + esc(sub.summary) + "</p>" + sectionRows(sub) + "</section>";
    }).join("");

    root.innerHTML = '<div class="vlt-ws vlt-step-in">' +
      '<nav class="vlt-nav" aria-label="Categories">' + navHtml(cat) + "</nav>" +
      '<div class="vlt-doc" id="vlt-doc"><div class="vlt-doc-inner">' +
        '<header class="vlt-doc-head">' + squeezeSelect +
          '<span class="vlt-eyebrow">' + esc(cat.title) + "</span><h1>" + esc(cat.purpose) + "</h1></header>" +
        sections + "</div></div></div>";

    var doc = document.getElementById("vlt-doc");
    root.querySelectorAll("[data-catnav]").forEach(function (b) {
      b.addEventListener("click", function () { navigate({ category: b.getAttribute("data-catnav") }); });
    });
    var sel = document.getElementById("vlt-cat-select");
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

  /* ---------- manager shell ---------- */
  function mgrShell(opts) {
    var tabs = (opts.tabs || []).map(function (t) {
      return '<button type="button" role="tab" aria-selected="' + (t[0] === opts.tab) + '" aria-current="' + (t[0] === opts.tab) + '" data-mtab="' + t[0] + '">' + esc(t[1]) + "</button>";
    }).join("");
    root.innerHTML = '<div class="vlt-mgr"><div class="vlt-mgr-inner vlt-step-in">' +
      '<header class="vlt-mgr-head"><span class="vlt-eyebrow">' + esc(opts.title) + "</span><h1>" + esc(opts.title) + "</h1>" +
      '<p class="vlt-sub">' + opts.lede + "</p>" +
      (opts.tabs && opts.tabs.length > 1 ? '<nav class="vlt-mgr-nav" role="tablist">' + tabs + "</nav>" : "") +
      "</header>" + opts.body + "</div></div>";
    root.querySelectorAll("[data-mtab]").forEach(function (b) {
      b.addEventListener("click", function () { PMRouter.go({ manager: opts.id, tab: b.getAttribute("data-mtab") }); });
    });
  }

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
    var listHtml = groups.filter(function (g) { return byGroup[g] && byGroup[g].length; }).map(function (g) {
      return '<div class="vlt-eyebrow">' + esc(V.GROUP_LABEL[g]) + "</div>" +
        byGroup[g].map(function (x) {
          var st = V.providerStatus(x);
          return '<button type="button" class="vlt-dest" data-pid="' + esc(x.id) + '" aria-current="' + (x.id === pid) + '">' +
            '<span class="vlt-dest-t">' + esc(x.name) + "</span>" +
            '<span class="vlt-dest-p">' + esc(x.tagline) + "</span>" +
            '<span class="vlt-dest-h">' + V.healthDot(st.dot, st.label) + "</span>" +
            '<span class="vlt-dest-a">' + V.icon("chevron") + "</span></button>";
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
      body = '<div class="vlt-card"><div class="vlt-card-h"><h3>' + esc(p.name) + "</h3>" + V.healthDot(st.dot, st.label) + "</div>" +
        '<dl class="pm-kv">' +
        "<dt>Connection</dt><dd>" + esc(V.GROUP_LABEL[p.connectionGroup] || p.connectionGroup) + "</dd>" +
        (install ? "<dt>Installation</dt><dd>" + esc(install) + "</dd>" : "") +
        "<dt>Sign-in</dt><dd>" + esc(p.authNote || V.AUTH_MODEL[p.authModel] || "") + "</dd>" +
        (act ? "<dt>Active account</dt><dd>" + esc(act.label) + " · " + esc(act.identity) + "</dd>" : "") +
        "<dt>Plan</dt><dd>" + esc(p.product.plan) + " — " + esc(p.product.billingRoute) + "</dd>" +
        (p.groupingNote ? "<dt>Grouping</dt><dd>" + esc(p.groupingNote) + "</dd>" : "") + "</dl>" +
        (p.lastError ? '<div class="pm-row-reason">' + esc(p.lastError) + "</div>" : "") + "</div>";
      if (p.installState === "installed-signed-out") {
        body += '<div class="vlt-card"><div class="vlt-card-h"><h4>Sign in required</h4></div>' +
          '<p class="vlt-sub">This tool owns its own sign-in. Puppet Master launches the native flow and never sees credentials.</p>' +
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
      body = V.usageHtml(p) + (p.usageNote ? '<p class="vlt-sub">' + esc(p.usageNote) + "</p>" : "");
    } else if (tab === "routing") {
      body = V.routingHtml(p) + '<div class="vlt-card"><div class="vlt-card-h"><h4>Agent roles</h4></div>' + V.rolesHtml(PMStore.get("roles", [])) + "</div>";
    } else if (tab === "install") {
      body = V.installationHtml(p) + V.updatesHtml(p);
    } else if (tab === "advanced") {
      body = V.catalogHtml(p) + V.diagnosticsHtml(p) +
        '<div><button type="button" class="pm-btn" data-variant="quiet" data-pv="refresh" data-pid="' + esc(p.id) + '">Refresh catalog</button></div>';
    }

    root.innerHTML = '<div class="vlt-mgr"><div class="vlt-mgr-inner vlt-step-in">' +
      '<header class="vlt-mgr-head"><span class="vlt-eyebrow">Providers</span><h1>Accounts, connections, models, and installations</h1>' +
      '<p class="vlt-sub">A provider supplies models, authentication, limits, and capabilities. An installation is a host resource.</p></header>' +
      V.providerEnvBannerHtml() +
      '<div class="vlt-prov"><div style="display:grid;gap:8px">' + listHtml + "</div>" +
      '<div style="display:grid;gap:12px;align-content:start"><nav class="vlt-mgr-nav" role="tablist">' + tabs + "</nav>" + body + "</div></div>" +
      "</div></div>";

    root.querySelectorAll("[data-pid].vlt-dest").forEach(function (b) {
      b.addEventListener("click", function () { PMRouter.go({ manager: "providers", sub: b.getAttribute("data-pid"), tab: "overview" }); });
    });
    root.querySelectorAll("[data-ptab]").forEach(function (b) {
      b.addEventListener("click", function () { PMRouter.go({ manager: "providers", sub: pid, tab: b.getAttribute("data-ptab") }); });
    });
  }

  /* ---------- STORAGE & RETENTION ---------- */
  function timelineRow(r) {
    var max = 180;
    var pct = Math.min(100, Math.round((r.days / max) * 100));
    var minPct = Math.min(100, Math.round((r.minimum / max) * 100));
    return '<div class="vlt-tl-row"><div><div class="vlt-tl-label">' + esc(r.label) + (r.hold ? ' <span class="pm-badge" data-kind="state" data-icon data-state="managed">Legal hold</span>' : "") + '</div>' +
      '<div class="vlt-tl-meta">Anchor: ' + esc(r.anchor) + " · minimum " + r.minimum + " days</div></div>" +
      '<svg viewBox="0 0 100 22" preserveAspectRatio="none" data-tl="' + esc(r.label) + '" tabindex="0" role="img" aria-label="' + esc(r.label + " retention " + r.days + " days, minimum " + r.minimum) + '">' +
      '<rect class="vlt-tl-bar" x="0" y="4" width="' + pct + '" height="14" rx="3"/>' +
      '<rect class="vlt-tl-min" x="' + Math.max(0, minPct - 1) + '" y="4" width="2" height="14"/>' +
      '<line class="vlt-tl-scrub" x1="0" y1="2" x2="0" y2="20" stroke-width="1.5" data-scrub-line/>' +
      "</svg>" +
      '<span class="vlt-hash" data-tl-days>' + r.days + " days</span></div>";
  }

  function renderStorage(route) {
    var areas = VD.storageAreas.map(function (a, i) {
      return '<div class="vlt-card"><div class="vlt-card-h"><h4>' + esc(a.name) + '</h4><span class="pm-badge" data-kind="scope">Area ' + (i + 1) + " of 5</span></div>" +
        '<p class="vlt-sub">' + esc(a.note) + "</p></div>";
    }).join("");
    var facts = VD.storageFacts.map(function (f) { return "<dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd>"; }).join("");
    var body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Capacity</h4></div>' +
      '<div class="vlt-meter"><div class="vlt-meter-label"><span>Project data</span><span>92 GB of 512 GB · 18%</span></div>' +
      '<div class="vlt-meter-track"><span class="vlt-meter-fill" style="inline-size:18%"></span></div></div>' +
      '<div class="vlt-meter"><div class="vlt-meter-label"><span>Pressure threshold</span><span>warns at 10% free</span></div>' +
      '<div class="vlt-meter-track"><span class="vlt-meter-fill" data-warn="true" style="inline-size:10%"></span></div></div></div>' +
      '<div class="vlt-card"><div class="vlt-card-h"><h4>Retention timelines</h4><span class="pm-badge" data-kind="scope">Scrub a bar to inspect</span></div>' +
      '<div class="vlt-timeline">' + VD.retention.map(timelineRow).join("") + "</div></div>" +
      '<div class="vlt-card"><div class="vlt-card-h"><h4>Storage facts</h4></div><dl class="pm-kv">' + facts + "</dl></div>" +
      '<div class="vlt-eyebrow">Five distinct areas — never conflated</div>' + areas;
    mgrShell({
      id: "storage", title: "Storage and Retention",
      lede: "Modes, timelines, pressure, and recovery — with visual separation between snapshots, backups, and cleanup.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
    root.querySelectorAll(".vlt-tl-row svg").forEach(function (svg) {
      function scrub(ev) {
        var rect = svg.getBoundingClientRect();
        var x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
        var line = svg.querySelector("[data-scrub-line]");
        line.setAttribute("x1", x);
        line.setAttribute("x2", x);
        var days = Math.round((x / 100) * 180);
        var chip = svg.closest(".vlt-tl-row").querySelector("[data-tl-days]");
        chip.textContent = "≈ " + days + " days at cursor";
      }
      function restore() {
        var label = svg.getAttribute("data-tl");
        VD.retention.forEach(function (r) {
          if (r.label === label) svg.closest(".vlt-tl-row").querySelector("[data-tl-days]").textContent = r.days + " days";
        });
      }
      svg.addEventListener("pointermove", scrub);
      svg.addEventListener("pointerleave", restore);
    });
  }

  /* ---------- BACKUP & RESTORE ---------- */
  function renderBackup(route) {
    var rows = PMStore.get("backups", []).map(function (b) {
      return '<div class="vlt-receipt"><div><div class="vlt-receipt-t">' + esc(b.kind) + " · " + esc(b.size) + "</div>" +
        '<div class="vlt-receipt-s">' + esc(b.at) + (b.verified ? " · verified" : "") + "</div></div>" +
        '<span class="vlt-hash">' + esc(b.hash) + "</span></div>";
    }).join("");
    var body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Four different things, four different grammars</h4></div>' +
      V.rowHtml(DEMO.settings["system.snapshot-frequency"]) +
      '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">Back up now</div><div class="pm-row-desc">One-shot action — produces a receipt.</div></div>' +
      '<div class="pm-row-control"><button type="button" class="pm-btn" data-variant="primary" data-backup-now>Back up now</button></div></div>' +
      '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">Last backup</div><div class="pm-row-desc">Read-only status projection.</div></div>' +
      '<div class="pm-row-state"><span class="pm-badge" data-kind="state" data-icon data-state="auto">2026-08-10 03:12 · verified</span></div></div>' +
      '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">Open backup log</div><div class="pm-row-desc">Diagnostic — opens the operation log.</div></div>' +
      '<div class="pm-row-control"><button type="button" class="pm-btn" data-variant="quiet" data-backup-log>Open log</button></div></div></div>' +
      '<div class="vlt-card"><div class="vlt-card-h"><h4>Receipts</h4></div>' + rows + "</div>";
    mgrShell({
      id: "backup", title: "Backup and Restore",
      lede: "Schedules are settings, backups are actions, last-backup is a status, and logs are diagnostics — never four identical form rows.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
    root.querySelector("[data-backup-now]").addEventListener("click", function () {
      PMStore.receipt("Backup simulated — a verified snapshot would land in the receipts list", "ok");
      var list = PMStore.get("backups", []).slice();
      list.unshift({ id: "b-085", at: "just now", kind: "Manual project backup", size: "1.2 GB", verified: true, hash: "sha256:demo…e5" });
      PMStore.set("backups", list);
    });
    root.querySelector("[data-backup-log]").addEventListener("click", function () {
      PMStore.receipt("Log simulated — the operation log would open in the bottom panel", "info");
    });
  }

  /* ---------- SETTINGS LIFECYCLE ---------- */
  function lifecycleStepBody(step, lc) {
    var d = VD.importDemo;
    if (step === 0) {
      return '<div class="vlt-card"><div class="vlt-card-h"><h4>Source</h4></div>' +
        '<p class="vlt-sub">Pick a settings payload. Export writes one too. There is deliberately no format dropdown — Puppet Master owns the format.</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="pm-btn" data-variant="primary" data-lc="file">' + esc(d.file) + "</button>" +
        '<button type="button" class="pm-btn" data-variant="quiet" data-lc="export">Export current settings first</button></div></div>';
    }
    if (step === 1) {
      return '<div class="vlt-card"><div class="vlt-card-h"><h4>Preview — merge vs replace</h4></div>' +
        '<div class="pm-seg" role="radiogroup" aria-label="Merge or replace">' +
        '<button type="button" role="radio" aria-checked="true" data-lc-merge>Merge</button>' +
        '<button type="button" role="radio" aria-checked="false" data-lc-replace>Replace</button></div>' +
        '<dl class="pm-kv"><dt>Adds</dt><dd>' + d.stats.add + " settings</dd><dt>Changes</dt><dd>" + d.stats.change + "</dd><dt>Conflicts</dt><dd>" + d.stats.conflict + "</dd><dt>Legacy keys</dt><dd>" + d.stats.legacy + "</dd></dl>" +
        '<div class="vlt-card"><div class="vlt-card-h"><h4>Conflict preview</h4></div>' +
        d.conflicts.map(function (c) {
          return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label pm-mono">' + esc(c.key) + "</div>" +
            '<div class="pm-row-desc">Incoming ' + esc(c.incoming) + " · Current " + esc(c.current) + "</div></div>" +
            '<div class="pm-row-state"><span class="pm-badge" data-kind="scope">' + esc(c.resolution) + "</span></div></div>";
        }).join("") + "</div></div>";
    }
    if (step === 2) {
      return '<div class="vlt-card"><div class="vlt-card-h"><h4>Validation</h4></div>' +
        '<p class="vlt-sub">Schema validation passed: 23 settings recognized, 0 invalid values, 2 managed rows will be skipped (update channel, FileSafe enrollment).</p></div>';
    }
    if (step === 3) {
      return '<div class="vlt-card"><div class="vlt-card-h"><h4>Legacy-key migration</h4></div>' +
        d.legacyKeys.map(function (k) {
          return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label pm-mono">' + esc(k.from) + "</div>" +
            '<div class="pm-row-desc">→ ' + esc(k.to) + " — " + esc(k.note) + "</div></div></div>";
        }).join("") + "</div>";
    }
    if (step === 4) {
      return '<div class="vlt-card"><div class="vlt-card-h"><h4>Atomic apply</h4></div>' +
        '<p class="vlt-sub">Everything applies as one transaction against a pre-import snapshot. The restart and reconnect plan is shown before anything changes:</p>' +
        '<p class="vlt-sub">' + esc(d.restartPlan) + "</p></div>";
    }
    if (step === 5) {
      return '<div class="vlt-card"><div class="vlt-card-h"><h4>Verification</h4></div>' +
        '<p class="vlt-sub">Post-apply checks: managed rows untouched, effective values re-resolved, provider routes re-checked.</p></div>';
    }
    return '<div class="vlt-card"><div class="vlt-card-h"><h4>Receipt</h4><span class="vlt-hash">sha256:77e2…9c</span></div>' +
      '<p class="vlt-sub">Source disclosed: ' + esc(d.file) + ". " + (lc.applied ? "Applied and verified. " : "") + "The pre-import snapshot stays available for rollback during the retention window.</p>" +
      (lc.applied && !lc.rolledBack
        ? '<div><button type="button" class="pm-btn" data-variant="danger" data-lc-rollback>Roll back to the pre-import snapshot</button></div>'
        : "") +
      (lc.rolledBack ? '<p class="vlt-sub">Rolled back — the pre-import snapshot is live again. This import attempt stays in the receipts.</p>' : "") + "</div>";
  }

  function renderLifecycle(route) {
    var lc = PMStore.get("lifecycle", { step: 0 });
    var tab = route.tab || "transfer";
    var body = "";
    if (tab === "transfer") {
      var steps = VD.lifecycleSteps.map(function (s, i) {
        var state = i < lc.step ? "done" : i === lc.step ? "current" : "todo";
        return '<span class="vlt-step" data-state="' + state + '">' + (i + 1) + ". " + esc(s) + "</span>";
      }).join("");
      body = '<div class="vlt-steps">' + steps + "</div>" +
        '<div class="vlt-step-in" id="vlt-step-body">' + lifecycleStepBody(lc.step, lc) + "</div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        (lc.step > 0 ? '<button type="button" class="pm-btn" data-variant="quiet" data-lc-back>Back</button>' : "") +
        (lc.step < VD.lifecycleSteps.length - 1 && lc.step > 0 ? '<button type="button" class="pm-btn" data-variant="primary" data-lc-next>Continue</button>' : "") +
        '<button type="button" class="pm-btn" data-variant="quiet" data-lc-cancel>Cancel</button></div>';
    } else if (tab === "copy") {
      body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Copy Settings From…</h4><span class="pm-badge" data-kind="scope">One-time transactional copy</span></div>' +
        '<p class="vlt-sub">Copy broad groups from another project. The destination becomes independent immediately — there is no inheritance to unwind later.</p>' +
        '<div class="vlt-ledger-dests">' + VD.importDemo.copyGroups.map(function (g, i) {
          return '<div class="vlt-dest" style="cursor:default"><span class="vlt-dest-t">' + esc(g) + '</span><span class="vlt-dest-p"></span><span class="vlt-dest-h"><button type="button" class="pm-switch" role="switch" aria-checked="' + (i < 7) + '" data-copy-group="' + i + '" aria-label="Copy ' + esc(g) + '"></button></span><span class="vlt-dest-a"></span></div>';
        }).join("") + "</div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="pm-btn" data-variant="primary" data-copy-run>Preview the copy</button></div></div>';
    } else if (tab === "reset") {
      body = V.rowHtml(DEMO.settings["system.factory-reset"]) +
        '<div class="vlt-card"><div class="vlt-card-h"><h4>Reset to defaults</h4></div>' +
        '<p class="vlt-sub">Reset previews first, snapshots before applying, and verifies after. Managed values are never touched. The pre-reset snapshot lives under Backup and Restore.</p>' +
        '<div><button type="button" class="pm-btn" data-variant="danger" data-reset-preview>Preview a reset</button></div></div>';
    }
    mgrShell({
      id: "lifecycle", title: "Settings Lifecycle",
      lede: "Export, import, copy, rollback, and reset as stepped, inspectable flows — never a raw format dropdown.",
      tabs: [["transfer", "Export and import"], ["copy", "Copy Settings From…"], ["reset", "Reset"]],
      tab: tab, body: body
    });
    var nlc = function (patch) { var cur = PMStore.get("lifecycle", {}); PMStore.set("lifecycle", Object.assign({}, cur, patch)); };
    var fileBtn = root.querySelector('[data-lc="file"]');
    if (fileBtn) fileBtn.addEventListener("click", function () { nlc({ step: 1 }); });
    var expBtn = root.querySelector('[data-lc="export"]');
    if (expBtn) expBtn.addEventListener("click", function () { PMStore.receipt("Export simulated — the payload would download with a hash receipt", "info"); });
    var next = root.querySelector("[data-lc-next]");
    if (next) next.addEventListener("click", function () {
      var cur = PMStore.get("lifecycle", { step: 0 });
      var patch = { step: cur.step + 1 };
      if (cur.step + 1 === VD.lifecycleSteps.length - 1) patch.applied = true;
      nlc(patch);
      if (patch.applied) PMStore.receipt("Import simulated — applied atomically, verified, and receipted", "ok");
    });
    var back = root.querySelector("[data-lc-back]");
    if (back) back.addEventListener("click", function () { var cur = PMStore.get("lifecycle", { step: 0 }); nlc({ step: Math.max(0, cur.step - 1) }); });
    var cancel = root.querySelector("[data-lc-cancel]");
    if (cancel) cancel.addEventListener("click", function () {
      PMStore.set("lifecycle", { step: 0, mode: null, cancelled: true, applied: false, rolledBack: false });
      PMStore.receipt("Import cancelled — nothing was applied; the snapshot was discarded", "info");
    });
    var merge = root.querySelector("[data-lc-merge]");
    if (merge) merge.addEventListener("click", function () { PMStore.receipt("Merge selected — incoming values fill gaps, conflicts keep current", "info"); });
    var replace = root.querySelector("[data-lc-replace]");
    if (replace) replace.addEventListener("click", function () { PMStore.receipt("Replace selected — the conflict preview shows exactly what flips", "warn"); });
    var rb = root.querySelector("[data-lc-rollback]");
    if (rb) rb.addEventListener("click", function () {
      nlc({ rolledBack: true });
      PMStore.receipt("Rollback simulated — the pre-import snapshot is live again", "ok");
    });
    root.querySelectorAll("[data-copy-group]").forEach(function (sw) {
      sw.addEventListener("click", function () { sw.setAttribute("aria-checked", String(sw.getAttribute("aria-checked") !== "true")); });
    });
    var copyRun = root.querySelector("[data-copy-run]");
    if (copyRun) copyRun.addEventListener("click", function () {
      PMStore.receipt("Copy preview simulated — restore point, atomic apply, verification, receipt, rollback available; destination is independent immediately", "info");
    });
    var resetPrev = root.querySelector("[data-reset-preview]");
    if (resetPrev) resetPrev.addEventListener("click", function () {
      PMStore.receipt("Reset preview simulated — 41 rows would return to defaults; 2 managed rows stay", "warn");
    });
  }

  /* ---------- HISTORY & SESSIONS ---------- */
  function renderHistory(route) {
    var filter = PMStore.get("history.filter", "project");
    var sessions = PMStore.get("sessions", []).filter(function (s) {
      return filter === "all" || s.project === "Puppet Master";
    });
    var rows = sessions.map(function (s) {
      return '<div class="vlt-receipt"><div><div class="vlt-receipt-t">' + esc(s.title) + (s.archived ? ' <span class="pm-badge" data-kind="scope">Archived</span>' : "") + "</div>" +
        '<div class="vlt-receipt-s">' + esc(s.project) + " · " + esc(s.at) + " · " + s.turns + " turns</div></div>" +
        '<span style="display:flex;gap:6px">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-hist="compare">Compare</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-hist="export">Export</button></span></div>';
    }).join("");
    var policy = VD.historyPolicy.map(function (p) { return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>"; }).join("");
    var body = '<div class="pm-seg" role="radiogroup" aria-label="History scope">' +
      '<button type="button" role="radio" aria-checked="' + (filter === "project") + '" data-hfilter="project">This project</button>' +
      '<button type="button" role="radio" aria-checked="' + (filter === "all") + '" data-hfilter="all">All projects</button></div>' +
      '<div class="vlt-card"><div class="vlt-card-h"><h4>Sessions</h4></div>' + rows + "</div>" +
      '<div class="vlt-card"><div class="vlt-card-h"><h4>Policy</h4></div><dl class="pm-kv">' + policy + "</dl></div>";
    mgrShell({
      id: "history", title: "History and Sessions",
      lede: "Thread history with compare, export, rebuild, archive, and an honest deletion policy.",
      tabs: [["sessions", "Sessions"]], tab: "sessions", body: body
    });
    root.querySelectorAll("[data-hfilter]").forEach(function (b) {
      b.addEventListener("click", function () { PMStore.set("history.filter", b.getAttribute("data-hfilter")); });
    });
    root.querySelectorAll("[data-hist]").forEach(function (b) {
      b.addEventListener("click", function () {
        PMStore.receipt(b.getAttribute("data-hist") === "compare"
          ? "Compare simulated — two sessions diff turn-by-turn"
          : "Export simulated — markdown with receipts", "info");
      });
    });
  }

  /* ---------- RUNTIME ARTIFACTS ---------- */
  function renderArtifacts(route) {
    var rows = PMStore.get("artifacts", []).map(function (a) {
      return '<div class="vlt-receipt"><div><div class="vlt-receipt-t">' + esc(a.type) + ' <span class="pm-badge" data-kind="scope">' + esc(a.owner) + "</span></div>" +
        '<div class="vlt-receipt-s">' + esc(a.location) + " · " + esc(a.version) + " · retention " + esc(a.retention) + " · redaction: " + esc(a.redaction) + "</div></div>" +
        '<span style="display:flex;gap:6px;align-items:center"><span class="vlt-hash">' + esc(a.hash) + "</span>" +
        '<button type="button" class="pm-btn" data-variant="quiet" data-art="open">Open</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-art="reveal">Reveal</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-art="export">Export</button></span></div>';
    }).join("");
    var body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Artifacts</h4><span class="pm-badge" data-kind="scope">PM-owned vs provider-native identity</span></div>' + rows + "</div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-art-cleanup>Clean up expired artifacts</button></div>';
    mgrShell({
      id: "artifacts", title: "Runtime Artifacts",
      lede: "Outputs with type, location, version, retention, receipts, redaction, and ownership identity.",
      tabs: [["list", "Artifacts"]], tab: "list", body: body
    });
    root.querySelectorAll("[data-art]").forEach(function (b) {
      b.addEventListener("click", function () {
        var m = { open: "Open simulated — the artifact opens in its viewer", reveal: "Reveal simulated — the OS shell shows the folder", export: "Export simulated — redaction rules apply on export" };
        PMStore.receipt(m[b.getAttribute("data-art")], "info");
      });
    });
    root.querySelector("[data-art-cleanup]").addEventListener("click", function () {
      PMStore.receipt("Artifact cleanup simulated — expired entries would leave with receipts; evidence is retained", "info");
    });
  }

  /* ---------- SOURCE CONTROL ---------- */
  function branchGraphSvg() {
    var g = VD.branchGraph;
    var colors = { main: "var(--pm-info)", agent: "var(--pm-accent)", docs: "var(--pm-rec)" };
    var edges = g.edges.map(function (e) {
      var a = g.nodes.filter(function (n) { return n.id === e[0]; })[0];
      var b = g.nodes.filter(function (n) { return n.id === e[1]; })[0];
      return '<line x1="' + (a.x + 8) + '" y1="' + (a.y + 8) + '" x2="' + (b.x + 8) + '" y2="' + (b.y + 8) + '" stroke="var(--pm-line)" stroke-width="1.5"/>';
    }).join("");
    var nodes = g.nodes.map(function (n) {
      return '<circle cx="' + (n.x + 8) + '" cy="' + (n.y + 8) + '" r="6" fill="' + colors[n.branch] + '"/>';
    }).join("");
    return '<svg viewBox="0 0 260 130" style="inline-size:100%;max-inline-size:420px;block-size:auto" role="img" aria-label="Branch graph: main, agent/settings-bakeoff merged, agent/docs-sweep">' + edges + nodes + "</svg>";
  }

  function renderScm(route) {
    var tab = route.tab || "worktrees";
    var body = "";
    if (tab === "worktrees") {
      var wt = VD.worktrees.map(function (w) {
        return '<div class="vlt-receipt"><div><div class="vlt-receipt-t pm-mono">' + esc(w.name) + "</div>" +
          '<div class="vlt-receipt-s">' + esc(w.path) + " · " + esc(w.state) + (w.ahead || w.behind ? " · +" + w.ahead + " −" + w.behind : "") + "</div></div>" +
          '<span class="vlt-hash">' + (w.ahead ? "active" : "clean") + "</span></div>";
      }).join("");
      body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Worktrees</h4></div>' + wt + "</div>" +
        '<div class="vlt-card"><div class="vlt-card-h"><h4>Graph</h4></div>' + branchGraphSvg() + "</div>" +
        '<div class="vlt-card"><div class="vlt-card-h"><h4>Changes and history</h4></div>' +
        '<p class="vlt-sub">14 changed files in the active worktree; history shows 22 commits this week. Compare and log surfaces open from here.</p></div>';
    } else if (tab === "policy") {
      body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Policy</h4></div><dl class="pm-kv">' +
        VD.scmPolicies.map(function (p) { return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>"; }).join("") + "</dl></div>" +
        V.rowHtml(DEMO.settings["sc.protect-main"]) + V.rowHtml(DEMO.settings["sc.test-before-merge"]) + V.rowHtml(DEMO.settings["sc.push-policy"]) + V.rowHtml(DEMO.settings["sc.force-push"]);
    } else if (tab === "tools") {
      var jjInstalled = PMStore.get("jjInstalled", false);
      body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Tool installation health</h4></div>' +
        VD.scmTools.map(function (t) {
          var installed = t.name === "Jujutsu" && jjInstalled;
          var h = V.HEALTH[installed ? "ready" : t.health] || { label: t.health, dot: "unknown" };
          var action = (t.health === "not-configured" && !installed)
            ? '<div class="pm-row-state"><button type="button" class="pm-btn" data-variant="primary" data-scm-install="' + esc(t.name) + '">' +
              "Install " + esc(t.name) + " on This PC · Windows native</button></div>"
            : '<div class="pm-row-state">' + V.healthDot(h.dot, installed ? "Installed" : t.state) + "</div>";
          return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">' + esc(t.name) + '</div>' +
            '<div class="pm-row-desc">' + esc(installed ? "Ready — installed from the official jj source (simulated); bookmarks and revisions available" : t.note) + "</div></div>" +
            '<div class="pm-row-control pm-mono" style="font-size:11.5px">' + esc(installed ? "0.23.0 · This PC · Windows native" : t.version + " · " + t.host) + "</div>" +
            action + "</div>";
        }).join("") + "</div>" + V.rowHtml(DEMO.settings["sc.lfs"]);
    }
    mgrShell({
      id: "scm", title: "Source Control and Worktrees",
      lede: "Changes, history, graph, worktrees, and exact tool health — Git and Jujutsu share one lifecycle.",
      tabs: [["worktrees", "Worktrees and graph"], ["policy", "Policy"], ["tools", "Tool health"]],
      tab: tab, body: body
    });
    root.querySelectorAll("[data-scm-install]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tool = btn.getAttribute("data-scm-install");
        if (tool === "Jujutsu") {
          PMStore.set("jjInstalled", true);
          PMStore.receipt("Jujutsu install simulated — the real flow uses the official jj source for the exact host, after your explicit consent", "ok");
        } else {
          PMStore.receipt(tool + " setup simulated — source-control tools use the shared lifecycle with contextual Install/Repair", "info");
        }
      });
    });
  }

  /* ---------- GITHUB ACTIONS ---------- */
  function renderGha(route) {
    var connected = PMStore.get("forgeConnected", false);
    var body = "";
    if (!connected) {
      body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Forge not connected</h4><span class="pm-badge" data-kind="state" data-icon data-state="not-configured">Setup required</span></div>' +
        '<p class="vlt-sub">' + esc(VD.ghaSetup.note) + "</p>" +
        '<ul>' + VD.ghaSetup.capabilities.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" +
        '<div><button type="button" class="pm-btn" data-variant="primary" data-forge-connect>Connect GitHub</button></div></div>';
    } else {
      body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Workflows</h4><span class="pm-badge" data-kind="scope">' + esc(VD.ghaConnected.account) + "</span></div>" +
        VD.ghaConnected.workflows.map(function (w) {
          return '<div class="vlt-receipt"><div><div class="vlt-receipt-t pm-mono">' + esc(w.name) + (w.pinned ? ' <span class="pm-badge" data-kind="scope">Pinned</span>' : "") + "</div>" +
            '<div class="vlt-receipt-s">' + esc(w.readiness) + " · " + esc(w.lastRun) + "</div></div>" +
            '<span style="display:flex;gap:6px"><button type="button" class="pm-btn" data-variant="quiet" data-gha="runs">Runs</button>' +
            '<button type="button" class="pm-btn" data-variant="quiet" data-gha="logs">Logs</button></span></div>';
        }).join("") + "</div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-gha="refresh">Refresh</button>' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-gha="starter">Create starter workflow</button></div>';
    }
    mgrShell({
      id: "gha", title: "GitHub Actions",
      lede: "Pinned workflows, current-branch readiness, and run browsing — behind an explicit forge connection.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
    var conn = root.querySelector("[data-forge-connect]");
    if (conn) conn.addEventListener("click", function () {
      PMStore.set("forgeConnected", true);
      PMStore.receipt("Forge connection simulated — device-flow sign-in would complete in the browser", "ok");
    });
    root.querySelectorAll("[data-gha]").forEach(function (b) {
      b.addEventListener("click", function () {
        var m = { runs: "Runs simulated — run and job browsing would open", logs: "Logs simulated — job logs stream here", refresh: "Refreshed (simulated)", starter: "Starter workflow simulated — ci.yml lands in a branch" };
        PMStore.receipt(m[b.getAttribute("data-gha")], "info");
      });
    });
  }

  /* ---------- CONTAINERS ---------- */
  function renderContainers(route) {
    var podmanInstalled = PMStore.get("podmanInstalled", false);
    var body = VD.containers.map(function (c, i) {
      var entry = c;
      if (c.name === "Podman" && podmanInstalled) {
        entry = { name: c.name, health: "ready", version: "Podman 5.2.2", host: "This PC · Windows native",
          detail: [["State", "Ready — installed via the official Podman source (simulated)"], ["Machine/socket", "npipe:////./pipe/podman-machine-default"], ["Registries", "docker.io (anonymous)"]] };
      }
      var h = V.HEALTH[entry.health] || { label: entry.health, dot: "unknown" };
      var action = (entry.name === "Podman" && !podmanInstalled)
        ? '<div style="margin-block-start:10px"><button type="button" class="pm-btn" data-variant="primary" data-ctr-install="Podman">Install from the official Podman source</button>' +
          '<span class="vlt-sub" style="margin-inline-start:10px">Consent first; PM manages the lifecycle after install.</span></div>'
        : "";
      return '<details class="pm-accordion"' + (i === 0 ? " open" : "") + '><summary>' + esc(entry.name) + " — " + esc(entry.version) + "</summary>" +
        '<div class="pm-accordion-body">' +
        V.healthDot(h.dot, entry.health === "ready" ? "Ready" : entry.health === "degraded" ? "Degraded" : "Not installed") +
        '<dl class="pm-kv" style="margin-block-start:8px">' + entry.detail.map(function (d) { return "<dt>" + esc(d[0]) + "</dt><dd>" + esc(d[1]) + "</dd>"; }).join("") + "</dl>" + action + "</div></details>";
    }).join("");
    mgrShell({
      id: "containers", title: "Containers and Registries",
      lede: "Docker, Podman, and Kubernetes as human top-level resources; detail expands in place. Typed unavailable states, shared tool lifecycle.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
    root.querySelectorAll("[data-ctr-install]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        PMStore.set("podmanInstalled", true);
        PMStore.receipt("Podman 5.2.2 install simulated — the real install runs the official Podman installer with your consent", "ok");
      });
    });
  }

  /* ---------- WEB / SEARCH / FETCH ---------- */
  function renderWeb(route) {
    var order = PMStore.get("webOrder", null) || VD.webProviders.map(function (w) { return w.name; });
    var sorted = VD.webProviders.slice().sort(function (a, b) { return order.indexOf(a.name) - order.indexOf(b.name); });
    var rows = sorted.map(function (w, idx) {
      var prio = idx + 1;
      return '<div class="vlt-receipt"><div><div class="vlt-receipt-t">' + esc(w.name) + ' <span class="pm-badge" data-kind="scope">Priority ' + prio + "</span></div>" +
        '<div class="vlt-receipt-s">' + esc(w.limits) + " · " + esc(w.credits) + "</div></div>" +
        '<span style="display:inline-flex;gap:6px;align-items:center">' +
        '<span class="pm-badge" data-kind="state" data-icon data-state="' + (w.readiness === "Ready" ? "default" : "effective-differs") + '">' + esc(w.readiness) + "</span>" +
        (idx > 0 ? '<button type="button" class="pm-btn" data-variant="quiet" data-web-up="' + esc(w.name) + '">Move up</button>' : "") +
        '<button type="button" class="pm-btn" data-variant="quiet" data-web-test="' + esc(w.name) + '"' + (w.readiness === "Ready" ? "" : " disabled") + ">Test fetch</button></span></div>";
    }).join("");
    var body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Providers and limits</h4></div>' + rows + "</div>" +
      '<div class="vlt-card"><div class="vlt-card-h"><h4>Policy</h4></div><dl class="pm-kv">' +
      VD.webPolicy.map(function (p) { return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>"; }).join("") + "</dl></div>";
    mgrShell({
      id: "web", title: "Web, Search, and Fetch",
      lede: "Provider priority, limits, credit guards, caches, sessions, proxies, certificates, air-gap behavior, and privacy.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
    root.querySelectorAll("[data-web-up]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cur = PMStore.get("webOrder", null) || VD.webProviders.map(function (w) { return w.name; });
        var i = cur.indexOf(btn.getAttribute("data-web-up"));
        if (i > 0) { var t = cur[i - 1]; cur[i - 1] = cur[i]; cur[i] = t; }
        PMStore.set("webOrder", cur);
        PMStore.receipt(btn.getAttribute("data-web-up") + " moved to Priority " + i + " — routing order updated for this demo", "ok");
      });
    });
    root.querySelectorAll("[data-web-test]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        PMStore.receipt("Fetch test via " + btn.getAttribute("data-web-test") + " simulated — answered from cache; no credits spent", "info");
      });
    });
  }

  /* ---------- PROJECT SEARCH INDEX ---------- */
  function renderSearchIndex(route) {
    var rebuild = PMStore.get("indexRebuild", null);
    var facts = VD.searchIndexFacts.map(function (f) { return "<dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd>"; }).join("");
    var body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Index</h4></div><dl class="pm-kv">' + facts + "</dl>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn" data-variant="primary" data-idx-rebuild>Rebuild index</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-idx-clear>Clear cache</button></div></div>' +
      (rebuild
        ? '<div class="vlt-card"><div class="vlt-card-h"><h4>Rebuild</h4></div>' +
          V.operationHtml({
            id: "idx-rebuild", title: "Project search index rebuild",
            phase: rebuild.phase, state: "running",
            progressKind: "determinate", completed: rebuild.completed, total: rebuild.total, unit: "files",
            source: "simulated", canCancel: true
          }) + "</div>"
        : "");
    mgrShell({
      id: "searchindex", title: "Project Search Index",
      lede: "Enablement, exclusions, size and symlink policy, disk use, remote cache, and truthful rebuild phases.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
    var cancelBtn = root.querySelector('[data-op-cancel="idx-rebuild"]');
    if (cancelBtn) cancelBtn.addEventListener("click", function () {
      if (window.__vltIdxTimer) { window.clearInterval(window.__vltIdxTimer); window.__vltIdxTimer = null; }
      PMStore.set("indexRebuild", null);
      PMStore.receipt("Rebuild cancelled — the previous index stays live; nothing was half-written (simulated)", "warn");
    });
    root.querySelector("[data-idx-rebuild]").addEventListener("click", function () {
      /* Determinate progress with a real denominator (files), truthful
         phases, visible source, cancellable — ObservableWork grammar. */
      var phases = [
        { phase: "Scanning", completed: 3051, total: 12204 },
        { phase: "Indexing", completed: 8543, total: 12204 },
        { phase: "Verifying", completed: 11594, total: 12204 },
        { phase: "Done", completed: 12204, total: 12204 }
      ];
      var i = 0;
      PMStore.set("indexRebuild", phases[0]);
      if (window.__vltIdxTimer) window.clearInterval(window.__vltIdxTimer);
      window.__vltIdxTimer = window.setInterval(function () {
        i++;
        if (i >= phases.length) {
          window.clearInterval(window.__vltIdxTimer);
          window.__vltIdxTimer = null;
          PMStore.set("indexRebuild", null);
          PMStore.receipt("Rebuild simulated — 3 binary files skipped, logged as before", "ok");
          return;
        }
        PMStore.set("indexRebuild", phases[i]);
      }, 1100);
    });
    root.querySelector("[data-idx-clear]").addEventListener("click", function () {
      PMStore.receipt("Cache clear simulated — 212 MB would free; the index rebuilds lazily", "warn");
    });
  }

  /* ---------- WORKSPACE CLEANUP ---------- */
  function renderCleanup(route) {
    var done = PMStore.get("cleanupDone", false);
    var rows = VD.cleanupPlan.map(function (c) {
      return '<div class="vlt-receipt"><div><div class="vlt-receipt-t">' + esc(c.item) + "</div>" +
        '<div class="vlt-receipt-s">' + esc(c.size) + "</div></div>" +
        '<span class="pm-badge" data-kind="state" data-icon data-state="' + (c.safe ? "default" : "managed") + '">' + esc(c.action) + "</span></div>";
    }).join("");
    var body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Dry-run plan</h4><span class="pm-badge" data-kind="scope">2.7 GB reclaimable</span></div>' +
      '<p class="vlt-sub">Cleanup always proposes a dry-run plan first. Build outputs are disposable; unmerged work and recovery snapshots are never touched; evidence is retained.</p>' + rows + "</div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn" data-variant="primary" data-clean-run>Run safe cleanup</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-clean-rollback>Roll back the last cleanup</button></div>' +
      (done ? '<p class="vlt-sub">Cleanup simulated complete — 2.1 GB reclaimed, 4 receipts written. Rollback stays available for the retention window.</p>' : "");
    mgrShell({
      id: "cleanup", title: "Workspace Cleanup",
      lede: "Dry-run first, exclusions honored, worktree-safe, evidence retained, rollback with receipts.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
    root.querySelector("[data-clean-run]").addEventListener("click", function () {
      PMStore.set("cleanupDone", true);
      PMStore.receipt("Cleanup simulated — only entries marked Remove were touched", "ok");
    });
    root.querySelector("[data-clean-rollback]").addEventListener("click", function () {
      PMStore.set("cleanupDone", false);
      PMStore.receipt("Rollback simulated — the last cleanup's receipts drive the restore", "info");
    });
  }

  /* ---------- FUTURE SERVER MODULE SHELL ---------- */
  function renderServers(route) {
    var body = '<div class="vlt-card"><div class="vlt-card-h"><h4>Reserved insertion points</h4><span class="pm-badge" data-kind="scope">Deferred modules</span></div>' +
      '<p class="vlt-sub">' + esc(VD.serverShellNote) + "</p></div>" +
      '<div class="vlt-server-grid">' + VD.serverShell.map(function (s) {
        return '<div class="vlt-server"><div class="vlt-server-t">' + esc(s.name) + ' <span class="pm-badge" data-kind="state" data-icon data-state="not-configured">' + esc(s.state) + "</span></div>" +
          '<div class="vlt-server-line">' + esc(s.line) + "</div>" +
          '<div class="vlt-server-owner">Canonical owner: ' + esc(s.owner) + " · accepts manager module, deep links, status cards, command wiring</div></div>";
      }).join("") + "</div>";
    mgrShell({
      id: "servers", title: "Servers and Hosting",
      lede: "The future home of server modules. Human language, named owners, explicit insertion contracts — no invented state machines.",
      tabs: [["overview", "Overview"]], tab: "overview", body: body
    });
  }

  /* ---------- router ---------- */
  function render(route, fromNav) {
    if (spy) { spy.detach(); spy = null; }
    currentRoute = route;
    if (route.view === "manager" && PMStore.get("slowHydration", false)) {
      PMStore.set("slowHydration", false);
      var hydMeta = ((VD.managerMeta || DEMO.managerMeta || {})[route.manager]) || { title: "Manager" };
      mgrShell({ id: route.manager, title: hydMeta.title, lede: "", tabs: [], tab: "",
        body: V.operationHtml({ id: "hydrate", title: "Hydrating " + hydMeta.title, phase: "Loading domain state", state: "starting", progressKind: "none", source: "simulated", waitReason: "Compact summaries stayed usable — the full manager hydrates on demand, never at Settings open" }) });
      window.setTimeout(function () { render(route, false); }, 900);
      return;
    }
    if (route.view === "manager") {
      if (route.manager === "providers") return renderProviders(route);
      if (route.manager === "storage") return renderStorage(route);
      if (route.manager === "backup") return renderBackup(route);
      if (route.manager === "lifecycle") return renderLifecycle(route);
      if (route.manager === "history") return renderHistory(route);
      if (route.manager === "artifacts") return renderArtifacts(route);
      if (route.manager === "scm") return renderScm(route);
      if (route.manager === "gha") return renderGha(route);
      if (route.manager === "containers") return renderContainers(route);
      if (route.manager === "web") return renderWeb(route);
      if (route.manager === "searchindex") return renderSearchIndex(route);
      if (route.manager === "cleanup") return renderCleanup(route);
      if (route.manager === "servers") return renderServers(route);
      root.innerHTML = '<div class="vlt-home"><div class="vlt-home-inner"><div class="pm-empty" style="margin-block-start:60px"><div class="pm-empty-title">This manager belongs to another concept</div><div class="pm-empty-guidance">Vault demonstrates the twelve storage-and-lifecycle families plus Providers. The coverage matrix records the rest as shared grammar.</div></div></div></div>';
      return;
    }
    if (route.view === "category") return renderWorkspace(route, fromNav);
    renderHome();
  }

  /* ---------- demo drawer ---------- */
  function buildDemoDrawer() {
    var list = document.getElementById("vlt-demo-list");
    var concept = VD.demoScenarios.map(function (s) {
      return '<button type="button" class="pm-btn" data-demo="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
    var prov = V.PROVIDER_SCENARIOS.map(function (s) {
      return '<button type="button" class="pm-btn" data-prov-scenario="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
    list.innerHTML = '<div class="vlt-demo-group">Vault states</div>' + concept +
      '<div class="vlt-demo-group">Provider scenarios</div>' + prov;
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
    if (id === "import-preview") {
      PMStore.set("lifecycle", { step: 1, applied: false, rolledBack: false });
      navigate({ manager: "lifecycle", tab: "transfer" });
      return;
    }
    if (id === "import-apply") {
      PMStore.set("lifecycle", { step: VD.lifecycleSteps.length - 1, applied: true, rolledBack: false });
      navigate({ manager: "lifecycle", tab: "transfer" });
      PMStore.receipt("Import simulated — applied, verified, receipted; roll back from the receipt card", "ok");
      return;
    }
    if (id === "copy-from") { navigate({ manager: "lifecycle", tab: "copy" }); return; }
    if (id === "connect-forge") {
      navigate({ manager: "gha", tab: "overview" });
      window.setTimeout(function () {
        var b = document.querySelector("[data-forge-connect]");
        if (b) b.click();
      }, 350);
      return;
    }
    if (id === "index-rebuild") {
      navigate({ manager: "searchindex", tab: "overview" });
      window.setTimeout(function () {
        var b = document.querySelector("[data-idx-rebuild]");
        if (b) b.click();
      }, 350);
      return;
    }
    if (id === "cleanup-dry-run") { navigate({ manager: "cleanup", tab: "overview" }); return; }
    if (id === "backup-now") {
      navigate({ manager: "backup", tab: "overview" });
      window.setTimeout(function () {
        var b = document.querySelector("[data-backup-now]");
        if (b) b.click();
      }, 350);
      return;
    }
    if (id === "test-restore") {
      navigate({ category: "system", sub: "backups", setting: "system.test-restore" });
      PMStore.receipt("Test restore simulated — the snapshot restored cleanly in a scratch area", "ok");
      return;
    }
    if (id === "changed-elsewhere") {
      V.setChanged("system.snapshot-frequency", "set to Hourly in another window at 10:02");
      navigate({ category: "system", sub: "backups", setting: "system.snapshot-frequency" });
      PMStore.receipt("Scenario applied — Snapshot frequency shows the changed-elsewhere bar", "info");
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
      root.classList.toggle("vlt-squeezed", entries[0].contentRect.width <= 900);
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
      drawer: document.getElementById("vlt-demo"),
      scrim: document.getElementById("vlt-scrim")
    });
    wireSqueezeFallback();
    renderInbox();
    /* Domain-local refresh (Performance register §7.3 narrow deltas, §20.2):
       repaint only the surface that owns the changed key; every other
       surface renders fresh on entry. */
    var KEY_DOMAIN = Object.assign({}, V.SHARED_KEY_DOMAINS, {
      "dismissedNotices": "notices", "calmDemo": "notices",
      "backups": "manager:backup", "cleanupDone": "manager:cleanup",
      "forgeConnected": "manager:gha", "history": "manager:history", "indexRebuild": "manager:searchindex",
      "lifecycle": "manager:lifecycle", "podmanInstalled": "manager:containers", "webOrder": "manager:web",
      "jjInstalled": "manager:scm"
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
