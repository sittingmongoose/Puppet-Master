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

  PMStore.seed({
    overrides: {},
    dismissedNotices: [],
    calmDemo: false,
    providers: V.clone(DEMO.providers),
    memory: V.clone(DEMO.memory),
    terminal: V.clone(DEMO.terminal),
    spell: {
      ignored: [],
      personal: DEMO.spellcheck.personalDictionary.slice(),
      project: DEMO.spellcheck.projectDictionary.slice()
    }
  });
  PMStore.init("harbor");

  var INDEX = PMSearch.buildIndex(DEMO);
  var root = document.getElementById("hb-root");

  /* view = {name:"home"} | {name:"workspace", cat, focusSub, focusSetting}
          | {name:"manager", id, pid, tab} */
  var view = { name: "home" };
  var spy = null;
  var openAdv = {};            /* advanced disclosures kept across renders */
  var memFilter = "all";       /* memory manager filter (local UI state) */
  var resetArmed = null;       /* two-click category reset */

  var MANAGERS = { providers: true, memory: true, terminal: true, lsp: true };
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
    return DEMO.categories.map(function (c, i) {
      var mgr = c.manager && MANAGERS[c.manager]
        ? '<span class="hb-berth-mgr">' + esc(DEMO.managerMeta[c.manager].title) + "</span>" : "";
      return '<button type="button" class="hb-berth" data-cat="' + esc(c.id) + '">' +
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
      '<div class="hb-eyebrow">Concept 01 · Harbor · pier berthing <span class="hb-model" data-concept-model="CursorAuto">Concept model: CursorAuto</span></div>' +
      "<h1>What needs to dock?</h1>" +
      '<div class="hb-searchbox">' + V.icon("search") +
      '<input id="hb-search" type="text" autocomplete="off" spellcheck="false" aria-label="Search settings" aria-expanded="false" placeholder="Search the pier — settings, managers, actions">' +
      "</div>" +
      '<div class="hb-hits" id="hb-hits" role="listbox" aria-label="Search results" hidden></div>' +
      '<div class="hb-hint">Try “verifier”, “spellcheck”, or “Claude”. Hits open the exact berth row.</div>' +
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
    var mgrs = '<div class="hb-slip-num" style="padding:10px 10px 0">Drydocks</div>' + ["providers", "memory", "terminal", "lsp"].map(function (mid) {
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
    if (tab === "overview") pane = providerOverviewHtml(p);
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
    else if (tab === "routing") pane = V.routingHtml(p);
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

  
  function renderLsp() {
    var servers = DEMO.lsp || [];
    var rows = servers.map(function (s) {
      var stateTok = (s.state === "healthy" || s.state === "ready") ? "default" : "not-configured";
      var caps = Array.isArray(s.capabilities) ? s.capabilities.join(", ") : String(s.capabilities || "");
      return (
        '<div class="ca-row"><div class="ca-row-main"><div class="ca-row-label">' + esc(s.name) +
        ' <span class="ca-badge" data-kind="scope">' + esc(s.language || "language") + "</span>" +
        ' <span class="ca-badge" data-kind="state" data-icon data-state="' + stateTok + '">' + esc(s.state || "Detected") + "</span></div>" +
        '<div class="ca-row-desc">Executable ' + esc(s.executable || s.command || "Auto-detected") +
        (s.version ? " · version " + esc(s.version) : "") +
        " · scope " + esc(s.scope || "workspace") +
        " · startup " + esc(s.startupMode || "on demand") + "</div>" +
        (caps ? '<div class="ca-row-desc">Capabilities: ' + esc(caps) + "</div>" : "") +
        (s.formattingOwner ? '<div class="ca-row-desc">Formatting owned by ' + esc(s.formattingOwner) + "; diagnostics by " + esc(s.diagnosticsOwner || "unset") + "</div>" : "") +
        '</div><div class="ca-row-control">' +
        '<button type="button" class="ca-btn" data-variant="quiet" data-lsp-restart="' + esc(s.id) + '">Restart</button> ' +
        '<button type="button" class="ca-btn" data-variant="quiet" data-lsp-logs="' + esc(s.id) + '">Logs</button></div></div>'
      );
    }).join("");
    root.innerHTML =
      '<div class="hb-mgr"><div class="hb-ws-bar">' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> All settings</button>' +
      "<h1>Language servers</h1>" +
      '<span class="hb-ws-purpose">Installed and detected servers, coverage, and conflicts</span></div>' +
      '<div class="ca-panel" style="margin:16px"><h3 class="ca-panel-h">Servers</h3>' +
      (rows || '<div class="ca-empty"><div class="ca-empty-title">No language servers detected</div></div>') +
      "</div>" +
      '<p class="hb-mgr-note" style="margin:0 16px 16px">Formatting and diagnostics ownership stay explicit per language. Restart and logs are simulated.</p></div>';
    document.getElementById("hb-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    root.querySelectorAll("[data-lsp-restart]").forEach(function (b) {
      b.addEventListener("click", function () { PMStore.receipt("Language server restart simulated — no process was killed", "info"); });
    });
    root.querySelectorAll("[data-lsp-logs]").forEach(function (b) {
      b.addEventListener("click", function () { PMStore.receipt("Opening language server logs is simulated in this concept", "info"); });
    });
  }

  function renderTerminal() {
    var term = PMStore.get("terminal", { profiles: [], activeProfile: null });
    var pid = view.pid || term.activeProfile || (term.profiles[0] && term.profiles[0].id);
    var p = null;
    term.profiles.forEach(function (x) { if (x.id === pid) p = x; });
    if (!p) p = term.profiles[0];
    var st = profilePreviewStyle(p);

    function textField(path, value, hint, placeholder) {
      var isTok = inheritOrValue(value);
      return '<span class="ca-text"' + (isTok ? ' data-empty-hint="' + esc(value) + '"' : "") + '><input type="text" data-tpath="' + esc(path) + '" value="' + (isTok ? "" : esc(value)) + '" placeholder="' + esc(placeholder) + '" aria-label="' + esc(path) + '"></span>';
    }

    var fields = '<div class="hb-fieldgrid">' +
      termFieldRow("Shell", "The program new terminals start.", textField("shell", p.shell, null, "/bin/zsh")) +
      termFieldRow("Font family", "Primary face; the fallback covers missing glyphs.", textField("font.family", p.font.family, null, "Menlo")) +
      termFieldRow("Font size", "Points. Inherit follows the app editor size.",
        '<span class="ca-stepper" data-tstep="font.size"><button type="button" data-step="-1" aria-label="Smaller">−</button><input type="text" value="' + (inheritOrValue(p.font.size) ? p.font.size : p.font.size) + '" aria-label="Font size" readonly><button type="button" data-step="1" aria-label="Larger">+</button></span>' +
        (inheritOrValue(p.font.size) ? ' <span class="ca-badge" data-kind="state" data-icon data-state="' + (p.font.size === "inherit" ? "inherited" : "auto") + '">' + (p.font.size === "inherit" ? "Inherited" : "Auto") + "</span>" : "")) +
      termFieldRow("Line height", "Multiplier of the font size.", textField("font.lineHeight", String(p.font.lineHeight), null, "1.2")) +
      termFieldRow("Foreground", "Default text color.", textField("colors.fg", p.colors.fg, null, "#E8E6EA")) +
      termFieldRow("Background", "Terminal background.", textField("colors.bg", p.colors.bg, null, "#1D1B22")) +
      termFieldRow("Palette", "The ANSI palette.", textField("colors.palette", p.colors.palette, null, "Puppet Dark")) +
      termFieldRow("Opacity", "Window material opacity.", textField("opacity", p.opacity, null, "100%")) +
      termFieldRow("Cursor style", "Bar, block, or underline.",
        '<span class="ca-select"><select data-tpath="cursor.style" aria-label="Cursor style">' +
        ["bar", "block", "underline", "inherit"].map(function (c) {
          return '<option value="' + c + '"' + (p.cursor.style === c ? " selected" : "") + ">" + (c === "inherit" ? "Inherit" : c[0].toUpperCase() + c.slice(1)) + "</option>";
        }).join("") + "</select></span>") +
      termFieldRow("Working directory", "Where new terminals start.", textField("cwdPolicy", p.cwdPolicy, null, "Inherit from the app")) +
      termFieldRow("Transcript retention", "How long scrollback is kept.", textField("transcriptRetention", p.transcriptRetention, null, "30 days")) +
      termFieldRow("Startup command", "Runs in every new terminal. Not configured means none.", textField("startupCommand", p.startupCommand, null, "Leave empty for none")) +
      "</div>";

    var cursorCss = st.cursor === "block" ? "inline-size:9px;block-size:16px" : st.cursor === "underline" ? "inline-size:9px;block-size:2px;vertical-align:-2px" : "inline-size:2px;block-size:16px";
    var preview =
      '<div class="hb-term-preview"><div class="hb-term-titlebar">' + esc(p.name) + " — live preview</div>" +
      '<div class="hb-term-screen" style="background:' + esc(st.bg) + ";color:" + esc(st.fg) + ";font-size:" + st.size + "px;line-height:" + st.lh + ";font-family:" + esc(st.family) + ",monospace;opacity:" + st.opacity + '">' +
      '<div class="line">puppet-master % pm status</div>' +
      '<div class="line">2 providers ready · 1 needs sign-in · catalog fresh</div>' +
      '<div class="line">puppet-master % git log --oneline -2</div>' +
      '<div class="line">a1b2c3d settings: three-surface architecture</div>' +
      '<div class="line">e5f6a7b concepts: bakeoff scaffolding</div>' +
      '<div class="line">puppet-master % <span class="hb-term-cursor" style="' + cursorCss + '"></span></div>' +
      "</div></div>";

    var profList = term.profiles.map(function (x) {
      return '<button type="button" class="hb-term-prof" data-prof="' + esc(x.id) + '" aria-current="' + (x.id === p.id) + '">' +
        '<div class="name">' + esc(x.name) + "</div>" +
        '<div class="sub">' + (x.completeness === "complete" ? "Complete" : "Partial — inherits the rest from Default") + "</div></button>";
    }).join("");

    root.innerHTML = '<div class="hb-mgr"><div class="hb-mgr-inner">' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<button type="button" class="ca-btn hb-back" data-variant="quiet" id="hb-back"><svg viewBox="0 0 24 24" aria-hidden="true" style="inline-size:12px;block-size:12px"><path d="m15 5-7 7 7 7"/></svg> Home</button>' +
      '<h1 style="margin:0;font-size:20px">Terminal</h1>' +
      '<span class="ca-faint" style="font-size:12px">Profiles, fonts, and shell policy — every field states what emptiness means</span><span style="flex:1"></span>' +
      '<button type="button" class="ca-btn" data-variant="quiet" id="hb-term-diag">Run diagnostics</button></div>' +
      '<div class="hb-term-grid"><div>' + profList +
      '<p class="hb-mgr-note">The Work profile inherits what it lacks from Default; its four undecided fields are marked Inherit, Auto, or Not configured — never blank.</p></div>' +
      '<div style="display:grid;gap:16px">' + preview +
      '<div class="ca-panel"><h3 class="ca-panel-h">Profile fields</h3>' + fields + "</div>" +
      "</div></div></div></div>";

    document.getElementById("hb-back").addEventListener("click", function () { view = { name: "home" }; render(); });
    document.getElementById("hb-term-diag").addEventListener("click", function () {
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
    var focusingSetting = view.focusSetting;
    var focusingSub = view.focusSub;
    var doc = root.querySelector(".hb-cargo");
    var detail = root.querySelector(".hb-mgr-detail");
    var home = root.querySelector(".hb-home");
    var st = doc ? doc.scrollTop : detail ? detail.scrollTop : home ? home.scrollTop : 0;
    if (view.name === "workspace") renderWorkspace();
    else if (view.name === "manager") {
      if (view.id === "memory") renderMemory();
      else if (view.id === "terminal") renderTerminal();
      else if (view.id === "lsp") renderLsp();
      else renderProviders();
    } else renderHome();
    var after = root.querySelector(".hb-cargo") || root.querySelector(".hb-mgr-detail") || root.querySelector(".hb-home");
    if (after && !focusingSetting && !focusingSub) after.scrollTop = st;
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

  if (window.CAStates) CAStates.mount({ host: document.body });
  if (window.PMShell) PMShell.init();
  render();
})();
