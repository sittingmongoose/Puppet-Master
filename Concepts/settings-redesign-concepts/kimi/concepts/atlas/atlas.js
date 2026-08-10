/* ============================================================================
   Concept 01 — Atlas · Directory IA
   Home = annotated directory crowned by search. Workspace = outline /
   document / context gutter. Managers = master–detail reference surfaces.
   All semantic state lives in PMStore; rendering is a pure function of it.
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
    memory: V.clone(DEMO.memory),
    mcp: V.clone(DEMO.mcp),
    spell: {
      ignored: [],
      personal: DEMO.spellcheck.personalDictionary.slice(),
      project: DEMO.spellcheck.projectDictionary.slice()
    }
  });
  PMStore.init("atlas");

  var INDEX = PMSearch.buildIndex(DEMO);
  var root = document.getElementById("atlas-root");

  /* view = {name:"home"} | {name:"workspace", cat, focusSub, focusSetting}
          | {name:"manager", id, pid, tab} */
  var view = { name: "home" };
  var spy = null;
  var openAdv = {};            /* advanced disclosures kept across renders */
  var memFilter = "all";       /* memory manager filter (local UI state) */
  var resetArmed = null;       /* two-click category reset */

  var MANAGERS = { providers: true, memory: true, mcp: true };
  var MANAGER_CATEGORY = { terminal: "code", crew: "collaboration", media: "media", lsp: "code", skills: "tools", tools: "tools", commands: "tools", personas: "providers", context: "context", memory: "context", mcp: "tools", spellcheck: "appearance" };

  function catById(id) {
    for (var i = 0; i < DEMO.categories.length; i++) if (DEMO.categories[i].id === id) return DEMO.categories[i];
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* navigation                                                          */
  /* ------------------------------------------------------------------ */

  function navigate(target) {
    var t = PMSearch.deepLink ? PMSearch.deepLink({ target: target }) : target;
    t = t || target;
    if (t.manager === "usage") {
      view = { name: "manager", id: "providers", pid: null, tab: "usage" };
    } else if (t.manager && MANAGERS[t.manager]) {
      view = { name: "manager", id: t.manager, pid: null, tab: t.tab || null };
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
      return '<div class="atlas-calm">' + V.icon("check") +
        '<div><b>All clear.</b> Nothing needs attention, no setup is waiting, and there is nothing new to recommend.</div>' +
        '<div class="pm-faint" style="font-size:11.5px">This is the calm state — the home still leads with search and places.</div></div>';
    }
    var order = { attention: 0, setup: 1, recommended: 2 };
    list.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    return '<div class="atlas-notices">' + list.map(V.noticeHtml).join("") + "</div>";
  }

  function directoryHtml() {
    return DEMO.categories.map(function (c) {
      var mgr = c.manager && MANAGERS[c.manager]
        ? ' <span class="pm-badge" data-kind="scope">Includes the ' + esc(DEMO.managerMeta[c.manager].title) + " manager</span>" : "";
      return '<button type="button" class="pm-dest-row" data-cat="' + esc(c.id) + '">' +
        '<span class="pm-dest-icon">' + V.icon(c.icon) + "</span>" +
        '<span class="pm-dest-main"><span class="pm-dest-title">' + esc(c.title) + "</span>" +
        '<span class="pm-dest-purpose">' + esc(c.purpose) + mgr + "</span></span>" +
        '<span class="pm-dest-status">' + esc(c.statusSummary) + '</span><span class="pm-dest-chevron"></span>' +
        "</button>";
    }).join("");
  }

  function homeHtml() {
    var recents = DEMO.recents.map(function (r, i) {
      return '<button type="button" class="atlas-recent" data-recent="' + i + '">' + V.icon("chevron") + esc(r.label) + "</button>";
    }).join("");
    return '<div class="atlas-home"><div class="atlas-home-inner">' +
      '<header class="atlas-hero">' +
      '<div class="atlas-eyebrow">Concept 01 · Atlas — settings as a directory of places <span class="atlas-model" data-concept-model="Kimi">Concept model: Kimi</span></div>' +
      "<h1>Where do you want to go?</h1>" +
      '<div class="atlas-searchbox">' + V.icon("search") +
      '<input id="atlas-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" aria-expanded="false" placeholder="Search every setting, manager, and action">' +
      "</div>" +
      '<div class="atlas-hits" id="atlas-hits" role="listbox" aria-label="Search results" hidden></div>' +
      '<div class="atlas-hint">Try “verifier”, “spellcheck”, or “Claude”. Results open the exact row, not just the page.</div>' +
      "</header>" +
      '<div id="atlas-home-body" style="display:grid;gap:26px">' +
      '<section class="atlas-section" aria-label="Notices"><h2 class="atlas-section-h">What needs you</h2>' + noticesHtml() + "</section>" +
      '<section class="atlas-section" aria-label="All settings destinations"><h2 class="atlas-section-h">The directory <span>' + DEMO.categories.length + " places</span></h2>" +
      '<div class="atlas-directory">' + directoryHtml() + "</div></section>" +
      '<section class="atlas-section" aria-label="Recent"><h2 class="atlas-section-h">Pick up where you left off</h2><div class="atlas-recents">' + recents + "</div></section>" +
      '<footer class="atlas-home-foot">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-calm-toggle">Toggle calm state (demo)</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-reset">Reset demo data</button>' +
      "<span>Directory IA: search first, places not pills, one document per place.</span>" +
      "</footer>" +
      "</div></div></div>";
  }

  function renderHome() {
    root.innerHTML = homeHtml();
    var input = document.getElementById("atlas-search");
    var hits = document.getElementById("atlas-hits");
    var body = document.getElementById("atlas-home-body");
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
    document.getElementById("atlas-calm-toggle").addEventListener("click", function () {
      PMStore.set("calmDemo", !PMStore.get("calmDemo", false));
    });
    document.getElementById("atlas-reset").addEventListener("click", function () {
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
      html += '<details class="atlas-adv"' + (openAdv[key] ? " open" : "") + ' data-adv="' + esc(key) + '"><summary>Show ' +
        advanced.length + " advanced, expert, or diagnostic options</summary>" +
        '<div class="atlas-adv-body">' + advanced.map(function (s) { return V.rowHtml(s); }).join("") + "</div></details>";
    }
    return html;
  }

  function outlineHtml(cat) {
    var cats = DEMO.categories.map(function (c) {
      var current = c.id === cat.id;
      var subs = "";
      if (current) {
        subs = c.subcategories.map(function (sub) {
          return '<button type="button" class="atlas-ol-sub" data-sub="' + esc(sub.id) + '">' + esc(sub.title) + "</button>";
        }).join("");
      }
      return '<div><button type="button" class="atlas-ol-cat" data-olcat="' + esc(c.id) + '" aria-current="' + current + '">' +
        V.icon(c.icon) + "<span>" + esc(c.title) + '</span><span class="atlas-ol-status">' +
        (c.status === "ok" ? "" : esc(c.statusSummary)) + "</span></button>" + subs + "</div>";
    }).join("");
    var mgrs = '<div class="atlas-ol-group-h">Managers</div>' + ["providers", "memory", "mcp"].map(function (mid) {
      var m = DEMO.managerMeta[mid];
      return '<button type="button" class="atlas-ol-cat" data-mgr="' + esc(mid) + '">' + V.icon(m.icon) + "<span>" + esc(m.title) + "</span></button>";
    }).join("");
    return '<div class="atlas-searchwrap"><div class="atlas-searchbox">' + V.icon("search") +
      '<input id="atlas-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></div>' +
      '<div class="atlas-hits" id="atlas-ws-hits" role="listbox" hidden></div></div>' +
      '<div class="atlas-outline-list" id="atlas-ol-list">' + cats + mgrs + "</div>";
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
      return '<div><span class="pm-badge" data-kind="state" data-icon data-state="' + esc(k) + '">' + esc(V.human(V.STATE_LABEL, k)) + "</span> <b>" + counts[k] + "</b></div>";
    }).join("");
    return '<h2 class="atlas-gutter-h">Context</h2>' +
      '<div class="pm-panel"><h3 class="pm-panel-h">' + esc(cat.title) + " at a glance</h3>" +
      '<div style="display:grid;gap:6px;font-size:12px;color:var(--pm-ink-dim)">' + lines + "</div>" +
      '<p class="pm-faint" style="font-size:11.5px;margin:10px 0 0">' + total + ' settings in this place. Focus any row to inspect its source, scope, and relations here.</p></div>';
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
    return '<h2 class="atlas-gutter-h">Context</h2>' +
      '<div class="pm-panel"><h3 class="pm-panel-h">' + esc(s.label) + "</h3>" +
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
      (relatedHtml ? '<div class="pm-panel"><h3 class="pm-panel-h">Related settings</h3><div class="atlas-related">' + relatedHtml + "</div></div>" : "");
  }

  function workspaceHtml(cat) {
    var sections = cat.subcategories.map(function (sub) {
      return '<section class="atlas-sec" id="sec-' + esc(sub.id) + '" aria-label="' + esc(sub.title) + '">' +
        "<h2>" + esc(sub.title) + '</h2><p class="atlas-sec-sum">' + esc(sub.summary) + "</p>" +
        rowsFor(sub) + "</section>";
    }).join("");
    var spell = cat.id === "appearance" ? '<section class="atlas-sec" id="sec-spellcheck-demo" aria-label="Spellcheck demonstration"><h2>Spellcheck, live</h2><p class="atlas-sec-sum">The shared writing service, shown on a draft. It never changes text by itself.</p><div id="atlas-spell"></div></section>' : "";
    var mgrBtn = cat.manager
      ? '<button type="button" class="pm-btn" id="atlas-open-mgr">Open the ' + esc(DEMO.managerMeta[cat.manager].title) + " manager</button>" : "";
    return '<div class="atlas-ws">' +
      '<div class="atlas-ws-bar">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> All settings</button>' +
      '<button type="button" class="pm-btn atlas-nav-toggle" id="atlas-nav-toggle">Contents</button>' +
      "<h1>" + esc(cat.title) + '</h1><span class="atlas-ws-purpose">' + esc(cat.purpose) + "</span>" +
      '<span class="spacer"></span>' + mgrBtn +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-cat-reset">Reset this place to defaults</button>' +
      "</div>" +
      '<div class="atlas-ws-grid">' +
      '<nav class="atlas-outline" id="atlas-outline" aria-label="Settings navigation">' + outlineHtml(cat) + "</nav>" +
      '<div class="atlas-doc" id="atlas-doc">' + sections + spell + "</div>" +
      '<aside class="atlas-gutter" id="atlas-gutter" aria-label="Setting context">' + gutterDefaultHtml(cat) + "</aside>" +
      "</div></div>";
  }

  function renderWorkspace() {
    var cat = catById(view.cat) || DEMO.categories[0];
    root.innerHTML = workspaceHtml(cat);
    var doc = document.getElementById("atlas-doc");
    var outline = document.getElementById("atlas-outline");

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
      input: document.getElementById("atlas-ws-search"),
      listEl: document.getElementById("atlas-ws-hits"),
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
        outline.querySelectorAll(".atlas-ol-sub").forEach(function (b) {
          b.setAttribute("aria-current", String(b.getAttribute("data-sub") === id.replace(/^sec-/, "")));
        });
      }
    });

    /* disclosures persist */
    doc.querySelectorAll(".atlas-adv").forEach(function (d) {
      d.addEventListener("toggle", function () { openAdv[d.getAttribute("data-adv")] = d.open; });
    });

    /* gutter follows row focus/click */
    function showSetting(sid) {
      var s = DEMO.settings[sid];
      var g = document.getElementById("atlas-gutter");
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
    doc.querySelectorAll(".pm-row[data-setting]").forEach(function (row) {
      row.addEventListener("click", function (ev) {
        if (!ev.target.closest("button, select, input, .pm-switch")) showSetting(row.getAttribute("data-setting"));
      });
      row.addEventListener("focusin", function () { showSetting(row.getAttribute("data-setting")); });
    });

    /* bar actions */
    document.getElementById("atlas-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    var navToggle = document.getElementById("atlas-nav-toggle");
    navToggle.addEventListener("click", function () {
      outline.setAttribute("data-open", outline.getAttribute("data-open") === "true" ? "false" : "true");
    });
    var mgrBtn = document.getElementById("atlas-open-mgr");
    if (mgrBtn) mgrBtn.addEventListener("click", function () {
      if (MANAGERS[cat.manager]) {
        view = { name: "manager", id: cat.manager, pid: null, tab: null };
        render();
      } else {
        PMStore.receipt("The " + DEMO.managerMeta[cat.manager].title + " manager is realized richly in another concept of this bakeoff; its settings live inline here", "info");
      }
    });

    /* two-click category reset */
    var resetBtn = document.getElementById("atlas-cat-reset");
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
      V.mountSpellcheck(document.getElementById("atlas-spell"), {});
    }

    /* deep-link focus */
    if (view.focusSetting) {
      var row = document.getElementById("row-" + view.focusSetting);
      if (row) {
        var adv = row.closest(".atlas-adv");
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
      return '<div class="atlas-mgr-group">' + esc(V.GROUP_LABEL[g]) + "</div>" +
        byGroup[g].map(function (p) {
          var st = V.providerStatus(p);
          return '<button type="button" class="atlas-mgr-item" data-pid="' + esc(p.id) + '" aria-current="' + (p.id === selected) + '">' +
            '<span class="name">' + esc(p.name) + "</span>" +
            '<span class="sub">' + V.healthDot(st.dot, st.label) + "</span></button>";
        }).join("");
    }).join("") +
    '<div class="atlas-mgr-group">Assignments</div>' +
    '<button type="button" class="atlas-mgr-item" data-pid="__roles" aria-current="' + (selected === "__roles") + '">' +
    '<span class="name">Agent roles</span>' +
    '<span class="sub">Which routes power planning, verification, and background work</span></button>';
  }

  function providerOverviewHtml(p) {
    var st = V.providerStatus(p);
    var act = V.activeAccount(p);
    var install = V.INSTALL_STATE[p.installState];
    var available = p.models.filter(function (m) { return !m.unavailableReason; }).length;
    var unavailable = p.models.length - available;
    var usage = p.usageSnapshot;
    return '<div class="atlas-stamp">' +
      '<div><div class="k">Status</div><div class="v">' + V.healthDot(st.dot, st.label) + "</div></div>" +
      (install ? '<div><div class="k">Installation</div><div class="v">' + esc(install) + "</div></div>" : "") +
      '<div><div class="k">Account in use</div><div class="v">' + esc(act ? act.label + " — " + act.identity : "None yet") + "</div></div>" +
      '<div><div class="k">Plan and billing</div><div class="v">' + esc(p.product.plan) + " · " + esc(p.product.billingRoute) + "</div></div>" +
      (usage ? '<div><div class="k">Included usage left</div><div class="v">' + esc(usage.includedRemaining) + " · pressure " + esc(usage.pressure) + "</div></div>" : "") +
      (usage ? '<div><div class="k">When it runs out</div><div class="v">' + esc(usage.projection) + "</div></div>" : "") +
      '<div><div class="k">Models</div><div class="v">' + available + " available" + (unavailable ? " · " + unavailable + " unavailable" : "") + "</div></div>" +
      '<div><div class="k">Catalog</div><div class="v">' + esc(p.catalog.source) + " · " + (p.catalog.refreshing ? "refreshing, showing last known good" : "version " + esc(p.catalog.version)) + "</div></div>" +
      "</div>" +
      (p.lastError ? '<div class="pm-notice" data-kind="attention"><span class="pm-notice-chip">Needs attention</span><div class="pm-notice-head">Model calls are failing</div><div class="pm-notice-body">' + esc(p.lastError) + '</div><div class="pm-notice-actions"><button type="button" class="pm-btn" data-variant="primary" data-pv="repair" data-pid="' + esc(p.id) + '">Run a readiness check</button></div></div>' : "") +
      (p.groupingNote ? '<p class="atlas-mgr-note">' + esc(p.groupingNote) + "</p>" : "") +
      '<p class="atlas-mgr-note">' + esc(V.AUTH_MODEL[p.authModel] || "") + "</p>";
  }

  function providerDetailHtml(p, tab) {
    var tabs = PROVIDER_TABS.map(function (t) {
      return '<button type="button" class="pm-tab" role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
    }).join("");
    var pane = "";
    if (tab === "overview") pane = providerOverviewHtml(p);
    else if (tab === "accounts") {
      pane = (p.installState === "not-installed")
        ? '<div class="pm-empty"><div class="pm-empty-title">Not installed</div><div class="pm-empty-guidance">' + esc(p.diagnostics[0]) + '</div><button type="button" class="pm-btn" data-variant="primary" data-pv="install" data-pid="' + esc(p.id) + '">' + esc((p.installAction && p.installAction.label) || "Install") + "</button></div>"
        : (p.accounts.length ? p.accounts.map(function (a) { return V.accountRowHtml(p, a); }).join("") : '<div class="pm-empty"><div class="pm-empty-title">No accounts yet</div><div class="pm-empty-guidance">Sign in to add one.</div><button type="button" class="pm-btn" data-variant="primary" data-pv="signin" data-pid="' + esc(p.id) + '">Sign in through the provider’s own flow</button></div>') +
          (p.accountSwitchNote ? '<p class="atlas-mgr-note">' + esc(p.accountSwitchNote) + "</p>" : "") +
          (p.groupingNote ? '<p class="atlas-mgr-note">' + esc(p.groupingNote) + "</p>" : "");
    }
    else if (tab === "models") pane = V.catalogHtml(p) + p.models.map(function (m) { return V.modelRowHtml(p, m); }).join("");
    else if (tab === "usage") pane = V.usageHtml(p);
    else if (tab === "routing") pane = V.routingHtml(p);
    else pane = '<div class="pm-panel"><h3 class="pm-panel-h">Sign-in ownership</h3><p style="margin:0;font-size:12.5px;color:var(--pm-ink-dim)">' + esc(V.AUTH_MODEL[p.authModel] || "") + '</p></div>' +
        '<div class="pm-panel"><h3 class="pm-panel-h">Diagnostics</h3>' + V.diagnosticsHtml(p) + "</div>" +
        '<div class="pm-panel"><h3 class="pm-panel-h">Support</h3><button type="button" class="pm-btn" data-variant="quiet" data-pv="reconnect" data-pid="' + esc(p.id) + '">Reconnect</button> <button type="button" class="pm-btn" data-variant="quiet" data-pv="repair" data-pid="' + esc(p.id) + '">Run a readiness check</button></div>';
    return '<h2>' + esc(p.name) + '</h2><p class="tagline">' + esc(p.tagline) + "</p>" +
      '<div class="pm-tabs" role="tablist">' + tabs + '</div><div class="atlas-tabpane">' + pane + "</div>";
  }

  function renderProviders() {
    var list = V.providers();
    if (view.pid === "__roles") {
      root.innerHTML = '<div class="atlas-mgr">' +
        '<div class="atlas-ws-bar">' +
        '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> All settings</button>' +
        '<button type="button" class="pm-btn atlas-fam-toggle" id="atlas-fam-toggle">Families</button>' +
        "<h1>Providers</h1>" + '<span class="atlas-ws-purpose">Agent role assignments</span>' +
        "</div>" +
        '<div class="atlas-mgr-grid">' +
        '<div class="atlas-mgr-list" id="atlas-mgr-list">' + providerListHtml("__roles") + "</div>" +
        '<div class="atlas-mgr-detail"><h2>Agent roles</h2><p class="tagline">Each job gets a route without forcing it into a provider card. Quality-guarded roles never silently downgrade.</p>' +
        '<div class="atlas-tabpane">' + V.rolesHtml(PMStore.get("roles", [])) + "</div></div>" +
        "</div></div>";
      document.getElementById("atlas-back").addEventListener("click", function () { view = { name: "home" }; render(); });
      document.getElementById("atlas-fam-toggle").addEventListener("click", function () {
        var famList = document.getElementById("atlas-mgr-list");
        famList.setAttribute("data-open", famList.getAttribute("data-open") === "true" ? "false" : "true");
      });
      root.querySelectorAll(".atlas-mgr-item").forEach(function (b) {
        b.addEventListener("click", function () {
          var pid2 = b.getAttribute("data-pid");
          view = { name: "manager", id: "providers", pid: pid2 === "__roles" ? "__roles" : pid2, tab: "overview" };
          render();
        });
      });
      return;
    }
    var pid = view.pid || (list[0] && list[0].id);
    var tab = view.tab || "overview";
    var p = V.providerById(pid) || list[0];
    root.innerHTML = '<div class="atlas-mgr">' +
      '<div class="atlas-ws-bar">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> All settings</button>' +
      '<button type="button" class="pm-btn atlas-fam-toggle" id="atlas-fam-toggle">Families</button>' +
      "<h1>Providers</h1>" + '<span class="atlas-ws-purpose">Accounts, connections, models, and routing</span><span class="spacer"></span>' +
      '<span class="atlas-searchwrap" style="flex:0 1 320px"><div class="atlas-searchbox">' + V.icon("search") +
      '<input id="atlas-ws-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" placeholder="Search all settings"></div>' +
      '<div class="atlas-hits" id="atlas-ws-hits" role="listbox" hidden></div></span>' +
      "</div>" +
      '<div class="atlas-mgr-grid">' +
      '<div class="atlas-mgr-list" id="atlas-mgr-list">' + providerListHtml(p.id) + "</div>" +
      '<div class="atlas-mgr-detail">' + providerDetailHtml(p, tab) + "</div>" +
      "</div></div>";
    document.getElementById("atlas-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    document.getElementById("atlas-fam-toggle").addEventListener("click", function () {
      var famList = document.getElementById("atlas-mgr-list");
      famList.setAttribute("data-open", famList.getAttribute("data-open") === "true" ? "false" : "true");
    });
    V.wireSearch({ input: document.getElementById("atlas-ws-search"), listEl: document.getElementById("atlas-ws-hits"), index: INDEX, onPick: onSearchPick });
    root.querySelectorAll(".atlas-mgr-item").forEach(function (b) {
      b.addEventListener("click", function () {
        var target = b.getAttribute("data-pid");
        view = { name: "manager", id: "providers", pid: target, tab: target === "__roles" ? null : "overview" };
        render();
      });
    });
    root.querySelectorAll(".pm-tab[data-tab]").forEach(function (b) {
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
    return '<div class="atlas-gist" data-gist="' + esc(g.id) + '">' +
      '<div class="top"><div class="text">' + esc(g.text) + "</div>" +
      '<span class="pm-badge" data-kind="state" data-icon data-state="' + (g.status === "verified" ? "default" : "recommended") + '">' + (g.status === "verified" ? "Verified" : "Awaiting review") + "</span></div>" +
      '<div class="meta">' +
      '<span class="pm-badge" data-kind="scope">' + esc(g.kind) + "</span>" +
      '<span class="pm-badge" data-kind="scope">' + (g.scope === "assistant" ? "Assistant only" : "Project") + "</span>" +
      '<span class="pm-badge" data-kind="scope">Fades from active context after ~' + g.halfLifeDays + " days — it never becomes false</span>" +
      '<span class="pm-badge" data-kind="scope">Last used ' + esc(g.lastAccess) + "</span>" +
      (g.pinned ? '<span class="pm-badge" data-kind="state" data-icon data-state="managed">Pinned — protected from fading</span>' : "") +
      "</div>" +
      '<div class="actions">' +
      '<button type="button" class="pm-btn" data-variant="quiet" data-gact="detail">' + (open ? "Hide detail" : "Evidence and versions") + "</button>" +
      (g.status !== "verified" ? '<button type="button" class="pm-btn" data-variant="quiet" data-gact="verify">Mark verified</button>' : "") +
      '<button type="button" class="pm-btn" data-variant="quiet" data-gact="pin">' + (g.pinned ? "Unpin" : "Pin") + "</button>" +
      '<button type="button" class="pm-btn" data-variant="quiet" data-gact="discard">Discard</button>' +
      "</div>" +
      (open ?
        '<div class="pm-panel"><h3 class="pm-panel-h">Evidence</h3><ul class="evidence">' +
        g.evidence.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>" +
        '<div class="pm-faint" style="font-size:11.5px">' + g.versions + " version" + (g.versions === 1 ? "" : "s") + " on record. " +
        '<button type="button" class="pm-btn" data-variant="quiet" data-gact="restore">Restore an earlier version</button></div>' +
        '<div class="atlas-capsule">Capsule sent to the model: “Remember: ' + esc(g.text) + "” — scope " + esc(g.scope) + ", kind " + esc(g.kind) + ".</div>" +
        '<div class="pm-row" style="border:0;padding-block:6px"><div class="pm-row-main"><div class="pm-row-label">Half-life (advanced)</div><div class="pm-row-desc">How quickly this Gist fades from active context.</div></div>' +
        '<div class="pm-row-control"><span class="pm-sliderwrap"><input type="range" class="pm-slider" min="7" max="365" value="' + g.halfLifeDays + '" data-ghalf="' + esc(g.id) + '" aria-label="Half-life in days"><output class="pm-slider-val">' + g.halfLifeDays + " days</output></span></div></div>" +
        "</div>" : "") +
      "</div>";
  }

  function renderMemory() {
    var gists = PMStore.get("memory.gists", []);
    var shown = gists.filter(gistMatches);
    var segs = [["all", "All"], ["verified", "Verified"], ["review", "Awaiting review"], ["pinned", "Pinned"]].map(function (f) {
      return '<button type="button" role="radio" aria-checked="' + (memFilter === f[0]) + '" data-memf="' + f[0] + '">' + f[1] + "</button>";
    }).join("");
    root.innerHTML = '<div class="atlas-mgr">' +
      '<div class="atlas-ws-bar">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> All settings</button>' +
      "<h1>Assistant memory</h1>" + '<span class="atlas-ws-purpose">Evidence-backed Gists with review, pinning, and fading</span><span class="spacer"></span>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-mem-rebuild">Rebuild index</button>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-mem-dedup">Deduplicate</button>' +
      "</div>" +
      '<div class="atlas-mgr-detail" style="padding:18px 26px 80px;overflow:auto">' +
      '<div class="atlas-gist-filters"><span class="pm-seg" role="radiogroup" aria-label="Filter Gists">' + segs + "</span>" +
      '<span class="pm-faint" style="font-size:11.5px">' + shown.length + " of " + gists.length + " Gists</span></div>" +
      '<p class="atlas-mgr-note">Assistant preference Gists stay Assistant-only. Thread history, Goal state, ledgers, and artifacts are separate stores — other agents search them through scoped tools, not here.</p>' +
      '<div style="display:grid;gap:10px">' + (shown.map(gistHtml).join("") || '<div class="pm-empty"><div class="pm-empty-title">No Gists match this filter</div></div>') + "</div>" +
      '<div class="pm-panel" style="margin-top:16px"><h3 class="pm-panel-h">Retention and redaction</h3><p style="margin:0;font-size:12.5px;color:var(--pm-ink-dim)">Retention windows and redaction rules apply before any Gist is stored. Rebuilding the index re-derives capsules from the stored evidence; deduplication merges near-identical Gists and keeps their version history.</p></div>' +
      "</div></div>";

    document.getElementById("atlas-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    document.getElementById("atlas-mem-rebuild").addEventListener("click", function () {
      PMStore.receipt("Index rebuild simulated — capsules would be re-derived from evidence", "info");
    });
    document.getElementById("atlas-mem-dedup").addEventListener("click", function () {
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
        sl.parentNode.querySelector(".pm-slider-val").textContent = sl.value + " days";
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* MCP MANAGER                                                         */
  /* ------------------------------------------------------------------ */

  function mcpCardHtml(s) {
    var h = V.HEALTH[s.health] || { label: s.health, dot: "unknown" };
    var tools = s.tools.map(function (t) {
      return '<span class="pm-badge" data-kind="scope">' + esc(t.name) + " · " + (t.exposure === "eager" ? "eager" : "lazy") + (t.invoked ? " · invoked" : "") + "</span>";
    }).join("");
    var body = s.health === "connecting"
      ? '<div class="pm-skeleton" style="block-size:12px;inline-size:70%"></div><div class="pm-skeleton" style="block-size:12px;inline-size:45%"></div>'
      : '<div class="atlas-mcp-tools">' + tools + "</div>" +
        (s.lastError ? '<div class="pm-row-reason">' + esc(s.lastError) + "</div>" : "") +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        '<span class="pm-select"><select data-mcp-policy="' + esc(s.id) + '" aria-label="Approval policy">' +
        ["Ask each time", "Remember for this session", "Remember for this Goal", "Always for this server"].map(function (pol) {
          return '<option value="' + esc(pol) + '"' + (pol === s.approvalPolicy ? " selected" : "") + ">" + esc(pol) + "</option>";
        }).join("") + "</select></span>" +
        '<button type="button" class="pm-btn" data-variant="quiet" data-mcp-rec="' + esc(s.id) + '">Reconnect</button>' +
        "</div>" +
        '<details class="pm-accordion"><summary>Logs</summary><div class="pm-accordion-body"><div class="pm-logs">' +
        s.logs.map(function (l) { return '<div class="pm-log-line">' + esc(l) + "</div>"; }).join("") + "</div></div></details>";
    return '<div class="atlas-mcp-card"><div class="head"><h3>' + esc(s.name) + "</h3>" + V.healthDot(h.dot, h.label) +
      '<span class="pm-badge" data-kind="scope">' + esc(s.transport) + "</span>" +
      '<span class="pm-badge" data-kind="scope">Protocol: requested ' + esc(s.protocol.requested) + " · negotiated " + esc(s.protocol.negotiated) + "</span>" +
      '<span class="pm-badge" data-kind="scope">' + (s.scope === "project" ? "This project" : "Global") + "</span></div>" + body + "</div>";
  }

  function renderMcp() {
    var servers = PMStore.get("mcp", []);
    root.innerHTML = '<div class="atlas-mgr">' +
      '<div class="atlas-ws-bar">' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> All settings</button>' +
      "<h1>MCP servers</h1>" + '<span class="atlas-ws-purpose">External tool servers, their health, and what they expose</span><span class="spacer"></span>' +
      '<button type="button" class="pm-btn" data-variant="quiet" id="atlas-mcp-add">Add a server</button>' +
      "</div>" +
      '<div class="atlas-mgr-detail" style="padding:18px 26px 80px;overflow:auto">' +
      '<p class="atlas-mgr-note">Tools load lazily: a server’s full schema is exposed to agents only when relevant. Provider or CLI projections of these servers are informational — this manager is the canonical state.</p>' +
      '<div style="display:grid;gap:12px">' + servers.map(mcpCardHtml).join("") + "</div>" +
      "</div></div>";
    document.getElementById("atlas-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    document.getElementById("atlas-mcp-add").addEventListener("click", function () {
      PMStore.receipt("Add-server simulated — no server was installed or contacted", "info");
    });
    root.querySelectorAll("[data-mcp-rec]").forEach(function (b) {
      b.addEventListener("click", function () {
        PMStore.receipt("Reconnect simulated — the server was not actually restarted", "info");
      });
    });
    root.querySelectorAll("[data-mcp-policy]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var servers = PMStore.get("mcp", []).slice();
        servers.forEach(function (s) { if (s.id === sel.getAttribute("data-mcp-policy")) s.approvalPolicy = sel.value; });
        PMStore.set("mcp", servers);
        PMStore.receipt("Approval policy updated (simulated)", "ok");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* render loop                                                         */
  /* ------------------------------------------------------------------ */

  function render() {
    if (spy) { spy.detach(); spy = null; }
    var doc = root.querySelector(".atlas-doc");
    var detail = root.querySelector(".atlas-mgr-detail");
    var home = root.querySelector(".atlas-home");
    var st = doc ? doc.scrollTop : detail ? detail.scrollTop : home ? home.scrollTop : 0;
    var wantsFocus = !!(view.focusSetting || view.focusSub);
    if (view.name === "workspace") renderWorkspace();
    else if (view.name === "manager") {
      if (view.id === "memory") renderMemory();
      else if (view.id === "mcp") renderMcp();
      else renderProviders();
    } else renderHome();
    var after = root.querySelector(".atlas-doc") || root.querySelector(".atlas-mgr-detail") || root.querySelector(".atlas-home");
    if (after && !wantsFocus) after.scrollTop = st;
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
  V.bindProviders(root, render);
  V.bindRoles(root);

  window.PMShell.init();
  render();
})();
