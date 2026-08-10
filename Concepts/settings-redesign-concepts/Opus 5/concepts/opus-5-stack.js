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

  var store = window.PMStore.createStore({
    rootId: null,            // "notices" or a category id
    categoryId: null,
    managerId: null,
    query: "",
    exposure: "standard",
    demoState: "normal",
    dismissed: {},
    values: {},
    revealed: {},
    favourites: {},
    hidden: {},
    aliases: {},
    accountPref: {},
    openProviders: { claude: true },
    catalogueRefreshing: false,
    memoryFilter: "",
    memoryTab: "gists",
    mcpId: "mcp-github"
  });

  var shell, spy, mainEl, stackEl, lastDepth = 1;

  var BUILT_HERE = ["manager-providers", "manager-memory", "manager-mcp"];
  var ELSEWHERE = {
    "manager-context": ["Opus 5 — Atlas", "opus-5-atlas.html"],
    "manager-terminal": ["Opus 5 — Atlas", "opus-5-atlas.html"],
    "manager-personas": ["Opus 5 — Console", "opus-5-console.html"],
    "manager-skills": ["Opus 5 — Console", "opus-5-console.html"],
    "manager-crew": ["Opus 5 — Ledger", "opus-5-ledger.html"],
    "manager-media": ["Opus 5 — Ledger", "opus-5-ledger.html"]
  };

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

    if (s.query.trim()) {
      surface.appendChild(buildResults());
      swap(surface);
      lastDepth = 1;
      return;
    }

    stackEl = el("div", "st-stack");
    var depth = s.managerId ? 4 : 3;
    stackEl.setAttribute("data-depth", String(depth));

    var c1 = buildRootColumn();
    stackEl.appendChild(c1);

    var c2 = s.rootId === "notices" ? buildNoticeColumn() : buildSectionColumn();
    stackEl.appendChild(c2);

    var c3 = s.rootId === "notices" ? buildNoticeDetailColumn() : buildDocColumn();
    stackEl.appendChild(c3);

    if (s.managerId) stackEl.appendChild(buildManagerColumn(s.managerId));

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

    var notices = S.noticesFor(D, s.demoState, s.dismissed);
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
    var list = S.noticesFor(D, store.get().demoState, store.get().dismissed);
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
    var d = store.get().dismissed;
    d[notice.id] = true;
    store.set({ dismissed: d });
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
    found.forEach(function (rec) {
      var b = el("button", "st-result");
      b.type = "button";
      var route = rec.path.map(function (p, i) {
        return (i ? I("chevronRight", 10) : "") + "<span>" + E(p) + "</span>";
      }).join("");
      b.innerHTML = '<span style="min-width:0"><span class="st-result-title">' + E(rec.title) + "</span>" +
        '<span class="st-result-route">' + route + "</span></span>" +
        '<span class="st-result-right">' +
          ((rec.exposure || "standard") !== "standard"
            ? chip(rec.exposure === "expert" ? "risky" : rec.exposure === "unavailable" ? "unavailable" : "", S.exposureLabel(rec.exposure))
            : "") +
          (rec.kind === "manager" ? chip("", "Manager") : "") +
          I("arrowRight", 14) + "</span>";
      b.addEventListener("click", function () { goTo(window.PMSearch.resolveTarget(rec)); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  /* =========================================================== MANAGERS */

  function buildManagerColumn(managerId) {
    var mgr = D.managers[managerId] || {};
    var col = el("div", "st-col");

    var head = el("div", "st-mgr-head");
    head.innerHTML = '<div class="st-mgr-title">' + E(mgr.title || "Manager") + "</div>" +
      '<div class="st-mgr-purpose">' + E(mgr.purpose || "") + "</div>";
    var tools = el("div", "st-mgr-tools");
    head.appendChild(tools);
    col.appendChild(head);

    var body = el("div", "st-mgr-body");
    col.appendChild(body);

    if (managerId === "manager-providers") providerManager(body, tools);
    else if (managerId === "manager-memory") memoryManager(body, tools);
    else if (managerId === "manager-mcp") mcpManager(body, tools);
    else elsewhereManager(body, managerId);

    var receipts = el("div", "st-receipts");
    receipts.setAttribute("aria-label", "Simulated results");
    receipts.style.marginTop = "14px";
    body.appendChild(receipts);
    window.PMSim.receipts().slice(0, 3).forEach(function (r) { receipts.appendChild(receiptRow(r)); });

    return col;
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

  function memoryManager(body, tools) {
    var mgr = D.managers["manager-memory"];

    var rebuild = el("button", "st-btn", I("refresh", 12) + "<span>Rebuild index</span>");
    rebuild.type = "button";
    rebuild.addEventListener("click", function () {
      sim("mem-rebuild", "Rebuild the memory index", "MemoryService.rebuildIndex()",
        "Would re-derive recall scores for 142 notes and merge 4 near-duplicates.", "ok",
        [{ label: "Reading notes" }, { label: "Deduplicating" }]);
    });
    tools.appendChild(rebuild);

    var tabs = el("div", "st-tabs");
    [["gists", "Assistant notes"], ["stores", "Other stores"]].forEach(function (t) {
      var b = el("button", "st-tab", t[1]);
      b.type = "button";
      b.setAttribute("aria-pressed", String(store.get().memoryTab === t[0]));
      b.addEventListener("click", function () { store.set({ memoryTab: t[0] }); paint(); });
      tabs.appendChild(b);
    });
    body.appendChild(tabs);

    var f = el("div", "st-filter");
    f.innerHTML = I("search", 13);
    var fi = el("input");
    fi.type = "search"; fi.placeholder = "Search notes"; fi.setAttribute("aria-label", "Search memory notes");
    f.appendChild(fi);
    body.appendChild(f);

    var host = el("div");
    body.appendChild(host);

    function paint() {
      Array.prototype.forEach.call(tabs.children, function (b) {
        b.setAttribute("aria-pressed", String((b.textContent === "Assistant notes" ? "gists" : "stores") === store.get().memoryTab));
      });
      f.style.display = store.get().memoryTab === "gists" ? "" : "none";
      host.innerHTML = "";

      if (store.get().memoryTab === "stores") {
        host.appendChild(el("div", "st-card-line", E(mgr.separationNote)));
        mgr.otherStores.forEach(function (s2) {
          var c = el("div", "st-card");
          c.innerHTML = '<div class="st-card-title">' + E(s2.name) + "</div>" +
            '<div class="st-card-line">' + E(s2.count) + " · " + E(s2.note) + "</div>";
          host.appendChild(c);
        });
        return;
      }

      var q = fi.value.trim().toLowerCase();
      var shown = mgr.notes.filter(function (n) {
        return !q || (n.text + " " + n.scope + " " + n.kind).toLowerCase().indexOf(q) >= 0;
      });
      if (!shown.length) { host.appendChild(el("div", "st-empty", "No note matches.")); return; }

      shown.forEach(function (n) {
        var c = el("div", "st-card");
        var faded = n.recall < 0.35;
        c.innerHTML = '<div class="st-card-title">' + (n.pinned ? I("pin", 12) : "") + E(n.text) +
          (n.state === "awaitingReview" ? chip("setup", "Awaiting review") : chip("", "Verified")) + "</div>" +
          '<div class="st-card-line">' + E(n.kind) + " · " + E(n.scope) + " · " + n.versions + " version" + (n.versions > 1 ? "s" : "") + "</div>" +
          '<div class="st-card-line">Evidence: ' + E(n.evidence) + "</div>" +
          '<div class="st-card-line">Last used ' + E(n.accessed) + " · half-life " + E(n.halfLife) + "</div>" +
          (n.reviewNote ? '<div class="st-card-line" style="color:var(--pm-setup)">' + E(n.reviewNote) + "</div>" : "") +
          (n.fadeNote ? '<div class="st-card-line" style="color:var(--pm-text-3)">' + E(n.fadeNote) + "</div>" : "");

        var rec = el("div", "st-recall");
        rec.innerHTML = '<span class="st-recall-n">Recall</span>' +
          '<span class="st-recall-track"><span class="st-recall-fill" data-faded="' + faded + '" style="width:' +
          Math.round(n.recall * 100) + '%"></span></span>' +
          '<span class="st-recall-n">' + Math.round(n.recall * 100) + "%</span>";
        c.appendChild(rec);

        var acts = el("div", "st-card-actions");
        [["Inspect evidence", "MemoryService.openEvidence('" + n.id + "')", "Opens " + n.evidence + ".", "handoff"],
         [n.pinned ? "Unpin" : "Pin", "MemoryService.setPinned('" + n.id + "', " + !n.pinned + ")",
           n.pinned ? "Unpinned. It will fade normally again." : "Pinned. It stays in active recall regardless of half-life.", "ok"],
         [n.state === "awaitingReview" ? "Verify" : "Re-verify", "MemoryService.verify('" + n.id + "')",
           "Would re-check the note against its evidence and record who confirmed it.", "ok"],
         ["History", "MemoryService.versions('" + n.id + "')", n.versions + " stored version" + (n.versions > 1 ? "s" : "") + " with restore.", "handoff"],
         ["Discard", "MemoryService.discard('" + n.id + "')", "Refused in a concept: discarding removes the note and its provenance permanently.", "unavailable"]
        ].forEach(function (a) {
          var b = el("button", "st-btn" + (a[0] === "Discard" ? " is-quiet" : ""), "<span>" + E(a[0]) + "</span>");
          b.type = "button";
          b.addEventListener("click", function () { sim("mem-" + n.id + "-" + a[0], a[0] + " · note", a[1], a[2], a[3]); });
          acts.appendChild(b);
        });
        c.appendChild(acts);
        host.appendChild(c);
      });

      var note = el("div", "st-card-line");
      note.style.marginTop = "12px";
      note.innerHTML = I("info", 11) + " Half-life means <strong>fades from active recall</strong>. A faded note is still stored and still true; it simply stops being offered automatically.";
      host.appendChild(note);
    }

    fi.addEventListener("input", paint);
    paint();
  }

  /* ---------------------------------------------------------------- MCP */

  function mcpManager(body, tools) {
    var mgr = D.managers["manager-mcp"];

    var add = el("button", "st-btn is-primary", I("plus", 12) + "<span>Add a server</span>");
    add.type = "button";
    add.addEventListener("click", function () {
      sim("mcp-add", "Add an MCP server", "MCPService.beginAdd()",
        "A real build opens the add-server flow for stdio or HTTP transport.", "handoff");
    });
    tools.appendChild(add);

    mgr.servers.forEach(function (sv) {
      var c = el("div", "st-card");
      var status = sv.state === "connected" ? ["ok", "Connected"] :
        sv.state === "disconnected" ? ["attention", "Disconnected"] :
        sv.state === "degraded" ? ["setup", "Degraded"] : ["managed", "Managed"];
      c.innerHTML = '<div class="st-card-title">' + E(sv.name) + statusChip(status[0], status[1]) + "</div>";
      var kv = el("dl", "st-kv");
      kv.innerHTML =
        "<dt>Transport</dt><dd>" + E(sv.transport) + "</dd>" +
        "<dt>Protocol</dt><dd>requested " + E(sv.protocolRequested) +
          " · negotiated " + (sv.protocolNegotiated ? E(sv.protocolNegotiated) : "none") + "</dd>" +
        "<dt>Authentication</dt><dd>" + E(sv.auth) + "</dd>" +
        "<dt>Scope</dt><dd>" + E(sv.scope) + "</dd>" +
        "<dt>Health</dt><dd>" + E(sv.health) + "</dd>" +
        "<dt>Discovered</dt><dd>" + sv.tools + " tools · " + sv.resources + " resources</dd>" +
        "<dt>Exposed last turn</dt><dd>" + sv.exposed + " of " + sv.tools + " — progressive disclosure</dd>" +
        "<dt>Approval</dt><dd>" + E(sv.approval) + "</dd>";
      c.appendChild(kv);
      if (sv.lastError) c.appendChild(el("div", "st-card-line", '<span style="color:var(--pm-attention)">' + I("alert", 11) + " " + E(sv.lastError) + "</span>"));
      if (sv.note) c.appendChild(el("div", "st-card-line", I("info", 11) + " " + E(sv.note)));
      if (sv.managedReason) c.appendChild(el("div", "st-card-line", I("lock", 11) + " " + E(sv.managedReason)));

      var acts = el("div", "st-card-actions");
      var rec = el("button", "st-btn" + (sv.state === "disconnected" ? " is-primary" : ""), "<span>Reconnect</span>");
      rec.type = "button";
      rec.addEventListener("click", function () {
        sim("mcp-rec-" + sv.id, "Reconnect " + sv.name, "MCPService.reconnect('" + sv.id + "')",
          sv.state === "disconnected"
            ? "Still refused: " + (sv.lastError || "the server did not answer.")
            : "Reconnected and re-negotiated protocol " + (sv.protocolNegotiated || "") + ".",
          sv.state === "disconnected" ? "error" : "ok",
          [{ label: "Starting transport" }, { label: "Negotiating protocol" }]);
      });
      acts.appendChild(rec);
      var logs = el("button", "st-btn is-quiet", "<span>Logs</span>");
      logs.type = "button";
      logs.addEventListener("click", function () {
        sim("mcp-log-" + sv.id, "Open logs · " + sv.name, "LogService.open('mcp/" + sv.id + "')",
          "A real build opens the server log view.", "unavailable");
      });
      acts.appendChild(logs);
      var appr = el("button", "st-btn is-quiet", "<span>Approval policy</span>");
      appr.type = "button";
      appr.addEventListener("click", function () {
        openPop(appr, function (pp, close) {
          pp.appendChild(popHead("Approval for " + sv.name));
          ["Every call", "Once per session", "Persistent per tool"].forEach(function (o) {
            pp.appendChild(popItem(o, function () {
              close(); sv.approval = o;
              sim("mcp-appr-" + sv.id, "Approval policy · " + sv.name,
                "MCPService.setApproval('" + sv.id + "','" + o + "')",
                "Approval scope is now " + o.toLowerCase() + ". Settings stays a policy surface, not an approval log.", "ok");
            }, { strong: sv.approval === o }));
          });
        });
      });
      acts.appendChild(appr);
      c.appendChild(acts);
      body.appendChild(c);
    });
  }

  function elsewhereManager(body, managerId) {
    var mgr = D.managers[managerId] || {};
    var where = ELSEWHERE[managerId];
    var c = el("div", "st-card");
    c.innerHTML = '<div class="st-card-title">' + E(mgr.title || "Manager") + "</div>" +
      '<div class="st-card-line">' + E(mgr.purpose || "") + "</div>" +
      '<div class="st-card-line">Each Opus 5 concept builds the provider manager plus two others in full, so the four together cover eight dedicated managers.</div>';
    body.appendChild(c);
    if (managerId === "manager-usage") {
      c.innerHTML += '<div class="st-card-line">' + E(D.usage.note) + "</div>";
      D.usage.snapshots.forEach(function (s2) {
        body.appendChild(el("div", "st-card",
          '<div class="st-card-title">' + E(s2.providerId) + " · " + E(s2.account) + "</div>" +
          '<div class="st-card-line">Remaining ' + E(s2.includedRemaining) + " · resets " + E(s2.resets) +
          " · " + E(s2.freshness) + "</div>"));
      });
      return;
    }
    if (where) {
      var a = el("a", "st-btn is-primary");
      a.href = where[1];
      a.style.cssText = "margin-top:12px;display:inline-flex;text-decoration:none";
      a.innerHTML = "<span>Open " + E(where[0]) + "</span>" + I("arrowUpRight", 12);
      body.appendChild(a);
    }
  }

  /* ========================================================== NAVIGATION */

  function goTo(t) {
    closePop();
    if (t.managerId && (t.kind === "manager" || t.kind === "provider" || t.kind === "model")) {
      var cat = t.categoryId || "agents";
      store.set({ query: "", rootId: cat, categoryId: cat, managerId: t.managerId });
      render({});
      announce("Pushed " + ((D.managers[t.managerId] || {}).title || "manager") + ".");
      return;
    }
    if (!t.categoryId) { store.set({ query: "", rootId: null, categoryId: null, managerId: null }); render({}); return; }
    if (t.targetId) {
      var f = S.findSetting(D, t.targetId);
      if (f) {
        var ex = f.setting.exposure || "standard";
        if ((LEVEL_VISIBLE[store.get().exposure] || []).indexOf(ex) < 0) {
          store.set({ exposure: LEVEL_VISIBLE.advanced.indexOf(ex) >= 0 ? "advanced" : "all" });
        }
      }
    }
    store.set({ query: "", rootId: t.categoryId, categoryId: t.categoryId, managerId: null });
    render({ subcategoryId: t.subcategoryId, targetId: t.targetId, entering: true });
    announce("Opened " + S.findCategory(D, t.categoryId).title + ".");
  }

  function swap(node) { mainEl.innerHTML = ""; mainEl.appendChild(node); }

  /* =============================================================== MOUNT */

  var demo = document.createElement("select");
  demo.setAttribute("aria-label", "Demo state");
  D.demoStates.forEach(function (d) {
    var o = document.createElement("option");
    o.value = d.id; o.textContent = d.label;
    demo.appendChild(o);
  });
  var wrap = document.createElement("span");
  wrap.style.cssText = "display:inline-flex;align-items:center;gap:6px";
  var lbl = document.createElement("span");
  lbl.className = "pm-review-label"; lbl.textContent = "Demo state";
  wrap.appendChild(lbl); wrap.appendChild(demo);

  shell = window.PMShell.mount({
    rootId: "pm-root",
    concept: "Stack · Settings as a route",
    conceptId: "stack",
    theme: "basic-dark",
    extraControls: wrap,
    onLayout: function () { if (spy) spy.measure(); },
    onWidthMode: function () { if (spy) spy.measure(); }
  });
  mainEl = shell.main;

  demo.addEventListener("change", function () {
    store.set({ demoState: demo.value, catalogueRefreshing: demo.value === "loading" });
    render({});
    announce("Demo state: " + demo.options[demo.selectedIndex].text);
  });

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

  render({});
})();
