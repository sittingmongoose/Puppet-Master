/* ============================================================================
   Concept 03 — Ledger · Document IA
   Front page (masthead, decision blocks, annotated index), chapters with a
   floating TOC and reading progress, appendix-style managers: Providers,
   Personas, Skills/Plugins/Tools. Print-precision motion.
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
    personas: V.clone(DEMO.personas),
    skills: V.clone(DEMO.skills),
    plugins: V.clone(DEMO.plugins),
    tools: V.clone(DEMO.tools),
    commands: V.clone(DEMO.commands),
    spell: {
      ignored: [],
      personal: DEMO.spellcheck.personalDictionary.slice(),
      project: DEMO.spellcheck.projectDictionary.slice()
    }
  });
  PMStore.init("ledger");

  var INDEX = PMSearch.buildIndex(DEMO);
  var root = document.getElementById("ldg-root");

  var view = { name: "home" };
  var spy = null;
  var openAdv = {};
  var resetArmed = null;
  var activeSub = null;

  var MANAGERS = { providers: true, personas: true, skills: true };
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
  /* FRONT PAGE                                                          */
  /* ------------------------------------------------------------------ */

  function decisionsHtml() {
    var dismissed = PMStore.get("dismissedNotices", []);
    var list = DEMO.notices.filter(function (n) { return dismissed.indexOf(n.id) === -1; });
    if (PMStore.get("calmDemo", false) || !list.length) {
      return '<div class="ldg-calm">' + V.icon("check") + "<div><b>Nothing awaits a decision.</b> The front page leads with search and the index until something changes.</div></div>";
    }
    var order = { attention: 0, setup: 1, recommended: 2 };
    list.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    return list.map(function (n) {
      var kindLabel = n.kind === "attention" ? "Needs attention" : n.kind === "setup" ? "Continue setup" : "Recommended";
      return '<div class="ldg-decision' + (n.kind === "recommended" ? " is-recommended" : "") + '">' +
        '<div class="pm-notice" data-kind="' + esc(n.kind) + '" style="border:0;background:transparent;padding:0">' +
        '<span class="pm-notice-chip">' + kindLabel + "</span>" +
        '<div class="pm-notice-head">' + esc(n.headline) + "</div>" +
        '<div class="pm-notice-body">' + esc(n.consequence) + "</div>" +
        '<div class="pm-notice-actions"><button type="button" class="pm-btn" data-variant="primary" data-dec="' + esc(n.id) + '">' + esc(n.actionLabel) + "</button>" +
        '<button type="button" class="pm-btn" data-variant="quiet" data-dec-dismiss="' + esc(n.id) + '">' + esc(n.secondaryLabel || "Dismiss") + "</button></div></div></div>";
    }).join("");
  }

  function indexHtml() {
    return DEMO.categories.map(function (c, i) {
      return '<button type="button" class="ldg-entry" data-cat="' + esc(c.id) + '">' +
        '<span class="ldg-entry-num">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span><span class="ldg-entry-title">' + esc(c.title) + '</span><span class="ldg-entry-purpose">' + esc(c.purpose) + "</span></span>" +
        '<span class="ldg-entry-status">' + esc(c.statusSummary) + "</span></button>";
    }).join("");
  }

  function homeHtml() {
    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" class="ldg-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";
    }).join("");
    return '<div class="ldg-page"><div class="ldg-col">' +
      '<div class="ldg-masthead">' +
      '<div class="ldg-eyebrow">Concept 03 · Ledger — settings as a document <span class="ldg-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      "<h1>Settings</h1>" +
      '<div class="ldg-dateline">Seeded August 5, 2026 · One document per place, read top to bottom</div></div>' +
      '<div class="ldg-searchband">' + V.icon("search") +
      '<input id="ldg-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search the whole volume — a setting, a manager, an action"></div>' +
      '<div class="ldg-hits" id="ldg-hits" role="listbox" hidden></div>' +
      '<h2 class="ldg-h2">Needs your decision<span class="sub">One clear action each; nothing disguised as an error that is not one</span></h2>' +
      '<hr class="ldg-rule">' + decisionsHtml() +
      '<h2 class="ldg-h2">The index<span class="sub">Eleven places; each opens as a chapter</span></h2>' +
      '<hr class="ldg-rule"><div class="ldg-index">' + indexHtml() + "</div>" +
      '<h2 class="ldg-h2">Recently amended</h2><hr class="ldg-rule"><div class="ldg-recents">' + recents + "</div>" +
      '<div class="ldg-foot">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="ldg-calm-toggle">Toggle calm state (demo)</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="ldg-reset">Reset demo data</button>' +
      "<span>Document IA: reading column, floating contents, near-zero motion.</span></div>" +
      "</div></div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    var input = document.getElementById("ldg-search");
    V.wireSearch({
      input: input,
      listEl: document.getElementById("ldg-hits"),
      index: INDEX,
      onPick: onSearchPick
    });
    root.querySelectorAll("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        view = { name: "workspace", cat: b.getAttribute("data-cat"), focusSub: null, focusSetting: null };
        render();
      });
    });
    root.querySelectorAll("[data-recent]").forEach(function (b) {
      b.addEventListener("click", function () { navigate(DEMO.recents[parseInt(b.getAttribute("data-recent"), 10)].target); });
    });
    root.querySelectorAll("[data-dec]").forEach(function (b) {
      b.addEventListener("click", function () {
        var n = DEMO.notices.filter(function (x) { return x.id === b.getAttribute("data-dec"); })[0];
        if (n) navigate(n.target);
      });
    });
    root.querySelectorAll("[data-dec-dismiss]").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = PMStore.get("dismissedNotices", []).slice();
        d.push(b.getAttribute("data-dec-dismiss"));
        PMStore.set("dismissedNotices", d);
      });
    });
    document.getElementById("ldg-calm-toggle").addEventListener("click", function () {
      PMStore.set("calmDemo", !PMStore.get("calmDemo", false));
    });
    document.getElementById("ldg-reset").addEventListener("click", function () {
      PMStore.resetDemo();
      PMStore.receipt("Demo data reset to its seeded state", "ok");
    });
  }

  /* ------------------------------------------------------------------ */
  /* CHAPTER (workspace)                                                 */
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
      html += '<details class="ldg-adv"' + (openAdv[sub.id] ? " open" : "") + ' data-adv="' + esc(sub.id) + '"><summary>Show ' +
        advanced.length + " advanced, expert, or diagnostic entries</summary><div class=\"ldg-adv-body\">" +
        advanced.map(function (s) { return V.rowHtml(s); }).join("") + "</div></details>";
    }
    return html;
  }

  function workspaceHtml(cat) {
    var sections = cat.subcategories.map(function (sub) {
      return '<section class="ldg-sec" id="sec-' + esc(sub.id) + '"><h2>' + esc(sub.title) + '</h2><p class="sum">' + esc(sub.summary) + "</p>" + rowsFor(sub) + "</section>";
    }).join("");
    var spell = cat.id === "appearance" ? '<section class="ldg-sec" id="sec-spellcheck-demo"><h2>Spellcheck, live</h2><p class="sum">The shared writing service on a draft — it never changes text by itself.</p><div id="ldg-spell"></div></section>' : "";
    var tocItems = cat.subcategories.map(function (sub) {
      return '<button type="button" class="ldg-toc-item" data-toc="' + esc(sub.id) + '"><span class="dot"></span>' + esc(sub.title) + "</button>";
    }).join("");
    var tocCats = DEMO.categories.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === cat.id ? " selected" : "") + ">" + esc(c.title) + "</option>";
    }).join("");
    var railDots = cat.subcategories.map(function (sub) {
      return '<button type="button" class="r-dot" data-rail="' + esc(sub.id) + '" aria-label="Jump to ' + esc(sub.title) + '"></button>';
    }).join("");
    return '<div class="ldg-wrap"><div class="ldg-page ldg-chapter"><div class="ldg-col">' +
      '<div class="ldg-band">' +
      '<div class="ldg-eyebrow">Chapter ' + String(DEMO.categories.indexOf(cat) + 1).padStart(2, "0") + ' <span class="ldg-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      "<h1>" + esc(cat.title) + '</h1><p class="purpose">' + esc(cat.purpose) + " · " + esc(cat.statusSummary) + "</p>" +
      '<div class="tools">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="ldg-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Front page</button>' +
      (cat.manager ? '<button type="button" class="pm-btn" data-variant="quiet" id="ldg-open-mgr">' + esc(DEMO.managerMeta[cat.manager].title) + " chapter</button>" : "") +
      '<button type="button" class="pm-btn" data-variant="quiet" id="ldg-cat-reset">Reset chapter to defaults</button>' +
      "</div></div>" +
      sections + spell +
      "</div></div>" +
      '<aside class="ldg-toc" id="ldg-toc" aria-label="Contents">' +
      '<div class="progress"><span id="ldg-progress"></span></div>' +
      '<p class="t-h">Contents</p>' +
      '<span class="pm-select" style="inline-size:100%"><select id="ldg-toc-cat" aria-label="Chapter" style="inline-size:100%">' + tocCats + "</select></span>" +
      '<div class="t-search"><input id="ldg-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings">' +
      '<div class="t-hits" id="ldg-ws-hits" role="listbox" hidden></div></div>' +
      '<div class="ldg-toc-list">' + tocItems + "</div>" +
      "</aside>" +
      '<div class="ldg-toc-rail" id="ldg-rail">' + railDots +
      '<button type="button" class="r-open" id="ldg-rail-open" aria-label="Open contents">' + V.icon("book") + "</button></div>" +
      "</div>";
  }

  function sweep(sec) {
    sec.removeAttribute("data-swept");
    void sec.offsetWidth;
    sec.setAttribute("data-swept", "1");
  }

  function renderWorkspace() {
    var cat = catById(view.cat) || DEMO.categories[0];
    root.innerHTML = workspaceHtml(cat);
    var page = root.querySelector(".ldg-page");
    var toc = document.getElementById("ldg-toc");

    document.getElementById("ldg-toc-cat").addEventListener("change", function (ev) {
      view = { name: "workspace", cat: ev.target.value, focusSub: null, focusSetting: null };
      render();
    });

    function jumpToSub(subId) {
      var sec = document.getElementById("sec-" + subId);
      if (sec) PMSpy.jumpTo(sec, { root: page, onDone: function () { sweep(sec); } });
      toc.removeAttribute("data-rail-open");
    }

    toc.querySelectorAll("[data-toc]").forEach(function (b) {
      b.addEventListener("click", function () { jumpToSub(b.getAttribute("data-toc")); });
    });
    document.getElementById("ldg-rail").querySelectorAll("[data-rail]").forEach(function (b) {
      b.addEventListener("click", function () { jumpToSub(b.getAttribute("data-rail")); });
    });
    document.getElementById("ldg-rail-open").addEventListener("click", function () {
      if (toc.hasAttribute("data-rail-open")) toc.removeAttribute("data-rail-open");
      else toc.setAttribute("data-rail-open", "1");
    });

    V.wireSearch({
      input: document.getElementById("ldg-ws-search"),
      listEl: document.getElementById("ldg-ws-hits"),
      index: INDEX,
      onPick: onSearchPick
    });

    var sections = cat.subcategories.map(function (sub) { return document.getElementById("sec-" + sub.id); }).filter(Boolean);
    spy = PMSpy.attach({
      root: page,
      sections: sections,
      offsetPx: 90,
      onActive: function (id) {
        var sub = id.replace(/^sec-/, "");
        activeSub = sub;
        root.querySelectorAll("[data-toc]").forEach(function (t) {
          t.setAttribute("aria-current", String(t.getAttribute("data-toc") === sub));
        });
        root.querySelectorAll("[data-rail]").forEach(function (t) {
          t.setAttribute("aria-current", String(t.getAttribute("data-rail") === sub));
        });
      }
    });

    /* reading progress hairline */
    page.addEventListener("scroll", function () {
      var max = page.scrollHeight - page.clientHeight;
      var bar = document.getElementById("ldg-progress");
      if (bar && max > 0) bar.style.inlineSize = Math.min(100, (page.scrollTop / max) * 100) + "%";
    }, { passive: true });

    root.querySelectorAll(".ldg-adv").forEach(function (d) {
      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });
    });

    document.getElementById("ldg-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    var mgrBtn = document.getElementById("ldg-open-mgr");
    if (mgrBtn) mgrBtn.addEventListener("click", function () {
      if (MANAGERS[cat.manager]) { view = { name: "manager", id: cat.manager }; render(); }
      else PMStore.receipt("The " + DEMO.managerMeta[cat.manager].title + " manager is realized richly in another concept of this bakeoff; its settings live inline here", "info");
    });

    var resetBtn = document.getElementById("ldg-cat-reset");
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
          if (resetArmed === cat.id) { resetArmed = null; resetBtn.textContent = "Reset chapter to defaults"; }
        }, 2600);
      }
    });

    if (cat.id === "appearance") V.mountSpellcheck(document.getElementById("ldg-spell"), {});

    if (view.focusSetting) {
      var row = document.getElementById("row-" + view.focusSetting);
      if (row) {
        var adv = row.closest(".ldg-adv");
        if (adv && !adv.open) { adv.open = true; openAdv[adv.getAttribute("data-adv")] = true; }
        PMSpy.jumpTo(row, { root: page });
      }
      view.focusSetting = null;
    } else if (view.focusSub) {
      var sec = document.getElementById("sec-" + view.focusSub);
      if (sec) PMSpy.jumpTo(sec, { root: page, onDone: function () { sweep(sec); } });
      view.focusSub = null;
    }
  }

  /* ------------------------------------------------------------------ */
  /* PROVIDERS — appendix chapter                                        */
  /* ------------------------------------------------------------------ */

  function stampHtml(p) {
    var st = V.providerStatus(p);
    var act = V.activeAccount(p);
    var u = p.usageSnapshot;
    return '<div class="ldg-stamp">' +
      '<div><div class="k">Status</div><div class="v">' + V.healthDot(st.dot, st.label) + "</div></div>" +
      '<div><div class="k">Connection</div><div class="v">' + esc(act ? act.label : "None active") + "</div></div>" +
      '<div><div class="k">Plan</div><div class="v">' + esc(p.product.plan) + "</div></div>" +
      '<div><div class="k">Usage</div><div class="v">' + esc(u ? u.includedRemaining + " left · " + u.pressure + " pressure" : "Not reported on this route") + "</div></div>" +
      '<div><div class="k">Last successful generation</div><div class="v">' + esc(act ? act.lastSuccessfulGeneration : "Never") + "</div></div>" +
      "</div>";
  }

  function famHtml(p) {
    var accounts = p.installState === "not-installed"
      ? '<div class="pm-empty"><div class="pm-empty-title">Not installed</div><div class="pm-empty-guidance">' + esc(p.diagnostics[0]) + '</div><button type="button" class="pm-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">Install</button></div>'
      : (p.accounts.length ? p.accounts.map(function (a) { return V.accountRowHtml(p, a); }).join("")
        : '<div class="pm-empty"><div class="pm-empty-title">Signed out</div><div class="pm-empty-guidance">The CLI is installed; its own sign-in flow runs inside an isolated profile.</div><button type="button" class="pm-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button></div>');
    var models = p.models.map(function (m) {
      var ev = "";
      ["tools", "vision", "structuredOutput"].forEach(function (k) {
        var cap = m.capabilities[k];
        ev += "<div>" + esc(k.replace(/([A-Z])/g, " $1").replace(/^./, function (c) { return c.toUpperCase(); })) + ": " + esc(V.human(V.CAP_STATE, cap.state)) + " — " + esc(cap.evidence) + (cap.freshAsOf ? " (" + esc(cap.freshAsOf) + ")" : "") + "</div>";
      });
      return V.modelRowHtml(p, m) +
        '<details class="ldg-evidence"' + (openAdv["ev-" + p.id + "-" + m.id] ? " open" : "") + ' data-adv="ev-' + esc(p.id + "-" + m.id) + '"><summary>Capability evidence</summary><div>' + ev + "</div></details>";
    }).join("");
    return '<div class="ldg-fam"><h3>' + esc(p.name) + '</h3><p class="tag">' + esc(p.tagline) + "</p>" +
      stampHtml(p) + accounts +
      (p.accountSwitchNote ? '<p class="ldg-mgr-note" style="margin-block:8px">' + esc(p.accountSwitchNote) + "</p>" : "") +
      (p.groupingNote ? '<p class="ldg-mgr-note" style="margin-block:8px">' + esc(p.groupingNote) + "</p>" : "") +
      "<h4 style='font-size:13px;margin:14px 0 4px'>Models</h4>" + V.catalogHtml(p) + models +
      "<h4 style='font-size:13px;margin:16px 0 4px'>Usage snapshot</h4>" + V.usageHtml(p) +
      "<h4 style='font-size:13px;margin:16px 0 4px'>Routing</h4>" + V.routingHtml(p) +
      "<h4 style='font-size:13px;margin:16px 0 4px'>Diagnostics</h4>" + V.diagnosticsHtml(p) +
      "</div>";
  }

  function renderProviders() {
    root.innerHTML = '<div class="ldg-page"><div class="ldg-col">' +
      '<div class="ldg-band"><div class="ldg-eyebrow">Appendix A · Manager <span class="ldg-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      "<h1>Providers</h1>" + '<p class="purpose">Accounts, connections, models, and routing — each family stamped with its current state.</p>' +
      '<div class="tools"><button type="button" class="pm-btn" data-variant="quiet" id="ldg-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Front page</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="ldg-mgr-home">Open the Providers place</button></div></div>' +
      '<p class="ldg-mgr-note" style="margin-block-end:18px">Provider, account, connection, product, and model stay separate concepts; sign-in ownership is stated per family.</p>' +
      V.providers().map(famHtml).join("") +
      '<h2 class="ldg-inv-h">Agent role assignments</h2>' +
      V.rolesHtml(PMStore.get("roles", [])) +
      "</div></div>";
    document.getElementById("ldg-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    document.getElementById("ldg-mgr-home").addEventListener("click", function () {
      view = { name: "workspace", cat: "providers", focusSub: null, focusSetting: null };
      render();
    });
    root.querySelectorAll(".ldg-evidence").forEach(function (d) {
      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* PERSONAS MANAGER                                                    */
  /* ------------------------------------------------------------------ */

  var SCOPE_OPTIONS = [
    ["turn", "This turn"], ["thread", "This thread"], ["goal", "This Goal or PlanningRun"],
    ["project", "Project default for new work"], ["global", "Global default for new work"], ["child", "Child only"]
  ];

  function personaHtml(p) {
    var scopeOpts = SCOPE_OPTIONS.map(function (s) {
      var disabled = p.childOnly && s[0] !== "child";
      return '<option value="' + s[0] + '"' + (p.scopeChoice === s[0] || (!p.scopeChoice && p.childOnly && s[0] === "child") ? " selected" : "") + (disabled ? " disabled" : "") + ">" + s[1] + "</option>";
    }).join("");
    return '<div class="ldg-persona">' +
      "<h3>" + esc(p.name) + (p.childOnly ? ' <span class="pm-badge" data-kind="exposure" data-icon data-exposure="managed">Child only</span>' : "") + "</h3>" +
      '<p class="role">' + esc(p.roleSummary) + "</p>" +
      '<div class="ldg-capsule">' + esc(p.capsule) + "</div>" +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
      '<span class="pm-select"><select data-persona-scope="' + esc(p.id) + '" aria-label="Scope for ' + esc(p.name) + '">' + scopeOpts + "</select></span>" +
      '<span class="pm-faint" style="font-size:11.5px">Currently: ' + esc(p.currentScope) + "</span></div>" +
      (p.childOnly ? '<p class="ldg-mgr-note">Child-only personas run under a parent agent and never appear as ordinary Chat defaults.</p>' : "") +
      "</div>";
  }

  function renderPersonas() {
    var personas = PMStore.get("personas", []);
    root.innerHTML = '<div class="ldg-page"><div class="ldg-col">' +
      '<div class="ldg-band"><div class="ldg-eyebrow">Appendix B · Manager <span class="ldg-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      "<h1>Personas</h1>" + '<p class="purpose">Behavior definitions with explicit scopes — not accounts, models, or permission grants.</p>' +
      '<div class="tools"><button type="button" class="pm-btn" data-variant="quiet" id="ldg-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Front page</button></div></div>' +
      '<p class="ldg-mgr-note" style="margin-block-end:14px">A persona is a durable definition plus a compact model-facing capsule; the full source is not injected every turn. Personas cannot widen Plan or Review mode, permissions, FileSafe, network, project, or parent-agent ceilings.</p>' +
      personas.map(personaHtml).join("") +
      "</div></div>";
    document.getElementById("ldg-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    root.querySelectorAll("[data-persona-scope]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var id = sel.getAttribute("data-persona-scope");
        var personas = PMStore.get("personas", []).slice();
        personas.forEach(function (p) { if (p.id === id) p.scopeChoice = sel.value; });
        PMStore.set("personas", personas);
        var label = SCOPE_OPTIONS.filter(function (s) { return s[0] === sel.value; })[0][1];
        PMStore.receipt("Persona scope set to “" + label + "” — applies to future work unless it is this turn or thread", "ok");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* SKILLS / PLUGINS / TOOLS / COMMANDS MANAGER                         */
  /* ------------------------------------------------------------------ */

  function renderSkills() {
    var skills = PMStore.get("skills", []);
    var plugins = PMStore.get("plugins", []);
    var tools = PMStore.get("tools", []);
    var commands = PMStore.get("commands", []);

    var skillsHtml = skills.map(function (s) {
      return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">' + esc(s.name) +
        ' <span class="pm-badge" data-kind="scope">' + esc(s.source) + "</span>" +
        (s.trusted ? ' <span class="pm-badge" data-kind="state" data-icon data-state="default">Trusted</span>' : ' <span class="pm-badge" data-kind="state" data-icon data-state="recommended">Not trusted yet</span>') +
        ' <span class="pm-badge" data-kind="scope">' + (s.scope === "project" ? "This project" : "Global") + "</span></div>" +
        '<div class="pm-row-desc">Permissions: ' + esc(s.permissions.join(", ")) + " · Updated " + esc(s.updatedAt) + "</div></div>" +
        '<div class="pm-row-control">' +
        '<button type="button" class="pm-btn" data-variant="quiet" data-skill-inspect="' + esc(s.id) + '">Inspect source</button>' +
        '<button type="button" class="pm-switch" role="switch" aria-checked="' + !!s.enabled + '" data-skill-enable="' + esc(s.id) + '" aria-label="Enable ' + esc(s.name) + '"></button>' +
        "</div></div>";
    }).join("");

    var pluginsHtml = plugins.map(function (p) {
      return '<div class="pm-row" data-state="' + (p.state === "failed" ? "unavailable" : "default") + '"><div class="pm-row-main"><div class="pm-row-label">' + esc(p.name) +
        ' <span class="pm-badge" data-kind="scope">' + esc(p.channel) + " channel · v" + esc(p.version) + "</span></div>" +
        '<div class="pm-row-desc">Requested permissions: ' + esc(p.requestedPermissions.join(", ")) + "</div>" +
        (p.state === "failed" ? '<div class="pm-row-reason">' + esc(p.failureReason) + "</div>" : "") + "</div>" +
        '<div class="pm-row-control">' + (p.state === "failed"
          ? '<button type="button" class="pm-btn" data-variant="quiet" data-plugin-retry="' + esc(p.id) + '">Retry activation</button>'
          : '<span class="pm-badge" data-kind="state" data-icon data-state="auto">Active</span>') + "</div></div>";
    }).join("");

    var toolsHtml = tools.map(function (t) {
      var owner = t.owner === "pm" ? "Puppet Master" : "via MCP server “" + t.owner.replace("mcp:", "") + "”";
      return '<div class="pm-row"><div class="pm-row-main"><div class="pm-row-label">' + esc(t.name) +
        ' <span class="pm-badge" data-kind="scope">' + esc(owner) + "</span>" +
        ' <span class="pm-badge" data-kind="effect" data-icon data-effect="' + (t.risk === "high" ? "safety" : t.risk === "medium" ? "cost" : "performance") + '">' + esc(t.risk) + " risk</span></div>" +
        '<div class="pm-row-desc">' +
        (t.installed ? "Installed" : "Not installed") + " · " +
        (t.projectEnabled ? "enabled for this project" : "not enabled for this project") + " · " +
        (t.availableThisTurn ? "available this turn" : "not exposed this turn") + (t.invoked ? " · invoked" : "") + " · approval: " + esc(t.approvalPolicy) + "</div></div>" +
        '<div class="pm-row-control"><button type="button" class="pm-switch" role="switch" aria-checked="' + !!t.projectEnabled + '" data-tool-enable="' + esc(t.id) + '" aria-label="Enable ' + esc(t.name) + ' for this project"></button></div></div>';
    }).join("");

    var commandsHtml = commands.map(function (c) {
      return '<div class="pm-row"' + (c.conflict ? ' data-state="effective-differs"' : "") + '><div class="pm-row-main"><div class="pm-row-label">' + esc(c.name) +
        (c.custom ? ' <span class="pm-badge" data-kind="scope">Custom</span>' : "") +
        (c.conflict ? ' <span class="pm-badge" data-kind="state" data-icon data-state="effective-differs">Shortcut conflict</span>' : "") + "</div>" +
        '<div class="pm-row-desc">Shortcut: <b class="pm-mono">' + esc(c.shortcut) + "</b>" + (c.conflict ? " — shared with another command" : "") + "</div></div>" +
        '<div class="pm-row-control">' +
        (c.conflict ? '<button type="button" class="pm-btn" data-variant="quiet" data-cmd-remap="' + esc(c.id) + '">Remap</button>' : "") +
        (c.custom ? '<button type="button" class="pm-btn" data-variant="quiet" data-cmd-reset="' + esc(c.id) + '">Remove custom</button>' : "") +
        "</div></div>";
    }).join("");

    root.innerHTML = '<div class="ldg-page"><div class="ldg-col">' +
      '<div class="ldg-band"><div class="ldg-eyebrow">Appendix C · Manager <span class="ldg-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      "<h1>Skills, plugins, tools, and commands</h1>" + '<p class="purpose">Related but distinct inventories with trust, scope, and approval policy.</p>' +
      '<div class="tools"><button type="button" class="pm-btn" data-variant="quiet" id="ldg-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Front page</button></div></div>' +
      '<p class="ldg-mgr-note">Not every installed tool schema reaches every agent: exposure is progressive at runtime, and this manager shows the state plainly. MCP-owned tools stay attributed to their server.</p>' +
      '<h2 class="ldg-inv-h">Skills</h2>' + skillsHtml +
      '<h2 class="ldg-inv-h">Plugins</h2>' + pluginsHtml +
      '<h2 class="ldg-inv-h">Tools</h2>' + toolsHtml +
      '<h2 class="ldg-inv-h">Commands</h2>' + commandsHtml +
      "</div></div>";

    document.getElementById("ldg-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    root.querySelectorAll("[data-skill-enable]").forEach(function (sw) {
      sw.addEventListener("click", function () {
        var id = sw.getAttribute("data-skill-enable");
        var skills = PMStore.get("skills", []).slice();
        skills.forEach(function (s) { if (s.id === id) s.enabled = sw.getAttribute("aria-checked") !== "true"; });
        PMStore.set("skills", skills);
      });
    });
    root.querySelectorAll("[data-skill-inspect]").forEach(function (b) {
      b.addEventListener("click", function () { PMStore.receipt("Source inspection simulated — no skill source was opened", "info"); });
    });
    root.querySelectorAll("[data-plugin-retry]").forEach(function (b) {
      b.addEventListener("click", function () { PMStore.receipt("Plugin activation retried (simulated) — the failure state is kept for inspection", "warn"); });
    });
    root.querySelectorAll("[data-tool-enable]").forEach(function (sw) {
      sw.addEventListener("click", function () {
        var id = sw.getAttribute("data-tool-enable");
        var tools = PMStore.get("tools", []).slice();
        tools.forEach(function (t) { if (t.id === id) t.projectEnabled = sw.getAttribute("aria-checked") !== "true"; });
        PMStore.set("tools", tools);
      });
    });
    root.querySelectorAll("[data-cmd-remap]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-cmd-remap");
        var commands = PMStore.get("commands", []).slice();
        commands.forEach(function (c) { if (c.id === id) { c.shortcut = "Ctrl+Alt+G"; c.conflict = false; } });
        PMStore.set("commands", commands);
        PMStore.receipt("Shortcut remapped to Ctrl+Alt+G — the conflict is resolved", "ok");
      });
    });
    root.querySelectorAll("[data-cmd-reset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-cmd-reset");
        PMStore.set("commands", PMStore.get("commands", []).filter(function (c) { return c.id !== id; }));
        PMStore.receipt("Custom command removed (simulated)", "warn");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* render loop                                                         */
  /* ------------------------------------------------------------------ */

  function render() {
    if (spy) { spy.detach(); spy = null; }
    var scroller = root.querySelector(".ldg-page");
    var st = scroller ? scroller.scrollTop : 0;
    var wantsFocus = !!(view.focusSetting || view.focusSub);
    if (view.name === "workspace") renderWorkspace();
    else if (view.name === "manager") {
      if (view.id === "personas") renderPersonas();
      else if (view.id === "skills") renderSkills();
      else renderProviders();
    } else renderHome();
    var after = root.querySelector(".ldg-page");
    if (after && !wantsFocus) after.scrollTop = st;
  }

  PMStore.on("change", function () { render(); });
  PMStore.on("reset", function () { openAdv = {}; });

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
