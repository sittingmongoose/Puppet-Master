/* ============================================================================
   Concept 04 — Archive · Archive IA
   Finding-aid search → tickets → collection guides.
   Workspace: outline + box + running header (+ provenance).
   Managers: Storage, Backup, Lifecycle, History, Artifacts, Worktrees, Actions, Containers, Web/Search, Index, Cleanup, Server Shell (+ Providers). Retrieval motion.
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
  PMStore.init("archive");

  var INDEX = PMSearch.buildIndex(DEMO);
  var root = document.getElementById("ar-root");

  var view = { name: "home" };
  var _motionKind = "home";
  var _prevCat = null;
  var spy = null;
  var openAdv = {};
  var resetArmed = null;
  var openProviders = {};
  var drawerPid = null;

  var MANAGERS = { providers: true, storage: true, backup: true, settingsLifecycle: true, history: true, artifacts: true, worktrees: true, githubActions: true, containers: true, web: true, searchIndex: true, cleanup: true, serverShell: true };
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
  /* FINDING AID                                                         */
  /* ------------------------------------------------------------------ */

  function liveStats(cat) {
    var total = 0, changed = 0, managed = 0, risky = 0;
    cat.subcategories.forEach(function (sub) {
      sub.settings.forEach(function (sid) {
        var s = DEMO.settings[sid];
        if (!s) return;
        total++;
        var st = V.resolveState(s).state;
        if (st === "custom") changed++;
        if (st === "managed") managed++;
        if (s.exposure === "expert") risky++;
      });
    });
    return { total: total, changed: changed, managed: managed, risky: risky };
  }

  function bandHtml() {
    var dismissed = PMStore.get("dismissedNotices", []);
    var notices = DEMO.notices.filter(function (n) { return dismissed.indexOf(n.id) === -1; });
    var attention = notices.filter(function (n) { return n.kind === "attention"; }).length;
    var setups = notices.filter(function (n) { return n.kind === "setup"; }).length;
    var ready = 0, refreshing = 0, worst = "low";
    var rank = { low: 0, unknown: 0, medium: 1, high: 2 };
    V.providers().forEach(function (p) {
      if (V.providerStatus(p).dot === "ok") ready++;
      if (p.catalog.refreshing) refreshing++;
      if (p.usageSnapshot && rank[p.usageSnapshot.pressure] > rank[worst]) worst = p.usageSnapshot.pressure;
    });
    var calm = PMStore.get("calmDemo", false);
    return '<div class="ar-band">' +
      '<button type="button" class="ar-stat" data-band="tickets"><span class="k">Needs attention</span><span class="v">' + (calm ? 0 : attention) + '</span><span class="s">broken, signed out, or unsafe</span></button>' +
      '<button type="button" class="ar-stat" data-band="tickets"><span class="k">Setup in progress</span><span class="v">' + (calm ? 0 : setups) + '</span><span class="s">onboarding left unfinished on purpose</span></button>' +
      '<button type="button" class="ar-stat" data-band="providers"><span class="k">Providers ready</span><span class="v">' + ready + " of " + V.providers().length + '</span><span class="s">Anthropic, Copilot, local server</span></button>' +
      '<button type="button" class="ar-stat" data-band="providers"><span class="k">Usage pressure</span><span class="v">' + (worst === "high" ? "High" : worst === "medium" ? "Medium" : "Low") + '</span><span class="s">OpenAI included usage is exhausted</span></button>' +
      '<button type="button" class="ar-stat" data-band="providers"><span class="k">Catalogs</span><span class="v">' + (refreshing ? "Refreshing" : "Fresh") + '</span><span class="s">' + (refreshing ? "last-known-good rows stay visible" : "models.dev and provider feeds current") + "</span></button>" +
      "</div>";
  }

  function opsHtml() {
    var dismissed = PMStore.get("dismissedNotices", []);
    var list = DEMO.notices.filter(function (n) { return dismissed.indexOf(n.id) === -1; });
    if (PMStore.get("calmDemo", false) || !list.length) {
      return '<div class="ar-calm">' + V.icon("check") + "<span><b>No tickets in the aid.</b> No attention items, no setups, no recommendations.</span></div>";
    }
    var order = { attention: 0, setup: 1, recommended: 2 };
    list.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    return '<div class="ar-tickets-notices">' + list.map(V.noticeHtml).join("") + "</div>";
  }

  function panelsHtml() {
    var cats = DEMO.categories.slice().sort(function (a, b) {
      var af = a.manager && MANAGERS[a.manager] ? 0 : 1;
      var bf = b.manager && MANAGERS[b.manager] ? 0 : 1;
      return af - bf;
    });
    return cats.map(function (c) {
      var st = liveStats(c);
      var featured = c.manager && MANAGERS[c.manager];
      return '<button type="button" class="ar-guide' + (featured ? " is-featured" : "") + '" data-open-cat="' + esc(c.id) + '">' +
        '<div class="head">' + V.icon(c.icon) + '<span class="name">' + esc(c.title) + "</span>" +
        (featured ? '<span class="ca-badge" data-kind="scope">Featured</span>' : "") + "</div>" +
        '<div class="stats"><span>' + st.total + " settings</span>" +
        (st.managed ? "<span>" + st.managed + " managed</span>" : "") +
        (st.risky ? "<span>" + st.risky + " expert</span>" : "") +
        (st.changed ? "<span>" + st.changed + " changed this session</span>" : "") + "</div>" +
        '<div class="status">' + esc(c.statusSummary) + "</div>" +
        '<span class="open-label">' + (featured ? "Open featured collection" : "Open collection") + "</span>" +
        "</button>";
    }).join("");
  }

  function homeHtml() {
    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" data-recent="' + i + '">' + esc(r.label) + "</button>";
    }).join("");
    return '<div class="ar-home"><div class="ar-aid">' +
      '<header class="ar-aid-head">' +
      '<div class="ar-eyebrow">Concept 04 · Archive · retrieval · Storage/Backup/Lifecycle/History/Artifacts/Worktrees/Actions/Containers/Web/Index/Cleanup/Server shell<span class="ar-model" data-concept-model="CursorAuto">Concept model: CursorAuto</span></div>' +
      "<h1>Finding aid</h1>" +
      '<div class="ar-searchbox">' + V.icon("search") +
      '<input id="ar-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search — settings, managers, actions"></div>' +
      '<div class="ar-hits" id="ar-hits" role="listbox" hidden></div>' +
      "</header>" +
      bandHtml() +
      '<h2 class="ar-h2" id="ar-sec-ops">Tickets</h2><div class="ar-tickets">' + opsHtml() + "</div>" +
      '<h2 class="ar-h2" id="ar-sec-panels">Collection guides</h2><div class="ar-guides">' + panelsHtml() + "</div>" +
      '<h2 class="ar-h2">Recent retrievals</h2><div class="ar-last">' + recents + "</div>" +
      '<div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="ar-calm-toggle">Toggle calm state (demo)</button>' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="ar-reset">Reset demo data</button>' +
      '<span class="ar-mgr-note">Finding-aid search, tickets, collection guides, box documents.</span></div>' +
      "</div></div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    V.wireSearch({
      input: document.getElementById("ar-search"),
      listEl: document.getElementById("ar-hits"),
      index: INDEX,
      onPick: onSearchPick
    });
    root.querySelectorAll("[data-open-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        captureNavOrigin(b, "guide");
        _motionKind = "workspace";
        view = { name: "workspace", cat: b.getAttribute("data-open-cat"), focusSub: null, focusSetting: null };
        render();
      });
    });
    root.querySelectorAll("[data-band]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("data-band") === "providers") { view = { name: "manager", id: "providers" }; render(); }
        else {
          var el = document.getElementById("ar-sec-ops");
          if (el) el.scrollIntoView({ behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth", block: "start" });
        }
      });
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
    root.querySelectorAll("[data-recent]").forEach(function (b) {
      b.addEventListener("click", function () { navigate(DEMO.recents[parseInt(b.getAttribute("data-recent"), 10)].target); });
    });
    document.getElementById("ar-calm-toggle").addEventListener("click", function () {
      PMStore.set("calmDemo", !PMStore.get("calmDemo", false));
    });
    document.getElementById("ar-reset").addEventListener("click", function () {
      PMStore.resetDemo();
      PMStore.receipt("Demo data reset to its seeded state", "ok");
    });
  }

  /* ------------------------------------------------------------------ */
  /* CONSOLE (workspace)                                                 */
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
      html += '<details class="ar-adv"' + (openAdv[sub.id] ? " open" : "") + ' data-adv="' + esc(sub.id) + '"><summary>Show ' +
        advanced.length + " advanced, expert, or diagnostic options</summary><div class=\"ar-adv-body\">" +
        advanced.map(function (s) { return V.rowHtml(s); }).join("") + "</div></details>";
    }
    return html;
  }

  function sectionMini(sub) {
    var managed = 0, advanced = 0, custom = 0;
    sub.settings.forEach(function (sid) {
      var s = DEMO.settings[sid];
      if (!s) return;
      var st = V.resolveState(s).state;
      if (st === "managed") managed++;
      if (st === "custom") custom++;
      if (s.exposure === "advanced" || s.exposure === "expert" || s.exposure === "diagnostic") advanced++;
    });
    var out = "";
    if (managed) out += '<span class="ca-badge" data-kind="state" data-icon data-state="managed">' + managed + " managed</span>";
    if (custom) out += '<span class="ca-badge" data-kind="state" data-icon data-state="custom">' + custom + " changed</span>";
    if (advanced) out += '<span class="ca-badge" data-kind="exposure" data-exposure="advanced">' + advanced + " behind disclosure</span>";
    return out;
  }

  function workspaceHtml(cat) {
    var nav = DEMO.categories.map(function (c) {
      var active = c.id === cat.id;
      var subs = active ? c.subcategories.map(function (sub) {
        return '<button type="button" class="ar-ol-sub" data-sub="' + esc(sub.id) + '">' + esc(sub.title) + "</button>";
      }).join("") : "";
      return '<div><button type="button" class="ar-folder" data-acc="' + esc(c.id) + '" aria-current="' + active + '">' +
        esc(c.title) + "</button>" + subs + "</div>";
    }).join("");
    var sections = cat.subcategories.map(function (sub, i) {
      return '<section class="ar-sec" id="sec-' + esc(sub.id) + '">' +
        "<h2>" + esc(sub.title) + '</h2><p class="ar-mgr-note">' + esc(sub.summary) + "</p>" +
        rowsFor(sub) + "</section>";
    }).join("");
    var spell = cat.id === "appearance" ? '<section class="ar-sec" id="sec-spellcheck-demo"><h2>Spellcheck, live</h2><p class="ar-mgr-note">It never changes text by itself.</p><div id="ar-spell"></div></section>' : "";
    return '<div class="ar-ws">' +
      '<div class="ar-ws-bar">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="ar-back">Finding aid</button>' +
      '<button type="button" class="ca-btn" id="ar-nav-toggle">Outline</button>' +
      "<h1>" + esc(cat.title) + "</h1>" +
      '<span class="ar-mgr-note">' + esc(cat.purpose) + '</span><span style="flex:1"></span>' +
      (cat.manager ? '<button type="button" class="ca-btn" data-variant="quiet" id="ar-open-mgr">' + esc(DEMO.managerMeta[cat.manager].title) + " collection</button>" : "") +
      '<button type="button" class="ca-btn" data-variant="quiet" id="ar-cat-reset">Reset box</button>' +
      "</div>" +
      '<div class="ar-ws-grid">' +
      '<nav class="ar-outline" id="ar-nav" aria-label="Collection outline">' +
      '<div class="ar-searchbox" style="margin-bottom:10px">' + V.icon("search") +
      '<input id="ar-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></div>' +
      '<div class="ar-hits" id="ar-ws-hits" role="listbox" hidden></div>' +
      nav + "</nav>" +
      '<div class="ar-box" id="ar-doc">' +
      '<div class="ar-running">' + esc(cat.title) + " · box document · CursorAuto</div>" +
      sections + spell + "</div>" +
      '<aside class="ar-prov" aria-label="Provenance inspector"><h2 style="margin:0 0 8px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--pm-ink-faint)">Provenance</h2>' +
      '<p class="ar-mgr-note">Focus a setting row to inspect source, scope, and effective value. Retrieval leaves the rest of the aid still.</p></aside>' +
      "</div></div>";
  }

  function renderWorkspace() {
    var cat = catById(view.cat) || DEMO.categories[0];
    root.innerHTML = workspaceHtml(cat);
    var doc = document.getElementById("ar-doc");
    var nav = document.getElementById("ar-nav");

    nav.querySelectorAll("[data-acc]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-acc");
        if (id !== cat.id) { view = { name: "workspace", cat: id, focusSub: null, focusSetting: null }; render(); }
      });
    });
    nav.querySelectorAll("[data-sub]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sec = document.getElementById("sec-" + b.getAttribute("data-sub"));
        if (sec) PMSpy.jumpTo(sec, { root: doc });
        nav.removeAttribute("data-open");
      });
    });

    V.wireSearch({
      input: document.getElementById("ar-ws-search"),
      listEl: document.getElementById("ar-ws-hits"),
      index: INDEX,
      onPick: onSearchPick
    });

    var sections = cat.subcategories.map(function (sub) { return document.getElementById("sec-" + sub.id); }).filter(Boolean);
    spy = PMSpy.attach({
      root: doc,
      sections: sections,
      offsetPx: 64,
      onActive: function (id) {
        var sub = id.replace(/^sec-/, "");
        nav.querySelectorAll("[data-sub]").forEach(function (b) {
          b.setAttribute("aria-current", String(b.getAttribute("data-sub") === sub));
        });
      }
    });

    doc.querySelectorAll(".ar-adv").forEach(function (d) {
      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });
    });

    document.getElementById("ar-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    document.getElementById("ar-nav-toggle").addEventListener("click", function () {
      nav.setAttribute("data-open", nav.getAttribute("data-open") === "true" ? "false" : "true");
    });
    var mgrBtn = document.getElementById("ar-open-mgr");
    if (mgrBtn) mgrBtn.addEventListener("click", function () {
      if (MANAGERS[cat.manager]) { view = { name: "manager", id: cat.manager }; render(); }
      else PMStore.receipt("The " + DEMO.managerMeta[cat.manager].title + " manager is realized richly in another concept of this bakeoff; its settings live inline here", "info");
    });

    var resetBtn = document.getElementById("ar-cat-reset");
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
          if (resetArmed === cat.id) { resetArmed = null; resetBtn.textContent = "Reset box"; }
        }, 2600);
      }
    });

    if (cat.id === "appearance") V.mountSpellcheck(document.getElementById("ar-spell"), {});

    if (view.focusSetting) {
      var row = document.getElementById("row-" + view.focusSetting);
      if (row) {
        var adv = row.closest(".ar-adv");
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
  /* PROVIDERS — control room                                            */
  /* ------------------------------------------------------------------ */

  function providerRowHtml(p) {
    var st = V.providerStatus(p);
    var act = V.activeAccount(p);
    var open = !!openProviders[p.id];
    var body = "";
    if (open) {
      body = '<div class="ar-prow-body">' +
        "<h4 style='font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--pm-ink-faint);margin:0 0 6px'>Accounts and connections</h4>" +
        (p.installState === "not-installed"
          ? '<div class="ca-empty"><div class="ca-empty-title">Not installed</div><div class="ca-empty-guidance">' + esc(p.diagnostics[0]) + '</div><button type="button" class="ca-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">Install</button></div>'
          : (p.accounts.length ? p.accounts.map(function (a) { return V.accountRowHtml(p, a); }).join("")
            : '<div class="ca-empty"><div class="ca-empty-title">Signed out</div><div class="ca-empty-guidance">The CLI is installed; sign-in runs in its isolated profile.</div><button type="button" class="ca-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button></div>')) +
        (p.accountSwitchNote ? '<p class="ar-mgr-note" style="margin-block:6px">' + esc(p.accountSwitchNote) + "</p>" : "") +
        "<h4 style='font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--pm-ink-faint);margin:12px 0 6px'>Models</h4>" + V.catalogHtml(p) +
        p.models.map(function (m) { return V.modelRowHtml(p, m); }).join("") +
        "<h4 style='font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--pm-ink-faint);margin:12px 0 6px'>Usage</h4>" + V.usageHtml(p) +
        "<h4 style='font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--pm-ink-faint);margin:12px 0 6px'>Routing</h4>" + V.routingHtml(p) + (V.installationsHtml ? V.installationsHtml(p) : "") +
        '<button type="button" class="ca-btn" data-variant="quiet" data-diag="' + esc(p.id) + '" style="margin-top:10px">Open diagnostics drawer</button>' +
        "</div>";
    }
    return '<div class="ar-prow" data-open="' + open + '">' +
      '<button type="button" class="ar-prow-head" data-prov="' + esc(p.id) + '" aria-expanded="' + open + '">' +
      '<span class="name">' + esc(p.name) + "</span>" +
      '<span class="cell">' + V.healthDot(st.dot, st.label) + "</span>" +
      '<span class="cell">' + esc(act ? act.label : "—") + "</span>" +
      '<span class="cell">' + esc(p.usageSnapshot ? p.usageSnapshot.includedRemaining + " left · " + p.usageSnapshot.pressure : "no usage reporting") + "</span>" +
      '<span class="chev">' + V.icon("chevron") + "</span></button>" + body + "</div>";
  }

  function drawerHtml() {
    var p = drawerPid && V.providerById(drawerPid);
    if (!p) return '<div class="ar-drawer" id="ar-drawer" data-open="false"></div>';
    return '<div class="ar-drawer" id="ar-drawer" data-open="true"><div class="inner">' +
      '<div class="d-h"><h3>Diagnostics — ' + esc(p.name) + '</h3><span style="flex:1"></span>' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="ar-drawer-close">Close</button></div>' +
      '<details class="ca-disclose" open><summary>Diagnostics details</summary><div class="ca-disclose-body">' + V.diagnosticsHtml(p) + "</div></details>" +
      '<p class="ar-mgr-note" style="margin-top:8px">Refresh and health activity appear here; the drawer pushes content rather than overlapping it.</p>' +
      "</div></div>";
  }

  function renderProviders() {
    var groups = ["installed-tools", "connected-accounts", "api", "server", "free"];
    var byGroup = {};
    V.providers().forEach(function (p) { (byGroup[p.connectionGroup] = byGroup[p.connectionGroup] || []).push(p); });
    var rows = groups.filter(function (g) { return byGroup[g]; }).map(function (g) {
      return '<h2 class="ar-h2">' + esc(V.GROUP_LABEL[g]) + "</h2>" + byGroup[g].map(providerRowHtml).join("");
    }).join("");
    var freeRoutes = [
      ["API key", "Paste a key that never leaves the local secret store."],
      ["OAuth / device code", "Provider opens its own login or shows a device code."],
      ["CLI-owned login", "Reuse an already-authenticated CLI session in an isolated profile."],
      ["PM sign-in", "Use the Puppet Master account already on this machine."],
      ["Local endpoint", "Point at a local or private model server."],
      ["No authentication", "Browse or invoke without signing in when the route allows it."]
    ];
    var freeHtml = '<div class="ca-panel"><h3 class="ca-panel-h">Free Models — six auth routes</h3><div class="ca-auth-routes">' +
      freeRoutes.map(function (r) {
        return '<div class="ca-auth-route"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + "</span></div>";
      }).join("") + "</div></div>";
    root.innerHTML = '<div class="ar-mgr">' +
      '<div class="ar-console">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="ar-back">Finding aid</button>' +
      '<h1 style="margin:0;font-size:15px">Catalog — Providers</h1>' +
      '<span class="ar-mgr-note">Special collection; expand a box for its full deck</span><span style="flex:1"></span>' +
      '<div class="ar-omni" style="flex:0 1 300px"><div class="box">' + V.icon("search") +
      '<input id="ar-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></div>' +
      '<div class="ar-hits" id="ar-ws-hits" role="listbox" hidden></div></div>' +
      "</div>" +
      '<div class="ar-mgr-scroll">' +
      '<div class="ar-eyebrow" style="margin-block-end:10px">Concept 04 · Archive catalog <span class="ar-model" data-concept-model="CursorAuto">Concept model: CursorAuto</span></div>' +
      rows + freeHtml +
      '<p class="ar-mgr-note" style="margin-top:12px">Provider, account, connection, product, and model stay separate. Requested versus effective is stated wherever policy rewrites a choice.</p>' +
      "</div>" + drawerHtml() + "</div>";

    document.getElementById("ar-back").addEventListener("click", function () { view = { name: "home" }; drawerPid = null; render(); });
    V.wireSearch({ input: document.getElementById("ar-ws-search"), listEl: document.getElementById("ar-ws-hits"), index: INDEX, onPick: onSearchPick });
    root.querySelectorAll("[data-prov]").forEach(function (b) {
      b.addEventListener("click", function () {
        openProviders[b.getAttribute("data-prov")] = !openProviders[b.getAttribute("data-prov")];
        render();
      });
    });
    root.querySelectorAll("[data-diag]").forEach(function (b) {
      b.addEventListener("click", function () {
        drawerPid = b.getAttribute("data-diag");
        render();
      });
    });
    var close = document.getElementById("ar-drawer-close");
    if (close) close.addEventListener("click", function () { drawerPid = null; render(); });
  }

  /* ------------------------------------------------------------------ */
  /* CREW MANAGER                                                        */
  /* ------------------------------------------------------------------ */

  function seatsHtml(crew) {
    var seats = "";
    var i;
    for (i = 0; i < crew.membersEffective; i++) seats += '<span class="ar-seat" data-state="effective" data-tip="Running concurrently">R</span>';
    for (i = 0; i < crew.membersRequested - crew.membersEffective; i++) seats += '<span class="ar-seat" data-state="queued" data-tip="Queued for a later wave">Q</span>';
    return seats;
  }

  function crewHtml(crew) {
    var roles = crew.roles.map(function (r) {
      return '<div class="ca-row"><div class="ca-row-main"><div class="ca-row-label">' + esc(r.role) +
        ' <span class="ca-badge" data-kind="scope">Persona: ' + esc(r.persona) + "</span></div>" +
        '<div class="ca-row-desc">Candidates: ' + esc(r.candidates.join(" · ")) + "</div></div></div>";
    }).join("");
    return '<div class="ca-panel" style="margin-block-end:14px">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h3 class="ca-panel-h" style="margin:0">' + esc(crew.name) + "</h3>" +
      '<span class="ca-badge" data-kind="scope">' + esc(crew.routePolicy) + " routing</span>" +
      '<span class="ca-badge" data-kind="scope">Worktree isolation</span>' +
      (crew.reserveForSynthesis ? '<span class="ca-badge" data-kind="scope">Reserve held for synthesis</span>' : "") + "</div>" +
      '<p style="margin:6px 0 10px;font-size:12.5px;color:var(--pm-ink-dim)">' + esc(crew.purpose) + "</p>" +
      '<div style="display:grid;gap:4px;margin-block-end:10px">' +
      '<div style="font-size:11px;color:var(--pm-ink-faint)">Requested ' + crew.membersRequested + " members — effective " + crew.membersEffective + " now, " + crew.queuedWaves + " queued wave" + (crew.queuedWaves === 1 ? "" : "s") + "</div>" +
      '<div class="ar-seats">' + seatsHtml(crew) + "</div>" +
      '<div style="font-size:11px;color:var(--pm-ink-dim)">' + esc(crew.capacityNote) + "</div></div>" +
      (crew.membersRequested > crew.membersEffective
        ? '<div class="ar-warn-banner"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 22 20H2z"/><path d="M12 9.5V14"/><path d="M12 16.5v.5"/></svg><span>Starting ' + (crew.membersRequested + 3) + " agents now is unlikely to finish before the provider resets. PM recommends two concurrent agents and three waves.</span></div>" : "") +
      roles +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">' +
      '<span class="ca-badge" data-kind="scope">Spend guard: ' + esc(crew.guards.spend) + "</span>" +
      '<span class="ca-badge" data-kind="scope">Time guard: ' + esc(crew.guards.time) + "</span>" +
      "</div>" +
      '<div style="display:flex;gap:8px;margin-top:10px;align-items:center">' +
      '<span style="font-size:11.5px;color:var(--pm-ink-dim)">Route policy</span>' +
      '<span class="ca-seg" role="radiogroup" aria-label="Route policy" data-crew-policy="' + esc(crew.id) + '">' +
      '<button type="button" role="radio" aria-checked="' + (crew.routePolicy === "strict") + '" data-value="strict">Strict</button>' +
      '<button type="button" role="radio" aria-checked="' + (crew.routePolicy === "adaptive") + '" data-value="adaptive">Adaptive</button></span>' +
      '<button type="button" class="ca-btn" data-variant="quiet" data-crew-edit="' + esc(crew.id) + '">Edit composition</button>' +
      "</div></div>";
  }
  /* ------------------------------------------------------------------ */
  /* MEDIA MANAGER                                                       */
  /* ------------------------------------------------------------------ */

  function mediaHtml(m) {
    var ready = m.health === "ready";
    var matrix =
      '<table class="ca-table ar-matrix"><thead><tr><th>Kind</th><th>Input</th><th>Output</th><th>Cost route</th></tr></thead><tbody>' +
      m.kinds.map(function (k) {
        return "<tr><td>" + esc(k[0].toUpperCase() + k.slice(1)) + "</td><td>" + esc(m.inputMode === "native" ? "Native" : "PM-transformed") + "</td><td>" +
          esc(m.outputFormat === "not-configured" ? "Not configured" : m.outputFormat) + " → " + esc(m.outputLocation === "not-configured" ? "Not configured" : m.outputLocation) + "</td><td>" + esc(m.costRoute === "not-configured" ? "Not configured" : m.costRoute) + "</td></tr>";
      }).join("") + "</tbody></table>";
    var history = m.history.length
      ? m.history.map(function (h) { return '<div class="ca-log-line">' + esc(h.at) + " — " + esc(h.summary) + "</div>"; }).join("")
      : '<div class="ca-log-line">No generations yet.</div>';
    return '<div class="ca-panel" style="margin-block-end:12px">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h3 class="ca-panel-h" style="margin:0">' + esc(m.name) + "</h3>" +
      V.healthDot(ready ? "ok" : "unknown", ready ? "Ready" : "Not configured") +
      '<span class="ca-badge" data-kind="scope">' + esc(m.routePurposes.join(" · ")) + "</span></div>" +
      '<div style="margin-block:10px">' + matrix + "</div>" +
      '<div class="ca-row" style="border:0;padding-block:4px"><div class="ca-row-main"><div class="ca-row-label">Safety policy</div></div>' +
      '<div class="ca-row-control"><span class="ca-badge" data-kind="' + (m.safetyStatus.indexOf("Warning") === 0 ? "state" : "scope") + '"' + (m.safetyStatus.indexOf("Warning") === 0 ? ' data-icon data-state="effective-differs"' : "") + ">" + esc(m.safetyStatus) + "</span></div></div>" +
      '<div class="ca-row" style="border:0;padding-block:4px"><div class="ca-row-main"><div class="ca-row-label">Fallback route</div><div class="ca-row-desc">Used when the primary route fails or refuses.</div></div>' +
      '<div class="ca-row-control"><span class="ca-select"><select data-media-fallback="' + esc(m.id) + '" aria-label="Fallback route">' +
      ["None", "Free image route", "Local model server"].map(function (f) {
        return '<option value="' + esc(f) + '"' + (m.fallbackRoute === f ? " selected" : "") + ">" + esc(f) + "</option>";
      }).join("") + "</select></span></div></div>" +
      (ready ? "" : '<div style="margin-block:8px"><button type="button" class="ca-btn" data-variant="primary" data-media-setup="' + esc(m.id) + '">Start PM-owned setup</button></div>') +
      '<details class="ar-adv"><summary>Generation history and diagnostics</summary><div class="ar-adv-body"><div class="ca-logs">' + history + "</div>" +
      '<button type="button" class="ca-btn" data-variant="quiet" data-media-diag="' + esc(m.id) + '" style="margin-top:8px">Run diagnostics</button></div></details>' +
      "</div>";
  }
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
    var scroller = root.querySelector(".ar-box") || root.querySelector("#ar-doc") || root.querySelector(".ar-mgr-scroll") || root.querySelector(".ar-home");
    var st = scroller ? scroller.scrollTop : 0;
    if (view.name === "workspace") renderWorkspace();
    else if (view.name === "manager") {
      if (view.id === "providers") renderProviders();
      else if (window.CAManagers && CAManagers.handles(view.id)) {
        CAManagers.mount({
          root: root,
          managerId: view.id,
          chrome: { wrapClass: "ar-mgr", barClass: "ar-ws-bar", detailClass: "ar-mgr-detail", backId: "ar-back" },
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
    var after = root.querySelector(".ar-box") || root.querySelector("#ar-doc") || root.querySelector(".ar-mgr-scroll") || root.querySelector(".ar-home");
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
  PMStore.on("reset", function () { openAdv = {}; openProviders = {}; drawerPid = null; });

  V.bindSettings(root, {
    getSetting: function (sid) { return DEMO.settings[sid]; },
    onChange: function (sid, value) { V.setOverride(sid, value); },
    onRun: function (sid) {
      var s = DEMO.settings[sid];
      PMStore.receipt("“" + (s ? s.label : sid) + "” simulated — no real action ran", "info");
    }
  });
  V.bindProviders(root, render);

  if (window.CAStates) CAStates.mount({ host: document.body });
  PMShell.init();
  render();
})();
