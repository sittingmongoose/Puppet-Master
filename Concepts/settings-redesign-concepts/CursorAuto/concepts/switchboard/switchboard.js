/* ============================================================================
   Concept 03 — Switchboard · Switchboard IA
   Docked slash-search is the home. Workspaces dock the query in the header, switch
   categories from a jack strip, and drive a section jack strip
   as scrollspy. Managers: File Manager, Terminal, LSP, Formatters, Commands, MCP, Skills, Plugins, Tools, Testing (+ Providers).
   ========================================================================== */
(function () {
  "use strict";

  var DEMO = window.PM_SETTINGS_DEMO;
  var V = window.CAViews;
  var esc = V.esc;

  var _seed = (window.CAManagers && CAManagers.defaultSeed)
    ? CAManagers.defaultSeed(DEMO)
    : { providers: V.clone(DEMO.providers) };
  _seed.overrides = _seed.overrides || {};
  _seed.dismissedNotices = _seed.dismissedNotices || [];
  _seed.calmDemo = false;
  if (!_seed.spell && DEMO.spellcheck) {
    _seed.spell = {
      ignored: [],
      personal: (DEMO.spellcheck.personalDictionary || []).slice(),
      project: (DEMO.spellcheck.projectDictionary || []).slice()
    };
  }
  PMStore.seed(_seed);
  PMStore.init("switchboard");

  var INDEX = PMSearch.buildIndex(DEMO);
  var root = document.getElementById("sw-root");

  var view = { name: "home" };
  var _motionKind = "home";
  var _prevCat = null;
  var spy = null;
  var openAdv = {};
  var resetArmed = null;
  var openFams = {};     /* provider expansion state */
  var sheetPid = null;   /* provider shown in the side sheet */

  var MANAGERS = { providers: true, fileManager: true, terminal: true, lsp: true, formatters: true, commands: true, mcp: true, skills: true, plugins: true, tools: true, testing: true };
  var MANAGER_CATEGORY = { appearanceMgr: "appearance", artifacts: "system", backup: "system", bsd: "permissions", cleanup: "system", commands: "tools", containers: "system", context: "context", crew: "collaboration", desktop: "general", fileManager: "code", formatters: "code", githubActions: "collaboration", goal: "planning", history: "context", lsp: "code", mcp: "tools", media: "media", memory: "context", notifications: "general", permissions: "permissions", personas: "providers", plugins: "tools", providers: "providers", searchIndex: "system", serverShell: "system", settingsLifecycle: "system", skills: "tools", soundLibrary: "appearance", spellcheck: "appearance", storage: "system", teacher: "general", terminal: "code", testing: "planning", tools: "tools", web: "tools", worktrees: "collaboration" };

  function catById(id) {
    for (var i = 0; i < DEMO.categories.length; i++) if (DEMO.categories[i].id === id) return DEMO.categories[i];
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* navigation                                                          */
  /* ------------------------------------------------------------------ */

  function captureNavOrigin(el, label) {
    if (window.CAMotion && CAMotion.captureOrigin) CAMotion.captureOrigin(el, label || "nav");
  }

  function resolveManagerId(id) {
    if (!id) return id;
    if (MANAGERS[id]) return id;
    /* Accept CAManagers canonical ids (contextSources, crews, …) */
    var aliases = { contextSources: "context", crews: "crew", permissionsRules: "permissions", appearanceThemes: "appearanceMgr", spell: "spellcheck" };
    var mapped = aliases[id];
    if (mapped && MANAGERS[mapped]) return mapped;
    return id;
  }

  function navigate(target) {
    var t = target || {};
    if (t.manager === "usage") {
      view = { name: "manager", id: "providers", pid: null, tab: "usage" };
    } else if (t.manager && MANAGERS[resolveManagerId(t.manager)]) {
      view = { name: "manager", id: resolveManagerId(t.manager), focusSetting: t.setting || null };
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
    _motionKind = "search";
    if (window.CAMotion) CAMotion.captureOrigin(document.activeElement, "search");
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
      return '<div class="sw-calm">' + V.icon("check") + "<div><b>All jacks quiet.</b> Nothing needs a decision — the command field is still the fastest way anywhere.</div></div>";
    }
    var order = { attention: 0, setup: 1, recommended: 2 };
    list.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    return '<div class="sw-verbs-notices">' + list.map(V.noticeHtml).join("") + "</div>";
  }

  function cardsHtml() {
    var cats = DEMO.categories.slice().sort(function (a, b) {
      var af = a.manager && MANAGERS[a.manager] ? 0 : 1;
      var bf = b.manager && MANAGERS[b.manager] ? 0 : 1;
      return af - bf;
    });
    return cats.map(function (c) {
      var featured = c.manager && MANAGERS[c.manager];
      return '<button type="button" class="sw-jack' + (featured ? " is-featured" : "") + '" data-cat="' + esc(c.id) + '">' +
        '<span class="sw-jack-pin" aria-hidden="true"></span>' +
        '<span><span class="name">' + esc(c.title) + '</span><span class="purpose ca-meta-block">' + esc(c.purpose) + "</span></span>" +
        '<span class="status ca-meta-faint">' + esc(c.statusSummary) + (featured ? " · patch bay" : "") + "</span>" +
        "</button>";
    }).join("");
  }

  function homeHtml() {
    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" class="sw-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";
    }).join("");
    return '<div class="sw-home"><div class="sw-home-core">' +
      '<div class="sw-eyebrow">Concept 03 · Switchboard · patching · File Manager/Terminal/LSP/Formatters/Commands/MCP/Skills/Plugins/Tools/Testing<span class="sw-model" data-concept-model="CursorAuto">Concept model: CursorAuto</span></div>' +
      '<div class="sw-slash">' + V.icon("search") +
      '<input id="sw-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search — settings, managers, actions">' +
      "<kbd>/</kbd></div>" +
      '<div class="sw-hits" id="sw-hits" role="listbox" aria-label="Search results" hidden></div>' +
      '<div class="sw-home-body" id="sw-home-body">' +
      '<section style="display:grid;gap:10px"><h2 class="sw-h2">Compact triage</h2><div class="sw-verbs">' + verbsHtml() + "</div></section>" +
      '<section style="display:grid;gap:10px"><h2 class="sw-h2">Jack column</h2><div class="sw-jacks">' + cardsHtml() + "</div></section>" +
      '<section style="display:grid;gap:6px"><h2 class="sw-h2">Jump back in</h2><div>' + recents + "</div></section>" +
      '<section style="display:flex;gap:12px;flex-wrap:wrap;border-top:1px solid var(--pm-line);padding-top:14px">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sw-calm-toggle">Toggle calm state (demo)</button>' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sw-reset">Reset demo data</button>' +
      '<span class="ca-faint" style="font-size:11.5px">Docked slash search · jacks · patch sheet.</span>' +
      "</section>" +
      "</div></div></div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    var input = document.getElementById("sw-search");
    var hits = document.getElementById("sw-hits");
    var body = document.getElementById("sw-home-body");
    V.wireSearch({
      input: input, listEl: hits, index: INDEX,
      onPick: onSearchPick,
      onOpen: function () { body.classList.add("is-querying"); },
      onClose: function () { body.classList.remove("is-querying"); }
    });
    input.focus();
    root.querySelectorAll("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        captureNavOrigin(b, b.className.indexOf("hb-berth") !== -1 ? "berth" : b.className.indexOf("sc-plate") !== -1 ? "plate" : b.className.indexOf("sw-jack") !== -1 ? "jack" : "category");
        _motionKind = "workspace";
        view = { name: "workspace", cat: b.getAttribute("data-cat"), focusSub: null, focusSetting: null };
        render();
      });
    });
    root.querySelectorAll("[data-recent]").forEach(function (b) {
      b.addEventListener("click", function () { navigate(DEMO.recents[parseInt(b.getAttribute("data-recent"), 10)].target); });
    });
    root.querySelectorAll("[data-notice-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var n = DEMO.notices.filter(function (x) { return x.id === b.getAttribute("data-notice-act"); })[0];
        if (n) navigate(n.target);
      });
    });
    root.querySelectorAll("[data-notice-dismiss]").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = PMStore.get("dismissedNotices", []).slice();
        d.push(b.getAttribute("data-notice-dismiss"));
        PMStore.set("dismissedNotices", d);
      });
    });
    document.getElementById("sw-calm-toggle").addEventListener("click", function () {
      PMStore.set("calmDemo", !PMStore.get("calmDemo", false));
    });
    document.getElementById("sw-reset").addEventListener("click", function () {
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
      html += '<details class="sw-adv"' + (openAdv[sub.id] ? " open" : "") + ' data-adv="' + esc(sub.id) + '"><summary>Show ' +
        advanced.length + " advanced, expert, or diagnostic options</summary><div class=\"sw-adv-body\">" +
        advanced.map(function (s) { return V.rowHtml(s); }).join("") + "</div></details>";
    }
    return html;
  }

  function workspaceHtml(cat) {
    var strip = DEMO.categories.map(function (c) {
      return '<button type="button" class="sw-strip-jack" data-space="' + esc(c.id) + '" aria-current="' + (c.id === cat.id) + '">' +
        '<span class="pin" aria-hidden="true"></span><span>' + esc(c.title) + "</span></button>";
    }).join("") + cat.subcategories.map(function (sub) {
      return '<button type="button" class="sw-strip-jack" data-sub="' + esc(sub.id) + '" data-tick="' + esc(sub.id) + '">' +
        '<span class="pin" aria-hidden="true"></span><span>' + esc(sub.title) + "</span></button>";
    }).join("");
    var spaceOpts = DEMO.categories.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === cat.id ? " selected" : "") + ">" + esc(c.title) + "</option>";
    }).join("");
    var sections = cat.subcategories.map(function (sub) {
      return '<section class="sw-sec" id="sec-' + esc(sub.id) + '"><h2>' + esc(sub.title) + '</h2><p class="sw-sec-sum">' + esc(sub.summary) + "</p>" + rowsFor(sub) + "</section>";
    }).join("");
    var spell = cat.id === "appearance" ? '<section class="sw-sec" id="sec-spellcheck-demo"><h2>Spellcheck, live</h2><p class="sw-sec-sum">The shared writing service on a draft — it never changes text by itself.</p><div id="sw-spell"></div></section>' : "";
    return '<div class="sw-ws">' +
      '<div class="sw-ws-bar">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sw-back">Board</button>' +
      '<div class="sw-slash" style="flex:1;min-inline-size:180px;padding:6px 10px">' + V.icon("search") +
      '<input id="sw-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search — settings, managers, actions"></div>' +
      '<div class="sw-hits" id="sw-ws-hits" role="listbox" hidden></div>' +
      '<span class="ca-select"><select id="sw-space-select" aria-label="Jack">' + spaceOpts + "</select></span>" +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sw-cat-reset">Reset patch</button>' +
      (cat.manager ? '<button type="button" class="ca-btn" id="sw-open-mgr">' + esc(DEMO.managerMeta[cat.manager].title) + " bay</button>" : "") +
      "</div>" +
      '<div class="sw-ws-grid">' +
      '<nav class="sw-jack-strip" id="sw-map" aria-label="Jack strip">' + strip + "</nav>" +
      '<div class="sw-patch" id="sw-doc">' +
      '<div class="sw-crumb"><b>' + esc(cat.title) + '</b> patch sheet · <span id="sw-crumb-sub">' + esc(cat.subcategories[0] ? cat.subcategories[0].title : "") + "</span></div>" +
      sections + spell + "</div>" +
      "</div></div>";
  }

  function renderWorkspace() {
    var cat = catById(view.cat) || DEMO.categories[0];
    root.innerHTML = workspaceHtml(cat);
    var doc = document.getElementById("sw-doc");

    root.querySelectorAll("[data-space]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-space");
        if (id !== cat.id) { view = { name: "workspace", cat: id, focusSub: null, focusSetting: null }; render(); }
      });
    });
    document.getElementById("sw-space-select").addEventListener("change", function (ev) {
      view = { name: "workspace", cat: ev.target.value, focusSub: null, focusSetting: null };
      render();
    });
    root.querySelectorAll("[data-tick], [data-sub]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sid = b.getAttribute("data-tick") || b.getAttribute("data-sub");
        if (!sid || b.getAttribute("data-space")) return;
        var sec = document.getElementById("sec-" + sid);
        if (sec) PMSpy.jumpTo(sec, { root: doc });
      });
    });

    V.wireSearch({
      input: document.getElementById("sw-ws-search"),
      listEl: document.getElementById("sw-ws-hits"),
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
        var crumb = document.getElementById("sw-crumb-sub");
        if (crumb && subObj) crumb.textContent = subObj.title;
      }
    });

    doc.querySelectorAll(".sw-adv").forEach(function (d) {
      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });
    });

    document.getElementById("sw-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    var mgrBtn = document.getElementById("sw-open-mgr");
    if (mgrBtn) mgrBtn.addEventListener("click", function () {
      if (MANAGERS[cat.manager]) { view = { name: "manager", id: cat.manager }; render(); }
      else PMStore.receipt("The " + DEMO.managerMeta[cat.manager].title + " manager is realized richly in another concept of this bakeoff; its settings live inline here", "info");
    });

    var resetBtn = document.getElementById("sw-cat-reset");
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
          if (resetArmed === cat.id) { resetArmed = null; resetBtn.textContent = "Reset patch"; }
        }, 2600);
      }
    });

    if (cat.id === "appearance") V.mountSpellcheck(document.getElementById("sw-spell"), {});

    if (view.focusSetting) {
      var row = document.getElementById("row-" + view.focusSetting);
      if (row) {
        var adv = row.closest(".sw-adv");
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
    function tile(k, v, s) { return '<div class="sw-tile"><span class="k">' + k + '</span><span class="v">' + v + '</span><span class="s">' + s + "</span></div>"; }
    return '<div class="sw-board">' +
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
    return '<div class="ca-provider-fold sw-fam" data-open="' + open + '">' +
      '<button type="button" class="sw-fam-head" data-fam="' + esc(p.id) + '" aria-expanded="' + open + '">' +
      V.healthDot(st.dot, st.label) +
      '<span class="name">' + esc(p.name) + "</span>" +
      '<span class="ca-fold-meta">' + esc(V.GROUP_LABEL[p.connectionGroup]) + " · " + esc(act ? act.label : "No active account") + " · " + p.models.length + " models</span>" +
      '<span class="chev">' + V.icon("chevron") + "</span></button>" +
      (open ? '<div class="ca-provider-fold-body sw-fam-body">' +
        "<h4>Accounts and connections</h4>" +
        (p.installState === "not-installed"
          ? '<div class="ca-empty"><div class="ca-empty-title">Not installed</div><div class="ca-empty-guidance">' + esc(p.diagnostics[0]) + '</div><button type="button" class="ca-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">Install</button></div>'
          : (p.accounts.length ? p.accounts.map(function (a) { return V.accountRowHtml(p, a); }).join("") : '<div class="ca-empty"><div class="ca-empty-title">Signed out</div><div class="ca-empty-guidance">The CLI is installed but no login exists in its isolated profile.</div><button type="button" class="ca-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button></div>')) +
        (p.accountSwitchNote ? '<p class="sw-mgr-note">' + esc(p.accountSwitchNote) + "</p>" : "") +
        "<h4>Models</h4>" + V.catalogHtml(p) + (V.installationsHtml ? V.installationsHtml(p) : "") +
        p.models.map(function (m) { return V.modelRowHtml(p, m); }).join("") +
        "<h4>Usage snapshot</h4>" + V.usageHtml(p) +
        '<button type="button" class="ca-btn" data-variant="quiet" data-sheet="' + esc(p.id) + '">Open the full brief</button>' +
        "</div>" : "") + "</div>";
  }

  function sheetHtml(p) {
    return '<div class="sw-sheet" role="dialog" aria-label="' + esc(p.name) + ' brief">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><h2 style="margin:0;font-size:16px">' + esc(p.name) + '</h2><span style="flex:1"></span>' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sw-sheet-close">Close</button></div>' +
      '<p class="sw-mgr-note">' + esc(p.tagline) + "</p>" +
      '<h4 style="margin:14px 0 6px">At a glance</h4>' + V.healthDot(V.providerStatus(p).dot, V.providerStatus(p).label) +
      '<dl class="ca-kv" style="margin-top:10px">' +
      "<dt>Sign-in ownership</dt><dd>" + esc(V.AUTH_MODEL[p.authModel] || "—") + "</dd>" +
      "<dt>Plan and billing</dt><dd>" + esc(p.product.plan) + " · " + esc(p.product.billingRoute) + "</dd>" +
      "<dt>Routing</dt><dd>Priority " + p.routing.priority + " · " + (p.routing.useNextOnExhaust ? "uses the next route when exhausted" : "stops when exhausted") + " · " + esc(p.routing.continuation) + "</dd>" +
      "</dl>" +
      '<h4 style="margin:16px 0 6px">Usage snapshot</h4>' + V.usageHtml(p) +
      '<h4 style="margin:16px 0 6px">Routing</h4>' + V.routingHtml(p) +
      '<details class="ca-disclose"><summary>Diagnostics details</summary><div class="ca-disclose-body">' + V.diagnosticsHtml(p) + "</div></details>" +
      "</div>";
  }


  function freeAuthRoutesHtml() {
    var routes = [
      ["API key", "Paste a key that never leaves the local secret store."],
      ["OAuth / device code", "Provider opens its own login or shows a device code."],
      ["CLI-owned login", "Reuse an already-authenticated CLI session in an isolated profile."],
      ["PM sign-in", "Use the Puppet Master account already on this machine."],
      ["Local endpoint", "Point at a local or private model server."],
      ["No authentication", "Browse or invoke without signing in when the route allows it."]
    ];
    return '<div class="ca-panel"><h3 class="ca-panel-h">Free Models — six auth routes</h3><div class="ca-auth-routes">' +
      routes.map(function (r) {
        return '<div class="ca-auth-route"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + "</span></div>";
      }).join("") + "</div></div>";
  }

  function renderProviders() {
    var groups = ["installed-tools", "connected-accounts", "api", "server", "free"];
    var byGroup = {};
    V.providers().forEach(function (p) { (byGroup[p.connectionGroup] = byGroup[p.connectionGroup] || []).push(p); });
    var fams = groups.filter(function (g) { return byGroup[g]; }).map(function (g) {
      return '<h2 class="sw-h2" style="margin-top:6px">' + esc(V.GROUP_LABEL[g]) + "</h2>" +
        '<div style="display:grid;gap:10px">' + byGroup[g].map(famHtml).join("") + "</div>";
    }).join("");
    root.innerHTML = '<div class="sw-mgr"><div class="sw-mgr-inner">' +
      '<div class="sw-eyebrow">Patch bay <span class="sw-model" data-concept-model="CursorAuto">Concept model: CursorAuto</span></div>' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sw-back">Board</button>' +
      '<h1 style="margin:0;font-size:20px">Providers patch bay</h1>' +
      '<span class="ca-faint" style="font-size:12px">Folded families; expand a jack for the full deck</span><span style="flex:1"></span>' +
      '<div class="sw-slash" style="flex:0 1 280px;padding:6px 10px">' + V.icon("search") +
      '<input id="sw-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></div>' +
      '<div class="sw-hits" id="sw-ws-hits" role="listbox" hidden></div>' +
      "</div>" +
      boardHtml() + fams + freeAuthRoutesHtml() +
      '<p class="sw-mgr-note">Provider, account, connection, product, and model are separate things here. A fresh catalog proves neither entitlement nor invocation.</p>' +
      "</div>" + (sheetPid ? sheetHtml(V.providerById(sheetPid)) : "") + "</div>";

    document.getElementById("sw-back").addEventListener("click", function () { view = { name: "home" }; sheetPid = null; render(); });
    V.wireSearch({ input: document.getElementById("sw-ws-search"), listEl: document.getElementById("sw-ws-hits"), index: INDEX, onPick: function (r) { sheetPid = null; onSearchPick(r); } });
    root.querySelectorAll("[data-fam]").forEach(function (b) {
      b.addEventListener("click", function () {
        openFams[b.getAttribute("data-fam")] = !openFams[b.getAttribute("data-fam")];
        render();
      });
    });
    root.querySelectorAll("[data-sheet]").forEach(function (b) {
      b.addEventListener("click", function () { sheetPid = b.getAttribute("data-sheet"); render(); });
    });
    var close = document.getElementById("sw-sheet-close");
    if (close) close.addEventListener("click", function () { sheetPid = null; render(); });
  }

  /* ------------------------------------------------------------------ */
  /* CONTEXT & INSTRUCTIONS MANAGER                                      */
  /* ------------------------------------------------------------------ */
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
    return '<div class="ca-row"><div class="ca-row-main"><div class="ca-row-label">' + esc(label) + '</div><div class="ca-row-desc">' + esc(desc) + "</div></div>" +
      '<div class="ca-row-control">' + control + "</div></div>";
  }

  function inheritOrValue(v) { return v === "inherit" || v === "auto" || v === "not-configured"; }
  /* ------------------------------------------------------------------ */
  /* render loop                                                         */
  /* ------------------------------------------------------------------ */

  function render() {
    var __kind = _motionKind || (view.name === "manager" ? "manager" : view.name === "workspace" ? "workspace" : "home");
    if (view.name === "workspace") {
      if (_prevCat && _prevCat !== view.cat && __kind !== "search") __kind = "category";
      _prevCat = view.cat;
    }

    if (spy) { spy.detach(); spy = null; }
    var focusingSetting = view.focusSetting;
    var focusingSub = view.focusSub;
    var scroller = root.querySelector(".sw-patch") || root.querySelector("#sw-doc") || root.querySelector(".sw-mgr") || root.querySelector(".sw-home");
    var st = scroller ? scroller.scrollTop : 0;
    if (view.name === "workspace") renderWorkspace();
    else if (view.name === "manager") {
      if (view.id === "providers") renderProviders();
      else if (window.CAManagers && CAManagers.handles(view.id)) {
        CAManagers.mount({
          root: root,
          managerId: view.id,
          chrome: { wrapClass: "sw-mgr", barClass: "sw-ws-bar", detailClass: "sw-mgr-detail", backId: "sw-back" },
          onBack: function () { view = { name: "home" }; render(); },
          rerender: function () { render(); }
        });
      } else {
        /* shared_grammar fallback — open Providers or Home with receipt */
        PMStore.receipt("Manager “" + view.id + "” is available via shared grammar; opening Home", "info");
        view = { name: "home" };
        renderHome();
      }
    } else renderHome();
    var after = root.querySelector(".sw-patch") || root.querySelector("#sw-doc") || root.querySelector(".sw-mgr") || root.querySelector(".sw-home");
    if (after && !focusingSetting && !focusingSub) after.scrollTop = st;
  
    if (window.CAMotion) {
      var focusEl = null;
      if (__kind === "search") {
        focusEl = root.querySelector(".ca-row.ca-motion-focus") || root.querySelector("[data-focus-land]") || root.querySelector(".ca-row");
      }
      CAMotion.afterRender(root, __kind === "category" ? "category" : (__kind === "search" ? "search" : view.name), { focusEl: focusEl });
      _motionKind = view.name; /* reset default */
    }
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

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "/" && !ev.target.closest("input, select, textarea")) {
      var input = root.querySelector(".sw-cmd input");
      if (input) { ev.preventDefault(); input.focus(); }
    }
  });

  if (window.CAStates) CAStates.mount({ host: document.body });
  PMShell.init();
  render();
})();
