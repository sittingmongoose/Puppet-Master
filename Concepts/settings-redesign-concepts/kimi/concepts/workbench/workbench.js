/* ============================================================================
   Concept 04 — Workbench · Ops-console IA
   Ops board home (omnibox, status band, instrument panels), console
   workspace (accordion nav, sticky section headers), control-room provider
   manager with a diagnostics drawer, Crew and Media managers.
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
    crews: V.clone(DEMO.crews),
    mediaProviders: V.clone(DEMO.mediaProviders),
    spell: {
      ignored: [],
      personal: DEMO.spellcheck.personalDictionary.slice(),
      project: DEMO.spellcheck.projectDictionary.slice()
    }
  });
  PMStore.init("workbench");

  var INDEX = PMSearch.buildIndex(DEMO);
  var root = document.getElementById("wb-root");

  var view = { name: "home" };
  var spy = null;
  var openAdv = {};
  var resetArmed = null;
  var openProviders = {};
  var drawerPid = null;

  var MANAGERS = { providers: true, crew: true, media: true };
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
  /* OPS BOARD                                                           */
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
    return '<div class="wb-band">' +
      '<button type="button" class="wb-stat" data-band="ops"><span class="k">Needs attention</span><span class="v">' + (calm ? 0 : attention) + '</span><span class="s">broken, signed out, or unsafe</span></button>' +
      '<button type="button" class="wb-stat" data-band="ops"><span class="k">Setup in progress</span><span class="v">' + (calm ? 0 : setups) + '</span><span class="s">onboarding left unfinished on purpose</span></button>' +
      '<button type="button" class="wb-stat" data-band="providers"><span class="k">Providers ready</span><span class="v">' + ready + " of " + V.providers().length + '</span><span class="s">Anthropic, Copilot, local server</span></button>' +
      '<button type="button" class="wb-stat" data-band="providers"><span class="k">Usage pressure</span><span class="v">' + (worst === "high" ? "High" : worst === "medium" ? "Medium" : "Low") + '</span><span class="s">OpenAI included usage is exhausted</span></button>' +
      '<button type="button" class="wb-stat" data-band="providers"><span class="k">Catalogs</span><span class="v">' + (refreshing ? "Refreshing" : "Fresh") + '</span><span class="s">' + (refreshing ? "last-known-good rows stay visible" : "models.dev and provider feeds current") + "</span></button>" +
      "</div>";
  }

  function opsHtml() {
    var dismissed = PMStore.get("dismissedNotices", []);
    var list = DEMO.notices.filter(function (n) { return dismissed.indexOf(n.id) === -1; });
    if (PMStore.get("calmDemo", false) || !list.length) {
      return '<div class="wb-calm">' + V.icon("check") + "<span><b>Board is clear.</b> No attention items, no setups, no recommendations.</span></div>";
    }
    var order = { attention: 0, setup: 1, recommended: 2 };
    list.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    return list.map(function (n) {
      var kindLabel = n.kind === "attention" ? "Needs attention" : n.kind === "setup" ? "Continue setup" : "Recommended";
      return '<div class="wb-op" data-kind="' + esc(n.kind) + '">' +
        "<span><span class=\"headline\">" + esc(n.headline) + '</span><span class="why">' + esc(n.consequence) + "</span></span>" +
        '<button type="button" class="pm-btn" data-variant="primary" data-op="' + esc(n.id) + '">' + esc(n.actionLabel) + "</button>" +
        '<button type="button" class="pm-btn" data-variant="quiet" data-op-dismiss="' + esc(n.id) + '">Dismiss</button>' +
        '<span class="pm-notice-chip">' + kindLabel + "</span>" +
        "</div>";
    }).join("");
  }

  function panelsHtml() {
    return DEMO.categories.map(function (c) {
      var st = liveStats(c);
      return '<div class="wb-panel" data-panel="' + esc(c.id) + '">' +
        '<div class="head">' + V.icon(c.icon) + '<span class="name">' + esc(c.title) + "</span></div>" +
        '<div class="stats"><span>' + st.total + " settings</span>" +
        (st.managed ? "<span>" + st.managed + " managed</span>" : "") +
        (st.risky ? "<span>" + st.risky + " expert</span>" : "") +
        (st.changed ? "<span>" + st.changed + " changed this session</span>" : "") + "</div>" +
        '<div class="status">' + esc(c.statusSummary) + "</div>" +
        '<button type="button" class="pm-btn open" data-open-cat="' + esc(c.id) + '">Open ' + V.icon("chevron") + "</button>" +
        "</div>";
    }).join("");
  }

  function homeHtml() {
    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" data-recent="' + i + '">' + esc(r.label) + "</button>";
    }).join("");
    return '<div class="wb-console">' +
      '<span class="tag">Ops board</span>' +
      '<div class="wb-omni"><div class="box">' + V.icon("search") +
      '<input id="wb-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search settings, managers, actions">' +
      '</div><div class="wb-hits" id="wb-hits" role="listbox" hidden></div></div>' +
      '<span class="wb-eyebrow">Concept 04 · Workbench <span class="wb-model" data-concept-model="Kimi">Concept model: Kimi</span></span>' +
      "</div>" +
      '<div class="wb-board">' +
      bandHtml() +
      '<h2 class="wb-h2" id="wb-sec-ops">Operations</h2><div class="wb-ops">' + opsHtml() + "</div>" +
      '<h2 class="wb-h2" id="wb-sec-panels">Instruments</h2><div class="wb-panels">' + panelsHtml() + "</div>" +
      '<h2 class="wb-h2">Last changes</h2><div class="wb-last">' + recents + "</div>" +
      '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="wb-calm-toggle">Toggle calm state (demo)</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="wb-reset">Reset demo data</button>' +
      '<span class="wb-mgr-note">Ops-console IA: health first, instruments for every place.</span></div>' +
      "</div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    V.wireSearch({
      input: document.getElementById("wb-search"),
      listEl: document.getElementById("wb-hits"),
      index: INDEX,
      onPick: onSearchPick
    });
    root.querySelectorAll("[data-open-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        view = { name: "workspace", cat: b.getAttribute("data-open-cat"), focusSub: null, focusSetting: null };
        render();
      });
    });
    root.querySelectorAll("[data-band]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("data-band") === "providers") { view = { name: "manager", id: "providers" }; render(); }
        else {
          var el = document.getElementById("wb-sec-ops");
          if (el) el.scrollIntoView({ behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth", block: "start" });
        }
      });
    });
    root.querySelectorAll("[data-op]").forEach(function (b) {
      b.addEventListener("click", function () {
        var n = DEMO.notices.filter(function (x) { return x.id === b.getAttribute("data-op"); })[0];
        if (n) navigate(n.target);
      });
    });
    root.querySelectorAll("[data-op-dismiss]").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = PMStore.get("dismissedNotices", []).slice();
        d.push(b.getAttribute("data-op-dismiss"));
        PMStore.set("dismissedNotices", d);
      });
    });
    root.querySelectorAll("[data-recent]").forEach(function (b) {
      b.addEventListener("click", function () { navigate(DEMO.recents[parseInt(b.getAttribute("data-recent"), 10)].target); });
    });
    document.getElementById("wb-calm-toggle").addEventListener("click", function () {
      PMStore.set("calmDemo", !PMStore.get("calmDemo", false));
    });
    document.getElementById("wb-reset").addEventListener("click", function () {
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
      html += '<details class="wb-adv"' + (openAdv[sub.id] ? " open" : "") + ' data-adv="' + esc(sub.id) + '"><summary>Show ' +
        advanced.length + " advanced, expert, or diagnostic options</summary><div class=\"wb-adv-body\">" +
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
    if (managed) out += '<span class="pm-badge" data-kind="state" data-icon data-state="managed">' + managed + " managed</span>";
    if (custom) out += '<span class="pm-badge" data-kind="state" data-icon data-state="custom">' + custom + " changed</span>";
    if (advanced) out += '<span class="pm-badge" data-kind="exposure" data-exposure="advanced">' + advanced + " behind disclosure</span>";
    return out;
  }

  function workspaceHtml(cat) {
    var nav = DEMO.categories.map(function (c) {
      var active = c.id === cat.id;
      var subs = active ? c.subcategories.map(function (sub) {
        return '<button type="button" class="wb-acc-sub" data-sub="' + esc(sub.id) + '">' + esc(sub.title) + "</button>";
      }).join("") : "";
      return '<div class="wb-acc" data-active="' + active + '">' +
        '<button type="button" class="wb-acc-head" data-acc="' + esc(c.id) + '">' + V.icon(c.icon) + esc(c.title) +
        '<span class="count">' + c.subcategories.length + " sections</span></button>" +
        '<div class="wb-acc-body">' + subs + "</div></div>";
    }).join("");
    var sections = cat.subcategories.map(function (sub, i) {
      return '<section class="wb-sec" id="sec-' + esc(sub.id) + '">' +
        '<div class="wb-sec-head"><h2>' + esc(sub.title) + '</h2><span class="pos">Section ' + (i + 1) + " of " + cat.subcategories.length + '</span>' +
        '<span class="mini">' + sectionMini(sub) + "</span></div>" +
        '<div class="wb-sec-body"><p class="wb-mgr-note" style="margin:8px 0 4px">' + esc(sub.summary) + "</p>" + rowsFor(sub) + "</div></section>";
    }).join("");
    var spell = cat.id === "appearance" ? '<section class="wb-sec" id="sec-spellcheck-demo"><div class="wb-sec-head"><h2>Spellcheck, live</h2><span class="pos">Shared input service</span></div><div class="wb-sec-body"><p class="wb-mgr-note" style="margin:8px 0">It never changes text by itself; code tokens and paths are skipped.</p><div id="wb-spell"></div></div></section>' : "";
    return '<div class="wb-ws">' +
      '<div class="wb-console">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="wb-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Board</button>' +
      '<button type="button" class="pm-btn wb-nav-toggle" id="wb-nav-toggle">Navigation</button>' +
      "<h1 style=\"margin:0;font-size:15px\">" + esc(cat.title) + "</h1>" +
      '<span class="wb-mgr-note">' + esc(cat.purpose) + "</span><span style=\"flex:1\"></span>" +
      (cat.manager ? '<button type="button" class="pm-btn" data-variant="quiet" id="wb-open-mgr">' + esc(DEMO.managerMeta[cat.manager].title) + " manager</button>" : "") +
      '<button type="button" class="pm-btn" data-variant="quiet" id="wb-cat-reset">Reset place</button>' +
      "</div>" +
      '<div class="wb-ws-body">' +
      '<nav class="wb-nav" id="wb-nav" aria-label="Settings navigation">' +
      '<div class="wb-omni"><div class="box">' + V.icon("search") +
      '<input id="wb-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></div>' +
      '<div class="wb-hits" id="wb-ws-hits" role="listbox" hidden></div></div>' +
      nav + "</nav>" +
      '<div class="wb-doc" id="wb-doc">' + sections + spell + "</div>" +
      "</div></div>";
  }

  function renderWorkspace() {
    var cat = catById(view.cat) || DEMO.categories[0];
    root.innerHTML = workspaceHtml(cat);
    var doc = document.getElementById("wb-doc");
    var nav = document.getElementById("wb-nav");

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
      input: document.getElementById("wb-ws-search"),
      listEl: document.getElementById("wb-ws-hits"),
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

    doc.querySelectorAll(".wb-adv").forEach(function (d) {
      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });
    });

    document.getElementById("wb-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    document.getElementById("wb-nav-toggle").addEventListener("click", function () {
      nav.setAttribute("data-open", nav.getAttribute("data-open") === "true" ? "false" : "true");
    });
    var mgrBtn = document.getElementById("wb-open-mgr");
    if (mgrBtn) mgrBtn.addEventListener("click", function () {
      if (MANAGERS[cat.manager]) { view = { name: "manager", id: cat.manager }; render(); }
      else PMStore.receipt("The " + DEMO.managerMeta[cat.manager].title + " manager is realized richly in another concept of this bakeoff; its settings live inline here", "info");
    });

    var resetBtn = document.getElementById("wb-cat-reset");
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

    if (cat.id === "appearance") V.mountSpellcheck(document.getElementById("wb-spell"), {});

    if (view.focusSetting) {
      var row = document.getElementById("row-" + view.focusSetting);
      if (row) {
        var adv = row.closest(".wb-adv");
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
      body = '<div class="wb-prow-body">' +
        "<h4 style='font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--pm-ink-faint);margin:0 0 6px'>Accounts and connections</h4>" +
        (p.installState === "not-installed"
          ? '<div class="pm-empty"><div class="pm-empty-title">Not installed</div><div class="pm-empty-guidance">' + esc(p.diagnostics[0]) + '</div><button type="button" class="pm-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">Install</button></div>'
          : (p.accounts.length ? p.accounts.map(function (a) { return V.accountRowHtml(p, a); }).join("")
            : '<div class="pm-empty"><div class="pm-empty-title">Signed out</div><div class="pm-empty-guidance">The CLI is installed; sign-in runs in its isolated profile.</div><button type="button" class="pm-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button></div>')) +
        (p.accountSwitchNote ? '<p class="wb-mgr-note" style="margin-block:6px">' + esc(p.accountSwitchNote) + "</p>" : "") +
        "<h4 style='font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--pm-ink-faint);margin:12px 0 6px'>Models</h4>" + V.catalogHtml(p) +
        p.models.map(function (m) { return V.modelRowHtml(p, m); }).join("") +
        "<h4 style='font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--pm-ink-faint);margin:12px 0 6px'>Usage</h4>" + V.usageHtml(p) +
        "<h4 style='font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--pm-ink-faint);margin:12px 0 6px'>Routing</h4>" + V.routingHtml(p) +
        '<button type="button" class="pm-btn" data-variant="quiet" data-diag="' + esc(p.id) + '" style="margin-top:10px">Open diagnostics drawer</button>' +
        "</div>";
    }
    return '<div class="wb-prow" data-open="' + open + '">' +
      '<button type="button" class="wb-prow-head" data-prov="' + esc(p.id) + '" aria-expanded="' + open + '">' +
      '<span class="name">' + esc(p.name) + "</span>" +
      '<span class="cell">' + V.healthDot(st.dot, st.label) + "</span>" +
      '<span class="cell">' + esc(act ? act.label : "—") + "</span>" +
      '<span class="cell">' + esc(p.usageSnapshot ? p.usageSnapshot.includedRemaining + " left · " + p.usageSnapshot.pressure : "no usage reporting") + "</span>" +
      '<span class="chev">' + V.icon("chevron") + "</span></button>" + body + "</div>";
  }

  function drawerHtml() {
    var p = drawerPid && V.providerById(drawerPid);
    if (!p) return '<div class="wb-drawer" id="wb-drawer" data-open="false"></div>';
    return '<div class="wb-drawer" id="wb-drawer" data-open="true"><div class="inner">' +
      '<div class="d-h"><h3>Diagnostics — ' + esc(p.name) + '</h3><span style="flex:1"></span>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="wb-drawer-close">Close</button></div>' +
      V.diagnosticsHtml(p) +
      '<p class="wb-mgr-note" style="margin-top:8px">Refresh and health activity appear here; the drawer pushes content rather than overlapping it.</p>' +
      "</div></div>";
  }

  function renderProviders() {
    var groups = ["installed-tools", "connected-accounts", "api", "server", "free"];
    var byGroup = {};
    V.providers().forEach(function (p) { (byGroup[p.connectionGroup] = byGroup[p.connectionGroup] || []).push(p); });
    var rows = groups.filter(function (g) { return byGroup[g]; }).map(function (g) {
      return '<h2 class="wb-h2">' + esc(V.GROUP_LABEL[g]) + "</h2>" + byGroup[g].map(providerRowHtml).join("");
    }).join("");
    root.innerHTML = '<div class="wb-mgr">' +
      '<div class="wb-console">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="wb-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Board</button>' +
      '<h1 style="margin:0;font-size:15px">Providers — control room</h1>' +
      '<span class="wb-mgr-note">Dense inventory; expand a row for its full deck</span><span style="flex:1"></span>' +
      '<div class="wb-omni" style="flex:0 1 300px"><div class="box">' + V.icon("search") +
      '<input id="wb-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></div>' +
      '<div class="wb-hits" id="wb-ws-hits" role="listbox" hidden></div></div>' +
      "</div>" +
      '<div class="wb-mgr-scroll">' +
      '<div class="wb-eyebrow" style="margin-block-end:10px">Concept 04 · Workbench <span class="wb-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      rows +
      '<h2 class="wb-h2">Agent role assignments</h2>' +
      '<div class="pm-panel">' + V.rolesHtml(PMStore.get("roles", [])) + "</div>" +
      '<p class="wb-mgr-note" style="margin-top:12px">Provider, account, connection, product, and model stay separate. Requested versus effective is stated wherever policy rewrites a choice.</p>' +
      "</div>" + drawerHtml() + "</div>";

    document.getElementById("wb-back").addEventListener("click", function () { view = { name: "home" }; drawerPid = null; render(); });
    V.wireSearch({ input: document.getElementById("wb-ws-search"), listEl: document.getElementById("wb-ws-hits"), index: INDEX, onPick: onSearchPick });
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
    var close = document.getElementById("wb-drawer-close");
    if (close) close.addEventListener("click", function () { drawerPid = null; render(); });
  }

  /* ------------------------------------------------------------------ */
  /* CREW MANAGER                                                        */
  /* ------------------------------------------------------------------ */

  function seatsHtml(crew) {
    var seats = "";
    var i;
    for (i = 0; i < crew.membersEffective; i++) seats += '<span class="wb-seat" data-state="effective" data-tip="Running concurrently">R</span>';
    for (i = 0; i < crew.membersRequested - crew.membersEffective; i++) seats += '<span class="wb-seat" data-state="queued" data-tip="Queued for a later wave">Q</span>';
    return seats;
  }

  function crewHtml(crew) {
    var roles = crew.roles.map(function (r) {
      return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">' + esc(r.role) +
        ' <span class="pm-badge" data-kind="scope">Persona: ' + esc(r.persona) + "</span></div>" +
        '<div class="pm-row-desc">Candidates: ' + esc(r.candidates.join(" · ")) + "</div></div></div>";
    }).join("");
    return '<div class="pm-panel" style="margin-block-end:14px">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h3 class="pm-panel-h" style="margin:0">' + esc(crew.name) + "</h3>" +
      '<span class="pm-badge" data-kind="scope">' + esc(crew.routePolicy) + " routing</span>" +
      '<span class="pm-badge" data-kind="scope">Worktree isolation</span>' +
      (crew.reserveForSynthesis ? '<span class="pm-badge" data-kind="scope">Reserve held for synthesis</span>' : "") + "</div>" +
      '<p style="margin:6px 0 10px;font-size:12.5px;color:var(--pm-ink-dim)">' + esc(crew.purpose) + "</p>" +
      '<div style="display:grid;gap:4px;margin-block-end:10px">' +
      '<div style="font-size:11px;color:var(--pm-ink-faint)">Requested ' + crew.membersRequested + " members — effective " + crew.membersEffective + " now, " + crew.queuedWaves + " queued wave" + (crew.queuedWaves === 1 ? "" : "s") + "</div>" +
      '<div class="wb-seats">' + seatsHtml(crew) + "</div>" +
      '<div style="font-size:11px;color:var(--pm-ink-dim)">' + esc(crew.capacityNote) + "</div></div>" +
      (crew.membersRequested > crew.membersEffective
        ? '<div class="wb-warn-banner"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 22 20H2z"/><path d="M12 9.5V14"/><path d="M12 16.5v.5"/></svg><span>Starting ' + (crew.membersRequested + 3) + " agents now is unlikely to finish before the provider resets. PM recommends two concurrent agents and three waves.</span></div>" : "") +
      roles +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">' +
      '<span class="pm-badge" data-kind="scope">Spend guard: ' + esc(crew.guards.spend) + "</span>" +
      '<span class="pm-badge" data-kind="scope">Time guard: ' + esc(crew.guards.time) + "</span>" +
      "</div>" +
      '<div style="display:flex;gap:8px;margin-top:10px;align-items:center">' +
      '<span style="font-size:11.5px;color:var(--pm-ink-dim)">Route policy</span>' +
      '<span class="pm-seg" role="radiogroup" aria-label="Route policy" data-crew-policy="' + esc(crew.id) + '">' +
      '<button type="button" role="radio" aria-checked="' + (crew.routePolicy === "strict") + '" data-value="strict">Strict</button>' +
      '<button type="button" role="radio" aria-checked="' + (crew.routePolicy === "adaptive") + '" data-value="adaptive">Adaptive</button></span>' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-crew-edit="' + esc(crew.id) + '">Edit composition</button>' +
      "</div></div>";
  }

  function renderCrew() {
    var crews = PMStore.get("crews", []);
    root.innerHTML = '<div class="wb-mgr"><div class="wb-console">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="wb-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Board</button>' +
      '<h1 style="margin:0;font-size:15px">Crew</h1>' +
      '<span class="wb-mgr-note">Reusable multi-agent execution templates, owned by the Orchestrator</span></div>' +
      '<div class="wb-mgr-scroll">' +
      '<div class="wb-eyebrow" style="margin-block-end:10px">Concept 04 · Workbench <span class="wb-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      '<p class="wb-mgr-note" style="margin-block-end:12px">Settings configures the policy; the Orchestrator makes the live decision. Requested composition is preserved even when current capacity admits fewer concurrent members — and a Crew picked in one thread never changes another thread.</p>' +
      crews.map(crewHtml).join("") +
      "</div></div>";
    document.getElementById("wb-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    root.querySelectorAll("[data-crew-policy] [data-value]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.closest("[data-crew-policy]").getAttribute("data-crew-policy");
        var crews = PMStore.get("crews", []).slice();
        crews.forEach(function (c) { if (c.id === id) c.routePolicy = b.getAttribute("data-value"); });
        PMStore.set("crews", crews);
        PMStore.receipt("Route policy updated for the template (simulated)", "ok");
      });
    });
    root.querySelectorAll("[data-crew-edit]").forEach(function (b) {
      b.addEventListener("click", function () { PMStore.receipt("Composition editing simulated — the template was not changed", "info"); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* MEDIA MANAGER                                                       */
  /* ------------------------------------------------------------------ */

  function mediaHtml(m) {
    var ready = m.health === "ready";
    var matrix =
      '<table class="pm-table wb-matrix"><thead><tr><th>Kind</th><th>Input</th><th>Output</th><th>Cost route</th></tr></thead><tbody>' +
      m.kinds.map(function (k) {
        return "<tr><td>" + esc(k[0].toUpperCase() + k.slice(1)) + "</td><td>" + esc(m.inputMode === "native" ? "Native" : "PM-transformed") + "</td><td>" +
          esc(m.outputFormat === "not-configured" ? "Not configured" : m.outputFormat) + " → " + esc(m.outputLocation === "not-configured" ? "Not configured" : m.outputLocation) + "</td><td>" + esc(m.costRoute === "not-configured" ? "Not configured" : m.costRoute) + "</td></tr>";
      }).join("") + "</tbody></table>";
    var history = m.history.length
      ? m.history.map(function (h) { return '<div class="pm-log-line">' + esc(h.at) + " — " + esc(h.summary) + "</div>"; }).join("")
      : '<div class="pm-log-line">No generations yet.</div>';
    return '<div class="pm-panel" style="margin-block-end:12px">' +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h3 class="pm-panel-h" style="margin:0">' + esc(m.name) + "</h3>" +
      V.healthDot(ready ? "ok" : "unknown", ready ? "Ready" : "Not configured") +
      '<span class="pm-badge" data-kind="scope">' + esc(m.routePurposes.join(" · ")) + "</span></div>" +
      '<div style="margin-block:10px">' + matrix + "</div>" +
      '<div class="pm-row" style="border:0;padding-block:4px"><div class="pm-row-main"><div class="pm-row-label">Safety policy</div></div>' +
      '<div class="pm-row-control"><span class="pm-badge" data-kind="' + (m.safetyStatus.indexOf("Warning") === 0 ? "state" : "scope") + '"' + (m.safetyStatus.indexOf("Warning") === 0 ? ' data-icon data-state="effective-differs"' : "") + ">" + esc(m.safetyStatus) + "</span></div></div>" +
      '<div class="pm-row" style="border:0;padding-block:4px"><div class="pm-row-main"><div class="pm-row-label">Fallback route</div><div class="pm-row-desc">Used when the primary route fails or refuses.</div></div>' +
      '<div class="pm-row-control"><span class="pm-select"><select data-media-fallback="' + esc(m.id) + '" aria-label="Fallback route">' +
      ["None", "Free image route", "Local model server"].map(function (f) {
        return '<option value="' + esc(f) + '"' + (m.fallbackRoute === f ? " selected" : "") + ">" + esc(f) + "</option>";
      }).join("") + "</select></span></div></div>" +
      (ready ? "" : '<div style="margin-block:8px"><button type="button" class="pm-btn" data-variant="primary" data-media-setup="' + esc(m.id) + '">Start PM-owned setup</button></div>') +
      '<details class="wb-adv"><summary>Generation history and diagnostics</summary><div class="wb-adv-body"><div class="pm-logs">' + history + "</div>" +
      '<button type="button" class="pm-btn" data-variant="quiet" data-media-diag="' + esc(m.id) + '" style="margin-top:8px">Run diagnostics</button></div></details>' +
      "</div>";
  }

  function renderMedia() {
    var providers = PMStore.get("mediaProviders", []);
    root.innerHTML = '<div class="wb-mgr"><div class="wb-console">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="wb-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Board</button>' +
      '<h1 style="margin:0;font-size:15px">Media</h1>' +
      '<span class="wb-mgr-note">Image, audio, and video routes with the same rigor as coding providers</span></div>' +
      '<div class="wb-mgr-scroll">' +
      '<div class="wb-eyebrow" style="margin-block-end:10px">Concept 04 · Workbench <span class="wb-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      providers.map(mediaHtml).join("") +
      '<p class="wb-mgr-note">A free or local route can be no-cost but rate-limited, promotional, account-required, keyless, data-sharing, subscription-included, or temporarily unavailable — the badge never just says “Free”.</p>' +
      "</div></div>";
    document.getElementById("wb-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    root.querySelectorAll("[data-media-fallback]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var id = sel.getAttribute("data-media-fallback");
        var list = PMStore.get("mediaProviders", []).slice();
        list.forEach(function (m) { if (m.id === id) m.fallbackRoute = sel.value; });
        PMStore.set("mediaProviders", list);
        PMStore.receipt("Fallback route updated (simulated)", "ok");
      });
    });
    root.querySelectorAll("[data-media-setup]").forEach(function (b) {
      b.addEventListener("click", function () { PMStore.receipt("Media setup simulated — it would open the provider connection and return to this route", "info"); });
    });
    root.querySelectorAll("[data-media-diag]").forEach(function (b) {
      b.addEventListener("click", function () { PMStore.receipt("Media diagnostics simulated — no generation ran", "info"); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* render loop                                                         */
  /* ------------------------------------------------------------------ */

  function render() {
    if (spy) { spy.detach(); spy = null; }
    var scroller = root.querySelector(".wb-doc") || root.querySelector(".wb-mgr-scroll") || root.querySelector(".wb-board");
    var st = scroller ? scroller.scrollTop : 0;
    var wantsFocus = !!(view.focusSetting || view.focusSub);
    if (view.name === "workspace") renderWorkspace();
    else if (view.name === "manager") {
      if (view.id === "crew") renderCrew();
      else if (view.id === "media") renderMedia();
      else renderProviders();
    } else renderHome();
    var after = root.querySelector(".wb-doc") || root.querySelector(".wb-mgr-scroll") || root.querySelector(".wb-board");
    if (after && !wantsFocus) after.scrollTop = st;
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
  V.bindRoles(root);

  window.PMShell.init();
  render();
})();
