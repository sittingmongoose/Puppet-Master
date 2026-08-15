/* ============================================================================
   Concept 02 — Score · cue / plates / rehearsal-mark IA
   Hero cue search → cue notices → movement plates.
   Workspace: single-column score + top rehearsal-mark rail + light side index.
   Managers: Notifications & Sounds, Sound Library/Packs, Appearance, Spellcheck, Desktop, Teacher (+ Providers). Cueing motion.
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
  PMStore.init("score");

  var INDEX = PMSearch.buildIndex(DEMO);
  var root = document.getElementById("sc-root");

  var view = { name: "home" };
  var _motionKind = "home";
  var _prevCat = null;
  var spy = null;
  var openAdv = {};
  var resetArmed = null;
  var activeSub = null;

  var MANAGERS = { providers: true, notifications: true, soundLibrary: true, appearanceMgr: true, spellcheck: true, desktop: true, teacher: true };
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
  /* FRONT PAGE                                                          */
  /* ------------------------------------------------------------------ */


  function decisionsHtml() {
    var dismissed = PMStore.get("dismissedNotices", []);
    var list = DEMO.notices.filter(function (n) { return dismissed.indexOf(n.id) === -1; });
    if (PMStore.get("calmDemo", false) || !list.length) {
      return '<div class="sc-calm">' + V.icon("check") + "<div><b>No cues are lit.</b> The cue sheet still leads with search and movement plates.</div></div>";
    }
    var order = { attention: 0, setup: 1, recommended: 2 };
    list.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    return '<div class="sc-cues">' + list.map(V.noticeHtml).join("") + "</div>";
  }

  function indexHtml() {
    var cats = DEMO.categories.slice().sort(function (a, b) {
      var af = a.manager && MANAGERS[a.manager] ? 0 : 1;
      var bf = b.manager && MANAGERS[b.manager] ? 0 : 1;
      return af - bf;
    });
    return cats.map(function (c, i) {
      var featured = c.manager && MANAGERS[c.manager];
      return '<button type="button" class="sc-plate' + (featured ? " is-featured" : "") + '" data-cat="' + esc(c.id) + '">' +
        '<span class="sc-plate-num">Mvt ' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="sc-plate-title">' + esc(c.title) + "</span>" +
        '<span class="sc-plate-purpose">' + esc(c.purpose) + "</span>" +
        '<span class="sc-plate-status">' + esc(c.statusSummary) + (featured ? " · cue plate" : "") + "</span></button>";
    }).join("");
  }

  function homeHtml() {
    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" class="sc-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";
    }).join("");
    return '<div class="sc-home"><div class="sc-home-inner">' +
      '<header class="sc-cue-hero">' +
      '<div class="sc-eyebrow">Concept 02 · Score · cueing · Notifications/Sounds/Appearance/Spellcheck/Desktop/Teacher<span class="sc-model" data-concept-model="CursorAuto">Concept model: CursorAuto</span></div>' +
      "<h1>Cue the next setting</h1>" +
      '<div class="sc-cue-meta">Hero search · cue notices · movement plates · rehearsal marks</div>' +
      '<div class="sc-searchband">' + V.icon("search") +
      '<input id="sc-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search — settings, managers, actions"></div>' +
      '<div class="sc-hits" id="sc-hits" role="listbox" hidden></div>' +
      "</header>" +
      '<h2 class="sc-h2">Cue notices<span class="sub">One clear action each</span></h2><hr class="sc-rule">' + decisionsHtml() +
      '<h2 class="sc-h2">Movement plates<span class="sub">Each plate opens a single-column score</span></h2><hr class="sc-rule">' +
      '<div class="sc-plates">' + indexHtml() + "</div>" +
      '<h2 class="sc-h2">Recent cues</h2><hr class="sc-rule"><div class="sc-recents">' + recents + "</div>" +
      '<div class="sc-foot">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sc-calm-toggle">Toggle calm state (demo)</button>' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sc-reset">Reset demo data</button>' +
      "<span>Score IA: cueing motion, rehearsal-mark rail, light side index.</span></div>" +
      "</div></div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    var input = document.getElementById("sc-search");
    V.wireSearch({
      input: input,
      listEl: document.getElementById("sc-hits"),
      index: INDEX,
      onPick: onSearchPick
    });
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
    document.getElementById("sc-calm-toggle").addEventListener("click", function () {
      PMStore.set("calmDemo", !PMStore.get("calmDemo", false));
    });
    document.getElementById("sc-reset").addEventListener("click", function () {
      PMStore.resetDemo();
      PMStore.receipt("Demo data reset to its seeded state", "ok");
    });
  }

  /* ------------------------------------------------------------------ */
  /* MOVEMENT (workspace)                                                */
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
      html += '<details class="sc-adv"' + (openAdv[sub.id] ? " open" : "") + ' data-adv="' + esc(sub.id) + '"><summary>Show ' +
        advanced.length + " advanced, expert, or diagnostic entries</summary><div class=\"sc-adv-body\">" +
        advanced.map(function (s) { return V.rowHtml(s); }).join("") + "</div></details>";
    }
    return html;
  }

  function workspaceHtml(cat) {
    var sections = cat.subcategories.map(function (sub) {
      return '<section class="sc-sec" id="sec-' + esc(sub.id) + '"><h2>' + esc(sub.title) + '</h2><p class="sum">' + esc(sub.summary) + "</p>" + rowsFor(sub) + "</section>";
    }).join("");
    var spell = cat.id === "appearance" ? '<section class="sc-sec" id="sec-spellcheck-demo"><h2>Spellcheck, live</h2><p class="sum">The shared writing service on a draft — it never changes text by itself.</p><div id="sc-spell"></div></section>' : "";
    var tocItems = cat.subcategories.map(function (sub) {
      return '<button type="button" class="sc-toc-item" data-toc="' + esc(sub.id) + '"><span class="dot"></span>' + esc(sub.title) + "</button>";
    }).join("");
    var tocCats = DEMO.categories.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === cat.id ? " selected" : "") + ">" + esc(c.title) + "</option>";
    }).join("");
    var marks = cat.subcategories.map(function (sub, i) {
      var letter = String.fromCharCode(65 + (i % 26));
      return '<button type="button" class="sc-mark" data-toc="' + esc(sub.id) + '">' + letter + " · " + esc(sub.title) + "</button>";
    }).join("");
    return '<div class="sc-ws sc-wrap">' +
      '<div class="sc-score-col" id="sc-page">' +
      '<div class="sc-band">' +
      '<div class="sc-eyebrow">Movement ' + String(DEMO.categories.indexOf(cat) + 1).padStart(2, "0") + ' <span class="sc-model" data-concept-model="CursorAuto">Concept model: CursorAuto</span></div>' +
      "<h1>" + esc(cat.title) + '</h1><p class="purpose">' + esc(cat.purpose) + " · " + esc(cat.statusSummary) + "</p>" +
      '<div class="tools">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sc-back">Cue sheet</button>' +
      (cat.manager ? '<button type="button" class="ca-btn" data-variant="quiet" id="sc-open-mgr">' + esc(DEMO.managerMeta[cat.manager].title) + " ensemble</button>" : "") +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sc-cat-reset">Reset this movement</button>' +
      "</div></div>" +
      '<div class="sc-rehearsal" aria-label="Rehearsal marks">' + marks + "</div>" +
      sections + spell +
      "</div>" +
      '<aside class="sc-side" id="sc-toc" aria-label="Side index">' +
      '<p class="t-h">Side index</p>' +
      '<span class="ca-select" style="inline-size:100%"><select id="sc-toc-cat" aria-label="Movement" style="inline-size:100%">' + tocCats + "</select></span>" +
      '<div class="sc-toc-list">' + tocItems + "</div>" +
      '<div class="t-search" style="margin-top:12px"><input id="sc-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings">' +
      '<div class="t-hits" id="sc-ws-hits" role="listbox" hidden></div></div>' +
      "</aside></div>";
  }

  function sweep(sec) {
    sec.removeAttribute("data-swept");
    void sec.offsetWidth;
    sec.setAttribute("data-swept", "1");
  }

  function renderWorkspace() {
    var cat = catById(view.cat) || DEMO.categories[0];
    root.innerHTML = workspaceHtml(cat);
    var page = document.getElementById("sc-page") || root.querySelector(".sc-score-col");
    var toc = document.getElementById("sc-toc");

    document.getElementById("sc-toc-cat").addEventListener("change", function (ev) {
      captureNavOrigin(ev.target, "movement");
      _motionKind = "category";
      view = { name: "workspace", cat: ev.target.value, focusSub: null, focusSetting: null };
      render();
    });

    function jumpToSub(subId) {
      var sec = document.getElementById("sec-" + subId);
      if (sec) PMSpy.jumpTo(sec, { root: page, onDone: function () { sweep(sec); } });
      toc.removeAttribute("data-rail-open");
    }

    /* Rehearsal marks live in .sc-rehearsal (outside #sc-toc); bind on root. */
    root.querySelectorAll("[data-toc]").forEach(function (b) {
      b.addEventListener("click", function () { jumpToSub(b.getAttribute("data-toc")); });
    });
    var rail = document.getElementById("sc-rail");
    if (rail) {
      rail.querySelectorAll("[data-rail]").forEach(function (b) {
        b.addEventListener("click", function () { jumpToSub(b.getAttribute("data-rail")); });
      });
    }
    var railOpen = document.getElementById("sc-rail-open");
    if (railOpen) railOpen.addEventListener("click", function () {
      if (toc.hasAttribute("data-rail-open")) toc.removeAttribute("data-rail-open");
      else toc.setAttribute("data-rail-open", "1");
    });

    V.wireSearch({
      input: document.getElementById("sc-ws-search"),
      listEl: document.getElementById("sc-ws-hits"),
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
      var bar = document.getElementById("sc-progress");
      if (bar && max > 0) bar.style.inlineSize = Math.min(100, (page.scrollTop / max) * 100) + "%";
    }, { passive: true });

    root.querySelectorAll(".sc-adv").forEach(function (d) {
      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });
    });

    document.getElementById("sc-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    var mgrBtn = document.getElementById("sc-open-mgr");
    if (mgrBtn) mgrBtn.addEventListener("click", function () {
      if (MANAGERS[cat.manager]) { view = { name: "manager", id: cat.manager }; render(); }
      else PMStore.receipt("The " + DEMO.managerMeta[cat.manager].title + " manager is realized richly in another concept of this bakeoff; its settings live inline here", "info");
    });

    var resetBtn = document.getElementById("sc-cat-reset");
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
          if (resetArmed === cat.id) { resetArmed = null; resetBtn.textContent = "Reset movement to defaults"; }
        }, 2600);
      }
    });

    if (cat.id === "appearance") V.mountSpellcheck(document.getElementById("sc-spell"), {});

    if (view.focusSetting) {
      var row = document.getElementById("row-" + view.focusSetting);
      if (row) {
        var adv = row.closest(".sc-adv");
        if (adv && !adv.open) { adv.open = true; openAdv[adv.getAttribute("data-adv")] = true; }
        row.classList.add("ca-motion-focus"); PMSpy.jumpTo(row, { root: page });
      }
      view.focusSetting = null;
    } else if (view.focusSub) {
      var sec = document.getElementById("sec-" + view.focusSub);
      if (sec) PMSpy.jumpTo(sec, { root: page, onDone: function () { sweep(sec); } });
      view.focusSub = null;
    }
  }

  /* ------------------------------------------------------------------ */
  /* PROVIDERS — appendix movement                                        */
  /* ------------------------------------------------------------------ */

  function stampHtml(p) {
    var st = V.providerStatus(p);
    var act = V.activeAccount(p);
    var u = p.usageSnapshot;
    return '<div class="sc-stamp">' +
      '<div><div class="k">Status</div><div class="v">' + V.healthDot(st.dot, st.label) + "</div></div>" +
      '<div><div class="k">Connection</div><div class="v">' + esc(act ? act.label : "None active") + "</div></div>" +
      '<div><div class="k">Plan</div><div class="v">' + esc(p.product.plan) + "</div></div>" +
      '<div><div class="k">Usage</div><div class="v">' + esc(u ? u.includedRemaining + " left · " + u.pressure + " pressure" : "Not reported on this route") + "</div></div>" +
      '<div><div class="k">Last successful generation</div><div class="v">' + esc(act ? act.lastSuccessfulGeneration : "Never") + "</div></div>" +
      "</div>";
  }

  function famHtml(p) {
    var accounts = p.installState === "not-installed"
      ? '<div class="ca-empty"><div class="ca-empty-title">Not installed</div><div class="ca-empty-guidance">' + esc(p.diagnostics[0]) + '</div><button type="button" class="ca-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">' + esc((p.installAction && p.installAction.label) || "Install from official source") + '</button></div>'
      : (p.accounts.length ? p.accounts.map(function (a) { return V.accountRowHtml(p, a); }).join("")
        : '<div class="ca-empty"><div class="ca-empty-title">Signed out</div><div class="ca-empty-guidance">The CLI is installed; its own sign-in flow runs inside an isolated profile.</div><button type="button" class="ca-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button></div>');
    var models = p.models.map(function (m) {
      var ev = "";
      ["tools", "vision", "structuredOutput"].forEach(function (k) {
        var cap = m.capabilities[k];
        ev += "<div>" + esc(k.replace(/([A-Z])/g, " $1").replace(/^./, function (c) { return c.toUpperCase(); })) + ": " + esc(V.human(V.CAP_STATE, cap.state)) + " — " + esc(cap.evidence) + (cap.freshAsOf ? " (" + esc(cap.freshAsOf) + ")" : "") + "</div>";
      });
      return V.modelRowHtml(p, m) +
        '<details class="sc-evidence"' + (openAdv["ev-" + p.id + "-" + m.id] ? " open" : "") + ' data-adv="ev-' + esc(p.id + "-" + m.id) + '"><summary>Capability evidence</summary><div>' + ev + "</div></details>";
    }).join("");
    return '<div class="sc-fam"><h3>' + esc(p.name) + '</h3><p class="tag">' + esc(p.tagline) + "</p>" +
      stampHtml(p) + accounts +
      (p.accountSwitchNote ? '<p class="sc-mgr-note" style="margin-block:8px">' + esc(p.accountSwitchNote) + "</p>" : "") +
      (p.groupingNote ? '<p class="sc-mgr-note" style="margin-block:8px">' + esc(p.groupingNote) + "</p>" : "") +
      "<h4 style='font-size:13px;margin:14px 0 4px'>Models</h4>" + V.catalogHtml(p) + (V.installationsHtml ? V.installationsHtml(p) : "") + models +
      "<h4 style='font-size:13px;margin:16px 0 4px'>Usage snapshot</h4>" + V.usageHtml(p) +
      "<h4 style='font-size:13px;margin:16px 0 4px'>Routing</h4>" + V.routingHtml(p) +
      '<details class="ca-disclose"><summary>Diagnostics details</summary><div class="ca-disclose-body">' + V.diagnosticsHtml(p) + "</div></details>" +
      "</div>";
  }

  function renderProviders() {
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
    root.innerHTML = '<div class="sc-mgr sc-wrap"><div class="sc-score-col">' +
      '<div class="sc-band"><div class="sc-eyebrow">Ensemble · Providers cast <span class="sc-model" data-concept-model="CursorAuto">Concept model: CursorAuto</span></div>' +
      "<h1>Providers</h1>" + '<p class="purpose">Accounts, connections, models, and routing — each family stamped with its current state.</p>' +
      '<div class="tools"><button type="button" class="ca-btn" data-variant="quiet" id="sc-back">Cue sheet</button>' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="sc-mgr-home">Open the Providers movement</button></div></div>' +
      '<p class="sc-mgr-note" style="margin-block-end:18px">Provider, account, connection, product, and model stay separate concepts; sign-in ownership is stated per family.</p>' +
      V.providers().map(famHtml).join("") + freeHtml +
      "</div></div>";
    document.getElementById("sc-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    document.getElementById("sc-mgr-home").addEventListener("click", function () {
      view = { name: "workspace", cat: "providers", focusSub: null, focusSetting: null };
      render();
    });
    root.querySelectorAll(".sc-evidence").forEach(function (d) {
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
    return '<div class="sc-persona">' +
      "<h3>" + esc(p.name) + (p.childOnly ? ' <span class="ca-badge" data-kind="exposure" data-icon data-exposure="managed">Child only</span>' : "") + "</h3>" +
      '<p class="role">' + esc(p.roleSummary) + "</p>" +
      '<div class="sc-capsule">' + esc(p.capsule) + "</div>" +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
      '<span class="ca-select"><select data-persona-scope="' + esc(p.id) + '" aria-label="Scope for ' + esc(p.name) + '">' + scopeOpts + "</select></span>" +
      '<span class="ca-faint" style="font-size:11.5px">Currently: ' + esc(p.currentScope) + "</span></div>" +
      (p.childOnly ? '<p class="sc-mgr-note">Child-only personas run under a parent agent and never appear as ordinary Chat defaults.</p>' : "") +
      "</div>";
  }
  /* ------------------------------------------------------------------ */
  /* SKILLS / PLUGINS / TOOLS / COMMANDS MANAGER                         */
  /* ------------------------------------------------------------------ */
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
    var scroller = root.querySelector(".sc-score-col") || root.querySelector(".sc-page") || root.querySelector(".sc-mgr");
    var st = scroller ? scroller.scrollTop : 0;
    if (view.name === "workspace") renderWorkspace();
    else if (view.name === "manager") {
      if (view.id === "providers") renderProviders();
      else if (window.CAManagers && CAManagers.handles(view.id)) {
        if (CAManagers.disposeActiveScope) CAManagers.disposeActiveScope();
        CAManagers.mount({
          root: root,
          managerId: view.id,
          chrome: { wrapClass: "sc-mgr", barClass: "sc-ws-bar", detailClass: "sc-mgr-detail", backId: "sc-back" },
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
    var after = root.querySelector(".sc-score-col") || root.querySelector(".sc-page") || root.querySelector(".sc-mgr");
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
  PMStore.on("reset", function () { openAdv = {}; });

  V.bindSettings(root, {
    getSetting: function (sid) { return DEMO.settings[sid]; },
    onChange: function (sid, value) { V.setOverride(sid, value); },
    onRun: function (sid) {
      var s = DEMO.settings[sid];
      PMStore.receipt("“" + (s ? s.label : sid) + "” simulated — no real action ran", "info");
    }
  });
  V.bindProviders(root, render, {
    onDeepLink: function (deep) {
      if (typeof navigate === "function") navigate(deep);
      else if (typeof openTarget === "function") openTarget(deep);
      else if (window.PMSearch && PMSearch.deepLink) {
        var t = PMSearch.deepLink({ target: deep }) || deep;
        if (typeof navigate === "function") navigate(t);
      }
    }
  });

  if (window.CAStates) CAStates.mount({ host: document.body });
  PMShell.init();
  render();
})();
