/* ============================================================================
   Concept 02 — Constellation · Command-center IA
   The query is the home. Workspaces dock the query in the header, switch
   categories from a segmented destination bar, and drive a section minimap
   as the scrollspy instrument. Managers: Providers (mission surface),
   Context & Instructions, Terminal (live preview).
   ========================================================================== */
(function () {
  "use strict";

  var DEMO = window.PM_SETTINGS_DEMO;
  var V = window.PMViews;
  var esc = V.esc;

  PMStore.seed({
    overrides: {},
    dismissedNotices: [],
    calmDemo: false,
    providers: V.clone(DEMO.providers),
    roles: V.clone(DEMO.roles),
    terminal: V.clone(DEMO.terminal),
    spell: {
      ignored: [],
      personal: DEMO.spellcheck.personalDictionary.slice(),
      project: DEMO.spellcheck.projectDictionary.slice()
    }
  });
  PMStore.init("constellation");

  var INDEX = PMSearch.buildIndex(DEMO);
  var root = document.getElementById("cl-root");

  var view = { name: "home" };
  var spy = null;
  var openAdv = {};
  var resetArmed = null;
  var openFams = {};     /* provider expansion state */
  var sheetPid = null;   /* provider shown in the side sheet */

  var MANAGERS = { providers: true, context: true, terminal: true };
  var MANAGER_CATEGORY = { terminal: "code", crew: "collaboration", media: "media", lsp: "code", skills: "tools", tools: "tools", commands: "tools", personas: "providers", context: "context", memory: "context", mcp: "tools", spellcheck: "appearance" };

  function catById(id) {
    for (var i = 0; i < DEMO.categories.length; i++) if (DEMO.categories[i].id === id) return DEMO.categories[i];
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* navigation                                                          */
  /* ------------------------------------------------------------------ */

  function navigate(target) {
    var t = target || {};
    if (t.manager === "usage") {
      view = { name: "manager", id: "providers", pid: null, tab: "usage" };
    } else if (t.manager && MANAGERS[t.manager]) {
      view = { name: "manager", id: t.manager, focusSetting: t.setting || null };
    } else if (t.manager && MANAGER_CATEGORY[t.manager]) {
      view = { name: "workspace", cat: MANAGER_CATEGORY[t.manager], focusSub: t.sub || null, focusSetting: t.setting || null };
    } else if (t.category) {
      view = { name: "workspace", cat: t.category, focusSub: t.sub || null, focusSetting: t.setting || null };
    } else if (t.manager) {
      var owning = null;
      DEMO.categories.forEach(function (c) { if (c.manager === t.manager) owning = c.id; });
      view = owning ? { name: "workspace", cat: owning, focusSub: t.sub || null, focusSetting: t.setting || null } : { name: "home" };
    } else {
      view = { name: "home" };
    }
    render();
  }

  function onSearchPick(result) {
    if (result.kind === "action") {
      if (/reset demo/i.test(result.title)) { PMStore.resetDemo(); PMStore.receipt("Demo data reset to its seeded state", "ok"); }
      else if (/settings home/i.test(result.title)) { view = { name: "home" }; render(); }
      else { view = { name: "manager", id: "providers" }; render(); }
      return;
    }
    navigate(result.target);
  }

  /* ------------------------------------------------------------------ */
  /* HOME                                                                */
  /* ------------------------------------------------------------------ */

  var VERB = { attention: "Fix", setup: "Resume", recommended: "Review" };

  function verbsHtml() {
    var dismissed = PMStore.get("dismissedNotices", []);
    var list = DEMO.notices.filter(function (n) { return dismissed.indexOf(n.id) === -1; });
    if (PMStore.get("calmDemo", false) || !list.length) {
      return '<div class="cl-calm">' + V.icon("check") + "<div><b>Clear skies.</b> Nothing needs a decision — the command field is still the fastest way anywhere.</div></div>";
    }
    var order = { attention: 0, setup: 1, recommended: 2 };
    list.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    return list.map(function (n) {
      var kindLabel = n.kind === "attention" ? "Needs attention" : n.kind === "setup" ? "Continue setup" : "Recommended";
      return '<div class="cl-verb" data-kind="' + esc(n.kind) + '">' +
        '<span class="txt"><span class="headline">' + esc(n.headline) + '</span><span class="why">' + esc(n.consequence) + "</span></span>" +
        '<button type="button" class="pm-btn" data-variant="primary" data-verb="' + esc(n.id) + '">' + esc(VERB[n.kind]) + "</button>" +
        '<button type="button" class="pm-btn" data-variant="quiet" data-verb-dismiss="' + esc(n.id) + '">Dismiss</button>' +
        '<span class="pm-notice-chip">' + kindLabel + "</span>" +
        "</div>";
    }).join("");
  }

  function cardsHtml() {
    return DEMO.categories.map(function (c) {
      return '<button type="button" class="cl-card" data-cat="' + esc(c.id) + '">' +
        '<span class="top">' + V.icon(c.icon) + '<span class="name">' + esc(c.title) + "</span></span>" +
        '<span class="purpose">' + esc(c.purpose) + "</span>" +
        '<span class="status">' + esc(c.statusSummary) + "</span>" +
        '<span class="open">Open ' + V.icon("chevron") + "</span>" +
        "</button>";
    }).join("");
  }

  function homeHtml() {
    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" class="cl-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";
    }).join("");
    return '<div class="cl-home"><div class="cl-home-core">' +
      '<div class="cl-eyebrow">Concept 02 · Constellation — the query is the home <span class="cl-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      '<div class="cl-cmd">' + V.icon("search") +
      '<input id="cl-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Ask for any setting, manager, or action">' +
      "<kbd>/</kbd></div>" +
      '<div class="cl-hits" id="cl-hits" role="listbox" aria-label="Search results" hidden></div>' +
      '<div class="cl-home-body" id="cl-home-body">' +
      '<section style="display:grid;gap:10px"><h2 class="cl-h2">Decisions waiting</h2><div class="cl-verbs">' + verbsHtml() + "</div></section>" +
      '<section style="display:grid;gap:10px"><h2 class="cl-h2">Destinations</h2><div class="cl-cards">' + cardsHtml() + "</div></section>" +
      '<section style="display:grid;gap:6px"><h2 class="cl-h2">Jump back in</h2><div>' + recents + "</div></section>" +
      '<section style="display:flex;gap:12px;flex-wrap:wrap;border-top:1px solid var(--pm-line);padding-top:14px">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="cl-calm-toggle">Toggle calm state (demo)</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="cl-reset">Reset demo data</button>' +
      '<span class="pm-faint" style="font-size:11.5px">Command-center IA: the whole page answers the query.</span>' +
      "</section>" +
      "</div></div></div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    var input = document.getElementById("cl-search");
    var hits = document.getElementById("cl-hits");
    var body = document.getElementById("cl-home-body");
    V.wireSearch({
      input: input, listEl: hits, index: INDEX,
      onPick: onSearchPick,
      onOpen: function () { body.classList.add("is-querying"); },
      onClose: function () { body.classList.remove("is-querying"); }
    });
    input.focus();
    root.querySelectorAll("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        view = { name: "workspace", cat: b.getAttribute("data-cat"), focusSub: null, focusSetting: null };
        render();
      });
    });
    root.querySelectorAll("[data-recent]").forEach(function (b) {
      b.addEventListener("click", function () { navigate(DEMO.recents[parseInt(b.getAttribute("data-recent"), 10)].target); });
    });
    root.querySelectorAll("[data-verb]").forEach(function (b) {
      b.addEventListener("click", function () {
        var n = DEMO.notices.filter(function (x) { return x.id === b.getAttribute("data-verb"); })[0];
        if (n) navigate(n.target);
      });
    });
    root.querySelectorAll("[data-verb-dismiss]").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = PMStore.get("dismissedNotices", []).slice();
        d.push(b.getAttribute("data-verb-dismiss"));
        PMStore.set("dismissedNotices", d);
      });
    });
    document.getElementById("cl-calm-toggle").addEventListener("click", function () {
      PMStore.set("calmDemo", !PMStore.get("calmDemo", false));
    });
    document.getElementById("cl-reset").addEventListener("click", function () {
      PMStore.resetDemo();
      PMStore.receipt("Demo data reset to its seeded state", "ok");
    });
  }

  /* ------------------------------------------------------------------ */
  /* WORKSPACE                                                           */
  /* ------------------------------------------------------------------ */

  function rowsFor(sub) {
    var standard = [], advanced = [];
    sub.settings.forEach(function (sid) {
      var s = DEMO.settings[sid];
      if (!s) return;
      if (s.exposure === "standard" || s.exposure === "managed" || s.exposure === "unavailable") standard.push(s);
      else advanced.push(s);
    });
    var html = standard.map(function (s) { return V.rowHtml(s); }).join("");
    if (advanced.length) {
      html += '<details class="cl-adv"' + (openAdv[sub.id] ? " open" : "") + ' data-adv="' + esc(sub.id) + '"><summary>Show ' +
        advanced.length + " advanced, expert, or diagnostic options</summary><div class=\"cl-adv-body\">" +
        advanced.map(function (s) { return V.rowHtml(s); }).join("") + "</div></details>";
    }
    return html;
  }

  function workspaceHtml(cat) {
    var spaces = DEMO.categories.map(function (c) {
      return '<button type="button" class="cl-space" data-space="' + esc(c.id) + '" aria-current="' + (c.id === cat.id) + '">' +
        V.icon(c.icon) + esc(c.title) + "</button>";
    }).join("");
    var spaceOpts = DEMO.categories.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === cat.id ? " selected" : "") + ">" + esc(c.title) + "</option>";
    }).join("");
    var sections = cat.subcategories.map(function (sub) {
      return '<section class="cl-sec" id="sec-' + esc(sub.id) + '"><h2>' + esc(sub.title) + '</h2><p class="sum">' + esc(sub.summary) + "</p>" + rowsFor(sub) + "</section>";
    }).join("");
    var ticks = cat.subcategories.map(function (sub) {
      return '<button type="button" class="cl-tick" data-tick="' + esc(sub.id) + '" aria-label="Jump to ' + esc(sub.title) + '"><span class="bar"></span><span class="lbl">' + esc(sub.title) + "</span></button>";
    }).join("");
    var spell = cat.id === "appearance" ? '<section class="cl-sec" id="sec-spellcheck-demo"><h2>Spellcheck, live</h2><p class="sum">The shared writing service on a draft — it never changes text by itself.</p><div id="cl-spell"></div></section>' : "";
    return '<div class="cl-ws">' +
      '<div class="cl-ws-head">' +
      '<button type="button" class="pm-btn cl-back" data-variant="quiet" id="cl-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Home</button>' +
      '<span class="cl-ws-searchwrap"><span class="cl-cmd">' + V.icon("search") +
      '<input id="cl-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></span>' +
      '<span class="cl-hits" id="cl-ws-hits" role="listbox" hidden></span></span>' +
      '<div class="cl-spaces" role="tablist" aria-label="Destinations">' + spaces + "</div>" +
      '<span class="pm-select cl-space-select"><select id="cl-space-select" aria-label="Destination">' + spaceOpts + "</select></span>" +
      '<button type="button" class="pm-btn" data-variant="quiet" id="cl-cat-reset">Reset place</button>' +
      (cat.manager ? '<button type="button" class="pm-btn" id="cl-open-mgr">' + esc(DEMO.managerMeta[cat.manager].title) + " manager</button>" : "") +
      "</div>" +
      '<div class="cl-ws-body">' +
      '<div class="cl-doc" id="cl-doc">' +
      '<div class="cl-crumb"><b>' + esc(cat.title) + '</b> <span aria-hidden="true">›</span> <span id="cl-crumb-sub">' + esc(cat.subcategories[0] ? cat.subcategories[0].title : "") + "</span></div>" +
      sections + spell + "</div>" +
      '<div class="cl-map" id="cl-map" aria-label="Section map">' + ticks + "</div>" +
      "</div></div>";
  }

  function renderWorkspace() {
    var cat = catById(view.cat) || DEMO.categories[0];
    root.innerHTML = workspaceHtml(cat);
    var doc = document.getElementById("cl-doc");

    root.querySelectorAll("[data-space]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-space");
        if (id !== cat.id) { view = { name: "workspace", cat: id, focusSub: null, focusSetting: null }; render(); }
      });
    });
    document.getElementById("cl-space-select").addEventListener("change", function (ev) {
      view = { name: "workspace", cat: ev.target.value, focusSub: null, focusSetting: null };
      render();
    });
    root.querySelectorAll("[data-tick]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sec = document.getElementById("sec-" + b.getAttribute("data-tick"));
        if (sec) PMSpy.jumpTo(sec, { root: doc });
      });
    });

    V.wireSearch({
      input: document.getElementById("cl-ws-search"),
      listEl: document.getElementById("cl-ws-hits"),
      index: INDEX,
      onPick: onSearchPick
    });

    var sections = cat.subcategories.map(function (sub) { return document.getElementById("sec-" + sub.id); }).filter(Boolean);
    spy = PMSpy.attach({
      root: doc,
      sections: sections,
      offsetPx: 80,
      onActive: function (id) {
        var sub = id.replace(/^sec-/, "");
        root.querySelectorAll("[data-tick]").forEach(function (t) {
          t.setAttribute("aria-current", String(t.getAttribute("data-tick") === sub));
        });
        var subObj = null;
        cat.subcategories.forEach(function (s) { if (s.id === sub) subObj = s; });
        var crumb = document.getElementById("cl-crumb-sub");
        if (crumb && subObj) crumb.textContent = subObj.title;
      }
    });

    doc.querySelectorAll(".cl-adv").forEach(function (d) {
      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });
    });

    document.getElementById("cl-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    var mgrBtn = document.getElementById("cl-open-mgr");
    if (mgrBtn) mgrBtn.addEventListener("click", function () {
      if (MANAGERS[cat.manager]) { view = { name: "manager", id: cat.manager }; render(); }
      else PMStore.receipt("The " + DEMO.managerMeta[cat.manager].title + " manager is realized richly in another concept of this bakeoff; its settings live inline here", "info");
    });

    var resetBtn = document.getElementById("cl-cat-reset");
    resetBtn.addEventListener("click", function () {
      if (resetArmed === cat.id) {
        var ov = V.overrides();
        cat.subcategories.forEach(function (sub) { sub.settings.forEach(function (sid) { delete ov[sid]; }); });
        PMStore.set("overrides", ov);
        PMStore.receipt(cat.title + " reset to defaults", "ok");
        resetArmed = null;
      } else {
        resetArmed = cat.id;
        resetBtn.textContent = "Click again to confirm";
        window.setTimeout(function () {
          if (resetArmed === cat.id) { resetArmed = null; resetBtn.textContent = "Reset place"; }
        }, 2600);
      }
    });

    if (cat.id === "appearance") V.mountSpellcheck(document.getElementById("cl-spell"), {});

    if (view.focusSetting) {
      var row = document.getElementById("row-" + view.focusSetting);
      if (row) {
        var adv = row.closest(".cl-adv");
        if (adv && !adv.open) { adv.open = true; openAdv[adv.getAttribute("data-adv")] = true; }
        PMSpy.jumpTo(row, { root: doc });
      }
      view.focusSetting = null;
    } else if (view.focusSub) {
      var sec = document.getElementById("sec-" + view.focusSub);
      if (sec) PMSpy.jumpTo(sec, { root: doc });
      view.focusSub = null;
    }
  }

  /* ------------------------------------------------------------------ */
  /* PROVIDERS — mission surface                                         */
  /* ------------------------------------------------------------------ */

  function boardHtml() {
    var ps = V.providers();
    var ready = 0, attention = 0, modelsAvail = 0, worst = "low";
    var rank = { low: 0, unknown: 0, medium: 1, high: 2 };
    ps.forEach(function (p) {
      var st = V.providerStatus(p);
      if (st.dot === "ok") ready++;
      if (st.dot === "danger" || st.dot === "warn") attention++;
      p.models.forEach(function (m) { if (!m.unavailableReason) modelsAvail++; });
      if (p.usageSnapshot && rank[p.usageSnapshot.pressure] > rank[worst]) worst = p.usageSnapshot.pressure;
    });
    var stale = ps.filter(function (p) { return p.catalog.refreshing; }).length;
    function tile(k, v, s) { return '<div class="cl-tile"><span class="k">' + k + '</span><span class="v">' + v + '</span><span class="s">' + s + "</span></div>"; }
    return '<div class="cl-board">' +
      tile("Routes ready", ready + " of " + ps.length, attention ? attention + " need attention" : "all healthy") +
      tile("Models available", modelsAvail, "across every connected family") +
      tile("Usage pressure", worst === "high" ? "High" : worst === "medium" ? "Medium" : "Low", "OpenAI included usage is exhausted") +
      tile("Catalogs", stale ? "Refreshing" : "Fresh", stale ? "last-known-good rows stay visible" : "models.dev and provider feeds current") +
      "</div>";
  }

  function famHtml(p) {
    var st = V.providerStatus(p);
    var open = !!openFams[p.id];
    var act = V.activeAccount(p);
    var body = "";
    if (open) {
      body = '<div class="cl-fam-body">' +
        "<h4>Accounts and connections</h4>" +
        (p.installState === "not-installed"
          ? '<div class="pm-empty"><div class="pm-empty-title">Not installed</div><div class="pm-empty-guidance">' + esc(p.diagnostics[0]) + '</div><button type="button" class="pm-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">Install</button></div>'
          : (p.accounts.length ? p.accounts.map(function (a) { return V.accountRowHtml(p, a); }).join("") : '<div class="pm-empty"><div class="pm-empty-title">Signed out</div><div class="pm-empty-guidance">The CLI is installed but no login exists in its isolated profile.</div><button type="button" class="pm-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button></div>')) +
        (p.accountSwitchNote ? '<p class="cl-mgr-note">' + esc(p.accountSwitchNote) + "</p>" : "") +
        "<h4>Models</h4>" + V.catalogHtml(p) +
        p.models.map(function (m) { return V.modelRowHtml(p, m); }).join("") +
        '<button type="button" class="pm-btn" data-variant="quiet" data-sheet="' + esc(p.id) + '">Open the full brief</button>' +
        "</div>";
    }
    return '<div class="cl-fam" data-open="' + open + '">' +
      '<button type="button" class="cl-fam-head" data-fam="' + esc(p.id) + '" aria-expanded="' + open + '">' +
      V.healthDot(st.dot, st.label) +
      '<span class="name">' + esc(p.name) + "</span>" +
      '<span class="meta">' + esc(V.GROUP_LABEL[p.connectionGroup]) + "</span>" +
      '<span class="meta">' + esc(act ? act.label : "No active account") + "</span>" +
      '<span class="meta">' + p.models.length + " models</span>" +
      '<span class="chev">' + V.icon("chevron") + "</span></button>" + body + "</div>";
  }

  function sheetHtml(p) {
    return '<div class="cl-sheet" role="dialog" aria-label="' + esc(p.name) + ' brief">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><h2 style="margin:0;font-size:16px">' + esc(p.name) + '</h2><span style="flex:1"></span>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="cl-sheet-close">Close</button></div>' +
      '<p class="cl-mgr-note">' + esc(p.tagline) + "</p>" +
      '<h4 style="margin:14px 0 6px">At a glance</h4>' + V.healthDot(V.providerStatus(p).dot, V.providerStatus(p).label) +
      '<dl class="pm-kv" style="margin-top:10px">' +
      "<dt>Sign-in ownership</dt><dd>" + esc(V.AUTH_MODEL[p.authModel] || "—") + "</dd>" +
      "<dt>Plan and billing</dt><dd>" + esc(p.product.plan) + " · " + esc(p.product.billingRoute) + "</dd>" +
      "<dt>Routing</dt><dd>Priority " + p.routing.priority + " · " + (p.routing.useNextOnExhaust ? "uses the next route when exhausted" : "stops when exhausted") + " · " + esc(p.routing.continuation) + "</dd>" +
      "</dl>" +
      '<h4 style="margin:16px 0 6px">Usage snapshot</h4>' + V.usageHtml(p) +
      '<h4 style="margin:16px 0 6px">Routing</h4>' + V.routingHtml(p) +
      '<h4 style="margin:16px 0 6px">Diagnostics</h4>' + V.diagnosticsHtml(p) +
      "</div>";
  }

  function renderProviders() {
    var groups = ["installed-tools", "connected-accounts", "api", "server", "free"];
    var byGroup = {};
    V.providers().forEach(function (p) { (byGroup[p.connectionGroup] = byGroup[p.connectionGroup] || []).push(p); });
    var fams = groups.filter(function (g) { return byGroup[g]; }).map(function (g) {
      return '<h2 class="cl-h2" style="margin-top:6px">' + esc(V.GROUP_LABEL[g]) + "</h2>" +
        '<div style="display:grid;gap:10px">' + byGroup[g].map(famHtml).join("") + "</div>";
    }).join("");
    root.innerHTML = '<div class="cl-mgr"><div class="cl-mgr-inner">' +
      '<div class="cl-eyebrow">Mission surface <span class="cl-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn cl-back" data-variant="quiet" id="cl-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Home</button>' +
      '<h1 style="margin:0;font-size:20px">Providers</h1>' +
      '<span class="pm-faint" style="font-size:12px">Every route, its health, and what happens next</span><span style="flex:1"></span>' +
      '<span class="cl-ws-searchwrap"><span class="cl-cmd" style="padding:0 12px">' + V.icon("search") +
      '<input id="cl-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings" style="font-size:12.5px;padding:8px 0"></span>' +
      '<span class="cl-hits" id="cl-ws-hits" role="listbox" hidden></span></span>' +
      "</div>" +
      boardHtml() + fams +
      '<h2 class="cl-h2" style="margin-top:6px">Agent role assignments</h2>' +
      '<div class="pm-panel">' + V.rolesHtml(PMStore.get("roles", [])) + "</div>" +
      '<p class="cl-mgr-note">Background and bounded jobs may use other eligible routes; user-facing planning and discussion stay on quality-guarded routes.</p>' +
      '<p class="cl-mgr-note">Provider, account, connection, product, and model are separate things here. A fresh catalog proves neither entitlement nor invocation.</p>' +
      "</div>" + (sheetPid ? sheetHtml(V.providerById(sheetPid)) : "") + "</div>";

    document.getElementById("cl-back").addEventListener("click", function () { view = { name: "home" }; sheetPid = null; render(); });
    V.wireSearch({ input: document.getElementById("cl-ws-search"), listEl: document.getElementById("cl-ws-hits"), index: INDEX, onPick: function (r) { sheetPid = null; onSearchPick(r); } });
    root.querySelectorAll("[data-fam]").forEach(function (b) {
      b.addEventListener("click", function () {
        openFams[b.getAttribute("data-fam")] = !openFams[b.getAttribute("data-fam")];
        render();
      });
    });
    root.querySelectorAll("[data-sheet]").forEach(function (b) {
      b.addEventListener("click", function () { sheetPid = b.getAttribute("data-sheet"); render(); });
    });
    var close = document.getElementById("cl-sheet-close");
    if (close) close.addEventListener("click", function () { sheetPid = null; render(); });
  }

  /* ------------------------------------------------------------------ */
  /* CONTEXT & INSTRUCTIONS MANAGER                                      */
  /* ------------------------------------------------------------------ */

  function renderContext() {
    var instructionSettings = ["context.include-project-instructions", "context.include-handoff", "context.include-journal", "context.use-previous-chats", "context.use-logs", "context.compaction-auto", "context.warn-route-changes"];
    var controls = instructionSettings.map(function (sid) {
      var s = DEMO.settings[sid];
      return s ? V.rowHtml(s) : "";
    }).join("");
    var ledger = DEMO.contextSources.map(function (src) {
      return '<div class="cl-ledger-row">' +
        '<span class="pm-badge" data-kind="state" data-icon data-state="' + (src.admittedLastTurn ? "auto" : "not-configured") + '">' + (src.admittedLastTurn ? "Admitted" : "Omitted") + "</span>" +
        '<span><span class="what">' + esc(src.label) + '</span><br><span class="why">' + esc(src.detail) + '</span><br><span class="prov">' + esc(src.provenance) + "</span></span>" +
        '<span class="pm-badge" data-kind="scope">' + esc(src.kind) + "</span></div>";
    }).join("");
    root.innerHTML = '<div class="cl-mgr"><div class="cl-mgr-inner">' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn cl-back" data-variant="quiet" id="cl-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Home</button>' +
      '<h1 style="margin:0;font-size:20px">Context and instructions</h1>' +
      '<span class="pm-faint" style="font-size:12px">What enters each request, and why</span></div>' +
      '<p class="cl-mgr-note">Durable breadth, narrow turn context: Puppet Master can retain everything without sending everything. FileSafe, permissions, routing, and budgets are enforced outside the model — not repeated as prompt prose.</p>' +
      '<div class="pm-panel"><h3 class="pm-panel-h">Normal controls</h3>' + controls + "</div>" +
      '<div class="pm-panel"><h3 class="pm-panel-h">Last turn, source by source</h3>' + ledger + "</div>" +
      '<details class="cl-adv"' + (openAdv.ctxAdvanced ? " open" : "") + ' data-adv="ctxAdvanced"><summary>Advanced — hashes, excerpts, and compaction strategy</summary><div class="cl-adv-body">' +
      '<div class="pm-logs"><div class="pm-log-line">AGENTS.md chain: user (a1b2) → project (c3d4) → Concepts folder (e5f6) — nearest scope wins</div>' +
      '<div class="pm-log-line">compaction: semantic summary at 70% of the context limit, safeguard on</div>' +
      '<div class="pm-log-line">persona capsule: 2 lines, 38 tokens — the full persona source is never injected</div>' +
      '<div class="pm-log-line">tool schemas: 4 of 8 installed tools selected this turn (progressive disclosure)</div></div>' +
      "</div></details>" +
      "</div></div>";
    document.getElementById("cl-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    root.querySelectorAll(".cl-adv").forEach(function (d) {
      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* TERMINAL MANAGER — profiles + live preview                          */
  /* ------------------------------------------------------------------ */

  function profilePreviewStyle(p) {
    var font = p.font || {};
    var colors = p.colors || {};
    var size = font.size === "inherit" || font.size === "auto" ? 13 : font.size;
    var lh = font.lineHeight === "inherit" || font.lineHeight === "auto" ? 1.35 : font.lineHeight;
    var fg = colors.fg === "inherit" ? "#E8E6EA" : colors.fg || "#E8E6EA";
    var bg = colors.bg === "inherit" ? "#1D1B22" : colors.bg || "#1D1B22";
    var opacity = p.opacity === "auto" ? "1" : (parseInt(p.opacity, 10) || 100) / 100;
    var family = font.family === "inherit" ? "Menlo" : font.family || "Menlo";
    return { size: size, lh: lh, fg: fg, bg: bg, opacity: opacity, family: family, cursor: (p.cursor && p.cursor.style) || "bar" };
  }

  function termFieldRow(label, desc, control) {
    return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">' + esc(label) + '</div><div class="pm-row-desc">' + esc(desc) + "</div></div>" +
      '<div class="pm-row-control">' + control + "</div></div>";
  }

  function inheritOrValue(v) { return v === "inherit" || v === "auto" || v === "not-configured"; }

  function renderTerminal() {
    var term = PMStore.get("terminal", { profiles: [], activeProfile: null });
    var pid = view.pid || term.activeProfile || (term.profiles[0] && term.profiles[0].id);
    var p = null;
    term.profiles.forEach(function (x) { if (x.id === pid) p = x; });
    if (!p) p = term.profiles[0];
    var st = profilePreviewStyle(p);

    function textField(path, value, hint, placeholder) {
      var isTok = inheritOrValue(value);
      return '<span class="pm-text"' + (isTok ? ' data-empty-hint="' + esc(value) + '"' : "") + '><input type="text" data-tpath="' + esc(path) + '" value="' + (isTok ? "" : esc(value)) + '" placeholder="' + esc(placeholder) + '" aria-label="' + esc(path) + '"></span>';
    }

    var fields = '<div class="cl-fieldgrid">' +
      termFieldRow("Shell", "The program new terminals start.", textField("shell", p.shell, null, "/bin/zsh")) +
      termFieldRow("Font family", "Primary face; the fallback covers missing glyphs.", textField("font.family", p.font.family, null, "Menlo")) +
      termFieldRow("Font size", "Points. Inherit follows the app editor size.",
        '<span class="pm-stepper" data-tstep="font.size"><button type="button" data-step="-1" aria-label="Smaller">−</button><input type="text" value="' + (inheritOrValue(p.font.size) ? p.font.size : p.font.size) + '" aria-label="Font size" readonly><button type="button" data-step="1" aria-label="Larger">+</button></span>' +
        (inheritOrValue(p.font.size) ? ' <span class="pm-badge" data-kind="state" data-icon data-state="' + (p.font.size === "inherit" ? "inherited" : "auto") + '">' + (p.font.size === "inherit" ? "Inherited" : "Auto") + "</span>" : "")) +
      termFieldRow("Line height", "Multiplier of the font size.", textField("font.lineHeight", String(p.font.lineHeight), null, "1.2")) +
      termFieldRow("Foreground", "Default text color.", textField("colors.fg", p.colors.fg, null, "#E8E6EA")) +
      termFieldRow("Background", "Terminal background.", textField("colors.bg", p.colors.bg, null, "#1D1B22")) +
      termFieldRow("Palette", "The ANSI palette.", textField("colors.palette", p.colors.palette, null, "Puppet Dark")) +
      termFieldRow("Opacity", "Window material opacity.", textField("opacity", p.opacity, null, "100%")) +
      termFieldRow("Cursor style", "Bar, block, or underline.",
        '<span class="pm-select"><select data-tpath="cursor.style" aria-label="Cursor style">' +
        ["bar", "block", "underline", "inherit"].map(function (c) {
          return '<option value="' + c + '"' + (p.cursor.style === c ? " selected" : "") + ">" + (c === "inherit" ? "Inherit" : c[0].toUpperCase() + c.slice(1)) + "</option>";
        }).join("") + "</select></span>") +
      termFieldRow("Working directory", "Where new terminals start.", textField("cwdPolicy", p.cwdPolicy, null, "Inherit from the app")) +
      termFieldRow("Transcript retention", "How long scrollback is kept.", textField("transcriptRetention", p.transcriptRetention, null, "30 days")) +
      termFieldRow("Startup command", "Runs in every new terminal. Not configured means none.", textField("startupCommand", p.startupCommand, null, "Leave empty for none")) +
      "</div>";

    var cursorCss = st.cursor === "block" ? "inline-size:9px;block-size:16px" : st.cursor === "underline" ? "inline-size:9px;block-size:2px;vertical-align:-2px" : "inline-size:2px;block-size:16px";
    var preview =
      '<div class="cl-term-preview"><div class="cl-term-titlebar">' + esc(p.name) + " — live preview</div>" +
      '<div class="cl-term-screen" style="background:' + esc(st.bg) + ";color:" + esc(st.fg) + ";font-size:" + st.size + "px;line-height:" + st.lh + ";font-family:" + esc(st.family) + ",monospace;opacity:" + st.opacity + '">' +
      '<div class="line">puppet-master % pm status</div>' +
      '<div class="line">2 providers ready · 1 needs sign-in · catalog fresh</div>' +
      '<div class="line">puppet-master % git log --oneline -2</div>' +
      '<div class="line">a1b2c3d settings: three-surface architecture</div>' +
      '<div class="line">e5f6a7b concepts: bakeoff scaffolding</div>' +
      '<div class="line">puppet-master % <span class="cl-term-cursor" style="' + cursorCss + '"></span></div>' +
      "</div></div>";

    var profList = term.profiles.map(function (x) {
      return '<button type="button" class="cl-term-prof" data-prof="' + esc(x.id) + '" aria-current="' + (x.id === p.id) + '">' +
        '<div class="name">' + esc(x.name) + "</div>" +
        '<div class="sub">' + (x.completeness === "complete" ? "Complete" : "Partial — inherits the rest from Default") + "</div></button>";
    }).join("");

    root.innerHTML = '<div class="cl-mgr"><div class="cl-mgr-inner">' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn cl-back" data-variant="quiet" id="cl-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Home</button>' +
      '<h1 style="margin:0;font-size:20px">Terminal</h1>' +
      '<span class="pm-faint" style="font-size:12px">Profiles, fonts, and shell policy — every field states what emptiness means</span><span style="flex:1"></span>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="cl-term-diag">Run diagnostics</button></div>' +
      '<div class="cl-term-grid"><div>' + profList +
      '<p class="cl-mgr-note">The Work profile inherits what it lacks from Default; its four undecided fields are marked Inherit, Auto, or Not configured — never blank.</p></div>' +
      '<div style="display:grid;gap:16px">' + preview +
      '<div class="pm-panel"><h3 class="pm-panel-h">Profile fields</h3>' + fields + "</div>" +
      "</div></div></div></div>";

    document.getElementById("cl-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    document.getElementById("cl-term-diag").addEventListener("click", function () {
      PMStore.receipt("Terminal diagnostics simulated — no shell was spawned", "info");
    });
    root.querySelectorAll("[data-prof]").forEach(function (b) {
      b.addEventListener("click", function () { view.pid = b.getAttribute("data-prof"); render(); });
    });
    root.querySelectorAll("input[data-tpath]").forEach(function (input) {
      input.addEventListener("change", function () {
        var path = input.getAttribute("data-tpath");
        var term2 = PMStore.get("terminal");
        var prof = null;
        term2.profiles.forEach(function (x) { if (x.id === p.id) prof = x; });
        var segs = path.split(".");
        var node = prof;
        for (var i = 0; i < segs.length - 1; i++) node = node[segs[i]];
        var raw = input.value.trim();
        node[segs[segs.length - 1]] = raw === "" ? (path === "startupCommand" ? "not-configured" : "inherit") : raw;
        PMStore.set("terminal", term2);
      });
    });
    root.querySelectorAll("select[data-tpath]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var term2 = PMStore.get("terminal");
        term2.profiles.forEach(function (x) { if (x.id === p.id) x.cursor.style = sel.value; });
        PMStore.set("terminal", term2);
      });
    });
    root.querySelectorAll("[data-tstep] button").forEach(function (b) {
      b.addEventListener("click", function () {
        var term2 = PMStore.get("terminal");
        term2.profiles.forEach(function (x) {
          if (x.id === p.id) {
            var cur = inheritOrValue(x.font.size) ? 13 : parseInt(x.font.size, 10);
            x.font.size = Math.min(24, Math.max(9, cur + parseInt(b.getAttribute("data-step"), 10)));
          }
        });
        PMStore.set("terminal", term2);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* render loop                                                         */
  /* ------------------------------------------------------------------ */

  function render() {
    if (spy) { spy.detach(); spy = null; }
    var scroller = root.querySelector(".cl-doc") || root.querySelector(".cl-mgr") || root.querySelector(".cl-home");
    var st = scroller ? scroller.scrollTop : 0;
    var wantsFocus = !!(view.focusSetting || view.focusSub);
    if (view.name === "workspace") renderWorkspace();
    else if (view.name === "manager") {
      if (view.id === "context") renderContext();
      else if (view.id === "terminal") renderTerminal();
      else renderProviders();
    } else renderHome();
    var after = root.querySelector(".cl-doc") || root.querySelector(".cl-mgr") || root.querySelector(".cl-home");
    if (after && !wantsFocus) after.scrollTop = st;
  }

  PMStore.on("change", function () { render(); });
  PMStore.on("reset", function () { openAdv = {}; openFams = {}; sheetPid = null; });

  V.bindSettings(root, {
    getSetting: function (sid) { return DEMO.settings[sid]; },
    onChange: function (sid, value) { V.setOverride(sid, value); },
    onRun: function (sid) {
      var s = DEMO.settings[sid];
      PMStore.receipt("“" + (s ? s.label : sid) + "” simulated — no real action ran", "info");
    }
  });
  V.bindProviders(root, render);
  V.bindRoles(root);

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "/" && !ev.target.closest("input, select, textarea")) {
      var input = root.querySelector(".cl-cmd input");
      if (input) { ev.preventDefault(); input.focus(); }
    }
  });

  window.PMShell.init();
  render();
})();
