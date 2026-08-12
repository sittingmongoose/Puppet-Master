/* Opus 5 — Stack
 *
 * Settings is a ROUTE. Column 1 is the root, column 2 the sections of the place
 * you chose, column 3 the settings document itself, and a manager pushes a
 * fourth column. Scrolling column 3 moves the marker in column 2 — the
 * scrollspy lives across columns rather than inside one.
 *
 * Search collapses the stack into a single result column where every hit shows
 * its whole route; choosing one rebuilds the stack to that route.
 */
(function () {
  "use strict";

  var D = window.PMData;
  var S = window.PMSemantics;
  var I = window.PMIcons.icon;
  var E = window.PMShell.escapeHtml;

  var index = window.PMSearch.buildIndex(D);
  window.PMSpellcheck.learnNames(D.knownNames);

  var CONCEPT_ID = "stack";
  var K = window.PMManagerKit;

  /* Only the keys a reviewer expects to survive a reload are persisted. Live
   * operation state — an in-flight refresh, an open popover — deliberately is
   * not: restoring a half-finished operation would claim something happened
   * while the page was closed. */
  var saved = window.PMStore.restore(CONCEPT_ID, window.PMStore.PERSIST_KEYS);

  var store = window.PMStore.createStore(Object.assign({
    rootId: null,            // "notices" or a category id
    categoryId: null,
    managerId: null,
    managerSectionId: null,
    managerItemId: null,
    query: "",
    exposure: "standard",
    demoState: "normal",
    dismissedNotices: {},
    values: {},
    managerEdits: {},
    route: null,
    theme: "basic-dark",
    widthChoice: "1280",
    railOpen: true,
    panelOpen: false,
    reducedMotion: false,
    revealed: {},
    favourites: {},
    hidden: {},
    aliases: {},
    accountPref: {},
    openProviders: { claude: true },
    openInstallations: {},
    catalogueRefreshing: false,
    memoryFilter: "",
    memoryTab: "gists",
    mcpId: "mcp-github"
  }, saved));

  var shell, spy, mainEl, stackEl, lastDepth = 1;

  /* Which managers this concept builds, and where every other one lives, both
   * come from the shared kit. A hand-written table here drifted the moment a
   * family moved between concepts. */
  var BUILT_HERE = K.assignedTo(CONCEPT_ID);

  var LEVEL_VISIBLE = {
    standard: ["standard", "managed", "unavailable"],
    advanced: ["standard", "managed", "unavailable", "advanced"],
    all: ["standard", "managed", "unavailable", "advanced", "expert", "diagnostic"]
  };

  function el(t, c, h) { var n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; }
  function sState(s) { var o = store.get().values[s.id]; return o ? Object.assign({}, s.state, o) : s.state; }
  function statusChip(st, w) {
    return '<span class="pm-status" data-status="' + st + '">' + I(window.PMIcons.statusIcon(st), 12) + "<span>" + E(w) + "</span></span>";
  }
  function chip(st, w) { return '<span class="pm-chip" data-status="' + st + '">' + E(w) + "</span>"; }
  function announce(m) { if (shell) shell.announce(m); }

  /* popover -------------------------------------------------------------- */
  var pop = null;
  function closePop() {
    if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
    pop = null;
    document.removeEventListener("mousedown", pd, true);
    document.removeEventListener("keydown", pk, true);
  }
  function pd(e) { if (pop && !pop.contains(e.target)) closePop(); }
  function pk(e) { if (e.key === "Escape") closePop(); }
  function openPop(anchor, build) {
    closePop();
    var p = el("div", "pm-spell-menu"); p.setAttribute("role", "menu");
    build(p, closePop);
    document.body.appendChild(p);
    var r = anchor.getBoundingClientRect();
    var top = r.bottom + 6, left = Math.min(r.left, window.innerWidth - p.offsetWidth - 8);
    if (left < 8) left = 8;
    if (top + p.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - p.offsetHeight - 6);
    p.style.top = Math.round(top) + "px"; p.style.left = Math.round(left) + "px";
    pop = p;
    document.addEventListener("mousedown", pd, true);
    document.addEventListener("keydown", pk, true);
    var f = p.querySelector("button"); if (f) f.focus();
  }
  function popItem(l, fn, o) {
    var b = el("button", "pm-spell-item" + (o && o.strong ? " is-suggestion" : ""), E(l));
    b.type = "button"; b.setAttribute("role", "menuitem");
    if (o && o.disabled) { b.disabled = true; b.style.opacity = ".55"; b.style.cursor = "not-allowed"; }
    else b.addEventListener("click", fn);
    return b;
  }
  function popHead(t) { return el("div", "pm-spell-menu-head", E(t)); }

  /* receipts ------------------------------------------------------------- */
  function receiptRow(r) {
    var n = el("div", "st-receipt");
    n.innerHTML = '<span class="st-receipt-t">' + E(r.at) + "</span>" +
      '<span class="st-receipt-b"><strong>' + E(window.PMSim.outcomeWord(r.outcome)) + "</strong> — " +
      E(r.label) + ". " + E(r.detail) + '<span class="st-receipt-call">' + E(r.realCall) + "</span></span>";
    return n;
  }
  function showReceipt(r) {
    announce(window.PMSim.outcomeWord(r.outcome) + ": " + r.detail);
    var host = document.querySelector(".st-receipts");
    if (host) { host.insertBefore(receiptRow(r), host.firstChild); return; }
    var body = document.querySelector(".st-mgr-body") || document.querySelector(".st-doc");
    if (!body) return;
    var n = receiptRow(r);
    body.insertBefore(n, body.firstChild);
    window.setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 9000);
  }
  function sim(id, label, call, detail, outcome, phases) {
    if (outcome === "unavailable") {
      window.PMSim.unavailable({ id: id, label: label, realCall: call, detail: detail }).then(showReceipt);
      return;
    }
    window.PMSim.run({ id: id, label: label, realCall: call, phases: phases || [{ label: "Working" }], outcome: outcome || "ok", detail: detail }).then(showReceipt);
  }

  /* ============================================================== RENDER */

  function render(opts) {
    var s = store.get();
    closePop();

    var surface = el("div", "st-surface");
    surface.appendChild(buildRoute());
    if (s.badRoute) surface.appendChild(badRouteNotice(s.badRoute));

    if (s.query.trim()) {
      surface.appendChild(buildResults());
      swap(surface);
      lastDepth = 1;
      return;
    }

    stackEl = el("div", "st-stack");
    var depth = s.managerId ? (4 + (s.managerSectionId ? 1 : 0) + (s.managerItemId ? 1 : 0)) : 3;
    stackEl.setAttribute("data-depth", String(depth));

    var c1 = buildRootColumn();
    stackEl.appendChild(c1);

    var c2 = s.rootId === "notices" ? buildNoticeColumn() : buildSectionColumn();
    stackEl.appendChild(c2);

    var c3 = s.rootId === "notices" ? buildNoticeDetailColumn() : buildDocColumn();
    stackEl.appendChild(c3);

    if (s.managerId) buildManagerColumns(s.managerId).forEach(function (c) { stackEl.appendChild(c); });

    // Kinetic depth: the arriving column travels, the one behind recedes.
    var cols = stackEl.children;
    var top = cols[cols.length - 1];
    if (depth !== lastDepth) {
      top.classList.add(depth > lastDepth ? "is-entering" : "is-entering-back");
      if (cols.length > 1) cols[cols.length - 2].classList.add("is-receding");
    } else if (opts && opts.entering) {
      top.classList.add("is-entering");
    }
    /* At squeezed width only the is-top column is shown, one at a time. "top"
     * (the newest DOM column) is right once a place has been entered, but with
     * nothing chosen yet (s.rootId unset) that column is the empty document
     * placeholder — leaving the root list, the only place you could act from,
     * unreachable. Keep the root column focused until something is picked. */
    var focusCol = (!s.rootId && !s.managerId) ? cols[0] : top;
    focusCol.classList.add("is-top");
    lastDepth = depth;

    surface.appendChild(stackEl);
    swap(surface);

    if (s.rootId && s.rootId !== "notices") {
      attachSpy();
      if (opts && opts.subcategoryId) {
        window.PMSections.afterLayout(function () {
          var docEl = stackEl.querySelector(".st-doc");
          var focusEl = opts.targetId ? docEl.querySelector('[data-setting="' + opts.targetId + '"]') : null;
          spy.jump(opts.subcategoryId, { focusEl: focusEl });
        });
      }
    }
  }

  /* A link can be perfectly well formed and still name a category or manager
   * this concept does not contain — a link from another concept, or a stale
   * bookmark. That is worth saying out loud instead of showing an empty column. */
  function badRouteNotice(hash) {
    var n = el("div", "st-badroute");
    n.setAttribute("role", "status");
    n.innerHTML = I("alert", 14) +
      "<span><strong>That link points at something this concept does not contain</strong>" +
      '<span class="st-badroute-sub">' + E(hash) + "</span></span>";
    var home = el("button", "st-btn is-primary", "<span>Go to Settings home</span>");
    home.type = "button";
    home.addEventListener("click", function () { goTo({ categoryId: null }); });
    n.appendChild(home);
    return n;
  }

  /* -------------------------------------------------------- route header */

  function buildRoute() {
    var s = store.get();
    var head = el("div", "st-route");

    var back = el("button", "st-back", I("chevronLeft", 14) + "<span>Back</span>");
    back.type = "button";
    back.disabled = !s.rootId && !s.query;
    back.addEventListener("click", goBack);
    head.appendChild(back);

    var crumbs = el("div", "st-crumbs");
    function crumb(label, onClick, current) {
      var b = el("button", "st-crumb", E(label));
      b.type = "button";
      if (current) b.setAttribute("aria-current", "true");
      if (onClick) b.addEventListener("click", onClick); else b.disabled = true;
      return b;
    }
    function sep() { return el("span", "st-crumb-sep", I("chevronRight", 11)); }

    crumbs.appendChild(crumb("Settings", function () {
      store.set({ rootId: null, categoryId: null, managerId: null, query: "" });
      render({});
    }, !s.rootId));

    if (s.rootId === "notices") {
      crumbs.appendChild(sep());
      crumbs.appendChild(crumb("Things that need you", null, true));
    } else if (s.rootId) {
      var cat = S.findCategory(D, s.categoryId);
      crumbs.appendChild(sep());
      crumbs.appendChild(crumb(cat.title, function () {
        store.set({ managerId: null });
        render({});
      }, !s.managerId));
      if (s.managerId) {
        crumbs.appendChild(sep());
        crumbs.appendChild(crumb((D.managers[s.managerId] || {}).title || "Manager", null, true));
      }
    }
    head.appendChild(crumbs);

    var search = el("div", "st-search");
    search.innerHTML = I("search", 14);
    var input = el("input");
    input.type = "search";
    input.placeholder = "Search everything";
    input.setAttribute("aria-label", "Search settings, managers and actions");
    input.value = s.query;
    search.appendChild(input);
    var timer = 0;
    input.addEventListener("input", function () {
      window.clearTimeout(timer);
      var v = input.value;
      timer = window.setTimeout(function () {
        store.set({ query: v });
        render({});
        var again = document.querySelector(".st-search input");
        if (again) { again.focus(); again.setSelectionRange(v.length, v.length); }
      }, 160);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { store.set({ query: "" }); render({}); }
      if (e.key === "Enter") { var f = document.querySelector(".st-result"); if (f) f.click(); }
    });
    head.appendChild(search);

    var level = el("button", "st-btn is-quiet", "<span>" + E(levelWord()) + "</span>" + I("chevronDown", 12));
    level.type = "button";
    level.addEventListener("click", function () {
      openPop(level, function (p, close) {
        p.appendChild(popHead("How much to show"));
        [["standard", "Standard"], ["advanced", "Advanced"], ["all", "Everything"]].forEach(function (o) {
          p.appendChild(popItem(o[1], function () {
            close();
            var keep = spy ? spy.activeId() : null;
            store.set({ exposure: o[0] });
            render({});
            if (keep) window.setTimeout(function () { if (spy) spy.jump(keep); }, 80);
          }, { strong: store.get().exposure === o[0] }));
        });
      });
    });
    head.appendChild(level);

    return head;
  }

  function levelWord() {
    var e2 = store.get().exposure;
    return e2 === "all" ? "Everything" : e2 === "advanced" ? "Advanced" : "Standard";
  }

  function goBack() {
    var s = store.get();
    if (s.query) { store.set({ query: "" }); render({}); return; }
    if (s.managerId) { store.set({ managerId: null }); render({}); return; }
    if (s.rootId) { store.set({ rootId: null, categoryId: null }); render({}); return; }
  }

  /* ------------------------------------------------------- column one */

  function buildRootColumn() {
    var s = store.get();
    var col = el("div", "st-col");
    col.appendChild(el("div", "st-col-head", '<span class="st-col-head-name">Settings</span>'));
    var body = el("div", "st-col-body");

    var notices = S.noticesFor(D, s.demoState, s.dismissedNotices);
    var groups = S.groupNotices(notices);
    var b = el("button", "st-item");
    b.type = "button";
    b.setAttribute("aria-current", String(s.rootId === "notices"));
    b.innerHTML = '<span class="st-item-icon">' + I("alert", 14) + "</span>" +
      '<span class="st-item-body"><span class="st-item-name">Things that need you</span>' +
      '<span class="st-item-sub">' + (notices.length
        ? groups.attention.length + " attention · " + groups.setup.length + " setup · " + groups.recommended.length + " recommended"
        : "Nothing right now") + "</span></span>" +
      '<span class="st-item-meta">' + (notices.length || "") + "</span>" +
      '<span class="st-item-chev">' + I("chevronRight", 13) + "</span>";
    b.addEventListener("click", function () {
      store.set({ rootId: "notices", categoryId: null, managerId: null });
      render({ entering: true });
    });
    body.appendChild(b);

    D.categories.forEach(function (cat) {
      var counts = S.countSettings(cat);
      var item = el("button", "st-item");
      item.type = "button";
      item.setAttribute("aria-current", String(s.categoryId === cat.id));
      item.innerHTML = '<span class="st-item-icon">' + I(cat.icon, 14) + "</span>" +
        '<span class="st-item-body"><span class="st-item-name">' + E(cat.title) + "</span>" +
        '<span class="st-item-sub">' + counts.total + " settings · " + cat.subcategories.length + " sections</span></span>" +
        '<span class="st-item-meta">' + (counts.changed ? counts.changed + " changed" : "") + "</span>" +
        '<span class="st-item-chev">' + I("chevronRight", 13) + "</span>";
      item.addEventListener("click", function () {
        store.set({ rootId: cat.id, categoryId: cat.id, managerId: null });
        render({ entering: true });
      });
      body.appendChild(item);
    });

    col.appendChild(body);
    return col;
  }

  /* ------------------------------------------------------- column two */

  function buildSectionColumn() {
    var s = store.get();
    var col = el("div", "st-col");
    var cat = S.findCategory(D, s.categoryId);
    col.appendChild(el("div", "st-col-head",
      '<span class="st-col-head-name">' + (cat ? E(cat.title) : "Sections") + "</span>"));
    var body = el("div", "st-col-body");

    if (!cat) {
      body.appendChild(el("div", "st-empty", "Choose a place on the left."));
      col.appendChild(body);
      return col;
    }

    cat.subcategories.forEach(function (sub) {
      var shown = visible(sub).length;
      var b = el("button", "st-sub");
      b.type = "button";
      b.setAttribute("data-sub", sub.id);
      b.innerHTML = '<span class="st-sub-mark"></span>' +
        '<span class="st-sub-name">' + E(sub.title) + "</span>" +
        '<span class="st-sub-count">' + shown + "</span>" +
        '<span class="st-sub-progress"><span class="st-sub-progress-fill"></span></span>';
      b.addEventListener("click", function () {
        if (spy) { spy.jump(sub.id); announce("Jumped to " + sub.title + "."); }
      });
      body.appendChild(b);
    });

    col.appendChild(body);
    return col;
  }

  function buildNoticeColumn() {
    var col = el("div", "st-col");
    col.appendChild(el("div", "st-col-head", '<span class="st-col-head-name">Things that need you</span>'));
    var body = el("div", "st-col-body");
    var list = S.noticesFor(D, store.get().demoState, store.get().dismissedNotices);
    if (!list.length) {
      var calm = el("div", "st-calm");
      calm.innerHTML = "<strong>Nothing needs attention</strong>Every provider is connected, no setup is unfinished, and there are no open recommendations.";
      body.appendChild(calm);
    } else {
      list.forEach(function (n) {
        var meta = S.severity(n.severity);
        var card = el("article", "st-notice");
        card.setAttribute("data-severity", n.severity);
        card.innerHTML = '<div class="st-notice-word">' + I(window.PMIcons.statusIcon(meta.status), 11) +
          "<span>" + E(n.statusWord) + "</span></div>" +
          '<div class="st-notice-headline">' + E(n.headline) + "</div>" +
          '<div class="st-notice-consequence">' + E(n.consequence) + "</div>";
        var acts = el("div", "st-notice-actions");
        var p = el("button", "st-btn is-primary", "<span>" + E(n.primary.label) + "</span>");
        p.type = "button";
        p.addEventListener("click", function () { noticeAction(n, n.primary); });
        acts.appendChild(p);
        if (n.secondary) {
          var s2 = el("button", "st-btn is-quiet", "<span>" + E(n.secondary.label) + "</span>");
          s2.type = "button";
          s2.addEventListener("click", function () { noticeAction(n, n.secondary); });
          acts.appendChild(s2);
        }
        card.appendChild(acts);
        body.appendChild(card);
      });
    }
    col.appendChild(body);
    return col;
  }

  function buildNoticeDetailColumn() {
    var col = el("div", "st-col");
    col.appendChild(el("div", "st-col-head", '<span class="st-col-head-name">How the three kinds differ</span>'));
    var body = el("div", "st-col-body");
    body.style.padding = "16px";
    ["attention", "setup", "recommended"].forEach(function (sev) {
      var meta = S.severity(sev);
      var card = el("div", "st-card");
      card.innerHTML = '<div class="st-card-title">' + statusChip(meta.status, meta.word) + "</div>" +
        '<div class="st-card-line">' + E(meta.note) + "</div>";
      body.appendChild(card);
    });
    var note = el("div", "st-card");
    note.innerHTML = '<div class="st-card-line">A recommendation is never drawn like an error. ' +
      "Continue setup means you stopped halfway on purpose — nothing is broken.</div>";
    body.appendChild(note);
    col.appendChild(body);
    return col;
  }

  /* Dismissal genuinely removes the notice for the rest of the session and says
   * how many are left. Changing the demo state brings the fixture back. */
  function dismissNotice(notice) {
    var d = store.get().dismissedNotices;
    d[notice.id] = true;
    store.set({ dismissedNotices: d });
    render({});
    var left = S.noticesFor(D, store.get().demoState, d).length;
    announce("Dismissed. " + (left ? left + " still open." : "Nothing needs attention now."));
  }

  function noticeAction(n, a) {
    if (a.action === "dismiss") { dismissNotice(n); return; }
    if (a.action === "reconnect-mcp") {
      sim("reconnect-mcp", "Reconnect the postgres MCP server", "MCPService.reconnect('mcp-postgres')",
        "Still refused: the database container is not running.", "error",
        [{ label: "Starting transport" }, { label: "Negotiating" }]);
      return;
    }
    if (a.action === "prune-snapshots") {
      sim("prune", "Prune old restore points", "SnapshotService.prune(retentionDays: 30)",
        "Would remove 14 restore points and free 6.2 GB.", "ok");
      return;
    }
    if (a.action === "refresh-catalogue") {
      goTo({ managerId: "manager-providers", kind: "manager", categoryId: "agents" });
      return;
    }
    if (n.target) goTo({ categoryId: n.target.categoryId, subcategoryId: n.target.subcategoryId, targetId: n.target.settingId });
  }

  /* ----------------------------------------------------- column three */

  function visible(sub) {
    var allowed = LEVEL_VISIBLE[store.get().exposure] || LEVEL_VISIBLE.standard;
    return sub.settings.filter(function (s) { return allowed.indexOf(s.exposure || "standard") >= 0; });
  }

  function buildDocColumn() {
    var s = store.get();
    var cat = S.findCategory(D, s.categoryId);
    var col = el("div", "st-col");
    col.appendChild(el("div", "st-col-head",
      '<span class="st-col-head-name">' + (cat ? E(cat.title) + " · settings" : "Settings") + "</span>"));

    var doc = el("div", "st-doc");
    doc.setAttribute("tabindex", "-1");

    if (!cat) {
      doc.appendChild(el("div", "st-empty", "Choose a place to see its settings."));
      col.appendChild(doc);
      return col;
    }

    var head = el("div", "st-doc-head");
    head.innerHTML = '<h2 class="st-doc-title">' + E(cat.title) + "</h2>" +
      '<p class="st-doc-purpose">' + E(cat.purpose) + "</p>";
    doc.appendChild(head);

    cat.subcategories.forEach(function (sub) {
      var sec = el("section", "st-section");
      sec.setAttribute("data-section", sub.id);
      var sh = el("div", "st-section-head");
      sh.innerHTML = '<h3 class="st-section-title">' + E(sub.title) + "</h3>" +
        (sub.summary ? '<span class="st-section-summary">' + E(sub.summary) + "</span>" : "");
      sec.appendChild(sh);
      var shown = visible(sub);
      shown.forEach(function (x) { sec.appendChild(row(x, cat, sub)); });
      var hidden = sub.settings.length - shown.length;
      if (hidden > 0) {
        var more = el("button", "st-btn is-quiet", "<span>Show " + hidden + " more</span>" + I("chevronDown", 12));
        more.type = "button";
        more.style.margin = "10px 0 0 8px";
        more.addEventListener("click", function () {
          var keep = sub.id;
          store.set({ exposure: "all" });
          render({});
          window.setTimeout(function () { if (spy) spy.jump(keep); }, 80);
        });
        sec.appendChild(more);
      }
      doc.appendChild(sec);
    });

    col.appendChild(doc);
    return col;
  }

  function row(setting, cat, sub) {
    var state = sState(setting);
    var r = el("div", "st-row");
    r.setAttribute("data-setting", setting.id);
    r.setAttribute("tabindex", "-1");
    var guarded = S.needsGuard(setting) && !store.get().revealed[setting.id];
    if (guarded) r.setAttribute("data-guard", "true");

    var main = el("div");
    main.style.minWidth = "0";
    var label = el("div", "st-row-label");
    label.innerHTML = E(setting.label) +
      ((setting.exposure || "standard") !== "standard"
        ? chip(setting.exposure === "expert" ? "risky" : setting.exposure === "unavailable" ? "unavailable" :
               setting.exposure === "managed" ? "managed" : "", S.exposureLabel(setting.exposure)) : "");
    main.appendChild(label);
    main.appendChild(el("p", "st-row-explain", E(setting.explanation)));

    var meta = el("div", "st-row-meta");
    if (state.effect) meta.innerHTML += "<span>" + I("info", 12) + "<span>" + E(S.effectWord(state.effect.kind)) + ": " + E(state.effect.text) + "</span></span>";
    if (S.hasDifference(state)) meta.innerHTML += '<span class="st-warn">' + I("alert", 12) + "<span>" + E(S.differenceText(state)) + "</span></span>";
    if (state.reason) meta.innerHTML += '<span class="st-stop">' + I(state.source === "managed" ? "lock" : "ban", 12) + "<span>" + E(state.reason) + "</span></span>";
    if (state.scope && state.scope !== "global") meta.innerHTML += "<span>" + I("layers", 12) + "<span>Applies to: " + E(S.scopeLabel(state.scope)) + "</span></span>";
    if (meta.innerHTML) main.appendChild(meta);
    r.appendChild(main);

    var ctrl = el("div", "st-row-ctrl");
    if (guarded) {
      var g = el("div", "st-guard");
      g.innerHTML = "<span>" + (setting.exposure === "unavailable" ? "Not available" : "Hidden by default") + "</span>";
      var rv = el("button", null, setting.exposure === "unavailable" ? "Why?" : "Show");
      rv.type = "button";
      rv.addEventListener("click", function () {
        var x = store.get().revealed; x[setting.id] = true; store.set({ revealed: x });
        replace(setting, cat, sub);
      });
      g.appendChild(rv);
      ctrl.appendChild(g);
    } else {
      ctrl.appendChild(controlFor(setting, state, function () { replace(setting, cat, sub); }));
      var st = el("div", "st-row-state");
      st.innerHTML = stateText(setting, state);
      ctrl.appendChild(st);
      if (state.isDefault === false && S.isEditable(setting)) {
        var reset = el("button", "st-reset", I("undo", 11) + "<span>Reset</span>");
        reset.type = "button";
        reset.addEventListener("click", function () {
          var v = store.get().values; delete v[setting.id]; store.set({ values: v });
          replace(setting, cat, sub);
          announce(setting.label + " reset to default.");
        });
        ctrl.appendChild(reset);
      }
    }
    r.appendChild(ctrl);
    return r;
  }

  function stateText(setting, state) {
    var label = S.stateLabel(state), status = S.stateStatus(state);
    if (status !== "ok") return statusChip(status, S.stateLabelShort(state));
    if (state.source === "recommended") return statusChip("recommended", "Recommended");
    var d = S.defaultDisplay(setting);
    return E(label) + (state.isDefault === false && d ? " · was " + E(d) : "");
  }

  function replace(setting, cat, sub) {
    var old = stackEl && stackEl.querySelector('[data-setting="' + setting.id + '"]');
    if (!old) return;
    old.parentNode.replaceChild(row(setting, cat, sub), old);
    if (spy) spy.measure();
  }

  function controlFor(setting, state, onChange) {
    var editable = S.isEditable(setting);
    if (setting.kind === "manager") {
      var b = el("button", "st-btn", "<span>Open</span>" + I("chevronRight", 12));
      b.type = "button";
      b.addEventListener("click", function () {
        store.set({ managerId: setting.managerId });
        render({});
        announce("Pushed " + ((D.managers[setting.managerId] || {}).title || "manager") + ".");
      });
      return b;
    }
    if (setting.kind === "action") {
      var ab = el("button", "st-btn", "<span>Run</span>");
      ab.type = "button";
      ab.addEventListener("click", function () {
        var risky = setting.exposure === "expert";
        sim(setting.id, setting.label, "SettingsService.run('" + setting.id + "')",
          risky ? "Refused in a concept: irreversible and would discard real state."
                : "A real build performs this and reports the result.",
          risky ? "unavailable" : "handoff");
      });
      return ab;
    }
    if (setting.kind === "toggle") {
      var on = state.value === true;
      var t = el("button", "st-check", '<span class="st-check-box">' + I("check", 12) + "</span><span>" + (on ? "On" : "Off") + "</span>");
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
      var sel = el("select", "st-select");
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
    return el("div", "st-static", E(S.valueDisplay(setting)));
  }

  function setValue(setting, value) {
    var v = store.get().values;
    var isDefault = setting.state.defaultValue !== undefined && String(setting.state.defaultValue) === String(value);
    v[setting.id] = { value: value, isDefault: isDefault, source: isDefault ? "default" : "custom" };
    store.set({ values: v });
    announce(setting.label + " set to " + (typeof value === "boolean" ? (value ? "on" : "off") : value) + ".");
  }

  /* ------------------------------------------- cross-column scrollspy */

  function attachSpy() {
    if (spy) spy.destroy();
    var doc = stackEl.querySelector(".st-doc");
    var cat = S.findCategory(D, store.get().categoryId);
    if (!doc || !cat) return;
    spy = window.PMSections.create({
      scroller: doc,
      anchorInset: 70,
      hysteresis: 0.12,
      onActive: function (id) { markSub(id); },
      onScroll: function (info) { progress(info); }
    });
    var sections = [];
    cat.subcategories.forEach(function (sub) {
      var node = doc.querySelector('[data-section="' + sub.id + '"]');
      if (node) sections.push({ id: sub.id, categoryId: cat.id, title: sub.title, el: node });
    });
    spy.setSections(sections);
  }

  function markSub(id) {
    if (!stackEl) return;
    Array.prototype.forEach.call(stackEl.querySelectorAll(".st-sub"), function (b) {
      b.setAttribute("aria-current", String(b.getAttribute("data-sub") === id));
    });
  }

  /* Column 2 also shows how far through the active section column 3 is. */
  function progress(info) {
    if (!stackEl) return;
    var secs = info.sections, probe = info.scrollTop + 70;
    var i = 0;
    for (var k = 0; k < secs.length; k++) { if (probe >= secs[k].offset) i = k; else break; }
    if (info.atBottom) i = secs.length - 1;
    var p = Math.min(1, Math.max(0, (probe - secs[i].offset) / Math.max(1, secs[i].height)));
    var active = stackEl.querySelector('.st-sub[data-sub="' + secs[i].id + '"] .st-sub-progress-fill');
    Array.prototype.forEach.call(stackEl.querySelectorAll(".st-sub-progress-fill"), function (f) { f.style.width = "0"; });
    if (active) active.style.width = Math.round(p * 100) + "%";
  }

  /* ------------------------------------------------------ search results */

  function buildResults() {
    var q = store.get().query;
    var wrap = el("div", "st-results");
    var found = window.PMSearch.search(index, q, { limit: 40 });
    if (!found.length) {
      wrap.appendChild(el("div", "st-empty",
        "Nothing matches &ldquo;" + E(q) + "&rdquo;. Every result here shows its whole route, so you can see where a setting lives before you go."));
      return wrap;
    }
    /* Five kinds, five treatments. A setting persists, a manager is a place, an
     * action runs once, a status only reports, and a diagnostic opens evidence —
     * so searching "backup" must not return five identical-looking rows. */
    var KIND_ICON = {
      setting: "sliders", manager: "layers", action: "zap",
      status: "gauge", diagnostic: "fileText", category: "map",
      subcategory: "list", provider: "cpu", model: "star"
    };
    found.forEach(function (rec) {
      var b = el("button", "st-result");
      b.type = "button";
      b.setAttribute("data-kind", rec.kind);
      var route = rec.path.map(function (p, i) {
        return (i ? I("chevronRight", 10) : "") + "<span>" + E(p) + "</span>";
      }).join("");
      var verb = rec.kind === "action" ? "Runs once"
        : rec.kind === "status" ? "Reports only, cannot be set"
        : rec.kind === "diagnostic" ? "Opens evidence"
        : rec.kind === "manager" ? "Opens a manager"
        : rec.kind === "setting" ? "Persists when changed" : "";
      b.innerHTML =
        '<span class="st-result-kind">' + I(KIND_ICON[rec.kind] || "dot", 13) +
          "<span>" + E(window.PMSearch.kindLabel(rec.kind)) + "</span></span>" +
        '<span style="min-width:0"><span class="st-result-title">' + E(rec.title) + "</span>" +
        (rec.value != null ? '<span class="st-result-value">' + E(String(rec.value)) + "</span>" : "") +
        '<span class="st-result-route">' + route + "</span>" +
        (verb ? '<span class="st-result-verb">' + E(verb) + "</span>" : "") + "</span>" +
        '<span class="st-result-right">' +
          ((rec.exposure || "standard") !== "standard"
            ? chip(rec.exposure === "expert" ? "risky" : rec.exposure === "unavailable" ? "unavailable" : "", S.exposureLabel(rec.exposure))
            : "") +
          I("arrowRight", 14) + "</span>";
      b.addEventListener("click", function () { goTo(window.PMSearch.resolveTarget(rec)); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  /* =========================================================== MANAGERS */

  /* Hydration counter. A manager body is only ever built when its manager is
   * actually entered, so opening the workspace leaves this at zero. */
  function hydrated() { window.__pmHydrated = (window.__pmHydrated || 0) + 1; }

  function managerShell(title, purpose) {
    var col = el("div", "st-col");
    var head = el("div", "st-mgr-head");
    head.innerHTML = '<div class="st-mgr-title">' + E(title || "Manager") + "</div>" +
      '<div class="st-mgr-purpose">' + E(purpose || "") + "</div>";
    var tools = el("div", "st-mgr-tools");
    head.appendChild(tools);
    col.appendChild(head);
    var body = el("div", "st-mgr-body");
    col.appendChild(body);
    return { col: col, head: head, tools: tools, body: body };
  }

  function receiptStrip(body) {
    var receipts = el("div", "st-receipts");
    receipts.setAttribute("aria-label", "Simulated results");
    receipts.style.marginTop = "14px";
    body.appendChild(receipts);
    window.PMSim.receipts().slice(0, 3).forEach(function (r) { receipts.appendChild(receiptRow(r)); });
  }

  function buildManagerColumns(managerId) {
    /* The provider manager stays bespoke in every concept: it is the surface the
     * four designs are supposed to disagree about. Everything else assigned to
     * this concept is rendered from one normalised ManagerSpec. */
    if (managerId === "manager-providers") {
      var mgr = D.managers[managerId] || {};
      var parts = managerShell(mgr.title, mgr.purpose);
      providerManager(parts.body, parts.tools);
      hydrated();
      receiptStrip(parts.body);
      return [parts.col];
    }

    /* Every page loads all four domain modules so cross-concept links can
     * resolve titles. That means a builder EXISTS here for managers this
     * concept was not assigned — rendering them in full would quietly undo the
     * split. BUILT_HERE is the gate. */
    if (BUILT_HERE.indexOf(managerId) < 0) {
      if (!K.has(managerId)) {
        return [missingColumn("That link points at something this concept does not contain",
          "No manager with the id " + managerId + " exists in this fixture.")];
      }
      return [elsewhereColumn(managerId)];
    }

    return renderManager(K.spec(managerId, store.get()), { conceptId: CONCEPT_ID, managerId: managerId });
  }

  function missingColumn(headline, detail) {
    var parts = managerShell(headline, detail);
    parts.col.setAttribute("data-missing", "true");
    var home = el("button", "st-btn is-primary", I("arrowRight", 12) + "<span>Go to Settings home</span>");
    home.type = "button";
    home.addEventListener("click", function () { goTo({ categoryId: null }); });
    parts.body.appendChild(home);
    return parts.col;
  }

  function elsewhereColumn(managerId) {
    var mgr = D.managers[managerId] || {};
    var home = K.homeOf(managerId);
    var parts = managerShell(mgr.title, mgr.purpose);
    var card = el("div", "st-card");
    card.innerHTML = '<div class="st-card-title">Built in ' + E(home.title) + "</div>" +
      '<div class="st-card-line">The four concepts split the manager families between them, so each family is shown once at full depth rather than four times at a quarter depth.</div>';
    parts.body.appendChild(card);
    if (home.href) {
      var a = el("a", "st-btn is-primary");
      a.href = home.href;
      a.style.cssText = "margin-top:12px;display:inline-flex;text-decoration:none";
      a.innerHTML = "<span>Open " + E(home.title) + "</span>" + I("arrowUpRight", 12);
      parts.body.appendChild(a);
    }
    return parts.col;
  }

  /* ================================================= MANAGER SPEC RENDERER */

  /* Stack renders a manager the way it renders everything else: as a push. The
   * manager itself is a column of sections, choosing a section pushes its items,
   * and choosing an item pushes its detail. Nothing here knows anything about a
   * specific domain — every assigned manager goes through this one path. */
  function renderManager(spec, ctx) {
    hydrated();
    var s = store.get();
    var cols = [];
    var parts = managerShell(spec.title, spec.purpose);
    cols.push(parts.col);

    if (spec.primary) {
      var pb = el("button", "st-btn is-primary", I("plus", 12) + "<span>" + E(spec.primary.label) + "</span>");
      pb.type = "button";
      pb.addEventListener("click", function () { runAction(ctx, spec.primary, { id: spec.id }); });
      parts.tools.appendChild(pb);
    }
    spec.diagnostics.forEach(function (d) {
      var db = el("button", "st-btn", I(d.kind === "receipt" ? "fileText" : d.kind === "report" ? "list" : "code", 12) +
        "<span>" + E(d.label) + "</span>");
      db.type = "button";
      db.addEventListener("click", function () { runAction(ctx, { id: d.id, label: d.label }, { id: spec.id }); });
      parts.tools.appendChild(db);
    });

    parts.body.appendChild(healthCard(spec));

    if (spec.owner) {
      var own = el("div", "st-card");
      own.innerHTML = '<div class="st-card-title">' + E(spec.owner.name) + " owns this</div>" +
        '<div class="st-card-line">' + E(spec.owner.why) + "</div>" +
        '<div class="st-card-line"><strong>Insertion contract</strong> — ' + E(spec.owner.insertionContract) + "</div>";
      parts.body.appendChild(own);
    }

    var list = el("div", "st-mgr-sections");
    spec.sections.forEach(function (sec) {
      var b = el("button", "st-sub");
      b.type = "button";
      b.setAttribute("data-section", sec.id);
      b.setAttribute("aria-current", String(sec.id === s.managerSectionId));
      var count = sec.kind === "rows" ? sec.settings.length : sec.items.length;
      b.innerHTML = '<span class="st-sub-name">' + E(sec.label) + "</span>" +
        '<span class="st-sub-meta">' + E(sec.kind) + " · " + count + "</span>";
      b.addEventListener("click", function () { openSection(sec.id); });
      list.appendChild(b);
    });
    parts.body.appendChild(list);

    spec.notes.forEach(function (n) {
      parts.body.appendChild(el("div", "st-card-line", I("info", 11) + " " + E(n)));
    });
    receiptStrip(parts.body);

    var section = null;
    spec.sections.forEach(function (sec) { if (sec.id === s.managerSectionId) section = sec; });
    if (!section) return cols;
    cols.push(sectionColumn(section, ctx));

    var item = null;
    section.items.forEach(function (it) { if (it.id === s.managerItemId) item = it; });
    if (item) cols.push(itemColumn(section, item, ctx));
    return cols;
  }

  function healthCard(spec) {
    var h = spec.health;
    var card = el("div", "st-card");
    card.innerHTML = '<div class="st-card-title">' + statusChip(h.status, h.statusWord) + "</div>" +
      '<div class="st-card-line">' + E(h.headline) + "</div>" +
      (h.detail ? '<div class="st-card-line">' + E(h.detail) + "</div>" : "");
    if (h.counts.length) {
      var counts = el("div", "st-counts");
      h.counts.forEach(function (c) {
        counts.appendChild(el("div", "st-count",
          '<span class="st-count-v">' + E(String(c.value)) + '</span><span class="st-count-l">' + E(c.label) + "</span>"));
      });
      card.appendChild(counts);
    }
    return card;
  }

  function sectionColumn(section, ctx) {
    var col = el("div", "st-col");
    var head = el("div", "st-mgr-head");
    head.innerHTML = '<div class="st-mgr-title">' + E(section.label) + "</div>" +
      (section.summary ? '<div class="st-mgr-purpose">' + E(section.summary) + "</div>" : "");
    var tools = el("div", "st-mgr-tools");
    head.appendChild(tools);
    col.appendChild(head);
    section.actions.forEach(function (a) {
      var b = el("button", "st-btn" + (a.kind === "primary" ? " is-primary" : a.kind === "risky" ? " is-risky" : ""),
        "<span>" + E(a.label) + "</span>");
      b.type = "button";
      b.addEventListener("click", function () { runAction(ctx, a, { id: section.id }); });
      tools.appendChild(b);
    });

    var body = el("div", "st-mgr-body");
    col.appendChild(body);

    if (section.kind === "rows") {
      section.settings.forEach(function (sid) {
        var found = S.findSetting(D, sid);
        if (found) body.appendChild(row(found.setting, found.category, found.subcategory));
      });
      if (!section.settings.length) body.appendChild(emptyCard(section));
      return col;
    }
    if (section.kind === "prose") {
      section.items.forEach(function (it) {
        if (it.name) body.appendChild(el("p", "st-prose", E(it.name)));
      });
      return col;
    }
    if (!section.items.length) { body.appendChild(emptyCard(section)); return col; }
    if (section.kind === "table" || section.kind === "matrix") { body.appendChild(specTable(section)); return col; }
    section.items.forEach(function (it) { body.appendChild(itemRow(it)); });
    return col;
  }

  function emptyCard(section) {
    var e2 = K.emptyFor(section);
    var card = el("div", "st-card");
    card.innerHTML = '<div class="st-card-title">' + E(e2.headline) + "</div>" +
      '<div class="st-card-line">' + E(e2.detail) + "</div>";
    return card;
  }

  function specTable(section) {
    var table = el("table", "st-spec-table");
    var thead = el("thead");
    var hr = el("tr");
    hr.appendChild(el("th", null, "Name"));
    section.columns.forEach(function (c) {
      hr.appendChild(el("th", c.align === "end" ? "is-num" : null, E(c.label)));
    });
    hr.appendChild(el("th", null, "State"));
    thead.appendChild(hr);
    table.appendChild(thead);
    var tb = el("tbody");
    section.items.forEach(function (it) {
      var tr = el("tr");
      tr.setAttribute("data-item", it.id);
      var nameCell = el("td");
      var b = el("button", "st-linkish", E(it.name));
      b.type = "button";
      b.addEventListener("click", function () { openItem(it.id); });
      nameCell.appendChild(b);
      if (it.secondary) nameCell.appendChild(el("div", "st-sub-meta", E(it.secondary)));
      tr.appendChild(nameCell);
      section.columns.forEach(function (c) {
        tr.appendChild(el("td", c.align === "end" ? "is-num" : null,
          E(String(it.fields[c.key] == null ? "—" : it.fields[c.key]))));
      });
      tr.appendChild(el("td", null, statusChip(it.status, it.statusWord || "")));
      tb.appendChild(tr);
    });
    table.appendChild(tb);
    return table;
  }

  function itemRow(it) {
    var b = el("button", "st-item");
    b.type = "button";
    b.setAttribute("data-item", it.id);
    b.setAttribute("aria-current", String(it.id === store.get().managerItemId));
    var badges = it.badges.map(function (bd) {
      return '<span class="st-badge" data-kind="' + bd.kind + '" title="' + E(bd.title || "") + '">' + E(bd.text) + "</span>";
    }).join("");
    var routeLine = K.routeLine(it);
    var reason = K.reasonLine(it);
    b.innerHTML =
      '<span class="st-item-main"><span class="st-item-name">' + E(it.name) + "</span>" +
      (it.secondary ? '<span class="st-item-sub">' + E(it.secondary) + "</span>" : "") +
      (badges ? '<span class="st-item-badges">' + badges + "</span>" : "") +
      (routeLine ? '<span class="st-item-route">' + E(routeLine) + "</span>" : "") +
      (reason ? '<span class="st-item-reason">' + E(reason) + "</span>" : "") +
      "</span>" +
      '<span class="st-item-right">' + statusChip(it.status, it.statusWord || "") + I("chevronRight", 12) + "</span>";
    b.addEventListener("click", function () { openItem(it.id); });
    return b;
  }

  function itemColumn(section, item, ctx) {
    var col = el("div", "st-col");
    var head = el("div", "st-mgr-head");
    head.innerHTML = '<div class="st-mgr-title">' + E(item.name) + "</div>" +
      '<div class="st-mgr-purpose">' + E(item.secondary || section.label) + "</div>";
    var tools = el("div", "st-mgr-tools");
    head.appendChild(tools);
    col.appendChild(head);

    item.actions.forEach(function (a) {
      var b = el("button", "st-btn" + (a.kind === "primary" ? " is-primary" : a.kind === "risky" ? " is-risky" : ""),
        "<span>" + E(a.label) + "</span>");
      b.type = "button";
      b.addEventListener("click", function () { runAction(ctx, a, { id: item.id }); });
      tools.appendChild(b);
    });

    var body = el("div", "st-mgr-body");
    col.appendChild(body);

    var top = el("div", "st-card");
    top.innerHTML = '<div class="st-card-title">' + statusChip(item.status, item.statusWord || "") + "</div>";
    var reason = K.reasonLine(item);
    if (reason) top.appendChild(el("div", "st-card-line", E(reason)));
    var routeLine = K.routeLine(item);
    if (routeLine) top.appendChild(el("div", "st-card-line", E(routeLine)));
    if (item.value != null && item.value !== "") {
      top.appendChild(el("div", "st-card-line", "<strong>" + E(String(item.value)) + "</strong>" +
        (item.valueSource ? " · " + E(item.valueSource) : "")));
    }
    body.appendChild(top);

    var keys = Object.keys(item.fields);
    if (keys.length) {
      var fields = el("div", "st-fields");
      keys.forEach(function (k) {
        fields.appendChild(el("div", "st-field",
          '<span class="st-field-k">' + E(k) + '</span><span class="st-field-v">' + E(String(item.fields[k])) + "</span>"));
      });
      body.appendChild(fields);
    }

    item.editable.forEach(function (f) { body.appendChild(editableRow(ctx, item, f)); });

    item.detail.forEach(function (d) {
      var card = el("div", "st-card");
      card.appendChild(el("div", "st-card-title", E(d.label)));
      d.rows.forEach(function (r) {
        card.appendChild(el("div", "st-field",
          '<span class="st-field-k">' + E(r.label) + '</span><span class="st-field-v">' + E(String(r.value)) + "</span>"));
        if (r.hint) card.appendChild(el("div", "st-card-line", E(r.hint)));
      });
      body.appendChild(card);
    });
    return col;
  }

  /* Editing a manager field writes into store.managerEdits, which persists and
   * is fed straight back into the builder on the next spec() call — so a change
   * here really does change what the manager reports. */
  function editableRow(ctx, item, field) {
    var wrap = el("div", "st-edit");
    var id = "edit-" + ctx.managerId + "-" + item.id + "-" + field.key;
    var label = el("label", "st-edit-label", E(field.label));
    label.setAttribute("for", id);
    wrap.appendChild(label);

    var edits = store.get().managerEdits;
    var current = edits[id] !== undefined ? edits[id] : field.value;

    function commit(v) {
      var next = Object.assign({}, store.get().managerEdits);
      next[id] = v;
      store.set({ managerEdits: next });
      announce(field.label + " set to " + v + ".");
      render({});
    }

    if (field.secretKind === "cliOwned") {
      /* A CLI-owned credential never gets a Puppet Master sign-in control. */
      wrap.appendChild(el("div", "st-card-line",
        "This credential belongs to the tool's own login. " + E(String(current))));
      var launch = el("button", "st-btn", "<span>Launch the CLI's own login</span>");
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
      var box = el("div", "st-secret");
      box.appendChild(el("span", "st-field-v", E(shown || "Not set")));
      if (field.secretKind === "pmSecret") {
        var eye = el("button", "st-btn", I(revealed ? "eyeOff" : "eye", 12) + "<span>" + (revealed ? "Hide" : "Reveal") + "</span>");
        eye.type = "button";
        eye.addEventListener("click", function () {
          var r = Object.assign({}, store.get().revealed);
          r[id] = revealed ? false : true;
          store.set({ revealed: r });
          render({});
        });
        box.appendChild(eye);
      }
      wrap.appendChild(box);
      if (field.help) wrap.appendChild(el("div", "st-card-line", E(field.help)));
      return wrap;
    }

    var control;
    if (field.kind === "toggle") {
      control = el("button", "st-toggle");
      control.type = "button";
      control.id = id;
      control.setAttribute("aria-pressed", String(current === true));
      control.textContent = current ? "On" : "Off";
      control.addEventListener("click", function () { commit(!current); });
    } else if (field.kind === "select") {
      control = el("select", "st-select");
      control.id = id;
      (field.options.length ? field.options : [String(current)]).forEach(function (o) {
        var op = document.createElement("option");
        op.value = String(o); op.textContent = String(o);
        control.appendChild(op);
      });
      control.value = String(current);
      control.addEventListener("change", function () { commit(control.value); });
    } else if (field.kind === "chips" || field.kind === "order") {
      control = el("div", "st-chips");
      var listv = Array.isArray(current) ? current.slice() : [];
      listv.forEach(function (c, i) {
        var chipEl = el("span", "st-chip", E(String(c)));
        if (field.kind === "order") {
          var up = el("button", "st-chip-btn", I("chevronUp", 10));
          up.type = "button"; up.title = "Move up";
          up.addEventListener("click", function () {
            if (i === 0) return;
            var n = listv.slice(); var t = n[i - 1]; n[i - 1] = n[i]; n[i] = t; commit(n);
          });
          var down = el("button", "st-chip-btn", I("chevronDown", 10));
          down.type = "button"; down.title = "Move down";
          down.addEventListener("click", function () {
            if (i === listv.length - 1) return;
            var n = listv.slice(); var t = n[i + 1]; n[i + 1] = n[i]; n[i] = t; commit(n);
          });
          chipEl.appendChild(up); chipEl.appendChild(down);
        } else {
          var rm = el("button", "st-chip-btn", I("minus", 10));
          rm.type = "button"; rm.title = "Remove " + c;
          rm.addEventListener("click", function () { var n = listv.slice(); n.splice(i, 1); commit(n); });
          chipEl.appendChild(rm);
        }
        control.appendChild(chipEl);
      });
      if (field.kind === "chips") {
        var add = el("button", "st-chip is-add", I("plus", 10) + " Add");
        add.type = "button";
        add.addEventListener("click", function () {
          var v = window.prompt("Add a value for " + field.label);
          if (v) commit(listv.concat([v]));
        });
        control.appendChild(add);
      }
    } else {
      control = el("input", "st-input");
      control.id = id;
      control.type = field.kind === "number" ? "number" : "text";
      control.value = current == null ? "" : String(current);
      control.addEventListener("change", function () {
        commit(field.kind === "number" ? Number(control.value) : control.value);
      });
    }
    wrap.appendChild(control);
    if (field.help) wrap.appendChild(el("div", "st-card-line", E(field.help)));
    return wrap;
  }

  function maskSecret(v) {
    if (!v) return "";
    if (v.length <= 6) return "\u2022\u2022\u2022\u2022\u2022\u2022";
    return v.slice(0, 3) + "\u2022\u2022\u2022\u2022\u2022\u2022" + v.slice(-3);
  }

  function runAction(ctx, action, payload) {
    K.act(ctx, action, payload).then(function (r) { if (r) showReceipt(r); });
  }

  function openSection(sectionId) {
    store.set({ managerSectionId: sectionId, managerItemId: null });
    writeRoute();
    render({ entering: true });
  }

  function openItem(itemId) {
    store.set({ managerItemId: itemId });
    writeRoute();
    render({ entering: true });
  }

  /* ---------------------------------------------------------- providers */

  function providerManager(body, tools) {
    var refresh = el("button", "st-btn", I("refresh", 12) + "<span>Refresh catalogues</span>");
    refresh.type = "button";
    refresh.addEventListener("click", doRefresh);
    tools.appendChild(refresh);

    var f = el("div", "st-filter");
    f.innerHTML = I("search", 13);
    var fi = el("input");
    fi.type = "search"; fi.placeholder = "Filter"; fi.setAttribute("aria-label", "Filter providers");
    f.appendChild(fi);
    body.appendChild(f);

    var host = el("div");
    body.appendChild(host);

    function paint() {
      host.innerHTML = "";
      if (store.get().catalogueRefreshing) {
        var b = el("div", "st-banner");
        b.innerHTML = '<span class="st-spin">' + I("refresh", 13) + "</span><span>Refreshing. These rows are the last catalogue that activated cleanly.</span>";
        host.appendChild(b);
      }
      var q = fi.value.trim().toLowerCase();
      var groups = {}, order = [];
      D.providers.forEach(function (p) {
        if (q && (p.name + " " + p.summary + " " + p.models.map(function (m) { return m.name; }).join(" ")).toLowerCase().indexOf(q) < 0) return;
        if (!groups[p.group]) { groups[p.group] = []; order.push(p.group); }
        groups[p.group].push(p);
      });
      if (!order.length) { host.appendChild(el("div", "st-empty", "No match.")); return; }
      order.forEach(function (g) {
        host.appendChild(el("div", "st-sec-title", E(g)));
        groups[g].forEach(function (p) { host.appendChild(providerCard(p, paint)); });
      });
    }
    fi.addEventListener("input", paint);
    paint();
    body._repaint = paint;

    /* The installation layer sits BETWEEN a family and its accounts, so it gets
     * its own section rather than being folded into a provider card. Updating
     * an account is not a meaningful operation; Puppet Master updates one
     * installation and revalidates every profile that depended on it. */
    body.appendChild(installationsBlock());
    body.appendChild(catalogueBlock());
    body.appendChild(freeModelsBlock());
  }

  function installationsBlock() {
    var wrap = el("div", "st-inst-block");
    wrap.appendChild(el("div", "st-sec-title", "Installations"));
    wrap.appendChild(el("div", "st-card-line",
      "One row per discovered installation. Puppet Master stays bound to an installation by id, so a change in PATH order never silently moves it."));

    (D.installations || []).forEach(function (inst) {
      var open = store.get().openInstallations[inst.installationId] === true;
      var card = el("div", "st-card");
      card.setAttribute("data-installation", inst.installationId);

      var head = el("button", "st-inst-head");
      head.type = "button";
      head.setAttribute("aria-expanded", String(open));
      head.innerHTML =
        '<span class="st-card-title">' + E(K.familyLabel(inst.providerFamilyId)) +
          statusChip(readinessTone(inst.readinessState), inst.readinessState) + "</span>" +
        '<span class="st-card-line">' + E(inst.hostLabel) + " · " + E(inst.currentVersion) +
          (inst.targetVersion && inst.targetVersion !== inst.currentVersion
            ? " → " + E(inst.targetVersion) : "") + "</span>" +
        '<span class="st-inst-badges">' +
          '<span class="st-badge" data-kind="availability">' + E(inst.duplicateState) + "</span>" +
          '<span class="st-badge" data-kind="evidence">' + E(inst.confidence) + "</span>" +
          '<span class="st-badge" data-kind="source">' + E(inst.installationOwnerKind) + "</span>" +
        "</span>";
      head.addEventListener("click", function () {
        var o = Object.assign({}, store.get().openInstallations);
        o[inst.installationId] = open ? false : true;
        store.set({ openInstallations: o });
        render({});
      });
      card.appendChild(head);

      if (open) card.appendChild(installationDetail(inst));
      wrap.appendChild(card);
    });
    return wrap;
  }

  function readinessTone(state) {
    if (state === "Ready") return "ok";
    if (state === "Rolled back" || state === "Broken — repair required") return "attention";
    if (state === "Managed by your organization") return "managed";
    if (state === "Found — not selected") return "unavailable";
    return "setup";
  }

  function installationDetail(inst) {
    var d = el("div", "st-inst-detail");

    var chain = el("div", "st-card");
    chain.appendChild(el("div", "st-card-title", "Resolution chain"));
    chain.appendChild(kv("Configured command", inst.configuredCommand));
    chain.appendChild(kv("Resolved path", inst.resolvedPath));
    chain.appendChild(kv("Real path", inst.realPath));
    inst.launcherOrShimChain.forEach(function (step, i) { chain.appendChild(kv("Step " + (i + 1), step)); });
    chain.appendChild(kv("Architecture", inst.architecture));
    chain.appendChild(kv("Manager root", inst.managerRootOrProfile));
    d.appendChild(chain);

    var ev = el("div", "st-card");
    ev.appendChild(el("div", "st-card-title", "Ownership evidence, in order"));
    inst.detectionEvidence.forEach(function (e2) {
      ev.appendChild(kv(e2.order + ". " + e2.source, e2.statement));
    });
    ev.appendChild(kv("Confidence", inst.confidence));
    ev.appendChild(kv("Owner", inst.ownerIdentity));
    d.appendChild(ev);

    var dep = el("div", "st-card");
    dep.appendChild(el("div", "st-card-title", "Dependents and policy"));
    dep.appendChild(kv("Dependent profiles", inst.dependentProfileIds.length ? inst.dependentProfileIds.join(", ") : "None"));
    dep.appendChild(kv("Active sessions", inst.activeSessionIds.length ? inst.activeSessionIds.join(", ") : "None"));
    dep.appendChild(kv("Check for updates", inst.updatePolicy.check));
    dep.appendChild(kv("Install updates", inst.updatePolicy.install));
    dep.appendChild(kv("Roll back on failure", inst.updatePolicy.rollback));
    dep.appendChild(kv("Version policy", inst.versionPolicy));
    dep.appendChild(kv("Compatible range", inst.compatibleVersionRange));
    dep.appendChild(kv("Last checked", inst.lastCheckedAt));
    dep.appendChild(kv("Last known good", inst.lastGoodVersion + (inst.lastGoodGenerationRef ? " · " + inst.lastGoodGenerationRef : "")));
    d.appendChild(dep);

    if (inst.manualOnlyReason) {
      var manual = el("div", "st-card");
      manual.appendChild(el("div", "st-card-title", "Manual only"));
      manual.appendChild(el("div", "st-card-line", E(inst.manualOnlyReason)));
      manual.appendChild(el("div", "st-card-line",
        "Follow the vendor's own instructions for this installation. Puppet Master will not guess a package manager."));
      d.appendChild(manual);
    }

    K.attemptsFor(inst.installationId).forEach(function (att) { d.appendChild(attemptCard(att)); });

    var actions = el("div", "st-inst-actions");
    var ctx = { conceptId: CONCEPT_ID, managerId: "manager-providers" };
    function act(id, label, kind) {
      var b = el("button", "st-btn" + (kind === "primary" ? " is-primary" : ""), "<span>" + E(label) + "</span>");
      b.type = "button";
      b.addEventListener("click", function () { runAction(ctx, { id: id, label: label }, { id: inst.installationId }); });
      actions.appendChild(b);
    }
    act("installation.rescan", "Rescan installations", "quiet");
    /* An update action is offered only where ownership and policy actually
     * permit one. An older duplicate PM did not select gets none. */
    if (inst.manualOnlyReason) {
      actions.appendChild(el("div", "st-card-line", "No automatic update is offered for an installation whose owner is unknown."));
    } else if (inst.duplicateState === "Older duplicate" || inst.readinessState === "Found — not selected") {
      act("installation.select", "Select this installation", "primary");
      actions.appendChild(el("div", "st-card-line", "No update is offered: Puppet Master did not select this installation."));
    } else if (inst.readinessState === "Update available") {
      act("installation.update_now", "Update " + inst.currentVersion + " → " + inst.targetVersion, "primary");
      act("installation.schedule_update", "Schedule for when idle", "quiet");
      actions.appendChild(el("div", "st-card-line",
        "Install policy is Ask first, so Update opens the preflight results and the plan. Nothing is written until you confirm."));
    } else if (inst.readinessState === "Update scheduled") {
      act("installation.cancel_update", "Cancel the scheduled update", "quiet");
      actions.appendChild(el("div", "st-card-line",
        "Parked in awaiting_authority_or_idle until " + E(inst.activeSessionIds.join(", ") || "the host is idle") + " finishes."));
    } else if (inst.readinessState === "Rolled back") {
      act("installation.rollback", "Show the rollback receipt", "quiet");
      act("installation.repair", "Retry with repair", "quiet");
    } else {
      act("installation.check_update", "Check for updates", "quiet");
    }
    d.appendChild(actions);
    return d;
  }

  function attemptCard(att) {
    var c = el("div", "st-card");
    c.appendChild(el("div", "st-card-title", "Update attempt · " + E(att.state)));
    c.appendChild(el("div", "st-card-line", E(att.summary)));
    c.appendChild(kv("Requested target", att.requestedTarget));
    c.appendChild(kv("Effective target", att.effectiveTarget));
    c.appendChild(kv("Procedure", att.procedureId));
    c.appendChild(kv("Policy source", att.policySource));
    if (att.failureClass) c.appendChild(kv("Failure class", att.failureClass));
    if (att.rollbackState) c.appendChild(kv("Rollback", att.rollbackState));

    if (att.preflightResults.length) {
      c.appendChild(el("div", "st-card-title", "Preflight"));
      att.preflightResults.forEach(function (r) {
        c.appendChild(kv(r.check, r.result + (r.note ? " — " + r.note : "")));
      });
    }
    if (att.verificationResults.length) {
      c.appendChild(el("div", "st-card-title", "Verification"));
      att.verificationResults.forEach(function (r) {
        c.appendChild(kv(r.stage, r.result + (r.detail ? " — " + r.detail : "")));
      });
      c.appendChild(el("div", "st-card-line",
        "The installer exited zero. Verification is what decides, and the previous version is the one running now."));
    }
    return c;
  }

  function catalogueBlock() {
    var cat = (D.managers["manager-providers"] || {}).catalog || { sources: [] };
    var wrap = el("div", "st-inst-block");
    wrap.appendChild(el("div", "st-sec-title", "Catalogue freshness"));
    if (cat.note) wrap.appendChild(el("div", "st-card-line", E(cat.note)));
    cat.sources.forEach(function (s2) {
      var c = el("div", "st-card");
      c.appendChild(el("div", "st-card-title",
        E(s2.name) + statusChip(s2.validation === "passed" ? "ok" : "attention", "Validation " + s2.validation)));
      c.appendChild(kv("Source version", s2.sourceVersion));
      c.appendChild(kv("Checked", s2.checkedAt));
      c.appendChild(kv("Imported", s2.importedAt));
      c.appendChild(kv("Activated", s2.activatedAt));
      c.appendChild(kv("Last known good", s2.lastKnownGood.version + " · " + s2.lastKnownGood.at));
      if (s2.validationDetail) c.appendChild(el("div", "st-card-line", E(s2.validationDetail)));
      s2.changes.forEach(function (ch) { c.appendChild(kv(ch.kind, ch.text)); });
      wrap.appendChild(c);
    });
    return wrap;
  }

  function freeModelsBlock() {
    var free = null;
    D.providers.forEach(function (p) { if (p.id === "free") free = p; });
    var wrap = el("div", "st-inst-block");
    if (free === null) return wrap;
    wrap.appendChild(el("div", "st-sec-title", "Free and community models"));
    if (free.standingNote) wrap.appendChild(el("div", "st-card-line", E(free.standingNote)));
    free.models.forEach(function (m) {
      var c = el("div", "st-card");
      var tone = m.freeState === "Ready" ? "ok"
        : m.freeState === "Needs setup" ? "setup"
        : m.freeState === "Unverified" ? "setup" : "unavailable";
      c.appendChild(el("div", "st-card-title", E(m.name) + statusChip(tone, m.freeState || "Unknown")));
      c.appendChild(kv("Underlying route", m.underlyingRoute || "Not recorded"));
      if (m.unavailableReason) c.appendChild(el("div", "st-card-line", E(m.unavailableReason)));
      if (m.freeTerms) c.appendChild(kv("Terms", m.freeTerms.join(" · ")));
      wrap.appendChild(c);
    });
    return wrap;
  }

  function kv(k, v) {
    return el("div", "st-field",
      '<span class="st-field-k">' + E(String(k)) + '</span><span class="st-field-v">' + E(String(v)) + "</span>");
  }

  function providerCard(p, repaint) {
    var open = !!store.get().openProviders[p.id];
    var card = el("div", "st-card");

    var top = el("div", "st-card-top");
    var t = el("button", null, '<div class="st-card-title">' + E(p.name) + statusChip(p.status, p.statusWord) + "</div>" +
      '<div class="st-card-line">' + E(p.summary) + "</div>");
    t.type = "button";
    t.style.textAlign = "left";
    t.style.minWidth = "0";
    t.setAttribute("aria-expanded", String(open));
    t.addEventListener("click", function () {
      var o = store.get().openProviders; o[p.id] = !o[p.id]; store.set({ openProviders: o }); repaint();
    });
    top.appendChild(t);
    top.appendChild(el("span", null, I(open ? "chevronDown" : "chevronRight", 14)));
    card.appendChild(top);
    if (!open) return card;

    var active = activeAccount(p);
    var answers = el("div", "st-answers");
    answers.style.marginTop = "12px";
    [["Usable?", p.statusWord], ["Account now", active ? active.nickname : "None"],
     ["Route", active ? active.product : "—"], ["Left", active ? active.usage.includedRemaining : "?"],
     ["Resets", active ? active.usage.resetsIn : "?"], ["Models", String(p.models.length)]].forEach(function (a) {
      var d = el("div");
      d.innerHTML = '<div class="st-a-q">' + E(a[0]) + '</div><div class="st-a-a">' + E(a[1]) + "</div>";
      answers.appendChild(d);
    });
    card.appendChild(answers);

    var usageLink = el("button", "st-btn", "<span>Open Usage</span>" + I("external", 13));
    usageLink.type = "button";
    usageLink.style.marginTop = "8px";
    usageLink.addEventListener("click", function () {
      sim("open-usage-" + p.id, "Open Usage", "Navigation.open('usage')",
        "Settings does not calculate balances. A real build switches to the Usage surface, which owns measurement, history and forecasting.",
        "handoff");
    });
    card.appendChild(usageLink);

    if (p.oauthNote) card.appendChild(el("div", "st-card-line", I("key", 11) + " " + E(p.oauthNote)));
    if (p.groupingNote) card.appendChild(el("div", "st-card-line", I("info", 11) + " " + E(p.groupingNote)));

    if (p.setupSteps) {
      card.appendChild(el("div", "st-sec-title", "Setup"));
      p.setupSteps.forEach(function (s2, i) { card.appendChild(el("div", "st-card-line", (i + 1) + ". " + E(s2.label) + " — not done")); });
      var go = el("button", "st-btn is-primary", "<span>Continue setup</span>");
      go.type = "button"; go.style.marginTop = "8px";
      go.addEventListener("click", function () {
        sim("install-" + p.id, "Install " + p.name + " CLI", "CLIBridge.install('" + p.id + "')",
          "A real build installs the CLI, creates an isolated profile, then launches the CLI's own Google sign-in.", "handoff");
      });
      card.appendChild(go);
    }

    if (p.catalogue) {
      card.appendChild(el("div", "st-sec-title", "Catalogue"));
      var kv = el("dl", "st-kv");
      kv.innerHTML = "<dt>Source</dt><dd>" + E(p.catalogue.name) + "</dd>" +
        "<dt>Checked</dt><dd>" + E(store.get().catalogueRefreshing ? "refreshing now" : p.catalogue.lastChecked) + "</dd>" +
        "<dt>Activated</dt><dd>" + E(p.catalogue.lastActivated) + "</dd>" +
        "<dt>Version</dt><dd>" + E(p.catalogue.sourceVersion) + "</dd>" +
        "<dt>Changes</dt><dd>" + p.catalogue.materialChanges.map(E).join("<br>") + "</dd>";
      card.appendChild(kv);
    }

    if (p.accounts.length) {
      card.appendChild(el("div", "st-sec-title", "Accounts and connections"));
      p.accounts.forEach(function (a) {
        var sub = el("div", "st-card");
        sub.style.background = "var(--pm-surface-2)";
        var health = S.healthMeta(a.health.check);
        sub.innerHTML = '<div class="st-card-title">' + E(a.nickname) + statusChip(health.status, a.statusWord) +
          (active && a.id === active.id ? chip("", "Used next") : "") + "</div>" +
          '<div class="st-card-line">' + E(a.identity) + " · " + E(a.connection) + " · " + E(a.product) + "</div>" +
          '<div class="st-card-line">Catalogue ' + E(a.health.catalogue) + " · generation " + E(a.health.generation) +
          " · allowance " + E(a.usage.includedRemaining) + "</div>" +
          (a.diagnosis ? '<div class="st-card-line" style="color:var(--pm-attention)">' + E(a.diagnosis) + "</div>" : "") +
          (a.setupInstructions ? '<div class="st-card-line"><strong>To connect:</strong> ' + a.setupInstructions.map(E).join(" ") + "</div>" : "");
        var acts = el("div", "st-card-actions");
        if (a.status === "connected") {
          var use = el("button", "st-btn", "<span>Use next</span>");
          use.type = "button";
          use.disabled = !!(active && a.id === active.id);
          use.addEventListener("click", function () {
            var pref = store.get().accountPref; pref[p.id] = a.id; store.set({ accountPref: pref });
            repaint();
            showReceipt({ at: window.PMSim.stamp(), label: "Prefer account " + a.nickname,
              realCall: "ProviderService.setPreferredAccount('" + p.id + "','" + a.id + "')", outcome: "ok",
              detail: "Applies to the next request only. A generation in flight is never migrated." });
          });
          acts.appendChild(use);
        }
        if (a.health.check === "signedOut") {
          var si = el("button", "st-btn is-primary", "<span>Sign in</span>");
          si.type = "button";
          si.addEventListener("click", function () {
            sim("signin-" + a.id, "Sign in · " + a.nickname, "CLIBridge.launchOwnLogin('" + p.id + "','" + a.id + "')",
              "The Claude CLI owns this login; a real build launches it inside the isolated profile and then verifies readiness.", "handoff");
          });
          acts.appendChild(si);
        }
        if (a.setupInstructions) {
          var su = el("button", "st-btn is-primary", "<span>Open the Groq connection</span>");
          su.type = "button";
          su.addEventListener("click", function () {
            sim("setup-" + a.id, "Set up " + a.nickname, "ProviderService.openConnection('groq')",
              "Free Models delegates setup to the underlying provider, then returns you here.", "handoff");
          });
          acts.appendChild(su);
        }
        var probe = el("button", "st-btn is-quiet", "<span>Readiness check</span>");
        probe.type = "button";
        probe.addEventListener("click", function () {
          sim("probe-" + a.id, "Readiness check · " + a.nickname, "ProviderService.safeProbe('" + p.id + "','" + a.id + "')",
            a.health.check === "ok" ? "A minimal generation succeeded: ready, not merely authenticated."
              : "Authentication passed but a minimal generation did not.",
            a.health.check === "ok" ? "ok" : "degraded");
        });
        acts.appendChild(probe);
        sub.appendChild(acts);
        card.appendChild(sub);
      });
    }

    if (p.models.length) {
      card.appendChild(el("div", "st-sec-title", "Models"));
      var s3 = store.get();
      p.models.slice().sort(function (x, y) {
        var fx = s3.favourites[x.id] !== undefined ? s3.favourites[x.id] : x.favourite;
        var fy = s3.favourites[y.id] !== undefined ? s3.favourites[y.id] : y.favourite;
        if (fx !== fy) return fx ? -1 : 1;
        return x.priority - y.priority;
      }).forEach(function (m) {
        if (s3.hidden[m.id] === undefined ? m.hidden : s3.hidden[m.id]) return;
        card.appendChild(modelRow(p, m, repaint));
      });
    }

    if (p.id === "claude") {
      var diff = D.routeDifferences[0];
      card.appendChild(el("div", "st-card-line",
        I("alert", 11) + " <strong>Requested " + E(diff.requested) + ", in force " + E(diff.effective) + ".</strong> " + E(diff.reason)));
    }

    if (active && active.usage.pressure === "exhausted") {
      card.appendChild(el("div", "st-sec-title", "Included usage is gone — what happens next?"));
      var opts = el("div", "st-card-actions");
      (active.nextAction.options || []).forEach(function (o) {
        var b2 = el("button", "st-btn" + (active.nextAction.chosen === o ? " is-primary" : ""), "<span>" + E(o) + "</span>");
        b2.type = "button";
        b2.addEventListener("click", function () { active.nextAction.chosen = o; repaint(); announce("Chosen: " + o); });
        opts.appendChild(b2);
      });
      card.appendChild(opts);
      card.appendChild(el("div", "st-card-line", "Only the continuations this product supports are offered."));
    }

    return card;
  }

  function modelRow(p, m, repaint) {
    var s2 = store.get();
    var isFav = s2.favourites[m.id] !== undefined ? s2.favourites[m.id] : m.favourite;
    var alias = s2.aliases[m.id] !== undefined ? s2.aliases[m.id] : m.alias;
    var r = el("div", "st-model");

    var fav = el("button", "st-model-fav", I("star", 13));
    fav.type = "button";
    fav.setAttribute("aria-pressed", String(isFav));
    fav.setAttribute("aria-label", (isFav ? "Remove " : "Add ") + m.name + " favourite");
    fav.addEventListener("click", function () {
      var f = store.get().favourites; f[m.id] = !isFav; store.set({ favourites: f }); repaint();
    });
    r.appendChild(fav);

    var nm = el("div");
    nm.style.minWidth = "0";
    nm.innerHTML = '<div class="st-model-name">' + E(m.name) +
      (alias ? '<span class="st-model-sub">as “' + E(alias) + "”</span>" : "") +
      (m.available === false ? chip("unavailable", "Unavailable") : "") + "</div>" +
      '<div class="st-model-sub">' + E(m.summary) + " · " + E(m.context) +
      (m.unavailableReason ? " · " + E(m.unavailableReason) : "") +
      (m.freeTerms ? " · " + m.freeTerms.map(E).join(" · ") : "") + "</div>";
    r.appendChild(nm);

    var menu = el("button", "st-model-menu", I("more", 14));
    menu.type = "button";
    menu.setAttribute("aria-label", "Options for " + m.name);
    menu.addEventListener("click", function () {
      openPop(menu, function (pp, close) {
        pp.appendChild(popHead(m.name));
        pp.appendChild(popItem(isFav ? "Remove from favourites" : "Add to favourites", function () { close(); fav.click(); }));
        pp.appendChild(popItem(alias ? "Change the alias" : "Give it an alias", function () {
          close();
          var nx = window.prompt("Show " + m.name + " as:", alias || m.name);
          if (nx == null) return;
          var a2 = store.get().aliases; a2[m.id] = nx.trim() || null; store.set({ aliases: a2 }); repaint();
        }));
        pp.appendChild(popItem("Hide from pickers", function () {
          close();
          var h = store.get().hidden; h[m.id] = true; store.set({ hidden: h }); repaint();
        }));
        pp.appendChild(el("div", "pm-spell-divider"));
        pp.appendChild(popHead("Speed"));
        if (m.modes.fast) ["Normal", "Fast"].forEach(function (x) {
          pp.appendChild(popItem(x, function () { close(); announce(m.name + " set to " + x + "."); }));
        });
        else pp.appendChild(popItem("Fast not supported by this model", null, { disabled: true }));
        pp.appendChild(popHead("Reasoning effort"));
        if (m.modes.effort && m.modes.effort.length) m.modes.effort.forEach(function (l) {
          pp.appendChild(popItem(l, function () { close(); announce(m.name + " effort set to " + l + "."); }));
        });
        else pp.appendChild(popItem("Not offered by this model", null, { disabled: true }));
      });
    });
    r.appendChild(menu);
    return r;
  }

  function activeAccount(p) {
    var pref = store.get().accountPref[p.id];
    if (pref) { var f = p.accounts.filter(function (a) { return a.id === pref; })[0]; if (f) return f; }
    return p.accounts.filter(function (a) { return a.status === "connected"; })[0] || p.accounts[0] || null;
  }

  function doRefresh() {
    if (store.get().catalogueRefreshing) return;
    store.set({ catalogueRefreshing: true });
    var b = document.querySelector(".st-mgr-body");
    if (b && b._repaint) b._repaint();
    window.PMSim.run({
      id: "refresh-catalogues", label: "Refresh model catalogues",
      realCall: "CatalogueService.refresh(['models.dev','free-coding-models'])",
      phases: [{ label: "models.dev" }, { label: "Free Coding Models" }, { label: "Validating" }],
      duration: 1800, outcome: "degraded",
      detail: "models.dev activated with 41 models. Free Coding Models failed validation and was quarantined; its previous catalogue is still in use."
    }).then(function (r) {
      store.set({ catalogueRefreshing: false });
      var h = document.querySelector(".st-mgr-body");
      if (h && h._repaint) h._repaint();
      showReceipt(r);
    });
  }

  /* ------------------------------------------------------------- memory */

  /* ========================================================== NAVIGATION */

  /* ------------------------------------------------------------- routing */

  /* The route is derived from the store, never stored twice. Every navigation
   * pushes; only a correction (restoring a saved route, normalising an alias)
   * replaces, so the back button walks exactly the steps the user took. */
  function currentRoute() {
    var s = store.get();
    var demo = s.demoState === "normal" ? null : s.demoState;
    if (s.managerId) {
      return { kind: "manager", managerId: s.managerId, sectionId: s.managerSectionId,
        itemId: s.managerItemId, demo: demo };
    }
    if (s.query && s.query.trim()) return { kind: "search", query: s.query.trim(), demo: demo };
    if (s.categoryId) {
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

  /* A well-formed route that names something this concept does not contain is a
   * different failure from a malformed one: the router already sent malformed
   * hashes home, so anything that arrives here and does not resolve gets the
   * inline notice rather than a blank column. */
  function routeExists(route) {
    if (route.kind === "manager") return window.PMManagerKit.has(route.managerId);
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
      store.set({ query: "", rootId: null, categoryId: null, managerId: null,
        managerSectionId: null, managerItemId: null, badRoute: window.PMRoute.format(route) });
      render({});
      return;
    }
    store.set({ badRoute: null });

    if (route.kind === "manager") {
      var home = window.PMManagerKit.homeOf(route.managerId);
      store.set({ query: "", rootId: "agents", categoryId: "agents", managerId: route.managerId,
        managerSectionId: route.sectionId, managerItemId: route.itemId });
      render({ entering: true });
      announce("Opened " + ((D.managers[route.managerId] || {}).title || home.title) + ".");
      return;
    }
    if (route.kind === "search") {
      store.set({ query: route.query, managerId: null, managerSectionId: null, managerItemId: null });
      render({});
      return;
    }
    if (route.kind === "category") {
      store.set({ query: "", rootId: route.categoryId, categoryId: route.categoryId,
        managerId: null, managerSectionId: null, managerItemId: null });
      render({ subcategoryId: route.subcategoryId, targetId: route.settingId, entering: true });
      return;
    }
    store.set({ query: "", rootId: null, categoryId: null, managerId: null,
      managerSectionId: null, managerItemId: null });
    render({});
  }

  function goTo(t) {
    closePop();
    if (t.managerId && (t.kind === "manager" || t.kind === "provider" || t.kind === "model")) {
      var cat = t.categoryId || "agents";
      store.set({ query: "", rootId: cat, categoryId: cat, managerId: t.managerId,
        managerSectionId: null, managerItemId: null });
      writeRoute();
      render({});
      announce("Pushed " + ((D.managers[t.managerId] || {}).title || "manager") + ".");
      return;
    }
    if (!t.categoryId) {
      store.set({ query: "", rootId: null, categoryId: null, managerId: null,
        managerSectionId: null, managerItemId: null, badRoute: null });
      writeRoute();
      render({});
      return;
    }
    if (t.targetId) {
      var f = S.findSetting(D, t.targetId);
      if (f) {
        var ex = f.setting.exposure || "standard";
        if ((LEVEL_VISIBLE[store.get().exposure] || []).indexOf(ex) < 0) {
          store.set({ exposure: LEVEL_VISIBLE.advanced.indexOf(ex) >= 0 ? "advanced" : "all" });
        }
      }
    }
    store.set({ query: "", rootId: t.categoryId, categoryId: t.categoryId, managerId: null,
      managerSectionId: null, managerItemId: null, activeSub: t.subcategoryId || null });
    writeRoute();
    render({ subcategoryId: t.subcategoryId, targetId: t.targetId, entering: true });
    announce("Opened " + S.findCategory(D, t.categoryId).title + ".");
  }

  function swap(node) { mainEl.innerHTML = ""; mainEl.appendChild(node); }

  /* =============================================================== MOUNT */

  /* The shell owns the Demo state select and the Reset button now, so the
   * concept passes its state in and reacts, rather than building a second one. */
  shell = window.PMShell.mount({
    rootId: "pm-root",
    concept: "Stack · Settings as a route",
    conceptId: CONCEPT_ID,
    theme: store.get().theme || "basic-dark",
    demoState: store.get().demoState,
    onDemoState: function (id) {
      store.set({ demoState: id, catalogueRefreshing: id === "loading" });
      writeRoute();
      render({});
      announce("Demo state: " + id + ".");
    },
    onReceiptAction: function (r) { showReceipt(r); },
    onLayout: function () { if (spy) spy.measure(); },
    onWidthMode: function () { if (spy) spy.measure(); }
  });
  mainEl = shell.main;

  window.PMStore.persist(CONCEPT_ID, store, window.PMStore.PERSIST_KEYS);

  /* Back and forward are native hashchange events, so the browser's own history
   * is the single source of truth for where the user has been. */
  window.PMRoute.onChange(function (route) { applyRoute(route); });

  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      var i = document.querySelector(".st-search input");
      if (i) { i.focus(); i.select(); }
    }
    if (e.key === "Escape" && !pop) {
      var s = store.get();
      if (s.managerId || s.rootId || s.query) goBack();
    }
  });

  /* The hash wins on load. With no hash, a route saved from a previous session
   * is restored with replace, so it does not become a phantom back step. */
  var initial = window.PMRoute.parse();
  if ((window.location.hash || "") !== "") {
    applyRoute(initial);
  } else if (store.get().route) {
    applyRoute(store.get().route);
    writeRoute(true);
  } else {
    render({});
  }
})();
