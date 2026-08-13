/* Opus 5 — Console
 *
 * Settings is a QUESTION. The console owns the first screen and answers in
 * place: a setting result becomes a live control, a manager result a preview, an
 * action result a receipt. Destinations are a numbered contents page.
 *
 * In the workspace the console shrinks and docks, keeping its query. Navigation
 * is a documentation-style index in the right margin whose marker travels with
 * the scroll rather than snapping.
 */
(function () {
  "use strict";

  var D = window.PMData;
  var S = window.PMSemantics;
  var I = window.PMIcons.icon;
  var E = window.PMShell.escapeHtml;

  var index = window.PMSearch.buildIndex(D);
  window.PMSpellcheck.learnNames(D.knownNames);

  var CONCEPT_ID = "console";
  var K = window.PMManagerKit;

  /* Only what a reviewer expects to survive a reload is persisted; an in-flight
   * refresh or a running cooldown deliberately is not. */
  var saved = window.PMStore.restore(CONCEPT_ID, window.PMStore.PERSIST_KEYS);

  var store = window.PMStore.createStore(Object.assign({
    view: "home",
    categoryId: null,
    modeId: null,
    managerSectionId: null,
    managerItemId: null,
    query: "",
    exposure: "standard",
    demoState: "normal",
    dismissedNotices: {},
    values: {},
    managerEdits: {},
    route: null,
    badRoute: null,
    theme: "glass-dark",
    widthChoice: "1280",
    railOpen: true,
    panelOpen: false,
    reducedMotion: false,
    openProviders: { claude: true },
    openInstallations: {},
    accountPref: {},
    favourites: {},
    hidden: {},
    aliases: {},
    revealed: {},
    catalogueRefreshing: false,
    personaId: "p-collaborator",
    personaScope: "This thread",
    skillTab: "skills",
    activeSub: null
  }, saved));

  var shell, spy, mainEl, docEl, indexEl, markerEl;

  /* Assignment and cross-concept homes come from the shared kit. */
  var BUILT_HERE = K.assignedTo(CONCEPT_ID);

  var LEVEL_VISIBLE = {
    standard: ["standard", "managed", "unavailable"],
    advanced: ["standard", "managed", "unavailable", "advanced"],
    all: ["standard", "managed", "unavailable", "advanced", "expert", "diagnostic"]
  };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function settingState(s) {
    var o = store.get().values[s.id];
    return o ? Object.assign({}, s.state, o) : s.state;
  }
  function statusChip(status, word) {
    return '<span class="pm-status" data-status="' + status + '">' +
      I(window.PMIcons.statusIcon(status), 12) + "<span>" + E(word) + "</span></span>";
  }
  function chip(status, word) { return '<span class="pm-chip" data-status="' + status + '">' + E(word) + "</span>"; }
  function announce(m) { if (shell) shell.announce(m); }

  /* popover ------------------------------------------------------------- */
  var pop = null;
  function closePop() {
    if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
    pop = null;
    document.removeEventListener("mousedown", popDown, true);
    document.removeEventListener("keydown", popKey, true);
  }
  function popDown(e) { if (pop && !pop.contains(e.target)) closePop(); }
  function popKey(e) { if (e.key === "Escape") closePop(); }
  function openPop(anchor, build) {
    closePop();
    var p = el("div", "pm-spell-menu");
    p.setAttribute("role", "menu");
    build(p, closePop);
    document.body.appendChild(p);
    var r = anchor.getBoundingClientRect();
    var top = r.bottom + 6, left = Math.min(r.left, window.innerWidth - p.offsetWidth - 8);
    if (left < 8) left = 8;
    if (top + p.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - p.offsetHeight - 6);
    p.style.top = Math.round(top) + "px";
    p.style.left = Math.round(left) + "px";
    pop = p;
    document.addEventListener("mousedown", popDown, true);
    document.addEventListener("keydown", popKey, true);
    var f = p.querySelector("button"); if (f) f.focus();
  }
  function popItem(label, onClick, opts) {
    var b = el("button", "pm-spell-item" + (opts && opts.strong ? " is-suggestion" : ""), E(label));
    b.type = "button"; b.setAttribute("role", "menuitem");
    if (opts && opts.disabled) { b.disabled = true; b.style.opacity = ".55"; b.style.cursor = "not-allowed"; }
    else b.addEventListener("click", onClick);
    return b;
  }
  function popHead(t) { return el("div", "pm-spell-menu-head", E(t)); }

  /* receipts ------------------------------------------------------------ */
  function receiptRow(r) {
    var n = el("div", "co-receipt");
    n.innerHTML = '<span class="co-receipt-t">' + E(r.at) + "</span>" +
      '<span class="co-receipt-b"><strong>' + E(window.PMSim.outcomeWord(r.outcome)) + "</strong> — " +
      E(r.label) + ". " + E(r.detail) + '<span class="co-receipt-call">' + E(r.realCall) + "</span></span>";
    return n;
  }
  function showReceipt(r) {
    announce(window.PMSim.outcomeWord(r.outcome) + ": " + r.detail);
    var host = document.querySelector(".co-receipts");
    if (host) { host.insertBefore(receiptRow(r), host.firstChild); return; }
    var body = document.querySelector(".co-mode-body") || document.querySelector(".co-doc-inner") || document.querySelector(".co-column");
    if (!body) return;
    var row = receiptRow(r);
    body.insertBefore(row, body.firstChild);
    window.setTimeout(function () { if (row.parentNode) row.parentNode.removeChild(row); }, 9000);
  }
  function sim(id, label, call, detail, outcome, phases) {
    if (outcome === "unavailable") {
      window.PMSim.unavailable({ id: id, label: label, realCall: call, detail: detail }).then(showReceipt);
      return;
    }
    window.PMSim.run({
      id: id, label: label, realCall: call,
      phases: phases || [{ label: "Working" }],
      outcome: outcome || "ok", detail: detail
    }).then(showReceipt);
  }

  /* =============================================================== HOME */

  /* A well-formed link that names nothing here is a renamed id or a stale
   * bookmark. Quoting it is more useful than a home screen that pretends the
   * click never happened. */
  function badRouteNotice(hash) {
    var n = el("div", "co-badroute");
    n.setAttribute("role", "status");
    n.innerHTML = I("alert", 14) +
      "<span><strong>That link points at something this concept does not contain.</strong> " +
      "<code>" + E(hash) + "</code> — the id may have been renamed, or it may live in another concept.</span>";
    return n;
  }

  function renderHome() {
    var surface = el("div", "co-surface");
    var home = el("div", "co-home");
    var col = el("div", "co-column");

    var bad = store.get().badRoute;
    if (bad) col.appendChild(badRouteNotice(bad));

    var hero = el("div", "co-hero");
    hero.innerHTML =
      '<div class="co-hero-kicker">Puppet Master · Settings</div>' +
      '<h2 class="co-hero-title">What do you want to change?</h2>' +
      '<p class="co-hero-sub">Type a setting, a provider, a manager or an action. The first answer appears here, ready to change, without leaving this screen.</p>';
    col.appendChild(hero);

    var console_ = el("div", "co-console");
    console_.innerHTML = I("search", 20);
    var input = el("input", "co-console-input");
    input.type = "search";
    input.placeholder = "Ask for a setting…";
    input.setAttribute("aria-label", "Search settings, managers and actions");
    input.value = store.get().query;
    console_.appendChild(input);
    console_.appendChild(el("span", "co-console-key", "Ctrl K"));
    col.appendChild(console_);

    var answerHost = el("div");
    col.appendChild(answerHost);

    var contents = el("div", "co-contents");
    var body = el("div");
    window.PMShell.entrance(body, "co-stagger", 420);
    contents.appendChild(el("div", "co-contents-title", "Contents"));
    D.categories.forEach(function (cat, i) { body.appendChild(entryRow(cat, i + 1)); });
    contents.appendChild(body);
    col.appendChild(contents);

    var notices = noticesBlock();
    col.appendChild(notices);

    function refresh() {
      var q = input.value;
      store.set({ query: q });
      answerHost.innerHTML = "";
      var has = !!q.trim();
      contents.style.display = has ? "none" : "";
      notices.style.display = has ? "none" : "";
      if (!has) return;
      var found = window.PMSearch.search(index, q, { limit: 20 });
      if (!found.length) {
        var none = el("div", "co-answer");
        none.appendChild(el("div", "co-empty",
          "Nothing matches &ldquo;" + E(q) + "&rdquo;. Try &ldquo;spelling&rdquo;, &ldquo;account&rdquo;, &ldquo;worktree&rdquo; or &ldquo;half-life&rdquo;."));
        answerHost.appendChild(none);
        return;
      }
      answerHost.appendChild(answerFor(found[0], found.slice(1)));
    }

    input.addEventListener("input", refresh);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; refresh(); }
      if (e.key === "Enter") {
        var go = answerHost.querySelector("[data-primary]");
        if (go) { e.preventDefault(); go.click(); }
      }
    });

    home.appendChild(col);
    surface.appendChild(home);
    swap(surface);
    if (store.get().query) { input.value = store.get().query; refresh(); }
  }

  function entryRow(cat, n) {
    var counts = S.countSettings(cat);
    var mine = S.noticesFor(D, store.get().demoState, store.get().dismissedNotices).filter(function (x) {
      return x.target && x.target.categoryId === cat.id;
    });
    var worst = mine.reduce(function (a, x) {
      var r = S.severity(x.severity).rank;
      return r < a.rank ? { rank: r, sev: x.severity } : a;
    }, { rank: 9, sev: null });

    var b = el("button", "co-entry");
    b.type = "button";
    b.innerHTML =
      '<span class="co-entry-n">' + pad(n) + "</span>" +
      '<span class="co-entry-body"><span class="co-entry-name">' + E(cat.title) + "</span>" +
      '<span class="co-entry-purpose">' + E(cat.purpose) + "</span></span>" +
      '<span class="co-entry-status">' +
        (worst.sev ? statusChip(S.severity(worst.sev).status, S.severity(worst.sev).word)
                   : counts.changed + " changed · " + counts.total + " settings") + "</span>" +
      '<span class="co-entry-arrow">' + I("arrowRight", 15) + "</span>";
    b.addEventListener("click", function () { goTo({ categoryId: cat.id }); });
    return b;
  }

  /* The answer surface changes shape by what was asked for. */
  function answerFor(rec, rest) {
    var wrap = el("div", "co-answer");
    var head = el("div", "co-answer-head");
    head.innerHTML = "<span>" + E(kindWord(rec.kind)) + "</span><span>" + E(rec.path.slice(0, -1).join("  ›  ")) + "</span>";
    wrap.appendChild(head);

    var body = el("div", "co-answer-body");
    if (rec.kind === "setting") body.appendChild(settingAnswer(rec));
    else if (rec.kind === "manager") body.appendChild(managerAnswer(rec));
    else if (rec.kind === "action") body.appendChild(actionAnswer(rec));
    else body.appendChild(placeAnswer(rec));
    wrap.appendChild(body);

    if (rest.length) {
      var more = el("div", "co-results");
      more.appendChild(el("div", "co-results-head", "Also matching"));
      var list = el("div");
      window.PMShell.entrance(list, "co-stagger", 420);
      rest.forEach(function (r, i) {
        var b = el("button", "co-result");
        b.type = "button";
        b.innerHTML = '<span class="co-result-n">' + pad(i + 2) + "</span>" +
          '<span style="min-width:0"><span class="co-result-t">' + E(r.title) + "</span>" +
          '<span class="co-result-p">' + E(r.path.join("  ›  ")) + "</span></span>" +
          "<span>" + (r.exposure !== "standard" ? chip(r.exposure === "expert" ? "risky" : r.exposure === "unavailable" ? "unavailable" : "", S.exposureLabel(r.exposure)) : "") + "</span>";
        b.addEventListener("click", function () { goTo(window.PMSearch.resolveTarget(r)); });
        list.appendChild(b);
      });
      more.appendChild(list);
      wrap.appendChild(more);
    }
    return wrap;
  }

  function kindWord(k) {
    return k === "setting" ? "Setting" : k === "manager" ? "Manager" : k === "action" ? "Action" :
      k === "model" ? "Model" : k === "provider" ? "Provider" : k === "category" ? "Place" : "Section";
  }

  function settingAnswer(rec) {
    var found = S.findSetting(D, rec.id);
    var box = el("div");
    if (!found) return box;
    var setting = found.setting, state = settingState(setting);

    var title = el("div", "co-answer-title");
    title.innerHTML = E(setting.label) +
      ((setting.exposure || "standard") !== "standard" ? chip(setting.exposure === "expert" ? "risky" :
        setting.exposure === "unavailable" ? "unavailable" :
        setting.exposure === "managed" ? "managed" : "", S.exposureLabel(setting.exposure)) : "");
    box.appendChild(title);
    box.appendChild(el("div", "co-answer-path", E(rec.path.join("  ›  "))));
    box.appendChild(el("p", "co-answer-explain", E(setting.explanation)));

    if (S.needsGuard(setting) && !store.get().revealed[setting.id]) {
      var guard = el("div", "co-guard-line");
      guard.innerHTML = "<span>" + (setting.exposure === "unavailable"
        ? "Not available on this device." : "This one can break things quietly. It is hidden until you ask for it.") + "</span>";
      var rv = el("button", "co-link", setting.exposure === "unavailable" ? "Why?" : "Show the control");
      rv.type = "button";
      rv.addEventListener("click", function () {
        var r = store.get().revealed; r[setting.id] = true; store.set({ revealed: r });
        var host = box.parentNode;
        host.replaceChild(settingAnswer(rec), box);
      });
      guard.appendChild(rv);
      box.appendChild(guard);
      if (state.reason) box.appendChild(metaLine(state, setting));
      return box;
    }

    var ctrl = el("div", "co-answer-control");
    ctrl.appendChild(controlFor(setting, state, function () {
      var host = box.parentNode;
      host.replaceChild(settingAnswer(rec), box);
    }));
    var st = el("span", "co-answer-state");
    st.innerHTML = stateText(setting, state);
    ctrl.appendChild(st);
    if (state.isDefault === false && S.isEditable(setting)) {
      var reset = el("button", "co-link is-quiet", I("undo", 12) + "<span>Reset to default</span>");
      reset.type = "button";
      reset.addEventListener("click", function () {
        var v = store.get().values; delete v[setting.id]; store.set({ values: v });
        var host = box.parentNode;
        host.replaceChild(settingAnswer(rec), box);
        announce(setting.label + " reset to default.");
      });
      ctrl.appendChild(reset);
    }
    box.appendChild(ctrl);
    box.appendChild(metaLine(state, setting));

    var acts = el("div", "co-answer-actions");
    var open = el("button", "co-btn");
    open.type = "button";
    open.setAttribute("data-primary", "1");
    open.innerHTML = "<span>Open in " + E(found.category.title) + "</span>" + I("arrowRight", 13);
    open.addEventListener("click", function () {
      goTo({ categoryId: found.category.id, subcategoryId: found.subcategory.id, targetId: setting.id });
    });
    acts.appendChild(open);
    box.appendChild(acts);
    return box;
  }

  function metaLine(state, setting) {
    var meta = el("div", "co-row-meta");
    if (state.effect) meta.innerHTML += '<span class="co-warn">' + I("info", 12) + "<span>" +
      E(S.effectWord(state.effect.kind)) + ": " + E(state.effect.text) + "</span></span>";
    if (S.hasDifference(state)) meta.innerHTML += '<span class="co-warn">' + I("alert", 12) + "<span>" +
      E(S.differenceText(state)) + "</span></span>";
    if (state.reason) meta.innerHTML += '<span class="co-block">' + I(state.source === "managed" ? "lock" : "ban", 12) +
      "<span>" + E(state.reason) + "</span></span>";
    if (state.scope && state.scope !== "global") meta.innerHTML += "<span>" + I("layers", 12) +
      "<span>Applies to: " + E(S.scopeLabel(state.scope)) + "</span></span>";
    return meta;
  }

  function stateText(setting, state) {
    var label = S.stateLabel(state), status = S.stateStatus(state);
    if (status !== "ok") return statusChip(status, label);
    if (state.source === "recommended") return statusChip("recommended", "Recommended value");
    var d = S.defaultDisplay(setting);
    return E(label) + (state.isDefault === false && d ? " · default was " + E(d) : "");
  }

  function managerAnswer(rec) {
    var box = el("div");
    var mgr = D.managers[rec.managerId] || {};
    box.appendChild(el("div", "co-answer-title", E(mgr.title || rec.title)));
    box.appendChild(el("div", "co-answer-path", E(rec.path.join("  ›  "))));
    box.appendChild(el("p", "co-answer-explain", E(mgr.purpose || rec.subtitle)));

    var stats = el("div", "co-preview-stats");
    previewStats(rec.managerId).forEach(function (s) {
      var d = el("div");
      d.innerHTML = '<div class="co-stat-n">' + E(s.n) + '</div><div class="co-stat-l">' + E(s.l) + "</div>";
      stats.appendChild(d);
    });
    box.appendChild(stats);

    var acts = el("div", "co-answer-actions");
    var open = el("button", "co-btn is-primary");
    open.type = "button";
    open.setAttribute("data-primary", "1");
    open.innerHTML = "<span>Open the manager</span>" + I("arrowRight", 13);
    open.addEventListener("click", function () { goTo({ managerId: rec.managerId, kind: "manager", categoryId: rec.categoryId }); });
    acts.appendChild(open);
    box.appendChild(acts);
    return box;
  }

  function previewStats(managerId) {
    if (managerId === "manager-providers") return [
      { n: String(D.providers.length), l: "provider families" },
      { n: String(D.providers.reduce(function (a, p) { return a + p.accounts.length; }, 0)), l: "accounts and connections" },
      { n: String(D.providers.reduce(function (a, p) { return a + p.models.length; }, 0)), l: "models" },
      { n: "2", l: "need attention" }
    ];
    if (managerId === "manager-personas") return [
      { n: String(D.managers["manager-personas"].personas.length), l: "personas" },
      { n: "7", l: "core roles" },
      { n: "1", l: "child-only" },
      { n: "1", l: "draft" }
    ];
    if (managerId === "manager-skills") return [
      { n: String(D.managers["manager-skills"].skills.length), l: "skills" },
      { n: String(D.managers["manager-skills"].plugins.length), l: "plugins" },
      { n: "64", l: "tools installed" },
      { n: "2", l: "updates" }
    ];
    if (managerId === "manager-memory") return [{ n: "142", l: "notes" }, { n: "7", l: "awaiting review" }];
    if (managerId === "manager-mcp") return [{ n: "6", l: "servers" }, { n: "1", l: "disconnected" }];
    if (managerId === "manager-crew") return [{ n: "5", l: "templates" }, { n: "1", l: "over capacity" }];
    if (managerId === "manager-media") return [{ n: "4", l: "providers" }, { n: "1", l: "unconfigured" }];
    return [{ n: "—", l: "manager" }];
  }

  function actionAnswer(rec) {
    var box = el("div");
    box.appendChild(el("div", "co-answer-title", E(rec.title)));
    box.appendChild(el("div", "co-answer-path", E(rec.path.join("  ›  "))));
    box.appendChild(el("p", "co-answer-explain", E(rec.subtitle)));
    var acts = el("div", "co-answer-actions");
    var run = el("button", "co-btn is-primary", "<span>Run it</span>");
    run.type = "button";
    run.setAttribute("data-primary", "1");
    run.addEventListener("click", function () {
      sim(rec.id, rec.title, "CommandService.run('" + rec.id + "')",
        "A real build performs this and reports the result here. Nothing was changed by the concept.", "handoff");
    });
    acts.appendChild(run);
    if (rec.categoryId) {
      var open = el("button", "co-btn", "<span>Show where it lives</span>");
      open.type = "button";
      open.addEventListener("click", function () {
        goTo({ categoryId: rec.categoryId, subcategoryId: rec.subcategoryId });
      });
      acts.appendChild(open);
    }
    box.appendChild(acts);
    return box;
  }

  function placeAnswer(rec) {
    var box = el("div");
    box.appendChild(el("div", "co-answer-title", E(rec.title)));
    box.appendChild(el("div", "co-answer-path", E(rec.path.join("  ›  "))));
    box.appendChild(el("p", "co-answer-explain", E(rec.subtitle || "")));
    var acts = el("div", "co-answer-actions");
    var open = el("button", "co-btn is-primary");
    open.type = "button";
    open.setAttribute("data-primary", "1");
    open.innerHTML = "<span>Go there</span>" + I("arrowRight", 13);
    open.addEventListener("click", function () { goTo(window.PMSearch.resolveTarget(rec)); });
    acts.appendChild(open);
    box.appendChild(acts);
    return box;
  }

  function noticesBlock() {
    var wrap = el("div", "co-notices");
    var list = S.noticesFor(D, store.get().demoState, store.get().dismissedNotices);
    if (!list.length) {
      var calm = el("div", "co-calm");
      calm.innerHTML = "<strong>Nothing needs attention.</strong>Every provider is connected, no setup is unfinished, and there are no open recommendations.";
      wrap.appendChild(calm);
      return wrap;
    }
    wrap.appendChild(el("div", "co-contents-title", "Worth a look"));
    var body = el("div");
    window.PMShell.entrance(body, "co-stagger", 420);
    list.forEach(function (n) {
      var meta = S.severity(n.severity);
      var line = el("article", "co-notice");
      line.setAttribute("data-severity", n.severity);
      line.innerHTML =
        '<div class="co-notice-word">' + I(window.PMIcons.statusIcon(meta.status), 12) + "<span>" + E(n.statusWord) + "</span></div>" +
        '<div class="co-notice-headline">' + E(n.headline) + "</div>" +
        '<div class="co-notice-consequence">' + E(n.consequence) + "</div>";
      var acts = el("div", "co-notice-actions");
      var p = el("button", "co-link", "<span>" + E(n.primary.label) + "</span>" + I("arrowRight", 13));
      p.type = "button";
      p.addEventListener("click", function () { noticeAction(n, n.primary); });
      acts.appendChild(p);
      if (n.secondary) {
        var s2 = el("button", "co-link is-quiet", E(n.secondary.label));
        s2.type = "button";
        s2.addEventListener("click", function () { noticeAction(n, n.secondary); });
        acts.appendChild(s2);
      }
      line.appendChild(acts);
      body.appendChild(line);
    });
    wrap.appendChild(body);
    return wrap;
  }

  /* Dismissal genuinely removes the notice for the rest of the session and says
   * how many are left. Changing the demo state brings the fixture back. */
  function dismissNotice(notice) {
    var d = store.get().dismissedNotices;
    d[notice.id] = true;
    store.set({ dismissedNotices: d });
    renderHome();
    var left = S.noticesFor(D, store.get().demoState, d).length;
    announce("Dismissed. " + (left ? left + " still open." : "Nothing needs attention now."));
  }

  function noticeAction(n, a) {
    if (a.action === "dismiss") { dismissNotice(n); return; }
    if (a.action === "refresh-catalogue") { goTo({ managerId: "manager-providers", kind: "manager", categoryId: "agents" }); return; }
    if (a.action === "reconnect-mcp") {
      sim("reconnect-mcp", "Reconnect the postgres MCP server", "MCPService.reconnect('mcp-postgres')",
        "Still refused: the database container is not running.", "error");
      return;
    }
    if (a.action === "prune-snapshots") {
      sim("prune", "Prune old restore points", "SnapshotService.prune(retentionDays: 30)",
        "Would remove 14 restore points and free 6.2 GB.", "ok");
      return;
    }
    if (n.target) goTo({ categoryId: n.target.categoryId, subcategoryId: n.target.subcategoryId, targetId: n.target.settingId });
  }

  /* ========================================================== WORKSPACE */

  function ensureVisible(targetId) {
    if (!targetId) return;
    var f = S.findSetting(D, targetId);
    if (!f) return;
    var ex = f.setting.exposure || "standard";
    if ((LEVEL_VISIBLE[store.get().exposure] || []).indexOf(ex) >= 0) return;
    store.set({ exposure: LEVEL_VISIBLE.advanced.indexOf(ex) >= 0 ? "advanced" : "all" });
  }

  function renderWorkspace(opts) {
    if (opts && opts.targetId) ensureVisible(opts.targetId);
    var cat = S.findCategory(D, store.get().categoryId);
    if (!cat) { renderHome(); return; }
    var catIndex = D.categories.indexOf(cat) + 1;

    var surface = el("div", "co-surface");
    var ws = el("div", "co-ws");

    ws.appendChild(buildDock(cat, catIndex));

    var body = el("div", "co-body");
    docEl = el("div", "co-doc");
    docEl.setAttribute("tabindex", "-1");
    var inner = el("div", "co-doc-inner");
    buildDoc(inner, cat, catIndex);
    docEl.appendChild(inner);
    body.appendChild(docEl);
    body.appendChild(buildIndex(cat));
    ws.appendChild(body);

    surface.appendChild(ws);
    swap(surface);
    attachSpy(cat);

    if (opts && opts.subcategoryId) {
      window.PMSections.afterLayout(function () {
        var focusEl = opts.targetId ? docEl.querySelector('[data-setting="' + opts.targetId + '"]') : null;
        spy.jump(opts.subcategoryId, { focusEl: focusEl });
      });
    }
  }

  function buildDock(cat, n) {
    var dock = el("div", "co-dock");

    var place = el("button", "co-place");
    place.type = "button";
    place.setAttribute("aria-label", "Change place");
    place.innerHTML = '<span class="co-place-n">' + pad(n) + '</span><span class="co-place-name">' + E(cat.title) + "</span>" + I("chevronDown", 12);
    place.addEventListener("click", function () {
      openPop(place, function (p, close) {
        p.appendChild(popHead("Contents"));
        D.categories.forEach(function (c, i) {
          p.appendChild(popItem(pad(i + 1) + "  " + c.title, function () {
            close();
            goTo({ categoryId: c.id });
          }, { strong: c.id === cat.id }));
        });
        p.appendChild(el("div", "pm-spell-divider"));
        p.appendChild(popItem("Back to the console", function () { close(); goTo({}); }));
      });
    });
    dock.appendChild(place);

    dock.appendChild(el("span", null, I("search", 15)));
    var input = el("input", "co-console-input");
    input.type = "search";
    input.placeholder = "Ask for a setting…";
    input.setAttribute("aria-label", "Search settings, managers and actions");
    dock.appendChild(input);

    var level = el("button", "co-place");
    level.type = "button";
    level.innerHTML = "<span>" + E(levelWord()) + "</span>" + I("chevronDown", 12);
    level.addEventListener("click", function () {
      openPop(level, function (p, close) {
        p.appendChild(popHead("How much to show"));
        [["standard", "Standard"], ["advanced", "Advanced"], ["all", "Everything"]].forEach(function (o) {
          p.appendChild(popItem(o[1], function () {
            close();
            var keep = spy ? spy.activeId() : null;
            store.set({ exposure: o[0] });
            renderWorkspace({});
            if (keep) window.setTimeout(function () { spy.jump(keep); }, 90);
            announce("Showing " + o[1].toLowerCase() + " settings.");
          }, { strong: store.get().exposure === o[0] }));
        });
      });
    });
    dock.appendChild(level);

    var results = el("div", "co-dock-results");
    results.style.display = "none";
    dock.appendChild(results);

    input.addEventListener("input", function () {
      var q = input.value.trim();
      results.innerHTML = "";
      if (!q) { results.style.display = "none"; return; }
      var found = window.PMSearch.search(index, q, { limit: 16 });
      if (!found.length) results.appendChild(el("div", "co-empty", "No match."));
      else {
        var list = el("div");
        window.PMShell.entrance(list, "co-stagger", 420);
        found.forEach(function (r, i) {
          var b = el("button", "co-result");
          b.type = "button";
          b.innerHTML = '<span class="co-result-n">' + pad(i + 1) + "</span>" +
            '<span style="min-width:0"><span class="co-result-t">' + E(r.title) + "</span>" +
            '<span class="co-result-p">' + E(r.path.join("  ›  ")) + "</span></span>" +
            "<span>" + (r.exposure !== "standard" ? chip(r.exposure === "expert" ? "risky" : "", S.exposureLabel(r.exposure)) : "") + "</span>";
          b.addEventListener("click", function () {
            input.value = ""; results.style.display = "none";
            goTo(window.PMSearch.resolveTarget(r));
          });
          list.appendChild(b);
        });
        results.appendChild(list);
      }
      results.style.display = "";
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; results.style.display = "none"; }
      if (e.key === "Enter") { var f = results.querySelector(".co-result"); if (f) { e.preventDefault(); f.click(); } }
    });

    return dock;
  }

  function levelWord() {
    var e2 = store.get().exposure;
    return e2 === "all" ? "Everything" : e2 === "advanced" ? "Advanced" : "Standard";
  }

  function visible(sub) {
    var allowed = LEVEL_VISIBLE[store.get().exposure] || LEVEL_VISIBLE.standard;
    return sub.settings.filter(function (s) { return allowed.indexOf(s.exposure || "standard") >= 0; });
  }

  function buildDoc(host, cat, n) {
    host.innerHTML = "";
    var head = el("div", "co-cat-head");
    head.innerHTML = '<div class="co-cat-n">' + pad(n) + " / " + pad(D.categories.length) + "</div>" +
      '<h2 class="co-cat-title">' + E(cat.title) + "</h2>" +
      '<p class="co-cat-purpose">' + E(cat.purpose) + "</p>";
    host.appendChild(head);

    cat.subcategories.forEach(function (sub, si) {
      var sec = el("section", "co-section");
      sec.setAttribute("data-section", sub.id);
      var sh = el("div", "co-section-head");
      sh.innerHTML = '<h3 class="co-section-title">' + E(sub.title) + "</h3>" +
        (sub.summary ? '<p class="co-section-summary">' + E(sub.summary) + "</p>" : "");
      sec.appendChild(sh);
      var shown = visible(sub);
      shown.forEach(function (s) { sec.appendChild(row(s, cat, sub)); });
      var hidden = sub.settings.length - shown.length;
      if (hidden > 0) {
        var more = el("button", "co-link is-quiet", "<span>Show " + hidden + " more</span>" + I("chevronDown", 12));
        more.type = "button";
        more.style.marginTop = "10px";
        more.addEventListener("click", function () {
          var keep = sub.id;
          store.set({ exposure: "all" });
          renderWorkspace({});
          window.setTimeout(function () { spy.jump(keep); }, 90);
        });
        sec.appendChild(more);
      }
      host.appendChild(sec);
    });
  }

  function row(setting, cat, sub) {
    var state = settingState(setting);
    var r = el("div", "co-row");
    r.setAttribute("data-setting", setting.id);
    r.setAttribute("tabindex", "-1");
    var guarded = S.needsGuard(setting) && !store.get().revealed[setting.id];
    if (guarded) r.setAttribute("data-guard", "true");

    var top = el("div", "co-row-top");
    var label = el("div", "co-row-label");
    label.innerHTML = E(setting.label) +
      ((setting.exposure || "standard") !== "standard" ? chip(setting.exposure === "expert" ? "risky" :
        setting.exposure === "unavailable" ? "unavailable" :
        setting.exposure === "managed" ? "managed" : "", S.exposureLabel(setting.exposure)) : "");
    top.appendChild(label);

    var val = el("div", "co-row-value");
    if (!guarded) {
      val.appendChild(controlFor(setting, state, function () { replace(setting, cat, sub); }));
      var st = el("span", "co-answer-state");
      st.innerHTML = stateText(setting, state);
      val.appendChild(st);
    }
    top.appendChild(val);
    r.appendChild(top);
    r.appendChild(el("p", "co-row-explain", E(setting.explanation)));

    if (guarded) {
      var g = el("div", "co-guard-line");
      g.innerHTML = "<span>" + (setting.exposure === "unavailable"
        ? "Not available on this device." : "Hidden until you ask: this one can break things quietly.") + "</span>";
      var rv = el("button", "co-link", setting.exposure === "unavailable" ? "Why?" : "Show the control");
      rv.type = "button";
      rv.addEventListener("click", function () {
        var x = store.get().revealed; x[setting.id] = true; store.set({ revealed: x });
        replace(setting, cat, sub);
      });
      g.appendChild(rv);
      r.appendChild(g);
    }

    r.appendChild(metaLine(state, setting));

    if (!guarded && state.isDefault === false && S.isEditable(setting)) {
      var reset = el("button", "co-link is-quiet", I("undo", 12) + "<span>Reset to default</span>");
      reset.type = "button";
      reset.style.marginTop = "6px";
      reset.addEventListener("click", function () {
        var v = store.get().values; delete v[setting.id]; store.set({ values: v });
        replace(setting, cat, sub);
        announce(setting.label + " reset to default.");
      });
      r.appendChild(reset);
    }
    return r;
  }

  function replace(setting, cat, sub) {
    var old = docEl && docEl.querySelector('[data-setting="' + setting.id + '"]');
    if (!old) return;
    old.parentNode.replaceChild(row(setting, cat, sub), old);
    if (spy) spy.measure();
  }

  function controlFor(setting, state, onChange) {
    var editable = S.isEditable(setting);
    if (setting.kind === "manager") {
      var b = el("button", "co-btn", "<span>Open</span>" + I("arrowRight", 13));
      b.type = "button";
      b.addEventListener("click", function () { goTo({ managerId: setting.managerId, kind: "manager", categoryId: store.get().categoryId }); });
      return b;
    }
    if (setting.kind === "action") {
      var ab = el("button", "co-btn" + (setting.exposure === "expert" ? " is-quiet" : ""), "<span>Run</span>");
      ab.type = "button";
      ab.addEventListener("click", function () { runAction(setting); });
      return ab;
    }
    if (setting.kind === "toggle") {
      var on = state.value === true;
      var t = el("button", "co-toggle", on ? "On" : "Off");
      t.type = "button";
      t.setAttribute("aria-pressed", String(on));
      t.setAttribute("aria-label", setting.label);
      if (!editable) t.setAttribute("aria-disabled", "true");
      t.addEventListener("click", function () {
        if (!editable) { announce(setting.label + " is " + S.stateLabel(state).toLowerCase() + "."); return; }
        setValue(setting, !on); onChange();
      });
      return t;
    }
    if (setting.kind === "select") {
      var sel = el("select", "co-select");
      sel.setAttribute("aria-label", setting.label);
      (setting.options || []).forEach(function (o) {
        var op = document.createElement("option");
        op.value = o; op.textContent = o;
        if (o === state.value) op.selected = true;
        sel.appendChild(op);
      });
      sel.disabled = !editable;
      sel.addEventListener("change", function () { setValue(setting, sel.value); onChange(); });
      return sel;
    }
    var s2 = el("span", "co-static", E(S.valueDisplay(setting)));
    s2.title = S.valueDisplay(setting);
    return s2;
  }

  function setValue(setting, value) {
    var v = store.get().values;
    var isDefault = setting.state.defaultValue !== undefined && String(setting.state.defaultValue) === String(value);
    v[setting.id] = { value: value, isDefault: isDefault, source: isDefault ? "default" : "custom" };
    store.set({ values: v });
    announce(setting.label + " set to " + (typeof value === "boolean" ? (value ? "on" : "off") : value) + ".");
  }

  function runAction(setting) {
    var risky = setting.exposure === "expert";
    sim(setting.id, setting.label, "SettingsService.run('" + setting.id + "')",
      risky ? "Refused in a concept: this is irreversible and would discard real state."
            : "A real build performs this and reports the result. Nothing changed here.",
      risky ? "unavailable" : "handoff");
  }

  /* ------------------------------------------------ margin index + marker */

  function buildIndex(cat) {
    var wrap = el("nav", "co-index");
    wrap.setAttribute("aria-label", "On this page");
    wrap.appendChild(el("div", "co-index-title", "On this page"));
    var list = el("div", "co-index-list");
    list.appendChild(el("div", "co-index-rail"));
    markerEl = el("div", "co-index-marker");
    list.appendChild(markerEl);
    cat.subcategories.forEach(function (sub) {
      var b = el("button", "co-index-item", E(sub.title));
      b.type = "button";
      b.setAttribute("data-sub", sub.id);
      b.addEventListener("click", function () { spy.jump(sub.id); announce("Jumped to " + sub.title + "."); });
      list.appendChild(b);
    });
    wrap.appendChild(list);
    indexEl = wrap;

    var narrow = el("details", "co-index-narrow");
    var sum = el("summary", null, "On this page · " + cat.subcategories.length + " sections");
    narrow.appendChild(sum);
    cat.subcategories.forEach(function (sub) {
      var b = el("button", "co-index-item", E(sub.title));
      b.type = "button";
      b.setAttribute("data-sub", sub.id);
      b.addEventListener("click", function () { spy.jump(sub.id); narrow.open = false; });
      narrow.appendChild(b);
    });
    var inner = docEl.querySelector(".co-doc-inner");
    if (inner) inner.insertBefore(narrow, inner.children[1] || null);

    return wrap;
  }

  function attachSpy(cat) {
    if (spy) spy.destroy();
    spy = window.PMSections.create({
      scroller: docEl,
      anchorInset: 110,
      hysteresis: 0.12,
      onActive: function (id) { markActive(id); },
      onScroll: function (info) { travelMarker(info); }
    });
    var sections = [];
    cat.subcategories.forEach(function (sub) {
      var node = docEl.querySelector('[data-section="' + sub.id + '"]');
      if (node) sections.push({ id: sub.id, categoryId: cat.id, title: sub.title, el: node });
    });
    spy.setSections(sections);
  }

  function markActive(id) {
    document.querySelectorAll(".co-index-item").forEach(function (b) {
      b.setAttribute("aria-current", String(b.getAttribute("data-sub") === id));
    });
  }

  /* The marker moves continuously with scroll progress inside the active
   * section, so it reads as travelling rather than snapping. */
  function travelMarker(info) {
    if (!markerEl || !indexEl) return;
    var items = indexEl.querySelectorAll(".co-index-item");
    if (!items.length) return;
    var secs = info.sections;
    var probe = info.scrollTop + 110;

    var i = 0;
    for (var k = 0; k < secs.length; k++) { if (probe >= secs[k].offset) i = k; else break; }
    if (info.atBottom) i = secs.length - 1;

    var span = Math.max(1, secs[i].height);
    var p = Math.min(1, Math.max(0, (probe - secs[i].offset) / span));

    var listTop = indexEl.querySelector(".co-index-list").getBoundingClientRect().top;
    var a = items[i].getBoundingClientRect();
    var next = items[i + 1] ? items[i + 1].getBoundingClientRect() : null;
    var from = a.top - listTop;
    var to = next ? next.top - listTop : from;
    markerEl.style.height = Math.round(a.height - 6) + "px";
    markerEl.style.transform = "translateY(" + Math.round(from + (to - from) * p + 3) + "px)";
  }

  /* =============================================================== MODES */

  function renderMode(modeId) {
    var mgr = D.managers[modeId] || {};
    var surface = el("div", "co-surface");
    var mode = el("div", "co-mode");

    var cat = S.findCategory(D, store.get().categoryId) || S.findCategory(D, "agents");
    mode.appendChild(buildDock(cat, D.categories.indexOf(cat) + 1));

    var head = el("div", "co-mode-head");
    var titles = el("div", "co-mode-titles");
    titles.innerHTML = '<div class="co-mode-kicker">Manager</div>' +
      '<h2 class="co-mode-title">' + E(mgr.title || "Manager") + "</h2>" +
      '<p class="co-mode-purpose">' + E(mgr.purpose || "") + "</p>";
    head.appendChild(titles);
    var tools = el("div", "co-mode-tools");
    var back = el("button", "co-btn is-quiet", I("chevronLeft", 13) + "<span>Back to " + E(cat.title) + "</span>");
    back.type = "button";
    back.addEventListener("click", function () { goTo({ categoryId: cat.id }); });
    tools.appendChild(back);
    head.appendChild(tools);
    mode.appendChild(head);

    var body = el("div", "co-mode-body");
    mode.appendChild(body);
    surface.appendChild(mode);
    swap(surface);

    if (modeId === "manager-providers") {
      providerMode(body, tools);
      hydrated();
    } else if (BUILT_HERE.indexOf(modeId) < 0) {
      /* All four domain modules load on every page so cross-concept links can
       * resolve titles; rendering an unassigned family in full would undo the
       * split the four concepts exist to demonstrate. */
      if (K.has(modeId)) elsewhereMode(body, modeId);
      else missingMode(body, modeId);
    } else {
      renderManager(K.spec(modeId, store.get()), { conceptId: CONCEPT_ID, managerId: modeId }, body, tools);
    }

    var receipts = el("div", "co-receipts");
    receipts.setAttribute("aria-label", "Simulated results");
    receipts.style.marginTop = "20px";
    body.appendChild(receipts);
    window.PMSim.receipts().slice(0, 4).forEach(function (r) { receipts.appendChild(receiptRow(r)); });
  }

  /* ----------------------------------------------------------- providers */

  function providerMode(body, tools) {
    var refresh = el("button", "co-btn", I("refresh", 13) + "<span>Refresh catalogues</span>");
    refresh.type = "button";
    refresh.addEventListener("click", doRefresh);
    tools.insertBefore(refresh, tools.firstChild);

    var f = el("div", "co-filter");
    f.innerHTML = I("search", 14);
    var fi = el("input");
    fi.type = "search";
    fi.placeholder = "Filter providers, accounts and models";
    fi.setAttribute("aria-label", "Filter providers, accounts and models");
    f.appendChild(fi);
    body.appendChild(f);

    var host = el("div");
    body.appendChild(host);

    function paint() {
      host.innerHTML = "";
      if (store.get().catalogueRefreshing) {
        var b = el("div", "co-banner");
        b.innerHTML = '<span class="co-spin">' + I("refresh", 14) + "</span><span>Refreshing. Rows below are the last catalogue that activated cleanly, an hour ago.</span>";
        host.appendChild(b);
      }
      var q = fi.value.trim().toLowerCase();
      var n = 0, any = false;
      D.providers.forEach(function (p) {
        if (q) {
          var hay = (p.name + " " + p.summary + " " + (p.keywords || []).join(" ") + " " +
            p.models.map(function (m) { return m.name; }).join(" ")).toLowerCase();
          if (hay.indexOf(q) < 0) return;
        }
        any = true;
        host.appendChild(provRow(p, ++n, paint));
      });
      if (!any) host.appendChild(el("div", "co-empty", "Nothing matches that filter."));
    }
    fi.addEventListener("input", paint);
    paint();
    body._repaint = paint;
  }

  function provRow(p, n, repaint) {
    var open = !!store.get().openProviders[p.id];
    var wrap = el("div", "co-prov");
    var head = el("button", "co-prov-head");
    head.type = "button";
    head.setAttribute("aria-expanded", String(open));
    head.innerHTML = '<span class="co-prov-n">' + pad(n) + "</span>" +
      '<span style="min-width:0"><span class="co-prov-name">' + E(p.name) + "</span>" +
      '<span class="co-prov-sum">' + E(p.summary) + "</span></span>" +
      '<span class="co-prov-status">' + statusChip(p.status, p.statusWord) + "</span>" +
      "<span>" + I(open ? "chevronDown" : "chevronRight", 14) + "</span>";
    head.addEventListener("click", function () {
      var o = store.get().openProviders; o[p.id] = !o[p.id];
      store.set({ openProviders: o }); repaint();
    });
    wrap.appendChild(head);
    if (!open) return wrap;

    var bodyEl = el("div", "co-prov-body");
    var active = activeAccount(p);

    var answers = el("div", "co-answers");
    [["Connected and usable?", p.statusWord, p.status === "ok" ? "Discovery and a generation check both passed." : "Authenticated is not the same as ready."],
     ["Account in use now", active ? active.nickname : "None", active ? active.identity : "Nothing signed in."],
     ["Plan or billing", active ? active.product : "—", p.credentialOwner ? "Credentials owned by " + p.credentialOwner : ""],
     ["Allowance left", active ? active.usage.includedRemaining : "Unknown", active ? active.usage.note : ""],
     ["Resets", active ? active.usage.resetsIn : "Unknown", ""],
     ["Models", String(p.models.length), p.models.filter(function (m) { return m.available === false; }).length + " unusable now"]
    ].forEach(function (a) {
      var d = el("div");
      d.innerHTML = '<div class="co-a-q">' + E(a[0]) + '</div><div class="co-a-a">' + E(a[1]) + "</div>" +
        (a[2] ? '<div class="co-a-n">' + E(a[2]) + "</div>" : "");
      answers.appendChild(d);
    });
    bodyEl.appendChild(answers);

    var usageLink = el("button", "co-btn", "<span>Open Usage</span>" + I("external", 13));
    usageLink.type = "button";
    usageLink.style.marginTop = "10px";
    usageLink.addEventListener("click", function () {
      sim("open-usage-" + p.id, "Open Usage", "Navigation.open('usage')",
        "Settings does not calculate balances. A real build switches to the Usage surface, which owns measurement, history and forecasting.",
        "handoff");
    });
    bodyEl.appendChild(usageLink);

    if (p.oauthNote) bodyEl.appendChild(el("div", "co-row-meta", "<span>" + I("key", 12) + "<span>" + E(p.oauthNote) + "</span></span>"));
    if (p.groupingNote) bodyEl.appendChild(el("div", "co-row-meta", "<span>" + I("info", 12) + "<span>" + E(p.groupingNote) + "</span></span>"));

    if (p.setupSteps) {
      var setup = el("div", "co-block");
      setup.appendChild(el("div", "co-block-title", "Setup"));
      p.setupSteps.forEach(function (s2, i) {
        setup.appendChild(el("div", "co-acct-line", (i + 1) + ". " + E(s2.label) + " — not done"));
      });
      var go = el("button", "co-btn is-primary", "<span>Continue setup</span>");
      go.type = "button";
      go.style.marginTop = "10px";
      go.addEventListener("click", function () {
        sim("install-" + p.id, "Install " + p.name + " CLI", "CLIBridge.install('" + p.id + "')",
          "A real build installs the CLI, creates an isolated profile directory, then launches the CLI's own Google sign-in.",
          "handoff", [{ label: "Checking platform" }, { label: "Downloading" }]);
      });
      setup.appendChild(go);
      bodyEl.appendChild(setup);
    }

    if (p.catalogue) {
      var c = p.catalogue;
      var cb = el("div", "co-block");
      cb.appendChild(el("div", "co-block-title", "Catalogue"));
      var kv = el("dl", "co-kv");
      kv.innerHTML = "<dt>Source</dt><dd>" + E(c.name) + "</dd>" +
        "<dt>Last checked</dt><dd>" + E(store.get().catalogueRefreshing ? "refreshing now" : c.lastChecked) + "</dd>" +
        "<dt>Last activated</dt><dd>" + E(c.lastActivated) + "</dd>" +
        "<dt>Version</dt><dd>" + E(c.sourceVersion) + "</dd>" +
        "<dt>While refreshing</dt><dd>" + E(c.lastKnownGood) + "</dd>" +
        "<dt>Recent changes</dt><dd>" + c.materialChanges.map(E).join("<br>") + "</dd>";
      cb.appendChild(kv);
      bodyEl.appendChild(cb);
    }

    p.accounts.forEach(function (a) {
      var row2 = el("div", "co-acct");
      var health = S.healthMeta(a.health.check);
      var left = el("div");
      left.innerHTML = '<div class="co-acct-name">' + E(a.nickname) + statusChip(health.status, a.statusWord) +
        (active && a.id === active.id ? chip("", "Used next") : "") + "</div>" +
        '<div class="co-acct-line">' + E(a.identity) + " · " + E(a.connection) + " · " + E(a.product) + "</div>" +
        '<div class="co-acct-line">Catalogue ' + E(a.health.catalogue) + " · last generation " + E(a.health.generation) +
        " · allowance " + E(a.usage.includedRemaining) + " · resets " + E(a.usage.resetsIn) + "</div>" +
        (a.diagnosis ? '<div class="co-acct-line" style="color:var(--pm-attention)">' + E(a.diagnosis) + "</div>" : "") +
        (a.setupInstructions ? '<div class="co-acct-line"><strong>To connect:</strong> ' +
          a.setupInstructions.map(E).join(" ") + "</div>" : "");
      row2.appendChild(left);

      var acts = el("div", "co-acct-acts");
      if (a.status === "connected") {
        var use = el("button", "co-btn", "<span>Use next</span>");
        use.type = "button";
        use.disabled = !!(active && a.id === active.id);
        use.addEventListener("click", function () {
          var pref = store.get().accountPref; pref[p.id] = a.id; store.set({ accountPref: pref });
          repaint();
          showReceipt({ at: window.PMSim.stamp(), label: "Prefer account " + a.nickname,
            realCall: "ProviderService.setPreferredAccount('" + p.id + "','" + a.id + "')", outcome: "ok",
            detail: "Applies to the next request only. A generation already in flight stays on its original account." });
        });
        acts.appendChild(use);
      }
      if (a.health.check === "signedOut") {
        var si = el("button", "co-btn is-primary", "<span>Sign in</span>");
        si.type = "button";
        si.addEventListener("click", function () {
          sim("signin-" + a.id, "Sign in · " + p.name + " " + a.nickname,
            "CLIBridge.launchOwnLogin('" + p.id + "','" + a.id + "')",
            "The Claude CLI owns this login. A real build launches that flow inside the isolated profile, then verifies identity and readiness.",
            "handoff", [{ label: "Selecting profile" }, { label: "Launching the CLI login" }]);
        });
        acts.appendChild(si);
      }
      if (a.setupInstructions) {
        var su = el("button", "co-btn is-primary", "<span>Open the Groq connection</span>");
        su.type = "button";
        su.addEventListener("click", function () {
          sim("setup-" + a.id, "Set up " + a.nickname, "ProviderService.openConnection('groq')",
            "Free Models delegates setup to the underlying provider, then returns you to the model row you started from.", "handoff");
        });
        acts.appendChild(su);
      }
      var more = el("button", "co-btn is-quiet", I("more", 14));
      more.type = "button";
      more.setAttribute("aria-label", "More actions for " + a.nickname);
      more.addEventListener("click", function () {
        openPop(more, function (pp, close) {
          pp.appendChild(popHead(a.nickname));
          pp.appendChild(popItem("Refresh the catalogue", function () {
            close(); sim("r-" + a.id, "Refresh catalogue · " + a.nickname,
              "ProviderService.refreshCatalogue('" + p.id + "','" + a.id + "')",
              "Catalogue re-read. Last-known-good rows stayed visible.", "ok");
          }));
          pp.appendChild(popItem("Run a readiness check", function () {
            close(); sim("p-" + a.id, "Readiness check · " + a.nickname,
              "ProviderService.safeProbe('" + p.id + "','" + a.id + "')",
              a.health.check === "ok" ? "A minimal generation succeeded: ready, not merely authenticated."
                : "Authentication passed but a minimal generation did not.",
              a.health.check === "ok" ? "ok" : "degraded");
          }));
          pp.appendChild(popItem("Open logs", function () {
            close(); sim("l-" + a.id, "Open logs", "LogService.open('provider/" + p.id + "')",
              "A real build opens the provider log view.", "unavailable");
          }));
          if (a.nextAction && a.nextAction.options.length) {
            pp.appendChild(el("div", "pm-spell-divider"));
            pp.appendChild(popHead("When included usage runs out"));
            a.nextAction.options.forEach(function (o) {
              pp.appendChild(popItem(o + (a.nextAction.chosen === o ? "  ·  chosen" : ""), function () {
                close(); a.nextAction.chosen = o; repaint();
                announce("When " + a.nickname + " runs out: " + o + ".");
              }, { strong: a.nextAction.chosen === o }));
            });
          }
        });
      });
      acts.appendChild(more);
      row2.appendChild(acts);
      bodyEl.appendChild(row2);
    });

    if (p.models.length) {
      var s3 = store.get();
      var models = p.models.slice().sort(function (x, y) {
        var fx = s3.favourites[x.id] !== undefined ? s3.favourites[x.id] : x.favourite;
        var fy = s3.favourites[y.id] !== undefined ? s3.favourites[y.id] : y.favourite;
        if (fx !== fy) return fx ? -1 : 1;
        return x.priority - y.priority;
      });
      models.forEach(function (m) {
        if (s3.hidden[m.id] === undefined ? m.hidden : s3.hidden[m.id]) return;
        bodyEl.appendChild(modelRow(p, m, repaint));
      });
    }

    if (p.id === "claude") {
      var diff = D.routeDifferences[0];
      bodyEl.appendChild(el("div", "co-row-meta",
        '<span class="co-warn">' + I("alert", 12) + "<span><strong>Requested " + E(diff.requested) +
        ", in force " + E(diff.effective) + ".</strong> " + E(diff.reason) + "</span></span>"));
    }

    var act = activeAccount(p);
    if (act && act.usage.pressure === "exhausted") {
      var box = el("div", "co-block");
      box.appendChild(el("div", "co-block-title", "Included usage is gone — what happens next?"));
      var opts = el("div", "co-scopes");
      (act.nextAction.options || []).forEach(function (o) {
        var b2 = el("button", "co-scope", E(o));
        b2.type = "button";
        b2.setAttribute("aria-pressed", String(act.nextAction.chosen === o));
        b2.addEventListener("click", function () { act.nextAction.chosen = o; repaint(); announce("Chosen: " + o); });
        opts.appendChild(b2);
      });
      box.appendChild(opts);
      box.appendChild(el("div", "co-a-n", "Only the continuations this product actually supports are offered. There is no universal budget setting."));
      bodyEl.appendChild(box);
    }

    wrap.appendChild(bodyEl);
    return wrap;
  }

  function modelRow(p, m, repaint) {
    var s2 = store.get();
    var row2 = el("div", "co-model");
    var isFav = s2.favourites[m.id] !== undefined ? s2.favourites[m.id] : m.favourite;
    var alias = s2.aliases[m.id] !== undefined ? s2.aliases[m.id] : m.alias;

    var fav = el("button", "co-model-fav", I("star", 14));
    fav.type = "button";
    fav.setAttribute("aria-pressed", String(isFav));
    fav.setAttribute("aria-label", (isFav ? "Remove " : "Add ") + m.name + " favourite");
    fav.addEventListener("click", function () {
      var f = store.get().favourites; f[m.id] = !isFav; store.set({ favourites: f }); repaint();
    });
    row2.appendChild(fav);

    var nm = el("div");
    nm.style.minWidth = "0";
    nm.innerHTML = '<div class="co-model-name">' + E(m.name) +
      (alias ? '<span class="co-model-sub">shown as “' + E(alias) + "”</span>" : "") +
      (m.available === false ? chip("unavailable", "Unavailable") : "") + "</div>" +
      '<div class="co-model-sub">' + E(m.summary) + " · " + E(m.context) +
      (m.unavailableReason ? " · " + E(m.unavailableReason) : "") +
      (m.routeNote ? " · " + E(m.routeNote) : "") +
      (m.freeTerms ? " · " + m.freeTerms.map(E).join(" · ") : "") + "</div>";
    row2.appendChild(nm);

    var caps = el("div", "co-model-caps");
    (m.capabilities || []).slice(0, 3).forEach(function (c) {
      var st = S.capabilityStatus(c.state);
      var b = el("button", "pm-chip");
      b.type = "button";
      b.setAttribute("data-status", st === "ok" ? "" : st);
      b.textContent = c.name + ": " + S.capabilityLabel(c.state);
      b.title = "Evidence: " + c.evidence + " · " + c.when;
      b.addEventListener("click", function () {
        openPop(b, function (pp) {
          pp.appendChild(popHead(c.name));
          pp.appendChild(el("div", "pm-spell-item", E(S.capabilityLabel(c.state))));
          pp.appendChild(el("div", "pm-spell-item", "Evidence: " + E(c.evidence)));
          pp.appendChild(el("div", "pm-spell-item", "Recorded: " + E(c.when)));
        });
      });
      caps.appendChild(b);
    });
    row2.appendChild(caps);

    var menu = el("button", "co-model-menu", I("more", 15));
    menu.type = "button";
    menu.setAttribute("aria-label", "Options for " + m.name);
    menu.addEventListener("click", function () {
      openPop(menu, function (pp, close) {
        pp.appendChild(popHead(m.name));
        pp.appendChild(popItem(isFav ? "Remove from favourites" : "Add to favourites", function () { close(); fav.click(); }));
        pp.appendChild(popItem(alias ? "Change the alias" : "Give it an alias", function () {
          close();
          var next = window.prompt("Show " + m.name + " as:", alias || m.name);
          if (next == null) return;
          var a2 = store.get().aliases; a2[m.id] = next.trim() || null;
          store.set({ aliases: a2 }); repaint();
        }));
        pp.appendChild(popItem("Hide from pickers", function () {
          close();
          var h = store.get().hidden; h[m.id] = true; store.set({ hidden: h }); repaint();
          announce(m.name + " hidden. Still findable in search.");
        }));
        pp.appendChild(el("div", "pm-spell-divider"));
        pp.appendChild(popHead("Speed"));
        if (m.modes.fast) {
          ["Normal", "Fast"].forEach(function (mode) {
            pp.appendChild(popItem(mode, function () { close(); announce(m.name + " set to " + mode + "."); }));
          });
        } else {
          pp.appendChild(popItem("Fast not supported by this model", null, { disabled: true }));
        }
        pp.appendChild(popHead("Reasoning effort"));
        if (m.modes.effort && m.modes.effort.length) {
          m.modes.effort.forEach(function (l) {
            pp.appendChild(popItem(l, function () { close(); announce(m.name + " effort set to " + l + "."); }));
          });
        } else {
          pp.appendChild(popItem("Not offered by this model", null, { disabled: true }));
        }
      });
    });
    row2.appendChild(menu);
    return row2;
  }

  function activeAccount(p) {
    var pref = store.get().accountPref[p.id];
    if (pref) { var f = p.accounts.filter(function (a) { return a.id === pref; })[0]; if (f) return f; }
    return p.accounts.filter(function (a) { return a.status === "connected"; })[0] || p.accounts[0] || null;
  }

  function doRefresh() {
    if (store.get().catalogueRefreshing) return;
    store.set({ catalogueRefreshing: true });
    var host = document.querySelector(".co-mode-body");
    if (host && host._repaint) host._repaint();
    window.PMSim.run({
      id: "refresh-catalogues", label: "Refresh model catalogues",
      realCall: "CatalogueService.refresh(['models.dev','free-coding-models'])",
      phases: [{ label: "models.dev" }, { label: "Free Coding Models" }, { label: "Validating" }],
      duration: 1800, outcome: "degraded",
      detail: "models.dev returned 41 models and activated. Free Coding Models failed validation and was quarantined, so its previous catalogue is still in use."
    }).then(function (r) {
      store.set({ catalogueRefreshing: false });
      var h = document.querySelector(".co-mode-body");
      if (h && h._repaint) h._repaint();
      showReceipt(r);
    });
  }

  /* ================================================= MANAGER SPEC RENDERER */

  /* Console reads a manager as a set of numbered movements, the same way it
   * reads a category: the right-margin index travels with them. Every assigned
   * manager goes through this one path. */
  function hydrated() { window.__pmHydrated = (window.__pmHydrated || 0) + 1; }

  function renderManager(spec, ctx, body, tools) {
    hydrated();

    if (spec.primary) {
      var pb = el("button", "co-btn is-primary", "<span>" + E(spec.primary.label) + "</span>");
      pb.type = "button";
      pb.addEventListener("click", function () { runAction(ctx, spec.primary, { id: spec.id }); });
      tools.appendChild(pb);
    }
    spec.diagnostics.forEach(function (d) {
      var db = el("button", "co-btn", "<span>" + E(d.label) + "</span>");
      db.type = "button";
      db.addEventListener("click", function () { runAction(ctx, { id: d.id, label: d.label }, { id: spec.id }); });
      tools.appendChild(db);
    });

    var health = el("div", "co-block");
    health.innerHTML = '<div class="co-block-title">Health ' + statusChip(spec.health.status, spec.health.statusWord) + "</div>" +
      '<p class="co-block-line">' + E(spec.health.headline) + "</p>" +
      (spec.health.detail ? '<p class="co-block-line">' + E(spec.health.detail) + "</p>" : "");
    if (spec.health.counts.length) {
      var counts = el("div", "co-counts");
      spec.health.counts.forEach(function (c) {
        counts.appendChild(el("div", "co-count",
          '<span class="co-count-v">' + E(String(c.value)) + '</span><span class="co-count-l">' + E(c.label) + "</span>"));
      });
      health.appendChild(counts);
    }
    body.appendChild(health);

    if (spec.owner) {
      var own = el("div", "co-block");
      own.innerHTML = '<div class="co-block-title">' + E(spec.owner.name) + " owns this</div>" +
        '<p class="co-block-line">' + E(spec.owner.why) + "</p>" +
        '<p class="co-block-line"><strong>Insertion contract</strong> \u2014 ' + E(spec.owner.insertionContract) + "</p>";
      body.appendChild(own);
    }

    spec.sections.forEach(function (sec, i) { body.appendChild(movement(sec, ctx, i + 1)); });
    spec.notes.forEach(function (n) { body.appendChild(el("p", "co-block-line", E(n))); });
  }

  function movement(section, ctx, ordinal) {
    var mv = el("section", "co-movement");
    mv.id = "mv-" + section.id;
    mv.setAttribute("data-sub", section.id);
    var head = el("div", "co-movement-head");
    head.innerHTML = '<span class="co-movement-ord">' + (ordinal < 10 ? "0" + ordinal : ordinal) + "</span>" +
      '<h3 class="co-movement-title">' + E(section.label) + "</h3>" +
      (section.summary ? '<p class="co-block-line">' + E(section.summary) + "</p>" : "");
    mv.appendChild(head);

    section.actions.forEach(function (a) {
      var b = el("button", "co-btn" + (a.kind === "primary" ? " is-primary" : a.kind === "risky" ? " is-risky" : ""),
        "<span>" + E(a.label) + "</span>");
      b.type = "button";
      b.addEventListener("click", function () { runAction(ctx, a, { id: section.id }); });
      head.appendChild(b);
    });

    if (section.kind === "rows") {
      section.settings.forEach(function (sid) {
        var found = S.findSetting(D, sid);
        if (found) mv.appendChild(row(found.setting, found.category, found.subcategory));
      });
      if (section.settings.length === 0) mv.appendChild(emptyMovement(section));
      return mv;
    }
    if (section.kind === "prose") {
      section.items.forEach(function (it) { if (it.name) mv.appendChild(el("p", "co-prose", E(it.name))); });
      return mv;
    }
    if (section.items.length === 0) { mv.appendChild(emptyMovement(section)); return mv; }
    if (section.kind === "table" || section.kind === "matrix") { mv.appendChild(movementTable(section, ctx)); return mv; }
    section.items.forEach(function (it) { mv.appendChild(movementItem(it, ctx)); });
    return mv;
  }

  function emptyMovement(section) {
    var e2 = K.emptyFor(section);
    var b = el("div", "co-block");
    b.innerHTML = '<div class="co-block-title">' + E(e2.headline) + "</div>" +
      '<p class="co-block-line">' + E(e2.detail) + "</p>";
    return b;
  }

  function movementTable(section, ctx) {
    var t = el("table", "co-spec-table");
    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", null, "Name"));
    section.columns.forEach(function (c) { hr.appendChild(el("th", c.align === "end" ? "is-num" : null, E(c.label))); });
    hr.appendChild(el("th", null, "State"));
    thead.appendChild(hr);
    t.appendChild(thead);
    var tb = el("tbody");
    section.items.forEach(function (it) {
      var tr = el("tr");
      var td = el("td");
      td.appendChild(el("div", "co-item-name", E(it.name)));
      if (it.secondary) td.appendChild(el("div", "co-item-sub", E(it.secondary)));
      tr.appendChild(td);
      section.columns.forEach(function (c) {
        tr.appendChild(el("td", c.align === "end" ? "is-num" : null,
          E(String(it.fields[c.key] == null ? "\u2014" : it.fields[c.key]))));
      });
      tr.appendChild(el("td", null, statusChip(it.status, it.statusWord || "")));
      tb.appendChild(tr);
      if (it.editable.length || it.actions.length || it.detail.length) {
        var tr2 = el("tr", "co-item-extra");
        var cell = el("td");
        cell.colSpan = section.columns.length + 2;
        cell.appendChild(itemControls(it, ctx));
        tr2.appendChild(cell);
        tb.appendChild(tr2);
      }
    });
    t.appendChild(tb);
    return t;
  }

  function movementItem(it, ctx) {
    var card = el("article", "co-item");
    card.setAttribute("data-item", it.id);
    var head = el("div", "co-item-head");
    head.innerHTML = '<div><div class="co-item-name">' + E(it.name) + "</div>" +
      (it.secondary ? '<div class="co-item-sub">' + E(it.secondary) + "</div>" : "") + "</div>" +
      "<div>" + statusChip(it.status, it.statusWord || "") + "</div>";
    card.appendChild(head);

    if (it.badges.length) {
      var bd = el("div", "co-item-badges");
      it.badges.forEach(function (b) {
        var s2 = el("span", "co-badge", E(b.text));
        s2.setAttribute("data-kind", b.kind);
        if (b.title) s2.title = b.title;
        bd.appendChild(s2);
      });
      card.appendChild(bd);
    }

    var routeLine = K.routeLine(it);
    if (routeLine) card.appendChild(el("div", "co-block-line", E(routeLine)));
    var reason = K.reasonLine(it);
    if (reason) card.appendChild(el("div", "co-block-line", E(reason)));
    if (it.value != null && it.value !== "") {
      card.appendChild(el("div", "co-item-value", "<strong>" + E(String(it.value)) + "</strong>" +
        (it.valueSource ? " \u00b7 " + E(it.valueSource) : "")));
    }

    var keys = Object.keys(it.fields);
    if (keys.length) {
      var fields = el("div", "co-fields");
      keys.forEach(function (k) {
        fields.appendChild(el("div", "co-field",
          '<span class="co-field-k">' + E(k) + '</span><span class="co-field-v">' + E(String(it.fields[k])) + "</span>"));
      });
      card.appendChild(fields);
    }
    card.appendChild(itemControls(it, ctx));
    return card;
  }

  function itemControls(it, ctx) {
    var box = el("div", "co-item-controls");
    it.editable.forEach(function (f) { box.appendChild(editableRow(ctx, it, f)); });
    it.detail.forEach(function (d) {
      var det = el("details", "co-details");
      det.appendChild(el("summary", null, E(d.label)));
      d.rows.forEach(function (r2) {
        det.appendChild(el("div", "co-field",
          '<span class="co-field-k">' + E(r2.label) + '</span><span class="co-field-v">' + E(String(r2.value)) + "</span>"));
        if (r2.hint) det.appendChild(el("div", "co-block-line", E(r2.hint)));
      });
      box.appendChild(det);
    });
    if (it.actions.length) {
      var acts = el("div", "co-item-actions");
      it.actions.forEach(function (a) {
        var b = el("button", "co-btn" + (a.kind === "primary" ? " is-primary" : a.kind === "risky" ? " is-risky" : ""),
          "<span>" + E(a.label) + "</span>");
        b.type = "button";
        b.addEventListener("click", function () { runAction(ctx, a, { id: it.id }); });
        acts.appendChild(b);
      });
      box.appendChild(acts);
    }
    return box;
  }

  function editableRow(ctx, item, field) {
    var wrap = el("div", "co-edit");
    var id = "edit-" + ctx.managerId + "-" + item.id + "-" + field.key;
    var label = el("label", "co-edit-label", E(field.label));
    label.setAttribute("for", id);
    wrap.appendChild(label);

    var edits = store.get().managerEdits;
    var current = edits[id] !== undefined ? edits[id] : field.value;

    function commit(v) {
      var next = Object.assign({}, store.get().managerEdits);
      next[id] = v;
      store.set({ managerEdits: next });
      announce(field.label + " set to " + v + ".");
      renderMode(ctx.managerId);
    }

    if (field.secretKind === "cliOwned") {
      wrap.appendChild(el("div", "co-block-line",
        "This credential belongs to the tool's own login. " + E(String(current))));
      var launch = el("button", "co-btn", "<span>Launch the CLI's own login</span>");
      launch.type = "button";
      launch.addEventListener("click", function () {
        runAction(ctx, { id: "provider.auth.start_setup", label: "Launch the CLI's own login" }, { id: item.id });
      });
      wrap.appendChild(launch);
      return wrap;
    }

    if (field.kind === "secret") {
      var revealed = store.get().revealed[id] === true;
      var shown = revealed ? String(current || "") : maskSecret(String(current || ""));
      var box = el("div", "co-secret");
      box.appendChild(el("span", "co-field-v", E(shown || "Not set")));
      if (field.secretKind === "pmSecret") {
        var eye = el("button", "co-btn", "<span>" + (revealed ? "Hide" : "Reveal") + "</span>");
        eye.type = "button";
        eye.addEventListener("click", function () {
          var r2 = Object.assign({}, store.get().revealed);
          r2[id] = revealed ? false : true;
          store.set({ revealed: r2 });
          renderMode(ctx.managerId);
        });
        box.appendChild(eye);
      }
      wrap.appendChild(box);
      if (field.help) wrap.appendChild(el("div", "co-block-line", E(field.help)));
      return wrap;
    }

    var control;
    if (field.kind === "toggle") {
      control = el("button", "co-toggle");
      control.type = "button";
      control.id = id;
      control.setAttribute("aria-pressed", String(current === true));
      control.textContent = current ? "On" : "Off";
      control.addEventListener("click", function () { commit(current === true ? false : true); });
    } else if (field.kind === "select") {
      control = el("select", "co-select");
      control.id = id;
      (field.options.length ? field.options : [String(current)]).forEach(function (o) {
        var op = document.createElement("option");
        op.value = String(o); op.textContent = String(o);
        control.appendChild(op);
      });
      control.value = String(current);
      control.addEventListener("change", function () { commit(control.value); });
    } else if (field.kind === "chips" || field.kind === "order") {
      control = el("div", "co-chips");
      var listv = Array.isArray(current) ? current.slice() : [];
      listv.forEach(function (c, i) {
        var chipEl = el("span", "co-chip", E(String(c)));
        if (field.kind === "order") {
          var up = el("button", "co-chip-btn", I("chevronUp", 10));
          up.type = "button"; up.title = "Move up";
          up.addEventListener("click", function () {
            if (i === 0) return;
            var n = listv.slice(); var t = n[i - 1]; n[i - 1] = n[i]; n[i] = t; commit(n);
          });
          var down = el("button", "co-chip-btn", I("chevronDown", 10));
          down.type = "button"; down.title = "Move down";
          down.addEventListener("click", function () {
            if (i === listv.length - 1) return;
            var n = listv.slice(); var t = n[i + 1]; n[i + 1] = n[i]; n[i] = t; commit(n);
          });
          chipEl.appendChild(up); chipEl.appendChild(down);
        } else {
          var rm = el("button", "co-chip-btn", I("minus", 10));
          rm.type = "button"; rm.title = "Remove " + c;
          rm.addEventListener("click", function () { var n = listv.slice(); n.splice(i, 1); commit(n); });
          chipEl.appendChild(rm);
        }
        control.appendChild(chipEl);
      });
      if (field.kind === "chips") {
        var add = el("button", "co-chip is-add", I("plus", 10) + " Add");
        add.type = "button";
        add.addEventListener("click", function () {
          var v = window.prompt("Add a value for " + field.label);
          if (v) commit(listv.concat([v]));
        });
        control.appendChild(add);
      }
    } else {
      control = el("input", "co-input");
      control.id = id;
      control.type = field.kind === "number" ? "number" : "text";
      control.value = current == null ? "" : String(current);
      control.addEventListener("change", function () {
        commit(field.kind === "number" ? Number(control.value) : control.value);
      });
    }
    wrap.appendChild(control);
    if (field.help) wrap.appendChild(el("div", "co-block-line", E(field.help)));
    return wrap;
  }

  function maskSecret(v) {
    if (!v) return "";
    if (v.length <= 6) return "\u2022\u2022\u2022\u2022\u2022\u2022";
    return v.slice(0, 3) + "\u2022\u2022\u2022\u2022\u2022\u2022" + v.slice(-3);
  }

  function runAction(ctx, action, payload) {
    return K.act(ctx, action, payload).then(function (r) { if (r) showReceipt(r); return r; });
  }

  function elsewhereMode(body, modeId) {
    var mgr = D.managers[modeId] || {};
    var home = K.homeOf(modeId);
    var block = el("div", "co-block");
    block.style.maxWidth = "640px";
    block.appendChild(el("div", "co-block-title", "Built in " + home.title));
    block.appendChild(el("p", "co-block-line", E(mgr.purpose || "")));
    block.appendChild(el("p", "co-block-line",
      "The four concepts split the manager families between them, so each family is shown once at full depth rather than four times at a quarter depth."));
    body.appendChild(block);
    if (home.href) {
      var a = el("a", "co-btn is-primary");
      a.href = home.href;
      a.style.cssText = "margin-top:12px;display:inline-flex;text-decoration:none";
      a.innerHTML = "<span>Open " + E(home.title) + "</span>" + I("arrowUpRight", 12);
      body.appendChild(a);
    }
  }

  function missingMode(body, modeId) {
    var block = el("div", "co-block");
    block.style.maxWidth = "640px";
    block.appendChild(el("div", "co-block-title", "That link points at something this concept does not contain"));
    block.appendChild(el("p", "co-block-line", "No manager with the id " + E(modeId) + " exists in this fixture."));
    body.appendChild(block);
    var home = el("button", "co-btn is-primary", "<span>Go to Settings home</span>");
    home.type = "button";
    home.addEventListener("click", function () { goTo({ categoryId: null }); });
    body.appendChild(home);
  }

  /* ------------------------------------------------------------- routing */

  function currentRoute() {
    var s = store.get();
    var demo = s.demoState === "normal" ? null : s.demoState;
    if (s.view === "mode" && s.modeId) {
      return { kind: "manager", managerId: s.modeId, sectionId: s.managerSectionId,
        itemId: s.managerItemId, demo: demo };
    }
    if (s.query && s.query.trim()) return { kind: "search", query: s.query.trim(), demo: demo };
    if (s.view === "workspace" && s.categoryId) {
      return { kind: "category", categoryId: s.categoryId, subcategoryId: s.activeSub || null,
        settingId: null, demo: demo };
    }
    return { kind: "home", demo: demo };
  }

  function writeRoute(replace) {
    var r = currentRoute();
    store.set({ route: r });
    window.PMRoute.write(r, replace === true);
  }

  function routeExists(route) {
    if (route.kind === "manager") return K.has(route.managerId);
    if (route.kind === "category") {
      var cat = S.findCategory(D, route.categoryId);
      if (!cat) return false;
      if (route.subcategoryId) {
        var hit = cat.subcategories.filter(function (x) { return x.id === route.subcategoryId; })[0];
        if (!hit) return false;
        if (route.settingId && !S.findSetting(D, route.settingId)) return false;
      }
      return true;
    }
    return true;
  }

  function applyRoute(route) {
    if (route.demo) {
      store.set({ demoState: route.demo, catalogueRefreshing: route.demo === "loading" });
      if (shell) shell.setDemoState(route.demo);
    }
    if (routeExists(route) === false) {
      store.set({ view: "home", categoryId: null, modeId: null, query: "",
        managerSectionId: null, managerItemId: null, badRoute: window.PMRoute.format(route) });
      renderHome();
      return;
    }
    store.set({ badRoute: null });

    if (route.kind === "manager") {
      store.set({ view: "mode", modeId: route.managerId, categoryId: store.get().categoryId || "agents",
        managerSectionId: route.sectionId, managerItemId: route.itemId, query: "" });
      renderMode(route.managerId);
      return;
    }
    if (route.kind === "search") {
      store.set({ view: "home", query: route.query, modeId: null });
      renderHome();
      return;
    }
    if (route.kind === "category") {
      store.set({ view: "workspace", categoryId: route.categoryId, modeId: null, query: "",
        managerSectionId: null, managerItemId: null, activeSub: route.subcategoryId || null });
      renderWorkspace({ subcategoryId: route.subcategoryId, targetId: route.settingId });
      return;
    }
    store.set({ view: "home", categoryId: null, modeId: null, query: "",
      managerSectionId: null, managerItemId: null });
    renderHome();
  }

  function goTo(t) {
    closePop();
    if (t.managerId && (t.kind === "manager" || t.kind === "provider" || t.kind === "model")) {
      store.set({ view: "mode", modeId: t.managerId, categoryId: t.categoryId || "agents",
        managerSectionId: null, managerItemId: null, badRoute: null });
      writeRoute();
      renderMode(t.managerId);
      announce("Opened " + (D.managers[t.managerId] || {}).title + ".");
      return;
    }
    if (!t.categoryId) {
      store.set({ view: "home", categoryId: null, modeId: null, query: "",
        managerSectionId: null, managerItemId: null, badRoute: null });
      writeRoute();
      renderHome();
      return;
    }
    store.set({ view: "workspace", categoryId: t.categoryId, modeId: null,
      managerSectionId: null, managerItemId: null, activeSub: t.subcategoryId || null, badRoute: null });
    writeRoute();
    renderWorkspace({ subcategoryId: t.subcategoryId, targetId: t.targetId });
    announce("Opened " + S.findCategory(D, t.categoryId).title + ".");
  }

  function swap(node) { mainEl.innerHTML = ""; mainEl.appendChild(node); }

  /* =============================================================== MOUNT */

  /* The shell owns the Demo state select and the Reset button, so the concept
   * passes its state in and reacts rather than building a second control. */
  /* Subscribe before mounting. persist() only subscribes and snapshots at flush
   * time, so every store write mount makes -- including a theme corrected from a
   * poisoned stored value -- is captured by the first flush instead of lingering
   * in storage until the next user change. */
  window.PMStore.persist(CONCEPT_ID, store, window.PMStore.PERSIST_KEYS);

  shell = window.PMShell.mount({
    rootId: "pm-root",
    concept: "Console \u00b7 Settings as a question",
    conceptId: CONCEPT_ID,
    theme: store.get().theme || "glass-dark",
    defaultTheme: "glass-dark",
    widthChoice: store.get().widthChoice,
    railOpen: store.get().railOpen,
    panelOpen: store.get().panelOpen,
    reducedMotion: store.get().reducedMotion,
    onShellState: function (patch) { store.set(patch); },
    demoState: store.get().demoState,
    onDemoState: function (id) {
      store.set({ demoState: id, catalogueRefreshing: id === "loading" });
      writeRoute();
      var s2 = store.get();
      if (s2.view === "home") renderHome();
      else if (s2.view === "mode") renderMode(s2.modeId);
      else renderWorkspace({});
      announce("Demo state: " + id + ".");
    },
    onReceiptAction: function (r) { showReceipt(r); },
    onLayout: function () { if (spy) { spy.measure(); } },
    onWidthMode: function () { if (spy) spy.measure(); }
  });
  mainEl = shell.main;


  /* Back and forward are native hashchange events. */
  window.PMRoute.onChange(function (route) { applyRoute(route); });

  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      var i = document.querySelector(".co-console-input");
      if (i) { i.focus(); i.select(); }
    }
  });

  /* The hash wins on load. With no hash, a saved route is restored with replace
   * so it does not become a phantom back step. */
  if ((window.location.hash || "") !== "") {
    applyRoute(window.PMRoute.parse());
  } else if (store.get().route) {
    applyRoute(store.get().route);
    writeRoute(true);
  } else {
    renderHome();
  }
})();
