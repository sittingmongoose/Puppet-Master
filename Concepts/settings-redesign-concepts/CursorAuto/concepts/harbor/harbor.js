/* ============================================================================

   Concept 01 — Harbor · pier berthing IA

   Home = pier-desk search, triage, berth cards. Workspace = pier slips + cargo document. Managers = drydock managers.

   All semantic state lives in PMStore; rendering is a pure function of it.

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

  PMStore.init("harbor");



  var INDEX = PMSearch.buildIndex(DEMO);

  var root = document.getElementById("hb-root");



  /* view = {name:"home"} | {name:"workspace", cat, focusSub, focusSetting}

          | {name:"manager", id, pid, tab} */

  var view = { name: "home" };

  var _motionKind = "home";

  var _prevCat = null;

  var spy = null;

  var openAdv = {};            /* advanced disclosures kept across renders */

  var memFilter = "all";       /* memory manager filter (local UI state) */

  var resetArmed = null;       /* two-click category reset */



  var MANAGERS = { providers: true, context: true, memory: true, personas: true, goal: true, crew: true, permissions: true, bsd: true };

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

    var t = PMSearch.deepLink ? PMSearch.deepLink({ target: target }) : target;

    t = t || target;

    if (t.manager === "usage") {

      view = { name: "manager", id: "providers", pid: null, tab: "usage" };

    } else if (t.manager && MANAGERS[resolveManagerId(t.manager)]) {

      view = { name: "manager", id: resolveManagerId(t.manager), pid: null, tab: t.tab || null };

    } else if (t.manager && MANAGER_CATEGORY[t.manager]) {

      view = { name: "workspace", cat: MANAGER_CATEGORY[t.manager], focusSub: t.sub || null, focusSetting: t.setting || null };

    } else if (t.category) {

      view = { name: "workspace", cat: t.category, focusSub: t.sub || null, focusSetting: t.setting || null };

    } else if (t.manager) {

      /* a manager this concept does not realize richly: land on its owning category */

      var owning = null;

      DEMO.categories.forEach(function (c) { if (c.manager === t.manager) owning = c.id; });

      view = owning

        ? { name: "workspace", cat: owning, focusSub: t.sub || null, focusSetting: t.setting || null }

        : { name: "home" };

    } else {

      view = { name: "home" };

    }

    render();

  }



  function onSearchPick(result) {

    _motionKind = "search";

    if (window.CAMotion) CAMotion.captureOrigin(document.activeElement, "search");

    var t = result.target || {};

    if (result.kind === "action") {

      if (/reset demo/i.test(result.title)) { PMStore.resetDemo(); PMStore.receipt("Demo data reset to its seeded state", "ok"); }

      else if (/settings home/i.test(result.title)) { view = { name: "home" }; render(); }

      else if (/refresh provider catalog/i.test(result.title)) {

        view = { name: "manager", id: "providers", pid: "openai", tab: "models" };

        render();

      }

      return;

    }

    navigate(t);

  }



  /* ------------------------------------------------------------------ */

  /* HOME                                                                */

  /* ------------------------------------------------------------------ */



  function noticesHtml() {

    var dismissed = PMStore.get("dismissedNotices", []);

    var calm = PMStore.get("calmDemo", false);

    var list = DEMO.notices.filter(function (n) { return dismissed.indexOf(n.id) === -1; });

    if (calm || !list.length) {

      return '<div class="hb-calm">' + V.icon("check") +

        '<div><b>Quiet water.</b> Nothing needs attention, no setup is waiting, and there is nothing new to recommend.</div>' +

        '<div class="ca-faint" style="font-size:11.5px">Calm tide — the pier desk and berths stay ready.</div></div>';

    }

    var order = { attention: 0, setup: 1, recommended: 2 };

    list.sort(function (a, b) { return order[a.kind] - order[b.kind]; });

    list = list.slice(0, 4);

    return '<div class="hb-tide">' + list.map(V.noticeHtml).join("") + "</div>";

  }



  function directoryHtml() {

    var cats = DEMO.categories.slice().sort(function (a, b) {

      var af = a.manager && MANAGERS[a.manager] ? 0 : 1;

      var bf = b.manager && MANAGERS[b.manager] ? 0 : 1;

      return af - bf;

    });

    return cats.map(function (c, i) {

      var featured = c.manager && MANAGERS[c.manager];

      var mgr = featured

        ? '<span class="hb-berth-mgr">' + esc(DEMO.managerMeta[c.manager].title) + " drydock</span>" : "";

      return '<button type="button" class="hb-berth' + (featured ? " is-featured" : "") + '" data-cat="' + esc(c.id) + '">' +

        '<span class="hb-berth-slip">Slip ' + String(i + 1).padStart(2, "0") + "</span>" +

        '<span class="hb-berth-title">' + esc(c.title) + "</span>" +

        '<span class="hb-berth-purpose">' + esc(c.purpose) + "</span>" +

        '<span class="hb-berth-status">' + esc(c.statusSummary) + "</span>" + mgr +

        "</button>";

    }).join("");

  }



  function homeHtml() {

    var recents = DEMO.recents.map(function (r, i) {

      return '<button type="button" class="hb-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";

    }).join("");

    return '<div class="hb-home"><div class="hb-home-inner">' +

      '<header class="hb-pier-desk">' +

      '<div class="hb-eyebrow">Concept 01 · Harbor · pier berthing · Context/Memory/Personas/Goal/Crew/Permissions/BSD<span class="hb-model" data-concept-model="CursorAuto">Concept model: CursorAuto</span></div>' +

      "<h1>What needs to dock?</h1>" +

      '<div class="hb-searchbox">' + V.icon("search") +

      '<input id="hb-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" aria-expanded="false" placeholder="Search — settings, managers, actions">' +

      "</div>" +

      '<div class="hb-hits" id="hb-hits" role="listbox" aria-label="Search results" hidden></div>' +

      '<div class="hb-hint">Try “memory”, “FileSafe”, “Back Seat”, or “Claude”. Hits open the exact berth.</div>' +

      "</header>" +

      '<div id="hb-home-body" style="display:grid;gap:26px">' +

      '<section aria-label="Tide notices"><h2 class="hb-section-h">Tide board <span>up to four</span></h2>' + noticesHtml() + "</section>" +

      '<section aria-label="Berths"><h2 class="hb-section-h">Berths <span>' + DEMO.categories.length + "</span></h2>" +

      '<div class="hb-berths">' + directoryHtml() + "</div></section>" +

      '<section aria-label="Recent"><h2 class="hb-section-h">Along the quay</h2><div class="hb-recents">' + recents + "</div></section>" +

      '<footer class="hb-home-foot">' +

      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-calm-toggle">Toggle calm state (demo)</button>' +

      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-reset">Reset demo data</button>' +

      "<span>Pier desk → triage → berths → cargo documents.</span>" +

      "</footer>" +

      "</div></div></div>";

  }



  function renderHome() {

    root.innerHTML = homeHtml();

    var input = document.getElementById("hb-search");

    var hits = document.getElementById("hb-hits");

    var body = document.getElementById("hb-home-body");

    V.wireSearch({

      input: input,

      listEl: hits,

      index: INDEX,

      onPick: onSearchPick,

      onOpen: function () { body.style.display = "none"; },

      onClose: function () { body.style.display = ""; }

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

      b.addEventListener("click", function () {

        navigate(DEMO.recents[parseInt(b.getAttribute("data-recent"), 10)].target);

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

    document.getElementById("hb-calm-toggle").addEventListener("click", function () {

      PMStore.set("calmDemo", !PMStore.get("calmDemo", false));

    });

    document.getElementById("hb-reset").addEventListener("click", function () {

      PMStore.resetDemo();

      PMStore.receipt("Demo data reset to its seeded state", "ok");

    });

  }



  /* ------------------------------------------------------------------ */

  /* WORKSPACE                                                           */

  /* ------------------------------------------------------------------ */



  function rowsFor(sub) {

    var standard = [];

    var advanced = [];

    sub.settings.forEach(function (sid) {

      var s = DEMO.settings[sid];

      if (!s) return;

      if (s.exposure === "standard" || s.exposure === "managed" || s.exposure === "unavailable") standard.push(s);

      else advanced.push(s);

    });

    var html = standard.map(function (s) { return V.rowHtml(s); }).join("");

    if (advanced.length) {

      var key = sub.id;

      html += '<details class="hb-adv"' + (openAdv[key] ? " open" : "") + ' data-adv="' + esc(key) + '"><summary>Show ' +

        advanced.length + " advanced, expert, or diagnostic options</summary>" +

        '<div class="hb-adv-body">' + advanced.map(function (s) { return V.rowHtml(s); }).join("") + "</div></details>";

    }

    return html;

  }



  function outlineHtml(cat) {

    var cats = DEMO.categories.map(function (c, i) {

      var current = c.id === cat.id;

      var subs = "";

      if (current) {

        subs = c.subcategories.map(function (sub) {

          return '<button type="button" class="hb-slip-sub" data-sub="' + esc(sub.id) + '">' + esc(sub.title) + "</button>";

        }).join("");

      }

      return '<div><button type="button" class="hb-slip" data-olcat="' + esc(c.id) + '" aria-current="' + current + '">' +

        '<span class="hb-slip-num">Slip ' + String(i + 1).padStart(2, "0") + "</span>" +

        "<span>" + esc(c.title) + "</span></button>" + subs + "</div>";

    }).join("");

    var mgrs = '<div class="hb-slip-num ca-drydock-label">Drydocks</div>' + ["providers", "context", "memory", "personas", "goal", "crew", "permissions", "bsd"].map(function (mid) {

      var m = DEMO.managerMeta[mid];

      return '<button type="button" class="hb-slip" data-mgr="' + esc(mid) + '"><span>' + esc(m.title) + "</span></button>";

    }).join("");

    return '<div class="hb-searchwrap"><div class="hb-searchbox">' + V.icon("search") +

      '<input id="hb-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></div>' +

      '<div class="hb-hits" id="hb-ws-hits" role="listbox" hidden></div></div>' + cats + mgrs;

  }



  function gutterDefaultHtml(cat) {

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

      return '<div><span class="ca-badge" data-kind="state" data-icon data-state="' + esc(k) + '">' + esc(V.human(V.STATE_LABEL, k)) + "</span> <b>" + counts[k] + "</b></div>";

    }).join("");

    return '<h2>Dock log</h2>' +

      '<div class="ca-panel"><h3 class="ca-panel-h">' + esc(cat.title) + " cargo</h3>" +

      '<div style="display:grid;gap:6px;font-size:12px;color:var(--pm-ink-dim)">' + lines + "</div>" +

      '<p class="ca-faint" style="font-size:11.5px;margin:10px 0 0">' + total + " settings in this berth. Focus a row to inspect source and scope.</p></div>";

  }



  function gutterSettingHtml(s) {

    var r = V.resolveState(s);

    var related = [];

    DEMO.categories.forEach(function (c) {

      c.subcategories.forEach(function (sub) {

        if (sub.settings.indexOf(s.id) !== -1) {

          sub.settings.forEach(function (other) {

            if (other !== s.id && related.length < 3) related.push({ id: other, cat: c.id, sub: sub.id });

          });

        }

      });

    });

    var relatedHtml = related.map(function (x) {

      var os = DEMO.settings[x.id];

      return '<button type="button" data-related="' + esc(x.id) + '" data-cat="' + esc(x.cat) + '" data-sub="' + esc(x.sub) + '">' + esc(os.label) + "</button>";

    }).join("");

    return '<h2>Dock log</h2>' +

      '<div class="ca-panel"><h3 class="ca-panel-h">' + esc(s.label) + "</h3>" +

      '<div style="display:grid;gap:7px;font-size:12px;color:var(--pm-ink-dim)">' +

      "<div>" + V.stateBadge(s) + "</div>" +

      "<div>Current value: <b>" + esc(V.fmtValue(s, V.settingValue(s))) + "</b></div>" +

      "<div>Source: " + esc(r.source) + "</div>" +

      "<div>Default: " + esc(V.fmtValue(s, s.defaultValue)) + (s.recommendedValue !== undefined ? " · Recommended: " + esc(V.fmtValue(s, s.recommendedValue)) : "") + "</div>" +

      "<div>Applies at: " + (s.scope || []).map(function (sc) { return V.human(V.SCOPE_LABEL, sc); }).join(", ") + "</div>" +

      (s.help ? "<div>" + esc(s.help) + "</div>" : "") +

      (s.restartRequired ? "<div>Changing this needs a restart.</div>" : "") +

      (s.effect ? "<div>" + esc(s.effect.note) + "</div>" : "") +

      "</div></div>" +

      (relatedHtml ? '<div class="ca-panel"><h3 class="ca-panel-h">Related</h3><div class="hb-related">' + relatedHtml + "</div></div>" : "");

  }



  function workspaceHtml(cat) {

    var sections = cat.subcategories.map(function (sub) {

      return '<section class="hb-sec" id="sec-' + esc(sub.id) + '" aria-label="' + esc(sub.title) + '">' +

        "<h2>" + esc(sub.title) + '</h2><p class="hb-sec-sum">' + esc(sub.summary) + "</p>" +

        rowsFor(sub) + "</section>";

    }).join("");

    var spell = cat.id === "appearance" ? '<section class="hb-sec" id="sec-spellcheck-demo" aria-label="Spellcheck demonstration"><h2>Spellcheck, live</h2><p class="hb-sec-sum">The shared writing service on a draft. It never changes text by itself.</p><div id="hb-spell"></div></section>' : "";

    var mgrBtn = cat.manager

      ? '<button type="button" class="ca-btn" id="hb-open-mgr">Open ' + esc(DEMO.managerMeta[cat.manager].title) + " drydock</button>" : "";

    return '<div class="hb-ws">' +

      '<div class="hb-ws-bar">' +

      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Pier</button>' +

      '<button type="button" class="ca-btn" id="hb-nav-toggle">Slips</button>' +

      "<h1>" + esc(cat.title) + '</h1><span class="hb-ws-purpose">' + esc(cat.purpose) + "</span>" +

      '<span class="spacer"></span>' + mgrBtn +

      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-cat-reset">Reset berth to defaults</button>' +

      "</div>" +

      '<div class="hb-ws-grid">' +

      '<nav class="hb-slips" id="hb-outline" aria-label="Pier slips">' + outlineHtml(cat) + "</nav>" +

      '<div class="hb-cargo" id="hb-doc">' + sections + spell + "</div>" +

      '<aside class="hb-dock-log" id="hb-gutter" aria-label="Dock log">' + gutterDefaultHtml(cat) + "</aside>" +

      "</div></div>";

  }



  function renderWorkspace() {

    var cat = catById(view.cat) || DEMO.categories[0];

    root.innerHTML = workspaceHtml(cat);

    var doc = document.getElementById("hb-doc");

    var outline = document.getElementById("hb-outline");



    /* outline interactions */

    outline.querySelectorAll("[data-olcat]").forEach(function (b) {

      b.addEventListener("click", function () {

        var id = b.getAttribute("data-olcat");

        if (id !== cat.id) {

          view = { name: "workspace", cat: id, focusSub: null, focusSetting: null };

          render();

        }

      });

    });

    outline.querySelectorAll("[data-sub]").forEach(function (b) {

      b.addEventListener("click", function () {

        var sec = document.getElementById("sec-" + b.getAttribute("data-sub"));

        if (sec) PMSpy.jumpTo(sec, { root: doc });

        outline.removeAttribute("data-open");

      });

    });

    outline.querySelectorAll("[data-mgr]").forEach(function (b) {

      b.addEventListener("click", function () {

        view = { name: "manager", id: b.getAttribute("data-mgr"), pid: null, tab: null };

        render();

      });

    });



    /* outline search */

    V.wireSearch({

      input: document.getElementById("hb-ws-search"),

      listEl: document.getElementById("hb-ws-hits"),

      index: INDEX,

      onPick: onSearchPick

    });



    /* scrollspy */

    var sections = cat.subcategories.map(function (sub) { return document.getElementById("sec-" + sub.id); }).filter(Boolean);

    spy = PMSpy.attach({

      root: doc,

      sections: sections,

      offsetPx: 60,

      onActive: function (id) {

        outline.querySelectorAll(".hb-slip-sub").forEach(function (b) {

          b.setAttribute("aria-current", String(b.getAttribute("data-sub") === id.replace(/^sec-/, "")));

        });

      }

    });



    /* disclosures persist */

    doc.querySelectorAll(".hb-adv").forEach(function (d) {

      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });

    });



    /* gutter follows row focus/click */

    function showSetting(sid) {

      var s = DEMO.settings[sid];

      var g = document.getElementById("hb-gutter");

      if (s && g) {

        g.innerHTML = gutterSettingHtml(s);

        g.querySelectorAll("[data-related]").forEach(function (b) {

          b.addEventListener("click", function () {

            view = { name: "workspace", cat: b.getAttribute("data-cat"), focusSub: b.getAttribute("data-sub"), focusSetting: b.getAttribute("data-related") };

            render();

          });

        });

      }

    }

    doc.querySelectorAll(".ca-row[data-setting]").forEach(function (row) {

      row.addEventListener("click", function (ev) {

        if (!ev.target.closest("button, select, input, .ca-switch")) showSetting(row.getAttribute("data-setting"));

      });

      row.addEventListener("focusin", function () { showSetting(row.getAttribute("data-setting")); });

    });



    /* bar actions */

    document.getElementById("hb-back").addEventListener("click", function () { view = { name: "home" }; render(); });

    var navToggle = document.getElementById("hb-nav-toggle");

    navToggle.addEventListener("click", function () {

      outline.setAttribute("data-open", outline.getAttribute("data-open") === "true" ? "false" : "true");

    });

    var mgrBtn = document.getElementById("hb-open-mgr");

    if (mgrBtn) mgrBtn.addEventListener("click", function () {

      if (MANAGERS[cat.manager]) {

        view = { name: "manager", id: cat.manager, pid: null, tab: null };

        render();

      } else {

        PMStore.receipt("The " + DEMO.managerMeta[cat.manager].title + " manager is realized richly in another concept of this bakeoff; its settings live inline here", "info");

      }

    });



    /* two-click category reset */

    var resetBtn = document.getElementById("hb-cat-reset");

    resetBtn.addEventListener("click", function () {

      if (resetArmed === cat.id) {

        var ov = V.overrides();

        cat.subcategories.forEach(function (sub) {

          sub.settings.forEach(function (sid) { delete ov[sid]; });

        });

        PMStore.set("overrides", ov);

        PMStore.receipt(cat.title + " reset to defaults", "ok");

        resetArmed = null;

      } else {

        resetArmed = cat.id;

        resetBtn.textContent = "Click again to confirm reset";

        window.setTimeout(function () {

          if (resetArmed === cat.id) { resetArmed = null; resetBtn.textContent = "Reset this place to defaults"; }

        }, 2600);

      }

    });



    /* spellcheck demo lives in Appearance · Input */

    if (cat.id === "appearance") {

      V.mountSpellcheck(document.getElementById("hb-spell"), {});

    }



    /* deep-link focus */

    if (view.focusSetting) {

      var row = document.getElementById("row-" + view.focusSetting);

      if (row) {

        var adv = row.closest(".hb-adv");

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

  /* PROVIDERS MANAGER (master–detail)                                   */

  /* ------------------------------------------------------------------ */



  var PROVIDER_TABS = [

    ["overview", "Overview"], ["accounts", "Accounts and connections"], ["models", "Models"],

    ["usage", "Usage"], ["routing", "Routing"], ["advanced", "Advanced and support"]

  ];



  function providerListHtml(selected) {

    var groups = ["installed-tools", "connected-accounts", "api", "server", "free"];

    var byGroup = {};

    V.providers().forEach(function (p) { (byGroup[p.connectionGroup] = byGroup[p.connectionGroup] || []).push(p); });

    return groups.filter(function (g) { return byGroup[g]; }).map(function (g) {

      return '<div class="hb-mgr-group">' + esc(V.GROUP_LABEL[g]) + "</div>" +

        byGroup[g].map(function (p) {

          var st = V.providerStatus(p);

          return '<button type="button" class="hb-mgr-item" data-pid="' + esc(p.id) + '" aria-current="' + (p.id === selected) + '">' +

            '<span class="name">' + esc(p.name) + "</span>" +

            '<span class="sub">' + V.healthDot(st.dot, st.label) + "</span></button>";

        }).join("");

    }).join("");

  }



  function providerOverviewHtml(p) {

    var st = V.providerStatus(p);

    var act = V.activeAccount(p);

    var install = V.INSTALL_STATE[p.installState];

    var available = p.models.filter(function (m) { return !m.unavailableReason; }).length;

    var unavailable = p.models.length - available;

    var usage = p.usageSnapshot;

    return '<div class="hb-stamp">' +

      '<div><div class="k">Status</div><div class="v">' + V.healthDot(st.dot, st.label) + "</div></div>" +

      (install ? '<div><div class="k">Installation</div><div class="v">' + esc(install) + "</div></div>" : "") +

      '<div><div class="k">Account in use</div><div class="v">' + esc(act ? act.label + " — " + act.identity : "None yet") + "</div></div>" +

      '<div><div class="k">Plan and billing</div><div class="v">' + esc(p.product.plan) + " · " + esc(p.product.billingRoute) + "</div></div>" +

      (usage ? '<div><div class="k">Included usage left</div><div class="v">' + esc(usage.includedRemaining) + " · pressure " + esc(usage.pressure) + "</div></div>" : "") +

      (usage ? '<div><div class="k">When it runs out</div><div class="v">' + esc(usage.projection) + "</div></div>" : "") +

      '<div><div class="k">Models</div><div class="v">' + available + " available" + (unavailable ? " · " + unavailable + " unavailable" : "") + "</div></div>" +

      '<div><div class="k">Catalog</div><div class="v">' + esc(p.catalog.source) + " · " + (p.catalog.refreshing ? "refreshing, showing last known good" : "version " + esc(p.catalog.version)) + "</div></div>" +

      "</div>" +

      (p.lastError ? '<div class="ca-notice" data-kind="attention"><span class="ca-notice-chip">Needs attention</span><div class="ca-notice-head">Model calls are failing</div><div class="ca-notice-body">' + esc(p.lastError) + '</div><div class="ca-notice-actions"><button type="button" class="ca-btn" data-variant="primary" data-pv="repair" data-pid="' + esc(p.id) + '">Run a readiness check</button></div></div>' : "") +

      (p.groupingNote ? '<p class="hb-mgr-note">' + esc(p.groupingNote) + "</p>" : "") +

      '<p class="hb-mgr-note">' + esc(V.AUTH_MODEL[p.authModel] || "") + "</p>";

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



  function providerDetailHtml(p, tab) {

    var tabs = PROVIDER_TABS.map(function (t) {

      return '<button type="button" class="ca-tab" role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + "</button>";

    }).join("");

    var pane = "";

    if (tab === "overview") pane = providerOverviewHtml(p) + (V.installationsHtml ? V.installationsHtml(p) : "");

    else if (tab === "accounts") {

      pane = (p.installState === "not-installed")

        ? '<div class="ca-empty"><div class="ca-empty-title">Not installed</div><div class="ca-empty-guidance">' + esc(p.diagnostics[0]) + '</div><button type="button" class="ca-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">' + esc((p.installAction && p.installAction.label) || "Install") + "</button></div>"

        : (p.accounts.length ? p.accounts.map(function (a) { return V.accountRowHtml(p, a); }).join("") : '<div class="ca-empty"><div class="ca-empty-title">No accounts yet</div><div class="ca-empty-guidance">Sign in to add one.</div><button type="button" class="ca-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button></div>') +

          (p.accountSwitchNote ? '<p class="hb-mgr-note">' + esc(p.accountSwitchNote) + "</p>" : "") +

          (p.groupingNote ? '<p class="hb-mgr-note">' + esc(p.groupingNote) + "</p>" : "") +

          (p.connectionGroup === "free" ? freeAuthRoutesHtml() : "");

    }

    else if (tab === "models") pane = V.catalogHtml(p) + p.models.map(function (m) { return V.modelRowHtml(p, m); }).join("");

    else if (tab === "usage") pane = V.usageHtml(p);

    else if (tab === "routing") pane = V.routingHtml(p) + (V.installationsHtml ? V.installationsHtml(p) : "");

    else pane = '<div class="ca-panel"><h3 class="ca-panel-h">Sign-in ownership</h3><p style="margin:0;font-size:12.5px;color:var(--pm-ink-dim)">' + esc(V.AUTH_MODEL[p.authModel] || "") + '</p></div>' +

        '<details class="ca-disclose"><summary>Diagnostics details</summary><div class="ca-disclose-body">' + V.diagnosticsHtml(p) + "</div></details>" +

        '<div class="ca-panel"><h3 class="ca-panel-h">Support</h3><button type="button" class="ca-btn" data-variant="quiet" data-pv="reconnect" data-pid="' + esc(p.id) + '">Reconnect</button> <button type="button" class="ca-btn" data-variant="quiet" data-pv="repair" data-pid="' + esc(p.id) + '">Run a readiness check</button></div>';

    return '<h2>' + esc(p.name) + '</h2><p class="tagline">' + esc(p.tagline) + "</p>" +

      '<div class="ca-tabs" role="tablist">' + tabs + '</div><div class="hb-tabpane">' + pane + "</div>";

  }



  function renderProviders() {

    var list = V.providers();

    var pid = view.pid || (list[0] && list[0].id);

    var tab = view.tab || "overview";

    var p = V.providerById(pid) || list[0];

    root.innerHTML = '<div class="hb-mgr">' +

      '<div class="hb-ws-bar">' +

      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> All settings</button>' +

      "<h1>Providers drydock</h1>" + '<span class="hb-ws-purpose">Accounts, connections, models, and routing</span><span class="spacer"></span>' +

      '<span class="hb-searchwrap" style="flex:0 1 320px"><div class="hb-searchbox">' + V.icon("search") +

      '<input id="hb-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></div>' +

      '<div class="hb-hits" id="hb-ws-hits" role="listbox" hidden></div></span>' +

      "</div>" +

      '<div class="hb-mgr-grid">' +

      '<div class="hb-mgr-list" id="hb-mgr-list">' + providerListHtml(p.id) + "</div>" +

      '<div class="hb-mgr-detail">' + providerDetailHtml(p, tab) + "</div>" +

      "</div></div>";

    document.getElementById("hb-back").addEventListener("click", function () { view = { name: "home" }; render(); });

    V.wireSearch({ input: document.getElementById("hb-ws-search"), listEl: document.getElementById("hb-ws-hits"), index: INDEX, onPick: onSearchPick });

    root.querySelectorAll(".hb-mgr-item").forEach(function (b) {

      b.addEventListener("click", function () { view = { name: "manager", id: "providers", pid: b.getAttribute("data-pid"), tab: "overview" }; render(); });

    });

    root.querySelectorAll(".ca-tab[data-tab]").forEach(function (b) {

      b.addEventListener("click", function () { view.tab = b.getAttribute("data-tab"); render(); });

    });

  }



  /* ------------------------------------------------------------------ */

  /* MEMORY MANAGER                                                      */

  /* ------------------------------------------------------------------ */



  function gistMatches(g) {

    if (memFilter === "verified") return g.status === "verified";

    if (memFilter === "review") return g.status === "awaiting-review";

    if (memFilter === "pinned") return g.pinned;

    return true;

  }



  function gistHtml(g) {

    var open = openAdv["gist-" + g.id];

    return '<div class="hb-gist" data-gist="' + esc(g.id) + '">' +

      '<div class="top"><div class="text">' + esc(g.text) + "</div>" +

      '<span class="ca-badge" data-kind="state" data-icon data-state="' + (g.status === "verified" ? "default" : "recommended") + '">' + (g.status === "verified" ? "Verified" : "Awaiting review") + "</span></div>" +

      '<div class="meta">' +

      '<span class="ca-badge" data-kind="scope">' + esc(g.kind) + "</span>" +

      '<span class="ca-badge" data-kind="scope">' + (g.scope === "assistant" ? "Assistant only" : "Project") + "</span>" +

      '<span class="ca-badge" data-kind="scope">Fades from active context after ~' + g.halfLifeDays + " days — it never becomes false</span>" +

      '<span class="ca-badge" data-kind="scope">Last used ' + esc(g.lastAccess) + "</span>" +

      (g.pinned ? '<span class="ca-badge" data-kind="state" data-icon data-state="managed">Pinned — protected from fading</span>' : "") +

      "</div>" +

      '<div class="actions">' +

      '<button type="button" class="ca-btn" data-variant="quiet" data-gact="detail">' + (open ? "Hide detail" : "Evidence and versions") + "</button>" +

      (g.status !== "verified" ? '<button type="button" class="ca-btn" data-variant="quiet" data-gact="verify">Mark verified</button>' : "") +

      '<button type="button" class="ca-btn" data-variant="quiet" data-gact="pin">' + (g.pinned ? "Unpin" : "Pin") + "</button>" +

      '<button type="button" class="ca-btn" data-variant="quiet" data-gact="discard">Discard</button>' +

      "</div>" +

      (open ?

        '<div class="ca-panel"><h3 class="ca-panel-h">Evidence</h3><ul class="evidence">' +

        g.evidence.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>" +

        '<div class="ca-faint" style="font-size:11.5px">' + g.versions + " version" + (g.versions === 1 ? "" : "s") + " on record. " +

        '<button type="button" class="ca-btn" data-variant="quiet" data-gact="restore">Restore an earlier version</button></div>' +

        '<div class="hb-capsule">Capsule sent to the model: “Remember: ' + esc(g.text) + "” — scope " + esc(g.scope) + ", kind " + esc(g.kind) + ".</div>" +

        '<div class="ca-row" style="border:0;padding-block:6px"><div class="ca-row-main"><div class="ca-row-label">Half-life (advanced)</div><div class="ca-row-desc">How quickly this Gist fades from active context.</div></div>' +

        '<div class="ca-row-control"><span class="ca-sliderwrap"><input type="range" class="ca-slider" min="7" max="365" value="' + g.halfLifeDays + '" data-ghalf="' + esc(g.id) + '" aria-label="Half-life in days"><output class="ca-slider-val">' + g.halfLifeDays + " days</output></span></div></div>" +

        "</div>" : "") +

      "</div>";

  }



  function renderMemory() {

    var gists = PMStore.get("memory.gists", []);

    var shown = gists.filter(gistMatches);

    var segs = [["all", "All"], ["verified", "Verified"], ["review", "Awaiting review"], ["pinned", "Pinned"]].map(function (f) {

      return '<button type="button" role="radio" aria-checked="' + (memFilter === f[0]) + '" data-memf="' + f[0] + '">' + f[1] + "</button>";

    }).join("");

    root.innerHTML = '<div class="hb-mgr">' +

      '<div class="hb-ws-bar">' +

      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> All settings</button>' +

      "<h1>Memory locker</h1>" + '<span class="hb-ws-purpose">Evidence-backed Gists with review, pinning, and fading</span><span class="spacer"></span>' +

      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-mem-rebuild">Rebuild index</button>' +

      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-mem-dedup">Deduplicate</button>' +

      "</div>" +

      '<div class="hb-mgr-detail" style="padding:18px 26px 80px;overflow:auto">' +

      '<div class="hb-gist-filters"><span class="ca-seg" role="radiogroup" aria-label="Filter Gists">' + segs + "</span>" +

      '<span class="ca-faint" style="font-size:11.5px">' + shown.length + " of " + gists.length + " Gists</span></div>" +

      '<p class="hb-mgr-note">Assistant preference Gists stay Assistant-only. Thread history, Goal state, planning records, and artifacts are separate stores — other agents search them through scoped tools, not here.</p>' +

      '<div style="display:grid;gap:10px">' + (shown.map(gistHtml).join("") || '<div class="ca-empty"><div class="ca-empty-title">No Gists match this filter</div></div>') + "</div>" +

      '<div class="ca-panel" style="margin-top:16px"><h3 class="ca-panel-h">Retention and redaction</h3><p style="margin:0;font-size:12.5px;color:var(--pm-ink-dim)">Retention windows and redaction rules apply before any Gist is stored. Rebuilding the index re-derives capsules from the stored evidence; deduplication merges near-identical Gists and keeps their version history.</p></div>' +

      "</div></div>";



    document.getElementById("hb-back").addEventListener("click", function () { view = { name: "home" }; render(); });

    document.getElementById("hb-mem-rebuild").addEventListener("click", function () {

      PMStore.receipt("Index rebuild simulated — capsules would be re-derived from evidence", "info");

    });

    document.getElementById("hb-mem-dedup").addEventListener("click", function () {

      PMStore.receipt("Deduplication simulated — no Gists were merged", "info");

    });

    root.querySelectorAll("[data-memf]").forEach(function (b) {

      b.addEventListener("click", function () { memFilter = b.getAttribute("data-memf"); render(); });

    });

    root.querySelectorAll("[data-gact]").forEach(function (b) {

      b.addEventListener("click", function () {

        var id = b.closest("[data-gist]").getAttribute("data-gist");

        var act = b.getAttribute("data-gact");

        var gists = PMStore.get("memory.gists", []).slice();

        var g = null;

        gists.forEach(function (x) { if (x.id === id) g = x; });

        if (!g) return;

        if (act === "detail") { openAdv["gist-" + id] = !openAdv["gist-" + id]; render(); return; }

        if (act === "verify") { g.status = "verified"; PMStore.set("memory.gists", gists); PMStore.receipt("Gist verified — its evidence stays attached", "ok"); }

        if (act === "pin") { g.pinned = !g.pinned; PMStore.set("memory.gists", gists); }

        if (act === "discard") {

          PMStore.set("memory.gists", gists.filter(function (x) { return x.id !== id; }));

          PMStore.receipt("Gist discarded from memory (simulated)", "warn");

        }

        if (act === "restore") { PMStore.receipt("Version restore simulated — the current text was kept", "info"); }

      });

    });

    root.querySelectorAll("[data-ghalf]").forEach(function (sl) {

      sl.addEventListener("change", function () {

        var id = sl.getAttribute("data-ghalf");

        var gists = PMStore.get("memory.gists", []).slice();

        gists.forEach(function (x) { if (x.id === id) x.halfLifeDays = parseInt(sl.value, 10); });

        PMStore.set("memory.gists", gists);

      });

      sl.addEventListener("input", function () {

        sl.parentNode.querySelector(".ca-slider-val").textContent = sl.value + " days";

      });

    });

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

    var doc = root.querySelector(".hb-cargo");

    var detail = root.querySelector(".hb-mgr-detail");

    var home = root.querySelector(".hb-home");

    var st = doc ? doc.scrollTop : detail ? detail.scrollTop : home ? home.scrollTop : 0;

    if (view.name === "workspace") renderWorkspace();

    else if (view.name === "manager") {

      if (view.id === "providers") renderProviders();

      else if (window.CAManagers && CAManagers.handles(view.id)) {

        if (CAManagers.disposeActiveScope) CAManagers.disposeActiveScope();
        CAManagers.mount({

          root: root,

          managerId: view.id,

          chrome: { wrapClass: "hb-mgr", barClass: "hb-ws-bar", detailClass: "hb-mgr-detail", backId: "hb-back" },

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

    var after = root.querySelector(".hb-cargo") || root.querySelector(".hb-mgr-detail") || root.querySelector(".hb-home");

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



  PMStore.on("change", render);

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

  if (window.PMShell) PMShell.init();

  render();

})();

